import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/entry2';
fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now();
await p.goto('https://www.era-residence.com/',{waitUntil:'commit',timeout:120000});
for(let i=0;i<14;i++){
  const target=t0+800*(i+1);
  const w=target-Date.now(); if(w>0) await p.waitForTimeout(w);
  await p.screenshot({path:`${OUT}/t-${String(i).padStart(2,'0')}.png`});
}
console.log('elapsed', Date.now()-t0);
await b.close();
