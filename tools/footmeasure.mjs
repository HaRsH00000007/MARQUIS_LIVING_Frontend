import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for(const [url,tag,sels] of [
  ['https://www.era-residence.com/','REF',{mark:'.footer-s_contact .logo_symbol',phone:'.contact-cms_list a',addr:'.footer-s_address',info:'.footer-s_info',credits:'.footer-s_credits .credits',toTop:'.footer-s_s-top'}],
  ['http://localhost:3000/','LOC',{mark:'footer [class*=Footer-module][class*=mark]',phone:'footer [class*=Footer-module][class*=phone]',addr:'footer address',info:'footer [class*=Footer-module][class*=info]',credits:'footer [class*=Footer-module][class*=creditsLink]',toTop:'footer [class*=Footer-module][class*=toTop]'}],
]){
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(4500);
  await p.addStyleTag({content:'.modal,[class*=cookie],[class*=CookieConsent]{display:none!important}'});
  const h=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=600){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(80);}
  await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(2200);
  const r=await p.evaluate((sels)=>{
    const o={};
    for(const [k,sel] of Object.entries(sels)){
      const e=document.querySelector(sel); if(!e){o[k]='MISSING';continue;}
      const b=e.getBoundingClientRect();
      o[k]=`x${Math.round(b.x)} y${Math.round(b.y)} w${Math.round(b.width)} h${Math.round(b.height)}`;
    }
    return o;
  },sels);
  console.log(tag, JSON.stringify(r,null,1));
  await p.context().close();
}
await b.close();
