import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, COLLECTIONS } from '../../data/catalog.js';
import {
  ADDRESS,
  EMAIL,
  EMAIL_HREF,
  PHONE,
  PHONE_HREF,
  SOCIAL,
  WHATSAPP,
  WHATSAPP_HREF,
} from '../../data/contact.js';
import { useStore } from '../../context/StoreContext.jsx';
import { Logo } from '../ui/Logo.jsx';

/* ==========================================================================
   Footer
   --------------------------------------------------------------------------
   Built to the reference site's footer, measured off it at 1440px:

     brand band   logo, a blurb that clamps to two lines behind a Read more
                  toggle, and the phone and email right-aligned beside it
     rule
     five columns 251px each at a 25.2px gap — quick links, the house,
                  policies, get in touch (address + three contact lines),
                  follow us (38px round social buttons)
     base bar     copyright, on a hairline

   Its column headings are 13.1px/700 uppercase at 1.6px tracking and its
   links 14.7px; those numbers are carried over, the palette and copy are
   ours. Columns collapse behind their heading below 760px, which is what the
   reference uses its <details> elements for.
   ========================================================================== */

/* Line marks drawn to the same weight as the rest of the chrome, so the row
   reads as part of the footer rather than four pasted brand badges. */
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
  if (id === 'whatsapp') {
    return (
      <svg {...common}>
        <path d="M2.9 17.3l1.1-4A7 7 0 1 1 6.7 15.8L2.9 17.3ZM7.6 6.9c-.3 0-.6.1-.8.4-.3.3-.6.9-.4 1.8.3.9.9 1.7 1.6 2.3.7.7 1.7 1.1 2.4 1.3.7.1 1.2-.2 1.5-.6.2-.3.2-.7.1-.8l-1.3-.7c-.2.2-.4.5-.5.6-.1.1-.3.1-.4 0a4.9 4.9 0 0 1-2-2.1c-.1-.2 0-.4.1-.5l.5-.5-.7-1.3a1 1 0 0 0-.1 0Z" />
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

function ContactMark({ id }) {
  const common = {
    viewBox: '0 0 16 16',
    width: 14,
    height: 14,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
  };
  if (id === 'phone') {
    return (
      <svg {...common}>
        <path d="M5.6 2.4H3.4a1 1 0 0 0-1 1.1c.25 4.3 3.8 7.85 8.1 8.1a1 1 0 0 0 1.1-1V8.5l-2.5-.6-1.1 1.5a8.4 8.4 0 0 1-3.3-3.3l1.5-1.1Z" />
      </svg>
    );
  }
  if (id === 'mail') {
    return (
      <svg {...common}>
        <rect x="2" y="3.6" width="12" height="8.8" rx="1.1" />
        <path d="M2.4 4.4 8 8.6l5.6-4.2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M2.4 13.8l.85-3.1A5.4 5.4 0 1 1 5.4 12.6L2.4 13.8Z" />
    </svg>
  );
}

/* The blurb is clamped to two lines with the rest behind a toggle, exactly as
   the reference does — the paragraph is long enough that it would otherwise
   set the height of the whole band. */
const BLURB = `Clothy Home is a small house in Chennai selling handloom sarees, kurta sets
and dress cloth by the metre. Everything is made in runs short enough that we know roughly
where each piece went, across seven workshops we have bought from for years. We publish the
town and, where they permit it, the workshop — because you should be able to check. Nothing
here is woven faster than the loom allows.`;

const QUICK = [
  ...CATEGORIES.map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
  { label: 'All pieces', to: '/shop' },
  ...COLLECTIONS.slice(0, 2).map((c) => ({ label: c.name, to: `/collection/${c.slug}` })),
];

const HOUSE = [
  { label: 'Our atelier', to: '/atelier' },
  { label: 'The weavers', to: '/atelier#weavers' },
  { label: 'Track an order', to: '/track' },
  { label: 'Your account', to: '/account' },
  { label: 'Saved pieces', to: '/wishlist' },
];

const POLICIES = [
  { label: 'Shipping & returns', to: '/atelier#shipping' },
  { label: 'Size & drape guide', to: '/atelier#sizing' },
  { label: 'Care of silk', to: '/atelier#care' },
  { label: 'Terms of service', to: '/atelier#terms' },
  { label: 'Privacy policy', to: '/atelier#privacy' },
];

function Column({ title, children, id }) {
  /* Open on desktop, and openable on a phone. CSS shows the body regardless
     above 760px, so this state only governs the narrow layout. */
  const [open, setOpen] = useState(false);
  return (
    <div className={`foot__col ${open ? 'is-open' : ''}`}>
      <h2 className="foot__colhead">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`foot-${id}`}
          onClick={() => setOpen((o) => !o)}
        >
          <span>{title}</span>
          <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
            <path
              d="M3.2 5.2 7 9l3.8-3.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h2>
      <div className="foot__colbody" id={`foot-${id}`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const { toast } = useStore();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    <footer className="footer">
      <div className="foot shell">
        {/* --- brand band --- */}
        <div className="foot__brand">
          <div className="foot__brandmain">
            <Link to="/" className="foot__logo" aria-label="Clothy Home, home">
              <Logo tone="dark" alt="" />
              <span className="sr-only">Clothy Home</span>
            </Link>
            <div className="foot__tagwrap">
              <p className={`foot__tag ${expanded ? 'is-open' : ''}`}>{BLURB}</p>
              <button type="button" className="foot__more" onClick={() => setExpanded((v) => !v)}>
                {expanded ? 'Read less' : 'Read more…'}
              </button>
            </div>
          </div>

          <div className="foot__contact">
            <a href={PHONE_HREF} className="foot__contact-row">
              <ContactMark id="phone" />
              {PHONE}
            </a>
            <a href={EMAIL_HREF} className="foot__contact-row">
              <ContactMark id="mail" />
              {EMAIL}
            </a>
          </div>
        </div>

        {/* --- columns --- */}
        <nav className="foot__cols" aria-label="Footer">
          <Column id="quick" title="Quick links">
            <ul className="foot__list">
              {QUICK.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </Column>

          <Column id="house" title="The house">
            <ul className="foot__list">
              {HOUSE.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </Column>

          <Column id="policies" title="Policies">
            <ul className="foot__list">
              {POLICIES.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </Column>

          <Column id="touch" title="Get in touch">
            <p className="foot__address">
              <strong>{ADDRESS[0]}</strong>
              {ADDRESS.slice(1).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <a href={PHONE_HREF} className="foot__line">
              <ContactMark id="phone" />
              {PHONE}
            </a>
            <a href={EMAIL_HREF} className="foot__line">
              <ContactMark id="mail" />
              {EMAIL}
            </a>
            <a
              href={WHATSAPP_HREF}
              className="foot__line"
              target="_blank"
              rel="noreferrer noopener"
            >
              <ContactMark id="whatsapp" />
              WhatsApp: {WHATSAPP}
            </a>
          </Column>

          <Column id="follow" title="Follow us">
            <ul className="foot__socials">
              {SOCIAL.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="foot__social"
                    aria-label={`Clothy Home on ${s.label}`}
                    title={s.label}
                  >
                    <SocialMark id={s.id} />
                  </a>
                </li>
              ))}
            </ul>

            {/* The reference has no newsletter; ours is kept, sized down to sit
                inside a column rather than heading the whole footer. */}
            <div className="foot__news">
              <p className="foot__newshead">A letter, most Thursdays</p>
              {done ? (
                <p className="foot__done serif-italic">Thank you — we will write soon.</p>
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
                  <button type="submit" aria-label="Subscribe">
                    <svg viewBox="0 0 20 10" width="18" height="10" aria-hidden="true">
                      <path d="M0 5h18M14 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.1" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </Column>
        </nav>
      </div>

      <div className="foot__base">
        <div className="shell foot__baseinner">
          <p>© {new Date().getFullYear()} Clothy Home, Chennai. All rights reserved.</p>
          <ul className="foot__legal">
            <li>
              <Link to="/atelier#terms">Terms</Link>
            </li>
            <li>
              <Link to="/atelier#privacy">Privacy</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
