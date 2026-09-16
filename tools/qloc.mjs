import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(5000);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  const sec=document.querySelector('[class*=Quote-module][class*=section]');
  const r0=sec.getBoundingClientRect();
  const out=['SECTION doc-top='+Math.round(r0.top+scrollY)+' h='+Math.round(r0.height)];
  for (const sel of ['[class*=Quote-module][class*=bg]','[class*=Quote-module][class*=img]','[class*=Quote-module][class*=quote]','[class*=Quote-module][class*=text]']) {
    const e=sec.querySelector(sel); if(!e){out.push(sel+' MISSING');continue;}
    const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
    out.push(`${sel}: docY=${Math.round(r.top+scrollY)} h=${Math.round(r.height)} w=${Math.round(r.width)} pos=${s.position} of=${s.objectFit} natural=${e.naturalWidth||''}x${e.naturalHeight||''}`);
  }
  return out.join('\n');
}));
await b.close();
