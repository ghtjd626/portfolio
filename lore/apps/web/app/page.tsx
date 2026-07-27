"use client";

import Link from "next/link";
import { useData } from "../components/data-provider";
import { useAllRecords, useRecordTypes } from "../components/hooks";
import { LifeStream } from "../components/life-stream";
import { TypeTile } from "../components/type-tile";
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
  const recent = records.slice(0, 6);
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title" style={{ fontSize: 24 }}>
            내 기록
          </div>
          <div className="eyebrow" style={{ marginTop: 5 }}>
            {today}
          </div>
        </div>
        <Link className="btn btn-primary btn-sm" href="/new">
          ＋ 기록
        </Link>
      </div>

      <LifeStream types={types} records={records} />

      <div className="stat-strip reveal d1" style={{ marginTop: 16 }}>
        <div className="stat-cell">
          <div className="k">종류</div>
          <div className="v">{types.length}</div>
        </div>
        <div className="stat-cell">
          <div className="k">전체 기록</div>
          <div className="v">{records.length}</div>
        </div>
        <div className="stat-cell">
          <div className="k">최근 7일</div>
          <div className="v">{thisWeek}</div>
        </div>
      </div>

      <div className="section-title">종류</div>
      <div className="type-grid reveal d2">
        {types.map((t) => (
          <TypeTile key={t.id} type={t} count={countByType.get(t.id) ?? 0} href={`/type/${t.id}`} />
        ))}
        <Link href="/type/new" className="type-tile dashed">
          <span style={{ fontSize: 22 }}>＋</span>
          <span className="type-tile-name" style={{ fontSize: 13 }}>
            새 종류
          </span>
        </Link>
      </div>

      <div className="section-title">최근 기록</div>
      {recent.length === 0 ? (
        <EmptyState
          emoji="✏️"
          title="아직 기록이 없어요"
          sub="위 ‘＋ 기록’으로 첫 기록을 남겨보세요."
        />
      ) : (
        <div className="list reveal d3">
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
