import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERR:',m.text())});
p.on('pageerror',e=>console.log('PAGEERR:',e.message));
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:180000});
await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>{
 const out=[];
 for(const el of document.querySelectorAll('[class*=track]')) out.push(el.className+' | '+el.children.length);
 return out.join('\n')||'NONE';
}));
await b.close();
