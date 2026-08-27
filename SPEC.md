# Hamza's Blades — Build Spec

A site for a one-man forge in California. Sells hand-forged blades, shows the making,
and will eventually host weekend forging retreats.

This document is the source of truth for design and behavior. Read it before any
build session. If something here conflicts with a later instruction, ask.

---

## 1. What this is

**Client:** Hamza — Muslim bladesmith, forges in Sacramento and Huntington Beach, CA.

**Sells:** Swords, knives, axes, spears. Also woodworking — boxes, bows, arrows.

**The site's job:** Make a visitor feel the heat of the forge, then trust the person
behind it enough to send an inquiry.

**Not doing yet:** No cart, no checkout, no payment. Every purchase path is an inquiry
that lands in Hamza's inbox. Retreats are announced but not bookable.

**Audience:** People who want a real object made by a real person — outdoorsmen,
collectors, Muslims looking for a craft tradition that connects to the natural world.

---

## 2. Design direction

Dark, hot, and quiet. The page is a forge at night: near-black, with light coming
only from the metal. Restraint everywhere except the embers.

### Palette

```
--forge        #0A0908   page background, near-black with a warm bias
--ash          #16130F   elevated surfaces, cards, form fields
--ash-line     #241E18   hairline borders
--brass        #C89F68   logo tan — headings, rules, accents
--parchment    #E4D9C6   body text on dark
--smoke        #8B7B64   secondary text, captions, metadata
--ember        #D2662C   primary CTA, active states
--ember-hot    #F0A555   glow cores, hover, particle highlights
```

Brass comes straight from the logo. Ember is the fire. Nothing else gets added —
no blues, no greens, no white. If a state needs to read as "error," use `--ember`
at higher weight rather than introducing red.

Pure white (`#FFFFFF`) never appears. It reads cold and breaks the warmth.

### Typography

**Display — Amiri (Google Fonts).** A Naskh-derived family with a Latin companion.
Chosen because the logo is Arabic calligraphy: the type system should descend from
the same tradition rather than sitting next to it. Used for page titles, piece names,
and pull quotes. Never for UI.

**Body — Karla (Google Fonts).** A grotesque with slightly irregular details — warm
where Inter or Helvetica would be neutral. All paragraphs, navigation, buttons, forms.

**Utility.** Karla at 11–12px, uppercase, `letter-spacing: 0.18em`, color `--smoke`.
For eyebrows, filter labels, and metadata. This letterspaced treatment is the site's
connective tissue — use it consistently and nowhere else.

### Type scale

```
Hero title      Amiri  clamp(2.75rem, 7vw, 5.5rem)   weight 400   ls 0.02em
Page title      Amiri  clamp(2rem, 4.5vw, 3.25rem)   weight 400
Section head    Amiri  1.75rem                        weight 400
Piece name      Amiri  1.25rem                        weight 400
Body            Karla  1.0625rem                      weight 400   lh 1.75
Small           Karla  0.9375rem                      weight 400
Eyebrow         Karla  0.6875rem  uppercase  ls 0.18em
```

Sentence case everywhere except eyebrows. No bold display type — Amiri at 400 with
space around it carries more weight than Amiri at 700 crowded.

### Spacing and layout

Content column maxes at 1280px, text blocks at 68ch. Vertical rhythm on an 8px base;
section padding `clamp(5rem, 12vh, 9rem)` top and bottom. Generous. The darkness needs
room or it reads as cramped rather than atmospheric.

Borders are `1px solid var(--ash-line)`. No border radius above 2px anywhere —
this is forged steel, not software. Buttons and inputs are square.

No box shadows. Depth comes from the ember glow, nothing else.

---

## 3. The signature element: the ember continuum

**This is the one thing the site is remembered by. Build it well and keep everything
else disciplined around it.**

A single particle system spans the entire site. Sparks rise from the bottom of the
viewport, drift, flicker, and fade — continuous across page navigation, never
restarting. The visitor's sense is of standing in one room the whole time, with the
forge always somewhere below the frame.

On the homepage, the hero video's real sparks dissolve into the simulated ones at the
video's lower edge, so there's no visible seam between footage and code. That handoff
is the moment worth getting right.

### Behavior

Canvas 2D is sufficient and is the recommended starting point — the demo behavior below
runs comfortably at 60fps with a few hundred particles. Escalate to Three.js with
instanced points and a bloom pass only if the density genuinely demands it. Do not
reach for WebGL first.

Each particle needs:

- **Upward drift** with slight acceleration — heat rises, so `vy` increases over life
- **Sine wobble** on the x axis, each particle with its own phase offset
- **Brightness flicker** driven by a second, faster sine — this is what separates
  fire from floating dots
