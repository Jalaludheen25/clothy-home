import { useId } from 'react';

/* ==========================================================================
   Gold line art for the homepage hero
   --------------------------------------------------------------------------
   Drawn here rather than shipped as images: a lotus, a mandala, a flowering
   sprig, a leaf sprig, a peacock by a lotus pond, and the wave that closes
   the hero. All of it is thin gold stroke on nothing, so it scales cleanly,
   tints from one gradient, and costs a few kilobytes.

   The sprigs are built from their stems outward. Each stem is a run of cubic
   Béziers, and every leaf is placed at a point on that curve and turned to
   its tangent — so a leaf always grows out of the stem it belongs to, instead
   of floating near where a hand-typed coordinate guessed the stem would be.

   Every mark is decoration. Each SVG is aria-hidden and unfocusable.
   ========================================================================== */

/* React ids contain colons, which are legal in a fragment but fragile inside
   url() in an SVG attribute. */
function useGoldId() {
  return `gold${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

function Gold({ id, x1 = 0, y1 = 0, x2, y2 }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
      <stop offset="0" stopColor="#f6e2ad" />
      <stop offset="0.45" stopColor="#d4a95f" />
      <stop offset="1" stopColor="#9c7236" />
    </linearGradient>
  );
}

const r1 = (n) => Math.round(n * 10) / 10;

/* --- curve helpers -------------------------------------------------------- */

function pointOn(seg, t) {
  const u = 1 - t;
  return [0, 1].map(
    (k) => u * u * u * seg[0][k] + 3 * u * u * t * seg[1][k] + 3 * u * t * t * seg[2][k] + t * t * t * seg[3][k],
  );
}

function angleOn(seg, t) {
  const u = 1 - t;
  const d = [0, 1].map(
    (k) => 3 * u * u * (seg[1][k] - seg[0][k]) + 6 * u * t * (seg[2][k] - seg[1][k]) + 3 * t * t * (seg[3][k] - seg[2][k]),
  );
  return (Math.atan2(d[1], d[0]) * 180) / Math.PI;
}

function pathOf(segs) {
  return segs
    .map((s, i) => `${i === 0 ? `M${s[0][0]} ${s[0][1]}` : ''}C${s[1].join(' ')} ${s[2].join(' ')} ${s[3].join(' ')}`)
    .join('');
}

/* A leaf grows along +x from its base at the origin. */
const LEAF = 'M0 0C14 -11 34 -12 48 0C34 10 14 11 0 0Z';
const RIB = 'M3 0H42';

function Leaf({ at, angle, scale }) {
  return (
    <g transform={`translate(${r1(at[0])} ${r1(at[1])}) rotate(${r1(angle)}) scale(${scale})`}>
      <path d={LEAF} />
      <path d={RIB} />
    </g>
  );
}

function Flower({ cx, cy, size, petals = 6 }) {
  const L = size;
  const petal = `M0 0C${r1(L * 0.34)} ${r1(-L * 0.34)} ${r1(L * 0.3)} ${r1(-L * 0.82)} 0 ${-L}C${r1(-L * 0.3)} ${r1(-L * 0.82)} ${r1(-L * 0.34)} ${r1(-L * 0.34)} 0 0Z`;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {Array.from({ length: petals }, (_, i) => (
        <path key={i} d={petal} transform={`rotate(${(360 / petals) * i})`} />
      ))}
      <circle r={r1(L * 0.2)} />
      <circle r={r1(L * 0.07)} className="orn-fill" />
    </g>
  );
}

/* --- lotus ---------------------------------------------------------------- */

export function Lotus({ className = '' }) {
  const id = useGoldId();
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <Gold id={id} x2={48} y2={32} />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 3C29.5 9.5 29.5 19 24 26C18.5 19 18.5 9.5 24 3Z" />
        <path d="M24 26C22.5 18.5 17 12.5 10 11.5C10 18.5 15.5 24 24 26Z" />
        <path d="M24 26C25.5 18.5 31 12.5 38 11.5C38 18.5 32.5 24 24 26Z" />
        <path d="M24 26C18 22.5 9.5 21.5 3 23.5C8 27.5 16 28.5 24 26Z" />
        <path d="M24 26C30 22.5 38.5 21.5 45 23.5C40 27.5 32 28.5 24 26Z" />
        <path d="M15 29.8H33" />
      </g>
    </svg>
  );
}

/* --- mandala -------------------------------------------------------------- */

export function Mandala({ className = '' }) {
  const id = useGoldId();
  const ring = (n, draw) => Array.from({ length: n }, (_, i) => draw((360 / n) * i, i));
  const at = (a) => `rotate(${r1(a)} 200 200)`;
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <Gold id={id} x2={400} y2={400} />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="200" cy="200" r="12" />
        {ring(8, (a) => <path key={`a${a}`} transform={at(a)} d="M200 186C205 178 205 170 200 166C195 170 195 178 200 186Z" />)}
        <circle cx="200" cy="200" r="38" />
        {ring(12, (a) => (
          <g key={`b${a}`} transform={at(a)}>
            <path d="M200 158C210 146 210 132 200 122C190 132 190 146 200 158Z" />
            <path d="M200 154V128" />
          </g>
        ))}
        <circle cx="200" cy="200" r="82" />
        {ring(36, (a) => <circle key={`c${a}`} transform={at(a)} cx="200" cy="112" r="1.4" fill={`url(#${id})`} stroke="none" />)}
        {ring(16, (a) => (
          <g key={`d${a}`} transform={at(a + 11.25)}>
            <path d="M200 106C218 90 218 72 200 62C182 72 182 90 200 106Z" />
            <path d="M200 100C208 90 208 80 200 72C192 80 192 90 200 100Z" />
          </g>
        ))}
        <circle cx="200" cy="200" r="142" />
        {ring(24, (a) => <path key={`e${a}`} transform={at(a)} d="M200 52C206 46 206 38 200 30C194 38 194 46 200 52Z" />)}
        {ring(48, (a) => <path key={`f${a}`} transform={at(a + 3.75)} d="M200 25V19" />)}
        <circle cx="200" cy="200" r="186" strokeDasharray="1.5 5" />
      </g>
    </svg>
  );
}

