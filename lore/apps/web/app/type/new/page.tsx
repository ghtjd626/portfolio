"use client";

import { RecordTypeForm } from "../../../components/record-type-form";
import { PageHeader } from "../../../components/ui";

export default function NewTypePage() {
  return (
    <div>
      <PageHeader title="새 기록 종류" sub="필드를 원하는 대로 정의하세요" back />
      <RecordTypeForm />
    </div>
  );
}
