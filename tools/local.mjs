import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/local';
fs.mkdirSync(OUT,{recursive:true});
const W=+process.argv[2]||1440, H=+process.argv[3]||900, TAG=process.argv[4]||'l1440';
const URL=process.argv[5]||'http://localhost:3000/';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const ctx = await b.newContext({viewport:{width:W,height:H}});
const p = await ctx.newPage();
const errs=[];
p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,200)); });
p.on('pageerror', e=>errs.push('PAGEERROR '+String(e).slice(0,200)));
p.on('response', r=>{ if(r.status()>=400) errs.push(`HTTP ${r.status()} ${r.url().slice(0,120)}`); });
await p.goto(URL,{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(3500);
await p.addStyleTag({content:'[class*=CookieConsent],[class*=cookie]{display:none!important}'});
const h = await p.evaluate(()=>document.body.scrollHeight);
let i=0;
for(let y=0;y<h-H*0.4;y+=Math.round(H*0.85)){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
  await p.waitForTimeout(900);
  await p.screenshot({path:`${OUT}/${TAG}-${String(i).padStart(2,'0')}.png`});
  i++;
}
fs.writeFileSync(`${OUT}/errors-${TAG}.txt`, [...new Set(errs)].join('\n'));
console.log('shots',i,'height',h,'errors',new Set(errs).size);
console.log([...new Set(errs)].slice(0,12).join('\n'));
await b.close();
