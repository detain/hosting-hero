# GAMEPLAY LOOP — one minute of play, compressed

<!-- spec: hosting_game.md §9.13 gate-1 (bounce loop), §8.2 layer law, §8.5 (impact=1-frame red flash, blocked=shield ripple), §8.7 (FX_CoinArc: gold moves), §4.1 queue hockey-stick -->

The core loop as cinema: traffic beads arrive from the upstream edge, the WAF filters
the hostile ones, a diegetic gauge shows latency, an overloaded node bounces work back,
and gold coins arc into the cash bar. All WORLD-register isometric pixel diorama unless
a block says SIGNAL or CHROME. Seeds follow the family formula (GL=11). Negative lines
carry a short house base (documented in `../MODELS.json`); append shot-specific bans
after it, as these blocks already do.

## SHOT GL-1 — Traffic arrives

Genuine visitors, rendered as small cyan beads with pixel tails, stream in from a soft
cloud bank at the map's upper edge and settle into lanes that feed an isometric pixel
facility.

### V1 — Morning commuter
```text
META
camera: static tripod
loopable: yes
seed-suggestion: 11011
text_zones: none

LTX-VIDEO
prompt: Streams of tiny glowing cyan beads slide into frame from the upper left, following thin dark guide-lanes down toward a small isometric pixel-art building complex. The beads move at a steady commuter pace, keeping spacing, some pausing briefly at a junction before continuing. The camera holds perfectly still on the fixed 2:1 isometric view. Concrete grey and beige pixel rooftops, a few warm desk-lamp points glowing inside windows, overcast dawn light, nothing else moves.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hard cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — steady bead flow, held camera
cfg: 3.0 (official 3.0-3.5; distilled 8-step runs ignore CFG)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: An isometric pixel-art game world seen from a fixed 2:1 elevated angle: one stream of bright cyan glowing beads flows along thin dark lanes from a soft grey cloud bank at the upper edge into a small cluster of pixel buildings with warm lit windows. The beads travel steadily and never collide. Static camera, no cuts, no zoom. Morning overcast light, cool desaturated palette of concrete grey, steel and beige plastic, the cyan beads the only saturated color. Nothing else in the scene moves except the beads and one slow drifting cloud. Calm, orderly, miniature diorama mood, retro 32-bit pixel art style.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, live action, morphing shapes
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — continuous flow, camera locked
cfg: 4.0 (dev 3.0-5.0; at CFG=1 distilled, negatives ignored)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Dusk surge, slow drift
Same commuter stream at evening; camera creeps right, a warm sodium glow pools on the lanes.
```text
META
camera: slow pan, left to right
loopable: no
seed-suggestion: 11012
text_zones: none

LTX-VIDEO
prompt: A thickening river of cyan light beads pours down two pixel lanes toward an isometric facility as evening falls, the flow visibly quickening near the entrance. The camera pans slowly from left to right along the lanes. Warm sodium-vapor pools of light appear on the dark asphalt lanes, roof LEDs blink green in sequence, one amber LED blinks alone. Desaturated 32-bit pixel-art world, dusk violet gradient sky, long soft shadows, steady purposeful movement.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hard cuts, sudden zoom
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow pan left-to-right
motion-strength: 3/5 — accelerating flow, gentle drift
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art scene at dusk: a dense single-file stream of small cyan glowing beads moves along two dark pixel roads toward a squat server-hall building, the traffic visibly increasing in density over the shot. Slow left-to-right pan, one camera move only, no cuts. Lighting: warm sodium-orange pools on the road surface against a cool violet dusk sky, tiny green LEDs on rooftops, one amber warning LED blinking. Concrete grey, steel and beige materials, chunky readable pixels, retro game aesthetic. The beads, the drifting haze and the blinking LEDs are the only motion; buildings stay perfectly still. Evening rush atmosphere, orderly and slightly urgent.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, live action, jittery camera, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow pan left-to-right
motion-strength: 3/5 — dense steady flow
cfg: 4.0 (tune per model card)
steps_hint: 20-40
```

### V3 — Four-lane merge, high angle
Four tributary streams converge into two mains; busier but never chaotic.
```text
META
camera: static, higher angle
loopable: yes
seed-suggestion: 11013
text_zones: none

