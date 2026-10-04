"use client";

import { createContext, useContext, useLayoutEffect, useState, type Dispatch, type MouseEvent, type ReactNode, type SetStateAction } from "react";
import Header from "./header";

type ShellOptions = {
  authenticated?: boolean;
  onLogin?: () => void;
  guardNavigation?: (event: MouseEvent<HTMLDivElement>) => void;
  fullDocument?: boolean;
};
const ShellContext = createContext<Dispatch<SetStateAction<ShellOptions>> | null>(null);

// Route-owned callbacks expire with their owner; the header itself stays mounted.
export function useSiteShell({ authenticated, onLogin, guardNavigation, fullDocument }: ShellOptions) {
  const register = useContext(ShellContext);
  useLayoutEffect(() => {
    if (!register) return;
    const options = { authenticated, onLogin, guardNavigation, fullDocument };
    register(options);
    return () => register(current => current === options ? {} : current);
  }, [register, authenticated, onLogin, guardNavigation, fullDocument]);
}

export function ArticleNavigation({ fullDocument }: { fullDocument: boolean }) {
  useSiteShell({ fullDocument });
  return null;
}

export default function SiteShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const [options, setOptions] = useState<ShellOptions>({});
  function captureNavigation(event: MouseEvent<HTMLDivElement>) {
    options.guardNavigation?.(event);
    if (!options.fullDocument || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
    // A removed ad script can keep running: leave its document even from footer links.
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(url.href);
  }
  return (
    <ShellContext.Provider value={setOptions}>
      <div className="site-shell" onClickCapture={captureNavigation}>
        <Header authenticated={options.authenticated} onLogin={options.onLogin} fullDocument={options.fullDocument} />
        <div className="site-content">{children}</div>
        {footer}
      </div>
    </ShellContext.Provider>
  );
}
