import { Body, Controller, Get, Headers, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Transaction } from 'firebase-admin/firestore';
import { z } from 'zod';
import { Database, keyId } from './database.js';
import { SessionGuard, type AuthRequest } from './identity.js';
import { CsrfGuard, digest } from './security.js';
import { fail } from './errors.js';
import { expectedRevision } from './editor.js';
import { requireRole } from './publication.js';
import { CONFIG, type Config } from './config.js';
import { assertCommunityDecision, assertCommunityReviewer, assertContributionSubmission, CommunityPolicyError, contributionDraftSchema, contributionHash, type ContributionDraft, type ContributionSnapshot, type CommunityAssignment, type CommunityDecision, type CommunityVerification } from './community-policy.js';

export interface ContributionRecord extends ContributionSnapshot { createdAt: Date; updatedAt: Date }
export interface ContributionRevision { id: string; contributionId: string; ownerId: string; draft: ContributionDraft; contentHash: string; createdAt: Date }
export interface ContributionConsent { id: string; revisionId: string; userId: string; contentHash: string; accepted: boolean }
export interface AssignmentRecord extends CommunityAssignment { id: string; contributionId: string; assignedBy: string }
export interface DecisionRecord extends CommunityDecision { id: string; reason: string; createdAt: Date }
export interface VerificationRecord extends CommunityVerification { id: string }

