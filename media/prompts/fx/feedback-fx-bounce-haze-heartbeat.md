# Feedback FX — bounce wince, amber haze, heartbeat language

<!-- spec: hosting_game.md §8.6 (bounce: patience ring empties → dissolves to a puff drifting
     BACKWARD off the board FX_BouncePuff, greying, tiny grey mark left on its path — the trail of
     grey marks is the game's best diagnostic; mass bounce = smoke blowing back OUT of your
     building; conversion flourish FX_CoinArc: gold mote arcs to counter, tiny crisp never
     annoying; one-frame white flash = something served), §8.5 (FP flash: blocked legit visitor
     flashes AMBER never magenta), §8.7 (at volume amber ticks become an AMBER HAZE around the
     offending defense visible from Z3), §8.2/rendering code (global 0.5Hz heartbeat: all world
     lights breathe together; the ONLY permitted desync is the alarm channel) -->

The small, constantly-recurring effects — more important to game feel than any catastrophe because
they fire every minute. Discipline: tiny, crisp, never attention-hogging; every effect's DIRECTION
carries its meaning (losses drift backward and fall, gains arc forward and bounce).

### V1 — the bounce wince (patience lost)

```
POSITIVE: four-beat isometric pixel-art effect strip left to right on a flat solid magenta #FF00FF
background, 32-bit iso game style, one small rounded pawn-shaped visitor mote in the act of being
rejected by a service point (a short dark counter stub at the strip's right): BEAT ONE, the pawn
paused at the counter with a visibly THIN near-empty ring of dim light around it, its posture
slumping one notch; BEAT TWO, the dissolve begins — the pawn's outline greying from its edges, body
loosening into soft smoke-detachment, the ring shattering into four fading arc-shards; BEAT THREE,
a small grey puff of the pawn's silhouette drifting BACKWARD away from the counter with two faint
motion-echo ghosts behind it showing the retreat vector, its trailing edge scattering into
dissipating pixels; BEAT FOUR, the puff gone off-frame and one tiny flat grey deposit mark left on
the floor tile where it drifted, plus three smaller earlier marks in a leading line from an earlier
bounce — the diagnostic breadcrumb; all puffs desaturated warm-grey, counter stub plain steel, the
only coldness being absence, hard readable silhouettes, crisp pixels, even dim lighting with the
light visibly LESS at the service point than at the strip start, no text, no letters, no numbers, no
watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, angry explosion at rejection, red
flashes, X marks, smoke demon shapes, ghosts with faces, motion-blur smear, sad cartoon rain clouds
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the BACKWARD drift direction must survive frame-shuffling — a bounce reads
as the world returning an unspent visitor, never as an attack landing
```

### V2 — the amber ledger (false-positive accumulation)

```
POSITIVE: three-panel isometric pixel-art effect study on a flat solid magenta #FF00FF background,
32-bit iso game style, one small dark gate-structure defense object seen from the same angle in a
moral decline told in amber (hex #F2B133, the game's color for your-own-defenses-harming-you):
PANEL ONE, first mistake — the gate holds one tiny crushed rounded visitor-mote shape at its bars
flashing a single amber pip above the impact point, a small innocent amber tick-pip stacked on the
side post, everything else clean; PANEL TWO, habit — five tick-pips in a neat column on the post,
two amber motes pinned at the bars, the gate's own frame beginning to wear a thin amber edge-
haze, its status lamp dimmed under the film; PANEL THREE, the indictment — a twelve-pip column
reaching the post's cap, the gate wrapped in a visible soft translucent amber HAZE ball around the
whole structure, thick enough to blur its details from a distance, three motes caught in the bars
glowing amber inside the fog, and — the crucial honest touch — the gate still mechanically WORKS,
lamps lit, grates up, posture proud, the haze its only confession; world materials stay muted so
only amber speaks, hard silhouettes readable through the haze, crisp pixels, lighting constant
across panels, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, red danger glow, magenta contamination
on this object (magenta means hostile — using it here breaks the game's law), smoke, fire, alarm
sirens, skull marks, damage to the gate
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; test the pip-columns at 48px crop — the count-climb must read as volume;
panel three must look BUSIER at Z3 zoom-out than panels one and two do
```

### V3 — heartbeat and coin arc (the world's pulse and its rewards)

```
POSITIVE: two-part isometric pixel-art effect sheet on a flat solid magenta #FF00FF background,
32-bit iso game style: LEFT part, the 0.5Hz HEARTBEAT language — the same short rack fragment drawn
twice, mid-breath and low-breath, every green status pinprick (hex #4FC46A) on both copies at
IDENTICAL positions but modulated together in brightness — the first copy's LEDs a touch fuller
with tiny soft halos at one pixel only, the second copy's slightly dimmer, all dots in lockstep,
the point being collective calm; and in the rack's shadow a single rogue LED blinking OUT OF PHASE,
drawn with one small offset ghost-dot after-image while its neighbours are in unison, the visible
wrongness the game calls alarm; RIGHT part, the FX_CoinArc family — three gold coin sprites (hex
#E8B23C with dark rims and single highlight dots, no symbols stamped) caught along one clean
parabolic arc rising left to right toward a small dark counter slot, with a fourth coin already
landing with a two-bounce squash hint drawn as two after-images, and beside the arc a tiny burst of
three celebratory motes no bigger than commas — reward rendered miniature and crisp, money MOVING
in discrete arcs never as fill or fountain; hard silhouettes, LED and coin sizes under two percent
of frame, matte everything, crisp pixels, no text, no letters, no numbers, no watermark, no UI
captions
NEGATIVE: text, letters, numbers, currency symbols, watermark, photorealism, coin shower,
treasure sparkle storm, pulsing glow floods, heartbeat ECG lines, rhythm lights, neon, gold
gradient fills
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the rogue LED must be findable in two seconds among in-phase dots (desync-
is-the-alarm-channel law); coin arc must feel TINY and satisfied, not jackpot — reject anything
celebrating
```

---

**PICK CRITERIA:** every direction-law intact in greyscale (bounce drifts backward, coins arc
forward — the game's two-channel grammar of gain vs loss, §8.7); amber never contaminated by
magenta; heartbeat copies differ ONLY in synchronized brightness — any independent animation baked
in per-LED breaks the 0.5Hz global pulse contract.
