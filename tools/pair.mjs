import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/hero-compare';
fs.mkdirSync(OUT,{recursive:true});
const YS=[0,700,1500,2600,3400,4100];
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]){
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(6000);
  // nudge the scroll so the reference's opening transition completes
  for(let y=0;y<=400;y+=100){ await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(250);} 
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(2500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  let cur=0;
  for(const y of YS){
    // progressive scroll, as a person would, so scrubbed timelines settle
    while(cur<y){ cur=Math.min(y,cur+300); await p.evaluate(v=>window.scrollTo(0,v),cur); await p.waitForTimeout(90); }
    cur=y; await p.evaluate(v=>window.scrollTo(0,v),y);
    await p.waitForTimeout(900);
    await p.screenshot({path:`${OUT}/${tag}-${String(y).padStart(4,'0')}.png`});
  }
  await p.context().close();
  console.log(tag,'done');
}
await b.close();
