# 1. Levels, scenarios, and progression

## 1.1 The scale ladder (campaign spine)

*All five lenses independently proposed a scale ladder; they are merged here into one spine. The
shared insight: **each rung changes the unit of thought** — what one "object" on the board
represents, what one visitor represents, and what one dollar represents. The board doesn't just get
bigger, it gets coarser, and the player is promoted from tweaking single processes to commanding
regions. The game-designer lens adds the presentation trick: **each tier's entire map becomes one
icon in the next tier's map**, so the player physically watches their world shrink into a component
(the Factorio/Civ dopamine, and it solves the TD scaling problem by changing the unit of abstraction
rather than adding sprites). The visual lens adds that each rung is a **separate art treatment with
its own asset set**, not a scaled version of the last one — see "The camera ladder" below.*

### The four ladders, and which one is the campaign (contradiction resolution)
Four complete progression spines were proposed independently and the document must say how they
relate or a reader cannot tell whether they are alternatives, an overlay, or two halves of one thing.

**How it works:** The canonical assignment —
- **The scale ladder (Tier 0–6) is the board.** It determines what the map looks like, what an object
  is, and what the camera shows. It is the campaign.
- **The business ladder (L1–L10) is the scorecard.** It determines what the §6 HUD shows and what the
  level's win condition is denominated in. "L4 The Shared Hosting Shop" is what Tier 3 is *called*
  when your line is shared hosting. Rough mapping: Tier 2 ≈ L3; Tier 3 ≈ L4–L6; Tier 4 ≈ L7;
  Tier 5 ≈ L8; Tier 6 ≈ L9–L10.
- **The P&L ladder (Tier 0–6 of financial complexity) is the HUD gate.** Each rung unlocks a new HUD
  strip, so financial complexity is visibly gated and a shared-hosting newbie level literally does
  not render the Deferred Revenue bar.
- **The camera ladder (Z0–Z5) is the art production spine.** It is the same tiers expressed as six
  fixed compositions with six asset sets.
One campaign, four readouts.
**⚔️ Tension:** two lenses independently flagged that the scale ladder and the business ladder read
as two complete campaigns and that the document never says which ships. Both proposed the same fix
(scale = board, business = scorecard) and it is adopted above; the alternate reading — run the
business ladder as a *separate* CEO-chair campaign with infrastructure on autopilot — is preserved in
§1.2 `Founder Mode` rather than as a second spine.

### Tier 0 — "Hello World" / `index.html` / "Inside the Box"
You are one website on somebody else's shared server. You don't own the machine; you own a
directory, a database, and a quota bar.

**How it works:** Unit of thought: **files, queries, and a worker pool**. The map is one request
lane: port 80 → an Apache/PHP worker pool → your script → the shared MySQL you get 20 connections
to. The whole map is one server with ~12 "PHP worker" slots visualized as a row of lanes — every
request occupies a lane for N ticks. This teaches the single most important lesson in hosting:
**you are not out of CPU, you are out of concurrency slots.** 3 build slots. Your only verbs are
optimize, cache, delete, and beg.
**The powerlessness correction (three lenses flagged this):** ten to twelve minutes of pure
powerlessness is a risky first impression for a game someone bought voluntarily. Keep the
powerlessness as the *frame*, not the *feel*:
- Precede it with the **Cold Open** (§1.11) so the player has already seen the destination.
- Give the player **one genuinely satisfying authored win in the first three minutes**: each of the
  three verbs (optimize, cache, delete) must visibly buy back concurrency slots. The player adds a
  cache and watches the worker-slot ring empty out. The emotional shape becomes "I am trapped, and I
  am still good at this."
- **Cut it to 6–8 minutes.**
- End it with the shared host suspending you *anyway*, so the powerlessness pays off as a narrative
  beat rather than as twelve minutes of gameplay.
**The teaching moment:** Tier 0 is the correct place to teach **the queueing hockey-stick** (§7.1),
because 12 worker slots is small enough to count and the player should *see* latency go vertical at
slot 10 of 12. That single moment is worth more than the rest of the tutorial.
**Interacts with:** §2.2 (comment spam, hotlinking, wp-login brute force, xmlrpc pingback,
scrapers), §7.1 (the lane), §3.1 (patience bars), §1.11 (Cold Open).
**Win condition:** survive being on the front page of an aggregator for one night without getting
suspended; or survive 30 days without the host suspending you for resource abuse.
**Visual:** Z0 "Chassis View" — one box, cut open. DIMM slots, a CPU with a fan, drive bays, a single
NIC. Individual LEDs are 4px. Composition rule: **one object, centred, warm, shallow depth of field,
horizon high.**

### Tier 0.5 — "The Noisy Neighbor" (the shared resource)
Same shared server, but now you can SEE the other tenants.

**How it works:** Another customer's runaway cron pegs the box. Your defenses are indirect: open a
ticket (slow, with RNG on the support tier), buy a resource-cage upgrade (CloudLinux LVE-alike), or
migrate out. Introduces the idea that **not all your problems are yours**, and the meta-lesson that
the fix is sometimes commercial, not technical.
**Visual (expanded):** the server is an apartment-building cutaway — you own one lit window, the
other 200 belong to strangers. The 200 windows are **individually lit at brightnesses driven by
their actual resource use**, so the runaway-cron neighbour is visible as one window burning white
*before any alert fires*. The "cracks along the shared wall" **originate at that window and propagate
along the floor slab**, not randomly. The build palette is 90% locked — and the locked items render
**at full colour behind frosted glass**, not desaturated, because you must *want* them. Scarcity is
taught by desire, not by greying out.
**Interacts with:** §2.8 (noisy neighbour), §8.4.

### Tier 1 — "One Box" / `root@localhost` / "Your Own Box"
You get root. Everything is one machine: web + DB + mail + cron on the same silicon.

**How it works:** Unit of thought: **daemons and ports**. Introduces the **port grid** (open ports
are literally gates on the board), services as placeable objects, RAM/CPU as a shared pool every
service eats from, the first real defense (a firewall), the first upkeep bill, and the first
hardware-failure die roll. Build slots become a **RAM/CPU budget** — a soft cap that teaches
resource ceilings before physical racks do. Every service you add to make money also opens a door.
**Signature moment:** your first out-of-memory kill.
**The OOM killer, specified:** it is the game's **only anthropomorphic system entity** — a flat black
silhouette with no features, drawn in the Annotation layer so it has no perspective and no lighting,
which makes it deeply *wrong*. It walks in a straight line across the board ignoring geometry,
touches your largest service, and that service's process glyph simply stops existing. No particle,
no sound but a single click. **Its wrongness is the point and it must never be used for anything
else.**
**Visual:** Z1 "Rack Elevation" begins here — straight-on 42U side view like a real rack diagram.
Composition rule: one object, off-centre, cool, a second light source. Deliberately cold blue after
Tier 0's warm domestic lamp yellows, so that owning a box feels like a graduation.
**Interacts with:** §4.2, §2.8 (OOM), P2.

### Tier 2 — "Two U in Someone Else's Cage" / `Cage 14, Row C`
You rent 2–4U in a shared cabinet. You are now a tiny hosting company.

**How it works:** Unit of thought: **the server**. Introduces the **physical layer** — rack units,
cables, a switch, a cross-connect, a power strip with a finite amp budget, a /29 of IPs, and
**remote hands as a paid action with latency** (you cannot teleport to the datacenter; every
physical fix is a cost + delay roll, typically $150/hr with a 4-hour response). Introduces **latency
as distance**, hardware failure as a real threat class, and "the drive to the datacenter" (a timer
you can shortcut with money). First DNS zone, first cert expiry, first customer. You can no longer
fix everything from the keyboard; some failures require a body.
**The missing constraint — lead time (a major wave-2 correction):** this tier assumes you buy a
thing and it arrives. Add the real clocks, because **the first time a player cannot solve a problem
with money because the answer is "eight weeks" is a formative moment**, and Tier 2 is where it should
happen cheaply and survivably:
- the **circuit order** — 60–120 days, with a visible multi-stage pipeline (quote → contract →
  LOA/CFA paperwork you must get from the *other* party → carrier survey → construction → cross-connect
  scheduling → turn-up → BGP session),
- the **cross-connect order** — 5–20 business days plus paperwork,
- the **hardware order** — 2–12 weeks, longer for anything with a GPU or a specific drive.
See §1.11 "Lead Time as a first-class progression axis."
**Signature moment:** you discover both your "redundant" PSUs are plugged into the same PDU strip.
Fixing it requires a maintenance window, which requires telling customers, which costs reputation.
**Interacts with:** §4.7, §2.8, §7.5 (actions cost time), §1.11 (Lead Time Board).
**Scenario hooks:** the facility's badge system, the remote-hands ticket minigame, and a neighbour
in the next cage whose misconfigured ARP floods your switch.

### Tier 2.5 — "A Rack Of Our Own"
Full cabinet, your own switch, your own power budget (two 30A feeds, A+B), your first firewall, your
first out-of-band/IPMI network.

**How it works:** Unit of thought: **the rack**. Now you must think about **failure domains**: both
PSUs on the same PDU means the PDU is a single point of failure and the "redundant" label is a lie.
The game should let the player make this mistake and then punish it exactly once, memorably. Lead
times (above) apply here too and bite harder because you now have customers waiting.
**Visual:** Z2 "Room Isometric" begins — a suite/cage, a handful of racks in hot/cold aisles, a CRAC
unit, a door. Racks are ~80px tall objects; individual servers are 6px slivers. Composition rule: a
**vertical slice**, strong verticals, horizon lost.
**Interacts with:** §7.1 (effective vs nominal redundancy), §2.8 (PDU trip).

### Tier 3 — "The Stack" / "The Cage" / `prod`
A real multi-tier production service: load balancers, several web nodes, DB primary + replica, cache
tier, object storage, a CDN contract, a job queue, a monitoring box, staging.

**How it works:** Unit of thought: **tiers and flows**, not machines. The board becomes a river
system: visitors enter at the edge and flow inward. Introduces **failover**, **replication lag**,
**deploys as a self-inflicted threat**, **on-call**, **the status page**, real SLAs, tickets, the
first staff hires, and **blast radius as an explicit per-object displayed stat**. **Now you have
customers, not just visitors** — tenants who pay MRR and generate their *own* visitor streams and
their *own* attackers. The hard part is partial failures: nothing is fully down anymore, things are
*degraded*, and degraded is harder to read than dead. This is where **Symptom vs Cause** (§7.6)
turns on.
**Signature moment (added):** the **first cache stampede.** A cache node reboots, the miss rate goes
to 100%, every visitor hits the DB at once, the DB falls over, and the cache cannot warm because the
DB is down. Surviving it requires the **request-coalescing / stale-while-revalidate** unlock. The
lesson: **HA introduces its own failure class** — split-brain, failover storms and stampedes exist
*because* you added redundancy.
**Visual identity (this tier had none and the game spends the most time in it):** Tier 3's identity
is **flow legibility** — the first tier where the Board register is as important as the Room. Its
postcard is the orthographic diagram with traffic ribbons, shot slightly from above, with the rack
room visible and out of focus behind it. Its signature image is **the first time a ribbon splits at a
load balancer.** Composition rule: horizontal flow left-to-right, the diagram's shape visible.
**Interacts with:** §3.9 (clients as spawners), §7.7, §6.2 (MRR).

### Tier 3.5 — "The Platform" (you sell an API; other people build on you)
Multi-tenancy at the software layer, quotas, rate limits, a status page, an SLA with teeth.

**How it works:** Introduces the customer as a **programmatic actor**. A customer's retry loop is
indistinguishable from a DDoS. You get a thundering herd of your *own clients* after every blip.
**Signature moment:** you recover from a 3-minute outage and immediately fall over again because
every client retried simultaneously with no jitter. **Unlock: exponential-backoff advocacy** — you
literally publish a client SDK to make your own customers less dangerous, which is a defensive tower
that lives in someone else's codebase.
**Interacts with:** §2.3 (retry storms), §1.3 "Consumption"/K8s, §7.5.

### Tier 4 — "Landlord" / "The Floor" / "We Are The Datacenter" / `Suite 200`
You run the facility: many racks, many customers, and you sell to tenants.

**How it works:** Unit of thought: **the facility**. Individual servers stop being the unit; **racks
are the unit**. Introduces **power and cooling as first-class resources** (kW per rack, hot/cold
aisle, CRAC units, UPS strings, a generator with a fuel gauge and a fuel contract), fire suppression
zones, badge access, a loading dock, a meet-me room, a NOC, **abuse handling** (your own customers
are now a threat vector), **capacity sales** (selling space you don't have yet), **peering**, PUE,
and cross-connect revenue. Thermal and electrical faults are now **area-of-effect and cascading**:
one failed CRAC raises a hot-aisle temperature that throttles CPUs in a radius, which raises fan
speeds, which raises power draw, which trips a breaker.
**The renewal lever (correction):** the wave-1 text says "you cannot fire the profitable ones." True
but incomplete — in colo your real lever is **the renewal, not termination.** The high-maintenance
tenant gets a 22% increase at renewal and either self-selects out or becomes profitable. Renewal
pricing is the landlord's primary behaviour-shaping tool: it is slow, which fits the tier's tempo,
and it is how the business actually disciplines customers.
**Signature moment:** a tenant gets DDoSed and the collateral damage takes out the whole row; you
must decide whether to null-route a paying customer to save the floor. **Frame it precisely:** the
row's tenant tint bands go out **one by one along the row, left to right, in physical order**, while
the target designator stays locked on the one tenant who was actually targeted. **The innocent racks
go dark and the targeted one stays lit** — the entire injustice of the mechanic in one image.
**Second signature moment:** the **annual generator load test**. You must schedule it, and there is a
small chance the ATS doesn't transfer and you eat a real outage. The only way to lower that chance is
to have tested regularly — which costs a small risk each time. A perfect risk-management minigame.
**Visual:** Z3 "Floor Plan" — a full hall, dozens of rows, racks are 12px tiles, servers are no
longer drawn at all: **the rack is the atom.** Composition rule: one-point perspective down an aisle,
vanishing point dead centre.
**Interacts with:** §2.12 (colo threats), §4.7, §6.6 (occupancy, stranded capacity).

### Tier 5 — "Anycast" / "The Map" / "Two Datacenters, One Company"
Multiple datacenters, multiple regions. The board becomes a world map with a zoomable per-site view.

**How it works:** Unit of thought: **the region**, then **the routing table**. Introduces **BGP and
route steering**, anycast, GSLB, regional failover, replication topology, split-brain, data
sovereignty, follow-the-sun staffing, cross-region replication cost, submarine cable cuts, currency
and jurisdiction, regional demand curves, time zones (the sun moves; traffic follows it), and
peering vs transit economics with 95th-percentile billing. Your mistakes are now global and instant:
a bad route announcement is a 90-second apocalypse. **Two datacenters is the most dangerous number
of datacenters** (quorum needs three). The WAN link becomes the new SPOF. Failover is now a
*decision* with a cost, not an automatic save. **The control plane becomes the single point of
failure**: your regions are redundant; your deploy pipeline, your DNS, and your auth system are not.
**The quorum mechanic, made concrete (two lenses independently demanded this):** "two datacenters is
the most dangerous number" was a slogan with no mechanic. Make quorum an explicit, **purchasable, and
cheap** object: a **witness / tiebreaker node** — a tiny VM in a third location for ~$12–20/month —
whose absence is the only thing turning a WAN partition into a split-brain. You need a third *failure
domain*, not a third datacenter. Flag it in the Secondary Everything Register as "quorum: 2 of 2" in
red from the moment the second site goes live. **The lesson lands hard precisely because the fix
costs $12/month and the player didn't buy it**, and the level's teaching beat is watching the player
over-solve the problem expensively before discovering the cheap answer.
**Signature moment:** you push a config change that is correct in region A and fatal in region B,
and your deploy tool helpfully rolls it out everywhere in 40 seconds.
**Visual:** Z4 "Campus," then Z5 "Globe / Region Ribbon" — a stylized world with your sites as
glowing pins and transit/peering as arcs. Composition rule: **orthographic map, no horizon at all.**
**Interacts with:** §2.7 (BGP hijack, route leak), §7.1, §8.3 (Z4 altitude).

### Tier 6 — "Hyperscale" / "Region Build" / "The Grid" (endgame)
You place whole datacenters, sign power contracts years ahead, build your own fiber, negotiate with
substations, and fight nation-state-scale adversaries and regulators. You are utility-scale:
build-to-suit halls, a 20-year power contract, and one hyperscaler tenant who can end you by not
renewing.

**How it works:** The wave-1 draft made this "mostly a sandbox with narrative bookends," which means
the campaign's last hour has no designed play. **Give Tier 6 a real game:** its unique verb is
**arbitration** — you no longer fix things, you decide between two of your own directors who both
want the same power, staff, or capital. Three to five short arbitration levels beat one big sandbox.
Its systems are **policy authoring** (§7.5) plus the **Double-Header** (§1.10): two boards, one
budget, one attention span.
**The final flex:** zoom out one more stop than the player thought existed, revealing your world map
as one node in a larger network graph, your company one glowing cluster among competitors.
**The Tier-6 Constellation Pullback (the image):** the world map's site markers stop being pins and
become **light** — your sites warm points, competitors cool ones, transit faint lines — and then the
map itself recedes into a dark field where the pattern of lights reads as a **constellation with your
company's mark traced between your own sites**. Used exactly once. Restraint is what makes it work.
Tier 6 is also the only place the game uses **true darkness** as its dominant value: everything below
Tier 6 is lit; the endgame looks like night from orbit. Composition rule: the horizon returns, from
orbit.

### The difficulty comes from coupling, not HP (design rule)
The sysadmin lens's explicit statement of what actually gets harder.

**How it works:** In order — (1) more objects (T3→T4), (2) **more connections between objects**
(T4→T5, the real complexity jump), (3) shared dependencies (T5→T6: one DNS resolver, one auth
service, one monitoring box), (4) other people's failures inside your domain (T6: colo tenants,
upstream transit), (5) failures you cannot see from where you are standing (T7–8: the other region's
truth is delayed and possibly lying to you), and — **the added sixth rung, which is the real
endgame** — (6) **failures in systems you do not operate and cannot see at all**: your upstream's
upstream, a shared BGP route server, a cloud provider's control plane, a certificate authority's
compliance process, a root DNS operator, a payment network. At Tier 5–6 a growing share of your
incidents should have **no action available except communication**, and the skill being tested
becomes *how fast can you correctly determine that this is not your problem, and how well do you tell
people.*

### The camera ladder (six fixed tiers as authored art treatments)
Progression is literally a zoom-out, and each tier is a separate art treatment with its own asset
set, not a scaled version of the last one.

**How it works:** **Z0 Chassis View** (one box cut open; LEDs are 4px) · **Z1 Rack Elevation**
(straight-on 42U, servers are 1U horizontal bars you read like a barcode) · **Z2 Room Isometric**
(a cage: racks ~80px, servers 6px slivers) · **Z3 Floor Plan** (a hall; racks are 12px tiles, servers
are not drawn) · **Z4 Campus** (buildings, yard, generators, fuel tanks, substation, meet-me room,
fence line; the hall is a footprint) · **Z5 Globe/Region Ribbon** (sites as pins, transit as arcs;
the building is a dot).
**Interacts with:** every other category — threats, visitors and money each need a "what does this
look like at Z*N*" definition (the LOD contract, §8.12).

### The Elevator Transition
Moving between tiers is never a hard cut.

**How it works:** The camera pulls back, the current tier's detail *dissolves into* the parent's
summary glyph with a 300ms cross-fade, and a thin white "you are here" frame shrinks to show what you
just left. The player should be able to hold the zoom key and watch their whole company
assemble/disassemble like a telescope.

### Zoom-as-Abstraction (the LOD swap)
Every entity declares four representations and **nothing ever vanishes; it gets folded upward.**

**How it works:** **full sprite → icon → coloured dot → contribution to a heat tile.** A failing drive
is a clicking sprite at Z0, an amber bay icon at Z1, an amber pixel at Z2, and one degree of "this
rack's tile is slightly amber" at Z3.
**Production requirement (stated as a rule, not a preference):** LOD0 full detail (Z1) · LOD1
faceplate + lights only (Z2) · LOD2 silhouette + one state colour + load donut (Z3) · **LOD3 the
object does not exist and is represented by its parent's aggregate glyph (Z4).** The LOD3 rule —
objects *stop existing* rather than becoming tiny — is the mechanism behind "aggregate, don't shrink."

### The Scale Handshake Frame
§1.1's best presentation idea — "each tier's map becomes one icon in the next tier's map" — needs one
authored frame to land.

**How it works:** At tier-up the camera pulls out until the entire previous level fits inside a
rectangle; the rectangle then **hard-snaps to the grid of the new level's iconography** with an
audible detent, and the old world's detail collapses into the new world's single glyph in one frame.
Hold on that glyph for a beat with its label (`RACK 04`, `SUITE 200`, `IAD1`) before the new board
draws in. **The snap, not the zoom, is what sells it.**

### Per-Tier Composition Rules
Make the tier postcards actually distinct by fixing *composition*, not just content.

**How it works:** Tier 0 — one object, centred, warm, shallow DOF, horizon high. Tier 1 — one object,
off-centre, cool, a second light source. Tier 2 — a vertical slice (the cabinet), strong verticals,
horizon lost. Tier 3 — horizontal flow left-to-right, the diagram's shape visible. Tier 4 —
one-point perspective down an aisle, vanishing point dead centre. Tier 5 — orthographic map, no
horizon. Tier 6 — the horizon returns, from orbit. **You can identify the tier from a thumbnail with
the content blurred**, which is the actual test §1.8 is asking for.

### The Aisle Vanishing Point
A specific, cheap wayfinding device for Tier 4+.

**How it works:** Every facility level has one canonical aisle whose vanishing point is the camera's
home position. An alarm state at the far end of that aisle is visible as a coloured glow at the
vanishing point even when you're zoomed elsewhere — **the room tells you something is wrong at the
back of it** without an alert.

### The Growth Scar
When you graduate a tier, the old setup is not deleted — it is kept in the corner, visibly obsolete.

**How it works:** Your Tier-0 beige tower ends up as a dusty box in the corner of the Tier-2 suite
with a "DO NOT DECOM — DNS STILL ON THIS" post-it. It is the single best readable signal of "look how
far you came," it doubles as a running joke, and it is an **actual liability node** you can click,
inspect, and eventually (§1.12 `The Decommission`) be punished by.
**Interacts with:** §1.6 Legacy debt, §9.2 The Legacy Box, §1.12.

### The parallel business ladder (CEO framing)
The same campaign expressed as business stages, each with a different P&L shape — the **scorecard**
layer over the scale ladder. Real numbers attached, because the numbers *are* the level's difficulty
definition.

**How it works:**
- **L0 "The Side Hustle"** — You have a job. Hosting is nights and weekends. Your constraint isn't
  cash, it's *your own hours*, and the level is about whether to quit. Introduces opportunity cost
  before it introduces money.
- **L1 "The Freelancer"** — Revenue $0–30/mo, costs $12–40/mo. You host your own site plus three
  favours for friends. The level teaches that uptime has a cost even when nobody's paying. Win: get
  one friend to pay $10/mo. Comedy beat: your first invoice is $10, your hosting bill is $12, and the
  3 hours you spent are valued at nothing. **The realization is that your hourly rate is negative.**
- **L2 "The Reseller"** — 40 accounts × $8 = $320 MRR against a $50/mo reseller plan: **62% gross
  margin and 0% control.** The real reason people do this is zero capex. You have billing, support,
  and a brand, but no infrastructure: when the upstream goes down, *you* eat the tickets and the
  churn, and your only defense tower is communication. Fail state: three upstream outages churn 60%
  of a price-sensitive book in six weeks and MRR hits zero.
- **L3 "Two U's in Someone's Rack"** — $180/mo colo for 2U + 1 amp + a /29; $2,400 of hardware capex;
  first 95th-percentile bill $60. **Payback on the hardware is 14 months, which is the whole lesson.**
  Introduces capex vs opex, per-U/per-amp/per-cross-connect/per-remote-hands-hour billing.
- **L4 "The Shared Hosting Shop"** — 100 customers at $5 = $500 MRR. Real cost stack: one $180/mo
  box, $120/mo control-panel licence, $95 of payment fees (**19% of revenue at $5 plans**), and 30
  tickets/month at $7 each = $210. **You are losing money at 100 customers and the level should let
  the player discover that.** The fix isn't more customers — it's annual prepay, add-ons, and ticket
  deflection. Oversell ratio becomes a slider; one abusive customer degrades 99 others; introduces
  plan tiers, coupon codes, the abuse desk, the chargeback, and
  **support-cost-per-dollar-of-revenue** — the number that kills every cheap host.
- **L5 "The VPS Provider" (LowEnd Land)** — 300 VMs × $6 = $1,800 MRR across 6 host nodes at $4k
  each. **Fraud rate 8–15% of signups without screening; 2% of accounts generate 80% of abuse
  tickets.** Crypto miners, DDoS-origination abuse, and "your entire /24 is now on a blocklist."
  Teaches the difference between *revenue* and *good revenue*. New tower: fraud scoring at checkout,
  which lowers revenue on purpose and makes you more money.
- **L5.5 "The Book Buy"** — before the full roll-up, you buy one small competitor's 300-account book
  for 12× monthly revenue and learn what 30% post-migration churn feels like at small scale.
- **L6 "Managed & Serious"** — 20 customers × $600. Your own cage, a real stack, and **SLAs with
  teeth** you must staff to meet. SLA credits are capped at one month's fee — **the real cost of an
  outage here is the renewal discount you'll concede, not the credit.** An SLA credit clause is *a
  tower you build and a bomb you carry*. First enterprise prospect demands a security questionnaire
  you can't answer yet.
- **L7 "The Datacenter Operator"** — 40 cabinets at $900 = $36k MRR, plus $8k of cross-connects at
  ~98% margin, plus power resale. **Occupancy 64% and the level is about the other 36%.** You stop
  selling websites and start selling space, power, and transit to other hosts. Your customers are
  businesses that also have customers.
- **L8 "Multi-Region"** — Latency-based routing, DR failover you actually pay for, regional
  compliance, GDPR/data-residency unlock, FX exposure, VAT by jurisdiction. A second site doubles
  cost and only *partially* doubles resilience, and sales will sell "multi-region" long before ops
  can deliver it.
