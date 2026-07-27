# MVP Build Log

자율 빌드(밤샘) 진행 기록. 아침에 결과를 검토하기 위한 체크리스트 겸 상태판.

## 목표
`lore/` 시드에서 **동작하는 local-first 웹 MVP**를 처음부터 끝까지. 두 논지(사용자 정의 스키마 · local-first)를 실제 코드로 증명하고, 모바일 웹까지 반응형으로.

## 환경 제약(실측)
- Docker 미가동 → 로컬 Postgres 라이브 실행 불가. **서버/동기화는 코드+마이그레이션 SQL까지(라이브 실행은 문서화).**
- 독립 `lore` GitHub 레포 생성은 통합 권한(403)으로 불가 → `lore/` 시드에서 작업, **마이그레이션 스크립트+안내** 동봉.

## 스코프 결정
- **주력(동작·검증):** 사용자 정의 기록 종류 + 동적 폼/검증 + 기록 CRUD + 프리셋(가계부/할일/일기) + 대시보드/목록 + JSON export/import(데이터 소유) + 반응형/다크모드 UX.
- **작성·타입체크(라이브는 후속):** `/api/sync` Route Handler(Drizzle/LWW) + 클라이언트 동기화, Drizzle 마이그레이션 SQL.
- **후속(문서화):** Expo 네이티브 앱 폴리시, 관리형 동기화 엔진(ADR-0003 스파이크), 배포(Vercel/Neon/EAS).

## 진행 체크리스트
- [x] Phase 0 스캐폴드 + schema-core/db 검증(11/11 테스트)
- [x] schema-core 확장: emptyRecordData / validateFields (+테스트)
- [x] 웹 데이터 레이어: IndexedDB store · DAO · 서비스(타입/기록/프리셋/내보내기)
- [x] 웹 UI: 디자인 토큰 · 앱 셸/내비 · 동적 폼 · 필드 빌더
- [x] 화면: 대시보드 · 종류 생성/편집 · 기록 목록/생성/상세 · 설정
- [x] 서버 `/api/sync` + Drizzle 마이그레이션 생성(0000_*.sql)
- [x] 검증: **next build 통과(10 routes)** · **Playwright 스모크 전부 통과(10샷)**
- [x] 문서 갱신(README/roadmap/ADR 0006·0007) + 독립 레포 분리 가이드(standalone.md)

## 결과 요약 (아침 검토용)
- **동작하는 local-first 웹 MVP.** 오프라인·즉시성. 프리셋(가계부/할일/일기) 자동 시드.
- **논지 A 라이브 증명:** Playwright가 커스텀 종류("운동 기록")를 UI에서 만들어 대시보드에 표시 — 코드 배포 0.
- **논지 B:** 데이터는 IndexedDB(내 기기), JSON export/import로 소유·백업.
- **UX:** 반응형(모바일 하단 내비/데스크톱 사이드바) · 라이트/다크 · ₩ 통화 포맷 · 세그먼트 입력.
- **풀스택:** Next Route Handler `/api/sync`(Drizzle push/pull+LWW) + Postgres용 마이그레이션 SQL. (라이브 동기화는 Postgres 필요 → 후속)
- **후속:** 관리형 동기화 엔진 스파이크(ADR-0003) · Tamagui 유니버설 수렴 · 실제 배포/스토어 제출.

## 추가 완료 (네이티브 앱 · 배포 준비)
- **독립 레포:** [github.com/ghtjd626/Lore](https://github.com/ghtjd626/Lore) — 히스토리 보존 이관(subtree).
- **디자인 v2 + The Stream** 인터랙션 + **직접 만든 라인 아이콘 세트**(이모지 제거) — ADR-0008.
- **네이티브 앱**(`apps/mobile`): Expo Router · expo-sqlite · `schema-core` 공유 · 동적 폼. `expo export`(웹) 번들 성공 + RN-web 스크린샷 검증 — ADR-0009.
- **배포 준비:** `apps/web/vercel.json` · Drizzle 마이그레이션 · [deploy.md](./deploy.md)(Vercel+Neon) · [app.md](./app.md)(EAS). 계정 연결만 남음.
