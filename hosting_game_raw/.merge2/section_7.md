# 7. Core gameplay mechanics

## 7.1 The board: flow, topology, and the two directions

### The dependency graph IS the map
**The single most important structural decision in the game.**

**How it works:** There is no separate "level layout" and "tech stack." The thing you build — web server
connected to database connected to cache, behind a load balancer, fed by a CDN — *is* the board that
traffic walks and threats attack. Adding a component literally extends the path. **This is why the
brief's "adding a database opens SQL injection" works mechanically and not just thematically:** the
database is now a node on the map with its own inbound edge.

**The rule that makes the physical layer necessary (and not decoration):** *the logical graph
determines **what can happen**; the physical layout determines **what happens at the same time**.*
Two nodes on one PDU fail together. Two nodes in one rack heat each other. Two nodes on one switch
share a bandwidth ceiling. Two nodes configured from one template break identically. That single
sentence makes §7.3's placement puzzle mechanically load-bearing rather than flavour, and it is the
honest description of real infrastructure.
**Interacts with:** everything. §4 places nodes, §2 attacks them, §3 walks them, §5 unlocks them.
**Hosting types:** universal — the *shape* of the graph swaps per type (see §7.8).

### Two-directional flow (the core tension)
Visitors flow *in* and must reach the goal; threats flow *in* and must be stopped.

**How it works:** **They use the same pipe.** There is exactly one path network and both populations
traverse it. Every buildable on the path is a filter with two effects: it stops some fraction of
threats, and it costs some amount of visitor patience/latency/conversion. A defense that stops threats
also slows visitors; a path that's fast for visitors is fast for attackers. Classic TD has one flow;
this has two that share infrastructure, which is the design's signature. (P1, §0.1.) That means
"tower placement" is really **topology design** and "upgrading a tower" is really **tuning a
tradeoff** — far more faithful to real ops than shooting arrows at goblins.
**Tension:** ⚔️ Some designs separate the lanes for readability. Keeping them merged is harder to read
and is the whole point; the compromise is **visual separation without mechanical separation** — same
pipe, different rendering layers (§8.2). See §7.10 for the Two Lanes / Suspicion Routing resolution,
which separates them *by suspicion score* rather than by fiat.

### The Funnel (depth is a resource)
The path narrows toward you.

**How it works:** internet edge → transit → border → firewall → load balancer → service → data tier.
**A deeper funnel is more defensible and slower.** Depth is therefore a purchasable, spendable
quantity measured in milliseconds (§7.10), and "how many hops deep is my stack" is a strategic number
rather than an aesthetic one.

### The Return Path
Traffic that succeeds walks back out.

**How it works:** Visitors that are served successfully exit carrying money and satisfaction; seeing
them leave happy (or leave angry, in red) is the feedback channel. A satisfied visitor occasionally
splits into a **referral unit** at the exit. The return path also matters mechanically: asymmetric
routing, egress bandwidth costs (§6.3), and the fact that a response has to get back out through the
same congestion the request came in through.

### The mixed lane
Traffic arrives unclassified.

**How it works:** Legitimate and malicious traffic arrive in the same stream, visually similar, and your
defenses *classify* rather than simply kill. Every filter has a false-positive rate. **The fantasy is
triage, not slaughter.**
**Interacts with:** §7.10's Suspicion Dial and confidence histogram; §7.11's QoS classes, which are
the constructive half of the same idea (you cannot stop threats without hurting visitors, but you
*can* decide which visitors get hurt last).

### Service lanes (isolation as a purchasable property)
Traffic is grouped by service, not just by intent.

**How it works:** Traffic is sorted into lanes by service — web / mail / game / storage / management.
Defenses and QoS policy apply **per lane**. A threat in one lane can spill into another *only through
shared resources* (bandwidth, power, CPU, a shared hypervisor, a shared database). That makes
**isolation** a visible, purchasable, inspectable property rather than a vague virtue — and it makes
"which resources do these two lanes actually share" the question behind half the game's incidents.
**Interacts with:** §7.2's VLAN painting, §7.11's classes, §7.7's blast door.

### Capacity as concurrency slots, not HP
Servers don't have health bars; they have **slots.**

**How it works:** A server processes N requests at once. Requests beyond N queue. The queue has a length;
past that, arrivals are dropped. **This is how computers actually work and it produces far better
gameplay than a health bar** — you can be at 100% capacity and perfectly healthy, or at 60% and dying
because of a slow dependency. Structures never lose hit points; they lose **headroom**. At 100% they
queue, at ~120% they shed, at ~150% they fall over with a recovery *duration*. Failure is a state with
a length, not a death — everything can come back, which suits a business sim.

**The numbers, stated:** a node has `S` slots; a request occupies a slot for `service_time`; throughput
is `S / service_time`; queue depth is a dial; latency is `service_time + queue_wait`, and `queue_wait`
follows the hockey stick — negligible below ~70% utilisation, `service_time × ρ/(1−ρ)` above it.
Publish that curve in the Field Notes (§9.5): it is the single most useful thing anyone learns in this
profession and the game is built on it.

**The second half that completes the model:** **a slot is released only when the slowest dependency
returns.** A worker holding a slot while waiting on a database is doing no work and still consuming
capacity — which is why a slow dependency causes an outage in a service that is itself perfectly
healthy, and why the fix is a **timeout**, not more capacity. Adding "what is this slot waiting on" to
the slot ring turns the parking-lot visualisation into a *diagnostic*: **a ring full of slots all
waiting on the same downstream is the picture of the entire incident.**
**Interacts with:** §7.2's timeout bead, §7.13's tick model, §7.7's metastable failure.

### The queueing hockey-stick
The most important curve in the game.

**How it works:** Latency rises gently to about 70–80% utilization, then **goes vertical.** Running at
95% utilization is not "95% as good as 80%" — it's a different regime. Teaches headroom viscerally, once,
and the player never forgets.
**Visual:** the latency graph visibly bending upward as the utilization bar crosses the threshold —
**and a tick mark at ~75% printed on the Load Donut of every object in the game**, so the curve is
taught passively by every server you look at, not only by the one graph that shows it.

### Backpressure and the red tide
Failure propagates *backwards* along the flow.

**How it works:** When the database saturates, the web servers' connection pools fill, then the load
balancer's queues fill, then the edge. The failure **crawls upstream toward the entrance as a visible red
tide.** One slow component turning the whole diagram red, one hop at a time, is the best failure
animation in the document.
**Visual constraint:** the red tide and the cascade fuse (§7.7) are two backward-travelling red
animations and *will* be confused unless differentiated. **The tide is a wash that fills the link's
whole width and persists** (saturation: ongoing, recoverable). **The fuse is a travelling point with a
char trail that passes through** (a discrete event propagating). Different physics, different read.

### Blast radius as a first-class concept
Every node has a visible domain.

**How it works:** Hovering any component highlights *everything that fails if it fails*, plus a count.
Placement decisions become blast-radius decisions. **Turns architecture into a spatial puzzle** you can
see rather than a checklist. It should be the most-used key in the game.
**Visual — the Blast Radius Bloom:** the flooded set renders in **a single flat colour with no
gradient** — deliberately ugly, deliberately unambiguous — with a hard boundary line drawn around it
and the count printed on the boundary. Degraded-but-alive dependents tint amber. **The flood ignores
walls, rows and racks, which is the point: blast radius is not geography.**
**Interacts with:** §6.9's Blast Radius Rating, §7.3's zones and the placement-time preview, §7.7's
blast door.

### The Blast Radius of a Person
Compute blast radius for humans too.

**How it works:** Hovering a staff member highlights every system only they can safely touch, every
runbook only they have exercised, every customer relationship only they hold, and every credential only
they possess. **It is the bus-factor stat rendered in the same visual language as the infrastructure
one** — which turns key-person risk and the vacation mechanic from a number into a spatial problem you
can look at and fix.
**Interacts with:** §5's staffing, §7.6's fog, §7.14's delegation and handoff.

### Effective vs nominal redundancy
Your N+1 is a lie if both units share a failure domain.