- **L9 "The Roll-Up"** — You buy smaller hosts' books of business. **Acquisition price 10–18×
  monthly revenue (or 3–5× EBITDA); expect 20–35% churn in the first 12 months post-migration; hold
  20% of price in escrow tied to month-12 retention.** Each acquisition is a lane of *pre-annoyed*
  customers arriving at once, on legacy infrastructure, with a migration deadline. **Correction:**
  wave-1's "you buy a book and half of it walks" is the catastrophic case; a quarter is the expected
  case, and the difference between them is *entirely migration quality*.
- **L10 "Hyperscale Pressure"** — A cloud giant enters your market below your cost. You cannot win
  on price. You must win on support, niche, compliance, or being the human at 3am. The final level
  is a *positioning* puzzle, not a capacity puzzle.
- **L11 "The Platform"** — Late-game: you stop selling hosting and start selling **wholesale
  capacity** to other people who sell hosting. Enormous volume, no brand, no support burden, and
  total dependence on a handful of customers who could build it themselves.
**Interacts with:** §6 throughout, §3.8 (positioning), §1.12 `The Book Sale`.

### The business difficulty curve
What gets harder, stage by stage, in business terms — now on four axes, not three.

**How it works:**
1. **Visibility.** L1–3, every dollar is visible and one customer is 25% of revenue — failure is
   personal. L4–5, volume hides individuals and introduces *statistical* problems (churn %, fraud %,
   tickets per 100 accounts); you stop managing customers and start managing *rates*.
2. **Obligation.** L6–7, contracts, terms, and liability appear — a decision today creates an
   obligation eighteen months out (the **commitment ledger**, a scrolling list of things you owe).
3. **Organizational drag.** L8–10, your team is a system with turnover, knowledge loss,
   communication latency, and the person who knows how billing works is the person you can't afford
   to lose.
4. **Time constants (the added fourth axis).** **The time constant of your decisions lengthens at
   every rung.** At L1 a decision pays back in days. At L4 in months. At L7 in *years* — a 5-year
   lease, a 3-year hardware cycle, a 2-year audit history. **By L10 your most important decisions
   won't resolve inside the level you make them in**, which is the mechanical justification for the
   cross-level Company Ledger (§1.6) and for Pillar P10.
Throughout, **Reputation** becomes more and more load-bearing.

### The P&L Ladder (financial complexity as a gated HUD)
Progression measured not in racks but in **which line of the income statement you are allowed to
touch.** Each tier unlocks a new HUD strip, so complexity is visibly gated.

**How it works:**
- **Tier 0 — Pocket Money.** Revenue and one cost. No distinction between "cash" and "profit."
  Everything is a single number.
- **Tier 1 — Invoice & Churn.** Revenue splits into *MRR* and *one-time*. Customers now leave.
- **Tier 2 — Capex vs Opex.** You can buy things that cost money now and pay back later.
  Depreciation appears. **"Profitable but broke" becomes possible for the first time — and it should
  kill your first run.**
- **Tier 3 — Working Capital.** Deferred revenue, annual prepay, DSO, dunning, bad debt.
- **Tier 4 — Financing.** Leases, vendor financing, a revolver, an investor. Covenants.
- **Tier 5 — Portfolio.** Multiple lines with different margin/churn/capex profiles; you allocate
  capital between them instead of just building.
- **Tier 6 — Enterprise Value.** The score stops being cash and becomes a **multiple** — EBITDA
  multiple for colo, ARR multiple for cloud, per-customer multiple for shared hosting.
**Interacts with:** §6.8 (metrics HUD), §1.11 (The Multiple as a persistent meta-stat).

---

## 1.2 Perspective-shift levels

*Rotate the camera instead of zooming out. These break monotony, teach the same systems from the
other side, and are where the design gets to be weird. Break the campaign's rhythm with one every
~5 levels — and **cap them at one per chapter**, because their novelty is exactly proportional to
their rarity.*

### The Invariant-Core filter (authoring law for every perspective level)
Fifteen perspective levels is fifteen potential rulesets, which is exactly the fragmentation risk the
whole design is trying to avoid.

**How it works:** A perspective level may change **which of the six verbs dominates** and **what you
can see** — and nothing else. (The six verbs: Observe, Diagnose, Place & Connect, Tune, Triage,
Commit. See §1.9.) Concretely:
- `The NOC Shift` = Triage-dominant, no Place/Connect.
- `The Auditor` = Observe + Commit dominant, no Triage.
- `The Datacenter Tech` = Place/Connect only, no Observe (you're *told* what to do and it's wrong).
- `The Support Queue` = Diagnose-only, with the board hidden.
- `Red Team Friday` = the same six verbs with the goal node inverted.
- `The Apprentice` = Tune-only (you may author policy and nothing else).
**Any perspective level that needs a seventh verb gets cut or becomes a cutscene.**

### The Perspective Frame Device
*The single biggest missed opportunity in the wave-1 draft: perspective levels changed who you are
but not how the screen is built.*

**How it looks:** Every perspective level gets its own **viewport chrome** — a physical frame around
the world that tells you instantly whose eyes you're in, and which **replaces** the HUD rather than
adding to it, so screen budget stays constant.
- `The NOC Shift` — four CRT monitor bezels with a seam down the middle and a reflection of a dark
  room behind them.
- `The Datacenter Tech` — a helmet-cam vignette with a lanyard swinging in the bottom corner and a
  work-order PDA in the lower right.
- `The Auditor` — a clipboard: the world renders *inside the paper*, with a pen and a checkbox column
  down the right margin.
- `Eyes of the Packet` — a first-person tube with header fields drawn on the walls.
- `Founder Mode` — a desk: the world is on a laptop screen at an angle, with a coffee cup and a phone
  on the desk that rings.
- `The Support Queue Level` — a helpdesk window with the world *absent*: just the ticket list and a
  dark, wrong-feeling empty space where the board should be.
**Interacts with:** all of §1.2, §8.8 (HUD skeleton), §9.1 (modes).

### `The Tenant` / "The Customer"
You are back to a small customer — inside a datacenter you previously built in an earlier level.

**How it works:** Your old decisions are now the constraints you suffer under. Short, tense, comedic:
your provider is failing and you have almost no control. Every complaint you file in this level
shows up later as a mechanic you'll be on the receiving end of. Emotional payoff: "who put the UPS
there? …oh."
**The payoff, staged:** when you find the offending object, the camera performs a slow orbit and the
object's **asset tag is legible** — and it carries *your own company's* asset-tag format from the
earlier level. **Recognition through typography.**
**Interacts with:** §9.2 ("Reverse Colo"), §3.7 (empathy for the ticket queue), §1.8 (Asset-Tag
Ledger).

### `Red Team Friday`
You play the attacker for one level, against an AI-run host (often a network the player themselves
built two levels ago, or a rival's).

**How it works:** You get a budget and buy botnet time, scanners, and exploits. You learn each
threat's actual pathing rules from the inside, which permanently improves your tooltips — attacks
you have personally used show extra info forever after. Nothing makes a player understand why rate
limiting matters like watching their own credential stuffer get walled. Reward: intel that unlocks
defensive tech.
**Visual treatment (it had none):** the entire level renders in the **attacker's tooling aesthetic** —
your target is a scan result, a list of open ports with version strings, a network graph built from
inference, with big unknown regions. Successful reconnaissance *fills in the picture*, which is the
exact inverse of the fog-of-instrumentation you're used to. When you return to normal levels, the
knowledge is expressed as your own defenses showing **what an attacker would see**.
**Interacts with:** §5.4 (Threat Codex), §9.1 (Red vs Blue PvP), §7.6 (fog of infra).

### `The NOC Shift` / "On-Call Night"
A pure reactive level: no building allowed, only triage.

**How it works:** It's 2:47am. Six things break in twenty minutes; you have three hands. One alert
is a false positive, one is a symptom of another. Scoring is about *order of operations* and MTTR —
and whether you woke anyone else up unnecessarily. In the purest variant you don't touch anything at
all: you have only dashboards and a phone, and you can only route information to the right people,
scored on **time-to-correct-escalation**.
**Visual:** the Perspective Frame (four monitor bezels) plus the strongest use of the **4am grade**
in the game — the world is nearly monochrome and the six alerts are the only saturated objects on
screen. The room behind the monitors is visible in reflection and it is dark. **The false-positive
alert should be the *brightest* one**, which is the joke and the lesson.
**Interacts with:** §7.5 (hands), §7.6 (symptom vs cause).

### `The New Hire`
You inherit a stack you didn't build, with no documentation.

**How it works:** Half the objects on the map are fogged with "???" and must be *investigated* (an
action that costs time) before you can upgrade or even safely restart them. One of them is
load-bearing and nobody knows why. A brilliant tutorial-in-reverse and a comedy set piece.
**Three real tools, not one abstract time cost:**
1. **Read the runbooks** — which are wrong in interesting ways.
2. **Read the tickets** — the last six months of tickets tell you exactly which systems are fragile.
   **Historical support tickets are the highest-signal documentation in any hosting company**, this
   is free content built on the ticket generator you already have, and it exists nowhere else in the
   design.
3. **Ask someone** — costs *their* hand, not yours, and accuracy depends on their morale and tenure.
**Visual:** unknown objects render as **crated / shrink-wrapped forms** — the right silhouette
family, wrapped in opaque plastic with a shipping label you can't read. Investigating cuts the wrap
open in one animation. **The load-bearing one nobody knows about should be the least
interesting-looking wrap in the room.**
**Interacts with:** §7.6 (fog of infra), §9.2 (the legacy box), §1.12 `The Scream Test`.

### `The Auditor` / "Audit Week"
A compliance level. You must reach a configuration *state*, not survive an assault.

**How it works:** Threats are *findings*: an open port, a shared root password, logs not retained 90
days, no change control, an unencrypted link. The "tower defense" is defending against a clipboard.
An auditor NPC walks your floor along a visible pathline; anything out of compliance glows with a
yellow dashed outline *only when he's within N tiles*, so you scramble ahead of a moving spotlight.
Optional boss beat: the auditor asks you to *prove* something and you must produce a log you may not
have been keeping. **You can pass the audit with a worse infrastructure and fail it with a better
one — compliance ≠ security, and the game should make that funny and infuriating.**
**Expanded staging:** the auditor's pathline is drawn on the floor **ahead of him** as a dashed route
with timestamps, so the player can plan; the compliance glow is a **hard-edged circle**, not a radius
falloff, so its boundary is unambiguous; and items he has already passed get a small **green chalk
tick on the floor that persists**, turning the level into a visible sweep record. The frame is a
clipboard and the world renders inside the paper.
**Hosting types:** core to regulated hosting; appears as a scenario for every type.
**Interacts with:** §2.12 (the Finding), §4.9 (compliance vault), §1.12 `The Regulator's Sandbox`.

### `The Auditor, Inverted`
You *are* the auditor, inspecting an AI-run facility and scoring it.

**How it works:** You walk someone else's floor with a checklist and grade them. Unlocks knowing
exactly what auditors look for in your own levels — a teaching device disguised as a power fantasy.
**Interacts with:** `The Auditor`, §1.12 `The Second Opinion`.

### `The Datacenter Tech` / "Remote Hands"
Bottom-up perspective. You are the hands.

**How it works:** The map is a cold aisle. A ticket queue, a cart, and a long walk. Tasks queue: swap
a drive in bay 7 of a machine whose front label fell off, trace a cable, run a cross-connect, find
which of 42 identical servers is beeping, reseat the DIMM in A17-U22. The upstairs "player" (the NOC)
sends you instructions that are sometimes wrong. Teaches empathy and physical reality.
**The two things that actually dominate the job (added):**
1. **The ticket is ambiguous.** "Please reboot the server in rack 7" — there are nine servers in rack
   7 and the customer is not answering.
2. **The part is wrong.** You arrive with the wrong rail kit, the wrong optic (LR vs SR — a real and
   constant confusion), a cable six inches too short, or a drive caddy that doesn't fit the chassis
   generation. Each is a trip back, an hour, and a customer waiting. **"Did you bring the right
   thing" is 40% of that job.**
**Visual:** helmet-cam frame, work-order PDA in the corner, and critically **the camera is at 1.7m
and cannot leave the floor.** No altitudes. It is the only level in the game with no zoom, which is
exactly how the job feels, and it makes the Beeping Server minigame natively playable here.
**Interacts with:** §9.2 (the Beeping Server minigame, the Missing Screw), §2.12 (colo ambiguity).

### `The Migration Crew` / `The Migration`
Move a customer — or your whole stack — with zero downtime.

**How it works:** Two topologies side by side: old stack in full colour, new stack as a translucent
blueprint "ghost build." A shrinking bridge between them. Lower the TTL *days* before, sync data,
cut over, keep the old box warm, handle the writes that land on the old side after cutover. The
clock is a **DNS TTL bar draining above the map**. The player drags traffic percentage from old to
new with a physical patch-panel crossfade lever; as traffic moves the ghost solidifies and the old
stack desaturates. Entirely non-combat.
**Two refinements:** the crossfade lever has **physical detents at 10% increments with a click**,
because a migration is not a smooth dial; and the old stack's desaturation **lags the traffic move by
~5 seconds**, so there is always a visible moment where **both stacks are real**, which is the
dangerous part. A mistimed cutover shows a service **half-coloured in both places** — instantly
legible as split-brain.
**Interacts with:** §8.1 (ghost build), §1.5 (Zero Downtime Migration scenario).

### `The Abuse Desk`
You are not defending against attacks, you are defending against *your own customers*.

**How it works:** A queue of abuse reports: a phishing kit, outbound spam, a DMCA notice, a
copyright troll, a hacked CMS serving a fake bank login, a law-enforcement request, and one report
that is a competitor filing bad-faith complaints. Suspend too aggressively and you lose revenue and
get a bad review; too slowly and your whole /24 hits the RBL and *every* customer's mail stops
delivering. Every wrong call costs either a customer, an upstream relationship, or a lawsuit.
**Visual:** the Paper Family at full strength — the level is entirely a desk, a queue of envelopes
with different letterheads, a stamp pad with `SUSPEND` / `WARN` / `DISMISS`, and a **small monitor
showing the customer's site** so you can see what you're about to take down. **The bad-faith
competitor complaint is visually identical to the real ones except for one detail in the letterhead.
Reading paper closely is the level.**
**Hosting types:** shared web, VPS, seedbox/file hosting, bulletproof; a nightmare version exists
for email; the CDN and registrar versions are legal takedowns rather than abuse reports.
**Interacts with:** §4.9 (abuse desk policy dial), §2.10, §1.4 `Tenant-of-a-tenant recursion`.

### `The Support Queue Level`
You see only tickets, not the board.

**How it works:** You must infer the outage from customer complaints and dispatch fixes blind. The
board is revealed at the end and you're scored on how close your mental model was. In the CEO
framing: threats are *tickets*, towers are *agents, canned responses, and KB articles*, visitors are
customers deciding whether to renew based on first-response time.
**Make the labour explicit (expansion):** every ticket has a **handle time**, every agent an **hourly
cost**, and the player has **deflection tools** — a KB article, a macro, a self-serve feature, an AI
agent — whose ROI is computable. **The level's real lesson is that the cheapest ticket is the one
that was never opened**, which is invisible unless you show cost per ticket. Win = CSAT above X with
labour under Y *and* a deflection rate you chose to invest in.
**Visual:** the board's area is not blank — it is a **frosted pane** with vague shapes moving behind
it, so you can almost see. At the end the pane clears and your inferred model is overlaid on the real
one in the Intent layer (dashed white) so you can compare your guess to the truth. **Scoring becomes
a picture.**
**Interacts with:** §4.9, §3.7, §6.3 (cost-to-serve).

### `The Landlord`
You are the datacenter, not the hosting company.

**How it works:** Your "visitors" are prospective tenants touring the facility; your "threats" are
power events, HVAC failures, and tenants who overdraw their circuits. Completely different verbs —
you sell space, power, and cross-connects — with the same core loop. Introduces facilities tech that
carries back into Tier 4+.
**Interacts with:** §1.3 ("Amps and Aisles"), §3.3 (the tenant tour).

### `The CDN`
You are the edge, not the origin.

**How it works:** Hundreds of tiny PoPs and almost no compute. Your job is cache hit ratio. Puzzle-
flavoured: routing and eviction policy, not towers.

### `The Upstream`
You are a transit provider.

**How it works:** Your visitors are packets, your customers are networks. Peering disputes as a
resource negotiation minigame. Pairs with §1.3 "The Fabric" (the IXP business), which is the neutral
version of the same chair.

### `The Registrar` / `NXDOMAIN`
A tiny weird one: you run DNS for everybody.

**How it works:** Your lane is queries. Your boss fight is a reflection/amplification attack that
uses *you* as the weapon against a third party.
**Note:** this is the *DNS-hosting* chair. A real **registrar** is a completely different business
and gets its own hosting-type card — see §1.3 "Redemption Grace."

### `Eyes of the Packet`
A one-off level where you *are* a single HTTP request navigating a stranger's badly built stack.

**How it works:** Originally an image with no verb. **Give it one:** it is the **tutorial for the
Latency Ladder** (§3.1). You experience each hop as a wait, and your single verb is **choosing which
of two paths to take at each fork**, with the millisecond cost shown. Two minutes, used exactly once,
before the first WAF purchase — so the player has felt what +40ms means before they buy something
that costs +40ms. Otherwise cut it.

### `Founder Mode` / "The CEO Chair"
A business-only level: no infra placement, only pricing, hiring, and marketing decisions, with the
infrastructure running on autopilot based on your budget.

**How it works:** Scored on cash and churn. Some levels toggle between the Ops Chair (place servers,
stop attacks) and the CEO Chair (only spend money, set prices, hire, send emails). Brutally
instructive about what each role can and cannot see.
**Unification (three entries, one mechanic):** `Founder Mode`, `The Sales Chair` and `The Board
Meeting` are three descriptions of one system. Merge them into **the Chair system**: **Ops / Sales /
Finance** chairs, switchable with a cooldown, each with its own board, each running the others on
**delegation policy** while you're away. The pieces already exist — executive attention (§7.5),
delegation policies (§7.5), the Inbox (§7.5) — and merging gives the business layer one coherent
interaction instead of three level types.
**Visual:** the frame is a desk; the world is on a laptop screen at an angle, with a coffee cup and a
phone that rings.

### `The Sales Chair`
You play the pipeline: leads → qualified → demo → security review → procurement → close.

**How it works:** Threats are *competitor counter-offers, procurement delays, the champion leaving
the company, and a legal redline on your SLA.* Now a chair within the Chair system rather than a
standalone level type.
**Interacts with:** §1.5 `The RFP`, §1.12 `Column Fodder`, §1.12 `The Sales Engineer's Nightmare`.

### `The Board Meeting`
A short interstitial: you have five slides and four decisions.

**How it works:** Investors are the "visitors" and skepticism is the "threat." Your answers set your
next level's budget. Pairs with the Quarterly Board Meeting mandate mechanic (§1.6). Now the Finance
chair's recurring set piece.

### `Due Diligence` (walking someone else's floor)
You play an acquirer assessing another company's infrastructure, choosing what to keep.

**How it works:** Inspect, appraise, and price. Converts directly into the acquisition scenario — the
things you flagged become the things you inherit. Pairs with `The Second Opinion` (§1.12), which is
the same verb with a written deliverable, and with `Due Diligence` (§1.5), which is the same
inspection performed *on you*.

### `The Capacity Planner`
A spreadsheet-ish strategic chair: no real-time combat, an 18-month horizon, order lead times.

**How it works:** You sit in the chair that decides what to order and when, with nothing to click
during an incident. Expanded into a full level shape as `The Fleet Week` (§1.12).

### `The Apprentice` (you may only write rules)
You cannot act. You can only author **policies** — if/then rules with a priority order — and an AI
junior executes them, including the parts you got wrong, cheerfully, at 3am.

**How it works:** Scored on **how few times the junior had to improvise.** An entire level about the
gap between what you meant and what you wrote. A perspective level that is genuinely a different
*verb* while using zero new systems, and the perfect precursor to the late-game delegation arc.
**Interacts with:** §7.5 (autopilot), §1.11 (Ratchet Audit), §1.10 (Double-Header).

### `The Acquisition` (fogged inheritance)
You inherit a competitor's infrastructure sight-unseen. The best level premise in the document.

**How it works:** Half the board starts fogged; you must *discover* what you own by probing it, and
some of it is already compromised. Miscabled, undocumented, one machine nobody knows what it does —
touching it breaks something three hops away. Goal: modernize without breaking the mystery box.
**The economy (it needed one):** you get **Probe actions** (1 hand, ~20 seconds) that reveal one
object's identity, and **Trace actions** (1 hand, ~45 seconds) that reveal one object's dependencies.
**Probes ≈ 40% of object count**, so the level is fundamentally about *choosing what to understand.*
**The killer rule: an unprobed object cannot be safely modified — but it can be modified unsafely**,
and the temptation to just reboot the mystery box is the level.
**The commercial fog (half of a real acquisition, and funnier):** the fog is not only technical.
Contracts nobody can find, customers paying rates nobody remembers setting, twelve grandfathered
price tiers, a reseller with a verbal agreement, three accounts marked "comp — ask Dave," a customer
who has been on a free trial since 2017, and revenue in the bank from a customer who does not appear
in the billing system at all. **The player must reconstruct the *rate card* as well as the *rack
elevation*.**
**Visual — "The Junk Drawer":** every inherited object is drawn in a *slightly wrong* palette so it
reads as foreign, and **normalizing it into your own visual style is the level objective — visual
consistency as a win condition.** To keep it affordable this is a **three-parameter swap, not an art
pass**: (1) a different **cable palette**, (2) a different **label typeface + naming scheme**, (3) a
"grime + mismatched faceplate decal" layer. Specify the dialect precisely: their rack numbering
**runs the opposite direction** (the detail that will make operators laugh) and their asset tags
carry a different prefix.
**The readout — the Acquisition Normalization Bar:** a horizontal bar showing your estate as tiles,
tinted by which visual *dialect* each object belongs to (yours, theirs, third-party). The objective
is to make the bar one colour; each normalized object flips its faceplate, label font and cable
colour to your house style with a little sweep. **A progress bar made of art direction.**
**Interacts with:** §5.4 (mystery box reverse-engineering), §1.5 (acquisition scenarios), §8.10,
§1.12 `The Scream Test`, §1.12 `The Reconciliation`.

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

### "The Launch Window" — Game hosting, scenario variant
A new game launches at midnight. Demand is either 10× or 0.1× your forecast and you find out at
12:01.

**How it works:** Pre-provision (waste) or scale-on-demand (too slow). Pure capacity-gamble scenario.
Follow-on beat: **Launch Day Decay** — not an attack, a *demand collapse*. You built for 50× and now
you own 50× of idle hardware and its upkeep. **Success is the trap.**

### "Private Shard" — Community / MMO hosting
Small, passionate, loud customers. One server per community.

**How it works:** Signature mechanic: **drama.** Communities fracture, half the players leave,
someone DDoSes their ex-guild. Non-technical threats dominate. Comedic and cheap to author.

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

### "Node Sync" / "The Ledger Wall" / "The Clock Tower" — Blockchain node hosting
A level about a workload you cannot pause, prune, or reason with.

**How it works:** Storage grows forever, sync takes days, brutal IOPS, and the network can hard-fork
under you. Customers care about one number: uptime during a specific event.
**Visual:** everything paced to block time; a giant visible clock/heartbeat drives the level and
falling out of sync is drawn as your tower's hands drifting away from the reference clock overhead.
Each node has a visible chain with fork divergence shown as branching; falling behind is visible as a
shorter chain.

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

---

## 1.4 Cross-type and structural levels

### `Diversify` / `Two Businesses at Once`
Run two lines of business at once on shared infrastructure.

**How it works:** Say shared hosting + game servers. They compete for the same racks, power and staff
and have *opposite* peak hours (web peaks midday, games peak at night) — which is actually a synergy
the player should discover for themselves. Mixed portfolios smooth your utilization curve.
**The joke version, which is also the better level:** game servers and *backup*. Gamers peak at
night. Backups run at night too. **Their "complementary" demand curves collide, and the collision is
the level.**
**From Act 3 onward this becomes a standing requirement**, not a one-off: a level can demand you run
two business types on one facility, fighting over the same power, racks and staff.
**Interacts with:** §0.2 (line synergies), §6.6, §1.10 (The Double-Header).

### `Pivot` / "The Pivot Level"
Your main line of business is dying and you must convert your facility to a different one inside one
level.

**How it works:** Shared-hosting margins collapse; the control panel vendor changes its pricing;
crypto crashes; a game shuts down; regulation changes. Old hardware fits the new workload badly, and
existing hardware repurposes at a discount. A whole level about adaptive reuse and the cost of
transition — **without stopping revenue.**
**Visual:** the dying line's accent hue slowly desaturates over the level while the new line's grows
— **two palettes on screen, one fading and one growing**, the clearest possible picture of a pivot.
**The mechanism (make it spatial, not a crossfade): the Mid-Level Re-Skin Wipe.** The line skin
changes as a **wipe along the floor** — floor paint, then lighting, then faceplates, then visitor
costumes — advancing rack row by rack row at about one row per second. **You can see the old business
retreating**, and at any moment the facility is visibly half one business and half another, **with a
visible boundary you can stand on. That boundary is where the level's conflicts happen.**
**Interacts with:** §1.12 `The Book Sale` (how pivots are actually financed), §8.10.

### `The Junk Hardware Acquisition` / "The Junkyard" / "The Junk Drawer"
You buy a failing competitor and inherit their gear.

**How it works:** Mixed vendors, no documentation, three different control panels (two of them EOL),
out-of-warranty chassis, a support inbox with a 9-day backlog, and 200 customers on a platform you'd
never build. Three racks of mismatched gear arrive on a truck: decide what to rack, what to strip for
spares, what to scrap, what to keep running as a **legacy island**, and which customers you lose
doing it. A logistics and appraisal puzzle with a comedy payload — one machine is genuinely great,
one is a fire hazard, and one is still serving a customer nobody told you about.
**The capital-allocation framing (the version with real teeth):** **triage-as-capital-allocation** —
each box has a power draw, a failure probability, a customer attached, and a resale value. Killing it
saves opex but may churn a customer. **Win: cut the acquired fleet's power bill 50% while churning
<10%.**
**Interacts with:** §1.2 `The Acquisition` (fogged inheritance), §9.2 (legacy island), §1.12 `The
Scream Test`, §1.12 `The Reconciliation`.

### `The Landlord and the Tenant`
A two-sided level where you are a colo landlord AND one of your tenants is a hosting company you also
run.

**How it works:** Your two halves have conflicting interests: the landlord wants to sell the power
the tenant needs cheap. Deliciously structural, and a natural fit for the split-screen Double-Header
(§1.10) with one shared budget.
**Interacts with:** §9.1 (Landlord vs Tenant asymmetric multiplayer).

### `Multi-Line` / "The Convergence Level" / "Everything, Everywhere"
Late campaign: run four lines at once in one facility during a busy week. The exam.

**How it works:** All their opposed requirements collide — thermally, electrically, and in staff
attention. Later still, multiple business lines across multiple regions, where the skill is no longer
technical, it's **portfolio and attention management**. You cannot look at everything; you must
choose what to watch.
**Interacts with:** §7.8 (multi-board view), §8.10 (districts), §1.10 (Double-Header).

### `The Reseller Channel` — you host hosts who host hosts
A partial-information level.

**How it works:** Partner/white-label revenue, no direct customer relationship, and blame that
travels up three layers. **Twist: you cannot see your end users at all** — the visitor stream is
anonymized and you must diagnose by aggregate signals only. The purest "diagnose through a keyhole"
structure available.
**Interacts with:** §1.2 `The Abuse Desk`, §1.4 `Tenant-of-a-tenant recursion`, §1.5 `Reseller
Revolt`.

### `Tenant-of-a-tenant recursion`
In a colo level, one of your tenants is a hosting company whose own customer is a reseller whose
customer is a spammer.

**How it works:** The abuse report arrives at *you* and must be passed down a chain you cannot see
the end of. A brilliant, very real piece of internet plumbing.
**The verb it needed — the Passthrough:** for each abuse report you choose to **(a) forward it down
the chain and wait** (cheap, slow, may time out into your own liability), **(b) act directly on the
tenant above** (fast, breaks the contract, angers a paying customer), or **(c) absorb it yourself**
(costs hands and reputation with the complainant). **A three-option card, repeated, with a visible
countdown per report. That's a level.**

### `Two Brands, One Datacenter` (the fighter-brand level)
You run a premium brand and a budget brand on shared infrastructure. Real industry strategy, made
playable.

**How it works:** Each brand has its own storefront, price book, support SLA, support queue, and
reputation stat. **The budget brand exists to absorb price-war pressure without touching the premium
brand's rate card.** Rules: they must not share a support queue (or premium customers get budget
response times), must not share a status page (or the budget brand's outages appear on the premium
brand's record), and **must not be publicly linked** — a journalist or a WHOIS/AS lookup can connect
them, and if premium customers find out they're on the same hardware as the $2 plan, you eat a trust
event.
**Win condition:** survive a 40% price cut from a competitor **without moving the premium price.**
**Interacts with:** §2.10 The Price War (**this is the correct answer to it**), §3.8 positioning,
§8's visual language (two storefronts).

### `The Same Outage, Six Ways`
One event presented as six short levels, one per hosting type.

**How it works:** Shows how differently the same root cause manifests. A superb teaching module and a
very cheap content multiplier.
**Version 1 — a fiber cut** (the obviously physical case).
**Version 2 — an expired certificate** (much stronger, because the point is that the *same* thing
manifests differently and a cert has no physical shape): Web host — 95% bounce. Email host — TLS
delivery fails to *some* providers only, silently, and you find out from a customer. Game host — the
launcher won't authenticate so nobody can join, but existing sessions are fine. API/DBaaS — every
integration breaks at once and retries hammer you. CDN — your edge can't reach your own origin.
**Colo — nothing happens, because you don't own any certificates.** And that is the joke and the
lesson.

---

## 1.5 Scenario library (one-off missions)

*Each scenario is a **win condition that isn't "survive N waves."** Mixing these into the campaign is
what stops TD fatigue at hour six. Stated as: premise → special rule → win condition → failure
texture. Every scenario carries an **archetype tag** (§1.9) and a **length bucket** — Interlude
(3–6 min, one mechanic, one decision, no build phase) · Scenario (12–20 min, one premise, a build
phase and a resolution) · Siege (30–45 min, multi-phase, multi-system). Ship roughly one interlude
every two levels, one scenario every three, and one siege per act. Every scenario also gets an
**Objective Totem** and a **Scenario Icon** — see §1.10.*

### `Launch Day` / `Hug of Death` / `The Slashdotting`
A client's product goes live, or a page hits the front page of an aggregator. Traffic ramps 40–200×.
**Archetype: Convert. Length: Scenario.**

**How it works:** Special rule: you cannot scale *during* the spike for the first 90 seconds (cold
start timers); **caching is the only answer, because you cannot buy enough servers in time.**
**Win = convert ≥X% of the spike**, not merely survive it. The trap: you can trivially survive by
rate-limiting everything to death — but then you converted nothing and you *lose*. Grade is a curve
between "stayed up" and "cashed in." Forces the player to build for *throughput*, not safety. In the
Slashdot variant only one URL matters, which teaches caching a hot object vs scaling the whole stack.
Legitimate visitors, not an attack, and your defenses will happily block them if you're careless.
**Failure texture:** the spike converts into a *permanent* reputation loss because everyone who
bounced tweets about it.
**Visual — "The Wave Wall":** a visible wall of visitor light approaches from the map edge, with a
**height that tells you the magnitude**, visible for ~20 seconds. The win image is the wall *passing
through* your infrastructure and coming out the other side still cyan (served) rather than greying
out (bounced). Traffic ribbons swell until they're wider than the links carrying them, and **overflow
spills over the edge of the cable, pools on the floor beneath it, and evaporates as grey** — so the
amount you're losing has a visible volume. In the Slashdot variant traffic doesn't ramp, it
*teleports*: **the transition happens between two frames with no telegraph** — the one place in the
game where the telegraph law is deliberately broken, which is exactly why it's memorable. One frame
of calm, then the inbound gate blows open and the screen edge is a solid wall of cyan.
**Hosting types:** web/CDN/video natively; the game-host analog is a launch night; the GPU analog is
a model going viral; the email analog is a customer's newsletter send.
**CEO variant — "Launch Spike":** your biggest customer goes viral and **their success can bankrupt
you if they're on a flat-rate plan.** Sub-goal: renegotiate mid-spike without losing them.

### `Black Friday` / `Peak Season`
Sustained high load you *know* about in advance. **Archetype: Endure/Convert. Length: Scenario.**

**How it works:** Special rule: **the wave schedule is published in advance.** You can pre-build for
two in-game weeks with a budget, so it's a planning test, not a reflex test. **This makes it a pure
optimization/preparation level, and the failure mode is over-provisioning yourself into a loss.**
Provision too early and upkeep eats you; too late and you drop the peak. A hard money mechanic: every
dropped checkout is measured in dollars, not abstract score. Teaches capacity-planning regret — you
pay for the capacity in the following month whether or not you used it. Introduces **pre-warming**
and **burst capacity** as real decisions. **The most "spreadsheet" level, and a good one at the
halfway mark.**
**CEO variant:** your promo goes live; signups arrive at 20× for 72 hours; provisioning queue, fraud
rate, and support queue all spike. Goal: max net-new MRR *that survives 90 days*, not max signups.
The trap is a 90%-off coupon that fills you with customers whose LTV is negative. Annual seasonality
framing: **40% of the year's shared-hosting signups arrive in 96 hours** — overspend on ads and
you're broke, underspend and you miss the year.
**Visual:** the level's identity is a countdown clock **rendered in the world** (a big scoreboard hung
over the NOC) plus a pre-announced traffic curve drawn as a **ghost graph you're racing against in
real time.**

