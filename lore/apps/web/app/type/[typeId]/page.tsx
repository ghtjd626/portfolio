"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useData } from "../../../components/data-provider";
import { useRecordsByType, useRecordType } from "../../../components/hooks";
import { Icon, TypeIcon } from "../../../components/icons";
import { EmptyState, Loading, PageHeader } from "../../../components/ui";
import { formatWhen, recordHeadline } from "../../../lib/display";

export default function TypeRecordsPage() {
  const params = useParams<{ typeId: string }>();
  const typeId = params.typeId;
  const { ready } = useData();
  const { data: type, loading } = useRecordType(typeId);
  const { data: records } = useRecordsByType(typeId);

  if (!ready || loading) return <Loading />;
  if (!type) {
    return (
      <EmptyState
        icon="tag"
        title="종류를 찾을 수 없어요"
        action={
          <Link className="btn btn-ghost" href="/">
            홈으로
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={type.name}
        sub={`${records.length}개 기록`}
        back
        leading={
          <span className="head-ico" style={{ color: type.color }}>
            <TypeIcon icon={type.icon} size={22} />
          </span>
        }
        action={
          <Link className="btn btn-ghost btn-sm" href={`/type/${type.id}/edit`}>
            편집
          </Link>
        }
      />

      {records.length === 0 ? (
        <EmptyState
          icon="pencil"
          title="첫 기록을 남겨보세요"
          action={
            <Link className="btn btn-primary" href={`/type/${type.id}/record/new`}>
              기록 추가
            </Link>
          }
        />
      ) : (
        <div className="list">
          {records.map((r) => (
            <Link key={r.id} href={`/record/${r.id}`} className="list-item">
              <span className="list-item-main">
                <span className="list-item-title">{recordHeadline(type, r)}</span>
                <span className="list-item-sub">{formatWhen(r.occurredAt)}</span>
              </span>
              <Icon name="chevronRight" size={18} className="chevron" />
            </Link>
          ))}
        </div>
      )}

      <Link className="fab" href={`/type/${type.id}/record/new`} aria-label="기록 추가">
        <Icon name="plus" size={26} strokeWidth={2} />
      </Link>
    </div>
  );
}
