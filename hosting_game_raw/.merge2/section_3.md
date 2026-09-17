# 3. Visitors, traffic, and clients

*The other half of the tower defense. Threats approach and must be repelled; visitors, traffic and
clients approach and must be **attracted, guided, and delivered intact**. This section covers what a
visitor is, what makes it bounce, what kinds of customers exist behind the traffic, how you go get
more of them, and how every one of those things is reskinned when the hosting type changes.*

**The two populations the game must never conflate.** *Traffic* is transient — a request, a player
join, a backup job, an inference call. *Clients* are persistent — accounts, tenants, contracts.
Traffic generates **satisfaction**; satisfaction over time generates and retains **clients**; clients
generate **money**, and at Tier 3+ clients generate the traffic. A level can be scored on either axis,
and that choice alone changes how it plays. Stated as a CEO would: **serving traffic well is defense;
landing clients is offense.** A level where you serve traffic perfectly and land no clients is a slow
death by zero growth.

**The funnel is the spine.** A visitor is not one entity — it is an entity that *transforms* as it
walks:
`Impression → Click → Lead → Trial/Order → Provisioned → Paying → Renewed → Expanded → Advocate`
…and it can **bounce, fail fraud check, fail to provision, churn, or dispute** at each step. Every one
of those exits should be a visible, animated, countable loss. The player's real job is widening the
pipe at whichever stage is leaking.

---

## 3.1 The visitor model

### Patience as HP — the unified visitor spec (the reverse creep)
The central design claim: **visitors are not "score," they're fragile units with patience meters** —
and they should be as mechanically interesting as threats. The visual is exactly a TD health bar,
except **you** are the one damaging it by building things. An instantly legible inversion.

⚠️ **Consolidation note.** Wave-1 carried "Patience as HP" and "Latency budget as visitor HP" as two
entries; they are two names for one model and will drift if kept apart. Merged spec: **a visitor is a
unit with a millisecond budget and a value.** Patience *is* the budget. Every node the visitor passes
through subtracts that node's *current* response time. Error and trust events subtract fixed large
chunks or end the unit outright. Reaching the conversion node with budget left = revenue; hitting zero
= bounce. One model, one bar, one number, drawn as the patience ring. The Latency Ladder is its HUD;
the Millisecond Budget is its constraint; the bounce-cause taxonomy in §3.4 is its damage-type table.

**How it works:** Each visitor spawns with a Patience bar denominated in milliseconds. Every hop,
every queue, every error page, every friction gate drains it. Bounce is a **sigmoid on budget
consumed**, not a hard step, so near-misses feel near. This makes *every* engineering decision
legible: adding a hop costs budget; adding a cache refunds it. It also makes latency a **pathing**
mechanic, which is exactly what a tower defense wants.
**Interacts with:** P1, P9, §3.4 in full, §4.5 defenses, §7.1 capacity.

### A visitor is a five-stat unit
Everything in the game reuses these five numbers, and reskinning them is how one system covers page
loads, game sessions, backup jobs, inference requests, and a colo tenant touring the building.

**How it works:** `Patience` (latency tolerance before bounce) · `Value` (revenue if served) ·
`Weight` (capacity it consumes) · `Loyalty` (chance to return / become a customer) · `Fragility` (how
badly it reacts to a *partial* failure). A DNS query is `patience 100ms / value ~0 / weight ~0 /
loyalty n/a / fragility low`. A colo tour is `patience months / value enormous / weight one cabinet
row / loyalty 5 years / fragility catastrophic`. Same five slots.
**Interacts with:** §3.3 per-type costumes, §8's visual grammar.

### Visitors take damage from *your* stack
They don't get shot by enemies; they get worn down by queueing, inspection, retries, and errors.

**How it works:** Watching your own defenses erode your customers is the emotional core of the game
and must be legible in one glance. This is the rule that makes §4.5's shopping list morally
interesting: every tower you place is a small tax on the people paying you.

### The closed loop — patience, latency, queueing, and slots, written out once
**Problem the merge fixes:** wave-1 described patience drain, the latency ladder, capacity-as-slots
and the queueing hockey-stick as four separate ideas and never connected them, which makes the system
unimplementable and untunable. Here is the whole loop:

```
For each node:
  slots        = concurrency capacity (an integer, upgradeable)
  in_flight    = requests currently occupying slots
  utilisation  = in_flight / slots
  service_time = base_ms  (a property of the node and its tuning)
  queue_wait   = base_ms * (utilisation / (1 - utilisation))     ← the hockey stick
  node_latency = service_time + queue_wait
  (at utilisation >= 1: arrivals enter a bounded queue; past queue_max they are dropped)

For each visitor:
  budget_ms    = patience (per archetype)
  on entering a node: budget_ms -= node_latency
  at each friction gate: roll against gate's friction% -> pass / challenge / drop
  budget_ms <= 0  -> bounce (record where, and why)
  reaches goal node with budget left -> convert, pay Value
```

**Three consequences worth stating loudly:** (1) **latency is not additive across a static list, it is
emergent from load**, so the Latency Ladder must show *live* per-node values, never spec-sheet values;
(2) the hockey stick falls straight out of the formula rather than needing to be authored; (3)
**headroom is purchasable as slots**, which finally connects §4's buildables to §3's bounce model
numerically.
**Interacts with:** §7.1 capacity, §4 buildables, §3.4.

### The Latency Ladder readout
The Shared Pipe pillar rendered as one widget: the player can see exactly which tower is eating their
revenue. Simple, constant, merciless.

**How it works:** A running tally above the lane — `Edge 8ms + WAF 40ms + LB 3ms + App 120ms + DB
200ms = 371ms` — drawn as stacked coloured segments on a vertical bar with a horizontal **bounce
threshold line**. Add a WAF and a new segment visibly pushes the total past the line. Next to it, the
bounce curve.

**Expansion 1 — show the distribution, not the sum.** The same stack with a 371ms mean can have a
340ms p50 and a 3,200ms p99 if one hop has a long tail (a GC pause, a slow disk, a lock). Because a
request must traverse *every* hop, **tail latency compounds**: five hops each with a 1% slow path make
roughly 5% of requests slow. Render each ladder segment with a **whisker**, and let the player
discover that the fat whisker, not the tall bar, is what's killing conversion. This is the single most
important and least-known fact about multi-tier latency, and it argues directly for fewer hops.

**Expansion 2 — round trips, not milliseconds, for distant visitors.** For a visitor 150ms away, what
matters is how many *round trips* your stack requires (DNS → TCP → TLS → redirect → HTML →
subresources), because each costs a full RTT. Show **RTT count** alongside server time for geo-distant
cohorts. It explains why §3.4's redirect chains and TLS handshake costs hurt so much, and it makes a
CDN purchase obvious in a way an ms figure never does.

**Baseline node costs (idle service time, before queueing) — a proposed tuning table:**

| Node | Base ms | Notes |
|---|---|---|
| CDN edge hit | 5–15 | never reaches your board |
| Reverse proxy / edge | 2–5 | plus TLS on first connection: +40–80 |
| L4 load balancer | 1–2 | |
| L7 load balancer | 3–8 | path routing costs |
| WAF | 20–60 | tunable with aggression; 40 is a good mid |
| CAPTCHA challenge | 2,000–8,000 | it is a *human* interaction, and that is the point |
| Rate limiter | <1 | cheap, which is exactly why it is over-used |
| App server (static) | 5–20 | |
| App server (dynamic, uncached) | 60–250 | the biggest dial in the game |
| Cache hit | 1–3 | |
| Cache miss penalty | +DB latency | |
| Database (indexed read) | 2–10 | |
| Database (unindexed / full scan) | 400–4,000 | the Noisy Query's actual weapon |
| Search index | 15–60 | |
| Object storage GET | 20–80 | |
| Cross-region hop | 60–160 | geography, not software |
| Scrubbing detour | +15–40 | the price of protection |
| Cold start (serverless) | 300–1,500 | |

**Interacts with:** §3.4, §4.5, §7.1, the Millisecond Budget below.

### The Millisecond Budget (defense selection as a knapsack)
The Latency Ladder promoted from a readout to a **constraint**.

**How it works:** Each level states a latency budget derived from its dominant visitor archetype —
"*Your customers bounce past 400ms. You have 400ms to spend.*" Every hop and every defense has a
published ms cost and a published confidence gain. The budget is drawn as a physical ruler at the top
of the screen with your current path stacked against it. Indicative starting tuning:

| Element | ms | Confidence gain | Friction |
|---|---|---|---|
| Edge/ASN reputation check | 2 | 0.25 | 0.2% |
| TLS fingerprint | 4 | 0.30 | 0.3% |
| L4 rate limiter | 1 | 0.10 | 0.5–6% (tunable) |
| L7 WAF (balanced) | 40 | 0.55 | 4% |
| Behavioural fingerprinter (trained) | 6 | 0.70 | 0.4% |
| JS challenge | 300 | 0.85 | 3% (100% for no-JS) |
| CAPTCHA | 900 | 0.97 | 12% (18% mobile) |
| Origin round trip (uncached) | 120–260 | — | — |
| Cache hit | 8 | — | — |

**Why it matters:** this is what turns "how paranoid can I afford to be" into a *number* instead of a
mood. It also makes the cache/CDN purchase feel correctly enormous: **caching doesn't just reduce
load, it buys you milliseconds to spend on security.**
**Interacts with:** §4.5, Suspicion Routing below, §3.1 Latency Ladder.

### Suspicion Routing — the Two Lanes (the game's mazing layer)
The single highest-leverage structural addition to the visitor model: it converts §4.5's shopping list
into a **layout puzzle**.

**How it works:** Traffic arrives **violet** (unclassified). Every node it passes contributes a small
amount of **classification confidence** and a small amount of **latency**. The player builds not one
path but two, and sets a **suspicion threshold** on an always-visible slider:
- **The Fast Lane** — short, shallow, cheap. Traffic below the threshold takes it. Low latency, low
  confidence, some threats get through.
- **The Slow Lane** — long, deep, expensive: extra inspection hops, a challenge, a queue, a tarpit.
  Traffic above the threshold routes here. High confidence, high latency, and **every real customer
  routed here is patience you are burning.**

Confidence composes as `C = 1 − Π(1 − cᵢ)` over the hops on the path; latency as `L = Σ lᵢ`. The
strategy space is immediately rich: one medium lane or a very fast lane plus a very deep one? Put the
cheap classifier early (routes more traffic correctly, less confidently) or late (more confident, but
everyone paid the latency to get there)? A **pre-classifier** at the edge — ASN reputation, geo, TLS
fingerprint — is cheap in milliseconds and buys a huge amount of correct routing, which is exactly
what real edge security does.
**Interacts with:** P1, §2.4 Mimics (whose whole job is to score below your threshold), §4.5, §8.2's
violet→cyan/magenta resolution, the Millisecond Budget, Priority Classes.

### Friction Gates
Every security tower has a **Friction** stat: the % of visitors it bounces, challenges, or flags.
**Friction is the price of safety, denominated in customers**, and it must be measurable per-defense
as a live false-positive counter.

**Rule 1 — friction applies only to traffic that traverses that defense.** A defense on the checkout
path taxes buyers; a defense at the edge taxes everyone. This single rule turns §4.5 from a shopping
list into a placement puzzle and is the precondition for Suspicion Routing.

**Rule 2 — friction compounds multiplicatively, not additively.** Three 5% gates pass 0.95³ = 85.7%,
so the fourth gate is much more expensive than the first. The UI must show **cumulative pass-through**
alongside per-gate friction.

**Rule 3 — order matters.** Cheap, low-friction classifiers should run first so expensive
high-friction ones see less traffic. **Gate ordering becomes a player decision on the cable**, and it
is free content.

**Rule 4 — friction is a matrix, not a scalar.** It is per-cohort, because that's both truer and
better gameplay. A CAPTCHA costs almost nothing from a desktop regular on a residential IP and a great
deal from a mobile visitor on carrier NAT, an accessibility visitor, someone behind a corporate proxy,
or anyone in a region your bot vendor has poor data for. Model friction as **defense × cohort**,
surfaced simply as "this defense is costing you mostly *mobile* customers." **That single change
converts a number into a decision.**

**Proposed friction table:**

| Defence | Friction (legit bounced/flagged) | Latency | Notes |
|---|---|---|---|
| Firewall (port/protocol) | ~0% | <1ms | the reason it feels free — and its ceiling |
| Rate limiter (generous) | 0.5–2% | <1ms | rises steeply as you tighten |
| Rate limiter (aggressive) | 8–15% | <1ms | and it eats NAT'd offices whole |
| fail2ban | 1–3% | 0 | but each false positive is a *whole office* |
| WAF (default rules) | 3–8% | 20–60ms | |
| WAF (paranoid) | 12–20% | 40–90ms | and it blocks your own admin panel |
| Bot fingerprinter | 0.5–2% | 5–15ms | low friction is what you're paying for |
| CAPTCHA | 12–18%, 22% mobile | human-scale | the bluntest instrument |
| MFA at login | 2–4% abandonment | human-scale | |
| 3-D Secure at checkout | 5–12% cart abandonment | human-scale | and it moves liability |
| Fraud screening (strict) | 4% good customers rejected | 0 | |
| Geo-block | 100% of a region | 0 | |
| Aggressive spam filter | 0.5–2% of *real mail* | 0 | and each one is an invoice |

**Interacts with:** §3.4 Captcha tax, §4.5, §8.6 false-positive flash.

### Classification, not destruction — and the third outcome
Defenses don't "kill"; they **classify**. Getting it wrong in either direction has a cost: false
negative = damage, false positive = lost revenue. Both on a live counter so the player can tune.

