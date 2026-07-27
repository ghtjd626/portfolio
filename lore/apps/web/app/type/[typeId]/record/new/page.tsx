"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useData } from "../../../../../components/data-provider";
import { useRecordType } from "../../../../../components/hooks";
import { TypeIcon } from "../../../../../components/icons";
import { RecordForm } from "../../../../../components/record-form";
import { EmptyState, Loading, PageHeader } from "../../../../../components/ui";

export default function NewRecordPage() {
  const params = useParams<{ typeId: string }>();
  const { ready } = useData();
  const { data: type, loading } = useRecordType(params.typeId);

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
        title={`${type.name} 기록`}
        back
        leading={
          <span className="head-ico" style={{ color: type.color }}>
            <TypeIcon icon={type.icon} size={22} />
          </span>
        }
      />
      <RecordForm type={type} />
    </div>
  );
}
