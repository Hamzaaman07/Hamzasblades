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
| `video/retreat-location.mp4` | Not shot. Location footage, golden hour or after sunset, slow movement. The Experience hero. |
| `img/retreat-still.jpg` | Not shot. Still frame from the above. Used by the Experience hero and the homepage teaser band. |

The retreat footage is still unshot; only the hero is done.

The Experience hero shows its gradient until `img/retreat-still.jpg` lands —
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
| `img/process/*.jpg` | Not shot. **Six**, one per stage on the Process page: raw stock, heat, shaping, grinding, handle, finished edge. 4:3. |
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
