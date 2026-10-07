# TITLE TEASERS — marketing-grade pieces

<!-- spec: hosting_game.md §8.17 money shot (Pullback authored path) + key art hero (3am aisle); §8.10 era skins 1998/2026; §0.5 arc ends in boredom = highest achievement; era stills exist at ../../docs-hero/era-crossfade.md and ../../promo/key-art-hero.md -->

Three hero pieces for store pages and trailers. Two carry **hard-camera warnings**: the
era morph wants first-last-frame plumbing, and the Pullback is genuinely image-to-video
territory — the text2video blocks are honest fallbacks, and the manifest entries say so
via `i2v_note`. The third piece sells the spec's boldest marketing claim: a game whose
highest achievement looks calm. `text_zones` here marks reserved areas for typeset titles
and the shop sign — composited in software, never by the model.

## SHOT TT-1 — Era crossfade: the same desk, 1998 to 2026

One desk, one operator's chair, one window — the CRT era's amber-beige hardware dissolving
into the cyan-rounded 2026 skin while the *work on screen stays identical*, the whole pitch
of "same engine, twenty years" in one morph.

**⚠️ Route advice: strongest result = Wan 2.2 FLF2V** (first-last-frame): generate the two
era stills from `../../docs-hero/era-crossfade.md` (V1/V2 pairs), feed as first/last frames.
The pure text2video blocks below are sketches — expect morph smearing; keep them for
thumbnail exploration only.

### V1 — Amber to cyan over the keyboard
```text
META
camera: static frontal on the desk
loopable: no
seed-suggestion: 17011
text_zones: none (both screens stay glyph-free glows)
i2v-note: PREFERRED ROUTE — Wan 2.2 FLF2V with the two era stills from docs-hero/era-crossfade.md as first/last frames; text2video blocks here are fallback sketches
first-frame-recipe: (FLUX.1-dev / SD3.5-Large, from the 1998 still) "Isometric pixel-art game diorama of a 1998 hosting desk: beige boxy CRT terminal glowing soft amber with abstract bars of light, chunky rounded keyboard, stack of floppy disks, one coffee mug, desk lamp pooling warm light, one window showing night rain, desaturated beige-grey-brown palette, matte plastic, hard pixel edges, flat crisp unlit pixel-art game style, no photorealism, absolutely no text or letters anywhere"

LTX-VIDEO
prompt: A beige 1998 pixel-art desk with a glowing amber CRT terminal holds dead still as its colors slowly bleed toward cool cyan, the bulky monitor shell slimming and rounding while the screen's soft amber glow shifts to cyan, the desk lamp's warm pool widening and cooling, the window behind keeping the same night-rain silhouette through the whole change. The morph is continuous and even from first frame to last with no cuts. Same composition start to finish, matte retro plastic becoming smooth modern surfaces, ink-blue and cyan overtaking beige and amber, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, composition change, camera movement, objects multiplying
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static frontal
motion-strength: 2/5 — color/shape morph only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static frontal shot of exactly one pixel-art desk, composed identically start to finish: one monitor terminal, one keyboard, one mug, one window with night rain. The scene morphs slowly and continuously from 1998 to 2026: beige bulky CRT shell rounds and thins into a slim cyan-glow display, warm amber lighting cools to cyan, brown-grey desk surfaces lighten to smooth dark blue with rounded corners, while every object keeps its exact position and the on-screen glow remains abstract with no text anywhere. No cuts, no camera movement. Desaturated beige-amber palette migrating to ink-blue-cyan, nostalgic-to-modern continuity mood, crisp pixel silhouettes held throughout, only materials, colors and shell profiles change, nothing is added or removed.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, objects popping in, camera movement, composition shift
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static frontal
motion-strength: 2/5 — color/shape morph only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Split-frame wipe (left 1998, right 2026)
```text
META
camera: static, one vertical seam sweeping right
loopable: no
seed-suggestion: 17012
text_zones: none
first-frame-recipe: (Qwen-Image phrasing — it obeys spatial split instructions best) "Split-frame pixel-art game illustration, one identical hosting desk shown twice divided by a clean vertical line: left half 1998 era with beige CRT glowing amber, floppy stack, warm lamp; right half 2026 era with slim cyan monitor, rounded dark blue surfaces, cool ambient light; same objects same positions both sides, desaturated palettes, hard pixel silhouettes, absolutely no text or letters"

