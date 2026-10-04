import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import supertest from "supertest";
import { randomUUID } from "node:crypto";
import { createApp } from "../apps/api/src/app";
import { readConfig } from "../apps/api/src/config";
import { Database } from "../apps/api/src/database";
import type { Collections } from "../apps/api/src/domain";
import {readFile} from "node:fs/promises";
import {PrivateController} from "../apps/api/src/private";
import {PublicController} from "../apps/api/src/public";
import {AuthController,Identity,type AuthRequest} from "../apps/api/src/identity";
import {articleBodySchema,assetManifestSchema} from "../packages/contracts/src/index";
import {searchGrams} from "../apps/api/src/database";
import type { AssetManifest } from "../packages/contracts/src/index";
import { initialScene } from "../packages/anatomy-viewer/src/index";
import { fixtureManifest } from "./fixtures";
const origin = "http://127.0.0.1:4185";
function localPort(value:string|undefined,fallback:number){const port=value===undefined?fallback:Number(value);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid local emulator test port');return port;}
const firestoreHost=`127.0.0.1:${localPort(process.env.HS_TEST_FIRESTORE_PORT,8189)}`;
const authHost=`127.0.0.1:${localPort(process.env.HS_TEST_AUTH_PORT,9199)}`;
let app: Awaited<ReturnType<typeof createApp>>;
let db: Database;
let a: { cookie: string; csrf: string; id: string; idToken:string };
let b: typeof a;
let reviewer: typeof a;
let publisher: typeof a;
let noteId: string;
let lessonId: string;
let articleId: string;
let revisionId: string;
let hash: string;
let asset: AssetManifest;
const id = randomUUID();
async function login() {
  const email = `${randomUUID()}@example.test`;
  const res = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "Emulator-only-12345",
        returnSecureToken: true,
      }),
    },
  );
  if (!res.ok) throw new Error("Emulator sign-up failed");
  const { idToken } = (await res.json()) as { idToken: string };
  const csrfRes = await supertest(app.getHttpServer())
    .get("/auth/csrf")
    .expect(200);
  const csrf = csrfRes.body.token as string;
  const session = await supertest(app.getHttpServer())
    .post("/auth/session")
    .set("Origin", origin)
    .set("X-CSRF-Token", csrf)
    .set("Cookie", `hs_csrf=${csrf}`)
    .send({ idToken })
    .expect(201);
  const cookies = session.headers["set-cookie"] as unknown as string[];
  const cookie = cookies[0]!.split(";")[0]!;
  const me = await supertest(app.getHttpServer())
    .get("/api/v1/me")
    .set("Cookie", cookie)
    .expect(200);
  return { cookie, csrf, id: me.body.id as string, idToken };
}
function auth(user: typeof a) {
  return {
    Origin: origin,
    "X-CSRF-Token": user.csrf,
    Cookie: `${user.cookie}; hs_csrf=${user.csrf}`,
  };
}
beforeAll(async () => {
  if(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST !== firestoreHost) throw new Error('Tests require dedicated loopback Firestore emulator');
  process.env.FIRESTORE_EMULATOR_HOST=firestoreHost;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
  app = await createApp(
    readConfig({
      NODE_ENV: "test",
      FIRESTORE_EMULATOR_HOST: firestoreHost,
      FIREBASE_PROJECT_ID: "demo-humanscope",
      FIREBASE_AUTH_EMULATOR_HOST: authHost,
      APP_ORIGIN: origin,
    }),
  );
  await app.listen(0, "127.0.0.1");
  db = app.get(Database);
  const rules=await readFile(new URL('../infra/firebase/firestore.rules',import.meta.url),'utf8');
  const loaded=await fetch(`http://${firestoreHost}/emulator/v1/projects/demo-humanscope:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content:rules}]}})});
  if(!loaded.ok) throw new Error('Emulator rules load failed');
  a = await login();
  b = await login();
  reviewer = await login();
  publisher = await login();
  await db.ref('users',a.id).update({roles:["USER", "AUTHOR"]});
  await db.ref('users',reviewer.id).update({roles:["REVIEWER"]});
  await db.ref('users',publisher.id).update({roles:["PUBLISHER"]});
}, 30000);
afterAll(async () => {
  if (app) await app.close();
});
describe("real Firestore + Firebase Auth emulators", () => {
  it("reports readiness with a real Firestore read", async () => {
    await supertest(app.getHttpServer())
      .get("/api/v1/health/ready")
      .expect(200);
  });
  it("denies missing session and cross-origin login", async () => {
    await supertest(app.getHttpServer()).get("/api/v1/me").expect(401);
    await supertest(app.getHttpServer())
      .post("/auth/session")
      .set("Origin", "https://evil.test")
      .send({ idToken: "invalid" })
      .expect(403);
  });
  it("writes a private note, denies cross-owner reads and edits", async () => {
    const res = await supertest(app.getHttpServer())
      .post("/api/v1/notes")
      .set(auth(a))
      .send({ text: "SYNTHETIC private note", anatomyId: null })
      .expect(201);
    noteId = res.body.id;
    const notes = await supertest(app.getHttpServer())
      .get("/api/v1/notes")
      .set(auth(b))
      .expect(200);
    expect(notes.body.items.some((n: { id: string }) => n.id === noteId)).toBe(
      false,
    );
    await supertest(app.getHttpServer())
      .patch(`/api/v1/notes/${noteId}`)
      .set(auth(b))
      .set("If-Match", '"1"')
      .send({ text: "overwrite", anatomyId: null })
      .expect(404);
  });
  it("rejects stale revision and CSRF before mutation", async () => {
    await supertest(app.getHttpServer())
      .patch(`/api/v1/notes/${noteId}`)
      .set(auth(a))
      .set("If-Match", '"1"')
      .send({ text: "SYNTHETIC updated", anatomyId: null })
      .expect(200);
    await supertest(app.getHttpServer())
      .patch(`/api/v1/notes/${noteId}`)
      .set(auth(a))
      .set("If-Match", '"1"')
      .send({ text: "stale", anatomyId: null })
      .expect(409);
    await supertest(app.getHttpServer())
      .post("/api/v1/notes")
      .set("Cookie", a.cookie)
      .send({ text: "no csrf", anatomyId: null })
      .expect(403);
  });
  it("hides draft article and denies direct publishing", async () => {
    const body = {
      title: "SYNTHETIC QA ONLY",
      summary: "Not medical content",
      sections: [{ heading: "Test", text: "Synthetic fixture" }],
      sources: [
        {
          title: "Synthetic fixture provenance",
          url: "https://example.com/test",
          accessedAt: new Date().toISOString(),
        },
      ],
    };
    const res = await supertest(app.getHttpServer())
      .post("/api/v1/editor/articles")
      .set(auth(a))
      .send({ slug: `test-${id}`, locale: "vi", body })
      .expect(201);
    articleId = res.body.articleId;
    revisionId = res.body.revisionId;
    hash = (
      (await db.get('revisions',revisionId))!
    ).contentHash;
    await supertest(app.getHttpServer())
      .get(`/api/v1/articles/test-${id}`)
      .expect(404);
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/revisions/${revisionId}/publish`)
      .set(auth(publisher))
      .set("If-Match", '"1"')
      .expect(422);
  });
  it("rejects self review and mismatched content hash", async () => {
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/revisions/${revisionId}/submit`)
      .set(auth(a))
      .set("If-Match", '"1"')
      .expect(201);
    await db.ref('users',a.id).update({roles:["USER", "AUTHOR", "REVIEWER"]});
    const review = {
      approved: true,
      contentHash: hash,
      reviewDueAt: new Date(Date.now() + 86400000).toISOString(),
    };
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/revisions/${revisionId}/reviews`)
      .set(auth(a))
      .set("If-Match", '"2"')
      .send(review)
      .expect(422);
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/revisions/${revisionId}/reviews`)
      .set(auth(reviewer))
      .set("If-Match", '"2"')
      .send({ ...review, contentHash: "f".repeat(64) })
      .expect(422);
  });
  it("publishes only reviewed exact revision; withdrawal is immediate", async () => {
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/revisions/${revisionId}/reviews`)
      .set(auth(reviewer))
      .set("If-Match", '"2"')
      .send({
        approved: true,
        contentHash: hash,
        reviewDueAt: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(201);
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/revisions/${revisionId}/publish`)
      .set(auth(publisher))
      .set("If-Match", '"3"')
      .expect(201);
    const res = await supertest(app.getHttpServer())
      .get(`/api/v1/articles/test-${id}`)
      .expect(200);
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.body).not.toHaveProperty("authorId");
    await supertest(app.getHttpServer())
      .post(`/api/v1/editor/articles/${articleId}/withdraw`)
      .set(auth(publisher))
      .send({ reason: "Synthetic test complete" })
      .expect(201);
    await supertest(app.getHttpServer())
      .get(`/api/v1/articles/test-${id}`)
      .expect(404);
  });
  it("rejects expired or revoked asset manifests", async () => {
    asset = { ...fixtureManifest, id: randomUUID() };
    await db.put('assets',{id:asset.id,status:'PUBLISHED',manifest:asset,objectKey:`test/${id}.glb`,sha256:asset.sha256,reviewDueAt:new Date(asset.review.reviewDueAt),licenseExpiresAt:null,createdAt:new Date()});
    await supertest(app.getHttpServer())
      .get(`/api/v1/assets/manifests/${asset.id}`)
      .expect(200);
    await db.ref('assets',asset.id).update({status:'WITHDRAWN'});
    await supertest(app.getHttpServer())
      .get(`/api/v1/assets/manifests/${asset.id}`)
      .expect(404);
    await db.ref('assets',asset.id).update({status:'PUBLISHED'});
  });
  it("pins scenes and replays idempotent creation without duplicates", async () => {
    const lesson = await supertest(app.getHttpServer())
      .post("/api/v1/lessons")
      .set(auth(a))
      .send({ title: "SYNTHETIC QA ONLY", description: "" })
      .expect(201);
    lessonId = lesson.body.id;
    const scene = initialScene(asset);
    const key = randomUUID();
    const first = await supertest(app.getHttpServer())
      .post(`/api/v1/lessons/${lessonId}/scenes`)
      .set(auth(a))
      .set("Idempotency-Key", key)
      .send(scene)
      .expect(201);
    const second = await supertest(app.getHttpServer())
      .post(`/api/v1/lessons/${lessonId}/scenes`)
      .set(auth(a))
      .set("Idempotency-Key", key)
      .send(scene)
      .expect(201);
    expect(first.body).toEqual(second.body);
    expect((await db.collection('scenes').where('lessonId','==',lessonId).count().get()).data().count).toBe(1);
    await supertest(app.getHttpServer())
      .post(`/api/v1/lessons/${lessonId}/scenes`)
      .set(auth(a))
      .set("Idempotency-Key", key)
      .send({ ...scene, labels: false })
      .expect(409);
    await supertest(app.getHttpServer())
      .get(`/api/v1/lessons/${lessonId}`)
      .set(auth(b))
      .expect(404);
  });
  it("shares exact scenes without private annotations and revokes access", async () => {
    const scene = (await db.list('scenes',db.collection('scenes').where('lessonId','==',lessonId),1))[0]!;
    const snapshot = initialScene(asset);
    snapshot.annotations = [
      {
        id: randomUUID(),
        anatomyId: "fixture",
        text: "PRIVATE MUST NOT SHARE",
        position: [0, 0, 0],
      },
    ];
    await db.put('scenes',{...scene,snapshot});
    const grant = await supertest(app.getHttpServer())
      .post(`/api/v1/lessons/${lessonId}/shares`)
      .set(auth(a))
      .send({
        sceneId: scene.id,
        revision: 1,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(201);
    const shared = await supertest(app.getHttpServer())
      .get(`/api/v1/shares/${grant.body.id}`)
      .expect(200);
    expect(shared.body.scene.annotations).toEqual([]);
    expect(JSON.stringify(shared.body)).not.toContain("PRIVATE MUST NOT SHARE");
    await supertest(app.getHttpServer())
      .delete(`/api/v1/shares/${grant.body.id}`)
      .set(auth(b))
      .expect(404);
    await supertest(app.getHttpServer())
      .delete(`/api/v1/shares/${grant.body.id}`)
      .set(auth(a))
      .expect(200);
    await supertest(app.getHttpServer())
      .get(`/api/v1/shares/${grant.body.id}`)
      .expect(404);
  });
  it("hides quiz answers, scores on server and replays the same attempt", async () => {
    const qid = randomUUID();
    const quiz = await db.put('quizzes', {
        id:randomUUID(),revision:1,
        title: "SYNTHETIC QA QUIZ",
        status: "PUBLISHED",
        reviewDueAt: new Date(Date.now() + 86400000),
        questions: [
          {
            id: qid,
            prompt: "Synthetic: choose A",
            options: [
              { id: "a", label: "A" },
              { id: "b", label: "B" },
            ],
            correctOptionId: "a",
            explanation: "Synthetic feedback",
          },
        ],
    });
    const read = await supertest(app.getHttpServer())
      .get(`/api/v1/quizzes/${quiz.id}`)
      .expect(200);
    expect(JSON.stringify(read.body)).not.toContain("correctOptionId");
    expect(JSON.stringify(read.body)).not.toContain("explanation");
    const key = randomUUID();
    const input = {
      revision: 1,
      answers: [{ questionId: qid, optionId: "a" }],
    };
    const first = await supertest(app.getHttpServer())
      .post(`/api/v1/quizzes/${quiz.id}/attempts`)
      .set(auth(a))
      .set("Idempotency-Key", key)
      .send(input)
      .expect(201);
    expect(first.body.correct).toBe(1);
    const replay = await supertest(app.getHttpServer())
      .post(`/api/v1/quizzes/${quiz.id}/attempts`)
      .set(auth(a))
      .set("Idempotency-Key", key)
      .send(input)
      .expect(201);
    expect(
      (await db.collection('attempts').where('quizId','==',quiz.id).where('userId','==',a.id).count().get()).data().count,
    ).toBe(1);
    await supertest(app.getHttpServer())
      .post(`/api/v1/quizzes/${quiz.id}/attempts`)
      .set(auth(a))
      .set("Idempotency-Key", key)
      .send({ ...input, answers: [{ questionId: qid, optionId: "b" }] })
      .expect(409);
    expect(replay.body).toEqual(first.body);
    expect(first.body.nextReview).toMatchObject({policy:'practice-intervals-v1',step:0});
    const ownReviews=await supertest(app.getHttpServer()).get('/api/v1/me/reviews').set(auth(a)).expect(200);
    expect(ownReviews.body.items).toContainEqual({quizId:quiz.id,quizRevision:1,title:quiz.title,schedule:first.body.nextReview});
    const otherReviews=await supertest(app.getHttpServer()).get('/api/v1/me/reviews').set(auth(b)).expect(200);
    expect(otherReviews.body.items.some((item:{quizId:string})=>item.quizId===quiz.id)).toBe(false);
    await supertest(app.getHttpServer()).get('/api/v1/me/reviews').expect(401);
    const early=await supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',randomUUID()).send(input).expect(201);
    expect(early.body.nextReview).toEqual(first.body.nextReview);
    const stored=await db.list('attempts',db.collection('attempts').where('quizId','==',quiz.id),10);
    expect(stored.every(attempt=>JSON.stringify(attempt.answers)===JSON.stringify(input.answers))).toBe(true);
    await db.ref('quizzes',quiz.id).update({revision:2});
    const changed=await supertest(app.getHttpServer()).get('/api/v1/me/reviews').set(auth(a)).expect(200);
    expect(changed.body.items.some((item:{quizId:string})=>item.quizId===quiz.id)).toBe(false);
    await supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',randomUUID()).send(input).expect(409);
    const fresh=await supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',randomUUID()).send({...input,revision:2}).expect(201);
    expect(fresh.body.nextReview.step).toBe(0);
    const concurrentKey=randomUUID();
    const concurrent=await Promise.all([1,2].map(()=>supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',concurrentKey).send({...input,revision:2})));
    expect(concurrent.map(r=>r.status)).toEqual([201,201]);
    expect(concurrent[0]!.body).toEqual(concurrent[1]!.body);
    const duplicateRows=await db.list('attempts',db.collection('attempts').where('userId','==',a.id).where('idempotencyKey','==',concurrentKey),10);
    expect(duplicateRows).toHaveLength(1);
    const reviewRows=await db.list('learningReviews',db.collection('learningReviews').where('userId','==',a.id),100);
    const currentReview=reviewRows.find(row=>row.quizId===quiz.id&&row.quizRevision===2)!;
    await db.ref('learningReviews',currentReview.id).update({'schedule.dueAt':new Date(Date.now()-86400000).toISOString()});
    const distinctAttempts=await Promise.all([1,2].map(()=>supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',randomUUID()).send({...input,revision:2})));
    expect(distinctAttempts.map(response=>response.status)).toEqual([201,201]);
    expect(distinctAttempts.map(response=>response.body.nextReview.step)).toEqual([1,1]);
    const beforeFailure=await db.get('learningReviews',currentReview.id);
    const originalPut=db.put.bind(db);
    const failure=vi.spyOn(db,'put').mockImplementation(async (name,row,tx)=>{
      if(name==='attempts') throw new Error('Synthetic attempt persistence failure');
      return originalPut<keyof Collections>(name,row,tx);
    });
    try {
      await supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',randomUUID()).send({...input,revision:2,answers:[{questionId:qid,optionId:'b'}]}).expect(503);
    } finally { failure.mockRestore(); }
    expect(await db.get('learningReviews',currentReview.id)).toEqual(beforeFailure);

    for(const patch of [{status:'DRAFT'}, {status:'PUBLISHED',reviewDueAt:new Date(0)}]) {
      await db.ref('quizzes',quiz.id).update(patch);
      const hidden=await supertest(app.getHttpServer()).get('/api/v1/me/reviews').set(auth(a)).expect(200);
      expect(hidden.body.items.some((item:{quizId:string})=>item.quizId===quiz.id)).toBe(false);
      await supertest(app.getHttpServer()).post(`/api/v1/quizzes/${quiz.id}/attempts`).set(auth(a)).set('Idempotency-Key',randomUUID()).send({...input,revision:2}).expect(404);
    }
    const progress = await supertest(app.getHttpServer())
      .get("/api/v1/me/progress")
      .set(auth(b))
      .expect(200);
    expect(
      progress.body.items.some((i: { quizId: string }) => i.quizId === quiz.id),
    ).toBe(false);
  });
  it("does not show expired or draft facility evidence", async () => {
    const branch = await db.put('facilities', {
        id:randomUUID(),
        legalName: "SYNTHETIC QA ONLY",
        branchName: "SYNTHETIC branch",
        address: "Not a real address",
        areaCode: "qa",
        officialUrl: "https://example.com",
        specialties: [],
        evidence: [
          {
            url: "https://example.com",
            title: "Synthetic",
            checkedAt: new Date().toISOString(),
          },
        ],
        status: "DRAFT",
        checkedAt: new Date(),
        reviewDueAt: new Date(Date.now() + 86400000),
    });
    await supertest(app.getHttpServer())
      .get(`/api/v1/facilities/${branch.id}`)
      .expect(404);
    await db.ref('facilities',branch.id).update({status:'PUBLISHED',reviewDueAt:new Date(Date.now()-1000)});
    await supertest(app.getHttpServer())
      .get(`/api/v1/facilities/${branch.id}`)
      .expect(404);
  });
  it("rejects malformed JSON and oversized body without reporting success", async () => {
    await supertest(app.getHttpServer())
      .post("/api/v1/anatomy/search")
      .set("Content-Type", "application/json")
      .send("{invalid")
      .expect(400);
    await supertest(app.getHttpServer())
      .post("/api/v1/anatomy/search")
      .send({ query: "x".repeat(300000) })
      .expect(413);
  });
  it('serializes concurrent note revisions and unique article slugs',async()=>{
    const responses=await Promise.all(['left','right'].map(text=>supertest(app.getHttpServer()).patch(`/api/v1/notes/${noteId}`).set(auth(a)).set('If-Match','"2"').send({text,anatomyId:null})));
    expect(responses.map(r=>r.status).sort()).toEqual([200,409]);
    const body={title:'SYNTHETIC unique',summary:'Fixture',sections:[{heading:'Fixture',text:'Fixture'}],sources:[{title:'Fixture',url:'https://example.com',accessedAt:new Date().toISOString()}]};
    const slug=`unique-${randomUUID()}`;
    const creates=await Promise.all([1,2].map(()=>supertest(app.getHttpServer()).post('/api/v1/editor/articles').set(auth(a)).send({slug,locale:'vi',body})));
    expect(creates.map(r=>r.status).sort()).toEqual([201,409]);
  });
  it('enforces the 100 scene counter under competing inserts and replays concurrent keys',async()=>{
    const user=(await db.get('users',a.id))!;const req={user} as AuthRequest;const controller=app.get(PrivateController);
    const lesson=await controller.createLesson(req,{title:'SYNTHETIC race',description:''});
    await db.ref('lessons',lesson.id).update({sceneCount:99});
    const attempts=await Promise.allSettled([1,2].map(()=>controller.addScene(req,lesson.id,initialScene(asset),randomUUID())));
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    expect(attempts.find(r=>r.status==='rejected')).toMatchObject({reason:{status:422}});
    expect((await db.get('lessons',lesson.id))?.sceneCount).toBe(100);
    const second=await controller.createLesson(req,{title:'SYNTHETIC replay',description:''}),key=randomUUID();
    const replay=await Promise.all([1,2].map(()=>controller.addScene(req,second.id,initialScene(asset),key)));
    expect(replay[0]).toEqual(replay[1]);expect((await db.get('lessons',second.id))?.sceneCount).toBe(1);
  });
  it('preserves contract-valid article and manifest payloads beyond 1 MiB and detects corruption',async()=>{
    const body=articleBodySchema.parse({title:'SYNTHETIC large',summary:'Fixture',sections:Array.from({length:30},()=>({heading:'Fixture',text:'界'.repeat(20000)})),sources:[{title:'Fixture',url:'https://example.com',accessedAt:new Date().toISOString()}]});
    expect(Buffer.byteLength(JSON.stringify(body))).toBeGreaterThan(1048576);
    const original=(await db.get('revisions',revisionId))!;const largeId=randomUUID();await db.put('revisions',{...original,id:largeId,body});
    expect((await db.get('revisions',largeId))?.body).toEqual(body);
    const manifest=assetManifestSchema.parse({...fixtureManifest,id:randomUUID(),clips:[],structures:Array.from({length:10000},(_,n)=>({...fixtureManifest.structures[0],meshName:`mesh-${n}`,anatomyId:`structure-${n}`,label:'界'.repeat(160)}))});
    expect(Buffer.byteLength(JSON.stringify(manifest))).toBeGreaterThan(1048576);
    const assetRow=(await db.get('assets',asset.id))!;await db.put('assets',{...assetRow,id:manifest.id,manifest,objectKey:`test/${manifest.id}`});
    expect((await db.get('assets',manifest.id))?.manifest).toEqual(manifest);
    const stored=(await db.ref('revisions',largeId).get()).data()!;await db.firestore.collection('payloads').doc(`${stored.bodyPayload.hash}-0`).update({bytes:Buffer.from('corrupt')});
    await expect(db.get('revisions',largeId)).rejects.toMatchObject({status:503});
  },60000);
  it('searches substrings, empty input, expired filtering and fails explicitly at capacity',async()=>{
    const prefix=`qa-${randomUUID()}`;const now=new Date(Date.now()+86400000);
    await db.put('anatomy',{id:prefix,systemId:'qa',nameVi:'SYNTHETIC Tâm thất',nameEn:'Ventricle',laterality:'none',published:true,reviewDueAt:now,grams:searchGrams('SYNTHETIC Tâm thất Ventricle')});
    const controller=app.get(PublicController);
    expect((await controller.search({query:'TRIC',locale:'en',limit:100})).items.some(r=>r.id===prefix)).toBe(true);
    expect((await controller.search({query:'',locale:'vi',limit:100})).items.length).toBeGreaterThan(0);
    await db.ref('anatomy',prefix).update({reviewDueAt:new Date(0)});
    expect((await controller.search({query:'TRIC',locale:'en',limit:100})).items.some(r=>r.id===prefix)).toBe(false);
    const queryToken=randomUUID().slice(0,8),gram=queryToken.slice(0,3);
    for(let start=0;start<1025;start+=400){const batch=db.firestore.batch();for(let n=start;n<Math.min(1025,start+400);n++){const id=`capacity-${queryToken}-${String(n).padStart(4,'0')}`;batch.set(db.ref('articleSearch',id),{id,slug:id,locale:'en',title:`${gram}x`,summary:'Fixture',reviewDueAt:now,grams:[gram],revisionId:randomUUID()});}await batch.commit();}
    await expect(controller.knowledge({query:queryToken,locale:'en',limit:1})).rejects.toMatchObject({status:503,response:{code:'SEARCH_CAPACITY_EXCEEDED'}});
  });
  it('denies anonymous and authenticated browser Firestore reads and writes',async()=>{
    const endpoint=`http://${firestoreHost}/v1/projects/demo-humanscope/databases/(default)/documents/notes/${noteId}`;
    for(const token of [null,a.idToken]){const headers:Record<string,string>={'Content-Type':'application/json'};if(token)headers.Authorization=`Bearer ${token}`;expect((await fetch(endpoint,{headers})).status).toBe(403);expect((await fetch(endpoint,{method:'PATCH',headers,body:JSON.stringify({fields:{text:{stringValue:'unauthorized'}}})})).status).toBe(403);}
  });
  it('rejects verified old ID tokens during the provider revoke-all propagation window',async()=>{
    const account=await login();
    // Persist the cutoff while Firebase still accepts the token: model the window
    // before remote revokeRefreshTokens completes, without mocking Firebase verification.
    await db.ref('users',account.id).update({sessionGeneration:1,sessionsRevokedAt:new Date()});
    await supertest(app.getHttpServer()).post('/auth/session').set(auth(account)).send({idToken:account.idToken}).expect(401);
  });
  it('never revives an identical revoked session cookie',async()=>{
    const account=await login();
    await supertest(app.getHttpServer()).delete('/auth/session').set(auth(account)).expect(200);
    const cookie=account.cookie.slice(account.cookie.indexOf('=')+1);
    const mint=vi.spyOn(app.get(Identity).auth,'createSessionCookie').mockResolvedValue(cookie);
    try {await supertest(app.getHttpServer()).post('/auth/session').set(auth(account)).send({idToken:account.idToken}).expect(401);}
    finally {mint.mockRestore();}
  });
  it('counts a full anatomy catalog without the 1024 search candidate limit',async()=>{
    const systemId=`qa-catalog-${randomUUID()}`,prefix=randomUUID();
    const row={id:`${prefix}-0`,systemId,nameVi:'SYNTHETIC catalog',nameEn:null,laterality:'none',published:true,reviewDueAt:new Date(Date.now()+86400000),grams:searchGrams('SYNTHETIC catalog')};
    await db.put('anatomy',row);
    // Remaining fixture rows belong to the catalog created through the repository.
    for(let start=1;start<1026;start+=400){const batch=db.firestore.batch();for(let n=start;n<Math.min(1026,start+400);n++)batch.set(db.ref('anatomy',`${prefix}-${n}`),{...row,id:`${prefix}-${n}`});await batch.commit();}
    const result=await app.get(PublicController).systems();expect(result.items.find(r=>r.id===systemId)?.count).toBe(1026);
  });
  it('revoke-all advances session generation and immediately rejects an older session',async()=>{
    const account=await login();const user=(await db.get('users',account.id))!;
    await app.get(AuthController).revokeAll({user} as AuthRequest,{idToken:account.idToken});
    expect((await db.get('users',account.id))?.sessionGeneration).toBe(1);
    expect((await db.get('users',account.id))?.sessionsRevokedAt).toBeInstanceOf(Date);
    await supertest(app.getHttpServer()).get('/api/v1/me').set(auth(account)).expect(401);
  });
  it("revokes current session in registry and denies subsequent access", async () => {
    await supertest(app.getHttpServer())
      .delete("/auth/session")
      .set(auth(a))
      .expect(200);
    await supertest(app.getHttpServer())
      .get("/api/v1/me")
      .set(auth(a))
      .expect(401);
  });
});

