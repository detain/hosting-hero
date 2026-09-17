# 2. Hosting types

The hosting-type variety engine, the type catalogue, and the per-type level
designs, collected into one section to mirror the companion document.
Assembled from §0.2, §0.3 and §1.3 of the original monolith; original section
numbering is preserved so inline cross-references keep working.

Note: per-type detail that lives inside other categories (§2.12 type-specific
threats, §3.3 visitors per type, §4.10 type-specific buildables, §5.6 unlocking
business lines, §6.6 per-type economics, §7.8 per-type mechanical shifts, §8.10
per-type visual identity) deliberately stays in those files.

## 0.2 The hosting-type variety engine (core design pillar)

*The broadened brief's central claim: the company is a hosting provider in general, and **what kind
of hosting it does changes from level to level and scenario to scenario.** From both the game-design
and ops chairs this is the strongest idea available, because it is a variety engine that costs
almost nothing to build if framed correctly — and because it's true: the word "hosting" covers a
dozen completely different jobs that only look similar from the outside. A shared-hosting admin, a
tape-vault operator, and a GPU-farm engineer share almost no daily reality. What they share is a
rack, a power bill, and a pager.*

### The Ruleset Card
Do **not** treat hosting types as reskins. Treat each as a **ruleset mod** that redefines six slots
in the existing engine.

**How it works:** Each hosting type ships a card defining:

| Slot | What it means | Example variance |
|---|---|---|
| **The Unit** | What "a visitor" is | page load / player joining / backup job / inference request / SIP call / tenant tour |
| **The Goal Node** | What they're trying to reach | checkout / game shard / storage vault / GPU queue / an inbox |
| **The Scarce Resource** | What you actually run out of | bandwidth / concurrency / IOPS / GPU-hours / tick budget / floor space + amps / IP reputation |
| **The Patience Analog** | What makes them leave | latency / ping+jitter / backup window / queue wait / deliverability / lease terms |
| **The Threat Mix** | Which roles dominate | swarm+tank / mimic+parasite / entropy / regulator+abuse |
| **The Look** | Palette, silhouettes, sound | see §8.10 |

**Everything else — the lane, the Shared Pipe, Capability/Surface, hands, upkeep, the scorecard —
stays identical.** That's the trick: one engine, twenty games.
**Interacts with:** literally every category; this is the cross-cutting dimension.

### The Three-Change Rule (design law)
Each hosting type should change **which resource is scarce**, **which failure is fatal**, and **who
the customer is.** Change those three and everything else reshapes itself.

**How it works:** Used as the authoring checklist for any new type. See the Scarcity Table in §0.3,
which is that rule tabulated.

### The Verb Shift Rule
A hosting type is only worth shipping if it changes the **verb the player performs most often.**

**How it works:** Web hosting: *tune latency*. Game hosting: *place capacity near players*. Backup
hosting: *schedule and verify*. Colo: *sell space and police power*. GPU: *schedule a queue*.
Email/DNS: *protect reputation*. Tape vault: *verify*. CDN: *route and evict*. Regulated: *shrink
scope*. If two types share a verb, merge them.

### The Business Line System
Late campaign, you can run **several hosting lines at once** in one facility.

**How it works:** Lines share facilities, staff, and network but have *opposed* requirements: game
hosting wants low latency and hates noisy neighbours; GPU hosting wants density and makes enormous
heat; backup hosting wants cheap bulk storage and doesn't care about latency at all. The map gains
**business-line tabs** or colour-tinted districts, and conflicts between lines become the late-game
strategy layer: the GPU line wants the power the colo line already sold.
**Interacts with:** §1.4 ("Multi-Line"/"Diversify"), §6.6, §7.8, §8.10.

### The Portfolio Meter
A diversification stat with an honest downside on both ends.

**How it works:** One line = high margin, high variance (a single market shock kills you). Many lines
= lower margin, smoothed risk, but your staff's expertise is spread thin and incident response is
slower in every line. Exposed as an end-of-level dial (**Portfolio Balance**) drawn as a pie that is
uncomfortable to look at when one slice dominates.
**Interacts with:** §6.9 scoring, §2.10 concentration risk.

### Line Synergies
Some pairs multiply, and discovering them is its own layer.

**How it works:** CDN + video hosting (your own edge carries your own streams); backup/DR + colo
(sell DR to your own tenants); DNS + everything (you already own the infrastructure); backup + object
storage; GPU + HPC; colo + transit + cross-connects. Visualized as a linked-rings glyph and a bonus
pipe drawn between two coloured districts. Also: **opposite peak hours are a synergy** — web peaks
midday, games peak at night, backup peaks overnight, so a mixed portfolio smooths your utilization
curve. That is a real, clever business insight rendered as a mechanic.
**Interacts with:** §5.6, §6.6, §8.10.

**Variations and additions** — second-pass entry: *Combos & pairings (types in one map)*

