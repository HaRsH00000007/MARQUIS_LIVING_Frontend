import { chromium } from 'playwright-core';
import fs from 'fs';

const OUT = 'C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website';
const URL = process.argv[2] || 'https://www.era-residence.com/';
const TAG = process.argv[3] || 'home';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const reqs = [];
page.on('response', r => { const u = r.url(); reqs.push({ url: u, type: r.request().resourceType(), status: r.status(), len: r.headers()['content-length'] || '' }); });

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);

// slow scroll through page to trigger lazy load + scroll animations
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 600) {
  await page.evaluate(y => window.scrollTo(0, y), y);
  await page.waitForTimeout(250);
}
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1500);

fs.writeFileSync(`${OUT}/docs/net-${TAG}.json`, JSON.stringify(reqs, null, 1));

// section outline
const outline = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('body > * , main > *, .page-wrapper > *, [class*="section"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height < 40) return;
    out.push({
      tag: el.tagName, cls: el.className && el.className.toString().slice(0,160), id: el.id,
      top: Math.round(r.top + window.scrollY), h: Math.round(r.height),
      bg: getComputedStyle(el).backgroundColor,
      text: (el.innerText||'').replace(/\s+/g,' ').slice(0,180)
    });
  });
  return out;
});
fs.writeFileSync(`${OUT}/docs/outline-${TAG}.json`, JSON.stringify(outline, null, 1));

const html = await page.content();
fs.writeFileSync(`${OUT}/reference-download/html/rendered-${TAG}.html`, html);

await browser.close();
console.log('reqs', reqs.length, 'outline', outline.length, 'height', h);