describe('account integration', () => {
  const settings = { displayName: 'Account fixture', studyRole: 'student', timezone: 'Asia/Ho_Chi_Minh', reducedMotion: true, revision: 0 };
  it('requires authentication and exposes no session identifiers', async () => {
    await supertest(app.getHttpServer()).get('/api/v1/me/account').expect(401);
    const user = await login();
    const view = await supertest(app.getHttpServer()).get('/api/v1/me/account').set(auth(user)).expect(200);
    expect(view.body.id).toBe(user.id);
    expect(view.body.sessions.some((s: { current: boolean }) => s.current)).toBe(true);
    for (const session of view.body.sessions) expect(Object.keys(session).sort()).toEqual(['current', 'expiresAt', 'lastSeenAt']);
    expect(view.body.capabilities.billing).toBe(false);
  });
  it('persists only the owner settings, rejects CSRF and revision conflicts', async () => {
    const owner = await login();
    const other = await login();
    await supertest(app.getHttpServer()).patch('/api/v1/me/account').set('Cookie', owner.cookie).send(settings).expect(403);
    await supertest(app.getHttpServer()).patch('/api/v1/me/account').set(auth(owner)).send({ ...settings, roles: ['ADMIN'] }).expect(400);
    const updated = await supertest(app.getHttpServer()).patch('/api/v1/me/account').set(auth(owner)).send(settings).expect(200);
    expect(updated.body.revision).toBe(1);
    await supertest(app.getHttpServer()).patch('/api/v1/me/account').set(auth(owner)).send({ ...settings, displayName: 'Stale overwrite' }).expect(409);
    const view = await supertest(app.getHttpServer()).get('/api/v1/me/account').set(auth(owner)).expect(200);
    expect(view.body.displayName).toBe(settings.displayName);
    expect(view.body.reducedMotion).toBe(true);
    const untouched = await supertest(app.getHttpServer()).get('/api/v1/me/account').set(auth(other)).expect(200);
    expect(untouched.body.revision).toBe(0);
    expect(untouched.body.displayName).not.toBe(settings.displayName);
  });
});

