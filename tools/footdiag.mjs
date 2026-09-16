import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
  const cs=getComputedStyle(document.documentElement);
  const foot=document.querySelector('footer');
  const q=(sel)=>{const e=foot.querySelector(sel); if(!e) return sel+' MISSING';
    const s=getComputedStyle(e), b=e.getBoundingClientRect();
    return `${sel}: w=${s.width} box=${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)} cls=${String(e.className).slice(0,60)}`;};
  return {
    htmlFontSize: cs.fontSize,
    u64: cs.getPropertyValue('--u-64'),
    u192: cs.getPropertyValue('--u-192'),
    u136: cs.getPropertyValue('--u-136'),
    footW: foot.getBoundingClientRect().width,
    lines: [
      q('[class*=inner]'), q('[class*=bottom]'), q('[class*=__info]'),
      q('address'), q('svg'), q('[class*=toTop]'),
    ],
  };
}));
await b.close();
