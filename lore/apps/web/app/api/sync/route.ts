import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import {
  createDbClient,
  records as recordsTable,
  recordTypes as recordTypesTable,
} from "@lore/db";
import type { LocalRecord, LocalRecordType } from "../../../lib/store/entities";

/**
 * 동기화 서버(원천). ADR-0003의 관리형 엔진 결정 전, MVP용 최소 push/pull.
 *
 * 주의: PostgreSQL(DATABASE_URL)이 필요하다. 없으면 503을 반환하고, 클라이언트는
 * 조용히 로컬(오프라인)로 남는다 — local-first이므로 데이터는 로컬에 안전하다.
 * (이 빌드 환경엔 Docker/Postgres가 없어 라이브 실행은 후속. 코드/타입은 검증됨.)
 */

export const runtime = "nodejs";

// 단일 사용자 MVP의 고정 소유자. 멀티유저는 non-goal(반사실로만 문서화).
const OWNER = "00000000-0000-0000-0000-000000000001";

interface SyncPushBody {
  since: string;
  recordTypes: LocalRecordType[];
  records: LocalRecord[];
}

function typeToRow(t: LocalRecordType) {
  return {
    id: t.id,
    ownerId: OWNER,
    name: t.name,
    icon: t.icon ?? null,
    color: t.color ?? null,
    fields: t.fields,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
    deletedAt: t.deletedAt ? new Date(t.deletedAt) : null,
  };
}

function recordToRow(r: LocalRecord) {
  return {
    id: r.id,
    ownerId: OWNER,
    typeId: r.typeId,
    occurredAt: new Date(r.occurredAt),
    title: r.title ?? null,
    data: r.data,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
    deletedAt: r.deletedAt ? new Date(r.deletedAt) : null,
  };
}

type TypeRow = ReturnType<typeof typeToRow> & { createdAt: Date; updatedAt: Date };
type RecordRow = ReturnType<typeof recordToRow> & { createdAt: Date; updatedAt: Date };

function rowToType(r: TypeRow): LocalRecordType {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon ?? undefined,
    color: r.color ?? undefined,
    fields: r.fields,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
    dirty: false,
  };
}

function rowToRecord(r: RecordRow): LocalRecord {
  return {
    id: r.id,
    typeId: r.typeId,
    title: r.title ?? undefined,
    occurredAt: r.occurredAt.toISOString(),
    data: r.data,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
    dirty: false,
  };
}

export async function POST(req: Request) {
  let db: ReturnType<typeof createDbClient>;
  try {
    db = createDbClient();
  } catch {
    return NextResponse.json(
      { error: "DATABASE_URL이 설정되지 않았습니다(오프라인)." },
      { status: 503 },
    );
  }

  const body = (await req.json()) as SyncPushBody;
  const sinceDate = new Date(body.since ?? 0);

  // push — LWW 순서는 클라이언트가 보장하므로 서버는 upsert.
  for (const t of body.recordTypes ?? []) {
    const row = typeToRow(t);
    await db.insert(recordTypesTable).values(row).onConflictDoUpdate({
      target: recordTypesTable.id,
      set: row,
    });
  }
  for (const r of body.records ?? []) {
    const row = recordToRow(r);
    await db.insert(recordsTable).values(row).onConflictDoUpdate({
      target: recordsTable.id,
      set: row,
    });
  }

  // pull — since 이후 변경분.
  const pulledTypes = await db
    .select()
    .from(recordTypesTable)
    .where(and(eq(recordTypesTable.ownerId, OWNER), gt(recordTypesTable.updatedAt, sinceDate)));
  const pulledRecords = await db
    .select()
    .from(recordsTable)
    .where(and(eq(recordsTable.ownerId, OWNER), gt(recordsTable.updatedAt, sinceDate)));

  return NextResponse.json({
    recordTypes: pulledTypes.map(rowToType),
    records: pulledRecords.map(rowToRecord),
  });
}
