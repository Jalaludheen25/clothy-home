import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { src, srcSet } from '../../data/images.js';
import { prefersReducedMotion } from '../../hooks/useMotion.js';

/* ==========================================================================
   Panel hero
   --------------------------------------------------------------------------
   Five portrait cards, each cycling its own photographs.

   A card may carry its own copy — a label, a title, a line and a call to
   action — set over the picture on a gradient. When it does the whole card is
   a link, and the photographs behind it are drawn from whatever that
   destination actually holds, so the pictures and the label agree.

   Portrait pictures in portrait slots is still the point: the slot matches
   the source, so `cover` has almost nothing to discard and the crop stops
   being a judgement call.

   One timer drives them all. Each tick advances a single card, moving along
   the row, so the group never flips at once — a card changes every
   `interval`, and any given card comes round every `interval * PANEL_COUNT`.

   `panels` takes either a plain array of image URLs (no copy — how the
   collection pages use it) or `{ images, kicker, title, line, cta }`.
   ========================================================================== */

export const PANEL_COUNT = 5;

export default function PanelHero({ panels, masthead, interval = 2600, className = '' }) {
  const [tick, setTick] = useState(0);

  /* Every card needs something to show even when a caller hands us fewer
     pictures than slots, so a short list borrows rather than leaving a hole. */
  const lanes = useMemo(() => {
    const all = (panels || []).flatMap((x) => (Array.isArray(x) ? x : x.images || []));
    const out = [];
    for (let i = 0; i < PANEL_COUNT; i += 1) {
      const raw = (panels && panels[i]) || [];
      const card = Array.isArray(raw) ? { images: raw } : raw;
      const images = card.images && card.images.length ? card.images : all.slice(i, i + 1);
      out.push({ ...card, images });
    }
    return out;
  }, [panels]);

  const still = prefersReducedMotion();

  useEffect(() => {
    if (still) return undefined;
    const id = window.setInterval(() => setTick((t) => t + 1), interval);
    return () => window.clearInterval(id);
  }, [interval, still]);

  return (
    <section className={`phero ${className}`} aria-label="Clothy Home">
      {masthead ? <div className="phero__masthead">{masthead}</div> : null}

      <div className="phero__panels">
        {lanes.map((card, i) => {
          /* This card has advanced once for every tick that landed on it. */
          const step = Math.floor((tick + (PANEL_COUNT - 1 - i)) / PANEL_COUNT);
          const count = card.images.length;
          const index = count ? step % count : 0;
          const prev = count ? (index - 1 + count) % count : 0;

          const linked = Boolean(card.cta);
          const Wrapper = linked ? Link : 'div';
          const wrapperProps = linked
            ? { to: card.cta.to, className: 'phero__panel phero__panel--card' }
            : { className: 'phero__panel' };

          return (
            <Wrapper key={card.title || i} {...wrapperProps}>
              <span className="phero__frames" aria-hidden="true">
                {card.images.map((image, j) => (
                  <img
                    className={`phero__img ${j === index ? 'is-on' : ''} ${
                      j === prev && prev !== index ? 'is-out' : ''
                    }`}
                    key={image}
                    src={src(image, 760, 1.66)}
                    srcSet={srcSet(image, 1.66, [360, 540, 760, 1040])}
                    sizes="(max-width: 700px) 78vw, (max-width: 1000px) 46vw, (max-width: 1300px) 31vw, 19vw"
                    alt=""
                    /* Only the opening frame of each card is worth blocking
                       on; the rest are wanted seconds later. */
                    loading={j === 0 ? 'eager' : 'lazy'}
                    fetchpriority={j === 0 && i === 0 ? 'high' : 'low'}
                    decoding="async"
                  />
                ))}
              </span>

              {linked ? (
                <>
                  <span className="phero__veil" aria-hidden="true" />
                  <span className="phero__copy">
                    {card.kicker ? <span className="phero__kicker">{card.kicker}</span> : null}
                    <span className="phero__cardtitle">{card.title}</span>
                    {card.line ? <span className="phero__line">{card.line}</span> : null}
                    <span className="phero__cta">
                      {card.cta.label}
                      <svg viewBox="0 0 18 8" width="17" height="8" aria-hidden="true">
                        <path
                          d="M0 4h16M12.6 1 16 4l-3.4 3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                </>
              ) : null}
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}
