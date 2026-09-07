import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OCCASIONS, PRODUCTS, formatINR } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useInView } from '../../hooks/useMotion.js';
import { LinkLine, RevealText } from '../ui/Primitives.jsx';

/* ==========================================================================
   Shop the Look
   --------------------------------------------------------------------------
   Occasion tabs over a horizontal rail of styled looks — the pattern the
   reference site uses for browsing by style rather than by category.

   Where it goes further: a look is not a link to a collection, it is the
   actual pieces. Each card lists what is in it with prices, and the whole
   look can go into the bag in one action, which is the thing "shop the look"
   is supposed to mean.
   ========================================================================== */

/**
 * Looks are defined by product slug so they can never drift out of sync with
 * the catalogue — a look whose pieces have been retired simply stops
 * rendering rather than showing a dead price.
 */
const LOOKS = [
  {
    id: 'temple-morning',
    name: 'The Temple Morning',
    occasion: 'Festive',
    note: 'Undyed tussar with a narrow gold border, and cloth to match.',
    pieces: ['alaknanda-ivory-tussar-saree', 'gold-zari-border-silk-fabric'],
  },
  {
    id: 'long-reception',
    name: 'The Long Reception',
    occasion: 'Bridal',
    note: 'Real zari on the loom for eighty-one days, worn with a rouge katan.',
    pieces: ['suvarna-banarasi-tissue-saree', 'aaravi-rouge-silk-saree'],
  },
  {
    id: 'working-week',
    name: 'The Working Week',
    occasion: 'Workwear',
    note: 'Cotton-silk that holds its shape from a meeting through to dinner.',
    pieces: ['sharada-sage-cotton-silk-set', 'dhara-mocha-tussar-set'],
  },
  {
    id: 'quiet-tuesday',
    name: 'A Quiet Tuesday',
    occasion: 'Everyday',
    note: 'Two-hundred-count mulmul, and a kota so fine it weighs nothing.',
    pieces: ['vaidehi-ivory-mulmul-saree', 'mrittika-terracotta-kota-suit'],
  },
  {
    id: 'evening-ink',
    name: 'Evening in Ink',
    occasion: 'Evening',
    note: 'Black on a Chanderi loom, with satin silk by the metre beside it.',
    pieces: ['ratri-noir-chanderi-saree', 'noir-satin-silk-fabric'],
  },
  {
    id: 'lucknow-afternoon',
    name: 'The Lucknow Afternoon',
    occasion: 'Festive',
    note: 'Four hundred hours of chikankari, and the cloth to have more made.',
    pieces: ['avadh-cream-chikankari-set', 'ivory-chikankari-dress-fabric'],
  },
  {
    id: 'kanchi-red',
    name: 'Kanchipuram Red',
    occasion: 'Bridal',
    note: 'A korvai border joined by hand, against a deep maroon pit-loom silk.',
    pieces: ['meenakshi-kanjivaram-silk-saree', 'anahi-handloom-silk-saree'],
  },
  {
    id: 'garden-party',
    name: 'The Garden Party',
    occasion: 'Everyday',
    note: 'Ajrakh dyed sixteen times by hand, with mulmul cotton to follow.',
    pieces: ['gulnaar-rose-ajrakh-set', 'sharan-ivory-cotton-dress'],
  },
];

function LookCard({ look, index }) {
  const { addToCart, toast } = useStore();
  const [ref, inView] = useInView({ threshold: 0.12 });

  const pieces = useMemo(
    () => look.pieces.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter(Boolean),
    [look.pieces],
  );
  if (!pieces.length) return null;

  const [lead] = pieces;
  const total = pieces.reduce((sum, p) => sum + p.price, 0);

  const addLook = () => {
    const available = pieces.filter((p) => p.inStock);
    if (!available.length) {
      toast('That look is between runs just now', 'error');
      return;
    }
    available.forEach((p) =>
      addToCart(p, {
        /* Default to the middle size where a piece has a size chart, the same
           rule the quick-add on a product card uses. */
        size: p.sizes ? p.sizes[Math.min(2, p.sizes.length - 1)] : null,
        silent: true,
        open: false,
      }),
    );
    toast(`${look.name} — ${available.length} pieces added`);
  };

  return (
    <article
      className={`look ${inView ? 'is-in' : ''}`}
      ref={ref}
      style={{ '--look-delay': `${Math.min(index, 5) * 80}ms` }}
    >
      <Link to={`/product/${lead.slug}`} className="look__media" style={{ '--tone': lead.swatch }}>
        <img
          src={src(lead.images[0], 900, 1.28)}
          srcSet={srcSet(lead.images[0], 1.28, [420, 640, 900, 1280])}
          sizes="(max-width: 700px) 78vw, (max-width: 1100px) 42vw, 30vw"
          alt={look.name}
          loading="lazy"
          decoding="async"
        />
        <span className="look__count">{pieces.length} pieces</span>
      </Link>

      <div className="look__body">
        <p className="eyebrow look__occasion">{look.occasion}</p>
        <h3 className="look__name display d3">
          <Link to={`/product/${lead.slug}`}>{look.name}</Link>
        </h3>
        <p className="look__note muted">{look.note}</p>

        <ul className="look__pieces">
          {pieces.map((p) => (
            <li key={p.slug}>
              <Link to={`/product/${p.slug}`}>
                <img src={src(p.images[0], 120, 1.25)} alt="" loading="lazy" />
                <span className="look__piece-name">{p.name}</span>
                <span className="look__piece-price num">{formatINR(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="look__foot">
          <button type="button" className="look__add" onClick={addLook}>
            Add the look
          </button>
          <span className="look__total num">{formatINR(total)}</span>
        </div>
      </div>
    </article>
  );
}

export default function ShopTheLook() {
  const [tab, setTab] = useState('All');

  /* Only offer a tab that actually has looks behind it. */
  const tabs = useMemo(
    () => ['All', ...OCCASIONS.filter((o) => LOOKS.some((l) => l.occasion === o))],
    [],
  );
  const shown = tab === 'All' ? LOOKS : LOOKS.filter((l) => l.occasion === tab);

  return (
    <section className="stl section-tight" aria-labelledby="stl-title">
      <div className="shell">
        <header className="stl__head">
          <div>
            <p className="eyebrow">Styled by the house</p>
            <RevealText as="h2" className="display d2 stl__title" id="stl-title" text="Shop the look" />
          </div>
          <LinkLine to="/shop">All pieces</LinkLine>
        </header>

        <div className="stl__tabs" role="tablist" aria-label="Looks by occasion">
          {tabs.map((t) => (
            <button
              type="button"
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`stl__tab ${tab === t ? 'is-on' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="stl__rail">
        <div className="stl__track">
          {shown.map((look, i) => (
            <LookCard look={look} index={i} key={look.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
