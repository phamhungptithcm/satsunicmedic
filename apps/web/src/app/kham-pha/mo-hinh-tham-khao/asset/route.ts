import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { canPreviewReferenceAnatomy, referenceAnatomy } from "../../../../lib/reference-anatomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  if (!canPreviewReferenceAnatomy(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED)) return new Response(null, { status: 404 });
  // No request URL or user-controlled filesystem path.
  for (const root of [process.cwd(), resolve(process.cwd(), "../..")]) {
    try {
      const path = resolve(root, process.env.NODE_ENV === "development" ? ".ai/local/free-anatomy/review-v2/candidate.glb" : "preview-assets/discovery/reference.glb");
      if ((await stat(path)).size !== referenceAnatomy.byteLength) continue;
      const bytes = await readFile(path);
      if (createHash("sha256").update(bytes).digest("hex") !== referenceAnatomy.sha256) continue;
      return new Response(new Uint8Array(bytes), { headers: {
        "Content-Type": "model/gltf-binary", "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      } });
    } catch { /* Missing/invalid candidate stays unavailable. */ }
  }
  return new Response(null, { status: 404 });
}
