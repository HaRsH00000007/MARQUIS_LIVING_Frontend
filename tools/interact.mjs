import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
await p.goto('http://localhost:3000/',{waitUntil:'networkidle',timeout:120000});
await p.waitForTimeout(4000);
const log=(k,v)=>console.log(k.padEnd(30), v);

// cookie consent
log('cookie banner', await p.locator('aside[aria-label="Cookie consent"]').isVisible());
await p.getByRole('button',{name:'Accept'}).click();
await p.waitForTimeout(400);
log('cookie dismissed', !(await p.locator('aside[aria-label="Cookie consent"]').count()));

// hero day/night tab
await p.getByRole('tab',{name:'by night'}).click();
await p.waitForTimeout(1200);
log('night tab selected', await p.getByRole('tab',{name:'by night'}).getAttribute('aria-selected'));

// hero pin
await p.locator('button[aria-label="Crafted to endure"]').click();
await p.waitForTimeout(500);
log('hero tip open', await p.getByText('Natural stone, lime render').isVisible());
await p.locator('button[aria-label="Crafted to endure"]').click();

// book a call modal
await p.getByRole('button',{name:'Book a call'}).first().click();
await p.waitForTimeout(600);
log('modal open', await p.getByRole('dialog').isVisible());
await p.getByLabel('Name').fill('Test');
await p.getByLabel('Phone').fill('+34600000000');
await p.getByLabel('Email').fill('t@example.com');
await p.getByRole('button',{name:'Request a call'}).click();
await p.waitForTimeout(500);
log('modal submitted', await p.getByText('Thank you — we will be in touch').isVisible());
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
log('modal closed by Esc', !(await p.locator('[role=dialog]').count()));

// benefits slider
await p.evaluate(()=>document.querySelector('[class*=Benefits-module]')?.scrollIntoView());
await p.waitForTimeout(1500);
const before = await p.locator('[data-slider=pag]').first().innerText();
await p.locator('button[aria-label="Next slide"]').first().click();
await p.waitForTimeout(900);
const after = await p.locator('[data-slider=pag]').first().innerText();
log('benefits slider', `${before.replace(/\n/g,'')} -> ${after.replace(/\n/g,'')}`);

// amenity tabs
await p.evaluate(()=>document.querySelector('#amenities')?.scrollIntoView());
await p.waitForTimeout(1600);
log('amenity active', await p.locator('[role=tab][aria-selected=true]').last().innerText());
await p.getByRole('tab',{name:'Spa & gym'}).click();
await p.waitForTimeout(2500);
log('amenity after click', await p.locator('[role=tab][aria-selected=true]').last().innerText());

// footer to top
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(1200);
await p.getByRole('button',{name:/To top/i}).click();
await p.waitForTimeout(2500);
log('to top scrollY', Math.round(await p.evaluate(()=>window.scrollY)));

// keyboard focus
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(600);
await p.keyboard.press('Tab');
log('first tab stop', await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')||document.activeElement?.tagName));

log('page errors', errs.length ? errs.join(' | ') : 'none');
await b.close();
