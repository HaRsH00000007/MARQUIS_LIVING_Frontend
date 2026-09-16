import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(6500);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=420){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(45);}
await p.evaluate(()=>scrollTo(0,8300)); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
 const norm=s=>(s||'').replace(/\s+/g,' ').trim();
 const track=document.querySelector('[class*="Concept-module"][class*="track"]');
 const lines=[];
 for(const panel of track.children){
  const pr=panel.getBoundingClientRect();
  lines.push('\n### '+panel.className+'  '+Math.round(pr.width)+'x'+Math.round(pr.height));
  const walk=(el,d)=>{
   const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
   if(r.width<3&&r.height<3) return;
   const t=el.tagName.toLowerCase();
   let lab='';
   if(t==='img'||t==='video') lab=(el.currentSrc||el.src||'').split('/').pop().split('?')[0];
   else if(el.children.length===0) lab=norm(el.textContent).slice(0,40);
   lines.push('  '.repeat(d)+t+'.'+(el.className||'').toString().slice(0,42)
    +' ['+Math.round(r.left-pr.left)+','+Math.round(r.top-pr.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+']'
    +' '+cs.position+' '+cs.display+' fs'+Math.round(parseFloat(cs.fontSize))+' lh'+cs.lineHeight
    +' m:'+cs.margin.replace(/px/g,'')+' p:'+cs.padding.replace(/px/g,'')
    +(lab?'  «'+lab+'»':''));
   if(d<6) for(const k of el.children) walk(k,d+1);
  };
  for(const k of panel.children) walk(k,1);
 }
 return lines.join('\n');
}));
await b.close();
