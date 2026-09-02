import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatINR } from '../data/catalog.js';
import { src } from '../data/images.js';
import { useStore } from '../context/StoreContext.jsx';
import {
  Crumbs,
  EmptyState,
  MagneticButton,
  Reveal,
  RevealText,
} from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Order tracking
   --------------------------------------------------------------------------
   The stage is derived from how long ago the order was placed rather than
   stored, so a returning visitor sees it progress on its own.
   ========================================================================== */

const STAGES = [
  { key: 'placed', label: 'Order placed', note: 'We have it, and payment cleared.' },
  { key: 'atelier', label: 'In the atelier', note: 'Checked, pressed and wrapped in muslin.' },
  { key: 'dispatched', label: 'Dispatched', note: 'Handed to our courier in Chennai.' },
  { key: 'transit', label: 'In transit', note: 'Moving toward your city.' },
  { key: 'delivered', label: 'Delivered', note: 'Signed for at the address.' },
];

function stageFor(order) {
  const placed = new Date(order.placedAt).getTime();
  const eta = new Date(order.etaAt).getTime();
  const span = Math.max(1, eta - placed);
  const through = (Date.now() - placed) / span;
  if (through >= 1) return 4;
  if (through > 0.72) return 3;
  if (through > 0.42) return 2;
  if (through > 0.12) return 1;
  return 0;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

function OrderView({ order }) {
  const stage = stageFor(order);
  const progress = (stage / (STAGES.length - 1)) * 100;

  return (
    <>
      <header className="track__head">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Order' }, { label: order.id }]} />
          <Reveal as="p" className="eyebrow">
            {stage === 4 ? 'Delivered' : 'On its way'}
          </Reveal>
          <RevealText as="h1" className="display d1 track__title" text={`Order ${order.id}`} delay={60} />
          <Reveal as="p" className="lead track__blurb" delay={160}>
            Placed {fmtDate(order.placedAt)}
            {stage < 4 ? ` · arriving around ${fmtDate(order.etaAt)}` : ''}
          </Reveal>
        </div>
      </header>

      <section className="shell track__body">
        <div className="track__main">
          <ol className="ladder" style={{ '--ladder-progress': `${progress}%` }}>
            <span className="ladder__rail" aria-hidden="true">
              <i />
            </span>
            {STAGES.map((s, i) => (
              <li
                key={s.key}
                className={`ladder__step ${i <= stage ? 'is-done' : ''} ${i === stage ? 'is-now' : ''}`}
              >
                <span className="ladder__mark" aria-hidden="true" />
                <div className="ladder__body">
                  <h2 className="ladder__label">{s.label}</h2>
                  <p className="ladder__note muted">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="track__items">
            <h2 className="eyebrow">In this parcel</h2>
            <ul>
              {order.items.map((item) => (
                <li key={`${item.slug}-${item.size}`}>
                  <Link to={`/product/${item.slug}`} className="track__item">
                    <img src={src(item.image, 180, 1.25)} alt="" loading="lazy" />
                    <span className="track__item-body">
                      <strong>{item.name}</strong>
                      <em>
                        {item.size ? `${item.size} · ` : ''}Quantity {item.qty}
                      </em>
                    </span>
                    <span className="num">{formatINR(item.price * item.qty)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="track__side">
          <div className="tcard">
            <h2 className="eyebrow">Delivering to</h2>
            <p className="tcard__addr">
              {order.address.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.city}, {order.address.state} {order.address.pin}
            </p>
            <p className="tcard__meta muted">
              {order.delivery?.label} — {order.delivery?.note}
            </p>
          </div>

          <div className="tcard">
            <h2 className="eyebrow">Payment</h2>
            <p className="tcard__meta">{order.payment?.label}</p>
            <dl className="summary__sums">
              <div>
                <dt>Subtotal</dt>
                <dd className="num">{formatINR(order.totals.subtotal)}</dd>
              </div>
              <div>
                <dt>GST</dt>
                <dd className="num">{formatINR(order.totals.tax)}</dd>
              </div>
              <div className="summary__total">
                <dt>Paid</dt>
                <dd className="num">{formatINR(order.grandTotal ?? order.totals.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="tcard tcard--help">
            <h2 className="eyebrow">Need us?</h2>
            <p className="muted">
              The studio answers 10am–7pm IST, and we keep a note of every order against your
              phone number.
            </p>
            <a href="tel:+914428110098" className="tcard__link">
              +91 44 2811 0098
            </a>
            <a href="mailto:studio@clothyhome.in" className="tcard__link">
              studio@clothyhome.in
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const { orders } = useStore();
  const [query, setQuery] = useState('');
  const [missed, setMissed] = useState(false);

  const order = useMemo(() => {
    const key = (id || query).trim().toUpperCase();
    return orders.find((o) => o.id === key);
  }, [id, query, orders]);

  if (order) return <div className="track">{<OrderView order={order} />}</div>;

  return (
    <div className="track">
      <header className="listing__head listing__head--plain">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Track an order' }]} />
          <RevealText as="h1" className="display d1 listing__title" text="Track an order" />
          <Reveal as="p" className="lead listing__blurb" delay={130}>
            Enter the reference from your confirmation email — it begins with CH.
          </Reveal>

          <Reveal delay={200}>
            <form
              className="track__form"
              onSubmit={(e) => {
                e.preventDefault();
                setMissed(!orders.some((o) => o.id === query.trim().toUpperCase()));
              }}
            >
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setMissed(false);
                }}
                placeholder="CH202609XXXXX"
                aria-label="Order reference"
              />
              <button type="submit">Track</button>
            </form>
            {missed ? (
              <p className="track__missed">
                No order with that reference on this device. Orders are held locally in this
                demonstration, so they only appear in the browser they were placed from.
              </p>
            ) : null}
          </Reveal>
        </div>
      </header>

      <div className="shell">
        {orders.length > 0 ? (
          <section className="track__recent">
            <h2 className="eyebrow">Your recent orders</h2>
            <ul>
              {orders.map((o) => (
                <li key={o.id}>
                  <Link to={`/track/${o.id}`} className="track__row">
                    <span className="track__row-id num">{o.id}</span>
                    <span className="track__row-date muted">{fmtDate(o.placedAt)}</span>
                    <span className="track__row-items muted">
                      {o.items.length} {o.items.length === 1 ? 'piece' : 'pieces'}
                    </span>
                    <span className="track__row-status">{STAGES[stageFor(o)].label}</span>
                    <span className="num">{formatINR(o.grandTotal ?? o.totals.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <EmptyState
            title="No orders on this device yet"
            blurb="Place one and it will appear here, moving through the atelier in real time."
            action={
              <MagneticButton to="/shop" variant="line">
                Browse the house
              </MagneticButton>
            }
          />
        )}
      </div>
    </div>
  );
}