LTX-VIDEO
prompt: A single pixel-art desk stands centered in frame as a vertical line of light begins at the left edge and sweeps steadily rightward, converting everything it passes from beige 1998 hardware with amber glow into slim 2026 hardware with cyan glow, the sweep pausing once at the keyboard before continuing, ending with the whole desk modernized against the last sliver of amber at frame's left. One continuous even wipe motion as the only camera event. Ink-blue and cyan replacing beige and amber left to right, flat 2:1 isometric game diorama, crisp pixel edges, satisfying restoration-reveal rhythm, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, wobbly line, camera movement, double wipe
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static with wipe element
motion-strength: 3/5 — steady sweep
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static shot of one pixel-art desk filling frame: a crisp vertical glowing seam starts at the left border and travels right at constant speed like a held wipe, and every object the seam crosses transitions instantly from 1998 skin (beige CRT, amber screen glow, brown desk) to 2026 skin (slim rounded display, cyan glow, dark blue desk) in place without changing position. The seam exits frame right, leaving a fully modernized desk. No cuts, camera perfectly still. Two-tone era palette split traveling across one ink-blue scene, clean mechanical reveal rhythm, crisp pixel geometry both sides of the seam, no text on any screen, exactly one leftward-to-rightward pass with no second sweep.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, seam jitter, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static with wipe element
motion-strength: 3/5 — steady sweep
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Two chairs, one window (era relay)
```text
META
camera: slow arc from one chair to the other
loopable: no
seed-suggestion: 17013
text_zones: none
first-frame-recipe: (FLUX.2-dev multi-reference — feed the two docs-hero era stills as both references to keep the room identical across skins)

LTX-VIDEO
prompt: A dark pixel-art room holds two desks back to back sharing one window, the left desk a beige 1998 station with amber CRT glow, the right desk its 2026 twin in ink-blue and cyan, and the camera arcs slowly from behind the first chair toward the second, passing through the middle where the window's rain silhouette stays constant, ending framed over the modern chair with the amber era now glowing softly in the background. One smooth arcing move, no cuts. Dual-era palette in one shadowy room, warm amber and cool cyan pools facing away from each other, flat 2:1 isometric game diorama, quiet torch-pass mood, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, people sitting, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow arc
motion-strength: 2/5 — gentle arc
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: One dark pixel-art room containing exactly two back-to-back desks sharing one rain-streaked window: the left desk in 1998 skin, beige CRT burning amber; the right desk in 2026 skin, slim display glowing cyan; both empty chairs, no people. Camera performs a single slow horizontal arc from behind the old chair to behind the new one, the window holding fixed in the background, ending on an over-the-shoulder framing of the modern desk with the amber era soft behind. No cuts. Amber-cyan twin-pool lighting, desaturated room, the patience of two decades, crisp pixel silhouettes, screens stay abstract glows, nothing on either desk changes state during the move.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic humans, seated figures, camera shake
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow arc
motion-strength: 2/5 — gentle arc
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — [CINEMATIC-REALISM] era morph (marketing arm)
```text
META
camera: static locked-off live-action
loopable: no
seed-suggestion: 17014
text_zones: center lower reserved for typeset era tagline (post)
i2v-note: treat like TT-1 V1 — a photoreal morph is far more reliable as Wan FLF2V between two generated photographic stills than as text2video

