# Network switches & routers — the passive telemetry objects

<!-- spec: hosting_game.md §8.4 (switch = shallow unit with a dense link-LED strip that flickers
     with traffic — the game's best PASSIVE telemetry object; router = heavier, big optic ports,
     sparse CONFIDENT LEDs; port LED colour encodes negotiated speed — a 10G port showing 1G colour
     is a visible mismatch; half-dead link = pulses one way, none back), §8.7 (the connection-made
     two-beat green handshake) -->

Objects whose FACE is a readout: the switch's LED strip is the closest thing the world has to a
built-in HUD, so these sprites must be authored with disciplined LED grids — rows and columns of
pinpricks whose pattern, colour and phase carry meaning. Router bodies say "authority": heavier,
optic ports, few lights, all certain.

### V1 — the switch family

```
POSITIVE: sprite sheet of three isometric pixel-art network switches of different sizes in a row on
a flat solid magenta #FF00FF background, 32-bit iso-pixel game style: shallow wide dark steel boxes,
matte black front bezels, each dominated by its SIGNATURE FEATURE — one or two full horizontal
strips of tiny paired link-LED pinpricks, dozens of perfectly gridded two-pixel lights in calm
green (hex #4FC46A) with a scattering of darker unlit ports and a few amber (hex #F2B133) ones, the
grid so regular it reads as data rather than decoration; the smallest is a tidy 1U access switch
with one LED row over its port band; the middle is a deeper aggregation switch with twin LED rows
and two larger cage optic slots at its right end glowing faint cyan (hex #35E0E6) from inside; the
largest is a chassis switch with a mesh vent section and a small blank rectangular management
screen, dark and unlit; one switch deliberately shows a SPEED MISMATCH tell — a single port whose
LED sits in a slower amber hue while its whole row runs green, the visible mistake the game wants
players to catch; hard readable silhouettes, LED points kept under two percent of frame area with
zero bloom, desaturated body palette, one-pixel outlines, even front lighting, crisp pixels, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, brand logos, watermark, photorealism, glowing light strips, RGB
gamer lighting, fibre cables plugged everywhere, rack context, screens showing graphs, bent ports
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the mismatch port must be findable in under five seconds in GREYSCALE by
brightness difference alone — pinprick discipline is everything here
```

### V2 — the router and the edge authority boxes

```
POSITIVE: isometric pixel-art sprite pair on a flat solid magenta #FF00FF background, 32-bit iso
game style: (1) a heavy core ROUTER, deeper and taller than a switch, dark gunmetal slab with a
commanding presence, a small field of large optic-port cages across its face, each cage dark and
glassy with one pinprick status light, few LEDs total and every one steady and confident — no
flicker language, this box is sure of itself; two chunky octagonal console ports at its right edge
and a slim blank plaque field above the port band; (2) a smaller edge router in the same family,
shallower, with a single row of optic cages and one amber (hex #F2B133) warning dot among greens,
its posture slightly less monumental; bodies matte steel and black plastic, corner screws visible,
cool grey palette with the cyan hint (hex #35E0E6) only deep inside one lit optic cage; hard
silhouettes distinguishable from switches by WEIGHT and port scale, crisp pixels, one-pixel
outlines, even dim top-front lighting, generous gap between the pair, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, antennas, consumer WiFi styling, blinking chaos, dense LED
fields, cables attached, glow, rounded friendly edges
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; router-vs-switch confusion test at 24px silhouette — the difference must be
proportion and port scale, not added ornaments
```

### V3 — the half-dead link close-up

```
POSITIVE: extreme close-up isometric pixel-art vignette on a flat solid magenta #FF00FF background,
32-bit iso style: two adjacent switch port faces angled toward each other across the frame, joined
by one thin pale fibre cord with a gentle honest sag; the near port's link-LED burns steady calm
green (hex #4FC46A) and a small bright cyan mote (hex #35E0E6) is drawn leaving it down the fibre
with a short tail, while the FAR port's LED is equally steady green yet the fibre beside it carries
one faintly dissolving grey mote dying mid-span and NOTHING arriving — outbound alive, return
dead, the two-green-lies-halft-dead trick the game makes players learn; no warning glyph, no red,
no marker anywhere — the story is told entirely by mote direction and one dissolve; chunky pixel
detail, matte dark bezels, tiny grid texture on the port cages, dim even lighting, crisp pixels, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, red X marks, error icons, arrows, glow, broken
cable, sparks, smoke, disconnected plug
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 5; this is a teaching sprite — if a network-savvy tester cannot name the
failure in three seconds without hints, reseed
```

---

**PICK CRITERIA:** switch LED grids must read as grid-data at Z2 elevation distance (passive
telemetry law §8.4); zero bloom on all points (Emissive Allowance ≤2%); V3 tells its story with no
alarm colors at all — the lie is two steady greens, so any added warning glyph fails the lesson.
