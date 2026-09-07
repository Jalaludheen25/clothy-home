import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { useInView } from '../../hooks/useMotion.js';

/* ==========================================================================
   Shop the Look
   --------------------------------------------------------------------------
   Built to the reference site's "Shop The Style" section, measured off the
   rendered page rather than eyeballed:

     centred title with a rule under it
     three pill tabs, active one filled
     3-column grid, 300px rows, 10px gap, 10px corner radius
     each card an image with an overlay label and an "Explore" link
     mobile: 2 columns, 200px rows, label in a band across the bottom

   Its three tabs are Party / Casual / Office Wear; ours map onto the
   occasions this catalogue actually carries.

   Cards are derived from the catalogue rather than hand-listed, so a retired
   piece drops out instead of leaving a dead card behind.
   ========================================================================== */

const TABS = [
  { id: 'Festive', label: 'Festive Wear' },
  { id: 'Everyday', label: 'Everyday Wear' },
  { id: 'Workwear', label: 'Office Wear' },
];

const PER_TAB = 6;

function Card({ product, index }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  /* Landscape crop: the cards are wider than tall, and the portrait source
     would otherwise show a sliver of the middle. */
  const ratio = 0.68;

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`stl__card ${inView ? 'is-in' : ''}`}
      ref={ref}
      style={{ '--stl-delay': `${Math.min(index, 5) * 70}ms`, '--tone': product.swatch }}
    >
      <img
        className="stl__img"
        src={src(product.images[0], 900, ratio)}
        srcSet={srcSet(product.images[0], ratio, [420, 640, 900, 1280])}
        sizes="(max-width: 760px) 46vw, 31vw"
        alt={product.name}
        loading="lazy"
        decoding="async"
      />
      <span className="stl__overlay">
        <span className="stl__label">{product.name}</span>
        <span className="stl__explore">Explore</span>
      </span>
    </Link>
  );
}

export default function ShopTheLook() {
  const [tab, setTab] = useState(TABS[0].id);

  const byTab = useMemo(() => {
    const out = {};
    for (const t of TABS) {
      out[t.id] = PRODUCTS.filter((p) => (p.occasion || []).includes(t.id))
        .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
        .slice(0, PER_TAB);
    }
    return out;
  }, []);

  /* Never render a tab that cannot fill itself. */
  const tabs = TABS.filter((t) => byTab[t.id].length > 0);
  const cards = byTab[tab] || [];

  return (
    <section className="stl" aria-labelledby="stl-title">
      <div className="stl__head">
        <h2 className="stl__title" id="stl-title">
          Shop the Look
        </h2>
        <span className="stl__rule" aria-hidden="true" />

        <div className="stl__tabs" role="tablist" aria-label="Looks by occasion">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="stl-panel"
              className={`stl__tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stl__panel" id="stl-panel" role="tabpanel">
        <div className="stl__grid">
          {cards.map((p, i) => (
            <Card product={p} index={i} key={p.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
