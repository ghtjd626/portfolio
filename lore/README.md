# Lore

> 내가 직접 정의하고, 내 기기에 살아있고, 오프라인에서도 즉시 동작하며 기기 간 동기화되는 **나만의 개인 기록 플랫폼.**
> PC 웹과 모바일 **네이티브 앱**에서 모두, Toss·배민 수준의 사용성으로.

가계부 · 일기 · 할 일 · 일정 · 커리어 · 이력서 — 겉보기엔 다른 기능이지만, 전부 *"특정 시점에, 내가, 태그를 붙여 남기고, 나중에 검색·집계하는 데이터"* 라는 하나의 뿌리를 공유합니다. Lore는 이 공통 뿌리를 **사용자가 직접 정의하는 스키마**로 추상화하고, **local-first** 아키텍처로 온전히 내 것으로 만들며, **유니버설 코드베이스**로 웹·모바일을 아우릅니다.

---

## 이 프로젝트가 존재하는 이유

- 기존 도구들은 파편화돼 있고(앱마다 따로), **내 데이터가 내 것이 아니며**(클라우드 종속), **내 입맛대로 구조를 바꿀 수 없다**.
- Lore는 이 세 가지를 정면으로 해결한다: **하나의 시스템 · 데이터 소유 · 무한한 커스터마이즈.**

자세한 배경은 [`docs/discovery.md`](./docs/discovery.md)(엔게이지먼트 브리프)와 [`docs/vision.md`](./docs/vision.md)를 참고.

## 두 개의 기술적 논지 (이 프로젝트의 척추)

1. **사용자 정의 스키마** — 도메인을 하드코딩하지 않는다. "기록 종류"를 사용자가 데이터로 정의한다.
2. **Local-first / 오프라인 우선** — 데이터는 내 기기에 있고, 오프라인에서도 즉시 동작하며, 기기 간 동기화된다.

두 논지는 서로 충돌하지만, **"동적 스키마를 코드가 아니라 데이터로 눕혀 물리 스키마를 고정한다"** 는 판단으로 해소한다([ADR-0001](./docs/adr/0001-core-theses-and-dynamic-schema-as-data.md)).

그리고 이 위에 **1급 제품 요구**가 하나 더 있다: **멀티플랫폼 · 네이티브급 UX.** local-first가 즉시성을 가능케 하고, 유니버설 전략([ADR-0005](./docs/adr/0005-client-multiplatform-strategy.md))과 [UX 원칙](./docs/ux-principles.md)이 그것을 웹·모바일 경험으로 실현한다.

## 기술 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 플랫폼 | 웹(PC) + iOS/Android **네이티브 앱** | [ADR-0005](./docs/adr/0005-client-multiplatform-strategy.md) |
| 클라이언트 | **유니버설**: Next.js(웹) + Expo/RN(모바일) + Tamagui + Solito | [ADR-0005](./docs/adr/0005-client-multiplatform-strategy.md) |
| 서버 | Next.js (App Router) Route Handlers | 웹 UI와 백엔드 통합 |
| ORM | Drizzle | [ADR-0002](./docs/adr/0002-orm-drizzle.md) |
| 동기화 엔진 | Phase 1 스파이크 후 결정 (웹+RN 지원 필수) | [ADR-0003](./docs/adr/0003-sync-engine-spike.md) |
| 구조 | Turborepo 모노레포 | [ADR-0004](./docs/adr/0004-monorepo-turborepo.md) |
| 검증 | Zod (필드정의 → 런타임 검증기) | [ADR-0001](./docs/adr/0001-core-theses-and-dynamic-schema-as-data.md) |
| UI | Tamagui 유니버설 컴포넌트·디자인 토큰 + 동적 폼 렌더러 | [ux-principles](./docs/ux-principles.md) |
| 서버 DB | PostgreSQL (동기화 원천) | — |
| 로컬 스토어 | 웹 SQLite-WASM/OPFS · 모바일 expo-sqlite | — |
| 인프라 | Docker · GitHub Actions · Vercel · Neon · EAS(모바일 빌드) | — |

## 문서 지도

| 문서 | 내용 |
|---|---|
| [`docs/discovery.md`](./docs/discovery.md) | 엔게이지먼트 브리프 — 실제 문제·니즈·제약·성공 기준 (FDE discovery) |
| [`docs/vision.md`](./docs/vision.md) | 제품 비전 · 두 논지 · 스코프 · 원칙 |
| [`docs/architecture.md`](./docs/architecture.md) | 유니버설 구조 · 물리 스키마 · schema-core · 데이터 흐름 |
| [`docs/ux-principles.md`](./docs/ux-principles.md) | UX 원칙과 측정 기준 (네이티브급 경험의 게이트) |
| [`docs/roadmap.md`](./docs/roadmap.md) | Phase 0–5 로드맵과 각 단계의 "증명" |
| [`docs/development.md`](./docs/development.md) | 로컬 개발/실행 가이드 (설치·명령·현재 동작 범위) |
| [`docs/adr/`](./docs/adr/) | 아키텍처 결정 기록 0001–0005 (What / Why / How / Trade-off / 반사실) |

## 현재 상태

**Phase 0 — 기반.** 문제 정의·핵심 결정 문서화에 더해, **코드 스캐폴드가 올라왔다:**

- Turborepo(pnpm) 모노레포 — `apps/web`(Next.js) · `apps/mobile`(Expo) · `packages/{schema-core, db, ui}`
- **`schema-core`** — FieldDef → Zod 컴파일 **실구현**. 논지 A가 문서상 주장이 아니라 **테스트 5/5 + strict 타입체크로 검증됨**.
- **`db`** — 고정 물리 스키마(`record_types`/`records`(JSONB)/`tags`) Drizzle 구현.
- CI(lint·type-check·test) · Docker Compose(Postgres) 골격.

실행/설치 방법은 [`docs/development.md`](./docs/development.md). 다음은 Phase 1 동기화 엔진 스파이크([ADR-0003](./docs/adr/0003-sync-engine-spike.md)).

---

## 이 저장소를 읽는 법 (케이스 스터디로서)

Lore는 "기능을 나열한 토이 프로젝트"가 아니라 **하나의 엔지니어링 케이스 스터디**다. 추천 순서:

1. `docs/discovery.md` — 어떤 실제 문제에서 출발했나 (What)
2. `docs/adr/0001`, `docs/adr/0005` — 왜 이 어려운 설계·플랫폼 전략을 택했나 (Why)
3. `docs/architecture.md` · `docs/ux-principles.md` — 어떻게 풀었나 (How)
4. `docs/roadmap.md` — 어떤 순서로 증명하나
