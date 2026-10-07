# ECONOMY BOOK — the commercial board

<!-- spec: hosting_game.md §8.7 money FX (gold moves, coins arc); contracts-are-cables (GLOSSARY law); §8.5 whale = load-bearing pillar, churn cliff walk-off; dunning ladder letter→phone→scissors; cash-vs-profit two-ledger split (§6.13 legibility); The Book as a physical board -->

Money in this game is diegetic furniture: contracts are cards that dock like cables, the
whale customer is architecture, dunning is a three-panel gesture strip. Everything here
follows the form law — gold moves, and nothing is ever written: invoices are blank
stationery, gauges have no digits. The register is WORLD diorama with CHROME drawer
hardware; the Book's ink-blue palette leaks in as a skin.

## SHOT EB-1 — Contracts dock like cables

The central metaphor made literal: a contract card slides into its slot with the same
magnetic satisfaction as a connector, and the rack of signed deals fills up like a patch
panel of quiet commitments.

### V1 — Single dock, gold seam
```text
META
camera: static macro three-quarter
loopable: no
seed-suggestion: 16011
text_zones: none (card faces stay blank stationery with a wax-seal dot)

LTX-VIDEO
prompt: A crisp pixel-art contract card with a blank cream face and one small gold seal dot slides horizontally into a dark bevelled slot on an ink-blue board, decelerating smoothly and snapping home as a thin gold light seam traces its border and a tiny green lamp beneath the slot pulses once. The camera holds a static three-quarter macro on the dock. Ink-blue chrome board with cream card and saturated gold seam, matte with one gloss accent on the seal, satisfying paperwork-as-hardware mood, hard pixel edges, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, readable handwriting, hands, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static macro three-quarter
motion-strength: 3/5 — one decisive slide
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static three-quarter macro of exactly one ink-blue pegboard-style contract board with a single empty horizontal slot. A blank cream pixel-art card bearing one small round gold seal slides into the slot from the right, eases to a stop and clicks home; a fine gold outline lights along its border and one small green lamp under the slot blinks once. No cuts, no zoom. Ink-blue and cream palette with saturated gold and one green, quiet signing-ceremony mood, crisp pixel silhouettes, no hands ever appear, the card face stays perfectly blank, only slide, seam and lamp move.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, handwriting visible, card tearing, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static macro three-quarter
motion-strength: 3/5 — one decisive slide
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Filling the rack (time-lapse feel)
```text
META
camera: slow left-to-right track across the board
loopable: no
seed-suggestion: 16012
text_zones: none

LTX-VIDEO
prompt: Cream pixel-art contract cards slide one after another into a long horizontal rack of slots on an ink-blue board, each docking with its own quick gold seam flash, empty dark slots converting to filled glowing ones from left to right as the camera tracks steadily along the row, the board's master lamp counting up through green blinks. Even, cheerful, inexorable pace like a good quarter. Ink-blue chrome with a spreading row of cream cards and gold seams, hard pixel edges, flat game-art rendering, quiet commercial optimism, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, cards falling, hands, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow left-to-right track
motion-strength: 4/5 — continuous dockings
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A wide ink-blue contract board holding exactly one horizontal row of eight empty slots. One after another, blank cream cards glide in from off-frame right and dock sequentially left to right, each releasing a short gold seam glow on landing, while a master green lamp at the board's edge blinks once per docking; the camera performs one slow left-to-right track matching the filling pace, no cuts. Ink-blue, cream and gold palette, metronomic good-times rhythm, crisp pixel geometry, no hands, no readable faces on the cards, exactly eight dockings with one empty slot remaining at the end.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, cards stacking wrongly, camera cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow left-to-right track
motion-strength: 4/5 — continuous dockings
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — One card refuses the slot
```text
META
camera: static macro
loopable: no
seed-suggestion: 16013
text_zones: none

LTX-VIDEO
prompt: A grey-edged pixel-art contract card slides toward a filled ink-blue board slot, stops a finger's width short as the slot's lamp flashes amber twice in polite refusal, and the card withdraws smoothly back out of frame while the occupied slot's green seam keeps burning undisturbed. The camera holds static macro on the small bureaucratic non-event. Ink-blue board with cream and one grey card, amber refusal blink as the only alarm, dry administrative comedy tone, matte chrome with one gloss accent, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, red alarm, card crumpling, hands, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 2/5 — small slide in and out
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static macro on one slot of an ink-blue pixel-art contract board where a filled card already glows with a green seam. Exactly one grey-bordered blank card slides in from the right toward the slot, halts just short of it, the slot lamp gives two amber blinks, and the grey card retreats back out of frame at the same calm speed; the seated card never moves. No cuts. Ink-blue, cream, grey with one amber double-blink, understated recognition-comedy beat, crisp pixel edges, no hands, no collision, nothing bends or tears, the two amber blinks are the only dramatic event.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, red flashing, card breaking, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static macro
motion-strength: 2/5 — small slide in and out
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — The board at rest (idle loop)
```text
META
camera: locked-off wide on the full board
loopable: yes
seed-suggestion: 16014
text_zones: none

