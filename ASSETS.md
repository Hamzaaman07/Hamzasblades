# Assets still needed

Tracks SPEC section 7 against what is actually in the repo. Everything below has
a placeholder or a graceful absence — the layout holds its shape without these
files, and dropping the real one in is the only change required except where
noted.

## Logo

| File | Status |
|---|---|
| `img/logo.png` | **Missing from the repo.** The spec marks the PNG as supplied (✓), but the file has not landed here yet. |
| `img/logo.svg` | Not made. Vector trace, needed for crisp scaling. |
| `img/crescent.svg` | **Drawn, needs approval.** The simplified crescent variant section 7 lists as "not made". |

**The PNG is the one blocker.** Drop it at `img/logo.png` and the hero mark
appears at 120px with no other change — the markup and the 120px ceiling are
already in place. Until then `js/site.js` removes the element and the hero runs
on type alone, which is what section 7 asks for when the mark cannot be shown
properly.

`img/crescent.svg` is drawn to the supplied logo's geometry — brass disc,
crescent in the dark maroon-brown the calligraphy reads as (`#3D1512`). It is
the favicon and is the fallback for anything below the ~48px legibility floor.
It is a proposal, not approved artwork; worth Hamza's eye against the original.

Where section 7's rules land in the build:

- The mark is **not** used in the header or the footer. Both would sit near
  34px, under the ~48px floor, so they carry the wordmark in Amiri instead.
- The hero mark is capped at 120px and never upscaled.
- The mark only ever sits on `--forge`.

## Video

| File | Status |
|---|---|
| `video/hero-forge.mp4` | Not shot. Slow-motion hammer strike on hot steel at night, matched-cut loop. |
| `img/hero-poster.jpg` | Not shot. Still frame from the above. |
| `video/retreat-location.mp4` | Not shot. Belongs to the Experience page, not built yet. |
| `img/retreat-still.jpg` | Not shot. Still frame for the homepage teaser band. |

The hero source is attached after `load` by `js/site.js`, so it never blocks
first paint. Until both files exist the hero shows a warm gradient, which is
also what sits behind the video afterwards. Encode 1080p, no audio track, and
keep it under ~4 MB — it autoplays on every visit.

Section 7 suggests free forge footage from Pexels or Coverr as a placeholder
during the build. Nothing has been pulled in — the gradient is standing in.

**Shooting notes for the hero** (from section 7): 15–20 strikes in one
continuous take, 120fps or higher, locked-off tripod, expose for the steel and
let the room go fully black.

## Photography

| File | Status |
|---|---|
| `img/gallery/*.jpg` | Partial. ~20 pieces, black backdrop, raking side light. |
| `img/process-teaser.jpg` | Not shot. One wide cinematic frame for the homepage band. |
| `img/process/*.jpg` | Not shot. 5–6 stages, for the Process page. |
| `img/portrait.jpg` | Not shot. Optional, strong on About. |

Piece photographs go in `img/gallery/`, named to match each entry's `id` in
`data/gallery.json`:

```
img/gallery/damascus-hunter-01.jpg
```

Portrait crop, 4:5. Cards render at up to ~800×1000, so shoot at least that.
Every piece shown must be Hamza's own work — no stock photography.

A card whose photograph is missing shows "photo pending" at full card height, so
a half-populated catalogue still lays out cleanly.

## Data

`data/gallery.json` holds **seed entries with placeholder titles** so the
featured row has something to render. To be replaced with Hamza's real pieces.

## Still to be decided

- **Formspree endpoint.** Section 5 wants it in a single marked config
  constant. Nothing is wired yet — inquiry boxes are build step 3. If the host
  turns out to be Netlify or Vercel, their native form handling replaces
  Formspree and is free.
- **Instagram URL.** Section 4 wants it on About and Contact.
