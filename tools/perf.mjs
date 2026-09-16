import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(4000);
// measure frame pacing during a continuous scroll of the whole page
const r = await p.evaluate(async () => {
  const h = document.body.scrollHeight - innerHeight;
  const frames = []; let last = performance.now(); let running = true;
  const tick = (t) => { frames.push(t - last); last = t; if (running) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const steps = 220;
  for (let i = 0; i <= steps; i++) {
    scrollTo(0, (h * i) / steps);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }
  running = false;
  const f = frames.slice(5).sort((a, b) => a - b);
  const pct = (q) => f[Math.floor(f.length * q)];
  return { n: f.length, median: +pct(0.5).toFixed(1), p90: +pct(0.9).toFixed(1),
           p99: +pct(0.99).toFixed(1), over32: f.filter(x => x > 32).length };
});
console.log('frame ms — median', r.median, ' p90', r.p90, ' p99', r.p99, ' frames>32ms', r.over32, '/', r.n);
const ls = await p.evaluate(()=>new Promise(res=>{ let v=0;
  new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) v+=e.value;}).observe({type:'layout-shift',buffered:true});
  setTimeout(()=>res(+v.toFixed(4)),600); }));
console.log('cumulative layout shift', ls);
await b.close();
