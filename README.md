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
| 6. The ember system | Done for every page built so far |
| 7. Performance and accessibility pass | Partly — see the ember notes below |

The ember system came in ahead of its place in that order. It is spec §6 step 6
and everything before it is meant to land first; it was built during step 1 and
is staying. Nothing depends on it, so the order it arrived in costs nothing.

Every page in the spec is now built and every internal link resolves. What is
left is step 7, the performance and accessibility pass, and the assets and copy
listed in ASSETS.md.

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