### `Zero Downtime Migration` / `Silent Migration` / `Lift and Shift`
Move a live database, a customer base, or a whole platform to new hardware. **Archetype: Reach-State.
Length: Siege.**

**How it works:** **Your build starts finished. The goal is to move it, piece by piece, while it
serves traffic — and you cannot pause.** Special rule: a replication-lag meter. Cut over too early
and you lose writes (permanent data-loss penalty); too late and you blow the maintenance window and
pay SLA credits. DNS TTL is a literal countdown on how long stale traffic keeps arriving at the old
box, and lowering it must happen **days in advance**. Mechanics: dual writes, dual-running cost,
cutover moments, rollback, and the discovery that **12 sites have hardcoded IPs.** Every move is a
Change Window gamble.
**Visual — "The Ghost Twin":** the destination renders as a translucent white ghost in a second area;
as you cut over, colour drains from the old and fills the new, service by service. A mistimed
cutover shows a service **half-coloured in both places** — instantly legible as split-brain.
**Objective Totem:** a **TTL hourglass** on a pedestal by the entrance, turned over and put away when
the level completes.
**CEO variant:** "Migrate 4,000 Sites, Zero Downtime" — acquisition integration with TTLs, panel-to-
panel transfers, a legacy PHP 5.6 fleet, and 4,000 customers who will each open a ticket if anything
moves. **Every migration you rush loses customers; every one you delay costs double-running
infrastructure.**

### `Post-Breach` / `The Breach` / `The Suspicious Login`
You start *already owned*. **Archetype: Diagnose. Length: Siege.**