LTX-VIDEO
prompt: Seen from a high isometric angle, four thin streams of cyan beads enter from all four edges of a pixel-art map and merge at two junction points into two central lanes that feed a compact facility block. Beads briefly queue one-deep at the merge, then flow through. Small magenta beads ride the outer edges and are turned away at a checkpoint pylon before reaching the merge. Static camera. Flat matte materials, tiny saturated LED accents, hard midday light with short shadows, clean pixel shapes.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hard cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static high angle
motion-strength: 4/5 — four concurrent streams
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: High-angle isometric pixel-art world, fixed 2:1 game perspective. Exactly four streams of small cyan glowing beads enter from the four frame edges and merge into two central lanes that feed one squat pixel building; at each merge a bead waits one short beat, then proceeds. A few magenta beads touch an outer checkpoint pylon and bounce away. Static camera from a raised angle, no zoom, no cuts. Bright even midday light, short shadows, desaturated grey-beige diorama with saturated cyan and magenta points only, retro 32-bit pixel style, crisp readable silhouettes. Only the beads and the small bounce of the magenta ones move; nothing else shifts. Busy-but-calm market-day energy.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, live action, chaotic crowd motion
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static high angle
motion-strength: 4/5 — busy merge flow
cfg: 4.0
steps_hint: 20-40
```

### V4 — Signal-only minimal
Pure SIGNAL register — the abstract diagram, no world. Cleanest loop in the family.
```text
META
camera: static
loopable: yes
seed-suggestion: 11014
text_zones: none

LTX-VIDEO
prompt: Glowing cyan dots with short fading tails glide from left to right along a thin horizontal line on a flat ink-blue field. The line forks into two thinner lines; the dots divide evenly between the branches and keep flowing. One magenta dot arrives, strikes a small vertical tick-mark on the line, and dissolves into a brief ring. Flat 2D vector animation, uniform stroke width, no shading, no texture, no background detail, absolute minimalism, perfectly steady motion.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, 3d depth, gradients, grain
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 2/5 — metronomic
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Minimal flat 2D motion graphics: on a solid deep ink-blue background, exactly one thin horizontal cyan line carries small glowing cyan dots with fading comet tails from left to right; the line splits into two parallel branches and the dots alternate into them evenly. Midway, a single magenta dot hits a small vertical bar on the line and bursts into one quick expanding ring that fades. Static camera, no cuts. Uniform stroke width, solid saturated colors, no gradients, no texture, no shadows, no characters, Swiss diagram aesthetic, calm mechanical rhythm. The dots and one ring burst are the only moving things.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, photorealistic, live action, 3d render, depth of field, cluttered composition
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 2/5 — metronomic drift
cfg: 4.0
steps_hint: 20-40
```
**PICK CRITERIA:** GL-1 is the family's loop donor — V1/V3/V4 must hold camera and recycle motion invisibly; V4 wins for Aquarium screens (zero state change, one scripted magenta beat per pass — or re-roll V4 without the magenta dot for a pure idle bed).

## SHOT GL-2 — The WAF gate

A bright lattice gate spans the main lane. Magenta hostile beads slam into it and
deflect with a shield ripple; cyan legit beads thread through untouched. Blocked =
shield ripple, per §8.5's impact grammar.

### V1 — Ripple count
```text
META
camera: static, gate centered
loopable: no
seed-suggestion: 11021
text_zones: none

LTX-VIDEO
prompt: A lattice gate of glowing vertical light bars stands across a lane in an isometric pixel-art yard. Three magenta beads rush the gate one after another, each hitting the lattice with a circular shield ripple that knocks it skidding sideways off-frame. Meanwhile a steady line of cyan beads walks straight through the bars unharmed, their tails momentarily brightening as they pass. Static camera. Concrete yard, small green rooftop LEDs, flat overcast daylight, pixel art with crisp edges and exactly two saturated colors.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosions, smoke
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 4/5 — impacts and deflections
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art game scene, a glowing vertical-bar lattice gate standing over a single dark lane in a small concrete yard. Exactly three magenta beads charge the gate one at a time; each impact produces one flat circular shield ripple and sends the magenta bead sliding out of frame sideways. Through the same gate, a continuous queue of cyan beads passes untouched and keeps flowing. Static camera, no cuts, no zoom. Flat overcast daylight, desaturated grey and beige diorama materials, saturated magenta and cyan motion only, hard pixel edges, retro 32-bit style. Sparks are flat rings, not particles. Rhythmic, defensive, satisfying — a goal-line save on repeat.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, walking backwards, photorealistic, live action, explosions, fire, smoke, camera shake
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 4/5 — punchy impacts
cfg: 4.0
steps_hint: 20-40
```

### V2 — Side angle, heavy siege
Low oblique view; magenta wave after wave, the gate hums brighter with each hit.
```text
META
camera: static low oblique
loopable: no
seed-suggestion: 11022
text_zones: none

