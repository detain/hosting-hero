# Rack elevations — back (the truth; canonical two-face law)

<!-- spec: hosting_game.md §8.4 (back of rack = where the truth lives: TWO colours of power cord to
     TWO PDUs, single-corded machine instantly visible as ASYMMETRY, cable arms, velcro vs zip ties,
     fibre bend-radius kinks, discoloured dust filters, PDU mounted over rail screws blocking a U
     forever), MASTER_REPORT §2.2 (two-face back-view law: authored back views are CANONICAL for
     rack-back verbs — verify dual-cord, trace cable, read negotiated speed) -->

The back elevation is not a flipped front — it is a different drawing with different information,
authored as first-class. Redundancy auditing happens by LOOKING here: a correctly dual-corded rack
shows two distinct cord colours flowing to two separate vertical PDUs; a single-corded machine
pokes out of the pattern like a missing tooth. This is the game's most load-bearing art asset:
three of the player's verbs are literally performed by reading this view.

### V1 — the honest dual-cord rack

```
POSITIVE: straight-on 2D back elevation of one tall server rack, dense and truthful, 32-bit iso-
pixel-art game asset on a flat solid magenta #FF00FF background: dark grey chassis rear profiles
with visible heatsink fins, power supply bumps, and small vent cones; two vertical power strips
mounted inside the frame at left and right rails, each fed by its own thick dark cord; from nearly
every unit run PAIRS of power cables in two clearly distinguished desaturated colours — one cord
muted warm amber (hex #C97A45 family), its twin matte black — each pair converging to opposite
strips, combed into tidy vertical bundles with tiny grey velcro strap bands at regular intervals, a
few zip-ties betraying older work; a pale fibre ribbon with small trapezoid ports snakes up the
centre with a gentle bend radius respected at every turn; faint grey dust filters visibly darker
than new at two unit intakes; small green link-LED pinpricks (hex #4FC46A) dotting the ports, no
bloom; the whole image radiates competently-maintained; hard readable cable routes even in
greyscale because routing regularity carries the pattern, crisp pixels, even cool rear lighting, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, rainbow cable mess, neon glow, cables
floating in air with no strain logic, front faceplates visible, tidy-empty rack, loose hanging
sockets
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; audit test: a viewer has three seconds to confirm "everything is dual-
corded" — if that check isn't instant, the bundling rhythm failed
```

### V2 — the single-cord sin (asymmetry teaching frame)

```
POSITIVE: straight-on 2D back elevation of one tall server rack in the same pixel-art family as its
dual-cord sibling, 32-bit iso-pixel-game style on a flat solid magenta #FF00FF background, showing
mostly correct wiring — paired amber-family and black power cords to two side-mounted vertical
power strips — BUT three units betray themselves: one chassis near the middle has only a SINGLE
black cord drooping to one strip while its amber-coloured partner position hangs unconnected with a
small unused socket visible; higher up a second unit's second cord has been unplugged and taped
back against the frame with a strip of pale tape; at the bottom a blind empty cavity where a unit
was removed, its orphan cord still plugged into the strip, coiled like a abandoned leash; the eye
should catch all three anomalies as BROKEN REPETITION in the cable rhythm without any highlights or
markers — the pattern-break is the design; desaturated materials, velcro straps, dust, neat
otherwise, hard silhouettes, crisp pixels, flat even lighting, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, arrows or circles pointing at faults,
glowing warnings, rainbow wiring, dramatic shadows, exploded damage, fire
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 5; pass condition is the redundancy-audit-by-looking test: count the
single-corded machines in five seconds, greyscale, no help
```

### V3 — the messy rack (maintenance debt made visible)

```
POSITIVE: straight-on 2D back elevation of a neglected server rack, 32-bit iso-pixel-art game asset
on a flat solid magenta #FF00FF background: the same frame and chassis family as the tidy racks but
visibly suffering — power cords dumped in a loose spaghetti tangle crossing horizontally in front
of airflow paths instead of combed bundles, a grey dust filter sagging half-detected-dark with
accumulated fuzz, one kinked pale fibre loop bent into a tight painful arc marked at its apex by a
tiny distressed red accent dot of a stress glyph feel (small, quiet, no glow), zip ties cinched too
tight crushing a cable jacket, a vertical power strip bolted over the mounting-rail holes leaving
one unit slot unusable with a blanked-off gap, a loose screw tray and one dangling unlatched
latch, dust gradients thicker near the bottom intake, two units pulled half-forward with their
cable arms swung out like reached arms; every element tells MECHANICAL consequence, not just visual
sloppiness — obscured labels, blocked vents, strained bends; muted greys, browns and dusty
amber-black cords, hard silhouette readability, flat lighting, crisp pixels, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, flames, smoke, sparks, catastrophic damage, cartoon
clutter, bright colours, tidy organisation, before/after split frame
size: 1024x1536
aspect: 2:3
style: pixel-art
background: magenta-key
variations: generate 4; the kinked-fibre and blocked-U are the graded details — reject any frame
where either is invisible at thumbnail scale
```

### V4 — back-view verb close-ups (trace / read / verify kit)

```
POSITIVE: sprite sheet of three zoomed pixel-art detail vignettes on a flat solid magenta #FF00FF
background, 32-bit iso-pixel style, each a tight close-up fragment of rack-back hardware supporting
one player verb: (1) CABLE-TRACE fragment: a single muted-amber power cord entering frame top,
crossing two junction points with subtle over-under weaving, exiting at a specific socket on a dark
chassis — the route drawn as one unbroken continuous path your eye can follow without lifting; (2)
SPEED-READ fragment: a small panel of four trapezoid network ports with their paired link LEDs
lit in three different quiet colours — two calm green pinpricks, one faster amber, one slow pale
— arranged so the difference in light CHARACTER is visible even frozen; (3) VERIFY-DUAL-CORD
fragment: the rear of one chassis showing its two power-supply inlets, one fed with an amber-family
cord and one with a black cord seated firmly, beside a faint ghosted after-image of where a missing
second cord WOULD attach; magnified chunky pixel detail, shallow even lighting, desaturated
materials, crisp edges, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, glow beams, full-rack views, hands or
tools, arrows, UI cursors, highlight boxes
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; these vignettes double as the tutorial's teaching frames — each must
communicate its verb's SUCCESS state with zero annotations
```

---

**PICK CRITERIA:** V1-vs-V2 pair passes the redundancy-audit-by-looking test in ≤5s (§8.4); cable
rhythms survive greyscale (repetition, not hue, carries pattern — Two-Channel Law); no pick may
reuse the front view mirrored (two-face law — back is authored truth, not a flip).
