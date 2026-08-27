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

## What is built

Against the build order in spec §6:

| Step | State |
|---|---|
| 1. Foundation | Done — tokens, fonts, layout primitives, nav, footer |
| 2. Gallery | Not started |
| 3. Inquiry boxes | Not started |
| 4. Home, About, Process | Home done; About and Process not started |
| 5. Retreats | Not started |
| 6. The ember system | Done for home |
| 7. Performance and accessibility pass | Partly — see the ember notes below |

The ember system came in ahead of its place in that order. It is spec §6 step 6
and everything before it is meant to land first; it was built during step 1 and
is staying. Nothing depends on it, so the order it arrived in costs nothing —
but steps 2–5 are what make the site launchable, and none of them are done.

`gallery.html`, `process.html`, `experience.html`, `about.html` and
`contact.html` are linked from the header, footer and hero buttons but do not
exist yet.

The site is complete without the canvas. `js/embers.js` appends its own element
and removes nothing — delete the script tag and the layout is unchanged.

## Copy and assets

The positioning statement is the client-approved text from spec §8, verbatim.

The logo is in. Spec §7's rules on it shape where it appears: the hero mark is
capped at 120px and never upscaled, and the header and footer carry the
wordmark in Amiri instead of a mark, because at their size the calligraphy
would fall under the ~48px legibility floor. The favicon uses the simplified
crescent variant for the same reason.

ASSETS.md tracks spec §7 against what is actually in the repo.

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
