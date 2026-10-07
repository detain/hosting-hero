# Icon & App Tiles — Pocket-Scale Identity (design at 1024+, die at 16)

<!-- spec: hosting_game.md §8.16 Silhouette Sheet discipline (black-on-white size plates, no confusable pair at 24px — the same rigor applied to the product icon), §8.17 (the mark appears as loading-screen/screenshot watermark — tiny-scale presence is canon), docs/adr/0001 (iso-pixel world: the icon may be a miniature-world window), Hue Ledger (an OS-home-screen icon borrows state colors freely since it sits outside the sim — but internally stays honest: amber=one lit thing among green). -->

BRANDING family, product-surface plates. Icon law across this file: content lives inside the central ~80% SAFE ZONE (OS corner-radius masks and badge overlays eat the outer bleed — describe nothing important there), silhouettes must be die-able (no thin hairlines below the weight that survives 16px), and every plate is generated big and judged small. The recurring subject is the game's own essence — one lit amber rack among dark-green order — not a letter.

---

### V1 — Master App Icon (1024 lineage, rounded-square plate)

```
POSITIVE: premium app icon design, single square canvas with very subtle vertical charcoal gradient background, composition strictly inside the central 80% safe zone with generous breathing room from all edges: an isometric miniature of one server rack rendered in clean chunky pixel-diorama logic — matte near-black cabinet at a three-quarter iso angle with visible depth on two faces, its front comb glowing one single amber #F2B133 band at chest height while the remaining bands read deep muted green #4FC46A at 20% brightness, a hairline of cool cyan #35E0E6 rim light along the cabinet's top-left edges, tiny soft pooled glow on an implied floor beneath. Nothing else in frame: no globe, no lightning, no letter, no face. Execution: crisp upscale-safe pixel shapes smoothed for icon scale, rich dark palette, the kind of quiet object-legend that looks hand-lit among noisy home-screen gradients; light source consistent top-left; edges clean enough to silhouette. No text, no letters, no numbers, no watermark, no UI captions. The amber band is the only saturated mass in the icon and sits on the vertical center line so it survives any corner-radius mask.
NEGATIVE: any text letters numbers, skeuomorphic metal reflections, clouds or globe, shields or padlocks, speed-light streaks, drop shadow outside the icon's own square, glossy web-2.0 buttons, more than one bright color zone, thin hairline details that vanish at small size
size: 2048x2048
aspect: 1:1
style: pixel-art
background: scene
variations: SAFE-ZONE AUDIT: overlay a rounded-corner mask at 22% radius and a bottom badge strip in review — reject seeds whose rim-light or floor glow depends on the outer 10%. Re-roll family: swap the amber band's position (top/middle/bottom third) and cabinet angle (left-iso/right-iso); right-iso with middle-amber is the presumptive heir because the beam of eye travels into the light.
```

### V2 — Store Tile Variant (high-contrast promo tile, dark field)

```
POSITIVE: digital storefront tile artwork, 1:1 square, composed as a window into a night scene with heavy vignette: the lower two-thirds show a receding isometric row of tiny pixel racks down a dark aisle — dozens of faint green #4FC46A comb-points establishing order and scale — with exactly one rack mid-distance blazing warm amber #F2B133, its glow spilling across the raised-floor tiles in a soft trapezoid and lighting the underside of overhead cable plumes; above the aisle, the top third dissolves into clean dark ink-blue #14202E atmosphere with only faint dust sparkle, deliberately empty for store-front typesetting of the real title in software. All essential content inside the central 80% safe zone; corners are pure atmosphere. Mood: the single problem in a field of competence — the game's entire loop visible in one glance at phone size. Painterly light, pixel architecture, restrained palette of three plus dark, no detail busier than a comb-point anywhere near the frame edges. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: any text or letterforms, multiple amber racks, red alert color, storm or fire effects, human figures, UI elements, barcode-like density in the far rows, lens artifacts, busy upper third
size: 2048x2048
aspect: 1:1
style: editorial-illustration
background: scene
variations: TEXT-ZONE: upper third stays under ~12% luminance in every seed. Shrink-test routine at 96px: the one-amber-among-green read must survive; seeds where the hero rack blurs into the row are re-lit harder. Companion light-mode tile requested (day aisle, one rack still amber, same geometry) for stores that invert tile treatment.
```

