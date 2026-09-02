/* Visual QA harness — screenshots each route at desktop and phone widths and
   reports any console/page errors. Routes are passed WITHOUT a leading slash
   so Git Bash does not rewrite them into Windows paths. */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = process.env.OUT || 'shots';
const SCROLLS = Number(process.env.SCROLLS || 0);
const VIEWS = { desk: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const ROUTES = (process.env.PAGES || '').split(',').map((r) => '/' + r.replace(/^\/+/, ''));

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  for (const [vname, viewport] of Object.entries(VIEWS)) {
    if (process.env.ONLY && process.env.ONLY !== vname) continue;
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`[${vname}] ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`[${vname}] PAGEERROR ${e.message}`));

    for (const route of ROUTES) {
      const name = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
      const res = await page
        .goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
        .catch((e) => errors.push(`[${vname}] GOTO ${route}: ${e.message}`));
      if (res && !res.ok()) errors.push(`[${vname}] HTTP ${res.status()} on ${route}`);
      await page.waitForTimeout(4200); // preloader + reveal settle
      await page.screenshot({ path: `${OUT}/${name}-${vname}-0.png` });
      for (let i = 1; i <= SCROLLS; i++) {
        await page.evaluate((n) => {
          window.scrollTo({ top: window.innerHeight * n * 0.92, behavior: 'instant' });
        }, i);
        await page.waitForTimeout(1600);
        await page.screenshot({ path: `${OUT}/${name}-${vname}-${i}.png` });
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log(errors.length ? 'ISSUES:\n' + [...new Set(errors)].join('\n') : 'no console errors');
})();
