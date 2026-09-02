import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatINR } from '../data/catalog.js';
import { src } from '../data/images.js';
import { useStore } from '../context/StoreContext.jsx';
import { ProductRail } from '../components/product/ProductCard.jsx';
import {
  Crumbs,
  EmptyState,
  MagneticButton,
  Reveal,
  RevealText,
  SectionHead,
  Stepper,
} from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Cart — the full page view
   ========================================================================== */

export default function Cart() {
  const { lines, totals, setQty, removeLine, toggleWishlist, isSaved, promo, applyPromo, clearPromo } =
    useStore();
  const [code, setCode] = useState('');

  const suggestions = PRODUCTS.filter(
    (p) => p.isBestSeller && !lines.some((l) => l.slug === p.slug),
  ).slice(0, 8);

  if (!lines.length) {
    return (
      <div className="listing">
        <header className="listing__head listing__head--plain">
          <div className="shell">
            <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
            <RevealText as="h1" className="display d1 listing__title" text="Your bag" />
          </div>
        </header>
        <div className="shell">
          <EmptyState
            title="The bag is empty"
            blurb="Nothing chosen yet. The new arrivals are a reasonable place to begin."
            action={
              <MagneticButton to="/collection/new-arrivals" variant="line">
                See new arrivals
              </MagneticButton>
            }
          />
        </div>
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow="Most asked for" title="Best sellers" />
            <ProductRail products={suggestions} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="listing">
      <header className="listing__head listing__head--plain">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
          <RevealText as="h1" className="display d1 listing__title" text="Your bag" />
          <Reveal as="p" className="lead listing__blurb" delay={130}>
            {totals.count} {totals.count === 1 ? 'piece' : 'pieces'}, held for you on this device.
          </Reveal>
        </div>
      </header>

      <div className="shell cartpage">
        <div className="cartpage__lines">
          {lines.map((line) => (
            <article className="cline" key={`${line.slug}-${line.size}`}>
              <Link to={`/product/${line.slug}`} className="cline__img">
                <img src={src(line.product.images[0], 340, 1.25)} alt="" loading="lazy" />
              </Link>

              <div className="cline__body">
                <div className="cline__head">
                  <div>
                    <h2 className="cline__name">
                      <Link to={`/product/${line.slug}`}>{line.product.name}</Link>
                    </h2>
                    <p className="cline__attrs muted">
                      {line.product.fabric || line.product.metal}
                      {line.size ? ` · ${line.size}` : ''} · {line.product.colour}
                    </p>
                  </div>
                  <p className="cline__price num">{formatINR(line.lineTotal)}</p>
                </div>

                <p className="cline__ship muted">
                  Dispatches in {line.product.days} days
                  {line.product.stock <= 3 ? ` · only ${line.product.stock} left` : ''}
                </p>

                <div className="cline__foot">
                  <Stepper
                    value={line.qty}
                    max={line.product.stock}
                    onChange={(q) => setQty(line.slug, line.size, q)}
                  />
                  <div className="cline__acts">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(line.product)}
                      className={isSaved(line.slug) ? 'is-on' : ''}
                    >
                      {isSaved(line.slug) ? 'Saved' : 'Save for later'}
                    </button>
                    <button type="button" onClick={() => removeLine(line.slug, line.size)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="cartpage__summary">
          <div className="summary">
            <h2 className="summary__title display d3">Summary</h2>

            <form
              className="summary__promo"
              onSubmit={(e) => {
                e.preventDefault();
                if (applyPromo(code)) setCode('');
              }}
            >
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Promotion code"
                aria-label="Promotion code"
              />
              <button type="submit">Apply</button>
            </form>
            {promo ? (
              <p className="summary__promo-on">
                <span>
                  {promo.code} — {promo.label}
                </span>
                <button type="button" onClick={clearPromo} aria-label="Remove promotion">
                  Remove
                </button>
              </p>
            ) : (
              <p className="summary__hint muted">Try ATELIER10 or FIRSTDRAPE.</p>
            )}

            <dl className="summary__sums">
              <div>
                <dt>Subtotal</dt>
                <dd className="num">{formatINR(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 ? (
                <div className="is-credit">
                  <dt>Promotion</dt>
                  <dd className="num">−{formatINR(totals.discount)}</dd>
                </div>
              ) : null}
              <div>
                <dt>Delivery</dt>
                <dd className="num">
                  {totals.shipping === 0 ? 'Complimentary' : formatINR(totals.shipping)}
                </dd>
              </div>
              <div>
                <dt>GST (5%)</dt>
                <dd className="num">{formatINR(totals.tax)}</dd>
              </div>
              <div className="summary__total">
                <dt>Total</dt>
                <dd className="num">{formatINR(totals.total)}</dd>
              </div>
            </dl>

            {totals.savings > 0 ? (
              <p className="summary__saved">
                You are saving <span className="num">{formatINR(totals.savings)}</span> on archive
                pricing.
              </p>
            ) : null}

            <MagneticButton to="/checkout" variant="solid" size="lg" className="summary__cta">
              Checkout
            </MagneticButton>
            <Link to="/shop" className="summary__back">
              Continue browsing
            </Link>

            <ul className="summary__trust">
              <li>Insured delivery across India</li>
              <li>Thirty-day returns on unworn pieces</li>
              <li>Secure payment — cards, UPI, net banking</li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Often bought together" title="Add to the order" />
          <ProductRail products={suggestions} />
        </div>
      </section>
    </div>
  );
}