**Expansion — there are three outcomes, and the middle one is the interesting one.** **Pass** (free),
**Challenge** (costs latency and a fraction of patience; most real visitors survive it and most bots
don't), **Drop** (free for you, total for them). Making Challenge first-class gives every defense a
tunable middle setting, turns the aggression slider into a three-way mix rather than a line, and
directly models how real bot management works. It also means there are now **two ways to wrong a
customer: bouncing them, and merely annoying them** — and the amber false-positive feedback should
distinguish them.

### Value as Bounty — and value accrues per hop
Each visitor carries a Value number; reaching the Conversion Node pays it. A bounced visitor pays
nothing *and* subtracts a small reputation tick. Losing a high-value visitor should feel like a
monster leaking in a normal TD.

**Expansion — the tail is where the money is.** Value is not flat: a visitor that reaches hop 3 of 5
has generated *some* value (an ad impression, a signal, a warmed cache path) but not the conversion.
Draw it as a **partially-filled coin**. This makes deep-funnel protection quantitatively more valuable
than shallow, explains why the checkout path deserves disproportionate investment, and makes a bounce
at hop 4 visibly more painful than a bounce at hop 1 — which it is.

### The Conversion Node
The "base" you're defending is actually the thing you're *escorting visitors to*.

**How it works:** Elegantly, the win and lose conditions live in the same object: threats want to
reach it, visitors need to reach it.

### Session Depth
Visitors don't make one request; they make several.

**How it works:** Browse → search → product → cart → pay. Each is a separate trip down the lane, and
**a visitor can bounce at any hop** — so deep-funnel visitors are exposed to your weaknesses many
times. Higher value, higher fragility: a natural risk/reward gradient built into the traffic itself.

### Duration classes — and the resource each one eats
Visitors come in classes, each drawn differently, and **each class consumes a different resource.**
This is what unifies wildly different businesses under one readable idea.

**How it works:**
- **Instant** (a mote that pops — a page load, a DNS query, an inference request) consumes
  **throughput**.
- **Session** (a dot with a persistent thread — a stream viewer, a SIP call, a logged-in user, a game
  player) consumes a **slot for its duration**, so a session-heavy line runs out of concurrency long
  before it runs out of bandwidth.
- **Batch/job** (a backup run, a CI build, a render) consumes a **window**.
- **Resident** (a tenant or training job that occupies a slot for the whole level) consumes
  **committed capacity and cannot be shed at all** — which is precisely why a colo lease and a GPU
  training run feel identical to manage.

State that and the classes become four different capacity-planning games rather than four costumes.
**Visual:** shape encodes duration class *only* — circle = instant, teardrop = session, square =
batch/job, **hexagon = resident**. Value moves to ornament; archetype identity moves to the prop slot.
One property, one job.
**Interacts with:** §7.1 capacity as slots, §7.7 shedding, §8.2 shape tokens.

### Patience → Trust → Tenure (three timescales)
Different threats attack different timescales.

**How it works:** Per-request **patience**, per-incident **trust**, per-month **tenure**. A DDoS hurts
patience; a breach hurts trust; bad pricing hurts tenure. Modelling them separately means an operator
can be fast and still lose customers, or slow and still keep them.

### Priority Classes and the Shed Ladder (pre-configured triage)
Peacetime configuration with a crisis payoff — and the answer to "what does the player actually
configure that isn't a slider on one box?"

**How it works:** The player paints traffic into four priority classes — **P0 contractual** (SLA
customers, paid API), **P1 revenue** (checkout, conversion paths), **P2 normal**, **P3 opportunistic**
(free tier, crawlers, prefetch) — then authors a **Shed Ladder** in advance:
`at 80% → stop serving P3 · at 88% → degrade P2 to cached-only · at 94% → P1 only · at 98% → P0 only.`
Under load the system walks the ladder automatically, visibly, with a sound. Every live override you
are forced to make is a candidate for a new rung afterwards.
**Why:** it is an *economic* triage verb — your business model literally determines your failure mode.
**Interacts with:** §7.7 graceful degradation, §3.9 The Sacrifice Decision, §6.5 pricing.

### Visitor Trust as a per-identity value the defenses can read
The game's only way to *reduce* friction without reducing security.

**How it works:** Returning identities accumulate a **trust score** — logged in, verified payment,
long tenure, consistent behaviour. High-trust identities bypass the Slow Lane, skip the challenge, and
get a priority-class bump. This is a genuinely valuable build (an identity/session layer) with a
perfect matching downside: **compromised trusted accounts become the best attack vector in the game**,
because credential stuffing now buys the attacker a fast-lane pass.
**Interacts with:** Suspicion Routing, §2.6 credential stuffing, P1/P2.

### The Return Cadence (today's service is tomorrow's wave size)
Served visitors don't just pay; they **schedule their own return.**

**How it works:** `P(return) = base × (1 + 0.6 · (budget_remaining / budget))`, with a bounce setting
it to `base × 0.15` and a scary-warning bounce to `0`. Returns land 1–3 waves later. The compounding
loop is visible: a great wave 4 makes wave 7 bigger. This converts P9 ("the reward is letting
through") from a scoring statement into **the engine of your own traffic growth**, which means success
genuinely raises difficulty.
**Interacts with:** P9, §2.13 "the threat that is your own success", §1.7 pressure budget.

### Returners and Referrers
A satisfied visitor increases the next wave's size slightly; a delighted one spawns a referral.

**How it works:** **Good service compounds**, which means the mid-game reward for playing well is
*more pressure*. That's how you keep a strategy game from going flat once the build is solved.

### Word of Mouth is the wave-size dial
Reputation directly multiplies visitor spawn rate.

**How it works:** Reputation moves with uptime, latency, support response, and public incidents. This
makes reputation **a resource you defend**, not a flavour stat.
⚔️ **Tension:** unchecked, "every advocate spawns 2–3 more" is an unbounded exponential. See the
network-saturation curve under The Advocate (§3.2).

### The Satisfaction Bank (goodwill as a spendable buffer)
Gives reputation a short-term buffer layer and makes a *streak* of good service tangible.

**How it works:** Every well-served visitor deposits a fraction of their value into a **Goodwill**
pool, capped at ~2 weeks of revenue, decaying 5%/month. Goodwill is spent automatically to absorb
reputation damage — an outage that would cost 8 reputation costs 3 if you have goodwill banked — and
can be spent deliberately on a price increase, a migration, a maintenance window, or an unpopular
policy change. It gives the player a gameable reason to over-deliver during calm periods.
**Interacts with:** §6.1 Reputation, §3.7 Grudge Meter, §7.5 maintenance windows.

### Party Arrival, generalised (all-or-nothing units)
Game hosting's "players arrive in parties — five at once, all or nothing" is too good to leave in one
hosting type. Make it a **unit property** with different costumes:

**How it works:** Game — a 5-player party. E-commerce — a multi-item cart (partial availability
abandons the whole cart). Enterprise — the Procurement Delegation (three to five heads, all must be
satisfied). Backup — a job chain (an incremental is worthless without its full). Video — a simulcast
(all bitrate rungs must be produced or you drop a viewer tier). Colo — a tenant's deployment (seven
cabinets, or they go elsewhere).
**Why:** all-or-nothing units are the best possible argument for **headroom over average capacity**,
and they make partial capacity feel bad in a way a throughput number never does.
**Visual:** party members are drawn linked by a short visible tether and occupy slots as a unit. If
capacity is 3 and the party is 5, you watch the chain **fail to fit** and rebound. No tutorial needed.

### Capacity as concurrency slots, not bandwidth
The real limit on a web server isn't bandwidth, it's *simultaneous workers*.

**How it works:** N slots, each visitor occupying one for its service time. Little's Law becomes
intuitive: queue length = arrival rate × service time. Make one slow endpoint eat all your slots and
the player learns why in ten seconds.

### The Queue and the Death Spiral
When arrivals exceed capacity, a queue forms — and **visitors in the queue still consume resources
while waiting.**

**How it works:** If the queue grows past the point where visitors time out before being served,
you're doing 100% of the work for 0% of the revenue. The only escape is **load shedding** — refusing
requests fast. Teaching a player to deliberately drop traffic in order to survive is one of the most
valuable real lessons in ops, and it is what the Shed Ladder operationalises.

### Cache Hit Ratio as a visible visitor path
**How it works:** Cached visitors take the short green path and leave happy; misses take the long path
through app and DB. Warming, invalidation, and TTL all become visible routing decisions rather than
config.

### Keepalive and Connection Reuse
**How it works:** A returning visitor on an existing connection is much cheaper than a new one (no
TCP+TLS handshake). Rewards HTTP/2-3, connection pooling, and session resumption as real upgrades that
raise effective capacity **without new hardware** — one of the few builds that is pure profit.

### Geographic origin (speed of light is a hard game constant)
**How it works:** Visitors spawn from world-map regions. Distance = base latency you cannot optimise
away. The only fix is a PoP closer to them, which is why the world map and the build tree are the same
decision.

### The Diurnal Curve
**How it works:** Traffic follows a real daily pattern per region, so a global business has a rolling
peak. Batch work (backups, reports, reindexing) should be scheduled into the trough — and the "cron at
midnight" collision is a recurring self-own. Every hosting type gets its own daily shape: business
email peaks at 9am, games peak at 8pm, backups at 2am, CDN at streaming primetime, batch render fills
the gaps. **Running complementary businesses smooths the curve — a genuinely strategic reason to
diversify.**

### Seasonality
**How it works:** Retail hosting peaks in Q4, game hosting at expansion launches, tax-software hosting
in April, education hosting dies over summer, research/HPC spikes at fiscal year end. Seasonality is a
calendar you can plan around, which makes forecasting a skill rather than a guess.

### Flash crowd / viral spike
**How it works:** A front-page hit — 40× normal traffic for 90 minutes, from a narrow geography,
hitting one URL. Survivable *only* with caching. The perfect tutorial for "static assets should never
touch your app server."

### The bot fraction
A large, invisible share of all traffic is non-human.

**How it works:** Some is good (search engines, uptime monitors, your own health checks), some neutral
(AI scrapers), some hostile. Mechanically, a percentage of the visitor stream is *disguised*, and
classification accuracy is a stat improved by bot-management buildables. **Misclassification is the
punishment:** block a real user and you lose revenue; allow a bot and you burn capacity.

### Retry amplification
**How it works:** An unhappy visitor retries, doubling your load exactly when you can least afford it.
Mobile apps are the worst offenders. A small outage becomes a self-inflicted DDoS.

### Visitor weight varies wildly
**How it works:** The 80/20 rule is really 99/1 — one customer's 4K video file is 10,000 page loads.
Show it: some visitors are physically huge sprites, and a single one of them occupies a lane.

### Herding (visitors follow other visitors)
**How it works:** A server with people on it attracts more (game browsers sort by population); an
empty one repels. Creates runaway winners and **empty-server death spirals** you must actively manage
by seeding. The only visitor behaviour in the game where units influence each other directly.
**Hosting types:** game servers above all; also community/forum hosting, marketplaces, IX peering
("network gravity").

### Sticky vs. fluid traffic
**How it works:** A game player is sticky for hours; a DNS query is gone in a millisecond. Sticky
traffic means capacity is *held*, which changes placement strategy entirely — you cannot burst your
way out of a slot shortage.

### Demand Elasticity by Latency (the visible curve)
Not just "they bounce" — **how many, at what speed.**

**How it works:** A per-segment curve plotted in the UI: conversion rate against response time. The
player can *see* that the mobile segment falls off a cliff at 1.2s while the enterprise segment
doesn't care until 8s. Optimising becomes a targeted decision — "who am I optimising for?" — rather
than a general one. Pairs with the Latency Ladder: the Ladder shows what you spend, this shows what it
buys.

### The Latency-Blind Visitor
Traffic that genuinely doesn't care, and every level should have some.

**How it works:** Batch jobs, async webhooks, replication streams, log shipping, crawler traffic and
backup transfers have effectively infinite patience and enormous throughput demands. They are the
perfect candidates for the lowest QoS class, which is how the player discovers that not all traffic
deserves the same treatment. **The prioritisation mechanic always needs something obvious to demote.**

### Traffic That Is Not For You
Transit, reflection, and passing trade — a third flow direction in a game that otherwise has two.

**How it works:** At Tier 5+, traffic crosses your network that neither originates nor terminates with
you. It consumes capacity, it can be attack traffic aimed at someone else, and it may be revenue
(transit) or an obligation (peering). **It is what makes you feel like part of the internet rather
than a website.**
**Hosting types:** IX, transit/IP, CDN, large colo.

### The Bounce Ticker
Bounce is silent by default; make it loud.

**How it works:** A HUD element showing a running count **and dollar value** of visitors lost in the
last 60 seconds, broken out by cause (too slow / blocked by you / capacity full / error). Without it,
the player cannot learn. With it, the player becomes an optimiser.

### The Live Bounce-Reason Strip
**The most actionable single UI element the game could add**, and the missing companion to the
end-of-level Traffic Sankey.

**How it works:** An always-visible one-line strip showing the **top three bounce reasons right now**,
with counts: `Latency at DB (41%) · CAPTCHA (22%) · TLS handshake (9%)`. Three items, one line,
updated continuously. It converts the entire §3.4 catalogue from flavour into a live diagnostic.
**Interacts with:** §3.4, §6.9 Traffic Sankey (same glyph set), the Bounce Cause Tag (§3.12).

### The Conversion Funnel as literal geometry
**How it works:** The path has stages — *Arrive → Reach → Served → Satisfied → Return → Refer*. Each
stage is a place on the board where visitors can be lost, and each has its own counter. Late-game
upgrades affect specific stages, so the player can diagnose "my problem is Reach" vs "my problem is
Return" instead of guessing.

### The Visitor↔Build counter-matrix (a legible answer table)
TDs need a legible answer table or players brute-force.

**How it works:** A single Codex page: rows = visitor archetypes, columns = builds, cells = which
build "saves" which visitor. Mobile Commuter ← CDN + keepalive + fewer redirects. Impulse Buyer ←
checkout path optimisation. Enterprise Evaluator ← status page + logging + uptime history. API Client
← p99 consistency + `429 Retry-After`. Logged-In User ← session store + read replica. Whale ←
isolation + account management. Freeloader ← quota + conversion nudge. Deep-Link Visitor ← per-page
optimisation. Geo-Distant ← PoP or replica.
**Why:** it has the additional virtue of being *true*, so it doubles as the educational spine.
**Interacts with:** §3.2, §4, §5.4 Codex, §9.5.

### The Cohort as a unit (customers own their traffic)
The render that makes the whole client system tangible.

**How it works:** At Tier 3+, visitors don't spawn from "the internet" — they spawn **from a customer
card**, in that customer's colour/pattern, at that customer's rate and profile. Consequences: you can
see *whose* traffic is hurting you, live, in the lane; firing a customer visibly removes their stream
(and their revenue) from the board; the Sacrifice Decision becomes literal because you can see the
colour you're about to cut; and a customer's growth is visible as their stream thickening over the
level.
**Interacts with:** §3.9 Clients are Spawners, §8.9 tenant tinting, §6.8 concentration.

### Declining demand as a verb (the "we're full" sign)
The design has forty ways to attract and effectively **zero** ways to deliberately shrink demand,
which means the only anti-overload verb is failure. Give the player a dignified "no."

**How it works:** An always-available control: cap intake, close signups, or go invite-only. Effects
are immediate — latency for admitted traffic improves, support load drops, abuse drops — and
**reputation shifts sideways rather than down**: you lose "available" and gain "exclusive." Some
archetypes (Enterprise, Regulated, Niche) actively *prefer* a provider who turns people away; others
never come back.
**Interacts with:** §3.8 positioning, §6.5 pricing, §3.9 firing customers.

---

## 3.2 Visitor archetypes

*Thirty-five-plus archetypes is more than a player can hold, and many differ only in bounty. Group
them into **six families** with variants inside, so the silhouette read is fast and the art passes the
distinct-silhouette test: **Browsers · Buyers · Machines · Amplifiers · Costs · Evaluators.** Six
silhouettes, then variants within each. All archetypes below are kept; the family headings are the
legibility layer.*

**Proposed patience budgets (total ms) — the tuning spine for this whole section:**

| Archetype | Patience | Notes |
|---|---|---|
| Skimmer / casual | 800–1,500 | the volume, and the most fragile |
| Mobile commuter | 1,000, pre-damaged by 300 | arrives already spending |
| Desktop regular | 3,000 | +1,000 trust buffer if previously well served |
| Deep reader | 4,000/hop, many hops | total exposure is what kills them |
| Impulse buyer | 1,200 | high value, tiny patience — the core tension unit |
| Power shopper | 6,000 across the full funnel | dies of accumulated hops |
| Enterprise evaluator | effectively infinite | scores your *build*, not your speed |
| API client | 10,000, then hard fail | no gradual bounce; a timeout is binary |
| Crawler | 8,000 | slow responses cut crawl budget, not the visit |
| Streaming viewer | 3,000 to start, then jitter-sensitive | a second quality axis entirely |
| Game player joining | 2,000 to connect; then ping-bound | 80ms sustained = rage-quit |
| Backup job | infinite, but the *window* is finite | patience is the wrong model; use the window |
| Inference request | 200–2,000 | depends entirely on whether a human is waiting |
| Bid request (ad-tech) | 100, hard | the Timeout Cliff |
| CI build job | patient, but **value decays with queue time** | the developer context-switches away |

---

### Family I — Browsers

### The Skimmer / Casual Browser
Huge volume, tiny value, enormous patience-sensitivity. Bounces at ~500ms–3s.

**How it works:** Most of your traffic, and the "chaff" that nevertheless funds you. Basically ad
revenue at Tier 0–1. Visually: fast, tiny, numerous — rain on a window.
**Hosting types:** web, managed WP, CDN, media.

### The Mobile Commuter / Impatient Mobile Visitor
Arrives with *pre-damaged* patience.

**How it works:** A lossy, high-latency link means every round trip costs double. Extremely sensitive
to TLS handshake count, redirect chains, page weight, and uncached assets. **The aggressive timeouts
you set to stop Slowloris will kill these people** — an explicit tension unit. Rewards CDN, HTTP/2-3,
keep-alive, and OCSP stapling. On a bad connection its own movement stutters independent of your
infrastructure, teaching "not everything is your fault." Also the cohort most punished by CAPTCHA
(22% friction vs 12% desktop) and by carrier-NAT rate limits.
**Hosting types:** web, e-commerce, media, app backends.

### The Desktop Regular / Returning Customer
Generous patience, returns daily, carries a warm browser cache.

**How it works:** Cheap to serve on repeat visits — the bread and butter. Rewards long cache headers
and ETags. Has **path memory**: a good previous experience starts their patience higher and they
tolerate more (a trust buffer). But if they bounce, they're gone *permanently* and take their lifetime
value with them.
**Visual:** a small halo/badge indicating tenure, and a **faint worn path** — their route is pre-lit.
Repeat visitors literally *pave* your paths: heavily trafficked routes get brighter and smoother over
time, a gorgeous emergent visualisation of loyalty. (Same shader as the bounce scorch, with a signed
value: bright where you succeed, burned where you fail.)

### The Deep Reader
A larger, slower unit that visits many pages.

**How it works:** Generates much more ad/engagement revenue but is exposed to your failures for far
longer. High risk, high reward, and *visibly so* because you watch them traverse your whole site.

### The Deep-Link Visitor
Arrives from search on a specific product page, not the homepage.

**How it works:** Your homepage being fast is irrelevant. Punishes players who only optimise the front
door — and it is the reason the Latency Ladder must be per-path, not global.

### The Power User
High patience, high value, but generates 5× the load (dashboards, exports, API calls).

**How it works:** Profitable *and* expensive. The clearest single unit for teaching that revenue and
cost are not the same axis.

### The Logged-In User
Bypasses your cache entirely, by definition.

**How it works:** A wave of logged-in users is ~30× more expensive than the same count of anonymous
ones. **Beautiful mechanic: success — people signing up — makes your defenses less effective.**
Countered by a session store and read replicas, not by more edge.

### The Night Owl
Arrives during your maintenance window. Punishes lazy scheduling, and is the reason the maintenance
window is a *placement* decision on the diurnal curve rather than a checkbox.

### The Ghost Visitor (adblocked / no-JS / privacy)
Counts for load, contributes less revenue.

**Visual:** a translucent outline. Communicates monetisation friction wordlessly. Also the cohort that
a JS challenge bounces at 100%.

### The Accessibility Visitor
Screen reader, slow device, text-only.

**How it works:** Punishes JS-heavy builds. A small, principled niche that rewards lean pages — and a
cohort with disproportionately high CAPTCHA friction, which is worth making visible.

### The Geo-Distant Visitor
Spawns at the far edge of the map; every kilometre is latency.

**How it works:** Only a CDN PoP or a regional replica can save them. The visual argument for global
buildout, and the cohort for whom **RTT count matters more than server milliseconds.**

### The Regional Wave
At world-map scale, visitors arrive as population-weighted regional tides that follow the sun.

**How it works:** Capacity planning becomes a *timing* game rather than a sizing game.

---

### Family II — Buyers

### The Buyer / Power Shopper / Checkout Whale
Carries a visible money bag and must traverse the *full* path.

**How it works:** Landing → product → cart → checkout → payment → session store → DB → payment gateway
→ email. If any hop fails, the money bag drops and is gone. Worth 50× a pageview. **Cannot exist until
you build a database** — literally the payoff for accepting SQL injection into your bestiary. The
longest path = the most chances to lose them = the most satisfying unit to protect. Makes the player
build a *complete healthy path*, not just a fast edge.

### The Impulse Buyer
Tiny patience, high value, converts instantly if checkout is fast.

**How it works:** The single best argument for optimising your slowest path. ~1,200ms of patience
carrying a conversion worth fifty skimmers.

### The Comparison Shopper
Visits, leaves, and **comes back later** if your performance was good.

**How it works:** A delayed-reward loop: today's speed is tomorrow's traffic. (Generalised for every
archetype by the Return Cadence in §3.1.)

### The Returning Cart-Abandoner
Comes back if and only if session state survived.

**How it works:** Punishes the player who put sessions in an evictable cache (§2.9, Redis eviction).
The rare visitor whose fate is decided by a config choice made two levels ago.

### The Refund Hunter
Converts, then reverses. Negative expected value.

**How it works:** Detectable only by pattern; encourages building analytics tooling. Concentrated in
the affiliate and deal-forum cohorts, which is how the player learns that channel choice determines
refund rate.

### The Tire-Kicker
Signs up for a trial, uses a lot, converts at ~8%. Volume play.

**Visual:** visits your pricing page, hovers with a visible **hesitation wobble** at the decision node,
then leaves. Sales/marketing upgrades reduce the wobble — **you can literally see your conversion
optimisation working on individual creatures.** Should be *visible as a type* so the player can learn
qualification rather than chasing everyone.

### The Migrating Customer / The Migration-In
A big client transferring in from a competitor.

**How it works:** Arrives as a giant slow convoy that must be escorted for a long duration. If
anything goes wrong mid-migration they abort and you eat a reputation hit. **A literal escort mission
built out of the traffic system.** Onboarding cost is real and should be modelled — huge for two
weeks, then a great customer. Arrives in bursts after a competitor's incident (see Refugee Flows,
§3.6) and comes with low trust: they fled once and will flee again.
**Visual:** a moving truck carrying their existing stack as visible crates. You must prepare a landing
zone — **if none is ready the truck visibly circles the block** on a loop path at the map edge for a
while before leaving, and that loop is your grace period, ticking where you can see it. Their data
streams in over time as a fill bar on their allocated space: onboarding as a loading animation you can
watch and accelerate.

### The Repatriator
A prospect leaving a hyperscaler. The mirror image of §2.10's Hyperscaler Free Tier.

**How it works:** Arrives with a spreadsheet and a grievance. High value, high expectations, blocked by
their own committed-spend agreement for N months, and expensive to onboard because their team has
forgotten how servers work. Their first ninety days generate 4× normal tickets. Converts to an
excellent long-tenure customer if you survive the onboarding. **Winning them requires a migration
*engineering* capability, not a sales one.** Recurs as a late-campaign demand wave (see The
Repatriation Wave, §3.6).

---

### Family III — Machines

### The API Client / API Consumer
A machine customer: perfectly regular, high volume, **zero patience in the binary sense.**

**How it works:** Very high tolerance for latency but zero tolerance for *errors* — a timeout or a 500
is a hard fail, not a gradual bounce; it breaks their integration and files a ticket. A
binary-outcome visitor that rewards consistency over average speed and **teaches p99 vs mean.**
Critically: when you fail, it doesn't bounce, it **retries harder**, turning a small outage into a
self-inflicted DDoS. The "friendly" traffic that finishes you.

**Expansion — why machine clients are uniquely dangerous, spelled out:** **no jitter** (every client
retries on the same interval, so retries synchronise into pulses), **no circuit breaker** (they will
retry forever), **fixed timeouts shorter than your recovery time** (so they give up, retry, and
stack), and **they run in someone else's infrastructure**, so you cannot fix any of it. The counter —
`429` with `Retry-After`, which well-behaved clients honour — should be a purchasable that only works
on *some* clients, with a visible **"share of clients that respect backpressure"** stat that improves
slowly as you nag integrators. **A defense whose effectiveness depends on other people's code
quality** is a new and very authentic category.
**Visual:** angular, mechanical, arriving in trains — a square packet with a serial number. A
well-behaved client looks like a sewing machine; a runaway one looks like a firehose, and retry storms
are a visible spiral.

### The Integration Partner
A customer's *other* vendor who talks to your platform: their payment processor's callback, their
monitoring service, their CDN's origin fetches, their ERP's nightly sync.

**How it works:** A machine visitor you have no contract with, whose behaviour you cannot influence,
whose IP ranges change without notice, and whose failure generates a ticket blaming *you*. **The
third party you must serve and cannot manage** — and the main reason "block by ASN" is dangerous.

### Googlebot / The Crawler (friendly bot)
Not revenue itself, but its treatment determines your future visitor *spawn rate*.

**How it works:** Serve it fast → crawl budget rises → more indexed pages → more visitors later. Serve
it 500s → rankings drop. **It looks exactly like a Scraper Locust** — the identification minigame in a
single unit. A long-feedback-loop unit that teaches thinking beyond the current wave and punishes
short-term thinking.
**Visual:** cyan-**gold**, systematic, spider-ish with a clipboard; neutral-tan in the "Surveyors"
silhouette family so the player has to squint at something that looks *almost* like a threat. Its path
draws a visible index: an **SEO coverage grid that is literally a site map** — a grid of page tiles
that fill as they're crawled, with stale tiles fading, and **a 503 served to the crawler visibly
un-fills tiles.** Watching your index erode during an outage is the clearest possible rendering of
§3.4's "search ranking decay," which is otherwise invisible damage-to-the-future.

### The Uptime Monitor
An external checker that hits `/health` every minute. **The visitor that tattles.**

