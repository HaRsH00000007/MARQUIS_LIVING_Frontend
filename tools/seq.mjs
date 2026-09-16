import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/seq';
fs.mkdirSync(OUT,{recursive:true});
// 0/25/50/75/100% of each animated sequence, from the measured section ranges
export const SEQ = {
  heroBenefits : [3600, 3780, 3960, 4140, 4320],
  benefitsQuote: [4320, 4545, 4770, 4995, 5220],
  quoteConcept : [5220, 5490, 5760, 6030, 6300],
  conceptPlan  : [6300, 7429, 8557, 9686, 10814],
  planApart    : [10814, 11129, 11444, 11759, 12074],
  amenInteriors: [13829, 14571, 15314, 16056, 16799],
  interiorsArch: [16600, 17345, 18158, 18900, 19600],
  archFacts    : [19848, 20693, 21100, 21538, 21800],
  factsCta     : [21538, 21743, 21947, 22152, 22356],
  ctaFooter    : [22356, 22693, 23030, 23368, 23705],
};
const ys = [...new Set(Object.values(SEQ).flat())].sort((a,b)=>a-b);
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(6500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  let cur=0;
  for (const y of ys) {
    while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(50);}
    cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(880);
    await p.screenshot({path:`${OUT}/${y}-${tag}.jpg`,type:'jpeg',quality:62});
  }
  await p.context().close();
  console.log(tag,'done',ys.length,'frames');
}
await b.close();
