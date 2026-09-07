import IMG from '../data/images.js';
import { useParallax, useScrollProgress } from '../hooks/useMotion.js';
import {
  Accordion,
  Crumbs,
  Figure,
  MagneticButton,
  Reveal,
  RevealText,
  SectionHead,
} from '../components/ui/Primitives.jsx';
import { src, srcSet } from '../data/images.js';
import { useDarkHeader } from '../hooks/useHeaderTone.js';

/* ==========================================================================
   Atelier — the about / help page
   ========================================================================== */

const WEAVERS = [
  {
    name: 'The Subramanian family',
    place: 'Kanchipuram, Tamil Nadu',
    since: '1961',
    note: 'Three generations on the same four pit looms. They weave our Kanjivarams and refuse to work faster than eleven picks a minute.',
    image: IMG.craftHandFabric,
  },
  {
    name: 'Ansari Karkhana',
    place: 'Varanasi, Uttar Pradesh',
    since: '1974',
    note: 'Kadhua Banarasi, with real gold zari drawn in the same lane. Eighty-one days for a bridal tissue is normal here.',
    image: IMG.fabricZariBorder,
  },
  {
    name: 'Begum & daughters',
    place: 'Lucknow, Uttar Pradesh',
    since: '1988',
    note: 'Chikankari across a cooperative of forty-two women, paid by the stitch rather than the piece.',
    image: IMG.fabricChikankari,
  },
  {
    name: 'Kota Weavers' + String.fromCharCode(39) + ' Collective',
    place: 'Kota, Rajasthan',
    since: '1979',
    note: 'Kota doria on throw-shuttle looms — a square check so fine the finished cloth is almost weightless.',
    image: IMG.fabricChikankari,
  },
];

const PRINCIPLES = [
  {
    n: '01',
    title: 'We buy time, not stock',
    body: 'A weaver is paid for their months before the warp is dressed. It costs us more and it means the loom is never rushed to hit a price.',
  },
  {
    n: '02',
    title: 'Small runs, named makers',
    body: 'Nothing runs past forty pieces. Every product page carries the town and, where they permit it, the workshop.',
  },
  {
    n: '03',
    title: 'Natural where it matters',
    body: 'Madder, indigo and pomegranate for the cottons. We do not pretend the silks are all vegetable-dyed — some colours simply are not.',
  },
  {
    n: '04',
    title: 'Made to outlast us',
    body: 'We repair anything we made, for as long as we exist. Refolding a silk is free and we would rather you asked.',
  },
];

