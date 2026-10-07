# Power chain objects — PDU, UPS, ATS, genset

<!-- spec: hosting_game.md §8.4 (PDU = vertical strip with digit display and amp bar filling toward
     a red derate line; UPS = battery bank with charge bar and on-battery drain state; ATS = heavy
     box, two inputs one output, relay clack; generator = outside, fuel gauge, exhaust when running,
     crank-cough-settle), §8.4 Generator Lighting Shift (utility white → dim cool emergency →
     warm genset — exact colour-temperature story per state), §8.2 (power = copper #C97A45, never
     gold; breaker trip = branch goes dark downstream) -->

The copper circulatory system's organs, in chain order: utility → ATS → UPS → PDU → machine. Each
object shows its state on its own body (the game's diegetic rule) — amps, charge, feed — with
displays kept BLANK of numerals (digits are in-engine). The genset lives outside, in weather.

### V1 — PDU and RPP strip pair

```
POSITIVE: sprite sheet on a flat solid magenta #FF00FF background, 32-bit isometric pixel-art game
assets, two objects shown side by side: (1) a vertical rack power distribution unit — a slim tall matte black strip studded with a
column of recessed socket outlets, a narrow dark display window near its top (blank, unlit, no
digits) and below it a thin horizontal ampere bar meter mostly filled calm green (hex #4FC46A)
tapering toward a clearly printed-looking but blank red derate zone at its right end, one small
amber pinprick warning LED (hex #F2B133); (2) a rack power panel box — a squarer steel distribution
unit with a row of heavy breaker toggles all thrown up-on, two thick copper-toned cable glands at
its base where feeder cables land with visible weight, a small blank plaque field and one green pin;
both objects share black steel and copper-collar materials, copper hue reserved for their power
fittings (hex #C97A45), hard readable silhouettes at 24px, LED points tiny with no bloom, one-pixel
outlines, even front lighting, crisp pixels, generous gap, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, digits, watermark, photorealism, glowing meters, sci-fi displays, rainbow,
frayed wires, open panels, brand markings, sockets with plugs in them
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 3; the amp bar's green-to-red-zone gradient must be legible in greyscale by
position along the bar — the derate line is a position story, not a colour story
```

### V2 — the UPS and its battery bank

```
POSITIVE: isometric pixel-art diorama fragment on a flat solid magenta #FF00FF background, 32-bit
iso game style: a large uninterruptible power supply cabinet — a floor-standing dark grey steel
tower with a tall narrow blank display window at eye height (unlit, no digits), a row of three
status pinpricks beneath it, heavy vent louvres across its lower half — standing bolted beside two
open-frame battery shelves: rows of squat sealed battery blocks in muted putty cases with copper
terminals linked by short thick straps, arranged in tidy two-high runs on wire shelving, one shelf
corner showing a small green pinprick on the UPS telling "on utility" while a second ghosted
treatment of the same UPS beside it shows the ON-BATTERY posture — its display window faintly lit a
dim cool emergency blue-white, its three status pins rearranged to two steady and one slow amber
pulse-look, the whole unit reading slightly darker and tenser, as if the room lights dropped; hard
silhouettes, desaturated industrial palette, copper used for terminals and busbars only, LED points
under two percent, crisp pixels, the pair lit to contrast utility-brightness against battery-dim,
no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, digits, watermark, photorealism, acid batteries, leaking fluid, sparks, electrical
arcs, neon glow, bright saturated blue flood, consumer UPS brick, rack context
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; judge the utility-vs-battery pair SIDE BY SIDE — the mood drop must be
readable as lighting temperature and display state, the game's most tense-looking transition
```

### V3 — the automatic transfer switch box

```
POSITIVE: single isometric pixel-art object on a flat solid magenta #FF00FF background, 32-bit iso
game style: an automatic transfer switch — a heavy squat armco box in dark industrial grey, visibly
more massive than any server of its size, its front dominated by a big recessed handle position
indicator with two blank position fields and a central dark window (no digits), flanked by two
small pinprick lamps, one calm green (hex #4FC46A) one dark; the telling detail is its CABLES: two
separate thick feeder conduits land into its top from different directions — two incoming power
worlds — and one single even thicker conduit leaves its bottom, the 2-in-1-out anatomy drawn so
plainly a player instantly understands the decision this box makes; a heavy copper busbar glance
visible at one open side seam, four frame bolts at corners, a small ventilation grille, faint dust
on top, painted surface slightly chip-marked at a corner from a forklift long ago; hard readable
silhouette, desaturated steel with copper accents (hex #C97A45), zero glow, crisp pixels, even dim
utility-room lighting, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, digits, watermark, photorealism, transformers with cooling fins, arcing electricity,
warning stripes everywhere, open live panels, glow eyes, sci-fi cladding
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 3; the two-in-one-out conduit anatomy must be nameable from silhouette alone —
that geometry IS the mechanic
```

### V4 — the generator yard (outside, in weather)

```
POSITIVE: isometric pixel-art exterior diorama piece on a flat solid magenta #FF00FF background,
32-bit iso game style: a diesel generator set sitting on a concrete pad outdoors — a long
enclosed canopy box in muted industrial green-grey with louvred vent bands along both sides, a
vertical exhaust stack at one end releasing a thin honest plume of warm-grey exhaust that drifts
sideways in the wind, a round analog fuel gauge mounted on the pad fence showing a full-ish needle
sweep (blank face, no digits), a low chain-link fence section with a padlocked gate, a yellow-
faded but BLANK placard panel on the fence, and beside the pad a section of buried fuel line
suggested by two ground pipes vanishing under concrete; the generator wears a faint overall warm
tint on its metal consistent with the game's genset-lighting convention — the light in this corner
of the world is slightly warmer here; a few dead leaves collected at the fence base, pale sky
suggestion through the magenta-free margins, hard silhouette, desaturated palette, crisp pixels,
overcast even lighting, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, fire, black smoke billows, industrial
disaster mood, power plant scenery, people, trucks, bright safety yellow, blue sky gradients
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; the exhaust plume direction + warm-tint corner are the graded cues — the
genset is a WEATHER object, it must look outdoors even off its magenta
```

---

**PICK CRITERIA:** all displays ship blank (digits in-engine); copper #C97A45 never gold #E8B23C
anywhere on power hardware (Hue Ledger separation is a spec law); utility/battery/genset moods
readable as LIGHTING temperature pairs (§8.4 Generator Lighting Shift), each pair greyscale-safe by
display-state + pose.
