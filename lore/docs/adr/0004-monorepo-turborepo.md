# ADR-0004 — Turborepo 모노레포 채택

- **상태:** Accepted
- **날짜:** 2026-07-27
- **관련:** ADR-0001(schema-core 공유), ADR-0002(packages/db)

## What — 무엇을 결정하는가

프로젝트를 **Turborepo 모노레포**로 구성한다. `apps/web`(Next.js)와 공유 패키지(`packages/schema-core`, `packages/db`, `packages/ui`)로 나눈다.

## Context — 배경 / 결정 동인

- ADR-0001의 `schema-core`(FieldDef ↔ Zod 컴파일, 공유 타입)는 **클라이언트와 서버가 동시에 소비**해야 한다. Local-first라 클라에서도 서버와 동일한 검증 로직이 돌아야 한다.
- 검증 규칙이 클라·서버로 갈라지면 **로직 드리프트**(같은 데이터가 한쪽에선 통과, 다른 쪽에선 거부)가 생긴다.

## Considered Options — 검토한 선택지

- **단일 Next.js 앱(모노레포 아님)** — 가장 단순. 그러나 공유 코드의 경계가 흐려지고, 진짜 공유 패키지를 만들기 어렵다.
- **Turborepo(채택)** — 표준적 TS 모노레포. 캐시 빌드/테스트, 패키지 경계 명확.
- **Nx** — 강력하지만 1인 프로젝트엔 무겁고 학습곡선.

## Why — 결정과 근거

**Turborepo를 택한다.**

- **진짜 공유 니즈가 있다.** `schema-core`를 클라·서버가 함께 쓰는 것은 억지 분리가 아니라 **필연**. 이게 모노레포의 정당한 이유다.
- **클라이언트가 둘로 늘어 공유 이득이 더 크다.** ADR-0005의 유니버설 전략으로 웹+모바일 두 클라가 `schema-core`·`ui`(Tamagui)를 공유 → 모노레포의 정당성이 강화된다.
- **드리프트 방지.** 검증·타입을 단일 패키지로 두어 한 소스에서 관리.
- **경계의 가시화.** `apps/web`은 얇게, 도메인/데이터/UI는 패키지로 → 백엔드/아키텍처 역량이 구조로 드러난다.
- **CI 효율.** Turborepo 캐시로 lint/type/test를 변경분만.

## How — 어떻게 적용하나

```
lore/
  apps/
    web/               -- Next.js (App Router): 웹 UI + 서버(API·Drizzle/Postgres)
    mobile/            -- Expo (React Native, Expo Router): 네이티브 앱
  packages/
    schema-core/       -- FieldDef ↔ Zod, 공유 타입 (웹+모바일+서버)
    db/                -- Drizzle 스키마·쿼리 (서버)
    ui/                -- Tamagui 유니버설 컴포넌트·디자인 토큰 + 동적 폼 렌더러
  docs/
```

- 패키지 매니저 워크스페이스 + `turbo.json`으로 파이프라인(build/lint/test) 정의.
- CI(GitHub Actions)에서 Turborepo 캐시 활용.

## Trade-off / Consequences

- **좋은 점:** 공유 코드의 단일 소스, 명확한 경계, 캐시된 CI.
- **나쁜 점 / 감수하는 비용:** 초기 설정·툴링 오버헤드(워크스페이스, 빌드 파이프라인). 1인 프로젝트엔 얼마간 과할 수 있다.

## Counterfactual — 반사실

- **만약 `schema-core` 같은 클라·서버 공유 코드가 없었다면**, 단일 Next.js 앱이 정답이었다. 모노레포를 정당화하는 것은 오직 이 **실제 공유 의존성**이다.
- 즉 이 결정은 "공유 스키마 엔진이 존재한다"는 조건부다. 만약 설계가 바뀌어 그 공유가 사라지면 이 ADR은 재검토(Superseded) 대상이 된다.
