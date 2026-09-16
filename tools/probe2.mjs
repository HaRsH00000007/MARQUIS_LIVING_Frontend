import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const jobs = [
  ['https://www.era-residence.com/', 'REF', { lead:'.loc-info-s_c .h3, .loc-info-w .h3, .loc-info-s h3', leadAny:'.loc-info-w [class*=h3]', bslide:'.benefits-cms_list_item .h1, .benefit-slide_title', bimg:'.benefit-slide_img, .benefits-s_cms_pag .benefit-slide_img', quoteImg:'.quote-w_bg_img' }],
  ['http://localhost:3000/', 'LOC', { lead:'[class*=Concept-module][class*=introInner] h2', leadAny:'[class*=Concept-module] h2', bslide:'[class*=Benefits-module][class*=title]', bimg:'[class*=Benefits-module][class*=frame]', quoteImg:'[class*=Quote-module][class*=bg] img' }],
];
for (const [url, tag, sels] of jobs) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(5000);
  const h = await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
  const out = await p.evaluate((sels)=>{
    const r=[];
    for (const [k,sel] of Object.entries(sels)) {
      const e=document.querySelector(sel); if(!e){r.push(`${k}: MISSING (${sel})`);continue;}
      const s=getComputedStyle(e), b=e.getBoundingClientRect();
      const lines = Math.round(b.height / parseFloat(s.lineHeight||'1'));
      r.push(`${k}: ${Math.round(b.width)}x${Math.round(b.height)} fs=${s.fontSize} lh=${s.lineHeight} lines≈${lines} txt="${(e.textContent||'').trim().slice(0,32)}"`);
    }
    return r.join('\n');
  }, sels);
  console.log('=== '+tag+' ==='); console.log(out);
  await p.context().close();
}
await b.close();
