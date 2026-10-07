# THREAT PARADE — the bestiary in motion

<!-- spec: hosting_game.md §8.5 threat visual contract (5 channels: silhouette/hue/motion/telegraph/scale; 7 motion primitives; volumetric DDoS rising tide + capacity line; L7 mimic flips to red-outlined silhouette on detection; insider ORIGINATES INSIDE; hardware failure deliberately undramatic; chargeback = money backwards + receipt tears) -->

Five creatures, five movements, one law: identity is silhouette, state is colour, and
hostile is always magenta-family. No monster designs invented here — these are the
spec's contracts performed at 24/25 fps. Seeds follow the family formula (TP=12).
Wan track note: these clips hinge on exactly-one-behavior rules (the mimic flips ONCE,
the tide rises but never breaches); if a take adds a second beat, re-roll before editing.

## SHOT TP-1 — Tsunami against the seawall

Volumetric DDoS: at the map edge a rising cyan-white tide pours into the wide uplink
pipe, fill level climbing toward a notched capacity line while legitimate visitor beads
pile up uselessly outside the surge. Scrubbing drains the pipe back below the line.

### V1 — The fill
```text
META
camera: static, edge-on to the pipe
loopable: no
seed-suggestion: 12011
text_zones: none

LTX-VIDEO
prompt: At the edge of an isometric pixel-art map, a wide dark uplink pipe runs from a churning sea of cyan-white beads at the horizon toward the facility. Inside the pipe a visible fill level of packed beads rises steadily segment by segment toward a bright notch marker high on the glass, the surge pressing forward. Along the shore outside the pipe, a crowd of small calm cyan visitor beads gathers and shuffles without entering. The camera holds static on the pipe. Overcast light, grey concrete diorama, the tide the only loud motion, dread told as water level.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic ocean, realistic water, waves crashing, splash particles, monsters
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static edge-on
motion-strength: 4/5 — rising pressure
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art map edge under overcast light, one huge horizontal dark-glass uplink pipe crossing the frame from a distant churning tide toward a quiet grey facility. Timeline: during the first four seconds the pipe's internal fill level, made of packed cyan-white beads, rises steadily toward a single bright notch on the glass; the distant tide churns continuously; a small crowd of orderly cyan beads shuffles along the shoreline outside the pipe and never enters it. Static camera, no cuts, no zoom. Desaturated concrete and steel diorama, saturated cyan-white surge as the visual event, retro 32-bit pixel style, hard silhouettes. The water is abstract bead-matter, never photoreal liquid. Impending flood, math made visible.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, photorealistic ocean water, splashes, flooding city, waves crashing, camera shake, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static edge-on
motion-strength: 4/5 — tide pressure
cfg: 4.0
steps_hint: 20-40
```

### V2 — Scrubbing relief
A filter gate engages upstream of the facility: the tide gets squeezed through, emerging thin and sparse; the pipe level falls.
```text
META
camera: slow push-in toward filter
loopable: no
seed-suggestion: 12012
text_zones: none

LTX-VIDEO
prompt: A tall lattice filter gate descends into place across a bead-filled uplink pipe at the edge of an isometric pixel yard, and the churning packed tide behind it is drawn through the bars. On the far side the beads emerge sparse, evenly spaced, and calm. The pipe's fill level visibly falls back below the bright notch marker as drainage wins. A slow push-in camera follows the pipe toward the gate the whole time. Grey concrete diorama, overcast light with one warm rim from low sun, cyan surge desaturating into orderly cyan dots, mechanical relief.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic water, destruction, explosions
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 4/5 — compression and drainage
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art facility edge, a wide glass uplink pipe packed with churning cyan-white beads running toward a tall vertical lattice gate that slowly descends into the pipe line. Action timeline: the gate locks into place, then the packed tide is drawn through the bars and emerges on the near side as thin, evenly spaced, calm beads; the fill level inside the pipe behind the gate falls steadily back below a single bright notch on the glass. Slow steady push-in camera toward the gate, one move, no cuts. Overcast light with a low warm sun rim on concrete, desaturated grey-beige world, cyan beads the saturated note, retro pixel style, abstract bead-matter rather than liquid water. Pressure becoming procedure — the scrub, performed.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, photorealistic water, splashing, broken glass, flooding, fast zoom, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 4/5 — squeeze-through
cfg: 4.0
steps_hint: 20-40
```

