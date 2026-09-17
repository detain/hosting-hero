# 0. Foundations

*This section did not exist in any single wave-1 report; it is the merged spine. §0.1 collects the
load-bearing design theses that all five lenses converged on. §0.2–§0.4 establish hosting-type
variety and era as first-class design pillars, per the broadened brief.*

## 0.1 Design pillars

### P1 — The Shared Pipe
In classic tower defense, creeps walk the lane and towers shoot them. Here **the lane carries creeps
AND customers.** Threats and visitors travel the same path through the same equipment. Every defense
you place is a checkpoint that adds latency, and latency is the thing that kills visitors.

**How it works:** Every defensive buildable carries a **Friction** stat (% of legitimate visitors it
bounces or flags) and a **Latency** stat (ms added to every request). A CAPTCHA gate stops
credential stuffing *and* bounces 12% of real shoppers. A WAF stops SQL injection *and* adds 40ms to
every page load. There is no strictly-good tower; every tower is a tax. The core knob of the entire
game is: **how paranoid can I afford to be?**
**Interacts with:** every entry in §4.5 (defenses), §3.4 (bounce model), §6 (friction costs are
denominated in customers, and therefore in money).
**Hosting types:** universal, but the *unit* of friction changes — for a game host it's added ping;
for an email host it's a false-positive spam filter shredding a real invoice; for a colo it's a badge
policy that slows your own techs; for a backup host it's a verification pass that eats the backup
window.

### P2 — Capability vs. Surface
Every buildable has two numbers printed on its card: **Capability** (what new, richer traffic it lets
you serve) and **Surface** (what new threat classes it invites into the wave table).

