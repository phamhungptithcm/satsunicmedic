import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Res,
  Inject,
  Injectable,
  UseGuards,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import type { User } from "./domain.js";
import type { Request, Response } from "express";
import { z } from "zod";
import { CONFIG, type Config } from "./config.js";
import { randomUUID } from "node:crypto";
import { keyId, Database } from "./database.js";
import { fail } from "./errors.js";
import { CsrfGuard, digest, issueCsrf } from "./security.js";
export type AuthRequest = Request & { user: User };
@Injectable()
export class Identity {
  private authInstance?: Auth;
  constructor(
    @Inject(Database) readonly db: Database,
    @Inject(CONFIG) readonly config: Config,
  ) {}
  get auth() {
    if (!this.authInstance) {
      const app =
        getApps().find(app => app.name === `hs-${this.config.FIREBASE_PROJECT_ID}`) ??
        initializeApp({
          projectId: this.config.FIREBASE_PROJECT_ID,
          ...(this.config.FIREBASE_AUTH_EMULATOR_HOST
            ? {}
            : { credential: applicationDefault() }),
        }, `hs-${this.config.FIREBASE_PROJECT_ID}`);
      this.authInstance = getAuth(app);
    }
    return this.authInstance;
  }
  get cookieName() {
    return this.config.NODE_ENV === "production"
      ? "__Host-hs_session"
      : "hs_session";
  }
  get cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
  }
  async current(req: Request): Promise<User> {
    const cookie: unknown = req.cookies?.[this.cookieName];
    if (typeof cookie !== "string" || cookie.length > 8192)
      fail(401, "SESSION_REQUIRED");
    const token = await this.auth
      .verifySessionCookie(cookie, true)
      .catch(error => authFailure(error, "SESSION_EXPIRED"));
    const now = new Date();
    return this.db.transaction(async tx => {
      const session = await this.db.get('sessions', digest(cookie), tx);
      const user = session ? await this.db.get('users', session.userId, tx) : null;
      if (!session || !user || session.revokedAt || session.expiresAt <= now ||
        now.getTime() - session.lastSeenAt.getTime() > 1800000 || user.disabledAt ||
        user.firebaseUid !== token.uid || session.generation !== user.sessionGeneration)
        fail(401, 'SESSION_EXPIRED');
      await this.db.put('sessions', {...session, lastSeenAt:now}, tx);
      return user;
    });
  }
  async recent(token: string) {
    const decoded = await this.auth
      .verifyIdToken(token, true)
      .catch(error => authFailure(error, "REAUTH_REQUIRED"));
    if (
      Date.now() / 1000 - decoded.auth_time > 300 ||
      decoded.auth_time > Date.now() / 1000 + 30
    )
      fail(401, "REAUTH_REQUIRED");
    return decoded;
  }
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(Identity) private identity: Identity) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    req.user = await this.identity.current(req);
    return true;
  }
}
@Controller("auth")
export class AuthController {
  constructor(@Inject(Identity) private readonly identity: Identity) {}
  @Get("csrf") csrf(@Res({ passthrough: true }) res: Response) {
    return issueCsrf(res, this.identity.config.NODE_ENV === "production");
  }
  @Post("session")
  @UseGuards(CsrfGuard)
  async session(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { idToken } = z
      .object({ idToken: z.string().min(1).max(8192) })
      .strict()
      .parse(body);
    const token=await this.identity.recent(idToken);
    // Production accepts Google identity only; loopback emulator fixtures retain password accounts.
    if (this.identity.config.NODE_ENV === "production" && token.firebase?.sign_in_provider !== "google.com")
      fail(403, "GOOGLE_SIGN_IN_REQUIRED");
    const db=this.identity.db;
    const baselineLink=await db.get('unique',keyId('uid',token.uid));
    const baseline=baselineLink?await db.get('users',baselineLink.targetId):null;
    const cookie = await this.identity.auth.createSessionCookie(idToken, { expiresIn: 8 * 3600000 });
    await db.transaction(async tx => {
      const uniqueId=keyId('uid', token.uid);
      const link=await db.get('unique', uniqueId, tx);
      const existing=link ? await db.get('users', link.targetId, tx) : null;
      const previousSession=await db.get('sessions',digest(cookie),tx);
      if(link && !existing) fail(503,'IDENTITY_UNAVAILABLE');
      if((existing?.id??null)!==(baseline?.id??null)||(existing?.sessionGeneration??0)!==(baseline?.sessionGeneration??0)) fail(401,'REAUTH_REQUIRED');
      const user:User=existing ?? {id:randomUUID(),firebaseUid:token.uid,roles:['USER'],disabledAt:null,createdAt:new Date(),sessionGeneration:0,sessionsRevokedAt:null};
      if(user.disabledAt) fail(403,'ACCOUNT_UNAVAILABLE');
      if(previousSession && (previousSession.revokedAt || previousSession.userId!==user.id || previousSession.generation!==user.sessionGeneration || previousSession.expiresAt<=new Date())) fail(401,'REAUTH_REQUIRED');
      if(user.sessionsRevokedAt && token.auth_time*1000<=user.sessionsRevokedAt.getTime()) fail(401,'REAUTH_REQUIRED');
      await db.put('users',user,tx);
      await db.put('unique',{id:uniqueId,targetId:user.id},tx);
      await db.put('sessions',{id:digest(cookie),tokenHash:digest(cookie),userId:user.id,expiresAt:new Date(Date.now()+8*3600000),lastSeenAt:new Date(),revokedAt:null,generation:user.sessionGeneration},tx);
    });
    res.cookie(this.identity.cookieName, cookie, {
      ...this.identity.cookieOptions,
      maxAge: 8 * 3600000,
    });
    return { authenticated: true };
  }
  @Delete("session")
  @UseGuards(CsrfGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie: unknown = req.cookies?.[this.identity.cookieName];
    if (typeof cookie === "string")
      await this.identity.db.transaction(async tx => {
        const session=await this.identity.db.get('sessions',digest(cookie),tx);
        if(session) await this.identity.db.put('sessions',{...session,revokedAt:new Date()},tx);
      });
    res.clearCookie(this.identity.cookieName, this.identity.cookieOptions);
    return { authenticated: false };
  }
  @Post("revoke-all")
  @UseGuards(SessionGuard, CsrfGuard)
  async revokeAll(@Req() req: AuthRequest, @Body() body: unknown) {
    const input = z
      .object({ idToken: z.string().max(8192) })
      .strict()
      .parse(body);
    const token = await this.identity.recent(input.idToken);
    if (token.uid !== req.user.firebaseUid) fail(403, "IDENTITY_MISMATCH");
    await this.identity.db.transaction(async tx => {
      const user=await this.identity.db.get('users',req.user.id,tx);
      if(!user) fail(401,'SESSION_EXPIRED');
      await this.identity.db.put('users',{...user,sessionGeneration:user.sessionGeneration+1,sessionsRevokedAt:new Date()},tx);
    });
    await this.identity.auth.revokeRefreshTokens(token.uid);
    return { revoked: true };
  }
}

export function authFailure(error:unknown, code:string):never {
 const authCode=error&&typeof error==='object'&&'code'in error?String(error.code):'';
 if(['auth/argument-error','auth/invalid-id-token','auth/id-token-expired','auth/id-token-revoked','auth/session-cookie-expired','auth/session-cookie-revoked','auth/invalid-session-cookie','auth/user-disabled','auth/user-not-found'].includes(authCode))fail(401,code);
 fail(503,'IDENTITY_UNAVAILABLE');
}