LTX-VIDEO
prompt: A fully populated ink-blue pixel-art contract board hangs in perfect stillness, every slot holding a blank cream card with a quiet green seam, while exactly one gold seal dot on one card catches a slow traveling sheen that crosses the whole board once per cycle, the light passing seam to seam in a gentle wave before the frame returns to rest and repeats. The camera is locked off wide on the board like a framed painting of a good book of business. Ink-blue field with cream cards, green seams and one gold highlight, satisfied stasis, continuous loop with no beginning or end, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, cards moving, camera movement
duration_s: 7.7
fps: 25
resolution: 512x512
aspect: 1:1
camera: locked-off wide
motion-strength: 1/5 — one traveling sheen
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked-off square composition of one complete ink-blue pixel-art contract board: a tidy grid of cream blank cards, each with a steady thin green seam, nothing entering or leaving. Every few seconds a single soft sheen travels left to right across the gold seal dots one card at a time like a slow lap of applause light, then the board rests until the cycle repeats seamlessly. Camera never moves. Ink-blue and cream with green seams and punctual gold, the pride of a settled ledger, crisp pixel surfaces, no people, no card ever shifts position, only the sheen travels.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, card motion, camera shake
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: locked-off wide
motion-strength: 1/5 — one traveling sheen
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the metaphor-establishing shot — the decelerate-then-snap must feel like a magnet, not a crash; V2 sells momentum for the pitch video; V3's refusal blink is a recognition-comedy beat and dies if overplayed; V4 is the idle arm.

## SHOT EB-2 — The whale walks off the cliff

The renewal cliff, played with total sincerity: a whale-sized gold contract card standing on
a ledge as the load-bearing pillar it always was — and when it steps off, the floor above
develops one elegant crack. Scale and quiet, never spectacle.

### V1 — The step off
```text
META
camera: static side profile
loopable: no
seed-suggestion: 16021
text_zones: none

LTX-VIDEO
prompt: A colossal cream-gold pixel-art contract card, taller than the racks around it, stands politely at the edge of a dark renewal cliff ledge with one small green anchor lamp burning at its foot, then leans and steps off the edge in slow dignified motion, sliding out of frame downward while the anchor lamp snaps to red and a single thin crack races up the support pillar behind it, leaving the ledge empty under drifting dust motes. The camera holds a static side profile of the exit. Desaturated navy-grey cliff with the whale card in saturated cream-gold, one green-to-red lamp and one crack line, solemn quiet loss mood, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, falling debris, explosion, dramatic collapse, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static side profile
motion-strength: 3/5 — one slow exit
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static side profile of a pixel-art cliff edge inside a dark facility: exactly one enormous cream-gold contract card standing at the brink like a patient animal, one small green lamp anchored at its foot, a grey support pillar rising behind it. The great card leans once, steps off the edge in slow continuous motion and disappears downward; the lamp turns red and a single hairline crack crawls up the pillar, then total stillness on the empty ledge. No cuts, no zoom. Navy-grey desaturated stage with the saturated gold figure as protagonist, funereal gentleness, crisp pixel silhouettes, no debris falls, only step, lamp, crack — three events, nothing else.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, rocks falling, crumbling cliff, camera movement
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static side profile
motion-strength: 3/5 — one slow exit
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — The pillar crack close-up
```text
META
camera: slow push-in on the pillar
loopable: no
seed-suggestion: 16022
text_zones: none

