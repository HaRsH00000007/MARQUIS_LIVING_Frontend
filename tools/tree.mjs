import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
const idx = +process.argv[2];
const txt = await p.evaluate((idx) => {
  const secs = [...document.querySelectorAll('.page-wrapper > *, main > section, body section')];
  const uniq=[...new Set(secs)];
  const target = uniq[idx];
  if(!target) return 'SECTIONS:'+uniq.map((s,i)=>i+':'+s.className).join('\n');
  const lines=[];
  const walk=(el,d)=>{
    if(d>7) return;
    const cls=(el.className||'').toString().trim();
    const tag=el.tagName.toLowerCase();
    const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').replace(/\s+/g,' ');
    const img=el.tagName==='IMG'?` src=${(el.currentSrc||el.src||'').split('/').pop()}`:'';
    const vid=el.tagName==='VIDEO'?` VIDEO`:'';
    lines.push('  '.repeat(d)+`<${tag}${cls?' .'+cls.split(/\s+/).join('.'):''}>${img}${vid}${own?' "'+own.slice(0,150)+'"':''}`);
    [...el.children].forEach(c=>walk(c,d+1));
  };
  walk(target,0);
  return lines.join('\n');
}, idx);
fs.writeFileSync(`C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/tree-${isNaN(idx)?'list':idx}.txt`, txt);
console.log(txt.slice(0,3000));
await b.close();
