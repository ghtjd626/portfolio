import { z } from "zod";
import type { FieldDef } from "./field";

/**
 * FieldDef[] → Zod 스키마 컴파일.
 *
 * Lore의 두 논지가 만나는 지점(ADR-0001):
 * - 스키마가 "데이터"(FieldDef[])이므로 물리 테이블은 고정된다 → local-first 동기화가 트랙터블.
 * - 그럼에도 런타임에 이 함수로 타입 안전한 검증기를 만들어 데이터 무결성을 지킨다.
 *
 * 웹·모바일·서버가 이 한 함수를 공유하므로(ADR-0004) 검증 규칙이 갈라지지 않는다.
 */

/** money 필드 값의 표준 형태: 금액 + ISO 4217 통화 코드. */
export const moneySchema = z.object({
  amount: z.number(),
  currency: z.string().length(3),
});
export type Money = z.infer<typeof moneySchema>;

function enumFrom(values: string[]): z.ZodTypeAny {
  if (values.length === 0) return z.never();
  return z.enum([values[0]!, ...values.slice(1)]);
}

function compileField(field: FieldDef): z.ZodTypeAny {
  switch (field.type) {
    case "text":
    case "longtext": {
      let s = z.string();
      // required 텍스트는 빈 문자열("")도 거부한다(최소 길이 1).
      const min = field.minLength ?? (field.required ? 1 : undefined);
      if (min !== undefined) s = s.min(min);
      if (field.maxLength !== undefined) s = s.max(field.maxLength);
      return s;
    }
    case "number": {
      let s = field.integer ? z.number().int() : z.number();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      return s;
    }
    case "money":
      return moneySchema;
    case "boolean":
      return z.boolean();
    case "date":
      // 이식성을 위해 날짜는 ISO 8601 문자열(YYYY-MM-DD)로 저장한다.
      return z.string().date();
    case "datetime":
      return z.string().datetime({ offset: true });
    case "select":
      return enumFrom(field.options.map((o) => o.value));
    case "multiselect":
      return z.array(enumFrom(field.options.map((o) => o.value)));
  }
}

/**
 * 기록 종류의 필드 정의로부터, records.data(JSONB)를 검증하는 Zod 객체 스키마를 만든다.
 * required가 아닌 필드는 optional로 처리한다.
 */
export function compileRecordSchema(fields: FieldDef[]): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {};
  for (const field of fields) {
    const base = compileField(field);
    shape[field.key] = field.required ? base : base.optional();
  }
  return z.object(shape);
}
