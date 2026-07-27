# Deploy — 배포 가이드

Lore는 **local-first**라 배포가 두 단계로 나뉜다.
1. **웹 앱** — 서버 없이도 완전히 동작(오프라인·IndexedDB). Vercel에 올리면 끝.
2. **동기화 백엔드(선택)** — 여러 기기를 잇고 싶을 때만. Neon(Postgres)을 붙인다.

> 아래 계정 연결(Vercel 로그인, Neon 생성)은 소유자만 할 수 있다. 코드·설정·마이그레이션은 모두 준비돼 있어, **연결만 하면 뜬다.**

---

## 1. 웹 앱 → Vercel (5분, 백엔드 불필요)

1. [vercel.com](https://vercel.com) → **New Project** → GitHub의 `ghtjd626/Lore` import.
2. **Root Directory** 를 `apps/web` 로 지정. (모노레포이므로 중요)
   - Framework: Next.js (자동 감지)
   - Install: `pnpm install --frozen-lockfile` · Build: `next build` (`apps/web/vercel.json`에 명시됨; pnpm 워크스페이스를 루트에서 해석)
3. **Deploy.** 끝. 이 시점에서 앱은 **완전히 동작한다**(local-first). 프리셋·기록·다크모드 전부.

동기화는 아직 오프라인 상태로 남는다(서버 없음). 아래 2번을 하면 켜진다.

## 2. 동기화 백엔드 → Neon (선택)

`/api/sync`(Drizzle push/pull + LWW)를 켜려면 Postgres가 필요하다. Neon(서버리스 Postgres)이 Vercel과 잘 맞는다.

1. **Neon 프로젝트 생성** ([neon.tech](https://neon.tech)) → **pooled connection string** 복사
   (`postgresql://user:pass@ep-xxx-pooler.../lore?sslmode=require`).
2. **스키마 마이그레이션 적용** (로컬에서 1회):
   ```bash
   cd Lore
   DATABASE_URL="<neon-pooled-url>" pnpm --filter @lore/db db:migrate
   ```
   (`packages/db/drizzle/0000_*.sql`이 적용된다.)
3. **Vercel 환경변수**에 `DATABASE_URL = <neon-pooled-url>` 추가 → **Redeploy**.
4. 이제 앱 설정 화면의 **"지금 동기화"** 가 실제로 push/pull 한다.

### 주의
- `/api/sync`는 `runtime = "nodejs"`(postgres 드라이버가 edge 미지원).
- `DATABASE_URL`이 없으면 라우트는 **503을 반환하고 앱은 조용히 오프라인으로 유지**된다(local-first라 안전).
- 서버리스에서는 Neon **pooled** 엔드포인트를 써야 커넥션이 폭주하지 않는다.

## 3. CI

`.github/workflows/ci.yml`이 push/PR마다 lint·type-check·test를 돌린다. Vercel은 `main` push 시 자동 배포(레포 연결 시).

## 4. 모바일 앱

네이티브 앱 빌드/배포는 [`docs/app.md`](./app.md)(EAS) 참고.
