import { useSyncExternalStore } from "react";

/** next/navigation 대체 — 해시 기반 라우터. */
function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return window.location.hash.replace(/^#/, "") || "/";
}
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, currentPath, () => "/");
}

export function useRouter() {
  return {
    push: (href: string) => {
      window.location.hash = href;
    },
    replace: (href: string) => {
      const base = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", `${base}#${href}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

// 라우터(App)가 렌더 직전에 현재 params를 채운다.
let _params: Record<string, string> = {};
export function __setParams(p: Record<string, string>) {
  _params = p;
}
export function useParams<T = Record<string, string>>(): T {
  return _params as T;
}