LTX-VIDEO
prompt: From a low oblique angle across an isometric pixel yard, a dense cluster of magenta beads surges at a glowing lattice gate in repeated waves, each wave hitting together and rebounding outward in a scatter. The gate bars flash a notch brighter with every impact, then dim back. Behind the gate, a few lucky cyan beads continue down the lane into a small building doorway, unbothered. Camera stays low and locked. Dusk rim-light on concrete, steel lattice shadows, pixel art, two saturated colors against muted grey.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, war footage, weapons, fire
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static low oblique
motion-strength: 5/5 — wave surges
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Low oblique camera angle over an isometric pixel-art facility yard at dusk, static camera, no cuts. Repeated waves of small magenta beads rush a glowing vertical-bar gate from the left; each wave strikes together as one cluster, flashes the gate brighter, and rebounds outward in a scatter before regrouping for the next charge. Behind the gate, three cyan beads walk calmly down the lane into a building door and disappear inside. Rim lighting in warm amber along concrete edges, long steel lattice shadows, muted grey-beige world with only magenta and cyan saturated. Retro 32-bit pixel style, hard silhouettes. The only non-motion is the patient building itself. Stubborn defense, tide-against-a-seawall feeling.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, live action, weapons, explosions, smoke, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static low oblique
motion-strength: 5/5 — siege rhythm
cfg: 4.0
steps_hint: 20-40
```

### V3 — The sneaker
One bead arrives violet and unresolving at the gate, holds, then is painted cyan by a scan pass and let through.
```text
META
camera: slow push-in toward gate
loopable: no
seed-suggestion: 11023
text_zones: none

LTX-VIDEO
prompt: A lone violet bead drifts toward a glowing lattice gate in an isometric pixel-art yard and stops just before the bars, its edges softly blurred and uncertain. A horizontal scan line sweeps over it once; on contact the bead snaps to clean cyan with a one-frame bright flash. The gate bars part briefly and the now-cyan bead continues through. The camera pushes in slowly the whole time, ending framed on the gate. Overcast daylight, concrete yard, small green LEDs, pixel art, restrained motion, a held breath released.
negative: worst quality, inconsistent motion, blurry jittery subject, watermarks, text, letters, numbers, captions, logos, morphing shapes, photorealistic, hard cuts, zoom pulsing
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — tense, minimal
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art game world, single dark lane with a glowing vertical-bar gate, overcast midday light, static desaturated grey concrete yard with tiny green rooftop LEDs. One violet bead with soft blurred edges floats up to the gate and halts just before the bars, wobbling slightly. A thin horizontal scan line passes over it once; the bead crisply changes color from violet to cyan with a single bright frame flash. The gate bars briefly widen apart and the bead passes through. Slow steady push-in camera toward the gate, one move only, no cuts. Retro 32-bit pixel style, hard silhouettes, exactly one moving subject until the release. Suspense resolving into calm — inspection, then trust.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, live action, multiple subjects, camera shake
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — held tension
cfg: 4.0
steps_hint: 20-40
```

### V4 — Post-clear calm (loop)
Gate dark and quiet; a trickle of cyan beads; held shot for idle screens.
```text
META
camera: static tripod
loopable: yes
seed-suggestion: 11024
text_zones: none