**How it works:** Adding a database server means you can now serve Power Shoppers and Enterprise
Buyers — the high-value visitors — but it *permanently adds SQL Injection, DB Overload, and Backup
Corruption to the enemy pool for the rest of the run.* You cannot earn premium customers without
inviting premium attackers. **The tech tree is also the bestiary.** Threats in §2.5 should be
literally unspawnable until you build the thing that invites them, so the player watches their
bestiary grow as their network grows.
**Interacts with:** §4 (every buildable), §2 (wave generator pool), §5 (unlocks), §8.8 (the build
card's red "Opens:" row of threat icons).

### P3 — Peacetime is the Real Boss
Two currencies of time pressure: **waves** (spiky, loud, obvious) and **upkeep** (slow, silent,
compounding). Overbuild during a scary wave and you die three quiet minutes later to payroll.

**How it works:** Upkeep rises slowly every minute regardless of what you do (salaries,
depreciation, vendor increases, licensing). A huge fraction of the strategy is *knowing when to
under-defend.* Calm periods must be genuinely useful — that's where research, morale recovery,
restore drills, and maintenance happen — or players will just rush them.
**Interacts with:** §6.3 (costs), §7.9 (calm/storm rhythm), §1.7 (anti-turtle clock).

### P4 — Attention is a Resource
The player is one engineer (early) or a small team (later). Manual interventions — restarting a
service, answering a ticket, physically swapping a disk — occupy **hands**.

**How it works:** You have 1–2 hands at the start, visible as tokens at the bottom of the screen.
Every manual action consumes one for its duration. Automation is the real tech tree: every unlock
that converts a manual action into a standing rule is a huge felt upgrade. This is what makes
simultaneous failures genuinely hard — you have money but no hands. Seeing your last free hand get
consumed while three alerts are firing is the game's best panic moment.
**Interacts with:** §4.8 (staff), §2.9 (ticket avalanche), §5 (runbook ladder), §7.5.

### P5 — Legibility Under Load
A tower defense lives or dies on whether you can read the board in half a second at 3× speed.

**How it works:** Every visual and UI decision in §8 is subordinated to this. If the player can't
tell at a glance *which link is saturated*, the game is broken no matter how good the systems are.
Enforced by hard rules: a strict colour language, shape tokens that survive greyscale, a readability
budget, and alarm propagation to parent glyphs at every zoom.
**Interacts with:** all of §8.

### P6 — The same pipe carries the thing you want and the thing you fear
The general lens's through-line, and a restatement of P1 with a design instruction attached.

**How it works:** A firewall that stops a botnet also stops a customer on a bad mobile carrier. A
cache that absorbs a flood also serves a stale checkout page. **When in doubt, make the defense have
a visitor-facing cost, and make the growth have a threat-facing cost.**

### P7 — Ship the real monsters
The sysadmin lens's organizing principle: real infrastructure fails in specific, repeatable, weirdly
funny ways, and **those failure modes ARE the game.** Don't invent fantasy monsters; the actual
monsters are better designed than anything we'd make up.

**How it works:** The player should finish a campaign having internalized real operational intuition:
redundancy has a seam, monitoring is a service that itself fails, the second failure always happens
during the rebuild, and it's always DNS. Every mechanic carries a "was that real?" marker
distinguishing real failure modes from game simplifications (see §9.5).
**Tension:** ⚔️ P7 (authenticity-first) vs. the game-designer lens's stance that hosting is *flavour
for mechanics, never the reverse.* Both are kept because they mostly agree in practice — the
disagreement surfaces only when a real failure mode makes a bad decision (e.g. a purely random
component death with no counterplay). Rule of thumb: real failure modes are the *source list*;
mechanical role coverage (§2.1) is the *filter*.

### P8 — The business is the other half of the game
The CEO lens's frame: the player is not "a sysadmin who also has customers," they're the
owner-operator. Servers are cost centres that produce billable capacity. Customers are revenue with
a support-cost tail. Attacks are unbudgeted expense events.

**How it works:** "Server down" is not damage. "Server down → 40 min of SLA breach → $1,900 in
credits → 6 refund requests → 3 cancellations → one 1-star review" is damage. Every threat's cost is
expressed in money and reputation. Three numbers are on screen at all times: **MRR**, **Cash**, and
**Reputation**.
**Interacts with:** all of §6; §4.9 (half your towers aren't servers).

### P9 — The reward loop is on letting through, not shooting down
What distinguishes this from every other tower defense: the dopamine lives in the **conversion**
moment, not the kill.

**How it works:** When a checkout visitor reaches the conversion node, a coin/receipt animation and a
real, satisfying sound. Defenses firing are functional feedback; visitors arriving are the payoff.
Every bounce is individually visible so loss is *felt*, not just tallied.
**Interacts with:** §3, §8.6, §8.7.

### P10 — Almost nothing you do has an immediate result
The CEO lens's core twist, generalized: the game's difficulty comes from acting on lagging
information.

**How it works:** Cut support → churn rises in month 3. Cut marketing → leads dry up in month 4.
Raise prices → revenue up now, churn in month 13 at renewal. Skip backups → nothing, nothing,
nothing, catastrophe. Serve a crawler badly → your visitor spawn rate drops two waves later. The
post-mortem screen (§6.9) exists specifically to draw the line between decision and consequence
after the fact.
**Interacts with:** §2 (delayed-damage threats), §3.6 (90-day marketing lag), §6.

### P11 — Hosting is billed in terms, not in months
*(Wave-2 CEO thesis; developed throughout §6.)* Almost no real hosting revenue is a simple monthly
charge, and the term structure is what actually determines cash, churn shape, and company value.

**How it works:** Shared hosting sells as 12/24/36-month prepay with a **renewal cliff** (the
promo rate ends and a third of the cohort leaves at once). Colo is a 3–5 year term billed monthly in
advance with an **annual escalator** and a **ramp schedule** (the tenant takes 2 cabinets now, 8 in
month 18 — and you must hold that power for them, unsold). GPU is 1–3 year reserved with
prepayment, with spot as the leftovers. VoIP is MRC plus per-minute settlement. Dedicated is
month-to-month with a setup fee. **Term is a property of every contract object**, and it makes a
signed deal an asset with a shape, not a number.
**Interacts with:** §6.2, §6.4, §6.5, §3.9 (the contract system), §1.4 (Pivot).
**Hosting types:** universal, with the term length itself as a type differentiator.

### P12 — Revenue has a colour, not just a size
*(Wave-2 CEO thesis.)* $10k of MRR from 400 coupon-driven shared accounts, $10k from one colo
cabinet on a five-year term, and $10k of GPU spot are three completely different assets.

**How it works:** Every revenue dollar carries tags: **margin**, **churn rate**, **support load per
dollar**, **term remaining**, **concentration**, and **valuation multiple**. The HUD shows MRR
*composition* (a stacked bar by colour), not a single scalar, and the end-of-level valuation multiple
is computed from the mix. This makes "grow revenue" an insufficient goal and "grow the right revenue"
the actual game.
**Interacts with:** §6.1, §6.2, §6.9, §8.8 (HUD), §2.10 (concentration risk).

### P13 — The contract is a tower
*(Wave-2 CEO thesis.)* An SLA is not a toggle. The liability cap, credit cap, claim window,
maintenance-exclusion clause, auto-renew, escalator, MFN clause, audit right, and assignment clause
are each a separately buildable, separately negotiable **defense**.

**How it works:** Contract clauses are placeable on a "paper" layer of the board with real costs
(each one you insist on lowers close rate or price) and real effects (each one you lack is how a bad
month becomes a bad year). The legal layer is a tower tree parallel to the technical one.
**Interacts with:** §3.9, §4.9, §6.2, §2.10.

### P14 — Money you can't touch is not money
*(Wave-2 CEO thesis.)* A real operator has about six cash numbers and only one of them pays payroll.

**How it works:** Split the single Cash stat into **free cash**, **restricted cash** (processor
rolling reserve, escrow holdbacks, tenant security deposits), **deferred revenue already spent**,
**AR aged 30/60/90+**, **capitalized fit-out recovered over 60 months**, and **backlog** (signed but
not installed, worth nothing until it turns on). The classic death is a profitable company with no
free cash.
**Interacts with:** §6.1, §6.4, §6.11, §6.10 (lose conditions).

### P15 — A pivot is a double-carry, not a switch
*(Wave-2 CEO thesis.)* Changing what kind of hosting company you are is not a research purchase.

**How it works:** You carry the dying line's contracts, hardware leases, licences, and staff **to
term** while simultaneously funding the new line — 12 to 24 months of paying for two companies. The
overlap window is the actual drama of a pivot, and the strategic question is whether you can reach
the new line's break-even before the old line's obligations run you out of free cash.
**Interacts with:** §1.4 (Pivot levels), §5.6 (line unlocks), §6.4, §0.2 (business lines).

### P16 — Path shaping, not just tower shopping
*(Wave-2 game-designer thesis.)* Classic TD's deepest strategy layer is *shaping the path*. The
wave-1 design had a dependency graph as its map but never let the player bend the route for
defensive advantage — every defense was "buy a filter, pay a global latency tax."

**How it works:** Three mechanics restore mazing without abandoning the graph: **Inspection Depth**
(how deeply a given hop examines traffic, chosen per hop rather than globally), **Suspicion Routing /
the Two Lanes** (a fast lane and a scrutiny lane, and the routing decision is the puzzle), and **the
Millisecond Budget** (a hard per-request latency allowance that every hop spends from, so defense
becomes a spatial allocation problem instead of a shopping list).
**Interacts with:** §7.1, §7.2, §7.3, §4.5, P1.

### P17 — Defenses need roles, and coverage must be legible
*(Wave-2 game-designer thesis.)* §2.1 defines twelve threat roles. Without a matching defense-role
list and a coverage matrix, the player can never reason "I have no answer to the Sapper role."

**How it works:** Nine defense roles and a **Coverage Grid** UI: threat roles down one axis, your
built defenses across the other, cells lit where you have an answer and conspicuously dark where you
don't. The dark cell is the single best teaching device in the game.
**Interacts with:** §2.1, §4.5, §8.8.

### P18 — There must be something you spend to win *right now*
*(Wave-2 game-designer thesis; the single highest-leverage wave-2 addition.)* Money is slow and Hands
(P4) are both the combat currency and the peacetime currency, so there is no in-combat resource with
a visible refill.

**How it works:** **Error Budget as a spendable resource** — a per-level allowance of degradation you
may deliberately burn (shed load, serve stale, disable a feature, drop a region, take the SLA hit) to
survive a moment, with a visible meter that refills slowly during calm. Spending it is a real
decision with a real bill, and it converts panic into agency.
**Interacts with:** P3, P4, §6.1, §7.5, §7.7.

### P19 — A tension without a number is a mood, not a mechanic
*(Wave-2 game-designer and general theses, jointly.)* The wave-1 document contained essentially no
tuning values: no build costs, no starting cash, no level lengths, no patience values, no capacity
units.

**How it works:** Wave 2 attaches a proposed baseline economy and a written-down simulation loop
(patience, latency, queueing, and capacity reconciled into one tick model) so the design is
implementable rather than merely evocative. Numbers in this document are **first-draft tuning
values**, deliberately concrete so they can be argued with.
**Interacts with:** §6.3, §7.1, §7.5.

### P20 — The boring middle of the job is the unmined content
*(Wave-2 sysadmin thesis.)* The famous failures — DDoS, cert expiry, RAID rebuilds, power chains, BGP
hijack, backups that don't restore — were well covered by wave 1. The gap was the unglamorous
operational middle.

**How it works:** Wave 2 adds measurement resolution (you cannot see a 200ms stall on a 5-minute
graph), lead times, warranty and RMA logistics, change correlation, decommissioning, inventory
drift, the electricity bill's **demand charge**, protocol-level resource attacks, and the whole class
of failures where **nothing changed and you simply grew into a bug that was always there** — the
most authentic failure shape in the industry and one the player will not see coming.
**Interacts with:** §2.8, §2.9, §4.6, §6.3, §7.6.

### P21 — Every mechanically-defined system owes a visual
*(Wave-2 visual thesis.)* A system with no described visual expression will be built wrong or not at
all: the business machine (§4.9), most of §2.10, most of §3.2's archetypes, the Three-Clock Rule
(§7.9), and the Hands resource (P4) all had mechanics and no picture.

**How it works:** Wave 2 supplies specs where wave 1 hand-waved ("a meter," "a gauge," "it looks
different"), and resolves four collisions where two entries gave the same colour, shape, or screen
surface two different jobs. The four cross-cutting rendering laws — the **Hue Ledger**, the
**Emissive Allowance**, the **Ring Taxonomy**, and the **Instrument Design Language** — live in §8.2
and are referenced from every other category.
**Interacts with:** all of §8; P5.

---

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

---

## 0.4 The era axis

### Era × Type is a 2D content grid
A second variety dimension that is nearly free once the skin kit exists.

**How it works:** Same ruleset cards, different **era**: 1994 dial-up ISP, 2001 dot-com colo, 2009
shared-hosting-and-cPanel, 2016 cloud, 2024 GPU boom, near-future edge. Era changes costs, available
tech, threat sophistication, customer base, and the entire palette. Whole branches of the tech tree
are greyed out with "not invented yet."
**Interacts with:** §5.6 (era unlock), §8.10 (era kits), §9.1 ("Through the Eras" mode).

### The Era Campaign ("From Dial-Up to GPU")
Possibly the strongest single campaign structure available.

**How it works:** Start in 1996 as a dial-up ISP and advance: dial-up → shared hosting → dedicated →
VPS → cloud → containers → GPU/AI. Each era transition obsoletes some of your hardware and
buildings, changes the aesthetic, changes the customer base, and poses the strategic question **"do
we chase this or stay in our niche?"** — which is the actual history of the entire hosting industry.
**Interacts with:** §1.4 ("Pivot"), §9.2 (the legacy box that survives every era).

### The Era-Transition Cutscene
Between eras, show your own facility aging around you.

**How it works:** The beige boxes leave, the racks get denser, the lights go LED, the graphs get
prettier — and one server from 1998 is still there in the corner, still running, still nobody knows
why. Presented as a renovation: scaffolding, dust sheets, then the reveal.

---

## 0.5 Working titles and tone

### Working title candidates
**UPTIME** · **Packet & Rack** · **99.999** · **Five Nines** · **HOSTILE TRAFFIC** · **The Rack** ·
**Bare Metal** · **Ping of Death** · **Serving Suggestion** · **Load Bearing** · **From Basement to
Backbone**.

### Tonal target
**Recognition comedy, never parody.** The funniest thing in hosting is how mundane the catastrophes
are: a $3 part, a forgotten renewal, a typo, a screw. The game should respect the work — the people
in it are competent and the systems are genuinely hard — and get its laughs from truth. Tonally:
*Papers, Please* meets a rack elevation diagram, with the warmth of a team that's been through some
things together. **Never punch down at users**; the joke is always the situation.

### The emotional arc
The real arc of the job, and the arc the campaign should deliver:
**panic → process → prevention → boredom**, and learning that boredom is the highest achievement.

---


## 0.6 What wave 2 changed (navigation map)

*A short index of where the second pass did the most work, so a reader who knows the wave-1 document
can jump straight to what's new. Every item listed here is developed in full in the category section
named.*

### The nine biggest structural additions
**How it works:** In rough priority order, as identified independently by more than one lens:
1. **A written-down simulation loop** reconciling patience, latency, queueing, and capacity into one
   tick model, plus a full baseline economy with actual numbers — §7.1, §6.3.
2. **Path shaping restored**: Inspection Depth, Suspicion Routing / the Two Lanes, and the
   Millisecond Budget — §7.1–§7.3.
3. **Error Budget as an in-combat spendable currency** — §6.1, §7.5.
4. **The Nine Defense Roles and the Coverage Grid**, matching the twelve threat roles — §4.5, §8.8.
5. **QoS / traffic prioritisation**, the obvious missing mechanic in a design about a shared pipe —
   §7.1.
6. **Cell-based architecture and shuffle sharding**, making blast radius a buildable property rather
   than a described concept — §4.2, §4.4.
7. **Contract structure as a tower tree**: terms, escalators, ramps, caps, clauses — §3.9, §6.2.
8. **Restricted vs. free cash**, deferred revenue, AR aging, and backlog — §6.1, §6.4.
9. **Automation and standing policy given a UI and a visual language** — you can finally *see* what
   your system will do without you — §7.5, §8.8.

### Whole hosting business families added in wave 2
**How it works:** Certificate authority · domain registrar / registry operator · package registry
(npm/PyPI-alike) · monitoring-and-observability-as-a-service · open-source mirror hosting · CI /
build-farm hosting · Mac hardware hosting · privacy / VPN / Tor infrastructure · event and conference
NOC · ad-tech real-time bidding · IXP operation · DDoS-scrubbing-as-a-product · secure destruction
and decommissioning · time services (NTP/PTP/GPS) · and more. Each ships a Ruleset Card (§0.2) and
appears as a level in §1.3 and an economics row in §6.6.
**Interacts with:** §0.3 (catalogue), §1.3, §6.6.

### Threat space that was half-covered and is now filled
**How it works:** The physical, utility, and supply-chain layer: water supply and water rights, grid
interconnection queues, transformer lead times (measured in *years*), customs and import delays,
counterfeit parts, export controls and sanctions, wildfire smoke and air quality, and the demand
charge on the power bill. Plus the operational middle of P20 and the protocol-level resource attacks
that don't look like floods.
**Interacts with:** §2.7, §2.8, §2.10, §6.3.

### Known live disagreements
**How it works:** Wave 2 was explicitly asked to surface contradictions rather than silently resolve
them. The major unresolved ones are flagged inline with ⚔️ throughout, and the biggest are:
authenticity-first (P7) vs. mechanics-first (the game-designer stance); waves vs. continuous flow as
the canonical traffic model; degradation vs. destruction as the failure idiom; simulation depth vs.
legibility under load (P5); and whether the player is one engineer or an owner-operator commanding a
company. Each is kept as a tension because each is a real design fork, not an error.
**Interacts with:** §9.6 (design guardrails).

---
