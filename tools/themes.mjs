import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(6000);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=450){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(50);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
  const out=[];
  for (const el of document.querySelectorAll('[class*=interior_themes], [class*=arch_themes], [class*=hero_themes], [class*=quote-w_themes]')) {
    const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
    if (r.height<8) continue;
    out.push(`.${String(el.className).slice(0,42)} docY=${Math.round(r.top+scrollY)} x=${Math.round(r.x)} ${Math.round(r.width)}x${Math.round(r.height)} bg=${s.backgroundColor}`);
  }
  out.push('--- amenity tabs opacity ---');
  for (const t of document.querySelectorAll('.amen-tabs-cms .w-dyn-item, .amm-s_cms_tabs .w-dyn-item')) {
    const s=getComputedStyle(t); const inner=t.querySelector('*');
    out.push(`  "${t.textContent.trim().slice(0,20)}" op=${s.opacity} color=${s.color} innerOp=${inner?getComputedStyle(inner).opacity:''}`);
  }
  return out.join('\n');
}));
await b.close();