LTX-VIDEO
prompt: The lattice gate of an isometric pixel-art yard stands dim and quiet while a sparse trickle of slow cyan beads passes through it one at a time, tails fading behind each. Between beads, the scene holds nearly still: a single cloud shadow crosses the concrete, gate bars keep a faint breathing glow. Static camera, no movement otherwise. Dawn light, cool palette, muted grey-beige pixel buildings, tiny green LEDs steady. Meditative, post-storm calm, seamless mood.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hard cuts, sudden motion
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 1/5 — near-held
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Quiet isometric pixel-art yard at dawn, a glowing vertical-bar gate standing calm at center, a thin lane crossing the frame. Exactly one sparse line of slow cyan beads passes through the gate, each leaving a short fading tail, with empty pauses between them. A single soft cloud shadow drifts across the concrete floor once. Static camera, no cuts, no zoom. Cool low-contrast dawn light, desaturated grey-beige diorama, small steady green LEDs, retro 32-bit pixel style, hard clean edges. The beads and one cloud shadow are the only motion; the gate glow breathes almost imperceptibly. Serenity after a storm, screen-saver stillness.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, live action, fast motion, camera moves, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 1/5 — idle bed
cfg: 4.0 — for a true held look, prefer CFG 3.5 (higher CFG amplifies micro-jitter)
steps_hint: 20-40
```
**PICK CRITERIA:** ripples must be flat expanding rings (magenta grit puff per §8.5), never volumetric explosions; V4 is the aquarium cut — reject any take where the gate strobes.

## SHOT GL-3 — Latency ladder (CHROME)

Diegetic instrument wall: bezel-mounted segmented bar gauges climbing rung by rung,
amber rising toward a green band. No glyphs anywhere — color and position carry meaning.

### V1 — Segment cascade fill
```text
META
camera: static close-up
loopable: no
seed-suggestion: 11031
text_zones: none (numbers would live here — post-composite only)

LTX-VIDEO
prompt: A vertical column of segmented bar gauges mounted in a dark metal bezel fills upward step by step, each rectangular segment lighting in sequence from bottom green through mid amber toward a top red-free bright green band. A thin white indicator needle climbs smoothly behind the segments. The panel is a retro terminal instrument face, matte black plastic, subtle CRT scanline glow, one small round green power lamp pulsing softly. The camera stays locked in a tight static close-up. Flat unlit diegetic chrome aesthetic, deep ink-blue surroundings, no readable markings.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering digits, morphing shapes, photorealistic skin, hands
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static close-up
motion-strength: 3/5 — mechanical climb
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Extreme close-up of one diegetic instrument panel in a retro terminal wall: a single vertical column of unlit rectangular segments in a matte black bezel. Segments illuminate bottom-to-top in sequence — lower segments green, middle segments amber, the climb settling on a bright green band near the top — while a thin white needle rises behind them. Static camera, no cuts, shallow framing on the gauge column only. Lighting comes from the panel itself: soft glow on black plastic, a faint scanline texture over a nearby dark glass strip, deep ink-blue background. No human hands, no faces, no readable characters, flat crisp diegetic hardware style, calm technical atmosphere, precision instrument mood.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human hands touching, messy background, photorealistic people, camera shake, cuts
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static close-up
motion-strength: 3/5 — stepped climb
cfg: 4.0
steps_hint: 20-40
```

### V2 — Two-panel swing
Camera pans between a fast green gauge and a crawling amber one — latency split story.
```text
META
camera: one pan left-to-right, two panels
loopable: no
seed-suggestion: 11032
text_zones: none

LTX-VIDEO
prompt: The camera pans left to right across a wall of retro instrument gauges. It starts on a lively short gauge whose segments dance quickly in the green band, then travels past dark idle bezels to settle on a tall gauge whose amber column creeps upward segment by reluctant segment, needle trembling near a bright green band just above. CRT glow pools on matte black plastic, one amber warning lamp blinks slowly at frame edge. The pan is single, smooth, unhurried, and the shot ends held on the creeping gauge.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering digits, morphing shapes, photorealistic, hands, multiple pans
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: single left-to-right pan
motion-strength: 3/5 — mixed gauge tempo
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: A wall of diegetic terminal instruments in deep ink-blue shadow, exactly two gauges lit. One left-to-right camera pan begins on a short stubby gauge whose green segments flicker cheerfully, crosses two dark unused bezels, and ends holding on a tall gauge where an amber segment column creeps up one segment every beat, a thin needle trembling below a green band. No cuts, one pan only, final hold three seconds. Practical lighting from the panels themselves, soft reflections on matte black plastic and brushed steel bezels, faint scanlines on dark glass, no faces, no hands, no readable characters. Retro-futurist instrument room mood, patient tension, hardware you can trust but not rush.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, fast motion, camera shake, multiple cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: single left-to-right pan
motion-strength: 2/5 — slow creep feature
cfg: 4.0
steps_hint: 20-40
```

### V3 — Push into the green band
The climbing gauge resolves: needle settles green, one satisfied relay clicks, lamp steadies.
```text
META
camera: slow push-in to gauge top
loopable: no
seed-suggestion: 11033
text_zones: none

