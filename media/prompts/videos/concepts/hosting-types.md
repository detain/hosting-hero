# HOSTING TYPES — the variety engine on show

<!-- spec: hosting_game.md §8.10 per-line identities; 'one engine, twenty games' (ln 486); §7 Window mechanic (Gantt); §8.1 registers -->

Same racks, same lanes, same engine — different skins. This family proves the pitch
"one engine, twenty games" by visiting four hosting lines rendered as the same
isometric diorama grammar wearing different clothes. Camera is allowed to slow-orbit
the diorama here (one move per clip) since the point is rotation between booths.

## SHOT HT-1 — Shared-web hive

A dense beige-and-blue apartment-block of racks: hundreds of identical tiny units packed
wall to wall, each with one small warm window-light, a churning crowd of tiny cyan visitor
dots on the lanes, cheerful clutter, diurnal brightness.

### V1 — Lights on in every window
```text
META
camera: slow left-to-right track
loopable: no
seed-suggestion: 13011
text_zones: none

LTX-VIDEO
prompt: Hundreds of tiny warm lights blink on one by one across a wall of isometric pixel-art server racks packed like an apartment block, while a churning crowd of small cyan dots flows along lanes in front of them. The camera tracks slowly from left to right past the dense beige-and-blue facade, rows of identical micro-units each glowing one amber window, cheerful and cluttered like laundry lines between buildings. Desaturated concrete grey and steel materials, hard pixel silhouettes, tiny saturated LEDs, matte surfaces, flat 2:1 isometric game diorama, dim room lit only by its own equipment.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, depth of field blur, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow left-to-right track
motion-strength: 3/5 — steady crowd churn
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: An isometric pixel-art game diorama of a shared-hosting facility: exactly one dense wall of identical beige-and-blue server units stacked like apartment floors, each unit showing one small warm amber window light, and exactly one continuous river of tiny cyan dots streaming along dark lanes at its base. Camera performs a slow left-to-right tracking shot, no cuts, no zoom. The units light up sequentially left to right as the camera passes. Dim room lit only by the equipment itself, desaturated concrete grey and steel palette with tiny saturated cyan and amber points, hard pixel silhouettes, flat matte surfaces, cheerful mundane mood, nothing else moves except the dots and the lighting sequence.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera cuts, morphing shapes
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow left-to-right track
motion-strength: 3/5 — steady crowd churn
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Orbit the apartment block
```text
META
camera: slow clockwise orbit around the rack wall
loopable: yes
seed-suggestion: 13012
text_zones: none

LTX-VIDEO
prompt: A dense isometric pixel-art rack wall, hundreds of identical small beige-and-blue units each with one lit amber window, rotates slowly on a clockwise orbit while an unbroken stream of tiny cyan visitor dots circles its base. The diorama turns like a model on a lazy susan, revealing more identical floors of micro tenancies, a tiny courtyard of crates in front. Flat 2:1 isometric game style, desaturated materials, hard silhouettes, tiny saturated LED points, matte with one gloss accent, dim room lit by its own equipment, continuous even motion with no beginning or end.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, sudden motion
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow clockwise orbit
motion-strength: 2/5 — continuous drift
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Isometric pixel-art game diorama of a shared-hosting tower: one dense apartment-block wall of identical beige-and-blue server units, hundreds of small amber window lights, exactly one ring of tiny cyan dots orbiting its base. Camera executes a single slow clockwise orbit around the diorama, no cuts, no zoom, even speed, suitable for a seamless loop. Dim room lit only by its own equipment, desaturated concrete grey palette punctuated by saturated cyan dots and amber points, flat vector-clean pixel edges, hard silhouettes, calm cheerful mundane mood, nothing else moves.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera cuts, sudden zoom
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow clockwise orbit
motion-strength: 2/5 — continuous drift
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Diurnal tide (morning build-up)
```text
META
camera: static tripod
loopable: no
seed-suggestion: 13013
text_zones: none

LTX-VIDEO
prompt: The stream of tiny cyan dots in front of a pixel-art rack wall gradually thickens from a trickle to a dense river while more and more amber window lights switch on across the building. The camera holds completely still as the diurnal morning crowd builds, lanes filling until the queue bends around a crate corner. Flat 2:1 isometric game diorama, beige-and-blue units on desaturated concrete grey, hard silhouettes, tiny saturated LEDs, matte surfaces, soft cool-to-warm light shift across the frame, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — building flow
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Exactly one static wide shot of an isometric pixel-art shared-hosting diorama: a wall of identical beige-and-blue server units with amber window lights, and cyan dot visitors arriving on lanes at its base. Over the clip the dot traffic grows steadily from sparse to a dense continuous river and roughly half of the dark windows light up one by one; the camera never moves, no cuts. Lighting shifts subtly from cool dawn to warm morning. Dim room lit by its own equipment, desaturated grey concrete with saturated cyan and amber points, flat pixel silhouettes, mundane busy rhythm, nothing shakes or morphs.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera movement, morphing shapes
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — building flow
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — One window goes dark (micro-drama)
```text
META
camera: slow push-in toward one rack column
loopable: no
seed-suggestion: 13014
text_zones: none

