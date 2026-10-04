import { createHash } from 'node:crypto';
import { z } from 'zod';

// Private text intake only. Links are data: the server must not fetch them.
const httpsSource = z.url().max(2048).refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
});
export const contributionDraftSchema = z.object({
  kind: z.enum(['correction', 'knowledge', 'terminology']),
  title: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(20000),
  sources: z.array(z.object({ title: z.string().trim().min(1).max(300), url: httpsSource }).strict()).min(1).max(20),
  specialty: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
  target: z.object({ articleId: z.uuid(), basePublishedRevisionId: z.uuid() }).strict().nullable(),
  organizationId: z.uuid().nullable(),
  coauthorIds: z.array(z.uuid()).max(10).refine(ids => new Set(ids).size === ids.length),
  rights: z.object({ termsVersion: z.string().trim().min(1).max(64), mayStoreAndReview: z.literal(true), mayPublish: z.boolean() }).strict(),
  conflicts: z.string().trim().min(1).max(2000),
  noPatientData: z.literal(true),
}).strict().refine(input => input.kind !== 'correction' || input.target !== null);
export type ContributionDraft = z.infer<typeof contributionDraftSchema>;
export type ContributionState = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'WITHDRAWN';
export interface ContributionSnapshot {
  id: string;
  revisionId: string;
  ownerId: string;
  version: number;
  state: ContributionState;
  draft: ContributionDraft;
  contentHash: string;
}
export interface CommunityVerification {
  userId: string;
  specialty: string;
  organizationId: string | null;
  status: 'VERIFIED' | 'REVOKED';
  checkedBy: string;
  expiresAt: Date;
}
export interface CommunityAssignment {
  revisionId: string;
  reviewerId: string;
  contentHash: string;
  active: boolean;
  // An editor assesses independence; organization equality never implies it.
  independenceConfirmedBy: string;
}
export interface CommunityDecision {
  revisionId: string;
  reviewerId: string;
  contentHash: string;
  approved: boolean;
  noConflictDeclared: boolean;
  reviewDueAt: Date;
}
export class CommunityPolicyError extends Error {
  constructor(readonly code: string) { super(code); this.name = 'CommunityPolicyError'; }
}
function requirePolicy(condition: unknown, code: string): asserts condition {
  if (!condition) throw new CommunityPolicyError(code);
}
const future = (date: Date, now: Date) => Number.isFinite(date.getTime()) && date > now;

