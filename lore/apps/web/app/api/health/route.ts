import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createDbClient } from "@lore/db";
import { getEnv } from "../../../lib/env";

/**
 * 헬스체크 — 로드밸런서·업타임 모니터·배포 게이트가 찌른다.
 * DB가 설정돼 있으면 연결까지 확인(readiness), 없으면 앱은 여전히 healthy(local-first).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = getEnv();
  const body = {
    status: "ok" as "ok" | "degraded",
    time: new Date().toISOString(),
    env: env.NODE_ENV,
    db: "not-configured" as "not-configured" | "ok" | "error",
  };

  if (env.DATABASE_URL) {
    try {
      const db = createDbClient(env.DATABASE_URL);
      await db.execute(sql`select 1`);
      body.db = "ok";
    } catch {
      body.db = "error";
      body.status = "degraded";
      return NextResponse.json(body, { status: 503 });
    }
  }

  return NextResponse.json(body);
}
