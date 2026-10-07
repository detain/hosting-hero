# Docs-Hero — Quarter Close (cash vs profit, two panes)

<!-- spec: hosting_game.md §8.7 money rendering + §4.7 / §9.13 gate-5 legibility, GLOSSARY Quarter Close / Forecast Commit, §6.13 bucket tooltip laws, deferred/restricted strata -->

Cover for ledger legibility: two windows onto one company that disagree on purpose — cash in hand versus profit on paper — at the closing of a quarter. 3 variations.

---

### V1 — The two panes

```
POSITIVE: editorial illustration, isometric diorama DNA, of quarter-close as a scene inside one room split by a mullioned window frame into two luminous panes showing the same company two ways: through the left pane, the cash view — a tall glass cylinder of layered liquid gold with a crisp horizon line partway up its height, the free water-line comfortably below a projected month-end mark, fed by gold coin motes arcing in from a bright cluster of invoice slips on a desk and drained by four thin steady streams that fall out of the frame's bottom edge — power, payroll, transit, licences — each stream's thickness honest to its weight, one stream momentarily thickened into a surge; through the right pane, the profit view of the very same desks and racks — a wide flat wall chart of stacked period columns rising confidently toward the viewer, the current column crowned with a modest but real upward cap, built of translucent committed-revenue blocks and warm ghost overlays where deferred revenue has not yet been allowed to count; the cruel poetry is in the disagreement made visible through both panes at once: the gold cylinder is lower than the rising column promises, because the big month-end payments have not landed while the four falling streams have; a single physical cable of light connects the two panes at their base, the same company under both lights; on the desk between them a small brass gong waits unstruck, an invoice confetti bowl sits tipped and half-full, one failed slip turned red and sliding toward a dark dunning tray; the room itself is matte concrete and steel lit only by its equipment, the two panes the only saturated surfaces; mood: the evening an accountant and a treasurer read the same number differently and both are right; palette gold on one side, ink-blue with amber-green columns on the other, rust for the falling losses, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no axis labels, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, currency symbols, chart labels, dates, watermark, UI captions, photorealism, stock-market ticker energy, casino gold, both panes showing the same shape of truth.
size: 3072x1728
aspect: 16:9
style: editorial-illustration
background: scene
variations: generate 4 — the two panes must depict the same underlying company (same racks silhouettes behind) and disagree in a way the eye can verify: low waterline vs proud columns.
```

### V2 — The strata column at closing hour

```
POSITIVE: editorial macro illustration, isometric diorama DNA, of the balance as one architectural object at the moment of the quarter's last click: a room-height transparent column standing in the center of a dim hall, its interior stratified into three honest bands — the top band bright liquid free-gold sloshing slightly with recent arrivals; the middle band a translucent amber sediment, deferred revenue, visibly present but visibly not-yet-spending, a ghost of the upper liquid pressed into it; the bottom band dark coins behind real bars, the rolling reserve in its cage, a slow ring-shaped timer halo circling the cage at glacial patience; a diverter fork above the column drops one coin in ten sideways into the barred band on its way past; the column stands on a stone plinth beside a printout tree — a dot-matrix statement unspooling onto the floor in long pleats, one pleat covered with sticky note rectangles that a physical hand is peeling away to reveal the plain number-surface beneath; around the base, the quarter's residue: a few fallen desaturated motes where losses hit the floor and stayed, a couple of green coin motes that arrived, turned around, and are walking back out toward an empty customer chair with the posture of an apology; the hall lights itself with standby green points, a distant clock ribbon stretched taut with markers; mood: wealth you can see the composition of; gold amber and bar-shadow grey on steel, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, dollar signs, watermark, UI captions, photorealism, piggy-bank cuteness, treasure pile, uniform gold, glowing magical coins.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — the three strata must read as one column at a glance; the diverter's one-in-ten fork is the detail that proves you read the spec.
```

### V3 — Payday, the four thuds

```
POSITIVE: editorial illustration, isometric diorama DNA, of money-rhythm rather than money-amount: a long counter runs across a quiet facility like a ship's deck, and along it the month's fixed costs are arriving as heavy physical objects dropping into slots with believable weight — four great anchors of an expense landing one after another in a row (power, payroll, rent, licences), each rendered as a dense matte block stamped at its own scale, dents of still-settling dust around the impact points, the counter visibly flexing under the row; between and against them, the smaller income trickle arrives as a bright thin stream of gold motes bouncing along a rail, many tiny arcs converging on a round balance well at the counter's end where the liquid gold surface is being pushed down and up in the same breath; one enormous single coin — this month's whale invoice, clearly the heaviest object in the scene — descends slowly on a visible arc, casting the only shadow in the image, landing with a implied resonant thud that outranks the four anchors; at the far end a tipped scale beam balances burn against earn and leans, barely, honestly; the whole scene lit by the room's own sparse LEDs, cyan service glow in the aisles behind, mood: the monthly heartbeat every founder knows in their chest; palette gold and concrete with rust accents on the expense blocks, hard readable silhouettes, must survive greyscale, no text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: text, letters, numbers, watermark, UI captions, photorealism, calendar icons, paycheck imagery, confetti party mood, many big coins instead of one.
size: 2448x1632
aspect: 3:2
style: editorial-illustration
background: scene
variations: generate 3 — value-as-mass law enforced: exactly one whale coin dwarfs everything; four thud-blocks evenly spaced; greyscale pass.
```

---

**PICK CRITERIA:** gate-5 legibility test: a player must be able to answer "what do I have / when does it arrive / who's late / where did it go" from composition alone; cash-vs-profit disagreement visible in V1; strata in V2; mass-vs-value in V3; greyscale pass.
