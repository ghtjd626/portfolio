"use client";

import Link from "next/link";
import { useData } from "../../components/data-provider";
import { useRecordTypes } from "../../components/hooks";
import { TypeTile } from "../../components/type-tile";
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
            <TypeTile key={t.id} type={t} href={`/type/${t.id}/record/new`} />
          ))}
          <Link href="/type/new" className="type-tile dashed">
            <span style={{ fontSize: 22 }}>＋</span>
            <span className="type-tile-name" style={{ fontSize: 13 }}>
              새 종류
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