/* --- flowering sprig (left edge) ------------------------------------------ */

const FLORAL_STEM = [
  [[70, 500], [52, 430], [104, 380], [86, 310]],
  [[86, 310], [70, 250], [118, 200], [98, 130]],
  [[98, 130], [88, 90], [104, 50], [124, 18]],
];

export function FloralSprig({ className = '' }) {
  const id = useGoldId();
  const leaves = [];
  FLORAL_STEM.forEach((seg, si) => {
    [0.22, 0.52, 0.82].forEach((t, ti) => {
      const side = (si + ti) % 2 === 0 ? -1 : 1;
      leaves.push({ at: pointOn(seg, t), angle: angleOn(seg, t) + side * 52, scale: [0.95, 0.8, 0.62][si] });
    });
  });
  const a = pointOn(FLORAL_STEM[0], 0.55);
  const b = pointOn(FLORAL_STEM[1], 0.5);
  return (
    <svg className={className} viewBox="0 0 200 500" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <Gold id={id} x2={200} y2={500} />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d={pathOf(FLORAL_STEM)} />
        {leaves.map((l, i) => <Leaf key={i} {...l} />)}
        <path d={`M${r1(a[0])} ${r1(a[1])}C${r1(a[0] + 30)} ${r1(a[1] - 6)} ${r1(a[0] + 52)} ${r1(a[1] - 22)} 150 ${r1(a[1] - 48)}`} />
        <Flower cx={150} cy={r1(a[1] - 66)} size={17} />
        <path d={`M${r1(b[0])} ${r1(b[1])}C${r1(b[0] + 26)} ${r1(b[1] - 4)} ${r1(b[0] + 48)} ${r1(b[1] - 18)} 156 ${r1(b[1] - 42)}`} />
        <Flower cx={156} cy={r1(b[1] - 58)} size={14} petals={5} />
        <path d="M124 18C132 8 130 -2 124 -8C118 -2 116 8 124 18Z" />
        <circle cx="46" cy="352" r="2.4" className="orn-fill" />
        <circle cx="38" cy="340" r="1.8" className="orn-fill" />
        <circle cx="132" cy="240" r="2" className="orn-fill" />
      </g>
    </svg>
  );
}

