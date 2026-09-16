import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=800){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(150);}
const r = await p.evaluate(() => {
  const out=[];
  [...document.querySelectorAll('body section')].forEach((s,i)=>{
    out.push(`\n===== SECTION ${i} =====\n`+ s.innerText);
  });
  const nav = document.querySelector('.nav, nav, [class*="nav-w"], header');
  out.unshift('===== NAV =====\n'+(nav?nav.innerText:'none')+'\nNAVCLASS:'+(nav?nav.className:''));
  return out.join('\n');
});
fs.writeFileSync('C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/content.txt', r);
console.log(r.length);
await b.close();
