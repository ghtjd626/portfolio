# Development — 로컬 개발 가이드

Phase 0 스캐폴드를 실행/검증하는 방법.

## 사전 요구

- Node.js ≥ 20
- pnpm 9 (`corepack enable` 후 `corepack prepare pnpm@9 --activate`)
- Docker (로컬 Postgres용)

## 설치

```bash
cd lore
pnpm install
```

> 이 저장소는 현재 `ghtjd626/portfolio` 안의 `lore/` "씨앗 폴더"다.
> 독립 레포로 옮기면 `lore/`가 루트가 되고 `.github/workflows/ci.yml`이 그대로 동작한다.

## 자주 쓰는 명령

| 명령 | 설명 |
|---|---|
| `pnpm test` | 전체 테스트(현재 `schema-core`의 Zod 컴파일 테스트) |
| `pnpm type-check` | 전 패키지 타입 검사 |
| `pnpm lint` | 전 패키지 린트 |
| `pnpm db:up` / `pnpm db:down` | 로컬 Postgres(도커) 기동/종료 |
| `pnpm --filter @lore/db db:generate` | Drizzle 마이그레이션 생성 |
| `pnpm --filter @lore/web dev` | 웹(Next.js) 개발 서버 → http://localhost:3000 |
| `pnpm --filter @lore/web build` | 웹 프로덕션 빌드(타입체크 포함) |
| `pnpm --filter @lore/web e2e` | Playwright 스모크(서버가 떠 있어야 함; `BASE`로 URL 지정) |
| `pnpm --filter @lore/mobile start` | 모바일(Expo) 개발 서버 |

### 웹 앱을 직접 써 보기
```bash
pnpm --filter @lore/web dev
# 브라우저에서 http://localhost:3000
# 첫 방문 시 프리셋(가계부/할일/일기)이 자동 생성된다.
# 새 종류를 만들어 보면(홈 → 새 종류) 코드 없이 폼·검증·목록이 생기는 걸 볼 수 있다.
```

## 지금 무엇이 "진짜" 동작하나 (Phase 0 스코프)

- **`@lore/schema-core`** — FieldDef → Zod 컴파일. 테스트로 검증되는, 논지 A의 실제 구현.
- **`@lore/db`** — 고정 물리 스키마(record_types / records(JSONB) / tags). `db:generate`로 마이그레이션 생성 가능.
- **`apps/web`, `apps/mobile`** — 모노레포 위상과 패키지 공유를 세우는 셸. 각각 `schema-core`를 실제로 import 해 "같은 코드가 웹·네이티브에서 동작"함을 스모크로 보인다.
- **`@lore/ui`** — 자리만 잡은 셸. Tamagui 디자인 시스템은 Phase 2–3.

동기화 엔진(ADR-0003)과 로컬 스토어는 Phase 1 스파이크에서 붙는다.

## 환경 변수

`.env.example`를 `.env`로 복사해 `DATABASE_URL`을 설정한다(로컬 도커 기본값과 일치).