function policy(work: () => void) {
  try { work(); } catch (error) {
    if (error instanceof CommunityPolicyError) fail(409, error.code);
    throw error;
  }
}
function snapshotHash(ownerId: string, draft: ContributionDraft) {
  try { return contributionHash(ownerId, draft); }
  catch (error) { if (error instanceof CommunityPolicyError) fail(400, error.code); throw error; }
}
function view(row: ContributionRecord) {
  return { id: row.id, revisionId: row.revisionId, version: row.version, state: row.state, draft: row.draft, contentHash: row.contentHash, updatedAt: row.updatedAt.toISOString() };
}
/** Private intake: no path here can grant a global role or publish an article. */
@Controller('api/v1') @UseGuards(SessionGuard)
export class ContributionsController {
  constructor(@Inject(Database) private readonly db: Database, @Inject(CONFIG) private readonly config: Config) {}
  private enabled() { if (this.config.COMMUNITY_INTAKE_ENABLED !== 'true') fail(503, 'COMMUNITY_INTAKE_DISABLED'); }
  private async owned(id: string, actorId: string, tx?: Transaction) {
    const row = await this.db.get('contributions', z.uuid().parse(id), tx);
    if (!row || row.ownerId !== actorId) fail(404, 'NOT_FOUND');
    return row;
  }
  private async consent(row: ContributionRecord, tx: Transaction) {
    const accepted = new Set<string>();
    for (const id of row.draft.coauthorIds) {
      const record = await this.db.get('contributionConsents', keyId(row.revisionId, id), tx);
      if (record?.accepted && record.contentHash === row.contentHash && record.userId === id && record.revisionId === row.revisionId) accepted.add(id);
    }
    return accepted;
  }
  private personal(draft: ContributionDraft) {
    // Org authorization is not wired yet. Never silently treat it as personal scope.
    if (draft.organizationId) fail(422, 'ORGANIZATION_WORKSPACE_UNAVAILABLE');
  }
  @Get('me/contributions') async list(@Req() req: AuthRequest, @Query() input: unknown) {
    const queryInput = z.object({ cursor: z.uuid().optional(), limit: z.coerce.number().int().min(1).max(50).default(20) }).strict().parse(input);
    let query = this.db.collection('contributions').where('ownerId', '==', req.user.id).orderBy('__name__');
    if (queryInput.cursor) {
      await this.owned(queryInput.cursor, req.user.id);
      query = query.startAfter(queryInput.cursor);
    }
    const rows = await this.db.list('contributions', query, queryInput.limit + 1);
    return { items: rows.slice(0, queryInput.limit).map(view), nextCursor: rows.length > queryInput.limit ? rows[queryInput.limit - 1]!.id : null, intakeEnabled: this.config.COMMUNITY_INTAKE_ENABLED === 'true', publicationEnabled: false };
  }
  @Post('contributions') @UseGuards(CsrfGuard) async create(@Req() req: AuthRequest, @Body() body: unknown, @Headers('idempotency-key') key: string | undefined) {
    this.enabled();
    const draft = contributionDraftSchema.parse(body); this.personal(draft);
    const token = z.uuid().parse(key), fingerprint = digest(JSON.stringify(draft));
    const contentHash = snapshotHash(req.user.id, draft);
    return this.db.transaction(async tx => {
      const receiptId = keyId('contribution.create', req.user.id, token);
      const receipt = await this.db.get('idempotency', receiptId, tx);
      if (receipt) { if (receipt.fingerprint !== fingerprint) fail(409, 'IDEMPOTENCY_CONFLICT'); return receipt.response; }
      // Bound private draft storage even while a pilot has no reviewer capacity.
      const existing = await this.db.list('contributions', this.db.collection('contributions').where('ownerId', '==', req.user.id), 50, tx);
      if (existing.length >= 50) fail(422, 'CONTRIBUTION_LIMIT');
      const now = new Date(), id = randomUUID(), revisionId = randomUUID();
      const row: ContributionRecord = { id, revisionId, ownerId: req.user.id, version: 1, state: 'DRAFT', draft, contentHash, createdAt: now, updatedAt: now };
      await this.db.put('contributionRevisions', { id: revisionId, contributionId: id, ownerId: req.user.id, draft, contentHash, createdAt: now }, tx);
      await this.db.put('contributions', row, tx);
      await this.db.put('idempotency', { id: receiptId, userId: req.user.id, key: token, fingerprint, response: view(row), expiresAt: new Date(now.getTime() + 86400000) }, tx);
      await this.db.audit(req.user.id, 'contribution.create', id, tx);
      return view(row);
    });
  }
  @Get('contributions/:id') async get(@Req() req: AuthRequest, @Param('id') id: string) {
    const row = await this.db.get('contributions', z.uuid().parse(id));
    if (!row) fail(404, 'NOT_FOUND');
    if (row.ownerId !== req.user.id && !row.draft.coauthorIds.includes(req.user.id)) {
      const assignment = await this.db.get('contributionAssignments', row.revisionId);
      const verification = await this.db.get('contributorVerifications', keyId(req.user.id, row.draft.specialty, row.draft.organizationId ?? ''));
      if (!assignment?.active || assignment.reviewerId !== req.user.id || assignment.contentHash !== row.contentHash || !verification || row.state === 'WITHDRAWN') fail(404, 'NOT_FOUND');
      try { assertCommunityReviewer(row, assignment, verification); } catch { fail(404, 'NOT_FOUND'); }
    }
    const decision = await this.db.get('contributionDecisions', row.revisionId);
    return { ...view(row), feedback: decision ? { approved: decision.approved, reason: decision.reason, reviewDueAt: decision.reviewDueAt.toISOString() } : null };
  }
  @Post('contributions/:id/revisions') @UseGuards(CsrfGuard) async revise(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: unknown, @Headers('if-match') etag: string | undefined) {
    this.enabled(); const version = expectedRevision(etag), draft = contributionDraftSchema.parse(body); this.personal(draft);
    const contentHash = snapshotHash(req.user.id, draft);
    return this.db.transaction(async tx => {
      const row = await this.owned(id, req.user.id, tx);
      if (row.version !== version) fail(409, 'REVISION_CONFLICT');
      if (!['DRAFT', 'CHANGES_REQUESTED', 'APPROVED'].includes(row.state)) fail(409, 'INVALID_STATE');
      if (version >= 100) fail(422, 'REVISION_LIMIT');
      const revisionId = randomUUID(), now = new Date();
      const updated: ContributionRecord = { ...row, draft, contentHash, version: version + 1, revisionId, state: 'DRAFT', updatedAt: now };
      await this.db.put('contributionRevisions', { id: revisionId, contributionId: id, ownerId: req.user.id, draft, contentHash, createdAt: now }, tx);
      await this.db.put('contributions', updated, tx);
      await this.db.audit(req.user.id, 'contribution.revise', id, tx);
      return view(updated);
    });
  }
  @Post('contributions/:id/consent') @UseGuards(CsrfGuard) async coauthor(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: unknown, @Headers('if-match') etag: string | undefined) {
    const version = expectedRevision(etag), { accepted } = z.object({ accepted: z.boolean() }).strict().parse(body);
    return this.db.transaction(async tx => {
      const row = await this.db.get('contributions', z.uuid().parse(id), tx);
      if (!row || !row.draft.coauthorIds.includes(req.user.id)) fail(404, 'NOT_FOUND');
      if (row.version !== version) fail(409, 'REVISION_CONFLICT');
      if (row.state === 'PUBLISHED') fail(409, 'INVALID_STATE');
      await this.db.put('contributionConsents', { id: keyId(row.revisionId, req.user.id), revisionId: row.revisionId, userId: req.user.id, contentHash: row.contentHash, accepted }, tx);
      // Consent revocation invalidates any previously approved current snapshot.
      if (!accepted && ['SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(row.state)) await this.db.put('contributions', { ...row, state: 'CHANGES_REQUESTED', version: version + 1, updatedAt: new Date() }, tx);
      await this.db.audit(req.user.id, accepted ? 'contribution.consent' : 'contribution.consent_revoke', id, tx);
      return { accepted };
    });
  }
  @Post('contributions/:id/submit') @UseGuards(CsrfGuard) async submit(@Req() req: AuthRequest, @Param('id') id: string, @Headers('if-match') etag: string | undefined) {
    this.enabled(); const version = expectedRevision(etag);
    return this.db.transaction(async tx => {
      const row = await this.owned(id, req.user.id, tx), consent = await this.consent(row, tx);
      const article = row.draft.target ? await this.db.get('articles', row.draft.target.articleId, tx) : null;
      const previousDecision = await this.db.get('contributionDecisions', row.revisionId, tx);
      if (previousDecision) fail(409, 'NEW_REVISION_REQUIRED');
      if (row.draft.target && article?.publishedRevisionId !== row.draft.target.basePublishedRevisionId) fail(409, 'PUBLICATION_BASE_CHANGED');
      policy(() => assertContributionSubmission(row, req.user.id, version, consent));
      const updated: ContributionRecord = { ...row, state: 'SUBMITTED', version: version + 1, updatedAt: new Date() };
      await this.db.put('contributions', updated, tx); await this.db.audit(req.user.id, 'contribution.submit', id, tx);
      return view(updated);
    });
  }
  @Post('contributions/:id/withdraw-submission') @UseGuards(CsrfGuard) async withdraw(@Req() req: AuthRequest, @Param('id') id: string, @Headers('if-match') etag: string | undefined) {
    const version = expectedRevision(etag);
    return this.db.transaction(async tx => {
      const row = await this.owned(id, req.user.id, tx);
      if (row.version !== version) fail(409, 'REVISION_CONFLICT');
      if (row.state === 'PUBLISHED' || row.state === 'WITHDRAWN') fail(409, 'INVALID_STATE');
      const updated: ContributionRecord = { ...row, state: 'WITHDRAWN', version: version + 1, updatedAt: new Date() };
      await this.db.put('contributions', updated, tx); await this.db.audit(req.user.id, 'contribution.withdraw', id, tx);
      return view(updated);
    });
  }
  @Post('editor/contributions/:id/assign') @UseGuards(CsrfGuard) async assign(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: unknown, @Headers('if-match') etag: string | undefined) {
    this.enabled(); requireRole(req.user.roles, 'PUBLISHER'); const version = expectedRevision(etag);
    const input = z.object({ reviewerId: z.uuid(), independenceConfirmed: z.literal(true) }).strict().parse(body);
    return this.db.transaction(async tx => {
      const row = await this.db.get('contributions', z.uuid().parse(id), tx);
      if (!row) fail(404, 'NOT_FOUND');
      if (row.version !== version || row.state !== 'SUBMITTED') fail(409, 'REVISION_CONFLICT');
      const verification = await this.db.get('contributorVerifications', keyId(input.reviewerId, row.draft.specialty, row.draft.organizationId ?? ''), tx);
      if (!verification) fail(409, 'CURRENT_VERIFICATION_REQUIRED');
      const assignment: AssignmentRecord = { id: row.revisionId, contributionId: id, revisionId: row.revisionId, reviewerId: input.reviewerId, contentHash: row.contentHash, active: true, independenceConfirmedBy: req.user.id, assignedBy: req.user.id };
      policy(() => assertCommunityReviewer(row, assignment, verification));
      await this.db.put('contributionAssignments', assignment, tx);
      await this.db.put('contributions', { ...row, state: 'IN_REVIEW', version: version + 1, updatedAt: new Date() }, tx);
      await this.db.audit(req.user.id, 'contribution.assign', id, tx);
      return { id, revisionId: row.revisionId, version: version + 1, state: 'IN_REVIEW' };
    });
  }
  @Post('review-assignments/:id/decisions') @UseGuards(CsrfGuard) async decide(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: unknown, @Headers('if-match') etag: string | undefined) {
    this.enabled(); const version = expectedRevision(etag);
    const input = z.object({ approved: z.boolean(), noConflictDeclared: z.literal(true), contentHash: z.string().regex(/^[a-f0-9]{64}$/), reviewDueAt: z.iso.datetime(), reason: z.string().trim().min(1).max(2000) }).strict().parse(body);
    return this.db.transaction(async tx => {
      const assignment = await this.db.get('contributionAssignments', z.uuid().parse(id), tx);
      if (!assignment || assignment.reviewerId !== req.user.id) fail(404, 'NOT_FOUND');
      const row = await this.db.get('contributions', assignment.contributionId, tx);
      if (!row) fail(404, 'NOT_FOUND');
      const verification = await this.db.get('contributorVerifications', keyId(req.user.id, row.draft.specialty, row.draft.organizationId ?? ''), tx);
      const existing = await this.db.get('contributionDecisions', id, tx);
      const consent = await this.consent(row, tx);
      if (existing) fail(409, 'REVIEW_ALREADY_RECORDED');
      if (!verification) fail(409, 'CURRENT_VERIFICATION_REQUIRED');
      if (row.draft.coauthorIds.some(author => !consent.has(author))) fail(409, 'COAUTHOR_CONSENT_REQUIRED');
      const decision: DecisionRecord = { ...input, id, revisionId: id, reviewerId: req.user.id, reviewDueAt: new Date(input.reviewDueAt), createdAt: new Date() };
      policy(() => assertCommunityDecision(row, req.user.id, version, assignment, verification, decision));
      const updated: ContributionRecord = { ...row, state: input.approved ? 'APPROVED' : 'CHANGES_REQUESTED', version: version + 1, updatedAt: new Date() };
      await this.db.put('contributionDecisions', decision, tx); await this.db.put('contributions', updated, tx);
      await this.db.audit(req.user.id, 'contribution.review', row.id, tx);
      return view(updated);
    });
  }
  @Post('editor/contributions/:id/publish') @UseGuards(CsrfGuard) publish(@Req() req: AuthRequest) {
    requireRole(req.user.roles, 'PUBLISHER');
    fail(503, 'COMMUNITY_PUBLICATION_DISABLED');
  }
}
