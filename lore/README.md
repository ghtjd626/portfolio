# Lore

> 내가 직접 정의하고, 내 기기에 살아있고, 오프라인에서도 즉시 동작하며 기기 간 동기화되는 **나만의 개인 기록 플랫폼.**

가계부 · 일기 · 할 일 · 일정 · 커리어 · 이력서 — 겉보기엔 다른 기능이지만, 전부 *"특정 시점에, 내가, 태그를 붙여 남기고, 나중에 검색·집계하는 데이터"* 라는 하나의 뿌리를 공유합니다. Lore는 이 공통 뿌리를 **사용자가 직접 정의하는 스키마**로 추상화하고, **local-first** 아키텍처로 온전히 내 것으로 만듭니다.

---

## 이 프로젝트가 존재하는 이유

- 기존 도구들은 파편화돼 있고(앱마다 따로), **내 데이터가 내 것이 아니며**(클라우드 종속), **내 입맛대로 구조를 바꿀 수 없다**.
- Lore는 이 세 가지를 정면으로 해결한다: **하나의 시스템 · 데이터 소유 · 무한한 커스터마이즈.**

자세한 배경은 [`docs/discovery.md`](./docs/discovery.md)(엔게이지먼트 브리프)와 [`docs/vision.md`](./docs/vision.md)를 참고.

## 두 개의 기술적 논지 (이 프로젝트의 척추)

1. **사용자 정의 스키마** — 도메인을 하드코딩하지 않는다. "기록 종류"를 사용자가 데이터로 정의한다.
2. **Local-first / 오프라인 우선** — 데이터는 내 기기에 있고, 오프라인에서도 즉시 동작하며, 기기 간 동기화된다.

두 논지는 서로 충돌하지만, **"동적 스키마를 코드가 아니라 데이터로 눕혀 물리 스키마를 고정한다"** 는 판단으로 해소한다. 이 결정이 이 프로젝트의 심장이며 [`ADR-0001`](./docs/adr/0001-core-theses-and-dynamic-schema-as-data.md)에 기록돼 있다.

## 기술 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 셸 | Next.js (App Router) + TypeScript | 통합 · 클라이언트 무게중심 |
| ORM | Drizzle | [ADR-0002](./docs/adr/0002-orm-drizzle.md) |
| 동기화 엔진 | Phase 1 스파이크 후 결정 | [ADR-0003](./docs/adr/0003-sync-engine-spike.md) |
| 구조 | Turborepo 모노레포 | [ADR-0004](./docs/adr/0004-monorepo-turborepo.md) |
| 검증 | Zod (필드정의 → 런타임 검증기) | [ADR-0001](./docs/adr/0001-core-theses-and-dynamic-schema-as-data.md) |
| UI | Tailwind + shadcn/ui + 동적 폼 렌더러 | — |
| 서버 DB | PostgreSQL (동기화 원천) | — |
| 인프라 | Docker · GitHub Actions · Vercel · Neon | — |

## 문서 지도

| 문서 | 내용 |
|---|---|
| [`docs/discovery.md`](./docs/discovery.md) | 엔게이지먼트 브리프 — 실제 문제·니즈·제약·성공 기준 (FDE discovery) |
| [`docs/vision.md`](./docs/vision.md) | 제품 비전 · 두 논지 · 스코프 · 원칙 |
| [`docs/architecture.md`](./docs/architecture.md) | 물리 스키마 · schema-core · 레이어 · 데이터 흐름 |
| [`docs/roadmap.md`](./docs/roadmap.md) | Phase 0–5 로드맵과 각 단계의 "증명" |
| [`docs/adr/`](./docs/adr/) | 아키텍처 결정 기록 (What / Why / How / Trade-off) |

## 현재 상태

**Phase 0 — 기반.** 문제 정의와 핵심 결정을 문서로 확정하는 단계. 코드 스캐폴딩은 Phase 0 완료 후 착수.

---

## 이 저장소를 읽는 법 (케이스 스터디로서)

Lore는 "기능을 나열한 토이 프로젝트"가 아니라 **하나의 엔지니어링 케이스 스터디**로 설계됐다. 읽는 순서를 추천한다:

1. `docs/discovery.md` — 어떤 실제 문제에서 출발했나 (What)
2. `docs/adr/0001` — 왜 이 어려운 설계를 택했나 (Why)
3. `docs/architecture.md` — 어떻게 풀었나 (How)
4. `docs/roadmap.md` — 어떤 순서로 증명하나
