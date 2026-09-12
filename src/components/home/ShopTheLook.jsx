import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatINR, inCollection, toHsl } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { prefersReducedMotion } from '../../hooks/useMotion.js';

/* ==========================================================================
   Shop the Look — the homepage hero
   --------------------------------------------------------------------------
   The coverflow was built to the reference site's video carousel, measured
   off it at 1440px. What carries over is the shape of the fan, which is held
   as ratios so it survives the card being resized:

     card        9:16, the vertical video ratio
     neighbours  0.858 scale, 0.55 card-widths out, turned away, 0.9 opacity
     far pair    0.727 scale, 0.96 out, turned further, 0.6 opacity
     beyond      0.5 scale, parked at the middle, transparent, out of the
                 tab order — so a card blooms outward rather than appearing
                 at the edge
     chip        a product plate — thumbnail, name, price — on the centre
                 card only

   What does not carry over is the size. The reference's card is a fixed
   260px; as a hero this one is sized from the viewport in CSS, so it fills
   the fold on a laptop without pushing the controls below it. The stylesheet
   holds that sum.

   Each card takes a `video` if one is given and falls back to the
   photograph, so this is a video carousel the moment there are files to put
   in it. The reference streams HLS from Mux; ours has no video assets, so
   every card currently shows its still. Nothing here is copied from the
   reference — the measurements are, the media is ours.
   ========================================================================== */

/* A swatch is the cloth's own colour, and those run from #efe4d4 to #141216.
   Used raw as a light, the first would wash the screen out and the second
   would not show at all. Keep the hue — that is the part that belongs to the
   piece — and pull saturation and lightness into a band that reads on ink. */
function glow(hex) {
  const [h, s, l] = toHsl(hex);
  const sat = Math.round(Math.min(0.7, Math.max(0.36, s)) * 100);
  const lit = Math.round(Math.min(0.54, Math.max(0.36, l)) * 100);
  return `hsl(${Math.round(h)} ${sat}% ${lit}%)`;
}

/* How far a slot sits from the middle, as a share of a full-size card.
   Measured off the reference, whose neighbour centres land 0.55 card-widths
   out and whose far pair land 0.96 — the fan overlaps heavily, which is what
   gives it depth. Spread them further and it stops reading as one stack. */
const STEP_NEAR = 0.55;
const STEP_FAR = 0.96;

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
      className="spot on-ink"
      aria-labelledby="spot-title"
      style={{ '--spot-glow': glow(cards[active].swatch) }}
    >
      <div className="spot__ground" aria-hidden="true" />
      <div className="spot__glow" aria-hidden="true" />

      <header className="spot__header">
        <p className="spot__eyebrow eyebrow">As worn</p>
        <h1 className="spot__title" id="spot-title">
          Shop the <em>Look</em>
        </h1>
        <p className="spot__line">Photographed as they are worn.</p>
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
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
            <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
                      poster={src(product.images[0], 900, 1.777)}
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
                      src={src(product.images[0], 640, 1.777)}
                      /* The card runs from 179px on a small phone to 560px on
                         a wide desktop, so at 2x the set has to reach 1120.
                         The hint tracks the CSS sum loosely and always from
                         above — over-fetching costs bytes, under-fetching
                         costs a soft photograph, and this is the hero. */
                      srcSet={srcSet(product.images[0], 1.777, [360, 480, 640, 900, 1200, 1500])}
                      sizes="(max-width: 620px) 72vw, (max-width: 1500px) 34vw, 560px"
                      alt={product.name}
                      loading={Math.abs(offset) <= 2 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  )}

                  {centre ? (
                    <span className="spot__chip">
                      <img
                        className="spot__chipimg"
                        src={src(product.images[0], 120, 1)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
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
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
            <path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
        <p className="spot__count num" aria-live="polite">
          <span className="sr-only">Showing </span>
          {active + 1} / {count}
        </p>
      </div>
    </section>
  );
}
