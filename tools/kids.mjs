import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(4000);
let h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
console.log(await p.evaluate((sel)=>{
  const root=document.querySelector(sel);
  const cs=getComputedStyle(root);
  const out=[`ROOT h=${Math.round(root.getBoundingClientRect().height)} padT=${cs.paddingTop} padB=${cs.paddingBottom}`];
  const walk=(el,d)=>{ if(d>2) return;
    for(const c of el.children){ const r=c.getBoundingClientRect(); const s=getComputedStyle(c);
      out.push('  '.repeat(d)+`${c.tagName}.${String(c.className).replace(/[A-Za-z]+-module__\w+__/g,'').slice(0,32)} h=${Math.round(r.height)} mT=${s.marginTop} mB=${s.marginBottom}`);
      walk(c,d+1);} };
  walk(root,0);
  return out.join('\n');
}, '#interiors'));
await b.close();
