import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatINR, inCollection, toHsl } from '../../data/catalog.js';
import IMG, { src, srcSet } from '../../data/images.js';
import { prefersReducedMotion } from '../../hooks/useMotion.js';
import { MagneticButton } from '../ui/Primitives.jsx';
import { FloralSprig, GoldWave, LeafSprig, Lotus, Mandala, Peacock } from './HeroOrnaments.jsx';

/* ==========================================================================
   Shop the Look — the homepage hero
   --------------------------------------------------------------------------
   Built to a reference mock, then dressed in red velvet: deep crimson and
   burgundy with a pressed jaal at the edges, gold botanical line art at
   the edges, a lotus over a ruled eyebrow, a serif title with a gilded
   italic, a fan of gold-framed cards, and a gold wave with a lotus at its
   lowest point closing the whole thing off.

   The fan is measured off that mock at 1280px and held as ratios, so it
   survives the card being resized:

     card        5:7 — shorter than the 9:16 video frame this used to be
     neighbours  0.858 scale, 0.47 card-widths out, dimmed, not turned
     far pair    0.739 scale, 0.85 out, dimmed further
     beyond      0.5 scale, parked at the middle, transparent, out of the
                 tab order — so a card blooms outward rather than appearing
                 at the edge
     plate       a lotus, the name in italic serif, the price — centre card
                 only

   The mock shows neither Shop Now nor New Arrivals, and still carries the old
   copy; both of those are later decisions and stay. The size of the card is
   the stylesheet's sum, not a number here.

   Each card takes a `video` if one is given and falls back to the
   photograph, so this is a video carousel the moment there are files to put
   in it. No product has one yet.
   ========================================================================== */

/* Height over width of a card, shared by the CSS box and the image crop so
   the CDN is never asked for a taller frame than the card shows. */
const RATIO = 1.4;

/* The silk behind everything: a crimson drape from the catalogue's own
   fabric shots, tinted to the house maroon in CSS. A landscape crop for wide
   windows and a portrait one for phones, so neither is a thin slice of the
   other blown up. */
const SILK = {
  '--silk-wide': `url("${src(IMG.silkCrimson, 1800, 0.62)}")`,
  '--silk-tall': `url("${src(IMG.silkCrimson, 900, 1.8)}")`,
};

/* The light behind the fan still answers to the piece in the middle, but it
   stays inside the velvet's palette: a dark saree lights it deep crimson, a
   pale one lights it gold, and everything between runs along that single
   warm line. Taking the swatch's own hue put violet and teal light on red
   velvet, which is exactly what a red-and-gold room should never have. */
function glow(hex) {
  const [, , l] = toHsl(hex);
  const t = Math.min(1, Math.max(0, (l - 0.1) / 0.75));
  const hue = Math.round((352 + 48 * t) % 360);
  const sat = Math.round(62 + 8 * t);
  const lit = Math.round(34 + 18 * t);
  return `hsl(${hue} ${sat}% ${lit}%)`;
}

/* How far a slot sits from the middle, as a share of a full-size card.
   Measured off the mock: neighbour centres 0.47 card-widths out, the far pair
   0.85. Tighter than a turned coverflow needs, because flat cards do not
   foreshorten — spread these wider and the fan falls apart into a row. */
const STEP_NEAR = 0.47;
const STEP_FAR = 0.85;

function state(offset) {
  if (offset === 0) return 'is-center';
  if (offset === 1) return 'is-next';
  if (offset === -1) return 'is-prev';
  if (offset === 2) return 'is-far-next';
  if (offset === -2) return 'is-far-prev';
  return 'is-hidden';
}

function shift(offset) {
  const away = Math.sign(offset);
  const step = Math.abs(offset);
  if (step === 0) return 0;
  if (step === 1) return away * STEP_NEAR;
  if (step === 2) return away * STEP_FAR;
  /* Anything further back waits at the middle at half scale, out of sight, so
     it blooms outward into the far slot rather than appearing at the edge. */
  return 0;
}

