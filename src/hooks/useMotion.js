import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/* ==========================================================================
   Motion primitives
   --------------------------------------------------------------------------
   Every hook here degrades to "no animation, correct layout" when the visitor
   asks for reduced motion or when the browser lacks the observer, so nothing
   in the site depends on an effect having run to be readable.
   ========================================================================== */

const isBrowser = typeof window !== 'undefined';

export function prefersReducedMotion() {
  return isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Live-updating media query. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => isBrowser && window.matchMedia(query).matches);
  useEffect(() => {
    if (!isBrowser) return undefined;
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/**
 * Fires once when an element first crosses into view.
 * Returns [ref, inView]; the element is marked in-view immediately under
 * reduced motion so content never depends on scrolling to appear.
 */
export function useInView({ threshold = 0.16, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el || !isBrowser || !('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    if (prefersReducedMotion()) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Reports a 0→1 progress value for an element relative to the viewport,
 * driven off a shared rAF loop rather than a scroll listener.
 *
 * mode 'through' — 0 as the top edge enters from the bottom of the viewport,
 *   1 as the bottom edge leaves past the top. For mid-page bands that should
 *   animate across their whole travel.
 * mode 'exit' — 0 while the element's top is still at or below the viewport
 *   top, 1 once it has scrolled entirely past. This is what a hero wants: a
 *   'through' hero pinned to the top of the document would start life at 0.5.
 */
export function useScrollProgress({ mode = 'through' } = {}) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isBrowser || prefersReducedMotion()) return undefined;

    let frame = 0;
    let last = -1;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw =
        mode === 'exit'
          ? -rect.top / (rect.height || 1)
          : (vh - rect.top) / (vh + rect.height || 1);
      const next = Math.min(1, Math.max(0, raw));
      if (Math.abs(next - last) > 0.0015) {
        last = next;
        setProgress(next);
      }
      frame = window.requestAnimationFrame(measure);
    };

    frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  return [ref, progress];
}

/**
 * Vertical parallax. `speed` is the fraction of the element's travel to
 * offset by — 0.12 is a whisper, 0.4 is obvious.
 */
export function useParallax(speed = 0.14) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isBrowser || prefersReducedMotion()) return undefined;

    let frame = 0;
    let current = 0;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom > -200 && rect.top < vh + 200) {
        // -1 above centre, +1 below
        const centre = (rect.top + rect.height / 2 - vh / 2) / vh;
        const target = centre * speed * vh;
        current += (target - current) * 0.12; // ease toward target
        el.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      el.style.transform = '';
    };
  }, [speed]);

  return ref;
}

/**
 * Magnetic pull toward the cursor. Applied to a wrapper; an optional inner
 * element travels further for a slight parallax between label and frame.
 */
export function useMagnetic({ strength = 0.32, radius = 90, inner = 0.55 } = {}) {
  const ref = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isBrowser || prefersReducedMotion()) return undefined;
    if (window.matchMedia('(hover: none)').matches) return undefined;

    let frame = 0;
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let active = false;

    const render = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      el.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0)`;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${(pos.x * inner).toFixed(2)}px, ${(
          pos.y * inner
        ).toFixed(2)}px, 0)`;
      }
      if (active || Math.abs(pos.x) > 0.05 || Math.abs(pos.y) > 0.05) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = 0;
        el.style.transform = '';
        if (innerRef.current) innerRef.current.style.transform = '';
      }
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(rect.width, rect.height) / 2 + radius;
      if (dist < reach) {
        active = true;
        const falloff = 1 - dist / reach;
        target.x = dx * strength * falloff;
        target.y = dy * strength * falloff;
        start();
      } else if (active) {
        active = false;
        target.x = 0;
        target.y = 0;
        start();
      }
    };

    const onLeave = () => {
      active = false;
      target.x = 0;
      target.y = 0;
      start();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
      el.style.transform = '';
    };
  }, [strength, radius, inner]);

  return [ref, innerRef];
}

/**
 * Subtle 3D tilt toward the pointer. Writes CSS custom properties instead of
 * a transform so the consumer decides how to combine it with its own
 * transforms (product cards also scale their image on hover).
 */
export function useTilt({ max = 7, scale = 1, perspective = 900 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isBrowser || prefersReducedMotion()) return undefined;
    if (window.matchMedia('(hover: none)').matches) return undefined;

    let frame = 0;
    const state = { rx: 0, ry: 0, tx: 0, ty: 0 };
    const target = { rx: 0, ry: 0, tx: 0, ty: 0 };

    const render = () => {
      let moving = false;
      for (const k of ['rx', 'ry', 'tx', 'ty']) {
        const delta = target[k] - state[k];
        if (Math.abs(delta) > 0.002) moving = true;
        state[k] += delta * 0.13;
      }
      el.style.setProperty('--tilt-rx', `${state.rx.toFixed(3)}deg`);
      el.style.setProperty('--tilt-ry', `${state.ry.toFixed(3)}deg`);
      el.style.setProperty('--tilt-px', `${(state.tx * 100).toFixed(2)}%`);
      el.style.setProperty('--tilt-py', `${(state.ty * 100).toFixed(2)}%`);
      el.style.setProperty('--tilt-perspective', `${perspective}px`);
      frame = moving ? window.requestAnimationFrame(render) : 0;
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      target.ry = (px - 0.5) * 2 * max;
      target.rx = -(py - 0.5) * 2 * max;
      target.tx = px - 0.5;
      target.ty = py - 0.5;
      el.style.setProperty('--tilt-scale', String(scale));
      start();
    };

    const onLeave = () => {
      target.rx = 0;
      target.ry = 0;
      target.tx = 0;
      target.ty = 0;
      el.style.setProperty('--tilt-scale', '1');
      start();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [max, scale, perspective]);

  return ref;
}

/** Counts a number up once the element enters view. */
export function useCountUp(to, { duration = 1400, decimals = 0 } = {}) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) {
      setValue(to);
      return undefined;
    }
    let frame = 0;
    const started = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Number((to * eased).toFixed(decimals)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, decimals]);

  return [ref, value];
}

/** Locks body scroll while a drawer or overlay is open. */
export function useScrollLock(locked) {
  useLayoutEffect(() => {
    if (!locked || !isBrowser) return undefined;
    const { body } = document;
    const previous = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.classList.add('is-locked');
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.classList.remove('is-locked');
      body.style.paddingRight = previous;
    };
  }, [locked]);
}

/** Calls back on Escape. */
export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const on = (e) => {
      if (e.key === 'Escape') handler(e);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [handler, active]);
}

/** Traps Tab inside a container while it is open. */
export function useFocusTrap(active) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const root = ref.current;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

    const first = root.querySelector(selector);
    if (first) window.setTimeout(() => first.focus(), 60);

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const items = [...root.querySelectorAll(selector)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };

    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, [active]);

  return ref;
}

/** Debounces a rapidly changing value (search input, filter sliders). */
export function useDebounced(value, delay = 180) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Stable callback reference for handlers passed into effects. */
export function useEvent(fn) {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args) => ref.current?.(...args), []);
}
