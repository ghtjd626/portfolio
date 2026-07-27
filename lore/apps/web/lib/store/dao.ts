import { getDB } from "./db";
import type { LocalRecord, LocalRecordType } from "./entities";

/**
 * DAO — 로컬 스토어에 대한 최소 접근 계층(Repository의 하단).
 * "정책"(dirty/updatedAt/검증)은 service가 가지고, 여기선 순수 읽기/쓰기만 한다.
 */

// ---- record types ----

export async function daoAllRecordTypes(): Promise<LocalRecordType[]> {
  return (await getDB()).getAll("record_types");
}

export async function daoGetRecordType(id: string): Promise<LocalRecordType | undefined> {
  return (await getDB()).get("record_types", id);
}

export async function daoPutRecordType(rt: LocalRecordType): Promise<void> {
  await (await getDB()).put("record_types", rt);
}

// ---- records ----

export async function daoAllRecords(): Promise<LocalRecord[]> {
  return (await getDB()).getAll("records");
}

export async function daoRecordsByType(typeId: string): Promise<LocalRecord[]> {
  return (await getDB()).getAllFromIndex("records", "by-type", typeId);
}

export async function daoGetRecord(id: string): Promise<LocalRecord | undefined> {
  return (await getDB()).get("records", id);
}

export async function daoPutRecord(r: LocalRecord): Promise<void> {
  await (await getDB()).put("records", r);
}

// ---- meta ----

export async function daoGetMeta<T>(key: string): Promise<T | undefined> {
  return (await getDB()).get("meta", key) as Promise<T | undefined>;
}

export async function daoSetMeta(key: string, value: unknown): Promise<void> {
  await (await getDB()).put("meta", value, key);
}