- **Combo scenarios.** CDN origin sitting on a colo floor (defend facility + cache layer at once); email + web on one shared box (the classic small-host hell — spam reputation poisons the web customers); game hosting inside a cloud with autoscaling budget pressure; each combo has its own difficulty signature. Great pairs: CDN+video (origin/edge), email+shared (reputation coupling), backup+regulated (audit + ransomware), game+CDN (asset delivery during launch), GPU+storage (checkpoint storms). Hybrid-act level design: one map split down a hard diagonal — half arcade, half hospital (hosting a game studio's player accounts under regulation); customers cross the seam and lighting/palette/music blend in a gradient strip; the HUD mirrors the split. Late levels can also share terrain with a rival: racks visible across the property line, a customer river between you that forks — poaching happens on-screen. (general, gamedesigner, visual)
  - Deliberate pairings: game+CDN for an esports finals broadcast; GPU+backup where training runs are worth more than the datacenter; mail+regulated for a hospital's patient-notification system; offshore+GPU for the "sovereign compute" heist level. (wave2_general_fresh)
  - Combination pairings that shine: Game servers + CDN (patch-day burst); Email + shared (reputation coupling); GPU + backup (checkpoint obsession); Colocation + regulated (physical+paper audits); Dial-up + backup (nostalgia tape rotations) — the campaign should schedule these pairings deliberately. (wave2_gamedesigner_fresh)
  - Mid-late level "The Full Stack": one company runs shared + VPS + colo + a slice of GPU; internal transfer pricing becomes a mechanic (which BU gets the new switch?), and one shared upstream provider failure correlates across all lines at once — a single point of business failure. (wave2_ceo_fresh)
  - Hybrid visual levels: two identities share one screen split by a backbone trunk (the sorting office door opens into the RGB cave); the seam where two palettes meet becomes a gameplay chokepoint — great for "company grew sideways" stories. (wave2_visual_fresh)
  - Design cheat-sheet of districts: Shared + Managed WP + Email = one strip-mall of customer archetypes sharing the same oversold boxes and IP pool (a great teaching level); VPS + GPU + Backup = startup-served campus (all sellable to the same customer — expansion plays); Colo + Regulated + Gov = a corporate block with cert-gated doors; Game + Streaming + CDN = the entertainment district (shared burst dynamics, shared DDoS extortionists); Bulletproof = a dark alley *behind* every district — same infra, different tenant vetting; Dial-up = standalone period map. (wave3_ceo_fresh)
  - Strong pairs: email+web (spam-rise-from-your-pool tension), game+CDN (launch + delivery), backup+regulated (audit + restore test), GPU+crypto-miner abuse, dial-up+email (nostalgia act). Bad pairs: bulletproof + regulated ("comedy, but mechanically incoherent"). Transition arcs: shared→VPS (natural), VPS→colo (the downward-mobile twist), bulletproof→regulated (a redemption run, hard mode). (wave3_gamedesigner_fresh)
  - Early/late ordering rule of thumb: shared/dial-up/DNS = early (few moving parts); VPS/colo/managed-WP = mid; GPU/regulated/multi-region/streaming = late (capex + compound systems); best combos in one level: colo + game servers (latency pressure on a shared upstream), backup + regulated (audit of the audits), CDN + streaming (geography + spikes), email + shared (abuse-desk storyline). (wave3_sysadmin_fresh)
  - Hybrid Operations: a level where you run shared web + mail + a GPU side hustle simultaneously, sharing ONE uplink and ONE budget — cross-contamination is the puzzle (mail spam reputation tanks web signups; GPU heat spikes trip the colo thermostat); late-campaign sandbox challenges. (wave4_general_fresh)
  - Two types one board: CDN + Streaming (the origin shield IS your transcode farm); Email + DNS (reputation shared); Colocation + Regulated (the auditor walks the facility); Shared + Game servers (the eternal tragedy of gamers on shared boxes — great comedy level); combos force shared buildables to serve TWO threat/customer tables — the real designer treat. (wave4_gamedesigner_fresh)

### Line Antagonisms
Some pairs actively hurt, enforced by systems rather than rules text.

**How it works:** Bulletproof hosting next to regulated hosting gets your compliance certification
revoked. Crypto mining next to game hosting steals the power headroom you need at peak. Email +
bulletproof are mutually exclusive because IP reputation is the product of one and the sacrifice of
the other. GPU + colo compete for the same amps.

### The "What Are We Even" identity stat
A gentle force toward coherence that makes diversification non-trivial.

**How it works:** Running too many unrelated lines dilutes your brand and your engineers' expertise:
support quality drops, automation doesn't transfer between lines, and staff specialization bonuses
decay.

### Control Granularity as a difficulty axis
**Progressive loss of control as the business scales up** — a genuinely novel difficulty axis, and
it's true: the bigger the customer, the less you're allowed to touch.

**How it works:** In shared hosting you control everything inside the box. In dedicated you control
nothing above the power cord. In colo you control nothing above the cabinet door. In wholesale you
control nothing inside the shell. Some objects on your board simply **cannot be clicked** — you can
see their power draw and heat and file a request, but you can't fix them. Removing agency
selectively is a fantastic and underused difficulty tool.
**Interacts with:** §7.8 ("act through a keyhole" mode), §2.12 (colo tenant threats).

### Same event, different crisis (the proof the engine works)
One world event, reskinned per type, is the cheapest content multiplier in the design.

**How it works:** An upstream carrier outage: for a web host it's an outage; for a game host it's a
*routing* problem (players on one ISP can't connect and blame you); for a CDN it's a PoP withdrawal;
for a satellite operator it's a missed pass; for an email host it's a deliverability dip nobody
tells you about. Same event, five different-looking crises. Shipped as a mode in §9.1 ("The Same
Outage, Six Ways").

### The Five-Asset Skin Kit (production spec)
What makes 25 hosting types affordable.

**How it works:** Per business line ship exactly (1) an accent hue + secondary, (2) a visitor
costume, (3) one hero buildable silhouette, (4) one bespoke meter widget, (5) one bespoke
catastrophe FX. Everything else is shared. Every object is authored as silhouette layer + faceplate
decal + emissive layer + material swatch, so lines and eras are decal + swatch swaps.
**Interacts with:** §8.10; §9.4 (expose the kit to modders).

### Type Transitions — "The Pivot" (cross-type campaign mechanic)
Hosting types are not only level skins — **changing type is itself a playable event**, and the
campaign's connective tissue.

**How it works:** Types are districts/annexes of one company. Unlocking a new type adds a new *wing*
with its own palette, threat set and customer species, while old wings keep generating revenue **and
keep their old vulnerabilities** — the late-game map is a patchwork of every era you lived through,
visually a museum of the internet. Transitions can also be played *inside* a level: the old customer
flow fades while a new flow appears with an unknown threat profile, and the transition itself is the
vulnerability window.
**The business half:** Shared→VPS is the classic upgrade path (your best customers graduate, you
keep the MRR); VPS→public-cloud forces cannibalization decisions (kill your cash cow before a
competitor does); "productizing service" (agency-style managed hosting → self-serve platform) is a
mid-run tech-tree fork with a revenue dip before the gain. **Every type-change should re-price your
entire book** — model transitions as billing-model migrations with a **dual-ledger window** (old
SKUs keep billing while the new tree ramps: the revenue J-curve as an actual playable curve).
**Interacts with:** §0.2 The Business Line System, §1.3 every type entry, §6.6, §7.8.

**Variations and additions** — second-pass entry *"Type Transitions — The Pivot" [cross-type campaign mechanic]*

- Campaign beats: Shared → VPS (developers discover you); VPS → Cloud (need orchestration); domestic → regulated (upmarket); anything → GPU (the AI gold rush); each transition: keep old customers on a legacy tier (decay) or migrate (risk) — the transition level IS the drama. (wave2_sysadmin_fresh)
- Visual: the set itself mutates mid-level — tenement scaffolds into cage aisles; beige garage lights cool to reactor white; transition is the cinematic reward: dressing change, palette crossfade, ambient bed swap, HUD re-skin. (wave2_visual_fresh)
  - "Act break" levels where you convert the install base: shared → VPS means your existing customers graduate (and expect more); the old shared stack becomes a deprecated tower that still earns money and still gets attacked, and *nobody is allowed to delete it* — every veteran sysadmin knows the haunted EOL box. It's a haunted box. (wave3_sysadmin_fresh)
  - Model the level-up as a within-level event: the old customer type keeps arriving (and degrades without cheap options), new customers need new buildables and open new threat doors, and the first 24h after the switch is a scripted "instability wave"; players schedule transitions to safe windows — a macro-timer strategy layer. (wave3_gamedesigner_fresh)
  - When a company pivots types mid-campaign, the old product becomes a legacy revenue stream with zero investment: it churns predictably but funds the new build — add an "milk or sunset" decision layer every real company faces (cPanel hosts in 2023, everyone in 2026 vs AI). (wave3_ceo_fresh)
  - Visual "Renovation": the whole screen is on construction scaffolding; the old palette peels off in torn-paper strips while the new palette paints in as you demolish/rebuild; the dual-flow lanes must be preserved *during* the re-skin — the definitive test of the global visual language. (wave3_visual_fresh)
  - Wave-1 setpiece catalog: Shared→VPS (carve your dormitory into apartments); VPS→GPU retrofit (rip out the compute floor for liquid cooling — customers get grumpy during construction); clean→regulated (you must pass an audit to unlock the healthcare customer lane); legal→offshore as a *fall-from-grace* branch. Transitions are played as multi-level arcs with persistent save state, not cutscenes. (wave1_general_fresh)
  - Campaign-branch implementation: Shared→VPS = your best customers outgrow you (income cliff unless you built hypervisors); VPS→colo = you stop owning servers but inherit building risk; web→CDN = latency expertise converts; regulated = one breach *forces* the transition (you lose the unregulated market). Implement as end-of-level "term sheet" events that retune the entire next level's threat/customer catalog. (wave1_sysadmin_fresh)
  - Transition rule: each type change keeps the customer base but changes the *P&L shape* — volume→thin (shared→VPS), thin→sticky (VPS→backup), predictable→volatile (CDN→GPU spot), clean→dirty (any→offshore); design each transition level around ONE P&L lesson. And the "Hybrid Operator" mid-late combo: colo customers upsell to managed, managed customers churn to cloud — cannibalization between your own products as a mechanic (adopt a new tech or watch it take your base anyway). (wave1_ceo_fresh)
  - Visual pivots: mid-level type changes play as construction transformations — the apartment block visibly re-partitions into a hotel (shared→VPS) with tiny contractors; the arcade gets a glass hospital annex bolted on; a "heritage wall" easter egg keeps a framed photo of the old building. (wave1_visual_fresh)
  - Transition: shared → managed — the classic margin move: same servers, repackage + a $20 ticket-free onboarding wizard = ARPU ×4, support COGS ×2; you win if your tooling beats your ticket-queue growth; show it as an in-game product relaunch event with churn shock at the transition ("my plan changed!"). (wave4_ceo_fresh)
  - Signature mechanic: PIVOT EVENTS — the shared-hosting company that lands big customers must move to VPS (isolation): re-architect mid-game; the colocation provider adding a cloud layer on top; the backup firm buying a CDN; each pivot: keep the old revenue (AND its threats) while standing up the new, with customer-churn risk during the messy middle. (wave4_sysadmin_fresh)
  - shared→VPS converts your noisy-neighbor floor plan into a grid (existing customers "upgrade": goodwill bonus, but container escapes NOW apply); VPS→GPU = retool racks, stranding some customers (churn spike) unless you SUBLET to another host (fee); Colocation→cloud = the "you are now the tenant" inversion level where YOUR upstream host's failures threaten you and you can only fight with redundancy; "Graduation" mini-scenarios whenever a customer type outgrows your product tier — keep them (rearchitect under live traffic) or lose them to a competitor; transitions are interstitial levels with migration goals — the campaign's connective tissue. (wave4_gamedesigner_fresh)
  - Transitions as visual grafting: same map, tenants physically move out and new tenant archetypes walk in; the palette cross-fades between type identities over the level; a "rebranding" crane changes the lobby sign mid-battle. (wave4_visual_fresh)

---

## 0.3 The hosting-type catalogue and the Scarcity Table

*Seeded from BRIEF.md's list and extended by the wave-1 reports. This is the spine of the whole
variety engine: it states, per type, what is scarce, what kills you, who buys, and what you sell.*

| Hosting type | Scarce resource | Fatal failure | Customer is | Unit of sale |
|---|---|---|---|---|
| Shared web / cPanel mass hosting | Concurrency slots / IOPS | Mass compromise via control panel | Thousands of tiny accounts | An account |
| Managed WordPress / managed app | Staff attention | A plugin update breaking 800 sites | Agencies | A site |
| VPS / cloud instances | RAM (always RAM) | Hypervisor escape / host node death | Semi-technical individuals | An instance |
| Dedicated / bare metal | Rack space + provisioning time | Hardware with no hot spare | Technical customers with root | A server |
| Colocation | **Power and cooling** | Facility-level power event | Other companies' engineers | A cabinet + amps |
| Wholesale / build-to-suit | Construction capital + lead time | Commissioning failure / the one tenant walking | One enormous tenant | A shell / a megawatt |
| Game server hosting | **Latency + tick budget** | Sustained DDoS during prime time | Communities, kids with allowances | A slot / a server |
| Voice / VoIP / SIP trunking | Jitter + packet loss | Toll fraud | Businesses + carriers | A channel / a DID |
| Email hosting | **IP reputation** | Blacklisting | Everyone, cheaply | A mailbox |
| DNS hosting (anycast) | Query capacity + global reach | Total resolution failure | Domains by the million | A zone |
| CDN / edge caching | **Egress bandwidth** | Cache poisoning / origin exposure | Content owners | A TB served |
| Object storage / S3-alike | Disk + durability math | Silent data loss | Developers, backup vendors | A GB-month |
| Backup / DR hosting | **Restore time**, not storage | An unrestorable backup | Everyone's worst day | A GB + an RTO |
| Offsite tape vaulting | Physical logistics | Losing a tape, or a fire | Regulated industries | A slot + a courier run |
| Video / transcode / live streaming | Egress + transcode CPU | A live event failing live | Publishers, creators | A viewer-hour |
| Image / file hosting / seedbox | Bandwidth, abuse-desk labour | Upstream null-route over abuse | Price-obsessed technical users | A TB transferred |
| GPU + AI compute | **Power density and cooling** | Thermal event / GPU theft | Researchers, startups | A GPU-hour |
| HPC / render farm | Job scheduling + interconnect | A 40-hour job dying at hour 39 | Studios, labs | A node-hour |
| Crypto mining hosting | Power price | Power price going up | Volatile, non-sticky | A kW |
| Kubernetes / PaaS | Control-plane stability | A bad operator reconciling everything to death | Dev teams | A workload |
| Serverless / functions | Cold-start latency / warm pool | Noisy multi-tenant blast radius | App devs | An invocation |
| DBaaS / managed search / queues | IOPS + durability | Data corruption | App teams | An instance + IOPS |
| Bulletproof / anything-goes | **Upstream tolerance** | Losing your transit | Criminals and dissidents alike | Deniability |
| Regulated (HIPAA/PCI/FedRAMP/GDPR) | Audit evidence + cleared staff | A finding | Compliance officers | A certified environment |
| Financial exchange colo | Microseconds / cable length | Unequal latency between tenants | Trading firms | A cabinet three metres closer |
| Dial-up ISP (period) | Modems in the bank + phone lines | Busy signals | Households | An hour / a line |
| BBS / shell accounts / IRC leaf | A single box's resources | A fork bomb, a channel takeover | Named individuals | An account |
| Usenet feed (period) | Disk + inbound bandwidth | Falling behind the firehose | Retention shoppers | Retention days |
| Satellite ground station | Sky windows / pass schedules | Missing a pass | Constellation operators | A pass |
| Edge / 5G MEC | Site count + physical access | A site being unreachable | Carriers | A PoP |
| IoT backends | Connection concurrency | A synchronized reconnect storm | Device makers | A device-month |
| Blockchain node hosting | Storage growth + sync time | Falling out of sync during an event | Protocol teams | A node |

### Type-specific "fifth axis" scoring
Don't score every level on uptime — this is the cheapest, strongest way to make each type feel
genuinely different to play.

**How it works:** Game host scores on **p99 latency and tick stability during prime time**. Backup
host on **RPO/RTO achieved and restore success rate**. Colo on **occupancy, PUE, SLA adherence, and
tenant satisfaction**. CDN on **cache hit ratio and egress cost per GB**. Email on **inbox placement
rate**. DNS on **global resolution success and query latency**. GPU on **utilization % and kWh per
useful job**. Regulated on **findings count and evidence completeness**. Bulletproof on **survival,
and how much of your soul is left** (a literal tongue-in-cheek stat).
**Interacts with:** §6.9.

### Early / mid / late placement of the catalogue
Each type is a scenario *flavour*: threats, customers, buildables, money, look. The catalogue above
is unordered; this is the ordering the campaign should actually use.

**How it works:** **Early-friendly** — shared, dial-up, email (few moving parts, one scarce resource
each). **Mid** — VPS, CDN, game, backup, storage. **Late** — GPU, regulated, video,
colo-to-multirack, offshore, HFT, detonation (capex plus compound systems). The rule behind the
ordering is the number of *simultaneous* scarcities a type asks the player to hold in their head.
**Interacts with:** §1.3 (level ordering), §0.2 The Three-Change Rule.
*(gamedesigner)*

### The signature-resource HUD (one headline meter per type)
The Scarcity Table above says what runs out; this says **what the HUD shows front and centre**, so a
level feels mechanically distinct even mid-remix.

**How it works:** Each type promotes exactly one meter to the top of the HUD:
Shared = noise · VPS = quota · Colo = power/cooling · Game = latency · GPU = heat · Backup = the RPO
clock · CDN = cache-hit % · Email = reputation · Stream = the bitrate ladder · Offshore = the heat
meter · Regulated = compliance % · Dial-up = modem slots. Everything else stays in the drawer.
**Why it matters:** it is the cheapest possible expression of the Three-Change Rule — the player
reads the type from the HUD before the art loads.
**Interacts with:** §0.2 The Ruleset Card, §0.3 Scarcity Table, §1.3 per-type "signature meter".
*(wave4_gamedesigner_fresh)*

### Cross-type readability — the river is a pie chart
Every act's customer stream is colour- and wardrobe-coded by segment, so the road itself displays
your customer mix.

**How it works:** Glance at the road, know your business. Pivot levels (shared→VPS) show the pie
composition of the river changing in real time as segments spawn — the clearest possible read on a
type transition while it is happening, with no UI panel at all.
**Interacts with:** §0.2 The Portfolio Meter, §1.3 Type Transitions, §8.10.
*(wave2_visual_informed)*

---

## 1.3 Hosting-type levels (the variety engine as content)

*One level (or level family) per hosting business. Each entry states what the ruleset changes, the
signature threat, the signature meter, and the visual identity, merging the sysadmin, game-designer,
CEO, general and visual lenses. The campaign should visit a new type every 3–4 levels, then return
to a familiar one **changed** by what you learned — alternating novelty and mastery is the classic,
correct campaign rhythm.*

### Authoring requirements for every hosting-type entry (design law)
Every type in this section must carry three fields or it is evocative rather than authorable.

**How it works:** **(1) the dominant verb** (one of the six invariant verbs, §1.9) · **(2) the
transferable lesson** (from the Portable Skill Table, §1.9) · **(3) the returning-visit hook** — what
changes on the second visit. **Without field 3 every type is a one-off and the content budget is
spent on novelty rather than mastery.** Add also the **Visual Identity Kit** below and the
**Handover Note** (§1.9), which is the type's thesis rendered as a prop.

### The Visual Identity Kit (one "visual chord" per hosting type)
Swapping hosting type between levels should feel like walking into a different building, not
re-skinning a menu.

**How it works:** Each type ships as a kit: a **5-colour chord**, a **lighting rig**, a **material
set**, a **typeface**, a **particle palette**, and a **signature ambient motion**. The kits are
listed per-type below. Global constraints: the Flow layer's hue ledger always wins (magenta is
reserved for hostile traffic and no décor may use it), the emissive allowance is fixed, and a forced
overlay (thermal, compliance, forensic) drops the alert triad to **two** hues with the third
aggregated — otherwise the overlay fights every alert colour for the whole level.

### "The Mass Host" / "Cabinet 14" — Shared web hosting (cPanel-style)
Thousands of tiny tenants on a few boxes. Density is the whole game.

**How it works:** New rule: the **Tenant Density dial**. Pack more sites per server for margin; every
added tenant raises the chance one of them is compromised or abusive. You fight for IOPS and
concurrency, and every customer is a stranger's PHP. Introduces overselling ratio, per-account cgroup
caging, and the fact that one account's `find /` is everyone's outage. The map is a single box
zoomed *in*, showing accounts as tenants. **Dominant verb: Triage.** **Teaches: density vs blast
radius; one tenant is everyone's problem.**
**The second dial (the missing half of the strategy space):** shared hosting's two real levers are
oversell ratio (present) and **term mix** (absent). Selling annual prepay transforms the same book:
cash arrives up front, measured churn drops (deferred to renewal), payment fees fall from ~13% to
~1.1% of revenue, and support load per revenue-dollar falls. It also builds the **renewal cliff.**
Putting both sliders on the same level makes shared hosting a real strategy space instead of a
density minigame.
**Twist rule for the tutorial variant ("One Box, Two Hundred Sites"):** you *cannot remove the bad
customer — they pay.* First lesson of the game: the enemy is sometimes a client.
**Signature threat:** your own customers. A control-panel RCE roots every box simultaneously.
**Signature moment:** one customer installs a plugin that runs an uncached `SELECT * FROM wp_posts`
on every page load and takes down all 40 tenants. **You can only see whose it is if you built the
per-account resource accounting (slow query log) buildable.**
**Visual:** "The Apartment Block." Municipal beige-and-teal / warm sodium-yellow lighting; the server
drawn as a cutaway tenement with hundreds of tiny lit windows, one per customer site, each flickering
with that site's traffic. Noisy-neighbour reads as one window glowing too bright and dimming the
rest of the floor. Signature catastrophe: **one tenant's fire spreads sideways**, a visible flame
crawling along the shared wall. Chord: putty · sodium yellow · oxide red · dishwater grey · mint.
**The meter, precisely:** keep the packed-windows Density Gauge as the *ambient* read, and add an
instrument face — a **density comb**, a row of vertical bars whose spacing closes as oversell rises,
with a red hatched zone at the end. **Ambient read plus precise read, same metaphor.**
**Returning-visit hook:** second visit is the **Long Tail** variant — 2,000 tiny customers, where you
must manage by *policy* because you cannot manage by hand, support tickets scale with customers so
growth is self-limiting until you automate, and **the enemy is your own ticket queue.**
**Interacts with:** §6.5 (oversell slider), §2.12, §4.10, §1.5 `The Renewal Cliff`.

**Variations and additions** — second-pass entry: *Shared Web Hosting — "The Apartment Block" [EARLY, best teaching level]*

- Cheap, high volume. Customers: bloggers, SMBs, hobbyists, grandma's flower shop — price-sensitive, zero learning-curve patience, churn fast if "the site is slow." Characteristic threats: noisy neighbors (one abused tenant degrades all), outdated PHP/nulled themes/malware cross-contamination between tenants, PHP-vuln waves, spam from within poisoning the mail reputation of everyone. Builds: control panel (cPanel analog — a bored clerk at a desk), LVE/cgroup cages, mail transfer agents, mod_security, one fat partitioned web server, a tiny DB. Money: many tiny MRR lines, razor margins, upsell funnels; margin = *density* (100+ sites per box) — but density multiplies the blast radius of every failure; kill one tenant, fine; let a neighbor spam, everyone leaves. Core lesson: **blast radius of shared tenancy**. Look: beige 90s apartment block / dormitory with hundreds of tiny lit windows and laundry-line cables between balconies; each tenant = a window; noisy neighbors flicker and bleed load into the stairwells; cross-tenant peeking = eyes under doors; a spam ring = black ink seeping from one door. (general, sysadmin, gamedesigner, visual)
  - Distinct feel: the mall food court; customers want cheap + "it just works"; churn is constant and mindless (site abandoned, meme host); money: prepaid monthly/annual with upsell domains, SSL, email, backups; thousands of tiny $5–15/mo accounts on one fat server — good early level. (wave2_ceo_fresh)
  - Distinctive rule: **noisy neighbors** — one customer's CPU spike poisons all co-tenants, so you must place a Cgroup Warden per box; feel: cramped apartment tower, fluorescent lights, peeling "Under New Management" poster. (wave2_gamedesigner_fresh)
  - Customers include "one guy running a poker ring off a $5 plan"; risk = one compromised account nukes 300 sites → churn cascade; look: cramped studio apartment full of roommates. (wave2_sysadmin_fresh)
  - Alt name "The Tenement": overprovisioning literally packs more windows in until the building leans and cables spill from the basement; palette: sickly fluorescent green-white, peeling paint, laundry-line patch cables — comedy + clarity in one metaphor. (wave2_visual_fresh)
  - Margin fix: the real killers are per-account panel licenses and ticket load — margin = density × (price − license/account − tickets/account − abuse-desk share); the 2019-style license repricing then *emerges from the economy* as the historical wave that actually broke shared hosting. (wave2_ceo_informed)
  - Modernize the counter-stack: mod_security is a period piece; the actual late-2000s/2010s fix set was CloudLinux LVE + CageFS + PHP-FPM pools (kernel-level per-tenant resource jails) — the LVE "apartment unit" cage upgrade ladder (memory cap → CPU cap → **IO cap** → filesystem isolation) mirrors exactly how shared hosts survived, and the IO tier is where the real peace began. (wave2_sysadmin_informed)
  - Visual: the building IS the dashboard — window-lights as a coarse load bitmap (healthy = warm sparse dots; noisy neighbor = one balcony strobing; total melt = solid red facade block; LOD-safe at every zoom because it's just windows). (wave2_visual_informed)
  - Readability fix: cross-tenant peeking as "eyes under doors" breaks the entry-side law (threats must come from the dark edge) — render peeking eyes ONLY in Threat overlay mode or as door-spy-hole glints added by monitoring towers. (wave2_visual_informed)
  - Noisy neighbors literalized as an *adjacency mechanic* — sites on the same box share fate; one tenant's surge tanks everyone; customers include one guy selling knockoff watches. (wave3_general_fresh)
  - The churn machine: annual-prepay float is the lifeblood (customers prepay 12–36 months; you hold the cash — a *float meter* that funds capex; spend it too aggressively and renewal season bankrupts you); overselling is THE core tradeoff (400 sites/box profitably; each extra box of overcommit raises margin AND noisy-neighbor/ticket risk); fraudulent signups and card testing endemic; look: strip-mall storefront, hundreds of tiny identical shop signs on one building. (wave3_ceo_fresh)
  - Signature mechanic: **noisy neighbor** (one tenant's spike or infection degrades the whole box); buildables: one fat LAMP box divided into partition slots, a softaculous-style installer tower, a cheap support desk; look: cramped studio apartment of computing — bunk beds of accounts. (wave3_gamedesigner_fresh)
  - Threats add WP-plugin vuln waves, mass malware on customer sites, account crack-spam; margin from overselling; feel: cramped, chaotic, sticker-covered — **a hostel, not a hotel**. (wave3_sysadmin_fresh)
  - Identity "The Beige Tenement": one or two big cabinets drawn as a boarding house — dozens of tiny tenant doors on a shared rack face, mail slots, ONE overflowing shared mailbox, neighbors' cables spaghettiing through the same walls, hand-lettered tenant signs taped to things; noisy-neighbor = one room visibly running hot, heat bleeding into adjacent doors; spam from inside the walls; feeling: friendly slumlord; early-level anchor. (wave3_visual_fresh)
  - Signature threats: script-kiddie waves, SQL injection from noisy neighbors. (wave1_gamedesigner_fresh)
  - Business truth: the product IS the upsell funnel (domains, email, SSL, "managed WordPress"); prepaid monthly with brutal price transparency; signature threat: race-to-bottom pricing wars. (wave1_ceo_fresh)
  - Threats add XSS worms hopping between vhost directories, spam from hijacked customer PHP, credential-stuffing the cPanel login; buildables: vhost boxes, one shared DB, quota system (sticky-note quotas), site-isolation jail; the greed mechanic: oversell too hard → meltdowns; the graduation dilemma: customers outgrow the tier — upsell them to VPS (keep them, less margin) or let them churn (better margin, fewer reviews). (wave4_general_fresh)
  - The noisy-neighbor degrades the whole box's PATH SPEED and churns neighbors; spam-from-your-IP blacklists literally BLOCK the customer lane — the threat attacks your entrance road; feel: crowded open floor, beige. (wave4_gamedesigner_fresh)
  - Distinct: density + overselling; cross-site LFI, one bad PHP app tanking the box, malware from nulled themes; customers are forgiving of downtime but NOT of slowness; builds: cPanel/Plesk stacks, LiteSpeed, per-user CPU/IO cages; big margin if you oversell safely; look: thin walls, tenant stickers on doors. (wave4_sysadmin_fresh)
  - Visual "the tenement": a lived-in apartment cross-section — every tenant a tiny site with its own fairy lights, plants, and clutter on shared hallway pipes (the bus); noisy neighbor = literal soundwave ripples; warm, comedic, crowded. (wave4_visual_fresh)

### "Four Hundred Identical Sites" / "Managed Everything" / "White Glove" — Managed WordPress / managed app
Your fleet is a monoculture. One fix fixes everything; one vuln breaks everything.

**How it works:** New rule: **you are responsible for the customer's application, not just the box.**
Their bad plugin is now your outage. The level mechanic is **the Update Button**: pressing it patches
400 sites and breaks an unknown ~2% of them; not pressing it leaves 400 sites exploitable. Staged
rollout is the unlock, and the level exists to teach it. Support burden is the scarce resource;
highest margin, highest attention cost. **Twist: every defensive action can also break a customer —
the highest false-positive-cost level in the game.** **Dominant verb: Commit.**
**The business version ("Premium Pivot"):** deliberately *shed* cheap customers to raise ARPU 10×.
Introduces **negative-churn mechanics** — you voluntarily fire customers and it improves your score —
and white-glove migration-in as a buildable. Win: raise ARPU from $6 to $60 while keeping absolute
gross profit flat or better.
**Visual:** "The Boutique." Warm rose/cream, fewer prettier customer sites each drawn as a framed
gallery piece. Signature meter: **Plugin Jenga** — each site's stack drawn as a wobbling tower of
mismatched plugin blocks. **Render it as a static stack with a computed lean angle** (lean = version
mismatch count), not a physics simulation: past 12° it gets a wobble animation and the topple is a
canned 1-second animation. Cheaper, controllable, and it reads better than physics would.

**Variations and additions** — second-pass entry: *Managed WordPress Hosting — "The Nursery" [EARLY/MID]*

- Shared hosting's polite older sibling / theme-park version: you host *only one app*, excellently; customers pay 10x for "expert care" — so the support ticket IS the product surface; the pro move is automating care; shows the premium-vs-commodity pricing lesson in miniature. (wave2_ceo_fresh, wave2_sysadmin_informed)
- Everything is about a single dependency graph: one plugin pushes a bad update and 40,000 of your sites break at the same minute (real event, every year); your *revenue* is correlated to a third party's code quality you don't control. (wave2_sysadmin_informed)
- Threats: plugin vuln du jour sweeps, WP-JSON abuse, xmlrpc pingback amplification (a WP-native reflection vector), memory-hungry page-builder bloat; mechanic: the auto-updates tower applies patches globally, but 2% of sites break → ticket storm; staging environments + auto-rollback ("we update plugins so you don't"). (wave2_sysadmin_fresh, wave2_sysadmin_informed)
- Look: a greenhouse/bonsai nursery — every tenant a potted plant; the bad-update storm wilts them in unison; pruning shears = rollback; natural sequel level to the Apartment Block. (wave2_sysadmin_informed)
  - A swarm level: thousands of tiny near-identical sites; one plugin vulnerability propagates across your fleet like wildfire unless you have auto-update, isolation, or canary-buildables; "managing updates for 10,000 clients" ops load as a staffing mechanic. (wave3_general_fresh)
  - The margin darling: $30–500/mo on shared rails; agency partners (one agency = 40 sites = channel sales); the famous-plugin exploit drop makes every unpatched customer site a liability — auto-patching upgrade is the counter; staging/preview as buildables; high-stakes churn: these sites are customers' *livelihoods*, downtime converts to rage fast; the great early-mid pivot from shared. (wave3_ceo_fresh)
  - WP-specific buildables: auto-updater tower, plugin-scanner turret, object-cache nodes; constant CVE waves against the top 5 plugins; money: 10x shared pricing on the same underlying surface. (wave3_sysadmin_fresh)
  - Hyper-niche: everyone is the same customer with the same needs — but the plugin-vuln meta means a single CVE threatens the ENTIRE customer lane at once: correlated-failure TD, all eggs in one basket, ON PURPOSE, because it prints money until the day it doesn't. (wave4_gamedesigner_fresh)
  - Auto-updates that break 30% of sites = your bad-deploy mechanic personified; brute-force wp-login sieges; support chat widget (staff) as a buildable; combos with shared (its natural upsell child); great humor veins. (wave4_general_fresh)

### "Node 14 Is Full" — VPS / cloud instances
RAM is the binding constraint and overcommit is the temptation.

**How it works:** Live migration is the hero tool (move a VM off a dying host with no downtime) and
also the villain (a migration storm saturating the storage network). The host node is a blast radius:
one node dying takes 60 customers at once. Fraud signups, miners, and DDoS-origination abuse arrive
with the territory. **Dominant verb: Tune.**
**The demand model ("LowEnd Summer"):** your demand comes almost entirely from **one deal
community**. Introduces **Reputation-as-demand** — the signup lane literally opens and closes based
on your forum standing — plus flash sales. Your customers benchmark you publicly and post the graphs,
so **overselling RAM is instantly visible**. Everyone's price is public. Win: survive a competitor's
suicidal $7/year offer without matching it.
**Visual:** "The Glass Hive" / "The Egg Carton." Clean azure and slate; hypervisors as glass trays,
VMs as identical rounded tiles you can pick up and magnet-snap between trays (live migration as a
tactile verb). The look is *interchangeable parts*. Signature meter: **Overcommit Overlap** — VMs
visually clipping through each other. Catastrophe: noisy-neighbour bleed, one VM swelling and
physically crushing its neighbours' volumes. Chord: slate · ice blue · white · graphite · cyan.

**Variations and additions** — second-pass entry: *VPS / Cloud — "The Hotel Corridor" [MID, core]*

- Customers: developers, startups — self-service, provisions at 3am, *read docs*, bounce on the first 500, pay per-instance/hour (churnable), evangelize if impressed. Threats: hypervisor escapes (rare-catastrophic, boss-tier), abuse signups, quota-gaming, GPU scalpers, brute-force SSH, API-key thieves spawning miners in your account, customers DDoSing each other, compromised neighbors attacking outward. Builds: hypervisor layer = a *meta-tower* slicing one physical node into many virtual ones (defense gets "sliced" too — a weakness), cloud controller, SDN, snapshots, block storage, auto-scaling groups; the control panel itself is a tower (it automates everything). Money: metered — revenue ticks per CPU-second/GB served; every GB you provision costs, every GB customers use earns; margin management *is* the game. Look: clean modular cubes / shipping containers crane-stacked in real time, blue-white diagram aesthetic, elastic dashes for VM boundaries; racks read as hotel floors of numbered glowing doors (VMs) — thin provisioning literally squeezes figures in their rooms; migration = a door slams and a figure is carried down the hall mid-stride (dropped figures = downtime); per-door meters drip coins; empty humming rooms = overprovision waste; corridor carpet, brass service elevators, concierge desk for support. (general, sysadmin, gamedesigner, visual)
  - The virtualization layer becomes a buildable AND a risk: the hypervisor is a single point of failure whose collapse nukes every VM at once; self-provisioning via an API panel means automation spawns both servers AND misconfigurations; autoscaling runaway bills. (wave2_general_fresh)
  - Business angle: customers read benchmarks and comparison tables; hourly metered vs monthly flat is the game's first real pricing-strategy layer; churn driven by a bad month (performance) and by a competitor's blog post; unlocks: autoscaling groups as "swarm" buildables. (wave2_ceo_fresh)
  - Placement *inside* a host matters: a live-migration tower rebalances; each door carries a tiny personality flag; money per-slice recurring. (wave2_gamedesigner_fresh)
  - The metadata service (169.254.169.254) as a literal treasure chest attackers raid; escape visual = a guest punching through a wall; autoscalers as living things. (wave2_sysadmin_fresh)
  - Alt identity "The Loaf": physical blades drawn as sliced loaves/egg-cartons, each guest VM a translucent colored cell with its own tenant flag; the hypervisor is a glass lid over the tray; noisy neighbors = one cell shaking its walls; palette: cool grey chassis + candy-bright guest gels. (wave2_visual_fresh)
  - The everyday horror isn't hypervisor escape (rare), it's storage: **thin-provisioning death spiral** — a 120%-overcommitted cluster hits 100% real usage at 3am and *every VM on the pool freezes simultaneously* (the single most common catastrophic shared-storage outage in the wild). Mechanic: a pool-fill meter *below* the rack view; snapshot chains and backup runs visibly accelerate it; "storage vMotion" (live-migrating a VM's disks) is the counter. Also the noisy-neighbor escape route: live-migrate VMs off a hostile host (bandwidth cost, risk window — *why* the HA cluster is a tower). (wave2_sysadmin_informed)
  - Door-state icon set makes every VPS state legible from the corridor without UI: DND hanger = maintenance mode, luggage piled in hall = disk full, card-key flicker = auth failure, taped-off door = quarantined VM, checkout cart = migration in progress. (wave2_visual_informed)
  - Core mechanic: the hypervisor layer is a buildable you must *feed* from RAM/CPU pools; the overcommit ratio is a slider trading profit vs noisy-neighbor blast radius; feels like an apartment tower with identical suites. (wave3_general_fresh)
  - Developers are the market: CAC ≈ zero IF reputation is high (devs self-serve; tutorials and community do the selling — the DigitalOcean model: **documentation as a marketing tower**); they leave instantly on any visible lie (a hidden CPU limit discovered on Reddit = review bomb); price transparency is a strategic choice — hidden fees convert worse here than anywhere; support: low volume, high severity. (wave3_ceo_fresh)
  - Signature: **the hypervisor is the core** — a literal protected object; VM-escape threats target the crown jewel (plus side-channel speculative attacks); customers *read the status page* (devs notice everything); capacity oversubscription is a gamble mechanic (sell more slices than you have — great until it isn't); buildables: hypervisor nodes, image registry, auto-scaler. (wave3_gamedesigner_fresh)
  - Your tenants launch the DDoS *at* everyone else; API-key thefts; look: clean corridors, numbered doors — "half the doors are doing something illegal." (wave3_sysadmin_fresh)
  - Identity "The Hotel Rack": one physical server as a multi-story hotel cutaway — each floor a VM with numbered door, tenant silhouette, and a mini-interior you can peek into; a shared "hypervisor lobby" at the base controls the elevators (CPU scheduling); bleed between rooms = thin walls you can watch a noisy neighbor punch through; VM escape = a figure crawling through the ceiling; palette: clean mid-blues, wayfinding-signage aesthetic. (wave3_visual_fresh)
  - Money: hourly, auto-recurring, refunds. (wave3_general_fresh)
  - Money: hourly metered — revenue grows *during* the level as instances run; killing a misbehaving instance is also income loss (a built-in conflict!); threats add API-key leaks, DDoS against customer IPs, "mining botring" abuse; builds: metered-billing engine, API gateway. (wave4_general_fresh)
  - The "grid expansion" type: customers rent cells and cells you don't fill are idle upkeep; container escape = a compromised VM starts attacking ADJACENT VMs — an internal enemy spawner!; players learn reserved vs spot pricing. (wave4_gamedesigner_fresh)
  - Distinct: *isolation is the product*; threats: snapshot-filling disks, spam bots on your IP ranges; builds: block-storage cluster, control-plane panel; look: identical cages with a control-plane "brain" glowing above — the backbone of many scenarios. (wave4_sysadmin_fresh)
  - Visual "the capsule hotel": same building but modular — identical glowing pods on rails; live-migration = a pod slides along its track with its occupant sipping coffee; cooler, clinical blue-white; tenants wear name badges. (wave4_visual_fresh)

### "Root Is Theirs" — Dedicated servers / bare metal
The level's twist: **you cannot fix your customers' boxes.**

**How it works:** You can only see traffic, power, and IPMI. When a customer's server starts
attacking someone, your options are: email them, null-route them, or power them off via IPMI. That's
it. A level entirely about acting through a keyhole. Simple economics, low support, low margin %,
high revenue per box, and 4-hour hardware-replacement expectations. **Dominant verb: Observe.**
**Visual:** "The Stable" / "The Workshop." Gunmetal + amber; each customer owns a whole visible
machine with their name on label tape, a visible asset tag, a distinct front bezel, scratches,
mismatched vendor colours, an ear that's been re-drilled. **You own the metal and the art says so.**
Fewer objects, more detail per object — **and the rule that delivers that is: dedicated levels run at
Z1 as their home altitude.** The customer name on label tape is **hand-written in the Handmade
Layer**, which quietly says these machines were set up by a person for a person. Signature meter:
**Provisioning Time**, drawn as a physical OS-install screen on a crash cart. Chord: gunmetal ·
brushed aluminium · safety orange · oil-stain brown · green LED.
**Interacts with:** §7.8 (keyhole mode).

**Variations and additions** — second-pass entry: *Root / Bare-Metal Rental — "The Car Lot"*

- Customers want raw control; you hand over whole machines. Twist: zero visibility into what they run — random "noisy neighbor from hell" events; abuse complaints arrive like letters. Defense = acceptance screening + a deposit system. Money: high margin, simple builds. Good middle-management type bridging shared→cloud narratives. Look: a warehouse of naked chassis still ringed with packing tape; customers walk the row kicking tires like a used-car lot; leasing one = a forklift slides it into a rack; no VM doors anywhere — the emptiness of the virtual layer is the point. (general, visual)
  - The patience game: 20-40 minute provisioning delays per server (real!), stock/inventory risk, high single-tenant revenue and correspondingly high churn pain; customers either love you forever or scream; pairs with the GPU economy as its humbler cousin. (wave2_ceo_fresh)
  - Physical provisioning delays as gameplay: a new server takes real minutes to "rack" — a queue with a forklift animation; fewer, heavier customers; threats: failed disks (RAID mechanics), RMAs, truck-roll dispatch as an action card. (wave3_general_fresh)
  - An inventory business: pre-buy fleets of server SKUs (guess demand 2 quarters ahead — a supply-chain minigame), rack them, fill them; utilization drives profit; signature events: a component supplier discontinues your fleet; a customer wants a GPU in a CPU-only DC; bridges shared→colo understanding. (wave3_ceo_fresh)
  - Bare-metal dedicated: money is monthly contract, human provisioning — the least elastic but most trusted product. Customers: database-heavy and latency-critical. Bridges colo and cloud as a mid-game product. (wave1_ceo_fresh)
  - New — Bare Metal as a Service: rent dedicated iron WITH automation; threats: provisioning races, drive firmware bugs, exposed IPMI; customers wanting performance without VM overhead; bridges colo and cloud — a good transition-level. (wave4_sysadmin_fresh)
  - Visual "the vending machine of servers": racks with glass fronts; a customer's job drops a whole pre-configured server into place from a gantry like a claw-machine prize — satisfying automation spectacle. (wave4_visual_fresh)

**Variations and additions** — second-pass entry: *Server-Bidding Flea Market — budget bare metal [EARLY-MID variant]*

- Customers arrive with "requirements cards" (need X RAM, Y GPU) and your buildables are secondhand market lots — cheap and unreliable (hardware failure odds up), but margin heaven if you spec right; a budget-deck TD variant of the Car Lot. (wave4_gamedesigner_fresh)

### "Amps and Aisles" / "Cage 7" / "The Landlord's Grid" — Colocation landlord
Your customers are *other engineers* who bring their own gear into your building.

**How it works:** New rule: **you don't control the gear.** You sell space, power, cooling,
cross-connects, and remote hands. Threats become: a tenant overloading a circuit, a tenant blocking a
hot aisle with a badly-placed switch, a tenant's unsecured cabinet, a tenant whose "please reboot the
server in rack 7" request is ambiguous, a tenant quietly running a mining rig that blows your power
budget, a tenant's consumer-grade PSU failing violently, a space heater in the build room, a
social-engineered "I'm here from Dell to swap a drive," tailgating at the mantrap, and a tenant who
stops paying and whose gear you **legally cannot touch for 90 days** while it consumes your power.
Power detail that matters: **a 20A circuit is derated to 16A continuous and tenants always forget
this.** **Carrier density is your product**: the more networks in your meet-me room, the more tenants
you attract — a genuine network effect that grows slowly and then compounds. **Dominant verb:
Negotiate.** **Teaches: you will have to fix things you are not allowed to touch.**
**The three indirect verbs (removing agency needs something to do instead):** keyhole levels are a
great *difficulty* axis and a terrible *fun* axis if there is nothing to do. Colo must always offer:
1. **Instrument** — you can always add *your own* telemetry at the boundary: port counters, PDU
   metering, temperature. You cannot see inside the cabinet; you can absolutely see what it draws.
2. **Negotiate** — a ticket/conversation system with a tenant, with tone options and a relationship
   meter. **This is the level's combat.**
3. **Enforce** — the escalation ladder: notice → warning → billed overage → circuit cap → port
   disable, each with a legal and reputational cost. **A ladder makes the powerlessness tense rather
   than flat.**
**The three commercial mechanics the level was missing:**
1. **The ramp** — nothing bills on day one (see §1.12 `The Ramp`).
2. **The escalator** — 3%/yr baked into the lease. A five-year deal is worth ~15% more than it looks,
   and forgetting to include one is a permanent margin leak.
3. **The power billing model** — committed amps (predictable, strands capacity) vs metered
   (efficient, volatile) vs flat-per-cabinet (simple, and you eat the density risk). **This is *the*
   colo pricing decision and it is a perfect slider.** Plus: **tenant credit quality affects your
   building's valuation**, so signing a shaky startup at a high rate can lower your company's worth
   while raising revenue.
**The two daily realities that were missing:**
1. **The access-list problem.** Every tenant has a list of people allowed into their cage, and the
   list is never current. A tenant's contractor arrives at 2am with a truck and is not on it, and the
   tenant's authorized contact is not answering. **You are the one who says no, at 2am, to someone
   whose business is down.** A recurring decision card with no good answer.
2. **The deliveries.** Tenant gear arrives at your dock addressed to a person who doesn't work there,
   with no cabinet number, in seven boxes of which one is missing. Receiving, storing and staging
   other people's hardware is a real billable service line and a real cost.
**Signature moment:** **"Whose Cable Is That?"** — a cable in the overhead tray is unlabelled,
running to a cage decommissioned three years ago, and may or may not be carrying live production
traffic for a customer who no longer exists in your billing system.
**Second signature moment:** a tenant who is a bulletproof host gets your entire building's IP space
listed by a major blocklist. Do you evict a customer paying 30% of your revenue?
**Visitors:** prospective tenants who physically walk your building (§3.3).
**Visual:** "The Landlord." Concrete grey + hazard yellow. **The defining gag: you cannot see inside
your customers' cages.** Tenant cages are frosted/mesh volumes with silhouettes only; tenant gear is
rendered in a deliberately *foreign* art style (different faceplates, chaotic cabling, one guy's rack
with LED strips and an anime sticker). **Tenant gear behind mesh is lit only by its own LEDs plus
spill from the aisle, never by your room lighting — the darkness is the epistemic position, not a
filter.** The HUD shifts from "server health" to "power, cooling, access, floor." Chord: concrete
grey · galvanized steel · caution yellow-black hatching · cage-mesh navy · badge-reader green.
**The meter as an action:** the **Cabinet Power Ledger** should be a **clamp meter you physically
attach** — a click-to-inspect action with a 0.5s animation — rather than a permanent readout, because
metering a tenant *is an act, not a given.* **That single interaction teaches the whole colo
relationship.** Catastrophe: a tenant trips a shared breaker and the cascade darkness spreads through
*other people's* racks.
**Interacts with:** §7.8 (unmanaged tenant objects), §6.6 (occupancy, power resale), §4.10, §1.12
`The Ramp`, §1.12 `Anchor Tenant`.

**Variations and additions** — second-pass entry: *Colocation — "The Estate Game" [MID/LATE]*

- Inversion: the servers aren't yours. Customers own the boxes; you own the building, power, cooling, bandwidth. You defend the *facility*: cage doors, power feeds, cross-connects; your tenants' boxes are unmanaged black holes you can't patch. Threats are facility-shaped: water leaks, HVAC failure, bad power feeds, physical badge attacks / fake-technician tailgating, "remote hands" ticket floods at 3am, tenants launching attacks (abuse complaints hit YOUR upstream). Customers: other companies and small hosts — patient but furious about SLA credits. Money: flat monthly per cabinet + power + cross-connects — most stable income, lowest margin ceiling; rent/space/power wholesale vs retail markup; capacity planning IS the level (RU — rack units — is a hard resource). Feel: real-estate sim inside a TD — leases, floor plans, tenant drama; rows of *customer-branded racks you don't control*, and many "towers" belong to customers while you defend the shared infrastructure around them. Visual: dark hall, cold aisles, LED constellations, forklift hum; your rack is an island and the DC a landlord's landscape with lease plots that glow when available; giant metered power/cooling pipes come from off-map and the landlord's hand adjusts prices; cargo-door ambushes and a badge-scan mini-game. (general, sysadmin, gamedesigner, visual)
  - Revenue = rent per U; threats include "smart hands" mistakes and the metered-power bill; customers are tech-savvy tenants who yell at YOU when YOUR power blinks; look: long aisle perspective, doors, mantraps, a lobby. (wave2_general_fresh)
  - B2B wholesale texture: revenue per kW-month and per rack-unit; threats are physical + network (DDoS at the peering edge); customer behavior: low churn, brutal SLA penalties, "they argue about their power draws like teenagers about chores"; good scale-jump level. (wave2_ceo_fresh)
  - The player defends a *building* more than a stack: physical security, smart-hands staffing; fiber cuts; feel: cold-aisle isometric, clipboard UI, forklift mini-event. (wave2_gamedesigner_fresh)
  - Alt identity "The Hall of Cages": camera is a traveler's eye down an endless aisle; other tenants' cages pass by with silhouette figures and rival logos; your cage door swings open for build moments; everything chain-link, cage labels, floor tape; palette: industrial sodium-orange pools on dark. (wave2_visual_fresh)
  - Real revenue stack: MRC per cabinet/RU + power (minimum-kW reservation + metered overage) + NRC one-time install fees (immediate cash) + cross-connect annuities + remote hands ($/visit, a real profit center) + escalators (3-5% annual contractual bumps) — layered, contractual, boring: perfect late-game texture. Also anchor tenants (a hyperscaler filling 30% of your hall at ugly rates): landlord economics — their presence gates your *ability* to lease the rest (density limits, meet-me capacity). (wave2_ceo_informed)
  - The landlord *is* the level: add the three real colo pain systems — (a) remote-hands tickets as a *repair-speed resource* ($15/15-min blocks), (b) LOA/CFA paperwork gating who can touch your cage (and the funny/sad reality that *you* can't get in after hours without filing ahead), (c) your customers' SLAs are hostage to the *landlord's* generator — which you can see but not maintain; the "estate game" needs the landlord's AI moving around the edges. (wave2_sysadmin_informed)
  - If tenants' boxes are unmanaged black holes, players watch breaches helplessly and the verb set vanishes — sell *advisory* gameplay instead: a "remote hands / consulting" tower that probabilistically hardens a tenant, an upsell to managed service (become the MSP *within* the colo level), and make tenant-compromise a slow, visible event with a window to advise, isolate, or let-burn-for-contract-ends. Agency always. (wave2_gamedesigner_informed)
  - Tenant-branding engine: procedural tenant logos + color chips seeded per save so 20 customer racks are actually distinguishable; from mid-zoom the floor reads as a patchwork quilt of leases — and a tenant eviction visibly un-patches a square. (wave2_visual_informed)
  - "Landlord's hand adjusting prices" risks a tone break — the hand appears ONLY in the Power/Money overlays as a gauntlet-glove valve wheel (diegetic control metaphor, not a haunted image), becoming a beloved cutscene character at invoicing time. (wave2_visual_informed)
  - You can't touch tenant hardware (privacy), so defense is network-layer + physical access control + *being the one who can pull the plug*; threats: tampered seals, tailgating, "meet-me-room" intercepts. (wave3_general_fresh)
  - You are a landlord of power and space: revenue splits into THREE separately-billed meters — space (per cabinet/cage/U), power (per kW, metered or contracted), bandwidth (committed/95th/unmetered); long 1–3yr contracts, HUGE setup + cross-connect fees; the *remote-hands* revenue twist (tenants pay $/visit for your staff to reboot, trace cable, swap disk — a staff-utilization micromanagement layer); enterprise deals are site tours and cage build-outs. (wave3_ceo_fresh)
  - Signature: **physicality** — customers literally truck in servers; threats include "meet-the-freelancer" access requests, dead drops (a USB left in the lobby), fiber cuts; tenants rarely churn on performance (their hardware, their problem) but will murder you on uptime/power; CapEx heavy; look: cathedral of racks, cold aisles, security doors. (wave3_gamedesigner_fresh)
  - Your customers' disasters bleed into YOUR reputation ("your datacenter" — it isn't, but they don't care); the most boring, most reliable revenue in the game — late-game ballast. (wave3_sysadmin_fresh)
  - Landlord-contract meta: your building lease renegotiates every N waves on a market index; being the colo AND the subletter ("Rack Sublet Desk") creates a full real-estate game-tree; add a "vacancy rate" gauge beside the utilization meters. (wave3_general_informed)
  - Very sticky revenue (moving a rack is surgery), high capex, LOW support burden; customers: SMBs that outgrew shared but distrust the cloud, plus network-heavy shops; great mid-game "real estate tycoon" flavor. (wave1_ceo_fresh)
  - Distinctive mechanic: you defend assets you cannot modify — cathedral-like halls of *ghost racks* you protect but don't control; the truck-driver unplugs the wrong PDU; remote-hands staff are a unit that WALKS between cages; steady rent, brutal capex, low volatility. (wave4_general_fresh)
  - Tower defense about a *building*: customers are physical tenants wheeling in racks; badge-cloners and tailgaters at the mantrap — a literal chokepoint door — plus the usual network layer; builds: cages, mantraps, redundant PDUs; feel: concrete, cable trays, cold aisles. (wave4_gamedesigner_fresh)
  - Distinct: you rent space, not compute; threats: bad power, cooling failure, misbehaving neighboring tenants' gear, cable mistakes; builds: racks, PDUs, crays (cross-connects), bandwidth mix; look: cold-aisle containment glow. (wave4_sysadmin_fresh)
  - Three meters, three bills (the realistic colo play): space per rack/U-month; power per amp or kW with overdraw penalties — fight over CONNECTED vs USED power; cross-connects — a literal patch cord at $150–300/mo pure margin, the best unit economics in the industry; leasing cages you can't fill; remote-hands tickets billed at $75/incident; customers: other hosting companies. (wave4_ceo_fresh)

### Colocation — which side of the cage the player is on — *CONFLICTING*

Both documents ship a colocation level and both call it the estate game, but they disagree about who
the player *is*. The dispute is not flavour: it decides the verb set, the money model (rent collected
versus rent paid), the threat table, and whether the building is an asset you own or a landlord you
are at the mercy of. Resolve it per level, or ship both as paired levels; do not average them.

#### Position A — Landlord: you own the building *(master)*

The position is the entry above, **"Amps and Aisles" / "Cage 7" / "The Landlord's Grid"**, kept in
full: you sell space, power, cooling, cross-connects and remote hands; you do not control the gear;
revenue is MRC per cabinet plus power, NRC install fees, cross-connect annuities, remote hands and
contractual escalators; the dominant verb is **Negotiate**, and the difficulty axis is that you must
fix things you are not allowed to touch. The opencode document states the same side explicitly:

- Variant A (landlord): you own the building, power, cooling, bandwidth; your tenants' boxes are unmanaged — you defend the facility. (master wave-1 merge; wave2_general_fresh; wave2_ceo_fresh)

#### Position B — Tenant: you own boxes in someone else's building *(opencode)*

- Variant B (tenant): "You don't own the building — you own boxes in someone else's"; threats are the human layer (wrong rack pulled, fake-ID intruders, smart-hands mistakes) plus shared power/cooling events; money is per-U rent *paid by you*, power metered, remote-hands fees; look: endless corridor of cages. (wave2_sysadmin_fresh)
- Variant B visual identity "The Hangar of Cages" (tenant-side): vast dark industrial hall, your build inside a chain-link cage with a badge reader; neighbors are opaque cages with hints of RGB glow, weird antenna farms, one cage that's suspiciously silent; your racks are fully custom (you built them), the *room* isn't yours: raised-floor tiles, cable trays overhead, the DC's giant shared air handlers cross the top of the screen like weather; tenant-arrival = a person literally wheeling a rack case to your cage; palette: steel + sodium-orange ambient. (wave3_visual_fresh)
- Variant B visual "the storage unit with fancy doors" (tenant-side): you rent black monoliths in someone else's warehouse — your racks are decorated/personalized (stickers, zip ties, your logo) among anonymous neighbors; the building's shared power/cooling are huge overhead ducts you can monitor but never touch; humble, gritty industrial — "own hardware, not own building." (wave4_visual_fresh)

### "Cage Match" / "Build-to-Suit" / "The Shell" — Wholesale / hyperscale shells
You're building shells for one enormous tenant, on a 20-year term.

**How it works:** New rule: almost no combat; it's a construction and contract game. Milestones,
lead times, commissioning, penalties for late delivery, and a single customer who can walk. Slow,
capital-heavy, terrifyingly concentrated. Long-horizon, high-stakes, zero-twitch. Threats are supply
chain (a transformer with a 74-week lead time), permitting, and a **local community that does not
want you**.
**Visual:** "The Shell." Architectural blueprint blue-on-white; construction art language —
unfinished slab, exposed rebar, plastic sheeting, survey stakes, a crane. **Progress is literally the
building getting built**: walls close, floor tiles go down, the room finishes. Your units are
megawatts, not servers, so the HUD swaps server counters for a **power one-line diagram** as the main
view. Visitors are a single enormous tenant whose arrival is a motorcade. Catastrophe: commissioning
failure — the building is done and the power isn't. Chord: raw concrete · rebar rust · high-vis lime
· tarp blue · substation arc-white.

### "Prime Time" / "Tick Rate" / "The Arena" — Game server hosting
The most different level in the game. Everything happens between 6pm and midnight local.

**How it works:** New rule: **latency is binary and merciless.** The metric is not uptime, it's
**tick rate and ping** — a server that is "up" at 140ms is dead to the customer, and jitter is worse
than latency. Above ~80ms players rage-quit; a 20ms ping wins their whole clan. Geography becomes the
whole game: you place capacity near player populations, and **latency contours on the map are the
terrain.** Customers are communities with Discords who will move 200 players to a competitor over one
laggy weekend; loyalty is brutal and instant. Contract length is monthly or hourly, so a bad weekend
is felt on Monday. **Dominant verb: Place & Connect.** **Teaches: p99 is the product; geography is
latency.**
**New resource: the tick budget.** Each game server instance must complete a simulation tick in ≤ X
ms. **CPU single-thread speed matters more than core count** — you buy high-clock, low-core boxes,
the opposite of every other level in the game.
**Visitors are sessions, not requests:** players *stay*. A server-browser listing is a buildable that
attracts both players and scanners.
**Signature threats:** booters/stressers aimed at *individual players to win a match* (they're
attacking your customer's game session from inside your network, not your infrastructure), cheat
clients, RCON brute-force, exploit-based crash packets, server-browser scrapers, a DDoS aimed at
*one player's* IP that hits your whole box, **UDP amplification reflection where your servers are the
reflectors**, mod-update day breaking 900 instances at once, and the **Empty Server Spiral** (a
server that dips below a population threshold empties out and never recovers). **Twist: popularity is
a targeting beacon — your best server is the one under attack, always.**
**Buildables:** per-instance CPU pinning, UDP-aware DDoS scrubbing (hard — you cannot just drop UDP),
anti-cheat integration, automated restart on tick-drop, regional PoPs.
**Economics:** tiny ARPU, enormous volume, brutal churn, extreme seasonality. **The Hype Cycle** —
a new game launches, demand 20× for 6 weeks, then 85% evaporates; you can pre-build on speculation,
and guessing right prints money while guessing wrong leaves you with idle hardware. Fraud is
endemic: stolen-card signups, chargebacks at 2–4% of revenue. **DDoS protection is a product feature,
not just a defense.** Support tickets arrive at 2am from 14-year-olds. **Win: end the level with cash
intact after the hype collapses — i.e. don't buy 40 servers at the peak.** Add
**streamer/influencer partnerships** as a paid acquisition buildable.
**Visual:** "The Arena." Deliberately loud, RGB everything, neon, scoreboard typography, crowd-noise
particles. **Palette correction:** the original "hot magenta-and-lime" collides head-on with the hue
ledger — magenta is reserved for hostile traffic, and a level whose *décor* is magenta makes threats
invisible. Shift to **hot pink-violet and lime with the magenta band excluded**, and put the
saturation in the **lighting** rather than the surfaces so the Flow layer still wins. Visitors are
player avatars with name tags and ping numbers floating above them. Signature meter: the **Tick-Rate
Metronome**, a horizontal pulse bar across the top of each game node that beats at server tick rate
and visibly **stutters and smears** under latency or CPU contention — **you feel lag as a broken
rhythm before any number changes.** It must live both **on the node in world space and in the HUD's
instrument cluster**, because you will watch it constantly. Catastrophe: a lag spike drawn as every
avatar freezing mid-stride then rubber-banding backward.
**Returning-visit hook:** the second visit is multi-region, and is explicitly unwinnable without the
anycast you learned in the DNS level.
**Interacts with:** §3.3 (players arrive in parties), §4.10, §2.12.

**Variations and additions** — second-pass entry: *Game Server Hosting — "The Arcade" [MID, best *loud* level]*

- Customers: clans, studios, communities, teenagers with zero patience and megaphones — forum reputation matters more than uptime; a single 200ms spike becomes a viral clip. Traffic = player joins: fast, latency-sensitive bounce — a join queue that visibly ages and explodes = churn; they arrive roaring at 6pm and churn instantly on lag. Threats: UDP floods, DDoS-by-teenager ("you lost the match"), booter extortion, game-protocol exploits, join-spam, kickbots, cheater networks and cheater-bot lobbies, stream-snipers, toxic-community swatting, launch-day floods, API abuse, anticheat kernel-driver blowups. Builds: low-latency NICs, DDoS-scrubbed game ports, tick-rate servers, lobby shards, region POPs, Discord-webhook alerts, anti-cheat. Money: monthly rentals/subscriptions + microtransaction peaks + burst servers for releases; refund waves after incidents; big seasonality (a new game launch = the launch-spike level). High-value, low-patience. Look: neon RGB everything, lobby-UI motifs, chibi gamers sprinting with headsets swinging, rubber-band animation literally showing lag, ping numbers floating over heads, energy-drink neon; rage-quitters depart in puffs of red steam; a "streamer raid" = a sudden VIP-sized figure leading a conga-line crowd; surge microtransactions raining fast small coins. (general, sysadmin, gamedesigner, visual)
  - Latency is the ONLY stat that matters; traffic arrives in synchronized party-clumps (a squad bounces together if one slot lags); money: premium per-slot pricing + "priority region" upsells; look: HUD-inspired, server maps named after game levels. (wave2_general_fresh)
  - Real-time, rage-sensitive, refund-happy: customers rent bare-metal boxes for counter-strike clans and survive-the-night worlds; one lag spike becomes a TikTok; money: prepaid packs, seasonal surges (new game launch = gold rush), affiliate mod-communities as a marketing channel; pairs with the DDoS theme. (wave2_ceo_fresh)
  - Regional shard placement (multiple little cores) instead of one core; cheaters mining server logs; player dots with ping numbers over their heads. (wave2_gamedesigner_fresh)
  - Alt identity "The RGB Cave": a dark room lit almost entirely by strips and LED diffusion; customers are chibi avatars with headsets; latency rendered as a literal ping meter in arcade high-score font; spikes = a boss-rush wave; palette: void black + saturated RGB cycles. (wave2_visual_fresh)
  - The actual model is per-slot plan tiers ($6/10 slots with a max-players cliff), modpack support cliffs (every "big mod update day" is a support raid), refund-window abuse, and *season* churn (a game goes viral, then dead — your SKUs die with it); add your customers' own playerbases as a demand meter — you're hedging other people's product-market fit, which is the entire real business. (wave2_ceo_informed)
  - Visual fix: "rubber-band lag" will be unreadable with 100+ gamers and nauseating in bursts — replace with per-figure frame-rate drop plus a localized "lag aura" (a stuttering violet zone over the affected shard); reserve full rubber-band physics for ONE named streamer per event so the gag keeps its punch. (wave2_visual_informed)
  - Low-latency is the whole game: a literal tick-rate meter; distance-to-players matters (ping = time-to-bounce); threats: DDoS-to-lag, cheat-tool communities scraping your IPs, data-center routing drama; money: slots per server — a kicked server means an instant refund riot; look: esports arena / LAN party. (wave3_general_fresh)
  - Bursty fandom: per-slot subscriptions ($1–15), season passes for events; a single angry Discord with 20k members can nuke reputation; abuse economics central — DDoS extortion ("pay 0.5 BTC or your lobby floods — every finals night"); when a game dies, its whole customer cohort churns overnight (diversification matters); funnel mechanic: an influencer streaming on your servers = a traffic wave worth 10,000 signups. (wave3_ceo_fresh)
  - Signature: **latency is a health bar** — every customer carries a ping budget; the path's total ms is the level's pacing clock (literally: a big ping counter as the "lives" UI); players queue in waves patch-day; streamers are whales; buildables: anti-cheat tower, global anycast. (wave3_gamedesigner_fresh)
  - The booter-for-hire ecosystem: DDoS as *drama*, as a service, priced at $5/hour; swatting rival clans hits YOUR network; 80ms or teenage rage-quitters leave; money: small monthly fees + dramatic one-time "boost" purchases. (wave3_sysadmin_fresh)
  - Identity "The Neon Arena": racks as stage stacks, the lobby as a concourse, players stream in through a tunnel like teams entering an arena; ping rendered as laser-straight green lines between player icons and the server — latency = those lines bending and browning; DDoS as a mosh-pit surge against the barriers; cheaters as crowd members with glitching faces; high-energy interlude levels. (wave3_visual_fresh)
  - "Console war" seasonal event: platform-holder key-validation outages cascade into your servers (not your fault, customers don't care) — dependency-on-third-parties as a weather system. (wave3_general_informed)
  - Fast tiering split the market: budget panel hosts vs. premium bare-metal — low price sensitivity but zero patience; the abuse economy (cheaters, modding) is wild. (wave1_ceo_fresh)
  - Threats add cheat-tool botnets, crashers exploiting netcode, swatting-adjacent doxxing attempts on public IPs; customers *generate* traffic spikes (tournament events); refunds if tick rate drops — the visible ping meter IS the level's heartbeat; builds: high-clock low-latency boxes, tick-rate upgrades, region pops; look: customer sprites with clan banners. (wave4_general_fresh)
  - Gamers churn if the path has >40ms — every tower placement costs "ms", not just money; a rival platform poaches your lobby traffic; signature: the latency meter REPLACES generic "speed". (wave4_gamedesigner_fresh)
  - Latency is God, tick-rate matters; cheaters hammering auth; builds: dedicated cores, anti-cheat, matchmaker; money: per-CCU (concurrent users) with spot bursts on launches; look: arcade/neon server-browser aesthetic, big ping counters. (wave4_sysadmin_fresh)
  - Visual "the arcade LAN party": low-slung dark ambience like an esports arena; gamer customers are chibi speedsters with ping-halos — latency spikes make their halos flash and the runners stumble; loud and playful. (wave4_visual_fresh)
  - Merch-and-momentum economy: revenue spikes with CULTURE events (launches, seasons, updates), not calendars; players prepay in packs, refund on lag, and evangelize for free when you win; DDoS protection that "just works" is THE purchase driver — market it like a weapon; affiliate mod-communities are your ad channel (revenue share — and their drama is your risk). (wave4_ceo_fresh)

### "The Launch Window" — Game hosting, scenario variant
A new game launches at midnight. Demand is either 10× or 0.1× your forecast and you find out at
12:01.

**How it works:** Pre-provision (waste) or scale-on-demand (too slow). Pure capacity-gamble scenario.
Follow-on beat: **Launch Day Decay** — not an attack, a *demand collapse*. You built for 50× and now
you own 50× of idle hardware and its upkeep. **Success is the trap.**

**Variations and additions** — second-pass entry: *Game Launch / MMO Sharding [LATE] (gamedesigner)*

- A game-server specialization where the *level goal* is the launch itself: pre-reg crowds flood at T-0, queue towers, world firsts, then 3 days of sustained load. The most brutal wave design in the game.
  - Full spec so it earns its "most brutal wave design" claim: queue-towers (virtual waiting rooms = buildables that *hold* customers with ETA promises — patience drains 4× slower in-queue, but queue capacity is finite and the overflow stampede is the boss); shard-burst ability (launch a new world shard mid-level: cash + boot delay — the autoscaler's game flavor); phased gates (pre-reg → T-0 wall → first-weekend raid events); character-transfer economy (moving customers between shards = migration gameplay *inside* the level — zero-downtime migration as a mini). (wave2_general_informed)

### "Private Shard" — Community / MMO hosting
Small, passionate, loud customers. One server per community.

**How it works:** Signature mechanic: **drama.** Communities fracture, half the players leave,
someone DDoSes their ex-guild. Non-technical threats dominate. Comedic and cheap to author.

**Variations and additions** — second-pass entry: *Minecraft / Modpack Host — "The Sandbox Farm" [MID-EASY]*

- The game-culture type for a younger read: kids hosting 200-player servers with *mod ecosystems* — every mod is a third-party dependency (supply-chain threat with a joke skin: the "Optifine of doom"), every drama is a raid event, every release day is a wave; customers are minors — pay $5, churn over a lag spike, *post TikToks about you*. (wave2_gamedesigner_informed)
- Builds: mod-pack validators, sub-server sharding, whitelist gates (a rate-limiter you'll actually like); a gift-wrapped teaching level for credential-stuffing and DDoS-by-disappointed-child. (wave2_gamedesigner_informed)

### "Trunk Group" / "The Switchboard" — VoIP / SIP trunking
New rule: **jitter and packet loss, not throughput.**

**How it works:** Visitors are *calls* — long-lived fragile sessions; a dropped call is a total loss,
not a slow bounce. Quality is measured in MOS score, and a bad call is remembered far longer than a
bad page load. Calls arrive in predictable business-hour patterns with a hard 9am spike.
**Dominant verb: Observe.**
**Signature threat: toll fraud** — an attacker brute-forces a SIP extension at 2am Friday and dials
premium-rate international numbers all weekend; you get the carrier bill on Monday for $60,000.
**The attack that costs money directly and instantly** — the fastest-bleeding threat in the game, and
a threat whose damage is a line item on your phone bill discovered a shift later, which is why this
level **teaches monitoring as defense.** Also: one-way audio from NAT/firewall misconfiguration,
invisible to every uptime check; and regulatory 911/E911 obligations.
**Visual:** "The Switchboard." Bakelite black and brass; calls drawn as literal **patch cords on an
operator switchboard**, one per active call, built around a wall of jack-field patch panels. A ribbon
or cord that breaks anywhere is a dropped call; a visible notch is jitter. **Nothing else in the game
is this unforgiving-looking, and that's the point.** Toll fraud is a magenta cord plugging itself in
at 3am with a ticking international-rate meter. Catastrophe: a jitter storm where every cord
vibrates. Chord: bakelite black · brass · cream · signal red · ribbon teal.
**The meter, with thresholds:** MOS as a smooth glow gradient is pretty but not actionable. Use
**three named cord states with hard boundaries** — **Clear** (smooth, bright), **Grainy** (visible
noise in the glow, MOS 3.5–4.0), **Fraying** (the braid visibly separates, below 3.5).

**Variations and additions** — second-pass entry: *VoIP / UCaaS — "The Switchboard, Redux" / "The Call Center" [MID]*

- Distinct metric: **jitter**, not just latency — a voice path that wobbles kills calls even with 0% loss; 150ms one-way is the cliff and a customer with a full patience ribbon *still* bounces on packet variance. Customers: dental offices, clinics, call centers, podcast crews, remote teams — sticky, contract-heavy, instantly furious mid-call. (wave2_gamedesigner_informed, wave2_sysadmin_informed)
- Signature disaster: **toll fraud** — a compromised PBX dialing 40,000 premium-rate international numbers overnight; the money literally pours *out* of the building at line speed while everything looks healthy (the mirror of the cryptominer: they steal compute; here they steal *cash directly*; the invoice arrives like a letter bomb — $40K overnight); counters: call-router egress filters, anomaly detection on outbound CPS, per-account international-call locks. (wave2_sysadmin_fresh, wave2_ceo_informed, wave2_sysadmin_informed)
- Other threats: SIP scanner floods, codec exploits/negotiation hell, echo storms, RTP injection (a call ends with a ransom note spoken in a synthesized voice); E911 compliance is a mandatory buildable and a regulator who punishes *location* errors ("you routed a 911 call to the wrong county" event). (wave2_sysadmin_fresh, wave2_gamedesigner_informed, wave2_general_informed)
- Builds: SBC session border controllers (a tower that *inspects conversations*), RTP media relays, codec farms/negotiator, QoS priority lanes (an explicit "voice beats data" policy dial — dual-flow tension in one switch), jitter-buffer as a "patience reservoir"; number porting = the migration mechanic — customers with *portability* (port-out fights are churn theater; DID hoarding as a mini-RTS over scarce phone numbers). (wave2_gamedesigner_informed, wave2_general_informed, wave2_sysadmin_informed)
- Money: per-minute + per-number/concurrent-call with brutal penalty clauses; one toll-fraud hit can wipe a month; least-cost-routing arbitrage as a live minigame (pick carrier paths per destination per minute — margin is the spread); scam call centers as the abuse-flavored customer. (wave2_ceo_informed, wave2_sysadmin_fresh)
- Look: 1940s telephone exchange meets call-center floor; conversations render as paired thread-lines that fray with loss; a toll-fraud attack is a leech on the trunk line siphoning coins *backward* / the switchboard lighting up like a slot machine while a red arrow pumps coins out the back; couples well with email (both reputation economies). (wave2_general_informed, wave2_sysadmin_informed)
  - Proposed in wave 1 as a variety lever: call-quality jitter as a literal *path-speed* mechanic — a voice call that arrives "too slow" hangs up angry; different QoS sensitivities across types become customer *patience sliders*. (wave1_ceo_fresh)
  - The billing model flips: per-seat monthly, brutally sticky (number porting = switching-cost armor), but toll-fraud exposure can vaporize a month's margin overnight; the sales motion: replace a competitor's PBX quote line-by-line. (wave4_ceo_fresh)
  - Toll fraud is an ANTI-BUDGET mechanic (attackers rent your trunks to place international calls *on your dime* — a direct money leak); customers: call centers, clinics — contract-heavy, QoS-obsessed; builds: SBC (session border controller), media servers, QoS policing; rare in games — fresh. (wave4_general_fresh)

### "Postmaster" / "Deliverability" / "The Post Office" — Email hosting
The scarce resource is **reputation**, which is held by other people and can be destroyed by one
customer.

**How it works:** New rule: your currency is IP/domain reputation — fragile, slow to rebuild, and
destroyable by one tenant. Visitors are messages that must reach an *inbox*, not just your server;
"bouncing" is literal. **The whole tower-defense orientation flips: the defense is outbound, not
inbound — you are filtering what leaves.** New IP space starts cold and must be **warmed**: a literal
ramp-up minigame where you send increasing volume and watch bounce rates. **Dominant verb: Tune.**
**Teaches: some resources are held by third parties and cannot be bought back.**
**Buildables:** SPF/DKIM/DMARC (each a config artifact that can be subtly wrong for months), reverse
DNS, feedback loops with the big mailbox providers, outbound rate limits per account, egress spam
scanning, a warm-up IP pool, **dedicated IP pools separated by customer risk tier (a quarantine pool
for new/risky senders)**, postmaster relationships, and a spam filter with a tunable aggressiveness
slider whose false-positive rate is *displayed* — because losing a real invoice email costs more than
200 spams. Counters are policy and rate-limiting, which anger legitimate bulk senders.
**Threats:** one compromised customer account sending 400k messages at 2am; a legitimate customer who
bought a mailing list; backscatter; a joe-job; your /24 listed because of a *neighbour's* IP; and
Google silently deciding your mail goes to spam with no error and no appeal.
**The level's cruelty:** you can be perfect and still be blocked, and nobody will tell you why.
**Signature moment:** you discover your abuse@ mailbox has 6,000 unread messages, **and that is why
you're on a blocklist.**
**Business framing ("The Deliverability Desk"):** IP reputation is a **balance-sheet asset** that
appreciates slowly and can be destroyed in an hour. **Abuse vetting at signup directly suppresses
your growth rate — the tension is explicit.** Win: 30 days at >98% inbox placement *while still
growing.*
**Visual:** "The Post Office." Manila and postal blue; messages are envelopes on conveyor belts, spam
a torrent of pulped grey junk mail, a blocklisting a giant red **RETURN TO SENDER** stamp descending
on your whole outbound flow. Reputation is drawn as the cleanliness of your sorting hall. Chord:
manila · postal blue · rubber-stamp red · twine brown · sorted-mail white.
**The meter, expanded:** the **Reputation Postmark** is the best type-specific meter in the document
— make it **four small postmarks, one per major mailbox provider, each independently smudging**,
because the real mechanic is that you can be fine at one and blocked at another. The "silent
deprioritization" threat then renders as a postmark that is **perfectly crisp and stamped in slightly
the wrong place.** Delisting is a bureaucratic minigame with forms.
**Interacts with:** §2.12 (snowshoe spammers, silent deprioritization), §5.6 (clean reputation as an
unlock *prerequisite*), §1.5 `Blacklisted`.

**Variations and additions** — second-pass entry: *Email / DNS — "The Switchboard" [MID, surprisingly deep]*

- Two halves of the internet's plumbing. Email threats: spam-botnet waves (one escaped spam drops the reputation meter — reputation is a *global resource* / shared HP bar for the level), phishing, blocklist events (getting RBL-listed = all inbound mail roads turn red until delisting — a mini-puzzle with reputation timers), open relay abuse, spam-complaint waves, RFC pedants. DNS threats: cache poisoning (your resolver serves customers *someone else's* servers), DNS amplification/reflection (your own servers become the weapon in someone else's DDoS — "don't be the gun": defending means refusing to reflect, or you eat the bandwidth bill + blocklist), domain expiry chaos. Customers: the stickiest ever — every business; email never-tolerates downtime; migration pain = loyalty; but bulk churn when reputation tanks. Deliverability is your attractor stat. Money: boringly stable subscriptions, volume, razor thin — invisible until disaster; one blacklist event = mass exodus. Builds: MX clusters, MTA + DKIM signers + SPF/DMARC, greylisting tarpits, RBL-delisting minigame, anycast authoritative DNS, reputation monitoring. Look: switchboard/post-office + 1940s telephone exchange — parcels, stamps, jack-cord patch walls, dot-matrix directory boards; spam arrives as black ink-mold splatting on the facade and reputation = literal building cleanliness; a zone transfer rolls out as printing tape; amplification starts as a breeze at your open resolver and exits as a visible snowballing hurricane. (general, sysadmin, gamedesigner, visual)
  - The reputation game: your currency isn't bandwidth, it's *trust* — a spam-score meter decides whether mail reaches inboxes at all; blacklist = level-fail timer; registry lockout; customers slow to grant you trust, fast to revoke; look: postal sorting office, wax stamps for SPF/DKIM. (wave2_general_fresh)
  - Deliverability IS the product: reputation is a literal resource pool — one spammer tenant poisons your IP ranges and every clean customer feels it as bounced mail; DNS is cheap sticky MRR, email per mailbox; Gmail algo changes as a threat; uniquely anxious. (wave2_ceo_fresh)
  - Reputation is the health bar (not uptime); the tower you build most is reputation recovery (warmup schedulers, DMARC gates); domain-theft; feel: mailroom chaos, red REJECTED banners. (wave2_gamedesigner_fresh)
  - Spammers as *customers* (they pay well and poison the blocklists); DKIM/SPF/DMARC misconfig; zone transfer; catastrophic when it breaks though invisible to end users; great mid level at any scale. (wave2_sysadmin_fresh)
  - Alt identity "The Sorting Office": Wes Anderson symmetry — mail sacks stamped with protocol badges (SPF/DMARC as wax seals), pneumatic tubes as the routing graph, spam arrives as green slime leaking through the door; letters physically walk themselves to the wrong bin if MX is misconfigured; palette: kraft paper, oxblood, brass. (wave2_visual_fresh)
  - Reputation is *earned slowly and starts at zero*: a fresh /24 begins at 0 reputation and must ramp volume over weeks (compressed: days) or it trips spam traps — "instant bulk mail" is a trap choice; distinguish trap hits (instant blacklist, nuclear) from complaint rates (slow bleed): the two failure meters mail teams actually watch; DMARC's ladder (none → p=quarantine → p=reject, each step *requires* all mail authenticated — you can't adopt what you can't audit) is a ready-made three-node unlock. (wave2_sysadmin_informed)
  - Add a DKIM stamping machine that physically embosses outgoing parcels and a tell-tale *unfranked* pile when it jams; RBL "roads turn red" needs a texture channel (hazard stripes + chain) per the colorblind pattern law — red-only blocklists are otherwise the game's most color-dependent signal. (wave2_visual_informed)
  - A public "Sender Score" halo over your MX farm: one spammed-out tenant darkens the halo and every inbound customer email starts routing away — visually, your mail bounces as literal boomerangs. (wave3_general_fresh)
  - Tiny recurring fees at enormous volume (DNS zones at $10/yr sold by the 100k) + premium tiers (DNS failover, DMARC consulting, dedicated IPs); THE mechanic: a shared *IP reputation pool*; counters: vetting (KYC-lite), dedicated-IP upsell, warmup service, a delisting-requests mini-task that costs hours; DNS is also DDoS bait — recursive-DNS hardening = a defensive tower with public-good side effects (status page + RPS graphs as ambience); underrated early game; pairs with everything. (wave3_ceo_fresh)
  - Signature: **reputation is your hit points** — too low and legitimate customers literally cannot find you; spam-blocklist submissions are attacks that damage *nothing but your score*; backscatter floods; phishing sites hosted by abusers on your network; customers (mail servers, resolvers) arrive politely, retry patiently, but leave forever when listed. (wave3_gamedesigner_fresh)
  - DNSSEC RRSIG expiry = a literal countdown bomb per zone; DMARC storms; spam-complaint meters; FTC noise; builds: anycast, secondaries, DNSSEC automation; money: pennies per domain, oceans of it — everyone uses you and only notices when you're down. (wave3_sysadmin_fresh)
  - Identity "The Post Office": a grand sorting floor — inbound mail as physical envelopes on conveyors, DNS records as directory pages/switchboard plugs, MX entries as routing desks; spam = a grey envelope avalanche jamming the slots; queues back up into towers that wobble when overloaded; a delivery bounce = an envelope boomeranging out the front door; typography-forward (addresses and stamps are the texture); your building itself gets stamped by the abuse-list meter. (wave3_visual_fresh)
  - The mail gateway filter is the signature buildable — *a filter is a tower that sorts customers from threats*: the purest expression of this game's identity. (wave1_gamedesigner_fresh)
  - The IP-warmup schedule (a clock! new IPs must be "warmed" like ovens); blocklist-gate (Spamhaus) BOSS fights; DKIM forgery; spam bots registering accounts in waves; DNS outages cascade to EVERY other product you sell — this level teaches *reputation as a resource*. (wave4_general_fresh)
  - Threats arrive as CONTENT IN THE CUSTOMER LANE: spam riding the mail stream — you must inspect-and-drop WITHOUT dropping legit mail (filtering accuracy is the mechanic; false positives churn customers); a bad reputation literally greys the customer lane as remote servers block you; feel: fax machines and pneumatic tubes. (wave4_gamedesigner_fresh)
  - Distinct: reputation as the core resource; spam outgoing from hijacked accounts, DKIM/SPF/DMARC misconfig, open resolver used for amplification; look: switchboard/post-office for mail, a "phone book / address grid" for DNS. (wave4_sysadmin_fresh)
  - Visual "the postal sorting office": envelope-people on conveyor belts, a giant switchboard with patch cords, address books as the LITERAL map (DNS lookups slide drawers open); spam = grey sludge leaking from mail slots; cozy bureaucratic charm — a foundational service appearing early to late. (wave4_visual_fresh)
  - Sell reputation by the drip: deliverability as a metered luxury good — shared IP pools (cheap, contaminated by strangers) vs dedicated IPs (+$79/mo, yours to pollute); the warmup period teaches compounding reputation assets — and why spammer revenue is radioactive. (wave4_ceo_fresh)

### "Authoritative" / "NXDOMAIN" / "Root Zone" — Anycast DNS hosting
You are infrastructure for other people's infrastructure, so your outages are everyone's outages.

**How it works:** Tiny queries, unimaginable volume, microsecond budgets. Scarce resource: global PoP
capacity — and **correctness**. **Dominant verb: Commit.** **Teaches: you are load-bearing for other
people; TTL is a throttle you own.**
**Core mechanic — TTL as a strategic dial.** Low TTL = agility, 10× query volume forever, high cost,
fast failover. High TTL = cheap, resilient to your own outage, but **a mistake propagates for hours
and you cannot take it back.** A rare case where the operator sets how much traffic they receive.
Every TTL choice is a bet.
**Signature threats:** massive amplification (you are a reflector *and* a target, and can be
null-routed by your own upstream for being the weapon), **water-torture / random-subdomain** attacks
designed to blow past your cache and hammer your backend (and blow out your negative cache), cache
poisoning, a **DNSSEC signing mistake** that takes out every zone you host, registrar account
compromise, a **BGP hijack of your anycast prefix**, a customer's zone change that breaks their
business and becomes your ticket, and the Dyn-2016 scenario where you're attacked because of *who
your customer is.*
**Buildables:** anycast PoPs placed on a world map (each adds coverage *and* a new BGP session that
can be hijacked or leaked), RRL (response rate limiting), DNSSEC — which adds integrity, adds a
**key-expiry time bomb**, and adds packet size which makes you a *better* amplifier, a beautiful
three-way tradeoff — registrar lock, and an out-of-band secondary provider.
**Signature failure: the missed DNSSEC key rollover.** Your zone is cryptographically valid-until-it
-isn't, and validating resolvers worldwide simply stop being able to resolve you. **Nothing is
"down." Everything is unreachable. Your monitoring, which uses a non-validating resolver, says
green.**
**The stakes:** when you go down, hundreds of other companies go down, publicly, with your name
attached.
**Visual:** "The Signpost Network" / "The Phone Book." Pale cyan on near-black, almost entirely a
world-map level; nodes are signposts or tuning forks, queries are single-frame ping motes. Signature
FX: the **anycast bloom** — a query hits the map and is answered by whichever node lights up first,
drawn as competing ripples where the nearest ripple wins. Signature meter: **query latency
percentiles** drawn as a flickering candle whose steadiness is p99 — **put the candle in a glass
chimney**: steady flame at good p99, guttering at bad, and a water-torture attack is a **draught you
can see disturbing it before the number moves.** Cache poisoning is a signpost's arrow physically
rotating to point the wrong way while visitors dutifully walk toward a hostile node.
**Catastrophe, staged:** your signposts go dark and every other business line you own loses its
visitors simultaneously. **Render it as all other district lights going out at once while your DNS
racks stay perfectly lit** — the most damning image available, and the level that teaches "DNS is
load-bearing" by making the whole map stop.
**Freemium framing ("Anycast Anywhere"):** free tier as a funnel, enterprise contracts as the
revenue; free users cost you money and are your only lead source; your free tier is a DDoS
amplification magnet and a crypto-phishing host. Win: convert 1.5% of free to paid before free-tier
cost exceeds paid revenue.

**Variations and additions** — second-pass entry: *Registry / Root DNS Operator [LATE endgame]*

- Top-of-food-chain endgame type: tiny attack surface, existential blast radius — everyone's customers ARE other hosts; gameplay: quorum ceremony mechanics, KSK rollover as a scary scripted event, and one global "root server" count you must keep ≥ N while anycast nodes come and go. (wave2_general_fresh)
  - You operate 3 of the 13 root servers: threats are global query floods, route leaks, government subpoena events, and *physics* (your second site is in a monsoon zone); customers: the entire Internet as a steady flow; the map is a live BGP globe; win = keep the constellation lit — late-game Act IV, mostly spectacle + systems-mastery payoff. (wave3_gamedesigner_fresh)
  - Identity "The Compass Room": abstract, minimal — a dark map with the 13 root letter-nodes as obelisks; traffic is pure geometry; threats are propagation storms — a wrong record spreading as a red ink blot across continents with a TTL countdown ring per region; an "anycast shimmer" means all 13 answered; the unique late-game tension: *you can't die, only freeze*; endgame/finale material. (wave3_visual_fresh)

**Variations and additions** — second-pass entry: *Root Server / IPv6-Only Underground [LATE niche]*

- Niche late level where the mechanic is addressing itself — every customer has a unique address, so "hiding behind a load balancer" tricks stop working. (wave3_general_fresh)

### "Edge" / "Cache Hit" / "The Constellation" — CDN
New rule: you have hundreds of tiny nodes and no origin control. Scarce resource is egress; your
product is proximity. **Dominant verb: Tune.** **Teaches: offload is margin; the miss is the event.**

**How it works:** Cache hit ratio is the single number that decides your profitability — **and the
win condition is a percentage, not a survival timer.** Purge propagation time is a customer-visible
feature (a global purge that takes 8 seconds is a *product you sell*). Origin shielding protects your
customers' origins, and **origin IP leakage undoes all of it** (via historical DNS records, mail
headers, or a `cpanel.` subdomain pointing straight at the origin — a real and very common leak).
**Threats:** **cache-busting attacks** (an attacker appends `?x=random` to every request, forcing
100% miss and turning your CDN into a DDoS amplifier *aimed at your own customer's origin*), cache
poisoning via an unkeyed header (one request, global impact), **cache deception** (an attacker tricks
you into caching a logged-in user's private page and serving it to everyone), a customer with a 2%
hit ratio destroying your margins, a flash crowd at one PoP, a purge stampede, TLS cert management
across thousands of customer domains, and a legal takedown that must propagate to 80 PoPs.
**Buildables:** PoPs, **tiered/shield caching** (mid-tier caches that protect origin), origin
shielding, purge infrastructure, edge WAF, and **bandwidth commit contracts with transit providers**
(95th-percentile billing as a real mechanic).
**Economics ("Edge Money"):** you buy at ~$0.30/Mbps and sell at ~$0.02/GB — **the arbitrage is the
whole company.** One viral customer blows your 95th and you lose money serving them all month.
**Peering with the right eyeball networks is a buildable that permanently reduces COGS.** Win: get
blended transit cost under a target while adding 3 PoPs.
**Signature scenario: "The Super Bowl Ad."** A customer buys a 30-second spot. You know the minute it
airs. You have two weeks to pre-position capacity. Over-provision and you eat cost; under-provision
and you're a news story.
**Visual:** "The Constellation." Aurora gradients, deep-space navy, almost pure world-map altitude.
PoPs are stars; **cache state is star brightness** (cold = dim, warm = bright). **A cache miss is a
long thin thread all the way back to origin that everyone can see; a cache hit is a short local
flash** — players learn cache economics by watching thread length shorten as they warm the edge.
Content is drawn as glowing cargo replicated outward; a cache fill is a visible shipment. Signature
meter: **Offload %**, drawn as how much of the origin's ribbon is dark (unused). Catastrophe: a
global purge stampede — every edge node emptying at once and the origin's ribbon swelling to
bursting. Chord: deep space navy · star white · hit-mint · miss-amber · origin gold.

**Variations and additions** — second-pass entry: *CDN / Edge — "The Postal Highway" [MID]*

- The whole map IS the defense: edge PoPs placed along traffic paths; you play geography. Nobody *visits* you — traffic is the literal path and you sit between everyone and origin. Threats: origin-shield breaches and origin-pull storms (every cache miss = your whole fleet stampedes one origin), cache-poisoning (a contaminated PoP starts serving evil copies — a *logic* threat no turret hits; visual infection spreads via your own network), L3/L4 floods, purge storms after bad deploys, paid-tier abuse, legal takedowns of cached content, license trolls. Customers: media and SaaS; they pay for speed and expect the whole world served; one fat-streaming customer can eat your entire transit bill ("whale poaches your wallet"). **Core resource: HIT RATIO — the whole level is a machine that turns misses into hits.** The product is latency: distance-to-nearest-edge is the core puzzle. Money: per-GB egress, tiered. Builds: PoPs on a world map, Anycast, shield nodes, smart routing, TLS offload, image resizers, tiered caching. Look: dark globe with glowing node constellations, packets as light; or the postal highway — the map is a road lattice with POPs as post kiosks, customers as address-labeled envelopes riding conveyors; cache hit = a satisfying *thunk* at the nearest kiosk; cache miss = the long mournful truck ride back to the single glowing Post Office; miss-trains stacking = your congestion read. Hit-ratio auroras. (general, sysadmin, gamedesigner, visual)
  - No origin hero: a field of 20+ small edge nodes you place on a world map; gameplay is *coverage and geometry* — each customer must be within latency-range of an edge; gaps in coverage leak customers to competitors; peering disputes as a threat. (wave2_general_fresh)
  - Sell per-GB delivery at ever-thinning margins — the game of utilization and PoP placement; abusive hotlinkers and hit-and-run malware downloads blow up your bandwidth bill (you bought transit at commit rates!); teaches committed-usage contracts as a mechanic. (wave2_ceo_fresh)
  - The game is about *what to store where*; cache-miss chains are your chokepoints; customers pay for hops skipped; feel: rain-of-requests visual. (wave2_gamedesigner_fresh)
  - Cache-hit-ratio is your superpower stat (a warm cache shrugs off floods; cold cache = origin meltdown); 95th-percentile transit billing; origin-targeted floods you must absorb at edges. (wave2_sysadmin_fresh)
  - Alt identity "The Air-Traffic Board": the map IS the interface — city dots, glowing great-circle arcs, packets as light motes riding arcs; attacks appear as red squalls blooming over a region; scrubbing centers flash cyan; dark-navy control-room grade; no racks at all — deliberate variety beat. (wave2_visual_fresh)
  - HIT RATIO physics: make misses *count as distance* — origin-pull = a truck the length of the map; cache expiry = trucks *scheduled to leave*, so a synchronized expiry storm after a purge sends a visible convoy at your origin (the purge-storm mechanism); "stale-while-revalidate" keeps old trucks at the kiosks while new ones load; cache keys: a query-string variant bomb = one truck per *customer*, not per page — a *slow* DDoS that eats your origin silently (cache-busting at the cache, the L7 flood's cousin with teeth). (wave2_sysadmin_informed)
  - Define the named "hit-ratio auroras": aurora intensity = fleet-wide hit %, hue shifts green→amber as misses climb; during a miss-storm the aurora *tears into streaks* converging on the origin truck — the sky itself becomes your hit-rate gauge (Money overlay keeps it, Threat overlay dims it). (wave2_visual_informed)
  - Defense = absorb-and-distribute: DDoS arrives as massive flood waves; individual PoPs can be *sacrificed* if the mesh reroutes (new mechanic: losing a node is a play, not a fail); BGP leaks as a threat; origin egress costs money. (wave3_general_fresh)
  - Bandwidth arbitrage with a service wrapper: margin = (transit price negotiated) − (price sold), a literal spread business; **origin-shield economics** — every % of hit-rate improvement is pure margin, caching upgrades are profit towers; big customers negotiate brutal volume discounts and threat-purchase (squeeze you to zero margin, but the logo = inbound deals); comedy archetype: the "free" customer hammering you 24/7 — a 4K cam of a parking lot. (wave3_ceo_fresh)
  - Signature: **placement IS the maze** — edge PoPs are the towers AND the map, origin shield behind them; attackers deliberately miss your cache to melt the origin; HTTP/2 rapid-reset swarms, stale-content poisoning, license-abuse scrapers; high hit-rate = traffic never reaches your fragile core at all. (wave3_gamedesigner_fresh)
  - Hotlinking eats your bandwidth commit; the 3am viral video — a single URL that out-earns your month (blessing and threat at once); geography *is* the gameplay: PoPs as towers placed on a world map; you win on efficiency, not price. (wave3_sysadmin_fresh)
  - Identity "The Roadside Mesh": the map IS the level — a dark regional highway network, cache PoPs as small glowing kiosks/gas stations at city junctions; traffic rivers flow along roads and you place kiosks to shorten rivers; a cache miss reroutes as a visible detour glow toward your origin; palette: highway signage — dark asphalt, safety yellow, interstate-blue shields; great spatial change-of-pace. (wave3_visual_fresh)
  - Customers are *requests*, not people: billions of tiny motes streaming the lattice. (wave1_general_fresh)
  - Highway threats have faces: mail thieves riding the routes and return-address spoofers slipping envelopes into the kiosks. (wave1_visual_fresh)
  - Cache-poisoning as an EPIDEMIC mechanic (inject bad content that spreads to every POP); a "flash crowd" that is actually a DDoS wearing a crowd's face; bigger cache = better hit ratio = more margin — direct build/upgrade economics; license trolls for hotlinked media. (wave4_general_fresh)
  - The board is a WORLD MAP of PoPs (mini-boards!): cache warm = customers served instantly at edge; cache miss = they all queue back to origin — one path, instant congestion; poisoned edges cause churn WITHOUT a single packet reaching you. (wave4_gamedesigner_fresh)
  - Builds add prefetch; threats: cache-miss storms overloading the origin shield, legal takedown of cached content, peering disputes; money: per-GB delivered, tiered by region. (wave4_sysadmin_fresh)
  - Visual "the vending-machine planet": the map is roads; cache nodes are glowing kiosks that spring up along them; content is physical boxes couriered from origin then duplicated; satisfying "restock" loops, delivery-route ribbons, PoP cities with little flags — distinct because defense is EVERYWHERE, not at one base. (wave4_visual_fresh)
  - Commit-and-fill economics: buy transit at take-or-pay commits, sell at $/GB with 2% margins at the bottom of the market — utilization IS profitability (idle PoP = burning cash); abusive customers (hotlink theft, malware hosting) blow the commit; premiums live in "the last mile": settlement-free peering deals with eyeball networks = your toll-free roads. (wave4_ceo_fresh)

**Variations and additions** — second-pass entry: *Game-Patch / OTA Distribution — "The Warehouse" [LATE]*

- A game-CDN specialization (combines two existing): the release-day patch (120 GB × 3M consoles at 00:00) is the purest download-wave the game can draw; deferral windows, staged rollout by region (the patch *is* the wave clock), and the rare "good" DDoS: your own launch event; uses the CDN chassis with a giant payload-meter on every packet. (wave2_sysadmin_informed)

### "Eleven Nines" / "Bucket" / "The Honeycomb" — Object storage
The level about **durability math**. **Dominant verb: Observe.** **Teaches: durability is arithmetic,
not vibes.**

**How it works:** New rule: durability is visible. Replication factor vs erasure coding vs cost;
silent corruption and scrub cycles; the horrifying arithmetic of "how many simultaneous failures
until data loss." **There is no dramatic attacker — the enemy is entropy and your own rebuild math.**
The nightmare: a bug in the software layer that corrupts consistently across all replicas, which
redundancy cannot save you from.
**The second, more common nightmare (added): the metadata layer, not the data layer.** Object stores
lose availability far more often through metadata/index problems — a small-file flood, a hot shard,
an index rebuild — than through drive loss. A customer who uploads 400 million tiny files destroys
your metadata layer, and this is the routine catastrophe.
**The operational truth that makes durability real (added): the scrub must complete faster than the
failure rate.** At large enough scale you are always rebuilding something, so the interesting stat is
not "how many copies" but **"can I finish verifying everything before it changes."**
**Threats:** a misconfigured public bucket, egress bill shock, a hot-object problem, a bad firmware
batch, a rebuild storm that takes a second disk with it. Customers never notice you until the day
they do.
**Economics:** egress billing is the main revenue line, **so a customer whose success ruins you if
you mispriced is a real failure mode** — a single viral file is a revenue bonanza or an unpaid
bandwidth catastrophe depending on which pricing model you chose in shift 1.
**Visual:** amber hex honeycomb that tiles outward as it grows; objects are pebbles that fall into
cells; replication is the same pebble appearing in two other combs with a soft triple-flash;
durability is expressed as how full and even the comb looks. A public bucket is drawn **wide open
with light spilling out of it**, visible from the facility altitude. Catastrophe: a correlated
multi-drive failure punches a visible hole through the honeycomb; erasure-coding rebuild animates as
the hole knitting shut. Chord: amber hex · comb-shadow · replication violet · sealed-wax green · gap
black.
**The meter, made positional (the best single upgrade to this level):** durability is drawn as a
count of visible **replica shadows** behind each object — make the shadows *positional*, each offset
in the direction of the node holding it. A correlated placement (all three replicas in one rack) is
then visible as **three shadows stacked on top of each other** instead of fanned. **That single
rendering choice teaches erasure-coding placement better than any tutorial.**

**Variations and additions** — second-pass entry: *Storage-Only / Object Hosting (S3-analog) — "The Endless Library."*

- **Storage-Only / Object Hosting (S3-analog) — "The Endless Library."** Pure durability puzzle: 11-nines as a defense stat; erasure coding = spreading one object's pieces across towers — lose pieces and data corrupts visibly. Threats: silent corruption, bucket-listers, deletion attackers, accidental lifecycle-deletion (self-inflicted), the "404 wave," and mass-egress billing attacks (attacker uploads then downloads your wallet — bulk *exfil looks legitimate*: a detection minigame). Money: pennies per GB but volume; customers never leave — until you lose a byte: one permanent-data-loss event can fail the level. Customers: every other in-game company (their backups live here — synergy with Backup/DR). Look: endless library shelves. (general, sysadmin, gamedesigner)
  - Object Storage (S3-clone): buckets, keys, versioning; the top breach is a checkbox — public-bucket leaks (your customers' mistake becomes your headline); every object has a durability aura; replication as towers; money: storage cheap, egress is the profit center — attackers know it too. (wave2_sysadmin_fresh)
  - 11-nines should mean *durability*, not availability: a fire costs you availability; bit rot costs durability — the doc blends them; and the #1 real-world cloud breach source is the *public bucket* — make "list objects publicly" a physical, tempting, *bright red* switch on the vault; a "bucket patrol" drone scans for switches that got flipped. (wave2_sysadmin_informed)
  - Library detail pass: forced-perspective aisles that never end (a nod to eleven nines); books = shards; erasure coding = one book shattering mid-air into pieces flying to different shelves; silent corruption = letters fading on one spine (found only in monitoring overlay); a restore reassembles the book with a satisfying thump; mass-egress attack = every book flying out at once in a paper blizzard. (wave2_visual_informed)
  - File-locker crossover: copyright strikes (DMCA boss fights), legal discovery requests, storage-tier arbitrage bots, and the "10,000 files in one folder" clients that murder your metadata servers; builds: erasure-coded storage rings, versioning, lifecycle tiering, CDN egress; egress fees are the boss key — customers revolt at exit costs (dark pattern as mechanic!). (wave4_general_fresh)
  - Pure COGS game: disk deflation means margin grows every year for free IF you hold pricing — vs storage-glut price crashes (a competitor dumps $/GB: match and pray on volume, or differentiate on egress guarantees and durability SLAs); egress fees: every customer hates them, every CFO loves them. (wave4_ceo_fresh)
  - Storage-only host: drives die *constantly* — the level is a RAID-reap-replace loop with a durability meter (eleven 9s as a gauge); bit-rot as a stealth enemy; bucket-ACL leaks as your own config bombs; money: per-GB-months, a brutal margin game. (wave3_sysadmin_fresh)
  - Buildables add versioning and object-lock (the immutability gate against deletion attackers); the exfil threat is "bulk download *looks* legitimate" — the detection minigame's twin. (wave1_gamedesigner_fresh)

### "Restore Point" / "The Vault" / "Bit Rot" — Backup / archival hosting
The product is not storage, it's **restore time**. **Dominant verb: Schedule.** **Teaches:
verification is the only proof; the window is the constraint.**

**⚔️ Split note:** wave-1 conflated backup with DR. They are different products with different
economics and different catastrophes, and merging them loses a whole level. This entry is
backup/archival (window, verification, bit rot, restore time); **DRaaS is separate** — see
"Declaration Day" below, whose scarce resource is oversubscribed standby capacity and whose
catastrophe is *correlated declarations.* They share art and share nothing else.

**How it works:** New rule: **latency doesn't matter at all, and the game says so out loud.**
Visitors are backup *jobs* — big, slow, scheduled convoys that arrive at night in a huge burst and
must complete inside a **backup window** or fail. They don't bounce; they **fail and retry, and a
failed job is invisible until restore time.** Scoring is on RPO and RTO, not uptime.
**The core inversion: your success metric is something you can't observe.** Durability is a hidden
stat. The only way to reveal it is **restore testing**, which costs money and produces no revenue.
**Delayed-consequence horror: a threat that got through three shifts ago is what kills you now.**
**Threats:** a customer whose backups silently stopped six months ago; **ransomware that encrypts the
customer's data and then sits for 90 days so it is inside your retention window**; a restore that
runs slower than the customer's business can survive; a backup window that grew to 26 hours so jobs
overlap and the chain breaks; a customer who deletes data and wants it back from day 400 of a 365-day
retention; the discovery that a customer's "backup" was of the wrong volume; and the classic — your
backup job has been "succeeding" for two years while writing zero bytes.
**Buildables:** immutable/WORM storage, an air-gapped vault, offsite tape courier (a literal van on
the map — it can crash), checksums/scrubbing (a continuous background process that costs IOPS and
reveals corruption), a 3-2-1 compliance meter, and verification-as-a-cost-center.
**The economics ("Cold Storage, Warm Margins"):** **dedup ratio literally is your gross margin**;
retention policy is a pricing lever; egress fees are both revenue and a churn-prevention moat (data
gravity). **Restore surge** — when a customer has a disaster your costs spike exactly when they're
most emotional. *CEO truth: backup revenue is beautiful because it never churns — the switching cost
is the egress bill.*
**Signature scenario: "The Restore Drill."** A customer declares a disaster at 4am. You have an RTO
clock. You must actually walk the restore path — find the tape, load it, read it, ship the data —
and any shortcut you took in the last ten levels bites you now. The level's climax is always a real
restore under a clock, and you find out live whether the last year of green checkmarks meant
anything.
**Visual:** "The Vault." Cold steel and deep blue, blue-white task lighting, a lot of empty floor —
the *slowest, calmest-looking* level type, and that's the point, because the threat is invisible.
Enormous inertia: the tape robot arm takes real seconds to travel and you watch it. **Restores are
the only fast, warm thing here and they're deliberately thrilling because everything else is
glacial.** Signature meters: **Restore Time (RTO)** as a physical hourglass, and **bit-rot** as
individual archive tiles slowly speckling with grey noise (stored data literally loses pixels over
years). Scrubbing passes are a polishing wave that removes speckle. Catastrophe: a restore drill that
fails — the robot fetches a cartridge, loads it, and the readout is static. Chord: vault blue-white ·
tape black · label yellow · rust · restore gold.
**The counter, made human:** the "last verified restore: 41 days ago" readout should be a **paper tag
hanging on the vault door, hand-written, with the date crossed out and rewritten each time** —
Handmade Layer. **Watching the tag not get rewritten for forty days is more uncomfortable than a
number turning amber.**
**A level where the enemy is entropy and the weapon is a maintenance schedule.**

**Variations and additions** — second-pass entry: *Backup & Disaster Recovery — "The Vault" [MID/LATE]*

- Inverted level grammar: attacks on *you* aren't the point — your clients' disasters are. Ransomware waves hit clients; you must restore them before their timers expire. The enemy is *data decay*: bit rot, ransomware that targets backups FIRST, silent corruption, "backup ran but restore fails." Win condition = RTO/RPO timers: the level is graded on how fast you can *reassemble a customer's world*, not just survive. Twist: you can be the reason other companies' levels fail — your vault is their endgame. Customers: paranoid accountants, law firms — they pay for *trust*, so marketing/optics towers matter more than raw speed; fat margins, sticky revenue, disaster-spike claims. Builds: immutable vault (air-gap = disconnect it from the network *tactically*), replication tunnels, encryption, verification daemons, tape libraries. Look: vault/archive aesthetic — cold monochrome blue, heavy circular doors, tape reels spinning like clockwork, dust motes in warm library twilight; the payout beat is a Restore: a lost customer literally re-materializes from the vault and walks back in. Bit-Rot creeps as rust-bloom across stored data. (general, sysadmin, gamedesigner, visual)
  - There is almost no incoming "customer path"; the threat is *time and distance* (RPO/RTO clocks); success is boring — the whole level is a tense nothing-happens until the one catastrophic event, which you survive via prep; backup jobs that "succeeded" but are untested. (wave2_general_fresh)
  - The anti-churn business: nobody wants it, everybody keeps it; margins improve every year as disk gets cheaper (built-in deflation mechanic); consultative long-cycle sales, ransomware-response retainers; money is boring and beautiful — a "management sim" palate-cleanser level. (wave2_ceo_fresh)
  - Customers arrive as long, slow, heavy upload streams; ransomware *wants* to reach your backups (the vault heist scenario); the drama is in the one restore event you must nail; a "3-2-1" formation bonus. (wave2_gamedesigner_fresh)
  - Your core defense IS the restore: the Restore That Fails (untested backup = critical fumble chance), backup-window congestion; customers: accountants, dentists, anyone who just learned about ransomware; penalty payouts when restore fails; mechanic: RPO/RTO sliders per customer. (wave2_sysadmin_fresh)
  - Alt identity "The Archive Vault": brushed steel vault door, tape reels turning, cold blue cryo-mist; snapshots render as glass bubbles drifting from your racks to an offsite shelf across the map; everything moves slowly and calmly — the game's "zen" level type, until a restore event reverses the whole flow direction; palette: arctic blue + brass. (wave2_visual_fresh)
  - The real margin lives in the *restores and incident retainers* (you're paid most when others fail); price per protected workload, not per-GB; disk deflation means multi-year contracts *appreciate your margin* — the one place time pays you; make deflation a scheduled market event with repricing waves. (wave2_ceo_informed)
  - Encode 3-2-1 as a build *constraint* (3 copies, 2 media, 1 off-site/immutable): partial setups pass the ambient waves but *fail the real boss* probabilistically; make the "untested backups half-fail" a *known* half-fail unless the verify daemon ran (knowledge you can buy); the restore *proof* — a restore-test buildable that turns the dice roll off — is the exact thing the auditor asks for (§1 Audit): two systems paying each other. (wave2_sysadmin_informed)
  - Design tension resolved toward siege: if your own estate can't be hurt, defense muscle rots for a whole act — make the vault *the target*: ransomware actively raids you, replication lanes get poisoned, and client disasters are the wave clock; the act is a siege in reverse — defend a fortress that must stay *open to the wounded*. (wave2_gamedesigner_informed)
  - The anti-timing game: threats are slow — legal-hold obligations, restore-point corruption; weird twist: some "customers" are just data, and the win condition is that they never show up (you're paid to be there for the disaster). (wave3_general_fresh)
  - The stickiest money: their data grows = your MRR grows — **negative churn by design** (net revenue retention >110% is the default motion); acquisition is hard — people buy after disasters, so your sales spike after every industry ransomware headline (a demand-shock event you cannot control, only prepare for); restore-speed SLAs are the differentiation ("your files, back in 4 hours"); cold-tiering as a *re-billing upgrade* (data moved to cold = cheaper to run, but restore-time SLA risk). (wave3_ceo_fresh)
  - Signature: **you win by what you restore** — the level's score is dominated by an end-of-level "Restore-What-The-Hell" test; silent corruption spreads in an unverified vault → schedule verify jobs like patrols; legal preservation orders = can't delete, storage fills!; pure MRR — the annuity level, good breather placement between intense acts. (wave3_gamedesigner_fresh)
  - Your product is trust in something nobody tests until it's on fire: ransomware encrypts primary + backup + the backup server *in that order*; deletion via leaked API keys; tape-rot timers; win by *proving* restores — a scheduled "test restore" tower everyone wants to skip. (wave3_sysadmin_fresh)
  - Identity "The Vault Archive": underground vault + museum archive — tape libraries as pipe organs, cartridges as physical "time capsules" being shelved; the vault door's lock state = your restore-readiness; replication = a twin vault connected by a slow conveyor that must never jam; ransomware looks *terrifying* here because the vault is the premise: violet encryption frost creeping over shelf rows; palette: archive green, brass, low warm light. (wave3_visual_fresh)
  - Money: storage-by-the-gig, invisible until launch day. (wave3_sysadmin_fresh)
  - Money: pay-per-GB stored + restore fees — storage is cheap but *retrieval speed is the product*; threats include tape... (literal tape monster). (wave1_general_fresh)
  - Per-GB MRR is almost pure gross margin once built; sticky as concrete (nobody fires their backup vendor) — the "insurance" hosting type: invisible, steady, your product IS the countermeasure; the late-game stabilizer that funds riskier bets. (wave1_ceo_fresh)
  - Mechanic twist: your "enemies" are data *returning* — restore waves that hammer your ingest; the level is inverted TD: load comes in from disasters and you win by ABSORBING it; attackers target the backups themselves (ransomware deletes VSS, corrupts tape, sync-poisoning); builds: tape libraries (air-gapped!), immutable snapshots, dedupe engine, restore-runbook stations; trust is the actual currency — one lost dataset can end the game. (wave4_general_fresh)
  - Reverse TD: inbound exfil attackers must be stopped AND inbound restore streams must be let through FAST — two-directional selectivity; the interesting buildable is the Vault: depth beats firepower; you WANT the chaos — you get paid when catastrophe hits your correct backups (ethically-flipped scoring). (wave4_gamedesigner_fresh)
  - Nobody cares until it matters — the reliability level: the pain is you earn nothing visibly until a disaster; threats: 3-2-1 violations, failed restores; builds: dedup appliances, restore-test automation; look: green "verified" checkmarks. (wave4_sysadmin_fresh)
  - Visual "the vault / library at night": quiet, dim, archival — cold-blue vault mist rolling on the floor, encrypted crates stamped with checksums; the rhythm is a slow heartbeat monitor until a RESTORE event turns the whole level into a panicked scramble under warm red emergency lighting; pairs as a "second base" in any company. (wave4_visual_fresh)

### "Declaration Day" — Disaster-Recovery-as-a-Service (the oversubscription level)
The best untouched idea in the set: it makes an **actuarial assumption** into a playable, visible,
foreseeable catastrophe.

**How it works:** You sell standby capacity to 200 customers and you own enough for 20, because DR
events are assumed to be uncorrelated. **They are not uncorrelated.** A regional power event, a
hurricane, a cloud-region outage, or a single widely-used ransomware strain causes **simultaneous
declarations**, and your oversubscription ratio becomes a triage problem with contracts attached.
**Core mechanic — the Declaration Queue:** customers declare a DR event; each declaration consumes
standby capacity for the duration; your contracts specify **priority tiers you sold years ago and
forgot about.** Failing to honour a declaration is not an outage — it is **a breach of the one
promise the entire product consists of.**
**Second mechanic — failback (DR debt):** customers run in your DR environment, love it, and never
leave. Your standby capacity is now permanently occupied by someone who was supposed to be gone, and
the next declaration has nowhere to go.
**Signature meter:** **Committed vs Available standby**, drawn as a stack of promises taller than the
building holding them up.
**Signature scenario:** a hurricane crosses the map (§1.5) and you watch declarations arrive one by
one, **knowing what the total is going to be.**

### "The Vault Run" / "Bit Rot" / "The Courier" — Offsite tape vaulting
Physical logistics as gameplay.

**How it works:** Tape libraries, robot arms, barcode labels, courier runs, offsite rotation
schedules, media degradation, retention policy, vault slots, retrieval SLAs measured in hours-to-days,
and the requirement to maintain **a drive that can still read 2009 tapes**. Threats: a tape that
doesn't verify, a courier losing a case, a fire, a robot arm jamming, a media format going
end-of-life, and **a missed courier run — an SLA breach with no technical fix.** Utterly different
rhythm from every other level: slow, procedural, with the air of a library.
**Win variant:** fulfil 100% of retrieval SLAs during a courier strike.
**Visual:** dim, cold, library-like. A robot arm moving in a long dark aisle; barcode labels; an
armoured van icon travelling a route between your DC and a salt mine, tapes carrying chain-of-custody
stamps. **The most atmospheric environment in the game and completely unlike everything else.**

**Variations and additions** — second-pass entry: *Archive / Cold Storage [LATE puzzle]*

- Petabyte tape/cold-object vault: revenue is weight-based and slow; threats are entropy itself — bit-rot spreads like decay across unscrubbed data; the level's clock runs decades; a puzzle-TD about verification cycles and format migration. (wave2_general_fresh)

### "Going Live" / "Transcode Queue" / "The Studio" — Video hosting / live streaming
Zero tolerance for failure because it's *live*. **Dominant verb: Triage.**

**How it works:** New rule: **two totally different workloads in one business** — batch transcoding
(CPU/GPU-bound, schedulable) and live streaming (latency-bound, unschedulable). Balancing them in one
facility is the puzzle. All your capacity planning happens **before the whistle**; during the event
you can only triage. Mechanics: bitrate ladders, transcode queues that back up, a redundant ingest
path, and the fact that adding transcode quality costs viewers on slow connections. Viewers tolerate
buffering exactly twice.
**Twist: graceful degradation is a win condition.** Dropping everyone to 480p to keep the stream
alive scores **better** than a perfect 4K stream that dies. **This level teaches the load-shedding
verb, which then matters everywhere.**
**Threats:** ingest failure mid-event, a stream key leak (someone hijacks the broadcast), a DMCA on a
live feed, a viewer count 10× forecast, and the "everyone watches at 8pm" curve. No do-overs.
**Visual:** broadcast red tally lights. Signature buildable: the **transcode farm** as a wall of
ladder diagrams turning one source into many rungs (1080/720/480); missing rungs mean viewers on bad
connections get dropped. An **ON AIR** sign turns the whole level red when lit. Catastrophe: the
stream buffers — every viewer's little spinner appears at once, a wall of spinning circles. A wall of
preview thumbnails is the primary monitoring surface, which is literally how broadcast ops rooms
look.

**Variations and additions** — second-pass entry: *Video Streaming — "The Broadcast Studio" [LATE]*

- Traffic = eyeballs, and the twist: **bandwidth is both the enemy and the customer.** Viral events spike 100x (final match = instant stampede). Threats: ad-insertion hijacks, DRM pirates (steal-once leak-everywhere), bitrate bombs/ladder mistakes, license-server overruns and license-key theft/hotlinking (free load on YOUR bill), chat bots, geo-block evaders as a moral-choice swarm. Builds: transcode farms (CPU-melting throughput puzzle: ingest ladder → renditions → delivery), origin shields, license servers, multi-bitrate ladders, edge cache, ad-insertion (a money tower that *angers* the crowd). Customers: sports/streamers/creator platforms — viewers arrive mid-event, tolerate buffering for 3 seconds, then leave the whole platform. Money: per-viewer-minute/hour + ads; margins brutal — one viral clip kills your margin unless pricing matched. Look: cinema-dark stadium with spotlight reds and velvet, an enormous live "broadcast" screen as the level centerpiece; bitrate ladder rendered as balcony tiers (top rows = 4K, cheap seats = 240p); buffering = the whole path stutters in freeze-frame with a loading ring over the crowd; origin melt = every screen shows color bars; QoE meters over every home; applause swells with concurrent viewers. (general, sysadmin, gamedesigner, visual)
  - Adaptive bitrate ladder as a buildable/tuning mechanic; customers = an event organizer renting your platform; viewers flow in a scheduled wave tied to a "go-live" moment; codec bugs = green-faced viewers = churn; one mispriced plan can bankrupt you on a single hit show; look: bitrate waterfalls. (wave2_general_fresh)
  - Event-peak economics: Super Bowl traffic for 4 hours, idle capacity forever, customers who demand 99.999 during exactly those hours; money = transcoding minutes + concurrent streams + egress; abusive viewers and rights-holders (DMCA takedowns as a legal threat that pauses revenue) are signature mechanics. (wave2_ceo_fresh)
  - The customer flow is *huge and continuous* (viewers hold attention like a faucet, not footfall); buffering = instant rage-quit churn; money egress per GB — costs spike exactly when you're popular; a giant screen in the background of every level, premiere nights as event waves. (wave2_gamedesigner_fresh)
  - Bufferbloat, transcode capacity (GPU pool!), DRM key-serving attacks, "the super bowl slot"; customers bounce on rebuffer ratio, not uptime; bandwidth is the villain; look: a wall of glowing screens. (wave2_sysadmin_fresh)
  - Alt identity "The Broadcast Floor": studio set with RED on-air lamps, filmstrip ribbons of segments flowing to viewers rendered as tiny glowing screens; buffering shows the iconic spinner hovering over clusters of screens; a live "concurrent viewers" odometer like a box-office counter; palette: cinema red + black + screen-glow. (wave2_visual_fresh)
  - The origin-melt color bars should sweep all in-world monitors in a coordinated 2-second cascade with test-tone — the act's jump-scare grammar; DRM pirates get hunted by the projection-booth (license server) spotlight: a thief grabbed mid-run by the beam is the clearest anti-piracy animation available. (wave2_visual_informed)
  - Ad-break moments create synchronized fetch spikes ("the concurrents problem"); a regional peering dispute blacks out an entire territory; customers include esports tournaments, churches, and "OnlyFans-shaped ones paying premium for discretion"; look: broadcast studio / media wall. (wave3_general_fresh)
  - Bandwidth whales with a deadline: live events are razor-thin margins if one encoder crashes on stage; the DMCA takedown wave makes sports-piracy streams the "contraband customer" dilemma — lucrative, illegal, attracts enforcement; a streamer gets raided = a traffic tsunami, literally; customers churn over a single buffering finale. (wave3_ceo_fresh)
  - Signature: **the live event is the timer** — waves are scheduled (pay-per-view starts at 20:00 sharp); you know exactly when the tsunami comes and must pre-warm caches (pre-positioning as the strategic verb); DRM strippers siphon your inventory = revenue like stealth thieves; peak-concurrency contracts, burst-pricing pain; a giant countdown clock. (wave3_gamedesigner_fresh)
  - A single botched transcode during a pay-per-view = an instant refund wave; contracts carry penalty clauses. (wave3_sysadmin_fresh)
  - Identity "The Broadcast Studio" (II): the rack room as a control room — multiviewer walls showing every live stream, SLA rendered as "ON AIR" tally lights that MUST stay red, transcoding farms as editing bays chewing film reels; outage = a wall of color-bars + tone; viewers arrive as camera-headed people walking a red carpet; buffering = their feet stick and a donut spins over their head; palette: studio black, tally red, SMPTE color-bar accents. (wave3_visual_fresh)
  - Customers pay for "it doesn't stutter during the finals"; peak economics define the level — the hug-of-death is the boss fight. (wave1_ceo_fresh)
  - Threats: DRM hackers (screen-recorders leaking content), license-troll lawyers, thundering-herd premieres (a finale airs — 500× bitrate demand), pirate mirrors, ad-blockers hitting ad-tier revenue; viewers pay per concurrent and defect for 200ms more startup delay; the bitrate ladder as the live knob — serve lower quality to protect capacity and revenue-per-viewer (quality vs margin tradeoff); big red ON AIR light that flickers under load. (wave4_general_fresh)
  - Massive one-directional flow; adaptive bitrate = tower MODES (quality tiers); buffering customers churn with patience meters over their heads; hotlinkers are attackers who don't attack — they *reduce your profit*; a single transcoding node as boss-shaped bottleneck. (wave4_gamedesigner_fresh)
  - Distinct: massive down-bandwidth + encode CPU; bitrate floods, DRM/key abuse, transcoding backlogs; builds: HLS/DASH packagers, ad-insertion; money: per-minute-encoded + per-GB; look: VU meters as load gauges. (wave4_sysadmin_fresh)
  - Visual "the multiplex": screen-walls everywhere like a TV station; viewers are an ocean of tiny glowing phone-screens flowing in; buffering = a screen dims to a spinning ring; origin = the projection booth, edges = little antenna rooftops; glitzy, high-contrast — the Super-Bowl-scenario level. (wave4_visual_fresh)

### "Dead Air" — Linear broadcast playout hosting
Video hosting covers VOD and live. **Playout is a third thing:** a 24/7 channel with a schedule, and
the failure state is silence.

**How it works:** There is no "degraded." There is on-air, and there is **dead air** —
regulator-visible, contractually penalised, and instantly noticed by every viewer. Your board is a
**playlist on a timeline** and your job is that the next item is always ready: assets ingested,
transcoded to the right profile, QC'd, with ad breaks inserted at frame-accurate positions.
**Threats:** an asset that arrives late from the content owner; a file that passes QC and has 4
seconds of black at the head; a frame-rate mismatch; an SCTE-35 ad marker in the wrong place; and
**the emergency alert system test that must pass through untouched.**
**Signature meter: Time To Dead Air** — a countdown showing how long the current playout buffer can
survive if everything upstream stopped right now. **The single most stressful number imaginable on a
HUD.**
**Buildables:** the **Backup Playout Chain** (a second identical path running in lockstep with a
manual takeover switch) and an **Emergency Filler Loop** (30 minutes of evergreen content) — the
difference between embarrassment and a regulatory finding.

### "The Seedbox Farm" / "The Warehouse" — Image, file hosting, seedboxes
High bandwidth, low margin, **maximum abuse**. Halfway between shared hosting and bulletproof.

**How it works:** Storage boxes with very high sustained I/O and legally interesting traffic. The
abuse desk is the main gameplay loop: **DMCA notices as a countdown mechanic and as an opex line** —
every takedown costs staff minutes; ignore them and you lose your upstream. Scanning obligations,
upstream providers who will drop you, and payment processors who get nervous. Customers are
technically savvy, price-obsessed, and churn instantly to whoever's cheapest. **Twist: the cheapest
customers are the highest-bandwidth customers — an inverted value curve.** Win: keep the takedown
queue under SLA while margin stays positive.
**Visual:** cardboard brown and packing-tape tan; huge volume, thin margins, heavy bandwidth ribbons.
Signature threat: **hotlinkers**, drawn as a pipe siphoning your content to someone else's site with
no coins coming back. DMCA notices flutter in as paper glyphs. Catastrophe: an abuse-driven upstream
null-route.

**Variations and additions** — second-pass entry: *File Locker / Paste Host — "The Drop" / "The Dead Drop" [MID]*

- One-click anonymous uploads at planetary scale; the abuse-takedown loop *is* the core tower-defense: legal strikes arrive as a queue with timers (one-strike rules = your TOS is your HP); hotlink storms (someone embeds your 40GB video on a forum — egress bill spike = the enemy's win condition); crypto-locker payloads stored *on* you (malware hosting you must find — hash-matching sweep towers); the moral cliff: piracy traffic pays nothing but fills capacity like locusts. (wave2_general_informed)
- Small files, enormous morale ambiguity: malware analysts and whistleblowers and pirates all upload to the same shrine; forensic subpoenas for *specific* files you must find in the haystack (a search-gameplay twist unique to this type); money: ads + premium, razor edge; the ethical twin of bulletproof without the raids. (wave2_gamedesigner_informed)
- Builds: hash-dedupe (two identical infringing copies = one strike problem — but beware dedupe risk), DMCA autoprocessor, bandwidth caps. Look: a vast cloakroom with numbered tickets; the attendant never asks names; a strike arrives as a stamped manila envelope that walks itself to the counter. (wave2_general_informed)

### "Rack 4 Is 40 Kilowatts" / "Thermal Envelope" / "The Furnace" — GPU / AI compute
The level where **power density breaks the building.** **Dominant verb: Schedule.** **Teaches: power
and heat are the real ceiling.**

**How it works:** New rule: power and heat are the primary constraints, not network. A GPU rack draws
40–120kW — what an entire row of web servers drew — so **a facility designed for 5kW/rack is now
useless and the level forces a retrofit**: liquid cooling, rear-door heat exchangers, new busway,
possibly a new building. Introduces power capping / DVFS (trade performance for staying under the
breaker) and the reality that you cannot fill your cabinets because you'd melt them.
**Two customer shapes, one set of cards:** **inference requests** (tiny, latency-sensitive, bursty)
and **training jobs** (8 GPUs for 11 days, and if interrupted you lose *days* of the customer's work
and owe them credits). Checkpointing is the only thing standing between you and a very angry
customer. **Twist: you can overclock the whole facility for a shift** — huge revenue, permanent
hardware-damage roll.
**Threats:** thermal runaway; **a GPU with failing HBM that silently produces NaNs** — a *correctness*
failure, not an availability one: the customer's 11-day training run is garbage and they blame you;
driver roulette bricking a fleet; a firmware bug that bricks a whole tray; NVLink/fabric failures;
crypto miners lying about their workload; model-weight exfiltration; **GPU theft** (they're worth
more than cars — physical security becomes a buildable with real ROI); coolant leaks; and **supply
chain — you literally cannot buy more.**
**The electrical correction:** "a PSU sag under synchronized load" is right but underspecified — the
event is primarily an **inrush / step-load problem at the breaker and UPS**, not at the PSU. Model it
as a **ramp-rate limit**: the player configures how fast jobs are allowed to start, trading scheduler
throughput against electrical safety. **A better and more real dial than a random event.**
**The delayed consequence: the demand charge.** A synchronized ramp sets a monthly peak that costs
money for **eleven more months**, turning a one-second event into a recurring line item — exactly the
kind of delayed consequence Pillar P10 wants.
**Liquid cooling, specified:** the failure mode that matters most is not a dramatic burst but a
**slow drip at a quick-disconnect**, plus **coolant chemistry** (the wrong fluid, or biological growth
in a poorly treated loop, clogging cold plates months later), plus the fact that **a CDU is a single
point of failure for a whole pod unless you bought two.** Add a **coolant condition** maintenance
stat.
**Rack weight:** a fully populated GPU rack can exceed 1,500kg. Floor loading, the freight elevator,
and the route from the dock are real constraints. Raised-floor weight limits are a joke elsewhere in
the design; **GPU is where it stops being a joke.**
**The revenue model, corrected:** wave-1 framed GPU as "sell interruptible cheap or reserved
expensive." That is the *residual* decision. The actual business is **contracted, prepaid,
multi-year reserved capacity with a creditworthy counterparty**, because that is the only way to
finance the hardware; spot is what you do with the gaps. Reframe the signature tension as: **can you
get a contract long enough and a prepayment big enough to finance the cards before the market
reprices?** The customer's **credit quality is the whole deal** (an AI startup with 9 months of
runway signing a 3-year contract is not revenue, it's a bet), and **who owns the hardware at the end
is negotiable and enormous.**
**"Allocation" (the chicken-and-egg level):** you cannot buy the GPUs unless you have signed
contracts, and you cannot sign contracts without capacity. Brutal customer concentration (3 customers
= 80% of revenue), a 40-week lead time, and **residual value risk** — next-gen silicon announced
mid-level craters the resale value of your fleet. Win: contracted utilization >70% on a 36-month
depreciation schedule before the next-gen announcement lands. *CEO truth: GPU hosting is a leveraged
bet on depreciation curves wearing a hosting costume.*
**"Liquid" (the capex-gated pivot):** your air-cooled hall can't take 60kW racks; you must finance
CDUs, rear-door heat exchangers and floor loading **before** you can sell the product that justifies
them. Win: land one liquid-cooled tenant before the financing window closes.
**Economics:** the highest revenue-per-rack and the highest capex in the game. **Utilization is
everything — an idle GPU is a bleeding wound.** A spot market lets you sell idle capacity cheap and
reclaim it, at a reputation cost. 24–36 month obsolescence clock.
**Visual:** "The Furnace." The room is dark and **the light comes from the load**: idle GPUs dim
violet, saturated GPUs glowing orange-white pushing visible heat shimmer into the aisle; immersion
tanks as a liquid shader with rising bubbles. You read utilization purely as brightness. Enormous
heat plumes, liquid cooling loops with visible coloured coolant flow, a busbar drawn like
architecture. Signature meter: **GPU utilization + VRAM fill** as glowing bars inside each card, with
a power meter always the most prominent thing on screen. Catastrophe: thermal shutdown of a whole
pod, or a **liquid leak** — coolant as a visible spreading puddle with electrical arcs at the edge,
the single most alarming image available in the game. Chord: near-black · violet idle · furnace
orange · coolant aqua · white-hot throttle.
**Readability correction (the biggest risk in the document):** "violet-white plasma, everything
glowing, enormous plumes, thick gold cables" breaks two global rules. **Gold reads as money**, so
power cabling becomes **Copper**; the glow is confined to Flow and to the GPU dies themselves (points,
not volumes); and the room's brightness comes from **bounce off white surfaces**, not emissive
geometry. The furnace should feel hot because of **colour temperature and heat shimmer**, not because
every surface is a light source. **This keeps the level spectacular and keeps a magenta triangle
visible inside it.**

**Variations and additions** — second-pass entry: *GPU / AI Compute — "The Forge" [LATE, best risk/reward]*

- Customers: ML teams, researchers, enterprises, crypto-miners (the shady variant). ML teams pay enormous money, run 3-week jobs, scream at any interruption — a job that dies at 3am is a lost whale (you pay their checkpoint); researchers are slow money with good optics; enterprise inference is steady and SLA-heavy. Threats: cryptominers hiding inside training jobs, model-extraction thieves, data-poisoning uploads, thermal events, job-queue DoS (submitting fake training jobs), power-cap breaches, supply-chain CUDA-library exploits, the queue itself. Builds: GPU nodes (huge revenue, huge heat, huge power draw — one GPU client ≈ 50 web clients), liquid-cooling loops (cooling IS a tower category here), job scheduler/Slurm analog (this is your load balancer — misconfigure and jobs starve while GPUs idle), power governors, checkpoint storage, a power substation. Money: premium hourly/spot rates with brutal capex amortization — every idle GPU minute visibly burns money (a tiny burning-cash icon); energy cost is a real negative number; revenue swings with AI-hype market demand. Look: industrial furnace / neon cyber-cathedral vibes — charcoal + molten orange underglow, coolant pipes as visible circulation, heat-shimmer overlays, fans as weather (a turbine drone that *rises in pitch with utilization* — the level has a soundtrack you generate by overloading it); customers arrive as glowing weighted "models" physically placed on the rack — the rack sags under heavy jobs; the whole screen runs a temperature gradient from cool-blue aisles to molten rows. (general, sysadmin, gamedesigner, visual)
  - Cluster interconnect (InfiniBand/NVLink fabric) as a *critical path* buildable; ML labs are whale-tier with 1000-node reservation contracts; crypto miners "wearing a hoodie as a costume"; a corrupted training checkpoint = contract destroyed; heat as a literal visible mechanic; look: neon coolant pipes, humming monoliths, thermochromatic glow. (wave2_general_fresh)
  - Highest ARPU in the game: hourly $32 GPU rentals, reserved clusters, spot pricing as a discount mechanic; a nasty underclass of crypto miners and scraping farms; stolen cards love GPUs (instant liquid value) — payment fraud is a signature threat; late-game, high-variance. (wave2_ceo_fresh)
  - Training runs = slow-moving fat creeps you must keep alive for *hours*; spot-price volatility — your income swings with a market ticker; feel: humming cathedral racks, amber "hot aisle" glow, thermal bloom visuals. (wave2_gamedesigner_fresh)
  - Power density and heat as first-class meters; the grid itself is a threat; cooling capacity is your real bandwidth; interaction with the electric utility. (wave2_sysadmin_fresh)
  - Alt identity "The Reactor Chapel": vaulted ceiling, rows of black glass slabs with a single white status hairline each; NVLink trunks as glowing python cables; power delivery as a giant transformer with warning medallions; heat is visible amber shimmer rising into cooling plumes; sterile, worshipful, slightly terrifying; palette: bone white + chrome + one hot amber accent. (wave2_visual_fresh)
  - Distributed training changes everything: a modern job spans 8 nodes on an InfiniBand fabric, synchronized every step — **one straggler stalls all eight; one death kills the job** (the "job dies at 3am = lost whale" made mechanical). New buildables: high-speed fabric (its own red-port class — RDMA doesn't route), checkpoint storage tiers (write-interval dial: frequent = safe + storage-saturated; sparse = progress-losing gamble), and MIG/GPU-slicing (the hypervisor slicer's GPU twin, with fraction-of-VRAM doors). Thermal truth: throttling is *gradual first* (clocks step down = slow job = angry customer) before it's a cliff. (wave2_sysadmin_informed)
  - Identity truce: rack sag as a function of job weight with a visible tonnage chit (an ML whale sags a whole row; a joke-act crypto miner sags nothing — it just glows); restrict Forge's glow to red-ember so danger reads red-orange and money stays yellow (molten *light* never falls on coins). (wave2_visual_informed)
  - Extremely expensive buildables (a GPU node = an "H100 rack"), extremely lucrative tenants; abuse: free-tier GPU miners, prompt-injection payloads riding "trusted" data pipelines, checkpoint exfiltration; a job that dies at 90% progress is a partial loss (checkpoint buildables mitigate); look: spaceship engine room, power-draw a visible resource bar. (wave3_general_fresh)
  - The capital-intensity boss fight: reserved contracts ($/GPU-hour, 1–3yr commits) + spot pricing to fill idle + on-demand for researchers; every idle GPU hour is pure loss — **utilization is the score**; the trap: a node failure at hour 90 of a 96-hour job costs you the contract AND the checkpoint. (wave3_ceo_fresh)
  - Signature: **jobs are cows, not shoppers** — long-running jobs milk revenue continuously; a job killed at 99% yields nothing and burns the customer forever; crypto miners disguising as research jobs → the deep-packet-inspection tower; illegal-model-training abuse; energy is your #1 cost — the electric bill is a live monster bar. (wave3_gamedesigner_fresh)
  - Customers: startups burning VC money (pay huge, churn huge); NVLink nodes, InfiniBand fabric as high-speed "roads"; driver/CUDA-stack breakage; spot prices volatile as a casino. (wave3_sysadmin_fresh)
  - Identity "The Cleanroom": white chrome, cyan underlight, negative space; monolith slabs in server-cathedral rows; liquid cooling as visible glass pipes with glowing fluid pulsing at load rate; fans roar (screen-edge blur) at utilization spikes; customers in bunny suits carrying jobs as slow glowing orbs to a pod; crypto miners = barnacles growing on the monoliths; overclocking = a visible orange heat halo. (wave3_visual_fresh)
  - The Paper Cluster — GPU neocloud as a finance scenario (the Forge from the balance-sheet side): you grow by *debt written against the GPUs themselves* (a collateral HUD shows the fleet as both compute and loan); take-or-pay whale contracts fill 60% of the cluster for 3 years at a 40% discount, so *every* failure is breach-of-contract, and the depreciation-curve-vs-contract-term race is the level timer (outlast the loan, not the wave); hardware refresh = a refinancing event; the crypto-winter inversion is your default risk — a scenario about leverage in both senses. (wave3_sysadmin_informed)
  - The Untouchable Job: one customer's 60-day training run becomes a load-bearing wall — no kernel patch (reboot = death), no firmware window, no rack move, no "quick" firewall change at the RDMA port; the machine becomes *radioactive to your own maintenance* (NOT updating is now the risk, and the zero-day meteor politely targets the one box you can't patch); counters: checkpoint-interval discipline (the customer's tolerance as a *contract stat*), migration windows earned by job progress, whale-renewal-calendar economics. (wave3_sysadmin_informed)
  - The wildest margins AND the fastest depreciation (an H100 generation loses half its value in ~2 years) — the capex clock is the business; hourly spot + reserved contracts; startups pay wildly and burn out; the whale market of the late game. (wave1_ceo_fresh)
  - Threats: crypto miners POSING as training jobs (inspect the workload!), jailbroken-model scraping, prompt-injection spam hitting inference endpoints, thermal events, spot-price eviction; a single whale training job can fund three racks — or bankrupt you if it fails at 90% and demands a refund; power is 60% of costs; best combo: backup & DR (checkpoints) + power/cooling threats. (wave4_general_fresh)
  - Training jobs are HUGE slow convoys worth enormous money that occupy the board for a long time (long-lived, not disposable packets); job-hijackers stealing weights are exfil threats that RUN AWAY — interception TD! (wave4_gamedesigner_fresh)
  - Distinct: extreme heat + power + cost; runaway training jobs melting a node; data-exfil via model weights; billing disputes over GPU-seconds; builds: NVLink fabrics, liquid cooling, Slurm-class job schedulers; look: hot-aisle inferno, glowing GPUs. (wave4_sysadmin_fresh)
  - Visual "the reactor hall": massive reverent scale — GPU nodes as glowing obsidian monoliths with coolant arteries that PULSE at load rate; power cables thick as trees; ML-job customers are slow whales drifting in; amber core-glow, everything hums, heat shimmer always present. (wave4_visual_fresh)
  - The depreciation treadmill — the asset ROTS: H100-class rental rates historically halve every ~12–18 months as supply floods in; your capex plan is a race to earn back GPU cost before its market price collapses; *resale-value decay* is a clock on every tower (sell into the secondary market early, or ride to zero) — this is what makes AI hosting a genuinely different game from web hosting. (wave4_ceo_fresh)

### "Hour 39" / "Render Farm" / "The Anthill" / "The Loom" — HPC / render farm
Job scheduling as tower defense. **Dominant verb: Schedule.** **Teaches: the slowest member sets
everyone's speed.**

**How it works:** New rule: **the customer's deadline is the clock.** Jobs are long, stateful, and
unkillable without loss. A node failing at hour 39 of a 40-hour job destroys everything unless you
built checkpointing (spend capacity now to survive failure later). The interconnect (InfiniBand/RDMA)
is a new failure class: **one bad cable slows the whole cluster** because everything waits on the
slowest rank, and finding which node is 5% slow is a needle-in-haystack diagnostic. Jobs arrive in
bursts before industry deadlines; scheduling fairness vs revenue maximization is the core decision.
Threat: a job that runs 10× longer than estimated and starves everyone; a customer whose deadline is
at the exact moment of your maintenance window.
**Twist: you can win by *cancelling* a job** — a deliberate, scored loss to save four others.
**Visual:** industrial green terminal, or "The Loom" — jobs as long horizontal weft threads crossing
a warp of nodes; a completed frame is a tile that clicks into a growing mosaic image, so **the whole
level is watching a picture assemble.** Job preemption visibly *unweaves*. Signature meter:
**scheduler fairness**, drawn as a queue with customer-coloured job tickets; starvation is visible as
one colour never advancing. Chord: loom wood · thread white · frame-complete teal · preempt grey ·
queue ochre.

**Variations and additions** — second-pass entry: *HPC / Batch Compute (Render Farm, Research Cluster)*

- Job-queue gameplay: customers are batch jobs (render frames, physics sims), not interactive; throughput > latency; the board is a scheduling puzzle (backfill, priority-inversion gremlins); threats: a job that silently resizes your cluster (kernel exploits), deadline-miss penalties; types-adjacent to GPU. (wave2_gamedesigner_fresh)
- HPC / Research Cluster variant: Slurm queues as a lane mechanic — jobs line up, schedulers are your towers; threats: node failures (lots of them, that's the norm), a grad student's fork bomb, grant-deadline crunch, the InfiniBand fabric as a rare/expensive buildable; money: grants and reimbursements, failure = public embarrassment; look: supercomputer-room austere chic. (wave2_sysadmin_fresh)

### "Hashrate" / "The Boiler Room" / "The Barn" — Crypto mining hosting
Pure power arbitrage. Boom-bust level with a bust guaranteed.

**How it works:** New rule: your entire revenue base can evaporate in one event. Your revenue is per
kW not per server, your customer is volatile, your revenue tracks a **live commodity price chart on
your HUD that you don't control**, your gear is cheap, hot, fire-prone and constantly failing, and
your neighbours hate you. Includes **demand-response contracts** — get paid by the utility to shut
down during grid peaks, real money for doing nothing, at the cost of customer SLAs. **The economy
itself is the antagonist and may collapse mid-level, turning every tenant into a deadbeat
simultaneously.** The level teaches concentration risk. Also: the most fire risk, the worst
customers, the best margins. Win variant: sign a **floor-price hosting contract** that survives a 70%
index crash.
**Visual:** "The Barn" / "The Boiler Room." Sickly gold-green, buzzing, deliberately janky and
hilarious: corrugated metal, zip-ties, box fans, extension cords, a plywood shelf of ASICs, dust
everywhere, heat haze and a permanent layer of grime. Everything is visibly *temporary*. Power theft
events are a suspicious cable disappearing through a wall. Signature meter: **power price vs coin
price** as two needles on a gauge whose crossing point determines whether your tenants can pay.
Chord: corrugated silver · dust beige · extension-cord orange · coin gold · haze.
**Catastrophe — "Ruins as a game state," specified:** the price crosses and every tenant abandons
their rigs in place. Spec the ruin: rigs still racked but dark, a layer of dust **visibly thicker on
the fans**, extension cords unplugged and coiled on the floor by someone in a hurry, **one rig still
running because nobody told it to stop**, and a stack of unpaid invoices taped to the cage door.
**The level ends as an environment, and the player should be able to walk the camera through it.**

### "The Control Plane" / "Cluster" / "The Yard" / "Namespace" — Kubernetes / PaaS / containers
New rule: **you host a platform, so your customers deploy arbitrary code into your building.**
**Dominant verb: Tune.** **Teaches: automation executes your mistakes at machine speed.**

**How it works:** Your customers reconfigure your platform all day; a "visitor" is a *deployment*.
**Twist: you don't place pods, you place *policies*, and the system places pods** — a level about
indirect control, and a great palate cleanser after three hands-on levels. The failure mode is
exquisitely modern: **a reconciliation loop doing exactly what it was told, everywhere, instantly.**
**Signature threats:** etcd quorum loss (workloads keep running but nothing can change, including
failing over — a *paralysis* threat rather than a damage threat), a bad admission webhook that blocks
all deploys including the fix that would repair the webhook, a CrashLoopBackOff storm, a namespace
with no resource limits eating a node, a leaked service account, a noisy CI pipeline that rebuilds
everything at once, **autoscaling that can be attacked** (a traffic spike that scales you into
bankruptcy), and **multi-tenancy escape** (a customer breaks out of their container into yours).
**Consumption economics:** **usage-based billing** means revenue is no longer predictable — a
customer can 10× or 0× overnight, so you can't forecast, so you can't capacity-plan, so you
over-provision and eat it. Free-tier abuse (crypto miners) is a direct COGS leak. Win: gross margin
above 55% with <3% free-tier abuse leakage.
**Visual:** "The Yard" / "The Swarm Board." Nautical navy and container-paint primaries; a gantry
crane picks up and places little containers as pods scale; pods are pill-shaped sprites **constantly
being born and killed**, so the visual signature is churn as ambient motion. A rollout is a colour
wave washing left-to-right across pods; a rollback is the wave visibly reversing. Signature meter:
**pod churn**, drawn as how frantically the crane is moving. Catastrophe: a crashloop — the crane
places a container that immediately explodes, repeatedly, faster and faster. Chord: helm blue · pod
teal · rollout-wave green · evicted grey · crash-loop red flicker.

**Variations and additions** — second-pass entry: *Kubernetes / Managed Container Platform — "The Ant Farm."*

- **Kubernetes / Managed Container Platform — "The Ant Farm."** The automation level: you mostly defend *policies* (admission control = gates filtering pod-creatures) while a self-healing swarm fights back against you — crash loops = your towers destroying themselves, runaway scaling = spending your money at 3am. Chaotic, meta, hilarious. Visual: pods as tiny glowing eggs in glass tubes constantly laid and dissolved — stillness means the controller is dead; robotic nurse-bots ferry eggs; threats: image-pull storms and a "pod tornado" when the scheduler melts. (general, visual)
  - Kubernetes-as-a-Product: the cluster is a dungeon — etcd quorum = your heartbeat (lose it, everything freezes); threats: exposed dashboard, privileged pod escape, Helm chart supply chain, the YAML typo that deletes prod; mechanic: control-plane vs data-plane health as two separate bars; late-game sysadmin-pleasing chaos. (wave2_sysadmin_fresh)
  - Visual "The Hex Cockpit": the screen becomes a mission-control grid of hexagon pods that self-arrange; the player mostly issues commands to an orchestrator robot rather than placing boxes — placement gameplay inverts into intent + watching; palette: docker-blue flat vector + terminal green. (wave2_visual_fresh)
  - Autoscaler oscillation is the *actual* lived horror: HPA thrash (scale up under load → cost spike → panic-scale-down → shortage → scale up…); make the scaler's sensitivity a dial with a visible oscillation trace, and "predictive scaling" the expensive late unlock. (wave2_sysadmin_informed)
  - Fairness guardrail: crash-loop towers that destroy themselves can spiral un-winnable for new players — cap self-inflicted damage per window and make the "policy gate" buildable cheap and obvious in-level; the joke is only fun if the escape hatch is legible. (wave2_gamedesigner_informed)
  - Economics: control-plane fees + node markup — the type that *sells complexity as convenience*; customers churn on YAML errors they blame on you; the buildable that says "you take the support tickets for our bugs now." (wave1_ceo_fresh)

### "Cold Start" / "The Mayfly Field" / "The Popcorn Pan" — Serverless / functions
Scarce: warm capacity. **Teaches: cost can be attacked without touching availability.**

**How it works:** The tension between cost (scale to zero) and latency (cold starts). **Your
visitor's experience depends on whether *another* visitor came recently.** Threats: a recursive
function that invokes itself and bills you $40,000 in nine minutes; a single tenant's burst starving
others.
**Visual:** functions are tiny creatures that spawn, do one thing, and vanish in under a second; the
board *sparkles* with ephemeral life, and the level's rhythm is entirely popping. A cold start is a
visibly slower, duller pop with a little puff of frost. The **Chrysalis Pool** of pre-warmed shells is
the buildable: **buying warmth is buying the absence of a stutter.** Chord: pan black · pop yellow ·
frost blue · concurrency lime · timeout red.
**Particle-budget correction:** "the board sparkles" is a disaster at serverless volumes. Apply the
crowd-density LOD explicitly: individual mayflies below ~200/s, a **shimmer field** above it, where
cold starts render as **dark specks in the shimmer** rather than individual chrysalises. **Cold
starts as holes in the sparkle** is both cheaper and more legible.

**Variations and additions** — second-pass entry: *PaaS / Serverless — "The Food Court" / "The Ghost Kitchen" [MID/LATE]*

- Abstracted buildables: you don't place servers, you place "platform capacity" and the platform fans out micro-workloads; metered pennies multiply into dollar surprises — the "my AWS bill" level: your customers get BILL-SHOCK and blame YOU (a reverse-revenue threat). (wave2_ceo_fresh)
- PaaS / App Hosting "The Food Court": customers push code, you run the kitchen — buildpacks/dyno-hours, slug-size limits, free-tier dyno sleep/wake as a capacity toy; the inversion of VPS: abuse arrives as *working software* (miners that compile fine and pass health checks, image-hosting on the file system "temporarily," the 3am `git push` deploy storm before demo day); one customer's bad deploy is *your* incident; look: vendors hand raw ingredients over the counter, your chefs (containers) plate them; a bad batch makes the whole court vomit. (wave2_sysadmin_informed)
- FaaS variant: cold starts as a visible enemy swarm — functions waking up = latency spikes that bounce customers; threats: runaway recursion bills (one bug burns your budget), event-injection, the platform CVE that hits every tenant at once; the meter is the weapon; look: shipping containers craned in and out constantly. (wave2_sysadmin_fresh)
- Visual "The Ghost Kitchen": no racks on the map at all — storefront windows and pneumatic tubes; invocations = orders zipping in; a handler materializes, works, dissolves; cold start = a dark stall flaring to life while the customer's ribbon drains; autoscale = cardboard pop-up booths unfolding along the alley; billing = a ticket-printer strip growing off the floor; event-storm = order tickets avalanching out of the printer; infinite-loop abuse = one order that never returns while its stall burns a visible coin every second; the visual joke of the act: a kitchen with no appliances, only hands. (wave2_visual_informed)
  - PaaS / Heroku-style: developer-experience (DX) is the acquisition stat — deploy-in-60-seconds UX beats raw price (funnel-velocity mechanic); hidden cost: platform engineers' salary is your biggest line, so staff towers dominate; customers expand (their app succeeds = bills grow) and abandon (their app fails = *silent* churn, discoverable only via usage-drop analytics — analytics as a retention tower). (wave3_ceo_fresh)
  - Identity "The Vending Machine Mall": no racks at all — rows of vending/kiosk machines; each request inserts a coin, a machine whirrs, produces a result; cold start = a machine waking up sputtering with a loading donut; scale-to-zero reads as an empty, dark mall — eerie, and the visual punchline when a burst wakes everything; event storms = orders avalanching; a jammed machine (memory leak) blinks red mid-vend; per-coin micro-pricing, cold-start refunds; placement puzzle: which mall court. (wave3_visual_fresh)

### "The Managed Database" / "DBaaS" / "The Cellar" / "Read Replica" — Database-as-a-service
You run the thing that cannot lose data, for people who will write terrible queries against it.

**How it works:** Every customer's query is your problem. Mechanics: automated failover (which
sometimes fires when it shouldn't), point-in-time recovery, major version upgrades with a maintenance
window your customers will not accept, and **one tenant's missing index taking down a shared node**.
Verb: isolate and throttle. **The boss is a split brain.**
**Visual:** "The Cellar." Oxblood, brass and oak; databases as casks and drums; indexes as card
catalogs; replication as scribes copying ledgers; **replication lag as a visible level difference
between two casks**; a long transaction is a clamp on the tap; the WAL is a literal scroll spooling
onto the floor. Catastrophe: **split brain**, drawn as two ledgers diverging with an angry red seam
between them. Chord: cask oak · brass fitting · liquid indigo · lag amber · lock red.

**Variations and additions** — second-pass entry: *Managed Database Cloud — "The State Farm" [MID/LATE]*

- You host *state itself* for other developers — the DB is the product, not a buildable; durability is the only health bar (uptime matters, lost bytes end you); migration events are boss waves (lift a customer's 4TB schema with near-zero downtime); connection-pool exhaustion and "vacuum storms" as signature waves; data gravity means customers hate leaving — your churn curve is flat but your incident stakes are absolute; interacts with backup/DR, replication, and regulated types. (wave3_general_informed)

### "Anything Goes" / "No Questions" / "The Back Alley" / "Blacksite" — Bulletproof hosting
Very high revenue, extreme risk. The game's dark path. **Teaches: some revenue is a loan against your
future options.**

**How it works:** New rule: the game systems flip — instead of *preventing* abuse you're *absorbing*
it. Every customer is an abuse report. You manage upstream relationships, rotate IP space, re-home
your network mid-level, and decide where your actual line is. The pressure comes from transit
providers, registrars, payment processors, blocklist operators and eventually law enforcement — not
from hackers. **A pure risk/reward portfolio level with no shooting at all: you win by choosing
*which* bad customers to keep.** Reputation is inverted: being notorious attracts *more* of this
business. 6× pricing, crypto-only payment (no chargebacks — a genuine margin advantage), zero
refunds. Failure state: **deplatformed** — no transit, no payments, no domains.
**Player choices:** how much do you know about your customers (KYC costs revenue but lowers heat);
how fast do you respond to abuse; do you have a "we null-route on complaint" policy; do you keep logs
(logs protect you legally and endanger you politically).
**Beautifully cynical mechanic:** **the more upstream providers you have, the more heat you can
absorb** — you can lose one and survive. Redundancy as legal armour.
**The scarce resource is payment rails, not just transit (correction):** bulletproof hosts lose
banking before they lose transit, which is why they price in crypto, which creates its own
accounting, tax and volatility problems. **The Heat Gauge should have two needles** — upstream
tolerance and payment acceptance.
**⚔️ Balance problem (flagged): as written this is the economically dominant line** for a player who
doesn't care about flavour, because the penalty is soft, slow and narrative. Three fixes, all
recommended:
1. **Heat compounds** — each grey customer raises the *rate* at which the next one raises heat, so
   the line has a hard mathematical ceiling.
2. **Upstream cost scales with heat** — you pay 1.4×, then 2.2×, then 4× for transit.
3. **The reputation gate is two-way and sticky, enforced numerically** — bulletproof revenue above
   20% of MRR **permanently closes regulated, enterprise and government tiers for the run.**
Then it is a genuine fork rather than a free money button with a sad face.
**ASN Reputation as a cross-level resource:** bulletproof **contaminates your other businesses**.
Explicitly framed as a **short-term cash-extraction level with a permanent cost** — win = extract N
dollars and exit before the ASN score hits terminal; running it taints the meta-campaign's reputation
stat.
**Visual:** "The Backroom." Neon sign glow on wet asphalt, permanent night, heavily desaturated, red
practical lighting, unbranded gear, no windows. Customer nameplates are **redacted with black censor
bars you can't peel off.** The sky above your building (reputation weather) is permanently the colour
of a nosebleed. Signature meter: the **Heat Gauge**, with an exchange-rate-looking widget between
"money" and "risk." Catastrophe: an upstream cuts you off, or a raid — the doors come in and your
gear is carried out in evidence bags. Chord: black · safe-light red · bleached grey · cash green ·
censor-bar matte.
**Revenue rendering, corrected:** "a different, slightly wrong gold" violates one-hue-one-job. Keep
the *shape* wrong rather than the hue: bulletproof revenue is gold, but it arrives as **crumpled
notes rather than coins**, it doesn't arc cleanly, and it lands with a duller sound. **Same hue,
wrong physics.**
**Interacts with:** §9.2 (karma system), §5.6 (a branch with a door that locks behind you), §1.3
"No Logs" (the ethically distinct sibling).

**Variations and additions** — second-pass entry: *Bulletproof / Offshore — "The Pirate Cove" [LATE / side campaign, villain-simulator arc]*

- The dark branch. Money is fast and dirty; threats include *everyone*: upstream providers de-peering you the moment reputation drops, payment-processor cut-offs, banks dropping you, INTERPOL-warrant countdowns, raid attempts (you literally cannot destroy some enemies — only reroute or outrun them), snitch customers, rival criminals, and your own customers attracting each other's enemies. Law arrives as a literal siege path. Reputation as a weapon: your "not worth suing" rating is a buildable. Customers: phishers, scam shops, "content" hosts — highest prices in the game, worst churn dynamics, every one a wanted poster; huge money, radioactive churn. Builds: proxy front layers, shell-company layer (hides your DC location — a stealth tower), jurisdiction switching, cash-out/crypto rails, lawyer retainers (a defense tower that only fires monthly), disposable-DC doctrine (build it, lose it, relocate — the map itself is expendable). Play as morality-play/money-pressure sandbox: the level design makes you *feel* why honest hosts exist. Look: neon noir — rain, magenta-teal sunset, palm shadows raking across beach-shack racks with satellite dishes, flag-of-convenience bunting, tinted windows, jurisdiction border lines on the map; law enforcement arrives as patrol boats you can only outrun — a "wash the evidence" timing minigame and a fast-shutdown plug-pull; money = unlabeled briefcase coins; UI styled as a wanted poster. (general, sysadmin, gamedesigner, visual)
  - Moral-flavor type with no legal safety net: law-enforcement seizures demand a "burn notice" — quick-shutdown to save company data; your own staff getting nervous; payments in crypto (volatile); reputation with banks collapses; late-game "corrupt path" branch with unique endgame art: dark-mode, rain on windows, a fax machine. (wave2_general_fresh)
  - Everything runs at 3x price and 10x risk: seizure events, upstream providers dropping you, payment processors refusing you (cash/crypto rails only, chargebacks everywhere), law-enforcement shakedowns; the profit margins are the temptation — the game should let you take the red pill and then live the consequences. (wave2_ceo_fresh)
  - Chaotic-evil campaign: *abuse traffic is your customer base* — you must *admit* things polite hosts filter; upstream cut-off (blacklist as loss condition), snitches inside; cash-only; feel: dim server-room in a port city, paper maps, no logos. (wave2_gamedesigner_fresh)
  - High-revenue sin cluster: under-/over-claims, fake-DMCA extortion, actual APTs laundering through you; customers pay in crypto and never open tickets; win condition might literally be "exit before the Feds level"; look: noir, palm trees, padlocked cages. (wave2_sysadmin_fresh)
  - Alt identity "The Night Market": neon kanji knock-off logos, fog, palm silhouettes, a shutter that half-closes during seizures; takedowns arrive as a black helicopter searchlight; UI goes dark-grey on dark-grey with only the money counter bright; palette: humid teal + hot magenta. (wave2_visual_fresh)
  - Name the real war: the Spamhaus/318 event (a bulletproof host's DDoS against a blocklist threatened the internet's routing, followed by nation-state *retaliation* taking the host down) is the genre's finest hour — make it a *campaign structure*: the ecosystem eventually kills you *for* your crimes, and the "not worth suing" buildable gets its boss. Seizure reality: the police *do* take the whole server — 200 innocent co-tenants drop at once; make the moral math explicit (one rack seizure vs the abuse you'd have to run to prevent it). (wave2_sysadmin_informed)
  - Frustration guardrail: recurring un-killable waves are the genre's fastest route to rage — hard-cap scripted sieges (2 per arc max), telegraph raids a full phase ahead with visible prep-verbs (wash, move, lawyer-up), and make every raid outcome *negotiable* (bribe, comply-with-part-of-the-order) so even loss is play. (wave2_gamedesigner_informed)
  - A Doomsday Clock of legal/diplomatic pressure over the whole level: takedowns arrive as seizures — a whole rack can be *removed from the board* by foreign authorities; counters: redundancy across jurisdictions, instant re-provisioning, and shell-company buildables (a legal entity = a buildable that absorbs exactly one subpoena); customers pay in crypto and payment failures are a gameplay axis; look: a neon-dark cybercafé at the edge of a grey map. (wave3_general_fresh)
  - The devil's ledger: 3–10× normal prices on risky rails — high-risk processors at 5–8% + rolling reserves (cash held hostage by the processor = a liquidity mechanic), crypto volatility; churn is extreme (tenants get seized by OTHER agencies constantly); each spam/malware/phishing-kit tenant is a *revenue-positive, reputation-negative customer type*; and the real strategic tension: legit operators quietly take some offshore business to fill capacity — a grey ToS toggle ("enforcement level") with a sliding scale, making this both a late-game villain campaign AND a mid-game temptation mechanic. (wave3_ceo_fresh)
  - Signature: **money vs legitimacy** — customers pay ×5 but each raises your Heat meter; when Heat maxes, a SEIZURE raid is the boss fight (network cut, doors, legal), and hosting something truly illegal triggers a worse variant; the whole game is a risk-tolerance dial; winning might mean *exfiltrating your profit* (a bank-escape goal!); the "can you beat the game on chaos mode" level. (wave3_gamedesigner_fresh)
  - Every legit stat inverted: abuse complaints are *expected*, uptime during attacks IS your marketing, and the regulator threat is a legal-countdown per jurisdiction; dark, wobbly UI, red lighting. (wave3_sysadmin_fresh)
  - Identity "The Neon Smuggler's Warehouse": palm silhouette + shuttered corrugated warehouse under rain, a winking magenta sign; your firewall is a literal bouncer; takedowns arrive as unmarked vans; seizures freeze your build in police yellow; customers pay in coin bags with dollar signs; the only place purple is "safe"; reputation economy inverted — infamy sells; comedic-relief levels. (wave3_visual_fresh)
  - Feel addendum: noir, rain, neon, *Cyrillic signage*; money arrives crypto-paid — chargeback-proof but traceable. (wave1_sysadmin_fresh)
  - The LAW is the enemy: seizure boats, domain takedowns, wire transfers frozen, informants inside, Interpol-level probes that escalate as you grow — and every scam customer you knowingly host detonates; builds: numbered companies (legal obfuscation service), cash-only billing, the panama-rack, a "compliance theater" office to fool inspectors; offshore reputation poisons the legit market — you can never transition to white-hat later without a "rebrand" purge event. (wave4_general_fresh)
  - Lawlessness as a mechanic: no real counters to takedowns, only *jurisdiction hops* (relocate your operation tower-to-island); customers pay fat premiums but arrive with attached heat meters; too much heat = seizure event that costs a whole board SECTION — build resilience via distributed state; a morally grey power-fantasy level. (wave4_gamedesigner_fresh)
  - Distinct: lawlessness as a FEATURE; builds: multiple upstreams, anonymized whois, encrypted tunnels, cash/monero billing; rival botnets attack you too; look: dim, red-lit, "no logs" signage, a paranoid bunker — a raid or processor ban can zero you. (wave4_sysadmin_fresh)
  - Visual "the pirate cove": racks in a shipping container on a beach, palm-thatch UPS coverage, seizure-interdiction boats on the horizon; your defenses include jurisdiction-screens — literal flags-of-convenience drawn as awnings — and cash suitcases; morally grey palette: sunset oranges over oil-slick greens. (wave4_visual_fresh)
  - The high-risk merchant economy: the real bottleneck isn't tech, it's MONEY RAILS — payment processors run you out, banks de-risk, ad platforms ban you, affiliates flee; margins 3–10× normal but every dollar collected costs a rail fee or a risk event; let the player feel why "just be a criminal host" is NOT the exploit it looks like. (wave4_ceo_fresh)

### "In Scope" / "Chapter 7 Compliant" / "The Clean Room" / "Chain of Custody" — Regulated hosting (HIPAA/PCI/FedRAMP)
The threat is a clipboard. **Dominant verb: Commit.** **Teaches: shrinking scope is cheaper than
defending it.**

**How it works:** New rule: **some builds are illegal and some data cannot leave a region.**
Everything you build is either in scope or out of scope, and **scope is the resource you manage** —
**scope reduction is a legitimate and powerful strategy**: segment the cardholder data environment
onto 3 machines instead of 40 and your audit cost drops 80%. Mechanics: segmentation, **evidence
collection as an ongoing staff cost** (not an event), quarterly scans, annual audits,
background-checked staff, and a change-control board that slows every action. **The audit trail is a
build requirement** — every structure must be logged, patched and documented, and documentation is a
resource you produce with staff time. Auditors are recurring NPCs; certification gates an entire
premium customer tier; a single violation can be a campaign-level catastrophe. Constraint-driven
design instead of threat-driven. The reward: contracts nobody else can bid on.
**Threats:** an unpatched CVE with a 30-day remediation clock; an employee whose access wasn't
revoked on termination; a log retention gap; an untested DR plan; a subcontractor without a BAA; and
a finding that your "encrypted" backups use a key stored next to the backups.
**Scoring:** you can be perfectly available and still *fail the level* by failing the audit. **Twist:
you can pass with a worse infrastructure and fail with a better one.** Great change of pace.
**The commercial half ("The Audit"):** the **compliance sales cycle** — deals take 6–18 months to
close but are worth 10× and almost never churn. The auditor is a *visitor type* who walks your
facility and can fail you. Win: pass with zero major findings **and** close two deals that were
blocked on the attestation.
**Visual:** "The Clean Room." Clinical white, matte surfaces, everything labelled — visually the
*most orderly* level type: aligned cables, uniform faceplates, signage everywhere. Every object gains
a **compliance chip**: a small violet tag that is sealed (✔), pending (…), or broken (✖). There is an
**Audit Overlay** camera mode where the whole world renders as a documentation diagram with evidence
callouts, and **uncontrolled objects are literally drawn as dirty** — smudged, fingerprinted.
Signature meter: **Control Coverage** as a checklist wall. Chord: clinical white · violet seal ·
evidence-tag blue · smudge grey · fail crimson.
**The painted line (the best buildable-as-image in the document), expanded:** the compliance boundary
is **a painted line on the floor** which is itself a buildable — and it should be **physically painted
by a staff member over time** when you place it (a 10-second animation of someone walking with a
paint machine), so that **re-painting it when scope changes is visibly a chore.** Anything crossing
it without proper marking flashes, and the **red thread persists as evidence until remediated** and
appears in the audit's findings list **with a photo**. Catastrophe: an auditor finds an unencrypted
path — a single red thread crossing the white floor, visible from any altitude.
**Interacts with:** §2.12 (the Finding, the 72-hour breach-notification clock), §1.12 `The
Regulator's Sandbox`, §1.12 `The Insurance Renewal`.

**Variations and additions** — second-pass entry: *Regulated Hosting (HIPAA / PCI / FedRAMP / gov) — "The Hospital-Bank" [LATE challenge]*

- The compliance mini-game: zones with air-gaps, visitor logs, encryption requirements, separation-of-duty rules, background-checked staff only. Threats include *auditors* (see The Audit), change-control boards blocking every fast fix (a buff you pay for with time), data exfiltration (existential — one leak fails the level), breach-notification doomsday timers (a leak you don't disclose = worse; you disclose = fine + trust hit), and APTs specifically hunting your tenants; plus the constant temptation to route around a rule "just this once." Mechanic: "paperwork" towers — every action needs an approval chain; the game slows you down *on purpose*, and the skill is designing infrastructure that needs zero changes. Customers: hospitals, banks, government — pay 8-10x, churn ~0, arrive only if compliance towers exist *first*, and if you fail they're fined and you're sued; tolerance for visible defects = zero. Money: slow to land, impossible to lose; paperwork burn (legal staff salaries). Builds: bastion host, full audit logging (it watches YOU too — the log tower reduces what you can hide from yourself), HSM, KMS, encryption at rest. Look: sterile hospital/government gray-blue-white, glass rooms with badge locks, clipboards, approval stamps that stamp themselves, redaction bars falling over events, audit trails as glowing lines set into the floor a camera can replay; badge *beeps* are the act's signature sound; a violation = a huge red STAMP with a concussive thud; any data crossing a glass line the wrong direction triggers a silent full-screen flash of red. (general, sysadmin, gamedesigner, visual)
  - Compliance as a tower stat: every buildable has an "auditable" flag; unlogged, unencrypted, or cross-border data flows are *failures even if uptime is perfect*; insider access and missing paper trails; customers take several minutes of game time to even arrive — plan ahead; look: red tape rendered literally as red tape you must route around. (wave2_general_fresh)
  - Sales cycles measured in game-quarters, deals in six/seven figures, everything costs 3x to build, churn near zero once in; auditors, breach-notification clocks, supply-chain attestations (SBOM!), FIPS-compliance buildables — the enterprise grind as a hosting type. (wave2_ceo_fresh)
  - Audit waves are the bosses; everything must be *logged* (visibility tower = your main DPS); data is sovereign: customer flows must stay inside a drawn jurisdiction border — a routing puzzle; nation-states as patient elite creeps; feel: clean-room white, badge scanners, stamping paperwork. (wave2_gamedesigner_fresh)
  - Everything slower, everything logged, everything costs 5x, and you *cannot* run it in some countries; breach-notification laws = a timer that fires once you're breached — then the whole world must know; data residency as a placement constraint; fines that can end the run. (wave2_sysadmin_fresh)
  - Alt identity "The Ministery": brutalist concrete, manila everywhere, forms that physically stamp themselves, green inspection ribbons strung across compliant rooms, a single red phone on the wall for incident reporting; humor: the final boss is a form; palette: institutional sage + paper white + stamp red. (wave2_visual_fresh)
  - The price of the moat: 12-24 game-month sales cycles (pipeline units stall), bonding/escrow requirements, right-to-audit clauses, and breach = *contract termination*, not only a fine — a termination-for-cause boss wave with a notification clock; surviving it is a whole act. (wave2_ceo_informed)
  - Separation of duties as a *placement* rule: the admin who *runs* the DB must not be the admin who *edits the audit logs of the DB* — two different staff sprites with two different keys; a shared-credential shortcut is *faster* (and the auditor's light cone catches it — or an attacker uses the shared key and the logs *can't show what happened*: the regulated double-fail); four-eyes approval = actions need two staff in range — you feel the speed loss, then the audit buff. (wave2_sysadmin_informed)
  - Intentional slowdown is only fun if the fast option exists as a *temptation* — pre-approved change categories run at normal speed; only out-of-policy actions queue; add a "variance filing" fast-path (costs approval points) so the paperwork tower trades, not stalls; then "design infra that needs zero changes" becomes the real meta, not a coping mechanism. (wave2_gamedesigner_informed)
  - Contradiction fix: the Hospital-Bank's "silent full-screen flash of red" on any glass-line crossing violates Impact Localization (feedback is pointed, never spammy) and will false-alarm constantly at scale — use a localized alarm (the line seals with a light-barrier and one soft *beep*); full-screen red reserved for a confirmed *exfiltration* only — scarcity is what makes the flash land. (wave2_visual_informed)
  - The compliance mechanic as a first-class system: every buildable carries an audit-tag; untagged connections glow red on the auditor's walkthrough; data can't leave a zone boundary (a physics wall — traffic literally cannot cross it); a *paper-based denial-of-service*: the regulator's requests queue and your staff must process them; lanyards everywhere. (wave3_general_fresh)
  - Slow money, big money: 5–20× market rates on multi-year RFP-driven contracts; the acquisition cycle (6–18 in-game months) is a *pipeline* you fund with proposal-writers and compliance certs long before cash arrives — a cash-flow trap; buildables include SOC 2 / HIPAA / PCI / FedRAMP *certification projects* — expensive, timeboxed, unlocking enterprise RFP waves; failure mode: one finding at one audit cascades into contract loss across the whole portfolio; churn is tiny once in (re-certification pain keeps them). (wave3_ceo_fresh)
  - Signature: **everything must be proven** — unlogged access = violation strikes; three strikes = game over regardless of uptime; insider threats ride a staff-trust meter; customers demand dedicated zones (buildables occupying entire wings). (wave3_gamedesigner_fresh)
  - The compliance state machine is the core loop: tamper-evident logs, least-privilege access, change tickets, background-checked staff towers; attacks are quieter but *existential* — one breach ends the company (in the real world it literally does); a "long level" design. (wave3_sysadmin_fresh)
  - Identity "The Marble Bureaucracy": infrastructure must be *visibly compliant* — every asset carries a required label tag, audit trails are literal paper trails laid on the floor, and the build menu only opens items carrying a certification stamp; chain-of-custody seals on racks; grid-on-grid formality, stamp ink, badge lanyards; breach = a fax machine going berserk; palette: government grey, manila, signet blue, serif fonts everywhere; a serious tone shift. (wave3_visual_fresh)
  - Endgame truth: you're not selling servers, you're selling *paperwork + guarantees* — RFP-gated sales and brutal upfront cost (audits, staff, segregation) protect a near-zero-churn base. (wave1_ceo_fresh)
  - Threats: nation-state APTs, insider threats (staff you must VET), audit fail-states, breach-notification legal waves, supply-chain tampering; builds: HSMs, air-gapped vaults, SIEM, SOC analysts, a background-check HR process, data-sovereignty partitions (EU-only racks); scoring includes a compliance meter alongside cash; procurement gauntlets before you can even bid; look: cleanrooms, stamping bureaucracy — darkly funny. (wave4_general_fresh)
  - Encryption, audit trails, and segmentation are PHYSICAL GEOMETRY: data must literally travel encrypted corridors (buildable "tunnel" towers); audit checkpoints arrive each wave; the insider threat is "a staff buildable you hired and now regret"; fines that scale with your revenue. (wave4_gamedesigner_fresh)
  - Distinct: compliance overhead + air-gapping; threats: data-residency violations, phishing for staff credentials, supply-chain tampering; builds: jump hosts, DR site, separation-of-duties enforcement; look: badge readers on everything, red "restricted" zones. (wave4_sysadmin_fresh)
  - Visual "the hospital-meets-bank": sterile whites and navy, ROUNDED corners on everything, pictogram signage, badge readers visible on every object, audit-trail printers churning paper ribbons that snake across the floor — oppressively tidy. (wave4_visual_fresh)
  - Sell attestation, not compute: the product IS paperwork — BAA signed, FedRAMP-in-process, data-residency guaranteed, sub-processor list published; price goes inelastic once compliant; the moat is the compliance tree itself; longest sales cycle in game, highest retention. (wave4_ceo_fresh)

### "FedRAMP Purgatory" — Regulated hosting, the extreme variant
An 18-month, multi-million-dollar, **zero-revenue** sales cycle.

**How it works:** New: **financing a moat.** You literally cannot survive this level on cash flow;
you must raise capital or co-fund with a sponsoring agency. Win: reach authorization before the
runway ends. **Losing here is a legitimate, interesting loss.**

### "The Border" / "Sovereign" — GDPR / data residency / national cloud variant
Data has a nationality.

**How it works:** At the world-map altitude, national borders are drawn and data is tinted by
residency. **Watching a green (EU) data mote cross a border and turn red is the entire mechanic,
rendered.** Buildable: the **Residency Fence** — draw a fence on the map, data motes bounce off it.
Policy as level geometry. Signature dilemma: a failover moved data across a border; you "survived"
the outage and broke the law doing it.
**The sovereign-cloud variant adds procurement as a lane:** public tenders, mandatory local
ownership, bid bonds — long, slow, enormous. Harder: a competitor **protests your bid award.** Win:
win the framework agreement. Data residency also becomes a *sellable feature*, not only a
constraint.

**Variations and additions** — second-pass entry: *Sovereign Internet / Closed Cloud — "The National Cloud" / "The Embassy" [LATE finale]*

- You run a country's .registry, its ministries, its tax portal's big brother: threats are *other governments* (APT with diplomacy rules — striking certain attackers triggers sanctions events), censorship-evadee swarms (traffic that is politically customer and technically threat), BGP as a nightly news sport; builds: in-country-only zones, IXP as a political negotiation map. (wave2_gamedesigner_informed)
- Regulated hosting pushed to geography: data cannot leave the country; *staff* may need citizenship clearance; hardware imports can be *blocked* (GPU embargo event: customers want capacity you legally cannot buy); every asset has a passport, and the failover ability you love elsewhere is *illegal here* — the backup region must be sovereign too, at 3x cost; the natural capstone for the Regulated branch, honest about the 2020s cloud landscape. (wave2_sysadmin_informed)
- Look: a walled mission compound with border checkpoints *inside* the datacenter; racks carry little flags; crossing a data packet the wall without paperwork trips alarms. (wave2_sysadmin_informed)
  - Data-residency walls are physical barriers on the map (data legally can't cross); multi-DC play where you have one fully-loaded DC and one that *can't* receive replication (a legal air-gap); attacks come from foreign actors + the government itself is both protector and auditor; an Act IV puzzle variant. (wave3_gamedesigner_fresh)

### "Exchange Colo" / "The Microsecond Cathedral" / "The Meter Stick" — Financial low-latency colocation
A comedy of physics.

**How it works:** New rule: **cable length is measured in metres and it is the product.** Cable
length is contractually equalized for all tenants; microseconds are what you sell; a customer will
pay enormous money for a cabinet three metres closer to the matching engine. **Fairness is enforced by
cable spool**, and you sell *equal* latency as a product. The threat is a tenant who finds an unfair
advantage — a microwave link, an FPGA, a cable someone cut 2m short — and the **regulator who audits
your cable lengths.** Introduces nanosecond-scale thinking.
**Visual:** obsidian and gold, trading-floor teal; beautiful coiled excess fiber on every rack — a
real-world detail that looks amazing and explains itself. Signature meter: **nanoseconds**, drawn as a
ludicrously precise readout. Catastrophe: one tenant gets a 40ns advantage and the others riot (angry
client sprites with lawyers). Chord: trading-floor teal · fiber aqua · brass meter · latency scarlet
· equality white.
**Make the coil the meter:** the coils should be **visibly identical in diameter across all tenants**
— that identicality *is* the fairness contract — so a tenant with a slightly smaller coil is the
level's catastrophe, **spottable by eye before the number tells you.**

**Variations and additions** — second-pass entry: *HFT / Ultra-Low-Latency Finance*

- **HFT / Ultra-Low-Latency Finance.** Latency in microseconds; the *board itself is speed* — cable lengths are literally the paths, shorter = better. Threat: one dropped packet = a red day. Customers: 3 whales. Builds: microwave relays, same-DC co-location arbitrage. The antithesis of everything else in the game — a perfect palate-cleanser/comedic-contrast level. (gamedesigner)
  - Change the game speed, not just the theme: the level runs at 8× sim speed with correspondingly short patience ribbons (customers ARE market makers: they quote and vanish in seconds); cable length is the *only* meaningful stat (a placement puzzle with one optimization axis and zero combat); the dropped-packet loss condition is binary (one loss = red day = level over); its three whales double as the concentration-risk lesson. (wave2_general_informed)
  - "HFT Microsecond Theater": the HUD clock runs in µs and visibly ticks absurdly fast; the map is a few gold cables at carefully measured lengths (rulers appear when you move them); microwave relays are literal dish-to-dish arcs with an alignment-squeak when true; customers are three suits at a table with a bucket of cash, tapping watch-glasses synced to your every dropped packet; the whole act is quiet except for one metronome. (wave2_visual_informed)

### "Pass Window" / "Ground Station" / "The Dish Field" — Satellite ground-station hosting
You cannot reschedule the sky. **Dominant verb: Schedule.**

**How it works:** New rule: **the physical site is hostile and far away**, and customers need the
dish at exactly the 9–11 minute window their satellite is overhead. Scarce resource: **antenna time**
— you sell passes, not servers, so **yield management (airline-style) becomes the pricing game.**
Threats: weather (rain fade), RF interference, a motor failure on the dish, and two customers wanting
overlapping passes. Every physical hand action takes hours or days; you must build for remote
recovery or lose the site for a week. **The ultimate expression of Pillar P4.** **Twist: a missed
window is gone for 90 minutes; you cannot buy your way out of time.** Win: >80% pass utilization with
premium-priced priority slots.
**Visual:** "The Dish Field." An outdoor level: desert tan and big sky, weather, a field of dishes
that physically slew to track passes. The signature visual is the **pass window** — a lighted arc
across the sky HUD that opens and closes, and everything you need to do must happen inside the lit
arc. Rain fade is the arc going grainy. A satellite crosses on a visible arc and your contact window
is a closing wedge. Failure as an astronomical certainty you cannot argue with. Chord: sky gradient ·
dish white · horizon amber · fade static · lock-on green.

**Variations and additions** — second-pass entry: *Satellite Ground Station / Space Data — "The Sky Dock" [LATE]*

- You downlink, archive, and serve orbital data; customers are satellite operators + agencies; traffic arrives in *predictable orbital windows* — the pass schedule is the level's wave clock (you know exactly when the flood lands: TD with a visible tide table). (wave2_general_informed)
- The real boss is physics: rain fade on Ka-band, sun outage (twice a year the sun aligns behind the bird and eats your SNR on schedule), pointing-loss events; regulatory: spectrum coordination disputes arrive as cease-desist threats from other operators (the license is the tower). (wave2_general_informed)
- Builds: dish banks (mechanically slewing — travel time between passes is your queue problem), cryo LNAs, store-and-forward vaults (late data is worthless: the archive is a stopwatch tower); money: per-pass + per-GB with long blackout seasons. Look: white domes like eggs on a wind-scoured headland; passes arc overhead as comets dumping golden data rain; a sun outage = a blinding white screen wipe that costs you a pass. (wave2_general_informed)

### "Eighty Little Sites" / "MEC" / "The Roadside" / "The Street Cabinet" — Edge / 5G micro-datacenters
Instead of one datacenter you have 80 closets in cell towers and shopping centres.

**How it works:** New rule: **no staff anywhere.** Each site is 4U of gear with flaky power and a
four-hour drive between them. **Everything must be remotely recoverable or it's a truck roll** —
out-of-band management, watchdog reboots, dual-bank firmware, A/B partitions. You can't fix them
individually, only in policy. The whole level teaches **operational leverage at low density** — and
the player learns to buy an out-of-band LTE modem for every site, which is exactly what real
operators do. A late-campaign capstone that tests everything you automated.
**Signature failure:** you push a firmware update that breaks the network stack on 40 remote sites at
once and now the only fix is physical. **The game's ultimate "verify your rollback path" lesson.**
**The channel problem ("Closet at the Cell Site"):** **carrier revenue share** — you don't own the
customer, the carrier does, and takes 40%. Channel conflict: the carrier can decide to compete with
you. Win: build enough direct-billed customers to survive losing the carrier.
**Visual:** micro-datacenters as kerbside cabinets at intersections, rooftop shelters and tower
bases, scattered across a city map. Tiny footprints, harsh environments (heat, vandalism, a car hits
one, a padlock people keep cutting). **The fog of instrumentation is the whole level.**

**Variations and additions** — second-pass entry: *Edge / 5G — "The City Diorama."*

- **Edge / 5G — "The City Diorama."** A tiny nocturnal city with glowing rooftop boxes; pedestrians tether to the nearest box with visible light-lines and re-tether as they walk. The challenge is coverage topology, not capacity — dead alleys are literal dark patches. (visual)
  - Edge PoP network: dozens of tiny sites in buildings worldwide instead of one big DC — real-estate leasing per city, backhaul contracts, per-site staff of ONE (a field-tech who services all of Europe: single-point-of-failure drama); the latency map IS the tower-placement layer; customers buy proximity; late-game expansion mode. (wave3_ceo_fresh)

### "The Swarm" / "IoT Backhaul" / "The Hive Hum" — IoT device backends
Millions of tiny devices with terrible firmware.

**How it works:** All reconnect at the same second after any blip — the **thundering-herd reconnect
storm**, the worst retry storm in the game — and can never be patched. Their certificates all expire
on the same day because they were provisioned in one batch. **Twist: your customer *is* the botnet,
accidentally** — a firmware bug in a customer's device fleet makes 4 million devices retry in
lockstep.
**Visual:** visitors are dust-sized, only ever visible as aggregate ribbons or a constant grain of
dust motes — **the art problem *is* the level's mechanic: you can only ever see aggregate texture,
never an individual device.** The herd converging is a huge **cyan** wall, not a magenta one —
sometimes your own customers are the DDoS.

**Variations and additions** — second-pass entry: *IoT Fleet Hosting*

- **IoT Fleet Hosting.** Millions of tiny dumb clients arriving as fine dotted streams from all compass directions — individual customers nearly invisible; the aggregate flow is the character. Firmware-update avalanches (deploy one bad update = half your fleet bricks mid-level), botnet recruitment of *your own devices*. The horror beat: the dust turns red and organized = the botnet-reflection level. Teaches fleet-scale abstraction — you fight spreadsheets, not sprites. (gamedesigner, visual)
  - IoT / Industrial Hosting variant: millions of tiny devices, mostly idle, then simultaneously chatty (fleet update storm); botnet-ification of YOUR tenants' devices (Mirai-style — the customers' hardware attacks you); geographic spread with satlink latency; look: sensor-field dashboard, blinking telemetry. (wave2_general_fresh)
  - The mirror level: your defense is against the botnet *turning your own tenants into attackers* — customer-flow suddenly reverses and marches back out as DDoS reflectors; mid-campaign twist gold. (wave2_gamedesigner_fresh)
  - Visual "The Antenna Forest": thousands of tiny device sprites (camera, thermostat, tractor!) blink across a wide dim map; fleet malware glows sickly green per device; a "fleet pulse" animates across tens of thousands of LEDs for pure spectacle. (wave2_visual_fresh)
  - Millions of tiny clients with terrible security; they ping you constantly; botnets recruit *your own customers* from inside — defense is authentication/patrol, not walls. (wave3_general_fresh)
  - IoT Device Fleet Backend — the scale-meltdown level: nothing is individually important, everything collectively kills you; fleet-wide firmware bricking (one bad update = 400k dead devices = instant churn); signature mechanic **the army of the dead**: infected devices from your fleet return as the attack wave you must reject *without* disconnecting paying ones — false-positive tension distilled. (wave3_gamedesigner_fresh)
  - IoT broker farm: hundreds of thousands of persistent MQTT connections, devices that can't update, firmware from 2016; every idle device is an amplifier/reflection waiting for a C2 takeover (the botnet-in-waiting); **connection-table memory is the scarce resource**. (wave3_sysadmin_fresh)
  - Botnet recruitment attempts (Mirai-style: your devices DEFECT), firmware-update stampedes (100k devices update at once — a load spike YOU scheduled!), weird protocols; builds: MQTT brokers, device-shadow caches, geofenced ingress; money: per-device micro-fees — scale is the enemy. (wave4_general_fresh)
  - A botnet is born from the devices you FAIL to serve: leaked customers convert into attackers at the door — the churn lane loops back into the threat lane (unhappy customers literally come back as bots); signature-mechanic variant. (wave4_gamedesigner_fresh)
  - The business is device count × TENURE: pennies per device, but one firmware-vendor partnership is worth 100,000 customers — losing it is instant 30% revenue evaporation; introduces platform-dependency risk as a hosting-type trait. (wave4_ceo_fresh)
  - Visual "the ant farm" (name collides with the Kubernetes Ant Farm — rename one): your datacenter is mostly ELSEWHERE — thousands of tiny endpoint dots on a city map with one nervous control server; attacks land remotely; you defend by patching over-the-air (an animated ripple crossing the endpoint dots); unusual defensive topology: defenses at distance. (wave4_visual_fresh)

### "Node Sync" / "The Ledger Wall" / "The Clock Tower" — Blockchain node hosting
A level about a workload you cannot pause, prune, or reason with.

**How it works:** Storage grows forever, sync takes days, brutal IOPS, and the network can hard-fork
under you. Customers care about one number: uptime during a specific event.
**Visual:** everything paced to block time; a giant visible clock/heartbeat drives the level and
falling out of sync is drawn as your tower's hands drifting away from the reference clock overhead.
Each node has a visible chain with fork divergence shown as branching; falling behind is visible as a
shorter chain.

**Variations and additions** — second-pass entry: *Blockchain RPC / Archive-Node Hosting — "The Ledger Library" [LATE]*

- Indexing and serving chain data — a serious operations level disguised as a joke-cousin of the game's web3 parody; you cannot fire a chain: every supported network is a permanent sync obligation (a reorg = a physical book falling off the shelf and being rewritten); "one query that costs a hundred thousand" — abusive RPC calls that look like traffic; reorg storms, MEV bots as scavengers, 51%-chain fork events; interacts with game-hosting join grammar and storage durability. (wave3_general_informed)

**Variations and additions** — second-pass entry: *Crypto Validator / Staking Host*

- **Crypto Validator / Staking Host.** Slashing = HP loss for config mistakes; double-sign = instant catastrophe; energy-politics events; customers are token holders who riot on price drops. Late-game alt-economy. (sysadmin)
  - Turn slashing into the defense stat: slashing = automatic MRR burn when your config double-signs (a mis-upgrade = instant coin immolation — patch windows become *existential*); attestation duty = the tower must stay online or earns nothing AND gets jaywalked by peers (uptime as literal income); governance-vote events = scheduled customer riots where your fleet's *voting weight* becomes a map resource you can spend (or sell). (wave2_general_informed)
  - Visual "Crypto Validator Chapel": staked capital is a glowing reliquary on the rack; uptime duties are hourly candle-lightings; slashing cracks the reliquary and coins leak; double-sign spawns a mirror-demon for one terrible second; customers riot as a congregation with pitchforks when token price drops. (wave2_visual_informed)
  - Validator/node-operator customers are brutally SLA-sensitive: double-signing = slashed = YOU pay when your infra faults — penalty clauses literally transfer consensus losses onto your balance sheet; revenue: fat retainers, uptime-obsessed; threat signature: chain reorgs, protocol emergency forks, and an exchange collapse taking out your top customer (the FTX-shaped event); mid-late. (wave3_ceo_fresh)

**Variations and additions** — second-pass entry: *Blockchain / Web3 (a joke act)*

- **Blockchain / Web3 (a joke act).** Everything gold chrome; customers wear wallet-address helmets; the 51% attack is a giant hand stacking physical blocks on your roof until you're buried; "token of the week" pays in confetti that evaporates. (visual)
  - Satirical act variant: revenue token swings 10x daily (the economy system becomes a literal rollercoaster), threats are rug-pullers and governance-attack mobs, customers churn on price only; a self-contained volatility sandbox. (wave2_gamedesigner_fresh)
  - Give the joke a spine: gas fees = bandwidth prices that spike *because other players exist* (a market-density meter); the 51%-attack roof-blocks hand *scales with your own hashrate dependency* (the more business you took from them, the bigger the hand — every-build-is-a-bill applied to a gag); reorgs = the snapshot-rollback mechanic with customers *walking backward* — the joke lands harder when it's clearly the same systems everyone already learned. (wave2_general_informed)
  - Token-price volatility IS the weather: node demand and revenue spike/crash on coin-price waves — the market is a literal tide covering and uncovering parts of the map; abuse is constant (51% mobs, rug-pull clients whose traffic legally involves YOU now); money follows a feast/famine rhythm; a satirical late-game level that pairs beautifully with GPU. (wave3_gamedesigner_fresh)
  - Mempool traffic, gas-fee auctions as the pricing mechanic, 51% swarm attacks, rug-pull customers who leave without paying — the joke IS the economy. (wave4_gamedesigner_fresh)
  - The non-joke half: blockchain/Web3 NODES (RPC endpoints + validators) — MEV bots, double-spend attempts, consensus halts, gas spikes; customers are dapps and traders; volatile revenue; niche mid-late; serious node ops live in the Ledger Library type. (wave4_sysadmin_fresh)

### "Busy Signal" / "Ring 0" / "The Modem Wall" / "Dial Tone" — Dial-up ISP (period, ~1996)
**The best tutorial level in the entire game**, because every modern concept has a simple physical
analog here. **Teaches: concurrency is countable; oversubscription is a bet.**

**How it works:** New rule: **modems are a hard, countable concurrency limit.** Visitors are callers;
if all modems are busy they get a busy signal and churn (three busy signals and a customer cancels).
Your capacity is literally a count of modem ports in a rack of Portmasters/Total Controls, and your
real bottleneck is **inbound phone lines (a PRI = 23 channels)**. The core decision is the
**oversubscription ratio** (lines to subscribers; the industry standard was ~10:1 and you tune it
live) — **the ancestor of every capacity decision in the game, made beautifully concrete.**
**Threats:** a telco outage; a lightning strike on the copper plant; a modem card dying; **a telco
that takes 45 days to provision a PRI** (the first lead-time lesson); a war-dialer; the "always-on
abuser" who stays connected 24/7 to hold their line; **the RADIUS server dying — nobody can log in,
but the lines all answer: a perfect "green dashboard, dead service" scenario**; a Usenet feed eating
your entire transit budget; long-distance charges if you have no local PoP in a town; a "free hour"
promo that triples call volume overnight; a competitor offering unlimited hours; and AOL mailing 40
million CDs.
**The scripted market event:** AOL goes flat-rate mid-level and destroys your per-hour billing model.
You must decide whether to follow them off the cliff. *CEO truth: this is the original hosting
business-model failure — pricing flat while cost is metered.* Win: survive 12 months without your
busy-signal rate exceeding 3%.
**Twist: period rules** — no encryption exists, every password is plaintext, and the threats are
*people* with war-dialers. The visual and audio era shift is the reward.
**Buildables:** modem banks, PRI/T1 lines, RADIUS, an NNTP feed server that costs more bandwidth than
everything else combined, a shell box, a web-hosting box with 5MB per user, a Usenet spool that grows
faster than you can buy disk.
**Visual:** "The Switchroom." Beige and CRT; a wall of modem banks with 96 blinking lights whose LEDs
chatter in handshake rhythm, a dot-matrix printer logging nightly stats, dial-up handshake audio,
text-mode menus and ASCII graphs. Visitors are *individual people* dialing in, drawn as a little
handset icon riding a copper line. The support queue is a *phone* queue with hold music. Chord: beige
· phosphor green · CGA cyan · warning magenta · dial-tone grey.
**The Busy Wall grammar (a bigger idea than the level it is trapped in):** the busy-signal ratio,
drawn as callers bouncing off a wall of occupied lines, is **the clearest capacity visual in the
game** — so make its reuse an explicit design rule. **A finite row of discrete slots, each lit when
occupied, with arrivals visibly bouncing off when full** becomes the canonical rendering for *every*
hard concurrency limit: SYN connection table, VoIP channels, game-server slots, PHP worker pools, GPU
cards, colo cabinets, tape drives, DR standby slots, modem lines. **One grammar, eight systems,
learned once in the tutorial level.**

**Variations and additions** — second-pass entry: *Retro Dial-Up ISP — "The 1995 NOC" [EARLY/MID era level]*

- 1995 mode. Customers *literally crawl in over phone lines*: modem-handshake screech = the admission gate, busy signal = lost customer with no retry forgiveness; bandwidth = lane width and 14.4k→56k modems are lane upgrades; callers physically occupy a modem-bank slot (capacity = 12 screeching modems, and *the sound of the queue filling* is your resource meter — a diegetic HUD). Threats: nobody hacks you, the *physics* attacks — POTS line quality, modem-pool exhaustion, kids picking up the phone (line-drop events), the neighbor's microwave, phone phreaks and war dialers, long-distance pumpers (phone-bill fraud), teardrop attacks, modem-noise storms, the BOFH. Builds: modem banks, NAS servers, ISDN upgrade path, T1 lease, a news/IRC server for retention, a switchboard operator UI. Money: hourly dial-up cards + long-distance arbitrage + 1-900 lines as the shameful high-margin tower. Atmosphere level that doubles as a mechanics tutorial because everything is slow enough to study; a whole act can ride nostalgia — the "true internet" before danger. Look/sound: CRT amber-green phosphor 800x600, beige towers, carpet tiles, a pegboard jack wall where every line terminates in an RJ11 with a real cord you hand-patch, Win95 windows, modem chatter + dot-matrix printer ambience, alerts ring as actual desk phones; the modem bank's blinking is the act's LED chorus. (general, sysadmin, gamedesigner, visual)
  - A whole era as mechanics: the phone line is literally the path, busy signals are the failure state, the handshake screech is your income sound; max 56k forces brutal admission control; callers queue in a parking lot; the level ends when broadband arrives and the whole customer base evaporates no matter how well you played — a melancholy milestone level. (wave2_general_fresh)
  - Tutorial level in period costume: 56K modems as literal bandwidth towers, a phone-line pool as shared resource, customers are hobbyists paying $19.95/mo, competitors are the big telcos; churn arrives as "DSL shows up in town" (technology-displacement as a wave type); warm, funny, teaches the whole loop gently. (wave2_ceo_fresh)
  - Customers tolerate absurd latency (patience meters are huge); the "Microsoft comes to town" market-event wave; CRT scanline shader, modem-handshake SFX as the soundtrack motif. (wave2_gamedesigner_fresh)
  - THE nostalgia level: customers are AOL-era families who stay online for hours because local calls are free; the boss-key caller swarm at 5pm when homework ends; "can you hear me now" static degradation; the serial console; perfect early-act-1 chapter. (wave2_sysadmin_fresh)
  - Alt identity "The Phosphor Garage": CGA/EGA-limit palette (cyan/magenta on black), ASCII-ish signage, modem LED panels as the primary UI, CRT curvature overlay toggle, hand-drawn "BBS SYSOP" signage; everything beige plastic under warm bulbs. (wave2_visual_fresh)
  - The honest 1995 P&L: telco per-line wholesale cost vs retail margin (modem pool = take-or-pay), prepaid calling cards/1-900 as float machines, and the real killer — DSL arriving as *technology displacement churn* (a slow, unstoppable wave you can only price-dance or early-exit): era economics as a prefiguring of the whole campaign's competition mechanics. (wave2_ceo_informed)
  - Physics-only threats for a whole act feel samey after two levels — escalate the human menace across the act (phreakers → BOFH pranks → the first scanner as a final "what's coming" teaser); the era's safety is the *premise*, not the wave table. (wave2_gamedesigner_informed)
  - The sound-of-capacity HUD needs its lamp wall: 12 modems, each with an in-use lamp and a tiny cord that lifts and connects per caller; when all 12 dance and the queue rail overflows past the "sorry, all circuits" sign, you have HUD-free capacity readability; the kid-picks-up-the-phone event should *visibly yank a cord from the jack wall* mid-session. (wave2_visual_informed)
  - Nightly wave rhythm: callers surge at 6pm; customers wait on busy signal (patience meter) then bang the modem in frustration; threats: wardialers, phone-bill fraud (phreakers), a competitor's "unlimited" plan; no internet-graphic elegance — everything is beige towers and coiled cords; fantastic thematic early/tutorial-era or nostalgia bonus level. (wave3_general_fresh)
  - The nostalgia campaign: prepaid monthly credits + per-hour calling sold at retail counters (prepaid cards as a *distribution buildable*!); each PoP is a shelf of modem banks (capacity-limited pools), busy signals = visible lost revenue; customers physically path to the nearest PoP; the tech tree is 56k → ISDN → DSL → cable modem and each generation *strands* the prior buildables — the cobbler's children dilemma: do you cannibalize your own modem farms early?; tech support as an open floor of cubicles — this level teaches the support economy brutally; a whole prequel campaign where half the tech is "answer the phone." (wave3_ceo_fresh)
  - Signature: **the phone network is the map** — customers ride physical copper through central-office switches; modems are literal handshake towers; threats include the "million-hit wonder" (one viral FTP archive melts your only 56k path), BBS drama mobs, and a SysAdmin-humor boss called "The Net"; long queues on the sidewalk = FREE ADVERTISING (visible lines literally attract more callers — a delightful inversion of TD queues!); the whole level *sounds* like the 90s and instantly teaches the two-flow loop without cyber-jargon. (wave3_gamedesigner_fresh)
  - Identity "The Beige Time Capsule": the level runs inside a Win95-ish window; callers physically plug phone cords into a switchboard wall; handshake sounds punctuate every arrival; threats: the HOAX fax, the modem-toll-fraud pirater; deliberately LOWER visual fidelity — nostalgia is the point, and it trains the player's era-awareness; 8-bit customer sprites, dithered textures, system beige on teal; opening tutorial-level anchor. (wave3_visual_fresh)
  - Period irony buildable: "web browsing" arrives as a *new service that terrifies your game-server business* — the first technology-displacement tease; and one misconfigured USR modem can take a whole modem bank down. (wave1_gamedesigner_fresh, wave1_ceo_fresh)
  - Threats are physical — phone lines degrade, modems negotiate (bandwidth as a *game resource*), kids-off-the-hook drain lines, and the BOFH is a PLAYABLE TOOL; spam hasn't been invented so threats are cute (a virus via BBS upload); builds: modem banks (huge, satisfying rows), terminal servers, ISDN upgrade, a Usenet news server (a whole sub-system!), shell accounts; the "3 a.m. peak" is a scheduling puzzle; its charm makes it the tutorial-era alternate campaign. (wave4_general_fresh)
  - Customers queue OUTSIDE the board entirely: dial tone vs busy signal is your shop-front; threats include phone phreaks, VIRUS BY FLOPPY (a physical threat lane!), and the Cost-Of-Calling bill-shock churner; feel: amber CRT, startup chiptune. (wave4_gamedesigner_fresh)
  - Distinct: physical phone lines, scarce modems, baud as bandwidth cap; busy signals, line noise, a single PBX misconfig, long-haul toll charges; builds: T1s and "walled garden" content; customers: 1990s households and AOL refugees. (wave4_sysadmin_fresh)
  - Visual "the wood-paneled office": beige-on-beige, dot-matrix printers, the phone-patch wall AS the tower core, modem-handshake SFX as the soundtrack; callers arrive along coiled telephone cords; UI renders in a chunky 4:3 safe-area with a toggleable faux-CRT scanline filter. (wave4_visual_fresh)
  - Impulse-billed scarcity: customers pay per-minute through the phone company and dial YOUR modem pool; the product literally degrades with weather and distance; the business lesson of the era — capacity = hardware = dollars (no elastic anything) and every customer has an off switch (call waiting!); a warm nostalgia tutorial for scarcity economics. (wave4_ceo_fresh)

### "The Shell Box" / "MOTD" / "The Terminal Room" — BBS / shell accounts / IRC leaf (period)
A single multi-user UNIX box with actual humans logged in.

**How it works:** Tiny scale, huge personality; users are named individuals in a userlist. Threats
are local and social: a user compiling a fork bomb, a `.rhosts` file, an IRC bot that gets your whole
server DDoSed off the net by a rival channel takeover, trolls, floods, nukes, netsplits. The scale is
tiny and the stakes are personal. A charming, low-pressure narrative level.
**The 1988 BBS variant ("The Sysop's Ledger"):** four phone lines, donation-ware, long-distance
charges. Revenue is tips, door-game fees and a newsletter. **Charmingly tiny numbers; the whole P&L
fits on one screen.** Win: pay the phone bill.
**Visual:** pure text-mode; the whole game renders as ANSI art with box-drawing characters on an
80×25 grid with a blinking block cursor. Threats are ASCII. **This should be an unlockable *style*,
not just one stage.** Catastrophe: an IRC netsplit drawn as the userlist tearing in half.

### "The Usenet Feed" / "The Firehose" / "The Paper Mill" — Usenet (period)
Your scarce resource is **disk and inbound bandwidth**, both consumed by a firehose you cannot slow
down, mostly of binaries nobody admits to wanting.

**How it works:** Retention days is your product. Purely about storage economics. Your "visitors" are
*peers*, not customers: you exchange feeds with other sites and your standing in the network is
social. Threats are spam cancels, flood bots, netsplits, takedown notices, and the sheer exponential
growth of binaries groups eating every disk you own. A great absurdist level.
**Visual:** an unstoppable torrent of articles drawn as a waterfall filling barrels — or enormous,
ever-growing paper stacks, where **the visual joke is that storage grows faster than you can build
for it and the room slowly fills with newsprint until you can't see the floor.**

### "Web Ring" — Early web hosting (period)
Traffic comes from *links*, not search.

**How it works:** Attraction is a social graph — a completely different §3.6 acquisition model for
one level. Your site is a link in a visible circular chain of other sites; a broken neighbour breaks
the ring and you watch traffic stop flowing around it. Pairs with `index.html` as the 1998 tutorial:
one Apache, one cgi-bin, a guestbook script, and the first tradeoff — enabling the guestbook brings
visitors AND brings the first spam bot. Win: 1,000 pageviews without the box falling over.

**Variations and additions** — second-pass entry: *Web 1.0 Static Host — "The Museum Act" [EARLY breather]*

- A deliberate idle palate-cleanser: static pages, zero DBs, threats reduced to entropy + a single cute port-scanner that visits weekly; the level's real antagonist is *growth*: customers slowly accumulate until one accidental CGI script (a tenant uploads one file!) detonates the whole threat catalog; teaches minimalism, ends with the founding of your first DB — the "First Real Lease" beat played in reverse; early or between-acts breather. (wave2_gamedesigner_informed)

### "Chain of Trust" / "Trust Store" — Certificate Authority / managed PKI
You issue the certificates everyone else's padlock depends on, and your business exists **at the
pleasure of four browser vendors.** The purest expression of "your business runs at the pleasure of
someone bigger than you."

**How it works:** Unit = a certificate. Scarce resource = **trust-store inclusion / root program
standing**, which you do not own and cannot buy. Fatal failure = **a single mis-issuance** — one
certificate issued for a domain the requester didn't control ends the company, because the punishment
is removal from root stores: commercial death with a six-month fuse. Customer = everyone, indirectly;
your paying customers are resellers and enterprises. Patience analog = **issuance latency** (DV in
seconds, OV in days, EV in weeks). **Verb: validate, log, prove.** Your failure modes are
*procedural*, not technical.
**New mechanics:**
- **Certificate Transparency** — every certificate you issue is published to a public append-only log
  within seconds, so **your mistakes are auditable by strangers in real time and the entire internet
  is your QA department.** A **CT Monitor** is a defensive buildable that watches for certificates
  issued *for your own customers by other CAs* (hijack detection) and for your own mis-issuance
  before someone else finds it.
- **The Root Ceremony** — a scripted, filmed, multi-party, air-gapped key-generation event you must
  perform, with witnesses, in a locked room, on a schedule. A beautiful set-piece level with no
  combat, where the threat is "somebody coughed and we have to start over."
- **The Revocation Problem** — revoking a cert doesn't actually stop it working for most clients;
  OCSP is slow, CRLs are huge. A **mass-revocation event** (revoke tens of thousands to 3 million
  certs inside a **5-day window mandated by the root program**, whether or not your customers can
  deploy that fast) is a boss fight where the enemy is your customers' inability to rotate.
**Threats:** the Baseline Requirements audit; a researcher who finds your domain-validation method is
bypassable (the White Hat archetype with company-ending leverage); a CAA record you failed to check;
a validation method deprecated retroactively; intermediate key compromise; a government demanding an
intermediate; a customer who wants a cert for a domain they *almost* own.
**Signature catastrophe: distrust.** A browser announces that certificates issued by you after date X
will not be trusted, and **your entire product stops working for everyone at once, on a schedule,
publicly.**
**Signature meter:** **Trust Store Inclusion / Root Program Standing** — a row of browser and OS
emblems (four pips) that are green, amber, or **gone**. You cannot influence them directly; you can
only be boring for years.
**Visual:** notarial. Wax, seals, ledgers, a vault, a ceremony room with cameras.
**Interacts with:** §2.9 Certificate Expiry (you are the other end of that story), §1.2 The Auditor,
§5.6 (a line that cannot be entered casually — the prerequisite is years of clean audits), §1.12
`Mass Revocation`.

**Variations and additions** — second-pass entry: *Certificate Authority — "The Trust Mint" / "The Notary" [CAMEO, brutal]*

- Your product *is* trust: one HSM vault at the center; the whole internet (game map) walks a trust chain back to you; a single compromise = the level auto-fails in a *chain-collapse* ending (every padlock on screen flips to a warning triangle — the game's darkest cutscene). (wave2_general_informed)
- A mis-issuance (fake cert for a bank's domain) = browser-root-program crisis level: Mozilla/Google deadlines as an unstoppable countdown, CRL/OCSP responders stampeded the moment you revoke (the revocation stampede is the real killer — everyone asks "is it still valid?" at once), and the *key-compromise drama*: your own signing keys offline (the level that finally uses the HSM); cameo level, brutal, unforgettable, and true (DigiNotar, Symantec). (wave2_sysadmin_informed)
- Threats: CAs are phishing targets (fake-customer "corporate email compromise" aimed at your issuance desk), browser-root-store politics (external random event: a browser vendor changes rules; adapt issuance policy within 60 days or your certs stop being honored), and OCSP/CRL availability (your *answer line* must be up or the world stalls); builds: issuance policy engine (strict = fewer certs = angry customers; lax = one fake org gets in), certificate-transparency log (public ledger — protects you *and* exposes you), cross-sign relationships with elder CAs; money: enterprise contracts only; free-tier is the ACME bot doing your retail. (wave2_general_informed)
- Look: a medieval mint/seal chamber — every certificate is a wax seal stamped and shipped; a revocation = a bell tolling across every page at once / a scriptorium with wax-seal animation for issuance; a revoked seal visibly cracks; the stampede = a pilgrimage to the confession booth (OCSP). (wave2_general_informed, wave2_sysadmin_informed)

### "Whois" / "Redemption Grace" — Domain registrar and registry operation
The most load-bearing and least visible business on the internet, and a completely different animal
from DNS hosting.

**How it works:** Unit of sale = a **registration-year**. Two sub-lines with different rules.
**Registrar**: retail, thin margin, volume, upsell-driven, and your real product is *not losing
people's domains*. **Registry**: you operate a TLD with an ICANN contract, a mandatory **data-escrow**
obligation (a nightly deposit of your entire customer database to a third party — failing to deposit
is a compliance event), a price cap, and a requirement to keep resolving even if you go bankrupt (the
**Emergency Back-End Registry Operator** clause — a fascinating "you are not allowed to fail"
constraint). Scarce resource = **registry compliance standing / accreditation**, which can be
revoked.
**New mechanics:**
- **The domain lifecycle IS the level's clock:** active → expired → 30-day auto-renew grace → 30-day
  redemption (restore fee) → 5-day pending delete → drop.
- **The Drop Catch** — expiring domains release on a schedule and a swarm of bots races for them.
  Running a drop-catching operation is a pure latency-and-connection-count minigame with **EPP
  throughput** as the scarce resource during a drop.
- **Transfer wars** — a competitor sends transfer-out requests to your customers; your only defences
  are registrar lock, a good renewal experience, and auth-code policy. Attack surface: auth-code
  theft, transfer-out hijacking, and a 60-day post-transfer lock.
- **The Zone File Publish** — you publish the zone every N minutes and a mistake is globally visible
  and unfixable for the TTL.
- **Registry Lock** as a premium product you sell — and as the thing that saves your own company from
  a registrar hijack.
**Threats:** ICANN compliance notices escalating to termination; a UDRP registrant dispute; a court
order to seize or transfer a domain; an escrow deposit that fails validation; a country demanding a
suspension; a registry price increase you must pass through; the reseller who registers 40,000 spam
domains through you overnight; and the customer who lets a domain expire and then screams at you
during redemption.
**Signature meter:** the **Expiry Wheel** — a circular calendar showing every domain you manage
rotating toward its renewal date.
**Visual:** a giant card catalogue, a stamping desk, a public ledger wall. Signature FX is the **Zone
Publish**, a wave of updated signposts propagating across the whole world map.
**Comedy beat:** a customer's domain is worth $4,000,000 and their contact email is a Hotmail account
that no longer exists.
**Interacts with:** §3.6 Registrar Cross-Sell (now you *are* it), §2.6, §2.9 Domain Expiry.

**Variations and additions** — second-pass entry: *Domain Registrar — "The Bait Shop" / "The Pawn Shop" [EARLY/MID]*

- Missing from the game: product = names; $0.99 first-year loss leaders, ~$0.18 ICANN fee floor + registry wholesale — renewal margin is the *entire business*; ultra-sticky: domains anchor hosting sales (bundle = your cheapest acquisition channel); money: volume × pennies; float king (10-year prepay = pure cash-now); teaches teaser pricing + float + regulatory plumbing early. (wave2_ceo_informed)
- A whole economy of *names*: drop-catching (expired domains sniped at midnight by automated catchers — a nightly wave you either run or defend against), auction bidding as a market minigame, transfer wars (the Registrar Heist scenario as *daily business*), WHOIS privacy law flips (GDPR-style redaction event: a regulator *makes you hide* data you were selling as a product); customers churn constantly but *trade* — you make margin on movement; low-infrastructure high-drama: a good "money without metal" breather level. (wave2_sysadmin_informed)
- Threats: UDRP trademark disputes (legal card-battle), spam-registrant waves (who pays the registry fee when they don't?), identity-theft registrations, EPP-code hostage transfers, an ICANN compliance-audit walkby. (wave2_ceo_informed)
- Look: a strip mall of neon storefronts, each window a nameplate (transfers are literally changing the sign; the "expired domain graveyard" lot out back with auction vultures) / a bazaar of hanging signboards where names physically swap above shops at night; drop-catch bots as tiny magpies. (wave2_ceo_informed, wave2_sysadmin_informed)

### "The Index" — Package registry / artifact repository hosting
You host the thing everyone's build pulls from.

**How it works:** Unit = a package download. Scarce = **bandwidth and namespace integrity.** Fatal =
a poisoned artifact served to thousands of builds, because you are now the origin of everyone's
supply-chain incident. Customer = every developer, mostly for free; you monetise private registries
and enterprise mirrors. **Your traffic is 99% robots and they never bounce, they retry.**
**New mechanics:** **Typosquat/namespace policy as a dial** (aggressive = false-positive takedowns of
legitimate packages and a viral thread; permissive = you are the delivery mechanism for malware).
**The Unpublish Problem** — a maintainer deletes a popular package and breaks the world's builds: do
you allow deletion (author rights) or freeze it (ecosystem stability)? **Both answers are correct and
both generate a crisis.** **Immutability as a product promise.** **Mirror lag** — regional mirrors
serving stale indexes cause "works on my machine" across a continent. **Signing and provenance** as a
late-game buildable that makes the supply-chain threat class unspawnable but costs every publisher
friction, so adoption is a slow curve you manage.
**Threats:** a malicious release of a package with 40 million weekly downloads; a dependency-confusion
attack against your *enterprise* customers via your public namespace; a maintainer account takeover;
a legal demand to remove a package 200,000 builds depend on; a crawler that pulls the entire registry
nightly.
**Visual:** a vast library of identical boxes; provenance stamps; a "downloads this second" counter
in the millions. **Poisoned packages are visually identical until inspected** — the Mimic role applied
to inventory rather than to traffic.
**Interacts with:** §2.5 Dependency Poisoning (you're the other side), §4.6 Container Registry.

**Variations and additions** — second-pass entry: *Container Registry / Artifact Hosting — "The Library" [MID/LATE]*

- A giant blob store the entire fleet depends on at boot; signature threat: the **pull storm** — 200 nodes redeploy at once and stampede one registry (the origin-pull storm of CDN, but for your *own control plane*); registry network saturation = your K8s Ant Farm starves. (wave2_sysadmin_informed)
- Vulnerable-image waves (the base image everyone FROMs gets popped — supply chain with a shipping manifest), layer dedup as a storage tower, signature-verification gates; a strong "you thought this was *outside* your blast radius" teaching type. Look: a library bookmobile queue; pods as patrons clutching hold slips; a pull storm is the whole city lining up at one desk. (wave2_sysadmin_informed)

### "Who Watches" / "Cardinality" — Monitoring / observability as a service
You are the thing that tells everyone else they're down. Their carelessness is your capacity plan.

**How it works:** Unit = an ingested metric, log line or trace span. Scarce = **write throughput and
series cardinality** — *the number of unique metric streams, not the volume of data.* Fatal = **being
down during everyone else's outage**, because that is the only hour anybody notices you. Customer =
every other ops team, the most demanding and most technical buyers alive.
**New mechanics:**
- **The Cardinality Bomb.** A customer adds one label containing a UUID or a user ID and their metric
  count goes from 4,000 to 40,000,000 in one deploy, at 3am, without warning, and your time-series
  database falls over. **The modern "one tenant's missing index" — instantaneous, customer-triggered,
  and invisible until it lands.** The counter is a **Cardinality Limiter** that drops the customer's
  excess series — silently losing the data they are paying you to keep, a perfect Friction tower.
  Support tools: per-tenant ingest quotas, downsampling/rollup rules, and a cost-attribution
  dashboard you give the customer so they police themselves.
- **Correlated demand.** Your load spikes exactly when the internet has a bad day, so your capacity
  planning is **anti-correlated with your own reliability.**
- **The Alerting Duty.** You are contractually the thing that pages people, so a **dropped alert is
  worse than a dropped metric**, and your architecture must prioritise the alert path over the data
  path — a visible, buildable split.
- **The dogfooding paradox.** You monitor yourself with yourself, which works right up until it
  doesn't, so a *second, external, deliberately primitive* watchdog — **the dumb canary** — is a
  mandatory buildable.
- **The log line that is itself a log line** — a customer ships your own error logs back to you in a
  loop.
- **Retention math** — "keep everything for 13 months" is a promise you make at signup and a bill you
  pay forever.
**Threats:** the retention-cost spiral; a customer shipping debug logs at 400GB/day on a flat plan;
the query that scans a year; the "everyone's agent reconnects at once" storm after your own blip.
**Visual:** wall-to-wall graphs — **the only line where the HUD and the world are the same thing.**
Signature meter: the **Cardinality Gauge**, drawn as a fan of threads that visibly splays. Signature
catastrophe: **the flatline** — every customer's graph going to zero simultaneously, and **you cannot
tell whether the internet died or you did.** Second catastrophe: the ingest queue backs up and you
drop *everyone's* telemetry, meaning every one of your customers is blind during an incident, and
some of those incidents are yours.
**Interacts with:** §4.6 Monitoring Stack, §2.9 The Monitoring Server Dies, §7.6 (you are the fog
vendor), §2.10 bill shock.

**Variations and additions** — second-pass entry: *Observability / Metrics Hosting — "The Mirror" [LATE]*

- You host everyone's dashboards and logs (Datadog-shape); the boss: **cardinality explosion** — one customer's deploy turns `user_id` into a metric label and your time-series DB detonates from a million new series; the meta-joke level: your customers' debug logging *is* the DDoS. (wave2_sysadmin_informed)
- Threats: high-cardinality bombs, log-format-change tsunamis, the "why is my bill 40x" chargeback; customers: every other hosting type (they monitor you while you host them — recursive dashboards, a visual gag that *works*); money: per-GB ingest + per-series, the most elastic bill in the game. (wave2_sysadmin_informed)
- Look: a hall of mirrors where every other level's equipment appears as tiny reflections; when one mirror fogs, the whole hall loses itself. (wave2_sysadmin_informed)

### "Mirror" — Open-source distribution mirror hosting
Enormous bandwidth, zero revenue, maximum community reputation.

**How it works:** Unit = a package/ISO download. Scarce = **transit and peering.** Customer = nobody
pays you. Fatal = serving a *corrupted or tampered* mirror, which is community-trust death.
**New mechanics:** **Reputation-as-currency made literal** — the mirror line generates no cash and a
large amount of Engineer Reputation, which unlocks peering, hiring, and the colo/dedicated
word-of-mouth channel. **It is the first line whose only output is an intangible, and running it is a
deliberate, defensible, unprofitable strategic choice.** **Release Day** as a scheduled 40× spike
whose date you know months ahead. **rsync window management.** **Object-size mix as a mechanic** —
the 6GB `.iso` and the 40MB one behave completely differently.
**Visual:** warm, communal, a wall of distro logos, a "thank you" board. **Deliberately the least
corporate-looking line in the game.**
**Interacts with:** §3.6 Community Presence / Open Source Karma (this is that channel as a business),
§6.1 Reputation, §1.12 `Ratio` (a mirror is inbound-friendly and helps your peering ratio).

### "Green Light" / "Untrusted Code, By Design" — CI / build-farm hosting
You sell the execution of arbitrary code written by strangers. **That is not a bug in the product; it
is the product.**

**How it works:** Unit = a build minute / a job. Scarce = **cold-start time, cache locality, and
clean ephemeral capacity** — a build farm's economics live entirely in how much dependency cache you
keep warm, and a runner must be destroyed and rebuilt between jobs, which is pure overhead you can't
bill for. Fatal = a **leaked secret between tenants' builds**, because CI runners hold production
credentials for every customer. Customer = engineering teams, who feel every second. **Verb: isolate,
expire, reclaim.**
**New mechanics:** **Queue depth is the only metric anyone looks at** — developers tolerate slow
builds and not queued builds. **Ephemeral-vs-reused runners** as an explicit security/performance
dial: reused is fast and a cross-tenant contamination vector; ephemeral is safe and cold. **The
Monday Morning Wall** — demand is a sawtooth with a hard weekly shape and a dead weekend, so
utilisation is structurally terrible and pricing must account for it. **The Flaky Test Tax** —
customers re-run failed builds, so *their* quality problem is *your* capacity problem, and a
"flakiness report" is a product you can sell them that reduces your own load.
**Great tension: the fastest way to serve customers (warm, reused runners with populated caches) is
exactly the least safe way.**
**Threats:** **free-tier cryptomining** — the most abused free product in the industry and the
dominant real abuse in this business; a fork-PR build that runs attacker code with your secrets; a
build that forks until the host dies; a job that exfiltrates another job's cache; cache poisoning
between builds; a customer whose secrets leak into a public build log; a customer whose monorepo
needs 400GB of RAM; the upstream API rate limit that stalls every build at once.
**Signature meter:** **Runner Hygiene** — the percentage of your fleet that is genuinely fresh vs
"reused because we were busy."
**Visual:** a wall of green/red status squares — **the most instantly readable board in the game, and
it's real.** Signature FX: **the wall going red left-to-right** as a bad dependency propagates.
**Interacts with:** §4.2 Bare-Metal Build Box (now a whole business), §2.5 supply chain.

**Variations and additions** — second-pass entry: *CI/CD Build Farm — "The Forge That Builds Forges" [MID/LATE]*

- You run other companies' pipelines (GitHub-Actions style); load is *ephemeral* — thousands of tiny lifetimes, each a green-yellow-red badge; every PR is a stranger running arbitrary code in your house: the abuse-tenant problem with the volume knob up (free-CPU miners posing as test runners). (wave2_general_informed)
- Supply chain is *the* plot: a poisoned runner template escapes to every customer (your outage is their product); badge-servicing DoS (bots hammering your public status badges — pure read flood on a "free" endpoint); builds: ephemeral runner pools (spin-up/spin-down churn is the capacity puzzle), isolated micro-VMs (slow boot = queue stall = customers' builds late), artifact cache tree; money: per-execution-minute, refunds on false-failures. (wave2_general_informed)
- Look: a printing press the size of a house churning out green stamps; one jammed gear stops a thousand products at once. (wave2_general_informed)
  - "The Gauntlet" variant: your customers' threats arrive as *legitimate contributions* — malicious pull requests that weaponize your build minutes (cryptojack via OSS), dependency-confusion trojans poisoning your artifact store, runner-escape worms; ephemeral runner pools are your towers (short-lived, disposable); cache poisoning is the siege; interacts with the supply-chain threat family and SBOM buildables. (wave3_general_informed)

### "Fruit Salad" — Apple / Mac hardware hosting
A tiny, weird, real business with rules nobody else has.

**How it works:** Unit = a Mac mini (or a VM on one, capped by licence). Scarce = **physical
machines**, because the hardware cannot be meaningfully virtualised or oversold and the licence caps
VMs per host. Fatal = an OS update that bricks a fleet you cannot downgrade. Customer = iOS
developers and CI farms with no alternative — which gives you extraordinary pricing power and a
captive, annoyed customer base.
**New mechanics:** **No IPMI.** There is no out-of-band management; the buildable answer is a
**USB/HDMI capture + smart PDU + a physical robot finger**, which real operators really build, and it
is the funniest and most authentic buildable available. **The September Problem** — a vendor
announces a new OS and a new chip on a schedule you don't control, 100% of customers demand it on day
one, and your existing fleet loses 40% of its value overnight. **Consumer hardware in a datacenter** —
no rails, no redundant PSU, no ECC, no hot-swap, and a density problem solved with laser-cut shelves.
**Warranty is retail** — you drive machines to a shop.
**Visual:** a wall of identical small silver boxes on custom shelving, cabled like a hobby project
that got out of hand, because that is exactly what it is.
**Interacts with:** §2.8 (entropy on hardware with no telemetry), §7.8 Keyhole mode.

### "No Logs" — Privacy hosting: VPN endpoints, Tor exits, encrypted mail
You sell the absence of knowledge, and the absence of knowledge is your only defence.

**How it works:** Unit = a tunnel/session. Scarce = **clean IP reputation and upstream tolerance.**
Fatal = being shown to have logs you said you didn't have. Customer = privacy-conscious individuals
and, unavoidably, people doing crimes through you.
**New mechanics:**
- **The Warrant Canary** — a diegetic object you must *actively refresh* every period. The mechanic
  is that **you cannot lie, you can only stop telling the truth, and stopping is itself the signal.**
  Letting it lapse by accident because you were busy is a catastrophic unforced error and a superb
  "boring chore with enormous stakes" beat.
- **The No-Log Architecture** as a buildable with a real cost: **you cannot debug what you don't
  record**, so MTTR is permanently worse and §7.6's diagnosis loop is played one-handed.
- **Exit-node abuse ratio** — a Tor exit generates abuse complaints as a *constant*, not an event,
  and your operational job is managing the complaint stream and your upstream's patience.
- **Jurisdiction shopping** as a map-level placement decision with real, differing rule sets.
**Threats:** law-enforcement requests you genuinely cannot answer; an upstream who doesn't believe
you; a payment processor who won't touch you; a researcher who catches you TLS-intercepting; the
customer using your exit to attack your *other* customers.
**Visual:** deliberately featureless. No tenant names, no labels, a canary in a cage on the desk.
**Interacts with:** §1.3 Bulletproof — **adjacent but ethically distinct, and worth having both so
the game can show the difference between "no questions asked" and "principled minimum knowledge."**

**Variations and additions** — second-pass entry: *Tor / Anonymity Relay Hosting — "The Uncanny Post Office" [LATE]*

- You promise *not* to look: an inverted WAF — your inspection towers are *handicapped by your own TOS*; every defense that reads payloads breaks your product promise (the game literally greys out your DPI towers while a "privacy integrity" meter is watched); abuse arrives *through* you as exit traffic: the whole internet files abuse complaints at your door; you can defang some (block port 25 on exits — a slider customers hate) but never all. (wave2_general_informed)
- Threats: exit-node flooding, "honeypot exit" provocation waves, regulators demanding logs you *chose* not to keep (the logging tower must be configured to prove you hold nothing — zero-knowledge audit); money: donation-driven + VPN upsell volatility. (wave2_general_informed)
- Look: a fog-draped postal room, letters stamped with wax masks, paths through the building that re-route themselves; a bouncer who is legally blind. (wave2_general_informed)
  - Mixnet variant "The Onion Cellar": you run relays and anonymizing front-ends — neither bulletproof nor normal; traffic analysis is your stealth threat (correlation attacks only a monitoring tower can see); exit-reputation whack-a-mole (one exit abused → blocklist cascade); legal pressure is *mission-shaped*: the game asks what you owe whom (press sources vs subpoenas); uptime for dissidents is the health bar; a late morality-play type interacting with offshore/seizure systems and regulated arcs. (wave3_general_informed)

### "Zero Knowledge" — Password manager / secrets hosting
The business where you are *contractually unable* to help.

**How it works:** You hold the data and cannot read it. When a customer loses their key, the correct
and only answer is "it's gone," and your support team says that sentence ten times a day. **Every
support-improving feature you could build — recovery codes, admin reset, key escrow — is a reduction
in the product's core promise and a new breach surface.** A whole level whose tension is between
support quality and the thing you sell.
**Signature threat:** not a breach of data — **a breach of trust.** A researcher publishes that your
client-side crypto has a weakness, and your product's only asset is the belief that it doesn't.

### "The Show Floor" — Event, conference and broadcast NOC
Infrastructure that exists for four days and must be perfect. **The fastest-tempo line in the game
(contract length = one week).**

**How it works:** Unit = an attendee device / a production feed. Scarce = **RF spectrum and setup
time.** Fatal = the keynote. Customer = the event organiser, once, with a year's reputation on it.
**New mechanics:** **Build–Load–Show–Strike** as a four-phase level: 36 hours to build, the show
runs, 8 hours to tear down and get the gear to the next city. **Spectrum management** as a genuinely
new resource: Wi-Fi channels, wireless mic frequencies, and 6,000 attendees hotspotting, with a
**rogue AP threat that is now a *someone's phone* problem you cannot fix by policy.** **The Venue** is
a hostile environment you did not design: the conduit is full, only the union's electricians may
touch power, the loading dock is shared with a wedding, and the building's own IT department is
unhelpful. **No maintenance window** — there is only "during the keynote" and "not during the
keynote."
**Threats:** a power circuit shared with catering; the venue's own DHCP server; a presenter's laptop;
weather on the satellite uplink; the attendee whose gadget jams 5GHz by accident.
**Visual:** road cases, gaffer tape, cable ramps, a temporary rack in a hallway, a laminated
run-of-show. Signature meter: **the countdown to doors, which never stops.**
**Interacts with:** §1.5 (a whole level family), §4.7 (a facility you don't own).

### "Sub-100" — Ad-tech / real-time bidding infrastructure
Every request must be answered in under 100 milliseconds or it is worth exactly zero.

**How it works:** Unit = a bid request. Scarce = **p99 latency under a hard deadline** and **QPS at a
scale nothing else in the game touches** (millions/sec). Fatal = timing out, which is invisible,
costless-looking, and silently removes all your revenue.
**New mechanics:** **The Timeout Cliff** — unlike the patience model everywhere else, there is no
gradual bounce: you answer in 97ms and get paid, or 103ms and get nothing, **and nobody tells you.**
The purest possible expression of "p99 is the business." **Bid shading and the economics of
answering** — some requests are not worth the CPU to evaluate, so **deciding not to bid, fast** is a
capability you build. **Identity deprecation** as a regulatory-weather event that deletes 30% of your
product overnight. **Colocated with the exchange** — you must place compute inside specific
buildings, turning placement into a map-level problem.
**Visual:** a latency histogram as the entire HUD, with the 100ms line in red and the tail past it
shaded as **pure lost money.**
**Interacts with:** §1.3 Exchange Colo (sibling: both are latency-as-product, one physics, one
software).

**Variations and additions** — second-pass entry: *Ad-Tech / Real-Time Bidding — "The Auction House" [LATE]*

- The clock is microseconds: every page view fires a 100-bidder auction you host; core loop: throughput vs bid-latency (drop a bidder or drop the page); threats: **impression fraud swarms** (fake eyeballs that look *exactly* like real eyeballs to the counter — detection via behavioral towers), pixel-storm floods, a competitor buying the exchange against you. (wave2_gamedesigner_informed)
- Money: tiny fractions × billions; the egress-billing terror at planetary scale; HFT's louder cousin — palate-cleanser-hardcore. (wave2_gamedesigner_informed)

### "The Fabric" — Internet exchange point (IXP) operation
You are the neutral ground everyone meets on, and you are not allowed to compete with your members.

**How it works:** Unit = a member port (1G/10G/100G). Scarce = **members** — value grows with roughly
the square of membership, so the first 20 members are nearly worthless, member 200 makes every port
repriceable, and a cold start is brutal. Your "visitors" are **peering sessions**, which must be
negotiated *between members* — **you do not control whether two of your members peer.** Fatal = a
**broadcast storm on the peering LAN**, the IXP's unique and famous catastrophe: one member's
misconfigured router (or a full routing table leaked onto the fabric) floods a shared layer-2 domain
and **takes down a country's peering**, and you cannot touch their gear. **Verb: recruit, police the
port, arbitrate between people who dislike each other.**
**New mechanics:** **Neutrality as a rule you can break for money and shouldn't** — you will be
offered a lucrative deal that compromises neutrality and it will cost you the membership. **Port
sizing and the upgrade dance** (a member congesting a 10G port who won't buy 100G). **The Route
Server** as a buildable that makes peering easy for small members and becomes a single point of a
very specific kind of failure you didn't want. **Member policy enforcement** — MAC limits, BPDU
filters, proxy-ARP bans: the boring rules that prevent the famous catastrophe, **which players will
not buy until it happens.**
**Signature meter:** **Member Count × Peering Density** as a literal wiring diagram that fills in —
the **peering matrix**, a grid of who-talks-to-whom.
**Visual:** a beautiful, cold, nearly empty room that is almost entirely patch panels and one switch
pair — the highest value-per-object ratio in the game, and **the quietest level in the game, where
everything that matters is happening in other people's buildings.**
**Interacts with:** §4.4 IX / Peering Port (now the other side), §6.6 cross-connects, §1.2 `The
Upstream`.

**Variations and additions** — second-pass entry: *IXP / Exchange Operator — "The Town Square" [LATE, diplomacy-heavy]*

- You don't host content — you host *the meeting point*: a peering LAN every network in your region depends on; your switch crash is a regional internet event (real: DE-CIX/AMS-IX incidents); threats: route-server config push (your "one typo" level, but for a whole region), MAC-table overflow attacks, members fighting on your fabric (two rivals DDoSing each other *through* your exchanges), and the physical politics — members demand cheaper ports, threaten to build a rival exchange. (wave2_sysadmin_informed)
- Gameplay: neutrality as a resource; you profit when everyone gets along; arbitration minigames replace turret combat; money: port fees + membership; the "Peering Point" scenario's natural home as a *persistent type*. Look: a Roman forum/amphitheater; each member network a senator's delegation; traffic visibly crossing the plaza floor; when the fountains (route servers) stop, all the delegations freeze. (wave2_sysadmin_informed)

### "Clean Traffic" — DDoS scrubbing as a product
The service everyone else buys, run as your own business.

**How it works:** Unit = a protected prefix / a clean Mbps delivered. Scarce = **scrubbing capacity
and global absorption footprint.** Fatal = **collateral damage** — your mitigation drops a customer's
real users and **they would rather have been attacked.** Customer = other hosting companies, game
hosts, and anyone with an enemy.
**New mechanics:** **The false-positive ledger is the product.** Every other line treats false
positives as a cost; here it *is* the SLA. **Time-to-mitigate** as the contractual number, measured
in seconds, with a credit meter. **Always-on vs on-demand** as a per-customer architecture choice
with a latency cost and a detection-speed benefit. **Signature development** — novel attacks require
authoring a filter *during* the attack, a live authoring minigame where each rule you write has a
visible legitimate-traffic cost. **Your capacity is the ceiling**: you are selling protection you may
not have, which is an oversell mechanic with a moral edge.
**Threats:** an attack bigger than your total capacity; an attacker who probes your thresholds and
tunes just beneath them; a customer being attacked *because* they're your customer (someone testing
you); a peering partner who null-routes your scrubbing prefix to protect themselves.
**Visual:** the sieve as the entire game — traffic pours in violet and leaves cyan, and **the amber
fraction falling through the wrong side is your live scorecard.**

### "In the Container" — Modular / prefab datacenter deployment
You don't operate the facility; you build and ship it.

**How it works:** Unit = a delivered, commissioned module (a POD, a container, a skid). Scarce =
**manufacturing slots and freight.** Fatal = a commissioning failure at the customer's site, in front
of the customer. Customer = telcos, militaries, miners, disaster-response agencies, and anyone who
needs a datacenter in a field in eight weeks.
**New mechanics:** **Factory-then-field** — half the level is a production line (a repeating assembly
optimisation), half is a deployment (an unrepeatable logistics puzzle to a site with no roads).
**Everything must survive a truck** — shock, vibration, and a hard weight/width limit that is a legal
constraint on what fits inside. **Commissioning as a checklist minigame** with a customer watching.
**Remote sites you can never revisit.**
**Visual:** cranes, flatbeds, shrink-wrap, a container opening to reveal a perfect cold aisle in a
desert. **The best "reveal" shot available to the game.**
**Interacts with:** §1.3 Edge/MEC, §1.5 Datacenter Build.

### "Chain of Custody" — Secure IT asset disposition (ITAD) and media destruction
The end of every other line, as a business.

**How it works:** Unit = a destroyed or resold asset with a certificate. Scarce = **verifiable
custody.** Fatal = **a drive turning up on an auction site with data on it**, which is a notification
event for your customer and an extinction event for you. Customer = every regulated company and every
hosting provider, including your own other lines.
**New mechanics:** **The serial-number ledger** — every asset tracked individually from pickup to
shred; **a gap in the chain *is* the failure.** A **shred-vs-wipe-vs-resell** decision per asset:
resale is profitable, shredding is safe, and the tension is entirely margin against risk. **Witnessed
destruction** as a premium product (the customer watches by video). **The pallet that arrives with
one extra drive nobody logged.**
**Visual:** a cage, a scale, a shredder producing a satisfying river of metal confetti, a certificate
printer. Signature meter: the **custody chain**, an unbroken line of stamps that can visibly break.
**Interacts with:** §6.6 obsolescence cascade (this is the last stage), §1.3 Regulated, §1.12 `The
Reconciliation`.

### "Stratum One" / "The Roof Antenna" — Time, timing and precision services
You sell accurate time, and nothing you host matters more than it.

**How it works:** Unit = a synchronised client. Scarce = **GPS sky view and holdover quality.** Fatal
= **serving wrong time confidently**, which corrupts logs, kills certificates, breaks authentication
and desynchronises trading systems everywhere downstream. Customer = financial firms (regulated
timestamping obligations), broadcasters, telcos, and the whole public NTP pool.
**New mechanics:** **Holdover** — when GNSS is lost, your oscillator carries you for as long as you
paid for: a cheap TCXO drifts out of spec in hours, a rubidium holds for weeks. **A purchasable "how
long can I survive being cut off from reality" stat.** **GPS jamming and spoofing** as real, current
threats (increasingly common near ports and airports) with real counters — multi-constellation,
antenna siting, spoof detection. **Spoofing is the most quietly horrifying failure available: your
clocks all agree and they are all wrong.** **The leap second** as a scheduled boss. **Being in the
public pool** is free reputation and uncapped, unmonetisable load.
**Threats:** antenna cable water ingress; a building next door that blocks the sky; a GNSS receiver
firmware bug that rolls over its week counter.
**Visual:** an antenna on the roof, a rack unit with an atomic-clock front panel, and a single number
— **offset from UTC — drawn enormous, in nanoseconds.**
**Why it's a great level:** the only hosting business where **the customers' systems all break at
once and none of them will initially suspect the clock.**
**Interacts with:** §4.10 NTP Source, §2.7 Clock Drift (now your fault, for everyone).

### "The Co-op" — Non-profit / member-owned / community hosting
Same infrastructure, completely inverted incentives.

**How it works:** Unit = a member. Scarce = **volunteer hours**, which are unreliable, unmanageable
and free. Fatal = **a governance failure — not an outage, a vote.** Customer = your owners.
**New mechanics:** **Hands you cannot direct.** Volunteers arrive with skills and enthusiasm on their
own schedule; **you can ask, not assign** — a genuinely different action economy and a fresh take on
Pillar P4. **The Annual General Meeting** as the boss fight: justify last year's spending to the
people who paid for it, who may vote to do something operationally insane. **Surplus, not profit** —
money above cost must be spent, refunded or reserved, so **accumulating cash is itself a governance
problem.** **Mission constraints** — the charter may forbid profitable lines.
**Visual:** mismatched donated hardware, a noticeboard, a kettle. Warm, shabby, beloved.
**Interacts with:** §6.11 financing (a line with no access to capital), §9.1 business modes.

### "The Rig" — Offshore, maritime and extreme-remote hosting
Every constraint at once.

**How it works:** Unit = a workload on a platform, a ship, or a research station. Scarce = **weight,
power, and the supply-boat schedule.** Fatal = anything requiring a part you don't have, because the
next delivery is in eleven weeks. Customer = energy, shipping, research, defence.
**New mechanics:** **The Manifest** — you specify what goes on the next resupply *months* ahead, so
spares become a forecasting exercise with no do-overs. **Salt, vibration and roll** as continuous
entropy multipliers. **The satellite link is the only link and it has a price per megabyte**, so
telemetry itself becomes a budgeted resource: **you must decide what you can afford to know** — the
sharpest possible version of the fog of instrumentation. **Crew rotation** — your one technician
leaves in six weeks and the replacement has never seen the site.
**Visual:** steel, condensation, hazard stripes, a window with weather in it.

### "Cold Water" — Sustainability-first hosting (heat reuse, immersion, free cooling)
A line whose product is an externality.

**How it works:** Unit = a kW of compute *and* a kW of recovered heat. Scarce = **a heat customer** —
waste heat is only valuable if someone nearby wants it. Fatal = losing the offtake agreement, which
turns your economic advantage into an expensive plumbing system. Customer = tenants who need a green
credential, plus a district heating utility, a swimming pool, a greenhouse or a distillery.
**New mechanics:** **Two revenue streams from one watt.** Placement becomes a *civic* problem: **you
site next to the heat customer, not next to the fibre — and now you have a fibre problem.**
**Seasonal heat demand** — nobody wants your heat in July, so your advantage is seasonal and your
contracts must price that. **Immersion cooling** as line-specific tech with real drawbacks
(serviceability, fluid cost, drip trays, warranty voids, and "you cannot just pull a drive out any
more").
**Visual:** pipes, a greenhouse next door, steam, a public sign showing homes heated. **The prettiest
line in the game and the best marketing screenshot.**
**Interacts with:** §6.3 PUE, §6.7 grants and rebates, §1.12 `Dry Season`.

**Variations and additions** — second-pass entry: *Green / Sustainable DC — "The Solar Cathedral" [LATE modifier, or colo variant]*

- Sell premium "carbon-neutral hosting": PPAs (20-year power contracts — cheap energy *and* a hedge card), renewable buildables, carbon-reporting paperwork that enterprise RFPs demand. The trap: greenwashing (buy the offset stickers, skip the real buildables) works until an auditor or journalist event exposes it — instant review-swarm. Real operators recognize the pricing book instantly: same electrons, 15% price premium, honest version costs capex. (wave2_ceo_informed)

### "Lights Out" — Fully automated / zero-touch facility
The endgame of Pillar P4, run as a business line.

**How it works:** Unit = the same as any line, but **you have no hands on site at all.** Scarce =
**automation coverage.** Fatal = any physical failure whose remediation you did not pre-build.
**New mechanics:** every physical action must be converted into a machine action *in advance* or it
is simply impossible: robotic media handling, automatic workload evacuation from failing nodes,
power-cycle-by-API, and a deliberate decision to **let dead hardware stay dead** until a quarterly
truck roll. **Failure accumulation as a strategy** — you plan for 3% of the fleet being dead at any
time and size for it, a real hyperscale practice and a lovely inversion of the "fix everything"
instinct the rest of the game teaches.
**Interacts with:** §1.3 Edge/MEC, §7.8 remote-site delay, §1.11 Ratchet Audit.

### "The Green Screen Annuity" — Legacy / mainframe / AS400 hosting
The most profitable and most terrifying line in the catalogue: hosting systems nobody makes anymore
for customers who cannot leave.

**How it works:** Scarce resource = **people who still know this**, and it is **not purchasable** —
you can only train, retain, and dread. Contracts are enormous, churn is zero, margins are wonderful,
and every year the operating risk rises because the hardware is out of support, the vendor's last
engineer retired, and the documentation is a binder.
**Signature mechanic:** each legacy system has a named **Keeper** — a staff member — and **the
Keeper's retirement date is visible from the start of the level.** The whole level is about what you
do with that date.
**Threats:** a hardware failure with no replacement part in existence (you buy from a broker on the
grey market); an OS patch that hasn't been issued since 2011; a compliance auditor who asks how you
patch it; and **your own bus factor dropping to 1 and then 0.**
**Win condition options (all legitimate):** migrate the customer off (expensive, slow, they resist);
train a successor (slow, they may leave); or **price the risk** — raise the contract to fund a
standby expert.
**Interacts with:** §2.9 Key Person Risk, §9.2 The Legacy Box — **this is that idea promoted from a
twist to a business.**

**Variations and additions** — second-pass entry: *Mainframe Timeshare (prequel campaign)*

- **Mainframe Timeshare (prequel campaign).** 1970s monolith room, green phosphenes, punch-card queue belts feeding one CPU. One machine, one operator desk — and you defend *the belt*. (visual)
  - The CPU is the map: one shared processor = one capacity meter everyone queues on; the punch-card belt is the customer lane; interactive-session customers pay 20× batch customers but murder everyone's throughput when admitted (a priority dial with a face); the defense tower is literally the *scheduler* (time-slicing knobs as the era-authentic ancestor of the oversell dial); "you defend the belt" becomes: keep the belt fed while one card jam can stall the whole belt. (wave2_general_informed)

### "Line of Sight" — Rural wireless ISP (WISP)
Your cables are air.

**How it works:** Links are **point-to-point radio paths** placed on a terrain map. A link exists if
there is line of sight, and line of sight can be lost by things that are not your fault: a tree that
grew, a new building, a crane on a construction site, someone else's antenna on the same tower in the
same band. Scarce resource: **spectrum** — unlicensed bands are shared with everyone, so your
capacity degrades as your neighbours deploy. **Verb: survey, align, re-aim.**
**Threats:** **rain fade** (frequency-dependent — 5GHz shrugs, 24/60GHz drowns), ice loading on a
dish, wind twisting an alignment out of true, a lightning strike travelling down the tower ground, a
tower landlord raising rent, and a subscriber's CPE pointed at the wrong tower.
**Signature meter: Fresnel clearance** per link, drawn as an elliptical zone between two points that
**visibly clips into a treeline as the season advances.**
**Signature mechanic:** the seasonal cycle is a *real threat schedule* — **leaf-on in spring degrades
links that were fine all winter, and the game shows the trees growing.**
**Economics:** your customers are households nobody else will serve, they are extremely loyal, ARPU
is low, and a single tower's backhaul serves 300 of them.

**Variations and additions** — second-pass entry: *Wireless ISP (WISP)*

- **Wireless ISP (WISP).** Rural last-mile: line-of-sight towers as literal towers on hills, rain fade as a seasonal debuff, spectrum interference (a neighbor's radar on your 5GHz band). Customers are farmhouses and cabins with rooftop dishes. Physics TD with fresh map language. (sysadmin)
  - The physics needs numbers: rain fade = a weather-linked capacity multiplier per band (2.4GHz survives rain, 60GHz does not — a real tradeoff); tree growth = a slow seasonal entropy threat that *shrinks line-of-sight cones* year over year (entropy-difficulty made literal and beautiful); spectrum licenses = buildables whose channel overlaps a neighbor's radar produce an interference *lane* where both parties' packets collide visibly; placement puzzle: towers on hills, Fresnel-zone clearance as the "path width." (wave2_general_informed)
  - Spectrum is land, and it's the whole game: unlicensed bands (2.4/5/6GHz) = shared noise fights (the neighbor's radar as a seasonal boss); licensed bands = cheap-but-far; channel-planning as a tile map; also the *human* part: a customer rooftop dish aimed 3° off = "weather-sensitive" complaints the support desk solves with a $0 alignment visit — staff as a tower, true to life. (wave2_sysadmin_informed)
  - Weather board: line-of-sight acts get a rural bulletin-board at each farmhouse showing last-known signal; rain fade renders as visible rain streaks only over the affected beam; the neighbor's radar sweeps as an actual rotating green arc stealing your band. (wave2_visual_informed)

### "The Radiologist Is Waiting" — Medical imaging (PACS/DICOM) hosting
Regulated storage where the unit is enormous and the consumer is a human being under time pressure.

**How it works:** A "visitor" is a **study retrieval** — a 2GB CT series that a radiologist needs
*now*, and their patience is measured in the 8 seconds before they call the hospital's IT director.
The product is simultaneously **archival** (7–30 year retention, legally mandated) and **interactive**
(prefetch the study before the radiologist opens it).
**Signature mechanic: prefetch prediction.** You can warm studies from cold storage based on the
appointment schedule; a good prediction makes you look magical, a bad one costs you retrieval fees
for nothing.
**Threats:** a modality (the scanner itself) sending malformed DICOM; a hospital VPN that flaps; a
retention deletion you are **legally forbidden** from performing; and an outage with an actual
clinical consequence.
**Tone note: play this one straight. No jokes in the failure states.**

### "Authorization" — Payment switch / POS hosting
Sub-second, PCI-scoped, and the failure is that nobody in 4,000 stores can buy anything.

**How it works:** Visitors are **authorization requests** with a hard **2-second terminal timeout** —
binary, no partial credit, and a timeout means a queue of humans at a till. Scarce resource:
**p99.9 latency**, not p99, because 0.1% of a million transactions is thousands of angry stores.
**Threats:** a certificate on a *client* connection expiring (thousands of terminals, staggered, none
of which you control); a card-scheme mandate with a deadline; a BIN range routing change; and the
**Saturday-afternoon peak that is also your maintenance window.**
**Signature mechanic: a freeze calendar imposed by your customers.** Retail freezes changes from
November to January, so **every improvement you want to make must ship by October or wait.**
**Interacts with:** §7.5 change freeze, §1.3 Regulated hosting.

### "The Oracle Booth" — LLM inference API [EARLY-MID in the AI-era act]
Distinct from GPU training: your customers are *apps calling your model*, and the unit of sale is a
token.

**How it works:** Per-token billing gives the game its **fastest MRR heartbeat** — revenue ticks
visibly with every request. Customers are applications, not people: 900ms p99 expectations, no
patience for a cold queue. **Dominant verb: Schedule.** **Teaches: throughput and latency are the
same dial turned different ways.**
**Signature threats:** jailbreak mobs that arrive as *cheerful customers carrying cursed questions*;
**model extraction** — silent repeated sampling you must rate-limit or lose your crown jewel;
prompt-injection aimed at the model rather than the machine; and the "assistant goes off the rails
during a demo" PR event.
**Buildables:** batching engines (**the throughput-vs-latency dial** — customer experience traded
directly against margin), GPU KV-cache pools, guardrail filters (a WAF for *semantics*, which
sometimes refuses real customers).
**Visual:** a fortune-teller's booth made of token-stream glass; answers unfold as origami cranes.
**Interacts with:** §1.3 GPU / AI compute (the upstream supplier), §2.12 prompt-injection family,
§4.10. *(wave2_general_informed)*

### "The Office Park" / "The Eight AM Stampede" — Virtual desktop / VDI [LATE-ish]
The demand curve is a *wall*: 12,000 logins between 7:58 and 8:02, and morally the customers
**cannot churn** — it's their exam.

**How it works:** A heartbeat load curve — 8:55am login storm, flat all day, 5:01pm exodus. The
launch spike as *clockwork*: you can prepare for it and still get caught by it. **Dominant verb:
Provision.** **Teaches: a predictable peak is still a peak.**
**Signature mechanic — the profile-storage crush.** Everyone's desktop loads their whole life at
once: a read-storm the database never sees. Session stickiness is literal — a dropped session is a
failed exam, which is a lawsuit event.
**Seasonality is extreme:** certification-exam windows are calendar meta, per-seat monthly billing
with dead summers, so the cash-flow trough is a *scheduled foe*.
**Buildables:** session brokers, the **linked-clone image press** (one golden image stamps a
thousand desktops — dedupe's cousin), wake-on-LAN choreography, GPU passthrough for the design team.
**Threats:** golden-image update storms (patch Tuesday is *your* Tuesday), keyloggers baked into an
image, session hijack, "someone printed a PDF from inside" exfiltration.
**Customers:** HR departments, schools, call centres — and they churn as *blocks*: one contract is
3,000 desktops.
**Visual:** an enormous school hallway of glowing doors that all slam open in sequence at 8:00; an
office park of identical glass doors opening and closing on a tick; the profile crush buckles the
doors under suitcases; the login storm is a stampede of briefcases at 8:59.
**Interacts with:** §1.3 The Launch Window, §4.10, §7.8.
*(wave2_general_informed, wave2_sysadmin_informed)*

### "The QPU Parlor" / "The Séance Room" — Quantum compute time sharing [VERY LATE capstone]
The far-future capstone, where jobs are *probabilistic* and time itself is the enemy.

**How it works:** A run "completes" and returns a **shot-quality meter**, not a result. Error
correction is a literal tower that wraps the qubit die in frost. Cryogenics uptime is the new power
feed — a dilution-refrigerator warm-up is catastrophic and unrecoverable in-level. Decoherence makes
time hostile: long-queued jobs **rot while waiting**, so the queue is a spoilage bar, the anti-cache.
**Dominant verb: Verify.** **Teaches: probability, not capacity.**
**Signature threats:** algorithm-rationing disputes; and the **"quantum apocalypse" crypto-mob** —
harvest-now-decrypt-later agents stealing encrypted data *today* to break it with your future
machine, a threat that hits your **backups**, not your QPU.
**Money:** research grants and pharma whales; capacity measured in quantum-hours and everyone begs.
You *write* the QaaS spec.
**Visual:** "The Séance Room." Qubits hang as flickering probability clouds inside a brass
chandelier-chiller at absolute-zero blue; error rate renders as literal double-vision/ghosting on
anything near the rack; a decoherence event briefly shows an **alternate timeline of your
datacenter** — a translucent "what-if" overlay where a rack already burned — then snaps back. Jobs
are soap-bubble answers you pray hold; the harvest-now threat is a slow vulture circling far above
the map.
**Interacts with:** §1.3 Backup / archival hosting (the harvest-now target), §2.12, §8.10.

**Variations and additions**

- Endgame flavor: absurdly fragile tenants, error-correction as a literal shield-layer, decoherence storms; threats are mostly the environment; a late-game flex level. (wave3_general_fresh)
- "The Cold Lab" variant: qubits that decohere when you look away — "uptime" decays passively (a leaking bar); error-correction surface codes are literal tower lattices you maintain; jobs don't crash, they return *wrong* — and wrong results bill customers and detonate reputation; the dilution fridge is the hero buildable with an absurd power draw; the endgame/future-campaign type. (wave3_general_informed)
- Identity "The Non-Euclidean Wing": racks that are subtly *wrong* — impossible angles, probability fog around the qubit fridges; decoherence renders as the world briefly losing its render (a wireframe flash); errors are literal reality-glitches, so the glitch-language payoff is huge here; far-late/expansion. (wave3_visual_fresh)
- Far-future or DLC: decoherence (your server decays *by itself*), cryogen-failure timers, "harvest now decrypt later" attackers stealing encrypted data for future decryption — a threat that only becomes real AFTER the level ends!; academia grant cycles; money: huge lumpy grant income; look: golden chandelier computers. (wave4_general_fresh)
- Tiny customer count, each a civilization-tier project; decoherence = your towers randomly blink off unless cooled (a maintenance aura); threats are espionage AND sloppy grad students. (wave4_gamedesigner_fresh)
- Visual: fridge-shaped gold chandeliers on vibration isolators; customers are probability clouds that arrive EVERYWHERE AT ONCE until observed (a decoherence gate); the visual language deliberately breaks the rules — everything else has crisp shapes, quantum doesn't. (wave4_visual_fresh)

### "The Last-Mile Host" — Fiber ISP (GPON) [EARLY-MID of its own act]
The dial-up act's modern descendant: you host *networks*, not servers.

**How it works:** **Splitters are the new shared hosting** — one PON tree is 32 neighbours sharing
bandwidth, noisy-neighbour made optical, with dBm budgets instead of CPU quotas. **Dominant verb:
Provision.** **Teaches: the shared-medium lesson, transplanted into physics.**
**Signature threats:** mostly physics and paperwork — rain on customer dishes, ONTs that flap, the
CTE (customer-terminating-equipment) warranty swamp, and a truck roll that costs the ticket boss its
own budget line. **CGNAT is a *policy* tower** the homeowners' forum riots about.
**The inversion:** abuse complaints now originate *from* your customers' houses — your /22 lands on
Spamhaus because Karen's router got popped. The dark-forest sandbox, made personal.
**Money:** ARPU economics, rural subsidies and a grant economy; WISP crossover.
**Interacts with:** §1.3 Rural wireless ISP (spectrum-is-land), §1.3 Dial-up ISP, §2.12 abuse desk.

**Variations and additions**

- Municipal Broadband / ISP Last Mile: fiber cuts (backhoe weather!), weather, subscriber support storms, and the Netflix-transit-bill boss — paid peering negotiation as an event; builds: OLT, fiber runs (cabling mechanic as ACTUAL LANDSCAPING), transit vs peering choices; customers are households and businesses on a map of streets — traffic is literal neighbors; distinct: infrastructure spans a whole city map, not one building; ARPU economics. (wave4_general_fresh)

### "The Physics Server Room" — OT / SCADA industrial hosting [LATE]
You host plant control for energy, water and manufacturing, and every IT rule is reversed.

**How it works:** The air gap is *literal geography* — data crosses by visible hand-carry through
data diodes and one-way valves, and **the courier walk lane is your throughput limit.** Latency
budgets are irrelevant but **determinism is god**: control-loop jitter means a pipe bursts, and you
**lose the level to a customer's own physics.** Patching requires a shutdown contract, because
downtime here is not bounced customers, it is brownouts on their side — SLAs signed in engineering
units. **Dominant verb: Verify.** **Teaches: availability is not the only failure axis; safety is.**
**Signature threats:** IT-worms that hop the gap — the **Stuxnet-archetype boss, which walks
*through* the air gap using a USB sprite**, physical layer meeting logic layer in one unit — and
safety-instrumented sabotage, where the worst outcome isn't downtime but a "safety event" loss card.
**Buildables:** the one-way diode tower, **Purdue-zone segmentation** (five zones, stricter than the
usual three), fail-safe logic (servers must degrade to *safe*, not to *up*).
**Money:** enormous contracts, decade-long procurement, zero-tolerance churn.
**Visual:** yellow conduit, hard hats, big pneumatic dials on walls; the whole level holds its breath
during a control sweep; danger is expressed by a **rising water level in a gauge**, not by LEDs.
**Interacts with:** §1.3 Regulated hosting, §2.12 supply-chain and physical threat families.
*(wave2_general_informed)*

### "The Beach House" — Subsea cable landing station [LATE/finale]
You host the cable landing, and the map is a globe.

**How it works:** Latency is **the shape of the ocean**, and rerouting traffic around a cut is
literal traffic engineering on the world map. Your customers are every provider whose bits cross
your sand. **Dominant verb: Route.** **Teaches: the internet is a physical object.**
**Signature threats:** anchors, trawlers and earthquakes — **three simultaneous cuts is the level**
— with the restoration ship as a slow weather system that parks over the fault for days.
**Visual:** a lonely modernist beach house with a manhole that contains the ocean; the cut event is
a dark ring spreading across the seafloor on the globe view.
**Why it matters:** it gives "Regional Empire" its mythic underlayer — the last place where the
network is unambiguously made of dirt and water.
**Interacts with:** §1.3 IXP operation, §1.3 CDN, §1.3 Transit wholesaler.
*(wave2_sysadmin_informed)*

### "The Road Builder" — Transit wholesaler / dark-fiber baron [LATE interstitial]
The inversion level: **your customers are other hosts, and the lanes themselves are the product.**

**How it works:** You defend and sell road segments. A customer river never reaches a "core" — it
passes *through* you and pays a toll, and threats cut roads rather than besiege buildings. This is a
map-design revolution: **you play as the maze, not the castle.** **Dominant verb: Route.**
**Teaches: infrastructure below infrastructure.**
**Placement:** late-campaign interstitial, or an endless-mode skin.
**Interacts with:** §1.3 IXP operation, §1.3 Subsea landing station, §1.3 CDN.

**Variations and additions**

- Dark Fiber Leasing "The Night Highway": a tunnel-cross-section level — you lease tubes, splice conduits, and light them; capacity = lane count of the tube, amplifiers = relay lamps; a backhoe is the horror enemy (fiber cut = the screen's light river literally goes dark mid-tunnel, splices flare); repair-crew units; CDN levels share the highway language; mid-game utility level. (wave3_visual_fresh)

### "The One Kitchen Row" — Multi-tenant SaaS / platform hosting
You host one app many times, and a vulnerability in *your* app is a zero-day for every customer
simultaneously.

**How it works:** Patch-propagation waves, noisy-neighbour SLAs, and a **blast-radius UI** as the
level's core instrument. **Dominant verb: Triage.** **Teaches: what "our infrastructure" really
means — the correlated failure you built on purpose.**
**The blast-radius UI, specified:** one vulnerability lights a heat overlay showing *which* tenants
are exposed — all of them, instantly, which is the point. Patch propagation is a visible wave that
must **outrun the exploit wave** (deploy speed becomes the tower); per-tenant feature flags are the
containment verb; and the "noisy-neighbour SLA" gets a number as tiered fairness quotas.
**Visual:** identical storefronts in a row, one per tenant, fed by a conveyor from a single open
kitchen. A bad deploy is one smoking dish travelling the conveyor while you watch it reach every
store; a canary release is one store taking the tray first. The zero-day-for-everyone premise becomes
a one-glance chase scene.
**Interacts with:** §1.3 Managed WordPress, §1.3 Kubernetes / PaaS, §2.12 supply chain.

**Variations and additions**

- SaaS Backend Hosting: you run one product's entire stack for millions of its users; the "customers" walking in are users of your customer; one deploy = one path-event; the bad-deploy threat gets a starring role; feature flags become a counter-tower you toggle live. (wave2_general_fresh)
- PaaS / SaaS Platform ("you *are* Heroku"): buildpack exploits, slug-compiler abuse; your OWN platform incidents become the enemy — a bad platform deploy hits all tenants at once (systemic-risk mechanic); platform outages are mass-churn events; meta: you now host other hosts — *colocation-of-the-cloud*. (wave4_general_fresh)
- Customers host *on your platform's abstractions*: buildables are platform features (buildpacks, managed DB, CI runner) and threats are ecosystem-wide — a poisoned dependency update arrives inside your OWN supply chain (defend the pipeline, not the perimeter!); per-app pricing tiers mean customers literally upgrade their packets as you ship features. (wave4_gamedesigner_fresh)
- Release management AS the defense: threats are bad releases + dependency CVEs; everything is your blast radius; late. (wave4_sysadmin_fresh)
- SaaS Platform Hosting (hosting the app, not the infra): you're "just" an app vendor but the tower-defense is underneath — multi-tenant isolation, a bad deploy = an open gate; good for a late "pivot" level where the player's company becomes its own customer. (wave3_general_fresh)
- One big app with 10,000 tenants — all the tenants share the failure: core mechanics **noisy tenant** + **blast radius** (one tenant's export job melts everyone's latency, and churn hits per-tenant); teaches what "our infrastructure" really means. (wave3_sysadmin_fresh)

### "The Screen Wall" — MSP mode / managed service provider [MID/LATE overlay type]
You don't own the datacenter; **you own the remote access.**

**How it works:** The path is a graph of *client networks*. Threats enter through **their** mistakes,
and you defend with patch agents, RMM towers and "convince the client not to click" mechanics.
Bus-factor and ticket-triage are the themes, and the signature humiliation is that **you can be
locked out by your own customer.** **Dominant verb: Triage.** **Teaches: responsibility without
authority.**
**The borrowed-blame economy:** per-client SLAs you *sublet* — their uptime clause becomes your
liability; a "client did it themselves" detection meter (their mistakes spawn threats on their
subnet and the reputation tax lands on YOU unless your patch-agent tower proves otherwise —
**telemetry as evidence**); plus the lockout loss condition, your own credential rotation failing you
mid-incident.
**Signature threat — the credential vault is the game.** The RMM agent is *the* attack path: a
Kaseya-style supply-chain event as a scripted level, one update signing into every client at once.
Its counterpart: **you get locked out by your *vendors*** — an RMM-provider outage takes all clients
dark simultaneously with no action of yours involved.
**Visual:** a dark room with a wall of monitors, one per client, each showing a miniature of THEIR
network. Threats enter through a client's screen; "convince the client not to click" renders as that
monitor showing a cursor hovering a glowing lure while your policy tower fires a tiny hand that yanks
it back. Losing a client = their monitor goes dark and is carted away. The player literally manages
screens — a mirror of the player's own relationship to the game UI.
**Interacts with:** §1.3 Colocation (the in-cage MSP upsell), §1.3 Managed security, §4.10.

**Variations and additions** — second-pass entry *"Managed Services — We Run It For You" [MID/LATE overlay type]*

- Services-on-servers: the same box, 5× the invoice; margin = the tickets you *don't* get; buildables: runbooks, monitoring, patch automation — each reduces ticket COGS permanently; customers: SMBs who cannot read logs; churn is caused by *surprise* — anything unannounced. (wave4_ceo_fresh)
- Retail arbitrage: you are an MSP on hyperscaler rails — your margins are THEIR price-cuts away from disaster; upstream repricing events can hit you mid-level; unlocks honest "multi-cloud hedging" as an endgame build. (wave4_ceo_fresh)

### "Detonation Terrariums" — Malware-intelligence / detonation hosting
You host live malware *on purpose*, inside sandboxes: a breach level played from the other side.

**How it works:** The threats are **inside the tower from the start**, and **containment decay is the
resource.** **Dominant verb: Verify.** **Teaches: isolation as a consumable, not a wall.**
**Money:** research grants — slow, dignified university cheques.
**Visual:** specimen jars in biohazard cabinets, each containing a squirming glyph of its family (the
serpent, the fog, the key-cart); containment decay is hairline cracks growing across the glass with
an audible tick; a breach is one jar hissing open and the whole room holding its breath.
**Placement:** high-skill, high-horror bonus level.
**Interacts with:** §1.3 The Running Room (its commercial cousin), §2.12.
*(gamedesigner, wave2_visual_informed)*

### "The Letter Carrier" — Bulk email / newsletter delivery (ESP) [MID]
Distinct from hosting mailboxes: **you send other people's campaigns.**

**How it works:** Per-1,000-emails pricing over **shared IP pools**, where one spammy customer tanks
everyone's placement. **Dominant verb: Protect (reputation).** **Teaches: ecosystem reputation as a
shared commons — the strongest CEO-realism lesson in the game.**
**Signature event — "the Gmail loop."** Your IP range gets loop-listed and *all* customers' open
rates crater at once: a **statistical threat that never touches a server.**
**Counters and products:** the dedicated-IP upsell is isolation you rent out; list-hygiene gates at
signup enforce complaint-rate ceilings (>0.3% and the internet closes doors).
**Money:** metered, and brutally correlated with your own behaviour as a platform.
**Interacts with:** §1.3 Email hosting, §1.3 SMS / A2P messaging, §6.6.
*(wave2_ceo_informed)*

### "The Carrier's Child" — SMS / A2P messaging [LATE, small scenario]
The same deliverability commons as email, but with **actual carriers as gatekeepers.**

**How it works:** Registration and compliance towers (a 10DLC analog) gate your traffic; filter
events randomly blackhole messages; and carrier revenue-share negotiations are take-it-or-leave-it.
**Dominant verb: Protect (reputation).** **Teaches: when the commons has an owner, the owner sets
the price.**
**Placement:** a tight, cynical, high-margin palate-cleanser level.
**Interacts with:** §1.3 Bulk email delivery, §1.3 VoIP / SIP trunking.
*(wave2_ceo_informed)*

### "The Town Crier" — Push / mobile-backend hosting [MID]
You host the notification fan-out for apps with 40 million devices.

**How it works:** Load arrives as **scheduled tsunamis** — your customers' 9:00am campaign blasts
hit all at once, and they are *predictable if you watch their calendars.* **Dominant verb:
Schedule.** **Teaches: your peak is written in someone else's calendar.**
**Signature threats:** a misfired push ("you are our 1,000,000th winner!") becomes a hug-of-death;
**OS-version changes silently break your delivery pipes** — external platform risk you cannot patch,
only diversify; and device tokens are honey for attacker lists, credential stuffing at *device*
scale.
**Buildables:** the fan-out tree (a literal branching bell tower — depth traded against latency),
per-platform rate governors, idempotency guards (a double-push is a support storm).
**Money:** per-MAU with brutal tier cliffs.
**Visual:** messages hop tower to tower; a failed blast is ten million silent phones that all light
up *angry* at once.
**Interacts with:** §1.3 IoT device backends, §1.3 CDN, §4.10.
*(wave2_general_informed)*

### "The On-Sale Stampede" — Ticketing / auction mega-event [MID-LATE]
Revenue concentrated into 90-second tsunamis.

**How it works:** Two million humans and six million bots arrive at exactly T+0 for one artist's
presale. The core puzzle is **queue fairness**: a visible lottery/queue tower must bleed humans at a
steady rate while **bot sweeps — scalper swarms wearing human-shaped masks** — try to jump it.
**Dominant verb: Triage.** **Teaches: fairness is a capacity problem.**
**Signature threat:** the cancel-the-sale event, a reputational boss rather than a technical one.
**Pairs with:** game hosting and e-commerce.
**Interacts with:** §1.3 The Launch Window, §3.3 bot-vs-human detection.
*(wave2_gamedesigner_informed)*

### "The Memory Palace" — Wiki / archive hosting [MID]
The donation-economy inversion: money does not arrive as MRR at all.

**How it works:** Income arrives in **fundraiser campaigns** — periodic opt-in waves where you must
*spend uptime goodwill* to trigger donation geysers. **Dominant verb: Protect.** **Teaches: a
business model where reputation is literally the revenue curve.**
**Signature threats:** takedown legal waves, crawler swarms (some welcome, some locusts), link-rot
entropy, and one-vandal-bot-per-minute attrition.
**Customers are pilgrims:** readers who never pay but *are* your reputation. The mission is
durability — lose a page and it is gone from the world.
**Placement:** the great mid-game empathy level, a "service to humanity" mood reset.
**Interacts with:** §1.3 Non-profit / community hosting, §1.3 Open-source mirror hosting.
*(wave2_gamedesigner_informed)*

### "Tax Day" — Government e-services portal [LATE]
Deadline-shaped traffic: everything is quiet until a legal deadline compresses a nation's usage into
six hours.

**How it works:** Renewals, filings and benefit enrollment all land at once. The constraints are the
level: **procurement law forces you to accept low-margin contracts**; accessibility mandates are
literal build requirements (every service needs an "a11y badge" or the regulator event auto-fails
you); and sovereignty rules forbid certain foreign buildables outright. **Dominant verb: Commit.**
**Teaches: constraints you cannot buy your way out of.**
**Signature threats:** DDoS by disgruntled citizens, defacement art, and data-breach state
emergencies.
**Composes with:** regulated hosting and the sovereign / national-cloud branch.
**Interacts with:** §1.3 Regulated hosting, §1.3 GDPR / data residency.
*(wave2_gamedesigner_informed)*

### "The Travel Agent" — Hybrid-cloud broker [MID]
You own some racks and **rent everyone else's.**

**How it works:** The board is a marketplace of other companies' capacity — the AI-hosts of the world
as vendors. The core mechanic is **arbitrage with reputation risk**: oversell a public-cloud tier and
when *their* region burns, your customers blame *you*. **Dominant verb: Route.** **Teaches:
multi-region dependency before you own any regions.**
**Signature threats:** vendor outages — an entirely new failure class you do not control — and price
wars.
**Money:** margin spreads that tick live.
**Interacts with:** §1.3 MSP mode, §1.3 Colocation, §6.6.
*(wave2_gamedesigner_informed)*

### "The Quiet Lottery" — Quant research cluster [LATE]
The batch inversion of the GPU level: **nobody is online at all.**

**How it works:** Zero customer river for most of the level, enormous compute billing, and one
brutal 90-second window per day — market open — where everything that must work, must work.
**Dominant verb: Verify.** **Teaches: tension without traffic.**
**Signature threats:** exfiltration and sabotage, never floods.
**Placement:** a horror-flavoured stealth level where the *absence* of customers is the tension — the
palate cleanser for the noisy streaming act.
**Interacts with:** §1.3 HPC / render farm, §1.3 Financial exchange colocation.
*(wave2_gamedesigner_informed)*

### "The Running Room" — Arbitrary-code-execution hosting (E2B / online judge) [MID-LATE]
Your *product* is RCE on demand — distinct from PaaS, because every unit of traffic is a live
exploit by design.

**How it works:** The workload **is** the attack surface, so the tower set flips: isolation tech
(gVisor / microVM — "Faraday cages for processes") is the **main gun**, not a premium add-on.
Threats arrive inside-out: the container-escape class is the boss, the syscall-audit tower is your
scope, and network egress lockdown matters because the only thing worse than running the code is the
code calling home. **Dominant verb: Isolate.** **Teaches: trust boundaries when the input is a
program.**
**Signature threats:** the swarm of infinite-fork students; cryptominers posing as "test #4811";
someone mining on your free tier between submissions; and **the prompt-injection wave lands HERE**
the moment an LLM's tool-use executes.
**Money:** per-second billing with brutal margin math — isolation costs roughly 8% CPU overhead,
which is your whole gross margin, priced honestly.
**Customers:** AI-agent startups (the 2020s boom), cyber ranges, education.
**Interacts with:** §1.3 CI / build-farm hosting, §1.3 LLM inference API, §2.12.
*(wave3_sysadmin_informed)*

### "The Lighthouse Keeper" — Managed security / SOC-as-a-service [LATE, service business]
You sell vigilance.

**How it works:** Per-endpoint monitoring MRR, incident-response retainers, and a **hunt team you
dispatch to *customers'* incidents** — their map, your controls, their SLA counting against you.
**Dominant verb: Triage.** **Teaches: reputation *is* the product, in its purest form — one botched
engagement and the RFP pipeline stalls for a season.**
**Signature threat:** abuse of your own tooling — leaked playbooks turning your detection logic into
someone else's evasion manual.
**Interacts with:** §1.3 MSP mode, §1.3 Regulated hosting, §1.3 DDoS scrubbing.
*(wave2_ceo_informed)*

---

