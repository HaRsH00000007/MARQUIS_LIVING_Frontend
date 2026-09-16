import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
async function probe(url, sel){
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(4000);
  const r = await p.evaluate((sel)=>{
    const el=document.querySelector(sel); if(!el) return null;
    const s=getComputedStyle(el); const rect=el.getBoundingClientRect();
    // measure a probe span to get real glyph advance
    const t=document.createElement('span');
    t.style.cssText=`font-family:${s.fontFamily};font-size:100px;font-weight:${s.fontWeight};position:absolute;visibility:hidden;white-space:nowrap`;
    t.textContent='RESIDENCE';
    document.body.appendChild(t);
    const w=t.getBoundingClientRect().width;
    t.textContent='H'; const capW=t.getBoundingClientRect().width;
    t.remove();
    return {fs:s.fontSize, lh:s.lineHeight, ff:s.fontFamily.split(',')[0], w:Math.round(rect.width), h:Math.round(rect.height), residenceAt100:Math.round(w), hAt100:Math.round(capW)};
  }, sel);
  await p.context().close();
  return r;
}
console.log('REF h1 ', JSON.stringify(await probe('https://www.era-residence.com/','h1')));
console.log('LOC h1 ', JSON.stringify(await probe('http://localhost:3000/','h1')));
await b.close();
