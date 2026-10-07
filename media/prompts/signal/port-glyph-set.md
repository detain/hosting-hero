# Port glyph set — the four socket grammars

<!-- spec: hosting_game.md §8.4 (connectors: RJ45 trapezoid, SFP slot, kettle plug, console
     circle), §4.2 + gate G4 (four relations data/power/control/trust; socket shape encodes
     relation; dashed identifier rings: data solid, power short-dash, control double-dash, trust
     long-gap dash), Hue Ledger (power=copper #C97A45, control/intent=white, trust=violet #8F5FE8,
     data=cyan-adjacent steel) -->

In Wiring Mode the whole game reduces to: what plugs into what, by shape. Four socket silhouettes —
trapezoid (data), kettle (power), circle (console/control), slot (trust) — each with a matching
plug-side twin and a dashed aura ring that identifies its relation from across the room. These
glyphs appear at Z1 on real faceplates AND as pure schematic marks in Ink-Blue Wiring Mode, so each
category ships in both dresses.

### V1 — schematic sockets, ink-blue wiring dress

```
POSITIVE: flat vector reference plate of four schematic port glyphs in a row on a deep ink-blue
blueprint ground (hex #14202E), each drawn as precise thin bone-white linework like an electrical
symbol: (1) a rounded TRAPEZOID outline with a small notch cut in its lower edge — the modular data
jack shape — surrounded by a SOLID hairline identification ring, (2) a three-pin KETTLE inlet
outline, its slanted bottom two pins unmistakable, surrounded by a short-DASHED ring in warm copper
(hex #C97A45, kept as thin dashes only), (3) a plain open CIRCLE with one tiny keyway tick at its
base — the console port — surrounded by a double-dash ring in pure white, (4) a narrow vertical
SLOT with a chamfered top corner and an internal contact tooth — the trust interface — surrounded
by a long-gap dashed ring in restrained violet (hex #8F5FE8 as thin dashes); all four exactly the
same optical size, uniform hairline weight, no fill, no glow, no perspective, drafting-table calm,
generous even gaps, unmistakable in greyscale because SHAPE and dash-rhythm differ per relation, no
text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, gradient fills, glow, 3D extrusion,
circuit board texture, colour wash, connector brand details, screws, shadows
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 3; the four dash rhythms must remain distinguishable at 16px — that aura ring
is a gameplay-critical read, not decoration
```

### V2 — physical faceplate ports, pixel diorama dress

```
POSITIVE: sprite sheet of four tiny pixel-art hardware connectors seen straight-on as mounted on a
dark matte server faceplate fragment, 32-bit iso pixel-art, each port on its own small rectangular
brushed-black plate cell against a flat solid magenta #FF00FF background: (1) a moulded plastic
modular jack with its trapezoid silhouette and golden contact pins glinting inside plus one tiny
green link-LED dot (hex #4FC46A) at the corner, (2) a three-hole power inlet in dark grey plastic
with copper-tone internal blades, (3) a round console jack with a metal collar and a single center
pin, (4) a slim vertical security slot with a metal surround and a keyhole-shaped inner cut;
each port casts a 1-2 pixel internal shadow to seat it in its plate, hard readable silhouettes at
24px, desaturated materials — black plastic, brushed steel, gold pins only as two-pixel accents —
crisp pixels, flat even front lighting, wide gutters between cells, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, watermark, photorealism, brand logos on plates, rainbow LEDs, glow bloom,
dusty damaged ports, cables plugged in, background environment
size: 1536x1024
aspect: 3:2
style: pixel-art
background: magenta-key
variations: generate 4; a working sysadmin should name all four from the crop alone — these are
real shapes the game is quoting, fidelity to the physical object is the point
```

### V3 — plug-and-socket pairs with mating hint

```
POSITIVE: flat vector diagram strip on a deep ink-blue background (hex #14202E) showing four
mating pairs in a row, each pair a socket glyph on the left and its plug glyph on the right half-
approached toward it along a thin dotted guide line, drawn in the game's blueprint dress with bone-
white hairlines: trapezoid data jack with its keyed plug head, kettle inlet with its three-pin
moulded plug body, console circle with its round collar connector, trust slot with a thin blade
key-plate; the two compatible halves share one subtle relation cue — data pair edged in muted cyan
hairline (hex #35E0E6), power pair in copper (hex #C97A45), control pair in white, trust pair in
violet (hex #8F5FE8) — each cue kept to a 1px edge so SHAPE carries the match not hue; at the far
right a fifth ghosted cell shows a deliberately mismatched pair — a trapezoid plug hovering over a
kettle socket — rendered with a thin half-toned dashed outline in bone white reading clearly as
"this will not go"; flat unlit drafting style, crisp edges, greyscale-safe, no text, no letters, no
numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, sparks on the mismatch, red X marks,
error symbols, glow, gradients, 3D plastic renders
size: 2048x1024
aspect: 2:1
style: vector
background: scene
variations: generate 3; the mismatch cell must read as refusal with no error color used at all —
the intent layer is white-only, and breaking that here would teach players the wrong law
```

---

**PICK CRITERIA:** relation identifiable from socket shape + dash rhythm with colour fully drained
(Two-Channel Law); the four glyphs stay mutually distinct at 16px (Attachment/Annotation scale
law); physical V2 ports match the real-world objects §8.4 quotes — no invented connector geometry.
