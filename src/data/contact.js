/* ==========================================================================
   How to reach the house
   --------------------------------------------------------------------------
   One place for the details that appear in the footer, on the product page,
   in order tracking and on the atelier page. They were duplicated across all
   four before, which is how a number gets changed in three of them.
   ========================================================================== */

export const PHONE = '+91 751 018 7678';
/** Digits only, for the tel: href — spaces in a tel URI are not portable. */
export const PHONE_HREF = 'tel:+917510187678';

export const EMAIL = 'theclothyhome@gmail.com';
export const EMAIL_HREF = 'mailto:theclothyhome@gmail.com';

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
];
