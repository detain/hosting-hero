# Shape token sheets — chips, rings, class marks

<!-- spec: hosting_game.md §8.2 (Shape tokens list: Circle=instant visitor, Triangle=attack,
     Square=batch job, Diamond=high-value, Hexagon=infra/money-in-chrome, Teardrop=persistent
     session, Starburst=incident, Chevron=family mark, Ring=patience-time; Ring Taxonomy:
     Ring/Donut/Halo/Arc/Pips; Status Chip 12-vocabulary with one shape notch each; Alert Triad),
     §8.5 (threat class marks) -->

The game's alphabet of pure shapes. Three sheets: (1) the twelve status chips — pill frames each
carrying a distinct notch glyph so the 12-state vocabulary reads shape-first with the words removed;
(2) the ring/donut/halo/arc/pip taxonomy — the five circular-annotation grammars that must never be
confused; (3) the base shape-token set as a family plate. All vector, all flat, all screen-space —
no lighting anywhere in this file.

### V1 — status chip twelve (blank-label plate)

```
POSITIVE: flat vector reference plate of twelve game status chips arranged in a three-by-four grid
on a clean near-black ink-blue background (hex #14202E), each chip a horizontal pill with softly
rounded 2026-era corners, dark matte slate body with a hairline lighter edge, and on its LEFT END a
unique tiny notch glyph cut into the pill silhouette so each state is identifiable by outline
alone — the twelve notch shapes, all different, in this order across rows: a full circle, a
downward triangle, a small cross, a chevron pointing down, a wrench, a lightning bolt, a seal
(rosette with two ribbon tails), an hourglass, a triangular flag on a pole, a diamond, an analog
clock face shape with two hands, and a dashed open ring; the wide right field of every pill is a
blank empty label area with no glyphs; two chips carry a restrained fill tint to hint severity —
one muted green (hex #4FC46A family) and one alert red edge rule (hex #E23B3B) — the rest stay
neutral so the plate reads as a system not a fireworks; uniform stroke weight, flat unlit screen-
space annotation style, crisp edges, generous even gaps, greyscale-safe because every chip differs
by notch SHAPE, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, icons inside the label field, watermark, photorealism, gradients,
glow, rounded shadows, twelve different pill sizes, decorative flourishes
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 4; the pass is the twelve-second shuffle test — can a viewer who studied the
plate for five seconds re-name each state from notch shape alone with colour drained
```

### V2 — ring taxonomy plate (time / load / mood / player / counts)

```
POSITIVE: flat vector study plate on a clean near-black ink-blue background (hex #14202E) showing
five distinct circular-annotation grammars in a row, each drawn twice — once dim and once at high
value — so their states pair-match: (1) THIN FULL RING with one small gap, a complete circle
engine meant to deplete clockwise, drawn at 60 percent gone with the depletion arc as bare track;
(2) THICK SEGMENTED DONUT for utilisation, wide band split into small radial segments, half of them
filled a muted cyan (hex #35E0E6) and the rest empty track, clearly heavier and chunkier than the
thin ring; (3) SOFT HALO, a diffuse open glow-circle floating-above posture with no closed track at
all, gentle and mood-like, edges feathered; (4) LOW ARC, a partial wide curve meant to sit BELOW a
figure on the floor plane, underlined and grounded, one quarter swept with muted green (hex
#4FC46A); (5) PIP ROW, five tiny discrete dots in a line, three lit two dark, plain round counts
with no ring at all; all five unmistakably different shapes even in pure silhouette; flat unlit
annotation style, uniform 1px detail strokes, generous gaps, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, 3D render, glossy gradients, confetti, sparkle, clock
numerals, identical-looking circles, motion blur
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 3; reject any sheet where the thin Ring and the Donut could be mistaken for
each other when scaled to 16px — that confusion breaks the patience-vs-load contract in-engine
```

### V3 — base shape token family plate

```
POSITIVE: flat vector icon plate of eight geometric game tokens arranged in a loose two-by-four
lattice on a clean warm-grey paper-light background, each token one pure shape with one meaning-
weighting treatment, solid fills, uniform hairline outline, flat and unlit: a calm filled CIRCLE
in muted teal (ordinary instant visitor), a taut upward TRIANGLE in deep slate with one hostile
magenta edge accent (hex #E04FD8) (attack), a solid SQUARE in dusty amber-brown carrying one tiny
progress notch on its rim (batch job), a sharp faceted DIAMOND with a faint internal sparkle line
in restrained gold (hex #E8B23C) (high value), a technical HEXAGON in steel grey with a small
throughput port cut on one side (infrastructure node), a TEARDROP with a short soft tail in muted
blue-grey (persistent session), an eight-point STARBURST in warm alert amber (hex #F2B133) with
hard jagged points (incident), and a double CHEVRON mark in bone white (family mark); each token
legible at thumbnail size, generous negative space between them, subtle 2px baseline alignment, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, gradients, drop shadows, rounded
cartoon style, glow, ornate detail, background scenery
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 4; the plate doubles as the canonical shape dictionary — pick the one where
starburst vs chevron vs triangle stay distinct when squinted; those three are the classic confusion
pair set
```

---

**PICK CRITERIA:** shape-only identification at 24px is the gate (§8.2 shape-first law; the chip
notch shuffle test); ring-vs-donut-vs-halo-vs-arc-vs-pips never confusable (Ring Taxonomy);
zero baked text — all words are in-engine layers.
