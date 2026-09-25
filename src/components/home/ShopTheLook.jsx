import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatINR, inCollection } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { prefersReducedMotion } from '../../hooks/useMotion.js';
import { MagneticButton } from '../ui/Primitives.jsx';

/* ==========================================================================
   Shop the Look — the homepage hero
   --------------------------------------------------------------------------
   An editorial split, built to the direction of the references: the words on
   the left in a column that lines up with the nav above it, the pieces on the
   right, and the piece in the middle carried across the whole section as a
   soft-focus backdrop that changes with it.

   What the references share, and what this takes from them: a photograph
   given the whole width; a headline set large and light in a serif, roman
   with one phrase in italic; a rule and a small tracked label above it; two
   square calls to action, one filled and one hairline; and nothing else. No
   ornament — the photograph and the type do the work.

   The carousel keeps everything it had: arrows, dots, keyboard, swipe, the
   plate with the piece's name and price, autoplay that holds while pointed
   at, and a card that opens its own product page. Only the dressing changed.

     card        4:5, the proportion the rest of the shop uses
     neighbours  0.86 scale, 0.62 card-widths out, dimmed
     beyond      out of sight and out of the tab order — a deck of three
                 reads as a deck; five read as a fan, which belonged to the
                 old design

   Each card takes a `video` if one is given and falls back to the
   photograph, so this is a video carousel the moment there are files to put
   in it. No product has one yet.
   ========================================================================== */

/* Height over width of a card, shared by the CSS box and the image crop so
   the CDN is never asked for a taller frame than the card shows. */
const RATIO = 1.25;

/* How far a neighbour sits from the middle, as a share of a full-size card. */
const STEP = 0.62;

/* The piece the hero opens on. Moved to the front of the ring rather than
   set as a starting index, so it also leads the sequence and the first dot is
   the lit one. If it ever leaves the pool the order is simply left alone. */
const LEAD = 'suvarna-banarasi-tissue-saree';

function state(offset) {
  if (offset === 0) return 'is-center';
  if (offset === 1) return 'is-next';
  if (offset === -1) return 'is-prev';
  return 'is-hidden';
}

export default function ShopTheLook() {
  const cards = useMemo(() => {
    /* The pieces people actually come for, newest first, deduped — nine is
       enough to turn through without repeating. */
    const pool = [...inCollection('best-sellers'), ...inCollection('new-arrivals')];
    const seen = new Set();
    const ordered = pool.filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
    /* Hoisted before the slice, so the lead piece is in the nine whatever its
       place in the collections. */
    const lead = ordered.findIndex((p) => p.slug === LEAD);
    if (lead > 0) ordered.unshift(...ordered.splice(lead, 1));
    return ordered.slice(0, 9);
  }, []);

  const [active, setActive] = useState(0);
  /* Reading a price on a card that slides away mid-sentence is the usual
     complaint about carousels, so pointing at it or tabbing into it holds it
     still. */
  const [held, setHeld] = useState(false);
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

  const piece = cards[active];

  return (
    <section className="spot on-ink" aria-labelledby="spot-title">
      {/* The piece in the middle, thrown across the whole section out of
          focus. Only the three cards in play are mounted, so turning the
          carousel never has more than three of these to hold, and the one
          going out stays long enough to fade under the one coming in. */}
      <div className="spot__scene" aria-hidden="true">
        {cards.map((p, i) => {
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          if (Math.abs(offset) > 1) return null;
          return (
            <img
              key={p.slug}
              className={`spot__back ${offset === 0 ? 'is-on' : ''}`}
              src={src(p.images[0], 1200, 0.62)}
              alt=""
              loading={offset === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          );
        })}
        <div className="spot__scrim" />
      </div>

      <div className="spot__inner">
        <header className="spot__copy">
          <p className="spot__eyebrow eyebrow">
            <span className="spot__rule" aria-hidden="true" />
            Handwoven in India
          </p>
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
                  style={{ '--shift': offset === 0 ? 0 : Math.sign(offset) * STEP }}
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
                        /* The card runs from about 230px on a small phone to
                           420px on a wide desktop, so at 2x the set has to
                           reach 840. Always hinted from above: over-fetching
                           costs bytes, under-fetching costs a soft
                           photograph, and this is the hero. */
                        srcSet={srcSet(product.images[0], RATIO, [360, 480, 640, 900, 1200])}
                        sizes="(max-width: 899px) 72vw, 26vw"
                        alt={product.name}
                        loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    )}
                  </Link>
                </article>
              );
            })}
          </div>

          {/* The plate sits under the deck rather than on the photograph: the
              name and the price are information, and at this size they no
              longer need to borrow the card's corner. */}
          <div className="spot__plate">
            <Link className="spot__chip" to={`/product/${piece.slug}`}>
              <span className="spot__chipname">{piece.name}</span>
              <span className="spot__chipprice num">{formatINR(piece.price)}</span>
            </Link>

            <div className="spot__controls">
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
              <div className="spot__arrows">
                <button type="button" className="spot__nav spot__nav--prev" onClick={() => go(-1)} aria-label="Previous">
                  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                    <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" className="spot__nav spot__nav--next" onClick={() => go(1)} aria-label="Next">
                  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                    <path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* The live region the dots and arrows speak through. */}
            <p className="spot__count num" aria-live="polite">
              <span className="sr-only">Showing </span>
              {active + 1} / {count}
            </p>
          </div>
        </div>
      </div>

      {/* A line that fills, the way the references mark the fold. Decoration
          only — the page scrolls perfectly well without it. */}
      <div className="spot__scroll" aria-hidden="true">
        <span className="spot__scrolllabel">Scroll</span>
        <span className="spot__scrollline" />
      </div>
    </section>
  );
}
