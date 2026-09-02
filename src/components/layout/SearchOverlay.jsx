import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, formatINR } from '../../data/catalog.js';
import { src } from '../../data/images.js';
import { searchProducts, useStore } from '../../context/StoreContext.jsx';
import { useDebounced, useEscape, useScrollLock } from '../../hooks/useMotion.js';
import { useLenisPaused } from '../../hooks/useLenis.jsx';

/* ==========================================================================
   Search overlay
   --------------------------------------------------------------------------
   Full-bleed, keyboard-first. Arrow keys walk the results and Enter opens the
   highlighted one, so the whole thing works without touching the mouse.
   ========================================================================== */

const SUGGESTIONS = ['Kanjivaram', 'Chikankari', 'Jhumka', 'Pearl', 'Bridal', 'Under ₹10,000'];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounced(query, 140);

  useScrollLock(searchOpen);
  useLenisPaused(searchOpen);
  useEscape(() => setSearchOpen(false), searchOpen);

  const results = useMemo(() => searchProducts(debounced, 8), [debounced]);

  useEffect(() => {
    if (searchOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 260);
      return () => window.clearTimeout(t);
    }
    setQuery('');
    setCursor(0);
    return undefined;
  }, [searchOpen]);

  useEffect(() => setCursor(0), [debounced]);

  const go = (slug) => {
    setSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const onKeyDown = (e) => {
    if (!results.length) {
      if (e.key === 'Enter' && query.trim().length > 1) {
        setSearchOpen(false);
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[cursor].slug);
    }
  };

  return (
    <div
      className={`search ${searchOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      hidden={!searchOpen}
    >
      <button type="button" className="search__scrim" onClick={() => setSearchOpen(false)} aria-label="Close search" />

      <div className="search__panel">
        <div className="search__bar shell">
          <svg viewBox="0 0 19 19" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
            <circle cx="8.2" cy="8.2" r="6.2" />
            <path d="M13 13l4 4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder="Search sarees, jhumkas, chikankari…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search products"
            autoComplete="off"
          />
          <button type="button" className="search__close" onClick={() => setSearchOpen(false)}>
            Close
            <kbd>Esc</kbd>
          </button>
        </div>

        <div className="search__body shell">
          {query.trim().length < 2 ? (
            <div className="search__idle">
              <div className="search__suggest">
                <p className="eyebrow">Try</p>
                <ul>
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => setQuery(s.replace('Under ₹10,000', 'everyday'))}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="search__cats">
                <p className="eyebrow">Browse</p>
                <ul>
                  {CATEGORIES.map((c) => (
                    <li key={c.slug}>
                      <Link to={`/category/${c.slug}`} onClick={() => setSearchOpen(false)} className="search__cat">
                        <img src={src(c.hero, 160, 1.15)} alt="" loading="lazy" />
                        <span>{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="search__results">
                {results.map((p, i) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      className={`search__hit ${i === cursor ? 'is-cursor' : ''}`}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(p.slug)}
                    >
                      <img src={src(p.images[0], 160, 1.2)} alt="" loading="lazy" />
                      <span className="search__hit-body">
                        <span className="search__hit-name">{p.name}</span>
                        <span className="search__hit-sub muted">
                          {p.fabric || p.metal} · {p.colour}
                        </span>
                      </span>
                      <span className="search__hit-price num">{formatINR(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                to={`/search?q=${encodeURIComponent(query.trim())}`}
                className="search__all"
                onClick={() => setSearchOpen(false)}
              >
                See all results for “{query.trim()}”
              </Link>
            </>
          ) : (
            <div className="search__none">
              <p className="display d3">Nothing matched “{query.trim()}”.</p>
              <p className="lead">
                Try a weave — Kanjivaram, Chanderi, Tussar — or a piece, like jhumka or kada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
