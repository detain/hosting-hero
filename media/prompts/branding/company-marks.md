# Company Marks — The Five Reputation Fidelity Tiers (in-game artifacts)

<!-- spec: hosting_game.md §8.10/§9.10 Company Mark generator (player picks glyph from ~24 simple marks — node, rack, wave, arrow, shield, animal — plus wordmark plus MUTED brand color that must not collide with the Hue Ledger; the mark renders at FIVE fidelity levels tied to Reputation: "Comic-Sans-on-paper → clip-art print → a real logotype → embossed on rack doors → etched aluminium and lit"; appears on truck, badge lanyards, placard wall, screenshot watermark, loading screen, score stamp, letterhead, blueprint title block; rebranding costs real money, achieves nothing measurable, everyone feels better). -->

BRANDING family, in-game artifact plates — unlike the promo file, these ARE engine-adjacent assets: the player's company mark at each reputation tier, generated procedurally-in-spirit. Because they must composite onto scenes (lanyards, rack doors, truck doors), tiers 1–3 are authored on the technical magenta key #FF00FF for clean extraction (keying-magenta is a pipeline color, never semantic; tier glyphs themselves may not be magenta-hued). Tiers 4–5 are mounted-in-place plates (embossing needs a surface to exist on). Per the generator's law, all glyph shapes stay ABSTRACT geometry — the model never draws the wordmark; a blank ribbon/plate zone is left in every tier for software typesetting of the real name. Any simple geometric glyph works as the recurring sample mark (drawn consistently: a hexagon-node with three radiating stubs); re-roll prompts swap the glyph, never the tier physics.

---

### V1 — Tier 1: Hand-Stamped Amateur (zero reputation)

```
POSITIVE: in-game artifact render on a flat technical magenta #FF00FF keyed background: a company mark at its most humble stage — a simple geometric hexagon-node glyph with three radiating stubs, cut from stencil card and spray-painted slightly wrong onto a piece of beige paper with curling corner: paint bleed fuzzing one edge, an accidental fingerprint smear in the corner, the stencil's internal bridge-tab left visible inside the glyph, one corner of the paper taped down with scotch tape yellowing. Below the glyph a completely blank hand-cut paper ribbon strip reserved for typesetting — no lettering anywhere. The palette of the mark itself is an earnest but clashing muted green-grey, clearly chosen by a first-time founder with a $2 can of spray paint; ink is not the state colors of any game system. Photoreal macro of papery fiber texture under flat office light, honest amateur energy, zero irony aimed at the founder — this is every company's first plaque and it is dignified in its shabbiness. Single artifact centered, generous magenta margin for clean keying. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: any letters words or numerals, distressed vintage-hipster grain, professional print quality, gradients or bevels applied by design, logo-creator slickness, shadows touching frame edge, multiple artifacts, non-flat background
size: 1536x1536
aspect: 1:1
style: editorial-illustration
background: magenta-key
variations: re-roll swaps the sample glyph for other §8.10 vocab (rack silhouette, wave stroke, arrow head, shield outline, simple animal) keeping tier physics identical; request one variant as a iron-on transfer with bubble blisters and one as a rubber-stamp impression with uneven ink.
```

### V2 — Tier 2: Clip-Art Print Energy (some name locally)

```
POSITIVE: in-game artifact render on a flat technical magenta #FF00FF keyed background: a company mark at clip-art maturity — the same hexagon-node glyph with three radiating stubs now rebuilt as an early-2000s desktop-publishing emblem: solid muted-teal glyph with a heavy black outline, sitting inside a rounded-square sticker with a cheap simulated drop shadow and a single glossy arc highlight painted across the corner like clip-art varnish; edges knife-cut with the tiny overcut of a bargain sticker cutter, one corner lifting to show adhesive shine. Beneath the glyph, a blank gloss ribbon bar reserved for typesetting — no letters anywhere on the sheet. The color is deliberately brand-ish but muted per generator law: dusty teal and grey-amber, explicitly not touching the game's saturated state colors. Photoreal sticker macro on its white release-paper backing fragment included at one corner, flat scanner-ish light, the deep embarrassing confidence of a mark made in fifteen minutes by someone who just discovered shapes.
NEGATIVE: any legible text or letters, word-art or shadow-text effects, rainbow gradients, MS-paint scribbles suggesting amateurism beyond the tier, drop shadows outside the sticker's own design, more than one sticker, keyed background gradients, real brand lookalikes
size: 1536x1536
aspect: 1:1
style: editorial-illustration
background: magenta-key
variations: seed a vinyl-cut variant (matte, no gloss arc, weeding bridges visible) against the sticker variant; tier 2's comedy is specificity of cheap era, so pick whichever dates itself fastest without naming a year.
```

### V3 — Tier 3: A Real Logotype (regionally respected)

