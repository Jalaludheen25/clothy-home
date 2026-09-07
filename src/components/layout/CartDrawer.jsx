import { Link } from 'react-router-dom';
import { formatINR } from '../../data/catalog.js';
import { src } from '../../data/images.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useEscape, useFocusTrap, useScrollLock } from '../../hooks/useMotion.js';
import { useLenisPaused } from '../../hooks/useLenis.jsx';
import { MagneticButton, Stepper, EmptyState } from '../ui/Primitives.jsx';

/* ==========================================================================
   Cart drawer
   ========================================================================== */

export default function CartDrawer() {
  const { cartOpen, setCartOpen, lines, totals, setQty, removeLine } = useStore();

  useScrollLock(cartOpen);
  useLenisPaused(cartOpen);
  useEscape(() => setCartOpen(false), cartOpen);
  const trapRef = useFocusTrap(cartOpen);

  const shippingPct = Math.min(100, (totals.subtotal / totals.freeShippingOver) * 100);

  return (
    <>
      <div
        className={`drawer__scrim ${cartOpen ? 'is-on' : ''}`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${cartOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        ref={trapRef}
        hidden={!cartOpen}
      >
        <header className="drawer__head">
          <div>
            <p className="eyebrow">Your bag</p>
            <h2 className="display d3">
              {totals.count} {totals.count === 1 ? 'piece' : 'pieces'}
            </h2>
          </div>
          <button type="button" className="drawer__close" onClick={() => setCartOpen(false)} aria-label="Close bag">
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </header>

        {lines.length > 0 ? (
          <>
            <div className="drawer__ship">
              <p className="drawer__ship-text">
                {totals.freeShippingGap > 0 ? (
                  <>
                    <span className="num">{formatINR(totals.freeShippingGap)}</span> more for complimentary
                    delivery
                  </>
                ) : (
                  'Complimentary delivery unlocked'
                )}
              </p>
              <span className="drawer__ship-track">
                <span className="drawer__ship-fill" style={{ width: `${shippingPct}%` }} />
              </span>
            </div>

            <ul className="drawer__lines">
              {lines.map((line) => (
                <li className="line" key={`${line.slug}-${line.size}`}>
                  <Link to={`/product/${line.slug}`} className="line__img" onClick={() => setCartOpen(false)}>
                    <img src={src(line.product.images[0], 220, 1.25)} alt="" loading="lazy" />
                  </Link>
                  <div className="line__body">
                    <div className="line__top">
                      <h3 className="line__name">
                        <Link to={`/product/${line.slug}`} onClick={() => setCartOpen(false)}>
                          {line.product.name}
                        </Link>
                      </h3>
                      <button
                        type="button"
                        className="line__remove"
                        onClick={() => removeLine(line.slug, line.size)}
                        aria-label={`Remove ${line.product.name}`}
                      >
                        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                          <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.1" />
                        </svg>
                      </button>
                    </div>
                    <p className="line__attrs muted">
                      {line.product.fabric}
                      {line.size ? ` · ${line.size}` : ''}
                    </p>
                    <div className="line__foot">
                      <Stepper
                        value={line.qty}
                        max={line.product.stock}
                        onChange={(q) => setQty(line.slug, line.size, q)}
                      />
                      <span className="line__price num">{formatINR(line.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="drawer__foot">
              <dl className="drawer__sums">
                <div>
                  <dt>Subtotal</dt>
                  <dd className="num">{formatINR(totals.subtotal)}</dd>
                </div>
                {totals.savings > 0 ? (
                  <div className="is-credit">
                    <dt>You save</dt>
                    <dd className="num">−{formatINR(totals.savings)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Delivery</dt>
                  <dd className="num">{totals.shipping === 0 ? 'Complimentary' : formatINR(totals.shipping)}</dd>
                </div>
              </dl>
              <p className="drawer__note muted">Duties and GST are calculated at checkout.</p>
              <MagneticButton to="/checkout" variant="solid" size="lg" className="drawer__cta" onClick={() => setCartOpen(false)}>
                Checkout — {formatINR(totals.subtotal)}
              </MagneticButton>
              <button type="button" className="drawer__link" onClick={() => setCartOpen(false)}>
                Continue browsing
              </button>
            </footer>
          </>
        ) : (
          <div className="drawer__empty">
            <EmptyState
              title="Nothing in the bag yet"
              blurb="Everything we make is one of a small run — worth taking a moment over."
              action={
                <MagneticButton to="/shop" variant="line" onClick={() => setCartOpen(false)}>
                  Browse the house
                </MagneticButton>
              }
            />
          </div>
        )}
      </aside>
    </>
  );
}
