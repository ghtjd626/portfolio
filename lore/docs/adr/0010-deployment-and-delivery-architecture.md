# ADR-0010 — 배포·딜리버리 아키텍처 (local-first가 배포를 바꾼다)

- **상태:** Accepted
- **날짜:** 2026-07-28
- **관련:** ADR-0001(local-first), ADR-0003(동기화), ADR-0006(로컬 스토어), ADR-0009(모바일)

## What — 무엇을 결정하는가

Lore의 **배포·딜리버리 아키텍처**를 정한다:
1. **이중 빌드 타깃** — (a) Next.js SSR/서버리스(프로덕션, Vercel) + (b) **정적 SPA(CDN/GitHub Pages)**.
2. **컨테이너 타깃** — Next standalone 멀티스테이지 Docker(포터블·자가호스팅).
3. **CI/CD** — GitHub Actions: test→build→deploy, 정적 배포는 자체 완결, 프로덕션은 게이팅.
4. **DB 마이그레이션** — "웹 기동 전에 먼저"(서버리스 콜드스타트 X).
5. **운영** — env 부팅 검증(fail-fast) + `/api/health` readiness.

## Context — 배경 (핵심 통찰)

> **local-first는 배포의 전제를 바꾼다.** 보통 "앱 = 항상 켜진 서버 + 크리티컬 패스의 DB"다. 그러나 Lore는 데이터 1차 사본이 기기에 있고(ADR-0001/0006), 서버는 **분리된 얇은 동기화 엔드포인트**일 뿐이다.

따라서:
- **클라이언트는 서버가 없어도 완전히 동작** → 그대로 **정적 자산으로 배포 가능**(CDN/Pages/오프라인).
- **DB는 크리티컬 패스가 아니다** → 다운돼도 앱은 살아있고, DB는 **0으로 스케일**돼도 된다(서버리스가 딱 맞음).
- 이건 흔한 배포 서사와 다른 **차별점**이다: "서버가 있어야 앱이 뜬다"를 뒤집는다.

## Considered Options

**웹 호스팅**
- **Vercel(프로덕션 채택)** — Next 1급 지원 · PR 프리뷰 환경 · 엣지 · 서버리스 함수(동기화). DX/속도 최상.
- **Cloudflare Pages/Workers** — 저렴·엣지 강함. 그러나 Next 서버 기능 호환이 더 번거로움.
- **컨테이너 자가호스팅(보조 채택)** — Docker standalone. 포터블하지만 운영 부담을 직접 진다.
- **정적만(보조 채택)** — 위 통찰 덕에 **가능**. 동기화는 못 붙지만 zero-infra.

**동기화 DB**
- **Neon(채택)** — 서버리스 Postgres · **0으로 스케일** · 브랜치(프리뷰별 DB) · 서버리스와 궁합. local-first라 "항상 켜진 DB"가 아깝다는 점과 정확히 맞물림.
- Supabase — 풍부하지만 우리에겐 과함(auth/realtime 등 non-goal).
- RDS/PlanetScale — 견고하나 상시 비용·운영 부담.

## Why — 근거

- **아키텍처가 배포를 규정한다.** local-first라서 (정적 클라이언트 + 얇은 서버리스 + 스케일-투-제로 DB)가 **자연스럽고 저비용**이다. 이 정합성이 이 결정의 핵심.
- **이중 타깃은 논지의 증거물.** 같은 코드가 SSR로도, 순수 정적으로도 뜬다는 건 "클라이언트가 서버에서 독립됐다"를 실증한다(정적 타깃은 실제로 GitHub Pages에 배포).
- **마이그레이션-우선 + 헬스 + env 검증**은 3년차 수준의 기본 운영 위생.

## How — 어떻게

- `apps/web`(Next `output: standalone`) · `apps/web-static`(Vite, 컴포넌트·schema-core 재사용, Next API는 얇은 어댑터).
- `apps/web/Dockerfile`(멀티스테이지·비루트·HEALTHCHECK) + `docker-compose.yml`(postgres→migrate→web).
- `.github/workflows/`: `ci.yml`(lint/test/build×3) · `pages.yml`(정적→Pages, 자체 완결) · `deploy.yml`(Vercel+마이그레이션, `DEPLOY_ENABLED`로 게이팅) · `mobile.yml`(EAS, 수동).
- `lib/env.ts`(zod 부팅 검증) · `app/api/health/route.ts`(DB readiness 포함).
- 상세: [docs/deploy.md](../deploy.md).

## Trade-off / Consequences

- **좋은 점:** 정체성과 정합된 저비용 배포 · 정적 라이브(자체 완결) · 포터블 컨테이너 · 실제 CI/CD.
- **감수하는 비용:** Vercel/Neon 락인(대신 컨테이너 타깃으로 탈출로 확보). 정적 타깃이 별도 빌드 경로(어댑터 shim)를 둔다. **클라우드 실배포는 소유자 계정 필요** — 파이프라인은 완비하되 시크릿은 레포에 두지 않는다(정석).

## Counterfactual

- 만약 Lore가 **서버 권위(server-authoritative)** 였다면(데이터 진실이 서버에), DB가 크리티컬 패스에 들어와 **정적 클라이언트 배포는 불가**, 항상 켜진 서버·블루/그린·읽기 복제본·세션 스토어가 필요했을 것이다. **정적 타깃을 만들 수 있다는 사실 자체가 local-first 아키텍처의 배포적 증거**다. 이 ADR은 ADR-0001에 종속된다.
