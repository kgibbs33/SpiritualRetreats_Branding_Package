// Screenshot /about at 390, 820, 1280
import { chromium } from "playwright";
const b = await chromium.launch();
for (const width of [390, 820, 1280]) {
  const page = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
  await page.goto("http://localhost:3100/about", { waitUntil: "networkidle", timeout: 60000 });
  await page.locator("section:has(h2:text-is(\"Team\"))").screenshot({ path: `/tmp/about-${width}.png` });
  console.log(`shot about-${width}`);
  await page.close();
}
await b.close();