### V3 — Breach moment
The fill passes the notch; the pipe window fogs to solid cyan, first beads spill at a joint — magenta grit puff at the seam.
```text
META
camera: static tight on joint
loopable: no
seed-suggestion: 12013
text_zones: none

LTX-VIDEO
prompt: Tight on a flanged joint of an overfilled pixel uplink pipe whose glass has gone solid churning cyan behind the notch marker. The pipe flexes once, then a thin stream of beads sprays from the joint seam in a short arc, each spray bead flickering to magenta at the tip; a small flat puff of magenta grit bursts at the seam and clears. Behind the glass the packed tide keeps pressing. Static tight camera, cold overcast light on wet-looking steel, one amber warning lamp entering frame edge beginning to blink, pixel texture, contained panic.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic water jet, steam, realistic metal fatigue, explosion
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tight
motion-strength: 5/5 — spray burst
cfg: 3.0 (drop to 2.5 if the spray bead-matter turns to liquid water — per model card)
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Close static shot on one flanged joint of a large dark-glass uplink pipe in a pixel-art world, the pipe interior packed wall-to-wall with churning cyan bead-matter past a bright notch etched on the glass. Timeline: the pipe bulges once subtly, then a narrow spray of beads jets from the joint seam in a short arc for two seconds, spray tips flashing magenta; one flat circular magenta grit puff bursts at the seam and clears; an amber warning lamp at frame edge starts blinking in a slow rhythm. No cuts, no camera movement. Cold overcast key light, desaturated steel and concrete, saturated cyan interior and magenta accents only, retro 32-bit style, abstract particles never liquid. The moment capacity stops being a suggestion.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, human figures, realistic water jet, steam, burst pipe flooding, explosion, fire, camera shake
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tight
motion-strength: 5/5 — spray event
cfg: 4.0
steps_hint: 20-40
```

### V4 — Aerial tide map
High god-view: the whole map edge is a rising cyan sea pushing one thin pipe mouth; legit beads marooned on rooftops.
```text
META
camera: very slow drift overhead
loopable: no
seed-suggestion: 12014
text_zones: none

LTX-VIDEO
prompt: From a high isometric god's-eye angle, a flat pixel-art coastal map is half-covered by a slow rising plain of packed cyan beads pressing against a single narrow pipe mouth at the seawall, the tide climbing block by block toward pale grey rooftops where tiny visitor beads cluster marooned on chimneys and awnings. The pipe mouth glows with intake pressure. The camera drifts almost imperceptibly to the right over the whole clip. Overcast dawn, muted grey-beige city pixels, cyan flood plain as the loud abstraction, scale as the whole message, quiet apocalypse by arithmetic.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic flood, drowning people, realistic water, debris
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: near-static slow drift
motion-strength: 3/5 — glacial rise
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Elevated god-view of an isometric pixel-art coastal city block under overcast dawn light. A vast flat plain of packed cyan bead-matter covers the lower half of the map and rises one pixel-row at a time toward a single glowing pipe mouth set in a seawall; tiny cyan visitor beads sit marooned on flat rooftops, chimneys and awning edges, perfectly still. Exactly one near-imperceptible camera drift to the right, no cuts, no zoom. Desaturated grey and beige city pixels with one cyan field of pressure, hard readable silhouettes, retro 32-bit game map style, the flood abstract and geometric, never liquid. No humans, no animals, no text. Loneliest disaster footage ever: catastrophe measured in fill levels.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn faces, human figures, realistic flooding, cars swept away, rain, waves, fast camera, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: near-static slow drift
motion-strength: 3/5 — glacial
cfg: 3.5 — drift is delicate; high CFG exaggerates micro-jitter
steps_hint: 20-40
```
**PICK CRITERIA:** tide must read as packed BEADS (geometric fill), not photoreal water — the #1 failure mode for this shot on both models; V3's spray is the only magenta allowed and it must be small.

## SHOT TP-2 — The mimic

An L7 attacker looks exactly like a legit visitor until the detection flip — then it
doesn't. Red-outlined silhouette, one-frame blue identification flash, everyone nearby
keeps walking.

### V1 — Detection flip
```text
META
camera: static lane view
loopable: no
seed-suggestion: 12021
text_zones: none

LTX-VIDEO
prompt: A queue of small cyan beads waits at a checkpoint arch in an isometric pixel yard. One bead at the front, indistinguishable from the others, steps under the arch; a scan line touches it and it freezes, then snaps into the same bead shape wearing a bright red outline, with a one-frame blue flash at the moment of the change. The two beads behind it continue through the arch, unaffected, still cyan. The red-outlined bead is quietly lifted aside by the arch itself into a detour chute. Static camera, overcast daylight, muted grey diorama, cyan and red the only saturated colors, paranoia resolved in two frames.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, monster, mask, spider, alarm strobe
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 3/5 — subtle walk, sharp flip
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art checkpoint scene, static camera, no cuts: a single-file queue of identical small cyan beads walks under a slim scanning arch. Timeline: the lead bead passes under the arch, a thin horizontal scan line crosses it, the bead halts and after one beat transforms in place — same shape, now wearing a bold red outline — with exactly one bright blue flash frame at the change; the two following beads keep walking through the arch untouched and stay cyan; the red-outlined bead is nudged sideways into a small detour chute by a sliding bar. Overcast daylight, desaturated grey-beige diorama, retro 32-bit pixel style, hard silhouettes, no monsters, no faces, no text. Trust recomputed in public, traffic unbothered.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn faces, monster designs, masks, spider imagery, human figures, strobe alarms, camera shake, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 3/5 — calm queue, one snap
cfg: 4.0
steps_hint: 20-40
```

