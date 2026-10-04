import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from '@nestjs/common';
import { accountUpdateSchema, type AccountView } from '@hs/contracts';
import { Database } from './database.js';
import { Identity, SessionGuard, type AuthRequest } from './identity.js';
import { CsrfGuard, digest } from './security.js';
import { fail } from './errors.js';

@Controller('api/v1/me/account')
@UseGuards(SessionGuard)
export class AccountController {
  constructor(@Inject(Database) private readonly db: Database, @Inject(Identity) private readonly identity: Identity) {}

  @Get()
  async get(@Req() req: AuthRequest): Promise<AccountView> {
    const [profile, sessions] = await Promise.all([
      this.identity.auth.getUser(req.user.firebaseUid),
      this.db.list('sessions', this.db.collection('sessions').where('userId', '==', req.user.id), 101),
    ]);
    const currentHash = digest(String(req.cookies[this.identity.cookieName]));
    const now = Date.now();
    const settings = req.user.accountSettings;
    return {
      id: req.user.id,
      displayName: settings?.displayName ?? profile.displayName ?? '',
      email: profile.email ?? null,
      googleLinked: profile.providerData.some(provider => provider.providerId === 'google.com'),
      studyRole: settings?.studyRole ?? 'unspecified',
      timezone: settings?.timezone ?? 'Asia/Ho_Chi_Minh',
      reducedMotion: settings?.reducedMotion ?? false,
      revision: req.user.accountRevision ?? 0,
      sessions: sessions.slice(0, 100).filter(s => !s.revokedAt && s.expiresAt.getTime() > now &&
        now - s.lastSeenAt.getTime() <= 1800000 && s.generation === req.user.sessionGeneration)
        .map(s => ({ current: s.id === currentHash, lastSeenAt: s.lastSeenAt.toISOString(), expiresAt: s.expiresAt.toISOString() }))
        .sort((a, b) => Number(b.current) - Number(a.current) || b.lastSeenAt.localeCompare(a.lastSeenAt)),
      sessionsTruncated: sessions.length > 100,
      capabilities: { billing: false, export: true, deletion: false, notifications: false },
    };
  }

  @Patch()
  @UseGuards(CsrfGuard)
  async update(@Req() req: AuthRequest, @Body() body: unknown) {
    const { revision, ...settings } = accountUpdateSchema.parse(body);
    return this.db.transaction(async tx => {
      const user = await this.db.get('users', req.user.id, tx);
      if (!user || user.disabledAt || user.sessionGeneration !== req.user.sessionGeneration) fail(401, 'SESSION_EXPIRED');
      if ((user.accountRevision ?? 0) !== revision) fail(409, 'REVISION_CONFLICT');
      await this.db.put('users', { ...user, accountSettings: settings, accountRevision: revision + 1 }, tx);
      return { ...settings, revision: revision + 1 };
    });
  }
}
