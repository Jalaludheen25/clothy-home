import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, COLLECTIONS } from '../../data/catalog.js';
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF, SOCIAL } from '../../data/contact.js';
import { useStore } from '../../context/StoreContext.jsx';
import { Marquee, Reveal, RevealText } from '../ui/Primitives.jsx';
import { Logo } from '../ui/Logo.jsx';

/* ==========================================================================
   Footer
   ========================================================================== */

/* Line marks drawn to the same 1.2px weight as the rest of the chrome, so the
   row reads as part of the footer rather than three pasted brand badges. */
function SocialMark({ id }) {
  const common = {
    viewBox: '0 0 20 20',
    width: 16,
    height: 16,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    'aria-hidden': true,
    focusable: 'false',
  };
  if (id === 'instagram') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="14" height="14" rx="4.2" />
        <circle cx="10" cy="10" r="3.4" />
        <circle cx="14.1" cy="5.9" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === 'facebook') {
    return (
      <svg {...common}>
        <path d="M12.6 3.4h-1.7a2.9 2.9 0 0 0-2.9 2.9v2.1H6.3v2.6H8v6.6h2.6V11h2l.4-2.6h-2.4V6.6c0-.5.3-.7.8-.7h1.2z" />
      </svg>
    );
  }
  return (
    /* Google — the listing, so a map pin rather than the wordmark. */
    <svg {...common}>
      <path d="M10 17.5s5.2-5 5.2-8.6a5.2 5.2 0 1 0-10.4 0C4.8 12.5 10 17.5 10 17.5z" />
      <circle cx="10" cy="8.8" r="2" />
    </svg>
  );
}


const HELP = [
  { label: 'Track an order', to: '/track' },
  { label: 'Your account', to: '/account' },
  { label: 'Saved pieces', to: '/wishlist' },
  { label: 'Shipping & returns', to: '/atelier#shipping' },
  { label: 'Size & drape guide', to: '/atelier#sizing' },
  { label: 'Care of silk', to: '/atelier#care' },
];

export default function Footer() {
  const { toast } = useStore();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast('That email does not look right', 'error');
      return;
    }
    setDone(true);
    toast('You are on the list — look for a note on Thursdays');
  };

  return (
    <footer className="footer on-ink">
      <Marquee
        className="footer__marquee"
        items={[
          'Handwoven in India',
          'Made in small runs',
          'Complimentary delivery over ₹15,000',
          'Thirty-day returns',
          'Since 1998',
        ]}
      />

      <div className="footer__top shell">
        <div className="footer__pitch">
          <RevealText
            as="h2"
            className="display d1 footer__title"
            text="A letter, most Thursdays."
          />
          <Reveal as="p" className="lead footer__blurb" delay={120}>
            New pieces off the loom, the occasional note from a weaver, and first access to
            everything limited. No more than one a week.
          </Reveal>

          <Reveal delay={200}>
            {done ? (
              <p className="footer__done serif-italic">
                Thank you — we will write soon.
              </p>
            ) : (
              <form className="subscribe" onSubmit={submit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  required
                />
                <button type="submit">
                  Subscribe
                  <svg viewBox="0 0 20 10" width="20" height="10" aria-hidden="true">
                    <path d="M0 5h18M14 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </button>
              </form>
            )}
          </Reveal>
        </div>

        <nav className="footer__cols" aria-label="Footer">
          <div className="footer__col">
            <p className="eyebrow">Shop</p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/shop">All pieces</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <p className="eyebrow">Collections</p>
            <ul>
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <Link to={`/collection/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <p className="eyebrow">Help</p>
            <ul>
              {HELP.map((h) => (
                <li key={h.label}>
                  <Link to={h.to}>{h.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <p className="eyebrow">The house</p>
            <ul>
              <li>
                <Link to="/atelier">Our atelier</Link>
              </li>
              <li>
                <Link to="/atelier#weavers">The weavers</Link>
              </li>
              <li>
                <a href={PHONE_HREF}>{PHONE}</a>
              </li>
              <li>
                <a href={EMAIL_HREF}>{EMAIL}</a>
              </li>
            </ul>

            <ul className="footer__social">
              {SOCIAL.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="footer__social-link"
                    aria-label={`Clothy Home on ${s.label}`}
                  >
                    <SocialMark id={s.id} />
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="footer__mark" aria-hidden="true">
        <Logo tone="light" weight="heavy" className="footer__logo" alt="" />
      </div>

      <div className="footer__base shell">
        <p className="muted">© {new Date().getFullYear()} Clothy Home, Chennai. All rights reserved.</p>
        <ul className="footer__legal">
          <li>
            <Link to="/atelier#terms">Terms</Link>
          </li>
          <li>
            <Link to="/atelier#privacy">Privacy</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
