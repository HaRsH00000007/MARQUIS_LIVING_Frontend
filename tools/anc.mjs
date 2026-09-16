import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
  let el=document.querySelector('footer [class*=inner]');
  const out=[];
  while(el){
    const s=getComputedStyle(el), b=el.getBoundingClientRect();
    out.push(`${el.tagName}.${String(el.className).slice(0,45)} transform=${s.transform} zoom=${s.zoom} scale=${s.scale} rect=${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`);
    el=el.parentElement;
  }
  return out.join('\n');
}));
await b.close();