LTX-VIDEO
prompt: The camera glides slowly toward one column of a dense pixel-art rack wall as exactly one amber window light gutters and goes dark, while every other tiny light keeps burning and the cyan dot river keeps flowing. A single small grey dot pauses where the dark window faces the lane, then drifts away. Flat 2:1 isometric game diorama, beige-and-blue units on desaturated concrete, hard silhouettes, tiny saturated LEDs, matte surfaces, dim room lit by its own equipment, quiet mundane melancholy, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, explosion, sparks
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — gentle glide
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: An isometric pixel-art game wall of identical beige-and-blue hosting units, each with a small amber window light, cyan dots streaming below. Exactly one window in the center column flickers once and goes dark; the camera performs a single slow push-in toward that column, no cuts. All other windows stay lit and the dot traffic continues uninterrupted. Dim room lit only by equipment, desaturated grey palette with saturated cyan and amber points, flat crisp pixel silhouettes, quiet understated mood, the one extinguished light is the only state change, nothing else moves or morphs.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera cuts, sparks, explosion
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — gentle glide
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V2 is the aquarium/idle-screen arm (clean orbit loop); V1 wins promo cuts if the light-up sequence lands on beat with the track; V3 reads best muted as a B-roll wipe-in; reject the take if any window count collapses into texture mush.

## SHOT HT-2 — Game-server arena

Same rack geometry, dark-room neon skin: saturated accent strips, a tick-rate oscilloscope
wobbling on a bezel, teardrop-shaped player avatars with soft ping auras, and the evening
spike — the room's light show ramping as the dots arrive.

### V1 — Evening spike light show
```text
META
camera: static tripod
loopable: no
seed-suggestion: 13021
text_zones: none

LTX-VIDEO
prompt: A dark isometric pixel-art game-server room suddenly comes alive as rows of rack LEDs sweep from idle green to surging cyan in a wave, neon accent strips brightening along the aisles while teardrop-shaped player avatars in cyan and magenta flood the lanes from the right edge. The camera holds still through the ramp, the escalation reading like a stadium lighting up section by section. Near-black surfaces with saturated neon accents, hard pixel silhouettes, matte metal with glossy LED bloom points, evening rush energy, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, daylight
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 4/5 — lively ramp
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: An isometric pixel-art game-hosting arena at night: one dark room of steel racks lined with neon accent strips, exactly one lane bridge entering from the right edge. Teardrop-shaped avatar dots, mostly cyan with a few magenta, stream onto the bridge in a growing evening rush while rack LED rows ignite in a left-to-right wave from green to bright cyan; the camera is static, no cuts. Near-black surfaces with strongly saturated neon accents, glow only at the tiny LED points, crisp pixel silhouettes, hype-but-orderly arcade mood, no human faces, nothing outside the ramp and the stream moves.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic humans, camera movement
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 4/5 — lively ramp
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Orbit the arena floor
```text
META
camera: slow counter-clockwise orbit
loopable: yes
seed-suggestion: 13022
text_zones: none

