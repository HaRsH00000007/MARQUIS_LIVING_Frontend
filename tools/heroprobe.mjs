import { chromium } from 'playwright-core';
import fs from 'fs';
const URL = process.argv[2] || 'https://www.era-residence.com/';
const TAG = process.argv[3] || 'ref';
const SELS = process.argv[4]
  ? JSON.parse(process.argv[4])
  : {
      section:'#hero',
      copy:'.hero-s',
      logo:'.hero-s_logo',
      master:'.hero-w_bg_master',
      masterImg:'.hero-w_bg_master_img',
      dayImg:'.hero-w_bg_master_img_day',
      heroB:'.hero-s_b',
      arch:'.section.arch',
    };
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(5000);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});

const rows=[];
const H = await p.evaluate(()=>document.querySelector('#hero')?.offsetHeight || 0);
console.log(TAG,'hero offsetHeight',H,'= '+(H/900).toFixed(2)+' screens');
for (let y=0; y<=Math.min(H+900, 7000); y+=150){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
  await p.waitForTimeout(120);
  const r = await p.evaluate((SELS)=>{
    const out={y:Math.round(window.scrollY)};
    for(const [k,sel] of Object.entries(SELS)){
      const el=document.querySelector(sel); if(!el){out[k]=null;continue;}
      const s=getComputedStyle(el); const b=el.getBoundingClientRect();
      out[k]={op:+(+s.opacity).toFixed(3), t:s.transform==='none'?'none':s.transform,
              top:Math.round(b.top), left:Math.round(b.left), w:Math.round(b.width), h:Math.round(b.height)};
    }
    return out;
  }, SELS);
  rows.push(r);
}
fs.writeFileSync(`C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/hero-${TAG}.json`, JSON.stringify(rows));
// compact print
const fmt=o=>o?`op${o.op} t:${o.top} l:${o.left} w:${o.w}`:'--';
for(const r of rows.filter((_,i)=>i%2===0)){
  console.log(String(r.y).padStart(5), 'copy',fmt(r.copy), '| master',fmt(r.master), '| img',fmt(r.masterImg));
}
await b.close();
