import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto(process.argv[2],{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(5000);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
let cur=0;
for (const y of process.argv.slice(4).map(Number)) {
  while(cur<y){cur=Math.min(y,cur+400);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(60);}
  cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(900);
  await p.screenshot({path:`C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/trans/${process.argv[3]}-${y}.jpg`,type:'jpeg',quality:75});
}
console.log('ok');
await b.close();
