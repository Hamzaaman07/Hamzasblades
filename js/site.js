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
  if (hero && hero.dataset.src) {
    var loadHero = function () {
      var source = document.createElement("source");
      source.src = hero.dataset.src;
      source.type = hero.dataset.type || "video/mp4";
      hero.appendChild(source);
      hero.load();
    };
    if (document.readyState === "complete") loadHero();
    else window.addEventListener("load", loadHero);
  }

  /* --- Featured work ----------------------------------------------------- */
  /* Read from gallery.json so adding a piece is a photo drop plus a few
     lines. Nothing about the catalogue is hardcoded in the markup. */

  var grid = document.querySelector("[data-featured]");
  if (!grid) return;

  var STATUS_LABEL = {
    available: "Available",
    sold: "Sold",
    commission: "Commission"
  };

  var TYPE_LABEL = {
    swords: "Sword",
    knives: "Knife",
    axes: "Axe & spear",
    bows: "Bow",
    woodworking: "Woodworking"
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function card(piece) {
    var article = el("article", "piece");
    if (piece.status === "sold") article.classList.add("piece--sold");

    var frame = el("div", "piece__frame");

    var img = el("img", "piece__img");
    img.src = piece.image;
    /* Alt text is the piece title at minimum. */
    img.alt = piece.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 800;
    img.height = 1000;

    /* Until the photograph is dropped in, hold the frame rather than
       collapsing it — the grid must not shift when the file arrives. */
    var pending = el("div", "piece__pending");
    pending.appendChild(el("span", "eyebrow", "Photo pending"));
    pending.hidden = true;

    img.addEventListener("error", function () {
      img.remove();
      pending.hidden = false;
    });

    frame.appendChild(img);
    frame.appendChild(pending);

    var meta = el("div", "piece__meta");
    meta.appendChild(el("h3", "t-piece piece__name", piece.title));

    var tags = el("span", "eyebrow");
    tags.textContent =
      (TYPE_LABEL[piece.type] || piece.type) +
      " · " +
      (STATUS_LABEL[piece.status] || piece.status);
    meta.appendChild(tags);

    article.appendChild(frame);
    article.appendChild(meta);
    return article;
  }

  fetch("data/gallery.json")
    .then(function (res) {
      if (!res.ok) throw new Error("gallery unavailable");
      return res.json();
    })
    .then(function (data) {
      var featured = (data.pieces || [])
        .filter(function (p) {
          return p.featured;
        })
        .slice(0, 4);

      if (!featured.length) return;

      var frag = document.createDocumentFragment();
      featured.forEach(function (p) {
        frag.appendChild(card(p));
      });
      grid.textContent = "";
      grid.appendChild(frag);
    })
    .catch(function () {
      /* Leave the markup's own fallback line in place. The section still
         reads as finished and the link to the full catalogue still works. */
    });
})();
