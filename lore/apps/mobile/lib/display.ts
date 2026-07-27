import type { FieldDef, Money } from "@lore/schema-core";
import type { RecordRow, TypeRow } from "./store";

export function formatFieldValue(field: FieldDef, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  switch (field.type) {
    case "money": {
      const m = value as Money;
      const amt = m.amount.toLocaleString("ko-KR");
      return m.currency === "KRW" ? `₩${amt}` : `${amt} ${m.currency}`;
    }
    case "boolean":
      return value ? "예" : "아니오";
    case "select":
      return field.options.find((o) => o.value === value)?.label ?? String(value);
    case "multiselect":
      return (value as string[])
        .map((v) => field.options.find((o) => o.value === v)?.label ?? v)
        .join(", ");
    case "number":
      return (value as number).toLocaleString("ko-KR");
    default:
      return String(value);
  }
}

export function recordHeadline(type: TypeRow, record: RecordRow): string {
  if (record.title?.trim()) return record.title.trim();
  for (const f of type.fields) {
    const raw = record.data[f.key];
    if (raw !== undefined && raw !== null && raw !== "") return formatFieldValue(f, raw);
  }
  return "(제목 없음)";
}

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
