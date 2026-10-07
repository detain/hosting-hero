# Server blades & form factors — the unit family

<!-- spec: hosting_game.md §8.4 (object shapes: 1U pizza box, 2U with visible bays, 4U storage =
     wall of carriers, blade chassis = grid of slots, GPU node = deep loud glowing finned heatsink +
     coolant + wrist-thick power cable, appliance = fixed box with its own bezel discipline),
     §8.10 (VPS = translucent nested containers; managed-WP plugin modules; 2000s era kits) -->

The individual machines that fill racks — authored as a family with shared silhouette DNA so a
player's eye groups them instantly, but with form-factor shapes distinct at 24px (Silhouette Sheet:
no two family members confusable). Object grammar reminder (§8.4): silhouette=family,
faceplate=model, lights=NOW, rim=upgrade tier, grime=age.

### V1 — form-factor family sheet

```
POSITIVE: sprite sheet of five isometric pixel-art server form factors in a row on a flat solid
magenta #FF00FF background, 32-bit iso-pixel game style, all sharing one materials family — matte
black, dark grey steel, a touch of aged beige — each a different box silhouette instantly
distinguishable in pure outline: (1) a slim 1U slab, shallow, a horizontal row of tiny drive-carrier
LED pinpricks along its front edge and a single power dot, the classic pizza box; (2) a chunkier 2U
unit with two clearly visible large drive bays and a vent grille; (3) a tall 4U storage chassis that
is basically a WALL of small identical carriers stacked in a tight grid, hundreds of tooth-width
slots; (4) a blade chassis — a wide shallow frame holding eight vertical thin blades side by side
like books on a shelf, each blade with its own two pinprick lights; (5) a stubby dedicated appliance
box with a distinctive rounded-rectangle bezel face and only two lights total, purposeful and
sealed; one or two units carry a faint upgrade-rim accent — a thin brighter steel edging — the
game's tier cue; hard readable silhouettes, desaturated palette, LED points tiny with no bloom,
crisp pixels, even front-side lighting, generous gaps, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, brand logos, watermark, photorealism, rack cabinet, cables
attached, glow, sci-fi panel lines, rainbow LEDs, open chassis internals
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; run the §8.16 family test — shuffle the five crops, a viewer must sort
1U/2U/4U/blade/appliance from outline alone at 24px
```

### V2 — the GPU node (expensive and slightly dangerous)

```
POSITIVE: isometric pixel-art game sprite of a single deep GPU compute node pulled slightly forward
out of frame context, on a flat solid magenta #FF00FF background, 32-bit iso-pixel style: a heavy
long chassis, darker and denser than ordinary servers, its top surface dominated by a thick finned
heatsink field — repeated vertical cooling fins in gunmetal — and two slim liquid-coolant lines in
muted teal-grey running along its spine into quick-disconnect fittings at the rear; one absurdly
THICK power cable, wrist-width, black with a copper-toned collar, slung off the back corner with
visible weight-sag, clearly feeding serious amperage; a small cluster of tight amber-orange status
pinpricks (heat-adjacent hues, kept as 2px points) instead of the usual calm greens, and a subtle
wavy heat-shimmer distortion over just the fin area; the whole silhouette should read "this box
costs more than the room" — dense, deep, slightly menacing; matte metal, one gloss accent on the
coolant fittings, hard readable outline, crisp pixels, dim directional top light, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, glowing gamer-RGB, neon underglow, exposed GPUs with fan
logos, fire, heavy orange flood, server rack context, tidy thin cables, consumer PC look
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; the thick cable's visible SAG is the money detail — reject picks where it
looks like a normal cord
```

### V3 — the translucent stack (virtualisation made visible)

```
POSITIVE: isometric pixel-art concept sprite on a flat solid magenta #FF00FF background, 32-bit iso,
the subject being a single 2U server chassis rendered in dark matte steel, but drawn as a cutaway GLASS
specimen — its body is a translucent cool blue-grey shell — and INSIDE it float three smaller
glowing container boxes stacked loosely like nested shipping crates, each inner container a softly
lit translucent cell in a slightly different muted tint (pale teal, pale slate, pale periwinkle),
each holding a tiny cluster of bright mote-dots like occupants; one of the inner containers presses
visibly AGAINST another, overlapping translucent volumes bulging into shared space, with a hairline
stress-glow at the overlap — the noisy-neighbour and overcommit idea in one image; the outer chassis
keeps real hardware cues: vent grille, two pinprick LEDs, screw heads at corners; clean
architectural-diagram feeling inside a pixel-art object, hard silhouettes, desaturated outside /
gentle glow allowed only inside the nested volumes, crisp pixels, even lighting, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, cartoon ghosts, magic crystals, bright neon, clouds,
gears, circuit boards, motherboards detail, explosion, red alarm glow
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 4; the overlap-press must read as TENSION not decoration — that bulge is the
game's overcommit tell
```

### V4 — era pair: 2001 pizza box vs 2026 blade

```
POSITIVE: side-by-side pair of single isometric pixel-art server units on a flat solid magenta
#FF00FF background, 32-bit iso style, same footprint scale, two eras of the same object family:
LEFT, an early-2000s 1U pizza box — creamy putty-beige faceplate yellowed slightly with age, chunky
bezel with a recessed handle, a small cluster of BLUE pinprick LEDs (era-signature blue), a round
power button, visible screws, a fabric cable strap, boxy joints; RIGHT, a modern 2026 thin blade —
near-black matte steel, razor-tight tolerances, tool-less latch clips, a dense row of tiny white-
green LED pinpricks behind a mesh grille, one thin teal coolant micro-line at its edge, hard
minimal silhouette; a faint shared family feature — the same carrier-slot rhythm — links them across
two decades; both with one-pixel outlines, matte finishes, LED points under two percent of area,
even front lighting, crisp pixels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, brand emblems, rack context, glow bloom, rainbow, dusty
damage, cables hanging, bent metal
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; judge by the era tell ONLY — beige+blue-LED vs black+mesh+coolant; if you
need a caption to tell which is older, the pair failed
```

---

**PICK CRITERIA:** five form factors mutually unconfusable at 24px silhouette (§8.16); GPU node's
thick-cable sag and fin shimmer survive greyscale; era pair passes the Two-Screenshot Test as a
decade jump with identical layout grammar (§8.10 Transition law).
