"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useData } from "../../../../components/data-provider";
import { useRecordType } from "../../../../components/hooks";
import { RecordTypeForm } from "../../../../components/record-type-form";
import { EmptyState, Loading, PageHeader } from "../../../../components/ui";
import { deleteRecordType } from "../../../../lib/service/record-types";

export default function EditTypePage() {
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
      <PageHeader title="종류 편집" sub={type.name} back />
      <RecordTypeForm existing={type} />
      <DeleteTypeZone typeId={type.id} name={type.name} />
    </div>
  );
}

function DeleteTypeZone({ typeId, name }: { typeId: string; name: string }) {
  const router = useRouter();
  const { refresh, toast } = useData();
  const [confirming, setConfirming] = useState(false);

  async function doDelete() {
    await deleteRecordType(typeId);
    refresh();
    toast(`‘${name}’ 종류를 삭제했어요`);
    router.push("/");
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div className="section-title" style={{ color: "var(--danger)" }}>
        위험 구역
      </div>
      {confirming ? (
        <div className="card" style={{ padding: 16 }}>
          <p style={{ marginTop: 0 }}>
            정말 삭제할까요? 이 종류는 목록에서 사라져요. (소프트 삭제라 내보내기엔 남습니다)
          </p>
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
        <button className="btn btn-danger btn-block" type="button" onClick={() => setConfirming(true)}>
          이 종류 삭제
        </button>
      )}
    </div>
  );
}
