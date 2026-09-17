# Hosting Company Tower Defense — Idea Wave 1
## Lens: Graphics / Visual Designer

> Everything below is written from the art-and-UI chair. The question I'm answering for every
> system is not "is this a good rule?" but **"what does the player actually SEE, and can they read
> it in half a second at any zoom level?"** Mechanics are described in terms of their on-screen
> expression: silhouette, color, motion, sound-shaped-as-light, and HUD.

---

## 0. Art Direction Spine (read this first — everything else references it)

Before the 9 categories, here is the visual vocabulary the rest of the document assumes. Every idea
later on is built out of these primitives.

### 0.1 Art style options (pick one, or ship one and skin the others)

**A. "Isometric Blueprint"** — the default recommendation.
2.5D isometric pixel-ish vector art at a fixed 2:1 iso grid. Hardware is rendered as clean, chunky,
slightly-oversized objects with hard edges and one strong rim light. The *floor* of every level is a
faint cyan blueprint grid on dark slate — so when you zoom out, empty space still reads as "plan
view of a facility" rather than void. Cables, traffic, and attacks are the only things allowed to be
bright and saturated. Hardware is desaturated. This is the core readability trick: **the
infrastructure is furniture, the traffic is neon.**

**B. "Rack Cutaway / Technical Illustration"**
Flat 2D side-on elevation, like an exploded-view diagram in a hardware manual. Servers are drawn as
front-panel faceplates with real-looking drive bays, ear brackets, and LED strips. Threats crawl
across the elevation as silhouettes. Extremely readable, extremely cheap to produce, and it makes
1U/2U/4U size differences *mechanically legible* because a 4U box literally takes four slots.

**C. "CRT Terminal Diorama"**
Everything rendered as if displayed on a phosphor monitor: 3-4 color palette per level (amber, green,
white-on-black, ice blue), scanline bloom, chunky 8x8 glyph-based sprites. Threats are ASCII-adjacent
creatures. Charming, cheap, and thematically perfect — but caps how much information you can encode
in color, which hurts at datacenter scale. Good as an **unlockable "Legacy Mode" skin**, not the base.

**D. "Corporate Vector / Slide Deck Realism"**
Deliberately soulless flat-vector enterprise clip art — the aesthetic of an AWS architecture diagram.
Rounded rectangles, stock-photo-ish icon people, gradient buttons. The joke writes itself: your
infrastructure looks like a sales deck and the threats look like they escaped from one. Strong
comedic identity, great for the "CEO mode" scenarios.

**E. "Grimy Realism / Photoreal Cables"**
Dim, high-contrast, dust-in-the-air-beam datacenter photography look. Cold aisle blue on one side,
hot aisle amber on the other. Works as an **environmental backdrop layer** underneath style A rather
than as the gameplay layer — real cable spaghetti is unreadable, which is the whole design problem.

**Recommended shipping combo:** A as gameplay layer + E as parallax backdrop + B as the inspector
panel art + C and D as unlockable cosmetic skins tied to progression.

### 0.2 The Three-Layer Rendering Rule

Every frame is composed of exactly three visual layers, and nothing is allowed to break layer discipline:

1. **Substrate (dark, desaturated, static)** — floor, racks, walls, chassis, cable trays, buildings,
   the map. Value range clamped to the bottom 40% of the value scale. Never animates except for
   slow idle (fan blur, LED blink).
2. **Flow (bright, saturated, always moving)** — packets, requests, visitors, attacks, money,
   bandwidth. Value range clamped to the top 30%. *Everything the player must track in real time
   lives here.*
3. **Annotation (flat UI color, crisp, no perspective)** — health rings, labels, alert badges,
   selection outlines, tooltips, build ghosts. Drawn in screen space, never in world space, so it
   stays legible at any zoom.

If a new feature can't be assigned cleanly to one of the three layers, it's a visual design bug.

### 0.3 Color language (the single most important system in the game)

A strict, small, mnemonic palette. Once the player learns six hues, they can read any screen.

| Hue | Meaning | Where it appears |
|---|---|---|
| **Cyan / ice blue** | Legitimate traffic, visitors, revenue-bearing flow | Visitor sprites, healthy request packets, good link cables |
| **Warm gold / amber** | Money, value, upgrades, satisfaction | Coin motes, revenue tickers, upgrade auras, SLA-met glyphs |
| **Magenta / violet** | Hostile traffic, malicious intent | Attack packets, attacker silhouettes, exploit trails |
| **Red** | Damage, outage, failure, breach | Health loss, downed hardware, error floods, the breach wash |
| **Green** | Defenses, mitigation, healing, capacity headroom | WAF pulses, patch installs, restored services, free capacity |
| **Orange / hazard yellow** | Load, heat, saturation, pressure | Utilization meters, thermal overlay, queue depth, "about to break" |
| **White (pure)** | Reserved. Used ONLY for player-critical moments | Crits, unlocks, level-clear, the one thing you must look at now |

Rules layered on top:
- **Saturation = urgency.** A desaturated magenta blob is a bored scanner bot. A screaming magenta
  blob is an active exploit. Same shape, same hue, different saturation — instant threat triage.
- **Value = health.** Anything dying loses value (goes dark) before it loses shape. A dying server
  doesn't turn red, it turns *dim and grey*, then red only at the moment of death. This means a
  crowded map full of struggling machines reads as "the room is going dark" — a powerful,
  emotionally legible failure state.
- **Colorblind safety:** magenta-vs-cyan is the primary hostile/friendly axis, which survives all
  three common CVDs. Red/green appears only as a *secondary* reinforcement, never as the sole
  carrier of meaning, and a shape token (see 0.4) always doubles it.

### 0.4 Shape tokens — the "even in greyscale" guarantee

Color carries the fast read; **silhouette carries the certain read**. Every entity family gets a
distinct base shape that survives being shrunk to 6 pixels:

