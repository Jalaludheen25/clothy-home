/* ==========================================================================
   How to reach the house
   --------------------------------------------------------------------------
   One place for the details that appear in the header, the footer, on the
   product page, in order tracking and on the atelier page. They were
   duplicated across all of those before, which is how a number gets changed
   in three of them.

   Taken from the company card: the Kozhikode warehouse, the landline and the
   published address. The Instagram handle is not printed on the card — it is
   only in the QR block — so the profile link stands as it was.
   ========================================================================== */

export const PHONE = '+91 97451 23677';
/** Digits only, for the tel: href — spaces in a tel URI are not portable. */
export const PHONE_HREF = 'tel:+919745123677';

export const EMAIL = 'theclothyhome@gmail.com';
export const EMAIL_HREF = 'mailto:theclothyhome@gmail.com';

/** Shown without the scheme, linked with it. */
export const WEBSITE = 'www.clothyhome.com';
export const WEBSITE_HREF = 'https://www.clothyhome.com';

/* wa.me wants the number bare — no plus, no spaces. */
export const WHATSAPP = '+91 97451 23677';
export const WHATSAPP_HREF = 'https://wa.me/919745123677';

/** The registered warehouse, as printed. */
export const ADDRESS = [
  'Clothyhome LLP',
  'Warehouse No: 99-100, Koyyal Narippatta',
  'Kozhikode, Kerala 673506',
];
/** One line, for a title attribute or a maps query. */
export const ADDRESS_LINE = ADDRESS.join(', ');
export const CITY = 'Kozhikode';

export const SOCIAL = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/?hl=en',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61590398420064',
  },
  {
    id: 'google',
    label: 'Google Business',
    /* The share link Google issues for the listing — it resolves to the
       profile, so it is what belongs in a link rather than a maps query. */
    href: 'https://share.google/gYd9zcWKCxZcRB4Cu',
  },
  { id: 'whatsapp', label: 'WhatsApp', href: WHATSAPP_HREF },
];
