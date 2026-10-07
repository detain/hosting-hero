# Store Banners — Capsules, Headers, Billboard (commerce shapes)

<!-- spec: hosting_game.md §8.17 Key Art (the hero composition doubles as the store face; Rack Portrait poster tradition), §8.1 Establishing Frame + industrial-grit register for exteriors, docs/adr/0001 iso-diorama law (every banner stays miniature-world, never photoreal). Platform shape grammar is external to the spec — Steam header ~2.14:1 (460x215 lineage), store capsule 3:4 (1200x1600 lineage), library vertical 2:3 (600x900 lineage) — prompts generate at hi-res parents with crop-safe centers; final lettering/badges are typeset in software afterward, never by the model. -->

PROMO family, commerce-grade plates. Each block targets one retail surface with its own aspect law and its own safe-zone discipline: focal art kept in the region that survives cropping, reserved quiet zones where the store front-end will overlay real title text and buttons. Same hand as key-art-hero.md — banners are that world's signage, not a separate art program.

---

### V1 — Steam Header (wide 16:9 parent, 2.14:1 crop-safe core)

```
POSITIVE: painterly-editorial concept art, 3840x2160 wide canvas composed so that a horizontal center band (roughly the middle 47% of height) contains every essential element — the art must survive being cropped to a slim 2.14:1 store header — inside that band: the hero pullback compressed sideways, hot-aisle rack combs glowing green #4FC46A with their single amber #F2B133 row on frame left, containment glass mid with cyan #35E0E6 traffic streaks moving through it left-to-right, the small human figure with flashlight walking right toward the exit-door light, and just readable above the band's top edge the beginning of the ceiling cable-plume chandeliers. The strip's far right third is deliberately calmer — dark structure, faint clerestory glow — reserved as the zone where real title text and platform buttons get typeset over this plate in software. Above and below the safe band the full 16:9 canvas carries generous fallback atmosphere: pure ink-blue #14202E gradient haze, no important shapes, so any crop variant works. Tilt-shift miniature reading, practical lighting, dust in the flashlight cone, industrial grit on floor edges. Muted palette, saturated state-colors sparse. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: essential elements placed near top or bottom edge, photoreal render, flat vector, neon glare, busy sky, readable screens, any lettering, lens flares, characters facing away from the light path
size: 3840x2160
aspect: 16:9
style: editorial-illustration
background: scene
variations: TEXT-ZONE: right third of the safe band must stay low-luminance for overlay type — reject seeds with bright racks there. Generate the 16:9 parent once, then request only lighting re-seeds, never recompositions, so all store surfaces stay the same shot; export also a native 3072x1728 rematch for platforms that dislike downscale.
```

### V2 — Store Capsule (3:4 portrait, the scroll-stopper)

```
POSITIVE: painterly-editorial concept art, vertical 3:4 capsule plate at 2400x3200, designed at the honest size people meet it — a thumbnail on a dark store page — so exactly three elements exist and nothing else competes: center, the tiny operator figure with flashlight, warm beam cutting down-frame, larger than they really are for legibility; directly beneath their feet, the single amber #F2B133 rack glowing like the figure's reason for walking; everything else receding into a clean dark ink-blue #14202E vertical gradient, aisle edges suggested by two faint converging comb-rows of dim green #4FC46A that read as texture, never clutter. Top quarter of the plate is empty gradient reserved for typeset title overlay in software. Style: miniature diorama vignette, painterly falloff, one warm practical light source, strong single silhouette, high value contrast between the lit trio and its surrounding dark. The capsule's contract: readable at 120px tall, evocative at 400. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: multiple focal points, full-scene detail dumps, faces, fog hiding the silhouette, saturated background color, rainbow LEDs, decorative particles, anything in the top quarter gradient, flat icon style
size: 2400x3200
aspect: 3:4
style: editorial-illustration
background: scene
variations: TEXT-ZONE: top quarter must remain under ~12% luminance. Pick routine: after seeding, scale candidates to 200px and to greyscale — the three-element story (figure, beam, amber rack) must survive both; seeds failing either are culled before human review. Request one alternate with the beam pointing up (figure below, amber rack above) for A/B of walk-toward vs walk-out-of framing.
```

### V3 — Library Vertical (2:3, shelf-art standing)

