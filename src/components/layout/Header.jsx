import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CATEGORIES, COLLECTIONS } from '../../data/catalog.js';
import { src } from '../../data/images.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useEscape, useScrollLock } from '../../hooks/useMotion.js';
import { useLenis } from '../../hooks/useLenis.jsx';
import { Logo } from '../ui/Logo.jsx';

/* ==========================================================================
   Header
   --------------------------------------------------------------------------
   Transparent over a hero, solid once the page moves, and hidden on the way
   down / shown on the way back up so the reading area stays clear. The
   desktop mega-panel and the mobile sheet render from the same taxonomy.
   ========================================================================== */

const GROUPS = ['Cloth', 'Adornment'];

function Glyph({ name }) {
  const paths = {
    search: <path d="M8.2 14.4a6.2 6.2 0 1 0 0-12.4 6.2 6.2 0 0 0 0 12.4ZM13 13l4 4" />,
    heart: (
      <path d="M9.5 16 2.9 9.6A4 4 0 0 1 9.5 4.6a4 4 0 0 1 6.6 5L9.5 16Z" />
    ),
    user: <path d="M3.5 17c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2M9.5 9.4a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />,
    bag: <path d="M4 6h11l1 11H3L4 6ZM7 6V4.7a2.5 2.5 0 0 1 5 0V6" />,
  };
  return (
    <svg viewBox="0 0 19 19" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function Wordmark({ compact = false, tone = 'dark' }) {
  return (
    <Link to="/" className={`wordmark ${compact ? 'is-compact' : ''}`} aria-label="Clothy Home, home">
      <Logo tone={tone} alt="" />
      <span className="sr-only">Clothy Home</span>
    </Link>
  );
}

export default function Header() {
  const { totals, wishlist, user, setCartOpen, setSearchOpen } = useStore();
  const location = useLocation();
  const lenis = useLenis();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState(null); // 'shop' | 'collections' | null
  const [sheet, setSheet] = useState(false);
  const lastY = useRef(0);
  const closeTimer = useRef(0);

  useScrollLock(sheet);
  useEscape(() => {
    setPanel(null);
    setSheet(false);
  }, Boolean(panel) || sheet);

  /* Close every surface on navigation. */
  useEffect(() => {
    setPanel(null);
    setSheet(false);
  }, [location.pathname]);

  useEffect(() => {
    const read = (y) => {
      setScrolled(y > 12);
      setHidden(y > 320 && y > lastY.current + 4);
      lastY.current = y;
    };
    if (lenis) {
      const on = ({ scroll }) => read(scroll);
      lenis.on('scroll', on);
      return () => lenis.off('scroll', on);
    }
    const on = () => read(window.scrollY);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [lenis]);

  /* A short grace period stops the panel flickering as the pointer crosses
     the gap between the trigger and the panel itself. */
  const openPanel = (id) => {
    window.clearTimeout(closeTimer.current);
    setPanel(id);
  };
  const closePanel = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPanel(null), 140);
  };

  const cloth = CATEGORIES.filter((c) => c.group === 'Cloth');
  const adorn = CATEGORIES.filter((c) => c.group === 'Adornment');

  return (
    <>
      <header
        className={`header ${scrolled ? 'is-scrolled' : ''} ${hidden && !panel ? 'is-hidden' : ''} ${
          panel ? 'is-open' : ''
        }`}
        onMouseLeave={closePanel}
      >
        <div className="header__bar">
          <div className="header__cluster header__cluster--start">
            <button
              type="button"
              className="header__burger"
              onClick={() => setSheet(true)}
              aria-label="Open menu"
            >
              <i />
              <i />
            </button>
            <nav className="header__nav" aria-label="Primary">
              <button
                type="button"
                className={`header__link ${panel === 'shop' ? 'is-active' : ''}`}
                onMouseEnter={() => openPanel('shop')}
                onFocus={() => openPanel('shop')}
                onClick={() => setPanel((p) => (p === 'shop' ? null : 'shop'))}
                aria-expanded={panel === 'shop'}
              >
                Shop
              </button>
              <button
                type="button"
                className={`header__link ${panel === 'collections' ? 'is-active' : ''}`}
                onMouseEnter={() => openPanel('collections')}
                onFocus={() => openPanel('collections')}
                onClick={() => setPanel((p) => (p === 'collections' ? null : 'collections'))}
                aria-expanded={panel === 'collections'}
              >
                Collections
              </button>
              <NavLink to="/atelier" className="header__link" onMouseEnter={closePanel}>
                Atelier
              </NavLink>
            </nav>
          </div>

          <div className="header__cluster header__cluster--centre" onMouseEnter={closePanel}>
            <Wordmark compact={scrolled} tone="auto" />
          </div>

          <div className="header__cluster header__cluster--end" onMouseEnter={closePanel}>
            <button type="button" className="header__icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Glyph name="search" />
              <span className="header__icon-label">Search</span>
            </button>
            <Link to="/wishlist" className="header__icon" aria-label={`Saved, ${wishlist.length} items`}>
              <Glyph name="heart" />
              {wishlist.length > 0 ? <span className="header__count num">{wishlist.length}</span> : null}
            </Link>
            <Link to="/account" className="header__icon header__icon--user" aria-label="Account">
              <Glyph name="user" />
              <span className="header__icon-label">{user ? user.name.split(' ')[0] : 'Account'}</span>
            </Link>
            <button
              type="button"
              className="header__icon header__icon--bag"
              onClick={() => setCartOpen(true)}
              aria-label={`Bag, ${totals.count} items`}
            >
              <Glyph name="bag" />
              {totals.count > 0 ? <span className="header__count num">{totals.count}</span> : null}
            </button>
          </div>
        </div>

        {/* --- desktop mega panel --- */}
        <div className={`mega ${panel ? 'is-open' : ''}`} onMouseEnter={() => window.clearTimeout(closeTimer.current)}>
          <div className="mega__inner">
            {panel === 'shop' ? (
              <>
                <div className="mega__cols">
                  {GROUPS.map((group) => (
                    <div className="mega__col" key={group}>
                      <p className="eyebrow">{group}</p>
                      <ul>
                        {(group === 'Cloth' ? cloth : adorn).map((c) => (
                          <li key={c.slug}>
                            <Link to={`/category/${c.slug}`} className="mega__link">
                              <span>{c.name}</span>
                              <em className="serif-italic">{c.tagline}</em>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="mega__col">
                    <p className="eyebrow">Browse</p>
                    <ul>
                      <li>
                        <Link to="/shop" className="mega__link">
                          <span>All pieces</span>
                          <em className="serif-italic">The full range</em>
                        </Link>
                      </li>
                      <li>
                        <Link to="/collection/new-arrivals" className="mega__link">
                          <span>New arrivals</span>
                          <em className="serif-italic">Just off the loom</em>
                        </Link>
                      </li>
                      <li>
                        <Link to="/collection/archive-sale" className="mega__link">
                          <span>Offers</span>
                          <em className="serif-italic">Up to 30% off</em>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mega__feature">
                  <Link to="/collection/bridal" className="mega__card">
                    <img src={src(COLLECTIONS[4].hero, 640, 1.15)} alt="" loading="lazy" />
                    <span className="mega__card-meta">
                      <em className="eyebrow">Featured</em>
                      <strong className="display d3">Bridal &amp; Ceremony</strong>
                    </span>
                  </Link>
                </div>
              </>
            ) : null}

            {panel === 'collections' ? (
              <div className="mega__collections">
                {COLLECTIONS.map((c) => (
                  <Link to={`/collection/${c.slug}`} className="mega__tile" key={c.slug}>
                    <span className="mega__tile-img">
                      <img src={src(c.hero, 420, 1.2)} alt="" loading="lazy" />
                    </span>
                    <span className="mega__tile-meta">
                      <em className="eyebrow">{c.kicker}</em>
                      <strong className="display d3">{c.name}</strong>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className={`header__scrim ${panel ? 'is-on' : ''}`} onClick={() => setPanel(null)} aria-hidden="true" />

      {/* --- mobile sheet --- */}
      <div className={`sheet ${sheet ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!sheet}>
        <div className="sheet__top">
          <Wordmark />
          <button type="button" className="sheet__close" onClick={() => setSheet(false)} aria-label="Close menu">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        <div className="sheet__body">
          <button
            type="button"
            className="sheet__search"
            onClick={() => {
              setSheet(false);
              setSearchOpen(true);
            }}
          >
            <Glyph name="search" />
            Search the house
          </button>

          {GROUPS.map((group) => (
            <section className="sheet__group" key={group}>
              <p className="eyebrow">{group}</p>
              <ul>
                {CATEGORIES.filter((c) => c.group === group).map((c) => (
                  <li key={c.slug}>
                    <Link to={`/category/${c.slug}`} className="sheet__link display d3">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="sheet__group">
            <p className="eyebrow">Collections</p>
            <ul>
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <Link to={`/collection/${c.slug}`} className="sheet__link display d3">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="sheet__group sheet__group--minor">
            <ul>
              <li>
                <Link to="/shop">All pieces</Link>
              </li>
              <li>
                <Link to="/atelier">The atelier</Link>
              </li>
              <li>
                <Link to="/wishlist">Saved ({wishlist.length})</Link>
              </li>
              <li>
                <Link to="/account">{user ? 'Your account' : 'Sign in'}</Link>
              </li>
              <li>
                <Link to="/track">Track an order</Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <div className={`sheet__scrim ${sheet ? 'is-on' : ''}`} onClick={() => setSheet(false)} aria-hidden="true" />
    </>
  );
}
