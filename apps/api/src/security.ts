import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import {
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { CONFIG, type Config } from "./config.js";
import { fail } from "./errors.js";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function checkOrigin(req: Request, origin: string) {
  if (req.get("origin") !== origin) fail(403, "ORIGIN_REJECTED");
}
export function checkCsrf(req: Request, origin: string) {
  checkOrigin(req, origin);
  const cookie: unknown = req.cookies?.hs_csrf;
  const header = req.get("x-csrf-token");
  if (
    typeof cookie !== "string" ||
    !header ||
    !/^[a-f0-9]{64}$/.test(cookie) ||
    !/^[a-f0-9]{64}$/.test(header) ||
    !timingSafeEqual(Buffer.from(cookie), Buffer.from(header))
  )
    fail(403, "CSRF_REJECTED");
}
export function issueCsrf(res: Response, secure: boolean) {
  const token = randomBytes(32).toString("hex");
  res.cookie("hs_csrf", token, {
    secure,
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: 3600000,
  });
  return { token };
}
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(@Inject(CONFIG) private readonly config: Config) {}
  canActivate(ctx: ExecutionContext) {
    checkCsrf(ctx.switchToHttp().getRequest<Request>(), this.config.APP_ORIGIN);
    return true;
  }
}
export function trafficLimit() {
  const buckets = new Map<string, { count: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    if (buckets.size > 10000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
      if (buckets.size > 10000) {
        res.status(503).json({ error: { code: "CAPACITY_LIMIT" } });
        return;
      }
    }
    const b = buckets.get(key);
    if (!b || b.reset <= now)
      buckets.set(key, { count: 1, reset: now + 60000 });
    else if (++b.count > 120) {
      res.setHeader("Retry-After", Math.ceil((b.reset - now) / 1000));
      res.status(429).json({ error: { code: "RATE_LIMITED" } });
      return;
    }
    next();
  };
}
