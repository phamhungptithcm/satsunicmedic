export type AdConfig = { publisher: string; slot: string; slugs: string[]; cmpId: number };
export function adConfig(env: Record<string, string | undefined>): AdConfig | null {
  if (env.ADSENSE_ENABLED !== "true" || env.ADSENSE_SITE_APPROVED !== "true") return null;
  const publisher = env.ADSENSE_PUBLISHER_ID ?? "";
  const slot = env.ADSENSE_ARTICLE_SLOT_ID ?? "";
  const cmpId = Number(env.ADSENSE_CERTIFIED_CMP_ID);
  const slugs = (env.ADSENSE_ARTICLE_SLUGS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (!/^ca-pub-\d{16}$/.test(publisher) || !/^\d{10}$/.test(slot) || !Number.isInteger(cmpId) || cmpId < 1 || !slugs.length || slugs.some(s => !/^[a-z0-9-]{1,120}$/.test(s))) return null;
  return { publisher, slot, slugs, cmpId };
}
export function eligibleAdPath(config: AdConfig | null, path: string, hasSession: boolean, hasQuery: boolean) {
  if (!config || hasSession || hasQuery) return false;
  return config.slugs.some(slug => path === `/bai-viet/${slug}`);
}
export interface TcData {
  cmpId?: number;
  cmpStatus?: string;
  eventStatus?: string;
  listenerId?: number;
  gdprApplies?: boolean;
  tcString?: string;
  purpose?: { consents?: Record<number, boolean> };
  vendor?: { consents?: Record<number, boolean> };
}
// Deliberately conservative: require explicit consent even where GDPR does not
// apply; missing CMP, unknown territory, legitimate-interest-only or denial => off.
export function permitsAds(data: TcData | null | undefined, success: boolean, cmpId: number): boolean {
  if (!data || typeof data !== "object") return false;
  return success && data.cmpId === cmpId && data.cmpStatus === "loaded" &&
    ["tcloaded", "useractioncomplete"].includes(data.eventStatus ?? "") &&
    typeof data.gdprApplies === "boolean" && (typeof data.tcString === "string" && data.tcString.length > 0) &&
    data.vendor?.consents?.[755] === true &&
    [1, 2, 7, 9, 10].every(id => data.purpose?.consents?.[id] === true);
}
export function adsTxt(publisher: string | undefined) {
  return publisher && /^ca-pub-\d{16}$/.test(publisher)
    ? `google.com, ${publisher.slice(3)}, DIRECT, f08c47fec0942fa0\n` : null;
}
