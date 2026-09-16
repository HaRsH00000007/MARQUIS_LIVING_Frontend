import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
for (const [W,H] of [[1920,1080],[1440,900],[1366,768],[1024,1366],[768,1024],[390,844]]) {
  const p = await (await b.newContext({viewport:{width:W,height:H}})).newPage();
  await p.goto('https://www.era-residence.com/',{waitUntil:'domcontentloaded',timeout:90000});
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const g = el => { if(!el) return null; const s=getComputedStyle(el); return {fs:s.fontSize,lh:s.lineHeight,ls:s.letterSpacing,ff:s.fontFamily.split(',')[0],fw:s.fontWeight}; };
    const pick = sel => g(document.querySelector(sel));
    return {
      html: getComputedStyle(document.documentElement).fontSize,
      body: getComputedStyle(document.body).fontSize,
      vars: ['--_special-units---scale-ratio','--_special-units---offset-l','--_units---u-96','--_fonts---h1--size','--_fonts---h2--size','--_fonts---h3--size','--_fonts---l2--size','--_fonts---p1--size']
        .reduce((a,k)=>(a[k]=getComputedStyle(document.documentElement).getPropertyValue(k).trim(),a),{}),
      h1: pick('h1'), h2: pick('h2'), h3: pick('h3'),
      p: pick('p'),
      classes: [...new Set([...document.querySelectorAll('[class]')].flatMap(e=>e.className.toString().split(/\s+/)))].filter(c=>/^(h[1-6]|p[12]|l[12]|c1|a[12])$/.test(c))
    };
  });
  console.log(W, JSON.stringify(r));
  await p.context().close();
}
await b.close();
