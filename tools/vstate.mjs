/**
 * Visual-state comparator: drives production and the local build in real
 * Chrome at matched absolute scroll positions and reports element geometry
 * side by side. Used for the Phase 7 checks in docs/visual-qa.md.
 *
 *   node tools/vstate.mjs <probe> [port]
 */
import { chromium } from 'playwright-core';

const PROBE = process.argv[2] || 'typo';
const PORT = process.argv[3] || '3001';
const REF = 'https://www.era-residence.com/';
const LOC = `http://localhost:${PORT}/`;

const probes = {
  typo: { at: [0], fn: () => {
    const out = [];
    for (const c of ['h1','h2','h3','h4','h5','h6','a1','a2','c1','p1','l1','l2']) {
      const els = [...document.querySelectorAll('.' + c)].filter(e => e.getClientRects().length);
      const seen = new Map();
      for (const e of els.slice(0, 40)) {
        const s = getComputedStyle(e);
        const k = s.fontSize + '|' + s.fontFamily.split(',')[0].replace(/"/g, '');
        if (!seen.has(k)) seen.set(k, { tok: c, fs: s.fontSize, ff: s.fontFamily.split(',')[0].replace(/"/g,''), tf: s.transform.slice(0, 22) });
      }
      out.push(...seen.values());
    }
    return out;
  }},
  concept: { at: [6300, 7203, 8106, 9009, 9912, 10813], fn: () => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 10 && r.height > 10; };
    /* The ground actually painted at this scroll position. Walking ancestors
       finds the html fill, not <PageCanvas>, which is a fixed z-index:-1
       sibling — so check that layer first when it is present. */
    const bg = () => {
      const layer = document.querySelector('[class*="PageCanvas"]');
      if (layer) {
        const s = getComputedStyle(layer);
        return s.backgroundImage !== 'none' ? s.backgroundImage : s.backgroundColor;
      }
      let n = document.elementFromPoint(720, 450), c = 'rgba(0, 0, 0, 0)';
      while (n && c === 'rgba(0, 0, 0, 0)') { c = getComputedStyle(n).backgroundColor; n = n.parentElement; }
      return c;
    };
    const out = { bg: bg(), els: [] };
    for (const e of document.querySelectorAll('h1,h2,h3,h4,.h1,.h2,.h3,.h4,.c1,p.p1')) {
      if (!vis(e)) continue; const r = e.getBoundingClientRect();
      out.els.push({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  }},
  arch: { at: [18400, 19100, 19800, 20500, 21200], fn: () => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.bottom > 0 && r.top < innerHeight; };
    const clips = [...document.querySelectorAll('*')].filter(e => vis(e) && getComputedStyle(e).clipPath !== 'none')
      .map(e => { const r = e.getBoundingClientRect(); return { cls: String(e.className || '').slice(0, 30), x: Math.round(r.left), w: Math.round(r.width), clip: getComputedStyle(e).clipPath.slice(0, 58) }; });
    const imgs = [...document.querySelectorAll('img')].filter(vis)
      .map(e => { const r = e.getBoundingClientRect(); return { s: (e.currentSrc || '').split('/').pop().split('?')[0].slice(0, 34), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
    const heads = [...document.querySelectorAll('.h1,.h2,h1,h2')].filter(vis)
      .map(e => { const r = e.getBoundingClientRect(); return { t: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 20), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) }; });
    return { clips: clips.slice(0, 5), imgs: imgs.slice(0, 4), heads: heads.slice(0, 3) };
  }},
};

const p = probes[PROBE];
if (!p) { console.error('unknown probe:', PROBE, '- have:', Object.keys(probes).join(', ')); process.exit(1); }

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
async function run(url) {
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForTimeout(6500);
  let h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(70); h = await page.evaluate(() => document.body.scrollHeight); }
  const res = {};
  for (const y of p.at) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(1100); res[y] = await page.evaluate(p.fn); }
  res._errs = errs; res._docH = h;
  await page.context().close();
  return res;
}
const [ref, loc] = [await run(REF), await run(LOC)];
console.log(`docH  REF ${ref._docH}   LOC ${loc._docH}`);
if (loc._errs.length) console.log('LOCAL console errors:', loc._errs.join(' | '));
for (const y of p.at) {
  console.log(`\n########## y=${y}`);
  console.log('  REF ', JSON.stringify(ref[y]));
  console.log('  LOC ', JSON.stringify(loc[y]));
}
await b.close();