```
POSITIVE: painterly-editorial concept art, 2:3 vertical plate at 2400x3600 built like a book's cover standing on a shelf among other covers: a single unbroken depth journey from bottom to top of frame — at the base the hot-aisle floor, rack end-caps with green #4FC46A combs flanking like bookends, the small silhouetted operator entering the aisle from the very bottom edge, flashlight beam starting the climb; mid-frame the containment glass band crossing horizontally, cyan #35E0E6 traffic streaks passing through it, cool blue light wrapping the figure mid-stride as they ascend a short stair; above that the propped exit door spilling a warm rectangle of dusk-peach campus light onto the landing; the top third of the frame the open night sky above the low campus roofline, deep clean gradient with the faintest stars, reserved deliberately quiet for typeset title treatment placed in software. The vertical read is the whole pitch: from machine dark up into outside air, one continuous climb. Isometric miniature world with painterly edges, tilt-shift easing the roofline, practical light only. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: horizontal compositions squeezed vertical, floating UI panels, crowded top third, moon or sun disc as focal point, birds or aircraft, smoke, signage on the campus building, lens flare, photoreal clouds
size: 2400x3600
aspect: 2:3
style: editorial-illustration
background: scene
variations: TEXT-ZONE: top third sky gradient must stay clear of rooflines and cable tips — recompose seeds where the campus pokes into type space. Variant pairing: request one seed with the door-light rectangle warmer (peach) and one cooler (predawn blue) to sit beside the era variants of key-art-hero without clashing.
```

### V4 — Mobile Companion Strip (wide utility banner)

```
POSITIVE: painterly-editorial concept art, 2560x1080 ultra-wide low strip designed for a phone notification-shade / companion-app header: a single horizontal ribbon of the world, read like a filmstrip of calm competence — left to right: a row of rack combs green #4FC46A in soft evening dark, one rack tipped amber #F2B133 mid-attention, a ghost-hand figure in translucent white #FFFFFF intent-outline already reaching it with a tiny tool trolley, traffic threads cyan #35E0E6 flowing past unbothered, and far right a small window glowing warm where someone sleeps through all of it. Everything vertically centered in the strip's middle 60% so rounded corners and OS overlays never touch the story. Flat depth: gentle tilt-shift, no strong perspective, silhouette-forward so it reads at 300px wide on a lockscreen. Palette mostly ink-blue #14202E night with sparse state-colors, one warm lamp point; the emotional contract is "it's handled" delivered in a glance while you're holding a coffee. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: busy vertical elements, faces, alarms, red, storm weather, gradient soup, decorative bokeh clutter, content touching strip edges, isometric towers taller than the safe middle band
size: 2560x1080
aspect: 21:9
style: editorial-illustration
background: scene
variations: pick at lockscreen size — thumbnail to 320px and ask "can you find the amber rack and the ghost in two seconds?"; the handled-incident micro-story must survive, otherwise flatten silhouettes harder. Companion variant: daytime seed with the same ribbon (green row, one rack freshly back to green, ghost tip-tapping its cap on the way out) for light-mode OS themes.
```

### V5 — Convention Booth Billboard (ultrawide, four-meter viewing distance)

```
POSITIVE: painterly-editorial concept art, 4096x2048 ultrawide exhibition panel intended to be printed several meters wide and read from across a convention hall: one colossal slow arc composition — from the far left the magenta #E04FD8 storm sea of hostile traffic beginning its swell, rolling rightward across the whole panel's height with genuine ocean weight; breaking mid-panel against the three-tier seawall promenade (the paranoia triad as architecture: boom teeth, louver-gate wall face, crest rail), ricochet bounce-arcs of white foam skipped back to sea; past the wall, the protected interior opens into a luminous green #4FC46A machine-city of orderly rack rows receding to the right horizon, cyan #35E0E6 traffic threads flowing safely down its avenues toward a small bright gatehouse whose windows glow warm gold #E8B23C, and on the wall's crest three tiny keeper silhouettes at the sensitivity wheel, impossibly small against the weather they manage, utterly in command. Upper third of the panel across its entire length: clean dark storm-sky gradient left transitioning to calm night right, reserved wide-open for the typeset title and booth messaging overlaid in software at print time. Scale drama is the point: this plate must work as a four-meter wall — broad value masses first (storm/wall/city), detail as reward on approach. Painterly, tilt-shift-free at this distance, practical atmospheric light, dust and spray rendered as mass not particle. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: centered single focal point, small-scale clutter, readable signage anywhere, the wave breaching the wall, destruction, energy-shield bubbles, cartoon storm clouds with faces, rainbow grading, vignette darkening the calm right side
size: 4096x2048
aspect: 2:1
style: editorial-illustration
background: scene
variations: TEXT-ZONE: full upper third, both eras of sky — reject seeds with lightning bolts or cloud drama intruding into type space. Print check routine: view candidate at arm's length blurred (simulate four meters); the storm-wall-city three-act must still read as silhouettes; then at full res confirm the three keepers are findable on the crest — they are the human hook at close range.
```

---

**PICK CRITERIA:** banners are judged by platform first, gallery second — every candidate runs the crop-gauntlet before anything else: V1 cropped to 2.14:1 core, V2/V3 shrunk to their native store dimensions, V4 to 320px, V5 photographed from across a room on a phone. TEXT-ZONE discipline: any plate whose reserved quiet zone carries luminance above ~15% or a salient shape is rejected regardless of art quality, because overlay type will fight it; the model never lettering, the store front-end always does. Series coherence with key-art-hero.md is mandatory — same camera, same ink temperature; a shopper who saw the hero shot on the landing page must recognize the building on the capsule. Greyscale pass at each surface's real pixel size, not at full res.