describe('account session controls', () => {
  it('requires same-user recent verification before revoking all sessions', async () => {
    const owner = await login();
    const other = await login();
    await supertest(app.getHttpServer()).post('/auth/revoke-all').set(auth(owner)).send({ idToken: other.idToken }).expect(403);
    await supertest(app.getHttpServer()).get('/api/v1/me/account').set(auth(owner)).expect(200);
    await supertest(app.getHttpServer()).post('/auth/revoke-all').set(auth(owner)).send({ idToken: owner.idToken }).expect(201);
    await supertest(app.getHttpServer()).get('/api/v1/me/account').set(auth(owner)).expect(401);
    await supertest(app.getHttpServer()).get('/api/v1/me/account').set(auth(other)).expect(200);
  });
});

describe('owned pagination', () => {
  beforeAll(async () => {
    // A fresh application instance gives this suite an independent rate-limit window.
    // Keep the production limiter enabled; never raise it to fit a test runner.
    await app.close();
    app=await createApp(readConfig({NODE_ENV:'test',FIRESTORE_EMULATOR_HOST:firestoreHost,FIREBASE_AUTH_EMULATOR_HOST:authHost,FIREBASE_PROJECT_ID:'demo-humanscope',APP_ORIGIN:origin}));
    await app.listen(0,'127.0.0.1');db=app.get(Database);
  });
  it('returns all 125 records with tied timestamps, rejects foreign cursors and recovers deleted anchors', async () => {
    const owner=await login(), other=await login();
    const createdAt=new Date('2026-01-01T00:00:00Z');
    const batch=db.firestore.batch();
    const ids=Array.from({length:125},()=>randomUUID());
    for(const id of ids) batch.set(db.ref('notes',id),{id,ownerId:owner.id,text:'Synthetic pagination note',anatomyId:null,revision:1,createdAt,updatedAt:createdAt});
    await batch.commit();
    const first=await supertest(app.getHttpServer()).get('/api/v1/notes?limit=100').set(auth(owner)).expect(200);
    expect(first.body.items).toHaveLength(100);
    const cursor=first.body.nextCursor as string;
    const second=await supertest(app.getHttpServer()).get('/api/v1/notes').query({cursor,limit:100}).set(auth(owner)).expect(200);
    expect(second.body.items).toHaveLength(25); expect(second.body.nextCursor).toBeNull();
    expect(new Set([...first.body.items,...second.body.items].map((row:{id:string})=>row.id)).size).toBe(125);
    await supertest(app.getHttpServer()).get('/api/v1/notes').query({cursor}).set(auth(other)).expect(400);
    await supertest(app.getHttpServer()).get('/api/v1/lessons').query({cursor}).set(auth(owner)).expect(400);
    await supertest(app.getHttpServer()).get('/api/v1/notes?limit=101').set(auth(owner)).expect(400);
    await supertest(app.getHttpServer()).get('/api/v1/notes?cursor=invalid').set(auth(owner)).expect(400);
    await db.ref('notes',first.body.items.at(-1).id).delete();
    await supertest(app.getHttpServer()).get('/api/v1/notes').query({cursor}).set(auth(owner)).expect(409);
  });
  it('sorts review pages by due time before limiting and excludes unpublished quizzes without reading payloads', async () => {
    const owner=await login(), quizId=randomUUID();
    await db.ref('quizzes',quizId).set({id:quizId,title:'Synthetic review',revision:1,status:'PUBLISHED',reviewDueAt:new Date(Date.now()+86400000),questionsPayload:{hash:'corrupt-on-purpose',count:1,bytes:1}});
    const batch=db.firestore.batch();
    for(let i=0;i<105;i++) {
      const id=String(i).padStart(64,'0');
      batch.set(db.ref('learningReviews',id),{id,userId:owner.id,quizId,quizRevision:1,schedule:{policy:'practice-intervals-v1',step:0,dueAt:new Date(Date.UTC(2026,0,1)+i*86400000).toISOString()},updatedAt:new Date()});
    }
    await batch.commit();
    const first=await supertest(app.getHttpServer()).get('/api/v1/me/reviews?limit=100').set(auth(owner)).expect(200);
    expect(first.body.items).toHaveLength(100);expect(first.body.items[0].schedule.dueAt).toBe('2026-01-01T00:00:00.000Z');
    const last=await supertest(app.getHttpServer()).get('/api/v1/me/reviews').query({cursor:first.body.nextCursor}).set(auth(owner)).expect(200);
    expect(last.body.items).toHaveLength(5);expect(last.body.nextCursor).toBeNull();
    await db.ref('quizzes',quizId).update({status:'WITHDRAWN'});
    const hidden=await supertest(app.getHttpServer()).get('/api/v1/me/reviews?limit=100').set(auth(owner)).expect(200);
    expect(hidden.body.items).toEqual([]);expect(hidden.body.nextCursor).toBeTruthy();
  });
});

