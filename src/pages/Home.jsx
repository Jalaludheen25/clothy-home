import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORIES,
  COLLECTIONS,
  PRODUCTS,
  inCollection,
} from '../data/catalog.js';
import IMG, { src, srcSet } from '../data/images.js';
import {
  useInView,
  useParallax,
  useScrollProgress,
} from '../hooks/useMotion.js';
import {
  Figure,
  LinkLine,
  MagneticButton,
  Marquee,
  Reveal,
  RevealText,
  SectionHead,
} from '../components/ui/Primitives.jsx';
import { ProductGrid, ProductRail } from '../components/product/ProductCard.jsx';
import ShopTheLook from '../components/home/ShopTheLook.jsx';
import { useDarkHeader } from '../hooks/useHeaderTone.js';

/* ==========================================================================
   Home
   ========================================================================== */

/* Hero frames are chosen for how the headline sits on them as much as for the
   picture: the type is bottom-left, so anything bright there is out, however
   good the photograph. */
/* `focus` is the object-position for the full-bleed crop: a frame that is
   composed for portrait needs telling where its subject actually is, or the
   hero cuts the person off at the ankles. */
const HERO_SLIDES = [
  { image: IMG.sareeRoseCopperWall, kicker: 'Autumn / Winter', tone: '#4a1418', focus: '62% 12%' },
  { image: IMG.sareeBanarasiGold, kicker: 'The Zari Edit', tone: '#8d7444', focus: '58% 38%' },
  { image: IMG.editorialRouge, kicker: 'Bridal 2026', tone: '#4a2222', focus: '55% 40%' },
];

function Hero() {
  /* The outgoing frame is held at full opacity underneath while the incoming
     one fades in above it. Cross-fading both at once double-exposes the two
     photographs and turns the middle of the transition to mud. */
  const [slide, setSlide] = useState({ index: 0, prev: 0 });
  const [progressRef, progress] = useScrollProgress({ mode: 'exit' });
  const timer = useRef(0);

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setSlide((s) => ({ prev: s.index, index: (s.index + 1) % HERO_SLIDES.length }));
    }, 6200);
    return () => window.clearInterval(timer.current);
  }, []);

  const index = slide.index;

  return (
    <section className="hero" ref={progressRef} aria-label="Clothy Home">
      <div className="hero__media">
        {HERO_SLIDES.map((item, i) => (
          <div
            className={`hero__slide ${i === index ? 'is-on' : ''} ${
              i === slide.prev && i !== index ? 'is-out' : ''
            }`}
            key={item.kicker}
            style={{
              '--tone': item.tone,
              // The image drifts up and dims as the page scrolls past it.
              transform: `translate3d(0, ${progress * 16}%, 0) scale(${1 + progress * 0.14})`,
            }}
          >
            <img
              src={src(item.image, 1800, 1.28)}
              srcSet={srcSet(item.image, 1.28, [900, 1280, 1800, 2400])}
              sizes="100vw"
              alt=""
              style={{ objectPosition: item.focus }}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : 'low'}
              decoding="async"
            />
          </div>
        ))}
        <div className="hero__wash" aria-hidden="true" />
      </div>

      <div className="hero__body shell" style={{ opacity: 1 - progress * 1.5 }}>
        <p className="hero__kicker eyebrow">
          <span key={HERO_SLIDES[index].kicker}>{HERO_SLIDES[index].kicker}</span>
        </p>
        <h1 className="hero__title display display-hero">
          <span className="hero__line">
            <span>Woven</span>
          </span>
          <span className="hero__line">
            <em className="serif-italic">slowly,</em>
          </span>
          <span className="hero__line">
            <span>worn for</span>
          </span>
          <span className="hero__line">
            <span>a lifetime.</span>
          </span>
        </h1>

        <div className="hero__foot">
          <p className="hero__blurb">
            Handloom sarees, kurta sets and dress cloth by the metre — made in small
            runs across seven Indian workshops.
          </p>
          <div className="hero__actions">
            <MagneticButton to="/shop" variant="bone" size="lg">
              Shop Now
            </MagneticButton>
            <MagneticButton to="/collection/new-arrivals" variant="ghost" size="lg" className="hero__ghost">
              New arrivals
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className="hero__rail" aria-hidden="true">
        {HERO_SLIDES.map((item, i) => (
          <button
            type="button"
            key={item.kicker}
            className={`hero__tick ${i === index ? 'is-on' : ''}`}
            onClick={() => setSlide((s) => ({ prev: s.index, index: i }))}
            tabIndex={-1}
          >
            <i />
          </button>
        ))}
      </div>

      <span className="hero__scroll" aria-hidden="true">
        <em>Scroll</em>
        <i />
      </span>
    </section>
  );
}

function CategoryWall() {
  const cloth = CATEGORIES;

  return (
    <section className="wall section">
      <div className="shell">
        <SectionHead
          eyebrow="The rooms"
          title="Two ways into the wardrobe."
          blurb="Six yards on one side, stitched sets and cloth by the metre on the other. Most of our clients end up with both."
          action={<LinkLine to="/shop">All pieces</LinkLine>}
        />

        <div className="wall__grid">
          {cloth.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90} className={`wall__cell wall__cell--wide`}>
              <Link to={`/category/${c.slug}`} className="tileC">
                <Figure
                  image={c.hero}
                  alt={c.name}
                  ratio={0.66}
                  width={1280}
                  sizes="(max-width: 900px) 92vw, 48vw"
                  className="tileC__fig"
                />
                <span className="tileC__body">
                  <em className="eyebrow">{c.group}</em>
                  <strong className="display d2">{c.name}</strong>
                  <span className="tileC__tag serif-italic">{c.tagline}</span>
                </span>
                <span className="tileC__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 12" width="26" height="13">
                    <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}

        </div>
      </div>
    </section>
  );
}