LTX-VIDEO
prompt: A segmented gauge column climbs the last three rungs of an isometric-free instrument close-up, amber segments flipping to green one by one as a thin needle crosses into a wide bright green band. The climb decelerates and stops exactly in band center; a tiny round lamp above the gauge blinks twice then holds steady green. The camera pushes in slowly the whole time, ending tight on the settled needle. Matte black bezel, soft CRT wash, deep ink-blue surroundings, quiet mechanical satisfaction.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering digits, morphing shapes, photorealistic, hands, overshooting past the green band
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — decelerating settle
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Static scene with slow push-in camera, one diegetic segment gauge filling the frame center on a dark terminal wall. Action timeline: the top amber segments flip to green one at a time over the first three seconds, a thin white needle eases into a wide green band, decelerates, and lands dead center in the final two seconds; a small round status lamp above blinks twice and holds green. No cuts. Lighting is self-emissive only: green glow spreading faintly across matte black plastic bezels, deep ink-blue background, faint scanline texture on adjacent dark glass. No people, no hands, no readable characters, retro instrument aesthetic. The feeling of a system being allowed to exhale.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, jittery motion, overshoot, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — settle arc
cfg: 4.0
steps_hint: 20-40
```

### V4 — Square format, full instrument wall (loop)
Wide symmetrical wall of breathing gauges, one shared slow scan — the "facility heartbeat" idle tile.
```text
META
camera: dead-on static, symmetric
loopable: yes
seed-suggestion: 11034
text_zones: none

LTX-VIDEO
prompt: A perfectly symmetrical wall of small retro instrument gauges fills a square frame, dozens of bezel columns glowing mostly green with gentle independent flicker at different tempos. Once across the wall, a single dim column drifts amber and returns to green; elsewhere a needle twitches. No camera movement. Matte black plastic, brushed steel rails, faint shared CRT wash, deep ink-blue shadows. The wall feels alive the way a server room hums: countless small steady motions, one shared slow breath.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hands, camera movement
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: dead-on static
motion-strength: 2/5 — micro-motion field
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: One wide symmetrical shot of an entire instrument wall in a dark terminal room, dead-center static camera, square composition. Dozens of small segmented gauges in matte black bezels glow steady green with subtle independent micro-flicker; exactly once during the clip a single column dims to amber mid-height, holds one beat, and eases back to green. No other state changes, no cuts, no zoom, no figures. Self-lit environment, soft pooled CRT glow on steel mounting rails, deep ink-blue ambience, retro diegetic hardware aesthetic, orderly and hypnotic. A living wall of nominal readings — boredom as the highest achievement.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, red alerts everywhere, flickering strobe, camera drift
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: dead-on static
motion-strength: 1/5 — ambient micro-motion
cfg: 3.5 — keep CFG modest; high CFG makes many small gauges jitter in sympathy
steps_hint: 20-40
```
**PICK CRITERIA:** zero glyphs is non-negotiable — if bezels sprout pseudo-dial numbers, reject the take (see no-text law); V4's wall must have exactly one amber excursion, any more reads as alarm.

## SHOT GL-4 — The bounce wince

An overloaded node flushes work back: beads arc out of a rack toward the gate, the
rack's LED strip pulses amber, a fan stutters. §4.1's queue, given a face.

### V1 — Single bounce
```text
META
camera: static, rack three-quarter
loopable: no
seed-suggestion: 11041
text_zones: none

