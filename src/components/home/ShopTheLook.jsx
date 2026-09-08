import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatINR } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useInView } from '../../hooks/useMotion.js';

/* ==========================================================================
   Shop the Look
   --------------------------------------------------------------------------
   Follows the reference site's tabbed style carousel: a centred title over a
   rule, three pill tabs with the active one filled, and a rail of image cards
   below. Ours goes a step past it — the reference's cards link off to a
   collection page, where these name the actual pieces with their prices and
   drop the whole look into the bag in one tap.

   A look is a list of product slugs; nothing about a piece is duplicated
   here. The look resolves against the live catalogue on render, so one whose
   pieces have been retired stops appearing rather than showing a dead price.
   ========================================================================== */

const LOOKS = [
  /* --- Festive --------------------------------------------------------- */
  {
    id: 'muhurtham',
    tab: 'Festive',
    name: 'The Muhurtham Morning',
    note: 'For the hour before the fire is lit.',
    pieces: [
      { slug: 'meenakshi-kanjivaram-silk-saree', role: 'The saree' },
      { slug: 'gold-zari-border-silk-fabric', role: 'The blouse cloth' },
    ],
  },
  {
    id: 'sangeet',
    tab: 'Festive',
    name: 'Sangeet, After Nine',
    note: 'Mashru holds a light the way satin cannot.',
    pieces: [
      { slug: 'rukmini-magenta-mashru-saree', role: 'The saree' },
      { slug: 'rose-mulberry-silk-fabric', role: 'The blouse cloth' },
    ],
  },
  {
    id: 'ceremony',
    tab: 'Festive',
    name: 'The Long Ceremony',
    note: 'Burnt copper, closed with black.',
    pieces: [
      { slug: 'tamra-copper-katan-saree', role: 'The saree' },
      { slug: 'noir-satin-silk-fabric', role: 'The blouse cloth' },
    ],
  },

  /* --- Everyday -------------------------------------------------------- */
  {
    id: 'saturday',
    tab: 'Everyday',
    name: 'Long Saturday',
    note: 'Mulmul, a bandhani blouse, nowhere to be at four.',
    pieces: [
      { slug: 'vaidehi-ivory-mulmul-saree', role: 'The saree' },
      { slug: 'bandhani-red-cotton-fabric', role: 'The blouse cloth' },
    ],
  },
  {
    id: 'lunch',
    tab: 'Everyday',
    name: 'The Standing Lunch',
    note: 'Ajrakh, with something plain over it.',
    pieces: [
      { slug: 'gulnaar-rose-ajrakh-set', role: 'The set' },
      { slug: 'midnight-crepe-dress-fabric', role: 'The dupatta' },
    ],
  },
  {
    id: 'cotton',
    tab: 'Everyday',
    name: 'Cotton Weather',
    note: 'A plain dress asks for one good silk.',
    pieces: [
      { slug: 'sharan-ivory-cotton-dress', role: 'The dress' },
      { slug: 'rose-mulberry-silk-fabric', role: 'The dupatta' },
    ],
  },

  /* --- Workwear -------------------------------------------------------- */
  {
    id: 'ninetoseven',
    tab: 'Workwear',
    name: 'Nine to Seven',
    note: 'Mocha tussar, which survives a day of sitting.',
    pieces: [
      { slug: 'dhara-mocha-tussar-set', role: 'The set' },
      { slug: 'midnight-crepe-dress-fabric', role: 'The dupatta' },
    ],
  },
  {
    id: 'review',
    tab: 'Workwear',
    name: 'The Long Review',
    note: 'Raw ivory, finished in black.',
    pieces: [
      { slug: 'alaknanda-ivory-tussar-saree', role: 'The saree' },
      { slug: 'noir-satin-silk-fabric', role: 'The blouse cloth' },
    ],
  },
  {
    id: 'friday',
    tab: 'Workwear',
    name: 'Half-Day Friday',
    note: 'Sage cotton silk, one loud thing over the shoulder.',
    pieces: [
      { slug: 'sharada-sage-cotton-silk-set', role: 'The set' },
      { slug: 'bandhani-red-cotton-fabric', role: 'The dupatta' },
    ],
  },
];

