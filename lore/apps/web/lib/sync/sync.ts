import {
  daoAllRecords,
  daoAllRecordTypes,
  daoGetMeta,
  daoGetRecord,
  daoGetRecordType,
  daoPutRecord,
  daoPutRecordType,
  daoSetMeta,
} from "../store/dao";
import type { LocalRecord, LocalRecordType } from "../store/entities";
import { isNewer, nowISO } from "../util";

/**
 * 클라이언트 동기화(최소 구현, LWW).
 *
 * ADR-0003대로 관리형 엔진(ElectricSQL 등)은 Phase 1 스파이크로 정한다.
 * 그 전까지 MVP는 이 얇은 커스텀 동기화로 "push/pull + LWW" 프로토콜을 증명한다.
 * 서버(/api/sync)는 Postgres가 필요하며, 없으면 이 함수는 조용히 오프라인으로 남는다
 * (local-first이므로 실패해도 데이터는 로컬에 안전).
 */

const EPOCH = "1970-01-01T00:00:00.000Z";

export interface SyncResult {
  ok: boolean;
  pushed: number;
  pulled: number;
  message: string;
}

export async function syncNow(): Promise<SyncResult> {
  const since = (await daoGetMeta<string>("lastSyncedAt")) ?? EPOCH;
  const dirtyTypes = (await daoAllRecordTypes()).filter((t) => t.dirty);
  const dirtyRecords = (await daoAllRecords()).filter((r) => r.dirty);

  let res: Response;
  try {
    res = await fetch("/api/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ since, recordTypes: dirtyTypes, records: dirtyRecords }),
    });
  } catch {
    return {
      ok: false,
      pushed: 0,
      pulled: 0,
      message: "서버에 연결할 수 없어요. 로컬에는 안전하게 저장돼 있습니다.",
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      pushed: 0,
      pulled: 0,
      message: `동기화 서버 오류(${res.status}). 로컬 데이터는 그대로예요.`,
    };
  }

  const body = (await res.json()) as {
    recordTypes: LocalRecordType[];
    records: LocalRecord[];
  };

  let pulled = 0;
  for (const t of body.recordTypes) {
    const cur = await daoGetRecordType(t.id);
    if (!cur || isNewer(cur, t)) {
      await daoPutRecordType({ ...t, dirty: false });
      pulled++;
    }
  }
  for (const r of body.records) {
    const cur = await daoGetRecord(r.id);
    if (!cur || isNewer(cur, r)) {
      await daoPutRecord({ ...r, dirty: false });
      pulled++;
    }
  }

  // 성공적으로 밀어낸 로컬 변경의 dirty 해제.
  for (const t of dirtyTypes) {
    const cur = await daoGetRecordType(t.id);
    if (cur && cur.updatedAt === t.updatedAt) await daoPutRecordType({ ...cur, dirty: false });
  }
  for (const r of dirtyRecords) {
    const cur = await daoGetRecord(r.id);
    if (cur && cur.updatedAt === r.updatedAt) await daoPutRecord({ ...cur, dirty: false });
  }

  await daoSetMeta("lastSyncedAt", nowISO());
  return {
    ok: true,
    pushed: dirtyTypes.length + dirtyRecords.length,
    pulled,
    message: "동기화 완료",
  };
}
