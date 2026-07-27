import { describe, expect, it } from "vitest";
import { compileRecordSchema } from "./compile";
import type { FieldDef } from "./field";

// "가계부" 종류를 데이터로 정의한다 — 코드 배포 없이 종류가 생긴다는 논지 A의 최소 증명.
const expenseFields: FieldDef[] = [
  { key: "title", label: "내용", type: "text", required: true },
  { key: "amount", label: "금액", type: "money", required: true },
  {
    key: "category",
    label: "분류",
    type: "select",
    required: true,
    options: [
      { value: "food", label: "식비" },
      { value: "transport", label: "교통" },
    ],
  },
  { key: "memo", label: "메모", type: "longtext" },
];

describe("compileRecordSchema", () => {
  it("유효한 가계부 기록을 통과시킨다", () => {
    const schema = compileRecordSchema(expenseFields);
    const parsed = schema.parse({
      title: "점심",
      amount: { amount: 12000, currency: "KRW" },
      category: "food",
    });
    expect(parsed.title).toBe("점심");
  });

  it("required 필드 누락을 거부한다", () => {
    const schema = compileRecordSchema(expenseFields);
    expect(schema.safeParse({ title: "점심" }).success).toBe(false);
  });

  it("optional 필드(memo)는 없어도 된다", () => {
    const schema = compileRecordSchema(expenseFields);
    const result = schema.safeParse({
      title: "커피",
      amount: { amount: 4500, currency: "KRW" },
      category: "food",
    });
    expect(result.success).toBe(true);
  });

  it("select에 없는 값을 거부한다", () => {
    const schema = compileRecordSchema(expenseFields);
    const result = schema.safeParse({
      title: "택시",
      amount: { amount: 8000, currency: "KRW" },
      category: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("코드 변경 없이 다른 종류(일기)도 같은 함수로 컴파일된다", () => {
    const journalFields: FieldDef[] = [
      {
        key: "mood",
        label: "기분",
        type: "select",
        required: true,
        options: [
          { value: "good", label: "좋음" },
          { value: "bad", label: "나쁨" },
        ],
      },
      { key: "body", label: "본문", type: "longtext", required: true },
    ];
    const schema = compileRecordSchema(journalFields);
    expect(schema.safeParse({ mood: "good", body: "오늘은..." }).success).toBe(true);
  });
});
