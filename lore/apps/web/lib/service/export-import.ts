import {
  daoAllRecords,
  daoAllRecordTypes,
  daoGetRecord,
  daoGetRecordType,
  daoPutRecord,
  daoPutRecordType,
} from "../store/dao";
import type { LoreExport } from "../store/entities";
import { isNewer, nowISO } from "../util";

/**
 * 데이터 소유(논지 B) — 내 데이터를 내가 백업/이전할 수 있어야 한다.
 * 전체를 JSON 한 덩어리로 내보내고, 같은 형식을 다시 가져올 수 있다(LWW 병합).
 */

export async function exportAll(): Promise<LoreExport> {
  return {
    format: "lore.export",
    version: 1,
    exportedAt: nowISO(),
    recordTypes: await daoAllRecordTypes(),
    records: await daoAllRecords(),
  };
}

export interface ImportResult {
  types: number;
  records: number;
}

export async function importBundle(raw: unknown): Promise<ImportResult> {
  const bundle = raw as Partial<LoreExport>;
  if (!bundle || bundle.format !== "lore.export" || !Array.isArray(bundle.recordTypes)) {
    throw new Error("올바른 Lore 내보내기 파일이 아닙니다.");
  }
  let types = 0;
  let records = 0;
  for (const incoming of bundle.recordTypes) {
    const existing = await daoGetRecordType(incoming.id);
    if (!existing || isNewer(existing, incoming)) {
      await daoPutRecordType(incoming);
      types++;
    }
  }
  for (const incoming of bundle.records ?? []) {
    const existing = await daoGetRecord(incoming.id);
    if (!existing || isNewer(existing, incoming)) {
      await daoPutRecord(incoming);
      records++;
    }
  }
  return { types, records };
}
