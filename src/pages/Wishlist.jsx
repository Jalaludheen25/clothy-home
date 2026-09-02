import { PRODUCTS, formatINR } from '../data/catalog.js';
import { useStore } from '../context/StoreContext.jsx';
import { ProductGrid, ProductRail } from '../components/product/ProductCard.jsx';
import {
  Crumbs,
  EmptyState,
  MagneticButton,
  Reveal,
  RevealText,
  SectionHead,
} from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Wishlist
   ========================================================================== */

export default function Wishlist() {
  const { wishlistItems, addToCart, toast } = useStore();

  const total = wishlistItems.reduce((s, p) => s + p.price, 0);
  const available = wishlistItems.filter((p) => p.inStock);

  const addAll = () => {
    if (!available.length) return;
    available.forEach((p) =>
      addToCart(p, {
        size: p.sizes ? p.sizes[Math.min(2, p.sizes.length - 1)] : null,
        silent: true,
        open: false,
      }),
    );
    toast(`${available.length} pieces moved to your bag`);
  };

  const suggestions = PRODUCTS.filter(
    (p) => p.isBestSeller && !wishlistItems.some((w) => w.slug === p.slug),
  ).slice(0, 8);

  return (
    <div className="listing">
      <header className="listing__head listing__head--plain">
        <div className="shell">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Saved' }]} />
          <RevealText as="h1" className="display d1 listing__title" text="Saved pieces" />
          {wishlistItems.length > 0 ? (
            <Reveal as="div" className="wish__bar" delay={140}>
              <p className="lead">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'piece' : 'pieces'} ·{' '}
                <span className="num">{formatINR(total)}</span> in total
              </p>
              {available.length > 0 ? (
                <MagneticButton variant="line" onClick={addAll}>
                  Add all in stock to bag
                </MagneticButton>
              ) : null}
            </Reveal>
          ) : null}
        </div>
      </header>

      <div className="shell">
        {wishlistItems.length > 0 ? (
          <ProductGrid products={wishlistItems} cols={4} className="wish__grid" label="Saved pieces" />
        ) : (
          <EmptyState
            title="Nothing saved yet"
            blurb="Tap the heart on any piece and it will wait here — across visits, on this device."
            action={
              <MagneticButton to="/shop" variant="line">
                Start browsing
              </MagneticButton>
            }
          />
        )}
      </div>

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="While you are here"
            title={wishlistItems.length ? 'You might also keep these' : 'Most asked for'}
          />
          <ProductRail products={suggestions} />
        </div>
      </section>
    </div>
  );
}
