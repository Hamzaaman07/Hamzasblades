/* ==========================================================================
   Silent looping video, used where a photograph would otherwise go.

   The Process page runs six of these on one screen, which is the whole
   reason this file exists. Six 1080p loops all fetching and decoding at
   once would cost more than the page is worth on a phone, so nothing is
   fetched until a stage is nearly in view, and nothing decodes while it is
   scrolled away.

   A loop here is not a video player. No controls, no sound, no timeline —
   it reads as a photograph that happens to move. That is the intent, and it
   is why these are aria-hidden and untabbable: there is nothing to operate,
   and the stage's heading and copy already say what is being shown.

   There are two ways a loop gets here.

   The Process stages come from data/process.json, never from a guessed
   path: a <source> pointing at a missing file is committed to by the
   browser rather than falling back, and a src that 404s is a failed
   request on every load. So a stage with nothing shot emits no markup at
   all and keeps its "pending" frame.

   Anything else — the home page's retreats band — declares itself in the
   markup with data-loop and data-src. That is not a guessed path: the file
   is committed alongside the markup that names it, and the alternative
   would be a second manifest fetch on the home page for one video.
   ========================================================================== */

(function () {
  "use strict";

  /* Matches js/site.js: the browser commits to the first source it can
     play, so the cheap one goes first and the MP4 is the fallback Safari
     takes. */
  function addSource(video, src, type) {
    if (!src) return;
    var source = document.createElement("source");
    source.src = src;
    source.type = type;
    video.appendChild(source);
  }

  /* Revealing is per figure, not per element: a stage with both a still and
     a loop must not show "pending" underneath them, and whichever lands
     first is enough to clear it. */
  function reveal(el, figure) {
    figure.classList.add("is-ready");
    el.classList.add("is-ready");
  }

  var figures = document.querySelectorAll(".step__figure[data-stage]");
  var declared = document.querySelectorAll("video[data-loop][data-src]");
  if (!figures.length && !declared.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Two observers, because fetching and decoding are different costs.

     Loading runs early — 300px before a stage arrives — so the file is
     there by the time it is looked at. Playing is gated much tighter, on a
     stage being a quarter on screen, because video decode is what actually
     makes a phone stutter. With one loose observer doing both, three
     stages could be decoding at once during a scroll while only one was
     being looked at. */
  var observer = "IntersectionObserver" in window
    ? new IntersectionObserver(onNear, { rootMargin: "300px 0px", threshold: 0 })
    : null;

  var playWatcher = observer
    ? new IntersectionObserver(onVisible, { rootMargin: "0px", threshold: 0.25 })
    : null;

  function onNear(entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (!entry.isIntersecting) return;
      if (video.dataset.loaded) return;
      video.dataset.loaded = "1";
      video.load();
    });
  }

  function onVisible(entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        /* play() rejects when the tab is backgrounded or the sources
           failed, neither of which is worth reporting. */
        var played = video.play();
        if (played && played.catch) played.catch(function () {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  }

  function watch(video) {
    observer.observe(video);
    playWatcher.observe(video);
  }

  function buildStill(stage, figure) {
    if (!stage.image) return;
    /* The Process stages carry their still in the markup so it paints
       before this fetch resolves. Nothing to add when one is already
       there. */
    if (figure.querySelector(".step__img")) return;

    var img = document.createElement("img");
    img.className = "step__img";
    img.alt = stage.alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    /* The frame holds its own shape and the image is stretched to it, so
       these only stop the image being intrinsically sized before it loads. */
    img.width = stage.width || 1600;
    img.height = stage.height || 1200;
    img.src = stage.image;
    img.addEventListener("load", function () { reveal(img, figure); });
    img.addEventListener("error", function () { img.remove(); });

    /* The WebP is only offered when the data says it exists — same rule as
       the gallery, and for the same reason. */
    var holder = img;
    if (stage.webp) {
      var picture = document.createElement("picture");
      var source = document.createElement("source");
      source.type = "image/webp";
      source.srcset = stage.webp;
      picture.appendChild(source);
      picture.appendChild(img);
      holder = picture;
    }
    figure.insertBefore(holder, figure.firstChild);
  }

  function buildLoop(stage, figure) {
    /* An autoplaying loop is motion: under reduced motion the stage keeps
       its still, or its pending frame, and no video is ever created. */
    if (!stage.loop || reduced || !observer) return;
    if (!stage.loop.mp4 && !stage.loop.webm) return;

    var video = document.createElement("video");
    video.className = "step__loop";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.tabIndex = -1;
    video.addEventListener("canplay", function () { reveal(video, figure); });

    addSource(video, stage.loop.webm, "video/webm");
    addSource(video, stage.loop.mp4, "video/mp4");

    figure.appendChild(video);
    watch(video);
  }

  /* Loops written straight into the markup. Same frugality as the stages:
     nothing is fetched until it is nearly in view, and it pauses when it is
     not. An autoplaying loop is motion, so reduced motion removes it and
     leaves the poster still underneath. */
  Array.prototype.forEach.call(declared, function (video) {
    if (reduced || !observer) {
      video.remove();
      return;
    }
    video.addEventListener("canplay", function () {
      video.classList.add("is-ready");
    });
    /* A phone gets a smaller cut where one is offered. The frame is about
       340px wide there, so the full-size file is mostly detail nobody can
       see, paid for on a mobile connection. <source media> is no longer
       honoured for video, so the choice is made here instead. */
    var narrow = video.dataset.srcNarrow &&
      window.matchMedia("(max-width: 700px)").matches;
    if (narrow) {
      addSource(video, video.dataset.srcNarrow, video.dataset.type || "video/mp4");
    } else {
      addSource(video, video.dataset.srcWebm, "video/webm");
      addSource(video, video.dataset.src, video.dataset.type || "video/mp4");
    }
    watch(video);
  });

  if (!figures.length) return;

  fetch("data/process.json")
    .then(function (res) {
      if (!res.ok) throw new Error("process media unavailable");
      return res.json();
    })
    .then(function (data) {
      var stages = (data && data.stages) || {};
      Array.prototype.forEach.call(figures, function (figure) {
        var stage = stages[figure.dataset.stage];
        if (!stage) return;
        /* The frame's shape is NOT set here. It is --ar in process.html,
           because it has to be right at first paint: applying it once this
           fetch resolves reshapes every stage and costs real layout shift.
           This file only fills the frame that is already reserved. */
        buildStill(stage, figure);
        buildLoop(stage, figure);
      });
    })
    /* The page is complete without any of this: every stage keeps its frame
       and its copy, and the pending block is an honest empty state. */
    .catch(function () {});
})();
