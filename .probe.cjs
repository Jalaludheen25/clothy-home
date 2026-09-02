const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4200);
  const el = await p.$('.stage');
  await p.evaluate(() => document.querySelector('.stage').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(2500);
  await el.screenshot({ path: process.env.OUT + '/stage-full.png' });
  await b.close();
})();
