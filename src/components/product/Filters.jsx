import { useEffect, useMemo, useState } from 'react';
import {
  CATEGORIES,
  COLOURS,
  FABRICS,
  OCCASIONS,
  PRICE_BANDS,
  SORTS,
} from '../../data/catalog.js';
import { useEscape, useMediaQuery, useScrollLock } from '../../hooks/useMotion.js';

/* ==========================================================================
   Filtering + sorting
   --------------------------------------------------------------------------
   The filter state lives here as a plain object of arrays, and `applyFilters`
   is exported so every listing page filters identically.
   ========================================================================== */

export const EMPTY_FILTERS = {
  category: [],
  colour: [],
  fabric: [],
  occasion: [],
  price: [],
  only: [], // 'new' | 'offer' | 'stock'
};

export function applyFilters(products, filters, sort = 'featured') {
  const out = products.filter((p) => {
    if (filters.category.length && !filters.category.includes(p.category)) return false;
    if (filters.colour.length && !filters.colour.includes(p.colourFamily)) return false;
    if (filters.fabric.length && !filters.fabric.includes(p.fabric)) return false;
    if (filters.occasion.length && !(p.occasion || []).some((o) => filters.occasion.includes(o)))
      return false;
    if (filters.price.length) {
      const bands = PRICE_BANDS.filter((b) => filters.price.includes(b.id));
      if (!bands.some((b) => b.test(p))) return false;
    }
    if (filters.only.includes('new') && !p.isNew) return false;
    if (filters.only.includes('offer') && !p.onOffer) return false;
    if (filters.only.includes('stock') && !p.inStock) return false;
    return true;
  });

  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return out.sort((a, b) => b.price - a.price);
    case 'new':
      return out.sort((a, b) => b.addedAt - a.addedAt);
    case 'rating':
      return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    default:
      // Featured: best sellers first, then rating, then price as a tiebreak.
      return out.sort(
        (a, b) =>
          Number(b.isBestSeller) - Number(a.isBestSeller) ||
          b.rating - a.rating ||
          b.reviews - a.reviews,
      );
  }
}

export const countActive = (filters) =>
  Object.values(filters).reduce((n, list) => n + list.length, 0);

