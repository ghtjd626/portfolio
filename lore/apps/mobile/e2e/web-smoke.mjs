// 모바일(Expo) 앱을 react-native-web로 export한 결과를 구동해 스크린샷.
// 네이티브와 "같은 코드"(expo-router 화면 + @lore/schema-core 검증)가 실제로 렌더됨을 확인한다.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:8091";
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOTS = process.env.SHOTS ?? "/tmp/mshots";
const DARK = !!process.env.DARK;
mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (c, m) => { console.log(c ? "  ✓" : "  ✗", m); if (!c) failures++; };

const browser = await chromium.launch({ executablePath: EXEC });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: DARK ? "dark" : "light",
});
const page = await ctx.newPage();
const shot = async (n) => { await page.screenshot({ path: `${SHOTS}/${n}.png` }); console.log("  📸", n); };
const sfx = DARK ? "-dark" : "";

await page.goto(BASE, { waitUntil: "networkidle" });
await page.getByText("가계부").first().waitFor({ timeout: 25000 });
check(true, "홈 렌더 (프리셋 시드 · react-native-web)");
await shot(`m-01-home${sfx}`);

await page.getByText("가계부").first().click();
await page.waitForTimeout(600);
check(await page.getByText("첫 기록을 남겨보세요").first().isVisible().catch(() => false), "종류 화면 렌더");
await shot(`m-02-type${sfx}`);

await page.getByText("+", { exact: true }).first().click();
await page.waitForTimeout(700);
// 동적 폼: 가계부 필드(내용/금액/분류)가 schema-core 정의로 렌더되는지
check(await page.getByText("분류").first().isVisible().catch(() => false), "동적 폼 렌더 (FieldDef → 입력)");
await shot(`m-03-form${sfx}`);

await browser.close();
console.log(`\n${failures === 0 ? "MOBILE WEB SMOKE PASSED ✅" : `${failures} FAILED ❌`}`);
process.exit(failures === 0 ? 0 : 1);
