import { daoGetMeta, daoSetMeta } from "../store/dao";
import { createRecordType, listRecordTypes, type RecordTypeInput } from "./record-types";

/**
 * 프리셋 도메인 — 가계부·할 일·일기.
 *
 * 이것들은 "특별한 코드"가 아니라 **미리 정의된 기록 종류(데이터)** 다(논지 A의 증명).
 * 앱 어디에도 "가계부 전용" 코드는 없다. 그저 FieldDef[]일 뿐.
 */
export const PRESETS: RecordTypeInput[] = [
  {
    name: "가계부",
    icon: "wallet",
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
    icon: "checkCircle",
    color: "#2563eb",
    fields: [
      { key: "title", label: "할 일", type: "text", required: true },
      { key: "done", label: "완료", type: "boolean" },
      { key: "due", label: "마감", type: "date" },
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
    icon: "book",
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
          { value: "awful", label: "최악" },
        ],
      },
      { key: "body", label: "본문", type: "longtext", required: true },
      {
        key: "weather",
        label: "날씨",
        type: "select",
        options: [
          { value: "sunny", label: "맑음" },
          { value: "cloudy", label: "흐림" },
          { value: "rain", label: "비" },
          { value: "snow", label: "눈" },
        ],
      },
    ],
  },
];

/** 최초 1회 프리셋을 심는다. 사용자가 지운 뒤 다시 심지 않도록 meta 플래그로 가드. */
export async function ensurePresetsSeeded(): Promise<boolean> {
  const seeded = await daoGetMeta<boolean>("presetsSeeded");
  if (seeded) return false;
  const existing = await listRecordTypes();
  if (existing.length === 0) {
    for (const preset of PRESETS) {
      await createRecordType(preset);
    }
  }
  await daoSetMeta("presetsSeeded", true);
  return true;
}
