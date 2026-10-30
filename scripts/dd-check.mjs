import { chromium } from "playwright";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 120)); });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle", timeout: 60000 });
const btn = page.locator('button[aria-haspopup="true"]').first();
await btn.scrollIntoViewIfNeeded();
await btn.focus();
const focused = await page.evaluate(() => {
  const el = document.activeElement;
  return `${el?.tagName}.${String(el?.className).slice(0, 40)}`;
});
console.log("focused:", focused);
await page.evaluate(() => {
  const el = document.querySelector('button[aria-haspopup="true"]');
  el?.addEventListener("keydown", (e) => console.log("RAWKEY", e.key));
});
await page.keyboard.press("Enter");
await page.waitForTimeout(600);
console.log("expanded after Enter:", await btn.getAttribute("aria-expanded"));
// dropdown menu visibility via the desktop dropdown link (aria Main nav) — use href filter
const menuLink = page.locator('nav[aria-label="Main"] a[href="/find-a-venue"]');
console.log("dropdown link count in Main nav:", await menuLink.count());
if (await menuLink.count()) console.log("dropdown link visible:", await menuLink.isVisible());
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("expanded after Escape:", await btn.getAttribute("aria-expanded"));
await b.close();