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
| `video/Forging Video.mov` | **Supplied.** 1920×1080, 30fps, 10.4s, HEVC, 15 MB. The master — kept untouched. |
| `video/hero-forge.webm` | Derived. VP9, 0.34 MB. What the hero plays. |
| `video/hero-forge.mp4` | Derived. H.264, 1.4 MB. The universal fallback, and what Safari uses. |
| `img/hero-forge-1920.{jpg,webp}` | Derived — the loop's first frame. What the hero loads on wide viewports. |
| `img/hero-forge-1000.{jpg,webp}` | Derived. Narrow viewports. |
| `img/ChatGPT Image Aug 31, 2026, 06_20_20 PM.png` | Superseded by the real footage. No page references it. |
| `video/hype video (1).mp4` | **Supplied.** 1080×1920, 60fps, 27s, 24 MB, with audio. The retreat film master — kept untouched. |
| `video/retreat-teaser.mp4` | Derived. 608×1080, 24fps, 3.2 MB. The home page's retreats band. |
| `img/retreat-teaser.{jpg,webp}` | Derived — the film's first frame. Its poster. |
| `video/retreat-location.mp4` | Not shot. Location footage for the **Experience page hero**, which is still on its gradient. |
| `img/retreat-still.jpg` | Not shot. Still frame from the above, for the Experience hero. |

### The retreats band on the home page

Hamza's retreat film — forest, the outdoor forge, sparks, animals, archery,
a blade standing in a creek. It is the band's own subject rather than a stock
mood shot, which is what section 10 asks for.

**It is a montage, so it does not get a crossfade.** The hero and the Process
stages are single continuous shots, where a dissolve at the repeat is what
makes the loop invisible. This film already cuts about nine times; one more
cut at the loop point is the edit's own language, and a dissolve there would
read as a mistake rather than as a join. A crossfade was tried and removed:
it put the closing dark-forge shot at frame zero, which also made the poster
a black rectangle.

**Nothing is cropped.** The film is vertical and the band's default frame is
16:9, which would have taken two thirds of it. The band now takes the film's
own 9:16, capped in height with the width following, and `.band--portrait`
gives the copy the larger column since the frame is narrow. As on the Process
page, `--ar` is in `index.html` rather than in script because it has to be
right at first paint.

One trap worth recording: the portrait column cannot be `auto`. The figure's
width is a percentage of the column and the column would be sized from the
figure — circular, and it resolves to zero. It collapsed the band to 2×4
pixels. The column needs a definite `fr`.

Audio is stripped, as it must be for an autoplaying band. If the music
matters, this is the wrong place for the film.

**Weight.** 3.2 MB, which is a lot for the home page and is the reason it is
lazy: nothing is fetched until the band is within 300px of the viewport, and
it pauses when scrolled away. Measured, the page is still 99 on Lighthouse
mobile with CLS 0.003. VP9 was tried and lost badly — 5.7 MB against 3.2 —
so this is MP4 only, and a browser without H.264 shows the poster. Trimming
the 27 seconds would be the next lever if it ever needs to be lighter; the
first ~12s already covers forest, forge, sparks, animals and archery.

```
ffmpeg -y -i "video/hype video (1).mp4" -an \
  -vf "scale=608:1080,setsar=1,fps=24,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slower -crf 32 -g 48 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart video/retreat-teaser.mp4
ffmpeg -y -i video/retreat-teaser.mp4 -vf "select='eq(n,0)',scale=iw/2:-2" \
  -vsync 0 -frames:v 1 /tmp/rt.png
python3 -c "from PIL import Image; im=Image.open('/tmp/rt.png').convert('RGB'); \
im.save('img/retreat-teaser.jpg',quality=66,optimize=True,progressive=True); \
im.save('img/retreat-teaser.webp',quality=58,method=6)"
```

The **Experience page hero** is a different slot and still unshot. It shows
its gradient until `img/retreat-still.jpg` lands —
the image removes itself while missing, so there is no broken frame. Drop the
file in and it appears with no markup change; derivatives are worth generating
for it the same way as the hero still.

The About page uses the hero forge still in place of a portrait, which is what
section 4 asks for when no portrait exists. Drop `img/portrait.jpg` in and swap
the `<picture>` in `about.html` when it is shot.

