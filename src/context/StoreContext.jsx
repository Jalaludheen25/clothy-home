import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { PRODUCTS, bySlug } from '../data/catalog.js';

/* ==========================================================================
   Store
   --------------------------------------------------------------------------
   Cart, wishlist, orders and the (pretend) signed-in client, held in one
   reducer and mirrored into localStorage so a reload does not lose a basket.
   Everything downstream reads derived totals rather than recomputing them.
   ========================================================================== */

const KEY = 'clothy-home::v1';
const StoreContext = createContext(null);

const EMPTY = {
  cart: [], // { slug, size, qty, addedAt }
  wishlist: [], // slug[]
  orders: [], // see placeOrder()
  user: null, // { name, email, phone, since }
  recentlyViewed: [], // slug[]
};

function load() {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw);
    return {
      ...EMPTY,
      ...saved,
      // Drop anything referring to a product that no longer exists.
      cart: (saved.cart || []).filter((l) => bySlug(l.slug)),
      wishlist: (saved.wishlist || []).filter((s) => bySlug(s)),
      recentlyViewed: (saved.recentlyViewed || []).filter((s) => bySlug(s)),
    };
  } catch {
    return EMPTY;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'cart/add': {
      const { slug, size = null, qty = 1 } = action;
      const at = state.cart.findIndex((l) => l.slug === slug && l.size === size);
      const product = bySlug(slug);
      const ceiling = product ? product.stock : 99;
      if (at > -1) {
        const cart = state.cart.slice();
        cart[at] = { ...cart[at], qty: Math.min(cart[at].qty + qty, ceiling) };
        return { ...state, cart };
      }
      return {
        ...state,
        cart: [...state.cart, { slug, size, qty: Math.min(qty, ceiling), addedAt: Date.now() }],
      };
    }
    case 'cart/qty': {
      const cart = state.cart
        .map((l) => {
          if (l.slug !== action.slug || l.size !== action.size) return l;
          const ceiling = bySlug(l.slug)?.stock ?? 99;
          return { ...l, qty: Math.max(0, Math.min(action.qty, ceiling)) };
        })
        .filter((l) => l.qty > 0);
      return { ...state, cart };
    }
    case 'cart/remove':
      return {
        ...state,
        cart: state.cart.filter((l) => !(l.slug === action.slug && l.size === action.size)),
      };
    case 'cart/clear':
      return { ...state, cart: [] };

    case 'wishlist/toggle':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.slug)
          ? state.wishlist.filter((s) => s !== action.slug)
          : [action.slug, ...state.wishlist],
      };
    case 'wishlist/remove':
      return { ...state, wishlist: state.wishlist.filter((s) => s !== action.slug) };

    case 'viewed/push':
      return {
        ...state,
        recentlyViewed: [action.slug, ...state.recentlyViewed.filter((s) => s !== action.slug)].slice(0, 8),
      };

    case 'order/place':
      return { ...state, orders: [action.order, ...state.orders], cart: [] };

    case 'user/sign-in':
      return { ...state, user: action.user };
    case 'user/sign-out':
      return { ...state, user: null };

    default:
      return state;
  }
}

/* --- pricing rules -------------------------------------------------------- */

const FREE_SHIPPING_OVER = 15000;
const SHIPPING_FLAT = 350;
const GST_RATE = 0.05; // 5% on textiles and apparel in India

