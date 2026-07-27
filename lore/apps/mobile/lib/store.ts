import { Platform } from "react-native";
import type { FieldDef } from "@lore/schema-core";
import { PRESETS } from "./presets";

// Metro가 제공하는 require. 웹 번들에 expo-sqlite를 끌어들이지 않으려고 동적 require를 쓴다.
declare const require: (m: string) => unknown;

export interface TypeRow {
  id: string;
  name: string;
  color: string;
  fields: FieldDef[];
}
export interface RecordRow {
  id: string;
  typeId: string;
  title?: string;
  occurredAt: string;
  data: Record<string, unknown>;
}

const isWeb = Platform.OS === "web";
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

/* ---------------- web: 인메모리 (검증/스크린샷용) ---------------- */
let memTypes: TypeRow[] = [];
let memRecords: RecordRow[] = [];
let memSeeded = false;

/* ---------------- native: expo-sqlite (local-first 지속) ---------------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
let dbPromise: Promise<any> | null = null;
function getDb(): Promise<any> {
  if (!dbPromise) {
    const SQLite = require("expo-sqlite") as any;
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("lore.db");
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS types (id TEXT PRIMARY KEY, name TEXT, color TEXT, fields TEXT, created_at TEXT);
         CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, type_id TEXT, title TEXT, occurred_at TEXT, data TEXT);`,
      );
      return db;
    })();
  }
  return dbPromise;
}
const mapRec = (r: any): RecordRow => ({
  id: r.id,
  typeId: r.type_id,
  title: r.title ?? undefined,
  occurredAt: r.occurred_at,
  data: JSON.parse(r.data),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function ensureSeeded(): Promise<void> {
  if (isWeb) {
    if (memSeeded) return;
    if (memTypes.length === 0) {
      for (const p of PRESETS) {
        memTypes.push({ id: newId(), name: p.name, color: p.color, fields: p.fields });
      }
    }
    memSeeded = true;
    return;
  }
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT COUNT(*) as c FROM types");
  if ((row?.c ?? 0) === 0) {
    for (const p of PRESETS) {
      await db.runAsync("INSERT INTO types (id,name,color,fields,created_at) VALUES (?,?,?,?,?)", [
        newId(),
        p.name,
        p.color,
        JSON.stringify(p.fields),
        nowISO(),
      ]);
    }
  }
}

export async function listTypes(): Promise<TypeRow[]> {
  if (isWeb) return memTypes;
  const db = await getDb();
  const rows = await db.getAllAsync("SELECT * FROM types ORDER BY created_at");
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    fields: JSON.parse(r.fields),
  }));
}

export async function getType(id: string): Promise<TypeRow | undefined> {
  return (await listTypes()).find((t) => t.id === id);
}

export async function listRecords(typeId: string): Promise<RecordRow[]> {
  if (isWeb) {
    return memRecords
      .filter((r) => r.typeId === typeId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
  const db = await getDb();
  const rows = await db.getAllAsync(
    "SELECT * FROM records WHERE type_id=? ORDER BY occurred_at DESC",
    [typeId],
  );
  return rows.map(mapRec);
}

export async function listRecent(limit: number): Promise<RecordRow[]> {
  if (isWeb) {
    return [...memRecords].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, limit);
  }
  const db = await getDb();
  const rows = await db.getAllAsync("SELECT * FROM records ORDER BY occurred_at DESC LIMIT ?", [
    limit,
  ]);
  return rows.map(mapRec);
}

export async function countByType(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (isWeb) {
    for (const r of memRecords) out[r.typeId] = (out[r.typeId] ?? 0) + 1;
    return out;
  }
  const db = await getDb();
  const rows = await db.getAllAsync("SELECT type_id, COUNT(*) as c FROM records GROUP BY type_id");
  for (const r of rows as any[]) out[r.type_id] = r.c;
  return out;
}

export async function addRecord(
  typeId: string,
  input: { title?: string; occurredAt: string; data: Record<string, unknown> },
): Promise<void> {
  const rec: RecordRow = {
    id: newId(),
    typeId,
    title: input.title,
    occurredAt: input.occurredAt,
    data: input.data,
  };
  if (isWeb) {
    memRecords.push(rec);
    return;
  }
  const db = await getDb();
  await db.runAsync("INSERT INTO records (id,type_id,title,occurred_at,data) VALUES (?,?,?,?,?)", [
    rec.id,
    typeId,
    rec.title ?? null,
    rec.occurredAt,
    JSON.stringify(rec.data),
  ]);
}