- **Radial glow** behind the core, drawn with `globalCompositeOperation = 'lighter'`
- **Hue range** 18–42 (deep orange through amber), randomized per particle
- **Fade envelope** — quick fade in over the first 12% of life, long fade out

### Density per page

| Page | Particles (desktop) | Character |
|---|---|---|
| Home | 400 | Dense, hot, fast. The forge is running. |
| Gallery | 90 | Sparse and slow. The blades are the subject. |
| Process | 250 | Medium, building toward the strike imagery. |
| Retreats | 180 | Drifting, wide wobble — open air rather than a shop. |
| About / Contact | 70 | Barely there. Atmosphere only. |

Transitions between pages interpolate density over ~800ms rather than snapping.

### Performance rules — non-negotiable

- Detect device and scale: desktop full count, tablet 40%, mobile 20%.
- Honor `prefers-reduced-motion: reduce` — freeze the system, render a single static
  frame of embers, keep everything else functional.
- Pause the animation loop when the canvas is off-screen (`IntersectionObserver`) and
  when the tab is hidden (`visibilitychange`).
- Cap `devicePixelRatio` at 2. Retina at 3x doubles the fill cost for no visible gain.
- **The site must be complete and beautiful with the canvas removed entirely.** Build
  it that way first, then layer particles on top. If a layout depends on the canvas
  to look finished, the layout is wrong.

---

## 4. Pages

### Home

```
┌──────────────────────────────────────────┐
│                                          │
│        [ full-bleed hero video ]         │
│                                          │
│              ◍  logo mark                │
│         HAMZA'S BLADES                   │
│      hand forged in california           │
│                                          │
│   [view the collection]  [custom order]  │
│                                          │
│  ░░░░ gradient dissolve into embers ░░░░ │
├──────────────────────────────────────────┤
│         positioning statement            │
├──────────────────────────────────────────┤
│  ▨      ▨      ▨      ▨   featured work  │
├──────────────────────────────────────────┤
│      the forging process  →              │
├──────────────────────────────────────────┤
│      retreats — coming soon  →           │
├──────────────────────────────────────────┤
│  footer                                  │
└──────────────────────────────────────────┘
```

**Hero video.** Full viewport height, `object-fit: cover`, `muted playsinline loop
autoplay`, with a `poster` still so something is on screen before the file loads.
Source is a placeholder — see the asset checklist. Slow-motion hammer strike on hot
steel at night, cut so the loop is seamless (matched cut, top-of-swing to
top-of-swing).

The bottom 25% carries a `linear-gradient` to `--forge`, and the particle canvas sits
above the video at that region so real sparks and simulated ones overlap in the fade.
Get the gradient stop and canvas z-index right — this is the seam the whole design
hangs on.

**Positioning statement.** One quiet band, centered, heavy whitespace. Two or three
sentences, Amiri, `--parchment`. Copy in section 8.

**Featured work.** Four pieces, largest photos on the site. Hairline `--ash-line`
borders, on hover the border warms to `--brass` and a faint ember glow rises behind
the image. "See all work" beneath, in the eyebrow treatment.

**Process teaser.** Wide cinematic band, one image, a line of copy, a link through.

**Retreats teaser.** Still frame from the location video, "coming soon" in the eyebrow
style, one line about forging your own blade under open sky, link through.

### Gallery

Default state shows every piece, newest first. Filters refine — they never hide the
catalog behind a click.

**Filters:** All · Swords · Knives · Axes & spears · Bows · Woodworking

Client-side. Filtering animates the grid reflow (FLIP or a simple opacity+transform
transition) rather than snapping. Active filter gets `--brass` text and a 1px underline.

**Grid:** `repeat(auto-fill, minmax(300px, 1fr))`, gap 2rem. Each card is photo, title
(Amiri), type and status in the eyebrow treatment. No descriptions — the photo does
the work.

**Data.** A single `gallery.json`, not hardcoded markup. Adding a piece must be a
photo drop plus a few lines:

```json
{
  "id": "damascus-hunter-01",
  "title": "Damascus hunter",
  "type": "knives",
  "image": "/img/gallery/damascus-hunter-01.jpg",
  "status": "available",
  "featured": true
}
```

`status` is `available` | `sold` | `commission`. Sold pieces stay visible — they're
portfolio. Render them at 70% opacity with a "sold" tag; the inquiry box on a sold
piece asks about commissioning something similar instead.

**Detail view.** Clicking a piece opens a lightbox or detail page: larger image,
title, type, and the inquiry box (section 5). Keyboard accessible, escape closes,
focus trapped while open, focus returned on close.