/* --- leaf sprig (right edge) ---------------------------------------------- */

const LEAF_STEM = [
  [[100, 420], [118, 350], [82, 300], [96, 230]],
  [[96, 230], [108, 170], [74, 110], [70, 10]],
];

export function LeafSprig({ className = '' }) {
  const id = useGoldId();
  const leaves = [];
  LEAF_STEM.forEach((seg, si) => {
    [0.15, 0.45, 0.75].forEach((t, ti) => {
      const p = pointOn(seg, t);
      const ang = angleOn(seg, t);
      const s = (si === 0 ? 1.05 : 0.85) - ti * 0.08;
      leaves.push({ at: p, angle: ang - 48, scale: s });
      leaves.push({ at: p, angle: ang + 48, scale: s * 0.92 });
    });
  });
  return (
    <svg className={className} viewBox="0 0 160 420" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <Gold id={id} x2={160} y2={420} />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d={pathOf(LEAF_STEM)} />
        {leaves.map((l, i) => <Leaf key={i} {...l} />)}
        <path d="M70 10C76 2 76 -6 70 -12C64 -6 64 2 70 10Z" />
      </g>
    </svg>
  );
}

/* --- peacock by a lotus pond (bottom left) -------------------------------- */

/* The train: four long feathers sweeping down and back from the tail root,
   each two Béziers long. The eyes and the barbs are placed along the curves
   themselves, the same way the sprigs place their leaves. */
const TRAIN = [
  [[[120, 222], [90, 232], [58, 252], [36, 280]], [[36, 280], [18, 302], [8, 322], [6, 346]]],
  [[[122, 226], [100, 246], [80, 270], [64, 298]], [[64, 298], [50, 322], [42, 346], [42, 372]]],
  [[[126, 230], [110, 256], [100, 284], [94, 312]], [[94, 312], [88, 338], [90, 356], [94, 376]]],
  [[[118, 218], [90, 218], [60, 224], [34, 238]], [[34, 238], [20, 246], [10, 256], [4, 272]]],
];
const EYE_OUT = 'M-9 0C-9 -6 -2 -9 7 0C-2 9 -9 6 -9 0Z';
const EYE_IN = 'M-5 0C-5 -3.2 -1 -5 3.4 0C-1 5 -5 3.2 -5 0Z';

