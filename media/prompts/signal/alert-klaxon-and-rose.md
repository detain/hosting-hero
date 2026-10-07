# Alert ladder, klaxons, the attack-surface rose, company marks

<!-- spec: hosting_game.md §8.7 (alert escalation visuals: five clearly distinguishable steps, each
     with a shape channel; de-escalation shares the language), §8.2 (Alert Triad ≤3 hues), §4.1/
     §7.2 + gate G2 (Attack Surface Ledger — threats unspawnable until you build their invitation;
     rose/polar plot of exposure by family), §4.6/§8.7 (brand street, line placards — the company
     needs a face that the save lineage can vary) -->

Four chrome plates in one file. (1) the five-rung alert escalation ladder, every rung carrying a
shape channel as well as colour; (2) klaxon and incident-state hardware icons for the alert stack;
(3) the attack-surface ROSE — the polar exposure plot that is gate G2's signature image, drawn as
an instrument motif; (4) company-mark generator placeholders: a family of blank crested shapes the
per-save company identity gets stamped onto (placards, letterhead, tape reels).

### V1 — the five-rung alert ladder

```
POSITIVE: flat vector reference plate on a deep blue-black ground (hex #0D131C) showing one alert
system escalating through five rungs left to right, each rung drawn attached to the same small
rounded module card so the DIFFERENCE is only the escalation treatment: rung one, calm, a single
tiny grey dot at the card corner; rung two, a small amber (hex #F2B133) pip with a visible notch
cut into it; rung three, the card's outline turns to a dashed stroke, still cool-toned; rung four,
a faint warm tint washes the whole card plus a small triangular corner flag folds over its top
edge; rung five, full treatment — a solid alert-red edge rule (hex #E23B3B) hugging the card frame
plus a thickened bar across the card's bottom bezel, the single loudest object on the plate; each
rung unmistakably louder than the last by SHAPE and STRUCTURE as much as colour, quiet rungs truly
quiet; flat unlit annotation aesthetic, crisp 1-2px strokes, generous even spacing, greyscale
shuffle-test safe, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, glow bloom, flashing starbursts, exclamation marks,
sirens, gradients, identical rungs, rainbow, confetti
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 3; drain colour and verify the five rungs still order themselves quiet-to-
loud by shape alone — that is the spec's own five-steps-never-more law
```

### V2 — klaxon and incident hardware icons

```
POSITIVE: sprite sheet of six flat vector device icons on a clean near-black ink-blue background
(hex #14202E), industrial-warning design language, solid fills with one hairline rim each, muted
bodies and restrained accents: (1) a dome alarm beacon with a clear glass cap and an unlit pale
bulb, (2) the same beacon lit — inner bulb washed amber (hex #F2B133) with two short straight
glint lines, kept geometric not glowing, (3) a horn klaxon speaker cone on a mounting bracket seen
from the side, dark steel with a copper screw-ring accent (hex #C97A45), (4) a pull-station bar
handle in muted red behind a hinged clear cover (hex #E23B3B used once, small, honest), (5) a
round wall test-and-reset button module with a recessed center, (6) a small rotating beacon cage
with visible wire guard; all six same optical weight, hard silhouettes, flat unlit annotation
style, wide even gutters, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, light beams, lens flare, smoke, dramatic
angle, saturated full-body red, cartoon wobble
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 3; the lit-vs-unlit beacon pair must read at 16px — they are the wall-light
state channel for the whole NOC set
```

### V3 — the attack-surface rose

```
POSITIVE: flat vector polar diagram artwork on a deep ink-blue field (hex #14202E), the game's
attack-surface rose: a circular radar-like plot with eight faint concentric rings and twelve radial
spokes in hairline grey-blue, bearing eight soft translucent petals of DIFFERENT lengths blooming
outward from center at uneven angles like a distorted flower — the petal directions are threat
families, the length is exposure; petals alternate in three disciplined fills: quiet steel-teal
transparent lobes, two alarmed lobes edged in amber (hex #F2B133) reaching far outward, one hostile
lobe in restrained magenta outline (hex #E04FD8 as line and thin wash only) clearly the largest
danger; at the rose center a tiny clean hexagon node in muted green (hex #4FC46A) marks the company
itself; two short un-bloomed spoke stubs stay bare to show the families with no exposure; overall
read is "an instrument that tells you where you are open", beautiful, precise, drafting-grade; flat
unlit, crisp linework, greyscale-legible by petal length, no text, no letters, no numbers, no
cardinal labels, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, radar sweep glow, sci-fi HUD clutter, crosshair
reticles, target scope, photorealism, rainbow petals, gradient mesh, starfield background
size: 1024x1024
aspect: 1:1
style: vector
background: scene
variations: generate 4; the rose should survive being shrunk to a 48px HUD glyph — pick the sheet
where petal LENGTHS vary dramatically, subtle roses fail the Thumbnail Test
```

### V4 — company mark placeholder family

```
POSITIVE: flat vector plate of six blank heraldic company-mark shells arranged in a two-by-three
grid on a warm paper-grey background, each a simple strong geometric crest built for later
customisation: variations on a shield outline, a hexagonal bolt-head crest, a rounded stamp circle,
a squared letterhead cartouche, a banner-topped shield, and a notched dog-tag oval — all drawn as
empty vessels: bold single-colour silhouettes in deep slate or ink-blue (hex #14202E), each with one
blank inner field clearly reserved for a future emblem, one restrained accent hairline in either
muted gold (hex #E8B23C) or muted cyan (hex #35E0E6) on alternating marks; crisp flat vector,
uniform stroke discipline, timeless generic-industrial feel suitable for a hosting company from
1994 or 2026, generous gaps, absolutely no existing brand resemblance, no text, no letters, no
numbers, no monograms, no watermark, no UI captions
NEGATIVE: text, letters, numbers, monograms, existing corporate logos, shields with knights or
eagles, ornate filigree, gradients, 3D metal, glow, photorealism
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 4; these are substrates for a per-save generator — pick shells whose blank
field is big and calm enough to survive a stamped tint without muddying
```

---

**PICK CRITERIA:** ladder rungs order correctly in greyscale (five-steps law, §8.7); rose reads
exposure-by-length at 48px (Thumbnail Test); klaxon lit/unlit pair passes 16px; no rung of the
alert system exceeds the Alert Triad's three-hue budget on any single frame (§8.2).