**How it works:** If it sees a failure it publishes to a status page and (if a customer's monitor)
generates a ticket.
**Expansion — monitors are also a source of *false* incidents.** A monitor whose own network has a
problem reports you down, publishes it, and generates tickets from customers who saw the badge — while
you were fine. The counter is **N-of-M agreement across vantage points** before believing anything,
yours or theirs. Makes the External Vantage Fleet meaningful and teaches a real epistemic habit.

### The Customer Who Monitors You Better Than You Do
A technically sophisticated client running their own synthetic checks against you from five regions.

**How it works:** They tell you you're down before your monitoring does — sometimes before you *are*
down, because they're measuring p99 and you're measuring p50. Handled well they are the best free
monitoring you will ever have and become a reference customer; handled badly ("we don't see it on our
end") they become public shaming. **Turning a complainer into a sensor is a real skill and a lovely
mechanic.**

### The Authorized Attacker (the customer's pentester)
Your customer hires a penetration-testing firm and sends you an IP range and a date window.

**How it works:** For that window, genuinely hostile traffic arrives that you are contractually
expected to *tolerate* and permitted to defend against. The decision: allow-list them (they get a
clean test, you learn what's actually weak, and the report becomes Intel currency) or let your
defenses fight them (you look great in the report, learn nothing, and the customer paid $30,000 to be
told their WAF vendor works). **A threat unit whose correct handling is to let it in.**
**Payoff:** the resulting report is a discovery document listing three real weaknesses, free, that you
now have a deadline to fix because the customer has read it too.

### IoT — the device fleet
Populations of millions, all synchronised by accident.

**Visual:** dust-sized; only ever visible as aggregate ribbons or a granular texture with a density. A
fleet going haywire is visible as the grain becoming *coarser* and taking on a magenta cast.

### Bot Traffic That Isn't Malicious
Search crawlers, uptime monitors, AI scrapers, price comparison bots, archive crawlers.

**How it works:** They cost resources, provide value (indexing) or don't (scrapers), and **blocking
them has side effects** — some of which take three shifts to show up. The category exists so that
"block all bots" is never simply correct.

---

### Family IV — Amplifiers

### The Advocate / Word-of-Mouth Visitor
Converts, and on success spawns 2–3 extra visitors after a delay. A compounding unit — protecting them
is disproportionately valuable. Served badly, they spawn a negative-reputation unit instead. **Quality
compounds in both directions.**

⚠️ **Balance fix — network saturation.** Unbounded 2–3× spawn is exponential and collapses the
economy: the dominant strategy becomes over-serving early and coasting. Add a saturation curve:
`wom_spawn = base × (1 − reached / addressable)`. The channel fills up and the marginal advocate is
worth less.
**Visual:** a well-served visitor drops a small glowing token at the exit that spawns friends later; a
badly-served one drops a grey one that suppresses a future spawn. Consolidated with §3.6's referral
threads: threads persist ~3 minutes and fade, a happy customer refreshes theirs, and **an unhappy
one's thread goes grey and stays**, visibly suppressing that spawn point. The web's overall brightness
is your word-of-mouth health, readable at zoom-out without a number. Alternate costume: a happy
customer puffs into **dandelion seeds** that drift off-map and return later as new visitors; referral
programs make the puffs bigger and more frequent.

### The Reviewer
A single, slow-walking, extremely visible VIP whose outcome permanently moves your reputation ±.

**How it works:** Highlighted with a glow so the player knows the stakes — one unit as a mini-boss of
positive valence. Whatever they experience becomes a public review modifying your spawn rate for the
rest of the level. A high-stakes escort mission embedded in normal play.
**Visual:** larger, spotlit, with a floating star rating that fills or empties in real time. **The
stars are visible to other visitors** (via the Glance Animation), so a Reviewer having a bad time in
public visibly depresses nearby conversion *in real time*. That turns a single unit into a local
hazard and makes the escort tension spatial.

### The Influencer / The Press
Spawns a burst of hundreds if satisfied.

**How it works:** The "escort mission" unit. Should appear rarely and be *loudly telegraphed*
("Incoming: 400k followers, arriving in 10s") so the player can pre-build for it.
**Visual:** carries a camera flash. A good trip spawns a fan of new visitors from the map edge; a bad
trip spawns a red "bad review" glyph that permanently dims a section of the inbound gate.

### The Streamer / Sponsored Creator (game hosting and developer products)
Pays little or nothing, generates enormous signup flow behind them.

**How it works:** Model as **a customer whose value is a demand multiplier**, not MRR. They will leave
instantly for a competitor's better sponsorship, so their retention is a *marketing budget* line, not
a support line. Enormous spiky load, enormous free marketing — a "prestige client" whose value is
partly non-monetary and should be scored as such.

### The Journalist
Like the Reviewer, but only shows up during incidents.

**How it works:** Serve them a good status page and the story becomes "company handled it well."
The only visitor whose arrival is *caused* by your failures.

### The Community
A forum, a Discord, a modding scene attached to your service.

**How it works:** Generates free marketing, free support (reduces ticket load), and occasionally a
riot. Reputation-amplifier in both directions, with a high churn-contagion multiplier: when one member
leaves loudly, the rest hear about it.

### The Referrer You Didn't Ask For
Someone posts your service on a forum, a subreddit, or a foreign-language deal site you cannot read.

**How it works:** A traffic channel you didn't build, cannot control, and that brings a cohort with
completely different behaviour — sometimes excellent, sometimes 400 fraudulent signups in an
afternoon. Appears in your cohort view as an **unattributed acquisition channel**, and you must decide
whether to lean into it. **You cannot turn it off.**

---

### Family V — Costs

### The Freeloader / Free Tier Tourist
Zero value, full resource cost.

**How it works:** Their only function is *possibly* becoming a paying customer later, and meanwhile
they're indistinguishable from load. The decision to serve them well is a bet, and tuning the free
tier is a slider with a real curve (conversion 1–3%). The natural first citizen of priority class P3.
**Visual:** a separate, wider, paler-cyan gate. Some slowly turn gold over time (conversion) with a
colour-fill animation up the body — **watching a free user "fill with gold" is a genuinely great
reward image.**

### The Hotlinker / Bandwidth Parasite
Uses your bandwidth from someone else's page. A threat/visitor hybrid: it looks like traffic, costs
like traffic, and pays nothing. Countered by referer rules that occasionally break a real customer.

### The Support Seeker
Doesn't want to buy; wants a human.

**How it works:** Consumes a staff hand. If ignored, converts into a churn event. **A visitor that
attacks your attention budget** rather than your capacity — the only unit in the game whose damage is
to your staff.

### The Customer Who Has Locked Themselves Out
They enabled a firewall on their own VPS, changed the SSH port and forgot it, deleted their sudo user,
or set a boot parameter that doesn't boot.

**How it works:** An extremely high-frequency, low-severity ticket class that **is only solvable if
you built console/IPMI access** — so it is the ticket that pays for the out-of-band purchase in
support-minutes rather than in outages. Automating it (self-service rescue mode in the control panel)
is a classic support-cost-reduction tower.

### The Repeat Bouncer
Has bounced before; requires *two* good experiences to be won back. Models trust decay at the
individual level, and is the reason the trust buffer is per-identity rather than global.

### The Upload Visitor
Large POST bodies.

**How it works:** Sensitive to timeouts, body-size limits, and temp-disk space. Fails in ways that
produce a *support ticket* rather than a bounce — a failure mode that skips your latency graphs
entirely.

### The Sanctioned Entity / Fraud Signup
Must be rejected. **Rejecting costs conversion rate; accepting costs the run.** The unit that makes
fraud screening a real decision instead of a free tower.

---

### Family VI — Evaluators

### The Enterprise Buyer / Enterprise Evaluator
Walks the lane slowly, *inspecting* your setup.

**How it works:** Checks your status page, your SLA, your certifications, your security posture, your
uptime history, your support response time. **Doesn't care about latency; cares about what you've
built.** A visitor that grades your architecture rather than your speed — brilliant because it rewards
a totally different build than everyone else, and because it makes early-level failures matter in late
levels. Cannot be won with speed alone; requires having built boring things (logging, redundancy,
docs).

### The Evaluator's synthetic test (the scheduled exam)
A variant worth its own entry: an enterprise prospect who runs a synthetic test against you **for
three shifts before signing.**

**How it works:** Your performance *during a specific window you can see on the calendar* determines a
huge contract. A scheduled exam — pure telegraphed pressure, and one of the few places where "hold it
together for exactly this long" is the whole objective.

### The Procurement Delegation (a multi-headed customer)
Arrives as a slow-moving group, each head with its own satisfaction meter and icon. **You must satisfy
all of them** — a great visual joke and a real sales truth.

**How it works:** Wave-1 had three heads: the **engineer**, the **lawyer**, and the **CFO**. Add the
**security reviewer** (satisfied only by evidence and certifications, never by charm) and the
**insurance/risk officer** (satisfied only by certificates of insurance at specified limits). Five
heads, five meters, and the comedy is structural: **satisfying the CFO (cheaper) directly dissatisfies
the security reviewer (more controls).**
**Visual:** three to five distinct props (engineer's laptop, lawyer's folder, CFO's calculator,
security reviewer's checklist, risk officer's certificate binder) on a shared slow-moving base, each
with its own small satisfaction pip. If any pip empties, the whole group turns. **Three meters on one
unit is more legible than three units.**

### The Column-Fodder Prospect
A visitor who was never going to buy.

**How it works:** Looks exactly like a high-value Enterprise Evaluator. Walks the whole lane, consumes
pre-sales engineering hands, requests a proposal, and disappears. Their only function was to give
someone else's procurement a third quote. **The Mimic role applied to the sales funnel** — a
revenue-shaped unit that costs you attention and pays nothing. The tell is behavioural and only
visible if you built a qualification step: they won't give you a budget, a timeline, or access to the
technical buyer.

### The Incumbent-Locked Lead
A perfect customer whose contract ends in eight months.

**How it works:** Cannot convert now, at any price. Can be *nurtured* — a small recurring cost keeping
the relationship warm across levels — and converts with high probability on their renewal date, which
the game shows on your calendar. **A lead with a timer measured in months** teaches pipeline thinking
better than any tutorial, and it makes the Contract Calendar a real object.
**Variant:** you can offer to **buy out their early-termination fee**, converting them now at a known
cash cost — the highest-leverage competitive tactic in the industry.

### The Auditor (regulated)
A visitor with a checklist who walks your *evidence* rather than your network. Sees your logs, your
change tickets, your access reviews, your training records. The only visitor for whom documentation is
the product.

### The Compliance Visitor (the security questionnaire)
Not the auditor — the **340-row spreadsheet** from a prospect's procurement team with a 10-day
deadline.

**How it works:** Each row is answerable only if you actually built the thing, and the answers are
*checkable later*. Answering honestly loses some deals; answering aspirationally wins the deal and
creates a future obligation with a date attached. A great, cheap, recurring Inbox card, and a direct
bridge between §4 buildables and §6 revenue: **your architecture is literally the sales document.**

### The Banker
Your lender's annual review, arriving as a visitor.

**How it works:** Reviews your financials, your revenue concentration, your contract terms, and your
covenant compliance. Outcomes: credit line increased, held flat, repriced, or pulled. **A visitor who
grades your bookkeeping.** Being unable to produce clean monthly financials is the failure mode, which
retroactively values the accounting/FP&A buildable.

### The Buyer's Analyst
Due diligence, as a visitor: walks your *documentation*, not your network. Every shortcut you took in
§4 and §7 is in a data room now.

### The Distributor Rep
A supply-side visitor with a personality.

**How it works:** Shows up at quarter-end desperate to move inventory at a discount — a real and
reliable way to buy hardware cheaply if you have cash and flexibility on spec. The mechanic: **vendors
have quarters too**, and a patient buyer with cash gets 8–15% off in the last two weeks of one.

---

### Cross-family specials

### The Whale
One client worth more than your other hundred combined.

**How it works:** A fragile relationship: one SLA breach and they're gone, taking 30–40% of MRR.
Everything about the level bends around them. Simultaneously a blessing and a trap; losing them is
often an instant fail state, and the game should reward **revenue diversification** explicitly. Their
traffic must be visually distinct so you can prioritise it — **and prioritising it is a QoS decision
that degrades everyone else.**
**Visual:** large, stately, moving slowly and majestically with an entourage of smaller satellite
dots. ⚔️ **Palette tension:** wave-1 drew it "gold-and-cyan," but gold is the money hue and this is a
unit. Preferred resolution — the whale stays **cyan like all legitimate traffic, with gold *ornament*
and a gold bounty tag**; value reads as decoration (rims, notches, a crown notch), not as hue or size,
so it survives greyscale and an 8px zoom. The entourage stays. Its bounce keeps the catastrophe
animation — the whole entourage turns and leaves together and the screen does a slow desaturation
flash — which is one of the few places a full-screen effect is earned.

### The Media Streamer / Streaming Viewer
Long-lived connection, bandwidth heavy, sensitive to *jitter* and rebuffering, not TTFB.

**How it works:** Blows up your 95th-percentile transit bill rather than your servers — a different
resource axis entirely, and a second quality axis. Tolerates roughly two buffer events.
**Visual:** connected to your edge by a **persistent thick ribbon/beam** for a long duration rather
than a single traversal. Buffering draws the beam dotted; a rebuffer is a visible stutter and the
viewer's icon spins. Great for teaching requests vs throughput with no words.

### The Ghost (the dormant payer)
Signed up long ago, pays, uses nothing. Pure profit.

**How it works:** Treasure them. (And feel slightly bad.) **The best customer and the worst risk are
the same account** — unpatched, unmonitored, forgotten, and a compromise waiting to happen.
**Expansion — make it a decision, not a fact.** Periodically the player gets a fork: **audit and
secure the dormant accounts** (costs hands, zero revenue upside) or **leave them** (free money, rising
compromise probability). That is a real decision and the most authentic kind of neglect the game can
model.
**And the twist — The Dormant Wake-Up:** one day the forgotten site gets linked from somewhere and
takes 400× its normal traffic on a plan sized for nothing. **The best customer becomes an incident.**
Cheap, rare, and it makes the player look at their long tail differently.

### The Reseller (any type) — a client who brings their own swarm
**Visual:** a single figure trailing a flock. Losing the reseller loses the flock in one visible
exodus. Their portrait contains **smaller portraits behind them** — they are fifty customers wearing
one card.

### The Lurker (BBS / IRC / community)
Costs a slot, generates nothing, is the soul of the community. A comedy unit with a real (tiny)
reputation function — and the reason a community-hosting level cannot be scored on revenue alone.

---

## 3.3 What "a visitor" is per hosting type

*One of the six ruleset slots, and the cheapest possible way to make every level feel different while
reusing one engine. Same circle grammar, different costume: **one shape, many costumes** keeps the
read universal. Each type has a different size, speed, patience curve, failure sound, and revenue
model.*

**The per-type reference table:**

| Hosting type | Visitor unit | Size | Patience | Bounce condition | Revenue model |
|---|---|---|---|---|---|
| Shared web | Page load | Small | ~3s | TTFB > threshold, 5xx | Indirect (customer's plan) |
| Managed WordPress | Page load + plugin-update event | Small | ~3s | Same, plus their plugin | Per-site monthly |
| VPS/dedicated | Provisioning request | Rare, large | Hours | Stock-out, slow deploy | Monthly recurring |
| Game servers | Player joining | Small, constant | ~90ms ping | Lag, full server, crash | Per-slot monthly |
| CDN | Asset request | Tiny, enormous count | ~200ms | Cache miss + slow origin | Per-GB / per-req |
| DNS | Query | Microscopic, billions | ~100ms | SERVFAIL / timeout | Per-million queries |
| Email | Message | Small | Retries for days | Blocked / spam-foldered | Per-mailbox |
| Backup | Job | Huge, scheduled | Retries | Window overrun, checksum fail | Per-TB stored |
| Object storage | PUT/GET | Variable | Seconds | 503, slow | Per-GB + per-request |
| GPU inference | Prompt/request | Small in, heavy compute | 1–30s | Queue depth, OOM | Per-token / per-second |
| GPU training | Job | Enormous, days | Infinite but fragile | Preemption w/o checkpoint | Per-GPU-hour |
| Video/streaming | Viewer session | Continuous bitrate | ~2s rebuffer | Buffering, quality drop | Per-GB / per-viewer-hour |
| VoIP/SIP | Call | Continuous, jitter-sensitive | Instant | Jitter, loss, one-way audio | Per-minute / per-channel |
| Colo | Tenant tour → contract | One, huge | Months | Bad tour, no power available | Per-cabinet + per-kW + x-connect |
| Dial-up | Modem call | One port | 3 busy signals | Busy signal, line noise | Per-hour or flat monthly |
| K8s/PaaS | Deploy / pod schedule | Medium | Minutes | Unschedulable, image pull fail | Per-node / per-app |
| DBaaS | Query / connection | Small, chatty | ms | Connection pool exhausted | Per-instance-hour |
| Mining hosting | *(none)* | — | — | — | Per-kW only |

### Web host — a page load
A latency budget walking a topology. The default case; everything in §3.1–3.2 applies. Small, fast,
impatient, bouncing at ~3 seconds, arriving in bursts tied to **your customer's** marketing rather
than yours.
**Visual:** "Sparks" — tiny fast cyan darts, high count, low individual value, arriving in bursty
clumps. Makes a shared-hosting level feel like rain on a window.

### Managed WordPress — a page load *plus* a plugin-update event
Same unit, heavier per request (plugins), and **the customer blames you for their own plugin's
slowness.** Each failure also generates a ticket, so managed WP has the worst ticket-per-visitor ratio
of any line. The plugin-update event is a visitor that can break the site it arrives at.

### VPS / cloud — a provisioning request, and then someone else's traffic
Barely any visitors of your own: the **customer is the unit**, and the traffic is theirs.

**How it works:** The visitor you court is the *developer signing up*, not the packet. The
provisioning request is rare, large, and patient in minutes — but **if setup takes more than a few
minutes they cancel**, which is why automation is a marketing investment (§3.4).

### Dedicated / bare metal — a sales inquiry
Slow-moving, high-value, needs a human. The line where a sales desk is infrastructure.

### Game host — a player joining a server
**They don't bounce on latency, they join, play badly, and leave angry** — a delayed bounce that also
damages the server's population, which damages its ability to attract the next player.

**How it works:** **Visitors that affect each other** is unique to this type and mechanically rich: a
full server attracts players, an empty one repels them (Herding, §3.1). Players arrive in **parties**
— five at once, all-or-nothing: if the party can't get in together, all of them leave. A player is a
*session*, occupying a slot for ~45 minutes, whose experience degrades continuously with jitter — a
visitor you must keep happy over time, not just serve once, which changes the whole rhythm of a level.
**Visual:** "Pawns" — named, persistent, chunky sprites with a nameplate and a **ping chip** floating
above them: green under 30ms, amber under 80, red beyond. A whole server's health is readable as a
cloud of coloured numbers. They *sit down* in a lobby and stay. Losing one is personal: you see the
pawn stand up, shake its head, and walk out — **and the other pawns react.**

### Game host — the Tournament
A scheduled, high-value, high-visibility event. Perfect for an escort/showcase level: a known date, a
known load, a known audience, and nowhere to hide.

### VoIP / SIP — a call
Binary: it either connects with good audio or it doesn't. No partial credit.

**How it works:** Quality degradation is measured in MOS score, and a bad call is remembered far
longer than a bad page load. Calls arrive in predictable business-hour patterns with a hard 9am spike.
A dropped call is instantly noticed and **cannot be retried invisibly the way an HTTP request can.**
**Visual:** **The Frayed Line / the Ribbon** — a call rendered as a taut two-way thread between two
points that visibly frays, thins, and snaps with packet loss. Jitter draws a sawtooth edge on the
ribbon; packet loss draws holes you can see through. The most *physically legible* quality metric in
the game, and it teaches jitter without a tutorial.

### Email host — a message
Arriving in both directions, and **the only visitor whose journey continues after it leaves you.**

**How it works:** Inbound must be filtered without false positives; outbound must be *delivered by
strangers who don't owe you anything*. Success is "delivered to inbox," not "accepted." Which makes
reputation the real product, and **the destination is the boss.**
**Visual:** "Letters" — envelopes that fly in, get sorted, and land in bins; spam is grey pulp,
legitimate mail is crisp white, and **your sorting hall's ratio of white to grey is your reputation,
visible from across the room.** Outbound letters must pass through a **reputation gate** at the far
end that you do not own.

### DNS host — a query
Microscopic, astronomically numerous, individually worthless; collectively, your whole business.

**How it works:** Cached by resolvers, so your actual load is a fraction of real demand — and **TTL is
literally a throttle you control**, a rare case where the operator sets how much traffic they receive.
The customer only notices when it fails.
**Visual:** "Ping Motes" — sub-second life span; they arrive, a node blinks, they're gone. The whole
level is a shimmer. Individual motes are never important; **the shimmer's *evenness* is what you
watch.** Rendered as a fine mist rather than units.

### CDN — a request at a PoP
The interesting event is the cache *miss*. **The hit/miss split IS the gameplay.**

**How it works:** A miss becomes an origin fetch, so **your visitor spawns a *second* visitor headed
inward.** The visual question is *which PoP catches it*. A hit is cheap, fast and happy; a miss is
expensive, slow, and loads your origin.

### Object storage — a GET/PUT
A small number of huge objects and a huge number of small objects are completely different workloads
on the same product.

**How it works:** **PUTs cost you and build a liability; GETs are where egress revenue lives** — two
visitor types with opposite economics moving in opposite directions. Visually lovely, and the clearest
possible statement of why storage pricing works the way it does.
**Visual:** "Pebbles" — PUTs fall in, GETs pop out.

### Backup host — a backup job (and, rarely, a restore request)
**A beautiful inversion: the traffic you serve constantly is not the traffic you're graded on.**

**How it works:** A backup job arrives on a schedule, is large, long-running, and *patient* — it won't
bounce, it'll retry — but it is **absolutely intolerant of the window closing**, and a job that runs
past the window is a partial failure that compounds into tomorrow's. Patience is the wrong model here;
use the **window**. The real visitor that matters is the **restore request**: rare, urgent, and the
only one anyone judges you on. A single unit that is the entire win condition.
**Visual:** "Freight" — big slow crates on a conveyor with size labels, arriving as a nightly convoy
during a visible window band. A **translucent band lies across the board's timeline**: jobs queue at
the edge before it opens, roll in while it's open, and are **physically cut off at the band's trailing
edge** — unfinished crates sit outside, half-open, with a red seal. The band's edge is the level's
clock and it moves visibly. Watching a crate still on the belt as the window closes is pure dread;
success is the crate dropping into the vault with a clunk.

### Backup / DR — the restore request, and the declaration
**How it works:** The restore is worth 10× the reputation of any backup job. In DRaaS specifically the
unit is a **declaration**: the rarest and most valuable visitor in the game. Most customers never send
one, and when they do **it is the entire product.** It arrives by phone, at night, from a person
having the worst day of their career.
**Visual:** **The Red Case / The Ambulance** — a single courier with a red hard case, arriving alone,
walking slowly, with a taxi meter running above them. Everything else on the board dims slightly while
they're on it. Success: the case opens and its contents solidify. Failure: it opens and is empty.
**One unit, one image, the whole business line's thesis.**

### Tape vault — a courier, and a recall request
Physically. With an SLA measured in hours-to-truck and a chain-of-custody stamp. The only visitor that
can be stuck in traffic.

### Video / streaming — a viewer
An extremely long-lived, bandwidth-heavy connection that joins mid-stream.

**How it works:** Sensitive to startup time and rebuffering ratio, not TTFB. Arrives in
**synchronised tides** — everyone at 8pm, everyone at the kickoff, ten thousand at once at event
start. **Perfectly correlated demand**, the opposite of the smooth web curve, and the reason capacity
must cover the sum of peaks.
**Visual:** a crowd whose *size* is the concurrency number, with a chat-scroll waterfall beside it. A
buffering event turns the crowd's eyes to spinners.

### Playout / broadcast — the schedule itself is the visitor
It never stops arriving and it cannot be queued. The only line where being early is as wrong as being
late.

### GPU / AI host — an inference request, or a training job
Same customer, opposite requirements, competing for the same cards. Excellent scheduling tension.

**How it works:** **Inference requests** are tiny, constant, latency-sensitive, and behave like web
traffic — their patience rings drain in *milliseconds to seconds*, and how much patience depends
entirely on whether a human is waiting. **Training jobs** arrive once, occupy enormous capacity for a
very long time, **must not be interrupted**, and *reserve* capacity you then cannot sell — placing one
is like placing a building. **A visitor that is also a commitment.**
**Visual:** inference as **"Prisms"** — they enter clear, pass through a GPU, and leave *refracted
into colour*; the prism spins and the beam splits, and **batch inference is drawn as prisms gathered
into a rack and processed as a group**, which makes batching legible as visual efficiency. Training as
**"The Long Haul"** — an enormous slow slab that parks on a whole pod with a visible progress band.
Preemption drops the slab and it *cracks*. Losing one at 80% destroys weeks of visible progress; a
progress bar resetting is the oldest and best pain in games.

### HPC / render — a job submission
Enters a queue with priorities, fair-share, and an angry researcher whose job has been pending for
nine hours. Submitted in batches, with deadlines.

### CI host — a build job
**A distinct patience curve worth modelling on its own.**

**How it works:** Arrives in bursts tied to the working day and to merges. It is patient — it queues
happily — up to a point, and then the developer context-switches away and **the value evaporates even
if the build eventually succeeds. Value decays with queue time rather than vanishing at a
threshold.** The only visitor that can succeed and still be a loss.

### Kubernetes / PaaS — a deployment
**A visitor that *changes your infrastructure*.**

**How it works:** Your customers reconfigure your platform all day. Frequent, small, self-service, and
occasionally catastrophic. Their own CI is a traffic source you don't control. Terrifying and correct.
**Visual:** **The Blueprint Visitor** — a deployment arrives carrying a rolled blueprint, walks to the
control plane, unrolls it, and **the board physically rearranges to match**: pods sliding, containers
re-stacking. A bad manifest unrolls with a visible error mark and the board rearranges *wrongly*,
which you watch happen.

### Serverless — an invocation
The first one after idle is slow and the rest are fast.

**How it works:** **Your visitor's experience depends on whether another visitor came recently** — the
only unit in the game whose patience cost is set by the arrival history of other units.

### DBaaS — a query
Small, chatty, millisecond-scale. Some are cheap; **a few are catastrophically expensive**, and one
unindexed full scan (400–4,000ms) can eat every slot you have. The Noisy Query's actual weapon.

### Observability host — a metric series
**The only visitor whose arrival is permanent.**

**How it works:** Not a request — a *stream that never ends*. Its cost is its **cardinality** rather
than its volume, so one customer adding a label to a metric can multiply your storage overnight
without sending you any more traffic at all.

### Colo — a prospective tenant touring the facility
**The best visitor idea in the brief**, and the entry that turns cosmetics into revenue.

**How it works:** They physically walk your building: through the lobby, past the security desk, into
the meet-me room, down a cold aisle. **They judge what they see.** Every cosmetic thing the player was
tempted to skip is now literally being inspected. **The tour is a level.** Mess in aisle 3 loses a
five-year contract. Signing them is a multi-year MRR commitment — the highest-value single unit in the
game.

**Expansion 1 — publish the rubric, because a black-box tour is unfair.** A visible **pre-tour prep
screen** listing every scored item, each worth a small percentage of close probability and each
fixable in advance: cable tidiness, labelling, spare capacity, PUE, carrier count, security theatre,
references, floor cleanliness, and whether a tech is visibly stressed. **The prep is the level**; the
tour is then a 90-second walk where you watch your own preparation get judged.

**Expansion 2 — what tenants *actually* look at, which is more specific and more damning than "tidy
cables."** Make these the scored questions and the tour stops being a tidiness check and becomes an
**architecture exam**:
- The **single-line diagram** on the wall — and whether you can explain it.
- Whether the UPS bypass is a **maintenance bypass**: can you service the UPS without dropping load?
  The question that separates a real facility from a room with batteries in it.
- The **fuel contract**, not the generator: how many hours on site, and is your refuelling priority
  contractual or aspirational?
- **Concurrent maintainability**: can you take a CRAC, a UPS, a PDU or a switch out of service without
  losing redundancy? Asked about each one, individually.
- Whether the **meet-me room** has spare capacity, and who else is in it.
- **The last power event** — they will ask, and the correct answer is a date and a story, not "never."
  ("Never" is either a lie or means you've never been tested, and both are bad answers.)
- Whether your techs know the answers, or have to go get someone.

**Visual:** **"The Suit"** — not a mote at all: a walking NPC with a briefcase who arrives by *car* at
your loading dock, is escorted through a mantrap, tours the floor, and either signs (a contract card
animation, a handshake, a weighty stamp) or leaves. One tenant is worth ten thousand sparks and the
art must make that *feel* true — slow, deliberate, high-ceremony. The tour runs on a **Tour Rail**: a
rail-cam locked to the prospect's shoulder, moving at walking pace along the route you built, for ~90
seconds, with **no free-roam**. A judging strip at the bottom fills with verdicts as they see things —
`CABLE MGMT ✓` · `SPARE CAPACITY ✓` · `AISLE 3: OBSTRUCTED ✗` · `UPS AGE: 7 YRS ✗`. **The player's
only agency is what they built before the camera started, which is the entire point of the level.**
The post-tour screen shows the verdict strip beside a **photograph of the exact moment they saw the
bad thing.** That photograph is the feedback.
**Interacts with:** §7.2 (cable tidiness becomes revenue), §8.10 (the Tour Camera), §1.2 (the tour as
a level type).

### Colo — the tenant's engineer badging in
Once signed, the tenant's *people* are also visitors.

**How it works:** A tenant's engineer badges in, walks your floor, and does something to their own
gear that you can only watch. **A visitor that is also a risk** — and the reason access control,
escort policy and camera coverage are gameplay rather than decoration.
**Visual:** the tenant's own traffic, once signed, is drawn as an **opaque bundle** — you see volume
and direction but not content, reinforcing that you don't control it.

### Wholesale / build-to-suit — a site-selection team
Arrives once, and their single decision is worth more than a year of everything else.

**How it works:** A visitor in a suit, with a lawyer. Evaluates power availability, fibre routes, tax
abatement, and water rights. Arrives about once a year and is worth the whole level.

### Colo / wholesale — The Broker
Brings tenants for a cut (3–6% of first-year contract value). A channel partner with leverage, and not
optional in real colo.

### Regulated — an auditor
A visitor with a checklist who walks your *evidence* rather than your network. Certifications are the
marketing and **the audit *is* the funnel.**

### IX operator — a peering session
Not traffic: a *relationship*.

**How it works:** It arrives as two members agreeing (which you can encourage but not force), it has
an establishment sequence you can watch (port up → LACP → ARP on the peering LAN → BGP session
established → prefixes exchanged), and once established it is a **resident** unit that sits there
producing value for years. **Losing one is silent and you may not notice for a month.**

### Registrar — a registration, a renewal, and a transfer
Three units with opposite emotional valences.

**How it works:** A registration is revenue, a renewal is retention, and a **transfer-out is a visitor
walking out the door that you are legally obliged to assist.** The transfer-**in** is the only visitor
in the game you can win by being *faster at paperwork* — a genuinely novel win condition.

### CA — a certificate signing request with a validation challenge attached
**How it works:** The visitor must prove something before you serve it, and the proof mechanism (DNS
record, HTTP file, email) can fail for reasons entirely on their side. High volume, near-zero value
each, **enormous liability each.**

### PACS / medical imaging — a study retrieval with a human attached
Enormous payload, tiny patience, and **the bouncer is a clinician.**

### POS / payments — an authorization
Binary, 2-second hard timeout, and **the bounce is a person standing at a till.**

### WISP — a subscriber's CPE
A **resident** unit with a *physical aim* and a signal-quality stat that degrades with weather and
vegetation. The only visitor a tree can bounce.

### Time service (NTP) — a synchronization client
**How it works:** Does not bounce and does not complain. It just quietly becomes wrong along with you
— the only visitor whose failure mode is silent corruption of everybody downstream.

### Legacy / mainframe — a batch window
The nightly job run is the visitor, it is enormous, it must finish before the branch offices open, and
it has run at the same time since 1997.

### Dial-up — a dialling subscriber
Gets either a connect tone or a busy signal. **The most binary and most nostalgic visitor in the
game**, complete with handshake audio.

**How it works:** One customer, one port, one line — the most concrete visitor in the game. **The
clearest capacity visual ever invented**: a bank of modem LEDs where, when the last one lights,
callers visibly turn away at the door. Three busy signals and they cancel. Reuse its grammar
*literally*, not just conceptually, at every tier — the "busy wall" is the universal capacity read.
**Visual:** "Handsets" — a handset icon with a little person, riding a copper line into a modem bank
port; a red busy-signal glyph and a hang-up if all ports are full.

### BBS / shell / Usenet — a user session
**Visual:** "Cursors" — a blinking cursor that occupies a pty slot and *types*. You can see the load by
how many cursors are blinking at once. Plus a newsfeed that flows constantly whether anyone reads it
or not.

### Seedbox / storage users — occupancy, not traffic
**Visual:** "The Hoarders" — visitors that arrive once and then just *grow*, a slowly inflating blob
attached to your storage. **Visually teaches the difference between bandwidth customers and capacity
customers**, which no number does.

### IoT — a device check-in
Populations of millions, all synchronised by accident — usually by a firmware default nobody chose.
**Visual:** "Grain" — a granular texture with a density; individual devices are never drawn above Tier
1.

### Satellite ground station — a pass
A timed window that either gets captured or is lost forever. **A visitor with an appointment**,
arriving on a schedule you don't control and cannot delay. The purest deadline unit in the game.

### Mining hosting — no visitors at all
Only tenants and kilowatts. **A level with no visitor lane is a great change of pace** and a
deliberate contrast that makes the other levels legible by comparison — the whole game becomes pure
facility management for one scenario.

### Bulletproof — a client who asks no questions
Arrives via encrypted channels, pays in crypto, and whose presence is itself a risk. **Revenue with a
half-life.**

### Ad-tech / RTB — a bid request
100ms, hard. The Timeout Cliff: there is no slow, only late, and late is worth zero.

---

## 3.4 Why visitors bounce

*The fragility model. Give each visitor a patience budget that drains from multiple distinct sources,
so there are many distinct ways to fail them.*

**The classification rule that makes this section tunable.** Every bounce source is exactly one of
three mechanical shapes, and once classified the whole system balances from one table:
- **Millisecond costs** — latency drain, redirect chains, TLS handshake, third-party drag, cold start,
  cold cache, queue wait, path ugliness, scrubbing detour.
- **Fixed patience subtractions** — ugly/degraded layout (−25%), form friction (−8% per field), price
  shock (−40%), visible queue (−15%), pre-damaged mobile arrival (−300ms).
- **Hard cliffs** — error page, scary warning, no instant provisioning, missing-feature filter,
  CAPTCHA fail, mail non-delivery, busy signal, payment decline, fraud false positive.

### Latency drain / TTFB over budget
The master stat. Every hop with queueing costs patience, and every intermediate hop adds to TTFB.
Remember that it is **emergent from load, not additive from a spec sheet** (§3.1).

### Path Ugliness (too many hops)
A visitor routed through extra proxies, a distant PoP, or an overloaded firewall accumulates latency
per hop. **Elegant infrastructure literally looks shorter on screen** — the rare case where the
aesthetically pleasing layout is also the correct one.

### Redirect chains
`http → https → www → trailing slash` is four round trips before a byte of content.

**How it works:** Make this visible as four extra path segments the visitor must physically walk. For
a geo-distant visitor each segment is a full RTT, which is why the RTT-count readout matters more than
the millisecond figure.

### TLS handshake cost
First visit expensive, resumption cheap.

**How it works:** Rewards session tickets/0-RTT, OCSP stapling, and keep-alive. Punishes mobile
cohorts doubly.

### The Error cliff
An error doesn't drain patience, it *ends* the visitor.

**How it works:** And adds a reputation tick. Distinguish **5xx vs 4xx** and *presentation*: a 503
with a nice branded maintenance page bounces politely; a raw white "Internal Server Error" bounces
angrily and generates a support ticket. **Two 5xx in a row from the same client = a churn risk flag**,
not just two lost visitors.

### The Scary-warning cliff
Cert warnings, browser interstitials, malware flags.

**How it works:** Near-100% bounce, and it's a **trust** failure not a speed failure, so the
reputation damage is disproportionate. Binary damage, and a Return Cadence of exactly zero.

### The browser warning that isn't yours
The version nobody models, and it's common.

**How it works:** A Safe Browsing or reputation-vendor interstitial fires on a *neighbouring* site on
shared infrastructure, or on an ad inside your customer's page. **Near-100% bounce for something you
did not do**, and the delisting process is a form and a wait. The purest expression of shared-hosting
blast radius.

### The Captcha tax / your own defenses
Your bot defenses cost every human a slice of patience. Directly quantifies the cost of security:
every defense shows a false-positive rate that costs you visitors.

**Visual:** when your WAF or rate limiter blocks a real visitor, that visitor bounces with a
distinctive **amber** flash and a "blocked by your own defense" micro-icon. **A stream of amber
flashes at your firewall is the player *seeing* their own over-tuning.** No dashboard needed.
⚠️ **But a one-frame flash is not feedback at volume.** Three reinforcements: the amber accumulates in
a visible **pile under the offending defense** so the evidence persists; each defense carries a live
**false-positive counter on its faceplate**; and the amber gets its own deliberately slightly
unpleasant audio cue.

### The defense that is invisible to you because it works before your logs
**The strongest version of the Captcha tax, and the most valuable lesson in the Shared Pipe pillar.**

**How it works:** A visitor blocked at your edge, at your CDN, at your scrubbing provider, or at your
DNS provider's bot manager **never appears in your application logs at all** — so your own
instrumentation systematically under-reports false positives. Model this as a deliberate blind spot:
the false-positive counter is only accurate once you buy edge-side logging. **The game should let the
player over-tune a defense and genuinely not be able to see the damage, then reveal it later.**

### The Phantom Funnel (demand you cannot see)
The visitors who never arrived. **The biggest single gap in the visitor model as originally written.**

**How it works:** A parallel, *invisible* stream: people who tried to reach you and failed before your
board saw them — a DNS resolution failure, an IPv6-only client you don't support, a TLS version you
dropped, a geo-block, a mobile carrier whose routing to you is terrible, a browser flagging you. They
never enter the lane, so **no counter on your HUD ever ticks.** Buying certain observability (RUM,
third-party synthetic checks from many networks, a customer-reported-issues channel) makes a slice of
the phantom funnel visible — and the reveal that you have been losing 6% of demand for an entire level
is the strongest possible argument for external monitoring.
**Visual:** once unlocked, a translucent ghost-stream alongside the real one at the spawn edge, with
its own counter and its own bounce reasons.

### Protocol Compatibility as a Visitor Filter
Who can even talk to you. **A security decision expressed as a population decision.**

**How it works:** A live compatibility matrix — IPv4/IPv6, TLS versions, cipher suites, HTTP versions,
SNI, ALPN, old CA roots, and whatever ancient client one important customer uses — each row carrying a
visitor-population share. Dropping TLS 1.0 is a security win costing 0.4% of visitors, **and one of
them is a payment gateway callback.**

### Happy Eyeballs failure
**A lovely inversion of a "strictly good" upgrade: adding a capability made a cohort slower.**

**How it works:** You published an AAAA record. A slice of visitors have broken IPv6 and their
browser's fallback timer is 300ms of pure added latency — or worse, their IPv6 path is up but
blackholed and the fallback never triggers at all.

### The cert chain that only fails on old clients
A missing intermediate chain, framed from the bounce side.

**How it works:** A specific, invisible cohort loss **with no error in your logs, because the
connection never completed.** You are perfect on every dashboard you own.

### The visitor's ISP is the problem
**You are perfect and they bounce**, and the only way to know is measurement from outside your
network.

**How it works:** Their resolver is hijacking NXDOMAIN, their carrier-grade NAT put them behind an IP
you rate-limited, their corporate proxy is MITM-ing TLS and your HSTS/pinning rejects it, or their
ISP's transit to you is congested at 8pm.

### The mobile-carrier NAT block
The carrier-scale version of fail2ban self-DoS, and a different order of magnitude.

**How it works:** Your per-IP rate limit bounced 40,000 subscribers sitting behind one carrier NAT
gateway. Argues for **per-ASN and per-session limits rather than per-IP**, which is a real and
non-obvious build.

### Geo-IP misclassification
**How it works:** Your CDN sends a visitor to the wrong continent because a database says their IP is
in the wrong country — common after IP transfers. They experience 280ms and **you see nothing wrong.**

### Cold start
The newly-scaled-up node serves its first N visitors badly. **Scaling is not instantly good.** Also
applies to cold caches after a deploy or a restart, and to serverless (300–1,500ms).

### Cold cache after a deploy
Every deploy that busts the cache creates a slow window, so **deploying is a defensive
vulnerability** — delightfully true to life, and the reason the deploy calendar and the wave calendar
should be visible on the same strip.

### Queue Despair (the visible queue)
**How it works:** If you use a waiting room, patience drains slower but conversion drops (−15%).
Visitors waiting in a queue visibly degrade — a colour drain — and leave. Comfortable queueing means
they sit; bad queueing means they pace.

### Queue-time value decay (the patience model that depreciates instead of bouncing)
**How it works:** For CI, HPC, transcode and support, the request eventually succeeds and **the value
is gone anyway because the human moved on.** A patience curve that doesn't bounce, it *depreciates* —
worth modelling separately because every counter for it is different (priority, preemption, a progress
indicator that keeps the human engaged).

### Ugly / broken / degraded layout
Degraded mode costs patience even though "the site is up."

**How it works:** CSS from a dead CDN, missing images, broken mobile layout, heavy JS (bounce for the
mobile cohort only). A fixed −25% patience subtraction rather than a millisecond cost.
**Visual:** the Site Preview Window (§8.8) visibly loses its images and CSS — **you can literally see
your website getting uglier.**

### Third-party drag
Analytics, ads, and chat widgets you added for *money* slow the page for everyone. **A revenue
decision that costs conversion**, and one whose cost is invisible unless you measure it.

### Search ranking decay
Chronic slowness reduces the *spawn rate* of future visitors.

**How it works:** Damage to the future, not the present — the hardest lesson in ops, and perfectly
gamifiable. Rendered as the crawler's site-map grid visibly un-filling.

### Mail deliverability
Password resets and receipts landing in spam.

**How it works:** Customers churn for reasons the player will not see on any latency graph. Requires
SPF, DKIM, DMARC, reverse DNS, a warm IP, and a clean neighbourhood.

### Reputation Bounce (email)
**How it works:** If your IP is listed, the visitor **never even arrives.** The only bounce that
happens entirely outside your board, decided by a third party with no obligation to you.

### The Slow Landing Page (business recursion)
Your marketing site is hosted on your own infrastructure.

**How it works:** If your infra is struggling, *your sales funnel is struggling too*. **Beautiful
recursion: an attack on your servers is simultaneously an attack on your customer acquisition.** The
lesson players eventually learn is to host the marketing site and the status page elsewhere.

### The Trust Gap
Visitors check for signals before they even enter.

**How it works:** A real address, a phone number, a status page, review scores, an SSL padlock, and
"how long have you existed." Each is a cheap buildable that raises conversion a few points. Missing
several and visitors path *right past you* to a competitor.
**Visual — The Doorstep:** a threshold strip just inside the spawn edge where visitors **stop for
~0.4s** while a small thought-bubble checklist appears with your trust signals as ticks or crosses:
padlock, status board, review stars, phone number, years-in-business. Then they walk on or turn
around. **A line of visitors stopping and turning at the doorstep is a completely different diagnosis
from a line of visitors bouncing at your app**, and you can see which you have from full zoom-out.

### Price Shock at Checkout
Advertised $2.95, renews at $11.95.

**How it works:** Converts great, churns horribly at month 13, and generates the angriest reviews in
the industry. A deliberately available, deliberately poisoned strategy. Disclosing the renewal price
late raises signups *and* raises refunds — a legible two-sided dial rather than a moral lecture.

### Form Friction
Every additional signup field loses ~8% of visitors but gains fraud-screening accuracy. A slider with
two opposing curves, and one of the few places where the anti-fraud build and the conversion build are
the *same* build with a different setting.

### Payment declined
**A silent, huge loss — often 5–15% of attempted orders**, and the player will never see it unless
they build order analytics. The single most under-modelled leak in every business game.

### Fraud check false positive
You rejected a real customer. Strict screening rejects ~4% of good customers, and each one bounces at
the most valuable moment in the funnel.

### No Instant Provisioning
If setup takes more than a few minutes, visitors bail.

**How it works:** **Automation is therefore a *marketing* investment, not an ops one** — the cleanest
single line in the whole document about why the two halves of the game are one game.

### The Missing Feature Filter
Visitors carry a checklist icon.

**How it works:** SSH? Node? Staging? Daily backups? Free SSL? A specific control panel? A region? An
OS image? A certification? Visitors whose checklist you can't satisfy visibly *turn around* — an
at-a-glance read on what product gap is costing you traffic.

### Pre-sales response time (the lead decay timer)
A pre-sales chat that answers in 30 seconds converts at ~3×.

**How it works:** Live chat is simultaneously a cost centre and your highest-ROI conversion tower.
Generalised: **every lead carries a literal decay timer.** A lead contacted in 5 minutes converts many
times better than one contacted in 24 hours, and the timer should be drawn on the lead.

### Contract-end bounce (colo and enterprise)
Invisible for 35 months, then a single decision point. The bounce that takes three years to arrive and
cannot be fixed in the last month — which is what makes the Renewal Calendar (§3.7) a real object.

---

## 3.5 Customer and client archetypes

*The recurring-revenue population, distinct from per-request visitors. Each carries ARPU, churn,
support load, abuse risk, and referral value — and, in the expanded table below, the three numbers
that actually determine whether an archetype is good business.*

**The table, with the columns that make it honest.** ARPU alone is meaningless — Hobby Harold at $4
with $6 of support is a loss. Add **cost-to-serve**, **gross margin %**, **CAC & payback**, **typical
term**, and **referral coefficient**, and the table ranks the archetypes arithmetically instead of
intuitively. Two further columns make it *playable*: a **Threat Draw** column (which threat families
this customer attracts — the §3.9 "clients are spawners" mechanic made concrete) and a **Fits With**
column (which archetypes they co-exist with well or badly). Customer *mix* then becomes a drafting
puzzle rather than a sum.

| Archetype | ARPU | Cost to serve | Margin | CAC / payback | Term | Referrals | Churn | Abuse risk | Threat draw | Special |
|---|---|---|---|---|---|---|---|---|---|---|
| **Hobby Harold** | $4/mo | $2.80 | 30% | $25 / 9mo | Monthly | 0.1 | High | Low | Compromised WP | Churns when his project dies (always) |
| **Small Biz Brenda** | $25/mo | $3 | 88% | $60 / 2.4mo | Annual | 0.4 | Very low | Low | Phishing of *her* | **The best customer in hosting, and the table should make that arithmetically obvious** |
| **Agency Anya** | $600/mo | $70 | 88% | $400 / <1mo | Annual | 0.9 | Low | Low | Correlated plugin vulns | 40 client sites at once; leaves with all 40 |
| **Dev-Shop Dan** | $200/mo | $60 | 70% | $150 | Monthly | 1.2 | Medium | Low | Odd protocols, API abuse | Demands features, becomes a design partner |
| **Reseller Raj** | $150/mo | $20 | 87% | $80 | Monthly | 0.3 | Medium | **Inherits theirs** | Everything his customers attract | His customers' abuse becomes yours |
| **Startup Sam** | $900/mo, growing | $150 | 83% | $1,200 | Annual | 0.6 | High | Low | Traffic spikes | 50% chance of dying, 10% chance of becoming your whale |
| **Enterprise Edith** | $8,000/mo | $1,400 | 82% | $14,000 / 6mo | 3-year | 0.2 (each worth $8k) | Very low | None | Targeted, not opportunistic | Net-60, 5-month sales cycle, annual price pressure |
| **LowEnd Larry** | $3/mo | $1.80 | 40% before CAC, **negative after** | $65 affiliate CPA / 22mo payback, 8mo tenure | Monthly | 0.1 | High | **High** | Scanning, spam, mining | Buys on deal forums, abuses everything, churns at renewal |
| **Crypto Chad** | $50/mo | varies | — | Low | Monthly | 0 | N/A | **Extreme** | DDoS reflection, power draw | Miner or DDoS origin. Refuse him or regret him. |
| **Nonprofit Nina** | $15/mo | $6 | 60% | ~$0 | Annual | **1.8** | Zero | Low | None | Asks for a discount forever. Enormous referral/PR value. |
| **Government Greg** | $12,000/mo | $2,500 | 79% | $20,000+ | Multi-year | 0.2 | Zero | None | Nation-state interest | Certifications required; net-90 |
| **Migrating Marcus** | $60/mo | **Huge for 2 weeks**, then $5 | — | Staff hours | Annual | 0.7 | Low after 90d | Low | Inherited mess | Onboarding-cost spike then a great customer |
| **Churn-Risk Chloe** | $30/mo | $8 | 73% | — | Monthly | 0 | **???** | Low | — | Shows early warning signs; savable if you notice |
| **Whale Wendy** | $40,000/mo | Custom | 75% | $60,000 | Custom | 0.3 | Low | None | Everything aimed at her | 30% of revenue. Both a trophy and a loaded gun. |

### The $3 Shared Hosting Customer / The Hobbyist
One tiny site. Almost no revenue, almost no cost — until they get hacked.

**How it works:** At which point they cost 40× their monthly fee in abuse handling. A volume business:
profitable only in aggregate, and only if your automation is good. Pays $5, uses nothing, never
complains, never grows, will leave over $1. **Terrible for capacity planning because there are
thousands of them** and their aggregate is invisible until it isn't.

### The Small Business Site
$15–25/mo, likely to prepay annually, medium support ("can you fix my email"), low expansion, *very*
low churn if you never break anything. **The quiet backbone of shared hosting**, extremely loyal if
treated well, and the archetype that best rewards simply not screwing up.

### The WordPress Agency
80 client sites, all with the same 12 plugins.

**How it works:** One plugin vuln compromises all 80 simultaneously. High revenue, terrifying
**correlation** risk. Wants white-label panels, reseller tooling, a dedicated account manager, and a
phone number. Losing one agency = losing 40–200 accounts in a single notice.

### The Developer Customer
Low revenue, high technical demands, self-serve, price-sensitive — but writes about you publicly,
benchmarks everything, and refers others. **A reputation multiplier disguised as a support cost.**
Will absolutely notice your oversell, will argue about your kernel version, will report real bugs, and
**will leave instantly for a better API.** Handle well and they are your best evangelist; their real
value is the visitors they drag in behind them, which the model should score explicitly.

### The Forum / Community
Bursty, DB-heavy, attracts attacks and drama, generates its own abuse reports. Loyal and long-lived if
you keep it up, and a high churn-contagion node.

### The E-Commerce Store
Revenue tracks *their* revenue.

**How it works:** Downtime cost is quantified in their lost sales and they will tell you the number.
PCI scope. Seasonal. Also frequently **bimodal** (see below): a cacheable storefront and a brutally
expensive admin panel on the same account.

### The SaaS Company
Your customer whose customers are the traffic.

**How it works:** Their growth is your growth; their outage is your fault regardless of cause. The
archetype where the Customer's Customer Sentiment mechanic (below) bites hardest.

### The Startup Rocket / The Startup That Might Be Huge
Currently pays $200/mo, might pay $80k/mo in 18 months, might evaporate.

**How it works:** Expansion potential is the highest in the game and so is the churn risk — they get
acquired, pivot, or run out of money. Discounting them now is a bet. **Give the player a scouting
mechanic** (funding rounds, hiring signals, press) so the bet can be *informed* rather than blind.

### The Enterprise
Slow to sign, slow to leave, demands audits, SLAs, and paperwork. Unlocks regulated business lines and
blocks on compliance unlocks. Net-60, 3-year term, 60-day procurement, 60-page security questionnaire.

### The Enterprise Procurement Monster
The maximal version: a 9-month sales cycle, a SOC 2 requirement, net-90 terms, and a legal team that
wants unlimited liability. **Winning them requires building compliance artifacts levels in advance** —
which is the mechanic that makes boring purchases retroactively brilliant.

### Government Greg / the Government-Institutional Buyer
Compliance overhead, slow payment terms, enormous stability, immune to competitor poaching.

**How it works — the procurement reality, which is great material:** Net-90 is right, and add: you
must be on a **purchasing vehicle or schedule** to bid at all (a multi-month certification project);
awards can be **protested** by losing bidders, delaying your revenue by months; contracts are often
**annual appropriations**, so they can evaporate at a fiscal-year boundary regardless of satisfaction;
and there are **socioeconomic set-asides** you may or may not qualify for, which is either a moat or a
wall. Payment is certain and slow — **precisely a cash-flow puzzle, not a credit-risk one**, and the
game should make the player feel that distinction. Fiscal-year-end produces a buying spree in a
two-week window.

### The Dormant Account / The Zombie Account / The Ghost
Paying monthly for a site nobody visits, on a server you forgot exists, running an OS six years EOL.

**How it works:** Pure profit — and an unpatched, unmonitored, forgotten compromise waiting to happen.
**The best customer and the worst risk are the same account.** Free money until their expired card
fails. See also §3.2's Ghost fork (audit or ignore) and Dormant Wake-Up.

### The Zombie (the one who already left)
Cancelled eight months ago, still has data on your array, still has a DNS record pointing at you,
still generates 404s in your logs. **A customer-shaped cost with no customer attached** — and a
genuine data-retention liability.

### The Mail-Only Customer
Tiny revenue, outsized risk: mail is the single most abuse-prone service you can sell, and one
compromised mailbox puts your whole outbound reputation in a blocklist.

### The Crypto / Streaming / "Special" Customer
Offers 5× rates, brings 10× abuse complaints and upstream attention. Taking them is a run-defining
choice, not a line item.

### The Gray Tenant (bulletproof)
6× MRR, crypto payment, generates abuse tickets from hour one. Legal but reputationally risky. **Raises
Heat.** Revenue with a half-life.

### The Adult Site
High bandwidth, high revenue, payment-processor complications, and some upstreams object. **A real
business decision with real tradeoffs**, and one that should be presented as commerce, not scandal.

### The Abuser (Knowing)
Signs up with a stolen card to host phishing, a spam relay, or a booter panel.

**How it works:** Spot them by behaviour — instant heavy outbound, port scanning, odd geography, rapid
account creation. Fraud screening on signup is a buildable that **also rejects real customers** (~4%).
Net negative; detecting them early is a skill unlock.

### The Abuser (Unknowing)
A real customer whose site got compromised and is now serving malware.

**How it works:** You must notify, help, or suspend. **Suspend-first protects your IP reputation and
enrages them; help-first costs staff hours.** No option is free and none is clearly correct — the best
shape a decision can have.

### The Crypto Miner
Signs up for the "unlimited" plan and pegs 100% CPU forever. Pays well, uses 100% of everything, and
will abandon the moment the index dips. **Every unmetered product you ship will be discovered by these
people within 72 hours.**

### The Bandwidth Hog
Bought a "1Gbps unmetered" port and actually uses 1Gbps. **Your entire pricing model assumed nobody
would.** Seedbox and file-host customers live here, and they are the reason the word "unmetered" is a
game mechanic.

### The Bargain Hunter Tenant
Wants your cheapest rack space, will leave for $5, generates disproportionate support load. The colo
expression of LowEnd Larry.

### The Colo Tenant (another hosting company)
Your peer, your risk, and your competitor. Signs 3–5 year terms; revenue is extremely sticky (moving
racks is agony) but **you inherit their bad habits**, their outage is your building's outage story,
and they compete with you in the retail market. A weirdly intimate rivalry.

**Sub-types worth drawing separately:** *the neat freak* · *the cable-spaghetti artist* · *the one who
exceeded their power allocation eight months ago and nobody noticed* · *the one whose gear is all out
of warranty* · *the one who is actually a competitor scoping you out.*

### The Financial Firm (exchange colo)
Pays absurdly for microseconds, demands **fairness guarantees** (equal cable lengths, documented), and
audits you. The only tenant for whom your cable management is a contractual term.

### The Healthcare Practice (HIPAA) / The Compliance Customer
Small MRR, enormous compliance requirements, zero churn. Pays 4× but requires evidence, audits, and
controls — **and will terminate the entire contract on one finding.** Lock-in cuts both ways.

### The Game Community Admin / The Clan or Guild
A 19-year-old running a server for 200 friends; 40 people sharing one $12 server with one payer;
seasonal.

**How it works:** Will churn the moment a competitor offers a free month, **but their community
follows them**, so winning one wins 200 players' worth of goodwill — and losing one loses it in a
single Discord message. A reputation amplifier with an ARPU of nothing.

### The Modded-Server Owner
High resource use, high support, high loyalty, evangelises hard. The customer whose cost-to-serve and
referral coefficient are both at the top of the table.

### The Streamer / Influencer (as a client)
Pays little or nothing, generates enormous signup flow. **A customer whose value is a demand
multiplier**, who will leave instantly for a competitor's better sponsorship deal.

### The Broadcaster (video)
Enormous burst, 95th-percentile hostile, event-driven. Their entire year can be four nights.

### The AI Startup (GPU)
Needs 64 H100s yesterday, has funding, has zero ops experience, will try to `pip install` their way
out of an NCCL misconfiguration and then open a ticket blaming your fabric. Needs 64 GPUs for six
weeks and then either 1,000 or zero.

### The AI Lab / Research Lab (HPC & GPU)
Books 18 months of GPU capacity, changes requirements every month, and makes you turn away everyone
else.
**The grant-funded variant:** buys in a burst at fiscal year end, disappears, and returns exactly one
year later — **seasonality with a calendar you can plan around.**

### The Grant-Funded Lab (revenue with a published expiry)
Excellent customer, funded by a grant that ends on a **known date**.

**How it works:** You can see the revenue cliff on your calendar for two years and must replace it
before it arrives. **A customer that teaches forecasting** by being unambiguously good and
unambiguously temporary.

### The Backup Customer
Buys TBs, **grows monotonically** (data only ever increases), never leaves because egress is the moat.
**The best customer in the game and the most boring** — and the living argument for data gravity.

### The Migration-In Refugee
Fleeing a competitor's outage. High intent, **low trust**, will flee you just as fast. Arrives in
bursts after a competitor's incident.

### The Agent / Master Agency
A channel-partner *client* the reseller model doesn't cover.

**How it works:** Arrives representing a customer, not themselves. Brings real, qualified demand.
Costs 10–20% of MRC as a **residual commission for the life of the contract** — forever, including
renewals. Owns the relationship; annoy them and they move the customer. Simultaneously shopping the
same deal to three competitors, so you're bidding blind. **Mechanically it is a client that
permanently attaches a leak to any revenue it brings in**, which should make agent revenue visibly a
different colour of money.
**Hosting types:** colo, VoIP, transit, managed services. Nearly absent in shared/VPS.

### The ISV / OEM Embedder
A customer who resells you invisibly inside their own product. **A whale with a mask on.**

**How it works:** A software vendor hosts every one of their customers on you and never tells them
your name. Enormous, single-invoice, low-touch revenue with a terrifying concentration profile, zero
brand benefit, and total dependence: if they build their own or get acquired, **you lose the whole
block in one notice period.**

### The Credit-Risk Startup
A prospect you should probably make pay in advance. **Introduces the credit decision**, which no
hosting game has ever modelled and which every real host makes weekly.

**How it works:** Great logo, real usage, six months of runway, a twelve-month contract. Options:
require prepayment (they may walk), require a personal guarantee (they *will* walk), take a deposit,
set a credit limit with auto-suspend, or take the risk.

### The Ex-Customer
A win-back target: **cheaper to re-acquire than a cold lead**, if and only if you have fixed the
reason they left. Emailing them is nearly free and converts a few percent — unless they left angry, in
which case you generate fresh reputation damage.

### The Migration-Out (the customer leaving who still needs you)
Missing from every version of the churn model: the customer who has given notice, **still pays**, now
files more tickets than ever, and whose data extraction is saturating your egress.

**How it works:** Your options — help enthusiastically (costs money, they may come back, they will
definitely talk about you), help minimally (they'll talk about you too), or **charge for the
retrieval** (correct, legal, and the fastest way to create a viral post). **The retrieval-fee decision
is the single most reputation-relevant billing choice in hosting.**

### The Bimodal Customer
One account, two totally different traffic shapes.

**How it works:** An e-commerce customer whose storefront is cacheable and whose admin panel is
brutally expensive; a game studio whose players are latency-bound and whose patch distribution is
bandwidth-bound; a SaaS whose app is steady and whose nightly export flattens your database. **One
customer card, two profiles — and isolating them from each other is an architecture decision.**

### The Off-Peak Customer (selling the shape of your own valley)
**How it works:** Because opposite peak hours are a stated synergy, make it a *sellable product*:
discounted capacity available only outside your peak, enforced automatically. Batch, backup, render
and crypto customers all buy it. Your utilisation curve flattens — **and your risk profile changes,
because now your valley is full and a peak surprise has nowhere to go.**
⚔️ **Tension:** the off-peak product is the single best margin improvement available *and* it removes
the headroom that absorbs surprises. Both are true; the game should let the player find out.

### The Customer's Customer Sentiment (two layers of anger)
**How it works:** When you host a business, their end users complain to *them* and they complain to
*you*, with amplification and distortion at each hop. Model end-user sentiment separately and show the
player only the **filtered** version — so during an incident your customer says "our users are
furious" and you cannot verify it. A **shared status page** or a direct end-user comms channel lets
you see the real number, and **sometimes it's lower than they claimed.**

### The Compliance-Driven Buyer
A customer who arrives because of a rule, not a need.

**How it works:** New regulation in *their* industry forces them to move data somewhere compliant.
They are not shopping on features or price — they are shopping on a certificate you either have or
don't. **The whole segment appears at once, on a deadline, and disappears once everyone has moved.**
Regulatory weather as a *demand* event rather than a threat event.

### The Silent Majority
Customers who never contact you at all — and the reason your data lies to you.

**How it works:** 80% of your base never files a ticket, never answers a survey, and never appears in
any qualitative signal. **Every conclusion the player draws from tickets and surveys is drawn from the
loud 20%.** Show it explicitly as a **coverage percentage on every feedback panel**, and give a
purchasable way to sample the silent ones (proactive outreach, an in-product signal, a usage-based
health score). **Teaching a player to distrust their own feedback data is a real and rare lesson.**

---

## 3.6 Attraction and acquisition channels

*The other half of the two-directional loop, and the half tower defense games never have. The player
should have **an offensive economy**, not just a defensive one. Each channel is a literal **road**
into your map with its own cost, lag, quality, durability and saturation point — and, crucially, its
own **mix** of visitor archetypes.*

**The comparative channel table.** Twenty-plus channels with qualitative descriptions is a list;
with numbers it is a strategy layer. (Figures below are a starting tuning set merged from two
independent proposals; where they differed, both ranges are shown.)

| Channel | CAC | Ramp / lag | Quality (LTV mult.) | Durability | Saturates at | Notes |
|---|---|---|---|---|---|---|
| Organic search / content | ~$0 marginal, high fixed | 4–12 months | 1.4× (high) | Fragile (algorithm) | Your content volume | Compounds; dies with uptime |
| Paid search (PPC) | $40–200 | Instant | 0.8× (medium) | **None** — stops with spend | Competitor spend | CPC rises as rivals bid |
| Affiliate / review site | $65–200 CPA | 1–2 months | 0.6× (low) | Medium | Number of sites | Clawbacks, coupon hijack |
| Deal forum | $0–15 | Instant | **0.2× (worst)** | None | One post, then nothing | Fills capacity with churn |
| Referral / word of mouth | $25–60 bounty | 2–6 months | **1.8× (highest)** | High | Your happy-customer count | Segment-local (see below) |
| Partner / reseller channel | ~$0 direct, 20–30% margin share | 3–9 months | 1.1×, **invisible churn** | Medium | Partner count | You don't own the customer |
| Agent / master agency | 10–20% residual **forever** | 6–12 months | High | Medium | Agent count | Permanent margin tax |
| Outbound sales (SDR + AE) | $2,000–15,000/deal | 4–9 months | 2.5× (enterprise) | High | Rep count | Cash-flow trap if impatient |
| Conference / trade show | $8k–40k one-off | 2–4 months lag | 1.6× (enterprise) | Low | One per season | Lumpy, relationship-driven |
| Platform "recommended" slot | Political + engineering | 12+ months | **Highest** | Fragile (they can remove you) | One slot | Best channel in hosting |
| Registrar cross-sell | ~$5 | Instant | 1.3× | High | Your domain base | Retention glue |
| Migration concierge | Staff hours | Instant, opportunistic | **1.7×** | High | Rival outages | Best ROI tactic in the industry |
| Content & tooling magnet | Staff hours | ~6 months | High (developers) | High | Your credibility | Also a hiring channel |
| Community / open source | Staff time | 6–12 months | **2.0×** | High | Your credibility | Destroyed by one bad incident |
| Marketplace listing | 15–25% rev share | ~1 month | 0.9× | Medium | The platform | Platform policy is a threat you can't control |
| Free tier | COGS, not marketing | Instant | 1–3% convert | Medium | Your capacity | Immediately abused |
| Sponsorship (streamer/podcast/OSS) | $2k–50k | 1–3 months | High (niche) | Low | Creator count | Dominant for game hosting |
| Broker (colo/wholesale) | 3–6% of first-year contract | 3–9 months | High | Medium | Broker relationships | Not optional in real colo |
| Seasonal promo / Black Friday | Margin | Instant | **Very low** | None | One event | A 12-month renewal-cliff time bomb |
| The competitor's outage | Readiness spend | Instant, reactive | **Highest intent** | Medium | Rival incidents | Free lane that opens by itself |
| PR / post-mortem publishing | Staff hours | 1–2 weeks | High | Medium | Your honesty budget | Transparency as marketing |
| Compliance attestation | Enormous fixed | 6–18 months | High | High | Certification scope | *Unblocks* queued leads rather than generating them |
| Acquisition (buy the lane) | Purchase price | Instant + integration | Mixed | High | Cash | Attrition tax on arrival |

**Two rules that make the table a game rather than a spreadsheet:**
1. **Channels saturate.** Doubling spend yields ~1.4× customers, not 2×.
2. **Channel quality is inversely correlated with speed.** The fast channels bring the worst
   customers. This is the truest thing in hosting marketing and it should be discoverable, not stated.

### Demand Mix (marketing as creep-wave composition)
**The single idea that turns §3.6 from a list of taps into a strategy layer.** Channels don't just
change *volume*, they change the **composition** of your incoming units — and in this game your
customers are also your load, your abuse surface and your ticket volume.

**How it works:** A stacked bar you are shaping, updated live as you fund channels:

| Channel | Mix it produces |
|---|---|
| SEO garden | Deep Readers, Comparison Shoppers, Googlebot; low abuse |
| Paid search | Impulse Buyers, Tire-Kickers; +15% fraud rate |
| Deal forum | LowEnd Larrys, Crypto Chads; +400% abuse; instant volume |
| Referral | Small Biz Brendas; highest retention; slowest |
| Affiliate | Refund Hunters, Migration Tourists; volume, poor LTV |
| Conference / outbound | Enterprise Evaluators, Procurement Delegations; 90-day lag |
| Community / OSS | Developer Customers; high expectation, high reputation |
| Marketplace | API Clients; machine traffic; retry-storm exposure |
| Free tier | Freeloaders, Tire-Kickers, and the occasional Startup Sam |
| Compliance attestation | Enterprise Edith, Government Greg, Healthcare |

**Why it matters:** the player is choosing **which enemies they fight.** "Turn off paid search to
reduce fraud" becomes a real, legible move.
**Interacts with:** §3.5 archetypes, §2.4 mimics, §6.3 CAC.

### The SEO Garden / Organic Search Road
Slow-acting, compounding, free per-visitor forever after — and it dies if your uptime is bad.
**Models "reputation is built slowly and lost instantly" as a literal growth curve.**

**How it works:** Takes many minutes (months in fiction) to grow, seconds to damage. Highest-LTV
traffic in the game. Proposed rates so it is tunable: each content plant takes **3 in-game months** to
reach full yield, yields `base × quality × freshness`, **decays 6%/month without tending**, and an
algorithm-update event rerolls `quality` on ±30% of plants. Outages damage the garden at **−1
plant-health per 15 minutes of 5xx seen by crawlers.** That gives the player a compounding channel
with a real maintenance cost, which is exactly what SEO is.

**The algorithm update, and the only defence.** Make the **Core Update** a real, recurring,
unpreventable event. The only actual counter is **brand/direct traffic** — the one acquisition channel
no third party can take from you. That gives brand investment a specific mechanical job beyond a
conversion multiplier: **it is channel insurance.**

**Visual:** a garden plot on your property; each content page is a plant. Well-tended plants bloom and
attract organic visitors; neglected ones wilt and shrink your organic spawn rate. Bots pollinate.
Wilting is **directional** — plants nearest the path wilt first when you serve crawlers 503s, so
damage spreads inward from the road and recovery visibly regrows outward. The garden is **visible from
the establishing frame**, so a neglected content strategy is part of your facility's portrait. Utterly
charming, mechanically sound, and it makes an abstract system spatial.

### The Ad Spend Dial / Paid Search Highway / The Beacon
Instant, expensive, linear, non-compounding, and **stops the moment you stop paying.** The panic
button, and the perfect contrast to the SEO Garden.

**How it works:** Cost-per-click rises with competitor spend — a visible auction other AI companies
bid in, which turns ad spend into a **two-player decision** rather than a tap and gives the Competitor
AI a lever that doesn't require attacking you. Turning it off is instant cash relief and instant
growth stall, which is *exactly* the CEO dilemma during a crunch. You can bid on **competitor brand
terms** (cheap, effective, slightly dirty, may trigger a trademark complaint).
**Visual:** **The Beacon** — a lighthouse on your property whose beam sweeps the map edge. Where the
beam touches, visitors spawn. Beam brightness = spend, beam reach = targeting. **Ad budget becomes a
literal, adjustable, physical object.** Two refinements: the beacon has a visible **fuel draw**, so
turning it off is visibly a cash decision; and competitor bidding renders as **other beacons on the
horizon whose beams overlap yours, dimming your effective reach** — an auction rendered as light
interference. Alternatively/additionally the marketing budget is a **billboard** at the map edge whose
size and lighting track spend, with the inbound lane visibly widening from its base; cut the spend and
the billboard fades and peels in real time.
⚠️ **The trap to teach in level 2:** marketing into insufficient capacity = mass bounce = reputation
damage. **Advertising is a self-inflicted DDoS if you're not ready.**

### The Banner Ad Kite (cheap/spammy marketing)
**Visual:** a tacky animated banner kite that brings a **wider but greyer** stream — high volume, low
patience, high bounce. **You can see the quality of your acquisition channel in the colour of the
crowd it brings**, which is the cheapest possible statement of the speed/quality inverse rule.

### Content Drops / The Content Engine
Hire writers; spawn rate grows over time and is threat-resistant.

**How it works:** ~6-month lag before returns, then a permanent free traffic tap. Spending a staff
hand on content creates a permanent spawn-rate bump **in a specific visitor archetype** — which lets
the player *choose which visitors they get*, and therefore shape the difficulty of their own traffic.

### The Page Speed Score
A single visible 0–100 number derived from your actual latency budget.

**How it works:** It multiplies **both** conversion and organic spawn rate. **One number that connects
defensive build decisions to offensive revenue** — the game's central feedback loop made numeric.

### The Status Page (honesty as a resource)
Doesn't attract, but *retains* — and it is the best trust mechanic in the design.

**How it works:** During an incident it halves reputation damage and cuts the ticket avalanche.
Publishing incidents publicly *reduces* the reputation damage of an outage but *advertises* that the
outage happened, slightly suppressing new signups. Hiding incidents preserves signups but, if
discovered, doubles the damage. **A trust/short-term-revenue tradeoff with a bluff mechanic in it.**
Must be hosted *off* your own infrastructure — a trap players learn exactly once.

**Give it a curve, not a binary.** Publishing within **5 minutes** cuts reputation damage 60% and
ticket volume 70%; within **20 minutes**, 40%/50%; after resolution, 15%/0%. Publishing *nothing* and
being found out doubles the damage. Publishing *too often* — more than ~2 minor incidents a month —
suppresses new signups by ~8%. **The player is now managing an honesty budget**, which is genuinely
novel and very true.

**Two additions from painful experience:**
1. **Update cadence beats update content.** Customers tolerate "still investigating, next update in 20
   minutes" far better than silence followed by a perfect explanation. Model a **cadence promise**:
   you commit to an interval, and **missing your own stated interval costs more trust than the
   outage.**
2. **The subscriber list is an asset.** A status page nobody is subscribed to deflects nothing.
   Growing the subscriber base is a slow, cheap, **pre-incident** investment that determines the
   ticket-deflection multiplier when it matters. Preparation for communication, not just for
   infrastructure.

**Visual:** **Uptime Trophy Wall** — a board on your storefront showing the last 90 days as coloured
pips, **physically printed and updated daily by a staff sprite**, so a day you'd rather not publish is
a moment where someone walks over and pins up a red pip. **Honesty as a visible act.** Visitors *look
at it* before entering (the shared Glance Animation), and a board full of red pips makes them turn
around at the Doorstep. Complemented by **The Status Page Beacon**: a lamp on the front of your
building — green, amber (degraded, with a scrolling note), red — where lighting it honestly during an
incident visibly *calms* the social-media flock and slows churn. **Transparency drawn as a light that
soothes.**

### The Speed Badge / Uptime Badge
Cross a threshold and earn a public badge. **Rewards excellence, not just survival.**

**How it works:** If your p95 stays under a threshold for N minutes, or you cross 99.9% for a month,
you earn a visible badge that permanently raises conversion and upgrades your inbound client quality
tier — **and now you are contractually liable for it**, which makes SLA credits more expensive.
Opt-in difficulty with a revenue reward: the best kind of unlock.

### Uptime History
A public track record that enterprise units check. **Makes early-level failures matter in late
levels** — the mechanism by which the campaign has memory.

### Latency as a Product (publish your numbers)
**How it works:** Publish a looking glass, a ping page, a global latency table. In game-hosting and
finance-colo levels, **being 12ms faster than the competitor *is* the entire sales pitch** — players
and traders pick you because you're 4ms closer. The counterpart risk: published numbers can be
disproven, and a benchmark invites people who want to disprove it.

### Benchmark Publication
Publish a performance benchmark; developers arrive — **and so do people trying to disprove it.** A
channel with a built-in adversary, which is rare and good.

### Referral Program / Word-of-Mouth Footpaths
Pay a bounty per referred customer; converts cash into spawn rate. **The cheapest CAC in the
business.**

**How it works:** Give $50, get $50. Requires a portal build and a fraud-detection sub-module
(self-referral rings). Free, slow, and the highest-converting traffic that exists — it multiplies the
*Refer* stage of the funnel and scales with NPS. **It should be the reward for good operations: every
level you run well widens this lane for the next level.**

**Segment-local, not global.** Referral flows *within a segment*: a delighted WordPress agency refers
other WordPress agencies; a delighted colo tenant's referrals go to other engineers in the same metro;
a delighted game-server community refers other communities **of the same game**. **This is why niche
positioning compounds and generalist positioning doesn't** — and modelling referral as a segment-local
effect makes that a *discovered* strategy rather than a stated one.
**Visual:** happy customers emit a thin gold thread back to the map edge that becomes a *new spawn
point*; over time a happy site is surrounded by a glowing web of referral threads. **Reputation
becomes visible topology.** Threads persist ~3 minutes and fade; a happy customer refreshes theirs; an
unhappy one's thread **goes grey and stays**, visibly suppressing that spawn point. Alternate costume:
a paper airplane that flies off-screen and returns with a friend, or the dandelion-seed puff.

### Affiliate / Review-Site Pipeline
Enormous volume, $100–200 CPA, poor traffic quality (deal-seekers who churn). The affiliate's own
reputation becomes part of yours, and you need fraud detection or you'll pay commissions on
self-referred trash.

**The two things that make this channel genuinely dangerous:**
1. **Clawbacks.** Commission reverses on refund or early churn (a 45–90 day window). Managing the
   clawback is its own headache, and affiliates hate it — which means the affiliates you most want are
   the ones most likely to leave over it.
2. **Ranking is substantially purchasable.** Most "top 10 hosting" lists are affiliate-monetised. The
   game should let the player **buy placement** — it works, it is how the industry functions, and it
   belongs in the same moral neighbourhood as the Astroturf Temptation **without being as
   detonating**, because it is legal and ubiquitous. **A grey channel, not a black one**, which is a
   more interesting design space than either.
**See also:** The Affiliate Betrayal (§2.10).

### Review Aggregators
Placement costs money; ranking depends on reputation; **delisting is a threat.** A channel where a
third party holds your position and can revoke it.

### The Review Wall
**Visual:** near the front door, a wall of small star cards that flip in as reviews land — gold for
five stars, ash grey for one. **A physical readout of sentiment you walk past**, and a thing arriving
visitors glance at.

### The Deal-Forum Chute
Post a 70%-off offer on a low-end deal forum and receive a firehose.

**How it works:** Fills capacity instantly with your worst customers (LowEnd Larrys and Crypto Chads).
**Reputation-gated** — you can only use this lane if your reputation stat is above a threshold, which
is a nice inversion: the channel that damages you most also requires standing to access.

### Partner / Reseller / Agency Channel
Another company sends you customers for a revenue share.

**How it works:** Cheap growth, thin margins (20–40% share), and **you inherit *their* customers'
problems**. They own the customer relationship, so **churn is invisible to you until it happens.**
They're low-margin and they blame you for everything. A volume-vs-margin faction choice requiring a
partner portal, margin tiers, and occasional co-op marketing funds.

### Brokers (colo / wholesale)
You pay a broker 3–6% of first-year contract value; they bring you tenants you'd never meet. **Not
optional in real colo.** See also The Agent / Master Agency (§3.5), whose commission is a residual
rather than a one-off — the difference is the difference between a fee and a permanent leak.

### Registrar Cross-Sell
Sell domains at break-even; every domain customer is a hosting lead with near-zero CAC.

**How it works:** The classic hosting funnel. And **customers whose domain is at you churn far less** —
the cheapest retention glue in the business, disguised as a low-margin product.

### Community Presence / Open Source Karma
Sponsoring a project, running a meetup, being genuinely helpful on forums.

**How it works:** Cheap, slow, generates *developer* traffic which is high-value and high-expectation.
Contributing engineering time upstream gains reputation with the Researcher archetype, faster access
to patches, immunity to certain competitor attacks, and better hiring. **A long-horizon investment and
a separate unlock economy for *people* instead of things** — and it is **destroyed by one bad
incident**, which makes it the channel most tightly coupled to your ops quality.

### Dogfooding / Open Source Release
Release your tooling; gain engineer mindshare. Also a hiring channel and a credibility multiplier for
every other developer-facing channel.

### Content & Tooling Magnets
A free speed-test tool, free DNS, free status pages, a genuinely good blog.

**How it works:** Visitors come for the free thing and some convert. A permanent low-rate visitor tap
that costs upkeep forever and cannot be switched off without a reputation cost.

### The Community / Forum (your own)
Free support labour from users.

**How it works:** Reduces ticket load and increases retention, but is itself a target (spam,
defacement, drama) — **a defense that needs defending.**

### Sponsorships (streamers, podcasts, open-source projects)
The dominant channel for game hosting and developer-facing products. Lumpy, personality-driven, and
poachable: **a competitor can simply outbid you for your own channel.**

### Outbound Sales
A rep dialling.

**How it works:** Expensive per meeting, works only for enterprise and colo, and has a long lag
between spend and revenue — **a cash-flow trap for impatient players.** Required for the enterprise
and wholesale level types; useless below them.

### The Conference Booth
One-shot big spend, delayed lead burst. **Spend $40k, get 12 leads, 2 close in 9 months.**

**How it works:** A temporary deployable structure producing a burst of Enterprise Evaluators weeks
later, plus reputation among industry peers (which feeds the reseller lane). Sending a staff member
costs time and returns a random tech-tree node **biased toward what you're currently struggling
with**. And note the real cost: **your best staff are away from the NOC** during the event window.
**Visual:** place it and a cluster of prospect sprites gathers with speech-bubble icons; you "work the
booth" by clicking them, each converting into a lead-comet that travels to your sales desk.

### Migration Assistance / The Migration Concierge
Actively poach a competitor's customers — especially during *their* outage. **The single
highest-ROI real hosting tactic**, and the only directly *aggressive* business action in the game.

**How it works:** "We'll move you free" is a staff-time cost that converts competitor customers. A
reactive opportunity: when a rival goes down (a visible world event), you can spend to capture
refugees — which makes the outside world feel alive, and **angers the Competitor AI into
retaliating.** The escalated version pays their remaining term as well as moving them. You inherit
their mess (see Junkyard Inheritance) along with their revenue.
**Visual:** **Refugee Flows** — a temporary road opens from the rival's territory to yours. Being
*ready*, with migration tooling pre-built, is how you catch it; being unready means watching the road
close.

### The Competitor's Outage (a free lane that opens by itself)
**How it works:** A lane that appears spontaneously when a rival has a bad day. The player can invest
in **readiness** — extra capacity, a pre-written landing page, a support surge plan — to catch it.
Deliciously real, and the purest possible reward for having headroom.

### The Repatriation Wave
A recurring late-campaign demand event: companies moving workloads *back* from big cloud for cost
reasons.

**How it works:** They arrive technically sophisticated, with a spreadsheet, a dollar target, and an
architecture full of assumptions your platform doesn't satisfy. **Winning them requires a migration
*engineering* capability, not a sales one.** A great counterpoint to the Hyperscaler Free Tier threat.

### PR / Post-Mortem Publishing
Writing a genuinely good incident post-mortem opens a small, **high-quality** lane. **Transparency as
marketing** — and the mechanic behind "word of mouth from a well-handled outage," which is
counterintuitive and true: **a great incident response can *gain* you customers.** Let players earn
reputation from a disaster they handled honestly.

### Free Backups / Free SSL / Free Staging
Features that cost you upkeep but massively reduce churn. **Retention beats acquisition on cost** —
the cheapest growth in the game is the customer you already have.

### The Free Tier
A lane that costs **COGS instead of marketing budget**, converting at 1–3%.

**How it works:** Enormous top-of-funnel, immediately abused, and **requires abuse controls as a
prerequisite build.** Tunable on two axes: how generous, and how gated. Spawns Tire-Kickers whose
conversion chance is proportional to how fast you served them — **the argument for spending money on
people who aren't paying you yet.**

### Localization / Regional PoP
Reduces latency for a region → directly raises conversion there. **Ties expansion to revenue in a
legible way**, and it is the only acquisition build that is also a defense build.

### Marketplace Listing
Be on a big platform's marketplace.

**How it works:** Steady visitors, the platform takes 15–25%, and platform policy changes are a threat
you can't control. The extreme version — **a platform "recommended provider" slot** — is the single
best channel in hosting and the most fragile: they can remove you, and you have no appeal.

### The Listing (the generic case)
Appearing in a public directory: a game server browser, a hosting review site, a DNS anycast peering
list, a marketplace catalogue.

**How it works:** Instantly raises visitors **and makes you discoverable to attackers.** The purest
expression of the "more capability, more surface" rule.

### Niche Positioning / The Niche Play
"We only host WordPress agencies." "The Magento host." "The host for Laravel devs." "Church websites."

**How it works:** Narrows the funnel *and* massively raises conversion, ARPU, referral rate, price
tolerance, and defensibility against hyperscalers — while **lowering support cost, because a
homogeneous stack automates better.** Shifts your inbound visitor mix, your threat mix, and your
margins simultaneously. **Should be a genuinely winning strategy in this game, because it is in real
life** — and the segment-local referral rule (above) is the mechanism that makes it compound.

### Geographic Positioning
"Servers in Ohio, support in Ohio." **Being the *local* host is a real, durable advantage against
global commodity players** — and one of the few moats a small operator can actually dig.

### Peering at an IX
Cuts latency to local eyeballs *and* cuts transit cost. **A rare build that improves both the visitor
lane and the money lane.**

**How it works:** Every peer you add makes you faster for that network's users *for free* and reduces
transit cost. Peering is simultaneously a technical, economic and **social** action — model **peering
relationships as friendship stats** with other networks. At CDN/colo scale it becomes marketing:
being present at the right exchange literally attracts tenants who want to be near their peers
("**network gravity**"). And it creates a new ingress you must defend.

### IPv6 Support
Reaches visitor cohorts that IPv4-only misses; also relieves your IPv4 cost pressure. Cheap goodwill,
real benefit — ⚔️ **and see Happy Eyeballs failure (§3.4): publishing an AAAA can make a cohort
slower.** Both are true; neither cancels the other.

### Green / Renewable Power Certification
A reputation/marketing modifier tied to a real operational cost. Tied to PUE and power contracts; wins
a specific customer segment that will not consider you without it.

### Certifications as a Lead Magnet
SOC 2 / PCI / HIPAA / FedRAMP unlock whole **customer classes** that were previously invisible on your
funnel.

**How it works:** Passing an attestation doesn't generate leads; it ***unblocks* leads that were
already queued.** Visually: a gate opening with a backlog behind it. This is the correct model and it
makes the compliance investment feel like an unlock rather than a tax.

### Case Study with a Whale / The Anchor Tenant
Permission from a big logo multiplies inbound.

**How it works:** Landing one famous customer raises the conversion rate of **every future
Evaluator**. **A logo is a stat.** See also the Reference Ladder (§3.7) for the cost side.

### Promo Codes / Black Friday / Seasonal Promo
A temporary 5× lane multiplier at destroyed margins.

**How it works:** A burst of signups at terrible margin who churn at renewal — **a sugar rush with a
hangover**, and a renewal-cliff time bomb attached exactly 12 months later. Classic hosting trap,
perfect game mechanic.

### Acquisition (buy the lane)
**How it works:** You buy a competitor's customers outright. Instant customers, integration pain, and
an **attrition tax**: a predictable fraction leaves simply because ownership changed. The only channel
whose cost is capital rather than operating expense.

### The Price Tag (attraction by price)
Pricing is a literal, physical attraction lever — **always works, always the worst tool.**

**How it works:** A price cut raises spawn rate and lowers value per visitor, attracts the Hobbyist and
the Bandwidth Hog, and is **hard to reverse** (existing customers churn on increases). A ratchet the
player can trap themselves in.
**Visual:** raising the price makes the tag **heavier and visibly droopier**: fewer visitors approach,
but each one is worth more. The visitor stream visibly thins and enriches. **Instantaneous, wordless
economics.** ⚔️ **Palette note:** wave-1 drew the enriched visitors "gold-er"; gold is the money hue
and shouldn't live on a unit. Preferred: **the tag itself is gold (it's a price), and the visitors
gain ornament, not gold.** The tag's physical droop is the memorable part and should be exaggerated.

### The Front Door and The Sign
**Visual:** every level has a literal front door / storefront where new customers arrive, **and its
condition is your sales funnel** — a bright, clean, well-lit door with a good sign pulls more; a dark
door with a cracked sign pulls fewer. Your company **sign/marquee** is a customisable object (font,
glow, logo) that doubles as the visible unlock indicator for new business lines: take on game hosting
and a new neon sub-sign bolts on with an animation. **Your building's signage *is* your product
line-up.**

### The Front-Page Geyser
**Visual:** a viral hit (front page, tournament, launch) is a **vertical geyser of visitors erupting
from a single point** on the map edge, with a visible height curve that decays over minutes. **You can
see the peak coming down before the numbers say so** — which is exactly the information a capacity
decision needs.

### Attraction by hosting type
Each line has its own attraction stat, which means each line has its own mini-game.

**How it works:**
- **Web:** SEO + speed + the Page Speed Score.
- **Managed WP:** migration tooling and "we fix your plugins" as a product.
- **Game hosting:** server-browser listing quality, a free trial server, one-click modpacks, a
  **DDoS-protected badge** (the single biggest buying factor in that market), sponsoring a community,
  and **population seeding** — running your own popular server attracts customers.
- **Colo:** carrier density, tour quality, a good SLA, references, the PUE number, and **reputation
  among engineers** — colo is sold by word of mouth between sysadmins far more than by marketing, so
  model a slow, sticky, *engineer-reputation* stat separate from consumer reputation.
- **Wholesale:** power availability, fibre routes, tax abatement, water rights, and a site-selection
  team's spreadsheet.
- **CDN / DNS:** published global latency numbers and a status page with a long clean history.
- **Backup / DR:** a published, **verified** restore-time guarantee — **proof beats promises.**
- **GPU:** availability, honestly — in a shortage, having capacity is the entire sales strategy;
  **scarcity itself is the marketing.**
- **Email:** deliverability reputation, and nothing else matters.
- **VoIP:** published MOS and a channel-capacity guarantee.
- **Regulated:** certifications are the marketing; **the audit *is* the funnel.**
- **Bulletproof:** discretion, and an uptime record on takedown requests.
- **Early web / retro ISP:** web rings, link exchanges, a free CD in a magazine, and local newspaper
  ads.
- **Satellite / ground station:** published pass availability and antenna diversity.

---

## 3.7 Conversion, churn, and retention

### The Funnel Lane
Visitors visibly progress through segments of the path, and **the path *is* the funnel.**

**How it works:** Landing → Pricing → Cart → Payment → Provisioned → Onboarded → Renewed. You can
place a "tower" at each stage: a testimonial, a comparison table, a discount code, a 1-click
installer, a welcome email sequence. **Drop-off becomes spatially obvious.**
**Visual:** the funnel drawn as a literal narrowing chute — **with drop-through grates.** Each stage
has a grate in the floor beneath it, and visitors who drop out fall through *their stage's* grate, so
the drop-off distribution is visible as which grates are busy. **The funnel report becomes a thing you
watch instead of a chart you open.**

### Onboarding as a funnel with its own bounce rate
The highest-leverage place to spend in a real hosting company, and it deserves more than one line.

**How it works:** Extend the Onboarding Gauntlet into a real measured funnel: *account created →
payment verified → DNS pointed → data migrated → first successful use → first invoice paid*, each with
its own drop-off percentage and its own specific fix. A customer who stalls at "DNS pointed" needs a
completely different intervention from one who stalls at "payment verified."

### The Onboarding Gauntlet
New customers who don't get their site live within 7 days churn at ~5×.

**How it works:** **"Time to first success" is a defendable, upgradeable statistic** — migration tools,
1-click installers, an onboarding wizard, a welcome call for high-ARPU accounts. Directly reduces
30-day refunds.
**Visual:** **The Onboarding Ramp** — new customers arrive as a **pale outline and fill in with
colour** over their first days as they deploy. **A customer who never fills in is one who never
onboarded, and you can see that churn coming a week away.**

### The Grudge Meter
Each customer accumulates grudge from incidents; it decays slowly during good service. Above a
threshold they churn. **Churn should be a slow-filling, visible meter — a manageable pressure, not a
surprise.**

**How it works:** A customer tolerates one outage and remembers three; **three small outages hurt more
than one big honest one.** Visible as a colour on the customer's icon so the player can triage.
**Expansion — grudge must be reducible by *actions*, not only by time**, or it's a gauge rather than a
game:
- **A proactive apology** — costs a hand, works **once**.
- **A credit** — costs cash, works reliably, trains expectations slightly.
- **A personal call from the founder** — costs executive attention, very effective, **doesn't scale**,
  which is the Influencer lesson generalised.
- **Genuinely fixing the thing they complained about** — costs the most, and **reduces grudge across
  *all* customers with the same complaint.** That last option is the one that teaches root-cause
  thinking through the customer layer.
**Visual:** a mood **halo** (gold → orange → red) with a small floating "cancel" thought-bubble that
fills over time — **but the bubble should only appear above a threshold**, or a room with 400
customers is a room with 400 thought bubbles. Below the threshold, the halo alone carries it. **You
can see churn coming and go intervene.**

### Health Scoring / Churn Radar
A buildable that turns invisible churn risk into a **visible aura** around at-risk customers.

**How it works:** Derives risk from usage trend, ticket sentiment, login frequency, payment history
and incident exposure. Massive quality-of-life and deeply real — **and it is the prerequisite for
retention offers being usable at all**, because you can only save a customer whose churn signal you
detected in time.

### Save Offers (and the ladder that makes them a real calculation)
When a customer signals churn, you can spend to save them. Cheaper than acquiring new ones — teaches
the CAC/LTV lesson without a spreadsheet.

**How it works:** On the cancellation form: offer two months free, a downgrade, or a pause. Each saves
a % of cancellations at a margin cost.
**The preference order a good retention desk uses, because it is non-obvious and teachable:**
**pause > downgrade > add value > term extension at current price > months free > permanent
discount.** Pause and downgrade preserve the price point; months free are a one-time cost; a permanent
discount reduces that customer's LTV forever **and becomes the anchor for their next renewal
conversation.** **The worst save offer is the one that feels cheapest.**
⚠️ **Balance fix — as written, saving is unboundedly better than losing, so the optimal play is always
to save.** Make the spiral numeric: each save permanently reduces that customer's ARPU by the discount
**and raises a hidden `expectation` stat**, so the next save costs more; after two saves, the third is
refused. And **a saved customer's referral value drops to zero** — they're staying for the price, not
the love. Now saving is a calculation.

### The Exit Survey / Exit Interview
Churned customers tell you *why*. **Turns failure into information.**

**How it works:** Feeds a visible diagnostic panel with a churn-reason breakdown that **literally
tells you which tower to build next.** Free — it requires only that you built the form. The richer
version ("a customer success function") buys you the qualitative half.

### The Win-Loss Review (the acquisition half of the exit survey)
The design has the churn half and not the deal half.

**How it works:** A purchasable action after any **lost deal**: spend a hand to find out why. Answers
form a real distribution — price, a missing feature, a failed security review, a bad reference, a slow
response, or "we went with the incumbent." Accumulating them produces a **loss-reason chart that tells
you what to build**, exactly as the Exit Survey does for churn.

### The Churn Taxonomy (five kinds, tracked separately)
The difference between "churn is 4%" and "churn is 4% and **1.6% of it is unfixable**" — which changes
every retention decision a player makes.

**How it works:** Five kinds on the HUD, each with a different counter and a different cost:
1. **Voluntary–dissatisfied** — they left because you were bad. Counter: be less bad.
2. **Voluntary–outgrown** — they got too big or too small for your product. Counter: a product ladder.
3. **Involuntary** — payment failure. Counter: dunning.
4. **Mortality** — the customer's business closed. **Counter: none. It is a floor, and it should be
   visible so the player stops trying to fix it** (~1%/mo for SMB).
5. **Displacement** — acquired, merged, or mandated elsewhere by a new CTO. Counter: multi-thread the
   relationship so you're not dependent on one champion.

**Other named triggers worth surfacing as their own counters:** outage churn (cumulative trust
threshold), **performance churn** (slow but not down — *the silent killer*, nobody files a ticket, they
just leave), renewal-price churn (the term-shock cliff), support-experience churn (the ticket
unanswered for three days churns the account two months later), competitive churn (a rival offered
free migration), contract-end churn (invisible for 35 months, then one decision point),
migration-attrition churn (you moved them and something broke), and **trust churn after a breach** —
a 3–6 month tail, **worst in months 2–4 when the news matures.**

### Silent Churn (the client who stops growing)
**How it works:** A client doesn't leave; they stop *expanding*. Revenue flatlines. Detected only with
a usage-trend report (a buildable). The most valuable churn to catch and the least visible — and the
reason Negative Churn (below) needs its own instrument.

### Involuntary Churn / Dunning
Their card expires.

**How it works:** Costs you real money for no reason at all, is fixable with a **dunning-process
upgrade** (retry schedules, pre-expiry notices, card-updater services, a grace period), and is exactly
the kind of unglamorous problem that makes players feel like they're running a business.

### Contagious Churn / The Word of Mouth Graph
Customers are connected; a churning customer damages the retention of its neighbours.

**How it works:** A churned client posts publicly and nearby clients **in the same segment** get a
churn-probability bump. Community-driven hosting types (game, dev, forum, niche verticals) have a
**high contagion multiplier**; anonymous shared hosting has almost none. Makes clusters of loss feel
like cascades, and makes reputation feel networked rather than scalar.

### Contract Lock-in
Annual and multi-year contracts reduce churn but **change the shape of anger.**

**How it works:** Angry customers stay and become *loud* instead of leaving quietly — more reputation
damage, not less. The one retention tool whose downside is measured in public sentiment.

### The Contract Term Ladder
Length as a lever with three simultaneous effects.

**How it works:** Monthly / annual / multi-year each change **cash timing**, **churn rate**, and **your
flexibility to raise prices.** A three-year fixed-price contract during a power-cost spike is a loss
you signed up for. Give each term an explicit modifier set so the choice is legible rather than
intuitive. The colo standard — **5 years with a 3%/yr escalator** — locks revenue but leaves you stuck
if the market reprices upward.

### NPS Ticker
A passive score from surveys.

**How it works:** Promoters spawn word-of-mouth visitors; detractors spawn reputation-threat units.
**Makes CSAT a production building, not a vanity metric.** ⚔️ A funny, true wrinkle: **surveying
occasionally makes things worse** by reminding an unhappy customer that they're unhappy. Sampling rate
is therefore a dial with two curves.

### The Renewal Wave and the Renewal Calendar
**The business layer's signature recurring event, and its equivalent of the wave telegraph.**

**How it works:** Every 12 months (or at contract end), the cohort you signed comes back up for
renewal all at once. Renewal is where **everything you did for twelve months gets priced**: the
outages, the price increase, the support quality, the competitor's campaign timed to your cohort, and
the discount they'll ask for. Customers cluster by acquisition cohort, so a big promo creates a big
cliff exactly one year later.
**Make it an object:** a permanent **Renewal Calendar** HUD element alongside the wave timeline, so
the player sees *"47 accounts, $12,400 MRR, renewing in 3 weeks"* and can act. **It makes retention
proactive instead of reactive.**

### Win-Back Campaigns
Churned customers are a cheap lead list.

**How it works:** Emailing them costs little and converts a few percent — **unless they left angry, in
which case you generate reputation damage.** Requires having actually fixed the reason they left,
which the Exit Survey told you.

### Annual Prepay Push
Two months free for annual.

**How it works:** Instantly improves cash and retention, instantly creates a **deferred-revenue
liability**, lowers total revenue, and **makes your MRR chart lie to you.** A genuine three-way
tradeoff.
**Add the failure mode:** it also **delays your churn signal by up to a year**, so a company running
hard on annual prepay can be losing customers for three quarters and not know. The instrument that
catches it is **renewal-rate-by-cohort**, not monthly churn — which gives the Cohort View a second
specific job.

### Data Gravity as a retention mechanic
The more data a customer stores with you, the more it costs them to leave. **Churn resistance that
grows automatically with usage** — the single best MRR quality in the game, and it should be visibly
tracked.
**Hosting types:** backup, object storage, DBaaS, archival, observability.

**The dark twin: data gravity is retention until the day it's resentment.** Model a per-customer
**Lock-In Awareness** stat that rises as their stored data grows and as they encounter egress pricing.
Below a threshold it is pure retention; above it, the customer begins architecting *away* from you,
quietly, over months, and when they finally leave they leave **loudly and write about it.** Making the
retention mechanic carry a **delayed reputational charge** is both true and exactly the P10 pattern.
**And the counter-trend:** egress fees and lock-in are under regulatory and competitive pressure (the
"free egress on exit" movement), so the *sustainability* of gravity-as-a-moat is itself a strategic
bet. A host that builds its retention on gravity and then has to waive egress is exposed.

### Domain stickiness
Owning the customer's domain makes them roughly 3× less likely to leave. **A strategically underpriced
product whose real value is retention glue**, not margin.

### Proactive Notification
Telling customers about an incident *before* they notice reduces both churn and ticket volume.

**How it works:** Costs nothing but the status-page buildable and the discipline to use it. One of the
very few strictly-positive actions in the game — which is why its cost should be attention, not money.

### QBR (Quarterly Business Review)
Spend account-manager time on a big customer.

**How it works:** Reduces churn and **surfaces expansion opportunities.** A literal "go visit your
whale" action with a cooldown, and the mechanic that makes account management a headcount decision.

### The Expansion Trigger Library
The Upsell Moment, enumerated — because "when a client is happy and near a ceiling" is too vague to
play.

**How it works:** Each is a detectable game-state condition that fires a gold pip: crossing 80% of a
resource limit; a second site added; a team member invited; a compliance question asked in a ticket; a
traffic spike survived; **an outage handled well** (customers genuinely buy more after a well-handled
incident — counterintuitive and real); a renewal date approaching; a competitor's price increase.

### The Upsell Ladder and Cross-Sell
**Expansion revenue is the cheapest revenue in hosting** and the game should teach that explicitly.

**How it works — the ladder:** backups → SSL → dedicated IP → managed support → DDoS protection → a
bigger plan. Each upsell is a small revenue bump at near-zero CAC.
**How it works — the cross-line ladder (The Ladder of Graduation):** the shared-hosting customer who
outgrows the box becomes your VPS customer becomes your dedicated customer becomes your colo tenant.
**Keeping a customer across four product tiers over ten years should be the highest-scoring outcome in
the game** — an explicit, celebrated mechanic rather than an emergent accident.

### Negative Churn as a Win Condition
Growth without selling — the most important metric in subscription businesses, and it should be a
**goal**, not a readout.

**How it works:** When expansion revenue from existing customers exceeds lost revenue from churned
ones, net revenue retention exceeds 100% and **the business grows while acquiring nothing.** Make it
an explicit, celebrated, *hard* milestone with a permanent effect — investors and lenders treat you
differently once you've held it for a year.

### The Reference Ladder
Turning customers into a sales asset, with a cost.

**How it works:** Customers can be asked to be a **logo → a quote → a case study → a reference call →
a conference speaker**, escalating in value to you and in cost to them. **Asking too often burns
goodwill; never asking leaves your best asset on the shelf.** Each rung requires a *satisfaction
threshold* and a *tenure threshold*, so the ladder is gated by actual operational quality.

### Free Migration Service (as a retention *and* acquisition tool)
The single highest-leverage offer in hosting. Costs staff hours; converts customers who otherwise
would never move. Also the counter to a competitor running it against you.

### Fire the Customer
Proactively terminate a negative-margin or abuse-generating account. A small immediate hit, a
long-term gain — and see §3.9 for the third, quieter option nobody talks about.

### The Churn Walk (presentation)
Churn should take long enough to hurt and be **reversible until the truck leaves.**

**Visual:** a leaving client packs visible boxes, their racks/instances grey out one by one, and their
logo peels off the door. This gives the player a visible window to intervene — a support rep sprinting
over with a discount glyph. If they leave angry, they stop at the door to **spray-paint a 1-star on
your window**, which other passing visitors then see.
**Expansion:** the paint is **removable at a cost** (a staff hand plus time — the reputation-repair
action), and multiple 1-stars **accumulate on the same window, progressively obscuring it** — at which
point arriving visitors can't see in and bounce at the Doorstep. **A reputation mechanic that becomes a
literal occlusion is unusually good design.**
**Also:** their traffic lane doesn't stop instantly — **it thins over several seconds like a tap
closing** (the Churn Ledger Draft). The gradual fade is more legible, and sadder, than a hard stop.

### Cohorts as pattern (not colour)
Customers acquired via each channel are visually tagged, so you can watch a channel's population drain.

**How it works:** When the affiliate cohort churns en masse you can *see* it leave the building.
⚔️ **Encoding tension:** wave-1 assigned paid = orange, organic = green, referral = blue, affiliate =
purple — four hues that all already mean something else in the palette ledger. Preferred resolution:
**cohorts are a fill pattern on the visitor's livery band** — solid (organic), diagonal hatch (paid),
dotted (referral), cross-hatch (affiliate). Pattern survives the colour-blind pass and greyscale and
leaves the hue budget alone. **Keep the idea, make it pattern draining rather than hue draining.** The
Cohort Wall uses the same four patterns so the wall and the world agree.

### Satisfaction as posture
Universal across businesses and hosting types.

**How it works:** Happy clients stand tall and glow faintly; unhappy ones slouch, dim, and emit
ticket-paper. **Posture reads at 12px; numbers don't.** Extend the same grammar to **staff** — a room
where both the customers and the staff are slouching needs no HUD at all.

### Customers sit down in your building
The most satisfying growth visualisation available.

**How it works:** Converted customers walk inside and take a desk; **your office visibly fills up as
MRR grows.** Whales are physically bigger — an enterprise client takes four desks and has a briefcase,
and when she's unhappy the whole room dims a little.
**The inverse and the scaling rule:** churning customers **stand up and leave** on the Churn Walk, and
a mass-churn cascade renders as a room emptying. Specify the seat budget — one visible desk per $X
MRR, whales at four desks — and beyond ~60 desks the room switches to a **mezzanine of floors** rather
than an infinite open plan.

### The Logo Wall
**Visual:** marquee customers get their logo mounted in your lobby. The wall filling up is a long-arc
progress display. **Losing a logo customer leaves a visible clean rectangle where the sign used to
be** — a brutal, silent, perfect churn signal.

### The SLA Credit Coin
**Visual:** when you miss an SLA, a gold coin flies *out* of your revenue gutter and back to the
customer's card. **Money moving backward is always drawn as reverse motion**, so a bad month is
visible as coins swimming upstream.

### Reputation Weather
**Visual:** your overall reputation is **the sky above your facility** — clear blue, overcast, smog,
storm. Always in frame from Tier 2, needs no legend, and it affects the **colour temperature of the
whole scene**, so a bad reputation literally makes your company look worse.

---

## 3.8 Segmentation and positioning

### The Positioning Dial
A top-level strategic choice with cascading effects. **It sets which visitor archetypes even *appear*
on your map.**

**How it works:** Five settings — *Cheapest / Fastest / Most Supported / Most Compliant / Most Niche*
— each carrying a full consequence set: inbound archetype mix, threat-mix shift, support cost per
account, price tolerance, churn baseline, and **which lines of business it makes harder.**

- **Cheapest** — volume + abuse; support cost 3×; price tolerance nil; churn 2×. Floods you with
  LowEnd Larrys and Crypto Chads. **Locks enterprise and regulated lines.**
- **Fastest** — attracts performance-sensitive segments; imposes a permanent infrastructure cost
  floor; high review sensitivity. Pairs naturally with game hosting and CDN.
- **Most Supported** — highest margin per account, best referral rate, **headcount-bound growth**;
  fails at scale unless you automate.
- **Most Compliant** — slowest sales, highest ARPU, near-zero churn, enormous fixed cost. A trickle of
  whales and a mountain of paperwork. **Locks bulletproof forever.**
- **Most Niche** — smallest addressable market, best conversion, best defensibility, **catastrophic if
  the niche moves.**

**The dial should be *changeable*, at a real cost**, because repositioning is a real and painful thing
companies do — and a one-time irreversible choice is a weaker game than a decision you can regret and
undo expensively.

### Vertical Compliance Moat
Certifications gate entire customer classes.

**How it works:** Huge capex/opex, but the customers inside the moat almost never churn and **don't
shop on price.** The clearest example in the game of spending money to change *who you compete
against* rather than *how well you compete.*

### Revenue diversification as an explicit goal
The counterweight to the Whale.

**How it works:** A HUD **Concentration Warning** when >30% of MRR comes from one client, one channel,
or one line of business, plus an explicit Diversification objective unlocked the first time you lose a
whale. **The game tells you you're fragile before it kills you** — fair warning, not a gotcha.

### Customer-mix correlation as a strategy
The account-level version of the line-of-business synergy idea.

**How it works:** Each client card carries a **correlation profile**: does their peak coincide with
everyone else's? **Twenty e-commerce tenants all peak at the same hour and your capacity must cover
the sum of peaks, not the peak of the sum.** **Deliberately signing anti-correlated customers is a
strategy** — a backup customer whose window is 2am is worth materially more than the same revenue from
a retailer whose peak is your peak.

### The Niche compounds, the generalist doesn't
**How it works:** Because referral is **segment-local** (§3.6), a niche player's word-of-mouth lane
grows densely inside a small market while a generalist's referrals scatter and evaporate. This is the
mechanism that makes the Niche Play a genuinely winning strategy rather than a stated preference, and
it should be **discoverable from the cohort view** rather than explained in a tooltip.

### Declining demand as positioning
See §3.1's "we're full" sign. **Turning people away moves you sideways on the reputation axis rather
than down**: you lose "available" and gain "exclusive," and some archetypes actively prefer a provider
with a waiting list. A positioning move disguised as a capacity control.

### The Controlled Shrink (positioning by subtraction)
Deliberately closing a product line, a region, or a customer segment. **Should be a *winning* move
sometimes** — and the game should score it as strategy, not retreat.

---

## 3.9 The client (tenant) system

*From Tier 3 onward you don't get visitors directly — **your clients do**, and their traffic flows
through your infrastructure.*

### Clients are Spawners
Each client is a little visitor factory with its own profile.

**How it works:** Signing a client is signing up for their traffic *and* their enemies. Each client
also generates its own tickets, its own abuse risk, and its own growth curve. At Tier 3+ visitors
spawn **from the customer card**, in that customer's colour/pattern, so you can see whose traffic is
hurting you, live (see The Cohort as a unit, §3.1).

**And the thing the spawner model was missing: correlation.** At multi-tenant scale the interesting
property isn't each client's volume, it's whether their peaks coincide. A **correlation profile** on
every card turns customer selection into a portfolio decision.

### Client Cards (the game's best recurring choice)
Every client shows: MRR, resource appetite, traffic profile, threat attraction, support burden, and
churn risk. **Accepting a client is a drafting decision.**

**How it works:** The "Crypto Exchange" pays 5× but attracts constant DDoS and legal attention; the
"Local Bakery" pays nothing and never causes problems. **Per type, the same UI reads radically
differently:** a game-hosting client shows peak concurrency and drama risk; a colo tenant shows
contracted amps, cabinet count, and lease length; a GPU client shows job length and interruption
tolerance; an email client shows send volume and list hygiene; a backup client shows stored TB and
growth rate.

**Make it a real drafting game:** **offer three, take one, and make the hand occasionally bad.** A
round where all three options are unattractive — a miner, a whale who'd concentrate you, and a
customer you can't technically serve — is the most interesting round in a drafting game. Add a
**pass** option that costs nothing but leaves your capacity idle, **so the player learns that saying
no is a move.**

**The commercial fields the card also needs** (because the technical stats alone don't tell you if
it's good business):
- **Term & end date** — month-to-month vs 36-month is the difference between an asset and a rumour.
- **Escalator** — does the price rise 3%/yr automatically, or did you sign it flat forever?
- **Commit / take-or-pay** — how much they pay regardless of usage.
- **Ramp schedule** — when does the revenue actually start?
- **Payment terms & method** — card / ACH / wire / net-60. Card revenue costs 3% and can be charged
  back.
- **Credit limit and deposit held.**
- **Change-of-control clause** — can they refuse to come with an acquisition?
- **MFN / audit right / unusual clauses** — flagged in red.
- **Source & commission** — direct / affiliate / agent / partner, with the permanent margin haircut
  shown.
- **Cost-to-serve, actual** — tickets × minutes, running.
- **Contribution margin** — **the only number that matters, and the one nobody computes.**

**And three operational stats an operator would immediately want:**
- **Sophistication** — how good is this customer at diagnosing their own problems? A sophisticated
  customer files fewer, better tickets and catches your problems early; an unsophisticated one files
  more, vaguer tickets and blames you for their own code. Orthogonal to revenue, and **the single best
  predictor of cost-to-serve.**
- **Change rate** — how often do they touch their own environment? A static customer is nearly free; a
  customer deploying twelve times a day generates incidents.
- **Correlation** — does their peak coincide with your existing peaks?

**Visual:** a **Customer Portrait** top-left (see §3.12), then six stat rows as **micro-bars, not
numbers** — MRR, appetite, traffic, threat attraction, support burden, churn risk — each drawn with a
**hairline / normal / heavy stroke indicating how confident you are in that estimate.** The Client
Interview upgrade converts hairline rows to heavy ones, **which makes buying information visibly worth
it.** The card lives in a physical card file on the HUD's right edge, showing the client's
auto-generated logo, their MRR, their SLA tier as a coloured stripe, and their health as an edge glow.
**Churn = the card curling and burning at one corner. Renewal = the card getting a fresh date stamp
with a nice thunk.** A whale's card is a *different size* from everyone else's and doesn't fit the
tray.

### The Client Interview
Before signing, spend a small amount to reveal hidden card stats.

**How it works:** **Information as a purchasable good.** Skipping it is a gamble that occasionally
lands you the Squatter, the Miner, or the Column-Fodder Prospect. Visually it converts hairline
confidence strokes into heavy ones, so the value of the purchase is on the card itself.

### The Qualification Step (the pre-sale version)
**How it works:** A small spend that reveals whether a *prospect* is real: do they have a budget, a
timeline, and access to the technical buyer? The only counter to the Column-Fodder Prospect, and the
mechanic that turns pre-sales engineering hours into a managed resource rather than a leak.

### SLA Contracts (per client) — and the Contract Clause Library
Higher MRR in exchange for penalty clauses. **Gambling on your own reliability**, and beautifully
self-balancing: confident players take SLAs and are punished for overconfidence.

**Expansion — a single toggle undersells the richest business subsystem available.** At minimum the
clause set should include:
- **Credit cap** — how much you can lose in a month (usually a % of MRC, and usually far less than the
  customer's actual loss).
- **Claim window** — they must claim within N days, and most never do, which is quietly why SLAs are
  cheaper than they look.
- **Maintenance exclusion** — scheduled windows don't count, which makes your maintenance calendar a
  contractual instrument.
- **The three-breaches-and-they-can-exit termination right** — **where the real risk lives.** Not the
  credits: the exit.
- **Escalator, commit, MFN, audit rights** — each a small permanent obligation.

### The Upsell Moment
When a client is happy AND near a resource ceiling, an upsell prompt appears.

**How it works:** Catching these is a skill-based income stream that rewards watching your board. See
the Expansion Trigger Library (§3.7) for the full list of firing conditions.
**Visual:** small gold pips popping over a client's head as a purchasable bubble you click — an
"upsell whack-a-mole" micro-interaction that's fun for 30 seconds a level and should not outstay that.

### Noisy Tenant Isolation
Choose cheap shared tenancy (higher margin, tenants interfere) or expensive isolation (lower margin,
contained blast radius).

**How it works:** A core architecture-level bet, revisited at every tier — and the bimodal customer
(§3.5) is the case that forces it, because isolating one customer *from themselves* is the same build.

### The Sacrifice Decision
Under extreme load you may **deliberately drop a client's traffic** to save the rest. **Every good
strategy game needs a "cut off your arm" button.**

**How it works:** Instant MRR loss and a reputation hit, but it prevents a cascade.
**Expansion — promote it from a button to a policy.** The pre-configured **Shed Ladder** (§3.1) plus a
**live override**: making the sacrifice choice *during* a crisis with no preparation is pure panic;
making it in peacetime as a policy and then watching it execute is **tragedy**, which is much better.
Every override you are forced into is a candidate for a new policy rung afterwards.
**Visual:** it should feel heavy — a **one-way-door ratchet** and a drag-to-confirm slider, the
customer's portrait shown at full size, their tenure and lifetime revenue printed, and afterwards
their portrait goes straight to the Wall of Ghosts with the reason line pre-filled as `dropped to save
the floor`. **The game should write it down in your handwriting.**
⚔️ **Tension:** protect the whales (good for revenue, terrible for the review sites) vs protect
everyone equally (fair, and you might lose the whale). Both are supported; neither is correct.

### Client Growth
Successful clients grow, consuming more resources. **Your best customer eventually becomes your
biggest capacity problem. Success is the threat.**

**Give it a rate so it's plannable:** successful clients grow **3–8% per in-game month, compounding**,
with occasional step changes (a launch, a funding round, a seasonal spike). Surface it as a
**projected-growth band on the client card** so the player can see the collision coming two months out
— a postcard from the future, applied where it matters most.

**And add the pricing consequence, which is the real lesson:** whether their growth produces revenue
depends **entirely on how you priced them.** Flat-rate growth is pure cost. Usage-based growth is pure
upside. Tiered growth generates an upsell conversation at each threshold. **The pricing model you
chose two levels ago determines whether success is a windfall or a wound.**

### The Reseller (client card)
One card that is secretly fifty clients, with all the support burden hidden behind them — and all the
abuse risk inherited. Their portrait contains smaller portraits. **If they vanish, you inherit their
angry customers** with no relationship, no contact details, and no context.

### Whale Management (four concrete verbs)
The design warned about concentration three separate times and never said what to *do* about it. Four
verbs make it a system:
1. **Multi-thread the relationship** — build relationships with three people at the account, not one.
   Costs account-management hands; protects against the champion leaving.
2. **Structure the contract** — a longer term with a ramp and a notice period, bought with a discount.
   **Converts a cliff into a slope.**
3. **Dilute** — deliberately pursue lower-value volume to reduce the percentage. Costs margin.
4. **Cap** — **decline expansion revenue from the whale.** The most counterintuitive correct move in
   the game, and it should be available and painful.

### Firing a customer
Identifying, offboarding gracefully, and absorbing the reputation hit.

**How it works:** Unlocked by cost-to-serve analytics. **Should absolutely be a legal,
sometimes-correct move in this game** — and should feel awful.

### Repricing them so they fire themselves (the third option)
The middle path between Sacrifice and Firing, and **how real operators handle 90% of "this customer is
a problem."**

**How it works:** Reprice them at renewal. It's slower, it's bloodless, it generates no review, and it
either fixes the economics or removes the customer. Worth stating explicitly because the other two
options are both dramatic and **the realistic one is quiet.**

### The Deposit and the Credit Limit
A whole missing verb: deciding how much risk to extend a customer.

**How it works:** Set per-customer credit limits and auto-suspend thresholds; require deposits from
high-risk segments (1–2 months MRC, refundable). **Deposits are cash you hold and must give back, so
they are a liability that *looks* like cash.** Requiring one loses ~15% of deals and eliminates most
bad debt — a clean, legible trade the player makes per segment rather than globally.

### The Controlled Shrink
Deliberately closing a product line, a region, or a customer segment. Should be a *winning* move
sometimes, and the game should have a scoring path that rewards it.

---

## 3.10 Support and tickets as a visitor-facing system

*Support is the only place where a visitor and a staff member are on the board at the same time. It
deserves its own subsection because it is simultaneously a cost centre, a conversion tower, a
retention tower, and an attack surface on the player's attention.*

### The attention budget
The resource support spends is not money, it is **hands**.

**How it works:** Every Support Seeker, every ticket, every locked-out customer, every angry whale
consumes a staff hand for a duration. Hands are the scarcest resource in the game and the only one
that cannot be bought instantly. **A visitor that attacks your attention budget is a genuinely
different threat type** from one that attacks your capacity, and the two must be balanced separately.

### First response time as a conversion stat
**How it works:** A pre-sales chat that answers in 30 seconds converts at ~3×. A post-sale ticket
answered in 30 minutes prevents a churn event two months later. **The same staff hand is both a sales
tower and a retention tower depending on who walks up to it**, which makes staffing a genuine
allocation puzzle rather than a headcount slider.

### Support-experience churn (the delayed fuse)
**How it works:** The ticket that wasn't answered for three days churns the account **two months
later**, with no visible connection between cause and effect unless the player built the analytics to
link them. One of the game's best arguments for instrumentation.

### Tier-1 deflection and the self-service tower
**How it works:** A knowledge base, a status page, a self-service rescue mode, a good control panel,
and a community forum each deflect a percentage of tickets before a human touches them. **Deflection
is the only way support scales**, and every deflection tower has a failure mode (a stale KB article
actively makes things worse).

### The escalation path
**How it works:** Tier 1 → Tier 2 → engineering. Each escalation costs more expensive time and takes
the engineer off whatever they were building. **A ticket that reaches engineering costs you a
buildable's worth of progress**, which is the cleanest way to make support load feel like an
opportunity cost rather than a tax.

### The ticket avalanche
**How it works:** An incident generates tickets at a rate proportional to affected customers × their
sophistication (inverted) × how much warning you gave them. **Proactive notification and a subscribed
status page are the only things that cut the slope.** An avalanche is an attack on your hands, and it
arrives exactly when your hands are already busy fixing the incident — the classic double-bind.

### The Concierge (support made visible)
**Visual:** support staff sprites **physically intercept unhappy visitors** before they reach the
exit, walk them back in, and restore some patience/saturation. **You can watch a great support rep
*save* a customer in real time** — which makes an abstract retention statistic into a thing you root
for.

### The Ticket Paper Grammar
Support is one of the game's main pressure systems and it should be readable from across the room.

**Visual:** tickets are physical slips with encoded stock — **colour = sentiment** (cream neutral, pink
angry, blue enterprise), **size = customer value**, **corner fold = age**, **a red stamp = SLA
breached**, **a paperclip = attached to a parent incident**. In the tray they stack; in an avalanche
they rain; when Tier-1 deflects one it goes into a recycling bin with a satisfying whoosh; when one is
escalated **a support sprite physically carries it across the office** to an engineer's desk. **You can
read the whole support situation without a single number.**

### The customer who files better tickets than your staff
See §3.2's "Customer Who Monitors You Better Than You Do." Mechanically: a **Sophistication** stat on
the client card that lowers cost-to-serve and occasionally hands you a free incident detection.
**Turning a complainer into a sensor** is a support verb, not a PR one.

### The self-inflicted ticket class
The locked-out customer, the customer who deleted their own sudo user, the customer whose cron ate
their disk. **Only solvable if you built console/IPMI access** — which means the out-of-band purchase
pays for itself in support-minutes long before it pays for itself in outages. Automating it into a
self-service rescue mode is a classic support-cost-reduction tower.

---

## 3.11 The sales pipeline and the deal

*Everything between "a prospect exists" and "money arrives." The half of the business the visitor
model doesn't reach, and the half that decides whether enterprise, colo, wholesale and regulated
levels are playable at all.*

### The lead decay timer
**How it works:** Every lead carries a literal, visible countdown. A lead contacted in 5 minutes
converts many times better than one contacted in 24 hours. The timer makes sales staffing an
*urgency* problem rather than a capacity problem, and it is the reason a pre-sales chat tower is worth
more than its headcount suggests.

### The Sales Pipeline Rail
**Visual:** prospects ride a visible rail on the HUD from **lead → qualified → quote → signed**, each
stage a station. You watch deals move. **A stalled deal sits at a station and starts to dim.** It's a
Kanban board that lives in the world rather than in a menu — and the dimming is the "this deal is
dying" signal that a list view would never give you.

### The RFP Fax
**Visual:** enterprise leads arrive as **a fax printing out in real time, line by line** — a fantastic
four-second attention grab and a period-appropriate joke in the older eras. The same asset works as a
tender notification, a procurement portal alert, or an email in later eras.

### Qualification (and the cost of skipping it)
**How it works:** A small spend that reveals budget, timeline, and access to the technical buyer. The
counter to the Column-Fodder Prospect and the only way pre-sales engineering hours stop leaking.
**Skipping qualification is fast and occasionally correct**, which is what makes it a decision.

### The security questionnaire as a gate
**How it works:** A 340-row spreadsheet with a 10-day deadline, answerable only to the extent you
actually built things. **Answering honestly loses some deals; answering aspirationally wins the deal
and creates a future obligation with a date attached.** The most direct bridge in the game between §4
buildables and §6 revenue: **your architecture is literally the sales document.**

### Compliance attestation as a gate-opener
**How it works:** Passing SOC 2 / PCI / HIPAA / FedRAMP doesn't generate leads — **it unblocks leads
that were already queued.** Visually, a gate opening with a backlog behind it. This makes the
compliance spend feel like an unlock rather than a tax, and it makes the *timing* of the attestation a
real strategic decision.

### The Procurement Portal (the delay nobody expects)
A non-human gatekeeper between you and a signed deal.

**How it works:** Before the enterprise customer can pay you, you must be onboarded as a supplier:
W-9/tax forms, insurance certificates at specified coverage levels, a supplier-diversity
questionnaire, banking verification (with a callback to prevent fraud), a code-of-conduct attestation,
and a portal account. **This takes 30–60 days *after* the deal closes and before the first invoice can
even be submitted.** Modelled as a delay between "won" and "paid" that surprises every first-time
enterprise seller — and a cash-flow trap for a player who spent against the win.

### Channel Conflict and Deal Registration
Your own sales channels fighting each other. Real, unglamorous, and a great late-game business puzzle.

**How it works:** Once you have direct sales, resellers and affiliates, they will all reach the same
prospect. The reseller demands protection; the affiliate claims the referral; direct sales undercuts
both. You need a **deal-registration policy** — a buildable that costs margin and flexibility and
prevents the channel quietly abandoning you.

### The residual commission leak
**How it works:** An agent-sourced deal pays 10–20% of MRC **forever, including renewals**. The client
card must show source and commission, and **agent revenue should visibly be a different colour of
money**, because the contribution margin on an agent deal is permanently different from a direct one.

### The broker's cut
3–6% of first-year contract value, one-off, for tenants you'd never have met. **Not optional in real
colo** — the player should discover that the "expensive" channel is the only channel that reaches a
whole class of deal.

### The buy-out play
**How it works:** Offer to pay a prospect's early-termination fee with their incumbent. Converts an
Incumbent-Locked Lead **now**, at a known cash cost. **The highest-leverage competitive tactic in the
industry**, and a clean cash-for-revenue conversion the player can price out.

### The credit decision
**How it works:** Before you sign, decide how much risk to extend: prepayment, a personal guarantee, a
deposit, a credit limit with auto-suspend, or nothing. Requiring a deposit loses ~15% of deals and
eliminates most bad debt. **No hosting game has modelled this and every real host makes the call
weekly.**

### The ramp and the commit
**How it works:** A signed contract is not revenue yet. A **ramp schedule** says when the money starts;
a **commit / take-or-pay** says what they pay regardless of usage. Two fields that turn "we won an
$8k/mo deal" into a question — *starting when, and floored at what?* — which is exactly the question a
CFO asks and a player never thinks to.

### The win-loss loop
Every lost deal is data. See §3.7's Win-Loss Review: a purchasable post-mortem per loss, accumulating
into a **loss-reason chart that tells you what to build.**

---

## 3.12 The visual grammar of visitors, clients, and the front of house

*The rendering rules that make everything above readable. Collected here so the art direction is one
consistent system rather than thirty scattered notes.*

### Visitors Are Light; Threats Are Mass
The hard rule underneath everything.

**How it looks:** Everything good that approaches you is **luminous, cool-coloured, weightless, and
moves in smooth arcs.** Everything bad is **opaque, warm, heavy, and moves in straight lines or
jitters.** A player should be able to mute the colour channel entirely and still tell them apart by
*motion quality* alone.

### The Costume Kit (the spec behind "one shape, many costumes")
Five slots, ~6 options each, and the entire population — thirty-plus archetypes across twenty-five
hosting lines — is authored.

**How it looks:** **Hull** (the shape token, which encodes *duration class* only: circle = instant,
teardrop = session, square = batch/job, hexagon = resident) · **Livery** (a two-tone paint encoding
the hosting line) · **Prop** (one silhouette-breaking attachment encoding the archetype — a shopping
bag, a clipboard, a camera flash, a helmet, a briefcase, a crate) · **Ring** (patience) · **Tag** (one
optional floating datum — ping, size, value).

### Value as Ornament, not size or glow
**How it looks:** Size fails at full zoom-out and glow fails the colour-blind test. **Value is encoded
as ornament count** — a plain visitor has a bare hull; each value tier adds one visible embellishment
(a rim, then a second rim, then a corner notch, then a crown notch). **A whale is visibly *decorated*,
not merely big**, so it still reads at 8px and in greyscale. Keep size as a secondary cue and glow as
a tertiary.

### The Patience Ring, with a three-stage LOD
Called the single most important visitor visual — and a thin ring on a small dot is invisible at crowd
density, so specify the degradation up front or it will be built once and break.

**How it looks:** At close zoom, the full depleting ring. At mid zoom, the ring collapses to a
**three-state colour + notch** on the hull (full / half / critical, each with a distinct notch
position readable in greyscale). At crowd density the ring vanishes entirely and patience is carried
by **the stream's colour temperature and velocity.**
**Alternative/complementary encoding — The Patience Meter Is Saturation:** a visitor starts fully
saturated cyan and drains toward grey with every second of delay. No bars, no numbers — **the crowd's
overall colour tells you your service quality at a glance, and a greying crowd is an alarm you feel
before you read.**

### The Trail = Latency
**How it looks:** Each visitor drags a motion trail whose **length equals its accumulated
round-trip.** A healthy platform looks like short sharp sparks; a struggling one looks like long
smeared comets. Zoomed out, **the whole traffic field's "smear" is your latency graph.**

### The Bounce (a universal six-frame animation)
**How it looks:** The mote goes grey, stops dead, **rotates 180°**, accelerates away, and pops into
three fragments at the map edge with a small negative-gold puff. **You *see* money leaving.** Identical
in every level, so it is instantly recognised in a hosting type you've never played.

### The Bounce Cause Tag
The puff tells you someone left, not why — and "why" is the useful half.

**How it looks:** The puff carries a single 12px glyph for one frame longer than the puff itself: a
**clock** (patience), a **shield** (blocked by your own defense — amber), a **broken page** (error), a
**padlock-slash** (cert warning), a **price tag** (price shock), a **checklist** (missing feature), a
**spinner** (queue). **A screen full of clock glyphs and a screen full of shield glyphs demand
completely different fixes**, and this is the cheapest possible way to say which you have. The same
glyph set labels the Traffic Sankey's branches and the live bounce-reason strip.

### The Bounce Heatmap and its decay
**How it looks:** Grey bounce marks persist ~60 seconds and accumulate into a **scorch** on the path
segment. A segment with sustained bouncing develops a visible worn/burned patch that fades over
minutes. **The repeat-visitor paving effect (§3.2) is the same system with a positive sign** — one
shader, signed: bright where you succeed, scorched where you fail.

### The Convert (and the hard spec that keeps it from becoming noise)
**How it looks:** A visitor that reaches a healthy service flashes white for one frame, drops a gold
spark into the revenue gutter, and **exits *forward* through the building rather than turning back.
Forward exit = good; backward exit = bad. Direction alone encodes it.**
**The spec, because this fires thousands of times:** ≤0.4s, ≤12px of travel before joining the money
stream, no screen-space scaling, no sound above a threshold rate, and **no confetti, ever.** The
reward is the *rhythm*, not the individual event.

### The Happiness Halo
**How it looks:** Served visitors leave with a small ring. Rings accumulate on the service that served
them as a faint glow — **your "well-loved services" are visibly brighter over time, which makes
reputation spatial.**

### The false-positive flash, reinforced
A one-frame amber flash at real traffic volume will simply never be seen.

**How it looks:** Three reinforcements: (1) the amber **accumulates in a growing pile under the
offending defense**, so the evidence persists; (2) each defense carries a **live false-positive
counter on its faceplate**; (3) the amber gets its own **deliberately slightly unpleasant audio cue**.
**A one-frame flash is not feedback; a growing amber pile is.**

### Crowd density as a particle field (four bands with hysteresis)
**How it looks:** **Discrete** (<150 units, individual sprites) → **clustered** (150–1,000, units merge
into clumps of ~8 with one shared ring) → **ribbon** (1,000–20,000, continuous flow where density,
velocity and colour carry the information) → **aggregate** (>20,000, a single labelled arc with a
number). **Hysteresis of ±15% at each boundary** so the rendering doesn't oscillate at a threshold.

### The Path Preview Ribbon
**How it looks:** Hold a key and the game draws the route a visitor *would* take through your
infrastructure right now, as a glowing dotted ribbon with **per-hop time chips**. It is a traceroute
you can see, and **dead ends glow red at the break point.**

### The Lookalike Test
**How it looks:** Deliberately, some visitors and some threats share silhouettes and differ only in a
small tell — badge colour, shimmer direction, gait. **A designed perception skill:** veteran players
read the tell; new players use tooling (your IDS draws an outline around confirmed-bad). **The
player's *eye* upgrades alongside their tech tree.**

### Glance Animations
A tiny reusable behaviour that carries an enormous amount.

**How it looks:** Visitors perform a 0.3s head-turn toward things that matter to them: the uptime
board, the price tag, a queue, a competitor's billboard, **another visitor bouncing.** **Watching a
visitor look at a bouncing visitor and then leave is word-of-mouth rendered without a system.** The
same animation drives the Doorstep check, the Review Wall glance, and the empty-server spiral.

### The Doorstep
**How it looks:** A threshold strip just inside the spawn edge where visitors **stop for ~0.4s** while
a thought-bubble checklist shows your trust signals as ticks or crosses — padlock, status board,
review stars, phone number, years-in-business — and then they walk on or turn around. **A line of
visitors turning at the doorstep is a completely different diagnosis from a line bouncing at your
app.**

### The Waiting Room
**How it looks:** Queued visitors accumulate in a visible antechamber with chairs. Good queueing and
backpressure means they sit and read a magazine; bad queueing means they stand, pace, and leave.
**You can literally see your p99 as body language.**

### The Turnstile
**How it looks:** Rate limits and admission control drawn as turnstiles at the door with a visible
counter. **Watching a turnstile keep the good crowd flowing while a herd backs up behind it is the
clearest possible picture of load shedding.**

### The Party Chain
**How it looks:** Party members drawn linked by a short visible tether, occupying slots as a unit. If
capacity is 3 and the party is 5, you watch the chain **fail to fit and rebound.** **Partial capacity
being worthless is instantly legible**, with no tutorial.

### The Entourage (whales and delegations)
**How it looks:** High-value units travel with smaller satellite units orbiting them. An enterprise
delegation is three to five distinct props on a shared slow-moving base, each with its own small
satisfaction pip; if any pip empties, the whole group turns. **Three meters on one unit is more
legible than three units.**

### The Arrival Metronome
**How it looks:** A thin strip at the inbound edge showing arrivals as tick marks over the last 60
seconds. **DNS is a solid grey blur; game servers are a rising evening ramp; backup is a single thick
block at 01:00; colo is one tick a quarter, drawn enormous.** **The strip's silhouette is the hosting
line's fingerprint** — and it is the same asset as the invoice calendar strip, rotated.

### The Convoy and the Window Band
**How it looks:** A translucent band lies across the board's timeline representing the backup window.
Crates queue at the edge before it opens, roll in while it is open, and are **physically cut off at the
band's trailing edge** — unfinished crates sit outside, half-open, with a red seal. **The band's edge
is the level's clock and it moves visibly.**

### The Red Case (the restore)
**How it looks:** A single courier with a red hard case, arriving alone, walking slowly, with a taxi
meter running above them. **Everything else on the board dims slightly while they're on it.** Success:
the case opens and its contents solidify. Failure: it opens and is empty. **One unit, one image, the
whole business line's thesis.**

### The Blueprint Visitor
**How it looks:** A K8s/PaaS deployment arrives carrying a rolled blueprint, walks to the control
plane, unrolls it, and **the board physically rearranges to match.** A bad manifest unrolls with a
visible error mark and the board rearranges *wrongly*, which you watch happen.

### The Customer Portrait System
Fourteen named recurring characters with zero visual identity is a waste of the emotional core of the
business layer.

**How it looks:** A **paperdoll portrait** on each card: a flat two-colour bust silhouette, one garment
token, one prop, one background tint for their cohort, and a mood ring. **Harold** has headphones and
a cracked phone. **Brenda** has a bakery apron and a laminated invoice. **Anya** has a lanyard with
five client badges clipped to it. **Raj's portrait contains smaller portraits behind him** — he is
fifty customers. **Edith** has a procurement folder and a second, smaller lawyer in the frame.
**Wendy's card is a different size from everyone else's and doesn't fit the tray.** Cheap flat art,
enormous personality — and it feeds the Client Card, the Wall of Ghosts, and the review cards.

### The Contract Card
**How it looks:** Every paying client is a physical card in a card file on the HUD's right edge:
auto-generated logo, MRR, SLA tier as a coloured stripe, health as an edge glow, and stat rows as
micro-bars whose **stroke weight encodes your confidence in the estimate.** **Churn = the card curling
and burning at one corner. Renewal = a fresh date stamp with a nice thunk.**

### The Wall of Mirrors (customer-eye previews at scale)
The Site Preview Window is the best UI idea in the design, and one window isn't enough once you have
tenants.

**How it looks:** A togglable grid of miniature **customer-eye previews** — 4, 9 or 16 tiles like a
broadcast monitor wall, each labelled with the tenant name and tinted/patterned by their cohort.
**Tiles go red when that customer's experience is broken.** The video/streaming level already implies
this; promote it to a universal buildable-unlocked UI, because **"which customers are actually
affected" is the decision-changing question** during every incident.

### The Empty Server Spiral, drawn
**How it looks:** Each game shard renders a small crowd on its faceplate. As population drops the crowd
thins, and **arriving players glance at the thin crowd and turn away** (reusing the Glance Animation).
**The spiral becomes visible and its intervention point becomes obvious: seed the server.**

### The Busy Wall (capacity, universal)
**How it looks:** The dial-up modem bank generalised: a wall of indicators where **the last one lighting
up means callers visibly turn away at the door.** Reuse it literally at every tier — ports, slots,
concurrency, cabinets, GPUs, licence seats. **The clearest capacity visual ever invented**, and it
should not stay in the 1996 level.

### The Front Door, the Sign, the Billboard, the Kite
Marketing rendered as physical objects. See §3.6 for the mechanics; visually: **the front door's
condition is your sales funnel**; **the sign is your product line-up** (a new business line bolts on a
new neon sub-sign); **the billboard is your ad spend** (bigger, better lit, with the inbound lane
visibly widening from its base — and peeling in real time when you cut it); **the banner kite is your
cheap marketing** (a wider, greyer, higher-bounce crowd).

### The Beacon and the competing beacons
**How it looks:** A lighthouse whose beam sweeps the map edge, spawning visitors where it touches;
brightness = spend, reach = targeting, with a visible **fuel draw** so switching it off is visibly a
cash decision. **Competitor bidding renders as other beacons on the horizon whose beams overlap yours,
dimming your effective reach** — an auction rendered as light interference.

### The Front-Page Geyser
**How it looks:** A viral spike as a vertical geyser erupting from one point at the map edge, with a
visible height curve decaying over minutes. **You can see the peak coming down before the numbers say
so.**

### The Dandelion and the referral web
**How it looks:** Extremely happy visitors puff into **seeds that drift off-map and return later as new
visitors**; referral programs make the puffs bigger and more frequent. Equivalently, happy customers
emit **gold threads** back to the map edge that become new spawn points — threads persist ~3 minutes
and fade, a happy customer refreshes theirs, and **an unhappy one's thread goes grey and stays.** The
web's overall brightness is your word-of-mouth health at a glance.

### The Review Wall and the Uptime Trophy Wall
**How it looks:** By the front door, a wall of small star cards that flip in as reviews land (gold for
five, ash grey for one), and a 90-pip uptime board **physically printed and updated daily by a staff
sprite** — so publishing a bad day is a visible act performed by a person. Arriving visitors glance at
both.

### The Status Page Beacon
**How it looks:** A lamp on the front of your building — green, amber (degraded, with a scrolling
note), red (down). **Lighting it honestly during an incident visibly calms the social-media flock and
slows churn. Transparency drawn as a light that soothes.**

### The Logo Wall and the clean rectangle
**How it looks:** Marquee customers' logos mounted in your lobby; the wall filling is a long-arc
progress display, and **losing one leaves a visible clean rectangle where the sign used to be** — a
brutal, silent, perfect churn signal.

### The SLA Credit Coin
**How it looks:** A gold coin flies *out* of your revenue gutter and back to the customer's card.
**Money moving backward is always drawn as reverse motion.**

### The Churn Ledger Draft
**How it looks:** A departing customer's traffic lane **thins over several seconds like a tap closing**
rather than stopping dead. The gradual fade is more legible — and sadder — than a hard stop.

### The 1-star on the window
**How it looks:** An angry churned customer stops at the door to **spray-paint a 1-star on your
window**, which passing visitors then see and react to. The paint is **removable at a cost** (a staff
hand and time), and multiple stars **accumulate and progressively obscure the window** until arriving
visitors can't see in and bounce at the Doorstep. **A reputation mechanic that becomes a literal
occlusion.**

### Reputation Weather
**How it looks:** Overall reputation is the **sky above your facility** — clear, overcast, smog, storm
— always in frame from Tier 2, needing no legend, and shifting **the colour temperature of the whole
scene** so a bad reputation literally makes your company look worse.

### The Sales Pipeline Rail and the RFP Fax
**How it looks:** Deals ride a visible rail through stations (lead → quote → signed), **dimming when
they stall**; enterprise leads arrive as **a fax printing line by line**, which is a four-second
attention grab and an era-appropriate joke.

### The Tour Rail and the verdict photograph
**How it looks:** A shoulder-locked rail-cam walks the colo prospect's route at walking pace for ~90
seconds with **no free-roam**, a verdict strip filling at the bottom (`CABLE MGMT ✓` · `AISLE 3:
OBSTRUCTED ✗`). The post-tour screen shows the strip beside **a photograph of the exact moment they
saw the bad thing.** **That photograph is the feedback**, and every verdict maps one-to-one onto
something the player built or skipped.