export function Peacock({ className = '' }) {
  const id = useGoldId();
  const eyes = [];
  const barbs = [];
  TRAIN.forEach((feather, fi) => {
    feather.forEach((seg, si) => {
      [0.35, 0.95].forEach((t) => {
        if (si === 0 && t < 0.5) return;
        const p = pointOn(seg, t);
        eyes.push({ key: `e${fi}${si}${t}`, x: r1(p[0]), y: r1(p[1]), a: r1(angleOn(seg, t)) });
      });
      [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].forEach((t) => {
        const p = pointOn(seg, t);
        const a = angleOn(seg, t);
        barbs.push({ key: `b${fi}${si}${t}`, x: r1(p[0]), y: r1(p[1]), a: r1(a) });
      });
    });
  });
  return (
    <svg className={className} viewBox="0 0 340 380" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <Gold id={id} x2={340} y2={380} />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        {/* the train, behind the bird */}
        {TRAIN.map((feather, i) => <path key={`t${i}`} d={pathOf(feather)} />)}
        {barbs.map((b) => (
          <path key={b.key} d="M0 0L-5 -5M0 0L-5 5" transform={`translate(${b.x} ${b.y}) rotate(${b.a})`} />
        ))}
        {eyes.map((e) => (
          <g key={e.key} transform={`translate(${e.x} ${e.y}) rotate(${e.a})`}>
            <path d={EYE_OUT} />
            <path d={EYE_IN} />
            <circle r="1.3" className="orn-fill" />
          </g>
        ))}

        {/* body: breast, belly, back to the tail root, up the back to the neck */}
        <path d="M214 166C226 184 222 212 200 224C176 238 140 236 118 222C140 216 160 206 170 190C178 176 186 166 192 162" />
        {/* wing, laid in feathers */}
        <path d="M196 176C184 196 164 210 132 218" />
        <path d="M150 214C160 204 176 200 190 204M142 221C154 212 170 209 186 213M170 196C178 188 188 186 198 190" />
        {/* neck: an S from breast to head, with a few scales down it */}
        <path d="M226 78C222 96 206 108 204 126C202 142 212 152 214 166" />
        <path d="M205 74C194 88 182 104 182 124C182 140 190 150 192 162" />
        <path d="M194 110C199 106 205 106 209 110M193 124C198 120 205 120 210 124M194 138C199 134 206 134 211 138M196 151C200 147 206 147 210 151" />
        {/* head, beak and eye */}
        <path d="M204 74C204 64 214 58 222 62C226 64 228 68 230 71L241 72L229 76C226 80 218 82 212 80C207 79 204 77 204 74Z" />
        <circle cx="219" cy="68" r="1.4" className="orn-fill" />
        {/* crest */}
        <path d="M214 62L204 44M215 61L209 41M216 61L215 39M217 61L221 41M218 62L227 45" />
        {[[204, 43], [209, 40], [215, 38], [221, 40], [227, 44]].map(([cx, cy]) => (
          <circle key={`c${cx}`} cx={cx} cy={cy} r="1.8" className="orn-fill" />
        ))}
        {/* legs */}
        <path d="M180 230L176 262M176 262L166 268M176 262L180 270M176 262L186 266M192 226L194 258M194 258L186 265M194 258L199 266M194 258L204 262" />

        {/* the pond: an open lotus, a bud on its stem, a pad and the water */}
        <g transform="translate(212 262) scale(2.2)">
          <path d="M24 3C29.5 9.5 29.5 19 24 26C18.5 19 18.5 9.5 24 3Z" />
          <path d="M24 26C22.5 18.5 17 12.5 10 11.5C10 18.5 15.5 24 24 26Z" />
          <path d="M24 26C25.5 18.5 31 12.5 38 11.5C38 18.5 32.5 24 24 26Z" />
          <path d="M24 26C18 22.5 9.5 21.5 3 23.5C8 27.5 16 28.5 24 26Z" />
          <path d="M24 26C30 22.5 38.5 21.5 45 23.5C40 27.5 32 28.5 24 26Z" />
        </g>
        <path d="M318 318C314 296 316 272 306 250" />
        <path d="M306 250C298 240 298 226 306 216C314 226 314 240 306 250Z" />
        <path d="M306 244C302 236 302 228 306 222" />
        <path d="M188 338C218 322 280 320 330 334C298 350 222 352 188 338Z" />
        <path d="M258 328V344" />
        <path d="M150 358C182 350 226 350 258 358M240 368C272 360 306 360 338 368" />
      </g>
    </svg>
  );
}

/* --- the wave that closes the hero ---------------------------------------- */

export function GoldWave({ className = '' }) {
  const id = useGoldId();
  const fill = `${id}f`;
  return (
    <svg className={className} viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d4a95f" stopOpacity="0" />
          <stop offset="0.16" stopColor="#c99a52" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#f6e2ad" stopOpacity="1" />
          <stop offset="0.84" stopColor="#c99a52" stopOpacity="0.75" />
          <stop offset="1" stopColor="#d4a95f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e1d33" stopOpacity="0.34" />
          <stop offset="1" stopColor="#8e1d33" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <path d="M0 14C300 14 430 64 600 64C770 64 900 14 1200 14V100H0Z" fill={`url(#${fill})`} />
      <path d="M0 14C300 14 430 64 600 64C770 64 900 14 1200 14" stroke={`url(#${id})`} strokeWidth="2.2" fill="none" className="orn-line" />
      <path d="M0 24C300 24 430 74 600 74C770 74 900 24 1200 24" stroke={`url(#${id})`} strokeWidth="1" strokeOpacity="0.5" fill="none" className="orn-line" />
    </svg>
  );
}
