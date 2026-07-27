"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useData } from "../../../components/data-provider";
import { useRecord, useRecordType } from "../../../components/hooks";
import { RecordForm } from "../../../components/record-form";
import { EmptyState, Loading, PageHeader } from "../../../components/ui";
import { formatFieldValue, formatWhen } from "../../../lib/display";
import { deleteRecord } from "../../../lib/service/records";

export default function RecordDetailPage() {
  const params = useParams<{ recordId: string }>();
  const router = useRouter();
  const { ready, refresh, toast } = useData();
  const { data: record, loading: lr } = useRecord(params.recordId);
  const { data: type, loading: lt } = useRecordType(record?.typeId ?? "");
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!ready || lr || (record && lt)) return <Loading />;
  if (!record || !type) {
    return (
      <EmptyState
        emoji="🤔"
        title="기록을 찾을 수 없어요"
        action={
          <Link className="btn btn-ghost" href="/">
            홈으로
          </Link>
        }
      />
    );
  }

  if (editing) {
    return (
      <div>
        <PageHeader title="기록 수정" sub={type.name} back />
        <RecordForm type={type} record={record} />
      </div>
    );
  }

  async function doDelete() {
    await deleteRecord(record!.id);
    refresh();
    toast("삭제했어요");
    router.push(`/type/${type!.id}`);
  }

  return (
    <div>
      <PageHeader
        title={`${type.icon ?? "🗂️"} ${type.name}`}
        sub={formatWhen(record.occurredAt)}
        back
        action={
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(true)}>
            편집
          </button>
        }
      />

      <div className="card">
        <div className="detail-rows">
          {record.title && (
            <div className="detail-row">
              <span className="detail-key">제목</span>
              <span className="detail-val" style={{ fontWeight: 600 }}>
                {record.title}
              </span>
            </div>
          )}
          {type.fields.map((f) => (
            <div className="detail-row" key={f.key}>
              <span className="detail-key">{f.label}</span>
              <span className="detail-val">{formatFieldValue(f, record.data[f.key])}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {confirming ? (
          <div className="card" style={{ padding: 16 }}>
            <p style={{ marginTop: 0 }}>이 기록을 삭제할까요?</p>
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setConfirming(false)}>
                취소
              </button>
              <button className="btn btn-danger btn-block" type="button" onClick={doDelete}>
                삭제
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-danger btn-block"
            type="button"
            onClick={() => setConfirming(true)}
          >
            기록 삭제
          </button>
        )}
      </div>
    </div>
  );
}
