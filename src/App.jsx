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
function Router() {
  const location = useLocation();
  const lenis = useLenis();
  const [shown, setShown] = useState(location);
  const [playing, setPlaying] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (location.key === shown.key) return undefined;

    setPlaying(true);
    const swap = window.setTimeout(() => {
      setShown(location);
      if (location.hash) {
        // Let the new page mount, then move to the anchor.
        window.setTimeout(() => {
          const el = document.querySelector(location.hash);
          if (el) {
            if (lenis) lenis.scrollTo(el, { offset: -110, immediate: true });
            else el.scrollIntoView();
          }
        }, 40);
      } else if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }, TRANSITION_MS * 0.52);

    const open = window.setTimeout(() => setPlaying(false), TRANSITION_MS);
    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(open);
    };
  }, [location, shown.key, lenis]);

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
        <Router />
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
