import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../data/catalog.js';
import { src, srcSet } from '../../data/images.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useInView, useTilt } from '../../hooks/useMotion.js';
import { Tag } from '../ui/Primitives.jsx';

/* ==========================================================================
   Product card
   --------------------------------------------------------------------------
   Hover swaps to the second photograph, tilts a few degrees toward the
   cursor, and lifts a quick-add bar. Touch devices get the still card and the
   bar permanently in place, since there is no hover to reveal it.
   ========================================================================== */

function Heart({ filled }) {
  return (
    <svg viewBox="0 0 20 18" width="15" height="14" aria-hidden="true">
      <path
        d="M10 16.5 2.9 9.6A4.1 4.1 0 0 1 10 4.2a4.1 4.1 0 0 1 7.1 5.4L10 16.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductCardBase({ product, index = 0, priority = false, size = 'md' }) {
  const { addToCart, toggleWishlist, isSaved } = useStore();
  const [revealRef, inView] = useInView({ threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  const tiltRef = useTilt({ max: 5.5 });
  const [hovered, setHovered] = useState(false);
  const saved = isSaved(product.slug);

  /* 4:5, matching the reference's product media. */
  const ratio = 1.25;
  const width = size === 'lg' ? 1100 : 760;
  const [front, back] = product.images;

  return (
    <article
      ref={revealRef}
      className={`card card--${size} ${inView ? 'is-in' : ''} ${hovered ? 'is-hovered' : ''}`}
      style={{ '--card-delay': `${Math.min(index, 7) * 70}ms` }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="card__frame" ref={tiltRef}>
        <Link
          to={`/product/${product.slug}`}
          className="card__media"
          style={{ '--ratio': ratio, '--tone': product.swatch }}
          aria-label={product.name}
        >
          <img
            className="card__img card__img--front"
            src={src(front, width, ratio)}
            srcSet={srcSet(front, ratio, [420, 640, 900, 1280])}
            sizes="(max-width: 640px) 46vw, (max-width: 1100px) 32vw, 24vw"
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          {back ? (
            <img
              className="card__img card__img--back"
              src={src(back, width, ratio)}
              srcSet={srcSet(back, ratio, [420, 640, 900])}
              sizes="(max-width: 640px) 46vw, (max-width: 1100px) 32vw, 24vw"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <span className="card__sheen" aria-hidden="true" />
        </Link>

        <div className="card__badges">
          {product.onOffer ? <Tag tone="offer">−{product.discount}%</Tag> : null}
          {product.isNew && !product.onOffer ? <Tag>New</Tag> : null}
          {product.limited ? <Tag tone="rare">Last one</Tag> : null}
        </div>

        <button
          type="button"
          className={`card__save ${saved ? 'is-saved' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
        >
          <Heart filled={saved} />
        </button>

        <div className="card__quick">
          <button
            type="button"
            className="card__quick-btn"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to bag' : 'Sold out'}
          </button>
        </div>
      </div>

      <div className="card__meta">
        <div className="card__line">
          <h3 className="card__name">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="card__price num">
            {product.compareAt ? (
              <span className="card__was">
                <span className="sr-only">Was </span>
                {formatINR(product.compareAt)}
              </span>
            ) : null}
            <span className="card__now">
              {product.compareAt ? <span className="sr-only">now </span> : null}
              {formatINR(product.price)}
            </span>
          </p>
        </div>
        <p className="card__sub muted">
          {product.fabric}
          <span className="card__dot" aria-hidden="true">
            ·
          </span>
          {product.colour}
        </p>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

/**
 * Responsive product grid. `cols` sets the desktop column count.
 *
 * `label` renders a visually-hidden h2 above the cards. Listing pages need it
 * because their cards (h3) would otherwise sit straight under the page h1 with
 * no level in between; pages where the grid already follows a SectionHead
 * leave it off.
 */
export function ProductGrid({ products, cols = 4, size = 'md', className = '', label }) {
  return (
    <>
      {label ? <h2 className="sr-only">{label}</h2> : null}
      <div className={`grid grid--${cols} ${className}`}>
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} size={size} priority={i < 4} />
        ))}
      </div>
    </>
  );
}

/**
 * A horizontally scrolling rail — used for related products and "recently
 * viewed", where a full grid would out-weigh the content around it.
 */
export function ProductRail({ products, className = '' }) {
  return (
    <div className={`rail ${className}`}>
      <div className="rail__track">
        {products.map((p, i) => (
          <div className="rail__cell" key={p.slug}>
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