### V2 — The convincing one
No flip: the mimic passes clean and the audience is never told — held doubt.
```text
META
camera: slow follow-pan on one bead
loopable: no
seed-suggestion: 12022
text_zones: none

LTX-VIDEO
prompt: A single cyan bead walks a lane through a small isometric pixel checkpoint without incident: the scan arch sweeps it, pauses a half beat longer than feels comfortable, then lets it pass. The bead continues down the lane, merging into the healthy stream, completely unremarkable. The camera follows it with one gentle pan and then simply keeps watching it go until the clip ends. Flat overcast daylight, quiet grey diorama, no color change ever, no alarm, nothing happens — and that is the horror, pixel edition.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, red outline, alarm, explosion
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: one slow follow-pan
motion-strength: 2/5 — deceptively calm
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art checkpoint under flat overcast daylight: exactly one small cyan bead walks a dark lane toward a slim vertical scanning arch and passes beneath it. The arch's scan line crosses the bead and hesitates — one extra half-second pulse — then dims to a pass state and the bead strolls on, merging into a light healthy stream of identical cyan beads flowing away from camera down the lane. One slow left-to-right follow-pan, one camera move only, no cuts, no reveal, no color change, no alarm. Desaturated grey-beige diorama with cyan as the only saturation, hard pixel silhouettes, retro 32-bit game style. No people, no text, no foreshadowing whatsoever. The most unsettling shot in the parade: the one where nothing happens.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, red outline appearing, monster, mask, human figures, strobe, dramatic zoom, camera shake, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: one slow follow-pan
motion-strength: 2/5 — patient stroll
cfg: 4.0
steps_hint: 20-40
```

### V3 — Cluster before the reveal
Twelve mimics sit inside the healthy stream as perfect cyan lookalikes; one shared scan pass lights exactly four red outlines, the rest stay violet.
```text
META
camera: static wide on stream
loopable: no
seed-suggestion: 12023
text_zones: none

LTX-VIDEO
prompt: A wide steady stream of identical cyan beads flows across an isometric pixel plain. A slow vertical band of light sweeps the frame left to right like a lighthouse pass; wherever it crosses certain beads, exactly four of them snap to red-outlined copies mid-stream and are peeled sideways out of the flow, while one bead it touches turns soft violet and hovers blurred, unresolved. The healthy stream never breaks rhythm around the removals. Static wide camera, afternoon light, muted grey world threaded with a cyan river, red and violet notes struck once each, surgical chaos invisible to the water.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, crowd panic, mass explosion
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 4/5 — sweep plus peels
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Wide static shot across an isometric pixel plain, a continuous healthy river of small identical cyan beads flowing left to right, no cuts. Timeline: a soft vertical band of light sweeps slowly across the whole frame from left to right over three seconds; exactly four beads turn into red-outlined copies as the band passes them and are peeled smoothly sideways out of the river onto dead-end spurs; one additional bead turns blurred violet and stalls mid-stream, unresolved, while the river splits around it and rejoins. Afternoon overcast light, desaturated grey-beige world, the cyan river with red, violet accents, retro 32-bit pixel art, hard silhouettes, no humans, no readable characters. Detection happening at scale without a single ripple of panic in the traffic — quiet surgery.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, human figures, crowd panic, chaos, explosions, many color changes at once, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static wide
motion-strength: 4/5 — sweep event
cfg: 4.0 — if the four red flips blur into mush, lower to 3.5 and re-roll
steps_hint: 20-40
```

### V4 — Vertical crop, social cut
Portrait framing: the mimic's ascent up a vertical lane, flip at the arch, red outline trailing down-frame.
```text
META
camera: static portrait, lane bottom-to-top
loopable: no
seed-suggestion: 12024
text_zones: none

LTX-VIDEO
prompt: In a tall vertical frame, small cyan beads climb an upward pixel lane toward a slim scanning arch near the top of shot. One bead reaches the arch, freezes under the scan line, and flips to a red-outlined silhouette; the red outline pulses once as the bead slides back DOWN the lane the way it came, retracing its own trail, while the line of cyan beads behind it continues its patient climb through the arch untouched. Static portrait camera, dusk gradient sky at frame top, muted grey diorama below, cyan and red the only saturated voices, rejection rendered as reverse gravity.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, alarm lights, monsters
duration_s: 4.8
fps: 25
resolution: 704x1216
aspect: 9:16
camera: static portrait
motion-strength: 3/5 — climb, flip, retrace
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Vertical portrait composition in retro isometric pixel-art style: one dark lane runs from the bottom of frame up to a slim vertical scanning arch placed near the top, dusk violet gradient filling the upper background. Timeline: a queue of identical small cyan beads climbs steadily upward; the leader touches the arch's scan line, halts, snaps to a red-outlined version of itself with one bright frame flash, then slides straight back down the lane to frame bottom while the beads behind it continue climbing through the arch unchanged. Static camera, no cuts, no rotation. Desaturated grey-beige lower world, cyan and red outlines the only saturation, hard pixel silhouettes, no humans, no faces, no text. Rejection with a sense of humor: the one bead that got un-fried, twice.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, human figures, monsters, spider webs, strobe, landscape orientation letterboxing, camera shake, cuts
duration_s: 5.0
fps: 24
resolution: 704x1216
aspect: 9:16
camera: static portrait
motion-strength: 3/5 — vertical choreography
cfg: 4.0
steps_hint: 20-40
```
**PICK CRITERIA:** the flip must be instant (one to three frames), never a morph; the mimic keeps the SAME silhouette through the flip — any take where it becomes a bug/spider/mask violates the contract and the joke.

