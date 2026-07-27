import type { FieldDef } from "./field";

/**
 * RecordType — "기록 종류"의 정의(가계부, 일기, 할 일 …).
 *
 * 물리적으로는 record_types 테이블의 한 "행"에 대응한다(ADR-0001).
 * 종류가 코드가 아니라 데이터이므로, 새 종류를 추가해도 물리 스키마는 그대로다.
 */
export interface RecordType {
  id: string;
  /** 표시 이름. 예: "가계부". */
  name: string;
  /** 아이콘 이름/이모지(선택). */
  icon?: string;
  /** 이 종류가 갖는 필드들. records.data는 이 정의를 따른다. */
  fields: FieldDef[];
}
