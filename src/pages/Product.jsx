import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  bySlug,
  categoryBySlug,
  formatINR,
  relatedTo,
} from '../data/catalog.js';
import { useStore } from '../context/StoreContext.jsx';
import { useParallax } from '../hooks/useMotion.js';
import Gallery from '../components/product/Gallery.jsx';
import { ProductRail } from '../components/product/ProductCard.jsx';
import {
  Accordion,
  Crumbs,
  Figure,
  MagneticButton,
  Reveal,
  RevealText,
  SectionHead,
  Stars,
  Stepper,
  Tag,
} from '../components/ui/Primitives.jsx';
import NotFound from './NotFound.jsx';

/* ==========================================================================
   Product detail
   ========================================================================== */

function deliveryWindow(days) {
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const now = Date.now();
  return `${fmt(new Date(now + days * 86400000))} – ${fmt(new Date(now + (days + 4) * 86400000))}`;
}

function Marks({ product }) {
  const rows = [
    product.origin && { label: 'Made in', value: product.origin },
    product.weaver && { label: 'Technique', value: product.weaver },
    product.fabric && { label: 'Fabric', value: product.fabric },
    product.metal && { label: 'Metal', value: product.metal },
    product.pieces && { label: 'Includes', value: product.pieces },
    product.dims && { label: 'Dimensions', value: product.dims },
    { label: 'Colourway', value: product.colour },
    { label: 'Reference', value: product.id },
  ].filter(Boolean);

  return (
    <dl className="marks">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = bySlug(slug);

  const { addToCart, toggleWishlist, isSaved, pushViewed, viewedItems } = useStore();
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const swatchRef = useParallax(0.07);

  useEffect(() => {
    if (product) {
      pushViewed(product.slug);
      setSize(product.sizes && product.sizes.length === 1 ? product.sizes[0] : null);
      setQty(1);
      setSizeError(false);
    }
  }, [product, pushViewed]);

  const related = useMemo(() => relatedTo(product, 8), [product]);
  const alsoViewed = viewedItems.filter((p) => p.slug !== slug).slice(0, 6);

  if (!product) return <NotFound />;

  const category = categoryBySlug(product.category);
  const saved = isSaved(product.slug);
  const needsSize = Boolean(product.sizes && product.sizes.length > 1);

  const commit = (thenGo) => {
    if (needsSize && !size) {
      setSizeError(true);
      document.getElementById('size-picker')?.scrollIntoView({ block: 'center' });
      return;
    }
    addToCart(product, { size, qty, open: !thenGo });
    if (thenGo) navigate('/checkout');
  };

  return (
    <article className="pdp">
      <div className="shell pdp__crumbs">
        <Crumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: category.name, to: `/category/${category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="pdp__main">
        <div className="pdp__gallery">
          <Gallery images={product.images} alt={product.name} tone={product.swatch} />
        </div>

        <div className="pdp__panel">
          <div className="pdp__sticky">
            <div className="pdp__badges">
              {product.isNew ? <Tag>New</Tag> : null}
              {product.isBestSeller ? <Tag>Best seller</Tag> : null}
              {product.onOffer ? <Tag tone="offer">−{product.discount}%</Tag> : null}
              {product.limited ? <Tag tone="rare">Last one</Tag> : null}
            </div>

            <p className="eyebrow pdp__cat">{category.name}</p>
            <RevealText as="h1" className="display d2 pdp__title" text={product.name} />

            <div className="pdp__rating">
              <Stars value={product.rating} count={product.reviews} />
            </div>

            <div className="pdp__price">
              <span className="pdp__price-now num">{formatINR(product.price)}</span>
              {product.compareAt ? (
                <>
                  <span className="pdp__price-was num">{formatINR(product.compareAt)}</span>
                  <span className="pdp__price-save">
                    Save {formatINR(product.compareAt - product.price)}
                  </span>
                </>
              ) : null}
            </div>
            <p className="pdp__tax muted">Inclusive of all taxes. Duties shown at checkout.</p>

            <p className="pdp__story">{product.story}</p>

            <div className="pdp__swatch">
              <span className="pdp__swatch-dot" style={{ background: product.swatch }} aria-hidden="true" />
              <span>{product.colour}</span>
            </div>

            {product.sizes ? (
              <div className={`pdp__sizes ${sizeError ? 'has-error' : ''}`} id="size-picker">
                <div className="pdp__sizes-head">
                  <p className="eyebrow">{product.category === 'accessories' ? 'Bangle size' : 'Size'}</p>
                  {product.sizes.length > 1 ? (
                    <Link to="/atelier#sizing" className="pdp__sizes-guide">
                      Size guide
                    </Link>
                  ) : null}
                </div>
                <div className="pdp__size-row" role="radiogroup" aria-label="Size">
                  {product.sizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      role="radio"
                      aria-checked={size === s}
                      className={`sizebtn ${size === s ? 'is-on' : ''}`}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError ? <p className="pdp__size-error">Choose a size to continue.</p> : null}
              </div>
            ) : null}

            <div className="pdp__stock">
              <span className={`pdp__dot ${product.stock <= 3 ? 'is-low' : ''}`} aria-hidden="true" />
              {product.stock <= 3
                ? `Only ${product.stock} left — made to order after that`
                : 'In stock, ready to dispatch'}
            </div>

            <div className="pdp__buy">
              <Stepper value={qty} max={product.stock} onChange={setQty} />
              <MagneticButton variant="solid" size="lg" className="pdp__add" onClick={() => commit(false)}>
                Add to bag — {formatINR(product.price * qty)}
              </MagneticButton>
            </div>

            <div className="pdp__buy-secondary">
              <MagneticButton variant="line" size="lg" className="pdp__now" onClick={() => commit(true)}>
                Buy it now
              </MagneticButton>
              <button
                type="button"
                className={`pdp__save ${saved ? 'is-saved' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-pressed={saved}
              >
                <svg viewBox="0 0 20 18" width="15" height="14" aria-hidden="true">
                  <path
                    d="M10 16.5 2.9 9.6A4.1 4.1 0 0 1 10 4.2a4.1 4.1 0 0 1 7.1 5.4L10 16.5Z"
                    fill={saved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                </svg>
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            <ul className="pdp__assure">
              <li>
                <strong>Dispatch</strong>
                <span>Ships in {product.days} days</span>
              </li>
              <li>
                <strong>Delivery</strong>
                <span>{deliveryWindow(product.days + 3)}</span>
              </li>
              <li>
                <strong>Returns</strong>
                <span>30 days, unworn</span>
              </li>
            </ul>

            <div className="pdp__acc">
              <Accordion title="Details & provenance" defaultOpen>
                <Marks product={product} />
              </Accordion>
              <Accordion title="Care">
                <p>{product.care}</p>
              </Accordion>
              <Accordion title="Shipping & returns">
                <p>
                  Complimentary insured delivery within India on orders over ₹15,000; ₹350 below
                  that. International delivery is quoted at checkout and typically takes a further
                  five to eight days.
                </p>
                <p>
                  Unworn pieces may be returned within thirty days with tags intact. Made-to-order
                  and altered pieces are final sale.
                </p>
              </Accordion>
              <Accordion title="Ask about this piece">
                <p>
                  Our Chennai studio answers on WhatsApp and by phone, 10am–7pm IST.
                  <br />
                  <a href="tel:+914428110098" className="pdp__contact">
                    +91 44 2811 0098
                  </a>
                  <br />
                  <a href="mailto:studio@clothyhome.in" className="pdp__contact">
                    studio@clothyhome.in
                  </a>
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* --- provenance band --- */}
      <section className="prov on-ink">
        <div className="prov__plate" ref={swatchRef}>
          <Figure
            image={product.images[product.images.length - 1]}
            alt=""
            ratio={0.8}
            width={1280}
            sizes="(max-width: 900px) 100vw, 48vw"
            tone={product.swatch}
          />
        </div>
        <div className="prov__body">
          <Reveal as="p" className="eyebrow">
            Where it comes from
          </Reveal>
          <RevealText as="h2" className="display d2 prov__title" text={product.origin} delay={70} />
          <Reveal as="p" className="lead prov__blurb" delay={170}>
            {product.weaver
              ? `${product.weaver}. `
              : ''}
            Everything we sell is traced to a named workshop — we publish the town because we
            think you should be able to check.
          </Reveal>
          <Reveal delay={250}>
            <MagneticButton to="/atelier#weavers" variant="bone">
              Meet the makers
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Goes with" title="Wear it with" />
          <ProductRail products={related} />
        </div>
      </section>

      {alsoViewed.length > 0 ? (
        <section className="section-tight">
          <div className="shell">
            <SectionHead eyebrow="Your trail" title="Recently viewed" />
            <ProductRail products={alsoViewed} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
