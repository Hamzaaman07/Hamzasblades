# Hamza's Blades

A site for a one-man forge in California. `SPEC.md` is the source of truth for
design and behavior — read it before any build session.

## Running it

Static files, no build step and no dependencies. Serve the directory over HTTP
(`fetch` of `data/gallery.json` needs a real origin, so opening `index.html`
from the filesystem will leave the featured row on its fallback line):

```
npx http-server -p 8000
```

## Layout

```
index.html          home
css/site.css        design tokens and every component
js/embers.js        the ember continuum
js/site.js          header, hero video loading, featured work
data/gallery.json   the catalogue — the only place pieces are defined
img/  video/        assets, see ASSETS.md
```

## Step 1 — what is built

- **Design system.** The full palette, both Google Fonts, the type scale, the
  8px rhythm, square corners, hairline borders, no shadows. Tokens live at the
  top of `css/site.css`.
- **The ember continuum.** Canvas 2D particle system, per-page density,
  interpolated across navigation, with every performance rule from spec §3
  honoured. See below.
- **Home.** Hero, positioning statement, featured work from `gallery.json`,
  process teaser, retreats teaser, footer.

The site is complete without the canvas. `js/embers.js` appends its own element
and removes it again on nothing — delete the script tag and the layout is
unchanged.

## Not built yet

`gallery.html`, `process.html`, `experience.html`, `about.html` and
`contact.html` are linked from the header, footer and hero buttons but do not
exist yet. They are the later steps.

The inquiry box and the Formspree wiring are spec §5, which was not in the
document supplied — the "Custom order" button points at `contact.html` as a
placeholder target.

## The ember continuum

One system, one canvas, fixed to the viewport.

**Continuity.** Particles are born with a random age, so the field is already
full on the first frame — there is no cold start after a navigation. Each page
writes its density to `sessionStorage` and the next page interpolates from it
over 800ms rather than snapping.

**Density** is set per page by `<body data-embers="home">`. Valid values are
`home`, `gallery`, `process`, `retreats`, `about` and `contact`; counts and
character come from spec §3.

**Stacking** is the seam the design hangs on. The hero sits at `z-index: 0`, the
canvas at `1`, everything after the hero at `2`. So simulated sparks are drawn
over the hero video — meeting its real sparks inside the bottom gradient — and
behind the content further down, where they read as atmosphere in the gutters
instead of litter across the photographs.

**Performance.** Device scaling (desktop full, tablet 40%, mobile 20%),
`devicePixelRatio` capped at 2, the loop paused on `visibilitychange` and by
`IntersectionObserver`, glow sprites pre-rendered per hue bucket rather than a
radial gradient per particle per frame, and `prefers-reduced-motion: reduce`
freezing the system on a single static frame.
