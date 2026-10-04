import { z } from "zod";
export { learningScenarioSchema, heartBindingSchema, type LearningScenario, type HeartBinding } from "./pathophysiology.js";

export const localeSchema = z.enum(["vi", "en"]);
export const uuid = z.uuid();
const finite = z.number().finite();
const vec3 = z.tuple([finite, finite, finite]);
const identifier = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_.:-]+$/);
export const sceneSchema = z
  .object({
    schemaVersion: z.literal(1),
    assetVersionId: uuid,
    mappingVersion: z.int().positive(),
    selectedAnatomyId: identifier.nullable(),
    camera: z
      .object({ position: vec3, target: vec3, fov: finite.min(15).max(90) })
      .strict(),
    layers: z
      .array(
        z
          .object({
            id: identifier,
            visible: z.boolean(),
            opacity: finite.min(0).max(1),
          })
          .strict(),
      )
      .max(30),
    isolation: z.array(identifier).max(300),
    labels: z.boolean(),
    animation: z
      .object({
        clipId: identifier.nullable(),
        timeSeconds: finite.min(0).max(3600),
        playbackRate: finite.min(0.25).max(2),
        paused: z.boolean(),
      })
      .strict(),
    annotations: z
      .array(
        z
          .object({
            id: uuid,
            anatomyId: identifier,
            text: z.string().trim().min(1).max(1000),
            position: vec3,
          })
          .strict(),
      )
      .max(50),
  })
  .strict();
export type SceneSnapshot = z.infer<typeof sceneSchema>;

export const assetManifestSchema = z
  .object({
    id: uuid,
    mappingVersion: z.int().positive(),
    title: z.string().min(1).max(160),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    byteLength: z.int().positive().max(100_000_000),
    units: z.literal("meter"),
    up: z.literal("Y"),
    front: z.literal("Z"),
    layers: z
      .array(
        z
          .object({ id: identifier, label: z.string().min(1).max(100) })
          .strict(),
      )
      .min(1)
      .max(30),
    structures: z
      .array(
        z
          .object({
            meshName: identifier,
            anatomyId: identifier,
            layerId: identifier,
            label: z.string().min(1).max(160),
            laterality: z.enum(["left", "right", "midline", "none"]),
          })
          .strict(),
      )
      .min(1)
      .max(10000),
    clips: z
      .array(
        z
          .object({
            id: identifier,
            name: identifier,
            label: z.string().max(160),
            duration: finite.positive().max(3600),
            anatomyIds: z.array(identifier).min(1),
            reviewed: z.literal(true),
          })
          .strict(),
      )
      .max(30),
    camera: z
      .object({ position: vec3, target: vec3, fov: finite.min(15).max(90) })
      .strict(),
    license: z
      .object({
        attribution: z.string().min(1).max(1000),
        sourceUrl: z.url().startsWith("https://"),
        expiresAt: z.iso.datetime().nullable(),
        allowsPublicDisplay: z.literal(true),
        allowsPublicSharing: z.boolean(),
      })
      .strict(),
    review: z
      .object({
        reviewerId: uuid,
        reviewedAt: z.iso.datetime(),
        reviewDueAt: z.iso.datetime(),
        reviewedHash: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict(),
  })
  .strict()
  .superRefine((m, ctx) => {
    if (m.review.reviewedHash !== m.sha256)
      ctx.addIssue({
        code: "custom",
        message: "Review must bind the exact asset hash",
      });
    const layers = new Set(m.layers.map((x) => x.id));
    if (layers.size !== m.layers.length)
      ctx.addIssue({ code: "custom", message: "Duplicate layer ID" });
    const meshes = new Set<string>();
    for (const s of m.structures) {
      if (!layers.has(s.layerId) || meshes.has(s.meshName))
        ctx.addIssue({
          code: "custom",
          message: "Invalid or duplicate mesh mapping",
        });
      meshes.add(s.meshName);
    }
    const structures = new Set(m.structures.map((s) => s.anatomyId));
    if (new Set(m.clips.map((c) => c.id)).size !== m.clips.length)
      ctx.addIssue({ code: "custom", message: "Duplicate clip ID" });
    for (const c of m.clips)
      if (c.anatomyIds.some((id) => !structures.has(id)))
        ctx.addIssue({ code: "custom", message: "Unmapped animation anatomy" });
  });
export type AssetManifest = z.infer<typeof assetManifestSchema>;
export const searchSchema = z
  .object({
    query: z.string().trim().max(120),
    locale: localeSchema.default("vi"),
    limit: z.int().min(1).max(100).default(20),
  })
  .strict();
export const noteSchema = z
  .object({
    text: z.string().trim().min(1).max(5000),
    anatomyId: identifier.nullable(),
  })
  .strict();
export const lessonSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().max(2000),
  })
  .strict();
