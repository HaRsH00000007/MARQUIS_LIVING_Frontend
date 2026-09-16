import { chromium } from 'playwright-core';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/shots';
const W=+process.argv[2]||1440, H=+process.argv[3]||900, TAG=process.argv[4]||'d1440';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:W,height:H}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(4000);
// dismiss cookie banner
await p.addStyleTag({content:'.modal,.floating-tips,[class*=cookie]{display:none!important}'});
await p.waitForTimeout(1000);
const h = await p.evaluate(()=>document.body.scrollHeight);
let i=0;
for(let y=0;y<h-H*0.4;y+=Math.round(H*0.85)){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
  await p.waitForTimeout(1400);
  await p.screenshot({path:`${OUT}/${TAG}-${String(i).padStart(2,'0')}.png`});
  i++;
}
await b.close(); console.log('shots',i,'height',h);
