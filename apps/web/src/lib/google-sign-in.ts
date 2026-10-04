import { validGoogleCredential } from "./google-one-tap";
import type { Auth, AuthProvider, UserCredential } from "firebase/auth";
export type GoogleSignInClient = {
  popup: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
};
const loadGoogleSdk = () => Promise.all([import("firebase/app"), import("firebase/auth")]);
export async function prepareGoogleSignIn(googleCredential?: string, loadSdk = loadGoogleSdk): Promise<GoogleSignInClient> {
  if (googleCredential !== undefined && !validGoogleCredential(googleCredential)) throw new Error("INVALID_LOGIN");
  const [{ initializeApp, getApps }, sdk] = await loadSdk();
  const app = getApps()[0] ?? initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  });
  const auth: Auth = sdk.getAuth(app);
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "true" && !auth.emulatorConfig)
    sdk.connectAuthEmulator(auth, "http://127.0.0.1:9199", { disableWarnings: true });
  await sdk.setPersistence(auth, sdk.inMemoryPersistence);
  const provider: AuthProvider = new sdk.GoogleAuthProvider();
  return { popup: () => googleCredential === undefined ? sdk.signInWithPopup(auth, provider) : sdk.signInWithCredential(auth, sdk.GoogleAuthProvider.credential(googleCredential)), signOut: () => sdk.signOut(auth) };
}

let activeAttempt = false;

// Invoke from a click handler: popup() runs synchronously, before the first await.
export async function completeGoogleSignIn(client: GoogleSignInClient, session: {
  isActive: () => boolean;
  csrf: () => Promise<unknown>;
  exchange: (idToken: string) => Promise<unknown>;
}): Promise<boolean> {
  if (activeAttempt) throw { code: "auth/popup-already-open" };
  activeAttempt = true;
  let sessionCreated = false;
  try {
    const credential = await client.popup();
    if (!session.isActive()) return false;
    const idToken = await credential.user.getIdToken();
    if (!session.isActive()) return false;
    await session.csrf();
    if (!session.isActive()) return false;
    await session.exchange(idToken);
    sessionCreated = true;
    return session.isActive();
  } finally {
    try {
      await client.signOut();
    } catch (error) {
      // The server cookie is already durable; do not falsely report a failed sign-in.
      // Firebase uses memory-only persistence, so no provider token survives reload.
      if (!sessionCreated) throw error;
    } finally {
      activeAttempt = false;
    }
  }
}
export function googleSignInError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request")
    return "Bạn đã đóng cửa sổ Google. Chọn đăng nhập để thử lại.";
  if (code === "auth/popup-already-open")
    return "Một cửa sổ đăng nhập Google vẫn đang mở. Hoàn tất hoặc đóng cửa sổ đó rồi thử lại.";
  if (code === "auth/popup-blocked")
    return "Trình duyệt đã chặn cửa sổ Google. Cho phép cửa sổ bật lên cho trang này rồi thử lại.";
  if (code === "auth/network-request-failed")
    return "Chưa kết nối được Google. Kiểm tra kết nối mạng rồi thử lại.";
  if (["auth/operation-not-allowed", "auth/unauthorized-domain", "auth/invalid-api-key", "auth/configuration-not-found"].includes(code))
    return "Đăng nhập Google chưa sẵn sàng. Bạn có thể tiếp tục xem nội dung công khai và thử lại sau.";
  return "Chưa hoàn tất đăng nhập. Hãy thử lại; bạn vẫn có thể khám phá nội dung công khai.";
}