LTX-VIDEO
prompt: A dark isometric pixel-art game-server diorama rotates slowly counter-clockwise on its podium as steady streams of cyan and magenta teardrop avatars circle the rack rows like spectators, neon strips keeping a constant glow and rack LEDs pulsing in gentle rhythm. The orbit is even and continuous with no start or end, like a team-fight arena model spinning between matches. Near-black materials with saturated neon accents, hard pixel silhouettes, tiny bloom points on LEDs, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, sudden motion
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow counter-clockwise orbit
motion-strength: 2/5 — continuous drift
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: One isometric pixel-art game-hosting diorama on a dark podium: steel racks with neon accent strips and steady rows of tiny pulsing cyan LEDs, exactly two streams of teardrop-shaped avatar dots, one cyan and one magenta, circling the aisles at constant speed. Camera performs a single slow counter-clockwise orbit, even tempo, no cuts, loopable. Near-black palette with saturated neon, glow only at small LED points, crisp pixel silhouettes, arcade-night atmosphere, no humans, no faces, everything moves at held constant speed and nothing morphs.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera cuts, speed changes
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow counter-clockwise orbit
motion-strength: 2/5 — continuous drift
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Oscilloscope bezel insert (CHROME)
```text
META
camera: slow push-in on the gauge panel
loopable: no
seed-suggestion: 13023
text_zones: none (ping values are auras, not digits — keep them glyph-free)

LTX-VIDEO
prompt: A chunky bezel-mounted oscilloscope screen fills the frame as its green trace steepens and starts to dance with small spikes, indicator lamps around the bezel stepping from green to amber under a soft glow. The camera pushes slowly toward the glass, CRT scan texture shimmering faintly, the needle of a twin gauge climbing beside it. Diegetic retro terminal instrument, monochrome green phosphor on ink-blue, flat crisp unlit hardware, no readable characters anywhere, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, readable labels, photorealistic humans
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — trace motion only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Extreme close-up of exactly one diegetic instrument panel from a pixel-art game: a bezel-framed CRT oscilloscope with a glowing green horizontal trace that steepens into a lively spiky waveform, two round indicator lamps stepping from green to amber, one rising bar gauge climbing slowly. Camera executes a single slow push-in toward the glass, no cuts. Ink-blue chrome structure with green phosphor glow, flat crisp unlit surfaces, retro terminal atmosphere, absolutely no letters or digits anywhere, only the trace and lamps move, nothing morphs.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, readable signage, photorealistic humans, camera cuts
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 2/5 — trace motion only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Rage-quit dot peel-off
```text
META
camera: static tripod
loopable: no
seed-suggestion: 13024
text_zones: none

LTX-VIDEO
prompt: A steady two-way flow of cyan teardrop avatars moves along a pixel-art lane when exactly one avatar flares magenta, peels off the stream and sprints back the way it came while the rest of the flow closes the gap seamlessly. The camera holds still on the dark neon-lined aisle, one red LED row blinking once in sympathy above the departing dot. Near-black surfaces with saturated neon accents, hard pixel silhouettes, tiny bloom points, comedic beat in an otherwise orderly scene, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, explosion
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — one fast actor in a slow scene
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Isometric pixel-art game-hosting aisle at night, a steady river of cyan teardrop avatar dots flowing left to right between neon-lined racks. Exactly one dot in the river briefly turns hot magenta, breaks away and hurries back right-to-left against the flow until it exits frame, and the river closes over the gap; the camera is static, no cuts. Near-black palette with saturated cyan and magenta, glow only at LEDs and dots, crisp pixel silhouettes, dry comic timing, no faces, no other dot changes direction, nothing morphs.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera movement, crowd panic
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 3/5 — one fast actor in a slow scene
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 sells the pitch ("the evening spike") — require the left-to-right LED wave to complete inside the clip; V2 is the idle-screen arm; V3 must read clean at phone size or it gets cut; V4 is the recognition-comedy beat — judge on whether the peel-off is obvious on the first silent watch.

