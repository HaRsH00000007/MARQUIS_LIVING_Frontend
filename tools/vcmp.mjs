import { chromium } from 'playwright-core';
import fs from 'fs';
const W=+process.argv[2]||1440, H=+process.argv[3]||900;
const YS = process.argv.slice(4).map(Number);
const OUT=`C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/vcmp/${W}`;
fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]) {
  const ctx = await b.newContext({viewport:{width:W,height:H}, isMobile: W<600, hasTouch: W<600});
  const p = await ctx.newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(6500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  let cur=0;
  for (const y of YS) {
    while(cur<y){cur=Math.min(y,cur+Math.round(H*0.45));await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(55);}
    cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(950);
    await p.screenshot({path:`${OUT}/${y}-${tag}.jpg`,type:'jpeg',quality:74});
  }
  await ctx.close();
  console.log(tag,'done',W);
}
await b.close();
