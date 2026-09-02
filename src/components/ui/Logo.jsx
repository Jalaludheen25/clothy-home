import { Link } from 'react-router-dom';

/* ==========================================================================
   Brand mark
   --------------------------------------------------------------------------
   The supplied artwork comes in two inks (oxblood and off-white) and two
   weights. The lighter "02" cut is the one that belongs on an editorial page;
   the heavier cut is kept for small sizes, where thin strokes disappear.

   Rather than swap the src on scroll — which would flash an undecoded image
   over a hero — both inks are rendered and cross-faded with opacity. They are
   the same artwork at the same size, so nothing shifts.
   ========================================================================== */

const ART = {
  light: {
    regular: '/logo/Clothyhome logo Off-white 02.png',
    heavy: '/logo/Clothyhome logo Off-white.png',
  },
  dark: {
    regular: '/logo/Clothyhome logo maroon 02.png',
    heavy: '/logo/Clothyhome logo maroon.png',
  },
};

/* Intrinsic artwork ratios, so the box is reserved before the file decodes. */
const RATIO = { regular: 1669 / 517, heavy: 1836 / 517 };

/**
 * @param {'dark'|'light'|'auto'} tone  'auto' renders both and lets CSS decide,
 *   which is what the header needs as it crosses from a hero onto the page.
 */
export function Logo({ tone = 'dark', weight = 'regular', className = '', alt = 'Clothy Home' }) {
  const ratio = RATIO[weight];

  if (tone === 'auto') {
    return (
      <span className={`logo logo--auto ${className}`} style={{ '--logo-ratio': ratio }}>
        <img className="logo__img logo__img--light" src={ART.light[weight]} alt="" aria-hidden="true" />
        <img className="logo__img logo__img--dark" src={ART.dark[weight]} alt={alt} />
      </span>
    );
  }

  return (
    <span className={`logo ${className}`} style={{ '--logo-ratio': ratio }}>
      <img className="logo__img" src={ART[tone][weight]} alt={alt} />
    </span>
  );
}

/** The mark as a link home. */
export function LogoLink({ to = '/', ...props }) {
  return (
    <Link to={to} className="logo-link" aria-label="Clothy Home, home">
      <Logo {...props} alt="" />
      <span className="sr-only">Clothy Home</span>
    </Link>
  );
}
