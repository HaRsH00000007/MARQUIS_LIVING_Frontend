import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(5500);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
let cur=0;
for (const y of process.argv.slice(3).map(Number)) {
  while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(45);}
  cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(850);
  await p.screenshot({path:`C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/anchor/${process.argv[2]}-${y}.jpg`,type:'jpeg',quality:70});
}
console.log('ok'); await b.close();
