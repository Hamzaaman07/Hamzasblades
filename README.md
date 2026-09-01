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
process.html        the making, in order
experience.html     the retreats — coming soon
about.html          Hamza's story
contact.html        the inquiry box
css/site.css        design tokens and every component
css/fonts.css       @font-face for the self-hosted Amiri and Karla
fonts/              the font files themselves, OFL — see fonts/OFL.txt
_headers            cache policy, read by Cloudflare Pages and Netlify
js/pieces.js        the catalogue — loading and card rendering, shared
js/site.js          header, hero video loading, featured work
js/gallery.js       filters, grid reflow, detail view
js/inquiry.js       the inquiry box component
js/config.js        Formspree endpoint and Instagram URL — edit before launch
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
| 3. Inquiry boxes | Done — suggested messages, validation, Formspree wiring |
| 4. Home, About, Process | Done |
| 5. Retreats | Done — video slot, coming-soon treatment, email capture |
| 6. The ember system | Done — home, per-page density, the video-to-particle dissolve |
| 7. Performance and accessibility pass | Done |

The ember system was started during step 1, ahead of its place in this order,
and finished in step 6. Nothing depends on it, so arriving early cost nothing.

Every page in the spec is built, every internal link resolves, and the build
order is complete. What is left is the assets and copy listed in ASSETS.md, and
the launch step below.

## Before this can go live

**Set `FORM_ENDPOINT` in `js/config.js`.** It ships as a placeholder, and
until it is replaced no inquiry is delivered — the form validates, then tells
the visitor it cannot send rather than swallowing the message, and logs a
warning naming the file. Create the endpoint at formspree.io forwarding to
Hamza's address. Netlify is the one host with native form handling that would
replace Formspree outright; Cloudflare and Vercel have no equivalent, so on
those this endpoint is required.

`INSTAGRAM_URL` in the same file is optional: set it and the link renders on
the contact page, leave it empty and nothing renders. No dead link either way.

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
view is marked `data-intent="commission"`, so its inquiry box asks about
commissioning something similar rather than about buying a piece that is gone.

## Inquiry boxes

One component, `HB.createInquiry(context)` in `js/inquiry.js`. A name, an
email, a message — nothing structured. It appears in the gallery's detail view
and on the contact page.

The suggested message comes from the context and is spec §5's copy verbatim:

| Context | Where |
|---|---|
| `purchase` | A gallery piece that is available |
| `commission` | A gallery piece that is sold — asks for something similar |
| `custom` | `contact.html?about=custom`, where "Custom order" points |
| anything else | `contact.html`, the plain opener |

It shows greyed as the placeholder, and "Use this message" writes it in as
real, editable text with the cursor at the end. Same gesture on mobile and
desktop — no tab key, no keyboard shortcut.

A gallery inquiry carries the piece title and id as hidden fields, so an email
is never ambiguous about which piece it is about, and every inquiry is tagged
with a `source` so submissions are distinguishable in the inbox.

Validation runs on submit: empty name, empty or malformed email, empty
message. Errors show inline against the offending field in `--ember` and clear
the moment that field is edited. The submit button is never disabled — it can
be pressed, and it responds. Success replaces the form with a confirmation in
`--brass`; failure says what went wrong and what to do, and keeps everything
the visitor typed.

The email address appears nowhere in page text — it lives in the form service,
per spec §5.

## The retreats page

`experience.html`. The hero takes the same treatment as the homepage — full
bleed, muted, looping, dissolving to `--forge` at the bottom — and shows the
gradient until the location footage exists.

The email capture is the page's job. One field and a button, centred, wired to
the same endpoint as the inquiry boxes and tagged `source: retreats-list` so
the two are distinguishable in the inbox. It shares the inquiry box's
validation and failure handling, so there is one set of rules for both:
success replaces the field with a confirmation in `--brass`, failure says what
went wrong and keeps what was typed.

Nothing on the page is bookable and no dates or prices appear, per spec §10.

## Copy and assets

The positioning statement is the client-approved text from spec §8, verbatim.

The logo is in. Spec §7's rules on it shape where it appears: the hero mark is
capped at 120px and never upscaled, and the header and footer carry the
wordmark in Amiri instead of a mark, because at their size the calligraphy
would fall under the ~48px legibility floor. The favicon uses the simplified
crescent variant for the same reason.

ASSETS.md tracks spec §7 against what is actually in the repo.

## Performance and accessibility

Measured with Lighthouse on mobile, particles enabled, against spec §9's floor
of 85:

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| index | 99 | 100 | 96 | 100 |
| gallery | 100 | 100 | 96 | 100 |
| experience | 100 | 100 | 96 | 100 |

Zero axe-core violations on every page, including the gallery with its detail
view open. Every focusable element on every page is reachable by keyboard and
visibly focused. Responsive from 360px to 2560px with no horizontal scroll at
either end.

Two things found and fixed in this pass are worth knowing about, because both
were invisible until measured:

**The fonts were the single biggest cost.** Loading Amiri and Karla from
fonts.googleapis.com is a render-blocking request to a third-party origin.
Removing it took the homepage from 89 to 100 and Speed Index from 19.7s to
0.9s. They are now self-hosted in `fonts/` — Latin and Latin Extended only,
about 65 KB, since no page sets Arabic text and Karla 500 was requested but
never used. The site now makes no third-party requests at all. This also fixes
a real failure mode: when Google Fonts is slow or blocked, the old build
stalled and then fell back to Times.

**The gallery grid shifted as it loaded.** The catalogue arrives by fetch, so
the grid went from one line of fallback text to several thousand pixels of
cards, shoving the page down — a 0.373 layout shift that put the page at 71,
below the spec's floor. The grid now reserves its height until the cards land.

Remaining Lighthouse notes, all judged not worth acting on: the console 404s
are the gallery photographs and hero video that have not been shot; "minify
CSS/JS" measures uncompressed bytes, and all the CSS and JS together gzip to
21 KB, so a build step would buy little against the complexity; cache lifetimes
are handled by `_headers`, which the local test server ignores but Cloudflare
reads.

## The ember continuum

One system, one canvas, fixed to the viewport. The site is complete without it:
`js/embers.js` appends its own element and removes nothing, so deleting the
script tag leaves every layout unchanged.

**Continuity.** Particles are born with a random age, so the field is already
full on the first frame — there is no cold start after a navigation. Each page
writes its density to `sessionStorage` and the next page interpolates from it
over 800ms rather than snapping.

**Density** is set per page by `<body data-embers="home">`. Valid values are
`home`, `gallery`, `process`, `retreats`, `about` and `contact`; counts and
character come from spec §3. Verified against that table at all three device
tiers — desktop full, tablet 40%, mobile 20%.

**The dissolve** is the handoff spec §3 calls the moment worth getting right.
Two things carry it. `focus` centres the spawn band on the homepage, so sparks
read as coming off one piece of steel below the frame rather than as ambient
dust across the width. `glow` draws a soft warm wash along the bottom edge —
the forge below the frame — that the sparks rise out of, at an intensity that
tracks each page's density.

That glow lives on the canvas rather than in CSS on purpose: the canvas is
fixed to the viewport, so the wash travels with it. Put the same gradient in
the hero and it gets clipped at the hero's bottom edge, drawing a hard
horizontal line across the page the moment you scroll.

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
