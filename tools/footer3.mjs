import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(5000);
await p.addStyleTag({content:'.modal,[class*=cookie]{display:none!important}'});
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=600){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(90);}
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(2000);
const rows = await p.evaluate(() => {
  const deep = (root) => [...document.querySelectorAll(root + ' *')]
    .filter(e => e.children.length === 0 && e.textContent.trim())
    .map(e => {
      const s = getComputedStyle(e), b = e.getBoundingClientRect();
      return { root, text: e.textContent.trim().slice(0, 40), cls: String(e.className),
        fs: s.fontSize, ff: s.fontFamily.split(',')[0], fw: s.fontWeight, lh: s.lineHeight,
        ls: s.letterSpacing, tt: s.textTransform,
        x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), hh: Math.round(b.height) };
    });
  return [].concat(deep('.contact-cms_list'), deep('.footer-s_address'), deep('.legal-cms'), deep('.footer-s_credits'));
});
for (const r of rows) console.log(`${r.root} | "${r.text}" cls=${r.cls} fs=${r.fs} ff=${r.ff} fw=${r.fw} lh=${r.lh} ls=${r.ls} tt=${r.tt} box=${r.x},${r.y} ${r.w}x${r.hh}`);
await b.close();
