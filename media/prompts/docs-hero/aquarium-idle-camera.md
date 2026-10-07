# The Aquarium — idle camera & boot screen

<!-- spec: hosting_game.md §8.10 (The Aquarium: the idle-camera boot screen — a living scene that
     makes players leave the game open; Trade Radio: the ambient ticker), §8.4 (The Window,
     exactly one, shows weather/time/season/storm), §8.1 Lighting Model (rooms lit by their own
     equipment), §8.2 heartbeat (0.5Hz global pulse), MASTER_REPORT §4.7 (Presentation Catalogue) -->

The game's front door: a single wide establishing diorama the title sits on, where everything hums
in slow synchronized breathing and nothing ever needs the player. The trick is making STASIS feel
alive — weather moving past the one window, traffic motes looping an endless healthy circuit, dust
settling in lamp light, and one or two quiet human-warm details that promise a story without
telling one.

### V1 — the canonical idle hall

```
POSITIVE: wide isometric pixel-art establishing diorama, 32-bit iso game style, the hero shot of
the whole game — a long calm server-hall room seen from a raised corner, generous depth running
away to a far wall: two facing rows of low black server racks with dense tidy LED fields breathing
in synchronized soft pulse, all steady green (hex #4FC46A), between them a cold aisle with pale
mist from perforated tiles hugging the floor, above them cable trays in pale steel carrying orderly
amber-copper and aqua cords with honest sag (hex #C97A45, #35E0E6 desaturated to jacket-mutes);
down the center of the aisle a slow parade of three or four tiny rounded cyan visitor motes drifts
toward a small welcoming service counter stub at the hall's end where a gate structure stands with
grates raised, everything passing; high on the right wall EXACTLY one broad window showing dusk
with faint rain, its parking-light glow the only natural light source, a subtle blue-cool wash
entering from it against the room's warm own-equipment glow; small living details — a hoodie on the
back of an empty chair, a mug on a side cart, a hand pallet jack parked mid-task with one open
crate and foam blocks near the far dock door, a laddered crash cart by a rack with a blank tablet
clipped; the ceiling's drop-tile grid catching faint reflections; palette strictly muted world
materials — concrete, steel, black plastic, warm putty — with saturated colour ONLY in the small
LED points and the flowing motes, total lit points well under five percent of frame, everything
else matte; deep atmospheric calm, quiet competence, the room you trust your company to; hard
readable silhouettes at every scale, crisp pixels, flat even overhead lighting with one warm lamp
pool and one cool window wash, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, human figures standing in scene,
dramatic god-rays, blue neon flood, sci-fi holograms, dust storms, flickering or mismatched LEDs,
red or amber warnings anywhere, clutter, cables on floor, open damaged panels, lens flare, bloom
size: 3072x1536
aspect: 2:1
style: pixel-art
background: scene
variations: generate 6; pick by STASIS-ALIVE balance — if it looks like a screenshot of a paused
simulation it wins, if it looks like a poster it loses; motes must be few enough to individually
follow
```

### V2 — weather-shifted variant (storm passing)

```
POSITIVE: the identical wide isometric pixel-art server-hall diorama composition as its calm
sibling, 32-bit iso game style, same two rack rows, same aisle with three cyan mote travellers,
same counter and raised grate, same dock corner with its open crate — but caught during a thunder-
storm passing outside the single high window, which now shows a sheet of diagonal rain and a
distant fork of lightning frozen mid-branch in bruised clouds; the room RESPONDS honestly to the
weather the way the game's world does: the green LED fields all dip a subtle half-step in unison
toward the heartbeat's low breath, every tiny status point pulling slightly darker together, while
a faint window-flash cool blue rim (just one pixel thick) edges the racks nearest the glass, and
one small overhead lamp flickers just off-heartbeat, its after-glow trailing, the single desync the
room allows; cold-aisle mist lies a touch thicker, pooling past the tiles' borders; a forgotten
umbrella stands dripping by the dock door, one small puddle beginning; the atmosphere is the game's
quiet promise that the building knows what the sky is doing even while everything inside stays
calmly correct; palette as the sibling, storm-cools entering only through the window's cast,
matte surfaces everywhere, hard silhouettes, crisp pixels, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, watermark, photorealism, power failure, dark hall, alarms, red lights, people,
flooded room, rain indoors, dramatic lightning bolts inside, sparks, panic, saturated storm blues
washing the whole frame
size: 3072x1536
aspect: 2:1
style: pixel-art
background: scene
variations: generate 4; graded on ONE property — the dip must be in the heartbeat's LANGUAGE
(unison, small) not a blackout; if the room looks broken, reseed; pair-pick with V1 so they are
provably the same hall at two weathers
```

### V3 — night-shift single human presence

```
POSITIVE: wide isometric pixel-art idle-hall diorama, 32-bit iso game style, the same long hall as
its siblings but at deep night, told with exactly one human — a hooded technician silhouette
kneeling at one low rack with a shoulder lamp casting a single warm pool across the open drawer of
a server, its internals a tidy dark cavity with blank card edges, a screwdriver laid on the tile
and an old mug beside them; every other rack stands breathing green LED fields in synchronized
dim low-pulse (the heartbeat's sleep phase), the aisle's cyan mote-parade now a sparse trickle of
one or two slow travellers, the cold-aisle mist lying heavy across the floor in soft low banks
that the warm lamp pool lights from underneath at its edge; the high window shows only black city
with a distant grid of far lights, no moon, a suggestion of sodium glow at its border; cable trays
above run quietly empty of animation, the crash cart waits by the far rack, dock door shut with
its one scar of old forklift scuff visible in the lamp's reach; mood is the game's most beloved
feeling — the place is alive because someone is caring for it at 3am, quiet devotion without a
trace of urgency; palette: near-black and deep blue-charcoal with the single warm amber lamp pool
(hex #F2B133 as the ONLY saturated light source, everything else cool-matte), green pinpricks kept
small and uniform; hard readable silhouettes with the hooded figure unmistakable at 48px, crisp
pixels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, faces visible, dramatic chiaroscuro, film noir
haze, cat, torch or lantern cliches, phone flashlight, sparks, alarm, open damaged equipment,
security-intrusion cues, silhouettes doing anything sinister
size: 3072x1536
aspect: 2:1
style: pixel-art
background: scene
variations: generate 6; the human must read CAREGIVER in under two seconds — inspect the posture,
reject anything that reads INTRUDER; the amber pool must occupy well under ten percent of frame or
the room's own-lights rule is violated
```

---

**PICK CRITERIA:** pass the two-second rule — in a single glance the frame must read "healthy
place, time of day, weather outside"; LED fields must be visually COUNTABLE, not a texture smear;
one-and-only-one desync per image (the lamp or one flicker), preserving the heartbeat law's alarm
channel (§8.2/§8.4).
