import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('https://www.era-residence.com/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(5000);
await p.addStyleTag({content:'.modal,[class*=cookie]{display:none!important}'});
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=600){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(90);}
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>{
  const d=(sel)=>{const e=document.querySelector(sel); if(!e) return sel+': MISSING';
    const s=getComputedStyle(e), b=e.getBoundingClientRect();
    return `${sel}\n   text="${e.innerText.replace(/\n/g,' | ').slice(0,70)}"\n   cls=${e.className}\n   fs=${s.fontSize} ff=${s.fontFamily.split(',')[0]} fw=${s.fontWeight} lh=${s.lineHeight} ls=${s.letterSpacing} tt=${s.textTransform} ta=${s.textAlign}\n   box x${Math.round(b.x)} y${Math.round(b.y)} w${Math.round(b.width)} h${Math.round(b.height)}`;};
  const deep=(root)=>{
    const el=[...document.querySelectorAll(root+' *')].filter(e=>e.children.length===0 && e.textContent.trim());
    return el.map(e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();
      return `  "${e.textContent.trim().slice(0,40)}" cls=${e.className} fs=${s.fontSize} ff=${s.fontFamily.split(',')[0]} fw=${s.fontWeight} lh=${s.lineHeight} ls=${s.letterSpacing} w=${Math.round(b.width)} h=${Math.round(b.height)} x=${Math.round(b.x)} y=${Math.round(b.y)}`;}).join('
');
  };
  return [
    'PHONE LEAVES:
'+deep('.contact-cms_list'),
    'ADDRESS LEAVES:
'+deep('.footer-s_address'),
    'LEGAL LEAVES:
'+deep('.legal-cms'),
    'CREDITS LEAVES:
'+deep('.footer-s_credits'),
    d('.contact-cms_list .w-dyn-item'),
    d('.contact-cms_list a'),
    d('.footer-s_address .l2'),
    d('.footer-s_address .loc-cms_list .w-dyn-item'),
    d('.footer-s_credits .l1'),
    d('.footer-s_info .l1'),
    d('.legal-cms'),
    d('.footer-s_s-top .l2'),
  ].join('\n\n');
}));
await b.close();
