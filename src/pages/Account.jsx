import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../data/catalog.js';
import IMG, { src } from '../data/images.js';
import { useStore } from '../context/StoreContext.jsx';
import { ProductGrid } from '../components/product/ProductCard.jsx';
import {
  Crumbs,
  EmptyState,
  MagneticButton,
  Reveal,
  RevealText,
} from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Account
   --------------------------------------------------------------------------
   No server behind this — signing in records a name locally so the rest of
   the storefront can address someone by it.
   ========================================================================== */

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'saved', label: 'Saved' },
  { id: 'details', label: 'Details' },
  { id: 'addresses', label: 'Addresses' },
];

function SignIn() {
  const { signIn, toast } = useStore();
  const [mode, setMode] = useState('in');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      toast('That email does not look right', 'error');
      return;
    }
    if (form.password.length < 6) {
      toast('Passwords are at least six characters', 'error');
      return;
    }
    signIn({
      name: form.name.trim() || form.email.split('@')[0].replace(/[._]/g, ' '),
      email: form.email,
      phone: '',
    });
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <Reveal as="p" className="eyebrow">
          {mode === 'in' ? 'Welcome back' : 'Open an account'}
        </Reveal>
        <RevealText
          as="h1"
          className="display d1 auth__title"
          text={mode === 'in' ? 'Sign in' : 'Join the house'}
          delay={60}
        />
        <Reveal as="p" className="lead auth__blurb" delay={150}>
          An account keeps your orders, saved pieces and addresses in one place — and gets
          you first sight of anything limited.
        </Reveal>

        <Reveal as="form" className="auth__form" delay={220} onSubmit={submit}>
          {mode === 'up' ? (
            <label className="field">
              <span>Full name</span>
              <input value={form.name} onChange={set('name')} autoComplete="name" />
            </label>
          ) : null}
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          <MagneticButton variant="solid" size="lg" type="submit" onClick={submit}>
            {mode === 'in' ? 'Sign in' : 'Create account'}
          </MagneticButton>
          <p className="auth__switch">
            {mode === 'in' ? 'No account yet?' : 'Already have one?'}{' '}
            <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
              {mode === 'in' ? 'Open one' : 'Sign in'}
            </button>
          </p>
          <p className="auth__note muted">
            A demonstration storefront — details stay in this browser and go nowhere else.
          </p>
        </Reveal>
      </div>

      <div className="auth__aside" aria-hidden="true">
        <img src={src(IMG.sareeNoir, 1100, 1.32)} alt="" loading="lazy" />
      </div>
    </div>
  );
}

export default function Account() {
  const { user, signOut, orders, wishlistItems, viewedItems } = useStore();
  const [tab, setTab] = useState('orders');

  if (!user) return <SignIn />;

  const spent = orders.reduce((s, o) => s + (o.grandTotal ?? o.totals.total), 0);

  return (
    <div className="account">
      <header className="listing__head listing__head--plain">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
          <Reveal as="p" className="eyebrow">
            Client since {user.since}
          </Reveal>
          <RevealText as="h1" className="display d1 listing__title" text={user.name} delay={60} />
          <Reveal as="div" className="account__meta" delay={150}>
            <p className="lead">{user.email}</p>
            <button type="button" className="account__signout" onClick={signOut}>
              Sign out
            </button>
          </Reveal>
        </div>
      </header>

      <div className="shell">
        <div className="account__figures">
          {[
            { label: 'Orders placed', value: String(orders.length) },
            { label: 'Pieces saved', value: String(wishlistItems.length) },
            { label: 'Lifetime value', value: formatINR(spent) },
          ].map((f, i) => (
            <Reveal className="afig" key={f.label} delay={i * 80}>
              <p className="afig__value display num">{f.value}</p>
              <p className="afig__label">{f.label}</p>
            </Reveal>
          ))}
        </div>

        <nav className="tabs" aria-label="Account sections">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`tabs__btn ${tab === t.id ? 'is-on' : ''}`}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
            >
              {t.label}
              {t.id === 'saved' && wishlistItems.length ? (
                <span className="tabs__count num">{wishlistItems.length}</span>
              ) : null}
              {t.id === 'orders' && orders.length ? (
                <span className="tabs__count num">{orders.length}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="account__panel">
          {tab === 'orders' ? (
            orders.length ? (
              <ul className="alist">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/track/${o.id}`} className="aorder">
                      <span className="aorder__imgs">
                        {o.items.slice(0, 3).map((it) => (
                          <img key={it.slug} src={src(it.image, 140, 1.25)} alt="" loading="lazy" />
                        ))}
                      </span>
                      <span className="aorder__body">
                        <strong className="num">{o.id}</strong>
                        <em>
                          {new Date(o.placedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}{' '}
                          · {o.items.length} {o.items.length === 1 ? 'piece' : 'pieces'}
                        </em>
                      </span>
                      <span className="aorder__total num">
                        {formatINR(o.grandTotal ?? o.totals.total)}
                      </span>
                      <span className="aorder__go" aria-hidden="true">
                        <svg viewBox="0 0 24 12" width="22" height="11">
                          <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                        </svg>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No orders yet"
                blurb="When you place one it will sit here, with live tracking."
                action={
                  <MagneticButton to="/shop" variant="line">
                    Browse the house
                  </MagneticButton>
                }
              />
            )
          ) : null}

          {tab === 'saved' ? (
            wishlistItems.length ? (
              <ProductGrid products={wishlistItems} cols={4} />
            ) : (
              <EmptyState
                title="Nothing saved"
                blurb="The heart on any piece keeps it here."
                action={
                  <MagneticButton to="/shop" variant="line">
                    Find something
                  </MagneticButton>
                }
              />
            )
          ) : null}

          {tab === 'details' ? (
            <div className="adetails">
              <div className="adetails__card">
                <h2 className="eyebrow">Your details</h2>
                <dl className="marks">
                  <div>
                    <dt>Name</dt>
                    <dd>{user.name}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{user.phone || 'Not on file'}</dd>
                  </div>
                  <div>
                    <dt>Client since</dt>
                    <dd>{user.since}</dd>
                  </div>
                </dl>
              </div>
              <div className="adetails__card">
                <h2 className="eyebrow">Preferences</h2>
                <p className="muted">
                  You are receiving the Thursday letter. Sizes and drape preferences are kept
                  by the studio so repeat orders do not need re-measuring.
                </p>
                <MagneticButton to="/atelier#sizing" variant="line" size="sm">
                  Drape guide
                </MagneticButton>
              </div>
              {viewedItems.length ? (
                <div className="adetails__card adetails__card--wide">
                  <h2 className="eyebrow">Recently viewed</h2>
                  <ProductGrid products={viewedItems.slice(0, 4)} cols={4} />
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'addresses' ? (
            orders.length ? (
              <ul className="aaddr">
                {[...new Map(orders.map((o) => [o.address.pin + o.address.line1, o])).values()].map(
                  (o) => (
                    <li key={o.id} className="aaddr__card">
                      <h2 className="eyebrow">
                        {o.address.city}
                        {o === orders[0] ? ' · default' : ''}
                      </h2>
                      <p>
                        {o.address.name}
                        <br />
                        {o.address.line1}
                        <br />
                        {o.address.city}, {o.address.state} {o.address.pin}
                      </p>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <EmptyState
                title="No addresses saved"
                blurb="Addresses are kept from your first order onward."
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
