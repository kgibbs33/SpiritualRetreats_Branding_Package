// Measure the Team section layout without screenshots/vision.
import { chromium } from "playwright";
const b = await chromium.launch();
for (const width of [390, 820, 1280]) {
  const page = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
  await page.goto("http://localhost:3100/about", { waitUntil: "networkidle", timeout: 60000 });
  const sec = page.locator('section:has(h2:text-is("Team"))');
  await sec.scrollIntoViewIfNeeded();
  const cards = sec.locator("div.rounded-2xl");
  const n = await cards.count();
  const rects = [];
  for (let i = 0; i < n; i++) {
    const r = await cards.nth(i).boundingBox();
    if (r) rects.push({ i, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
  }
  // columns = number of distinct x positions
  const xs = [...new Set(rects.map(r => r.x))];
  const ys = [...new Set(rects.map(r => r.y))];
  const imgs = await sec.locator("img").count();
  const monos = await sec.locator('[role="img"]').count();
  const clipped = await page.evaluate(() => {
    const sec2 = [...document.querySelectorAll("section")].find(s => s.querySelector('h2')?.textContent === "Team");
    if (!sec2) return null;
    const els = sec2.querySelectorAll("div.rounded-2xl");
    let overflow = 0;
    els.forEach(e => { if (e.scrollWidth > e.clientWidth + 1) overflow++; });
    return { overflowCards: overflow, sectionScrollW: sec2.scrollWidth, sectionClientW: sec2.clientWidth };
  });
  console.log(`\n${width}px: cards=${n} cols=${xs.length} rows=${ys.length} imgs=${imgs} monograms=${monos}`);
  console.log(`  rects:`, JSON.stringify(rects));
  console.log(`  clipping:`, JSON.stringify(clipped));
  await page.close();
}
await b.close();