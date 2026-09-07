import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bySlug, categoryBySlug, formatINR, relatedTo } from '../data/catalog.js';
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF } from '../data/contact.js';
import { useStore } from '../context/StoreContext.jsx';
import Gallery from '../components/product/Gallery.jsx';
import { ProductGrid } from '../components/product/ProductCard.jsx';
import { Crumbs, SectionHead, Stars, Stepper, Tag } from '../components/ui/Primitives.jsx';
import NotFound from './NotFound.jsx';

/* ==========================================================================
   Product detail
   --------------------------------------------------------------------------
   Laid out to the reference product page, measured off it rather than
   eyeballed: a breadcrumb pill, then a two-column block with the gallery on
   the left and a single column of information on the right, running

     share · title · price · tax note · SKU · rating · stock bar
     variant pills · quantity + add · buy it now
     four bordered trust badges · a stack of hairline accordions

   and closing on a four-across "You may also like" grid. The reference's
   spacing rhythm (a 10.5px gutter between blocks, 49px controls, 20px media
   radius) is carried over; the palette, type and copy are ours.

   One thing from the reference is deliberately not here: it prints "N people
   are viewing this right now" above the stock bar. That number is invented —
   it is not tied to anything the page knows — so this shows the piece's real
   rating and review count in the same slot instead.
   ========================================================================== */

/** The stock bar's full width. Above this a piece simply reads as in stock. */
const STOCK_SCALE = 12;

function deliveryWindow(days) {
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const now = Date.now();
  return `${fmt(new Date(now + days * 86400000))} – ${fmt(new Date(now + (days + 4) * 86400000))}`;
}

/** PIN-code delivery estimate. There is no carrier behind this, so it derives
    a window from the piece's own lead time and says plainly that it is an
    estimate. */
function DeliveryCheck({ days }) {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);

  const check = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin.trim())) {
      setResult({ ok: false, text: 'Indian PIN codes are six digits.' });
      return;
    }
    /* Metro PINs (a leading 1, 4, 5, 6 or 7) get the express lane. */
    const metro = /^[14567]/.test(pin.trim());
    setResult({
      ok: true,
      text: `Estimated delivery ${deliveryWindow(days + (metro ? 2 : 4))}${
        metro ? ' — express available' : ''
      }`,
    });
  };

  return (
    <div className="pdp__pin">
      <form onSubmit={check}>
        <label htmlFor="pin-check">Check delivery to your PIN code</label>
        <div className="pdp__pin-row">
          <input
            id="pin-check"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            placeholder="Enter PIN code"
            onChange={(e) => {
              setPin(e.target.value.replace(/[^0-9]/g, ''));
              setResult(null);
            }}
          />
          <button type="submit">Check</button>
        </div>
      </form>
      {result ? (
        <p className={`pdp__pin-out ${result.ok ? 'is-ok' : 'is-bad'}`} role="status">
          {result.text}
        </p>
      ) : null}
    </div>
  );
}

/** Copy the page address. Falls back to a prompt-free select when the
    clipboard API is unavailable (http origins, older browsers). */
