import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, formatINR, inCollection } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { prefersReducedMotion } from '../../hooks/useMotion.js';

/* ==========================================================================
   Shop the Look — spotlight carousel
   --------------------------------------------------------------------------
   Built to the reference site's video carousel, measured off it at 1440px:

     card        260x462 at centre — 9:16, the vertical video ratio
     radius      20px
     neighbours  0.858 scale, a slight turn away, 0.9 opacity
     far pair    0.727 scale, turned further, 0.6 opacity
     beyond      0.5 scale, transparent, out of the tab order
     nav         44px round buttons either side of the track
     chip        a small product plate — thumbnail, name, price — on the
                 centre card only

   Each card takes a `video` if one is given and falls back to the
   photograph, so this is a video carousel the moment there are files to put
   in it. The reference streams HLS from Mux; ours has no video assets, so
   every card currently shows its still. Nothing here is copied from the
   reference — the measurements are, the media is ours.
   ========================================================================== */

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
  const count = cards.length;
  const trackRef = useRef(null);

  const go = useCallback(
    (delta) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  /* Arrow keys work when the carousel has focus — it is a control, not an
     image, and reaching it by keyboard should let you turn it. */
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  const still = prefersReducedMotion();
  useEffect(() => {
    if (still || count < 2) return undefined;
    const id = window.setInterval(() => go(1), 5200);
    return () => window.clearInterval(id);
  }, [go, still, count]);

  if (!count) return null;

  return (
    <section className="spot" aria-labelledby="spot-title">
      <header className="spot__header">
        <h2 className="spot__title" id="spot-title">
          Shop the Look
        </h2>
      </header>

      <div className="spot__stage">
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
          ref={trackRef}
          role="group"
          aria-label="Shop the look"
          tabIndex={0}
          onKeyDown={onKey}
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
                      src={product.video}
                      poster={src(product.images[0], 540, 1.777)}
                      muted
                      loop
                      playsInline
                      autoPlay={centre}
                      preload={centre ? 'auto' : 'none'}
                    />
                  ) : (
                    <img
                      className="spot__media"
                      src={src(product.images[0], 540, 1.777)}
                      srcSet={srcSet(product.images[0], 1.777, [300, 420, 540, 760])}
                      sizes="(max-width: 700px) 62vw, 260px"
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

      <p className="spot__count num" aria-live="polite">
        <span className="sr-only">Showing </span>
        {active + 1} / {count}
      </p>
    </section>
  );
}
