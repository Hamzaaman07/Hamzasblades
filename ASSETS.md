# Assets still needed

Everything below has a placeholder in place. The layout holds its shape without
these files — dropping the real one in is the only change required, no markup
edits, except where noted.

## Logo

| Path | Notes |
|---|---|
| `img/logo.svg` | **Placeholder.** Brass disc and crescent only — the Arabic calligraphy is missing. Replace with the supplied artwork. |

If the real logo arrives as a PNG, save it at `img/logo.png` and change the
four `src="img/logo.svg"` references in `index.html`. An SVG version is worth
asking for: the mark renders at 34px in the header and up to 124px in the hero.

## Hero video

| Path | Notes |
|---|---|
| `video/hero-forge.mp4` | Slow-motion hammer strike on hot steel at night. Cut for a seamless loop — matched cut, top-of-swing to top-of-swing. |
| `img/hero-poster.jpg` | First frame of the above. Shown before the video loads. |

The video source is attached after `load` by `js/site.js`, so it never blocks
first paint. Until both files exist the hero shows a warm gradient, which is
also what sits behind the video afterwards.

Encode at 1080p, no audio track, and keep it under ~4 MB — it autoplays on
every visit.

## Retreat location video

| Path | Notes |
|---|---|
| `img/retreat-still.jpg` | Still frame for the homepage teaser band. Add as `<img>` inside the band's `<figure>`. |

The full location video belongs on the Experience page, which is not built yet.

## Process teaser image

| Path | Notes |
|---|---|
| `img/process-teaser.jpg` | One wide cinematic frame from the forge. Add as `<img>` inside the band's `<figure>`. |

## Piece photography

`data/gallery.json` currently holds **seed entries with placeholder titles** so
the featured row and the eventual gallery grid have something to render. Replace
the whole list with Hamza's real pieces.

Photographs go in `img/gallery/`, named to match each entry's `id`:

```
img/gallery/damascus-hunter-01.jpg
```

Portrait crop, 4:5. Cards render at up to ~800×1000, so shoot at least that.
Every piece shown must be Hamza's own work — no stock photography.

A card whose photograph is missing shows "photo pending" at full card height,
so a half-populated catalogue still lays out cleanly.

## Copy to confirm

- **Positioning statement** (`index.html`, the band under the hero) is written
  to the spec's voice but is not client-approved. Section 8 of the spec, which
  holds the approved copy, was not in the document supplied.
- **Contact address.** The footer and the "Custom order" button point at
  `contact.html`, which is not built yet. No email address is published on the
  site yet — confirm which address inquiries should reach.