LTX-VIDEO
prompt: A locked-off photoreal shot of a quiet home office desk at night holds rock steady as time passes invisibly, the room's hardware transforming in continuous morphing slow motion from a 1998 setup with a bulky beige CRT glowing warm amber, plastic keyboard and tower under the desk into a 2026 setup with a thin rounded display glowing soft cyan on a cleaner desk, the window, chair position and lamp staying identical throughout, rain still on the glass. Photorealistic cinematic footage with a single locked camera, moody practical lighting shifting warm-to-cool, film grain, shallow but constant depth, the melancholy and continuity of technology, no on-screen text.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, morphing into different room, camera movement, people entering, flicker
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static locked-off
motion-strength: 2/5 — held morph
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off photorealistic cinematic shot of one night home office: desk centered, rain on the window behind, desk lamp pooling warm light. The scene morphs continuously in place: beige CRT computer with curved glass glowing amber becomes a slim modern monitor glowing cyan, keyboard and tower exchanging profiles mid-shift, papers and mug never moving, the room geometry and lighting directions staying identical while the palette glides from amber-beige to cool ink-blue-cyan. Static camera, no cuts. Practical lighting only, gentle film grain, wistful continuity mood, no people, no readable screens, exactly one morph arc with no reversals.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, room changing layout, camera movement, people appearing
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static locked-off
motion-strength: 2/5 — held morph
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** this whole shot ships best via FLF2V with the docs-hero stills — the text2video takes are scouting; among them V2 (seam wipe) is the most robust because it *hides* morph weakness behind a traveling edge; V4 is the labeled realism exception for live-action-feel trailers, its mood word intentionally carries the year-continuity story.

## SHOT TT-2 — The Pullback (§8.17 money shot)

The camera escapes the building: starts low in a cold aisle, backs up through hot aisle,
past containment glass, out the door, up over the campus — and the sign lights. This is the
hardest continuous camera move in the library and both models will break it. **Adopt the
segmented route as primary**; blocks below are per-arm recipes plus one full-move fallback.

**⚠️ Route advice: image-to-video, three arms spliced on doorframe hits** — Arm A (aisle→
door): first frame = `../../promo/key-art-hero.md` V1 still (the 3am aisle), i2v pullback.
Arm B (door→campus air): first frame = facility exterior still, i2v crane-up. Arm C (sign
glow): any dark wide, i2v lamp-sequence. The full text2video blocks are scouting only.

### V1 — Full move (text2video fallback scout)
```text
META
camera: continuous pull-back rising to aerial
loopable: no
seed-suggestion: 17021
text_zones: sign face reserved dark — typeset wordmark in post
i2v-note: DO NOT expect this single-take scout to survive review — split per the route advice above; keep the take anyway for blocking reference
first-frame-recipe: (FLUX.1-dev / SD3.5-Large) "Low pixel-art isometric view down a dark data-center cold aisle at 3am, one tiny silhouetted technician with a flashlight beam far down the aisle, exactly one rack glowing warm amber among long rows of dim green status lights, cable plumes overhead, desaturated greys with one amber pool, hard pixel silhouettes, flat crisp pixel-art game style, no photorealism, absolutely no text or letters anywhere"

LTX-VIDEO
prompt: The camera begins low inside a dark pixel-art server aisle glowing with tiny green lights and one amber rack, then pulls steadily backward along the aisle, backing through a doorway with a glass wall, continuing backward outside into cool air while rising gently to reveal a small campus of low buildings at night, ending as a large blank sign above the entrance ignites row by row with warm lamps, the camera holding high and still on the lit sign. One continuous backward-then-upward motion with no cuts. Desaturated night greys with an amber heart growing into a lit campus, quiet triumph mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera cuts, walls blocking camera, sign with words
duration_s: 10.3
fps: 25
resolution: 1216x704
aspect: 16:9
camera: continuous pull-back crane-up
motion-strength: 4/5 — sustained complex move
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A single continuous camera move inside and out of a pixel-art game facility: start low and static in a dark cold aisle lined with tiny green rack lights and exactly one amber-lit rack, then pull backward at steady accelerating glide along the aisle, pass smoothly through an open doorway with a glass partition, keep backing into a night exterior while rising into a gentle aerial of one small low campus of warehouses, and hold as the blank wall-mounted sign above the entrance lights up lamp by lamp in warm amber. No cuts, no camera shake, walls never clip the camera. Desaturated night greys resolving to one warmly lit sign, earned-finale atmosphere, crisp pixel silhouettes, no people, the sign stays unlettered geometry lit by points, exactly one backward-then-upward trajectory.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera passing through walls, letters on sign, cuts
duration_s: 10.0
fps: 24
resolution: 1280x720
aspect: 16:9
camera: continuous pull-back crane-up
motion-strength: 4/5 — sustained complex move
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled; A14B for length)
```

