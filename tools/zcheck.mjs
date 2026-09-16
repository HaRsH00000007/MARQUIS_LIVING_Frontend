import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4500);
console.log(await p.evaluate(()=>{
  const btn=document.querySelector('[aria-label="Open menu"]');
  const r=btn.getBoundingClientRect();
  const cx=Math.round(r.x+r.width/2), cy=Math.round(r.y+r.height/2);
  const top=document.elementFromPoint(cx,cy);
  const chain=[]; let el=top;
  while(el && el!==document.documentElement){const s=getComputedStyle(el);chain.push(`${el.tagName}.${String(el.className).slice(0,40)} z=${s.zIndex} pos=${s.position} pe=${s.pointerEvents}`);el=el.parentElement;}
  const hdr=btn.closest('header'); const hs=getComputedStyle(hdr);
  return {cx,cy,btnRect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
    header:`z=${hs.zIndex} pos=${hs.position} pe=${hs.pointerEvents}`,
    btnPE:getComputedStyle(btn).pointerEvents, topChain:chain.slice(0,6)};
}));
await b.close();
