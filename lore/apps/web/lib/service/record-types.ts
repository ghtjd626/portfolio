import { type FieldDef, validateFields } from "@lore/schema-core";
import { daoAllRecordTypes, daoGetRecordType, daoPutRecordType } from "../store/dao";
import type { LocalRecordType } from "../store/entities";
import { newId, nowISO } from "../util";

/**
 * 기록 종류(record type)의 유스케이스. dirty/updatedAt/검증 "정책"을 여기서 소유한다.
 * 종류를 코드가 아니라 데이터로 다루는 논지 A의 서비스 계층.
 */

export interface RecordTypeInput {
  name: string;
  icon?: string;
  color?: string;
  fields: FieldDef[];
}

export async function listRecordTypes(): Promise<LocalRecordType[]> {
  const all = await daoAllRecordTypes();
  return all
    .filter((t) => !t.deletedAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getRecordType(id: string): Promise<LocalRecordType | undefined> {
  const t = await daoGetRecordType(id);
  return t && !t.deletedAt ? t : undefined;
}

function assertValid(input: RecordTypeInput): void {
  if (!input.name.trim()) throw new Error("종류 이름을 입력하세요.");
  const errs = validateFields(input.fields);
  if (errs.length) throw new Error(errs.join("\n"));
}

export async function createRecordType(input: RecordTypeInput): Promise<LocalRecordType> {
  assertValid(input);
  const now = nowISO();
  const rt: LocalRecordType = {
    id: newId(),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    fields: input.fields,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    dirty: true,
  };
  await daoPutRecordType(rt);
  return rt;
}

export async function updateRecordType(
  id: string,
  input: RecordTypeInput,
): Promise<LocalRecordType> {
  const existing = await daoGetRecordType(id);
  if (!existing) throw new Error("종류를 찾을 수 없습니다.");
  assertValid(input);
  const updated: LocalRecordType = {
    ...existing,
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    fields: input.fields,
    updatedAt: nowISO(),
    dirty: true,
  };
  await daoPutRecordType(updated);
  return updated;
}

/** 소프트 삭제 — 삭제도 동기화로 전파돼야 하므로 물리 삭제하지 않는다. */
export async function deleteRecordType(id: string): Promise<void> {
  const existing = await daoGetRecordType(id);
  if (!existing) return;
  const now = nowISO();
  await daoPutRecordType({ ...existing, deletedAt: now, updatedAt: now, dirty: true });
}
