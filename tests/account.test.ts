import { describe, expect, it } from 'vitest';
import { accountUpdateSchema } from '../packages/contracts/src/account';
const valid = { displayName: 'Người học', studyRole: 'student', timezone: 'Asia/Ho_Chi_Minh', reducedMotion: false, revision: 0 };
describe('account settings contract', () => {
  it('validates and trims an account update', () => expect(accountUpdateSchema.parse({ ...valid, displayName: ' Người học ' }).displayName).toBe('Người học'));
  it.each([{ displayName: ' ' }, { displayName: 'x'.repeat(81) }, { timezone: 'Unknown/Nowhere' }, { revision: -1 }, { revision: 1.5 }, { studyRole: 'admin' }, { roles: ['ADMIN'] }, { userId: 'another-user' }])('rejects invalid or privileged fields %j', patch => expect(accountUpdateSchema.safeParse({ ...valid, ...patch }).success).toBe(false));
});