## SHOT HT-3 — Tape cathedral night shift

Cold blue, slow, reverent: the Tape Ballet of a robotic library arm gliding between high
shelves of cartridges, a vault door at the end of the aisle, and one horizontal Gantt-like
maintenance-window bar glowing along the mezzanine rail as jobs complete inside it.

### V1 — The Tape Ballet
```text
META
camera: slow crane-up along the shelves
loopable: no
seed-suggestion: 13031
text_zones: none (barcode strips read as texture, never glyphs)

LTX-VIDEO
prompt: A robotic arm glides smoothly along a rail high in a cold blue pixel-art tape vault, plucks one cartridge from a shelf of hundreds, and slides it home into a reader slot with a soft deliberate motion as the camera rises slowly along the shelving. Tiny amber eye-lights dot the dark aisles below, a circular vault door sits closed at the end of the aisle. Flat 2:1 isometric game diorama, desaturated steel and cold blue, hard silhouettes, matte surfaces with one gloss accent on the cartridge shell, cathedral-quiet slow mechanics, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, fast motion, readable barcodes
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow crane-up
motion-strength: 2/5 — slow deliberate mechanics
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A pixel-art tape archive rendered like a cold blue cathedral: exactly one robotic library arm on an overhead rail moving between floor-to-ceiling shelves of grey cartridges with stripe textures, one circular steel vault door closed at the aisle end. The arm glides right, pauses, takes one cartridge down and places it into a low reader slot that lights green; camera performs a single slow crane-up along the shelves, no cuts. Dim room lit by its own cold blue equipment glow, desaturated steel palette with one green lamp accent, hushed reverent pace, crisp pixel silhouettes, no people, no readable labels, nothing else moves during the pick.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, fast motion, camera cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow crane-up
motion-strength: 2/5 — slow deliberate mechanics
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Window bar under the mezzanine
```text
META
camera: static tripod
loopable: no
seed-suggestion: 13032
text_zones: none (the Gantt bar is pure geometry — segments, no labels)

LTX-VIDEO
prompt: Along a mezzanine rail in a dark pixel-art vault, a long horizontal bar of rectangular segments fills one by one from left to right with soft green light, the last segment completing just as the robotic arm below finishes its cartridge placement. The camera holds perfectly still on the cross-section of the two-storey archive, cold blue gloom, tiny amber standby lights, shelves receding into darkness. Flat 2:1 isometric game diorama, desaturated steel, hard silhouettes, the glowing bar the only saturated element, patient nighttime calm, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, readable labels on the bar
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 2/5 — measured fill
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Cross-section of a two-storey pixel-art backup vault at night: cold blue shelves, one robotic arm cycling slowly below, and exactly one long segmented bar mounted along the upper mezzanine rail. The bar's rectangular segments illuminate left to right in steady green, one segment per second, finishing as the arm docks its cartridge; the camera is static, no cuts. Dim room lit by equipment only, desaturated steel and cold blue with the green bar as the single saturated focus, calm scheduled-overnight mood, crisp pixel geometry, no text or ticks readable on the bar, nothing moves except arm and fill.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera movement
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 2/5 — measured fill
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — One red segment (overrun dread)
```text
META
camera: static tripod with slight push at the end
loopable: no
seed-suggestion: 13033
text_zones: none

LTX-VIDEO
prompt: A segmented green bar fills along a dark mezzanine rail in a pixel-art vault until exactly one segment near its right end turns amber and then red, holding there and pulsing gently while the robotic arm below stops mid-transit with a cartridge gripped in the air. The camera sits still, then eases one tiny push toward the red segment at the very end. Cold blue gloom, desaturated steel, hard pixel silhouettes, the red pulse the only warm color, quiet dread arriving without any explosion, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, sparks, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static with micro push
motion-strength: 2/5 — held scene, one pulse
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Night scene in a pixel-art backup vault: a long segmented bar along a mezzanine rail lighting green segment by segment, one robotic library arm working below. As the fill approaches its right end, exactly one segment turns amber then steady red and begins a slow pulse; simultaneously the arm freezes mid-movement holding a cartridge. Camera holds static for most of the clip, then a single small push-in toward the red segment, no cuts. Cold blue desaturated steel palette, red as the lone saturated warning color, the quietest possible alarm mood, crisp pixel edges, no text, nothing else in the room moves once the arm stops.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, alarm lights spinning, camera cuts
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static with micro push
motion-strength: 2/5 — held scene, one pulse
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Vault door breathing (idle loop)
```text
META
camera: locked-off wide
loopable: yes
seed-suggestion: 13034
text_zones: none