export default function ShopTheLook() {
  const cards = useMemo(() => {
    /* The pieces people actually come for, newest first, deduped — nine is
       enough to turn through without repeating. */
    const pool = [...inCollection('best-sellers'), ...inCollection('new-arrivals')];
    const seen = new Set();
    return pool
      .filter((p) => {
        if (seen.has(p.slug)) return false;
        seen.add(p.slug);
        return true;
      })
      .slice(0, 9);
  }, []);

  const [active, setActive] = useState(0);
  /* Reading a price on a card that slides away mid-sentence is the usual
     complaint about carousels, so pointing at it or tabbing into it holds it
     still. */
  const [held, setHeld] = useState(false);
  /* The coloured light drifts and the sheen crosses the silk continuously, so
     both stop while the hero is scrolled out of sight — there is no reason to
     keep compositing a banner nobody is looking at. */
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  /* A finger drag across the cards. Held in refs rather than state because
     nothing on screen depends on a gesture in progress, and re-rendering nine
     cards on every pointermove would make the drag stutter. */
  const drag = useRef(null);
  const swiped = useRef(false);
  const count = cards.length;

  const go = useCallback(
    (delta) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    swiped.current = false;
    drag.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e) => {
    const from = drag.current;
    drag.current = null;
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    /* Anything that travelled was a drag, whichever way it went, and the
       click that follows it must not open whichever card the finger happened
       to lift over — scrolling the page with a thumb on a card was opening
       that card. */
    if (Math.hypot(dx, dy) > 10) swiped.current = true;
    /* Only a decisive sideways one turns the carousel; the rest was the page
       being scrolled past. */
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  };

  /* Arrow keys work when the carousel has focus — it is a control, not an
     image, and reaching it by keyboard should let you turn it. */
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  const still = prefersReducedMotion();
  useEffect(() => {
    if (still || held || count < 2) return undefined;
    const id = window.setInterval(() => go(1), 5200);
    return () => window.clearInterval(id);
  }, [go, still, held, count]);

  if (!count) return null;

  return (
    <section
      ref={sectionRef}
      className={`spot on-ink ${inView ? '' : 'is-offscreen'}`}
      aria-labelledby="spot-title"
      style={{ '--spot-glow': glow(cards[active].swatch), ...SILK }}
    >
      {/* The ground, back to front: burgundy, the drape's folds, the velvet's
          crush and pile, a jaal pressed into it at the edges, warm light
          drifting across, the piece's own light, a sheen, then shade that
          keeps the type legible. */}
      <div className="spot__ground" aria-hidden="true" />
      <div className="spot__silk" aria-hidden="true" />
      <div className="spot__velvet" aria-hidden="true" />
      <div className="spot__jaal" aria-hidden="true" />
      <div className="spot__aura" aria-hidden="true">
        <span className="spot__hue spot__hue--crimson" />
        <span className="spot__hue spot__hue--gold" />
        <span className="spot__hue spot__hue--ember" />
        <span className="spot__hue spot__hue--wine" />
      </div>
      <div className="spot__glow" aria-hidden="true" />
      <div className="spot__sheen" aria-hidden="true" />
      <div className="spot__shade" aria-hidden="true" />

      <Mandala className="spot__orn spot__orn--mandala" />
      <FloralSprig className="spot__orn spot__orn--floral" />
      <LeafSprig className="spot__orn spot__orn--leaf" />
      <Peacock className="spot__orn spot__orn--peacock" />

      <div className="spot__wave" aria-hidden="true">
        <GoldWave className="spot__wavepath" />
        <Lotus className="spot__wavelotus" />
      </div>

      <header className="spot__header">
        <Lotus className="spot__lotus" />
        <p className="spot__eyebrow eyebrow">Handwoven in India</p>
        <h1 className="spot__title" id="spot-title">
          Silk, <em>worn well</em>
        </h1>
        {/* The looms named here are the catalogue's own — the saree category
            copy says the same — so the hero promises nothing the shop does not. */}
        <p className="spot__line">
          From the looms of Kanchipuram, Varanasi and Bhagalpur, finished in Kozhikode.
        </p>
        <div className="spot__actions">
          <MagneticButton to="/shop" variant="bone" size="md">
            Shop Now
          </MagneticButton>
          <MagneticButton to="/collection/new-arrivals" variant="line" size="md">
            New Arrivals
          </MagneticButton>
        </div>
      </header>

      <div
        className="spot__stage"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        <button
          type="button"
          className="spot__nav spot__nav--prev"
          onClick={() => go(-1)}
          aria-label="Previous"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="spot__track"
          role="group"
          aria-label="Shop the look"
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { drag.current = null; }}
          /* An <img> and an <a> both start a native drag, and that drag
             cancels the pointer stream the swipe is riding on. */
          onDragStart={(e) => e.preventDefault()}
        >
          {cards.map((product, i) => {
            /* Shortest way round the ring, so the far side wraps rather than
               travelling the whole length of the list. */
            let offset = i - active;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;

            const cls = state(offset);
            const hidden = cls === 'is-hidden';
            const centre = cls === 'is-center';

            return (
              <article
                className={`spot__card ${cls}`}
                key={product.slug}
                style={{ '--shift': shift(offset), '--tone': product.swatch }}
                aria-hidden={hidden ? 'true' : undefined}
              >
                <Link
                  to={`/product/${product.slug}`}
                  className="spot__cardbtn"
                  tabIndex={hidden ? -1 : 0}
                  onClick={(e) => {
                    /* The click that follows a drag is the drag, not a
                       choice of piece. */
                    if (swiped.current) {
                      e.preventDefault();
                      return;
                    }
                    /* A card off to the side brings itself to the middle
                       first — clicking through to a piece you cannot see
                       properly is a misfire, not a choice. */
                    if (!centre) {
                      e.preventDefault();
                      setActive(i);
                    }
                  }}
                >
                  {product.video ? (
                    <video
                      className="spot__media"
                      draggable={false}
                      src={product.video}
                      poster={src(product.images[0], 900, RATIO)}
                      muted
                      loop
                      playsInline
                      autoPlay={centre}
                      preload={centre ? 'auto' : 'none'}
                    />
                  ) : (
                    <img
                      className="spot__media"
                      draggable={false}
                      src={src(product.images[0], 640, RATIO)}
                      /* The card runs from under 200px on a small phone to
                         560px on a wide desktop, so at 2x the set has to reach
                         1120. The hint tracks the CSS sum loosely and always
                         from above — over-fetching costs bytes, under-fetching
                         costs a soft photograph, and this is the hero. */
                      srcSet={srcSet(product.images[0], RATIO, [360, 480, 640, 900, 1200, 1500])}
                      sizes="(max-width: 620px) 72vw, (max-width: 1500px) 34vw, 560px"
                      alt={product.name}
                      loading={Math.abs(offset) <= 2 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  )}

                  {centre ? (
                    <span className="spot__chip">
                      <Lotus className="spot__chiplotus" />
                      <span className="spot__chiptext">
                        <span className="spot__chipname">{product.name}</span>
                        <span className="spot__chipprice num">{formatINR(product.price)}</span>
                      </span>
                    </span>
                  ) : null}
                </Link>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="spot__nav spot__nav--next"
          onClick={() => go(1)}
          aria-label="Next"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="spot__foot">
        <div className="spot__ticks" role="tablist" aria-label="Choose a piece">
          {cards.map((product, i) => (
            <button
              type="button"
              key={product.slug}
              role="tab"
              className={`spot__tick ${i === active ? 'is-on' : ''}`}
              aria-selected={i === active}
              aria-label={product.name}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
        {/* The mock has dots only. The count stays for screen readers, which
            is who the live region was for in the first place. */}
        <p className="spot__count num" aria-live="polite">
          <span className="sr-only">Showing </span>
          {active + 1} / {count}
        </p>
      </div>
    </section>
  );
}
