# ADR-0006 — 웹 MVP 로컬 스토어로 IndexedDB 채택

- **상태:** Accepted (MVP 한정, 동기화 엔진 스파이크에서 재평가)
- **날짜:** 2026-07-27
- **관련:** ADR-0003(동기화 엔진 스파이크), architecture.md §5

## What — 무엇을 결정하는가

웹 클라이언트의 **로컬 1차 사본(논지 B)** 을 MVP에서는 **IndexedDB**로 구현한다(`idb` 래퍼 + DAO 계층).

## Context — 배경

- architecture.md는 로컬 스토어의 *목표*로 **SQLite-WASM/OPFS**를 적었다.
- 그러나 (a) MVP를 빨리 **동작·검증**해야 하고, (b) 동기화 엔진(ADR-0003)이 아직 미정이라 스토어 형태가 그 선택에 종속된다.
- SQLite-WASM/OPFS는 강력하지만 설정·번들·헤더(COOP/COEP) 요구가 무겁다.

## Considered Options

- **IndexedDB (채택)** — 브라우저 내장, 구조화·인덱스·트랜잭션 지원, 설정 0.
- **SQLite-WASM / OPFS** — SQL·관계 쿼리 강력. 설정 무겁고 검증 비용 큼.
- **localStorage** — 너무 단순(동기·문자열·용량 한계). 탈락.

## Why — 근거

- **빠른 동작·검증.** IndexedDB로 오프라인 CRUD를 즉시 세워 두 논지를 실증했다(Playwright 스모크 통과).
- **경계 뒤에 격리.** 스토어 접근은 `lib/store/dao.ts`(DAO) 뒤에 있고 서비스는 그 위에 있다 → **교체 비용이 국소적.**
- **동기화 엔진과 함께 재평가.** 엔진이 자체 SQLite 스토어를 제공/강제할 수 있으므로, 지금 SQLite-WASM에 시간을 쓰는 건 이르다.

## How

- `idb`로 스토어 3개(`record_types`, `records`(+인덱스), `meta`).
- 엔티티는 이식성을 위해 시간을 ISO 문자열로, 동기화용 `dirty` 플래그 포함.

## Trade-off / Consequences

- **좋은 점:** 즉시성·오프라인·검증 용이, 의존성 최소.
- **감수하는 비용:** 복잡한 관계 쿼리·조인·핫필드 인덱싱은 SQLite보다 약하다. 대규모 집계 성능은 후속 과제.

## Counterfactual

- 만약 동기화 엔진이 이미 정해져 **자체 로컬 스토어(SQLite 등)를 강제**했다면, 그 스토어를 바로 썼을 것이다. 미정이라는 사실이 "가볍고 교체 쉬운" IndexedDB를 정당화한다. 엔진 확정 시 이 ADR은 **Superseded** 후보다.
