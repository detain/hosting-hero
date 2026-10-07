# INCIDENT CINEMA — the drama beats

<!-- spec: hosting_game.md §4.1 metastable retry storms; §7 degradation ladder; §9.9 restore ritual; kill-switch 'ghost hands stop mid-walk' beat; §8.5 fire = the only truly dramatic visual; §8.17 key art (one of IC-3's realism arms) -->

The emotional register of the game: storms that eat themselves, features dimming rung by
rung, the 3am restore, and the single strangest image in the spec — every translucent
operator freezing mid-stride when the kill switch drops. Still no panic aesthetics:
incidents here are *systems behaving predictably badly*, and the comedy of recognition
survives only if the visuals stay honest. One block in this family carries a
[CINEMATIC-REALISM] marketing arm (IC-3 V4) — it is the sole tagged exception here.

## SHOT IC-1 — The storm that eats itself

Retry storm made visible: bounced beads re-enter the queue behind fresh ones, the loop
tightens into a self-feeding spiral, until a shed-valve opens off the top and pressure
bleeds out.

### V1 — Spiral tightening
```text
META
camera: static high-angle wide
loopable: no
seed-suggestion: 15011
text_zones: none

LTX-VIDEO
prompt: Cyan beads flow along a pixel-art lane toward an overloaded amber node that spits grey beads back out the front, and those grey beads land in the queue behind the incoming ones, doubling back into the same node again and again as the mixed loop of cyan and grey beads tightens into a visibly self-eating spiral around the pulsing amber node. The camera holds a static high-angle wide on the knot tightening. Desaturated navy lane work with saturated cyan, grey and amber, hard pixel silhouettes, creeping doom-by-bookkeeping mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static high-angle
motion-strength: 4/5 — accelerating circulation
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: High-angle static wide of a pixel-art traffic scene: one incoming lane of cyan beads feeding a single amber-glowing node, and one return arc carrying grey beads from the node's front back into the head of the incoming queue. The beads complete the loop repeatedly, the spiral of mixed cyan and gray tightening around the node while its amber deepens toward red at the edges. No cuts, no zoom, camera perfectly still. Desaturated navy-grey field, saturated cyan-to-grey bead transition and amber core, metastable dread expressed purely as circulation, crisp pixel silhouettes, no people, no explosions, bead count stays constant — the trap is closed from the start.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, new beads spawning, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static high-angle
motion-strength: 4/5 — accelerating circulation
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Macro in the knot
```text
META
camera: slow orbit around the spiral
loopable: no
seed-suggestion: 15012
text_zones: none

LTX-VIDEO
prompt: The camera orbits slowly around a tight pixel-art spiral of beads where grey retries cut in front of fresh cyan arrivals at an amber node, individual beads visibly colliding into a short elbow-locked scrum, splitting, rejoining and looping back through the same junction as the orbit keeps the knot centered. Desaturated navy with saturated cyan grey and amber points, flat 2:1 isometric game diorama, hard pixel silhouettes, claustrophobic machinery-waltz mood, matte surfaces, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow orbit
motion-strength: 4/5 — busy knot
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Close macro view of exactly one overloaded pixel-art node with a tight knot of beads circling it: cyan beads arriving, grey retry beads cutting back in ahead of them, brief elbow-to-elbow scrums at the junction that separate and re-form. Camera performs one slow orbit around the knot, keeping it frame-center, no cuts. Deep navy background, saturated cyan, grey and amber as the only strong colors, obsessive repetitive energy, crisp pixel silhouettes, no people, the scrums stay geometric — beads bump, they never melt into each other.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, beads merging, camera cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow orbit
motion-strength: 4/5 — busy knot
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Shed valve opens (the release)
```text
META
camera: static wide
loopable: no
seed-suggestion: 15013
text_zones: none

LTX-VIDEO
prompt: A wide pixel-art traffic scene with a tight self-eating bead spiral around an amber node when a side valve gate opens high above it, and the grey retry beads peel off upward into the valve one by one until the whole knot loosens, the spiral unwinding into a clean single-file cyan river while the node's color fades back to green and the valve's lamp holds steady amber. The camera holds static as pressure visibly drains. Desaturated navy with saturated cyan grey amber green accents, hard pixel silhouettes, exhale-after-holding-breath mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 4/5 — knot to flow
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static wide of a pixel-art retry-storm knot around an amber node: grey beads looping back into their own queue. Halfway through the clip exactly one overhead shed-valve gate opens, grey beads divert upward into it in a steady stream, the knot unwinds into an even single-file cyan flow, and the node lamp fades amber back to green while the valve keeps an amber hold light. No cuts, no camera move. Navy field with cyan grey amber green discipline, deliberate un-dramatic relief, crisp pixel silhouettes, no people, nothing bursts — the release reads as plumbing, not fireworks.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, sparks, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 4/5 — knot to flow
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Shadow only (ominous teaser cut)
```text
META
camera: slow push-in through darkness
loopable: no
seed-suggestion: 15014
text_zones: upper third reserved for typeset title (post)

LTX-VIDEO
prompt: The camera drifts slowly forward through near-darkness toward a distant faint knot of tiny cyan and grey lights circling each other, the only visible thing in a black room, their loop tightening as the push-in brings the amber core of the node into the glow, until the frame resolves out of pure black into one small self-eating storm. Almost everything is shadow and one spiral of light. Deep black field, sparse saturated pinpoints, flat game-art rendering emerging from darkness, ominous patience, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, jump scare
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — slow reveal
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A nearly black frame containing only one distant tiny spiral of cyan and grey pinpoints circling a faint amber core. Camera executes a single slow push-in through the darkness as the spiral grows to fill one third of frame and its self-eating rotation becomes legible, no cuts, no other light sources. High-contrast minimalist composition, deep blacks with three saturated accents, held-breath teaser energy, crisp point lights with no bloom mush, nothing else exists in the room, the spiral's rotation is the only motion.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, lens flare, camera cuts
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — slow reveal
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 must show the loop closing on itself — if beads never re-enter, it's just traffic, reject; V3 is the family hero (knot-to-release in one cut); V4 exists for the store-page teaser reel.

## SHOT IC-2 — Walking the degradation ladder

Graceful degradation as architecture: a lit staircase of feature lamps where rungs dim
from the top down, service light walking lower as each tier surrenders, ending on one
surviving green step at the bottom.

### V1 — Top-down dim
```text
META
camera: static side-profile wide
loopable: no
seed-suggestion: 15021
text_zones: none

LTX-VIDEO
prompt: A side-profile pixel-art staircase of five horizontal light bars stacked like ladder rungs, all glowing green, begins dimming from the top rung downward one after another in even patient beats, each surrendered rung fading to grey while the service glow below it brightens slightly to compensate, until exactly one green rung remains lit at the bottom of the ladder in a dark room. The camera holds a static side profile. Desaturated steel structure with saturated green-to-grey transitions, hard pixel edges, dim room lit by its own equipment, dignified retreat mood, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, red alarm, explosion, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static side profile
motion-strength: 2/5 — measured dimming
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Exactly one pixel-art ladder structure shown in profile: five horizontal rungs glowing steady green inside a dim steel room. Rung by rung from top to bottom, four rungs fade to inert grey at an even deliberate pace, each dimming paired with a small brightening of the ambient glow pooling on the remaining lit rungs below; the bottom rung stays green to the end. Camera static, no cuts, no zoom. Desaturated steel with disciplined green-to-grey state language, staged orderly retreat, crisp pixel silhouettes, no alarms, no red anywhere, rung count never changes and nothing physically breaks.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, red lights, structural collapse
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static side profile
motion-strength: 2/5 — measured dimming
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Camera descends with the light
```text
META
camera: slow crane-down following the last lit rung
loopable: no
seed-suggestion: 15022
text_zones: none

LTX-VIDEO
prompt: The camera tilts slowly downward along a tall pixel-art service tower as its feature lights surrender tier by tier, always keeping the lowest still-green band centered while everything above it fades to grey in sequence, the descent ending at the base of the tower where one solitary green stripe hums at ankle height in the dark. Continuous downward motion matching the falling light line. Desaturated concrete and steel, saturated green marching downward, hard pixel silhouettes, funicular calm during retreat, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, rapid tilt
duration_s: 7.7
fps: 25
resolution: 704x1216
aspect: 9:16
camera: slow crane-down
motion-strength: 2/5 — steady descent
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A tall narrow pixel-art service tower in a dark room, its height banded into five glowing green tiers. The camera performs one slow continuous crane-down as the tiers switch off from top to bottom in even beats, the frame always tracking the boundary between grey surrender above and living green below, finishing low on the single surviving base stripe. Portrait framing, no cuts. Desaturated steel and concrete with one traveling green light line, vertigo-free calm descent, crisp pixel edges, no people, dimming stays strictly top-down with no skipped tiers.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera shake, random flicker
duration_s: 8.0
fps: 24
resolution: 704x1216
aspect: 9:16
camera: slow crane-down
motion-strength: 2/5 — steady descent
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Ladder seen from the floor (scale shot)
```text
META
camera: static low-angle
loopable: no
seed-suggestion: 15023
text_zones: none

LTX-VIDEO
prompt: A dramatic low-angle view from a dark pixel-art floor looks up at a colossal stacked ladder of service lights high overhead as its upper rungs wink out one by one against the ceiling darkness, each death dropping the room's overall light a shade further into blue shadow until only the lowest rung paints a thin green strip across the concrete floor. The camera never moves and the scale stays immense. Desaturated blue-black volume with sparse saturated green points dying sequentially, hard silhouettes, cathedral-of-infrastructure mood, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static low-angle
motion-strength: 2/5 — sequential dimming
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Extreme low-angle static shot from the floor of a vast dark pixel-art machine hall: overhead, a towering ladder of green service bands climbs into ceiling shadow. Band by band from the top, they extinguish, each loss stepping the ambient light down toward blue-black until only the lowest band burns, laying a single green stripe across the concrete toward camera. One held wide, no cuts. Cinematic scale with flat crisp rendering, desaturated blues and one disciplined green, solemn infrastructure ritual, no people, no sparks, the dimming cadence stays metronomic.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic humans, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static low-angle
motion-strength: 2/5 — sequential dimming
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Held for the loop (post-demotion idle)
```text
META
camera: locked-off
loopable: yes
seed-suggestion: 15024
text_zones: none

LTX-VIDEO
prompt: The aftermath of a degradation ladder holds in a locked frame: four grey dead rungs of a pixel-art service ladder and one green rung at the bottom breathing very slowly, faint amber specks of still-queued beads crawling patiently along a low dark lane toward the survivor, dust settling through cold air. Nothing changes state; the gentle breathing glow and the patient trickle continue evenly forever. Desaturated dark structure with one saturated green and sparse amber pinpoints, hard pixel silhouettes, truce atmosphere, continuous loop without beginning or end, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, lights changing, camera movement
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off
motion-strength: 1/5 — breathing glow only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off square composition of a settled pixel-art degradation state: one service ladder with four inert grey rungs and exactly one green bottom rung glowing on a slow even breath, while a thin patient trickle of tiny amber dots creeps along a low lane toward it and never runs out. Camera never moves, state never changes, seamless loop. Dark desaturated structure, one green pulse and one amber thread, ceasefire stillness, crisp pixel edges, no people, no flicker beyond the single slow breathing cycle.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, state changes, camera shake
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off
motion-strength: 1/5 — breathing glow only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V3 is the poster arm — judge on whether the scale reads without any characters in frame; V1/V2 must keep a strict top-down cadence (any skipped or random rung fails the metaphor); V4 for idle panels.

## SHOT IC-3 — The 4am restore that works

The most human beat: a segmented progress bar filling in a dark room, one operator
silhouette seen from behind, small, hands still, and the room's color temperature sliding
from anxious amber to trustworthy green. Faces never show.

### V1 — Bar climbs, room warms toward green
```text
META
camera: static over-the-shoulder from behind
loopable: no
seed-suggestion: 15031
text_zones: none (progress bar is segments, no percent digits)

LTX-VIDEO
prompt: Seen from behind the shoulders of one still dark silhouette, a pixel-art terminal wall fills with a long segmented progress bar that climbs steadily from empty toward full, segment after segment lighting soft green while the dim amber wash of the room cools and shifts gradually toward green in sympathy, tiny standby LEDs along the racks under the screen rekindling one row at a time as the bar advances. The camera holds a static over-the-shoulder frame on the patient fill. Ink-blue chrome structure, amber yielding to green, matte bezels with one gloss on the screen glass, quiet earned relief, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, visible face, percent digits, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static over-the-shoulder
motion-strength: 2/5 — steady fill
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Over-the-shoulder static shot from directly behind exactly one seated human silhouette, head and shoulders only as a dark shape, facing a large pixel-art terminal wall showing one long segmented progress bar. The bar fills steadily green from left to right at an even pace, and as it does the room's ambient amber light cools toward green and three rows of rack LEDs beneath the screen rekindle sequentially. No cuts, no camera move, the figure stays perfectly still throughout. Ink-blue and dark steel palette migrating amber-to-green, 4am devotion mood, absolutely no visible face or hands on screen, only the bar, lamps and light shift move.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic human face, face turning to camera, screen readable text, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static over-the-shoulder
motion-strength: 2/5 — steady fill
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Wide: the small figure and the big bar
```text
META
camera: slow pull-back to extreme wide
loopable: no
seed-suggestion: 15032
text_zones: none

LTX-VIDEO
prompt: A single dark human silhouette sits before one glowing wall-screen in a vast pixel-art facility as the camera pulls slowly back to reveal the whole night room around them, hundreds of tiny rack lamps dark except a spreading field of green rekindling row by row outward from the screen like dawn coming up through the floor, the small figure staying centered and motionless inside the widening restoration. Deep blacks opening into structured dark grey, saturated green spreading against amber remnant, hard silhouettes, scale-of-vigil payoff mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, visible face, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow pull-back
motion-strength: 3/5 — spreading restoration
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: One tiny motionless human silhouette seated before a glowing terminal wall in a huge dark pixel-art facility. Camera performs a single slow pull-back from medium shot to extreme wide as, beat by beat, hundreds of small rack lights across the room relight in green spreading outward from the screen, until the person is a speck inside a fully recovering grid. No cuts. Near-black desaturated volume stitched with a growing green constellation, lone-vigil heroism without sentimentality, crisp pixel silhouettes, the figure never turns or gestures, restoration stays a clean radial wave with no flicker.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic face, figure standing up, camera cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow pull-back
motion-strength: 3/5 — spreading restoration
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — The last segment (hold-your-breath macro)
```text
META
camera: macro static on the bar's leading edge
loopable: no
seed-suggestion: 15033
text_zones: none

LTX-VIDEO
prompt: Macro on the leading edge of a pixel-art segmented progress bar as the final few segments fill one after another with soft green blinks, the glass surface carrying a faint slow reflection sliding across the bezel, and after the last segment lights, the whole bar holds, its edge shimmer settling to perfect stillness in the quiet dark. The camera stays macro-locked on the finish line of the fill. Ink-blue bezel and dark glass, saturated green segment points, matte with one gloss accent, suspense dissolving into calm, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, confetti, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 1/5 — micro-blinks only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Extreme close-up of the right end of an almost-full pixel-art progress bar: empty dark segments waiting, lit green segments behind them, and a glass bezel with one slow sliding reflection. Exactly the last four segments blink green in even succession, then everything holds absolutely still on the completed bar. Static macro, no cuts. Ink-blue chrome with saturated green fills, held-breath-then-exhale in miniature, crisp pixel geometry, no numbers or percentages anywhere, one clean blink per segment with no stutter.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, celebration effects, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 1/5 — micro-blinks only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — [CINEMATIC-REALISM] 3am aisle (marketing arm)
```text
META
camera: low warm static shot down the cold aisle
loopable: no
seed-suggestion: 15034
text_zones: lower third reserved for typeset title (post)

LTX-VIDEO
prompt: A low camera sits near the floor of a dark real data-center cold aisle at 3am as warm amber light spills from exactly one illuminated rack among hundreds of faint green status lines, cable plumes hanging overhead catching faint glow, a very small distant figure in silhouette walking slowly away from camera with a flashlight beam drifting across perforated floor tiles, volumetric haze breathing gently around the light. Photorealistic cinematic footage, anamorphic look, deep shadows, practical lighting only, muted teal-grey palette anchored by one warm amber pool, patient wonder, no on-screen text.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, faces, close-up of person, neon fantasy colors, lens flare strobing
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: low static
motion-strength: 2/5 — one slow walk, haze drift
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Photorealistic cinematic data-center night: low angle near the floor of a long cold aisle, hundreds of dark rack fronts each carrying thin rows of small green status lights, and exactly one rack thirty meters out glowing warm amber through its mesh doors. A single tiny human silhouette seen from behind walks slowly away from camera, one flashlight beam sweeping gently across the perforated floor, soft volumetric haze, static camera, no cuts. Practical lighting only, deep blacks with teal-grey metal and one amber pool, patient competence-at-3am mood, the figure stays small and faceless, nothing flickers, no readable labels on equipment.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, visible face, close-up of person, flashy lens flares, camera movement
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: low static
motion-strength: 2/5 — one slow walk, haze drift
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the family hero and the trailer's emotional button — the amber-to-green must be a glide, never a switch; V4 is the labeled realism exception for marketing (matches the §8.17 key art) — judge it on facelessness: if the walker turns or grows a face, kill the take.

## SHOT IC-4 — Ghost hands stop (the kill switch)

The spec's strangest, best beat: translucent white operator figures going about their work
across the diorama when the kill switch drops — and every one of them freezes mid-stride,
mid-reach, becoming a museum of interrupted labor. Held stillness is the whole gag; it
must land in silence.

### V1 — Freeze mid-stride
```text
META
camera: static wide
loopable: no
seed-suggestion: 15041
text_zones: none

LTX-VIDEO
prompt: Across a dim pixel-art facility floor, five translucent white ghost-like operator figures move quietly about their tasks, one walking, two reaching into racks, one carrying a cartridge, one crouched at a cable, when a red-topped switch on the wall drops and every figure stops exactly mid-motion at the same instant, frozen with a foot still off the ground and a hand half closed, holding perfectly still in the sudden quiet while the room's activity lamps step from green to amber. The camera holds a static wide on the tableau. Desaturated grey diorama with luminous pale-white figures, one saturated red switch accent, eerie polite stillness, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, ghosts fading, falling over, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 3/5 — motion to total stillness
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static wide of a dim pixel-art facility floor with exactly five translucent white humanoid operator silhouettes, featureless and glowing faintly, each caught mid-task: one mid-stride with a raised foot, two with hands inside rack doors, one carrying a grey cartridge box, one crouched at a floor cable. At the clip's midpoint one wall switch with a red cap flips down and all five figures stop moving simultaneously and permanently, holding their exact poses while the room lamps step green to amber. No cuts, no camera move. Grey desaturated architecture with pale luminous figures and one red accent, silent museum-of-labor payoff, absolutely no faces, after the freeze nothing in frame moves at all, not even sway.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic humans, faces, figures collapsing, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 3/5 — motion to total stillness
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Whip-pan between frozen poses
```text
META
camera: three quick stops pan, then still
loopable: no
seed-suggestion: 15042
text_zones: none

LTX-VIDEO
prompt: After a kill-switch moment has already frozen the room, the camera performs three short snappy pans across a pixel-art facility floor, each stopping square on one translucent white operator figure locked mid-gesture, a foot raised, hands open above an open rack, a cartridge tilted in air, tiny activity sparks suspended motionless around them, and on the third stop the camera stays dead still as the silence stretches. Desaturated grey diorama with luminous pale figures and suspended amber sparks, hard silhouettes, held-breath gallery-tour mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, figures moving, camera shake
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: stop-motion pan
motion-strength: 3/5 — snappy pans into stillness
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A frozen pixel-art facility scene populated by translucent white humanoid figures locked mid-task. The camera performs exactly three quick horizontal pans between three figures, each pan ending on a dead stop framing one statue-like pose: raised foot, hands over an open rack, cartridge tilted in the air with motionless amber sparks around it; after the third stop the camera holds completely still for the remainder. No cuts within the pans, smooth whip with firm landings. Desaturated greys with pale glowing figures, still-life-with-suspension mood, crisp pixel silhouettes, no faces, nothing resumes moving at any point, suspended particles stay perfectly fixed.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, figures resuming motion, camera drift
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: stop-motion pan
motion-strength: 3/5 — snappy pans into stillness
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — The switch itself (button insert)
```text
META
camera: macro static on the switch, one hand shadow only
loopable: no
seed-suggestion: 15043
text_zones: none

LTX-VIDEO
prompt: A macro static shot of one chunky pixel-art kill switch with a red translucent cap on a grey panel as a dark shadow of a hand crosses over it from the left without ever resolving into fingers, the cap depresses in one heavy deliberate travel with a deep amber ring of light pulsing once around its base, and small vibration lines pop outward from the panel before everything settles absolutely still. Matte grey panel, saturated red cap and amber ring, hard pixel edges, decision-made weight, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, visible fingers, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 3/5 — one heavy press
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static macro of exactly one industrial pixel-art kill switch, red translucent cap on a matte grey panel. A soft hand-shaped shadow slides across the frame from the left, never becoming a visible hand, the cap travels down once with weight, a single amber light ring pulses at its base and two short vibration ticks spring from the panel edges, then total stillness. No cuts. Grey panel with one saturated red and one amber event, irreversible-decision gravity, crisp pixel surfaces, no anatomy ever on screen, after the press nothing moves for the remaining seconds.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic hand, fingers detail, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: macro static
motion-strength: 3/5 — one heavy press
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Next morning, one ghost resumes
```text
META
camera: slow push-in on the frozen tableau
loopable: no
seed-suggestion: 15044
text_zones: none

LTX-VIDEO
prompt: Cold morning light creeps across a pixel-art facility floor where five translucent white figures remain frozen mid-task as the camera pushes slowly in, when exactly one of them, the crouched cable worker, twitches, completes its original motion and stands up to resume work while the other four remain perfectly statue-still in the widening light shaft, one raised foot still hanging in the air. Desaturated greys with pale luminous figures and a warm grey-gold morning wash from a single high window, hard silhouettes, surreal return-to-service mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, all figures moving, faces, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — one small resumption
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Wide static composition that begins a very slow push-in: a pixel-art floor lit by a fresh morning shaft from one high window, five translucent white humanoid figures frozen mid-task, unchanged since the kill switch. Midway, exactly one crouched figure completes its gesture, unfolds and stands to work again; the other four stay statues forever, including one with a foot still raised. One continuous slow move, no cuts. Pale glowing figures against desaturated morning grey, deadpan surrealism with tenderness, no faces, only the single resumed figure moves, window light stays fixed and gentle.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic humans, all statues moving, camera cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — one small resumption
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the shot the spec describes — acceptance requires simultaneous freeze (any staggered stopping turns it into a game-over screen) and a held still tail of at least 2 seconds; V3 pairs with V1 as cut-in/cut-out; V4 is the closer for the store trailer.

## SHOT IC-5 — Suppression (the only drama allowed)

Fire is the one event the visual language permits to be theatrical: clean-agent flooding as
a silent white tide, fans winding down, every LED holding its color under the whiteness —
spectacle without damage, an exhalation rendered visible.

### V1 — White tide, slow darkening
```text
META
camera: static wide from the aisle mouth
loopable: no
seed-suggestion: 15051
text_zones: none

LTX-VIDEO
prompt: Fine white mist pours down in even curtains from ceiling nozzles across a pixel-art server aisle, filling the frame from the far end toward the camera like a slow white tide while every fan's spinning indicator light winds down mid-glow and the rack LEDs keep burning their exact colors dimly through the whiteness, until the whole aisle is soft blank light with only faint colored pinpoints glowing through the haze. The camera holds static at the aisle mouth. Desaturated greys whitening under clean agent, preserved saturated LED points behind the veil, hard silhouettes going gentle, hushed spectacle, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, flames, smoke black, water, explosion
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 3/5 — descending tide
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static wide shot from the mouth of a pixel-art server aisle. Clean white suppression gas descends in even curtains from a row of ceiling nozzles, rolling toward camera at slow constant speed; as it passes, fan indicator lights wind down to halt one by one, but every rack LED keeps its exact color, glowing softly through the mist. The aisle ends nearly white with visible colored pinpoints. No cuts, no zoom. Monochrome whitening over desaturated steel, disciplined color-preservation, ceremonial quiet drama, no fire, no black smoke, gas flows like slow fog and never flashes or sparkles.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic humans, flames, black smoke, water spray, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 3/5 — descending tide
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Nozzle ring fires (top frame insert)
```text
META
camera: static upward macro on nozzle ring
loopable: no
seed-suggestion: 15052
text_zones: none

LTX-VIDEO
prompt: Close upward view of a ring of chunky pixel-art ceiling nozzles against dark ceiling plates as they fire in sequence from left to right, each jet opening into a perfect soft white cone that holds, the cones catching faint amber light from below, tiny pressure gauges on the manifold edge all sliding smoothly down together, the row of cones becoming a steady luminous curtain. Camera locked pointing up. Dark plate grey with brilliant white cones and one amber underglow, hard pixel edges softening only inside the gas, mechanical ballet precision, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, fire, sparks, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: locked upward macro
motion-strength: 4/5 — sequential jets
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Low-angle static macro of exactly five pixel-art suppression nozzles in a row on a dark ceiling manifold. They open left to right one per beat, each jet blooming into a steady downward white cone; a small row of round gauges at frame edge drops together as pressure moves; the cones hold evenly lit by faint amber glow rising from below. No cuts, no camera move. High-contrast dark grey architecture with clean white geometry, precise machine choreography, no turbulence or swirling, cones stay as crisp pixel shapes, no fire or smoke, only the sequential opening and the falling gauges move.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, flames, chaotic spray, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: locked upward macro
motion-strength: 4/5 — sequential jets
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Emerging from the white (all clear)
```text
META
camera: static wide, same axis as V1
loopable: no
seed-suggestion: 15053
text_zones: none

LTX-VIDEO
prompt: A pixel-art server aisle drowned in soft white haze slowly thins and clears from the far end toward the camera, revealing a silent tableau of dark racks whose LED rows re-ignite steadily green one tier after another as the mist drains away, fan indicators spinning back up in gentle staggered rhythm, until the aisle stands fully lit, washed clean and quietly triumphant. The camera holds static on the reveal axis. Whitening to deep desaturated grey-green order, saturated LED points rebuilding across the frame, post-storm relief without celebration, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, damage, flames, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 3/5 — clearing rhythm
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Same static wide axis as a suppression flood: a pixel-art server aisle filled with thinning white gas that clears progressively from the far end toward camera. Behind the retreating haze, rack LED rows reignite tier by tier in steady green and fan indicators resume their slow spin in staggered sequence, ending on a clean fully-lit aisle. No cuts. Mist-to-clarity transition as the only motion layer besides the relights, desaturated steel restored to orderly green rhythm, understated triumph, no visible damage anywhere, no people, the clearing front advances at one constant speed with no swirl.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, burnt wreckage, smoke alarms spinning, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 3/5 — clearing rhythm
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Single nozzle drip (quiet coda)
```text
META
camera: locked-off close on one nozzle
loopable: yes
seed-suggestion: 15054
text_zones: none

LTX-VIDEO
prompt: Long after the suppression event, one pixel-art ceiling nozzle hangs in a locked close frame releasing an occasional slow wisp of residual white vapor that curls faintly once and dissolves, its small seal lamp pulsing green on a long even breath while the dark ceiling plates around it stay utterly still, the rhythm sparse, patient and repeating without end. Locked-off composition, dark grey field with one pale wisp and one green pulse, aftermath hush, matte hardware with one gloss accent, flat game-art rendering, continuous loop, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, heavy smoke, camera movement
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off close
motion-strength: 1/5 — occasional wisp
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off square close-up of exactly one pixel-art ceiling nozzle on dark plates after the event. Every few seconds a thin wisp of white vapor releases, curls once and dissolves; a tiny green seal lamp beside it breathes on a slow fixed cycle. Camera never moves; the sparse rhythm loops seamlessly. Deep desaturated grey field, one pale transient, one green pulse, meditative aftermath, crisp pixel edges, dense vapor forbidden — the wisps stay delicate, no people, no sound cues of shaking or dripping physics beyond the single curl.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, thick smoke, camera shake
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off close
motion-strength: 1/5 — occasional wisp
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 and V3 are a designed splice pair (same axis, flood-in / clear-out) — generate both, cut on the white hold; V2 is the rhythmic insert for trailers; V4 for idle panels. Reject any take where the gas darkens toward smoke — clean agent stays white.
