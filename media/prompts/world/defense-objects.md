# Defense objects — walls and sieves, never guns

<!-- spec: hosting_game.md §8.7 ("a defense is a wall or a sieve, not a gunboat" — firing is
     INTERCEPTION: rate limiter METERS, WAF INSPECTS with scanning lattice, scrubbing centre
     FILTERS, firewall GATES with slamming grates, honeypot LURES, tarpit SLOWS with amber sink,
     circuit breaker OPENS a physical gap, egress gate REFUSES outward, blackhole SWALLOWS with
     visible collateral; IDS OUTLINES, IPS is the one exception that shoots; off-states and
     mis-tune states must be readable: grates up, valve open, lattice dark with amber tick haze),
     §8.5 Counter Match (defense icon visibly contains the class mark it stops) -->

Player-built infrastructure that acts on traffic IN PLACE. They straddle the lane like municipal
objects — toll booths, sluice gates, storm drains — and their three states (off / metered /
over-tuned) must be distinguishable at a glance because over-tuning harms the player and the game
wants that mistake to be VISIBLE before it is expensive.

### V1 — the gate-and-sieve family straddling a lane

```
POSITIVE: sprite sheet of four isometric pixel-art traffic-control structures, each drawn straddling
an implied horizontal lane with empty pass-through space at its base, on a flat solid magenta
#FF00FF background, 32-bit iso game style, municipal-infrastructure design language, matte painted
steel with two accent hues: (1) a FIREWALL GATE — twin dark piers holding a portcullis of three
heavy horizontal grates caught mid-DROP over the lane, one grate fully down, one raised, the frame
carrying a small blank rule-card slot row; (2) a WAF INSPECTION LATTICE — an open gantry with a
vertical comb of thin scanning bars sweeping across the lane, rendered with faint after-image ghost
lines showing its sweep path, a tiny accept-reject flicker paddle at its side post; (3) a RATE
LIMIT VALVE STATION — a standalone round valve wheel on a short pipe-column astride the lane with a
visible drip-meter tube beside it showing three slow droplet positions mid-fall, the metered flow
made literal; (4) a SCRUBBING CONE — a wide funnel house where a lane enters fat and turbid and
leaves narrow and clean, the entrance wash drawn with murk and the exit with crisp pale cyan (hex
#35E0E6) mote stream, spent grit collected in a small hopbin at the cone's base; all four hard
readable silhouettes at 48px, greyscale-distinct structures, no glow, crisp pixels, even lighting,
generous gaps, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, turrets, cannons, shields with energy fields, laser
emitters, sci-fi force fields, military bunkers, fences filling the lane solid, glowing runes
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; each structure is graded on the verb its SHAPE performs — if the valve
could be mistaken for a pump or the cone for a funnel-hopper with no flow story, reseed that cell
```

### V2 — the lures, sinks and quiet watchers

```
POSITIVE: sprite sheet of four isometric pixel-art defense objects on a flat solid magenta #FF00FF
background, 32-bit iso game style, each embodying a patient trap: (1) a HONEYPOT decoy server — a
single rack unit chassis rendered just slightly TOO shiny, warm gold-adjacent highlight sheen and
an inviting open little door on its front like a mouse-hole with a cartoonishly perfect hinge, its
one LED burning an eager amber (hex #F2B133), the whole object whispering "please connect"; (2) a
TARPIT SLOW-POOL — a shallow sunken basin in the lane filled with thick viscous amber (hex
#F2B133 as a matte syrupy fill with slow drooping strands), three tiny angular threat-shapes caught
to different depths mid-sink, the surface sagging around each; (3) an IDS OUTLINE RIG — a modest
camera-and-frame gantry whose whole body language is observation: a thin viewfinder rectangle
suspended in the lane drawn as a dashed bone-white outline box with corner brackets, marking NOT
striking; (4) an EGRESS ONE-WAY GATE — a stubby turnstile house astride the lane with flap arms
free-swinging INWARD and visibly welded solid OUTWARD, one hinge side decorated with a small blank
'no-exit' shaped plate; palette: dark steel, putty, the amber syrup and eager LED as the loudest
notes, hard readable silhouettes, crisp pixels, even lighting, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, bear traps, spikes, guns, alarms, barbed
wire, honey/bees literalism, glowing cages, red exit signs
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; honeypot must read seductive-not-scammy, tarpit must read SLOW (if the
sinking shapes look like quicksand action, reseed — this object's whole job is viscosity)
```

### V3 — state triptych: off, metered, over-tuned

```
POSITIVE: three-panel pixel-art sprite strip on a flat solid magenta #FF00FF background, 32-bit iso
style, the SAME firewall-gate-and-sieve assembly shown in three operating states left to right above
the same short lane fragment with identical tiny cyan mote traffic (hex #35E0E6) approaching from
the left: LEFT panel, OFF — grates fully raised into their housings, lattice dark and still, valve
wheel wide-open, motes streaming through untouched, the hardware visibly asleep, one status lamp
dark; MIDDLE panel, METED — grates at a working half-height catching exactly the angular magenta-
edged hostile shapes (hex #E04FD8 accents) while every rounded cyan mote passes clean, valve dripping
at a steady lawful rate, structure busy but calm, the correct posture; RIGHT panel, OVER-TUNED —
the same gate now slamming indiscriminately: grates full-drop, two innocent cyan motes visibly
crushed against the bars, and a rising soft amber haze (hex #F2B133, kept as a thin translucent
fill around the device body, the game's self-harm signal) with a small stack of amber tick-pips
accumulating on the gate's side post, the machine quietly hurting the wrong traffic; three states
unmistakable in pure silhouette + composition, hard edges, crisp pixels, consistent lighting across
panels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, explosion on the crushed motes, red alarm floods,
sirens, damage to the gate itself, smoke, different gate designs per panel, arrows or diagrams
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the triptych is the game's FP (false-positive) literacy lesson in one
sprite — the amber haze and the tick-pip stack must be findable in two seconds against the middle
panel's calm
```

---

**PICK CRITERIA:** no defense in this file may resemble a weapon (§8.7 wall-or-sieve law); V3's
three states sort correctly when shown out of order in greyscale — over-tune reads via haze+tick
composition, not colour; each object's icon could later embed its class mark per Counter Match
(§8.5) without redesign.
