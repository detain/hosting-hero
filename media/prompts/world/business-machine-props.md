# Business machine props — the diegetic accounting desk

<!-- spec: hosting_game.md §8.7 (diegetic business objects: Price Book laminated rate sheet with
     visible strikethroughs; layered cash column — free gold top / deferred amber middle /
     restricted bottom BEHIND BARS; Rolling Reserve cage with diverter; AR spindle of yellowing
     invoices 30/60/90; Backlog dock crates with stencil fields; Pipeline funnel board with dusty
     stalled deal cards; commission gong; ramp staircase of wireframe cabinets; P&L dot-matrix
     printout with peelable sticky addbacks; contract dog-ears green vs red tabs), §8.2 Handmade
     Layer (marker/Dymo/sticky-note material), §8.2 (gold=money; losses rust, never fault-red) -->

The money layer of the world rendered as tactile office machinery and desk objects — props the
camera WALKS to instead of menus it opens. Everything here is handmade-material: paper, laminate,
brass, ink, tape. All numerals on all surfaces ship blank; amounts, ages and dates are in-engine.

### V1 — the cash column and its siblings (money vessels)

```
POSITIVE: sprite sheet of four isometric pixel-art diegetic office-finance objects on a flat solid
magenta #FF00FF background, 32-bit iso game style, tactile desk-machinery materials — painted steel,
glass, brass, paper: (1) the CASH COLUMN — a waist-high clear glass tube on a dark wood plinth
filled like a barber-pole of value: loose bright gold coin motes settled in the top third (hex
#E8B23C), a translucent amber layer pressed under it (hex #F2B133 kept as a milky middle band),
and at the bottom a compartment behind real vertical iron bars holding dim grey-white coins, the
caged restricted money, a tiny padlock hasp on its door; (2) the ROLLING RESERVE CAGE — a small
brass-barred safe-cage on legs under a funnel diverter that is dropping one single gold coin off-
course into it, a ring-shaped track around its top suggesting a waiting period, two old coins
already resting on a trapdoor at its floor; (3) the AR SPINDLE — a desk spike of plain paper
invoices impaled in a leaning fan, the front sheets cream and crisp, the rear sheets visibly
yellowing to brown and soft-cornered with age, one sheet torn free lying face-down, all pages
blank; (4) the PRICE BOOK — a folded laminated rate sheet propped open on a coffee-ring'd desk tile,
its printed rows abstractly struck through in pen on two lines with a fresh handwritten-feeling
block over one, the writing rendered as blank wavy placeholder marks, a ballpoint pen chained to it;
warm office lighting from above, hard readable silhouettes, matte paper and laminate with one brass
gleam, crisp pixels, no text, no letters, no numbers, no currency symbols, no watermark, no UI
captions
NEGATIVE: text, letters, numbers, dollar signs, currency symbols, readable charts, watermark,
photorealism, treasure glow, gold coins spilling everywhere, calculators showing digits, computers
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the cash column's three strata must sort top-to-bottom in greyscale as
bright/mid/dark — that layering is the player's entire cash-vs-restricted literacy
```

### V2 — the funnel board and backlog yard (promise machinery)

```
POSITIVE: sprite sheet of three isometric pixel-art diegetic sales-and-delivery objects on a flat
solid magenta #FF00FF background, 32-bit iso game style: (1) the PIPELINE FUNNEL BOARD — a magnetic
whiteboard on wooden legs with a big painted funnel outline narrowing through its face, small
blank deal-card rectangles at three stages of the funnel, each card bearing an abstract logo blob
and a tiny portrait lozenge, the middle-stage cards collecting a visible soft coat of grey DUST
while the top ones stay clean, and at the board's lower corner a small open bin containing several
crumpled dead cards, one lid half-closed with a peek-inside hinge; (2) the BACKLOG DOCK — a
miniature loading dock diorama, four plain crates in a row on painted floor markings, each bearing
a blank stencilled plaque field, the earliest crate's plaque field edged in a quiet rust-red
approaching-tint while the far crates stay neutral, a pallet jack and one propped clipboard stand;
(3) the RAMP STAIRCASE — three cabinet silhouettes in a rising row where the first is solid matte
black steel with green pinpricks, the second is half-solid — top wireframe ghost, bottom real —
and the third is pure bone-white wireframe outline with a small blank date plaque floating above
it, the empty promise of not-yet-built capacity; all objects hand-painted-property feel, wood,
steel, paper and dust materials, hard readable silhouettes, crisp pixels, even light, no text, no
letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, sales clipart, graphs with arrows,
crowds, glowing whiteboard, conveyor belts, sci-fi holograms, red urgency floods
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the wireframe-to-solid progression of V3 is the graded read — solid /
half / ghost must order themselves in silhouette; dust-on-stalled-cards is V1's pass condition
```

### V3 — the gong, the printout and the contract desk (closing beats)

```
POSITIVE: sprite sheet of four isometric pixel-art office ritual objects on a flat solid magenta
#FF00FF background, 32-bit iso game style, brass-and-paper family: (1) the COMMISSION GONG — a
small bronze table gong on a velvet pad with a padded mallet resting across it, one dented
low-contrast strike-ring drawn as a thin contour, beside it a blank folded card stand holding a
single abstract star token; (2) the P&L PRINTOUT — a long dot-matrix paper statement spilling from
a small beige printer, continuous-feed edges with sprocket-hole rows, its printed content reduced
to abstract grey text-line blocks with one column of numbers rendered as blank tick-marks, three
sticky notes in pale yellow and gold folded onto it at different depths, the top note mid-PEEL
curling back with a paper-highlight edge to reveal a bolder block of print beneath; (3) the
CONTRACT DOG-EAR FOLDER — a thick manila folder standing open with two page-edge tab sets poking
out, the tabs split into two clear groups — one band of muted green tabs (hex #4FC46A) and one of
rust-red tabs — one page corner dog-eared deep, another torn and taped back with a strip of
faded tape; (4) the WRITE-OFF SHREDDER — a modest desktop paper shredder with a half-eaten blank
invoice entering its mouth, curling shredded strips below in the basket, and its little status lamp
burning a satisfied calm green (hex #4FC46A); all hard silhouettes at 24px, desaturated paper and
plastic palette with one brass note, crisp pixels, even warm desk lighting, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, confetti celebration, shredder jam
drama, red alarms, office fire, readable documents, sticky-note writing
size: 2048x1024
aspect: 2:1
style: pixel-art
background: magenta-key
variations: generate 4; the peelable-addback note on V2-printout must clearly reveal something
UNDERNEATH — that peel is the mechanic (sticky notes as UI layer), reject flat-stuck picks
```

---

**PICK CRITERIA:** every numeral-bearing surface ships blank + tick-mark abstraction (labels are
in-engine); cash column strata + ramp wireframe progression + dog-ear tab banding all sort in
pure greyscale (Two-Channel Law); gong/shredder pair passes the Two-Second emotional read
(triumph / quiet elimination).
