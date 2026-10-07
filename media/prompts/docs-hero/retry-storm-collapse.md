# Docs-Hero — Retry Storm (metastable collapse)

<!-- spec: hosting_game.md §4.1/§7 retry storm EMERGENT + metastable failure (stays broken after trigger removed; escape = shed load), §8.2 queue donut, §8.5 siege tide, §8.6 visible stacking queues -->

Cover for "the traffic you caused": an original modest wave that the system's own retries amplify into a storm that outlives its trigger, with shed-load as the only door out. 3 variations.

---

### V1 — The amplification spiral

```
POSITIVE: editorial illustration, isometric diorama DNA, of a retry storm as an emergent spiral: a modest origin — a single dark cloud at the map's upstream edge, small, unremarkable — sends a thin violet-grey tide of visitor shapes into a service lane; the tide is visibly multiplying not from the cloud but from the system itself: at a saturated origin node drawn mid-frame, a thick ring of failed requests peels off, loops back on itself as brighter hooked retry arrows, and re-enters the lane doubled, and those retries fail at a deeper dependency and loop again — three nested loop-currents around the same bottleneck, each brighter and denser than the one outside it, so the lane's traffic mass comes mostly from its own recirculation while the original cloud behind is already thinning and almost gone; above the choked node a utilization donut is a near-full saturated amber-red ring, a queue of shapes stacks in a visible line three racks deep, patient rings around them almost spent; one escape valve stands closed at the lane's side — a shed-load gate object in white dashed intent outline, unchosen, while everything nearby browns out; mood: dread from arithmetic, the system eating itself; muted concrete-steel world, flow colors violet-grey in, amber saturation at the knot, white only for the intent dashed gate, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, watermark, UI captions, photorealism, explosion, fire, external hackers or skull icons, tornado cliches, rainbow, the cloud as the visible cause of the mass.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4 — the eye must trace the loops and conclude "most traffic here was born in the loop"; cloud small, knot huge.
```

### V2 — It outlived its cause

```
POSITIVE: editorial diptych illustration, isometric diorama DNA, two halves of one hall sharing the same camera angle: in the left half the originating trouble is visibly over — the upstream cloud is gone, the sky at the map edge clear, one lonely faded visitor shape drifts in — yet the lane still churns at full storm: the retry currents sustain themselves, hooked white-cored loops cycling amber-hot through the same saturated bottleneck, the queue donut still pinned, the stacked line of clients still losing patience rings in cascading unison; in the right half the same scene has been drawn one decision later: the shed-load gate now thrown open, a clean white arrow-shaped channel carrying the overflow out of the frame, and the loop currents visibly collapsing — the outer ring already dark and cooling, the donut unwinding to a calm arc, the stacked queue beginning to breathe again; the pairing tells the two laws in one image: failure that persists without its trigger, and the only escape being deliberate sacrifice; palette austere and muted, storm amber and cooled grey doing all the talking, sparse cyan service lights returning on the right, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, watermark, UI captions, photorealism, both halves identical, explosions, rescue vehicles, arrows glowing rainbow.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 3 — the left half's "cause already absent" cues (clear edge, single faded visitor) are the whole point; keep them crisp.
```

### V3 — The metastable plateau

```
POSITIVE: editorial illustration rendering a systems idea as a landscape inside the world, isometric diorama DNA: a facility hall whose floor itself is shaped like a potential-energy terrain — the healthy service state sits in a broad calm basin on the left where cyan beads flow unhurried in clean lanes; the retry-storm state sits in a second, darker basin on the right where the same lanes circulate in tight amber loops and the air above shimmers with heat; between them rises a long steep ridge of crumpled floor, and the cruel geometry is drawn exactly: a small modest ball — the original disturbance — has already rolled back down to calm ground and rests peacefully in the left basin, while a second, heavier ball of recirculating light hangs motionless at rest deep in the right basin, perfectly stable, needing no pusher at all, held there by the shape of the system itself; a narrow notched pass exists in the ridge near the storm basin's rim, drawn in white dashed intent lines, where a thin stream is being released downhill — load being shed one drip at a time — the only route by which the resting ball can ever be coaxed back; mood: the quiet horror and the quiet mechanics of a state that is not an event but a place; muted greys and stone tones, amber saturation confined to the storm basin, cyan confined to the healthy one, white for the dashed pass, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, axis labels, graph captions, watermark, UI captions, photorealism, chaotic storm clouds, lightning, both basins same mood.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4 — terrain metaphor must stay architectural and calm; if it reads as weather painting, reject.
```

---

**PICK CRITERIA:** a viewer must come away understanding the storm feeds itself and can outlive its trigger, and that the escape is a deliberate opened valve; the small-origin/big-knot contrast is mandatory; greyscale pass on all three basins/loop structures.