### V3 — Silhouette Legibility Plate (16 / 32 / 48 die-test)

```
POSITIVE: professional icon-design specification sheet, flat pure white background, one horizontal row of three solid black silhouettes of the SAME mark — the isometric rack cabinet of the app icon with its single amber band reduced to pure mass — shown at three decreasing sizes from left to right, largest at 48-unit equivalent, middle 32-unit, smallest 16-unit, evenly spaced on a common baseline with wide margins, absolutely no letters, numbers, rulers, annotations or captions anywhere on the sheet: the three sizes are distinguished purely by scale and each retains identical topology — open top rail gap, two visible cabinet faces, one notched band removed from the mass to keep the amber story as a silhouette bite rather than a color. Rendering: crisp vector-black, square-cut pixel edges consistent at each scale (the small sizes simplified by chunk, not by blur), zero anti-alias fuzz, zero gradients. The sheet's whole purpose is die-ability evidence: someone could cut these as stencils and still recognize the family.
NEGATIVE: any text, numerals or size labels, drop shadows, colored variants on the same sheet, outline-only silhouettes, more or fewer than three instances, perspective camera mockups, grid or guideline clutter, rounded smooth reinterpretations at small size
size: 2560x1080
aspect: 21:9
style: vector
background: scene
variations: re-roll each scale's simplification strategy separately (bite-vs-notch for the band, two-face-vs-one-face at 16) and assemble the honest matrix by hand afterward — §8.16 rule: if 16 and 32 need different marks to survive, that IS the finding this plate exists to produce. Greyscale pass is automatically this plate; keep the pass-candidates out of V1/V2 instead.
```

### V4 — Favicon & Knockout Set (monochrome survival family)

```
POSITIVE: design sheet, flat warm-white background, a tight 2x2 arrangement of the SAME simplified rack mark in four technical finishes, absolutely no letters numbers or annotations: top-left solid black silhouette on white; top-right white knockout inside a small solid charcoal rounded square chip; bottom-left single-color cyan #35E0E6 mark on the warm-white field; bottom-right single-color amber #F2B133 mark on a deep ink-blue #14202E rounded chip — all four stripped to the 16px-surviving topology from the silhouette plate: two-face iso cabinet, open top rail, one banded bite, no interior detail whatsoever. Each quadrant identical in scale and centered in its cell with generous air, pixel-crisp square-cut edges, zero shadows, zero gradients, zero stroke effects — this is the favicon/monochrome/one-color/light-chip family that must never disagree with each other or with the master icon.
NEGATIVE: any text or labels on the sheet, four different marks, metallic or embossed treatments, more than four chips, background texture, drop shadows, multi-color versions, decorative spacing ornaments
size: 1536x1536
aspect: 1:1
style: vector
background: scene
variations: audit routine — print-check each quadrant alone at 16px in the browser before accepting the set; all four must be identifiable as the V1 master by someone who has never seen this sheet. Request a fifth-cell alternate (green #4FC46A on charcoal) only if the owner's OS-theme matrix needs the served-healthy variant; four is the shipped ask.
```

---

**PICK CRITERIA:** everything is judged shrunk — V1/V2 at 96px, V3's smallest die at 16px, V4 cells at favicon size; full-resolution beauty earns nothing here (§8.16: no confusable pair, and that includes confusing the icon with its own variants). Safe-zone law: any seed whose story needs the outer 10% of the plate is culled regardless of composition, because every storefront rounds and badges it away. Family coherence: master icon (V1), tile hero rack (V2), and the die silhouettes (V3/V4) must be provably the same object — lay them side by side desaturated; if the topology wavers the set ships nothing. Monochrome honesty: the mark's amber story must survive as a silhouette BITE (V3) — if black-on-white loses the "one lit band" claim entirely, the master gets redesigned until the bite exists; color is not load-bearing identity.
