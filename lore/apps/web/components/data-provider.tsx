"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ensurePresetsSeeded } from "../lib/service/presets";

/**
 * 앱 전역 데이터 상태.
 * - local-first라 데이터 소스는 브라우저(IndexedDB). 서버 왕복이 없어 즉시성이 기본.
 * - `revision`을 bump 하면 데이터 훅들이 다시 읽는다(쓰기 후 낙관적 갱신).
 */
interface DataCtx {
  ready: boolean;
  revision: number;
  refresh: () => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const refresh = useCallback(() => setRevision((r) => r + 1), []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200);
  }, []);

  useEffect(() => {
    ensurePresetsSeeded()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  return (
    <Ctx.Provider value={{ ready, revision, refresh, toast }}>
      {children}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </Ctx.Provider>
  );
}

export function useData(): DataCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
