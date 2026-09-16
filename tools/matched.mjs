import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
  const el=document.querySelector('footer [class*=inner]');
  const out={ inlineStyle: el.getAttribute('style'), anims: el.getAnimations().map(a=>a.animationName||a.constructor.name) };
  const hits=[];
  for(const sheet of document.styleSheets){
    let rules; try{ rules=sheet.cssRules }catch{ continue }
    const scan=(rs)=>{ for(const r of rs){
      if(r.cssRules) { scan(r.cssRules); continue; }
      if(!r.selectorText || !r.style || !r.style.transform) continue;
      try{ if(el.matches(r.selectorText)) hits.push(r.selectorText+' => '+r.style.transform); }catch{}
    }};
    scan(rules);
  }
  out.transformRules=hits;
  return out;
}));
await b.close();
