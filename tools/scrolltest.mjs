import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [url,tag] of [['https://www.era-residence.com/','ref'],['http://localhost:3000/','loc']]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(6000);
  const r = await p.evaluate(async () => {
    const res=[];
    for (const target of [3000, 5760, 9000]) {
      scrollTo(0, target);
      await new Promise(r=>setTimeout(r,880));
      res.push(`target ${target} -> after 880ms: ${Math.round(scrollY)}`);
      await new Promise(r=>setTimeout(r,2500));
      res.push(`                 after 3.4s : ${Math.round(scrollY)}`);
    }
    return res.join('\n');
  });
  console.log('== '+tag+'\n'+r);
  await p.context().close();
}
await b.close();
