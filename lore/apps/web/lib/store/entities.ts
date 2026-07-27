import type { FieldDef } from "@lore/schema-core";

/**
 * 클라이언트 로컬 스토어의 엔티티. 서버(packages/db)의 물리 스키마와 대응하되,
 * local-first 특성상 몇 가지가 다르다:
 * - 시간은 이식성을 위해 ISO 8601 "문자열"로 저장한다(IndexedDB/JSON 친화).
 * - `dirty`: 이 행의 로컬 변경이 아직 서버에 반영되지 않았음(동기화 대상).
 *
 * "1차 사본은 내 기기에 있다"(논지 B)를 구현하는 자료구조.
 */
export interface LocalRecordType {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  fields: FieldDef[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  dirty: boolean;
}

export interface LocalRecord {
  id: string;
  typeId: string;
  title?: string;
  /** "언제의 기록인가" — 모든 종류가 공유하는 공통 시간 축(ISO). */
  occurredAt: string;
  /** 종류별 동적 필드 값. record type의 FieldDef[]로 컴파일한 Zod로 검증된다. */
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  dirty: boolean;
}

/** 내보내기/가져오기(데이터 소유) 번들 형식. */
export interface LoreExport {
  format: "lore.export";
  version: 1;
  exportedAt: string;
  recordTypes: LocalRecordType[];
  records: LocalRecord[];
}
