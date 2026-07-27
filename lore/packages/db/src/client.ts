import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * 서버 측 Postgres 클라이언트(동기화 원천, ADR-0002/0003).
 * DATABASE_URL은 .env로 주입한다(로컬은 docker-compose의 Postgres).
 */
export function createDbClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = postgres(connectionString);
  return drizzle(sql, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