## SHOT TP-3 — Drive-click death

Hardware failure is deliberately undramatic: a dull thunk nobody notices for four
seconds, one LED strip going amber then red, the fan stopping, one bead frozen mid-lane.

### V1 — The undramatic thunk
```text
META
camera: static, rack centered
loopable: no
seed-suggestion: 12031
text_zones: none

LTX-VIDEO
prompt: A small isometric pixel-art storage rack sits beside a lane with a steady green LED strip and a rooftop fan spinning. The rack gives one short physical shudder, nothing more. Over the next seconds its LED strip dims from green to amber, holds, then settles to a single steady red point. The rooftop fan slows and stops. One cyan bead already committed to the rack's lane freezes in place mid-lane, tail fading, going grey. The rest of the yard continues its normal small flows. Static camera, flat afternoon light, muted grey-beige pixel world, catastrophe expressed as three subtractions.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, fire, smoke, sparks, explosion
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 2/5 — events by removal
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Static side-on shot of one squat isometric pixel-art storage rack at a quiet yard corner, its green LED strip steady and a small rooftop fan spinning, a single cyan bead rolling toward it along a short lane. Action timeline: the rack shudders once briefly; over four seconds its LED strip steps down green to amber to a single steady red point; the fan audibly-slowly stops; the approaching bead freezes mid-lane and drains from cyan to inert grey. Background yard traffic continues at normal small pace, entirely indifferent. Flat late-afternoon light, desaturated grey-beige materials, retro 32-bit pixel style, no sparks, no smoke, no fire, no humans, no text. Death as an administrative event — the drama of subtraction.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, human figures, fire, smoke, sparks shower, explosion, dramatic lighting, strobe, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 2/5 — stillness taking things away
cfg: 4.0
steps_hint: 20-40
```

### V2 — Macro on the LED
Tight on the indicator itself: green breathing, amber hesitation, red commitment — the fan's blur winding down in the background.
```text
META
camera: static macro on bezel LED
loopable: no
seed-suggestion: 12032
text_zones: none

LTX-VIDEO
prompt: Extreme close-up on a single round status LED set in a matte black plastic bezel. The LED breathes a calm green rhythm for three seconds, then flickers to amber and holds with one uncertain double-blink, then commits to a flat steady red. Behind the bezel, out of focus but readable, a small fan blade blur slows over five seconds and stops with the blades visible between two housing slats. Absolute static macro camera, tiny dust motes settling, harsh practical light raking across plastic texture, diegetic hardware close-up, no labels, no hands, the entire tragedy inside one component's color wheel.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic skin, human eyes, fire
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 2/5 — deceleration
cfg: 3.0 — macro texture is forgiving; keep guidance modest to avoid shimmer
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Diegetic hardware macro shot, static camera locked on one round status LED embedded in a matte black plastic bezel with brushed steel slats. Action timeline over five seconds: the LED pulses calm green twice, stutters to amber with one hesitant double blink, then settles to flat steady red with no further change; simultaneously, in the soft background behind the bezel slats, a spinning fan blur slows until individual blades stand still between two slats. Harsh raking practical light from the left, drifting dust motes coming to rest, shallow pixel-art rendering kept crisp, retro game close-up, no human parts, no readable markings, no cable details finer than three pixels. A eulogy the length of a component status change.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, human eyes, fingers touching hardware, fire, smoke, dramatic lens flare, camera movement, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 2/5 — wind-down
cfg: 4.0
steps_hint: 20-40
```

