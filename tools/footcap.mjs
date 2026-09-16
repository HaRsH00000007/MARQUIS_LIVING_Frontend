import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/footer';
fs.mkdirSync(OUT,{recursive:true});
const W=+process.argv[2]||1440, H=+process.argv[3]||900;
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for(const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]){
  const p = await (await b.newContext({viewport:{width:W,height:H}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(4500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  const h=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=600){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(80);}
  await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));
  await p.waitForTimeout(2200);
  await p.screenshot({path:`${OUT}/${tag}-${W}.png`});
  await p.context().close();
}
console.log('done');
await b.close();