**The AI-generated still is gone.** It stood in during the build, and section 7
sanctions that, but this is a business whose whole proposition is that a real
person made a real object — generated imagery of a forge undercuts that if
anyone spots it. The real footage arrived, so the hero still is now its first
frame and no page references the generated image any more.

That the still is literally frame one of the loop is the point: the handoff
from still to video is invisible, because it is the same anvil, the same
billet and the same light rather than a dissolve between two scenes.

**Deriving the hero from new footage.** The master is rotated 180° by its
display matrix (shot with the phone upside down), carries an audio track and a
data stream, and is full-range HEVC — all four need handling, and the last one
quietly crushes the blacks if you skip it. This bakes the rotation in, drops
the extra streams, converts the range properly, and crossfades the last second
into the first so the loop has no seam:

```
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "video/Forging Video.mov")
X=1.0; E=$(python3 -c "print($D-$X)")
FILTER="[0:v]scale=1920:1080:in_range=full:out_range=tv,format=yuv420p,split=2[h][t];\
[h]trim=0:$E,setpts=PTS-STARTPTS[head];\
[t]trim=start=$E,setpts=PTS-STARTPTS,format=yuva420p,fade=out:st=0:d=$X:alpha=1[tail];\
[head][tail]overlay=eof_action=pass,format=yuv420p[v]"

ffmpeg -y -i "video/Forging Video.mov" -filter_complex "$FILTER" -map "[v]" -an \
  -c:v libx264 -profile:v high -preset slower -crf 24 -g 60 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart video/hero-forge.mp4

ffmpeg -y -i video/hero-forge.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 \
  -row-mt 1 -cpu-used 2 -g 60 -pix_fmt yuv420p -an video/hero-forge.webm

ffmpeg -y -i video/hero-forge.mp4 -vf "select='eq(n,0)'" -vsync 0 -frames:v 1 /tmp/poster.png
python3 -c "from PIL import Image; \
src=Image.open('/tmp/poster.png').convert('RGB'); \
[ (lambda im,w: (im.save(f'img/hero-forge-{w}.jpg',quality=82,optimize=True,progressive=True), \
im.save(f'img/hero-forge-{w}.webp',quality=80,method=6)))( \
src if w==src.width else src.resize((w,round(src.height*w/src.width)),Image.LANCZOS), w) \
for w in (1000,1920) ]"
```

**The loop seam was measured, not eyeballed.** Frame-to-frame, the repeat point
differs by a mean of 1.45/255 — where two ordinary consecutive frames mid-clip
differ by 1.28. The join is within the clip's own flicker, so it is invisible.

**It must not look like a video.** No controls, muted, `playsinline`, autoplay,
loop — it reads as a moving photograph, which is the whole point of not
shipping a GIF. WebM is offered first and MP4 second: the browser commits to
the first source it can play, and the WebM is a quarter of the bytes. Both
sources are attached after `load` by `js/site.js`, so neither blocks first
paint, and the video fades up over the still once it can play. Under
`prefers-reduced-motion` the element is removed outright — an autoplaying loop
is motion.

Measured cost on the homepage: none. Lighthouse mobile is 99 with the video and
99 without it, and the 1080p still is 34 KB as JPEG, 17 KB as WebP.

Contrast over the moving footage was measured across the loop rather than on
one frame, since the fire is what sits behind the type: the title holds at
3.60:1 worst case (large text needs 3.0) and the eyebrow at 4.89:1 (small text
needs 4.5).

A GIF was considered and rejected: this clip would be roughly 40–80 MB as one,
capped at 256 colours — which would wreck the only thing in frame, the gradient
of hot steel glowing into black — and it would ignore `prefers-reduced-motion`
entirely.

## Photography

| File | Status |
|---|---|
| `img/gallery/*` | **Complete.** 18 pieces, 63 photographs, derived from the masters under `img/Knives/`, `img/Swords/` and `img/Woodworking/`. |
| `img/process-teaser.jpg` | Not shot. One wide cinematic frame for the homepage band. |
| `video/*.mov` (six) | **Supplied.** The stage masters — `Raw Stock`, `heat`, `shaping`, `grinding`, `handle`, `finished edge`. Kept untouched. |
| `video/process/*` and `img/process/*` | **Complete.** All six stages, derived from those masters. |
| `img/portrait.jpg` | Not shot. Hamza at the forge, for About. |

