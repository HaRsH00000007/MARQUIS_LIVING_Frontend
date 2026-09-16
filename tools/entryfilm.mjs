import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/video/loc';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
// warm the cache so the filmstrip shows animation, not loading
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(2000);
const t0=Date.now();
await p.goto('http://localhost:3000/',{waitUntil:'commit',timeout:120000});
for(let i=0;i<24;i++){
  const target=t0+120*(i+1);
  const w=target-Date.now(); if(w>0) await p.waitForTimeout(w);
  await p.screenshot({path:`${OUT}/e-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:70});
}
console.log('span ms', Date.now()-t0);
await b.close();