LTX-VIDEO
prompt: The camera eases slowly toward a grey pixel-art support pillar standing under an empty cliff ledge moments after the great card departed, catching a single thin crack as it propagates upward through the flat stone face in one deliberate zigzag, tiny grey specks tapping off its path, while at the pillar's base the dead green lamp, now red, holds its glow on the floor. Structure learning what it cost. Desaturated stone greys with one red lamp accent and a black crack line, understated body-horror-of-accounting mood, hard pixel edges, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, collapse, avalanche, camera cuts
duration_s: 6.4
fps: 25
resolution: 704x1216
aspect: 9:16
camera: slow push-in
motion-strength: 2/5 — one slow crack
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Portrait close shot of one grey pixel-art load-bearing pillar beneath an empty ledge. Camera performs one slow push-in as exactly one crack travels upward along the stone in a clean stepped zigzag over the full height, a few faint specks drifting from the fissure, ending framed on the red lamp burning quietly at the pillar's foot. No cuts. Desaturated greys, black crack geometry, single red accent, the drama of bookkeeping made structural, crisp pixel surfaces, the pillar never bulges or leans, crack width stays hairline, motion limited to the upward travel and drifting specks.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, pillar collapsing, wide crack, camera shake
duration_s: 6.4
fps: 24
resolution: 704x1216
aspect: 9:16
camera: slow push-in
motion-strength: 2/5 — one slow crack
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Cliff edge, morning after (held wide)
```text
META
camera: locked-off extreme wide
loopable: yes
seed-suggestion: 16023
text_zones: none

LTX-VIDEO
prompt: A locked-off extreme wide of a dark pixel-art renewal cliff under cold early light from one high window, the great empty ledge centered small in the frame, its red anchor lamp now steady and patient, smaller cream cards continuing to queue calmly at a safe distance from the edge while dust motes cross the shaft of window light, the whole scene holding one long unchanging mood of loss absorbed and work continuing. Continuous stillness with only drifting motes and the slow queue breathing. Desaturated navy morning gloom, one red lamp and one pale window shaft, resilience without sentiment, flat 2:1 isometric game diorama, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, rain, dramatic clouds, camera movement
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: locked-off extreme wide
motion-strength: 1/5 — motes and slow queue
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Extreme wide locked-off tableau of a pixel-art facility cliff at grey morning: exactly one high window throwing a pale shaft across dark concrete, one empty ledge with a steady small red lamp at center distance, and a modest queue of blank cream cards resuming their slow drift along a lane well back from the edge. Camera never moves; the image is a held breath that goes back to work, loopable through the queue's endless even crawl. Desaturated navy-grey with one red and one pale shaft, stoic continuity mood, crisp pixel silhouettes, no weather drama, no figures, lamp and light stay constant.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, storm, camera movement
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: locked-off extreme wide
motion-strength: 1/5 — motes and slow queue
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Overhead: the hole the whale left
```text
META
camera: top-down static
loopable: no
seed-suggestion: 16024
text_zones: none

LTX-VIDEO
prompt: A top-down pixel-art view looks straight at the empty rectangular footprint on a dark facility floor where the whale card always stood, its outline still faintly glowing gold as a negative space while surrounding smaller card footprints keep their steady green and fresh pale dots begin tracing a detour path around the gap. The camera holds perfectly vertical overhead as the gold outline dims one shade and the detour traffic organizes itself around the absence. Desaturated charcoal floor with one fading gold rectangle, green points and rerouting cyan pinpoints, plan-diagram melancholy, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, camera movement, cracks spreading
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: top-down static
motion-strength: 2/5 — dimming and rerouting
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Perfect overhead static shot of a pixel-art facility floor rendered as a plan diagram: one large empty rectangular outline glowing faint gold where a whale-sized contract used to stand, ringed by small green card footprints, with fresh tiny cyan dots flowing around the gap in an improvised lane. Over the clip the gold outline slowly dims by half while the detour lane of dots brightens from hesitant to established; camera locked vertical, no rotation. Charcoal geometry with gold negative space, green grid points and cyan traffic, cartographic grief, crisp pixel lines, no people, no physical movement of any card, only light and dots change.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, camera rotation, objects sliding
duration_s: 5.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: top-down static
motion-strength: 2/5 — dimming and rerouting
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the family hero and one of the best marketing beats in the game — require slowness and dignity, reject anything slapstick; V4 is the poster-grade infographic arm (note its 1:1 crop doubles as a square social).

## SHOT EB-3 — Dunning strip

Escalation as triptych: a blank letter, a ringing phone, a pair of scissors — the classic
ladder performed in three gestures on one ink-blue desk, no text on anything, every step
marked by a lamp climbing green → amber → red.

