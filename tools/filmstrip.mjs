import { chromium } from 'playwright-core';
import fs from 'fs';
const URL=process.argv[2], TAG=process.argv[3];
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/entry';
fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now();
await p.goto(URL,{waitUntil:'commit',timeout:120000});
const shots=[];
for(let i=0;i<10;i++){
  const target=t0+300*(i+1);
  const wait=target-Date.now(); if(wait>0) await p.waitForTimeout(wait);
  const t=Date.now()-t0;
  await p.screenshot({path:`${OUT}/${TAG}-${String(i).padStart(2,'0')}.png`});
  // measure ink coverage of the top half as a crude "is the copy in yet" signal
  shots.push(t);
}
console.log(TAG, shots.join(','));
await b.close();
