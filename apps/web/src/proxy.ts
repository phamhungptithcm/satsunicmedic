import { NextResponse, type NextRequest } from "next/server";
import { adConfig, eligibleAdPath } from "./lib/ads-policy";
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const development = process.env.NODE_ENV !== "production";
  const adPage = eligibleAdPath(adConfig(process.env), request.nextUrl.pathname,
    request.cookies.has("__Host-hs_session") || request.cookies.has("hs_session"), Boolean(request.nextUrl.search));
  // Only anonymous, explicitly reviewed article paths. Live creative/CMP CSP
  // compatibility is a release check, never a reason to relax global policy.
  const adResources = adPage ? " https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://www.gstatic.com" : "";
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; img-src 'self' data: blob:${adResources}; font-src 'self'; connect-src 'self' https://accounts.google.com/gsi/ https://identitytoolkit.googleapis.com https://securetoken.googleapis.com${adResources}${development ? " http://127.0.0.1:9199 ws://127.0.0.1:4185" : ""}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; frame-src https://accounts.google.com/gsi/ https://satsunicmedic.firebaseapp.com${adResources}; worker-src 'self' blob:;`;
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}
export const config = {
  matcher: ["/((?!api/|auth/|_next/static|_next/image|favicon.ico).*)"],
};
