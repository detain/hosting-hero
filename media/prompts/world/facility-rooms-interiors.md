# Facility rooms & interiors — one room, two eras

<!-- spec: hosting_game.md §8.4 (the Window: exactly one per facility, shows weather/time/season;
     loading dock with pallets; meet-me room; cold-aisle breath at Z1; techs in hoodies, space
     heater in the NOC), §8.10 era kits (1990s: yellowing beige plastic, CRT curvature, amber
     monitors, wire shelves, coiled phone cords, fluorescent hum, cigarette burns / 2020s: liquid
     manifolds, dark Grafana wall, ultrawide NOC, drop-ceiling replaced by open plenum), §8.1
     Lighting Model (every room lit by its own equipment), Era Transition law (same room, palette
     and chrome crossfade, old traces REMAIN) -->

Full-scene diorama rooms — no magenta here; these establish line identity and era mood at Z3 and
for loading screens. The centerpiece discipline: the SAME room drawn twice. 1998 = amber-CRT nook,
0px radii everywhere, putty plastic, beige Cat5, fluorescent buzz-warmth. 2026 = cyan-grotesk hall,
soft 12px geometry, liquid cooling plumbing, dark glass wall of dashboards. Old cables and stickers
survive the transition — the 2026 room should hide one beige relic.

### V1 — the NOC, 1998 (amber era room)

```
POSITIVE: isometric pixel-art interior diorama of a tiny 1998 network operations center room, 32-bit
iso style, warm unglamorous scene: a low drop-tile ceiling with one buzzing fluorescent panel
casting flat warm light, walls of pale institutional beige with a scuffed skirting; two heavy cream
CRT monitors on a wobbly wire-shelf desk, screens glowing plain amber text-mode blocks with no
readable characters, one monitor tipped showing a simple dithered blue world map; a bulky keyboard,
a ball mouse on a coaster, a cold coffee mug, a landline phone with coiled cord against the wall
jack; a pegboard with keys and one carabiner; a space heater under the desk glowing a modest orange
coil; a swivel chair pushed out mid-exit; in the wall behind, exactly one small grimy WINDOW at
dusk showing faint rain streaks and a parking lot light; a whiteboard covered in abstract marker
scribbles and a taped-up blank flyer; beige cat5 cables running baseboard to a small switch on a
wire shelf, its LEDs tiny green pinpricks; one yellowed sticker residue rectangle on the desk front;
palette of putty, beige, amber (hex #F2B133 glow), warm grey, dusty greens; hard readable shapes,
matte surfaces, crisp pixels, cozy neglected atmosphere, no people, no text, no letters, no numbers,
no watermark, no UI captions
NEGATIVE: text, letters, numbers, readable screens, watermark, photorealism, modern flat screens,
LED strips, cyan glow, clean minimal design, plants, people, cigarettes
size: 2048x1152
aspect: 16:9
style: pixel-art
background: scene
variations: generate 4; judge by NOISE level — a 1998 room should feel 30% cluttered; sterile picks
fail the era kit
```

### V2 — the NOC, 2026 (same room, crossed-over era)

```
POSITIVE: isometric pixel-art interior diorama of the SAME small operations room twenty-eight years
later, 32-bit iso style, seen from a near-identical camera angle so the two era versions pair as one
space transformed: the drop ceiling now open dark plenum with tidy cable management and soft indirect
light lines; the wall holds one very wide dark glass dashboard wall glowing calm cyan (hex
#35E0E6) charts drawn as pure abstract curves and bars, no readable labels, plus two slim monitors
on articulating arms; a standing desk with a low-profile keyboard, a noise-cancelling headset on a
hook, a refillable water bottle; the wire shelf replaced by a small rack cabinet with a glass door
showing dense tidy black units and rows of tiny green pinprick LEDs; the old window is bigger now,
triple-glazed, showing the same parking lot but with an EV and clearer sky; the floor shows faint
ghost rectangle where the old carpet was, and one beige Cat5 stub still capped and alive at the base-
board — the archaeology the era transition preserves; palette of charcoal, deep blue-black surfaces
(hex #0D131C family), soft cyan accents, warm wood one accent panel; hard readable shapes, matte and
one-gloss mix, crisp pixels, calm competent atmosphere, no people, no text, no letters, no numbers,
no watermark, no UI captions
NEGATIVE: text, letters, numbers, readable dashboards, watermark, photorealism, neon cyberpunk
flood, purple haze, retro beige domination, clutter, cables on floor, people
size: 2048x1152
aspect: 16:9
style: pixel-art
background: scene
variations: generate 4; the test is the PAIR: put V1's pick and V2's pick side by side — a viewer
must believe it is the same room across time, window position included
```

### V3 — the meet-me room (cross-connect cathedral)

```
POSITIVE: isometric pixel-art diorama of a small telecom meet-me room, 32-bit iso game style: a
concrete-walled windowless chamber lit by cool even ceiling light, its far wall lined floor-to-head
with cross-connect patch panels in dark frames — dense honeycombs of small ports, each with a two-
pinprick glow, neat pale aqua fibre jumpers swept from the panels into overhead ladder racking in
thick orange-bundled runs that leave through a wall sleeve; one heavy fire-rated door with a push
bar and a small blank access-badge reader plate; a floor conduit stub where carrier feeds enter
through a sealed wall penetration with putty and a blank tag card; a single rolling tool cart and a
coiled spare fibre reel against the wall like a life-ring; the room's mood is quiet money — this is
where revenue crosses streets; palette: concrete grey, steel, dark panel frames, aqua and restrained
orange fibre (desaturated), tiny green LED fields; hard geometry, matte surfaces, crisp pixels, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, server racks full room, glowing cable
beams, blue neon, messy tangles, people, cables lying on floor, dramatic shadows
size: 1536x1024
aspect: 3:2
style: pixel-art
background: scene
variations: generate 3; overhead fibre bundle density is the wealth signal — too tidy reads empty,
too wild reads outages
```

### V4 — the loading dock (where the building eats)

```
POSITIVE: isometric pixel-art diorama of a datacenter loading dock bay, 32-bit iso game style: a
roll-up door half open onto a concrete apron, dusk weather visible beyond it and a hint of rain-
slick ground; inside, a pallet stack of three plain brown cartons with blank shipping-label
rectangles, a hand pallet jack parked, a floor scale with blank display, and one server crate —
anti-static silver bag corner peeking from an open box, foam blocks, a strap coil; on the wall a
dented bumper rail, a blank placard board with one taped-up blank page, ring of hooks with carabiners
and a coil of orange lifting strap; a strip of daylight raking across the floor from the open door,
dust motes suggested by three tiny lighter pixels in the beam; the door frame wears a scar of old
forklift scuffs; palette: concrete greys, safety-painted lines faded to putty-yellow, brown
cardboard, silver anti-static sheen used once, weather-cool dusk blues outside against warm sodium
hint inside; hard readable silhouettes, matte, crisp pixels, no people, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, readable labels, watermark, photorealism, forklift in motion,
workers, clipart boxes, perfect tidiness, bright safety yellow flood, warehouse shelves background
size: 1536x1024
aspect: 3:2
style: pixel-art
background: scene
variations: generate 3; the open server crate is the hero — the moment hardware becomes room, it
should sit exactly where the light strip lands
```

---

**PICK CRITERIA:** V1+V2 must pass as the SAME room (window/plumbing positions held — era crossfade
law §8.10); at least one surviving-era-relic detail in V2 (old cables REMAIN); each room lit by its
own equipment with the window carrying weather (§8.4 The Window: exactly one).