describe('personal data export', () => {
  it('requires recent same-user identity and exports all pages without internal credentials', async () => {
    const owner=await login(), other=await login();
    const id=randomUUID(),lesson=randomUUID();
    await db.put('notes',{id,ownerId:owner.id,text:'Synthetic private export',anatomyId:null,revision:1,createdAt:new Date(),updatedAt:new Date()});
    await db.put('lessons',{id:lesson,ownerId:other.id,title:'Other lesson',description:'',revision:1,createdAt:new Date(),sceneCount:0});
    await supertest(app.getHttpServer()).post('/api/v1/me/account/export').send({}).expect(401);
    await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set('Cookie',owner.cookie).send({kind:'notes',idToken:owner.idToken}).expect(403);
    await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(owner)).send({kind:'notes',idToken:other.idToken}).expect(403);
    const response=await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(owner)).send({kind:'notes',idToken:owner.idToken}).expect(201);
    expect(response.body.items).toHaveLength(1);expect(response.body.items[0].text).toBe('Synthetic private export');
    expect(response.body.items[0]).not.toHaveProperty('ownerId');
    await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(owner)).send({kind:'scenes',lessonId:lesson,idToken:owner.idToken}).expect(404);
    await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(owner)).send({kind:'sessions',idToken:owner.idToken}).expect(400);
  });
});

