import { z } from "zod";

/**
 * 환경변수 스키마 검증 (DevOps 관행: fail-fast).
 * 잘못된/누락된 설정은 런타임 깊은 곳이 아니라 부팅 시점에 드러나게 한다.
 * local-first라 DATABASE_URL은 선택 — 없으면 동기화만 꺼진다(앱은 정상).
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`환경변수 검증 실패 — ${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}
