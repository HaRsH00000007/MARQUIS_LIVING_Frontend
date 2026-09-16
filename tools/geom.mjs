import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const out = {};
for (const [url, tag] of [['https://www.era-residence.com/','ref'], ['http://localhost:3000/','loc']]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url, { waitUntil:'networkidle', timeout:150000 });
  await p.waitForTimeout(6000);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  // full progressive scroll so pins/lazy content settle, then back to top
  let h = await p.evaluate(()=>document.body.scrollHeight);
  for (let y=0; y<h; y+=500) { await p.evaluate(v=>scrollTo(0,v), y); await p.waitForTimeout(70); h = await p.evaluate(()=>document.body.scrollHeight); }
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1500);
  const r = await p.evaluate(()=>{
    const secs = [...document.querySelectorAll('main > section, main > footer, body > section, body > footer')];
    const uniq = [...new Set(secs)];
    return {
      docH: document.documentElement.scrollHeight,
      vh: window.innerHeight,
      sections: uniq.map(s=>{
        const r = s.getBoundingClientRect();
        const label = (s.id || String(s.className).replace(/[a-z]+-module__\w+__/g,'').split(/\s+/).filter(c=>!/^(section|clip|z-2|theme_on-\w+|arch|bleed)$/.test(c)).join('.') || s.tagName.toLowerCase());
        return { label, top: Math.round(r.top + window.scrollY), h: Math.round(r.height),
                 text: (s.innerText||'').replace(/\s+/g,' ').slice(0,45) };
      }),
    };
  });
  out[tag] = r;
  await p.context().close();
}
fs.writeFileSync('C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/geom.json', JSON.stringify(out,null,1));
for (const tag of ['ref','loc']) {
  const g = out[tag];
  console.log(`\n===== ${tag}  docH=${g.docH} (${(g.docH/g.vh).toFixed(1)} screens) =====`);
  for (const s of g.sections) console.log(String(s.top).padStart(6), String(s.h).padStart(5), (s.h/g.vh).toFixed(2)+'sc', s.label.slice(0,34).padEnd(34), s.text.slice(0,40));
}
await b.close();
