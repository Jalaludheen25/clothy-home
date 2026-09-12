import { useLayoutEffect } from 'react';

/**
 * Pages that open on a full-bleed dark hero call this so the fixed header
 * knows to draw itself in light ink until the visitor scrolls past it. Pass
 * false where the same page can also open on a light hero.
 * Kept as a body attribute rather than context because the header sits above
 * the router and would otherwise need a provider around every route.
 */
export function useDarkHeader(active = true) {
  useLayoutEffect(() => {
    if (!active) return undefined;
    document.body.dataset.headerTone = 'light';
    return () => {
      delete document.body.dataset.headerTone;
    };
  }, [active]);
}

/**
 * Checkout draws its own wordmark and order rail, so the global header and
 * footer stand down — fewer ways out of a payment flow, and no duplicate mark.
 */
export function useMinimalChrome() {
  useLayoutEffect(() => {
    document.body.dataset.chrome = 'minimal';
    return () => {
      delete document.body.dataset.chrome;
    };
  }, []);
}