### V2 — Arm A only: aisle to doorframe (i2v workhorse)
```text
META
camera: steady pull-back, aisle to doorway
loopable: no
seed-suggestion: 17022
text_zones: none
i2v-note: run as image-to-video from the key-art-hero 3am aisle still; exit frame exactly on the door silhouette for a clean splice to Arm B
first-frame-recipe: (FLUX.1-dev / SD3.5-Large) "Pixel-art isometric game view from floor level down a dark data-center cold aisle at 3am: green status pinpoints receding, one amber rack mid-depth, distant tiny silhouette with flashlight, cable plumes overhead, a faint doorway glow at the far end behind the viewer implied, desaturated greys, no text or letters anywhere"

LTX-VIDEO
prompt: Positioned low in a dark pixel-art server aisle lit by receding rows of tiny green pinpoints with one warm amber rack mid-depth, the camera pulls steadily backward along the aisle centerline, past rack after rack, the amber rack shrinking into the field of green, until the silhouette of a doorway with cool exterior light grows ahead and the camera glides to a stop perfectly framed within the doorjambs. One continuous backward move with no cuts and no rotation. Desaturated greys with green fields and one amber memory, disciplined prelude mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera turning, door closing, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: steady pull-back
motion-strength: 3/5 — constant glide
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Pixel-art data-center aisle at night, camera starting low at floor level looking down the corridor of dark racks dotted with tiny green lights and exactly one amber-lit rack. The camera executes one continuous steady pull-back along the centerline, revealing rack rows, ceiling cable plumes and finally a rectangular doorway of cool light ahead, stopping precisely when the doorframe fills the frame edges. No cuts, no pan, no rotation. Deep greys, green pinpoints, one amber accent, patient momentum, crisp pixel silhouettes, no people in the aisle, backward speed perfectly constant from first meter to the door.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera rotating, speed changes
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: steady pull-back
motion-strength: 3/5 — constant glide
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Arm B only: out the door, up over campus
```text
META
camera: pull-back through doorway rising to aerial
loopable: no
seed-suggestion: 17023
text_zones: sign face dark — post typesetting
i2v-note: image-to-video from a facility-exterior night still; begin tight on the doorway, end on campus wide — splice in on Arm A's doorframe hold
first-frame-recipe: (FLUX.1-dev / SD3.5-Large) "Pixel-art night exterior of a small hosting campus: one low warehouse building with a lit open doorway and glass vestibule, dark parking apron, faint amber security lights, big blank unlit sign board above the entrance, deep navy sky with sparse stars, desaturated palette, flat crisp pixel-game style, no text or letters anywhere"

