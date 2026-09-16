import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/trans';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});

// boundary Y for each transition, per site (from docs/geom.json + pin-spacer gaps)
const REF = { hero:3600, benefits:4320, quote:5220, concept:6300, master:10814, apart:12074,
              apartIntro:12974, amen:13829, interiors:15179, arch:18158, facts:21538, cta:22356, footer:23705 };
const LOC = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const NAMES = ['hero','benefits','quote','concept','master','apart','apartIntro','amen','interiors','arch','facts','cta','footer'];

const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [url,tag,MAP] of [['https://www.era-residence.com/','ref',REF],['http://localhost:3000/','loc',LOC]]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:150000});
  await p.waitForTimeout(6000);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  let cur=0;
  const goto=async(y)=>{ while(cur<y){cur=Math.min(y,cur+400);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(60);} cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(850); };
  for (const n of NAMES) {
    const y = MAP[n]; if (y===undefined) continue;
    for (const [off,lbl] of [[-450,'a'],[250,'b']]) {
      await goto(Math.max(0, Math.round(y+off)));
      await p.screenshot({path:`${OUT}/${n}-${lbl}-${tag}.jpg`, type:'jpeg', quality:72});
    }
  }
  await p.context().close();
  console.log(tag,'done');
}
await b.close();
