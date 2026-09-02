/* Visual QA for the stateful pages: seeds a bag, a wishlist, a signed-in
   client and a placed order into localStorage before navigating. */
const { chromium } = require('playwright');

const BASE = 'http://localhost:4173';
const OUT = process.env.OUT || 'shots';
const VIEWS = { desk: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const ROUTES = (process.env.PAGES || '').split(',').map((r) => '/' + r.replace(/^\/+/, ''));

const now = Date.now();
const SEED = {
  cart: [
    { slug: 'suvarna-banarasi-tissue-saree', size: '5.5m + blouse piece', qty: 1, addedAt: now },
    { slug: 'malli-temple-jhumka', size: null, qty: 2, addedAt: now },
    { slug: 'avadh-cream-chikankari-set', size: 'M', qty: 1, addedAt: now },
  ],
  wishlist: ['rajkumari-kundan-choker', 'ratri-noir-chanderi-saree', 'vajra-gold-cuff', 'gulnaar-rose-ajrakh-set'],
  recentlyViewed: ['tamra-copper-katan-saree', 'bindu-mini-hoops'],
  user: { name: 'Meera Raghavan', email: 'meera@example.in', phone: '+91 98400 11223', since: 2019 },
  orders: [
    {
      id: 'CH20260812345',
      placedAt: new Date(now - 5 * 86400000).toISOString(),
      etaAt: new Date(now + 6 * 86400000).toISOString(),
      items: [
        {
          slug: 'tamra-copper-katan-saree',
          name: 'Tamra Copper Katan Saree',
          size: '5.5m + blouse piece',
          qty: 1,
          price: 27400,
          image: 'https://images.pexels.com/photos/33206348/pexels-photo-33206348.jpeg',
        },
        {
          slug: 'bindu-mini-hoops',
          name: 'Bindu Mini Hoops',
          size: null,
          qty: 1,
          price: 4200,
          image: 'https://images.pexels.com/photos/10082804/pexels-photo-10082804.jpeg',
        },
      ],
      totals: { subtotal: 31600, savings: 0, discount: 0, shipping: 0, tax: 1580, total: 33180, count: 2 },
      grandTotal: 33180,
      contact: { email: 'meera@example.in', phone: '+91 98400 11223' },
      address: {
        name: 'Meera Raghavan',
        line1: '14 Bhattad Tower, Luz Church Road',
        line2: 'Opposite the Kapaleeshwarar tank',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pin: '600004',
      },
      delivery: { id: 'express', label: 'Express', note: 'Insured, 2–3 working days', cost: 900 },
      payment: { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
      stage: 0,
    },
  ],
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  for (const [vname, viewport] of Object.entries(VIEWS)) {
    if (process.env.ONLY && process.env.ONLY !== vname) continue;
    const ctx = await browser.newContext({ viewport });
    await ctx.addInitScript((seed) => {
      window.localStorage.setItem('clothy-home::v1', JSON.stringify(seed));
    }, SEED);
    const page = await ctx.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`[${vname}] ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`[${vname}] PAGEERROR ${e.message}`));

    for (const route of ROUTES) {
      const name = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => errors.push(String(e)));
      await page.waitForTimeout(4200);
      await page.screenshot({ path: `${OUT}/${name}-${vname}-0.png` });
      if (process.env.SCROLLS) {
        for (let i = 1; i <= Number(process.env.SCROLLS); i++) {
          await page.evaluate((n) => window.scrollTo({ top: innerHeight * n * 0.92, behavior: 'instant' }), i);
          await page.waitForTimeout(1500);
          await page.screenshot({ path: `${OUT}/${name}-${vname}-${i}.png` });
        }
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log(errors.length ? 'ISSUES:\n' + [...new Set(errors)].join('\n') : 'no console errors');
})();
