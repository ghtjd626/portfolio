# ADR-0009 — 네이티브 앱 스택: Expo Router + expo-sqlite (Tamagui는 후속)

- **상태:** Accepted (모바일 MVP)
- **날짜:** 2026-07-27
- **관련:** ADR-0005(유니버설 전략), ADR-0006(웹 로컬 스토어), ADR-0004(schema-core 공유)

## What

`apps/mobile`을 **Expo Router + expo-sqlite + 자체 StyleSheet**로 구현한다. `@lore/schema-core`를 웹과 공유해 폼·검증을 만든다. **Tamagui 유니버설 컴포넌트 공유는 이번엔 하지 않는다.**

## Context

- ADR-0005의 목표는 Tamagui/Solito로 웹·네이티브 UI를 공유하는 것. 하지만 Tamagui 설정은 무겁고(컴파일러·프로바이더), 이번 목표는 **동작하는 네이티브 앱을 빠르게** 세워 "shared core → native" 논지를 실증하는 것.
- 검증 환경에 시뮬레이터가 없어, 번들·타입·react-native-web 렌더로 검증해야 한다.

## Considered Options

- **Tamagui 유니버설 지금(A)** — 목표엔 부합하나 설정·검증 리스크가 커 속도를 해침.
- **Expo Router + expo-sqlite + RN 프리미티브(B, 채택)** — schema-core는 공유하되 UI는 네이티브 전용. 빠르고 확실.
- **웹뷰로 웹 앱 감싸기(C)** — 네이티브 느낌이 죽고 논지(진짜 네이티브)와 어긋남(탈락, ADR-0005와 동일).

## Why

- **핵심(schema-core)은 공유, UI는 플랫폼 최적.** 진짜 공유 이득(FieldDef→검증)은 그대로 얻으면서, 각 플랫폼은 자기 강점으로 렌더.
- **local-first를 네이티브에서도.** expo-sqlite로 기기 저장(웹의 IndexedDB에 대응, ADR-0006과 대칭).
- **검증 가능.** `expo export` 번들 성공 + react-native-web 스크린샷으로 "네이티브 코드가 실제로 돈다"를 증명.

## How

- `lib/store.ts`가 `Platform.OS`로 분기: 네이티브=expo-sqlite, 웹=인메모리(데모/검증).
- 화면은 Expo Router 파일 기반. 폼은 `components/DynamicForm.tsx`가 FieldDef→RN 입력으로 렌더 후 `compileRecordSchema`로 검증.

## Trade-off / Consequences

- **좋은 점:** 빠르게 동작하는 네이티브 앱 + 공유 코어의 실증.
- **감수하는 비용:** 웹(CSS)과 네이티브(StyleSheet)의 **UI 계층이 갈라진다** — 토큰 값·UX 규칙은 이전 가능하지만 컴포넌트는 아직 공유 안 됨. Tamagui로 수렴하는 것은 별도 작업.

## Counterfactual

- 만약 팀이 여럿이고 화면 수가 많았다면, 초기에 Tamagui를 세워 UI 중복을 없애는 게 옳았다. **1인·MVP·검증 제약**이 "코어만 공유, UI는 분리"를 합리화한다. 화면이 늘면 ADR-0005로 수렴하며 이 결정을 재검토한다.
