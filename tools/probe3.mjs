import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(5000);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(60);}
await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  const r=[];
  const d=(sel,label)=>{const els=[...document.querySelectorAll(sel)];
    if(!els.length){r.push(`${label}: MISSING (${sel})`);return;}
    els.slice(0,4).forEach((e,i)=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();
      r.push(`${label}[${i}]: ${Math.round(b.width)}x${Math.round(b.height)} @${Math.round(b.x)},${Math.round(b.y)} fs=${s.fontSize} ta=${s.textAlign} disp=${s.display} op=${(+s.opacity).toFixed(2)} "${(e.textContent||'').trim().slice(0,26)}"`);});};
  d('.arch-s_t h2, .arch-w .h1','arch title');
  d('.apart-type-cms_list_item','apart card');
  d('.apart-type-cms_list','apart list');
  d('.amm-s_cms_tabs','amen tabs box');
  d('.amen-tabs-cms .w-dyn-item','amen tab');
  d('.apart-info-s .h4, .info-s_lead','apartIntro lead');
  d('.other-cms_list','facts list');
  d('.other-cms_list_item','facts item');
  d('.benefit-slide_img img, .benefits-s_cms_pag img','benefit img');
  d('.amen-s_cms','amen stage');
  return r.join('\n');
}));
await b.close();
