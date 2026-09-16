import { chromium } from 'playwright-core';
const URL=process.argv[2]||'https://www.era-residence.com/';
const H1=process.argv[3]||'.hero-s_logo h1';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now();
await p.goto(URL,{waitUntil:'commit',timeout:120000});
for(let i=0;i<34;i++){
  const r=await p.evaluate((H1)=>{
    const h=document.querySelector(H1);
    if(!h) return {miss:true};
    const kids=[...h.querySelectorAll('span')].filter(e=>getComputedStyle(e).display!=='inline');
    const g=e=>{const s=getComputedStyle(e);const m=s.transform;
      const ty=m==='none'?0:+m.slice(m.indexOf('(')+1,-1).split(',')[5];
      return `${(+s.opacity).toFixed(2)}/${Math.round(ty)}`;};
    const big=[...document.querySelectorAll('*')].filter(e=>{
      const s=getComputedStyle(e),r=e.getBoundingClientRect();
      return (s.position==='fixed') && r.width>1200 && r.height>700 && +s.opacity>0.05 &&
             s.visibility!=='hidden' && +(s.zIndex||0)>20;}).length;
    return {n:kids.length, s:kids.slice(0,3).map(g).join(' '), e:kids.slice(-2).map(g).join(' '), big,
            hOp:+(+getComputedStyle(h).opacity).toFixed(2)};
  }, H1).catch(e=>({err:String(e).slice(0,40)}));
  console.log(String(Date.now()-t0).padStart(5)+'ms', JSON.stringify(r));
  await p.waitForTimeout(150);
}
await b.close();
