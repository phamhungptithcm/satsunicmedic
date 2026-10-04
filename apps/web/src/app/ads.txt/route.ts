import { adsTxt } from "../../lib/ads-policy";
export const dynamic = "force-dynamic";
export function GET() {
  const body = adsTxt(process.env.ADSENSE_PUBLISHER_ID);
  return new Response(body ?? "", { status: body ? 200 : 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
