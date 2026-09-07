import { Fragment, forwardRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { src, srcSet } from '../../data/images.js';
import { useInView, useMagnetic, useParallax } from '../../hooks/useMotion.js';

/* ==========================================================================
   Shared UI primitives
   ========================================================================== */

/**
 * Scroll-triggered reveal. Wraps children in a masked element that slides and
 * fades up once; `as` keeps the DOM semantic where a div would be wrong.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 26,
  blur = false,
  className = '',
  threshold,
  ...rest
}) {
  const [ref, inView] = useInView(threshold ? { threshold } : undefined);
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${blur ? 'reveal--blur' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, '--reveal-y': `${y}px` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Reveals a line of type behind a clipping mask, the way a fashion title
 * card resolves. Splits on words so long headings still wrap.
 */
export function RevealText({ text, as: Tag = 'span', delay = 0, stagger = 34, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.24 });
  const words = String(text).split(' ');
  return (
    <Tag ref={ref} className={`reveal-text ${inView ? 'is-in' : ''} ${className}`}>
      {words.map((word, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={`${word}-${i}`}>
          <span className="reveal-text__mask">
            <span className="reveal-text__word" style={{ '--rt-delay': `${delay + i * stagger}ms` }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/**
 * Image that fades up from its own blurred colour once decoded, so a slow
 * connection shows a warm plate rather than a white hole. `ratio` is
 * height / width and reserves the box before the file lands.
 */
export function Figure({
  image,
  alt = '',
  ratio = 1.25,
  width = 900,
  sizes = '(max-width: 760px) 92vw, 46vw',
  parallax = 0,
  className = '',
  eager = false,
  tone = '#e7ded0',
  children,
}) {
  const [loaded, setLoaded] = useState(false);
  const parallaxRef = useParallax(parallax);

  return (
    <div
      className={`figure ${loaded ? 'is-loaded' : ''} ${className}`}
      style={{ '--ratio': ratio, '--tone': tone }}
    >
      <div className="figure__inner" ref={parallax ? parallaxRef : undefined}>
        <img
          src={src(image, width, ratio)}
          srcSet={srcSet(image, ratio)}
          sizes={sizes}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={eager ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </div>
      {children}
    </div>
  );
}

/**
 * Button-shaped link or button with a magnetic pull and a wipe fill.
 *
 * The magnetic transform needs its own wrapper element, so `className` is
 * applied to that wrapper rather than to the control: callers are almost
 * always positioning the button in a layout (`flex: 1`, `width: 100%`), and a
 * class on the inner element cannot do that. Reach the control itself with a
 * descendant selector — `.my-class .btn`.
 */
export const MagneticButton = forwardRef(function MagneticButton(
  { children, to, href, variant = 'solid', size = 'md', className = '', magnetic = true, ...rest },
  forwarded,
) {
  const [wrapRef, innerRef] = useMagnetic({ strength: magnetic ? 0.3 : 0 });
  const cls = `btn btn--${variant} btn--${size}`;
  const body = (
    <span className="btn__inner" ref={innerRef}>
      <span className="btn__label">{children}</span>
    </span>
  );

  let control;
  if (to) {
    control = (
      <Link to={to} className={cls} ref={forwarded} {...rest}>
        {body}
      </Link>
    );
  } else if (href) {
    control = (
      <a href={href} className={cls} ref={forwarded} {...rest}>
        {body}
      </a>
    );
  } else {
    control = (
      <button type="button" className={cls} ref={forwarded} {...rest}>
        {body}
      </button>
    );
  }

  return (
    <span className={`btn-wrap ${className}`} ref={wrapRef}>
      {control}
    </span>
  );
});

/** Underline that draws in from the left on hover — used for text links. */
export function LinkLine({ to, href, children, className = '', ...rest }) {
  const inner = <span className="link-line__text">{children}</span>;
  if (to) {
    return (
      <Link to={to} className={`link-line ${className}`} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={`link-line ${className}`} {...rest}>
      {inner}
    </a>
  );
}

/** Section header used across nearly every page. */
export function SectionHead({ eyebrow, title, blurb, action, align = 'left', className = '' }) {
  return (
    <header className={`section-head section-head--${align} ${className}`}>
      <div className="section-head__main">
        {eyebrow ? (
          <Reveal as="p" className="eyebrow section-head__eyebrow">
            {eyebrow}
          </Reveal>
        ) : null}
        {title ? <RevealText as="h2" className="display d2 section-head__title" text={title} delay={60} /> : null}
        {blurb ? (
          <Reveal as="p" className="lead section-head__blurb" delay={180}>
            {blurb}
          </Reveal>
        ) : null}
      </div>
      {action ? (
        <Reveal className="section-head__action" delay={220}>
          {action}
        </Reveal>
      ) : null}
    </header>
  );
}

/** Five-mark rating readout. */
export function Stars({ value, count, className = '' }) {
  const pct = (value / 5) * 100;
  return (
    <span className={`stars ${className}`} title={`${value} out of 5`}>
      <span className="stars__track" aria-hidden="true">
        <span className="stars__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="stars__label num">
        {value.toFixed(1)}
        {count != null ? <span className="muted"> ({count})</span> : null}
      </span>
    </span>
  );
}

/** Small pill used for New / Best seller / % off. */
export function Tag({ children, tone = 'default', className = '' }) {
  return <span className={`tag tag--${tone} ${className}`}>{children}</span>;
}

/** Breadcrumb trail. */
export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label} className="crumbs__item">
          {item.to && i < items.length - 1 ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
          {i < items.length - 1 ? <span className="crumbs__sep">/</span> : null}
        </span>
      ))}
    </nav>
  );
}

/** Infinite marquee strip. Duplicates its content so the loop has no seam. */
export function Marquee({ items, speed = 42, className = '' }) {
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee__track" style={{ '--marquee-duration': `${speed}s` }}>
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy}>
            {items.map((item, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span className="marquee__item" key={`${copy}-${i}`}>
                {item}
                <i className="marquee__dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Numeric stepper for cart quantities. */
export function Stepper({ value, min = 1, max = 99, onChange, label = 'Quantity' }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <path d="M1 5.5h9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <span className="stepper__value num" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <path d="M1 5.5h9M5.5 1v9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}

/** Disclosure row used on the product page and in the footer. */
export function Accordion({ title, children, defaultOpen = false, id }) {
  const { hash } = useLocation();
  const [open, setOpen] = useState(defaultOpen);

  /* An `id` makes this panel linkable. Without it being rendered onto the
     element, /atelier#care scrolled nowhere; and a link that points at a panel
     should open it rather than leave the reader to find and click it. */
  const targeted = Boolean(id) && hash === `#${id}`;
  useEffect(() => {
    if (targeted) setOpen(true);
  }, [targeted]);

  return (
    <div id={id} className={`accordion ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="accordion__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="accordion__sign" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <div className="accordion__body" hidden={!open}>
        <div className="accordion__inner">{children}</div>
      </div>
    </div>
  );
}

/** Empty-state block for the cart, wishlist and no-result grids. */
export function EmptyState({ title, blurb, action }) {
  return (
    <div className="empty">
      <span className="empty__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="34" height="34">
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.4" />
          <path d="M12 24c3-5 13-5 16 0" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="15.5" cy="16" r="1.2" fill="currentColor" />
          <circle cx="24.5" cy="16" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <h2 className="display d3">{title}</h2>
      {blurb ? <p className="lead">{blurb}</p> : null}
      {action}
    </div>
  );
}