### V3 — The indifference wide
Wide yard: the dead rack's lane empties, beads reroute around it one by one, nobody stops, life quietly reallocates.
```text
META
camera: slow right-to-left pan following reroutes
loopable: no
seed-suggestion: 12033
text_zones: none

LTX-VIDEO
prompt: Wide isometric pixel yard at dusk with one dead storage rack at center, its LED a flat red point, its lane beads now diverting one by one into a neighboring lane with a small polite pause before merging. A maintenance cart bead trundles past the dead rack without stopping. The camera pans slowly right to left, tracing the rerouting flow as the dead rack's lane visibly thins to empty. Warm sodium pools on grey concrete, tiny green and amber window lights across the yard, muted pixel world continuing without its fallen member, grief measured in traffic redistribution.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, repair crew, welding sparks
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow right-to-left pan
motion-strength: 3/5 — reroute choreography
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Dusk wide shot of an isometric pixel-art facility yard, one dead storage rack with a single steady red LED at frame center, two lanes flowing past it. Timeline: beads traveling toward the dead rack's lane halt one polite beat early, merge into the neighboring lane, and continue; over four seconds the dead lane visibly empties to zero while the healthy lane thickens; exactly one small grey maintenance cart bead crosses the frame bottom and does not stop at the rack. One slow right-to-left pan following the merging traffic, no cuts. Warm sodium lamp pools on grey concrete, tiny amber window points across dark pixel buildings, retro 32-bit style, hard silhouettes, no humans, no text. Community as load balancing — the yard mourning in its own traffic language.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, human figures, repair workers, sparks, smoke, fast pan, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow right-to-left pan
motion-strength: 3/5 — redistribution flow
cfg: 4.0
steps_hint: 20-40
```

### V4 — Overnight ghost
Night hold on the dead rack: its frozen grey bead still sitting mid-lane at dawn, no one has come for it. The undramatic epilogue.
```text
META
camera: static locked night-to-dawn
loopable: no
seed-suggestion: 12034
text_zones: none

LTX-VIDEO
prompt: A locked static shot of an isometric pixel storage yard through the whole night: one dead rack keeps its flat red LED while the yard's cyan traffic thins to almost nothing, blue darkness pooling between grey racks. Near the end the sky lightens to cold dawn lavender and the dead rack's abandoned grey bead is still frozen in its lane, unchanged, small, waited-out. Zero camera movement the entire time, one slow cloud crossing the sky, distant green exit lamps reflecting on wet-look concrete, quiet pixel melancholy, the failure nobody attended to attending to itself.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, night creatures, rain, movement near the rack
duration_s: 10.3
fps: 25
resolution: 1216x704
aspect: 16:9
camera: locked static
motion-strength: 1/5 — held long exposure feel
cfg: 3.0
steps_hint: 40 final (long statics show every step artifact)

WAN 2.2
prompt: One completely locked static shot, no movement whatsoever except slow ambient change: an isometric pixel-art storage rack yard cycling from deep night to cold pre-dawn over the full clip. At center, one dead rack with a single flat red LED keeps vigil; its abandoned grey bead sits motionless in the empty lane the entire time. Timeline: night blue darkness with thin cyan traffic, traffic fading to near zero by mid-clip, sky shifting to lavender-grey at the last two seconds while the rack and bead remain untouched. Small green exit-lamp reflections on concrete, one cloud crossing slowly, desaturated night palette with red and grey focal points, retro 32-bit pixel style, no humans, no text, no rescue. Devotion, or negligence — the frame refuses to explain which.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, human figures, animals, rain, moving vehicles near the dead rack, camera drift, cuts
duration_s: 10.0
fps: 24
resolution: 1280x720
aspect: 16:9
camera: locked static
motion-strength: 1/5 — ambient only
cfg: 3.5 — long static gradients at CFG 4+ invite banding shimmer; tune per model card
steps_hint: 20-40
```
**PICK CRITERIA:** red must be STEADY (spec: red is final, no strobing); V4 is the family's patience test — reject any take where something comes to fix it.

## SHOT TP-4 — The insider

The insider originates inside and there is no perimeter visual. One ordinary-looking
worker sprite simply walks the wrong way past firewall beams that never react.

### V1 — Walking backwards through trust
```text
META
camera: static along the beam corridor
loopable: no
seed-suggestion: 12041
text_zones: none

LTX-VIDEO
prompt: Inside a quiet isometric pixel corridor, three thin vertical firewall beams of soft cyan light stand like doorways. An ordinary grey-beige worker sprite, identical in silhouette to the maintenance sprites passing the other way, turns from a desk and walks through all three beams outward toward the frame exit. Every beam stays perfectly calm as it passes, never flickering, never changing color. The camera holds static down the corridor watching the sprite recede into the outer yard. Flat terminal lighting, ink-blue structure with muted grey floor plates, cyan beams the only glow, dread assembled entirely from inaction.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic person, face detail, alarms, red beams, security lasers grid
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static corridor
motion-strength: 2/5 — one calm walk
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Interior of an isometric pixel-art terminal corridor seen straight down its length, three slim vertical cyan firewall beams spaced like open doorways across the floor. Timeline over five seconds: one small ordinary worker sprite, rendered as a plain hard-edged pixel silhouette with no visible face, rises from a desk at the corridor's inner end and walks outward at an even unhurried pace, passing through the first beam, then the second, then the third — each beam remaining completely steady and uncaged as it crosses — and exits frame toward a pale yard beyond. Two other identical worker sprites walk the opposite direction, inward, indifferent. Static camera, no cuts. Flat self-lit terminal glow on matte ink-blue structure and grey floor plates, retro 32-bit style, no alarms, no red, no text. The scariest shot in the parade: nothing, happening three times.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, realistic human faces, detail on faces, alarm lights, laser grids, dramatic red lighting, running, camera shake, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static corridor
motion-strength: 2/5 — patient walk
cfg: 4.0
steps_hint: 20-40
```

