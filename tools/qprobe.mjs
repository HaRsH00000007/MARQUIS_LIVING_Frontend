import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(6000);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  const sec=[...document.querySelectorAll('body section')][3];
  const out=['SECTION doc-top='+Math.round(sec.getBoundingClientRect().top+scrollY)+' h='+Math.round(sec.getBoundingClientRect().height)];
  const walk=(el,d)=>{ if(d>4) return;
    for(const c of el.children){
      const r=c.getBoundingClientRect(); const s=getComputedStyle(c);
      if(r.height<4) { walk(c,d+1); continue; }
      const tag=c.tagName.toLowerCase();
      out.push('  '.repeat(d)+`<${tag}.${String(c.className).slice(0,34)}> docY=${Math.round(r.top+scrollY)} h=${Math.round(r.height)} w=${Math.round(r.width)} pos=${s.position} of=${s.objectFit||''} op=${s.objectPosition||''}`);
      walk(c,d+1);
    } };
  walk(sec,0);
  return out.join('\n');
}));
await b.close();
