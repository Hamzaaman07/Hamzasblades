/* ==========================================================================
   Site configuration. The two values below are the only things that need
   changing to take the site live.
   ========================================================================== */

window.HB_CONFIG = {
  /* ----------------------------------------------------------------------
     REPLACE THIS with the Formspree endpoint from formspree.io, set to
     forward to hamzasblades@gmail.com.

     Until it is replaced, inquiries are NOT delivered: the form validates,
     then tells the visitor it cannot send rather than swallowing the message,
     and logs a warning naming this file.

     If the site ends up on Netlify or Vercel, their native form handling is
     free and replaces Formspree entirely — worth doing instead.
     ---------------------------------------------------------------------- */
  FORM_ENDPOINT: "https://formspree.io/f/YOUR_ID_HERE",

  /* Hamza's Instagram, e.g. "https://instagram.com/hamzasblades". Leave empty
     and the link simply does not render — no dead link on the page. */
  INSTAGRAM_URL: ""
};
