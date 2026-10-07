# Threat silhouettes — malicious families (swarm / siege / stealth)

<!-- spec: hosting_game.md §8.5 (threat visual contract, seven motion primitives, silhouette rule,
     class marks, technical threat catalogue) -->

Threats obey the five-channel contract: silhouette = family, colour = magenta family with per-class
hue shift, motion signature authored as a still pose that implies its primitive (advance / drip /
sweep / swarm / cling / mimic / crystallize), telegraph drawn as its own sprite, plus
**pressure-scaled size**. Class marks (§8.5) are geometric overlays a defense icon can visibly
contain (Counter Match): volumetric = three stacked chevrons · application = bracket pair ·
physical = cracked square · legal/abuse = stamp corner · human = silhouette head · environmental =
wave · financial = torn receipt edge. All hostile hue work stays inside the threat-magenta family
(#E04FD8 with darker shifts); red #E23B3B stays reserved for final failure states, never decoration.

### V1 — volumetric tide unit set (advance)

```
POSITIVE: sprite sheet of four related hostile pixel-art units on a flat solid magenta #FF00FF
background, 32-bit isometric pixel-art diorama style, all built from one silhouette family — a
dense crushing wedge-wave form like a compressed riot front of tiny angular grit particles, matte
charcoal body with a thin sickly violet-magenta edge shimmer (hex #E04FD8, kept as rim only),
hanging low and heavy, momentum baked into the pose leaning forward; each variant reads as a grade
of the same threat: (1) a small scouting curl of the tide, (2) a shoulder-high advancing wall
section, (3) a full cresting flood front with packed debris of tiny shards, (4) a slow dense
undercurrent roll; every variant carries the same class mark on its face — three stacked downward
chevrons in pale desaturated bone-white — so the family is identifiable in pure black silhouette at
small size; hard readable silhouettes, limited desaturated palette, one-pixel dark outline, even
flat lighting, no floor shadows, crisp pixels, no text, no letters, no numbers, no watermark, no UI
captions
NEGATIVE: text, watermark, photorealism, lasers, explosions, cartoon villain faces, rainbow palette,
neon glow wash over whole body, red as primary colour, ocean waves, realistic water
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4 sheets; the flood-front variant is the signature — reseed it alone until the
chevron mark survives a greyscale dump
```

### V2 — application-layer darts (sweep / precise strike)

```
POSITIVE: sprite sheet of three angular hostile darts on a flat solid magenta #FF00FF background,
32-bit isometric pixel-art, each a sharp narrow arrow-headed shard with long thin probe limbs,
matte dark plum body in the magenta threat family (hex #E04FD8 accents) with a single cold glint
highlight on the tip, frozen mid-lunge so the silhouette alone says "precise strike, not mass"; the
first is a plain fast dart, the second trails a fine scanning whisker like an insect antenna mid-
sweep, the third wears a thin pale bracket-pair mark across its waist — two squared brackets facing
each other, bone-white, its class mark; hard readable silhouettes at 24px, one-pixel dark outline,
desaturated body tones, flat even front lighting, no floor shadows, crisp pixels, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, rounded friendly shapes, swarm clouds, fire, glow trails
covering the body, rainbow palette, red body, rocket flames
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; pick cleanest bracket mark; if the whisker dart reads identical to the plain
dart in silhouette, reseed until the antenna sweep is the discriminator
```

### V3 — slow-drip clingers and crawlers (cling / swarm)

```
POSITIVE: sprite sheet of four low-energy hostile pixel figures on a flat solid magenta #FF00FF
background, 32-bit isometric pixel-art, two behaviours shown: the first two are SLUMPED squatter
figures — thin wire-legged husks with heavy hunched tops, matte ash-grey bodies with one faint
magenta seam (hex #E04FD8 at low saturation), drawn visibly wedged down onto and into a small slot
plate they occupy, motionless and smug, the posture of something that arrived and simply refuses to
leave; the other two are small many-legged crawler bots, compact insect bodies with clustered
angular legs, dusty violet-plum shell, shown in two groupings — one lone probe crawler and one tight
cluster of four swarming — so the sheet demonstrates both the cling silhouette and the swarm
silhouette; all four hard readable in pure black silhouette, one-pixel outline, desaturated
materials, flat even lighting, no floor shadows, crisp pixels, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, watermark, photorealism, size, speed lines, explosions, bright saturated colours,
glow, realistic insects with detail wings, red, green slime
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; the squatters must read as "occupying" with no motion — if a pick looks
merely sleeping rather than wedged-in, reject
```

### V4 — telegraph and counter-mark plate

```
POSITIVE: reference plate of flat vector game-UI signal graphics on a clean near-black ink-blue
backdrop (hex #14202E), crisp minimal linework with solid fills, uniform two-pixel strokes, seven
geometric threat class marks laid out in a labelled-feeling row lattice WITHOUT any actual letters:
three stacked downward chevrons, a square bracket pair, a cracked square, a folded stamp corner, a
featureless silhouette head, a single wave line, a torn receipt edge with jagged bottom; below them
a second row showing the same marks rendered small inside shield-outline defense icons to
demonstrate counter-matching (a scrubber cone holding the chevrons, a lattice gate holding the
brackets, a desk shape holding the stamp corner, a badge reader holding the head mark); muted bone-
white mark colour on dark, one hostile magenta accent (hex #E04FD8) reserved for a sample
approach-band graphic at the plate edge showing an incoming-contact marker and dotted projected
path; flat, unlit, no gradients, no texture, high contrast, greyscale-safe by shape alone, no text,
no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, 3D bevels, gradients, drop shadows,
pixel-art stair-steps, glow, rainbow palette, decorative icons
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 3; these marks are canonical reference for icon authors — pick the sheet where
every mark survives being scaled to a 16px thumbnail
```

---

**PICK CRITERIA:** class identifiable from silhouette at Z3 with colour removed (§8.5 acceptance
bar); no two malicious-family silhouettes confusable at 24px (§8.16); magenta-family-only hostility
hue — red stays reserved (Hue Ledger §8.2).
