import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/seq';
fs.mkdirSync(OUT,{recursive:true});
const ys = process.argv.slice(2).map(Number);
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(6000);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
let cur=0;
for (const y of ys) {
  while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(50);}
  cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(880);
  await p.screenshot({path:`${OUT}/${y}-loc.jpg`,type:'jpeg',quality:62});
}
console.log('loc done', ys.length);
await b.close();
