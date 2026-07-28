// 정적 클라이언트 빌드가 실제로 동작하는지 검증(해시 라우팅 · 로컬 스토어 · schema-core).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:8092";
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOTS = process.env.SHOTS ?? "/tmp/sshots";
mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (c, m) => { console.log(c ? "  ✓" : "  ✗", m); if (!c) failures++; };

const browser = await chromium.launch({ executablePath: EXEC });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();
const shot = async (n) => { await page.screenshot({ path: `${SHOTS}/${n}.png` }); console.log("  📸", n); };

await page.goto(BASE, { waitUntil: "networkidle" });
await page.getByText("The Stream").waitFor({ timeout: 15000 });
check(await page.getByText("가계부").first().isVisible(), "정적 빌드: 홈 + The Stream + 프리셋 렌더");
await shot("static-01-home");

// 가계부 → 기록 추가 (해시 라우팅 + 로컬 스토어 + 검증)
await page.locator("a.type-tile").filter({ hasText: "가계부" }).first().click();
await page.waitForFunction(() => location.hash.startsWith("#/type/"), { timeout: 5000 });
await page.getByRole("link", { name: "기록 추가" }).first().click();
await page.waitForFunction(() => location.hash.includes("/record/new"), { timeout: 5000 });
await page.locator("#f-title").fill("정적 배포 테스트");
await page.locator("#f-amount").fill("5000");
await page.getByRole("button", { name: "식비", exact: true }).click();
await page.getByRole("button", { name: "기록", exact: true }).click();
await page.getByText("정적 배포 테스트").first().waitFor({ timeout: 8000 });
check(true, "해시 라우팅 + 로컬 스토어 저장 + schema-core 검증 동작");
await shot("static-02-record");

await browser.close();
console.log(`\n${failures === 0 ? "STATIC BUILD SMOKE PASSED ✅" : `${failures} FAILED ❌`}`);
process.exit(failures === 0 ? 0 : 1);
