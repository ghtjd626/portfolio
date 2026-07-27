import type { FieldDef, Money } from "@lore/schema-core";
import type { LocalRecord, LocalRecordType } from "./store/entities";

/** 통화 표시. KRW는 ₩ 기호로. */
function formatMoney(m: Money): string {
  const amount = m.amount.toLocaleString("ko-KR");
  return m.currency === "KRW" ? `₩${amount}` : `${amount} ${m.currency}`;
}

/** 한 필드 값을 사람이 읽는 문자열로. 목록/상세 공용. */
export function formatFieldValue(field: FieldDef, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  switch (field.type) {
    case "money":
      return formatMoney(value as Money);
    case "boolean":
      return value ? "예" : "아니오";
    case "select": {
      const opt = field.options.find((o) => o.value === value);
      return opt?.label ?? String(value);
    }
    case "multiselect": {
      const values = value as string[];
      return values
        .map((v) => field.options.find((o) => o.value === v)?.label ?? v)
        .join(", ");
    }
    case "number":
      return (value as number).toLocaleString("ko-KR");
    case "date":
      return new Date(value as string).toLocaleDateString("ko-KR");
    case "datetime":
      return new Date(value as string).toLocaleString("ko-KR");
    default:
      return String(value);
  }
}

/** 기록의 대표 문구 — title이 있으면 그것, 없으면 첫 텍스트/선택 필드 값. */
export function recordHeadline(type: LocalRecordType, record: LocalRecord): string {
  if (record.title?.trim()) return record.title.trim();
  for (const field of type.fields) {
    const raw = record.data[field.key];
    if (raw !== undefined && raw !== null && raw !== "") {
      return formatFieldValue(field, raw);
    }
  }
  return "(제목 없음)";
}

/** occurredAt를 짧게 표시. */
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
