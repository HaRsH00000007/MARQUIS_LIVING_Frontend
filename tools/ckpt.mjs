import { chromium } from 'playwright-core';
const YS = process.argv.slice(2).map(Number);
const SEL = {
  ref: { quoteText:'.quote-s_c h4, .quote-w blockquote, .quote-s_c .h5',
         quoteImg:'.quote-w_bg_img img, .quote-w_bg_img',
         flower:'.flower.loc-info video, .quote-w .flower, .flower video',
         conceptLead:'.loc-info-s_c .h3, .loc-info-w h2, .loc-info-w .h3' },
  loc: { quoteText:'[class*=Quote-module][class*=text]',
         quoteImg:'[class*=Quote-module][class*=bg] img',
         flower:'[class*=Quote-module][class*=flower]',
         conceptLead:'[class*=Concept-module][class*=introInner] h2' },
};
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const out = {};
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(6000);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  let cur=0; out[tag]={};
  for (const y of YS) {
    while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(50);}
    cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(800);
    out[tag][y] = await p.evaluate((sels)=>{
      const o={};
      for (const [k,sel] of Object.entries(sels)) {
        const e=document.querySelector(sel);
        if(!e){o[k]=null;continue;}
        const r=e.getBoundingClientRect();
        o[k]={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};
      }
      return o;
    }, SEL[tag]);
  }
  await p.context().close();
}
const keys = Object.keys(SEL.ref);
for (const k of keys) {
  console.log('\n== '+k);
  for (const y of YS) {
    const a=out.ref[y][k], c=out.loc[y][k];
    const f=o=>o?`x${String(o.x).padStart(5)} y${String(o.y).padStart(5)} ${String(o.w).padStart(4)}x${String(o.h).padStart(4)}`:'   —';
    console.log(`  ${String(y).padStart(5)}  ref ${f(a)}   loc ${f(c)}`);
  }
}
await b.close();
