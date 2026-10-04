import { isDiscoveryEnabled } from "../../../../../lib/discovery-release";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fullBodyAnatomy } from "../../../../../lib/full-body-anatomy";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_request: Request, context: {
    params: Promise<{
        layer: string;
    }>;
}) {
    if (!isDiscoveryEnabled(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED))
        return new Response(null, { status: 404 });
    const { layer } = await context.params;
    if (!Object.hasOwn(fullBodyAnatomy.assets, layer))
        return new Response(null, { status: 404 });
    const expected = fullBodyAnatomy.assets[layer]!;
    for (const root of [process.cwd(), resolve(process.cwd(), "../..")]) {
        try {
            const path = resolve(root, process.env.NODE_ENV === "development" ? `.ai/local/free-anatomy/full-body-v2/${layer}.glb` : `preview-assets/discovery/full-body-v2/${layer}.glb`);
            if ((await stat(path)).size !== expected.byteLength)
                continue;
            const data = await readFile(path);
            if (createHash("sha256").update(data).digest("hex") !== expected.sha256)
                continue;
            return new Response(new Uint8Array(data), { headers: { "Content-Type": "model/gltf-binary", "Content-Length": String(data.length), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" } });
        }
        catch { /* Fail closed: no fallback to an unverified model. */ }
    }
    return new Response(null, { status: 404 });
}