**How it works:** Attackers have persistence somewhere on your board, invisible — **you are defending
against an attacker that is already past your towers and hiding, so your usual perimeter is
useless.** Symptoms only: odd egress, a slow CPU climb, a login at 4am. You don't know which machines
are dirty. Forensics costs time; rebuilding costs downtime; ignoring it costs everything. The level
is not over when you delete the webshell; it's over when you've established **when they got in, what
else they touched, whether the backups are also poisoned, and whether to rebuild from scratch.**
Special rule: **rebuilding a box is the only guaranteed cleanse**, and each rebuild costs uptime.
After a real compromise you don't clean, you rebuild — **and the per-machine Rebuildability index
(§1.11) is what makes that decision a calculation instead of a vibe.** Also: the choice to disclose
(a reputation hit now, a bigger hit later if you don't) and customers demanding answers.
**Failure texture:** quiet. You just find out at the end that it exfiltrated everything.
**CEO variant — `Breach Recovery`:** the mission is *communication and containment* — disclosure
timing, notify, rotate, credit, insurance claims, defend in public, stop a churn cascade, keep churn
under 15%. **The technical fix is 20% of the mission.**
**Visual — "Forensic Mode":** the whole board renders desaturated and lit by flashlight; compromised
objects glow with a **red/magenta taint trail** showing the attacker's path backward in time, which
you scrub with a timeline to find patient zero. Compromised assets get a taped-off crime-scene hatch
and evidence tags. **Cleaning a host restores its colour, so the level literally colours itself back
in as you progress.**
**The scrub bar shows confidence as well as time:** the portion of the timeline you have logs for is
**solid**, the portion you don't is **hatched**, and the moment of entry is a marker **you place
yourself — and can place wrong.** The hatched region is the cost of not buying log retention,
rendered in the exact place where it hurts.

### `The Sev-0`
An incident where the correct first action is to **call a lawyer.** **Archetype: Diagnose. Length:
Scenario.**

**How it works:** You have found evidence of a breach involving regulated data. Technical instincts —
reboot, rebuild, clean up — **destroy evidence and increase liability.** The level forces the
counterintuitive sequence: **preserve, isolate, document, notify, and only then remediate.** The
scoring rewards restraint, which nothing else in the game does.

### `The Certificate Expired` / `Cert Apocalypse`
Comedy-tragedy. At T+0 your wildcard cert expires and every visitor sees a scary browser warning.
**Archetype: Reach-State. Length: Interlude.**

**How it works:** 95%+ bounce. You must reissue and deploy under a ticking clock while DNS validation
fights you. Teaches that a non-attack can be worse than an attack.
**Harder variant:** a root CA expires or is distrusted overnight. Modern browsers are fine; old
Android, Java clients, curl on an ancient distro, and your *payment gateway callback* are not.
**Your monitoring, which uses a modern client, says everything is green.** Then: reissue at scale and
discover which of your services **pin** certificates.

### `Mass Revocation`
Distinct from `The Certificate Expired`: your CA has a compliance incident and must revoke every
certificate it issued in a date range. **You have 5 days.** **Archetype: Reach-State. Length: Siege.**

**How it works:** The first two days are spent discovering **how many certificates you actually
have** — not just the obvious web ones, but internal mTLS, client certs on a device fleet, one in a
Java keystore, one inside a load-balancer config from 2019, and three on machines that are not in
your inventory. **Players with certificate inventory tooling breeze through; players without it spend
the level doing archaeology.**
**Failure texture:** you miss one. It is on the payment callback path. You find out on day 6.

### `Power Event` / `Black Start` / `Generator Test`
Utility drops. **Archetype: Diagnose/Reach-State. Length: Scenario.**

**How it works:** UPS gives you 8 minutes. The generator needs 40 seconds to take load and might not
start (a dice roll you improve by having done maintenance and load-bank tests). Decide what to shed.
Win: keep tier-1 customers up; it is *expected* that you sacrifice something. The scheduled-test
variant: the facility does a planned failover test and if your UPS runtime math is wrong, you find
out live.
**The missing trap — inrush.** When power returns, **every device tries to start simultaneously and
the combined inrush current is several times the steady-state load**, which trips the breaker again,
sometimes repeatedly. The correct procedure is a **staged restart** — rack by rack, with a wait
between stages — which is slow and agonizing while customers are down. **Make this the level's
central puzzle: the player wants to turn everything on and must not.** Pairs with the cold-start
dependency cycle for a genuinely excellent recovery level.
**Visual — "Black Start":** the screen goes near-black; the only light sources are UPS status LEDs,
emergency egress strips, and your cursor, **which becomes a flashlight cone.** You restore services
in dependency order and the room lights back up rack by rack. **Teaches dependency graphs by
literally illuminating them.** Two refinements: the cone reveals the **Truth side** of objects — at
black start you are looking at cabling and power, not faceplates — and the **Recovery Ladder is drawn
faintly in the Intent layer**, so the puzzle has a visible answer key you must still execute in order.

### `EPO`
Someone presses the Emergency Power Off button. The entire room, **including the UPS bypass**, goes
instantly and completely dark. **Archetype: Diagnose. Length: Scenario.**

**How it works:** No ride-through, no generator, no graceful shutdown — EPO is designed to remove all
energy from the room for firefighter safety, and it does. The level is a **cold start from absolute
zero** with the added cruelty that everything went down *hard* mid-write: filesystems need checking,
databases need crash recovery, a RAID array comes back degraded, and two machines don't POST. The
comedy is the cause, revealed at the end: a contractor mistook it for a door release, or a cleaner
leaned on it, or it was unlabelled and unguarded.
**Retroactive purchase:** an **$8 plastic EPO guard cover**, which the game offers you afterwards, at
full price, deadpan.
**Interacts with:** `Power Event`/`Black Start` as its crueller sibling — Black Start assumes an
orderly shutdown; EPO assumes none.

### `Retransfer`
The generator started. The utility came back. **The transfer switch will not transfer back.**
**Archetype: Negotiate/Schedule. Length: Scenario.**

**How it works:** You are now running the entire facility on a diesel generator indefinitely, which
is fine for hours and a crisis over days: fuel burn, service intervals, noise ordinances, a
neighbourhood complaint, and the knowledge that the generator has never run this long. Meanwhile the
ATS needs a controlled outage to repair — which means you must **deliberately drop the facility to
fix the thing that is currently keeping it up.**
**The decision:** schedule a planned outage now while you have fuel and daylight, or keep running and
hope the parts arrive. **A genuinely excellent "the fix requires the failure" dilemma.**

### `Wet Stacking`
The maintenance level where **a maintenance practice is itself the damage.** **Archetype: Diagnose.
Length: Interlude.**

**How it works:** Your monthly generator test runs 20 minutes at 5% load, which is worse than not
testing: a diesel run at low load doesn't reach operating temperature, unburned fuel accumulates in
the exhaust, and the engine slowly fouls. The level surfaces a hidden **Engine Health** stat that
your own testing regime has been *degrading* for two years. Fixes: a load bank, or scheduling tests
to coincide with real load.

### `Fuel Truck`
Extended grid outage, generator running. **Archetype: Triage. Length: Interlude.**

**How it works:** You have 8 hours of diesel, the fuel vendor has a 4-hour SLA they will miss, and
you must shed load — deciding which customers go dark first. Every choice has a reputation and SLA
consequence. Whether you **prepaid a fuel-delivery priority agreement** two levels ago is the hidden
variable.
**Objective Totem:** a fuel gauge on the office door.

### `The Fire Department Cut The Power`
A fire in an unrelated part of the building. **Archetype: Triage. Length: Interlude.**

**How it works:** There is no fire in your suite. The fire department has de-energised the building
and will not let anyone in, **including to start your generator manually.** Your UPS is running. The
clock is your battery. **You cannot act at all**, and the only decisions available are which workloads
to shut down gracefully by remote before the lights go out. **The purest expression of powerlessness
and a genuinely great five-minute scenario.**

### `Cooling Failure` / `Heatwave` / `Cold Aisle Chaos` / `Heat Dome`
The CRAC dies on the hottest day, or ambient temperature rises all level. **Archetype: Triage.
Length: Scenario.**

**How it works:** Temperature rises per rack; hardware throttles then fails. Heat spreads as a slow
"damage over time" field, so adjacency suddenly matters. Cooling costs scale nonlinearly.
**Correct the timescale:** "you have minutes, not hours" is right for a dense modern room and wrong
for a lightly loaded one — **the time you have is a computable function of heat load and air volume**,
which is exactly the sort of number the game should show the player in advance and then let them
watch drain (the thermal ride-through meter).
**Emergency options, with the two real ones added:** **raise the setpoint**; **shut down non-critical
load to buy time** (choose which customers to sacrifice); throttle everything (lose capacity);
migrate workloads; or literally prop the doors open and bring in portable units — **which is
explicitly worse than it sounds, because you are now pulling unfiltered, humid, uncontrolled air into
the room**, on top of the access-control penalty.
**Visual:** thermal overlay forced on for the whole level; the floor is a live heat map and your task
is airflow choreography — essentially a beautiful false-colour IR image you can rearrange.
**Overlay conflict rule (general):** when an overlay is forced on, its exclusive palette will fight
every alert colour for the whole level, so **the alert triad drops to two hues and the third
aggregates.**

### `The Fiber Cut` / `Cable Cut` / `Fiber Seeking Backhoe`
A backhoe severs your primary transit mid-level. **Archetype: Triage. Length: Scenario.**

**How it works:** Half your inbound capacity vanishes instantly; you're on a backup at 30% capacity.
You must triage which traffic gets the pipe: paying customers, or the bots you can't yet distinguish
from them. Tests whether you built redundancy or theatre.
**The detail that makes diverse-path redundancy meaningful: you cannot verify diversity yourself.**
Two carriers can sell you "diverse" circuits that share a conduit, a bridge crossing, or a manhole,
because carrier A leases from carrier B without telling either of you. Offer a purchasable **path
audit** — expensive, slow, and sometimes returns *"we cannot confirm"* — and occasionally reveal, at
the worst moment, that the audit you didn't buy would have found a shared segment. **"You bought two
circuits and own one path" is the single most common redundancy lie in the industry.**

### `Underwater`
A submarine cable cut takes a region's connectivity **for six weeks.** **Archetype: Reach-State.
Length: Siege.**

**How it works:** Not a blip — a *duration*. You must re-architect around a permanently worse network
for a month and a half of game time: reroute, move workloads, renegotiate, and decide whether to
refund the region or keep serving it badly. **Teaches that some failures are conditions, not
events.**

### `Ransomware Sunday` / `Ransomware Friday`
Encryption spreads node-to-node like fire. **Archetype: Diagnose/Escort. Length: Siege.**

**How it works:** The question isn't "can you stop it" — it's **"do your backups actually restore?"**
Restore speed becomes the whole game. Players who bought backups but never tested a restore discover
their backups are decorative. Teaches the backups-vs-restores distinction and that **a mounted backup
is not a backup.**

### `Rebuild Window`
A RAID6 array is degraded. The rebuild takes 19 hours, during which performance is halved and a
second drive failure is fatal. **Archetype: Schedule. Length: Interlude.**

**How it works:** The wave-1 framing ("rebuild now during peak, or wait until 3am") is the wrong
knob. The **actual** knob is the **rebuild priority dial**: fast rebuild = slower production; slow
rebuild = a longer exposure window. And there is a second option almost nobody models: **restore from
backup to new hardware in parallel while the rebuild runs** — so you're racing two recoveries and
paying for both. A *real* decision real people make.

### `The Angry Whale` / `The Concentration Crisis` / `The Sole Whale`
Your single biggest customer (30–80% of revenue) is furious and threatening to leave. **Archetype:
Escort/Negotiate. Length: Scenario.**

**How it works:** Every minute they're unhappy, churn risk ticks. You must fix *their* problem
specifically, even if a hundred small customers suffer. They make demands: saying no costs money,
saying yes costs capacity, and keeping them distorts your whole build. **Firing them is a legitimate,
scored strategy.** A moral/economic tension level with no right answer.

### `Compliance Week` / `The Audit` / `Audit Pass`
A PCI/SOC2/HIPAA-style audit. **Archetype: Reach-State. Length: Siege.**

**How it works:** You must add segmentation, logging, and access control *without* degrading
performance. Every control you add has a latency or cost tax. Certain existing builds are now
*illegal* (an unencrypted link, no logging, a shared admin credential) and must be retrofitted under
a deadline without downtime. You collect **evidence tokens** for controls, and you are **failed
retroactively for shortcuts you took in earlier waves.** Passing unlocks an entire customer segment;
failing loses the deal *and* your current regulated customers.
**Objective Totem:** a **blank certificate in a frame on the office wall** that fills in as controls
are satisfied, and is stamped when you pass.

### `The Copycat` / `The Price War`
A competitor undercuts your pricing by 40% — or a VC-funded competitor prices below your COGS for six
months. **Archetype: Negotiate. Length: Scenario.**

**How it works:** Pure economy level: respond with price (destroy margin), features (slow, needs
marketing spend), reputation, differentiation, or segment up (abandon the low end and lose volume).
Churn spikes among price-sensitive customers only. **There is no good answer, which is the point** —
and the structural answer, if you built it, is `Two Brands, One Datacenter` (§1.4).

### `Hug of Death (Charity Stream)` / `Viral Moment`
You *want* the flood. **Archetype: Convert. Length: Interlude.**

**How it works:** A charity event drives massive good traffic. Every visitor served = money, every
bounce = money lost. **Inverts the usual instinct to throttle.** Variant: one customer blows up and
you must choose between cashing in on them and protecting everyone else.

### `Viral Customer`
One of your tiny customers becomes famous overnight; **they cannot pay for what they now need.**
**Archetype: Negotiate. Length: Interlude.**

**How it works:** Do you carry them for the prestige, renegotiate mid-spike, throttle your
best-performing customer, or let them consume the whole cluster? A pure relationship-vs-margin call
with a public-relations tail.

### `Bad Deploy Friday` / `The Ship-It Friday`
At 4:55pm a deploy goes out with a bug. **Archetype: Diagnose. Length: Interlude.**

**How it works:** Rollback exists but takes 6 minutes and the DB migration is not reversible. Teaches
irreversible actions.
**The mechanic that makes it a puzzle rather than a coin flip:** **the deploy and a coincidental
attack are both live**, and the player must determine which is causing the error rate before
choosing. **Rolling back a good deploy during a real attack wastes six minutes and the attack
window.** That turns the stated tension into actual play.

### `The Quiet Month` / `Reverse Wave` / `The Good Problem`
No threats at all. Only cash flow, upkeep, funnel efficiency, and the temptation to over-build.
**Archetype: Shrink/Convert. Length: Scenario.**

**How it works:** Scored on efficiency. The "boredom is a mechanic" level: you must resist the urge
to spend. In the `Reverse Wave` variant your only enemy is bounce rate and cost — a pure
funnel-optimization stage that proves the visitor system can carry a level alone. In `The Good
Problem` variant you're profitable and idle and the objective is *growth*: all the pressure is
sales-side.
**⚠️ Both risk being *nothing happening* rather than *pressure without combat*. Give them a live
antagonist that isn't a threat: the budget.** Specifically a visible **Efficiency Frontier** plus a
board mandate ("cut upkeep 15% without dropping conversion"), plus opportunity events arriving on a
timer so there is always a decision on screen. **Rule of thumb: a no-combat level needs a decision
every 25–40 seconds or it reads as filler.**
**Constraint Band:** hang a **"NO SCHEDULED THREATS" card** on the threat gantry, which is somehow
more unsettling than threats.

### `Peering War` / `Peering Ratio` / `Peer Review` / `Ratio`
A big network de-peers you, or threatens to. **Archetype: Negotiate. Length: Scenario.**

**How it works (the rule nobody outside networking knows):** settlement-free peering carries an
unstated **traffic-ratio requirement** — they want roughly balanced in/out, and you are a hosting
company, so you're wildly outbound-heavy (20:1, say). You're denied, or given 90 days to fix it.
**Options:** pay for paid peering (cheaper than transit, more than free, and galling); buy transit
through someone who *is* peered; move traffic to an IX; route around them and eat the latency; or —
the interesting one — **acquire or launch an inbound-heavy business line to rebalance your ratio.**
A backup line ingests enormous inbound. **A business-line synergy that exists purely for a networking
policy reason** is exactly the kind of truth this game should ship, and it makes this **an economic
threat with no technical fix and a portfolio answer.**
**Failure texture:** revenue stays flat, costs spike as your traffic reroutes through expensive
transit, and latency to a third of your users triples overnight.

### `Upstream Divorce` / `Hostile Upstream` / `Null Route`
Your transit provider gets acquired, depeers, or drops your prefix over an abuse complaint.
**Archetype: Triage. Length: Scenario.**

**How it works:** You must re-home your BGP under fire, routing around random upstream blackholes.
**You have a redundant transit provider — if you bought one two levels ago.**

### `The Insider`
An employee is exfiltrating data. You cannot see who. **Archetype: Diagnose. Length: Scenario.**

**How it works:** Detection requires logging you may not have built; accusation requires evidence;
firing them requires revoking access **atomically**. You can add monitoring (which slows everything)
or start revoking access (which breaks things). Social-deduction flavour.

### `The Fake Employee`
The remote contractor you hired three months ago is not who they said they were. **Archetype:
Diagnose. Length: Scenario.**

**How it works:** Extremely current and horribly real. A "staff member" on your board has been
quietly exfiltrating and has legitimate access to everything they touched. An access-review and
forensics exercise under a disclosure clock, **complicated by the fact that they were genuinely
productive and their work is load-bearing.** Countered retroactively by identity verification, device
management and least privilege — **none of which players will have bought.**

### `Datacenter Build` / `First Watt`
A construction level. No live traffic. **Archetype: Build-to-Spec. Length: Siege.**

**How it works:** Zero customers on day one. You lay out power, cooling, cable trays, and rack rows
against a blueprint and a budget, knowing you'll have to *operate* this layout in the next mission —
**the best "your past self is your enemy" hook in the game.** Introduces construction as a multi-shift
process, utility power negotiation, and **redundancy tiers (N, N+1, 2N)** as purchases with precise
meanings, plus the slow terror of spending everything before earning anything.
**Twist: the level's threats are almost all non-attack** — inspections, supply chain, a concrete pour
that fails, a permitting delay. **A builder level in a defense game.**

### `Bare Metal Bring-Up`
A pure build/logistics level, zero threats: rack, cable, power, image, and bring 20 machines into
service against a clock. **Archetype: Build-to-Spec. Length: Interlude.**

**How it works:** A breather level that is secretly a cabling-skill exam.

### `The Regulator` / `The Regulator Calls` / `Regulatory Shift`
A government demands data localization in 30 days; or a legal takedown lands; or a government asks
for data. **Archetype: Reach-State/Negotiate. Length: Scenario.**

**How it works:** Move workloads, re-sign contracts, or lose the region. The takedown variant: locate
and remove one specific tenant's content out of thousands, under a clock, without collateral outage.
The data-request variant branches on legal, reputational, and technical consequences.

### `The Lawful Intercept Request`
An edgier compliance scenario: a legally binding request for **ongoing** access to a customer's
traffic, with a gag order. **Archetype: Negotiate. Length: Scenario.**

**How it works:** You must build the capability — a buildable with an ongoing cost and **its own
attack surface, because an intercept system is a backdoor by design and has been abused** — operate
it secretly, and live with knowing. Costs staff morale if discovered internally; can leak. Purely a
choice level with no "correct" outcome, and an option to refuse at legal cost.
**Tone:** handle carefully, but it is a real part of running infrastructure and the bulletproof line
already establishes that the game is willing to have a grey path.

### `Sanctions Screening` / `The Sanctioned Tenant` / `Sanction Line`
A jurisdiction is added to a sanctions regime overnight, or one customer appears on a list.
**Archetype: Diagnose/Reach-State. Length: Scenario.**

**How it works:** You must identify which of your 4,000 customers are affected — by billing address,
by IP geolocation, by corporate ownership chain, by the payment method they used — and cut them off
within a deadline **while not cutting off anyone you shouldn't.** **The data you need is data you may
never have collected.** In the single-tenant variant: terminate immediately, **freeze their data (not
delete it)**, report, and **not tell them why** — and their services are load-bearing for *other*
customers because they are a reseller. Every action is legally constrained and commercially painful.
One of them is your best payer.

### `Leap Second / Y2038 / DST` / `The Date Bug`
A timing bug hits everything simultaneously at a known future moment. **Archetype: Reach-State.
Length: Interlude.**

**How it works:** You know exactly when it's coming. Pure preparation level. Breaks cron, TLS
validity checks, and one runtime that spins to 100% CPU. Deliciously specific.

### `Free Tier Flood` / `Free Tier Abuse` / `Free Tier Invaded`
Marketing launched a free tier without telling you. **Archetype: Diagnose/Tune. Length: Scenario.**

**How it works:** Thousands of low-value users arrive; within 48 hours it is 90% crypto miners and
spam relays. Tune the abuse controls without killing genuine signups, and separate wheat from chaff
without alienating future paying customers. Tightening verification kills growth; not tightening eats
your COGS.

### `Sold Out` / `Lead Time`
You have no capacity and a signed contract. Servers are 40 weeks out. **Archetype: Negotiate. Length:
Interlude.**

**How it works:** Either buy emergency hardware at 3× markup, cram tenants and risk thermal issues,
sell capacity you don't have, or break the contract and lose the deal.
**Objective Totem:** a signed contract under glass.

### `The Honeymoon`
A brand-new datacenter with zero customers. **Archetype: Convert. Length: Scenario.**

**How it works:** You must *attract* everything from scratch; the level is 80% §3 mechanics with
almost no threats.
**Objective Totem:** an **empty visitor's chair**, sat in when the level completes.

### `Two Masters` / `Split Brain`
Two datacenters lose their link but both stay up. Both think they're primary. **Archetype: Diagnose.
Length: Scenario.**

**How it works:** Both sides accept writes. You must reconcile, and the reconciliation choices
*permanently alter data* — some customers lose orders and will be angry about it for the rest of the
campaign. A conceptual boss fight. **The cheap prevention was a witness node you didn't buy (§1.1).**

### `Zero-Day Sunday` / `Zero-Day Tuesday` / `Zero Day Wednesday` / `Patch Tuesday`
A critical RCE drops in a component 80–100% of your fleet runs. No existing tower stops it.
**Archetype: Triage. Length: Siege.**

**How it works:** You have hours before mass exploitation. **The missing first phase (added):
determining whether you are affected at all.** Without a software inventory/SBOM, finding every
instance of a library — including the one bundled inside a vendor appliance, the one in a container
image you didn't build, and the one on a customer's machine you don't manage — takes days, during
which mass exploitation begins. **The player with inventory tooling starts patching in hour 1; the
player without it starts in hour 30.** That single change makes a boring-but-vital purchase the hero
of a level.
**Then triage, with explicit numbers so it is a decision and not a mood** (each option shown as a
cost/coverage pair):
- **Take the service offline** — 100% coverage, 100% revenue loss, 0 risk.
- **Virtual-patch at the WAF** — ~70% coverage, +40ms latency, ~3% friction, 15 minutes to deploy.
- **Crude signature block** — ~90% coverage, ~11% friction, immediate.
- **Real patch** — 100% coverage, 45 minutes, **~8% chance of breaking a customer per fleet
  segment.**
**Every answer is bad**, and patch waves run simultaneously with traffic waves.

### `The Change Freeze` / `Frozen Change` / `Read-Only Friday`
You may not deploy anything for N in-game days. Something breaks on day 3. **Archetype:
Hold-Without-Hands. Length: Scenario.**

**How it works:** You must fix it with **runtime knobs only** — config reloads, feature flags, cache
TTLs, traffic steering, capacity you already own, and communication. Rewards everything you
pre-configured (the graceful-degradation ladder) and punishes players who fly by hand.
**Variant:** you *may* break the freeze, **once**, and the game records that you did.
**Constraint Band:** **hazard tape runs diagonally across the build palette and the deploy button.**
You can see the tape, and clicking under it plays a refusal.

### `Cost Cut` / `Cost Cutting` / `The Bad Quarter`
Board mandate: reduce upkeep 20–40%, keep the SLA. **Archetype: Shrink. Length: Scenario.**

**How it works:** Pure optimization/tear-down puzzle. Every removal increases risk. You choose which
redundancy to sacrifice and then live with it for 30 days. Forces the player to learn what they
over-built. Deliciously uncomfortable.
**The card version:** every cut is a card — layoffs, downgraded support tier, deferred hardware
refresh, skipped maintenance, paused ad spend — **each with a delayed cost that lands one or two
levels later.**

### `The Long Weekend` / "No Hands" / `Skeleton Crew` / `Founder's Vacation`
A 4-day holiday with a skeleton crew, or all staff away. **Archetype: Hold-Without-Hands. Length:
Scenario.**

**How it works:** You cannot perform manual actions (or you have a hard cap on manual interventions
for the whole level); only automation and standing rules run. Everything you automated over the
campaign pays off here. If you hand-flew everything up to now, you get destroyed. Nothing dramatic
happens until hour 60. **A beautiful skill check**, and the model for the recurring **Ratchet Audit**
(§1.11).
**Constraint Band:** the hands dock is greyed out with an **out-of-office sticky note** drawn over it.

### `The Understaffed Sunday`
Not a crisis level — an ordinary level with a quarter of your hands. **Archetype: Triage. Length:
Scenario.**

**How it works:** Nothing dramatic happens. There is simply too much routine work and not enough
people, for forty minutes. **The failure mode is *accumulation*:** tickets, patches, drills and small
maintenance all slip a little, and **the score is the size of the backlog you hand to Monday.** The
most honest level in the game and the one that will make operators nod.

### `The Intern`
An AI-controlled unit wanders your network doing well-meaning damage. You can't fire them.
**Archetype: Reach-State. Length: Scenario.**

**How it works:** You must build **guardrails** — permissions, staging, change windows — instead of
defenses. Teaches process as a mechanic.

### `The Influencer` / `The Demo` / `The Tour` / `White Glove`
One unit matters more than the other 10,000. **Archetype: Escort. Length: Interlude/Scenario.**

**How it works:** A single visitor with huge value walks the lane; a good experience gives a permanent
traffic multiplier, a bounce gives a permanent reputation scar. In the **Demo** variant a prospective
whale watches your dashboard live for 3 minutes: your *metrics* must look good, not just be good.
In the **Tour** variant a prospective tenant physically walks your floor during peak and **cosmetic
damage — a cable mess, a warm aisle, a visible alarm — costs you the contract. Tidiness matters.**
**Visual (Demo):** split screen — your real board on the left, and on the right a "presentation view"
the investor sees: a clean dashboard with beautified graphs. **The presentation view uses a different
chart style** — smoothed, rounded, generously scaled, **with the y-axis not starting at zero** —
while the real view is angular and honest. **The visual difference between the two charts *is* the
ethical content.**
**⚠️ Balance fix:** "cheat the dashboard, with consequences" is a free win if the consequences are
unstated. Make it a gamble with a readable tell: cheating gives **+35% close probability** and a
**20% chance the prospect's own engineer notices** — they're looking at your status page on their
phone, **visible in the scene** — which loses the deal *and* costs reputation.
**Visual (Tour):** the camera switches from god-view to a **handheld eye-height walkthrough for 90
seconds**, following the prospect. Everything ugly you left lying around is suddenly on camera.

### `Chip Shortage` / `Supply Drought`
Build costs for a specific component triple mid-campaign, or you cannot buy new hardware at all for
the entire level. **Archetype: Shrink/Build-to-Spec. Length: Scenario.**

**How it works:** You must redesign around scarcity — only repair, repurpose, and optimize. Pairs
with GPU back-orders and `The Transformer`.

### `Blacklisted` / `Spamhaus SBL`
Your /24 is listed because one reseller's client got popped. **Archetype: Reach-State. Length:
Scenario.**

**How it works:** Mail delivery for 600 customers is broken. Find the source, clean it, document it,
and file a delisting request that has a cooldown. Support tickets flood in while you work.
**The part that hurts most and is always forgotten: you cannot fix this quickly even after you fix
it.** Delisting has a cooldown, some lists require a waiting period after cleanup, **repeated
listings escalate the penalty** (a second listing within 30 days is much harder to clear), and the
damage continues after delisting because **some receivers cache reputation locally for days.**
**The recovery curve, not the incident, is the level.**

### `The Lame Delegation`
Your customer's domain resolves for some people and not others, intermittently, for two weeks.
**Archetype: Diagnose. Length: Interlude.**

**How it works:** The registrar's NS records list four nameservers; one was decommissioned last year
and the glue still points at an IP that now belongs to someone else. Resolvers pick randomly. **25%
of queries fail, which is below every alerting threshold you have.** Teaches that **partial DNS
failure is invisible to binary monitoring** and introduces per-nameserver synthetic checks.

### `The Chargeback Wave` / `Processor Freeze` / `Rolling Reserve`
A carder ring signs up with 200 stolen cards — or your risk classification changes. **Archetype:
Negotiate. Length: Scenario.**

**How it works, in three real stages (wave-1 skipped the middle one):**
1. **Chargebacks.** 200 disputes in 30 days, $15 each in fees.
2. **The monitoring program (the middle stage where the interesting play is).** Excessive-dispute
   programs run for **months** with per-dispute fines of **$25–100 on top of the normal fee**. You
   can trade your way out with fraud screening, 3DS, and a chargeback-alert service.
3. **The rolling reserve.** Your processor holds **10–20% of every card settlement for 90–180 days.**
   **Your revenue is unchanged; your cash drops immediately** and comes back on a six-month delay, so
   you are permanently lending your processor half a month of revenue starting now. Survive the
   trough: annual prepay push, ACH/wire migration for larger accounts, a second acquirer, invoice
   factoring, or cutting spend.
4. **Termination.** Above a 1% chargeback ratio you lose card processing entirely — a
   *company-ending* event.
**Failure texture:** you can be **growing, profitable, and fully booked and still miss payroll.** A
cash-flow horror scenario with no attacker in it.

### `Debanked`
A darker cousin: your *bank*, not your processor, exits the relationship. **Archetype: Reach-State.
Length: Scenario.**

**How it works:** A compliance review flags your merchant category, your international wire volume,
or one customer's industry. You get 30 days' notice to close the account. **Every ACH mandate, every
direct debit, every vendor payment instruction, and your payroll run are attached to that account
number.** A migration under a clock where the thing being migrated is *money plumbing*, and the
failure mode is that **40% of your direct-debit customers' mandates don't re-authorize.**
**Hosting types:** endemic to bulletproof, crypto-adjacent, adult, and anything paid in crypto; rare
elsewhere.
**Interacts with:** §6.10 lose conditions — **add "no banking relationship" as a distinct one.**

### `Runway: 6 Weeks` / `Insolvency Run` / `Payroll Friday`
Cash crisis. You're profitable on paper but the annual prepays were spent. **Archetype: Negotiate.
Length: Scenario.**

**How it works:** A pure cash-timing puzzle: profitable on paper, $40k short on Friday.
**The full escape menu, in roughly the order a good operator tries them — one of the best decision
tables in the whole design, and it should be a recurring panel, not a one-off level.** Each entry has
a cash amount, a time-to-cash, and a hidden cost:
1. **Stop the bleeding** — pause ad spend (instant, free, costs future growth), freeze hiring.
2. **Pull cash forward** — annual prepay offer to the top 50 accounts; upfront setup fees on pending
   installs; ask your best customer to prepay a year in exchange for a price hold.
3. **Push cash out** — negotiate vendor terms from net-30 to net-60 (free, costs goodwill); defer the
   hardware order; sublease space.
4. **Convert assets** — factor receivables (1–3% per 30 days); **sell unused IPv4 (a real six-figure
   lever for an old host)**; sale-leaseback equipment.
5. **Sell something** — divest a small line or a customer book.
6. **Expensive money** — a credit line, then equipment finance, then the merchant cash advance that
   is correctly labelled a trap.

### `Covenant`
Your lender requires EBITDA above X. **Archetype: Negotiate. Length: Interlude.**

**How it works:** Certain otherwise-correct investments will trip the covenant. **Growth vs solvency,
explicitly**, with the bank as the antagonist and no attacker on screen.

### `Collections Week`
Six figures of aged receivables and a decision tree per account. **Archetype: Negotiate. Length:
Scenario.**

**How it works:** Every delinquent account is a card with: amount, age bucket, relationship value,
whether they're still consuming resources, whether they have your data hostage or you have theirs,
and a hidden **"can actually pay / can't pay / won't pay"** flag. Actions: reminder, phone call,
payment plan, suspend, terminate, send to a collections agency (they take 25–40% and burn the
relationship permanently), sue (costs more than the debt below ~$25k), or write it off.
**The counterintuitive truth: suspending a big delinquent customer guarantees you'll never be paid.**
The correct move is often a payment plan that keeps them alive, which feels wrong and is right.

### `Deadbeat Quarter`
20% of invoices go unpaid. **Archetype: Endure. Length: Modifier/Interlude.**

**How it works:** The cash-flow-vs-revenue divergence lesson, delivered as a whole-level condition
rather than a single event.

### `Data Hostage`
A non-paying customer's data is suspended. **Archetype: Negotiate. Length: Interlude.**

**How it works:** The PR risk of deleting it versus the cost of keeping it. **One wrong move = a viral
thread.**

### `The Price Hike` / `Vendor Shock` / `The Relicense`
Your control-panel, hypervisor, or licensing vendor raises prices 300–400% with 60 days' notice — or
the open-source component your platform is built on changes its licence. **Archetype: Negotiate.
Length: Scenario.**

**How it works:** Pass it through (churn), eat it (margin), migrate 3,000 accounts to an open-source
panel (labour + risk + a tiny outage on every account), fork and maintain it yourself, or accept the
legal exposure.
**The fourth and most useful option — negotiate — and the insight behind it:** the vendor priced the
increase **just below your estimated migration cost.** Which means **the migration estimate *is* the
negotiation**, and having a documented, rehearsed migration path *you never use* is what caps the
increase. **Preparedness as pricing leverage** — a genuinely non-obvious business lesson and free
content on top of an existing entry.

### `The Free Thing Started Charging`
A dependency you never paid for now has a price. **Archetype: Diagnose. Length: Interlude.**

**How it works:** A free TLS issuer, a free DNS, a free tier of a monitoring vendor, a public mirror,
a free API. **It was invisible on your P&L and load-bearing in your architecture.** The level is an
inventory exercise: you must first *discover* everything free you depend on, which is more than you
thought.

### `The RFP`
A 200-seat enterprise wants to move. **Archetype: Negotiate. Length: Siege.**

**How it works:** Pass a security questionnaire, produce a SOC 2 report you don't have, accept net-60
terms, and sign an SLA with real penalties. Winning makes you 30% customer-concentrated — a new
permanent threat.
**The parts that actually decide enterprise deals (added):** **the incumbent** (usually present and
usually winning); **the champion** (an internal advocate whose departure kills the deal — a real and
dramatic mid-deal event); **procurement's mandated bidder count** (you may be column fodder); **the
reference calls**; **the supplier onboarding delay after you win**; and **the legal redline round**,
where your Contract Clause Library gets tested.
**Framing correction:** winning at 30% concentration is a risk, yes — but **the bigger risk is that
you priced it without knowing your own cost-to-serve**, and enterprise accounts have a support tail
the bid-time spreadsheet never includes.

### `Contract Recompete` / `The Renewal`
Your biggest tenant goes to market, or your colo lease / transit contract / hardware warranty is up.
**Archetype: Negotiate. Length: Scenario.**

**How it works:** You must improve metrics **visibly** within N waves or lose them. In the vendor
version it is a negotiation minigame where your leverage is **your ability to credibly threaten to
leave** — which is only credible if you actually built the alternative.

### `The Competitor's Obituary` / `Fire Sale` / `The Good Samaritan`
A rival host goes dark overnight with no notice, or a neighbouring provider goes down. **Archetype:
Convert. Length: Scenario.**

**How it works:** 400–900 orphaned, panicked refugees hit your signup lane in one hour with no
backups, no vetting, enormous emotional damage and a lot of anger. Free customers, terrible
onboarding load, incredible PR if you handle it well, and an unplanned spike if you don't. Reward for
players who pre-built migration tooling. **Blessing or DDoS?**
**The ugly commercial reality (added):** those customers arrive **pre-traumatized and price-anchored
to a dead company's rates** — which were unsustainably low, **which is why it died.** If you honour
their old pricing to win them, **you've imported the business model that killed your competitor.**
The correct play — charge your real rate and win on the migration experience — loses maybe half of
them and keeps the half worth having. A much better decision than "free customers."

### `The Reciprocal`
A competitor calls and asks for help. **Archetype: Negotiate. Length: Interlude.**

**How it works:** Their facility is down. They want to run their critical customers on your spare
capacity, temporarily, for a fee. Saying yes costs headroom and creates a precedent **and a
reciprocal claim you can call in later**; saying no is free and closes a door. Introduces the
**mutual-aid agreement** as a purchasable, long-horizon insurance instrument **between rival
companies** — which happens constantly in the real industry and appears nowhere in games.

### `Review Bomb` / `The Viral Competitor Smear` / `Media Attention`
One bad outage plus an astroturf campaign tanks your public rating. **Archetype: Negotiate. Length:
Scenario.**

**How it works:** Organic signups drop 60%. Rebuild reputation without buying fake reviews (which is
available as a choice and will eventually detonate). Respond with transparency (status page +
post-mortem) or silence. **Reputation damage happens regardless of actual uptime.**
**Modifier variant:** a journalist is writing about you — **every incident this level counts double
against reputation; every clean shift counts double for it.**

### `The Founder Bus Factor` / `Key Person` / `The Bus Factor` / `Two Weeks' Notice`
Your only senior engineer (or you) becomes unavailable. **Archetype: Hold-Without-Hands. Length:
Scenario.**

**How it works:** In the *absence* variant, everything you personally did must have been documented
or automated beforehand; rewards players who invested in runbooks. **Tribal knowledge is a hidden
resource you either documented or didn't.**
**In the `Two Weeks' Notice` variant — the better one — they resign at the start of the level and you
have fourteen in-game days of their time.** You choose, day by day, what they spend it on:
**documenting, training, fixing, or handing over relationships. Whatever you don't choose is lost
permanently.** A pure prioritisation scenario about the least fungible resource in the company.

### `IP Exhaustion`
You're out of IPv4. **Archetype: Negotiate. Length: Interlude.**

**How it works:** Buy on the market at ~$40/IP, lease at ~$0.55/IP/mo, deploy IPv6 + CGNAT (customers
complain), or turn away business. Pairs with `Runway: 6 Weeks` — **selling unused IPv4 is a real
six-figure lever for an old host.**

### `The Landlord Renewal` / `Landlord Squeeze`
Your colo contract is up and the DC wants +35% — or the datacenter you colocate in gets acquired and
your renewal comes back at +60%. **Archetype: Negotiate. Length: Scenario.**

**How it works:** Negotiate, sign longer for a better rate, or execute a full physical migration
across town (brutal).

### `The Data Center Move`
Physically relocate a rack. **Archetype: Build-to-Spec. Length: Scenario.**

**How it works:** Trucks, downtime windows, a server that won't POST after transport because a DIMM
walked out of its slot, and the customer who didn't read the notice.

### `Hurricane / Regional Event` / `Force Majeure`
A weather system crosses the map toward one of your sites. **Archetype: Triage. Length: Siege.**

**How it works:** At the world-map altitude, visitor arcs bend around it; your site node gets a
cyclone icon; generator fuel becomes a visible tank gauge. Cross-region failover is drawn as arcs
re-routing in real time. Generator runtime, fuel contracts, and **whether you prepaid a fuel-delivery
priority agreement** decide the outcome.
**Visual — "The Front":** a weather band sweeps across the region map with a **visible leading edge
and an ETA.** Utility power flickers ahead of it, then goes, and then **the generator smoke plume is
the only thing moving on your campus. Fuel level becomes the whole HUD.**
**Pairs with:** `Declaration Day` (§1.3) — the DRaaS version of the same weather, where you watch
declarations arrive one by one knowing what the total will be.

### `Smoke`
A wildfire fifty kilometres away. The facility is not threatened; **the air is.** **Archetype:
Triage. Length: Scenario.**

**How it works:** Particulates clog filters in hours, corrosive gases attack contacts, outside-air
economisers must be shut (cooling cost spikes), and staff cannot safely be on site. You have days.
**A disaster that never touches the building and still costs you everything** — a completely
different texture from `Hurricane`.

### `Dry Season`
The municipality restricts water use. Your evaporative cooling is now illegal. **Archetype:
Reach-State. Length: Scenario.**

**How it works:** Your PUE advantage evaporates and cooling costs jump 40%. Options: switch to dry
coolers (capex, worse efficiency), raise inlet temperature (hardware risk), shed load, or buy water
at a punitive rate. Introduces **WUE (water usage effectiveness)** as a second efficiency number and
a public-relations liability.

### `The Cheap Bid`
A constraint scenario: you're only allowed used/refurb hardware. **Archetype: Build-to-Spec. Length:
Scenario.**

**How it works:** All build costs shown in red, budget bar rendered as a physically shrinking ruler.
Hardware drawn with scuffs, mismatched faceplates, and one machine that's visibly a different beige.
Aesthetic storytelling of "we're broke."
**Two refinements:** the mismatched beiges should be drawn from the **Vendor House Styles** so the
scruffiness is systematic rather than noise, and **each unit carries another company's asset tag that
you can read at Z1. Someone else's asset tag is the cheapest possible storytelling.**
**Constraint Band:** a **"REFURB ONLY" sticker** on the catalogue, with all new-hardware entries
rendered behind frosted glass.

### `Hardware Refresh Weekend`
A maintenance-window scenario. **Archetype: Schedule. Length: Interlude.**

**How it works:** A translucent blue "change window" band sweeps across the Timeline Ribbon; inside
the band you may power down machines without SLA penalty. Outside it, the band's edge turns red and
the penalty meter arms. The tension is literally watching a coloured rectangle close.
**Make it better:** the window band's **trailing edge is a hard line that sweeps across the
timeline**, and any operation still in flight when it crosses gets visibly **clipped** — its progress
arc turns red mid-sweep. **You watch the edge approach an unfinished job for ten seconds. That is
real dread from one rectangle.**

### `The Warranty Cliff` / `Depreciation Cliff`
A fleet of 40 machines bought in the same quarter all come out of 3-year warranty on the same day.
**Archetype: Negotiate. Length: Scenario.**

**How it works:** Renew (expensive — vendors price year-4 support punitively), self-insure by
stocking spares (capital, and you must guess which parts), or run bare and gamble.
**The twist nobody expects: without an active support contract you cannot download firmware**, so a
security patch for a known RAID-controller vulnerability is behind a paywall you declined. **A whole
level about the difference between owning hardware and being allowed to maintain it.** Lesson:
stagger your refresh.

### `DDoS Season`
Persistent elevated attack baseline for a whole level. **Archetype: Endure. Length: Modifier.**

**How it works:** Rendered as a permanent magenta haze at the map edges and a **pressure gradient**
rather than discrete waves.

### `The Ransom Customer` / `Ransom DDoS` / `Extortion`
A demo attack, then an email with a countdown. **Archetype: Negotiate. Length: Scenario.**

**How it works:** Pay (works once, is cheap, is **scored as a failure**, permanently marks you as a
payer, and **makes the next level's attacker pool worse**), harden, or go public. In the customer
variant: "give me 6 months free or I post the outage screenshots." Pure risk/reward with a long tail
— **a real choice, because paying genuinely works.**

### `Sell the Company`
Endgame scenario: maximize valuation over 12 months. **Archetype: Reach-State. Length: Siege.**

**How it works:** Valuation is a multiple of *EBITDA adjusted for churn and customer concentration*,
so short-term tricks (cut support, defer hardware) inflate EBITDA and get clawed back in diligence.
**Split it into two levels (recommended):** this level is **the run-up** — clean up concentration,
extend contracts, fix the books, get a clean audit period, retire the sketchy customers — and
`Due Diligence` (§1.12) is **the close.** Together they are the best possible campaign ending,
because the first rewards every boring decision the game taught and the second reveals whether you
actually made them.

### `Legacy Mode` (period flashback)
A flashback level set in 1998, rendered entirely in the CRT/terminal art style. **Archetype: any.
Length: Interlude.**

**How it works:** Beige, curvature, four colours. Mechanics are simplified to match the visual budget.
**Justifies shipping the alternate art style as *content* rather than as an option.**

### `The Decom` / "Lights Out"
A melancholy end-of-era level: you shut a facility down. **Archetype: Shrink. Length: Scenario.**

**How it works:** Racks go dark row by row, cables get cut and coiled, the floor tiles come up, and
the last shot is an empty white room. **Visual payoff for the Growth Scar (§1.1)**, and the emotional
sibling of `The Decommission` (§1.12), which is the same act played as a dependency puzzle.

### `The Grand Opening`
A brand-new facility, a ribbon, a photographer, and 200 guests on the datacenter floor. **Archetype:
Escort. Length: Scenario.**

**How it works:** The building is not finished. You must make the tour route perfect and keep guests
away from the parts that aren't — and **the twist: the facility is *live* with early tenants, so a
real incident may occur with press in the room.** The tenant-tour mechanics as a set piece.

### `The Slow Week After`
The level immediately following a major outage. **Archetype: Negotiate. Length: Scenario.**

**How it works:** Nothing is broken. **Everything is fragile.** The mechanics are all social and
commercial: the post-mortem, the customer calls, the credits, the review responses, the two engineers
who want to quit, the enterprise prospect who saw the news. Scored on **retained MRR and team
morale.** **A level made entirely of consequences**, which Pillar P10 demands and never otherwise
gets.

### `The RFO`
Post-incident, your largest enterprise customer contractually requires a written **Reason For
Outage** within 5 business days, signed, with a timeline, root cause, and remediation commitments.
**Archetype: Reach-State. Length: Interlude.**

**How it works:** A document-assembly minigame where you drag evidence from your actual level
telemetry — graph excerpts, log lines, the change record, the timeline — into a report. **What you
can include is limited by what you instrumented and retained.** Vague reports lose trust; specific
reports **gain** trust even after a bad outage; **and any remediation you commit to in the document
becomes a binding obligation on the Obligation Rail** with a deadline the customer will check.
**It converts postmortem-as-progression into something the business *forces* you to do, and it makes
log retention pay off visibly.**

### `Someone Else's Outage`
A major cloud region dies. **You're fine.** **Archetype: Convert. Length: Interlude.**

**How it works:** Your *customers'* dependencies aren't fine, and your support queue explodes with
tickets that aren't your fault. **Opportunity: a sales spike if you handle it gracefully.**

### `The Vendor Bridge`
A pure frustration-as-gameplay level: the problem is in a vendor's product and you must get to
someone who can fix it. **Archetype: Negotiate. Length: Interlude.**

**How it works:** An escalation-ladder minigame — L1 support wants you to reboot, L2 wants logs in a
specific format, the account manager wants to schedule a call, and the actual engineer exists behind
three gates. Your **Vendor Relationship** stat determines how many gates you skip, and a **premium
support contract** buys a direct number. Meanwhile your customers are down and the ticket you opened
has an auto-responder.
**Payoff:** the fix is a one-line config change the vendor has known about for eight months.

### `Break Glass`
Your identity provider / SSO / password vault is down and **it is the thing that authenticates you to
everything else.** **Archetype: Diagnose. Length: Interlude.**

**How it works:** You cannot log in to fix the thing you need to log in to fix. The only path is the
break-glass credential — a sealed, offline, audited emergency account. Using it is one click and
triggers a mandatory review, a compliance event, and a forced rotation of everything afterward. The
level tests whether you ever created one, whether you know where it is, whether it still works
(nobody tested it), and whether it can even reach the network in the current failure mode.
**Failure texture:** you have a break-glass account and **its password is stored in the vault that is
down.**

### `Metastable`
The trigger went away and the system is still broken. **Archetype: Diagnose. Length: Scenario.**

**How it works:** A real and under-modelled distributed-systems failure: a load spike causes retries,
**retries sustain the overload after the spike ends**, and the system will not recover on its own
even at normal load. Restarting parts of it re-triggers it. The only fix is **deliberately shedding
load below the recovery threshold** — turning away customers to get the system back — and **the
player's instinct (add capacity) makes it worse. The best "your intuition is wrong" scenario
available.**

### `The Threshold Day` (the "nothing changed" level)
No attack, no hardware failure, no deploy. Something breaks because you **grew into a limit that has
always been there.** **Archetype: Diagnose. Length: Scenario.**

**How it works:** One trigger is randomly selected and telegraphed only by a slowly rising graph: a
router's TCAM fills as the global routing table crosses a round number and it drops to software
forwarding; a 32-bit counter wraps; a hash table degrades past N entries; an IP pool exhausts; a
filesystem crosses 90% and its allocator changes behaviour; a session table hits a compiled-in
maximum; a licence count is reached; a database's auto-increment column hits its type's ceiling.
**The diagnostic is not "what changed" but "what grew."**
**Why it deserves a level:** it is a huge fraction of real incidents, and the rest of the threat model
is almost entirely "something happened to you" or "you did something."
**Unlock on completion:** the **Growth Ceiling overlay** — every component displays its nearest hard
limit and the projected date you reach it.

### `The Feature Flag That Was Left On`
A change from three months ago that was never cleaned up. **Archetype: Diagnose. Length: Interlude.**

**How it works:** A dormant configuration becomes active because some *other* condition changed. **The
diagnosis is impossible from present-tense evidence; you must go to the change log and read
history.** Rewards the player who keeps records, punishes the one who ships and forgets.

### `The Bisect`
A pure diagnosis level with one specific method. **Archetype: Diagnose. Length: Interlude.**

**How it works:** Something is wrong intermittently and affects roughly half of requests. You have a
**bisect verb**: take half the backends out of rotation, observe, repeat. Each bisection costs
capacity and time and narrows the space. Variants: bisect by backend, by version, by path, by client
ASN, by DNS resolver, by time window. Short, tight, and it teaches **the single most transferable
debugging technique in the profession.**
**Unlock:** the bisect action becomes available in all later levels as a general-purpose tool.

### `The Whitelisted Office`
The problem is real, it has been happening for three weeks, and **you cannot reproduce it** because
your office IP has been on the allow-list since 2019 and bypasses the thing that's broken.
**Archetype: Diagnose. Length: Interlude.**

**How it works:** All your testing succeeds. Every customer report says otherwise. The solution is to
**test from somewhere you are not privileged** — a purchasable external probe fleet, a mobile
connection, a rented VM in another ASN. Teaches that **your own convenience is a blind spot**, and
introduces the **External Vantage** buildable.

### `Index Rebuild`
A single boring maintenance task that takes eleven hours and cannot be paused. **Archetype: Endure.
Length: Scenario.**

**How it works:** One long operation with a progress bar, during which everything else still happens
and capacity is halved. **The entire level is "can you run the business at 50% for eleven hours."**
It sounds like nothing and it is exactly what half of operations feels like.

### `The Circuit Order`
A patience level built on the most underrated real constraint in hosting: **telecom lead time.**
**Archetype: Schedule. Length: Scenario.**

**How it works:** You need a second transit circuit. Ordering it starts a **60–120 day clock** with
visible stages — quote, contract, LOA/CFA paperwork, carrier survey, construction if needed,
cross-connect scheduling, turn-up testing, BGP session establishment — **each of which can slip and
one of which (construction) can slip by months.** Meanwhile the level runs normally and your
single-homed network is exposed the entire time. You can pay for expedite (rarely works), order from
two carriers in parallel (double cost, and **you may end up with both**), or accept the exposure.
**The lesson: in hosting, the correct time to order the thing is *before you need it*, and this is
the level that installs that reflex.**

### `The Transformer`
Your utility feed needs a new transformer. **Lead time: 104 weeks.** **Archetype: Shrink. Length:
Scenario.**

**How it works:** A real and currently catastrophic constraint. You cannot grow past your current
power draw for two in-game years. Everything must come from efficiency, density management, workload
shedding, demand-response, or renting space elsewhere. **The level where you cannot buy your way
out**, and a perfect counterweight to a campaign otherwise driven by purchases.

### `Customs`
Forty servers are in a bonded warehouse and the paperwork is wrong. **Archetype: Negotiate. Length:
Interlude.**

**How it works:** The hardware exists, you have paid for it, and **it is 4km away and unreachable.**
You must serve the contracted capacity anyway — rent, borrow, oversell, or delay the customer — while
a broker slowly fixes a form. **The comedy of hardware being nearby and useless is underexploited and
very authentic.**

### `The Counterfeit`
Your last order of optics (or DIMMs, or drives) was fake. **Archetype: Diagnose. Length: Scenario.**

**How it works:** They work. Mostly. For a while. The real mechanic is **distrust**: once you know
part of your fleet is counterfeit but not which part, **every unrelated failure becomes a suspect.**
You can test (slow, hands), replace wholesale (expensive), or live with it. Teaches supply chain in
the most visceral way available.

### `Export Control` / `In Scope, Out of Country`
Mid-level a regulation lands: specific hardware cannot serve specific customers or regions.
**Archetype: Reach-State. Length: Scenario.**

**How it works:** You must identify which existing tenants are now non-compliant, relocate or
terminate them, and **re-plan a build you have already paid for.** Legal, technical and commercial at
once, and entirely real.
**The GPU version, which is where it actually bites:** your cards are export-controlled and your job
is determining **who is actually using the compute** — the entity, the beneficial owner, the country
the API calls come from, and whether they're a front. Tools: KYC on signup (kills conversion),
geo-attestation (customers hate it), contractual attestations (worthless but cheap), and an actual
compliance officer (expensive, slow, correct). **The threat isn't a hacker; it's a subpoena eighteen
months later and a penalty scaled to revenue.**
**The tension the level exists for:** your highest-paying customer is the one you're least sure about,
and turning them away is a **visible, immediate, quantified revenue loss against an invisible,
delayed, enormous risk. That's the whole job.**

### `The Nexus Letter`
A tax level, and funnier than it sounds. **Archetype: Reach-State. Length: Scenario.**

**How it works:** A letter from a tax authority: you've exceeded the economic nexus threshold and owe
sales tax/VAT on **three years of past sales you never collected.** You can register and remit going
forward and negotiate a voluntary disclosure agreement on the back taxes, ignore it (the balance
compounds with penalties), or geo-block that jurisdiction (lose the revenue). Then the real work:
your billing system doesn't support per-jurisdiction tax, so every invoice template, every plan price
("is $5 tax-inclusive?"), and every EU customer's VAT-ID validation becomes a project. **Paperwork as
a boss fight**, and it's how a lot of small hosts first meet an accountant.

### `The Audit-Within-A-Level`
A surprise SPLA/licensing audit finds you under-reporting seats. **Archetype: Reach-State. Length:
Interlude.**

**How it works:** A back-bill, a true-up, and a permanent change to how carefully you must count.

### `Compliance Sunset`
An attestation expires in 45 days. **Archetype: Reach-State. Length: Interlude.**

**How it works:** **Deals freeze until it's renewed.** Nothing breaks technically; your pipeline stops
moving, and you watch it.

### `Insourcing`
Your biggest enterprise customer announces they're building their own. **Archetype: Negotiate.
Length: Scenario.**

**How it works:** You have 18 months to replace them. A long-horizon replacement problem with a
visible countdown and no villain.

### `Reseller Revolt`
Your top reseller (25% of accounts) is being courted by a competitor. **Archetype: Negotiate. Length:
Scenario.**

**How it works:** You have no direct relationship with the end customers, so you cannot appeal to
them. Everything must be done through the partner, whose leverage is enormous and obvious.

### `The Price of Power Went Negative`
An *opportunity* scenario. **Archetype: Convert. Length: Interlude.**

**How it works:** Grid conditions make electricity free or negative for a few hours. **Every
interruptible workload you built the ability to schedule now prints money.** Players who built spot
tiers, checkpointing and demand-response get an enormous payoff for a boring investment; players who
didn't **watch it happen to someone else.**

### `Dry Run` variants and the `Fire Drill` modifier
See §1.12 `The Dry Run` (you prepare and the event is cancelled) and §1.13 `Fire Drill` (a simulated
disaster with no real damage where the score counts your response). Both exist to teach a mechanic
before it bites for real, and to make **preparation itself scoreable.**

---

## 1.6 Progression shape between levels

### Ratchet unlocks (the world gets harder, announced)
Each tier permanently adds an "always-on" mechanic to all later levels.

**How it works:** Power budget, then heat, then jurisdiction, then compliance. Earlier mechanics never
go away; **the stack of concerns is the difficulty curve.**
**The announced-rule version:** each level permanently ratchets **one global rule** for the rest of
the campaign — "from now on, all customers expect TLS," "from now on, IPv4 costs money," "from now on
ransomware exists," "from now on every contract has an escalator." **The world gets more hostile in
ways that are announced, so the player can prepare and feel clever.**

### Legacy debt carry-over
Choices in a level persist as **Legacy** objects in later levels.

**How it works:** The cheap switch you bought in Tier 2 is still in the rack in Tier 4, still a
bottleneck, and removing it costs downtime. Oversold in level 3? Level 6 starts with 200 angry legacy
customers on a box you can't decommission, generating tickets forever until you spend a shift
migrating them. Every level you finish leaves behind something: the customer you kept on an ancient
PHP, the hacked-together billing integration, the one server nobody wants to touch. **A consequence
that arrives two hours later is the strongest memory a strategy game can make.**
**Give it a stat so it is playable rather than narrative: the Rebuildability index** (§1.11). A
legacy object's debt is precisely "hours to recreate this if it vanished," and that number turns the
decision to touch it or not into a calculation instead of a vibe.
**Debt amnesty (a required floor):** any legacy object can be retired at any time for a one-off cost
equal to its accumulated penalty, so **debt is always escapable at a price.** State this as a rule,
not as GM discretion.
**Interacts with:** §9.2 (the Legacy Box, the legacy island), §7.7 (technical debt), §1.3 "The Green
Screen Annuity" (legacy promoted to a business), §1.12 `The Decommission`.

### Carry-over, but thin (what actually persists)
**How it works:** Between levels you **keep**: unlocked tech, 3 named staff, your reputation score,
and a capped slice of cash. You **lose**: the physical build. **This keeps every level a fresh
placement puzzle while the meta-progression still feels like a company.**
**⚔️ Tension:** this sits against "Legacy debt carry-over" and "The Company Ledger," which want the
build to persist. The workable reconciliation: **physical layout resets, liabilities and relationships
do not.** A legacy object carries forward as a *constraint card* placed on the new board, not as the
literal machine.

### The Company Ledger
A persistent meta-save across the campaign: cash, reputation, staff, and *scars* carry level to
level.

**How it works:** Cash carries between levels — a level you *barely* won with an emergency purchase
leaves you poor for the next one. Losing a level doesn't reset you; it leaves damage. Optional "clean
slate" difficulty toggle for players who hate this.
**The Book of Business as the save file (the better framing):** your campaign save isn't "cash and
unlocks," it's **a customer list with names, MRR, tenure, term end-date, and grudge.** Levels hand
you that list. **Losing a level doesn't reset it; it *shortens* it.**

### The three floors (required, or the campaign becomes unwinnable)
Cash carrying between levels **plus** permanent scars **plus** legacy debt can compound into an
unwinnable state three levels deep — exactly what "the bottom of the curve must be playable" is meant
to prevent. State three explicit floors as rules:

**How it works:** **(1) Cash floor** — entering a level below a threshold triggers a scripted bridge
(a small emergency loan, an asset sale, a customer prepay offer) so you always start with at least
the level's minimum viable budget. **(2) Scar cap** — no more than three active scars; a fourth
replaces the oldest. **(3) Debt amnesty** — any legacy object is retirable for a one-off cost equal
to its accumulated penalty.

### Scars
Permanent negative modifiers earned by failure.

**How it works:** "Data Loss 2023" caps starting reputation; "Known Breached" increases attacker spawn
interest. Scars can be *paid off* over several levels, giving losing runs a recovery arc instead of a
restart.
**Three balance rules (unbounded stacking scars are a death-spiral generator):**
- **(a) Cap at 3 active scars**; a fourth replaces the oldest.
- **(b) Every scar has a stated payoff path shown on its card** — "Known Breached: clears after 90
  clean days *or* after passing an audit."
- **(c) Each scar grants one thing** — access to a Failure-Only Node (§5.2) or a permanent small
  discount on its own counter. **A scar that is purely a tax is a punishment; a scar with a door is a
  story.**
**Make scars readable and tradeable.** Each scar carries (a) a name and a date, (b) an explicit
mechanical modifier, (c) a stated **remission condition**, and (d) a **disclosure choice**: you may
proactively disclose the scar in sales conversations, which **costs some deals and makes the ones you
win far more durable**, or conceal it, which wins more deals and **detonates if discovered in
diligence.** **A permanent negative the player can *play* is far better than one they merely carry.**
**Map scars (the physical version):** failures leave visible marks in campaign mode — a burned rack
position that costs more to reuse, a customer segment that will never trust you again.
**Interacts with:** §5.2 (the Scar Tree — your tech tree *is* your incident history), §1.12 `Due
Diligence`.

### Named customers persist (the recurring cast)
Customers are campaign-length characters.

**How it works:** A customer you saved in Tier 1 refers you a big client in Tier 3; a customer you
dropped shows up as a competitor's reference in a negative-review event. **The Ghost of Customers
Past:** churned customers occasionally reappear as *win-back* leads or as *reputation attackers*.
How you handled a cancellation two levels ago literally walks back on screen.
**Cap the cast at 12 named accounts** at any time; everyone else is statistics. Promotion into the
cast happens when a customer crosses a threshold (revenue, tenure, or having been **personally saved
by the player**). Demotion is quiet. **Twelve is enough for a soap opera and few enough to remember.**
**Spine cast vs siding cast (required by a branching campaign):** if the player skips the level where
Brenda appears, later references to Brenda are broken. Split the cast: **spine cast** (introduced on
the mandatory spine, always present, safe to reference forever) and **siding cast** (line-specific,
referenced only inside that line's content). **Every narrative callback must be rooted in the spine
cast.**
**Win-back economics (which makes the exit survey retroactively valuable twice):** churned customers
are the cheapest lead source in hosting — **20–40% are winnable within 18 months at roughly a third
of cold CAC — unless they left angry**, in which case contacting them generates a public complaint.
**The exit-survey reason code (§3.7) determines which bucket they're in.**

### The difficulty dials, assigned to layers (contradiction resolution)
**⚔️ Four separate systems were proposed as "the difficulty selector":** Difficulty as SLA,
Difficulty as Business Model, the price slider (§6.5), and Operator-mode modifiers. The document
originally flagged two of them. **Assign each to a different layer and stop calling any of them
"difficulty":**
- **Business Model = the run selector (a faction).** Chosen once, at company founding. Reshapes
  threats, visitors, costs, and the whole ruleset.
- **SLA tier = a per-contract commercial term.** Chosen per customer, many times per run — which
  makes it a **recurring in-level decision rather than a menu setting**, strictly better.
- **Price slider = an in-level economic lever**, moved continuously, explicitly *not* labelled a
  difficulty control.
- **Operator modifiers = optional challenge toggles**, in a separate menu, orthogonal to all three.
A single derived **Pressure Estimate** number is shown at founding so the player knows what they are
signing up for.
**The diegetic front-end for all of it: The Signed Contract** (§1.10) — a per-level contract sheet
with four sliders (availability, response, scope, term) and a live reward number, which subsumes
"Difficulty as SLA" and makes the score screen readable ("you beat a 99.9 contract at 99.94 — B+").

### Difficulty as SLA
You pick the SLA you contractually promise: 99%, 99.9%, 99.99%, 99.999%.

**How it works:** Higher SLA = more money per customer and far less tolerance for error. Elegant
because it's diegetic and it directly changes both reward and failure threshold. Now expressed
per-contract inside the Signed Contract sheet rather than as a campaign-wide setting.
**Interacts with:** §6.9 (SLA credits become the economic instrument of difficulty).

### Difficulty as Business Model (the faction selector)
The player picks a *business* instead of a difficulty.

**How it works:** **Budget Shared Host** (huge visitor volume, razor margins, low-tier threats,
massive abuse rate) · **Managed Enterprise** (few high-value clients, brutal SLAs, nation-state
attention, a named contact who calls your cell phone) · **High-Risk Vertical** (crypto/adult/gaming:
enormous margins, constant DDoS, payment-processor problems). Same systems, wildly different pressure
profile.

### Operator-mode modifiers
Optional challenge toggles that change the texture of play.

**How it works:** **Snowflake Mode** — no configuration management; each server drifts individually
and fixes must be applied per-object, making the player *earn* Ansible. **Bus Factor 1** — only one
staff member knows each subsystem; if they're on vacation or burnt out, that subsystem can't be
touched. **Boutique Managed** — 20 customers paying enterprise rates with SLAs that have teeth.
**Cash Only** — no credit, no financing; every purchase from revenue. **Observability Debt** — how
much of your infrastructure is instrumented; low observability means **the game literally hides
information from you.**

### Authentic difficulty knobs (rather than arbitrary multipliers)
A design rule for how difficulty should be expressed at all.

**How it works:** Every difficulty axis should be a real operating parameter the player can name:
**oversubscription ratio** (the single most honest dial in hosting — higher = more money, less
headroom) · **lead time** (2 weeks vs 9 months between order and arrival) · **staff depth** (1
engineer vs follow-the-sun) · **observability debt** · **technical debt / config drift** (accumulates
passively if you take shortcuts; manifests as random variance in every operation) · **customer
quality mix** (a level seeded 80% good vs 80% problem customers). **No hidden HP multipliers.**

### Achievement gates (replacing MRR gates)
**⚠️ "Sustain MRR above a threshold for N months" creates the worst possible play pattern: the player
stops doing anything interesting and waits.** Replace with **gates that require a shape, not a
duration**: "unlock the enterprise tier by serving three customers above $2k/mo *simultaneously* with
zero SLA breaches." **That requires building something, not waiting for something.**
**The Contract Calendar as a gate (the best version of the idea):** some levels unlock when a
**threshold of your revenue is under contract with more than N months remaining.** Forces the player
to learn that **contracted revenue and recurring revenue are different things.**
**Reputation gates:** some levels only open at a reputation threshold — you cannot get a FedRAMP
level until you've run clean for N levels.

### The Ratchet (product decisions are one-way doors)
Once you sell an SLA tier, you can never *quietly* stop offering it.

**How it works:** Downgrading a product is a churn event. Teaches that product decisions are one-way
doors, and pairs with the §7.7 marking of irreversible actions. See §1.12 `The Sunset Letter` for the
level built on it.

### Cohort View
Between levels, see the cohort retention curve of everyone you signed.

**How it works:** A level where you grew fast but month-12 retention is 40% **scores worse** than slow
growth at 85%.

### The Quarterly Board Meeting
Between acts, pick one of three company-wide mandates: **Growth / Margin / Trust**.

**How it works:** Each shifts scoring weights and unlocks a different branch. **Makes the campaign
branch without building three campaigns.**

### The Uptime Streak → the Credit Grade
A cross-level counter of consecutive minutes without an SLA breach.

**How it works:** Higher streak = better financing terms and better client quality. Breaking it hurts
for hours. Creates real dread in an otherwise abstract stat.
**"Your reliability is your credit rating" — make it literal.** The streak, **plus** documented
processes, **plus** audited financials, **plus** revenue diversification feed a visible **credit
grade** that sets: your interest rate, your vendor payment terms, your insurance premium, and whether
your landlord asks for a personal guarantee. **Four different counterparties pricing you on your
operational behaviour** is a far richer version of one financing bonus.

### The Multiple (a persistent meta-stat)
Carry a **valuation multiple** across levels, visible on the company ledger.

**How it works:** It rises with contract length, revenue diversification, documented processes,
audited financials, gross margin, and NRR — and falls with concentration, month-to-month revenue,
key-person risk, and litigation. **It is a score you can see and act on for the whole campaign**, and
it makes boring decisions (sign longer terms, diversify, document) feel like they're building toward
something. `The Exit` cashes it in; `Due Diligence` (§1.12) audits it.

### Ramp-up debt (channels are expensive to start and impossible to restart quickly)
**How it works:** Every acquisition channel has a ramp: content 6 months, SEO 9–12, outbound sales
4–6 (hire, train, pipeline, close), partners 6–9. **Turning a channel *off* is instant.** So channels
are **expensive to start, free to stop, and impossible to restart quickly** — which makes cutting
marketing in a crunch a genuinely irreversible-feeling decision.

### Prestige: "The Exit"
Sell the company or IPO, cash out for meta-currency, restart at Tier 0 with a permanent perk tree.

**How it works:** After the Exit you keep a small number of chosen tech nodes permanently unlocked —
**picking which memories to keep is the meta-progression choice.** Make that choice **painful and
small**: you keep **three** nodes from a tree of ~120, plus one Doctrine, plus your Playbook. Not a
percentage — **three cards, chosen on a screen, with everything else visibly filed away.** And the
specific three appear on the next run's whiteboard **in the previous company's handwriting.**
**Exit types, each with a different meta-currency profile and epilogue:**
- **IPO** — most currency, plus a permanent **"shareholder pressure"** modifier (quarterly profit
  targets) on all future runs.
- **Strategic acquisition** (a bigger host buys you for your customers) — highest multiple, **your
  brand dies, your staff mostly get cut.**
- **PE platform acquisition** (they buy you as a platform to roll up others) — you stay and run it,
  with margin pressure and **a second bite at the apple in 5 years.**
- **PE bolt-on** (absorbed into an existing platform) — lower multiple, fast migration of your
  customers onto their stack, **high churn.**
- **Asset sale** (they buy the book, not the company) — **you keep the liabilities.**
- **Management buyout / employee ownership** — lowest cash, highest continuity, unlocks a unique
  meta-perk.
- **Wind-down** — sell the book, sell the hardware, pay the creditors, keep what's left. **An
  available, dignified ending.**
**Interacts with:** §9.2 (the acquisition ending), §9.4, §1.12 `Due Diligence`.

### Seasonality (the commercial and thermal year)
A year cycle the player learns to plan around.

**How it works:** Summer heat (cooling costs + failure rates up, power prices up), holiday traffic
peaks, January churn ("budget review season"), Q4 e-commerce spikes, conference season, August
(everyone's on vacation, your staff pool halved), Patch Tuesday monthly, end-of-quarter change
freezes, the annual holiday moratorium, tax season, leap day, DST changes, and the one week a year
the fire marshal visits.
**Per type:** game hosting spikes on launch days and holidays; retail hosting at Black Friday; backup
at month-end; CI on Monday mornings with a dead weekend; crypto with the price chart; satellite every
90 minutes; WISP on leaf-on. **The Timeline Ribbon's silhouette becomes a business fingerprint.**

### The Seasonal Physical Calendar
The *physical* year, which is a separate and equally load-bearing cycle.

**How it works:** Leaf-on season (WISP link degradation), **pollen clogging intake filters in
spring**, ice storms, hurricane season, the annual fire-marshal inspection, the utility's scheduled
maintenance window, the annual generator load-bank test, the quarterly vulnerability scan, the
semi-annual tape rotation to the vault, and — the one every operator knows — **nothing ships between
Dec 20 and Jan 5, so any hardware you need in that window must be on site by mid-December.**
**Readout — The Season Wheel:** a thin annular ring around the game clock, divided into twelve, with
icons for the seasonal events the game knows about (a turkey, a snowflake, a mortarboard, a receipt
for tax season, a patch-Tuesday cog repeating monthly). The current month is a lit wedge; the next
event is a small marker. **One ring answers "what is coming this year," which is otherwise a menu
dive.**

### The Long Weekend / the on-call clock
Some levels start Friday 5pm and staff availability decays.

**How it works:** Overnight hours run at high speed with reduced staff availability; you can schedule
risky maintenance there (safer for customers, worse for your engineers' focus meters). **Time-of-day
as a strategic axis.**

### Chapter bosses (with a readable three-phase shape)
Each tier ends with a signature antagonist encounter.

**How it works:** Tier 1 a script kiddie; Tier 2 an extortion botnet; Tier 3 a competitor's dirty
tricks campaign; Tier 4 a coordinated abuse ring inside your own tenants; Tier 5 a state actor with
BGP capability.
**Give every chapter boss the same three-phase shape so the player can learn to read it:**
**Phase 1 — probing** (small, cheap, testing which of your defences exist). **Phase 2 — the real
attempt** (aimed at whatever Phase 1 found weakest). **Phase 3 — the consequence** — *not more
attack*: a bill, a listing, a lawsuit, a review, a churn wave. **Phase 3 is the innovation: a boss
whose third phase happens on the business screen is unique to this game** and it enforces Pillar P8.
See §1.14 for the full boss roster.

### Sandbox unlock parity
Every campaign scenario unlocks its map + ruleset in free play.

**How it works:** The campaign doubles as a tutorial for the sandbox.

### The Type Ladder and the Sampler Structure
How hosting types gate and pace across a campaign.

**How it works:** Types are gated by tier — shared web and dial-up at Tier 0–1; game servers, email,
DNS at Tier 2–3; colo, CDN, object storage at Tier 3–4; GPU, wholesale, regulated, edge at Tier 4–5;
CA/PKI, IXP and registry late, because their prerequisite is years of clean audits. **Unlocking a new
line of business is the single most exciting unlock in the game** — it's not a new tower, it's a new
*game*. Each line also has its own small **Line Prestige** mastery track so specialists have something
to chase.
**How many lines per run (the missing number): 6–8**, of which **2 are mandatory** — shared web at
Tier 0–1 (it teaches density and blast radius) and colo at Tier 4 (it teaches the facility layer).
The rest are drafted from the sidings. **With ~35–40 lines in the catalogue, that's a genuine replay
proposition and it caps how much the player has to absorb in one run.**

### The Business-Type Tech Web (not a tree)
Hosting types are nodes on a web; **adjacency means "shares infrastructure."**

**How it works:** Shared hosting → VPS is cheap to reach; shared hosting → GPU is far. Reaching a
distant node requires an intermediate or a big capital injection. This is what makes the line draft a
*strategic* choice rather than a menu of flavours.

### The Era Track
A parallel progression axis orthogonal to both scale and type.

**How it works:** 1994 → 2001 → 2008 → 2016 → 2024 → near future. Advancing eras changes available
tech, customer expectations, threat mix, and the entire visual palette — and **retires some
buildables** (your modem bank becomes scrap). See §1.15 for the era presentation stack.

---

## 1.7 Difficulty curve craft

### The Wave Envelope (resolving waves vs continuous flow)
**⚔️ A real contradiction sat at the centre of the design.** The pacing rules were written for a
classic discrete-wave tower defense ("each wave has a numeric pressure allowance," "every wave is a
threat pulse immediately followed by a visitor surge"), while the traffic and visitor systems describe
a **continuous** flow with queueing, utilisation curves and patience drain. **These are different
games: if waves are discrete, the queueing model is decoration; if flow is continuous, "wave" has no
referent.**

**How it works (the fix):** **Baseline = continuous, diurnal, never zero.** **Events = shaped
envelopes laid over the baseline**, each with a ramp, a plateau, a decay, a composition and a
telegraph. Everything the wave language wanted survives, restated:
- **The Pressure Budget** becomes the budget for *events per unit of level time*.
- **The Two-Beat Wave** becomes an *authoring pattern* (a threat event immediately followed by a
  demand event), not a physical law of the simulation.
- **Telegraph Depth** becomes "you can see the next two envelopes on the Timeline Ribbon."

### The Pressure Budget
Each event envelope has a numeric "pressure" allowance the generator spends on threat types.

**How it works:** The curve isn't linear — it's **sawtooth with a rising floor**: hard wave, easy
wave, harder wave, easy-but-not-as-easy wave. **The dips are where the player builds; without dips,
building never feels like a choice, just a chore.**
**Authoring rules (the numbers it was missing):**
- **(a)** A wave's pressure may be spent on **at most 4 distinct threat entries** — more than that is
  noise the player cannot parse.
- **(b)** The **first wave of any level spends ≤40% of par, always**, so the player gets a read on
  the board.
- **(c)** **Trough waves must be ≥45% below the preceding peak** or the sawtooth isn't felt.

### The Two-Beat Wave
Every threat event is *immediately followed by* a visitor surge.

**How it works:** The player who spends everything surviving the threat has no capacity left to
monetize the surge. **This single rhythm generates 80% of the game's interesting decisions.** Do you
buy another WAF, or another web node?

### Two difficulty axes, never one
Waves scale on **Volume** (more stuff) and **Variety** (new stuff).

**How it works:** **Volume tests your build; Variety tests your coverage.** Alternate which one
escalates each shift so the player alternates between "widen" and "deepen" — **that rhythm is what
keeps a 40-minute level from flattening.**

### Telegraph Depth, and the information-design law (three-way contradiction resolution)
**⚔️ Three rules were in direct conflict:** "nothing announces itself — you get symptoms and must
diagnose"; "the next wave's composition is always visible"; and "threat pathlines are drawn as dashed
magenta trajectories before they move."

**How it works (the resolution, which improves all three):**
**First, scope the two layers and say so explicitly:**
- **Waves are loudly telegraphed** — size, timing, and rough composition are always visible. *This is
  the planning horizon.*
- **Incidents are never labelled** — you get the symptom, not the diagnosis. *This is the play.*
So: you always know **that** a storm is coming and roughly how big; you never know **what
specifically is wrong** without doing the work.
**Second, telegraph exactly in proportion to how a real operator would see it coming**, which maps
cleanly onto the four threat bands:
- **Weather** — fully visible, always, as a baseline level. You can see the scanner drizzle.
- **Storms** (volumetric floods, scheduled events, launches, Patch Tuesdays) — **telegraphed**,
  because in reality you *do* see traffic building at the edge, or you were told the date. Dashed
  trajectories are fine here.
- **Hunters** (targeted, adaptive, mimic, insider, APT) — **never telegraphed. Symptom-only. No
  magenta anything until classification.**
- **Entropy** — telegraphed **only if you bought the instrument** (SMART, error counters, battery
  capacity tests, thermal imaging). **Foresight is a purchase.**
**This turns a contradiction into the game's cleanest information-design law.**
**The horizon itself:** the next envelope's composition is visible; the one after is a silhouette;
the one after that is a question mark. **Unlockable monitoring extends the horizon by one wave — an
upgrade to *knowledge*, which is a rare and delightful kind of upgrade.**
**Rule:** never surprise the player with *size*; surprise them with *composition.* (The single
deliberate exception is the Slashdot teleport in `Launch Day`, §1.5, which is memorable precisely
because it breaks the law once.)

### Grace Windows → the Triage Window / the Attention Grace
**⚠️ The original rule — "after any catastrophic failure, ~30 seconds where the site is down and
nobody is arriving" — is exploitable (deliberately fail to buy a free build window) and contradicts
four of the game's own systems at once: Retry Storm, The Ticket Avalanche, Ambulance Chasers, and the
cold-cache thundering herd. After a real catastrophic failure traffic does not stop; it *increases*.**

**How it works — two proposed replacements, both preserving the anti-death-spiral intent. They are
compatible and should probably ship together:**
- **The Triage Window (traffic version).** Arrivals don't stop — **they queue *visibly outside*,
  patience draining**, while your hands are freed from the failed subsystem for 30 seconds. You get
  breathing room for your *hands*, not a pause in consequences, **and you can watch exactly what the
  pause is costing you.**
- **The Attention Grace (alert version).** On a sev-1 the game automatically groups and suppresses
  duplicate alerts, holds low-severity pages, and gives the player one free "focus" hand for 30
  seconds. **The world gets worse on schedule; the player's ability to think is temporarily
  protected** — which teaches incident command instead of teaching something false.
Both remove the exploit, both keep failure costly, and both are better drama than a pause.

### The Difficulty Dial the Player Turns
The player sets their own tempo by setting prices.

**How it works:** Lower prices = more clients = more revenue = more traffic = more attackers, faster
waves. Best kind of difficulty: self-inflicted, legible, reversible.
**Timing correction (the single most important one in the document):** "lower prices = more clients"
is right for **new** customers only. Price changes affect the existing base **only at renewal**, so
the dial has a **12-month lag on ~80% of its effect** unless the player force-migrates (which is a
churn event). **The slider must visibly show two numbers: effect on new signups (immediate) and
effect on the base (a slow fill bar that tracks the renewal calendar).**
**Guardrail:** there must be a **floor on demand**, or the optimal play is "price yourself out of the
market and win a level with four customers." Floor it with fixed costs, a **minimum viable scale**
per level (below N customers you fail the contract), and **market-share decay** — a market you don't
serve is served by the Competitor, and coming back costs more than staying.
**Interacts with:** §6.5 (price slider), §1.12 `Price Increase Day`.

### Anti-Turtle Clock (caused, not arbitrary)
You cannot camp a safe build forever.

**How it works:** **⚠️ Upkeep rising on a wall clock is a treadmill and reads as arbitrary.** Instead,
upkeep rises as a function of **your own estate's age and size** — depreciation, licence creep, patch
debt, salary growth — so it is *caused by the player*, visible in the cost-bucket bar, and reducible
by the sustain actions the design wants them to take. **Same anti-camping effect, legible cause.**

### Peacetime is the real boss (and must be scored)
**⚠️ Players will fast-forward peacetime no matter what a design document asserts, unless peacetime
has its own scored loop.**

**How it works:** Attach four scored peacetime activities with visible meters — **drills run**,
**hollow icons filled**, **debt paid** (the debt meter made reducible), **conformance %**. Target
ratio: a healthy level is roughly **60% peacetime / 40% incident by wall-clock time**, and the score
card should award **up to 25% of total points for peacetime work.**
**Anti-fast-forward rule:** **speed >1× is unavailable while any hollow (undrilled) capability
exists**, framed diegetically as *"you have things you haven't checked."*
**Five concrete peacetime verbs with immediate, tactile feedback (abstract ones will feel like
chores):**
1. **Tidy** — a cable-management pass; the room visibly improves.
2. **Label** — asset tags and port labels; remote-hands error rate drops and you can read the board.
3. **Drill** — a rehearsal with a visible confidence stat that goes up.
4. **Walk** — an inspection pass that finds one small thing, **always**.
5. **Write** — documentation, with the shelf visibly filling.
**Peacetime fails when its rewards are all deferred; at least one reward must be immediate.**

### Downshift levels (the deliberate exhale)
After any level scored "Barely Held It Together" or worse, the next level is automatically a
**downshift**.

**How it works:** Smaller board, fewer simultaneous systems, one clear goal, and explicitly framed as
such: *"Q3. Nothing on fire. Fix the things you promised you'd fix."* It is not trivial — it is
scored on **debt paid, drills run, documentation written** — but it has **no wave pressure.**
**Why:** the sawtooth exists *within* a level and nothing exists between levels. **A 20-hour campaign
of escalating crises is exhausting**, and the downshift is also where "peacetime must be valuable"
gets its real estate.

### Pressure carry-over (the fatigue ledger between levels)
A level's final **team fatigue** and **technical debt** carry to the next level as starting values,
**visible on the level-select card before you commit.**

**How it works:** A brutal win leaves you starting the next level at 60% hands. The Downshift level is
how you clear it, and **choosing to *skip* a downshift for a bigger reward is a legitimate, tempting,
dangerous strategy.** Makes staff burnout and the debt meter matter across the campaign instead of
resetting every level.

### The Mercy Rule / Consultant Mode
Third consecutive loss on a level offers an NPC greybeard.

**How it works:** Not an auto-win, a hint. **Improvement: the greybeard shouldn't mark "the two worst
decisions." A real senior engineer asks three questions — *what changed*, *what does the monitoring
you do have say*, and *have you checked that it's actually down.*** Framing the hint as questions
rather than answers preserves the player's agency and teaches the method rather than the fix.

### The Comeback Curve
Explicitly design an economy where a player at 20% health can recover.

**How it works:** Low reputation means fewer visitors means fewer threats, and cheap "survival mode"
builds exist. **The bottom of the curve must be playable**, or players quit instead of rebuilding.
**The business-side recovery ladder (what actually makes the bottom playable — an ordered, legible
list of survival moves):** cut discretionary spend → raise prices on **new** (not existing) → shift
mix toward higher-margin add-ons → push annual prepay for cash → **fire the worst 10% of accounts by
cost-to-serve** → and only then cut staff.

### The Failure Ladder (losing drops you, it doesn't restart you)
Failing a level does not show a game-over.

**How it works:** It routes you to a **recovery scenario generated from *how* you failed**:
- **Cash zero → "Chapter 11"** — 15 minutes: negotiate with creditors, sell a line, keep a core.
- **Data loss → "The Notification"** — you play the 72 hours *after*, not the outage.
- **Mass churn → "The Win-Back"** — your ex-customers are the level's visitor pool.
- **Upstream termination → "Re-homing"** — move your entire network in 30 in-game days.
You return to the campaign poorer, scarred, and **with a specific unlock only obtainable this way**
(the Failure-Only Nodes, now with a delivery mechanism). **This makes failure a chapter rather than a
reload.**

### The Fail-Forward Fade (how a loss is presented)
Losing a level should not be a modal.

**How it looks:** When a lose condition trips, the game does **not** cut to a screen. It takes the
controls away gently: the camera slowly pulls back to the Establishing Frame while the facility goes
dark **in dependency order** — edge first, then app, then data, then the lights, then the LEDs, then
the exit signs — over about eight seconds, with the hum falling away in steps. **The last thing lit is
whatever you built first in the campaign.** *Then* the postmortem document slides in.

### The Three-Clock Rule
At any moment the player should be watching exactly three clocks: **the next wave, the next bill, and
the current incident.**

**How it works:** More than three and the board becomes noise; fewer and it becomes idle. Used as a
design gate on adding new timed systems.

### Soft failure over hard failure (and the hard-cliff exception rule)
Most failures should degrade you, not end you.

**How it works:** Lose a rack, lose a customer, shrink the board — and continue, so the fun is in
recovery. The game's death should be a *trend* the player can see coming for three minutes and fight
against.
**⚔️ The rule conflicts with two entries that are instant cliffs (total data loss; certificate
expiry). That is fine — but state the exception so authors can apply it consistently:** **hard cliffs
are permitted only where the real world has one, and only where a cheap, boring, purchasable
prevention existed for at least 5 minutes of level time beforehand, visibly.** Cert expiry qualifies
(the countdown is on screen all level). Data loss qualifies (the backup icon was hollow). **A random
hardware death would not.**

### Difficulty expressed as chrome
Higher difficulty adds **instrumentation**, not just numbers.

**How it looks:** The HUD bezel gains more gauges, more warning lamps, more tiny readouts. **A
veteran level should look like an aircraft cockpit next to the tutorial's single dial.**

### The Nines Ceiling
Every level displays its uptime target as a **physical notch on the wall**, like a height chart.

**How it looks:** Your current rolling uptime is a rising/falling **water line** against it. It is
always in the background and always readable at a glance.

### The density/interface lockstep rule
Both "The Density Ramp" and "The Cable Entropy Curve" are art-production notes with a hidden gameplay
consequence that must be stated.

**How it works:** **The tier at which the player can no longer track individual objects is the tier at
which aggregate management verbs must already be unlocked.** Tie the batch-operations ladder
explicitly to the density ramp, so the interface capability arrives **exactly one tier before** the
density that demands it. **Getting this off by one tier is the single most likely cause of a
mid-campaign quit.**

---

## 1.8 Tier postcards: the visual identity of each scale

*The progression arc should be legible as a **series of postcards**: shown a single still frame from
each tier, a player should instantly know which tier it is. The escalation is a sequence of distinct
compositions, not just "more stuff." (Tier-by-tier art notes and the per-tier composition rules are
folded into §1.1; this section holds the escalation devices themselves.)*

### The Closet (Tier 0 art note)
A single beige tower PC under a desk in a warm domestic room: carpet texture, a window with daylight,
a cat that occasionally walks across the cable. The "map" is *one table*; traffic arrives along a
single phone-line cable from the left edge. Warm lamp yellows and wood browns — deliberately un-sci-fi
so that Tier 1's cold blue feels like a real graduation.

### The Density Ramp
Each tier increases *objects per screen* but decreases *pixels per object*.

**How it works:** The art must be authored at four LODs from day one, with explicit targets: **LOD0
full detail (Z1) · LOD1 faceplate + lights only (Z2) · LOD2 silhouette + one state colour + load
donut (Z3) · LOD3 the object does not exist and is represented by its parent's aggregate glyph
(Z4).** The feeling of scale comes from the same asset getting smaller and more numerous — and then
**stopping existing**, which is the mechanism behind "aggregate, don't shrink" and must be stated as
a production requirement rather than a rendering preference.
**Gameplay consequence:** see §1.7's density/interface lockstep rule.

### The Cable Entropy Curve
Early levels: 3 cables, hand-placed, beautiful. Late levels: hundreds.

**How it works:** Introduce **cable bundling** as an unlockable that visually collapses N parallel
links into one thick sheathed trunk with a small "×12" badge. **The visual relief of buying cable
management is one of the best upgrade payoffs in the game** and costs nothing mechanically to justify.
**Two details that make it land:** the "×12" badge sits **at the bundle's midpoint on the sheath**,
and **hovering the bundle fans it back out temporarily so you can still trace a single link.**
**Buying tidiness must never cost you traceability, or players will refuse the upgrade.**

### The Noise Floor
As tiers advance, add ambient background activity you don't control.

**How it works:** Other tenants' blinkenlights, techs walking carts down the aisle, a flickering
fluorescent tube. Makes the facility feel alive and makes *your* signals require better contrast,
which is why the Flow layer's saturation clamp matters.

### Sky / Time-of-day Bands
Each level runs across a stylized day.

**How it works:** The background window/skylight shifts dawn → noon → dusk → night, and traffic volume
is drawn as a **diurnal wave** in the Timeline Ribbon — so the player sees rush hour coming as a
literal sunrise. Night = low traffic + higher attack ratio (the 3am pager aesthetic: everything dark,
one magenta triangle, one red pip). The day/night band also becomes a *threat-detection tool* for
time-of-day-specific threats like toll fraud.
**⚔️ Grading conflict, resolved:** three systems want to drive the scene's colour — per-line palettes,
era grading, and time of day. **Stacking order: era sets the base grade; line sets the accent and
material; time-of-day sets light direction, intensity and colour temperature only. Time of day never
changes hue assignments.** Stated once, it prevents a mess.

### The Weather Card
For any level where live weather affects play.

**How it looks:** A small, always-visible card in the corner drawn like a mid-century forecast card: a
hand-drawn sun/cloud/storm glyph, an outside temperature, and a grid-price arrow. **Its background
tint is the same tint applied to the level's outdoor light, so the card and the world agree** — and
you learn to read the card because the window is already telling you.

### The Blueprint Rewind / the Blueprint Wipe
Level intro and outro are an animated architectural blueprint that draws itself in cyan line-art then
solidifies into real assets.

**How it works:** Level start draws the facility in as a **cyanotype blueprint** — lines sketching in
over ~1.5s — then the blueprint "develops" into the full-colour world. **The same look is reused as
the pause/plan mode**, so the player immediately reads "this is the planning state." Level end
reverses it, leaving the final built topology as a clean, shareable **blueprint card**. Progression
is archived as a gallery of blueprints.

### The Establishing Frame vs the Working Frame
Every level ships **two** authored compositions, not one.

**How it works:** The **Establishing Frame** is cinematic — low camera, strong horizon, dramatic
lighting, the hero silhouette of the line, no UI. It plays for ~6 seconds at level start and is also
the level-select card, the loading screen, and the score-screen backdrop. The **Working Frame** is the
flat, high, legible, boring-on-purpose gameplay camera. **Authoring both stops the art team from
compromising the working camera to make screenshots pretty — the most common way strategy games go
unreadable.**

### The Company Wall
The meta-progression screen is an office wall that fills up over the campaign.

**How it works:** Framed blueprint cards from each cleared level, a pegboard of unlocked hardware,
press clippings for milestones, a slowly-growing collection of conference-booth swag, pinned photos
of racks, a rack-unit ruler, a growing pile of business cards, certification patches sewn onto a
hanging jacket, dead drives on a shelf, and whiteboard architecture sketches that get denser.
**Progress is a room getting more furnished** — the physical office *is* the progress bar, rather than
a world map of nodes with a path.

### The Asset-Tag Ledger
Every machine you ever deployed gets a numbered asset tag sticker.

**How it works:** Old machines carry visible wear proportional to their uptime. A 5-year-old box
that's been with you since Tier 1 looks scuffed, yellowed, and beloved. Retiring it plays a small
ceremony.
**The five authored age states (applied as material variants, not new models):** **New** (crisp decal,
bright LEDs, protective film corner still on) · **Working** (clean, slight bezel dust) · **Aged**
(yellowed plastic, one dead LED, a label reprinted over the old one) · **Legacy** (mismatched
faceplate, hand-written label tape, cable ties replaced with electrical tape) · **Cursed** (a sticky
note, a wrong-coloured screw, a chassis that doesn't match its rails). **A machine's age state is
earned by uptime and neglect**, so the Tier-1 box you never replaced arrives at Tier 4 looking it.

### Rack Elevation Diff
Between levels, a before/after rack elevation animation of what changed.

**How it works:** It reads like a changelog you can actually look at.

### Scale-Anchor Object
Keep one object identical at every tier for scale reference.

**How it works:** A coffee cup at the board altitude, a person silhouette at rack/room, a city at the
world map. Classic technical-illustration trick; makes escalation viscerally felt.

### The "You Are Here" Sticker
Wayfinding at Tier 4+, where the minimap and the world are the same object.

**How it looks:** The camera's current position is marked in-world by a small **printed floor-plan
sticker on the end cap of the nearest row**, with a dot. Zooming out shows the same floor plan getting
larger until it *becomes* the minimap.

### The Logo Evolves (reputation as typography)
Your company logo is drawn on everything and its rendering gets more polished as reputation rises.

**How it works:** Level 1 is clip-art Comic Sans on a printed sheet taped to the tower PC; the top
level is etched aluminium. Appears on rack doors, badge lanyards, the loading screen, and the truck in
the delivery cutscene.
**Two corrections:** it needs a **Player Company Mark Generator** to exist at all, and the five
fidelity levels should be tied to **reputation bands, not tiers** — so a Tier-4 company with a wrecked
reputation still has the clip-art logo on its rack doors. **That's funnier and truer.**

### Tier-Up Title Card
Between tiers, a full-screen typographic card with the new tier's name set in that tier's font.

**How it works:** Tier 0 is a dot-matrix printout; Tier 5 is crisp modern sans. Typography as
progression, again. Pairs with the Scale Handshake Frame (§1.1), which is the *motion* version of the
same beat.

---

## 1.9 Level grammar and authoring laws

*New in wave 2: the rules that let a designer generate a hundred levels without shipping a hundred
systems, and that stop twenty hosting types from reading as twenty minigames. These are the answer to
the fragmentation risk the whole variety engine creates.*

### The Level Grammar (anti-fragmentation rule)
Every level, regardless of hosting type, is assembled from the same six slots.

**How it works:** `SCALE` (one box → one rack → one suite → one DC → many DC) × `BUSINESS` (what you
sell) × `SCARCITY` (which resource is the binding constraint: latency / capacity / power / trust /
cash) × `LANE SHAPE` (how many ingress paths and how they branch) × `CLOCK` (steady diurnal / spiky /
seasonal / always-on) × `GOAL` (survive / grow to N / hold an SLA / migrate / audit / evacuate).
**The player learns one verb set and re-reads it through new constraints.** A designer can generate a
hundred levels from six columns.

### The Binding Constraint promise
Each level's briefing states **in one line** which resource will kill you.

**How it works:** *"In cold storage, latency is free and durability is everything."* **Players should
be able to say out loud what this level is about before the first wave.** This is the single biggest
thing that keeps type-swapping from feeling like reskinned mush.

### The Invariant Core (six verbs, never swapped)
A design law, stated so that content authors cannot break the game by accident.

**How it works:** Every hosting type, every era, every perspective level must be playable with the
same six verbs and no others: **Observe** (open an overlay / read a graph) · **Diagnose** (narrow
symptom to cause) · **Place & Connect** (add a node, draw a link) · **Tune** (move a slider, set a
policy) · **Triage** (assign a hand / choose what burns) · **Commit** (schedule a change into a
window). A type may change what the nouns are; **it may never introduce a seventh verb.**
**Two corollaries:**
- **The 20% palette rule.** A new hosting type may replace at most 20% of the build palette. The other
  80% must be objects the player already knows, doing a recognisable job.
- **The Three Meters Law.** **Cash, Reputation and Hands** are on screen in *every* type, always, in
  the same place. Only the fourth meter — the level's scarce resource — swaps.
**Variety comes from *which verb dominates*, not from new verbs.**

### The Handover Note (60-second orientation for a ruleset swap)
The missing onboarding beat: a new hosting type otherwise drops the player into a game whose rules
changed with no in-fiction teacher.

**How it works:** Every hosting-type level opens with **a single sheet of paper on a desk, written by
the outgoing operator**, containing exactly three lines: **what runs out first**, **what kills you**,
and **what the customer actually wants**. Three lines, hand-written, skippable — and they are exactly
the three ruleset-card slots that changed. *("Backups: you never run out of disk. You run out of
night. Jobs that don't finish by 06:00 didn't happen. Nobody cares how fast you are; they care whether
Tuesday's file comes back.")*
**Why:** a ruleset swap is only fresh if the player can act competently inside the first two minutes.
The cheapest possible teaching device, 100% diegetic, and it doubles as the level's thesis statement
for the player who returns to it in sandbox six months later.

### The Rosetta Card (teaching that it is the same game)
*The single most important anti-fragmentation device.*

**How it works:** The second time a new ruleset introduces a mechanic that is a **rename** of
something you already know, the game draws a one-line equivalence on the Handover Note **in a
different ink**: *"**Power oversubscription** is your oversell ratio." · "**Backup window** is your
maintenance window." · "**IP reputation** is your uptime streak, but held by strangers." · "**Tick
budget** is your latency budget with a harder cliff." · "**Cardinality** is your concurrency limit,
set by your customer." · "**Pass window** is your maintenance window, set by orbital mechanics."*
Collecting these fills a **Rosetta page** in the Codex which is, functionally, **the game's thesis:
hosting is one job with twenty costumes.**
**Why:** without it, twenty hosting types read as twenty minigames. With it, **each new type makes the
player feel smarter about the previous ones.**

### The Returning Type doctrine (novelty, then mastery)
No hosting type ships as a one-off.

**How it works:** Every type appears **at least twice**:
- **Introduction** at tier N — restricted palette, one scarce resource, a single antagonist, a
  Handover Note.
- **Mastery** at tier N+2 — same type, twice the scale, **plus one mechanic you learned elsewhere in
  between**, and the level is explicitly built to be unwinnable without it. *("Game hosting, again —
  but now your capacity is multi-region and you learned anycast in the DNS level.")*
- Optional **Capstone** in an endgame multi-line level where the type is one district.
**A type you visit once is a minigame. A type you return to, changed, is a character.** It is also the
cheapest possible content: the second visit reuses 100% of the first's assets.

### The Portable Skill Table (what each type teaches that transfers)
An authoring constraint: every type must be designed around one *transferable* lesson, and **the
campaign order is built from this table, not from theme.**

| Type | Teaches (transfers everywhere) |
|---|---|
| Dial-up ISP | Concurrency is countable; oversubscription is a bet |
| Shared web | Density vs blast radius; one tenant is everyone's problem |
| Game hosting | p99 is the product; geography is latency |
| Email | Some resources are held by third parties and cannot be bought back |
| DNS | You are load-bearing for other people; TTL is a throttle you own |
| CDN | Offload is margin; the miss is the event |
| Object storage | Durability is arithmetic, not vibes |
| Backup/archival | Verification is the only proof; the window is the constraint |
| DRaaS | Uncorrelated risks are correlated exactly when it matters |
| Colo | You will have to fix things you are not allowed to touch |
| GPU | Power and heat are the real ceiling |
| HPC | The slowest member sets everyone's speed |
| Serverless | Cost can be attacked without touching availability |
| Kubernetes | Automation executes your mistakes at machine speed |
| Regulated | Shrinking scope is cheaper than defending it |
| Bulletproof | Some revenue is a loan against your future options |
| CA / PKI | Your licence to operate is granted by someone else |
| Registrar | The lifecycle is the clock |
| Observability | Your customer's carelessness is your capacity plan |
| CI / build farm | The fast path and the safe path are opposites |
| IXP | Value is the square of membership; neutrality is an asset |
| Legacy/mainframe | Some resources cannot be purchased, only retained |
| Satellite ground station | You cannot buy your way out of time |
| Time/NTP | Being confidently wrong is worse than being down |

### The Level Archetype Taxonomy (and the no-repeat rule)
*The single highest-value editorial tool you can give a campaign designer, and how you stop a
55-scenario library from collapsing into "another wave level with a story."*

**How it works:** Every level is tagged with **exactly one** of eleven archetypes, and **no two
consecutive levels may share an archetype**:
1. **Endure** — survive N waves (the default; should be **<30% of the campaign**).
2. **Convert** — maximize throughput of *good* traffic. Rate-limiting to survive is a loss.
3. **Reach-State** — attain a configuration (audit, compliance, migration). No combat.
4. **Escort** — one unit matters (the Influencer, the Whale Demo, a tournament, a restore).
5. **Diagnose** — the board is already broken; find why.
6. **Build-to-Spec** — construction against a blueprint and a budget.
7. **Shrink** — remove things without breaking anything (cost cut, scope reduction, divestiture).
8. **Schedule** — fit work into windows (backup, HPC queue, satellite passes, change freeze).
9. **Negotiate** — the opponent is a person (RFP, peering, vendor squeeze, ransom).
10. **Hold-Without-Hands** — no manual actions allowed.
11. **Inherit** — a fogged board you didn't build.

### The scenario length buckets
**How it works:** **Interludes (3–6 min)** — one mechanic, one decision, no build phase. **Scenarios
(12–20 min)** — one premise, a build phase and a resolution; the bulk of the library. **Sieges (30–45
min)** — multi-phase, multi-system. **Ship roughly one interlude every two levels, one scenario every
three, and one siege per act.**

### The Cold Start Minute (a spec for the first 90 seconds of every level)
A hard authoring rule, enforced in review.

**How it works:**
- **0:00–0:15** — Cold Open camera, Handover Note, contract already signed. **No threat.**
- **0:15–0:40** — **one *free* successful conversion.** The player watches a visitor arrive and pay
  before anything goes wrong. **This is the promise of the level.**
- **0:40–1:10** — the level's signature constraint asserts itself **once, harmlessly, with a
  telegraph.** (The backup window bar appears and shows 8 hours. The amp meter ticks. The tick
  metronome wobbles.)
- **1:10–1:30** — **the first decision, with exactly two viable options and enough money for one.**
- **1:30+** — normal play.
**Why:** levels that open on chaos teach nothing, and levels that open on nothing feel like setup.
**Every good TD level opens with one free kill; this design's equivalent is one free sale.**

### The Three-Act Shape (with concrete lengths)
**A named number for level length is the single most useful thing a design doc can contain**, because
it constrains everything else.

**How it works:** **Act I (Tiers 0–2)** — 8 levels, 10–15 minutes each, teaching the core loop.
**Act II (Tiers 3–4)** — 12 levels, 20–30 minutes each, where hosting *types* start swapping and the
business layer turns on. **Act III (Tiers 5–6)** — 8 levels, 30–45 minutes each, portfolio and
geography. **Total campaign ≈ 14–18 hours.** Minimum per act: two perspective-shift levels and one
scenario.

---

## 1.10 In-level structure: shifts, windows, forks and framing

*New in wave 2: the interior shape of a single level, and the diegetic furniture that communicates its
rules.*

### Shift Structure (day/night pacing)
A level runs in **shifts**.

**How it works:** Each shift = a **Business Day** (build, sell, hire, price, plan — time is soft,
threats are trickled) followed by a **Peak** (the wave; time is hard, and you can only place
pre-authorized changes). **Peak length grows across the level. The Business Day shrinks.** By the last
third of a level the player is nearly always in Peak — **that's the pressure curve, built from pacing
rather than from bigger numbers.**

### The Change Window
Building during Peak is allowed but risky.

**How it works:** Any structure placed while traffic is live has a chance to cause a **self-inflicted
outage proportional to how central it is.** Building during the Business Day is free and safe. So the
player is perpetually asking: *"do I fix this now and maybe break it, or bleed until 3am?"* **The best
five-second decision in the game, and it's free realism.**

### Quarter Arc
A campaign level = one fiscal quarter = ~13 shifts.

**How it works:** Shifts 1–4 introduce the type's signature mechanic with a soft threat floor. 5–9
mix. 10–12 stack. **Shift 13 is the Quarter Event** (a chapter boss, §1.14). End of quarter = the
**Quarterly Review** score screen.

### The Signed Contract (pre-level difficulty as a negotiation)
Replaces "pick easy/normal/hard" with a diegetic draft, and is the front-end that resolves the
four-way difficulty-dial collision (§1.6).

**How it works:** Every level opens on a contract sheet with four sliders and a **live-updating reward
number**. The player sets them *before* play, and the sheet is a physical prop the level ends by
**stamping or rejecting**:
- **Availability commitment** — 99% / 99.5% / 99.9% / 99.95% / 99.99%. Sets your error budget for the
  level and the per-minute credit rate.
- **Response commitment** — 24h / 4h / 1h / 15min first-response. Sets ticket-timer pressure and how
  many hands the support queue eats.
- **Scope** — how many services/customers/lines you accept. More scope = more revenue and more
  simultaneous fires.
- **Term** — monthly / annual / multi-year. Longer terms pay a premium up front (cash now), **lock
  your price**, and mean a mistake follows you into the next two levels.
Reward scales roughly as `base × (1 + 0.35·availability_step + 0.2·response_step + 0.15·scope_step)`,
with term acting as a **cash-timing** modifier rather than a total modifier.
**Why it beats a difficulty menu:** it is *the same decision a real operator makes*; it produces a
legible reason for the difficulty ("I promised four nines, that's on me"); it is **per-level** so a
player can back off after a rough night; and it makes the score screen readable — *"you beat a 99.9
contract at 99.94 — B+."*

### The Difficulty Contract / Statement of Work
The briefing screen as a decision rather than a text box.

**How it works:** Before every level the player signs a one-page **Statement of Work**: the customer,
the promise (SLA), the budget, the duration, and **the three things you will be scored on.** Diegetic,
replaces a briefing screen, sets expectations precisely — and crucially, **some of its terms are
negotiable before you start.**

### The Deal Sheet (level intro card)
Every level opens with a physical artifact, not a text box.

**How it looks:** A faxed RFP, a scribbled napkin diagram, a colo quote with handwriting on it, a
pager message, a printed-out Slack screenshot. **It states the goal in the fiction's own voice, and
its art tells you the era and the hosting type before you read a word.**

### The Objective Totem
Win conditions are currently text. **Make them objects.**

**How it looks:** Each scenario places **one physical object on the board that *is* the objective**,
lit differently from everything else and visible at every altitude. `Zero Downtime Migration` — a
**TTL hourglass** on a pedestal by the entrance. `Compliance Week` — a **blank framed certificate** on
the office wall that fills in as controls are satisfied. `Runway: 6 Weeks` — a **fuel gauge on the
office door**. `Sold Out` — a **signed contract under glass**. `The Honeymoon` — an **empty visitor's
chair**. When the objective completes, **the totem does something physical**: the hourglass is turned
over and put away; the certificate is stamped; the chair is sat in.
**Interacts with:** the whole scenario library, §6.9 scoring, and it **removes a HUD element.**

### The Constraint Band
Scenario special rules are the most-forgotten information in a TD. **Render them on the tool, not in a
briefing.**

**How it looks:** A scenario rule physically modifies the UI furniture it constrains. `The Change
Freeze` — **hazard tape diagonally across the build palette and the deploy button**; clicking under it
plays a refusal. `The Cheap Bid` — a **"REFURB ONLY" sticker** on the catalogue, new hardware behind
frosted glass. `The Long Weekend` — the hands dock greyed out with an **out-of-office sticky note**.
`Blind Mode` — a **dust sheet** over the graph drawer. `The Quiet Month` — a **"NO SCHEDULED THREATS"
card** on the threat gantry, which is somehow more unsettling than threats.

### The Midpoint Fork
At roughly 45–55% of a level's length, play pauses on a **two-card choice that reshapes the back
half.**

**How it works:** Not a difficulty choice — a *shape* choice, and **both cards are attractive**:
- *"Marketing landed a feature in a newsletter. Traffic +140% for the rest of the level."* vs
  *"Legal wants a change freeze. No deploys, but no bad-deploy risk and +1 hand."*
- *"Take the emergency contract: +$8k now, a 4-hour RTO promise you cannot currently meet."* vs
  *"Decline. Keep the headroom."*
The chosen card is **stamped on the score screen**, so two players' stories of the same level differ.
**Why:** levels currently have one act. A fork gives every level a second-act turn, gives the Timeline
Ribbon a narrative bend, and **multiplies replay value at essentially zero content cost.**

### The Double-Header (two boards, one budget)
**How it works:** Occasional levels present two short scenarios *simultaneously* on split screen —
often two lines of business, or two regions — with **one shared pool of cash and hands.** You can
pause one and not the other only by *choosing where to look*; **the unwatched board runs on its
standing policies.** Scored jointly.
**Why:** it is the cheapest possible way to teach the Tier-5 lesson ("you cannot look at everything")
**without building Tier 5**, and it makes the delegation/policy systems matter two tiers earlier than
they otherwise would.

### The Scenario Icon Family
~60 scenarios with no iconography is a set that doesn't read as a set.

**How it looks:** A single-weight, 24px, two-colour icon per scenario, **all built from the same eight
primitives** (a wave, a clock, a bolt, a flame, a padlock, a coin, a paper, a person). The icon appears
on the job-board ticket, the timeline-ribbon marker, the postmortem, and the achievement. **Fifty
icons from eight primitives is an afternoon of work and it makes the scenario library feel like a
set.**

---

## 1.11 Campaign metagame and topology

*New in wave 2: where you go next, who remembers you, and what the level-select screen actually is.*

### The Spine and the Sidings
A campaign structure that supports the variety engine without fragmenting.

**How it works:** The **spine** is the scale ladder (Tier 0 → 6): mandatory, always
web/infrastructure-flavoured, always teaching a new core system. The **sidings** are hosting-type
levels: after each spine level you choose one of two or three type levels, and **the one you pick
permanently adds that line to your company.** You physically cannot play them all in one run, **which
makes the campaign map a *build* rather than a checklist** and gives replay a reason.

### The Pivot Map (the campaign is a node map, not a line)
**How it works:** Finishing *Shared Hosting* opens three doors: *VPS* (up-market, same customers),
*Game Servers* (new customers, harsher latency), or *Email/DNS* (cheap, reputational hellscape). You
pick. You can come back later. **Nodes you skip stay visible so the player feels the shape of the
industry they're not in.**

### The Campaign Market Map (where you expand, not just what you build)
**How it works:** Between chapters, the campaign shows a map of *markets*, not levels: **regions ×
hosting lines**, each node showing demand, competition heat, regulatory weather, and power price. You
choose your next node. Choosing a node **adjacent** to one you already hold gives a **carry bonus**
(shared staff, shared network, shared reputation); choosing a distant node gives higher reward and
starts you cold. **Competitor AI expands on the same map between chapters, and nodes you ignore get
taken.**
**Why:** it makes the hosting-type choice a *strategic* decision instead of a content playlist, gives
the Competitor AI somewhere to live between levels, and makes the Portfolio Meter a consequence of
navigation rather than a stat.

### Branch-and-Merge campaign topology
How choices diverge without tripling the content budget.

**How it works:** The campaign branches at act boundaries into two or three paths of 3–4 levels each,
then **merges at the next act boundary onto a shared level that is *modified* by which branch you
took** — different starting assets, different customers, different scars. **Two branches × three acts
= six paths through eight authored levels.** Cheap, and it makes the campaign feel personal.

### The Campaign Spine as a Patch Panel
The campaign map, drawn.

**How it looks:** A **patch panel on the office wall.** Each level is a labelled port; completed levels
have a cable plugged in; branches are visible as where cables can still go. Hosting-line unlocks add a
whole new panel row with its own colour band. The **Line Draft** deals you three unplugged cables and
you choose which port to seat. **The cable you plug in stays plugged for the rest of the run, so the
panel is a record of your route.**

### Level Select as the Job Board
A companion to the patch panel for scenario levels.

**How it looks:** A corkboard of printed tickets, work orders and faxes — each scenario is a piece of
paper with an era-appropriate letterhead, a priority stamp, a customer name and a deadline. Completed
ones are **spiked on a bill spike in the corner.** Cheap, diegetic, and it reuses the ticket art the
ticket generator already requires.

### The Retrospective Level Select
A level-select screen that is your own company history.

**How it looks:** Instead of a node map, the level select is a **timeline of your company** with levels
as events on it, annotated with what happened (the outage, the whale, the pivot). Replaying a level is
"revisiting" it, and **the timeline visibly rewrites itself if you get a different outcome.**

### The Recurring Cast
Five or six named NPCs who persist across the whole campaign with actual arcs. **The cheapest possible
way to give a systems game a story.**

**How it works:** **The first customer** (still tiny, still paying $10, still referring people) · **the
rival operator** (the competitor AI with a face, who you will eventually buy, be bought by, or partner
with) · **the account manager at your transit provider** (whose goodwill is a real resource) · **the
auditor** (the same person every year, whose opinion accumulates) · **the journalist** (who writes
about you three times across the campaign, and whose last article depends on the first two) · **the
engineer you hired at Tier 1** (who becomes your CTO or leaves, based on how you managed them).
Reputation with each is tracked separately. All six are **spine cast** (§1.6), so every callback is
safe under a branching campaign.

### The Cold Open Level (the actual first five minutes)
Opening on powerlessness is a risky first impression. **Open on the destination instead.**

**How it works:** Open on **the last thirty seconds of a success**: a site you built handling a spike
beautifully, everything green, coins arcing, the camera pulling back — then a title card: **"Eighteen
months earlier."** Cut to Tier 0. The player has now *seen* the thing they're working toward and has a
reason to endure the quota bar. **A standard technique that converts the powerlessness tutorial from a
risk into a setup.**

### Chapter Epigraphs
Each act opens with a single true sentence about the industry. No cutscene, no exposition — one line
on black.

**How it works:** *"Every hosting company is one customer away from being a different hosting
company."* · *"Nobody buys backups. Everybody buys restores, once."* · *"The cheapest hosting in the
world is still more expensive than free, and free has a sales team."* **Tone-setting for the price of
a text file.**

### The Ratchet Audit (a level that tests only your carried-over automation)
**How it works:** Roughly once per chapter, a level gives you **no build budget at all** and no new
tech. It is a stress test of everything you automated, documented, and pre-configured in previous
levels. **The score is a straight readout of how much of the level ran without you.** It is the only
level type where the *ideal* play is to do nothing and watch.
**Why:** `The Long Weekend` is exactly this idea used once. **Make it a recurring institution and it
becomes the campaign's report card on whether the player is building an *operation* rather than
hand-flying a stack.**

### "The Same Company, Five Years Later" (time-skip levels)
**How it works:** Occasionally the campaign jumps forward. Your board comes back with hardware aged one
tier down the cascade, two staff gone, three undocumented changes made by people who are no longer
here, one customer grown 8×, and a compliance requirement that didn't exist. **You did not make these
changes; the simulation did, using your own habits as its model.** A player who never documented gets a
fogged board; a player who documented gets a board with notes.
**Why:** it turns "your past self is the boss" from a one-off gag into a recurring structural device,
and it is the most honest possible expression of Pillar P10.

### Lead Time as a first-class progression axis
**How it works:** Add a persistent **Lead Time Board** — a pipeline showing everything you have ordered
and when it arrives: hardware (2–12 weeks), circuits (60–120 days), cross-connects (5–20 business
days), an audit slot (a quarter), a new hire (6–12 weeks to start, 3 months to useful), a licence
(instant), a building permit (a year), a transformer (104 weeks).
**Why:** build time elsewhere in the design is measured in seconds-to-minutes. **Real hosting is a
business where the most important skill is ordering things before you know you need them**, and that
is otherwise unmodelled. **Making lead time visible and long converts panic-buying into planning.**

### The Rebuildability stat
A per-machine number: **hours to rebuild this from bare metal, from scratch, without the original
person.**

**How it works:** Snowflakes score 40; config-managed nodes score 0.5; the Legacy Box scores
**"unknown."** It is the single cleanest measure of technical debt, it is directly improved by config
management / golden images / documentation, and **it is the number that decides whether the correct
response to a compromise is "clean it" or "burn it."** `Post-Breach` becomes far more interesting when
rebuild cost is a known per-machine figure rather than a generic penalty.

### Redundancy grammar as a progression ladder
Teach the actual vocabulary as tiers you climb.

**How it works:** **N → N+1 → N+2 → 2N → 2N+1 → concurrently maintainable → fault tolerant.** Each step
is a purchase and each has a precise meaning the game can enforce: *concurrently maintainable* means
you can take **any single component** out for service **without losing redundancy**, which is a
genuinely different (and more expensive) property than merely having a spare. **A facility marketed as
2N that is not concurrently maintainable is a real and common lie**, and catching it in an acquisition
level is a great beat.

### Ratchet Progression (knowledge is never lost; capacity is)
**How it works:** You never lose unlocked *knowledge*, but you can lose *capacity*. **A failed level
costs assets, not tech.** This is what keeps the Failure Ladder (§1.7) from becoming a spiral.

### Seeded Weekly Ruleset
**How it works:** A weekly generated combination — **hosting type × era × two affixes × one contract
shape** — expressed as a 6-character share code. Everyone plays the same one. **The *generator* is the
content, and it costs almost nothing because the ruleset card is already data.**

---

## 1.12 New level shapes and business-layer levels

*New in wave 2: structures nobody used, plus the commercial levels that make the business layer a game
rather than a HUD. (Money-shaped scenarios that fit the existing scenario convention — `Rolling
Reserve`, `Debanked`, `Collections Week`, `The Nexus Letter`, `Ratio`/`Peering Ratio`, `Export
Control` — live in §1.5.)*

### The Decommission
A level whose objective is to **turn something off, completely and safely.**

**How it works:** Sunset a product line, close a region, or retire a platform. You must migrate or
terminate every customer, prove every piece of data is destroyed (or handed back), cancel every
contract **in the right order**, and not break the six things you discover were secretly depending on
it. **The failure state is not an outage — it is finding out in three months that it's still
running**, or that you cancelled the circuit before the migration finished. Scored on completeness and
on how few customers you lost on the way out. **A brilliant tonal counterpoint to a genre entirely
about building**, and it exercises the Undocumented Dependency system harder than anything else.
**Interacts with:** §5.7 The Abandoned Wing, §3.9 The Controlled Shrink, §1.5 `The Decom` (the
melancholy visual version).

### The Scream Test
A decommissioning level with one specific, real, perfect verb.

**How it works:** You have 40 machines and a mandate to remove 15. **Nobody knows what most of them
do.** Your tools: read the docs (stale), check netflow (if you bought it), check the switch's MAC
table for activity, ask around (costs hands, returns opinions), or — the real technique — **unplug it
and see who screams.** The **Scream Test is a literal action**: power the machine off, wait a
configurable number of in-game days with a visible timer, and if nothing screams, unrack it.
**The cruelty is the tail:** some things only run monthly, quarterly, or at fiscal year end. **A
machine you passed on a 7-day scream test takes out payroll 25 days later.**
**Win condition:** decommission the target count without a customer-visible incident.
**Why it's great:** the only level in the genre where the verb is *removing* things, it is exactly how
this is actually done, and it teaches dependency discovery better than any tutorial.

### The Reconciliation
An inventory level. Your asset database says 214 servers. The floor has 209. Find the difference.

**How it works:** Walk the aisles at Z1, read asset tags, scan barcodes, compare to the CMDB. Some
machines are **physically present and not in the database** — nobody billed for them, you have been
giving away capacity. Some are **in the database and not present** — you have been paying colo, power,
support contracts and licences on **ghosts**. One is present, in the database, and **belongs to a
customer who cancelled fourteen months ago.** Ends with a financial adjustment in both directions and a
permanent unlock: **automatic asset reconciliation**, which quietly saves money every month for the
rest of the campaign.
**Comedy payload:** the machine nobody can find is behind a cable tray, mounted sideways, with a label
in another company's font.

### The Dry Run
You build the whole thing, and then it doesn't happen.

**How it works:** You prepare for an event — a launch, a migration, a tournament, a Black Friday — and
at the last moment **it is cancelled or postponed.** The level scores you on *preparation quality*
against a simulated version of the event that the game runs invisibly and then reveals. **Teaches that
preparation has value even when nothing happens, which is the hardest lesson in operations and one no
game has tried to teach.**

### The Second Opinion
You are a consultant brought in to assess someone else's infrastructure.

**How it works:** **You cannot change anything.** You can only inspect, measure, interview and write.
Your deliverable is a **findings report**: you place markers on the board identifying risks, ranked. At
the end the game fast-forwards six months and shows what actually broke; you're scored on what you
flagged, what you missed, and — crucially — **how many things you flagged that never mattered (false
alarms cost credibility).** Pure diagnosis, zero building, extremely replayable, and **it uses the
entire threat bestiary as an answer key.**

### The Handover
A level split across two operators.

**How it works:** The first half you build and operate. Then the level **changes hands** — the
simulation continues, but the second half is played by "the next shift," an AI (or, in co-op, another
player) **who only knows what you documented.** The score is theirs, and it's yours. **The only thing
that transfers is what you wrote down.** **This makes documentation an actual mechanic rather than a
buff**, which the rest of the design wants and never achieves.

### The Fleet Week
A level with no board at all — only a spreadsheet and a calendar.

**How it works:** Pure capacity planning. You order hardware, power and bandwidth for the next twelve
months against a demand forecast **with error bars.** Lead times are 8–40 weeks. You commit, and then
the game runs the year in 90 seconds and shows you where you were short and where you wasted.
**Deliberately, gloriously un-tower-defense — and it is genuinely the job at Tier 5.**

### The Bake-Off
Two architectures, same traffic, side by side.

**How it works:** The screen is split. You build two different answers to the same problem with **the
same budget** and run **the same traffic** through both. The level is a controlled experiment and the
score is the difference. **The best possible teaching device for "scale up vs scale out," "chokepoint
vs mesh," "cache vs capacity,"** and every other architectural fork.

### The Inherited Contract
You must honour a promise you did not make.

**How it works:** The level opens with a signed SLA, a customer list and an architecture that **cannot
meet it.** You did not sign it; the previous owner did, or your own sales team did, or you did two
levels ago. You must **reach the promise**, **renegotiate it** (a costed conversation), or **breach it
deliberately** and manage the fallout. **Three legitimate paths, no correct one.**

### The Two-Timeline Level
A level intercut between "now" and "eighteen months ago."

**How it works:** You alternate between an incident in the present and the decisions that caused it in
the past — **and your past actions change the present state of the board mid-level.** The pedagogical
payload is Pillar P10 (nothing has an immediate result) rendered as *structure* rather than as a delay
timer. **Used once, near the end of a chapter, it is the most memorable level the game could ship.**

### The Long Now
A level that runs ten in-game years in twenty minutes.

**How it works:** The clock is aggressive and every decision is long-horizon: lease renewals, hardware
generations, staff careers, technology transitions, a certification ladder. **Incidents happen
off-screen and are reported as summaries.** A strategy layer without an operations layer, and **the
ideal transition into each new era.**

### The Postmortem Level
You play the *investigation*, not the incident.

**How it works:** The outage already happened. You have logs, graphs, a chat transcript, **three
conflicting eyewitness accounts**, and a publication deadline. You reconstruct the timeline by placing
events on a rail, identify contributing factors — **plural: the game should never accept a single root
cause** — and write the corrective actions. **Your corrective actions become *actual unlocks* and
*actual obligations* in later levels.** This turns the postmortem minigame into a full level type and
gives the game its most distinctive single mode. See also §1.5 `The RFO`, which is the contractual,
customer-facing version with a five-day clock.

### The Sales Engineer's Nightmare
A level where your job is **to say no.**

**How it works:** A stream of prospective deals arrives, each attractive, **each containing a
commitment you cannot meet** — a 4-hour RTO you can't deliver, an on-prem requirement, a custom SLA, a
compliance regime you don't have, a price below cost. You may accept any of them. The level runs six
months forward and shows what each acceptance did. **Teaches that the most profitable thing a hosting
company does is decline business.**

### Column Fodder
An RFP level you are structurally going to lose, and **the skill is figuring that out fast.**

**How it works:** Five RFPs land. Each costs pre-sales engineering hands to respond to — a real cost of
40–120 hours of senior time for a serious enterprise response. Hidden stats: **incumbent present /
absent**, **spec written from the incumbent's datasheet**, **procurement's required-vendor-count**
(they need three bids to renew the incumbent), **budget already allocated to a competitor**, and
**champion strength**. You can spend a small amount to **qualify** — one phone call that reveals one
hidden stat. **The win condition is a positive return on pre-sales hours, which usually means
declining three of the five.**
**Why it's a level:** "no-bid" is the most valuable and least intuitive sales skill, and a game can
teach it in nine minutes.

### The Capacity Auction
A multi-bidder negotiation level.

**How it works:** Power, space, transit, GPU allocation or IP blocks come up for sale and several AI
competitors bid. **You have imperfect information about their needs. Winning at the wrong price is
worse than losing.** Runs five minutes, slots anywhere, and gives the Competitor AI something to do
other than undercut you.

### The Regulator's Sandbox
You are given a rule and must design around it.

**How it works:** The level opens with a new regulation (data residency, energy reporting,
accessibility, lawful intercept, hardware provenance) and **no other objective.** You must reach
compliance without losing more than X% of customers, and the real difficulty is **interpreting an
ambiguous rule** — the game gives you a genuinely ambiguous text and **three plausible readings, each
with a different cost, and only tells you which was right at the audit.**

### The Rate Card
A whole level where you never place a server: **you build the price book.**

**How it works:** You're handed your real cost inputs — server capex and depreciation, blended
bandwidth cost per Mbps, power at $/kWh × PUE, licence per account, support minutes per account per
month × loaded hourly rate, payment-processing take, and a CAC figure per channel. You must author a
rate card: **how many plans, at what price, at what term (monthly / 12 / 24 / 36), with what renewal
price, what's included, what's an add-on.** The level then **simulates twelve months against that card
in ninety seconds** and shows the resulting mix, margin, churn and support load. You get three attempts
and must ship one.
**Why it's a level and not a menu:** every operator's first real crisis is discovering their $2.95 plan
is unprofitable at ticket volume, **and the only way to feel that is to have authored the number
yourself.**
**Interacts with:** §4.9 Pricing Engine (this is that object promoted to a level), §6.3 cost-to-serve,
§6.5 packaging, §3.5 archetypes (**the card decides which archetypes show up at all**).

### Due Diligence (the level where you are the one being read)
Not `Sell the Company` (§1.5, the twelve months before). This is **the eleven weeks after the LOI.**

**How it works:** A buyer's analyst NPC sits in a data room and issues **requests, not attacks.** *"Send
us MRR by customer for 36 months." "Reconcile your billing system to your bank statements." "List every
customer with a change-of-control clause." "Provide your last three years of tax filings." "Explain the
$41k of revenue in the P&L that isn't in the billing system."* Each request costs hands and time; each
one you can't satisfy becomes a **finding**, and each finding either **knocks a turn off the multiple**,
**moves money into escrow**, or **converts purchase price into an earnout.** The level is won on final
**proceeds**, not headline price.
**The joke and the lesson:** everything you skipped for five levels — documentation, clean books, signed
contracts, a customer list that matches the invoices — is now literally line-itemed against you.
**Interacts with:** §6.9 diligence report (which becomes the *output* of this level), §9.2 "The Investor
Dashboard Lie," §6.7 acquisition offer, §1.6 The Multiple, §1.6 Scars (disclosure choice).

### Consent to Assignment
An acquisition level where **the customers can legally refuse to come with the deal.**

**How it works:** You buy a competitor. Their enterprise and government contracts contain
**change-of-control clauses** requiring the customer's written consent to assignment. You have 60 days
to collect consents. Each one is a conversation: they'll consent if you commit to the existing price for
24 months, or add an SLA, or fly out and meet them. Consents you don't get either terminate or revert to
month-to-month at the customer's option — **and the ones who revert are exactly the big ones.**
**The reveal:** your purchase price was computed on revenue you may not actually be buying. **Which is
why escrow and earnouts exist.**

### The Book Sale
You sell *part* of the company: one customer book, one line, one region.

**How it works:** Divesting the shared-hosting book to fund the GPU build. Mechanics: **which customers
transfer** (some contracts don't assign), **what you keep** (the domains? the IP space? the brand?), a
**non-compete** that locks you out of that segment for 3 years, a **TSA** (transition services agreement
— you run their platform for them for 9 months, for a fee, with your staff, which is a hidden cost), and
**the staff who came with the line and now have nowhere to go.**
**Why it belongs:** selling a line is **how most hosting pivots are actually financed.**

### The Ramp
A colo/wholesale level built on a contract shape nobody has modelled.

**How it works:** You sign a tenant for 20 cabinets — **but colo deals ramp.** Cabinets 1–4 bill from
month 1, 5–10 from month 7, 11–20 from month 13, with a **3-month free-rent concession** at the front
and a **tenant-improvement allowance you pay up front.** Meanwhile you must **reserve all 20 cabinets'
power and space from day one**, so you carry 16 empty cabinets of stranded capacity for a year against a
utility lease you already signed. Then the tenant asks to **delay the ramp** because their own project
slipped. **Do you hold them to the take-or-pay, or preserve the relationship?**
**Failure texture:** you sell a second tenant into the reserved space to stop the bleeding, the first
tenant's ramp accelerates, and you can't deliver.

### Anchor Tenant
A single prospect wants 40% of your suite at a 35% discount on a 7-year term.

**How it works:** Introduces the **concentration risk meter.** Taking it makes you **instantly profitable
and permanently hostage.** **Win: either land it with protective terms, or fill the same space with six
smaller tenants before the quarter ends. Both are valid wins with different scores.**

### Take-or-Pay
A contract-shape level.

**How it works:** You sign a customer to a **minimum monthly commit** — they pay for 400 Mbps whether
they use it or not, or 10 cabinets, or 200 GPU-hours. Then they use 40%. **Every month you book pure
profit on unused commit *and* watch their satisfaction meter drain**, because paying for nothing is how
customers decide to leave. At renewal they demand a right-size and a credit for the unused portion. **Do
you enforce the contract or protect the renewal?** Meanwhile **you signed a take-or-pay of your own with
your transit provider, sized for a customer who's using 40%.**
**Interacts with:** §3.9 client cards (add a `commit` field).

### Kilowatt Casino (power resale and demand response)
**How it works:** Introduces **stranded capacity** (you sold RU you can't power, or power you can't
cool), **utility demand response** (get paid to shed load during grid peaks — an actual revenue line),
and **time-of-use pricing.** Harder: **a heat wave raises both your cooling draw and your power price
simultaneously.** Win: hit a PUE target and collect a demand-response payment **without breaching a
single tenant SLA.**

### Interconnect Queue
The single most real datacenter constraint of the mid-2020s, and one nobody can buy their way out of.

**How it works:** You have customers, capital, and land. **You do not have power**, because the utility's
interconnection queue for a new 10MW service is **30–48 months.** The level is played **on a calendar,
not a floor plan.** You can: **(a)** wait, **(b)** buy an existing site with energized power at 3× the
price, **(c)** take a smaller interim service and phase, **(d)** go behind-the-meter with on-site
generation (expensive, permit risk, emissions limits on runtime hours), or **(e) buy a competitor for
their substation capacity rather than their customers.** Meanwhile your signed backlog has install-date
penalties.
**Why it's great:** it makes "capacity" a thing you queue for **years** ahead, which is exactly the
altitude shift Tier 5–6 needs.

### Backlog
A level scored on **installed** MRR, not **signed** MRR.

**How it works:** Sales has sold well. You have $180k of **signed-but-not-installed** MRR sitting in a
queue. Each order needs hardware (lead time), rack space, power, an IP allocation, provisioning hands,
and **a customer who actually returns your emails to schedule the cutover.** Every month an order sits in
backlog is a month of revenue you'll never get, plus install-date penalties on the committed ones, plus
the risk the customer cancels. **Meanwhile sales keeps selling, because sales is compensated on
bookings.**
**The systemic joke:** your two departments are optimizing different numbers, and the game makes you
watch it.

### Price Increase Day
The most terrifying ordinary day in a subscription business.

**How it works:** You need +12% on the base. Decisions: **who's exempt** (grandfathered), **notice
period** (30/60/90 days — contractually mandated for some), **at renewal only or across the board**,
**paired with added value** (a free backup tier) **or taken naked**, **whether sales gets discount
authority to save accounts**, and **what the save-desk script is.** Then you watch the response arrive
over ninety in-game days as a wave: tickets on day 1–3, cancellations clustering at each customer's
renewal date over the following twelve months, a review spike, and **one competitor running a "switch
from [you]" campaign within a week.**
**The cruelty:** revenue goes up immediately and churn arrives for a year, **so the level's score is only
visible at the end of the *next* level.**
**Interacts with:** §1.5 `The Price Hike` (which is the *vendor* doing it to you — this is you doing it
to them), §6.5 grandfathering, Pillar P10.

### The Sunset Letter
You are deprecating a platform 4,000 customers live on.

**How it works:** Write the letter (**tone is a mechanic**: apologetic / factual / opportunistic), choose
the runway (90 / 180 / 365 days), choose the migration incentive (free migration, price freeze, a
credit), and then run the migration wave while **the letter itself generates a churn pulse, a press
pickup, and a competitor campaign aimed directly at your sunset date.** The optimal answer is almost
always **longer runway, better incentive, less money now** — and the game should let players discover
that by getting it wrong once.

### The Insurance Renewal
Your cyber insurer's underwriting questionnaire, as a level.

**How it works:** Renewal is in 30 days. The carrier's requirements have changed: **MFA everywhere, EDR
on every endpoint, immutable/offline backups with a tested restore in the last 12 months, a written
incident response plan, and no end-of-life operating systems in scope.** You must reach that *state* — a
compliance-level ruleset where **the clipboard is an actuary** — or be non-renewed, which cascades:
several enterprise contracts require you to carry cyber cover, **so losing insurability loses
customers.**
**Why it's brilliant:** it converts boring ops hygiene into a **contractual sales prerequisite**, which
is exactly what has happened in the real market and is a far better motivator than a security score.

### Revenue Assurance Week
A level where the objective is to **find money you already earned.**

**How it works:** No threats. You audit your own billing: services provisioned but never billed,
upgrades applied but never repriced, promotional rates that were supposed to expire and didn't,
customers who cancelled but whose VMs are still running and costing you power, free/internal/comp
accounts nobody audits, bandwidth overages never invoiced, and cross-connects installed on a ticket with
no billing record. **Every finding is real recovered MRR. Real hosts leak 2–5% of revenue this way; some
leak 8%.**
**Mechanically:** a hidden-object game played against your own asset database, **and the reward is a
permanent MRR bump that costs nothing — which makes it one of the most satisfying levels possible.**
**Interacts with:** §5.4 asset discovery scan (same verb, money target), §1.12 `The Reconciliation`.

### Metering Blackout
**You cannot bill what you cannot measure.**

**How it works:** Your usage metering pipeline breaks — for GPU-hours, bandwidth, egress, or invocations
— and **nobody notices for eleven days because the *service* is fine.** Now it's the 1st. Choices:
estimate from the prior period (over-bills some, under-bills others, guarantees disputes), skip billing
the usage component (a clean 20% revenue hole this month), reconstruct from partial telemetry (hands +
time), or bill next month double (bill shock). Whatever you pick, a fraction of customers dispute and
**your DSO blows out.**

### The QBR
A quarterly business review with your largest account, as a 6-minute set piece.

**How it works:** You present: uptime against SLA, incident summary, ticket volume and response times,
capacity trend, roadmap. They present: their gripes, their growth plans, and — **in the last two minutes
— a competitor's quote.** You have a small budget of concessions (a credit, a free upgrade, a named
engineer, a price hold) and a hidden churn-risk number you're trying to move.
**The lesson: the account you never talk to is the account you lose**, and the QBR is cheaper than the
save offer.

### The Recommended Host
The most valuable acquisition channel in real hosting.

**How it works:** A major platform (a CMS foundation, a framework, a game publisher, a control-panel
vendor) maintains a short **"recommended hosts" list. Being on it is worth more than every ad channel
combined**, and costs a mix of money, engineering contribution, dedicated support commitments, and
**political relationship management.** The level: win the slot. Requirements are a mix of **measurable**
(performance benchmarks on their test suite, uptime history, support response SLA) and **unmeasurable**
(sponsorship, contributing engineers upstream, not being the host that generated their worst support
thread last year). **You can also be *removed* from the list, which is a cliff.**

### The Partner Turns
The follow-up, three levels later: **the platform launches its own hosting product.**

**How it works:** Overnight, your best channel is your biggest competitor, with distribution built into
the product your customers already use. Responses: differentiate on support and specialization, go
multi-platform, acquire a competitor on a rival platform, or **become an OEM supplier *to* the platform**
— sell them wholesale capacity and give up the customer relationship: profitable, safe, and a slow
death. **There is no good answer, which is the point, and it is exactly what happened to every WordPress
host, every Shopify-adjacent host, and every VoIP reseller.**

### The Agent
A channel level built on the telecom master-agency model, which is enormous and otherwise absent.

**How it works:** Independent agents/master agencies sell colo, VoIP, transit and managed services on
**residual commission for the life of the contract** — typically 10–20% of MRC, forever, paid monthly.
They bring you deals you'd never see. They also **own the customer relationship**, shop the same customer
to three of your competitors simultaneously, demand you honour their commission after the customer
renews with you directly, and **will move their whole book if your commission portal is bad.** Winning
the level is **signing agents, not customers.**
**The twist:** agent-sourced revenue has a permanently lower margin and a permanently higher renewal
risk, **and it looks identical to direct revenue on the MRR chart** — which is exactly the "revenue has a
colour" thesis in level form.

### Repatriation Season
The market-tailwind level.

**How it works:** A wave of prospects arrives who are leaving a hyperscaler over cost. Each one comes
with: **a 3-year TCO spreadsheet they built themselves** (which you must engage with, line by line, in a
negotiation minigame), an unexpired **committed-spend agreement** that penalizes them for leaving early
(so the deal can't close for 7 months — **you must nurture a lead on a calendar**), **egress fees to
escape** (which *you* may offer to pay — a real and effective tactic), and an engineering team that **has
forgotten how to run infrastructure and will generate 4× normal support load for six months.**
**Win condition:** net-positive contribution margin in month 12, **not signed ARR.**

### Offshore
A support-economics level, handled with care and honesty.

**How it works:** Support cost is eating your margin. You can stand up a support pod in a lower-cost
region: cost per ticket drops from ~$9 to ~$3, **but ramp time is 90 days of *worse* service**, timezone
coverage improves, some customer segments react badly, and **the knowledge that used to live in three
senior people's heads now has to exist as written runbooks or it doesn't transfer.**
**The mechanic is that offshoring only works if you already did the documentation work** — a real and
non-obvious truth.
**Tone note: the joke is never the offshore team; the joke is the executive who thinks headcount is
fungible.**

---

## 1.13 Level modifiers and mutators

*New in wave 2: drop-in constraints that reshape any level without authoring a new one. They are how a
campaign gets texture variety at near-zero content cost, and they are the raw material of the Seeded
Weekly Ruleset (§1.11).*

### `Skeleton Crew`
Half your staff, **double the action cooldowns.** Holiday week. The gentle version of `The Long
Weekend`.

### `Founder's Vacation`
A hard cap on the number of **manual interventions** for the whole level; you must pre-build
automation. **Forces the player to use systems they'd otherwise micro past.**

### `Cash Only`
No credit, no financing. Every purchase comes from revenue. **A brutal tempo lesson** and the cleanest
possible demonstration of the difference between profit and cash.

### `Frozen Change`
An audit or a code freeze **bans new construction for N shifts** mid-level. Pairs with the Constraint
Band hazard tape (§1.10).

### `Hostile Upstream`
Your transit provider is being acquired and is unreliable; **random upstream blackholes you must route
around.**

### `Price War`
A competitor undercuts you by 40% for the whole level; **your only lever is quality/differentiation.**

### `Viral Moment`
One customer blows up. **You can cash in, or protect everyone else.** Not both.

### `The Tour`
A prospective whale tenant walks the floor **during peak.** **Cosmetic damage — a cable mess, a warm
aisle, a visible alarm — costs you the contract. Makes tidiness matter**, which nothing else in the
game does.

### `Regulatory Sunrise`
A new law takes effect at shift 7; compliance work must be done before it — **and you don't know the
exact requirements until shift 5.**

### `Heat Dome`
Ambient temperature **+12°C for the entire level**; cooling costs double and thermal margins shrink.
Every cooling decision you made earlier is now graded.

### `Fiber Seeking Backhoe`
A random shift loses one physical path entirely. **Redundancy investment either pays off or doesn't,
visibly.**

### `Deadbeat Quarter`
20% of invoices go unpaid. **The cash-flow-vs-revenue divergence lesson as an ambient condition.**

### `Patch Tuesday`
A CVE drops mid-level for a component you built on. A timer to patch; **patching risks breakage; not
patching guarantees compromise.**

### `The Whale`
One customer is **60% of revenue** and makes unreasonable demands. Keeping them distorts your whole
build. **Firing them is a legitimate, scored strategy.**

### `Ghost Ship`
You inherit a board with **no documentation** and must run it before you understand it. Pairs with
`The Acquisition` (§1.2).

### `Fire Drill`
A **simulated** disaster with no real damage — **but the score counts your response.** Low-stakes
rehearsal used to teach a mechanic before it bites for real, and the modifier version of `The Dry Run`
(§1.12).

### `Sanction Line`
A country goes on an embargo list; you must identify and cut those customers or eat a penalty. **One
of them is your best payer.**

### `Media Attention`
A journalist is writing about you. **Every incident this level counts double against reputation; every
clean shift counts double for it.**

### `Supply Drought`
You cannot buy new hardware for the entire level. **Only repair, repurpose, and optimize.**

### `Blind Mode`
Instrumentation is degraded or unavailable for the level. Constraint Band: **a dust sheet over the
graph drawer.**

### `Read-Only`
All *write* actions are disabled — no deploys, no config pushes, no schema changes, no rule edits.
Whatever breaks must be handled with traffic steering, pre-set feature flags, capacity you already own,
and communication. **Variant: you may break it once, and the game records that you did.**

### `Snowflake`
No configuration management; each server drifts individually and fixes must be applied per-object.
**Makes the player earn Ansible.**

### `Bus Factor 1`
Only one staff member knows each subsystem; if they're on vacation or burnt out, **that subsystem
cannot be touched.**

### `Boutique Managed`
20 customers paying enterprise rates with SLAs that have teeth. Low volume, zero tolerance.

### `Customer Quality Mix`
Seed the level 80% good customers or 80% problem customers. **Same systems, completely different
experience**, and the honest expression of what "difficulty" means in shared hosting.

### `Observability Debt`
A dial for how much of your infrastructure is instrumented. **Low observability means the game
literally hides information from you** rather than adding enemy HP.

### `Lead Time`
A dial for how long between ordering hardware and it arriving: **2 weeks vs 9 months.** The single most
authentic difficulty knob in the catalogue after oversubscription.

---

## 1.14 Boss-shaped events (the end-of-quarter beat)

*New in wave 2: the encounter at shift 13 of the Quarter Arc (§1.10). Every boss uses the three-phase
shape from §1.6 — **probing → the real attempt → the consequence**, where **Phase 3 happens on the
business screen**, not as more attack.*

### `The Multi-Vector Day`
Volumetric + application-layer + an insider + a hardware failure, **staggered so that each one makes
the next worse.** Tests whether the player built **breadth**.

### `Grid Down`
Utility power fails for 47 minutes. Generators, fuel, transfer switch, **and the one rack you forgot to
put on UPS.** A pure facility boss. Its crueller siblings are `EPO` and `Retransfer` (§1.5).

### `The Zero-Day`
An unpatchable exploit for a component you use. **The only counters are architectural ones you either
built earlier or didn't**: segmentation, least privilege, immutable rebuilds, a software inventory.
**Retroactively rewards good hygiene — the best kind of boss.**

### `Extortion`
A persistent attacker with a ransom demand. **Paying works, is cheap, is scored as a failure, and makes
next level's attacker pool worse. A *real* choice.**

### `The Cascade`
One small failure you ignored propagates. **The boss is your own tech debt**, and the game shows the
chain in a post-mortem replay. Pairs with §1.12 `The Postmortem Level`.

### `Audit Day`
No combat at all; a pure inspection encounter resolved by your documentation, logging, and access
controls. **Genre whiplash on purpose.**

### `The Migration Deadline`
Your datacenter's lease ends. **Move everything in 3 shifts.**

### `The Competitor's Collapse`
A rival goes bankrupt and 400 refugee customers stampede at you at once. **A *positive* boss you can
still lose to** — being overwhelmed by success is the most under-used pressure in the genre.

### `The Declaration Cascade`
The DRaaS boss: a regional event causes **simultaneous DR declarations** across an oversubscribed
standby pool, and you triage against priority tiers you sold three years ago. **The only boss whose
outcome was determined entirely by a number you set at signup.**

### `Distrust Day`
The CA/PKI boss: a root program announces that certificates you issued after date X will not be
trusted. **Your entire product stops working for everyone at once, on a schedule, publicly**, and the
only play is the reissue-and-deploy race.

### `The Broadcast Storm`
The IXP boss: one member's misconfigured router floods the peering LAN and **degrades every other
member simultaneously, and you cannot touch their gear.** Resolved entirely by port policy you either
enforced or didn't.

---

## 1.15 Era treatments and presentation devices

*New in wave 2: era is an orthogonal axis to hosting type and scale, and it is mostly a rendering and
typography problem — which makes it the cheapest content multiplier in the design.*

### The Era Shader Stack
Era is a full-screen post chain **plus** a UI skin swap, applied on top of whatever hosting-type kit is
active.

**How it works:** Five presets — **1994 Phosphor** (scanlines, bloom, 16-colour dithered, chunky bitmap
type) · **2001 Beige & Bevel** (Win95/98 chrome, grey 3D bevels, Tahoma, dithered gradients) ·
**2008 Gloss** (glassy buttons, reflections, drop shadows, Lucida) · **2016 Flat** (pure flat vector,
generous whitespace, geometric sans) · **2030 Volumetric** (dark-mode, translucent panels, subtle depth
blur, variable-weight type).
**A level set in 1996 is *visibly* 1996 before a word of text.**
**Stacking order (see §1.8):** era sets the base grade; line sets accent and material; time-of-day sets
light only.

### The Time-Lapse Wipe
Level transitions that jump eras play a **3-second continuous shot of the same room aging.**

**How it works:** Gear swaps out, cable colours change, the CRT on the desk becomes an LCD becomes
three LCDs, coffee cups accumulate, the wall gets repainted. **The best single storytelling device in
the whole game, and it costs one animated set piece per era boundary.**

### Era-Correct Failure Aesthetics
**How it works:** A 1996 crash is a blue screen with a beep; a 2008 crash is a glossy modal with a red
X; a 2030 crash is **a silent panel that just goes translucent and stops updating.** Same mechanic,
three different feelings of dread.

### The Anachronism Flag
**How it works:** If the player keeps a piece of gear across an era boundary, it renders in its
*original* era's art style — a beige box sitting in a modern black room, **visibly from the past.**
**Free comedy, free legacy-debt storytelling**, and it makes the Growth Scar (§1.1) funnier every
decade.

### The Retro Boot Screen
Era levels need a transition that isn't a title card.

**How it looks:** Loading a period level plays **that era's boot**: a 1996 BIOS POST with a memory
count, a 2005 splash with a progress bar and a gradient, a 2016 systemd scroll, a 2025 telemetry
dashboard that assembles itself. **Twelve seconds of typography doing all the work.**

### Loading Is Provisioning
Kill the abstract progress bar.

**How it looks:** The load screen is an install: `Racking… Cabling… Imaging… Configuring… Warming
cache… Bringing into rotation`, each step with its own tiny animation in the rack elevation on screen
and a green check when done. **The player learns the real bring-up order by reading load screens for
twenty hours.**