describe('EDU-DIR private teaching workflow',()=>{
 it('saves an ordered lesson, retries exactly once, isolates owners, strips presenter notes and exports content',async()=>{
  const teacher=await login(),outsider=await login(),key=randomUUID();
  const create=()=>supertest(app.getHttpServer()).post('/api/v1/lessons').set(auth(teacher)).set('Idempotency-Key',key).send({title:'Teaching fixture',description:''});
  const first=await create().expect(201),again=await create().expect(201);expect(again.body.id).toBe(first.body.id);
  const input={title:'Teaching fixture',description:'Synthetic lesson',objectives:['Observe'],blocks:[{id:randomUUID(),kind:'text',title:'A',text:'Visible content',speakerNotes:'PRIVATE ONLY'},{id:randomUUID(),kind:'text',title:'B',text:'Second part',speakerNotes:''}]};
  const saveKey=randomUUID(),path=`/api/v1/lessons/${first.body.id}`;
  await supertest(app.getHttpServer()).patch(path).set('Cookie',teacher.cookie).set('If-Match','"1"').send(input).expect(403);
  await supertest(app.getHttpServer()).patch(path).set(auth(outsider)).set('If-Match','"1"').send(input).expect(404);
  const save=()=>supertest(app.getHttpServer()).patch(path).set(auth(teacher)).set('If-Match','"1"').set('Idempotency-Key',saveKey).send(input);
  const saved=await save().expect(200);expect(saved.body.revision).toBe(2);expect((await save().expect(200)).body).toEqual(saved.body);
  await supertest(app.getHttpServer()).patch(path).set(auth(teacher)).set('If-Match','"1"').send(input).expect(409);
  const opened=await supertest(app.getHttpServer()).get(path).set(auth(teacher)).expect(200);expect(opened.body.blocks.map((b:{title:string})=>b.title)).toEqual(['A','B']);expect(opened.body.blocks[0].speakerNotes).toBe('PRIVATE ONLY');
  const presented=await supertest(app.getHttpServer()).get(path+'/presentation').set(auth(teacher)).expect(200);expect(JSON.stringify(presented.body)).not.toContain('PRIVATE ONLY');
  await supertest(app.getHttpServer()).get(path+'/presentation').set(auth(outsider)).expect(404);
  const exported=await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(teacher)).send({kind:'lessons',idToken:teacher.idToken}).expect(201);expect(exported.body.items[0].blocks).toEqual(input.blocks);
 });
});