LTX-VIDEO
prompt: A circular steel vault door sits at the end of a cold blue pixel-art aisle, its ring of status lamps holding steady green while exactly one amber lamp breathes slowly up and down in a long gentle cycle, dust motes drifting through a thin equipment glow. The camera is locked off, the frame otherwise perfectly still, the breathing lamp the only motion in the deep quiet room. Flat 2:1 isometric game diorama, desaturated steel and blue, hard silhouettes, matte metal, patient meditative calm, continuous motion with no beginning or end, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera movement, door opening
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off
motion-strength: 1/5 — held, single breathing light
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off square composition of a pixel-art tape vault aisle: one closed circular steel vault door with a ring of small green status lamps at the end of cold blue shelving. Exactly one amber lamp on the ring breathes up and down in a slow continuous cycle; faint dust particles drift through one thin beam of equipment light; the camera never moves and the clip loops seamlessly. Desaturated steel and cold blue, one amber accent, hushed cathedral stillness, crisp pixel silhouettes, no people, no text, nothing else changes state.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera shake, door opening
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off
motion-strength: 1/5 — held, single breathing light
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the family hero — require a clean pluck-and-dock with no limb weirdness (reject early on gripped-arm artifacts); V3 must land its red segment unambiguously or the beat is lost; V4 is the idle/Aquarium candidate, check the loop seam at 2× before adopting.

## SHOT HT-4 — Envelope fleet at the border gate

The email line: a flotilla of small envelope-shaped motes drifting up a dark channel to a
border gate watched by three lamps — green accepted, amber deferred, red rejected — and a
round reputation gauge mounted beside it. Lamps do the storytelling; nothing is ever written.

### V1 — Fleet approach, lamps working
```text
META
camera: slow push-in toward the gate
loopable: no
seed-suggestion: 13041
text_zones: none (stamps are lamp flashes and check gestures, not glyphs)

LTX-VIDEO
prompt: A loose fleet of small paper-white envelope motes drifts along a dark pixel-art channel toward a border gate framed by three round lamps, and as each envelope passes the gate one lamp flashes — mostly green, once amber making an envelope loop politely back into the queue, once red pushing it gently sideways off-channel. The camera pushes slowly toward the gate arch while a round needle gauge on its pillar rises a notch. Flat 2:1 isometric game diorama, desaturated navy-grey channel, envelopes the brightest objects, saturated green amber red lamp points, crisp pixel silhouettes, orderly customs-day mood, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, readable stamps, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 3/5 — steady drift with gate events
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Pixel-art game scene of a mail border crossing: exactly one dark channel carrying a loose fleet of small white envelope motes drifting toward a single arched gate, and exactly three round lamps beside the gate — green, amber, red — plus one round needle gauge on the gate pillar. Envelopes pass the gate one at a time; the green lamp flashes for most, the amber flashes once and one envelope loops back into line, the red flashes once and one envelope slides gently out of frame; camera performs one slow push-in, no cuts. Desaturated navy-grey palette with saturated lamp colors as the only strong accents, calm bureaucratic rhythm, crisp pixel silhouettes, no text or stamps legible anywhere, nothing else moves.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, readable labels, camera cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 3/5 — steady drift with gate events
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Reputation gauge in the weather
```text
META
camera: static close-up on the gauge dial
loopable: no
seed-suggestion: 13042
text_zones: none

