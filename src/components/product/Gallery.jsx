import { useCallback, useRef, useState } from 'react';
import { src, srcSet } from '../../data/images.js';
import { useEscape, useMediaQuery, useScrollLock } from '../../hooks/useMotion.js';

/* ==========================================================================
   Product gallery
   --------------------------------------------------------------------------
   One large frame with a thumbnail rail, a position counter, and
   hover-to-magnify — the conventional premium arrangement, where the earlier
   stacked column made the buy panel scroll away while you were still looking.
   Phones keep a snapping reel. Both open a full-screen lightbox with pan.
   ========================================================================== */

const ZOOM = 2.35;

function Lightbox({ images, index, onClose, onStep, alt }) {
  const [pan, setPan] = useState({ x: 50, y: 50 });
  useScrollLock(true);
  useEscape(onClose);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPan({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${alt}, enlarged`}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
          <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={() => onStep(-1)}
        aria-label="Previous image"
      >
        <svg viewBox="0 0 24 12" width="24" height="12" aria-hidden="true">
          <path d="M24 6H2M7 1L2 6l5 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>

      <div className="lightbox__stage" onMouseMove={onMove} onMouseLeave={() => setPan({ x: 50, y: 50 })}>
        <img
          src={src(images[index], 2000)}
          alt={alt}
          style={{ transformOrigin: `${pan.x}% ${pan.y}%` }}
          draggable="false"
        />
      </div>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={() => onStep(1)}
        aria-label="Next image"
      >
        <svg viewBox="0 0 24 12" width="24" height="12" aria-hidden="true">
          <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>

      <p className="lightbox__count num">
        {index + 1} / {images.length}
      </p>
    </div>
  );
}

export default function Gallery({ images, alt, tone }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [loaded, setLoaded] = useState({});
  const [reel, setReel] = useState(0);
  const canZoom = useMediaQuery('(hover: hover) and (min-width: 1000px)');
  const frame = useRef(null);
  const reelRef = useRef(null);

  const step = (delta) => setIndex((i) => (i + delta + images.length) % images.length);

  const onMove = useCallback((e) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin(
      `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  }, []);

  const onReelScroll = () => {
    const el = reelRef.current;
    if (!el) return;
    setReel(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <>
      {/* Desktop / tablet: main frame plus a thumbnail rail. */}
      <div className="gal">
        <div className="gal__thumbs" role="tablist" aria-label="Product images">
          {images.map((image, i) => (
            <button
              type="button"
              key={image}
              role="tab"
              aria-selected={i === index}
              aria-label={`View ${i + 1} of ${images.length}`}
              className={`gal__thumb ${i === index ? 'is-on' : ''}`}
              style={{ '--tone': tone }}
              onClick={() => setIndex(i)}
              onMouseEnter={() => setIndex(i)}
            >
              <img src={src(image, 200, 1.25)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>

        <div className="gal__main">
          <button
            type="button"
            ref={frame}
            className={`gal__frame ${zoomed ? 'is-zoomed' : ''} ${loaded[index] ? 'is-loaded' : ''}`}
            style={{ '--tone': tone, '--zoom': ZOOM, '--origin': origin }}
            onMouseEnter={() => canZoom && setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={canZoom ? onMove : undefined}
            onClick={() => setOpen(true)}
            aria-label={`${alt} — open enlarged`}
          >
            {images.map((image, i) => (
              <img
                key={image}
                className={i === index ? 'is-on' : ''}
                src={src(image, 1200, 1.25)}
                srcSet={srcSet(image, 1.25, [640, 900, 1280, 1800])}
                sizes="(max-width: 999px) 92vw, 44vw"
                alt={i === index ? alt : ''}
                aria-hidden={i !== index}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                onLoad={() => setLoaded((l) => (l[i] ? l : { ...l, [i]: true }))}
                onError={() => setLoaded((l) => ({ ...l, [i]: true }))}
              />
            ))}

            {canZoom ? (
              <span className="gal__cue" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="13" height="13">
                  <circle cx="7" cy="7" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M11 11l4 4M7 4.6v4.8M4.6 7h4.8" stroke="currentColor" strokeWidth="1.1" />
                </svg>
                Hover to zoom
              </span>
            ) : null}
          </button>

          <p className="gal__count num" aria-live="polite">
            {index + 1} <span aria-hidden="true">/</span>
            <span className="sr-only">of</span> {images.length}
          </p>
        </div>
      </div>

      {/* Phone: a snapping reel. */}
      <div className="reel">
        <div className="reel__track" ref={reelRef} onScroll={onReelScroll}>
          {images.map((image, i) => (
            <button
              type="button"
              className="reel__cell"
              key={image}
              style={{ '--tone': tone }}
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              aria-label={`${alt} — view ${i + 1}, open enlarged`}
            >
              <img
                src={src(image, 900, 1.25)}
                srcSet={srcSet(image, 1.25, [640, 900, 1280])}
                sizes="100vw"
                alt={`${alt} — view ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
          ))}
        </div>
        <div className="reel__dots" aria-hidden="true">
          {images.map((image, i) => (
            <span key={image} className={i === reel ? 'is-on' : ''} />
          ))}
        </div>
      </div>

      {open ? (
        <Lightbox images={images} index={index} alt={alt} onClose={() => setOpen(false)} onStep={step} />
      ) : null}
    </>
  );
}
