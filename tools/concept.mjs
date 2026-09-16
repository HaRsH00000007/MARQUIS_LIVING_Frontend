import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/concept';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const FRACS=[0,0.2,0.4,0.6,0.8,1.0];
const SCREENS=Number(process.argv[2]||5.0);

const probe = () => {
  const vw=innerWidth, vh=innerHeight;
  const vis=[];
  const seen=new Set();
  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  for (const el of document.querySelectorAll('img,video,svg,h1,h2,h3,h4,p,span,a')) {
    const r=el.getBoundingClientRect();
    if (r.width<8||r.height<8) return_check: {}
    if (r.width<8||r.height<8) continue;
    if (r.bottom< -50||r.top>vh+50||r.right<-50||r.left>vw+50) continue;
    const cs=getComputedStyle(el);
    if (cs.visibility==='hidden'||cs.opacity==='0'||cs.display==='none') continue;
    const tag=el.tagName.toLowerCase();
    let label='';
    if (tag==='img'||tag==='video') label=(el.currentSrc||el.src||'').split('/').pop().split('?')[0];
    else { const t=norm(el.textContent); if(!t) continue; if(el.children.length>4) continue; label=t.slice(0,46); }
    if (tag!=='img'&&tag!=='video'&&tag!=='svg'){ if(seen.has(label)) continue; seen.add(label); }
    if (['p','span','a'].includes(tag) && parseFloat(cs.fontSize)<26) continue;
    vis.push({tag,label,
      x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),
      fs:Math.round(parseFloat(cs.fontSize)),op:(+cs.opacity).toFixed(2)});
  }
  // background colour sampled from the element stack behind viewport centre
  const bgOf=(x,y)=>{ for(const el of document.elementsFromPoint(x,y)){ const c=getComputedStyle(el).backgroundColor; if(c&&c!=='rgba(0, 0, 0, 0)') return c; } return 'none'; };
  return {scrollY:Math.round(scrollY), vw, vh,
    bg:{ tl:bgOf(6,6), c:bgOf(vw/2,vh/2), br:bgOf(vw-6,vh-6) },
    vis};
};

const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const res={};
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]) {
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(6500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  const h=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=420){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(45);}
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1500);

  const start=await p.evaluate(()=>{
    const norm=s=>(s||'').replace(/\s+/g,' ').trim().toUpperCase();
    let best=null;
    for(const el of document.querySelectorAll('h1,h2,h3,h4,p,span,div,a')){
      if(el.children.length>3) continue;
      if(!norm(el.textContent).startsWith('THE CONCEPT')) continue;
      const sec=el.closest('section,footer'); if(!sec) continue;
      const t=Math.round(sec.getBoundingClientRect().top+scrollY);
      if(best===null||t<best) best=t;
    }
    return best;
  });
  console.log(tag,'concept section top =',start);
  res[tag]={start,checks:[]};
  let cur=0;
  for(const f of FRACS){
    const y=Math.max(0,Math.round(start+f*SCREENS*900));
    while(cur<y){cur=Math.min(y,cur+380);await p.evaluate(v=>scrollTo(0,v),cur);await p.waitForTimeout(45);}
    if(cur>y){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(250);}
    cur=y; await p.evaluate(v=>scrollTo(0,v),y); await p.waitForTimeout(900);
    await p.screenshot({path:`${OUT}/c-${Math.round(f*100)}-${tag}.jpg`,type:'jpeg',quality:66});
    const d=await p.evaluate(probe);
    d.frac=f; res[tag].checks.push(d);
  }
  await p.context().close();
}
fs.writeFileSync(OUT+'/data.json',JSON.stringify(res,null,1));
await b.close();
console.log('done');
