# Visitor costume hulls — the pawn-family set

<!-- spec: hosting_game.md §8.6 (visitor catalogue, patience ring, Suit Gradient, Whale),
     §8.2 five-channel mapping (shape=duration class · ornament=value · prop=archetype ·
     livery=line · ring=patience) -->

One readable family of small pawn-like figures ("hulls") whose **shape encodes the duration class**
(Instant = circle-headed mote · Session = teardrop that persists · Batch/Job = square crate-rider ·
Resident = hexagon-anchored pillar-form), whose **prop slot** carries the archetype (ping chip,
briefcase, clipboard, backup tape, envelope, headset), whose **ornament** carries value (diamond
badge, size step, soft glow), and whose **livery colour-band** carries the business line. Hulls are
flat-shaded signal-adjacent sprites (they ride the Flow layer as motes with Attachment rings drawn
in-engine), rendered here as chunky near-pixel figures on magenta key. Patience rings, nameplates and
ping numbers are composited in-engine — never baked.

### V1 — the duration-class family lineup

```
POSITIVE: sprite sheet of four small chunky pawn-like game figures in a row on a flat solid
magenta #FF00FF background, 32-bit isometric pixel-art style with hard readable silhouettes and a
limited desaturated palette, each figure a different basic hull shape so they are distinguishable in
pure black-and-white silhouette: (1) a round-headed quick mote-figure leaning forward mid-stride,
(2) a teardrop-bodied figure with a soft trailing tail, standing calm, (3) a square-bodied figure
hauling a small crate, (4) a stout hexagonal-shouldered figure planted immovably like a pillar;
each carries one tiny distinct prop in its hands — a glowing micro chip, a briefcase, a rolled tape
cartridge, a clipboard; subtle colour livery bands (muted teal, muted ochre, muted slate) across
their chests, small specular highlight dots for eyes, matte finish, one-pixel dark outline, even
front lighting, no floor shadows, generous spacing between figures, crisp pixels, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, glyphs, watermark, signature, photorealism, 3D render, soft
gradients, glow everywhere, rainbow palette, drop shadow on background, blurred silhouette, extra
fingers, detailed face
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 6; kill any sheet where two hulls are confusable when squinted to grey blobs —
the four silhouettes must pass the §8.16 24px rule individually
```

### V2 — whale hero figure (diamond of value)

```
POSITIVE: single large chunky pawn-like figure, 32-bit isometric pixel-art, centered on a flat solid
magenta #FF00FF background: broad diamond-slab shoulders tapering to a planted base, visibly twice
the mass of an ordinary visitor pawn, slow and heavy posture, casting a long simple dark shadow
streak behind it, wearing a muted graphite suit-form livery with one restrained warm gold accent
glow along its lower edge (gold means money in this game's palette, hex #E8B23C, kept as a thin rim
only, not a wash), a small polished diamond ornament badge on its chest as the only bright detail,
hard readable silhouette that survives greyscale, matte materials, one-pixel outline, crisp pixels,
even lighting, no text, no letters, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, cartoon outline wobble, neon aura, gold
covering the whole body, gradient background, busy ornament, thin spindly limbs
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 4, pick the one whose SILHOUETTE alone reads "expensive and load-bearing" at
thumbnail size; the gold rim is secondary
```

### V3 — archetype prop-slot grid

```
POSITIVE: icon sheet grid of eight identical neutral rounded pawn hulls (32-bit isometric pixel-art,
muted grey-beige livery, hard silhouette, one-pixel dark outline) arranged in a two-by-four lattice
on a flat solid magenta #FF00FF background with wide even gaps, each hull holding one different
tiny high-contrast prop that identifies its archetype: a small glowing latency chip, a hardshell
briefcase, a rolled magnetic backup tape cartridge, a mail envelope, a headset with boom mic, a
clipboard, a tiny game controller, a telephone handset; props are slightly oversized relative to the
pawns for 24px legibility, each prop in its own restrained hue pulled from a muted technical palette
(steel blue, warm grey, copper, aged paper), no two props confusable in silhouette, flat even front
lighting, no floor shadows, crisp pixels, matte, no text, no letters, no numbers, no watermark, no
UI captions
NEGATIVE: text, watermark, photorealism, gradient shading, glow effects, detailed faces, overlapping
figures, varied hull poses
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; crop and re-key per cell; reject any prop that fails the black-silhouette-in
-motion test at 16px (§8.16 silhouette-first authoring)
```

### V4 — livery strip: same hull, six business lines

```
POSITIVE: sprite sheet of six identical round-headed pawn silhouettes in a row on a flat solid
magenta #FF00FF background, 32-bit isometric pixel-art, distinguished ONLY by costume livery so a
player can tell which business line a visitor belongs to at a glance: (1) dense hoodie figure in
putty and teal for shared-hosting web crowds, (2) sleek small dart-like courier figure with a spark
trail for API traffic, (3) a figure trailing three tiny motes like a piper with ducklings for a
streamer with an audience, (4) a figure made of fine dust specks barely holding a shape for IoT
swarms, (5) a metronome-stiff blocky figure with perfectly square posture for blockchain nodes,
(6) a figure carrying an enormous glowing prompt bubble above its head for AI inference; hard
readable silhouettes, desaturated base palette with one restrained accent each, one-pixel outline,
even flat lighting, no floor shadows, crisp pixels, matte, no text, no letters, no watermark, no UI
captions
NEGATIVE: text, watermark, photorealism, rainbow saturation, identical silhouettes, background
scenery, gradients, glow everywhere
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; pick per-cell (the six need not come from one sheet) — the dust figure and
the piper figure are the two hardest, reseed those alone until distinct at 24px
```

---

**PICK CRITERIA:** every hull/prop reads as black silhouette at 24px vs every other family member
(§8.16 Silhouette Sheet); duration classes confusable-free with colour drained (shape=duration law,
§8.2); no patience ring or label baked (Attachment drawn in-engine, §8.6).
