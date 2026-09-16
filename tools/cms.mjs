import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:90000});
await p.waitForTimeout(2500);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=700){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(140);}
const r = await p.evaluate(() => {
  const o={};
  const grab=(sel)=>[...document.querySelectorAll(sel)].map(e=>({
    text:e.innerText.replace(/\n+/g,' | ').trim(),
    imgs:[...e.querySelectorAll('img')].map(i=>(i.currentSrc||i.src||'').split('/').pop().split('?')[0]),
    cls:e.className
  }));
  o.benefits=grab('.benefits-cms_list_item');
  o.apartTypes=grab('.apart-type-cms_list_item');
  o.amenities=grab('.amen-cms_list_item');
  o.amenTabs=grab('.amen-tabs-cms .w-dyn-item');
  o.gallery=grab('.gallery-cms_list_item');
  o.other=grab('.other-cms_list_item');
  o.pins=grab('.pins-cms .w-dyn-item');
  o.contact=grab('.contact-cms_list .w-dyn-item');
  o.locCms=grab('.loc-cms_list .w-dyn-item');
  o.legal=grab('.legal-cms .w-dyn-item');
  // nav / header
  const navEls=[...document.querySelectorAll('body > div, .page-wrapper > div')].filter(e=>/nav|header|menu/i.test(e.className));
  o.navHTML=navEls.map(e=>e.outerHTML.slice(0,4000));
  // inline svgs
  o.svgs=[...document.querySelectorAll('svg')].slice(0,20).map(s=>({w:s.getAttribute('viewBox'),parent:s.parentElement.className,html:s.outerHTML.slice(0,2500)}));
  return o;
});
fs.writeFileSync('C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website/docs/cms.json', JSON.stringify(r,null,1));
console.log(JSON.stringify({b:r.benefits.length,a:r.apartTypes.length,am:r.amenities.length,g:r.gallery.length,o:r.other.length,nav:r.navHTML.length,svg:r.svgs.length}));
await b.close();
