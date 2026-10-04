/** Experimental practice schedule, not a measure of clinical competence. */
export const REVIEW_POLICY = 'practice-intervals-v1' as const;
const INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
const DAY_MS = 86_400_000;
export interface ReviewSchedule {
  policy: typeof REVIEW_POLICY;
  step: number;
  dueAt: string;
}
export interface LearningReviewItem {
  quizId: string;
  quizRevision: number;
  title: string;
  schedule: ReviewSchedule;
}
export interface LearningReviewList { items: LearningReviewItem[]; truncated: boolean; nextCursor?: string | null }

export function nextReviewSchedule(previous: ReviewSchedule | null, allCorrect: boolean, now: Date): ReviewSchedule {
  const time = now.getTime();
  if (!Number.isFinite(time)) throw new Error('Invalid review time');
  if (previous && (previous.policy !== REVIEW_POLICY || !Number.isInteger(previous.step) ||
      previous.step < 0 || previous.step >= INTERVAL_DAYS.length || !Number.isFinite(Date.parse(previous.dueAt)))) {
    throw new Error('Invalid review schedule');
  }
  // Repeating immediately after seeing feedback must not advance the interval.
  if (previous && allCorrect && time < Date.parse(previous.dueAt)) return { ...previous };
  const step = allCorrect && previous ? Math.min(previous.step + 1, INTERVAL_DAYS.length - 1) : 0;
  // Early incorrect practice may bring a review forward, never postpone it.
  const due = !allCorrect && previous && Date.parse(previous.dueAt) > time ? Math.min(Date.parse(previous.dueAt), time + DAY_MS) : time + INTERVAL_DAYS[step]! * DAY_MS;
  return { policy: REVIEW_POLICY, step, dueAt: new Date(Math.max(time, due)).toISOString() };
}
