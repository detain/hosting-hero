# NETWORK ANATOMY — cables as a living system

<!-- spec: hosting_game.md §8.4 (cross-connect ladder, orange fibre = money, spawn edge); §9.13 gate-4 'drag a cable' + port-shape grammar (data trapezoid / copper power); §4.1 queue hockey-stick; §8.1 lighting model (power failure = descent into darkness) -->

The topology is the map — this family films the plumbing like it's the nervous system it
is: typed ports that snap home magnetically, packet beads flowing edges, the copper
circulatory pulse of power, and the red-tide wash of a trip propagating hop by hop.
Density rule throughout: suggest cable complexity with glow and rhythm, never with 48
individually readable strands — fine grids are where video physics breaks.

## SHOT NA-1 — Magnetic snap

Macro close-up: a data connector drifts toward its trapezoid port, the port rim glows, and
the last few millimetres happen fast — a magnetic snap home with a ring of light, LEDs
walking on behind it.

### V1 — The last centimetre
```text
META
camera: macro static, shallow frame
loopable: no
seed-suggestion: 14011
text_zones: none

LTX-VIDEO
prompt: A chunky pixel-art data connector shaped like a soft trapezoid drifts slowly toward a matching recessed port on a dark steel panel, the port rim beginning to glow cyan as it approaches, then the connector snaps home in one fast decisive jump as a ring of cyan light ripples outward and a row of small green LEDs walks on from left to right behind the panel. The camera holds macro-static on the docking moment. Desaturated gunmetal panel with one cyan-lit seam, hard pixel edges, matte with one gloss accent on the connector shell, tactile satisfying click made visible, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hands, fingers, slow mushy motion, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 3/5 — one fast snap inside slow drift
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Extreme close-up of exactly one pixel-art panel port, a trapezoid recess glowing with a cyan rim, and exactly one matching connector. The connector drifts slowly toward the port, pauses a finger's width away, then snaps home instantly with a single expanding cyan light ring; immediately three small green LEDs illuminate one after another beside it. Camera is static macro framing, no cuts, no shake. Desaturated gunmetal with saturated cyan and green points, crisp pixel silhouettes, deeply satisfying mechanical moment, no human hands or fingers anywhere, the snap is the only fast motion in an otherwise still frame.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hands entering frame, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 3/5 — one fast snap inside slow drift
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Wrong shape bounces off
```text
META
camera: macro static
loopable: no
seed-suggestion: 14012
text_zones: none

LTX-VIDEO
prompt: A copper-colored rounded power connector approaches a trapezoid data port on a dark pixel-art panel, the port rim flashing a brief dismissive red as the connector stops dead a centimetre short and is gently pushed back out of frame by its own cable, the rim glow settling to a patient idle cyan. The camera holds macro-static on the polite refusal. Desaturated gunmetal with copper and red accents, hard pixel edges, matte surfaces, comic near-miss energy, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hands, sparks, violent motion, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 2/5 — small precise motions
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static macro shot of one trapezoid port on a pixel-art steel panel. Exactly one rounded copper connector enters slowly from the right and tries to dock; the port rim pulses red twice, the connector halts, backs out along its own cable and exits frame, and the rim returns to a soft cyan idle glow. No cuts, no zoom. Desaturated gunmetal palette with copper body and red-then-cyan rim light, crisp pixel silhouettes, dry mechanical comedy, absolutely no hands or fingers, sparks forbidden, only the connector and rim light move.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hands, sparks, explosion
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 2/5 — small precise motions
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Row of docks, domino lighting
```text
META
camera: slow left-to-right track along the panel
loopable: no
seed-suggestion: 14013
text_zones: none

LTX-VIDEO
prompt: Five pixel-art connectors dock into a horizontal row of trapezoid ports one after another in quick succession, each snap firing a cyan ring that travels a little outward, and as the fifth docks a line of green LEDs ignites left to right along the panel rail beneath them. The camera tracks slowly rightward keeping the newest dock centered. Desaturated gunmetal panel with saturated cyan rings and green rail glow, hard pixel silhouettes, rhythmic assembly-line satisfaction, matte with one gloss accent, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hands, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow left-to-right track
motion-strength: 4/5 — repeated quick snaps
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A wide pixel-art patch panel holding exactly five trapezoid ports in one row. Connector after connector docks from left to right, five snaps in even rhythm, each releasing a thin cyan light ring; after the fifth, a green LED rail under the row lights up sequentially. Camera performs one slow left-to-right track following the action, no cuts. Desaturated gunmetal with cyan and green accents only, crisp pixel silhouettes, industrial choreography mood, no hands, no cables tangling, one ring per snap and nothing else pulses.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hands, tangled cables, camera cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow left-to-right track
motion-strength: 4/5 — repeated quick snaps
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Idle glow breathing (loop)
```text
META
camera: locked-off macro
loopable: yes
seed-suggestion: 14014
text_zones: none

