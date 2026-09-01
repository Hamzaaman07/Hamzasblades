/* ==========================================================================
   Site behaviour. Everything here is an enhancement — the markup stands on
   its own if this file never loads.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Header ------------------------------------------------------------ */
  /* Transparent over the hero, ash-tinted once the visitor leaves it. */

  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- Optional imagery -------------------------------------------------- */
  /* An image marked data-optional removes itself if the file is not there
     yet, rather than leaving a broken-image icon in the layout. The hero mark
     is one: without it the hero runs on type alone, which is what SPEC
     section 7 asks for when the mark cannot be shown properly. */

  Array.prototype.forEach.call(
    document.querySelectorAll("img[data-optional]"),
    function (img) {
      img.addEventListener("error", function () {
        img.remove();
      });
      /* Covers a cached failure that fired before this script ran. */
      if (img.complete && img.naturalWidth === 0) img.remove();
    }
  );

  /* --- Hero video -------------------------------------------------------- */
  /* Held back until the page has painted so the video never blocks first
     paint. The poster gradient is on screen the whole time. */

  var hero = document.querySelector(".hero__video");
  var stillOnly = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hero && hero.dataset.src && !stillOnly) {
    var loadHero = function () {
      /* Only reveal the video once it can play. If the file is not there yet
         this never fires, and the hero keeps showing the still. */
      hero.addEventListener("canplay", function () {
        hero.classList.add("is-ready");
      });
      var source = document.createElement("source");
      source.src = hero.dataset.src;
      source.type = hero.dataset.type || "video/mp4";
      hero.appendChild(source);
      hero.load();
    };
    if (document.readyState === "complete") loadHero();
    else window.addEventListener("load", loadHero);
  } else if (hero && stillOnly) {
    /* An autoplaying loop is motion. Reduced motion gets the still. */
    hero.remove();
  }

  /* --- Featured work ----------------------------------------------------- */
  /* Four pieces from the catalogue. Card rendering lives in js/pieces.js so
     these and the gallery's cards cannot drift apart. */

  var grid = document.querySelector("[data-featured]");
  if (!grid || !window.HB) return;

  HB.load()
    .then(function (pieces) {
      var featured = pieces
        .filter(function (p) {
          return p.featured;
        })
        .slice(0, 4);

      if (!featured.length) return;

      var frag = document.createDocumentFragment();
      featured.forEach(function (p) {
        /* The detail view lives on the gallery page, so a featured card
           sends you there rather than opening a lightbox of its own. */
        frag.appendChild(HB.createCard(p, { interactive: "link", href: "gallery.html" }));
      });
      grid.textContent = "";
      grid.appendChild(frag);
    })
    .catch(function () {
      /* Leave the markup's own fallback line in place. The section still
         reads as finished and the link to the full catalogue still works. */
    });
})();
