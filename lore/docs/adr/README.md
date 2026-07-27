# Architecture Decision Records (ADR)

되돌리기 어렵거나 프로젝트의 방향을 규정하는 결정을 여기 기록한다.
각 ADR은 **What(무엇을) · Why(왜) · How(어떻게) · Trade-off(무엇을 포기했나)** 를 담으며,
가능하면 **반사실(counterfactual, "그 대안을 택했다면")** 까지 남긴다 — 판단의 근거를 미래의 나와 독자에게 전달하기 위해.

형식은 [MADR](https://adr.github.io/madr/)을 가볍게 따른다. 새 결정은 [`0000-template.md`](./0000-template.md)를 복사해 시작한다.

## 인덱스

| # | 제목 | 상태 |
|---|---|---|
| [0001](./0001-core-theses-and-dynamic-schema-as-data.md) | 핵심 논지 채택 + 동적 스키마를 데이터로 모델링 | Accepted |
| [0002](./0002-orm-drizzle.md) | ORM으로 Drizzle 채택 (Prisma 대신) | Accepted |
| [0003](./0003-sync-engine-spike.md) | 동기화 엔진은 스파이크 후 결정 | Proposed |
| [0004](./0004-monorepo-turborepo.md) | Turborepo 모노레포 채택 | Accepted |
| [0005](./0005-client-multiplatform-strategy.md) | 클라이언트/멀티플랫폼 전략: 유니버설(Expo+Next.js) | Accepted |
| [0006](./0006-mvp-local-store-indexeddb.md) | 웹 MVP 로컬 스토어로 IndexedDB 채택 | Accepted |
| [0007](./0007-web-design-system-css-tokens.md) | 웹 MVP 디자인 시스템: 손수 만든 CSS 토큰 | Accepted |
| [0008](./0008-visual-identity-and-home-signature-interaction.md) | 디자인 정체성 v2 + 홈 시그니처 인터랙션 "The Stream" | Accepted |

## 상태 정의
- **Proposed** — 제안됨, 아직 실증 전
- **Accepted** — 채택, 진행 근거
- **Superseded by ADR-XXXX** — 후속 결정으로 대체됨
- **Deprecated** — 더 이상 유효하지 않음