function Feature() {
  const [ref, progress] = useScrollProgress();
  const inner = useParallax(0.12);

  return (
    <section className="feature on-ink" ref={ref}>
      <div className="feature__media">
        <div
          className="feature__img"
          style={{ transform: `scale(${1.14 - progress * 0.14})` }}
        >
          <img
            src={src(IMG.silkAmberDrape, 2000, 0.62)}
            srcSet={srcSet(IMG.silkAmberDrape, 0.62, [900, 1400, 2000])}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <span className="feature__scrim" aria-hidden="true" />
      </div>

      <div className="feature__body shell" ref={inner}>
        <Reveal as="p" className="eyebrow">
          Collection 02
        </Reveal>
        <RevealText as="h2" className="display d1 feature__title" text="Zari & Gold" delay={70} />
        <Reveal as="p" className="lead feature__blurb" delay={200}>
          Real zari is silver, drawn to a hair, gilded and wound onto silk. It costs what it
          costs because it is, quite literally, precious metal woven into cloth.
        </Reveal>
        <Reveal delay={280}>
          <MagneticButton to="/collection/zari-and-gold" variant="bone" size="lg">
            See the edit
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

function Editorial() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const drift = useParallax(0.1);

  return (
    <section className={`editorial section ${inView ? 'is-in' : ''}`} ref={ref}>
      <div className="shell editorial__grid">
        <div className="editorial__stack">
          <div className="editorial__plate editorial__plate--tall" ref={drift}>
            <Figure
              image={IMG.sareeMagentaWall}
              alt="A magenta mashru silk saree against a brick wall"
              ratio={1.42}
              width={900}
              sizes="(max-width: 900px) 88vw, 38vw"
              tone="#8c2f5a"
            />
          </div>
          <div className="editorial__plate editorial__plate--wide">
            <Figure
              image={IMG.sareeOchreCheck}
              alt="A checked silk saree, in shadow"
              ratio={0.74}
              width={900}
              sizes="(max-width: 900px) 60vw, 27vw"
              tone="#d3b48b"
            />
          </div>
        </div>

        <div className="editorial__text">
          <Reveal as="p" className="eyebrow">
            From the journal
          </Reveal>
          <RevealText
            as="h2"
            className="display d2 editorial__title"
            text="The six yards argument"
            delay={70}
          />
          <Reveal as="div" className="editorial__prose" delay={180}>
            <p>
              A saree has no size. It is the only major garment left that fits a body by
              being folded rather than cut — which is why one bought at twenty still works
              at sixty, and why it moves between generations without alteration.
            </p>
            <p>
              We think that is the most modern thing about it. Not nostalgia; engineering.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <LinkLine to="/category/sarees">Read the sarees</LinkLine>
          </Reveal>

          <Reveal className="editorial__quote" delay={340}>
            <blockquote>
              <p className="serif-italic">
                “I stopped counting the wears at about two hundred. The silk has only got
                better.”
              </p>
              <cite>Meera R. — Bengaluru, on the Tamra Katan</cite>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CollectionStrip() {
  return (
    <section className="strip section">
      <div className="shell">
        <SectionHead
          eyebrow="Edits"
          title="Six ways in."
          action={<LinkLine to="/shop">Browse everything</LinkLine>}
        />
      </div>
      <div className="strip__rail">
        <div className="strip__track">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60} className="strip__cell">
              <Link to={`/collection/${c.slug}`} className="tileS">
                <Figure
                  image={c.hero}
                  alt={c.name}
                  ratio={1.28}
                  width={760}
                  sizes="(max-width: 700px) 68vw, 25vw"
                  className="tileS__fig"
                />
                <span className="tileS__meta">
                  <em className="eyebrow">{c.kicker}</em>
                  <strong className="display d3">{c.name}</strong>
                  <span className="tileS__blurb muted">{c.blurb}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferBand() {
  return (
    <section className="band">
      <div className="shell band__inner">
        <div className="band__text">
          <Reveal as="p" className="eyebrow">
            Archive offers
          </Reveal>
          <RevealText as="h2" className="display d2" text="Last pieces, up to 30% off." delay={70} />
          <Reveal as="p" className="lead" delay={180}>
            One or two of each remain. When they go, the pattern is retired.
          </Reveal>
        </div>
        <Reveal delay={240}>
          <MagneticButton to="/collection/archive-sale" variant="line" size="lg">
            See what is left
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  useDarkHeader();

  const newArrivals = inCollection('new-arrivals').slice(0, 8);
  const best = [...PRODUCTS]
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 8);

  return (
    <>
      <Hero />

      <ShopTheLook />

      <Marquee
        className="band-marquee"
        items={[
          'Handwoven in India',
          'Small runs only',
          'Free delivery over ₹15,000',
          'Thirty-day returns',
          'Real zari',
        ]}
        speed={38}
      />

      <section className="section-tight">
        <div className="shell">
          <SectionHead
            eyebrow="Just off the loom"
            title="New arrivals"
            action={<LinkLine to="/collection/new-arrivals">All new pieces</LinkLine>}
          />
          <ProductRail products={newArrivals} />
        </div>
      </section>

      <CategoryWall />
      <Feature />
      <Editorial />

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="Most asked for"
            title="Best sellers"
            blurb="Reordered so often we keep the warps standing."
            action={<LinkLine to="/collection/best-sellers">See all</LinkLine>}
          />
          <ProductGrid products={best} cols={4} />
        </div>
      </section>

      <CollectionStrip />
      <OfferBand />
    </>
  );
}