LTX-VIDEO
prompt: Beginning tight on a glowing pixel-art doorway of a low night building, the camera pulls backward through the open door and out into cool air while rising in one smooth motion, the building shrinking into a small campus of dark warehouses under a navy sky, parking lines and lamp posts appearing below, ending on a high wide hold as the camera rests above the scene with a big blank sign board silhouetted over the entrance. One continuous backward-and-upward move, no cuts. Deep navy night with warm door glow receding into a constellation of amber security points, quiet grandeur, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, sign letters, camera cuts, drone wobble
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: pull-back crane-up
motion-strength: 4/5 — sustained ascent
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: One continuous camera move at night over a pixel-art hosting campus: start framed tight on a warm-lit open doorway of a low warehouse, pull straight backward through the door into exterior air, then rise smoothly at constant speed into a high wide revealing one small campus of dark low buildings, amber security lamps, empty apron, and a large unlit blank sign board mounted above the entrance, ending on a still aerial hold. No cuts, no shake. Navy-and-amber night palette, understated majesty, crisp pixel geometry, no people or cars moving, the ascent never stops until the final two-second hold.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, traffic movement, camera drift, text on sign
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: pull-back crane-up
motion-strength: 4/5 — sustained ascent
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Arm C only: the sign lights up
```text
META
camera: locked-off wide on the dark sign
loopable: no
seed-suggestion: 17024
text_zones: sign face fully reserved — the wordmark is typeset in post onto the lamp grid
i2v-note: the most text2video-tolerant arm of the Pullback — safe to attempt direct; splice after Arm B's aerial hold

LTX-VIDEO
prompt: A large blank pixel-art sign board on dark brackets above a night building entrance holds in a locked wide as its embedded lamp grid awakens in rolling rows, hundreds of tiny amber points igniting left to right in smooth sweeping waves until the whole board burns with warm even glow, then holds steady against the deep navy sky while a faint breath of light spills down onto the doorway below. The camera never moves and the ignition front crosses exactly once. Deep navy field with one awakening amber rectangle, ceremonial simplicity, flat 2:1 isometric game diorama, hard silhouettes, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, letters forming on the sign, camera movement
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: locked-off wide
motion-strength: 3/5 — one ignition sweep
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off night wide of exactly one large blank sign board on steel brackets above a small dark building entrance, deep navy sky behind. A wave of tiny amber lamps embedded across the board ignites in rolling left-to-right rows over the clip's middle, sweeping the full width once, and the completed glow holds perfectly steady, spilling soft warm light down onto the door below. No cuts, no camera move. Two-tone navy-and-amber composition, the payday moment, crisp pixel edges, no letters ever appear on the sign — only lamp points and their glow, ignition front traveling at one constant speed with no second pass.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, letters forming, flickering sign, camera shake
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: locked-off wide
motion-strength: 3/5 — one ignition sweep
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** the deliverable for this shot is the *splice*, not any single take — Arm A, B, C cut on doorframe and aerial holds; V4 is the one arm you may get in one text2video pass, and if pseudo-letters ever emerge on the sign board, reject the take (post wordmark only).

## SHOT TT-3 — Mastery looks like boredom (the quiet loop)

The spec's final arc beat: panic → process → prevention → boredom, with boredom as the
highest achievement. An idle facility so healthy and calm it becomes an aquarium — for
lobby screens, store-page backgrounds, and the marketing claim "the game you can watch
breathing." These are the cleanest loop candidates in the library.

### V1 — Everything green, one lazy bead
```text
META
camera: locked-off wide
loopable: yes
seed-suggestion: 17031
text_zones: none

LTX-VIDEO
prompt: A complete isometric pixel-art hosting facility at rest holds in a locked wide frame: every rack lamp burning steady green, lane lines dark and tidy, exactly one lone cyan bead rolling slowly along one long lane the entire length of the frame while faint lamp reflections drift on the polished floor, the single traveler looping endlessly through the settled room. Nothing else changes state, ever, in smooth unbroken calm. Desaturated greys and steel under a patient field of saturated green points, hard pixel silhouettes, the serenity of a job fully handled, flat 2:1 isometric game diorama, seamless loop, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, alarms, red lights, camera movement, people
duration_s: 10.3
fps: 25
resolution: 1216x704
aspect: 16:9
camera: locked-off wide
motion-strength: 1/5 — one slow traveler
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static locked-off wide of a pixel-art hosting facility diorama in perfect health: exactly one grid of server racks all holding steady green lamps, tidy dark lanes between them, and one solitary small cyan dot traveling slowly left to right along a single lane at constant speed, exiting and re-entering seamlessly to loop. The camera never moves; no state ever changes anywhere; the room is lit only by its own calm equipment glow. Desaturated steel with an even field of saturated green and one cyan traveler, dignified boredom, the aquarium of competence, crisp pixel silhouettes, no people, the green lamps stay absolutely constant with zero flicker.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, red or amber lights, camera movement, flicker
duration_s: 10.0
fps: 24
resolution: 1280x720
aspect: 16:9
camera: locked-off wide
motion-strength: 1/5 — one slow traveler
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Window weather, indoors peace
```text
META
camera: locked-off, facility edge with the one window
loopable: yes
seed-suggestion: 17032
text_zones: none

LTX-VIDEO
prompt: The dark pixel-art edge of a healthy resting facility sits under a single high window through which slow weather passes, thin diagonal rain crossing to clearing to soft sun while inside, untouched by it, every green lamp holds its steady color and the lanes stay tidy and quiet, one faint reflection of the window light sliding a slow bar across the concrete floor as the sky cycles. Locked-off composition with all drama confined to the glass and none indoors, seamless loop. Desaturated interior greys with one saturated green field and a pale window rectangle, calm-inside-storm-outside mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, interior changes, alarm, camera movement
duration_s: 10.3
fps: 25
resolution: 704x1216
aspect: 9:16
camera: locked-off
motion-strength: 2/5 — weather drift only
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Portrait locked-off shot at the edge of a pixel-art hosting facility: exactly one high window on the wall carrying slowly cycling weather outside, rain slanting, thinning, brightening to soft daylight and repeating, while below it the interior stays in perfect unchanged repose, racks at steady green, lanes empty, no state changes anywhere inside. Only the window content and one gentle sliding floor reflection of its light move; camera never budges; seamless loop. Cool grey interior with saturated green points and a small living rectangle of sky, the §8.4 window keeping watch, crisp pixel silhouettes, no people, indoor lamps never flicker or shift color.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, interior activity, camera movement
duration_s: 10.0
fps: 24
resolution: 704x1216
aspect: 9:16
camera: locked-off
motion-strength: 2/5 — weather drift only
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Night desk, nobody needed
```text
META
camera: slow half-orbit around the operator desk
loopable: yes
seed-suggestion: 17033
text_zones: none (the abandoned mug and folded blanket do all the characterization)

