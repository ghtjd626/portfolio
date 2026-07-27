# ADR-0005 — 클라이언트/멀티플랫폼 전략: 유니버설 (Expo + Next.js)

- **상태:** Accepted
- **날짜:** 2026-07-27
- **관련:** ADR-0001(local-first), ADR-0003(동기화 엔진 — 모바일 런타임 지원), ADR-0004(모노레포), [ux-principles.md](../ux-principles.md)

## What — 무엇을 결정하는가

PC 웹과 모바일 **네이티브급** 앱을 동시에 제공하기 위해 **유니버설 아키텍처**를 채택한다.
- `apps/web` — **Next.js**(App Router): 웹 UI + 서버(API·Drizzle/Postgres 동기화 원천)
- `apps/mobile` — **Expo**(React Native, Expo Router): iOS/Android 네이티브 앱
- **Tamagui**(유니버설 UI 컴포넌트·디자인 토큰)와 **Solito**(웹↔네이티브 내비게이션 브리지)로 UI 대부분을 공유한다.

## Context — 배경 / 결정 동인

- 요구: "PC에서도 잘, 모바일은 **Toss·배민급 네이티브 UX**". UX가 1급 목표([ux-principles.md](../ux-principles.md)).
- 이미 Next.js(웹+백엔드)·local-first·Turborepo를 채택(ADR-0001~0004).
- 진짜 네이티브 "필"은 **웹뷰(PWA)로는 천장이 낮다** — 제스처·전환·스크롤 감각. → 네이티브 런타임이 필요.
- 1인·파트타임이라 **UI를 두 벌 만드는 비용**은 완주 리스크다(discovery §제약).

## Considered Options — 검토한 선택지

- **A. 유니버설 (채택)** — Expo + Next.js를 Tamagui/Solito로 묶어 **RN 기반 한 코드**가 웹+네이티브를 렌더. Next.js는 웹+서버로 유지.
- **B. 분리형** — Next.js(shadcn/Tailwind) 웹 + Expo(RN) 모바일을 **따로**, 로직만 공유. 양 플랫폼 품질 최고지만 UI 2벌.
- **C. PWA / Capacitor 웹뷰** — 단일 웹 코드. 작업 최소지만 네이티브 필 천장이 낮음.
- **(하위 대안) A2** — Expo Router로 **웹까지 단일화**(Next.js 제거).

## Why — 결정과 근거

**A를 택한다.**

- **요구를 정직하게 충족.** 네이티브 런타임을 확보해 Toss·배민급 필의 천장을 연다(C로는 도달 어려움).
- **솔로 완주 가능.** UI 대부분을 공유(Tamagui)해 B 대비 작업량이 크게 준다. "매일 쓰는 완성품"(성공 기준)에 유리.
- **기존 아키텍처와 정합.** Next.js를 유지해 성숙한 웹 SSR/SEO/서버·API·Drizzle/Postgres 동기화 원천을 그대로 활용 — ADR-0001~0004가 이 위에 서 있다.
- **local-first ↔ 즉시성 시너지.** 낙관적 UI·스피너 없는 즉시성이 아키텍처에서 따라온다(ux-principles의 즉시성 원칙).
- **응집된 서사 · 떠오르는 스킬.** "유니버설 한 코드 · local-first · 동적 스키마 · 네이티브+웹"은 하나의 강한 이야기.

## How — 어떻게 적용하나

- 모노레포(ADR-0004)에 `apps/web`, `apps/mobile` 추가. 공유는 `packages/ui`(Tamagui), `packages/schema-core`, `packages/db`.
- **유니버설 기본, 플랫폼별 탈출구.** 데이터 밀도 높은 데스크톱 대시보드 등은 web 전용 레이아웃을 허용.
- Solito로 화면/내비 공유, Tamagui 테마로 라이트/다크·디자인 토큰.
- 로컬 스토어는 플랫폼별: 웹 = SQLite-WASM/OPFS, 네이티브 = expo-sqlite. **동기화 엔진이 둘 다 지원해야 함** → ADR-0003의 필수 관문으로 반영.
- 모바일 배포는 EAS Build(TestFlight/내부 트랙).

## Trade-off / Consequences

- **좋은 점:** 네이티브 필 + 코드 공유 + Next.js 백엔드 유지 + 응집 서사.
- **나쁜 점 / 감수하는 비용:** Tamagui/Solito 학습곡선·빌드 설정 복잡도. RN 프리미티브라 데이터 밀도 높은 데스크톱 뷰는 web 전용 처리 필요. 유니버설 제약(일부 서드파티·스타일). → Phase 0에서 `apps/mobile` shell로 조기 리스크 확인.

## Counterfactual — 반사실

- **UX가 1급이 아니었다면** C(PWA)로 충분했고 작업이 최소였다. UX 요구가 네이티브 런타임을 정당화한다.
- **A2(Expo Router로 웹까지 단일화)** 는 더 단순하지만, Next.js의 성숙한 웹/서버와 기존 백엔드 ADR을 버려야 해 우리 전제와 충돌한다. **Next.js 유지가 A(=A1)를 정당화**한다.
- **각 플랫폼 절대 품질이 최우선이고 작업량 배증을 감수**한다면 B가 최선. 솔로 완주·응집 서사를 우선해 A를 택했다 — 만약 팀·시간이 늘면 B로의 이행(웹을 web 전용 폴리시로 분리)이 자연스러운 진화 경로다.