Derived photographs go in `img/gallery/`, named `<piece-id>-<NN>`. Every piece
shown is Hamza's own work — no stock photography. A card whose photograph is
missing shows "photo pending" at full card height, so a half-populated
catalogue still lays out cleanly.

### Adding a piece

Masters live at `img/<Category>/<Piece Title>/`, one folder per piece —
`Knives/`, `Swords/`, `Woodworking/`. The folder name is the piece title and
the trailing number in each filename is the display order. Originals are kept
as masters; the web copies are derived into `img/gallery/`.

This regenerates every piece from scratch — run it after adding a folder. It
reads the categories, derives both sizes in both formats, and prints what it
made. 150 MB of masters became 22 MB of derived files:

```
python3 - <<'EOF'
import pathlib, re, unicodedata
from PIL import Image

root, out = pathlib.Path('img'), pathlib.Path('img/gallery')
out.mkdir(exist_ok=True)

def slug(n):
    s = unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()

def order(f):                      # dagger1, dagger 2, dagger3.png.png, dagger (=1)
    stem = re.sub(r'\.(png|jpg|jpeg|webp)$', '', f.name, flags=re.I)
    stem = re.sub(r'\.(png|jpg|jpeg|webp)$', '', stem, flags=re.I)
    m = re.search(r'(\d+)', stem)
    return int(m.group(1)) if m else 1

for cat in ('Knives', 'Swords', 'Woodworking'):
    for d in sorted((root / cat).iterdir()):
        if not d.is_dir():
            continue
        files = sorted([f for f in d.iterdir() if f.is_file() and not f.name.startswith('.')],
                       key=lambda f: (order(f), f.name))
        base = slug(d.name)
        for i, f in enumerate(files, 1):
            im0 = Image.open(f).convert('RGB')
            for W, suf in ((1000, ''), (500, '-sm')):
                w = min(W, im0.width)
                im = im0 if w == im0.width else im0.resize(
                    (w, round(im0.height * w / im0.width)), Image.LANCZOS)
                im.save(out / f'{base}-{i:02d}{suf}.jpg', quality=80,
                        optimize=True, progressive=True)
                im.save(out / f'{base}-{i:02d}{suf}.webp', quality=78, method=4)
        print(f'{cat}/{d.name}: {len(files)} views -> {base}')
EOF
```

Two sizes matter: the grid card is ~300px wide and the detail photo ~500, so
serving the big copy to a card costs real blocking time on a phone — 250ms of
it, measured, on a single piece.

**Nothing is cropped.** Cards keep a 4:5 frame so the grid rows stay even, but
the photograph is fitted whole inside it, and the detail view uses a fixed box
with the image contained. Several pieces — Sword of Uthman RA, Zulfiqar Sword,
Epoxy Woodwork — are photographed landscape, and a centre crop to 4:5 would
have taken half the blade. Portrait pieces fill their frame almost exactly;
landscape ones sit letterboxed on `--ash`.

Then add the entry to `data/gallery.json`. Beyond the spec's fields:

- `webp` — optional, and **only list it if the file exists**. A `<source>`
  pointing at a missing file is committed to by the browser rather than
  falling back to the `<img>`, so a wrong path breaks the photo rather than
  degrading.
- `card` — optional `{ image, webp }`, the 500px copy used by grid cards and
  the detail view's thumbnails.
- `photos` — optional array of extra views for the detail view, each the same
  shape plus an `alt`. The card photo is always the top-level `image`.

Everything except `image` is optional; a piece with just `image` behaves
exactly as before.

### The Process stages

All six are in, each a short silent loop with the loop's own first frame as
its poster. Five were shot vertically on a phone and `shaping` landscape.

| Stage | Master | Shipped loop | Frame |
|---|---|---|---|
| Raw stock | `Raw Stock.mov` 1.7s | 1.2s, 422 KB | 9:16 |
| Heat | `heat.mov` 8.2s | 3.1s, 826 KB | 9:16 |
| Shaping | `shaping.mov` 8.8s | 8.8s, 285 KB | 16:9 |
| Grinding | `grinding.mov` 7.3s | 3.1s, 371 KB | 9:16 |
| Handle | `handle.mov` 8.1s | 5.5s, 459 KB | 9:16 |
| Finished edge | `finished edge.mov` 3.5s | 3.5s, 407 KB | 9:16 |

