# Clothy Home

A storefront for a modern Indian fashion house — handwoven sarees, churidar sets
and dress cloth by the metre, and fine adornment. Built as a single-page React
app with no backend: the catalogue is a data module and the basket, wishlist,
account and orders live in the visitor's own browser.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serve the built bundle on :4173
```

Node 18+ is required.

---

## What is in it

| Route | Page |
| --- | --- |
| `/` | Home — hero, atelier note, category wall, the 3D adornment room, edits |
| `/shop` | Full catalogue with the filter rail and sorting |
| `/category/:slug` | Sarees · Churidar & Fabric · Jewellery · Earrings · Necklaces · Accessories |
| `/collection/:slug` | New Arrivals · Best Sellers · Zari & Gold · The Quiet Everyday · Bridal · Archive Offers |
| `/product/:slug` | Editorial product page — stacked gallery, hover zoom, lightbox, provenance |
| `/search?q=` | Weighted search results, filterable |
| `/wishlist` | Saved pieces, with "add all in stock" |
| `/cart` | Full bag with promotion codes |
| `/checkout` | Three-step checkout — contact, delivery, payment |
| `/account` | Orders, saved pieces, details, addresses |
| `/track` · `/track/:id` | Order tracking, with a stage that advances over real time |
| `/atelier` | The house, the makers, and every practical answer |

Overlays that sit above the routes: the bag drawer, full-bleed search, the
desktop mega-menu, the mobile sheet, and the mobile filter drawer.

---

## Layout of the source

```
src/
├── main.jsx                 entry — mounts the router and loads the stylesheets
├── App.jsx                  shell: preloader, route curtain, chrome, lazy routes
├── data/
│   ├── images.js            image manifest + sized-URL helpers (generated list)
│   └── catalog.js           products, categories, collections, facets, pricing
├── context/StoreContext.jsx bag, wishlist, orders, client, search, toasts
├── hooks/
│   ├── useMotion.js         reveal, scroll progress, parallax, magnetic, tilt…
│   ├── useLenis.jsx         one smooth-scroll instance, shared by context
│   └── useHeaderTone.js     per-page header/chrome flags
├── components/
│   ├── layout/              Header · Footer · CartDrawer · SearchOverlay · Chrome
│   ├── ui/Primitives.jsx    Reveal · RevealText · Figure · MagneticButton · …
│   ├── product/             ProductCard · Filters · Gallery
│   └── home/JewelStage.jsx  the drag-to-turn 3D showcase
├── pages/                   one file per route
└── styles/
    ├── tokens.css           colour, type scale, rhythm, motion
    ├── base.css             reset and shared type utilities
    ├── chrome.css           preloader, header, drawers, overlays, cursor
    ├── components.css       buttons, cards, grids, form controls
    └── pages.css            per-page layout
```

### Adding a product

Append an entry to `RAW` in `src/data/catalog.js`. Only `slug`, `name`,
`category`, `price`, `colour`, `swatch`, `images` and `occasion` are required —
everything else (id, stock, care copy, sizes, badges, discount) is derived.
Facet lists for fabric and metal are computed from the catalogue, so a new
weave appears in the filter rail on its own.

### Swapping the photography

All 118 photographs are referenced through `src/data/images.js`, which appends
width and crop hints to a CDN URL. Point `src()` at a different host — or at
files in `public/` — and nothing else has to change.

The home hero carries a `focus` per frame (`src/pages/Home.jsx`), used as
`object-position`. Full-bleed crops of portrait photographs need telling where
the subject is, or the hero cuts the model off. Hero frames are also chosen for
how the headline sits on them: the type is bottom-left, so a frame that is
bright there is out however good the picture — measured, not eyeballed.

---

## Design

**Brand.** The supplied artwork lives in `public/logo/` in two inks (oxblood
`#450b17` and off-white `#f8eee4`) and two weights. `src/components/ui/Logo.jsx`
picks the right one per surface; the header renders *both* inks and cross-fades
them, because swapping `src` as it leaves a hero would flash an undecoded image.
The favicon is the house-and-C mark cropped out of the wordmark. The oxblood is
the palette's `--maroon`, and drives offer badges, saved state and low-stock.

**Palette.** A warm neutral ground (bone, sand, clay) against espresso ink, with
brass as the only metal and the brand oxblood as the one saturated accent.
Colour is otherwise left to the textiles. Dark passages use the `.on-ink` class,
which re-points the token set rather than restating colours; anything that must
survive that swap reads from `--ink-base` / `--bone-base`.

**Type.** Fraunces for display and Inter Tight for interface, on a fluid clamp
scale so a 360px phone and a 1600px desktop both get a considered measure.

**Motion.** Smooth scrolling via Lenis; masked word reveals, scroll-scrubbed
parallax, magnetic buttons, a pointer-tracking cursor, card tilt and image
swaps, a curtain between routes, and a CSS-3D ring in the adornment room that
drifts on its own and can be dragged, wheeled or arrow-keyed.

Every effect is transform- and opacity-only, driven from shared
`requestAnimationFrame` loops rather than scroll listeners.

---

## Accessibility and resilience

- `prefers-reduced-motion` short-circuits the preloader, all reveals, parallax,
  magnetics, tilt and the cursor. Content renders in place, never hidden behind
  an effect that did not run.
- Drawers and overlays trap focus, close on `Escape`, and lock body scroll.
- Search is keyboard-first: arrows walk the results, Enter opens one.
- Landmarks, breadcrumbs, a skip link, a continuous heading outline, `alt` on
  every image, and labels on every icon-only control.
- Images reserve their box and fade up from a colour drawn from the product, so
  a slow connection shows a warm plate rather than a jumping layout.

## Notes on the demonstration

There is no server. Payment is a timed stand-in, no card details leave the page,
and the bag, wishlist, account and orders are held in `localStorage` under
`clothy-home::v1` — clearing site data resets everything. Order tracking derives
its stage from elapsed time against the promised date, so an order genuinely
moves through the atelier while you watch it.
