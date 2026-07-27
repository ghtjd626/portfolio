"use client";

import { useRef, useState } from "react";
import { useData } from "../../components/data-provider";
import { PageHeader } from "../../components/ui";
import { exportAll, importBundle } from "../../lib/service/export-import";
import { syncNow } from "../../lib/sync/sync";

export default function SettingsPage() {
  const { refresh, toast } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);

  async function onExport() {
    const bundle = await exportAll();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `lore-export-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("내보냈어요");
  }

  async function onImportFile(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      const res = await importBundle(parsed);
      refresh();
      toast(`가져왔어요 (종류 ${res.types} · 기록 ${res.records})`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "가져오기에 실패했어요");
    }
  }

  async function onSync() {
    setSyncing(true);
    const res = await syncNow();
    setSyncing(false);
    toast(res.message);
  }

  return (
    <div>
      <PageHeader title="설정" />

      <div className="section-title">동기화</div>
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="muted" style={{ fontSize: 14 }}>
          이 기기의 데이터는 항상 로컬에 먼저 저장돼요(오프라인 OK). 서버 동기화는 여러 기기를
          잇기 위한 것으로, 서버(PostgreSQL)가 준비되면 동작합니다.
        </div>
        <button className="btn btn-primary" type="button" onClick={onSync} disabled={syncing}>
          {syncing ? "동기화 중…" : "지금 동기화"}
        </button>
      </div>

      <div className="section-title">내 데이터 (소유 · 백업)</div>
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="muted" style={{ fontSize: 14 }}>
          내 기록은 내 것입니다. 언제든 JSON 한 파일로 통째로 내보내고 다시 가져올 수 있어요.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" type="button" onClick={onExport}>
            내보내기 (JSON)
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            가져오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImportFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="section-title">정보</div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Lore</div>
        <div className="muted" style={{ fontSize: 14 }}>
          내가 직접 정의하고, 내 기기에 살아있고, 오프라인에서도 즉시 동작하는 개인 기록 플랫폼.
          가계부·일기·할 일은 하드코딩이 아니라 사용자 정의 &ldquo;기록 종류&rdquo;의 인스턴스입니다.
        </div>
      </div>
    </div>
  );
}
