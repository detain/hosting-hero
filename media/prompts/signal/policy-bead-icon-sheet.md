# Policy bead icon sheet — the cable alphabet

<!-- spec: hosting_game.md §8.2 (Attachment layer: flat, screen-space scale, rides its unit,
     occludes own unit only), §4.2 LinkObject/"policy bead" (GLOSSARY: the 8-shape state marker on
     a cable — TLS/valve/fuse/timeout/pool/retry/gate/egress), §8.7 (defense verbs: valve meters,
     circuit breaker opens, one-way gate, scrubbing centre filters) -->

Policy beads are the tiny emblems that ride a cable at the exact point a rule acts on traffic:
padlock = TLS/auth-on, valve = rate-limit setpoint, fuse = timeout budget, hourglass = deadline /
patience window, fan-out = connection pool, loop-arrow = retry policy, gate = admission control,
cone = scrub/filter path. They must read at 16px, sit on a moving line without wobbling, and pair
every hue with a shape (Two-Channel Law). Sheet V1 is the canonical dictionary; V2 shows beads
IN CONTEXT on a cable run; V3 is the keyed sprite sheet for the engine.

### V1 — the eight-bead dictionary

```
POSITIVE: flat vector icon sheet of eight tiny game emblem beads in a two-by-four grid on a clean
near-black ink-blue background (hex #14202E), each bead built on the same circular base plate the
size of a shirt button — dark slate disc, one hairline rim — with a single bold centered glyph,
flat unlit, uniform 2px stroke weight, chunky enough to survive 16px: (1) a closed padlock in pale
steel, (2) a valve wheel with a drip forming below its spout in muted cyan (hex #35E0E6), (3) a
small glass fuse cartridge with an intact filament in warm amber (hex #F2B133), (4) an hourglass
with sand mid-fall in bone white, (5) a three-way fan-out arrow splitting one line into three in
muted teal, (6) a single loop-arrow circling back on itself in dusty violet (hex #8F5FE8 kept as
thin line only), (7) a portcullis gate of three vertical bars with one centre seam in pale steel,
(8) a wide funnel cone narrowing downward with one drop exiting its tip in muted green (hex
#4FC46A); every glyph different in SILHOUETTE not just detail, generous even gaps, identical plate
size across all eight, no gradients, no glow, no shadows, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, 3D bevels, drop shadows, gradients,
decorative filigree, mismatched base plates, hourglass with readable numerals, padlock with keyhole
detail clutter
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 4; shuffle test: hide all but silhouettes, a viewer must still sort valve vs
cone vs fan-out instantly — those three radial shapes are the failure mode
```

### V2 — beads on a live cable (context study)

```
POSITIVE: flat vector scene-study on a deep blue-black field (hex #0D131C): one clean horizontal
traffic cable drawn left to right as a gentle sagging catenary line in muted steel grey, carrying a
dense stream of tiny luminous cyan motes (hex #35E0E6) flowing rightward with subtle speed-tail
hints; clamped ON the cable at four evenly spaced points sit three of the dictionary beads — a
valve wheel where the mote stream visibly narrows to a metered drip and re-widens downstream, a
fuse cartridge past a small junction, and a closed padlock further along where two motes pass
through with faint paired sparkle ticks — each bead a dark disc with its bold glyph, drawn slightly
larger than the cable width, riding the line like a bead on a string, casting no shadow, lit by
nothing; one fifth position on the cable left as an empty ring-shaped socket awaiting a bead, drawn
as a thin dashed circle in bone white (the game's intent-ink convention); crisp flat annotation
aesthetic, everything readable in greyscale by shape placement, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, 3D pipes, glowing energy beams, electric
arcs, busy circuit-board background, perspective depth blur, rainbow palette
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 3; the narrowing-then-widening mote stream at the valve is the entire point —
reject frames where throughput looks unchanged across the bead
```

### V3 — keyed bead sprite set for the engine

```
POSITIVE: sprite sheet of eight game emblem beads on a flat solid magenta #FF00FF background, each
drawn as a self-contained 64px-class icon: identical dark slate circular base plate with hairline
rim, bold flat glyph centered — padlock, valve wheel with drip, fuse cartridge, hourglass, three-way
fan-out, loop-arrow, barred gate, funnel cone — colors restricted to pale steel, muted cyan (hex
#35E0E6), warm amber (hex #F2B133), muted green (hex #4FC46A), bone white; perfect horizontal and
vertical alignment in a two-by-four lattice with wide even gutters, no shadows bleeding onto the
magenta, no glow halos, hard clean outer edges for colour keying, flat unlit vector style, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, gradients, glow, drop shadow, photorealism, varied
plate sizes, outlines touching each other, magenta tint bleeding onto beads
size: 1024x1024
aspect: 1:1
style: vector
background: magenta-key
variations: generate 4; key each cell and inspect the alpha edge at 400% — any magenta fringe
means reseed that bead alone
```

---

**PICK CRITERIA:** every bead identifiable at 16px silhouette + one channel of hue (Two-Channel
Law, §8.2); beads never occlude more than their own cable point (Attachment sub-layer law); the
empty dashed-socket cell matches the Intent-layer convention (white, dashed, half-toned) so
"place a policy here" reads as player intent, not content.
