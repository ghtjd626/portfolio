import { describe, expect, it } from "vitest";
import { emptyRecordData, emptyValueForField } from "./defaults";
import type { FieldDef } from "./field";

describe("emptyValueForField", () => {
  it("boolean은 false, multiselect는 빈 배열, 나머지는 undefined", () => {
    expect(emptyValueForField({ key: "a", label: "A", type: "boolean" })).toBe(false);
    expect(
      emptyValueForField({ key: "b", label: "B", type: "multiselect", options: [] }),
    ).toEqual([]);
    expect(emptyValueForField({ key: "c", label: "C", type: "text" })).toBeUndefined();
  });
});

describe("emptyRecordData", () => {
  it("모든 필드 키에 대한 빈 값을 만든다", () => {
    const fields: FieldDef[] = [
      { key: "title", label: "제목", type: "text" },
      { key: "done", label: "완료", type: "boolean" },
    ];
    expect(emptyRecordData(fields)).toEqual({ title: undefined, done: false });
  });
});
