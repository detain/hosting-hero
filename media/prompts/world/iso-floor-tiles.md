# Iso floor tiles — aisles, containment, zones, zero-state

<!-- spec: hosting_game.md §8.4 (raised floor grid, perforated tiles, containment, painted row
     markings, Thermal Ride-Through tile reads, patched-tile scar map), §8.1 Two-Palette Discipline
     (floor is the most muted thing on screen), §8.2 Zero-State Art -->

The substrate under everything: 2×2-tile raised-floor segments meant to tile seamlessly in-engine.
Floor carries almost no hue — sealed concrete greys, putty, faded painted markings — so that every
saturated pixel above it means state. Perforated vent tiles are the one pattern object; containment
zones change floor paint and lighting temperature, never decoration colour. Scars (patched tiles of
a slightly different beige) are the permanent incident memory (§8.4 Scar Map) — authored here as a
variation, placed by the engine later.

### V1 — the base tile atlas (seamable)

```
POSITIVE: seamless texture atlas sheet for isometric pixel-art game flooring on a flat solid magenta
#FF00FF background, 32-bit iso pixel discipline at a fixed 2:1 isometric tile angle, six diamond
floor tiles laid in a neat staggered lattice with clean gaps: plain sealed concrete in two near-
identical muted greys, one putty-beige variant, one with a round perforated vent pattern of small
dark holes in concentric rings, one with a faint painted safety stripe border along two edges in
chipped desaturated yellow, and one showing a subtle anti-static grid texture in slightly cooler
grey; every tile shares the same low-contrast matte material family — no tile draws the eye; dust
levels vary from clean to a light even patina across two tiles; crisp pixel edges, flat overhead
lighting with identical shadow direction baked nowhere, absolutely no objects on the tiles, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, ornate patterns, tiles casting shadows
on each other, gradient lighting, wet reflections, carpet, wood, colored decorative flooring, cracks
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 4; before keying, stamp each tile twice side by side and check seam continuity
at 400% zoom — a visible seam kills the tile regardless of beauty
```

### V2 — cold aisle vs hot aisle strips

```
POSITIVE: wide isometric pixel-art diorama strip on a flat solid magenta #FF00FF background, 32-bit
iso style: two parallel floor studies shown end to end as clean empty corridors with no equipment —
left half a COLD AISLE floor: cool pale-grey perforated vent tiles in a regular run, a thin seam of
pale blue-grey tint suggesting chilled air weeping upward from the tile holes as faint low mist
wisps hugging the floor, crisp cool overhead light; right half a HOT AISLE floor: warmer grey tiles
with visible heat-shimmer distortion rendered as gently wavy air lines above the surface, a faded
chipped red-black warning border stripe along its edges, slightly dusty, warmer material tone; the
two halves divided by one subtle painted line; desaturated materials throughout — the temperature
story is told by tint, mist and shimmer, not saturated colour; hard readable geometry, flat lighting
from above, crisp pixels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, racks or cabinets, fire, orange glow flood, neon
lines, heavy blue/purple colour cast, steam clouds, background room walls
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; greyscale flip test — cold strip must still feel calmer/cleaner and hot
strip busier/hazier with colour removed (lighting-tone carries the Two-Channel load)
```

### V3 — containment corridor and zone thresholds

```
POSITIVE: isometric pixel-art diorama pieces on a flat solid magenta #FF00FF background, 32-bit iso
style, three modular containment fragments with generous gaps: (1) a short aisle segment wrapped in
translucent plastic strip curtains — overlapping vertical clear-grey strips with soft sheen lines,
top and bottom rails in muted steel, the curtain visibly diffusing everything behind it; (2) a
swing-door portal frame in brushed steel mesh with a small window panel, standing as its own
threshold object; (3) a floor-zone boundary tile pair showing where one business district's faded
painted floor marking (a thin geometric border and corner ticks in one desaturated accent — teal
paint on one tile, ochre paint on its neighbour) meets bare concrete, the paint chipped and walked
thin; all pieces share the game's muted concrete-and-steel material family, hard readable
silhouettes, flat overhead lighting, light dust patina, crisp pixels, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, glass walls with reflections, bright
safety colours, construction site clutter, people, doors open on a room scene
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 3; the curtain piece is the money sprite — reseed it alone until translucency
reads as plastic strips rather than fog
```

### V4 — scar archaeology tiles

```
POSITIVE: seamless-style atlas of isometric pixel-art damaged and repaired floor tiles on a flat
solid magenta #FF00FF background, 32-bit iso, six diamond tiles in the same concrete family as the
base atlas but each bearing one quiet permanent scar: (1) one replacement tile in a VERY slightly
different beige, visible only as a subtle mismatch, (2) a tile with a pale circular scorch bloom at
its corner, (3) a tile edge chipped with two small dark repair-patch blobs of fresh grout, (4) a
tile with faded tyre scuff arcs crossing it, (5) a tile ringed with a thin painted maintenance box
outline, chipped, (6) a tile with a small screw-down floor anchor plate added later, its shadow
pool tiny; all scars low-contrast, matter-of-fact, years-old — the visual memory of incidents, not
new damage; consistent matte lighting, crisp pixel edges, no debris fields, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, dramatic fire damage, rubble, caution tape, fresh
bright scorch, blood, hazard stripes, clutter
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 4; these tiles sit under expensive equipment all day — pick the set where every
scar is noticeable only after the base floor reads, never before (Quiet Frame Test)
```

---

**PICK CRITERIA:** seam continuity at 100% and 400% zoom; floor never out-draws the objects on it
(≤2% emissive budget means ZERO emissive here); cold/hot pair survives greyscale via tone+mist only.