**How it works:** The board computes **effective** redundancy and displays it separately from what you
bought. Five correlations void redundancy, and all five should be computed:
- **Shared power** — two servers on one PDU are one server.
- **Shared path** — two circuits in one conduit; two "diverse" fibres in one duct.
- **Shared software/firmware version** — two identical devices running the same buggy firmware fail
  identically. (This is where §2's switch-firmware-bug threat connects.)
- **Shared human** — both units configured by the same person from the same wrong template; both
  depending on a credential only one person holds.
- **Shared time** — both certificates expire the same day; both drives are the same age; both contracts
  renew in the same month.
It should also be computed **across all four topologies** (data, power, control, trust — §7.2), because
the most interesting version is a *trust* dependency nobody drew: two "independent" services
authenticating against one directory are one service wearing a costume.
**Visual — the Broken-N+1 Badge:** a small `N+1` badge on any pair you bought redundantly. When the pair
shares a failure domain **the `+1` is struck through** and the shared domain is named beneath it in 6pt
(`PDU-A3`, `sw-core-1`, `fw 4.2.1`). Hollow stroke if the failover has never been tested. **Three
visual properties on a 16px badge encode the entire redundancy question**, which makes it a lesson you
spot by eye rather than a stat you look up.
**A brutal, correct, teachable mechanic** — and the source of every "I thought I was redundant" moment.

### Bottleneck highlight
The board knows what your constraint is — once you've paid for it to know.

**How it works:** The current limiting component pulses or carries a marker. Fixing it moves the marker
somewhere else, forever. **Theory of constraints as a game loop**, and it means there is always an
obvious next action.
**Tension:** ⚔️ This directly contradicts §7.6's "Fog of infrastructure — you can only see what you've
instrumented." If the game always tells you the bottleneck, diagnosis (the stated core gameplay) is
solved for free. **Resolution:** bottleneck highlight is a **purchased capability** that arrives with
distributed tracing (the top monitoring tier). Before that the player has only *symptoms*. Getting it
should feel like an enormous late-game power-up — and it should still be **wrong occasionally**,
because tracing shows you where time is spent, not why.

### Topology matters: chokepoints vs meshes
Different shapes have different properties.

**How it works:** A chokepoint is efficient, easy to defend, and a single point of failure. A mesh is
resilient, expensive, and hard to reason about. **Neither is correct; the level decides.** Some scenarios
punish the mesh (cost, complexity, debugging) and some punish the chokepoint (one failure ends you).

### Multiple valid paths, and the routing rule that chooses between them
Once you build redundancy, routing becomes a policy you set.

**How it works:** Round-robin, least-connections, latency-based, weighted, sticky sessions, hash-based.
Each has a failure mode the player will discover the hard way — **least-connections sends everything to
the broken-and-therefore-fast node**, which is a beautiful real-world gotcha and should absolutely be
in the game. Sticky sessions make a node's death take its users' carts with it. Latency-based routing
chases a flapping path.
**Interacts with:** §7.10's suspicion routing, §7.11's class weights, §7.7's failover.

### Path preference and failover order
Links have priority.

**How it works:** You define primary/secondary/tertiary paths and the failover order. Getting the order
wrong is a classic real outage: the failover path was never tested and doesn't work. **Failover drills
(§4.5, §7.5) exist precisely because of this.**

### Traffic steering (routing is still a choice, even without mazing)
Multiple ingress paths you split percentages across.

**How it works:** Carriers, PoPs and regions are distinct ingress paths with different latency, cost,
capacity and defensive posture. A **traffic-steering control** splits traffic across them by
percentage. Steering *under attack* — pulling 60% off the carrier that's being flooded, accepting the
latency of the long way round — is a real-time decision with real-time consequences, and it is the
lightest-weight expression of "the player shapes the route."
**Interacts with:** §7.10 (the deep version), §6.3 (transit commits make steering an economic act).

### Saturation cascade (emergent, not scripted)
The most satisfying emergent failure.

**How it works:** A component saturates → retries increase → retries add load → more saturation. The
retry storm is not a threat card; it's your own system attacking itself. Whether a failure cascades is
determined by circuit breakers, capacity headroom and timeouts — i.e. **by things the player chose**,
which is what makes it fair. **Circuit breakers (§7.7) are the counter, and the player will buy them
the day after they learn why.** A cascade should be visually spectacular and *replayable in the
post-mortem.*

### The entrance and the goal
Where flow begins and ends.

**How it works:** Traffic spawns at "the internet" — an edge of the board — and must reach a **goal node**
that differs per hosting type (§0.2): a page render, a game-server join, a completed backup job, a
returned DNS answer, a signed colo lease. **Changing the goal node changes the whole level's shape
without changing the engine.**

### DNS is the first hop
Before anything touches your network, it resolves.

**How it works:** Resolution happens *before* your board — which means your DNS is the actual front door
of the entire path, that TTL decisions are pre-committed hours in advance (a one-way door, §7.7), and
that a DNS failure makes a perfectly healthy estate unreachable. **In a DNS-hosting level, the first
hop is the whole map.**
**Hosting types:** universal as a first hop; the entire board for DNS hosting.

### Out-of-band entry points (threats that don't use the front door)
Not every threat walks the path.

**How it works:** Most threats enter at the edge and traverse the graph. Some do not: an **insider**
spawns inside; a **supply-chain compromise** spawns at a component you built; a **physical intruder**
enters at the loading dock; a **power failure** enters from the utility feed and travels down a
*totally separate* path — the electrical tree. The existence of paths your perimeter doesn't cover is
the structural argument for segmentation, for the trust topology, and for the power overlay.
**Interacts with:** §2's threat families, §7.2's four topologies.

### Capacity as terrain
Utilisation is drawn on the board, not in a panel.

**How it works:** Each service node has a throughput and a queue. Overloaded nodes turn amber then red;
queues visibly stack up as waiting motes; visitors sitting in a red queue start leaving. **The board
itself is the capacity chart**, which is why the overlays (§7.6) are lenses on the world rather than
separate screens.

---
## 7.2 Connections: the central interaction

*The brief asks explicitly: how does the player connect a database object to a web server object on
screen? The answer this document converges on is **drag a cable between typed ports**, with
click-to-link as a permanent equal-status fallback, a schematic Wiring Mode for bulk work, and a
progression that eventually replaces drawing cables with declaring relationships. Everything below is
that answer in detail.*

### Drag-a-cable (the recommended primary interaction)
**Click a port, drag, release on a compatible port.**

**How it works:** Objects have **typed, coloured ports** on their faces — data (cyan), power (copper),
control (white), trust/auth (teal-violet), storage, out-of-band. Dragging from a port highlights every
valid target and greys the rest; incompatible targets refuse with a small bounce **plus the Placement
Refusal Icon naming why** (no free port · wrong speed · different VLAN · would cross a trust boundary ·
not in contract). Release snaps the cable into place with a click.
**Tactile, teaches compatibility without text, and the cable is a persistent, inspectable object.**

**Two additions that make the drag informative rather than merely pleasant:**
1. **Live Latency Ladder delta during the drag** — you see the milliseconds this hop will add *before*
   you commit to it (§7.10's budget is the currency; this is the price tag).
2. **The Terms Card** — on release, a card flips up for one beat showing what this link costs and
   promises: bandwidth allocated, monthly cost, latency added, SLA implication, **new attack surface**.
   Confirm with a click, Escape to abandon, hold Shift to skip the card for repeat links. The card is
   why the gesture teaches: every connection is a *dependency with terms*.

**Visual:** the cable has real **catenary sag** and settles with a little bounce; it snaps to the
nearest valid port within a radius with a magnetic tug and a click; releasing on empty space springs it
back with a whip; releasing on an incompatible port turns it red and recoils it with a buzz — **the
negative feedback is physical, not a modal dialog.** Under load the cable brightens and pulses; when
saturated it goes taut and vibrates (**FX_SagStrain**); when broken it frays and sparks at the break.

### Click-to-link (the accessibility fallback, never second-class)
Same system, no dragging.

**How it works:** Click source, click destination. Always available, keyboard-navigable, controller-
friendly, and used by the tutorial. **Both input styles must produce the identical cable** with
identical properties. **Never make the primary verb require fine motor control.**

### Wiring Mode
A schematic overlay for complex work, and a mode with an unmistakable look.

**How it works:** Hold `TAB` (or press W) and the world desaturates to ~30%: every valid port on every
device lights up as a small glowing socket, invalid ports dim out, the cursor becomes a connector end,
and the world optionally flattens to a clean schematic — boxes, labelled ports, routed orthogonal
lines, no 3D. Make connections here in bulk, rubber-band-select groups, "connect all selected to X" for
a rack of twenty machines, then drop back. **Solves the "my datacenter is now spaghetti" problem at
scale**, prevents accidental drags during combat, doubles as the diagram-export view (§8.8), and is the
natural home for a **link-health heat map**.

### The Port Row (shape-coded sockets)
Ports are readable without colour.

**Visual:** every faceplate carries a visible row of sockets with **type-coded shapes** — RJ45 a
trapezoid, SFP a slot, power a kettle-plug outline, console a tiny circle. Shape-coding works
colourblind and at small sizes, which colour alone does not.

### Ports as a finite resource — with type and speed
You can run out of places to plug things in, and not all holes are the same hole.

**How it works:** Each device has a fixed port count. Running out means buying a switch, which adds a
hop, latency, a failure domain and a power draw. **The most realistic capacity constraint in hosting,
and it produces genuinely good decisions.** You can *see* that a switch has 24 ports and 19 are used.

**Expansion — ports have a type and a speed, and mismatches are visible.** A 1G port and a 10G port are
not interchangeable; an SFP+ cage and an RJ45 are not interchangeable; **a 25G optic in a 10G port
negotiates down silently.** Make the *negotiated* speed a visible property of the link (the port LED
colour, per §4.4's switch) so §2.7's duplex/speed mismatch becomes something you can **see** rather
than something you must go hunting for. **The single most satisfying "I spotted it" moment available in
the network layer.**

### Link Objects Are First-Class (the connection is a game object, not a line)
**The most important structural idea in this section.**

**How it works:** The moment you drop the cable, a **connection object** is created with its own
properties: bandwidth, latency, current utilisation, encryption on/off, auth method, a firewall rule, a
health state — and **its own upgrades** (encryption, compression, connection pooling, circuit breaker).
You can click a *wire* and buy something. Gray failures, credential expiry, TLS, rate limits and
firewall rules all live on the connection.
**Why it matters:** **most real outages live on the connection**, not on the boxes at either end. This
makes the connective tissue part of the build rather than decoration.

### Connection contracts (the link carries the policy) and the Policy Bead Set
Configuration lives on the edge, not the node.

**How it works:** Each connection has properties you set: encrypted or not, rate-limited, authenticated,
retry policy, **timeout**, circuit-breaker threshold, connection-pool size, egress filter. **The
interesting decisions are in the relationships**, which is true of real systems.

**Visual — eight bead shapes threaded onto the cable**, readable at mid-zoom, editable by clicking the
bead: **padlock** (TLS) · **valve** (rate limit) · **fuse** (circuit breaker) · **hourglass** (timeout)
· **fan-out with a number** (connection pool) · **loop-arrow** (retry policy) · **gate** (firewall rule)
· **filter cone** (egress). **A tripped bead changes state visibly** — the fuse blows, the valve closes,
the gate drops. Configuration you can see from across the room, and failures that happen *on the wire*
rather than in a log. Beads are countable at Z2 and **collapse into one bead with a number at Z3**
(aggregate, don't shrink).

**The timeout bead is the most important one, because of a rule nobody configures correctly:
timeouts must monotonically decrease as you go deeper.** If your edge times out at 30s and your
database times out at 60s, the edge gives up while the database keeps working, the work is wasted,
**and the client retries, stacking new work on top of work already abandoned.** Render a **timeout
budget that must shrink along a path**, with a visible violation marker where it doesn't. It is real,
it is widely misconfigured, it directly causes the Retry Storm (§2), and no game has ever modelled it.

**Beads are what you actually copy.** A template's value is its beads, not its boxes. And a **bead
audit overlay** — which links are encrypted, which are rate-limited, which have breakers — is the
fastest possible way to read your security posture, far better than a per-node view. **Recommend making
the bead audit the default security overlay.**

### Contracts are cables (one gesture for technical and commercial links)
The same drag, on the business half of the board.

**How it works:** There is exactly **one connection gesture in the game**, used for both technical and
commercial links, because in hosting they are the same thing — *a dependency with terms*. Drag from a
**Customer card** to a **Service** to provision them. Drag a **Salesperson** to a **Lead** to assign
ownership. Drag an **Account Manager** to a **Whale** to establish the retention relationship. Drag a
**Partner** to a **Product** to open a channel. Drag a **Transit Provider** into your **Edge Router** to
sign a commit. The core verb of the whole game becomes: *"decide what depends on what, and accept the
terms."*
**Interacts with:** §7.15's commercial board, §6's contracts, and Contract-Driven Pathing below.

### Contract-driven pathing (contracts as level geometry)
Some links are legally, not technically, impossible.

**How it works:** Customer contracts specify *how* their traffic must be handled: dedicated hardware
(no shared nodes), a named region (data residency), a specific transit carrier, encryption in transit,
no third-party subprocessors (so you cannot put them behind your CDN vendor). These become **routing
constraints on your dependency graph**, drawn as coloured locks on links. **During an incident your
cheapest failover path may be contractually illegal for one tenant** — which is the single best
collision between the commercial and operational halves of the game.
**Hosting types:** strongest in regulated, enterprise, colo and EU-residency levels; present everywhere.

### Link health rendering (and the non-colour channels)
Cables show their state.

**Visual:** idle (thin, dim) · flowing (brightness and dash-speed ∝ throughput, with directional pulses)
· congested (amber — **and the pulses visibly bunch up**, a motion channel) · failed (dark grey, **and
dashed and slack**, a shape/physics channel, with a break spark) · draining (**chevrons moving away from
the node**) · encrypted (a subtle braided **texture**) · tripped breaker (a visible gap with an arc
glyph). Giving every state a non-colour channel means **the entire cable language survives greyscale**,
which is the stated accessibility rule. **You should be able to diagnose a network by looking at the
cables from across the room.**

### The Packet Bead Simulation
Traffic is a flow you watch, not a graph you read.

**Visual:** traffic on cables is drawn as **beads** moving at a speed proportional to throughput and
spaced by packet rate. Congestion is beads bunching; loss is beads winking out; a stutter is packet
loss; a half-open circuit breaker is *one bead at a time* being let through to test the water.
**It is the game's main diagnostic instrument and it is not a chart.**

### Logical links are dashed; physical links are solid
Never confuse "plugged in" with "configured."

**Visual:** relationships that are not cables — "this app uses that database," "this LB pool contains
these nodes" — draw as **dashed cyan arcs on the Signal layer**, floating, never as physical cable.
Physical = solid and in-world. Logical = dashed and floating. One glance tells you which kind of
dependency you are looking at, which is the precondition for the next entry mattering.

### Physical vs logical vs documented: three views that can disagree
**The best idea in this section.**

**How it works:** Toggleable views of the same objects: the **physical** cabling (what *is*), the
**logical** topology (what it *does*), and — the third view that disagrees with both — the
**documented** map (what you *think*). **The gaps are where bugs live.** The logical diagram says the
database is redundant; the physical view shows both servers on one PDU; the documentation shows a
server that was decommissioned in 2021. Discovering a disagreement is an "oh no" moment you design for.

**The missing verb — Reconcile.** A **Reconcile** action costs hands and *updates the logical/documented
map to match reality*. Before you reconcile, your map is your **belief**; the physical layer is the
**truth**. The game should let your beliefs be wrong for a long time. Every acquisition, every emergency
change, every contractor visit desynchronises them, so **"how stale is my map" becomes a tracked stat**
— a genuinely novel thing for a strategy game to measure.

**Visual — the Two Truths Toggle and the Mismatch Seam.** One key swaps the entire scene between
Physical and Logical with a **smooth morph**: each server slides from its rack position to its tier
position. Same objects, same selection, two mental models; the morph is what makes it teachable. Then a
**Compare mode** draws both graphs at once — logical as clean orthogonal routes above, physical as
sagging catenaries below, in the same frame. Where they agree the two coincide and read as one thicker
line. Where they disagree they **separate into a lens-shaped gap — the seam** — hatched, carrying a
count. Your "redundant" pair with one PDU shows a seam you can point at. **The bug is literally a
shape.**
**Interacts with:** §7.1's effective redundancy, §5.4's Cable Tracing, §2.9's undocumented dependency,
§7.6's fog.

### Two Boards, Two Scales (Rack View and Topology View)
The core navigation of the game.

**How it works:** **Rack View** is physical — U-space, power, heat, cables, front and rear elevations.
**Topology View** is logical — services, links, flows. *Placement* happens in Rack View; *wiring* is
fastest in Topology View; **Rack View is for feeling and Topology View is for thinking.** The
disagreements between them are where the best gotchas live (above).
**Tension:** ⚔️ The visual lens proposes one continuous morphing world; the designer lens proposes two
distinct board modes. Both survive if the morph *is* the transition between the two modes.

### Typed sockets: `needs` and `provides`
How the DB-to-web-server question is actually answered.

**How it works:** In the logical view, each service exposes typed sockets. A web node has
`http-in`, `db-out`, `cache-out`, `storage-out`, `log-out`; a database exposes `db-in`. **You drag from
the web server's `db-out` to the database's `db-in`.** Incompatible sockets refuse and say why. Typed
sockets are what make auto-validation, templates, declared intent and the tutorial's auto-link all
possible from one rule.

### Four topologies, one board — and how much of each you actually wire
Data, power, control and trust are separate link graphs over the same objects.

**How it works:** Toggle which graph you're viewing/editing. **Data** is the request path. **Power** has
a tree shape (feeds, PDUs, circuits) and a hard capacity. **Control** is who-can-administer-what and is
an attack surface. **Trust** is which systems authenticate to which, and is how lateral movement
propagates. **Four graphs is where the depth is**, and each threat family attacks a different one.

**The gap this raises — four graphs quadruples the wiring work — and its fix: three of the four are
mostly *painted*, not drawn.**
- **Data** is drawn cable by cable. It is the tactile verb and it stays manual.
- **Power** is *assigned*, not routed: drop a device into a rack and pick its A-feed and B-feed from a
  two-item menu. The graph is derived; the decision is two clicks.
- **Control** is *painted* — you brush an admin domain across objects.
- **Trust** is *derived* from what you built, plus a small number of explicit grants.
This keeps the depth of four graphs at the interaction cost of one — **and the interesting mistake
(your "redundant" pair on one feed) is still a two-click error you can make in half a second.**

### Adjacency bonuses, not adjacency requirements
Placement helps; it doesn't gate.

**How it works:** Connections are made by cable, not proximity — but **physical closeness gives small
bonuses**: shorter cable = lower latency; same rack = one power domain, which is both a bonus and a
risk. **Keeps placement meaningful without making the board a jigsaw.**
**The numbers, stated (deliberately small — a tiebreaker and a risk decision, never a requirement):**
same rack **−0.3ms** (+ shared power domain, + shared cooling domain) · same row **−0.1ms** (+ shared
cooling) · same room **baseline** · different room **+0.2ms** · different building **+0.4ms plus a
cross-connect** · different metro **+2–8ms** · different region **+60–160ms**.
**Interacts with:** §7.3's adjacency effects (the risk half of the same decision), §7.10's budget.

### Adjacency auto-link (tutorial-only, then taken away)
Trains the concept before charging for it.

**How it works:** In early tutorial levels, dropping a DB next to a web server connects them
automatically with a little handshake animation; inside a rack, a server placed directly under a switch
auto-patches to it with a faint auto-generated cable. Explicit cables always override. **Later levels
turn it off and the player feels the growth** — which is a much better difficulty ramp than a numbers
increase.

### Cable types and length costs
Not all links are equal.

**How it works:** Copper (cheap, short, lossy), fibre (expensive, long, fast), cross-connect (billable —
§6.6), wireless/microwave (fast in a straight line, weather-sensitive), and satellite (huge latency).
Longer runs cost more and add latency — **distance is a real number on the board**, especially in
multi-site play.
**Visual:** cable colour encodes *class* — copper/orange LAN, blue storage, green public/customer-facing,
purple management, **red for anything crossing a trust boundary**, gold/white for a billable
cross-connect, grey for out-of-band. **Thickness = provisioned capacity; brightness and flow speed =
current utilisation.** A dark thick cable is wasted money; a white-hot one is about to cost you an SLA
credit. **That one visual rule teaches capacity planning without a tutorial.** A **midpoint tag** shows
the monthly cost where one exists (`$300/mo` in gold on a colo cross-connect — the player learns
viscerally that cables can be revenue). **Dashed = unsecured/unencrypted/uncontracted**, which is what
regulated levels fail audits on; a **padlock glyph** marks a link covered by a signed DPA/BAA.

### Bundling and the trunk
The technique that keeps a 300-server room from becoming a hairball.

**How it works:** Parallel cables between the same two devices auto-merge into a **trunk** drawn as one
thicker cable with a count badge (`×4`); click the badge to fan it out. At group scale, "all web tier →
this DB cluster" draws as one thick trunk with an expandable fan-out. Bundling should also exist as a
**real bulk action** — one gesture that links N pairs — because at Tier 4+ hand-dragging hundreds of
links is the game's single largest source of tedium.

### Auto-route vs hand-route, and the Ugly Auto-Route
For players who don't want to wire — visibly.

**How it works:** By default cables auto-route through the nearest cable tray on a tidy orthogonal path;
hold `SHIFT` to hand-route through waypoints. And at the topology level an **auto-connect button** builds
a working but suboptimal topology — longer paths, worse redundancy, higher cost. **Accessibility without
removing the skill ceiling.**
**Visual — make the suboptimality visible:** auto-routed cables draw **without bundling, at slightly
wrong lengths, in the wrong colours, taking the long way round** — they look exactly like cabling done
in a hurry, because they were. They count against the cable-management score. Manually re-routing one
plays a tidy-up animation. **The accessibility option and the skill ceiling coexist because the game is
honest about which one you used.**

### Declared intent (the endgame of wiring)
You stop drawing cables and start declaring relationships.

**How it works:** At high tiers, the primary wiring verb becomes a **rule**: "this tier connects to that
tier," with the individual cables generated, drawn and *maintained* for you. New members of the tier are
wired automatically; removed ones are unwired. This is the literal progression from patch panels to
infrastructure-as-code, it is the correct answer to late-game wiring tedium, and it introduces its own
failure mode: **a declared relationship is only as good as its declaration**, and a bad one propagates
instantly to fifty machines.
**Interacts with:** §7.14's policy authoring, §4.6's config management, A7.8's fleet ladder.

### Firewall rules as gates on the cable
Security is a physical object on the link.

**How it works:** Drop a gate onto a connection and configure what passes. Too permissive → threats walk
through. Too strict → visitors bounce and you get a support ticket. **The false-positive tension
rendered as a literal gate you can see.**

### VLAN painting / segmentation
Isolation as a colouring tool.

**How it works:** Paint groups of nodes into segments; traffic can't cross without an explicit gateway.
**Limits lateral movement (§2.6) and shrinks blast radius**, at the cost of complexity and the
inevitable "why can't these two talk" debugging session.
**Visual conflict, resolved:** VLAN painting and blast/failure domains are two colouring systems on the
same board and *will* collide. **Rule: VLAN painting uses hue on the ports and cables only; blast and
failure domains use floor-level boundary lines and hatching, never object hue.** One paints the wiring;
one paints the ground.

### Dependency ghosting / the Dependency Reveal
Hover any node to see its world.

**Visual:** hover (or hold a key) and **upstream dependencies glow one colour, downstream dependents
another** — blue for what it depends on, orange for what depends on it — with an animated pulse
travelling along each arc; hold to freeze. **Instantly answers "what breaks if I reboot this"**, which
is the question every change begins with, in under a second.

### Dependency auto-discovery (fog over your own topology)
Inherited boards don't come with a map.

**How it works:** In inherited/acquisition scenarios, links are **hidden until you run INVESTIGATE on a
node**. You own a datacenter whose wiring you have to discover. Combined with the documented-view
disagreement above, this is the mechanical content of every "we bought a company" level.
**Interacts with:** §7.6's fog contract, §1's acquisition scenarios.

### Miswiring is allowed
The game never blocks a real mistake.

**How it works:** You *can* plug both power supplies into the same PDU. Nothing stops you. The game
doesn't refuse, doesn't warn modally — it quietly marks the rack as single-fed in the power overlay,
and one day the breaker trips. **Letting players make real mistakes that are visible in an overlay they
chose not to look at is the heart of the fantasy**, and it is why the overlays must be one keypress away.

### The Patch Panel and the Patch Panel Widget
Structured cabling that tidies the board.

**How it works:** Route many cables through a panel to reduce visual clutter and gain a cable-management
bonus; the cost is an extra hop and a new single point of failure. **Organization as a purchasable
tradeoff.**
**Visual:** double-clicking a patch panel opens a flat 24/48-port grid overlay where you wire fast with
the keyboard, then it collapses back into physical cables in the world. **A bridge between
spreadsheet-fast and diorama-pretty.**

### Bus Mode
Draw one cable, everything inherits it.

**How it works:** Draw to a switch, rail or bus and everything attached inherits the connection.
Prevents spaghetti at scale and is how real provisioning works.

### Templates, snap groups, blueprints and the stamp
Repetition without tedium — and standardised mistakes.

**How it works:** Save a working, wired cluster as a template; stamp it to build the whole pattern
pre-wired at a cost. **Essential at Tier 4+**, and it's also how the game teaches good patterns (the
templates you're offered are the architectures worth copying). **Blueprints can be *bad*:** a flaw you
standardised on propagates everywhere, and the fix is a fleet-wide change with its own blast radius.
Excellent, and it is the mechanical origin of "we deployed the same misconfiguration to 200 machines."

### Auto-Cable (pay a tech to do it)
A literal, thematically correct pay-to-skip-micromanagement.

**How it works:** Hire a field tech who wires it for you, **imperfectly**, for money. The result is an
Ugly Auto-Route with a human excuse. Perfect for players who want the strategy without the wiring, and
it costs exactly what it should: money and a bit of tidiness.

### Disconnect is dangerous; drain is the verb
Pulling a cable has consequences.

**How it works:** Yanking a live link drops in-flight requests. The correct action is **drain** — stop
new traffic, let existing finish, then disconnect. Drain takes time; you'll skip it under pressure;
you'll learn. **A verb that is entirely about patience** is a great thing to put in a game about pressure.
**Visual — the Drain Animation (because nobody will use a verb they can't watch):** starting a drain
plays a **dashed chevron pattern moving away from the node** along the cable, plus a translucent barrier
at the node's intake that new traffic visibly bounces off. The node's active-slot ring empties one
segment at a time; a progress arc closes. When it hits zero the cable dims and the port stud turns from
solid to hollow: **safe to touch**, marked with a green wrench. **Yanking a live cable instead plays
FX_SnapThread with the in-flight motes visibly winking out — the contrast between the two animations is
the entire lesson.**
**The Unplug Confirm:** pulling a cable that carries live traffic shows the beads *straining* and
requires a **1-second hold-to-confirm ring**. Accidental outages are prevented by a gesture, not a dialog.

### Cable management score
A small aesthetic stat with real effects.

**How it works:** Tidy cabling improves MTTR (you can find things), airflow (a cable nest blocks it),
the chance a tech unplugs the wrong thing, staff morale, and **colo tour conversion**. Messy cabling
accumulates naturally and requires a cleanup project to fix. **Rewards the thing real datacenter people
are obsessive about**, and it's photogenic.
**Visual rule:** make the score **visible as the thing itself** — a rack's tidiness *is* its render, and
the number is just that information counted. Tidying plays a genuinely satisfying snap into velcro'd
rows. And the **Ugly Auto-Route is what makes the score meaningful**: if the game routes tidily for you,
tidiness is not an achievement.

### The Mystery Cable and the toner probe
Inherited facilities come with cables nobody can explain.

**How it works:** In inherited/acquired sites, some cables exist with unknown endpoints — drawn in white
(the "temporary" colour) and disappearing into a wall. Trace one with a **toner probe minigame**: a
beeping wand and a signal-strength ring. **Pure hosting authenticity and a genuinely fun twenty-second
puzzle**, and the payoff is either "it goes nowhere" or "it is load-bearing and undocumented."

### Collapse to meta-node (readability at wiring scale)
The answer to a board with 300 objects.

**How it works:** Select a group and collapse it into a single labelled meta-node — **"Web Tier ×40"** —
that can be expanded on demand; trunks between meta-nodes carry counts. Plus a **"tidy" auto-layout
button** that arranges by tier. **Readability at scale is the #1 risk for this whole design, and
grouping is the answer.**

### Cross-connect wiring as revenue
In colo levels, the cabling *is* the business.

**How it works:** Tenants request cross-connects; fulfilling them is a physical routing task through the
meet-me room; each one becomes recurring revenue (§6.6). **The wiring minigame becomes the money
minigame**, which is a beautiful convergence.
**Hosting types:** colo, wholesale, interconnect/IX, carrier hotels.

---
## 7.3 Placement and space

### Nested grids (floor → row → rack → U)
Space has four levels and you move between them continuously.

**How it works:** A floor grid holds rows; rows hold racks; racks hold U-slots; U-slots hold gear.
Zooming moves between grids with continuous animation rather than a mode switch, so the player never
loses the object they were looking at.
**Hosting types:** every facility-based type; replaced by a **world map** for CDN/edge/game and by a
**timeline** for backup/archive (§7.8).

### Rack U Tetris — made strategic by conflicting constraints
Vertical space is a real constraint.

**How it works:** A rack has 42U. Devices occupy 1U, 2U, 4U. Rails, cable arms and blanking panels
matter. **Physical packing as a puzzle layer** on top of the logical one.
**Tension:** ⚔️ Pure packing with no strategic content is busywork, and at Tier 4 (forty racks) it is a
*lot* of busywork. **Resolution: make the five constraints conflict.** U-space wants **density**; power
wants **spread** (circuit balance); thermal wants **spread** (hot spots); latency wants **proximity**;
blast radius wants **separation**. When five forces pull in different directions on the same decision,
packing stops being Tetris and becomes a genuine puzzle. Also ship **auto-pack with a penalty** (as
§7.2 does for cabling) so it is never mandatory.
**Visual:** racks divide into 42 visible U slots with tiny numbers; devices snap to U boundaries with a
*clack*; multi-U devices show their footprint as you hover. Filling a rack neatly from the bottom is
quietly delightful.

### Power budget per circuit
The invisible constraint that bites.

**How it works:** Each rack is fed by circuits with an amperage limit, and you should only load to 80% of
rated (the derating rule). Exceed it and the breaker trips, taking everything on that circuit — including
the "redundant" partner you helpfully put next to it. **The single best placement trap in the game.**
**Visual:** a per-rack amp meter that goes amber near the derate line and red past it; live PDU outlet
sockets you drag power cords into.

### The placement loop (ghost, refusal icon, and live preview as one interaction)
*Rack U Tetris, the ghost build and the heat/power preview are one interaction and should be specified
as one.*

**How it works, start to finish:** pick up a build → **every valid rack lights its eligible U slots**;
invalid racks show their **Refusal Icon on the rack itself, not on the cursor** → the hovered rack's
**amp bar and thermal tint update live** to show what this placement *would* do, and the ghost shows the
device's **intake and exhaust as blue and red arrows** so facing it the wrong way in the aisle is
*visibly* wrong before you place it → releasing plays a two-stage rail click. **One continuous read from
pick-up to placement, no tooltips.**
**Iconographic refusal** beats a tooltip in every language and at every reading speed: a lightning bolt
(not enough power), a thermometer (too hot), a ruler (not enough U), a padlock (wrong zone), a weight
(floor loading), a fan (blocked airflow).
**Why it matters:** **the most player-respecting UI idea in §7** — no surprises, all information, still
a decision.

### The Blast Radius Preview (hover-before-you-buy)
The most useful pre-commit information the game can give.

**How it works:** While *placing* any object, the ghost shows not just power and heat but the **new blast
radius** — everything that would now die with it, flooded and counted. **A placement that increases your
worst-case blast radius shows the delta in red.** This makes §6.9's Blast Radius Rating something you can
play *toward* rather than merely be graded on, and it converts a post-hoc lesson into a pre-hoc choice.
**Interacts with:** §7.1's Blast Radius Bloom, §6.9's scoring.

### The Fit Check (why the thing didn't go in the rack)
Placement validates against physical reality, and failing costs time rather than blocking.

**How it works:** Validation covers **depth, rail type, hole type (square vs threaded), weight, PDU
clearance, cable-arm room, and airflow direction.** A failed check costs time (you go get the right
rails), not a refusal. And crucially: **a side-exhaust switch placed in a hot-aisle-contained rack is
allowed**, and silently degrades the thermals of the two devices next to it **until the player turns on
the airflow overlay and sees why.** Cage nuts, rails and the wrong-depth chassis are the most
authentic five minutes in datacenter work.

### Thermal map / hot aisle management
Heat is spatial.

**How it works:** Devices emit heat; heat pools; hot spots throttle CPUs and shorten drive life.
Hot-aisle/cold-aisle orientation, blanking panels and containment all help. **Placing a dense GPU node in
the wrong rack silently degrades its neighbours** — a consequence that is invisible until you turn on the
thermal overlay.
**Hosting types:** critical for GPU/AI, HPC, dense VPS; mild for storage/backup; the entire game for
wholesale and liquid-cooled levels.

### Airflow arrows and light airflow simulation
Make the invisible visible.

**Visual:** faint arrows show cold-aisle intake and hot-aisle exhaust; hot exhaust flows in a direction
and blocking it with a badly oriented machine creates a hot spot you can see in the thermal overlay;
blocked paths render as turbulence; containment **literally draws walls that channel the flow.** Turning
this overlay on is how the player learns why containment exists.

### Adjacency effects
Neighbours matter, for good and ill.

**How it works:** Same rack = shared power and shared failure domain. Same row = shared cooling.
Adjacent = shorter cable = lower latency (see §7.2 for the numbers). Redundant pairs *should* be far
apart; performance pairs *should* be close. **Two opposing pressures on the same decision** is exactly
what makes placement interesting.

### Zones and blast domains
Draw boundaries, pay for them.

**How it works:** Define failure domains explicitly — power domain, cooling domain, network domain,
security zone, compliance zone. Spanning them costs money and latency; not spanning them concentrates
risk.
**Visual:** floor-level boundary lines and hatching (never object hue — that channel belongs to VLANs).

### Weight, floor loading and centre of gravity
Racks are heavy and gravity is undefeated.

**How it works:** Floor tiles have a weight limit; a tile over its limit warns. Loading heavy gear at the
top of a rack makes it **visibly lean** and adds a warning glyph. A tipped rack in a seismic event is
your fault, and you saw it coming.
**Hosting types:** storage/backup (dense drives), colo (tenant gear you didn't weigh), any
earthquake-zone or upper-floor facility.

### The Floor Tile Grid, the Row Stamp and the Rack Template
Scale-up as a single gesture.

**How it works:** At Tier 2–3, racks place on floor tiles with **clearance rules** — front aisle, rear
aisle, door swing — and violations draw red hatching on the floor, so facility layout becomes a real
spatial puzzle rather than a free-placement blob. Then: **draw a rectangle and the Row Stamp lays a
whole row** of identical racks with correct aisle orientation; and **configure one rack perfectly, pick
it up as a template, and stamp copies** that build in sequence with staggered construction animations.
**Standardisation communicated viscerally**, and it is the physical twin of §7.2's blueprint stamp.

### Latency geometry (when the board is a map)
Distance is latency.

**How it works:** In multi-region levels, physical distance on the world map *is* latency; placing a PoP
closer to a population centre is the whole optimisation. The nested-grid hierarchy is replaced by a
globe, and the same placement verbs mean something completely different.
**Hosting types:** CDN, edge, game hosting, DNS anycast, satellite ground stations, financial colo.

### Placement is a commercial decision too
Space has a price, and location has a premium.

**How it works:** In colo, cabinets near the meet-me room are worth more; in CDN, PoP placement
determines which eyeball networks you serve cheaply; in exchange colo, cable length is regulated; in
wholesale, contiguous space you are *holding* for a future big tenant is space you are not selling now.
**Stranded capacity (§6.6) is a spatial failure state.**

### Move cost, downtime and legacy placement debt
You can rearrange, but not for free.

**How it works:** Moving a live device requires a maintenance window, hands, and carries a risk of not
coming back up (see §9.2's "server with 1,847 days of uptime" and §7.7's Boot Confidence). Some things
effectively cannot be moved at all. **Makes the initial layout matter** without making it permanent, and
gives every inherited facility a layer of decisions you did not make and cannot cheaply undo.

### Undo ghost
Every placement is reversible for a short window.

**How it works:** A brief undo that restores position and refunds, shown as a ghost of the previous
state. **Reduces the fear that stops players experimenting.**
**Visual — the Rewind Tape:** undo draws as a tape reel spinning backward with a brief VHS rewind smear
across the last action. **Only mechanical/build actions are undoable; time is not.**

---
## 7.4 Upgrades

### Upgrade paths, not upgrade levels
No "Level 1 → Level 2 → Level 3."

**How it works:** Each object has **branching, mutually informative upgrades** — a web server can go
toward concurrency (more slots), toward speed (lower latency per request), or toward hardening (smaller
surface). **Choice, not a treadmill.**

### Upgrades as sidegrades: every capability has a cost somewhere else
The design rule that should govern the whole upgrade tree.

**How it works:** Upgrades should be **tradeoffs far more often than pure improvements**, and the
tradeoff should usually move the problem rather than delete it:
- More RAM → more cache → fewer DB hits → **bigger blast radius per node loss.**
- Bigger drives → more density → **longer rebuild times → a wider risk window.**
- More cores → more density → more tenants per box → **worse noisy-neighbour.**
- Faster NICs → more throughput → **the bottleneck moves to CPU and you have to discover that.**
- Redundancy → higher availability → **new HA-specific failure classes** (split-brain, failover storms).
- Automation → less toil → **catastrophes now happen at machine speed.**
- A security control → lower risk → **higher latency, more false positives, more staff-hours.**
**Why it matters:** it makes every purchase a decision instead of a number, and it guarantees the
midgame is about *moving* constraints rather than removing them (§7.1's bottleneck highlight).

### Upgrades improve the ROC curve, not the damage number
How to make a defensive upgrade legible without a stat wall.

**How it works:** Defensive upgrades don't "do more damage." They **improve the classifier**: more true
positives at the same false-positive rate. The upgrade card shows the curve moving. **Every Classify
build therefore has an obvious, consistent upgrade axis — narrow the overlap** (§7.10's confidence
histogram) — and the player can compare a WAF upgrade against a bot-detection upgrade on one picture.
**Interacts with:** §7.10, §3's classification-not-destruction, §2's sophistication stat.

### Scale up vs scale out
The fundamental architecture decision, as a mechanic.

**How it works:** **Up** (bigger box) is cheaper per unit, faster to do, and increases blast radius.
**Out** (more boxes) costs more, needs a load balancer, and reduces blast radius. **Neither is correct;
the situation decides.** This one decision recurs at every tier and never gets stale.

### Tuning instead of levels
Configuration sliders as the real upgrade system.

**How it works:** Worker count, connection pool size, cache TTL, timeout values, retry counts, keepalive,
queue depth, shed threshold. Each has an optimum that **depends on the rest of your system** — so the
correct setting changes as you build. **This is what operations actually is**, and it's a far better
upgrade system than +10% damage.
**Tension:** ⚔️ Deep tuning risks overwhelming casual players — *and* the naive mitigation ("a sane
default plus an auto mode") removes the gameplay for the people who would most enjoy it. Four
mitigations, all needed:
1. **Cap at three sliders per object.** If a fourth matters, it belongs on a policy, not an object.
2. **Tuning is a *policy* by default and a *per-object override* by exception.** You set worker counts
   for "web tier," not for `web07`. Overrides are visibly marked and count against a **snowflake
   budget** — exceed it and you lose the Standardisation bonus.
3. **Suggested ranges narrow as monitoring improves.** Make this the *primary progression* of the
   tuning system: better observability literally shrinks the search space.
4. **Config snapshots** (below) so experimentation is safe.
**And expose the depth progressively, in three tiers:** **Presets** early (three named cards per object
— Safe / Balanced / Aggressive — and that is the *entire* interaction for the first three tiers) →
**Sliders** mid, unlocked per object by the relevant monitoring layer, because **you may not tune what
you cannot measure** (a beautiful gate that is also the real rule) → **Policy** late, where tuning
becomes conditional and lives in the Policy Book ("aggressive during a declared incident, balanced
otherwise"). Progressive disclosure driven by instrumentation turns a UX problem into a progression
system.

### Config snapshot and restore (as a gameplay verb)
Named save points for your configuration, not your data.

**How it works:** Take a **named snapshot** of your whole configuration — thresholds, policies, routes,
weights, shed ladders, beads. Restoring is itself a change (it settles, §7.5), takes ~40 seconds, and
**costs nothing but time.** This makes experimentation safe, which is the precondition for tuning being
*fun* rather than *frightening*. The game encourages naming them, and the names become an artifact and a
comedy source: *pre-blackfriday*, *before I touched the WAF*, *good one*, *good one v2 ACTUAL*.
**Interacts with:** §7.4's tuning, §7.3's undo ghost, §7.7's rollback, §7.5's settling window.

### Tuning cost
Changes aren't free.

**How it works:** Applying a config change consumes hands and may require a restart (brief capacity
loss). Encourages batching changes into maintenance windows — **which is exactly the behaviour you want
to teach** — and it is why the Change Budget (§7.5) has teeth.

### Soft caps and diminishing returns
Nothing scales forever.

**How it works:** Each upgrade line has a knee past which returns drop sharply, pushing you to diversify
rather than max one thing. **Prevents the degenerate single-strategy build.**

### Retrofit vs rebuild
Two ways forward.

**How it works:** Retrofitting is cheap, fast, and leaves debt. Rebuilding is expensive, slow, risky, and
clean. **The technical-debt decision, made explicit at every upgrade.**

### In-place vs replace (the downtime question)
How the upgrade is performed matters as much as what it is.

**How it works:** **In-place** is cheaper and carries rollback risk. **Blue/green** needs double capacity
and is safe. **Rolling** needs a load balancer and takes longer. **The same upgrade, three risk
profiles, player's choice.** And the coupling that makes redundancy pay twice: with N+1 you can do a
**rolling upgrade with no downtime** — a satisfying, visible one-at-a-time sequence — whereas without it
every in-place upgrade needs a window. **Redundancy buys uptime *and* maintainability**, which is
exactly how it works in reality and is rarely modelled.

### Firmware and patch cadence
A recurring chore with compounding risk.

**How it works:** Firmware and patch levels drift; skipping raises vulnerability probability visibly
(§7.5's patch lag). Applying them costs windows and hands, and occasionally a firmware update is the
thing that *causes* the outage — which is why the correct cadence is a real decision and not simply
"patch always."
**Interacts with:** §7.1's shared-firmware redundancy correlation, §2's vulnerability pool.

### Efficiency upgrades
Upgrades that reduce cost rather than increase capability.

**How it works:** Better PSUs, higher inlet temperature tolerance, containment, newer CPUs per watt,
higher-density drives. Boring, enormously valuable, and they make §6.3's power line shrink. **Making the
boring thing beautiful (§9.6) applies here more than anywhere.**

### Cross-building buffs
Some upgrades help their neighbours.

**How it works:** A better switch improves every device on it. Containment improves the whole row. A
senior hire improves the whole team. A tidy cable run improves every future repair in that rack.
**Upgrades with a radius are more interesting than upgrades with a number.**

### Physical module insertion (bolt-on upgrades are the upgrade UI)
Upgrades are things you slot in.

**Visual:** RAM sticks, drives, NICs, GPUs, a second PSU slide into the chassis with an animation and a
click. The object's front panel visibly changes: more drive lights, a different caddy colour, an added
faceplate, a new port, a fatter heatsink. **You should be able to look at a server and know its spec**,
and to read a machine's whole upgrade history off its face. **That is the entire upgrade UI** — no stat
sheet required.

### The Plating Pass and tier rim-lights
Visual feedback for changes with no physical form.

**Visual:** software-level upgrades (hardening, tuning, patching) render as a quick **sweep of light**
over the object leaving a subtly different finish — a satin sheen for hardened, a matte for patched —
which accumulates legibly. Hardware tier is encoded as a **rim-light colour** (bronze → silver → gold →
white). **Legible at any zoom**, and it makes a well-built rack look like a well-built rack from across
the room.

### Upgrade regret and the parts bin
Replaced parts go somewhere.

**How it works:** Removed components go into a parts bin and can be redeployed to a lower tier, sold
used, or kept as spares (§6.4's working capital). **Nothing is wasted, which is how hosting actually
works**, and it connects to §6.6's cascade — today's production CPU is next year's dev box is the year
after's eBay listing.

---
## 7.5 Time, tempo, and player actions

### Pause with orders
The genre-standard that this game needs more than most.

**How it works:** Pause the world, inspect everything, queue actions, unpause and watch them execute.
**Because diagnosis is the gameplay**, and diagnosis under real-time pressure alone is just stress.
Placing and wiring while paused is *encouraged*, not merely tolerated.
**Visual — the Pause Frostpane and the Intent Layer:** pausing applies a subtle cool frost to the
Substrate and Flow layers — motion stops, saturation drops ~15%, a faint blueprint grid fades up over
the floor (the cyanotype "planning mode" identity) — while the **Annotation layer brightens and
expands**: culled labels reappear, every object shows its key stat, dependency lines become visible.
Queued orders draw in a dedicated **Intent layer**: white, dashed, **numbered in execution order**, with
a ghost of the result. Unpausing plays the frost retreating and the intent lines converting to real
actions one by one. **Planning mode has its own visual identity so you always know the world isn't
moving.**

### Speed controls, with a catch
1× / 2× / 4×, but fast-forward has a cost.

**How it works:** At high speed you get **less information** — the log detail thins, small anomalies
aren't surfaced, and subtle degradation slips by. **Speeding through peacetime is exactly how real
incidents start**, and the mechanic says so without a lecture.
**Visual — the Speed Cost, Rendered (because an invisible mechanic reads as unfairness):** as speed
increases the world **visibly loses annotation**. At 2× the log panel switches from lines to a density
bar. At 4× per-object stat plates disappear, small anomaly pips stop being drawn, the Pulse Strip's
resolution coarsens visibly, and a thin motion-blur streak appears on the Flow layer. The speed control
itself shows what you are giving up as a small crossed-out eye. **You can see yourself choosing to look
away.**
**The fairness guard:** a visible degradation indicator naming what is suppressed ("small anomalies
hidden"), plus **auto-drop to 1× at any severity threshold you configure**. The catch remains; the
unfairness doesn't. Make it a full policy rather than a single auto-pause toggle, and fast-forwarding
becomes a *delegation decision* rather than a gamble.
**Tension:** ⚔️ A stricter proposal: **fast-forward is simply unavailable while anything is in an alert
state** — the game literally will not let you skip past a problem. Elegant and enforces engagement
without nagging, but it removes agency from players who genuinely want to accept a known, ignorable
alert. Both are defensible; the strict version fits a tighter, more authored campaign, the policy
version fits the sandbox and late-game tiers.
**Visual:** the speed control is a **physical dial** with 1× / 2× / 4× and pause; higher speeds add
motion blur and ghost trails to sprites so you *feel* the speed rather than just reading it.

### Auto-pause on severity
The game stops for you when it matters.

**How it works:** Configurable: pause on sev-1, on any customer-visible impact, on first alert, on the
first appearance of a threat type you've never seen. **A setting, not a rule** — and setting it *is* a
statement about how you operate.

### Hands as action slots
The core action economy (P4).

**How it works:** Each staff member is one concurrent action; actions take *time*, not mana. Three fires,
two hands: **you must choose what burns.** Hiring adds hands; automation removes the need for them;
runbooks make each hand faster. **The single most important resource in the game.**
**The numbers, proposed:** hands per tier — T0–1: **1** · T2: **2** · T2.5–3: **3** · T4: **5** plus
remote hands (delayed, paid) · T5: **7** plus remote plus follow-the-sun · T6: hands are fully delegated
and the player has **2 executive actions per business month**. Crucially, **the number of simultaneous
incidents the generator may produce is tuned as a ratio to hands (target peak ≈ 1.5 × hands) — that
ratio *is* the difficulty**, and it is the correct dial to tune per level rather than threat HP.
**Visual — the Hands Dock:** a peg rail whose physical tags are lifted off and hung on the objects being
worked. The image the design keeps describing — *watching your last free hand get consumed while three
alerts are firing* — only exists if the rail is a real object you can watch empty.

### Actions cost time, not mana — split into duration and attendance
The universal rule, refined.

**How it works:** Every action has a **duration** (how long until it's done) and an **attendance** (how
much of that duration occupies a hand). They are different numbers and separating them is the single
highest-value refinement in this section:
- A RAID rebuild: **19 hours duration, 0 hands.**
- A restore: **4 hours duration, 0.2 hands** (you check on it).
- A cable trace: **40 minutes duration, 1 full hand.**
- An `ALTER TABLE`: **40 minutes, 1 hand, and you may not do anything else on that system.**
**You learn to start long unattended jobs before short attended ones**, which is the actual rhythm of a
maintenance window, and it makes scheduling genuinely strategic rather than a queue.
**Reference durations (at 1× = 1 sim-minute per real second):** restart a service **20s** · config
change **40s** · failover **90s** · physical disk swap **6 min** on site / **45 min** via remote hands ·
cable trace **3 min** · investigate a fogged object **2 min** · full restore **long enough to hurt.**

### The pager and triage
Alerts queue and demand assignment.

**How it works:** A stack of alerts with severities; you assign hands to them. Some resolve themselves;
some are symptoms of one cause (and fixing the cause clears five); some are noise. **The skill is
choosing what to ignore.** Incidents at night interrupt the business-day phase; handling them costs
staff morale, ignoring them costs uptime, and **auto-remediation unlocks are what let you sleep.**

### Severity classification as a player choice
You decide how loud this is.

**How it works:** The player assigns severity. **Over-classify and you burn your team out on false
alarms; under-classify and you respond too slowly to something real.** Severity drives who gets paged,
whether the SLA clock runs, whether the status page updates, and whether the game auto-pauses — so it is
a genuine decision with four downstream consequences, not a label.

### Incident Mode
When something big breaks, the game changes shape.

**How it works:** A declared incident shifts the verb set: a timer starts, a checklist appears, time may
drop to 0.25× so millisecond-scale phenomena become legible, and the available actions become
**isolate / failover / roll back / shed / communicate / escalate**. Slower time, higher stakes, a
different rhythm. It is the mini-game that breaks up build/wave monotony, and it is where the
**Two-Action Rule** (§7.16) is enforced.
**Visual — the Triage Board:** the HUD flips into an incident-bridge layout with red-tinted chrome: the
world shrinks to a corner, a timeline of what has happened fills the middle, affected customers list on
the right, and your staff are **assignable cards**. A whole second UI mode for the worst ten minutes,
visually distinct so you always know where you are.

### Communicate is an action
Telling people costs the time you would have spent fixing it.

**How it works:** Posting a status update during an incident **costs time and reduces reputation
damage**. Honest and fast preserves reputation; silence damages it *even if you fix it quickly*. Forcing
the player to choose between fixing it and telling people about it is painfully accurate and
mechanically excellent — and it is the mechanic that makes the status page (§8) a building worth owning.

### The Runbook Quick-Bar
Documentation, rendered as buttons that exist or don't.

**Visual:** during an incident, procedures you have documented appear as **one-click buttons on a bar
at the bottom**, each with its own icon. **An undocumented incident shows an empty bar — a very
motivating absence.** This is the cleanest possible expression of "writing things down is a purchase."

### Maintenance windows
Scheduled risk — and the hinge between peacetime and crisis.

**How it works:** Declare a window in advance: SLA accrual is suspended, customers are notified, risky
changes become legal and cheaper. Outside a window everything is riskier and costs more reputation.
Declaring too many windows costs trust. **A planning verb, and hosting's most distinctive rhythm.**
**The structure that makes it a real decision:** windows are **declared in advance** (notice period
affects the reputation cost), have a **duration you choose** (longer = more changes land = more customer
annoyance), and have a **slot count** — the Change Budget below. Two failure modes give it teeth:
**overrun** (you didn't finish — do you stop half-done, or run over into SLA-bearing time?) and **the
window you needed and didn't declare** (an emergency change outside a window costs triple reputation).
**The constraint that makes it strategic rather than administrative: windows are set by your
customers, not by you.** An e-commerce customer forbids November–January. A payroll customer forbids
month-end. A game community's window is 4am and lasts ninety minutes. An enterprise requires fourteen
days' notice in writing. **With ten customers you have a calendar with almost no legal time in it, and
finding the intersection is a genuine, visible, spatial puzzle** — far better gameplay than declaring a
window freely, and exactly what scheduling actually feels like.
**Visual — the Patch Window:** a visible time band on the HUD timeline; inside it, traffic is pre-drained
and staff work fast and calm. Outside it, they work slowly and nervously while visitors are still
flowing. **Doing it right *looks* calm; doing it wrong looks frantic.**

### The Settling Window and Change Interference
**The rule that turns change management from flavour into a mechanic.**

**How it works:** Every change — deploy, config, capacity, topology — enters a **settling window** of
60–180 seconds during which its effects are still landing. Three rules:
- **Two overlapping settling windows multiply the failure probability of both by 1.6×.**
- **Attribution requires isolation:** if an incident occurs while two changes are settling, the
  postmortem **cannot determine which caused it, and you do not get the unlock.**
- A **"Changes In Flight" counter** sits in the HUD; Standardisation and QA builds widen how many you
  may safely run at once.
**Why it matters:** it gives the player a reason to slow down that is not a moral, and the attribution
clause links pacing directly to progression — a genuinely novel coupling, and the mechanical spine
under maintenance windows, canaries and change freezes.
**Interacts with:** §7.5's windows and freeze, §2.9's bad deploy, §5.1's postmortem unlocks.

### The Change Budget
How many changes may safely land per window.

**How it works:** Each window has a **slot count** derived from your QA build, your standardisation
score and your team size. Exceeding it is possible and applies the interference penalty above. Between
windows a **visible backlog of desired changes accumulates** — which makes the Change Freeze scenario
mechanically automatic: *the freeze ends and twenty-three changes want to land at once.*

### The Change object (risk, window, rollback plan, freeze, commit-confirm)
Every modification to a running system is a first-class object.

**How it works:** A **Change** carries a **risk score** (reduced by staging, canary, peer review, a
declared window, a rollback plan, a runbook), a **window** (business hours = faster but higher blast
radius; maintenance window = safer but someone has to be awake at 3am, with a fatigue cost), an optional
**rollback plan** (and the game should punish its absence *specifically*), and a **freeze state**.
**Commit-confirm is the standout detail:** network changes apply with a **10-minute auto-revert timer**.
If you lock yourself out, it saves you. You make the change and **watch a countdown while verifying you
still have access** — a wonderful, real, tense mechanic that no game has.

### The Change Request Flow
Process rendered as a pipeline you watch your change move through.

**How it works:** At Tier 3+, risky changes move through a lightweight flow: **draft → impact preview →
approval (self / peer / board, per policy) → scheduled window → apply → verify → close.** Each stage can
be skipped; skipping is faster and riskier. The QA/Change-Management board (§4.9) sets how much of the
flow is mandatory. During an incident the **emergency-change path** exists, is fast, **and leaves a
mark** that shows up at the next audit.

### The Verification Step
Every action can be verified, and verification is separate, skippable and slow.

**How it works:** Reboot a machine → it comes back; **verify** → discover the service didn't start,
because it was never enabled at boot. Fail over → traffic moves; **verify** → discover the failover
target is running a config from before the last change. Restore a backup → it completes; **verify** →
check the data is actually there. Skipping verification is free and fast, and the failures it would have
caught **surface later, at a worse moment, attributed to something else.**
**Why it matters:** "it seemed to work" is the root cause of an enormous fraction of real second
outages, and verifying is the one habit that separates a senior engineer from a fast one. Mechanically
it is a per-action toggle with a time cost plus a tracked **verification rate** stat.

### The Pre-Mortem
A planning action that rewards pessimism.

**How it works:** Before a big change or event, spend a hand on a pre-mortem: the game asks you to
predict **how this will fail** by selecting from a list, and rewards correct predictions with a prepared
mitigation — a faster rollback, a warmed standby, a pre-written status update, a spare already on the
shelf. **A mechanic that rewards pessimism**, which is the correct disposition for this job and which no
game currently rewards.

### Drills and rehearsals as a scored action type
Peacetime needs a scored loop of its own or it is dead air.

**How it works:** Drills are first-class actions with their own reward structure: **failover drill ·
restore drill · power drill (load bank) · incident tabletop · game day (chaos) · black-start
rehearsal.** Each costs a window and hands; each produces a **Confidence** value on the thing drilled;
each has a small chance of **finding a real problem**, which is a free save and feels fantastic.
Confidence **decays** over time, so drills are recurring rather than one-and-done. The game tracks
"drills run" as a scored axis and audit levels grade you on it.
**And the one that matters most — the Recovery Rehearsal:** actually executing a failover, a restore or
a black start during a declared window **reveals the specific step that doesn't work (there is always
one)**, which you then fix. **Every rehearsal makes the real event measurably faster**, tracked per
procedure.
**Interacts with:** §4.5's chaos lab, §6.9's scoring, §7.7's recovery, §5's sealed-capability decay.

### Change freeze
The opposite lever.

**How it works:** Before a known high-traffic event, freeze changes. Nothing breaks — and nothing
improves. **Both settings are wrong at the extremes**, which is the mark of a good dial.
**The Change Freeze Bank:** changes you couldn't make during the freeze **pile up and all deploy at
once afterward** — which is exactly why post-freeze outages are a real and well-documented phenomenon,
and it means the freeze's cost is deferred rather than avoided.
**Hosting types:** retail/e-commerce (Q4), payments (month-end), game hosting (launch weeks), regulated
(audit season), any customer whose contract specifies it (see §7.2's contract-driven pathing).

### Drain before reboot
See §7.2. Time pressure's favourite casualty, and the most satisfying operational verb in the game.

### The Big Red Button — with a scope selector
Emergency null-route.

**How it works:** Drop all traffic to a target. Stops the attack instantly, stops the customer
instantly. **The most honest button in the game** — it *always* works and it *always* costs you the
customer you were protecting. Offering a guaranteed-but-terrible answer is what makes every nuanced
answer feel valuable.
**Expansion — a scope selector, because "an IP or a service" is too coarse to be interesting:** one IP ·
one customer · one prefix · one traffic class · one region · everything. Each has a different collateral
cost, and **choosing the scope under pressure, with an affected-customer count updating live as you
widen it, is a far better ten seconds of gameplay than a single button.**
**Visual — under glass:** a mushroom-head emergency stop under a hinged clear cover on the desk. Opening
the cover is a separate click with a latch sound; pressing requires a hold. Afterwards **the cover stays
open and the button stays lit red until you reset it** — a visible reminder that you did that, which is
exactly the shame it should carry.

### Degraded-mode toggles and the Degraded-Mode Console
Pre-configured ways to survive.

**How it works:** Read-only mode, static fallback page, disable search, disable image uploads, serve
stale cache, shed non-paying traffic first. **The player pre-configures these in peacetime and fires
them in crisis** — preparation rewarded with a one-click save.
**Visual:** a **physical switch panel** in the office — five labelled toggles in a row
(`RECOMMENDATIONS`, `SEARCH`, `UPLOADS`, `STALE CACHE OK`, `STATIC ONLY`), each with a threshold dial
beside it. In peacetime you set them. In crisis **they throw themselves in sequence and you watch the
switches flip one by one** while the corresponding features grey out in the Site Preview Window.
**Preparation rendered as hardware you installed and then get to watch work.** It belongs on the same
desk as the Big Red Button, so the crisis toolkit is one place you look — which is what a real runbook
drawer is.
**Interacts with:** §7.7's Degradation Ladder (this is its physical control surface), §7.11's classes.

### Active abilities with cooldowns (the "spell" layer)
Big buttons with real costs.

**How it works:** **Emergency Cache Freeze** · **Null-route a prefix** · **Divert to scrubbing** ·
**Failover region** · **Under-Attack Mode** (everyone gets a challenge; visitors halve, threats drop
90%) · **Call the upstream NOC** (a request with a wait time you do not control) · **Blast Door**
(§7.7). Each is a cooldown ability with a stated collateral cost, and together they are the layer that
makes the real-time half of the game *playable* rather than merely observable.

### Ship-It-Friday
A deliberately tempting button.

**How it works:** Deploy an improvement immediately for a bonus, with a meaningfully higher failure
chance and no rollback plan. **Named for the sin it represents.** Players will press it. Once.

### Undo window / rollback
A short window to revert a change.

**How it works:** Revert cleanly within N seconds/minutes; after that, the change is entangled with new
state and rollback becomes its own project. **Teaches why fast rollback capability is worth building**,
and connects directly to §7.7's reversibility triad.

### Capacity ordering with lead times
Buying is a pipeline, not a click.

**How it works:** A purchase moves through **quote → approval → order → manufacture → ship → customs →
receive → burn-in → rack → cable → provision**, each with a duration and a possible hiccup. An **order
board** shows what is in flight. **Expediting** costs money at any stage. This makes "build time" a
system rather than a number, and it is what makes capacity planning — the actual Tier 4+ job — playable:
**you must buy against a forecast, because you cannot buy against a fact.**
**Interacts with:** §7.15's Capacity Planner, §6's cash flow, §7.12's lead-time resource.

### The Inbox: decisions as cards
The business tempo.

**How it works:** Between waves, a small stack of cards: a customer request, a vendor quote, a hiring
decision, a press inquiry, a compliance deadline, an abuse complaint. Each has 2–3 choices with costs and
delayed effects. **A clean, well-understood, low-cost way to carry the entire business layer** without
building a second game — and it is the right home for every §2.10 business threat and every §6.7 money
event.
**The four rules that make it work:**
- **(a) Every card shows when its consequence lands**, not just what it costs — "effect in 90 days,"
  "effect at renewal," "effect at audit." That turns the Inbox from a multiple-choice quiz into a
  **scheduling puzzle**: what am I willing to have land in month 4?
- **(b) Cards have visible deadlines, and expiring is always a (bad) choice.** A card that expires
  unanswered resolves to the **status-quo option, never to the worst one.**
- **(c) A cap: at most three cards open at once, at most ~8 per level.** A full inbox blocks new ones,
  which is itself informative.
- **(d) Every card shows which resource it costs as an icon**, so you can triage against your current
  constraint without reading — and **at least one card per level has no downside at all**, or players
  learn to dread the inbox and stop reading it.
**Visual — the Inbox Deck:** a small physical stack in the lower right, slightly fanned, top card's
sender visible. **Different paper stocks by source:** customer (lined notepaper), vendor (glossy sales
sheet), legal (heavy cream), press (newsprint), internal (post-it). Choosing plays the card being pulled
and then filed, torn, or **pinned to the Obligation Rail** if it creates a future consequence. An ignored
card slides to the bottom and yellows.

### The Lag Table (formerly "the 90-day lag")
The signature business mechanic — and its uniformity was wrong.

**How it works:** **Business decisions pay off or punish later**, and the *variance in how much later is
the strategy.* Real lags differ by a factor of ten and the asymmetry between how fast things turn off
and how slowly they turn on is the actual lesson:
- **Ad spend on: hours. Ad spend off: hours.** (Instant both ways.)
- **Price change:** immediate on new customers, **12 months** on the installed base.
- **Support cuts:** 60–120 days (churn shows at renewal or after two bad tickets).
- **Content/SEO:** 6–12 months to arrive, 3–6 months to decay after you stop.
- **Sales hire:** 4–6 months to productivity — **and their pipeline leaves with them.**
- **Certification:** 6–18 months, then a step change in eligible customers.
- **Reputation damage: instant. Reputation repair: 6–18 months.**
- **Technical debt:** 1–3 years, then all at once.
**Rename the mechanic the Lag Table and print the actual lag on each card.** Three supports keep it from
reading as randomness: an **Attribution Ledger** so consequences name their causes; a **forecast band**
on the Obligation Rail so a consequence can be seen approaching before it lands; and a **variance rule**
— lag is `stated ± 15%` with the **magnitude uncertain but the direction certain.** *Uncertain timing
plus certain direction is tense; uncertain direction is just noise.*
**Visual:** a "pending consequences" rail showing what's coming and when (§8.8's Obligation Rail).

### The month as the tick
Business time runs on a calendar, not a clock.

**How it works:** Infrastructure runs in seconds; business runs in months. A **month-end sequence** —
billing runs, invoices go out, payroll clears, the P&L updates, the board meeting happens — punctuates
the game. **Two time scales layered on one another** is unusual and gives the game its shape. See §7.13
for the formal two-clock rule that makes them commensurable (and prevents the worst possible outcome: a
game where you pause to fix a server and accidentally pause your payroll).

### Autopilot and delegation policies
Growing means letting go.

**How it works:** Hand routine categories to staff with a policy ("restart on OOM, page me if it
recurs"; "approve refunds under $50"). They'll handle 90% correctly and occasionally do something you'd
never have done. **Delegation as a mechanic with a trust cost** is the most interesting scaling verb in
the document. See §7.14 for the full policy system, the delegation bands, and the UI that makes standing
policy visible.
**Extend it to the commercial side, where the policies are richer and more consequential:** discount
authority ceiling · credit-limit approval threshold · refund authority · suspension policy for
non-payment · abuse-desk aggressiveness · which tickets escalate to engineering · whether sales may sign
non-standard contract terms. **Each is a dial that trades your attention for risk**, and collectively
they are what "running a company" feels like once you are no longer doing everything yourself.

### Executive attention as a tiny pool, and the CEO Override
The CEO's version of hands.

**How it works:** At higher tiers you have very few personal actions per month; everything else must be
delegated. **The game gradually takes the controls away from you and gives you a company instead** —
the strongest progression idea in the document. **CEO Override** lets you spend that attention to force
an outcome at full effectiveness: close the whale deal personally, personally handle the angry customer,
personally debug the outage. It costs the rest of your month.
**The addition that makes the Override a real decision:** **it should have a visible cost to the
organisation, not just to your calendar.** Personally closing the deal means the sales team didn't learn
how. Personally fixing the outage means the runbook didn't get written. Personally handling the angry
customer sets a precedent that the CEO handles angry customers. **Founder heroics should degrade the
system that would otherwise have improved** — true, novel, and a genuinely uncomfortable disincentive.
**Tension:** ⚔️ Hands (P4) and executive attention are two attention economies that would double-tax the
player if both were live at once. Two proposed resolutions, both good:
- **Sequential:** hands are the resource from Tier 0 to Tier 4; from Tier 5 hands are fully delegated
  (you set policy, staff execute) and executive attention **replaces** hands as the scarce resource. The
  handover — when the game takes the wrench out of your hand — should be an explicit, dramatic,
  slightly sad beat, because it is the actual arc of the career.
- **One resource, two denominations:** executive attention is not a separate pool, it is **a special
  hand — *yours*** — that is more effective than any other, replenishes per month rather than per
  action, and is the only hand that can perform certain commercial actions. At high tiers *your* hand
  count stays at one while everyone else's grows, which produces the intended feeling without a second
  resource system.

### Chair switching with a cost
You can only be in one seat at a time.

**How it works:** The player occupies one chair — **Ops, Sales, or Finance** — and switching has a
cooldown. Whatever you are not watching runs on the delegation policies you set. **The whole mid-game
skill is deciding which chair to be in during a given week, and the answer is almost never the one you
enjoy most.**
**Interacts with:** §7.15's commercial board, §7.14's policies, §7.12's attention.

### Night shift / the on-call clock / the 2am multiplier
Not all hours are equal.

**How it works:** Incidents at 3AM have slower response, fewer available hands, and **a higher error
rate on every action taken** (the 2am Multiplier). Staffing a night shift costs money; not staffing one
costs MTTR. **The most relatable mechanic in the game to anyone who has done this job**, and the reason
automation and self-healing feel disproportionately valuable.
**The Two-Person Rule:** some dangerous actions require two staff available simultaneously — which makes
night-shift staffing levels matter *structurally*, not just statistically, and occasionally means the
correct answer is "wait until morning."

### Patch lag
A stat, not an event.

**How it works:** Days behind on patching, per fleet. Rises automatically. Drives vulnerability
probability. Lowering it costs windows and hands. **A number that quietly gets worse while you're busy**
is an excellent pressure source.

### Toil accumulation
Watching your team drown.

**How it works:** Repeated manual tasks visibly accumulate as a **recurring staff-hour drain** until
automated. The player *sees* the same three actions eating a hand every cycle. It is the most legible
argument for automation the game can make, and it feeds the Toil Debt meter (§7.7).

### Slow-mo incident cam
Presentation, not mechanics, but it changes tempo.

**How it works:** When a cascade begins, the game briefly slows and pushes the camera in on the **first
domino**. **Makes the player *see* the causal chain** instead of just the aftermath.
**Constraint:** it fires **at most once per incident, on the first domino only**, and never during a
cascade the player has already watched. Otherwise it becomes an interruption rather than a revelation.
**Visual — the Incident Pounce:** the camera does **not** teleport. It arcs to the event over ~0.6s with
an accelerating dolly, and a thin white line connects the HUD alert to the world object. **You always
know where you are and how you got there.**

---
## 7.6 Information, fog, and diagnosis

### Ground Truth vs Observed Truth (the engine rule beneath this whole section)
**The most important missing line in §7, stated once and everything else falls out of it.**

**How it works:** The simulation maintains **two parallel states for every object**: what is actually
true, and what the player's instrumentation *reports*. Monitoring buildables improve the **fidelity,
freshness and coverage** of the observed layer. Every "everything is green" moment, every gray failure,
every stale replica, every fog-of-instrumentation blank and every red herring **falls out of this one
structural decision** rather than being authored incident by incident.
**Corollary rules:**
- Observation has **latency** — graphs are 30–60s behind by default; tracing is faster; a customer
  ticket is minutes behind that.
- Observation has **coverage** — uninstrumented objects report **nothing**, not zero.
- Observation can be **wrong** — a health check that checks the wrong thing reports healthy forever.
- **The player may only act on observed truth.** The camera itself is part of the observed layer
  (§9.2's "The Camera Is a Camera" is the visual expression of this rule).
**Why it matters:** it turns a dozen scattered ideas into one system, and it is what makes the fog fair.

### Fog of infrastructure
**You can only see what you've instrumented.**

**How it works:** Uninstrumented components render vague or fogged with "?" stats (§5.4's Fog of
Instrumentation). Monitoring buys sight. **Fog of war over your own systems is the game's most original
mechanic** and it makes observability purchases feel like ability unlocks rather than chores.
**Refinement 1 — fog is per-property, not per-object.** You might know a machine's CPU and not its disk
latency. That makes the monitoring ladder (§4.6) meaningful at object granularity and produces the real
experience of **"I can see three of the four numbers I need."**
**Refinement 2 — known unknowns must be visible.** An uninstrumented object is drawn **clearly, with a
"?" badge**: you can see *that* you cannot see it. **The fog is over the state, never the existence.**
Add a permanent **Coverage percentage** to the HUD ("instrumented: 64% of nodes, 41% of links") so the
blind spot is a number you can budget against. Discovering an object you *didn't know existed* (the
Asset Discovery Scan) then becomes a genuinely different and much rarer event.

### Bounded Fog (the fairness contract)
Three hard rules, because unbounded fog is just a guessing game.

**How it works:**
1. **Ground truth is never hidden.** The Site Preview Window and the Pulse Strip always tell the truth.
   **You can always find out *whether* you have a problem**, even with zero monitoring.
2. **The cause is always findable with tools you could have bought** — never with tools that don't
   exist. The postmortem must always be able to name which purchase would have shortened this incident.
3. **Fog costs time, never certainty.** An uninstrumented system can always be diagnosed by hand — it
   just takes **4–8× as long** and consumes hands. **Monitoring buys speed, not possibility.**
**Why rule 3 matters most:** without it, fog converts into "you lose because you didn't buy the right
thing three levels ago," which is the least fun failure mode in strategy games.

### Telemetry Resolution
**Every graph in the game has a sampling interval, and the interval determines what is true.**

**How it works:** Each monitoring buildable has a **resolution** stat — 5-minute averages, 30-second,
1-second, per-packet. **Phenomena exist at each scale and are invisible above it:** microbursts
(sub-second), request-level latency outliers (per-request), thermal transients (seconds), the
95th-percentile bill (5 minutes), capacity growth (days). A player watching 5-minute averages while
dropping packets sees a flat green line **and is not being lied to** — they are looking at a true
average of a situation that is not average.
**Why it's a great mechanic:**
- Observability upgrades get a **qualitative** payoff instead of a numeric one: you don't get a better
  graph, you get **access to a class of phenomena.**
- It makes "the graph says it's fine" a legitimate, defensible, *wrong* position — the actual texture of
  the job.
- It costs money in a real way: higher resolution means more storage and more ingest, so you trade
  **retention against resolution** — *you can keep a year at 5 minutes or a week at one second, not
  both.* A genuinely interesting purchasing decision that has never been in a game.
- It pairs with p50/p95/p99: **percentile and resolution are two orthogonal axes of "which truth am I
  looking at."**
**Interacts with:** §6.3 (95th-percentile billing is itself a resolution artifact), §2's microbursts,
§4.6's monitoring layers.

### Symptom vs cause
Alerts report symptoms; the cause is elsewhere.

**How it works:** "Website slow" might be the DB, the disk under the DB, the network to the disk, a noisy
neighbour, a DNS timeout in a dependency, or a bad deploy. **Diagnosis is the actual gameplay**, and the
tools you own determine how fast you can narrow it. The map shows symptoms; each **investigation action
costs time and narrows the possibility space.**

### The two diagnostic modes: "What changed?" vs "What grew?"
Make the diagnosis loop explicitly bimodal, because real diagnosis is.

**How it works:** When an incident starts, the player picks a line of inquiry. **Change-driven** uses the
Change Correlation overlay and is right most of the time. **Growth-driven** uses the Growth Ceiling
overlay and is right when nothing changed. **Picking wrong costs time; the tell is the shape of the
onset — a step function means a change, a curve reaching a knee means growth.** Teaching a player to
read the shape of an onset is a real skill, a purely visual mechanic, and beautifully teachable.

### Confidence as a diagnostic resource
Acting on incomplete information, explicitly.

**How it works:** During diagnosis the game tracks your **hypothesis confidence**, derived from the
evidence gathered and the tools you own. You may act at any confidence level. **Acting at 40% is fast
and often wrong** — and a wrong action costs time *and* can make things worse; gathering more evidence
costs the thing you have least of. **A visible confidence number turns "should I wait or act" into a
real decision rather than a feeling**, and it is the mechanical heart of what makes incident response
hard.

### Red herrings
Not every anomaly is the cause.

**How it works:** During an incident several things look wrong; some are consequences, some are
coincidences, one is the cause. **Chasing the wrong one costs hands and time**, which is the real cost of
a bad hypothesis.
**Tension:** ⚔️ Red herrings can feel unfair. **The hard rules that fix it:** (a) **at most one red
herring per incident**, and it must be **resolvable by a tool the player owns in under 30 seconds** — a
herring that eats two minutes of a four-minute incident isn't a puzzle, it's a tax; (b) it must be
**plausible** (a real anomaly, not noise); (c) it must be **cheap to check** relative to the cost of
chasing it; (d) **the postmortem must always name the herring**, so the player learns the pattern rather
than concluding the game is capricious; and (e) — the best refinement — **at least one "herring" per
incident should be a genuine second problem**: smaller, unrelated, worth fixing later. That is how real
incidents work, it makes investigation feel *rewarded* rather than punished, and it is precisely the
difference between a red herring and a lie.

### Alert fatigue as a mechanic
Too many alerts is its own failure.

**How it works:** An alert volume stat. Above a threshold, staff start missing real alerts — **the miss
probability is a function of noise.** The counter is tuning, deduplication, and dependency-aware
suppression (a database alert suppresses the fifty downstream alerts it caused). **The most
true-to-life mechanic here.**
**Alert routing is the dial:** decide what pages a human at 3am versus what waits for morning.
Over-paging burns out staff; under-paging misses incidents. **A deliciously real dial**, and it lives in
the Policy Book (§7.14).

### MTTD and MTTR as separate stats
Detection and repair are different problems.

**How it works:** Monitoring lowers MTTD. Runbooks, automation and spare parts lower MTTR. **Most players
overinvest in repair and underinvest in detection**, and the postmortem should say so in those words.

### The "everything is green" trap — and its two siblings
Your dashboard can be wrong in three distinct ways.

**How it works:**
- **Everything is green and something is wrong.** Health checks that check the wrong thing — the web
  server returns 200 while the app serves an error page; the replica is "up" but 40 minutes behind.
  **Synthetic monitoring** (checking what the user actually experiences) is the counter, unlocked by
  suffering this exactly once (§5.2).
- **Everything is red and nothing is wrong.** A monitoring or network problem makes healthy systems
  appear down. The correct response is to **verify from a second vantage point before acting**, and the
  failure mode is a player who "fixes" forty healthy machines.
- **Everything is green and you are not looking at production.** The monitoring points at staging, at
  the old IP after a migration, or at a health endpoint that was stubbed out during a deploy in 2022 and
  has returned 200 unconditionally ever since. **A check that always passes is worse than no check**, and
  finding one during an audit or a chaos test should be a genuine unlock.

### The dashboard as a weapon
Information is a defensive structure.

**How it works:** Each monitoring build adds a specific visible graph. Graphs are how you win. **A game
where the correct response to a crisis is "look at the right graph" is a game about this job.**
**Visual — the NOC Wall:** your dashboard is a **diegetic object in your office** — a wall of monitors
with tiny live graphs, a map and a camera feed. Clicking a monitor jumps the camera. **Your minimap is a
piece of furniture you actually built and can point at.**

### The overlay wheel, specified
One key, many lenses — with discipline.

**How it works:** Hold `Tab` and **ten wedges fan out around the cursor**, each a colour swatch plus one
icon, arranged so opposites are opposite (Traffic ↔ Cost, Thermal ↔ Power, Security ↔ Capacity).
Releasing on a wedge applies it. **Only one may be active**; selecting a second swaps with a wipe. The
active overlay announces itself with a **2px border tint around the entire viewport** in that overlay's
key colour, a small persistent chip naming it, and — crucially — **a legend card in the corner showing
the scale**, because an unlabelled false-colour map is a lie.
**The lenses:** Traffic · Latency · Power · Thermal · Security Surface · Cost-per-U · Capacity Headroom ·
Maintenance Debt · Blast Radius · Redundancy · Compliance · Age. **Disciplined overlays are the whole
answer to readability at scale.**
**Lens persistence and blending:** you may pin two lenses at 50% each (Heat + Power, say) for a combined
false-colour read. **Power users build their own dashboards out of the world itself.**

### The overlay palette table
Each overlay needs an *exclusive* palette so two can never be confused.

**Visual:** Traffic = cyan mono · Latency = cyan→magenta divergent · Power = copper mono · Thermal = iron
(black→red→white) · Security Surface = pure luminance on black · Cost = green mono · Capacity =
green→amber→red ramp · Maintenance Debt = sepia/grime · Blast Radius = a single flood fill, **no ramp** ·
Redundancy = two-tone, paired/unpaired only. **Ten overlays, ten unmistakable looks, none of which reuse
the alert triad.**

### Security-surface overlay as literal brightness
Exposure rendered as light.

**Visual:** in security view the world darkens and each component **glows in proportion to its attack
surface.** Your shiny new feature is now the brightest thing on the board. **The most immediately
intuitive overlay in the document** (P2 made visible), and it doubles as the render of §7.10's
attractiveness field — *you can literally see where threats will want to go.*
**One guard, stated as a rule:** on a pure-luminance overlay the **alert triad must be suppressed
entirely** — a red alert on a black luminance field will dominate and destroy the reading. *Luminance
overlays suspend colour alerts and substitute shape pips.*

### Capacity headroom overlay
How close is everything to the cliff?

**Visual:** every component tinted by utilization against the hockey-stick threshold (§7.1). Everything
above 80% glows amber. **One glance answers "what will break first."**

### Maintenance debt overlay, split into three wear channels
Where is the rot — and which kind?

**Visual:** components tinted by accumulated deferred work as a physical grime layer — but **split into
three channels** so the overlay tells you which action to take: **dust** (maintenance/patch debt),
**heat stain** (thermal debt), **hand wear** (change/config debt, the polish worn off the buttons people
keep touching). **One grime channel can only say "something is wrong here"; three say what to do about
it.** Technical debt you can see from across the room.

### The log panel
Always available, always scrolling.

**How it works:** Real-ish log lines from your actual simulation. **Filterable and scrubbable back in
time**, because the whole value of logs is history. Anomalies are *in there* before the alert fires —
**a player who reads logs gets a genuine head start**, and that's a skill the game rewards without
requiring.
**Visual — the Anomaly Tick:** anomalous lines get a **1px left-edge tick in violet** (unidentified) —
not a highlight, not a colour change, just a tick. Clicking the line pins it and opens an investigation.
**Subtle enough that noticing it feels like a skill**, which is exactly the brief for that mechanic. The
log renders in the Terminal typeface.

### The in-game terminal
A real, optional, diegetic command line.

**How it works:** Type real commands and get **game-accurate output reflecting actual simulation state.**
Everything it reveals is also available through the GUI — **the terminal is a speed and flavour layer,
never a requirement.** For the audience this game is for, it is the single most charming feature possible.
**Tension:** ⚔️ It's a large amount of content for an optional feature. **Mitigation: ship five to eight
commands that matter and make their output beautiful, rather than forty that are shallow.** The
shortlist the reports converge on, each teaching a distinct diagnostic idea:
- `top` — what is eating this box (load, per-process state).
- `df -h` **and `df -i`** — the inode joke lands here, and `df -i` alone justifies the feature; plus the
  deleted-but-still-open-file disagreement between `df` and `du`.
- `ss -s` / `netstat` — connection states, which is **how you see a SYN flood, conntrack exhaustion and
  a TIME_WAIT pile-up.**
- `dig +trace` — it is always DNS, and the trace shows *where*; the real skill is querying a **specific**
  resolver.
- `mtr` / `traceroute` — where in the path the loss is, **with the crucial detail that intermediate-hop
  loss is usually a lie and only the final hop's loss matters.** A real misconception the game could
  correct single-handedly.
- Optional extras with the most game state: `dmesg | tail` (hardware and OOM), `iostat -x` (the IO wait
  that explains everything), `tail -f` (the log).
**Rule:** every one must reveal something the GUI shows too, and each output gets a **one-line
annotation the first time** so a non-expert can read it.
**Visual — the Terminal Window:** it renders on the crash cart's screen at Z1, and elsewhere as a
**floating CRT window with a slight barrel, a scanline shimmer and a visible bezel** — deliberately the
only element in the game with curvature, so it reads as a different class of object. Era-appropriate
terminal typeface, real column alignment. **The one place the CRT art style lives permanently.**

### The "Is It Actually Down?" check
A tiny, universal, perfect action.

**How it works:** Before you panic, verify from outside. Costs a few seconds; sometimes reveals the
problem is the customer's DNS, their ISP, or their office wifi — **and you were about to reboot
production.**

### The Change Log (documentation as a mechanic)
Everything you do is recorded.

**How it works:** Every action is logged with a timestamp. After an incident you review the change log to
find the cause — and **players who *label* their changes diagnose faster**, because a log line that says
"raised pool size on web tier" is worth ten that say "config change." Labelling costs a moment and pays
at 3am. **This is how documentation becomes a mechanic rather than a virtue.**
**Interacts with:** §7.5's Change object, §5's postmortem, the Change Correlation overlay.

### The Decision Highlight (making the board's *choices* legible)
Overlays show state; nothing shows agency.

**How it works:** At any moment the game marks **at most three** things as *decisions* — a subtle white
corner bracket on the object plus an entry in a small "Now" list. Everything else is information. The
selection rule: something is a decision when (a) two options are both viable, (b) the window is closing,
and (c) the player has the resources to act. **It is not a hint system — it tells you where the fork is,
never which branch to take.**
**Why it matters:** at Tier 4 with 300 objects, the hardest problem is not "what's red" but **"what am I
actually being asked."** It is the three-clock philosophy (§7.9) applied to agency rather than to time.

### The Board Diff (what changed since you last looked)
A toggle that renders the board as a diff against a snapshot.

**How it works:** Diff against the state N minutes ago, or when you last visited this camera bookmark, or
before the current incident began. **Additions glow green, removals ghost red, changed values show
deltas.** Essential in multi-line and multi-site play and in any level with a slow clock.
**Why it matters:** a game with four altitudes, multi-line tabs and a business month that advances
off-screen **must** answer "what happened while I was elsewhere," and the incident ticker is not enough.
It is also the correct UI for time-skip levels and for acquisitions.

### The Watchlist (pin what you're worried about)
Intention, made mechanical.

**How it works:** Pin any object, link, customer or metric to a compact rail. Pinned items keep a **live
sparkline** and are **exempt from LOD collapse and label culling**. Pinning is a tiny act of intention
and **the game scores it**: the postmortem reports whether the thing that broke was pinned —
*"You were watching it. You just couldn't get to it."* versus *"You weren't looking there."*
**Interacts with:** §7.16's Selection Grammar (pin is the third selection state, with a tether line to a
docked mini-inspector), §6.9's postmortem, §7.16's LOD rules.

### The Attention Heatmap (a post-level self-portrait)
Where you looked versus where the damage was.

**How it works:** The game records where the camera was and what was selected, and the postmortem renders
it as a **heat map over the board** against where the damage actually happened. **In a game whose central
scarce resource is attention, the post-level readout should be about attention.** It requires no
simulation work at all, it is the cheapest possible "you were looking at the wrong thing" lesson, and
players will find it uncomfortable and share it constantly.

---
## 7.7 Failure, recovery, and consequence

### Degradation, not destruction (the anti-tower-defense principle)
Nothing in this game has HP that reaches zero and explodes.

**How it works:** The failure vocabulary is **saturation → brownout → partial failure → cascade**, not
damage. A component at 100% doesn't die, it queues; queuing causes latency; latency causes bounces.
Failure is a **state with a duration**, and almost everything can come back. **Most of the game should
be spent in the middle states**, not in binary up/down — that is the whole reason the design uses slots
instead of health bars (§7.1).

### Graceful degradation, pre-configured — and the Degradation Ladder editor
**The most important failure mechanic, and the mechanism by which the game's thesis pays off.**

**How it works:** The player defines the ladder *in advance*: at 70% load, disable the recommendation
engine; at 85%, serve stale cache; at 90%, shed class 4; at 95%, static page only. Under load the system
walks the ladder automatically. **Preparation in peacetime paying off in crisis is the game's core reward
loop (P3).**
**The UI it has been missing — the Degradation Ladder editor:** a **vertical strip with load thresholds
down the left and a drop zone at each rung.** You drag features, customer classes and whole subsystems
onto rungs. Each rung shows its trigger condition, its action, and a **customer-visible consequence
preview rendered live in the Site Preview Window**, so you can *see* what your customers will see at 85%
load while you are calmly configuring it. During an incident **a marker rises up the strip in real time
and you watch which rung you are on.** It is readable at a glance, it is diegetic (it looks like a
runbook page), and combined with §7.11's priority classes it is **the single best peacetime screen in
the game.** Its physical control surface is the Degraded-Mode Console (§7.5).
**Visual — Graceful Degradation Layers:** when overloaded, services visibly shed features **in order**:
the recommendation widget greys out, then images drop to placeholders, then the page goes text-only. The
visitor still converts but **drops a smaller coin.** Degradation as a picture of a page getting simpler.

### Load shedding (and why it requires peacetime work)
Deliberately drop the least valuable traffic to save the most valuable.

**How it works:** Shedding requires that you have **classified your traffic in advance** (§7.11) — a
system that cannot tell a whale from a scraper can only shed at random, which is the same as failing.
Shedding is the ladder's lower rungs and the Sacrifice Decision's standing-policy form.

### Granularity of sacrifice (the triage ladder)
All-or-nothing is not triage; the ladder is the gameplay.

**How it works:** Ordered cheapest to most brutal — **disable an expensive feature → serve stale cache →
shed anonymous traffic → shed a specific endpoint → rate-limit one tenant → rate-limit one tenant's
*worst* endpoint → null-route one IP of theirs → null-route their whole allocation → suspend them.**
Each rung is a separate, clickable, **reversible** action with a different cost in revenue, reputation
and contract exposure. **The skill is choosing the lowest rung that works.** Players will reach for the
bottom rung first and learn not to.
**Interacts with:** §7.5's Big Red Button scope selector (its blunt sibling), §7.11's classes, §3.9's
Sacrifice Decision.

### Circuit breakers
Stop the cascade at a boundary.

**How it works:** Configure a threshold on a link (§7.2's fuse bead); when the downstream fails past it,
**the breaker opens, the call fails fast, and the retry storm never forms.** Opening a breaker sheds that
feature but saves everything else. **The counter to §7.1's saturation cascade**, and it should be
unlocked by suffering one.
**Visual — "The Flip":** the breaker glyph on the arc **flips open with a snap** and traffic visibly
reroutes. **Half-open state is a breaker letting one bead through at a time to test the water** —
adorable, and exactly right.

### Cascades with a visible fuse
Failure should be watchable.

**Visual:** the cascade travels along links as a **bright travelling node with a trailing char mark**, at
a fixed **1.5 seconds per hop *regardless of simulation speed*** — it is drama, not simulation, and
**decoupling the fuse from sim speed is the load-bearing detail**, because at 4× a cascade otherwise
becomes an instant loss screen. You can see it coming and **cut ahead of it** by drain-moding something
in its path. **A circuit breaker in its path stops it visibly:** the travelling node hits the fuse bead,
the bead pops, and the cascade dies with a puff. **Watching a breaker you bought three levels ago eat a
cascade is the single best payoff animation available.**
**Distinct from the red tide** (§7.1): fuse = a discrete event propagating; tide = a persistent
saturation wash.

### Brownouts over blackouts
Partial failure is more interesting than binary.

**How it works:** Most failures degrade rather than stop: slower, some errors, some features off. **The
question "is this bad enough to act on?" is better gameplay than "it's down."** The player can also
**brown out deliberately** — turning off image optimisation, search, or uploads to preserve core
function — which makes graceful degradation an *active ability* and not only an automatic ladder.

### Partial failure states (enumerated and rendered)
Six states, each needing a different response, each with its own look.

**How it works and how it looks:**
- **Read-only** (writes fail, reads work) — the object's write-side port goes **hollow** and a padlock
  sits on the inbound arrow.
- **Stale** (serving old data) — the poisoned tint plus a **clock watermark** on its readouts.
- **Degraded** (slow) — thermal warm shift plus a visibly **slower idle animation.**
- **Flapping** (up and down) — the object's LEDs and outline **desynchronise from the global
  heartbeat**, which is the single most noticeable thing you can do on a synchronised board.
- **Split** (some users fine, some not) — a **hairline vertical seam** with the two halves differently
  tinted.
- **Silent-wrong** (working but producing wrong results — **the worst one**) — **it looks perfect.** The
  only tell is a discrepancy between its Face and its Truth, which is why the flip-to-truth verb exists.
  *The silent state is only renderable if the Truth/Face pair law exists — the two proposals depend on
  each other.*
**Why enumerate:** the silent one exists to teach that monitoring "up" is not monitoring "correct."

### Gray failure (the component that is 40% working)
Worse than 0%, because health checks say it's fine.

**How it works:** A node dropping 1% of packets, or serving one request in twenty slowly, or corrupting
one write in ten thousand. **It passes every health check**, it poisons everything downstream, and
detecting it requires **deliberate investment** (per-request tracing, synthetic checks, resolution —
§7.6). Detecting "brown" failures is harder and far more interesting than detecting black ones.

### Failure states worth explicitly modelling
Name them, and each gets its own counter.

**How it works:** **Split-brain** (two authorities, divergent data — rendered as *two crowns*, §7.7's
failover handoff) · **deadlock / lock contention** (everything alive, nothing progressing) · **queue
collapse** · **metastable failure** (the system stays broken *after* the trigger is removed, because
retry load now sustains the failure — escaping requires actively shedding load; extremely real and
almost never modelled in games) · **correlated failure** (a shared hidden dependency) · **silent data
corruption** (the failure with no alarm) · **configuration drift** (machines that are supposed to be
identical and aren't) · **capacity cliff** (fine, fine, fine, catastrophic).

### The Second Failure Window
Tension without an enemy.

**How it works:** During any degraded state — a RAID rebuild running, one of two load balancers alive, the
generator running, a replica rebuilding — the game shows an explicit **"you cannot survive another
failure right now"** bar. It is a timer that the player desperately wants to run out, and it makes
redundancy's *absence* felt continuously rather than only at the moment of loss.
**Visual — the RAID Rebuild Bar:** a rebuild progress ring on the array with the **danger window drawn in
amber**. You watch the risk window close. Genuinely tense, entirely visual.

### The Failover Handoff
Who is in charge, drawn as one sprite.

**Visual:** active/passive failover draws as a **crown physically moving** from one node to another along
a short arc. **Two crowns = split brain. One crown = correct. Zero crowns = nobody is serving and
everyone thinks someone else is.** The crown is the single most important 8px sprite in the game.

### Recovery is gameplay (and recovery order matters)
You can't just turn everything on.

**How it works:** After a full outage, restart in dependency order: power → network → storage → database →
cache → app → load balancer → traffic. Wrong order means thundering herds, cold caches, auth storms and
a second outage. **Bringing a system back up is a puzzle with a correct answer**, and the runbook you
wrote is the answer key. **This makes the post-disaster ten minutes as engaging as the disaster.**
**Made playable:** services show a **dependency-ordered list with lock icons** on anything whose
dependency isn't up yet. Starting something out of order is **possible** — the lock is a warning, not a
block — and produces a **specific, named failure** (cold-cache stampede, auth storm, replication
confusion, inrush trip). A written runbook **auto-sorts the list**; no runbook means you sort it yourself
under a clock. A 45-second minigame with a correct answer, a satisfying failure mode, and an obvious
reason to have written things down.
**Visual — the Recovery Ladder:** during a cold start the dependency graph renders as a **vertical
ladder** — storage at the bottom, traffic at the top. Bringing a tier up lights that rung and sends an
illumination pulse upward to the next. Bringing one up **out of order** shows the rung lighting and then
**failing back to dark with a thunk**, while the rung below it flashes. Black Start is this ladder with a
flashlight.

### The cold-start dependency cycle
The trap that only appears when everything is off at once.

**How it works:** Your DNS server needs storage; storage authenticates against LDAP; LDAP needs DNS.
Everything is fine forever **until the day all three are off simultaneously, at which point none of them
can start.** The counter is a **static bootstrap path** — hard-coded IPs, a local hosts file, a cached
credential — which is ugly, unfashionable, drifts out of date, and **is the only thing that lets you come
back from zero.**
**Great UI:** a **cold-start dependency graph view that highlights cycles in red**, purchasable as an
analysis. The player should have to draw their own bootstrap order and then be told it has a cycle in it.
Hilarious the first time you run it, and the fix is a maintainable artifact you then have to keep current.

### Restore service or restore redundancy? (the recovery decision nobody states)
Both are defensible and the game should never say which is correct.

**How it works:** During recovery you must choose: rebuild the array, re-establish replication and re-arm
failover **before** letting traffic back (safer, slower, customers still down) — or **serve customers on
a fragile single copy while the rebuild runs behind** (faster, and a second failure now is fatal).
**The Second Failure Window bar is the visualisation of exactly this choice.**

### The cold-cache thundering herd
The second outage inside the first.

**How it works:** When you restore service, all the waiting traffic arrives at once against an empty
cache. **Slow-start, gradual traffic admission and cache warming are the counters.** The most common real
"we fixed it and it broke again" moment — and its electrical twin is **inrush**: bringing every machine
back at once trips the breaker you just restored.

### Degradation Debt
Running in degraded mode accrues a bill you pay at the end.

**How it works:** Every hour in a degraded state — cache disabled, replica down, redundancy consumed, a
feature off, email queued, metrics uncollected — **accumulates a debt**: deferred writes, growing queues,
unreplicated data, unsent mail. **Restoring service means paying the debt down**, and a long degradation
can produce a backlog whose catch-up is **itself an overload event.** The best argument for fixing things
quickly, and the missing explanation for why recovery so often causes a second outage.

### The Blast Door
A manual, deliberate, damaging containment action.

**How it works:** Sever a segment of your own network or estate to stop something spreading — ransomware,
a worm, a compromised tenant, a cascading retry storm. **It takes those customers offline immediately and
definitely, and it works.** A verb that trades **certain small damage for uncertain large damage**, which
is the actual calculus of containment, and a far more surgical instrument than the Big Red Button.
**Interacts with:** §7.2's VLAN painting (a blast door is only possible where you segmented), §2.6's
lateral movement.

### Data loss is permanent
Keep exactly one irreversible damage type so the player has something to actually fear.

**How it works:** Downtime is recoverable; **lost data is not.** Every other failure in the game degrades,
queues, costs money, or takes time. Data loss alone is a line the game will not let you walk back — which
is what makes backups, restore tests, durability dials and the Corruption Horizon carry real weight
rather than procedural weight.

### The Corruption Horizon
The question is not "restore" — it's "restore to *when*."

**How it works:** When corruption is discovered, **every hour you go back destroys an hour of legitimate
data.** Finding the corruption onset requires investigation. **A restore that loses a day of orders to
remove four bad rows is a choice**, and it is the most uncomfortable arithmetic in this profession.
**Hosting types:** backup/DR, object storage, database hosting, anything with a write path.

### Partial restore and prioritised recovery
You don't restore everything at once.

**How it works:** Restore bandwidth is finite, so during a restore you choose the **order**: which
customers, which systems, which data ranges. **Prioritising your whale is rational and visible, and the
customers restored last will know they were last.** The most uncomfortable decision in disaster recovery,
rendered as a queue you arrange with your own hands.

### The Failback Problem
Getting home is harder than leaving.

**How it works:** After failing over to a secondary site, **failing back is a separate, riskier
operation**: data has diverged, the secondary is now authoritative, and the primary is cold. **Many real
organisations fail over and then live at the secondary forever.** The game should model this — failback
is its own project with its own risk, and **choosing to stay is a legitimate, slightly sad, very real
outcome** that quietly changes your cost base and your latency map.

### The Reboot Roulette (state you didn't know you had)
Machines accumulate uncommitted state.

**How it works:** A service started by hand and never enabled. A firewall rule added at runtime and never
saved. A mounted filesystem missing from `fstab`. A kernel module loaded manually. An IP added with
`ip addr` and never written to a config. A `sysctl` set for a test in 2019. Each is tracked in a hidden
per-machine stat, **Boot Confidence**, that **decreases every time you make a live change without
persisting it.** Rebooting a machine with low Boot Confidence risks it **not coming back correctly** —
discoverable in advance only by a **config-persistence audit**, or by rebooting it deliberately during a
maintenance window, **which is exactly why people reboot things on purpose.**
**The best beat:** an unplanned power event reboots the whole fleet at once and you discover your Boot
Confidence across forty machines simultaneously. §9.2's box with 1,847 days of uptime is the extreme
case of a stat every machine carries.

### The rollback, one-way doors, and the third category
Some changes can't be undone — and some stop being undoable while you watch.

**How it works:** Three categories, not two:
1. **Reversible** — undo within the window (§7.5).
2. **Irreversible (one-way doors)** — database schema migrations, data deletions, certificate
   revocations, a DNS TTL decision made hours ago. The UI marks these clearly and makes you confirm.
   **Knowing which doors swing both ways is senior-engineer knowledge, taught by a symbol.**
3. **Delayed-irreversible — the third and nastiest category: actions that are reversible *now* and
   become irreversible later.** A DNS TTL change is reversible until it propagates. A deleted snapshot is
   recoverable until the pool reclaims the blocks. A suspended customer is restorable until the retention
   window passes. A rotated key is recoverable until the old one is purged. A migrated database is
   rollback-able **until the first write lands on the new side.** **The UI shows a shrinking
   reversibility window** — turning "decide now or lose the option" into a visible timer, which is one of
   the most authentic pressures in the job.
**Visual — the ratchet glyph:** a half-circle with a pawl, in amber, on the confirm button *and* on the
object for the duration. **Irreversible actions confirm with a different shape entirely: not a dialog but
a physical slider you must drag**, labelled with what you are giving up. Reversible actions confirm with
a normal button. **You learn the ratchet in ten hours and then it does all the work.**
**The Two-Key Action:** the heaviest actions (delete customer data, revoke a certificate, drop a table,
cancel a circuit, terminate a tenant) require a confirmation that is *not* a click-through — **typing the
object's name**, or a second staff member's approval if you have one. Deliberate UI friction as a game
mechanic — and the game should let you turn it off in settings and then live with that.

### Salvage and the rebuild
After a loss, what remains.

**How it works:** Pull drives, recover partial data, reuse chassis, re-sign the customers who'll come
back. **Rebuilding is a playable state, not a game-over**, and rebuilding *better* is the emotional
payoff of the whole failure system.

### The Post-Mortem (screen, sheet, and progression hook)
Failure converted into progression.

**How it works:** After any major incident: a **timeline replay**, a **contributing-factors list**, the
**named red herring** (§7.6), the **Attention Heatmap** (§7.6), and **one Insight point** plus a choice of
which lesson to formalise — into a runbook, a policy rule, a monitoring unlock, or a prevention discount
(§5.1). **This is the single best place to put the game's teaching.**
**Visual — the Postmortem Sheet:** a form that **fills itself in with the timeline you just lived.**
Completing it costs staff time and yields a runbook tab, a Polaroid for the wall, and reputation. **The
paperwork is drawn as paperwork and it is worth doing.**
**Coupled to §7.5's settling window:** if two changes were in flight, the postmortem **cannot attribute
the cause and you get no unlock** — which is the mechanical reason to change one thing at a time.

### Root cause vs band-aid
The eternal choice.

**How it works:** The band-aid resolves the incident now, cheap, and adds technical debt. The root fix
costs hands and time you don't have during an incident, and prevents recurrence. **The correct answer is
band-aid now, root fix scheduled — and the game should track whether you actually did the second part.**

### The technical debt meters (four, not one)
Debt as a visible, growing, *itemised* substance.

**How it works:** An undifferentiated debt number is a guilt meter; **a list of named debts with costs and
paydown prices is a decision screen.** Four types, each with its own accrual rate and its own remedy:
- **Config debt** (hand-fixed servers, drift) — accrues per manual intervention; paid by a
  config-management run; **interest is incident probability.**
- **Knowledge debt** (undocumented systems) — accrues per undocumented change and per departing staffer;
  paid by writing; **interest is MTTR.**
- **Toil debt** (manual processes) — accrues as the fleet grows; paid by automation; **interest is hands
  consumed per month, which is the most painful currency in the game** and the version most likely to
  actually change player behaviour.
- **Structural debt** (architecture you have outgrown) — accrues with scale; paid **only** by a migration
  project; **interest is a cap on what you can build next.**
Two headline numbers make it legible to an engineer: **toil hours per week** (a number you can measure
and therefore justify a budget against) and the **Rebuildability index** (could you stand this up again
from nothing?).
**And a fifth meter in a different colour — commercial debt:** the non-standard contract terms you
signed, the grandfathered price tiers you maintain, the one-off SLA you promised, the discount you can't
undo, the feature you built for one customer, the reseller agreement from 2016 that nobody can find. It
accrues exactly like technical debt, **it is invisible until diligence**, and its interest is paid in
*your attention* rather than in staff hours. The postmortem and the Exit screen should show both.
**Visual:** rendered physically — cable spaghetti, sticky notes, dust, a growing pile in the corner (§9.2)
— and **paying it down plays a cleanup pass**: a staff sprite walking the aisle removing sticky notes,
coiling cable, wiping dust, over 20–30 seconds, **visible and slightly boring, which is exactly what it
is.** Per §9.6, make the boring thing beautiful.

### The Blame vs Blameless choice
See §5.4. Values with mechanical consequences.

### The death spiral and its three exits
Name the failure pattern and give it doors.

**How it works:** Outage → churn → less revenue → less investment → more outages. The game should
recognise when you're in it and **mark it.** Three exits exist: **cut scope** (shed a line of business),
**raise capital** (§6.11), or **fix the root problem and survive the lag.**
**Make the exits objects, not concepts:** when the spiral is detected, the Inbox presents **exactly three
cards** — **Shed** (sell or close a line), **Fund** (financing, at bad terms), **Fix** (a focused
root-cause project with a stated duration you must survive). **All three must be genuinely survivable**,
and taking none of them must be possible and fatal. Making the exits explicit turns despair into a
decision.

### The grace timer / the landlord at the door
Deadlines with a face.

**How it works:** When you can't pay — the colo bill, payroll, the transit invoice — you get a grace
period with a visible countdown and a **named person** asking about it. **A deadline with a face is worth
ten progress bars.**

### The repair loop: the Walk and the minigames
Repairs are physical, and you watch them happen.

**How it works:** **All repairs require a staff sprite to physically reach the object.** You watch them go.
This makes facility layout, spares placement and out-of-band management **felt rather than calculated**,
and it is the game's natural pacing mechanism — the distance from the office to rack 40 is a real cost.
**The Repair Minigames (optional, short, skippable):** reseating an optic (a small alignment gesture),
crimping a cable (a rhythm click), swapping a drive (drag the caddy out, drag a spare in). **All
skippable with auto-resolve at a time penalty**, all visually specific, none mandatory.

---
## 7.8 Per-type mechanical shifts

*§0.2 promised that changing hosting type changes the verbs. This is the mechanical inventory of what
actually swaps.*

### The Three-to-Five Change Rule (the variety budget, stated)
How different a hosting type is allowed to be.

**How it works:** **A hosting type must change 3–5 of the items in this section — and no more.** Change
two and it is a reskin; change eight and it is a different game and the player has to relearn everything
they earned. The corollary: **the core verbs never change** — `PLACE · LINK · TUNE · SCALE · SHIELD ·
INVESTIGATE · MAINTAIN · SELL` are present in every type; only **which of them is scarce and which is
decisive** changes. That is the entire anti-fragmentation thesis in one line, and it is what lets one
engine carry twenty businesses.

### The scarce-resource meter swaps
The main HUD meter is different per type.

**How it works:** Shared hosting shows **oversell contention**; VPS shows **overcommit ratio**; GPU shows
**kW and thermal headroom**; backup shows **durability and restore-test freshness**; CDN shows **cache
hit ratio**; email shows **IP reputation**; colo shows **occupancy and stranded capacity**; game hosting
shows **tick stability**; DNS shows **query latency at p99**; VoIP shows **concurrent channels and MOS**;
object storage shows **durability nines**; bulletproof shows **upstream patience.** **One meter swap does
more for variety than a hundred new buildings.**

### The commercial slider swaps (the fourth axis)
One signature economic dial per line, parallel to the one signature meter.

**How it works:** Shared = **oversell ratio** · VPS = **overcommit** · Colo = **power billing model**
(committed / metered / flat) · GPU = **reserved-vs-spot mix** · Backup = **restore-SLA tier pricing** ·
CDN = **commit level and overage rate** · Email = **outbound rate limits** · Game = **monthly vs hourly
billing** · VoIP = **rate-deck margin per destination** · Regulated = **attestation scope.** **Each
hosting type should feel different in the wallet as well as on the board.**

### Per-type sliders (the operational signature dial)
One dial per type, front and centre, always consequential.

**How it works:** Tick budget (game) · deliverability aggressiveness (email) · durability level (backup) ·
residency fence (regulated) · escort policy (colo) · abuse-triage sort order (bulletproof) · cache TTL
(CDN) · oversell ratio (shared) · inspection depth default (§7.10, everywhere).

### Time granularity changes
The clock itself is different.

**How it works:** Game servers run in **milliseconds** (tick rate). Ad-tech and financial colo run in
**microseconds**. Web hosting runs in **seconds**. Backup runs in **hours** (the window). Colo runs in
**years** (the lease). **The tempo of thought changes**, which is the deepest possible form of variety —
and §7.13's incident-time scale is permanently on for the millisecond types.

### What "pathing" means changes
The flow is not always traffic.

**How it works:** Web = requests along a path. Backup = **jobs through a window**, a Gantt-like scheduling
problem. Colo = **a tenant walking your floor** on a tour, then a lease, then their gear arriving. CDN =
**content propagating outward** through PoPs. Email = **messages through reputation gates.** HPC = **jobs
through a scheduler queue.** Satellite = **passes through a sky window.** Tape = **physical media through
a robot and a courier.** DNS = **a resolution walking a delegation chain.**

### Control granularity as a difficulty axis — across four independent scales
How much of the stack you actually control.

**How it works:** Control is not one scale; it is **four independent ones** — you may control the
**hardware**, the **software**, the **network**, and the **data** separately. Managed hosting = all four.
Dedicated = hardware and network. Colo = network and power only — **the servers are not yours and you
cannot fix them.** Reseller = none of the four, but you own the customer relationship. Cloud tenant =
software and data only. Wholesale = the building.
**Visual:** render it as a **four-pip badge per business line**, which instantly communicates "what can I
even do here" and explains why the same incident is a ten-minute fix in one line and a three-day
diplomatic process in another.
**The rule that makes reduced control fun rather than frustrating:** **every unit of agency you remove
must be replaced with two units of visibility.** The colo operator can't touch the tenant's server but can
see its power draw to the watt, its port counters, its inlet temperature and its airflow. Remove agency
*and* information and the level is simply annoying.

### Keyhole mode
The colo/managed extreme: **act through a keyhole.**

**How it works:** You see only the symptoms your tenant reports and the facility telemetry you own.
Diagnosis happens through conversation and inference; your verbs become **ask, advise, escort, escalate,
and prove it isn't us.** **A genuinely different game inside the same engine**, and a brilliant use of
information design.

### The Window mechanic (backup, maintenance, satellite)
A finite time box you must fit work into.

**How it works:** A Gantt-like bar; jobs must complete inside it; overruns collide with the business day.
Optimisation is packing, prioritisation and parallelism. **Scheduling as tower defense.**

### The Queue mechanic (HPC, render, transcode, GPU)
Jobs waiting, priorities, deadlines, fairness.

**How it works:** You allocate finite nodes to queued jobs with different deadlines, sizes and customers.
Starving a small customer to serve a whale is a visible choice. **The fairness question, made
mechanical** — and it is §7.11's QoS ladder wearing a different hat.

### The Geography mechanic (CDN, game, edge, DNS anycast)
A world map where distance is latency.

**How it works:** Placing PoPs is placing towers on a globe; each covers a region with a latency radius.
**The board stops being a rack and becomes a map**, and the same engine plays completely differently.

### The Floor Plan mechanic (colo, wholesale)
Lease rectangles on a floor.

**How it works:** You sell space as shapes: cabinets, cages, suites. Fitting tenants efficiently while
preserving contiguous space for a future big tenant is a packing problem with a business layer.
**Stranded capacity (§6.6) is the failure state and it is spatial.**

### The Durability mechanic (backup, archive, object storage)
Not uptime — **survival of data over time.**

**How it works:** A durability dial (how many copies, where, on what media, verified how often) against a
cost curve. Bit-rot, media failure and correlated loss attack it. **The only hosting type where the threat
is entropy on a decade timescale**, and the Restore Test is the only proof.

### The Reputation mechanic (email, bulletproof)
Your standing is the resource.

**How it works:** A single stat that gates whether your product works at all. Earned slowly, destroyed by
one bad customer. **Makes customer *selection* the main defensive verb** — which no other type does.

### Concurrency slots (VoIP, game servers)
Hard simultaneous limits.

**How it works:** You sell N concurrent channels/players; exceeding is an **instant hard failure, not a
slowdown.** **Binary capacity instead of a curve** changes how you build headroom — and it is the one
place the hockey stick doesn't apply.

### Unmanaged tenant objects
Things on your board you don't control.

**How it works:** In colo, tenant racks are objects you can see telemetry on and cannot touch. They draw
your power, generate your heat, block your airflow, and can cause your outage. **Your fate in someone
else's hands, on your own board.**

### Remote-site delay
Distance costs response time.

**How it works:** At multi-site scale a hands action at a remote facility has travel time, or costs a
**remote-hands fee** to someone else's technician **who will do exactly what you say and nothing more.**
**Delegation with latency** — and the source of the best comedy in the game.

### Era-locked tech
The tech tree is gated by period.

**How it works:** In a dial-up level you cannot buy a CDN; in a 2005 level you cannot buy containers; in a
1998 level your "DDoS mitigation" is a phone call. **Constraint as content** (§0.4).

### Multi-line tabs and the portfolio altitude
Running several businesses at once.

**How it works:** Each line is a tab/district with its own board; a **portfolio view** sits above them
showing shared resources, shared staff, shared facility and cross-line effects. **Attention becomes the
cross-line currency** — you can only be in one place, and §7.6's Board Diff is how you find out what
happened in the others.

### Time-axis connections (backup, archive)
Links that go into the past.

**How it works:** Backups connect a system to a *point in time*; restore points are nodes on a **timeline**
rather than on the floor, and a restore is a cable drawn backwards through it. **A second spatial
dimension that only one hosting type uses** is exactly the kind of thing that makes a type memorable.

### Contract drag (colo, wholesale, enterprise)
Decisions you cannot reverse this year.

**How it works:** Long leases mean your mistakes and your wins both persist. **Slows the whole game down**
and makes each decision heavier — the mechanical opposite of the hourly-billing types.

### The ticket-driven verb (colo cross-connects, remote hands, managed)
Some actions happen via paperwork.

**How it works:** A tenant files a ticket; you schedule it; a technician executes it; it becomes revenue.
**Work arriving as requests rather than as your own initiative** is a different feel entirely, and it is
the type where the Ticket Queue (§7.15) is the main board rather than a background pressure.

### Per-type QoS answers
The prioritisation question has a different right answer per type.

**How it works:** A **game host** prioritises in-session players over joiners. An **email host**
prioritises transactional over bulk. A **backup host** prioritises restores over backups (obviously — and
yet almost nobody configures it that way). A **CDN** prioritises cache fills over purges. A **colo**
prioritises *nothing*, **because you don't control the packets — which is itself the lesson.** See §7.11.

---
## 7.9 Meta-loops and rhythm

### Calm / storm rhythm
The macro tempo.

**How it works:** Peacetime is for building, tuning, documenting and preparing; storms are for executing
what you prepared. **The calm must be *mechanically valuable*, not dead time** — drills (§7.5), debt
payment, documentation, pre-mortems, policy authoring, reconciliation and forecasting all only happen when
nothing is on fire.
**The numbers:** target **60/40 peacetime to incident by wall clock**, with peacetime blocks of **60–120
seconds** — long enough to start something, short enough to stay engaged. **The anti-pattern to avoid:
peacetime blocks shorter than ~45 seconds produce a game where you can never finish an action**, which is
the most common failure mode of real-time strategy pacing.
**Note:** the baseline under this rhythm is continuous, not wave-gated — see §7.13's Wave Envelope for how
"waves" and "continuous flow" reconcile.

### The weather forecast / threat radar
Telegraphing.

**How it works:** An incoming-threat indicator with **increasing specificity as it approaches** — first
"something big," then "volumetric," then the specific signature. **Preparation is only a skill if you can
see it coming.** **Preview quality is itself a monitoring purchase:** an under-instrumented player flies
blind, which is both realistic and an excellent upgrade motivation.
**Named waves:** each event carries a visible name — *"Wave 7: Evening Peak + Firmware Recall"* — which
makes the telegraph memorable and makes the postmortem nameable.

### The seasonality calendar
The player plans against a known calendar plus unknown shocks.

**How it works:** Always visible: **Black Friday · game launches · fiscal year-end government buying ·
holiday freeze windows · hurricane season · grid peak months · audit dates · patch Tuesdays · certificate
expiries · contract renewals · customer launch dates · generator test dates.** Events collide on purpose.
**Knowing what's coming and still being unable to prepare for all of it is precisely how the job feels**,
and it is what makes the maintenance-window intersection puzzle (§7.5) bite.

### Opportunity events
Positive pressure, not just negative.

**How it works:** A chance at a big customer, a partnership, a hardware deal, a press feature — each with a
cost and a deadline. **A game that only threatens becomes exhausting; a game that also tempts stays
interesting.**
**The quota, stated:** **at least one opportunity per two threats**, and **at least one positive event per
level that requires no decision at all** — a customer says thank you, a referral arrives unprompted, the
graph is just good. **A game about operations needs unearned small joys or it becomes a grind about
guilt.**
**The positive-event vocabulary the business layer is missing:** a competitor's outage (migration
concierge) · a vendor's quarter-end discount · an inbound whale from a reference · a transit
renegotiation that lowers your cost · a utility efficiency rebate · an unexpectedly good renewal cohort ·
a customer being acquired by a bigger company that expands their contract · being added to a marketplace ·
a journalist writing something nice · **the IPv4 block you forgot you owned.**

### Reputation as a slow resource
The pacing governor.

**How it works:** Everything you do adds or removes a little; it moves on a monthly scale. **It is the
reason you can't just optimise this month**, and it connects §2, §3, §6 and §9's ethics dial into one
number. Remember the asymmetry from the Lag Table (§7.5): **damage is instant, repair is 6–18 months.**

### The three-clock rule
Always exactly three timers prominent.

**How it works:** One immediate (the current wave/incident), one medium (the month, the project, the
window), one long (the contract, the audit, the era). **Three clocks is enough pressure to be interesting
and few enough to be readable** — the document's single best pacing heuristic.
**Tension:** ⚔️ The design proposes roughly twenty timers across its sections — cert expiry, patch lag,
backup window, fuel gauge, renewal wave, audit deadline, breach-notification clock, the Lag Table,
on-call clock, settling windows, error budget, DNS TTL, satellite pass window, lease term, grace timer,
obligation rail, uptime streak, reversibility windows, second-failure window, drill confidence decay —
and then insists on exactly three.
**Resolution — a Unified Clock Ribbon plus a promotion rule:** **all timers exist, all live in one
ribbon, and the interface *promotes* exactly three to prominence by `urgency × consequence`.** The
three-clock rule becomes a **UI guarantee** rather than a content restriction, which is the only way to
keep both halves of the design.

### The Difficulty Director with an honest face
Dynamic difficulty that shows its own dial.

**How it works:** A small **"Heat" gauge** in the corner shows how hard the generator is currently pushing
**and why** — "you're 3 waves ahead of par," "you're on a losing streak." It adjusts only the **sawtooth
trough depth** and the **entropy budget**; it **never** changes the composition of a telegraphed wave and
**never** adjusts during an incident.
**Why it matters:** hidden rubber-banding is the fastest way to lose a systems-literate audience's trust,
and this audience is unusually systems-literate. **Showing the dial makes it a feature; hiding it makes it
a betrayal.**

### The month-end sequence as the business heartbeat
A rhythmic, slightly tense recurring beat.

**How it works:** Invoices fire, cash lands with a delay, failures go to dunning, payroll clears, the P&L
updates, the Cash bar visibly jumps, and the board meeting happens every N months with objectives and a
reckoning. **Making the invoice run satisfying is what gives the commercial half a pulse** — see §7.15.

---
## 7.10 Path shaping: the Millisecond Budget, Inspection Depth, and Suspicion Routing

*The headline critique of the wave-1 design was this: **it had no mazing.** It had a dependency graph as
the map, but it never let the player **bend the route for defensive advantage.** Every defense was
therefore "buy a filter and pay a global latency tax," which is a purchase, not a strategy. The three
mechanics in this subsection fix that: a **budget** that makes path length cost something real, an
**inspection ladder** that makes depth adjustable per node, and a **routing rule** that lets the player
build a long, hostile path for suspicious traffic and a short, fast path for everyone else. Together
they are the design's strategic core — and the reason the same board can be replayed differently.*

### The Millisecond Budget (your real health bar)
**Don't give the player a castle with HP. Give them a millisecond budget.**

**How it works:** Every defense, inspection, hop, proxy, queue and overloaded node **stamps a latency cost
onto packets passing through it.** Visitors carry a **Patience** value; cross it and **they bounce before
reaching you — silently, costing revenue, with no explosion and no alarm.** This inverts the genre's core
feeling: in normal tower defense, more towers = safer. **Here, more towers = safer but poorer**, and the
player must feel that ache constantly.
- **Patience is per-population and per-hosting-type:** ~800ms for a casual page load · 60ms for a game
  player · 4ms for a financial-colo tenant · 250ms for an API consumer · **12 hours for a backup job** ·
  a whole business day for a colo lease tour. The same board plays completely differently when patience
  changes, which is a free variety axis (§7.8).
- **The HUD shows a budget bar per lane:** green headroom → amber → red *"you are now leaking
  customers."*
- **It is the universal comparator.** One number lets you compare wildly different buildables: *"is this
  WAF worth 14ms?"* Nothing else in the design lets you price a defense against a feature against a hop.
- **The Latency Ladder** breaks the budget down by hop, so you can see *where* the time went, and the
  drag-a-cable preview (§7.2) shows the delta **before** you commit.
**Interacts with:** §7.1's queueing hockey stick (queue wait is the biggest and most sudden consumer of
budget), §7.2's adjacency numbers, §7.11's per-class budgets, §3's visitor patience, §6's conversion.
**Hosting types:** universal; it is the meter that never swaps, only rescales.

### Inspection Depth (the per-node ladder)
Not "do I own a WAF" but "how hard is this node looking."

**How it works:** Every node on a path may be set to one of four inspection levels. **It is a slider, not
a purchase**, which is what makes it tactical rather than economic:
1. **Pass-through** — 0ms, 0 confidence contribution.
2. **Sample** — 1 in 20 requests inspected. Cheap. **Catches sustained patterns; misses one-shots.**
3. **Inspect** — full latency cost, full confidence contribution.
4. **Challenge** — *active*: it asks the client to do something. Machines fail it and **humans resent
   it.**
**The tactical texture: Sample is the correct default and almost nobody realises it**, because it catches
the volumetric attacks and the sustained mimics for **5% of the latency**, and misses exactly the
single-shot exploit that a signature engine should be catching anyway. A player who learns this is
playing a different, better game than one who runs everything at Inspect.
**Interacts with:** Suspicion Routing (below — depth is what the slow lane is *made of*), §7.11's classes
(you may inspect class 4 deeply and class 1 not at all), §4.5's defensive buildables, §2.4's mimicry
threats.

### Suspicion Routing — the Two Lanes
**This is the mazing.**

**How it works:** Traffic is **scored on arrival**, not judged. The score determines **which path it
walks**:
- **The express lane** — short, shallow, cheap, a couple of hops to the service. Most legitimate traffic
  goes here and pays almost no budget.
- **The deep lane** — the long path the player *builds*: more hops, higher inspection depth, rate limits,
  challenges, tarpits, honeypots. Suspicious traffic is routed into it.
**The strategic consequence:** the player now has a reason to build a **long, ugly, hostile route** — and
to make it as long as they like — **because only suspicious traffic pays for its length.** That is
mazing, expressed in the vocabulary of the actual profession, and it is the mechanic wave 1 was missing.
Lengthening the deep lane is free against real customers and expensive against attackers; **getting the
score wrong is what makes it cost you**, because a false positive means a paying customer just got sent
down the maze.
- **The scoring inputs are all things the player builds or configures:** source reputation, ASN,
  behavioural history, authentication state, request shape, rate, geography, prior challenge results.
  Buying better scoring is buying a **cleaner separation between the two lanes.**
- **Promotion and demotion mid-path:** a request that behaves in the express lane stays; one that trips a
  check mid-flight gets **re-routed into the deep lane at the next hop**, which is visible on the board as
  a mote visibly changing tracks. Conversely a session that clears a challenge is **promoted** and stops
  paying.
- **Sticky suspicion:** scores persist per source for a while, so an attacker who probes you once walks
  the long path for the next ten minutes. **Defensive memory as a resource.**
**Visual:** the lane physically forks at the edge into two visibly different routes — a short bright line
and a long dim switchbacked one — and you can *watch* the ratio of motes taking each. A board where 40% of
traffic is in the deep lane is a board under attack, readable in one glance from across the room.
**Interacts with:** §7.1's two-directional flow (this is its resolution — same pipe, *separated by
score*), §7.11 (class and suspicion are two orthogonal sort keys), §7.2's link objects (the deep lane is
built out of real cables and real beads), §4.7's honeypots and decoys (which live at the far end of the
deep lane).
**Tension:** ⚔️ One wave-2 report argues the **opposite**: *"The board is a topology, not a maze. Resist
the urge to make this a maze game — the theme's tension is filtration, not routing length."* That position
holds that visitors follow the graph you wired and that placement should matter because of capacity,
adjacency and position, never because of path length. **Both are in the document deliberately.** The
reconciliation, if one is wanted: **you never maze the express lane** — the legitimate path stays a
topology, short and capacity-shaped — **and the only route you are allowed to lengthen is the deep lane**,
which carries traffic you have already decided you distrust. Filtration remains the theme; routing length
becomes the *punishment* rather than the *toll*.

### The Suspicion Dial (every defense is a classifier with a false-positive rate)
No defense in this game is binary.

**How it works:** Each defense has an **aggression slider**, settable per device, per lane, or globally:
- **Low aggression:** lets threats through, lets everyone through, cheap, fast.
- **High aggression:** blocks threats, **also blocks a percentage of real visitors**, costs more CPU, adds
  latency.
**The false-positive rate is *visible*:** blocked-visitor ghosts drift away greyed out with a little
**"403"** above them. **The player literally watches their own money get shot by their own turret.** No
tooltip has ever taught a tradeoff that well.
**Upgrades don't do more damage — they improve the ROC curve** (more true positives at the same
false-positive rate), which makes every defensive upgrade legible without a stat wall (§7.4).

### Classification confidence, not a boolean
The honest model underneath the dial.

**How it works:** Defenses do not "catch" or "miss." Each produces a **confidence score** per unit, and the
player sets an **action threshold**: below it, pass; above it, act. **The UI shows the live distribution
as a histogram with your threshold as a draggable line — and the overlap region, where good and bad
traffic score identically, is shaded, because that overlap *is the entire game.***
**Buying better classification narrows the overlap; it never eliminates it.**
**Why it's the best available expression of P1:** it turns the false-positive tradeoff into **a picture
the player drags**, and it gives every classify-type build one consistent upgrade axis.
**Combat resolution, shown honestly:** when a filter inspects, the roll resolves against the threat's
sophistication and the defense's aggression, and the result floats as text — **BLOCKED / MISSED /
FALSE POSITIVE** — with the last one **in your customer's colour, because that one hurts.**

### Threat units: Volume, Sophistication, Signature, Persistence
Three counter-axes, three distinct defensive builds.

**How it works:** Threats are units with four stats. **Defenses reduce Volume** (capacity-based —
scrubbing, anycast, rate limits), **test Signature** (classification-based — WAF, bot detection, reputation),
or **raise the cost of Persistence** (tarpits, proof-of-work, challenge escalation, lockout backoff).
Because there are three axes, **a threat that beats one defense may be stopped by another**, and an
all-in build on one axis has a shape of attack it simply cannot answer. This is what keeps the defensive
meta from collapsing onto one purchase.

### Aggro shaping (the player's control over threat pathing)
The other half of mazing: shaping where *threats* want to go.

**How it works:** Threats path toward the **most attractive reachable node**, where
`attractiveness = exposure × value × (1 − apparent_hardening)`. **All three terms are player-controllable:**
- **Exposure** — which ports and paths are reachable at all (firewall, segmentation, VLANs, the trust
  graph).
- **Value** — what is actually there. **Move the database behind a tier and it stops being the front
  door.**
- **Apparent hardening** — what the attacker can *see*: a visible WAF banner, a challenge page, a
  honeypot with exaggerated attractiveness. **Appearance and reality can differ, and the gap is a
  strategy** — an undefended node that *looks* hard, or a honeypot that looks like a jackpot.
**The security-surface overlay (§7.6) renders exactly this attractiveness field as brightness**, so the
player can **literally see where threats will go** and rearrange the board to change it. Suspicion Routing
shapes where visitors go; aggro shaping shapes where threats go; **together they give the design the
strategic depth a tower defense needs.**
**Interacts with:** §2.1's threat pathing, §4.7's decoys and honeypots, §7.2's trust topology.

### The Attack Surface Ledger (capability and risk are the same purchase)
The threat deck is built from the player's own construction log.

**How it works:** Every buildable carries **two numbers on its card: Capability** (what it lets you sell)
and **Surface** (what it invites). Adding a database raises the revenue ceiling of everything in front of
it **and unlocks SQL injection, slow-query storms and replication-lag events in the threat pool for the
rest of the level.** Adding an admin panel unlocks credential attacks. Adding a public API unlocks
scraping and abuse. Adding a customer-upload feature unlocks malware hosting and takedown notices.
**Why it's load-bearing:** it is the discovery engine, the difficulty curve and the morality play all at
once — **the game gets harder exactly because you got richer, and in the shape you chose.** It also makes
the security-surface overlay meaningful (your newest, best feature is the brightest thing on the board)
and it is the mechanical justification for the whole "more capability = more attack surface + more
upkeep" premise.
**Interacts with:** §2's threat generator (it reads your build log), §7.6's security overlay, §4's
buildable cards, §6's revenue ceiling.

---
## 7.11 QoS and traffic prioritisation

*Called **the single most obvious missing mechanic** in a design about a shared pipe. Everything above is
about stopping and slowing traffic; nothing in wave 1 was about **deciding whose traffic matters.** This
subsection is that decision, and it is the constructive half of P1: you cannot stop threats without
hurting visitors, but you **can** decide which visitors get hurt last.*

### QoS Classes and the Priority Ladder
Deciding whose packets, requests and jobs matter — in advance.

**How it works:** The player defines **3–5 traffic classes** and writes rules that sort incoming work into
them: **by customer tier, by request type, by authentication state, by endpoint, by source reputation, by
contract SLA.** Each class gets:
- a **weight** (share of capacity under contention),
- a **queue depth** (how much of it you are willing to hold rather than drop),
- a **shed-order position** (who goes first when the ladder starts walking),
- optionally its own **latency budget** and its own **inspection depth** (§7.10).
Under pressure the system serves high classes first and **drops or delays low ones automatically** — no
panic clicking required, because you decided this in peacetime.

**Why this one mechanic makes the whole game work better:**
- It gives the player a **peacetime decision with wartime consequences**, which is Pillar P3 made
  concrete — and it is the second-best peacetime screen after the Degradation Ladder (with which it
  shares a UI).
- It turns the **Shared Pipe** from a lament into a **control surface.**
- It converts §3.9's **Sacrifice Decision from a panic button into a standing policy** — you already
  decided who gets dropped, months ago, calmly, with a spreadsheet.
- **Getting it wrong is visible and specific:** you prioritised your whale, starved the long tail, and
  the review sites noticed.
**Visual:** the lane **physically splits into weighted channels** at the edge, channel width proportional
to weight, with class carried as an **edge stripe on each mote** so it never collides with the
threat/visitor colour semantics. Under contention you watch the low-class channel visibly narrow and then
close.
**Interacts with:** §7.1's mixed lane, §7.7's graceful degradation ladder (classes are what you drag onto
its rungs), §3.9's sacrifice, §4.4's edge tier, §7.10's suspicion score (class and suspicion are **two
orthogonal sort keys** — a high-value customer behaving suspiciously is the interesting case), §6.5's
tiering.

### Every hosting type has a different correct answer
The prioritisation question is the cheapest per-type variety axis in the design.

**How it works:** A **game host** prioritises in-session players over joiners (dropping a joiner is a bad
review; dropping a mid-match player is a refund). An **email host** prioritises transactional over bulk. A
**backup host** prioritises **restores over backups** — obviously, and yet almost nobody configures it
that way, which is exactly the kind of lesson this game exists to deliver. A **CDN** prioritises cache
fills over purges. A **GPU host** prioritises reserved over spot, and pre-empting spot is a product
feature, not a failure. A **VoIP host** prioritises in-progress calls over new ones. A **colo**
prioritises **nothing — because you don't control the packets, which is itself the lesson** about what
you gave up when you sold space instead of service.

### Selling the ladder (priority as a product)
The QoS tier is also a price tier.

**How it works:** Once classes exist, **they are sellable.** "Priority support," "guaranteed IOPS,"
"burstable vs dedicated," "premium routing," "we will never shed you" — each is a class with a contractual
promise attached and a higher price. **This is where the operational mechanic and the commercial board
meet**, and it creates the game's sharpest conflict: a class you *sold* is a class you cannot shed, so
**every premium customer you sign shrinks the set of people you are allowed to sacrifice.**
**Interacts with:** §6.5's tiering, §7.15's contract cards, §7.2's contract-driven pathing.

### Fairness vs value (the visible, uncomfortable dial)
Who you protect says what kind of company you are.

**How it works:** The sort order can be **by revenue** (protect the whale), **by fairness** (everyone
degrades equally), **by cost-to-serve** (protect the profitable), or **by contract** (protect whoever has
the biggest SLA credit exposure). **All four are defensible, all four produce different outcomes, and the
game should never say which is correct** — but it should report, at the end, which one you actually ran,
because players will be surprised.
**Hosting types:** the fairness posture is most visible in HPC/render queues, shared hosting and
bulletproof; it is invisible and still operative everywhere else.

---
## 7.12 The resource model: what is actually scarce

*Deliberately non-fungible. The design's whole texture comes from the fact that money cannot buy time,
time cannot buy attention, and attention cannot buy an eight-week hardware lead.*

### The eleven resources
Each is scarce in a different way and none substitutes cleanly for another.

**How it works:**
1. **Cash** — buys things, now.
2. **Credit** — borrowable cash with a future cost (§6.11).
3. **Power (kW)** — hard-capped per circuit, per rack, per room, per facility. **Hierarchical**, which is
   why the overlay matters.
4. **Cooling (kW of heat removal)** — must be ≥ power, and is **positionally distributed**: total capacity
   means nothing if it isn't where the heat is.
5. **Space (U / sq ft / weight)** — physical and non-negotiable.
6. **Bandwidth (Gbps, and the 95th percentile)** — shared, burstable, and **billed weirdly** (§6.3).
7. **IP addresses** — genuinely scarce in v4, a real constraint **and a tradeable asset.**
8. **Staff-hours** — the resource that gates *every* action. **Making change management cost staff-hours
   is what makes automation feel great.**
9. **Attention / on-call capacity** — a separate, smaller pool for incident response specifically (see the
   hands-vs-executive-attention tension in §7.5).
10. **Reputation** — slow to gain, fast to lose, **gates which customer classes will even talk to you.**
11. **Trust / Knowledge** — accumulated understanding of your own estate; **lost on turnover, gained via
    documentation and tenure.** And the beautiful part: **low knowledge should literally make the UI
    vaguer** — undocumented machines display with "?" labels (§7.6). Knowledge is the only resource that
    changes how the game *looks*.
Plus the one that is not a pool but a wall:
12. **Time / lead time** — **you cannot buy your way out of an eight-week hardware lead.** Expediting
    shortens it at a cost; nothing eliminates it (§7.5's ordering pipeline).

### Uptime Nines — the error budget as a spendable in-combat resource
**Instead of twenty lives, give the player downtime seconds.**

**How it works:** The lives counter is an **error budget** measured in downtime seconds for the period:
**99.9% over a 30-day level = 43 minutes of allowed downtime.** Every outage burns seconds. Burn it all
and you start paying **SLA credits** (money), then **churn** (income), then you fail.
**Why it's the right lives model:** it makes partial failure **survivable and interesting** — *a
90-second blip is a real cost the player can choose to accept while fixing something bigger.* Roguelike
and campaign structures need a spendable resource that **is** your life, and this is it. It also makes
the difference between 99.9% and 99.99% *felt* rather than quoted: four nines is **four minutes** for the
whole month, which changes every single decision you make about maintenance windows, in-place upgrades
and Ship-It-Friday.
**Spending it deliberately is a legitimate play:** taking a 40-second controlled outage now to avoid a
20-minute one later is exactly the trade a senior operator makes, and the budget is what lets the game
express it. The HUD should show the budget draining in real time during an incident, because watching
your remaining nines tick away **is the tension the genre's health bar was always standing in for.**
**Per-type:** the budget's size and the currency of its overrun swap — SLA credits (hosting), refunds
(game), regulatory findings (regulated), data-loss exposure (backup), reputation only (bulletproof).
**Interacts with:** §6's SLA credits, §7.5's maintenance windows (which **suspend** accrual — that's what
they're for), §7.7's degradation, §6.9's scoring.

### Capacity as the exchange rate between the two boards (the Bridge)
The one number both halves of the game spend.

**How it works:** Signing a contract on the commercial board **allocates capacity on the infrastructure
board.** Money flows right-to-left as capacity and left-to-right as revenue. **Over-signing creates
oversubscription — which is a deliberate, dial-controlled gamble, not a bug** (§7.15's Oversell Dial).
**A player who only plays one half loses**, and the Bridge is the mechanism that guarantees it.

### Staff-hours as the universal drain
The elegant one.

**How it works:** Support tickets, migrations, abuse takedowns, sales calls, audits, security reviews,
cable traces and incident response **all draw from the same pool.** Every business decision therefore
becomes **"what do my people *not* do this month."** And the best joke in the design falls out of it: the
Security Review column of your sales pipeline (§7.15) is staffed by **the same engineers your incidents
need** — sales and ops compete for the same tokens, and the game shows you the conflict as a shared pool
rather than telling you about it.

---
## 7.13 The simulation loop, written down

*The design has patience, latency, queueing, capacity, classification, budgets and two clocks scattered
across nine subsections, all of them assuming a tick model that is never stated. This subsection states
it. Nothing here is new content — it is the reconciliation that makes everything above commensurable.*

### The tick, step by step
One ordered pipeline that every unit of work goes through, every tick.

**How it works:**
1. **Arrival.** The generator emits units onto the ingress edges — a continuous diurnal baseline plus any
   active event envelopes (below). Each unit carries: `type`, `size/cost`, `patience`, `true_intent`
   (visitor or threat — **never shown directly**), and a `source` with a reputation history.
2. **Scoring.** Every classifier the unit passes produces a **confidence** contribution (§7.10). Scores
   accumulate along the path; they are never boolean.
3. **Classification into a QoS class** (§7.11) — by customer, endpoint, auth state, contract.
4. **Routing.** The unit is assigned a path: express or deep lane by suspicion score (§7.10), then a
   specific route by the load-balancing rule in force (§7.1), subject to **contract constraints**
   (§7.2's coloured locks).
5. **Per-hop service.** At each node: **is a slot free?** If yes, occupy it for `service_time` and add
   `service_time` to the unit's accumulated latency. If no, **enter the queue** for that class at that
   node. If the queue is at depth, **shed** according to the shed order.
6. **Queue wait.** `queue_wait = service_time × ρ/(1−ρ)` above ~70% utilisation, ≈0 below it (§7.1). This
   is where almost all latency comes from and why the curve is the most important thing in the game.
7. **Inspection cost.** Add the latency of whatever Inspection Depth the node is set to (§7.10).
8. **Dependency blocking.** A slot is **not released** until the unit's downstream dependency returns
   (§7.1). A slow dependency therefore consumes upstream capacity — this is the single most important
   coupling in the model, and the reason a healthy service dies of somebody else's disk.
9. **Patience check.** `accumulated_latency > patience` → **the unit bounces.** Silently. No explosion, no
   alarm, a lost conversion and an invisible reputation drip. This is the Millisecond Budget doing its
   work (§7.10).
10. **Outcome.** Served (revenue + satisfaction, and a return-path unit emitted), bounced (lost revenue),
    blocked (threat stopped — or a **false positive**, which is a lost customer wearing a threat's
    costume), or **landed** (a threat that reached something: damage applied per §2).
11. **Backpressure.** Queue depths propagate upstream: full queues fill the pools that feed them, which
    fill the queues that feed *those* (§7.1's red tide). Retries generated by timeouts and failures are
    **added back as new arrivals**, which is how the retry storm and the metastable state emerge rather
    than being scripted.
12. **State and economics.** Utilisation, heat, power draw, error budget, SLA clocks, debt accrual,
    confidence decay and the observed-truth layer (§7.6) all update, and the HUD reads *only* from the
    observed layer.
**Why write it down:** every mechanic in §7 is a modifier on exactly one of these twelve steps, which
means the design can be extended by naming the step rather than by inventing a subsystem.

### Ground truth vs observed truth
See §7.6. Restated here because it is a **tick-order rule**: steps 1–11 operate on ground truth; **step 12
writes the observed layer, and every UI element in the game reads that layer, not the truth.** Monitoring
purchases change the fidelity, freshness and coverage of step 12 — nothing else.

### The Time Model (one coherent clock scheme)
The design claims milliseconds, seconds, hours, months and years as "the tick." Here is the reconciliation.

**How it works — three nested clocks with stated ratios:**
- **Sim time** — **1 real second = 1 sim minute at 1× speed.** A 20-minute level is ~20 sim hours.
  Governs traffic, incidents, actions, waves, hands.
- **Business time** — a **month boundary every ~7 real minutes** (≈3 per level), triggering billing,
  payroll, churn and the P&L. A Lag Table consequence with a 90-day lag therefore lands **two to three
  levels later**, or — for within-level lags — on the Obligation Rail.
- **Incident time** — during a declared incident the game may drop to **0.25×**, so millisecond-scale
  phenomena (tick rate, jitter, p99, microbursts) become legible. **Game-hosting, ad-tech and financial
  colo levels run permanently at this scale** (§7.8's time-granularity swap).
**Stating the ratios makes every timer in the document commensurable, which currently it is not.**

### The Dual Clock rule (and the thing it prevents)
Two clocks, always both visible, with one hard rule.

**How it works:**
- **The Ops Clock** — seconds and minutes. Affected by pause and speed controls.
- **The Business Clock** — days and months. **Does not pause during an incident.** It keeps advancing
  while you firefight, which is precisely the feeling being modelled.
- **The rule: an action may belong to only one clock.** A restart is an ops action; a hire is a business
  action. **The player never has to convert between them.**
**Why state it:** it prevents the single worst possible outcome — **a game where you pause to fix a server
and accidentally pause your payroll.**

### The Wave Envelope (reconciling waves with continuous flow)
**⚔️ Tension, and its resolution.** Wave 1 treats both as canonical: §7.1 describes a continuous
two-directional stream with a diurnal shape, while §1.7 and §7.9 describe discrete named waves with
telegraphs, a pressure budget and a two-beat build/defend rhythm. **Both are load-bearing and they are
not the same model.**

**The resolution:** **baseline traffic is continuous and diurnal — it never stops and it has a shape.** On
top of it, the generator schedules **events**, and an event has a **ramp, a plateau, a decay, a
composition and a telegraph.** **A "wave" is an event envelope**, and a level's rhythm is the pattern of
events over the baseline.
**What this preserves:** everything §1.7 wants (two-beat rhythm, pressure budget, telegraph depth, named
waves, the sawtooth) **and** §7.1's continuous model (traffic never being zero, the diurnal curve,
peacetime that still has load in it, the ability to be ruined by a slow leak rather than by an assault).
**And it is another cheap variety axis:** different hosting types get **different baselines** (a backup
host's baseline is nearly zero with a nightly cliff; a CDN's is a smooth global sine; a game host's is a
sharp evening peak with a launch-day spike) **and different event vocabularies.**

### The Determinism and Fairness Contract
What the game promises about randomness — stated once, as a contract.

**How it works:**
1. **Every run is seeded and replayable.**
2. **No failure is unavoidable.** Every threat has at least one counter that was **purchasable before it
   landed.**
3. **Randomness determines timing and target, never existence.** The wave table is authored; the dice
   only decide **which drive and which minute.**
4. **A losing run must be explicable in one sentence on the postmortem screen.**
**Why it matters:** this contract is what lets the game be **brutal without being unfair**, and every
"realistic random failure" idea in the design depends on it. It is also the thing a systems-literate
audience will test for in the first two hours and never forgive the absence of.

### The correlated-event rule
Events are allowed to correlate, and the player is allowed to know it.

**How it works:** A **heatwave** raises cooling load, raises power price, raises hardware failure rate,
raises the chance of a utility event, and raises your neighbours' demand — **five effects from one
cause.** A **ransomware wave** causes many simultaneous DR declarations across your customer base. A
**widely-deployed vulnerability** causes every customer to patch at once, which causes a reboot storm.
**The design rule: a correlated event must be readable as one cause with many arms, not as five unlucky
rolls** — and **the postmortem should draw the arms.** Correlation without legibility is just a
difficulty spike; correlation *with* legibility is the most satisfying "oh, of course" the genre offers.
**Interacts with:** §7.1's correlated failure, §7.9's seasonality calendar, §2's generator.

---
## 7.14 Automation, standing policy, and the policy UI

*The design's entire tech tree is about automation and wave 1 gave it no interface. **You must be able to
see what your system will do without you.** This subsection is that interface — plus the ladder that
earns it, the safety rails that make it fair, and the failure modes that make it interesting.*

### The Policy Book (standing rules as a first-class object)
A book you write rules into, in game nouns.

**How it works:** Rules are composed — not scripted — in a constrained **when / for / then / unless**
form, built from a vocabulary of game nouns and verbs:
> *When* `web-tier CPU > 85%` *for* `2 min` *then* `scale out by 2` *unless* `budget remaining < $200`.
> *When* `a drive fails` *then* `open a ticket and dispatch remote hands` *unless* `it is the second
> failure in this array`, *in which case* `page me`.
> *When* `load > 90%` *then* `shed class 4`.
> *When* `p95 > 200ms` *for* `60s` *then* `raise inspection depth to Sample on the edge tier`.
Rules are **visible, ordered, editable and auditable**, and each carries a small **upkeep** (every rule is
a thing that can be wrong). The full late-game grammar is
`WHEN [condition] IF [guard] THEN [action] ELSE [escalate to]` — a card composer, never a scripting
language.
**Critically, rules can conflict, and the book shows conflicts.** Two rules firing on the same condition
is the origin of a wonderful class of self-inflicted incident: the scale-out rule and the cost-cap rule
fighting each other at 3am, visible in the ticker, costing money all night.
**A live "rules fired" ticker** lets you watch your own policy work — or misfire.
**The essential tension:** **a rule that is 95% right is better than a human who is 100% right and
asleep** — *and finding out which 5% is the late-game diagnosis puzzle.*
**Interacts with:** §4.6's runbook automation, §7.5's autopilot, §7.7's degradation ladder (which is a
specialised policy editor), §7.11's classes, §5.4's Runbook Ladder — **which drafts rules for you after
you have done something three times, the perfect on-ramp.**

### Ghost Hands (rendering automation)
**The best possible visual answer to "what does my tech tree actually do."**

**How it works:** Automated actions are performed by **translucent ghost staff sprites** that walk the
board and do the thing — the same walk, the same animation, the same time cost as a real hand. When an
automation is **armed but not firing, its ghost stands next to the object it watches, idle.**
**Therefore: your automation coverage is visible as a population of ghosts standing around your
datacenter — and the parts of your estate with no ghost are the parts where you are still the
automation.** You can survey your own delegation by looking at the room.
**Interacts with:** §7.7's The Walk (ghosts obey the same geography), §7.5's hands dock, §7.12's toil.

### The Dry-Run Toggle
Every automation can be observed before it is armed.

**How it works:** A rule in **dry-run logs what it *would* have done** without doing it. After N successful
shadow-firings the game **offers to arm it.** This is the correct way to deploy automation, rendered as a
mechanic — and it is what prevents "I automated it and it destroyed everything" from ever feeling unfair.

### Pre-authorized changes (planning as a buildable)
Queue a change that fires on a trigger.

**How it works:** During the business day you can queue a change to execute automatically at a condition —
"*if p95 > 200ms, add two nodes*", "*if the queue clears, start the migration*", "*if the attack exceeds 5
Gbps, engage upstream scrubbing*". **Turns planning into a thing you build rather than a thing you
intend**, and it is the bridge between the Inbox's deliberation and the Policy Book's automation.

### The Kill Switch / Stop The Robots
**The emergency verb the design was missing: pause your own automation.**

**How it works:** During an incident, the first correct action is very often to **freeze the autoscaler,
the orchestrator's reconciliation loop, the config-management run schedule, the auto-remediation rules and
the failover logic** — because otherwise **your automation will keep "fixing" things while you diagnose,
and its actions will be indistinguishable from the failure.** One button, instant, global, with per-rule
suspension available too. The visible cost: **everything you automated stops helping.**
**The lesson the game should teach by letting it happen once:** you must suspend the automation *before*
manually fixing something — demonstrated by the ghost hand walking over and **putting your fix back.**
**The great consequence:** if you forget to un-pause it afterwards, you spend the next level running
manually without realising it, until the first thing that should have auto-healed doesn't.
**Interacts with:** §4.6's autoscaler and config management, §2.9's bad fleet-wide playbook, §7.5.

### Delegation Bands
Who may do what without asking you.

**How it works:** Three bands per staff member (or per rule): **inform** (they do it and tell you),
**consult** (they propose and you approve), **execute** (they do it and you find out in the log). Widening
bands frees your attention and **increases variance**; narrowing them makes **you** the bottleneck.
**The scaling verb of the entire late game**, and it should be a **two-click matrix**, not a menu tree.
**And on the commercial side the bands are richer:** discount authority, credit limits, refund authority,
suspension policy, abuse-desk aggressiveness, escalation thresholds, whether sales may sign non-standard
terms (§7.5).

### Delegation and subsystem ownership
Give a person a system, not a task.

**How it works:** Assign a senior engineer to **own** a subsystem; they handle its routine incidents
without you, absorb its toil, and accumulate knowledge about it. **Frees attention, costs salary, and they
can be wrong** — and when they leave, their knowledge leaves (§7.6's Blast Radius of a Person, §7.7's
knowledge debt).

### The Handoff (what the player must say to the machine)
**The most interesting possible expression of "you cannot be everywhere."**

**How it works:** When you set a delegation policy, hand off a shift, or go off-shift at a level boundary,
you **write a handoff**: pick three things from a generated list of candidate lines — *"watch the replica
lag," "the cache node is new," "don't touch rack 4," "the customer in cage 12 is escalating."*
**What you include is what your staff and policies will actually act on; what you omit, they won't.**
**Omitting the thing that breaks is the game's best self-inflicted wound** — a five-second interaction
with a twenty-minute consequence, and a genuinely novel strategy verb. (It is the best idea in the co-op
NOC mode, pulled into single-player where it belongs.)

### Runbook Cards
Pre-authored incident responses you drag onto an active incident.

**How it works:** A documented procedure becomes a **card** you can drag onto a live incident; it executes
the steps in order, faster and with a lower error rate than improvisation, occupying a hand for its
duration. **Building your runbook library IS the meta-progression of an ops game** — and during an
incident the cards you own are the buttons on your Quick-Bar (§7.5), while the ones you don't own are the
empty space.

### Alert routing
What pages a human at 3am versus what waits.

**How it works:** A routing table in the Policy Book: severity → destination → time-of-day rule →
escalation path. **Over-paging burns out staff; under-paging misses incidents**, and both have their own
failure animation (§7.6's alert fatigue, §7.7's undetected incident).

### Batch and Fleet operations — as an earned capability, not a UI feature
**The unlock ladder that makes micromanagement into a tutorial.**

**How it works:** Early game, **every action is per-object — deliberately.** The ladder is then:
1. **Select many** (marquee, with a cyan outline and a count badge).
2. **Apply one action to many** — with a progress bar and a **per-object failure rate**, animated **as a
   wave across the selection** so you can see the order and **catch it mid-flight.**
3. **Apply by tag or query** — *"all nodes with patch lag > 20 days."*
4. **Standing rules** — *"keep this true."*
**Each step is a discrete, enormously felt unlock**, and making it an unlock means **the pain of doing it
by hand is the tutorial for why automation matters.**
**The mandatory safety rails at every rung:** a **blast-radius preview** ("this will affect 47 machines
and 12 customers") and a **rollout policy** — all at once / canary / rolling / one rack at a time.
**The rollout policy is where §4.6's config-management threat lives**, and putting it in the UI means
**the player chooses their own blast radius every single time.**
**Interacts with:** §7.2's declared intent, §5.4's Runbook Ladder, §7.4's snowflake budget.

### Policy authoring as the late-game verb
From Tier 4, your primary interaction shifts from *acting* to *writing rules that act*.

**How it works:** The player stops issuing orders and starts maintaining a system that issues them.
**Wrong rules execute faithfully.** The game's late-game diagnosis puzzle becomes *"which of my forty
rules is doing this"* — read the ticker, check for conflicts, dry-run the suspect, watch the ghost.
**Why it matters:** §7.5's "executive attention as a tiny pool" describes a brilliant arc — the game takes
the controls away and gives you a company — **and currently there is nothing to *do* at the far end of
it.** Policy authoring is that thing, it is genuinely engaging, and it makes the apprentice-level tutorial
retroactively the tutorial for the endgame.

---
## 7.15 The commercial board: the other half of the map

*Framing: **the game has two boards that share one resource pool.** The **Iron Board** is the
infrastructure — lanes, placement, pathing, defenses. **The Book** is the commercial board — pipeline,
contracts, billing, reputation, churn, abuse. **Capacity is the exchange rate between them** (§7.12's
Bridge). Money flows right-to-left as capacity and left-to-right as revenue, and **a player who only plays
one half loses.** Everything here uses the same verbs and the same connection gesture as the Iron Board
(§7.2's "contracts are cables"), which is what keeps it one game instead of two.*

### The Pipeline Board
The sales funnel as a physical object, parallel to the infrastructure graph.

**How it works:** A kanban of deals moving left to right: **Lead → Qualified → Technical Review → Security
Review → Proposal → Procurement → Signed → Installed → Billing.** Each column has a **capacity** (how many
deals your team can work at once — *hands again*), a **stage-conversion rate**, and an **average
duration**. Deals **decay if they sit** — a stalled deal is a lost deal, shown as a fading card with a
decay timer. Sales staff work them automatically; the player intervenes on the big ones.
**Why it belongs in §7:** **the board teaches throughput thinking exactly the way the infrastructure board
teaches queueing** — flow, bottleneck, backpressure, WIP limits — and it uses the same visual identity, so
learning one teaches the other.
**The good joke:** **your Security Review column is staffed by the same engineers your incidents need.**
Sales and ops compete for the same token pool, and the game shows you the conflict rather than telling
you about it.

### The Contract Card
Every client is a card, and reading the fine print is gameplay.

**How it works:** Each carries **MRR, term length, start/end date, SLA tier, notice period, escalator,
termination fee, support entitlement**, and **one or two special clauses**: *most-favoured pricing ·
unlimited liability · right to audit · no price increases · assignment restriction · custom SLA.*
**Bad clauses are cheap to accept now and expensive at Exit.** Contracts also carry the **routing
constraints** that become level geometry (§7.2's contract-driven pathing).

### The Deal Sheet (negotiation as clause-level trading)
The negotiation minigame, made concrete.

**How it works:** Both sides have a sheet of terms. Each term has a **value to you** and a **hidden value
to them**: price, term length, SLA tier, credit cap, liability cap, payment terms, escalator, ETF,
assignment, MFN, audit right, notice period. **You trade** — give net-60 to get 36 months; give a 3% cap
on credits to get an escalator; refuse MFN and offer a bigger discount instead.
**Each concession writes a permanent line onto that client's card, and the game remembers it for the rest
of the campaign.** Three levels later, **the MFN you accepted reprices your best account.**

### The Renewal Window
A contract card starts pulsing 90 days before expiry.

**How it works:** You can **renew flat, renew with an escalator, upsell, or let it lapse. Doing nothing =
it lapses.** Colo and enterprise levels live and die here, and the renewal wave is one of the three
promoted clocks (§7.9) in any level built on term contracts.

### The Invoice Run
The game's monthly heartbeat.

**How it works:** Invoices fire, cash lands **with a delay**, failures go to dunning, and the Cash bar
visibly jumps. **Making this a rhythmic, satisfying, slightly tense monthly event is what gives the
commercial half a pulse** — and it is the moment the two ledgers (below) disagree most visibly.

### The Churn Queue
At-risk accounts, surfaced with a reason code.

**How it works:** You have **limited intervention actions per month** — discount, escalate, call, or **fix
the actual problem**. **Scarcity of intervention is the point: you cannot save everyone, so you triage by
value**, and the game quietly records whether you always chose the whale.

### The Abuse Queue
Inbound complaints with SLA timers.

**How it works:** Clearing them costs staff time; ignoring them advances the **upstream escalation
ladder** toward your own provider disconnecting you. **On bulletproof levels the queue *is* the level.**

### The Ticket Queue
The same shape, a different currency.

**How it works:** Support tickets **walk into a queue lane and age**; overdue ones turn red. Unanswered
tickets convert into churn **with a 30–60 day lag**, which the game should *show* with a **ghosted
forecast** so players can learn the causal chain rather than being surprised by it. Hiring L1 fixes the
symptom; fixing the thing generating the tickets is better and slower.

### The Phone
High-value customers call.

**How it works:** Answering **costs attention** and prevents churn. A ringing phone during an incident is
the purest expression of the game's central scarcity, and **the correct answer is not always to pick it
up** (see §7.5's Communicate action, which is the scalable alternative).

### The Capacity Planner
The central strategic loop of the mid-game.

**How it works:** A forward-looking chart: **committed capacity vs contracted demand vs forecast.**
Ordering hardware has a lead time (§7.5), **so you must buy against a forecast.** Buying too early burns
cash; buying too late loses deals. This is the screen where the Iron Board and the Book are the same
problem.

### The Oversell Dial
A deliberate, dial-controlled gamble.

**How it works:** Per-node, set the subscription ratio. **Higher = more margin, more risk of a performance
incident when usage correlates — and it *will* correlate:** Black Friday, a game launch, a backup window,
a viral moment, a patch Tuesday. The dial is the signature commercial slider for shared hosting and VPS
(§7.8), and the correlated-event rule (§7.13) is what makes it bite.

### The Pricing Console and the Rate Card as a live object
Not a settings screen — a thing on your desk you edit and print.

**How it works:** Editing the rate card mid-level is allowed and consequential: **existing customers are
unaffected (grandfathered by default), new customers price off the new card, and quotes already
outstanding honour the old card until they expire.** That last rule creates real tactical texture — a
price increase has a **queue of pending deals grandfathered into it**, and knowing that queue's size is
worth money.

### Discount authority as a delegation slider
Extends §7.14's delegation bands into the wallet.

**How it works:** Set the % discount each role may grant without approval. **Higher = faster deals, worse
margin, and a discount spiral you discover in the quarterly P&L. Lower = better margin, slower deals, and
your executive attention consumed approving $200/mo discounts.**

### The Two Books toggle
One HUD switch between **cash view** and **accrual/P&L view**.

**How it works:** The same month looks different in each. Cash view shows a prepay landing as a **spike**;
accrual spreads it across twelve months. Cash view shows a hardware purchase as a **crater**; accrual
shows a small depreciation line. **Toggling it should be something the player does constantly, because it
is what real operators do constantly** — and it turns the two-ledger idea into an *interaction* rather
than a readout.

### The Commit Ledger
A rail of obligations: what you owe, to whom, until when.

**How it works:** Transit commits, power contracts, hardware leases, licence minimums, marketplace revenue
shares, agent residuals, the office lease, **and the SLA credits accruing right now.** It is the negative
of the backlog board, and it is what §8.8's Obligation Rail should actually contain.

### The Quarter Close
A recurring 30-second sequence with real decisions.

**How it works:** At quarter end: **which deals can you pull forward** (at a discount, borrowing from next
quarter), **which revenue can you recognise, which expenses can you defer, and what do you tell the
board?** Every choice is legal; **every choice is a loan from the future**; and the game tracks how many
quarters in a row you have borrowed — which is how a real company ends up restating.

### The Forecast Commit
You tell the board a number, then live inside it.

**How it works:** Commit to next quarter's MRR at the board meeting. Beating it is good; missing it
triggers pressure events (cut costs, raise prices, fire people). **Hitting it by pulling deals forward or
discounting is the trap: you hit the number and empty the pipeline.** **Difficulty as a dial you set with
your own mouth** — a self-imposed constraint whose size the player chooses.

### The Board Meeting and the Advisor
The soft timer and the voice that tutorialises without a tutorial.

**How it works:** Every N months the board sets objectives and holds a reckoning — a soft timer that shapes
strategy without dictating it. Alongside it, an in-fiction **old operator** says true things at the right
moment (*"kid, nobody ever went broke selling annual plans"*), which is how the design delivers its
wisdom without a tooltip.

### The Org Chart
Hire, assign, and burn out staff.

**How it works:** Each person has a **specialty, a ramp time, a salary, a morale stat and a knowledge
set.** **Overworking staff causes outages *and* resignations**, and a resignation takes knowledge with it
(§7.6's Blast Radius of a Person, §7.7's knowledge debt).

### The Budget Allocator
Marketing spend across lanes, with late attribution.

**How it works:** Split spend across acquisition channels; **CAC and lead quality per lane update with a
lag, because attribution is always late** (§7.5's Lag Table). Turning a channel off is instant; turning it
on is not.

### Delayed damage and the churn forecast
The signature mechanic of the commercial half.

**How it works:** Outages, bad support and price hikes **don't churn customers instantly — they set a
fuse.** A forecast overlay shows the **projected churn from this month's sins landing two months out.**
**Players learn to read consequences before they arrive**, which is the entire skill the business layer
teaches.

### Insurance and hedges (things that do nothing until they do everything)
A whole mechanic class.

**How it works:** Purchases that have **no effect unless something bad happens**: a redundant processor, a
second transit provider, a fuel contract, a cyber policy, tested backups, documented runbooks, a spare on
the shelf, a standby contract with a remote-hands vendor. **The game should routinely reward players who
buy them — and occasionally show a player who skipped them getting away with it, so the choice stays
real.**

### Business-shaped difficulty levers
Difficulty expressed as a business situation rather than a number.

**How it works:** **Market conditions** (price war / boom / credit-tight) · **starting posture**
(bootstrapped: cash-poor, no debt; venture-funded: cash-rich, growth-gated; **inherited**: an existing
business with legacy customers, technical debt, and one furious whale) · **customer mix** (a book weighted
toward cheap, high-support customers is a hard start) · **regulatory intensity** (which jurisdiction) ·
**Legacy Debt Modifier** (start with undocumented systems and grandfathered pricing).
**Why it's better than a difficulty slider:** each of these changes *what you do*, not *how much health
the enemy has* — and they compose with the hosting type to produce genuinely different campaigns.

---
## 7.16 Interaction laws and readability at scale

*A board that grows from four objects to three hundred needs rules, not features. These are stated as
laws because they must hold across every screen in the game, including the ones nobody has designed yet.*

### Everything Is a Thing
No abstract menu where an object could exist.

**How it works:** Want to add a server? **Order it from the catalog, watch it arrive, rack it.** Want to
connect two things? **Drag a cable.** Want to change a setting? **There is a panel on the device.**
The HUD exists **only** for things that genuinely have no physical form — money, time, alerts, scores.
Everything else is furniture you can point at: the NOC wall, the Degraded-Mode Console, the Big Red Button
under glass, the Inbox deck, the Hands Dock, the crash cart, the parts bin.

### The Two-Action Rule
**Nothing that must be done *during* an incident may take more than two inputs.**

**How it works:** Everything deeper — tuning, wiring, policy authoring, plan building, negotiating — is a
**peacetime activity** and is allowed to be as deep as it likes. Concretely: **every object's inspector has
an "Act" row of at most four one-click emergency verbs at the top, above everything else** — drain,
restart, isolate, shed.
**Why it's a law:** a game with this much configuration depth will be unplayable under pressure unless the
crisis verbs are structurally separated from the design verbs. **This is the rule that makes both halves
possible.**

### The Selection Grammar
Three distinct states, each with a distinct look.

**How it works:** **Hover** — a thin white outline and a hover card; **no world change.** **Select** — a
white base ring on the floor beneath the object, the inspector opens, dependency ghosting fires (§7.2).
**Pin** — the object gets a physical clip/bookmark tag, **stays highlighted while you select something
else**, and a **tether line** runs from it to a **docked mini-inspector at the screen edge.** You may pin
up to four.
**Why pin matters:** **pinning is how you watch the database while you fix the cache**, and no strategy
game does it well. It is also the input to the Watchlist's postmortem scoring (§7.6).

### The Squint Test (a design rule for every screen)
**Every screen must be evaluated at 25% size with detail at 10% opacity. If the single most important
thing isn't still visible, the screen fails.** Applied to every altitude tier, every overlay, every mode.

### The Icon Budget
Prevent glyph soup by construction.

**How it works:** A **hard cap on simultaneously-drawn alert glyphs per screen region.** Overflow merges
into a **"+7" cluster badge** that expands on hover. The cap is enforced by the renderer, not by
authoring discipline, so it cannot be violated by a content update.

### Clustering with Intent
At scale, draw the exceptions and summarise the rest.

**How it works:** At Tier 3+, **identical adjacent states merge into one labelled region** — *"Row C: 14
nodes, healthy"* — drawn as a single soft outline. **Only the exceptions stay drawn individually**, so
your eye is pulled to them automatically without a single blinking pixel.

### The Exception Spotlight
Not a flash — a lowering of the surroundings.

**How it works:** In a sea of healthy green, one amber unit gets a **subtle radial darkening of everything
around it.** **Far less fatiguing than blinking and far more effective**, and it composes with clustering
rather than fighting it.

### Motion as the Last Channel
A calm facility should look calm.

**How it works:** **Colour, shape and position are used first; motion is reserved for things that need
action now.** Idle animations subtle, LEDs slow-breathing, cable sag static. **The contrast is what makes
an emergency register instantly** — and it is why the flapping state (desynchronising from the global
heartbeat, §7.7) is so noticeable.

### Alert Taxonomy — exactly three tiers, three distinct looks
**How it works:** **Toast** (bottom-right, slides in, no sound, auto-dismisses — informational) ·
**Badge** (a persistent pip on the object *and* on the Rack Ribbon — needs attention) · **Klaxon**
(screen-edge red vignette pulse, a sound, and a camera offer — act now). **Never more than one klaxon at
a time; additional criticals queue behind it.**

### The Vignette Language
Peripheral vision doing real work.

**How it works:** Screen-edge tints communicate global state without consuming layout: **red pulse** =
critical incident · **blue** = brownout/power · **white** = suppression discharge · **violet** = audit in
progress · **gold** = a big payday landing.

### The Rack Ribbon
How the endgame stays navigable.

**How it works:** A thin persistent strip along the bottom of the chrome: **one slim vertical bar per
rack**, coloured by that rack's single most salient state. **200 racks fit in a strip.** Click one to fly
there. It is the minimap for a facility that no longer fits on screen.

### Quiet Mode
How you actually operate late-game.

**How it works:** A toggle that **hides everything healthy entirely**, leaving only problems drawn on a
dark ghost of the facility. Combined with the Watchlist, it is the difference between a Tier 5 board being
overwhelming and being *readable.*

### Colourblind shape-coding (every semantic colour also has a shape)
**How it works:** Health states carry a small glyph — **● healthy, ▲ warning, ■ fault, ✖ down.** Threats
carry an **angular chevron**; visitors a **round mote**; money a **hexagon.** Full
deuteranopia/protanopia/tritanopia palettes, **plus a "patterns" mode using hatching for zones.** Combined
with §7.2's non-colour link channels, the whole game survives greyscale.

### Text Scale Independence and the Label Budget
**How it works:** All HUD text lives in the Chrome layer and **never scales with zoom**; a user-settable
global UI scale (75%–200%) **reflows panels rather than magnifying them.** Device labels render only at
close altitudes, and even then only for **selected, alerting, or player-pinned** objects — and **you can
pin a label to any object permanently** (a drawing-pin icon), so players build their own personal label
layer over the parts of the estate they care about.

---
