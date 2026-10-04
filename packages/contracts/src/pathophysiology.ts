import { z } from "zod";

const id = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const text = z.string().min(1).max(2000);
export const learningScenarioSchema = z.object({
  id,
  revision: z.int().positive(),
  locale: z.literal("vi"),
  status: z.literal("draft"),
  title: text,
  englishTitle: text,
  aliases: z.array(text).max(20),
  objective: text,
  limitation: text,
  duration: z.number().finite().positive().max(120),
  stages: z.array(z.object({
    id,
    start: z.number().finite().nonnegative(),
    label: text,
    appearance: z.enum(["normal", "plaque", "occlusion", "injury"]),
    event: text,
    mechanism: text,
    consequence: text,
    sourceIds: z.array(id).min(1),
  }).strict()).min(2).max(8),
  sources: z.array(z.object({
    id,
    title: text,
    url: z.url().startsWith("https://"),
  }).strict()).min(1).max(20),
  structures: z.array(z.object({ id, label: text, description: text }).strict()).min(1).max(10),
  quiz: z.object({
    question: text,
    options: z.array(z.object({ id, label: text }).strict()).min(2).max(5),
    correctId: id,
    explanation: text,
    sourceIds: z.array(id).min(1),
  }).strict(),
}).strict().superRefine((scenario, context) => {
  const fail = (message: string) => context.addIssue({ code: "custom", message });
  for (const records of [scenario.stages, scenario.sources, scenario.structures, scenario.quiz.options]) {
    if (new Set(records.map(record => record.id)).size !== records.length) fail("Duplicate identifier");
  }
  if (scenario.stages[0]?.start !== 0 || scenario.stages[0]?.appearance !== "normal") fail("Normal baseline must start at zero");
  scenario.stages.forEach((stage, index) => {
    if (stage.start >= scenario.duration || (index > 0 && stage.start <= scenario.stages[index - 1]!.start)) fail("Invalid stage interval");
  });
  const sources = new Set(scenario.sources.map(source => source.id));
  for (const sourceId of [...scenario.stages.flatMap(stage => stage.sourceIds), ...scenario.quiz.sourceIds]) {
    if (!sources.has(sourceId)) fail("Missing source reference");
  }
  if (!scenario.quiz.options.some(option => option.id === scenario.quiz.correctId)) fail("Missing quiz answer");
});

export type LearningScenario = z.infer<typeof learningScenarioSchema>;

const point3 = z.tuple([z.number().finite().min(-100).max(100), z.number().finite().min(-100).max(100), z.number().finite().min(-100).max(100)]);
export const heartBindingSchema = z.object({
  schemaVersion: z.literal(1), id, sha256: z.string().regex(/^[a-f0-9]{64}$/),
  byteLength: z.int().positive().max(25_000_000),
  structures: z.array(z.object({ id, label: text, kind: z.enum(["wall", "artery", "great-vessel"]), sourceId: id.or(z.string().regex(/^FJ\d+$/)) }).strict()).min(1).max(40),
  flows: z.array(z.object({ id, points: z.array(point3).min(2).max(1000), method: z.literal("mesh-cross-section-centroids"), maxCrossSectionRadius: z.number().positive().max(2) }).strict()).min(1).max(10),
  occlusion: z.object({ segmentId: id, at: z.number().min(0.05).max(0.95) }).strict(),
  territory: z.null(), reviewStatus: z.literal("unreviewed"), coordinateNote: text,
  attribution: text, licenseUrl: z.url().startsWith("https://"), sourceUrl: z.url().startsWith("https://"),
}).strict().superRefine((binding, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });
  if (new Set(binding.structures.map(s => s.id)).size !== binding.structures.length || new Set(binding.flows.map(s => s.id)).size !== binding.flows.length) fail("Duplicate binding ID");
  for (const flow of binding.flows) {
    if (!binding.structures.some(s => s.id === flow.id && s.kind === "artery")) fail("Flow must reference an artery mesh");
    if (!flow.points.some((p, i) => i > 0 && p.some((v, axis) => Math.abs(v - flow.points[i - 1]![axis]!) > 0.000001))) fail("Zero-length centerline");
  }
  if (!binding.flows.some(flow => flow.id === binding.occlusion.segmentId)) fail("Missing occlusion flow");
});
export type HeartBinding = z.infer<typeof heartBindingSchema>;
