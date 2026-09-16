import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/anchor';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});

// Each sequence: the landmark that starts it, and how far to run (in screens).
const SEQ = [
  ['heroBenefits',  'COSTA',                 0.8],
  ['benefitsQuote', 'REAL-LIFE LOCATION',    1.0],
  ['quoteConcept',  'INSTEAD OF CORRIDORS',  1.2],
  ['conceptPlan',   'THE CONCEPT',           5.0],
  ['planApart',     'COSTA DEL SOL',         1.4],
  ['apartAmen',     'AREA UP TO',            1.0],
  ['amenInteriors', 'GATED COMMUNITY',       3.3],
  ['interiorsArch', 'THE SPACE',             3.3],
  ['archFacts',     'ARCHITECTURE',          3.7],
  ['factsCta',      'DEVELOPER',             0.9],
  ['ctaFooter',     'A SHORT CONVERSATION',  1.5],
];
const FRACS = [0, 0.25, 0.5, 0.75, 1];

const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const anchors = {};
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(6500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  const h = await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=420){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(45);}
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1500);

  anchors[tag] = await p.evaluate((SEQ)=>{
    const norm = s => (s||'').replace(/\s+/g,' ').trim().toUpperCase();
    const out = {};
    for (const [name, needle] of SEQ) {
      const want = needle.toUpperCase();
      let best = null;
      for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,div,a')) {
        if (el.children.length > 3) continue;
        if (!norm(el.textContent).startsWith(want)) continue;
        const sec = el.closest('section, footer');
        if (!sec) continue;
        const r = sec.getBoundingClientRect();
        const top = Math.round(r.top + scrollY);
        if (best === null || top < best) best = top;
      }
      out[name] = best;
    }
    return out;
  }, SEQ);

  let cur = 0;
  for (const [name, , screens] of SEQ) {
    const start = anchors[tag][name];
    if (start == null) { console.log(tag, name, 'ANCHOR MISSING'); continue; }
    for (const f of FRACS) {
      const y = Math.max(0, Math.round(start + f * screens * 900));
      while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(45);}
      if (cur > y) { await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(250); }
      cur = y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(820);
      await p.screenshot({path:`${OUT}/${name}-${Math.round(f*100)}-${tag}.jpg`,type:'jpeg',quality:62});
    }
  }
  await p.context().close();
  console.log(tag, 'anchors', JSON.stringify(anchors[tag]));
}
fs.writeFileSync(OUT+'/anchors.json', JSON.stringify(anchors,null,1));
await b.close();
