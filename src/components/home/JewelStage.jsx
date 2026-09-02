import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR, inCategory } from '../../data/catalog.js';
import { src } from '../../data/images.js';
import { prefersReducedMotion, useInView } from '../../hooks/useMotion.js';
import { MagneticButton } from '../ui/Primitives.jsx';

/* ==========================================================================
   Jewel stage
   --------------------------------------------------------------------------
   A ring of product plates standing in real 3D space (preserve-3d, not a
   flat carousel faking depth). It turns on its own, snaps to the nearest
   plate when you let go, and can be dragged, wheeled or arrow-keyed.

   Everything is transform-only, so the whole thing stays on the compositor.
   ========================================================================== */

const PICKS = [
  'rajkumari-kundan-choker',
  'malli-temple-jhumka',
  'vajra-gold-cuff',
  'moti-baroque-pearl-necklace',
  'kundan-emerald-bangle-pair',
  'chandini-long-jhumka',
  'surya-gold-pendant-necklace',
  'chandi-silver-statement-choker',
];

export default function JewelStage() {
  const pool = [...inCategory('jewellery'), ...inCategory('necklaces'), ...inCategory('earrings'), ...inCategory('accessories')];
  const items = PICKS.map((slug) => pool.find((p) => p.slug === slug)).filter(Boolean);

  const [stageRef, inView] = useInView({ threshold: 0.24, once: false });
  const ringRef = useRef(null);
  const [active, setActive] = useState(0);

  /* Mutable turn state kept out of React — this updates every frame. */
  const turn = useRef({ angle: 0, velocity: 0, dragging: false, lastX: 0, idle: true });

  const count = items.length;
  const step = 360 / count;
  const radius = 330;

  const snapTo = useCallback(
    (index) => {
      turn.current.angle = -index * step;
      turn.current.velocity = 0;
      turn.current.idle = false;
      setActive(((index % count) + count) % count);
    },
    [step, count],
  );

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return undefined;

    const reduced = prefersReducedMotion();
    let frame = 0;
    let settleAt = 0;

    const render = (now) => {
      const t = turn.current;

      if (!t.dragging) {
        if (t.idle && inView && !reduced) {
          // Slow, continuous drift while nobody is touching it.
          t.angle -= 0.055;
        } else {
          t.angle += t.velocity;
          t.velocity *= 0.94;
          if (Math.abs(t.velocity) < 0.02) {
            t.velocity = 0;
            // Ease onto the nearest plate, then hand back to the drift.
            const nearest = Math.round(-t.angle / step);
            const target = -nearest * step;
            const delta = target - t.angle;
            if (Math.abs(delta) > 0.05) {
              t.angle += delta * 0.1;
              settleAt = now;
            } else if (now - settleAt > 2600) {
              t.idle = true;
            }
          }
        }
      }

      ring.style.transform = `translateZ(-${radius}px) rotateY(${t.angle}deg)`;

      const nearest = ((Math.round(-t.angle / step) % count) + count) % count;
      setActive((a) => (a === nearest ? a : nearest));

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [inView, step, count]);

  /* --- pointer drag ------------------------------------------------------- */

  const onPointerDown = (e) => {
    const t = turn.current;
    t.dragging = true;
    t.idle = false;
    t.lastX = e.clientX;
    t.velocity = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const t = turn.current;
    if (!t.dragging) return;
    const dx = e.clientX - t.lastX;
    t.lastX = e.clientX;
    t.angle += dx * 0.34;
    t.velocity = dx * 0.34;
  };

  const onPointerUp = (e) => {
    const t = turn.current;
    t.dragging = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      snapTo(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      snapTo(active - 1);
    }
  };

  const current = items[active];

  return (
    <section className="stage on-ink" ref={stageRef} aria-labelledby="stage-title">
      <div className="stage__glow" aria-hidden="true" />

      <div className="stage__head shell">
        <p className="eyebrow">The adornment room</p>
        <h2 className="display d1" id="stage-title">
          Turn it in
          <br />
          <span className="serif-italic">the light.</span>
        </h2>
      </div>

      <div
        className="stage__scene"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        role="group"
        aria-label="Jewellery showcase — drag or use arrow keys"
        tabIndex={0}
      >
        <div className="stage__ring" ref={ringRef}>
          {items.map((p, i) => (
            <Link
              to={`/product/${p.slug}`}
              className={`plate ${i === active ? 'is-front' : ''}`}
              key={p.slug}
              style={{
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              }}
              tabIndex={i === active ? 0 : -1}
              aria-hidden={i !== active}
              onClick={(e) => {
                // A drag that ends on a plate should not navigate.
                if (Math.abs(turn.current.velocity) > 0.6) e.preventDefault();
              }}
            >
              <span className="plate__img">
                <img src={src(p.images[0], 520, 1.2)} alt={p.name} loading="lazy" draggable="false" />
              </span>
              <span className="plate__shadow" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <div className="stage__floor" aria-hidden="true" />
      </div>

      <div className="stage__meta shell" aria-live="polite">
        <div className="stage__meta-text" key={current?.slug}>
          <p className="eyebrow">{current?.metal}</p>
          <h3 className="display d2">{current?.name}</h3>
          <p className="stage__price num">{current ? formatINR(current.price) : null}</p>
        </div>
        <div className="stage__meta-actions">
          <MagneticButton to={current ? `/product/${current.slug}` : '/category/jewellery'} variant="bone">
            View the piece
          </MagneticButton>
          <div className="stage__dots" role="tablist" aria-label="Choose a piece">
            {items.map((p, i) => (
              <button
                type="button"
                key={p.slug}
                className={`stage__dot ${i === active ? 'is-on' : ''}`}
                onClick={() => snapTo(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={p.name}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="stage__hint eyebrow" aria-hidden="true">
        Drag to turn
      </p>
    </section>
  );
}
