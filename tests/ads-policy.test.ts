import { describe, it, expect } from "vitest";
import { adConfig, eligibleAdPath, permitsAds, adsTxt, type TcData } from "../apps/web/src/lib/ads-policy";
const env = { ADSENSE_ENABLED: "true", ADSENSE_SITE_APPROVED: "true", ADSENSE_PUBLISHER_ID: "ca-pub-1234567890123456", ADSENSE_ARTICLE_SLOT_ID: "1234567890", ADSENSE_ARTICLE_SLUGS: "approved-anatomy", ADSENSE_CERTIFIED_CMP_ID: "300" };
const tc: TcData = { cmpId: 300, cmpStatus: "loaded", eventStatus: "useractioncomplete", gdprApplies: true, tcString: "synthetic-not-for-live-use", vendor: { consents: {755:true} }, purpose: {consents:{1:true,2:true,7:true,9:true,10:true}} };
describe("ad privacy boundaries", () => {
  it("requires enabled, approved, real-shaped IDs and CMP configuration", () => {
    expect(adConfig({})).toBeNull();
    for (const key of Object.keys(env)) expect(adConfig({...env,[key]:""})).toBeNull();
    expect(adConfig(env)).not.toBeNull();
    expect(adConfig({...env,ADSENSE_ARTICLE_SLUGS:"*"})).toBeNull();
    expect(adConfig({...env,ADSENSE_PUBLISHER_ID:"ca-pub-1\nmalicious"})).toBeNull();
  });
  it("only exact anonymous no-query article paths", () => {
    const c=adConfig(env);
    expect(eligibleAdPath(c,"/bai-viet/approved-anatomy",false,false)).toBe(true);
    for(const path of ["/","/hoc-tap","/auth/session","/bai-viet/other","/bai-viet/approved-anatomy/extra"])
      expect(eligibleAdPath(c,path,false,false)).toBe(false);
    expect(eligibleAdPath(c,"/bai-viet/approved-anatomy",true,false)).toBe(false);
    expect(eligibleAdPath(c,"/bai-viet/approved-anatomy",false,true)).toBe(false);
  });
  it("requires explicit purpose and vendor consent from configured CMP", () => {
    expect(permitsAds(tc,true,300)).toBe(true);
    expect(permitsAds(tc,false,300)).toBe(false);
    expect(permitsAds(null,false,300)).toBe(false);
    expect(permitsAds(undefined,true,300)).toBe(false);
    for (const denied of [{}, {...tc,cmpId:2}, {...tc,cmpStatus:"error"}, {...tc,eventStatus:"cmpuishown"}, {...tc,gdprApplies:undefined}, {...tc,tcString:""}, {...tc,vendor:{consents:{755:false}}}])
      expect(permitsAds(denied,true,300)).toBe(false);
    for(const id of [1,2,7,9,10]) expect(permitsAds({...tc,purpose:{consents:{...tc.purpose!.consents,[id]:false}}},true,300)).toBe(false);
  });
  it("never manufactures an ads.txt publisher", () => {
    expect(adsTxt(undefined)).toBeNull();
    expect(adsTxt("garbage")).toBeNull();
    expect(adsTxt(env.ADSENSE_PUBLISHER_ID)).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  });
});
