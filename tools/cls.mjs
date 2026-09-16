import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4),
        nodes: (e.sources||[]).slice(0,3).map(s => s.node ? (s.node.tagName||'') + '.' + String(s.node.className||'').slice(0,40) : '?') });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:150000});
await p.waitForTimeout(3000);
await p.evaluate(async () => {
  const h = document.body.scrollHeight - innerHeight;
  for (let i = 0; i <= 160; i++) { scrollTo(0, (h*i)/160); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); }
});
await p.waitForTimeout(1500);
const r = await p.evaluate(()=>({ total:+window.__shifts.reduce((a,s)=>a+s.v,0).toFixed(4), top: window.__shifts.sort((a,b)=>b.v-a.v).slice(0,8) }));
console.log('CLS during full scroll:', r.total);
for (const s of r.top) console.log(`  ${String(s.t).padStart(5)}ms  ${String(s.v).padStart(7)}  ${s.nodes.join(' | ')}`);
await b.close();
