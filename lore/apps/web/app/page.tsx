"use client";

import Link from "next/link";
import { useData } from "../components/data-provider";
import { useAllRecords, useRecordTypes } from "../components/hooks";
import { EmptyState, Loading } from "../components/ui";
import { formatWhen, recordHeadline } from "../lib/display";

export default function DashboardPage() {
  const { ready } = useData();
  const { data: types } = useRecordTypes();
  const { data: records } = useAllRecords();

  if (!ready) return <Loading />;

  const typeById = new Map(types.map((t) => [t.id, t]));
  const countByType = new Map<string, number>();
  for (const r of records) countByType.set(r.typeId, (countByType.get(r.typeId) ?? 0) + 1);

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const thisWeek = records.filter((r) => r.occurredAt >= weekAgo).length;
  const recent = records.slice(0, 8);

  return (
    <div>
      <div className="page-head">
        <div style={{ flex: 1 }}>
          <div className="page-title">내 기록</div>
          <div className="page-sub">내가 정의하고, 내 기기에 사는 데이터</div>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat">
          <div className="stat-label">기록 종류</div>
          <div className="stat-value">{types.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">전체 기록</div>
          <div className="stat-value">{records.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">최근 7일</div>
          <div className="stat-value">{thisWeek}</div>
        </div>
      </div>

      <div className="section-title">종류</div>
      <div className="type-grid">
        {types.map((t) => (
          <Link key={t.id} href={`/type/${t.id}`} className="type-card">
            <span className="type-card-bar" style={{ background: t.color ?? "var(--primary)" }} />
            <span className="type-card-icon">{t.icon ?? "🗂️"}</span>
            <span className="type-card-name">{t.name}</span>
            <span className="type-card-count">{countByType.get(t.id) ?? 0}개</span>
          </Link>
        ))}
        <Link
          href="/type/new"
          className="type-card"
          style={{
            justifyContent: "center",
            alignItems: "center",
            color: "var(--text-muted)",
            borderStyle: "dashed",
          }}
        >
          <span className="type-card-icon">＋</span>
          <span className="type-card-name" style={{ fontSize: 14 }}>
            새 종류
          </span>
        </Link>
      </div>

      <div className="section-title">최근 기록</div>
      {recent.length === 0 ? (
        <EmptyState
          emoji="✏️"
          title="아직 기록이 없어요"
          sub="아래 ‘기록’ 버튼으로 첫 기록을 남겨보세요."
        />
      ) : (
        <div className="list">
          {recent.map((r) => {
            const type = typeById.get(r.typeId);
            return (
              <Link key={r.id} href={`/record/${r.id}`} className="list-item">
                <span className="list-item-emoji">{type?.icon ?? "🗂️"}</span>
                <span className="list-item-main">
                  <span className="list-item-title">
                    {type ? recordHeadline(type, r) : "(알 수 없는 종류)"}
                  </span>
                  <span className="list-item-sub">
                    {type?.name} · {formatWhen(r.occurredAt)}
                  </span>
                </span>
                <span className="chevron">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
