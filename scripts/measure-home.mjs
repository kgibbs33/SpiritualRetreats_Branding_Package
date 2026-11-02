// Measure homepage hero + header logo at 390 and 1280 (no vision).
import { chromium } from "playwright";
const b = await chromium.launch();
for (const width of [390, 1280]) {
  const page = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle", timeout: 60000 });
  const report = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const r1 = h1?.getBoundingClientRect();
    const sub = [...document.querySelectorAll("p")].find(p => p.textContent?.includes("Leave the noise behind"));
    const rs = sub?.getBoundingClientRect();
    // logo: header image or emblem span
    const imgs = [...document.querySelectorAll("header img")];
    const vis = imgs.filter(i => getComputedStyle(i).display !== "none" && i.getBoundingClientRect().width > 0);
    const headerImg = vis[0];
    const ri = headerImg?.getBoundingClientRect();
    const visible = headerImg ? "visible" : "none";
    const heroH = document.querySelector("section[class*=min-h]")?.getBoundingClientRect().height;
    return {
      h1: r1 ? { font: getComputedStyle(h1).fontSize, w: Math.round(r1.width) } : null,
      sub: rs ? { font: getComputedStyle(sub).fontSize, w: Math.round(rs.width) } : null,
      logo: ri && visible !== "none" ? { w: Math.round(ri.width), h: Math.round(ri.height) } : "hidden",
      heroHeight: heroH ? Math.round(heroH) : null,
      // does the sub-heading overlap toward photo? measure right edge vs viewport
      subRight: rs ? Math.round(rs.right) : null,
    };
  });
  console.log(`${width}px:`, JSON.stringify(report));
  await page.close();
}
await b.close();