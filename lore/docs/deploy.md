# Delivery — 배포·운영

배포의 *근거*는 [ADR-0010](./adr/0010-deployment-and-delivery-architecture.md). 여기선 *운영 방법*을 적는다.

> **핵심:** Lore는 local-first라 **클라이언트는 서버 없이 동작**한다. 그래서 배포가 두 층이다 —
> (1) **정적 클라이언트**(어디든 올라감, 계정 불필요) (2) **동기화 백엔드**(다기기용, 선택).

## 배포 타깃 한눈에

| 타깃 | 무엇 | 계정 | 파이프라인 |
|---|---|---|---|
| **정적 클라이언트** | `apps/web-static` → CDN/GitHub Pages | 불필요(GITHUB_TOKEN) | `pages.yml` (자체 완결) |
| **프로덕션 웹** | `apps/web`(Next) → Vercel + 동기화 API | Vercel | `deploy.yml` (게이팅) |
| **컨테이너** | `apps/web/Dockerfile` → 자가호스팅 | 인프라 | `docker compose` |
| **모바일** | `apps/mobile` → EAS(TestFlight/APK) | Expo | `mobile.yml` (수동) |

## CI

`ci.yml` — push/PR마다: lint → schema-core 테스트 → **웹 빌드(Next, 타입체크 포함)** → **정적 클라이언트 빌드** → **모바일 타입체크**.

## 1. 정적 클라이언트 → GitHub Pages (자체 완결)

`pages.yml`이 `main` push 시 `apps/web-static`을 빌드해 Pages에 올린다. **토큰 불필요.**
저장소에서 **Settings → Pages → Source: GitHub Actions** 한 번만 켜면 워크플로가 배포한다.
→ `https://ghtjd626.github.io/Lore/`

로컬 확인:
```bash
pnpm --filter @lore/web-static build   # apps/web-static/dist
pnpm --filter @lore/web-static preview  # http://localhost:4173
```

## 2. 프로덕션 웹 → Vercel (+ Neon)

`deploy.yml`은 저장소 변수 `DEPLOY_ENABLED=true` + 시크릿이 있을 때만 동작(없으면 안전한 no-op).

1. **Neon**: 프로젝트 생성 → **pooled** connection string.
2. **Vercel**: `Lore` import → Root Directory `apps/web`.
3. **GitHub 시크릿/변수 설정**:
   - Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DATABASE_URL`(Neon pooled)
   - Variables: `DEPLOY_ENABLED=true`
4. push → **마이그레이션(웹 기동 전) → 배포** 순으로 자동 실행.
   - 마이그레이션 전략: 서버리스 콜드스타트가 아니라 **배포 잡에서 한 번**(`drizzle-kit migrate`).

## 3. 컨테이너 (자가호스팅)

```bash
docker compose up --build      # postgres → migrate → web  (http://localhost:3000)
```
- `apps/web/Dockerfile`: 멀티스테이지(Next `standalone`), 비루트 유저, `HEALTHCHECK`.
- 로컬 검증 완료: `pnpm --filter @lore/web build` → `.next/standalone/apps/web/server.js` 산출.
  (이 환경엔 Docker 데몬이 없어 이미지 빌드 자체는 미실행 — Dockerfile·compose는 표준 패턴.)

## 4. 모바일 → EAS

[app.md](./app.md) 참고. `mobile.yml`은 수동 트리거 + `EAS_ENABLED=true` + `EXPO_TOKEN` 시크릿일 때만.

## 운영

- **환경변수 검증:** `apps/web/lib/env.ts`(zod). 잘못된 설정은 부팅 시 fail-fast.
- **헬스체크:** `GET /api/health` → `{status, db}`. DB 설정 시 연결까지(readiness) 확인, 실패 시 503.
  `local-first`라 DB 미설정이어도 앱은 `status: ok`(db: not-configured).
- **롤백:** Vercel은 이전 배포로 즉시 롤백(불변 배포). 정적은 이전 Pages 아티팩트로 재배포.
