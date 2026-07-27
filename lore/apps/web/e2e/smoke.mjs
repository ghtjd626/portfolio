// Lore 웹 MVP 스모크 — 실제 사용 흐름을 구동하고 스크린샷을 남긴다.
// 실행: node e2e/smoke.mjs  (프로덕션 서버가 BASE에 떠 있어야 함)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3939";
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOTS = process.env.SHOTS ?? "/tmp/shots";
mkdirSync(SHOTS, { recursive: true });

let failures = 0;
function check(cond, msg) {
  if (cond) {
    console.log("  ✓", msg);
  } else {
    console.log("  ✗", msg);
    failures++;
  }
}

const browser = await chromium.launch({ executablePath: EXEC });

async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  console.log("  📸", name);
}

// ---------- 데스크톱 흐름 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("가계부").first().waitFor({ timeout: 15000 });
  check(await page.getByText("가계부").first().isVisible(), "프리셋 '가계부' 표시");
  check(await page.getByText("할 일").first().isVisible(), "프리셋 '할 일' 표시");
  check(await page.getByText("일기").first().isVisible(), "프리셋 '일기' 표시");
  await shot(page, "01-dashboard-desktop-light");

  // 가계부 → 기록 추가
  await page.getByText("가계부").first().click();
  await page.waitForURL(/\/type\//);
  await page.getByRole("link", { name: "기록 추가" }).first().click();
  await page.waitForURL(/\/record\/new/);
  await page.locator("#f-title").fill("점심 김밥");
  await page.locator("#f-amount").fill("8000");
  await page.getByRole("button", { name: "식비", exact: true }).click();
  await page.locator("#f-memo").fill("맛있었다");
  await shot(page, "02-record-form-desktop");
  await page.getByRole("button", { name: "기록", exact: true }).click();
  await page.waitForURL(/\/type\/[^/]+$/);
  await page.getByText("점심 김밥").first().waitFor({ timeout: 10000 });
  check(await page.getByText("점심 김밥").first().isVisible(), "기록 생성 후 목록에 표시(local-first 즉시성)");
  await shot(page, "03-type-records-after-add");

  // 기록 상세
  await page.getByText("점심 김밥").first().click();
  await page.waitForURL(/\/record\/[^/]+$/);
  check(await page.getByText("₩8,000").first().isVisible(), "상세에 금액 ₩8,000 포맷 표시");
  await shot(page, "04-record-detail-desktop");

  // 커스텀 종류 생성(논지 A)
  await page.goto(`${BASE}/type/new`, { waitUntil: "networkidle" });
  await page.locator("#rt-name").fill("운동 기록");
  const labels = page.locator('input[placeholder="필드 이름"]');
  await labels.first().fill("종목");
  await page.getByRole("button", { name: "+ 필드 추가" }).click();
  await labels.nth(1).fill("시간(분)");
  // 두 번째 필드 타입을 숫자로
  await page.locator("select.select").nth(1).selectOption("number");
  await shot(page, "05-field-builder-desktop");
  await page.getByRole("button", { name: "만들기", exact: true }).click();
  await page.waitForURL(/\/type\/[^/]+$/);
  await page.goto(BASE, { waitUntil: "networkidle" });
  check(await page.getByText("운동 기록").first().isVisible(), "커스텀 종류가 대시보드에 표시(코드 배포 없이)");
  await shot(page, "06-dashboard-with-custom-type");

  await ctx.close();
}

// ---------- 모바일 흐름 (라이트) ----------
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("가계부").first().waitFor({ timeout: 15000 });
  check(await page.locator(".bottomnav").isVisible(), "모바일 하단 내비 표시(thumb-zone)");
  await shot(page, "07-dashboard-mobile-light");

  await page.goto(`${BASE}/type/new`, { waitUntil: "networkidle" });
  await page.locator("#rt-name").fill("독서");
  await shot(page, "08-type-form-mobile");
  await ctx.close();
}

// ---------- 모바일 흐름 (다크) ----------
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("가계부").first().waitFor({ timeout: 15000 });
  await shot(page, "09-dashboard-mobile-dark");

  // 다크 모드에서 기록 폼
  await page.getByText("일기").first().click();
  await page.waitForURL(/\/type\//);
  await page.getByRole("link", { name: "기록 추가" }).first().click();
  await page.waitForURL(/\/record\/new/);
  await shot(page, "10-record-form-mobile-dark");
  await ctx.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED ✅" : `${failures} CHECK(S) FAILED ❌`}`);
process.exit(failures === 0 ? 0 : 1);
