import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import supertest from 'supertest';
import { createApp } from '../apps/api/src/app';
import { readConfig } from '../apps/api/src/config';
import { Database, keyId } from '../apps/api/src/database';
import type { ContributionDraft } from '../apps/api/src/community-policy';

const origin = 'http://127.0.0.1:4185';
function localPort(raw: string | undefined, fallback: number) { const port = raw === undefined ? fallback : Number(raw); if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid emulator port'); return port; }
const firestoreHost = `127.0.0.1:${localPort(process.env.HS_TEST_FIRESTORE_PORT, 8189)}`, authHost = `127.0.0.1:${localPort(process.env.HS_TEST_AUTH_PORT, 9199)}`;
type Login = { id: string; cookie: string; csrf: string };
let app: Awaited<ReturnType<typeof createApp>>, db: Database, author: Login, reviewer: Login, editor: Login, other: Login;
const config = readConfig({ NODE_ENV: 'test', APP_ORIGIN: origin, FIREBASE_PROJECT_ID: 'demo-humanscope', FIRESTORE_EMULATOR_HOST: firestoreHost, FIREBASE_AUTH_EMULATOR_HOST: authHost, COMMUNITY_INTAKE_ENABLED: 'true' });
const headers = (user: Login) => ({ Origin: origin, 'X-CSRF-Token': user.csrf, Cookie: `${user.cookie}; hs_csrf=${user.csrf}` });
async function login() {
  const response = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${randomUUID()}@example.test`, password: 'Local-fixture-only-12345', returnSecureToken: true }) });
  if (!response.ok) throw new Error('Emulator signup failed');
  const { idToken } = await response.json() as { idToken: string };
  const csrfResponse = await supertest(app.getHttpServer()).get('/auth/csrf').expect(200);
  const csrf = String(csrfResponse.body.token);
  const result = await supertest(app.getHttpServer()).post('/auth/session').set({ Origin: origin, 'X-CSRF-Token': csrf, Cookie: `hs_csrf=${csrf}` }).send({ idToken }).expect(201);
  const cookie = (result.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
  const me = await supertest(app.getHttpServer()).get('/api/v1/me').set('Cookie', cookie).expect(200);
  return { id: me.body.id as string, cookie, csrf };
}
function draft(coauthorIds: string[] = []): ContributionDraft { return { kind: 'knowledge', title: 'Synthetic community fixture', text: 'Synthetic learning text, no patient data.', sources: [{ title: 'Synthetic reference', url: 'https://example.org/education' }], specialty: 'anatomy', target: null, organizationId: null, coauthorIds, rights: { termsVersion: 'fixture-v1', mayStoreAndReview: true, mayPublish: false }, conflicts: 'None in this synthetic fixture', noPatientData: true }; }
const post = (path: string, user = author) => supertest(app.getHttpServer()).post(`/api/v1/${path}`).set(headers(user));
async function create(value = draft(), key = randomUUID()) { return (await post('contributions').set('Idempotency-Key', key).send(value).expect(201)).body; }
beforeAll(async () => {
  if (process.env.FIRESTORE_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST !== firestoreHost) throw new Error('Dedicated loopback emulator required');
  process.env.FIRESTORE_EMULATOR_HOST = firestoreHost; process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
  app = await createApp(config); await app.listen(0, '127.0.0.1'); db = app.get(Database);
  author = await login(); reviewer = await login(); editor = await login(); other = await login();
  await db.ref('users', editor.id).update({ roles: ['PUBLISHER'] });
  await db.put('contributorVerifications', { id: keyId(reviewer.id, 'anatomy', ''), userId: reviewer.id, specialty: 'anatomy', organizationId: null, status: 'VERIFIED', checkedBy: editor.id, expiresAt: new Date(Date.now() + 86400000) });
}, 20000);
afterAll(async () => { await app?.close(); });
describe('private contribution intake on synthetic Firebase emulators', () => {
  it('defaults intake off and never opens publication', async () => {
    expect(readConfig({ NODE_ENV: 'test' }).COMMUNITY_INTAKE_ENABLED).toBe('false');
    config.COMMUNITY_INTAKE_ENABLED = 'false';
    try { await post('contributions').set('Idempotency-Key', randomUUID()).send(draft()).expect(503); }
    finally { config.COMMUNITY_INTAKE_ENABLED = 'true'; }
    const row = await create();
    const result = await post(`editor/contributions/${row.id}/publish`, editor).expect(503);
    expect(result.body.error.code).toBe('COMMUNITY_PUBLICATION_DISABLED');
  });
  it('rejects anonymous, CSRF, injected roles and unavailable org scopes', async () => {
    await supertest(app.getHttpServer()).post('/api/v1/contributions').send(draft()).expect(401);
    await supertest(app.getHttpServer()).post('/api/v1/contributions').set('Cookie', author.cookie).send(draft()).expect(403);
    await post('contributions').set('Idempotency-Key', randomUUID()).send({ ...draft(), roles: ['PUBLISHER'] }).expect(400);
    await post('contributions').set('Idempotency-Key', randomUUID()).send(draft([author.id])).expect(400);
    await post('contributions').set('Idempotency-Key', randomUUID()).send({ ...draft(), organizationId: randomUUID() }).expect(422);
  });
  it('deduplicates concurrent creation and rejects reuse for another payload', async () => {
    const key = randomUUID(), input = draft();
    const [a, b] = await Promise.all([create(input, key), create(input, key)]);
    expect(a.id).toBe(b.id);
    await post('contributions').set('Idempotency-Key', key).send({ ...input, text: 'Changed' }).expect(409);
    await supertest(app.getHttpServer()).get(`/api/v1/contributions/${a.id}`).set(headers(other)).expect(404);
    await post(`contributions/${a.id}/revisions`, other).set('If-Match', '"1"').send(input).expect(404);
  });
  it('requires consent and one winning revision for concurrent submission', async () => {
    const row = await create(draft([other.id]));
    await post(`contributions/${row.id}/submit`).set('If-Match', '"1"').expect(409);
    await post(`contributions/${row.id}/consent`, other).set('If-Match', '"1"').send({ accepted: true }).expect(201);
    const results = await Promise.all([post(`contributions/${row.id}/submit`).set('If-Match', '"1"'), post(`contributions/${row.id}/submit`).set('If-Match', '"1"')]);
    expect(results.map(result => result.status).sort()).toEqual([201, 409]);
    await post(`contributions/${row.id}/consent`, other).set('If-Match', '"2"').send({ accepted: false }).expect(201);
    const current = await db.get('contributions', row.id);
    expect(current?.state).toBe('CHANGES_REQUESTED');
    expect(current?.version).toBe(3);
  });
  it('completes submit → assignment → review → revision and invalidates previous approval', async () => {
    const row = await create();
    await post(`contributions/${row.id}/submit`).set('If-Match', '"1"').expect(201);
    await post(`editor/contributions/${row.id}/assign`, author).set('If-Match', '"2"').send({ reviewerId: author.id, independenceConfirmed: true }).expect(403);
    await post(`editor/contributions/${row.id}/assign`, editor).set('If-Match', '"2"').send({ reviewerId: reviewer.id, independenceConfirmed: true }).expect(201);
    const decision = { approved: true, noConflictDeclared: true, contentHash: row.contentHash, reviewDueAt: new Date(Date.now() + 86400000).toISOString(), reason: 'Synthetic fixture review only' };
    await post(`review-assignments/${row.revisionId}/decisions`, other).set('If-Match', '"3"').send(decision).expect(404);
    const approved = await post(`review-assignments/${row.revisionId}/decisions`, reviewer).set('If-Match', '"3"').send(decision).expect(201);
    expect(approved.body.state).toBe('APPROVED');
    await post(`review-assignments/${row.revisionId}/decisions`, reviewer).set('If-Match', '"3"').send(decision).expect(409);
    const revision = await post(`contributions/${row.id}/revisions`).set('If-Match', '"4"').send({ ...draft(), text: 'A changed synthetic statement' }).expect(201);
    expect(revision.body.state).toBe('DRAFT'); expect(revision.body.revisionId).not.toBe(row.revisionId);
    expect((await db.get('contributionRevisions', row.revisionId))?.draft.text).toBe(draft().text);
    await supertest(app.getHttpServer()).get(`/api/v1/contributions/${row.id}`).set(headers(reviewer)).expect(404);
  });
  it('keeps private pagination owner-bound and denies stale updates after withdrawal', async () => {
    const row = await create();
    await supertest(app.getHttpServer()).get(`/api/v1/me/contributions?cursor=${row.id}`).set(headers(other)).expect(404);
    const first = await supertest(app.getHttpServer()).get('/api/v1/me/contributions?limit=2').set(headers(author)).expect(200);
    expect(first.body.items).toHaveLength(2); expect(first.body.nextCursor).toBeTypeOf('string');
    const second = await supertest(app.getHttpServer()).get(`/api/v1/me/contributions?limit=2&cursor=${first.body.nextCursor}`).set(headers(author)).expect(200);
    expect(second.body.items.every((item: { id: string }) => !first.body.items.some((old: { id: string }) => old.id === item.id))).toBe(true);
    await post(`contributions/${row.id}/withdraw-submission`).set('If-Match', '"1"').expect(201);
    await post(`contributions/${row.id}/submit`).set('If-Match', '"2"').expect(409);
    const audits = await db.list('audits', db.collection('audits').where('objectId', '==', row.id), 20);
    expect(audits.length).toBeGreaterThan(0);
    expect(audits.every(event => Object.keys(event).sort().join(',') === 'action,actorId,createdAt,id,objectId')).toBe(true);
  });
  it('revokes reviewer read/decision access and requires a new revision after rejection', async () => {
    const row = await create();
    await post(`contributions/${row.id}/submit`).set('If-Match', '"1"').expect(201);
    await post(`editor/contributions/${row.id}/assign`, editor).set('If-Match', '"2"').send({ reviewerId: reviewer.id, independenceConfirmed: true }).expect(201);
    const decision = { approved: false, noConflictDeclared: true, contentHash: row.contentHash, reviewDueAt: new Date(Date.now() + 86400000).toISOString(), reason: 'Synthetic request to clarify a source' };
    const verificationId = keyId(reviewer.id, 'anatomy', '');
    await db.ref('contributorVerifications', verificationId).update({ status: 'REVOKED' });
    try {
      await supertest(app.getHttpServer()).get(`/api/v1/contributions/${row.id}`).set(headers(reviewer)).expect(404);
      await post(`review-assignments/${row.revisionId}/decisions`, reviewer).set('If-Match', '"3"').send(decision).expect(409);
    } finally { await db.ref('contributorVerifications', verificationId).update({ status: 'VERIFIED' }); }
    await post(`review-assignments/${row.revisionId}/decisions`, reviewer).set('If-Match', '"3"').send(decision).expect(201);
    const result = await post(`contributions/${row.id}/submit`).set('If-Match', '"4"').expect(409);
    expect(result.body.error.code).toBe('NEW_REVISION_REQUIRED');
    const detail = await supertest(app.getHttpServer()).get(`/api/v1/contributions/${row.id}`).set(headers(author)).expect(200);
    expect(detail.body.feedback.reason).toBe(decision.reason);
  });
});
