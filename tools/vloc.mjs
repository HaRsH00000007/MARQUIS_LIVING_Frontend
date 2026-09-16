import { chromium } from 'playwright-core';
import fs from 'fs';
const W=+process.argv[2]||1440, H=+process.argv[3]||900;
const YS = process.argv.slice(4).map(Number);
const OUT=`C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/vcmp/${W}`;
fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const ctx = await b.newContext({viewport:{width:W,height:H}, isMobile: W<600, hasTouch: W<600});
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(6000);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
let cur=0;
for (const y of YS) {
  while(cur<y){cur=Math.min(y,cur+Math.round(H*0.45));await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(55);}
  cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(900);
  await p.screenshot({path:`${OUT}/${y}-loc.jpg`,type:'jpeg',quality:74});
}
console.log('loc done',W);
await b.close();
