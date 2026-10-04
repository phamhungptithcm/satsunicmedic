"use client";
import { useEffect, useRef, useState } from "react";
import { permitsAds, type AdConfig, type TcData } from "../lib/ads-policy";
type AdQueue = Array<Record<string, never>> & { requestNonPersonalizedAds?: number };
type TcfApi = (command: string, version: number, callback: (data: TcData, success: boolean) => void, parameter?: number) => void;
type AdWindow = Window & { __tcfapi?: TcfApi; adsbygoogle?: AdQueue };
export default function ArticleAd({ config, nonce }: { config: AdConfig; nonce: string }) {
  const slot = useRef<HTMLModElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const win = window as AdWindow;
    const api = win.__tcfapi;
    if (!api || !nonce) return;
    let active = true;
    let injected = false;
    let started = false;
    let listenerId: number | undefined;
    let script: HTMLScriptElement | undefined;
    let observer: MutationObserver | undefined;
    const clear = () => {
      observer?.disconnect();
      script?.remove();
      slot.current?.replaceChildren();
    };
    const callback = (data: TcData, success: boolean) => {
      if (!active) return;
      listenerId = data?.listenerId ?? listenerId;
      if (!permitsAds(data, success, config.cmpId)) {
        clear();
        setVisible(false);
        // Removing a script does not unload its code. Reload on withdrawal to
        // clear the advertising runtime; the CMP must persist the new choice.
        if (injected) window.location.reload();
        return;
      }
      if (started || !slot.current) return;
      started = true;
      const queue = win.adsbygoogle ?? ([] as unknown as AdQueue);
      queue.requestNonPersonalizedAds = 1;
      win.adsbygoogle = queue;
      observer = new MutationObserver(() => {
        if (active) setVisible(slot.current?.getAttribute("data-ad-status") === "filled");
      });
      observer.observe(slot.current, { attributes: true, attributeFilter: ["data-ad-status"] });
      script = document.createElement("script");
      script.async = true;
      script.nonce = nonce;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisher}`;
      script.onload = () => { if (active) win.adsbygoogle?.push({}); };
      script.onerror = () => { clear(); setVisible(false); };
      injected = true;
      document.head.appendChild(script);
    };
    try { api("addEventListener", 2, callback); } catch { clear(); }
    return () => {
      active = false;
      clear();
      if (listenerId !== undefined) {
        try { api("removeEventListener", 2, () => {}, listenerId); } catch { /* CMP failure must not break navigation. */ }
      }
    };
  }, [config.cmpId, config.publisher, config.slot, nonce]);
  return (
    <aside aria-label="Quảng cáo" className="article-ad" style={{ minHeight: 125 }}>
      <small style={{ visibility: visible ? "visible" : "hidden" }}>Quảng cáo</small>
      <ins ref={slot} className="adsbygoogle" style={{ display: "block", minHeight: 100 }} data-ad-client={config.publisher} data-ad-slot={config.slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