export default function Atelier() {
  useDarkHeader();
  const [heroRef, progress] = useScrollProgress({ mode: 'exit' });
  const plateA = useParallax(0.1);
  const plateB = useParallax(-0.08);

  return (
    <div className="atelier">
      <header className="ahero" ref={heroRef}>
        <div
          className="ahero__media"
          style={{ transform: `translate3d(0, ${progress * 13}%, 0) scale(${1.1 + progress * 0.09})` }}
        >
          <img
            src={src(IMG.craftHandFabric, 1800, 0.7)}
            srcSet={srcSet(IMG.craftHandFabric, 0.7, [900, 1400, 1800, 2400])}
            sizes="100vw"
            alt=""
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <span className="ahero__scrim" aria-hidden="true" />
        <div className="shell ahero__body">
          <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Atelier' }]} />
          <RevealText
            as="h1"
            className="display display-hero ahero__title"
            text="The atelier"
            delay={60}
          />
          <Reveal as="p" className="lead ahero__blurb" delay={200}>
            Chennai, since 1998. Seven workshops, twenty-seven families, and a stubborn
            refusal to call anything handloom that isn&rsquo;t.
          </Reveal>
        </div>
      </header>

      <section className="section" id="story">
        <div className="shell astory">
          <div className="astory__text">
            <Reveal as="p" className="eyebrow">
              How it began
            </Reveal>
            <RevealText
              as="h2"
              className="display d1 astory__title"
              text="One saree, sold badly, in Mylapore."
              delay={70}
            />
            <Reveal as="div" className="astory__prose" delay={180}>
              <p>
                In 1998 our founder sold a Kanjivaram at a loss because she had not understood
                what the weaver had actually done. She went back, asked, and spent the next
                three years learning to read a loom before selling another.
              </p>
              <p>
                That is still roughly the method. We do not design from a mood board and send
                it out for manufacture. We sit with weavers, look at what their looms are built
                for, and commission inside those limits — which is why our range is narrower
                than most and why the pieces last.
              </p>
              <p>
                The dress fabrics came later, in 2009, for the same reason: clients kept asking
                where to find cloth of the same standard by the metre, and we did not have a good
                answer.
              </p>
            </Reveal>
          </div>

          <div className="astory__plates">
            <div ref={plateA}>
              <Figure
                image={IMG.fabricBrocadePlum}
                alt="Brocade weave detail"
                ratio={1.3}
                width={760}
                sizes="(max-width: 900px) 44vw, 24vw"
                tone="#5b3161"
              />
            </div>
            <div ref={plateB}>
              <Figure
                image={IMG.fabricCreamFold}
                alt="Folded cream silk"
                ratio={1.15}
                width={640}
                sizes="(max-width: 900px) 40vw, 21vw"
                tone="#d9c39e"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section on-ink aprinciples">
        <div className="shell">
          <SectionHead eyebrow="How we work" title="Four rules we do not bend." />
          <div className="prin">
            {PRINCIPLES.map((p, i) => (
              <Reveal className="prin__cell" key={p.n} delay={i * 90}>
                <p className="prin__n display">{p.n}</p>
                <h3 className="prin__title display d3">{p.title}</h3>
                <p className="prin__body">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="weavers">
        <div className="shell">
          <SectionHead
            eyebrow="The makers"
            title="Who actually makes it."
            blurb="Four of the seven workshops we commission from. The others prefer not to be named, which we respect."
          />
          <div className="weavers">
            {WEAVERS.map((w, i) => (
              <Reveal className="weaver" key={w.name} delay={i * 80}>
                <Figure
                  image={w.image}
                  alt=""
                  ratio={1.15}
                  width={760}
                  sizes="(max-width: 900px) 46vw, 23vw"
                  className="weaver__fig"
                />
                <div className="weaver__body">
                  <p className="eyebrow">Since {w.since}</p>
                  <h3 className="display d3">{w.name}</h3>
                  <p className="weaver__place serif-italic">{w.place}</p>
                  <p className="weaver__note">{w.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" id="help">
        <div className="shell-narrow">
          <SectionHead eyebrow="Practical things" title="Everything else" align="centre" />

          <div className="ahelp" id="sizing">
            <Accordion title="Size & drape guide" defaultOpen>
              <p>
                <strong>Sarees</strong> come as 5.5 metres plus an 0.8 metre blouse piece, and fit
                any body — the length is the same for everyone. If you are over 5&prime;8&Prime; and
                want a longer pallu, ask us and we will source a 6.3 metre cut.
              </p>
              <p>
                <strong>Kurta sets</strong> run XS to XXL against a standard Indian fit. Our kurtas
                sit slightly longer than most — mid-calf on a 5&prime;5&Prime; frame. Bust
                measurements: XS 32&Prime;, S 34&Prime;, M 36&Prime;, L 38&Prime;, XL 41&Prime;,
                XXL 44&Prime;.
              </p>
              <p>
                <strong>Unstitched fabric</strong> is cut generously — 2.5 to 3 metres for a top,
                with the border running along the selvedge so a tailor can place it without waste.
                Tell us if you need a longer cut and we will send it.
              </p>
            </Accordion>

            <Accordion title="Shipping & returns" id="shipping">
              <p>
                Insured, tracked delivery is complimentary within India on orders over ₹15,000 and
                ₹350 below that. Express is ₹900 and white-glove hand delivery in Chennai, Mumbai,
                Delhi and Bengaluru is ₹2,400.
              </p>
              <p>
                International orders are quoted at checkout. Duties are the recipient&rsquo;s
                responsibility and vary by country.
              </p>
              <p>
                Unworn pieces with tags intact may be returned within thirty days for a full
                refund. Made-to-order and altered pieces are final sale, as is cut cloth once it
                has left the bolt.
              </p>
            </Accordion>

            <Accordion title="Care of silk" id="care">
              <p>
                Dry clean only, and as rarely as you can bear. Silk does not need washing so much
                as airing — hang it in shade for a few hours after wearing and most of what you
                are worried about will leave on its own.
              </p>
              <p>
                Store folded in muslin, never plastic, and refold along a different line every six
                months. Zari cracks where a fold sits for years. Keep naphthalene away from real
                zari; it dulls the gilding.
              </p>
            </Accordion>

            <Accordion title="Real zari, and how to tell">
              <p>
                Real zari is silver drawn into wire, gilded, then wound onto a silk core. It is
                heavy, it tarnishes rather than flakes, and it costs what it costs because it is
                precious metal woven into cloth.
              </p>
              <p>
                Tested zari carries a hallmark on the bolt. Where a piece uses half-fine or
                tested zari rather than pure, the product page says so.
              </p>
            </Accordion>

            <Accordion title="Repairs & alterations" id="terms">
              <p>
                We repair anything we made, for as long as we are in business. Re-tipping a zari
                border, darning a small pull, re-hemming a kurta — send it to the studio and we
                will quote before doing anything. Within the first year, most small repairs are
                free.
              </p>
            </Accordion>

            <Accordion title="Privacy" id="privacy">
              <p>
                This storefront is a demonstration. Your bag, saved pieces, orders and any details
                you enter are kept in your own browser&rsquo;s local storage and are never
                transmitted to a server. Clearing site data removes all of it.
              </p>
            </Accordion>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell band__inner">
          <div className="band__text">
            <Reveal as="p" className="eyebrow">
              Visit
            </Reveal>
            <RevealText as="h2" className="display d2" text="The studio, by appointment." delay={70} />
            <Reveal as="p" className="lead" delay={170}>
              12 Kutchery Road, Mylapore, Chennai 600004. Tuesday to Saturday, 11am–6pm. We will
              have the kettle on and the archive open.
            </Reveal>
          </div>
          <Reveal delay={230}>
            <MagneticButton href="mailto:studio@clothyhome.in" variant="line" size="lg">
              Ask for a time
            </MagneticButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