export const articleBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(1000),
    sections: z
      .array(
        z
          .object({
            heading: z.string().max(200),
            text: z.string().min(1).max(20000),
          })
          .strict(),
      )
      .min(1)
      .max(30),
    sources: z
      .array(
        z
          .object({
            title: z.string().min(1).max(300),
            url: z.url().startsWith("https://"),
            accessedAt: z.iso.datetime(),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict();
export type ArticleBody = z.infer<typeof articleBodySchema>;

export function isAssetCurrent(m: AssetManifest, now = new Date()): boolean {
  return (
    new Date(m.review.reviewedAt) <= now &&
    new Date(m.review.reviewDueAt) > now &&
    (!m.license.expiresAt || new Date(m.license.expiresAt) > now)
  );
}
export function validateSceneForAsset(
  scene: SceneSnapshot,
  asset: AssetManifest,
): boolean {
  const anatomy = new Set(asset.structures.map((s) => s.anatomyId));
  const layers = new Set(asset.layers.map((l) => l.id));
  const clip = asset.clips.find((c) => c.id === scene.animation.clipId);
  return (
    scene.assetVersionId === asset.id &&
    scene.mappingVersion === asset.mappingVersion &&
    (!scene.selectedAnatomyId || anatomy.has(scene.selectedAnatomyId)) &&
    new Set(scene.layers.map((l) => l.id)).size === scene.layers.length &&
    scene.layers.every((l) => layers.has(l.id)) &&
    scene.layers.length === layers.size &&
    scene.isolation.every((id) => anatomy.has(id)) &&
    scene.annotations.every((a) => anatomy.has(a.anatomyId)) &&
    (scene.animation.clipId === null
      ? scene.animation.timeSeconds === 0
      : !!clip && scene.animation.timeSeconds <= clip.duration)
  );
}

export const quizQuestionsSchema = z
  .array(
    z
      .object({
        id: uuid,
        prompt: z.string().min(1).max(2000),
        options: z
          .array(
            z
              .object({ id: identifier, label: z.string().min(1).max(1000) })
              .strict(),
          )
          .min(2)
          .max(8),
        correctOptionId: identifier,
        explanation: z.string().min(1).max(3000),
      })
      .strict(),
  )
  .min(1)
  .max(50)
  .superRefine((qs, ctx) => {
    if (new Set(qs.map((q) => q.id)).size !== qs.length)
      ctx.addIssue({ code: "custom", message: "Duplicate question" });
    for (const q of qs) {
      if (
        !q.options.some((o) => o.id === q.correctOptionId) ||
        new Set(q.options.map((o) => o.id)).size !== q.options.length
      )
        ctx.addIssue({ code: "custom", message: "Invalid options" });
    }
  });
export const attemptSchema = z
  .object({
    revision: z.int().positive(),
    answers: z
      .array(z.object({ questionId: uuid, optionId: identifier }).strict())
      .min(1)
      .max(50),
  })
  .strict()
  .superRefine((a, ctx) => {
    if (new Set(a.answers.map((v) => v.questionId)).size !== a.answers.length)
      ctx.addIssue({ code: "custom", message: "Duplicate answer" });
  });
export function gradeQuiz(
  questions: z.infer<typeof quizQuestionsSchema>,
  answers: z.infer<typeof attemptSchema>["answers"],
) {
  if (
    answers.length !== questions.length ||
    answers.some(
      (a) =>
        !questions.some(
          (q) =>
            q.id === a.questionId && q.options.some((o) => o.id === a.optionId),
        ),
    )
  )
    throw new Error("Invalid answer set");
  const feedback = questions.map((q) => ({
    questionId: q.id,
    correct:
      answers.find((a) => a.questionId === q.id)?.optionId ===
      q.correctOptionId,
    explanation: q.explanation,
  }));
  return {
    correct: feedback.filter((f) => f.correct).length,
    total: questions.length,
    feedback,
  };
}

export { accountSettingsSchema, accountUpdateSchema, studyRoleSchema } from './account.js';
export type { AccountSettings, AccountUpdate, AccountView } from './account.js';
export { nextReviewSchedule, REVIEW_POLICY } from './learning-review.js';
export type { ReviewSchedule, LearningReviewItem, LearningReviewList } from './learning-review.js';
export * from './directory.js';
export * from './teaching.js';
export * from './disease-directory.js';
export * from './body-snapshot.js';
export * from './classroom.js';
export * from './learning-position.js';