### V2 — The beam almost notices
Mid-corridor, the second beam stutters a half-flicker as the insider passes — then settles. Maybe nothing. Probably nothing.
```text
META
camera: slow push-in behind the walking sprite
loopable: no
seed-suggestion: 12042
text_zones: none

LTX-VIDEO
prompt: Following closely behind a small ordinary pixel worker sprite walking outward through a corridor of vertical cyan firewall beams, the camera pushes in slowly at walking pace. As the sprite crosses the middle beam, the beam stutters — one half-flicker of brightness, gone instantly — and the sprite keeps walking without pausing, arms at sides, silhouette perfectly routine. The beam settles back to glass-still cyan. The exit yard light grows ahead. Terminal ambience, ink-blue walls, muted grey floor, one micro-hesitation of light as the only witness, pixel-noir restraint.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering of the whole scene, morphing shapes, photorealistic, visible face, red beams, alarm, camera shake
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in at walking pace
motion-strength: 2/5 — walk-synced drift
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Over-the-shoulder height behind a small faceless pixel worker silhouette, camera gliding forward slowly at exactly walking pace down an isometric terminal corridor lined with three vertical cyan light beams. Timeline: the sprite crosses beam one calmly; at beam two the light performs one single subtle half-flicker as the silhouette passes through it, then returns to glass-steady glow without the sprite altering pace; beam three never reacts at all. The corridor exit opens onto pale grey daylight as the sprite approaches it. No cuts, one continuous slow push, no camera shake. Matte ink-blue structure, grey floor plates, self-lit cyan beams, retro 32-bit pixel aesthetic, hard silhouette with zero facial detail, no alarms, no text. Doubt delivered in half a frame — the audience is now the only alarm system.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, realistic human features, visible face, dramatic flickering, red light, strobe, running, whip pan, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in walking pace
motion-strength: 2/5 — creeping
cfg: 4.0
steps_hint: 20-40
```

### V3 — The badge scan that works
Close on the reader plate by the door: the insider's hand-token taps it, the plate blinks a contented green, and the lock clacks open. Authorization, weaponized.
```text
META
camera: static tight on door plate
loopable: no
seed-suggestion: 12043
text_zones: none

LTX-VIDEO
prompt: Tight static shot on a small rectangular reader plate mounted beside a pixel-art door, its status lamp dark. A plain square token held at sleeve height enters from the left and taps the plate once. The plate's lamp rises to a satisfied steady green, a bolt clacks audibly out of frame, and the door edge swings a palm's width open, spilling a strip of pale corridor light across the grey floor. The token withdraws. Nothing about the exchange looks wrong, which is the point. Matte ink-blue door, beige plastic plate, CRT-soft light, diegetic close-up, one green lamp testifying to a lie.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, card numbers, symbols on plate, flickering, morphing shapes, photorealistic hands, fingerprint detail
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tight
motion-strength: 2/5 — one tap
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Diegetic close-up, static camera locked on a rectangular badge-reader plate of beige plastic mounted beside a matte ink-blue door in a pixel-art interior. Timeline: a plain square token, held at sleeve height by an entirely off-frame presence, taps the plate once; the plate's round status lamp eases from dark to a warm satisfied steady green; a bolt clacks open off-screen; the door swings a hand's width and a clean strip of pale corridor light falls across grey floor pixels; the token withdraws and the frame holds on the open seam of light. No human bodies or hands visible at any point, no card markings, no readable characters, retro 32-bit aesthetic with soft CRT light. Complicity rendered as excellent customer service.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, visible hands, fingers, skin, card numbers, symbols, red lamps, alarm, dramatic shadows, camera move, cuts
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static tight
motion-strength: 2/5 — single gesture
cfg: 4.0
steps_hint: 20-40
```

