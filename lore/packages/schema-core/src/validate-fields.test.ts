import { describe, expect, it } from "vitest";
import type { FieldDef } from "./field";
import { validateFields } from "./validate-fields";

describe("validateFields", () => {
  it("정상 필드는 오류가 없다", () => {
    const fields: FieldDef[] = [
      { key: "title", label: "제목", type: "text", required: true },
      {
        key: "category",
        label: "분류",
        type: "select",
        options: [{ value: "a", label: "A" }],
      },
    ];
    expect(validateFields(fields)).toEqual([]);
  });

  it("중복 key를 잡는다", () => {
    const fields: FieldDef[] = [
      { key: "x", label: "X1", type: "text" },
      { key: "x", label: "X2", type: "text" },
    ];
    expect(validateFields(fields).some((e) => e.includes("중복"))).toBe(true);
  });

  it("옵션 없는 select를 잡는다", () => {
    const fields: FieldDef[] = [{ key: "c", label: "분류", type: "select", options: [] }];
    expect(validateFields(fields).some((e) => e.includes("선택 항목"))).toBe(true);
  });

  it("잘못된 key 형식을 잡는다", () => {
    const fields: FieldDef[] = [{ key: "1bad", label: "L", type: "text" }];
    expect(validateFields(fields).some((e) => e.includes("key는"))).toBe(true);
  });
});
