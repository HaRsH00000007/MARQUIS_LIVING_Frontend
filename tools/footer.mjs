import { chromium } from 'playwright-core';
const URL=process.argv[2]||'https://www.era-residence.com/';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto(URL,{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(5000);
await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
// progressive scroll to the bottom
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=600){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(90);}
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(2000);
const r = await p.evaluate(()=>{
  const out=[];
  const foot = document.querySelector('.footer-w') || document.querySelector('footer') || document.querySelectorAll('section')[13];
  const walk=(el,d)=>{
    if(d>6) return;
    const s=getComputedStyle(el), b=el.getBoundingClientRect();
    if(b.height<1) return;
    const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).filter(Boolean).join(' ');
    out.push(`${'  '.repeat(d)}<${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).join('.').slice(0,50)}> `+
      `x${Math.round(b.x)} y${Math.round(b.y)} w${Math.round(b.width)} h${Math.round(b.height)} `+
      `fs:${s.fontSize} ff:${s.fontFamily.split(',')[0]} lh:${s.lineHeight} ta:${s.textAlign}`+
      (own?` "${own.slice(0,60)}"`:''));
    [...el.children].forEach(c=>walk(c,d+1));
  };
  if(foot) walk(foot,0);
  return out.join('\n');
});
console.log(r);
await b.close();
