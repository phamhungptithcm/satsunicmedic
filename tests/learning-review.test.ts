import { describe, expect, it } from 'vitest';
import { nextReviewSchedule, REVIEW_POLICY } from '../packages/contracts/src/learning-review';
const now = new Date('2026-03-08T06:30:00Z');
describe('experimental practice schedule', () => {
  it('starts both successful and unsuccessful practice at one day', () => {
    for (const correct of [true, false]) expect(nextReviewSchedule(null, correct, now)).toEqual({ policy: REVIEW_POLICY, step: 0, dueAt: '2026-03-09T06:30:00.000Z' });
  });
  it('uses elapsed UTC time across a daylight saving boundary', () => {
    expect(Date.parse(nextReviewSchedule(null, true, now).dueAt) - now.getTime()).toBe(86400000);
  });
  it('does not advance or postpone early correct practice', () => {
    const before = nextReviewSchedule(null, true, now);
    expect(nextReviewSchedule(before, true, now)).toEqual(before);
  });
  it('advances only due reviews through 3, 7, 14 and 30 days, then caps', () => {
    let state = nextReviewSchedule(null, true, now);
    for (const days of [3, 7, 14, 30, 30]) {
      const due = new Date(state.dueAt);
      state = nextReviewSchedule(state, true, due);
      expect(Date.parse(state.dueAt) - due.getTime()).toBe(days * 86400000);
    }
  });
  it('resets overdue incorrect practice to one day from submission', () => {
    const state = { policy: REVIEW_POLICY, step: 3, dueAt: '2026-03-01T00:00:00Z' };
    expect(nextReviewSchedule(state, false, now)).toEqual(nextReviewSchedule(null, false, now));
  });
  it('does not delay an imminent review after an incorrect early answer', () => {
    const state = { policy: REVIEW_POLICY, step: 3, dueAt: '2026-03-08T07:00:00.000Z' };
    expect(nextReviewSchedule(state, false, now)).toEqual({ ...state, step: 0 });
  });
  it('rejects corrupt dates and invalid persisted steps', () => {
    expect(() => nextReviewSchedule(null, true, new Date('invalid'))).toThrow();
    for (const step of [-1, 0.5, 5, NaN]) expect(() => nextReviewSchedule({ policy: REVIEW_POLICY, step, dueAt: now.toISOString() }, true, now)).toThrow();
    expect(() => nextReviewSchedule({ policy: REVIEW_POLICY, step: 0, dueAt: 'bad' }, true, now)).toThrow();
  });
});