LTX-VIDEO
prompt: A round diegetic gauge with a heavy bezel swings its needle downward toward the amber sector as out-of-frame envelopes continue to pass, the needle dipping, hesitating, then climbing slowly back as a green lamp flashes twice beside it and the needle settles higher than it started. The camera holds a tight static close-up on the dial glass, soft reflections sliding across it. Ink-blue chrome structure, flat crisp unlit instrument face, saturated green lamp point, matte bezel with one gloss accent on the glass, cautious relief as an emotional arc, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, readable gauge labels, photorealistic hands
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static close-up
motion-strength: 2/5 — needle motion only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Extreme close-up of exactly one round instrument gauge from a pixel-art game terminal: heavy matte bezel, ink-blue dial face with a tick arc but no readable markings, one brass needle. The needle swings smoothly down toward an amber zone, holds with a tiny tremble, then climbs back up past its start point as two green lamp flashes reflect off the glass; the camera is completely static, no cuts. Flat crisp unlit chrome register, ink-blue with green and amber accents, held-breath-then-relief mood, only the needle and lamp reflections move, nothing morphs, no text.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, readable labels, camera movement, photorealistic
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static close-up
motion-strength: 2/5 — needle motion only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Deferred blizzard (bad sender day)
```text
META
camera: static tripod
loopable: no
seed-suggestion: 13043
text_zones: none

LTX-VIDEO
prompt: The flow of white envelope motes on a dark pixel-art channel thickens into a blizzard as the border gate's amber lamp strobes steadily and rejected envelopes pile in a small side yard, the needle gauge on the gate pillar creeping down toward red while accepted envelopes thread through in a thin reliable ribbon. The camera holds static on the overwhelmed crossing, envelope density rising until the whole upper frame shimmers with drifting paper. Flat 2:1 isometric game diorama, desaturated navy-grey channel, saturated amber lamp dominance, crisp pixel silhouettes, escalating-but-orderly customs chaos, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, explosion, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 4/5 — dense drift
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A pixel-art mail border crossing under pressure: exactly one arched gate with a rapidly flashing amber lamp, a white envelope fleet arriving so thick it fills the dark channel like a blizzard, a small side yard where red-rejected envelopes settle in a neat pile, and one round gauge whose needle creeps downward. Camera static, no cuts, held wide. Desaturated navy-grey scene with saturated amber, red, and green lamp points as accents, controlled overwhelming-busy mood rather than panic, crisp pixel silhouettes, envelope count high but individual envelopes remaining readable squares, no text, the gauge needle and pile growth are the only slow changes.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera movement, fire
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tripod
motion-strength: 4/5 — dense drift
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Clean sheet hour (idle loop)
```text
META
camera: locked-off wide
loopable: yes
seed-suggestion: 13044
text_zones: none

LTX-VIDEO
prompt: A single white envelope drifts slowly down a dark pixel-art channel toward a quiet border gate, the green lamp flashing once as it passes through and away out of frame, while the round gauge needle holds steady high on its dial and faint glow from the lamp pulses once per passage. The camera is locked off and the motion is sparse, symmetric and continuous, a calm checkpoint at rest with slow solitary traffic in a dim room lit by its own equipment. Flat 2:1 isometric game diorama, desaturated navy-grey, one saturated green accent, crisp pixel silhouettes, meditative stillness, no beginning or end to the motion, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera movement, crowd
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off
motion-strength: 1/5 — sparse single actor
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off square composition of a pixel-art mail gate at rest: one dark channel, one arched border gate with a steady green lamp, one high-holding round gauge. Exactly one white envelope drifts through every few seconds; the green lamp gives one soft flash as it passes; motion is sparse, evenly spaced and seamless for looping; the camera never moves. Desaturated navy-grey palette, single saturated green accent, profound calm, crisp pixel silhouettes, no people, no text, lamp flash and envelope drift are the only movement in frame.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera shake, busy traffic
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off
motion-strength: 1/5 — sparse single actor
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the family hero and must show all three lamp verdicts distinctly; V2 only survives if the needle arc is legible without any dial markings; V4 is the idle-screen arm — require envelope spacing to stay even.