### V4 — The empty desk, later
The insider's desk, minutes after: chair still turned, terminal still warm with amber glow, an empty cup. Nobody has noticed. Quiet crime scene as still life.
```text
META
camera: very slow push-in on desk
loopable: no
seed-suggestion: 12044
text_zones: none

LTX-VIDEO
prompt: A still-life close view of a small unoccupied desk in an isometric pixel terminal room: a swivel chair still angled mid-rise, a boxy CRT glowing a warm amber empty screen-wash with no readable content, a tiny mug with one curl of steam thinning out. Dust floats in the monitor light. Nobody enters, nothing moves except the steam and dust, and the room's other desks stay pixel-perfect routine in the soft background. The camera inches forward almost imperceptibly toward the abandoned warmth. Ink-blue shadows, beige plastic hardware, amber screen glow, the loudest silence in the library, evidence of departure without permission.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, readable screen content, flickering, morphing shapes, photorealistic, people entering
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: near-imperceptible push-in
motion-strength: 1/5 — still life with steam
cfg: 3.0
steps_hint: 40 final (near-statics reveal every artifact)

WAN 2.2
prompt: Pixel-art interior still life, isometric terminal room corner: one abandoned desk holding a swivel chair frozen mid-turn, a chunky boxy CRT washing warm amber light onto the desk surface with blank glow and no readable lines or shapes, and a small mug releasing one thinning curl of steam. Timeline: only the steam curl dissolves and dust motes cross the monitor glow — nothing else, nobody enters frame, the background desks remain untouched and routine. Near-imperceptible slow push-in toward the warm empty chair, no cuts. Ink-blue room shadows, beige plastic terminal housing, amber glow as the single light source, retro 32-bit style, absolutely no screen text, no humans. The crime scene is the comfort: five minutes after forever, nobody knows yet.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, readable screen output, code on screen, human figures entering, movement in background, dramatic film noir lighting, camera shake, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: near-imperceptible push-in
motion-strength: 1/5 — held breath
cfg: 3.5 — blank-screen glow banding risk: keep CFG gentle, re-roll rather than fix
steps_hint: 20-40
```
**PICK CRITERIA:** the insider must NEVER be visually coded as a villain — same silhouette as every other worker sprite, always faceless; if any take adds a cloak, mask, glow or red tint, it breaks the spec's entire point.

## SHOT TP-5 — Chargeback swarm

Money flows BACKWARDS: gold coins reverse mid-arc and drain out of the cash bar,
turning red en route, while receipt pages tear in half.

### V1 — The reversal
```text
META
camera: static on cash bar
loopable: no
seed-suggestion: 12051
text_zones: none

LTX-VIDEO
prompt: A layered pixel cash bar built of golden segments stands on an isometric desk when, one by one, coins lift out of its top layer and fly backward the way they came, each coin bleeding from gold to red at its peak height and continuing out of frame toward the upstream edge. As the bar loses coins its segments shrink downward one layer at a time. A paper receipt sheet on the desk next to it tears cleanly in half across the middle, both halves sliding slightly apart. Static camera, warm desk lamp light, muted grey-beige world, an unplanned reverse heist told in coin physics.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, coin markings, currency symbols, readable document lines, flickering, morphing shapes, photorealistic paper texture, fire
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 4/5 — coins in revolt
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Isometric pixel-art desk scene with a bar of stacked golden coin-segments at center under a warm desk lamp. Action timeline: over four seconds individual gold coins rise out of the bar's top and travel backward along reverse parabolas toward the upper-left of frame; each coin changes from gold to red at its apex; the bar visibly shrinks one layer per departed coin. Simultaneously at the desk's edge a small plain white receipt sheet tears cleanly in half horizontally and the two blank halves slide gently apart. Static camera, no cuts. Desaturated grey-beige materials, saturated gold-to-red transitions as the story, retro 32-bit pixel style, absolutely no text on any paper, no hands, no humans. Accounting performed by physics: the money leaving like it never agreed to come.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, dollar signs, coin engravings, readable receipts, hands tearing paper, human figures, fire, dramatic zoom, camera shake, cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static
motion-strength: 4/5 — reverse flight
cfg: 4.0
steps_hint: 20-40
```

### V2 — The swarm version
Not coins: a whole month's revenue lifts as a red-tinted swarm streaming back up the payment lane, the lane's direction chevrons flickering under the reversed pressure.
```text
META
camera: pan following the swarm upstream
loopable: no
seed-suggestion: 12052
text_zones: none

LTX-VIDEO
prompt: A thick swarm of small gold points lifts simultaneously out of a pixel cash bar and streams backward up a payment lane toward the map's upstream edge, the whole flow shifting gold-to-red as it accelerates. The camera pans once to track the reversal up the lane, catching lane markers flashing under the counter-current. At the frame's far end the swarm pours off the map edge into the cloud bank where the visitors came from, thinning to nothing. Static gray evening yard around the moving streak, retro pixel diorama, one long arterial withdrawal — revenue evacuating downstream.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, blood, locusts, swarm creatures
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: one tracking pan
motion-strength: 5/5 — full reversal flow
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Evening on an isometric pixel-art facility map, payment lane running from a golden cash bar at frame right up toward a soft cloud bank at the far left edge. Timeline: the cash bar's stored value erupts upward as one dense flowing swarm of tiny coin-points that travels BACKWARD along the payment lane, the stream grading from gold near the bar to red toward the front, accelerating; the lane's embedded chevron markers strobe faintly under the counter-current as it passes. Exactly one smooth pan from bar to map edge follows the swarm's departure, then holds on the emptied lane. No cuts, no humans, no readable signage, desaturated grey-beige evening world with a single saturated wound-streak across it, retro pixel style. The river running the wrong way — a month's revenue walking itself home.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, blood, insects, creature swarm, fire, red alarm strobes, human figures, fast whips, multiple pans, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: one smooth tracking pan
motion-strength: 5/5 — arterial reversal
cfg: 4.0
steps_hint: 20-40
```

