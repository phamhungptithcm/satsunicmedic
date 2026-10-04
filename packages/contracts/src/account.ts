import { z } from 'zod';
export const studyRoleSchema = z.enum(['student', 'self', 'teacher', 'unspecified']);
export const accountSettingsSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  studyRole: studyRoleSchema,
  timezone: z.string().min(1).max(80).refine(value => {
    try { new Intl.DateTimeFormat('vi-VN', { timeZone: value }).format(); return true; }
    catch { return false; }
  }, 'Invalid timezone'),
  reducedMotion: z.boolean(),
}).strict();
export const accountUpdateSchema = accountSettingsSchema.extend({ revision: z.int().nonnegative() }).strict();
export type AccountSettings = z.infer<typeof accountSettingsSchema>;
export type AccountUpdate = z.infer<typeof accountUpdateSchema>;
export interface AccountView {
  id: string;
  displayName: string;
  email: string | null;
  googleLinked: boolean;
  studyRole: z.infer<typeof studyRoleSchema>;
  timezone: string;
  reducedMotion: boolean;
  revision: number;
  sessions: { current: boolean; lastSeenAt: string; expiresAt: string }[];
  sessionsTruncated: boolean;
  capabilities: { billing: boolean; export: boolean; deletion: boolean; notifications: boolean };
}
