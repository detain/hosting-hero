# Business threats — the commercial bestiary

<!-- spec: hosting_game.md §8.5 (business threat catalogue: chargeback, review bomb, churn wave,
     whale concentration pillar, regulator front-door, processor freeze, abuse ladder), §8.2
     (gold=money only, red=final), §8.7 (money rendering: losses fall, gains fly) -->

Threats that attack the P&L instead of the pipe. They share the world's silhouette-first grammar but
their hue discipline differs: money objects wear gold #E8B23C / rust, and where a technical threat
would be magenta, a business threat is often **grey, paper, or institution-coloured** because its
menace is procedural, not hostile — the regulator walks in the FRONT DOOR and cannot be blocked by
any firewall. All receipt/badge/letter objects ship blank — the numbers on them are in-engine text.

### V1 — the reversing coinage (chargeback)

```
POSITIVE: small pixel-art sprite group on a flat solid magenta #FF00FF background, 32-bit iso
pixel style: a stack of three heavy matte gold coins (hex #E8B23C, dark rim shading, one specular
dot each) drawn mid-motion literally sliding BACKWARDS out of a small dark slot-plate as if the
machine is vomiting them up, motion implied by two ghosted after-image outlines trailing the lead
coin forward-to-back; beside them a plain blank paper receipt sprite torn cleanly in half with a
jagged tear line, halves separating, one edge carrying a tiny rust-red tint (losses are rust, never
fault-red); hard readable silhouettes, desaturated surroundings, tiny scale so the whole group fits
a 48px game cell, flat even lighting, crisp pixels, no text, no letters, no numbers, no watermark,
no UI captions
NEGATIVE: text, letters, numbers, currency symbols, watermark, photorealism, shiny bullion cliches,
pile-of-treasure, glow, saturated red, cartoon stars
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 4; pick the frame where the DIRECTION of money (out of the slot, backwards) is
unmistakable in greyscale — that reversal is the whole read
```

### V2 — the whale pillar (concentration risk)

```
POSITIVE: pixel-art diorama sprite on a flat solid magenta #FF00FF background, 32-bit iso style: a
single massive fluted stone-gold pillar, comically oversized compared to the thin humble support
posts around it, holding up a corner of a dark concrete floor slab above — the ceiling weight visibly
pressing down on it; fresh jagged cracks spidering up one third of the shaft, small chips falling
away from the crack line with tiny dust puffs, a faint worried gold shiver drawn as two hairline
offset ghosts of the crack edges; palette: warm muted gold body (hex #E8B23C desaturated two steps),
grey concrete, hard silhouette readable at 24px, one-pixel outline, even dim lighting from above,
crisp pixels, no text, no letters, no watermark, no UI captions
NEGATIVE: text, watermark, photorealism, classical temple scenery, people, dramatic collapse,
rubble field, saturated colours, background environment, ornate capitals
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 4; the pillar must simultaneously read "holding everything up" and "just
started cracking" from silhouette alone — the §8.5 concentration metaphor in one object
```

### V3 — the front-door figure (regulator / auditor)

```
POSITIVE: pixel-art character sprite on a flat solid magenta #FF00FF background, 32-bit iso game
figure — a calm unhurried human figure in a crisp neutral light-grey buttoned coat walking straight at
the camera with perfect upright posture, carrying a flat blank clipboard held to the chest, wearing
a plain blank laminated badge on a lanyard; the figure radiates unbothered authority — no menace
props, no shadows under the eyes, nothing hostile; colour treatment: clean cool neutral livery that
visibly refuses the game's threat palette (deliberately NOT magenta, NOT violet), a thin muted green
check-strip detail on the clipboard edge; hard readable silhouette at 24px, one-pixel dark outline,
matte finishes, even flat lighting, crisp pixels, no text, no letters, no numbers, no watermark, no
UI captions
NEGATIVE: text, letters, watermark, photorealism, police uniform cliches, sunglasses, hostile scowl,
dramatic rim light, red or magenta clothing, cape, ominous fog
size: 1024x1024
aspect: 1:1
style: pixel-art
background: magenta-key
variations: generate 6; correct read is "calm and unstoppable", never "sneaky" or "scary" — reject
any frame that leans villain
```

### V4 — the institution props plate (freeze, ladder, complaints)

```
POSITIVE: sprite sheet of four small flat-vector institutional threat objects on a clean near-black
ink-blue backdrop (hex #14202E), crisp unlit annotation style, uniform strokes: (1) a heavy closed
padlock in cold steel-grey clamped across a horizontal coin slot-plate, three small gold coin shapes
stacked helplessly on the wrong side of it, (2) a slender vertical traffic totem with three stacked
discs, top disc calm green (hex #4FC46A), middle muted amber (hex #F2B133), bottom deep rust — an
escalation ladder with no lights on yet, (3) a leaning unsteady tower of plain blank sealed
envelopes tilting about to topple, drawn with a faint arc suggesting the fall direction, (4) a
single matte-black envelope with a small stark white skull-bones glyph the size of a stamp, tied
shut with a thin copper thread; all objects hard-silhouetted, desaturated except the disc colors,
generous gaps, no gradients, no text, no letters, no numbers, no watermark, no UI captions
NEGATIVE: text, letters, numbers, watermark, photorealism, glow, gradients, pixel stair-steps,
ransom-note lettering, dramatic lighting, extra glyphs
size: 1536x1024
aspect: 3:2
style: vector
background: scene
variations: generate 3; the black envelope must read ransom in under two seconds WITHOUT any
lettering (Two-Second Rule)
```

---

**PICK CRITERIA:** every object names its threat from silhouette + posture alone in greyscale at
24px (§8.16); regulator reads immune-to-defense by calm neutrality (no hostile hues anywhere on it,
§8.5 front-door law); coin reversal direction readable without motion (§8.7 losses-fall law).