LTX-VIDEO
prompt: In an isometric pixel-art server yard, a cyan bead reaches an overloaded squat rack, hesitates one beat, then arcs backward in a clean high parabola, flying back up the lane away from the rack. As the bead leaves, the rack's LED strip shifts from green to amber and pulses twice, and a tiny exhaust fan on the rack stutters, slows, then resumes. The lane behind keeps a short line of beads queued, waiting. Static camera, flat overcast daylight, muted grey-beige world with amber and cyan highlights, retro pixel style, one small failure among many patient successes.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, fire, smoke, explosions
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static three-quarter
motion-strength: 3/5 — one clean arc
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art facility yard, one squat server rack at right of frame with a green LED strip, a dark lane entering from the left holding a queue of three cyan beads. Action timeline: one cyan bead touches the rack front, pauses a beat, then launches backward along a high smooth parabola up the lane and off-frame left; on launch the rack LED strip turns amber and pulses twice, and a small rooftop fan stutters and slows before recovering. Static camera, no cuts, no zoom. Flat overcast daylight with soft shadows, desaturated concrete and beige plastic materials, saturated cyan and amber as the only loud colors, hard pixel edges, retro game diorama style. The queue beads hold their positions and wait. Quiet machinery embarrassment, no catastrophe.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, fire, smoke, explosion, sparks shower, camera shake
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static three-quarter
motion-strength: 3/5 — single arc event
cfg: 4.0
steps_hint: 20-40
```

### V2 — Cascade of three bounces
The rack flushes three beads in quick succession, LEDs climbing amber, queue growing.
```text
META
camera: static
loopable: no
seed-suggestion: 11042
text_zones: none

LTX-VIDEO
prompt: An isometric pixel rack at the end of a lane spits three cyan beads backward in quick succession, each riding a high flat arc out of frame. With every rejection the rack's LED strip climbs one more segment into amber until the whole strip burns steady amber, and its small queue of waiting beads grows from two to five. A fan above the rack runs visibly faster. Static camera on the yard, late afternoon light stretching pixel shadows, muted grey world, amber and cyan punctuation, mechanical stress told with tiny honest signals.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, fire, red alert strobe
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 4/5 — triple rejection
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art yard at late afternoon, low warm rim light on grey concrete, static camera, no cuts. One squat server rack with a segmented LED strip rejects work three times: exactly three cyan beads touch its front and rebound one after another along wide flat arcs out of frame. After each rejection the LED strip fills one more segment amber, ending with a full steady amber strip. A waiting line of cyan beads at left grows from two to five, and a small exhaust fan above the rack speeds up. Desaturated beige-and-steel materials, hard readable pixel silhouettes, saturated amber and cyan only. Nothing explodes, no humans, no text — the drama is entirely a gauge climbing. Overwhelmed-but-honest machine mood.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, fire, smoke, explosion, red strobe, camera movement
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 4/5 — three-beat flush
cfg: 4.0
steps_hint: 20-40
```

### V3 — Hockey-stick inside glass
CHROME cutaway: inside a glass tube on a panel, queued beads pile up in the infamous hockey-stick curve, then drain.
```text
META
camera: static macro on glass tube
loopable: no
seed-suggestion: 11043
text_zones: none

LTX-VIDEO
prompt: Tight close-up on a short glass tube mounted in a dark instrument bezel where small cyan beads flow in from the left and drain right. The drain narrows: beads begin stacking behind the pinch, the queue line rising into a steep hockey-stick curve as more beads pile against the blockage. Then the pinch opens, the queue drains in a relieved rush, and the curve flattens back to a level stream. Static macro camera, CRT wash on the glass, matte black plastic surroundings, faint scanlines, no labels, mechanics of congestion you can feel.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic liquid, hands
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 4/5 — build and release
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Extreme close-up of a horizontal glass tube set into a retro instrument panel, static camera, no cuts, framing locked on the tube. Inside, small cyan beads slide left to right through a channel that narrows at a pinch point. Timeline: for the first three seconds beads accumulate behind the pinch, the backlog visibly rising into a steep upward curve; near five seconds the pinch opens and the whole queue drains forward in one smooth rush, the curve flattening to a level stream. Lighting is self-emissive cyan on matte black bezels, faint CRT glow and scanline texture on the glass, ink-blue shadows. No hands, no faces, no readable markings, diegetic terminal aesthetic. Congestion and release as pure fluid mechanics — queueing theory you can watch.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, glass breaking, liquid realism, camera shake
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 4/5 — congestion build and drain
cfg: 4.0
steps_hint: 20-40
```

### V4 — Recovery exhale
After the flush: fans ease, LEDs step back green one segment at a time, queue beads finally enter.
```text
META
camera: slow pull-back
loopable: no
seed-suggestion: 11044
text_zones: none