**Nothing is cropped.** Each frame takes its own clip's aspect ratio rather
than a house 4:3, because forcing a 9:16 phone clip into 4:3 cuts about two
thirds of it away. A 9:16 clip at full column width would be over a thousand
pixels tall, so height is capped (`--step-cap`, `min(68vh, 600px)`) and the
width follows from the ratio: tall stages sit narrow and centred in their
column, the landscape one fills it.

**The frame's shape lives in `process.html`, not in the manifest.** Each
figure carries `style="--ar: 720 / 1280"`. That looks like duplication and is
deliberate: setting it from the fetched JSON instead reshaped every frame once
the data arrived and cost 0.162 of layout shift, measured, dropping the page
from 98 to 92. It has to be right at first paint. Getting it wrong is harmless
— it reserves the wrong box for a moment — which is why it is safe in markup
where a file path is not. **If a stage is ever refilmed the other way round,
change `--ar` in `process.html` as well as `width`/`height` in the manifest.**

**Three of the masters do not loop at their own ends** — the camera has moved
by the time the clip stops. So the encode does not assume the whole clip is
the loop: it searches for the pair of frames that actually match, subject to
keeping enough duration, and trims to those. On `grinding` that took the loop
gap from 57.9 to 28.4 before any crossfade; on `handle`, 22.0 to 10.8. `heat`
was trimmed the same way, and `raw-stock`, `shaping` and `finished-edge` were
kept whole because their own ends already matched. Then the last second or so
crossfades into the first.

Measured on the shipped files, every seam is at or below the clip's own
frame-to-frame motion — which is to say all six loop invisibly:

| Stage | Loop seam | Normal frame step |
|---|---|---|
| Raw stock | 18.16 | 18.71 |
| Heat | 12.62 | 11.19 |
| Shaping | 1.92 | 1.32 |
| Grinding | 9.81 | 14.27 |
| Handle | 11.78 | 13.05 |
| Finished edge | 9.68 | 10.98 |

**WebM is not always the winner.** On the dark hero footage VP9 beat x264 by
four to one. On these daylight clips — grass, straw, a bright forge — it
loses, sometimes badly: `raw-stock` was 422 KB as MP4 and 1.2 MB as WebM. So
each clip ships whichever is smaller, and `loop.webm` is listed in the
manifest **only where WebM actually won**. `raw-stock` and `heat` are MP4
only. The MP4 is always present: it is what Safari uses, and it is the
fallback for any browser without VP9.

A browser with no H.264 at all — some Linux Chromium builds — cannot play
those two, and shows the poster still instead of a black frame. That path is
verified, not assumed: the test browser here is one of those builds.

Weight, if a visitor scrolls the whole page: **2.8 MB on Chrome, 3.4 MB on
Safari**, and less in practice because loading is lazy. 5.0 MB sits in the
repo, since the MP4 ships alongside each WebM.

**Regenerating.** The masters carry rotation metadata (`-90`, `+90`, `-180`),
an audio track and a data stream; `ffmpeg` autorotates and the encode drops
the rest. Find each clip's loop point first, then:

```
# $1 master  $2 slug  $3 start  $4 duration  $5 crossfade  $6 W  $7 H
E=$(python3 -c "print(round($4-$5, 3))")
V="scale=$6:$7:force_original_aspect_ratio=decrease,pad=$6:$7:(ow-iw)/2:(oh-ih)/2:color=0x0A0908,setsar=1"
F="[0:v]$V,fps=24,format=yuv420p,split=2[h][t];\
[h]trim=0:$E,setpts=PTS-STARTPTS[head];\
[t]trim=start=$E,setpts=PTS-STARTPTS,format=yuva420p,fade=out:st=0:d=$5:alpha=1[tail];\
[head][tail]overlay=eof_action=pass,format=yuv420p[v]"

ffmpeg -y -ss "$3" -t "$4" -i "$1" -filter_complex "$F" -map "[v]" -an \
  -c:v libx264 -profile:v high -preset slower -crf 29 -g 48 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart "video/process/$2.mp4"
ffmpeg -y -i "video/process/$2.mp4" -an -c:v libvpx-vp9 -crf 42 -b:v 0 \
  -row-mt 1 -cpu-used 2 -g 48 "video/process/$2.webm"   # keep only if smaller
ffmpeg -y -i "video/process/$2.mp4" -vf "select='eq(n,0)',scale=iw/2.5:-2" \
  -vsync 0 -frames:v 1 /tmp/p.png
python3 -c "from PIL import Image; im=Image.open('/tmp/p.png').convert('RGB'); \
im.save('img/process/$2.jpg',quality=62,optimize=True,progressive=True); \
im.save('img/process/$2.webp',quality=55,method=6)"
```

