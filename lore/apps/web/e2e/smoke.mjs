// Lore 웹 MVP 스모크 — 실제 흐름 구동 + 스크린샷.
// 여러 종류의 기록을 시간에 걸쳐 생성해 홈의 The Stream이 살아있게 만든 뒤 캡처한다.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3939";
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOTS = process.env.SHOTS ?? "/tmp/shots";
mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (c, m) => { console.log(c ? "  ✓" : "  ✗", m); if (!c) failures++; };

const pad = (n) => String(n).padStart(2, "0");
function daysAgoLocal(d, hh = 12, mm = 0) {
  const t = new Date(Date.now() - d * 86400000);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(hh)}:${pad(mm)}`;
}

const browser = await chromium.launch({ executablePath: EXEC });
const shot = async (page, name) => {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  console.log("  📸", name);
};

async function gotoType(page, name) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("a.type-tile").filter({ hasText: name }).first().click();
  await page.waitForURL(/\/type\/[^/]+$/);
}
async function openAddForm(page) {
  await page.getByRole("link", { name: "기록 추가" }).first().click();
  await page.waitForURL(/\/record\/new/);
}
async function save(page) {
  await page.getByRole("button", { name: "기록", exact: true }).click();
  await page.waitForURL(/\/type\/[^/]+$/);
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 880 } });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("The Stream").waitFor({ timeout: 15000 });
  check(await page.locator(".stream-canvas").isVisible(), "홈 시그니처 인터랙션 'The Stream' 렌더");
  await shot(page, "01-home-empty-desktop");

  // 가계부 3건 (시간 분산)
  await gotoType(page, "가계부");
  const expenses = [
    ["점심 김밥", "8000", "식비", 0],
    ["버스", "1500", "교통", 2],
    ["영화", "14000", "문화", 6],
  ];
  for (const [title, amount, cat, ago] of expenses) {
    await openAddForm(page);
    await page.locator("#rec-when").fill(daysAgoLocal(ago, 12, 30));
    await page.locator("#f-title").fill(title);
    await page.locator("#f-amount").fill(amount);
    await page.getByRole("button", { name: cat, exact: true }).click();
    await save(page);
  }

  // 할 일 2건
  await gotoType(page, "할 일");
  for (const [title, ago, pr] of [["PR 리뷰", 1, "높음"], ["운동", 3, "보통"]]) {
    await openAddForm(page);
    await page.locator("#rec-when").fill(daysAgoLocal(ago, 9, 0));
    await page.locator("#f-title").fill(title);
    await page.getByRole("button", { name: pr, exact: true }).click();
    await save(page);
  }

  // 일기 2건
  await gotoType(page, "일기");
  for (const [mood, body, ago] of [["좋음", "오늘은 집중이 잘 됐다.", 1], ["보통", "비가 왔다.", 5]]) {
    await openAddForm(page);
    await page.locator("#rec-when").fill(daysAgoLocal(ago, 22, 0));
    await page.getByRole("button", { name: mood, exact: true }).click();
    await page.locator("#f-body").fill(body);
    await save(page);
  }

  // 홈: 스트림이 데이터로 살아남
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("The Stream").waitFor();
  const markCount = await page.locator(".mark").count();
  check(markCount >= 7, `The Stream에 마크 ${markCount}개 (여러 종류가 하나의 시간축에)`);
  await page.waitForTimeout(300);
  await shot(page, "02-home-stream-desktop-light");

  // 자기장 + 툴팁 (커서를 마크 위로)
  const mark = page.locator(".mark").first();
  const box = await mark.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(250);
  }
  await shot(page, "03-home-stream-magnet");

  // 다른 화면들 (새 디자인)
  await gotoType(page, "가계부");
  await shot(page, "04-type-records-desktop");
  await page.goto(`${BASE}/type/new`, { waitUntil: "networkidle" });
  await page.locator("#rt-name").fill("운동 기록");
  await page.locator('input[placeholder="필드 이름"]').first().fill("종목");
  await shot(page, "05-field-builder-desktop");

  await ctx.close();
}

// 모바일 라이트
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("The Stream").waitFor({ timeout: 15000 });
  // 모바일에서도 데이터를 보이게 하나 만든다
  await gotoType(page, "가계부");
  await openAddForm(page);
  await page.locator("#f-title").fill("커피");
  await page.locator("#f-amount").fill("4500");
  await page.getByRole("button", { name: "식비", exact: true }).click();
  await save(page);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("The Stream").waitFor();
  await page.waitForTimeout(300);
  check(await page.locator(".bottomnav").isVisible(), "모바일 하단 내비");
  await shot(page, "06-home-mobile-light");
  await ctx.close();
}

// 모바일 다크
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("The Stream").waitFor({ timeout: 15000 });
  await gotoType(page, "일기");
  await openAddForm(page);
  await page.getByRole("button", { name: "최고", exact: true }).click();
  await page.locator("#f-body").fill("좋은 하루.");
  await save(page);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByText("The Stream").waitFor();
  await page.waitForTimeout(300);
  await shot(page, "07-home-mobile-dark");
  await gotoType(page, "일기");
  await openAddForm(page);
  await shot(page, "08-record-form-mobile-dark");
  await ctx.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED ✅" : `${failures} CHECK(S) FAILED ❌`}`);
process.exit(failures === 0 ? 0 : 1);
