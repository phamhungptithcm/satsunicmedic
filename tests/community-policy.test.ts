import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { assertCommunityDecision, assertCommunityPublication, assertContributionSubmission, contributionDraftSchema, contributionHash, type ContributionDraft, type ContributionSnapshot } from '../apps/api/src/community-policy';

const now = new Date('2026-10-01T00:00:00Z');
function fixture() {
  const ownerId: string = randomUUID(), reviewerId: string = randomUUID(), editorId: string = randomUUID(), publisherId: string = randomUUID();
  const draft: ContributionDraft = { kind: 'knowledge', title: 'Synthetic learning note', text: 'Synthetic educational fixture without patient data.', sources: [{ title: 'Fixture source', url: 'https://example.org/reference' }], specialty: 'anatomy', target: null, organizationId: null, coauthorIds: [randomUUID()], rights: { termsVersion: 'fixture-v1', mayStoreAndReview: true, mayPublish: true }, conflicts: 'None declared in synthetic fixture', noPatientData: true };
  const row: ContributionSnapshot = { id: randomUUID(), revisionId: randomUUID(), ownerId, version: 3, state: 'APPROVED', draft, contentHash: contributionHash(ownerId, draft) };
  return { enabled: true, row, version: 3, publisherId, publisherRoles: ['PUBLISHER'],
    assignment: { revisionId: row.revisionId, reviewerId, contentHash: row.contentHash, active: true, independenceConfirmedBy: editorId },
    verification: { userId: reviewerId, specialty: 'anatomy', organizationId: null, status: 'VERIFIED' as const, checkedBy: editorId, expiresAt: new Date('2026-12-01T00:00:00Z') },
    decision: { revisionId: row.revisionId, reviewerId, contentHash: row.contentHash, approved: true, noConflictDeclared: true, reviewDueAt: new Date('2026-11-01T00:00:00Z') },
    currentPublishedRevisionId: null as string | null, acceptedTermsVersion: 'fixture-v1', acceptedAuthorIds: new Set(draft.coauthorIds), now };
}
describe('community trust boundary (policy only; not endpoint acceptance)', () => {
  it('allows the independently verified exact revision and requires coauthor consent on submission', () => {
    const input = fixture();
    expect(() => assertCommunityPublication(input)).not.toThrow();
    const row = { ...input.row, state: 'DRAFT' as const };
    expect(() => assertContributionSubmission(row, row.ownerId, row.version, input.acceptedAuthorIds)).not.toThrow();
    expect(() => assertContributionSubmission(row, row.ownerId, row.version, new Set())).toThrow('COAUTHOR_CONSENT_REQUIRED');
    expect(() => assertContributionSubmission(row, randomUUID(), row.version, input.acceptedAuthorIds)).toThrow('OWNER_REQUIRED');
  });
  it('allows an assigned reviewer decision only for the current in-review version', () => {
    const input = fixture();
    const row = { ...input.row, state: 'IN_REVIEW' as const };
    const check = (actor: string, version: number) => assertCommunityDecision(row, actor, version, input.assignment, input.verification, input.decision, now);
    expect(() => check(input.assignment.reviewerId, row.version)).not.toThrow();
    expect(() => check(row.ownerId, row.version)).toThrow('REVIEW_BINDING_MISMATCH');
    expect(() => check(input.assignment.reviewerId, row.version - 1)).toThrow('REVISION_CONFLICT');
    input.decision.reviewDueAt = new Date(now.getTime() + 367 * 86400000);
    expect(() => check(input.assignment.reviewerId, row.version)).toThrow('INVALID_REVIEW_DATE');
  });
  const cases: [string, (value: ReturnType<typeof fixture>) => void, string][] = [
    ['disabled activation', v => { v.enabled = false; }, 'COMMUNITY_PUBLICATION_DISABLED'],
    ['self declared role', v => { v.publisherRoles = ['doctor']; }, 'PUBLISHER_REQUIRED'],
    ['author publisher', v => { v.publisherId = v.row.ownerId; }, 'INDEPENDENT_PUBLISHER_REQUIRED'],
    ['stale version', v => { v.version--; }, 'REVISION_CONFLICT'],
    ['unreviewed state', v => { v.row.state = 'SUBMITTED'; }, 'INVALID_STATE'],
    ['revoked assignment', v => { v.assignment.active = false; }, 'CURRENT_ASSIGNMENT_REQUIRED'],
    ['different revision assignment', v => { v.assignment.revisionId = randomUUID(); }, 'CURRENT_ASSIGNMENT_REQUIRED'],
    ['stale assigned hash', v => { v.assignment.contentHash = 'a'.repeat(64); }, 'CURRENT_ASSIGNMENT_REQUIRED'],
    ['coauthor reviewer', v => { v.assignment.reviewerId = v.row.draft.coauthorIds[0]!; }, 'INDEPENDENT_REVIEW_REQUIRED'],
    ['self-assigned independence', v => { v.assignment.independenceConfirmedBy = v.assignment.reviewerId; }, 'EDITOR_INDEPENDENCE_REQUIRED'],
    ['author claims independence', v => { v.assignment.independenceConfirmedBy = v.row.ownerId; }, 'EDITOR_INDEPENDENCE_REQUIRED'],
    ['expired verification', v => { v.verification.expiresAt = now; }, 'CURRENT_VERIFICATION_REQUIRED'],
    ['wrong specialty', v => { v.verification.specialty = 'another-specialty'; }, 'CURRENT_VERIFICATION_REQUIRED'],
    ['self verification', v => { v.verification.checkedBy = v.verification.userId; }, 'SELF_VERIFICATION_FORBIDDEN'],
    ['withdrawn consent', v => { v.acceptedAuthorIds.clear(); }, 'COAUTHOR_CONSENT_REQUIRED'],
    ['expired review', v => { v.decision.reviewDueAt = now; }, 'CURRENT_REVIEW_REQUIRED'],
    ['rejected review', v => { v.decision.approved = false; }, 'CURRENT_REVIEW_REQUIRED'],
    ['missing conflict declaration', v => { v.decision.noConflictDeclared = false; }, 'CURRENT_REVIEW_REQUIRED'],
    ['different review hash', v => { v.decision.contentHash = 'b'.repeat(64); }, 'CURRENT_REVIEW_REQUIRED'],
    ['new terms require consent', v => { v.acceptedTermsVersion = 'fixture-v2'; }, 'PUBLICATION_RIGHTS_REQUIRED'],
    ['new public revision requires rebase', v => { v.currentPublishedRevisionId = randomUUID(); }, 'PUBLICATION_BASE_CHANGED'],
  ];
  it.each(cases)('denies %s', (_name, mutate, code) => {
    const input = fixture(); mutate(input);
    expect(() => assertCommunityPublication(input)).toThrow(code);
  });
  it('binds content, rights, conflicts, source and author changes; does not hash key order', () => {
    const input = fixture(), { draft } = input.row;
    for (const update of [{ text: 'Changed' }, { conflicts: 'Changed' }, { rights: { ...draft.rights, mayPublish: false } }, { sources: [{ title: 'Another source', url: 'https://example.org/other' }] }, { coauthorIds: [randomUUID()] }]) {
      expect(contributionHash(input.row.ownerId, { ...draft, ...update })).not.toBe(input.row.contentHash);
      expect(() => assertCommunityPublication({ ...input, row: { ...input.row, draft: { ...draft, ...update } } })).toThrow('CONTENT_CHANGED');
    }
    expect(contributionHash(input.row.ownerId, Object.fromEntries(Object.entries(draft).reverse()))).toBe(input.row.contentHash);
  });
  it('rejects privilege injection, uploads, unbounded text, missing target and unsafe sources', () => {
    const { draft } = fixture().row;
    for (const update of [{ roles: ['PUBLISHER'] }, { verified: true }, { upload: 'patient.dcm' }, { text: 'x'.repeat(20001) }, { kind: 'correction' }, { noPatientData: false }, { sources: [{ title: 'Unsafe', url: 'javascript:alert(1)' }] }, { sources: [{ title: 'Credential URL', url: 'https://user:password@example.org/' }] }]) {
      expect(contributionDraftSchema.safeParse({ ...draft, ...update }).success).toBe(false);
    }
  });
});
