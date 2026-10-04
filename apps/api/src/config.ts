import { z } from "zod";
export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const c = z
    .object({
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      PORT: z.coerce.number().int().min(1).max(65535).default(4186),
      APP_ORIGIN: z.url().default("http://127.0.0.1:4185"),
      FIRESTORE_EMULATOR_HOST: z.string().optional(),
      FIREBASE_PROJECT_ID: z.string().min(1).default("demo-humanscope"),
      FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
      COMMUNITY_INTAKE_ENABLED: z.enum(["true", "false"]).default("false"),
      ASSET_DELIVERY_ENABLED: z.enum(["true", "false"]).default("false"),
    })
    .parse({...env,FIREBASE_PROJECT_ID:env.MEDIC_FIREBASE_PROJECT_ID??env.FIREBASE_PROJECT_ID??env.GCLOUD_PROJECT});
  if (
    c.NODE_ENV === "production" &&
    (!c.APP_ORIGIN.startsWith("https://") ||
      c.FIREBASE_AUTH_EMULATOR_HOST ||
      c.FIRESTORE_EMULATOR_HOST ||
      c.FIREBASE_PROJECT_ID.startsWith("demo-"))
  )
    throw new Error("Unsafe production configuration");
  return c;
}
export type Config = ReturnType<typeof readConfig>;
export const CONFIG = Symbol("config");
