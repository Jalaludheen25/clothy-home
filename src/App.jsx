import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext.jsx';
import { SmoothScrollProvider, useLenis } from './hooks/useLenis.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import CartDrawer from './components/layout/CartDrawer.jsx';
import SearchOverlay from './components/layout/SearchOverlay.jsx';
import { Cursor, Preloader, RouteVeil, ScrollBar, Toasts } from './components/layout/Chrome.jsx';
import Home from './pages/Home.jsx';

/* Everything past the landing page is split out — the first paint only needs
   the home route, and the rest arrives while the visitor is still reading. */
const Shop = lazy(() => import('./pages/Shop.jsx'));
const Category = lazy(() => import('./pages/Category.jsx'));
const Collection = lazy(() => import('./pages/Collection.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const SearchResults = lazy(() => import('./pages/SearchResults.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const OrderTracking = lazy(() => import('./pages/OrderTracking.jsx'));
const Atelier = lazy(() => import('./pages/Atelier.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const TRANSITION_MS = 520;

/**
 * Holds the outgoing route on screen while the curtain closes, swaps the
 * page behind it, then opens again — so a route change reads as one move
 * rather than a flash of empty background.
 */
function Router({ booted }) {
  const location = useLocation();
  const lenis = useLenis();
  const [shown, setShown] = useState(location);
  const [playing, setPlaying] = useState(false);
  const first = useRef(true);
  /* Held in refs so they cannot become effect dependencies — see the note on
     the transition effect below. */
  const shownKey = useRef(location.key);
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (location.key === shownKey.current) return undefined;

    setPlaying(true);
    const swap = window.setTimeout(() => {
      shownKey.current = location.key;
      setShown(location);
      const l = lenisRef.current;
      if (location.hash) {
        // Let the new page mount, then move to the anchor.
        window.setTimeout(() => {
          const el = document.querySelector(location.hash);
          if (el) {
            if (l) l.scrollTo(el, { offset: -110, immediate: true });
            else el.scrollIntoView();
          }
        }, 40);
      } else if (l) {
        l.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }, TRANSITION_MS * 0.52);

    const open = window.setTimeout(() => setPlaying(false), TRANSITION_MS);
    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(open);
    };
    // Only a genuinely new location restarts this. The shown route and the
    // Lenis instance are read through refs on purpose: when they were
    // dependencies, swapping the route re-ran the effect and the cleanup
    // cancelled the timer that lifts the curtain — leaving every navigated
    // page under a full-screen black panel.
  }, [location]);

  /* A deep link carrying a hash — /atelier#care from a shared URL or a fresh
     tab — never reached its anchor: the effect above skips the first render,
     and Lenis owns scrolling so the browser's own fragment jump does not
     stick. It also has to wait for the preloader, which locks body scroll
     while it is up, and for the lazy route to mount — hence the retry. */
  const seeded = useRef(false);
  useEffect(() => {
    if (!booted || seeded.current) return undefined;
    const { hash } = window.location;
    if (!hash || hash.length < 2) return undefined;
    seeded.current = true;

    let tries = 0;
    let timer = 0;
    const seek = () => {
      let el = null;
      try {
        el = document.querySelector(hash);
      } catch {
        return; // a hash that is not a valid selector is not ours to handle
      }
      if (el) {
        const l = lenisRef.current;
        if (l) l.scrollTo(el, { offset: -110, immediate: true });
        else el.scrollIntoView();
        return;
      }
      if (tries++ < 24) timer = window.setTimeout(seek, 100);
    };
    timer = window.setTimeout(seek, 120);
    return () => window.clearTimeout(timer);
    // Runs once, on the first render after boot. Later hash changes go
    // through the transition effect above.
  }, [booted]);

  /* The veil covers the entire viewport, so a missed timer is a blank screen
     rather than a cosmetic glitch. This guarantees it always lifts. */
  useEffect(() => {
    if (!playing) return undefined;
    const bail = window.setTimeout(() => setPlaying(false), TRANSITION_MS + 400);
    return () => window.clearTimeout(bail);
  }, [playing]);

  return (
    <>
      <RouteVeil playing={playing} />
      <main id="main" className="main">
        <Suspense fallback={<div className="route-wait" aria-hidden="true" />}>
          <Routes location={shown}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/collection/:slug" element={<Collection />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            <Route path="/atelier" element={<Atelier />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}

function Shell() {
  const [booted, setBooted] = useState(false);
  const { cartOpen, searchOpen } = useStore();

  /* Hold the page still behind the preloader. */
  useEffect(() => {
    document.body.classList.toggle('is-booting', !booted);
    return () => document.body.classList.remove('is-booting');
  }, [booted]);

  return (
    <SmoothScrollProvider>
      {!booted ? <Preloader onDone={() => setBooted(true)} /> : null}
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollBar />
      <Cursor />
      <div className={`app ${booted ? 'is-ready' : ''} ${cartOpen || searchOpen ? 'is-veiled' : ''}`}>
        <Header />
        <Router booted={booted} />
        <Footer />
      </div>
      <CartDrawer />
      <SearchOverlay />
      <Toasts />
    </SmoothScrollProvider>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
