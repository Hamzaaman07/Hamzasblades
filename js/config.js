/* ==========================================================================
   Site configuration. The two values below are the only things that need
   changing to take the site live.
   ========================================================================== */

window.HB_CONFIG = {
  /* ----------------------------------------------------------------------
     REPLACE THIS with the form's own endpoint from formspree.io. It looks
     like https://formspree.io/f/abcdwxyz — the id is all that changes.

     Until it is replaced, inquiries are NOT delivered: the form validates,
     then tells the visitor it cannot send rather than swallowing the
     message, and logs a warning naming this file.

     The destination address is set INSIDE Formspree and must never appear
     here. This file is served to every visitor, so an address in it is
     public page text by another name — which is the thing SPEC section 5
     exists to prevent.

     Netlify is the one host whose native form handling would replace
     Formspree outright. Cloudflare Pages and Vercel have no equivalent, so
     on those this endpoint is required.
     ---------------------------------------------------------------------- */
  FORM_ENDPOINT: "https://formspree.io/f/YOUR_ID_HERE",

  /* Hamza's Instagram, e.g. "https://instagram.com/hamzasblades". Leave empty
     and the link simply does not render — no dead link on the page. */
  INSTAGRAM_URL: ""
};
