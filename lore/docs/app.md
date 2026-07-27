# App — 네이티브 앱 (Expo)

`apps/mobile`은 **웹과 `@lore/schema-core`를 공유**하는 진짜 Expo(React Native) 앱이다.
가계부/일기/할 일은 네이티브에서도 하드코딩이 아니라 FieldDef[]에서 폼·검증이 생성된다(논지 A).

## 구성
- **Expo Router**(파일 기반 라우팅) — `app/index.tsx`(홈) · `app/type/[id].tsx` · `app/record/new.tsx`
- **로컬 스토어:** 네이티브는 **expo-sqlite**(local-first 지속), 웹 타깃은 인메모리(검증/스크린샷용) — `lib/store.ts`에서 `Platform.OS`로 분기
- **검증/폼:** `@lore/schema-core`의 `compileRecordSchema`·`emptyRecordData`를 **웹과 같은 코드**로 사용(ADR-0004)
- **디자인:** 웹과 같은 정체성(그래파이트+앰버)을 네이티브 StyleSheet로. 유니버설 컴포넌트 공유(Tamagui)는 후속(ADR-0005/0009)

## 로컬 실행
```bash
cd Lore && pnpm install
pnpm --filter @lore/mobile start        # Expo Dev Server (QR → Expo Go 또는 시뮬레이터)
# 또는
pnpm --filter @lore/mobile ios          # iOS 시뮬레이터
pnpm --filter @lore/mobile android       # Android 에뮬레이터
pnpm --filter @lore/mobile web           # 브라우저(react-native-web)
```

## 번들 검증(계정 불필요)
```bash
pnpm --filter @lore/mobile type-check
pnpm --filter @lore/mobile export:web     # Metro 번들 성공 = 앱이 빌드됨
```
`e2e/web-smoke.mjs`가 export 결과를 구동해 홈·동적 폼 렌더를 스크린샷한다.

## 스토어 배포 (EAS — Expo 계정 필요)
실제 설치 파일(TestFlight/APK)은 Expo Application Services로 빌드한다. 이 부분만 소유자 계정이 필요하다.
```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --profile preview --platform ios      # 내부 테스트용
eas build --profile production --platform all    # 스토어 제출용
eas submit --platform ios                         # App Store Connect 제출
```
프로필은 `eas.json`에 정의돼 있다. `app.json`의 `bundleIdentifier`(iOS)·`package`(Android)를 본인 것으로 바꾸면 된다.
