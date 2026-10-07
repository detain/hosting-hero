# Hero objects — one screenshot-worthy object per line

<!-- spec: hosting_game.md §8.10 Hero Object Rule ("every level has one object worth a screenshot"),
     tape = THE TAPE BALLET (robotic arm moving cartridges, cathedral of tape, cold blue); GPU =
     hot loud dense dark, liquid loops, angry orange glow, cables like arteries; colo = the meter
     wall / ladder racking that glitters with coin-trails; game = dark room, neon accents,
     scoreboard motif, the arena rack; dial-up era = modem banks with sequential lights -->

These are the anchor silhouettes of the Five-Asset Skin Kits — each line's identity object, drawn
larger and richer than normal sprites because it carries a whole business's romanticism. A player
should be able to name the hosting line from a crop of just the hero object (Two-Screenshot Test
applied to single objects).

### V1 — the tape library (cathedral of tape)

```
POSITIVE: isometric pixel-art hero object on a flat solid magenta #FF00FF background, 32-bit iso
game style, the most charming machine in the building: a tall floor-to-chest tape library cabinet in
cold blue-grey steel, its upper half a broad dark glass window revealing a tiny vertical CATHEDRAL
of tape cartridges — hundreds of small rectangular tape bricks in dense honeycomb shelving running
up out of sight — and inside the window a miniature robotic grabber arm caught mid-SWEEP between two
shelf positions, carrying one small cartridge, its rail track visible above, the arm rendered with
delicate pixel choreography, a faint ballet-line motion ghost trailing its path; below the window a
mail-slot cartridge door, a blank dark display strip, one calm green and one patient amber pinprick
LED (hex #4FC46A, #F2B133); frost-cold palette: blue-greys, graphite, the tape bricks a warm putty
contrast seen through glass; the whole object radiates quiet slow-archive devotion, hard readable
silhouette at 48px, matte metal with one glass sheen, crisp pixels, dim cool lighting from above,
no text, no letters, no numbers, no barcode marks, no watermark, no UI captions
NEGATIVE: text, letters, numbers, barcodes, watermark, photorealism, server rack generics, neon,
open shelving, VHS nostalgic cliches, human hands, dust flood, warm room
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; the arm must read as MOVING while frozen — if the cartridge-in-gripper
story isn't instant, reseed; this object is the whole backup line's soul
```

### V2 — the GPU monolith

```
POSITIVE: isometric pixel-art hero object on a flat solid magenta #FF00FF background, 32-bit iso
game style: a singular GPU compute enclosure that dominates its frame — a black monolithic rack-
width column, taller and denser than honest hardware should be, its face a sealed grille behind
which glows an angry warm orange depth (hex #F0862E kept as UNDER-glow through the mesh, a hot
furnace-behind-lattice feeling, never a flood), finned heatsink edges visible at the sides like
gills, twin coolant lines entering at the base with heavy quick-disconnect collars in muted copper
(hex #C97A45) and rising with thick purpose, one wrist-girth power feeder cable landing at its
spine with visible mass-sag; three tiny status pinpricks near its crown, all amber-red, deliberately
few; a small blank steel plaque bolted at eye height with an empty field; the floor tile under it
draws a subtle warm ring tint from radiant heat; palette: obsidian black, gunmetal, hot orange
depth-glow, cold teal coolant lines; hard monumental silhouette, matte body with one mesh texture,
crisp pixels, low dramatic lighting that still respects the 2-percent emissive rule by keeping the
glow INSIDE the grille, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, gamer RGB rings, exposed GPU boards with fan logos, fire,
lava, full-body orange glow, cyberpunk neon grid, smoke, consumer PC windows
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; judge by contained menace — the heat must feel ONE GRILLE AWAY, not on
parade; a monolith you'd route a feeder cable twice to afford
```

### V3 — the meter rack (colo's glittering wall of money)

```
POSITIVE: isometric pixel-art hero object on a flat solid magenta #FF00FF background, 32-bit iso
game style: a cross-connect revenue wall — a full-height patch-panel rack in dark steel frames, its
face a dense grid of small port fields each carrying a tidy pale aqua fibre jumper, every jumper
swept up into overhead ladder racking where they bundle into one thick warm-orange rope of fibre
that arcs across the frame toward a distant wall sleeve; the rack's distinguishing glory: a few
panels carry small analog meter faces with needles — power draw, temperature, port lights — mounted
like hotel minibar gauges, plus tiny blank brass-style nameplates beside port groups; scattered
sparingly along the fibre runs, a handful of micro gold motes (hex #E8B23C, two-pixel coins) are
drawn mid-arc along three cables like the money the circuits secretly are, restrained and charming,
not glitter-storm; overall read: boring patch panel promoted to treasure vault by patient plumbing;
palette: charcoal frames, aqua cords, orange bundle, brass accents, white-grey meter faces; hard
silhouette at 48px, matte metal, crisp pixels, even cool lighting, no text, no letters, no numbers,
no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, coin pile cliches, treasure chest, gold
flood, glowing circuits, switch LEDs everywhere, chaotic cabling, price tags
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; the gold motes must be countable — ≤6 on the whole frame, each on a cable
path; more becomes decoration and breaks both the money law and the charm
```

### V4 — the arena rack (game hosting's shrine)

```
POSITIVE: isometric pixel-art hero object on a flat solid magenta #FF00FF background, 32-bit iso
game style: a single game-server rack presented like an esports shrine in a dark room corner: the
rack itself standard black steel with a tight grid of identical 1U game-server blades, each faceplate
wearing a small distinctive team-style decal shape — abstract shield, banner, and chevron crests
drawn as pure geometry with no lettering — in two or three restrained accent hues (deep teal, dusty
red, muted gold), like servers wearing club shirts; above the rack a wide dark scoreboard slab with
abstract bar and pip standings rows, no readable text, its numbers implied by blank segmented
windows; at the rack's feet a scuff mat, one discarded energy-drink can tipped on its side, cable
arms dressed with small colored bands; the LED fields on the blades flicker mid-beat with rendered
variance — half-lit pinpricks suggesting a live match load; cool-dark palette with neon-adjacent but
DE-saturated accents, faint blue bounce light on the floor only under the scoreboard; hard
silhouette, crisp pixels, moody low lighting with one clean top light on the rack face, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, team logos, watermark, photorealism, gamer chair, RGB flood,
purple-pink haze, monitors with game footage, crowd, stage lights
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; the decal-shapes-doing-team-identity rule is the whole joke of the line —
reject any pick where crests look like brand logos of real organizations
```

---

**PICK CRITERIA:** each object passes Two-Screenshot Test as line-identity alone (crop, shuffle,
name the hosting line); emissive stays inside its own fixture (≤2% rule, §8.2); gold appears only as
countable discrete motes on V3 (money-moves law: gold moves, never fills).
