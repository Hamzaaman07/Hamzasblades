/* ==========================================================================
   The catalogue — shared by the homepage's featured row and the gallery.

   Everything about a piece comes from data/gallery.json. Adding one is a
   photo drop plus a few lines there; no markup anywhere hardcodes a piece.

   Exposes a small global because the site has no build step. One namespace,
   no framework.
   ========================================================================== */

window.HB = (function () {
  "use strict";

  /* The filter set, in the order SPEC section 4 lists it. The keys are the
     `type` values in gallery.json; `label` is the filter chip, `noun` is what
     a card shows. */
  var TYPES = [
    { key: "swords", label: "Swords", noun: "Sword" },
    { key: "knives", label: "Knives", noun: "Knife" },
    { key: "axes", label: "Axes & spears", noun: "Axe & spear" },
    { key: "bows", label: "Bows", noun: "Bow" },
    { key: "woodworking", label: "Woodworking", noun: "Woodworking" }
  ];

  var STATUS_LABEL = {
    available: "Available",
    sold: "Sold",
    commission: "Commission"
  };

  function typeNoun(key) {
    for (var i = 0; i < TYPES.length; i++) {
      if (TYPES[i].key === key) return TYPES[i].noun;
    }
    return key;
  }

  function statusLabel(key) {
    return STATUS_LABEL[key] || key;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* --- Loading ----------------------------------------------------------- */
  /* The array is maintained newest first — that order is the display order.
     See the note at the top of data/gallery.json. */

  function load() {
    return fetch("data/gallery.json")
      .then(function (res) {
        if (!res.ok) throw new Error("gallery unavailable");
        return res.json();
      })
      .then(function (data) {
        return (data && data.pieces) || [];
      });
  }

  /* --- Cards ------------------------------------------------------------- */
  /* opts.interactive:
       "button" — the title becomes a button that opens the detail view, and
                  its hit area is stretched over the whole card
       "link"   — same, as a link to opts.href
       omitted  — a plain, inert card                                       */

  function createCard(piece, opts) {
    opts = opts || {};

    var article = el("article", "piece");
    article.dataset.id = piece.id;
    article.dataset.type = piece.type;
    /* Sold pieces stay in the catalogue — they are portfolio — at 70%. */
    if (piece.status === "sold") article.classList.add("piece--sold");

    article.appendChild(createFrame(piece));

    var meta = el("div", "piece__meta");
    /* The level depends on where the card sits: h3 under the homepage's
       "Featured work" h2, h2 on the gallery under its h1. Skipping a level
       is a real failure for anyone navigating by headings. */
    var name = el(opts.heading || "h3", "t-piece piece__name");

    if (opts.interactive === "button") {
      var button = el("button", "piece__open", piece.title);
      button.type = "button";
      button.setAttribute("aria-haspopup", "dialog");
      name.appendChild(button);
    } else if (opts.interactive === "link") {
      var link = el("a", "piece__open", piece.title);
      link.href = opts.href || "gallery.html";
      name.appendChild(link);
    } else {
      name.textContent = piece.title;
    }

    meta.appendChild(name);
    meta.appendChild(
      el("span", "eyebrow", typeNoun(piece.type) + " · " + statusLabel(piece.status))
    );

    article.appendChild(meta);
    return article;
  }

  /* Every view of a piece: the card photo first, then any extra ones. A piece
     with no `photos` behaves exactly as before. */
  function viewsOf(piece) {
    var first = { image: piece.image, webp: piece.webp, card: piece.card };
    return piece.photos && piece.photos.length
      ? [first].concat(piece.photos)
      : [first];
  }

  /* The photo, in a frame that holds its aspect ratio whether or not the file
     exists yet — the grid must not shift when photographs land.

     `view` is { image, webp }. The WebP is only offered when the data says it
     exists: a <source> pointing at a missing file is committed to by the
     browser rather than falling back to the <img>, so guessing the sibling
     path would break the photo instead of degrading. */
  function createFrame(piece, large, view) {
    view = view || viewsOf(piece)[0];

    /* A grid card is ~300px wide; the detail photo is ~500. Decoding the big
       one for a card is the difference between 300ms and 30ms of blocking
       time on a phone, so use the small copy wherever the data offers it. */
    var use = !large && view.card ? view.card : view;

    var frame = el("div", large ? "piece__frame piece__frame--large" : "piece__frame");

    var img = el("img", "piece__img");
    img.src = use.image;
    /* Alt text is the piece title at minimum. */
    img.alt = view.alt || piece.title;
    img.decoding = "async";
    if (!large) {
      img.loading = "lazy";
      img.width = 800;
      img.height = 1000;
    }

    var pending = el("div", "piece__pending");
    pending.appendChild(el("span", "eyebrow", "Photo pending"));
    pending.hidden = true;

    img.addEventListener("error", function () {
      holder.remove();
      pending.hidden = false;
    });

    var holder = img;
    if (use.webp) {
      var picture = document.createElement("picture");
      var source = document.createElement("source");
      source.type = "image/webp";
      source.srcset = use.webp;
      picture.appendChild(source);
      picture.appendChild(img);
      holder = picture;
    }

    frame.appendChild(holder);
    frame.appendChild(pending);
    return frame;
  }

  return {
    TYPES: TYPES,
    typeNoun: typeNoun,
    statusLabel: statusLabel,
    el: el,
    load: load,
    createCard: createCard,
    createFrame: createFrame,
    viewsOf: viewsOf
  };
})();
