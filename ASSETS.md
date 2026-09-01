# Assets still needed

Tracks SPEC section 7 against what is actually in the repo. Everything below has
a placeholder or a graceful absence — the layout holds its shape without these
files, and dropping the real one in is the only change required except where
noted.

## Logo

| File | Status |
|---|---|
| `img/logo.png` | Supplied. 618×618 RGBA. The master — kept untouched, not referenced by any page. |
| `img/logo-240.png` | Derived. What the hero actually loads. |
| `img/logo.svg` | Not made. Vector trace, needed for crisp scaling. |
| `img/crescent.svg` | **Drawn, needs approval.** The simplified crescent variant section 7 lists as "not made". |

`img/logo-240.png` is the master resampled to 240px (Lanczos, 64-colour
palette): 9 KB against 314 KB, indistinguishable at display size, and the
downscale from 618px smooths the ragged cutout edges section 7 warns about.
240px covers a 2× display at the 120px ceiling. Regenerate it if the master
changes:

```
python3 -c "from PIL import Image; \
Image.open('img/logo.png').convert('RGBA').resize((240,240), Image.LANCZOS) \
.quantize(colors=64, method=Image.FASTOCTREE).save('img/logo-240.png', optimize=True)"
```

An SVG trace is still worth having — it would replace both files and drop the
120px ceiling.

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
| `img/ChatGPT Image Aug 31, 2026, 06_20_20 PM.png` | Supplied. 1672×941. The hero still — master, kept untouched. |
| `img/hero-forge-1672.{jpg,webp}` | Derived. What the hero loads on wide viewports. |
| `img/hero-forge-1000.{jpg,webp}` | Derived. Narrow viewports. |
| `video/hero-forge.mp4` | Not shot. Slow-motion hammer strike on hot steel at night, matched-cut loop. |
| `video/retreat-location.mp4` | Not shot. Belongs to the Experience page, not built yet. |
| `img/retreat-still.jpg` | Not shot. Still frame for the homepage teaser band. |

**The hero still is AI-generated.** It is doing the job section 7 sanctions for
placeholder footage during the build, and it is not a piece of Hamza's work
being passed off as one, so it does not cross section 10's line. But this is a
business whose whole proposition is that a real person made a real object, and
generated imagery of a forge undercuts that if anyone spots it. Worth replacing
with a frame from the real hero shoot when that happens. Flagging, not
blocking — it is in and it looks right.

The derivatives are 14 KB (WebP) against the master's 694 KB, with a mean
per-channel difference under 1. Regenerate if the master changes:

```
python3 -c "from PIL import Image; \
src=Image.open('img/ChatGPT Image Aug 31, 2026, 06_20_20 PM.png').convert('RGB'); \
[ (lambda im,w: (im.save(f'img/hero-forge-{w}.jpg',quality=82,optimize=True,progressive=True), \
im.save(f'img/hero-forge-{w}.webp',quality=80,method=6)))( \
src if w==src.width else src.resize((w,round(src.height*w/src.width)),Image.LANCZOS), w) \
for w in (1000,1672) ]"
```

The still is 1672px wide, so viewports past that upscale it. It is dark and
low-detail enough to hold up, but a wider master would be better.

The hero video source is attached after `load` by `js/site.js`, so it never
blocks first paint, and it fades up over the still once it can play. Until the
file exists the still is simply what the hero shows. Under
`prefers-reduced-motion` the video element is removed outright — an autoplaying
loop is motion. Encode 1080p, no audio track, and keep it under ~4 MB.

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

Both live in `js/config.js`, the single marked place for them.

- **Formspree endpoint.** `FORM_ENDPOINT` ships as a placeholder. **Until it is
  replaced, no inquiry is delivered** — the form validates, then tells the
  visitor it cannot send rather than swallowing the message. Create it at
  formspree.io forwarding to Hamza's address. If the host turns out to be
  Netlify or Vercel, their native form handling replaces Formspree and is free.
- **Instagram URL.** `INSTAGRAM_URL` is empty, so the link does not render.
  Set it and it appears on the contact page. Section 4 also wants it on About,
  which is not built yet.

## Copy to confirm

The positioning statement, About and Retreats copy are all client-approved from
section 8. These are not, and were written to the voice rules:

- **Contact page** — the page title, the line under it, and the shipping note.
- **Gallery page** — the title and the line under it.
- **Homepage teasers** — the process band's two lines. (The retreats teaser is
  approved copy.)
- **Inquiry validation and status messages** — what the form says when a field
  is missing, when sending fails, and when it succeeds.