```
POSITIVE: in-game artifact render on a flat technical magenta #FF00FF keyed background: the company mark having grown up — the hexagon-node glyph with three radiating stubs resolved into a genuinely confident flat logotype: precise geometry, optically corrected stub weights, one deliberate tension in the counter-space of the hexagon, printed as a two-color spot-ink mark on a warm grey-white card swatch with visible paper tooth: muted deep-slate glyph with a single copper #C97A45 stub accent, the copper used once and exactly, the register of the second ink a half-millimeter proud like real spot printing. Under the mark a blank ink rule reserves the wordmark line — no letters. Flatbed-scan macro texture, deckled card edge at top, neutral daylight. The feeling: an identity designer actually touched this; restraint where tier 2 had gloss; a mark that would not embarrass its own truck. Absolutely no gradient, no bevel, no shadow effects — the growth is in subtraction.
NEGATIVE: any glyphs resembling letters, fake typography, ornamental flourishes, metallic foil effects, mockup scene context (no laptop, no desk sprawl), multiple card stack, drop shadows, watermark
size: 1536x1536
aspect: 1:1
style: editorial-illustration
background: magenta-key
variations: re-roll with glyph rotations of the stub triad (compass rose read vs plug-pin read); A/B against a one-color version — tier 3 candidates must prove they hold without the copper accent, because the truck door gets the budget version.
```

### V4 — Tier 4: Embossed on Rack Doors (national scale)

```
POSITIVE: in-game artifact plate, mounted scene (not keyed): a close three-quarter view of a powder-coated matte-black rack door in a dim machine aisle at isometric-diorama angle, and dead-center of the door the company mark — hexagon-node glyph with three radiating stubs — embossed deep into the sheet metal, raised grain showing crisp press-tool micro-texture against the smooth coat, catching one sweeping highlight from an unseen aisle light; a faint dust film has settled in the emboss's valley around the glyph, proving the mark is original to the door, not applied later. The door's perforation mesh pattern continues under and around the emboss unchanged; one anodised blank nameplate riveted below the glyph, completely empty, reserved for software typesetting. Surround: green #4FC46A rack-LED bokeh far down the aisle, ink-blue #14202E depth, practical light only, no reflections showing readable anything. Mood: fleet-scale permanence — this company's order of racks left a factory with this dent in the steel, ten thousand times, and it cost nothing extra at volume. Shallow depth of field focused on the emboss's leading edge. No text, no letters, no numbers, no watermark, no UI captions.
NEGATIVE: any letters or numerals embossed or nearby, stickers or decals, scratches implying damage to the mark, brass plaques, ornate filigree borders, harsh direct flash lighting, cleanroom white, vendor logos, keys or handles with readable labels
size: 2560x1600
aspect: 16:10
style: editorial-illustration
background: scene
variations: request a second door angle flat-on (emboss readable as pure relief) and one backlit variant where aisle glow rims the raised edge; pick the seed where the glyph silhouette survives the perforation pattern running through it — that collision is what makes it feel manufactured.
```

### V5 — Tier 5: Etched Aluminium and Lit (institution)

```
POSITIVE: in-game artifact plate, mounted scene: night exterior of a low institutional building's entrance wall — fair-faced concrete, a shallow roof canopy, gravel walk — carrying a large anodised-aluminium mark plate: the hexagon-node glyph with three radiating stubs acid-etched through to matte frost inside a mirror-bright field, and behind the whole plate a concealed warm light source blowing a soft halo off its edges, so at night the building wears the mark like a lantern with no visible fixtures; rain-slick granite reflecting the halo in one long vertical smear, wet concrete darkening unevenly, a single bench to the side empty, no people. The plate is generous scale against the human bench — quiet authority, the restraint of an institution that has stopped introducing itself. Below the glyph, an etched blank band reserved for typesetting — no letters in frame. Palette near-monochrome: aluminium, concrete grey #8A929C, one warm halo glow kept amber-white and neutral, zero state-colors; the lighting is architectural, honest falloff, no beams, no fog machines. Long-exposure serenity, slight star flare on one bolt head. This is the top of the fidelity ladder: the mark has outlived the argument about whether it mattered.
NEGATIVE: any letters, numerals or words etched or anywhere, neon signs, colored uplighting, Christmas architecture, glass tower reflections of a city, people entering, security cameras with readable detail, brand watermarks, lens flares blooming across the glyph
size: 2560x1600
aspect: 16:10
style: editorial-illustration
background: scene
variations: iterate halo warmth (neutral 4000K vs the 1998-era amber #F2B133 family) — the warmer seed doubles as the era-skin version of the same institution; pick via greyscale: etched matte-on-mirror relief must carry the whole frame with color removed.
```

---

**PICK CRITERIA:** series law first — all five tiers must visibly carry the SAME glyph and compatible brand color, because they are one company's ladder, not five companies; any tier whose glyph drifts in topology is recast. The tier-difference must be legible with the glyph covered: paper→sticker→spot-ink→emboss→lantern is a physics progression (medium gets heavier, finish gets quieter), and if a seed makes tier 2 as refined as tier 3 or tier 5 louder than tier 4, the ladder collapses. Fidelity-to-reputation tone check (§0.5: respect the work, punch never down): tier 1 and 2 are affectionate, never derisive — every great company's first plaque looked like that. Keying tiers (1–3): magenta field must be uniform under extraction (#FF00FF, no gradient), and no glyph may contain keying-adjacent hues. Typeset-zone law across all five: the blank ribbon/plate/band must stay clean of artifacts at all seeds, since the real wordmark lands there in software.