### Process

The making, in sequence. Numbered steps are appropriate here — this genuinely is an
ordered process and the order carries meaning. Raw stock → heat → shaping → grinding
→ handle → finished edge. Image plus a few lines each. Alternating image side.

If Hamza has video of any stage, this page takes it.

### Experience (retreats)

**Hero:** full-bleed location video, same treatment as the homepage — muted, looping,
gradient dissolve at the bottom. Placeholder for now.

Over it: "Coming soon" in the eyebrow style, and a title in Amiri.

Below, three short blocks describing what a retreat is — forge your own blade, archery,
camping. Written as anticipation, not as a product listing. No dates, no prices, no
booking.

**Email capture.** The most important element on this page. Single field plus button,
centered, generous space around it. Not a modal, not a popup, no exit intent. Label:
"Get the dates when they're set." Button: "Notify me."

Success state replaces the field with a confirmation line in `--brass`. Failure states
say what went wrong and what to do — no raw error strings, no apology.

Wire to the same Formspree endpoint as the inquiry boxes, tagged so submissions are
distinguishable, or a separate list endpoint if Hamza prefers.

### About

Hamza's story. One portrait if available, otherwise a forge shot. Copy in section 8.
Instagram link. Both forge locations mentioned — this is a strength, not a
complication.

### Contact

Minimal. The inquiry box, Instagram, and a short shipping note. No street address,
no phone.

---

## 5. Inquiry boxes

There is no structured form yet. Every inquiry is a name field, an email field, and a
message textarea. That's it.

**Suggested message.** Each box shows greyed placeholder text appropriate to context.
Below the textarea, a small text button: "use this message". Pressing it fills the
textarea with real, editable text. Works identically on mobile and desktop — no tab
key, no keyboard shortcut.

Suggested text is templated per context:

- **Gallery piece, available:**
  "Hi Hamza — I'm interested in the {title}. Is it still available, and what would
  shipping run?"
- **Gallery piece, sold:**
  "Hi Hamza — I know the {title} is sold, but I'd love something similar. Could you
  make one?"
- **Custom order:**
  "Hi Hamza — I'd like to commission a custom piece. Here's what I have in mind:"
- **Contact page:**
  "Hi Hamza — "

Gallery inquiries carry the piece title into the payload automatically so Hamza is
never guessing which piece an email is about. Include it as a hidden field.

**Wiring.** Formspree, forwarding to `hamzasblades@gmail.com`. Put the endpoint in a
single config constant, clearly marked:

```js
// Replace with the Formspree endpoint from formspree.io
export const FORM_ENDPOINT = "https://formspree.io/f/YOUR_ID_HERE";
```

If the site is hosted on Netlify or Vercel, their native form handling can replace
Formspree entirely and is free — worth doing if the host is settled before this is
built.

**Never put the email address in visible page text.** It gets scraped within days.
The form service keeps it hidden.

**Validation.** Check on submit: empty message, empty name, malformed email. Show the
error inline next to the offending field in `--ember`, clear it as soon as the field
is edited. Don't disable the submit button — let it be pressed and respond.

---

## 6. Build order

Build in this order so the site is presentable at every stop.

1. **Foundation.** Tokens, fonts, layout primitives, nav, footer. No particles yet.
2. **Gallery.** JSON structure, grid, filters, detail view. This is the commercial
   core — get it right before anything decorative.
3. **Inquiry boxes.** Suggested messages, validation, Formspree wiring.
4. **Home, About, Process.** Static content, placeholder images, gradient in the hero
   region where the video will go.
5. **Retreats.** Video slot, coming-soon treatment, email capture.
6. **The ember system.** Only now. Home first, then per-page density, then the
   video-to-particle dissolve.
7. **Performance and accessibility pass.** Device tiers, reduced motion, keyboard
   navigation, focus states, Lighthouse.

Steps 1–5 must produce a site Hamza would be happy to launch. Step 6 is enhancement.

---

## 7. Assets still needed

Marked clearly so placeholders are obvious in the build.

| Asset | Notes | Status |
|---|---|---|
| Hero video | Slow-mo hammer on hot steel, night, black background, matched-cut loop | Not shot |
| Hero poster | Still frame from the above | Not shot |
| Retreat video | Location footage, golden hour or after sunset, slow movement | Not shot |
| Retreat poster | Still frame from the above | Not shot |
| Gallery photos | ~20 pieces, black backdrop, raking side light | Partial |
| Process photos | 5–6 stages | Not shot |
| Portrait | Hamza at the forge — optional but strong on About | Not shot |
| Logo (PNG) | Crescent + Arabic calligraphy, tan on dark, transparent | ✓ |
| Logo (SVG) | Vector trace of the above — needed for crisp scaling | Not made |
| Logo mark, simplified | Crescent-only variant for favicon and small nav sizes | Not made |

