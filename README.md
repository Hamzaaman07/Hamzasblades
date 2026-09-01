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
gallery.html        the collection
css/site.css        design tokens and every component
js/pieces.js        the catalogue — loading and card rendering, shared
js/site.js          header, hero video loading, featured work
js/gallery.js       filters, grid reflow, detail view
js/embers.js        the ember continuum
data/gallery.json   the only place pieces are defined
img/  video/        assets, see ASSETS.md
```

There is no build step, so each page carries its own copy of the header and
footer markup. Keep them in sync by hand when either changes.

## What is built

Against the build order in spec §6:

| Step | State |
|---|---|
| 1. Foundation | Done — tokens, fonts, layout primitives, nav, footer |
| 2. Gallery | Done — JSON structure, grid, filters, detail view |
| 3. Inquiry boxes | Not started |
| 4. Home, About, Process | Home done; About and Process not started |
| 5. Retreats | Not started |
| 6. The ember system | Done for home and gallery |
| 7. Performance and accessibility pass | Partly — see the ember notes below |

The ember system came in ahead of its place in that order. It is spec §6 step 6
and everything before it is meant to land first; it was built during step 1 and
is staying. Nothing depends on it, so the order it arrived in costs nothing.

`process.html`, `experience.html`, `about.html` and `contact.html` are linked
from the header, footer and hero buttons but do not exist yet.

## The gallery

Every piece shows by default, newest first — filters refine, they never hide
the catalogue behind a click. The filter set is built from the types actually
present in the data, so a category with nothing in it never appears.

Filtering runs a FLIP pass: measure every visible card, apply the filter,
measure again, then play the difference back as a transform. The grid moves
instead of snapping. Under `prefers-reduced-motion` it just toggles.

Clicking a piece opens the detail view. Escape closes it, focus is trapped
inside while it is open and returns to the card that opened it. The card's
title is the control and its hit area is stretched over the whole card, so the
accessible name is the piece name rather than "image".

Sold pieces stay in the catalogue at 70% — they are portfolio. Their detail
view is marked `data-intent="commission"` so build step 3 can ask about
commissioning something similar rather than about buying a piece that is gone.

The inquiry box itself is spec §5 and belongs to step 3. Its mount point
(`[data-lightbox-inquiry]`) already carries the piece id, title and intent.

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
