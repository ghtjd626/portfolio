import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { LocalRecord, LocalRecordType } from "./entities";

/**
 * IndexedDB 스키마 정의.
 *
 * 왜 IndexedDB인가 (MVP 결정, ADR-0006):
 * - 브라우저 내장이라 의존성/설정이 가볍고, 오프라인·구조화 저장이 확실하다.
 * - 아키텍처의 "로컬 스토어" 자리에 정확히 들어맞는다(architecture.md §5).
 * - SQLite-WASM/OPFS는 더 강력하지만 설정이 무겁다 → 동기화 엔진 스파이크(Phase 1)와
 *   함께 재평가한다. Repository 경계 뒤에 있으므로 교체 비용은 국소적이다.
 */
interface LoreDB extends DBSchema {
  record_types: {
    key: string;
    value: LocalRecordType;
  };
  records: {
    key: string;
    value: LocalRecord;
    indexes: { "by-type": string; "by-occurredAt": string };
  };
  meta: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<LoreDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<LoreDB>> {
  if (typeof indexedDB === "undefined") {
    throw new Error("로컬 스토어는 브라우저에서만 사용할 수 있습니다.");
  }
  if (!dbPromise) {
    dbPromise = openDB<LoreDB>("lore", 1, {
      upgrade(db) {
        db.createObjectStore("record_types", { keyPath: "id" });
        const records = db.createObjectStore("records", { keyPath: "id" });
        records.createIndex("by-type", "typeId");
        records.createIndex("by-occurredAt", "occurredAt");
        db.createObjectStore("meta");
      },
    });
  }
  return dbPromise;
}

export type { LoreDB };
