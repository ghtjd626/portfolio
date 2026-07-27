import type { FieldDef } from "./field";

/**
 * 필드 타입별 "빈 값" — 동적 폼의 초기 상태를 만드는 데 쓴다.
 * 웹·모바일이 공유하는 순수 함수(프레임워크 비의존).
 */
export function emptyValueForField(field: FieldDef): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "multiselect":
      return [];
    default:
      return undefined;
  }
}

/** 기록 종류의 필드들로 빈 `data` 객체를 만든다. */
export function emptyRecordData(fields: FieldDef[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    data[field.key] = emptyValueForField(field);
  }
  return data;
}
