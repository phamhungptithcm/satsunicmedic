import { expect, it, vi } from "vitest";
import { completeGoogleSignIn, googleSignInError } from "../apps/web/src/lib/google-sign-in";
type UserCredential = Awaited<ReturnType<Parameters<typeof completeGoogleSignIn>[0]["popup"]>>;
function setup() {
  const getIdToken = vi.fn().mockResolvedValue("fixture-id-token");
  const client = { popup: vi.fn().mockResolvedValue({ user: { getIdToken } } as unknown as UserCredential), signOut: vi.fn().mockResolvedValue(undefined) };
  const session = { isActive: () => true, csrf: vi.fn().mockResolvedValue(undefined), exchange: vi.fn().mockResolvedValue(undefined) };
  return { client, session, getIdToken };
}
it("opens Google synchronously from the click, then gets CSRF and creates the session", async () => {
  const { client, session } = setup();
  const pending = completeGoogleSignIn(client, session);
  expect(client.popup).toHaveBeenCalledOnce();
  expect(session.csrf).not.toHaveBeenCalled();
  expect(await pending).toBe(true);
  expect(session.csrf.mock.invocationCallOrder[0]).toBeLessThan(session.exchange.mock.invocationCallOrder[0]!);
  expect(session.exchange).toHaveBeenCalledWith("fixture-id-token");
  expect(client.signOut).toHaveBeenCalledOnce();
});
it("a late popup after closing never exchanges a token", async () => {
  const { client, session, getIdToken } = setup();
  session.isActive = () => false;
  expect(await completeGoogleSignIn(client, session)).toBe(false);
  expect(getIdToken).not.toHaveBeenCalled();
  expect(session.exchange).not.toHaveBeenCalled();
  expect(client.signOut).toHaveBeenCalledOnce();
});
it("cancellation while CSRF loads suppresses session creation", async () => {
  const { client, session } = setup();
  session.csrf.mockImplementation(async () => { session.isActive = () => false; });
  expect(await completeGoogleSignIn(client, session)).toBe(false);
  expect(session.exchange).not.toHaveBeenCalled();
  expect(client.signOut).toHaveBeenCalledOnce();
});
it.each(["csrf", "exchange"] as const)("clears Firebase auth when %s fails", async (step) => {
  const { client, session } = setup();
  session[step].mockRejectedValue(new Error("fixture failure"));
  await expect(completeGoogleSignIn(client, session)).rejects.toThrow("fixture failure");
  expect(client.signOut).toHaveBeenCalledOnce();
});
it("does not falsely report failure after the durable session is created", async () => {
  const { client, session } = setup();
  client.signOut.mockRejectedValue(new Error("cleanup failed"));
  expect(await completeGoogleSignIn(client, session)).toBe(true);
  expect(session.exchange).toHaveBeenCalledOnce();
});
it("serializes popup attempts so a closed dialog cannot sign out a newer login", async () => {
  const first = setup(); const second = setup();
  let resolve!: (value: UserCredential) => void;
  first.client.popup.mockReturnValue(new Promise<UserCredential>((done) => { resolve = done; }));
  const pending = completeGoogleSignIn(first.client, first.session);
  await expect(completeGoogleSignIn(second.client, second.session)).rejects.toEqual({ code: "auth/popup-already-open" });
  expect(second.client.popup).not.toHaveBeenCalled();
  expect(second.client.signOut).not.toHaveBeenCalled();
  resolve({ user: { getIdToken: async () => "fixture" } } as UserCredential);
  await pending;
  expect(await completeGoogleSignIn(second.client, second.session)).toBe(true);
});
it.each(["auth/popup-closed-by-user", "auth/popup-blocked", "auth/network-request-failed", "auth/operation-not-allowed", "auth/popup-already-open"])("maps %s to recoverable language without exposing internals", (code) => {
  expect(googleSignInError({ code })).not.toContain("auth/");
  expect(googleSignInError({ code })).toMatch(/thử lại/);
});
