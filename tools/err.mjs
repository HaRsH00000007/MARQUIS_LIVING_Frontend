import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const msgs=[];
p.on('console', m => { if(m.type()==='error'||m.type()==='warning') msgs.push(m.type()+': '+m.text().slice(0,220)); });
p.on('pageerror', e => msgs.push('PAGEERROR: '+String(e).slice(0,220)));
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(5000);
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=700){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(90);}
console.log([...new Set(msgs)].join('\n') || 'no console errors/warnings');
await b.close();
