/* ==========================================================================
   Gallery — SPEC section 4.

   Every piece is shown by default, newest first. Filters refine; they never
   hide the catalogue behind a click. Clicking a piece opens a detail view.

   Enhancement only: without this file the page still says what it is and the
   markup's fallback line points at the inquiry route.
   ========================================================================== */

(function () {
  "use strict";

  if (!window.HB) return;

  var grid = document.querySelector("[data-gallery]");
  var filterBar = document.querySelector("[data-filters]");
  var empty = document.querySelector("[data-empty]");
  if (!grid) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pieces = [];
  var cards = [];
  var active = "all";

  /* --- Filters ----------------------------------------------------------- */

  function buildFilters(available) {
    if (!filterBar) return;

    var defs = [{ key: "all", label: "All" }].concat(
      HB.TYPES.filter(function (t) {
        /* Only offer a filter that would actually return something. */
        return available[t.key];
      })
    );

    defs.forEach(function (def) {
      var button = HB.el("button", "filter", def.label);
      button.type = "button";
      button.dataset.filter = def.key;
      button.setAttribute("aria-pressed", def.key === active ? "true" : "false");
      filterBar.appendChild(button);
    });

    filterBar.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      apply(button.dataset.filter);
    });
  }

  function markActive() {
    Array.prototype.forEach.call(
      filterBar ? filterBar.querySelectorAll("[data-filter]") : [],
      function (button) {
        var on = button.dataset.filter === active;
        button.classList.toggle("is-active", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
      }
    );
  }

  function matches(card) {
    return active === "all" || card.dataset.type === active;
  }

  /* --- Reflow ------------------------------------------------------------ */
  /* FLIP: measure where every visible card is, change the filter, measure
     again, then play the difference back as a transform. The grid moves
     rather than snapping. */

  function apply(next) {
    if (next === active) return;
    active = next;
    markActive();

    if (reduced.matches) {
      cards.forEach(function (card) {
        card.classList.toggle("is-hidden", !matches(card));
      });
      updateEmpty();
      return;
    }

    var first = {};
    cards.forEach(function (card) {
      if (!card.classList.contains("is-hidden")) {
        first[card.dataset.id] = card.getBoundingClientRect();
      }
    });

    cards.forEach(function (card) {
      card.classList.toggle("is-hidden", !matches(card));
    });
    updateEmpty();

    cards.forEach(function (card) {
      if (card.classList.contains("is-hidden")) return;

      var last = card.getBoundingClientRect();
      var was = first[card.dataset.id];

      if (was) {
        var dx = was.left - last.left;
        var dy = was.top - last.top;
        if (!dx && !dy) return;
        card.style.transition = "none";
        card.style.transform = "translate(" + dx + "px, " + dy + "px)";
      } else {
        /* Newly revealed — come in rather than appear. */
        card.style.transition = "none";
        card.style.transform = "translateY(12px)";
        card.style.opacity = "0";
      }
    });

    /* Two frames: one for the browser to take the "first" styles, one to
       start the transition from them. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cards.forEach(function (card) {
          if (card.classList.contains("is-hidden")) return;
          card.style.transition = "";
          card.style.transform = "";
          card.style.opacity = "";
        });
      });
    });
  }

  function updateEmpty() {
    if (!empty) return;
    var any = cards.some(function (card) {
      return !card.classList.contains("is-hidden");
    });
    empty.hidden = any;
  }

  /* --- Detail view ------------------------------------------------------- */
  /* A lightbox. Escape closes it, focus is trapped while it is open and
     returned to the card that opened it on close. */

  var lightbox = document.querySelector("[data-lightbox]");
  var lbFrame = lightbox && lightbox.querySelector("[data-lightbox-frame]");
  var lbTitle = lightbox && lightbox.querySelector("[data-lightbox-title]");
  var lbMeta = lightbox && lightbox.querySelector("[data-lightbox-meta]");
  var lbInquiry = lightbox && lightbox.querySelector("[data-lightbox-inquiry]");
  var lbClose = lightbox && lightbox.querySelector("[data-lightbox-close]");
  var lastFocused = null;

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openDetail(piece, opener) {
    if (!lightbox) return;
    lastFocused = opener || document.activeElement;

    lbFrame.textContent = "";
    lbFrame.appendChild(HB.createFrame(piece, true));

    lbTitle.textContent = piece.title;
    lbMeta.textContent =
      HB.typeNoun(piece.type) + " · " + HB.statusLabel(piece.status);

    /* A fresh inquiry box per piece: a sold piece asks about commissioning
       something similar, everything else asks about the piece itself. */
    if (lbInquiry) {
      lbInquiry.textContent = "";

      if (HB.createInquiry) {
        var intent = piece.status === "sold" ? "commission" : "purchase";
        lbInquiry.dataset.intent = intent;
        lbInquiry.appendChild(
          HB.el(
            "p",
            "eyebrow",
            intent === "commission" ? "Commission something similar" : "Ask about this piece"
          )
        );
        lbInquiry.appendChild(
          HB.createInquiry({
            intent: intent,
            pieceId: piece.id,
            pieceTitle: piece.title,
            source: "gallery"
          })
        );
      } else {
        /* js/inquiry.js absent — keep a route to the contact page. */
        var fallback = HB.el("p", "small muted", "To ask about this piece, ");
        var link = HB.el("a", "link-through", "send an inquiry");
        link.href = "contact.html";
        fallback.appendChild(link);
        lbInquiry.appendChild(fallback);
      }
    }

    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    /* Let the frame paint before moving focus, so the transition is seen. */
    requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
      lbClose.focus();
    });

    document.addEventListener("keydown", onKeydown);
  }

  function closeDetail() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    document.removeEventListener("keydown", onKeydown);
    document.body.classList.remove("is-locked");

    var finish = function () {
      lightbox.hidden = true;
      lbFrame.textContent = "";
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
      lastFocused = null;
    };

    if (reduced.matches) finish();
    else setTimeout(finish, 200);
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDetail();
      return;
    }
    if (event.key !== "Tab") return;

    var focusable = Array.prototype.filter.call(
      lightbox.querySelectorAll(FOCUSABLE),
      function (node) {
        return node.offsetParent !== null;
      }
    );
    if (!focusable.length) return;

    var firstNode = focusable[0];
    var lastNode = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstNode) {
      event.preventDefault();
      lastNode.focus();
    } else if (!event.shiftKey && document.activeElement === lastNode) {
      event.preventDefault();
      firstNode.focus();
    }
  }

  if (lightbox) {
    lbClose.addEventListener("click", closeDetail);
    lightbox.addEventListener("mousedown", function (event) {
      /* Clicking the backdrop closes; clicking the panel does not. */
      if (event.target === lightbox) closeDetail();
    });
  }

  /* --- Wiring ------------------------------------------------------------ */

  grid.addEventListener("click", function (event) {
    var button = event.target.closest(".piece__open");
    if (!button) return;
    var card = button.closest(".piece");
    var piece = pieces.filter(function (p) {
      return p.id === card.dataset.id;
    })[0];
    if (piece) openDetail(piece, button);
  });

  HB.load()
    .then(function (list) {
      pieces = list;
      if (!pieces.length) return;

      var available = {};
      var frag = document.createDocumentFragment();

      pieces.forEach(function (piece) {
        available[piece.type] = true;
        var card = HB.createCard(piece, { interactive: "button" });
        cards.push(card);
        frag.appendChild(card);
      });

      grid.textContent = "";
      grid.appendChild(frag);
      buildFilters(available);
      markActive();
      updateEmpty();
    })
    .catch(function () {
      /* The markup's fallback line stays put. */
    });
})();
