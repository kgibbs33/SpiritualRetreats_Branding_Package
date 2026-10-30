// Screenshot / at 390px and 1280px
import { chromium } from "playwright";
const browser = await chromium.launch();
for (const width of [390, 1280]) {
  const page = await (await browser.newContext({ viewport: { width, height: 820 } })).newPage();
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: `/tmp/home-${width}.png`, fullPage: false });
  console.log(`shot ${width}`);
  await page.close();
}
await browser.close();
console.log("done");