describe('EDU-DIR classroom access and immutable assignments',()=>{
 it('enforces owner/student/outsider/revoked access, freezes lesson and isolates results',async()=>{
  const teacher=await login(),student=await login(),outsider=await login();
  const createKey=randomUUID();const create=()=>supertest(app.getHttpServer()).post('/api/v1/classes').set(auth(teacher)).set('Idempotency-Key',createKey).send({title:'Synthetic class'});
  const cls=(await create().expect(201)).body;expect((await create().expect(201)).body.id).toBe(cls.id);
  const base=`/api/v1/classes/${cls.id}`;
  await supertest(app.getHttpServer()).get(base).set(auth(outsider)).expect(404);
  const oldInvite=(await supertest(app.getHttpServer()).post(base+'/invites').set(auth(teacher)).send({}).expect(201)).body;
  const invite=(await supertest(app.getHttpServer()).post(base+'/invites').set(auth(teacher)).send({}).expect(201)).body;
  await supertest(app.getHttpServer()).post(base+'/join').set(auth(student)).send({token:oldInvite.token,displayName:'Student'}).expect(404);
  await supertest(app.getHttpServer()).post(base+'/join').set(auth(student)).send({token:invite.token,displayName:'Student'}).expect(201);
  await supertest(app.getHttpServer()).post(base+'/invites').set(auth(student)).send({}).expect(404);
  const lesson=(await supertest(app.getHttpServer()).post('/api/v1/lessons').set(auth(teacher)).send({title:'Version one',description:''}).expect(201)).body;
  const content={title:'Version two',description:'',objectives:['Learn'],blocks:[{id:randomUUID(),kind:'text',title:'Only old content',text:'Immutable',speakerNotes:'SECRET TEACHER NOTES'}]};
  await supertest(app.getHttpServer()).patch(`/api/v1/lessons/${lesson.id}`).set(auth(teacher)).set('If-Match','"1"').send(content).expect(200);
  const key=randomUUID(),assign=()=>supertest(app.getHttpServer()).post(base+'/assignments').set(auth(teacher)).set('Idempotency-Key',key).send({lessonId:lesson.id,lessonRevision:2,dueAt:null});
  const assigned=(await assign().expect(201)).body;expect((await assign().expect(201)).body.id).toBe(assigned.id);
  await supertest(app.getHttpServer()).patch(`/api/v1/lessons/${lesson.id}`).set(auth(teacher)).set('If-Match','"2"').send({...content,title:'Version three'}).expect(200);
  const path=base+'/assignments/'+assigned.id;const opened=await supertest(app.getHttpServer()).get(path).set(auth(student)).expect(200);expect(opened.body.content.title).toBe('Version two');expect(JSON.stringify(opened.body)).not.toContain('SECRET TEACHER NOTES');
  await supertest(app.getHttpServer()).get(path).set(auth(outsider)).expect(404);
  const submit=()=>supertest(app.getHttpServer()).post(path+'/submissions').set(auth(student)).send({reflection:'My synthetic reflection'});
  const submitted=await submit().expect(201);expect((await submit().expect(201)).body.createdAt).toEqual(submitted.body.createdAt);
  await supertest(app.getHttpServer()).get(base+'/results/'+assigned.id).set(auth(student)).expect(404);
  const results=await supertest(app.getHttpServer()).get(base+'/results/'+assigned.id).set(auth(teacher)).expect(200);expect(results.body.items[0].displayName).toBe('Student');expect(results.body.items[0].reflection).toBe('My synthetic reflection');
  const exported=await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(student)).send({kind:'teachingSubmissions',idToken:student.idToken}).expect(201);expect(exported.body.items[0].reflection).toBe('My synthetic reflection');
  await supertest(app.getHttpServer()).delete(base+'/members/'+student.id).set(auth(teacher)).send({}).expect(200);
  await supertest(app.getHttpServer()).get(path).set(auth(student)).expect(404);
  await supertest(app.getHttpServer()).post(path+'/submissions').set(auth(student)).send({reflection:'My synthetic reflection'}).expect(404);
  await supertest(app.getHttpServer()).post(base+'/join').set(auth(student)).send({token:invite.token,displayName:'Student'}).expect(403);
 });
});

describe('EDU-DIR private learning position',()=>{
 it('saves whitelisted progress only to its owner and includes it in personal export',async()=>{
  const learner=await login(),other=await login(),position={schemaVersion:1,unitRevision:'2026-10-01',topicId:'heart-failure',level:'medical',step:2};
  await supertest(app.getHttpServer()).put('/api/v1/me/learning-position').send(position).expect(401);
  await supertest(app.getHttpServer()).put('/api/v1/me/learning-position').set(auth(learner)).send({...position,notes:'not allowed'}).expect(400);
  await supertest(app.getHttpServer()).put('/api/v1/me/learning-position').set(auth(learner)).send(position).expect(200);
  expect((await supertest(app.getHttpServer()).get('/api/v1/me/learning-position').set(auth(learner)).expect(200)).body.position).toEqual(position);
  expect((await supertest(app.getHttpServer()).get('/api/v1/me/learning-position').set(auth(other)).expect(200)).body.position).toBeNull();
  const exported=await supertest(app.getHttpServer()).post('/api/v1/me/account/export').set(auth(learner)).send({kind:'learningPosition',idToken:learner.idToken}).expect(201);expect(exported.body.items).toEqual([position]);
 });
});
