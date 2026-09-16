import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(3000);
// trigger lazy loads
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=800){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(160);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
const txt = await p.evaluate(() => {
  const uniq=[...new Set([...document.querySelectorAll('body section')])];
  const out=[];
  uniq.forEach((target,idx)=>{
    out.push(`\n\n########## SECTION ${idx}: .${target.className.split(/\s+/).join('.')} ##########`);
    const walk=(el,d)=>{
      if(d>8) return;
      const cls=(el.className||'').toString().trim();
      const tag=el.tagName.toLowerCase();
      const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').replace(/\s+/g,' ');
      const img=el.tagName==='IMG'?` [img:${(el.currentSrc||el.src||el.getAttribute('src')||'').split('/').pop().split('?')[0]}]`:'';
      const vid=el.tagName==='VIDEO'?` [video:${(el.currentSrc||el.src||'').split('/').pop()}]`:'';
      const bg=getComputedStyle(el).backgroundImage; const bgs=bg&&bg!=='none'?` [bg:${bg.split('/').pop().replace(/["')].*/,'')}]`:'';
      out.push('  '.repeat(d)+`<${tag}${cls?'.'+cls.split(/\s+/).join('.'):''}>${img}${vid}${bgs}${own?' "'+own.slice(0,200)+'"':''}`);
      [...el.children].forEach(c=>walk(c,d+1));
    };
    walk(target,0);
  });
  return out.join('\n');
});
fs.writeFileSync('C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/tree-all.txt', txt);
console.log('bytes',txt.length);
await b.close();
