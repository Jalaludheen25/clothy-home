import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/catalog.js';
import { ProductGrid } from '../components/product/ProductCard.jsx';
import {
  ActiveChips,
  EMPTY_FILTERS,
  FilterRail,
  applyFilters,
} from '../components/product/Filters.jsx';
import { Crumbs, EmptyState, MagneticButton, Reveal, RevealText } from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Shop — the full catalogue
   ========================================================================== */

const PAGE = 12;

export default function Shop() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    // /shop?only=offer arrives from the offers banner.
    only: params.get('only') ? [params.get('only')] : [],
  }));
  const [sort, setSort] = useState('featured');
  const [shown, setShown] = useState(PAGE);
  const [railOpen, setRailOpen] = useState(false);

  const results = useMemo(() => applyFilters(PRODUCTS, filters, sort), [filters, sort]);
  const page = results.slice(0, shown);

  const update = (next) => {
    setFilters(next);
    setShown(PAGE);
  };

  return (
    <div className="listing">
      <header className="listing__head">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
          <RevealText as="h1" className="display d1 listing__title" text="Everything we make" />
          <Reveal as="p" className="lead listing__blurb" delay={140}>
            Every saree, kurta set and cut of cloth we make, in runs small enough that we know
            roughly where each one went.
          </Reveal>
        </div>
      </header>

      <div className="shell listing__body">
        <FilterRail
          pool={PRODUCTS}
          filters={filters}
          setFilters={update}
          sort={sort}
          setSort={setSort}
          total={results.length}
          open={railOpen}
          setOpen={setRailOpen}
        />

        <div className="listing__main">
          <ActiveChips filters={filters} setFilters={update} />

          {page.length > 0 ? (
            <>
              <ProductGrid products={page} cols={3} label="All pieces" />
              {shown < results.length ? (
                <div className="listing__more">
                  <MagneticButton variant="line" size="lg" onClick={() => setShown((s) => s + PAGE)}>
                    Load {Math.min(PAGE, results.length - shown)} more
                  </MagneticButton>
                  <p className="listing__count muted num">
                    Showing {page.length} of {results.length}
                  </p>
                </div>
              ) : (
                <p className="listing__end serif-italic">That is all of it.</p>
              )}
            </>
          ) : (
            <EmptyState
              title="Nothing matches that combination"
              blurb="Try loosening one of the filters — fabric and occasion together can be a narrow room."
              action={
                <MagneticButton variant="line" onClick={() => update(EMPTY_FILTERS)}>
                  Clear filters
                </MagneticButton>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
