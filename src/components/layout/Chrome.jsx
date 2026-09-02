import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { prefersReducedMotion } from '../../hooks/useMotion.js';
import { Logo } from '../ui/Logo.jsx';

/* ==========================================================================
   Chrome — preloader, page transition veil, cursor and toasts
   ========================================================================== */

/**
 * Opening sequence. Counts real decoded bytes where it can (the hero images
 * announce themselves), and always resolves on a timer so a stalled CDN can
 * never leave someone staring at a curtain.
 */
export function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const veil = document.getElementById('boot-veil');
    if (veil) veil.classList.add('is-gone');

    if (prefersReducedMotion()) {
      setProgress(100);
      onDone();
      return undefined;
    }

    const started = performance.now();
    const MIN = 1500; // long enough to read the mark, short enough not to annoy
    const MAX = 3600;

    let frame = 0;
    const tick = (now) => {
      const elapsed = now - started;
      const images = [...document.images];
      const decoded = images.filter((img) => img.complete).length;
      const byImages = images.length ? decoded / images.length : 1;
      const byTime = Math.min(1, elapsed / MIN);
      // Whichever is slower drives the bar, so it never runs ahead of reality.
      const target = Math.min(byTime, 0.35 + byImages * 0.65) * 100;

      setProgress((p) => Math.max(p, Math.min(100, target)));

      const ready = elapsed > MIN && (byImages > 0.7 || elapsed > MAX);
      if (ready && !done.current) {
        done.current = true;
        setProgress(100);
        window.setTimeout(() => setLeaving(true), 260);
        window.setTimeout(onDone, 1180);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <div className={`preloader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="preloader__panels">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="preloader__body">
        <div className="preloader__mark">
          <Logo tone="light" className="preloader__logo" alt="" />
        </div>
        <p className="preloader__line eyebrow">Handwoven in India</p>
        <div className="preloader__bar">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <p className="preloader__pct num">{String(Math.round(progress)).padStart(3, '0')}</p>
      </div>
    </div>
  );
}

/** Curtain that wipes across on every route change. */
export function RouteVeil({ playing }) {
  return (
    <div className={`veil ${playing ? 'is-playing' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

/** Trailing dot cursor that grows over interactive targets. Pointer devices only. */
export function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return undefined;

    const dotEl = dot.current;
    const ringEl = ring.current;
    if (!dotEl || !ringEl) return undefined;

    document.body.classList.add('has-cursor');

    const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    const trail = { ...pointer };
    let frame = 0;
    let visible = false;

    const render = () => {
      trail.x += (pointer.x - trail.x) * 0.16;
      trail.y += (pointer.y - trail.y) * 0.16;
      dotEl.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      ringEl.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!visible) {
        visible = true;
        dotEl.classList.add('is-on');
        ringEl.classList.add('is-on');
      }
      const target = e.target.closest?.('a, button, [role="button"], input, .card, .tilt');
      ringEl.classList.toggle('is-wide', Boolean(target));
    };

    const onLeave = () => {
      visible = false;
      dotEl.classList.remove('is-on');
      ringEl.classList.remove('is-on');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <span className="cursor-dot" ref={dot} aria-hidden="true" />
      <span className="cursor-ring" ref={ring} aria-hidden="true" />
    </>
  );
}

/** Transient confirmations, bottom-left, out of the way of the bag. */
export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className={`toast toast--${t.tone}`} key={t.id}>
          <span className="toast__mark" aria-hidden="true" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/** Thin brass progress line pinned to the top of the viewport. */
export function ScrollBar() {
  const bar = useRef(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return undefined;
    let frame = 0;
    const tick = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max)) : 0;
      el.style.transform = `scaleX(${p})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <span className="scrollbar" ref={bar} aria-hidden="true" />;
}
