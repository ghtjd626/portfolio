import { compileRecordSchema, type FieldDef } from "@lore/schema-core";

// 웹에서도 schema-core가 "동일한 코드"로 동작함을 보이는 최소 스모크(ADR-0004).
const demoFields: FieldDef[] = [
  { key: "title", label: "내용", type: "text", required: true },
  { key: "amount", label: "금액", type: "money", required: true },
];

export default function Home() {
  const ok = compileRecordSchema(demoFields).safeParse({
    title: "점심",
    amount: { amount: 12000, currency: "KRW" },
  }).success;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Lore</h1>
      <p>내가 직접 정의하는 local-first 개인 기록 플랫폼 — Phase 0 스캐폴드.</p>
      <p>schema-core 스모크: {ok ? "통과 ✅" : "실패 ❌"}</p>
    </main>
  );
}
