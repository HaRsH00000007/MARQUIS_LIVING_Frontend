import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>{
  const out={};
  const pill=document.querySelector('a[aria-label*="View available"]');
  if(pill){const r=pill.getBoundingClientRect();const s=getComputedStyle(pill);
    out.pill={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),vis:s.visibility,op:s.opacity,disp:s.display};
    const foot=pill.closest('div'); const fr=foot.getBoundingClientRect(); const fs=getComputedStyle(foot);
    out.fadeWrap={y:Math.round(fr.y),op:fs.opacity,cls:foot.className};
    const foot2=foot.parentElement; const f2=foot2.getBoundingClientRect();
    out.foot={y:Math.round(f2.y),h:Math.round(f2.height),pos:getComputedStyle(foot2).position,z:getComputedStyle(foot2).zIndex,cls:foot2.className};
  } else out.pill='NOT FOUND';
  return out;
}));
await b.close();