### V1 — The letter tap
```text
META
camera: static overhead on the desk third
loopable: no
seed-suggestion: 16031
text_zones: none (the envelope is blank by law — the stamp is a colored dot)

LTX-VIDEO
prompt: An overhead pixel-art view of the left third of an ink-blue operations desk where a single blank cream envelope with one green stamp dot slides into frame from below, taps twice against a brass weight as if clearing its throat, and settles square beside a dormant green desk lamp that blinks once in confirmation. The camera holds locked overhead on the small polite nuisance. Ink-blue desktop with cream envelope and brass hardware, saturated green dot accents, bureaucratic patter mood, matte paper with one gloss on the brass, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, handwriting, readable stamp, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static overhead
motion-strength: 2/5 — small slides and taps
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Locked overhead shot of one desk panel in a pixel-art ink-blue operations scene: exactly one blank cream envelope with a small green round stamp. It slides into frame from the bottom edge, gives two light percussive taps against a brass paperweight, then squaring itself off; a green desk lamp gives one confirming blink. No cuts, no camera move. Deep ink-blue field, cream and brass with one saturated green, first-warning understatement, crisp pixel edges, no hands, nothing with text, the envelope's three moves are the entire performance.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, envelope opening, camera movement
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static overhead
motion-strength: 2/5 — small slides and taps
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — The phone rings (amber)
```text
META
camera: static close on the desk middle
loopable: no
seed-suggestion: 16032
text_zones: none

LTX-VIDEO
prompt: A chunky retro pixel-art desk telephone on an ink-blue surface rattles twice then rings with visible motion, its cradle lamp climbing from green to amber as the receiver jiggles toward the edge of its hook, cord stretching once like a held note, before the phone gives one last defiant shake and holds, ringing silently while the amber lamp stays up demanding an answer. The camera sits static close on the instrument. Ink-blue desk with black plastic phone and saturated amber glow, comic insistence mood, matte plastic with one gloss accent on the cradle lamp, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, hand picking up, camera cuts
duration_s: 4.8
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static close
motion-strength: 4/5 — ringing agitation
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static close composition of exactly one retro black pixel-art desk phone on an ink-blue desktop. The phone vibrates and rocks in two bursts, the cradle lamp steps green to amber mid-ring, the receiver bounces once toward lifting but is never lifted, and the shaking decays into an indignant still hold under the amber. No cuts. Ink-blue field with black plastic and one saturated amber, escalating-patience comedy, crisp pixel silhouettes, no hands ever enter, cord stays attached and plausible, ring intensity follows a clean two-burst-then-fade shape.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hand, receiver falling, camera shake
duration_s: 5.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static close
motion-strength: 4/5 — ringing agitation
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Scissors (red, respectful)
```text
META
camera: slow push-in on the desk right
loopable: no
seed-suggestion: 16033
text_zones: none

LTX-VIDEO
prompt: Steel pixel-art scissors stand open at the center of an ink-blue desk while a blank cream receipt strip feeds slowly up between their blades from a slot in the desktop, and the handles close once with a clean decisive geometry, the receipt separating into two halves that each topple gently sideways as a small red lamp beside the slot lights and holds. The camera pushes in slowly on the single cut. Ink-blue desk with steel tools, cream paper and one saturated red lamp, ceremony-of-finality mood, matte metal with one gloss accent, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, violence, blood, many cuts, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 3/5 — feed and one cut
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: One slow push-in over an ink-blue pixel-art desk holding exactly one pair of open steel scissors at center and one narrow blank paper receipt feeding upward from a slot into the blades at steady pace. The scissors close once, cleanly, the paper divides and its two halves tip over left and right in slow graceful falls; a red lamp at the slot edge lights and holds as the camera arrives at its slightly closer frame. One cut only, no repeated snipping. Ink-blue, steel, cream and one saturated red, dignified finality, crisp pixel geometry, no hands operate the scissors, the paper edges stay straight, everything settles to stillness by the end.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hands, shredding, multiple cuts
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow push-in
motion-strength: 3/5 — feed and one cut
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Triptych split (all three at once)
```text
META
camera: static wide on the full desk, three panels
loopable: no
seed-suggestion: 16034
text_zones: none (panel titles are added in post over reserved gaps)

