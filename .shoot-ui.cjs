/* Drives the interactive surfaces — drawers, overlays, menus, 3D stage — and
   captures each one open. */
const { chromium } = require('playwright');

const BASE = 'http://localhost:4173';
const OUT = process.env.OUT || 'shots';

const SEED = {
  cart: [
    { slug: 'suvarna-banarasi-tissue-saree', size: '5.5m + blouse piece', qty: 1, addedAt: Date.now() },
    { slug: 'malli-temple-jhumka', size: null, qty: 2, addedAt: Date.now() },
  ],
  wishlist: ['rajkumari-kundan-choker'],
  recentlyViewed: [],
  user: null,
  orders: [],
};

const shots = [
  {
    name: 'cart-drawer', route: '/', view: 'desk',
    act: async (p) => { await p.click('.header__icon--bag'); await p.waitForTimeout(1100); },
  },
  {
    name: 'search-overlay', route: '/', view: 'desk',
    act: async (p) => {
      await p.click('.header__icon:has-text("Search")');
      await p.waitForTimeout(700);
      await p.fill('.search__bar input', 'jhumka');
      await p.waitForTimeout(900);
    },
  },
  {
    name: 'mega-shop', route: '/', view: 'desk',
    act: async (p) => { await p.hover('.header__link:has-text("Shop")'); await p.waitForTimeout(1200); },
  },
  {
    name: 'mega-collections', route: '/', view: 'desk',
    act: async (p) => { await p.hover('.header__link:has-text("Collections")'); await p.waitForTimeout(1200); },
  },
  {
    name: 'jewel-stage', route: '/', view: 'desk',
    act: async (p) => {
      await p.evaluate(() => document.querySelector('.stage').scrollIntoView({ block: 'center' }));
      await p.waitForTimeout(2600);
    },
  },
  {
    name: 'lightbox', route: '/product/rajkumari-kundan-choker', view: 'desk',
    act: async (p) => { await p.click('.plateG'); await p.waitForTimeout(1100); },
  },
  {
    name: 'card-hover', route: '/shop', view: 'desk',
    act: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 700));
      await p.waitForTimeout(900);
      await p.hover('.card:nth-of-type(2) .card__media');
      await p.waitForTimeout(1200);
    },
  },
  {
    name: 'nav-sheet', route: '/', view: 'phone',
    act: async (p) => { await p.click('.header__burger'); await p.waitForTimeout(1100); },
  },
  {
    name: 'filter-drawer', route: '/shop', view: 'phone',
    act: async (p) => { await p.click('.sortbar__filters'); await p.waitForTimeout(1000); },
  },
  {
    name: 'preloader', route: '/', view: 'desk', wait: 900, act: async () => {},
  },
];

const VIEWS = { desk: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: VIEWS[s.view] });
    await ctx.addInitScript((seed) => {
      window.localStorage.setItem('clothy-home::v1', JSON.stringify(seed));
    }, SEED);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${s.name}: ${e.message}`));
    await page.goto(BASE + s.route, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(s.wait ?? 4200);
    try {
      await s.act(page);
    } catch (e) {
      errors.push(`${s.name} ACT: ${e.message.split('\n')[0]}`);
    }
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    await ctx.close();
  }
  await browser.close();
  console.log(errors.length ? 'ISSUES:\n' + errors.join('\n') : 'no errors');
})();
