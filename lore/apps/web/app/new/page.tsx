"use client";

import Link from "next/link";
import { useData } from "../../components/data-provider";
import { useRecordTypes } from "../../components/hooks";
import { EmptyState, Loading, PageHeader } from "../../components/ui";

export default function QuickAddPage() {
  const { ready } = useData();
  const { data: types } = useRecordTypes();

  if (!ready) return <Loading />;

  return (
    <div>
      <PageHeader title="무엇을 기록할까요?" />
      {types.length === 0 ? (
        <EmptyState
          emoji="🗂️"
          title="종류가 아직 없어요"
          sub="먼저 기록 종류를 하나 만들어 주세요."
          action={
            <Link className="btn btn-primary" href="/type/new">
              종류 만들기
            </Link>
          }
        />
      ) : (
        <div className="type-grid">
          {types.map((t) => (
            <Link key={t.id} href={`/type/${t.id}/record/new`} className="type-card">
              <span className="type-card-bar" style={{ background: t.color ?? "var(--primary)" }} />
              <span className="type-card-icon">{t.icon ?? "🗂️"}</span>
              <span className="type-card-name">{t.name}</span>
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
      )}
    </div>
  );
}