### V3 — Two receipts, one story
Split-screen discipline via sequencing: healthy sale (coin in, receipt prints) immediately followed by chargeback (coin out, same receipt tearing) — cause and its undoing back to back.
```text
META
camera: static, tight on receipt slot
loopable: no
seed-suggestion: 12053
text_zones: none (the receipt would carry print — post-only, keep blank)

LTX-VIDEO
prompt: Tight on a beige pixel receipt slot on a desk. First beat: a gold coin drops into an adjacent slot and a blank white paper receipt feeds out of the printer slot, curling neatly as it lands. Second beat, after a short hold: the same coin rises back out of its slot, flipping from gold to red mid-flight and zipping out of frame, and the landed receipt tears itself cleanly in half down its center, halves drifting apart. Static tight camera the whole time, warm lamp light, blank paper never showing a single mark, one transaction and its un-transaction in eight seconds.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, printed marks on paper, flickering, morphing shapes, photorealistic paper, hands
duration_s: 10.3
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static tight
motion-strength: 3/5 — two-beat routine
cfg: 3.0
steps_hint: 40 final (two-beat timing needs clean frames)

WAN 2.2
prompt: Static tight shot on a small beige pixel-art payment device: a coin slot beside a blank-paper receipt printer on a warm lamp-lit desk, no cuts, camera locked. Timeline in two clear beats: beat one, a plain gold coin drops into the slot and a strip of perfectly blank white receipt paper feeds out and curls onto the desk; a one-second hold; beat two, the identical coin rises back out of the slot, turning red at the top of its arc and flying off-frame, while the printed receipt splits cleanly down its vertical center and the halves slide apart. Retro 32-bit pixel style, desaturated desk materials, saturated gold, red and clean white paper, absolutely no writing, lines or marks on the receipt, no hands, no humans. A joke only operators will get: the sale, and its paperwork filing an objection.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, printed text on receipt, dollar signs, human hands, torn bloody paper, fire, zoom, cuts
duration_s: 10.0
fps: 24
resolution: 1280x720
aspect: 16:9
camera: static tight
motion-strength: 3/5 — beat-driven
cfg: 4.0
steps_hint: 20-40
```

### V4 — Aisle reaction
The finance corner at the moment of reversal: three worker sprites' small green desk lamps all flip amber in sequence, nobody moves, the coins stream past the window.
```text
META
camera: slow dolly past a row of desks
loopable: no
seed-suggestion: 12054
text_zones: none

LTX-VIDEO
prompt: The camera dollies slowly past a row of small isometric pixel desks while outside the single window behind them a visible stream of gold-to-red coins flows backward across the sky lane upstream. Desk by desk, each desk's tiny green lamp flips to amber exactly one beat after the dolly passes it, like a wave of quiet noticing; the faceless worker sprites at the desks do not move or look up. The coin-stream keeps exiting frame toward the cloud edge. Ink-blue evening interior, warm desk pools, green-to-amber lamp cascade as the only human-adjacent event, restrained accounting horror in pixel office register.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, readable screens, faces, flickering, morphing shapes, photorealistic
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow dolly right-to-left
motion-strength: 3/5 — wave of lamps
cfg: 3.0
steps_hint: 20-30 draft / 40 final

WAN 2.2
prompt: Interior row of three tiny isometric pixel-art office desks against a wall with exactly one wide window, evening blue light. Camera action: one slow steady dolly from right to left past the desks, no cuts. Through the window, a continuous stream of coin-points flows across the sky lane in the WRONG direction, grading gold to red as it travels. Timeline: each desk's small round green lamp flips to amber one beat after the dolly reaches it — three soft amber acknowledgements in sequence — while the three faceless seated worker silhouettes never stir or look toward the window. Desaturated grey-beige office, ink-blue shadows, green-to-amber lamp cascade and coin-stream the only saturated events, retro 32-bit pixel aesthetic, no readable screens, no text, no close faces. The department learning the news before the news admits it.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, readable computer screens, human faces, skin detail, panic, standing up, phone calls, fast dolly, cuts
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow dolly right-to-left
motion-strength: 3/5 — sequenced lamp flips
cfg: 4.0
steps_hint: 20-40
```
**PICK CRITERIA:** coins must leave (never vanish in place) and receipts tear ACROSS, not randomly — the tear axis reads as cancellation; V3's two-beat structure is the marketing-trailer pick, V4 the tone pick (recognition comedy, never parody).
