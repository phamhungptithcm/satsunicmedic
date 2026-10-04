import { describe, expect, it } from "vitest";
import { authFailure } from "../apps/api/src/identity";
import { readConfig } from "../apps/api/src/config";
import { checkCsrf, checkOrigin, digest } from "../apps/api/src/security";
import { expectedRevision } from "../apps/api/src/editor";
type Request = Parameters<typeof checkCsrf>[0];
const origin = "https://example.com";
function req(headers: Record<string, string>, cookie?: string) {
  return {
    get: (n: string) => headers[n],
    cookies: { hs_csrf: cookie },
  } as unknown as Request;
}
describe("security boundaries", () => {
  it("rejects development identity and emulator in production", () => {
    expect(() =>
      readConfig({
        NODE_ENV: "production",
        APP_ORIGIN: origin,
      }),
    ).toThrow();
    expect(() =>
      readConfig({
        NODE_ENV: "production",
        APP_ORIGIN: origin,
        FIREBASE_PROJECT_ID: "satsunicmedic",
        FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
      }),
    ).toThrow();
  });
  it("requires exact origin, not suffix or absent origin", () => {
    expect(() =>
      checkOrigin(req({ origin: "https://example.com.evil.test" }), origin),
    ).toThrow();
    expect(() => checkOrigin(req({}), origin)).toThrow();
  });
  it("requires matching bounded CSRF tokens", () => {
    const token = "a".repeat(64);
    expect(() =>
      checkCsrf(req({ origin, "x-csrf-token": token }, token), origin),
    ).not.toThrow();
    expect(() =>
      checkCsrf(req({ origin, "x-csrf-token": "b".repeat(64) }, token), origin),
    ).toThrow();
    expect(() =>
      checkCsrf(req({ origin, "x-csrf-token": token }), origin),
    ).toThrow();
  });
  it("requires optimistic concurrency revision", () => {
    expect(expectedRevision('"8"')).toBe(8);
    for (const value of [undefined, "8", '"0"', "*", '"-1"'])
      expect(() => expectedRevision(value)).toThrow();
  });
  it("hashes registry credentials", () => {
    expect(digest("secret")).not.toContain("secret");
    expect(digest("secret")).toHaveLength(64);
  });
});

it("distinguishes revoked identity from identity provider failure",()=>{
 expect(()=>authFailure({code:'auth/id-token-revoked'},'REAUTH_REQUIRED')).toThrowError(expect.objectContaining({status:401}));
 expect(()=>authFailure({code:'app/network-error'},'REAUTH_REQUIRED')).toThrowError(expect.objectContaining({status:503}));
});
