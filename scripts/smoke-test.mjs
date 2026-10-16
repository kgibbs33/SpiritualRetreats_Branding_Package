// Smoke test — public pages at 390px and 1280px, header dropdown via keyboard.
// Usage: node scripts/smoke-test.mjs <BASE_URL>
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const pages = [
  "/",
  "/about",
  "/retreat-planners",
  "/find-a-venue",
  "/find-a-facilitator",
  "/partner-with-us",
  "/education",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/admin/login",
  "/retreat/meditation-nature", // published slug — spot check; fallback below
];

const redirects = [
  { from: "/find-your-retreat", to: "/#search" },
  { from: "/for-retreat-owners", to: "/retreat-planners" },
  { from: "/why-work-with-us", to: "/retreat-planners" },
  { from: "/facilitators-portal", to: "/find-a-facilitator" },
  { from: "/make-your-retreat", to: "/education" },
  { from: "/facilitator-matching-form", to: "/find-a-facilitator" },
];

const results = [];
const browser = await chromium.launch();

for (const width of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  for (const p of pages) {
    try {
      const res = await ctx.request.get(BASE + p);
      let status = res.status();
      if (status === 404 && p.includes("/retreat/")) {
        status = "SKIP(no published slug)" ;
      }
      results.push(`${width}px ${p} -> ${status < 500 ? "PASS" : "FAIL"} (${status})`);
    } catch (e) {
      results.push(`${width}px ${p} -> FAIL (${e.message.slice(0, 60)})`);
    }
  }

  // Dropdown keyboard test (desktop only)
  if (width === 1280) {
    try {
      const page = await (await browser.newContext({ viewport: { width, height: 800 } })).newPage();
      await page.goto(BASE + "/");
      await page.keyboard.press("Tab");
      // focus toggle by searching for the button
      const btn = page.locator('button[aria-haspopup="true"]');
      if (await btn.count()) {
        await btn.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(200);
        const open = await btn.getAttribute("aria-expanded");
        await page.keyboard.press("Escape");
        results.push(`dropdown keyboard -> ${open === "true" ? "PASS" : "FAIL"}`);
      } else {
        results.push("dropdown keyboard -> SKIP(button not found)");
      }
      await page.close();
    } catch (e) {
      results.push(`dropdown keyboard -> FAIL (${e.message.slice(0, 60)})`);
    }
  }
  await ctx.close();
}

for (const r of redirects) {
  try {
    const res = await browser.newContext().then(c => c.request.get(BASE + r.from, { maxRedirects: 0 }));
    const loc = res.headers()["location"] ?? "(none)";
    const status = res.status();
    results.push(`redirect ${r.from} -> ${status} Location: ${loc} ${status === 308 || status === 301 ? "CHECK" : "FAIL"}`);
  } catch (e) {
    results.push(`redirect ${r.from} -> FAIL (${e.message.slice(0, 60)})`);
  }
}

console.log(results.join("\n"));
await browser.close();
const failed = results.filter(r => r.includes("FAIL"));
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);