Use free forge footage from Pexels or Coverr as video placeholders during the build.

### Logo handling

The supplied logo is raster (~617px, transparent PNG) with slightly ragged cutout
edges that will show against `--forge`. Usable for launch; not final.

- Use the PNG at displayed sizes of 120px or below until an SVG exists.
- Do not upscale it. If a larger mark is needed in the hero, use type instead.
- Below ~48px the calligraphy loses legibility — use the simplified crescent variant
  once available, and until then omit the mark rather than rendering it illegibly.
- Logo tan reads at roughly `#C89F68`, which is already `--brass`. The calligraphy
  and crescent read as a very dark maroon-brown, close to `#3D1512` — acceptable as a
  secondary dark if one is needed, but `--forge` remains the page background.
- Keep the mark on `--forge` or `--ash`. Never place it on a light or mid-tone fill.

**Shooting notes for the hero:** shoot 15–20 strikes in one continuous take (you need
matching frames for the loop cut and most takes won't have one), 120fps or higher,
locked-off tripod, expose for the steel and let the room go fully black.

---

## 8. Copy

### Positioning statement (home)

Client-approved, use verbatim.

> Handcrafted blades rooted in faith, tradition, and the outdoors. Hamza's Blades
> exists to revive traditional craftsmanship and help Muslims reconnect with the
> beauty of Allah's creation.



### About

Client-approved, use verbatim. Four paragraphs.

> I'm a Muslim blacksmith based in California, inspired by the beauty, balance, and
> craftsmanship found throughout Allah's creation. My work is rooted in a deep
> appreciation for the natural world and for the traditional ways people have shaped,
> built, traveled, and lived in closer connection with the land.
>
> Based between Sacramento and Huntington Beach, I hand-forge swords, knives, and
> other traditional tools through Hamza's Blades, combining functional craftsmanship
> with a respect for the methods and traditions that have shaped blacksmithing for
> generations.
>
> For me, blacksmithing and the outdoors are filled with endless opportunities for
> reflection. There is something deeply grounding in working with fire, steel, wood,
> earth, the elements, and in recognizing that every material we shape ultimately
> comes from what Allah has created. Spending time in nature reminds us of His signs,
> His power, and the incredible detail and wisdom present throughout creation.
>
> Through my work, I hope to encourage more Muslims to rediscover that connection.
> My goal is to help bridge the space between Islam, traditional craftsmanship, and
> the outdoors, while inspiring a deeper sense of gratitude, reflection, stewardship,
> and appreciation for the world Allah has entrusted to us.

Close the page with a line pointing to the inquiry box, e.g. "If you want something
made, tell me what you have in mind."

### Retreats

Client-approved. Note that this places the retreat forge in the Sierra Nevada —
distinct from the two working forges. Confirm before writing any geography copy that
implies otherwise.

> Coming soon
>
> Day and multi-day trips to the forge in the Sierra Nevada mountains. Shape your own
> blade from raw steel, archery, camping, and more. Dates are being set.

### Voice

Plain, direct, unhurried. Short sentences. No exclamation marks, no marketing
adjectives ("stunning," "premium," "bespoke"), no urgency language. The confidence
should come from the work being described accurately rather than from the copy
straining. Sentence case throughout. Buttons name their action: "Send inquiry," not
"Submit."

---

## 9. Quality floor

- Responsive from 360px to 2560px. Test the gallery grid and hero type at both ends.
- Visible keyboard focus on every interactive element — a 1px `--brass` outline with
  2px offset. Never `outline: none` without a replacement.
- Lightbox traps focus, returns it on close, closes on escape.
- `prefers-reduced-motion` respected throughout, not just for particles.
- Alt text on every gallery image — the piece title at minimum.
- Images lazy-loaded below the fold, served in a modern format with dimensions set
  to prevent layout shift.
- The hero video must not block first paint. Poster image first, video when ready.
- Lighthouse performance above 85 on mobile with particles enabled.

---

## 10. Things to leave alone

- No cart, checkout, or pricing display. Inquiry only.
- No booking or payment on retreats.
- No 3D blade models. Photography of real pieces does this better.
- No structured custom-order form yet — plain message box only.
- No cookie banner, no chat widget, no newsletter popup, no exit intent.
- No stock photography of blades. Every piece shown must be Hamza's own work.
