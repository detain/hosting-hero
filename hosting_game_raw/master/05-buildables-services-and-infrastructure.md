# 4. Buildables: services and infrastructure

*Every buildable in this game answers four questions: **what it does · what it costs to run · what it
connects to · what new risk it opens.** The fourth column is mandatory. A hosting company's real
defenses are at least half non-technical, so this category covers servers, storage, network gear,
defenses, facility plant, **staff**, and the entire business machine — the org chart is a tech tree
and every department is a tower.*

*Framing note: the hosting **type** changes per level (web, VPS, colo, game servers, GPU/AI compute,
backup/DR, CDN, email/DNS, object storage, streaming, bulletproof, regulated, retro dial-up ISP,
satellite ground station, …). Most buildables below are universal; where an entry is specific to one
line of business, a **Hosting types** line says so. §4.10 collects the hero objects that make each
line feel like a different game.*

---

## 4.1 Design rules for buildables

### The Three-Column Law
Every buildable has **three columns: what it gives you, what it costs to run, and what it lets in.**

**How it works:** There should be no pure upgrades. Ever. If a player can build something with no
downside, it should just be a default. Enforced in review: if a new buildable has no Friction, no
Surface, and no meaningful upkeep, **it is not allowed to ship.** Strictly-good items are
decision-destroyers.

**The two-clause rewrite (wave-2 correction):** the law as originally written is violated by at least
five of the document's own entries (cable label printer, DKIM/SPF, VoIP spend cap, SYN cookies, NTP
source) — and it *should* be, because a game where nothing is ever finished is exhausting. So:
1. **No strategic build may be a pure upgrade.** Anything that changes capacity, capability, revenue
   or reach must carry cost, friction, surface or complexity.
2. **A small, explicitly budgeted set of "hygiene" items may be pure wins** — cheap, obvious,
   unglamorous, and their entire design purpose is to reward the player for doing the boring thing.
   **Cap the set at ~12 items across the whole game**, and make them *cheap but not free*, so buying
   them is a statement about your priorities rather than a no-brainer nobody would skip.

**⚔️ Tension:** one reviewer wants the law absolute (no exceptions, period, because exceptions become
a loophole designers drive a truck through); another wants the hygiene carve-out because a game with
zero satisfying purchases is joyless. The carve-out with a hard cap is the compromise, but the count
must be enforced in review or the category silently grows.

**Audit list — the flagship entries that currently violate the law, and their fixes:**
- **Bot Fingerprinter** (§4.5) — see its entry: training period, model drift, poisoning, privacy
  cost, and "blocks without a reason."
- **Dunning Engine** (§4.9) — dunning fatigue, false-positive suspensions, schedule upkeep.
- **Circuit Breaker** (§4.5) — a threshold wrong in both directions, half-open flapping, and an open
  breaker *hiding* the underlying problem.
- **Cable Label Printer** (§4.7) — a label-accuracy stat that decays; a wrong label is worse than no
  label.
- **Runbook Automation** (§4.6) and **Provisioning Automation** (§4.10) — both described in
  superlatives with only upside; both need their inverse (automation running the wrong runbook;
  provisioning abuse at machine speed).

**Interacts with:** P2, §9.6.

**Variations and additions**

- **The Surface-for-Capability Law** — the same law restated as a table every buildable must fill in:
  *(capability, cost, upkeep, **new attack vector**)*. **That table IS the tech-tree design.** A
  buildable with no new vector is reserved for the late-game "hardened" tier, and the early game is
  deliberately naked wires.
- **The pre-purchase comparison panel** — before committing, a comparison/preview panel shows a
  buildable's stats side by side against the alternatives already on the board, and hovering or
  placing any buildable **visibly reveals the new threat types it exposes**. The law becomes
  something you *watch* rather than something you read.

### The Build Card
The most important UI element in the game.

**How it works:** Every build card shows **Capability, Cost, Upkeep, Latency, Friction, and a red
"Opens:" row of threat icons.** "Building this adds these three monsters to the game." It makes the
central tradeoff a reading-comprehension task rather than a hidden surprise.

**Rows added by wave 2:**
- **"Closes:"** — what this build *removes* from the threat pool. Almost every buildable also closes
  something, and a card that only shows "Opens" makes every purchase look one-sidedly scary. With
  "Closes" present, P2 becomes a genuine two-sided trade instead of a tax.
- **Lead time** — how long until it actually exists (see build time, below).
- **Blast radius** — how many customers depend on it once built. The single most useful number for a
  placement decision, and it belongs at the point of purchase.
- **Removal cost** — what it takes to get rid of it later. **Showing the exit cost at the entrance**
  is a genuinely novel UI idea and it directly serves the Regret Nodes concept.
- **Lifetime cost** and a **Tradeoff Bar** (a single two-sided bar: capability gained vs surface
  added).

**Visual layout spec:** a 3:4 card. **Top third** — the object's front-panel illustration, rendered
in its vendor's house dialect, on a neutral field. **Middle** — three columns matching the
Three-Column Law, *Gives / Costs / Opens*, with `Opens` in a boxed red row of threat glyphs, **always
the widest visual element even when it's short**, so the eye lands there. **Bottom strip** — six
micro-stats as tiny gauges rather than numbers: Cost, Upkeep, Power (W), Height (U), Latency (ms),
Friction (%). **Footer** — the one line "What does this let me charge for?" set in the Doc typeface
as if hand-annotated.
**Interacts with:** P2, §8.8 (the ghost preview shows the same thing while placing).

**Variations and additions**

- **Capex and opex as two separate numbers** — everything carries *both* a capex (build) figure and
  an opex (upkeep) figure. Attacks that only cost capex get cheap late; **opex taxes create the
  survival squeeze at scale**, and *maintenance debt* becomes the theme-native difficulty knob.
- **The three physical micro-bars** — price tags always include **rack units + power watts + heat
  output** as three micro-bars on the build ghost, so the player learns the physical vocabulary of
  the domain rather than an abstract currency number.

### "What does this let me charge for?"
Every upgrade tooltip carries this line.

**How it works:** If the answer is "nothing," it had better be defense. A simple discipline that keeps
the business layer present in every purchase.

### Every buildable is a toy first, a stat block second
The visual-design law.

**How it works:** Each buildable must have (a) a unique silhouette readable at 16px, (b) an **idle
animation that shows it's alive and how hard it's working**, (c) a visible attack-surface marker set
that grows when you add it, and (d) a satisfying placement animation. **If a buildable has no idle
animation, it will feel like a spreadsheet row.**

**The production gate (wave-2 addition):** correct and currently unenforced. A buildable is not
approved without **five checklist-able artifacts**: (a) its silhouette plate at three sizes, (b) its
assigned idle from the twelve-idle catalogue, (c) its placement animation, (d) its Build Card
composed, (e) its "Opens:" glyph row populated. No artifact, no ship.

**Variations and additions**

- **Glass Cannon vs Fortress axis** — the roster must explicitly contain some **high-output/fragile**
  and some **low-output/resilient** options *at every tier*, guaranteeing build diversity by design
  rather than by accident. If every tier's best object is the same shape, the toy box is one toy.
- **Upgrade paths that fork, not just scale** — each buildable's upgrade tree should **branch into
  specialised variants** rather than only scaling numbers. The firewall's third dial and billing's
  dunning branch already work this way; the rest of the roster should.
- **Synergy buildables** — certain adjacent or connected buildable *pairs* grant small bonuses, which
  rewards deliberate layouts. The Web+DB+cache tier-set bonus (§4.3) is the flagship instance.

### Universal visual grammar for buildables
Five — now six — elements every object carries.

**How it works:** **Faceplate** — an etched icon, a label strip, and a row of status LEDs; the primary
read. **Load Donut** — a thin arc showing utilization on the green→orange→red ramp; the same widget on
every buildable, everywhere, forever, **with stated thresholds and tick marks: green to 70%, amber
70–85%, red above, and a tick at the queueing knee**, so it teaches §7.1's hockey stick every time you
look at it. **Port Studs** — small glowing nubs where cables attach; free ports glow faint cyan, used
ports are solid, **hollow vs solid distinguishes drained from live**, and **any port reachable from
the internet gets a small orange hazard chevron, which IS the attack-surface visualization.** **Heat
Plume** — a rising shimmer proportional to power draw, in **three discrete grades rather than a
continuous value**, so "this one is hotter than its neighbours" is a comparison you can make by eye.
**Upgrade Slots** — notches on top; filled slots show inserted modules as physical chips and cards, so
an upgraded machine *visibly bristles* with add-ons. **Age Plate** (sixth element) — a small stamped
plate showing the object's generation, because age is the one state the grammar otherwise can't
express.

**Variations and additions**

- **Chassis-Family Icon Grammar / Machine Readability Code** — every buildable is the same box
  silhouette plus **one role badge**: globe = web, cylinder = DB, shield = firewall, fan = cooling,
  lightning bolt = cache, envelope = mail. All infrastructure shares a chassis grammar — squarish
  box + status LED strip + type decal + cooling fins — so new objects are instantly parseable, and
  each badge carries a small lore popup. **Learn once, read anywhere.**
- **Chassis Port-Lights (the Surface Rule)** — every device is drawn as a chassis with **visible
  rear-port LEDs**; opening a service *physically lights a new port* (green = serving, **red =
  exposed to the internet**). "Attack surface" is the count of red LEDs, and threats visibly home
  toward red ports. **Every build decision reads on the box itself.**
- **Hierarchy-of-Needs Towers** — a rack's service stack renders as vertical layers (power → cooling
  → network → compute → app), and deficiencies show as **missing floors, or smoke between them**.

### Buildable silhouette language — *CONFLICTING*

Both documents want a single shape code that tells you what a building *is* from its outline, and
they key that code to two different things — **what family the object belongs to** versus **whom the
object serves.** The two schemes assign opposite shapes to the same objects (a customer-facing web
tier is "monolithic" under one and "round" under the other), so only one can be the law.

#### Position A — family-by-role shape code *(master)*

**Network = angular, compute = monolithic, storage = rounded/bank-vault, staff = organic/desk-shaped,
defense = wall/gate language**, with health reading from a single shared LED-strip idiom so the eye
learns one grammar. This is the scheme the rest of this category is already drawn to: the DB is a
heavy cylindrical drum, the firewall is a crenellated wall segment, the switch is a thin comb, the
business functions are desks. Its virtue is that the silhouette tells you which *system* you are
looking at, which is what a player needs when hunting for "something that adds capacity."

#### Position B — round = visitor-facing, angular = defensive *(opencode)*

A consistent visual grammar keyed to **whom the structure serves**: **round = visitor-facing, angular
= defensive**, unified with the Escalating Threat Families scheme (§3's Threat Grammar Law) into one
shared art-direction system. Its virtue is that the board reads as *two flows* at a glance — the
customer lane and the threat lane — which is the game's central pillar rather than its taxonomy, and
it means the threat art and the buildable art are governed by one rule instead of two.

### The Exposure Chevron Count
Make the hazard chevrons countable.

**How it works:** The number of lit chevrons on an object *is* its attack-surface score, and the same
count appears on its Build Card's "Opens:" row and in the security overlay's brightness. Closing a
port visibly extinguishes a chevron with a small clunk. **Attack surface becomes a thing you can count
on the model** — P2 rendered as hardware.

**Variations and additions**

- **The Surface Rule at scale — rack aggregation** — hundreds of red port LEDs will not resolve past
  zoom 2. So: per-chassis LEDs exist at zoom 1; at zoom 2 the **rack edge shows a port-strip glow
  whose *flicker pattern* encodes the count**; at zoom 3 exposed surface renders as a count-chip.
- **Silhouette holes** — at rack scale the firewall's Swiss-cheese idea gets promoted to the rack
  itself: the rack's **silhouette grows visible openings** — actual gaps with hanging planks, not a
  texture change — so exposure is readable at every zoom, and re-sealing (tightening a rule) shows
  **welding sparks**. **The silhouette *is* the surface count**, and a firewall welds opened ports
  shut with animated plates.

### The Exposure Ring
Surface as floor geometry.

**How it works:** Every buildable draws a dotted ring on the floor (Signal layer) whose
radius/thickness = the attack surface it adds. Placing a DB makes a ring; exposing it publicly makes
the ring thicker and turns it magenta-tinted. **Build more, see more magenta** — the core tradeoff of
the whole game, rendered as one ring.

### The Attack Surface Rose
Per-object vulnerability, as a picture.

**How it works:** In the inspector, each object shows a small radial "petal" diagram — one petal per
threat class it is vulnerable to, petal length = severity. Stacking a WAF in front visibly *clips the
petals*. It is a before/after picture of hardening, and it is the clearest way to show that a defense
helps *this* object and not others.

### The Upkeep Drip
Opex as ambient motion.

**How it works:** Every object has a small gold droplet that falls off it at its upkeep cadence into
the money gutter. A facility full of gear *drips constantly*, so you feel opex as motion rather than
as a line item. Objects that *earn* (a cross-connect, a leased /24) drip **toward** you.

**Variations and additions**

- **Visible upkeep tickers** — every buildable also carries a small **ticker decal** with its monthly
  dollar figure dripping into a **drain pipe** beneath it; destroying or selling the object shows the
  pipe capping off. The economy is painted onto the objects and no spreadsheet is needed.

### The Truth/Face Pair Law
Generalized from "racks, front and back" — the best single observation in the visual work.

**How it works:** **Every** object has a Face (what it claims) and a Truth (what it is). A server's
face is a faceplate; its truth is the cabling and airflow behind it. A backup system's face is a green
check; its truth is the restore log. A status page's face is "all systems operational"; its truth is
the synthetic monitor. A staff member's face is their idle animation; their truth is the fatigue ring.
A business's face is the investor dashboard; its truth is the ledger. **A single flip verb — press F —
reveals the truth side of whatever you're looking at**, at every altitude, for every object class, as
a 0.4s rotation that preserves the selected object's screen position. This turns "everything is green"
from a theme into a *gesture*.

### The Idle Animation Catalogue
Twelve reusable idles cover ~120 buildables.

**How it works:** **Breathe** (fan blur modulating with load) · **Chatter** (LED cadence at request
rate) · **Seek** (storage LED pattern) · **Sweep** (a scanner or dish rotating) · **Meter** (a needle
drifting) · **Drip** (a valve or rate limiter clicking) · **Shuffle** (a queue advancing) · **Tend** (a
staffer performing micro-actions) · **Settle** (cables swaying fractionally) · **Vent** (heat shimmer
pulsing) · **Tick** (a clock or counter) · **Sleep** (an unpowered object with one standby pip).
**The assignment per family is what makes families read.**

### The Wear Channel Triad
Three separable wear channels, one shader, three game systems made visible.

**How it works:** **Dust** (maintenance debt — grey, even, accumulates on horizontals) · **Heat
stain** (thermal debt — brown, directional, above vents) · **Hand wear** (change debt — polished
edges, scuffed rails, peeling labels, accumulated *where hands touch*). A machine can be dusty and
cool, or spotless and heat-scarred, and those mean different things.

### The Faceplate Contract
One reading grammar, learned once.

**How it works:** Every buildable, at every zoom, presents the same four readable zones on its front:
**identity strip** (name/label, Dymo-tape aesthetic), **health LED cluster**, **capacity bar**, and
**port row**. At small zooms the zones collapse in a fixed priority: LED > capacity > ports > label.

### LED Grammar
Fixed, never violated.

**How it works:** **Slow green breath** = healthy · **fast green** = busy · **amber steady** = warning
· **amber blink** = predicted failure · **red steady** = fault · **red blink** = in-progress failure ·
**blue** = locate/identify (player-triggered) · **off** = no power. Colour plus *rhythm* gives ~8
states in a 2px dot, which is what makes the smallest zoom tier readable at all.

### The Locate Beacon
Lifted straight from real datacenter practice.

**How it works:** Clicking any object in a list makes its physical blue LED strobe and pushes a thin
vertical light column above it that's visible from any zoom. **The single best "where the hell is it"
UI in the game.**

### U-Height Silhouettes
Form factor is meaningful and visible.

**How it works:** 1U pizza box · 2U with visible drive bays · 4U storage with a full face of caddies ·
blade chassis with vertical slots · a tower on the floor for the early levels. **You can estimate a
fleet's character from its silhouette skyline alone.**

**Variations and additions**

- **The U number is the cost language** — U height is not merely a footprint, it is the first field
  on the price tag, so the player learns to think in rack units before they think in dollars.
- **Tier must survive greyscale and 40px** — at 40px and in greyscale the tier of a machine must
  still be legible from its outline alone. **The rack silhouette IS the tech level.**

### Armor Snap-Ons and Kitbashed Tiering
Upgrades you can see from across the room.

**How it works:** Upgrading security **physically bolts plating, mesh and antennas onto a chassis** —
the same node at level 1 and at level 10 reads like a character's gear progression. Upgrades bolt on
**readable parts instead of glow rings**: a tier-2 firewall gets a second crenellation row, the load
balancer gets a third spinner arm, the vault grows external ribs, and higher tiers add extra PSU
bricks, an antenna, or armour bands rather than a recolour.
**Interacts with:** the Upgrade Slots element of the visual grammar, U-Height Silhouettes, the
Platform Chassis.

**Variations and additions**

- **The retrofit discount** — replacing an old buildable with a newer tier **in place** is cheaper
  and faster than building fresh, so upgrading has its own economics and the board keeps its history.

### Cable Colour Code
Never used for anything else.

**How it works:** **Amber** = copper ethernet · **aqua** = fiber · **black/red** = power A/B feeds ·
**grey** = out-of-band management · **violet** = cross-connect to a tenant · **white** =
temporary/"we'll fix it later" (and it *stays* white, to shame you).

### Cable Physics
Small, cheap, enormously grounding.

**How it works:** Cables sag under their own weight, bundle when parallel, and get visibly tensioned
when you drag a device. Pulling a device out of a rack with cables still attached shows the cables
going taut and then a warning.

### The Vendor House Styles
Art direction as a game mechanic.

**How it works:** Four hardware dialects with distinct bezel geometry, LED arrangement, screw type,
label placement and material: **Institutional** (brushed metal, recessed handles, tasteful) ·
**Budget** (blue plastic, exposed screws, oversized sticker) · **Enthusiast** (RGB, mesh, aggressive
vents) · **Whitebox** (unbranded, blank bezel, hand-written label). The Junkyard acquisition level is
literally "four dialects in one rack," and the Acquisition Normalization Bar measures your progress
converting them.

### The Golden Image Tint
Standardization made visible.

**How it works:** Nodes built from your current standard image share an exact palette; any node that
drifts or was built ad-hoc renders a half-step off. A homogeneous fleet is *visibly* homogeneous,
which makes standardization feel good and config drift feel like a stain.

### Build Ghost
Placement preview.

**How it works:** A translucent cyan hologram with a footprint shadow, power draw and heat output
numbers floating beside it, and red hatching where it won't fit or would exceed a circuit. Rotate with
a key; the ghost's cables preview to the nearest valid ports.

### The Build Palette as a Pegboard
The purchase surface, the range read-out and the gauges, specified as one visual system.

**How it looks:**
- **Defense radii are gym-floor painted markings** that fade past zoom 2 — never translucent blue
  circles.
- Capacity-heavy builds (DB, cache, storage, queues) carry a tiny **water-tower-style roof
  fill-gauge**; a cluster shares one gauge on its grouping bracket.
- **One signature firing motion per defense, and no two alike** — the firewall swats (*bonk*), the
  WAF stamps a clipboard (*thunk*), the tarpit stretches goo, scrubbing whirlpools, the rate limiter
  slams a turnstile (*clack-clack*). **Verb = identity**, so attacks read across the whole map.
- The build palette itself is a **pegboard with painted silhouettes**: unowned is an empty tool
  outline, owned is the tool present, buying is the animation of hanging it up.
- Macro-builds appear as **translucent blueprint scaffolding** that queued staff construct over time;
  cancelling makes the workers shrug and walk off, with a partial refund.
**Interacts with:** the Build Ghost, §8.8's build catalogue, the Defense Off-State (§4.5).

### Starter Loadouts (the "class" objects)
A pre-wired architecture kit placed with one click at level start.

**How it works:** Three canonical picks teach the central tradeoff on the pick-one screen before the
first wave: **Lean Static** (cache + web only — zero DB surface, capped revenue), **Dynamic Duo**
(web + DB — the SQLi lane opens on day one), **Fortress Paranoia** (proxy + WAF + IDS — a latency tax
that repels whales). Each is a correct answer to a different level.
**Why:** it is the backbone of replay diversity and of ghost-races — two players' runs diverge from
the first click rather than from the twentieth.
**Interacts with:** the Three-Column Law, the Standard Build, §5 progression.

### The Placement Refusal Icon Set
Icons, not text, and drawn *where* the problem is.

**How it works:** ⚡ no power · 🌡 thermal · 📏 no U · 🔒 wrong zone/compliance · 🔌 no free port ·
⚖ floor load · 🚫 era-locked · 💧 leak zone · 🧯 suppression conflict · 📶 no path to the network ·
💰 can't afford. All one weight, all 20px, and **drawn on the offending rack rather than on the
cursor**, so the refusal also tells you where the constraint lives.

### The Rack Elevation as a Buy Screen
A second purchase surface that costs nothing new to build.

**How it works:** Open a rack's elevation (the flat front-on diagram); empty U slots are dark with
visible rails and threaded holes. **You can drag a build directly into a U slot from the elevation**,
and the elevation shows live amp and thermal budget bars down its side. This is how real capacity
planning is done, and it turns Rack U Tetris into a real interface rather than an abstraction.

### Construction Animation
Building isn't instant, and the birth is the reward.

**How it works:** Crate arrives at the dock → forklift/hand truck → unbox (packing-foam particles) →
rails go in → chassis slides in with a clunk → cabling → power-on POST (a beep and an LED sweep).
Roughly 4–8 seconds of pure gratification, skippable, and it makes the build queue a visible conveyor
of things being born.

### Decommission Animation
The reverse, with a joke attached.

**How it works:** Unplug, slide out, and the unit goes on a pallet by the door. **If you never haul
the pallet away, it piles up** — a visible, comedic e-waste debt that eventually blocks the dock.
**Interacts with:** ITAD contract (§4.9), loading dock (§4.7).

### Build time and cold start
Nothing is instant, and the time scale spans five orders of magnitude.

**How it works:** Ordering hardware takes real in-game time (with expedited shipping as a cash
option); provisioning takes time; warming a cache takes time; new servers take a few seconds to POST
with a visible boot sequence. **Panic-building mid-incident doesn't save you**, which enforces
planning. Pre-building during calm is the core strategic skill.

**The real tiers (wave-2 expansion):** **seconds–minutes** (POST, provision, boot, cache warm) →
**days** (hardware delivery, rack and stack) → **weeks** (vendor lead time, a new hire's start date) →
**months** (circuits, audits, certifications, IP allocations, a building permit, a utility feed).
And the asymmetry that defines planning: **decommissioning is fast and rebuilding is slow**, so every
capacity cut is a one-way door for months.

**The rule's necessary partner:** "panic-building doesn't save you" leaves the player with nothing to
spend money on during a crisis, which removes the genre's core pleasure. Pair it with the **Warm
Bench** and **Rentals and Burst** (§4.13) so the sentence becomes: ***"panic-buying doesn't save you;
panic-activating what you already bought does."*** That's a better lesson and a better minute of
gameplay.

### The Surface Budget
Capability/Surface as a **managed resource**, not a one-way ratchet. *The most important structural
addition wave 2 made to this category.*

**How it works:** P2 currently only goes one way — build things, permanently add monsters. Give it a
number and a valve. Every buildable carries a **Surface** value (1–10). Your **total Surface** is a
visible meter, and the wave generator's *composition* (not its size) is drawn from a pool weighted by
your surface profile: 40 points of application surface means the generator can afford SQLi,
deserialization and webshells; 6 points means it cannot.
The valve is three verbs the design otherwise lacks:
- **Decommission** — remove a service; surface falls immediately; you lose its capability and, if
  customers used it, you eat a churn event. (The missing counterpart to deprecation rot.)
- **Narrow** — restrict a service to fewer entry points (internal-only, one VLAN, one region). Costs
  flexibility, halves that object's surface.
- **Wrap** — put a Classify or Meter defense directly on its edge. Reduces *effective* surface at a
  latency cost.
**Why:** P2 is the design's best idea and it currently has no player agency inside it. A budget plus
three verbs turns "more capability = more monsters" from a punishment into a *strategy*.
**Interacts with:** P2, the Build Card "Opens:" row, the wave generator, §5.7 deprecation, the
Exposure Chevron Count.

### The Build Role Taxonomy (nine roles)
So the palette has a shape a player can navigate mid-fight.

**How it works:** Every buildable — not just defenses — is tagged with one of nine roles, and the
build palette is organised by them: **Capacity** (more slots) · **Throughput** (more bytes) ·
**Latency** (fewer ms) · **Classify** · **Contain** · **Detect** · **Recover** · **Revenue** (a thing
you can charge for) · **Policy** (a rule, not an object). The Coverage Grid (§4.5) reads from the same
tags.
**Why:** ~180 buildables organised by *what they are* (compute, storage, network, facility, staff,
business) is an encyclopedia ordering, not a decision ordering. A player mid-fight needs to find
"something that adds Capacity," not "something in the compute tier."
**Interacts with:** all of §4, §8.8 build catalogue, §5.5 branches, the Nine Defense Roles (§4.5).

### The Platform Chassis
Modular builds, far fewer distinct objects.

**How it works:** Instead of 40 distinct server types, you buy a **chassis** (1U/2U/4U, a power
envelope, a slot count) and fill its slots with **role modules** — compute, storage, cache, network,
accelerator. A "database server" is a 2U chassis with three storage modules and a memory module. The
same chassis can be **re-roled** later for the cost of a maintenance window.
**Why:** three wins — (1) it collapses an unmanageable palette into a composable one, (2) it makes the
hardware-obsolescence cascade and the Repurposing mechanic real (you re-role rather than re-buy), (3)
it makes "physical module insertion" the actual upgrade system instead of a visual flourish.
**Interacts with:** §4.2, §7.4 upgrades, §6.6 obsolescence cascade, the Upgrade Slots element of the
visual grammar.

### The Instance-Size Slider
The decision that dominates real capacity planning, made forty times instead of once.

**How it works:** On every chassis purchase, a slider between **many small nodes** (better failure
granularity, worse per-unit efficiency, more coordination overhead, more things to patch) and **few
large nodes** (cheaper per unit of capacity, bigger blast radius, harder to bin-pack). "Scale up vs
scale out" is currently stated as an abstract fork; as a per-purchase slider it becomes a habit.
**Interacts with:** the Platform Chassis, blast radius on the Build Card, cell-based architecture.

### The Two Jobs Rule
An authoring law for buildables.

**How it works:** A buildable may do one job well, or two jobs at 60% each — never two at 100%. The
cheap combined box (the "does everything" appliance, the all-in-one control panel, the single server
running web+DB+mail) is genuinely correct at small scale and genuinely a trap at large scale, and the
game should sell it cheerfully at Tier 1.
**Why:** it gives the early game a real, satisfying decision ("one box or two?") that is *correct*
early and *wrong* later — the best kind of progression, where the player outgrows their own choice
rather than being told it was wrong.
**Interacts with:** the Three-Column Law, Tier 1, §7.4.

### Warm-up and wind-down curves
Some builds ship at a fraction of their final value and improve over in-game weeks.

**How it works:** Generalise the email IP warm-up pool, which is currently the only build in the game
that takes time to become good. The behavioural fingerprinter *trains*; the SEO garden *grows*; a new
hire *ramps*; a cache *warms*; a reputation is *earned*; a runbook library *accretes*; a peering
relationship *matures*; an IP block's reputation *rehabs*. Symmetrically, some decay when unused:
runbooks rot, fingerprint models drift, restore confidence ages, peering contacts go stale.
**Why:** it makes *pre-building during calm* structurally necessary rather than merely advised, and it
creates a class of purchase whose value is "start it now, thank yourself in three waves" — the
emotional thesis of the entire design.
**Interacts with:** P3, §4.10, §5.7 rot.

### The Warm Bench
Capacity you own but don't run. **The honest burst answer.**

**How it works:** A distinct capacity class: hardware racked, cabled, powered down. Costs ~15% of
normal upkeep, occupies U and a power *reservation* (not draw), and takes 45–120 seconds to bring into
service with a visible boot sequence. Three grades, as an upgrade path: **Cold** (racked, 8 min,
cheapest) → **Warm** (powered, image loaded, 90s) → **Hot standby** (in rotation at zero weight, 3s,
full upkeep).
**Why:** the build-time rule correctly says panic-building doesn't save you, but that leaves the player
with *no* burst answer except serverless. The bench is the burst answer with an honest price, and it
creates the game's best peacetime-prep question: **"how much of my money is sitting idle so that a bad
Tuesday is survivable?"**
**Also called:** the Bench, the Spare Capacity Pool. *"The game should make players feel smart for
owning nothing"* — and then teach them, once, what that costs.
**Interacts with:** build time, §6.4 working capital, §7.7 degraded modes, Headroom.

### Headroom as an explicit, purchasable, visible stat
Boring, expensive, and invisible in every other strategy game.

**How it works:** A single top-level stat, **Headroom %** = (capacity − peak-of-last-3-waves) /
capacity, shown as a thin band above the utilization bar. The game states its own rule openly: *below
25% headroom, every incident costs roughly double*, because the queueing hockey stick means you have
no room to absorb a surprise. Making headroom a named, tracked, **scored** stat is what turns
over-building from an accident into a legible strategy.
**Interacts with:** §7.1 queueing hockey-stick, §6.9 scoring, the Warm Bench.

### The Capacity Reservation (for yourself)
Not selling everything you have.

**How it works:** An explicit, visible reservation of a percentage of capacity that **sales cannot
sell** — held for failover, burst, migrations, and the customer who grows. It appears as an occupancy
penalty on the scorecard and as survival during every incident. **A number the player sets that is
pure discipline**, and the game should let them set it to zero.
**⚔️ Tension:** the Yield Manager (§4.9) exists to *sell* idle capacity at a discount; the Capacity
Reservation exists to *forbid* selling it. Both are correct, and the player has to draw the line
themselves — which is exactly the argument a real host has internally every quarter.

### Policies as a buildable class
The abstract half of the game gets the same UI grammar as the concrete half.

**How it works:** Policies are scattered everywhere (mixed-vendor procurement, offboarding checklist,
escort policy, change control, abuse triage dial, refund policy, discount authority, load-shed order).
Make **Policy** a first-class build category with a consistent card: no capex, a **hands-per-month**
upkeep, an **effect**, and a **friction on your own organisation**. Policies are the only buildable
that can be *violated* — you can suspend a policy for one incident at a cost, which is exactly the
decision every real operator makes at 3am.
**Full roster:** §4.11.
**Interacts with:** §4.9, §5.2 policy unlocks, §7.5 change freeze.

### The Standard Build (templates with a doctrine bonus)
Boring consistency, with a meter.

**How it works:** The player saves a cluster as a named template. If **70%+ of your estate conforms to
your own saved templates**, you earn a **Standardisation bonus**: −25% MTTR, −30% toil, +1 effective
hand, and config-management actions apply fleet-wide instead of per-object. Every one-off "we'll fix
it properly later" build lowers conformance.
**Why:** it converts Config Drift from a punishment into a *positive economy* the player is chasing,
gives the server-naming-and-label-maker joke a mechanical payload, and is the best possible carrier
for player expression — **your templates are your architectural signature.**
**Visual:** feeds the Golden Image Tint; drifted nodes render a half-step off.
**Interacts with:** §2.9 config drift, §4.6 config management, §7.2 templates.

**Variations and additions**

- **The Blueprint Bin** — save a connected *sub-graph* (say, a cache-fronted web trio) as a blueprint
  card and **stamp it anywhere** for instant correct wiring at a cost: late-game quality-of-life *as a
  buildable*. Sharing blueprints is the mod surface, and mis-stamping one into the wrong zone stays
  funny.
- **The Blueprint Rack** — the same idea at rack scale: design one rack once (web ×4 + cache ×2 + LB
  pair, wired, tuned, labelled) and stamp the whole thing in one click. **Fleet consistency as a
  buildable** — and every cloned rack inherits **upgrades and flaws alike**, so your brilliant config
  is your brilliant worm's favourite door. "One breach fails every tenant," at the placement layer.
- **Templates version themselves** — v3 racks can be recalled and re-rolled; **the old ones stay out
  there, ticking.** In multiplayer, shareable templates become the community's tower-defense
  loadouts.
**Hosting types:** all, from tier 2 on.

### The Dependency Contract
What a link *promises*.

**How it works:** Connection contracts are properties on a cable. Extend them into a promise that can
be *broken*: each link declares an expected latency, error rate and availability. When the real
numbers drift outside the declared band, the link flags **out of contract** — *before* anything
breaks. This is the game's earliest possible warning system and the thing a good monitoring build buys
you.
**Why:** it gives "symptom vs cause" a concrete narrowing tool that is *earned* rather than given, and
it means the answer to "which of my 200 links is the problem" is a single overlay rather than a hunt.
**Interacts with:** §7.2, §7.6, §4.6 monitoring.

---

## 4.2 Compute and application tier

### Web Server (the 1U pizza box)
The starter. Serves visitors; cheap and fast to place.

**Costs:** low cost, low upkeep. **Connects to:** LB (in), DB/cache/storage (out).
**Opens:** every web vulnerability; it's the front door, a DDoS target, and a bad-deploy risk.
Scaling it horizontally is the game's default answer, which makes the *vertical* alternative
interesting.
**Visual:** flat, wide, two drive bays, a cyan-lit power button. Idle: faint fan blur plus one activity
LED that blinks *in time with actual request traffic* — **LED cadence is a free load meter.** At the
app layer it projects a small floating "page" glyph you can see being handed to visitors. Placement is
a two-stage rail click.
**The two-annulus widget (wave-2 resolution):** the original entry gives it both a Load Donut and "a
ring of worker-slot segments that fills up like a parking lot," which duplicate each other. They are
*different things the game cares about separately*: the donut is **utilization**, the slot ring is
**concurrency**. Render them as **two concentric annuli** — outer donut for utilization, inner
segmented ring for slots — so you can see the case where **slots are full and utilization is low**,
which means a slow dependency, and which is the game's entire diagnostic thesis in one widget.

**Variations and additions**

- **Every optional module is a door** — PHP, CGI, FTP: each module you enable adds surface, and each
  is a real attack vector. The web node's capability list *is* its exposure list.
- **CVE events target your specific stack choice** — periodic events fire against the exact runtime
  you picked, so "the boring, patched one" versus "the fast, vulnerable one" is a live decision with
  a delayed bill.
- **The App Server is the middle child** — more capability, RCE and dependency vulnerabilities, and
  it is the thing that connects web to DB. The **Static Site / Object Store variant** is the escape
  hatch: the low-surface optimisation that gives up dynamic capability on purpose.
- **Upgrades as range/damage upgrades** — keepalive, TLS, HTTP/2 and HTTP/3 lanes read as upgrades to
  the node's reach rather than as config toggles.
- **Visual:** a **storefront kiosk with big glass windows** ("the pages") — load shows as the number
  of lit windows, and an unpatched node carries a "windows left open" hazard shimmer.

### The Monolith (scale-up server)
Huge single-node capacity, zero coordination overhead, fewer cables.

**Costs:** high cost, high upkeep. **Opens:** a single point of failure, and **you cannot upgrade it
without downtime.** A genuine strategic fork against horizontal scaling, and the far end of the
Instance-Size Slider (§4.1).

### App Server / Worker Pool
Handles dynamic logic; separates rendering from serving, enabling richer pages (higher conversion).

**Opens:** deserialization, dependency poisoning, runaway processes, a framework badge the bestiary can
target.
**Visual:** 2U, a second CPU heatsink visible through a mesh grill, bigger heat plume, a **gear badge**
on the faceplate, and its **queue depth drawn as a stack of little job tokens piled on top of the
unit** — visible backlog you can read from across the room.

### Shared Web Node (control-panel style)
Many small customers per box; the highest revenue-per-U in hosting, and the highest blast radius.

**Costs:** a per-account license fee (repriceable by the vendor at will), CPU contention.
**Opens:** control-panel RCE hits every box at once; one bad tenant slows all; **one compromised
account infecting all** (symlink attacks, world-readable configs); a single suspension decision
affecting 300 sites; and a single failure meaning hundreds of simultaneous tickets. Carries the
**oversell dial**, which is its upgrade slider and its reputation risk in one control.
**Hosting types:** shared web, reseller, budget VPS-adjacent.

### VPS / KVM Node (hypervisor)
Density plus isolation; sells isolation at a higher ARPU.

**Costs:** RAM is the binding constraint; lower density than shared but better margin per customer,
worse per-U.
**Opens:** hypervisor escape (rare, catastrophic), noisy-neighbour I/O, overcommit risk,
live-migration failures, and customers who install malware themselves.
**The metric that makes overcommit playable (wave-2 addition):** **CPU ready time** — a host-side
number that is **invisible from inside the guest** and is the actual lived experience of overcommit.
Plus **memory ballooning and swap-on-the-host**, which is where overcommit goes from "slow" to
"catastrophic": a host that swaps guest memory to disk degrades every VM on it simultaneously while
the guests' own monitoring shows nothing wrong. ***"All of my customers are slow and none of them can
see why" is the signature VPS failure*** and it deserves its own diagnostic arc.
**Visual:** a machine with a glass front revealing floating translucent mini-machines. **Overcommit is
shown by the mini-machines visibly overlapping and clipping through each other** — a brilliantly gross
visualization of contention. Refinement: clipping begins only *above* 1:1, and intersection depth is
proportional to the ratio, so the player can eyeball their oversell; and **a noisy neighbour visibly
pushes its cellmates** rather than merely overlapping them.

**Variations and additions**

- **The Hypervisor Slicer / Fleet + SDN** — one physical node divides into VPS cubes; **slice-level
  isolation upgrades** reduce noisy-neighbour and escape risk, and over-slicing produces CPU steal
  (a quality collapse rather than an outage). Adding a fleet controller unlocks the VPS *type*:
  instant customer provisioning, customers arriving faster, and a bigger blast radius on host death.
- **The overcommit slider and the QoS resolution** — noisy-neighbour disputes between tenants are
  resolved by a QoS setting whose price is performance for everyone. One hypervisor's death hurts
  **all** its tenants at once, which makes it a fat target as well as a dense one.

### Dedicated Server
Isolation and a premium price, with simple economics and low support.

**Costs:** high capex (or lease), depreciated over 36–48 months. **Utilization is the whole game — an
empty dedicated server is a pure loss every single month.**
**Opens:** the customer has root — **you can't fix their mess**, they become a foothold you don't
control, they blame you for their own kernel panic, and **you are responsible for the *network*
consequences of whatever they run** (reflection attacks, spam, abuse complaints). Four-hour
hardware-replacement expectations.

### Bare-Metal-as-a-Service / Provisioning System (PXE/iPXE/Foreman-alike)
Turns a 3-hour manual install into 8 minutes and a low-conversion product into a high-conversion one.

**How it works:** Unlocks "instant dedicated" as a product and turns dedicated servers into an API
product that attracts developer customers.
**Opens:** an unauthenticated PXE server is a way to **reimage your own fleet**; a bad template
poisons every new build; and automated reinstall is a beautiful target for anyone who gets in.
**Interacts with:** the provisioning-network catastrophe (§2), Provisioning Automation (§4.10).

### Container Host / Orchestrator (Kubernetes-alike)
Turns individual servers into a capacity pool; lets you move workloads freely and enables auto-healing
and autoscaling.

**Opens:** an entire new control plane that can itself fail everything at once — **etcd quorum loss**,
a CNI bug that silently drops packets, image-pull failures when the registry is down, a rolling update
that rolls out a crash-loop, misconfigured network policy letting tenants see each other, image supply
chain, **a bad manifest killing 200 workloads in one apply**, a CI stampede scheduling 400 pods at
once, and the nightmare of a **control-plane certificate expiry** (cluster certs expire in a year by
default and take out everything). The classic "power with complexity" build — it should visibly add a
second, abstract layer of cabling that some players will hate and some will love.
**Visual:** a shipping-container yard inside one rack unit — a gantry crane picks up and places little
containers as pods scale up and down. **Autoscaling becomes a mesmerizing idle animation.** The
control-plane node is drawn with a crown. Alternative read: **"The Pegboard"** — pods pin and unpin
constantly.

**Variations and additions**

- **The Conductor** — a self-healing pod nursery that **rebuilds destroyed service towers
  automatically** (a gold sink) and converts N servers into one *macro object*: fewer, bigger things
  on screen, which is the scale-play unlock. It occasionally mis-scales and spends your money, and
  it admits malicious images without a policy gate.
- **Density buys margin and buys CVEs** — it densifies customers per box (an economy win) while
  **expanding attack surface automatically**: each new replica is a new CVE target, plus
  container-escape exploits, image supply-chain surface, and the noisy-container problem.
- **RBAC misconfiguration is an instant insider lane**, and the control plane is critical SPOF
  geometry — control-plane meltdowns should be scripted events, not dice.
- **As a sanitiser tower** it deletes and respawns a compromised or failed node, and rolling deploys
  lower bad-deploy risk. **One typo = everything bounces.**
- **Visual:** hexagonal honeycomb cells that light and dim as autoscaling spawns and kills them; the
  control-plane **queen cell pulses a scheduling beat**; misbehaving cells flash and get "reaped" by
  a bee animation.

### Hypervisor Host — "The Tray"
The migration verb, made physical.

**Visual:** a chassis drawn as a tray with VM tiles you can pick up and drag to another tray. **Live
migration is a tile that ghosts across and solidifies; a failed migration drops it with a crack.**
**Interacts with:** SAN/shared storage (live migration requires it), maintenance windows.
**Opens:** **hypervisor and orchestration licensing repricing** — a scripted disaster event in which
your platform vendor changes the per-socket or per-core model overnight and your margin evaporates
without a single technical change. The mitigation is an open-source alternative that is cheaper and is
also a migration project. And: **a single management-plane compromise is total loss.**

**Variations and additions**

- **Live migration as a castable ability** — the tile ghosting across the tray is a *button*: rescue
  a besieged host by evacuating its tenants mid-battle, at the cost of one dropped packet and a tiny
  patience hit. Model **pre-copy dirty-page convergence** — a busy VM converges slower, so the
  migration visibly **hangs mid-stride** when the guest writes memory faster than the link carries
  it, and the bandwidth bill appears while it does.
- **Drain and migrate** — host maintenance becomes an explicit "drain, then migrate" verb, which is
  the correct rack-maintenance-window mechanic and the thing that makes shared storage worth its
  price.

### Serverless / Edge Function Tier
Infinite instant burst capacity, pay-per-invoke, no upkeep, scale to zero.

**Opens:** **cost explosion under attack — an attacker can spend your money** without taking you down
("Denial of Wallet"); **runaway recursion** (a function that invokes itself: a self-DDoS with a bill
attached); cold-start latency as a tax on the first visitor; and per-invocation billing a customer can
weaponize against themselves. A brilliant risk/reward object: perfect for spikes, catastrophic when
attacked.
**Visual:** "The Pan" — things appear, sizzle, and vanish; the pan is cold when nothing is cooking.

### Warm Pool / Chrysalis Pool *(serverless)*
Pre-warmed function shells that shorten cold starts.

**How it works:** **Buying warmth is buying the absence of a stutter.** Costs idle money for latency
you only notice by its absence — the serverless sibling of the Warm Bench.

### Worker / Queue Pool
Decouples slow work from the request path — a *direct* latency reduction.

**Opens:** queue backlog as a new failure mode, invisible to visitors until it isn't; poisoned jobs; a
worker that never finishes; silent job loss; **a queue that backs up silently is a delayed outage.**
The main "architecture, not hardware" upgrade.
**Visual:** a conveyor belt with jobs as visible boxes. **Backlog literally piles up at the belt's
entrance.** Scaling workers adds parallel belts. Nothing explains async processing faster. The broker
itself is **"The Pipe & Gauge"** — a physical pipe with a pressure gauge where backlog is pressure, a
blocked consumer makes the pipe bulge, and the **dead-letter queue is a visible overflow bucket.**

**Variations and additions**

- **The Message-Queue Dam (Kafka/RabbitMQ buffer)** — the broker rendered as a literal **spillway
  between your lanes**: bursts fill the reservoir instead of drowning the backend, and it releases at
  the backend's sustainable rate. It absorbs **both** flood and demand — customers park in the dam
  with an **ETA sign** (patience drains slower in a scenic queue than in a 503 field), and floods
  spend queue capacity instead of server lives.
  **Failure modes:** dam overflow (drops read as a packet-loss bounce); **backpressure**, where the
  upstream lanes visibly swell and the congestion warning *is* the waterline; and **poison-pill
  messages that jam a sluice gate** until a dead-letter-queue tower clears them.
  **The durability tradeoff:** the queue *is* a durable store, so losing it loses "delivered"
  customers — which is a real argument against buffering at all. Every queued item carries an **aging
  patience meter**, so consumer lag *is* tomorrow's bounce wave: a cheap latency lie that gets
  expensive when ignored.
  **Opens:** its management UI is another exposed attack surface.
  **Interacts with:** §8 backpressure (this is the visual source), §3's slow consumers, the Queue
  Dial (§4.4).
  **Hosting types:** all — it is the queueing backbone of scale play, and it decouples customer paths
  from heavy jobs (renders, training runs).

### Cron / Scheduler Node
Enables maintenance, reports, billing, warmups.

**Opens:** overlapping runs, cron storms, jobs that fire during peak, and **the 00:00 stampede** when
every tenant's job fires on the same minute — a designed threat with an obvious, satisfying counter
(jitter).

### Batch / HPC Job Scheduler (Slurm-alike)
Fills idle capacity, enables preemption, enables a spot tier — **turns waste into revenue.**

**Opens:** starvation of small jobs, fairness disputes, priority inversion at the worst possible
moment, a job that won't checkpoint, and preemption-without-checkpointing rage.
**How it works:** **Your fairness policy is a monetization decision.**
**Visual:** a physical queue board with customer-coloured job tickets.

**Variations and additions**

- **Starving interactive jobs for batch monsters is a policy dial** — the GPU/AI core of the object:
  queues, quotas and priority, with the scheduler's own **queue as a threat surface**.

### Bare-Metal Build Box / CI Runner
Deploy pipeline and artifact builds; also a *product* if you sell CI.

**Opens:** the build pipeline is a *privileged* path — compromise it and you own every deploy. As a
customer-facing product it also invites crypto-mining abuse.

### Staging Environment
Pure cost, zero direct capability; reduces bad-deploy incident rate by ~80%.

**How it works:** **A building that produces no output and is obviously correct only in hindsight.**
Excellent for teaching players to value prevention. Costs a full duplicate of everything and is always
subtly different from production, **which is where the bugs hide** — so *staging parity* is itself an
upgrade path. The specific, teachable drift: **staging has 1 web node, prod has 40, and the bug only
appears at scale.** Also sellable to agencies as a premium feature.
**Visual:** a **ghost-coloured duplicate** of part of your topology, drawn in translucent blueprint
style on a separate small platform. Bad deploys break the ghost harmlessly. Visually, it's your
topology's shadow.
**⚔️ Tension:** staging mirrors your *service*; the Lab Rack / Reference Rack (§4.7) mirrors your
*hardware and network*. They are different purchases and both get skipped for the same reason.

**Variations and additions**

- **Stage one tier, not the whole map** — a cheaper form exists: a ghost copy of *only* the web tier.
  It catches most bad-deploy rolls at a fraction of the upkeep, and it is the honest mid-game answer
  to "I can't afford a second everything."
- **Bad deploys roll here first at one tenth the stakes**, and you "promote" builds with a ceremony —
  which is what converts the Bad Deploy from a *gamble* into a *science*. A perfect mid-to-late
  unlock: the moment "process" finally pays rent.

### Connection Pooler (pgbouncer-alike)
Fixes connection exhaustion; **multiplies effective DB capacity for near-zero cost.** One of the best
value buildables in the game.

**Opens:** another hop, another process to run out of memory, transaction-mode subtleties, and a new
single point of failure sitting directly in front of the database.

### Keepalived / VRRP Floating IP
Cheap HA for a pair.

**Opens:** split-brain if the heartbeat link is the thing that fails, and both nodes claim the VIP.
**Counter:** the Witness / Tiebreaker Node (§4.4).

### Bare-Metal Beast (GPU box)
The flex object.

**How it works:** Enormous, loud, glowing, with visible GPU cards like magazines. **Massive heat plume
(biggest in the game), massive power cable (thickest in the game).** Its presence visibly distorts your
thermal and power overlays. Requires a facility upgrade before you can even place it — the canonical
gating pattern, and **the game should let you buy one you cannot power, and fail.**
**Opens:** thermal limits, silent NaN corruption, driver/firmware fragility, "training" that is
actually mining, and **the world's most stealable hardware** — GPU theft from datacenters is real.
**Visual:** "The Furnace Rack" — visible GPU cards with individual glow, NVLink drawn as bright
internal bridges, and a feeder cable thicker than anything else in the game.
**Hosting types:** GPU/AI compute, HPC, render farms.

**Variations and additions**

- **The abuse magnet** — huge dollars per hour from AI tenants, and the loudest thing on the map for
  attackers: **cryptominer squatters spoofed as legitimate jobs** (caught by a fingerprint tower),
  thermal surges and power spikes. Extreme upkeep, liquid-cooling adjacency required, and a scheduler
  required.
- **Checkpoint or lose the whale** — a checkpoint link to storage is mandatory or long jobs fail
  catastrophically. **A job that dies at 3am is a lost whale**, not a lost hour.
- **With an InfiniBand fabric spine** it gains a premium network layer with its own failure modes — a
  **dirty optic produces a flapping link** that degrades the whole cluster.
- **Visual:** obsidian "hot blocks" with a **magma-grid face** — utilisation is how brightly the grid
  burns, idle is smouldering embers, and the coolant pipes **frost up** when demand spikes.

### FPGA / ASIC Shelf
Niche, era-gated, for mining tenants and specialized trading customers.

**How it works:** A silhouette and an economy of its own — enormous power draw, near-zero general
utility, and a customer base with a volatile relationship to your abuse desk.

**Variations and additions**

- **The Custom Silicon Shelf** — deploy your *own* in-house chips: monster throughput per dollar and
  a heat buff, at the price of **zero vendor support**. Patches arrive late because they are your own
  research, failure modes are one-off (an **erratum gremlin** event), and there are no spare parts —
  repair means salvage. The tech-debt dragon reappears as **hardware debt.**
  **Hosting types:** hyperscaler, finale acts.

### The Legacy Box You Can't Turn Off
An inherited unit with an unknown but critical role.

**How it works:** Provides revenue, refuses documentation, fails at the worst time, and cannot be
decommissioned until you've spent hands discovering what it does. **The Surface Budget's
Decommission verb has a boss fight, and this is it.**
**Interacts with:** the Age Plate, acquisition levels, the Secondary Everything Register (§4.6).

### Cell-Based Architecture / Shuffle Sharding
**The single best missing buildable** — the modern answer to blast radius.

**How it works:** Instead of one big pool, you build **N independent cells**, each a complete miniature
of your stack, and assign each customer to a cell. A failure takes out 1/N of customers instead of all
of them. **Shuffle sharding** goes further: each customer is assigned a random *pair* of cells, so any
two customers rarely share both — meaning one customer's poison affects a tiny, mathematically bounded
fraction of others.
**Costs:** efficiency (each cell needs its own headroom, so total headroom is N× worse) and complexity
(deployments roll cell by cell, so change velocity drops). Also more things to patch, more things to
monitor, and a routing layer that must know which cell a customer lives in.
**Opens:** the cell-router becomes a new global dependency; a customer migrated between cells during
an incident is a data-consistency problem; and "which cell is this customer in?" becomes a support
question.
**Why it matters:** it turns "blast radius as a first-class concept" from an observation into a
*purchasable strategy*, and it is the structural counter to Correlated Failure.
**Visual:** the board visibly divides into repeated identical districts, and during an incident you
watch **exactly one district go red while the others stay green** — the most satisfying possible
demonstration of an architectural decision paying off.
**Hosting types:** universal, but sharpest in multi-tenant web/VPS/SaaS-adjacent and object storage.
**Interacts with:** §4.4 routing, the Instance-Size Slider, Headroom, §7.1 blast radius.

### The Bulkhead / Resource Pool Partition
Cell thinking at a smaller scale, and much cheaper.

**How it works:** Reserve separate connection pools, thread pools or queues **per dependency or per
customer class**, so one saturating dependency cannot consume all of a service's capacity. Cheap,
subtle, and it converts a total outage into a partial degradation. The specific counter to "a slow
third-party API consumed every worker thread."
**Visual:** the segmented slot ring on the web node's inner annulus visibly divides into named wedges.

---

## 4.3 Data and storage tier

### Database Primary (the Vault / "The Drum")
Unlocks dynamic content, accounts, carts, sessions, and search — a huge revenue multiplier and the
gateway to Power Shoppers and Enterprise Buyers. **The brief's canonical example of the
capability/surface trade.**

**Costs:** high; hardest thing to scale out; possibly commercial licensing.
**Opens:** SQL injection, **connection exhaustion (the number-one real cause of "the site is down")**,
slow queries, lock contention, overload, data theft, backup-size explosion, raised regulatory exposure
(you now hold *their* customers' data), and the structural truth that **it is a single point of
failure by design** — vertical scaling is the only easy answer and it has a ceiling. **The only
component whose loss of *confidentiality* is catastrophic even if it stays up.** The archetypal
Capability/Surface trade and the tutorial for Pillar P2.
**Visual:** heavy, dark, reinforced corners, many drive bays, a combination-lock glyph on the
faceplate — or deliberately a **different silhouette entirely: a heavy cylindrical drum that *hums*.**
Idle: drive LEDs chatter in a distinctive "seeking" pattern and a subtle heartbeat pulse at
transaction rate — **when locked, the pulse stalls visibly, so you can *see* lock contention.** Its
data is drawn as stacked drawers in the inspector. Adding one draws a new cable to your web tier and
**immediately spawns a new magenta threat lane** — the capability/surface trade shown as one new cable
and one new lane.

**Variations and additions**

- **Never place it on the public path** — placing it wrong is the auto-fail lesson, and the zone
  rings make it visible: **a DB in the public zone is what auditors hunt for.** The trap is not
  forgetting to build it, it is misconfiguring the "unreachable by design" object into reachability.
- **Surface grows with each schema upgrade** — new tables are new keys for attackers, so a growing
  product is a growing target by construction.
- **It cannot be relocated without downtime** — a stateful core is anchoring geometry, and every
  later placement decision is made around it. Maintenance windows (vacuum/analyse) stall reads, and
  it adds a **DBA staffing upkeep** nothing else demands.
- **The tier-set bonus** — **Web + DB + cache as a *complete* tier grants a compounding set bonus**
  (−bounce chance, +headroom efficiency, one fewer SPOF) and unlocks a diagram-card achievement,
  teaching three-tier architecture as literally assembling a party. **Partial sets get no bonus** —
  the half-stack capacity cliff, made structural.
- **Visual:** queries arrive as **pneumatic tubes with tiny canisters**, and an injection syringe can
  only ride a tube if the web tower isn't parameterised — the mold shield rendered as plumbing.

### Read Replica
Offloads reads, adds capacity, big latency win, enables failover.

**Opens:** **replication lag as a correctness bug** (a user writes then immediately reads and sees old
data — "I placed my order and it's gone"), split-brain, **a replica that silently stops replicating
while still answering queries** — serving stale data with a straight face — the temptation to fail
over to a replica that is 40 minutes behind, and a second copy of your data to steal. Requires a
"read-your-writes" routing upgrade to fix properly.
**Visual:** identical to the primary but tinted and slightly translucent, connected by a **lag cord /
lag ribbon that stretches visibly like a rubber band** when replication falls behind. **You can see
lag as physical slack in a rope.**

**Variations and additions**

- **The primary/replica topology is the core mid-game puzzle** — replicas fan out read paths, and
  deciding *which* reads may be stale is the decision the topology exists to force.
- **Lag as a lagging ghost copy** — the replica's rendering trails the primary's by its actual lag,
  so "40 minutes behind" is a thing you see before it is a thing you read.

### Automatic Failover / Cluster Manager
Reduces MTTR; the thing that makes a replica worth having.

**Opens:** **split-brain** (two primaries, both accepting writes, data divergence you must later
reconcile by hand) and **flapping failovers** triggered by a network blip rather than an actual
failure. Requires a **fencing / STONITH** sub-build to be safe — **a great "the fix needs its own fix"
chain** — and a quorum witness in a third failure domain (§4.4).

**Variations and additions**

- **Failover cluster / Multi-AZ as a purchase** — duplicate a whole tier on a parallel path;
  **switchover time becomes a mini bounce-window event** rather than a background stat, so the player
  watches the seconds that the design is really selling them.

### Cache Layer (Redis / Memcached / Varnish) — "The Coil"
Cheap, enormous effect: slashes latency and DB load, absorbs floods, and sells "fast" as a marketable
product attribute.

**Opens:** cache poisoning, stale data (and the *enormous* support-ticket category "I updated my site
and nothing changed"), eviction bugs (your "cache" silently becomes a database when someone stores the
only copy of something in it), an unauthenticated service that must never touch the internet — **an
open memcached port is a 50,000× DDoS amplifier** — the catastrophic **cache stampede** when it dies
(your DB, sized for a cached world, instantly melts), and the psychological trap of building an app
that **cannot survive its own cache being cold.** The "defense that becomes a dependency" archetype.
**The Cache Dependency Score (wave-2 mechanic):** the percentage of your current traffic your origin
*could not* serve if the cache vanished. It rises silently as you tune for cost. Above 70% you get a
visible warning; above 90% your cache is load-bearing infrastructure with no failover. The score is
**only measurable if you run a cold-start test** — so make the cold-start test an action with a cost,
and make the number something you watch with dread.
**Visual:** a small, bright, fast-blinking frosted box — or a **glowing coil that gets brighter as it
warms** — with a translucent bubble/aura that visibly absorbs traffic, plus a thermometer-shaped
hit-rate gauge. **A cache hit bounces off with a bright ping and returns instantly, never reaching the
origin** — the most legible performance visualization in the game; a miss passes through with a dull
thud. **The hit-rate thermometer carries a second marker showing the rate you'd need for your DB to
survive a flush** — the cold-start test rendered as a line on the gauge, and falling below it is the
exact moment your cache stopped being an optimization. When the cache dies the bubble **pops with a
shockwave and you see the flood hit the DB.** Stale items slowly yellow; a cold cache is visibly cold,
dim, and drawing long threads back to origin. Eviction is sparks falling off the coil.

**Variations and additions**

- **The tower that can become the attack** — wired to the public internet it is a **reflection
  amplifier: a UDP gun you built yourself**, and an unpatched cache is the famous breach vector. It
  is the perfect "more capability, new surface" object precisely because it also *reduces* DB risk.
- **The warm-up dumb period** — after a deploy the cache is cold and you are temporarily worse than
  before you built it.
- **Cache-buster floods trigger miss storms exactly when it looks strongest**, which is what the
  stampede-locking upgrade exists to buy down. **The thundering herd you dodged lands on the DB.**
- **Placement is adjacency** — the cache must sit next to the web server it fronts, which makes it a
  spatial decision rather than a menu item.

### Local Disk
Fast, cheap, dies alone.

**How it works:** The tier-0 storage choice. Its virtue is that its failure is *uncorrelated*; its vice
is that it pins a workload to a machine and blocks live migration.

### RAID Array
Redundancy with a **rebuild-window vulnerability**.

**How it works:** Survives one (or two) disk failures — and during the rebuild, the array is slower,
hotter, and one failure from total loss. Larger disks mean longer rebuilds mean a wider window. A
clean, teachable "the insurance has a deductible" object.

**Variations and additions**

- **The hot-spare variant removes the rebuild panic** — it converts disk-death events into degraded-
  mode windows that heal themselves, at the cost of a disk that earns nothing until the day it does.
  **Hosting types:** bare metal, storage.

### Erasure-Coded Pool / Erasure Coding Policy
A configuration, not a building: durability vs usable capacity vs rebuild cost.

**How it works:** **A slider that is literally a probability of data loss.** High durability per
dollar, at a CPU and rebuild-network cost, and it is genuinely hard to reason about — which pairs it
with the "eleven nines" scenario.
**Visual:** shards fanning out to many nodes; rebuild animates as shards knitting back. A pebble is
split into shards that scatter into different combs, with a visible **"any 6 of 9 rebuilds it"**
indicator.

### NVMe Cache Tier
A speed multiplier on a storage pool.

**Opens:** a new failure mode — **write-cache loss on a power cut, unless you buy the
capacitor-backed version.** A small, specific, cheap upgrade that converts a data-loss event into a
non-event, and exactly the kind of thing players skip.

### Object / Blob Storage — "The Comb Cell Block"
Cheap bulk storage for media; offloads the origin; unlocks backup, CDN origin, and media-hosting
product lines. Sold by GB-month, paid for by egress.

**Opens:** **misconfigured public bucket — the most common cloud breach in the world**, and an instant
classic; egress cost surprises; hotlinking; eventual-consistency confusion; and **rebalancing storms
when you add a node.**
**Economics:** **egress pricing is the moat** and a customer-hostility dial — high egress fees mean
low churn and bad reputation.
**Visual:** an expandable honeycomb of hex cells that fill with coloured blobs; growth is visible as
tiling outward. **A cell that's accidentally public is drawn wide open with light spilling out of it,
visible from the facility altitude.**

**Variations and additions**

- **The public-read toggle is a door you can leave open** — the S3-bucket twin leaks like a sieve
  when public, and the misconfiguration should be **visible as an actual open door on the object**,
  not a hidden flag.
- **Hot/cold tiering as an upgrade path**, erasure coding as the capacity-efficiency curve, and the
  **metadata server as its own threat** — the part of object storage that scales worst and is
  attacked most.
- **Restores cost capacity while running** — a restore consumes serving capacity for its duration, so
  you literally **defend the restore**. It is the rare recovery action that is itself an incident.
- **Visual:** the **endless grain-silo farm** — durability is silo count, replication is twin silos
  joined by a chute, uploads pour in like seed and downloads auger out. (Alternative read: the
  bank-vault family building.)

### NFS / SAN / Shared Storage
Lets web nodes share files and lets compute be stateless (and therefore live-migratable).

**Opens:** the classic — **it turns N independent servers into one correlated failure domain.** The
SAN dies, *everything* dies. Plus a stale mount hanging processes in uninterruptible D-state where
even `kill -9` doesn't work, IOPS contention across tenants, and multipath failover that doesn't.
**⚔️ Tension:** shared storage is the prerequisite for live migration and stateless compute, and it is
simultaneously the game's most glorious single point of failure. Both are true; the counter is cells
(§4.2), not avoidance.

### Search Index / Search Cluster — "The Card Index Whirl"
Unlocks site search and the Comparison Shopper — a big conversion win for stores.

**Opens:** index staleness, **extremely expensive queries (a perfect L7 flood target)**, and a second
data store to secure.
**Visual:** shards drawn as spinning card wheels; a red shard is an unassigned one, and the wheel
visibly has a gap.

**Variations and additions**

- **A feature tower with a notorious exposure risk** — an open Elasticsearch/Solr cluster is a
  data-leak headline, and it is the classic "we forgot it was internet-facing" object.
  **Hosting types:** any with a store or a corpus; sharpest in SaaS and e-commerce.

### Snapshot Layer / Snapshot Scheduler
Cheap rollback; the counter to bad deploys and to ransomware.

**How it works:** Consumes storage continuously and quietly — until it doesn't, at which point your
"cheap safety net" is the reason the volume is full.
**Opens:** snapshots on the same array as the data they protect are not backups, and the game should
let a player believe otherwise for a while.

### Immutable / WORM Storage
Cannot be deleted before retention expires — **including by you, including by an attacker with root.**

**How it works:** The ransomware answer. Also Object Lock, in the object-storage line.
**Opens:** **you cannot delete it either**, which is a GDPR right-to-erasure problem and a cost
problem. Genuinely delicious tradeoff.

### Backup System / Backup Vault
Steady upkeep, zero visible benefit. The only counter to ransomware and data loss, and sellable as a
paid add-on — **the classic hosting margin move: turn your own cost centre into a product line.**

**Opens:** backup storage cost, the liability of having *promised* it in your marketing, backup
windows that overrun into business hours, backup traffic saturating the network, restore times nobody
measured, and — if it's online — a machine with read access to *everything* and credentials to
everything, which makes it **the juiciest target on your network and a ransomware operator's dream.**
**Sub-choices that matter enormously:** *push* backups (client writes to backup host — ransomware
reaches them); *pull* backups (backup host reaches in — safer, but the backup host now holds keys to
all); *offsite* (survives site loss); *immutable / air-gapped* (costliest, slow to restore, actually
survives). A pure insurance-design decision: **Fast/Online vs Slow/Offline.**

**The 3-2-1 widget (wave-2 addition):** three copies, two media types, one offsite — rendered as
**three filled/unfilled pips per dataset** on the object. The player can see at a glance that they
have 3-1-0 and *think* they're covered. It is the industry's real shorthand and it is instantly
legible.

**Four more stats the entry needs:**
- **Restore throughput as a separate stat from backup throughput.** You can back up over a link you
  cannot restore over in an acceptable time — the single most common real backup mistake.
- **Restore *rate*, not restore *time*.** The number that matters is GB/hour, and it is usually a
  fraction of backup throughput because restores are random-access and backups are sequential. A
  customer with 40TB and an 8-hour RTO needs 5TB/hour, which is a network and storage design
  constraint, not a backup-software setting. **Make RTO a computed value from real measured throughput
  rather than a promise the player types in** — that single change makes the whole backup ruleset
  honest.
- **Backup window vs backup duration**, tracked separately, with the overlap failure state explicit.
- **Backup ≠ archive.** Backup restores recent state; archive retrieves old state under a retention
  policy. Different access patterns, media, costs and legal weight. Conflating them is how companies
  end up with 400TB of "backups" they can neither restore quickly nor legally delete. **Ship them as
  two objects.**

**Two policy objects that hang off it:** a **retention schedule** (GFS-style: grandfather-father-son)
and **legal hold**, an override that prevents deletion and costs storage forever.
**And the missing counter-object:** **the encryption key's own backup**, as a separate, checkable
thing. "The Encryption Key Nobody Has" is a threat with no corresponding buildable to prevent it —
this is that buildable.

**Visual:** an offline, physically separate object with a visible **air gap** — a literal drawn gap
with no cable. **The one object in the game with no port studs**, promoted to a whole visual class
(§4.1's Air-Gap Class): a painted break in the floor, no cable tray overhead, and the only object that
casts no connection shadow. When it is *mounted* — the ransomware mistake — a cable appears across the
gap and the gap's paint is covered by it. **You can see the mistake that makes backups useless.** Its
correctness is signalled by a solid-vs-hollow checkmark: **the vault ships with a hollow icon and
provides zero protection until drilled.**

**Variations and additions**

- **The 3-2-1 rule made literal** — local copy + second location + **third medium** (tape is the
  air gap). The three pips on the object are the rule, and the player can see they have 3-1-0.
- **Restorability score is the hidden stat** — untested backups quietly fail. A **DR Drill** action
  tests them at a downtime cost, and a **Backup-Test tower** (a restore sandbox) removes the failure
  chance entirely.
- **The backup window's bandwidth drain is visible** — the job draws a tether to the target box while
  it runs, so "the backup is why the site is slow" is a thing you can see rather than deduce.
- **One restore per level is the dramatic beat** — a timed mini-game to roll back ransomware damage,
  **the Retrieval Race.** The rest of the object's life is "buy it, forget it, thank god you had it."
- **Legal holds freeze deletion**, and **ransom wisps specifically hunt these appliances** — the
  backup system is a target *because* it is the answer.
- **Backup Retention Policy Tool** — automatically ages out old backups on a configured schedule: the
  direct counter to Backup Storage Overflow (§3), and the reason your safety net doesn't fill the
  volume it lives on.
- **Restore speed is the stat that matters** — cold is cheap and slow, hot is dear and fast, and the
  **snapshot ability is the level-saving panic button** after ransomware or a failed deploy.

### Air-gap doctrine — *CONFLICTING*

Both documents want one thing that ransomware cannot walk through, and they disagree about **what it
costs to hold it.** The dispute is over the cost model, and the answers are mutually exclusive: a
free-to-hold tactical lever, a zone that earns nothing while sealed, a physically one-way pipe, or a
logistics problem with couriers and trucks. Each produces a different game at 3am.

#### Position A — the drawn gap as a visual class *(master)*

The air gap is a **property of the object and a whole visual class**, not an action: a painted break
in the floor, no cable tray overhead, **the one object in the game with no port studs**, and the only
object that casts no connection shadow. Its cost is paid at purchase — the immutable/air-gapped
backup tier is the costliest and the slowest to restore — and its failure mode is the *mistake*: when
it is mounted, **a cable appears across the gap and the gap's paint is covered by it.** You can see
the error that makes backups useless.

#### Position B — the Air-Gap Lever (tactical, free to hold) *(opencode)*

A big red physical lever on vaults and backup towers. Throwing it animates the trunk connector
physically disconnecting with a heavy **thunk**, the unit's cable going slack. Tactical air-gapping
gets a control you can slam at 3am — and holding it costs nothing but the capability you just cut.

#### Position C — the Zone Seal (economic) *(opencode)*

The air gap as a **zone-sealing win-condition button**: data becomes non-exfiltratable and APTs
cannot cross — but **everything inside earns 0 while sealed.** The strategic "cut to survive" trade,
priced per minute, for regulated audits and breach levels.

#### Position D — the Data Diode (physical one-way) *(opencode)*

A one-way pipe: outbound replication only, **physically incapable of inbound** — the only link
ransomware cannot walk backwards through. Throughput-limited and awkward, because you must **push**
restores manually.

#### Position E — the Courier Enclave (logistics) *(opencode)*

Air-gap as **a road and a room.** The **Faraday Room** is an offline enclave with literally zero
network exposure, operated by hand-carried media couriers — a mini-logistics game, and interceptable
— for crown-jewel regulated and AI jobs. The **Sneakernet Courier** scales it up: a truck carrying
petabytes between sites, immune to every network threat and subject only to traffic, theft and
weather. Absurdly high latency (one packet = one truck), and darkly funny on regulated and air-gap
maps. Visually, data gets into the disconnected pod only via a physical courier walk across the
floor.

### Hot Site / The Jet Hangar
Emergency full-workload failover that must be bought **months in advance.**

**How it works:** An entire standby estate that costs upkeep **while dark** and fires **once per
level**, at a huge cash cost and a consistency penalty. Failover as an insurance artifact you keep in
a hangar rather than as a button you press.
**Why it works:** the whole rack glows on the tarmac all level — a permanent, visible reminder of
money you are spending on a day that may not come, which is exactly the peacetime-prep feeling the
design is chasing.
**Interacts with:** the Warm Bench (§4.1), Off-Site Replication, §4.13's panic economy.

### Off-Site Replication / DR Site
The multi-site late game, with an RPO clock.

**How it works:** Asynchronous copy to a second site with a visible **RPO clock** and scheduled
failover-drill events. **Hot / warm / cold standby is the difficulty dial** — "the recover-from-
disaster win condition," costing upkeep and roughly doubling your infrastructure.
**Gives:** an offsite replica also defeats the same-rack fire and flood events outright, which no
amount of local redundancy can.
**Costs:** a second everything, plus the replication bandwidth and the drill time.
**Hosting types:** backup/DR, regulated, enterprise; the gate on multi-site scenarios.

### Backup Agent — "The Little Robot"
The scariest sprite in the game.

**Visual:** A tiny sprite that visits each object on schedule and carries a copy out. **If it can't
reach one, it stands next to it and shrugs** — a visible "unbacked-up thing," which becomes the most
frightening object on your floor once you know what it means.

### Restore Drill / Restore Test Runner / Restore Test Harness
Not a building; a recurring *action* that converts "we have backups" into "we have *working* backups."
**The build that converts faith into evidence.**

**How it works:** Costs time, produces no capability at all. **The purest virtue-purchase in the
game.** Skipping it is free until it's fatal. Gives a small visible "confidence" stat and a **"last
verified restore: N days ago"** counter that turns amber as it ages.
**The number that teaches (wave-2 addition):** the backup object shows a **Restore Time estimate that
is wrong until you've measured it** — `~2 hours (estimated)` before a drill, `6h 40m (measured)`
after. **Watching that number triple is the single most valuable thing this game can teach anyone.**
**Hosting types:** universal; mandatory in backup/DR levels, where it is the core verb.

### Data Warehouse / Analytics Store
**Reveals information**: which visitors bounce where, which threats are mimics, which client is
unprofitable, which pages lose visitors.

**Opens:** another copy of sensitive data, huge storage cost, privacy/compliance exposure.
**How it works:** An *information tower* — and information is the scarcest resource in this game.

### Log Aggregator / SIEM
Forensics after a breach and the only way to answer "when did they get in." Required for compliance.
**No defense at all: it is the fog-of-war remover.** Directly converts money into *information*, which
is the most underrated currency in the genre.

**Opens:** **enormous storage cost that grows faster than your business**, cardinality blowups, and
**logs contain secrets and PII** — so the log server is now in compliance scope and is a data breach
waiting to happen.
**Visual:** a tower with paper-tape streaming out and coiling at its base; **the coil's size is your
retention.** The object you interrogate during a breach level, where the coil is literally scrubbed
through. Complementary read: **"The Rain Gutter"** — every object sheds log droplets into gutters that
run to a collector, and **if the collector backs up the gutters overflow and your floor gets wet**, a
delightful literalization of "logging filled the disk."

**Variations and additions**

- **Correlation vision** — log aggregation makes attack units leave **visible trails**; combined with
  intel staff it is what spots **DDoS-as-distraction**. **Signal-to-noise is its actual stat**: an
  oversized SIEM makes the screen unreadable (the mechanic *is* the presentation), and alert
  avalanches hit when it is understaffed.
- **It is itself a juicy target** — log tampering is how an attacker leaves clean, so in regulated
  zones the **immutable store variant** is mandatory: deleted logs let ransomware exit without a
  trace, and retention length is a compliance requirement rather than a preference.
- **In regulated zones the log tower watches *you* too** — it reduces what you can hide from
  yourself, which is a cost some players will feel as one.
- **Visual:** the **Log Ship / Grafana Wall** — a diegetic observatory tower rendering *live real
  graphs* of game state. Upgrading retention makes the graphs **longer and smoother**, and a broken
  logging stack literally **freezes or pixelates its screens.**

### Tape Library / Robot — "The Vault Wall + Arm"
Slow, cheap, mechanical, jam-prone, and **air-gapped by nature: the strongest ransomware counter in
the game.**

**How it works:** Restores take visible minutes. **Pure charm, and it makes RTO a thing you *watch*.**
**Opens:** robot failures and jams, media degradation and cartridge wear, off-site courier logistics,
and the *very real* problem that **in five years you may not own a drive that can read the tape.**
**Visual:** a wall of cartridge slots and a gantry arm with real travel time. **The arm's motion is the
level's clock.**
**Hosting types:** backup/DR, tape vaulting, archive, regulated retention.

**Variations and additions**

- **The dinosaur tier** — absurdly cheap, laughably slow, and it unlocks retro and historical
  campaign content plus a "the tapes are waking up" joke event (the tape monster that eats tapes).
- **Visual:** during a restore the robot visibly retrieves a cartridge and **the progress bar is the
  physical reel spinning left-spool to right — "the last reel."** A Restore pulls a glowing
  customer-shaped figure out of a reel like a 3D printer: **the game's resurrection animation.**

### Cold Archive Vault (offsite)
A second location, a courier, and a chain-of-custody log.

**How it works:** The cheapest durable storage and the slowest retrieval. Lifecycle tiering *to* it is
cheap; getting data *back* is where the bill and the RTO live.

### Secrets Manager / Vault — "The Safe"
Ends passwords-in-config.

**Opens:** a new single point of *total* compromise, and **if it's down, nothing can start.**
**Visual:** a small safe with a spinning dial. Services that use it draw a short chain to it.
Credentials inside are drawn as keys; **credentials left in config files are drawn as keys lying loose
on the floor — or taped to the front of a server — visible to anyone who walks by, including the
Insider and the Friendly Face.** Devastatingly clear.

**Variations and additions**

- **Short-lived credentials shrink the payout window** — rotating keys and tokens on a timer turns
  the Key-Leak Vulture's payout window from months into minutes, and makes **insider severance an
  *instant* access death** (they leave, the tokens expire) rather than a stat nerf. The Registrar
  Heist cannot happen if registrar credentials live here.
- **It projects a least-privilege aura** to the towers it feeds, and **secrets manager ⊕ bastion is a
  two-player defense of the admin plane** — neither is worth much alone.
- **The HSM physical twin** — a root-of-trust object: keys live *inside* and cannot be cloned;
  required for regulated data flows and for DNSSEC/KSK ceremonies; a **physical theft target** that
  combines with colo's mantrap defenses. And if it dies, **you cannot decrypt anything** — a new
  SPOF bought to remove one.
- **The consolidation paradox** — a central KMS consolidates your keys, and now *every* server has a
  dependency path to it: **a new highest-value target appears on the board.** Losing it is losing
  every customer bound to it. The classic defense paradox, as one purchase.
  **Hosting types:** cloud, regulated, DNS.

### The Read-Only Mode Switch
A pre-built degraded state for the data tier.

**How it works:** A one-click mode where writes are refused with a friendly message and reads continue
from replicas. **Requires the application to have been *built* for it** (a prerequisite purchase),
which is the point: **you cannot buy it during the incident.** Turns a total outage into a browsable,
ugly, survivable one.
**Interacts with:** Graceful Degradation (§4.11), §7.7 degraded modes.

---

## 4.4 Network and edge

### Reverse Proxy / Edge Tier — "The Mirror" / "The Gatehouse"
The most important early build. **The single highest-leverage buildable in the web levels.**

**How it works:** Absorbs Slowloris, terminates TLS, does rate limiting, compresses, caches, rewrites
headers, and buffers slow clients so backends stay free.
**Opens:** it is now the single point through which everything passes; **it holds your private keys**;
a bad config reload takes the whole site down; it can be misconfigured into an open proxy; it becomes
the place all your rules accumulate into an unreviewable mess; and request smuggling.
**Visual:** a gatehouse with a checkpoint arm; every request pauses for a frame. Rules are drawn as
signs posted on the gatehouse. Alternative read: **a flat mirror panel — visitors hit it and their
reflection goes onward, so the origin never sees them directly.** That one image explains what a proxy
is better than any tooltip.

**Variations and additions**

- **Termination placement is the decision** — edge versus origin, offload appliance versus key
  custody risk. Customers trust you more (a patience bonus) but **you pay CPU per handshake**, which
  should be a visible cost meter rather than a hidden constant.
- **As an edge cache it lets near-path customers skip your whole interior**, and it **absorbs
  slow-client attacks** so the origins never see them.
- **Upgrades:** keepalive, a TLS-encrypted lane, an HTTP/3 lane — each a visible new pipe rather than
  a config checkbox.
- **Cert centralisation is one ticking bomb instead of dozens** — which is a genuine improvement and
  a genuine single point of expiry.

### Load Balancer (L4 and L7 as separate builds) — "The Prism"
Distributes traffic, enables health checks and zero-downtime rolling deploys, and unlocks the
*high-availability* product tier so you can sell a stronger SLA.

**How it works:** L4 is fast and dumb; L7 can route by path and do health checks but costs more per
request. Should be the first build where the player feels like an architect.
**Opens:** itself a single point of failure until paired; SSL-termination CPU load; connection-table
exhaustion; session affinity that concentrates load; it's the public IP, so it's the DDoS magnet; and
**health-check misconfiguration, a top-tier outage source.**

**Give the player the actual dials (wave-2 expansion)** so the classic failures are things they
*configured* rather than hidden traps:
- **Check depth** — TCP / HTTP 200 / synthetic transaction. Deeper is more accurate and more
  expensive.
- **Interval** and **failure threshold** — too shallow and a dead backend stays in rotation; too
  aggressive and a *slow* backend flaps out, shifting its load onto the others, which then also flap:
  the cascade.
- **Slow-start** — ramp a returning backend instead of hitting it with a full share of traffic, which
  is what kills it again.
- **Outlier ejection** — eject by observed error rate rather than by probe.
**Visual:** a **physical flow splitter / manifold**: one thick pipe in, N pipes out, with visible
adjustable vanes. **Weights are literal vane angles you can drag** — the best config-as-object idea in
the game. A **draining** backend shows its vane closing slowly; a **flapping** backend shows its vane
**oscillating**, which makes a flap cascade visible as mechanical chattering *before any graph moves.*
Health-checking is little green pulses sent down each pipe with a returning tick or a cross; a failed
backend's pipe visibly gets capped with a red plug. Incoming traffic fans out into coloured strands,
and **uneven balancing is visible as uneven strand thickness** before any graph tells you — strands
need a specified minimum width so this is readable at mid-zoom. Alternative read: **"The Prism"** — a
wedge that takes one incoming beam and splits it into N, with weight as the visible angle and
brightness of each output.

**Variations and additions**

- **Health checks lie in both directions** — a too-aggressive checker marks *healthy* servers dead
  and the flapping LB becomes a self-inflicted capacity collapse; a too-lazy one **feeds customers to
  corpses.** Checker thresholds are a *third* dial on the hub alongside algorithm and weights.
- **Sticky-session pinning belongs here** — better UX versus less flexible shedding, and it is what
  keeps gamers logged in across servers.
- **Algorithms as upgrades** — round-robin → least-connections → geo, and the player **draws which
  servers an LB feeds**, which makes it a routing decision node rather than a stat block.
- **The LB is the SPOF that APTs love** — an area-control tower that manages lanes rather than
  dealing damage, and its **own exposed admin panel is new surface.**
- **Visual variants.** A rotating **turnstile** metering figures across N gates, spin speed =
  throughput, the arm shuddering and re-aiming when a backend dies — failover choreography in one
  object. Or a small **traffic roundabout / hex-sign hub** where a crossing-guard sprite waves packets
  through and the algorithm upgrade changes the guard's conducting style (round-robin = metronome,
  least-connections = counting on fingers). Or an **animated rotary distributor** with a railroad-
  turntable feel that visibly *aims* incoming streams; failure is traffic physically pooling on one
  side. **Iso-view fix:** mount LB hubs on **gantries above the path** (pedestrian-bridge grammar) so
  the arm shudder reads over the whole hall instead of being occluded by racks.

### LB Pair (HA)
Double cost, removes the choke point, adds zero capacity.

**How it works:** **The first time the player pays 2× for nothing, purely to not die.** A formative
lesson. Requires VRRP, and VRRP can split-brain, so it wants a witness.

### Firewall — "The Portcullis"
The first real defense. Blocks whole protocols and ports cleanly, at near-zero friction.

**Opens:** false positives that kill visitors; **stateful table exhaustion under SYN flood — your
firewall dies before your servers do, which is extremely real**; a throughput ceiling that makes it
the bottleneck under DDoS; asymmetric-routing drops after failover; **the rule that locks you out**;
and a rule-set complexity nobody understands ("what does rule 47 do?" "nobody knows, don't touch it")
— a **technical-debt meter** attached to a single object, growing to 4,000 lines. And deliberately: it
is **nearly useless against modern application-layer threats**, so the player learns the cheap obvious
answer has a ceiling.
**Visual:** a crenellated wall segment with visible **arrow slits (allowed ports)**. The picture of
your firewall config is literally *how many holes are in the wall*; opening a port is punching a
glowing hole, **with debris falling, because opening a port is destructive.** Each hole is **labelled
with its port number**, **sized by traffic volume**, and **lit from behind by whatever is on the other
side** — so an internet-facing hole glows and an internal one doesn't. Overly permissive rules are
drawn as *missing bars*. A rule that has never fired develops a cobweb decal. Blocked units hit it
with a tiny spark and a counter tick. **This single metaphor teaches attack surface better than any
tutorial.**

**Variations and additions**

- **The two dials, stated plainly** — block chance versus **customer-latency tax**, sliding between
  "open" (fast customers, easy threats) and "strict" (slow customers, safe). Every hop adds latency
  to customer paths, so **a slow firewall bounces customers**: the game's central design truth in one
  object.
- **The third dial — the state table.** Stateful firewalls die from *their own defense*: every
  allowed-but-stale connection costs memory, so **conntrack consumption belongs on the tower** beside
  block chance and latency tax. A DDoS that doesn't attack the server attacks the firewall's
  **ledger** — low-and-slow, open-and-idle — which is the real "firewall full, blackhole later"
  failure mode. The conntrack table is a hard capacity stat.
- **L7 blindness and the upgrade path** — it cannot see L7 floods (units wearing HTTP clothes walk
  straight through) and it does not inspect allowed traffic. Upgrade path: **packet filter → stateful
  → WAF → next-gen** (behaviour scoring, which catches scanners disguised as customers). Rules are
  its targeting-filter UI; geo rules are a coarse, cheap, collateral-heavy option; **default-deny is
  expensive because it bounces customers too.**
- **The un-cheese verb** — the Swiss-cheese art promises dead holes, so add a **policy review**
  maintenance action that closes stale holes for a real defense discount. The cheese then *animates
  your choices*, and a neglected firewall genuinely looks abandoned.
- **Visual variants.** A literal **toll booth** with a raising arm and an inspection lamp, blocked
  items clattering into a visible "dropped" bin whose fill level is attack telemetry, with tiers
  adding booths and lanes. Or a **portcullis gatehouse with a guard booth**, rules shown as the
  guard's clipboard and capacity shown as the gate's queue wobble — every L3/L4 defense drawn in the
  wall/gate family.

### Switch (top-of-rack) — "The Comb"
Physical connectivity with finite ports.

**How it works:** Running out of ports is a real, dumb, satisfying constraint that forces you to buy
another switch — a natural, diegetic gating mechanism. **Oversubscription ratio is a tunable.**
**Opens:** it's the SPOF for the rack unless you buy two and run LACP/MLAG; broadcast storms; **a loop
created by an intern with a patch cable**; a misconfigured VLAN bridging two tenants; and a config you
can get wrong.
**Visual:** a thin 1U always at the top of the rack, with a row of 24 port LEDs flickering in real
traffic patterns — **the most information-dense small object in the game**, and the rack's
most-watched pixel row. An error-counter overlay shows a red tick at the exact port with CRC errors.
**Oversubscription is drawn as its uplink being visibly thinner than the sum of its downlinks.**
**Legibility floor:** the 24 LEDs must stay distinguishable at mid-zoom; below that the switch
collapses to a **summary strip** — one bar of aggregate utilization plus one red pip if any port has
errors. Never render 24 sub-pixel LEDs.

**Variations and additions**

- **The managed-switch upgrade** scales ports but buys **VLAN storms and firmware CVEs**, and the
  **core switch sets the site's bandwidth ceiling** — two different objects with two different
  failure stories.

### BPDU Guard / Storm-Control Port Guards
Per-port mini-towers on your switch. **Cheap insurance against a layer-2 melt.**

**How it works:** Each port can be armed with BPDU guard and a broadcast/multicast storm threshold.
Trivially cheap, individually boring, and collectively the thing that stops one patch cable in the
wrong two ports from taking the rack down.
**Why it belongs:** it teaches the biggest missing lesson in the category — **the network layer has
its own defenses, and firewalls do not see layer 2.** A player who has only ever bought firewalls has
nothing that answers a loop.
**Interacts with:** the Switch's broadcast-storm failure, the LACP bond's misconfiguration mode,
§4.4 segmentation.
**Hosting types:** colo, own-DC, anything with more than one switch.

### Core / Aggregation Switch + Router — "The Junction" / "The Roundabout"
Owns the map-edge connection arcs; the real spine.

**Opens:** firmware bugs, a stack-failover that isn't seamless, BGP misconfiguration, **a config typo
that takes out everything**, and **ASIC/TCAM table exhaustion — routes silently not installed**, which
is a wonderfully quiet catastrophe.
**Visual:** bigger, chassis-based, with visible line cards you add one at a time — **each new card is a
physical growth step you can see.** The router reads as a circular roundabout where route ribbons
enter and leave, and **routing-table size is drawn as the number of visible lane markings.**

### Redundant Pair + VRRP / MLAG
Removes a SPOF, adds split-brain and complexity.

**How it works:** The cheapest HA there is, and the one most likely to fail in an interesting way —
because the heartbeat link is itself a thing that can break.

### Link Aggregation (LACP) Bond
Bundle two ports or two links into one fat logical lane.

**Gives:** capacity **and** redundancy from the same purchase — the cheapest resilience on the
network shelf, and the cable visual is satisfying: two strands snapping into a single braided trunk.
**Opens:** a **misconfigured bond — where the two ends' LACP settings disagree — is the loop that
starts the Broadcast Storm.** The canonical "cheap resilience that can footgun," and the reason the
port guards above exist.
**Interacts with:** the Switch (§4.4), BPDU/Storm-Control Port Guards, MLAG.
**Hosting types:** colo, DC.

### The Witness / Tiebreaker Node
**The cheapest fix for "two datacenters is the most dangerous number."**

**How it works:** Gives quorum to a two-site cluster by placing a tiny, cheap, vote-only node in a
**third failure domain** — a VM at a cloud provider, a box in a colleague's rack, anything
independently reachable. Costs almost nothing and converts split-brain from likely to unlikely.
**Opens:** a dependency on a third party for your own failover decisions; and — the trap — **a witness
placed inside one of the two existing sites (which players will do, to save money) is worse than no
witness at all**, because it makes one site structurally privileged and hides that fact.

### Transit Link / Transit Contract — "The Big Ribbon"
Raw inbound capacity, with a committed bandwidth level.

**Costs:** per-Mbps, with **95th-percentile billing** and commit/overage cliffs. **You owe the commit
whether you use it or not** — a fixed cost that punishes over-forecasting, and a commit you can't grow
into is dead money.
**Opens:** saturation, metered-bandwidth bills, and the fact that **one customer's spike prices your
whole month.**
**Visual:** thick, expensive, drawn with a running **gold drip** because it bills by the 95th
percentile. Visibly the most costly thing on your map.

**Variations and additions**

- **Upstream circuits as consumable pipes** — buy 10G, then pay per-TB overage, with **95th-
  percentile billing** as the mechanic rather than a footnote. Shaping towers (§4.4) exist to
  allocate scarce bits to high-value customers first.
- **Renegotiation is a timed mini-event** — transit prices fall annually, so a **deflation mechanic
  punishes old contracts and rewards renewing.** The player who never revisits a contract quietly
  pays last decade's rate.

### Second Transit Provider (multihoming)
Survives an upstream failure. **A project, not a purchase.**

**How it works:** **Only counts if diverse path.** Doubles cost and introduces routing asymmetry
problems.
**The prerequisite chain (wave-2 expansion) — all lead-time gated, which is what makes Tier 4→5 feel
earned:** your own **ASN** (a registry application) · your own **portable address space**
(increasingly expensive or leased) · an **IRR object and an RPKI ROA** (or your announcement gets
filtered) · **a router that can hold a full table** (see TCAM exhaustion) · and **a maintenance
contract on that router.**

**Variations and additions**

- **A second road into your base** — a BGP router tower picks routes, survives single cuts and
  balances load, but **opens the hijack surface unless paired with RPKI.** Each uplink is a lane with
  its own capacity, latency, price, and its own failure and **depeering** events.
- **The router is the first-touch tower** — it routes threats into scrubbing lanes and customers by
  latency, and **a bad edit instantly blackholes your own lane.** Config risk, rendered as a single
  keystroke.
- **The vendor-layer hedge** — a **Multi-CDN / Multi-Cloud Router** hedges against any single vendor's
  outage at the cost of added complexity, and it is the *opposite* strategy to buying ahead on a
  Reserved-Capacity Discount (§6). **Open design question: can the two be combined, or must the
  player pick a lane?**

### IX / Peering Port — "The Handshake Bridge"
Cheaper bandwidth to peers and better latency to local eyeballs. **Permanently reduces bandwidth
COGS.**

**How it works:** Requires scale, a router, a port fee and *relationships* to justify. **A rare build
that improves both the visitor lane and the money lane.**
**Opens:** an IX outage; dependency on a peer who can **de-peer you**; route-server misconfigurations;
and peering disputes as a recurring event (a big eyeball network de-peers you and your latency and
your bill both get worse the same afternoon).
**Visual:** a short bridge to a peering fabric. **Traffic moved here visibly stops dripping gold** —
the clearest possible lesson in peering economics.

**Variations and additions**

- **The buildable form of a peering agreement** — a physical port at the exchange plus route-server
  config equals cheaper transit: settlement-free capacity and lower latency, so **customers arrive
  faster, literally**, which is an attraction buff as well as a COGS cut. It requires **your own AS
  and prefix** (unlocked) and enough traffic volume to matter, which makes it a mid-game object.
- **The exchange is a shared, contested structure on the world map** — and settlement politics bite:
  **peers de-cap you if your abuse counts rise.**
- **Transit sourcing as a buildable class** — upstream transit priced per Mbps with redundancy tiers,
  plus paid peering and settlement deals. Each purchase adds ingress lanes (more customers can arrive
  concurrently) **and more doors** (more vectors), and **the map edge visibly gains more roads as you
  grow.**

### BGP Speaker + RPKI / "The Lighthouse"
Control over your own routing; unlocks peering, multi-homing and anycast. **Makes you a real
network.**

**Opens:** route leaks, hijacks, blackholing yourself with a bad prefix filter, **accidentally
becoming a transit provider between two of your peers**, and being personally responsible for your
prefix's reputation.
**Visual:** a lighthouse whose beam sweeps out to the region map; **sessions are visible ropes to
peers that go slack (down) or taut (up).**

### IRR / RPKI Publication and Peering Hygiene
The paperwork half of networking.

**How it works:** Registering routes in routing registries, publishing ROAs, maintaining a
PeeringDB-alike entry. **None of it affects your network at all; all of it affects whether *other*
networks accept your announcements and whether they will peer with you.** A build whose entire value
is other people's opinion of you, expressed as configuration.
**Interacts with:** the Peering Coordinator (§4.8), Engineer Reputation.

### Anycast Network / Anycast Constellation — "The Tuning Fork"
Endgame: one IP everywhere.

**How it works:** Spreads volumetric load across many sites so no single one drowns; absorbs attacks by
distribution; unlocks DNS and CDN product lines.
**Opens:** BGP complexity, route leaks, **a config mistake that is global and instant**, and stateful
protocols breaking when a flow moves PoPs.
**Visual:** one IP drawn as a shared glyph at many nodes simultaneously, with visitor arcs **snapping
to the nearest**. The snapping animation is the whole joy of it. Alternative read: identical siblings
in many places drawn as tuning forks that **ring in sympathy** when any one is queried.

**Variations and additions**

- **Customer travel times flatten everywhere, and DDoS dilutes hugely** — waves split across nodes —
  **but per-node capacity shrinks**, and the capex is brutal. The late-game keystone, with a
  capacity-per-site cost the player must feel.

### Traffic Engineering Controller / Anycast Ring
Not a tower — a **road builder.**

**How it works:** Directs customer paths per region, redirecting inbound flows to your nearest PoP.
In multi-DC levels **this is the gameplay layer**: you move demand like water between boards, and it
interacts with the latency/patience maths directly rather than through a damage stat.
**Costs:** a control plane that must be correct globally, and a config mistake that is global and
instant.
**Interacts with:** Anycast, CDN PoPs, §4.4 withdrawal policy, the visitor patience model.
**Hosting types:** CDN, multi-DC, DNS, game hosting.

### Anycast Health Withdrawal Controller + Withdrawal Policy
The control that anycast implies and never gives you.

**How it works:** The point of anycast is that a sick PoP stops announcing. *When* it withdraws is a
tuning decision with a genuinely non-obvious optimum: too eager and you flap and shift load onto
neighbours; too slow and you keep sending users to a broken site.
**Opens:** **the withdrawal cascade** — the withdrawn PoP's traffic lands on its neighbours, which are
now overloaded, which withdraw, which… A beautiful automation-eats-itself failure specific to anycast.
**Counter:** a floor (never withdraw more than N% of the constellation) plus damped hysteresis.

### Private Interconnect / Dark Fiber
A dedicated link between two of your sites.

**Visual:** thicker, straighter, with a distinctive braided texture. Visually "premium."

**Variations and additions**

- **The Dark Fiber Route** — a long-term, expensive lane you *own*: guaranteed capacity, immune to
  public congestion, and **vulnerable to backhoe events** — construction crews as a hazard class.
  **Hosting types:** multi-region.
- **The Private Network / VXLAN Fabric** — connects boxes across datacenters so migrations and
  failovers **don't hairpin through the public internet.** It is the prerequisite that unlocks the
  migration scenarios at all.

### Cross-Connect — "The Violet Run"
Physical fiber to another tenant or carrier in the building.

**Costs:** an install fee plus a genuinely annoying monthly recurring fee **per cable**.
**How it works:** At colo tiers this inverts: **each cable you draw is recurring revenue**, the
highest-margin SKU in the industry — near-zero marginal cost, billed monthly forever, ~95% margin.
**So cabling literally costs (or earns) upkeep**, which makes tidy topology an economic decision. And
it is the best lock-in in the industry: **a tenant with 30 cross-connects will never leave.** Model
cross-connects as both revenue *and* retention.
**The lifecycle it needs (wave-2 expansion), because the physicality is what makes the wiring minigame
become the money minigame:** an **install fee** and a **lead time** (a tech has to actually run it); a
**capacity constraint** (the tray between two rooms holds a finite number); an **as-built record that
can be wrong**, so cross-connects get orphaned and you bill for cables nobody uses — real,
embarrassing, and a lovely revenue-leakage story; **patch-panel documentation debt** and the "whose
cable is that" problem; and a **disconnect process with a notice period.**
**Visual:** a violet cable from a tenant cage to the meet-me room, each one a recurring gold drip
*toward* you. **A wall of violet is a wall of money.**
**Hosting types:** colo, wholesale, carrier-neutral facilities.

**Variations and additions**

- **Carrier diversity and the port economy** — each cross-connect is one carrier and one point of a
  **diversity stat**: two carriers survive any single cut, one means **the backhoe is a loss
  condition.** Switch fibre-card ports are the *budget* that makes cross-connects a placement puzzle,
  and the **per-carrier latency matrix** is visible on the network layer, because some carriers
  literally take the long way.
- **The annuity and the fulfilment desk** — every carrier patch is a monthly fee (**~$300/mo each**;
  operators fight over them), but installs are **staff-hours**: slow fulfilment angers tenants, fast
  fulfilment needs a paid tech. A capacity puzzle sitting directly on the revenue line, and it turns
  the meet-me room into a placement question — **who peers with whom, through your patch wall.**
- **Visual:** the patch panel **gains cables when you buy transit** — capacity is plug density, and a
  full panel with no free jack is the clearest possible "you need another carrier" screen.

### CDN Contract / Edge PoP — "The Star"
Massive edge caching and DDoS absorption; shortens visitor walks; cuts origin load and the transit
bill (a direct margin improvement); sells "global speed."

**Costs:** per-GB (variable and scary), or a commit contract with minimum spend; capex per owned site.
**Opens:** cache poisoning, stale-content confusion and invalidation support load, **origin exposure
if your real IP leaks**, dependence on a third party who can have *their* bad day, **it hides your
real traffic patterns from your own analytics**, and — for owned PoPs — **each PoP is a new country's
legal jurisdiction.**
**Visual:** a translucent shell that wraps your whole property; static assets get served from the shell
with a bright short-circuit ping instead of travelling to your origin. At the world-map altitude,
satellite-like nodes with coverage bubbles; **traffic served at the edge never enters your board at all
and is shown as "absorbed" counters at the perimeter.** Visually communicating "traffic you never had
to handle" is important.

**Variations and additions**

- **The rare no-tax tower — which is why it is expensive.** Swarms *and* customers get shorter paths,
  so it is a defense that doubles as attraction. The **origin-shield upgrade** prevents a PoP
  stampede on your origin, the **cache-ratio meter is your margin**, and **cache poisoning is the
  surface it opens.** Place PoPs on a world map.
- **Each PoP is a mini-tower with a partial board** — it can be poisoned, drained or shielded
  individually, and the origin shield is what prevents the "all edges miss at once" boss.
- **The Content Delivery Partner** — a contract/relationship buildable rather than an owned PoP:
  cheaper than self-built edge, and correspondingly less controllable.
- **Visual variants.** A roadside **gas-station cache kiosk**, where a cache hit is a pump topping off
  a car instantly and a miss is a long haul back to origin drawn as a truck drive. Or **franchise
  outposts** with satellite dishes and vending-machine glass fronts showing cache fill, with the
  origin pulling courier boxes to restock empties (a cache miss plays an empty-shake animation).

### DDoS Scrubbing Service — "The Comb"
Upstream protection; the only real counter to volumetric floods. Also a **premium product tier**: sell
"DDoS-protected hosting" at a markup and the defense pays for itself.

**Costs:** a monthly retainer plus per-incident fees; "always on" costs more.
**Opens:** **the traffic detour adds latency — always, even when you're not under attack** — a visible
visitor-speed penalty while protected. The alternative is a manual "flip to scrubbing" action with a
30-second propagation delay: **a decision with a delay fuse**, which is great drama. Plus false
positives dropping real customers, and a per-event bill a sustained attack can make ruinous.
**Balance fixes (wave-2, flagged as degenerate otherwise):** an always-on flat retainer trivialises
the entire volumetric threat family. So: **(a)** price it as a **percentage of your peak traffic**, so
it scales with your success rather than being a cheap early purchase; **(b)** make the always-on
latency detour **big enough to matter, ~25–40ms**, roughly 10% of a typical latency budget;
**(c)** it covers the **Absorb role only** — L7 mimics, cache-busters and application floods still
arrive, because that's true. Then it is a correct and expensive answer to one threat role rather than
a subscription that ends a category.
**⚔️ Tension:** on-prem appliance (fast, capped at your uplink size, no detour latency) vs upstream
service (unlimited capacity, permanent detour, per-gigabit cost). **The always-on vs on-demand choice
is one of the best purchases in the game**: always-on is safe, slow and expensive; on-demand is cheap
but has an activation delay during which you are simply down.
**Visual:** at the world-map altitude, a detour arc into a big filter icon; the ribbon goes in
magenta-speckled and comes out clean cyan, and **the detour's added arc length *is* the latency.**
**Draw the arc at all times, not only under attack**, so the always-on cost is permanently visible —
otherwise the visual hides the entry's own mechanical point. Magenta gunk collects in the comb, and
its cost per scrubbed gigabit drips gold the whole time it's engaged.

**Variations and additions**

- **Trigger latency is the gameplay — three positions.** Who diverts, and how fast? **Manual:** the
  five minutes you spend *discovering* the attack are five minutes of downtime — mitigation latency,
  the industry's real metric. **Auto:** false diverts kill customers during your own launch spike
  (the mimic's cousin). **Always-on / inline:** expensive, plus a latency tax on every packet. A
  three-position tower that mirrors exactly how DDoS protection is sold, and it makes the rate-limit
  dial *feel different per mode* — clean scrubbing is inline, diverted scrubbing is a detour.
- **Placement geometry is a strategic puzzle** — "between you and the sea, on which coast?"
- **Under-scrubbed overflow drowns you anyway**, and customers detour too, so the latency tax lands on
  everyone during an attack. Its capacity bar *is* your flood line.
- **Upstream variants: Flowspec and the blackhole community** — see the RTBH entry below; the point
  is that **the manual trigger with a literal cost is the gameplay gold** the whole flood family
  otherwise lacks.
- **Visual variants.** A **water-treatment plant** that swallows the flood tide and discharges clean
  single-file customers. Or a **wash-house/laundromat** with spinning drums — the incoming tide enters
  as pipes and leaves as a clean trickle, capacity is the drum count and **the overflow spill is the
  danger tell.** Or a **giant vacuum-intake tower off the harbour**: swarms get siphoned in and spat
  out as harmless white vapour, and the intake horn flares and glows red when overwhelmed.

### Upstream Blackhole Signalling (RTBH) + Flowspec
**The thing that actually stops a volumetric attack**, as distinct from a local Big Red Button.

**How it works:** A BGP community you announce to your transit providers that causes them to drop
traffic to a given IP **in their network, before it reaches your circuit.** **Granularity is the
mechanic:** a /32 blackhole sacrifices one customer; a /24 sacrifices 250; **Flowspec** (if your
upstream supports it) lets you drop by port/protocol and keep the customer up.
**Costs:** a relationship with your upstream and pre-arranged configuration. Propagation is 30–120
seconds — **a decision with a delay fuse.**
**Opens:** you have handed a third party the ability to drop your traffic; a mis-tagged announcement
blackholes something you needed.
**Why it belongs:** without it, the player's mental model is "I can drop it at my firewall," which is
the single most common misconception about DDoS and is **wrong for any attack larger than your pipe.**
**Visual:** a brutal, satisfying, morally interesting button — **it instantly saves everyone except
the victim**, and the victim is your customer.

**Variations and additions**

- **The sacrifice tower, named** — tag a victim's (or your own doomed service's) prefix and redirect
  its traffic into a null interface *upstream*: **the flood stops before your pipe fills**, and the
  blackholed customer instantly, totally dies while SLA credits fire like popcorn.
- **Partial holes** — DSCP-based selective drop as a middle setting between "all of it" and "none of
  it."
- **The moral hazard of flipping the hole on a tenant** — blackholing an abusive tenant's *whole
  account* to stop abuse tickets is fast, profitable, and one misjudgement from a lawsuit. The
  /dev/null pit's joke cousin, now load-bearing.
  **Hosting types:** carrier-scale, game, CDN.

### Network Segmentation / VLANs — "The Coloured Floor Paint"
Limits blast radius: a compromised node can't roam. **The purest "insurance" buildable.**

**Costs:** cheap to build, **costly in flexibility** — its real price is that every future cable you
want to run requires an extra approval step. **A build whose price is paid in future convenience**, a
rare and wonderful cost type.
**Opens:** complexity; a misconfigured trunk that silently joins two networks that should never meet;
and "why can't A talk to B" incidents.
**Visual:** **VLAN painting** — drag a colour across ports to assign a VLAN; segmentation becomes
literally colouring in your network. Network segments render as coloured zones painted on the floor: a
flat network is one giant beige floor, and segmenting visibly *carves it up*. **Lateral movement by an
attacker is drawn as it walking across floor paint — and stopping dead at a boundary.** The best
security-concept visualization in the document.

### Microsegmentation — "The Grid Lines"
Segmentation taken to its conclusion.

**How it works:** The floor paint subdivides into a fine grid, and each cell has its own tiny gate.
Expensive, beautiful, and **visibly a maintenance burden** — the picture itself tells you the cost.

**Variations and additions — the containment family**

Four designs of "stop the walk," each with a different cost shape:

- **Blast Doors (microsegmentation)** — physical firebreaks across zones that kill all lateral
  movement between rooms and **tax every cross-door flow (+latency, +hop).** Placement becomes an
  interior-design puzzle specifically for ransomware containment. Visual: a literal rolling shutter
  with customers filing through a turnstile. Mid-to-late, all types.
- **Quarantine VLAN** — segment a *single owned box* into a visible cage: it stops lateral movement of
  an infection, but the customer inside screams because their box is now "slow." **Segment count
  versus convenience is the core tension**, made local.
- **MicroVM / Container Isolation Field** — an aura around server groups: worms cannot cross and
  breaches are contained to one unit, at a **CPU tax on everything inside** (throughput down). The
  nuke option, weighing contagion against margins.
- **Private VLAN / Network Segmentation** — splits trust zones and blocks lateral movement: the
  anti-"one box → all boxes" defense. **The web↔DB private-VLAN cable costs money and adds a hop**,
  which is the cheapest honest version of the whole family.

### Egress Filtering
Stops your compromised box from phoning home, exfiltrating data, or attacking others.

**How it works:** Prevents you from becoming *someone else's threat* (and the abuse complaints that
follow). The counter to SSRF, cryptominers, reflection/amplification and model exfiltration. Cheap,
boring, saves you from the worst outcomes.
**Opens:** breaks legitimate outbound things you forgot about — a comedic, recurring small pain.

**Variations and additions**

- **Defending egress is its own tower family** — the counter-set for threats travelling *outward*:
  compromised tenants, miners, exfiltration. Real-world accurate and mechanically fresh, because
  every other defense in the category points inward.
- **Make the egress filter a place — the Egress Gateway.** A pooled SNAT object with **two dials**
  (pool segmentation: mail / webhooks / backups / customers-browsing each get separate source ranges)
  and **one meter** (per-pool outbound reputation). It kills the "everyone shares one IP and one sin"
  failure mode, interacts with email warm-up curves, and connects to DDoS reflection physics —
  **egress rate limiting is how you avoid being the gun.**
  **Hosting types:** VPS, SaaS, mail, CI.

### VPN / Bastion / Jump Host / Zero-Trust Access — "The Gatehouse" / "The Tunnel Mouth"
Safely exposes admin access and consolidates SSH; **shrinks the management attack surface to one
door.**

**Opens:** it *is* the admin access, so compromising it is total — **that one door is now extremely
valuable** — and it's the box everyone forgets to patch because "it doesn't do anything." Plus **VPN
concentrator capacity as a real limit** (remember March 2020).
**Visual:** a single guarded door on the back wall with a spotlight on it; all admin access queues at
it as staff sprites. Removing direct admin ports is visualized as walls sealing up. Its **exposure
ring is huge and permanently magenta-edged.** As a tunnel mouth on the map edge, encrypted traffic
draws as opaque capsules — **a hole in your wall that you built on purpose.**

**Variations and additions**

- **A chokepoint tower aimed at *you*** — one door for all admin traffic, with MFA, session recording
  and least-privilege roles. It narrows both the attacker's lateral paths **and your own click
  radius**: you act *through* the bastion now, so every action costs a little latency and **every
  action is logged**, which is a regulator buff and an insider-threat buff at once. Without it, every
  admin-facing service is a side door, and **insider threats scale with the number of open side
  doors.** IPMI goes through it.
- **The Zero-Trust Gateway as a late-tier replacement** — every packet re-authenticated at each hop:
  massively safer against insiders and lateral movement, but it requires **many small gateways**,
  which makes it an expensive *geometry* puzzle rather than a purchase. The endgame tower fantasy,
  and the point at which perimeter thinking is formally retired.
  **Hosting types:** regulated, VPS, cloud, colo.

### Out-of-Band Management (IPMI/iDRAC/iLO) + Console Server — "The Grey Shadow Network"
Lets you fix a wedged box *remotely* instead of spending a physical hand. **The most underrated
buildable — it should be cheap, boring, and level-saving.**

**How it works:** Massively reduces remote-hands cost. **Converts a physical action into a remote action
— a pure Pillar-P4 upgrade.** The serial concentrator is the last resort when networking is the thing
that broke, and it is specifically what saves you from the fat-finger lockout.
**Opens:** a second, weaker login surface that attackers love; **IPMI firmware is historically
atrocious**, and if it's ever reachable from prod or the internet it's a free root shell with a
built-in remote KVM. **The build that saves you money and can end your company.**
**Sharpened placement rule (wave-2):** the original says "must be on its own VLAN." Sharpen to **its
own physical switch and its own uplink**, because a VLAN on the production switch dies with the
production switch.
**The BMC's own failure (wave-2 addition):** **the BMC itself hangs.** A wedged BMC cannot be reset
over the network, is unreachable while its host is up, and requires physically removing power from the
chassis. That failure is precisely what justifies the **Switched PDU** (§4.7) as a *separate*
purchase, creating a **three-tier recovery ladder: software reboot → IPMI reset → outlet power cycle →
hands.** Each rung costs more and is more certain, and **buying the whole ladder is a real strategy.**
**Visual:** a whole parallel cable plant in grey that you can toggle on as an overlay.

**Variations and additions**

- **It replaces a human trip** — lights-out management is a direct substitute for a remote-hands
  charge or your own avatar's walk, and **without it some breaches are simply unwinnable** because
  you cannot reach the machine at all.
- **Default creds are the whole joke** — it is a juicy attack surface precisely because nobody
  changes them.
- **Visual:** a little **KVM/IPMI periscope on each rack that pops up when active** — staff can "be
  there" without walking, which visibly collapses response time to far racks and makes the purchase's
  value readable in motion.

### Out-of-Band LTE/5G Modem (per site)
The cheap insurance that turns a truck roll into a click.

**How it works:** Universal, and essential at the edge and at any unstaffed site. Buy it for every
remote site; the player who doesn't will learn.
**Hosting types:** edge/MEC, satellite, remote PoPs, any multi-site deployment.

**Variations and additions**

- **The OOB Lifeline** — LTE uplink plus a modem bank **on the management plane**, so that when fibre
  dies, power dies, and the colo remote-hands desk is a phone tree from hell, you still have **one
  path the disaster did not touch.** It grants a "dark-hours recovery" buff: failed-power or cut
  events that would run for hours end in a **minutes-long reboot-from-bash mini-game** instead of an
  overnight outage.
- **The honest cost** — cellular-backhauled *management access* is a classic breach path (the
  attacker class is "the man who pokes the SIM-card router"), so it ships with **default-deny ACLs
  and one-time pairing** — and **forgetting to disable it during peacetime is an APT front door.**
  **Hosting types:** colo, own-DC, MSP.

### IPv6 Deployment
Cheap addresses, future-proofing, and a whole second config surface.

**Opens:** **a second firewall rule set that everyone forgets to write**, so your v6 address is wide
open while v4 is locked down. Very real, very common, and a perfect "you built a door on the other
side of the building" moment.

**Variations and additions**

- **The IPv6 Migration Toolkit** — the direct solution to IP Address Exhaustion, at the cost of
  **temporarily bouncing any remaining Legacy Client visitors** who cannot reach IPv6-only endpoints.
  Dual-stack work plus tenant demand is the real price; the address relief is the reward.

### IP Space (owned vs leased)
A capital asset that appreciates.

**How it works:** Owned IPv4 is a balance-sheet asset; leased is opex. **Your unused /24 is a rentable
asset** — at ~$0.50–0.80/address/month, an unused /22 is **$500–800/mo of near-100%-margin revenue**,
and a /16 held since the 1990s is a seven-figure balance-sheet item. **Many old hosts are quietly
worth more for their addresses than for their operations — a wonderful late-campaign reveal.**
**Opens:** **reputation is attached to addresses** — buy a cheap block and inherit its blacklist
history. A fantastic buyer-beware mechanic, and it needs two verbs: **address due diligence** (a cheap
pre-purchase check that reveals *some* of the block's history) and **reputation rehab** (a process
taking in-game months of clean sending). Then a cheap /24 is a *project*, which is exactly right.
**And the segregation move:** put your spammy customers on a separate block or watch your good block
burn.

**Variations and additions**

- **Addresses as literal inventory** — leased to tenants at **$/IP/month**, the real-world IPv4 rental
  market as a permanent high-margin revenue tower with **finite supply**. Scarcity ratchets every
  campaign, because prices have historically only risen: a money-versus-progress mechanic where the
  profitable asset is the one you are trying to stop needing.
- **IPv6 adoption is the cost relief and the churn risk** — see IPv6 Deployment above.

### Flow Telemetry (NetFlow / sFlow / IPFIX)
The tool that answers "**who** is using my bandwidth." **The most conspicuous missing buildable.**

**How it works:** Without it, a traffic spike is an anonymous number. With it you attribute every bit
to a customer, a prefix, a protocol and a destination — which is how you (a) bill accurately, (b) find
the customer causing your 95th percentile, (c) identify an attack's shape, and (d) **prove to an
upstream that abuse isn't yours.** It is the prerequisite for every interesting bandwidth decision in
the economy.
**Opens:** storage cost, and the privacy/compliance implications of retaining who-talked-to-whom.

**Variations and additions — East-West Sensing**

- **The Flow Lens** — a quiet observatory that reads **traffic *shape* without opening envelopes**:
  a top-talkers board exposes the cryptojacker by its flow silhouette, an exfil trickle (a DNS
  tunnel) shows as an improbable "who talks to *that* country?" arc, and botnet beaconing appears as
  a metronome spike. **Zero added customer latency.** Because it never inspects payloads,
  privacy-restricted levels — Tor hosting, regulated EU zones where DPI is illegal — make it your
  *primary* detection: **the legal-evidence tower, and the star of the no-logs acts.**
- **The Full-Packet Tap is its full-fidelity sibling** — see every east-west packet, payload included:
  the only thing that un-maskably catches the webshell walk and the exfil trickle. **The cost is
  moral and legal:** the tap holds your customers' secrets, so regulated maps make it **contraband**
  (possession is an audit failure, or a Wiretap-Counter demand from a customer's government), and it
  needs its own physical security — **the tap room is the room your worst insider sells.** The game's
  clearest privacy-versus-safety dial, as one object.
- **The traffic-mirror twin** copies the stream to your security stack without slowing the path —
  inline versus out-of-band defense economics — and **collector storage is the hardware form of the
  log-volume/privacy tension.**
  **Hosting types:** all; regulated (illegal), game/dev (godlike).

### API Gateway (the toll plaza)
Every customer *program* that touches your platform passes a metered booth.

**Gives:** keys, quotas, throttles, **and your billing signal.** Per-key quotas made concrete; a
**schema-validation gate** that bounces malformed requests at the booth rather than at the DB (a WAF
for machines); and **metering taps that feed the billing engine.**
**Opens:** its **key database is an exfil magnet — one leaked gateway key impersonates your whole
customer roster**; and **killing the gateway is revenue denial**, because free rides are not an
outage anyone's monitoring alerts on.
**Interacts with:** the Identity Provider's auth pass-through (§4.5), the Metering & Rating Engine
(§4.9), the metadata-heist threat family, the Rate Limiter's per-cost keying (§4.5).
**Hosting types:** cloud, SaaS, API-everything.

### Network Config Backup + Diff
Automated nightly export of every switch, router, firewall and PDU config, with a visible diff.

**How it works:** Device replacement in minutes instead of hours; and **the diff view answers "what
changed on the network" instantly, which is the first question of half of all incidents.**
**Costs:** trivial — deliberately one of the cheapest, most powerful purchases in the game, **and
players will still not buy it until a switch dies.**
**Opens:** a repository containing every credential and every ACL in your estate — a very high-value
target. (Encrypt it, and now the encryption key is a dependency.)

**Variations and additions**

- **The Config Locker, stated as the pitch** — servers get backups; routers, switches and firewalls
  get *pray* — until you rebuild VLAN 7 from memory at 4am and miss one ACL line. **Reading the diff
  is how drift becomes visible before it becomes an incident**, and the payoff is one-click
  restore-from-known-good during a fat-finger incident: **a six-hour outage becomes a six-minute
  one.**
- **The tax:** configs contain secrets, so the locker's security is a **sub-graph** with a
  secrets-manager dependency, and **an attacker who reads your configs maps your estate for free.**
  **Hosting types:** everything with more than three network boxes.

### Tap / Port Mirror — "The Periscope"
Lets your IDS see traffic it otherwise couldn't.

**How it works:** A placement puzzle with a visible answer: **you can see exactly which lanes it
covers as a highlighted subset.** Mirroring costs switch capacity and doubles some traffic internally.

**Variations and additions**

- **The SPAN/port-mirror collector is the Full-Packet Tap** — see the East-West Sensing block under
  Flow Telemetry for its legal, moral and physical-security costs. The placement puzzle is the same;
  the difference is that a tap sees *everything* in the lanes it covers, which is exactly why some
  levels forbid owning one.

### Patch Panel — "The Jack Field"
The canonical wiring UI element.

**How it works:** A grid widget you can click into. Real satisfaction in filling one neatly.
**The honest cost (wave-2):** **structured cabling is a commitment.** Patch panels mean every
connection costs two patch cables and a port on each side, so you consume ports three times as fast,
and re-patching becomes a documented change rather than "move the cable." A patch panel also adds a
physical hop that appears in the Latency Ladder. **Point-to-point is faster today and unmaintainable
at 200 cables; the crossover point is around one rack**, and letting the player *live with*
point-to-point until it becomes unbearable is better teaching than offering the panel up front.

**Variations and additions**

- **Patch cables are inventory** — a consumable you can run out of, which makes a re-patch a supply
  question as well as a change question.
- **Neat beats messy, mechanically** — Velcro-tied bundles (an upgraded cabling tech) reduce failure
  chance; spaghetti is visually chaotic *and* mechanically fragile, because **messy cabling slows
  incident response and tidy cabling speeds everything.** In audit levels it is the difference
  between sticky notes and a gold checkmark.
- **Elevated cable trays are a third layer** — routing through them avoids rodent-floor risk, while
  trayless runs sag into visible trip hazards. Raised floors and conduit give **passive adjacency
  bonuses**: cleaner cabling means faster repair crews and rat resistance.
- **The cheapest defense-per-dollar in the game, and nobody places it: the Fiber-Cleaning Kit.**
  **$30**, janitor-class, roughly one use, and it cures Dirty Connector events in one satisfying
  sparkle.
- **Visual:** as a hero prop, the network core is an **oversized patch panel with real-looking
  cabling**, judged entirely by how full its ports are — early game a few neat fibres, late game a
  glorious nest.

### Looking Glass / Public Route Server / Public Speed Test
Marketing disguised as a tool.

**How it works:** A public page showing your routing table and letting anyone run a traceroute from
your network. Costs nothing, is used by other engineers evaluating you, and feeds Engineer Reputation
directly.
**Opens:** free reconnaissance for attackers. **A build whose attack surface is transparency itself.**

### QoS / Traffic Shaping Policy
**The tower the game is otherwise missing entirely: prioritization rather than blocking.**

**Gives:** classify traffic into classes (interactive, bulk, replication, backup, management) and
guarantee each a share of the link. A backup job can no longer starve a customer's checkout. Turns a
congested link from "everything is bad" into "the right things are fine."
**Costs:** cheap in money, expensive in thought — every class you define is a policy you must
maintain, and the classification itself is CPU on the device.
**Opens:** misclassification (traffic you didn't categorize lands in the default class and starves),
and **the management class you forgot to protect — so during the congestion event you cannot log in to
the device causing it.**
**Why it matters mechanically:** it is a defense that costs **nothing in Friction to legitimate
visitors** and costs something to *other legitimate traffic of yours* — a new and interesting kind of
tradeoff for this game, and the most obviously correct missing feature in a game whose central pillar
is a shared pipe.

**Variations and additions**

- **It decides *who suffers* in congestion** — latency for gamers versus throughput for backups, as a
  policy-dial tower rather than a background setting. **Hosting types:** WISP, game hosting.
- **It is the concrete, placeable implementation of the Graceful Degradation Ladder** (§8 core
  mechanics) — the ladder made into an object you put somewhere.

### Load Shedding by Priority
Deliberately serving fewer people, well.

**How it works:** A pre-configured policy: under overload, shed in this order — free tier, anonymous
traffic, background jobs, non-paying features, low-tier customers. The alternative, uniform
degradation, means *everyone* has a bad time. **Choosing who suffers, in advance, in peacetime, is one
of the most interesting decisions in operations**, and it should be an unlock the player is *thrilled*
to get, because it converts a loss into a choice.

**Variations and additions**

- **The Load-Shedding Breaker Panel** — the policy given a big red master switch with a **priority
  ladder**: in any crisis (power, flood, DDoS, thermal) you deliberately drop service classes — free
  tier first, then tourists, then monthly, **never the whales (or do you?).** Each shed segment
  bounces *instantly and by choice*, which is cheaper churn than a random collapse, and
  **pre-assigning the ladder lets your staff auto-shed while you fight elsewhere.**
- **The dark upgrade** — "automatic tiered service" is **the net-neutrality dial**: paid lanes shed
  last, and regulators *notice*.
- **Static Site Fallback** — a cheap emergency mode serving a stripped-down static version of the site
  when the main infrastructure is overwhelmed. **Keeps some revenue flowing during a brownout instead
  of zero.**

### Admission Control and Bounded Queues
Saying no at the front door.

**How it works:** A queue with a bounded length and a rejection policy **at the edge**, so overload
produces fast, cheap, honest failures instead of slow, expensive timeouts. The counterintuitive
lesson: **rejecting 10% immediately serves the other 90% properly; accepting 100% serves nobody.**
**Interacts with:** the Circuit Breaker (§4.5), Backpressure (§4.11), the Queue Dial.

### The Queue Dial
One slider that exists on every capacity-bearing node.

**How it works:** Queue depth, 0 to deep.
- **Shallow queue** — fast failure. Requests over capacity are dropped instantly with a `503`. Low
  latency for the served, high visible error rate, no stale work.
- **Deep queue** — nobody is refused, everybody waits. High latency, patience drains, and the classic
  disaster: **you serve requests whose senders left four seconds ago**, burning capacity on work
  nobody wants.
The correct setting differs per visitor archetype (an API client wants shallow plus `Retry-After`; a
checkout wants deep; a live stream wants shallow) and per level, which makes it a genuine recurring
decision rather than set-and-forget.
**Why:** one slider, everywhere, always consequential, teaching the most counterintuitive thing in
operations — **serving errors quickly beats serving nothing slowly** — and it makes "queue as physical
stacking" mechanically meaningful.

### Structured Cabling Tray / Overhead Ladder Racking
Where cables must route if you want the neat look.

**How it works:** Routing outside the tray creates the Rat's Nest. See §4.7 for the tidiness economy
this feeds.

---

## 4.5 Defenses

*Wave 2's largest structural contribution to this category: defenses stop being a list of fourteen
purchases and become a system with **roles**, **placement**, **tuning** and **coverage** — four
orthogonal skills instead of one shopping decision.*

### The Nine Defense Roles
Every defense carries exactly one primary role tag. The palette, the Coverage Grid and the stacking
rules all read from it.

**The roles:**
- **Absorb** — soak volume so it never reaches you. *(Scrubbing, anycast, CDN, edge cache, transit
  headroom.)*
- **Block** — drop it outright by a coarse rule. *(Firewall, ACL, geo-block, blocklist, RTBH.)*
- **Classify** — decide what a thing *is* before deciding what to do with it. *(WAF, bot
  fingerprinter, IDS signatures, spam scoring, fraud screening.)*
- **Meter** — allow it, but bounded. *(Rate limiter, quota engine, admission control, spend cap,
  connection limits.)*
- **Deter** — raise the cost of trying, so fewer try. *(Proof-of-work, CAPTCHA, MFA, visible hardening,
  legal notices, abuse-response reputation.)*
- **Divert** — send it somewhere that isn't your real thing. *(Honeypot, decoy origin, tarpit lane,
  sinkhole, sacrificial endpoint, null-route pool.)*
- **Contain** — bound the blast radius after something gets in. *(Segmentation, microsegmentation,
  cells, bulkheads, egress filtering, least privilege, compliance boundary.)*
- **Detect** — know it happened. *(IDS, SIEM, FIM, honeytokens, flow telemetry, monitoring,
  anomaly detection.)*
- **Recover** — get back to good. *(Backups, snapshots, immutable rebuild, golden images, failover,
  restore drills, runbooks, spares.)*

**How it works:** Tagging is mandatory at authoring time and appears on the Build Card. A palette
filtered by role lets a player under pressure ask "what do I own that *Contains*?" instead of scanning
an encyclopedia.
**Interacts with:** the Build Role Taxonomy (§4.1), the Coverage Grid, the stacking rules.

### Sensor vs Enforcer doctrine
A second axis across the same roster: **what a defense is allowed to *do* about what it sees.**

**How it works:** Every detection-capable object is tagged **Sensor** or **Enforcer**. **Sensors
reveal** — passive taps, flow telemetry, IDS in detection mode, honeytokens, synthetic probes — and
they are **cheap or free in latency**, because they sit beside the path rather than in it.
**Enforcers decide** — WAF, IPS, rate limiters, inline scrubbing, admission control — and **every
enforcer costs latency and can be wrong about a customer.**
**Why it belongs:** it fixes the vague overlap between the IDS, monitoring and WAF entries by naming
the thing that actually separates them, and it gives the player a rule they can act on under
pressure: **"if I only need to know, buy a sensor; if I need it stopped, pay the enforcer tax."**
**Interacts with:** the Nine Defense Roles (Detect versus Block/Classify/Meter), the Coverage Grid,
"log only" as a third position on the aggression slider, the Flow Lens and the Tap (§4.4).

### The Coverage Grid
The single screen that tells you what you are actually protected against.

**How it works:** A matrix: **threat roles down one axis, your nine defense roles across the other**,
with each cell showing your coverage for that pairing — filled, partial, or **empty**. An empty column
is a role you own nothing in; an empty *cell* is a specific way something can reach you. The grid is
generated from your placed objects' role tags, so it is always true and never hand-maintained.
**Why it's the best UI in the category:** the classic operator failure is not "I had no defenses," it
is "I had six of the same kind." The grid makes that legible at a glance, and it turns the shopping
decision from "what's strong?" into "**what am I missing?**"
**Pairs with:** the Waste Indicator (below), which is the grid's negative image.

### Defense-in-Depth stacking rules
*Without these, stacking defenses is either free or unknowable — and "layered defense" is a phrase the
design uses everywhere and models nowhere.*

**How it works:**
- **Coverage composes multiplicatively; latency composes additively.** Two Classify defenses with 0.5
  and 0.6 catch rates give **0.80** combined — but you pay **both** latency costs and **both**
  friction costs, and false positives also compound (1 − 0.96 × 0.97 = **6.9%**).
- **Same-role stacking has hard diminishing returns.** The third defense in a role contributes at 50%
  effectiveness, the fourth at 25%. The UI shows this as a **greyed portion of the added bar** — you
  can see the part of your purchase that does nothing.
- **Different-role stacking has a synergy bonus.** Classify + Contain gives a 15% reduction to the
  damage of anything that *does* get through, because it can't spread. Detect + Recover halves MTTR.
  **Deter + Divert stacks into "they stop coming" twice as fast.**
- **The Waste Indicator.** A defense whose catch is >80% covered by another defense renders with a
  small "redundant" pip and a running counter of **the latency it has cost you for nothing.** The
  single best anti-hoarding mechanic available.
**Net effect:** breadth becomes mechanically better than depth, which is both true and good play.

### Defenses live on edges, not on the board
A placement rule that turns §4.5 into a game.

**How it works:** A defense is placed **on a link**, and taxes only what crosses that link. A WAF in
front of one customer's app protects that app and costs *that* traffic latency. This makes coverage
spatial, makes the Tap/Port Mirror puzzle meaningful, and makes "where do I put my one expensive
thing?" the recurring question.
**⚔️ Tension:** some defenses genuinely are global and cannot sit on one edge (scrubbing, blocklists,
badge access, policies). Those are explicitly flagged **Global** on their cards, and the game should
keep that set small — a global defense is a much stronger purchase than an edge one and should be
priced like it.

### Every defense has an aggression slider
One learnable interaction, applied universally.

**How it works:** The WAF and the spam filter already have one; give it to **all of them**, with the
same widget and a **live two-sided readout: catches vs false positives, the two numbers the same size,
side by side.** The slider sits **on the object's faceplate**, not buried in a panel — a tower with a
live dial is worth ten towers with a fixed stat, and the player will move it during every fight.
**Add a third position the design is missing: "log only."** Running a defense in detection mode for
two weeks before enforcing is how this is actually deployed, it costs nothing but patience, and it is
the correct answer almost every time.

### The Defense Off-State and the Mis-Tune State
Two states nothing currently renders.

**Visual:** A defense that is **off** has its mechanism physically parked — the turnstile arm raised,
the lattice dark, the scanner dish stowed — plus a small dust film, so it reads as *out of service*
rather than merely dim. A defense that is **mis-tuned** shows strain: the turnstile clicking too fast,
the lattice flickering, and — critically — **amber accumulating in its Mound of the Stopped** (the
visible pile of what it has blocked, where amber means "this was one of yours"). A rule that has never
fired develops a distinctive **cobweb decal**.

### WAF (Web Application Firewall) — "The Sieve"
Stops the SQLi/XSS/traversal class. **The flagship Shared Pipe tower.**

**Costs:** expensive, high upkeep, and constant rule tuning (a recurring staff-hand cost).
**Friction:** 3–8%.
**Opens:** false positives that bounce real customers and **break customer applications in ways they
blame you for** ("your firewall blocked my own admin panel"); a rule update that blocks all POST
requests; per-customer tuning burden; and **a false sense of security that delays fixing the actual
code.** Also sellable as a security add-on — a double-duty tower.

**Split the object (wave-2 correction), which also creates a genuinely good decision.** The "+40ms on
every request" figure is right for a *cloud* WAF and wrong for an *inline* one:
- **Inline WAF** — **1–5ms**, CPU cost that grows with your traffic, you own the rules and the tuning,
  and it sits inside the blast radius of your own outage.
- **Cloud WAF** — **meaningful added latency (~40ms)**, no CPU cost, DDoS absorption included, rules
  maintained by someone else — **and it only works if your origin IP stays secret**, which connects it
  directly to the CDN entry's origin-exposure risk.
A real architectural fork with real numbers, currently one blurred object.

**Visual:** a shimmering green energy lattice / scanning curtain in front of the gatehouse. Units pass
through and get briefly x-rayed, revealing their true nature; hostile shapes flash and dissolve — and
**false positives are drawn as a *cyan* visitor dissolving too, with a small guilty pip.** The pip is
**amber, not red** (amber = your own defenses hurting you), and the dissolve feeds the **Mound of the
Stopped** so the evidence accumulates rather than flashing past. Alternative read: **"The Sieve"** — a
fine mesh in front of an app; things it catches **stick to it and accumulate as gunk that must be
cleaned (tuning), and a clogged sieve slows good traffic** — a visual model of false positives and
overhead in one object.

**Variations and additions**

- **Firewalls block packets; the WAF blocks *lies*.** It is specifically the counter to
  disguised-threats walking the customer lane, and with fingerprint checks it also catches
  credential-stuffing floods. **Rule maintenance is ammunition:** signature updates arrive *after* new
  attack types appear, which wires it directly into the discovery loop.
- **The mask trade.** A WAF tuned to stop *novel* injection stops your customers' *legitimate* posts
  — the forum user whose apostrophe in a signature gets blocked, and the resulting "I can't type
  apostrophes" ticket, which is a real helpdesk genre. The meta-lesson: **the WAF is a scanner speed
  bump, not a wall.**
- **Tuning as active management** — rules enabled aggressively mean more false positives, loosely mean
  more breaches, and the **accuracy dial is the toy.** Over-tightening should render as **sad
  customers denied at the gate**, not as a percentage.
- **Visual variants.** A **stained-glass window** that packets pass *through*, dyeing the bad ones
  out, with upgrades adding more coloured panes (rule packs). Or a **humanoid sentinel at the web
  door** doing slapstick pat-downs and tossing injected payloads out by the scruff, with upgrades
  going from mirrored shades to *bigger* shades. Or the velvet-rope **bouncer booth with a
  clipboard**, checking every "customer" for the sprite-tear tell.

### Rate Limiter (per-IP / per-endpoint / per-ASN) — "The Turnstile"
Cheap, effective, and **the single biggest source of accidental visitor-killing.**

**How it works:** Placeable at multiple points (edge, LB, app, DB) with different tradeoffs, and tiered
granularity as an upgrade path. Tunable via a slider the player will move during every fight.
**The dimension that matters most and is missing: what you key on.**
- **Per-IP** — breaks carrier NAT, corporate offices, schools and entire countries.
- **Per-session** — defeated by clearing cookies.
- **Per-account** — only works post-login.
- **Per-ASN** — blunt but effective against cloud-hosted bots and **harmless to residential users.**
- **Per-fingerprint** — expensive, and inherits the fingerprinter's problems.
- **Per-cost** — a token budget where an expensive endpoint consumes more than a cheap one. **By far
  the best answer and the one real operators arrive at last.**
Making the *key* a player choice rather than just the threshold turns one slider into a real tower with
an upgrade path.
**Opens:** catastrophic collateral against NAT'd legitimate populations — and the game should
demonstrate this with a **specific named customer**, not a statistic.
**Visual:** a physical **turnstile** on the path, clicking. Excess visitors visibly bunch up behind it;
**a mis-tuned limit is instantly visible as a crowd of cyan circles stuck at a turnstile.**

**Variations and additions**

- **The SYN-cookie gate is the same object at layer 4** — the purest customer-versus-threat tradeoff
  tower in the game, and the answer to both mimics and floods-with-a-face. **Strictness converts
  directly into customer bounces.**
- **The harsh setting hits impatient real customers first** — which is precisely the HN-hug visitor
  archetype, so the tuning mistake costs you the traffic you were celebrating.
- **Pair it, or it fails alone** — CAPTCHA gates and API-key quotas for cheap bot control; it is
  **ineffective against distributed botnets**, which is what the scrubbing service is for.

### CAPTCHA Gate / Challenge Gate
Stops bots hard. **The bluntest instrument in the game.**

**Friction:** 12%+, and higher on mobile visitors.
**How it works:** Correct in emergencies, disastrous as a default. Should be available very early so
players learn to regret it. Proof-of-work is the same object with a different flavour: it costs the
visitor's device instead of their patience.
**Visual:** a puzzle-arch. Bots dissolve; real visitors pause (patience ring drains a notch) and some
annoyed ones *leave*. **The cost of security friction rendered as literal lost customers** — the truest
thing in the whole game.
**Sharpen the regret so it lands inside one wave:** the false-positive counter sits **right next to
the "bots blocked" counter, the same size** — *the lesson is the adjacency of the two numbers*, and
most games would show only the flattering one. And the humans who leave should **turn around at the
arch and walk back out through the incoming stream, against the flow**, which is visually disruptive
on purpose. You should find it annoying to watch.

### Bot Fingerprinter / Behavioural Analysis
Identifies Mimics *without* friction. Expensive, slow to train, data-hungry.

**⚔️ Tension / balance fix:** as originally written this is "the late-game answer to the game's central
dilemma" — which means the central dilemma has an expiry date and the last third of the game goes
flat. Two reviewers independently flagged it. The resolution is that it **narrows the overlap, never
eliminates it**, and pays for its power:
- **A training period** during which its false-positive rate is *worse* than a WAF's.
- **Model drift** — accuracy decays as attackers learn the profile, requiring periodic retraining
  (a recurring cost with a **visible freshness meter**).
- **Poisoning vulnerability** — an attacker who feeds it can shape what it believes.
- **A privacy/compliance cost** — behavioural fingerprinting is a regulated activity in some
  jurisdictions, with disclosure obligations following.
- **Most importantly: it blocks without a reason.** Its false positives generate the worst support
  tickets in the game, because neither you nor the customer can find out *why* they were blocked.
  That one property is real, specific, and preserves the central dilemma rather than dissolving it.
**Target end-state:** "I am 90% good at this and it costs me constant attention," not "solved."
**Visual:** the **Identification Reveal** — when a Mimic is unmasked it visibly **peels**: the friendly
visitor sprite cracks open and a red threat steps out. Loud, satisfying, always worth watching, with a
signature "tick-tick-tick… confirmed" sound.

### MFA / Auth Hardening
Reduces credential stuffing and the entire account-takeover family.

**Opens:** customer friction and a permanent increase in "I'm locked out" support tickets; a recovery
flow that is now the weakest link; and hardware-token logistics if you go that far. Also a **sales
prerequisite** — cyber-insurance underwriting and enterprise security reviews both ask.

**Variations and additions**

- **The patience tax is segment-specific** — the MFA gateway adds one hop of latency to the customer
  path, and **some customer mixes hate it far more than others**: devs shrug, gamers rage. Security
  is never free, and the bill is not evenly distributed.
- **The support-channel twin: the Callback-Verification Line.** Social-engineer "customer" callers —
  the ones who demand password resets and EPP codes to steal accounts and domains — **die at the
  callback gate.** Cheap, invisible, and the only defense against the industry's oldest breach.

### Identity Provider (the "front-desk master key")
Central SSO and MFA for your staff **and** your customers' logins.

**Gives:** one tower that **kills credential stuffing dead** — velocity rules plus an MFA challenge
gate — and one place to revoke everything.
**Opens:** it becomes **the single juiciest target on the map. IdP compromise opens every door at
once** (a boss-tier event), and **IdP *downtime* means nobody can do anything, including you** —
lockout comedy, with your own staff towers standing around shrugging.
**Upgrade path:** password → TOTP → hardware keys → passkeys. Each tier lowers the friction tax
**and re-routes threats toward vishing and SIM-swap** — the defense does not remove the attack, it
*moves the battlefield*, which is the most honest thing an auth tower can teach.
**Interacts with:** the Bastion (§4.4), the Secrets Manager (§4.3), the API Gateway's auth
pass-through, the Break-Glass Safe (the answer to "your identity system is the outage").
**Hosting types:** all. A mid-game unlock and an end-game religion.

### fail2ban / Dynamic Blocklist
Cheap early defense, extremely satisfying to watch.

**Opens:** a **self-DoS** when a legitimate NAT'd office of 200 users trips the threshold and the whole
company is banned; plus log-parsing CPU cost at scale, and a blocklist that grows until it is itself a
performance problem.

**Variations and additions**

- **As a floor trap** — it watches auth logs, and repeat offenders get **dragged off and added to a
  ban list** that pre-blocks them for the rest of the level, or world-wide across your whole network
  as an upgrade. Cheap, reactive, and extremely satisfying to watch.
- **False bans are apology tickets** — including the scripted event where it bans **your biggest
  customer's office IP.**

### IDS / IPS Sentry — "The Radar Dish"
Detects Stealth-role threats; **the only counter to APTs.**

**Opens:** encrypted-traffic blindness (needs TLS termination in front of it), rule-tuning labour,
false positives that block real visitors, the data volume itself, and **alert fatigue as a literal
mechanic** — too many alerts and the player's real one gets buried. **A tower that can be
over-levelled into uselessness.**
**Visual:** a slowly rotating scanner dish emitting a visible sweep cone. Things caught in the cone get
outlined. **Detection ≠ prevention: IDS *outlines* and logs; IPS *shoots*.** The visual difference
between an outline and a beam teaches that distinction better than any text. A periodic **radar sweep**
across the board briefly reveals stealth units within detection range, turning "do I have enough IDS
coverage" into a visible, rhythmic, dread-inducing animation; upgrading widens the arc and speeds the
sweep, and watching a sweep pass over a Quiet One and outline it is one of the game's best moments.
**Alert fatigue, rendered:** as alert volume rises, the sentry's outlines get **thinner and more
numerous** until the board is covered in faint outlines — at which point a real one is genuinely hard
to spot. **Alert fatigue as visual noise you caused by buying too much detection** is the most honest
possible version of that mechanic.

**Variations and additions**

- **IDS is free vision; IPS spends customer trust.** IDS *reveals* stealth units in an area — ghosts
  become visible, poisoned nodes get flagged — while IPS auto-blocks and pays for it in
  false-positive churn. **Detection and damage are two purchases, and the pairing is mandatory.**
- **Upgrades add hound-bots** (cert sniffers) and widen the searchlight cone, so coverage growth is
  visible as geometry rather than as a number.
- **The SIEM pairing is what makes it think** — see the Log Aggregator / SIEM entry (§4.3) for
  correlation vision, signal-to-noise as its real stat, and log tampering as its own attack.

### Honeypot
Cheap, fun, and a progression engine.

**How it works:** Attracts attackers to a fake target, wasting their time and **generating Intel that
unlocks tech you haven't been hit by yet.** Capturing a threat alive lets you dissect it to unlock
counters early. **Converts a defensive build into a progression engine.**
**⚔️ Balance fix (flagged degenerate):** as written it is cheap and strictly positive, which makes it a
mandatory first purchase in every run. Give it real costs: **(a)** a honeypot is a live, exposed
service and a misconfigured one is a genuine foothold — **make the probability non-trivial, ~4% per
level unless maintained**; **(b)** Intel yield has hard diminishing returns after the second honeypot;
**(c)** attracting attention is *literally attracting attention* — honeypots raise your visibility
score, which raises the baseline scanner rate and the chance of drawing a targeted attacker.
**Visual:** a fake, slightly-too-shiny server with an exaggerated "VALUABLE" sticker. Attackers divert
to it, get stuck in a visible bubbling **tar pit**, and get tagged with a glowing marker that reveals
their future spawns.

**Variations and additions**

- **It is a discovery engine, not just a trap** — captured attackers are fingerprinted and pay
  **intel drops**: revealing the next wave's composition, funding research, and converting into a
  **temporary rule at your other towers.** The intel currency can even be **sold as attacker TTPs**
  to feed the threat-intel market.
- **It wastes DDoS waves on a jukebox**, and it earns the bonus **"Pentium 4 Trap"** achievement.
- **The honeypot hive** shows threat approach vectors as **dotted scouting lines**, revealing stealth
  enemies' paths for the whole level.
- **Place it in low-value zones as bait** — its position is the decision, not its existence.
- **Visual:** a deliberately glitchy treasure-chest with a pulsing bait shimmer while the real gear
  hides under a desaturated cloaking sheet. Or the **dual-perspective gingerbread render**: to your
  camera a shabby deco rack, in **Threat POV a glowing treasure chest with candy trim** — which
  teaches why bots love it without a single tooltip.

### The honeypot's escape risk — *CONFLICTING*

Everything about the honeypot is agreed except the one number that decides whether you build it:
**does the pot itself become a way in?** One document prices it as a live, exposed service that can
turn on you; the other prices it at zero surface and makes the only downside a comedy one. The
purchase is mandatory under one reading and optional under the other, so the two cannot both hold.

#### Position A — risky attractor, it can walk out *(master)*

A honeypot is **a live, exposed service**, and a misconfigured one is a genuine foothold: make the
probability non-trivial — **~4% per level unless maintained.** Intel yield has hard diminishing
returns after the second honeypot, and **attracting attention is literally attracting attention**:
honeypots raise your visibility score, which raises the baseline scanner rate and the chance of
drawing a targeted attacker. Under this reading the honeypot is a *gamble* that pays in progression.

#### Position B — zero-surface decoy *(opencode)*

"A fake, tasty-looking server parked **outside** your perimeter… **zero attack surface of its own.**"
The only costs are reputational and comedic: it costs reputation if customers accidentally wander
into it (rare, hilarious), and **misrouted customer visibility is the whole downside.** Under this
reading the honeypot is a cheap, safe intel engine and the question is only where to put it.

#### Position C — telegraphed breakout, with counter-play *(opencode)*

A middle law rather than a middle number: a honeypot that betrays you **with no counter-play**
discourages the best intel loop in the game. So make a breakout attempt a **visible, telegraphed
event with a window to douse it** — and let the player "salt the pot" for bonus intel while they do.
**Risk as drama, not as a gotcha.**

### The Decoy and the Sacrificial Service (the Divert family)
One honeypot is not a defense role. Build it out.

- **The Decoy Origin** — a fake IP that absorbs scanning and reconnaissance and makes your real origin
  harder to find. Costs an IP and a small amount of **your own** confusion.
- **The Sacrificial Endpoint** — you deliberately leave one cheap, isolated, heavily monitored service
  exposed *specifically* so attacks path there. **It is the mazing lure: it shapes threat pathing the
  way a maze shapes creep pathing.** If it's too convincing, a real customer uses it.
- **The Tarpit Lane** — suspected traffic is routed into a deliberately slow path. Costs nothing but
  **the attacker's** time; catastrophic if you misroute a whale.
- **The Null-Route Pool** — pre-arranged blackhole IPs you can move a tenant onto in three seconds.
- **The Bait Account** — a fake customer record whose appearance in a dump **proves your breach's
  date**, which is otherwise unknowable.
**Why:** Divert is the role that gives the player *agency over threat pathing* — the thing a
tower-defense player most wants, and which this design otherwise offers only passively.

### The Tarpit
A tower that does no damage and buys time.

**How it works:** Holds attacker connections open, consuming *their* resources instead of yours. Cheap,
and it punishes scanners deliciously. **The genre needs more towers whose output is time.**

**Variations and additions**

- **The hold-versus-cost maths, made explicit** — holding an attacker costs bandwidth units *the
  attacker would otherwise have spent on your customers*, so **the tarpit's bill should be on the
  card.** It is a dam for hostility: the message-queue dam's evil twin.
- **Loop cascade** — tarpitting an *autoresponder*-class threat makes it worse, so the tower has real
  rock-paper-scissors relations rather than a flat effect.
- **Visual:** bots sink into the molasses pit, visibly slowed and decaying — an anti-bot soft control
  that costs you throughput **on purpose.**

### The Sinkhole
Redirects malicious traffic into a pit, where you can study it.

**How it works:** Generates Intel like the honeypot but without pretending to be a service — it is the
*destination* rather than the *bait*. Pairs with RTBH as its blunt cousin.

### /dev/null Pit Tower
A literal pit that swallows small threats — they fall forever.

**How it works:** The humour buildable of the Divert family, and the visual joke that makes RTBH
legible later: this is what "null route" *looks* like before you learn what it costs. Small threats
vanish with a satisfying doppler; anything large simply does not fit.
**Interacts with:** the Null-Route Pool (the Divert family, above), Upstream Blackhole Signalling
(§4.4) — **the same verb, one at toy scale and one at carrier scale.**

### The Canary
An early-warning unit that **dies first and loudly.**

**How it works:** A deliberately fragile, deliberately exposed, deliberately cheap sentinel — a small
instance in the same failure domain as something you care about, wired to page you when it dies. It
does no damage and blocks nothing; its only output is **time.** Place one in each power zone, each
cooling zone, each cell, each network segment.
**Opens:** an alert source with a false-positive rate of its own, and the temptation to silence it
because "it's only the canary."
**Visual:** a small bird-cage object; when its zone degrades, **the cage goes quiet before any graph
moves.** Silence as an alarm is a genuinely unusual and effective game signal.

**Variations and additions**

- **The Canary Rack** — the same idea at production scale: a lone, live, **disposable** copy of your
  stack, wired to mirror prod traffic and running next to the fleet. **Zero-day meteors and unknown
  exploits hit it first** — any attack that reaches it detonates with a loud audible pop and grants a
  **full-wave telegraph plus forensics on the attacker type.** The cough *is* the CVE-calendar early
  warning you were paying for.
  It can be **aggressively exposed on purpose** — open everything, it's bait — which makes it a
  honeypot hybrid, and the "honeypot gone wrong" risk applies to it in full.
  **Costs:** one rack's worth of burn, forever.
  **Hosting types:** VPS, web, cloud.

### Canary Credentials / Honeytokens
Fake secrets planted **inside real systems**.

**How it works:** An AWS-looking key in an old config, a decoy admin account, a fake customer database
row. **An extremely low-false-positive breach signal** — unlike a honeypot (a fake *server*), these
detect the attacker who is *already in*, which is the detection problem the APT threat otherwise has no
cheap answer to.
**Costs:** trivial money, plus the discipline to document where they are so your own team doesn't chase
one.
**Opens:** nothing technical, and **one excellent comedy beat where a new hire finds the decoy
credentials and helpfully "fixes" the security problem by rotating them.**

### Threat-Intel Feed Tower
Subscribe to your allies' intelligence to preview enemy wave composition.

**Gives:** advance sight of what is coming — the wave-composition preview the honeypot produces
locally, bought wholesale instead.
**Costs:** a monthly subscription, and **it leaks *your* attack data** into the pool: reciprocal risk
is the price of reciprocal vision.
**Opens:** a feed you now trust, which an adversary who understands that can shape.
**Interacts with:** the Honeypot's intel drops (sold *into* this market), the SIEM, §5's research
tree.

### File Integrity Monitoring
The only reliable webshell detector.

**Opens:** false-positive noise every time anyone legitimately updates anything — so its real cost is
that it trains you to ignore it.

### SBOM / Software Inventory
A live list of what software, at what version, runs where.

**Gives:** the ability to answer **"are we affected?"** in minutes instead of days. **This is the tool
that makes a zero-day survivable**, and it is what turns the Log4Everything-class threat from a
week-long scramble into a triage exercise.
**Costs:** ongoing maintenance and a scanning agent per host.
**Opens:** **a complete map of your own attack surface, in one file**, which an attacker would very
much like to have.

### Patch Cart / Patch Management
Keeps your fleet current.

**How it works:** **Patch lag as a visible per-object stat** — days since last patch with a colour ramp.
When a zero-day drops, the map lights up by patch lag and **the triage order is immediately visual.**
Pairs with the SBOM: the SBOM tells you *which*, the patch lag tells you *how bad*.
**Visual:** a wheeled cart a tech pushes down the aisle; machines it services flash green and shed
their "vulnerable" badges. **A fleet with all-green pips is a beautiful sight and a real goal.** The
pip colour ramp lives **on every machine's faceplate at all times**, not only inside an overlay,
because patch lag is a constantly-worsening background stat — so when a zero-day drops, **the fleet's
existing pips *are* the triage order, with no new UI.**

**Variations and additions**

- **The Patch Management Robot** — periodically auto-patches a zone, so **zero-day meteors fizzle
  there**; the downtime window during the patch bounces customers briefly, which makes it a **timing
  puzzle** rather than a free win.
- **Three tiers** — **manual** (slow, free) → **staged** (automatic but canaried) → **auto-all**
  (fast, and **one bad patch is a fleet-wide outage**). The Canary Rack is the staged tier's partner
  object.

### Golden Image Bakery
A pipeline that produces a known, versioned, tested base image for every machine.

**Gives:** the **Rebuildability** stat drops fleet-wide. Recovery from compromise becomes "redeploy"
rather than "investigate and clean." New machines are identical **by construction** rather than by
convergence.
**Costs:** a build pipeline, image storage, and the discipline to rebuild rather than patch in place.
**Opens:** **a vulnerability baked into the image propagates to every machine you build from it**, and
machines built last month become a different generation from this month's — **"generational drift,"
which is config drift with a version number.**
**Visual:** feeds the Golden Image Tint (§4.1).

### Sandbox / Threat-Analysis Gate + Detonation Chamber
Hold it briefly, and find out what it is before it touches anything.

**The gate:** Holds packets briefly for deep inspection — **adds latency to ALL traffic** and kills
evasive threats (polymorphic malware bots, rootkit files). The friction/security dial in its purest
inline form.
**The chamber:** The deploy-side sibling — a quarantine lab that **burns every update, package and
dependency before it touches your estate.** Small CPU upkeep plus a **deploy delay: the safety tax.**
It catches supply-chain trojans and poisoned updates with a visible "eaten crate" animation, and
higher tiers **auto-generate signatures into your WAF.**
**Also called:** the Detonation/Canary Box, the sandbox lane, the sacrificial server — new software
executes *there* first, so supply-chain poison detonates somewhere that doesn't matter.
**Interacts with:** the Artifact Registry Mirror (§4.6), the Canary Rack (§4.5), the Immutable
Rebuild Pipeline, §3's supply-chain threat family.
**Hosting types:** all with a deploy pipeline; mandatory in CI and platform acts.

### Immutable Rebuild Pipeline
Lets you re-create any compromised node from scratch in seconds. **The counter to persistence.**

**How it works:** Expensive, and it requires discipline upgrades (no pets, no manual fixes, no state on
the node). The payoff is that "we think it's clean" becomes "it is new."

### Circuit Breaker
Auto-sheds when a dependency is sick.

**How it works:** Placeable, tunable, and prevents cascade failure. **The first automation that feels
like a superpower**, and the build that teaches the counterintuitive lesson that **serving errors
quickly is better than serving nothing slowly.**
**⚔️ Balance fix (flagged as a Three-Column-Law violator):** give it the failure modes it really has —
**(a)** a threshold you can set wrong **in both directions**: too tight and it opens during normal
load spikes, cutting a healthy feature; **(b)** **half-open flapping**, where the breaker repeatedly
probes a recovering dependency and re-kills it; **(c)** **an open breaker hides the underlying
problem** — your alerting sees a healthy system serving fast errors and nobody notices for an hour.
**Visual:** a link that trips open and glows.

### Canary Deploy Rig / Blue-Green / Gradual Rollout
Sends 1–5% of traffic to the new version. **The single best bad-deploy mitigation.**

**Opens:** double capacity cost during rollout, and **schema changes that can't be blue-green'd** —
the specific case where the safest tool doesn't apply and the player has to know it.
**Visual:** a splitter feeding a visibly thin thread; the thread turns red if the error rate rises,
**before the main ribbon is affected.** Watching a single thin red thread while the main ribbon stays
cyan is exquisite tension.

**Variations and additions**

- **A rollback button with a cooldown** — the object's real gift is that it makes bad-deploy disasters
  *recoverable*, which in turn **unlocks a faster update cadence and therefore fewer CVE windows.**
  Deploy safety is a security purchase wearing a release-engineering hat.

### Feature Flags / Kill Switches
Runtime control without a deploy; instant mitigation.

**Opens:** **flag sprawl and combinatorial states nobody tested** — the debt that accumulates exactly
as fast as the capability.
**Visual:** physical toggle switches on a panel. Flipping one live is visible and scary.

**Variations and additions**

- **The Feature-Flag Switchboard** — a control panel of literal levers beside each service. New
  capability runs behind a flag at 0%, so **deploy risk *decouples* from release risk**: the bad code
  lands dark — the red pipeline goo runs but touches nothing — and you "roll the flag out" gradually
  **1% → 10% → 100% with a health gate at each stage**, watching customer halos, able to slam it off
  instantly with **no rollback wraiths.**
- **The dial is another dual flow** — roll out too slowly and the feature lands *after* the event it
  was built for.
- **The temptation:** flags **never get cleaned up.** Every stale flag is a cobweb-tagged tech-debt
  node that future threats exploit, and a **"flag burial" ceremony** task is how you pay the debt
  down.
  **Hosting types:** SaaS, Kubernetes, any software stack; sharpest in cloud/SaaS and game-launch
  levels.

### Chaos Monkey / Chaos Engineering Lab / GameDay
Deliberately break things in a controlled window to discover hidden dependencies before they discover
you.

**How it works:** Costs a small planned outage now; permanently reduces the damage of real failures
because you'll have built for it. **An opt-in difficulty increase that is also a strategy.** Gambling
in reverse. A player who runs gamedays should face fewer *surprise* catastrophes and more *scheduled*
ones.
**Visual:** a cage containing a visibly agitated little creature you can release during safe hours. Its
cage rattles.

**Variations and additions**

- **The Chaos Monkey Pen** — a *staffed enclosure* that breaks one of your own machines on a timer,
  and in exchange grants **stacking resilience buffs**: faster failover, tested backups, rehearsed
  runbooks. **You pay stability to buy resilience**, failover drills become a buildable with teeth,
  and it is the late-game anti-stagnation object.

### Load Testing Rig
Reveals the *actual* breaking point of your stack.

**How it works:** The game shows you a real number instead of a guess — **and reveals which component
fails first, which is almost never the one you expected.**

**Variations and additions**

- **The Load Testing Harness** — proactively simulates visitor volume *ahead of time* to reveal
  capacity limits before a real Capacity Forecast Miss (§3) lands. **Complementary to, not redundant
  with, the Chaos Monkey Pen: capacity-finding versus failure-finding.**

### Tabletop Exercise
Practice an incident with staff, no infrastructure involved.

**How it works:** Reduces human error during the real thing. **The cheapest defensive build in the
game.** Also the paid shortcut for unlocks: spend cash plus a senior hand to *simulate* an incident you
haven't had, unlocking its research node without the damage — **turning foresight into a purchasable
action**, which requires guessing correctly what's coming.

### The Break-Glass Safe
A sealed emergency credential with an audit trail.

**Gives:** a way in **when your identity system is the outage.** One use, logged, alarmed, and it
triggers a mandatory rotation afterward.
**Costs:** almost nothing, plus a quarterly test you will skip.
**Opens:** a credential that bypasses everything, which is exactly what an attacker wants; and a
credential that hasn't been tested in two years, which is exactly what you'll have.

### Abuse Detection Pipeline
Outbound traffic anomalies, spam scoring, port-scan detection, new-account behavioural scoring.

**How it works:** Essential the moment you have untrusted customers. It is the machine half of the
Abuse Desk (§4.9): the pipeline finds candidates, a human decides. Feeds egress filtering, per-account
quotas and suspension actions.
**Opens:** false positives that suspend a paying customer — the most reputationally expensive mistake
an automated system can make.

### Rate Limiting / Quota Engine (per-account resource caps)
Protects you from customers and customers from each other. **The direct noisy-neighbour fix.**

**How it works:** CPU, memory, I/O, inodes, processes, bandwidth, API calls, emails per hour. Cheap,
unglamorous, and the single most effective thing in shared multi-tenant lines.
**Opens:** a cap set too low turns a legitimate customer's success into a support ticket, and the
"unlimited" plan you sold makes every cap a contractual argument.

---

## 4.6 Observability and response

### Monitoring Stack (purchased in layers) — "The Watchtower"
Reveals the hidden state of everything. **Arguably the most important buildable in the game** — it is
the fog-of-war remover. Without it, threats damage you silently; with it, they are telegraphed.

**How it works:** Bought in ascending layers, each closing a different blind spot. Each layer has a
coverage, a blind spot and an **observation lag**, and each unlocks a **specific, nameable HUD
element**:

| Layer | What it sees | Blind to | Observation lag |
|---|---|---|---|
| Ping / port check | the box is reachable | the service being broken | 60s |
| Service check | the service answers | the answer being wrong | 60s |
| Synthetic transaction | a real user journey works | everything you didn't script | 5 min |
| Real User Monitoring | what real users experienced | anything that failed before reaching you | 2 min, sampled |
| Distributed tracing | **which hop** is slow | anything not instrumented | 10s, sampled |
| External multi-region synthetic | reachability from elsewhere | your internals entirely | 1–5 min |
| **Business-metric check** | signups/min, orders/min | nothing — but it can't tell you *why* | 1–10 min |

**The sixth layer that is chronologically first and conceptually last:** the **business-metric check**
— "signups in the last 10 minutes," "orders per minute." A single number that catches **every failure
mode the other layers miss**, including the ones where every component is genuinely healthy and the
product is broken: a payment gateway failing, a form-validation bug, a DNS record pointing at a
working server that serves the wrong site. **It is the cheapest and most powerful monitor in existence
and almost nobody builds it.**

**Two purchase axes the entry needs:**
- **Coverage is per-object, not global.** You buy a tier, then choose **which objects get an agent**,
  with a per-agent cost (money + a small performance tax + a small surface addition). Now "what do I
  instrument?" is a recurring choice, the Fog of Instrumentation becomes spatially meaningful, and
  the classic failure — the one uninstrumented thing being the thing that breaks — becomes **the
  player's own doing.**
- **Retention vs resolution.** You store a year at coarse resolution or a week at fine. Choosing wrong
  means that during a post-incident investigation, **the data you need has already been rolled up
  into an average.**

**Opens:** alert fatigue; cost that scales with data volume and becomes shockingly expensive;
cardinality explosions that kill your own monitoring; consuming resources on the things it watches;
generating the logs that fill your disk; **the monitoring blind spot — your monitoring runs *inside*
your network and structurally cannot tell you that you are unreachable from outside**; and **the
monitoring system itself as a dependency that can die and leave everything green forever.**
**The rendering rule that teaches more than a paragraph:** **uninstrumented means *no data*, not
zero** — and the UI must **never draw "no data" as a flat line at zero.**
**A cheaper, blinder upgrade that is realistic and tempting:** **sampling.**
**Visual:** the **Monitoring Wall** as a physical buildable — a wall of screens at the end of the room.
**Building it *unlocks HUD features*: graphs, alerts, the Timeline Ribbon's forecast section. Buying
UI as an in-world object** is the best diegetic-progression idea in the design. The wall's screens
**physically fill in one at a time as you buy layers** — an empty wall of dark monitors at Tier 1, a
full NOC wall at Tier 4. **The wall's fullness is your observability score.** Complementarily, the
**Observability Agent** is a tiny antenna module clipped onto each machine; machines without one render
**fogged out** in metrics overlays — "you can't see what you don't instrument," rendered literally as
fog of war over your own datacenter. And the watchtower's sweeping light is what *reveals* problem
indicators at all: **without monitoring, failures are still drawn but carry no alert glyphs, so you
must notice them yourself. Monitoring literally lights up your world.**

**Variations and additions**

- **Two Eyes that disagree.** An internal agent *says it's fine* (green) while the **outside prober
  times out** — a routing or border issue. "The servers are fine, it's the network!" Two monitoring
  towers with contradictory readings force the player to **triangulate**, which is literally the job.
- **The anti-fog-of-war framing** — the Observability Eye does no damage; it *reveals* stealth threats
  (cryptojacker vines, insider misbehaviour, APT stages) and turns hidden meters visible (heat, packet
  loss, parasitism). **Unmonitored failures are invisible enemies**, and hardware decay runs invisibly
  without it.
- **Alert volume spawns noise-creatures** that hide the real signal, and the **boy-who-cried-wolf
  meter degrades vision itself** — over-alerting is not a debuff on you, it is a debuff on the tower.
  Alerts also need a **pager system between them and the staff**, or nobody acts on them.
- **"You can't honour an SLA you can't measure"** — monitoring is what feeds uptime metering and
  credits, which makes it a *revenue* dependency as well as an operational one.
- **The NOC/SOC Wall as a meta-building** — an in-world wall of TV monitors rendering live game state,
  where higher tiers buy a **more readable map at scale**: cell-level detail, then predictive
  sparklines. **Buying readability is a legitimate economy lever** — the defense against
  unknown-unknowns is literally the ability to see — and without it alerts are only ambient.
  **Visual:** detection reveals a stealth unit with a **horizontal scanline wipe**, and the revealed
  unit hangs in **wireframe for two seconds before texturing in** — the "gotcha" beat as the game's
  most satisfying sentence.

### External / Synthetic Monitoring
Checks from outside, from multiple regions. Cheap. Essential.

**How it works:** Catches DNS, BGP, certificate and CDN failures your internal monitoring is
*structurally* blind to.
**Opens:** low-value alerts from flaky vantage points.

### External Vantage Fleet
Probes in other people's networks — monitoring from the customer's side of the internet.

**Gives:** latency, reachability, DNS resolution and TLS validity measured from many ASNs and
countries. **The only tool that can see** a blended-transit downgrade, a lame delegation, geo-
misrouting, the whitelisted-office blind spot, and a BGP hijack.
**Costs:** cheap monthly, plus a modest flood of low-value alerts.
**Opens:** alert fatigue from *other people's* networks having bad days — which teaches the player to
require **N-of-M agreement** before believing a probe, a genuinely good lesson about distributed
measurement.

### The Synthetic Customer
A fake tenant that is always running. **A strictly better version of synthetic transactions.**

**How it works:** You provision an account for yourself and continuously exercise the **full customer
journey** — signup, provisioning, deploy, a transaction, a backup, a restore, a support ticket. Costs a
slot and a trickle of resource, and it catches the entire "everything is green but customers are down"
class **including the business-layer parts (billing, provisioning, email delivery) that technical
monitoring never touches.**

### Alerting / Pager / On-call Rotation
Converts a silent failure into a notification.

**How it works:** Its upgrade path is about *precision*, not power: fewer, better alerts. Severity
tiers, dependency-aware suppression, and alert tuning. Wakes staff at night, improving response time
and lowering morale.
**Two properties that decide whether alerting is useful at all:**
- **Every alert must be actionable and must link to a runbook.** An alert with no defined response is
  noise with a pager attached. Model it: **alerts created *without* an attached runbook contribute
  double to the alert-fatigue stat.**
- **The alerting path must not depend on the thing being monitored.** Buy an **out-of-band alerting
  path**, and a **periodic test page** that proves the whole chain works — exactly the kind of boring
  ritual the design's "make the boring thing beautiful" guardrail wants.
**Visual:** a little device on the player's desk that buzzes and lights when thresholds trip. **At
night, it's the only light on screen.** Page severity is visually and audibly distinct from a normal
alert — and the game should let you *snooze* one, which is where the trouble starts.

### Tracing
Late-game: shows exactly which hop is slow.

**How it works:** Turns the guessing game into a solvable one. An expensive, genuinely transformative
unlock, and the difference between "the site is slow" and "the payment service's retry loop is slow."

### Status Page
Cheap. Enormous during incidents.

**How it works:** Halves reputation damage, deflects Support Seekers, and cuts the ticket avalanche by
a large factor (~40% of incident ticket volume). Converts an outage from a reputation catastrophe into
a reputation *neutral*. **Must be hosted OFF your own infrastructure** — a lesson players learn the
hard way exactly once.
**Price the temptation (wave-2):** the status page is **free and instant if hosted internally**, and
costs a small monthly fee plus a setup step if hosted externally. Nearly every player takes the free
one, exactly once. **That's a perfect five-dollar lesson**, and the entry currently describes the
outcome without pricing the bait.
**The subtler trap (wave-2):** independence is a property of the **entire dependency chain**, not of
the hosting location. A status page hosted elsewhere but whose **DNS is yours**, or whose **TLS cert
is on your ACME automation**, or which **authenticates against your SSO**, is not independent. This
generalizes into a rule for the whole game: **"is this genuinely independent?" is a graph question,
not a location question.**
**Opens:** it publicly advertises your downtime, and increases press exposure.
**Visual:** a small separate building *across the street*, visibly not connected to your
infrastructure. **If you built it inside, its cable is drawn crossing your own perimeter** — a small
visual wrongness the attentive player notices before the lesson arrives — and it goes down with
everything else while a tiny ghost of an operator facepalms. Writing an update is a small interaction
(pick tone + detail level) with real reputation consequences: vague corporate-speak loses trust,
specific honesty gains it — and the choice of a green "all systems operational" lie versus an honest
amber banner is **literally a colour you pick**, rendered **on the building's own sign, so your lie is
posted on a billboard.**

**Variations and additions**

- **It caps rage-meter growth during outages** — customers who can *see* the incident bounce less, so
  putting your honesty on the wall is a mechanical defense and not just a courtesy.
- **The upgrade ladder** — component-scoped pages → subscription alerts → **a "transparent
  postmortems" tier that wins developer-segment trust.** Publishing a postmortem becomes a one-click
  "buy goodwill with pride."
- **The fork** — lying or hiding keeps revenue short-term and nukes reputation long-term, **and
  someone always finds out.** A status page that is broken *during* an outage is comedy gold and
  brand death.
- **The surface twist** — it **publicly broadcasts every hit and is itself a DDoS magnet**: a
  meta-defense that creates a new target. Arguably the most underrated defensive structure in real
  hosting operations.

### Runbook Library / Documentation
An investment of staff time that reduces MTTR for everyone and immunizes you against bus-factor loss.

**How it works:** Documented procedures become playable **runbook cards** with reduced time and failure
chance; undocumented responses are improvised — slower, riskier, and they consume more of the
engineer's focus. Makes junior staff effective. **Decays if not maintained** (stale runbooks are worse
than none — a resource that *rots*). The least glamorous, most quietly powerful building, and players
will still skip it. **Best long-term investment in the game, zero short-term payoff.**
**Visual:** a shelf where each written runbook is a labelled spine; the right spine lets staff
auto-resolve an incident (a staffer grabs the binder and walks to the problem). **The shelf filling up
is meta-progression you can see.** In the world, staff **carry binders**: a documented procedure is a
tabbed binder they flip open (fast, correct action); undocumented means they improvise (slow, chance of
error, a visible head-scratch animation). **Documentation as an object you can literally see them
holding.**

**Variations and additions**

- **The shelf is your P1 menu, and it literally grows.** Each written runbook, earned from a
  post-mortem, **adds a guaranteed-success action to Incident Command's three slots** — and later an
  auto-cast trigger. **Chaining two cards makes a macro**, and a pre-written recovery **halves the
  triage mini-game time** for that incident type. "Write the doc" becomes a real, rewarded action.
- **The ironic risks** — an unread library **rots**: stale runbooks can *misfire*, which is what
  mandates review cycles, and the shelf itself is a fire risk in the joke the object deserves.

### Postmortem Process (blameless)
The mechanism that converts an incident into a permanent improvement.

**How it works:** Costs a hand and a day after every sev-1. **Permanently reduces recurrence of any
incident type you've written up.** Feeds Culture (§4.8), feeds the runbook shelf, and is the only
reliable driver of morale recovery — because **burnout is caused by recurring incidents**, so root-
cause fixes are the real morale mechanic.
**Opens:** the temptation to skip it while the next incident is already running, which is how the
same outage happens four times.

### Runbook Automation
Converts a manual response you've performed 3+ times into an automatic standing rule.

**How it works:** **The single most satisfying unlock category in the game.**
**⚔️ Required downside (flagged as a Three-Column-Law violator):** automation that runs **the wrong
runbook** — confidently, instantly, fleet-wide, at 3am, against a condition that looked like the one it
was written for. And an automated response that masks the signal that would have told you the real
problem.

### Incident Command Structure
Not a person — a **role assignment system**, and the thing the design's hands-and-attention model
otherwise has no answer for.

**How it works:** During a sev-1 you assign **roles**, not just hands: **Incident Commander** (decides,
does *not* touch keyboards), **Operations** (does the work), **Communications Lead** (status page,
customers, internal, tickets), **Scribe** (records the timeline, which later becomes the RFO and the
postmortem's evidence). Assigning them **removes hands from fixing** and makes everything else faster
and better: shorter MTTR, far fewer duplicated actions ("three people independently restarting the same
service"), better postmortem quality, and much less reputation damage. It also prevents the Ticket
Avalanche from consuming your engineers.
**Why it's sophisticated:** **a mechanic where spending your scarcest resource on coordination is
correct** — and exactly why players won't do it, and exactly why it works.
**Opens:** an IC who starts debugging (a real and common failure), and a communications lead who
promises a fix time.

### The Escalation Matrix
Who gets called, by whom, when.

**How it works:** A buildable document defining severity levels, notification targets, decision
authority and customer-communication timing. Without it, every incident includes a debate about
whether to wake someone. With it, response is faster and occasionally **over-escalates.** **Process as
a purchasable object** with a legible speed/noise tradeoff.

### The MOP and the Go/No-Go
A structured change procedure as a playable object.

**How it works:** For any risky change, write a **Method of Procedure**: the steps, the verification
after each step, the rollback plan, and **the point of no return.** Executing a change *with* a MOP is
slower, has a lower failure chance, and — crucially — has a **defined abort point with a go/no-go
decision the game makes you click.** Without one, a failed change becomes improvisation at 2am.
**Opens:** a MOP written for last quarter's topology; and the temptation to skip the verification steps
because you're behind schedule.

### The Error Budget Policy
**The most elegant reliability mechanic in the industry**, as an object rather than a HUD number.

**How it works:** You declare a target — say 99.9% — which allocates **43 minutes of monthly
downtime.** Spending it is *allowed*: you may ship risky changes while budget remains. When it is
exhausted, **a change freeze triggers automatically** and only reliability work is permitted until the
window resets.
**Why:** it turns reliability from a vibe into **a currency with a spending rule**, gives the player a
legitimate reason to take risks, and makes the velocity-vs-stability argument mechanical rather than
moral.
**Per-contract variant:** show the SLA meter as **minutes of budget remaining this month, per
customer**, rather than a percentage — then an incident's cost is legible in real time and per
relationship, and the Sacrifice Decision has the numbers it needs.

### Auto-Scaler / Auto-Scaling Policy
Adds capacity automatically under load.

**Opens:** **it scales up under attack too, spending your money serving the attacker** — unless you
also built the Bot Fingerprinter. A gorgeous system interaction. It can also be gamed by a pulse-wave
attack that trains it to provision and de-provision on the attacker's rhythm, and it costs money every
time it over-reacts.

**Variations and additions**

- **Three dials, not one.** **Cap** (max instances) · **boot-delay curve** (an era stat: minutes on
  bare metal, seconds on cloud — that difference *is* era progression) · **cooldown grace**
  (scale-down hesitation, so retry storms don't yo-yo — **the thundering-herd boss is unplayable
  without it**).
- **The runaway-bill event should fire at least once per campaign**, when the cap is unset, so the cap
  earns its keep. Elastic capacity that spends money on its own is a feedback loop **you must cap**,
  and that is brilliant money-pressure at scale.
- **As a timed ability** — cash-per-second to spin up capacity mid-wave, with a boot delay, which
  runs straight into the wall of **"we can't bring the new box up, the DB won't replicate in time."**
- **Give it a physical read** — tiny worker avatars scrambling with **empty crates** when it *wants*
  capacity you forbade: the "no new box" moment as a visible shrug.

### Config Management (Ansible/Puppet-alike) — "The Stencil"
Ends config drift; makes rebuilds fast; consistency at scale.

**Opens:** **a single bad playbook applied fleet-wide is the fastest outage in the game** — the ability
to break every machine simultaneously, at machine speed. **Power and danger are the same stat.** Add a
canary / `--limit` upgrade that reduces blast radius at the cost of deploy speed.
**Visual:** applying a template plays a **fleet-sync wave** that visually re-stencils every drifted
faceplate back to the golden palette. Deeply satisfying.

**Variations and additions**

- **The promotion ladder** — console cast → (repeat N times) → **runbook card** (one click) →
  **policy** (automatic). Make the conversion a **visible ritual**: three tiers of player skill
  spending, one pipeline.
- **The parity pledge that keeps the console honest** — every console action must also have a click
  path. **The console wins tempo, never capability**: keep the grey magic, drop the gatekeeping.
- **Mass apply = mass capability = mass blast radius**, and **drift detection** prevents the "works
  locally" bug class. Destroyed boxes re-provision instantly and identically — a force multiplier for
  outage recovery — and a **staged rollout / canary upgrade** is what makes that safe.
- **Buildable programs** — place triggers, then actions — **can malfunction after upgrades**, which is
  the automation-horror event class.
- **The Backoff/Retry Logic Module** — a cheap upgrade that prevents Cascading Retry Storms (§3)
  **without adding raw capacity**: the rare fix that is a rule rather than a purchase order.

### The Tag & Policy Engine
Slap labels on anything — `tier:gold`, `region:eu`, `pci:true` — and let **every defense target by
tag instead of by location.**

**How it works:** Late-game's real answer to "tower defense gets boring at scale." You stop placing
turrets and start **writing rules** ("strict WAF on all `pci:true`") that apply across the fleet
**and to everything built later** — no forgotten boxes.
**Opens:** **policy drift as the new threat.** A mis-scoped tag silently over-protects (a latency tax
on traffic that didn't need it) or **under-protects — a red port you *swore* was covered.** The
Swiss-cheese audit, made clickable.
**Ships with:** a **"what breaks this rule" query** — the dependency overlay's legal twin.
**Interacts with:** the Coverage Grid (§4.5), the Standard Build and Blueprint Rack (§4.1), §4.11's
policy cards.
**Hosting types:** all, from tier 3 on.

### The IaC State Vault
Your automation's brain: the state file and config repository your whole estate is rendered from.

**Gives:** one-command reconstruction of everything — restore stops being "rebuild" and becomes
**"re-render the world."**
**Opens:** a single high-value structure. **If it is breached, the attacker holds your blueprint** —
and the waves that follow are *targeted*, because they know your build.
**Upgrades:** encryption, versioning (rollbacks), split-trust custody.
**Interacts with:** the Config Locker (§4.4), the Secrets Manager (§4.3), the Immutable Rebuild
Pipeline (§4.5).
**Hosting types:** late-game; cloud and Kubernetes arcs.

### Deploy Pipeline / CI-CD
Repeatable releases, rollback, faster feature shipping (which raises conversion over time, and is
marketing ammunition).

**Opens:** it can deploy a bad build to everything at once; **it holds production credentials and is
the highest-value target in the building**; and it raises self-inflicted-outage risk unless paired with
Change Management and canaries.

**Variations and additions**

- **The CI/CD Runner as a tower** — it converts dev work into live upgrades on the fly, which is a
  **fast patch response during waves**, and it unlocks safe rollout (canary, blue-green). It is also
  **"the most dangerous yes in the game": compromised, it is a factory for backdoors straight inside
  everything.**
  **Hosting types:** all from stage 2 onward; mandatory in software-heavy lines.

### Container Registry / Package Mirror
Supply-chain control.

**Opens:** a stale mirror serving known-vulnerable packages forever, and a registry outage that stops
every deploy and every pod restart in the estate.

**Variations and additions**

- **The Artifact Registry Mirror — the dependency pantry.** Cache every npm, pip and docker package
  your estate uses, **pinned, signed and scanned**, so that every supply-chain threat (typosquat,
  poisoned maintainer) becomes **a detection event at the pantry door instead of an inside job.**
- **Costs:** cache-storage upkeep, plus the **"latest-tensor lag" tension** — security wants pinned,
  customers want day-one features, so it needs a **visible policy dial per stack.**
- **Opens:** a compromise **of the mirror itself is a late-game boss** — every customer you serve gets
  the trojan, and your supply chain becomes everyone's problem.
- **Interacts with:** the open-source giveback program (upstream warning time), the Detonation
  Chamber (§4.5), the SBOM.
  **Hosting types:** CI, Kubernetes, dev-platform acts.

### Certificate Automation (ACME)
Ends cert expiry.

**Opens:** rate limits, DNS-challenge dependency, and renewal failures that are **silent for 89 days.**
Also: it quietly becomes a dependency of anything you thought was independent (see Status Page).

**Variations and additions**

- **The Certificate Authority Kiosk** — the visible half of the same system: it **issues padlock
  badges to links**, and without one **every customer's speech bubble shows a warning triangle.**
  Trust decay, made visible on the customers rather than in a log.
- **A permanent quality-of-life unlock disguised as a buildable** — once the ACME tower auto-renews
  every TLS countdown on its linked endpoints, cert expiry is *neutralised*, which is the classic
  QoL players actually feel. **One ACME outage day is a mini-crisis event** (an auth-server incident),
  which is the price of the convenience.
- **The TLS-tower angle** — it is also an **encryption tunnel builder**: unencrypted traffic renders
  visibly "exposed" and sniffable, so buying certs is buying opacity as well as trust.

### Asset Inventory / CMDB
Reveals shadow infrastructure. Boring, unglamorous, saves you in the audit and the breach level.

**How it works:** The answer to "how many servers do we have?" — a question that is embarrassingly hard
and whose wrong answer is the Forgotten Environment.
**Opens:** an inventory that is wrong is worse than none, because you will now *trust* it.

**Variations and additions**

- **The CMDB Shelf** — a boring cabinet whose entire function is **to be correct on the day a
  Log4shell-class event fires.** With a full CMDB, patch targeting is one click, license-audit
  response is automatic, and insurance claims pay. Without one, it is a manual scramble mini-game.
  Passive, cheap, ignorable — **the single most *realistic* buildable in the game: nobody buys it
  until the day they die by it.**

### The Secondary Everything Register
An inventory of what has no backup. **Simply a list, generated from the graph, and it is terrifying.**

**How it works:** A screen listing every single-instance dependency in your estate — one nameserver,
one payment processor, one registrar account, one supplier, **one person who knows the thing.** Cheap
to build, enormously valuable, and it is the buildable form of effective redundancy.
**Interacts with:** the Bus-Factor Halo (§4.8), the Redundancy Audit overlay (§4.7).

### Capacity Planning / Forecasting Model
Shows you a projection of when you run out. **Information as a purchase.**

**How it works:** Prevents the most boring and most common outage type. Reveals the build-lead-time
problem early enough to act on it — which, given that circuits and utility feeds take months, is the
difference between a plan and a panic.
**Interacts with:** the Capacity Planner staff role (§4.8), Headroom (§4.1), the Backlog Board (§4.9).

**Variations and additions**

- **The Capacity Oracle (ML forecast)** — a moody crystal-ball machine predicting the next waves'
  demand (traffic *and* threats) with **visible error bars.** Acting on high-confidence forecasts is
  cheap and correct; **low-confidence forecasts can lie** — and late-game attackers learn to fool it
  **adversarially.** Training on your own history improves it across levels, which makes it the rare
  object that gets better *between* campaigns.
  **Hosting types:** late-game.

---

## 4.7 Facility

*The physical tower-defense layer. In hyperscale and colo lines, **power is the real currency** and the
facility ladder is the tech tree.*

### The Facility Section Cut
A view, and the most important one this category is missing.

**How it looks:** A togglable **architectural section** — the building sliced vertically — showing
utility entry, transfer switch, UPS room, generator yard, busway overhead, CRAC loop, plenum and the
raised floor. Power and cooling overlays render **natively** here instead of being flattened onto a
floor plan. **Electricity and air are vertical systems and deserve a vertical view.**

### Rack / Cabinet
The container object: grants U slots, with a power budget, a weight limit and an airflow budget. **The
placement unit and the physical inventory grid.**

**How it works:** Its door can be mesh (better airflow, exposed) or solid (quieter, hotter). Side
panels, blanking plates, a PDU spine on each side, and a label at the top. Sellable whole (colo) or by
the U.
**Visual:** front and back are **distinct flippable views** (the Truth/Face Pair Law, §4.1), and the
back — where the power cords, network cables and airflow live — is its own satisfying scene. **Half of
datacenter work happens at the back of the rack and no game has ever shown it.** Fullness is legible at
a glance; empty U slots are dark voids with visible rails and threaded holes, and **empty space is
itself a compelling visual invitation.** Without blanking plates you can see hot air recirculating
through the gaps.
**Buy surface:** see the Rack Elevation as a Buy Screen (§4.1).

**Variations and additions**

- **Rack density is the placement puzzle** — 1U/2U/4U tiles stack into racks, so capacity and clutter
  read instantly and **a half-empty rack looks like money left on the table.** Each rack also carries
  a **power-diversity stat**, which makes single-fed racks **a time bomb you can see.**
- **The spatial hierarchy: rack / row / cage / hall.** Racks hold servers, cages hold racks, halls
  hold cages — each tier costs more upkeep but enables the next, and that ladder is the late-game
  "build the building" arc. At scale, **placement becomes two-layer**: place the rack in the room for
  power and cooling reach, then place services on the rack. Cold-aisle layout makes tower
  *orientation* into gameplay.
- **Placement should cost opportunity, not just cash** — a **limited plot count per level** makes
  upgrading a genuine spatial tradeoff rather than a budget one.
- **Visual: rack magnetism.** Tiles snap to rails with a screwdriver micro-animation and a click, and
  a 4U dropped into a 2U gap is physically refused with a *bonk*. **The fix the bonk needs:** before
  the refusal, highlight the gap **in red during the drag** — valid slots glow, the overhang shows a
  dashed conflict outline. Placement needs a *pre*-violation preview, not only a comic sound.
- **Visual: the server graveyard.** Sold and decommissioned hardware stacks in a chain-linked corner
  lot with the janitor sitting on one like a bench. Retirement becomes visible, and **"the graveyard
  is overflowing" is a silent stat about churn and legacy purging.**

### Rails, Cage Nuts, Depth Adapters and the Cable Comb
A bundle of tiny physical consumables that gate placement speed. **The single most universally
recognized indignity in the job.**

**How it works:** A racking job takes 10 minutes with the right rail kit and 50 minutes without. A
cabinet that is 1000mm deep **will not take a 1100mm chassis** no matter what you paid for it.
Mechanically: placement carries a small **fit check** — depth, rail type, square-hole vs threaded,
weight, PDU clearance. Failing it doesn't block the build; it **adds time and a chance of a Missing
Screw event.** Buying a standard rail kit for your standard chassis (a procurement decision) removes
it.
**Interacts with:** the Standard Build (§4.1) — standardization pays here first.

### The Tool Crib and the Torque Standard
Micro-infrastructure. Every ops person will buy it on sight.

**How it works:** A shadow board of tools, a labelled fastener bin, a torque driver, an ESD station,
and a laminated standard for how things are mounted. Reduces Missing Screw frequency and remote-hands
error rate, and grants a small permanent MTTR bonus.

### PDU / Busway — "The Spine"
Power distribution with a breaker that trips if you overload it.

**How it works:** Satisfying, legible failure. **Tiers matter: basic** (dumb) → **metered** (you can
*see* per-tenant draw and **bill actual amps**) → **switched** (remotely power-cycle an individual
outlet, and sell that as a service).
**Opens:** enforcement creates disputes (colo).
**Visual:** power drawn as a **thick copper-hued spine** (never gold — gold is money) with tap-off
boxes; overloading trips a visible breaker that physically flips to OFF and **everything downstream
goes dark in a cascade you can trace with your eye.** A vertical strip of outlets with per-outlet LEDs
and a total-load meter at the top. Each tap-off box carries its **Circuit Colour Band.**

**Variations and additions**

- **The metered PDU as a cash register (colo).** The rack's power meter *is* a register: bill through
  **per-kWh at markup**, plus a **committed-kW floor the tenant pays whether they use it or not.** A
  revenue generator, not just gear. **Upgrade:** per-outlet telemetry as a premium tier.
  **Anti-pattern:** flat-rate racks that quietly eat your margin as tenants grow denser.
- **Per-outlet intelligent control is the sysadmin superpower** — remote reboot without a truck roll.
  A tripped or overloaded PDU **darkens a whole rack**, and PDU throughput is an upgradeable
  bottleneck: **cheap until it's a fire.**

### Switched PDU (per-outlet power control)
The unglamorous purchase that converts a truck roll into a click. **Rung three of the recovery
ladder.**

**Gives:** remotely power-cycle an individual outlet — which fixes **the wedged machine whose BMC has
also hung**, the specific case where IPMI/iDRAC does not help.
**Costs:** more than a basic PDU, and per-outlet metering on top of that.
**Opens:** **a network-attached device that can turn off any server in the rack, running firmware from
2017, with a default password.** A remote power-off button for anyone who finds it.

### The Breaker Panel
A wall object with rows of physical breakers you can see tripped or set.

**Visual:** Tripping one is a *click* and a row of your racks going dark — **the most brutally simple
failure visualization available.**

### The Circuit Colour Band
Power feeds need identity, not just thickness.

**How it looks:** Each circuit gets a printed colour band at the PDU and a matching band on every cord
plugged into it. **A dual-corded server with two bands of the same colour is visibly not redundant.**
Effective-vs-nominal redundancy becomes a thing you can spot **with your eyes**, at mid-zoom, rather
than a computed stat you have to go read.

### A+B Power Feeds / Dual Cording
Real redundancy — **only if every device is dual-corded AND the two cords go to different PDUs on
different feeds.**

**How it works:** The game tracks this per device and exposes an **effective redundancy** computed
stat, because the gap between *bought* redundancy and *effective* redundancy is where real outages
live. The classic pay-2×-for-nothing insurance purchase. Single-corded gear needs a rack-level ATS.
**The Redundancy Audit overlay (wave-2, and it should be FREE):** every object shows
`bought: N+1 / effective: N+0` **with the shared dependency named**, and a dedicated overlay colours
objects by the gap, sortable. Two specific traps become computed checks: **(1) both cords on the same
PDU**; **(2) both cords on different PDUs fed from the same upstream breaker** — the second is the one
real operators miss, and a game that catches it is teaching something genuinely useful. Available from
Tier 2.5 onward and **free, because the lesson is not "you couldn't see it," it's "you didn't look."**
**Visual:** two visibly different cable colours to two different PDUs by two different paths;
single-corded devices draw with an obvious missing second cable and a small warning pip, and when the
ATS flickers **they are the only ones that die.**

**Variations and additions**

- **The fake-A/B reveal.** Dual PSUs into two PDUs fed by *the same transformer* is **the most common
  redundancy lie in hosting.** Add a hidden **feed-provenance layer** so the power overlay reveals
  shared upstream points, and price true diversity honestly: different substations mean different
  cables, which is what makes you **survive the backhoe.**
- **Dual-PSU discipline is a per-device habit, not a per-rack purchase** — the device that is
  single-corded is the device that dies alone during the transfer.

### UPS — "The Battery Ziggurat"
Bridges power gaps measured in seconds to minutes.

**Opens:** batteries degrade invisibly and need *capacity* testing (not just voltage); a 3–5 year
lifespan; **a failed UPS stuck in bypass is worse than no UPS**; and a UPS can take down what it was
protecting.
**Two real properties (wave-2 additions):**
- **Efficiency mode.** Double-conversion is clean and **wastes ~5–8% of everything it passes**;
  eco/line-interactive mode saves that and **adds a transfer time** when utility fails. So UPS mode is
  a direct, permanent power-bill-vs-ride-through trade, and it should be **a dial.**
- **Bypass state.** A UPS in maintenance bypass is passing raw utility through and protecting nothing
  — normal and correct during service, catastrophic if you forget to take it out afterwards. **A "UPS
  in bypass" indicator that stays lit for three levels because nobody noticed is a superb slow-burn
  threat.**
**Visual:** a battery cabinet with a charge bar, an audible hum, stacked cells that discharge visibly,
a bypass switch, and **end-of-life batteries that bulge** (a real, horrible, very drawable thing).
Its **runtime-remaining readout only becomes important once, and then is the most important number on
screen** — so **make the promotion literal:** when utility power fails, the runtime number **animates
out of the object and into the top bar at 3× size, displacing whatever is there.** The number
physically moving from the world into the HUD is a genuinely novel way to say "this is now the only
thing that matters."

**Variations and additions**

- **The replacement beat: the UPS Battery Column.** Swapping the bank is **a whole-aisle dark
  moment** — the one maintenance act the entire corridor watches.
- **UPS daisy-chaining is a real strategy *and* a real fire hazard**, and the batteries themselves age
  and (rarely) **become** the thermal event they were bought to survive.
- **Visual:** a humming glass pillar with the charge glowing inside like an **inverted hourglass**,
  draining visibly during an outage; or candles that **gutter** during a brownout. The player
  *watches* the handoff, and **the momentary dip is the tension.**

### Flywheel UPS — "The Spinner"
No batteries, short ride-through, an era/branch alternative.

**Visual:** a visible spinning mass and a much shorter but very legible runtime. **Great for showing a
design tradeoff as a picture.**

### Generator + Fuel Contract — "The Barn"
Survives long outages.

**Costs:** monthly test runs, fuel, fuel polishing, start-battery maintenance. Runtime beyond your
on-site tank requires a **priority refuelling contract — insurance on your insurance** — which comes
due in exactly the scenarios where everyone else is calling the same fuel company.
**Opens:** a start-failure probability inversely related to maintenance spending; the ATS as a new
single point of failure; **emissions permits with a runtime-hours cap per year — you can be legally
forbidden from running your generator**; and wet stacking from too much low-load testing.

**Make the probability visible (wave-2 numbers).** Base start-failure **18%**, reduced to **9%** by
monthly no-load tests, to **3%** by an annual load-bank test, to **1.5%** by both plus fuel polishing.
Display it on the object as **"start confidence: 82%."** A probability the player can read is a
probability they'll invest in; a hidden one just feels unfair when it fires.

**Or model it as a single Readiness stat** derived from months since last load-bank test, months since
fuel polishing, start-battery age, block-heater status, fuel level, and whether the ATS has been
exercised. Readiness is the *actual* probability it starts, displayed on the object, degrading visibly
over time, restorable by boring maintenance. **This converts "Generator Fails to Start" from a dice
roll into a consequence.**

**And give it a failure taxonomy**, because "start-failure probability" is too coarse for something
this teachable. Generators fail for specific, preventable, cheap-to-fix reasons: **the start battery**
(the single most common cause, and a $200 part) · **the block heater** (a cold engine won't start under
load) · **fuel filters and fuel age** (diesel degrades in 6–12 months; hence polishing) ·
**coolant/louvre/damper interlocks** · **wet stacking**. Each becomes a separate, cheap, boring
maintenance line item with a visible "last serviced" date, turning a dice roll into a checklist the
player either keeps or doesn't. Plus the genuinely funny real one: **the generator starts perfectly
and the ATS doesn't tell it to**, so you sit in the dark listening to a running generator.
**⚔️ Tension:** one reviewer wants a single readable "start confidence"; another wants the six-part
taxonomy. Both ship: **the taxonomy is the maintenance screen, the single percentage is the faceplate
readout derived from it.**
**Visual:** outside the building, dormant, with a radiator, an exhaust stack, a control panel and a
visible fuel gauge that becomes the clock in any power scenario. **Skipping tests shows as rust creep
on the object** — a beautiful maintenance-debt visual. When it starts: a rumble, a puff of exhaust, a
subtle scene vibration, and **the room shifts to generator lighting.** Specify it: generator light is
**~2700K with a faint 2Hz flicker and slightly uneven coverage** (some corners stay darker), against
utility light at **4000K, perfectly even**. **The unevenness is what makes it feel wrong**, and it
should persist for the entire generator run, not just the transition. Unforgettable.

**Variations and additions**

- **Fuel is a consumable with a supply line.** The **fuel truck is an actual customer-like unit that
  must arrive and dock** — a resupply mini-path, **interdictable by storm** (the convoy-under-storm
  event). The fuel gauge is your hurricane-prep score.
- **The auto-exerciser upgrade** does the weekly test-fire for you; **untested, the generator fails
  the hurricane level about 40% of the time** — real-world statistic energy, and the cheapest
  purchase in the branch.
- **Visual:** a diesel monster with a crank handle — **starting it backfires**: smoke, noise, and it
  scares every customer standing nearby. A transfer-switch failure is the scripted twist that lands
  *after* the relief of hearing it catch.

### Diesel Tank + Fuel Delivery Contract
A tank with a float gauge, plus a delivery truck that arrives on contract.

**Visual:** during a long outage, **the truck arriving is a *cheer* moment.** The delivery SLA is also
worthless in a regional event, which the player learns during a hurricane scenario.

### ATS / Static Transfer Switch — "The Big Lever"
The device whose entire job is redundancy and which is itself unredundant unless you buy two.

**How it works:** The piece that actually decides utility-vs-generator. **A single point of failure for
the entire facility unless you buy two, and nobody buys two.**
**Visual:** a visibly mechanical thing that throws with a satisfying clack. **Testing it is scary
because testing it causes The Flicker.**

**Variations and additions**

- **The service bypass handle is the load-bearing joke.** A literal lever that forces everything onto
  one source "just for tonight" — **this is how real facilities discover they never tested the
  breaker in the other panel**, and it is a temptation the player can feel in their hand.
- **Monthly, the STS wants a transfer drill** — the maintenance item whose skipped state is invisible
  until the night it isn't.

### Load Bank
Tests the generator under real load.

**How it works:** The boring purchase that decides whether "Generator Fails to Start" kills you — and
the cure for wet stacking.

### Battery Capacity Tester
Reveals the UPS runtime you actually have, not the one on the label.

### Utility Feed / Service Entrance
A hard kW ceiling on the whole facility.

**How it works:** Upgrading takes **months to years** and involves the power company as an NPC.
**Deciding to start a substation upgrade three levels before you need it is the deepest strategic
choice in the game.**
**Hosting types:** all facility-owning lines; decisive in GPU/AI and hyperscale.

### Second Utility Feed from a Different Substation
Real diversity, big money.

**Visual:** dual feeds are drawn as **two genuinely different routes across the map**, which makes
redundancy geographic and legible.

### Substation / Utility Yard — "The Yard"
Campus-level object with buzzing insulators and a visible one-line diagram overlay.

### On-Site Generation and Storage (solar, BESS, fuel cell, microgrid)
Power as something you *produce*.

**How it works:** Reduces grid draw, rides through short outages without the generator, can **sell grid
services back** (frequency regulation pays real money for doing nothing most of the time), and provides
a green credential with a number behind it.
**Opens:** a serious fire-safety consideration for lithium storage, new regulatory approvals, and the
fact that **solar produces least when you need most.**
**Interacts with:** the PPA / Energy Hedge (§4.9), ESG-conscious enterprise tenants.

**Variations and additions**

- **The Grid Battery Wall + Demand-Response Contract — the arbitrage bank.** Containers of lithium
  that arbitrage the *grid clock*: **charge cheap on off-peak spot prices, discharge into your racks
  at peak, and get paid by the utility for being a shock absorber.** A money-*generating* defensive
  tower whose revenue curve mirrors the spot-market weather HUD, and during outages it **buys you
  generator-start time.**
  **Costs:** capacity degrades with cycles (battery entropy); **fire is a new physical hazard** — a
  Lithium Dragon mini-boss on hot levels, gas canisters, and sprinkler rules that change your
  insurance tier.
  **The bite:** the DR contract **obligates** discharge during grid events — *the same minutes your
  customers are spiking.* **Being the grid's friend costs uptime.**
  **Hosting types:** large DC, GPU, colo.
- **Green Generation (Solar Field / Wind PPA / PUE Badge)** — on-site renewables and efficiency
  certification as a buildable cluster: lower power cost with **weather variance** (sun and asset
  maps), **unlocking the ESG enterprise customer pool** whose contracts *require* a PUE badge, and
  feeding the carbon-reporting towers. Storm and hail damage add physical-defense stakes to the roof.
  **A PUE upgrade cuts the #1 cost line — power — permanently**, and Tier III versus Tier IV is what
  sells contracts.
  **Hosting types:** DC-scale.

### CRAC / CRAH Cooling Unit (N+1) — "The Cold Breath"
Removes heat within a radius; **cooling capacity is a hard cap on how much compute a room can hold.**

**How it works:** Ties compute density to a facility constraint and makes placement a spatial puzzle.
**Opens:** short-cycling, condensate drains that clog, and the fact that **they all share one chilled
water loop.**
**Visual:** blows visible cold mist with a drawn **throw distance**, rendered as a **hard-edged floor
decal — a cone with a definite end — rather than a soft falloff**, so placement is *solvable* rather
than vibes-based. Racks outside the throw run hot and carry a small "outside throw" icon. Cooling
layout becomes a spatial puzzle with a literally visible solution.

**Variations and additions**

- **The cooling tier line gates density.** **CRAH → chilled-water loop → rear-door heat exchangers →
  full-immersion tanks**: better cooling permits hotter, more lucrative builds. On GPU levels cooling
  is **the pacing bottleneck** — heat creep throttles everything and **customer latency rises before
  any visible failure.** Liquid unlocks denser GPU walls and adds a leak threat, and **more cooling
  means more power draw**: the eternal tug.
- **The rack's chilled radius matters** — overpacked racks inside a cold aisle fail more slowly than
  the same racks outside it, so placement buys time as well as capacity.
- **Thermal telegraph** — fans pitch up and the heat shimmer spreads *before* anything trips.
- **Visual:** rooftop vapour thickens with heat; under-provisioning shows as an **amber gradient
  creeping out from the racks**; cooled aisles get a visible **frost line** where cold air meets hot;
  late-game cryo units exhale frost patterns; and combat against a hot spot is **the fog-squeegee.**
  Tiered art runs humming box → glowing pipes → immersion tanks.

### Chilled Water Plant (chillers, pumps, cooling towers, water treatment)
At scale, **the CRAC is the least interesting part of cooling.**

**Gives:** efficient cooling at density, plus **economizer / free-cooling mode** when outside conditions
allow — a large seasonal saving.
**Opens:** an entire second infrastructure with its own failure modes: a pump seal, a valve actuator, a
control-system failure that puts everything into a safe-but-useless state, **glycol concentration and
water treatment** (neglect it and you get biological fouling or corrosion), a cooling tower in a
heatwave **running out of makeup water**, and **legionella management as a genuine regulatory
obligation.** The chilled-water loop is also the source of the leak that lands on your racks.
**Great mechanic:** economizer mode has a **changeover threshold** (outside wet-bulb temperature), so
your cooling cost has a **visible seasonal shape**, and a humid week costs real money.
**Visual:** campus objects with visible water vapour. On hot days the plume is bigger and the
efficiency readout worsens — **weather visibly costs money.**

### Free Cooling Economizer / Dry Cooler / Evaporative / Adiabatic
Climate-dependent efficiency, which makes **site selection matter.**

**How it works:** Free cooling works great **until the heat wave** — a scenario hook. Water-cooled and
evaporative systems introduce **water supply as a dependency**, a **drought as a threat**, and water
usage as a **regulatory and community stat.**

**Variations and additions**

- **"Open the window."** When outside air is cool and clean, shut the chillers and just… breathe. A
  seasonal and diurnal efficiency mode with **huge power savings, gated by air-quality, humidity and
  pollen meters.**
- **Dust-bunny threat rate *rises* while the economizer is open** — the physical trade the game
  already loves, applied to the cheapest cooling mode.
- **A "spec day" can force-close it mid-heatwave** — a dust storm, wildfire smoke, a chemical-plant
  neighbour — and its ghost ruins your power forecast for the month.
- **Automation unlock:** a **predictive economizer schedule** that trades wind-chill against the
  thermal model.
  **Hosting types:** own-DC and colo — **with the landlord's permission.**

### Thermal Storage / Thermal Ride-Through (ice bank, chilled-water buffer tank)
**Explicitly purchasable minutes.** A battery for cooling.

**Gives:** (a) ride through a chiller restart with no temperature rise — a genuinely *different* kind
of redundancy than N+1 — and (b) **make ice at night when power is cheap and use it at peak**, which
turns cooling into a schedulable, arbitrageable resource.
**Costs:** a large tank, floor loading, pumps, maintenance (water treatment, glycol, biology).
**The counterintuitive part worth teaching:** ⚔️ **hot-aisle containment *reduces* ride-through
time.** Containment is more efficient precisely because there is less mixed air mass buffering the
room, so the same investment that lowered your PUE **shortened your grace period from 8 minutes to 90
seconds.** The game should let the player discover this by surviving a cooling failure *before*
containment and not surviving one after. It's real, it's counterintuitive, and it's a perfect
Capability-vs-Surface demonstration inside the facility branch.

### Hot/Cold Aisle Containment + Blanking Panels — "The Glass Roof"
An efficiency upgrade that reduces cooling cost, raises the density ceiling, and improves PUE.

**How it works:** The unglamorous build with the best ROI. Hot/cold aisle *layout* can also be a **free
bonus available only if you arrange racks correctly** — layout skill rewarded with efficiency.
Blanking panels are trivially cheap: the "free win if you're tidy" object that teaches players the
layout system matters.
**Opens:** contained hot aisles are genuinely dangerous for staff (50°C+), they **heat up much faster
when cooling fails** (see thermal ride-through), and containment blocks some placements.
**Visual:** translucent curtains/doors and clear panels over the aisle whose installation visibly
**sharpens the thermal overlay's boundaries** — the heat map goes from a smeared gradient to crisp blue
and red zones. **Hold the before/after side by side for 2 seconds after installation**, because the
comparison *is* the value of the purchase and the player will otherwise miss it. With blanking panels,
**you watch the recirculation streamers stop as you fill the holes.**

### In-Row Cooling — "The Slot Unit"
A cooling unit that takes a rack slot in the row.

**Visual:** **visually trading floor space for targeted cold — the tradeoff is literally spatial.**

### Rear-Door Heat Exchanger
A door you bolt on.

**Visual:** the rack's heat plume **visibly stops leaving it.**

### Liquid Cooling (direct-to-chip loop / CDU / immersion tank)
Required above roughly 30kW/rack — the GPU gate.

**Opens:** **leaks**, coolant chemistry, a whole new maintenance discipline, and vendor lock-in.
**Visual:** the **Immersion Tank** is a gorgeous liquid-shader bath with boards suspended in it and
slow bubbles. **Genuinely the most beautiful object in the game; unlocking it should feel like a reward
in itself.**

### The Spill Kit, the Drip Tray and the Isolation Valve
Liquid-cooling-specific plant. **A counter made of four small unglamorous objects is a better lesson
than one big one.**

**How it works:** Once GPU/immersion lines exist, a coolant leak needs a counter chain that is
*physical and boring*: leak-detection cable, a **drip tray under each CDU**, an **isolation valve per
loop**, and a **spill kit with a trained person.** Each is cheap; together they turn a catastrophe into
a mop.

### Raised Floor + Tile Puller
Cable and air routing vs weight limits.

**How it works:** Perforated tiles you place individually to direct airflow — **a visible
micro-optimization puzzle.** Raised floor has a **weight limit that matters**: a rack of storage or
GPUs can exceed the load rating, which is a genuinely real constraint nobody thinks about.
**Visual:** **you can lift tiles and see the cable/pipe underworld, which is a whole second layer of
the level.**

### Airflow Streamers
Little ribbons tied to grilles, as in real datacenters.

**Visual:** They show direction and speed. **Free, charming, and a continuous readout with no HUD
cost.**

### Environmental Sensor Mesh
Per-rack inlet/outlet temperature, humidity, differential pressure, door-open sensors, and a leak cable
under the floor.

**Gives:** the data behind the thermal overlay. **Without it, the thermal map is a *simulation*, not a
*measurement*** — a great fog-of-instrumentation distinction: **before you buy sensors the game shows
you a modelled, smoothed, slightly wrong heat map; after you buy them the map gets noisier and truer,
and the hot spot turns out to be somewhere else.**

**Variations and additions**

- **The facility sensor tier, itemised** — raised-floor **leak rope**, **humidity bands** (under 20%
  is a static risk, over 80% is condensation), and a **per-row temperature grid.**
- **What it actually buys is warning time** — it **converts Water and Fire one-shots from *ambush*
  into *scheduled crisis*:** you get the leak as a growing wet tile minutes before it shorts, *if you
  can see the floor.*
- **Physical-layer monitoring as its own tower family** — which matches the design's "search the right
  layer" thesis exactly.
  **Hosting types:** colo, own-DC, and retro levels (the basement variant).

### DCIM (the facility's monitoring stack)
The building's equivalent of the Monitoring Stack, and equally layered.

**How it works:** Bought in layers, each closing a category of "I don't know": **asset tracking** (what's
where) → **power monitoring** (per-circuit, per-outlet) → **environmental** (temperature/humidity per
rack, per U) → **capacity modelling** (what fits where, with power and cooling headroom computed) →
**workflow** (change tickets tied to physical assets). Without it, the facility half of the board is
fogged exactly as the compute half is.
**Opens:** **DCIM holds credentials into your building automation — a compromise here is physical.**

### BMS / SCADA and OT Security
**The building's control system is a computer and nobody treats it like one.**

**How it works:** Chillers, generators, transfer switches, the fire panel and access control all speak
to a building management system running old software on a flat network with a default password,
installed by a contractor who **still has remote access.** **An entire second attack surface with
physical consequences** — an attacker who reaches the BMS can turn off your cooling.
**Counter:** OT segmentation, which is genuinely hard **because the vendor needs remote access to
support it.**
**Interacts with:** a whole new access-threat family, §4.4 segmentation, the Contractor's Contractor
(§4.8).

### Fire Detection (VESDA) — "The Sniffers"
Early smoke detection that finds the problem before there is a fire.

**How it works:** Aspirating detection with a sensitivity dial; too sensitive and you get nuisance
alarms from dust and from the anteroom you didn't build.

### Fire Suppression
Pure insurance. Prevents total loss. **Required by insurance and by enterprise tenants.**

**Sub-choice:** **water/wet-pipe** (cheap, destroys hardware, water pipes above your servers) vs
**pre-action dry-pipe** (pipes are empty until **two** independent triggers — smoke detection *plus*
heat — so a burst pipe or a single false alarm doesn't flood the room; cheaper than gas, still ruins
hardware when it fires) vs **inert gas / clean agent** (expensive, saves hardware) vs **none**
(gambling). A discharge takes the room offline either way, and **an accidental discharge is a
hilarious, expensive, real event.**
**Opens:** clean-agent discharge produces **acoustic energy that damages spinning drives** — the
suppression system itself causing the data loss.
**Visual:** ceiling nozzles; when it fires, a white gas flood fills the room and everything goes into a
brief frozen silhouette state. Rare, spectacular, terrifying. The **dry pipe** is visibly *empty* until
armed, and **the charge animation — water filling the pipe — is a dread machine.** **Clean Agent
Cylinders** are a row of red bottles with pressure gauges; after a discharge they are **visibly empty
and must be refilled at cost.** Consequences you can see.

**Variations and additions**

- **Three suppression tiers with the same footprint** — **wet-pipe sprinklers** (cheap; water is
  *always* the cure) → **pre-action** (double-confirm before dumping, so no surprise flood) →
  **clean-agent gas** (protects hardware; the evacuation timer is the halon theatre, formalised).
  Letting the player **design their own disaster flavour** is the point.
- **The water-versus-gas choice is an insurance-payout versus server-damage trade** — water kills
  hardware, and which system you own decides which of your two meters takes the hit.

### The EPO Guard
An $8 hinged plastic cover, purchasable in the facility tab, next to the six-figure generator.
**The joke is the price and the joke is correct.**

### Water Leak Detection Cable / Thermal Imaging Survey
Periodic maintenance actions and sensors with a real-world basis.

**How it works:** Thermal imaging finds a hot connection *before* it becomes a fire. Leak cable catches
the drip. Cheap, boring, decisive.

### Physical Security: Fence, Bollards, Gate, Mantrap, Badge, Biometrics, Cameras, Guard Post
Physical security, a compliance gate, **and a visible selling point on facility tours.**

**Opens:** nothing technical, but it **slows down your own techs** — a small ongoing time tax (accurate)
and the Shared Pipe principle applied to the building itself. Each layer has a **bypass** (tailgating,
a propped door, an uncovered camera cone). **A colo with a three-factor mantrap is secure and annoying,
and tenants complain about access friction constantly.**
**Visual:** **Bollards** exist entirely so you can see them stop a vehicle once, and it will be worth
it. **The Mantrap — "The Airlock"** is two doors that cannot both be open, and **watching a tailgater
get caught between them is the reward for building it.** **The Badge Reader** blips green/red per
event, and **access logs are drawn as a visible trail of footsteps on the floor for the last N
minutes — which is how you catch the Friendly Face.** **Cameras project visible coverage cones on the
floor; blind spots are literally dark wedges**, and you place cameras to eliminate them — a classic,
perfect, spatial security puzzle. **The Guard** is a stationary NPC with an optional patrol route drawn
as a visible path line, and is also the one who escorts tenants.

**Variations and additions**

- **Attackers past every digital defense must still run the physical gauntlet** before touching a
  rack — which turns tailgaters away at the doors instead of spawning them at the core. Each layer is
  a per-unit cost with **zero effect on the network layer**: the two-map tension, priced.
- **Badge cloners pair against badge readers** (counter: a credential-rotation upgrade), **guards see
  one aisle at a time** (a false sense of coverage), and guards get a **patrol route-planning
  micro-mechanic.**
- **The physical lane *merges* with the network lane at the switch** — two lanes, one building: the
  signature colocation map.
- **Cage lock quality trades against accessibility** — a better lock is a slower remote-hands
  response — and there is a "tenant brought a weird device" risk that no lock addresses.
- **The rack/cage adjacency is also a lockbox** against drive-by theft, and it is **required by
  regulated audits.**
- **Trust-centre payoff** — a polished facility with a visitor path **raises tour-driven enterprise
  close rates**, and the badge wall, locked rooms and CCTV retention are literal inspection
  checkpoints.
- **Visual:** the **Cage** is a lockable mesh enclosure over your colo island that physically blocks
  the rat and cargo-door threat lanes.

### Cable Management / Cable Tray / Patch Panel / Overhead Ladder Racking
A cosmetic-seeming upgrade that is actually mechanical. **The cheapest buildable with the largest
effect on every future physical operation.**

**How it works:** Unruly cabling accumulates a **spaghetti penalty**: remote-hands actions in that rack
take longer and have a chance to knock out a neighbouring cable ("while replacing the drive, the tech
bumped the uplink"). A **Cable Management pass** costs staff time and clears it. **Tidiness as a real
mechanic** — and, at colo tiers, tidiness a prospective tenant literally inspects.

**Give it numbers (wave-2):** each rack carries a **Tidiness 0–100.** Remote-hands and physical actions
in that rack take `duration × (1 + (100 − tidiness)/100)` and carry a `(100 − tidiness)/400` chance of
knocking out a neighbouring link. **Tidiness decays ~3 points per physical action** and is restored by
a cable-management pass (1 hand, 4 minutes, +35). At colo tiers it also feeds the tour score. Now
tidiness is a maintenance economy with a visible payoff and the game's most photogenic virtue. **A
"cable management debt" meter is both funny and true.**
**Visual:** buying a patch panel or a tray **reduces visual clutter** by routing many cables through one
tidy path. **Buying legibility is a rare and lovely thing for a game to sell you.**
**⚔️ The honest cost (or it violates the Three-Column Law):** a **bundled run is visibly harder to
trace** (hover fans it out), and a patch panel **adds a physical hop that appears in the Latency
Ladder** and consumes ports three times as fast. Tidiness must cost *something* visible.

**Variations and additions**

- **Tidiness is an optional upkeep chore with a real payoff** — messy cabling slows incident response,
  tidy cabling speeds everything, and in audit levels it is **the difference between sticky notes and
  a gold checkmark.**
- **Elevated trays are a third routing layer** — running through them avoids rodent-floor risk;
  trayless runs sag into visible trip hazards. Raised floors and conduit grant **passive adjacency
  bonuses**: faster repair crews, rat resistance.
- **The cheapest defense-per-dollar in the game, and nobody places it: the Fiber-Cleaning Kit.**
  **$30**, janitor-class, roughly single-use, and it cures a Dirty Connector event in one satisfying
  sparkle.

### Cable Label Printer
A cheap, tiny purchase that permanently reduces remote-hands errors.

**How it works:** Every ops person will buy it immediately and feel deeply seen. **One of the ~12
sanctioned "hygiene" pure-ish wins (§4.1)** — but not entirely free:
**⚔️ Its joke-shaped cost:** **labels that are *wrong* are worse than no labels.** The printer's benefit
is conditional on a maintenance habit — a **label-accuracy stat that decays as you re-patch**, and that
produces a specific, funny, painful incident when a tech trusts a stale label.

### Spare Parts Inventory / Spares Bin / Crash Cart
Pre-purchased disks, PSUs, NICs, DIMMs, optics and cables on site.

**How it works:** Converts a 4-hour outage into a 10-minute one — **pre-paying for response time.** A
classic capital-vs-risk tradeoff: cash tied up on a shelf vs mean-time-to-repair.
**Numbers (wave-2):** a stocked spare converts a **4-hour part-order outage into a 12-minute swap.**
Holding cost ~**2% of part value per month**, plus the cash being tied up. **Coverage is per
part-type**, so the decision is "**which three failures do I pre-pay to fix fast?**" — a genuinely good
recurring choice.
**Visual:** a wall of labelled parts drawers, each drawer front showing a count; **an empty drawer is
visibly open**, and the repair then waits for shipping, drawn as a **truck ETA.**

**Variations and additions — the spare-parts logistics family**

Three tiers of "hardware dies, then what":

- **The Advance-Replacement Contract** — a *paper* tower: the vendor overnight-ships a spare, which
  **converts Hardware Entropy from downtime into logistics.** A per-device monthly burn, and a
  maintenance-contract economy no tower defense has ever modelled.
- **The Warm-Spare Cart** — a rack-by-the-door of pre-configured, CMDB-registered *dead* servers. A
  hot spare only works if it is **the same machine as the one that died** (firmware, config, keys),
  so the cart is a living ledger of your standardisation — and a mixed-vendor policy means stocking
  one of each: **budget pain you feel weekly and thank monthly.** The swap becomes a ten-minute chore
  instead of a multi-wave wait. **The sad truth: 30% of the cart is hardware you no longer sell.**
- **The Spare Parts Depot** — a stock counter of hot-swappable drive caddies; a failed disk
  **auto-replaces via a tiny rail-cart** if the depot has stock, and **the *clunk* of the last caddy
  is your scarcity feedback.**

### The Crash Cart (and the Crash Cart as Console)
A rolling monitor-and-keyboard cart a tech pushes to a dead server. **The most beloved object in any
real datacenter.**

**How it works:** Lets a hand work on a machine with no network — niche, and one day it saves you. Its
**travel time is visible**, which is what makes out-of-band management feel valuable when you finally
buy it.
**Build it as the console UI:** selecting a machine and pressing the console key **wheels a crash cart
to it**; the in-game terminal renders on that screen, in the world, at that machine, **with the
machine's own hostname in the prompt.** **The terminal stops being a UI panel and becomes a place you
go.**

### Loading Dock / Staging Area / Freight Elevator
Determines how fast new hardware can be racked. **A throughput constraint on growth itself.**

**How it works:** A bottleneck object that only matters on busy days — and then matters enormously.
**Loading Dock Scheduling** extends it: deliveries must be **booked**, the freight elevator has a
weight limit and a queue, and two things arriving the same morning means one waits. **During a
build-out this is the actual constraint on progress, and it makes "order everything at once" a
mistake.**
**Opens:** unescorted delivery drivers; **cardboard in the whitespace** (a real fire-code violation);
and equipment sitting on the dock for weeks.
**Visual:** deliveries are a visible logistics stage — a **queue of crates with delivery dates chalked
on them**, and a crate cannot be racked until a hand moves it. **Lead time, stock level and build queue
become one photograph instead of three menus.** A busy company has a busy dock; a hoarding company has
a blocked one, and the decommission pallets pile up next to it.

### The Anteroom / Dust Lock
A small room that changes everything.

**How it works:** Unboxing, staging and cardboard removal happen **outside the data hall.** Cardboard
and pallets in a raised-floor room are a fire load and a particulate source, and every real facility
bans them. Cheap, boring, and it removes a whole family of small entropy events.

### The Burn-In Bench
New hardware does not go straight into production.

**How it works:** A staging area where new machines run a **24–72 hour soak** under synthetic load and
thermal stress before being racked. Costs floor space, power and time-to-revenue; catches the DOA rate
and a meaningful share of infant-mortality failures before they become customer-facing. **Buys
certainty with time, and converts a random failure into a scheduled one.**
**Opens:** the temptation to skip it when a customer is waiting — **exactly the decision worth
having.**

### The Lab Rack / Reference Rack
A physically separate, non-production rack with its own power and switch. Mirrors your **hardware and
network** (as distinct from Staging, which mirrors your *service*).

**Gives:** a place to test firmware upgrades, practise failovers, reproduce a customer's weird
configuration, and run chaos experiments. **Converts "we'll test in production" into a purchasable
alternative.**
**Costs:** a rack of capital that earns nothing — the purest Staging idea applied to *hardware*, and
therefore harder to justify and more valuable.
**Opens:** **it becomes a dumping ground for old gear and quietly turns into production** when someone
needs a box in a hurry. The game should let this happen and then run a real customer's workload on
unpatched lab hardware **for three levels before anyone notices.**

### Diverse Fiber Entry
Two physical conduits into the building.

**How it works:** Expensive; **the only counter to the backhoe.** The thing everyone claims to have and
few actually do.

### Meet-Me Room — "The Cathedral"
Lets you sell cross-connects to tenants. **The single most profitable room in a colo building.**

**How it works:** Cross-connects at ~95% margin, recurring, and they create switching costs. **Carrier
density attracts more tenants, a real network effect**, and controls how many carriers your tenants can
reach.
**Visual:** a visually distinct, higher-ceilinged room with ordered racks of patch panels and carrier
equipment — **the one place in the facility that looks *sacred*.** A neutral zone where your cable
meets many carriers' cables: a beautiful spaghetti set-piece you *can't* tidy, by rule.

### Carrier Diversity
Multiple carriers in the building.

**How it works:** A marketing asset and a resilience stat at once — **"carrier-neutral" is a sales term
that literally closes deals.**

### Cabinet / Cage / Private Suite *(colo)*
Three escalating tiers of sellable space with escalating isolation and price.

### Building Shell Expansion / Build-to-Suit / Build-Out Shell Space
Pre-purchased capacity for future expansion. **Dead money now, and the only way to grow fast later.**

**How it works:** The wholesale product: you build 10MW because someone pre-leased it. Enormous capex,
financed, with a construction timeline that can overrun.

### Datacenter Shell vs Leased Space
The foundational strategy build: **own the building, or rent the cage.**

**How it works:** **Own** — capex plus depreciation, a lower unit cost, and an asset on the balance
sheet. **Lease** — opex, flexible, no equity. The choice affects **every later level's economics**,
and the visual progression runs from "one closet" to "campus."
**What the shell bundles:** UPS, generator and fuel, **N+1 versus 2N power**, a chilled-water plant,
fire suppression, dual-entry fibre, raised floors, cages and biometrics. Each adds capex **and**
upkeep, and each **removes a threat family** outright.
**The ladder is the SLA-class unlock:** each power tier unlocks a higher SLA class and the enterprise
RFPs that check for it — and **N+1 redundancy is dead cost until the day it is used**, which is the
investment tension in one line.
**Interacts with:** §4.7 in full, the SLA Contract Tier (§4.9), Cabinet/Cage/Private Suite, §6
financing.
**Hosting types:** colo, own-DC, wholesale.

### Vendor TAC Support / "Phone a Friend"
Whose engineers answer your 3am call.

**How it works:** During a P1 you open a ticket, and some incidents get a scripted **"vendor hotfix
arrives two hours earlier"** event — the Zero-Day Meteor fizzles on your OS tier. Costs per-incident
fees, and models the real power move behind an enterprise support contract.
**As a diegetic hint system:** **one vendor escalation per level** instantly diagnoses and one-shots a
single incident, and using it **reveals the codex tip for that threat class forever.** Expensive,
limited, and the vendor engineer occasionally says "have you tried turning it off and on again" —
**which works about 30% of the time.**
**Interacts with:** the Hardware Support Tier (§4.9), the Greybeard Consultant (§4.8), §4.13 rentals.

### On-Site Water / Chiller Plant Politics
A cost and a **political/regulatory liability in drought regions.**

**How it works:** Water usage becomes a community-relations and permitting stat, not just a bill.

### Waste Heat Recovery
Selling the by-product.

**How it works:** Heat exchangers and a pipe to a neighbour. Turns a cost into a revenue line, requires
**a physical customer within a kilometre**, and creates a contractual obligation to keep producing heat
— **so you cannot idle down without breaching it. A revenue line that constrains your operations** is a
lovely, unusual object.

**Variations and additions**

- **The Waste-Heat Marketplace — "the greenhouse deal."** Sell your BTUs: a district-heating pipe, a
  tomato greenhouse, an ice rink. **Heat becomes a positive meter** — overclocking and summer loads
  *earn* more — until a cooling failure breaks the contract and **the tomatoes die: churn with a
  face.**
- **The pipe's capacity is a soft power cap *with a payout instead of a fine*** — the rare constraint
  the player wants to hit.
- **Deals carry seasonal contracts** — a winter premium, an ice rink that churns in July, a greenhouse
  that burns adorably.
  **Hosting types:** own-DC, GPU, northern regions.

### Seismic Bracing / Raised Floor vs Slab / Roof Condition / Overhead Tray
Structural choices and site-quality modifiers.

**How it works:** The routing-plane choice (under-floor vs overhead) is a pure aesthetics-and-legibility
decision the player gets to make. Raised floor has a weight limit that matters for battery strings and
storage arrays.

### The Office
A small attached area where staff sprites live between tasks.

**How it works:** Desks, a coffee machine, and a **whiteboard that shows your current architecture as a
scribbled diagram auto-generated from your real topology** — a lovely diegetic minimap. Culture and
the hiring pipeline live here too, affecting turnover and the Ex-Employee threat.
**The joke that makes it a mechanic (wave-2):** **the whiteboard is out of date.** It renders the
topology as of the last time someone updated it, **with a date in the corner**; objects added since are
missing; updating it costs a hand. **Documentation rot rendered as a minimap that lies** — the single
best joke available to this game.
**Grown-up form:** the Back Office Mezzanine (§4.14).

### NOC / Operations Floor
Staffed monitoring, as a room.

**Opens:** **the "big screen with graphs nobody is looking at" problem** — a room you pay for whose
value depends entirely on attention, which is the scarcest resource in the game.

---

## 4.8 Staff

*People are buildables, they are the most important ones, and they are the best animations. Staff are
also **hands** (Pillar P4) — the parallelism limit on everything you can do. Every staff member has
**skills, capacity (hours), fatigue, knowledge of your specific systems, and cost.** Knowledge is the
important one: **a new hire with great skills is useless for three months.***

### The Team Model (four sub-stats, one owner each)
*Wave-2 arbitration. Morale, Burnout, the On-Call Rotation, the Vacation mechanic, Skill Pips, Bus
Factor and Culture are seven systems describing one thing, with overlapping stats and no arbitration.
Collapse them:*

- **Capacity** — hands available *now*. Reduced by on-call recovery, vacation, illness, and meetings.
- **Energy** (0–100, per person) — drains with incidents, overtime and night work; recovers with quiet
  time and with **root-cause fixes rather than firefighting.** Below 30, error rate rises; at 0, they
  leave.
- **Knowledge** (per person, per subsystem) — the source of bus factor, the thing documentation
  externalises, and the thing that walks out the door.
- **Culture** (company-wide) — a slow stat fed by blameless postmortems, sustainable on-call,
  documentation and whether you keep your own handbook. It modifies hiring cost, retention, and
  **whether people tell you bad news early** — the most important and least modelled thing in any
  organisation.
**Everything else in this section is a modifier on one of these four.**

### Role compression: five roles × three seniorities
*A management sim inside a tower defense is a design risk; the roster below is the flavour layer on top
of a small hireable grid.*

**How it works:** Hire from **Ops, Network, Data, Security, Support**, each **Junior / Mid / Senior**,
plus a small set of **specialisations** (a Mid Ops with a DBA specialisation; a Senior Ops with an
Automation specialisation). Every named role below becomes a specialisation or a named individual
rather than a separate hireable class. This keeps every flavour idea, removes hiring-screen paralysis,
and makes the shift-placement puzzle tractable.
**⚔️ Tension:** the full roster is genuinely more characterful, and several roles carry *unique
mechanics* rather than stat differences (the Network Engineer's idle behaviour improves the art; the
Security Engineer is a rendering modifier; the DPO can *block* you). Ship the 5×3 grid as the hiring
UI and the named roles as what the grid *produces* — the fiction stays, the screen shrinks.

**Variations and additions**

- **The extended roster (the flavour layer, in full).** A tier ladder — **NOC T1** (auto-handles
  routine tickets and alerts; escalation delays annoy customers) → **T2** → **T3 "senior wizard"** who
  solves named impossible incidents. Then: **Sysadmin** (maintains N *nearby* nodes — a range-limited
  upkeep aura, so placement matters), **Security Analyst** (reads logs and reveals stealth across the
  whole board on a "shift" cadence), **Support Agent** (ticket de-escalation: cheap, low status, easy
  to underhire — **the moral trap of the genre**), **Abuse Desk Clerk** (converts abuse tickets into
  takedowns before your reputation bleeds), **DBA/SRE specialist** (unlocks or optimises a service
  tier), **Janitor** (catches rats and dust — yes, a real hardware threat), **PR/Comms Manager**
  (accelerates reputation recovery; crafts incident tweets as a mini event-choice mechanic), and the
  **Lawyer retainer** (a defense tower that shoots paperwork: lawsuits, patent trolls, seizure delays
  — and negotiates the ransom or the regulator).
- **Staff XP grows with each handled incident** — a parallel progression track running under the
  hiring grid. **Interns are cheap, chaotic, and they *discover things*.**
- **Humans are towers AND holes.** Staff add surface: they can be phished, they can become insiders,
  and their skill meters matter. **Hiring has a pipeline with lag, seniority has ramp time**, and the
  **onshore/offshore/automated mix is a genuine quality-cost dial** with its own perception events.
- **Support is a profit centre at tiers** — silver/gold SLAs priced per plan belong in the plans
  console (§4.9), not buried in the staff screen.
- **The pet problem, solved.** Human sprites that path to breakage wander, occlude and demand
  micromanagement at scale. So: **after tier 2, staff become zone-auras with a visible work queue.**
  The queue is the gameplay read; the sprite just animates nearby. **"One tiny figure running
  everywhere" stays a *signal*, not an API.**
- **Visual: the attention cone.** Each operator carries a translucent wedge that *is* their
  detection/response coverage — hiring adds wedges, upgrades speed the saccade animation — and when
  multiple alerts fire the sprite visibly **runs and starts tripping** (overload reads as slow motion
  and missed tickets).

### Staff Shifts as a Placement Puzzle
Staff are not a headcount number; they are **blocks on a 24-hour strip.**

**How it works:** Each person covers 8 hours, has a preferred band, and degrades outside it. The player
drags shift blocks to build coverage. **Gaps are visible as dark bands on the clock — and threats with
the "Timed" affix are drawn into exactly those bands.** "There is a hole in your coverage at 03:00 and
something knows it" is a genuinely great pressure image, and it turns on-call from text into the
game's cleanest resource-placement puzzle.

### Staff as Rendering Modifiers
**The best single idea in this section, promoted to a named pattern.**

**How it works:** **Hiring literally changes what you can see.** The Security Analyst's presence
increases the alpha on stealth threats. The **DBA** makes query internals visible in the DB's cutaway.
The **Network Engineer** makes link error counters visible without an overlay. The **Support lead**
makes customer mood halos visible at mid-zoom. The **Greybeard** highlights the *cause* rather than the
symptom. **A far better expression of expertise than a percentage buff.**

**Variations and additions**

- **Ambient self-repair is the staffing stat you *see*.** Sysadmins patrol with tiny wrench popups
  fixing small things; DevOps carries pipelines to throw over walls; the night NOC operator sleeps
  until an alert jars him awake. **Understaffing shows as one tiny figure running everywhere —
  staffing is the speed of your ambient self-repair.**

### The Hands Dock
P4 calls attention "the scarcest resource in the game." It deserves better than tokens at the bottom of
the screen.

**How it looks:** A **peg rail** at the bottom-left with one physical tag per hand, each bearing the
staff member's initials and role colour. Assigning a hand **lifts the tag off the rail and hangs it on
the object**, where it stays visible in the world for the action's duration with a small progress arc.
**An empty rail is an empty rail — the most legible panic signal available.** Overtime hands hang
*below* the rail, crooked. Automation removes the *need* for a tag and plays a small animation of a tag
being replaced by a printed card. ***"I have money and no hands" becomes an image.***

### The Staff Silhouette Set
Eight-to-ten silhouettes distinguishable at 16px by **head shape + one carried object + gait.**

**How it looks:** **Junior** (hoodie up, phone, fast) · **Sysadmin** (lanyard, laptop, medium) ·
**Greybeard** (mug, nothing, slow) · **Network Engineer** (coil of cable, cable tester, purposeful,
kneeling at patch panels) · **DBA** (tablet, glasses, still, permanently at a desk) · **Security**
(headset, dark jacket, stationary at the wall, three monitors) · **Support** (headset, paper slips,
back and forth) · **DC Tech** (hard hat, cart, always pushing something) · **Compliance Officer**
(violet lanyard, clipboard) · **Facilities/Electrician** (hard hat, arc-flash suit) · **Sales** (suit,
coffee for a customer) · **Cable Monkey** (spool on a shoulder).
**Sign-off rule:** print them black on white at 16px; if two are confusable, redesign.

### The Fatigue Posture Ladder
**Fatigue as posture is much better than fatigue as a number.**

**How it looks:** Five authored postures — **Fresh** (upright, quick) → **Working** (neutral) →
**Tired** (shoulders down, slower walk cycle) → **Burnt** (dragging, stops occasionally, a small error
pip) → **Gone** (walks to the door and out, once, permanently). Staff also **desaturate over a shift**;
an all-grey ops team works slower and makes mistakes, and hiring or rest visibly restores colour. The
numeric ring remains as a backup for players who want it, but **the room's posture tells you the team's
state from the establishing frame.**

### Morale / Burnout (the playable states)
Team-wide and per-person.

**How it works:** Fed by incident frequency and overtime; drained by quiet weeks and by **actually
fixing root causes instead of firefighting** — so it rewards the player for choosing durable fixes over
quick ones, which is exactly the value the game wants to teach.
**The intermediate states (wave-2), so it's a system rather than a countdown:** **Fresh** (full speed,
catches things) → **Tired** (−20% speed) → **Strained** (+error chance, **won't volunteer
information**) → **Checked Out** (**does exactly what's asked and no more — the most realistic and most
dangerous state**) → **Gone.**
**Recovery must be actionable:** time off, a quiet week, a win, a blameless postmortem, and — the
important one — **fixing the thing that keeps waking them up. Burnout is caused by recurring
incidents, so root-cause fixes *are* the morale mechanic.**

**Variations and additions**

- **The Staff Break Room / Wellness Perk as a buildable** — reduces on-call fatigue and error rate.
  A clearer purchase now that Staff Burnout Resignation carries a real ceiling consequence: it is the
  cheapest thing that moves Energy without moving the incident rate.
- **The break-room morale diorama** reads wellness with no panel at all: coffee-queue length, plant
  health, whiteboard joke count, whether the nap mat is out.
- **The failure state, stated bluntly:** overwork → mistakes → **you get fired.**

### Staff Skill Pips
Little chevrons on the sleeve or badge, 1–5 per skill, earned by handling incidents.

**How it works:** Visible growth over a campaign; you get attached to the ones who've been with you
since Tier 1 — the human counterpart to the asset-tag idea for hardware.

### The Bus-Factor Halo
Key-person risk, rendered.

**How it looks:** A staffer who is the *only* one who knows a system gets a thin, ominous halo, and
**every system only they know draws a faint tether to them. When they quit, you watch the tethers
snap.**
**Interacts with:** the Secondary Everything Register (§4.6), Documentation, Knowledge.

### The Pager (as an object)
Off-shift staff appear as a phone icon.

**Visual:** paging them shows a phone buzzing, then a car arriving, then them walking in — **a visible
3-minute response time.**

### The Follow-the-Sun Band
In multi-region levels, a lit band across the globe view shows which team is awake.

**Visual:** handoffs are drawn as **a baton pass animation between two NOC desks** — which is also
where **handover loss** happens (see On-Call Rotation).

### Junior Sysadmin
Cheap, handles routine tickets, occasionally causes an incident.

**How it works:** Grows into a senior if you invest in training and don't burn them out.
**Visual:** moves fast, fixes small things, wears a hoodie, and produces a nervous little "oops" bubble
when they cause a bad deploy.

### The Sysadmin (generalist)
1 hand. Performs any manual action at base speed. The unit everything else is measured against.

### Senior SRE / Greybeard
Expensive; prevents outages, halves MTTR, and is the only one who can safely perform "risky" actions.

**How it works:** Bus-factor risk if they're your only one. In the SRE framing, they don't do manual
work — **they build automation**, converting hands into permanent standing rules. The "invest in the
future" unit.
**Visual:** moves slowly and deliberately, drinks from a giant mug, and their slow walking speed is a
joke and a mechanic. **Their effect renders on the world, not on the person:** rather than an aura
(auras are hard to read and collide with the ring taxonomy), **the objects they're near visibly
stabilize** — LED cadence regularizing to the heartbeat, load donuts settling. Keep the mug.

### The Legend
A rare hireable with a unique passive.

**How it works:** E.g. "hardware failures are telegraphed one shift early." **Hero units for a tower
defense — one or two per campaign**, found rather than hired, and losing one hurts.

### Network Engineer
Required for BGP/peering/cabling actions; 2× speed on routing tasks; **the only one who can safely
touch BGP** and therefore extremely bus-factor-y.

**How it works:** Idle most of the time, indispensable once a year. Refuses to touch application
problems (comedic, and mechanically forces role diversity). Can find the Loose Cable.
**Visual:** carries a cable tester. **Idle animation: tidying cables, which visibly improves your
cable-spline mess score and your rack Tidiness stat.** A staffer whose *idle behaviour improves the
art* is a wonderful idea.

### DBA
Turns "the database is slow" from a mystery into a fix. **Often the highest-ROI hire nobody makes.**

**How it works:** Adds index/query-tuning actions that no one else can do; prevents the slow-query
apocalypse and speeds migrations.

### Security Engineer / Security Analyst / SOC
Passively reduces Surface on all builds; unlocks hardening, incident response, threat hunting and
vulnerability triage; runs the audit.

**How it works:** **Produces no visible revenue — the classic budget-cut victim**, and the ROI is never
visible in a good quarter, which is exactly why players skip it and learn. The game should make cutting
them *feel* fine for 30 days and then not.
**Make the value legible (wave-2):** a **continuous running "prevented" counter on their card** ("your
WAF blocked 4,102 attempts this week"), a running **"estimated losses prevented"** figure, and — the
teeth — **firing them has a 90-day lag before consequences arrive.** Then the player who cuts them
experiences the exact real-world sequence: three good months, then a bad quarter, and the Attribution
Ledger names the cause.
**Visual:** sits at the Monitoring Wall; the canonical **Staff as Rendering Modifier.**

### Automation Engineer
Converts recurring toil into a one-time cost.

**How it works:** Should let the player **literally delete a recurring upkeep drain** from the ledger.
**The best long-run investment**, and the mechanical expression of the Runbook Ladder.

### Support Tier 1 / Tier 2 / Tier 3
Queue throughput. Tier 1 deflects and handles volume; Tier 2 solves; Tier 3 is engineering-adjacent.

**How it works:** **The unit that protects your other units' attention.** Under-staffing Tier 2 makes
Tier 1 escalate everything to engineers, which destroys engineering velocity — a real and very
satisfying second-order effect. Overstaff = margin bleed; understaff = churn, **with a 60-day delayed
churn tail the player has to learn to anticipate.** Model **cost per ticket** and **first response
time** as explicit dials. Tier 1 is the biggest opex line in shared hosting and has high churn of its
own.
**Visual:** stands at the in-tray, pulls paper slips, walks to angry clients and turns their mood ring
back toward gold with a speech-bubble animation.

### 24/7 Coverage
A step-function cost increase: **you need roughly 5 FTEs to cover one seat round the clock.**

**Unlocks:** enterprise and game-hosting customers who **won't buy without it.**

### Offshore / Follow-the-Sun Support Pod
Cheaper per ticket (~60% lower), timezone coverage, quality penalty.

**Costs:** a **90-day ramp during which service is worse**; a documentation prerequisite; management
overhead.
**Opens:** segment-specific churn (some customer types react badly), a CSAT drop that drifts your
reputation in a way the player may not connect back to the decision, knowledge fragmentation, and the
possibility that **your two support teams give contradictory answers.**

### Sales Rep / SDR / AE / Sales Engineer
Converts Enterprise Evaluators and Tenant Tours into contracts.

**How it works:** Lead quality depends on your reputation, so **sales without ops is worthless** (a nice
anti-degenerate-strategy check). Also over-promises features you don't have, **creating future
obligations — a threat generated by your own business side.** The Sales Engineer specifically converts
tours and is **useless in web-hosting levels, essential in colo levels** — staff whose value depends on
your line of business.
**The ramp and the loss (wave-2):** reps take **4–6 months to ramp** and **~30–40% don't work out**, so
hiring sales is a lagging, lossy investment. And the sharpest detail: **a rep's pipeline leaves with
them** — losing a rep in month 9 costs you the deals they were working, not just the headcount. Their
**compensation plan is a tunable object** (§4.9).

### Account Manager / Customer Success Manager
Reduces enterprise churn, catches problems before they become SLA claims, and upsells.

**How it works:** **The one hire an engineer-player will resist and shouldn't.** The early-warning radar
for the Concentration Whale getting itchy. Assigned to accounts above an ARPU threshold.
**The coverage math (wave-2), so the player can reason:** one CSM covers roughly **20–40 mid-market
accounts or 3–8 enterprise accounts**, and the ROI is churn reduction on the covered book — typically
**2–5 percentage points of annual churn**, which on a $2M book is $40–100k/yr against a ~$90k cost.
**Marginal, and that's the point:** a CSM is worth it above an ARPU threshold and a waste below it,
making it a **segmentation decision rather than a yes/no.**
**Opens:** your AM leaves and **takes the relationships with them.**

**Variations and additions**

- **Named CSM figures assigned to the biggest accounts** who proactively spot a **usage drop** (a
  churn-aura pre-warning) and drive expansion (faster upsell triggers). They personally walk whales
  through launch and pre-empt churn ghosts, and **on whales the ROI is immediate.**
- **It scales badly — and that is the point.** You *feel* the service-business ceiling until self-
  serve automation relieves it, which is the cleanest possible argument for the portal (§4.9).
- **Pairs with the Health Score** for a full retention defense stack: the score finds them, the CSM
  goes.

### Marketing Lead
Improves ad efficiency and content output; allocates budget across lanes and runs promos.

**Opens:** CAC inflation, and — worse — **it can generate demand you cannot fulfil, which is worse than
no demand.**

### Abuse / Trust & Safety
Handles complaints, keeps your IP space clean, evicts spammers, processes DMCA, phishing and spam
reports.

**How it works:** Has a **policy dial** (permissive ↔ aggressive) trading legal exposure against
customer trust. Under-built = upstream null-routes you; over-built = you terminate innocent customers
and eat a viral thread.
**The hard external constraint that makes it a countdown (wave-2):** **your upstream and your RIR
expect `abuse@` to be monitored and complaints actioned within 24–48 hours.** Miss that and the
escalation isn't a customer complaint — it's your transit provider's abuse team, and after that it's a
null route. **That turns the abuse desk from a moral dial into a clock.**

**Variations and additions**

- **The abuse desk has levels, and skipping the first one is fatal** — **none** (you get
  upstream-dropped and blacklisted) → **form-letter** (complaints get answered) → **forensic**
  (targeted termination of *only* the bad tenants). The ladder is the difference between losing a
  customer and losing your IP space.
- **It protects the IP-reputation pools across email, colo and CDN simultaneously**, and **a strong
  desk with a loud AUP even wins regulated deals** — it is proof you are not a spammer hotel.
- **What it is made of:** an intake pipeline, response SLAs *with complainants*, evidence logs, and an
  upgradable AUP policy engine.

### The Developer
Improves application efficiency (reduces per-request cost) but **increases Bad Deploy frequency.**

**How it works:** Progress with a risk attached — the cleanest two-column staff member in the game.

### The Intern
Nearly free, 0.5 hands, small chance of causing an incident.

**How it works:** Over time, can be trained into a full Sysadmin. **A unit that is an investment with a
variance tax.** Narrates their mistakes afterward, cheerfully.

### Datacenter Tech / Remote Hands
Either on staff (fixed cost, instant response) or contracted (per-incident or 15-minute-increment cost,
30-minute to 4-hour delay).

**How it works:** A pure build-vs-buy decision with a **real crossover calculation the player can get
wrong.** **Outsourcing attention** — a direct Pillar-P4 lever: slower and more expensive than doing it
yourself, but it doesn't consume *your* staff. At colo tiers, remote hands is also a **margin product
and a retention tool** you sell to tenants.
**Visual:** at colo tiers you don't own them — you *request* them, and they appear as a
differently-uniformed sprite who does exactly what the ticket said and no more, **sometimes comically
literally.** **The ticket text should be visible in a speech bubble as they execute it, word for
word**, so the gap between what you meant and what you wrote is on screen. That's the whole mechanic,
and it's currently only in prose.

**Variations and additions**

- **The Remote Hands Contract, priced** — pay **per visit ($/truck-roll, billable to NPCs too)** when
  you cannot physically reach a rack: reboot, reseat a cable, swap a drive. It **removes
  physical-layer helplessness for cash**, which is the whole product.
- **The Staff Pod** is the labour-pool form: it also absorbs **tenant-server physical incidents you
  would otherwise eat reputation for** — and **over-commit them and tickets rot.**
- **As a unit**, the repair squad walks the facility: mobile, slow, and essential at exactly the
  moment hardware failure meets no redundancy.

### The Contractor / Consultant
Instant expertise, costs a lot, temporary.

**Opens:** leaves behind an SSH key you might forget.
**Visual:** wears a visitor badge, a different uniform colour, works fast, leaves at level end. **Gains
no pips, writes no runbooks. The art tells you the tradeoff.**

### Contractor Surge
Expensive temporary hands for a build-out.

**How it works:** Converts money into throughput during a construction phase, with **no institutional
knowledge** left behind — so the build finishes and nobody knows how it was wired.

### The Contractor's Contractor
Not a hire; **a hole in the staff system.**

**How it works:** A sub-subcontractor who appears on your floor with a badge you didn't issue. **A
threat wearing a staff sprite**, and the reason escort policy and badge auditing exist.

### The Greybeard Consultant (rentable)
Rentable for one level at high cost; instantly diagnoses any mystery.

**How it works:** An expensive "get unstuck" button that respects the player's time.

### The Night-Shift Tech
Only visible in the night band.

**Visual:** their lonely little flashlight moving through a dark room is a mood piece.

### The On-Call Rotation
Not a person, a *structure*.

**How it works:** Requires enough people that nobody is always on. **You are managing a sleep budget**,
which is the most authentic operations mechanic imaginable and a genuinely novel resource. Covering
nights costs the next day's effectiveness.
**Two hard rules (wave-2):**
- **Rotation size has a hard floor.** Below roughly **4–6 people**, on-call is not sustainable at any
  compensation, and the model should make this **a cliff rather than a gradient**: a 2-person rotation
  degrades both people continuously *regardless of incident volume*, because **the anticipation is the
  cost even on quiet nights. You are paying for the pager whether or not it rings** — the single
  truest thing about on-call. A one-person rotation is a slow-motion resignation.
- **Follow-the-sun is not free.** A 3-region rotation eliminates night pages and introduces
  **handover loss** — context dropped between shifts — which measurably lengthens multi-shift
  incidents. **So the humane answer costs MTTR**, a genuinely hard and genuinely real trade.

**Variations and additions**

- **On-call as a meta-buildable** — it lets **any** tower act at night, at a fatigue-decay rate,
  which literally **converts good staffing into build time between waves.**
- **The Pager as a spell** — one emergency action per crisis, with a cooldown and a **morale cost per
  page. Over-page and they quit.**
- **The On-Call Room** converts night alerts into fast MTTR but **accumulates a visible fatigue meter
  per hire**; overuse triggers mistake waves and quit events. The humane-ops thesis, built into
  architecture rather than into a tooltip.
- **The real maths** — 24×7 coverage needs roughly **4–5 FTE per seat**, plus a night-shift premium.
- **Staff should have commute and shift schedules** — which interacts with The Long Night and with
  timezone co-op: **your best engineer sleeps through the storm unless you paid for follow-the-sun
  coverage.**
- **Fatigue shows physically** — slumping posture and coffee-cup fill level; the on-call engineer
  teleports to incidents coffee in hand, and is **slower to far racks unless you added remote
  hands.**

### Training / Certification Budget
Converts juniors into seniors over time.

**How it works:** Also a **prerequisite for compliance** in regulated lines, and a retention lever
(people stay where they learn).

### Documentation Culture
A slow, cheap, passive buildable.

**How it works:** Reduces the damage of staff turnover, reduces runbook rot, required for audits,
produced by staff-time, and **decays if not maintained.**

### Background-Checked Staff Pool
A regulated-hosting requirement.

**How it works:** Slower and more expensive to hire; a clearance lapse removes someone from in-scope
work mid-level.
**Hosting types:** regulated, government, financial, healthcare.

### The Distributed-Team Toggle
A single switch that reshapes the entire staff economy. **Extremely current and completely absent from
a model that assumes everyone is in a room.**

**How it works:** **Gives** a wider hiring pool (cheaper senior talent, follow-the-sun coverage for
free). **Costs** slower informal knowledge transfer (Knowledge decays faster and spreads slower), a
harder Culture stat to move, and — decisively — **no hands for anything physical**, which makes remote
hands, out-of-band management and automation **mandatory rather than optional.**

### Additional roles with real mechanics

- **The Controller / Bookkeeper** — **the actual first finance hire in a hosting company**, and
  transformative: invoices go out on time, dunning runs, receivables get chased, and you find out what
  you actually make. Cheap, unglamorous, and the reason a lot of small hosts survive. Good early-tier
  hire with a visible immediate effect (DSO drops, leakage drops).
- **Capacity Planner** — converts monitoring history into purchase orders **with lead times.** Without
  one, you always buy late. **Idle 90% of the time and worth their salary twice a year.**
- **FinOps / Cost Analyst** — finds the revenue leakage, the idle capacity, the forgotten environment
  and the plan that loses money. **Pays for themselves and is always the first cut.**
- **Release Manager / Change Coordinator** — owns the calendar, the freeze windows, and conflict
  detection ("these two changes cannot happen the same night").
- **Technical Writer** — converts tribal knowledge into runbooks at a much better rate than engineers
  do, **and their runbooks decay slower. The cheapest MTTR purchase in the game.**
- **Deliverability Specialist** *(email)* — a human whose job is **relationships with mailbox
  providers. Cannot be automated, which is the joke and the point.**
- **Peering Coordinator** — attends conferences, negotiates, maintains PeeringDB, and their entire
  output is **other networks' willingness to peer. A role whose stat is social.**
- **Data Protection Officer** *(regulated/GDPR)* — mandatory above a threshold in some regimes, and
  **can *block* the business from doing things. The first staff member who reduces your agency and is
  correct to.**
- **Compliance Officer** — produces evidence tokens, maintains policy, liaises with auditors.
- **Facilities Manager** — owns the building, the vendors, the maintenance calendar and the
  inspections. **In facility lines, more important than any engineer.**
- **Facilities Tech / Electrician** — performs generator tests and PM schedules; the only one who can
  safely do arc-flash work.
- **Safety Officer** — gates physical work, slows everything, **prevents the one incident you cannot
  recover from.**
- **Community Manager** — the forum, the Discord, the subreddit. Converts angry users into moderators
  and is **the cheapest support capacity in existence.**
- **HR / Recruiting** — hiring has a lead time and a failure rate; **a bad hire costs 2× salary.**
- **Procurement** — see §4.9.

---

## 4.9 The business machine

*The key CEO-lens contribution: **half your towers aren't servers.** Billing, support, sales,
marketing, legal, and finance are all buildable, upgradeable, staffable structures that consume cash,
produce revenue or defense, and introduce their own attack surface. **The org chart is a tech tree.***

### Scoping rule: six departments, not forty buildings
*Presented all at once, forty business buildables are a second game.*

**How it works:** Group them into **six departments — Billing, Support, Sales, Marketing,
Legal/Compliance, Finance** — each a single building with **internal slots** you fill with the specific
capabilities below. The player's decision becomes "**how much of my floor is Support?**" rather than
"do I own a dunning engine, a collections desk and a ticket router?" **Same content, one tenth the
cognitive load, and the floorplan becomes a readable statement of strategy.**

### Reveal schedule: nothing appears before its tier
*The design never says when each business object appears, which is why it reads as forty unexplained
options.*

- **Tier 0–1:** none. **You are the business.**
- **Tier 2:** Billing Platform, Payment Gateway, a ticketing system. **Three objects.**
- **Tier 3:** Dunning, Fraud Screening, Status Page, Knowledge Base, the Pricing Engine, one support
  tier. **Six more.**
- **Tier 4:** Sales, Account Management, Abuse Desk, Legal Retainer, Compliance Vault, Collections.
- **Tier 5+:** everything else.
**Nothing appears in the build palette before its tier**, so the business layer grows at the same rate
as the infrastructure layer and neither ever dumps forty options on the player at once.

### The Rate Card / Price Book
A first-class, editable, diegetic object rather than a menu.

**Gives:** every plan, term, renewal price, add-on and regional variant in one place, with **live
per-SKU contribution margin.**
**Costs:** nothing to hold; **changing it is the expensive part** (comms, grandfathering, system
changes).
**Opens:** **price inconsistency** — once sales can quote off-card, you get a hundred one-off prices
you must honour for years and can never report on cleanly.

**Variations and additions**

- **The Price Sign** — the rate card's diegetic face: a **physical hanging storefront sign on a
  dial.** A higher price visibly thins the arriving stream, but each figure carries **bigger, slower
  coins**; a low price swarms you — **including with the wrong sort**, because abusive tenants spawn
  more readily from bargain traffic. The purest dual-flow economic tower in the game.
- **The Pricing Page (buildable *and* battlemap)** — its enterprise sibling, a literal structure you
  configure: **Good/Better/Best tiers with a decoy anchor**, feature gates, first-term versus renewal
  prices, currency, fine print. Each edit **moves acquisition instantly and churn with a lag.**
  Version it; A/B test it.
- **The Brand Positioning Dial** — commodity-cheap ↔ premium-trusted. The cheap end grows the trial
  funnel but **magnetises abuse customers and race-to-the-bottom exposure**; the premium end opens
  enterprise and regulated gateways but **raises support expectations and makes any visible failure
  hurt more.** Committing to a position *gates certain tactics.* The marketing department in one
  slider.

### Pricing Engine / The Plan Builder
**The flagship business building and the best systemic business idea in the design** — product design
as a mechanic.

**How it works:** A card-composer UI: drag *resources* (disk, RAM, CPU, bandwidth, sites allowed) and
*features* (SSL, backups, staging, SSH, priority support) onto a plan card, set a price, a renewal
price and a term. The game shows you, live: estimated conversion rate, estimated cost-to-serve,
estimated margin, **estimated support tickets per account**, and a **payback-period readout next to the
margin readout** — because margin without payback is how hosts die while growing.

**The fields that change everything (wave-2 additions):**
- **Term ladder** — monthly / 12 / 24 / 36 with per-term pricing.
- **Renewal price as a separate field from intro price**, with a visible **"renewal shock %"**
  warning.
- **Support entitlement per tier** (channels, response time) — support is a packaged product.
- **Overage policy** — hard cap / soft cap / auto-upgrade / bill it. The choice determines whether you
  get **bill-shock events or capacity events.**
- **Payment methods permitted per tier** (card only below $X, ACH/wire above) — a margin lever.
- **Contract requirement** (self-serve vs signed MSA), which gates *which customers can even buy.*
- **Currency and regional pricing**, with the FX exposure that creates.
- The **oversell slider** per plan ("at this ratio, expect N% performance complaints").
- The **grandfathering toggle**.
- **Usage-based billing** — higher ARPU, much higher ticket volume ("why is my bill $400 this month").
- **The "Unlimited" trap** — you may label a plan unlimited, conversion jumps, and then the abuse
  arrives and your terms-of-service fine print becomes a support and PR battleground.

**Three more mechanics it deserves:** **(a)** the live estimates should be **ranges with confidence**,
narrowing as you gain market data, so elasticity testing has something to narrow; **(b)** **a plan is a
contract with your future self** — changing it later triggers grandfathering, so plan design is a
**one-way door and should be marked as one**; **(c)** show the **support-tickets-per-account
projection as prominently as margin**, because that's the number that actually kills cheap plans.

**Variations and additions**

- **Product Packaging / Feature-Gating Matrix (a puzzle-buildable)** — which features live in which
  SKU tier. **Locking "sane defaults" behind tiers raises ARPU and rage**; bundling everything at one
  price simplifies the funnel and **caps your upside.** The matrix determines which segments convert,
  the ticket volume per tier, and the density of upsell triggers — three outputs from one grid, which
  is what makes it a puzzle rather than a form.

### Order Form / Storefront
The entry point of the client lane.

**Costs:** low opex. **Connects to:** every acquisition lane, the Provisioning Engine, the Payment
Gateway.
**Opens:** it's public — **carding bots test stolen cards against it**, and every fraudulent order costs
you a gateway fee.
**Upgrades:** one-page checkout (+conversion), price-transparency toggle (−signups, −refunds), currency
localization (+international conversion).

### Payment Gateway (primary + redundant)
Converts orders to cash. Upkeep is **a percentage of all revenue, forever** — the game should show this
as a permanently visible haircut on the revenue bar.

**How it works:** ~2.9% + $0.30. Upgrades: ACH/wire (cheap, slow, enterprise-only), PayPal-alike
(converts well, disputes are brutal), crypto (no chargebacks, no processor risk, high fraud
correlation, banking suspicion, price volatility, accounting headache), invoicing with terms
(enterprise-only, creates DSO).
**Opens:** chargeback ratio, **rolling reserve**, and **processor termination.**

**Redundancy is deeper than a second gateway (wave-2 correction):** a termination usually happens at
the **acquirer/underwriting** level, so a second gateway routing to the same acquirer is **theatre.**
Real redundancy is a **second acquiring bank, ideally under a second legal entity.**
**Four small, boring, high-ROI upgrades nobody thinks about:**
- **Interchange-plus vs blended pricing** — at volume, interchange-plus saves **30–60 bps**: a free
  margin upgrade.
- **Local acquiring for international cards** — auth rates jump **5–15 points**, pure recovered
  revenue.
- **Network tokenization** — raises auth rates and survives card reissues, reducing involuntary churn.
- **Second acquirer, second entity** — see the Entity & Ring-Fence Structure.

**Variations and additions**

- **The Payment Processor Account as its own object** — each transaction skims **~2.9%**, and your
  **chargeback ratio threatens the account itself.** High-risk processors (offshore, adult, crypto)
  charge **higher fees but do not close your account**, which turns "who will process for me" into a
  strategic purchase rather than a plumbing detail. Business infrastructure with teeth.

### Billing Platform / Billing Engine (WHMCS-alike)
Core dependency for *everything*: automates invoicing, provisioning, suspension, dunning.

**Opens:** **it holds every customer's billing data — the single juiciest breach target you own, and a
breach here is a legal/notification event, not an outage.** A bug that suspends paying customers
(catastrophic and 100% real). Payment-card compliance scope. And the structural one: **if billing is
down you're not losing uptime, you're losing money silently — a revenue outage with no technical
symptom.**

**Variations and additions — the four-level ladder**

**Level 1: the spreadsheet** (leaks cash, ~5% involuntary churn, an invoice-day crunch that eats a
hand) → **Level 2: WHMCS-class automation** (instant provisioning; **dunning emails recover roughly
40% of failed payments** — dunning as a revenue-*repair* tower) → **Level 3: real-time usage metering
and invoicing** → **Level 4: ERP with multi-currency and tax.** **Start it as a weak default that
everyone upgrades away from.**

- **You cannot bill what you cannot meter** — it connects to *every* service, and without it prepaid
  cash leaks through unpaid invoices: **DSO rises and cash starves despite revenue.**
- **Metered billing unlocks whole customer classes** — GPU, CDN and serverless economics are
  *impossible* without it, so gate those lines behind it.
- **Risk:** billing bugs are **mass overcharges**, which become chargeback storms and refund waves.
- **The single most load-bearing business buildable**, and the one players notice last.

### Metering & Rating Engine
**Billing's hard half, and the unglamorous machine that turns usage into invoices.**

**Gives:** usage-based revenue — overage, egress, GPU-hours, invocations, minutes, 95th-percentile
bandwidth, GB-months — **the highest-growth revenue type and impossible without it.**
**How it works:** Usage records, deduplication, late-arriving data, rating rules, proration, and the
**three-way reconciliation** between what you metered, what you provisioned, and what actually
happened.
**Costs:** significant build, ongoing accuracy maintenance.
**Opens:** the Metering Blackout threat; disputes; bill shock; **revenue leakage as an invisible,
permanent, discoverable drain** (typically **2–5% of revenue** in real companies) when you undercharge
silently; catastrophic trust events and refunds when you overcharge; and the discovery that **your
meter and your customer's meter disagree by 4% — they always do, and the customer's number is the one
they believe.**

### Revenue Assurance
A function whose entire job is **finding money you already earned.**

**Gives:** recovers **1–4% of MRR permanently**; reconciles the asset database, the provisioning system
and the billing system three ways.
**Costs:** one analyst's salary, forever.
**Opens:** nothing. **It is the closest thing to a free tower in the game and should be gated behind a
scar** — the first time you discover an unbilled service — **rather than behind money.**

### Dunning Engine
Retries failed cards on a schedule, sends pre-expiry notices, uses a card updater.

**How it works:** Recovers **30–70% of involuntary churn** — the largest single churn source. **The
cheapest-ROI tower in the game, and invisible until built.**
**Its upgrade ladder (wave-2):** naive retry → smart retry timing → decline-code handling → card
updater → backup payment method → pre-expiry outreach → in-app + email + SMS sequencing. **A ladder of
unglamorous improvements each worth real money.**
**⚔️ Required downsides (flagged as a Three-Column-Law violator):** **dunning fatigue** — retry too
aggressively and card networks penalise you, and customers who get five emails about a failed card
sometimes just cancel; a **false-positive class** where a legitimate temporary decline is treated as
churn and **an account is suspended in error — the most reputationally expensive mistake a billing
system can make**; and **upkeep** maintaining the retry schedule against changing processor rules.

### Fraud / Risk Screening
Scores signups with a tunable threshold slider.

**How it works:** *Strict* blocks fraud and ~4% of good customers; *loose* converts everything and
invites the carder ring. **A live, consequential dial rather than a binary upgrade** — and one that
lowers revenue on purpose and makes you more money.
**The second dimension (wave-2): make it per-SKU, not global.** The right threshold differs wildly by
product — a $3 shared account can't justify manual review; a $400 dedicated server can; **a GPU
reservation absolutely requires it.** A small change that makes the player think in product terms.
**The specific cheap screens, each a toggle with a stated false-positive cost:** BIN country vs IP
country mismatch · disposable-email domains · velocity from one IP or fingerprint · first payment
declined then immediately retried · **a signup at 4am local time with a rushed checkout.**

**Variations and additions**

- **The Fraud/Abuse Screening Console, itemised** — KYC at signup (AVS/CVV checks, velocity limits,
  device fingerprinting), reputation scoring, a **manual review queue**, an abuse-ticket workflow, and
  a takedown SOP.
- **The price is checkout friction: roughly 15% lower conversion** — the classic safety-versus-growth
  trade, on a slider, exactly as the real industry runs it.
- **False-positive declines anger legitimate whales** — "my $20k order was blocked" is the specific,
  nameable failure the dial should produce, not an abstract percentage.

### Quote & Contract Desk / CPQ
Required for enterprise.

**How it works:** Produces MSAs, SLAs, DPAs, BAAs and redlines, and enables net-30/60 terms. Unlocks
deals above a size threshold and the enterprise, regulated and colo lanes. Introduces **AR aging** —
revenue you've recognized but haven't collected.
**Costs:** an expensive lawyer retainer.
**Opens:** **your reps can quote below cost** (add an approval gate as an upgrade), and **signing bad
terms** — unlimited liability, 100% uptime SLAs, unassignable contracts that torch your valuation at
exit.

**Variations and additions**

- **Higher CPQ tiers quote faster and leak fewer margin-destroying errors** — the classic mispriced
  clause is a *tier* problem, not a person problem.
- **The paired margin dial (the Deal-Desk Discount Ladder)** — set how much off-list reps may give:
  **0%** (deals stall) → **10%** (conversion up, ASP erosion) → **"call me"** (you personally approve
  every whale). Later, an **automated approval matrix** raises throughput without consuming founder
  CPU, which is the real upgrade the ladder is climbing toward.

### Deal Desk / Discount Authority
The governor on the discounting spiral.

**Gives:** a per-role discount ceiling; anything deeper routes to you (costing executive attention).
Flags clause interactions (MFN, credit caps, non-standard SLAs) **before signature.**
**Costs:** slows every non-standard deal by days; **sales complains loudly and constantly.**
**Opens:** deals lost to slowness; a reputation with agents and partners as "hard to work with."

### Sales Compensation Plan (a tunable object, not a salary)
One of the most consequential dials in a real hosting company.

**How it works:** You set what sales is paid on — **bookings, MRR, TCV, gross margin, or collected
cash** — plus the accelerator structure and the clawback window. **Reps optimize exactly what you pay
them for**, and the game should show that within one level: pay on bookings and you get backlog you
can't install and deals with 18-month ramps; pay on collected cash and reps refuse hard deals; pay on
margin and they stop discounting **but also stop selling volume.**
**Costs:** commission, typically 6–12% of first-year value or 3–5% of MRC as a residual.
**Opens:** sandbagging at quarter end, deal-pulling-forward that empties next quarter, and the rep who
sells a customer you should have declined.

**Variations and additions**

- **Three archetypes, three failure modes** — **salary** (predictable, slow), **commission-only**
  (ravenous, churns, **sells anything** — see the salesman's-lie threat family), **salary + quota with
  clawbacks** on refunded deals. **Your comp model picks which failure mode you live with: idle
  grinders or reckless closers.**
- **The sales rep is a unit-*producing* tower** — each rep prospects leads that convert after a
  multi-week pipeline crawl, and **commission is charged at conversion**, which is cash-flow texture
  rather than a flat salary line.
- **Sales roles branch** — **inside-sales reps** work lead lists at the toll, **field AEs** escort
  whales through the gauntlet, **proposal writers** add RFP tug-of-war strength, and **solutions
  engineers** answer questionnaires and win technical buyers. Throughput scales with staff: an SLG
  wrinkle in a tower defense, where **early game is self-serve only and late game cannot close whales
  without people.**

### The Sales Floor
A room whose size gates how many prospects you can work at once.

**Visual:** visible headsets and **a gong that rings on a closed deal.** You can turn it off in settings
and nobody ever does.

### CRM Pipeline Tower
Leads enter as **physical units** and walk the stages.

**How it works:** Visitor → trial → opportunity → close, as a lane with gates. **The tower's level
sets auto-nurture speed**, upgrades route leads by segment, and **without it every lead is manual or
lost.**
**Gives:** it converts **personal founder relationships into company assets** — early game the founder
carries them, free and fragile (see bus factor) — enables **pipeline forecasting** (a readable
mini-map of future cash), and automates renewal nudges.
**Costs:** monthly SaaS fees **per seat** — a small, realistic, recurring sting that scales with the
sales floor rather than with revenue.
**Why it belongs:** **the pipeline *is* your inbound lane for revenue units**, which makes it the
business half's answer to the load balancer.
**Interacts with:** the Sales Floor, Customer Health Score, the Renewal Calendar, Account Management.

### Win/Loss Interview Program
A research building for the sales half.

**Gives:** a third party interviews prospects who chose someone else, producing a rolling list of *real*
loss reasons — **almost never what your sales team says it is.** Feeds the roadmap and the rate card.
**Costs:** small and recurring.
**Opens:** uncomfortable truths about your own team, one of which is a named staff member's win rate.

### Customer Advisory Board / Reference Program
Turning customers into sales infrastructure.

**Gives:** a maintained roster of customers who will take a reference call — **enterprise deals stall
without references.** 6–10 customers who meet quarterly, get early access, and tell you the truth. Also
generates roadmap signal and enormous retention (**people don't churn from a company they advise**) and
substantially improves your roadmap hit-rate.
**Costs:** an annual dinner, a dedicated CSM, some product control (they will ask for things), and
honouring their roadmap asks at least sometimes.
**Opens:** **reference fatigue** (the same three customers get called constantly and start declining);
the day a reference customer gives an honest, damaging answer on a call *you* arranged; and — **it's
also a threat — they talk to each other, and now your most demanding customers are organised.**

### Tender Desk / Bid Bot
Periodic RFP events where you compose a bid from your **actual** certs and uptime history.

**How it works:** Government and enterprise tenders arrive on a schedule. You assemble a bid out of
things you really own — compliance badges, measured uptime, references, SLA tier — and **win a whale
contract or lose with a marketing tidbit as the consolation.**
**Why it belongs:** it **converts whale paperwork into an *active* commerce game** instead of a
passive attraction roll, and it makes every boring certification purchase visibly cash out.
**Interacts with:** the Compliance Vault, the Trust Center, the Reference Program, the Backlog Board.
**Hosting types:** regulated, government, enterprise.

### Analyst-Relations Briefing Room
Pay the trade analysts for briefings; a quarterly quadrant plot shifts your dot.

**How it works:** High cost, high leverage, and **occasionally humiliating** — a bad placement
persists in the HUD until the next quarter. **The G2/Gartner twin:** programs that earn review-site
badges and, late-game, quadrant placements. **Enterprise convoy gates check the badge wall**, and the
cost is marketing spend *plus real product requirements.*
**Why it belongs:** it is **the enterprise segment's SEO** — satire-grade realism, and the only
attraction tower whose output is someone else's opinion published on a chart.
**Interacts with:** the Trust Badge Row, the Brand Positioning Dial, the Reference Program.

### Customer Health Score Engine
The retention radar.

**How it works:** Combines usage trend, ticket sentiment, login recency, invoice payment behaviour,
contract-end proximity, executive-contact turnover and escalation history into **one per-account
number.** Drives the Grudge Meter *predictively* — flagging accounts **60–90 days before they signal
churn, which is the only window in which a save is cheap.**
**Opens:** false positives (a CSM spends time on a happy account) and **the temptation to game the
score rather than fix the account.**

### The Trust Center / Security Portal
**The highest-leverage document in B2B hosting** — it answers the questionnaire before it's asked.

**Gives:** pre-answered security questionnaires, a SOC 2 report under NDA-click, a subprocessor list,
architecture overview, uptime history, pen-test summary, DPA template, insurance certificates.
**Measurably shortens enterprise sales cycles** and largely eliminates the Security Questionnaire
Treadmill.
**Costs:** build plus quarterly maintenance.
**Opens:** **you've now published your control set, which is a map for an attacker**; and anything on it
that goes stale is **a lie with your logo on it.**

### The Upsell Shelf
A physical shelf of add-on products placed next to the checkout path.

**How it works — each with its real attach rate, so "improve attach rate" has a number to move:**
- **Managed backups** — huge margin, huge liability. **Attach 25–40%: the highest-attach upsell in
  hosting.**
- **Dedicated IP** — pure margin on an asset you own. Attach 8–15%.
- **SSL certificates** — a dying margin post-Let's-Encrypt (attach 3–8% and falling), but enterprise
  still buys EV/OV.
- **Priority support SLA** — pure margin *if* you can staff it. Attach 5–12%.
- **Malware scanning/cleanup** — great margin, borderline fear-selling, a reputation risk if oversold.
  Attach 2–5%.
- **Professional services retainer** — attach 1–3% **but at 5–20× the ARPU**; turns your Support
  Vampire into your best customer.
- **Site migration service** — converts your onboarding cost into a revenue line.
- **Email hosting** — low margin, high support, extremely sticky.
- **Compliance reporting packs** — sell the audit artifacts you already generate.
- **Domain registration** — **the most strategically important item on the shelf and the worst-margin
  one.** 5–15% margin, but **a customer whose domain is with you churns roughly a third as often.**
**The shelf's lesson:** ***the item you make no money on is the one that keeps you alive.***

### Data Gravity Builds
Object storage, managed databases, backup vaults — **each one raises a customer's inertia stat.**

**How it works:** Every gigabyte of the customer's data that lives with you **reduces their churn
probability**, independently of price or satisfaction. It is a retention mechanic bought with storage
capex rather than with support headcount.
**The quiet lesson:** ***you don't out-market churn, you out-anchor it.***
**⚔️ Its mirror:** the Retrieval / Egress Policy Desk decides whether that anchor reads as
*convenience* or as a *hostage situation* — same mechanic, two reputations.
**Interacts with:** Object Storage (§4.3), Backup-as-an-Add-on (§4.12), the Egress Fees toggle,
domain registration's retention insight on the Upsell Shelf.

### Self-Serve Portal / Customer Control Panel
Every feature you add removes tickets.

**How it works:** Password reset, DNS editing, backup restore, plan upgrade, invoice download. **Each
one is a support-cost-reduction tower disguised as a feature.** For colo, a customer portal with power
graphs is both a sales feature and a ticket deflector.
**Opens:** **it's an authenticated public app with control over infrastructure — the single juiciest
target you own.**

**Variations and additions**

- **The developer-era gate tower.** A panel plus an API **moves activation from human-served to
  instant** and unlocks the VPS and PaaS funnels *entirely* — **no panel, no devs.** cPanel-class
  licensing costs per account (a real line item) but slashes support load: **you cannot build an MSP
  without a panel.**
- **The twist:** the panel is now **your most-attacked public face** — credential stuffing aims here
  first.
- **Panel quality sets the dev-respect meter** — API parity, a CLI, a Terraform provider — and each
  checkout upgrade raises conversion: ugly one-pager → comparison tables → self-serve instant signup
  → account portal with SSO. **A page-speed upgrade literally shortens the customer path.**
- **The most under-appreciated "tower" in the game.**

### API / Terraform Provider
Attracts developer customers and enables automation-heavy usage.

**Opens:** **a customer's runaway script provisions 400 servers at 3am** — and either you eat the cost
or you bill them and they dispute it.

### Marketplace / App Store / Add-on Catalog
Partner apps sold through you for a revenue share. Low effort, pure margin, adds stickiness.

**Opens:** third-party supply-chain risk — **a compromised marketplace plugin is your breach**, and a
vendor in your catalog getting breached puts **your brand on the invoice.**

### Affiliate Portal / Partner Program
Recruit affiliates, set CPA, run white-label reseller tiers with margin shares and co-op marketing
funds. **Each partner is a multiplier on a lane.**

**Opens:** fraud (self-referrals, cookie stuffing) — needs a fraud sub-module or you'll pay commissions
on self-referred trash — poor customer quality, and affiliates who can be **bought away by a
competitor.**

**Variations and additions — the channel program with a policy tree**

- **Official reseller tiers: Bronze / Silver / Gold** — discounts, **MDF marketing funds**, **deal
  registration** (which prevents channel civil war), **certification training** (which protects your
  support queue from bad resellers), and the annual **partner summit** that renews the cohort.
- **A reseller is one object that streams customers AND support tickets** — thinner margin, **CAC
  near zero**, diluted support quality, and **their customers blame YOU.**
- **Marketplace listings are the modern twin** — cloud and app-store ecosystems take **~3% revenue
  share** for instant enterprise procurement plumbing: one-click PO, expensed through existing cloud
  budgets, **unlocking customers who weren't *allowed* to buy from you.** With **platform risk**: a
  policy change can delist you overnight.
- **The classic "second act" of a host's business.**

### Reseller / White-Label Portal
Sells your capacity through partners.

**Opens:** **you lose end-user visibility, inherit their abuse, and can be disintermediated.**

### Partner Portal with Deal Registration
The machinery that makes a channel work.

**Gives:** partners register a deal and get protected margin for 90 days; **you see pipeline you'd
otherwise be blind to.**
**Costs:** build, plus a channel manager.
**Opens:** **channel conflict** — your direct sales team finds the same prospect, and now you must
decide who gets it. **Deciding against the partner once costs you the partner forever.** A genuinely
agonizing recurring decision, and it is free content.

### Partner Certification Program
Making your resellers competent.

**How it works:** Train and certify partners; certified partners generate **fewer escalations and sell
more accurately.** Costs a training function; returns support-cost reduction and channel loyalty. **The
counter-move to "resellers blame you for everything."**

### Multi-Brand Storefronts
Run N brands on one infrastructure.

**Gives:** segment-specific positioning without repricing the core; **a fighter brand to absorb price
wars**; an acquired brand you keep alive so its customers don't churn.
**Costs:** duplicated marketing, duplicated support queues, duplicated status pages, and a real risk of
confusing your own staff.
**Opens:** **the linkage risk** — if customers discover the brands are the same company on the same
hardware, the premium brand's trust takes a hit, and the budget brand's outages leak onto the premium
brand's reputation through anything customer-visible they share.

### The Brand Building
A literal structure whose height is your Reputation.

**How it works:** Raises conversion on every lane simultaneously. Built slowly by shipping,
communicating, and not lying.

### Content Engine / SEO Rig
Writers and technical SEO with a **6-month lag and a permanent tap.**

### Ad Console
A real-time budget dial.

**How it works:** Turning it off is **instant cash relief and instant growth stall.**
**Opens:** CAC inflation as you scale spend, and demand you cannot fulfil.

### Marketing Beacon / The Channel Portfolio
Not a tower — **a portfolio**, and the diversification is the lesson.

**How it works:** The marketing beacon pulls customer flow by widening the spawn ring and **bending
customer paths toward your door** — and it **attracts scrapers and bots as bycatch**, so it *also*
feeds the threat wave. An explicit attract-threats tradeoff. But a single static beacon understates
the reality the rest of the game gets right, so model the channels separately:
- **Organic / SEO towers decay** — core-update risk is a recurring event, not a one-off.
- **Paid search is an auction** whose CPC rivals bid up: **it rents its own existence.**
- **Events and conferences are bursty and segment-gated** — a booth is a temporary attraction burst
  *and* a competitor-FUD magnet.
- **Owned channels are drought-proof** — email lists to your existing base, referrals.
- **Affiliates are rev-share with reviewers** — cheap, roughly **20% of industry CAC** — but
  affiliates sometimes spam on your behalf and **the blame is yours.**
- **Community deflects AND acquires**, which is why it is the best-value channel nobody staffs.
**The Marketing Department as a buildable:** it generates a passive trickle of visitors and banks a
slowly-filling **"campaign" resource**; the Paid Ad Traffic Spike is the *deliberate spend* of that
banked resource. **One build-bank-spend system, not two unrelated mechanics.**
**Marketing automation:** drip emails and lifecycle nudges (activation boosters, winback campaigns,
renewal reminders that boost invoice payment). Cheap, with a slight **"spamminess" meter** risk —
your own emails getting you Spamhaus-adjacent is the irony the mail branch deserves.
**The Open-Source Contribution Program:** slowly builds Reputation and feeds the Community Forum
unlock (§6), **at the cost of publishing infrastructure details that slightly raise sophisticated-
attacker visibility.**
**⚔️ The backlash:** over-marketing **spikes expectation** — customers arrive with *tighter* patience
because "the ad promised" — so **attraction has a quality bar, not just a quantity dial.**
**Interacts with:** the Brand Building, the Price Sign, §4.9's Content Engine, §3's scraper family.

### Knowledge Base / Docs
Deflects tickets, feeds SEO, improves onboarding. **The triple-purpose building**, and the
prerequisite the AI Support Agent depends on.

**Opens:** **stale docs create wrong-expectation tickets** — worse than no docs, because now the
customer is confidently wrong and cites you.

**Variations and additions**

- **The deflection trio, with a shared tension** — **live chat** raises conversion at checkout (the
  tollbooth) but is the **priciest ticket channel**; the **knowledge base** is cheap and evergreen;
  **video tutorials** are strong and **rot fast.** Tune the mix per segment.
- **Docs are a dual tower** — they deflect tickets **and compound SEO inbound**, because **devs read
  docs *before* buying: docs ARE marketing.**
- **Decay is the honest cost** — every new feature ships an outdated-docs bump until someone writes
  it, and **docs without a maintenance budget spawn *wrong*-answer tickets, which are worse than
  none.** "Docs as a tower" deserves an **upkeep flame** to be real.
- **The ticket system underneath it** — queue throughput = raw staff × helpdesk tier, with triage
  routing, SLA clocks, macros and escalation paths.
- **Support / docs / community are passive churn reducers that also *self-heal customers*** —
  customers who can fix themselves stay.

### Social / Community Desk
Monitors mentions, responds publicly.

**How it works:** Converts angry visitors before they reach the review sites. Staffed, so it costs
salary.

### PR / Comms Desk
**Halves reputation damage from incidents — but only if built *before* the incident.**

**How it works:** Pre-drafted holding statements, a media contact list, a relationship with two trade
reporters, and a rehearsed spokesperson. Bought during a crisis it does almost nothing; bought in a
quiet quarter it is the difference between "host suffers outage" and "host suffers outage, explains it
well." Feeds the Status Page's tone choice and the postmortem's public write-up.
**Opens:** a comms team that wants to say less than the engineers want to say, which is its own
recurring internal argument — and a spokesperson who promises a fix time.

### Reputation Laundering Office
Slowly converts marketing spend into reputation *repair.*

**How it works:** It **hides old incident headlines from the spawn ring's memory**, shortening the
Expectation Ratchet's reach. A morally grey counter-chit to the Review-Bomber economy — and
**regulated and offshore levels raise its price**, which is the game saying something without saying
it.
**Interacts with:** the PR/Comms Desk (this is its cynical upgrade), the Status Page's honesty fork,
§3's reputation threats.

### The Lobbying Office
Build influence, not defenses.

**How it works:** A slow, expensive tower with **campaign-wide effects**: reduce seizure severity
offshore, soften an audit's checkpoint list, slow the "browser root store politics" events, and **get
your jurisdiction reclassified** — legalising a market you already serve, sold as a policy win.
**Opens:** every action moves a public **"industry capture" meter.** Max it and **the game turns you
into the villain of a hacktivist campaign arc** — your own PMUD level.
**Why it belongs:** it is **morally radioactive by design**, and it is the only tower whose upgrade
path is the game's own opinion of you.
**Interacts with:** §4.9 compliance, §3's regulatory and hacktivist families, the Brand Building.

### Case Study Factory
Turns happy customers into sales assets.

**How it works:** Requires the customer's permission, which requires them to **actually be happy.**

**Variations and additions**

- **The Case-Study Publisher** — it **consumes a happy customer's consent** to produce a *compounding*
  attraction tower that **decays** and must be refreshed by new wins. Unlike a generic marketing
  beacon, **it targets one segment class: the hospital story sells hospitals.**

### Trust Badge Row
Uptime guarantee badge, "since 2009" badge, review-score widget, security seals, compliance logos.

**How it works:** Each is a tiny permanent conversion bump — **and each is a liability you must live up
to.** Advertising 99.99% and delivering 99.5% is where SLA credits come from.

### Startup-Credits Program
Burn credits now to seed tomorrow's whales.

**How it works:** Real money out today — GPU and cloud credits handed to startups — tracked as
**cohorts that *may* graduate into enterprise units.** The payoff lands **10+ waves later.**
**Why it belongs:** it is a **genuine long-horizon investment play** the rest of the game lacks: every
other purchase pays back inside a level, and this one deliberately does not.
**Opens:** a cohort that never graduates is pure loss, and a cohort that graduates **to a
competitor** is worse.
**Interacts with:** the Channel Program, Case Studies, §6's growth scoring.

### Free-Tool Lead Magnets
Ship public tools: a WHOIS lookup, a speed test, an uptime monitor, an "email verifier."

**Gives:** compute cost in exchange for **high-intent traffic that converts through cross-promo
banners.** Charming, cheap, and real — **half the industry grew on free tools.**
**How it works:** **each tool gates a segment** — DNS tools feed the registrar upsell, a speed test
feeds the CDN — so the choice of tool is a choice of customer.
**Opens:** they are public, unauthenticated, compute-consuming endpoints with your logo on them: a
free abuse target and a free reputation liability.
**Interacts with:** the Channel Portfolio, the Knowledge Base's SEO, §3's scraper and abuse families.

---
### Ticketing / Helpdesk System
Turns chaotic customer anger into a manageable queue with an SLA timer. **Required before support staff
can scale at all.**

### Live Chat
The same building with opposite economics depending on placement.

**How it works:** **Placed on the *sales* path it's a conversion tower; placed on the *support* path
it's a cost centre.** Lovely design.
**The staffing economics that make it a real decision (wave-2):** a pre-sales chat **answered in under
30 seconds converts at roughly 3×**; an agent handles **3–5 concurrent chats vs 1 phone call**; and
**chat coverage gaps are worse than no chat** — a "we're offline" widget reads as abandonment.

### Phone Support
The single most expensive support channel and **the single biggest trust signal for small-business
customers.** A real strategic fork.

### Follow-the-Sun NOC
Hire a night shift (expensive) or outsource to a 24/7 vendor (cheaper, lower quality, occasionally
makes things worse).

**How it works:** Detects problems before customers do — **converts "churn events" into "credits you
never had to give."**
**Opens:** alert fatigue, whose upgrade path is about **tuning monitors, not adding them.**

### Ticket Router / Triage AI
Reduces cost per ticket; **occasionally misroutes a critical one.**

### AI Support Agent
A modern buildable with a real tradeoff.

**Gives:** **30–50% ticket deflection on tier-1 volume** at roughly a tenth of human cost per ticket;
24/7 first response, which is a real SLA improvement.
**Costs:** a per-resolution fee, plus the knowledge-base investment it depends on — **it is only as good
as your docs, so it retroactively pays for the KB.**
**Opens:** the AI Agent Incident (it confidently invents a policy); a CSAT drop among customers who
wanted a human; and — the subtle one — **it hides signal, because deflected tickets never reach the
humans who would have noticed a pattern.**

**Variations and additions**

- **Chatbot versus humans, as a dial** — a chatbot deflects low-severity tickets **infinitely** but
  **infuriates whales**: expect a "chatbot revolt" event, and automation overreach tanking NPS.
  Humans convert goodwill — **and they unionise.**

### Onboarding / Migrations Team
Converts acquisition into retention.

**How it works:** Directly increases the probability that a new customer **survives to month 3.** Charge
enterprise for it; give it free to win SMB.

### Account Management / Renewals Desk
Works the renewal calendar.

**How it works:** Converts monthly to annual, upsells at renewal, negotiates enterprise increases.

### Collections Desk
Works AR aging, negotiates payment plans, decides suspension timing.

**The real escalation ladder (wave-2 expansion), which is genuinely good gameplay:** reminder → dunning
→ phone → payment plan → service suspension → termination → **agency** (25–40% fee, relationship dead)
→ **legal** (uneconomic below roughly $25k) → **write-off.**
**The counterintuitive core rule:** **suspending a large delinquent customer usually guarantees you'll
never be paid**, so the right move is often to *keep serving them* on a payment plan.
**The data-hostage dilemma:** do you give a non-paying customer their data back? **Yes, usually** —
because the alternative is a viral story and possibly a lawsuit, and because **a data-retrieval fee is
a legitimate line item.**
**Opens:** aggressive collections generate reputation events.

### Collections Agency Contract / Factoring Facility
Two ways to turn receivables into cash — **and the game should draw the distinction, because it
teaches that not all fast money is predatory.**

**Collections agency:** they take 25–40% and **permanently burn the relationship.** Correct for
write-off-bound accounts, wrong for anyone you might keep.
**Factoring:** sell your invoices at **1–3% per 30 days** for immediate cash. Expensive, available, and
**not a trap the way a merchant cash advance is.**

**Variations and additions**

- **Three collections tiers** — **letters / calls / small claims.** Each converts bad-debt wraiths into
  partial cash for a fee **and a burned relationship.** The tower that *targets your own customers* —
  a unique moral flavour in a category otherwise aimed outward.

### Finance Buildables (the working-capital arsenal)
Four ways to solve the same silent killer: **the timing mismatch between paying power bills and
collecting MRR.**

**The roster:**
- **Business line of credit** — interest against runway; the cheapest bridge and the easiest to
  over-draw.
- **Invoice factoring** — sell enterprise net-60 receivables for cash now at a **3–5% discount**, so
  those logos stop strangling your growth.
- **Hardware leases / reseller net-30 terms** — capex smoothed into opex; you either own the residual
  or hand it back.
- **A VC term sheet** — cash for equity, plus **board seats and growth demands.** Staged rounds sell
  recurring ownership: model **dilution against the end-level exit-multiple score**, plus liquidation
  preference and down-round mechanics. A big war chest and a **permanently lower ceiling.**
**Why it belongs:** **the cash-flow puzzle deserves as much design as the DDoS puzzle** — and this is
the shelf it gets bought from.
**Interacts with:** Accounting / FP&A, The Board / Investor Relations, the Backlog Board, §6 working
capital, §7 scoring.

### The Retrieval / Egress Policy Desk
A tiny business object with outsized reputational weight: **what you charge a departing customer to get
their own data out.**

**Gives:** a revenue line (data gravity) and a churn-friction mechanic.
**Opens:** **the single most viral-post-generating decision available to a hosting company.**

**Variations and additions**

- **Egress Fees — the dark tower.** Exit tolls on customer data: **retention up** (they literally
  cannot leave cheaply), attraction down slightly, **regulator heat up**, and a permanent Reddit
  cloud over your HQ.
- **The honest variant: zero egress** — a short churn hit, then a **compounding brand buff.**
- **The game's most honest moral choice, in one toggle** — and the one whose consequences arrive on
  the longest delay.

### QA / Change-Management Board / Internal Audit
Slows deploys; prevents the Bad Deploy threat; **reduces self-inflicted outages, which are the #1 real
cause.**

**How it works:** **Explicitly a velocity-vs-stability dial the player sets.** In regulated hosting it's
mandatory and slows *every* action while reducing change-failure rate — a genuine tradeoff object.

### Compliance Vault / Compliance Office
Holds certification readiness and evidence; evidence collection, policy maintenance, audit liaison.

**Costs:** expensive annual upkeep (audits, auditors, evidence collection), continuous and unglamorous.
**How it works:** Unlocks entire customer segments. **Expiring = cliff churn.** Bundles of mandated
builds: encryption at rest, audit logging, access review, change control. **Compliance as a tech branch
you buy access to a customer tier with.**
**The sales-side payoff, made explicit (wave-2):** it **shortens enterprise sales cycles** (a SOC 2
report replaces weeks of security review), **raises win rate in competitive deals**, **allows premium
pricing** (compliant capacity commands **20–40% over commodity**), and **reduces the questionnaire
tax.**
**Opens:** it **slows down every other department** — a real drag on your build speed worth modelling —
and certification creates an ongoing **evidence-collection labour cost that is invisible in year one
and substantial by year three.**

### The Subprocessor Register and DPA Desk
The compliance paperwork of using other companies.

**How it works:** Every vendor that touches customer data must be listed, contracted, assessed and
notified about. **Adding a new SaaS tool becomes a small compliance transaction; changing one requires
notifying customers.** **Makes vendor adoption have a cost beyond price** — accurate, and a useful brake
on the player's shopping.

### Legal Retainer
Reviews contracts, handles DMCA edge cases, responds to subpoenas and law-enforcement requests, defends
the lawsuit.

**How it works:** Without it, every legal event costs **3× and takes 5× longer. Converts certain
incidents from catastrophic to merely expensive.** Handles the lawsuit branch of the angry-customer
escalation ladder.

**Variations and additions**

- **The industry's actual shield: DMCA safe harbour.** Designate the agent, follow notice-and-
  takedown, and **your customers' sins don't sink you**; skip it, and **a single pirate tenant is a
  liability boss fight** (shared, CDN, file hosting, streaming, offshore). The lawyer tower should
  **cast this as a permanent ward, priced monthly.**
- **Contract engineering: your ToS is buildable content.** AUP clauses, liability caps (credit-milkers
  hate them), SLA credit formulas, auto-renewal terms (compliance-gated per region), arbitration
  clauses — **each clause is a defensive wall against a specific threat family.** Draft SLAs you can
  survive: carve-outs, maintenance windows, force majeure. See the Contract Clause Library below for
  the full tree.
- **Upgrades:** counsel retainer → in-house GC → **"we actually enforce it" credibility.**
- **Compliance certifications as timed projects** — SOC 2 / ISO / HIPAA / FedRAMP each produce a
  **badge object in the lobby** that unlocks RFP convoys and shrinks insurance premiums. **And they
  rot:** each needs annual renewal, and the auditor returns.
- **A "can we?" gate on some defensive actions in regulated levels** — the first building that can
  tell you *no*.

### Cyber-Insurance Policy
Pay a premium; cap the downside of a breach. Converts catastrophic cash events into deductibles plus
premium.

**How it works:** Has a deductible and a set of exclusions that will absolutely bite the player who
didn't read them. Claims raise your future premium. **Doesn't reduce reputation damage.** **Should feel
boring and be correct**, and it's a *second* insurance system layered on the in-fiction insurance
(backups, redundancy) — players will enjoy the recursion.
**The exclusions that actually bite:** **no MFA enforced** · **nation-state attribution** (the big one)
· **failure to patch a known vulnerability within the policy's stated window** · **unencrypted data at
rest** · **acts of your own employees** · "acts of war," which matters enormously after a
nation-state event.
**Make it teach security (wave-2):** **underwriting is a questionnaire**, so getting the policy
requires *proving* controls — MFA everywhere including admin and VPN, EDR, immutable or offline
backups, **a tested restore**, a written IR plan, no EOL OS in scope, privileged access management.
Model it as **a recurring renewal gate.** And the consequence chain that makes it motivating:
**enterprise contracts require you to carry cover → losing insurability loses customers.** That
converts security hygiene from a cost centre into **a sales prerequisite.**

### Insurance Broker (the wider policy set)
Cyber liability, E&O, business interruption, property.

**How it works:** The broker is the unit; the policies are the slots. Claims raise premiums; exclusions
surprise you.

**Variations and additions — one premium, three realities**

- **Cyber liability vs E&O vs D&O cover *different scripted events*** — ransomware response / you
  caused a customer's loss / the hardware floater. Buying "insurance" is not one purchase.
- **Every policy carries a retention (deductible) you eat per incident**, and **premiums re-rate on
  claims** — which means a **no-claims discount is a money-repair loop** you can play toward.
- **Force-majeure exclusions mean the hurricane pays but your own unpatched server does not**, and one
  egregious negligence (unpatched, no MFA) **voids cyber cover entirely.**
- **Offshore and grey types cannot buy it at all** — a funny refusal modal, and a real strategic wall.
- **The "boring adult" tower**: a genuinely correct late-game hedge that most players will not buy
  until they have been burned once.

### E&O / SLA Reserve
A cash bucket you voluntarily set aside for SLA credits.

**How it works:** Boring, prudent, and **the thing that keeps a bad month from becoming a death
spiral.**

### Accounting / FP&A / Finance
Unlocks the *forecast view*: projected cash 90 days out, the cash-flow projection HUD, cost-to-serve,
and access to financing (lenders require clean books).

**How it works:** Without it you are literally flying blind on the most important number. **A tower that
buys you information**, which is a wonderful thing for a strategy game to sell you — and without it the
player plays blind early, which is a great teaching device.
**Promote it to a gate (wave-2):** without a clean monthly close you **cannot get bank debt, cannot
pass diligence, cannot compute cost-to-serve, and cannot know whether a line of business is
profitable.** Make it a **prerequisite for several other business unlocks** rather than an optional
information purchase — which makes the least glamorous building in the game structurally load-bearing,
exactly as monitoring is on the ops side. ***Finance is observability for money***, and framing it that
way makes engineers understand it instantly.

### Tax Engine / Nexus Monitor
Boring, mandatory, and a great late unlock.

**Gives:** correct per-jurisdiction tax on every invoice, and a **nexus dashboard that warns *before*
you cross a threshold.**
**Costs:** a per-transaction fee and an accountant.
**Opens:** nothing — **but its *absence* opens the Nexus Letter.**

### Entity & Ring-Fence Structure
**Corporate structure as a defensive buildable — a genuinely novel tower.**

**Gives:** separate legal entities per risk class (the bulletproof line, the crypto-paying line, the
regulated line, the building). **Contains a payment-processor termination, a lawsuit, a regulatory
action, or a debanking to one entity instead of all of them.** Enables per-entity banking, per-entity
insurance, and **selling one line without selling the company.**
**Costs:** legal setup, ongoing accounting complexity, intercompany agreements, and you must actually
*respect* the separation (shared bank accounts pierce it).
**Opens:** transfer-pricing complexity, an auditor's favourite question, and **the temptation to
comingle when cash is tight — which voids the whole protection at the worst possible moment.**

### Transfer Pricing / Internal Chargeback
For multi-line play.

**How it works:** Your colo line "sells" space and power to your hosting line at an internal rate. Set
it high and the hosting line looks unprofitable while colo looks great; set it low and vice versa.
**Whichever number you pick, you'll make a strategic decision based on it** — and the game can let you
discover that **you divested a line that was actually profitable, because your internal rate was
wrong.** A wonderfully quiet trap.

### Rack Sublet Desk
When you are the landlord: rent spare racks to other hosts.

**Gives:** a **pure income tower** — stable MRR with **no customers of your own to serve.**
**Opens:** your new tenants run *their* threat sets on your floor. **Shared-tenancy risk at facility
scale**, abuse complaints routed to *your* upstream, and **you cannot patch their boxes.** The colo
experience, inverted onto the player.
**Interacts with:** the Abuse Desk, the Upstream Abuse Relationship, Cabinet/Cage/Private Suite,
§4.7's facility capacity.
**Hosting types:** DC-scale, late campaign.

### The Board / Investor Relations
If you took money, a recurring obligation that grants capital and imposes growth targets.

**How it works:** Missing targets triggers pressure events: cut costs, raise prices, fire people.
**If you took debt instead of equity, the mechanic is different and better: covenants.** Maintain a
minimum cash balance, a maximum leverage ratio, a minimum debt-service coverage — **measured quarterly,
and breaching one gives the lender rights** (repricing, acceleration, control). **A number you must
keep above a line for reasons entirely outside the game's action economy** is excellent late-game
pressure, and it's how most real hosting companies with hardware debt actually live.

### Procurement Desk
Negotiates vendor contracts, manages lead times, gets volume discounts.

**How it works:** Turns a 400% price hike into a 90% one, gets better transit pricing at volume, and
finds the hardware deal. Pays for itself at scale.
**The specific levers (wave-2):** multi-year commits for price protection · **caps on annual increases
written into the contract — the single most valuable procurement win and the cheapest to ask for** ·
quarter-end timing · volume tiers · **the "we have a migration plan" leverage** · and the supply-side
credit relationship: net terms, credit limits, and the credit-hold threat.

### Vendor Exit Plans
Insurance against your own suppliers.

**How it works:** For each critical vendor, a documented and **tested** plan for leaving them. Costs
staff time, produces nothing, and converts an Acqui-Loss or a Vendor Squeeze from a crisis into an
inconvenience. Another entry in the "boring virtue" family the game is good at.

### Vendor Diversity
Deliberately using two suppliers.

**How it works:** Costs efficiency, buys resilience. The purchasing equivalent of A+B feeds.

### Hardware Support Tier
A dial nobody models: **what warranty you buy.**

**How it works:** **Next-business-day parts** (cheap) vs **4-hour onsite** (expensive) vs
**self-maintain with a spares pool** (cheapest at scale, requires inventory cash and a tech). Directly
sets MTTR for hardware failures and therefore **your achievable SLA tier.** **The correct answer changes
with fleet size** — at 20 servers you buy 4-hour, at 2,000 you self-maintain — which is a lovely
progression beat. **Letting warranties lapse to save money is a classic and very tempting trap.**

### OEM Capacity Reservation
The supply-side commit.

**Gives:** guaranteed allocation of scarce hardware (GPUs, high-density chassis) at a negotiated price,
12–18 months forward.
**Costs:** a deposit and a commitment to buy **whether or not you have customers.**
**Opens:** **you are now long on hardware in a market that may soften** — the mirror of the customer
take-or-pay, pointed at you.

### ITAD Contract + Certificate of Destruction
The end of the hardware lifecycle, as a revenue line and a liability.

**Gives:** residual value on retired gear (**10–20% of original at year 4**, more for GPUs in a
shortage), and a certificate of destruction you can hand to a compliance customer.
**Costs:** a vendor relationship and logistics.
**Opens:** **a data-breach liability with your name on it if the vendor doesn't actually wipe the
drives** — a real, recurring industry scandal and a perfect delayed-consequence threat.
**Interacts with:** the Decommission Animation's pallet pile (§4.1).

### Energy Hedge / PPA / Demand-Charge Manager
**Power as a financial instrument, not just an operating cost.**

**Gives:** fixed-price power for N months (margin certainty); a renewable PPA (marketing plus price
stability, and a sales asset for ESG-conscious enterprise tenants); **peak-shaving automation that
manages the demand ratchet**; and demand-response market participation that pays you for standing by.
**Costs:** commitment; **the hedge can go underwater**; peak-shaving hardware.
**Opens:** the Energy Hedge Underwater threat, and the realization that **your customer contracts need
a power pass-through clause or you carry all the risk.**

### Reserved Capacity Contract / Transit Commit
Commit to volume for a discount — **a bet on your own growth.**

**How it works:** Trades price for certainty. Improves your forecasting, which improves your capacity
planning, which improves your margin. **You owe the commit whether you use it or not.**

**Variations and additions**

- **The Reserved-Capacity Commitment Console (customer side)** — customers buy **1- or 3-year
  commits** at a discount; **your capacity must be held against the promise (an idle cost)**, but the
  revenue is predictable and **churn is contractually welded.**
- **The commitment book is a live risk board: take-or-pay in, take-or-pay out** — you are exposed on
  both sides of the same instrument.
  **Hosting types:** GPU, colo, cloud.

### The Yield Manager
Airline revenue management for infrastructure.

**How it works:** You have idle capacity in every line, always. A **yield slider** decides how much to
release at a discount (spot GPU, off-peak render, short-term colo, burstable VPS, "last cabinet"
promos) versus holding it for full-price demand that may not arrive. **Release too much and you
cannibalize your own reserved pricing — your existing customers discover the spot price and demand
it.** Release too little and you strand capacity.
**Hosting types:** GPU/HPC most sharply, but colo, transit and even shared hosting have versions.
**⚔️ Tension:** directly opposed to the Capacity Reservation (§4.1). Both are correct; the player draws
the line.

### The Backlog Board
Signed-but-not-installed, as a physical queue.

**How it works:** Orders sit on a board with: required hardware, required power, required space,
required hands, a committed install date, and **a penalty clock.** Installed orders move to the revenue
ledger. **Two numbers on the HUD — Signed MRR and Billing MRR — and the gap between them is the level's
tension.**

### The Comp-Account Auditor
Tiny building, real money.

**How it works:** Audits free, internal, employee, partner, demo, and "we said we'd comp this for a
month in 2019" accounts — **typically 3–8% of a mature host's fleet capacity.** Reclaiming it is free
capacity; **reclaiming it *badly* generates a viral thread from a beloved open-source project you were
sponsoring without realizing.**

### The Renewal Calendar
Knowing what is coming up, **on both sides.**

**How it works:** One object showing every contract renewing in the next 12 months — **customer
contracts** (revenue at risk, price-increase opportunity) and **vendor contracts** (cost at risk,
renegotiation opportunity) **on the same timeline.** Without it, renewals ambush you. With it, they
become a schedulable workstream. Trivially cheap, and it **converts a whole class of surprise events
into planned ones — which is what growing up as an operator actually feels like.**

### Localisation and Regional Presence
Being genuinely local.

**How it works:** Not just a PoP: **local-language support, local billing currency and payment methods,
local invoicing and tax compliance, a local phone number, local business hours.** Each is a separate
purchase and each unlocks a fraction of a regional market. **Reveals that "expanding to a region" is
eight decisions, not one.**

### Bug Bounty Program
Converts would-be attackers into reporters.

**How it works:** Cost per report; massive reduction in catastrophic-breach probability; unlocks early
warnings and reduces zero-day damage. Has a running cost **and occasionally a bill you didn't
expect.**

**Variations and additions**

- **The Red-Team program is its aggressive sibling** — pay an internal attacker to attack you
  **between waves**, finding your holes *before* the game does and **converting vulnerability points
  into fix-points.** Defense that *pays* gold, and that keeps your breathers busy.

### Source Code / Data Escrow + Business Continuity Agreement
An enterprise-deal unblocker.

**Gives:** removes a common enterprise objection ("what if you go out of business?") by depositing
recovery materials with a third party, and defines what happens to customer data if you go under.
**Costs:** an annual fee and the discipline to keep the deposit current.
**Opens:** **a stale escrow deposit is worse than none, and the customer may test it.**

### Business Continuity / DR Plan (the document, not the infrastructure)
The artifact enterprise customers and insurers audit.

**How it works:** A written, tested, **dated** plan. **Having the infrastructure without the document
fails the audit; having the document without the infrastructure passes it** — which is the Compliance
Theater Meter given a specific, sellable object.

### Upstream Abuse Relationship
A relationship as a buildable.

**How it works:** Being on good terms with your transit providers' NOC and abuse teams **materially
changes how fast a DDoS gets scrubbed and how much rope you get** when one of your customers
misbehaves. Built by responding fast, being honest, and having a functioning abuse desk.

### SLA Contract Tier (a product you define)
Higher promise, higher price, higher penalty.

**How it works:** **A tower you build and a bomb you carry.** You author the SLA you sell: higher
promises attract better customers and carry bigger penalties. **The player sets their own difficulty
and their own reward.**
**Give the bomb a visible fuse (wave-2):** the SLA meter shows, **per contract, minutes of budget
remaining this month** rather than a percentage — i.e. the error budget, per customer. Then an
incident's cost is legible in real time and per relationship.

### The Escort Desk
Where tenant visitors check in.

**How it works:** Understaffing it is visible as **a queue of impatient suits in your lobby.**
**Hosting types:** colo, regulated.

---
### The Contract Clause Library — the legal tower tree
**The single most-wanted new system in the business half.** The contract as a set of individually
researchable, individually placeable **defensive modules**.

**How it works:** Each clause is a small tower you **unlock (usually by being burned by its absence)**,
then apply to a contract template. Each has a cost in **deal friction** — a percentage of prospects who
push back, negotiate it out, or walk. Clauses stack on a template; the template applies to a customer
segment; and the Deal Desk (above) is what stops sales quietly deleting them.

| Clause | What it does | Friction cost |
|---|---|---|
| **Limitation of liability** (capped at 12 months' fees) | Converts a catastrophic lawsuit into a bounded one | Enterprise legal will fight it; ~10% of deals slow |
| **SLA credit cap** (credits capped at 100% of one month) | Bounds your worst month | Low friction; standard |
| **Claim window** (credits must be requested within 30 days) | Most customers forget; real credit exposure drops ~70% | Low friction, high cynicism |
| **Maintenance exclusion** | Announced windows don't count against uptime | Low; universal |
| **Force majeure** | Upstream/utility/act-of-god exclusions | Low |
| **Auto-renewal** (evergreen with 60-day notice) | Renewals happen by default instead of by sale | Rising regulatory risk; consumer segments increasingly can't use it |
| **Annual escalator** (3%/yr) | Price rises without a conversation | ~15% of prospects negotiate it out |
| **Power pass-through** | Energy price risk moves to the customer | High friction in colo; standard in wholesale |
| **Take-or-pay minimum** | Revenue floor regardless of usage | High friction; enterprise only |
| **Assignment / change-of-control** | You can sell the company without losing them | Low friction if you ask early; **impossible to add later** |
| **Data-retention-on-termination** | Defines what happens to their data and what retrieval costs | Low, and prevents the ugliest disputes |
| **Acceptable Use Policy / right to suspend** | Your right to remove an abusive customer **without penalty** | Low; without it, firing a customer costs you money and reputation |
| **MFN** ⚠ *(a clause they impose on **you**)* | Their price follows your lowest | **Flag red in the Deal Desk** |
| **Right to audit** ⚠ *(imposed on you)* | They can inspect you annually | Costs senior hands forever |
| **Unlimited liability** ⚠ *(imposed on you)* | The one that ends companies | Should be refusable at the cost of the deal |
| **100% uptime SLA** ⚠ *(imposed on you)* | Mathematically unachievable; a guaranteed credit | The trap a quota-driven rep signs at quarter end |

**Why this is good design:** it makes "legal" into a genuine tech tree with real tradeoffs, it explains
*why* the fine print exists without being cynical about it, and it gives the player a defensive
subsystem **whose cost is conversion rate rather than latency** — a perfect mirror of the Shared Pipe
principle on the business side.
**Interacts with:** the Deal Desk, SLA Contract Tier, the Compliance Vault, the Legal Retainer,
Cyber-Insurance (several clauses are insurance prerequisites), §6.5 discounting.

---

## 4.10 Type-specific buildables

*Same grammar, new silhouettes. These are the hero objects that make each hosting line feel like a
different game.*

### Authoring rule: skins on shared mechanics
*The variety engine only stays affordable if most of these are costumes.*

**How it works:** Most type-specific buildables should be **skins on shared mechanics** rather than
distinct objects. The **Modem Bank**, the concurrency-slot pool, the **VoIP channel group**, the
**game-server slot** and the **serverless warm pool** are *one object* — "a countable concurrency
pool" — with five costumes. Saying so explicitly is what keeps balancing tractable.
**Reserve genuinely distinct buildables for the ~15 that change a verb:** tape robot · residency fence
· compliance boundary paint · tick-optimised node · job checkpointing service · meet-me room · the
dish · warm pool · spend cap · erasure-coding policy · immutable vault · matchmaker · high-density
busway · out-of-band modem · origin shield.
**⚔️ Tension:** the fresh-eyes reports argue the *opposite* — that the hero objects are exactly what
makes each line feel like a new game, and flattening them into skins is how variety dies. The
resolution: **skin the mechanics, but never skin the silhouette.** A Modem Bank and a VoIP channel
group may share every number and must share **no pixels.**

### Mail Server / MTA Cluster — "The Sorting Table" *(email)*
Enables transactional email and sells mailboxes.

**Opens:** open-relay misconfiguration, outbound spam, blacklisting, backscatter, and **the misery of
deliverability — a reputation score maintained by strangers.** High-pain, high-need, low-margin, and
the thing customers are most emotional about.
**Visual:** conveyors, bins, franking. **Queue depth is a visible pile of undelivered mail.**

**Variations and additions**

- **A whole subsystem with its own HP bar: reputation.** The **MX halo** is a visible ring — **one
  abused tenant and the ring dims for everyone**, and each compromised customer account taints the
  shared IP-pool well.
- **The Email Gateway content filter is *the* sorting tower** — it splits the inbound stream into
  customers and spam-botnet, with an **accuracy dial**: strict means false-positive lost contracts,
  lax means blacklist risk. **The game's identity tower, made literal.**
- **The design twist: mail is the only buildable that makes YOU the attacker.** It spawns *outbound*
  traffic (revenue!), and a compromised node **becomes a threat emitter** — blacklist contagion.
  Reputation as defense *and* as offense.
- **It connects to the greylist tarpit, the feedback-loop tower and the reputation dashboard**, and a
  relay misconfiguration is **blocklist death.**
- **Visual:** **DKIM is a wax-seal stamp** applied over each sent message; the nameserver's sibling
  visual is a directory podium with rolling print tape, and mail itself is a **pillar postbox.**

### Outbound Relay with Per-Account Rate Limits *(email)*
Protects deliverability; annoys bulk senders.

### Reputation Warm-Up IP Pool *(email)*
New IPs must be slowly "warmed."

**How it works:** **A building that takes in-game weeks to become useful** — the canonical example of
the Warm-up Curve (§4.1), and a genuinely unusual, interesting build.

### DKIM Signer / SPF + DMARC Config / Reverse DNS *(email)*
The deliverability stack. Cheap, mandatory, invisible when working — and one of the ~12 sanctioned
hygiene wins.

### Feedback Loop Processor *(email)*
Consumes complaint data from mailbox providers to find bad tenants early.

### IP Reputation Manager *(email)*
Warming pools, feedback loops, delisting requests, and per-IP reputation tracking as one console.

### Spam Filter Cluster / Mail Sorter *(email)*
A tunable aggressiveness slider **whose false-positive rate is displayed**.

**How it works:** Because **losing a real invoice email costs more than receiving 200 spams.**
**Visual:** a conveyor with sorting arms and a shredder; tuning is dragging threshold levers while
watching both error types. **False positives are a *legitimate* envelope going into the shredder with a
guilty amber pip.**

### DNS Authoritative Pair — "The Index Card Cabinet" *(any)*
Your name is your existence.

**Opens:** amplification abuse if recursion is left on; **zone-transfer (AXFR) leakage open to the
world, which hands an attacker your complete internal naming** — a real, common finding; **NS records
that don't match the parent delegation**, producing intermittent lame-delegation failures; and **total
invisibility if both nameservers are in one facility.**
**Counter-object:** a one-click **DNS hygiene check** that finds all four — exactly the kind of boring,
decisive, cheap tool this game should sell.
**Alternative:** managed DNS — costs money, removes risk, removes control.
**Visual:** a card cabinet whose drawers open and a card flicks out per query. **Zone transfers are a
drawer being copied.**

**Variations and additions**

- **Down means customers can't find you at all** — they **wander off-map entirely**, a failure no path
  defense fixes, which is what makes DNS the scariest cheap object in the game.
- **TTL is your reroute-agility stat** — a single number that decides how fast every other network
  decision can take effect.
- **Cache-poisoned nodes serve *fake destinations*** — customers bounce **without any attacker ever
  reaching you** — and **a poisoned resolver misdirects your own defenses.**
- **Misconfiguration turns you into an amplification threat *source***, and a hijack reroutes your
  lane outright — terrifying, and slow to counter.
- **The map IS the build** — anycast means the same service at many map points with traffic
  auto-choosing the nearest; **recursive resolvers are towers that *point* customers at you**, and the
  **DNSSEC signing station** is their hardening.
- **The anti-detour pair: route filters + an RPKI signer** — the boring towers that save your whole
  run if you remember them.

### Recursive Resolver (internal) *(any)*
Speeds up everything.

**Opens:** if it dies, *every* server fails simultaneously in confusing ways, and **half your alerts
will say "connection timed out" instead of "DNS is down." A dependency so fundamental it's invisible
until it isn't.**

### NTP Source *(any)*
Boring, tiny, and if it fails, **certificates and logs and auth all break at once.**

**Variations and additions**

- **The GPS-disciplined antenna (stratum 0) on the roof feeds it** — required by telecom (VoIP) and
  finance (**HFT literally will not buy without it — an attraction gate**), and by any multi-node
  consistency requirement.
- **Cheap and diegetic** — satellites render as little orbiting icons in the sky lane, which is the
  sky finally carrying *friendly* traffic.
- **The boring tower that prevents a whole hidden threat family** — auth breakage, log confusion,
  distributed-system weirdness. The quiet MVP.

### Anycast DNS Node / Signpost *(DNS)*
Cheap, many, globally distributed. Introduces BGP tech.

### Response Rate Limiter (RRL) *(DNS)*
Stops you being used as a weapon.

### DNSSEC Signer + Expiry Monitor *(DNS)*
Signing is a **hard-fail** system: get it wrong and you SERVFAIL for **every validating resolver.**

### Secondary DNS with a *second provider* *(DNS)*
**The counterintuitive build where the correct answer is "use a competitor too."**

### Origin Shield / Tiered Cache *(CDN)*
A cache in front of your cache; protects the origin from PoP misses.

### Purge Control / Rate-Limited Invalidation *(CDN)*
Prevents customer-triggered stampedes.

### Cache Key Normalizer *(CDN)*
Kills cache-buster floods.

### Bot Manager *(CDN)*
With its false-positive tax, and its own aggression slider.

### Erasure-Coded Pool / Erasure Coding Policy *(object storage)*
See §4.3 — **a slider that is literally a probability of data loss.**

### Scrub / Verify Runner *(storage, backup)*
Periodically re-reads everything to catch bit rot.

**How it works:** Costs IOPS, produces nothing visible.
**Visual:** a slow polishing wave that removes speckle. **Watching it pass is deeply calming, and
mechanically it is just a maintenance timer.**

### Object Lock / WORM *(object storage)*
The ransomware answer. See Immutable Storage (§4.3).

### Lifecycle Tiering to Cold Storage *(object storage)*
Cheap until someone needs it back.

### Pull-Based Backup Orchestrator / Immutable Snapshot Vault *(backup)*
The architectures that actually survive ransomware.

### Restore Test Harness *(backup)*
**The build that converts faith into evidence.** See §4.3.

### Seed Drive Shipping *(backup)*
For the first full backup, **because the network is slower than a van full of disks.**

**How it works:** Remains true, and is a great gag with real math behind it.

### Tape Library + Robot / Drive Pool / Barcode System / Courier Contract / Media Rotation *(tape vaulting)*
The physical logistics kit.

### The Legacy Drive Museum *(tape vaulting)*
A real requirement: **you must keep the ability to read what you stored.**

### Tick-Rate Optimized Node *(game hosting)*
High single-thread clock CPUs, not core count.

**How it works:** **A build that's *worse* on paper and better in practice.** Teaches
workload-appropriate hardware.
**Visual:** the **Tick Metronome** pendulum object.

### Game Server Instance + Per-Instance IP Isolation *(game hosting)*
One shard per instance; IP isolation limits booter blast radius.

### Player-Facing Proxy / IP Masking Layer *(game hosting)*
Hides individual players' IPs from each other, killing the grudge-booter vector **at the cost of a few
ms** — the thing you sell.

### Matchmaker / Lobby Service *(game hosting)*
Routes players to the nearest healthy shard.

**How it works:** A *routing* tower rather than a defensive one.
**Opens:** a single point of failure for the whole platform.
**Visual:** a rotating selector that visibly picks an arc.

### Anti-Cheat Service *(game hosting)*
Raises customer happiness, costs tick performance, produces false positives.

**How it works:** **A Friction tower aimed at reputation** — and its false positives are player bans,
which are the loudest complaints in the genre.

**Variations and additions**

- **The in-cart twin** — the same object shipped as an **anti-fraud gate** for e-commerce: a detector
  with a ban-hammer and **a false-positive tax on real whales.** One mechanic, two markets, and the
  complaint volume is identical in both.

### One-Click Modpack Provisioner / Instant Server Rollback *(game hosting)*
A save-state restore — **the single most-demanded feature in that market.**

### Session Border Controller (SBC) *(VoIP)*
**The firewall of telephony**: stops toll fraud and SIP scanning.

**Opens:** a new stateful chokepoint and high Friction risk (it blocks legitimate odd call flows).

### Spend Cap / Destination Whitelist / Fraud Anomaly Monitor *(VoIP)*
A cheap control that prevents the single most expensive failure.

**How it works:** **The best purchase in the VoIP ruleset**, and the player who skips it will only skip
it once. One of the ~12 sanctioned hygiene wins.

### Transcode Farm *(video/streaming)*
Batch capacity that can be **preempted for live events.**

**How it works:** **A building whose capacity can be borrowed** — a lovely flexible-resource object.

**Variations and additions**

- **Video's database equivalent** — it converts uploads into adaptive streams and **melts under viral
  spikes**, which is the streaming line's signature capacity crisis.
- **It unlocks the DRM licence server** — paid, and **required by studios**, so the content you want
  is gated behind a second purchase nobody anticipates.

### Bitrate Ladder Config / Ingest Redundancy / Low-Latency Delivery Path / DVR Storage *(video)*
The streaming kit. **Missing ladder rungs drop viewers on bad connections.**

### GPU Node / Liquid Cooling Loop / CDU *(GPU)*
High density, high heat, new failure modes (leaks), and a **facility prerequisite chain** — the first
buildable that requires a facility upgrade before you can even place it.

### High-Density Busway / Busbar *(GPU, colo)*
Absurdly thick power delivery, **drawn like architecture.**

### Power Capping Controller *(GPU)*
Trades performance for staying under the breaker. **A live, tunable dial.**

### GPU Health Telemetry / Tamper-Evident Cabinets + Asset Tracking *(GPU)*
**Because the cards are worth stealing** — and GPU theft from datacenters is real.

### Job Checkpointing Service *(GPU, HPC)*
**The difference between losing an hour and losing 39.**

### Job Scheduler + Preemption Policy *(GPU, HPC)*
Configure who gets bumped.

**How it works:** **Your fairness policy is a monetization decision.**
**Visual:** a physical queue board with customer-coloured job tickets.

### Spot / Interruptible Tier *(GPU, any)*
Sell idle capacity cheap with the right to reclaim it.

**How it works:** Raises utilization, risks customer anger. An excellent risk/reward dial.
**Opens:** **customers build critical things on spot and rage when evicted.**

### Low-Latency Interconnect Fabric / Parallel Filesystem *(HPC)*
The cluster plumbing **whose slowest member sets everyone's speed.**

### Node Health Check + Auto-Drain *(HPC)*
Yanks a slow node out of the pool **before it poisons jobs.**

### Control Plane HA / etcd Quorum / Admission Policy Engine / Resource Quotas / Progressive Delivery *(Kubernetes / PaaS)*
The platform-hosting kit — and the platform-hosting failure surface.

### Chrysalis Pool / Warm Pool *(serverless)*
Pre-warmed function shells. **Buying warmth is buying the absence of a stutter.**

### Cabinet / Cage / Private Suite *(colo)*
Three escalating tiers of sellable space with escalating isolation and price.

### Metered PDU + Circuit Enforcement *(colo)*
Lets you see and police tenant power draw, and **bill actual amps.**

**Opens:** enforcement creates disputes.

### Meet-Me Room + Cross Connect Panel *(colo)*
**The colo revenue engine. Each cable is MRR** — the wiring verb becomes the economy.

### Carrier Diversity *(colo)*
Each carrier in the building is a **marketing stat and a resilience stat at once.**

### Customer Portal with Power Graphs *(colo)*
A sales feature and a support-ticket deflector.

### Tour Route *(colo)*
Yes — a build: **a clean, impressive path through your facility for prospects.** Feeds off rack
Tidiness, cable trays, the meet-me room's cathedral look, and the customer lounge.

### Office / Customer Lounge *(colo)*
**Pure cosmetics that raise tour conversion. Great joke, entirely true.**

### Escort Policy / Badge System / Lockable Cabinet Doors *(colo)*
Physical security that also slows your own staff.

### Remote Hands (as a sellable product) *(colo)*
**Billable in 15-minute increments; a margin product *and* a retention tool.**

### Compliance Boundary Paint *(regulated)*
A literal painted line you place on the floor; everything inside it is in-scope.

**How it works:** **Buying a line on the floor as a game object** is wonderfully odd and thematically
perfect. **Segmentation to *shrink scope* is the core regulated-hosting verb.**
**Visual:** in-scope objects adopt a **uniform white faceplate skin**, so the boundary is readable from
above even when the paint is occluded, and **the scope count is printed on the boundary itself
(`47 ASSETS IN SCOPE`)** like a real floor marking.

### Faraday Cage / SCIF *(regulated, government)*
A sealed room with **no visible network exit.**

**Variations and additions**

- **The TEMPEST Room** — a shielded cage that stops your electronics from *radiating*: the
  side-channel spy and the key-emanation theft **simply cannot operate inside it.** The only counter
  to that threat family.
- **It is a *room*, not a tower** — floor-plan tetris, where you spend the best real estate on your
  worst secrets.
- **The shield's door is a maintenance chokepoint** — every rack move opens **an unshielded gap window
  where the spy vulture circles.**
  **Hosting types:** government, finance.

### Evidence Collection System / Quarterly Scan Vendor *(regulated)*
Audit artifacts as an ongoing staff cost — **and a sellable product.**

### Residency Fence *(GDPR, data sovereignty)*
Draw a fence on the world map; data motes bounce off it. **Policy as level geometry.**

### Abuse Desk *(shared, seedbox, bulletproof, email)*
A staffed function that processes complaints.

**How it works:** Under-staffing it is a slow doom clock. **On bulletproof levels it's an *optional*
building with a direct revenue tradeoff, which is the point.**
**Visual:** **rendering a business function as *furniture* keeps the ops-vs-business tension spatial.**

### Modem Bank / RAS / Terminal Server / RADIUS Auth *(dial-up)*
Countable concurrency. **The purest capacity object in the game** — and the canonical "Busy Wall": a
grid of modem lamps where a full wall is a busy signal for the next caller.

### News Spool / Mail Spool / Shell Server / Web Ring Node / Telco PRI Lines *(period)*
Same mechanics, completely different silhouettes — **a cheap and delightful way to reuse the engine.**

### The Dish *(satellite ground station)*
Tracks a visible arc across the sky; **its motion is the level's clock.**

### The Street Cabinet *(edge / MEC)*
A lonely box at an intersection with weather effects, no staff, and an LTE modem you'd better have
bought.

### Provisioning Automation *(shared, VPS, any volume business)*
New customer live in 60 seconds instead of two hours of staff time.

**How it works:** **The single biggest margin lever in shared hosting** — it decouples revenue growth
from headcount growth — and it's also a *marketing* investment, because slow provisioning bounces
visitors. **The game's showcase automation unlock.**
**⚔️ Required downside (flagged as a Three-Column-Law violator):** **automated provisioning means
automated abuse signup at machine speed. Your speed becomes an attacker's speed** — a fraud ring can
create 400 accounts in the time it used to take you to create one. **The correct pairing is
provisioning automation + velocity limits + fraud scoring**, and shipping the first without the other
two should reliably produce a bad week. That makes the game's "biggest margin lever" **also its most
dangerous single purchase**, which is correct. Plus: one bug can provision 500 free accounts.
**Visual — the before/after is the payoff:** **before**, a staff sprite walks to a machine, a
two-minute progress bar runs, one customer goes live, and **0.4 hands are consumed for 90 seconds.**
**After**, a signup arrives and the account **materializes in under a second** with a crisp assembly
animation and a chime, **no staff involvement**, and you can watch twenty happen in a row while the
staff member walks off to do something else. **The game should replay the "before" once, as a memory,
the first time you use the "after."** The *visible reclaiming of a person's time* is the best possible
way to sell what automation is for, and it should be the template for every other automation unlock.

**Variations and additions**

- **The Onboarding / Provisioning Orchestrator, framed as a gate** — the "provisioning robot"
  converts trial into live customer **without staff minutes**, which is the gate of the entire
  self-serve model at scale.
- **Segment split:** game servers and GPU need **near-instant**; enterprises want **guided
  onboarding** instead — **a different buildable entirely: the Solutions Engineer.** Shipping one and
  calling it both is how you lose the segment you built it for.

### Control Panel *(shared, VPS)*
Product-market fit in a box; customers demand it.

**Opens:** **a per-account license cost that scales with your success**, repriceable by a vendor at
will. Pure margin exposure. The open-source alternative is cheaper and a migration project.
**Make the regret arrive on a visible schedule (wave-2):** the licence cost per account should be
**shown on the Plan Builder from day one**, and the vendor should **announce a repricing two levels in
advance in the trade press.** **A regret you could have seen coming and ignored is a lesson; a regret
sprung on you is a punishment.** **The best regret node in the design.**

---

## 4.11 Non-physical buildables: policy, process and paper

*A whole build category that occupies no space and costs **staff-time instead of money**, so the player
has two parallel economies to spend in. Every entry uses the Policy card (§4.1): no capex, a
hands-per-month upkeep, an effect, and a friction on your own organisation. **Policies are the only
buildable that can be violated** — you may suspend one for a single incident, at a cost, which is
exactly the decision every real operator makes at 3am.*

### Graceful Degradation
Serve a static or cheap version when overloaded.

**How it works:** **Half revenue beats zero revenue.** Requires the application to support it (a
prerequisite purchase, like Read-Only Mode), so it cannot be bought during the incident.

### Backpressure / The Waiting Room
Hold visitors in a queue rather than failing them.

**How it works:** **Trades Patience for Capacity, explicitly.** Best-in-genre mechanic, straight from
real life: a visible queue with a position number keeps people far longer than an error page does.
**Interacts with:** the Queue Dial (§4.4), Admission Control, visitor patience rings.

### Load Shedding Policy
See §4.4. As a *policy* object it is the ordered list itself, authored in peacetime, reviewed
quarterly, and **the thing you are grateful for exactly once.**

### Change Review / Change Control
Reduces fat-finger odds, increases the time cost of every build.

**How it works:** **A direct pacing tax the player chooses to pay.** Mandatory in regulated lines. The
canonical policy you will want to *suspend* during an incident — and the game should let you, and
remember that you did.

### Change Freeze
A temporary global policy.

**How it works:** Triggered manually (before a big launch, a holiday peak, an audit) or **automatically
by an exhausted error budget** (§4.6). Reduces self-inflicted incidents to near zero and stops all
progress, which is the point.

### Capacity Planning Policy
Shows you future demand curves. **Information as a purchase.**

**How it works:** Reveals the build-lead-time problem early enough to act on it — see §4.6.

### Auto-Scaling Policy
Reacts to load. See §4.6's Auto-Scaler for the object; this is the rule set — thresholds, cooldowns,
maximum spend, and **whether it is allowed to scale during a suspected attack.**

### Terms of Service / Acceptable Use Policy
**A policy that lets you remove abusive customers without a penalty.** Without it, firing a customer
costs you money and reputation.

**How it works:** Also the fine print that decides whether "Unlimited" is a marketing word or a lawsuit.
See the Contract Clause Library (§4.9).

**Variations and additions**

- **The Fair-Use Policy — the "Unlimited" shield.** Advertise unlimited, enforce acceptable-use in the
  fine print: it **makes the Unlimited Bluff legal**, throttles gluttons **without churn-triggering
  terminations**, and lowers regulator heat.
- **Upgrades:** automated throttling curves, so the enforcement is a shape rather than a cliff.
- **The single policy that mediates between marketing, margin and regulators** — three departments
  arguing inside one document.

### SLA Tier Definition
You author the SLA you sell. See §4.9 — **the player sets their own difficulty and their own reward.**

### Compliance Package
Unlocks regulated customers; imposes **permanent process overhead** on every other action.

### Documentation
Reduces knowledge lost when staff leave; required for audits; produced by staff-time; **decays if not
maintained. A resource that rots.**

### The Offboarding Checklist
The counter to the Ex-Employee threat.

**How it works:** Badge, VPN, SSH keys, password manager, cloud console, registrar, the shared account
nobody documented, and the personal phone with the MFA app on it. Cheap, boring, and the *absence* of
it is a threat that waits months.

### The Escort Policy
Who may be in the building unaccompanied.

**How it works:** Slows your own staff and your own vendors, catches the Contractor's Contractor, and
is a compliance line item. **Hosting types:** colo, regulated.

### The Abuse Triage Dial
Permissive ↔ aggressive. See the Abuse Desk (§4.8) — the policy is the dial, the desk is the staff.

### The Refund Policy
How generous, how fast, how automatic.

**How it works:** Generous refunds cost margin and buy reputation; strict refunds hold cash and
generate chargebacks, which are worse than refunds.

### Discount Authority
The per-role ceiling the Deal Desk (§4.9) enforces.

### Mixed-Vendor Procurement Policy
Deliberately buying two of everything. Costs efficiency, buys resilience — see Vendor Diversity.

### The Company Handbook
The written form of Culture (§4.8).

**How it works:** On-call expectations, blameless-postmortem doctrine, promotion criteria, remote
policy. Slow, cheap, and it modifies hiring cost, retention, and **whether people tell you bad news
early.**

### Retention Schedule / Legal Hold
See §4.3. The policy half of the backup object, and the thing that makes "delete it" a legal question.

### Anycast Withdrawal Policy · Escalation Matrix · MOP and Go/No-Go · Error Budget Policy
Cross-referenced policy objects defined in §4.4 and §4.6. All four use this card.

---

## 4.12 Productization: turning operations into SKUs

*The signature CEO move: **anything you have to do anyway, sell.** Each of these takes an existing cost
centre and attaches a price tag — and each therefore turns an internal quality bar into a contractual
promise, which is the tradeoff.*

### Managed Services Tier
You were doing the work for free; now it's a line item.

**Opens:** once it's a SKU, doing it for free for anyone else is a discount you can't report on.

### Premium Support SLA
15-minute response, at a price.

**How it works:** Converts your best support capability into revenue **and rationally rations it.**
**Opens:** you must now actually staff it — an unstaffable SLA is an SLA-credit machine.

**Variations and additions**

- **Support Tier Pricing — the ticket paywall.** Response-time SLAs as SKUs: **Standard (48h, free) /
  Priority (4h, +$49) / Premium (15 min, phone, +$499).** The tiers **queue-separate the ticket
  lane** — paid tickets jump, free tickets wait — which makes the paywall **visible lane mechanics**
  rather than a hidden multiplier.
- **Raising support prices on legacy accounts is a churn grenade** — the upgrade that is safe on new
  customers and lethal on old ones.

### Backup-as-an-Add-on
**The highest-attach-rate upsell in hosting** (25–40%).

**Opens:** you have now *promised* restores, which means the Restore Drill stops being optional.

### DDoS Protection Tier
Defense as SKU — sell "protected hosting" at a ~40% markup and the defense pays for itself.

### Monitoring as a Product
You built it for yourself; resell it.

### Migration Services
Charge enterprise; free for SMB acquisition. **Converts your onboarding cost into a revenue line.**

**Variations and additions**

- **The Migration Concierge (the poaching weapon, legitimate variant)** — a "free white-glove
  migration" ability that **pulls a rival's cohort across the river**: the migration caravans get an
  *escort service*, at a brutal support-load cost during intake.
- **It fails publicly if the cutover breaks** — a high-stakes acquisition tower whose downside is a
  headline rather than a refund.
- **The budget form:** free-migration credit spent now, MRR later — the same trade with the risk moved
  onto your balance sheet instead of your reputation.

### Dedicated IP / SSL / Domain Registration
Small-ticket, high-attach, near-zero COGS. See the Upsell Shelf for attach rates and the
domain-registration retention insight.

### Compliance-Ready Hosting
**The same servers, a policy wrapper, 4× the price. Entirely real.**

### Reserved Capacity / Committed-Use Discounts
Trade price for certainty. **Improves your forecasting, which improves your capacity planning, which
improves your margin** — a rare three-link chain of virtue.

### Spot / Preemptible Capacity
Monetize idle inventory at a discount, with the right to evict. **Fills your utilization gap.**
**Opens:** customers build critical things on spot and rage when evicted.

### Colo Cross-Connect
**The purest margin in the entire industry.** See §4.4 and §4.7.

### IPv4 Leasing
Rent your scarce addresses to other operators. See IP Space (§4.4).

### Bandwidth Resale / Transit
Once you're big enough to buy cheap, sell to smaller hosts — and inherit their abuse.

**Variations and additions**

- **The Wholesale Bandwidth Desk** — resell excess transit at margin, **carefully: the commit floor
  still bites you** if your own usage drops.
- **The Remote-Hands Counter** — bill NPC tenants **per truck-roll** for hands in colo.
- Together they are **two asset-light revenue taps**: small, steady, real — **the boring money that
  saves companies.**

### White-Label Everything
Your infrastructure under someone else's brand at ~60% of retail.

**Opens:** you lose end-user visibility and can be disintermediated by your own partner.

### Remote Hands / Smart Hands
Billable in 15-minute increments. A margin product **and** a retention tool.

### Escrow, Evidence Packs and Audit Artifacts
Sell the compliance paperwork you already generate. See the Compliance Vault.

---

## 4.13 Rentals, burst, and the panic economy

*A third column beside capex and opex: **things you can rent for the duration of one incident.** Every
good strategy game needs an expensive panic button that is occasionally the right play — and currently
the only panic button in this design is the Big Red Button, which is pure loss. **Rentals give the
player a way to spend money to win a fight**, which is the classic tower-defense pleasure this design
is otherwise missing.*

### Emergency Scrubbing Activation
Per-hour, activates in ~30 seconds, costs several multiples of the retainer rate.

**How it works:** The on-demand half of the scrubbing decision, with its activation delay as the fuse.

### Burst Transit
**10× your commit for an hour at 8× the rate.**

**How it works:** Available instantly if pre-arranged with your carrier; unavailable if not — which
makes the *arrangement* a peacetime purchase and the *use* a wartime one.

### The Burst-Capacity Gate family (three skins)
Rent overflow when the tide comes in. **The emergency-tower archetype, in three flavours.**

- **The Overflow Marketplace Booth** — **pre-reserve** burst capacity from the in-game cloud giants:
  instant warm standby that you "buy out" for one spike. The reserved-instance economy as a physical
  booth — **and the booth vendor remembers you**, which is social texture as well as pricing.
  Launch-day levels live here.
- **The Multi-Cloud Escape Hatch** — a big-red-button contract with a hyperscaler: **unlimited elastic
  power while active, draining cash per second.** Staying plugged in past the crisis applies a
  **lock-in debuff** (customers drift toward "the one that never fails"), and **using it too often
  re-prices the contract — they know your pain.**
- **The Burst-Cloud Gate** — instant, expensive, and its customers are **new gnats you must onboard
  mid-crisis**: the capacity arrives with work attached.

**The class, formalised: Temporary / Emergency Buildables** — cheap, fast-deploy, short-duration
panic-button versions of ordinary towers at **worse cost-efficiency than planning ahead.** That is
the whole point of §4.13, stated as a build category rather than as a list.
**Interacts with:** the Warm Bench (§4.1), the Auto-Scaler's cap (§4.6), the Hot Site (§4.3), The Rule
(below).

### Rented Hands
A contractor's four hours, at an insulting rate, arriving in 30–90 minutes.

### Competitor Capacity
Borrowed capacity from a peer at insulting prices.

**How it works:** Available only if you have a relationship — the Peering Coordinator and the Upstream
Abuse Relationship both feed this. **A social stat that becomes a capacity stat during a crisis.**

### Emergency Courier / Expedited Freight
Buys back lead time on a part, a tape, or a seed drive.

### Emergency Fuel Delivery
Priority refuelling on the spot market during a regional event — at whatever it costs, if anyone
answers.

### The Rule
**Panic-buying doesn't save you; panic-*activating* what you already bought does** — and rentals are
the narrow, expensive exception that proves it. All of them are expensive, all are genuinely
available, and all are correct sometimes.

---

## 4.14 Where the business machine lives: the mezzanine and the desk grammar

*The biggest structural gap in the visual design: §4.9 makes forty-plus business functions buildable
and places **none of them anywhere.** They have no home on a board made of racks.*

### The Back Office Mezzanine
A glass-fronted office level running along one side of the facility, visible as a lit strip above the
floor.

**How it looks:** Business buildables are **desks and furniture** in it. **Billing** is a desk with a
printer that runs on the 1st. **Legal** is a shelf of binders and a closed door. **Collections** is a
phone and an aging tray. **Sales** is an open bullpen with a gong. **Compliance** is a locked cabinet
with a seal. **Insurance** is a framed policy on the wall. **The Board** is a meeting room with a long
table that is empty except quarterly. **Finance** is a desk with a second monitor showing the forecast
you bought.
**Why it matters:** **business capacity becomes as spatially legible as compute capacity** — an
understaffed support function is visibly empty desks, and a bloated one is visibly a crowded room
you're paying for.
**Interacts with:** §4.9 in full, the Ledger Drawer, the Paper Family (paper accumulates on these
desks), §4.7's Office (this is its grown-up form), the six-department grouping (each department is a
zone of the mezzanine).

### The Desk Grammar
The visual kit that makes the mezzanine cheap to build. **Four slots, forty buildings.**

**How it looks:** Every business buildable = **surface + tray + prop + seat.** **Surface** says its tier
(folding table → laminate desk → oak). **Tray** says its workload (in-tray fill level, universally).
**Prop** says its function (one silhouette-distinct object). **Seat** says whether it's staffed, and by
whom.

---