LTX-VIDEO
prompt: A wide ink-blue pixel-art desk divided by thin brass rails into three square panels, each running one dunning beat simultaneously: on the left a blank envelope slides in and taps, in the middle a black phone rocks under a lamp stepping green to amber, on the right scissors close once on a rising paper strip as their panel lamp turns red, all three gestures landing on the same beat like a mechanical orchestra. The camera holds a static symmetrical wide. Ink-blue field ruled in brass, cream black steel with green amber red lamps reading left to right, escalation as composition, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, asymmetric chaos, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: static symmetrical wide
motion-strength: 3/5 — three synced gestures
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A perfectly symmetrical static wide of one pixel-art ink-blue desk partitioned into exactly three equal panels by thin brass strips. Left panel: a blank cream envelope slides in and double-taps a brass weight under a green lamp. Center panel: a black desk phone rocks twice as its lamp climbs green to amber. Right panel: steel scissors close once on a paper strip while a red lamp lights. The three actions fire in sequence left to right like dominoes, each completing as the next starts. No cuts. Triptych discipline, green-amber-red escalation choreography, crisp pixel geometry, no hands anywhere, lamps hold their new color after firing, total stillness follows the third event.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, hands, chaotic timing, camera drift
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: static symmetrical wide
motion-strength: 3/5 — three synced gestures
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V4 is the family hero — the left-to-right lamp escalation must stay perfectly readable at thumbnail size (reserve its title gaps for post typesetting); V3 must be respectful: one cut, no shredding fetish; V1→V2→V3 exist to be cut as a trio if no single take lands.

## SHOT EB-4 — Cash vs profit, pulled apart

The accounting lesson as engineering: one machine view of gold coins stacking into a cash
column, one ledger view of thin commitment lines stacked in ink, and the frame physically
separates the two panes until the gap between them *is* the punchline.

### V1 — The pull-apart
```text
META
camera: static frontal, panes separate
loopable: no
seed-suggestion: 16041
text_zones: none (pane labels are added in post)

LTX-VIDEO
prompt: Two flush pixel-art panes mounted as one square panel on a dark wall begin to slide slowly apart on hidden rails, the left pane carrying a cheerful well of round gold coins stacking in a deep column, the right pane showing calm ink-blue ledger lines of stacked thin contract strokes rising higher and higher without touching the coins, the gap between them widening into a dark seam that becomes the point of the whole composition as both panes come to rest far apart. The camera holds a static frontal shot of the separation. Gold warmth versus ink-blue restraint under desaturated wall grey, two-truths mood, matte panel frames with one gloss on coin surfaces, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, panes shattering, camera cuts
duration_s: 7.7
fps: 25
resolution: 1024x1024
aspect: 1:1
camera: static frontal
motion-strength: 2/5 — slow mechanical separation
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Frontal static shot of one square pixel-art display panel built from exactly two flush half-panes: the left half shows gold coins piling in a tidy rising column over dark iron grating, the right half shows thin ink-blue horizontal ledger strokes stacking upward like a calm graph. Midway the two panes slide slowly and smoothly apart on visible rails until a wide dark gap separates them, each continuing its quiet accumulation in isolation. No cuts. Split palette of saturated gold versus deep ink-blue on desaturated grey architecture, patient accounting revelation, crisp pixel edges, no digits anywhere, panes move at identical speed and stop symmetrically.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, breaking glass, uneven panes, camera movement
duration_s: 8.0
fps: 24
resolution: 1024x1024
aspect: 1:1
camera: static frontal
motion-strength: 2/5 — slow mechanical separation
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V2 — Coins pane macro (cash is physical)
```text
META
camera: slow vertical drift down the coin column
loopable: no
seed-suggestion: 16042
text_zones: none