Vertical clips go to 720x1280 and landscape to 1280x720; the display box is at
most 338px wide for a vertical stage, so that covers a 2x screen with room.
Posters are deliberately cheap — they are on screen for a moment and then
replaced.

**Six loops on one page is the thing that would go wrong**, so `js/loops.js`
is frugal by construction: nothing is fetched until a stage is within 300px of
the viewport, and a loop that scrolls away is paused rather than left decoding.
With all six in, the page measures 99 on Lighthouse mobile with CLS 0.001.

Under `prefers-reduced-motion` no video element is ever created; the stage
shows its poster still. There is nothing to operate — no controls, no sound,
no timeline — so the loops are `aria-hidden` and untabbable, and nothing
inside the figures takes keyboard focus.

**These are daylight shots**, unlike the hero and the catalogue. The Process
page now reads brighter and greener than the rest of the site. That is what
the work actually looks like, so it is not a defect, but it is a deliberate
tonal break worth knowing about.

## Data

`data/gallery.json` is now the real catalogue: 18 pieces, no placeholders.
Titles come from the master folder names.

**Two fields still need Hamza:**

- `status` is `available` on every piece because there was no way to know
  otherwise. Anything already sold needs changing to `sold` — those stay
  visible at 70% as portfolio, and their inquiry box switches to asking about
  a commission.
- `featured` is set on four pieces (Al-Hajarah Dagger, Karambit, Zulfiqar
  Sword, Wooden Palestine Map), chosen for a spread across the three
  categories rather than by preference. The homepage shows the first four
  flagged, in array order.

Display order is the array order. Within a piece, view order follows the
trailing number in the master filename.

## Still to be decided

Both live in `js/config.js`, the single marked place for them.

- **Formspree endpoint.** `FORM_ENDPOINT` ships as a placeholder. **Until it is
  replaced, no inquiry is delivered** — the form validates, then tells the
  visitor it cannot send rather than swallowing the message. Create it at
  formspree.io forwarding to Hamza's address. Netlify is the one host whose
  native form handling would replace Formspree outright; Cloudflare and Vercel
  have no equivalent, so on those this endpoint is required.
- **Instagram URL.** `INSTAGRAM_URL` is empty, so the link does not render.
  Set it and it appears on both the contact page and About, as section 4 asks.

## Copy to confirm

The positioning statement, About and Retreats copy are all client-approved from
section 8. These are not, and were written to the voice rules:

- **Contact page** — the page title, the line under it, and the shipping note.
- **Gallery page** — the title and the line under it.
- **Process page** — the title, the line under it, and all six stage
  descriptions. Written to be technically accurate as well as in voice; worth
  Hamza checking the smithing itself, not just the tone.
- **About page** — the title "The forge and the hands". The four body
  paragraphs are section 8's approved copy, verbatim and untouched.
- **Closing line** on About and Process — section 8 gives it as an example
  ("e.g."), so it is used as written but is not strictly approved.
- **Experience page** — the title "Under open sky", the three block headings
  and their descriptions, and the sign-up band's heading and line. The
  paragraph under the hero is section 8's approved copy, verbatim. Note that
  section 8 warns the retreat forge is in the Sierra Nevada and distinct from
  the two working forges — the copy here says Sierra Nevada only and never
  implies otherwise.
- **Homepage teasers** — the process band's two lines. (The retreats teaser is
  approved copy.)
- **Inquiry validation and status messages** — what the form says when a field
  is missing, when sending fails, and when it succeeds.
