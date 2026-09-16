import { chromium } from 'playwright-core';
import fs from 'fs';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const out={};
for(const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]){
 const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
 await p.goto(url,{waitUntil:'networkidle',timeout:180000});
 await p.waitForTimeout(6500);
 const h=await p.evaluate(()=>document.body.scrollHeight);
 for(let y=0;y<h;y+=420){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(45);}
 // park mid-concept so the pin is engaged and panels are laid out
 const start=await p.evaluate(()=>{const n=s=>(s||'').replace(/\s+/g,' ').trim().toUpperCase();let b=null;
  for(const el of document.querySelectorAll('h1,h2,h3,h4,p,span,div,a')){if(el.children.length>3)continue;
   if(!n(el.textContent).startsWith('THE CONCEPT'))continue;const s=el.closest('section,footer');if(!s)continue;
   const t=Math.round(s.getBoundingClientRect().top+scrollY);if(b===null||t<b)b=t;}return b;});
 await p.evaluate(v=>scrollTo(0,v),start+2000); await p.waitForTimeout(1200);

 out[tag]=await p.evaluate(()=>{
  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  // section holding "New Golden Mile"
  let sec=null;
  for(const el of document.querySelectorAll('h1,h2,h3,h4,div,span')){
    if(norm(el.textContent).replace(/\s/g,'').toUpperCase().startsWith('NEWGOLDENMILE')){sec=el.closest('section');if(sec)break;}
  }
  if(!sec) return {err:'no section'};
  // panels = descendants ~viewport wide & ~viewport tall
  const vw=innerWidth,vh=innerHeight;
  const panels=[...sec.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();
    return Math.abs(r.width-vw)<40 && r.height>vh*0.85 && r.height<vh*1.2;});
  // dedupe: keep outermost at each x
  const uniq=[]; for(const el of panels){const r=el.getBoundingClientRect();
    if(!uniq.some(u=>Math.abs(u.getBoundingClientRect().left-r.left)<20 && u.contains(el))) uniq.push(el);}
  const dump=el=>{
    const pr=el.getBoundingClientRect();
    const kids=[];
    for(const k of el.querySelectorAll('img,video,svg,h1,h2,h3,h4,p,a')){
      const r=k.getBoundingClientRect(); if(r.width<6||r.height<6) continue;
      const cs=getComputedStyle(k); if(cs.display==='none'||cs.visibility==='hidden') continue;
      const t=k.tagName.toLowerCase();
      const lab=(t==='img'||t==='video')?(k.currentSrc||k.src||'').split('/').pop().split('?')[0]:norm(k.textContent).slice(0,44);
      if(!lab) continue;
      kids.push({t,lab,x:Math.round(r.left-pr.left),y:Math.round(r.top-pr.top),
        w:Math.round(r.width),h:Math.round(r.height),fs:Math.round(parseFloat(cs.fontSize)),
        lh:cs.lineHeight, ta:cs.textAlign, pos:cs.position});
    }
    return {w:Math.round(pr.width),h:Math.round(pr.height),x:Math.round(pr.left),kids};
  };
  return {secTop:Math.round(sec.getBoundingClientRect().top+scrollY),
          secH:Math.round(sec.getBoundingClientRect().height),
          n:uniq.length, panels:uniq.map(dump)};
 });
 await p.context().close();
}
fs.writeFileSync('C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/concept/panels.json',JSON.stringify(out,null,1));
await b.close();
for(const t of ['ref','loc']){const d=out[t];console.log('\n##### '+t+'  secTop='+d.secTop+' secH='+d.secH+' panels='+d.n);
 (d.panels||[]).forEach((p,i)=>{console.log(' -- panel '+i+'  '+p.w+'x'+p.h+' (vx '+p.x+')');
  p.kids.forEach(k=>console.log('     '+k.t.padEnd(5)+(k.x+','+k.y+' '+k.w+'x'+k.h).padEnd(22)+'fs'+String(k.fs).padStart(4)+' lh'+String(k.lh).padEnd(8)+k.pos.padEnd(9)+k.lab));});}
