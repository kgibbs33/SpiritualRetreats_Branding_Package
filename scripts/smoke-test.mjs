// Smoke test — all public pages at 390px+1280px, head-dropdown keyboard, redirects
// Usage: node scripts/smoke-test.mjs [BASE_URL]
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";
const PAGES = [
  "/","/about","/retreat-planners","/find-a-venue","/find-a-facilitator",
  "/partner-with-us","/education","/contact","/privacy","/terms","/cookies",
  "/facilitator-directory","/admin/login",
];
const REDIRECTS = [
  { from: "/find-your-retreat", to: "/#search" },
  { from: "/for-retreat-owners", to: "/retreat-planners" },
  { from: "/why-work-with-us", to: "/retreat-planners" },
  { from: "/facilitators-portal", to: "/find-a-facilitator" },
  { from: "/make-your-retreat", to: "/education" },
  { from: "/facilitator-matching-form", to: "/find-a-facilitator" },
];

const results = [];
const browser = await chromium.launch();

// Find a published retreat slug
let publishedSlug = null;
try {
  const r = await (await browser.newContext()).request.get(`${BASE}/retreat-listings`, { timeout: 30000 });
  const html = await r.text();
  const m = html.match(/<a[^>]+href="\/retreat\/([^"]+)"/);
  if (m) publishedSlug = m[1];
} catch { /* fine */ }

for (const width of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  for (const p of PAGES) {
    try {
      const res = await ctx.request.get(BASE + p, { timeout: 30000 });
      results.push(`${width}px ${p} -> ${res.status() < 400 ? "PASS" : "FAIL"} (${res.status()})`);
    } catch (e) {
      results.push(`${width}px ${p} -> FAIL (${e.message.slice(0, 60)})`);
    }
  }
  if (publishedSlug) {
    try {
      const res = await ctx.request.get(`${BASE}/retreat/${publishedSlug}`, { timeout: 30000 });
      results.push(`${width}px /retreat/<slug> -> ${res.status() < 400 ? "PASS" : "FAIL"} (${res.status()})`);
    } catch (e) {
      results.push(`${width}px /retreat/<slug> -> FAIL (${e.message.slice(0, 60)})`);
    }
  }
  await ctx.close();

  // Dropdown keyboard test (desktop only)
  if (width === 1280) {
    try {
      const page = await (await browser.newContext({ viewport: { width, height: 800 } })).newPage();
      await page.goto(BASE + "/", { timeout: 30000 });
      const btn = page.locator('button[aria-haspopup="true"]');
      if (await btn.count() > 0) {
        await btn.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(500);
        const open = await btn.getAttribute("aria-expanded");
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        const closed = await btn.getAttribute("aria-expanded");
        results.push(`dropdown keyboard -> ${open === "true" && closed !== "true" ? "PASS" : "FAIL"}`);
      } else {
        results.push("dropdown keyboard -> SKIP (button not found)");
      }
      await page.close();
    } catch (e) {
      results.push(`dropdown keyboard -> FAIL (${e.message.slice(0, 60)})`);
    }
  }
}

// Redirects
for (const r of REDIRECTS) {
  try {
    const ctx = await browser.newContext();
    const res = await ctx.request.get(BASE + r.from, { maxRedirects: 0, timeout: 10000 });
    const status = res.status();
    const loc = res.headers()["location"] ?? "";
    results.push(`redirect ${r.from} -> ${status} ${loc} ${status === 308 || status === 301 ? "PASS" : "FAIL"}`);
    await ctx.close();
  } catch (e) {
    results.push(`redirect ${r.from} -> FAIL (${e.message.slice(0, 60)})`);
  }
}

console.log(results.join("\n"));
const failed = results.filter(r => r.includes("FAIL"));
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`);
await browser.close();
process.exit(failed.length ? 1 : 0);