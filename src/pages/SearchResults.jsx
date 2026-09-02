import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../context/StoreContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { ProductGrid } from '../components/product/ProductCard.jsx';
import {
  ActiveChips,
  EMPTY_FILTERS,
  FilterRail,
  applyFilters,
} from '../components/product/Filters.jsx';
import { Crumbs, EmptyState, MagneticButton, Reveal, RevealText } from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Search results
   ========================================================================== */

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const { setSearchOpen } = useStore();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('featured');
  const [railOpen, setRailOpen] = useState(false);

  const pool = useMemo(() => searchProducts(query, 200), [query]);
  const results = useMemo(() => applyFilters(pool, filters, sort), [pool, filters, sort]);

  return (
    <div className="listing">
      <header className="listing__head listing__head--plain">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
          <RevealText as="h1" className="display d1 listing__title" text="Search" />
          <Reveal as="form" className="searchpage__form" delay={120} onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              value={query}
              placeholder="Search sarees, jhumkas, chikankari…"
              onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
              aria-label="Search products"
            />
          </Reveal>
          {query ? (
            <Reveal as="p" className="lead listing__blurb" delay={180}>
              {pool.length} {pool.length === 1 ? 'piece' : 'pieces'} for “{query}”
            </Reveal>
          ) : null}
        </div>
      </header>

      {pool.length > 0 ? (
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
              <ProductGrid products={results} cols={3} />
            ) : (
              <EmptyState
                title="Filters narrowed it to nothing"
                action={
                  <MagneticButton variant="line" onClick={() => setFilters(EMPTY_FILTERS)}>
                    Clear filters
                  </MagneticButton>
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="shell">
          <EmptyState
            title={query ? `Nothing matched “${query}”` : 'What are you looking for?'}
            blurb="Try a weave — Kanjivaram, Chanderi, Tussar, chikankari — or a piece, like jhumka, kada or choker."
            action={
              <MagneticButton variant="line" onClick={() => setSearchOpen(true)}>
                Open search
              </MagneticButton>
            }
          />
        </div>
      )}
    </div>
  );
}