LTX-VIDEO
prompt: Fresh round gold pixel-art coins drop one by one from a chute at the top of frame into a growing gleaming column inside a glass-fronted counter, each coin landing with a small bouncy settle and a tiny ring of light while the camera drifts slowly downward along the rising column, the stacked faces forming a warm honeyed mass against dark iron bands. Continuous cheerful accumulation. Saturated gold against desaturated gunmetal, matte glass with one gloss accent on coin faces, greedy-but-honest shopkeeping mood, hard pixel circles, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, coins melting, morphing faces, camera cuts
duration_s: 6.4
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow vertical drift
motion-strength: 3/5 — steady drops
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Macro inside one glass-fronted pixel-art cash column: exactly one feed chute at top releasing one round gold coin every beat, each falling a short distance, bouncing once and settling into a neat rising stack of identical coins bound by dark iron bands. Camera performs one slow vertical drift downward as the stack climbs past it, no cuts. Saturated coin gold as the protagonist against desaturated iron grey, tactile money-physics, crisp pixel circles that never deform or merge, no engraved faces or marks on coins, coin rhythm stays metronomic.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, coins scattering, morphing coins
duration_s: 6.4
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow vertical drift
motion-strength: 3/5 — steady drops
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V3 — Ledger pane macro (profit is geometry)
```text
META
camera: slow vertical drift up the strokes
loopable: no
seed-suggestion: 16043
text_zones: none

LTX-VIDEO
prompt: Thin horizontal ink-blue and cream ledger strokes extend one after another from left anchors up a dark pixel-art panel, each new line drawing itself out smoothly to its full length like a quiet bar chart of promises, some lines ending early in a small amber tick and one long line glowing faint gold, as the camera drifts slowly upward along the climbing ranks of commitments. Calm patient accumulation of obligation rather than money. Deep ink-blue field with restrained cream strokes, sparse amber and one gold line, ledger-tidiness mood, uniform crisp pixel strokes, flat game-art rendering, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, dense numbers, camera cuts
duration_s: 6.4
fps: 25
resolution: 704x1216
aspect: 9:16
camera: slow vertical drift
motion-strength: 2/5 — measured line growth
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: Static composition drifting slowly upward along a dark ink-blue pixel-art ledger panel holding a vertical rank of horizontal cream strokes, each anchored at the left edge. One new stroke extends smoothly to full length every beat, in even rhythm, moving bottom to top with the camera; among them exactly one stroke carries a small amber end tick and one longer stroke burns faint gold. No cuts, no wobble. Restrained ink-blue and cream palette, one amber and one gold accent, the serenity of correct bookkeeping, strokes stay perfectly straight and evenly spaced, no digits or glyphs ever form, only line-extension moves.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, wavy lines, clutter, camera shake
duration_s: 6.4
fps: 24
resolution: 704x1216
aspect: 9:16
camera: slow vertical drift
motion-strength: 2/5 — measured line growth
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

### V4 — Both panes, one beam (the unifying shot)
```text
META
camera: slow crane-back wide
loopable: yes
seed-suggestion: 16044
text_zones: none

LTX-VIDEO
prompt: The two separated pixel-art panes, coins glowing gold on the left and ink-blue ledger lines resting on the right, sit far apart on one dark wall while a single slow overhead lamp beam sweeps evenly between them, brightening the coins as it swings left and igniting each ledger stroke it passes on the right, the pendulum rhythm continuous and unhurried with no start or finish while the camera cranes back to a symmetrical wide of the pair. Warm gold and cool ink-blue alternating under one practical light, reconciliation-as-scheduler mood, desaturated wall, crisp pixel silhouettes, flat game-art rendering, seamless loop, no photorealism.
negative: worst quality, inconsistent motion, blurry, jittery, distorted, watermarks, text, letters, numbers, captions, logos, flickering, morphing shapes, photorealistic, panes moving, camera cuts
duration_s: 7.7
fps: 25
resolution: 1216x704
aspect: 16:9
camera: slow crane-back
motion-strength: 2/5 — swinging beam
cfg: 3.0 (official range 3.0-3.5; distilled ckpts: N/A)
steps_hint: 20-30 draft / 40 final (8 on distilled)

WAN 2.2
prompt: A symmetrical wide of a dark pixel-art wall carrying exactly two display panes with a deliberate empty gap between them: left pane full of stacked gold coins, right pane full of even ink-blue ledger strokes. One overhead pendulum lamp swings in a slow constant cycle, its beam sweeping left to right alternately lighting coins then catching each ledger line in sequence; camera performs one very slow crane-back then holds, the swing continuing seamlessly for a loop. Dual-palette composition of gold versus ink-blue under warm practical light, contemplative bookkeeping mood, crisp pixel geometry, panes stay frozen, only the beam and its pool travel.
negative: worst quality, low quality, JPEG compression residue, blurry details, subtitles, text, letters, numbers, captions, watermark, logos, deformed, disfigured, extra fingers, poorly drawn hands, poorly drawn faces, fused fingers, messy background, many people in the background, walking backwards, photorealistic, flickering lamp, panes sliding
duration_s: 8.0
fps: 24
resolution: 1216x704
aspect: 16:9
camera: slow crane-back
motion-strength: 2/5 — swinging beam
cfg: 4.0 (dev range 3.0-5.0; at CFG=1 distilled, negative is ignored — tune per model card)
steps_hint: 20-40 (4-8 on Lightning-style distilled)
```

**PICK CRITERIA:** V1 is the explainer thumbnail (label the panes in post at the reserved gaps); V2/V3 are the cutaway pair — they must share identical drift speed to splice; V4 is the loopable gallery piece and family closer.