LTX-VIDEO
prompt: Two already-docked pixel-art connectors sit in dark trapezoid ports on a gunmetal panel while their cyan rim glows breathe in a slow alternating cycle, one rising as the other lowers, tiny green status lamps holding steady beside them and faint dust drifting through the rim light. The camera is locked off in macro framing and the breathing is continuous, symmetric and endless, a quiet heartbeat of a made connection. Desaturated gunmetal, saturated cyan rim points, matte surfaces with one gloss accent, meditative stillness, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, motion, camera movement
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off macro
motion-strength: 1/5 — glow breathing only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off square macro of exactly two docked pixel-art connectors in trapezoid ports, green status lamps steady. Their cyan rim glows breathe in a slow perfectly alternating cycle — left rising while right falls — with faint dust drifting through the beams; camera never moves and the clip loops seamlessly. Desaturated gunmetal with two cyan rims and green points, hushed machine-room night mood, crisp pixel edges, no people, no text, only the alternating glow and dust move, geometry fully static.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera shake, connector movement
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off macro
motion-strength: 1/5 — glow breathing only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the hero — the snap must read as instant, not mushy; reject any take where the connector deforms on contact (that's the model improvising physics). V2/V3 prove grammar (shape law, row rhythm); V4 is the idle arm.

## SHOT NA-2 — Beads along an edge

Packet beads are the traffic of the SIGNAL register: solid cyan dots on a thin clean line.
Congestion turns the line into a tube where beads queue and stack, the tail bending
upward — the hockey stick made literal.

### V1 — Healthy edge
```text
META
camera: static tripod
loopable: yes
seed-suggestion: 14021
text_zones: none

LTX-VIDEO
prompt: A steady procession of small cyan beads flows left to right along a single thin glowing line stretched between two dark nodes on a plain deep-navy field, beads evenly spaced and moving at constant speed while the node lamps pulse softly green on each pass. The camera holds completely still and the flow continues evenly with no beginning or end, dots bright against the flat vector darkness. Crisp flat vector animation, solid saturated cyan dots, uniform thin stroke, no texture, no gradient, no shading, clean data-diagram aesthetic.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, 3d render, gradient background, photorealistic
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: static tripod
motion-strength: 2/5 — even constant flow
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Minimal flat-vector animation on a deep navy field: exactly one thin glowing horizontal line connecting two small dark node squares, and a continuous even stream of solid cyan beads traveling left to right along it at constant speed, each bead passing under a soft green node pulse. Camera static, no cuts, seamless loop. Clean diagram aesthetic, saturated cyan on navy, uniform stroke width, no shading, no gradients, no texture, no background detail, beads keeping perfect spacing with no collisions or pileups.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, 3d, gradient, beads stopping
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: static tripod
motion-strength: 2/5 — even constant flow
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Congestion: the stack bends up
```text
META
camera: static tripod
loopable: no
seed-suggestion: 14022
text_zones: none

LTX-VIDEO
prompt: Cyan beads flowing left to right along a thin glowing vector line begin to slow near the right node, and the traffic behind them stacks into a growing queue that bends the line upward into a steep hockey-stick curve, beads pressing elbow to elbow while fresh beads still arrive from the left. The camera holds static on the forming jam as the right node's lamp steps from green to amber. Crisp flat vector animation, solid saturated cyan beads on dark navy, uniform thin strokes, no texture, no shading, tension through geometry alone, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — flow to jam
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Flat-vector data scene: one thin glowing line from left edge to a node square at the right carrying a steady stream of solid cyan beads. The beads near the node slow to a crawl and queue up behind it, and the queued section lifts into a smooth upward curve like a bent fishing rod while arrivals from the left keep coming; the node lamp changes green to amber. Exactly one static wide shot, no cuts. Saturated cyan and amber on deep navy, uniform stroke weights, clean diagram mood turning tense, no 3d, no texture, no people, the curve deformation is slow and continuous rather than snapping.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, 3d render, line breaking, flickering
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — flow to jam
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Purge: the stick straightens
```text
META
camera: static tripod
loopable: no
seed-suggestion: 14023
text_zones: none

LTX-VIDEO
prompt: A jammed hockey-stick curve of queued cyan beads on a glowing vector line releases all at once as the right node flashes green, the bent section snapping back to a flat line in one smooth elastic motion while the freed beads shoot through in a bright train and spacing rebuilds itself. The camera holds static as order restores across the frame. Crisp flat vector animation, saturated cyan beads and green node pulse on deep navy, uniform thin strokes, cathartic relief motion, no texture, no shading, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 4/5 — release burst
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Flat-vector scene continuing a queue: a steep upward curve of packed cyan beads on one glowing line beside a dark node. The node lamp flashes green, the bent line relaxes smoothly back to flat in a single elastic motion, and the packed beads stream through the node as an evenly spaced train. Camera static, no cuts. Deep navy field, saturated cyan with one green pulse, clean data-diagram style, satisfying release, no 3d, no texture, the line never breaks and beads never overlap into mush.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, 3d render, line snapping, static frame
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 4/5 — release burst
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Two edges crossing (no collision)
```text
META
camera: slow vertical crane down
loopable: no
seed-suggestion: 14024
text_zones: none

LTX-VIDEO
prompt: Two thin glowing vector lines cross over each other on a dark navy field, one carrying cyan beads left to right and the other carrying a sparser gold bead train bottom to top, their beads passing through the intersection point without ever touching while the camera drifts slowly downward across the crossing. Crisp flat vector animation, solid saturated dots on uniform thin strokes, deep navy emptiness around them, the two flows keeping constant speed, elegant choreographed indifference, no texture, no shading, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, collisions, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow crane down
motion-strength: 2/5 — held flows, gentle camera
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Flat-vector composition of exactly two glowing lines crossing in an X on a deep navy field: the horizontal line carries an even stream of cyan beads rightward, the vertical line carries a sparser gold bead train upward, and both streams pass through the crossing point at constant speed without collision or mixing. Camera performs one slow crane-down, no cuts. Saturated cyan and gold on navy, uniform stroke widths, quiet choreography, crisp diagram style, no 3d, no texture, no people, line geometry stays perfectly straight throughout.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, 3d, beads colliding, bending lines
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow crane down
motion-strength: 2/5 — held flows, gentle camera
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V2 must be legible as a queue, not a blob — reject takes where beads merge into worms; V1 is the ambient-loop arm for loading screens; V4 tests two-flow discipline (a classic morph failure — if either line wobbles, cut it).

## SHOT NA-3 — Copper circulatory system

Power is copper and pulse: a tree of thick copper feeds carrying a slow amber heartbeat
from an UPS heart outward to drinking racks, and the night-shift when the building dims and
the copper does more of the work.

### V1 — Heartbeat down the tree
```text
META
camera: static high-angle wide
loopable: yes
seed-suggestion: 14031
text_zones: none

LTX-VIDEO
prompt: A slow amber pulse of light travels outward from a large battery cabinet heart through a branching tree of thick copper pixel-art power feeds, each branch brightening in turn as the wave passes and small rack lamps under the branches brightening a notch with it, the pulse repeating at an even resting pace. The camera holds a static high-angle wide of the whole copper tree on its dark concrete floor. Desaturated grey diorama with saturated copper and amber glow only along the feeds, hard pixel silhouettes, matte metal, calm circulatory rhythm, continuous and endless, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, electricity arcs, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static high-angle
motion-strength: 2/5 — rhythmic pulse
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: High-angle static wide of a pixel-art power distribution diorama: exactly one large UPS cabinet at the center feeding a branching tree of four thick copper cables that run to a row of low server racks. A soft amber light pulse travels outward from the cabinet through the trunk into each branch in sequence every few seconds and each rack lamp brightens briefly as its branch lights; the pattern repeats evenly for a seamless loop. Dim concrete room lit mostly by the copper itself, desaturated greys with saturated copper-amber accents, crisp pixel silhouettes, living-machine calm, no people, no arcs or sparks, cables never sway.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, lightning, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static high-angle
motion-strength: 2/5 — rhythmic pulse
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Macro along a fat feeder
```text
META
camera: slow tracking along the cable
loopable: no
seed-suggestion: 14032
text_zones: none

LTX-VIDEO
prompt: The camera glides slowly along the length of one thick copper pixel-art power feeder as a single fat amber pulse of light rolls ahead of it down the cable like a drop through a vein, the woven copper sheen catching highlights, bolts and clamps passing at the frame edges, the pulse sliding smoothly out ahead and disappearing into a distribution lug. Desaturated dark background, copper filling the frame, saturated amber traveling glow, matte with one gloss accent, macro intimacy with machinery, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, arcs
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow cable tracking
motion-strength: 3/5 — glide plus rolling pulse
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Macro tracking shot along exactly one thick copper power cable rendered in pixel-art game style, filling the frame diagonally: clamps and hex bolts pass by the edges while a single rounded amber glow travels ahead of the camera down the cable and dissipates into a metal lug at the far end. The camera performs one slow continuous dolly along the cable, no cuts. Woven copper texture suggested by flat pixel shading, dark desaturated background, one saturated amber traveler, quiet biological metaphor, no hands, no sparks, cable stays perfectly straight and only the glow moves along it.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, swinging cable, electricity arcs
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow cable tracking
motion-strength: 3/5 — glide plus rolling pulse
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Night shift takeover (grid to battery)
```text
META
camera: slow push-in on the UPS cabinet
loopable: no
seed-suggestion: 14033
text_zones: none

LTX-VIDEO
prompt: The ambient white glow of a pixel-art power tree dims as the building sleeps, and one by one the copper feeds relight with a warmer deeper amber as a large battery cabinet takes over the load, its own face lamp climbing steadily while the whole tree's rhythm slows to a heavier heartbeat. The camera pushes slowly toward the UPS cabinet as it becomes the brightest thing in the dark room. Desaturated greys falling toward black, saturated amber rising in the copper, hard pixel silhouettes, night-shift responsibility mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, blackout panic, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — dimming and relighting
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Pixel-art power distribution diorama at night: a UPS cabinet center-frame feeding a four-branch copper tree to server racks. Over the clip the cool ambient light fades to near darkness and the copper branches relight sequentially with a deeper warm amber as the battery cabinet's single face-lamp climbs higher and its pulse rhythm slows to a heavier beat; camera executes one slow push-in toward the cabinet, no cuts. Dim-to-dark room lit only by equipment, amber overtaking cool grey, dependable-night-shift mood, crisp pixel silhouettes, no people, no alarm flashes, exactly one state handover with no flicker between sources.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, strobing, camera cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — dimming and relighting
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Portait of one plug drinking
```text
META
camera: static close-up
loopable: no
seed-suggestion: 14034
text_zones: none

LTX-VIDEO
prompt: A chunky copper pixel-art power plug sits fully seated in its kettle-shaped socket on a dark rack face while a slow amber pulse travels down its cable, spreads through the socket ring, and lights one small rack lamp beyond it, the cycle repeating like a patient drink being offered and accepted. The camera holds a static close portrait of the plug, shadows deep around the metal. Desaturated steel and copper, saturated amber ring pulse, matte with one gloss accent on the plug shell, quiet domestic machine intimacy, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, sparks, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static close-up
motion-strength: 2/5 — rhythmic pulse
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static close portrait of exactly one seated pixel-art power plug in a kettle-shaped copper socket on a dark server rack. A rounded amber pulse travels down its cable into the socket ring every few seconds, and one small rack lamp beside the socket brightens and holds, then dims for the next cycle; the loop repeats evenly. Deep shadow around the plug head, desaturated steel with saturated copper-amber accents, still-life tenderness, crisp pixel edges, no hands ever approach the plug, geometry totally static except the traveling pulse and one breathing lamp.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hands, sparks
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static close-up
motion-strength: 2/5 — rhythmic pulse
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V3 is the family hero — the dim-to-amber handover must read without any alarm vocabulary; V1 is the idle-loop arm; V2's macro cable is the riskiest physics (reject if the cable wobbles like a snake).

## SHOT NA-4 — Tripped breaker, red tide

The failure grammar: a breaker opens with an unglamorous *clack*, darkness hops from rack to
rack, and the upstream feeds wash red as beads turn grey and stall — a tide going out, not
an explosion.

### V1 — Hop by hop into the dark
```text
META
camera: static tripod wide
loopable: no
seed-suggestion: 14041
text_zones: none

LTX-VIDEO
prompt: A small breaker switch on a pixel-art power panel drops with a crisp downward clack and its lamp flips green to red, and then rack by rack a row of server racks goes dark away from the panel, each losing its LEDs in a quick one-two domino until six racks stand black, the last rack's dark windows winking out one final straggler light. The camera holds a static wide of the aisle as the darkness marches. Dim room falling into deeper dim, one saturated red breaker accent, desaturated greys, hard pixel silhouettes, unglamorous cascading failure, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, fire, sparks, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod wide
motion-strength: 3/5 — marching darkness
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static wide shot of a pixel-art server aisle with exactly one breaker panel at the near end and six lit racks beyond it. A small breaker handle flips down, its status lamp steps green to red, and darkness then hops outward rack by rack, one per beat, LED rows dying top to bottom, until every rack stands black except the panel's own red glow. No cuts, no zoom. Dim room descending into near-darkness, desaturated greys with one saturated red accent, quiet inevitability, no sparks, no smoke, no people, the hop sequence staying perfectly evenly spaced.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, sparks, fire, flickering lights
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod wide
motion-strength: 3/5 — marching darkness
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Red tide washes the copper upstream
```text
META
camera: slow pull-back from the trip point
loopable: no
seed-suggestion: 14042
text_zones: none

LTX-VIDEO
prompt: A deep red wash of light travels backward along thick copper pixel-art power feeds away from a freshly tripped breaker, the color climbing upstream branch by branch like tide going out in reverse, amber pulses in the branches stuttering and stopping one after another as the red front passes each junction. The camera pulls back slowly to reveal the whole darkening tree from trip point to UPS. Desaturated greys, copper turning from amber to red from the middle outward, hard pixel silhouettes, anatomical failure spreading, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, fire, smoke, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow pull-back
motion-strength: 3/5 — spreading color front
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Pixel-art power tree seen close at one tripped breaker, camera slowly pulling back along the trunk as the story widens: a red light front travels upstream from the breaker through each copper junction in sequence, and every branch it passes loses its amber heartbeat and goes quiet, until the whole four-branch tree sits red-and-still in the widening frame. One continuous slow pull-back move, no cuts. Desaturated steel and copper with the red front as the only motion, clinical domino of failures, crisp pixel silhouettes, no smoke, no sparks, no people, nothing moves after the front passes.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, explosion, camera cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow pull-back
motion-strength: 3/5 — spreading color front
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Beads turn grey mid-lane
```text
META
camera: static tripod
loopable: no
seed-suggestion: 14043
text_zones: none

LTX-VIDEO
prompt: Cyan beads streaming along a thin glowing pixel-art data lane flicker to dull grey one by one and coast to a gentle stop in place, the whole river parking into a scattered line of still beads while the node lamp at the lane's end slides green to red, leaving the lane itself dark and the parked beads the only body language of loss. The camera holds a static wide of the lane as motion drains out of it. Deep navy field, saturated cyan fading to grey, one red node accent, flat vector cleanliness, the quiet after, no texture, no shading, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 2/5 — motion draining out
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Flat-vector data lane on deep navy: a steady river of solid cyan beads flowing toward one dark node square. As a red lamp ignites on the node, the beads desaturate to dull grey progressively from the node backward and coast to a halt in neat single file, ending with a fully parked lane and no remaining flow. Exactly one static shot, no cuts. Cyan-to-grey transition reading clearly as loss, saturated red only on the node lamp, uniform stroke width, mournful clean diagram aesthetic, no collisions, no disappearances — every bead stays visible when stopped.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, 3d, beads vanishing, flickering
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 2/5 — motion draining out
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Aftermath hold, one amber survivor
```text
META
camera: locked-off wide
loopable: yes
seed-suggestion: 14044
text_zones: none

LTX-VIDEO
prompt: A dark pixel-art aisle of fully dead server racks holds in absolute stillness while exactly one small amber fault lamp keeps breathing slowly at the far end, its pulse the only movement in the black room, faint cool moonlight from a single high window laying one pale stripe across the concrete. The camera is locked off, the scene patient and endless, the breathing amber marking the work that comes next. Desaturated black-grey diorama, one saturated amber pulse, hard pixel silhouettes, funeral calm with purpose, continuous loop with no beginning or end, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera movement, people walking
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: locked-off wide
motion-strength: 1/5 — single breathing lamp
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off wide of a pixel-art server aisle after a total power trip: every rack dark and still, cable plumes motionless overhead, one single high window throwing a pale moonlight stripe across dark concrete. Exactly one amber fault lamp at the aisle's end breathes up and down slowly on a long cycle; camera never moves and the clip loops seamlessly. Near-black desaturated palette with one amber pulse and a cold grey window shaft, solemn calm before recovery work, crisp pixel silhouettes, no people, no flicker, nothing else alive in frame.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera shake, lights coming back on
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: locked-off wide
motion-strength: 1/5 — single breathing lamp
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1's hop rhythm must stay even — uneven domino reads as random flicker, reject it; V2 is the family hero for "failure has anatomy"; V4 is the moody idle arm and doubles as a marketing thumbnail (the window shaft is the §8.4 Window doing its job).