function ShareRow({ name }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed the share sheet, or clipboard blocked — nothing to recover */
    }
  };

  return (
    <button type="button" className="pdp__share" onClick={share}>
      {copied ? 'Link copied' : 'Share'}
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
        <path
          d="M8 10.5V2.4M5.2 5.2 8 2.4l2.8 2.8M2.8 9.4v3.2a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1V9.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Marks({ product }) {
  const rows = [
    product.origin && { label: 'Made in', value: product.origin },
    product.weaver && { label: 'Technique', value: product.weaver },
    product.fabric && { label: 'Fabric', value: product.fabric },
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

/* The reference's badge row: four bordered boxes, each a ringed glyph beside
   a two-line label. */
const TRUST = [
  {
    id: 'handwoven',
    label: 'Handwoven\nto order',
    path: 'M4 13.5c2.4-2 5.2-2 7.6 0M4 9.5c2.4-2 5.2-2 7.6 0M4 5.5c2.4-2 5.2-2 7.6 0',
  },
  { id: 'secure', label: 'Secure\npayment', path: 'M8 2.6 3.4 4.5v3.9c0 2.7 1.9 4.5 4.6 5.4 2.7-.9 4.6-2.7 4.6-5.4V4.5Z' },
  { id: 'authentic', label: '100%\nauthentic', path: 'M4.2 8.3 6.9 11l5-5.4' },
  { id: 'returns', label: 'Easy\nreturns', path: 'M12.4 9.2A4.6 4.6 0 1 1 8 3.6h3.4M9.2 1.6l2.4 2-2.4 2' },
];

function TrustBadges() {
  return (
    <ul className="pdp__trust" aria-label="What we promise">
      {TRUST.map((t) => (
        <li key={t.id}>
          <span className="pdp__trust-mark" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="15" height="15">
              <path d={t.path} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="pdp__trust-label">
            {t.label.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* The reference's accordion rows: an icon, a label, a chevron, and a hairline
   above each. Local to the product page because its row is a different shape
   from the shared Accordion used elsewhere. */
const PANEL_ICONS = {
  description: 'M4.5 2.5h7v11h-7zM6.5 5.5h3M6.5 8h3M6.5 10.5h2',
  care: 'M2.6 5.8 8 2.8l5.4 3v4.4L8 13.2l-5.4-3zM2.6 5.8 8 8.8l5.4-3M8 8.8v4.4',
  shipping: 'M1.8 4.6h7.6v6.8H1.8zM9.4 7h2.4l2.4 2.2v2.2H9.4zM4.4 11.4a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 0 0-2.6 0M10.6 11.4a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 0 0-2.6 0',
  returns: 'M3 3h10v10H3zM5.6 8l1.7 1.8L10.6 6',
  care_of: 'M8 2.6c2 2.2 3.4 3.9 3.4 5.8a3.4 3.4 0 1 1-6.8 0c0-1.9 1.4-3.6 3.4-5.8Z',
  customer: 'M3 4.4h10v6.2H6.4L3.8 12.6v-2H3zM6 7.4h4M6 9h2.6',
};

function Panel({ id, icon, title, children, open, onToggle }) {
  return (
    <div className={`pdp__panelrow ${open ? 'is-open' : ''}`}>
      <h3>
        <button
          type="button"
          className="pdp__panelhead"
          aria-expanded={open}
          aria-controls={`panel-${id}`}
          onClick={onToggle}
        >
          <svg className="pdp__panelicon" viewBox="0 0 16 16" width="17" height="17" aria-hidden="true">
            <path d={icon} fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="pdp__paneltitle">{title}</span>
          <svg className="pdp__panelchev" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
            <path d="M3.6 6 8 10.4 12.4 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h3>
      <div className="pdp__panelbody" id={`panel-${id}`} hidden={!open}>
        <div className="pdp__panelinner">{children}</div>
      </div>
    </div>
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
  /* The reference opens on Description and keeps one panel open at a time. */
  const [openPanel, setOpenPanel] = useState('description');

  useEffect(() => {
    if (product) {
      pushViewed(product.slug);
      setSize(product.sizes && product.sizes.length === 1 ? product.sizes[0] : null);
      setQty(1);
      setSizeError(false);
      setOpenPanel('description');
    }
  }, [product, pushViewed]);

  const related = useMemo(() => relatedTo(product, 4), [product]);
  const alsoViewed = viewedItems.filter((p) => p.slug !== slug).slice(0, 4);

  if (!product) return <NotFound />;

  const category = categoryBySlug(product.category);
  const saved = isSaved(product.slug);
  const needsSize = Boolean(product.sizes && product.sizes.length > 1);
  const stockPct = Math.max(6, Math.min(100, (product.stock / STOCK_SCALE) * 100));

  const commit = (thenGo) => {
    if (needsSize && !size) {
      setSizeError(true);
      document.getElementById('size-picker')?.scrollIntoView({ block: 'center' });
      return;
    }
    addToCart(product, { size, qty, open: !thenGo });
    if (thenGo) navigate('/checkout');
  };

  const toggle = (id) => setOpenPanel((cur) => (cur === id ? null : id));

  return (
    <article className="pdp">
      <div className="shell pdp__crumbs">
        <div className="pdp__crumbpill">
          <Crumbs
            items={[
              { label: 'Home', to: '/' },
              { label: category.name, to: `/category/${category.slug}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="pdp__main">
        <div className="pdp__gallery">
          <Gallery images={product.images} alt={product.name} tone={product.swatch} />
        </div>

        <div className="pdp__panel">
          <div className="pdp__info">
            <div className="pdp__topline">
              <div className="pdp__badges">
                {product.isNew ? <Tag>New</Tag> : null}
                {product.isBestSeller ? <Tag>Best seller</Tag> : null}
                {product.onOffer ? <Tag tone="offer">−{product.discount}%</Tag> : null}
                {product.limited ? <Tag tone="rare">Last one</Tag> : null}
              </div>
              <ShareRow name={product.name} />
            </div>

            <h1 className="pdp__title">{product.name}</h1>

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

            <p className="pdp__tax">
              Inclusive of all taxes.{' '}
              <Link to="/atelier#shipping">Shipping</Link> calculated at checkout.
            </p>

            <p className="pdp__sku">
              <strong>SKU:</strong>
              <span className="num">{product.id}</span>
            </p>

            <div className="pdp__rating">
              <Stars value={product.rating} count={product.reviews} />
            </div>

            <div className="pdp__stock">
              <p className={`pdp__stock-line ${product.stock <= 3 ? 'is-low' : ''}`}>
                {product.stock <= 3
                  ? `Only ${product.stock} left — made to order after that`
                  : 'In stock, ready to dispatch'}
              </p>
              <span className="pdp__stock-bar" aria-hidden="true">
                <span style={{ width: `${stockPct}%` }} />
              </span>
            </div>

            {product.sizes ? (
              <div className={`pdp__sizes ${sizeError ? 'has-error' : ''}`} id="size-picker">
                <div className="pdp__sizes-head">
                  <p className="pdp__label">
                    Size{size ? <span className="pdp__chosen">{size}</span> : null}
                  </p>
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

            <div className="pdp__colour">
              <p className="pdp__label">Colour</p>
              <span className="pdp__swatch">
                <span className="pdp__swatch-dot" style={{ background: product.swatch }} aria-hidden="true" />
                {product.colour}
              </span>
            </div>

            <div className="pdp__buy">
              <div className="pdp__qty">
                <p className="pdp__label" id="qty-label">
                  Quantity
                </p>
                <Stepper value={qty} max={product.stock} onChange={setQty} />
              </div>
              <button type="button" className="pdp__add" onClick={() => commit(false)}>
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                  <path
                    d="M2.2 2.4h1.9l1.6 7.4h6.6l1.5-5.2H4.6M6.6 13.1a.9.9 0 1 0 1.8 0 .9.9 0 0 0-1.8 0M10.6 13.1a.9.9 0 1 0 1.8 0 .9.9 0 0 0-1.8 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add to bag — {formatINR(product.price * qty)}
              </button>
            </div>

            <button type="button" className="pdp__now" onClick={() => commit(true)}>
              Buy it now
            </button>

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
              {saved ? 'Saved to your list' : 'Save for later'}
            </button>

            <TrustBadges />

            <div className="pdp__panels">
              <Panel
                id="description"
                icon={PANEL_ICONS.description}
                title="Description"
                open={openPanel === 'description'}
                onToggle={() => toggle('description')}
              >
                <p>{product.story}</p>
                <Marks product={product} />
              </Panel>

              <Panel
                id="care"
                icon={PANEL_ICONS.care_of}
                title="Care instructions"
                open={openPanel === 'care'}
                onToggle={() => toggle('care')}
              >
                <p>{product.care}</p>
              </Panel>

              <Panel
                id="shipping"
                icon={PANEL_ICONS.shipping}
                title="Shipping &amp; delivery"
                open={openPanel === 'shipping'}
                onToggle={() => toggle('shipping')}
              >
                <p>
                  Ships in {product.days} days. Complimentary insured delivery within India on
                  orders over ₹15,000; ₹350 below that. International delivery is quoted at
                  checkout and typically takes a further five to eight days.
                </p>
                <DeliveryCheck days={product.days} />
              </Panel>

              <Panel
                id="returns"
                icon={PANEL_ICONS.returns}
                title="Return &amp; refund policy"
                open={openPanel === 'returns'}
                onToggle={() => toggle('returns')}
              >
                <p>
                  Unworn pieces may be returned within thirty days with tags intact, for a full
                  refund to the original payment method. Made-to-order and altered pieces are
                  final sale.
                </p>
              </Panel>

              <Panel
                id="customer"
                icon={PANEL_ICONS.customer}
                title="Customer care"
                open={openPanel === 'customer'}
                onToggle={() => toggle('customer')}
              >
                <p>Our Chennai studio answers on WhatsApp and by phone, 10am–7pm IST.</p>
                <p>
                  <a href={PHONE_HREF} className="pdp__contact">
                    {PHONE}
                  </a>
                  <br />
                  <a href={EMAIL_HREF} className="pdp__contact">
                    {EMAIL}
                  </a>
                </p>
              </Panel>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Goes with" title="You may also like" />
          <ProductGrid products={related} cols={4} label="You may also like" />
        </div>
      </section>

      {alsoViewed.length > 0 ? (
        <section className="section-tight">
          <div className="shell">
            <SectionHead eyebrow="Your trail" title="Recently viewed" />
            <ProductGrid products={alsoViewed} cols={4} label="Recently viewed" />
          </div>
        </section>
      ) : null}
    </article>
  );
}