LTX-VIDEO
prompt: An amber-pulsing pixel rack in a quiet isometric yard cools down: its LED strip steps back from full amber to green one segment at a time as the small fan above slows to a stop. The five waiting cyan beads then file into the rack in an orderly line, one after another, until the lane is empty. The camera pulls back slowly throughout, ending wide on the calm yard at dusk with the rack glowing steady green. Muted grey-beige pixel world, warm dusk rim light, held breath releasing, retro game diorama.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, alarm strobe, hands
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow pull-back
motion-strength: 2/5 — cooling down
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Dusk light on an isometric pixel-art facility yard, one squat rack with a steady amber LED strip at center, a single-file queue of five cyan beads waiting at left. Action timeline: the rack's amber segments switch off downward one by one and relight green from the bottom up over four seconds, the rooftop fan blades visibly slowing to rest; the five waiting beads then march into the rack one at a time until the lane is clear. Slow steady pull-back camera, one move, no cuts, ending wide and still. Desaturated grey-beige materials, warm violet dusk sky, tiny saturated green LEDs, retro 32-bit pixel style. Nothing else moves after the last bead enters. Relief, competence, a shift ending without incident.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, messy background, strobe, fire, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow pull-back
motion-strength: 2/5 — cooldown
cfg: 4.0
steps_hint: 20-40
```
**PICK CRITERIA:** amber must never reach red here (red is failure-final, this is a wince, not a death); V3's hockey-stick shape must be legible as a curve — reject blurry smear takes.

## SHOT GL-5 — Coins to the cash bar (gold moves)

Payment resolves: gold coins arc in a clean parabola into a layered pixel cash bar that
grows one bright segment per landing. §8.7's FX_CoinArc, made tactile.

### V1 — One coin, one segment
```text
META
camera: static side view
loopable: no
seed-suggestion: 11051
text_zones: none

LTX-VIDEO
prompt: A single gold coin arcs into frame from the left across a small isometric pixel-art desk scene, spinning once, and drops into the open top slot of a stacked bar made of golden layers. The bar grows exactly one new layer at its top as the coin lands, the whole bar giving a tiny satisfied bounce. A green lamp on a nearby bezel blinks once. Static camera, warm practical desk-lamp light from the right, muted greys and beige with the gold layers the loudest thing in frame, retro pixel diorama, one honest transaction.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, coin symbols, currency engravings, faces, flickering, morphing shapes, photorealistic
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static side view
motion-strength: 3/5 — single arc
cfg: 3.0 (coin detail is simple — no need to push guidance)
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Small isometric pixel-art desk diorama, static side camera, no cuts. Exactly one gold coin flies in from the left in a high smooth parabola, rotates once in the air, and drops into the slot on top of a bar built from stacked golden layers. On landing the bar grows one fresh layer upward and does a two-pixel squash-and-stretch bounce; a tiny round green lamp on a neighboring bezel blinks once and holds. Warm single desk-lamp source from the right throwing long soft shadows, matte grey and beige surroundings, saturated gold as the hero color, retro 32-bit game style. The coin is a plain thick disc with no embossing or markings, no humans, no readable characters anywhere. Simple satisfaction, one payment received.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, dollar signs, currency symbols, embossed faces on coins, deformed, disfigured, extra fingers, poorly drawn hands, human figures, money realism, pile of cash, camera shake
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static side view
motion-strength: 3/5 — one clean arc
cfg: 4.0
steps_hint: 20-40
```

### V2 — Coin rain (loopable)
Frequent steady coins, the bar breathes with landings; the money idle-loop.
```text
META
camera: static, slight high angle
loopable: yes
seed-suggestion: 11052
text_zones: none

LTX-VIDEO
prompt: Gold coins drop in a steady gentle rain from above into the slot of a layered pixel cash bar, one every half second, each landing making the bar shimmer and its top layer flash brighter for a moment. The bar stays the same height while the coins keep coming, the top layer cycling through shine. Slight high-angle static camera on the small isometric desk diorama, warm lamp light, muted grey surroundings, continuous small luxuries, seamless rhythm.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, coin faces, currency symbols, flickering, morphing shapes, photorealistic, hard cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static slight high angle
motion-strength: 3/5 — metronome rain
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art desk diorama seen from a raised static angle, no cuts, no camera movement. A steady gentle rain of plain unmarked gold coins falls one at a time into the slot atop a bar of stacked golden layers; each landing flashes the top layer with a quick shine that fades before the next coin arrives. The bar height never changes during the clip, so the moment can loop. Warm practical lamp glow from one side, cool dusk fill on the other, matte grey-beige world, saturated gold rain as the only motion besides dust motes. Retro 32-bit pixel style, hard coin silhouettes, no engravings, no humans, no text. Hypnotic small fortune, screen-saver wealth.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, dollar signs, embossed coin faces, human hands catching coins, deformed coins, morphing stacks, camera movement, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static slight high angle
motion-strength: 3/5 — metronomic
cfg: 4.0
steps_hint: 20-40
```

### V3 — Slow-motion arc
One coin in loving slow flight; rotation, light glints, the moment before money is real.
```text
META
camera: static macro side
loopable: no
seed-suggestion: 11053
text_zones: none

