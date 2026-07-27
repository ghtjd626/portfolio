import type { FieldDef } from "@lore/schema-core";

/**
 * 프리셋 — 웹과 동일한 개념. "가계부"는 특별한 코드가 아니라 FieldDef[]일 뿐(논지 A).
 * 검증·폼 생성은 @lore/schema-core를 웹과 "같은 코드"로 공유한다(ADR-0004).
 */
export const PRESETS: { name: string; color: string; fields: FieldDef[] }[] = [
  {
    name: "가계부",
    color: "#16a34a",
    fields: [
      { key: "title", label: "내용", type: "text", required: true },
      { key: "amount", label: "금액", type: "money", required: true, defaultCurrency: "KRW" },
      {
        key: "category",
        label: "분류",
        type: "select",
        required: true,
        options: [
          { value: "food", label: "식비" },
          { value: "transport", label: "교통" },
          { value: "living", label: "생활" },
          { value: "culture", label: "문화" },
          { value: "etc", label: "기타" },
        ],
      },
      { key: "memo", label: "메모", type: "longtext" },
    ],
  },
  {
    name: "할 일",
    color: "#2563eb",
    fields: [
      { key: "title", label: "할 일", type: "text", required: true },
      { key: "done", label: "완료", type: "boolean" },
      {
        key: "priority",
        label: "우선순위",
        type: "select",
        options: [
          { value: "high", label: "높음" },
          { value: "normal", label: "보통" },
          { value: "low", label: "낮음" },
        ],
      },
    ],
  },
  {
    name: "일기",
    color: "#9333ea",
    fields: [
      {
        key: "mood",
        label: "기분",
        type: "select",
        required: true,
        options: [
          { value: "great", label: "최고" },
          { value: "good", label: "좋음" },
          { value: "soso", label: "보통" },
          { value: "bad", label: "나쁨" },
        ],
      },
      { key: "body", label: "본문", type: "longtext", required: true },
    ],
  },
];