function Group({ title, options, selected, onToggle, columns = false }) {
  const [open, setOpen] = useState(true);
  if (!options.length) return null;

  return (
    <div className={`fgroup ${open ? 'is-open' : ''}`}>
      <button type="button" className="fgroup__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="eyebrow">{title}</span>
        <span className="fgroup__sign" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <div className="fgroup__body" hidden={!open}>
        <ul className={columns ? 'fgroup__list fgroup__list--cols' : 'fgroup__list'}>
          {options.map((opt) => {
            const on = selected.includes(opt.value);
            return (
              <li key={opt.value}>
                <label className={`check ${on ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => onToggle(opt.value)} />
                  <span className="check__box" aria-hidden="true">
                    <svg viewBox="0 0 10 8" width="9" height="7">
                      <path d="M1 4l2.6 2.6L9 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                  {opt.swatch ? (
                    <span
                      className="check__swatch"
                      style={{ background: opt.swatch }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="check__label">{opt.label}</span>
                  {opt.count != null ? <span className="check__count num">{opt.count}</span> : null}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * @param {object[]} pool   products before filtering, used for facet counts
 * @param {boolean}  showCategory  hidden on category pages, where it is implied
 */
export function FilterRail({
  pool,
  filters,
  setFilters,
  sort,
  setSort,
  total,
  showCategory = true,
  open,
  setOpen,
}) {
  const isDesktop = useMediaQuery('(min-width: 1000px)');
  useScrollLock(open && !isDesktop);
  useEscape(() => setOpen(false), open && !isDesktop);

  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop, setOpen]);

  const toggle = (key) => (value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  /* Facet counts reflect the pool the page started from, so a visitor can see
     what a filter would give them before committing to it. */
  const counts = useMemo(() => {
    const tally = (fn) => {
      const map = new Map();
      pool.forEach((p) => {
        const keys = fn(p);
        (Array.isArray(keys) ? keys : [keys]).filter(Boolean).forEach((k) => {
          map.set(k, (map.get(k) || 0) + 1);
        });
      });
      return map;
    };
    return {
      category: tally((p) => p.category),
      colour: tally((p) => p.colourFamily),
      fabric: tally((p) => p.fabric),
      occasion: tally((p) => p.occasion),
      price: new Map(PRICE_BANDS.map((b) => [b.id, pool.filter(b.test).length])),
    };
  }, [pool]);

  const opt = (values, map, labeller = (v) => v) =>
    values
      .filter((v) => (map.get(v) || 0) > 0)
      .map((v) => ({ value: v, label: labeller(v), count: map.get(v) }));

  const active = countActive(filters);

  return (
    <>
      <div className={`frail__scrim ${open ? 'is-on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`frail ${open ? 'is-open' : ''}`} aria-label="Filters">
        <div className="frail__head">
          <p className="eyebrow">Refine</p>
          <button type="button" className="frail__close" onClick={() => setOpen(false)} aria-label="Close filters">
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
              <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <div className="frail__body">
          <Group
            title="Show only"
            options={[
              { value: 'new', label: 'New arrivals', count: pool.filter((p) => p.isNew).length },
              { value: 'offer', label: 'On offer', count: pool.filter((p) => p.onOffer).length },
              { value: 'stock', label: 'In stock', count: pool.filter((p) => p.inStock).length },
            ]}
            selected={filters.only}
            onToggle={toggle('only')}
          />

          {showCategory ? (
            <Group
              title="Category"
              options={opt(
                CATEGORIES.map((c) => c.slug),
                counts.category,
                (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug,
              )}
              selected={filters.category}
              onToggle={toggle('category')}
            />
          ) : null}

          <Group
            title="Price"
            options={PRICE_BANDS.filter((b) => counts.price.get(b.id) > 0).map((b) => ({
              value: b.id,
              label: b.label,
              count: counts.price.get(b.id),
            }))}
            selected={filters.price}
            onToggle={toggle('price')}
          />

          <Group
            title="Colour"
            options={COLOURS.filter((c) => (counts.colour.get(c.name) || 0) > 0).map((c) => ({
              value: c.name,
              label: c.name,
              swatch: c.swatch,
              count: counts.colour.get(c.name),
            }))}
            selected={filters.colour}
            onToggle={toggle('colour')}
          />

          <Group
            title="Fabric"
            options={opt(FABRICS, counts.fabric)}
            selected={filters.fabric}
            onToggle={toggle('fabric')}
          />

          <Group
            title="Occasion"
            options={opt(OCCASIONS, counts.occasion)}
            selected={filters.occasion}
            onToggle={toggle('occasion')}
          />
        </div>

        <div className="frail__foot">
          <button
            type="button"
            className="frail__clear"
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={!active}
          >
            Clear {active > 0 ? `(${active})` : ''}
          </button>
          <button type="button" className="frail__apply" onClick={() => setOpen(false)}>
            Show {total} {total === 1 ? 'piece' : 'pieces'}
          </button>
        </div>
      </aside>

      {/* Sort lives outside the rail so it stays reachable on mobile. */}
      <div className="sortbar">
        <button type="button" className="sortbar__filters" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 16 12" width="15" height="11" aria-hidden="true">
            <path d="M0 1.5h16M3 6h10M6 10.5h4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Filters
          {active > 0 ? <span className="sortbar__count num">{active}</span> : null}
        </button>
        <p className="sortbar__total muted num">
          {total} {total === 1 ? 'piece' : 'pieces'}
        </p>
        <label className="sortbar__sort">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </label>
      </div>
    </>
  );
}

/** Removable chips summarising what is currently on. */
export function ActiveChips({ filters, setFilters }) {
  const chips = [];
  const push = (key, value, label) => chips.push({ key, value, label });

  filters.category.forEach((v) =>
    push('category', v, CATEGORIES.find((c) => c.slug === v)?.name ?? v),
  );
  filters.price.forEach((v) => push('price', v, PRICE_BANDS.find((b) => b.id === v)?.label ?? v));
  filters.colour.forEach((v) => push('colour', v, v));
  filters.fabric.forEach((v) => push('fabric', v, v));
  filters.occasion.forEach((v) => push('occasion', v, v));
  filters.only.forEach((v) =>
    push('only', v, { new: 'New arrivals', offer: 'On offer', stock: 'In stock' }[v]),
  );

  if (!chips.length) return null;

  return (
    <div className="chips">
      {chips.map((c) => (
        <button
          type="button"
          className="chip"
          key={`${c.key}-${c.value}`}
          onClick={() =>
            setFilters((f) => ({ ...f, [c.key]: f[c.key].filter((v) => v !== c.value) }))
          }
        >
          {c.label}
          <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      ))}
      <button type="button" className="chip chip--clear" onClick={() => setFilters(EMPTY_FILTERS)}>
        Clear all
      </button>
    </div>
  );
}
