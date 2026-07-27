import {
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { FieldDef } from "@lore/schema-core";

/**
 * 물리 스키마 — Lore의 핵심 판단(ADR-0001)이 실제 테이블로 굳은 곳.
 *
 * 사용자가 아무리 많은 "기록 종류"를 만들어도 테이블 수는 늘지 않는다.
 * 종류 정의는 record_types의 "행"이고, 기록의 동적 필드 값은 records.data(JSONB)다.
 * 덕분에 동기화 엔진(ADR-0003)은 고정된 소수의 테이블만 다루면 된다.
 *
 * 동기화 친화 규칙:
 * - 하드 삭제 대신 deleted_at(soft delete) — 삭제도 다른 기기로 전파돼야 한다.
 * - updated_at을 충돌 해결(LWW 후보)의 기반으로 둔다.
 */

/** 사용자가 정의하는 "기록 종류". 예: 가계부, 일기, 할 일. */
export const recordTypes = pgTable("record_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  // FieldDef[] — schema-core의 정의를 그대로 저장한다(코드가 아니라 데이터).
  fields: jsonb("fields").$type<FieldDef[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** 실제 기록. 어떤 종류든 이 한 테이블에 저장된다. */
export const records = pgTable(
  "records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull(),
    typeId: uuid("type_id")
      .notNull()
      .references(() => recordTypes.id),
    // "언제의 기록인가" — 모든 종류가 공유하는 공통 시간 축.
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    title: text("title"),
    // 종류별 동적 필드 값. record_types.fields로 컴파일한 Zod로 검증된다(schema-core).
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("records_owner_type_idx").on(t.ownerId, t.typeId),
    index("records_occurred_at_idx").on(t.occurredAt),
  ],
);

/** 도메인 공통 태깅 — 종류를 가로지르는 축. */
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** records ↔ tags 다대다. */
export const recordTags = pgTable(
  "record_tags",
  {
    recordId: uuid("record_id")
      .notNull()
      .references(() => records.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.recordId, t.tagId] })],
);
