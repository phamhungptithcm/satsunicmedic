import { expect, it, vi } from "vitest";
import { AuthController, type Identity } from "../apps/api/src/identity";
type Response = Parameters<AuthController["session"]>[1];
function setup(provider: string | undefined, environment = "production") {
  const db = { get: vi.fn().mockResolvedValue(null), transaction: vi.fn(async (fn: (tx: object) => unknown) => fn({})), put: vi.fn().mockResolvedValue(undefined) };
  const auth = { createSessionCookie: vi.fn().mockResolvedValue("fixture-cookie") };
  const identity = { config: { NODE_ENV: environment }, recent: vi.fn().mockResolvedValue({ uid: "fixture-uid", auth_time: Date.now() / 1000, firebase: provider ? { sign_in_provider: provider } : undefined }), db, auth, cookieName: "hs_session", cookieOptions: {} } as unknown as Identity;
  const res = { cookie: vi.fn() } as unknown as Response;
  return { controller: new AuthController(identity), identity, db, auth, res };
}
it.each(["password", "custom", "anonymous", undefined])("rejects verified %s provider before reading or mutating identity", async (provider) => {
  const { controller, db, auth, res } = setup(provider);
  await expect(controller.session({ idToken: "fixture-token" }, res)).rejects.toThrowError(expect.objectContaining({ status: 403 }));
  expect(db.get).not.toHaveBeenCalled(); expect(db.transaction).not.toHaveBeenCalled();
  expect(auth.createSessionCookie).not.toHaveBeenCalled(); expect(res.cookie).not.toHaveBeenCalled();
});
it("accepts verified Google provider into the existing session registry", async () => {
  const { controller, db, auth, res } = setup("google.com");
  expect(await controller.session({ idToken: "fixture-token" }, res)).toEqual({ authenticated: true });
  expect(auth.createSessionCookie).toHaveBeenCalledOnce(); expect(db.transaction).toHaveBeenCalledOnce();
  expect(res.cookie).toHaveBeenCalledOnce();
});
it("retains explicit password fixtures in the test environment", async () => {
  const { controller, res } = setup("password", "test");
  expect(await controller.session({ idToken: "fixture-token" }, res)).toEqual({ authenticated: true });
});