LTX-VIDEO
prompt: An empty pixel-art operator desk with a sleeping amber terminal glow, a tipped mug and a folded blanket on the chair holds at the center of a green-lit resting facility while the camera half-orbits it in one smooth continuous pass, racks sliding past in the periphery keeping their perfect steady lamps, the terminal's soft glow pulsing once like a slow breath as the orbit completes back to its start. Even unhurried camera motion, seamless looping endpoint, nothing at the desk moves though everyone clearly left hours ago. Desaturated night interior with green grid fields and one warm desk pool, affectionate absence, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, person appearing, camera cuts
duration_s: 10.3
fps: 25
resolution: 1216x704
aspect: 16:9
camera: half-orbit
motion-strength: 2/5 — smooth orbit
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: One empty pixel-art operator workstation at the heart of a perfectly healthy dark facility: glowing amber terminal with abstract light, tipped mug, folded blanket over the chair. Camera performs a single smooth half-orbit around the desk at constant slow speed, racks with unwavering green lamps gliding through the frame edges, ending aligned with the opening angle for a seamless loop; the terminal glow breathes once near the middle of the pass. No cuts, no people ever present. Warm desk pool amid cool green fields on desaturated night interiors, the quiet trophy shot of automation, crisp pixel silhouettes, orbit speed perfectly even with no wobble.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, figure entering, camera shake
duration_s: 10.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: half-orbit
motion-strength: 2/5 — smooth orbit
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — So still it might be frozen (deadpan arm)
```text
META
camera: locked-off tight on two racks and one lane
loopable: yes
seed-suggestion: 17034
text_zones: none

LTX-VIDEO
prompt: A tight locked pixel-art frame of two dark server racks with rock-steady green lamps and one empty lane between them stays absolutely motionless for most of the shot, so still it reads like a paused screen, until exactly one tiny cyan bead finally trundles through from left to right at modest speed and the frame resumes its patient freeze, the whole cycle repeating evenly forever. The composition never changes, nothing breathes, nothing flickers, deadpan mineral calm. Desaturated steel with four steady green points and one rare cyan traveler, joke told with a straight face, flat 2:1 isometric game diorama, seamless loop, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, busy traffic, camera movement, lamp changes
duration_s: 10.3
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off tight
motion-strength: 1/5 — near-total stillness
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off tight square composition of exactly two pixel-art server racks with fixed green lamps flanking one empty dark lane. The frame holds in complete stillness for long stretches; once per cycle a single small cyan dot crosses the lane left to right at a walk, then absolute stillness returns and repeats, seamlessly, indefinitely. Camera never moves, no object shifts, no lamp changes intensity. Mineral deadpan patience, desaturated steel with four unwavering greens and one intermittent cyan, the visual punchline of a solved problem, crisp pixel dots, humans forbidden, stillness phases lasting several seconds each.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, constant motion, camera drift, flicker
duration_s: 10.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off tight
motion-strength: 1/5 — near-total stillness
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** all four are aquarium-grade — acceptance test is the seam check at 2× scrub speed; V1 is the store-page background default, V4 is the in-joke cut for the community reel (if the model sneaks in any lamp flicker during the freeze, it dies — the joke *is* the stillness).
