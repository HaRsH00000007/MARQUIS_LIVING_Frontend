import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>{
  const out=[];
  document.querySelectorAll('*').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.right>420||r.left<-30){
      out.push({t:el.tagName,c:String(el.className).slice(0,45),l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width)});
    }
  });
  return {docW:document.documentElement.scrollWidth, innerW:window.innerWidth, offenders:out.slice(0,18)};
}));
await b.close();
