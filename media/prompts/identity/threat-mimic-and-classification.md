# Mimic & classification — the unknown-form rule

<!-- spec: hosting_game.md §8.2 (violet = pre-classification ONLY; Confidence Blur: uncertainty is
     literally a blur that sharpens with confidence), §8.5 (mimic: hostility deliberately
     unencoded; L7 threats look exactly like visitors until identification inverts them to a
     red-outlined silhouette; bot fingerprinter peels disguises; one-frame blue identification
     flash; Poisoned Tint = wrong-but-serving) -->

The hardest art problem in the library: draw "we do not know what this is." The mimic family never
gets a fixed silhouette — its whole contract is **borrowed visitor shape + violet #8F5FE8 murk +
confidence-blur edges**, and its beats are sprites of the *moment of knowing*: the peel, the snap
flash, the red-outline inversion of what was a friendly shape a frame ago, and the sick greenish
Poisoned Tint film for the wrong-but-serving state. Everything here is deliberately ambiguous —
a pick that looks "monstrous" has failed the unknown-form rule.

### V1 — the violet unknown family

```
POSITIVE: sprite sheet of four ambiguous pixel-art figures on a flat solid magenta #FF00FF
background, 32-bit iso game style: each one a HUMANLESS visitor-pawn suggestion — roughly pawn-
sized, roughly upright — but rendered as translucent smoky violet murk (hex #8F5FE8 as a low-
saturation veil over dark grey), edges softly blurred like an out-of-focus photograph, internal
detail unresolved: one hinting a round head-shape, one hinting a teardrop tail, one a square crate
outline, one a simple walking-figure hump, all four clearly the same species of NOT-KNOWING, none
carrying any weapon, face, teeth or monster cue; faint slow-drifting vapor particles at their
outlines, cool self-lit haze limited to a thin rim under two percent of each figure's area, dark
desaturated core; hard-enough silhouettes to place on a grid, even dim lighting, crisp pixels under
the deliberate edge blur, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, monster features, fangs, claws, glowing red eyes, skull,
tentacle horror, sharp crisp outlines, bright saturated violet fill, magic-swirl cliches, ghosts
with faces
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 6; correct read is "wrong, but you cannot say why yet" — reject anything
instantly recognisable as a threat; the four must share one murk treatment
```

### V2 — the peel and the snap (classification beats)

```
POSITIVE: three-frame sprite sequence laid out left to right on a flat solid magenta #FF00FF
background, 32-bit iso pixel-art, one small pawn figure caught in the act of being identified:
frame one shows a plain rounded visitor pawn wrapped in a translucent torn veil of violet murk
peeling away in two curling strips like a sticker lifting off, frame two shows the same pawn at the
instant of snap — a single hard one-frame flash ring of pure electric blue-white light hugging its
outline, the veil shredded into fading motes, frame three shows the pawn fully sharp but now
outlined in thin unbroken fault-red (hex #E23B3B) with an inner body of dark hostile magenta
(hex #E04FD8), the disguise completely gone, posture subtly angular where it was soft; crisp pixel
edges on the resolved figure, deliberate blur only in the dissolving veil, even lighting, no floor
shadows, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, lightning bolts, explosion, lens flare starbursts, magic
transformation sparkles, rainbow, smoke clouds, background scenery
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the red-outline inversion must read as "the same figure, now named," not as
a different creature — compare frames in greyscale to confirm identity continuity
```

### V3 — the Poisoned Tint film (wrong-but-serving)

```
POSITIVE: sprite sheet on a flat solid magenta #FF00FF background showing one clean isometric data
stream effect in its honest state and its corrupted state, 32-bit iso pixel-art: top row, a tidy
horizontal lane of small bright cyan motes (hex #35E0E6) flowing right through a short pipe section
with two content node dots, crisp and healthy; bottom row, the identical lane and pipe drowned
under a sickly thin yellowish-green film like spoiled oil on water — a translucent algae-tinted
wash that distorts but does not hide the cyan motes beneath, a few motes subtly discoloured at their
cores, the pipe joints weeping one tiny drop of the same film; the tint must look WRONG in a quiet
way, outside the game's semantic palette, unpleasant like food gone off, never explosive or
dramatic; hard silhouettes of lane and pipe preserved under the wash, desaturated materials, crisp
pixels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, toxic-slime horror cliches, bubbles boiling, acid smoke,
glowing runes, zombies, dramatic splatter, saturated neon green, red alarms
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; A/B test the pair — a viewer who cannot instantly say "same pipe, something
tainted the output" has failed the mechanic's legibility
```

---

**PICK CRITERIA:** mimic frames pass the spec's own test — hostility NOT readable before the snap
(it must beat any "spot the threat" game pre-flash), and fully readable after it (§8.2 mimic
exemption + §8.5 identification inversion); Poisoned Tint stays deliberately outside the semantic
palette (wrong-but-serving, never alarm-red).
