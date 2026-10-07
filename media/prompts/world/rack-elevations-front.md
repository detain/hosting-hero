# Rack elevations — front (the public face)

<!-- spec: hosting_game.md §8.4 (rack = vertical frame with visible U-slots; front = tidy faceplates,
     LEDs, labels, bezels; rack as progress bar; full rack looks dense and alive), §8.2 (Zero-State:
     empty U slots show rails, threaded holes and cable-arm stubs lit from above as invitation;
     LED grammar; blanking panels), §8.10 (density signature identifies a line from a thumbnail) -->

Dead-on 2D elevation views of the rack FRONT — the flat public face the game renders at Z2 (Rack
Elevation altitude). A rack is the game's progress bar: you should be able to read "how full is
this" from across the room. Faceplates are tidy black/steel/beige with LED rows; every lit state
obeys the heartbeat grammar — tiny points, never glows. Empty U space is an invitation, not a
hole: bare rails with visible screw holes.

### V1 — the full rack (dense and alive)

```
POSITIVE: straight-on 2D front elevation of one tall server rack as pixel game art, 32-bit iso-
pixel-art discipline with hard readable silhouette, on a flat solid magenta #FF00FF background: a
slender black steel frame with visible mounting rails holding a dense wall of stacked 1U and 2U
units — matte black, dark grey and a few aged beige faceplates, mixed bezel styles suggesting
different vendors and vintages; each unit carries its own tiny detail row: horizontal drive-carrier
slots, one or two ventilation grilles, a Velcro strap or cable comb clipped at an edge; scattered
across the face are dozens of pinprick status LEDs, mostly slow-breathing green (hex #4FC46A) with
three or four amber (hex #F2B133) and a single red (hex #E23B3B) fault light, all kept as two-pixel
points of light with no bloom, exactly like real rack hardware at night; blanking panels fill every
gap as plain matte rectangles; a blank rectangular nameplate plate bolted near the top with an
empty field; subtle top-down room lighting with soft inner shadows under bezels, crisp pixels,
matte plastic and steel, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, brand logos, watermark, photorealism, glowing beams, blue light
wash, clean identical servers, sci-fi panels, glass doors, cables visible across the front, rack
doors closed
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; apply the Thumbnail Test at 128px — the density of LED points should read as
"full and busy" before any single server is discernible
```

### V2 — the half-built rack (progress bar mid-game)

```
POSITIVE: straight-on 2D front elevation of one tall black server rack half filled, pixel-art game
asset on a flat solid magenta #FF00FF background, 32-bit iso-pixel discipline: bottom two thirds
occupied by a few chunky units — a 2U appliance with a distinctive rounded bezel and sparse lights,
a stack of identical beige-and-grey 1U servers with green LED pinpricks (hex #4FC46A), one blank
patchwork of empty U slots in the middle showing bare metal rails with visible threaded screw holes
and dark rectangular cavities, lit softly from above like invited space; top third completely empty
rails and holes, the vertical rhythm of mounting screws clearly readable; cable-arm stubs peeking at
one side edge; the whole object reads as a glass half full — potential above, work below; matte
steel, one-pixel rim highlights, no glow, crisp pixels, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, watermark, photorealism, messy cables hanging, dust, dark dead equipment, fully
packed rack, neon accents, glass front door
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; pick by how badly you want to fill the empty Us — the Zero-State Art
invitation is the entire purpose of this asset
```

### V3 — the LED state row study

```
POSITIVE: straight-on 2D detail elevation of a short stack of six server faceplates filling the
frame, pixel-art game asset on a flat solid magenta #FF00FF background, 32-bit iso-pixel style,
each faceplate teaching one state of the game's LED grammar through its small light pattern alone:
(1) idle — a single steady calm green dot, (2) busy — a tight row of greens in varied states like
a flicker caught mid-beat, (3) degraded — one steady amber dot while its neighbours stay green, (4)
predicted failure — one slow-blinking amber drawn as a half-lit dot with a tiny dim afterglow tail,
(5) failed — dark faceplate with one hard red dot (hex #E23B3B) and everything else unlit, (6)
unpowered — entirely dark, the scariest faceplate, no LEDs, no backlight, dead plastic; bodies are
repeating matte black and grey chassis with drive slots and vents, differences ONLY in the light
language; all LEDs kept as pinpoint two-pixel dots, zero bloom, greyscale test resolved by
lit/unlit COUNT and position rather than colour, crisp pixels, even dim front lighting, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, glowing auras around LEDs, rainbow LED colours,
screens on faceplates, cables, damage, smoke
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; blind-greyscale sort test: a viewer must order healthy-to-dead from light
positions alone
```

### V4 — density signature family (four racks, four lines)

```
POSITIVE: row of four straight-on 2D front rack elevations side by side on a flat solid magenta
#FF00FF background, 32-bit iso-pixel-art, same frame geometry on all four so only the FILL
DENSITY and unit character differ, demonstrating four business-line silhouettes at a glance: (1) a
CROWDED shared-hosting rack — every U stuffed with mixed old units, a faint warm glow of many tiny
green LEDs, patchwork beige, visually noisy and lived-in; (2) a SPARSE premium dedicated rack —
three big heavy black units with thick bezels and blank bolt-on nameplate fields spaced far apart,
elegance through emptiness; (3) an ABSURDLY OVERPACKED mining shelf — not a real rack at all:
exposed boards stacked on wire shelves, tangled hint of cord at edges, no faceplate discipline,
extreme density; (4) a TALL STILL tape-archive rack — floor-to-beam matte black carriers in perfect
uniform rows, almost no lights, one or two calm green dots, monastic and quiet; all four readable
as different businesses in pure silhouette-density terms at thumbnail size, desaturated palettes,
crisp pixels, even lighting, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, identical racks, neon, glow floods, people, room
background, open doors, cable clutter across faces
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the Two-Screenshot Test distilled — crop each rack alone, shuffle, a viewer
must re-sort them into "crowded / premium / crypto / archive" from density alone
```

---

**PICK CRITERIA:** LED dots ≤2% of frame area, zero bloom (Emissive Allowance §8.2); each
elevation passes the Thumbnail Test at 128px; empty-U regions show rails+holes (Zero-State law) —
a black void instead of invitation = reject.