- **Circle / dot** = a legitimate visitor or request.
- **Triangle / arrowhead** = a hostile packet (points at what it's attacking).
- **Square / box** = a piece of owned infrastructure.
- **Diamond** = money, or a scoring event.
- **Hexagon** = a defense or mitigation object.
- **Teardrop / comet** = something in transit that will expire (a session, a timeout, a lead).
- **Jagged starburst** = an error / exception / failure event.
- **Ring / halo** = a status modifier applied to something else (buffed, throttled, infected).

A player who turns off all color should still be able to tell "circles are coming, triangles are
coming, circles go to boxes, triangles get eaten by hexagons."

### 0.5 Camera and zoom — the Four Altitudes

The single biggest visual risk in this game is that "one website" and "six datacenters" are the same
game. Solve it with **four discrete, art-directed zoom stops**, not a continuous free zoom. Each
altitude has its *own* art, its own icon set, and its own HUD density. Scroll wheel snaps between
them with a 250ms dolly + crossfade; an animated "LOD morph" shows each object collapsing into its
parent's icon so the player never loses the thread.

- **Z1 — Board Level (max zoom in).** Individual machines. You can see drive bays, LED blink
  patterns, a single packet as a distinct sprite, the little desk fan someone left on top of the
  switch. This is where the player makes surgical decisions and where the "toy" appeal lives.
- **Z2 — Rack / Room Level (default play view).** A rack is a vertical column of slot-tiles. Packets
  become streaks rather than sprites. Aggregate meters appear on rack doors. This is the tower-defense
  lane view for most of the game.
- **Z3 — Facility Level.** Racks become 2x2 glyph tiles arranged in rows with cold/hot aisles.
  Traffic becomes flow-ribbons of variable width instead of individual particles. Power, cooling and
  network become colored overlays you can toggle.
- **Z4 — Map / Region Level.** Datacenters become nodes on a stylized world map; transit links
  become arcs whose thickness is bandwidth and whose color is health. Threats arrive as weather —
  storm fronts, pressure systems — rather than as individual creatures.

**LOD promise:** at every altitude, *the same information is available*, just aggregated. A red
machine at Z1 makes its rack tile red at Z2, makes its room tile have a red pip at Z3, and makes its
datacenter node throb red at Z4. **Alarm color always propagates upward.** Nothing bad can ever
happen "off-screen" without a visible ancestor cue.

### 0.6 HUD layout skeleton

- **Top bar (thin, always visible):** cash + delta-per-second (animated ticker), reputation meter,
  wave/clock, current SLA compliance %, level objective chip. Nothing else. This bar must never grow.
- **Left rail:** build palette, as a vertical strip of category tabs (Compute / Storage / Network /
  Defense / People / Facility). Collapses to icons at Z3/Z4.
- **Right rail (contextual inspector):** appears only on selection. Shows the "faceplate portrait"
  of the selected object in style B (technical illustration), plus its live meters, its links, and
  its upgrade slots. Slides in; never overlaps the center 60% of the screen.
- **Bottom strip:** the **Timeline Ribbon** (see 7.x) — a scrolling horizontal band showing incoming
  waves, scheduled events, maintenance windows, and billing cycles as icons approaching from the
  right. This is the player's "radar" and it's the second-most-watched element after the map.
- **Center:** untouched. The game. Ever-present rule: **no persistent UI inside the central play
  area.** Popups are transient and self-dismissing.

### 0.7 Motion language

- **Legit traffic moves smoothly and in-step** — eased, rhythmic, almost breathing. When things are
  healthy the whole board pulses at a steady BPM.
- **Hostile traffic moves wrong on purpose** — jittery, too fast, stuttering, arriving in unnatural
  bursts, or moving perfectly straight through things that should deflect it. Players learn to spot
  attacks peripherally by *cadence*, before they parse the color.
- **Failure is always a stop, not a bang.** The primary failure animation is *motion ceasing*. A dead
  server's fan blur halts. A congested link's ribbon stops scrolling and bulges. Explosions are
  reserved for literal hardware death (PSU pop, disk head crash) and are rare enough to matter.
- **Everything the player builds arrives with weight.** Placement = a short drop, a dust puff, a
  rack-rail *clunk*, and a 3-frame screen-space "settle" shake confined to the object.

### 0.8 The Readability Budget (a design constraint, stated as a rule)

Hard caps enforced by the renderer, because a hosting game trends toward "ten thousand packets":
- Max ~150 individually-simulated *visible* particles on screen; beyond that, particles merge into
  **flow ribbons** whose width encodes count. A ribbon is not a cheat — it's the correct
  visualization of aggregate traffic, and it's *more* readable than 4,000 dots.
- Max 3 simultaneous full-screen effects. A 4th queues.
- Max 1 "white event" (see color language) per 10 seconds. White is precious.
- Any object smaller than 12px on screen renders as its shape token only, never as detailed art.

---

## 1. Levels, Scenarios, and Progression
### (What each scale LOOKS like, and how the picture escalates)

The progression arc should be legible as a **series of postcards**. If you showed a player a single
still frame from each tier, they should instantly know which tier it is. The escalation is therefore
designed as a sequence of *distinct compositions*, not just "more stuff."

### 1.1 Tier Postcards — the visual identity of each scale

**1.1.1 "The Closet" (Tier 0 — one site, one shared server)**
A single beige tower PC under a desk, in a warm domestic room: carpet texture, a window with
daylight, a cat that occasionally walks across the cable. The "map" is *one table*. Traffic arrives
along a single phone-line cable coming in from the left edge of frame. Palette is warm and cozy —
lamp yellows, wood browns. The entire threat model fits on screen at Z1. Deliberately un-sci-fi so
that Tier 1's cold blue feels like a real graduation.

**1.1.2 "The Shared Host Tenant" (Tier 0.5 — your site on someone else's box)**
Visual gimmick: you can see the *other tenants*. The server is rendered as an apartment building
cutaway — you own one lit window; the other 200 windows belong to strangers. Neighbor sites flicker,
overload, get hacked, and their damage bleeds sideways into your unit as cracks along the shared
wall. You have no build permissions on the substrate — the build palette is 90% greyed out with
little padlock glyphs, which visually *teaches scarcity* and makes Tier 1's unlocked palette feel
enormous.

**1.1.3 "Four U in Someone Else's Cage" (Tier 1 — colo)**
Now it's cold: blue-grey concrete, raised floor tiles with perforations, a chain-link cage around
*your* four rack units. Above and below you, other companies' gear is drawn in flat grey silhouette
with no detail — visually saying "not yours, not your problem, not your control." The cage is the
frame of the playfield. Your uplink is a single yellow fiber running up to a ceiling tray you're not
allowed to touch (rendered with a "do not modify" hazard chevron).

**1.1.4 "The Half Rack" (Tier 2)**
The cage becomes a full rack elevation (style B) and the game turns into a vertical lane game. Empty
U-slots are drawn as dark voids with visible rails and threaded holes — **empty space is itself a
compelling visual invitation**, the Tetris-shaped hole you want to fill. Cable management is now
visible: a vertical cable comb on the side, and a *messiness meter* rendered literally as how
tangled the cable spline is.

**1.1.5 "Your Own Suite" (Tier 3 — a room, a handful of each service class)**
Top-down / iso room with 4-8 racks, hot and cold aisles rendered as a literal thermal gradient on the
floor (blue mist at the cold aisle grates, orange shimmer at the hot aisle). The first time the
player sees **aisle containment curtains**, it should look like a real architectural upgrade.

**1.1.6 "The Datacenter Floor" (Tier 4 — many racks, many customers)**
Z3 becomes the default altitude. Racks become tiles; the picture is now a *factory floor plan* with
power busways drawn as thick black spines and network spine/leaf drawn as a woven mesh in the
ceiling plane. Customers appear as **colored cage territories** — tenant A's rows glow faint purple,
tenant B's faint teal — so the floor reads like a district map.

**1.1.7 "Multi-Region" (Tier 5)**
Z4 world map. Datacenters are glowing hex nodes with a little skyline-silhouette icon unique to each
site (a windmill for the Nordic one, palm for the Singapore one, cooling towers for the Virginia
one). Transit links are great-circle arcs. Latency is drawn as **arc length and travel-dot speed**,
not as a number — a visitor dot crawling slowly along a long arc is self-explanatory.

**1.1.8 "The Hyperscale Reveal" (Tier 6 / endgame flex)**
Zoom out one more stop than the player thought existed. Your whole world map becomes a node in a
larger network graph, and the camera pulls back to reveal your company as one glowing cluster among
competitors. Purely a spectacle beat, used once, for the ending.

### 1.2 Visual escalation devices (how "harder" is shown, not told)

**1.2.1 The Density Ramp.** Each tier increases *objects per screen* but decreases *pixels per
object*. The art must be authored at four LODs from day one. The feeling of scale comes from the
same asset getting smaller and more numerous.

**1.2.2 The Cable Entropy Curve.** Early levels: 3 cables, hand-placed, beautiful. Late levels:
hundreds. Introduce **cable bundling** as an unlockable that visually collapses N parallel links into
one thick sheathed trunk with a small "×12" badge. The *visual relief* of buying cable management is
one of the best upgrade payoffs in the game and costs nothing mechanically to justify.

**1.2.3 The Noise Floor.** As tiers advance, add ambient background activity you don't control —
other tenants' blinkenlights, techs walking carts down the aisle, a flickering fluorescent tube. It
makes the facility feel alive and, critically, makes *your* signals require better contrast, which
is why the Flow layer's saturation clamp matters.

**1.2.4 Sky/Time-of-day Bands.** Each level runs across a stylized day: the background window/skylight
shifts dawn → noon → dusk → night. Traffic volume is drawn as a **diurnal wave** in the Timeline
Ribbon, so the player sees the rush hour coming as a literal sunrise. Night = low traffic + higher
attack ratio (the "3 a.m. pager" aesthetic: everything dark, one magenta triangle, one red pip).

**1.2.5 The Blueprint Rewind.** Level intro and outro are always shown as an animated architectural
blueprint that draws itself in cyan line-art, then "solidifies" into the real assets. Level end
reverses it, leaving the final built topology as a clean, shareable **blueprint card** (see 6.x
scoring). Progression is thus visually archived as a gallery of blueprints.

### 1.3 Scenario types, defined by their visual hook

Each scenario should be recognizable from its *screenshot*, because each one bends the normal
rendering rules in a specific way.

**1.3.1 "Launch Day" (survive a spike).** The Timeline Ribbon shows a colossal incoming wave shape,
drawn as a literal breaking wave silhouette. As the spike hits, traffic ribbons swell until they're
wider than the links carrying them — **overflow is drawn as the ribbon spilling over the edge of the
cable and splashing off into grey "bounced" motes**. Success = the ribbon fits. It's a plumbing
picture.

**1.3.2 "The Slashdot/HN Hug."** Traffic doesn't ramp — it *teleports*. The visual is one frame of
calm, then the inbound gate blows open and the screen edge becomes a solid wall of cyan. Included as
a jump-scare-shaped pacing beat.

**1.3.3 "Migration Without Downtime."** Two topologies on screen at once: the old stack rendered in
full color and the new stack rendered as a translucent "ghost build" in blueprint cyan. The player
drags traffic percentage from old to new with a **physical crossfade slider** rendered as a literal
patch-panel lever. As traffic moves, the ghost solidifies and the old stack desaturates. The final
frame — old stack going fully grey and powering down while the new one is at full saturation — is
the reward image.

**1.3.4 "Recover From a Breach."** The whole board renders under a **forensic overlay**: everything
desaturates to monochrome, and the attacker's historical path is drawn as a glowing magenta thread
you must trace backwards through time using a scrub bar. Compromised assets are marked with an
animated "taped-off crime scene" hatch. Cleaning a host restores its color. The level literally
*colors itself back in* as you progress — a perfect legibility-as-progress-bar loop.

**1.3.5 "The Audit / Compliance Level."** A clipboard-carrying inspector NPC walks your floor in real
time along a visible pathline. Anything out of compliance glows with a yellow dashed outline *only
when he's within N tiles* — so the player is scrambling ahead of a moving spotlight. Tension is
purely spatial and totally readable.

**1.3.6 "Black Start" (power loss).** Screen goes to near-black; the only light sources are UPS
status LEDs, emergency egress strips (green), and the player's cursor, which becomes a flashlight
cone. You restore services in dependency order and the room lights back up rack by rack. Beautiful,
tense, and teaches dependency graphs by literally illuminating them.

**1.3.7 "The Noisy Neighbor" (shared/multi-tenant).** You can see other tenants' resource usage as
colored bars pushing into shared meters from the other side, like a tug-of-war. Their spikes
physically shove your headroom bar. Pure visual metaphor for contention.

**1.3.8 "Hardware Refresh Weekend."** Maintenance-window scenario. A translucent blue "change window"
band sweeps across the Timeline Ribbon; inside the band, you may power down machines without SLA
penalty. Outside it, the band's edge turns red and the penalty meter arms. The tension is literally
watching a colored rectangle close.

**1.3.9 "The Cheap Bid" (constraint scenario).** All build costs shown in red, budget bar rendered as
a physically shrinking ruler. Visual gimmick: you're only allowed to use **used/refurb hardware**,
drawn with scuffs, mismatched faceplates, asset tags from other companies, and one machine that's
visibly a different beige. Aesthetic storytelling of "we're broke."

**1.3.10 "Hurricane / Regional Event."** At Z4, a weather system literally crosses the map toward one
of your sites. Visitor arcs bend around it; your site node gets a spinning cyclone icon; generator
fuel becomes a visible tank gauge. Cross-region failover is drawn as arcs *re-routing in real time*,
which at Z4 is the single prettiest animation in the game.

**1.3.11 "The Acquisition."** You inherit another company's rack — rendered in a completely different
art skin (different faceplates, different cable color, different label font). It's ugly, it's
undocumented (half the objects have "?" nameplates until you inspect them), and normalizing it into
your own visual style is the level objective. **Visual consistency as a win condition** is a genuinely
novel objective type.

**1.3.12 "DDoS Season."** Persistent magenta haze at the map edges for the whole level; attack
density baseline is elevated and visible as a permanent pressure gradient rather than as discrete
waves.

**1.3.13 "The Demo for the Investor."** A split screen: your real board on the left, and on the right
a "presentation view" the investor sees — a clean dashboard with beautified graphs. You must keep the
*presentation view* green, which means you're incentivized to fix visible metrics rather than real
ones. Savage, funny, and a genuinely interesting mechanic expressed entirely through a second UI.

**1.3.14 "Cold Aisle Chaos" (thermal level).** Thermal overlay is forced on for the whole level; the
floor is a live heat map and your task is airflow choreography. The art is basically a beautiful
false-color IR image you can rearrange.

**1.3.15 "Legacy Mode" (the CRT skin scenario).** A flashback level set in 1998, rendered entirely in
art style C. Beige, CRT curvature, 4-color. The mechanics are simplified to match the visual budget.
Used to justify shipping the alternate art style as content rather than as an option.

### 1.4 Progression framing devices

**1.4.1 The Company Wall.** The meta-progression screen is an office wall that fills up over the
campaign: framed blueprint cards from each cleared level, a pegboard of unlocked hardware, press
clippings for milestones, a slowly-growing collection of conference-booth swag. Progress is a
*room getting more furnished*.

**1.4.2 The Asset-Tag Ledger.** Every machine you ever deployed gets a numbered asset tag sticker.
Old machines carry visible wear textures proportional to their uptime. A 5-year-old box that's been
with you since Tier 1 looks scuffed, yellowed and beloved. Retiring it plays a small ceremony.

**1.4.3 Rack Elevation Diff.** Between levels, show a before/after rack elevation animation of what
changed. It reads like a changelog you can actually look at.

**1.4.4 Scale-Anchor Object.** Keep one object identical at every tier for scale reference — a coffee
cup at Z1, a person silhouette at Z2/Z3, a city at Z4. Classic technical-illustration trick; makes
the escalation viscerally felt.

**1.4.5 The Logo Evolves.** Your company logo (player-chosen from a generator) is drawn on everything:
rack doors, badge lanyards, the loading screen, the truck in the delivery cutscene. Its rendering
gets more polished as your reputation rises — Tier 0 is clip-art Comic Sans on a printed sheet of
paper taped to the tower PC; Tier 5 is etched aluminum. **Reputation as typography.**

---

## 2. Threats
### (Silhouette-first design: every threat is a readable creature before it is a rule)

**Design law for this section:** a threat must be identifiable by (a) silhouette, (b) movement
cadence, and (c) approach vector — *before* its color is parsed. Color is the third confirmation, not
the first. Below, each threat gets a visual identity, an approach animation, a "landing" animation,
and a "countered" animation, because the countering is where the player's dopamine lives.

### 2.1 Volume / flood threats — rendered as MASS

**2.1.1 Packet Swarm (generic DDoS).** Not one creature — a **cloud of thousands of tiny magenta
arrowheads** that behaves like a starling murmuration. At Z2 they're individual triangles; at Z3 they
merge into a single roiling magenta ribbon whose *width* is the pps. Landing: they don't hit the
server, they **pile up in front of it**, physically stacking into a growing drift that buries the
machine's faceplate until its LEDs can't be seen. Counter (scrubbing): a green cone sweeps the drift
and the triangles dissolve into harmless grey ash that drifts down and vanishes. The "drift piling
up" metaphor is the clearest possible picture of a queue filling.

**2.1.2 SYN Flood Ghosts.** Half-drawn visitor circles — rendered as *outlines only, no fill*, with a
dotted trailing line that never completes. They walk into your connection table and **just stand
there**, occupying visible slots in a physical "connection table" widget drawn as a rack of pigeon
holes. You can literally see empty-outline ghosts squatting in slots real visitors need. Counter
(SYN cookies): the slots turn into translucent "virtual" slots and ghosts fall straight through.

**2.1.3 The Amplifier Horn.** A reflection/amplification attack drawn as a small magenta imp that
runs to a *neutral third-party* node on the map edge (a misconfigured DNS resolver rendered as an
innocent little grey box with a megaphone on top), pokes it, and the megaphone blasts a **cone of
volume at you** that's 50x the imp's size. You can't kill the cone — you have to kill the imp or
shield the cone. Teaches indirection visually.

**2.1.4 Slowloris Spiders.** Long-legged, slow, spindly silhouettes that creep in and then *hold on*
to a connection with a visible thread. Each one is nearly free individually; the picture of failure is
a server covered in thin threads like a cocoon. Counter is a timeout sweep drawn as a pair of shears.

**2.1.5 The Cache-Buster.** A visitor-shaped decoy (circle!) whose fill is a subtly wrong cyan —
almost-right, slightly green. It walks past the CDN/cache layer untouched because its request is
unique, and only at the origin does its silhouette flip to a triangle with a small *pop*. Deliberate
visual deception; teaches the player to look at the **tiny query-string tail** rendered as a squiggle
behind the dot.

**2.1.6 Layer-7 Marathoners.** Large, heavy, slow magenta blobs that request the single most
expensive page. Drawn with a visible "weight" number and a sag in the link ribbon as they pass —
the cable literally droops under them. Great physicalization of CPU cost.

### 2.2 Intrusion / exploit threats — rendered as INFILTRATION

**2.2.1 SQL Injection Serpent.** A thin magenta snake with an apostrophe-shaped head. It doesn't
attack the web server — it **slips through it** (the web server sprite goes briefly translucent as
it passes, which is the tell) and coils around the DB. On success the DB's data drawers fly open and
rows stream out as scrolling glyph ribbons toward the map edge. Counter (prepared statements / WAF):
the serpent hits a green lattice and snaps into segments.

**2.2.2 XSS Marionette.** Doesn't damage your servers at all — it attaches **strings to your
visitors** on the way out. Infected visitors get a puppet-cross glyph above them and their path
starts curving toward the attacker's exfil node. The visual horror is watching *your own revenue
walking away*. Counter: a green "sanitize" gate that snips the strings with a scissor animation.

**2.2.3 Credential Stuffing Queue.** A long, orderly, boring line of identical grey figures, each
trying one key at a door, drawn with a comedic bureaucratic cadence (step, try, shake head, step
aside). Individually harmless, endless. Visual cue: it's the only threat that forms a **neat line**,
which makes it instantly distinguishable from flood chaos. Counter (rate limit): a turnstile drops;
counter (MFA): the door grows a second lock and the line visibly gets bored and leaves.

**2.2.4 The Zero-Day Wraith.** A featureless black silhouette with no readable icon — literally an
**unidentified shape**, because the player doesn't know what it is yet. It passes through every
defense with a soft violet shimmer. Only after the "incident analysis" resolves does its true sprite
get filled in and added to your bestiary, and *then* your defenses can see it. Making "unknown" an
actual visual state is one of the strongest ideas in this doc.

**2.2.5 Supply-Chain Trojan.** Arrives **inside a friendly delivery** — the package truck / composer
crate / container image that you *asked for*. Rendered as a normal cyan-taped crate with a single
magenta staple you can only notice if you inspect it before install. After install it sits inside your
server as a small pulsing magenta pip visible only in the inspector's cutaway view.

**2.2.6 Insider Badge.** A staff sprite with a subtly *inverted* badge color. Walks your floor with
full access. Visually identical to a legit employee except for one pixel-level cue and a slightly
different idle animation (glances around). Players will screenshot and argue about it. Counter: audit
log overlay that draws footprints behind every staffer.

**2.2.7 Ransomware Bloom.** The scariest visual in the game. A magenta crystalline growth that starts
at one file store and **grows across your storage tiles like frost on a window**, converting each
tile to a locked padlock glyph with a countdown. Restoring from backup plays as a wave of cyan
washing the frost away from the backup node outward — so the *direction* of the heal shows you
exactly how much of your topology the backup actually covers.

**2.2.8 Cryptominer Squatter.** A little magenta gremlin that sits *on top of* a CPU and pedals a tiny
generator. Doesn't break anything; just permanently steals a visible slice of the utilization donut
and turns it magenta. The tell is thermal: its host is hotter than its neighbors in the heat overlay.
Pure "find the odd one out" visual puzzle.

**2.2.9 Directory Traversal Mole.** Burrows under your filesystem tree (rendered as a literal
sideways tree diagram in the inspector) leaving a dotted tunnel: `../../` drawn as a visible upward
staircase. Counter: chroot drawn as a concrete floor slab under the tree.

**2.2.10 The Scanner Drone.** Ubiquitous, harmless background noise — a tiny grey drone that sweeps
your perimeter drawing a thin sweep-line and pinging every open port as a little ripple. It's there
constantly to create ambient texture and to make the player's port surface *visible*. If it finds an
open port, it drops a marker flare and a real threat spawns there later. Scanners are the game's
**foreshadowing system**, rendered.

**2.2.11 Phishing Kite.** Targets your *staff*, not your servers. A drifting paper-plane sprite that
floats toward a staff member's desk. If it lands, that staffer gets a magenta halo (compromised) and
their subsequent actions can be sabotage. Counter: training upgrade, drawn as staff wearing little
graduation-cap pips who bat the plane away.

**2.2.12 Bot Scraper Locusts.** Dense, fast, cyan-*tinted*-magenta (deliberately ambiguous) creatures
that eat your content and leave. They look almost like visitors, cost you bandwidth, and generate no
revenue. Their tell: they visit *every* page in perfect sequence, so their pathline is an unnaturally
systematic zigzag across all your content nodes. A shape tell rendered as a *path*, which is a
category of visual design this game can uniquely exploit.

### 2.3 Attacker archetypes — rendered as CHARACTERS at the map edge

Attacks come from a visible **Threat Gantry** along the map border: a row of "who's attacking you"
portrait cards. Each archetype has a distinct portrait, a distinct spawn animation, and a distinct
color trim on its spawned units.

**2.3.1 Script Kiddie.** Cartoon hoodie silhouette in a beanbag chair, RGB keyboard glow. Spawns
noisy, low-damage, high-frequency junk. Units have a neon-rainbow trim (they think it's cool). Gives
up quickly if rebuffed — visibly throws a controller.

**2.3.2 Botnet Herder.** A silhouette holding many leashes; each leash is drawn to a compromised
consumer device icon (router, fridge, camera). Their units spawn from *many* map edges at once.
Killing the herder is impossible; you can only cut leashes, which visually thins the swarm.

**2.3.3 Competitor.** Wears a suit. Portrait is your own logo with the colors inverted. Their attacks
are subtle and business-shaped: fake reviews (drifting star glyphs turning red), poaching staff (a
staff sprite walks off-map), and targeted latency attacks timed to your demos.

**2.3.4 Extortion Crew.** Portrait is a stylized mask. Their signature visual is the **ransom
overlay**: a full-screen semi-transparent note in a deliberately ugly font, with a countdown. The
note partially blocks your view — the attack is *literally* UI occlusion, which is a wonderfully
hateable mechanic.

**2.3.5 Nation-State.** Portrait is a featureless official seal. Their units are **slow, quiet,
perfectly formed, and under-saturated** — the opposite of every other threat's loudness. They don't
break things; they sit and watch. Visual signature: a faint, almost-invisible thin line from one of
your machines to the map edge that only shows up under the "network flows" overlay.

**2.3.6 Disgruntled Ex-Employee.** Their sprite is drawn from your *own* staff art set, with a
desaturated palette. They know your layout, so their pathing ignores your maze and goes straight to
the weak point — visually, they walk the shortest line while everyone else follows the path. Chilling.

**2.3.7 The Vulnerability Researcher (neutral/ambiguous).** Arrives in white-ish grey, pokes at your
surface politely, and leaves a **report scroll** on your desk. You can pay them (money out, hole
patched) or ignore them (the hole stays and a real attacker finds it in 3 waves). Visually the only
"threat" that walks in through the front door and knocks.

**2.3.8 The Regulator.** Not an attacker, but drawn in the Threat Gantry anyway for comedy. Fines are
rendered as gold coins flying *away* from your balance with a stamped-paperwork animation.

**2.3.9 The Crawler Consortium (search engine bots).** Ambiguous entity drawn in cyan-gold: costs you
bandwidth like a scraper but *raises* your reputation. Blocking it is a visible mistake — your SEO
meter dims. Excellent teaching moment rendered as a color that's intentionally "both."

### 2.4 Non-attack problems — rendered as PHYSICS AND ENTROPY, not enemies

These should feel categorically different: no creature sprite, no approach path. They *emerge from
your own stuff*, which is exactly how they feel in real life.

**2.4.1 Disk Failure.** A drive bay LED goes from green to slow-blink amber to solid red. In the Z1
view you see the little drive carrier; a SMART-warning icon appears as a tiny cracked-platter glyph.
On full failure the RAID array widget shows one segment go hollow and the remaining segments start
pulsing (rebuild). **The rebuild itself is a visible vulnerability window**, drawn as an amber
progress ring around the array during which a second failure is fatal — the tension is a literal
loading bar you are praying finishes.

**2.4.2 PSU Pop.** A single frame of white flash, a puff of grey smoke rendered as a soft sprite, and
the machine's fan blur *stops*. Redundant PSU: the second PSU's LED flips from standby-amber to
active-green with a satisfying *chunk*, and nothing else happens — the reward for redundancy is that
the picture *doesn't* change, so we must make the little LED flip extremely juicy to sell it.

**2.4.3 Fan Death / Thermal Runaway.** Heat overlay bleeds outward from one machine as an orange
stain that spreads to neighbors. CPUs throttle: their utilization donuts visibly *shrink their
maximum*, drawn as the donut's outer ring shrinking. Beautifully legible way to show "your ceiling
dropped."

**2.4.4 The Loose Cable.** Cosmetic-looking: one link's cable end is drawn at a slight angle, not
quite seated. Traffic across it flickers. A tech NPC walking by can reseat it. Rewards players who
*look closely*, and creates the delicious "it was DNS / it was the cable" moment.

**2.4.5 Bad Deploy.** A **version flag** flies up the flagpole on the affected service. The new flag
is a different color. Error-rate starbursts begin spraying from that service. Rollback animation
literally lowers the flag and raises the old one. The whole mechanic is readable at a glance from
across the room.

**2.4.6 Config Drift.** Machines that should be identical slowly acquire tiny visual differences — a
slightly different faceplate sticker, a different LED pattern. A "fleet diff" overlay highlights the
odd ones out with a yellow dashed outline. Config management (Ansible/Puppet upgrade) plays as a
sweeping wave that visually re-syncs every faceplate to identical. Deeply satisfying.

**2.4.7 Certificate Expiry.** Each TLS-bearing service wears a little **padlock badge with a wax-seal
ring** that slowly drains like a pie chart over the level. At zero, the padlock breaks open and every
visitor approaching that service stops at a red full-screen-ish browser warning sprite and turns
around. The most preventable disaster in the game, and it must LOOK preventable — the draining seal
is visible from Z2 onward.

**2.4.8 Domain/DNS Lapse.** The signpost at the map entrance (your domain name, drawn as a literal
roadside sign) goes blank/grey and visitors pile up at the entrance milling in confusion. Comedy and
horror in one image.

**2.4.9 Power Event / Brownout.** All lights dim by 30% and take on a sickly flicker; the UPS battery
icons switch from a trickle-charge animation to a *draining* one with a visible time-remaining number
that is the scariest number in the game. Generator start is a 15-second animation with a cranking
sound, a puff of exhaust, and lights snapping back to full — a genuine hero moment.

**2.4.10 Network Partition / BGP Weirdness.** At Z4, one of your arcs goes **dotted and grey**, and
traffic that should traverse it visibly piles at the node and then re-routes along a longer arc with
visibly slower dots. Route leaks: an arc reroutes through a *stranger's* node drawn in hostile grey.

**2.4.11 Backup That Didn't.** The backup node shows a green checkmark every night... but on
inspection the checkmark is drawn slightly *hollow*. A restore attempt reveals empty tape reels. The
visual lie is the point; a "verify backups" upgrade turns hollow checks into solid ones. Teaching a
real operational truth purely with a fill-vs-stroke distinction.

**2.4.12 Angry Customer.** A client sprite whose mood ring goes from gold → orange → red. Above their
head, tickets stack up as little paper glyphs; the stack is the queue depth. At full anger the sprite
turns and walks off-map with a suitcase (churn), leaving a red footprint trail that lingers as a
scar on your reputation meter.

**2.4.13 The Ticket Avalanche.** Support queue rendered as a physical in-tray. When an outage hits,
paper slips *rain* into the tray faster than staff can pull them, and the tray visibly overflows onto
the floor. Hiring support staff adds more hands reaching in. No numbers needed.

**2.4.14 Billing Failure Cascade.** A client's payment method fails: a small credit-card glyph with a
red corner-fold appears over their icon. If unaddressed, their services grey out. Rendering money
problems *on top of the infrastructure* keeps the business layer spatially present.

**2.4.15 The Leak Above Your Rack.** Pure environmental horror: a slow water droplet animation from a
ceiling pipe, one drop every few seconds, landing on a rack. You have N drops before something
shorts. Tiny, cheap, memorable.

**2.4.16 Pest / Physical.** A mouse chews a cable; a moth in a relay (a literal bug, for the joke); a
tech's coffee. These are rare "flavor incidents" with bespoke micro-animations — the kind of thing
players clip and share.

**2.4.17 Entropy Dust.** A slow, global visual system: unmaintained machines accumulate a fine grey
dust layer and their LEDs dim. It's a *continuous* visual decay tied to maintenance debt, so a
neglected corner of your datacenter literally looks neglected. Cleaning/maintenance passes restore
shine. This single shader-level idea does more for "read the state of your fleet at a glance" than
any meter.

---

## 3. Visitors, Traffic, and Clients
### (The cyan layer — your revenue, rendered as fragile little creatures)

The emotional core of the game is that **visitors are adorable and easily discouraged.** They should
be animated with enough personality that losing one *stings*. This is the single highest-leverage
art investment in the project.

### 3.1 Visitor species — each a distinct silhouette + gait

**3.1.1 The Browser (baseline).** A simple cyan circle with a tiny trailing comet tail. Walks at a
steady pace along the path. Has a small **patience ring** around it that depletes as it waits. When
the ring empties it flips to grey, does a little shrug animation, and pops out of existence with a
descending tone. Mass-produced, but the shrug is what makes the player care.

**3.1.2 The Mobile Visitor.** Smaller, faster, *impatient* — patience ring drains ~2x. Drawn with a
slightly squashed profile and a little signal-bars pip. On a bad connection its own movement stutters
independent of your infrastructure, teaching "not everything is your fault."

**3.1.3 The Deep Reader.** A larger, slower circle with a book-page glyph. Visits many pages (long
path), generates much more ad/engagement revenue, but is exposed to your failures for far longer.
High risk, high reward, and *visibly so* because you watch them traverse your whole site.

**3.1.4 The Buyer.** Gold-rimmed cyan circle carrying a tiny cart. Their path ends at the checkout
node. **If they reach it, they emit a shower of gold diamonds.** If they bounce mid-funnel, the cart
tips over and spills grey. The funnel is drawn as a literal narrowing chute so drop-off is spatially
obvious.

**3.1.5 The Returning Customer.** Has a small halo ring and a faint worn path — their route is
pre-lit, showing they know where they're going. Repeat visitors literally *pave* your paths: heavily
trafficked routes get brighter and smoother over time, which is a gorgeous emergent visualization of
loyalty.

**3.1.6 The API Client.** Not a person-shape — a **square-ish packet with a serial number** that
arrives in perfectly rhythmic bursts. Machine-like motion. Doesn't bounce, it *retries*, drawn as
bouncing back and looping around. Retry storms are a visible spiral.

**3.1.7 The Streamer/Downloader.** A visitor connected to your edge by a **persistent thick ribbon**
for a long duration, rather than a single traversal. They occupy visible bandwidth continuously. Great
for teaching the difference between requests and throughput without a single word.

**3.1.8 The Crawler (friendly bot).** Cyan-gold, systematic, discussed in 2.3.9. Its path draws a
visible index that fills up your "SEO coverage" meter as a literal map-shaped completion grid.

**3.1.9 The Ghost Visitor (adblocked / no-JS / privacy).** Rendered as a translucent outline. Counts
for load, contributes less revenue. Visually communicates monetization friction.

**3.1.10 The Tire-Kicker.** Visits your pricing page, hovers, leaves. Drawn with a visible *hesitation
wobble* at the decision node. Sales/marketing upgrades reduce the wobble — you can literally see your
conversion optimization working on individual creatures.

**3.1.11 The VIP / Whale Client.** A large, stately, gold-and-cyan figure with an entourage of smaller
dots. Moves slowly and majestically. Its bounce is a catastrophe animation: the whole entourage turns
and leaves together, and the screen does a slow desaturation flash. Their satisfaction gets its own
persistent HUD pip.

**3.1.12 The Press / Influencer.** Carries a camera flash. Their experience is broadcast: if they have
a good trip, a burst of new visitors spawns from the map edge in a fan pattern; a bad trip spawns a
red "bad review" glyph that permanently dims a section of the inbound gate.

**3.1.13 The Migrating Client (inbound).** Arrives at Z3 as a **moving truck** carrying their existing
stack as visible crates. You must prepare a landing zone; if you can't, the truck circles and leaves.

**3.1.14 The Support-Needy Client.** High revenue, but continuously emits ticket-paper glyphs. Visual
economics: you can see them consuming your support staff's animation time.

**3.1.15 The Abusive Tenant.** A client who *looks* like a customer (gold ring) but whose workloads
spawn threat-shaped units from inside your perimeter. The visual gut-punch: a friendly icon emitting
hostile triangles. Rendered with a slowly darkening gold ring so an attentive player can catch it.

### 3.2 How traffic itself is drawn

**3.2.1 The Particle→Ribbon Continuum.** Low volume = individual creatures (Z1/Z2). Medium = dense
particles. High = a continuous ribbon whose **width = volume, scroll speed = latency, color =
health mix, and internal speckle = error rate**. Four variables in one glyph. Zooming in "resolves"
a ribbon back into creatures, which is a genuinely delightful interaction.

**3.2.2 The Inbound Gate.** All legitimate traffic enters through a visible arch/portal on the map
edge, sized to your capacity. **The gate's physical width is your ingress bandwidth.** When traffic
exceeds it, you watch creatures jam at the arch. Upgrading bandwidth is an animation of the arch
widening — one of the most satisfying upgrade visuals possible.

**3.2.3 Latency as Distance and Drag.** Slow responses are drawn as the visitor *slowing down and
sinking* slightly, with its patience ring draining. A whole board of sluggish, low-riding visitors
reads instantly as "we are slow today" with no numbers.

**3.2.4 The Bounce Puff.** Every bounce emits a small grey puff and a soft descending tone. When many
bounce at once, the puffs merge into a visible grey smog over the entrance. **Smog = you are losing
money right now.** It's the single most important negative-feedback visual in the game.

**3.2.5 Happy Sparkle / Conversion Pop.** Successful journeys end with a small gold burst at the
destination and a coin mote that flies to the cash counter in the top bar. The arc of coins flying
to the HUD is the game's heartbeat.

**3.2.6 Queue Visualization.** Every service has a small physical **waiting area** drawn in front of
it. Visitors stack there. Queue depth is instantly legible as crowd size, and the difference between
"deep queue, moving fast" and "shallow queue, stuck" is legible through motion.

**3.2.7 Session Threads.** A stateful session is drawn as a visible thread connecting a visitor to
the server that holds their state. If that server dies, the thread snaps with a *twang* and the
visitor stops, confused, then bounces. The argument for session replication/shared cache is made
entirely by watching threads snap.

**3.2.8 The Traffic Mix Prism.** A HUD element that splits your inbound stream into a rainbow of
component classes (organic, paid, referral, bot, hostile) like light through a prism. Each band's
thickness is its share. Marketing spend visibly fattens one band.

**3.2.9 Geo-Origin Tints.** At Z4, visitors carry a faint regional tint (aurora green from the north,
warm coral from the south, etc.) so you can *see* where your audience is coming from and whether your
edge placement matches. Building a PoP near a dense tint cluster is a visually obvious good decision.

**3.2.10 The Funnel Cross-Section.** A toggleable UI that redraws your whole topology as a Sankey
diagram in-place: visitors in on the left, revenue out on the right, with every loss (bounce, error,
timeout, abandoned cart) drawn as a grey branch leaking out the bottom. Same data, different
projection, one keypress apart.

### 3.3 Attraction — how marketing looks on screen

**3.3.1 The Beacon.** Marketing spend is rendered as a **lighthouse/beacon** on your property whose
beam sweeps the map edge. Where the beam touches, visitors spawn. Beam brightness = spend, beam
reach = channel targeting. Ad budget becomes a literal, adjustable, physical object.

**3.3.2 The Billboard.** Buildable signage at the map entrance. Bigger/better art = higher spawn rate.
Comically upgradeable from a cardboard sign to a neon monolith. Also a great place to display the
player's chosen company logo.

**3.3.3 SEO Garden.** Content/SEO is drawn as a garden plot on your property. Each content page is a
plant. Well-tended (updated) plants bloom and attract organic visitors; neglected ones wilt and
shrink your organic spawn rate. Bots pollinate. Utterly charming, mechanically sound, and it makes an
abstract system spatial.

**3.3.4 The Word-of-Mouth Web.** Satisfied visitors occasionally emit a thin gold thread back to the
map edge that becomes a *new spawn point*. Over time a happy site is surrounded by a glowing web of
referral threads. Reputation becomes visible topology.

**3.3.5 Uptime Trophy Wall.** Public status page drawn as a visible board on your storefront showing
the last 90 days as colored pips. Visitors *look at it* before entering — a little glance animation —
and a board full of red pips makes them turn around at the gate. The consequence of past outages is
rendered as an object the enemy AI... sorry, the *customers*, actually read.

**3.3.6 Price Tag Physics.** Your pricing is a literal price tag object. Raising price makes it
heavier: fewer visitors approach, but each one is worth more (drawn bigger/gold-er). The visitor
stream visibly thins and enriches. Instantaneous, wordless economics.

**3.3.7 The Free-Tier Firehose.** A separate, wider, paler-cyan gate for free users. Enormous volume,
near-zero gold. Some of them slowly turn gold over time (conversion) with a lovely color-fill
animation up the body. Watching a free user "fill with gold" is a genuinely great reward image.

**3.3.8 Referral Partner Pipes.** Partnerships draw a dedicated pipe from an off-map partner logo
straight into your gate, bypassing the normal approach path. Visually privileged traffic.

**3.3.9 The Conference Booth.** A seasonal event object; place it and a cluster of prospect sprites
gathers around it with speech-bubble icons. You "work the booth" by clicking them, each converting
into a lead-comet that travels to your sales desk.

**3.3.10 Status Page Theater.** During an incident, your public status page is a visible UI object
you must author — choosing between a green "all systems operational" lie (keeps visitors coming
short-term, reputation crater if caught) or an honest amber banner (fewer visitors now, trust
retained). The choice is literally a color you pick, which is a delightful bit of visual moralizing.

---

## 4. Buildables: Services and Infrastructure
### (Every buildable is a TOY first, a stat block second)

**Design law:** each buildable must have (a) a unique silhouette readable at 16px, (b) an idle
animation that shows it's alive and how hard it's working, (c) a visible "attack surface" marker set
that grows when you add it, and (d) a satisfying placement animation. If a buildable has no idle
animation, it will feel like a spreadsheet row.

**Universal visual grammar for buildables:**
- **Faceplate**: the front of the object carries its identity — an etched icon, a label strip, and a
  row of status LEDs. This is the primary read.
- **Load Donut**: a thin arc around/above the object showing utilization, colored on the
  green→orange→red ramp. Same widget on every buildable, everywhere, forever.
- **Port Studs**: small glowing nubs on the object where cables attach. Free ports glow faint cyan;
  used ports are solid. **Empty ports are an invitation; exposed ports are a risk** — and in fact any
  port reachable from the internet gets a small orange hazard chevron, which IS the attack-surface
  visualization.
- **Heat Plume**: a subtle rising shimmer proportional to power draw.
- **Upgrade Slots**: little notches on the top of the object; filled slots show inserted modules as
  physical chips/cards, so an upgraded machine *visibly bristles* with add-ons.

### 4.1 Compute

**4.1.1 Web Server (1U Pizza Box).** The starter. Flat, wide, two drive bays, a cyan-lit power button.
Idle: faint fan blur + one blinking activity LED that blinks *in time with actual request traffic* —
so LED cadence is a free load meter. Adds: inbound HTTP port (hazard chevron), and one more thing to
patch. Placement: slides into a rack rail with a satisfying two-stage click.

**4.1.2 App Server (2U).** Taller, gets a second CPU heatsink visible through a mesh grill. Runs hot;
bigger heat plume. Introduces runtime/framework attack surface, drawn as an extra faceplate badge
showing the framework's logo-glyph (which the bestiary then targets).

**4.1.3 Database Server (4U, the Vault).** Heavy, dark, reinforced corners, lots of drive bays, a
combination-lock glyph on the faceplate. Idle animation: drive bay LEDs chatter in a distinctive
"seeking" pattern. Its data is drawn as visible **stacked drawers** in the inspector. Adds: the SQL
Serpent threat class, replication lag visuals, and a giant backup obligation icon.

**4.1.4 Cache Node (Blue Ice Box).** Small, frosted, glowing pale blue, with a visible "hit rate"
gauge shaped like a thermometer. When a request hits cache, it **bounces off the cache node with a
bright ping and returns instantly**, never reaching the origin — the most legible performance
visualization in the whole game. Cache misses pass through with a dull thud. Adds: stale-data risk
drawn as cached items slowly yellowing.

**4.1.5 Worker / Queue Node.** A conveyor belt object. Jobs are visible boxes moving along it. Backlog
literally piles up at the belt's entrance. Scaling workers adds parallel belts. Nothing explains
async processing faster.

**4.1.6 Container Host / Orchestrator.** A shipping-container yard rendered inside one rack unit — a
gantry crane picks up and places little containers as pods scale up/down. Autoscaling becomes a
mesmerizing idle animation. Adds: registry supply-chain risk, and a visible control-plane node whose
compromise is catastrophic (drawn with a crown).

**4.1.7 VM Host / Hypervisor.** A machine with a glass front revealing floating translucent mini-
machines inside. Overcommit is shown by the mini-machines visibly overlapping and clipping through
each other — a brilliantly gross visualization of contention.

**4.1.8 Bare-Metal Beast (GPU box).** Enormous, loud, glowing, with visible GPU cards like magazines.
Massive heat plume (biggest in the game), massive power cable (thickest in the game). Its presence
visibly distorts your thermal and power overlays. Purely a flex object, and it should look like one.

**4.1.9 Edge PoP / CDN Node.** At Z4, a small satellite-dish node placed near a visitor tint cluster.
Its coverage is drawn as a translucent bubble on the map; visitors inside the bubble travel a much
shorter arc. Coverage-bubble placement is the entire game at Z4.

### 4.2 Storage

**4.2.1 NAS / SAN Array.** A wall of drive carriers with a beautiful individually-animated LED matrix.
RAID state drawn as a segmented ring. Rebuilds are the amber tension ring from 2.4.1.
**4.2.2 Object Store.** Rendered as an expandable honeycomb of hex cells that fill up with colored
blobs. Growth is visible as the honeycomb tiling outward. Adds: public-bucket misconfiguration — a
cell that's accidentally public is drawn *wide open with light spilling out of it*, visible from Z3.
**4.2.3 Backup Vault.** An offline, physically separate object with a visible **air gap** — a literal
drawn gap between it and everything else, with no cable. The one object in the game with no port
studs. Its correctness is signaled by the solid-vs-hollow checkmark from 2.4.11.
**4.2.4 Tape Robot.** A slow mechanical arm moving cartridges. Restores take visible minutes. Pure
charm, and it makes RTO a thing you *watch*.
**4.2.5 Log Aggregator.** A tower with paper-tape streaming out and coiling at its base. The coil's
size is your retention. Also the object you interrogate during a breach level, where the coil is
literally scrubbed through.

### 4.3 Network

**4.3.1 Switch.** A thin 1U with a row of 24 port LEDs that flicker in traffic patterns. The most
information-dense small object in the game — a switch's LED wall lets you read the whole rack's
traffic at a glance.
**4.3.2 Router / Border Gear.** Bigger, with a globe glyph. Owns the map-edge connection arcs.
**4.3.3 Load Balancer.** Drawn as a **physical flow splitter / manifold**: one thick pipe in, N pipes
out, with visible adjustable vanes. Weights are literal vane angles you can drag. Health-checking is
drawn as little green pulses it sends down each pipe; a failed backend's pipe visibly gets capped off
with a red plug. This is my favorite object in the design — it makes an abstract concept into a
piece of plumbing you can *see working*.
**4.3.4 Reverse Proxy / Ingress.** A gatehouse with a checkpoint arm. Every request pauses for a
frame. Rules are drawn as signs posted on the gatehouse.
**4.3.5 Firewall.** A crenellated wall segment with visible arrow slits (allowed ports). The picture
of your firewall config is literally how many holes are in the wall. Opening a port = punching a
glowing hole. **This single metaphor teaches attack surface better than any tutorial.**
**4.3.6 WAF.** A shimmering green energy lattice in front of the gatehouse. Hostile shapes that touch
it flash and dissolve; false positives are drawn as a *cyan* visitor dissolving too, with a small
guilty red "oops" pip — false-positive cost made visible.
**4.3.7 DDoS Scrubbing Center.** An off-map facility your traffic can be routed through, drawn at Z4
as a detour arc into a big filter icon; the ribbon goes in magenta-speckled and comes out clean cyan.
The detour adds visible arc length = latency. Perfect tradeoff picture.
**4.3.8 CDN Contract.** A translucent shell that wraps your whole property; static assets get served
from the shell with a bright short-circuit ping instead of traveling to your origin.
**4.3.9 VPN / Bastion.** A single guarded door on the back wall with a spotlight on it. All admin
access must walk through it, drawn as staff sprites queueing at it. Removing direct admin ports is
visualized as walls sealing up.
**4.3.10 Private Interconnect / Peering.** A dedicated dark-fiber arc between two of your sites,
drawn thicker, straighter, and with a distinctive braided texture. Visually "premium."
**4.3.11 Anycast Constellation.** At Z4, one IP drawn as a shared glyph at many nodes simultaneously,
with visitor arcs snapping to the nearest. The snapping animation is the whole joy of it.
**4.3.12 Cable Tray & Patch Panel.** Cosmetic-mechanical: a patch panel object that *reduces visual
clutter* by letting you route many cables through one tidy path. Buying it is buying legibility,
which is a rare and lovely thing for a game to sell you.

### 4.4 Defenses and operational tooling

**4.4.1 IDS/IPS Sentry.** A slowly rotating scanner dish on top of a rack emitting a visible sweep
cone. Things caught in the cone get outlined. Detection ≠ prevention: IDS *outlines* and logs; IPS
*shoots*. The visual difference between an outline and a beam is a great way to teach that.
**4.4.2 Rate Limiter Turnstile.** A physical turnstile on the path. Excess visitors visibly bunch up
behind it. Mis-tuned limits are instantly visible as a crowd of cyan circles stuck at a turnstile.
**4.4.3 CAPTCHA Gate.** A puzzle-arch. Bots dissolve; real visitors pause (patience ring drains a
notch) and some annoyed ones *leave*. The cost of security friction is rendered as literal lost
customers, which is the truest thing in the whole game.
**4.4.4 Honeypot.** A fake, slightly-too-shiny server with an exaggerated "VALUABLE" sticker. Attackers
divert to it, get stuck in a visible tar pit animation, and get tagged with a glowing marker that
reveals their future spawns. The tar pit bubbling is a great idle animation.
**4.4.5 Patch Cart.** A wheeled cart a tech pushes down the aisle; machines it services flash green
and shed their "vulnerable" badges. Patch level is drawn as a small version pip on each faceplate;
out-of-date pips glow amber. A fleet with all-green pips is a beautiful sight and a real goal.
**4.4.6 Monitoring Wall (NOC screens).** A physical buildable — a wall of screens at the end of the
room. Building it *unlocks HUD features*: graphs, alerts, the Timeline Ribbon's forecast section.
**Buying UI as an in-world object** is a fantastic diegetic progression idea and gives the art team a
gorgeous hero asset.
**4.4.7 Alerting Pager.** A little device on the player's desk that buzzes and lights when thresholds
trip. At night, it's the only light on screen.
**4.4.8 Runbook Binder.** A shelf object; each written runbook is a labeled spine. Having the right
spine lets staff auto-resolve an incident (visualized as a staffer grabbing the binder and walking to
the problem). The shelf filling up is meta-progression you can see.
**4.4.9 Chaos Monkey Cage.** An optional buildable containing a visibly agitated little creature you
can release to break your own things during safe hours. Its cage rattles. Pure comedy, real mechanic.
**4.4.10 Staging Environment.** A **ghost-colored duplicate** of part of your topology, drawn in
translucent blueprint style on a separate small platform. Deploys go there first; bad deploys break
the ghost harmlessly. Visually, it's your topology's shadow.
**4.4.11 Canary Deploy Rig.** A splitter that sends 1% of traffic (a visibly thin thread) to the new
version. The thread turns red if error rate rises, before the main ribbon is affected. Watching a
single thin red thread while the main ribbon stays cyan is exquisite tension.
**4.4.12 Secrets Vault.** A small safe with a spinning dial. Credentials stored in it are drawn as
keys *inside*; credentials left in config files are drawn as keys lying loose on the floor, visible
to anyone who walks by (including the Insider). Devastatingly clear.

### 4.5 Facility

**4.5.1 Rack.** The container object. Its door can be mesh (better airflow, exposed) or solid
(quieter, hotter). Front/back are distinct views you can flip between — **the cable-management back
view** is its own satisfying scene.
**4.5.2 UPS.** A battery cabinet with a charge bar and an audible hum. Its bar is one of the few
always-on-screen non-HUD meters.
**4.5.3 Generator.** Outside the building, with a fuel gauge and an exhaust animation. The fuel gauge
is the clock in any power scenario.
**4.5.4 PDU / Busway.** Power is drawn as a **thick black spine** with tap-off boxes. Overloading a
circuit trips a visible breaker that physically flips to OFF, and everything downstream goes dark in
a cascade you can trace with your eye.
**4.5.5 CRAC / Cooling Unit.** Blows visible cold mist. Its throw distance is drawn; racks outside
the throw run hot. Cooling layout becomes a spatial puzzle with a literally visible solution.
**4.5.6 Hot/Cold Aisle Containment.** Translucent curtains/doors. Installing them visibly *sharpens*
the thermal overlay's boundaries — the heat map goes from a smeared gradient to crisp zones. Watching
the overlay clean up is the reward.
**4.5.7 Raised Floor / Overhead Tray.** Choice of routing plane; changes where cables are drawn
(under vs over), which is a pure aesthetics-and-legibility choice the player gets to make.
**4.5.8 Fire Suppression.** Ceiling nozzles. When it fires, a white gas flood animation fills the room
and everything inside goes into a brief frozen silhouette state. Rare, spectacular, terrifying.
**4.5.9 Loading Dock.** Where new hardware arrives by truck. Deliveries are a visible logistics stage
— crates sit on the dock until staff rack them. **Lead time becomes a physical object sitting in a
doorway.**
**4.5.10 Security Door / Mantrap / Cameras.** Physical security drawn as doors, badge readers, and
camera cones. An uncovered camera cone gap is where the Insider walks.
**4.5.11 The Office.** A small attached area where staff sprites live between tasks: desks, a coffee
machine, a whiteboard that shows your current architecture as a scribbled diagram (auto-generated
from your real topology — a lovely diegetic minimap).
**4.5.12 Meet-Me Room.** At colo tiers, the shared carrier room drawn as a neutral zone where your
cable meets many carriers' cables. A beautiful spaghetti set-piece you *can't* tidy, by rule.

### 4.6 Staff (people are buildables too, and they're the best animations)

**4.6.1 Junior Sysadmin.** Moves fast, fixes small things, occasionally causes a Bad Deploy (drawn as
a nervous little "oops" bubble). Wears a hoodie.
**4.6.2 Senior SRE.** Moves slowly and deliberately, fixes hard things, has a **visible aura that
reduces incident duration** for nearby systems. Drinks from a giant mug. Their walking speed being
slow is a joke and a mechanic.
**4.6.3 Network Engineer.** Carries a cable tester; can find the Loose Cable. Idle animation: tidying
cables, which visibly improves your cable-spline mess score. A staffer whose *idle behavior improves
the art* is a wonderful idea.
**4.6.4 Security Analyst.** Sits at the Monitoring Wall; their presence makes stealth threats
(Zero-Day Wraith, Nation-State) faintly visible — literally increasing the alpha on invisible
sprites. **Staff as a rendering modifier.**
**4.6.5 Support Rep.** Stands at the in-tray, pulls paper slips, walks to angry clients and turns
their mood ring back toward gold with a speech-bubble animation.
**4.6.6 Sales Rep.** Works the phone / the booth; converts Tire-Kickers. Drawn with a headset and a
little rising-arrow bubble on success.
**4.6.7 Night-Shift Tech.** Only visible in the night band. Their lonely little flashlight moving
through a dark room is a mood piece.
**4.6.8 DC Tech (remote hands).** At colo tiers, you don't own them — you *request* them, and they
appear as a differently-uniformed sprite who does exactly what the ticket said and no more, sometimes
comically literally.
**4.6.9 The Contractor.** Expensive, temporary, wears a visitor badge, leaves at level end.
**4.6.10 Burnout State.** Every staffer has a fatigue ring. Overworked staff move slower, their
sprite slumps, their error-chance pip appears. At full burnout they walk out the door, permanently.
Fatigue as posture is much better than fatigue as a number.
**4.6.11 Staff Skill Pips.** Little chevrons on the sleeve, earned by handling incidents. Visible
growth over a campaign; you get attached to the ones who've been with you since Tier 1 (matching the
asset-tag idea for hardware).

### 4.7 Software / logical buildables (drawn as modules, not boxes)

**4.7.1 CMS / App Stack.** Drawn as a stack of colored plates inside a server's cutaway view. Each
plate is a layer (OS, runtime, framework, app). **Vulnerabilities are cracks in specific plates**, so
"patch the framework" is visibly "replace the cracked plate."
**4.7.2 TLS Certificate.** The wax seal badge (2.4.7). Auto-renew upgrade replaces the draining seal
with a self-refilling one — an animation you can watch and trust.
**4.7.3 Auth Service / SSO.** A key-ring hub object all doors reference. Compromising it is drawn as
every door on the map flashing red at once — an unforgettable single-point-of-failure image.
**4.7.4 Rate Plan / Config Templates.** Drawn as stamped blueprint sheets you can apply to machines;
applying one plays the "fleet re-sync" wave from 2.4.6.
**4.7.5 Feature Flags.** Physical toggle switches on a panel. Flipping one live is visible and scary.
**4.7.6 Observability Agent.** A tiny antenna module you clip onto each machine. Machines without one
are drawn **fogged out** in the metrics overlay — "you can't see what you don't instrument," rendered
literally as fog of war over your own datacenter. Excellent idea; the fog-of-war-on-your-own-stuff
mechanic is unique and thematically perfect.

---

## 5. Unlocks and Discovery
### (Progression you can SEE accumulating — the tech tree as a physical artifact)

**Design law:** never show a locked node as a grey rectangle with a padlock. Every unlock should be
an *object that appears in your world*, and every discovery should be a *picture filling in*.

### 5.1 Tech-tree presentations (pick one; all are better than a grid)

**5.1.1 The Whiteboard Tree.** The tech tree lives on the office whiteboard as a hand-drawn marker
diagram. Unlocked nodes are drawn in confident black marker; available nodes are faint pencil
sketches; unknown nodes are literally **blank whiteboard**. Buying a node plays a marker-stroke
animation that draws it in. Sub-branches get drawn with different marker colors. Erased/abandoned
branches leave visible ghost smudges.

**5.1.2 The Rack Elevation Catalog.** Unlocks presented as a hardware vendor catalog you flip
through, with photography-style illustrations and spec tables. Locked items are printed but stamped
"CALL FOR AVAILABILITY." Buying one triggers the Loading Dock delivery cutscene.

**5.1.3 The Server Room Floorplan Blueprint.** The tree is literally a blueprint of a *future*,
larger facility; unlocking fills in rooms. Your tech tree and your map are the same drawing at
different times. Very strong identity.

**5.1.4 The Pegboard.** A workshop pegboard where every unlocked tool/part hangs on its hook with a
painted outline behind it. Empty painted outlines show what exists but isn't yours yet — the classic
"shadow board" look, which is *the* perfect visual for "here's what's missing."

**5.1.5 The Certification Wall.** Skills/process unlocks (ISO, SOC2, PCI) hang as framed certificates.
Each has a distinct seal. The wall filling up is corporate-maturity-as-decor.

### 5.2 Discovery mechanics that are visual by nature

**5.2.1 The Threat Bestiary (fill-in-the-blank).** Every threat starts as a **black silhouette card
with ??? fields**. Surviving an encounter fills in the silhouette; analyzing logs fills in its stats;
countering it three times reveals its "weak point" highlighted in green on the card art. The bestiary
is the single best art showcase in the game and it *earns* itself.

**5.2.2 Blueprint Fragments.** Some unlocks arrive as torn blueprint pieces from incidents, audits, or
poached staff. Collect 3 fragments and they animate together into a complete schematic. Tangible,
collectible, visual.

**5.2.3 The Post-Mortem Photo.** After each major incident you get a "polaroid" of the moment of
failure — an actual captured frame from gameplay with a caption. These go in a scrapbook and some
unlock a corresponding preventative buildable. **Using the game's own screenshots as progression
currency** is cheap to build and enormously charming.

**5.2.4 Reverse-Engineering the Attacker.** Capture a threat in a honeypot and its sprite appears in
your lab under a glass dome, dissected, with labeled parts. Studying it unlocks the counter. The lab
becomes a museum of things that tried to kill you.

**5.2.5 X-Ray Inspector.** Unlockable ability that lets you see *inside* any object (cutaway view with
the plate-stack from 4.7.1). Before you have it, internals are opaque. Literally unlocking vision.

**5.2.6 The Fog of Instrumentation.** As per 4.7.6 — parts of your own infrastructure you haven't
instrumented render fogged in analysis overlays. Buying observability is buying *sight*, and the fog
receding is the reward animation.

**5.2.7 Vendor Relationships.** Each hardware/software vendor is a logo card. Spending with them
raises a relationship bar and unlocks their premium line, drawn in that vendor's distinct house style
(one vendor is all brushed aluminum, one is all cheap blue plastic, one is aggressively gamer-RGB).
**Unlocks that change your art palette** make progression aesthetically felt, not just numeric.

**5.2.8 Staff-Carried Knowledge.** Hiring a senior from a bigger company unlocks nodes *they* know —
shown as them walking in and drawing new sections on your whiteboard themselves. If they burn out and
leave, the marker fades (but doesn't erase) — a visual for knowledge loss.

**5.2.9 The Conference Talk.** Attending/giving a talk unlocks a branch; rendered as a slide deck
cutscene with deliberately bad clip art. Giving a talk also spawns Press visitors.

**5.2.10 The Incident-Driven Unlock.** Getting hit by something new immediately adds its counter to
your available tree, greyed with a red "LEARNED THE HARD WAY" stamp. **Damage is progression, and the
stamp says so.**

**5.2.11 Open Source Contribution.** A community tree branch; contributing draws your logo onto an
off-map "community" board and unlocks free tooling. Visually, other companies' logos appear there
too, making the world feel populated.

**5.2.12 The Scale Threshold Reveal.** Certain unlocks appear only when your topology reaches a shape
— e.g., once you have 3+ web servers, the Load Balancer node *visibly appears* on the whiteboard with
a little "!" burst. The game noticing your architecture and drawing the next idea for you is a great
teaching moment and a great animation.

### 5.3 Unlock payoff animations (the dopamine)

**5.3.1 The Delivery.** Big hardware unlocks arrive by truck at the Loading Dock: doors open, a crate
slides out, a staffer uncrates it (packing foam flies), and the machine gets wheeled to the rack. ~8
seconds, skippable, and worth every frame.
**5.3.2 The Faceplate Reveal.** New machine types get a slow pan across their faceplate on first
placement, like a car ad. Once per type, ever.
**5.3.3 The Blueprint Stamp.** Process unlocks stamp a red "APPROVED" on a document with a
paper-thump.
**5.3.4 The Lights Come On.** Facility unlocks (new room, new floor) reveal by having the lights
switch on in sequence down the room. Always a winner.
**5.3.5 The Whiteboard Redraw.** When a major branch completes, a staffer walks to the whiteboard,
wipes a section, and redraws it cleaner. Your architecture *diagram* improving is the reward.
**5.3.6 Tier-Up Title Card.** Between tiers, a full-screen typographic card with the new tier's name
set in that tier's font (Tier 0 is a dot-matrix printout, Tier 5 is crisp modern sans). Typography as
progression, again.

---

## 6. Economy, Money, and Scoring
### (Money must MOVE on screen — never just a number that changes)

**Design law:** the player should be able to watch money flow through the facility, and should be
able to point at where it's leaking.

### 6.1 Money as a visible substance

**6.1.1 Coin Motes.** Every converted visitor emits gold diamond motes that **fly along an arc to the
cash counter** in the top bar, landing with a tick. Revenue rate is thus perceptible as the *density
of the gold stream* crossing the screen. When business is good the screen has a constant glittering
diagonal; when it's bad, the diagonal is empty. This is the game's most important economic visual.

**6.1.2 The Drain Lines.** Costs are the inverse: thin dark-gold threads leaking *out* of each
cost-bearing object toward a "burn" gauge. Power, bandwidth, salaries, licenses each have their own
drain thread. **You can literally see which rack is eating your money** — hover a drain to get its
label. Hosting is a margins business and this makes margins spatial.

**6.1.3 The Balance Column.** Instead of a number, cash is (also) a vertical column of gold in a
glass tube on the HUD edge, with a visible high-water mark from the level's start. Being underwater
is a picture, not a minus sign.

**6.1.4 The Burn/Earn Scale.** A literal balance scale in the top bar; income on one pan, costs on the
other. It tips in real time. Tipping the wrong way tints the HUD edges faintly red. One glance =
profitability.

**6.1.5 Payday Pulse.** On billing day, a big wave of coin motes floods in from all clients at once,
and a wave of cost motes floods out. The monthly rhythm is a visible heartbeat, and an outage right
before payday is visibly, painfully expensive.

**6.1.6 The Invoice Slip.** Each client's monthly payment is a physical slip that lands in a tray.
Failed payments land with a red corner (2.4.14). The tray is a satisfying end-of-cycle object.

### 6.2 Revenue stream visualizations

**6.2.1 Per-Visitor Ad Revenue.** Tiny motes, huge volume. Renders as gold dust.
**6.2.2 Subscription MRR.** A steady, rhythmic drip of larger coins from each client icon. Predictable
cadence — you learn the sound/rhythm of healthy MRR.
**6.2.3 Usage/Overage Billing.** Motes proportional to ribbon width; spiky. Drawn with a slightly
different, brighter gold so you can tell variable from fixed revenue by *color temperature*.
**6.2.4 Setup Fees.** A single big chunky coin with a satisfying weighty animation on client onboard.
**6.2.5 Managed Services / Support Contracts.** Gold flows from client → your *staff* → the counter,
so you see the labor path of the money. Understaffed support = visible bottleneck on a revenue path.
**6.2.6 Reseller / Wholesale.** A partner logo pipe delivering bundled coins less frequently but in
bigger lumps.
**6.2.7 Domain/SSL Add-on Upsells.** Small gold pips that pop up over a client's head as a purchasable
bubble you click — an "upsell whack-a-mole" micro-interaction that's fun for 30 seconds a level.
**6.2.8 The Enterprise Contract.** Drawn as a thick document with many signature lines. Signing is a
cutscene. The resulting revenue stream is a *pipe*, not motes — wide, steady, and terrifying to lose.

### 6.3 Cost visualizations

**6.3.1 Power Bill.** The black power spine glows faintly amber with draw; the meter on the wall spins
at a visible rate. You can watch your electricity bill spin.
**6.3.2 Bandwidth Bill (95th percentile).** Rendered as a histogram strip where the 95th-percentile
line is drawn as a bright marker you're trying to keep low. **A billing model visualized as a line
you can see being pushed up by spikes** is genuinely educational.
**6.3.3 Salaries.** Each staff sprite has a small recurring coin that peels off them on payday.
**6.3.4 Rent / Colo Fees.** A big monthly slab that drops onto the cost pan with a thud.
**6.3.5 Licenses.** Little stamped seals with expiry timers, same widget family as TLS certs.
**6.3.6 Depreciation / Aging.** The Entropy Dust shader doubles as a value indicator; old machines are
dusty *and* their resale value pip shrinks.
**6.3.7 Incident Cost Ledger.** During an outage, a red counter ticks up in the corner showing money
lost *this incident*, which stays on screen as a "post-incident receipt" for a few seconds afterward.
Brutal and motivating.
**6.3.8 SLA Credit.** When you breach an SLA, coins fly *backward* from your counter to the client,
with a little apology-letter glyph. Watching money reverse direction is uniquely painful.

### 6.4 Scoring and rating

**6.4.1 The Four-Dial Scorecard.** End of level shows four large analog dials: **Uptime, Profit,
Growth, Security**. Each with a needle and a lettered band. Dials are more memorable and more readable
than bars, and they suit the hardware aesthetic perfectly.
**6.4.2 The Nine-Pip Rack Rating.** Overall grade rendered as a mini rack elevation with 1-9 lit U's.
Fits the theme, scales to any screen size, and makes a great save-file thumbnail.
**6.4.3 The Uptime Ribbon.** The level's full timeline replayed as a thin strip of colored pips —
green seconds, amber degraded, red down. It's your status page for that level, and it's the single
most honest scoring artifact possible.
**6.4.4 The Blueprint Card.** The archived final topology (see 1.2.5), which is both a trophy and a
shareable image.
**6.4.5 Visitor Sankey Summary.** How many arrived, how many bounced and *where*, how many converted.
The grey leak branches are where the player's lesson lives.
**6.4.6 The Wall of Ghosts.** A memorial showing every visitor you lost, as a field of small grey dots
— the volume of the field is the sting. Optional toggle for players who find it too sad (which is the
sign it's working).
**6.4.7 Star Ratings as Real Reviews.** Reputation shown as a review page with generated one-liners
tied to actual events ("site was down when I tried to buy — 1 star"). Text generated from your telemetry
makes the score feel earned.
**6.4.8 Win/Lose framing.** Win = the lights stay on and the balance column is above the high-water
mark; the camera pulls back and the facility hums. Lose = a slow full-desaturation of the board, the
fans spin down one by one in sequence, and the last thing on screen is a single blinking cursor.
**Losing should be quiet, not explosive.**
**6.4.9 The Margin Band.** A persistent thin band at the top edge showing profit margin as a colored
gradient strip. Players who never look at numbers will still absorb "we're in the green band."
**6.4.10 Comparative Ghost Run.** Overlay a faint replay of your previous attempt's revenue curve so
improvement is visible as beating a ghost line — standard racing-game trick, underused in strategy.

---

## 7. Core Gameplay Mechanics
### (Interaction design, answered as: what does the player's hand actually do, and what does the screen do back?)

### 7.1 Connecting things — THE central interaction (answered in detail)

This is the question the brief singles out, so here are several fully-specified options plus a
recommendation.

**7.1.1 "Drag the Cable" (RECOMMENDED PRIMARY).**
Click-and-hold on a **port stud** of the source object. A cable end appears attached to your cursor,
drawn with real slack — it sags under gravity with a light physics sim, which instantly makes it feel
tactile. While dragging:
- Every **compatible** port in the world lights up with a soft cyan halo and a gentle bobbing motion.
  Incompatible ports dim to 20% opacity. **The whole board self-documents on drag.**
- The cable's color previews the link type (copper = orange-brown, fiber = yellow, internal = grey).
- A live "ghost label" floats near the cursor: `web-01 :80 → ???`.
- If you hover a valid target, the cable **snaps** with a magnetic pull, the target's port stud
  brightens, and a small preview card appears showing what this link will do ("+DB access, +SQLi
  surface, +12W, latency 0.4ms").
- Releasing plays a **two-stage click**: connector seats, then the retention clip snaps. Screen-shake
  is zero; the feedback is entirely in sound + a 3-frame port flash.
- Releasing on empty space drops the cable, which dangles and retracts with a little whip.

**7.1.2 Connection representation once made.**
A persistent cable drawn as a **catenary spline** with:
- **Color** = link class (public/untrusted = a subtle hazard-striped sheath; private = plain).
- **Thickness** = provisioned bandwidth.
- **Animated dash flow** = actual traffic direction and rate (dashes scroll; speed = throughput).
- **Glow pulse** = a burst in progress.
- **Sag** = load (a heavily loaded link sags visibly lower — a wonderfully intuitive "this link is
  straining" cue that costs nothing to read).
- **Fray/spark** = errors on the link.
- At Z3+, cables auto-collapse into **trunks**: a single thick sheath with a "×N" badge, expandable on
  hover into an exploded fan-out view.

**7.1.3 "Click-to-Link" (accessibility / speed alternative).**
Click source, click target. Between clicks, the same halo-highlighting occurs. Identical outcome, no
drag precision required. Both modes always available; the game never requires a drag.

**7.1.4 "Wiring Mode" (bulk editing).**
Press a key and the whole board flattens to a **schematic view**: objects become labeled nodes on a
neutral grid, all cosmetic art drops away, and links become clean orthogonal routed lines like a
circuit diagram. Ideal for big topologies. Toggling in/out animates the morph between "physical" and
"logical" views, which also teaches the player that they're the same graph. **Two renderings of one
truth, one keypress apart** — this is the answer to late-game readability.

**7.1.5 "Adjacency / Placement-Implied" (for the smallest tier only).**
At Tier 0, putting a box next to another auto-connects with a short jumper. Teaches the concept with
zero UI. The moment you reach Tier 1, explicit cabling unlocks and the tutorial points out that now
*you* decide what talks to what.

**7.1.6 "The Patch Panel" (late-game abstraction).**
Once you own a patch panel, connections are made in a dedicated **panel UI**: a grid of labeled jacks
where you drag short patch cords. Physically the cables route themselves tidily through the tray. This
is an unlockable that trades tactility for legibility — the player *chooses* when to give up the
pretty spaghetti for the clean panel.

**7.1.7 Link Policy Beads.** A link can carry small bead-like modifiers threaded on it: an encryption
bead (padlock), a rate-limit bead (hourglass), a firewall-rule bead (shield). Drag a bead from the
palette onto a cable and it slides into place. **Policy as physical jewelry on the wire** — instantly
inspectable, no submenus.

**7.1.8 Broken-Link Feedback.** A misconfigured or dead link goes **dotted and grey**, and traffic
that tries to use it visibly piles up at the origin port, then spills as bounce-puffs. You never have
to open a log to know a link is broken.

**7.1.9 Dependency Highlight.** Hovering any object dims the world and lights up **everything it
depends on (upstream, in cool blue) and everything that depends on it (downstream, in warm amber)**.
Two-color dependency tracing is the single best "what will break if I touch this" tool, and it's one
hover away.

**7.1.10 Blast-Radius Preview.** Hold a modifier key while hovering: a translucent red field expands
over every service that would fail if this object died. Before any risky action, you see the cost.

### 7.2 Placement

**7.2.1 The Ghost Build.** A held buildable renders as a translucent cyan blueprint ghost that snaps
to valid slots. Invalid slots render the ghost red with a specific reason glyph (no power / no space /
too hot / no uplink). **The reason is an icon, not a text error.**
**7.2.2 Slot Geometry.** Rack units are literal U slots; a 4U object shows its footprint as four
highlighted rails. Tetris-like spatial planning emerges naturally and is fully visual.
**7.2.3 Heat/Power Preview.** While holding a buildable, the thermal and power overlays auto-fade in
at 30% so you can see the consequences of placement *while* placing. Contextual overlays beat modal ones.
**7.2.4 Airflow Arrows.** Small directional chevrons show intake/exhaust on each object; placing a
box backwards is visible as chevrons colliding. A tiny detail that makes experts smile.
**7.2.5 Move vs. Rebuild.** Moving a live machine drags a visible tether of its existing cables which
stretch and complain (turn amber) if you exceed slack. Cable length as a spatial constraint.
**7.2.6 The Undo Ghost.** Undo replays the last action in reverse at 2x with a rewind-streak effect,
so you can *see* what got undone.

### 7.3 Pathing and flow

**7.3.1 Traffic Follows Topology, Not a Maze.** Unlike classic TD, the "path" is your architecture.
Visitors enter the gate and traverse your graph. The player shapes the path by shaping the stack.
Visually, this means **the cables ARE the lanes**, which unifies two systems into one picture.
**7.3.2 Path Length = Latency.** Each hop adds visible travel time. A visitor that must go
gate→WAF→LB→web→cache-miss→DB→back is visibly slower than one served at the edge. **Architecture
quality is legible as how far the little dot has to walk.**
**7.3.3 Branch Weighting.** At a load balancer, visitors visibly fan out along weighted vanes. Bad
weighting shows as one pipe crowded and another empty.
**7.3.4 The Short-Circuit.** Cache hits and CDN hits are drawn as the visitor stopping early and
*bouncing back happily* — a bright green ping and an immediate return. Optimization feels like
shortening a walk, which is an intrinsically satisfying picture.
**7.3.5 Backpressure Ripple.** When a downstream service saturates, an orange ripple travels
*upstream* along the cables to the components feeding it. You can watch congestion propagate. This
alone will teach players more about distributed systems than any tooltip.
**7.3.6 Threat Pathing Differs.** Threats don't queue politely — they seek the shortest route to
their goal type (DB-seekers head for vaults, volume attacks target the gate). Their pathlines are
drawn as **dashed magenta trajectories visible a moment BEFORE they move**, giving the player a
readable half-second of anticipation. Telegraphing is the core of fair TD, and here it's a line.

### 7.4 Upgrades

**7.4.1 Physical Module Insertion.** Upgrades are drawn as cards/sticks/modules physically inserted
into the object's slots (RAM sticks, NIC cards, extra PSU). The object visibly gains hardware.
**7.4.2 The Upgrade Wash.** A vertical band of white light sweeps up the object as the upgrade
applies, and the object's stats-ring visibly expands. Standard but essential.
**7.4.3 Tier Colors.** Upgrade tiers marked with a small chevron stack on the faceplate (I, II, III)
and a rim-light color shift (steel → bronze → azure). You can read a whole rack's upgrade level from
across the room by rim-light color alone.
**7.4.4 In-Place vs. Replace.** Some upgrades require downtime: the object goes dark, a "maintenance"
hatch pattern overlays it, and a countdown ring runs. Scheduling that inside a change window (1.3.8)
is a spatial-temporal puzzle expressed in two rectangles.
**7.4.5 Upgrade Regret.** Downgrades/removals are possible and animate as the module being pulled out
and dropped in a parts bin, recovering partial value. The parts bin is a visible object that fills up.

### 7.5 Resource management and overlays

**7.5.1 The Overlay Wheel.** Hold a key, a radial menu of overlays appears at the cursor: Power,
Thermal, Network, Security Surface, Money Flow, Latency Heat, Ownership/Tenancy, Maintenance Debt.
Each overlay recolors the entire board through a distinct, exclusive palette so you always know which
lens you're in. **Only one overlay at a time**, enforced, to protect readability.
**7.5.2 Overlay Border Tint.** When any overlay is active, the screen edge takes that overlay's color
as a thin frame — you can never forget you're in a filtered view.
**7.5.3 The Security Surface Overlay.** Renders every internet-reachable port as a glowing orange
pinprick and draws the reachable path from the map edge to it. A well-secured facility has three
pinpricks; a sloppy one looks like a lit Christmas tree. **Attack surface as literal brightness** is
the strongest single overlay idea here.
**7.5.4 Capacity Headroom Overlay.** Everything renders with a "fill level" like liquid in a glass.
At a glance you see who's nearly full. Great for right-sizing decisions.
**7.5.5 Maintenance Debt Overlay.** Shows the Entropy Dust amplified, plus patch pips, plus expiring
certs. A "chores to do" view.
**7.5.6 The Time Controls.** Pause / 1x / 2x / 4x drawn as physical transport buttons. Pause renders
the board with a subtle desaturation + a paused-scanline so you never mistake paused for broken.
**7.5.7 Slow-Mo Incident Cam.** When something catastrophic starts, the game briefly drops to 0.4x
with a vignette and a slight camera push toward the event. A cinematic beat that also gives the player
reaction time — mercy delivered as direction.

### 7.6 Failure states, rendered

**7.6.1 Degraded vs. Down.** Three visual states for everything: **Healthy** (full color, moving),
**Degraded** (amber hatch overlay, motion stuttering), **Down** (desaturated grey, motion stopped, red
X badge). Only three, used everywhere, no exceptions.
**7.6.2 The Cascade.** When a dependency dies, its dependents flip to Degraded in a visible wave
traveling *along the cables*, with a delay per hop. You can see the cascade coming and have a moment
to intervene. This is the best tension mechanic in the design.
**7.6.3 The Brownout Look.** Partial failure isn't binary; a service at 130% capacity renders with
dropped frames in its own animation and visibly refuses every Nth visitor. Partial failure is legible
as *intermittency*.
**7.6.4 The Company-Death Screen.** Running out of money: the lights go out room by room, staff walk
out one at a time, the last coin mote drops and doesn't reach the counter, and a repo truck arrives at
the dock. Slow, quiet, devastating.
**7.6.5 The Grace Timer.** Before a true loss, a visible "landlord at the door" object approaches over
several days, giving a spatial countdown to bankruptcy. Losing should always be *seen approaching*.

### 7.7 Micro-interactions worth naming

**7.7.1 The Rack Door Swing.** Click a rack door to open/close it; open = you see internals, closed =
tidy overview. A pure joy toggle.
**7.7.2 The LED Language.** A tiny, consistent grammar of blink patterns: slow pulse = idle, fast
flicker = busy, double-blink = warning, solid amber = attention, solid red = fault. Experts will read
the room by LEDs alone.
**7.7.3 The Label Maker.** Player can name objects; names print onto physical label-tape strips stuck
to the faceplate, in a monospaced label font. Unnamed objects show their auto-generated hostname in
grey. **Naming your servers and seeing the label appear is a huge emotional attachment hook.**
**7.7.4 The Cable Tug.** Dragging on a live cable makes it stretch and its traffic stutter — a tactile
warning against unplugging things, and a great accidental-discovery moment.
**7.7.5 Zoom-to-Alert.** Clicking any alert in the HUD does a smooth camera fly-to with a targeting
reticle that lands on the object. You never hunt for a problem.
**7.7.6 The Sticky Note.** Player can slap virtual sticky notes on objects. They render in-world,
slightly askew, and persist. Free player-authored annotation, zero systems cost.
**7.7.7 The Photo Mode.** Pause, free camera, depth of field, hide HUD. Players will make beautiful
pictures of their racks and post them, which is free marketing and costs one weekend of work.

---

## 8. Visuals and Presentation
### (The deep dive — this is my lens's home category)

### 8.1 Rendering and technique ideas

**8.1.1 Two-Tone Rim Lighting.** Every object gets a cool rim on one side and a warm rim on the other
(cold aisle / hot aisle motivated). This single lighting rule gives flat art depth and reinforces
airflow direction subconsciously.
**8.1.2 Emissive-Only Animation.** Keep base art static; animate only the emissive channel (LEDs,
screens, flow dashes, glows). Huge performance win, and it exactly matches the Substrate/Flow layer
split.
**8.1.3 Palette-Swap Skins.** Because the art is layered and mostly emissive-animated, alternate
skins (CRT mode, blueprint mode, corporate-vector mode) are palette + material swaps rather than art
redraws. Cheap content.
**8.1.4 The Dust Shader.** A global grime/entropy layer driven by maintenance debt (2.4.17). One
shader parameter carries a whole game system.
**8.1.5 Volumetric Aisle Light.** Thin god-rays from ceiling fixtures through the room's "dust" give
the datacenter its iconic look, and they subtly indicate airflow when they wobble near hot spots.
**8.1.6 Depth Fog by Altitude.** At Z3/Z4, distant parts of the facility fade into atmosphere so the
eye is guided to the center. Fights the "wall of identical tiles" problem.
**8.1.7 Screen-Space Label Culling.** Labels that would collide auto-hide, leaving only the most
important; a "declutter" pass runs every frame. Non-negotiable for scale.
**8.1.8 Iconographic LOD.** Each object has three art states: full art, simplified art, and pure
glyph. Transitions crossfade at fixed zoom thresholds. Authoring this from day one is the difference
between a game that scales and one that doesn't.
**8.1.9 Motion Blur on Flow Only.** Flow layer gets slight blur; substrate never does. Sells speed
without smearing the readable furniture.
**8.1.10 Silhouette Test Discipline.** Every asset must pass: fill it 100% black, shrink to 24px —
can you still name it? If not, redesign. Codify it as an art review gate.

### 8.2 Iconography system

**8.2.1 The Faceplate Glyph Set.** A single-weight, geometric icon family for service types: globe
(web), cylinder-stack (DB), snowflake (cache), fan-out (LB), shield (firewall), lattice (WAF),
conveyor (queue), honeycomb (object store), safe (vault), antenna (monitoring). Drawn once, reused at
every scale, on faceplates, in the build palette, in the tech tree, in the HUD. **One icon family
across all four altitudes is what makes the game feel designed.**
**8.2.2 Status Badge Corner.** Every object reserves its top-right corner for at most ONE badge, by
strict priority: Down > Breached > Degraded > Overloaded > Unpatched > Expiring > Attention. Never two
badges. Priority-ordered singular badges prevent icon soup.
**8.2.3 Threat Family Marks.** Each threat class carries a small family mark (flood = wave, exploit =
keyhole, physical = bolt, human = silhouette head, financial = coin) so unfamiliar threats are still
categorically readable on first sight.
**8.2.4 Verb Icons.** Actions get distinct marks: patch (bandage), restart (circular arrow), scale
(double chevron), isolate (dashed box), failover (branching arrow), rollback (reverse arrow). These
appear identically in tooltips, radial menus, staff speech bubbles, and the timeline.
**8.2.5 The Diamond/Circle/Triangle Law.** Restated because it must never be violated: money is
diamonds, visitors are circles, threats are triangles. Everywhere. Forever.

### 8.3 Effects catalogue (named, so they can be budgeted)

**8.3.1 FX_ScrubWave** — green sweep dissolving hostile particles (DDoS mitigation).
**8.3.2 FX_LatticeFlash** — WAF hexagon lattice flaring where a payload hits.
**8.3.3 FX_SnapThread** — session thread breaking with a twang and recoil.
**8.3.4 FX_FrostBloom** — ransomware crystalline spread across storage tiles.
**8.3.5 FX_DriftPile** — flood packets stacking physically against a server face.
**8.3.6 FX_CoinArc** — revenue mote flying to the counter (the most-played FX in the game).
**8.3.7 FX_BouncePuff** — grey visitor loss puff; merges into smog at density.
**8.3.8 FX_BreakerTrip** — a breaker physically flipping and a downstream darkness cascade.
**8.3.9 FX_SealDrain** — certificate wax seal depleting like a pie.
**8.3.10 FX_CascadeRipple** — amber dependency-failure wave traveling along cables.
**8.3.11 FX_Reseat** — two-stage connector click with port flash.
**8.3.12 FX_FleetSync** — configuration wave re-normalizing every faceplate.
**8.3.13 FX_ForensicDesat** — full-board monochrome for breach-analysis mode.
**8.3.14 FX_GhostSolidify** — blueprint ghost becoming real during migrations/builds.
**8.3.15 FX_TarPit** — honeypot bubbling and holding an attacker.
**8.3.16 FX_FanSpindown** — the death animation: motion ceasing, pitch falling.
**8.3.17 FX_LightsOn** — sequential room illumination for facility unlocks.
**8.3.18 FX_RansomOverlay** — intrusive full-screen ransom note that occludes UI.
**8.3.19 FX_PrismSplit** — traffic mix separating into component bands.
**8.3.20 FX_SagStrain** — a heavily loaded cable visibly sagging and creaking.

### 8.4 HUD and UI specifics

**8.4.1 The Timeline Ribbon (bottom).** A horizontal band, right-to-left, showing the next ~2 minutes:
incoming waves (sized silhouettes), scheduled maintenance (blue bands), billing events (coin glyphs),
cert expiries (seal glyphs), and known seasonal spikes. It is the player's planning surface. Hovering
an item shows a preview card; clicking pre-selects the relevant tool.
**8.4.2 The Alert Stack (right edge, above the inspector).** At most 5 alerts, stacked, each a slim
chip with an icon, an object thumbnail, and a severity bar. Older alerts compress into a "+7" chip.
Clicking flies the camera.
**8.4.3 The Inspector Faceplate.** Selected object shown as a technical-illustration portrait with
callout lines to labeled parts. Beautiful, informative, and it reuses style B art.
**8.4.4 Radial Build Menu.** Right-click on a valid slot for a radial of buildables filtered to what
fits there. Fewer clicks, fewer misplacements, and the radial's wedge colors match the build category
tabs so muscle memory forms fast.
**8.4.5 The Minimap as Whiteboard.** The minimap is drawn as the office whiteboard diagram — a
schematic, not a scaled-down copy. Schematic minimaps are far more readable for graph-shaped games.
**8.4.6 Diegetic Meters.** Wherever possible, the meter lives on the object, not the HUD: UPS charge
on the UPS, hit rate on the cache, queue depth in the queue. The HUD stays thin because the world
carries the data.
**8.4.7 The Hover Card Contract.** One consistent card layout everywhere: name, type glyph, three key
meters, links in/out, one line of "what's wrong." Never more. Consistency beats completeness.
**8.4.8 Number Typography.** Tabular-figure monospace for all numerics so digits don't jitter as they
tick. A tiny thing that makes the whole game feel professional.
**8.4.9 Color-Blind Modes.** Three presets that remap the hostile/friendly axis, plus a permanent
"shape tokens always on" option, plus a "pattern fill" mode where hostile flows carry a diagonal
hatch texture. Design for it up front, not as a patch.
**8.4.10 Reduced-Motion Mode.** Flow dashes become static gradient bars; particle storms become
density plates; screen shake off. The game must remain fully playable, and because meaning lives in
color+shape+position (not only motion), it will be.
**8.4.11 Audio-as-Visual Redundancy.** Every important visual event has a distinct sound with a
distinct pitch band (money = high tick, threat = low buzz, failure = descending, success = rising).
Players will learn to play partly by ear, which massively relieves visual load at scale.
**8.4.12 The Focus Dim.** Selecting anything dims the rest of the world 25%. Cheap, universal,
enormously effective at scale.
**8.4.13 Notification Discipline.** Non-critical events never pop; they accumulate in a digest bell.
Only Down/Breached interrupts. Protecting attention is a visual design responsibility.
**8.4.14 The Tutorial-Free Tooltip.** Instead of tutorial text, first-time objects show an animated
loop in the inspector *demonstrating* what they do with little dots moving through them. Show, never tell.

### 8.5 Readability at scale — specific tactics

**8.5.1 Aggregate, Don't Shrink.** Past a threshold, stop drawing individuals. Draw a plate with a
count and a mix bar. Resist the urge to show 4,000 dots.
**8.5.2 Color Budget per Screen.** At most 5 saturated hues visible at once. If a 6th system needs
color, it gets an overlay instead of a permanent color.
**8.5.3 Alarm Propagation (restated).** Bad states always bubble up to the parent glyph at coarser
zooms. No silent off-screen failures. Ever.
**8.5.4 The Row Rhythm.** At Z3, group racks into visually distinct rows with aisle gaps and row
letters painted on the floor (A, B, C). Spatial memory needs landmarks.
**8.5.5 Floor Paint & Signage.** Painted zone boundaries, directional arrows, "cold aisle" text on the
floor. Real datacenters do this for exactly the same reason: human wayfinding.
**8.5.6 Tenant Tinting.** Multi-customer floors tint each tenant's territory faintly. Never saturated
— tints are a 6% wash, enough to group, not enough to compete with the Flow layer.
**8.5.7 The Heartbeat Sync.** All idle animations run off one global clock so a healthy facility
*breathes together*. Desync is a symptom: a struggling machine visibly falls out of rhythm with its
neighbors. This is a stunningly elegant health visualization and it's nearly free.
**8.5.8 The Quiet Frame Test.** A design gate: with nothing wrong, the screen should be calm enough
that a single anomaly is immediately visible. If a healthy screen is already busy, cut effects until
it isn't.
**8.5.9 Named Camera Bookmarks.** Number keys jump to saved views (the DB row, the edge, the NOC).
Essential once the facility exceeds one screen.
**8.5.10 The Contrast Audit Mode.** A dev/accessibility toggle that renders everything in luminance
only, to verify the game is playable in greyscale. Ship it as a player-facing curiosity too.

### 8.6 Presentation moments (the game's "postcards")

**8.6.1 Cold Open.** Every level opens with a slow camera move through the facility, lights flicking
on, before control is handed over.
**8.6.2 The Wave Telegraph.** Before a big attack, the camera briefly pans to the map edge to show the
threat gathering — a horizon full of magenta. Classic, and it buys player preparation time.
**8.6.3 The Save.** When a mitigation catches a huge attack at the last second, a brief slow-mo + a
white flash + the Uptime Ribbon staying green. Celebrate defense, not just offense.
**8.6.4 The 100% Uptime Stamp.** A physical rubber stamp thumping onto the level card. Satisfying,
collectible, and a reason to replay.
**8.6.5 The Night Shot.** A scheduled quiet moment each level where traffic drops and the room is dark
and beautiful. Contrast is what makes the busy moments feel busy.
**8.6.6 Loading Screens as Rack Diagrams.** Each load screen is a labeled rack elevation or network
diagram with real (in-fiction) annotations. Even the loading screen teaches.
**8.6.7 The Credits Rack.** Credits rendered as an endlessly scrolling rack elevation with each
contributor as a labeled 1U. Perfect.

---
---

# EXPANSION PACK — Hosting-Type & Era Visual Variety
### (Organized under the same 9 category headings. The brief's core claim is that "hosting" means
### ANY kind of hosting; visually, that means the game needs a **skin system with teeth** — each
### business line changes palette, sprite vocabulary, signature meter, and signature failure image,
### while the structural grammar from sections 0-8 stays identical so the player never relearns.)

## The Business-Line Skin System (the visual chassis for all of this)

**Rule:** the *grammar* never changes (circles/triangles/diamonds/boxes, three-layer rendering, four
altitudes, the load donut, the status badge corner). The *vocabulary* changes per business line:
one accent hue, one visitor sprite family, one signature buildable silhouette, one bespoke meter, one
bespoke catastrophe image. That's five assets per hosting type — cheap, and enough to make each level
feel like a different game.

**The Business Line Placard.** Every level opens with a placard in the style of that business:
shared hosting gets a garish 2003 web banner; GPU hosting gets a sleek keynote slide; colo gets an
architectural site plan; the dial-up level gets a CD-ROM sleeve. **Tone is set before a single
mechanic appears.**

**The Multi-Line Facility.** When the player runs several businesses at once, each line's accent hue
tints its territory, and the Business Mix Bar in the HUD shows revenue share as colored segments. A
facility running 4 lines reads as 4 colored districts — spatially legible portfolio management.

---

## 1B. Levels and Scenarios — one visual identity per hosting type

**1B.1 Shared Web Hosting ("The Apartment Block").** Accent: municipal beige-and-teal. The server is
drawn as a cutaway tenement with hundreds of tiny lit windows, one per customer site. Visitors are
tiny and numerous. Signature meter: the **Density Gauge** (accounts per box) drawn as how tightly the
windows are packed. Signature catastrophe: **one tenant's fire spreads sideways** — a visible flame
crawling along the shared wall. The whole level is about watching a wall of windows for the one
flickering wrong.

**1B.2 Managed WordPress ("The Boutique").** Accent: warm rose/cream. Fewer, prettier customer sites,
each drawn as a framed gallery piece on a wall. Signature meter: **Plugin Jenga** — each site's stack
drawn as a literal wobbling tower of mismatched plugin blocks. Catastrophe: a tower topples and takes
the site with it. Comedy and dread in one image.

**1B.3 VPS / Cloud Instances ("The Glass Hive").** Accent: clean azure. Hypervisors are glass boxes
with floating translucent VMs (4.1.7). Signature meter: **Overcommit Overlap** — VMs visually clipping
through each other. Catastrophe: **noisy-neighbor bleed**, where one VM swells and physically crushes
its neighbors' volumes. A pure geometry metaphor.

**1B.4 Dedicated / Bare Metal ("The Stable").** Accent: gunmetal + amber. Each customer owns a whole
visible machine with their name on the label tape. Fewer objects, more detail per object, so this tier
gets the loveliest hardware art. Signature meter: **Provisioning Time** — an install progress bar
rendered as a physical OS-install screen on a crash cart. Catastrophe: a dead box that must be
physically replaced, with the whole delivery→rack→reinstall chain playing out in real time.

**1B.5 Colocation ("The Landlord").** Accent: concrete grey + hazard yellow. **Your tenants' gear is
gear you cannot touch** — rendered in a deliberately foreign art style (different faceplates, chaotic
cabling, one guy's rack with LED strips and an anime sticker). You sell **space, power, and cooling**:
your meters are square-footage, amps per cabinet, and BTU. Signature meter: the **Cabinet Power
Ledger**, drawn as a physical amp-clamp readout per cabinet. Catastrophe: a tenant trips a shared
breaker and you eat the blame — the cascade darkness spreads through *other people's* racks, which is
visually and emotionally novel. Tenants also physically walk your floor: little visitor-badge NPCs you
escort, which introduces a whole security-camera minigame.

**1B.6 Wholesale / Build-to-Suit ("The Shell").** Accent: architectural blueprint blue-on-white. You
build *empty buildings* and lease them. The art is construction: slab, steel, envelope, fit-out. The
gameplay is a construction timeline against a lease start date. Visitors are **a single enormous
tenant** whose arrival is a motorcade. Catastrophe: commissioning failure — the building is done and
the power isn't.

**1B.7 Game Server Hosting ("The Arena").** Accent: hot magenta-and-lime, deliberately loud, RGB
everything. Visitors are **player avatars** with little name tags and ping numbers floating above
them. Signature meter: the **Tick-Rate Metronome**, a visible pendulum on each game node that must
swing steadily; jitter is visible as the pendulum stuttering. Signature threat: **Booters** (a kid
with a stresser panel) and **Cheaters** (player sprites with a subtly wrong aura who ruin other
players' mood rings). Catastrophe: a lag spike drawn as every avatar on the server freezing mid-stride
and then rubber-banding backward — instantly recognizable to anyone who's played online.

**1B.8 Voice / VoIP / SIP ("The Switchboard").** Accent: bakelite black and brass. Calls are drawn as
literal **patch cords on an operator switchboard**, one per active call. Signature meter: **MOS
score** as the visible clarity/graininess of the cord's glow. Threat: **toll fraud** — a magenta cord
plugging itself in at 3 a.m. and racking up a visible international-rate meter. Catastrophe: a jitter
storm where every cord starts vibrating.

**1B.9 Email Hosting ("The Post Office").** Accent: manila and postal blue. Messages are envelopes on
conveyor belts; spam is a torrent of junk mail. Signature meter: the **Reputation Postmark** — your
IP reputation drawn as a stamp that gets progressively smudged and rejected. Catastrophe:
**blacklisting**, drawn as the postal gate slamming and every envelope bouncing back with a red
REJECTED stamp — a beautifully literal image of deliverability death. Delisting is a bureaucratic
minigame with forms.

**1B.10 DNS / Anycast ("The Signpost Network").** Accent: pale cyan on near-black; almost entirely a
Z4 level. Your nodes are signposts; queries are tiny fast motes that barely touch anything. Signature
meter: **query latency percentiles** drawn as a flickering candle whose steadiness is p99. Threat:
**cache poisoning** (a magenta mote that swaps a signpost's arrow to point at the attacker — you can
literally see a sign turn the wrong way) and **NXDOMAIN floods**. Catastrophe: your signposts go dark
and *every other business line you own* loses its visitors simultaneously. The level that teaches
"DNS is load-bearing" by making the whole map stop.

**1B.11 CDN / Edge ("The Constellation").** Accent: aurora gradients. Almost pure Z4. Content is drawn
as glowing cargo replicated outward across nodes; a cache fill is a visible shipment from origin to
edge. Signature meter: **Offload %** drawn as how much of the origin's ribbon is dark (unused).
Catastrophe: a **global purge stampede** — every edge node emptying at once and the origin's ribbon
swelling to bursting.

**1B.12 Object Storage ("The Honeycomb").** Accent: amber hex. Growth is tiling. Signature meter:
**durability** as a count of visible replica shadows behind each object. Threat: the **public bucket**
(4.2.2) spilling light. Catastrophe: a correlated multi-drive failure that visibly punches a hole
through the honeycomb, with the erasure-coding rebuild animating as the hole knitting shut.

**1B.13 Backup / Archival / DR ("The Vault").** Accent: cold steel and deep blue, very quiet, very
still. This is the *slowest, calmest-looking* level type — and that's the point, because the threat is
invisible. Signature meter: **Restore Time (RTO)** drawn as a physical hourglass, and **bit-rot**
drawn as individual archive tiles slowly speckling with grey noise over time. Catastrophe: a restore
drill that fails — the tape robot fetches a cartridge, loads it, and the readout is static. Scrubbing
passes are drawn as a polishing wave that removes speckle. **A level where the enemy is entropy and
the weapon is a maintenance schedule** is a genuinely fresh visual proposition.

**1B.14 Offsite Tape Vaulting ("The Courier").** A logistics sub-mode: an armored van icon travels a
route on a small map between your DC and a salt mine. Tapes are physical objects with chain-of-custody
stamps. Threat: a lost van. Delightfully analog.

**1B.15 Video / Transcode / Live Streaming ("The Studio").** Accent: broadcast red tally lights.
Signature buildable: the **transcode farm**, drawn as a wall of ladder-diagrams turning one source
into many rungs (1080/720/480). Signature meter: the **ladder completeness** — missing rungs mean
viewers on bad connections get dropped. Live events add an **ON AIR** sign that turns the whole level
red when lit. Catastrophe: the stream buffers, drawn as every viewer's little spinner appearing at
once — a wall of spinning circles is a fantastic panic image.

**1B.16 Image / File Hosting / Seedbox ("The Warehouse").** Accent: cardboard brown and packing-tape
tan. Huge volume, thin margins, heavy bandwidth ribbons. Signature threat: **hotlinkers** (drawn as a
pipe siphoning your content to someone else's site with no coins coming back) and **DMCA notices**
(paper glyphs fluttering in). Catastrophe: an abuse-driven upstream null-route.

**1B.17 GPU / AI Compute ("The Furnace").** Accent: violet-white plasma, everything glowing.
Visually the **hottest, brightest, most expensive-looking** level type: enormous heat plumes, liquid
cooling loops with visible coolant flow and color, power cables as thick as pillars. Visitors are
**inference requests** (fast, tiny, latency-sensitive) and **training jobs** (enormous slow blocks
that occupy a whole cluster for a long time, drawn as a single huge crate sitting on many machines at
once). Signature meter: **GPU utilization + VRAM fill**, drawn as glowing bars inside each card.
Catastrophe: thermal shutdown of a whole pod, or a **liquid leak** — coolant drawn as a visible
spreading puddle, the single most alarming image available in the game. Also: **the queue** — a
visible line of pending jobs that is the customer-facing pain point.

**1B.18 HPC / Render Farm ("The Anthill").** Accent: industrial green terminal. Jobs are drawn as a
grid of tiles being colored in by many workers — you literally watch a render frame fill in. Signature
meter: **scheduler fairness**, drawn as a queue with customer-colored jobs; starvation is visible as
one color never advancing.

**1B.19 Crypto Mining Hosting ("The Boiler Room").** Accent: sickly gold-green, buzzing. Visually
maximal noise and heat, minimal elegance: open-frame rigs on plywood shelves, box fans, extension
cords. Signature meter: **power price vs. coin price**, drawn as two needles on a gauge whose crossing
point determines whether your tenants can pay. Catastrophe: the price crosses and every tenant
abandons their rigs in place, leaving you with a room full of derelict hardware and unpaid invoices.
**Ruins as a game state** — the level literally becomes an abandoned space.

**1B.20 Container / K8s / PaaS ("The Yard").** Accent: nautical navy and container-paint primaries.
The gantry-crane animation from 4.1.6 is the hero visual. Signature meter: **pod churn**, drawn as how
frantically the crane is moving. Catastrophe: a **crashloop**, drawn as the crane placing a container
that immediately explodes, repeatedly, faster and faster — genuinely funny and instantly readable.

**1B.21 Serverless / FaaS ("The Mayfly Field").** Functions are drawn as tiny creatures that spawn,
do one thing, and vanish in under a second. The board *sparkles* with ephemeral life. Signature
meter: **cold start**, drawn as a brief grey chrysalis phase before the creature is active —
you can see cold starts as a stutter in the sparkle rhythm.

**1B.22 DBaaS / Managed Search / Queues ("The Library").** Accent: oxblood and brass. Indexes drawn as
card catalogs; replication as scribes copying ledgers; lag as a visible gap between the master ledger
and the copy. Catastrophe: **split brain**, drawn as two ledgers diverging with an angry red seam
between them.

**1B.23 Bulletproof / Anything-Goes Hosting ("The Back Alley").** Accent: neon sign glow on wet
asphalt, permanent night. Revenue is enormous and drawn in a *different, slightly wrong gold*.
Customers arrive hooded, pay in advance, ask no questions. Signature meter: the **Heat Gauge** — a
literal rising temperature bar of law-enforcement and upstream-provider attention. Catastrophe: an
upstream cuts you off, or a raid — the doors come in and your gear gets carried out in evidence bags.
**A level where the visual language is deliberately seedy** gives the game enormous tonal range, and
the moral tension is expressed purely in palette.

**1B.24 Regulated Hosting — HIPAA / PCI / FedRAMP ("The Clean Room").** Accent: clinical white, matte
surfaces, everything labeled. Visually the *most orderly* level type: aligned cables, uniform
faceplates, signage everywhere, a visible compliance boundary drawn as a painted line on the floor.
Anything crossing that line without proper marking flashes. Signature meter: **Control Coverage**
drawn as a checklist wall. Catastrophe: an auditor finds an unencrypted path — drawn as a single red
thread crossing the white floor, visible from any altitude.

**1B.25 GDPR / Data-Residency ("The Border").** At Z4, national borders drawn on the map; data is
tinted by residency. Watching a green (EU) data mote cross a border and turn red is the entire
mechanic, rendered.

**1B.26 Financial Exchange Colo ("The Microsecond Cathedral").** Accent: obsidian and gold. Cable
lengths are *equalized by law*, rendered as beautiful coiled excess fiber on every rack — a real-world
detail that looks amazing and explains itself. Signature meter: **nanoseconds**, drawn as a
ludicrously precise readout. Catastrophe: one tenant gets a 40ns advantage and the others riot
(visually: angry client sprites with lawyers).

**1B.27 Dial-Up ISP (period level, ~1996) ("The Modem Wall").** Art style C territory. A literal wall
of modem banks with blinking rows; visitors are **phone calls** that seize a line. Signature meter:
the **busy signal ratio** — how many callers get a busy tone, drawn as visitors bouncing off a wall of
occupied lines. Catastrophe: AOL sends a CD to everyone and your line count is instantly inadequate.
Beige, CRT, 4-color, and a dot-matrix printer that prints your nightly stats.

**1B.28 BBS / Shell Accounts / IRC Leaf ("The Terminal Room").** Pure text-mode aesthetic; the whole
game renders as ANSI art with box-drawing characters. Users are named handles in a userlist. Threats
are trolls, floods, and nukes. Catastrophe: an IRC netsplit drawn as the userlist tearing in half.
A gorgeous, cheap, and beloved visual detour.

**1B.29 Usenet Feed / Web Ring ("The Firehose and the Chain").** Usenet: an unstoppable torrent of
articles you must store or drop, drawn as a waterfall filling barrels. Web ring: your site is a link
in a visible circular chain of other sites; a broken neighbor breaks the ring and you watch traffic
stop flowing around it.

**1B.30 Satellite Ground Station ("The Dish Field").** Accent: desert tan and sky. Visitors arrive in
**passes** — a satellite crosses overhead on a visible arc and you have a finite contact window drawn
as a closing wedge. Miss the window, lose the data. Time-boxed gameplay expressed as orbital
mechanics; stunning at Z4.

**1B.31 Edge / 5G MEC ("The Roadside").** Micro-datacenters drawn as street cabinets at intersections
and tower bases. Tiny footprints, harsh environments (heat, vandalism, a car hits one). Fleet
management at scale with almost no eyes on site — so the **fog of instrumentation** (4.7.6) is the
whole level.

**1B.32 IoT Backend ("The Swarm").** Millions of tiny devices, each sending a trickle. Visitors are
**dust-sized**, only ever visible as aggregate ribbons. Signature threat: a firmware bug that makes
every device retry simultaneously — a thundering-herd image of the entire swarm converging at once.

**1B.33 Blockchain Node Hosting ("The Ledger Wall").** Blocks arrive on a rhythm; your nodes must stay
in sync, drawn as a visible chain of blocks per node with fork divergence shown as branching. Falling
behind is visible as a shorter chain.

**1B.34 The Pivot Level.** An explicit scenario: your current business line is dying (visible as the
accent hue slowly desaturating over the level) and you must stand up a second line before the first
goes grey. **Two palettes on screen, one fading and one growing** — the clearest possible picture of a
business pivot.

**1B.35 The Era Slider (meta-progression).** A campaign that walks from 1995 to now: the art shifts
from beige/CRT → 2000s blue-gel/chrome → 2010s flat white → modern dark-mode/violet AI. Same
mechanics, four complete visual eras. Hardware silhouettes change (tower → pizza box → blade →
multi-node sled → OCP rack → liquid-cooled AI pod), cabling changes (coax → cat5 → fiber →
direct-attach), and the UI chrome changes era with it. **Progression felt as design history.**

---

## 2B. Threats — per-hosting-type visual mixes

**2B.1 The Threat Palette Shifts With the Business.** Hostile magenta stays constant, but each
business line gets its own *threat texture*: game hosting's attacks are jagged and fast; email's are
papery and numerous; backup's are slow and creeping; GPU's are thermal and electrical; colo's are
*human*. The player feels the business change through how danger moves.

**2B.2 Booter Kids (game hosting).** A tiny sprite at a laptop with a visible web panel UI floating
beside them showing "attack: 300s". The attack is a crude, enormous, dumb magenta cone. Its charm is
that you can see the *timer* — you know exactly how long to hold.

**2B.3 The Cheater (game hosting).** Not an attack on you — an attack on your *visitors*. A player
sprite with a subtly wrong aura who makes nearby player sprites' mood rings drop. Anti-cheat is a
detection cone that reveals them in bright outline, and the ban animation (a lightning yank off the
server) is a crowd-pleaser.

**2B.4 Spam Cannon (email).** A truck backing up to your mail gate and dumping envelopes. Filtering
is drawn as a sorting machine; false positives are drawn as a *legitimate* envelope going into the
shredder with a small guilty red pip — the deliverability tradeoff made visible.

**2B.5 Snowshoe Spammer (email).** Low volume from very many sources — visually the opposite of the
cannon: a thin, wide drizzle from every edge of the map at once.

**2B.6 Reflection via Your Own DNS (DNS hosting).** Your signpost gets used as the Amplifier Horn
(2.1.3) against someone *else*, and the visual is your own node blasting a cone off-map while an
angry abuse-complaint glyph flies in. Being the weapon instead of the target is a fresh image.

**2B.7 Cache Poisoning (DNS).** A signpost's arrow physically rotating to point the wrong way, and
visitors dutifully walking off toward a hostile node. Horrifying and elegant.

**2B.8 Bit Rot (backup/archival).** Grey speckle creeping across archive tiles (1B.13). No creature,
no sound, no alert — it only exists if you *look*. The most quietly terrifying threat in the game.

**2B.9 Tape Library Jam (backup).** A mechanical arm freezes mid-motion with a red fault light. The
whole vault stops. Mechanical failure rendered as literal stuck machinery.

**2B.10 The Silent Restore Failure (backup).** See 2.4.11 — the hollow checkmark. Business-line
specific and devastating.

**2B.11 Coolant Leak (GPU/HPC).** A spreading puddle sprite with a rising reflection; electrical
hazard arcs at the edge. Emergency response is a visible drain-and-isolate sequence.

**2B.12 Power Phase Imbalance (colo/GPU).** Three phase bars in the PDU widget drift out of level; the
visual is a see-saw tipping. Fixing it is redistributing cabinets — a genuinely spatial puzzle.

**2B.13 Tenant Gone Rogue (colo).** A tenant's rack starts emitting hostile triangles from *inside*
your building. You can't touch their gear — you can only pull their port, drawn as a dramatic,
contractually fraught, physically visible action (a technician walking over and unplugging someone
else's fiber while their logo flashes).

**2B.14 Unescorted Visitor (colo).** A badge-less sprite wandering your floor. Camera cones and door
logs are how you catch them. Physical security as a stealth-detection minigame.

**2B.15 Cage Tailgating (colo/regulated).** Two sprites entering on one badge swipe — a one-frame
animation you have to actually notice, or catch later in the access-log overlay.

**2B.16 Chargeback Wave (bulletproof/low-trust).** Coins flying backward from your counter en masse
with credit-card glyphs. A financial attack rendered exactly like an SLA credit but larger and uglier.

**2B.17 Upstream Null-Route (image/file/bulletproof).** Your own provider cuts you: at Z4 your arc to
the transit provider goes dead-grey from *their* end, which is visually distinct from your own failure
(the dead segment starts at the far node). Attribution rendered as direction.

**2B.18 DMCA / Abuse Paper Storm.** Paper glyphs accumulating in an inbox; ignore them and the inbox
overflows into an upstream complaint, then a null-route. A paperwork threat with a physical pile.

**2B.19 The Copyright Bot Sweep (video/file).** A scanner drone variant that fingerprints your stored
content and flags matches with a visible stamp on the offending object.

**2B.20 Transcode Storm (video).** A single upload of a 4K master spawns a visible explosion of
sub-jobs that saturates the farm. Fan-out rendered as literal fan-out.

**2B.21 Toll Fraud (VoIP).** See 1B.8 — the 3 a.m. cord. Its tell is the *time of day*, so the day/night
band (1.2.4) becomes a threat-detection tool.

**2B.22 SIP Scanner Chorus (VoIP).** A constant, ambient, tuneless chirping of registration attempts,
rendered as tiny cords repeatedly trying to seat and failing. Audio-visual ambience as threat texture.

**2B.23 Crypto Tenant Overdraw (mining host).** A tenant quietly plugs in more rigs than their
contract allows; the visual tell is the amp-clamp readout creeping past its marked line while the rack
looks fine. Reading *meters* instead of *objects* is the skill this teaches.

**2B.24 Model Exfiltration (GPU/AI).** A slow, low-and-slow data transfer out of a training cluster —
drawn as a thin, almost invisible thread leaving a very expensive box. The Nation-State visual
grammar (2.3.5) applied to a modern asset.

**2B.25 Prompt-Injected Tenant Workload (AI hosting).** A tenant's job starts making *outbound*
requests it shouldn't. Drawn as a friendly job crate sprouting a magenta tentacle that reaches for
your internal network. Egress filtering is drawn as a one-way gate.

**2B.26 The Thundering Herd (IoT/serverless).** Every client retrying at once after an outage —
rendered as the entire swarm converging into a single spike that kills you *while you're recovering*.
The most important second-order failure in the game, and it must be visually unmistakable: a huge
cyan wall, not a magenta one. **Sometimes your own customers are the DDoS.**

**2B.27 Netsplit (IRC/retro).** The userlist tearing in two.

**2B.28 Modem Line Fault (dial-up).** One modem in the bank blinks wrong forever; finding it in a wall
of 96 identical blinking LEDs is a Where's-Waldo minigame, which is *exactly* what it felt like.

**2B.29 Satellite Pass Missed (ground station).** The wedge closes and the data doesn't come. Failure
as an astronomical certainty you cannot argue with.

**2B.30 Regulator Walkthrough (regulated).** The inspector from 1.3.5, but with a business-specific
checklist and the ability to shut your floor down — his final stamp is either a green seal or a red
one, and the red one ends the level.

**2B.31 The Correlated Failure.** Meta-threat: two things that *look* independent fail together
because they share something you forgot (same power feed, same firmware, same expiry date, same
upstream). The visual payoff is the post-mortem overlay drawing the hidden shared dependency in bright
white — the "oh, THAT's why" line. This should be the game's signature learning moment.

---

## 3B. Visitors and Clients — what "a visitor" looks like per business

**3B.1 The Visitor Sprite Family Swap.** Same circle grammar, different costume per business line:
page-load (plain dot), player (avatar with ping tag), backup job (a crate with a size label), inference
request (a fast glowing spark), SIP call (a cord), email (an envelope), stream viewer (an eye glyph),
colo tenant (a whole business-suited entourage), DNS query (a near-invisible mote). **One shape, many
costumes** keeps the read universal while making each level feel new.

**3B.2 Duration Classes, Rendered.** Visitors now come in three durations, each drawn differently:
**instant** (a mote that pops), **session** (a dot with a persistent thread), and **resident** (a
tenant/job that *occupies a slot for the whole level*, drawn as a physical object sitting on your
hardware). A GPU training job and a 5-year colo lease are the same class visually — big, heavy,
immovable — which unifies wildly different businesses under one readable idea.

**3B.3 The Colo Tenant Tour.** A prospective tenant walks your actual floor with a clipboard, and
*what they see* is scored: tidy cabling, clean floor, working signage, no alarms. **Your visual
housekeeping becomes literal revenue.** This is the single best justification for the cable-tidiness
system, and it makes an art-quality metric into a mechanic.

**3B.4 The Game Player's Ping Tag.** Floating over every player avatar; green under 30, amber under
80, red beyond. A whole server's health readable as a cloud of colored numbers.

**3B.5 The Backup Window.** Backup customers arrive as a nightly convoy of crates during a visible
window band; if the window closes before the convoy is unloaded, jobs fail. Batch workloads rendered
as literal logistics.

**3B.6 The Inference Burst.** AI customers send spiky, latency-critical sparks. Their patience rings
drain in *milliseconds* — drawn as an extremely fast drain that makes latency viscerally urgent.

**3B.7 The Training Whale.** One customer, one enormous crate, one month. Drawn occupying a whole pod.
Losing it mid-run (a crash at 80%) destroys weeks of visible progress — a progress bar resetting is
the oldest and best pain in games.

**3B.8 The Stream Audience.** Viewers drawn as a crowd whose *size* is the concurrency number, with a
visible chat-scroll waterfall beside them. A buffering event turns the crowd's eyes to spinners.

**3B.9 The Reseller.** A client who brings *their own* client swarm — drawn as a single figure
trailing a flock. Losing the reseller loses the flock in one visible exodus.

**3B.10 The Enterprise Procurement Delegation.** Arrives as a slow-moving group of three: the
engineer, the lawyer, and the CFO, each with their own satisfaction meter and their own icon. You must
satisfy all three. A multi-headed customer is a great visual joke and a real sales truth.

**3B.11 The Churn Walk.** Universal across businesses: a leaving client packs visible boxes, their
racks/instances grey out one by one, and their logo peels off the door. **Churn should take long
enough to hurt and be reversible until the truck leaves**, giving the player a visible window to
intervene (a support rep sprinting over with a discount glyph).

**3B.12 The Migration-In Ramp.** New clients don't appear instantly; their data/services stream in
over time as a visible fill bar on their allocated space. Onboarding as a loading animation you can
watch and accelerate.

**3B.13 Satisfaction as Posture.** Across all businesses: happy clients stand tall and glow faintly
gold; unhappy ones slouch, dim, and emit ticket-paper. Posture reads at 12px; numbers don't.

---

## 4B. Buildables — business-specific hero objects

**4B.1 The cPanel Tower (shared).** A machine with hundreds of tiny lit account windows on its face.
**4B.2 The Plugin Jenga Rack (managed WP).** Visible wobbling stacks per site.
**4B.3 The Hypervisor Aquarium (VPS).** Glass-front box with floating VMs.
**4B.4 The Crash Cart (dedicated/colo).** A wheeled monitor+keyboard a tech pushes to a sick machine —
the most beloved object in any real datacenter, and a perfect diegetic "open the console" UI.
**4B.5 The Cage (colo).** Chain-link enclosure you sell by the square foot, with a visible door log.
**4B.6 The Busway Tap (colo/wholesale).** Selling power made physical: a tap box clicking onto an
overhead busway with an amp rating printed on it.
**4B.7 The Tick Metronome Node (game).** The pendulum object from 1B.7.
**4B.8 The Matchmaker (game).** Routes players to the lowest-ping region; drawn as a rotating selector
that visibly picks an arc.
**4B.9 The SBC / Session Border Controller (VoIP).** A gatehouse for cords, with a fraud-detection
lamp.
**4B.10 The Mail Sorter (email).** Conveyor + sorting arms + a shredder. Tuning the sorter is dragging
threshold levers and watching false-positive pips.
**4B.11 The Anycast Signpost (DNS).** One glyph, many places (4.3.11).
**4B.12 The Edge Cache Pod (CDN).** A small node with a coverage bubble.
**4B.13 The Erasure-Coding Engine (object storage).** Draws shards fanning out to many nodes; rebuild
animates shards knitting back.
**4B.14 The Tape Robot (backup).** 4.2.4.
**4B.15 The Scrub Polisher (backup).** A slow wave that removes bit-rot speckle; watching it pass is
deeply calming and it is, mechanically, just a maintenance timer.
**4B.16 The Transcode Ladder (video).** A visible rung diagram per stream.
**4B.17 The Liquid Cooling Loop (GPU/HPC).** Visible colored coolant flowing through transparent
pipes, with flow rate and temperature drawn as color and speed. The prettiest object in the game.
**4B.18 The Busbar Cathedral (GPU).** Absurdly thick power delivery, drawn like architecture.
**4B.19 The Job Scheduler Board (HPC).** A physical queue board with customer-colored job tickets.
**4B.20 The Rig Shelf (mining).** Plywood and box fans. Deliberately ugly.
**4B.21 The Gantry Crane (containers).** 4.1.6.
**4B.22 The Chrysalis Pool (serverless).** Pre-warmed function shells drawn as glowing pods that
shorten cold starts. Buying warmth is buying the absence of a stutter.
**4B.23 The Compliance Boundary Paint (regulated).** A literal painted line you place on the floor;
everything inside it is in-scope and gets a white uniform look. **Buying a line on the floor as a
game object** is a wonderfully odd and thematically perfect buildable.
**4B.24 The Faraday Cage / SCIF (regulated/gov).** A sealed room with no visible network exit.
**4B.25 The Modem Bank (dial-up).** A wall of blinking lights (1B.27).
**4B.26 The Dish (satellite).** Tracks a visible arc across the sky; its motion is the level's clock.
**4B.27 The Street Cabinet (edge/MEC).** A lonely box at an intersection with weather effects.
**4B.28 The Abuse Desk (any).** A staffed desk that processes DMCA/abuse paper; without it the pile
grows. Rendering a business function as furniture keeps the ops-vs-business tension spatial.
**4B.29 The Sales Floor (any).** A room whose size gates how many prospects you can work at once;
visible headsets and a gong that rings on a closed deal. Yes, a gong.
**4B.30 The Escort Desk (colo/regulated).** Where tenant visitors check in; understaffing it is
visible as a queue of impatient suits in your lobby.

---

## 5B. Unlocks — unlocking whole business lines

**5B.1 The Business License Board.** A wall of framed licenses/logos, one per hosting line. Unlocking
a line unrolls a new banner and **recolors a wing of your facility** in that line's accent. Progress
is a building getting more colorful.
**5B.2 The Pivot Blueprint.** Unlocking a line comes with a starter blueprint that ghost-overlays your
facility showing where the new gear would go — so the unlock arrives as a *plan*, not a menu item.
**5B.3 Cross-Line Synergy Glyphs.** When two owned lines combine (CDN + video, backup + colo, GPU +
HPC), a small linked-rings glyph appears on the board and a bonus pipe is drawn between the two
districts. **Synergy visualized as new plumbing between colored districts.**
**5B.4 The Certification Seals.** HIPAA/PCI/SOC2/FedRAMP as distinct wax seals that physically gate
entry to their customer classes — a locked door with the seal shape as the keyhole.
**5B.5 The Era Unlock.** Advancing eras swaps the whole art kit (1B.35) and is presented as a
renovation cutscene: scaffolding, dust sheets, then the reveal.
**5B.6 Hardware Vendor Lines.** 5.2.7, extended: each business line has its own vendor set with its
own house style.
**5B.7 The Abandoned Wing.** Failed business lines leave a visibly derelict section of your facility
you can later refurbish — a permanent monument to a bad decision, and a great environment-art
opportunity.
**5B.8 The Trophy Rack.** One retired machine from each business line preserved in a lobby display
case with a plaque. Meta-progression as a museum.

---

## 6B. Economy — per-business money visuals

**6B.1 The Money Texture Per Line.** Revenue gold varies in *texture* by business model: shared
hosting is **dust** (many tiny motes), dedicated is **coins** (chunky, periodic), colo is **bars**
(few, enormous, quarterly), GPU is **ingots with a heat shimmer** (huge and volatile), bulletproof is
**crumpled bills** (dirty gold). You can identify your own business model by looking at your income
stream. This is a lovely, cheap, high-impact idea.
**6B.2 Margin Thickness.** Each business line's Burn/Earn scale is drawn with a visible gap between
the pans; thin-margin businesses (shared, file hosting) have the pans nearly touching, which *looks*
precarious. High-margin lines (colo power, bulletproof) have a wide, comfortable gap.
**6B.3 The Power Resale Meter (colo).** You buy power wholesale and sell it retail; drawn as two
meters side by side with the spread shaded gold. The single clearest picture of the colo business.
**6B.4 The 95th-Percentile Marker (bandwidth-heavy lines).** 6.3.2, promoted to a permanent HUD
element in file/video/CDN levels.
**6B.5 Capex Crater vs. Opex Drip.** Buying hardware shows as a sudden crater in the balance column,
with a **depreciation ghost** drawn as a slowly-refilling shadow showing value recovery over time.
Leasing shows as a steady drip instead. The capex/opex decision rendered as two shapes.
**6B.6 The Utilization-to-Revenue Bridge.** A HUD widget showing empty capacity as literal unsold
inventory — grey, unlit slots with faint price tags on them. **Empty racks should look like lost
money**, and this makes them look like it.
**6B.7 Churn as Leak.** Cancelled MRR drawn as a permanent hole in the income pipe until replaced,
with a visible patch animation when a new client fills it.
**6B.8 Price Elasticity Dial.** A physical dial per product line; turning it visibly thins or thickens
the inbound stream in real time (3.3.6 generalized). Different businesses have different elasticity,
drawn as how violently the stream reacts.
**6B.9 The Seasonal Curve.** Game hosting spikes on launch days and holidays; retail hosting spikes at
Black Friday; backup spikes at month-end; crypto swings with price. Each shown on the Timeline Ribbon
as a business-colored forecast curve. **The ribbon becomes a per-business signature you learn to read.**
**6B.10 The Contract Length Ruler.** Colo/enterprise contracts drawn as physical rulers of different
lengths — a 5-year lease is a long, reassuring bar in your revenue forecast; monthly shared hosting is
a pile of tiny stubs. Revenue *quality*, visualized.
**6B.11 The Abuse Discount.** Bulletproof hosting's gold is worth more but raises the Heat Gauge; the
HUD shows a literal exchange-rate-looking widget between "money" and "risk."
**6B.12 The Compliance Tax.** Regulated lines show a permanent overhead slice taken off the top of
every coin — drawn as each coin arriving with a visible bite out of it.
**6B.13 Scorecard Per Line.** End-of-level dials (6.4.1) gain a fifth dial when running multiple
lines: **Portfolio Balance**, showing whether you're dangerously dependent on one customer or one
business. Drawn as a pie that's uncomfortable to look at when one slice dominates.
**6B.14 The Concentration Warning.** If one client exceeds ~30% of revenue, their sprite gets a
visible gold crown and a faint red ring. A crowned client leaving is a game-over-shaped event, and the
crown telegraphs it constantly.

---

## 7B. Mechanics — what changes per business, interaction-wise

**7B.1 What You Connect Changes.** Web hosting connects services with cables; colo connects *power and
cross-connects* (you drag a power whip to a cabinet and a fiber to the meet-me room); DNS/CDN
"connects" by placing coverage bubbles at Z4; backup connects by scheduling windows on a timeline
rather than in space. **Four different connection verbs, one consistent drag-and-snap grammar.**
**7B.2 The Time-Axis Connection (backup/batch).** Some links are made on the *timeline*, not the map:
you drag a job's bar onto a window band. Same drag feel, different surface. Introducing a second
"board" (time) for businesses whose problems are temporal is a strong structural idea.
**7B.3 The Contract Drag (colo/enterprise).** Selling space is dragging a **lease rectangle** over
floor tiles — literally drawing the customer's footprint. The negotiation is resizing that rectangle
against power and cooling constraints. Selling real estate as a marquee-select is instantly intuitive.
**7B.4 The Cross-Connect Order (colo).** You don't run the cable yourself — you file a ticket, and a
tech sprite runs it over a visible number of hours. **Latency in the *operations* layer**, drawn as a
person walking, is a fresh mechanic and very true to life.
**7B.5 The Sky Window (satellite).** A pass timer overlay; actions are only valid inside the wedge.
**7B.6 The Tick Budget (game hosting).** You allocate CPU to tick-rate vs. player slots with a slider
that visibly trades pendulum steadiness for crowd size. One slider, two pictures.
**7B.7 The Deliverability Slider (email).** Aggressiveness of spam filtering, shown as a live preview
of how many envelopes get shredded vs. how much spam gets through. Tuning a threshold while watching
both error types is a great, honest interaction.
**7B.8 The Durability Dial (storage/backup).** Replica count as a dial; each increment draws another
shadow behind every object and visibly eats capacity. The cost of safety, rendered.
**7B.9 The Residency Fence (GDPR).** Draw a fence on the Z4 map; data motes bounce off it. Policy as
level geometry.
**7B.10 The Escort Assignment (colo/regulated).** Drag a staff member onto an arriving visitor to bind
them; they walk together. Unbound visitors wander and trip alarms.
**7B.11 The Abuse Triage Sort (file/bulletproof).** Incoming abuse paper must be dragged into bins:
ignore / forward / takedown. A physical sorting interaction with reputational consequences.
**7B.12 The Multi-Board View.** When running several business lines, a top-level "portfolio" altitude
(call it Z3.5) shows each line as a district card with its own mini-dials. Switching lines is a camera
move, not a menu. **Never make the player leave the world to manage the world.**
**7B.13 Shared-Resource Contention Rendered.** When two business lines share power/cooling/bandwidth,
the contested meter shows both lines' colors pushing against each other (1.3.7's tug-of-war). Portfolio
tension made visual.
**7B.14 The Era Control Scheme Shift.** In retro levels, the UI itself becomes period-appropriate:
text-mode menus, function-key hints along the bottom, a blinking block cursor. **The interface is a
costume too**, and swapping it is the strongest possible signal that the rules have changed.

---

## 8B. Visuals — how the look shifts per hosting type and era

**8B.1 The Five-Asset Skin Kit.** Restated as a production spec: per business line ship (1) accent
hue + secondary, (2) visitor costume, (3) one hero buildable silhouette, (4) one bespoke meter widget,
(5) one bespoke catastrophe FX. Everything else is shared. This is what makes 25 hosting types
affordable.
**8B.2 Material Language Per Line.** Shared hosting = scuffed beige plastic. VPS = frosted glass.
Dedicated = brushed steel. Colo = raw concrete and galvanized mesh. GPU = black anodized aluminum and
plasma glow. Backup = matte navy and rubber. Retro = yellowed ABS. Bulletproof = wet neon on grime.
Regulated = clinical white laminate. Materials carry identity even in silhouette.
**8B.3 Lighting Per Line.** Game hosting is RGB-lit and moody; regulated is flat, even, shadowless
fluorescent; backup vaults are dim with pools of light; GPU halls are lit by the machines themselves;
the dial-up ISP room is lit by a single desk lamp and 96 LEDs. **Lighting alone should identify the
business.**
**8B.4 Sound Palette Per Line.** (Visual design's twin.) Shared hosting hums; GPU roars; tape vaults
click and whirr; modem banks screech; VoIP chirps; colo is oppressively loud white noise. Muting the
screen should still tell you where you are.
**8B.5 Era Kits.** Four complete visual eras (1B.35), each with its own hardware silhouettes, cable
types, UI chrome, typography, and color grading. Ship them as campaign chapters, then as free-play
skins.
**8B.6 The Density Signature.** Each business has a characteristic *screen density*: shared hosting is
crowded with tiny things; wholesale colo is vast and nearly empty; GPU is few-but-enormous; serverless
sparkles. Density itself becomes an identity cue, and it protects readability by never letting two
adjacent levels look the same.
**8B.7 The Visitor Rhythm Signature.** Traffic cadence per line: web is smooth diurnal, game hosting
is evening-peaked and spiky, backup is a nightly pulse, email is steady, satellite is a burst every
90 minutes, inference is chaotic. The Timeline Ribbon's silhouette becomes a business fingerprint.
**8B.8 Cross-Line Visual Collision Control.** In multi-line facilities, cap simultaneous accent hues
at three; additional lines render in a neutral steel treatment until the camera enters their district.
Enforced by the color budget rule (8.5.2).
**8B.9 The Skin Preview Room.** A cosmetic gallery where the player can see the same rack rendered in
every era and business skin. Pure fan service, and it doubles as an art bible.
**8B.10 Weather and Place (Z4).** Each region has a distinct environmental treatment: Nordic sites in
blue snow-light with visible free-cooling vents; desert sites in dust haze with enormous chillers;
coastal sites with salt-fog corrosion textures on the outdoor gear. **Geography visible as material
wear** is a beautiful, subtle way to make the map matter.
**8B.11 The Signature Frame.** Each business line has a subtly different HUD frame treatment (corner
brackets, rivets, rounded chrome, terminal box-draw). A glance at the screen edge tells you which
business you're in even in a screenshot.
**8B.12 Readability Stress Test Per Line.** Art gate: render the busiest possible moment of each
business line, then ask an outsider to point at "the thing that's wrong." If they can't in 3 seconds,
the skin is over-decorated. Run it per line, not just once.

---

## 9. Anything Else
### (Modes, twists, humor, meta — all still through the visual lens)

### 9.1 Modes

**9.1.1 Sandbox / Dream Datacenter.** No threats, unlimited money, all skins and eras unlocked.
Purely a building toy with photo mode. Many players will spend more time here than in the campaign,
and it costs almost nothing once the art exists.
**9.1.2 Endless Rack.** Survive escalating waves in one facility; the visual hook is watching your
once-tidy room become a monument to emergency decisions — patch cables everywhere, tape, a fan on a
chair. **The room tells the story of the run.**
**9.1.3 Incident Mode (puzzle).** Hand-authored broken facilities; you get a paused board and a
limited number of actions to find and fix the fault. Pure diagnostic gameplay, and it's where the
dependency-highlight and overlay tools shine.
**9.1.4 Blind Mode.** Play with monitoring removed — the fog of instrumentation covers everything
until you build observability. Teaches the value of the thing it takes away.
**9.1.5 Photo Contest / Rack Gallery.** Share your facility as an image; community voting. The Blueprint
Card and Photo Mode make this near-free.
**9.1.6 Speedrun: Zero to Rack.** Timed build-out with a visible split timer; leaderboards.
**9.1.7 Co-op NOC.** Two players, one facility, separate camera bookmarks, shared alert stack. The
visual design need is a **presence indicator**: each player's cursor and camera frustum drawn on the
minimap so you don't both fix the same thing.
**9.1.8 Versus: Red Team / Blue Team.** One player builds, one player attacks. The attacker's UI is a
completely different, deliberately hostile-looking interface (terminal green, target lists, a stresser
panel) — **two art directions in one game** is a huge identity win.
**9.1.9 Ironman / One Facility, One Life.** Permadeath with a memorial blueprint card.
**9.1.10 Chill Mode.** No fail state, ambient soundtrack, gentle traffic. The datacenter as a
zen garden. The Heartbeat Sync (8.5.7) is the whole appeal.

### 9.2 Twists

**9.2.1 The Camera Is a Camera.** A twist mode where you only see your facility through the *actual
security cameras and monitoring dashboards you built*. Uninstrumented areas are literally black. It
reframes the entire game around the act of seeing.
**9.2.2 The Investor Dashboard Lie.** Extended from 1.3.13 into a whole mode: you manage the reality
and the *presentation* separately, and the two screens slowly diverge.
**9.2.3 You Are the Attacker's Target Board.** An interstitial that shows *their* view of you: your
facility rendered as a scan result, a list of exposed ports and versions. Seeing yourself through
hostile eyes, rendered in the enemy's UI style, is chilling and instructive.
**9.2.4 The Ghost of the Previous Admin.** Inherited facilities contain undocumented gear, mystery
cables that go nowhere, and a label reading "DO NOT REMOVE — ASK DAVE." Dave is gone. Environmental
storytelling as tech debt.
**9.2.5 The Documentation Layer.** Objects can be documented (a diagram, a runbook, a label); documented
objects render with a small green corner fold, undocumented with a faint question mark. Over a
campaign, the visible ratio of folds to question marks *is* your operational maturity.
**9.2.6 The Rewind Post-Mortem.** After every major incident you can scrub the timeline and watch it
again with all overlays available, annotating frames. The post-mortem is a video editor.
**9.2.7 Weather Affects Everything.** Heat waves raise cooling costs and are drawn as a global warm
grade; storms threaten power; winter is free cooling and a cool grade. The *color grade of the level*
carries an economic variable.
**9.2.8 The Hardware Lottery.** Individual machines have hidden quality (a silent lemon, a golden
sample). Over time the lemon reveals itself through subtly worse metrics — and gets a hand-written
sticky note from your staff calling it cursed. Emergent superstition.
**9.2.9 The Legacy Box.** One ancient machine no one dares turn off, running something nobody
documented. It renders in the *previous era's art style* forever, a visible fossil in a modern room.
**9.2.10 Reputation Has a Face.** Your public reputation rendered as the crowd size outside your
front gate, always visible in the background. It never needs a number.

### 9.3 Humor (all visual)

**9.3.1 The Cat.** Present in Tier 0. Reappears as a datacenter cat in later tiers, sleeping on the
warmest rack (which is a *hint*). Sitting on a keyboard causes exactly one incident per campaign.
**9.3.2 Comic Sans Era.** Your Tier-0 logo, preserved in the trophy case forever.
**9.3.3 The Coffee Hazard.** A mug placed on a rack; if you never move it, eventually a disaster.
**9.3.4 The One Beige Server.** A mismatched machine you can never quite justify replacing.
**9.3.5 Cable Colors Nobody Agreed On.** An early-game cosmetic chaos that a "cable standards" unlock
fixes — and the before/after screenshot is the joke.
**9.3.6 The Vendor Rep.** Periodically appears with a golf umbrella and branded swag; accepting gifts
raises relationship and adds a tacky branded object to your office.
**9.3.7 Status Page Euphemisms.** Your auto-generated status text escalates comically:
"elevated error rates" → "degraded performance" → "service disruption" → a single word: "fire."
**9.3.8 The Monitoring Wall Shows a Game.** If uptime is perfect for long enough, a staffer puts a
game on one NOC screen. It's a sign of health, and it's funny.
**9.3.9 The Pager at 3 a.m.** A recurring visual gag: the little device on the desk, alone in a dark
room, buzzing. It's the loading screen for every night-shift incident.
**9.3.10 Certificate Expiry Is Always Someone's Fault.** The post-mortem polaroid for an expired cert
is always the same image: a calendar with a circled date nobody looked at.

### 9.4 Meta / production ideas

**9.4.1 The Art Bible as an In-Game Object.** The Skin Preview Room (8B.9) doubles as the team's own
style reference. Build the tool as content.
**9.4.2 Asset Reuse Discipline.** Every object is authored as: silhouette layer + faceplate decal +
emissive layer + material swatch. Business lines and eras are decal+swatch swaps. This is the single
production decision that makes the brief's scope achievable.
**9.4.3 Procedural Label Text.** Hostnames, asset tags, ticket numbers, and status-page copy generated
from real game state. Free flavor, infinite variety, and it makes screenshots feel authentic.
**9.4.4 The Diegetic Settings Menu.** Options rendered as a BIOS setup screen (retro era) or a modern
config dashboard. Even the menu carries the theme.
**9.4.5 Accessibility as a Feature, Not a Toggle.** Shape tokens, three CVD presets, reduced motion,
audio redundancy, contrast audit mode, scalable UI, and a "slow the game down" assist. Ship them as
first-class, named features in the options screen with previews.
**9.4.6 The Screenshot Watermark.** Photo Mode exports include a tasteful corner card with your
company logo, tier, and uptime score. Free social spread.
**9.4.7 Modding the Skin Kit.** Expose the five-asset skin kit to players so the community can add
hosting types. The structural grammar protects readability even in mods.
**9.4.8 The Tutorial Is a Job.** Onboarding framed as your first day: a senior hands you a clipboard,
walks you to a rack, and points. No modal tutorial boxes — a character physically gestures at things,
and the camera follows. **Tutorialization through staging and camera, not text.**
**9.4.9 The Ending.** The final shot: you at Z4, all regions green, and then the camera pushes all the
way back in to Z1 on the original beige tower from Tier 0, still running, still blinking, in a corner
of your biggest facility with a plaque under it. **The whole game's scale arc, delivered as one
camera move.**
