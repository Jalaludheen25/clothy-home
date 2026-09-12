import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORIES,
  COLLECTIONS,
  PRODUCTS,
  inCollection,
} from '../data/catalog.js';
import {
  Figure,
  LinkLine,
  MagneticButton,
  Marquee,
  Reveal,
  RevealText,
  SectionHead,
} from '../components/ui/Primitives.jsx';
import { ProductGrid, ProductRail } from '../components/product/ProductCard.jsx';
import ShopTheLook from '../components/home/ShopTheLook.jsx';
import PanelHero from '../components/ui/PanelHero.jsx';

/* ==========================================================================
   Home
   ========================================================================== */

/* Five destinations, not five decorations. Each card names where it goes,
   and its photographs come from the pieces that actually live there — so the
   label and the pictures can never drift apart. */
const HERO_CARDS = [
  {
    kicker: 'The house',
    title: 'Sarees',
    line: 'Six yards, woven by hand.',
    cta: { label: 'Shop sarees', to: '/category/sarees' },
    from: { type: 'category', slug: 'sarees' },
  },
  {
    kicker: 'Just off the loom',
    title: 'New Arrivals',
    line: 'The most recent forty days.',
    cta: { label: 'See what is new', to: '/collection/new-arrivals' },
    from: { type: 'collection', slug: 'new-arrivals' },
  },
  {
    kicker: 'For the long days',
    title: 'Bridal & Ceremony',
    line: 'Korvai borders and real zari.',
    cta: { label: 'Explore bridal', to: '/collection/bridal' },
    from: { type: 'collection', slug: 'bridal' },
  },
  {
    kicker: 'By the metre',
    title: 'Churidar & Fabric',
    line: 'Stitched sets and cloth uncut.',
    cta: { label: 'Shop the cloth', to: '/category/churidar' },
    from: { type: 'category', slug: 'churidar' },
  },
  {
    kicker: 'Most asked for',
    title: 'Best Sellers',
    line: 'Reordered more than once.',
    cta: { label: 'See the favourites', to: '/collection/best-sellers' },
    from: { type: 'collection', slug: 'best-sellers' },
  },
];

function Hero() {
  const cards = useMemo(() => {
    /* The five destinations overlap — a new arrival is also a saree, a best
       seller is usually both — so taking the first few pieces of each pool
       independently put the same photograph on two cards at once. Claim as
       we go: each card takes pieces no earlier card has used, and only falls
       back to a shared one if its pool is exhausted. */
    const taken = new Set();
    return HERO_CARDS.map((card) => {
      const pool =
        card.from.type === 'category'
          ? PRODUCTS.filter((product) => product.category === card.from.slug)
          : inCollection(card.from.slug);

      const mine = [];
      for (const product of pool) {
        if (mine.length >= 6) break;
        if (taken.has(product.slug)) continue;
        taken.add(product.slug);
        mine.push(product);
      }
      /* A small collection can run dry once the cards before it have taken
         their share; better a repeat than an empty card. */
      if (!mine.length) mine.push(...pool.slice(0, 3));

      return { ...card, images: mine.map((product) => product.images[0]) };
    });
  }, []);

  return (
    <PanelHero
      panels={cards}
      masthead={
        <>
          <p className="phero__eyebrow eyebrow">Handloom, by hand</p>
          <h1 className="phero__title">
            Woven <em className="serif-italic">slowly,</em> worn for a lifetime.
          </h1>
          <Link to="/shop" className="phero__all">
            All pieces
            <svg viewBox="0 0 18 8" width="17" height="8" aria-hidden="true">
              <path
                d="M0 4h16M12.6 1 16 4l-3.4 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </>
      }
    />
  );
}

function CategoryWall() {
  const cloth = CATEGORIES;

  return (
    <section className="wall section">
      <div className="shell">
        <SectionHead
          eyebrow="The rooms"
          title="Two ways into the wardrobe."
          blurb="Six yards on one side, stitched sets and cloth by the metre on the other. Most of our clients end up with both."
          action={<LinkLine to="/shop">All pieces</LinkLine>}
        />

        <div className="wall__grid">
          {cloth.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90} className={`wall__cell wall__cell--wide`}>
              <Link to={`/category/${c.slug}`} className="tileC">
                <Figure
                  image={c.hero}
                  alt={c.name}
                  ratio={0.66}
                  width={1280}
                  sizes="(max-width: 900px) 92vw, 48vw"
                  className="tileC__fig"
                />
                <span className="tileC__body">
                  <em className="eyebrow">{c.group}</em>
                  <strong className="display d2">{c.name}</strong>
                  <span className="tileC__tag serif-italic">{c.tagline}</span>
                </span>
                <span className="tileC__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 12" width="26" height="13">
                    <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}

        </div>
      </div>
    </section>
  );
}

function CollectionStrip() {
  return (
    <section className="strip section">
      <div className="shell">
        <SectionHead
          eyebrow="Edits"
          title="Six ways in."
          action={<LinkLine to="/shop">Browse everything</LinkLine>}
        />
      </div>
      <div className="strip__rail">
        <div className="strip__track">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60} className="strip__cell">
              <Link to={`/collection/${c.slug}`} className="tileS">
                <Figure
                  image={c.hero}
                  alt={c.name}
                  ratio={1.28}
                  width={760}
                  sizes="(max-width: 700px) 68vw, 25vw"
                  className="tileS__fig"
                />
                <span className="tileS__meta">
                  <em className="eyebrow">{c.kicker}</em>
                  <strong className="display d3">{c.name}</strong>
                  <span className="tileS__blurb muted">{c.blurb}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferBand() {
  return (
    <section className="band">
      <div className="shell band__inner">
        <div className="band__text">
          <Reveal as="p" className="eyebrow">
            Archive offers
          </Reveal>
          <RevealText as="h2" className="display d2" text="Last pieces, up to 30% off." delay={70} />
          <Reveal as="p" className="lead" delay={180}>
            One or two of each remain. When they go, the pattern is retired.
          </Reveal>
        </div>
        <Reveal delay={240}>
          <MagneticButton to="/collection/archive-sale" variant="line" size="lg">
            See what is left
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {

  const newArrivals = inCollection('new-arrivals').slice(0, 8);
  const best = [...PRODUCTS]
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 8);

  return (
    <>
      <Hero />

      <ShopTheLook />

      <Marquee
        className="band-marquee"
        items={[
          'Handwoven in India',
          'Small runs only',
          'Free delivery over ₹15,000',
          'Thirty-day returns',
          'Real zari',
        ]}
        speed={38}
      />

      <section className="section-tight">
        <div className="shell">
          <SectionHead
            eyebrow="Just off the loom"
            title="New arrivals"
            action={<LinkLine to="/collection/new-arrivals">All new pieces</LinkLine>}
          />
          <ProductRail products={newArrivals} />
        </div>
      </section>

      <CategoryWall />

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="Most asked for"
            title="Best sellers"
            blurb="Reordered so often we keep the warps standing."
            action={<LinkLine to="/collection/best-sellers">See all</LinkLine>}
          />
          <ProductGrid products={best} cols={4} />
        </div>
      </section>

      <CollectionStrip />
      <OfferBand />
    </>
  );
}
