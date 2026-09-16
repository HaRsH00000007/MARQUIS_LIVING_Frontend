import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/sweep-m';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(5000);
await p.getByRole('button',{name:'Accept'}).click().catch(()=>{});
await p.waitForTimeout(400);
await p.getByRole('button',{name:'Open menu'}).click();
await p.waitForTimeout(700);
console.log('menu open      ', await p.locator('#mobile-menu').isVisible());
await p.getByRole('button',{name:'Close menu'}).click();
await p.waitForTimeout(700);
console.log('menu closed    ', !(await p.locator('#mobile-menu').isVisible()));
const h=await p.evaluate(()=>document.body.scrollHeight);
let worst=0, i=0, cur=0;
for(let y=0;y<h-400;y+=760){
  while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(55);}
  cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(550);
  worst=Math.max(worst, await p.evaluate(()=>document.documentElement.scrollWidth));
  await p.screenshot({path:`${OUT}/m-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:60}); i++;
}
console.log('frames         ', i, 'docH', h);
console.log('max scrollWidth', worst, '(viewport 390)');
console.log('page errors    ', errs.length?[...new Set(errs)].join('|'):'none');
await b.close();
