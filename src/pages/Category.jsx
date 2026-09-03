import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES, categoryBySlug, inCategory } from '../data/catalog.js';
import { src, srcSet } from '../data/images.js';
import { useParallax, useScrollProgress } from '../hooks/useMotion.js';
import { ProductGrid } from '../components/product/ProductCard.jsx';
import {
  ActiveChips,
  EMPTY_FILTERS,
  FilterRail,
  applyFilters,
} from '../components/product/Filters.jsx';
import {
  Crumbs,
  EmptyState,
  Figure,
  MagneticButton,
  Reveal,
  RevealText,
} from '../components/ui/Primitives.jsx';
import { useDarkHeader } from '../hooks/useHeaderTone.js';
import NotFound from './NotFound.jsx';

/* ==========================================================================
   Category
   ========================================================================== */

const PAGE = 12;

export default function Category() {
  useDarkHeader();
  const { slug } = useParams();
  const category = categoryBySlug(slug);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('featured');
  const [shown, setShown] = useState(PAGE);
  const [railOpen, setRailOpen] = useState(false);

  const [heroRef, progress] = useScrollProgress({ mode: 'exit' });
  const plateRef = useParallax(0.1);

  const pool = useMemo(() => (category ? inCategory(category.slug) : []), [category]);
  const results = useMemo(() => applyFilters(pool, filters, sort), [pool, filters, sort]);

  if (!category) return <NotFound />;

  const page = results.slice(0, shown);
  const siblings = CATEGORIES.filter((c) => c.slug !== category.slug);

  const update = (next) => {
    setFilters(next);
    setShown(PAGE);
  };

  return (
    <div className="listing listing--cat">
      <header className="cathero" ref={heroRef}>
        <div className="cathero__media">
          <div className="cathero__img" style={{ transform: `translate3d(0, ${progress * 12}%, 0) scale(${1.08 + progress * 0.08})` }}>
            <img
              src={src(category.hero, 1800, 0.72)}
              srcSet={srcSet(category.hero, 0.72, [900, 1400, 1800, 2400])}
              sizes="100vw"
              alt=""
              style={{ objectPosition: category.heroFocus }}
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>
          <span className="cathero__scrim" aria-hidden="true" />
        </div>

        <div className="shell cathero__body">
          <Crumbs
            items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: category.name }]}
          />
          <RevealText as="h1" className="display d1 cathero__title" text={category.name} />
          <Reveal as="p" className="serif-italic cathero__tag" delay={130}>
            {category.tagline}
          </Reveal>
        </div>
      </header>

      <section className="catintro section-tight">
        <div className="shell catintro__grid">
          <Reveal as="p" className="lead catintro__blurb">
            {category.blurb}
          </Reveal>
          <div className="catintro__plate" ref={plateRef}>
            <Figure
              image={category.plate}
              alt=""
              ratio={0.78}
              width={900}
              sizes="(max-width: 900px) 90vw, 34vw"
            />
          </div>
        </div>
      </section>

      <div className="shell listing__body">
        <FilterRail
          pool={pool}
          filters={filters}
          setFilters={update}
          sort={sort}
          setSort={setSort}
          total={results.length}
          showCategory={false}
          open={railOpen}
          setOpen={setRailOpen}
        />

        <div className="listing__main">
          <ActiveChips filters={filters} setFilters={update} />

          {page.length > 0 ? (
            <>
              <ProductGrid products={page} cols={3} label={`${category.name} — ${results.length} pieces`} />
              {shown < results.length ? (
                <div className="listing__more">
                  <MagneticButton variant="line" size="lg" onClick={() => setShown((s) => s + PAGE)}>
                    Load {Math.min(PAGE, results.length - shown)} more
                  </MagneticButton>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              title="Nothing here with those filters"
              blurb="Clear one and the room opens up again."
              action={
                <MagneticButton variant="line" onClick={() => update(EMPTY_FILTERS)}>
                  Clear filters
                </MagneticButton>
              }
            />
          )}
        </div>
      </div>

      <section className="catnext section">
        <div className="shell">
          <p className="eyebrow catnext__label">Keep going</p>
          <ul className="catnext__list">
            {siblings.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="catnext__link">
                  <span className="catnext__name display d2">{c.name}</span>
                  <span className="catnext__thumb">
                    <img src={src(c.hero, 320, 1.15)} alt="" loading="lazy" />
                  </span>
                  <span className="catnext__arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 12" width="24" height="12">
                      <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