export const PROMOS = {
  ATELIER10: { type: 'percent', value: 10, label: '10% off your order' },
  FIRSTDRAPE: { type: 'flat', value: 2000, label: '₹2,000 off orders over ₹20,000', min: 20000 },
};

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  /* UI surfaces that several distant components need to open. */
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [promo, setPromo] = useState(null);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private browsing, quota, or a browser blocking site data — the app
         works fine without persistence, so there is nothing to recover. */
    }
  }, [state]);

  const toast = useCallback((message, tone = 'default') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  /* --- actions ------------------------------------------------------------ */

  const addToCart = useCallback(
    (product, { size = null, qty = 1, silent = false, open = true } = {}) => {
      dispatch({ type: 'cart/add', slug: product.slug, size, qty });
      if (!silent) toast(`${product.name} added to bag`);
      if (open) setCartOpen(true);
    },
    [toast],
  );

  const setQty = useCallback((slug, size, qty) => dispatch({ type: 'cart/qty', slug, size, qty }), []);
  const removeLine = useCallback((slug, size) => dispatch({ type: 'cart/remove', slug, size }), []);
  const clearCart = useCallback(() => dispatch({ type: 'cart/clear' }), []);

  const toggleWishlist = useCallback(
    (product) => {
      const adding = !state.wishlist.includes(product.slug);
      dispatch({ type: 'wishlist/toggle', slug: product.slug });
      toast(adding ? `${product.name} saved` : `${product.name} removed from saved`);
    },
    [state.wishlist, toast],
  );

  const pushViewed = useCallback((slug) => dispatch({ type: 'viewed/push', slug }), []);

  const applyPromo = useCallback(
    (code) => {
      const key = String(code || '').trim().toUpperCase();
      const found = PROMOS[key];
      if (!found) {
        toast('That code is not recognised', 'error');
        return false;
      }
      setPromo({ code: key, ...found });
      toast(`${key} applied — ${found.label}`);
      return true;
    },
    [toast],
  );

  const signIn = useCallback(
    (user) => {
      dispatch({
        type: 'user/sign-in',
        user: { since: new Date().getFullYear(), ...user },
      });
      toast(`Welcome, ${user.name.split(' ')[0]}`);
    },
    [toast],
  );

  const signOut = useCallback(() => {
    dispatch({ type: 'user/sign-out' });
    toast('Signed out');
  }, [toast]);

  /* --- derived ------------------------------------------------------------ */

  const lines = useMemo(
    () =>
      state.cart
        .map((l) => {
          const product = bySlug(l.slug);
          return product ? { ...l, product, lineTotal: product.price * l.qty } : null;
        })
        .filter(Boolean),
    [state.cart],
  );

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const savings = lines.reduce(
      (s, l) => s + (l.product.compareAt ? (l.product.compareAt - l.product.price) * l.qty : 0),
      0,
    );

    let discount = 0;
    if (promo && subtotal > 0) {
      if (promo.min && subtotal < promo.min) discount = 0;
      else discount = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
      discount = Math.min(discount, subtotal);
    }

    const taxable = subtotal - discount;
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
    const tax = Math.round(taxable * GST_RATE);

    return {
      subtotal,
      savings,
      discount,
      shipping,
      tax,
      total: Math.max(0, taxable + shipping + tax),
      freeShippingGap: Math.max(0, FREE_SHIPPING_OVER - subtotal),
      freeShippingOver: FREE_SHIPPING_OVER,
      count: lines.reduce((s, l) => s + l.qty, 0),
    };
  }, [lines, promo]);

  const wishlistItems = useMemo(
    () => state.wishlist.map(bySlug).filter(Boolean),
    [state.wishlist],
  );

  const viewedItems = useMemo(
    () => state.recentlyViewed.map(bySlug).filter(Boolean),
    [state.recentlyViewed],
  );

  const placeOrder = useCallback(
    (details) => {
      const now = new Date();
      const id = `CH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        Math.floor(Math.random() * 90000) + 10000,
      )}`;
      /* Slowest item in the bag sets the dispatch date — nothing part-ships. */
      const lead = lines.reduce((m, l) => Math.max(m, l.product.days || 5), 3);
      const eta = new Date(now.getTime() + (lead + 3) * 86400000);

      const order = {
        id,
        placedAt: now.toISOString(),
        etaAt: eta.toISOString(),
        items: lines.map((l) => ({
          slug: l.slug,
          name: l.product.name,
          size: l.size,
          qty: l.qty,
          price: l.product.price,
          image: l.product.images[0],
        })),
        totals,
        ...details,
        stage: 0,
      };
      dispatch({ type: 'order/place', order });
      setPromo(null);
      return order;
    },
    [lines, totals],
  );

  const value = useMemo(
    () => ({
      ...state,
      lines,
      totals,
      wishlistItems,
      viewedItems,
      promo,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toggleWishlist,
      isSaved: (slug) => state.wishlist.includes(slug),
      pushViewed,
      applyPromo,
      clearPromo: () => setPromo(null),
      placeOrder,
      signIn,
      signOut,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      toasts,
      toast,
    }),
    [
      state,
      lines,
      totals,
      wishlistItems,
      viewedItems,
      promo,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toggleWishlist,
      pushViewed,
      applyPromo,
      placeOrder,
      signIn,
      signOut,
      cartOpen,
      searchOpen,
      toasts,
      toast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/* --- search --------------------------------------------------------------- */

/**
 * Small weighted search over the catalogue. Name matches beat colour matches
 * beat prose matches, so typing "gold" surfaces the gold pieces rather than
 * every product whose story happens to mention gold thread.
 */
export function searchProducts(query, limit = 24) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);

  return PRODUCTS.map((p) => {
    const haystacks = [
      [p.name.toLowerCase(), 10],
      [p.category, 6],
      [(p.fabric || '').toLowerCase(), 5],
      [p.colour.toLowerCase(), 4],
      [(p.occasion || []).join(' ').toLowerCase(), 3],
      [(p.origin || '').toLowerCase(), 2],
      [(p.story || '').toLowerCase(), 1],
    ];
    let score = 0;
    for (const term of terms) {
      let hit = 0;
      for (const [text, weight] of haystacks) {
        if (text.includes(term)) hit = Math.max(hit, weight);
      }
      if (!hit) return { p, score: 0 };
      score += hit;
    }
    if (p.name.toLowerCase().startsWith(q)) score += 8;
    return { p, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, limit)
    .map((r) => r.p);
}
