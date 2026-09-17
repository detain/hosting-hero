# 8. Visuals and presentation

*This category covers art direction; what infrastructure, threats and visitors look like; how attacks,
defenses, connections, upgrades, failures and money are expressed; UI/HUD; readability at scale; and how
the whole look shifts between hosting types and eras.*

**The wave-2 headline.** The visual lens's single biggest contribution is not a new art style — it is a
set of **cross-cutting rendering laws** that resolve collisions which would otherwise become production
bugs. Four of them are load-bearing and every other entry in this category leans on them:

- **The Hue Ledger** (§8.2) — one hue, one job, ledgered, with the collisions written down and the
  reassignments named. Without it the document's best visual idea (violet resolving into cyan and
  magenta) does not survive contact with the rest of the design.
- **The Emissive Allowance** (§8.2) — a stated budget for how much of the screen may glow, which is what
  makes "substrate never glows" survive a game whose primary telemetry is blinkenlights.
- **The Ring Taxonomy** (§8.2) — what every ring, donut, halo and arc around an object means, because
  rings were quietly doing six different jobs.
- **The Instrument Design Language** (§8.2) — one spec for every meter, gauge and dial in the game, so
  that thirty hosting types' thirty signature meters read as one instrument family instead of thirty
  art styles.

**The second wave-2 finding — the coverage audit.** A pass over the document found several
mechanically-defined systems with **no described visual expression at all**: the business machine (the
pipeline, the price book, backlog, receivables, reserves, escrow), most business and financial threats
(chargebacks, review bombs, processor freezes, vendor price hikes, churn waves, bad debt), most visitor
archetypes beyond the generic mote, the Three-Clock Rule, and the Hands resource. Wave 2 supplies specs
where wave 1 said "a meter," "a gauge," or "it looks different." §8.18 is the audit itself, with
pointers to where each gap is now filled.

---

## 8.1 Art direction candidates

### A. Clean Isometric Diorama (the recommended world layer)
A warm, readable, slightly stylized isometric datacenter — the base register that everything else sits
on top of.

**How it works:** Fixed 2:1 isometric, soft ambient occlusion, matte materials with one gloss accent
(glass, LED lenses), a restrained palette with saturated light doing all the emotional work. Objects are
chunky and silhouette-distinct. **Scales from one box to a hall of racks without changing metaphor**,
which is the single most important property given §1's tier ladder.
**Variant readings converged on from five lenses:** *"Clean Isometric Industrial"* (isometric floor
tiles, racks as chunky readable boxes, cable trays overhead, cold aisle in blue-white light, hot aisle
in amber — a cross between a factory-builder and a network diagram); *"Isometric Technical"*
(flat-shaded with crisp outlines, saturated status colours on a desaturated equipment palette, which
reads well at any density precisely because **colour is reserved for state, not decoration**);
*"Readable isometric, semi-stylized"* (not photoreal — racks all look the same in reality and that is a
readability disaster — and not cartoon slapstick, because the business stakes need to land).
**Sub-option — isometric pixel art:** ~32px per rack U at Tier 1, hand-animated LEDs and fans, limited
palette per Identity Kit. Enormous charm, reads beautifully at small sizes, cheap per asset, LED-level
detail trivially legible. Weakness: asset count explodes at scale and rotation is limited.
**Sub-option — flat vector isometric:** the Mini Metro / Two Point lineage. Perfect at any zoom,
trivially recolourable per Identity Kit and per era, great for overlays. Weakness: can feel sterile, and
it is harder to make 200 racks feel like a *place*.
**Interacts with:** every other entry in §8; this is the Substrate/World layer of §8.2's layer law.

**Variations and additions**

- **"Cozy Isometric Diorama" / "cozy infrastructure" framing** — the same base style argued from warmth
  rather than from readability: chunky, warm, soft-edged, semi-isometric miniature diorama (*Two Point
  Hospital* meets *Mini Metro*), cutaway roofs (the Sims-pool-room view), warm materials, toyish scale.
  **The stress lives in the systems, not in the pixels.** Never grim-dark, never corporate-clean — a
  beloved cluttered machine room, where 100 racks feel like a model village rather than a spreadsheet.
  Readable silhouettes per device class: server = a crate with an LED strip; LB = a three-pronged
  splitter; DB = a literal drum of data. **Risk:** it undercuts nation-state dread — solved by keeping
  the threat grammar genuinely sharp inside a cute world.
- **Variant object metaphors within the cozy register** — DB = a vault cylinder that pulses when
  queried; cache = a glowing sphere that drains and recharges; LB = a literal turnstile splitting
  packets; cooling as visible cold-aisle fog and heat-shimmer exhaust that intensifies with load.
- **"Cozy NOC" spine variant** — chunky stylized 3D, soft normals, plastic-and-steel chassis with
  realistic 1U proportions but toy-like seams, **lit almost entirely by emissives** — every status is a
  light; a beloved desk diorama viewed from above.
- **"Warm Isometric Hardware-Diorama"** — slightly exaggerated proportions, big friendly silhouettes
  (*Two Point Hospital* meets *Mini Motorways*), matte metals, a saturated-but-not-toxic palette, soft
  ambient occlusion, **no outlines**; entities ride cables like toy trains.
- **The flat-shaded low-poly reading** — 2:1 iso, flat-shaded low-poly, animates well at 60fps.
  **Stated weakness:** the iso grid fights long cable runs, producing depth ambiguity on overlaps. Worth
  recording because it is the one geometric objection to the recommended spine.
- **The isometric cutaway "company building"** — server floor below (racks, cold aisles, cable trays),
  office above (support desks, legal, the CEO's panic), street level outside — **one camera shows both
  halves of the dual-flow loop**; threats climb the road, customers check in at the door.
- **The living-model-railroad framing** — your infrastructure as a model railroad: racks as
  see-forward cabinets, every U visible, cables physically routed. "Cutaway diorama" warmth, not
  sterile blueprint.
- **Contrast as identity** — cozy readable low-poly world **plus** a hard-edged terminal-green UI
  overlay, where the HUD is the only "100% real" thing on screen: *"cute world, serious green
  monospace"* — a dark ops console with a smile.
- **Even the dread stays cozy-genre** — *"even a DDoS should read as weather, not gore."* Semi-stylized
  warm-but-techy, with a blueprint mode for the wiring layer, like a clean DCIM tool brought to life: a
  *living datacenter*.

### B. Technical Blueprint / Schematic (cyanotype)
White-on-blue linework, monospace labels, dimension lines, hatching, revision clouds.

**How it works:** The world *is* a diagram. Traffic is flow along drawn edges; everything is annotated.
**Extremely readable, extremely on-theme, and cheap to produce** — but emotionally cool and hard to make
beautiful at the "look at my datacenter" moment. It also makes complexity look *intentional*, which is a
real asset when the board gets dense.
**Best as:** the Wiring Mode (§7.2), the pause/plan mode, the tech tree, the floorplan, the Intent layer
(§8.2) and the blueprint export — i.e. **a mode, not the game.**
**Colour note:** its linework is **Ink Blue**, never cyan — see the Hue Ledger (§8.2). Cyan is reserved
for moving legitimate traffic, and a blueprint drawn in cyan will be misread as traffic every time.

**Variations and additions**

- **"Living Blueprint" as art direction rather than as a mode** — flat vector schematic all the way
  down: rack-diagram symbols that blink, breathe and carry light, so **the whole game is an infographic
  that fights back.** Most readable option at scale; risk: emotionally sterile. Strongest as an overlay
  identity even if rejected as the base.
- **Flat Network Diagram variant** — the whole game rendered as a living topology poster: nodes, edges,
  labels, no textures. The schematic *is* the game. Elegant, risky for atmosphere.
- **"Blueprint Room" 2D top-down variant** — connections are native here because it genuinely *is* a
  diagram; threat paths render as annotated route lines and placement snapping reads as CAD. The charm
  ceiling is the weakness. **Per-type theming via drawing style** — an architect's hand versus an
  engineer's — and it is the best fit for CDN, DNS, regulated and migration levels.

### C. CRT / Terminal Retro (diegetic terminal)
Phosphor green, scanlines, ASCII-adjacent glyphs, box-drawing, block characters, 256-colour, a blinking
cursor, chunky text UI.

**How it works:** Perfect for the dial-up/BBS era levels and for a whole Minimalist Mode (§9.1).
Nostalgic, cheap, and beloved by exactly this game's audience. As a full-game treatment it can't carry a
campaign; as an era and a mode it is unbeatable. A variant — *"CRT Operator"* — renders the whole game
as a period-appropriate NOC display: phosphor green for the dial-up era, amber for the 80s, Win95 grey
for the 90s, dark-mode dashboards for modern, so **era shifts become full UI re-skins**.
**Best as:** the early era, an unlockable mode, the in-game terminal's aesthetic, and the flavour of the
Chrome layer's instrument styling.

**Variations and additions**

- **Pixel + CRT post-processing as a timeline device** — 32px pixel hardware under a scanline/phosphor
  filter **whose strength tracks the era**: heavy on dial-up and mainframe, absent in cloud, a flicker
  on GPU. **The style itself tells the timeline.**
- **Era-native resolution tracking** — 16-colour CGA for dial-up, SNES density for mid-2000s shared
  hosting, HD-pixel for GPU farms: a nostalgia engine, and thousands of pixel botnet drones are free to
  animate. **Weakness:** hard to sell the premium endgame GPU cleanroom.
- **"Phosphor Mode" — the full-CRT candidate** — the whole game renders as a *realistic terminal*:
  green/amber phosphor, ASCII-ish racks, scanlines, screen-door, a blinking-cursor build mode. *"Same
  game, 1980s monitor as the renderer."* Also a natural high-contrast accessibility preset, shipped as
  an unlockable global skin.
- **True-ANSI Mode (the whole game in a terminal)** — a full cosmetic mode: 80×25 to 240×67, ANSI
  colours, braille-block racks, box-drawing cables, the modem screech as a startup chime, `htop`-style
  enemy lists. A love letter to the TUI tradition, a genuine low-spec and accessibility path, and — most
  usefully — **a hardcore legibility discipline: if the game reads in ANSI, the shape/silhouette grammar
  truly works.** Unlocked as a reward for beating a dial-up act (era-earned aesthetics).

### D. Cozy Miniature / Tilt-Shift
Soft depth of field, warm desk lamps, tiny people, a cat.

**How it works:** Leans into the "my little company" fantasy. Makes peacetime pleasant, which matters
because peacetime is half the game (P3). **Pairs beautifully with A** as a lighting and scale treatment
rather than a separate style. A slight tilt-shift at Tier 3+ makes a huge facility feel like a model,
which is both beautiful and a readability aid — the focal row is crisp, the rest is soft. Disableable
for accessibility.

### E. Gritty Industrial Realism
Concrete, cable ladders, sodium lighting, grime, real equipment proportions.

**How it works:** Maximum authenticity, maximum atmosphere at Z4, worst readability at Z1. **Use it for
the facility shell and the establishing shots**, not for the parts you have to read.

### F. Cutaway Dollhouse 2.5D
Orthographic 3D with the front walls removed — Theme Hospital, The Sims, a cross-section building you
peel open floor by floor.

**How it works:** Best "my facility is a place" feeling, an easy camera ladder, and real lighting from
LEDs. Uniquely good at showing facility systems that are invisible in a top-down view — the power path,
the chilled-water loop, the plenum. Weakness: the most expensive option and the hardest to keep readable
at Tier 3+.
**Best as:** the facility-systems view and the establishing register for large sites.

**Variations and additions**

- **Cross-section Dollhouse** — camera outside the building, walls cut away, floors for power and
  cooling below, rack rows above; customers and threats walk the street. **Failures can happen
  *structurally*, and verticality carries systems** — power up the floors, cooling up the shaft. The
  coziest and most legible "inside a server" fantasy available. **Weakness:** long horizontal distances
  read poorly.

### G. Paper Diorama / Craft
Cardboard racks, paper cables, felt floor tiles, visible glue and fold lines.

**How it works:** Charming, distinctive, and it makes "physical infrastructure" tactile. Weakness: it
fights realism exactly when you need to show heat and light, which is often.
**Best as:** a cosmetic unlockable skin, the Company Museum's dioramas, or a jam-scale spin-off.

**Variations and additions**

- **Papercraft Pop-Up Book** — everything looks *folded*: servers pop up as boxes, cables are ribbons.
  Charming and rare, and a genuine indie marketing hook. **Weakness:** it skews young for the ransomware
  beats.

### H. The Isometric Ledger
The business lens's framing of the same base style: a clean isometric facility view with a deliberately
flat, diagrammatic UI overlay that looks like a well-designed financial dashboard.

**How it works:** The contrast between the warm, blinking physical world and the cool, precise money
layer *is* the theme of the game. A hosting operator's eye goes to three things in a rack row: **what's
dark** (wasted money), **what's hot** (about to cost me), and **what's unlabelled** (will cost me
later). The art direction should encode exactly that, which is what makes this a framing principle
rather than a separate style.
**Interacts with:** the Two-Tone Rule below, §8.7's money visuals, §8.8's P&L HUD.

### I. Low-Poly Neon
Emissive-driven night-city.

**How it works:** Everything is lit from within against near-black geometry. **Stunning for arcade, edge
and VPN lines, weakest for cozy shared hosting.** Its real job may be the *outside* — it is the best
available treatment for "the internet beyond your walls" (the threat skybox, customer origins, the spawn
edge) even when the base world is a diorama.
**Best as:** the Z4 abstraction layer and the arcade/edge Identity Kit, not the world.

### J. Isometric Voxel
Everything is blocks.

**How it works:** Racks and buildings assemble **block-by-block at tier-up** — a satisfying Minecraft-style
auto-build animation in which the level literally grows itself. The tier-up ceremony is free, because the
geometry already knows how to be half-built.
**Best as:** a cosmetic skin and a construction-animation language, borrowable by style A.

### K. PCB Plan-view
The map as an actual circuit board, seen from above.

**How it works:** Green soldermask, copper traces as roads, vias as junctions, SMD components as
buildables, silkscreen labels that are diegetic by construction. More abstract and more hardcore —
**great for tutorial levels about *flow*, terrible for dollhouse charm.**
**Best as:** the "logical view" mode rather than a whole-game style; a sibling of B's Blueprint register
with a different material.

### L. Corporate Infographic Flat Vector — as satire
The smug flat-vector corporate-illustration style, deployed deliberately.

**How it works:** Oversized heads, pastel suits, impossible hands — **as satire of hosting marketing.**
Beautiful, joke-forward, and instantly communicates "this game gets it." Weaknesses: weak motion physics,
and the irony may date badly.
**Best as:** menu and report screens, or as the **advertisements layer inside other styles** — competitor
billboards, vendor-show booths, the price-war leaflet.

### The recommended shipping combination
Five looks, one game, each doing what it is best at.

**How it works:** **A (isometric diorama) as the world**, **B (blueprint, in Ink Blue) as the schematic
mode, tech tree and export**, **C (CRT) as the retro era and the terminal**, **D (tilt-shift warmth) as
the lighting philosophy**, and **E (industrial grit) as the material and set-dressing language at high
zoom.**
**The three-register phrasing of the same answer:** *"Iso Pixel World, Vector Signal, Terminal
Chrome"* — the **World layer** is isometric pixel art for warmth and legibility of LEDs and cables; the
**Signal layer** is crisp flat vector for overlays, lanes, rings and heat, so diagnostics never fight
the world's texture and always read at any zoom; the **Chrome layer** is a slightly diegetic
terminal/instrument aesthetic — monospace readouts, a receipt-printer ledger, physical dials — so the UI
feels like operator equipment. Three visually distinct, non-competing registers, which is exactly what
the three-layer law (§8.2) wants.
**Tension:** ⚔️ The visual lens argues for committing hard to one style for coherence; the variety
mandate (§0.2) argues the look must shift per hosting type and era. Resolution: **one geometry and one
UI, many palettes and material treatments** — the Five-Asset Skin Kit (§8.10) is the mechanism, and the
Style Allocation Table below is what stops the blend from becoming a mood board.

**Variations and additions**

- **The hybrid stated as the recommendation itself** — diorama base world **plus** Living-Blueprint
  overlays: diegetic where you play, schematic where you analyze, with **the Overlay Wheel (§8.8) doing
  double duty as the style switch**, which keeps both audiences happy without a settings menu.
- **Two visual modes of one facility** — "Floor view" (isometric diorama: racks, cables, LED blinkies,
  staff walking) ↔ "Diagram view" (a schematic netmap like every DC slide deck) on **one keybind**. The
  mental model doubles.
- **Hybrid "Macro ↔ Globe"** — the game runs at *two art densities*: intimate diorama/dollhouse for the
  machine room, abstract light-art for map and world levels (CDN highways, the DNS compass room). **The
  zoom-out from rack to planet is the signature money shot.** Weakness: two art pipelines.
- **"The Map Is a Network Diagram That Learned Perspective"** — friendly isometric floorplans where
  network links are *physical glowing conduits*, with a toggle that flips to Blueprint Mode (flat,
  labelled topology): **one art direction, two legibility modes for the two puzzles** (placement versus
  routing).
- **The schematic-HUD justification.** The hybrid also settles an open question in the UI: **the
  Living-Blueprint overlay modes are what make schematic HUD elements *diegetic*.** A flat topology panel is
  chrome in a diorama game and **an in-fiction instrument in a game that already renders a blueprint
  register** — which is the argument for shipping B as a mode even if the world never uses it.

### The Style Allocation Table
The rule that turns five styles into a system rather than an incoherent blend: state **ownership**, not
proportion.

**How it works:** Each style owns named surfaces and is explicitly banned from others.

| Style | Owns | Never appears in |
|---|---|---|
| **A — Isometric diorama** | the world at Z1–Z3, all Substrate | menus, documents |
| **B — Blueprint (Ink Blue)** | Wiring Mode, tech tree, floorplans, exports, the Intent layer | the Room register |
| **C — CRT/terminal** | the in-game terminal, the 1990s era, Minimalist Mode | modern-era chrome |
| **D — Tilt-shift warmth** | lighting philosophy everywhere; never geometry | the Board register (flat and cool by definition) |
| **E — Industrial grit** | materials and set dressing at Z1–Z2, and the Establishing Frame | Z3+, where it becomes noise |

**Why it matters:** Stated as ownership, the five styles become a system instead of a mood board, and
the tension flagged above resolves itself — nobody has to decide "how much blueprint" in any given
frame, because the frame's surface already determines it.

### The Two-Palette Discipline
The single rule that lets the world be busy and the signals still scream.

**How it works:** The **World layer uses only muted materials** — concrete, steel, beige, rust, black
plastic — plus LED points. The **Signal layer owns all the saturated semantic hues.** Nothing in the
world is allowed to be saturated for decoration. The result is that a fully-built, cable-dense,
set-dressed hall still has a black-and-grey-and-beige base, so a single magenta thread crossing it is
unmissable.
**Interacts with:** §8.2's Hue Ledger and Emissive Allowance; §8.10's per-line palettes, which re-tint
the substrate *within* the muted band only.

### The Two-Tone Rule (the money reading of the same discipline)
**How it works:** Everything in the world is rendered in neutral greys and equipment colours; **only
money and risk are saturated.** Green for revenue, red for cost/loss, gold for high-margin items
(cross-connects, upsells), violet for compliance/trust. Your eye is trained on the P&L whether you want
it to be or not.
**Tension:** ⚔️ This assigns green to revenue, while the Hue Ledger assigns green to *verified/healthy*
and gold to money. Both cannot hold. **Resolution:** keep the Hue Ledger's assignment (gold = money,
green = verified/healthy) and deliver the Two-Tone Rule's *intent* through the **Utilization Glow** and
**revenue-quality tinting** below, which carry commercial meaning without annexing a hue.

### Utilization Glow
Money legibility as a fill level, not a colour.

**How it works:** Every revenue-producing object carries a fill level rendered as a soft bar or an
internal glow. **Empty (dark, cold) = you are paying for nothing. Healthy (warm) = money. Saturated
(pulsing hot) = you are about to breach an SLA.** One glance across a hall tells you your entire
capacity-to-contract position.
**Interacts with:** §8.2's "utilization as fill, everywhere" grammar; §8.7's money visuals; §8.9's heat
tiles, which are this rule at Z3.
**Hosting types:** universal, but it carries the most meaning in colo (cabinet occupancy), VPS
(overcommit), GPU ($/GPU-hour idle), and wholesale (leased-but-empty pads).

### Grain and Materiality
The texture pass that stops the two extremes from failing.

**How it works:** A very light, static film grain plus subtle per-material noise — brushed metal
streaks, plastic speckle, concrete pores. **It is what stops a flat-vector game from looking like a
wireframe and a pixel game from looking like a spreadsheet.** Static, never animated, so it costs
nothing at runtime and never competes with the motion budget.

### The Lighting Model
Rooms are dim and **lit by their own equipment.**

**How it works:** Rack LEDs, screen glow, exit signs and overhead task lights are the light sources.
Consequences: **a dead rack is a dark rack**; a heavily-loaded GPU row glows orange and casts colour on
the aisle; a power failure is a literal descent into darkness. **Lighting does the work of a dozen HUD
elements**, and it is the reason the Emissive Allowance (§8.2) has to be a budget rather than a ban.
**Interacts with:** §8.4's generator lighting shift, §8.4's blinkenlights, §8.12's Night Shot.

### The Practical Lights List
The named, reusable light sources — so the lighting model is authorable rather than vibes.

**Visual:** Exit signs (green). The EPO button (red, under glass). Aisle strip lights. CRAC status
lamps. The generator panel. Camera IR glow in the dark. The meet-me room's fluorescents. The NOC's
monitor wash on the operators' faces. A single desk lamp at 3AM. Emergency/UPS lighting with its own
distinct tint.

### Depth of Field, Sparingly
**How it works:** Tilt-shift and DOF are used at Tier 3+ to make a huge facility feel like a model and
to keep the focal row crisp while the rest goes soft. Never strong enough to hide state. **Disableable
for accessibility**, and disabled automatically in Reduced Motion mode (§8.14).

### "State is colour, identity is silhouette"
The one-sentence rule that every art-direction option above must obey.

**How it works:** You should be able to tell **what** something is with the colour drained out, and tell
**how it is doing** with the shapes blurred. Two orthogonal channels, neither redundant with the other,
both tested (§8.16's Silhouette Sheet tests the first; §8.14's greyscale pass tests the second).

### The design north star
The one-paragraph brief that every candidate above is judged against.

**How it works:** **Readable infrastructure, felt consequences, and a hosting type recognizable at a
glance** — eyes closed, sound off, one frame. Three working principles fall out of it:
1. **Shape grammar BEFORE colour.** Customers and threats must be separable in *greyscale silhouettes*;
   colour is a second, redundant channel and never the first one.
2. **Every system earns a diegetic view.** Power, network, heat and money each get an in-world
   visualization, the way a city-builder gives each service a district view.
3. **The rack is the hero object.** The game's identity lives in hardware lit from within, and every
   other art decision defers to that.
**Interacts with:** §8.2's Two-Channel Law (principle 1 is its art-direction phrasing), §8.8's overlay
wheel (principle 2), §8.10's Hero Object Rule (principle 3).

### The material alphabet
One material per concept, globally consistent — so complex screens self-read once the alphabet is learned.

**How it works:** Materials are assigned meanings and **never mixed**: **metal = structural/shared ·
glass = inspection or sensitive data · matte plastic = commodity compute · fabric and paper = human/staff
· energy = customer and money · frost/glitch = corruption.**
**The second, richer mapping** (compatible, and more specific about condition): **brushed steel =
healthy · chrome = hardened/encrypted · rust and cobweb = unmaintained · frost = cooling · ember-glow =
hot/busy · black glass = down · translucent = virtualized · paper = compliance.** *"Never mix meanings;
this is the visual spine of the whole game."*
**Why it matters:** material is the one channel that survives every colour-blind palette, every era
re-skin and every zoom level, and it is currently doing that work by accident rather than by contract.
**Interacts with:** §8.2's Two-Palette Discipline (materials are how the muted world stays expressive),
§8.10's material and lighting language per line, §8.2's Foreignness Budget.

### Beige-to-Chrome Lineage
The visual history of hardware as a progression.

**How it works:** **Beige towers → black steel → white lab slabs → black glass**, so **the era of your
operation reads from the metal alone.** Each tech tier changes silhouette *and* footprint, which means
players read tech-age from across the map without a label, a date or a tooltip.
**Interacts with:** §8.10's era kits and the Chrome Skin Token Set; §8.4's cable and sticker archaeology,
which is the same idea applied to the strata rather than to the current generation.

### How much face? — *CONFLICTING*
How anthropomorphic the hardware is allowed to be. The two documents — and, within one of them, four
independent passes — disagree about whether a server may have a *face*, and the decision cascades into
the threat grammar (cute worlds blunt dread), the accessibility grammar (expressions are a second
channel or a distraction), and the sysadmin audience's tolerance for whimsy. **All four positions are
kept; none is picked.**

#### Position A — full anthropomorphism, "Cute-Corporeal / Monsters, Inc. datacenter" *(opencode)*
Services are little creature-crews with **literal faces** — a nervous Firewall, a proud DB with a barrel
mustache. **Maximum charm and maximum emotional stakes**: you *feel* it when Mr. Database gets padlocked.
**Stated risk, by its own author:** it undercuts ops-sim credibility for the sysadmin audience, and the
source itself recommends *hinting* at faces rather than going the whole way.

#### Position B — no literal faces, "faces-by-behaviour" *(opencode)*
Each node has a blinking **status eye-row** and a **posture** — slumped heat-shimmer when strained, crisp
idle when happy — and nothing more. **150-unit boards stay legible because you read *posture clusters*
the way a farmer reads a herd**, which is a scale argument rather than a taste argument.

#### Position C — the pareidolia middle path, "Pareidolia Hardware" *(opencode, and the closest to master's grammar)*
Chassis get **subtle face-cues only**: a status-LED pair plus a vent line, reading as content / worried /
dead-eyed. **The game reads as a town of little robot characters without ever going full cartoon**, and
losing a rack feels like a small funeral. This is the position most compatible with master's universal
object grammar (§8.4), where *lights say what it is doing* and nothing else is expressive.

#### Position D — expressive status face *(opencode)*
A healthy server blinks content LEDs, a stressed one **sweats**, and a hacked one has subtly *wrong*
colour LEDs — so you **detect the possessed rack by eye.** A gameplay-reading aesthetic rather than a
charm aesthetic: the face exists only to carry state, which makes it a redundant-encoding channel rather
than a personality.

**What the decision turns on:** whether expression is a *charm* channel (A) or a *telemetry* channel (D),
and whether the Two-Channel Law's second channel can afford to be a face at all when the Emissive
Allowance already spends the LEDs on state.

---

## 8.2 Rendering rules, colour language, and shape tokens

*This subsection holds the cross-cutting rendering laws. Everything else in §8 — and a good deal of §4,
§6 and §7 — depends on them. Four are load-bearing: the **Hue Ledger**, the **Emissive Allowance**, the
**Ring Taxonomy** and the **Instrument Design Language**.*

### The Layer Law (Three layers, plus Intent, plus Attachment)
**Every frame is composed of a fixed, small number of layers, and they never blend.**

**How it works — the original three:** **Substrate** (also called **World**: the physical world — racks,
cables, rooms, buildings, staff — matte, desaturated, lit) → **Flow** (also called **Signal**:
everything moving and every in-world-space overlay — traffic, attacks, money, heat, threat lanes,
visitor ribbons — emissive, saturated, animated, drawn in world space) → **Annotation** (also called
**Chrome**: everything the game is telling you — icons, meters, labels, cards — flat, crisp, unlit,
screen-space, never rotates or scales with the camera, always on top). **Substrate never glows; Flow
never has flat UI colour; Annotation never has perspective.** This one rule is what keeps a screen with
400 objects legible, and it is the single biggest readability killer to violate in a game where the unit
count grows 500×.
**Never let a concept live in two layers at once.**

**The fourth layer — Intent.** The original three have no home for things that **do not exist yet**, and
the game is full of them: ghost builds, queued orders, forecasts, the 90-day lag's pending consequences,
staged rollouts, blueprint previews, the migration ghost, armed automations, standing rules, the
shed-order, scheduled future actions, and the player's own configuration. **Intent sits between Flow and
Annotation.** Its rules: **white or near-white only; always dashed or half-toned; never lit; never
occludes; always perspective-correct** (unlike Annotation). Anything in the Intent layer is a *promise*,
and when the promise resolves it converts to Substrate or Flow with a one-second solidify
(**FX_SolidifyIntent**). **One layer unifies eight scattered "ghost" ideas across the document**, and it
answers the question a configuration-heavy game must answer constantly: *what did I ask for, and has it
happened yet?*
**Interacts with:** the Policy Layer view (§8.8), Ghost Hands (§7), A8.6's hand-set ticks below, §8.8's
Visual Grammar for "Not Built", §5.8's Pegboard.

**The fifth, sub-layer — Attachment.** Unit-attached UI (patience rings, nameplates, ping numbers,
halos, tags, load donuts) moves with units like Flow but is flat UI colour like Annotation, and is
therefore undefined under the original law. Name it and give it a rule: **flat colour, no lighting,
screen-space scale** (so a ring is the same pixel thickness at every zoom), **always occludes its own
unit and nothing else.** Without this clause, patience rings — the most important visitor visual in the
game — have no legal home.

**The four layers in order, bottom to top:** Substrate · Flow (+ Attachment riding its units) · Intent ·
Annotation.

### The Emissive Allowance
The budget that lets "substrate never glows" survive a game whose primary telemetry is blinkenlights.

**How it works:** The Three-Layer rule's "substrate never glows" is contradicted in at least four
places — §8.4's blinkenlights as primary telemetry, §7.4's tier rim-lights, §4.2's lit power button, and
§1.3's GPU level where "everything glows." Stated as a prohibition the rule loses; stated as a budget it
holds. **Substrate may emit only as points and thin rims, capped at ~2% of the object's screen area, and
only in the object's own state colours. Flow may emit as volume** — ribbons, motes, plumes, washes.
**Annotation and Intent never emit at all.**
**Why it matters:** it is a number an engine can enforce and an artist can hit, and it protects the
thing the ban was protecting — that glow means *motion and meaning*, not decoration — without
prohibiting the art the document already asks for.
**Interacts with:** §8.1's Lighting Model, §8.4's blinkenlights, §7.4's rim-lights, §8.9's Chroma Meter.

### The Diegetic Annotation Exception ("Objects of Record")
The named escape hatch for information surfaces that exist in the fiction.

**How it works:** "Annotation never has perspective" is contradicted by §8.8's diegetic meters, the NOC
wall, §5.8's whiteboard tech tree, §4.7's whiteboard architecture diagram, §1.8's Company Wall and
§9.4's diegetic settings menu. Rather than leave the contradiction to be discovered, name an exception
class: **Objects of Record** are Substrate geometry carrying Annotation content. Their rules:
1. They **may never be load-bearing during an incident** — you must never have to read a wall-mounted
   gauge at an angle to survive a sev-1.
2. **Every Object of Record has a flat HUD equivalent one key away.** The NOC wall is the pretty
   version; `M` opens the flat schematic minimap. Both, always.
3. They are always **readable or ignorable, never half** — no squinting.
4. Every one of them supports **Readout Mode** (§8.14), which replaces the diegetic face with a plain
   numeric readout for players who need it.
**Why it matters:** this lets the game be diegetic without being unplayable, which is the failure mode
every "immersive UI" game hits.

**Variations and additions**

- **The diegesis tier policy** — a three-tier ladder that says *how* diegetic each element is allowed to
  be. **Tier 1: fully in-world** (the status mural, the money fountain, the ledger). **Tier 2:
  world-anchored widgets** (status chips, gauges). **Tier 3: flat screen furniture** (the pager, the
  clock). **An element only ascends a tier when it must be readable during Incident Command dimming** —
  which is the operational version of master's clause 1 above.
- **The companion three-tier HUD doctrine (attention, not diegesis)** — **glance tier** (pure ambience:
  the hum, the sky, the fountain) · **intent tier** (panels and meters, on hover or at the edge) ·
  **read tier** (the console, logs, tickets). **Information appears at exactly ONE tier at a time and is
  never duplicated** — the attention-budget rule applied to the UI itself, and the stated cure for
  late-game panel sprawl.

### The Hue Ledger
**One hue, one job, no exceptions — with the collisions written down and the reassignments named.**

**How it works:** The original colour language assigned nine hues; across the document several picked up
two or three jobs each. This ledger resolves them, and it lists what moved so nobody re-collides later.

| Hue | Sole meaning | Moved off it |
|---|---|---|
| **Cyan** | legitimate traffic and data in motion | blueprint linework → **Ink Blue** (a darker, desaturated blue used only for the Intent/blueprint register); data *ports* keep cyan (same family, acceptable) |
| **Magenta** | hostile traffic, always | the Arena level's "hot magenta-and-lime" décor → hot pink-violet |
| **Amber** | **your own defenses harming you** — false positives, over-tuning, self-inflicted friction | "degraded state" → **Warm Grey-Amber** at lower saturation, distinct enough never to be confused with a false-positive flash; capacity >80% uses the green→red ramp without amber's exact hue |
| **Gold** | money, only money | power feeds → **Copper**; whale/value glow keeps gold (it *is* money); GPU power cabling → Copper; bulletproof revenue → gold, it's still money |
| **Copper** | power, amps, electrical | (new hue, introduced to unload gold) |
| **Orange** | heat, thermal, fire | unchanged, but must be clearly separated from Copper in the palette — copper is darker and less saturated |
| **Red** | failure, loss, down | — (**red is reserved; nothing else may use it, ever**) |
| **Green** | verified, healthy, restored | "organic cohort" → cohort **pattern**, not hue |
| **Violet** | unidentified / unclassified, **only** | trust-auth ports → **Teal-Violet** as a port colour only, never on a moving unit (an alternative proposal makes trust/auth links **white with a keyed texture**, since white is already control-plane — ⚔️ pick one, both work); affiliate cohort → pattern; the GPU level's dominant palette shifts off violet entirely (it has orange, copper and white to work with) |
| **White** | player intent, selection, control plane, and the single Correlated-Failure line | — |
| **Ink Blue** | the blueprint/Intent register | (new) |
| **Warm Grey-Amber** | degraded-but-serving | (new) |
| **Grey** | inert, unpowered, stranded, abandoned | — |

**Why it matters:** the document's single strongest colour idea — *violet resolving into cyan and
magenta is the core loop rendered* — is destroyed if violet also means "auth port" and "affiliate
customer." Gold was doing five jobs (money, power feeds, whale glow, GPU cabling, bulletproof revenue);
amber was doing seven (warning, false positives, fault LEDs, congested links, derate meters, capacity,
patch-lag pips). **This single table is the most important change in the visual half of the document.**
**Interacts with:** literally everything; §8.10's per-line palettes are constrained by it; §8.14's
colour-blind palettes are derived from it.

### The one hue table — *CONFLICTING*
Both documents agree that exactly one hue table must be published and that publishing two is fatal. They
publish different ones. The dispute is over **three specific assignments — red versus magenta for
hostility, green's double duty (healthy state versus replication/backup), and whether money is gold or
green** — and, in one variant, over whether the customer-warm / money-yellow split survives at all. These
are mutually exclusive values for the same dial; the shape-first law is *not* in dispute and holds under
every variant.

#### Position A — the Hue Ledger *(master)*
**One hue, one job, with the collisions written down and the reassignments named** — the full table is in
the entry above and is the authority for this position. Its assignments: **cyan** = legitimate traffic ·
**magenta** = hostile traffic, always · **amber** = your own defenses harming you · **gold** = money and
only money · **copper** = power · **orange** = heat · **red** = failure/loss/down and *reserved* ·
**green** = verified/healthy/restored · **violet** = unidentified only · **white** = player intent and
the control plane · **Ink Blue** = the blueprint/Intent register · **warm grey-amber** = degraded but
serving · **grey** = inert. It is backed by the form rule *gold moves, amber fills, orange is a lens, red
is final*, so the warm end separates by hue **and** form rather than hue alone.

#### Position B — "red is a state, never a family" *(opencode)*
Hostility = **magenta primary + void-black secondary**; ERROR/damage state = **red** (which is why
ribbons and breach-flashes use it); ops/admin = **cyan-blue**; backup/replication = **violet** — which
frees green of its double meaning entirely; money = **yellow only**. Closest to master's ledger, and
differs from it chiefly in giving backup/replication violet, which master reserves for *unidentified*.

#### Position C — the canonical swatch sheet *(opencode)*
Attacks = the **magenta family**, with red reserved for *state* — danger, errors, outage;
data-in-motion/replication = **mint green**; customer satisfaction = **warm gold**; money = **saturated
yellow**, distinguished from gold **by context** on the rule *"money always flows on pipes, mood never
does"*; admin/ops = **cyan**. Published once as a swatch sheet pinned to the art bible.

#### Position D — the one-line mnemonic *(opencode)*
**"Magenta = cause, red = effect."** Colour-blind-safe with the shape-first law primary, and it kills
the red double-meaning in five words rather than in a table. The cheapest possible resolution, and the
one most likely to actually be remembered by an artist at 2am.

#### Position E — differentiate by texture and motion, not hue *(opencode)*
The gold/green soup is **unfixable by hue alone**: coins are **metallic and spin**, auras are **soft and
do not**. Freeze *"green = healthy status only"* and send backups to **teal**. This position argues the
whole table is the wrong instrument and that form is the real channel.

#### Position F — the strict five-colour palette *(opencode)*
**Contradicts gold-customers / yellow-money outright.** **Green = healthy flow · amber = degraded · red
= breach/loss · blue = customer and traffic money-flow · purple = intel/attacker** — *and only these.*
Everything else rides its own fixed glyph. The most aggressive budget on the table and the only one that
moves money off the warm end entirely.

#### Position G — business-lens discipline *(opencode)*
**Only severity and priority may use saturated hues.** Money = **green**; brand = a **neutral**; threats
get menacing hues **regardless of type**, so *"the map never hides risk."* A severity-first table rather
than a semantics-first one.

#### The companion proposal that every position must adjudicate — a second currency colour *(opencode)*
Blocked-attack savings drop **silver motes** beside gold revenue — *"a whole second currency-colour in
the coin-physics system, teaching defense ROI without a tooltip."* It is in direct tension with
money-only-yellow/gold under Positions A, B and C, is free under F and G, and must be ruled on by
whichever table is published. *(Rendered in full in §8.7's Silver motes entry.)*

#### The tension the two documents both flag
The data-flow doctrine of **customer traffic = warm gold · attack = red · admin/ops = blue ·
replication/backup = green · telemetry = purple dots** is an onboarding-free visual language that several
passes reached independently — and it disagrees with the visual-lens doctrine on **red versus magenta for
attacks** and on **green for backup versus satisfied customers.** Both documents propose the same
resolution shape: **keep the round/angular shape law primary and choose ONE hue table.** They do not
propose the same table.

### Gold moves, amber fills, orange is a lens, red is final
The form rule that backs up the Hue Ledger, so the warm end of the palette separates by **hue *and*
form** rather than hue alone.

**How it works:**
- **Money = gold, and money is always a discrete mote, coin or arc — never a fill or a tint.** Motion
  and form carry it as much as hue: gold always has a specular highlight and arc motion.
- **Warning = amber, and warning is always a fill, a tint or a pip — never a moving particle.** Flat,
  static, attached to an object.
- **Heat/power = orange and copper, and they only ever appear inside their own overlay.** The substrate
  is never orange-tinted outside the thermal/power lens.
- **Red = failure, and red is reserved.** Nothing else may use it.
**Why it matters:** a degraded server next to a revenue mote is the game's most common frame. Without
this rule the distinction is discovered in playtest instead of specified.

### Saturation, value, and temperature — the three state axes, reconciled
Two competing health encodings existed; stated as one rule they are compatible.

**How it works:** **Health is value and colour temperature. Urgency is saturation.** A healthy node is
neutral-lit and neutral-temperature. A stressed node **warms and stays bright**. A dying node **warms
and darkens**. A dead node goes **grey and dark**. A thing that is desaturated and dark is dead; a thing
that is saturated and bright is screaming. **Three axes, one law, written once.**
**Consequence for depth fog:** distance/irrelevance may **never** be expressed by desaturation, because
desaturation is a health signal — a hazed healthy rack and a dying rack would read identically. Focus
and distance use **contrast reduction and a slight value lift** instead (§8.3).

### Money has colour and weight (revenue quality, rendered)
The commercial extension of the colour law.

**How it works:** Coins and money motes are **tinted by revenue-quality band** (gold / green / blue /
amber / red, within the money family so they never leave gold's job) and **sized by margin**. A month of
great revenue is a slow procession of heavy gold coins; a month of deal-forum signups is a fast spray of
small dull confetti that sums to exactly the same number. **One glance tells you what kind of company
you have become**, and it makes the MRR chart's lie visible without a second chart.
**Interacts with:** §6's Revenue Quality bar, §8.7's money visuals, §8.10's revenue-quality floor
tinting.

### Self-inflicted failure: white-cored red
The colour the palette was missing.

**How it works:** A self-inflicted failure — a bad deploy, a misconfiguration, your own rate limit, your
own automation, a change you made — currently renders identically to an external attack, which destroys
the most important distinction in the whole game. **Give self-inflicted failures a white-cored version
of red**: the control-plane colour (white = player intent) bleeding into the failure colour. It reads
instantly, it is thematically exact, and it makes the postmortem's most important sentence visible in
real time.
**Interacts with:** §7's change management, §6.9's postmortem, the Hue Ledger (white and red are both
already reserved; the *combination* is the new token).
**Tension:** ⚔️ Amber is assigned to "your own defenses harming you" (false positives), and white-cored
red to "your own change broke it." These are adjacent concepts with two different encodings. Keep both —
amber is *friction you caused*, white-cored red is *an outage you caused* — but the distinction must be
stated in the style guide or artists will blur it.

### Purple means "we don't know yet"
The most useful single colour decision in the document.

**How it works:** All arriving traffic is **violet until classified.** Watching violet resolve into cyan
and magenta as your inspection layers work **is the visual representation of the entire core loop**, and
it makes buying better classification feel like buying eyesight.
**Protected by:** the Hue Ledger, which strips violet of every other job.
**Resolution of a conflict with the Mimic Tell (§2.4):** a mimic's tell may **never be a colour tell**
("a fill colour a few degrees off") — if unclassified traffic is violet then the mimic is violet too and
a colour tell cannot exist. **Mimic tells must be motion and path tells**: gait regularity, a
too-systematic route, arrival synchrony, an absence of the small randomness real traffic has. That is
also the stronger design — a behavioural tell rewards *watching*, a colour tell rewards pixel-peeping.

### The Confidence Blur
Classification uncertainty as a continuous visual, not a binary one.

**How it works:** Render uncertainty as **blur**, not as a separate icon. A unit the system is 50% sure
about is visually indistinct; as confidence rises through the inspection pipeline it **sharpens** into a
crisp circle or triangle. **The whole board's visual sharpness therefore becomes a live readout of how
well you are seeing.**
**Why:** "purple means we don't know yet" is excellent but binary. Blur is continuous, reads instantly
at every zoom, requires no legend, and makes buying classification feel literally like putting on
glasses.
**Interacts with:** §2.4 mimics, §7's inspection pipeline, §8.5's unidentified state.
**Tension:** ⚔️ Blur fights the Attachment layer's crispness rule and can read as a rendering bug at low
zoom. Cap the blur radius in screen pixels and pair it with a slight desaturation toward violet, so it
is legible as *deliberate* at every altitude.

### The Alert Triad Rule
Severity, not subsystem, owns the alert palette.

**How it works:** The Readability Budget says "3 alert colours maximum," but the colour language
contains five alert-adjacent hues (amber, orange, red, magenta, violet) and every system wants one.
Resolve by ownership: **at most three alert hues may be simultaneously active as alerts on screen, and
they are chosen by severity, not by system.** The current worst severity gets red; the second gets its
native hue; everything below third **aggregates into a single neutral pip with a count.**
**Why it matters:** this is also how a real NOC wall works, and it means a system cannot annex an alert
colour by shipping first.
**Additional clause:** **a forced overlay reduces the alert budget to two** (see §1's Cooling Failure),
because the overlay itself is consuming a colour channel.

### The Ring Taxonomy
**Four annular forms, six systems, zero ambiguity.**

**How it works:** Rings and halos were doing at least six jobs — patience, staff fatigue, client mood,
squatter tell, insider tell, selection, timers, RAID rebuild, the load donut. Four distinct forms,
never interchanged:

| Form | Geometry | Sole meaning | Used by |
|---|---|---|---|
| **Ring** | thin, full circle, depletes clockwise | **time running out** | visitor patience, timers, rebuild windows, cert seals, restore windows, the rolling-reserve 180-day timer |
| **Donut** | thick, segmented | **utilization** | the load donut, and only the load donut |
| **Halo** | soft, offset above the unit | **mood / sentiment** | customers, staff, tour visitors, client mood |
| **Arc** | partial, below the unit, on the floor | **player state** | selection, assignment, targeting, hand allocation |
| **Pips** | discrete dots, never rings | **counts and levels** | skill levels, counts, severity ladders, redundancy N+x |

**Why it matters:** rings are the most-used annotation shape in the game and the most easily collided.
Once this table exists, a designer adding a new circular indicator has to pick one of five forms or
justify a sixth.
**Interacts with:** §8.6's patience ring (a Ring), §7's load donut (a Donut), §3.7's customer mood (a
Halo), §7.4's selection (an Arc).

### The Instrument Design Language
**One spec for every meter, gauge, dial and readout in the game — one bezel, many faces.**

**How it works:** The Five-Asset Skin Kit (§8.10) gives every hosting line a **signature meter**. Thirty
lines means thirty meters, and without a shared language that is thirty art styles on one HUD. The
Instrument Design Language is the shared chassis:
- **One bezel.** Every instrument in the game — the tick-rate oscilloscope, the deliverability gauge,
  the hit-ratio dial, the kW meter, the durability dial, the MOS needle, the sync-height gap gauge, the
  ingest weir, the cold-start stutter bar, the RPO/RTO clocks, the SLA meter, the runway bar — sits in
  the **same physical bezel** at the same corner radius, the same stroke weight, the same shadow, the
  same screw heads. The bezel is one asset, re-skinned per era by the Chrome Skin Token Set only.
- **Five permitted faces.** Every instrument is one of exactly five faces: **needle dial** (a bounded
  scalar with a danger arc), **bar** (a bounded scalar with a threshold line), **water line** (a level
  that fills or drains, with a projected line), **oscilloscope** (a waveform with a nominal envelope),
  **counter** (a numeric readout with a trend arrow). Nothing else is drawn.
- **Every face carries four fixed elements**: the **unit stamp** (kW, Gbps, ms, TB, req/s, $/mo — always
  present, always in lighter weight than the value), the **nominal band** (where it should be, shaded),
  the **threshold mark** (where it hurts), and the **ghost** (the same period yesterday or last week, as
  a faint second trace). An instrument without a nominal band is unreadable, because "is this normal" is
  the actual first question of every incident.
- **One alarm behaviour.** When an instrument crosses its threshold it does the same thing everywhere:
  the threshold mark thickens, the needle/bar picks up the alert hue *allocated by the Alert Triad
  Rule*, and the bezel's inner rule lights. It never invents a new animation.
- **One idle behaviour.** At nominal, instruments are **still** — no idle animation at all. Motion on an
  instrument always means something changed.
- **Stroke weight carries certainty** (see below): a hairline needle is an inferred value, a normal one
  is measured, a heavy one is contractual.
- **Every instrument has a Readout Mode** (§8.14) — a plain number and unit, for accessibility and for
  players who want density over charm.
**Why it matters:** this is what makes thirty bespoke meters affordable and what makes them read as one
game. It is also the answer to §8.10's warning that the signature meter is the asset most likely to
fragment.
**Interacts with:** §8.8's diegetic meters and Objects of Record, §8.10's Five-Asset Skin Kit and HUD
swap, §8.15's Number Law, §8.16's production spec.

### Stroke Weight as Certainty
An unused visual axis that solves a recurring problem — epistemics.

**How it works:** Across every glyph, badge, line, needle and check: **hairline = inferred, normal =
measured, heavy = verified/contractual.** A latency figure your monitoring estimates is hairline; one
from real-user monitoring is normal; an SLA commitment is heavy. Combined with the Confidence Stroke Law
(hollow vs solid fill = unconfirmed vs confirmed), the game gets a complete visual vocabulary for **how
much you actually know**, which is the real subject of §7.6's fog of infrastructure.
**Interacts with:** §7.6, §8.8's Truth tab, §8.8's "Explain This Number," §8.14 (stroke weight survives
every colour-blind palette, which is why it is the right axis for this).

### Shape tokens
Shape, not just colour, carries identity — for colour-blind safety and for zoomed-out reading.

| Shape | Meaning |
|---|---|
| **Circle** | a legitimate instantaneous visitor/request |
| **Triangle** | an attack |
| **Square** | a job/batch unit (backup job, render task) |
| **Diamond** | a high-value entity (whale customer, enterprise request) |
| **Hexagon** | infrastructure/service node, and money/resources in chrome icons |
| **Teardrop** | a persistent connection (session, call, stream) |
| **Starburst** | an incident/impact event |
| **Chevron** | a threat family mark (see §8.5) |
| **Ring** | a patience/timer indicator around anything (see the Ring Taxonomy) |

**The five-channel mapping (resolving a table conflict).** §8.2's shape tokens and §8.6's session and
duration classes disagreed about what shape means. Final mapping, five channels with no overlap, every
one greyscale-safe:
**shape = duration class** (circle instant / teardrop persistent / square batch / hexagon node) ·
**ornament = value** (a diamond ornament, a size step, a glow) · **prop = archetype** (the clipboard,
the headset, the briefcase) · **livery = business line** (costume and colour band) · **ring =
patience.**

**Variations and additions**

- **The universal shape-code, stated as the #1 rule** — **customers = circles and rounded capsules ·
  threats = spikes, triangles and jagged motes · infrastructure = squares.** Readable in greyscale, in
  motion blur, and colour-blind-safe by construction. It is the same law as the table above, phrased so
  that an artist can hold it in one sentence: **warm and round = customer, angular and toxic = threat.**
- **The Faces vs Shapes Rule (the zoom law)** — at every LOD, **customers always retain a face** (even as
  tiny lit dots, a two-dot-smile cue) and **threats never do.** The empathy gradient survives
  abstraction, so the camera can go from chip to globe without losing which flow you are defending: the
  silhouette law made **scale-invariant**. *(See §8.1's "How much face?" conflict — this rule is legal
  under Positions C and D and is the argument for keeping some face at all.)*
- **Disguise exceptions make the rule.** The SQLi threat is terrifying **precisely because it is a round
  shape coming in from the right direction** — once the player has mastered the codes, *breaking* them is
  the scare. Keep disguises rare, and **always give a second tell** (a jittery walk, a glitchy outline),
  which is what keeps the exception inside §8.14's mimic exemption rather than outside the Two-Channel
  Law.

### The Two-Channel Law (formerly the Diamond/Circle/Triangle law)
**No information is ever carried by colour alone.**

**How it works:** Every state that matters is encoded twice — colour *and* shape, or colour *and*
motion, or colour *and* an icon, or colour *and* stroke weight. Deuteranopia and protanopia simulations
are part of the art review; three named colour-blind palettes ship (§8.14); and a **greyscale pass is a
sign-off gate** for every unit, overlay and alert state, run in the Contrast Audit Mode the document
already proposes (§8.14). **Accessibility as a design constraint produces better readability for
everyone.**
**Why the rename:** the old name misleads — it is a **redundant-encoding law**, not a law about three
shapes, and the shape-token table has nine shapes, not three.
**Known failures to fix:** at least three existing entries fail this law today — §2.4's Mimic Tell ("a
fill colour a few degrees off"), §2.11's Crawler Consortium ("cyan-gold"), §2.2's AI Scraper Locusts
("cyan-tinted-magenta"). All three need a second channel or a different tell.
**The one stated exemption:** the law applies to **state**, not to **identity-under-deception.** A
mimic's *unknown-ness* is encoded twice (violet fill + indistinct silhouette + Confidence Blur), which
satisfies accessibility; its *hostility* is deliberately not encoded at all until classification, which
is the game. **Write the exemption down or an accessibility reviewer will correctly flag it.**

**Variations and additions**

- **The over-claim fix — promote emission and jitter to the primary law.** Servers, racks and cables are
  *already* hard-edged boxes, so **angularity alone will not separate enemies from infrastructure at low
  zoom.** Make **"threats emit and jitter, friendlies never do"** the primary law and angularity the
  secondary one. This is a genuine correction to the shape-first framing and it costs nothing to adopt.
- **Corruption is a style state, not a colour.** A corrupted object is **the same object rendered with
  chromatic aberration plus scanline flicker** — "broken" reads as a *rendering condition*, which means
  it **survives any palette remap**, including all three colour-blind sets. The single most
  palette-independent state encoding available.
- **Motion Grammar as the third channel** — customers walk on a **steady relaxed cadence**; threats
  **skitter, hover and glitch-step.** Combined with the round-versus-angular law you can spot the threat
  mix **in a greyscale freeze-frame** — the accessibility test that doubles as the art-direction test.
  **Laminar versus glitch:** customers move in laminar eased curves; threats stutter, dart and zigzag, so
  *"even in peripheral blur or greyscale, cadence tells you which is which."*

### Decision-cost colour: spending vs committing
A distinction the UI currently lacks.

**How it works:** Actions that spend a **reversible** resource (money, error budget you can rebuild)
render in gold. Actions that spend an **irreversible** one (a one-way door, a data deletion, a contract
signature, a customer terminated, a migration cutover) render with a **distinct hatched border** and
require a two-stage confirm that names the consequence. §7.7 already calls for marking one-way doors;
make it a **colour-and-hatch class** rather than a symbol, so it survives at every zoom and in
peripheral vision.
**Interacts with:** §7.7 one-way doors, §8.8's build cards and confirm dialogs.

### Player-authored vs system-default rendering
The answer to "what did I actually decide here?"

**How it works:** Anything the player has explicitly configured — a threshold, a policy, a weight, a
shed-ladder rung, a priority class, an alert route — renders with a small **white "hand-set" tick**.
Defaults render plain. At a glance you can see how much of your system is deliberate and how much is
inherited.
**Why:** in a game whose whole late-game is configuration, this is the most common question and is
currently unanswerable. It also makes inherited/acquisition boards instantly readable: **a board with no
white ticks anywhere is a board nobody has thought about.**
**Interacts with:** §7.4 tuning, §1.2 Acquisition, the Intent layer (white is already the intent
colour, which is why the tick is white), §8.4's Handmade Layer.

### Motion language
Movement means something specific. *(Full vocabulary and the motion principles are in §8.13.)*

**How it works:** **Steady drift** = healthy flow. **Pulsing** = periodic/heartbeat. **Jitter** =
instability. **Bunching** = queueing. **Snapping taut** = saturation. **Recoil** = rejection/block.
**Dissolve** = timeout/bounce. **Slam** = hard failure. **Cling** = a held resource. **Sweep** = a
methodical scan. **You should be able to mute the colour and still diagnose the board from motion
alone.**
**Testability:** that is the most ambitious claim in §8 and it is currently eight words of vocabulary.
It becomes testable when paired with the seven threat motion primitives (§8.5) and the twelve-idle
catalogue (§4): **run the board in greyscale with motion only and see whether a tester can name the
problem.**

**Variations and additions**

- **Direction-code as a fourth motion channel** — customers flow *toward* you, toward screen centre,
  trailing a **gold motion-glow**; threats flow *inward from the edges* trailing **crimson static**. The
  two glows **never mix** (an oil/water blend mode), which makes direction itself a hostility tell before
  any silhouette resolves.
- **Reverse-flow is always hostile.** Exfiltration and egress threats move their dots **backward toward
  the edge**; stealth is rendered as **absence** — a dead patch in an otherwise pulsing cable, negative
  space as the tell. The Flow Lens reads direction automatically. **One new rule, a large readability
  win**, and it gives the motion vocabulary a term for *wrong-way*, which it lacked.

### The Readability Budget
A hard rule that governs everything — and, extended, governs agency too.

**How it works:** At any moment the screen may contain at most: **3 alert colours, 1 active overlay, 5
animated *event* FX types, and 1 modal.** Anything beyond that must aggregate. **Budgets are how you
avoid the late-game Christmas-tree problem**, and this one is enforced in the engine (the Chroma Meter,
below), not by taste.
**The FX split that makes the "5" achievable:** the FX catalogue has twenty named effects and several
are continuous states rather than events. Split it: **Ambient FX** (continuous, low-contrast, always
allowed, unbudgeted) — heat shimmer, fan blur, LED cadence, cable pulse, dust. **Event FX** (loud,
transient, budgeted at 5 concurrent) — everything with a snap, a bloom or a slam. When more than five
events fire, the lowest-severity ones **collapse into a single aggregate indicator with a count**, which
is the same rule §8.9 already uses for objects. One rule, applied to effects.
**Extended to decisions:** the budget should govern agency as well as pixels — **at most three things
marked as decisions at once, at most three promoted clocks, at most three open inbox cards.** Three
budgets, one number, applied to visuals, time and agency. That consistency is itself a design asset.

**Variations and additions**

- **The Attention Budget Rule (the motion-count phrasing).** **At most ~7 things animate at full strength
  at any moment.** Healthy idle = the LED chorus only; **only problems escalate into motion.** Motion is
  the scarce resource that directs the player, and this is stated as *the single most important rule for
  the late game.* It is the same budget as the FX split above, counted in *animating objects* rather than
  in *effect types* — publish both numbers or artists will hit one and miss the other.
- **The attention priority ladder.** **Boss > active breach > bounce-in-progress > defense firing >
  upgrade ceremony > idle life > ambient.** The FX compositor draws animation tokens from a **per-frame
  pool** down this ladder, so the budget is one dial whose effects cascade across the whole game.
- **The VFX layer budget.** **Ambient ≤10% of particles · traffic 40% · events 50%**, with events
  **preempting** ambient — an upgrade pop may legitimately kill a mote. **Enforced in the compositor, not
  by artist discipline** (which is the Chroma Meter's job, below).
- **Priority particle budget with graceful thinning.** Effects ranked **incoming-hit > loss > upgrade >
  ambient**; when the budget saturates, low-priority shimmer **thins out gracefully and never blinks
  off**, so a big wave still reads as one solid threat mass with a hit-front rather than as a stuttering
  crowd.
- **The Activity Halo.** Only entities that **changed state this minute** get full brightness; static
  systems dim to **60%**. The eye learns that **bright = story**, which is the brightness-channel version
  of §8.9's anomaly highlighting.

### The Motion Budget per Altitude
The budget that the Readability Budget misses — motion *density*, which is what actually breaks at
scale.

**How it works:** **Z1** — unlimited (you are looking at one object). **Z2** — max 3 continuous
animations per rack. **Z3** — **no per-object animation at all except state changes and the global
heartbeat**; all motion is Flow. **Z4** — motion only on arcs and weather. Enforced in engine by LOD,
not by taste.
**Why it matters:** **the Quiet Frame Test (§8.9) is unpassable without this rule.**

### The Chroma Meter
In-engine enforcement, because "should be enforced in the engine" without a mechanism is a wish.

**How it works:** A developer overlay showing live counts — distinct alert hues on screen, active event
FX types, animated elements, labels drawn, and the percentage of screen pixels above a saturation
threshold. **It goes red when the budget is exceeded.** It ships as a **player-visible accessibility
readout** too, because the players who need it will want to know.
**Interacts with:** the Readability Budget, the Emissive Allowance, the Motion Budget, §8.14.

### Per-line tint vs alert colour arbitration
A concrete rule for a collision the design creates.

**How it works:** Tenant tints and business-line tints are restricted to a **low-saturation band applied
to the Substrate layer only**, and are **suppressed entirely within the bounds of any object in a
warning-or-worse state.** In short: **alert colour always wins, identity colour retreats.** State it
once, enforce it in the renderer.
**Interacts with:** §8.9's tenant tinting (with its 12-hue cap), §8.10's districts and cross-line
collision control.

### The Foreignness Budget
How much art may deliberately break the house style.

**How it works:** Three separate ideas ask for art that breaks the house style — §1.3's colo tenant gear
"in a deliberately foreign art style," §1.2's Acquisition level "a completely different art skin," §5.4's
vendor house styles. Unbounded, this destroys readability. **Foreign art may differ only in decal, bezel
geometry, cable colour and label font — never in silhouette family, never in the status-LED language,
never in the load donut, never in the hue ledger.** A tenant's rack can be lurid and stickered and still
show a standard amber fault LED.
**Why it works:** **the alien-ness is cosmetic and the telemetry is universal**, which is also true in
real datacenters and is exactly what makes the colo fantasy land.
**Applied to your own lines:** the same budget governs §8.10's per-line material language — albedo,
roughness and one accent emissive may vary; the status-LED language, the load donut, the port studs and
the alert palette may not.

### Status Chips
One state vocabulary across the entire game.

**Visual:** small rounded chips with a one-word label and a semantic colour, used identically on device
inspectors, customer cards, the sales pipeline, the ticket queue and the alert stack: `HEALTHY`,
`DEGRADED`, `DOWN`, `DRAINING`, `PATCHING`, `COMPROMISED`, `SEALED`, `EXPIRED`, `OVERDUE`, `AT RISK`,
`PENDING`, `UNVERIFIED`. **One vocabulary, learned once, used everywhere** — and every chip carries a
shape notch as well as a colour, per the Two-Channel Law.

### The Handmade Layer
A material rule that carries enormous tone for free.

**How it works:** Anything authored by a **person in the fiction** is rendered in a distinct handmade
material set — marker, label-maker tape, ballpoint, sticky note, printed-and-taped paper, Dymo — and
**the game itself never generates anything in those materials.** Runbooks, cable labels, the whiteboard,
the "DO NOT REMOVE — ASK DAVE" note, the Days Since Last Outage board, the cursed-machine sticky note,
your own asset tags, the scrawled label you made during an incident.
**Why it matters:** **you can tell at a glance what a human decided and what the system decided**, which
is the emotional spine of §9.3's humour and §9.2's ghost-of-the-previous-admin. It also pairs with the
hand-set tick above: white tick = *you* decided this; handmade material = *a person* made this.

### Zero-State Art
Empty is authored, not absent.

**How it works:** The game is full of empties — empty racks, empty lanes, empty desks, unsold floor,
stranded capacity — and "nothing" is usually the worst-looking thing in a strategy game. So:
- **Empty U slots** show rails, threaded holes and a cable-management-arm stub, lit from above so they
  read as **invitation**.
- **Unsold floor** is clean sealed concrete with row markings already painted and a faint grid — *the
  space is ready and you haven't sold it*, which is exactly the emotional content of §6.6's occupancy.
- **An empty desk** has a chair pushed in and a dark monitor.
- **The empty lane** (§8.7) gets the strongest treatment: full lighting, perfect health, the hum at
  idle, a completely still inbound edge, and *one* piece of litter blowing across it.
**Interacts with:** §8.8's Visual Grammar for "Not Built," §8.4's Rack as a progress bar.

### The Colour Contract
The law that sits above the Hue Ledger's table: **what the two flows are allowed to feel like**, stated so
that it survives every act, overlay and palette rotation.

**How it works:** **Customer spectrum = warm gold → green. Threat spectrum = acid-green → magenta →
void-black. Money = yellow only.** The overlay wheel never breaks these per act; **only the chrome and
environment palette rotates.** Compressed to the sentence that goes on the wall: **"Warm and round =
customer. Angular and toxic = threat. Yellow = money. Never broken, in any act, any overlay, any
palette."**
**The Temperature Split as Law:** the customer lane is **always warm gold** and the threat lane is
**always cold/toxic green-magenta** *in every hosting skin* — the palette is the only constant across all
twelve identities, **so the learned meaning survives every reskin.**
**The Colour-Temperature phrasing:** customers = **warm only** (amber → gold → peach, with value carried
by saturation); threats = **cold-violent only** (magenta, violet, ice-red, with violet reserved as the
corruption signature). The screen's *mood gradient* then literally shows **which front is winning**. Even
the exception obeys it: dial-up-era threats get a **warm grey-violet**, because the rule is about
separation, not about an exact hex.
**Interacts with:** the Hue Ledger and its conflict section above (the contract is the *intent* every
candidate table is trying to satisfy), §8.10's Cross-Act Palette Guardrails, §8.14's colour-blind sets.

### The Entry-Side Contract
Screen geography is semantic: **where a thing comes from tells you what it is, before shape or colour
resolve.**

**How it works:** **Customers always enter from the bright side** — the sunlit horizon, the front door of
the internet. **Threats always enter from the dark map edges.** **Never mix origins**; this is the
backbone of glanceability, and it is the one contract that works at Z4 where everything else has
collapsed to motes.
**The Lane Law (the architectural phrasing):** customers approach from the **FRONT** — the street, the
main door, the lobby, the on-ramp. Threats always come from the **BACK, ABOVE or THROUGH** — cable trays,
vents, windows, shadows, floor grates. **The architecture teaches direction.** Exceptions are event levels
worth the drama: **a front-door brute is law enforcement — a threat you cannot fight — so the exception is
fair.**
**The demarcation, formalized:** the bright side is sun, road and towns (the economy); the dark side is a
fogged tree-line, void or water (threats). **The map border itself is the boundary: no threat sprite is
ever visible lit, and no customer is ever backlit by darkness.**
**The "red fog" edge:** the internet side sits under a subtle dark-red fog bank with drifting static
particles — the noise of the raw internet. **Threats emerge *out of the fog* with a wake; customers emerge
from the bright market-side horizon with a lens-glint.** Origin is always visually unambiguous, including
on the minimap, which then reads without labels.
**Interacts with:** §8.4's internet cloud / spawn edge (this is its rendering contract), §8.5's Attack Sky
arcs (which always come from the dark side), §8.6's visitor lanes.

### Three Elevations
Vertical separation as a sorting mechanism: **a paused frame sorts itself.**

**How it works:** **Ground level = customers. Sky lanes = network threats** (drones overhead, flood-tides
on high water). **Sub-floor grates = physical and hardware problems** (rats, cracks, leaks). Look down for
trouble, look at the road for money.
**Why it matters:** it gives the board a third axis that neither colour nor shape is using, and it means a
screenshot can be triaged by *height* before anything else resolves — which is exactly what the Squint
Test (§8.9) is measuring.
**Interacts with:** the Entry-Side Contract above (direction and elevation together fully specify origin),
§8.5's physical/environmental threats, §8.4's plenum and cable-tray layers.

---

## 8.3 Camera, altitudes, and level of detail

### The Four Altitudes
Four fixed, meaningful zoom levels rather than a continuous zoom.

**How it works:**
- **Z1 — The Machine.** One device, faceplate-level. Individual drive LEDs, port lights, labels, a
  serial number, dust. This is where you inspect and where the art shows off.
- **Z2 — The Rack / The Stack.** A rack or a small cluster with its cabling. The working altitude for
  building and wiring.
- **Z3 — The Room / The Topology.** The floor, or the logical diagram of your whole service. The
  working altitude for diagnosis and flow.
- **Z4 — The World / The Portfolio.** Multiple sites on a map, or multiple lines of business. Weather,
  regions, latency arcs, and the business dashboard.

**The six-rung expansion of the same ladder** (for art and camera authoring): **Chassis · Rack Elevation
· Room Iso · Floor Plan · Campus · Globe.** Rack Elevation and Floor Plan are the two orthographic
rungs — they are the Board register (§8.4) of Z2 and Z3 respectively, which is why the ladder reads as
six to an artist and four to a designer.

**The LOD promise:** **anything critical is visible at every altitude.** Detail is removed going up;
*meaning* never is.

**Altitudes as verbs, not zooms.** The rule that turns the ladder into the game's mode structure:
**each altitude owns a different set of actions.** Z1: inspect, tune, swap. Z2: wire, place, rack. Z3:
route, segment, triage, degrade. Z4: allocate, contract, expand, arbitrate. Changing altitude is then
changing *what you are doing*, not just how much you can see.

### The altitude transition rules
Three clauses without which the altitude system is undefined.

**How it works:**
1. **Transitions are animated and continuous, never cuts** — the animation is what teaches that the
   altitudes are the same thing.
2. **Selection persists across altitudes.** If you had a rack selected at Z2 and zoom to Z3, its parent
   room highlights and the rack stays in the inspector.
3. **The selected object's screen position may not change**, even when the *metaphor* changes (Z1 is a
   machine, Z3 is a diagram, Z4 is a map). Continuity of the thing you were looking at is what makes a
   metaphor change feel like a zoom rather than a scene change.
4. **Alarms pull the camera only on sev-1, and only with a stated, skippable 1-second move.** Automatic
   camera movement is the fastest way to make a player feel they have lost control.

### Per-Line Default Altitude
Each hosting line declares where it lives.

**How it works:** Not every line uses all four altitudes. Each **Ruleset Card declares a home altitude
and a detail altitude**, and camera defaults plus LOD budgets follow the declaration.
Shared hosting: home Z2, detail Z1. Colo: home Z3, detail Z2. CDN/DNS/anycast: home Z4, detail Z3. Tape
vault: home Z2, detail Z1. GPU/AI: home Z2, detail Z1. Wholesale: home Z4, detail Z3. **Edge/5G MEC:
home Z4, detail Z1 — there is no Z2 or Z3, because the sites are too small, and that jarring jump *is*
the line's feel.**
**Why it matters:** it resolves the three-way disagreement between "four fixed altitudes with a
universal LOD promise," "each altitude may have its own metaphor," and "DNS and CDN are basically a
world-map level." One field in the Ruleset Card and every line's camera behaves correctly.

### Alarm propagation up the altitudes
A failure at Z1 must be visible at Z4.

**How it works:** A failing drive is a red LED at Z1, a red stripe on the chassis at Z2, a red-tinted
rack at Z3, and a red pip on the site marker at Z4. **The aggregation rule is "worst state wins,"** so
you never zoom out and lose a problem. See §8.9 for the full aggregation contract (worst state, count of
non-nominal members, trend, pinned).

### Iconographic LOD and the Density Ramp
Detail collapses into symbols, not into mush — with stated LOD targets.

**How it works:** At Z3+, individual servers become glyphs; a rack of 20 servers becomes one hexagon
with a count. **Aggregate, don't shrink.** Text labels cull by priority, never by clipping.
**The concrete ramp** (a production requirement, not a guideline):
- **LOD0** — full sprite, full animation set, all lights, all labels.
- **LOD1** — sprite with simplified animation (heartbeat only), state lights, label on hover.
- **LOD2** — a glyph with a state colour and a pip; no animation except state change.
- **LOD3** — **the object ceases to exist and is represented by its parent's aggregate glyph.**
That last rung is the actual mechanism, and it is the one that is usually left unstated and then
discovered as a frame-rate problem in month eighteen.

**Variations and additions**

- **The four-level LOD pyramid with a single-channel rule.** **L0** individual machines with LEDs → **L1**
  rack doors with an LED-strip heatmap and smoke only → **L2** racks as coloured blocks in the room layout
  → **L3** rooms as glowing pixels on a campus or earth map. **Crucially, each LOD keeps exactly ONE
  information channel** — light = health, motion = load, red glow = incident — so **camera zoom is a
  filter on *meaning*, not merely on detail.** Every entity therefore defines three render levels (close =
  full sprite with LEDs; mid = block plus colour code plus glow; far = a pure glyph), and **zoom morphs are
  dissolves, never pops.**
- **The traffic language must survive abstraction.** At globe zoom, customer flow is **still a warm
  current** and threats are **still dark eddies** — **only the containers simplify, never the flow
  grammar.** This is the clause that stops the Density Ramp from quietly deleting the game's core metaphor
  at Z4.
- **Abstraction by function at board zoom.** At the business altitude, racks become **money pipes and
  capacity bars**, not server ports: per-site dashboards for MRR, headcount, incidents and cash. Zoom out
  → boxes with status LEDs; zoom in → cabling detail. At 10,000 lights, **never render them — render the
  aggregate mood**, because a region tinted red is instantly legible and a region of ten thousand red dots
  is not. Alert clusters collapse into **count-bubble groups** on the minimap.
- **Five zooms, all readable, plus a Pod view.** **Street → building → room → rack → service**, with a
  large-scale **Pod view** that collapses 500 racks into one pod block carrying a health ring. *"The
  player's map-reading skill is a progression stat."*
- **Nesting, stated as a promise.** **Globe → building → hall → rack → unit**, and **you can watch a single
  server get hammered — its LEDs strobing red — from the global map.** That is the LOD promise's most
  demanding phrasing: not merely that meaning survives, but that **one specific object's alarm is
  traceable from the top of the ladder to the bottom without losing it.**

### Semantic zoom
Detail is *replaced*, not shrunk.

**How it works:** Zoomed in you see individual drive LEDs and port labels; mid-zoom, per-server health
bars and per-rack summaries; far zoom, racks become coloured blocks and rows become bars; furthest,
facilities and regions as blocks with aggregate health. **The information survives the transition; only
its representation changes.**

**Variations and additions**

- **The declutter filter.** A **"show only problems"** toggle for triage play — the complement of semantic
  zoom, which changes *representation*; this changes *population*.
- **Cursor-proximity LOD pop.** Entities near the cursor **pop back one LOD level automatically**, so you
  never lose the thing you are pointing at to an aggregation rule. Cheap, and it removes the single most
  common complaint about aggressive LOD.
- **The packet lens.** A tool that **freezes one packet en route** as a floating label — source,
  destination, TTL, body size. **The tutorial tool that makes abstraction concrete:** *"I can SEE the
  packets."* It is also the natural inspector for the Poisoned Tint and for reverse-flow tells.

### Depth fog and focus
Atmosphere that also serves readability — using the right channel.

**How it works:** Distant/irrelevant parts of the scene lose **contrast and gain a slight value lift**
(haze), and the selected subsystem and its dependencies stay crisp (§7.2's dependency ghosting). **Focus
dim** during an incident pushes everything unrelated a shade darker.
**Critical constraint:** focus and distance may **never** use desaturation, because saturation is
permanently reserved for urgency (§8.2). A hazed healthy rack and a dying rack must never read the same.

### Camera bookmarks
Return to where you work.

**How it works:** Save camera positions per subsystem; number keys jump to them. **Essential once you
have more than one rack**, and it makes big builds navigable.

### Smart Focus
Selecting something frames it without nausea.

**How it works:** Selection frames the object with a small **dead-zone camera** so related things stay
visible. It never centre-locks — centre-locking is nauseating at high zoom and it hides the context that
made you select the thing.

### The Camera Grammar
A named shot vocabulary so cinematic moments are consistent and cheap. **Seven shots, reused
everywhere.**

| Shot | What it does | Used by |
|---|---|---|
| **Establish** | the level's authored Establishing Frame, held | level open, loading, the Signature Frame |
| **Drop** | world → building → aisle → rack | the Cold Open |
| **Snap** | a 0.25s move to an incident | clicking a ticker line or an alert; sev-1 auto-pounce |
| **Orbit** | slow rotation around a selected object | inspection, photo mode |
| **Fold** | Room ↔ Board | the two-register transition |
| **Rail** | a scripted path through your own facility | the Tour Camera, the tenant walkthrough, the ending |
| **Pullback** | a slow retreat revealing scale | endings, tier-ups, the Money Shot |
| **Hold** | the camera stops moving entirely for 2s | the quiet moment after an incident resolves |

*(Hold is the eighth and is listed with the seven because it is what §8.7's "quiet moment" actually
needs — a stated instruction to the camera to do nothing.)*

**Variations and additions**

- **The trigger rules that go with the shot list.** **Whip-pans only from pager clicks** — never
  unprompted. **Exactly one slow zoom-in per boss intro**, never two. Stated as a principle: **"the camera
  is an instrument, not a seizure machine."** The shot vocabulary above says *what* the moves are; this
  says *who is allowed to fire them*, which is the half that actually prevents motion sickness.

### The Establishing Shot
**How it works:** Each level opens with a slow 4-second push-in from Z4 to the level's working altitude,
over the Deal Sheet's audio. Free grandeur, one camera move, no art cost beyond the framing.

### The Tour Camera / The Tenant's-Eye Walkthrough
Two uses of the same Rail shot.

**How it works:** The **Tour Camera** is a slow scripted fly-through of your own facility, triggered on
demand or at level end, with your stats overlaid — **pure reward for building something**, and the best
screenshot generator in the game. The **Tenant's-Eye Walkthrough** is the eye-height version with a
slight handheld sway and a lens flare on the aisle lights, used for colo tours, audits and the ending.
**Interacts with:** §8.4's Scar Map — by Tier 5 the Tour Camera is a walk through your own record of
everything that went wrong.

### The Ceiling Cam
**How it works:** A top-down orthographic option for pure layout work — no perspective, no charm,
maximum precision. Power users will live here while building rows, and it is the natural home of the
Floor Plan rung of the camera ladder.

### The Security Camera Feed
**Visual:** a picture-in-picture mode showing a grainy, timestamped, slightly fisheyed feed from any
placed camera. Used for security events, for after-the-fact investigation, and for comedy.
**Hosting types:** essential for colo and regulated; a gag everywhere else.

### The Ghost Facility
You never lose awareness of what you left.

**How it works:** When you fly to another site, the previous one stays visible as a **dim ghost at the
map edge** with its single most salient state showing (per the Salience Score, §8.16). Multi-site play
otherwise has a fatal attention problem: the site you are not looking at is the site that fails.

### The Nobody-Is-Watching Frame
An idle-camera behaviour with a purpose.

**How it works:** If the player does not move the camera for 45 seconds during peacetime, it begins a
very slow drift along a pleasing authored path. Combined with day/night lighting and the hum, this is
the screensaver mode (§9.7) happening **during play**, and it makes calm periods feel like *something*
rather than like waiting.
**Interacts with:** P3 (peacetime is the boss), §8.9's Quiet Frame Test.

### Sort-by-Risk Camera
A button that re-frames the view on **whatever is currently costing you the most money**, not whatever
is loudest. The two are frequently different, and the difference is the lesson.

### The Attention Gravity Well
How an incident is allowed to move the camera — the refinement of "alarms pull the camera only on sev-1."

**How it works:** Incidents auto-nudge the camera **gently, and only if they are both severe AND
unobserved.** **Once seen, they stop pulling** — the well collapses the moment the player's attention has
been paid. A small **"3 incidents" stack chip** lets the player queue and step through the rest manually.
**Why it matters:** it solves alert-spam and "where do I look" with one mechanism, and it is the only
formulation that does not fight the rule that automatic camera movement makes a player feel they have lost
control.
**Interacts with:** §8.3's altitude transition rules (clause 4), §8.8's alert stack and Snap shot,
§8.16's Salience Score, which is what computes "severe."

### Landmark hierarchy for campus zoom
Orientation when everything else has been abstracted away.

**How it works:** When the Density Ramp has collapsed the estate to blocks and tiles, **persistent
landmarks carry orientation**: the **UPS pillar**, the **chiller with its visible steam-stack**, the
**generator shed**, the **badge kiosk**. They are never aggregated, never culled, and never re-skinned per
era beyond their materials.
**Why it matters:** aggregation destroys *where* along with *what*, and a landmark set is the cheapest
possible fix. *"Kids will name their datacenters by these."*
**Interacts with:** §8.9's auto-LOD collapse and label culling (landmarks are exempt from the label
budget), §8.4's facility exterior.

### Zoom is diegesis
The altitude you choose is a strategic act, not a view preference.

**How it works:** **Details lie when you are not looking at them** — the fog of infrastructure is partly a
function of where the camera is. Choosing to stay at Z4 is choosing not to see the drive lights. Later
unlocks **automate reporting so that far-zoom stays honest**, which makes "I can finally trust the
overview" a purchasable progression beat rather than a UI default.
**Interacts with:** §7.6's fog of infrastructure, §8.4's distinction between LEDs (present-tense, local,
require you to be looking) and monitoring (historical, aggregated, it looks for you), §8.8's Attention
Heatmap.

### Multi-DC split-canvas
The late-game strategic view.

**How it works:** At multi-region scale, the screen becomes **3–4 live regional windows arranged around a
central trunk schematic** — each window a real, running view of that site, not a thumbnail. **The scale
drama of running a real company**, and the natural home for the Ghost Facility's salience pips once there
are more sites than edges to park them on.
**Interacts with:** §8.3's Ghost Facility, §8.8's Wall of Mirrors, §8.10's Weather and place at Z4.

---

## 8.4 What infrastructure looks like

*Per-object visual specs are carried in §4 alongside each buildable. This section covers the shared
visual grammar of the physical world.*

### The universal object grammar
Every buildable is read the same way — five channels, all glanceable, all consistent.

**How it works:** **Silhouette** says what family it is in (compute, storage, network, defense,
facility). **Faceplate** says what model and tier. **Lights** say what it is doing right now.
**Rim-light colour** says its upgrade tier (within the Emissive Allowance — a thin rim, not a glow).
**Grime and wear** say its age and maintenance debt.
**Interacts with:** §8.16's Silhouette Sheet, which is the production gate that enforces channel one.

### Servers by shape
Form factor telegraphs function at a glance.

**Visual:** **1U pizza boxes** (thin, many, a row of drive LEDs and a power LED). **2U** (with visible
drive bays). **4U storage** (a wall of drive carriers). **Blade chassis** (a grid of slots). **GPU node**
(deep, loud, glowing, with visible finned heatsinks or coolant lines, a power cable as thick as a wrist;
it should look **expensive and slightly dangerous**). **Appliance** (a fixed-function box with a distinct
bezel and few lights).
**Health states on a server:** healthy is a slow green breathing pulse; busy is LEDs flickering fast;
degraded is one amber drive LED; failed is dark with a red fault LED and a small smoke wisp if it is
serious.

### The object catalogue (shared visual grammar per family)
*Short specs for the recurring objects, so the art bible is authorable. Longer specs live in §4.*

- **Rack** — a vertical frame with visible U-slots. Empty Us are dark gaps with rails and threaded holes
  (§8.2's Zero-State Art). A full rack looks **dense and alive**; an over-hot rack carries a heat
  shimmer.
- **Switch** — a shallow unit with a dense strip of link LEDs; each active port's LED flickers in sync
  with the traffic on its cable. Beautiful and informative, and the single best passive telemetry object
  in the game.
- **Router** — heavier, with big optic ports and a sparse but confident LED pattern.
- **Storage array** — a fat chassis packed with drive bays, each with its own LED. **A rebuild is a
  visible wave of blinking across the bays plus a progress ring** (a Ring, per the Ring Taxonomy).
- **Tape library** — a tall cabinet with a window; a tiny robot arm visibly moves cartridges. **The most
  charming object in the game.**
- **UPS** — a bank of batteries with a charge bar; on utility loss it enters a distinct "on battery"
  state with a drain timer and an audible tone.
- **Generator** — outside the building, with a fuel gauge, an exhaust animation when running, and a
  start-up sequence (crank, cough, settle) that is genuinely tense during an outage.
- **CRAC / CRAH** — a big box with visible airflow arrows; a failing unit's arrows fade.
- **Firewall / WAF** — a gate structure straddling the traffic lane; its ruleset visualized as a set of
  grates that visibly slam on blocked units.
- **Load balancer** — a Y-junction that visibly distributes; its weighting shown as how many units go
  each way.
- **Cache** — a glowing reservoir that fills; **a hit is a unit bouncing straight back out (fast,
  bright), a miss is a unit continuing deeper (slow, dim).** Cache warming shows the reservoir filling
  from the bottom.
- **Honeypot** — deliberately gaudy: a slightly-too-shiny box with a fake label. Attackers crowd it.
  Funny and readable.
- **Cross-connect panel** — a patch panel with neat fibre runs; **each one a revenue line literally
  drawn across the room.**
- **PDU** — a vertical strip with a digit display that ticks with amperage and an amp bar filling toward
  a red derate line.
- **Transfer switch / ATS** — a heavy box with two input indicators and one output, and a relay clack
  you can hear.

### Racks, front and back
Two faces, two languages — and the back view now has a reason to exist.

**Visual:** the **front** is the public face — faceplates, LEDs, labels, bezels, tidy. The **back** is
the truth — cables, power feeds, airflow, the mess. **Rotating a rack to see its back is one of the most
satisfying possible verbs.**
**How it works mechanically (the expansion that gives the verb a point):** three specific things can
**only** be done from the back view — **verifying dual-cord power paths, tracing a cable, and reading
the negotiated link speed.** Then the verb has a reason, and the player learns the real lesson: **the
front of the rack is marketing and the back of the rack is the truth.**

### The back-of-rack detail set
The specifics that make the back view read as authentic.

**Visual:**
- **Two colours of power cord** going to two PDUs — and **the single-corded machine is instantly visible
  as an asymmetry.** You can audit power redundancy **by looking**, with no overlay. This is the best
  example in the document of a diagnostic that is pure art direction.
- **Cable arms** that swing out when a machine is pulled forward — and the machine whose cabling is too
  short, so pulling it forward disconnects it. A visible hazard.
- **Velcro vs zip ties** — a purely cosmetic choice that is also a small MTTR modifier, because you can
  re-dress velcro and you must cut a zip tie. Players will have opinions. Let them.
- **Fibre bend radius** — a cable kinked tighter than its minimum radius renders with a small red arc
  glyph and produces intermittent errors. **The most satisfying "look closely and you can see the bug"
  detail available.**
- **Dust filters** that visibly discolour on a schedule.
- **The PDU mounted where the rail screws go**, so one specific U can never be used. A one-time
  installation mistake you live with forever.

### Blinkenlights as primary telemetry
Lights are not decoration; they are the readout — and the language has a stated grammar.

**Visual:** activity LEDs modulate at a rate proportional to real load. Drive lights show reads/writes.
Link lights show negotiated speed by colour. A failed unit shows a solid amber fault LED. **The room's
overall light pattern tells you how the business is doing before you read a single number.**
**The grammar** (because "LEDs flicker with load" is not enough to diagnose from):

| State | Meaning |
|---|---|
| **Steady green** | up and idle |
| **Flickering green** | working; rate ∝ load |
| **Steady amber** | degraded but serving |
| **Slow-blink amber** | **predicted** failure (SMART, thermal, pre-fail) |
| **Fast-blink amber** | rebuild or resync in progress — **the vulnerability window** |
| **Steady red** | failed |
| **Blinking red** | critical |
| **Blue** | identify / locate / selected |
| **Dark** | unpowered — **the scariest one, because "off" means you do not know** |
| **Synchronised blink across a group** | a fleet-wide operation in progress |
| **One light out of phase with its neighbours** | the odd one out — **and the whole mechanic** |

**Colour-blind safety:** each state is paired with a **distinct blink rhythm and a glyph**, so the
language survives every palette in §8.14.
**The four-way resolution (blinkenlights vs the Quiet Frame Test vs the Heartbeat Sync vs the Noise
Floor).** Four entries want the room to be simultaneously constantly-blinking, calm when healthy,
synchronized, and full of uncontrolled ambient activity. Stated hierarchy: **the global heartbeat sets a
base pulse at ~0.5Hz that everything healthy shares** (calm, synchronized); **activity LEDs modulate
brightness within the heartbeat, not independent blink timing** (so a busy room is *brighter*, not
*busier*); **only anomalies are allowed to be off-beat**; and the Noise Floor's ambient activity (techs
walking, a flickering tube) is restricted to the **background plane at reduced contrast**, never in the
same depth layer as your own equipment. Result: a healthy room breathes together, passes the Quiet Frame
Test, and **desynchronization becomes the alarm channel** §8.9 wants.
**The distinction from monitoring (resolving a tension with §7.6's fog of infrastructure):** if LEDs are
readable telemetry, what does buying monitoring get you? **LEDs are present-tense, local, and require
you to be looking. Monitoring is historical, aggregated, remote, and it looks for you.** An
uninstrumented machine's LEDs work perfectly at Z1 and it is fogged at Z3 — you can diagnose it if you
walk to it and watch it, and **you will never know it had a problem at 3am.** That single sentence makes
both systems coherent and maps exactly onto the real difference between "I can see the drive light" and
"I have a graph."

**Variations and additions**

- **The LED Chorus.** Realistic rack LEDs blink in **calm randomized green patterns** — the healthy idle
  screen is genuinely hypnotic, **the game's fish tank.** When something goes wrong the pattern **breaks
  locally**, pulling your eye with no UI arrow at all. From far away the rack-LED field forms readable
  patterns (heat, load, attack direction): **the datacenter as a living dot-matrix display.**
- **A status-pattern dictionary — the grammar for the chorus.** One 8-entry table, drawn once per act in
  that act's era palette: **breathing idle** (calm) · **waterfall left→right** (throughput; speed = load)
  · **scattered amber flicker** (degraded hosts) · **sync-strobe magenta** (under active attack) ·
  **all-off-sudden** (the outage). *"Players will read racks like pilots read engine instruments."*
- **Role rhythm per service class.** All servers are the same rack unit; **their ROLE is legible via
  front-panel glow and LED rhythm** — web = a steady flicker, DB = heartbeat pulses, GPU = angry and
  constant, backup = a slow roll. Master the LED grammar before adding anything else to the object.
- **The blink ladder.** Healthy = a **sleepy green pulse**; load = a **fast green flicker**; degraded =
  **amber breathing**; down = **solid red plus fan spin-down audio.** *"Everything is Blinkenlights — the
  authentic NOC experience, made playable."* **A wall of racks blinking in unison is the game's signature
  shot**, and expert players read the room's blink at a glance — skill expression built directly into the
  visuals.
- **Stress collapses the constellation.** A healthy rack is a **constellation of slow asynchronous
  twinkles**; stress **collapses it into an urgent strobe** — *"the horror of all lights turning red at
  once. Rhythm carries emotion."*
- **LED patterns tell ambient stories** — idle = breathing, busy = flicker, **hacked = the wrong
  pattern** — so the floor itself glances into gameplay information.

### Does the healthy rack blink? — *CONFLICTING*
Whether a healthy, idle rack should be **visually active at all.** The two positions are mutually
exclusive rules for the same pixels: one makes calm blinking the game's signature ambience and reserves
*pattern break* as the alarm; the other makes **stillness** the healthy state and reserves *any* pulse as
the alarm. The decision determines what the Quiet Frame Test (§8.9) is actually testing, and whether the
Heartbeat Sync has anything to synchronize.

#### Position A — the chorus camp: healthy racks blink *(master, and opencode's wave-1/wave-2 passes)*
**Healthy idle IS a calm randomized green blink** — hypnotic, the game's fish tank, and its single most
authentic detail. Master's grammar makes this precise: **steady green = up and idle · flickering green =
working, rate ∝ load**, with the **global heartbeat setting a base pulse at ~0.5Hz that everything healthy
shares**, activity modulating **brightness within the heartbeat rather than blink timing**, and **only
anomalies allowed to be off-beat.** A room full of breathing racks is the signature calm image (§8.13's
Breathing LED), and **desynchronization is the alarm channel** (§8.9's Heartbeat Sync and Cadence). Under
this position a healthy room is *active and synchronized*, and only the **pattern break** signals trouble.

#### Position B — the anomaly-pulse camp: healthy racks are still *(opencode)*
**"99% of things that are fine must be *still*: quiet racks don't blink; only degraded units pulse, and
pulses escalate in tempo with severity. The player's eye is a triage instrument; don't misuse it."** Under
this position motion is spent *only* on problems, the Attention Budget is trivially satisfied, and the
Quiet Frame Test passes by construction — at the cost of the fish tank, the LED Chorus, the blink ladder's
healthy rungs, and the Cadence's "calm as synchrony" reading, all of which become unbuildable.

**What the decision turns on:** whether ambient motion is a *reassurance channel* worth its attention cost
(A) or an unaffordable tax on the eye's triage budget (B) — and, downstream, whether §8.9's Cadence
("nothing is happening, rendered as an achievement") has a visual to render at all.

### Link LED colour language
Negotiated speed, readable from across the rack.

**How it works:** Port LEDs encode negotiated speed by colour — a real convention. So **a 10G port that
negotiated 1G is the wrong colour and visible from across the rack without an overlay.** The
duplex/speed mismatch threat becomes findable by eye, which is exactly the kind of *reward the player
for looking* design the loose-cable detail already does well.

### The half-dead link
Directionality, rendered.

**How it works:** A cable's flow pulses have a **direction**, and a unidirectional failure shows pulses
going one way and **none coming back**, while both end LEDs stay green. **A player who learns to look
for return pulses has learned something real** — and one-way audio, asymmetric routing and a blackholed
return path all become visible with one rendering rule.

### Health as flow, not bars
A link's health lives in the behaviour of its particles.

**How it works:** **Smooth** = healthy. **Stuttering** = packet loss. **Backed-up** = congestion.
**One-directional** = an asymmetric routing problem. **None** = down. A player learns to read flow the
way an engineer reads a graph, and no health bar is needed on a cable at all.

**Variations and additions**

- **Traffic pulses, not counters.** **Pulse frequency = req/s**; colour shifts hot when saturated; a
  stalled queue shows pulses **piling up like bumper-to-bumper cars** — the traffic-cam metaphor, instantly
  understood by everyone. Bandwidth reads as **pulse density AND strand thickness**; idle connections go
  dim, overloaded ones **flare**; congested links **bulge red**, backup pipes **frost over** while a
  restore runs. *"Your plumbing is the art."*
- **One visual law explains four stats.** Particle **spacing** = throughput · **speed** = latency (a
  saturated link slows every dot and they visibly **pile up behind the queue**) · **jitter** = vibration
  amplitude (a shuddering stream is VoIP dying, readable before any ribbon moves) · **loss** = a dot that
  simply **stops mid-cable and dissolves.** Four metrics, one particle system, no legend.
- **Cables have bodies.** They **sag** slightly, **bundle** into trunks, **vibrate under high bandwidth
  like a strained rope**, and glow on the logical-view toggle. A cut cable **whips, sparks, then droops.**
- **Optical power as a glow.** Fibres visibly **dim and brighten with dBm health**; a **dirty connector**
  glows with a faint halo of dust motes; a healthy fibre pulses clean gold; **a flapping link strobes like
  a dying fluorescent tube** — everyone on earth knows that flicker, which makes it instantly legible with
  no tutorial whatsoever.

### Airflow direction as a visible object property
**How it works:** Each device carries an **airflow arrow** on its silhouette: **front-to-back**
(correct), **back-to-front** (some network gear; reversible fan trays are a purchase), or
**side-to-side** (most switches, which is the real problem). In the airflow overlay, a side-exhaust
switch **blows visibly into its neighbour's intake.**
**Why it is good:** this is a genuine, common, invisible-until-you-know thermal problem and it makes a
beautiful spatial puzzle — the correct answer is a side-to-front duct kit, which is a real product you
can buy and which looks funny.

### Cable colour coding
Colour is a language, and nobody agreed on it.

**Visual:** the player picks a convention (or inherits a mess in acquisition levels). Consistent
colour-coding gives a small MTTR bonus and a tour-score bonus. **The joke and the mechanic are the same
thing.**
**The hue-budget resolution:** player-chosen cable hues would collide with the Hue Ledger, so **cable
colour convention is applied as a sheath band near the connector only**, drawn from a restricted palette
of six deliberately desaturated "cable" hues that sit outside the semantic set. The cable's *body* still
carries the Flow language (brightness, pulse, sag, direction). **Convention on the ends, telemetry on
the middle.**
**The house convention** (the default the game ships with, per the style guide): amber = copper · aqua =
fibre · black/red = power A/B · grey = out-of-band · violet = cross-connect · white = "temporary" (and
nothing in a datacenter is more permanent than a white cable).
**The tray:** overhead runs colour-coded by function — yellow single-mode fibre, blue copper data, red
crossover/legacy, black power, orange OM2 legacy fibre, aqua OM3/OM4. When a player standardises, the
map becomes legible. When they don't, it is a mess. **Colour discipline as visual reward.**

**Variations and additions**

- **The Cable Palette — your house style as your identity.** Players **choose their own colour-coding
  standard at founding** (power red? data blue? uplinks yellow?) and the game renders every cable by it.
  **Good palettes measurably speed up triage** — a real in-game skill expressed as an aesthetic, so form
  *is* function. Two consequences fall out for free: **rival "guest technicians" and intruders are caught
  by the palette** when they mis-colour a patch (a Where's-Waldo security audit made playable), and
  **screenshots carry your palette**, which makes them brandable shareables.
- **The Cable Channel Contract.** The grammar over-allocates the cable: medium colour, load pulse, money
  stream, error stutter and threat family is **five channels on one object, which is soup.** Fix by
  reassignment: **base hue = medium · luminance + width = load · SURFACE TEXTURE = threat family**
  (spikes, oil, keys, frost — *patterns*, not colours, per the Two-Channel Law) · **money rides as a
  separate elevated stream *above* the cable, never inside it** · **errors = stutter + spark.** Document
  it under that name; it is the cable's version of the Ring Taxonomy.

### Fibre/copper hue assignment — *CONFLICTING*
Which medium owns which hue. Three incompatible assignments are on the table, and because cable colour is
the most-repeated object in the game — and because the house convention is what players will standardise
on and then screenshot — this cannot be left to the artist who paints the first tray.

#### Position A — the house convention *(master)*
**Amber = copper · aqua = fibre · black/red = power A/B · grey = out-of-band · violet = cross-connect ·
white = "temporary."** Applied as a **sheath band near the connector only**, from a restricted palette of
six deliberately desaturated "cable" hues that sit **outside the semantic set**, so the cable's *body*
stays free to carry the Flow language. **Convention on the ends, telemetry on the middle.** The overhead
tray adds the real-world set: yellow single-mode fibre, blue copper data, red crossover/legacy, black
power, orange OM2 legacy fibre, aqua OM3/OM4.

#### Position B — the wave-1 doctrine *(opencode)*
**Fibre = yellow laser lines · copper = cyan dashes · power = amber.** Connections pulse with traffic once
live. Directly contradicts Position A on both media, and puts cyan — which master reserves for *legitimate
traffic in motion* — onto a static object.

#### Position C — the wave-4 inversion *(opencode)*
**Copper Ethernet = yellow with slow pulses · fibre = white-blue with fast light-travelling streaks ·
power = thick black with a subtle 60Hz hum shimmer · console/management = green dashed · bundle count =
trunk thickness with a braided texture.** Exactly inverts Position B's fibre/copper assignment, and is the
only position that gives **bundle count** a channel.

**What the decision turns on:** whether cable hue is allowed inside the semantic palette at all (A says
no, B and C say yes), and whether the *medium* or the *speed of light through it* is the thing the colour
is supposed to teach. All three agree that whichever is chosen must be published once, in the legend, and
never re-cut.

### Cable archaeology
You can date a rack by its cabling, and the game should let you.

**Visual:** old cable colours persist. A facility that has been through four eras has beige Cat5, grey
Cat5e, blue Cat6 and aqua fibre all in the same tray. Nothing forces a re-cable; the strata accumulate.
**Interacts with:** §8.10's era shifts, §1.2's acquisition levels, §8.4's Scar Map.

### Progressive disclosure of cables
**How it works:** Above Z2, physical cables stop drawing individually and become **link ribbons** between
racks whose **width is aggregate bandwidth** and whose behaviour still carries the Flow language. The
cable plant becomes a flow map. This is the Density Ramp (§8.3) applied to the one object class that
would otherwise become a grey haze at Z3.

### The power tree as a visible circulatory system
**The single most valuable visualization in the game.**

**Visual:** utility → ATS → UPS → PDU → RPP → rack PDU → outlet, rendered as a **glowing branching
structure in the power overlay**, in **Copper** (never gold — gold is money), with **current flowing as
animated particles** and **thickness ∝ capacity**. Amperage bars fill toward a red derate line; circuits
near their limit pulse. **When a breaker trips, you see the branch go dark, and you see exactly what was
downstream of it.**
**Interacts with:** §8.7's FX_BreakerTrip, the two-cord asymmetry audit above, §8.8's blast-radius
overlay.

### Cooling, CRAC units, and airflow
Air as a visible medium.

**Visual:** faint cold-air mist from perforated floor tiles, heat shimmer above hot aisles, containment
curtains, fan blur. In the thermal overlay, **cold air flows blue from perforated tiles into cold
aisles, gets pulled through racks, and exits hot and orange.** Bad layouts produce visible
**recirculation eddies** — hot air looping back to intakes — that the player can literally see and fix
by adding blanking panels. **Blanking panels, the cheapest, dorkiest, most effective datacenter
improvement in existence, should be a satisfying little click-to-place item.**
**When cooling fails:** **the shimmer grows and spreads and the room's colour temperature climbs** — a
five-minute-long visual warning before anything throttles.

### The heat bloom
The cooling failure, rendered as an area effect.

**Visual:** an **expanding orange gradient across floor tiles** with a temperature number, creeping
toward a red threshold. Machines inside it show throttling — their clock-speed readout drops, their
performance bar shrinks. **A slow, spreading, terrifying AoE that reads instantly.**

**Variations and additions**

- **Heat expression at object scale.** **Orange fog rises from overtaxed racks**; objects inside it
  visibly **sag and desaturate**; cooling **squeegees the fog back like a windshield**; and a **frost
  line** marks exactly where cold air meets hot.
- **Indoor weather from failed cooling.** Heat's opposite failure gets equal diegetic poetry:
  **condensation** — water beads forming on ceiling tiles, drips landing with **ripple rings** on racks,
  mist curling off hot units.
- **Cooling failure as a spreading sunset.** Readable across the whole map **even while paused**; the GPU
  level is a real-time thermal overlay you can *feel* — cold blue aisles, hot glowing zones, and an
  **orange creep climbing the racks before anything throttles.**
- **The heat lens (hold `H`).** A **thermographic camera mode**: everything renders as a thermal wash —
  **cold = idle or gone, hot = busy, white-hot = failing.** One button answers "what is wrong in this
  room" at any density, and it is **diegetically real**, because every sysadmin owns a thermal camera. Its
  siblings: a **global false-colour heatmap toggle** (load / heat / attack-pressure, with normal detail
  dimmed) — *"the player's binoculars"* — and a **cost overlay that renders everything in $/s auras**, so
  economic play becomes spatially legible.

### Thermal ride-through as a draining reservoir
**How it works:** When cooling fails, don't just start heating things — **drain a visible blue reservoir
whose size is the thermal mass you bought.** Containment makes the reservoir *smaller* and the racks
cooler at the same time, which is the counterintuitive tradeoff rendered in one image and needs no text
at all.

### The generator and the lighting shift
Power loss is a whole-scene event.

**Visual:** utility fails → the room drops to **UPS battery lighting** (dimmer, cooler, with a very
distinct emergency tint) → the generator starts (a crank, a cough, a shudder) → **warm light returns but
slightly different in colour temperature** → transfer. **The entire scene's lighting narrates the power
chain**, and the battery-lit interval is the most tense-looking thing in the game.
**Production note:** this needs an **exact colour-temperature spec per state** (utility / UPS /
generator / emergency-only / dark) in the art bible, or three artists will produce three "slightly
wrong" lightings and the narration breaks.
**If the generator does not start:** three seconds of silence before everything dies. The most dramatic
beat available.

### The facility exterior
**Visual:** a small side-view of the building — the generator yard with a fuel tank and a visible level
gauge, the chiller plant, the utility transformer, the meet-me room, the loading dock with pallets.
**Weather happens here.** A fuel truck arriving is a visible, reassuring event; a fuel truck that
doesn't arrive is a visible, unreassuring absence.

### The Window
Every facility has exactly one window to the outside.

**Visual:** it shows the weather, the time of day, the season, and during a hurricane level, the storm.
**One asset, enormous atmosphere return, and it is the only place the player sees "outside."**
**Interacts with:** the Diegetic Clock (§8.8), time-of-day lighting, §8.10's Z4 weather.

### The internet cloud / spawn edge
Where traffic comes from.

**Visual:** a stylized boundary at the edge of the board — a cloud, a horizon, a bank of upstream
routers — from which visitors and threats emerge. At Z4 it becomes actual geography.

### Cross-connect ladder racking
The colo signature image.

**Visual:** overhead ladder racking dense with orange fibre jumpers running to the meet-me room. **Each
strand is money** (§6.6), and a well-populated meet-me room should look obviously valuable — and with
the money-follows-cables rendering (§8.7) it literally **glitters**.

### Labels, and label quality as a visible investment
**Visual:** a labelled port has a tiny readable tag; an unlabelled port shows a `?`. You can zoom in and
read the labels. **In a crisis, labelled infrastructure is literally faster to interact with** because
you can find the right thing — a mechanical MTTR effect delivered entirely through art.
**The Label Plate Aesthetic:** in-world text (hostnames, rack IDs, circuit numbers) renders as **Dymo
tape, printed label, or Sharpie on tape** depending on era and on how hurried the player was. **Labels
made during an incident are visibly scrawled.** Best detail in the document, and it is the Handmade
Layer (§8.2) doing its job.
**Label quality rises with ops investment**, and a colo tour visitor's satisfaction visibly rises
walking past tidy rows — a cosmetic system with mechanical consequences.

**Variations and additions**

- **Rack Labels as micro-texture.** **Hand-written label-maker tape on everything** — *"MAIL-01 — do not
  touch, Karen."* Micro-texture of authenticity that doubles as a **scan anchor** for the eye, and labels
  **update as you rename**, so the fiction and the data never drift apart.

### Wear, grime, and dust
Time made visible.

**Visual:** dust accumulates on unmaintained gear, filters discolour, labels yellow and peel, cable ties
get replaced with tape, a chair ends up in the hot aisle, an unlabelled box appears. **A clean room and
a filthy room should be instantly distinguishable**, and the maintenance-debt overlay (§7.6) is just
this turned up.
**The Wear Channel Triad (resolving one channel doing three jobs):** grime currently signals *age*,
*maintenance debt* and *neglect* at once. Split them — **dust = time since last touched** (accumulates
everywhere, meaningless alone), **discolouration/yellowing = age of the asset** (never cleans up), and
**disorder — loose cables, tape, a propped door, a box on the floor = maintenance debt** (the one that
has mechanical consequences). Three channels, three meanings, all readable at Z1.
**Mess is a leading indicator:** neglected infrastructure accumulates visual mess, mess predicts
incidents, and cleanup is a spendable staff-hours action.

### Cable management debt as a rendering penalty
The best marriage of mechanic and rendering in the section.

**How it works:** An empty rack is clean rails. As you add gear, cables accumulate. A well-managed rack
has neat vertical bundles and velcro; **a neglected one grows a spaghetti nest that physically obscures
the equipment behind it, making it harder for the player to click on things.** The messiness is a
gameplay penalty expressed as a rendering penalty, and it is completely true to life.
**Interacts with:** §8.4's back-of-rack view, the MTTR modifier, the colo tour score.

### Cables tell your story
**Visual:** early, a rat's nest. After investing in cable management: combed, colour-coded, labelled.
Purely cosmetic except for the tour-score bonus and a small maintenance-speed bonus — **and that is
enough to make players care enormously.**

**Variations and additions**

- **Cable Management as an Art Score.** Velcro-tidy bundles versus spaghetti. **Ignored cables droop to
  the floor, staff trip on them, and rodent risk rises**; tidy cables earn visible polish *and* a real
  statistical payoff (airflow and inspection bonuses). **A slow "bundle" action is a zen minigame for
  perfectionists**, and elevated cable trays form a genuine third layer of the room.
- **Cable-tray realism-lite.** Cables **sag on physical trays** — overhead bundles in colo, glowing
  conduits on network layers — and "cable management" is visibly the difference between neat tray runs and
  a chaotic nest with hanging loops. **Pure environmental storytelling, no UI required.**
- **Management as a playstyle tradeoff.** A **sloppy drape is faster to build** but produces **snag events
  during faults** (a cable pull trips something); **dressed Velcro runs are slower to place** but give
  cleaner reroute previews. *"Players flex screenshots of their cable runs. (Yes. Really.)"*

### The rack as a progress bar
**How it works:** An empty rack filling up over a level is **the most satisfying visual progression the
theme offers.** Make it deliberate: gaps look bad, tidy fills look great, and the "one more U" feeling
should be a genuine motivator. Pairs with Zero-State Art (§8.2) — the empty Us have to look like an
invitation for the fill to feel like an achievement.

### Auto-generated rack elevations
**Visual:** any rack can be viewed as a proper printed elevation diagram with U numbers and device
labels — **the same picture a real DC hands you.** Doubles as a shareable artifact (§8.17's Rack
Portrait), as the Rack Elevation rung of the camera ladder, and as the Z1 working view for racking.

**Variations and additions**

- **The Bookshelf Elevation.** The front/back elevation renders units as **spines on a shelf** — **1U is a
  paperback, 4U an encyclopedia, and blank slots are gaps in a well-loved library.** The rack's *reading
  history* (who was here before) ghosts on hover. **This is the placement UI for RU-scarce colo acts** —
  the "4U into a 2U gap" bonk is readable at a glance — and **tidy spines versus wedged-askew volumes is
  the cable-management score applied to racks.**

### The elevation-vs-reality diff
**How it works:** An overlay that draws the **documented** rack elevation as Ink Blue linework over the
**actual** contents. Mismatches highlight. **Running it in an acquisition level is a horror show.
Running it in your own facility after two years is a quieter horror show.**
**Interacts with:** §8.8's Diff View, §7.6's fog of infrastructure, §1.2's acquisition.

### The cage nut
**Visual:** a micro-animation for racking — the cage nut, the cage nut tool, and occasionally a tiny red
particle (a bloodied knuckle). **Every person who has done this will make a noise. It costs four
frames.**

### Cold-aisle breath and the hoodie
**Visual:** the cold aisle is genuinely cold — visible breath at Z1, techs in hoodies, and a small space
heater under a desk in the NOC that is plugged into something it absolutely should not be. **One frame
of set-dressing that says "this is a real building" better than any amount of grime.**

### The Scar Map
Make incident history a place, not a stat.

**How it works:** Every major incident leaves **one small permanent physical trace at its location** — a
scorch mark on a PDU, a patched floor tile where the leak was, a replacement panel in a slightly
different beige, a length of cable in the wrong colour, a fire-suppression nozzle with its seal replaced.
**They never clean up automatically.**
**Why it matters:** by Tier 5 your facility is a readable history of everything that went wrong, and the
Tour Camera becomes a walk through your own record.
**Interacts with:** §1.6's Scars stat, §8.12's Incident Poster, §8.17.

**Variations and additions**

- **Persistent battle-damage decals.** Scorch marks, tape, padlock residue, sticky notes and re-cabled
  runs **accumulate for the level's duration** — *"your base is a painting of your fight."* The end-level
  grade screen **pans over it like a war memorial**, and **a perfect level looks pristine: that is the
  brag.**
- **Scars as fortifications.** A zero-day meteor that **fizzles against your patched zone** leaves a small
  scorch mark with a tiny flag planted on it, and **later waves visibly route around it** — *"vaccination
  as set dressing; your scars are your fortifications."* It is the only mechanism in the document that
  makes a *successful* defense leave a permanent physical mark.

### Sticker archaeology
**Visual:** gear carries stickers from its era — asset tags, warranty voids, "PROPERTY OF," a dead
vendor's logo, a previous owner's hostname scratched out. **Inherited gear in the acquisition level is a
whole visual story told in stickers**, and it costs a decal atlas.

### The phantom cabinet
**Visual:** an empty cabinet, lit, with your asset tag on the door and an invoice glyph floating above
it, found during `The Reconciliation`. **Paying rent on nothing, rendered.**

### The Fresnel zone
**Visual (WISP / fixed-wireless lines):** a translucent ellipse drawn between two towers, with terrain
and vegetation intruding into it. Seasonal leaf-on visibly narrows it. **Line of sight rendered as a
volume rather than a line** is both correct and unusual, and it makes tower siting a spatial puzzle.

### The two registers: Room vs Board
The game renders in two visual registers and you switch between them constantly.

**How it works:** **The Room** is the physical diorama — warm, lit, material, where you *feel* the
business. **The Board** is the topology/schematic — flat, cool, precise, Ink Blue, where you *reason*
about it. **The same state, two languages**, and real engineers do exactly this all day in two browser
tabs. Each register reveals problems the other hides.
**The Two-Register Fold (the spec for the transition, which is one of the game's signature moves):**
**0.6 seconds.** The camera lifts to orthographic while objects **flatten toward their faceplate plane**
and cables **straighten from catenary to orthogonal routing in the same motion.** Lighting flattens out;
materials lose specularity; the floor becomes a grid. Reversing restores in the same time. **Objects
keep their screen position throughout** so you never lose what you were looking at — **that continuity
is the entire trick.**

**Variations and additions**

- **Physical versus logical, as a single `Tab` key.** The Board register flattens everything into a clean
  node diagram in one of two dialects: a **dependency subway map** (lines = flows, stations = services,
  colour = health, styled like a real metro map and **printable from photo mode**), or **edges colour-coded
  by dependency criticality** (red = you will crash without it). Either way it carries **the same topology
  re-projected**, which is the abstraction that makes 100-entity debugging possible at all.
- **Rack Lights versus Boardroom Lights — the dual aesthetic layers.** The **infrastructure floor**
  (blinkenlights, fibre, fans) and the **business floor** (dashboards, conference tables, phones) render
  **the same event twice**: red racks below, war-room phones lighting up above. It is the CEO's constant
  translation between *"what is broken"* and *"who is calling"*, and it makes the Room/Board fold a
  vertical move as well as a flattening one.

### Chassis mood and posture
Expression without a face — the emoting channel that is legal under every position of §8.1's "How much
face?" conflict.

**Visual:** **Hot rigs sweat** (condensation plus fan-mist). **DDoSed boxes tremble.** **Idle boxes
breathe** (a slow LED pulse). **Dying boxes' fans spool down and their lights fall one by one.**
**Building posture language:** **racks stand straight when healthy, lean slightly under sustained load,
and slump when degraded** — so **a tired company visibly slouches before any meter turns red.** Pareidolia
extended from the face to the *spine*, which is the version that survives being zoomed out.
**Interacts with:** §8.13's Breathing LED and Fan Blur Ramp, §8.9's anomaly highlighting (a slumped rack in
a straight row is the odd one out), §8.14 (posture is a shape channel and survives every colour-blind
palette).

### Rack-face close-ups and per-server micro-fiction
What Z1 is actually *for*.

**Visual:** Zooming into a rack flips to a **front-panel view** — LEDs blinking per load, screens with fake
dashboards, cables coming and going, and **per-server micro-fiction**: someone has taped a cat photo to
the ESXi box, and there is a shrine of config printouts by the legacy machine nobody dares reboot.
**Contact shadows under racks** and **dust motes in cold-aisle light beams** are the scale cues that make a
hall feel huge; at campus zoom the whole building **breathes with a slow convection haze.**

**Variations and additions**

- **Server Faceplate Zoom (business attributes).** Zoom any rack or unit to a **"label" UI** showing
  **which product it serves, which customer cohort, and margin per unit** — *"real operators know their
  boxes by who's on them."*
- **Rack-LCD micro-gauges.** Per-buildable status as a sliver of **2-line character LCD** on the front
  panel, exactly like a real rack PDU or iDRAC: `CPU 71% / LOAD OK`. **Tiny monospace text as texture** —
  unreadable at distance, but **the glow colour behind the characters is the data at a glance.**
- **Decals carry state history.** The cat photo **fades if the box survives hot**, earns a tiny **"veteran"
  paw-print border at five years uptime**, and gains a sticky note with the last incident's one-liner
  (*"fixed SSL — do not touch"*). The micro-fictions become a **readable maintenance log**, which merges
  the charm layer with the diff/patch overlay's information role.
- **The Rack "Dollhouse" Zoom.** Building → room → rack (**doors open, U-slots visible, LEDs blinking,
  cabling spaghetti exactly where you were cheap**) → service topology. At the rack tier, the physical
  details — dust, zip-ties, unlabelled cables — **comment on your maintenance style.**
- **The Rack X-ray.** Zooming *into* a server shows its insides: **drives spinning, a thermal gradient,
  patch level as a "vaccination sticker."** Clicking drives and slots to diagnose makes hardware levels
  tactile, and zooming further turns a *service* into a tiny room with **internal queues visible** —
  customers lining up at the DB counter.

### Connection-visualization alternatives to wiring
All worth prototype-testing, because cables are a commitment.

**How it works:** **Cables stay the default** — physical, tactile, and their clutter-at-scale is a feature
rather than a bug. The alternatives, each with a stated strength and cost:
- **Light Cones** — a connection as a translucent beam flaring at both endpoints. **Gorgeous at scale,
  weaker infrastructure feel.**
- **Circuit Traces** — links as PCB copper that **etches itself in.** Perfect for dial-up and garage-era
  levels.
- **Pipe-and-Valve** — power, cooling and backup as literal water and air lines **you can throttle.**
- **Star-Map Threads** — CDN and multi-DC links as glowing world-map threads with **travel-time
  sparkles.**
**Why it matters:** three of the four are already needed *somewhere* (§8.10's CDN, §8.4's cooling loop,
§8.1's PCB Plan-view), so this is a menu of registers rather than a menu of replacements.

### The Cable-Legend Poster
The tutorial that is a prop.

**Visual:** A **diegetic legend hanging inside the HQ**, zoomable. **The tutorial never explains cables —
you walk past the poster.** It doubles as the screenshot artifact for the community, and it is where the
player's chosen Cable Palette is rendered once, authoritatively.
**Interacts with:** §8.4's Cable Palette, §8.8's tutorial-free onboarding, §8.17's shareables.

### Server Ghosts and Orphaned Records
Haunted hardware as a visual contract — and config drift cast as the supernatural.

**Visual:** Decommissioned or failed machines **flicker into the LED chorus for one beat, translucent,
doing their old duty** — a ghost rack lights green when its replacement stutters, *"the old one is
helping."* After a restore from backup, **the encrypted husk stands in the aisle until it is
memorialized.**
**The orphan layer:** DNS entries for servers that died years ago, crons pointing at dead hosts, switch
ports still configured for a rack sold in 2019 — they **drift through the halls at night as faintly
translucent icons.** An orphan can **resolve**: an attacker registers the dangling name, and **subdomain
takeover becomes a haunting made playable.** Audits **count the ghosts**, and **laying one to rest is a
tiny satisfying exorcism with real defensive value.**
**The visual contract:** **ghosts are customer-warm in colour but *wrong* in shape** — the only sanctioned
ambiguity in the threat grammar, and it is telegraphed as *"this is not an attacker, it is your own
past."*
**Interacts with:** §8.4's elevation-vs-reality diff, §7.6's fog of infrastructure, §8.2's Intent layer
(a ghost is the opposite of an Intent ghost — a promise that already expired).

### The Floor is a Schedule
Wear as a record of traffic.

**Visual:** **Under-floor tiles glow where cable trays run hot.** **High-traffic routes polish a shine into
the floor**, so a well-served level **literally looks worn-in.** The floor is the one surface that records
*where people and packets actually went*, as opposed to where the plan said they would.
**Interacts with:** §8.9's row rhythm and floor signage, §8.4's Wear Channel Triad (this is *dust* running
in reverse), §8.8's Attention Heatmap.

### Rack Beasts
The small ambient ecosystem.

**Visual:** **Cable rats and dust bunnies wander behind the racks** — semi-joke, semi-lore. They **chew
neglected cables**, which is real maintenance pressure (go inspect your panel), and **a tidy server room
never sees them.** They make the big room feel *inhabited* **without spawning more gameplay entities**,
which is the whole trick.
**Interacts with:** §8.4's cable management debt, §8.13's Idle Fidgets (Rack Beasts live on the background
plane and are excluded from the Motion Budget).

### Day/night, timezones, and the shift-change ceremony
The clock made human.

**Visual:** Facility lighting **cycles with real time-of-day**; overseas NOC staffing means **the night
side has dimmed desks but still-glowing racks**; a **cleaning robot zips around on the night shift** while
staff go home and automated alerts keep blinking. *"The sun setting over the CDN map while your traffic
river migrates westward"* is the signature beauty shot.
**The shift-change ceremony:** at the day/night boundary there are **visible handoffs** — lanyards passed,
the sky swaps, the audio re-voices, the flashlight sweeps begin.
**Interacts with:** §8.8's Time-of-day lighting and the Diegetic Clock, §8.12's Night Shot, §8.4's Window.

### The interior light-temperature channel
A mood channel players read without knowing they are reading it.

**Visual:** **Warm interior light = happy ops.** It **creeps cooler and dimmer with incident load**, and at
crisis the fluorescents gain that unmistakable **"fluorescent-office-2am" buzz.** One global light
parameter, continuously varying, carrying the same information as the reputation dial and never once
asking for screen space.
**Constraint:** it modulates **colour temperature and intensity only** — never saturation, which is
reserved for urgency (§8.2).
**Interacts with:** §8.1's Lighting Model, §8.4's generator lighting shift, §8.7's company-health colour
script.

### The rack-aisle perspective shot
The store-page image, specified.

**Visual:** **A receding aisle into soft fog, your territory lit door-by-door, and a power dip rippling
darkness from the far end.** One of the small number of shots that sells the game on sight — and, unlike
most key art, it is composed entirely from assets the game already ships.
**Interacts with:** §8.3's Rail shot and Tour Camera, §8.17's Key Art Direction, §8.12's Night Shot.

---

## 8.5 What threats look like

*Per-threat visuals live with each threat in §2. The shared rules are here, plus the catalogue of
threat-visual specs — including the business and financial threats that wave 1 left without any visual
expression at all (see §8.18).*

### The threat visual contract
Every threat is readable in **five** ways.

**How it works:** **Silhouette** (family), **colour** (magenta family, with a hue shift per class),
**motion signature** (how it moves is how it behaves), **telegraph** (how it announces itself before it
lands), and — the fifth channel added in wave 2 — **scale** (a threat's rendered size is proportional to
its pressure on you, not to its raw traffic volume, so a small well-countered flood renders small).
**The acceptance bar:** **you must be able to identify a threat class from the silhouette at Z3 with the
colour removed.** Enforced by §8.16's Silhouette Sheet and the 16px-in-motion test.

**Variations and additions**

- **The stricter acceptance bar — 20px, outline-only, any zoom.** Threats must be **readable at 20px and
  from the outline alone at any zoom.** Flood swarms are exempt from *identification* at that size and
  instead **read scale instantly as the volume of the swarm** — which is the correct thing for a flood to
  communicate anyway.
- **Recognizable payloads as the design brief.** Every enemy is **a packet-shaped metaphor for the
  protocol it abuses**: the SQLi serpent has **quote-marks for scales**; a DDoS is **an ocean of identical
  grey blobs** (packet-fish); ransomware is **green skull fog**; phreakers are **retro phone-helmet
  gremlins.** **Reading the attack from its silhouette is how the player learns the theme while playing.**

### Motion as behaviour (the seven motion primitives)
The animation *is* the mechanic — and there is a fixed vocabulary so it is testable.

**How it works:** A volumetric flood is a **wall** that advances. A slow-drip attack is a **thin thread**
that barely moves. A scanner **sweeps** methodically. A bot swarm **clusters and disperses.** A
Slowloris **clings** — arrives, sits down on a connection, and just stays. A mimic **moves exactly like
a visitor until it doesn't.** An insider threat **originates inside the board.** Ransomware
**crystallizes** outward from a point. **Never explain a threat's behaviour in text if you can show it
in motion.**
**Seven primitives to author against:** *advance* (wall) · *drip* (thread) · *sweep* (scan) ·
*swarm* (cluster/disperse) · *cling* (occupy) · *mimic* (indistinguishable) · *crystallize* (spread
along links). Every threat in §2 is one primitive plus modifiers, which is what keeps the animation
budget finite.
**Testability:** with the seven primitives named, the greyscale-motion-only test (§8.2) becomes a real
QA pass — mute colour, mute labels, and see whether a tester can name the attack.

**Variations and additions**

- **Threat *grammars*, not just shapes.** A coarser sort that sits above the seven primitives and stops
  families being confused for one another: **units** (insects, hoodies, crabs) · **slime** (a worm
  spreading by adjacency) · **flood** (a DDoS as a **black rising waterline**, not units at all) ·
  **clock** (slow attacks as fog that creeps). **Never confuse which grammar a threat is in** — a flood
  rendered as units is the single most common readability mistake available.
- **Motion = intent.** **Everything heading for a DB carries a red tether** — the attack's *target* is
  announced by its path, not by a label. *"Players learn the language by wave 2."*

### Silhouette rule for threats
Every threat family has a silhouette readable at thumbnail size.

**Visual:** *volumetric* = a dense swarm blob or a rising tide; *application* = a single sharp angular
dart; *slow/persistent* = a thin trickling worm; *insider* = a normal-looking sprite with one subtly
wrong property; *physical/environmental* = an overlay effect on the board rather than a unit at all.
**Never require the player to read a label to know what is coming.**

### Threat class marks
A mark you learn once and then see everywhere.

**Visual:** **volumetric** = three stacked chevrons · **application** = a bracket pair · **physical** = a
cracked square · **legal/abuse** = a stamp corner · **human** = a silhouette head · **environmental** = a
wave · **financial/commercial** = a torn receipt edge. The bestiary card shows the mark, and **the mark
reappears on lanes, alerts, the threat's telegraph, and on the defenses that counter it.**

### The Counter Match
Players learn the counter table from the icons themselves.

**How it works:** **Every defense object's icon visibly contains the mark of what it stops** — the
scrubber icon contains the volumetric chevrons; the WAF contains the brackets; the abuse desk contains
the stamp corner; the badge reader contains the silhouette head. No tutorial, no table, no wiki: the
matching is visual and it is present at the point of purchase.
**Interacts with:** §8.8's build cards (which already show the Surface icons a build adds), §5.4's
Codex.

### Telegraphs
Nothing lands without warning — but the warning is proportional to the right thing.

**Visual:** a horizon glow before a flood; a rising audio tone; radar contacts on the edge; the forecast
widget (§7.9); an approach band at the edge of the board showing icon, size indicator and target hint
for 5–15 seconds before arrival. **Preparation time is what separates a strategy game from a reflex
game.**
**The honest rule (the wave-2 correction):** **the telegraph is proportional to the threat's *pressure
cost*, not to its danger to you.** A huge, loud, well-countered volumetric telegraphs enormously and
does nothing. A small quiet thing you have no answer to telegraphs faintly. **That makes
telegraph-reading a genuine skill — you learn to ask "big for whom?"** — instead of a proportional
warning system that does your thinking for you.
**Five telegraph grades:** *none* (entropy, hunters, insiders — see below) · *instrument-only* (a
needle moves, if you own the instrument) · *edge contact* (a radar mark) · *horizon* (a glow and a tone)
· *cinematic* (the full Wave Telegraph, §8.12).
**The reservation clause:** **entropy and hunter threats have no horizon glow, no radar contact, and no
dashed path.** Their only telegraph is a subtle change in an instrument the player may or may not own.
**Reserving the big cinematic telegraphs for volumetric and scheduled events makes them mean something,
and makes the quiet threats genuinely quiet.**

### The unidentified state
Threats arrive violet.

**Visual:** an unclassified contact is a **violet blob with an indistinct silhouette** and maximum
Confidence Blur; as inspection layers work on it, the silhouette resolves, the blur sharpens, and the
colour **snaps** to its true class with a small **identification flash** (a one-frame blue flash, per
the Flash Language). **Classification is the most-repeated visual event in the game and it should feel
great.**
**Protected by:** the Hue Ledger's reservation of violet for *unidentified only*.

### Attack landing (the impact language)
Impact needs weight, and each family gets its own verb.

**Visual — the shared four-element impact:** a **1-frame red flash** on the target, a **directional
impact spark** on the face it came from, **a chip of the target's health bar breaking off and falling**,
and a **magenta grit puff.** Four cheap elements, unmistakable in a crowd.
**Outcome variants:** blocked = a shield ripple and a **FX_Deflect**; damaged = a flinch and a red
crack; breached = a hard slam and a brief desaturation.
**Per-family verbs:** **volumetric** — the pipe visibly clogs and packets back up. **Application-layer**
— a dart that lodges in a specific service and pulses. **Exploit success** — a component flickers to the
attacker's colour and stays tainted. **Physical/environmental** — the board itself shakes, darkens or
heats. **Never a generic explosion.**
**Screen-shake:** reserved for genuine severity (see §8.13's four-event shake budget).

**Variations and additions**

- **The Impact Vocabulary — a four-move lexicon, plus a fifth.** **Blocked attack** = a shield-spark at
  the wall plus a coin-save *ting*. **Packet loss** = the affected customer goes **translucent and
  re-forms** — ghosting instead of deletion, so it reads as *uncertain, retrying*. **Breach** = a
  localized **glitch-tear with red data-motes spilling.** **Full failure** = a **desaturation drain.**
  Every event has **one motion, under 0.5s, and never covers its own victim.** **The fifth move:
  throttle/block = a visible turnstile nudge** with a customer "stumble-recover" animation, so **friction —
  the game's central tax — gets its own sub-half-second motion instead of a number.**
- **Consequences localize.** A hit building **glitches its own sprite with a red vignette pulse and a
  short data-spill**; **the screen only flashes fully red on total failure.** Feedback is *pointed*, never
  spammy.
- **Each attack type's impact has a unique particle silhouette.** **Injection = ink splatter · flood =
  sandstorm puff · malware = frost crystals · exploit = a puzzle piece jamming into a socket** — *"never
  generic sparks."* The generic component of a hit is a **2-frame chromatic split, a 3px shake and an LED
  stutter**, and nothing more.
- **Impact ≠ damage.** Attacks landing produce **object-specific reactions**: a DB hit by SQLi **does not
  explode, it "opens up" and pages fly out**; ransom = a frost crawl; a fine = paper snow. **The response
  tells you the story of the vulnerability**, which is a teaching channel the generic-impact version
  throws away.
- **Screen-level failure grammar.** **Brownout = a vignette. Freeze = desaturation plus a frost UI.
  Outage = the affected map region loses its glow entirely and goes physically dark**, like a city seen
  from space losing power — **the biggest possible read at the widest zoom.** A successful intrusion
  **flashes the border with corruption frost for 3s while the camera gently pushes toward the breach
  site** — the game pointing at what it refuses to make a popup about.
- **The company-health colour script.** **Golden hour when thriving → steel blue when squeezed →
  emergency crimson vignette pulsing at 60bpm.** *"The player feels the state before reading it."*
- **Failure is cinematic, not cryptic.** When something gets through, a **zoomable cause-chain animation**
  traces **attacker path → the guard gap → the victim → the loss amount floating out** — the game teaches
  causality at the exact moment of maximum attention. A **critical service death dips time to 40% for 1.5s
  on the failure bloom** and then snaps back: unambiguous, and *"it feels like a sports broadcast."*

### Persistence and infestation
Some threats stay.

**Visual:** a compromised node grows a subtle corruption — a dark vein pattern, a flickering
wrongness — that spreads along trust links if untreated. **Visible slow corruption is far scarier than a
damage number.**

### The Poisoned Tint
The missing failure axis: wrong-but-serving.

**How it works:** "Traffic as light" covers slow, dropped and queued, but not **wrong**. A node that is
serving **incorrect or stale data at full speed** carries the **Poisoned Tint** — a thin, wrong-hued
film over its output flow (a sick greenish cast, deliberately outside the semantic palette), so the
flow looks healthy in motion and wrong in colour. **FX_PoisonTint.**
**Why it matters:** cache poisoning, a bad deploy serving the wrong content, replication lag serving
stale reads, a DNS hijack and a corrupted backup are all this failure, and none of them had a visual.

### The Threat Gantry
The bestiary as portraits.

**Visual:** each threat has card art in a consistent frame — **a specimen under glass**, with its name,
class mark, first-encountered date and lifetime cost. **The single best art showcase in the game**, and
it earns itself through play.

### Attack telegraphs and the radar sweep
**Visual:** **FX_PrismSplit** — a single incoming contact resolving into its constituent sources as
analysis completes. The radar sweep at the board edge fills with contacts ahead of a wave; the sweep
rate is a function of your detection investment, so a poorly-instrumented player has a slow, sparse
radar and finds out late.

### The threat catalogue — technical threats
*Short visual specs; full mechanics in §2.*

- **Volumetric DDoS** — not individual enemies: **a rising tide** at the map edge that fills your uplink
  pipe. The pipe is drawn as an actual pipe with a fill level against your capacity line. When it
  saturates, **legitimate visitors visibly cannot get in — they pile up outside.** The visual
  communicates the crucial truth that **your servers are fine and irrelevant.** Scrubbing shows the tide
  passing through a filter and emerging thin.
- **L7 / application DDoS** — units that look *exactly* like real visitors until a detection tower
  reveals them, at which point they flip to a red-outlined silhouette. Before detection the player sees
  a traffic graph that is suspiciously high and has to decide. **Perfect fog-of-war visual.**
- **Slowloris / slow-drip** — units that arrive, sit down on a connection and just stay: **slumped,
  grey, motionless figures occupying slots**, with a visible connection-slot meter draining. Spidery
  units that reach the gate and *cling*. Visually infuriating in exactly the right way.
- **Bot / scanner** — small insects that crawl the perimeter probing for openings; **they cluster
  instantly on anything newly exposed.** A newly-opened port should attract a visible swarm within
  seconds — the best possible teaching visual in the game.
- **Brute force** — a persistent rain of tiny hammer icons pattering against an SSH door sprite, with a
  counter ticking up. **Constant, harmless-looking background texture that you eventually stop
  noticing — which is the point.**
- **Credential stuffing** — a rain of keys hitting a lock, with a counter and an occasional key that
  turns.
- **Exploit** — a sharp, fast projectile with a CVE label; it either **shatters on a patched service**
  or **punches through and leaves a glowing breach marker.**
- **Intrusion / web shell** — once landed, **invisible** unless you have FIM/EDR. With detection built,
  it renders as a small pulsing spore inside one of your machines, occasionally emitting an outbound
  thread toward the map edge. **Chasing that thread is the investigation.**
- **Ransomware** — a **creeping crystalline frost** that spreads node-to-node along dependency links,
  turning healthy data blocks into locked grey ones. **You can watch it walk the network, which makes
  segmentation viscerally valuable.** Air-gapped assets are visibly outside its reach.
- **Insider** — no visual at the perimeter at all. **It appears inside, which is the point.**
- **BGP hijack** — on the world map, your prefix's traffic-flow arrows visibly **reroute to a POP that
  isn't yours**, drawn in an alien colour. **You see your own traffic leaving you.**
- **Hardware failure** — deliberately undramatic: a dull thunk, an LED going amber then red, a carrier
  icon appearing in a "needs replacement" tray, a fan icon stopping, a PSU showing a red cross, a small
  wrench icon. Plus **an audible beep** — the real, hateful, unmistakable chassis alarm. **Muting it
  should be a button that does not fix the problem.** The boring killer.
- **Thermal event** — a heat map bleeding blue → orange → white with a countdown to thermal shutdown.
- **Power event** — the room lights literally change: utility (white) → UPS (amber, with a hum, and a
  visible runtime countdown) → generator (a warmer, flickering tone with an exhaust plume outside).
- **Fire** — VESDA detectors chirp, an aspirating smoke effect, the alarm strobe, the pre-action
  countdown, then the suppression discharge: **a white gas flood, a deafening acoustic shock, and total
  silence as everything stops.** The sting: **half your drive LEDs turn amber afterward from the
  noise.** The only genuinely dramatic visual in the game, saved for rarity.
- **Nation-state** — visible only as an **absence**: a faint anomaly marker in your logs that you only
  see if you built the right tooling. A barely-visible shimmer.
- **Duplex/speed mismatch** — see §8.4's Link LED colour language: findable by eye, if you look.

**Variations and additions — the roster, drawn**

*Concrete sprite-level readings for the same threats, gathered from every pass. Where two readings exist
for one threat they are both kept: they are alternative silhouettes for the same primitive, and the
choice is an art call rather than a design one.*

- **SYN flood** — **a wave of pixel hands reaching for handshakes that never close.**
- **Slowloris** — **squatting mushrooms**, or **a crab latched onto a port.**
- **SQLi** — **a visitor with a slightly-too-big backpack** (the quote-mark glint is the tell) · **a
  pickpocket in a customer coat** · **a lockpick figure at the DB's door** · **a syringe riding a brown
  "HTTP box" toward your database** · or, at its most legible, **a customer-mask slipping to a grinning
  mask.**
- **Ransomware** — **a black blob wrapped in caution tape** · **a padlock-headed giant chaining racks** ·
  **a spreading green padlock stain.**
- **APT** — **a faceless suit with no footprints**, visible only inside SIEM radius, that **moves only
  when unobserved and recedes when watched.**
- **Nation-state** — **a near-transparent slow shape seen only against detection towers**, or a
  near-invisible silhouette carrying a pair of binoculars.
- **Botnet** — **identical grey drones**, or **a murmuration of dots.**
- **Cryptominer** — machines **slowly glowing orange with a little pickaxe hovering over them.**
- **Malware / webshell** — **a black vine spreading across the shared-hosting block.**
- **Brute force** — **masked figures rhythmically rattling doors.**
- **DDoS** — **a rising flood**, or a **swarm of red motes converging on the edge choke point**; the
  swarm's *volume* is the scale read.
- **Defacement = physical graffiti.** A defaced homepage becomes **a giant neon tag slapped over your
  lobby facade**; cleaning it **requires a change-management action**, and reputation loss **scales with
  how long it stays visible.**

### The threat catalogue — business, financial, legal and commercial threats
*The wave-1 gap. These were mechanically defined and had no picture at all.*

- **The Chargeback** — money flowing **backwards** out of your cash bar as red coins, with a small
  receipt-shaped sprite that **tears in half.**
- **The Review Bomb** — a one-star sprite lands on your storefront and **visibly narrows the acquisition
  lane** — the lane geometry literally pinches. **Demand reduction should be spatial.**
- **The Competitor's Poach** — a rival-branded truck drives up your lane and one of your client figures
  gets in.
- **The Churn Wave** — client figures standing up, one after another, in a ripple across your customer
  board, and walking out the door in a line. **Silent. No explosion. Far scarier.**
- **Bad Debt** — invoices that turn yellow, then brown, then **crumble into dust on the floor.**
- **The Processor Freeze** — a **padlock slams over the Cash bar**; incoming coins stack up *outside*
  it, visible and untouchable. Maddening in the best way.
- **The Vendor Price Hike** — an envelope sprite that opens into a letter, and **every affected object
  on the map gets a small red "+$" badge simultaneously.** Mass, instant, visceral. **FX_TariffWave.**
- **Ransom DDoS** — a black envelope with a skull; accepting it animates coins leaving and the attack
  wave dissolving, which should feel **gross.**
- **The Abuse Ladder** — a physical **traffic-light totem from your upstream**, visible at the top of
  the map: green → amber → red. **When it goes red your uplink cable visibly unplugs itself.**
- **Abuse complaints** — accumulate as a visible stack of envelopes on the abuse desk. Ignored ones pile
  into a **leaning tower.** When the tower topples, your upstream calls.
- **Concentration risk** — the whale's revenue contribution rendered as a **visibly load-bearing pillar
  holding up your company's floor.** When they threaten to leave, **the pillar cracks.**
- **The Regulator / auditor** — walks in **through the front door, not the network.** A calm figure with
  a clipboard who cannot be shot at; **defenses visibly do nothing to them.** They stop at objects and
  put a red or green checkmark on each. **Non-violent, deeply stressful.**
- **Regulatory / legal threat (general)** — a paper envelope that walks in the front door, immune to
  every firewall. **Wonderfully deflating and thematically perfect.**
- **Law enforcement (bulletproof levels)** — a scripted arrival: vehicles at the loading dock,
  badge-access logs, and **racks being physically removed from your map.** Played straight; it is more
  chilling that way.
- **The diligence analyst** — a quarter-zip figure who walks the floor taking photographs, and whose
  unanswered requests appear as **empty labelled shelves** in the diligence room (§8.7).

**Variations and additions — the business lane's own cast**

*Economic threats rendered as economic sprites, each readable even when the game is paused and zoomed
out.*

- **The chargeback** — **a paper-airplane envelope** (or a **bouncing red rubber stamp**) that lands on
  the billing building and **removes a coin.**
- **The subpoena** — **a sealed letter that walks unhurriedly and cannot be shot at.**
- **The regulator** — **a suit icon that scans your compliance tower**, sweeping it like a barcode.
- **A Spamhaus listing** — **a black smear across your netblock banner.**
- **A VoIP toll-fraud bill** — **a letter bomb that unfolds absurdly long** across the screen: dot-matrix
  paper, endless `$` columns. **Comedy, dread and instant comprehension in one prop.**

### Specimen Cards on Hover
The codex delivered at the point of need.

**How it works:** Hovering any threat **pauses nothing** but flips up a tiny **field-guide card**:
**protocol abused · target it prefers · counters that hurt it**, each rendered as an icon rather than a
sentence. **Every encounter becomes a learnable sentence**, and the bestiary stops being a screen the
player has to remember to open.
**Interacts with:** §8.5's Threat Gantry (the same card art, in its specimen-under-glass frame), §8.5's
Counter Match (the "counters that hurt" row is the mark-matching made explicit), §8.8's growing tooltips —
the card gets richer as your knowledge does.

### The Threat Horizon
Forecast as a UI idiom rather than as a widget.

**How it works:** A **top-of-map strip of silhouettes massing on the Internet road** — the coming wave
rendered as **shadowy shapes with question marks**, the weather-forecast grammar borrowed wholesale.
**Click a shadow for details.** It delivers pacing information **without cluttering the map**, and it is
the strip version of the radar sweep for players who never learned to read radar.
**Interacts with:** §8.5's telegraph grades (the Horizon is the *edge contact* and *horizon* rungs given a
permanent home), §7.9's forecast widget, §8.8's bezel off-board register.

### The Attack Sky (the geo-arc threat map)
The famous "DDoS attack map" aesthetic, as a first-class layer.

**How it works:** On world, CDN and regional maps, threats arrive as **literal red arcs drawn from their
geographic origin.**
- **Arc density and thickness = per-source flood strength**, so a country-sized swarm of script kiddies
  paints a beautiful, readable cone.
- **Spoofed sources flicker off.** The arc *cannot decide* where it came from and renders as **jittery
  dashed lines** — a packet-spoof tell that needs no tooltip.
- **Scrubbing centres visibly catch arcs mid-flight**: a diverted arc **bends down into the treatment
  plant.** The detour mechanic rendered as the literal thing players have seen on real NOC walls.
- **Arcs always come from the dark side**, honouring the Entry-Side Contract (§8.2).
**Interacts with:** §8.10's CDN and DNS lines (whose home altitude is Z4), §8.5's radar sweep, §8.7's
blackholing and null-route visuals.

---

## 8.6 What visitors look like

*Wave 1 specified the generic mote and a handful of archetypes; most archetypes had no visual at all.
This subsection carries the full catalogue (see §8.18).*

### The patience ring
The single most important visitor visual.

**Visual:** every visitor carries a thin **Ring** (per the Ring Taxonomy) that depletes clockwise as it
waits. Full ring = happy; depleting = impatient; empty = gone. **Readable at any zoom as a
silhouette**, and the whole latency economy (§3.1) is legible from it.
**Variant encoding for small motes:** where a ring is too small to read, patience is carried by
**trailing tail length** — a shortening tail is an impending bounce. Same information, less area.
**The three-stage LOD (the production requirement that keeps the promise honest):**
- **Z1/Z2** — the full ring, per-unit.
- **Z3** — the ring is dropped; patience is carried by **Aggregate Patience** (below).
- **Z4** — patience is carried by the lane's colour temperature only.
Without this, "the ring is readable at any zoom" and "aggregate, don't shrink" contradict each other.

**Variations and additions**

- **Readable wallets.** **Luggage sized to their contract value** — a whale drags a steamer trunk, a
  hobbyist carries a backpack — so *worth* and *patience* are two different attached objects rather than
  two encodings on the same ring.
- **The patience ring as a loading-spinner halo.** At scale you read **the crowd by its ring-colour
  distribution** rather than any individual ring, which is the per-unit version of Aggregate Patience.
- **Patience as a shrinking shadow.** An alternative encoding for dense scenes: patience is **a slowly
  shrinking shadow underfoot**, which costs no ring area at all and survives being overlapped.
- **Need-icons overhead.** What they actually want, as one glyph: **latency = a clock · bandwidth = a fat
  arrow · price = a coin.** Three icons, and the crowd's *demand mix* becomes readable at a glance.

### Aggregate Patience
Reading visitor health when there are no individual visitors.

**How it works:** At Z3/Z4, where individuals become a particle field, the patience ring is replaced by
**the stream's colour temperature and coherence**: a healthy stream is **tight, bright and fast**; a
suffering one is **spread, dim and slow, with visible fraying at the trailing edge where the bouncers
are.** Resolves the conflict above and is, if anything, more readable than a thousand tiny rings.

### Segment-coded appearance
Who they are is visible.

**Visual:** costume and colour variations by customer segment — the hobbyist, the agency, the enterprise
buyer, the whale. **Value as size and glow** is the simplest possible legibility for "this one matters."
**The five-channel mapping (per §8.2):** **shape = duration class** · **ornament = value** · **prop =
archetype** · **livery = business line** · **ring = patience.** No channel does two jobs.

**Variations and additions**

- **The base customer reading.** Little avatars — bloggers, gamers, suits, bots-in-disguise — **walking
  fibre "roads" toward your building**, carrying a patience bar and a coin pouch. **Churn turns around and
  takes the pouch with it**, and **bad reviews hang a tiny protest sign on the fence.**
- **Breeds as characters.** **Hobbyists** (backpacks) · **SMB** (little storefront badges, or a blazer and
  briefcase) · **Gamers** (a glowing headset) · **Whales** (limousine sprites — *"ants, cats, whales — the
  scale joke writes itself"*) · **Researchers** (a lab coat dragging a giant progress bar). **Size = MRR,
  tint = mood** (green content → amber → red furious).
- **The empathy engine by segment.** The costume's job is to make you *care*, not merely to classify:
  **hospital = clipboard and sterile badge**; **backup customers = anxious people carrying boxes of family
  photos** — which makes **restore literally "delivering the boxes back"**; **gamers in hoodies and clan
  colours**; **dev = glasses, enterprise = suit, grandpa = dial-up.**

### Client avatars and the Suit Gradient
Clients as individually-rendered figures you learn to read.

**Visual:** clients are chunky figures with a **nameplate** showing MRR, term, and a tiny support-burden
icon (a headset with 1–3 bars). **You learn to read a prospect's profitability from their silhouette
before they arrive.**
**The Suit Gradient** — visual class signalling that is fun and readable: **hoodie** = developer ·
**polo** = SMB · **blazer** = enterprise · **hard hat + clipboard** = auditor · **lanyard + broker
badge** = colo tour · **sunglasses and a briefcase** = the grey tenant · **quarter-zip** = the diligence
analyst · **high-vis** = a vendor or a courier.

### The Whale
**Visual:** literally larger, moves slower, casts a longer shadow, and everything near them gets a faint
gold tint (gold is money and a whale *is* money, so this is legal under the Hue Ledger). Rendered as a
**Diamond** shape token with a slower patience ring and a much bigger bounty. **When a whale's renewal
window opens, their shadow starts pulsing.**
**Interacts with:** §8.5's concentration-risk pillar, §8.8's Concentration Donut.

### Customer faces
Churn made personal.

**Visual:** every customer is a tiny portrait with a mood (a **Halo**, per the Ring Taxonomy). **A wall
of happy faces turning amber one by one during a slow degradation is more affecting than any number**,
and it makes churn feel personal instead of statistical.

### The conversion moment
The payoff beat.

**Visual:** a visitor reaching the goal node performs a small satisfying flourish and emits a **gold
coin mote** that arcs to the money counter (**FX_CoinArc**). **This is the reward loop's entire visual
language and it happens thousands of times, so it must be tiny, crisp, and never annoying.** One-frame
white flash = something was served (per the Flash Language, §8.13).

**Variations and additions**

- **Satisfaction expands the node.** A **happy served customer leaves a little coin trail *and* grows
  seats** — the serving node's seating visibly expands, so success is legible on the *infrastructure* and
  not only on the counter.

### The bounce
The loss beat — and the most important visual in the design, because the whole game is about making
invisible losses visible.

**Visual:** patience ring empties → the visitor **dissolves into a puff and drifts backward** off the
board (**FX_BouncePuff**), greying as it goes, with a tiny "$" ticking off and a small down-tick sound,
leaving a faint grey mark on the path where it gave up. **A trail of grey marks along a slow path is the
best diagnostic in the game.** A mass bounce event looks like **smoke blowing back out of your
building**, which is exactly the right emotional read.
**Contradiction and resolution.** ⚔️ "Every bounce is individually visible so loss is felt" directly
conflicts with "aggregate, don't shrink" and the particle field — at Tier 4 you cannot render ten
thousand individual bounces. **Resolve with a guaranteed-individual subset:** high-value units (Buyers,
Whales, Reviewers, Enterprise, anything above a value threshold) are **always rendered individually at
every altitude**, with their own bounce animation and sound; everything else aggregates into the
particle field with a density drop and a single tally. **Loss is felt where it matters and legibility
survives** — and it is economically correct, because losing a skimmer should not feel the same as losing
a checkout.

**Variations and additions**

- **Retry ghosting.** A bounced customer who *retries* **ghosts back onto the road semi-transparent with a
  small "×3" badge.** The retry storm otherwise has **no silhouette at all**, and *"crowds of the
  translucent"* becomes an instantly learnable dread pattern — the same visual family as packet-loss
  ghosting: **not-there-but-hurting.**
- **Bouncing deflates them.** The sprite **visibly deflates** as patience runs out, so the bounce has a
  wind-up as well as a payoff.
- **Churn is a cardboard box.** A churning customer **walks out carrying a cardboard box**, and departing
  units **leave with a grey cloud.** **If the path is fixed before they reach the exit they turn back** —
  forgiving, readable churn, and the single most motivating three seconds in the game.

### The false-positive flash
The most important negative feedback in the document.

**Visual:** when a defense blocks a legitimate visitor, the blocked entity flashes **amber** — never
magenta — and a small amber tick appears on the defense that did it. **You should feel a tiny wince
every time**, because that was a paying customer. A warm sprite hit by your own defense, flashing your
own defense's colour: **the player must feel friendly fire.**
**The two upgrades that make it survive production:**
**(a) The tick accumulates.** The amber tick on the offending defense becomes a **visible running
count** that persists, so an over-tuned defense becomes **progressively uglier** the more harm it does.
**(b) At volume it becomes a haze.** A one-frame amber flash is not observable at scale, and this is the
document's stated most-important negative feedback. At high false-positive rates, the flashes aggregate
into an **amber haze around the offending defense** — **you should be able to see over-tuning from Z3 as
a coloured cloud, without reading a number.**
**Protected by:** the Hue Ledger's reassignment of amber to *your own defenses harming you*, which is
what makes the haze unambiguous.

### Word-of-mouth tokens
Satisfaction propagates, visibly.

**Visual:** a delighted customer emits a small green mote that travels to the spawn edge and returns
later with a friend. A happy visitor occasionally **splits into a small golden duplicate** that walks
off-screen and comes back later as a new signup. **Retention rendered as a visible compounding loop**
rather than a percentage.

### Crowd density as a particle field
At scale, individuals become flow.

**How it works:** Below a threshold, discrete entities with rings. Above it, a **continuous particle
stream whose density, colour and velocity carry the same information.** The transition is smooth and
automatic. **The only way to render a million requests a second without lying.**
**At the largest scale:** visitors become **rivers of traffic** whose width is throughput and whose
colour is health, and threats become **weather** — a DDoS at scale should look like a **storm front
rolling toward your edge**, which is far more intimidating than a thousand sprites and far cheaper.

**Variations and additions**

- **River over Sprites, with a stated merge rule.** Above a density threshold, individual customer dots
  **auto-merge into flowing ribbons**; the merge/split point **is** the traffic LOD. Ribbons **run laminar
  when healthy and *fray* under saturation**, and **ribbon colour = average satisfaction**, so the
  warm-gold law applies at every scale. A **"traffic-jam heatmap"** turns a lane's pressure into **literal
  river width.**

### Latency as literal drag
**Visual:** packets **visibly slow down** passing through inspection layers. A stack of five defenses
looks like molasses. **Players should be able to see their latency budget being eaten**, and the Latency
Ladder (§3.1) then needs no explanation at all.
**Interacts with:** §8.7's "traffic as light" (latency is speed), A8.7's before/after overlay.

**Variations and additions**

- **Slow = taffy.** Under latency, sprites **stretch like taffy**; buffering renders as **spinning halos.**
  The inverse is equally important: **fast service is a brisk walk with a little hop at checkout** — you
  can *see* performance without a graph.
- **Latency as visual sickness.** When service degrades the **whole scene gets subtle jank**: animations
  stutter, frames deliberately repeat, colours desaturate. **The player feels lag before they read it** —
  *"your hardware's motion IS the metric."*
  **Constraint:** deliberate frame-repeat and desaturation both collide with reserved channels (§8.2
  reserves saturation for urgency; §8.14's Reduced Motion mode must be able to switch this off), so this
  effect ships behind the reduced-motion translation table and never applies to the Annotation layer.

### The queue made visible
Waiting is visible and countable. *(See also §8.7's queue-as-physical-stacking.)*

**Visual:** when capacity is exceeded, visitors **stack up in a visible line in front of the saturated
component**, and the line's length *is* your queue depth. **Watching a line form is a far better alert
than a number.**

### Session and duration classes
Not all visitors are instants — **the shape of the visitor tells you the shape of the business.**

**Visual:** a page load is a **dot/circle**. A game player is a **teardrop that persists** at the node
for the length of their session. A backup job is a **square that grows** as it transfers. A SIP call is
a **line held between two points.** An inference request is a **dot that sits and glows while it
computes.** A training job is **not a unit at all** — a big translucent block that lands on a cluster
and *occupies* it.

### The visitor catalogue
*Per-type visitor specs. This is the fix for the archetype gap, and each entry doubles as the
"visitor form" asset in the Five-Asset Skin Kit (§8.10).*

- **Web pageview** — a small rounded packet with a page glyph, moving quickly, tinted by content type.
- **API call** — a tiny, fast dart; they arrive in streams that read like a flow of sparks.
- **Game player** — a small avatar with a **ping number floating above it**, colour-coded green →
  yellow → red as latency climbs. They **visibly rubber-band** when latency spikes, and **when the ping
  goes red they turn around.** Iconic and instantly legible.
- **Streamer** — arrives **with a crowd of small player-motes following behind them.** Losing the
  streamer means watching the crowd turn around and follow them off-screen. Devastating and clear.
- **DNS query** — a swarm of nearly-invisible specks, so dense they render as a **stream, not units**;
  a fine drizzle.
- **Email** — an envelope; outbound envelopes get stamped **ACCEPTED / DEFERRED / REJECTED** at the far
  edge, which makes deliverability legible at a glance, with a spam-folder side channel.
- **Backup job** — a **big, slow freight-train crate** that occupies the link for a long time, with a
  progress bar and a window deadline. **Watching one fail at 94% is the level's emotional core.**
- **Restore job** — the same crate, going the other way, **glowing red-orange and urgent**, with a
  countdown and **a customer figure standing at your door watching it.** That single visual sells the
  entire backup business model.
- **Inference request** — a **glowing prompt bubble** that queues visibly at the GPU, "thinks" with a
  spinner, **emits tokens as a little stream** while being served, and leaves brighter. Darting
  hummingbirds, in contrast to training's armoured convoy.
- **Training job** — an enormous parked sprite sitting on 8 GPUs with a **day-counter** and a
  **checkpoint pip every N hours.** If it dies, you see it **rewind to the last pip.**
- **SIP call** — a **persistent thin line that must remain unbroken**; jitter renders as a wobble or a
  fraying edge, packet loss as visible gaps, **one-way audio as an arrow that only points one
  direction.**
- **Streaming viewer** — a small eye icon; **rebuffering shows as a stutter ring.**
- **Colo prospect / tour group** — 3–4 walking human figures with clipboards on a **fixed path through
  your facility**, pausing at things, with an impression meter and **thought bubbles showing what they
  notice**: tidy cabling 👍, an unlabelled cage 👎, a security mantrap 👍, a puddle under a CRAC 😬.
  **The path is the level.**
- **Dial-up caller** — a phone handset icon that either connects (a handshake squiggle on a modem-bank
  channel lighting up) or **gets a busy signal** (a red bounce with the classic two-tone).
- **IoT device** — a speck; hundreds of thousands of them render as **dust**.
- **Block (blockchain)** — arrives on a metronome, perfectly regular, which is itself the tell when it
  stops.
- **Referral** — the golden duplicate described under word-of-mouth.
- **The Support Vampire** — trails a little cloud of **ticket envelopes that accumulate visibly.**
- **The grey tenant** — sunglasses and a briefcase; pays in advance; their cabinet renders opaque.

### Parcels and state bubbles
What the customer is carrying, and what they leave behind.

**Visual:** Customers **haul labelled boxes** — their data, their requests — and **leave boxes at the door
when you are slow.** **Visible backlog is your queue stat**, sitting physically on the doorstep rather
than in a counter. Each figure carries a **ping bar**, a **patience fill** and a **wallet-glint when they
pay**.
**Why it matters:** it gives the queue a *customer-side* rendering to sit opposite §8.7's node-side
stacking — the same number, seen from the street.
**Interacts with:** §8.7's queue as physical stacking, §8.6's bounce (a customer who leaves takes their
boxes), §8.6's patience ring.

### The Jitter Stutter-Walk
The motion grammar for VoIP, game and any real-time line — and the distinction the document was missing.

**How it works:** Served units **walk on beat**, on a metronome gait. **Under jitter, each figure's steps
arrive early or late** — a stumble-step, a stretch-step — **while still making progress.** So
**smooth-but-late = degraded** and **fast-with-stumbles = destroyed**, and **a zone's crowd walking in
ragged time reads as "something is wrong" a full step before any meter reddens.**
**The reservation clause:** keep a **separate stutter-teleport (rubber-band)** for genuine **packet
loss**, so the two failure flavours never fuse. Jitter is *bad timing*; loss is *missing*.
**Interacts with:** §8.6's SIP call and game player entries, §8.9's Heartbeat Sync (the beat they walk on
is the global one), §8.13's motion vocabulary.

### Aggregate demand weather
Demand pressure at mid-zoom, without unit-spam.

**How it works:** At mid zoom the customers' little need-bubbles (lock, clock, coin) **merge into
district-level weather fronts of demand** — a thousand bubbles condense into a rolling **"want fog"** that
**settles over the neighbourhood that will riot first.** Zooming back in **resolves it to individual
bubbles** again.
**Why it matters:** it is the Density Ramp applied to *intent* rather than to objects, and it answers
"where is the pressure" at an altitude where individual customers no longer exist.
**Interacts with:** §8.6's Aggregate Patience, §8.9's heat tiles, §8.10's visitor rhythm signature.

### Churn ghosts
A living graveyard that measures your neglect.

**Visual:** **Departed customers briefly linger as semi-transparent units at their old desks and sites.** A
**winback campaign visibly "possesses" a ghost back into colour.** Humour and consequence in one prop, and
it gives the retention mechanic a *place* rather than a percentage.
**Interacts with:** §8.4's Server Ghosts (the same translucency grammar, pointed at customers rather than
hardware), §8.8's Cohort Wall, §8.7's Graveyard of Neglect.

### The Customer POV cutaway
Three seconds that make an abstraction hurt.

**How it works:** Click any bouncing customer for a **3-second POV vignette**: **their loading spinner,
their face falling, their mouse heading to a rival's site.** Small, funny, heartbreaking — and it gives
emotional stakes to a number.
**The companion verb:** click any customer to **follow** them like a hero-cam — their bounces, their
lag-stutter animations — *"the clearest way to feel why they left."*
**Interacts with:** §8.8's Site Preview Window (the same truth, from the other end of the wire), §8.6's
bounce, §8.8's "Why Did I Lose Money" button.

---

## 8.7 Expressing actions, money, and state

### Traffic as light
The core visual metaphor, now covering all four failure axes.

**Visual:** requests are luminous motes travelling along cables. **Throughput is density and
brightness**; **latency is speed**; **queueing is bunching**; **failure is motes winking out**; and —
the missing fourth — **incorrectness is the Poisoned Tint** (§8.5), so the metaphor covers *slow,
dropped, queued and wrong* rather than three of the four. **One metaphor carries the entire performance
story.**

**Variations and additions**

- **Traffic as light-*particles*, with a cast.** Customers are **little glowing motes or people** — gamers
  with controllers, enterprises with briefcases; **attacks are dark angular particles carrying hostile
  glyphs.** Packet streams ride the cables as coloured dots, so **the whole game reads as a living
  schematic** and **congestion visibly crowds the lanes.** The governing rule: **if two things are hard to
  tell apart, they are the same colour family — the palette IS the legend.**
- **Bandwidth as water volume.** Bandwidth also renders as **water volume in canals beside the roads**: a
  launch spike makes the canal **rise**, and overflow is **packet-loss rapids pouring off the banks with
  tiny splashing packets.** The particle law above is this metaphor's *capillary* counterpart — same
  physics, two scales.
- **Streams read as diagnostics.** Flow is **denser when busier** and **redder when slower or stalled**;
  packet loss is a **visibly flickering-out particle.** *"Reading the map's health = reading the streams'
  colour."*
- **Colour-coded per logical kind.** **Net = blue · DB = violet · cache = amber · storage = silver.**
  Congestion is **a jam with stalled dots and a tiny "!" bubble**; a severed link **snaps and flickers.**
  *(Note: this per-kind table is one of the assignments in dispute under §8.2's one-hue-table conflict —
  violet and amber are both reserved in master's ledger.)*

### The queue as physical stacking
Waiting is visible and countable.

**Visual:** requests stack up in a visible pile at the node's intake. A short pile is fine; a growing
pile is the hockey-stick beginning; an overflowing pile is dropped traffic spilling onto the floor.
**You should be able to see the queue before you see the alert.**

**Variations and additions**

- **Queue as a Visible Organ.** **Every buffer in the game gets the same body**: the load-balancer pending
  queue, the mail queue, the message queue, the render queue, each drawn as **a glass tube with items
  stacking inside it.** **Consumer lag inflates a balloon with a fuse.** The eye learns *"check the
  tubes"* within five minutes, and **outage forensics become spatial** — *"it's the mail tube, always the
  mail tube."*

### The red tide / backpressure
**Visual:** saturation crawls **backward along the flow as a red wash, one hop at a time**, with each
hop snapping taut. **FX_CascadeRipple**, paired with **FX_SagStrain** on the links that are about to go.

**Variations and additions**

- **The Cascade.** Dependency failures propagate as a **slow-motion LED-domino wave along the cables with a
  descending whine** — **the best teaching moment in the game, always worth replaying.** The stated
  contrast that makes it work: **single-rack failures are silent; cascades are loud.**
- **The Brownout Wave.** A major failure cascades as **a light-wave sweeping the room** — everything dims
  **toward the failure source** and then recovers **in order**, so **the player can read the cascade
  without any log.**
- **Storm glyphs during chaos.** Active incidents **cluster into numbered storm glyphs**; one click zooms
  and pins the underlying detail. A **"net-neutrality camera"**: god's-eye calm above, ground-level panic
  below — cinematic **and** legible.

### Health as colour temperature
Not a health bar. *(Stated once, in §8.2: health is value and temperature; urgency is saturation.)*

**Visual:** a healthy node is neutral-lit; a stressed node warms toward orange **and stays bright**; a
failing node warms **and darkens**; a dead node goes **grey and unlit**. **Temperature reads instantly
and never needs a number.**

### Money as motion
Cash should always be moving somewhere, and its **character** should be as visible as its quantity.

**Visual — the core set:** **coin motes** arc from conversions to the balance. **Drain lines** run
continuously from the balance to the cost sinks (power, payroll, transit, licences, debt service) as
thin falling streams — **you can literally see your burn rate.** The balance is a **liquid column**, not
a number, so its level is felt. A **burn/earn balance scale** tips visibly. **Payday** is a synchronized
pulse and a distinct sound. An **invoice slip** prints and slides into the AR tray.
**Coin arcs, specified:** all money follows a **parabolic arc with a slight bounce on landing** and a
soft chime. **Big amounts are one big coin with a heavier arc, not many small ones** — so value reads as
**mass**, never as particle count. This is the rule that stops a whale payment from becoming a particle
storm.
**Losses fall, gains fly.** Money lost is **never** a coin flying away with fanfare; it is a
**desaturated puff that falls down out of frame.** Losses should feel like gravity, gains like flight.
**The delta ticker:** cash changes show a small `+$1,240` / `−$310` chip that rises and fades over the
treasury. **Colour-locked: gold for positive, rust for negative — never red, because red is faults.**
**Drains are attributable.** Continuous drain lines are a lovely image and become noise without
attribution. Give each drain a **tiny persistent label** (power / payroll / transit / licences /
depreciation) and make its **thickness proportional**, so the player can see their cost structure
without opening the ledger. **Hovering the outflow stream shows its composition as labelled
sub-streams** — §6.3 has fourteen cost categories and the player currently has no spatial relationship
with any of them. **Making the burn rate a thing with visible parts is what turns cost management from a
spreadsheet into a feeling.**
**The balance has a horizon.** A faint **projected level line** on the cash column shows where the
balance will be at month end at current rates. **The runway, rendered as a water line**, is far more
visceral than a number in months.
**Money has colour and weight.** Coins are tinted by revenue-quality band and sized by margin (§8.2), so
a month of heavy gold coins and a month of small dull confetti summing to the same number teach revenue
quality with no tutorial.
**The rhythm is a trickle and four thuds.** The document renders income as coins and burn as streams;
add the third thing operators actually feel — **the bill that arrives once a month and is bigger than
you expected**, rendered as **a single heavy object landing on the desk with a thud**, at a fixed date,
every month, with its size varying. **The rhythm of hosting finance is not a stream, it is a steady
trickle in and four thuds a month** (payroll, power, transit, licences), and building the month around
those four impacts makes cash-flow timing legible without a single number.
**Interacts with:** §6.4's invoice calendar (its rhythm should be audible and visible), §8.8's Cash
Calendar and Runway Bar, §8.11's cash-register rhythm.

**Variations and additions**

- **Money flows both ways, and the outflow names its owner.** Coins flow **inward from customer towns on
  each wave** (MRR made visible) and **outward to upstream, transit and power companies** — *"the player
  literally sees who they work for."* Cash rises from revenue as **a fountain of coins at HQ** and falls
  into upkeep through **a drain pipe to the power company**, so the whole economy is readable **from one
  animated corner** with no spreadsheet. **Outbound costs are red dotted lines exiting the map edge to
  labelled utility silhouettes** — the grid, the transit provider — and **money-out renders as red
  counter-currents beside the gold inflow**, which makes **a thinning money-flow the death-spiral read.**
- **Every economic event gets a distinct motion signature.** **Revenue = green upward particles into the
  billing vault · churn = a red dash leaving · SLA credit = a gold coin flipping OUT of the vault ·
  invoice paid = a satisfying "clunk" into a stack.** The board meeting becomes readable **in the field
  view.**
- **Revenue is physically a return stream.** Coins flow **back along the customer paths** into your office
  node; invoices and outages fly coins **out**; **bandwidth overage is a meter spinning fast with a
  cash-register sound you learn to dread**; paying floats **a coin bubble back out along the path.** The
  till glow is your heartbeat bar.
- **Discounts foreshadow their own cost.** Discounts and free tiers appear as **green inflows with a
  hidden tail** — a cost-burden foreshadow rendered as a **"fraud-risk shimmer"** on the stream.
- **Coins ride the outbound packet streams**, upkeep **drains as tiny coins flowing OUT to vendors**, a
  **treasury hopper at the map edge catches each deposit**, a **breach spatters coins**, and **a big
  outage visibly reverses the river momentarily** — *"the best possible 'oh no' read."*
- **Money-arc physics.** Coins **bounce once in the fountain-gate, then fly to the office with a little
  trail**; **a big contract lands with a *thud* and a screen-shake coin-spray.** Income has **weight and
  gravity, always toward HQ**, and the resulting image is the thesis: **a visual river of money flowing
  inward and threats flowing the other way — and the two rivers ARE the game screen.**

### Coin trails follow cables
**Visual:** revenue literally flows **along the connection cables** from customers into your cash bar,
so **the most profitable cable on screen is visibly the busiest with gold.** A colo player will see the
meet-me room glittering and instantly understand the business.
**Tension:** ⚔️ This puts gold on the Flow layer alongside cyan traffic, which risks a busy frame. Cap
it under the Emissive Allowance and make revenue gold **sparse and heavy** (few, large motes) against
cyan's **dense and light** (many, small), so the two never blur.

### Costs as drips
**Visual:** opex drains continuously as **small red droplets falling from each object into a gutter.**
**An idle server dripping money with no gold flowing in is the clearest "you over-bought" signal
possible** — and it is per-object, so the diagnosis is spatial.

### Depreciation fade
**Visual:** capex items **visibly desaturate over their depreciation life** and show a small
residual-value tag. **Old GPUs look tired.**
**Tension:** ⚔️ Desaturation is reserved for urgency/health (§8.2). Resolve by using a **warm
yellowing** (the same channel as label-yellowing in the Wear Channel Triad) rather than desaturation, so
age reads as age and not as illness.

### Upsell pop
**Visual:** a small gold `+$29/mo` that floats up from a customer and **merges into the MRR bar** with a
satisfying chime. Expansion revenue should feel **great**, because it is the cheapest revenue and the
game wants you addicted to it.

### SLA credit
**Visual:** a green coin arrives, then **immediately turns and walks back out with a little apology
note.** Tiny, humiliating, correct. It drains **out to a specific customer**, which makes it personal
rather than statistical.

### Price increase ripple
**Visual:** raising prices sends a **visible wave across your customer board**; most figures shrug, some
turn red and start a churn timer. **You watch your decision propagate.**

### Invoice Run Confetti
The monthly heartbeat, made a spectacle.

**Visual:** on the billing day, a **burst of small green invoice sprites fly from customers to your
building**; successful ones convert into coins on arrival, failed ones turn red and fall into the
dunning tray.

### The business machine, rendered
*Wave 1 defined the business mechanically and gave it almost no visual expression. These are the
diegetic objects that fix it — each is one prop, and together they make the commercial half of the game
a place rather than a panel. (See §8.18.)*

- **The Price Book as a printed rate sheet.** A folded, slightly coffee-stained laminated card on the
  desk. **Editing it is literally writing on it** — crossed-out prices, a sticker for the new one, a
  promotional rate paper-clipped to the corner. **Old prices remain visible with strikethrough, which is
  a free visualization of grandfathering:** you can see how many generations of pricing you are still
  honouring.
- **The layered cash column.** §6.4's bank-balance column, stratified: **free cash on top in bright
  gold; deferred revenue below it in a translucent amber that is clearly someone else's; restricted /
  reserve at the bottom behind bars.** When the gold layer thins to a sliver while the column is at
  record height, **the player understands insolvency-while-growing without a tutorial.**
- **The deferred-revenue ghost.** The portion of your cash that is not yet earned renders as a
  translucent overlay on the cash bar. **Spending into the ghost is possible and visibly dangerous.**
- **The Rolling Reserve cage.** A literal barred box inside the vault. Every incoming coin passes a
  diverter; one in ten drops into the cage. The cage has a **180-day timer Ring**, and old coins fall
  out the bottom back into free cash. **Watching the cage fill for six months and then reach steady
  state is the clearest possible picture of a one-time cash transition.**
- **The AR spindle.** Unpaid invoices **impaled on a desk spike, yellowing and curling** as they age
  through the 30/60/90 buckets. The 90+ ones are brown and brittle. Clearing one is a satisfying
  pull-and-file animation; writing one off is a shredder.
- **The Backlog dock.** Signed-not-installed revenue as **physical crates on the loading dock** with a
  customer label and a **committed install date stencilled on the side**, which turns red as it
  approaches. Installed orders get carried inside and the customer's desk appears. **The gap between the
  dock and the office floor is Signed MRR minus Billing MRR, rendered as distance.**
- **The Pipeline funnel board.** A magnetic whiteboard with deal cards in columns — each a card with a
  logo, a value and a little photo of the champion. **Deals that stall gain dust.** Deals that die get
  taken down and dropped in a bin that you can, disturbingly, look inside at the end of the level.
  **It is diegetic — it hangs in the Sales Floor, so walking the camera over there *is* opening the
  sales UI.**
- **The commission gong, and the un-gong.** A deal closes, the gong rings, everyone looks up. When a
  commission is **clawed back** — customer refunded inside the window — a **small, dull, single tap** on
  the gong plays instead, and the rep's card loses a star. **Comedy and accounting in one sound cue.**
- **The demand-charge high-water mark.** The power gauge carries a **thin red line at your 12-month
  peak** with a counter of months until it resets. A new peak **jumps the line up with a nasty clunk**
  and resets the counter to 12. **A ratchet should look like a ratchet.** (See also the Demand Ratchet
  marker, §8.8.)
- **The ramp staircase.** Colo contracts drawn onto the floor plan: **reserved-but-not-billing cabinets
  are wireframe outlines with a date floating above them**; as each ramp step hits, the outline fills in
  solid and the revenue ribbon widens. **A delayed ramp is a step that stays hollow past its date, and
  it reads as an empty promise with no words at all.**
- **The escrow lockbox and the diligence room.** At close, the purchase price pours into **two
  containers — one you open, one bolted shut with a 24-month timer.** The diligence room is a physical
  room that fills with banker boxes as you satisfy requests; **unanswered requests are empty shelves
  with a label, and the buyer's analyst stands looking at them.**
- **The P&L printout.** The score screen's business half as a dot-matrix or laser-printed statement with
  line items and subtotals — and, in the "adjusted EBITDA" version, **sticky notes stuck on with the
  addbacks handwritten. The player physically peels off the sticky notes to see the honest number.** The
  single best visualization of financial self-deception available.
- **Contract clauses as dog-ears.** Each customer's contract is a physical document in their file.
  **Clauses you added are tabbed in green; clauses they added are tabbed in red.** A client card with
  three red tabs is visibly dangerous at a glance, and hovering a red tab shows what it will do to you
  and when.
- **Revenue-quality tinting on the floor.** Each customer's desk, rack or cabinet is tinted by revenue
  quality (within the low-saturation identity band, per §8.2's arbitration rule). **A floor that is
  mostly gold looks like a different company than a floor that is mostly red**, and a pivot or an
  acquisition changes the colour of the room over the course of a level. **"What kind of company have we
  become," answered by looking at the carpet.**
- **The brand street.** Multi-brand play rendered as **separate shopfronts on one street**, each with
  its own facade, signage, typography and visitor costume — **with one shared loading dock at the
  back.** The camera can pull back to reveal one building behind all three. **The reveal shot is the
  entire strategy explained in one frame**, and the "linkage risk" threat is literally a journalist
  photographing the back alley.

**Variations and additions — more diegetic finance objects**

- **The deferred-revenue vault, animated.** A **sealed vault that exhales one coin slab per month
  recognized**; spending a sealed coin is **a vault-door slam plus a red warning.**
- **Receivables as an aging shelf.** Invoices on the **HQ window sill**; **over-90 days is desaturated
  paper curling up**; **a bad debt is a wraith walking an invoice *back* off the shelf.**
- **AR as an inflating balloon** beside the cash pile — **pops into coins at settlement**, and **bursts
  uncollected as a bad-debt scare.**
- **The reserve vault dial** rises with every paid invoice and is **clickable only at milestones** —
  *"savings you want to touch."*
- **Power bills as a physical stack.** An **invoice stack on the desk that grows until paid**, which is the
  "four thuds a month" rhythm given a between-thuds rendering.
- **The paper trail is the business-layer attack lane.** **Chargebacks as red-slipped receipts flying into
  the processor · SLA credits as a chequebook animation · dunning as aging envelopes stacking.** **When
  the paper lane clogs, the office is visibly drowning** — the commercial equivalent of a saturated
  uplink.
- **Enterprise RFPs as objects on the map.** An RFP arrives as **a briefcase at a docking bay** with a
  countdown and requirement icons; **delivering all the clauses turns it into a permanent gold mine (an
  MRR fountain) plus a customer figure moving in.**
- **The sales pipeline as a conveyor.** Lead units **physically transform along a factory line** — business
  card → proposal → contract — each stage with its own risk sparks, and **rejected proposals flip off the
  belt.** *"The abstract funnel as a visible machine you can watch jam."*

### Upgrades visible on the object
No upgrade is invisible.

**Visual:** added drives, an extra PSU, a new NIC, a bigger heatsink, a faceplate change, more lights.
**The object's history is readable from its face**, which makes upgrading feel like accumulating rather
than incrementing.
**The upgrade beat, specified:** a tech sprite **physically walks to the rack**; the unit goes amber
(maintenance mode) with a scaffolding/progress overlay and a work-light glow; a progress bar runs; the
component **visibly changes**; then **three signals in one second** — a sweep of light along the object,
the new hardware physically present, and a small **spec plate chip that flips to the new value** — plus
a bright ring-out pulse and a stat popup showing what changed. **Upgrades that require downtime dim the
component and visibly reroute traffic around it.**

**Variations and additions**

- **The Upgrade Ceremony.** Old hardware is **physically carried out by a staff avatar**, a **new unit
  rolls in on a cart**, and **ports re-light in sequence.** **Progress is an *event*, not a stat bump** —
  players will idle-zoom to watch their own moving day.
- **The firmware wave.** Upgrades **ripple a glow along their cables** as the change propagates: *"the
  network knows."*
- **Rise and clunk.** Large upgrades arrive with a **construction-crane animation** and a satisfying
  **RACK-CLUNK**, paired with a **rising five-note family motif** — **network = marimba, storage = bass,
  staff = bell** — so the progress signal is multisensory **and muted-safe by shape.**
- **Upgrade feedback = the company glow-up.** The building **visibly renovates as you research**: patch
  cables → organized cable management → glass partitions → biometric doors. **The tech tree as interior
  design.** On the business lane the same rule applies: **plan-tile changes re-price the signage along the
  funnel road** (price tags pop and conversion responds within seconds), **certs mount to the wall**, and
  **a new tier-2 desk visibly changes the ticket queue's flow.** **Every business action gets a spatial
  consequence — no silent spreadsheets.**

### The connection-made click
Small, crisp, repeated thousands of times. **Get this one interaction right and the whole game feels
good.**

**Visual/audio:** drag from socket to socket; the cable follows the cursor with a **physical catenary
sag**; compatible sockets glow, incompatible ones grey out **with a reason tooltip.** On drop: a
satisfying **click**, the cable **snaps into a routed path through the tray, not through the air**, the
**port LEDs on both ends flash green in a two-beat handshake**, the cable **settles with a small sag
animation**, and **the first packet bead runs the length of it.** You always see the link come up.
**Failure is specific:** if the link fails to establish you get a readable error **on the link itself**
— `connection refused`, `auth failed`, `no route to host` — never a generic X.

### Defense firing
Every defense has a distinct verb, and the verb is **interception, not projectiles.**

**The metaphor rule:** defenses do not shoot bullets at approaching enemies — that would be the wrong
metaphor for a firewall. **A defense is a wall or a sieve, and the visual should say so:** the threat
**hits the defense** and splats, dissolves or is deflected (**FX_Deflect**).
**The verbs:** a **rate limiter meters** (a valve with a visible drip rate). A **WAF inspects** (a
scanning lattice sweeping a queue with tiny accept/reject flicks — **FX_LatticeFlash**). A **scrubbing
centre filters** (a wave that passes through and leaves only cyan — **FX_ScrubWave**). A **firewall
gates** (a physical barrier drops; the ruleset is a set of grates that slam). A **honeypot lures** (a
false door that opens invitingly). A **tarpit slows** (attackers sink into thick amber — **FX_TarPit**).
A **filter clacks** like a turnstile. **fail2ban yanks** (a hook pulls the unit off-screen). **IDS
outlines** (it marks and does not act). **IPS shoots** (the one that genuinely does). The **circuit
breaker opens** (a physical gap appears in the path). The **bot fingerprinter peels** (it strips a
disguise away). **Egress filtering refuses** (a one-way gate that visibly will not open outward). The
**connection pooler queues.** **CSP snips** (scissors). A **blackhole swallows** — a literal dark circle
that consumes a lane **and dims the customer behind it, so you see the collateral damage of the decision
you made.**
**The off-state and mis-tune state:** every defense also needs a visual for *disabled* (grates up, valve
open, lattice dark) and *mis-tuned* (the amber tick count and haze of §8.6). A defense you turned off
and forgot must look turned off.
**The exception — Active Response.** Things that genuinely go on the offensive **do** get outbound
visuals: null-routing, blackholing, takedown requests, legal action. **A null route is drawn as a
trapdoor opening in the lane and the traffic falling through it.** Delightful, and the exception proves
the rule.
**Restraint is the point:** restrained defense visuals make the *rare* catastrophic events land much
harder.

**Variations and additions**

- **Muzzle languages — every shot answers "who shot whom."** Every defensive action draws **a fading tracer
  back to its source tower**, and **every inbound hit's trail is reversed to reveal the attacker's
  location.** You can **always** answer who shot whom, which is the forensic half of the interception
  metaphor.
- **A distinct firing tell per defense type**, so **a glance at which effects are firing is an instant read
  of which attack type is live**: the **firewall arm = a *CLUNK* swipe** · the **WAF bouncer = a
  slap-toss** (or a **stained-glass shimmer**) · the **rate-limiter = a metronome gate** (or **cyan
  dashes**) · **scrubbers = a suction vortex** (or **foam suds**).
- **Honeypots are visually irresistible.** Decoys carry a **subtle sparkle and a "loot" shimmer**, and
  **enemies visibly prefer them** — the bait mechanic readable **purely from where the swarm bends**, with
  no meter at all.

### The sieve
One image that explains the entire defensive tradeoff.

**Visual:** mixed violet traffic pours into a defense; **cyan passes through; magenta is caught and
accumulates visibly; amber (false positives) falls through the wrong side and is highlighted.**

### Recovery
The most satisfying animation set in the game.

**Visual:** **FX_Reseat** (a device slides out, slides back, and POSTs). **FX_LightsOn** (an LED sequence
walking left to right as a unit comes up). **FX_FleetSync** (a configuration change rippling across a
fleet in a wave). **FX_GhostSolidify** (a restored dataset fading from a ghost into solid). Cache warming
shows the cache filling from the bottom, with the latency graph visibly dropping as it does.

### Degraded mode
The system visibly shedding.

**Visual:** disabled features grey out **in the world** — the recommendation service dims, the search
node goes dark, the site preview window switches to a simplified layout. **You see exactly what your
customers are no longer getting.**
**Interacts with:** §8.8's Site Preview Window, which can preview a degradation rung **before** you fire
it.

### Failure feedback, in three tiers
Never more than one critical treatment on screen at once, or it stops meaning anything.

**Visual:** **routine** — a subtle LED change and a small wrench icon. **Notable** — a screen-edge amber
vignette plus a toast, the object outlines. **Critical** — full desaturation, alarm, slow-motion, the
bezel rule lights.
**Failure Complete (the persistent state):** the LED goes red, **the fan blur stops (silence is loud)**,
a small smoke wisp, and **the object's outline picks up a broken-line treatment that persists until
repaired.** A persistent damage state is how you find it again later.

### Damage feedback on infrastructure
Towers take visible wear, and pre-failure warnings are visual.

**Visual:** a stressed server's fan blur increases and its thermal tint rises. **A drive that is failing
shows a slow-blinking amber LED *before* it dies.** A switch under attack shows its port lights
saturating. **Pre-failure warnings are visual, not textual**, and the observant player gets a free save.

**Variations and additions**

- **The damage-state ladder, drawn.** **Healthy** = a green LED breathing · **degraded** = an amber flicker
  plus fan noise · **infected** = an oily purple shimmer with tiny tendrils · **encrypted by ransomware** =
  padlock shrink-wrap, **animation stops**, frost crawling over files · **exfiltration** = a dark thread
  crawling *out* over the internet-cloud icon · **destroyed** = a grey husk, smoke, and a little **"RIP
  42U" headstone that persists until repair.** **Band-aids appear on patched-but-weak systems.**
- **The dead drive gets a grave.** The U-slot goes dark and a **clickable tombstone icon** appears —
  *"drive 7, back in '22, good drive."*
- **Towers visibly deteriorate as the health bar.** Scorch marks, dangling cables, flickering panels,
  smoke; **infection is a pulsing red wart**; **repair restores instantly**, which is the visual feedback
  on the economy loop.
- **RAID rebuild is a slow crawling progress bar on a disk "that looks painful."** Hardware failure is **a
  unit smoking and going dark with a single blinking red LED.**
- **Failure animations that teach.** When something breaks, **the game animates the *why*:** the SQLi unit
  **visibly opens a hatch and drops into the DB**; the noisy neighbour **visibly eats the shared CPU
  meter**; the bounced customer **visibly retries elsewhere.** An attack that reaches a node **"jacks in"**
  — a tendril animates and **the node's status eye turns red, like a sick animal.** **Every loss is a
  lesson frame.**
- **A breach is a red tracer moving through your own hall** — the horror of the inside view, and the reason
  the interior traffic layer has to exist at all.

### Breaker trip and power events
**FX_BreakerTrip:** a snap, **a chain of devices going dark in physical order along the circuit**, and
the amp meter dropping to zero. **The most brutal two-second animation in the game.**

### Data loss and corruption
**FX_SealDrain:** a storage volume's fill level draining away with its seal breaking. **FX_FrostBloom:**
ransomware crystallizing across files. **FX_RansomOverlay:** the customer-facing view replaced by the
ransom note. **FX_ForensicDesat:** during investigation the world desaturates except the evidence trail.
**FX_DriftPile:** bit-rot rendered as a slow accumulation of drifted, discoloured blocks.

### The blast-radius preview
**The most honest, most useful visual in the game.**

**How it works:** Hover a component with the modifier held and **everything that would fail with it
desaturates to grey with a red outline**, plus a count: *"42 customers · $18,400 MRR · 3 SLA breaches."*
Hold a key to see failure domains as coloured translucent fields with "$X MRR at risk" labels floating
in them.
**Interacts with:** §8.8's overlay set, §7's dependency map, §6's concentration risk.

**Variations and additions**

- **The Failure-Domain Outline.** While hovering **any** infrastructure node, everything inside its blast
  radius gets a soft outline — a **"grave-shadow."** It is a **second visual grammar beyond the red port
  LEDs**: not what this node *exposes*, but **what it *owns*.** Paired with a **"SPOF" badge** on the
  status board wherever that risk is hiding.

### Before/After overlay for any change
**How it works:** Any change you make can be toggled between "before" and "after" rendering for **30
seconds afterward**, with the delta on key metrics floating beside it. **Turning on the WAF and toggling
back and forth to see the latency ladder grow and the magenta thin out** is a tiny, repeatable,
delightful moment of comprehension.
**Interacts with:** §3.1's Latency Ladder, §7's board diff, §8.8's Diff View.

### The Consequence Fuse
Drawing time-delayed effects.

**How it works:** When an action schedules a future consequence, a **thin, slow-burning fuse line** runs
from the action to its landing point on the Timeline Ribbon / Obligation Rail. **Good consequences burn
gold, bad ones amber.** **You can literally see how much is coming**, and a screen with nine fuses
burning is a visceral picture of a decision-heavy month.
**Interacts with:** §7.5's 90-day lag, §8.8's Unified Clock Ribbon, the Intent layer.

### The "It Was Fine" replay stamp
Making invisible defensive value visible.

**How it works:** When a threat is fully absorbed with no impact, the game does **not** stay silent — it
prints a tiny, unobtrusive stamp on the Timeline Ribbon with the absorbed damage value. Over a level
these accumulate into **a visible record of everything that did not happen to you.**
**Why:** §4.8 correctly identifies that the security engineer "produces no visible revenue — the classic
budget-cut victim." **A stamp trail is better than a "losses prevented" figure: it is spatial, it is
cumulative, and the player sees their defensive spend working continuously rather than only when it
fails.**

### The status page as an in-game object
**Visual:** a rendered customer-facing status page **that you actually edit.** Writing an honest update
versus a vague one is a UI action with a reputation number attached, and the page is visible to
customers in the Site Preview Window.

**Variations and additions**

- **The Status-Page Mural.** A **big wall display of your public status**: green bars rolling to yellow
  and red as incidents occur, **and customers photograph it.** The entire game-state truth compressed into
  **one diegetic screen you cannot hide from**, which doubles as **the persistent scoreboard** — your real
  status page from the last level, with friends' visits showing up as menu-screen traffic.
- **Status-Page Theatre.** During incidents the in-world "internet browser" shows your status page and
  **customers watching it decide whether to stay** — a meta-screen players actually maintain, where
  **update cadence matters.** Variants: **a small browser window embedded in the corner that actually
  updates during play** (outages paint themselves red before your eyes); **a physical billboard outside
  the facility whose colour — green/amber/red — affects arriving customers' patience on entry**; and the
  most aggressive one, **the top bar IS the public status page** — green/black/red component squares fill
  the level, and **when the audience-visible page goes red, so does your reputation meter.**

### Alert escalation visuals
Severity has a visual ladder — with a non-colour channel at every rung.

**Visual:** **info** (a small dot in the ticker) → **warning** (an amber pip **with a notch**) →
**minor** (the object outlines, **dashed**) → **major** (a rack-level tint **plus a corner flag** and a
ticker entry) → **critical** (a full alert card **plus the bezel rule**, the NOC wall goes red, optional
auto-pause). **Five clearly distinguishable steps, never more** — and each step carries a shape channel
as well as a colour, or the ladder fails the Two-Channel Law.

**Variations and additions**

- **Alert Escalation Tiers — alert fatigue as a system.** **Tier 1** = an icon dot on the asset. **Tier 2**
  = an asset outline, a soft chime and a corner notch. **Tier 3** = a screen-edge red vignette pulse, a
  buzzer and an auto-ticket card. **The monitoring tier the player *buys* gates what actually reaches their
  eyes**, which turns the observability tree into a difficulty setting the player chose.
- **Dying services get a subtle pulsing red border *in-world*, not a toast** — escalation stays on the
  object until it has earned the screen.

### The de-escalation animation
The thing no game does, and this game needs.

**How it works:** **An alert clearing should have as much presence as an alert firing.** The outline
retracts, the tint drains, the ticker line greys and slides down, and the object's light returns to its
idle cadence with a soft tick. **§8.7's "quiet moment" is the right instinct; make the de-escalation of
individual alerts share its language**, so recovery feels earned at every scale and not only at the end
of an incident.

### The quiet moment
Deliberate calm.

**Visual:** after an incident resolves, the game **holds** (the Hold shot, §8.3) for a beat — alerts
clear one by one with a soft tick, colours settle back to neutral, the hum returns to idle pitch, the
camera stops moving entirely for 2 seconds. **The exhale is as important as the crisis**, and most games
forget to build one.

### The empty lane
The quietest and most devastating visual in the game.

**Visual:** perfect infrastructure, all green, humming — and **no visitors at all.** Reputation zero
(§6.10) renders as **silence and stillness**, with one piece of litter blowing across a fully-lit,
perfectly-healthy inbound edge. **No text needed.**

### Build satisfaction and the boot sequence
Placing a thing should feel like installing a thing.

**Visual:** the ghost solidifies, rails click, the cage nut goes in, power connects, fans spin up with
an audible ramp, POST lights sequence, then idle. **Ten seconds of ceremony for a meaningful purchase,
one second for a small one.**

**Variations and additions**

- **The Boot Ceremony (the POST choir).** Powering a new machine plays a small **rite**: fans spin up **in
  sequence**, LEDs **cascade green**, a **POST beep chorus** sounds — *one confident note = healthy; the
  Beep Code of Doom = a diagnosis puzzle* — and the service **"opens its eyes"** (the pareidolia wake-up).
  **It is the joyful mirror of the ransomware stillness.** **Boot order is a real puzzle** — DB before app?
  app before DNS? — rewarded with the cascade animation, and **a fleet boot after a region wipe becomes an
  awe-inspiring morning choir.**
- **The Power-On Ripple.** On a successful build or boot: **LEDs chase left→right, a fan spins up with a
  pitch rise, and the building settles with a satisfied "clunk."** *"The dopamine loop every TD needs, and
  it's literally hosting equipment doing its startup."*
- **Glory moments.** A perfectly absorbed launch-spike or a wiped bot-swarm triggers a brief **"all-clear"
  cascade** — LEDs blinking green **in sequence along the whole path** — and **the vault chimes.**
  Positive feedback released **at exactly the frequency of the tension.**

### Money number feel
The counters must have physicality. *(Full numeric spec in §8.15's Number Law.)*

**Visual:** tabular figures so digits do not jitter; counters **roll** rather than snap; large gains get
a brief scale-up; losses get a red tick and a downward slide. **Never a silent instant change for
anything that matters.**

**Variations and additions**

- **Money-change popups.** Every money change produces **a +/− popup while the cash counter ticks**, and a
  churn produces **a little "X" on the customer plus a dip on the reputation meter** — so the *cause* and
  the *counter* are visible in the same glance.

### The Money River
Cash-flow thinking in one glance.

**Visual:** A **literal flowing band across the map.** **Inflows** (renewals, new deals, overage) **join as
tributaries**; **outflows** (power, payroll, transit, lease) **branch off**; and **the river's *level* is
cash.** **Deferred revenue is an underground aquifer.** **AR is water still in the pipe between the
customer and the river.**
**Why it matters:** it is the only proposal in the document that renders *timing* — the difference between
revenue recognized, cash received and cash spendable — as a single continuous picture rather than as three
widgets.
**Interacts with:** §8.7's Money as motion and the layered cash column, §8.8's Runway Bar and Cash
Calendar, §8.7's deferred-revenue ghost.

### The Receipt Printer HUD
The money ticker as diegetic paper.

**Visual:** A small **receipt printer by the finance desk prints a paper receipt per money event**, and
**the length of the receipt is the amount.** A big month prints a **physically long receipt** — a brag and
a warning in one object — **and you can scroll it to inspect your finances.**
**Interacts with:** §8.8's Ledger Tape (this is its diegetic body), §8.7's business machine props, §8.11's
receipt-printer sound.

### The Renewal Fork
Retention rendered as a road junction.

**Visual:** The customer path **physically splits at a fork.** **Renewed customers walk back into your
campus with a green pulse.** **Churners exit through a door that counts out lost MRR on a receipt-printing
ticker.** **Competitor-poached units exit with tiny competitor flags planted on them.**
**Why it matters:** it puts renewal, churn and poaching — three different losses that a chart flattens into
one number — into **three visibly different exits.**
**Interacts with:** §8.8's Renewal Calendar and Cohort Wall, §8.5's Competitor's Poach, §8.6's churn
ghosts.

### Silver motes — cost avoidance as a second currency colour
Teaching defense ROI without a tooltip.

**How it works:** **Blocked-attack savings drop *silver* motes beside gold revenue** — a whole second
currency colour inside the existing coin-physics system. The security spend stops being invisible, because
its output is now **a stream you can watch**, in the same place and with the same physics as revenue.
**The contract question it raises:** it is in direct tension with **money = gold, only gold**, and must be
adjudicated by whichever hue table is published — see **§8.2's "The one hue table — *CONFLICTING*"**, where
it is carried as the companion proposal.
**Interacts with:** §8.7's "It Was Fine" replay stamp (the same value, counted rather than flowing), §8.7's
Money as motion, §6's losses-prevented accounting.

### East-west traffic is visible
**Stated as the single highest-value visual rule in the document**, and the one that makes an insider or a
web shell *visible* rather than *reported*.

**How it works:** Most tower-defense games show only the lanes from the edge. **Your interior must animate
too:** tiny motes between **web → DB → cache**, **proportional to real request flow.** The inside-traffic
pattern **is** the game's ambient health language at rack zoom.
**Why it matters:** when an attacker is *inside* — a web shell — **you see it**: **a black mote walking your
DB connection path where no legitimate flow has ever gone.** Horror made visible with **no alert popup at
all.**
**Infection spreads through the cables, not through tiles.** A compromised node pings its neighbours and
**the east-west motes turn dark along a lateral path**, making the worm's lateral movement **a visible
route of corruption the player can cut.** *"Isolate" finally means drawing a cut line in the network*, and
an ACL becomes a spatial action. **Lateral movement is tendrils crawling along YOUR OWN cables**, which is
why **your infected nodes are the scariest art in the game: your infrastructure turned hostile.**
**Interacts with:** §8.5's Persistence and infestation (this is its transport), §8.5's Insider and Intrusion
entries, §8.4's Health as flow, §8.2's reverse-flow direction law.

### Contract Cables
Proposed as the business layer's signature visual motif.

**Visual:** Wires run from **contract nodes to the infrastructure that satisfies them.** They **glow steady
when satisfiable**, **flicker amber when margins thin**, and **arc sparks when an SLA is at risk.** **On
breach the cable *snaps*, with a burst of paperwork.**
**Why it matters:** it gives the commercial layer the same physical, traceable, at-a-glance grammar the
technical layer already has — an obligation becomes **a thing connected to a thing**, and concentration risk
becomes visible as *how many cables land on one box.*
**Interacts with:** §8.8's Obligation Rail and SLA Meter, §8.5's concentration-risk pillar, §8.7's ramp
staircase.

### Defeat teaches — the forensic aftermath
Investigation as a visible chore with a satisfying clear-out.

**Visual:** After any incident resolves, **diegetic chalk outlines, tape Xs and a small numbered tent card
persist on the scene** until a staff avatar — or you — **walks over to inspect and close.** After a
*loss*, the screen **freezes into a forensic diagram**: yellow tape, **numbered markers on the root-cause
nodes**, and **a dotted line tracing the kill path.**
**Why it matters:** it converts the postmortem from a screen you are shown into an object you have to go
and tidy up, which is both funnier and more memorable.
**Interacts with:** §8.12's FX_ForensicDesat, §8.8's Regret Marker, §8.4's Scar Map (the tent card is what
becomes a scar).

### Outage weather and the reputation sky
Atmosphere as the status board — and the sky as an instrument.

**Visual:** **Company health paints the sky.** Clean ops = a **sunny datacenter campus**; rising incidents =
**dark clouds over the rack you broke**; full outage = **lightning and a literal red 503 sky.**
**Reputation as weather:** high reputation = **clear sky with the conversion light glowing**; bad reviews
**cloud it**; a scandal or outage = **literal overcast over your storefront**; and **a mega-outage plus a
Reddit thread is a visible storm front whose lightning bugs customers away before they even reach the
funnel** — ambient economic feedback with no number attached.
**Money Weather:** the HQ skies also track the ledger — **coin-clouds with silver linings when profitable,
drizzle when thin, hail when bleeding, and a calm golden hour at the win.** One-glance finance without
numbers.
**News ticker plus weather = difficulty theatre:** an ambient ticker of **real headlines per hosting type**
foreshadows threat families; **storms literally roll across the map edge during grid-down levels**; and **a
viral spike paints the customer lanes glowing gold.**
**Interacts with:** §8.10's Weather and place at Z4, §8.18's flagged "reputation sky swatch" gap (this is
the instrument it was missing), §8.8's incident ticker.

### The building reads your progress
The save file, written in architecture.

**Visual:** The HQ exterior and interior **acquire additions as you unlock**: patch cables → organized cable
management → glass partitions → biometric doors; then **mezzanines, a new cage wing, a satellite dish, the
rooftop chiller forest.** *"A company built like a game tree."*
**The office as the reputation dashboard:** **certifications mount as physical badges on the building like
hotel awards** — and **regulated customers pathfind *toward* the signage.** The **boardroom logo wall fills
with won logos**, where **empty slots hover as "prospects that asked about it"** and **visible wall progress
gates the enterprise convoy.** Downstairs: **lobby trophies (case studies), framed SOC 2 / ISO certs,
Trustpilot stars on the wall, review-bomb graffiti arriving**, and **a neglected support area becoming a
physical backlog of paper.** **Reading the office should be enough to know your brand health.**
**Interacts with:** §1.8's Company Wall, §8.15's Company Mark Generator, §8.10's Business Line Placard.

### The Graveyard of Neglect
A growing, funny, somber scoreboard of your decisions.

**Visual:** **Churned customers are buried as tiny tombstones at the map edge** — **nameplate plus reason**:
*"took too long," "got 503'd," "rival was cheaper."* **Haunting once you pass 100**, and it motivates
without a tutorial wall. **Decommissioned, breached and failed buildables are physically hauled to a visible
corner of the lot.** And in churn-led levels **whole rack rows go dark as a ghost town** — **empty husks with
dead LEDs that communicate "why is churn here?" better than any chart.**
**Interacts with:** §8.6's churn ghosts, §8.8's Cohort Wall, §8.17's scrapbook wall (the museum's unhappy
half).

### Competitors live across the street
Price competition, rendered as real estate.

**Visual:** **Rival hosts as actual storefronts with price-sign placards.** **Customers visibly
comparison-shop at the intersection**, and **a race to the bottom ends with both of you in a strip mall.**
**Interacts with:** §8.8's Site Preview Window's competitor pane, §8.7's brand street, §8.5's Competitor's
Poach.

### The Org Chart as a Living Tree
Hiring and firing with faces.

**Visual:** Staff buildables **grow your company org chart on a side board.** When someone **resigns** —
burnout or poached — **their node dims**, and **any towers that depended on them visibly lose skill.**
**Interacts with:** §8.18's flagged gap for staff fatigue, morale and skill art; §8.8's Drawer System;
§8.2's Ring Taxonomy (a Halo for mood, Pips for skill).

### The Motivation Wall
Meta-progression as a physical gallery.

**Visual:** The **break-room wall accumulates framed milestones**: certificates, **first-postmortem prints**,
**the day-1 sticker from your oldest asset's boot**, and **team photos that grow with your staff count.**
Visible in the dollhouse levels, in passing, without ever being a screen.
**Interacts with:** §8.17's scrapbook wall, §8.12's Credits Rack, §8.4's Handmade Layer.

### The self-updating war room
A whiteboard that doodles itself.

**Visual:** An in-world whiteboard that **sketches incoming threats, strikes through mitigations as they
land, and scribbles fire-drills when idle.** The **meta-space lobby between boards** hosts the literal
**R&D whiteboard** where unlocks are discovered, **contracts are signed**, and **staff NPCs chat** — a calm
hub deliberately contrasted against the hot game board.
**Interacts with:** §5.8's whiteboard tech tree (an Object of Record, §8.2), §8.8's War-room UI, §8.4's
Handmade Layer — everything on this board is marker, which is the point.

### The QBR Boss Aesthetic
The quarterly business review, staged as a boss encounter.

**Visual:** **The customer's CIO, security officer and procurement sit at the table**, and **the gauges
behind them show *their* experienced numbers** — the uptime they *felt*, the credits you owe, the features
you promised. **Survive → renewal plus expansion. Fumble → the enterprise convoy reverses.**
**Why it matters:** it is the only proposal that renders the *asymmetry* of monitoring — their dashboard
versus yours — as an antagonist rather than as a tab.
**Interacts with:** §8.8's Site Preview Window (the customer's own monitoring view), §8.8's SLA Meter and
its churn-risk correction, §8.5's Regulator (the other calm figure you cannot shoot).

---

## 8.8 UI and HUD

### The HUD skeleton
A fixed, minimal frame.

**How it works:** **Top bar** — money (liquid column), MRR ribbon, reputation face, date/clock, speed
controls, and the per-line gauge slot. **Left** — build palette. **Right** — inspector for the current
selection. **Bottom** — the incident ticker, the alert stack, the pulse strip and the hum bar.
**Centre** — the world. **The bezel** — off-board state. Everything else is a drawer, an overlay, a
hover card, or a hotkey. **Nothing on the HUD that the player cannot act on.**
**The addition the skeleton is missing — the "Now" strip.** A permanent strip holding **up to three
active decisions.** In a game this dense, the most valuable screen real estate is whatever answers
*"what am I being asked right now,"* and nothing in the original skeleton does.
**The problem the skeleton has:** screen real estate is fully committed before the overlay legend, the
three clocks, the hands dock, the hum bar, the site preview and the off-board register are added. **This
does not fit.** The Screen Budget and the Bezel HUD below are the answer.

### The Screen Budget
A stated allocation, so systems cannot quietly annex space.

**How it works:** At 1920×1080, **the world gets ≥66% of the screen at all times.**
- Top bar **48px**.
- Left palette **220px**, collapsible to **56px** icons.
- Right inspector **320px**, **closed by default**.
- Bottom furniture **120px total**, comprising the ticker (one line), the alert stack (max 4 visible,
  then `+N`), the pulse strip and the hum bar.
- Everything else is a drawer, an overlay, a hover card, or the bezel.
**Responsive rules:** **at Steam Deck resolution the palette auto-collapses and the inspector becomes a
full-screen overlay**; at ultrawide, **the extra width goes to the world, never to more panels.** UI
scale to 200% uses the same collapse behaviours (§8.14).

### The Bezel HUD / the Instrument Bezel
Promote the viewport's **frame** to an information surface.

**How it works:** The chrome is framed as a piece of operator equipment — a thin dark bezel around the
world view with recessed gauges, growing more instrumented with difficulty and re-skinning per era. A
**10px inner border** carries: **off-board threat state** (§2's Off-Board Register), the **active
overlay's tint**, the **alert triad's worst-severity colour as a thin top rule**, and the **pressure
gradient's lip.**
**Why it matters:** it costs almost no area, it is never occluded, and **it is the only place that can
carry "something is wrong that is not on this board."**

**Variations and additions**

- **The bezel as the era's rack or monitor frame.** **Chunky beige OSD and bitmap type in the dial-up act, a
  clean dark strip in cloud, orange-edge glass in GPU** — **the interface ages with the timeline, and menus
  *are* set dressing.**
- **Chrome Dials — the window frames as theme variables.** **Dial-up = beveled grey windows and MS-Sans ·
  regulated = strict serif and ruled forms · GPU = hairline-thin dark glass with cyan 1px borders ·
  colocation = stencilled industrial labels and a safety font · email = kraft and ticket stubs with postal
  stencil · game = angular RGB with an italic skew.** **The HUD tells you which hosting type you are running
  before you see the racks.**
- **The Build Catalogue as a vendor invoice.** The build menu styled **per era as a paper catalogue, a
  procurement form, or a SaaS pricing page** — dial-up gets a printed catalogue with an **order-by-phone
  coupon**; modern gets a **"contact sales" tooltip joke.** **Buying is stamping APPROVED.** Item art is the
  machine **in a hero pose with its *risk shadow* faintly behind it**, so money decisions *feel* like
  procurement.
- **Settings-as-BIOS.** The options screen is an **era-correct BIOS/POST setup utility** — beige text-mode in
  the retro acts, clean dark firmware in the cloud acts. **Save slots render as rack U-positions with
  blinking LEDs.** **The OS of the game pretends to be the infrastructure it simulates.** Loading is **a POST
  screen scrolling in the act's terminal font with one deadpan real-ops proverb per line**
  (`checking tape library... the tapes are watching`), **and the errors that flash by are actually
  achievements you own.**

### The Panic Layout
The UI itself has a stress response.

**How it works:** During a klaxon incident the HUD **automatically simplifies**: the build dock
collapses, the incident-cost meter goes big, the triage board is one key away, and everything
non-essential **dims 60%.**
**Interacts with:** the Big Number Rule (§8.15) — during an outage the one large number is the incident
cost.

**Variations and additions**

- **The War-Room re-skin.** In Incident Command the HUD **re-skins to a big-screen ops room**: **sticky-note
  actions, a clock, and a chat rail of panicked Slack messages.** Diegetic difficulty escalation — the
  interface itself tells you how bad this is.
- **The camera joins in.** In War-Room mode the camera **cuts to a big-screen tactical topography** and
  **staff bark one-line status updates** — short, funny and real: *"config drift in zone C," "it was DNS,
  it's always DNS."*

### The Top Bar — the Vitals
Left to right, and nothing else ever goes here.

**Visual:** company name + logo (the player's generated mark) · **cash + delta** (with a runway
countdown) · the **MRR spine summary** · the **Threat Mass Bar** · the **uptime nines water line** · the
**reputation sky swatch** · the **time dial** · **the per-line gauge slot** (see the HUD Swap, §8.10).
**The business-lens variant — the Money Strip:** a single top bar containing **Cash** (with a runway
countdown), **MRR** (with this month's waterfall arrows), **EBITDA margin**, and a small **Reputation**
dial. Nothing else permanently pinned; everything else is a drawer.
**The ops-lens variant — the wall of glass (NOC HUD):** a top strip that mimics a NOC video wall —
uptime %, current RPS, error rate, **p50/p95/p99 latency**, power draw vs capacity, temperature, open
tickets, cash. **Percentiles, not averages** — and the game should quietly teach why, by having a p99
spike while the average looks fine.
**Tension:** ⚔️ Three lenses want three different top bars. **Resolution:** the top bar is
**threshold-driven and promotes**, not fixed — cash, MRR, reputation and the clock are permanent; the
remaining two slots are filled by whatever is currently nearest a threshold, with the per-line gauge
always holding one. A player can pin slots manually.

**Variations and additions**

- **The four-number discipline.** A stricter reading of the same bar: **Uptime dial (SLA) · MRR ticker ·
  Cash + credit bar · Reputation sky mini-preview** — **four numbers, no more, everything else diegetic**,
  set in big readable numerals in a custom tabular-figure display face.
- **The MRR ticker behaves like a stock tape.** **Green ticks per new customer, red drips per churn, and a
  big flashing spike on a whale close** — *"the most-watched number in the game."*
- **The lane-heat strip.** A thin strip **below** the vitals showing **the incoming wave's silhouette**, so
  the top bar answers *what is coming* as well as *where you stand.*

### The Bottom Dock — the build bar
**Visual:** categorized buildables as **physical product tiles** with a price, a power draw and a
U-height. Hovering shows the ghost. **Locked items show as censored silhouettes**, so the dock doubles
as a teaser of the tech tree.
**Organization:** grouped by the three pillars (Serve / Survive / Sell) or by §5.5's branches, with
search, plus a **radial menu at the cursor** for speed.
**Every build card carries:** cost · power draw · U height · **the Surface icons it adds** (the new
attack types this build opens, as small threat class marks) · **the Tradeoff Bar** · **the Cost Ghost.**
**P2 is enforced at the point of purchase.**

### The Tradeoff Bar on every build card
**How it works:** A single horizontal two-sided bar on every build card and every placement ghost:
**capability to the right in cyan, cost-of-capability to the left in amber** (latency + friction +
surface, normalised). **A strictly-good build would show an empty left side — which is the visual proof
that the Three-Column Law is being obeyed.** Reviewers can spot a broken buildable in a screenshot.

### The Cost Ghost (lifetime cost, not sticker price)
**How it works:** Hovering a build shows **two numbers with equal prominence**: the purchase price, and
**"$X over the rest of this level"** — upkeep, power, licence, expected support load, expected ticket
volume. **The second number is usually the bigger one**, and showing it is what makes P3 (peacetime is
the boss) something the player internalises *before* they die of payroll rather than after.

### The Compare Tray
**How it works:** Drag two or three build cards into a tray at the bottom of the screen and see their
**Capability / Cost / Upkeep / Latency / Friction / Surface** rows aligned, with deltas called out.
**Turns the build catalogue from a list into a decision tool.**

### The Right Panel — the Inspector Faceplate
Selecting anything shows a consistent panel. **One layout for every object in the game — learnable once,
used forever.**

**How it works:** Header (name, type, **status chip**) · a **photo-real faceplate rendering** of the
thing · live stats and capacity bars · **the attack-surface rose** · a connections list with
hover-to-highlight · config sliders · upgrade paths · actions · a mini event log.
**The addition: the Truth tab.** Every inspector has **Face** and **Truth**, and **the Truth tab is
where the disagreements live** — effective vs nominal redundancy, last verified restore, actual patch
level, real replication lag, the physical cable path versus the documented one. **The most important
panel in the game should have a page for what is actually true.**

### The Left Rail — the Alert Stack
Alerts as a manageable pile, not a spam column.

**How it works:** Newest at top, **grouped by object and by cause where possible**, sorted by severity,
each with a **thumbnail of the world location**, a one-line cause, and an assign-a-hand button. **Click
to pounce** (the Snap shot). **Dependency-suppressed alerts collapse under their parent** with a count,
which is the visual payoff for buying alert tuning (§7.6). Collapses to pips when empty-ish.
**Ack, snooze, silence — and silenced alerts remain visible but greyed**, so the game can later show you
that **the thing that killed you was something you silenced three weeks ago.** Devastating and fair.
**The signal-to-noise bar:** a small bar on the stack showing what fraction of recent alerts required
action. **When it drops below a threshold, the stack itself starts rendering dimmer** — the UI visibly
losing the player's attention, which is a beautifully literal rendering of the alert-fatigue mechanic
and far better than silently hiding alerts.

**Variations and additions**

- **The Pager Stack.** Complaints and incidents land as **pager messages in a corner stack with counts**;
  **tapping whip-pans the camera to the source in one dramatic swoop** — and **how far you jumped tells you
  where the trouble is**, which is spatial information the alert card cannot carry.
- **The pager as a physical object.** It **vibrates and shrieks** on events, and **silencing it is a real
  choice with real consequences** (a missed SMART warning). **Late-game pagers delegate to staff towers**,
  and the sound-design payoff of the whole system is **a quiet pager at 3 a.m.**
- **Alert fatigue literally blurs and stacks the HUD panels** — the interface degrading as the player's
  attention does, which is the diegetic twin of the signal-to-noise bar above.

### The Bottom Strip — the Rack Ribbon and the Ledger Tape
**Visual:** a single band shared by the **Rack Ribbon** (every rack as a thin vertical state column, so
the whole estate is one strip) and the **Ledger Tape** (a receipt printer paying out money events as
they happen). Two dense, glanceable, diegetic readouts in 120px.

### The Site Preview Window
A small mock browser (or game client, or mail client, or phone) showing what a customer is experiencing
**right now.** **The single best UI idea in the document.**

**How it works:** It renders slowly when you are slow, shows an error page when you are down, shows a
degraded layout in degraded mode, and shows the ransom note when you are ransomed. **It converts every
abstract metric into an emotional, concrete, customer's-eye truth**, and it **re-skins per hosting
type** — a game client's connect screen, a mail client's inbox, a transfer progress bar, an API
response, a DNS resolver trace.
**The failure spec (what it must actually render):** missing CSS · broken images · an error page · a
queue page · the ransom note · spam-folder placement · a game client's connect timeout · a 502 from an
API · a stale-content warning (the Poisoned Tint's customer-side face) · a certificate warning.
**The customer picker:** it shows **which customer** it is currently mirroring, with a picker, and it
should occasionally show a **customer's own site** rather than yours — so the player feels the
second-order relationship: **when your database is slow, it is somebody's bakery that looks broken.**
**The vantage-point tabs:** your office · a mobile connection · another continent · a customer's ISP.
**The same page rendering differently in four tabs is the entire `Whitelisted Office` lesson delivered
in one widget with no text**, and the other-continent tab is the single clearest argument for a CDN or a
regional PoP ever devised.
**The competitor pane:** a second pane showing a competitor's equivalent, so the comparison is visceral
during a price war or a performance push.
**The customer's own monitoring view:** for enterprise clients, **the dashboard they are looking at
while they are on the phone with you.** It is a different, often more pessimistic truth, and **seeing it
is what turns an argument into a diagnosis.**
**Three more jobs:** (a) it **previews the consequence of a pending change** — what the customer will
see if you fire this degradation rung, **before** you fire it; (b) it is one of the two **ground truths
that HUD attacks may never lie to**; (c) in colo and keyhole levels it becomes **the tenant's
dashboard** — what your customer can see about you — which is a brilliant rendering of that hosting
type's information asymmetry.
**At scale** it becomes the **Wall of Mirrors** — a grid of customer views, and the one that is wrong is
the one you look at.
**And the reward case:** when your infrastructure is fully healthy it shows the site loading **fast and
unremarkably**, because **the absence of drama is the reward.**

### The Pulse Strip
A single always-visible line showing the last N minutes of system health.

**Visual:** a compact sparkline-plus-colour band along the bottom. **Answers "is this normal?" — which
is the actual first question of every incident.**
**The addition that makes it diagnostic rather than decorative:** carry a **faint band showing the same
period yesterday and last week**, so "is this normal" is answered **by comparison rather than by
memory.** That one addition converts a sparkline into an instrument (and it is the "ghost" element of
the Instrument Design Language, §8.2).

### The Hum Bar
Audio telemetry, made visible. *(Accessibility rationale in §8.14.)*

**Visual:** a thin horizontal **room-tone strip** along the bottom edge, ~6px tall. Its **baseline
height is fan load**; its **texture is the sound's character.** Events draw named marks on it: a
**rising wedge** (fan ramp), a **hard notch** (silence — power loss, or a mimic's telltale quiet), a
**comb** (drive click), a **spike with a lightning glyph** (breaker snap), a **rhythmic dotted run**
(scanner ping sweep), a **jagged crystalline mark** (ransomware). Hovering a mark names it.
**It is also genuinely useful for hearing players**, because it gives audio a **scrubbable history** —
you can see the sound you just missed.
**Interacts with:** §8.11 in full, §2's Silent Threat Strip, the Pulse Strip (they stack).

### The overlay wheel and its discipline
**One overlay at a time, exclusive palettes, a border tint naming the active lens.** A forced overlay
reduces the alert budget to two (§8.2).

**The overlay set** (hotkeyed, exclusive, each recolouring the whole map by one dimension):
**Power** (A/B feeds, circuit load, single-fed racks flagged, the copper circulatory tree) ·
**Thermal** (heat map, hot spots, airflow arrows, recirculation eddies) ·
**Airflow** (the direction-arrow lens; side-exhaust switches blowing into neighbours) ·
**Network** (link utilization, VLANs, redundancy) ·
**Security** (trust zones, exposed services, unpatched nodes) ·
**Money** (revenue and cost per object — **the most addictive one**) ·
**Per-Customer Profitability Heat** (tint by gross margin; **half the map going red the first time you
enable it is a designed gut-punch**) ·
**Customer / tenant** (colour by tenant; blast radius per client) ·
**Age / Warranty** (what is out of support) ·
**Dependency** (what depends on what, including the dependencies you did not know about) ·
**Blast radius** (failure domains as translucent fields with "$X MRR at risk" labels) ·
**Noise / Alerting** (what is paging whom) ·
**Maintenance debt** (the Wear Channel Triad, turned up) ·
**Elevation-vs-reality** (documented vs actual, §8.4) ·
**Policy / Intent** (the Intent layer, below).
**Overlays are how a 40-rack floor stays legible.**

**Variations and additions**

- **Professional layer control is the readability answer — and it is authentic.** Hotkey toggles for
  **"Power," "Network," "Trust zones," "Heat," "Customers," "Threats"**, each dimming everything but its own
  channel. **At 500 nodes you cannot see everything at once, so let the player choose the channel.** This is
  the overlay set above, stated as an operator's habit rather than as a UI feature — which is the argument
  for its hotkeys being muscle-memory-grade.
- **The Money view toggle, in full.** A dedicated view where **the whole map re-renders as cash flows**:
  **glowing green coin-streams from customer clusters to the billing vault, red bleed from chargebacks and
  credits, pulsing SLA liens on high-value accounts, and the float vault filling and draining.** It makes
  **abstract churn spatially visible** — **a green stream that dims and then snaps.**
- **The heat lens and the cost lens** — *(specified in §8.4's heat bloom)* — are the thermal and economic
  members of the same set: **hold `H` for a thermographic wash**, and **a cost overlay renders everything in
  $/s auras.**

### The Policy Layer view
Rendering standing rules — the Intent layer, given a key.

**How it works:** A toggled view showing **intent rather than state**: armed automations as ghost
figures, standing rules as translucent tethers between a condition and its object, **the shed-order as
numbered tags on traffic classes**, and scheduled future actions as faint objects on the Timeline
Ribbon. Paired with Ghost Hands, **it makes the entire automation half of the tech tree visible** —
which is otherwise a set of invisible behaviours you bought and can never see.

### Visual grammar for "not built"
Rendering the absence of capability.

**How it works:** Unbuilt-but-buildable infrastructure appears as **faint construction-line ghosts in
the places it would go** when the relevant overlay is active — the empty U where a second load balancer
belongs, the blank wall where the generator would be, the missing second transit arc at the map edge.
**Seeing the shape of what you have not done is a quietly excellent teaching device and costs one
shader.** (The Pegboard handles tools; this handles infrastructure.)

**Variations and additions**

- **The Wireframe Ghost.** During planning you place **ghost outlines of future builds**, and **the moment
  enough real connections exist to make the ghost *legal*, it solidifies with a "circuit closed" flash.**
  **Build-order puzzles without penalties — pure positive feedback**, and it gives the Intent layer's
  FX_SolidifyIntent a *reason* to fire rather than a schedule.

### The incident ticker
**Visual:** timestamped one-liners scrolling at the bottom, in plain language. During an incident it is
the narrative; in peacetime it is atmosphere and foreshadowing. **Clickable — each line Snaps the camera
to its subject.**

**Variations and additions**

- **The Ticker of Shame/Pride.** A persistent news and support ticker along the bottom edge printing events
  **in monospace log style** — *"02:14:07 — cache hit ratio 41%, ouch."* It is **a second channel of state
  for players who never read HUD numbers**, and it is **the game's deadpan comedic narrator.**
- **Ticker variants:** an **SLA/uptime stock-ticker strip** as diegetic furniture (`new client ▲` /
  `churned ▼` / `attack ✕`) · a **syslog event feed where clicking a line jumps the camera and X-rays the
  implicated chain** — *"the lore AND the tutorial AND the debugger"* · and the **news-ticker layer that
  foreshadows threat families** (see Outage weather, §8.7).

### The Unified Clock Ribbon (Timeline + Obligation Rail, merged)
The past and the future of the same object, in one strip. **The single most information-dense element
the game can have.**

**How it works:** One horizontal ribbon with **"now" in the middle, history to the left, obligations to
the right**, scrubbable in both directions, on **two tracks: ops-clock items above, business-clock items
below.** Every timed thing in the game lives here as a small labelled pip approaching the now-line —
cert expiry, the next wave, the backup window, payroll, the audit, the renewal wave, the fuel gauge, the
depreciation schedule, the escrow timer, the 90-day-lag consequences.
**The Three-Clock Rule, rendered (this is how §7.9 gets a visual at last).** §7.9 demands exactly three
clocks and the design proposes roughly twenty timers. The ribbon honours both via a **promotion rule**:
**the three nearest / most-consequential pips are enlarged and given colour; the rest are small grey
ticks.** You keep all the timers and **the interface guarantees the player only has to hold three in
their head.**
**The history side** is colour-coded by health, with incident markers, deploy markers, business events,
the **"It Was Fine" stamps**, the **Consequence Fuses** landing, and the **Retro-Thread**.
**Built once, used in five places:** live play · the postmortem screen · the replay scrubber · the
share image · the Incident Poster.
**Interacts with:** §7.9's three clocks, §6.9's postmortem, §8.7's Consequence Fuse, §6's Commit Ledger
(the obligation side **is** the Commit Ledger — everything you owe, with dates).

### The graph drawer and the Graph Specification
Metrics on demand, in a house style.

**How it works:** A pull-up drawer of the graphs you have unlocked. **The house style for every
time-series in the game:**
- **Percentile bands** — p50/p95/p99 as three lines, **never an average alone**. (p99 is the customer
  who is having a bad time and p50 hides them — a lesson the UI teaches by existing.)
- **A last-week ghost line** for comparison.
- **Annotation pins** for deploys and incidents.
- **A shaded band for the SLO.**
- **A clearly-marked "no data" state that is visually distinct from zero.** **The distinction between
  "zero" and "we don't know" is the single most important thing a monitoring UI can communicate**, and
  it is exactly the game's theme.
- **A unit stamp and a scale tick** (see below).

### The Telemetry Resolution zoom
A signature animation for the whole observability tree.

**How it works:** The player grabs a graph's time axis and **zooms into the timebase**, and as the
resolution increases, **a flat green line resolves into a forest of spikes that were always there.**
Doing this for the first time — discovering that your calm average was hiding a sawtooth — **should be
one of the game's genuine gasps**, and the same animation works for the 95th percentile, for
microbursts, for latency percentiles and for power demand.

### The Demand Ratchet marker
**Visual:** on the power graph, one spike, and a horizontal line drawn from it **to the right edge of
the year**, labelled with **the money it costs every month.** **A single visual that explains an entire
tariff structure.**

### "Explain This Number"
Every figure in the game is clickable and shows its derivation.

**How it works:** Click any number anywhere — MRR, PUE, p99, occupancy, a bill, a score, a nines
figure — and get a card with **the formula, the inputs, and where each input came from, with the inputs
themselves clickable.** For a game with this many derived metrics it is not a nice-to-have: **it is the
difference between a strategy game and a spreadsheet you do not trust.** It also doubles as the Field
Notes delivery mechanism, in context, at the moment of curiosity.

### The Diff View
Comparing two states — the most useful diagnostic UI in real operations, and absent from wave 1.

**How it works:** Any two moments, configurations or objects can be diffed: a rack elevation before and
after, a config now versus last known-good, your topology versus a template, two supposedly identical
machines, this month's P&L versus last. **Rendered side by side with changes highlighted in a dedicated
diff colour outside the semantic palette.**
**And before applying a config change**, show a literal red/green diff. **Approving a diff you did not
read is a player choice with consequences.**

**Variations and additions**

- **The Diff/Patch overlay (the SecOps view).** Monitoring towers toggle a **"known-good ghost" overlay**,
  and **deviations — config drift, new ports — highlight in diff-yellow.** **Intrusion detection as a
  Where's-Waldo aesthetic layer**, which is the security-side twin of the elevation-vs-reality diff (§8.4)
  and uses the same dedicated diff colour outside the semantic palette.

### The dependency map
**Visual:** a generated graph view of what depends on what — **including the dependencies you did not
know about**, discovered via traffic analysis. **Watching it fill in as you gain observability is a
great progression visual**, and the gaps in it are the fog of infrastructure made concrete.

### Sparklines everywhere
**Visual:** every component carries a tiny 60-second sparkline of its key metric. **At a glance you see
shape, not just state.**

### Group / meta-nodes
**Visual:** "Web Tier ×40" as **one object with a count badge and a health distribution bar** (34 green
/ 5 amber / 1 red). Expand to see individuals. **This is how you keep a 10,000-node estate playable.**

### Growing tooltips
Tooltips get richer as your knowledge does — **the UI itself is a progression system.**

**How it works:** Early: *"Some kind of bot."* Later: full behaviour, weakness, expected damage, and
your history with it.
**Extended to build cards:** an early build card shows cost and capability; a later one shows cost,
capability, **your historical utilisation of the last three you built, your average incident rate with
them, and what they cost you in friction.** **The UI becomes an experience record**, which is a
genuinely novel progression axis.

### The hover-card contract
Consistency rule: **predictability beats density.**

**How it works:** Every hoverable thing shows a card with the same four regions: **identity · current
state · relationships · what you can do.**
**Two required additions:** (a) **every object, cable and person shows monthly cost, monthly revenue and
net contribution** — one consistent price tag across the entire game; (b) the last line is **"what
threat is this currently vulnerable to"** — the line that makes a complicated game feel fair.

### The "Why Did I Lose Money" button
**How it works:** A single click produces a ranked, plain-language list: *"1,240 visitors bounced (too
slow) · 310 blocked by your WAF · 88 capacity refused · $4,100."* **The game must always be able to
explain itself in one screen, or the whole latency-budget design fails.**

### The minimap, the NOC wall, and the Money Minimap
Situational awareness at scale — diegetic **and** flat.

**Visual:** a schematic minimap that at high tiers becomes a **wall of screens in your NOC**, showing
the overview graphs, a world map, the ticker, and the "Days Since Last Outage" counter. **Diegetic UI
that is also functional UI.**
**The required clause:** the NOC wall is an **Object of Record** (§8.2) and therefore **must have a flat
equivalent one key away.** The NOC wall is the pretty version; **`M` opens the flat schematic minimap.
Both, always.**
**Variants:** the minimap is **tinted by whatever overlay is active**, so you can spot a hot corner or a
dark (powerless) row from anywhere; and the **Money Minimap** shows **revenue density rather than
geography**, which is a completely different and completely legitimate map of the same building.

**Variations and additions**

- **The HUD *is* the NOC wall — the full diegetic reading.** The interface is a dashboard **in-world**:
  blinking rack LEDs as status lights and **Grafana-style panels rendered as actual monitor walls inside
  the isometric office**, so **zooming in gets you your analytics screen for free** — the ops centre is
  simultaneously a room, an art piece and the stats UI. On the wall: **a ticket queue as a mail tray,
  uptime as a pulsing ECG heartbeat line that attacks dent, a money ticker (green MRR in, red burn out), a
  reputation dial, an alert stack, and an on-call pager bottom-right that physically vibrates the screen
  when it goes off.** *"It should LOOK like a Grafana panel at 2am — that's the fantasy."*
- **The log IS the UI.** Alerts **slide in as terminal lines typed out in green** —
  `[14:02:31] SYN_FLOOD inbound 41 Gb/s` — **auto-scrolling.** Diegetic monitoring, and the fallback
  channel for players who never look at a gauge.
- **The player literally BUILDS the HUD.** Drag graphs onto the wall — RPS, p99 latency, ticket queue,
  cashflow: **the tool IS the art.** **Upgrading your NOC unlocks better HUD features** (interface as a
  buildable), and — the best clause — **graphs get *worse-looking* when your monitoring is
  under-resourced**: stale, sparse points. **UI fidelity as a mechanic.**
- **The room framed fully.** The **playfield is the big central screen**, **side monitors are tickets,
  graphs and alerts**, **the desk below the screen is the build tray** (physical objects on a desk), and **a
  potted plant wilts when you ignore the office.** You are **playing inside your own Grafana**, and
  **traffic-graph peaks ARE the arriving swarms.** With the buildings-show-status mode on, **uptime becomes
  a skyline.**
- **The Ping-Board Radar.** The minimap as **sonar**: **threats blip in signature colours on the sweep**,
  **customer flow shows as a warm current line**, and **the whole map contract is compressed into a 90px
  circle.**
- **Alternative minimap dialects**, each legitimate for a different line: the **architectural plan view**
  (at globe scale, a metro map with glowing route arcs between DC nodes) · **topology-not-terrain** (a live
  nodes/edges schematic coloured by state, *beside* the geographic map, so players get both *where* and
  *what depends on what*) · **density-heat plus incident pings only.**

### The Ledger Drawer
**Visual:** a physical ledger/binder that pulls out, with tabs: P&L, Cash Flow, AR Aging, Per-Line
Margin, Cohorts. **Numbers in a game feel better when they live in an object.**

### The Drawer System
**Visual:** Sales, Support, Abuse, Finance, Capacity and Compliance drawers slide up from the bottom,
each with a badge count. **A player under pressure literally watches their departments light up red in
sequence, which is a beautiful way to render "a bad week."**

### The MRR Waterfall Widget
**Visual:** a live four-segment bar — **New (green) / Expansion (bright green) / Contraction (orange) /
Churn (red)** — that fills and drains across the month. **The most information-dense, most satisfying
single widget you can give a hosting player.**

### The Cash Calendar
**Visual:** a small strip showing the next 30 days with known inflows (invoice run, enterprise payment
due) and outflows (payroll, power bill, lease, loan payment) as little green/red pips. **Seeing the
payroll pip approaching while the enterprise payment pip slides right is pure, cheap tension.**

### The Runway Bar
**Visual:** drains in real time. **Turns amber at 6 months, red at 3, and starts making a soft heartbeat
sound under 1.** Nothing else needs to tell you you are in trouble.
**Interacts with:** the Number Law's rule that **money is never abbreviated below $10k** — which matters
precisely when the runway tone shift is active.

### The Funnel Column
**Visual:** a vertical stack — Impressions → Clicks → Leads → Orders → Provisioned → Paying — each stage
with its drop-off rendered as **visible particles spilling out the side.** **Losses are animated, not
just counted.**

**Variations and additions**

- **The customer lane reads as a funnel — as terrain.** The same funnel, rendered in the world rather than
  in the panel: **visitors are little figures walking a road to your checkout podium**, and **the lanes
  narrow at friction points** — **a slow page is a traffic jam; bad reviews are a detour sign.** Literal
  funnel visualization **as level geometry**, so a conversion problem has a *location.*

### The Cohort Wall / Cohort Grid
**Visual:** the classic cohort triangle as a grid of cells that fade as each month's customers churn. **A
steep fade is instantly, viscerally wrong** in a way a percentage never is, and **discovering that your
Black Friday cohort is a red stripe is a whole narrative in one image.**

### The Contract Gantt
**Visual:** a horizontal timeline of every contract's remaining term, sorted by value. **Colo players
will live in this view.** Renewal windows glow; **a whale's bar ending in 4 months is impossible to
ignore.**

### The Renewal Calendar
**Visual:** the business layer's **wave telegraph** — upcoming renewals laid out as a forecast, so the
commercial side of the game gets the same "you can see it coming" treatment the technical side has.

### The SLA Meter
Live credit accrual — and the corrected number.

**Visual:** a meter per contract showing uptime against commitment, turning red and **counting money
upward** during an incident. **Watching the number climb while you debug is the most motivating UI
element in the game.**
**The correction:** ⚔️ counting *credits* teaches that outages are cheap, which is the wrong lesson,
because the real cost of an outage is churn and renewal concessions. **Show both, with credits small and
the projected churn risk / renewal concession large** — and the contrast is itself the lesson.

### The Concentration Donut
**Visual:** a donut chart where one enormous slice is instantly legible as the risk it is. **The whale
is visible as a shape.**
**The addition: show two donuts** — revenue by customer **and revenue by line of business**.
**Concentration in a line is as dangerous as concentration in a customer and much less obvious.**

### The Obligation Rail / the Commit Ledger
**Visual:** a horizontal rail of upcoming commitments — payroll, invoices due, SLA windows, audit
deadlines, contract renewals, the 90-day-lag consequences. **Turns the future into a visible object.**
*(Merged into the Unified Clock Ribbon above; kept as a named element because the business lens refers
to it as the Commit Ledger — everything you owe, with dates.)*

### View filters: Money / Risk / Customer
Three lenses over the same board.

**How it works:** Tint the world by revenue contribution, by risk exposure, or by which customers are
affected. **The customer lens during an incident — "who is actually hurt right now" — is the one that
changes decisions.**

### The ticket queue panel
**Visual:** a stack of tickets with age colouring, sentiment icons, and the customer's value shown.
**The pile growing while you are in an incident is the truest thing in the game.**

**Variations and additions**

- **Guilt is typographic.** Tickets **physically yellow and curl as they age**; **resolving stamps DONE and
  the ticket flies off.**
- **The queue also exists in-world.** **Little envelopes crowd the support desk building**, and **when it
  overflows they spill onto the customer lane and turn red** — churn contagion, rendered. **Support staffing
  is literally clearing the line.**
- **Tickets as paper on a corkboard.** The pile **visibly grows and tips over when neglected**, and
  **physically overflows during storms** — comedy and clarity at once, because **a visible stack building up
  on a desk is more alarming than a number.** **Desks glow when they are clearing fast**, and **deflection
  via the KB or the community shows as tickets dissolving mid-walk.**

### The DR Declaration board
**Visual (DRaaS line):** a physical board of customer name cards, each **flipping from green (STANDBY)
to red (DECLARED)** with a timestamp. **Watching cards flip during a regional event while the capacity
bar at the bottom fills is the level.**

### Dead Air
**Visual (playout / streaming line):** a single, enormous, unmissable **black frame with a silence
meter**, and a countdown labelled **TIME TO DEAD AIR** that is always on screen. **The visual restraint
is the point — the scariest HUD element in the game should be a number counting down next to a black
rectangle.**

### Time-of-day lighting and the Diegetic Clock
**Visual:** the office and the world light shifts through the day; **3AM is dark, blue and lonely.** A
**wall clock in the facility** plus a shift indicator is how you read time-of-day, which affects staff
availability, traffic patterns, and the light through the Window. **The clock is a mood, not just a
number.**

### Diegetic meters
Readouts as objects in the world. *(All are Objects of Record and all obey the Instrument Design
Language, §8.2.)*

**Visual:** amp meters on PDUs, temperature gauges on CRACs, a bandwidth graph on a wall-mounted screen,
a fill gauge on storage, the fuel gauge on the generator tank, the water-line on the UPS. **Information
where the thing is** reduces the HUD's load — and every one has a flat HUD equivalent and a Readout Mode
(§8.14).

**Variations and additions — the physical gauge widgets**

- **The Gauge Cluster.** CPU, RAM, bandwidth, power and cooling as **five physical needles in a dashboard
  arc**, like a classic car or a steam console. Five of the Instrument Design Language's needle faces in one
  bezel.
- **The Status Light Tree.** A **wall-mounted tower of blinking LED tiles, one per subsystem.** Dial-up
  levels use **the actual modem-LED panel — RD / CD / OH — as the top-level status readout**, which is both
  period-correct and genuinely diagnostic.
- **The Grafana Wall.** Sparkline panels that **glow when a metric goes anomalous**, each panel's border
  taking on the current hosting skin's accent colour.
- **The Connection-Table Counter.** The firewall's state table as **a literal mechanical odometer**, whose
  **digits are visibly eaten by a SYN flood.** At 100% the gate **stops serving humans, not machines** —
  **state exhaustion as a visible, entirely non-violent failure mode**, which no other threat in the
  document renders.

### Notification discipline
Interruption is a budget — with a stated channel spec.

**How it works:** **Only a genuine sev-1 may take the screen.** Everything else is a ticker line, a pip,
or a badge. **A game that constantly pops up modals is unplayable at Tier 5.**
**The three-channel spec (every system must declare its channel at design time):** **ticker line**
(ambient) · **pip / badge** (state) · **card in the alert stack** (actionable) · **modal** (sev-1 only,
max one, auto-pause optional).

### Tutorial-free onboarding
Teach with animated tooltips and events, not walls of text. **Almost no tutorial pop-ups.**

**How it works:** The first of anything shows a small animated demonstration on hover. Concepts arrive
as events that hurt slightly and then unlock their own counter.
**The format that makes it affordable:** a **2-second looping micro-demo** in the hover card's top
region, authored as a tiny isometric vignette with **no text**, showing the mechanic in the abstract — a
cable snapping in, a ring depleting, a breaker opening. **~60 of them across the game, all 200×120px,
all the same style. A consistent format is what makes them cheap.**

### The Attention Heatmap
Where have you been looking?

**How it works:** A post-level overlay showing **where the camera actually spent its time**, laid over
**where incidents actually occurred.** Players discover they watched the interesting rack while the
boring one failed. **A self-knowledge tool disguised as a stat**, and it makes the "attention is a
resource" pillar visible retroactively.

### The Regret Marker
**How it works:** During the postmortem replay, the game places **small numbered markers at the two or
three moments where a different action was available and would have mattered** — with the cost of the
road not taken. **Never during play; only in review.** It is the single most efficient teaching device
available because it uses the player's own run as the lesson.

### The Scale Bar and the Unit Stamp
Making magnitude legible for a newcomer.

**How it works:** **Every meter carries a small permanent unit stamp** (kW, Gbps, ms, TB, req/s, $/mo)
and, where relevant, a **familiar-comparison tick** — *"1 MW ≈ 750 homes," "40 Gbps ≈ this city's
residential peak," "11 nines ≈ one lost object per 10 million years."* **The game is full of numbers
whose scale is meaningless to a newcomer, and one tick mark fixes each of them.**

### Quiet Mode and Packet Mode
Two legitimate ways to play, both supported.

**How it works:** **Quiet Mode** hides all combat VFX and shows only the commercial layer, for players
who want the tycoon game. **Packet Mode** hides the money and shows only the technical layer. **Both are
legitimate ways to look at this game and it should support either.**

### The Player Character Question
Who are you, visually?

**How it works:** **You are the cursor and the clipboard.** No avatar in the world — you are the
selection reticle, the flashlight cone in dark scenes, the hand tokens at the bottom of the screen
(**which is also, at last, a visual for the Hands resource** — see §8.18), and a desk in the office that
accumulates objects: a mug, a pager, a photo, awards, a plant that lives or dies with your morale stat.
**The one time you appear is the photo on the About page of your own website, visible in the Site
Preview Window** — a wonderful, subtle joke. Keeps the fantasy flexible and costs almost nothing.

### Diagram export
**How it works:** Export the Wiring Mode view as a clean Ink Blue blueprint image with your company name
and mark in the title block. **Free marketing and a genuine player-pride feature.**

### The Two-Second Rule for Every Screen
An acceptance test for UI panels.

**How it works:** **Any panel the player opens during an incident must yield its primary answer in two
seconds.** Panels that fail get restructured until the answer is at the top in the largest type.
Enforced by playtest with a stopwatch. **A small discipline that would materially improve every UI idea
in this subsection.**

### The Uptime Ring
The game's heartbeat, in peripheral vision.

**Visual:** A **top-centre breathing ring that pulses once per healthy second** and **stutters on
downtime.** Legible without being looked at, and **its colour and rhythm shift per act palette** so it
carries era identity for free.
**Relationship to the vitals:** it is an alternative rendering of the top bar's **uptime nines water line**
— a Ring (per the Ring Taxonomy) rather than a level — and the two should not both ship, because two
uptime instruments in the same 48px is exactly the shouting match the Big Number Rule forbids.
**Interacts with:** §8.2's Ring Taxonomy, §8.8's Top Bar, §8.18's flagged "uptime nines water line" gap.

### The Attack-Surface view
The Swiss-cheese firewall, made visible. *(This is the geometry §8.18 flagged the "attack-surface rose" as
lacking.)*

**How it works:** A mode that shows **every listening port as a glowing door on your building**, and
**forgotten open ports are the *brightest*** — neglect renders as light.
**Attack surface as a literal aura:** boxes **emit a faint field sized by their enabled services** — light
up FTP and the red halo grows — and **hovering shows the inventory of vectors.** The capability/
attack-surface tradeoff taught visually, at the object, at the moment of decision.
**The "threat view" key:** one toggle sets **everything reachable from outside glowing while unused ports
fade** — **placement strategy in one switch, and a beautiful board transformation.**
**Interacts with:** §8.8's build cards (which already show the Surface icons a build adds), §8.7's Failure-
Domain Outline (what a node *owns*, as opposed to what it *exposes*), §8.8's Security overlay.

### Countdown rings and ticking props
One timer idiom, learned once.

**How it works:** **Every timed system in the game uses a shrinking ring in the item's own colour** —
ransomware timers, SLA hourglasses, TTLs, generator warmup, cert expiry. **One idiom, instantly learned,
screen-reading gold**, and it is the Ring form of the Ring Taxonomy applied without exception.
**Cert expiry, specifically:** a **little calendar icon above each service with a countdown that yellows
and then reddens**, and **renewing plays a satisfying seal-stamp.**
**SLA clocks as a Sword of Damocles:** active enterprise contracts **hang a visible countdown over the
affected infrastructure during incidents**, and **the room shakes when it is about to breach** — business
stakes made spatial. The **Runway Hourglass on the NOC desk drains at live burn-rate and frosts near
empty**: *"every operator's favourite nightmare object."*
**Ticking props:** **calendar and egg objects per service**; **a renewal tower sends a little courier to
refresh them**; **when one cracks open it is an event** — an outage or a scare. Object inspection is
**"server paperwork"**: a floating dossier with **serial number, a warranty gauge whose depletion visibly
schedules hardware-failure dread, load gauges and a connections list.**
**Interacts with:** §8.2's Ring Taxonomy, §8.8's Unified Clock Ribbon (which is where these pips live once
promoted), §8.2's Instrument Design Language.

### The Corner-Zone HUD Constitution
Fixed zones, so peripheral vision can be trained.

**How it works:** **Money top-left · uptime ring top-centre · pager bottom-right · tickets left-middle ·
minimap top-right.** **Nothing ever floats mid-screen except incident-command cards.** *"Players develop
peripheral vision because the frame never rearranges itself outside phase-shifts."*
**The tension it creates with the promoting top bar:** §8.8's Top Bar is deliberately **threshold-driven and
promotes**, which is the opposite discipline. Both survive if the *zones* are constitutional and only the
*contents of the two flexible slots* may promote — state that clause or the two rules will be implemented
by different people.
**Interacts with:** §8.8's Screen Budget, the Panic Layout (the one sanctioned phase-shift), §8.14's UI
scale collapse behaviours.

### Edge-cue arrows with heraldry
Off-screen threats, without sound spam.

**Visual:** Off-screen threats get **edge arrows carrying their family sigil** plus **a distance-pip ring —
1 to 3 pips for near / mid / far.** **Silent, no audio spam, and colour-blind-safe by sigil**, because the
sigil is the threat class mark (§8.5) and the pips are a count channel (§8.2's Ring Taxonomy).
**Interacts with:** §8.8's Bezel HUD off-board register, §8.5's threat class marks, §2's Off-Board Register.

### The Ribbon-of-Realms edge meter
Peripheral awareness by design.

**Visual:** The map edges carry **a thin animated border**: the **market side shows incoming customer
density as a golden tide-line**, and the **internet side shows threat density as a churning red line.** You
read *who is coming this wave* **from the border while staring somewhere else entirely.**
**Interacts with:** §8.2's Entry-Side Contract (this is that contract turned into an instrument), the Bezel
HUD's 10px inner border, §8.5's Threat Horizon.

### The Wave Clock
The arrival timer as a physical object.

**Visual:** The next-wave timer rendered as **a physical clock — or a modem-handshake dial — in the corner,
winding down.** The **final 5 seconds tick audibly, synced to a pulse on the approach lane**, so the
telegraph lands in two channels at once.
**Interacts with:** §8.12's Wave Telegraph, §8.5's telegraph grades, §8.10's per-era chrome (the dial face
is a Chrome Skin token swap).

### Cursor personality
The pointer is a character too.

**Visual:** **Dial-up = an hourglass-and-hand · colo = a cable-tester probe · regulated = a rubber stamp ·
GPU = a laser level.** During wiring mode it becomes **a coiled patch cable in hand.**
**And it solves a real problem:** **mode-uncertainty is answered at the cursor** — wire spool / wrench /
magnifier / red-X per mode — which is the cheapest possible fix for "what will clicking do right now."
**Interacts with:** §8.10's per-type identity (the cursor is a sixth cheap skin channel), §8.7's
connection-made click, §8.8's radial build menu.

### The Dark-Pattern Radon Meter
Offence made audible before it is visible.

**Visual:** In the regulator corner of the HUD, a **Geiger-style clicker** that **rises with every
cancel-maze, egress toll or dark pattern you enable.** **At threshold, an inspection walks in.**
**Why it matters:** it is the only instrument in the document that measures *your own* conduct
continuously, and the choice of a *sound-first* meter means the player hears themselves drifting.
**Interacts with:** §8.5's Regulator, §8.8's notification discipline, §8.11's Signals bus.

### The Quadrant Plot (the satire HUD)
**Visual:** A framed **2×2 chart on the wall** — *ability of execution* × *completeness of vision* — with
**your dot drifting as analyst events land.** Click it for **"notes" in dry consulting-speak.** *"Satire,
but it's the real HUD of hosting marketing departments."*
**Interacts with:** §8.7's building-reads-your-progress wall, §8.10's Business Line Placard, §9's humour
register.

---

## 8.9 Readability at scale

### Aggregate, don't shrink
The governing rule.

**How it works:** As counts grow, entities merge into a **single glyph with a count and a worst-state
colour** — never into tiny unreadable versions of themselves. **A rack of 40 servers is one object with
a health summary until you zoom to it.**
**The aggregation contract (what an aggregate glyph must carry).** Four required fields, plus one:
1. **A count** of members.
2. **The worst state inside it.**
3. **The count of non-nominal members.** *"Rack 7: 40 units, 2 degraded"* reads instantly; *"Rack 7:
   degraded"* hides whether it is one drive or the whole row. **The count is what turns a summary into a
   triage decision.**
4. **A trend arrow.** Without the trend, an aggregate tells you where you are and not where you are
   going, which at Z3/Z4 is the only thing that matters.
5. **Whether anything inside it is pinned** by the player.

**Variations and additions**

- **Heatmap plus Badge Triage.** At maximum zoom-out, everything collapses to **one blended state-heatmap
  plus count badges** — `47 ⚠`. **Triage by number, then zoom to act.** **Badges use shape-icons**, so
  colour-blind mode still parses the ladder.
- **Cluster counters — abstraction that never lies about population.** Swarms **display an embedded numeral
  at mid-LOD**: `×340` rides the botnet cloud, `×47` rides the queue. **Quantity becomes information rather
  than spectacle**, which is the missing half of "aggregate, don't shrink" — the aggregate glyph carries the
  count, and now so does the *flow*.

### The Aggregate Glyph
The concrete form.

**Visual:** a rack summarizing 40 servers draws **one glyph: a small vertical bar chart of its servers'
states**, a 40×1 pixel column. **It is a literal sparkline made of your fleet and it is readable at
12px.**

### Heat Tiles over Sprites
**How it works:** At Z3+, individual state dissolves into a **per-rack tile colour.** The floor plan
becomes a **low-res image of your company's health**, which the human eye is extremely good at scanning.
Combined with the Money overlay it becomes a low-res image of your *margin*, which is the same trick
pointed at the P&L.

### The Fleet Sparkline Wall
**How it works:** An optional Z3 overlay: **every rack rendered as a small sparkline of its last 5
minutes.** 200 tiny graphs is actually very readable when they are identical in shape and you are
scanning for the odd one out.
**Interacts with:** anomaly highlighting, below — the two together are how a large estate is triaged.

### Anomaly highlighting, not status highlighting
The rule that makes a large healthy estate useful to look at.

**How it works:** At scale, **do not colour things by status** — everything would be green. **Colour
things by deviation from their own baseline.** **A rack that is fine but weird is the one you want to
see.**
**Interacts with:** §8.4's "one light out of phase with its neighbours," the Heartbeat Sync below, and
§7's observability tree (you can only compute a baseline for what you instrumented).

### Roll-Up Rendering
**How it works:** Beyond a zoom threshold, individual servers merge into a single **row** object that
inherits the worst status of its members and displays **aggregate MRR and utilization.** **You never
lose the ability to read the money**, which is the business lens's version of the LOD promise.

### Aggregation badges
**Visual:** a rack shows **"3 warnings"** rather than three tiny icons. Never three tiny icons.

### The colour budget
See §8.2's Readability Budget and Alert Triad Rule. **Three alert colours on screen, maximum, allocated
by severity.**

### Alarm propagation and worst-state-wins
See §8.3. **You cannot hide a problem by zooming out.**

### Row rhythm and floor signage
Make a big room navigable.

**Visual:** consistent row spacing, **aisle numbers painted on the floor**, rack labels at the top of
each cabinet, hot/cold aisle colour hints in the floor paint. **Wayfinding design borrowed from real
datacenters, because it solves the same problem.**

**Variations and additions**

- **Painted aisle wayfinding.** **Floor arrows and colour-coded stripes physically mark networks** —
  `PROD ONLY`, `STAFF`. **Segmentation made physical**, and the payoff is diagnostic: **a mis-wired DB
  *looks wrong* against the floor tape before the telemetry catches it.**

### Tenant tinting
In multi-tenant and colo views, each customer gets a hue — within limits.

**Visual:** a subtle tint band on their gear. **Instantly answers "whose is this" and "who does this
outage affect."**
**The resolution (a hue per customer, in a game with a nine-hue semantic palette, does not scale):**
tenant tint is a **low-saturation band on the cabinet frame only**, drawn from a deliberately muted
**12-hue set visually distinct from the semantic palette**; **beyond 12 tenants the game stops assigning
hues and uses initial-lettered nameplates instead.** **Attempting 200 distinguishable tenant colours is
the failure mode to avoid.**
**And:** identity tint is **suppressed entirely inside any object in a warning-or-worse state** — alert
colour always wins (§8.2).

### The Heartbeat Sync
All ambient pulsing shares one clock.

**How it works:** Every idle pulse, LED blink and flow pulse is synchronized to **one global heartbeat
at ~0.5Hz**, so the room breathes together. **Anything out of sync is instantly noticeable** — which
turns desynchronization itself into an alarm channel.
**Interacts with:** §8.4's LED grammar (brightness modulates within the heartbeat, blink timing does
not), anomaly highlighting above.

### The Cadence — rendering "nothing is happening" as an achievement
Calm-as-synchrony instead of calm-as-absence.

**How it works:** A healthy, quiet board should have **one distinctive positive visual**, not merely the
absence of red. **When everything is inside its dependency contracts, all the flow pulses synchronise to
the global heartbeat and the room visibly "breathes together." A single object out of contract breaks
the sync, and you can see it from across the room before any alert fires.**
**Why:** the Quiet Frame Test says a healthy screenshot must be calm; §9.6 says peacetime must be
valuable. **Calm-as-absence is boring. Calm-as-synchrony is beautiful, is a diagnostic, and turns
"everything is fine" into something worth looking at.**

### The Quiet Frame Test
An art-direction acceptance test. **This single test protects the entire visual language.**

**How it works:** A screenshot of a healthy system must be **calm** — low contrast, slow motion, few
colours. If a healthy screenshot looks busy, the design has failed, because it means nothing loud can
mean anything.

### The Loud Frame Test
The necessary companion. **Test both ends of the range or you only protect one.**

**How it works:** A screenshot at peak crisis must let a stranger answer three questions in five
seconds: **what is broken · what is the worst thing · what can I do right now.** If it cannot, the
crisis rendering is too dense.
**The stricter phrasing:** a crisis screenshot must contain **exactly one obviously most-urgent thing.**
If it has five equally loud things, the alert hierarchy has failed.

### The Thumbnail Test
The third acceptance test, aimed at the game's biggest production risk.

**How it works:** **A 128px thumbnail of any screenshot must answer three questions: which hosting line
is this · what tier is it · is it okay right now.** If it cannot, the composition has failed. Cheap,
ruthless, and it directly serves the promise that thirty hosting types will read as distinct.

### Auto-LOD collapse and label culling
Text never overlaps.

**How it works:** Labels are ranked by importance and **culled from the bottom as density rises**; the
selected object's label always survives. **Never clip, never overlap, never shrink below legibility.**
**Label budget: 30 visible labels maximum at Z3.**

### The readability targets
Stated numbers, because "readable at scale" is unfalsifiable without a figure.

**How it works:** The game must remain legible at **2,000 discrete objects and 20,000 in-flight entities
at Z3**, on a 1080p display, **at 2× speed**, by a player who **has not looked at that part of the board
for 60 seconds.** **Aggregation kicks in at 40 entities per glyph. Label budget 30 at Z3.**
**Why it matters:** **numbers make the rules testable, and testable art direction is the only kind that
survives production.**

### Zoom tiers change the metaphor
Each altitude is allowed its own language — with one constraint.

**How it works:** Z1 is a machine; Z3 is a diagram; Z4 is a map. **The transition animation is what
teaches that they are the same thing**, and **the selected object's screen position may never move
across the transition** (§8.3).

### The Squint Test as Ritual
The art-review rule, made a standing ritual rather than a taste call.

**How it works:** **Any mid-to-late-level screenshot, squinted at, must answer "where's money, where's
trouble, what's failing" in three squints.** Photo mode can **flag a squint-fail on players' own bases**,
which turns the gate into a community feature.
**The luminance hierarchy law that makes it enforceable:** **the three brightest things on screen at any
moment must be the largest money flow, the worst active failure, and an incoming boss** — enforced by **an
auto-dim pass, not by artist discipline.** *"The squint test, but with a tool."*
**The three-second phrasing:** if a player cannot answer **"am I green, where's the fire, who's churning"
in 3 seconds at any scale, that is a bug**, and **contrast budget is reserved permanently for the churning
crowd and the breach flash.**
**The per-zoom clause:** the **flow-squint acceptance test must pass at every LOD**, not only at full
detail — which is what stops the Density Ramp from quietly failing the test at Z3.
**Interacts with:** §8.9's Quiet, Loud and Thumbnail tests (this is the fourth member of that family),
§8.2's Chroma Meter (the auto-dim pass is its enforcement arm), §8.16's acceptance-test roster.

### Function Grouping Brackets and Neighbourhoods
Command and read **fleets, not pets.**

**How it works:** **Selection brackets cluster same-role services** — all web servers under one translucent
bracket — and **a bracket flickers as a unit when attacked**, so you see **which service class is hurting**
rather than which box.
**Neighbourhoods (the spatial version).** Assets **visually cluster with a shared floor-tile colour or a
subtle rug-baseplate per logical group**, so **a thousand racks read as eight districts** — and **the
district baseplate tint shows aggregate health**, which makes **a slow amber wash creeping over "Database
Row" an instant diagnosis.**
**Interacts with:** §8.8's Group / meta-nodes (the panel version of the same grouping), §8.10's multi-line
districts, §8.9's tenant tinting and its 12-hue cap.

### The Importance Halo and the focus assists
Soft-focus tools that point the eye without moving the camera.

**How it works:** Anything **on the currently critical customer path OR under active attack** gets **a
subtle under-glow**, while everything else recedes — a **toggleable soft-focus assist** rather than an
automatic one.
**The family:** a **Threat Spotlight** mode that keeps threats at full saturation so attacks **pop as colour
islands** (*"the scan mode flick feels like putting on the SOC's glasses"*) · an **attention stack** variant
that **dims all healthy systems and spotlights anomalies** · and a **focus mode that dims everything except
the selected dependency chain.**
**Implementation note, and it matters:** render selection, threat and critical states as **screen-space
edge-glow outlines** rather than as added sprites. **Hundreds of outlines cost nothing and never occlude**,
which is the only version of this that survives 2,000 objects.
**The unresolved part:** *how* the un-focused world recedes is genuinely disputed — see the conflict below.
**Interacts with:** §8.3's Smart Focus and depth fog, §8.16's Salience Score, §8.2's Activity Halo.

### Focus dimming — may desaturation carry attention? — *CONFLICTING*
Both documents want a focus assist that pushes the irrelevant world back. They disagree about **which
channel is allowed to do it**, and the two rules cannot both hold, because one reserves the exact channel
the other spends.

#### Position A — desaturation is reserved; focus uses contrast and value *(master)*
**Saturation is permanently reserved for urgency** (§8.2's three state axes: health = value + temperature,
urgency = saturation). Therefore **distance, irrelevance and focus may *never* be expressed by
desaturation** — *"a hazed healthy rack and a dying rack must never read the same."* Focus and depth
instead use **contrast reduction and a slight value lift**, and incident focus-dim pushes unrelated objects
**a shade darker**, never greyer. FX_ForensicDesat is the single sanctioned exception, and it is a
full-screen investigative mode rather than a continuous assist.

#### Position B — desaturation is the focus channel *(opencode)*
**The Importance Halo desaturates everything off the critical path by 15%**, and **Threat Spotlight
Desaturation pulls the whole world 30% desaturated while threats keep full saturation**, so attacks pop as
colour islands. The **attention-stack** and **focus-mode** variants do the same thing to healthy systems
and to off-chain dependencies. The argument is that **at 100+ entity states nothing else is strong
enough** — value and contrast changes are too subtle to carve a path out of a dense board, and the
"SOC glasses" flick is the most legible mode-change available.

**What the decision turns on:** whether the urgency channel can tolerate being borrowed *globally and
uniformly* (a uniform 30% pull arguably preserves *relative* saturation, which is what the health read
actually uses) or whether any use of the channel poisons it. A possible third path, unclaimed by either
document: **make the focus assist a modal overlay** — one of the Readability Budget's "1 active overlay"
slots — so it is never on at the same time as a health read, which is how the two rules could both survive.

### Ghost of Uptime Past
The past as a visual layer.

**How it works:** **Yesterday's traffic renders as a translucent ribbon *beneath* today's** — spatial
year-over-year comparison, so **"am I growing?" is answerable at a glance** rather than in a chart.
Extended: **seasonality and incident history become a learnable readability skill** rather than a screen you
have to go and open.
**Interacts with:** §8.8's Pulse Strip ghost band and the Graph Specification's last-week ghost line — this
is the same "ghost" element of the Instrument Design Language, applied to the *world* instead of to an
instrument.

### Seismograph Radar Blooms
The threat radar as a world-space texture.

**Visual:** Attacks **announce themselves as concentric ripples from their entry point**, **propagating
along the cabling** and **arriving the moment before impact.** **Ripples are layered per threat family** —
**a flood is a wide slow wave, an exploit a tight fast ping** — so the telegraph carries *class* as well as
*timing*.
**Interacts with:** §8.5's telegraph grades and radar sweep, §8.7's east-west traffic (the ripple travels the
same cables the motes do), §8.13's Anticipation Budget.

### The Wireframe Census ("flow mode")
A two-second global read on any busy screen.

**How it works:** **A free key dims all entities to their paths and streams** — **pure dual-flow lines,
customers as warm currents, threats as red eddies**, and nothing else drawn at all. It is not an overlay in
the wheel's sense (it adds no dimension); it **subtracts the substrate**, which is why it costs no alert
budget and can be held down rather than toggled.
**Why it matters:** every other readability tool in this subsection aggregates *objects*. This one
aggregates *nothing* and removes everything that is not motion, which makes it the fastest available answer
to "what is moving and which way."
**Interacts with:** §8.2's Layer Law (this is the Flow layer, alone), §8.4's two registers, §8.9's
Importance Halo family above.

---

## 8.10 Per-type and per-era visual identity

*The variety engine. The hosting type changes per level/scenario and per era, and it must reshape the
look without reshaping the budget.*

### The Business-Line Skin System — the Five-Asset Skin Kit
The mechanism for making thirty hosting types look distinct without thirty art budgets. **The single
most practical idea in the visual half of the document.**

**How it works.** Each hosting line ships exactly **five bespoke assets** and inherits everything else:
1. **A signature meter** — the scarce-resource readout, as a face within the Instrument Design Language
   (§8.2).
2. **A visitor form** — what a customer looks like arriving (§8.6).
3. **A hero silhouette** — the one object that says *this is a GPU host / a tape vault / a game server*.
4. **A palette** — one dominant hue plus an accent that re-tints the substrate layer, within the muted
   band.
5. **A signature catastrophe FX + ambient sound** — heat shimmer, tape robot motion, a busy signal, a
   fan wall, the frayed line.

**The authoring order matters — meter first.** ⚔️ Wave 1 listed palette first and meter fourth. The
design lens's correction: **of the five assets, the signature meter is the one that carries the gameplay
identity, and it should be specified first, not last. If you cannot name the meter, the type does not
have a ruleset yet — it has a costume.** Recommended order: **meter → visitor form → hero silhouette →
palette → ambient FX/sound.**

**The honest accounting (the fix for "five assets" that was really ten).** §8.10's catalogue specifies
palette, silhouettes, visitor forms, meters, FX, materials, lighting, density, visitor rhythm and sound
for each of thirty lines. That is not five assets; it is ten-plus, and thirty lines × ten is a real
budget. **Reclassify:** the five above are the **bespoke assets**; everything else is a **parameter of a
shared system** and must be written as such —
- **density** is a spawn-count multiplier;
- **visitor rhythm** is a curve on the baseline generator;
- **material and lighting** is a lookup of existing shader presets (albedo, roughness, one accent
  emissive — nothing more, per the Foreignness Budget);
- **sound palette** is a sample-set swap on the existing ambient bus;
- **home/detail altitude** is two enum values in the Ruleset Card;
- **HUD gauge slot** is a widget reference.
**Rewriting the catalogue as "five assets plus eight parameter values" makes the whole variety engine
credible instead of aspirational — and it is the same content, just honestly accounted.**

**The sixth asset, cheap and high-value — a bespoke commercial artifact.** The object the customer
actually cares about, rendered, at a cost of one icon per line: shared hosting = **the coupon code**.
Colo = **the signed lease with an escalator clause**. GPU = **the reservation contract with a term and a
prepayment**. Backup = **the restore-SLA certificate**. Email = **the deliverability report**. VoIP =
**the rate deck**. Game hosting = **the community Discord**. Regulated = **the audit report**. CDN =
**the peering agreement**. DNS = **the zone file**.

**The Identity Kit Manifest (the full authoring form per line).** Each type supplies: **palette chord
(5 swatches)** · **ambient light temperature** · **floor material** · **dominant silhouette** (rack /
cage / tank / dish / cabinet / shelf / desk) · **visitor form** · **threat accent** · **particle
emphasis** · **signature motion** · **HUD gauge swap** · **density signature** · **arrival rhythm** ·
**home + detail altitude** · **commercial artifact** · and **one hero object** that appears in the key
art (the tape robot arm, the immersion tank, the modem wall, the meet-me room, the dish field, the
sorting table).

### The required five-field catalogue format
So the catalogue is authorable rather than a set of adjectives.

**How it works:** every line's entry must fill exactly these fields:
`palette (2 hex + material)` · `hero silhouette` · `visitor costume (hull + prop)` · `signature meter
(gauge face + bound resource)` · `ambient FX + sound` — **plus the two parameter values that carry the
most identity per pixel: `density signature` and `arrival rhythm`.**
**Why the last two matter:** **two lines with the same palette but different density and arrival rhythm
are more distinguishable than two with different palettes and the same rhythm.** Motion identity beats
colour identity at every zoom and in every accessibility mode.

### The Hero Object Rule
**How it works:** **Every level must have one object that is worth a screenshot.** Design the level
around making the player build it and then look at it. The hero object is also the subject of the
Signature Frame and the key art.

### The HUD Swap Per Type
Teaching business-model differences through UI.

**How it works:** **The top bar's gauge slot is the "what this business actually cares about" slot and
it changes per level.** Shared hosting shows *accounts and abuse*. Colo shows *power, cooling, access*.
CDN shows *hit ratio and PoP map*. Backup shows *RPO/RTO and window clocks*. GPU shows *utilization,
temperature and $/GPU-hour*. Game hosting shows *tick rate, player count and ping*. Mail shows *queue
depth and reputation*. SIP shows *concurrent calls and MOS*. DNS shows *p99 and anycast health*. DBaaS
shows *replication lag*. Streaming shows *time to dead air*.
**All of them are faces in one bezel** (§8.2's Instrument Design Language), which is what stops this
from becoming thirty HUDs.

### The Cross-Business Facility
When you run several lines at once.

**How it works:** The facility is **visually zoned by Identity Kit**, and the HUD gains a **business-line
selector** — clicking one **dims the others' zones and swaps the specialized gauge.** **Your company's
messiness becomes legible.**

### Multi-line districts
**Visual:** each line occupies a visually distinct district — different floor paint, lighting, density
and material language — separated by clear boundaries. **You should be able to tell which business you
are looking at from a single frame with the UI hidden.**

### The Business Line Placard
**Visual:** a mounted placard per line with its name, icon, palette swatch and start date. Multi-line
companies get a wall of them; **divested lines get theirs turned to face the wall.**

### Cross-line collision control
Keeping multi-line screens readable.

**How it works:** When lines share a screen, palettes are constrained to their **dominant hue only**,
applied to the substrate at low saturation, and shared UI stays neutral. **The Readability Budget
applies across lines, not within each.**
**The clause that makes it work:** **in a multi-line facility the Flow layer stays globally neutral** —
traffic is cyan / magenta / violet everywhere regardless of which district it is in. **Districts colour
the building, never the packets.**

### Density signature
How full the room looks is part of the identity.

**How it works:** Shared hosting is **crowded**; dedicated is **sparse**; wholesale is **nearly empty**;
crypto is **absurdly overpacked**; edge is **tiny and many**; tape is **tall and still**. **Density
alone identifies a line from a thumbnail**, which is exactly what the Thumbnail Test measures.

### Visitor rhythm signature
The tempo of arrivals differs per line.

**How it works:** DNS is a **constant fine drizzle.** Game servers arrive in **evening waves.** Backup
arrives in a **nightly burst.** Colo arrives **once a quarter, in a suit.** Blockchain arrives on a
**metronome.** Inference arrives in **bursty diurnal humps.** Email arrives in a **morning spike and a
long tail.** **The rhythm of the screen is part of the identity**, and it is one number on a curve.

### Material and lighting language per line
Beyond palette. **Material carries mood faster than any HUD element.**

**How it works:** Shared hosting is **plastic and fluorescent.** Colo is **steel, mesh and cool
overheads.** GPU is **copper, glass, liquid and orange glow.** Tape is **matte black, barcode white and
a single work light.** Regulated is **clean white, camera domes and even light.** Bulletproof is **dim,
uneven and shadowed.** Wholesale is **raw concrete and daylight through a roll-up door.** Satellite is
**outdoor light and weather.**
**The constraint (so material does not fight the Flow layer):** per-line material may vary **albedo,
roughness and one accent emissive** only. **It may never change the status-LED language, the Load Donut,
the port studs or the alert palette.** That is the Foreignness Budget applied to your own lines.

### Per-line visual identities — the catalogue
*Fuller descriptions live with each type in §1.3 and §4.10. Every entry below is a line's Identity Kit
in shorthand; the thin ones have been filled out to the five-field standard.*

- **Shared web hosting** — dense, uniform, cheerful, cluttered, beige-and-blue; hundreds of identical
  small units packed like an apartment building with the lights on; a wall of tiny customer-site
  thumbnails; a churning crowd of tiny visitors; a control-panel UI motif. **Meter:** accounts + abuse
  rate. **Ambient:** a wall of fans. **Density:** crowded. **Rhythm:** constant, diurnal.
- **Managed WordPress** — same density, nicer materials, **plugin icons visible as attached modules**,
  a visible "updates pending" badge culture. **Meter:** patch lag.
- **VPS / cloud** — a clean grid of **translucent nested containers inside host chassis**; you can see
  the tenants as glowing cells; **noisy neighbours pulse and crowd their cell walls**; a satisfying
  tetris-like allocation view where **overcommit is shown as translucent overlapping blocks.** Cool
  blues. **Meter:** overcommit ratio / steal time.
- **Dedicated / bare metal** — fewer, bigger, heavier units with real bezels; **each has a customer name
  plate bolted on.** Sparse, solid and expensive-looking. **Meter:** per-box margin.
- **Colocation** — architectural: **cages, mesh, padlocks, wide aisles, signage, a lobby, a security
  desk**, tenant tinting, ladder racking full of orange fibre. **Gear you can see but not touch**,
  rendered slightly desaturated and behind a boundary; **other people's cages as semi-opaque frosted
  boxes you cannot see into**, each with a nameplate, a power meter and a temperature readout — **the
  opacity is the whole point: your customers are black boxes.** The humans on the floor are the
  animation. Palette: concrete, steel, corporate blue. **Meter:** power, cooling, access. **Home
  altitude:** Z3.
- **Wholesale / hyperscale** — vast, empty, grey, under construction; cranes; a shell with capacity
  drawn in outline; a site plan with substations, generator yards and **empty pads awaiting
  build-to-suit.** Almost a city-builder. **Scale as emptiness.** **Home altitude:** Z4.
- **Game servers** — dark room, neon and saturated accent lighting, a Discord-adjacent aesthetic, server
  icons wearing game skins, a server-browser / scoreboard UI motif; **player avatars as teardrops
  persisting in the node with ping numbers floating above them, visibly happy or rage-quitting**; a
  region ping map. **Meter:** a **tick-rate oscilloscope.** **Rhythm:** evening waves.
- **VoIP / SIP** — lines held between points as **literal glowing strands**; a **busy-signal lamp**;
  channel counters; **the Frayed Line** — call quality degrading as a strand visibly unravels.
  **Meter:** a call-quality (MOS) needle and concurrent calls.
- **Email** — envelope motes; **outbound envelopes stamped ACCEPTED / DEFERRED / REJECTED at the far
  edge**; blocklist status lamps; a deliverability funnel with a spam-folder side channel; text-forward,
  log-stream aesthetics. **Meter:** a prominent **reputation gauge** plus queue depth. **Commercial
  artifact:** the deliverability report.
- **DNS** — tiny, constant, everywhere; a **fine drizzle of query motes**; an anycast world map with
  glowing PoPs; almost abstract. **Meter:** p99 resolution time. **Home altitude:** Z4.
- **CDN** — a **world map as the primary play surface**; PoPs as pins; traffic as arcs; **peering drawn
  as permanent gold shortcuts**; content propagating outward in waves on publish; cold cache renders as
  dim nodes filling with light. **Meter:** a **hit-ratio dial.** **Home altitude:** Z4. **The only level
  that looks like a strategy map rather than a room.**
- **Object storage** — accretive; volumes that only ever grow; erasure-coding shown as fragments
  distributed across nodes. **Meter:** a fill gauge with a durability figure.
- **Backup / DR** — cold blue, quiet, slow; **a timeline as a second axis**, restore points as nodes in
  the past; vault doors. **The calmest screen in the game, which makes its rare disasters land harder.**
  **Meter:** RPO/RTO clocks and a **durability dial.** **Hero image:** the green verified-restore stamp.
  **Commercial artifact:** the restore-SLA certificate. Plus the **DR Declaration board** (§8.8).
- **Tape vaulting / archival** — **the Tape Ballet**: a robotic library arm moving cartridges, barcode
  labels, courier vans on a little road, a physical vault door, cold blue lighting, a cathedral of tape.
  Slow, mechanical, mesmerizing, **enormously reassuring until it isn't.** **Meter:** media age and
  vault inventory. **Density:** tall and still.
- **Video / streaming / playout** — transcode ladders visualized as **parallel bitrate lanes**; a live
  viewer counter; egress rendered as a **firehose.** **Meter:** **TIME TO DEAD AIR** next to a black
  rectangle (§8.8). **Viewer:** an eye icon with a stutter ring when rebuffering.
- **Seedbox / file** — messy, fast, high-churn; takedown notices as paper; abuse tickets as a growing
  pile. **Hero:** a shelf of storage boxes with hand-written labels. **Visitor:** a fat transfer ribbon.
  **Meter:** an **abuse-queue depth tray.** **FX:** the null-route — a pipe visibly capped.
- **GPU / AI** — hot, loud, dense, dark; **heat shimmer and liquid cooling loops** as the signature;
  angry orange thermal glow; **liquid-cooling manifolds rendered as visible plumbing**; enormous power
  draw shown as **thick copper cabling**; racks glowing orange in thermal view; **a constantly-ticking
  dollar counter on every rack because the capital intensity should be oppressive**; cables like
  arteries. **Meter:** a **kW meter dominating the HUD**, plus utilization, temperature and
  $/GPU-hour. **Visitors:** darting inference hummingbirds vs a slow armoured training convoy.
- **HPC / render** — a **job queue Gantt as the main view**; nodes lighting up in blocks as a job
  allocates; a deadline clock. **Meter:** queue depth vs deadline.
- **Crypto mining host** — shelves not racks, exposed boards, extreme density, brutal ambient noise,
  **a power meter that never stops climbing**, and tenant gear that is visibly nobody's problem but
  yours. **Density:** absurdly overpacked.
- **Kubernetes / PaaS** — abstracted; pods as small cells that reschedule and move between nodes
  automatically; **the board rearranges itself while you watch**, which is both accurate and
  unsettling. **Meter:** scheduling pressure / pending pods.
- **Serverless** — almost nothing visible at rest; **functions bloom into existence on invocation and
  vanish**; cold starts render as a visible delay before the bloom. **Hero:** the Chrysalis Pool as a
  warmed tray. **Visitor:** the mayfly. **Meter:** a **cold-start stutter bar.** **FX:** the bloom.
- **DBaaS** — heavy, central, well-lit objects with visible replication streams. **Hero:** the
  card-catalogue drawer bank. **Visitor:** a query slip. **Meter:** a **replication-lag rubber band**
  (which visibly stretches). **FX:** the split-brain seam.
- **Bulletproof** — deliberately dingy and dim: a basement, mismatched hardware, a single flickering
  light, hand-written labels, no signage, offshore flags, prepaid crypto, cash-in-a-briefcase
  iconography, **a stack of unopened abuse-complaint envelopes**, a very good lock on the door, a
  permanently amber legal-risk light, and a persistent low-frequency unease. **Meter:** a **"heat"
  gauge styled like a police scanner.** **Threat accent:** the abuse ladder totem.
- **Regulated (HIPAA / PCI / FedRAMP)** — sterile, over-labelled, clinical white, badge readers
  everywhere, mantraps, camera domes, evidence seals, a **residency fence drawn on the map**, a
  permanent compliance checklist sidebar; everything documented, everything slower. **Meter:** an
  **audit-readiness dial.** **Commercial artifact:** the audit report.
- **Financial colo / low-latency** — clinical white, measurement everywhere, **fibre lengths labelled in
  metres**, a cross-connect length equality guarantee. **Meter:** a nanosecond skew readout.
- **Dial-up ISP (era)** — beige and putty plastic, teal, **modem banks with sequential lights**, coiled
  phone cable, a Sun pizza box, a wire shelf instead of a rack, a whiteboard with IP assignments,
  fluorescent hum, a busy-signal lamp, CRT UI chrome, a POTS line count, a 4:3 vignette. **Meter:**
  modems-in-use vs lines. **Sound:** modem handshake, dot-matrix printer, a single ringing phone.
- **BBS / IRC / web ring (era)** — text-mode presentation, ANSI art, a single-screen sysop's desk with a
  ledger book, a member count, ring navigation arrows, a literal bulletin board, one phone line.
- **Satellite ground station** — a dish (or a **dish field**), a **sky window showing pass schedules as
  arcs**, weather as a first-class threat. **Meter:** an **antenna-time scarcity gauge.**
- **WISP / fixed wireless** — towers, terrain, and the **Fresnel zone** as a translucent ellipse
  (§8.4); seasonal leaf-on narrows it. **Meter:** link budget / fade margin.
- **Edge / 5G MEC** — **many tiny sites on a map rather than one big room**; cabinets at the base of
  towers; a coverage overlay. **Hero:** the street cabinet. **Visitor:** a local request that never
  leaves its region. **Meter:** a **site-reachability board** (80 pips). **FX:** the truck roll.
  **Altitudes:** home Z4, detail Z1 — **there is no Z2 or Z3, and that jarring jump is the line's feel.**
- **IoT backend** — enormous device counts as **a fine dust of motes**; a device-fleet health histogram.
  **Hero:** an ingest manifold with hundreds of tiny inlets. **Visitor:** dust. **Meter:** an
  **ingest-rate weir** (flow over a notch). **FX:** the reconnect storm as the weir overtopping.
- **Blockchain nodes** — **Hero:** a storage tower that only grows, with a visible high-water mark ring.
  **Visitor:** a block arriving on a metronome. **Meter:** a **sync-height gap gauge** (two needles,
  yours and the network's). **FX:** the fork — the chain visibly branching and one branch going grey.

**Variations and additions — the identity roster, with nicknames**

*A second, independently-written pass over the same thirty lines. It is kept in full because it carries the
**nicknames** (which are how players will actually refer to these levels), the **sound** half of each
identity, and several lines master's catalogue renders only in shorthand. The governing rule it states:
**one palette shift tells the player the whole threat economy of a level before a wave spawns** — same
mechanics, unmistakably different games.*

- **Dial-up — "The 1995 NOC."** Sepia/amber phosphor CRT at 800×600, beige everything, ASCII/BBS maps,
  **carpet and pegboard jack-fields**, **modem-handshake chirps as customer arrivals *and* as the level
  soundtrack**, dot-matrix ambience, alerts on desk phones, a switchboard-operator UI.
- **Shared — "The Apartment."** Warm stucco, **laundry-line cables**, doorbells, lobby mailboxes, 90s office
  clutter, noisy-neighbour flicker — **a sitcom about roommates from hell.**
- **VPS — "The Hotel."** Corridor carpet, room numbers, brass elevators, **luggage carts as migrations**, a
  concierge desk.
- **Colocation.** Clean real-estate isometric, **leases on screen**, dark halls, cold aisles, forklift hum.
- **Game / Arcade.** Purple-cyan RGB pools, ping overlays, crowd-chat tickers, chiptune stabs, confetti on
  completion, and **the LED chorus goes disco when healthy** — joyful maximalism contained by the shared
  threat grammar.
- **GPU — "The Forge."** Charcoal and molten orange, coolant glow, heat shimmer, **a turbine drone rising in
  pitch with utilization**, data pouring as bright slow liquid.
- **CDN / Video.** Big-map presentation: sat-blues, courier greens, **road-sign typography**, envelopes and
  trucks, node constellations, **hit-ratio auroras**, buffering wheels. The video sibling is a
  **cinema-dark studio with velvet reds and spotlight cones**, where **the freeze-frame stutter is the act's
  signature horror** and **QoE is how full the theatre looks.**
- **Email / DNS.** **Red-and-green postal chrome**, rubber stamps, jack-cord patch boards, ink-blot threats,
  everything sorting into cubbies, **a giant blacklist warning light** — and **the switchboard operator is
  your avatar.**
- **Regulated.** Clinical white and pale blue, glass walls, badge beeps, silent HVAC hiss, **notary-stamp UI
  labels**, **red STAMP violations with a concussive thud**, and **audit-trail floor lines as the beauty.**
- **Backup — "The Vault."** Monochrome blue, reverb-heavy metallic ambience, tape hiss, heavy door-clank
  UI — **and the only warm light in the level is a completed Restore's shaft.**
- **Bulletproof — "Pirate Cove."** Magenta-teal sunset, palm shadows, steel-drum underscore, **foghorn
  alerts**, wanted-poster UI, neon Cyrillic signage, rain-noir.
- **Bare metal.** Warehouse, packing tape, forklifts. **K8s — "Ant Farm":** glass tubes, glowing eggs,
  nurse-bots. **IoT — "The Dust":** fine dotted streams from every compass direction. **Web3:** gold chrome
  everything. **Edge/5G:** a nocturnal miniature city, rooftop boxes, tether light-lines. **Mainframe:** a
  1970s monolith room, green phosphenes, punch-card belts.

**Variations and additions — the skinning channels**

- **Six-delta skinning.** A type change flips **palette + light temperature + material language +
  typography + soundscape + ambient particles** *simultaneously* — the six deltas of identity. **Ambient
  particles per act:** dust motes in warm bulb-light (apartment) · cold clean-air sparkle (colo) · fog
  (bulletproof) · drifting paper (regulated) · fluorescent flicker zones (office).
- **The ambient telemetry stratum.** Each act's background-particle system **encodes aggregate load**: GPU =
  heat shimmer plus a coolant-glow pulse · dial-up = a modem-lamp flicker chorus · CDN = slow shooting-star
  arcs · regulated = drifting paper. **Idle screens beautiful AND informative.**
- **Per-type typography.** **Dot-matrix serif (dial-up) → clean grotesque (SaaS) → stencilled industrial
  (colo) → slab (gaming) → engraved serif (regulated) → neon script (arcade).**
- **Soundscape identity.** **Dial-up** = handshake screech plus keystation warble · **shared** = lo-fi office
  ambience plus neighbour-argument SFX · **GPU** = sub-bass plus coolant gloop · **colo** = distant forklift
  beeps in an echoing hall · **game** = a hype crowd bed · **regulated** = stamps and HVAC silence.
- **Dashboard and meter aesthetic per type.** **Dial-up = Win95 dialogs and bevel buttons · SaaS = pastel
  gradients with confetti on conversion · colo = SCADA-style kW meters · GPU = utilization heatmaps as room
  lighting · regulated = boring grey forms and stamp pads · bulletproof = dark mode, obviously.** Meters
  dressed per type: **punch-cards and toll tickets (dial-up) · analog power gauges on the cage door (colo) ·
  a depreciating-price ticker tape below every rack (GPU) · a reputation thermometer with blocklist "traffic
  lights" across the world map (email) · a GB odometer that literally prints money (CDN).**
- **The "feel" script per type.** **Dial-up** = slow, cozy, analog — **even the enemy animations are
  dithered.** **Shared** = warm chaos: string-lights, houseplants, muffled tenants. **VPS** = order and
  modularity, identical glass pods, **a satisfying click on every placement.** **Colo** = rented dignity —
  custom-liveried islands in a sea of black monoliths, sodium-lamp orange, **you can see your property line
  on the floor.** **Game** = adrenaline — RGB key-lighting (**this type owns the rainbow**), sprite motion
  +30%, **"lag is *the* villain."** **GPU** = religious awe and dread — cathedral-scale, magma cores,
  coolant veins, god-light through steam, **human figures absent** (*"every dollar is a ton of power"*).
  **CDN** = logistics ballet — bright daylight map, **the world is the datacenter**, courier dashes
  everywhere. **Email/DNS** = bureaucratic cozy — **the whole scene clicks and clacks like a sorting
  floor.** **Streaming** = showtime — a screen-wall canyon, **bokeh light-rain of viewer-dots.**
  **Backup/DR** = solemn until the alarm — archive-museum-vault, and then **the lighting script flips to
  strobe-red.** **Regulated** = *"your soul leaves"* — a flat fluorescent anti-palette, perfect grout lines,
  **deliberately boring lighting (no drama IS the drama)**, and a **drop-ceiling grid overlay during
  audits.** **Offshore** = charmingly cursed — oily sunset, tarpaulins, sand in the gears, **a hand-painted
  "NO LAWS" sign**, and everything rattles.
- **Additional identities from later passes.** **Shared** = a mall/food-court strip of tiny storefronts, or
  cramped apartment-hostel chaos, or a sticker-slapped tenement. **VPS** = dev-loft minimal, dark mode, cat
  stickers on the racks, a clean corridor hotel with numbered doors. **Game host** = LAN-arena purple neon,
  RGB everything. **Streaming** = a broadcast control room with jumbotrons. **Bulletproof** = a flickering
  dark alley in a rain-soaked server den, or dark-web noir with CRT-green and wet docks. **Quantum** = a
  gold chandelier. **Regulated** = a marble vault. **Offshore** = a lavish bunker with a **"NO LOGS"**
  stencil, red lighting, and a paranoid multi-upstream **"spider's web" of routes.** **Colo** = calm until a
  rack goes dark, and **a single remote-hands tech walking endless cold-aisle-blue aisles.**
- **Heat and atmosphere per type.** GPU levels = shimmer, glowing coolant pipes, alarm strobes. Dial-up ISP =
  warm CRT amber, **floppy-drive click-ASMR**, a literal modem-lights choreography. Regulated = sterile white
  with **cyan holograms of paperwork.**
- **Earlier skin leaks, re-folded.** **Offshore:** neon noir, *plexiglass*, **a suspicious van outside.**
  **Bulletproof:** a dark-purple glitch aesthetic with **"LOCATION REDACTED" overlays.** **Regulated:**
  sterile grey with **redaction bars and clipboard icons.** **Backup:** warm vault/library twilight with dust
  motes. **Per-tier aesthetic:** dial-up beige CRT clutter and warm tungsten → colo cold blue aisles, green
  PDU LEDs and cage doors → cloud/GPU rack-scale monoliths with laser-etched signage → regulated fluorescent
  sobriety. **Bare-metal:** hand-drawn custom servers.
- **The transition script (meta).** Moving between hosting types mid-campaign **cross-fades ALL identity
  channels over ~10 seconds** — light temperature, palette, ambient bed, **a music key change**, even the
  cursor-trail particle. *"The player feels the company change species."* And the acceptance bar: **the type
  must be instantly readable in a thumbnail.**
- **PvP and branding as skin channels.** In PvP, **the other player hostilely re-grades your shared border
  zone** — a per-player hue-rotate plus a decal swap, with **the river boundary rendered as a hairline of the
  other's colour** and **poached customers re-tattooed mid-crossing.** An **attacker-POV preview deliberately
  inverts the colour contract** — **your warm gold becomes their red objective marker**, threats magenta,
  with a CRT-glitch transition in and out: *"the strongest argument FOR the contract is watching it invert."*
  And a **logo/decal designer** stamps player-designed pixel-grid logos onto **chassis, tattoos, flags,
  invoice letterhead and the loading screen** — never gameplay-critical, everywhere identity.

---

### Era presentation shifts
Time changes everything above the substrate. **The gameplay is unchanged; the world has moved.**

**How it works:** Each era re-skins the **UI chrome, palette, typography and material language**: 1995
is beige plastic, CRT green and Comic Sans warnings; 2005 is brushed aluminium, gradients and glossy
web-2.0 chrome; 2015 is flat design, dark mode and dashboards; 2025 is liquid cooling, glass and
telemetry everywhere. **Players should screenshot the transition.**
**The Comic Sans clause:** the gag is restricted to **in-world signage** (the Handmade Layer), **never to
chrome**, or the 1996 levels become unplayable rather than funny.

### The Chrome Skin Token Set
The rule that makes era shifts affordable. **Four tokens, nothing else.**

**How it works:** Taken literally, "re-skins the UI chrome, palette, typography and material language"
means four full UI redesigns and a maintenance nightmare. Instead, an era changes exactly **four
tokens**:
| Token | Range |
|---|---|
| `typeface` | the era's Chrome face (see §8.15's era display faces) |
| `corner-radius` | 0px CRT → 2px → 6px glossy → 4px flat → 12px modern |
| `surface` | beige plastic → brushed metal → glass gradient → flat → translucent dark |
| `accent` | the era's key hue |
**Layout, hierarchy, iconography and spacing never change.** Result: **the eras look genuinely different
and the player never has to relearn where anything is.**
**The same tokens re-skin the Instrument Bezel**, which is why every gauge in the game changes era for
free.

### Era UI skins, enumerated
**Visual:** **1994** — a text-mode frame with box-drawing. **2001** — Win95 grey with bevels and a title
bar. **2008** — glassy, with gradients and rounded corners. **2016** — flat, with generous whitespace.
**2030** — translucent dark panels with a subtle blur. **Same layout, different skin.**

### The era kits (art bible notes)
The set dressing that dates a frame in one glance.

- **1990s Kit** — beige plastic with yellowing, 5.25" bays, turbo buttons, CRT monitors with visible
  curvature and a slow degauss wobble, ribbon cables, a wall of RJ11, a laser printer the size of a
  dishwasher, a whiteboard with a phone list, a fax machine, cigarette burns on the desk, a wire shelf
  instead of a rack, amber monitors, a dithered 256-colour palette.
- **2000s Kit** — **blue LEDs everywhere** (period-correct and hilarious), 1U pizza boxes with front
  bezels, KVM switches, a rack-mount CRT on a sliding tray, a KVM crash cart being wheeled around, Cat5
  in beige, blue Cat5 everywhere, the first blade chassis, a wall-mount ISDN box, black steel racks,
  fluorescent light, drop ceiling, blue carpet, a foosball table nobody uses.
- **2010s Kit** — black mesh bezels, orange and aqua fibre, blade chassis, **hot-aisle containment and
  plastic doors**, cable management arms, a wall of identical 2U boxes, uniform white-label servers, a
  sea of identical units, the first flat-design dashboards, a NOC with three ultrawides and a **Nagios
  wall of amber.**
- **2020s Kit** — high density, **liquid cooling manifolds and coolant distribution units with
  quick-disconnect hoses**, 400G optics, QSFP breakout fan-outs, rear-door heat exchangers, OCP-style
  open racks with busbars, **orange fibre bundles thick as an arm**, busway overhead, a GPU rack with
  its own dedicated feeder, an ambient roar, a **Grafana wall that is mostly dark-mode purple**.
- **Near-Future Kit** — **immersion tanks**, optical interconnect glow, photonics, dark-fibre ribbons,
  modular data halls that arrive on trucks as containers, **robotic maintenance rovers on the aisle
  floor**, translucent status surfaces on rack doors, autonomous carts, a grid-interaction dashboard,
  and **a facility that is entirely unlit because nothing human works there** — which makes the one time
  you walk in with a flashlight **tremendous.** **The absence of people is the visual theme.**

### The Era Transition Animation
**How it works:** Between campaign eras, **the camera holds on your facility while the palette, UI
chrome, equipment silhouettes and typography crossfade forward a decade.** Cheap to produce, enormously
satisfying, and it is the one moment that makes the era axis feel like a *campaign* rather than a set of
level skins.
**Interacts with:** §8.4's cable and sticker archaeology — after the crossfade, the old cables and
stickers **are still there**, which is what makes the new era feel earned rather than replaced.

**Variations and additions**

- **The full cross-fade contract.** The same move, stated as a channel list rather than as a shot: **light
  temperature, palette, ambient bed, music key and even the cursor-trail particle all cross-fade together
  over ~10 seconds.** It is the Era Transition's and the type-transition's shared implementation — one
  routine, two triggers — and the acceptance bar for both is that **the new identity is readable in a
  thumbnail the moment the fade lands.**

### The signature-motion set
Each line gets one memorable motion. **One signature motion per line is what players will remember and
describe to each other.**

**Visual:** the **Frayed Line** (VoIP call quality degrading as a strand visibly unravels) · the
**Busy-Signal Lamp** (dial-up) · the **Tape Ballet** · the **Heat Shimmer** (GPU) · the **Pod
Reschedule** (Kubernetes) · the **Serverless Bloom** · the **Propagation Wave** (CDN publish) · the
**Weir Overtopping** (IoT reconnect storm) · the **Fork** (blockchain) · the **Split-Brain Seam**
(DBaaS) · the **Truck Roll** (edge) · the **Capped Pipe** (seedbox null-route) · the **Declaration
Flip** (DR).

### The Skin Preview Room
**How it works:** A gallery where unlocked lines appear as **dioramas you can walk the camera through.**
Doubles as the Company Museum and as the art team's showcase, and it is where a player goes to decide
what business to start next.

### The Signature Frame
**How it works:** Each line has **one canonical camera angle**, used for loading screens, the line
placard, the level-select card and the score screen. **A consistent hero image per line makes the game's
variety legible in menus**, which is where players actually perceive it.

### Weather and place at Z4
**Visual:** regional weather affecting satellite and microwave links, storm systems approaching a
facility, time zones showing which site is on night shift, latency arcs between sites, and the Window
(§8.4) showing the local weather from inside. **Makes multi-site play feel like a map, not a
spreadsheet.**

### The Two-Screenshot Test
The acceptance test for the entire variety engine.

**How it works:** Two screenshots, one from each of two hosting types, shown to a player who has played
four hours. **They must name both.** If they cannot, that type's Five-Asset Skin Kit has failed and one
of its five assets needs replacing — **usually the signature meter or the density signature, which are
the two that carry the most identity per pixel.**
**Interacts with:** the Thumbnail Test (§8.9), which is the same test at 128px.

### Cross-Act Palette Guardrails
The rule that protects everything above from the variety engine.

**How it works:** **Environment palettes rotate per act. The colour contract and the overlay colour-coding
NEVER rotate.** A regulated-white level **still screams magenta on intrusion.**
**The companion law, stated as a slogan:** **"The act changes the palette; the grammar never changes."**
Era-native palettes are the timeline made visible — **dial-up = amber phosphor and beige · dot-com = "Web
1.0" teal and purple · shared = Excel green · GPU = OLED black and cyber-cyan · regulated = greyscale with
stamp red · bulletproof = sodium-orange rain noir** — **while the semantic hues stay pinned.**
**The test:** **one screenshot per act, all twelve in a row.** **The threat and customer grammar must still
hold across the whole strip.** If it does not, the act palette has annexed a semantic hue and must give it
back.
**Interacts with:** §8.2's Hue Ledger and the one-hue-table conflict (the guardrail is what the published
table is protected *by*), §8.10's Chrome Skin Token Set, §8.9's Thumbnail Test and §8.10's Two-Screenshot
Test.

---

## 8.11 Audio

*Audio in this game is not decoration — it is a **primary telemetry channel**, which is both its
greatest strength and the reason §8.14's accessibility work is non-negotiable.*

### The three-bus rule
The two-line spec that makes the whole audio design shippable.

**How it works:** Audio has **one channel doing two jobs** — the hum encodes load (continuous ambient
telemetry) *and* audio must be redundant with every critical visual alert (accessibility). If both live
in the same mix, **the alerts fight the telemetry.** Split into three buses with separate sliders:
- **Ambience** — hum, fans, room tone, drive chatter. Carries load and health **continuously**.
- **Signals** — pager tones, breaker snaps, cash ticks, chassis beeps. **Discrete, prioritised,
  duckable, and the accessibility-critical channel.**
- **Score** — music, optional, ducks under Signals.
**State the rule: Signals always duck Ambience**, so an alert is never masked by a busy room. Give each
bus its own volume control.

### The datacenter hum
The game's bed, and its most important instrument. **Ambient audio as telemetry is the most underused
idea in strategy games and it is perfect here.**

**How it works:** A continuous hum whose **pitch and volume track load.** Fans spin up as utilization
rises. **The player learns to hear a problem before seeing it.** An experienced player should be able to
tell something is wrong **with their eyes closed** — the single most authentic detail available.
**The five separable voices (the expansion that makes it diagnostic rather than atmospheric):** the hum
is composed of **fans (load) · drives (I/O) · CRAC (thermal) · UPS (power state) · room tone
(occupancy).** **A trained player hears *which* voice changed.**
**The accessibility inverse is mandatory:** a **visual EQ strip** showing the same five voices as bars,
plus the **Hum Bar** (§8.8/§8.14). Without them, deaf and hard-of-hearing players lose an entire
diagnostic system.

**Variations and additions**

- **The room tone IS the electricity bill.** Fan-whir ambience **scales with cluster load** — *"the sound of
  your money."* And the attack-music policy that falls out of it: **there is no attack music.** Instead
  **the *tempo* of the ambient systems rises**, so the dread is **a quiet-but-growing hum**. **The board
  literally gets louder when stressed** — a genuinely diegetic CPU meter.
- **Taking the hum away.** **Silence is scary**: monitoring down, or the modem bank simply stopping its
  chirp. Some **nation-state events mute the entire mix except a single ticking UPS relay** — and **taking
  the hum away is scarier than any sting.**
- **Alarms age with the decades.** Alarms get **more synthesized as the timeline advances**, and
  **alarm pitch encodes threat family** — an audio-first signal that works before any visual resolves.

### The fan-row unison ramp
The specific audio cue every operator knows and no game has used.

**How it works:** **The pitch change when a row of fans ramps in unison.** A single fan ramping is
noise; **forty fans ramping together is a thermal event**, and the sound arrives **before any graph
moves**, because fans respond to inlet temperature in real time. **Ambient audio as the fastest sensor
in the building** — genuinely true, and it makes the "hear a problem before seeing it" claim concrete.
**Visual redundancy:** a **rising wedge** on the Hum Bar.

### The silence of power loss
The loudest sound in the game.

**How it works:** When utility power fails, **everything stops.** A moment of true silence, then the UPS
whine, then the generator turning over. **Silence as an alarm** is unforgettable.
**Visual redundancy:** a **hard notch** on the Hum Bar.

### Fan spin-up and thermal audio
**How it works:** As a rack heats, its fans ramp — a rising whoosh that is unmistakable. Emergency
full-speed fans are genuinely alarming. **FX_FanSpindown** on shutdown is its melancholy counterpart.

### The drive click of death
Diagnostic audio, and the reason captions must carry location.

**How it works:** A failing drive makes its characteristic click, audible if you are zoomed near it.
**A player who investigates the sound saves the array.**
**Accessibility:** rendered as a **comb** on the Hum Bar, and captioned with position — `[drive click —
rack 4, bay 7]`.

### The beep
**How it works:** The real, hateful, unmistakable **chassis alarm beep.** Every sysadmin's blood pressure
spikes at it. **Muting it should be a button that does not fix the problem** — a joke and a mechanic in
one control.

### The breaker snap
A single sharp crack, followed by silence in one part of the room. **FX_BreakerTrip's** audio, rendered
on the Hum Bar as a **spike with a lightning glyph.**

### The relay clack and the genset
**How it works:** A **relay clack when the ATS transfers** — a satisfying mechanical clunk that tells you
the transfer happened before any indicator moves. Then **the diesel genset spinning up**: a genuinely
heroic sound, crank-cough-roar, and the warm light returning with it.

### Drive seek chatter
**How it works:** Heavy I/O produces audible seek chatter; a RAID rebuild has its own sustained
signature. **You can hear a backup running.**

### Pager tones and severity
Interruption has a voice.

**How it works:** Distinct tones per severity; **the sev-1 tone should raise your pulse.** At 3AM the
tone plays over near-silence, **which is the whole on-call experience in one design choice.**
Configurable — **and the fact that players will grow to hate it is correct and intentional.**

### The noise problem
The one time ambient audio becomes a mechanic rather than a channel.

**How it works:** In the hot aisle at Z1, **the ambient is loud enough that the pager's audio cue is
masked**, and staff wear ear defenders. **A short, funny, completely authentic beat — you missed the
page because you were standing in the room the page was about.** Used once, deliberately, and the Hum
Bar still shows the mark you missed.

### The cash register rhythm
Money has a beat.

**How it works:** Conversions produce a tiny, pleasant tick; **a healthy business is a steady rhythm of
them. You can hear your conversion rate.** Payday is a distinct heavier sound; an SLA credit is a sour
note; the **commission gong** rings on a close and gives a **single dull tap** on a clawback.
**The monthly shape:** **a steady trickle in and four thuds a month** (payroll, power, transit,
licences) — the bill landing on the desk with a thud is an audio event as much as a visual one (§8.7).

**Variations and additions**

- **The money tick, Pavlovian.** A **soft coin chime synced to the MRR heartbeat**, and **refunds play the
  same notes downward** — the same motif, inverted, which is why a refund is recognisable without a label.
- **Money Juice.** Coins **arc with plinks and count-up tickers**, and **the first coin after a big build
  plays a small fanfare** — slot-machine psychology, deliberately pointed at good behaviour.
- **The wider money palette.** A pleasant **"cha-ching-tick" for each recurring bill arriving** · **tiny
  register dings as money lands** · **the *ding* of a new paying customer** · **the triumphant all-green
  "99.99%" chime at end of level** · **the sickening silence of a cooling failure** · and, on GPU levels,
  **"whale-song" contract payouts.**

### Threat audio signatures
Each threat family has a sound.

**How it works:** A volumetric flood is a **rising roar.** A scanner is a **rhythmic ping sweep.**
Ransomware is a **crystalline shatter.** Brute force is a **patter.** Under-attack mode drops a **low
drone** under everything. **A mimic is silent, which is what makes it terrifying.**
**Accessibility:** every one has a named mark on the Hum Bar, including **the mimic's silence, which is
a notch** — this is the only way the mimic's tell is available to a deaf player at all.

**Variations and additions**

- **Zero generic alerts.** **DDoS swells as distant rain.** The breach motif is **a pager chirp**, not a
  klaxon. **Every threat family owns a distinct cue** — **the SYN fog *hisses*, the miner *grinds*, the APT
  is *silent*** — so **you can hear an attack forming in a busy map**, and *"the entire state of the company
  is legible with eyes closed."*

### Per-line sound palettes
Audio is the fifth asset in the Skin Kit, **and it does more than the other four.**

**How it works:** Tape libraries **clunk and whirr.** Dial-up has **modem handshakes and busy signals.**
GPU halls have **liquid pumps and an ambient roar.** Game servers have a subtle **UI-click culture.**
Colo has **badge beeps and a distant door.** Archival is **near-silent.** Bulletproof has **a
flickering ballast and nothing else.**
**The constraint that keeps it usable:** **each line's ambient bed must leave the same frequency band
free for the alert tones**, so pager severity is equally audible in a GPU hall's pump noise and a tape
vault's near-silence. **A stated audio budget, exactly like the colour budget.**

**Variations and additions**

- **Era skins own the music.** **Dial-up = the modem screech *as* the level soundtrack** — handshake
  arpeggios treated as a sound *asset* rather than as music, with **the handshake doubling as the theme's
  music-box sting.** **Mainframe = punch-card rhythmic industry.**
- **Era-Sound UI.** **Beige keyboard clacks in the '95 act, rackmount screwgun whirrs in colo, mechanical
  thocks on console input** — **the act is sold by its *interface noise*** before any music plays.

### The other named sounds
**How it works:** The **modem handshake** (retro). The **dot-matrix printer.** The **receipt printer**
paying out the Ledger Tape. The **badge beep.** The **coin chime.** The **cage-nut ping.** The
**connection-made click** (§8.7 — the single most-repeated satisfying sound in the game). The
**suppression discharge** and the total silence after it. A **single ringing phone** nobody answers.

**Variations and additions**

- **The ASMR of rack-building.** Placement has **magnetic grid-snap with a chunky *clack* and a dust puff**;
  **connections seat with a click-clack**; **upgrades ratchet**; **the floppy-drive click is its own
  instrument.** *"The satisfying click of a cable run is a legitimate retention hook — hosting is ordering,
  and the game should feel like clicking in a perfect cable run."*

### Audio as visual redundancy, and visual as audio redundancy
Accessibility requirement, both directions.

**How it works:** **Every critical visual alert has an audio counterpart and vice versa**, and the game
is fully playable with either channel off. **Deaf players lose nothing; players who look away lose
nothing.**
**The gap wave 1 left:** this clause covers *alerts*, which are discrete, but **not ambient telemetry**,
which is continuous. **The Hum Bar, the visual EQ strip and diagnostic audio captions with location**
(§8.14) close that gap without weakening the audio design.

**Variations and additions — the audio-visual binding spec**

- **Alarm hierarchies are three-tier:** **ambient hum → chime → klaxon plus red wash.** **Every klaxon has a
  distinct visual**, so **silence never means safety** and **muted play still communicates.**
- **Each hosting type's ambient bed has visuals that echo it** — modem screech-chimes, tape whirr and vault
  thunk, GPU coolant whoosh, arena crowd, paper shuffle, silence-and-HVAC with sudden thuds — and **when a
  sound event fires, a matching screen element pulses.** **The deaf player gets the same "bed" information
  as everyone else.**
- **Every entity family pairs a signature idle sound with a hit sound in the same pitch register** —
  **customers = warm chimes, threats = distorted basses** — so the rule of thumb becomes **eyes on the HUD,
  ears on the field.**

### The Ops-Mix score track
Adaptive audio where the score *is* the telemetry.

**How it works:** **Percussion = the active ticket stack. Strings = MRR growth. Dissonant brass = under
attack.** One layer per crisis family, mixed live. **Ransomware ducks the whole mix to a heartbeat** — the
dread of silence, made literal.
**Relationship to the silence rule:** this shares its *effect* with §8.11's silence-of-power-loss and the
nation-state mute, but by a **different mechanism** — a score duck rather than an ambient stop. Both can
ship; they must not fire together, or the two silences become one meaningless silence.
**Interacts with:** §8.11's three-bus rule (this is the Score bus, made diagnostic), the Hum Bar's
scrubbable history, §8.14's audio sliders.

### "Money Has an Orchestra"
The revenue stream as the ambient music.

**How it works:** **The MRR heartbeat is scored by your customer mix — every archetype is an instrument.**
**Bloggers = pizzicato plucks · SMBs = woodwinds · gamers = chiptune stabs · whales = brass swells · GPU
jobs = a deep synth drone.** **Your revenue stream *is* the ambient music.** **Churn deletes notes.** **An
outage mid-phrase leaves a hole in the mix you can HEAR.** **Perfect retention resolves the level's
melody.**
**Why it matters:** it makes revenue *quality* — §8.2's "money has colour and weight" — audible as well as
visible, which is the only channel that can carry mix composition continuously without a chart.
**Accessibility pairing:** ships with **caption note-icons**, so the composition of the revenue is readable
as well as hearable.
**Interacts with:** §8.11's cash register rhythm, §8.7's revenue-quality tinting, §8.14's diagnostic
captions.

### Traffic choreography
Waves that arrive on the beat.

**How it works:** **Waves arrive in rhythm to the level's music** — a synth score that mirrors load.
**Black Friday levels crescendo. Quiet nights are literally quiet ambient.** The telegraph and the score
become the same instrument, which is why the Wave Clock's final five ticks (§8.8) land as *music* rather
than as a beep.
**Interacts with:** §8.12's Wave Telegraph, §8.10's visitor rhythm signature, §8.11's three-bus rule (this
lives on Score and must still duck under Signals).

---

## 8.12 Presentation moments and the effects catalogue

### The Cold Open
Each level starts with a camera move.

**Visual:** the **Drop** shot — the camera flies in from the world map, through the building, down the
aisle, to your rack, and the HUD assembles around it. **Ten seconds, sets the scale.**
**The correction:** ⚔️ "never gets old" — it will get old. **It plays in full on first visit to a level
type and is abbreviated to 3 seconds thereafter**, with the full version always available from the pause
menu. **And it must be skippable on the first frame, not after two.**

### The Wave Telegraph
The moment before the storm.

**Visual:** the horizon glows, the hum drops, the radar fills, the forecast widget escalates, the bezel's
off-board register lights. **Dread is a design goal.** Reserved for volumetric and scheduled events only
(§8.5's telegraph grades), which is what makes it mean something.

### The Save
The moment a defense works at the last possible second.

**Visual:** slow-motion for half a second, the scrubbing wave passing through, the flood dissolving, the
latency graph snapping back down, and a small "held" flourish. **Design the clutch moment deliberately
or it will not happen.**
**The trigger definition (without which the game will never fire it):** a Save fires when a threat is
neutralised with **less than 8% of the affected resource remaining** *and* **the player took a deliberate
action within the preceding 6 seconds.** Both conditions matter — **the second is what makes it feel
like *your* save rather than luck.** **Cap at ~2 per level so it stays special.**

### The 100% Uptime Stamp
The reward image.

**Visual:** a **heavy rubber stamp slams onto the month's report.** Physical, loud, earned.
**Asset discipline:** use the **same stamp instrument** as the Grade Stamp — **one physical stamp
animation, three uses** (grade, uptime, audit seal), which is exactly the reuse discipline §9.6 asks
for.

### The Night Shot
An automatic beauty pass.

**Visual:** at 3AM, lights low, LEDs the only illumination, the hum at idle, a single desk lamp on.
**The game's wallpaper, generated from your own build.**

### Loading screens as rack diagrams
Useful and on-theme.

**Visual:** rack elevations, network diagrams and spec sheets, with **loading-screen tips that are real
ops advice.**
**The pairing:** **Loading Is Provisioning** — the load screen is a *bring-up sequence* (POST, link
negotiation, service start, health check going green) rather than a static diagram, **so the tips land
while something is happening.**

### The Credits Rack
**Visual:** credits presented as labels on a rack elevation, scrolling as the camera pans down (the
Pullback shot).

### Transition wipes by meaning
Each wipe carries meaning so the player is oriented **before** the new screen arrives.

**Visual:** **Blueprint wipe** = planning. **Dust-sheet wipe** = ending a facility. **Iris on a rack** =
zooming into a specific thing. **Fade to black** = era change. **Paper slide** = a document opening.

### The juice moments worth budgeting for
Save the big feedback for the moments you want players to chase.

**Visual:** **the first customer signing** (a little contract stamp) · **generator transfer under load**
· **a cache going warm** (the latency graph visibly dropping) · **a clean failover** · **the
end-of-quarter revenue tally counting up** · **a verified restore stamping green** · **the whale
signing** (one of the four permitted screen shakes) · **the first cross-connect landing in the meet-me
room.**

### The particle vocabulary
Twelve systems, reused everywhere, each unmistakable.

**Visual:** **sparks** (electrical) · **magic smoke** (component death) · **steam** (cooling) · **dust**
(age/contamination) · **glass shards** (physical breach) · **paper** (legal/tickets) · **packing foam**
(new gear) · **gold flecks** (money) · **cyan motes** (visitors) · **magenta grit** (threats) · **white
fog** (suppression) · **water** (leaks).

### The FX catalogue
*A named, reusable effects vocabulary. Each is used in many places, which is how a small art budget
covers a large game. **Split into Ambient (unbudgeted) and Event (5 concurrent max)** per §8.2, and each
carries its **reduced-motion equivalent**, which makes the catalogue double as the accessibility
translation table (§8.14).*

| Effect | Class | What it shows | Reduced-motion equivalent |
|---|---|---|---|
| **FX_ScrubWave** | Event | a filtering wave passing through mixed traffic, leaving only cyan | a 0.3s two-tone fill of the lane |
| **FX_LatticeFlash** | Event | inspection: a scanning lattice sweeping a request | a static lattice icon, 0.4s |
| **FX_Deflect** | Event | **a threat being blocked — the single most frequent effect in the game** | a static shield glyph + count tick |
| **FX_SnapThread** | Event | a connection breaking, the cable snapping and recoiling | the link greys with a break glyph |
| **FX_FrostBloom** | Event | encryption/ransomware crystallizing across data | affected blocks step to locked-grey |
| **FX_PoisonTint** | Ambient | wrong-but-serving: a sick film over the output flow | a static poison badge on the node |
| **FX_DriftPile** | Ambient | bit-rot: discoloured blocks accumulating over time | a static count of drifted blocks |
| **FX_CoinArc** | Event | revenue: a gold mote arcing to the balance | the balance steps up with a chip |
| **FX_BouncePuff** | Event | a visitor giving up and dissolving backward | a grey tick on the path, no motion |
| **FX_BreakerTrip** | Event | a circuit snapping, devices going dark in order | all downstream devices step to dark at once |
| **FX_SealDrain** | Event | data loss: a volume's fill draining, seal broken | the fill steps down, seal glyph breaks |
| **FX_CascadeRipple** | Event | backpressure crawling upstream as a red tide | each hop steps to red in sequence, 0.2s apart |
| **FX_SagStrain** | Ambient | a cable going taut and vibrating under saturation | the link renders heavy-stroked |
| **FX_Reseat** | Event | a device slid out and back, POSTing | a progress bar in place |
| **FX_FleetSync** | Event | a config change rippling across a fleet | all members step to the new state together |
| **FX_ForensicDesat** | Event | investigation: the world desaturates except the evidence | non-evidence objects render at 40% opacity |
| **FX_GhostSolidify** | Event | a restore completing: ghost to solid | a 2-step ghost→solid, no fade |
| **FX_SolidifyIntent** | Event | an Intent-layer promise becoming real | dashed outline → solid outline, one step |
| **FX_TarPit** | Ambient | attackers sinking into thick, slow amber | attackers render static in an amber field |
| **FX_FanSpindown** | Ambient | shutdown: fans winding down, lights fading | fan glyph steps to stopped, lights to dark |
| **FX_LightsOn** | Event | power-up: LEDs sequencing, fans ramping, idle reached | all LEDs step to green together |
| **FX_RansomOverlay** | Event | the customer view replaced by a ransom note | an immediate swap, no transition |
| **FX_PrismSplit** | Event | one contact resolving into its constituent sources | a list of sources appears beside the contact |
| **FX_TariffWave** | Event | **a per-unit cost change rippling across the fleet** | all affected objects gain the `+$` badge at once |

**The gap this fills:** wave 1's catalogue had **no entry for a threat being blocked** — which is the
most frequent effect in the entire game. **FX_Deflect** is the fix.

### Signature moments — the ceremony set
The named, once-per-level beats the whole art budget is aimed at.

**Visual:**
- **The breach jump-scare grammar:** **everything on screen glitches for one frame, plus a low thud.** One
  frame. Nothing else.
- **Downtime:** **the lights literally go out.**
- **Success:** a unit does **a little happy-dance with its LEDs.**
- **Fire / Halon theatre:** **gas pours, staff evacuate in single file.**
- **Ransomware takeover:** **padlock patterns creep in from the screen edges, the sound ducks to a
  heartbeat, and recovery replays in reverse.**
- **Restore Resurrection:** **a light shaft from the tape library, particles converging, and the returned
  service or customer figure standing up mid-aisle.** Slow, reverent, and **funny because it is sincere.**

**Variations and additions**

- **The Long Blackout.** Total failure plays out as **a slow power-down *walk* across the whole screen** —
  **rows of LEDs going dark one by one, the ambient hum winding into silence**, ending on **a pitch-black
  frame with one UPS chirping.** *"Humiliating, teachable, memorable."*
- **Scrubbing Centre Theatre.** The swarm hits the scrubber **as a membrane and is *combed***: **bots pop to
  dust on the membrane while customers slide through untouched in a golden thread.** Proposed as **a
  signature animation of the whole game.**
- **Catastrophe animations, held truthfully.** **RAID death** = drive lights dying one by one with a hollow
  thunk. **BGP leak** = the world map's light-arcs **visibly rerouting through a random dark node** — or
  *"through the wrong continent, in real time."* **Blackholing** = **customers evaporating at a line on the
  map.** **Overheating** = amber warning → heat shimmer → a dramatic but **never flaming-cartoon** shutdown.
  **Halon discharge** stays **a rare, earned cinematic**; **fire suppression is a white fog burst**; **a
  seized disk spins down with an audio whine as a red tray pops**; **a rack under thermal stress glows
  bottom-up.** **One big VFX per failure class, rare enough to fear.**

### The Attack Cut-in
Tutorialization as horror-poster design.

**How it works:** **The first appearance of each threat *type* per level triggers a stylized
freeze-frame**: the creature **fills the screen as a bestiary card** with **a one-line hand-inked
callout** — *"DDOS BOTNET — swarms, dies to scrubbers"* — and then **snaps back to play.** **ONE per
encounter**, like a monster-movie reveal.
**Why it matters:** it is the only teaching device in the document that spends the player's attention at the
exact moment they were going to look anyway, and it costs one card layout plus the art the Threat Gantry
already needs.
**Interacts with:** §8.5's Threat Gantry (same card art), §8.5's Specimen Cards on Hover (the same content,
pull rather than push), §8.8's tutorial-free onboarding.

### The Failure Cinematic
What a loss looks like when the game stops trying to be helpful.

**Visual:** **A breach is a slow camera dolly through your racks as the lights die one by one**, with **the
APT silhouette strolling past carrying your database like a briefcase.** **An outage is pitch black except
one UPS chirping.** *"Humiliating, teachable, memorable."*
**Discipline:** it is the Rail shot plus the Hold shot, both already in the Camera Grammar, and it must obey
the Cold Open's correction — **skippable on the first frame**, and **abbreviated after its first showing.**
**Interacts with:** §8.3's Camera Grammar, §8.12's Signature moments, §8.5's Insider and APT entries.

### Growth shots and the act-boundary assembly
*"The TD version of look-how-far-we-came."*

**How it works:** After each **scale-tier promotion**, a **one-take camera pull-back from your board
revealing the whole facility, campus or region.** At an **act boundary** it goes further: a
**dollhouse → city → globe pull-back *while your whole set assembles itself on screen*** — buildings raise,
cables arc, LEDs light. **The signature cinematic of the acts.**
**Interacts with:** §8.3's Pullback shot, §8.17's Money Shot (the campaign-scale version of the same move),
§8.1's Isometric Voxel (whose block-by-block assembly is the cheapest way to author the self-building half).

---

## 8.13 Animation and motion language

*New in wave 2. The motion vocabulary is stated in §8.2 and budgeted in §8.2's Motion Budget per
Altitude; this subsection holds the animation principles and the reusable motion assets.*

### The Breathing LED
The idle animation of the entire game.

**How it works:** A **1.6s sine breath** on healthy green LEDs, with a **slight per-unit phase offset**
so a rack shimmers gently rather than pulsing in lockstep. **A room full of breathing racks is the
game's signature calm image.**
**Tension:** ⚔️ per-unit phase offset vs the Heartbeat Sync's global 0.5Hz clock, which wants everything
*in* lockstep so that desynchronization is an alarm. **Resolution:** the **phase offset is small and
fixed per unit** (a few frames, deterministic, never drifting), so the room shimmers but the *beat* is
shared. A unit that drifts **off the beat** — not merely offset from it — is the anomaly.

### Fan Blur Ramp
**How it works:** Fans are **3-frame blur states: slow, fast, screaming.** Rack noise level is therefore
readable purely visually. **A room going from slow to screaming during a heat event is the best ambient
alarm you can build**, and it is the visual half of the fan-row unison ramp (§8.11).

### Idle Fidgets
Ten seconds of idle animation per character is what makes a facility feel **inhabited rather than
diagrammed.**

**Visual:** staff sprites drink coffee, check phones, lean on racks, spin a chair, carry a box. Cables
sway slightly in airflow. Dust motes drift in the light beams. A tech taps a screen and frowns.
**Constraint:** idle fidgets live on the **background plane at reduced contrast** and are excluded from
the Motion Budget, because they are Noise Floor, not telemetry (§8.4).

**Variations and additions**

- **The Idle Life roster.** **Janitors mop. A security guard's flashlight sweeps at night. Office plants get
  watered. A microwave beeps in the break room. A cleaning robot zips around on the night shift while the
  staff go home and the automated alerts keep blinking.** Ambient life **sells scale AND functions as a
  "nothing is wrong" reassurance channel** — which is the argument for keeping it even under the strictest
  Attention Budget.
- **The plant-and-coffee system (staff mood, visual only).** **Happy staff desks get plants and neat coffee
  stations; stressed desks accumulate cups and dead ferns.** The aggregate **"greenery of the NOC" is a
  glanceable read on burnout** — and **the NOC potted plant wilts when you ignore the office.**

### The Anticipation Budget
Cheap squash-and-stretch turns a functional game into a satisfying one.

**How it works:** **Every action gets a small pre-motion.** A server slides *back* a few pixels before
sliding into the rack. A cable pulls taut before connecting. A coin dips before flying. A stamp lifts
before it slams. The pre-motion is 3–5 frames and it costs nothing.

### Screen Shake Budget
**Shake inflation is the fastest way to make a game feel cheap.**

**How it works:** Shake is reserved for exactly **four events**: **generator start · breaker trip ·
seismic · a whale customer signing.** Anything else uses a flash or a vignette.
**Accessibility:** in Reduced Motion, every shake becomes a **4px settle** or a border flash (§8.14).

### The screen-shake rule — *CONFLICTING*
Both documents agree that shake inflation is the fastest way to make a game feel cheap, and both write a
budget to prevent it. **The budgets are incompatible:** one allocates shake by *event identity* and permits
four events in the entire game; the other allocates it by *magnitude* and attaches a shake to every hit.

#### Position A — four events, and nothing else *(master)*
**Shake is reserved for exactly four events: generator start · breaker trip · seismic · a whale customer
signing.** **Anything else uses a flash or a vignette.** Under Reduced Motion every shake becomes **a 4px
settle or a border flash** (§8.14). The argument is scarcity: a shake that fires on hits stops being a
signal within ninety seconds, and **the four events are chosen because they are the four moments the player
should feel in their chest.**

#### Position B — a graded shake budget, by magnitude *(opencode)*
**Micro: 2px / 80ms for small hits. Medium: 6px / 200ms for breaches. Large: 12px / 400ms for boss
events.** Plus a hard rate limit: **three mediums inside one second are banned.** The generic hit package
elsewhere in the same document also carries **a 3px shake** on every landing. The argument is weight:
impacts without shake read as weightless, and **the rate limit — not the event whitelist — is what actually
prevents the seizure-machine failure**, since it is the *frequency* rather than the *existence* of shake
that hurts.

**What the decision turns on:** whether shake is a **semantic** channel (A: it means *this specific thing
happened*) or a **physical** one (B: it means *something of magnitude X hit something*). Note that both
positions share the same slogan — *"the camera is an instrument, not a seizure machine"* — and both must
pass §8.14's Strobe Budget and ship a Reduced Motion equivalent regardless of which wins.

### The Flash Language
Three flashes, three meanings, never mixed.

**How it works:** **One-frame full-white flash** = something was **created or served.** **One-frame red
flash** = something was **hit.** **One-frame blue flash** = something was **identified.**
**Constrained by:** the Strobe Budget (§8.14) — no more than 3 luminance transitions per second across
more than 25% of the screen, ever.

### Motion identity beats colour identity
The principle that justifies the density and rhythm parameters.

**How it works:** **Two lines with the same palette but different density and arrival rhythm are more
distinguishable than two with different palettes and the same rhythm.** Motion identity survives every
zoom level, every colour-blind palette, and the Thumbnail Test. **Author rhythm first, palette second.**

### The de-escalation language
*(Full entry in §8.7.)* Recovery animations share the quiet moment's language at every scale, so
clearing is as legible as firing.

### Animation as the explanation
The house rule for §8.5 and §4.

**How it works:** **Never explain a behaviour in text if you can show it in motion.** A threat's
behaviour is its motion primitive; a defense's function is its verb; a failure's nature is its collapse.
Text is the fallback, not the first channel.

---

## 8.14 Accessibility, colour-blind safety, and redundant encoding

*New in wave 2, and non-negotiable for a game whose primary telemetry channels are **ambient audio,
colour and motion** — three channels that each exclude somebody.*

### The Two-Channel Law, enforced
*(Stated in §8.2.)* **No information is ever carried by colour alone.**

**The enforcement:** a **greyscale pass is a sign-off gate** for every unit, overlay and alert state.
The Contrast Audit Mode is **promoted from a nice-to-have option to a production gate** — it is the
mechanism by which the law is checked, and it should be run before approval, not shipped as an option
and forgotten.

**Variations and additions**

- **Dual-encode everything, stated per-entity.** **No information by colour alone** — so **violet threats are
  *also* angular, jittering and top-approaching**, and **green healthy LEDs are *also* steady.** **Every
  state ships with a colour+shape pair.**
- **The pulse-rhythm channel.** The full deuteranopia and protanopia presets **also reshuffle pulse rhythms
  per family**, which gives **sight-independent identification** — a threat family is then separable by
  *tempo* even when hue and shape have both been flattened.
- **The strong phrasing:** **the shape codes and the pattern codes carry ALL critical state, and colour only
  decorates.** If that sentence is true, the three colour-blind palettes are a convenience rather than a
  rescue — which is the correct place for them to sit.

### Contrast Audit Mode
**How it works:** A mode that renders the screen as **luminance only**, to verify everything is
distinguishable without colour. **Ship it as an accessibility option too**, because some players will
prefer it.

**Variations and additions**

- **The icon-first, colour-second audit.** **Recolour the UI in greyscale — is anything ambiguous?** If yes,
  **fix the glyphs before touching the palette.** The order matters: a palette fix hides the problem, a
  glyph fix removes it.
- **A colour-blind-safe pattern library.** Every **texture channel — stripes, dots, hatching — is designed
  black-and-white first and only *then* is hue approved.** The shipping rule that follows: **overlays get
  matching patterns or they do not ship**, and **everything is greyscale-validated BEFORE hue approval.**

### Three colour-blind palettes, named
Wave 1 promised colour-blind-first design and shipped one undefined "high contrast mode." Three shipped
palettes plus the default:

- **Deuteranopia / Protanopia set** — magenta → **deep orange-red**, green → **blue-white**, amber →
  **yellow-white**, cyan unchanged; **shape weight increases 25%.**
- **Tritanopia set** — cyan → **light grey-blue**, gold → **pink-red**, violet → **dark teal**.
- **Monochrome + Shape-First** — all hue removed; **all encoding carried by shape token, pattern fill,
  stroke weight and motion**; alert severity by **luminance plus an added corner notch.**
**The real test:** **Shape-First should be playable and should be somebody's preferred mode.** That is
the only honest test of whether the Two-Channel Law was ever actually honoured.

### Colour-blind-safe money
**How it works:** Money uses **shape as well as hue** — coins vs droplets vs receipts vs invoice slips —
so income, outflow, receivables and bills are distinguishable with no colour at all. Combined with
"gold moves, amber fills" (§8.2), the money layer survives every palette.

### The Strobe Budget
A safety spec the document had none of.

**How it works:** A hard engine rule: **no more than 3 luminance transitions per second across more than
25% of the screen, ever.** Plus a **Reduced Flashing** accessibility mode that converts every flash FX
to a non-flashing equivalent from a published table: **flash → a 0.3s fill · shake → a 4px settle · gas
flood → a wipe · strobe alarm → a steady bar · white-frame PSU pop → a single dimming step.**
**Why it is in the design document:** this is a **legal and accessibility requirement in several
markets** and it needs to be specified here, **not discovered in QA.**

**Variations and additions**

- **Glitch damping.** Corruption shaders — chromatic aberration, flicker — get **a global slider from "off
  (static frost plus an outline)" to full.** The clause that keeps the mechanic intact: **the stealth
  mechanic must retain a non-flicker detection tell** (a shadow that should not be there), or turning the
  slider down removes gameplay rather than motion.
- **Photosensitive-safe defaults on first boot**, plus a **one-click toggle** — defaults matter more than
  options here, because the player who needs it is harmed *before* they reach the menu.
- **The "Calm Ops" toggle.** **Caps blink rate at 2Hz, desyncs the LED clusters, and replaces the heartbeat
  vignette with a static border glow.** Note it interacts directly with §8.9's Heartbeat Sync — desyncing
  the clusters deliberately spends the desynchronization alarm channel, so Calm Ops must **substitute a
  different anomaly channel** (brightness step, or the Activity Halo) rather than simply losing it.
- **Blinking safety is not optional here.** Explicit colour-blind **and blink-safety** options, because
  *"datacenters blink A LOT"* — **the LED chorus is the game's signature and simultaneously its biggest
  photosensitivity risk.**

### Reduced Motion mode
**Accessibility as a first-class art pass, not a toggle bolted on.**

**How it works:** Every animation has a **static or minimal-motion fallback**: LEDs use **brightness
steps instead of sine breathing**; particles become static indicators; shakes become border flashes;
tilt-shift, DOF and grain off; camera moves become cuts; the Two-Register Fold becomes an instant swap.
**The published translation table is the FX catalogue's reduced-motion column (§8.12)** — every one of
the twenty-four named effects has a stated equivalent, which is far better than the vague "animations
become state changes."

### The Hum Bar
*(Full spec in §8.8.)* The room-tone strip that makes ambient audio telemetry visible — and gives audio
a **scrubbable history**, which benefits hearing players too.

### The visual EQ strip
**How it works:** The hum's **five separable voices** (fans, drives, CRAC, UPS, room tone) rendered as
five bars. **A trained player hears which voice changed; a deaf player sees which bar moved.** Same
information, two channels.

### Diagnostic audio captions, with location
The companion to the Hum Bar, and a genuine accessibility advance.

**How it works:** An optional caption line for **diagnostic sounds only** (never for ambience), in the
style of well-done game subtitles: `[drive click — rack 4, bay 7]` · `[generator cranking]` ·
`[breaker snap — circuit A3]` · `[chassis alarm — rack 12]`, with a directional arrow.
**Crucially it includes location**, because §9.2's Beeping Server minigame is otherwise unplayable
without hearing. **Captions that carry position cost almost nothing here, because the simulation already
knows where the sound came from.**

### Readout Mode
**How it works:** Every diegetic gauge, every Object of Record and every instrument can be switched to a
**plain numeric readout** — a number and a unit, in the Chrome face, flat and frontal. **The diegetic
version is the pretty one; the readout is the honest one; both are always available.**

### UI scale and the collapse behaviours
**How it works:** **UI scale to 200%**, using the Screen Budget's stated collapse behaviours (§8.8) —
palette collapses to icons, inspector becomes a full-screen overlay, bottom furniture stacks. Full
keyboard navigation. **Tabular figures everywhere** (§8.15) so scaled numbers never reflow.

**Variations and additions**

- **Text scale and labels.** The HUD **scales to 150% without breaking the diegetic layout**, which in
  practice means **the diegetic layer needs a "clean" fallback at large scales.** **Every icon has a
  one-word label mode for early learning.**
- **The log console as a text-mode accessibility surface.** The SIEM/log console **doubles as a full
  text-mode surface** — *"it's a game about logs, lean in"* — with **a screen-reader-friendly log stream.**
  It is the cheapest possible route to a genuinely non-visual play path, because the game already generates
  every line.

### The full accessibility affordance list
Non-negotiable, collected in one place.

**How it works:** Colour-blind-first iconography and three named palettes · a reduced-motion mode with a
published translation table · a Reduced Flashing mode and the Strobe Budget · **audio redundancy for
every critical visual alert and visual redundancy for every critical audio channel, ambient included** ·
the Hum Bar, the visual EQ strip and located diagnostic captions · three separate audio buses with
independent sliders · Readout Mode for every diegetic gauge · scalable UI to 200% · full keyboard
navigation · tabular figures · high-contrast and Contrast Audit modes · the Chroma Meter as a
player-visible readout · subtitle and caption sizing · **and: pause exists and is always available.**

**Variations and additions**

- **The accessibility spec as a shipped checklist.** **Patterns (every state has one) · full remap · no
  red/green-only pairs · reduced motion swapping every juice effect for a fade or a zoom · a 12fps floor on
  weak hardware** — and the item that makes the rest enforceable: **a debug overlay that draws the
  compliance grid on screen.** *"When the accessibility debug overlay ships, accessibility stops being
  folklore."* It is the accessibility sibling of the Chroma Meter, and it should ship in the same build.

### The mimic exemption, written down
**How it works:** The Two-Channel Law applies to **state**, not to **identity-under-deception.** A
mimic's *unknown-ness* is encoded twice (violet fill + indistinct silhouette + Confidence Blur), which
satisfies accessibility; **its *hostility* is deliberately not encoded at all until classification,
which is the game.** **Write the exemption down or an accessibility reviewer will — correctly — flag
it.**

### Runbook / Blueprint mode as an accessibility preset
Accessibility as the excuse to ship the alt-art mode everyone wanted anyway.

**How it works:** The **high-contrast flat diagram render** — the Living-Blueprint / Board register, run as
a whole-game mode — **serves colour-blind and cognitive-access players**, and **doubles as a strategic
clarity mode that "everyone eventually turns on."** Its strictest form is a **"Schematic Theme"**: **pure
blueprint rendering, shapes and labels only, no animation.**
**Why it belongs here rather than in §8.1:** it is the one art style whose *justification* is
accessibility, which means it must be held to the accessibility gates (greyscale pass, Strobe Budget,
Readout Mode) rather than to the art-direction ones.
**Interacts with:** §8.1's style B and the Style Allocation Table, §8.14's Monochrome + Shape-First palette
(the Schematic Theme is that palette given a geometry), §8.4's two registers.

### Full blind-play mode
The stretch goal that the audio design has already almost paid for.

**How it works:** The audio landscape is designed so that **a determined player could follow critical state
by sound alone** — **the hum ladder, the money pulse, and the distinct audio cue per threat family.** It is
a goal rather than a guarantee, and stating it as one is what keeps the Signals bus disciplined: every
critical state must be *reachable* through audio, even if not every player will play that way.
**Interacts with:** §8.11's three-bus rule and threat audio signatures, §8.14's diagnostic captions (the
inverse channel), §8.14's log-console text surface.

---

## 8.15 Typography, numbers, and iconography

*New in wave 2. Wave 1 specified typography only in passing — "Comic Sans warnings," "tabular figures,"
"crisp modern sans" — in a game where **numbers and labels are half the screen area.***

### The Type System
**Three families plus one, never mixed within a surface.**

**How it works:**
- **Signage** — a **condensed industrial sans**, used for everything that exists physically in the
  world: rack labels, asset tags, floor paint, placards, port numbers, the building sign, the game's own
  title. **Must survive 8px and extreme perspective.**
- **Chrome** — a **neutral UI sans with true tabular figures**, used for the HUD, inspector, cards and
  every instrument face.
- **Doc** — a **typewriter/serif pair**, used for everything on paper: tickets, the ledger, invoices,
  postmortems, the diligence memo, the intern's log, contracts, and all handwriting substitutes.
- **Marker** — one face for the whiteboard, sticky notes and the Handmade Layer.
**Interacts with:** §8.10's era shifts (which swap only the Chrome face), §9.4's procedural label text,
§1.8's Tier-Up Title Card, §8.2's Handmade Layer.

**Variations and additions**

- **The pairing rule, stated as a law.** **Exactly one display face** (diegetic signage, era-swapped per
  act) **plus one data face** (all UI numerals, tabular figures, high x-height) — **and the display face
  NEVER carries numbers.** A small law that **keeps every overlay legible**, and it is the reason an era
  swap can change the world's personality without touching a single readout.
- **Decorative type is for *ads in-world*, never for the HUD** — which is where the Comic Sans clause and
  the competitor-billboard gag both legally live.

### Era display faces
**The title card alone should date the level.**

**How it works:** **1994** — a chunky bitmap face. **2001** — a humanist sans with a bevel. **2008** — a
glossy grotesk. **2016** — a geometric sans. **2030** — a variable-weight sans that **animates its
weight on state change.** The display face is used for titles and signage only; the Chrome face changes
via the Chrome Skin Token Set (§8.10) and nothing else does.

### The Number Law
Numbers are half this game's surface area and wave 1 left them unspecified.

**How it works:**
- **Tabular figures everywhere, always.** Numbers never jump; fields are fixed-width.
- **Counters roll digit-by-digit, never snap.** Universal, not just for money.
- **Units are always present and always in a lighter weight than the value.**
- **Money is never abbreviated below $10k.** The difference between $9,400 and $9,412 matters when you
  are nearly broke — which is exactly when the Runway Bar's tone shift is active.
- **Percentages get one decimal only when below 10.**
- **Latency is always ms, never s.**
- **Nines are rendered as nines with the minutes beside them, always both** — "three nines (43m/mo)" —
  because neither number means anything alone.
- **Every number is clickable** ("Explain This Number," §8.8).
- **Every meter carries a unit stamp and, where useful, a familiar-comparison tick** (§8.8's Scale Bar).

**Variations and additions**

- **Only three numeric formats may appear on screen.** **Odometers (money) · tabular chips (counts) · rings
  (percentages).** Nothing else is drawn, **no decimals in-world**, and **no number walls on hover.**
- **Hovering shows OBJECTS, not numbers.** **Cost-on-Hover Chits** render as **physical coin-stack icons
  with a tiny chimney-smoke glyph for upkeep** — economic grammar instead of a spreadsheet, and it is
  greyscale-safe because a coin stack's *height* is the value.

### The Big Number Rule
**How it works:** **Exactly one number on screen may be "large."** It is contextual: **cash in calm
play, incident cost during an outage, time remaining in a timed scenario, time-to-dead-air in playout.**
Everything else is secondary size. **Prevents HUD shouting matches**, and it is what the Panic Layout
(§8.8) reconfigures.

### Three icon tiers
**How it works:**
- **Tier-A world glyphs** — drawn in-world, isometric, 16–32px: a warning triangle above a rack, a
  wrench on a drained node, a padlock on a compromised one.
- **Tier-B chrome icons** — flat, 2px stroke, 24px, **on a strict 24-grid with 2px padding.**
- **Tier-C micro pips** — 4–6px, single colour, no stroke, used on the Rack Ribbon and in dense lists.

### The icon family rules
Everything is built from a small vocabulary of primitives, and **anything new must be composable from
them.**

**How it works:** the **rounded rectangle** (a device) · the **circle** (a service) · the **hexagon**
(money/resources) · the **chevron** (a threat) · the **mote** (a visitor) · the **shield** (a defense) ·
the **wrench** (an action) · the **seal** (a compliance state) · the **clock face** (a timer) · the
**receipt** (a financial event).
**Interacts with:** §8.5's threat class marks and the Counter Match, which are built from the chevron
and its siblings.

**Variations and additions**

- **The icon-kit construction law.** **All ~200 icons on one 16/24px grid, 2px stroke, one corner-radius
  family**, with the **two-channel semantic baked into the stroke grammar itself** — **round-warm =
  customer-side, angular-toxic = threat-side.** The payoff is reuse: **one glyph, five homes** — the HUD,
  the codex, tickets, the minimap and the pegboard.

### Status Chips
*(Full entry in §8.2.)* One state vocabulary — `HEALTHY`, `DEGRADED`, `DOWN`, `DRAINING`, `PATCHING`,
`COMPROMISED`, `SEALED`, `EXPIRED`, `OVERDUE`, `AT RISK`, `PENDING`, `UNVERIFIED` — used identically on
every card in the game, each with a shape notch as well as a colour.

### The Label Plate Aesthetic
*(Full entry in §8.4.)* In-world text renders as **Dymo tape, printed label, or Sharpie on tape**
depending on era and on how hurried the player was, and **labels made during an incident are visibly
scrawled.**

### The Player Company Mark Generator
§1.8's "The Logo Evolves" is a great idea that requires an actual mark system.

**How it works:** A small generator at company creation: choose a **glyph** (from ~24 simple marks — a
node, a rack, a wave, an arrow, a shield, an animal), a **wordmark** (from the type system), and a
**colour** (constrained to a palette that will not collide with the Hue Ledger — muted, desaturated,
brand-ish). The mark then renders at **five fidelity levels tied to Reputation**: Comic-Sans-on-paper →
clip-art print → a real logotype → embossed on rack doors → **etched aluminium and lit.**
**Where it appears:** the truck, the badge lanyards, the placard wall, the screenshot watermark, the
loading screen, the score stamp, the letterhead, the blueprint title block, the About page in the Site
Preview Window. **Player identity is free art for every one of those surfaces.**
**The positioning extension:** the mark's evolution is not just polish, it is **positioning.** A budget
brand's logo **stays loud and cheap-looking by design**; a premium brand's gets **quieter and more
confident**; a compliance-focused brand goes **conservative and serif.** In multi-brand play, **three
logos evolving along three different trajectories in the same office** is a great running visual — and
the campaign's best quiet joke: **a rebrand costs real money, achieves nothing measurable, and everyone
feels better.**

### The Company Letterhead
**How it works:** An auto-generated letterhead with your mark, name and tagline that **frames report
cards, invoices, postmortems and contracts.** **Ties all your paper UI together into one brand**, and it
is one template.

---

## 8.16 The production asset spec, acceptance tests, and style guide

*New in wave 2. These are the artifacts and gates that make everything above survive production rather
than remain aspirational.*

### The LOD Contract — every entity declares five things
**Nothing enters the game without all five, and it should be enforced by tooling.**

**How it works:** Every entity — every unit, buildable, staff member, visitor, threat and facility
object — ships with:
1. **A full sprite + animation set.**
2. **A 16px icon.**
3. **A single semantic colour + a 4px pip shape.**
4. **Its contribution to its parent's aggregate glyph.**
5. **Its one-line inspector summary.**
**This is the art-pipeline rule that keeps the endgame readable.** An entity that cannot supply all five
is an entity the game cannot render at Z3, and it should be rejected at authoring time rather than
discovered at Tier 5.

### The Silhouette Sheet (production gate)
The concrete mechanism behind "identify a threat class from silhouette at Z3 with colour removed."

**How it works:** Every unit, buildable, staff member and threat ships with a **black-on-white
silhouette plate at 16px, 24px and 48px.** **Sign-off requires that no two units within one family are
confusable at 24px and no two families are confusable at 48px.** Shipped as **a single poster in the art
bible.**
**Why it matters:** **this one artifact prevents the late-game mush that kills strategy-game
readability.**

**Variations and additions**

- **The Silhouette Test as standing QA.** Every asset must pass **black-box recognition: a filled
  silhouette, a single colour, no effects, at 64px** — **you can tell a gamer from a bot from a script
  kiddie from the outline alone.** **Budget a permanent QA pass**, described as *"the cheapest readability
  guarantee"* available, and enforce the corollary: **nothing may rely on decals for identity.**

### The silhouette-first authoring test
The playtest version of the same gate — and a content-pruning tool.

**How it works:** Every visitor archetype and every threat class **must be identifiable from a 16px
black silhouette in motion, with no colour**, by a playtester who has seen it three times. Anything that
fails gets a new silhouette or **gets merged with whatever it is being confused with.**
**The second use:** **a threat you cannot silhouette is a threat you do not need.** The test is a
content cut rule as much as an art gate.

### The Salience Score
Law 3 — *one salient thing per container* — made mechanical.

**How it works:** **Every entity computes a salience number each frame: severity × recency ×
player-pinned.** **Parent containers display only their highest-salience child.** As you zoom out,
children's alarms are **merged into the parent's single salient signal** rather than all drawn at once.
**This is what prevents a twelve-datacenter endgame from looking like a Christmas tree falling down the
stairs.**

### The Zoom Budget
Performance and readability solved by the same rule.

**How it works:** Hard caps per tier: **Z0 ≤ 40 animated entities · Z1 ≤ 120 · Z2 ≤ 400 · Z3 ≤ 1200
(mostly static tiles) · Z4 ≤ 300 (large objects) · Z5 ≤ 200 (map marks).** **Everything above the cap
merges** into the parent's aggregate glyph via LOD3.
**Interacts with:** the readability targets in §8.9 (2,000 discrete objects, 20,000 in-flight entities,
40 per glyph, 30 labels at Z3), which are the same constraint stated as outcomes rather than caps.

### The acceptance-test roster
The full set of gates, collected. **Testable art direction is the only kind that survives production.**

| Test | Asks | Lives in |
|---|---|---|
| **The Quiet Frame Test** | is a healthy screenshot calm? | §8.9 |
| **The Loud Frame Test** | can a stranger answer *what's broken / what's worst / what can I do* in 5s, and is there exactly one most-urgent thing? | §8.9 |
| **The Thumbnail Test** | at 128px: which line, what tier, is it okay? | §8.9 |
| **The Two-Screenshot Test** | can a 4-hour player name two hosting types from one screenshot each? | §8.10 |
| **The Silhouette Sheet** | no two units confusable at 24px, no two families at 48px | §8.16 |
| **Silhouette-first authoring** | 16px, in motion, no colour, after three exposures | §8.16 |
| **The greyscale pass** | does every state survive Contrast Audit Mode? | §8.14 |
| **The greyscale-motion test** | can a tester name the problem with colour muted and motion only? | §8.2 |
| **The Two-Second Rule** | does every incident-time panel yield its answer in 2s? | §8.8 |
| **The Chroma Meter** | are the colour, FX, motion and label budgets being respected right now? | §8.2 |
| **The Strobe Budget check** | ≤3 luminance transitions/sec across >25% of screen | §8.14 |

### The one-page style guide
The whole of §8, compressed to the card that goes on the wall.

- **Layers:** World (iso, muted materials) · Signal/Flow (flat vector, saturated semantics) · Intent
  (white, dashed, perspective-correct) · Chrome/Annotation (instrument/terminal, monospace numerics) ·
  Attachment (flat, screen-space scale, rides its unit).
- **Reserved hues:** cyan = legitimate traffic · magenta = threats · violet = unidentified · gold =
  money · copper = power · orange = heat · amber = self-inflicted friction · warm grey-amber = degraded
  · red = failure (reserved) · white = player intent · white-cored red = self-inflicted failure · green =
  verified/healthy · ink blue = blueprint/intent register · grey = inert.
- **Form rule:** **gold moves, amber fills, orange is a lens, red is final.**
- **State axes:** health = value + temperature · urgency = saturation · certainty = stroke weight ·
  confidence = blur.
- **Rings:** Ring = time · Donut = utilization · Halo = mood · Arc = player state · Pips = counts.
- **Motion:** breathing LEDs at idle on one 0.5Hz heartbeat; motion reserved for "act now"; shake for
  four events only; no per-object animation at Z3.
- **Cable code:** amber copper · aqua fibre · black/red power A/B · grey OOB · violet cross-connect ·
  white "temporary" — **as a sheath band at the connector only.**
- **LED grammar:** slow green breath / fast green / steady amber / slow-blink amber / fast-blink amber /
  steady red / blink red / blue / off — **brightness modulates within the heartbeat, blink timing does
  not.**
- **Camera ladder:** Chassis · Rack Elevation · Room Iso · Floor Plan · Campus · Globe. **Seven shots:**
  Establish · Drop · Snap · Orbit · Fold · Rail · Pullback (+ Hold).
- **Budgets:** 3 alert hues (by severity) · 1 overlay · 5 event FX · 1 modal · 3 decisions · 3 promoted
  clocks · 2% emissive per object · world ≥66% of screen · 30 labels at Z3 · 40 entities per glyph.
- **Every entity ships:** sprite set · 16px icon · 4px pip + shape · aggregate contribution · one-line
  summary.
- **Every instrument ships:** one bezel · one of five faces · unit stamp · nominal band · threshold mark
  · ghost trace · Readout Mode.
- **Every level ships:** a Visual Identity Kit (meter first) · a hero object · a HUD gauge swap · a
  money shot · a home and detail altitude.
- **Every FX ships:** an ambient/event class and a reduced-motion equivalent.

---

## 8.17 Photo mode, key art, and shareable artifacts

*New in wave 2. Several entries across the document — the Photo Contest, the screensaver, the Signature
Frame, the Night Shot, the postcard — each need a camera tool and none specified one. **One tool
produces all of them.***

### Photo Mode
The single tool every artifact request resolves to.

**How it works:** A free camera with **focal-length and depth-of-field controls**, a **time-of-day
slider**, a **HUD toggle**, an **overlay toggle** (so you can shoot a thermal-view or money-view photo),
a **grain/era filter** matching the current era's chrome, rule-of-thirds guides, and a **title-block
frame option** that stamps the shot like a spec sheet with your **company mark, tier, uptime and date.**
**Why it matters:** **every artifact the game asks for — the Signature Frame, the Night Shot, the
postcard, the contest entry, the Rack Portrait, the Before/After pair — comes out of one tool.**

### Key Art Direction
Worth stating so marketing does not invent something the game cannot deliver.

**How it works:** **The hero image is not an explosion.** It is a **low, warm shot down a cold aisle at
3am: one person in silhouette with a flashlight, one rack lit amber among a hundred green, cable plumes
overhead, and a very small figure.** The title set in the Signage face.
**Why:** **the promise of the image is competence under pressure, at night, alone — which is the game.**

### The Money Shot
The campaign's authored climax image.

**How it works:** Every campaign should build toward **one image**: the camera pulls back through the hot
aisle, past the containment glass, out the door, up over the campus, and **the sign lights up.** **Design
it early and make sure the engine can shoot it** — it is a Pullback shot with an authored path, and it
should be a level-completion reward rather than a cutscene.

### The Rack Portrait
**How it works:** A **poster-style render of a single rack** with its elevation labels, in cyanotype or
in full colour. **Cheap to generate, deeply satisfying to own, perfect share asset** — and it comes free
from the auto-generated rack elevations (§8.4).

### The Before/After Slider
**How it works:** **Auto-captured screenshots from level start and level end**, presented as a draggable
comparison. **Zero design cost, maximum "look what I did."**

### The Incident Poster
An automatic artifact composed from systems that already exist.

**How it works:** When a major incident closes, the game composes a poster: the **Post-Mortem Polaroid**
as the hero image, the **Uptime Ribbon segment** beneath it, the incident's start/end/duration set in
the Doc face, the **root-cause line**, and the **cost.** Printed-looking, slightly imperfect. It goes on
the scrapbook wall and is a one-click share.
**The richer variant — the Incident Replay Frame:** a single composite image with **the Timeline Ribbon
with the incident marked, the topology at the moment of failure, the three key graphs, and the
outcome**, captioned automatically. **The postmortem as a poster, and the thing players will actually
post.**
**Why it is cheap:** **it is the Timeline Ribbon, the polaroid and the postmortem already built,
arranged once.** Gallows humour as collectible art.

### The Screenshot Watermark and the share frame
**How it works:** Every exported image carries the **Company Letterhead** treatment — the player's
generated mark, name, tier and date in a title block. **One template, applied to the poster, the
portrait, the blueprint export, the slider and the score screen**, so everything the player shares looks
like it came from the same company.

### The scrapbook wall
**Visual:** the physical place the artifacts accumulate — incident posters, the 100% uptime stamps, the
first-customer contract, the rack portraits, the before/after pairs, the placard wall of divested
lines. **Doubles as the Company Museum**, and it is where the Tour Camera ends.

### The end-of-level story artifacts
Every level ships you a story, not just a score.

**How it works:** Four artifacts, all composed from systems the game already runs:
- **The postmortem as a tech-blog or newspaper endcard** — generated headlines about your outage and your
  comeback, with **the user rating as the review score.**
- **The Growth Timelapse** — your whole build-out **re-rendered at 500× speed as a crane-shot construction
  loop with era music**, GIF-length and shareable. **Watching it slow is post-mortem mode**, with **the
  ghosts of failures flickering past as findable visual anomalies.**
- **The infographic replay** — callout annotations, **attack paths as red lines**, **the domino falling in
  slow motion.**
- **The hero-shot screenshot mode** — the scene **re-dressed for a hero shot** (lighting bloom, no HUD, a
  posed camera) with **a fake "case study" caption generated from your stats** — the end-screen review
  paragraph, made shareable.
**Interacts with:** §8.17's Photo Mode (which is the tool all four resolve to), §8.8's Unified Clock Ribbon
(the timeline the infographic replay draws), §8.17's Incident Poster and Before/After Slider.

### The Snow Globe Archive
The menu screen as a physical collection.

**How it works:** The menu is **a shelf of snow globes, each a live miniature diorama of a completed level
that is *still simulating*** — tiny lights blink, tiny bots march. **Click one to descend into that level's
endless mode.** **Your save file becomes a physical collection you are proud — or ashamed — to browse.**
**Why it matters:** it is the only proposal that gives the *meta* layer the same diegetic treatment the
game layer gets, and it reuses the Skin Preview Room's dioramas and the screensaver's idle sim wholesale.
**Interacts with:** §8.10's Skin Preview Room and Company Museum, §9.7's screensaver mode, §8.17's scrapbook
wall.

---

## 8.18 The visual-coverage audit — systems that had no picture

*New in wave 2. A pass over the document looking for **mechanically-defined systems with no described
visual expression at all**. These are the gaps found, and where each is now filled. Wave 1 frequently
said "a meter," "a gauge," or "it looks different"; those phrases are the symptom this audit looks for.*

### The audit finding
**How it works:** Five clusters had essentially no visual specification:

| Gap | What was missing | Now specified in |
|---|---|---|
| **The business machine** | the pipeline, price book, backlog, receivables, reserves, escrow, deferred revenue, commissions, contracts and the P&L existed as mechanics with **no rendering at all** | §8.7's *The business machine, rendered* (13 diegetic objects) + §8.8's business HUD cluster |
| **Business and financial threats** | chargebacks, review bombs, processor freezes, vendor price hikes, churn waves, bad debt, concentration risk, the abuse ladder, poaching and the regulator had mechanics and **no picture** | §8.5's *threat catalogue — business, financial, legal and commercial* |
| **Visitor archetypes** | beyond the generic mote, the whale and the bounce, **most archetypes had no visual** — training jobs, SIP calls, streamers, tour groups, restores, IoT devices, blocks, referrals, support vampires | §8.6's *visitor catalogue* + the five-channel mapping in §8.2 |
| **The Three-Clock Rule** | §7.9 demanded exactly three clocks and the design proposed ~20 timers, with **no interface that could hold both** | §8.8's *Unified Clock Ribbon* and its promotion rule |
| **The Hands resource** | staff attention as a spendable resource was fully defined mechanically and **never drawn** | §8.8's *Player Character Question* (hand tokens at the bottom of the screen) + the Arc form in §8.2's Ring Taxonomy (assignment) + the Ghost Hands of the Policy Layer view |

### The hand-wave detector
The reusable form of the same audit, so wave 3 can run it again.

**How it works:** Flag any entry whose visual description is one of: *"a meter"* · *"a gauge"* · *"a
bar"* · *"a counter"* · *"it looks different"* · *"a distinct visual"* · *"visually distinct"* · *"an
indicator."* Each is a promise with no spec. Replace with: **which instrument face** (§8.2's five
faces), **what it is bound to**, **what its nominal band is**, **what its threshold is**, and **what it
does when it crosses.** If those five cannot be answered, the underlying mechanic is probably also
underspecified — **the visual gap is a useful detector for a design gap.**

### The systems still thin, flagged for wave 3
**How it works:** Entries that survived this pass with a partial spec and should be finished next:
- **The reputation "sky swatch"** — named in the HUD and never described. Needs an instrument face.
- **The Threat Mass Bar** — named in the top bar, no spec.
- **The attack-surface rose** — named in the inspector, no geometry.
- **The uptime nines water line** — the only instrument that is a level rather than a dial, and its
  behaviour on partial months is undefined.
- **The pressure gradient's lip** on the bezel — named, unspecified.
- **Staff fatigue, morale and skill** — a Halo and Pips are allocated, but no per-state art exists.
- **The Retro-Thread** — drawn on the Timeline Ribbon, no visual language given.
- **The Company Wall and the whiteboard tech tree** — classed as Objects of Record, but neither has its
  flat equivalent designed.
- **Several per-line commercial artifacts** — six of the thirty lines still lack one.

---

