/**
 * FieldDef — 사용자가 정의하는 "기록 종류"의 필드 하나.
 *
 * 이 타입이 Lore의 핵심 논지(ADR-0001)를 코드로 구현한 지점이다:
 * 도메인(가계부/일기/…)을 하드코딩하지 않고, 필드 구조를 "데이터"로 표현한다.
 * FieldDef[]는 record_types.fields(JSONB)에 그대로 저장되고,
 * compileRecordSchema()가 이를 런타임 Zod 검증기로 컴파일한다(compile.ts).
 */

/** 지원하는 필드 종류. 새 종류는 여기에 추가하고 compile.ts에서 처리한다. */
export type FieldType =
  | "text"
  | "longtext"
  | "number"
  | "money"
  | "boolean"
  | "date"
  | "datetime"
  | "select"
  | "multiselect";

interface FieldBase {
  /** records.data(JSON)의 키. 한 종류 안에서 유일하고, 변경하지 않는 안정 키. */
  key: string;
  /** 사람이 보는 라벨. */
  label: string;
  /** 입력 도움말/설명(선택). */
  description?: string;
  /** 필수 입력 여부. */
  required?: boolean;
}

export interface TextField extends FieldBase {
  type: "text" | "longtext";
  minLength?: number;
  maxLength?: number;
}

export interface NumberField extends FieldBase {
  type: "number";
  min?: number;
  max?: number;
  /** 정수만 허용. */
  integer?: boolean;
}

export interface MoneyField extends FieldBase {
  type: "money";
  /** 기본 통화(ISO 4217). 예: "KRW". */
  defaultCurrency?: string;
}

export interface BooleanField extends FieldBase {
  type: "boolean";
}

export interface DateField extends FieldBase {
  type: "date" | "datetime";
}

export interface SelectField extends FieldBase {
  type: "select" | "multiselect";
  options: SelectOption[];
}

export interface SelectOption {
  value: string;
  label: string;
}

/** 모든 필드 정의의 판별 유니언(discriminant = `type`). */
export type FieldDef =
  | TextField
  | NumberField
  | MoneyField
  | BooleanField
  | DateField
  | SelectField;
