# Cable trays & coloured cords — the plumbing palette

<!-- spec: hosting_game.md §8.4 (trays by function: yellow single-mode fibre, blue copper data, red
     crossover/legacy, black power, orange OM2 legacy fibre, aqua OM3/OM4; house cord convention
     amber=copper Ethernet, aqua=fibre, black/red=power A/B feeds, grey=out-of-band,
     violet=cross-connect, white='temporary'; sheath bands NEAR CONNECTOR ONLY from six desaturated
     non-semantic hues; above Z2 cables collapse into link ribbons, width ∝ aggregate bandwidth;
     cable archaeology — beige Cat5 + grey Cat5e + blue Cat6 + aqua fibre strata in one tray), §8.7
     (catenary sag physics of the connect verb) -->

Cables carry the game's two most audited truths — redundancy (two colours, two paths) and history
(era strata in one tray). Authored as tray sections, cord bundles and ribbon forms, all obeying the
sag law: cables hang, they never float.

### V1 — function tray section set

```
POSITIVE: sprite sheet of four isometric pixel-art cable tray fragments floating with honest cable
weight on a flat solid magenta #FF00FF background, 32-bit iso game style, each a short section of
perforated steel ladder tray in pale galvanised grey carrying one discipline of cabling laid in
tidy courses: (1) a data tray dense with copper ethernet cords, grey and blue jackets with small
clip combs at intervals; (2) a fibre tray carrying thinner cords in warm amber and pale aqua
jackets looped with respectful bend radius, a few strain-relief loops hanging off the side like
polite knots; (3) a power tray of thick black and deep red armoured cables sitting heavy in the
tray with visible sag between fixings; (4) a legacy crossover tray where dusty orange and faded
beige cords are bundled with discoloured zip ties while a newer run in clean aqua has been laid
gently on top, unclipped, respecting the old — cable archaeology in one frame; all jackets
desaturated, no bright rainbow, velcro straps matte grey at regular intervals, tray perforation
pattern crisp; hard readable silhouettes, flat even lighting, crisp pixels, one-pixel outlines,
generous gaps, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, glowing cables, neon jackets, floating
straight cables with no sag, spaghetti tangle, sparks, duct tape everywhere, saturated primary
colours
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; zip-tie-vs-velcro mix is a legibility feature — pick the sheet where a
player could later learn "tight tie = someone was in a hurry"
```

### V2 — the cord bundle dictionary (sheath-band hues)

```
POSITIVE: sprite sheet of eight short isometric pixel-art cable stubs arranged in a two-by-four
lattice on a flat solid magenta #FF00FF background, 32-bit iso style, each stub a neat small bundle
of two to five cords seen at three-quarter angle, all bundles in the SAME muted jacket family —
various dark greys and charcoals — distinguished only by one thin SHEATH BAND wrapped near the
connector end of each cord, exactly one band per cord, from a controlled six-hue desaturated set:
pale amber (hex #C97A45), soft aqua (hex #35E0E6 desaturated half-way), matte black with a red
tracer, flat grey, restrained violet (hex #8F5FE8 as a thin ring only), chalk white; connectors at
each cord's tip: trapezoid modular plugs, small square optic heads, round power barrels, matching
their cord's band logic; bands placed near the connector only, never mid-span — the game's
convention that the body speaks the flow layer and only the end speaks the circuit; velcro strap
mid-bundle, honest slight sag on each stub, hard silhouettes, crisp pixels, even lighting, no text,
no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, full-length cables crossing the sheet,
rainbow palette, glow, tangled mess, labels or tags with writing, connector brand detail
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; test the bands at 16px crop — six hues this muted risk muddying; reject any
stub pair whose bands blur together in greyscale by luminance too
```

### V3 — link ribbons (the Z2 abstraction of V1's cords)

```
POSITIVE: flat vector reference plate on a deep ink-blue background (hex #14202E) showing the same
cable disciplines as schematic LINK RIBBONS, the higher-zoom-game abstraction: five horizontal
ribbons of clearly different WIDTHS drawn in smooth flowing arcs across the plate, each a flat
translucent band with a solid hairline core and a row of tiny directional motes inside — a thick
ribbon in quiet cyan (hex #35E0E6), a medium ribbon in warm amber-copper (hex #C97A45), a thin one
in chalk white, a narrow violet-edged one (hex #8F5FE8), and a heavy dark one carrying red-and-
black twin core lines for dual power; one junction where the thick cyan ribbon splits into three
thinner ones with a small clean fork fitting, and one place where a ribbon crosses a gap with a
gentle catenary dip so even the abstraction remembers gravity; width differences unmistakable —
they encode aggregate bandwidth; flat unlit annotation style, crisp edges, uniform stroke discipline,
greyscale-safe by width and core-count, no text, no letters, no numbers, no watermark, no UI
captions
NEGATIVE: text, letters, numbers, watermark, photorealism, glow bloom, laser beams, pipeline
diagrams with valves, circuit traces, perspective depth, rainbow gradients
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 3; these ribbons are what a whole floor looks like from orbit — pick the one
where the five disciplines sort by eye-weight instantly
```

---

**PICK CRITERIA:** cords obey sag (a floating cable = reject, §8.7 catenary law); bands appear at
connector ends ONLY; ribbon widths distinguishable in pure silhouette (width ∝ BW, §8.4 zoom
law); archaeology frame tells era-order with no captions.