const TABS = [
  { id: 'Festive', label: 'Festive Wear' },
  { id: 'Everyday', label: 'Everyday Wear' },
  { id: 'Workwear', label: 'Office Wear' },
];

function LookCard({ look, index }) {
  const { addToCart, toast } = useStore();
  const [ref, inView] = useInView({ threshold: 0.1 });

  const total = look.pieces.reduce((sum, piece) => sum + piece.product.price, 0);

  /* Genuinely one tap now that nothing in the buying flow carries a size. */
  const addLook = () => {
    look.pieces.forEach((piece, i) => {
      addToCart(piece.product, {
        silent: true,
        // One drawer, opened once the last piece is in.
        open: i === look.pieces.length - 1,
      });
    });
    toast(`${look.name} added — ${look.pieces.length} pieces`);
  };

  const hero = look.pieces[0].product;

  return (
    <article
      className={`look ${inView ? 'is-in' : ''}`}
      ref={ref}
      style={{ '--stl-delay': `${Math.min(index, 5) * 80}ms`, '--tone': hero.swatch }}
    >
      <Link to={`/product/${hero.slug}`} className="look__shot" tabIndex={-1} aria-hidden="true">
        <img
          className="look__img"
          src={src(hero.images[0], 900, 1.04)}
          srcSet={srcSet(hero.images[0], 1.04, [420, 640, 900, 1280])}
          sizes="(max-width: 760px) 80vw, 31vw"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="look__chip num">{look.pieces.length} pieces</span>
      </Link>

      <div className="look__body">
        <h3 className="look__name">{look.name}</h3>
        <p className="look__note">{look.note}</p>

        <ul className="look__list">
          {look.pieces.map((piece) => (
            <li className="look__piece" key={piece.product.slug}>
              <span className="look__role">{piece.role}</span>
              <Link to={`/product/${piece.product.slug}`} className="look__piece-name">
                {piece.product.name}
              </Link>
              <span className="look__price num">{formatINR(piece.product.price)}</span>
            </li>
          ))}
        </ul>

        <div className="look__foot">
          <p className="look__total">
            <span>The look</span>
            <strong className="num">{formatINR(total)}</strong>
          </p>
          <button type="button" className="look__add" onClick={addLook}>
            Add the look
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ShopTheLook() {
  const [tab, setTab] = useState(TABS[0].id);

  const looks = useMemo(() => {
    const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
    return LOOKS.map((look) => {
      const pieces = look.pieces
        .map((piece) => ({ ...piece, product: bySlug.get(piece.slug) }))
        .filter((piece) => piece.product && piece.product.inStock);
      return pieces.length === look.pieces.length ? { ...look, pieces } : null;
    }).filter(Boolean);
  }, []);

  const tabs = TABS.filter((t) => looks.some((l) => l.tab === t.id));
  const active = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id;
  const shown = looks.filter((l) => l.tab === active);

  if (shown.length === 0) return null;

  return (
    <section className="stl" aria-labelledby="stl-title">
      <div className="stl__head">
        <h2 className="stl__title" id="stl-title">
          Shop the Look
        </h2>
        <span className="stl__rule" aria-hidden="true" />
        <p className="stl__sub">Put together in the shop. Take the pair in one tap.</p>

        <div className="stl__tabs" role="tablist" aria-label="Looks by occasion">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              aria-controls="stl-panel"
              className={`stl__tab ${active === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stl__panel" id="stl-panel" role="tabpanel" aria-label={`${active} looks`}>
        <div className="stl__grid">
          {shown.map((look, i) => (
            <LookCard look={look} index={i} key={look.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
