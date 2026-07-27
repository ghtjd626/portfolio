import type { FieldDef } from "./field";

/**
 * FieldDef[] 자체의 정합성 검사 — "기록 종류"를 저장하기 전에 쓴다.
 * (기록 값의 검증은 compileRecordSchema. 이건 "정의"의 검증.)
 * 반환: 사람이 읽는 오류 메시지 배열(빈 배열이면 유효).
 */
export function validateFields(fields: FieldDef[]): string[] {
  const errors: string[] = [];
  if (fields.length === 0) {
    errors.push("필드를 최소 1개 이상 정의해야 합니다.");
  }
  const seen = new Set<string>();
  fields.forEach((field, i) => {
    const where = field.label || field.key || `필드 ${i + 1}`;
    if (!field.key) {
      errors.push(`${where}: key가 비었습니다.`);
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.key)) {
      errors.push(`${where}: key는 영문/숫자/밑줄만 가능합니다(영문으로 시작).`);
    } else if (seen.has(field.key)) {
      errors.push(`중복된 key: ${field.key}`);
    } else {
      seen.add(field.key);
    }
    if (!field.label) {
      errors.push(`${field.key || `필드 ${i + 1}`}: 라벨이 비었습니다.`);
    }
    if (
      (field.type === "select" || field.type === "multiselect") &&
      field.options.length === 0
    ) {
      errors.push(`${where}: 선택 항목이 최소 1개 필요합니다.`);
    }
  });
  return errors;
}
