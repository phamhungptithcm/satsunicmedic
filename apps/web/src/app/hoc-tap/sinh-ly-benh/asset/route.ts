import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { canPreviewScenario } from "../../../../lib/pathophysiology";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!canPreviewScenario(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED)) return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(join(process.cwd(), process.env.NODE_ENV === "development" ? "preview-assets/heart/heart.glb" : "preview-assets/discovery/heart.glb"));
    if (bytes.length !== 5355044 || createHash("sha256").update(bytes).digest("hex") !== "6438ad759f81fdbc05c5910a1f4b7970bc193633695bff16c1b1e7928e5c2784") throw new Error("Invalid reference asset");
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "model/gltf-binary", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