/** Hash includes all authors, rights, sources, target base and conflicts. */
export function contributionHash(ownerId: string, value: unknown) {
  z.uuid().parse(ownerId);
  const draft = contributionDraftSchema.parse(value);
  requirePolicy(!draft.coauthorIds.includes(ownerId), 'DUPLICATE_AUTHOR');
  return createHash('sha256').update(JSON.stringify({ ownerId, ...draft, coauthorIds: [...draft.coauthorIds].sort() })).digest('hex');
}
function currentSnapshot(row: ContributionSnapshot, version: number) {
  requirePolicy(Number.isSafeInteger(version) && version > 0 && row.version === version, 'REVISION_CONFLICT');
  requirePolicy(row.contentHash === contributionHash(row.ownerId, row.draft), 'CONTENT_CHANGED');
}
export function assertContributionSubmission(row: ContributionSnapshot, actorId: string, version: number, acceptedAuthorIds: ReadonlySet<string>) {
  currentSnapshot(row, version);
  requirePolicy(row.ownerId === actorId, 'OWNER_REQUIRED');
  requirePolicy(row.state === 'DRAFT' || row.state === 'CHANGES_REQUESTED', 'INVALID_STATE');
  requirePolicy(row.draft.coauthorIds.every(id => acceptedAuthorIds.has(id)), 'COAUTHOR_CONSENT_REQUIRED');
}
export function assertCommunityReviewer(row: ContributionSnapshot, assignment: CommunityAssignment, verification: CommunityVerification, now = new Date()) {
  requirePolicy(row.contentHash === contributionHash(row.ownerId, row.draft), 'CONTENT_CHANGED');
  const authors = [row.ownerId, ...row.draft.coauthorIds];
  requirePolicy(assignment.active && assignment.revisionId === row.revisionId && assignment.contentHash === row.contentHash, 'CURRENT_ASSIGNMENT_REQUIRED');
  requirePolicy(!authors.includes(assignment.reviewerId), 'INDEPENDENT_REVIEW_REQUIRED');
  requirePolicy(assignment.independenceConfirmedBy !== assignment.reviewerId && !authors.includes(assignment.independenceConfirmedBy) && z.uuid().safeParse(assignment.independenceConfirmedBy).success, 'EDITOR_INDEPENDENCE_REQUIRED');
  requirePolicy(verification.userId === assignment.reviewerId && verification.status === 'VERIFIED' && verification.specialty === row.draft.specialty && verification.organizationId === row.draft.organizationId && future(verification.expiresAt, now), 'CURRENT_VERIFICATION_REQUIRED');
  requirePolicy(verification.checkedBy !== assignment.reviewerId && z.uuid().safeParse(verification.checkedBy).success, 'SELF_VERIFICATION_FORBIDDEN');
}
export function assertCommunityDecision(row: ContributionSnapshot, actorId: string, version: number, assignment: CommunityAssignment, verification: CommunityVerification, decision: CommunityDecision, now = new Date()) {
  currentSnapshot(row, version);
  requirePolicy(row.state === 'IN_REVIEW', 'INVALID_STATE');
  assertCommunityReviewer(row, assignment, verification, now);
  requirePolicy(actorId === assignment.reviewerId && decision.reviewerId === actorId && decision.revisionId === row.revisionId && decision.contentHash === row.contentHash, 'REVIEW_BINDING_MISMATCH');
  requirePolicy(decision.noConflictDeclared, 'CONFLICT_DECLARATION_REQUIRED');
  requirePolicy(future(decision.reviewDueAt, now) && decision.reviewDueAt.getTime() <= now.getTime() + 366 * 86400000, 'INVALID_REVIEW_DATE');
}
export function assertCommunityPublication(input: {
  enabled: boolean; row: ContributionSnapshot; version: number; publisherId: string;
  publisherRoles: readonly string[]; assignment: CommunityAssignment; verification: CommunityVerification;
  decision: CommunityDecision; currentPublishedRevisionId: string | null;
  acceptedTermsVersion: string; acceptedAuthorIds: ReadonlySet<string>; now?: Date;
}) {
  const { row, assignment, verification, decision, now = new Date() } = input;
  requirePolicy(input.enabled, 'COMMUNITY_PUBLICATION_DISABLED');
  requirePolicy(input.publisherRoles.includes('PUBLISHER'), 'PUBLISHER_REQUIRED');
  requirePolicy(![row.ownerId, ...row.draft.coauthorIds].includes(input.publisherId), 'INDEPENDENT_PUBLISHER_REQUIRED');
  currentSnapshot(row, input.version);
  requirePolicy(row.state === 'APPROVED', 'INVALID_STATE');
  assertCommunityReviewer(row, assignment, verification, now);
  requirePolicy(row.draft.coauthorIds.every(id => input.acceptedAuthorIds.has(id)), 'COAUTHOR_CONSENT_REQUIRED');
  requirePolicy(decision.approved && decision.noConflictDeclared && decision.reviewerId === assignment.reviewerId && decision.revisionId === row.revisionId && decision.contentHash === row.contentHash && future(decision.reviewDueAt, now), 'CURRENT_REVIEW_REQUIRED');
  requirePolicy(row.draft.rights.mayPublish && row.draft.rights.termsVersion === input.acceptedTermsVersion, 'PUBLICATION_RIGHTS_REQUIRED');
  requirePolicy((row.draft.target?.basePublishedRevisionId ?? null) === input.currentPublishedRevisionId, 'PUBLICATION_BASE_CHANGED');
}
