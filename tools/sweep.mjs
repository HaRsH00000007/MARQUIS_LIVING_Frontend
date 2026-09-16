import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/sweep';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(5000);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
const h=await p.evaluate(()=>document.body.scrollHeight);
let i=0, cur=0;
for(let y=0;y<h-450;y+=700){
  while(cur<y){cur=Math.min(y,cur+350);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(55);}
  cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(700);
  await p.screenshot({path:`${OUT}/s-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:62});
  i++;
}
console.log('frames',i,'height',h,'errors',[...new Set(errs)].join('|')||'none');
await b.close();
