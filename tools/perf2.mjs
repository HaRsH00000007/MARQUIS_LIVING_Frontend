import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [url,tag] of [['https://www.era-residence.com/','REF'],['http://localhost:3000/','LOC']]) {
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(url,{waitUntil:'networkidle',timeout:180000});
  await p.waitForTimeout(5000);
  const r = await p.evaluate(async () => {
    const h = document.body.scrollHeight - innerHeight;
    const frames = []; let last = performance.now(); let running = true;
    const tick = (t) => { frames.push(t - last); last = t; if (running) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    for (let i = 0; i <= 220; i++) { scrollTo(0, (h*i)/220); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); }
    running = false;
    const f = frames.slice(5).sort((a,b)=>a-b); const pct=q=>f[Math.floor(f.length*q)];
    return { median:+pct(0.5).toFixed(1), p90:+pct(0.9).toFixed(1), over32:f.filter(x=>x>32).length, n:f.length };
  });
  console.log(`${tag}  median ${r.median}ms  p90 ${r.p90}ms  frames>32ms ${r.over32}/${r.n}`);
  await p.context().close();
}
await b.close();
