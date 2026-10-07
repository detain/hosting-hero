# The hockey-stick landscape — latency cliff country

<!-- spec: hosting_game.md §4.1/§7 (the ρ knee: queue time grows ρ/(1−ρ) — "the most important curve
     in the game"; slots-not-HP; failure at ~150% utilisation is a STATE WITH DURATION; degradation-
     not-destruction: saturation → brownout → partial → cascade), GLOSSARY, §9.13 (the curve is the
     simulation's signature) -->

The curve as terrain: a river valley that gentle-grades and then VERTIGOES — latency rendered as a
cliff country you can almost hear. Wide establishing art for docs/web headers about capacity.

### V1 — the valley and the cliff

```
POSITIVE: grand painterly editorial landscape with the bones of an isometric pixel-art diorama —
crisp silhouettes, matte muted geology of concrete-grey mesas, steel-blue shadow, putty beige flats
— a wide 16:9 canyon scene whose terrain IS a curve: the left two thirds a long gentle almost-
horizontal plain of soft green-grey terraces where a bright cyan river (hex #35E0E6) flows lazily
in a flat confident ribbon carrying tiny glowing mote-boats, the riverbanks calm, small tidy
settlement structures of dark server-block architecture spaced along it with healthy pinprick
window-lights; then, at the plain's end, the land simply LEAVES — a brutal vertical latency cliff
where the river arcs over the edge into a towering white-cyan fall that dissolves far below into
turbulent amber-misted fog banks (hex #F2B133 stains rising from the gorge) and the water's orderly
mote-traffic visibly SNAPS into churning spray, tiny boats flipping; along the cliff rim, a dotted
path of warning stones placed while everything still looked fine, and one small lone hooded figure
standing at the precipice edge with a lantern, reading the drop, unhurried because they built the
railing; the sky grades from calm dusk blue behind the plain to a hot orange-brown haze banked up
behind the falls (heat lens #F0862E as atmosphere only); scale-vertigo composition, painterly
atmosphere over pixel-solid geometry, greyscale value structure doing the storytelling, no text, no
letters, no numbers, no axis marks, no watermark, no UI captions
NEGATIVE: text, letters, numbers, chart axes, grid lines, watermark, photorealism, actual graphs,
disaster framing, wrecked buildings, people falling, storm destruction, neon, cartoon exaggeration
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4; the cliff's RIM must look perfectly safe from the plain's side — the horror
of the hockey stick is that it approaches flat
```

### V2 — the queue canyon (congestion as geography)

```
POSITIVE: editorial illustration with iso-pixel diorama DNA, elevated three-quarter view looking
along a narrowing stone canyon whose floor is a broad processional road: hundreds of tiny rounded
mote-figures in calm cyan (hex #35E0E6) advance in orderly lanes that progressively COMPRESS as the
canyon narrows toward a small dark toll gorge in the distance, the front ranks standing in visible
dense stacked queues beside the road — queues you can see from SPACE — their patience expressed as
thin glowing rings around each figure, the rings in the back ranks full and the front ranks' rings
dissipating to hairline; above the gorge, a second cliff face shows the same road continuing as a
thin bright line, but a wide amber delta-fan (hex #F2B133 as dry salt-flat deposit, not liquid)
spreads below the queue where overflow has quietly evaporated — the bounced, rendered as mineral
memory on the landscape; the canyon walls wear stratified rock bands in muted beige and rust like
cable archaeology, tiny dark structures cling to ledges with single green lights (hex #4FC46A);
late-afternoon side light raking long queue-shadows toward the gorge, painterly dust in the air,
deep perspective, quiet menace of arithmetic not disaster, magazine-grade restraint, greyscale-
legible compression gradient, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, crowds with faces, panic, riot imagery,
floods, fire, military formations, graph overlays, harsh neon, clutter
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4; check the shadow test — raking light must make queue density readable as a
value gradient before any colour is perceived
```

### V3 — the 150% room (failure as a state with duration)

```
POSITIVE: painterly editorial interior with isometric pixel-art architecture, a single dark
server-hall room at the exact moment the curve stops being a promise: the near half of the hall
perfectly composed — tidy racks, calm green LED constellations, an orderly cyan mote-stream flowing
along its inlaid pipe-channel (hex #35E0E6); the far half has gone into the state the game calls
brownout — the same racks lit amber and dimming row by row in a wave that is clearly TRAVELING, the
mote-stream in its channel visibly STACKED UP, motes bumper-to-bumper in a glowing traffic jam
with tiny compressed spacing rings, one overflow of pale motes spilled out of the channel onto the
floor tiles wandering confused, and at the jam's head the channel's grate structure slammed shut
with a rising halo of amber haze around it (hex #F2B133), while from the ceiling vents above the
jam, thin heat-shimmer lines distort the air into a soft orange lens film (hex #F0862E,
translucent wash only); the composition's argument: nothing has exploded, everything is CONTINUING
— clocks tick, a mug steams on a crash cart, a lone technician stands at the jam's edge with hands
on hips reading it, one hand reaching for a wall-mounted rotary shutoff; dusk window light from one
high window keeps the room's colours honest and matte; moody, precise, dread-through-restraint,
greyscale value storytelling, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, explosions, fire, smoke clouds, sparks,
panic running, alarm-red flood, disaster movie rubble, sci-fi interface holograms, broken glass
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3; the traveling amber wave must have a visible FRONT — degradation is a
process with a direction, that line-in-the-room is the whole lesson of failure-at-150-percent
```

---

**PICK CRITERIA:** viewer must independently arrive at "this gets much worse very suddenly" with no
caption (the curve's betrayal is the subject); no disaster cliches — the spec's failure is a STATE
WITH DURATION, so picks showing instant destruction are rejected; all three pieces legible as
thumbnails for docs sidebars.
