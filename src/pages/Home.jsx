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
  useCountUp,
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
import JewelStage from '../components/home/JewelStage.jsx';
import { useDarkHeader } from '../hooks/useHeaderTone.js';

/* ==========================================================================
   Home
   ========================================================================== */

const HERO_SLIDES = [
  { image: IMG.editorialMist, kicker: 'Autumn / Winter', tone: '#b9b3ad' },
  { image: IMG.sareeBanarasiGold, kicker: 'The Zari Edit', tone: '#8d7444' },
  { image: IMG.editorialLightRay, kicker: 'Bridal 2026', tone: '#6d4a3c' },
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
            Handloom sarees, dress cloth by the metre and fine adornment — made in
            small runs across seven Indian workshops.
          </p>
          <div className="hero__actions">
            <MagneticButton to="/shop" variant="bone" size="lg">
              Enter the house
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

function Manifesto() {
  const plateA = useParallax(0.09);
  const plateB = useParallax(-0.07);

  return (
    <section className="manifesto section">
      <div className="shell manifesto__grid">
        <div className="manifesto__lead">
          <Reveal as="p" className="eyebrow">
            Est. 1998 — Chennai
          </Reveal>
          <RevealText
            as="h2"
            className="display d1 manifesto__title"
            text="We buy the loom time, not the fabric."
            delay={80}
          />
          <Reveal as="p" className="lead manifesto__body" delay={220}>
            Most of what is sold as handloom in India is powerloom with a story attached. We
            work the other way round: we pay for a weaver&rsquo;s months before a single
            thread is on the frame, and we take whatever the loom gives us — which is why
            some pieces exist only once.
          </Reveal>
          <Reveal delay={300}>
            <LinkLine to="/atelier" className="manifesto__link">
              How we work
            </LinkLine>
          </Reveal>
        </div>

        <div className="manifesto__plates">
          <div className="manifesto__plate manifesto__plate--a" ref={plateA}>
            <Figure
              image={IMG.craftHandFabric}
              alt="A weaver's hands smoothing cloth"
              ratio={1.32}
              width={760}
              sizes="(max-width: 900px) 44vw, 27vw"
              tone="#c9ab86"
            />
          </div>
          <div className="manifesto__plate manifesto__plate--b" ref={plateB}>
            <Figure
              image={IMG.fabricZariBorder}
              alt="Gold zari border detail"
              ratio={1.18}
              width={620}
              sizes="(max-width: 900px) 40vw, 22vw"
              tone="#b4954f"
            />
          </div>
        </div>
      </div>

      <div className="manifesto__stats shell">
        {[
          { to: 27, suffix: '', label: 'Weaving families on retainer' },
          { to: 81, suffix: ' days', label: 'Longest single piece on the loom' },
          { to: 7, suffix: '', label: 'Workshops across four states' },
          { to: 1998, suffix: '', label: 'First saree sold, in Mylapore', plain: true },
        ].map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}

function Stat({ to, suffix = '', label, plain }) {
  const [ref, value] = useCountUp(to, { duration: plain ? 1700 : 1300 });
  return (
    <div className="stat" ref={ref}>
      <p className="stat__num display">
        {plain ? Math.round(value) : Math.round(value)}
        {suffix}
      </p>
      <p className="stat__label">{label}</p>
    </div>
  );
}

function CategoryWall() {
  const [cloth, adorn] = [
    CATEGORIES.filter((c) => c.group === 'Cloth'),
    CATEGORIES.filter((c) => c.group === 'Adornment'),
  ];

  return (
    <section className="wall section">
      <div className="shell">
        <SectionHead
          eyebrow="The rooms"
          title="Two halves of one wardrobe."
          blurb="Cloth on one side, adornment on the other. Most of our clients end up crossing between them."
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

          {adorn.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80} className="wall__cell">
              <Link to={`/category/${c.slug}`} className="tileC tileC--sm">
                <Figure
                  image={c.hero}
                  alt={c.name}
                  ratio={1.22}
                  width={760}
                  sizes="(max-width: 900px) 46vw, 24vw"
                  className="tileC__fig"
                />
                <span className="tileC__body">
                  <strong className="display d3">{c.name}</strong>
                  <span className="tileC__tag serif-italic">{c.tagline}</span>
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
            src={src(IMG.fabricWovenGold, 2000, 0.62)}
            srcSet={srcSet(IMG.fabricWovenGold, 0.62, [900, 1400, 2000])}
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
              image={IMG.detailBangleFabric}
              alt="Bangles resting on printed silk"
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

      <Manifesto />

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
      <JewelStage />

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
