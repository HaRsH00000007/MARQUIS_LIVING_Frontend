import { chromium } from 'playwright-core';
const URL=process.argv[2]||'https://www.era-residence.com/';
const SEL=process.argv[3]||'.hero-s_logo .h1 .split-word, .hero-s_logo .h1 .split-char';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now();
await p.goto(URL,{waitUntil:'commit',timeout:120000});
const out=[];
for(let i=0;i<32;i++){
  const r=await p.evaluate((SEL)=>{
    const els=[...document.querySelectorAll(SEL)];
    if(!els.length) return null;
    const first=els[0], last=els[els.length-1];
    const g=e=>{const s=getComputedStyle(e);const m=s.transform;const ty=m==='none'?0:+m.slice(m.indexOf('(')+1,-1).split(',')[5];return {op:+(+s.opacity).toFixed(2),ty:Math.round(ty)};};
    const overlay=[...document.querySelectorAll('body > *, [class*=preload], [class*=transition]')]
      .filter(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();
        return s.position==='fixed' && r.width>1200 && r.height>700 && +s.opacity>0.05;}).length;
    return {n:els.length, first:g(first), last:g(last), overlay};
  }, SEL).catch(()=>null);
  out.push([Date.now()-t0, r]);
  await p.waitForTimeout(150);
}
for(const [t,r] of out) console.log(String(t).padStart(5)+'ms', r?`n=${r.n} first op${r.first.op} ty${r.first.ty} | last op${r.last.op} ty${r.last.ty} | overlays ${r.overlay}`:'--');
await b.close();
