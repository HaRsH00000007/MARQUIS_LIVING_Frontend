import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(4000);
await p.evaluate(()=>{const q=document.querySelector('blockquote'); q.scrollIntoView({block:'center'});});
await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  const fig=document.querySelector('figure'); const bq=document.querySelector('blockquote');
  const g=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();
    return `${e.tagName}.${String(e.className).slice(0,40)} x=${Math.round(r.x)} w=${Math.round(r.width)} ml=${s.marginLeft} mr=${s.marginRight} cssW=${s.width} disp=${s.display} tf=${s.transform} to=${s.transformOrigin} ta=${s.textAlign}`;};
  return [g(fig), g(bq), 'squeeze='+getComputedStyle(document.documentElement).getPropertyValue('--display-squeeze')].join('\n');
}));
await b.close();
