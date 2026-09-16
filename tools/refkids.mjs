import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(5000);
let h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  const out=[];
  const q=(sel,label)=>{const e=document.querySelector(sel); if(!e){out.push(label+': MISSING');return;}
    const r=e.getBoundingClientRect(); out.push(`${label}: ${Math.round(r.width)}x${Math.round(r.height)} ratio=${(r.width/r.height).toFixed(2)}`);};
  q('.interior-s_gallery-cms','interiors gallery');
  q('.gallery-cms_list_item','gallery item');
  q('.interior-s_imgs','interiors feature block');
  q('.interior-s_title','interiors title');
  q('.arch-intro-s','architecture intro');
  q('.arch-intro-s_bg_l','arch intro img L');
  q('.arch-intro-s_bg_r','arch intro img R');
  q('.other-s','project facts inner');
  q('.other-cms_list_item','facts item');
  return out.join('\n');
}));
await b.close();
