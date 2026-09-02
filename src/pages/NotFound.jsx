import { PRODUCTS } from '../data/catalog.js';
import { ProductRail } from '../components/product/ProductCard.jsx';
import {
  MagneticButton,
  Reveal,
  RevealText,
  SectionHead,
} from '../components/ui/Primitives.jsx';
import { useStore } from '../context/StoreContext.jsx';

/* ==========================================================================
   404
   ========================================================================== */

export default function NotFound() {
  const { setSearchOpen } = useStore();
  const picks = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 8);

  return (
    <div className="nf">
      <section className="nf__hero">
        <div className="shell">
          <Reveal as="p" className="eyebrow">
            Error 404
          </Reveal>
          <RevealText
            as="h1"
            className="display display-hero nf__title"
            text="A dropped thread."
            delay={70}
          />
          <Reveal as="p" className="lead nf__blurb" delay={200}>
            The page you were after is not here — it may have been an archive piece that sold,
            or a link that aged badly. Either way, the rest of the house is intact.
          </Reveal>
          <Reveal className="nf__acts" delay={280}>
            <MagneticButton to="/shop" variant="solid" size="lg">
              Browse everything
            </MagneticButton>
            <MagneticButton variant="line" size="lg" onClick={() => setSearchOpen(true)}>
              Search instead
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <SectionHead eyebrow="While you are here" title="The pieces people ask for" />
          <ProductRail products={picks} />
        </div>
      </section>
    </div>
  );
}
