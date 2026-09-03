import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { COLLECTIONS, collectionBySlug, inCollection } from '../data/catalog.js';
import { src, srcSet } from '../data/images.js';
import { useScrollProgress } from '../hooks/useMotion.js';
import { ProductGrid } from '../components/product/ProductCard.jsx';
import {
  ActiveChips,
  EMPTY_FILTERS,
  FilterRail,
  applyFilters,
} from '../components/product/Filters.jsx';
import { Crumbs, EmptyState, MagneticButton, Reveal, RevealText } from '../components/ui/Primitives.jsx';
import { useDarkHeader } from '../hooks/useHeaderTone.js';
import NotFound from './NotFound.jsx';

/* ==========================================================================
   Collection
   ========================================================================== */

export default function Collection() {
  useDarkHeader();
  const { slug } = useParams();
  const collection = collectionBySlug(slug);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState(slug === 'new-arrivals' ? 'new' : 'featured');
  const [railOpen, setRailOpen] = useState(false);
  const [heroRef, progress] = useScrollProgress({ mode: 'exit' });

  const pool = useMemo(() => (collection ? inCollection(collection.slug) : []), [collection]);
  const results = useMemo(() => applyFilters(pool, filters, sort), [pool, filters, sort]);

  if (!collection) return <NotFound />;

  const others = COLLECTIONS.filter((c) => c.slug !== collection.slug).slice(0, 3);

  return (
    <div className="listing">
      <header className="colhero" ref={heroRef}>
        <div
          className="colhero__media"
          style={{ transform: `translate3d(0, ${progress * 14}%, 0) scale(${1.1 + progress * 0.1})` }}
        >
          <img
            src={src(collection.hero, 1800, 0.78)}
            srcSet={srcSet(collection.hero, 0.78, [900, 1400, 1800, 2400])}
            sizes="100vw"
            alt=""
            style={{ objectPosition: collection.focus }}
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <span className="colhero__scrim" aria-hidden="true" />

        <div className="shell colhero__body">
          <Crumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Collections', to: '/shop' },
              { label: collection.name },
            ]}
          />
          <Reveal as="p" className="eyebrow colhero__kicker">
            {collection.kicker}
          </Reveal>
          <RevealText as="h1" className="display d1 colhero__title" text={collection.name} delay={70} />
          <Reveal as="p" className="lead colhero__blurb" delay={180}>
            {collection.blurb}
          </Reveal>
        </div>
      </header>

      <div className="shell listing__body">
        <FilterRail
          pool={pool}
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          total={results.length}
          open={railOpen}
          setOpen={setRailOpen}
        />

        <div className="listing__main">
          <ActiveChips filters={filters} setFilters={setFilters} />
          {results.length > 0 ? (
            <ProductGrid products={results} cols={3} label={collection.name} />
          ) : (
            <EmptyState
              title="Nothing in this edit matches"
              blurb="Loosen a filter, or look through the whole house."
              action={
                <MagneticButton variant="line" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </MagneticButton>
              }
            />
          )}
        </div>
      </div>

      <section className="colnext section">
        <div className="shell">
          <p className="eyebrow colnext__label">Other edits</p>
          <div className="colnext__grid">
            {others.map((c, i) => (
              <Reveal key={c.slug} delay={i * 80}>
                <Link to={`/collection/${c.slug}`} className="tileS">
                  <span className="tileS__fig figure is-loaded" style={{ '--ratio': 1.2 }}>
                    <img src={src(c.hero, 760, 1.2)} alt="" loading="lazy" />
                  </span>
                  <span className="tileS__meta">
                    <em className="eyebrow">{c.kicker}</em>
                    <strong className="display d3">{c.name}</strong>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
