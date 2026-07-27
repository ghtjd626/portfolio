import { compileRecordSchema } from "@lore/schema-core";
import {
  daoAllRecords,
  daoGetRecord,
  daoGetRecordType,
  daoPutRecord,
  daoRecordsByType,
} from "../store/dao";
import type { LocalRecord } from "../store/entities";
import { newId, nowISO } from "../util";

/**
 * 기록(record)의 유스케이스. 저장 전 record type의 FieldDef[]로 컴파일한 Zod로
 * data를 검증한다(schema-core 단일 소스). 논지 A + 데이터 무결성.
 */

export interface RecordInput {
  title?: string;
  occurredAt: string;
  data: Record<string, unknown>;
}

/** 필드별 오류 메시지 맵을 담는 검증 오류. 폼이 필드 옆에 표시할 수 있다. */
export class RecordValidationError extends Error {
  constructor(public readonly issues: Record<string, string>) {
    super("입력값 검증에 실패했습니다.");
    this.name = "RecordValidationError";
  }
}

async function validateData(
  typeId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const type = await daoGetRecordType(typeId);
  if (!type) throw new Error("기록 종류를 찾을 수 없습니다.");
  const schema = compileRecordSchema(type.fields);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !issues[key]) issues[key] = issue.message;
    }
    throw new RecordValidationError(issues);
  }
  return result.data as Record<string, unknown>;
}

export async function listRecordsByType(typeId: string): Promise<LocalRecord[]> {
  const all = await daoRecordsByType(typeId);
  return all
    .filter((r) => !r.deletedAt)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

/** 모든 종류를 가로지르는 최근 기록(대시보드용). */
export async function listAllRecords(): Promise<LocalRecord[]> {
  const all = await daoAllRecords();
  return all
    .filter((r) => !r.deletedAt)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export async function getRecord(id: string): Promise<LocalRecord | undefined> {
  const r = await daoGetRecord(id);
  return r && !r.deletedAt ? r : undefined;
}

export async function createRecord(
  typeId: string,
  input: RecordInput,
): Promise<LocalRecord> {
  const cleanData = await validateData(typeId, input.data);
  const now = nowISO();
  const rec: LocalRecord = {
    id: newId(),
    typeId,
    title: input.title?.trim() || undefined,
    occurredAt: input.occurredAt || now,
    data: cleanData,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    dirty: true,
  };
  await daoPutRecord(rec);
  return rec;
}

export async function updateRecord(id: string, input: RecordInput): Promise<LocalRecord> {
  const existing = await daoGetRecord(id);
  if (!existing) throw new Error("기록을 찾을 수 없습니다.");
  const cleanData = await validateData(existing.typeId, input.data);
  const updated: LocalRecord = {
    ...existing,
    title: input.title?.trim() || undefined,
    occurredAt: input.occurredAt || existing.occurredAt,
    data: cleanData,
    updatedAt: nowISO(),
    dirty: true,
  };
  await daoPutRecord(updated);
  return updated;
}

export async function deleteRecord(id: string): Promise<void> {
  const existing = await daoGetRecord(id);
  if (!existing) return;
  const now = nowISO();
  await daoPutRecord({ ...existing, deletedAt: now, updatedAt: now, dirty: true });
}