LTX-VIDEO
prompt: In very slow motion, a single gold coin crosses the frame left to right in a shallow arc above an isometric pixel desk diorama, rotating lazily, catching two bright glints of lamp light as its face turns toward the lamp. Background elements stay sharp: the layered cash bar waits below with its slot open, a green lamp glows nearby. The coin reaches the slot's vertical line exactly as the shot ends, without landing. Static macro side camera, warm key light, dust motes hanging still, pixel art with cinematic patience.
negative: worst quality, inconsistent motion, blurry background, jittery, distorted, watermarks, text, letters, numbers, captions, logos, coin engravings, depth of field bokeh, flickering, morphing shapes, photorealistic
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static macro side
motion-strength: 1/5 — slow glide
cfg: 3.0
steps_hint: 40 final (slow motion benefits from extra steps)

WAN 2.2
prompt: Cinematic slow motion in a pixel-art world: one plain unmarked gold coin floats left to right across the frame in a shallow arc above a small isometric desk diorama, rotating once over the full clip, throwing two brief bright glints as its face catches a warm desk lamp at frame right. Below it a stacked golden cash bar sits waiting, slot open, a tiny green bezel lamp steady. Everything else in the frame is motionless, including suspended dust motes. Static macro side camera, no cuts, no zoom. Warm single-source key with deep soft shadow falloff, muted grey-beige pixel materials against saturated gold, retro game art rendered with film-library patience. The coin never lands — the shot holds on the almost. Anticipation, one pixel-perfect breath.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, dollar signs, embossed coin portraits, fast motion, motion blur streaks, human figures, hands, background clutter, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static macro side
motion-strength: 1/5 — glacial
cfg: 4.0
steps_hint: 20-40
```

### V4 — Overhead drop, square (loopable)
Top-down view: coin falls straight into frame center, bar segment pulses, black reset, again.
```text
META
camera: dead-on top-down
loopable: yes
seed-suggestion: 11054
text_zones: none

LTX-VIDEO
prompt: Seen straight down at a square isometric pixel desk, a gold coin falls into frame from above and drops perfectly into the circular slot of a golden bar segment, which pulses brighter on impact then eases back. After a short pause the coin is gone, the slot closed, and a new coin falls into the same position to repeat the identical beat. Dead-on top-down static camera, warm lamp pool centered on the slot, grey-beige desk edges falling into vignette shadow, clean loop rhythm, retro pixel minimalism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, coin markings, perspective drift, camera rotation, flickering, morphing shapes, photorealistic
duration_s: 4.8
fps: 25
resolution: 512x512
aspect: 1:1
camera: dead-on top-down
motion-strength: 2/5 — one beat per pass
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Perfectly vertical top-down view of a small square isometric pixel desk, static camera, square composition, no rotation or drift. A single plain gold coin drops from out of frame straight into a circular slot at the center of a golden bar segment; on impact the segment pulses brighter for one beat, settles, the coin sinks out of sight and the slot closes. In the final second an identical coin begins its fall into the same position so the clip can loop seamlessly. Warm overhead lamp pool with soft vignette on grey-beige desk corners, one saturated gold note in a muted pixel world, retro 32-bit style, no humans, no markings on the coin, no readable characters anywhere. Money arriving like a heartbeat — exactly on schedule, twice.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, dollar signs, coin engravings, tilted angle, perspective shift, camera rotation, multiple coins at once, cuts
duration_s: 5.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: dead-on top-down
motion-strength: 2/5 — heartbeat drop
cfg: 4.0
steps_hint: 20-40
```
**PICK CRITERIA:** coins must be PLAIN discs — any take with embossed faces, $ signs, or numbers is instantly rejected (no-text law with teeth); V2/V4 are the loop pair, V4 also covers the social-square cut.
