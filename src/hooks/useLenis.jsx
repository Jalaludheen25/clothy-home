import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { prefersReducedMotion } from './useMotion.js';

/* ==========================================================================
   Smooth scrolling
   --------------------------------------------------------------------------
   A single Lenis instance for the whole app, exposed through context so the
   header, drawers and route transitions can stop, start and jump the page
   without each holding their own reference.
   ========================================================================== */

const LenisContext = createContext(null);

export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null);
  const frame = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const instance = new Lenis({
      duration: 1.05,
      // A long, flat tail — the page keeps gliding a beat after the wheel stops.
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      syncTouch: false,
    });

    const loop = (time) => {
      instance.raf(time);
      frame.current = window.requestAnimationFrame(loop);
    };
    frame.current = window.requestAnimationFrame(loop);
    setLenis(instance);

    return () => {
      window.cancelAnimationFrame(frame.current);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  return useContext(LenisContext);
}

/** Pause smooth scrolling while an overlay owns the viewport. */
export function useLenisPaused(paused) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return undefined;
    if (paused) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [lenis, paused]);
}

/** Jump to the top, instantly — used between route changes. */
export function useScrollToTop(deps) {
  const lenis = useLenis();
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
