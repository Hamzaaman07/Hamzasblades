/* ==========================================================================
   The ember continuum — SPEC section 3.
   One particle system for the whole site. Sparks rise from the bottom of the
   viewport, drift, flicker and fade. Canvas 2D, a few hundred particles.

   Continuity across navigation: the system never renders a cold start. Every
   particle is born with a random age, and the density it starts at is the
   density the previous page left behind (carried in sessionStorage), then
   interpolated to this page's target over ~800ms. The visitor's sense is of
   standing in one room the whole time.

   The site is complete without this file. It appends its own canvas and
   removes nothing if it never runs.
   ========================================================================== */

(function () {
  "use strict";

  var STORE_KEY = "hb.embers.density";
  var BLEND_MS = 800;

  /* Density and character per page — SPEC section 3. */
  /* `focus` centres the spawn band instead of spreading it across the full
     width: sparks that came off one piece of steel below the frame, rather
     than ambient dust. The homepage uses it because that is where the
     handoff from the hero footage happens; everywhere else stays even. */
  /* `glow` is the forge below the frame: a soft warm wash along the bottom
     edge that the sparks rise out of. It lives on the canvas rather than in
     CSS because the canvas is fixed to the viewport — put it in the hero and
     it gets clipped at the hero's bottom edge, leaving a hard line across the
     page as soon as you scroll. Intensity tracks density, so it is strong on
     the homepage and barely there on About. */
  var PROFILES = {
    home: { count: 400, speed: 1.3, wobble: 1, life: [3, 6.5], focus: 0.9, glow: 0.15, risers: 0.16 },
    gallery: { count: 90, speed: 0.65, wobble: 0.9, life: [5, 9], glow: 0.04, risers: 0.14 },
    process: { count: 250, speed: 1, wobble: 1, life: [3.5, 7], glow: 0.09, risers: 0.15 },
    retreats: { count: 180, speed: 0.85, wobble: 2.1, life: [4.5, 8.5], glow: 0.07, risers: 0.2 },
    about: { count: 70, speed: 0.8, wobble: 1.1, life: [5, 9], glow: 0.035, risers: 0.18 },
    contact: { count: 70, speed: 0.8, wobble: 1.1, life: [5, 9], glow: 0.035, risers: 0.18 }
  };

  var page = document.body.getAttribute("data-embers") || "about";
  var profile = PROFILES[page] || PROFILES.about;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* --- Device scaling ---------------------------------------------------- */
  /* Desktop full count, tablet 40%, mobile 20%. */
  function deviceScale() {
    var w = window.innerWidth;
    if (w <= 640) return 0.2;
    if (w <= 1024) return 0.4;
    return 1;
  }

  function targetCount() {
    return Math.max(12, Math.round(profile.count * deviceScale()));
  }

  /* --- Canvas ------------------------------------------------------------ */

  var canvas = document.createElement("canvas");
  canvas.className = "embers";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  document.body.appendChild(canvas);

  var W = 0;
  var H = 0;
  var dpr = 1;

  function resize() {
    /* devicePixelRatio capped at 2 — 3x doubles fill cost for no visible gain. */
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* --- Heat scale --------------------------------------------------------- */
  /* Sampled from the hero still: of its incandescent pixels, ~75% sit between
     hue 355 and 14 — deep crimson through red-orange — while the hottest 5%
     land near hue 30 at high lightness, the amber core of the bar. So the
     scale runs from that amber down through orange into crimson.

     This widens SPEC section 3's stated 18–42, which covers only the bright
     core and misses every red in the photograph.

     A particle moves DOWN this scale as it ages: a spark leaves the steel hot
     and cools while it rises, which is both what the eye expects and what the
     still actually shows. Sprites are pre-rendered per step and blitted —
     a radial gradient per particle per frame is the expensive way. */

  var HUE_HOT = 36;
  var HUE_COOL = -8;
  var BUCKETS = 14;
  var SPRITE = 64;
  var sprites = [];
  var cores = [];

  function buildSprites() {
    sprites = [];
    cores = [];
    for (var i = 0; i < BUCKETS; i++) {
      /* t: 0 = cooled crimson, 1 = amber, straight off the steel. */
      var t = i / (BUCKETS - 1);
      var hue = HUE_COOL + (HUE_HOT - HUE_COOL) * t;
      /* Cooled sparks are darker and a touch more saturated; hot ones are
         near-white at the core, as the bar is in the photograph. */
      var coreL = 42 + 30 * t;
      var sat = 100 - 5 * t;

      cores.push("hsl(" + hue + ", " + sat + "%, " + coreL + "%)");

      var c = document.createElement("canvas");
      c.width = c.height = SPRITE;
      var g = c.getContext("2d");
      var r = SPRITE / 2;
      var grad = g.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0, "hsla(" + hue + ", " + sat + "%, " + (coreL + 8) + "%, 0.92)");
      grad.addColorStop(0.18, "hsla(" + hue + ", " + sat + "%, " + (coreL - 8) + "%, 0.5)");
      grad.addColorStop(0.5, "hsla(" + (hue - 4) + ", " + sat + "%, " + (coreL - 18) + "%, 0.14)");
      grad.addColorStop(1, "hsla(" + (hue - 6) + ", " + sat + "%, " + (coreL - 22) + "%, 0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE, SPRITE);
      sprites.push(c);
    }
  }

  /* How hot a particle reads right now, 0..1, walked down its own curve. */
  function heat(p) {
    var life = p.age / p.maxLife;
    var t = p.hot0 + (p.hot1 - p.hot0) * Math.pow(life, p.cool);
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  /* --- Particles --------------------------------------------------------- */

  var particles = [];

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  /* Where along the bottom edge a spark is born. With `focus`, two uniforms
     averaged give a triangular distribution peaked at the centre of the
     frame — denser under the middle, thinning to the edges, the way sparks
     leave one hot bar rather than the whole width of a room. */
  function spawnX() {
    if (!profile.focus) return rand(-40, W + 40);
    var t = (Math.random() + Math.random()) / 2;
    return W / 2 + (t - 0.5) * W * profile.focus * 2;
  }

  function spawn(p, prewarm) {
    /* A minority break away and carry all the way up the frame instead of
       dying in the lower third. They are what stops the field reading as a
       band of glow along the bottom edge. */
    p.riser = Math.random() < (profile.risers || 0);

    p.maxLife = rand(profile.life[0], profile.life[1]);
    if (p.riser) p.maxLife *= rand(2.0, 3.0);

    /* prewarm gives the particle a random age so the field is already full
       on the first frame — no visible cold start after a navigation. */
    p.age = prewarm ? Math.random() * p.maxLife : 0;

    p.x0 = spawnX();
    p.y = H + rand(0, 80);
    /* Upward drift with slight acceleration — heat rises. */
    p.vy = -rand(16, 42) * profile.speed;
    p.ay = -rand(6, 18) * profile.speed;
    p.drift = rand(-14, 14);

    /* Sine wobble on x, each particle with its own phase offset. */
    p.wobAmp = rand(6, 30) * profile.wobble;
    p.wobFreq = rand(0.35, 1.15);
    p.wobPhase = Math.random() * Math.PI * 2;

    if (p.riser) {
      /* Faster off the mark but gentler acceleration, so they climb steadily
         rather than rocketing, and wander further sideways on the way — which
         is what scatters them across the width by the time they are high. */
      p.vy *= rand(1.3, 1.7);
      p.ay *= 0.5;
      p.drift = rand(-28, 28);
      p.wobAmp *= 1.5;
    }

    /* Brightness flicker on a second, faster sine. This is what separates
       fire from floating dots. */
    p.flkFreq = rand(4, 11);
    p.flkPhase = Math.random() * Math.PI * 2;

    p.size = rand(0.7, 2.3) * (p.riser ? 0.8 : 1);
    p.alpha = rand(0.55, 1) * (p.riser ? 0.85 : 1);

    /* Streak length as a fraction of speed — a fast spark draws a longer
       line. Fixed per particle so the length does not jitter frame to frame. */
    p.trail = rand(0.07, 0.16) * (p.riser ? 1.4 : 1);

    /* Its own cooling curve: born hot, ending somewhere in the reds. */
    p.hot0 = rand(0.5, 0.92);
    p.hot1 = rand(0, 0.2);
    p.cool = p.riser ? rand(0.9, 1.4) : rand(0.4, 0.75);

    /* Advance a prewarmed particle to where its age says it should be, so the
       field is already spread up the viewport on the first frame. */
    if (prewarm) {
      p.y += p.vy * p.age + 0.5 * p.ay * p.age * p.age;
      p.vy += p.ay * p.age;
      p.x0 += p.drift * p.age;
    }
    return p;
  }

  function step(p, dt, t) {
    p.age += dt;
    if (p.age >= p.maxLife || p.y < -60) {
      spawn(p, false);
      return;
    }
    p.vy += p.ay * dt;
    p.y += p.vy * dt;
    p.x0 += p.drift * dt;
  }

  function envelope(p) {
    var life = p.age / p.maxLife;
    /* Quick fade in over the first 12% of life, long fade out. Risers hold
       their brightness far longer — with the ordinary curve they are already
       invisible by the time they clear the lower third, which was exactly why
       nothing reached the top of the frame. */
    var fadeIn = life < 0.12 ? life / 0.12 : 1;
    var fadeOut = Math.pow(1 - life, p.riser ? 0.7 : 1.6);
    return fadeIn * fadeOut * p.alpha;
  }

  /* Rebuilt on resize only — the gradient is geometry, not animation. */
  var baseGlow = null;

  function buildGlow() {
    if (!profile.glow) {
      baseGlow = null;
      return;
    }
    var r = Math.max(W * 0.42, 320);
    var cy = H + r * 0.5;
    baseGlow = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, r);
    baseGlow.addColorStop(0, "hsla(20, 96%, 50%, " + profile.glow + ")");
    baseGlow.addColorStop(0.45, "hsla(12, 96%, 44%, " + profile.glow * 0.32 + ")");
    baseGlow.addColorStop(0.75, "hsla(4, 95%, 40%, " + profile.glow * 0.08 + ")");
    baseGlow.addColorStop(1, "hsla(0, 95%, 38%, 0)");
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    /* Constant for every spark — no reason to set it per particle. */
    ctx.lineCap = "round";

    /* The forge below the frame, under the sparks. */
    if (baseGlow) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = baseGlow;
      ctx.fillRect(0, H * 0.62, W, H * 0.38);
    }

    for (var i = 0; i < live; i++) {
      var p = particles[i];
      var a = envelope(p);
      if (a <= 0.002) continue;

      var flicker = 0.55 + 0.45 * Math.sin(p.age * p.flkFreq + p.flkPhase);
      a *= flicker;

      var x = p.x0 + Math.sin(p.age * p.wobFreq + p.wobPhase) * p.wobAmp;
      var y = p.y;

      var bucket = Math.round(heat(p) * (BUCKETS - 1));

      /* Radial glow behind the head. */
      var r = p.size * 7;
      ctx.globalAlpha = Math.min(a * 0.6, 1);
      ctx.drawImage(sprites[bucket], x - r, y - r, r * 2, r * 2);

      /* The spark itself, drawn as a streak rather than a dot: a short line
         back along the path it just travelled, so it reads as something
         moving. Length follows speed, and the tail leans with the sideways
         motion instead of hanging straight down. */
      var speed = -p.vy;
      var len = speed * p.trail;
      if (len > 26) len = 26;

      ctx.globalAlpha = Math.min(a, 1);
      ctx.strokeStyle = cores[bucket];

      if (len > p.size) {
        var back = len / speed;
        var vx =
          p.drift +
          Math.cos(p.age * p.wobFreq + p.wobPhase) * p.wobAmp * p.wobFreq;
        ctx.lineWidth = p.size * 1.5;
        ctx.beginPath();
        ctx.moveTo(x - vx * back, y + len);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        /* Barely moving — a streak would be a smear, so keep it a point. */
        ctx.fillStyle = cores[bucket];
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* --- Density interpolation across navigation --------------------------- */

  function readStoredDensity() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      if (raw === null) return null;
      var n = parseInt(raw, 10);
      return isNaN(n) ? null : n;
    } catch (e) {
      return null;
    }
  }

  function writeStoredDensity(n) {
    try {
      sessionStorage.setItem(STORE_KEY, String(n));
    } catch (e) {
      /* Private mode. Density simply starts at this page's target. */
    }
  }

  var target = targetCount();
  var from = readStoredDensity();
  if (from === null) from = target;
  var live = from;
  var blendStart = 0;
  var blending = from !== target;

  function ensurePool(n) {
    while (particles.length < n) {
      particles.push(spawn({}, true));
    }
  }

  /* --- Loop -------------------------------------------------------------- */

  var running = false;
  var visible = true;
  var onScreen = true;
  var last = 0;
  var frame = 0;

  function tick(now) {
    if (!running) return;
    frame = requestAnimationFrame(tick);

    /* Clamp dt so a backgrounded tab or a long task does not teleport the
       whole field on the next frame. */
    var dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    var t = now / 1000;

    if (blending) {
      var k = Math.min((now - blendStart) / BLEND_MS, 1);
      live = Math.round(from + (target - from) * k);
      ensurePool(live);
      if (k === 1) blending = false;
    }

    for (var i = 0; i < live; i++) step(particles[i], dt, t);
    draw(t);
  }

  function start() {
    if (running || reduced.matches) return;
    if (!visible || !onScreen) return;
    running = true;
    last = performance.now();
    if (blending && !blendStart) blendStart = last;
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  /* --- Reduced motion: one static frame, then nothing -------------------- */

  function renderStatic() {
    stop();
    blending = false;
    live = target;
    /* Pool particles are born prewarmed, so they are already spread up the
       viewport — one frame of that reads as a field of embers, held still. */
    ensurePool(live);
    draw(0);
  }

  /* --- Wiring ------------------------------------------------------------ */

  function init() {
    resize();
    buildGlow();
    buildSprites();
    ensurePool(Math.max(live, target));
    writeStoredDensity(target);

    if (reduced.matches) renderStatic();
    else start();
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      buildGlow();
      /* Device class may have changed with the viewport. */
      var next = targetCount();
      if (next !== target) {
        from = live;
        target = next;
        blending = true;
        blendStart = performance.now();
        writeStoredDensity(target);
      }
      ensurePool(Math.max(live, target));
      if (reduced.matches) renderStatic();
    }, 180);
  });

  /* Pause when the tab is hidden. */
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    if (visible) start();
    else stop();
  });

  /* Pause when the canvas is off-screen. It is fixed and full-viewport today,
     so this is a guard rather than a saving — but the rule is non-negotiable
     and the canvas may not always be full-bleed. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
      else stop();
    }).observe(canvas);
  }

  /* Respond if the visitor changes their motion preference mid-session. */
  var onMotionChange = function () {
    if (reduced.matches) renderStatic();
    else start();
  };
  if (reduced.addEventListener) reduced.addEventListener("change", onMotionChange);
  else if (reduced.addListener) reduced.addListener(onMotionChange);

  /* Hand this page's density to the next one so navigation interpolates
     rather than snapping. */
  window.addEventListener("pagehide", function () {
    writeStoredDensity(live);
  });

  init();
})();
