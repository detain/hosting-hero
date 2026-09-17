# Hosting Tower Defense — Idea Dump (Lens: Game Designer)

> **My bias, stated up front.** I don't care whether a mechanic is realistic; I care whether it
> generates *a decision the player can be wrong about in an interesting way*. Hosting is an
> unusually generous theme because the real job already contains the best TD tension anyone has
> ever written down: **the thing that keeps attackers out is the same thing that keeps customers
> out.** Every firewall is a queue. Every inspection is a delay. Every delay is a bounced visitor.
> That is a tower defense where your towers shoot your own income, and I want the whole game built
> on that one sentence.
>
> Everything below is organized so that the hosting *type* is a **ruleset skin** over one shared
> verb set — never a separate game. Details on that in §1 (Level Grammar) and §7 (Universal Verbs).

---

## 0. The four load-bearing mechanics (read this first, everything else hangs off it)

### 0.1 The Latency Budget — your real health bar
Don't give the player a castle with HP. Give them **a millisecond budget**. Every defense,
inspection, hop, proxy, and overloaded node adds milliseconds to the path. Visitors have a
patience threshold; cross it and they bounce *before reaching you*, silently, costing revenue with
no explosion and no alarm. This inverts the genre's core feeling: in normal TD, more towers = safer.
Here, **more towers = safer but poorer**, and the player must feel that ache constantly.

- Visitors carry a **Patience** value (e.g. 800ms for a casual page load, 60ms for a game player,
  4ms for a financial-colo tenant, 12 hours for a backup job).
- Each placed structure stamps a latency cost onto packets passing through it.
- The HUD shows a **budget bar per lane**: green headroom, amber, then red "you are now leaking
  customers."
- This single number lets you compare wildly different buildables: "is this WAF worth 14ms?"

### 0.2 The Suspicion Dial — every defense is a classifier with a false-positive rate
No defense in this game is binary. Each one has an **aggression slider** the player can set per
device, per lane, or globally:

- Low aggression: lets threats through, lets everyone through, cheap, fast.
- High aggression: blocks threats, **also blocks a percentage of real visitors**, costs more CPU,
  adds latency.
- The false-positive rate is *visible* — blocked-visitor ghosts drift away greyed out with a little
  "403" above them. The player literally watches their money get shot by their own turret.
- Upgrades don't just "do more damage" — they **improve the ROC curve** (more true positives at the
  same false-positive rate). That makes every upgrade legible without a stat wall.

### 0.3 The Attack Surface Ledger — capability and risk are the same purchase
Every buildable has two numbers on its card: **Capability** (what it lets you sell) and **Surface**
(what it invites). Adding a DB server raises the revenue ceiling of every site in front of it *and*
unlocks SQLi, slow-query storms, and replication-lag events in the threat pool for the rest of the
level. The threat deck is **built from the player's own construction log**. That's the discovery
engine, the difficulty curve, and the morality play all at once: the game gets harder exactly
because you got richer, and in the shape you chose.

### 0.4 Uptime Nines — the lives counter, spent in seconds not hits
Instead of 20 lives, give the player an **error budget** measured in downtime seconds for the
period. 99.9% over a 30-day level = 43 minutes of allowed downtime. Every outage burns seconds.
Burn it all and you start paying SLA credits (money), then churn (income), then fail. This makes
partial failure *survivable and interesting* — a 90-second blip is a real cost the player can
choose to accept while fixing something bigger. Roguelike TDs need a spendable resource that *is*
your life; this is it.

---

## 1. Levels, Scenarios, and Progression

### 1.1 Structural ideas

**L-01. The Level Grammar (anti-fragmentation rule).**
Every level, regardless of hosting type, is assembled from the same six slots:
`SCALE` (one box → one rack → one suite → one DC → many DC) ×
`BUSINESS` (what you sell) ×
`SCARCITY` (which resource is the binding constraint: latency / capacity / power / trust / cash) ×
`LANE SHAPE` (how many ingress paths and how they branch) ×
`CLOCK` (steady diurnal / spiky / seasonal / always-on) ×
`GOAL` (survive / grow to N / hold an SLA / migrate / audit / evacuate).
The player learns one verb set and re-reads it through new constraints. A designer can generate a
hundred levels without shipping a hundred systems.

**L-02. The Binding Constraint promise.**
Each level's briefing states in one line which resource will kill you, e.g. *"In cold storage,
latency is free and durability is everything."* Players should be able to *say out loud* what this
level is about before the first wave. This is the single biggest thing that keeps type-swapping
from feeling like reskinned mush.

**L-03. Shift Structure (day/night pacing).**
A level runs in **shifts**. Each shift = a **Business Day** (build, sell, hire, price, plan — time
is soft, threats are trickled) followed by a **Peak** (the wave; time is hard, you can only place
pre-authorized changes). Peak length grows across the level. The Business Day shrinks. By the last
third of a level the player is nearly always in Peak — that's the pressure curve, built from pacing
rather than from bigger numbers.

**L-04. The Change Window.**
Building during Peak is allowed but risky: any structure placed while traffic is live has a chance
to cause a **self-inflicted outage** proportional to how central it is. Building during the Business
Day is free and safe. So the player is perpetually asking, "do I fix this now and maybe break it, or
bleed until 3am?" Best five-second decision in the game, and it's free realism.

**L-05. Quarter Arc.**
A campaign level = one fiscal quarter = ~13 shifts. Shift 1-4 introduce the type's signature
mechanic with a soft threat floor. 5-9 mix. 10-12 stack. 13 is the **Quarter Event** (see boss
ideas). End of quarter = the **Quarterly Review** score screen (§6).

**L-06. Two Difficulty Axes, never one.**
Waves scale on **Volume** (more stuff) and **Variety** (new stuff). Volume tests your build;
Variety tests your *coverage*. Alternate which one escalates each shift so the player alternates
between "widen" and "deepen" — that rhythm is what keeps a 40-minute level from flattening.

**L-07. The Pivot Map (campaign shape).**
The campaign is a node map of business lines, not a straight line. Finishing *Shared Hosting* opens
three doors: *VPS* (up-market, same customers), *Game Servers* (new customers, harsher latency), or
*Email/DNS* (cheap, reputational hellscape). You pick. You can come back later. Nodes you skip stay
visible so the player feels the shape of the industry they're not in.

**L-08. Lines of Business run concurrently (late campaign).**
From Act 3, a level can require the player to run **two business types on one facility** — game
servers and backup, say. They fight over the same power, racks, and staff, and their peaks are
offset (gamers at night, backups at night too — oops, that's the joke and the whole level).

**L-09. Carry-over, but thin.**
Between levels you keep: unlocked tech, 3 named staff, your reputation score, and a slice of cash
(capped). You lose: the physical build. This keeps every level a fresh placement puzzle while the
meta-progression still feels like *a company*.

**L-10. Legacy Debt.**
Choices persist as liabilities. Oversold in level 3? Level 6 starts with 200 angry legacy customers
on a box you can't decommission, generating tickets forever until you spend a shift migrating them.
Consequence that arrives two hours later is the strongest memory a strategy game can make.

**L-11. The Ratchet.**
Each level permanently ratchets one global rule for the rest of the campaign: "from now on, all
customers expect TLS," "from now on, IPv4 costs money," "from now on, ransomware exists." The world
gets more hostile in ways that are *announced*, so the player can prepare and feel clever.

### 1.2 Level designs by hosting type
Format: **Name** — scale · binding constraint · what's introduced · what gets harder · the twist rule.

**L-12. "One Box, Two Hundred Sites"** (tutorial) — Shared web hosting · scarcity: CPU.
Introduces: visitors, bounce, a single server with a load bar, one defense. Gets harder: a noisy
neighbor site eats all the CPU and you must find and throttle it. **Twist:** you can't remove the
bad customer — they pay. First lesson: the enemy is sometimes a client.

**L-13. "The Slashdot"** (scenario) — one box · scarcity: capacity, for 6 minutes.
A single customer's site hits the front page. Traffic 60×. Introduces caching as the *only* answer
(you cannot buy enough servers in time). **Twist:** revenue is proportional to how many of the spike
you serve, so hiding behind aggressive rate limits is survival-without-profit. Grade is a curve
between "stayed up" and "cashed in."

**L-14. "Half a Rack"** — colocated in someone else's DC · scarcity: power & remote hands.
Introduces: physical objects (U-space), someone else's rules, remote-hands tickets that take *real
time*, a 20A circuit you can trip. Gets harder: you can't walk in. **Twist:** every physical action
costs a ticket with a latency of 1-3 shifts, so mistakes are slow to fix. Teaches planning.

**L-15. "Tick Rate"** — game server hosting · scarcity: latency (60ms hard wall).
Introduces: player-visitors who *stay* (sessions, not requests), server browser listings that
attract both players and booters, cheat/griefer threats, region matters. Gets harder: a booter
targets whichever server has the most players. **Twist:** popularity is a targeting beacon. Your
best server is the one under attack, always.

**L-16. "Cold Storage"** — backup/archival/DR · scarcity: durability & restore time.
Introduces: jobs instead of requests (visitors that take hours and *must not be interrupted*), tape
libraries, bit-rot as a silent threat that only shows up on restore, verification as a cost center.
Gets harder: a customer's restore test in front of an auditor. **Twist:** latency doesn't matter at
all, and the game says so out loud — instead, **a threat that got through three shifts ago is what
kills you now.** Delayed-consequence horror level.

**L-17. "Edge Cases"** — CDN / anycast · scarcity: cache hit ratio.
Introduces: many small PoPs instead of one big site, a global map view, cache-fill vs. origin-load
economics, purge storms. Gets harder: an attacker crafts cache-busting query strings so every hit is
a miss. **Twist:** the level is won on a *percentage* (hit ratio), not on survival. Optimization
level.

**L-18. "The Furnace"** — GPU / AI compute · scarcity: power and cooling, brutally.
Introduces: kilowatt budgets per rack, thermal maps, jobs that pay enormously and run for hours,
queueing/scheduling as the core puzzle, hardware that costs a fortune and dies. Gets harder: a
customer's job pins every card at 100% and the room heats until you shed load. **Twist:** you can
*overclock the whole facility* for a shift — huge revenue, permanent hardware damage roll.

**L-19. "Landlord"** — colo operator · scarcity: trust & contracts.
Your customers are other hosting companies. **You do not control their gear.** Introduces: tenants
who cause your incidents, cross-connects as a sellable product, SLAs on power and cooling only,
badge access, escorts. Gets harder: a tenant gets DDoSed and it saturates *your* shared uplink.
**Twist:** you can't fix your customers' problems, only contain them. Contracts and containment
replace towers as the defense. Wildly different feel, same verbs.

**L-20. "MX Record"** — email hosting · scarcity: reputation (deliverability).
Introduces: a **Reputation bar that is also your throughput** — get blacklisted and 100% of your
"visitors" (delivered mail) fail regardless of your infrastructure. Spammers who sign up as
customers pay well and destroy you. Gets harder: a legitimate customer's list gets compromised.
**Twist:** the defense is *outbound*, not inbound. The whole tower-defense orientation flips: you're
filtering what leaves.

**L-21. "Root Zone"** — authoritative DNS / anycast · scarcity: correctness.
Introduces: microscopic packets in unimaginable volume, amplification (you can be *used as a weapon*
and get null-routed by your own upstream), TTL as a tunable resilience/agility tradeoff.
**Twist:** a single misconfiguration propagates globally and can't be un-propagated for the length
of the TTL you chose. Set TTL low for agility, and you eat 10× query volume forever.

**L-22. "Dial Tone" (1996)** — dial-up ISP · scarcity: modem ports & phone lines.
Introduces: a finite pool of ports, busy signals as the bounce mechanic, per-hour billing, a
Usenet feed that eats all your disk, an IRC server that attracts both community and packet kiddies.
Gets harder: AOL goes flat-rate and everyone stays connected all day. **Twist:** period rules —
no encryption exists, every password is plaintext, and the threats are *people* with war-dialers.
Visual and audio era shift is the reward.

**L-23. "Blacksite"** — bulletproof / anything-goes hosting · scarcity: upstream tolerance.
Enormous revenue per customer, and every customer is a threat generator. Introduces: **Abuse
Pressure**, a meter fed by complaints; when it fills, your *upstream carrier* — not an attacker —
cuts you off. Gets harder: law enforcement, payment processors dropping you, and a competitor
reporting you. **Twist:** you win by choosing *which* bad customers to keep. A pure risk/reward
portfolio level with no shooting at all.

**L-24. "Chain of Custody"** — HIPAA/PCI regulated hosting · scarcity: evidence.
Introduces: **the audit trail as a build requirement** — every structure must be logged, patched,
and documented, and documentation is a resource you produce with staff time. Gets harder: the
auditor arrives mid-level and freezes changes for three shifts. **Twist:** you can pass the audit
with a *worse* infrastructure and fail it with a better one. Compliance ≠ security, and the game
should make that funny and infuriating.

**L-25. "Cross-Connect"** — financial exchange colo · scarcity: nanoseconds.
Introduces: fiber length as a literal placement cost (cable runs measured and priced), tenants who
will pay a fortune for 3 meters closer, and a strict "everyone gets the same length" fairness
regulation you can be caught violating. **Twist:** the map is a physical geometry puzzle, not a
throughput puzzle. Closest thing to a pure spatial level in the game.

**L-26. "Namespace"** — Kubernetes / PaaS · scarcity: scheduling headroom.
Introduces: workloads that move themselves, autoscaling that can be attacked (a traffic spike that
scales you into bankruptcy), noisy-neighbor at container granularity, a control plane that is a
single point of failure. **Twist:** you don't place pods, you place *policies*, and the system
places pods. A level about indirect control. Great palate cleanser after three hands-on levels.

**L-27. "First Watt"** — greenfield datacenter build · scarcity: capital and time.
Zero customers on day 1. Introduces: construction as a multi-shift process, utility power
negotiation, generator/UPS/chiller redundancy tiers (N, N+1, 2N), and the slow terror of spending
everything before earning anything. **Twist:** the level's threats are almost all non-attack
(inspections, supply chain, a concrete pour that fails). A **builder** level in a defense game.

**L-28. "Two Regions"** — multi-DC · scarcity: coordination.
Introduces: a world map layer, replication lag as a visible travelling object, failover as an
explicit costly action, split-brain as a failure state. Gets harder: an event hits both regions in
sequence, so failing over is sometimes the wrong move. **Twist:** the player has **two boards** and
one attention span. Deliberate attention-management pressure.

**L-29. "Lift and Shift"** (scenario) — migrate a live platform with no downtime.
Your build starts finished. The goal is to move it, piece by piece, while it serves traffic.
Introduces: dual-running cost, cutover moments, rollback. **Twist:** you can't pause. Every move is
a Change Window gamble. A level made entirely of §0.4 error budget.

**L-30. "The Acquisition"** (scenario) — absorb a competitor's junk hardware and customers.
You inherit a pre-built board designed by a sadist: undocumented links, a server nobody knows the
purpose of ("DO NOT REBOOT" sticky note), 40 customers paying below cost, and three ticking
liabilities. Goal: get it profitable in one quarter. **Twist:** a **Discovery** mechanic — you must
spend staff-shifts *auditing* your own board to reveal what things do. Fog of war on your own base.

**L-31. "Breach"** (scenario) — post-incident recovery.
Starts with a fait accompli: someone is already inside. Introduces: forensic actions, rebuilding
from known-good, the choice to disclose (reputation hit now, bigger hit later if you don't),
customers demanding answers. **Twist:** you are defending against an attacker that is *already
past your towers* and hiding, so your usual perimeter is useless. Inverted TD level.

**L-32. "Peak Season"** — retail hosting in Q4 · scarcity: capacity, foreseeably.
The wave schedule is *published in advance*. You know exactly what's coming and when. **Twist:**
this makes it a pure optimization/preparation level, and the failure mode is over-provisioning
yourself into a loss. The most "spreadsheet" level, and a good one at the halfway mark.

**L-33. "Hash Rate"** — crypto mining hosting · scarcity: power price volatility.
Introduces: a **live commodity price** for both power and the thing your customers mine; contracts
that let customers walk; fire risk from cheap gear. **Twist:** the economy itself is the antagonist
and may collapse mid-level, turning every tenant into a deadbeat simultaneously. A lesson about
concentration risk.

**L-34. "Transcode"** — video / live streaming · scarcity: encode capacity at the moment of demand.
Introduces: a live event with a fixed start time, ladder encoding (quality tiers you can shed),
viewers who tolerate buffering exactly twice. **Twist:** **graceful degradation is a win condition**
— dropping everyone to 480p to keep the stream alive scores better than a perfect 4K stream that
dies. Teaches the load-shedding verb, which then matters everywhere.

**L-35. "Trunk"** — VoIP / SIP · scarcity: jitter.
Introduces: calls as long-lived fragile visitors, toll fraud (an attacker who *costs you money
directly* by placing calls), regulatory 911 obligations. **Twist:** a threat whose damage is a
line item on your phone bill, discovered a shift later. Teaches monitoring as defense.

**L-36. "Seedbox"** — grey-area storage/bandwidth · scarcity: complaint tolerance.
Halfway between shared hosting and Blacksite. Introduces: DMCA notices as a countdown mechanic,
customers who churn instantly to whoever's cheapest. **Twist:** the cheapest customers are the
highest-bandwidth customers. Inverted value curve.

**L-37. "Object Store"** — S3-alike · scarcity: consistency & egress cost.
Introduces: egress billing as the main revenue line (and thus a customer whose success ruins you if
mispriced), erasure coding, a hot-object problem. **Twist:** a single viral file can be a revenue
bonanza or an unpaid bandwidth catastrophe depending on which pricing model you chose in shift 1.

**L-38. "Ground Station"** — satellite teleport hosting · scarcity: pass windows.
Customers can only talk to their birds during **orbital windows** on a visible schedule. Introduces:
scheduling as the whole game, weather (rain fade) as an environmental threat, antennas as
enormous expensive towers you physically aim. **Twist:** a missed window is gone for 90 minutes;
you cannot buy your way out of time.

**L-39. "The Long Tail"** — 2,000 tiny customers on shared hosting, endless mode flavor.
Introduces: managing by *policy* because you cannot possibly manage by hand. Gets harder: support
tickets scale with customers, so growth is self-limiting until you automate. **Twist:** the enemy is
your own ticket queue.

**L-40. "White Glove"** — managed WordPress / managed apps · scarcity: staff hours.
You are responsible for the customers' *software*, not just their server. Introduces: update
management (patching breaks sites; not patching gets them owned), plugin roulette, customers who
blame you for everything. **Twist:** every defensive action can also break a customer. Highest
false-positive-cost level in the game.

**L-41. "Render Farm / HPC"** — scarcity: job completion deadlines.
Introduces: batch scheduling, preemption, checkpointing (spend capacity now to survive failure
later), a customer whose deadline is at the exact moment of your maintenance window.
**Twist:** you can win by *cancelling* a job — deliberate, scored loss to save four others.

**L-42. "IoT Backend / 5G MEC"** — millions of tiny chattering devices.
Introduces: visitors so small and numerous they're rendered as a fluid, not sprites; a firmware bug
in a customer's device fleet that makes 4 million devices retry in lockstep (self-inflicted DDoS).
**Twist:** your customer *is* the botnet, accidentally.

**L-43. "The Reseller Channel"** — you host hosts who host hosts.
Introduces: partner/white-label revenue, no direct customer relationship, blame that travels
up three layers. **Twist:** you can't see your end users at all — the visitor stream is anonymized
and you must diagnose by aggregate signals only. A partial-information level.

### 1.3 Scenario modifiers (drop onto any level for variety)

- **M-01. Skeleton Crew** — half your staff, double the action cooldowns. Holiday week.
- **M-02. Founder's Vacation** — limited number of manual interventions for the whole level; you must
  pre-build automation. Forces the player to use systems they'd otherwise micro past.
- **M-03. Cash Only** — no credit, no financing. Every purchase from revenue. Brutal tempo lesson.
- **M-04. Frozen Change** — an audit or a code freeze bans new construction for N shifts mid-level.
- **M-05. Hostile Upstream** — your transit provider is being acquired and is unreliable; random
  upstream blackholes you must route around.
- **M-06. Price War** — a competitor undercuts you by 40%; your only lever is quality/differentiation.
- **M-07. Viral Moment** — one customer blows up; you can cash in, or protect everyone else.
- **M-08. The Tour** — a prospective whale tenant walks the floor during peak. Cosmetic damage
  (a cable mess, a warm aisle, a visible alarm) costs you the contract. Makes tidiness matter.
- **M-09. Regulatory Sunrise** — a new law takes effect at shift 7; compliance work must be done
  before it, and you don't know the exact requirements until shift 5.
- **M-10. Heat Dome** — ambient temperature +12°C for the level; cooling costs double, thermal
  margins shrink.
- **M-11. Fiber Seeking Backhoe** — a random shift loses one physical path entirely. Redundancy
  investment either pays off or doesn't, visibly.
- **M-12. Deadbeat Quarter** — 20% of invoices go unpaid; cash flow vs. revenue divergence lesson.
- **M-13. Patch Tuesday** — a CVE drops mid-level for a component you built on. Timer to patch;
  patching risks breakage; not patching guarantees compromise.
- **M-14. The Whale** — one customer is 60% of revenue and makes unreasonable demands. Keeping them
  distorts your whole build. Firing them is a legitimate, scored strategy.
- **M-15. Ghost Ship** — you inherit a board with no documentation and must run it before you
  understand it (pairs with L-30).
- **M-16. Fire Drill** — a *simulated* disaster with no real damage, but the score counts your
  response. Low-stakes rehearsal used to teach a mechanic before it bites for real.
- **M-17. Sanction Line** — a country goes on an embargo list; you must identify and cut those
  customers or eat a penalty, and one of them is your best payer.
- **M-18. Media Attention** — a journalist is writing about you. Every incident this level counts
  double against reputation; every clean shift counts double for it.

### 1.4 Boss-shaped events (the end-of-quarter beat)

- **B-01. The Multi-Vector Day** — volumetric + application-layer + an insider + a hardware failure,
  staggered so that each one makes the next worse. Tests whether the player built breadth.
- **B-02. Grid Down** — utility power fails for 47 minutes. Generators, fuel, transfer switch,
  and the one rack you forgot to put on UPS. A pure facility boss.
- **B-03. The Zero-Day** — an unpatchable exploit for a component you use. The only counters are
  architectural ones you either built earlier or didn't: segmentation, least privilege, immutable
  rebuilds. **Retroactively rewards good hygiene** — the best kind of boss.
- **B-04. Extortion** — a persistent attacker with a ransom demand. Paying works, is cheap, is
  scored as a failure, and makes next level's attacker pool worse. A *real* choice.
- **B-05. The Cascade** — one small failure you ignored propagates. The boss is your own tech debt,
  and the game shows the chain in a post-mortem replay.
- **B-06. Audit Day** — no combat at all; a pure inspection encounter resolved by your documentation,
  logging, and access controls. Genre whiplash on purpose.
- **B-07. The Migration Deadline** — your datacenter's lease ends. Move everything in 3 shifts.
- **B-08. The Competitor's Collapse** — a rival goes bankrupt and 400 refugee customers stampede at
  you at once. A *positive* boss you can still lose to. I love this one: being overwhelmed by
  success is the most under-used pressure in TD.

---

## 2. Threats

### 2.1 Threat design rules I want enforced

**T-00a. Every threat must be telegraphed, readable, and counterable by more than one build.**
If only one tower answers a threat, it's a tax, not a decision.

**T-00b. At least a third of all threats are non-attacks.** Hardware, power, human error, regulators,
and customers. This is what makes the game *hosting* rather than *Plants vs. Zombies with routers*.

**T-00c. The scariest threats look exactly like customers.** That's the theme's gift. Build a whole
family around ambiguity.

**T-00d. Threats should punish specific build choices,** drawn from the Attack Surface Ledger (§0.3).
Never spawn a SQLi wave at a player with no database. The wave deck is a mirror.

**T-00e. Damage types should differ**, so defenses aren't interchangeable: *Availability* damage
(downtime seconds), *Money* damage (direct cost), *Reputation* damage (future visitor volume),
*Integrity* damage (silent, delayed), and *Attention* damage (consumes player actions).

### 2.2 Volumetric & network family

- **TH-01. Packet Flood (Bot Swarm)** — the genre-standard trash mob. Huge count, low individual
  impact, saturates your uplink so *visitors can't get in*. Counter: upstream scrubbing, anycast,
  bigger transit. Cost when it lands: availability + transit overage money.
- **TH-02. Amplification Reflection** — spoofed small requests turned into huge replies. If you run
  DNS/NTP/memcached, **you become the weapon** and your upstream blackholes you. Counter: response
  rate limiting, egress filtering, BCP38. Unique in that the punishment comes from your own provider.
- **TH-03. Slow Loris ("The Sipper")** — a tiny number of connections that never finish. Trivial
  bandwidth, exhausts your connection table. Visually: a thin, patient, unkillable trickle.
  Counter: connection timeouts, event-driven proxy layer. Punishes players who bought bandwidth
  instead of architecture.
- **TH-04. SYN Storm** — half-open connections. Counter: SYN cookies (a cheap early unlock that
  feels like a magic trick the first time).
- **TH-05. The Carpet Bomb** — spreads thin traffic across your *entire* IP range so no single
  target trips a threshold. Counter: aggregate/holistic monitoring rather than per-host. A
  difficulty spike aimed at players who defend per-server instead of per-edge.
- **TH-06. Pulse Wave** — repeated short, enormous bursts timed to arrive between your autoscaler's
  reaction windows. Counter: pre-warmed capacity, faster detection. Explicitly designed to punish
  reactive-only builds.
- **TH-07. Route Hijack** — an upstream announces your prefixes; visitors go somewhere else
  entirely and you *look fine locally*. The most confusing threat in the game and that's the point.
  Counter: RPKI/monitoring unlock, out-of-network probes.
- **TH-08. Upstream Transit Outage** — not an attack. Your carrier drops. Counter: a second carrier
  (expensive, idle most of the time — the purest redundancy-vs-cost decision in the game).

### 2.3 Application & protocol family

- **TH-09. SQL Injection Worm** — only spawns if you have a DB. Travels *through* the web tier to
  the DB. If it lands: data theft = reputation + fine, delayed. Counter: WAF (latency cost),
  parameterized-query "policy" upgrade (staff time cost), segmentation.
- **TH-10. Credential Stuffing** — uses real usernames and real passwords from someone else's breach.
  **Indistinguishable from legitimate logins** unless you unlock behavioral analysis. Counter: rate
  limit (blocks real users too), MFA (friction, churns some customers), device fingerprinting.
- **TH-11. Cache Poisoning / Cache Buster** — CDN-level. Either fills your cache with garbage or
  ensures nothing is cacheable. Counter: canonicalization, key normalization, hit-ratio alarms.
- **TH-12. The Scraper** — not malicious exactly, just takes everything constantly and pays nothing.
  A visitor-shaped parasite. Counter: rate limiting, robots, or — fun option — **sell them an API
  plan and convert the threat into revenue.** I want several threats that can be *monetized* instead
  of killed.
- **TH-13. Exploit Kit (CVE Drop)** — arrives on a global timer, targets a named component you built.
  You get a patch window. Patching risks breaking customers (managed hosting especially). Superb
  risk/reward beat.
- **TH-14. Supply-Chain Package** — a dependency you "installed" three shifts ago turns hostile.
  Counter: none, at the moment of arrival — only prior architecture (egress filtering, immutability).
  Teaches that some defenses are bought in the past tense.
- **TH-15. Web Shell / Persistence** — after any successful breach, drops an invisible object on your
  board that keeps re-infecting until found. Requires an active hunt action to remove. The "clear
  the debuff" loop TDs usually lack.
- **TH-16. Ransomware** — encrypts a storage node; damage is capped by whether you have *verified*
  backups. The counter is a thing you spent money on for many shifts with zero visible benefit.
  Perfect justification for boring investments.
- **TH-17. Cryptominer Squatter** — quietly eats 30% of your CPU everywhere. No downtime, no alarm,
  just a slow revenue leak and rising power bills. Detectable only by baselining. A **stealth
  economic threat**, which the genre almost never does.

### 2.4 Human, insider, and customer family

- **TH-18. The Abusive Customer** — pays you, and is the source of the outbound spam / DDoS /
  copyright complaints. You must choose: keep the money, or keep the reputation. Recurs by name
  across levels.
- **TH-19. The Fat Finger** — your own staff. Random chance on any Peak-time change; scales down
  with training, runbooks, and change review (which cost time). The game's way of pricing process.
- **TH-20. The Disgruntled Admin** — a staff member whose Morale hit zero. Sabotage, or they quit
  and take institutional knowledge (a *permanent* loss of a discovered tech until re-learned).
- **TH-21. Social Engineering Call** — a threat that attacks your *support* lane, not your network.
  Counter: verification policy (adds friction to real customers, raises ticket time).
- **TH-22. The Ticket Storm** — not damage, but **Attention damage**: floods your support queue and
  eats the actions you needed for the real incident. My favorite mechanic in this category: the
  attacker's goal is to occupy the player's hands.
- **TH-23. The Chargeback Ring** — customers who sign up, use resources, and reverse the payment.
  Direct money damage + processor penalties. Counter: fraud screening (rejects some real signups).
- **TH-24. The Competitor** — a rival AI that undercuts your prices, poaches your staff, files abuse
  reports about you, and occasionally hires someone to DDoS you. A persistent named antagonist across
  the campaign with their own visible company board you can partly scout.
- **TH-25. The Researcher** — finds a real hole and tells you. If you respond well: free defense +
  reputation. If you ignore or threaten them: public disclosure and a much worse day. A threat
  whose correct answer is *politeness*.
- **TH-26. The Journalist** — amplifies whatever your worst moment was this quarter.
- **TH-27. Nation-State Actor** — late campaign. Doesn't trip alarms, doesn't cause downtime, and
  can't be fully removed. You can only *contain and observe*. Damage is integrity + long-term. Deny
  the player a clean win once, on purpose.

### 2.5 Physical, environmental, and facility family

- **TH-28. Disk Failure** — routine, constant, boring, and correct. Managed by spares and redundancy.
  The background hum of the game's entropy.
- **TH-29. The Double Failure** — a second disk dies *during the rebuild*, when the array is under
  maximum stress. Probability rises with array size. Punishes "big cheap arrays."
- **TH-30. Silent Corruption / Bit Rot** — no alert at all. Discovered only at restore time, three
  shifts later. The signature backup-level threat. Counter: scrubbing (costs capacity, produces
  nothing visible).
- **TH-31. PSU/Fan Failure** — reduces cooling headroom; combines with heat events.
- **TH-32. Thermal Runaway** — a hot aisle exceeds threshold; servers throttle (capacity loss) then
  shut down (availability loss). Counter: layout discipline, blanking panels, containment. **Makes
  physical placement matter beyond adjacency.**
- **TH-33. Utility Blip** — sub-second power sag. Anything not on UPS reboots. Reveals exactly which
  of your gear you cheaped out on, in the most humiliating way possible.
- **TH-34. Generator Fails to Start** — the classic. Probability is set by whether you ran monthly
  load tests, which cost fuel and a small outage risk each time. **A maintenance ritual with real
  odds attached.** Gorgeous.
- **TH-35. Fuel Runs Out** — a long outage becomes a logistics problem; fuel delivery is a ticket
  with a travel time, and during a regional disaster the queue is long.
- **TH-36. Chiller Failure / Water Leak** — water above or near electronics. Fast, dramatic, local.
- **TH-37. Fire / Halon Discharge** — rare, catastrophic, and the suppression system itself causes
  damage (and the discharge is loud enough to kill spinning disks — a great "the cure hurt too"
  detail).
- **TH-38. Backhoe** — fiber cut. Counter: diverse physical paths, which you must have *bought as
  separate routes*, not just two cables in the same conduit. Punishes fake redundancy.
- **TH-39. Seismic / Storm / Flood** — regional, telegraphed by a weather system on the map, and
  the reason multi-region exists.
- **TH-40. Pest** — rodents in the cable tray, or wasps in the outdoor condenser. Comedy threat with
  real consequences. Every game needs one.
- **TH-41. Dust/Construction** — a neighbor's build fouls your air filters and degrades cooling
  gradually. Slow-burn environmental.

### 2.6 Business, regulatory, and economic family

- **TH-42. Audit** — see B-06. Counters are paperwork and access control.
- **TH-43. Subpoena / Law Enforcement Seizure** — they take a server. If it was shared, you just took
  down 200 innocent customers. Counter: isolation architecture. Terrifying and thematically perfect.
- **TH-44. Sanctions/Compliance Sweep** — see M-17.
- **TH-45. Payment Processor Drop** — your ability to *collect money* is a dependency with a threat
  attached. Massively under-modeled in games; hugely real.
- **TH-46. Price Shock** — power, bandwidth, or hardware costs jump. Your fixed-price contracts don't.
- **TH-47. Vendor EOL** — a product line you built on is discontinued; support ends; you're forced to
  migrate or accept rising failure odds.
- **TH-48. IP Reputation Blacklist** — your whole netblock gets listed because of one customer. All
  email/traffic degrades. Counter: cleanliness, subnet segregation, and having bought a second block.
- **TH-49. The Refund Cascade** — an outage triggers SLA credits; credits trigger cash crunch; crunch
  prevents the fix; the fix's absence causes another outage. An explicit **death spiral** the game
  should let the player see coming and fight out of.

### 2.7 Attacker archetypes (the "directors" behind the waves)

Each archetype is a **behavior policy**, not a sprite — it decides *what* spawns and *where it aims*.

- **A-01. Script Kiddie** — random, loud, low skill, hits whatever is most visible. Early-game.
- **A-02. Botnet Operator** — scales with volume; aims at your fattest pipe; rents out capacity so
  the same botnet shows up working for different clients.
- **A-03. The Competitor** — aims at your *newest* customer and your *biggest* customer. Strategic,
  informed, and occasionally legal-but-hostile.
- **A-04. The Extortionist** — escalates until paid; tracks whether you paid last time (payment makes
  you a marked target permanently).
- **A-05. The Opportunist Scanner** — sprays for known CVEs; harmless until you have an unpatched
  thing; then instantly lethal. Punishes patch debt, ignores everything else.
- **A-06. The Insider** — spawns from your own staff state.
- **A-07. Nation-State** — slow, quiet, patient, persistent; targets *data*, not uptime.
- **A-08. Entropy** — the unattributed director that spawns hardware/power/environment events at a
  rate driven by your fleet's age, density, and maintenance backlog. The one enemy every level has.
- **A-09. The Market** — spawns economic events; the antagonist of the business layer.
- **A-10. Your Own Customers** — spawns tickets, misconfigurations, sudden traffic, and abuse.
  Should be responsible for roughly as much trouble as all the hackers combined, because it's true
  and because it's funnier.

### 2.8 Hosting-type threat mixes (the variety engine, at a glance)

- **Shared web:** noisy neighbor, compromised CMS, spam, oversell, ticket storm.
- **Game servers:** booters, cheaters, DDoS-on-popularity, latency spikes, a modding community that
  is simultaneously your best marketing and your worst attack surface.
- **Backup/DR:** bit rot, tape library jams, restore failures, ransomware (of the customer, which is
  when you become a hero or a corpse).
- **CDN:** cache busting, origin overload, purge storms, regional PoP loss.
- **GPU/AI:** thermal, power, hardware theft (GPUs are money on a shelf), job squatters, crypto
  abuse under the guise of "training."
- **Colo:** tenants' own incidents, badge/tailgating, a tenant's DDoS saturating shared uplink,
  cross-connect mistakes, a customer's gear catching fire.
- **Email:** blacklisting, spammer signups, phishing hosted by you, deliverability collapse.
- **DNS:** amplification, cache poisoning, a fat-finger zone push, registrar hijack.
- **VoIP:** toll fraud, jitter, SIP scanning, regulatory (911).
- **Bulletproof:** abuse pressure, upstream de-peering, law enforcement, processor drop.
- **Dial-up era:** war dialers, busy signals, a Usenet binary flood, an IRC netsplit war.
- **Regulated:** auditors, evidence gaps, a breach-notification clock.
- **Financial colo:** fairness violations, microburst congestion, a clock-sync failure.

---

## 3. Visitors, Traffic, and Clients

### 3.1 The visitor model

**V-00. A visitor is a five-stat unit.** Everything in the game reuses these:
`Patience` (latency tolerance before bounce) · `Value` (revenue if served) · `Weight` (capacity it
consumes) · `Loyalty` (chance to return / become a customer) · `Fragility` (how badly it reacts to a
partial failure). Reskinning those five numbers is how one system covers page loads, game sessions,
backup jobs, inference requests, and a colo tenant touring the building.

**V-01. Visitors take damage from *your* stack.** They don't get shot by enemies; they get worn
down by queueing, inspection, retries, and errors. Watching your own defenses erode your customers
is the emotional core of the game and should be legible in one glance.

**V-02. Bounce is silent by default; make it loud.** Add a **Bounce Ticker** in the HUD — a running
count and dollar value of visitors lost in the last 60 seconds, broken out by cause (too slow /
blocked by you / capacity full / error). Without this the player can't learn. With it, the player
becomes an optimizer.

**V-03. Conversion Funnel as literal geometry.** The path has stages: *Arrive → Reach → Served →
Satisfied → Return → Refer*. Each stage is a place on the board where visitors can be lost, and
each has its own counter. Late-game upgrades affect specific stages, so the player can diagnose
"my problem is Reach" vs "my problem is Return."

**V-04. Returners and Referrers.** A satisfied visitor increases the next wave's size slightly; a
delighted one spawns a referral. So **good service compounds**, which means the mid-game reward for
playing well is *more pressure*. That's how you keep a strategy game from going flat once the build
is solved.

**V-05. Word of Mouth is the wave-size dial.** Reputation directly multiplies visitor spawn rate.
Reputation is affected by uptime, latency, support response, and public incidents. This makes
reputation a *resource you defend*, not a flavor stat.

**V-06. Patience is per-archetype and visible on the sprite.** A tiny hourglass or a ping number
over the visitor's head. Players should be able to look at an incoming wave and know "these are
impatient, my WAF is going to murder them."

### 3.2 Visitor/customer archetypes (generic)

- **V-07. The Casual** — high volume, low value, medium patience. Your bread.
- **V-08. The Crawler (Good Bot)** — search engine indexing. No direct revenue; its satisfaction
  feeds your *discoverability*, which feeds future wave size. Block it by accident and your traffic
  quietly decays over the next three shifts. Deliciously delayed punishment for over-aggressive WAFs.
- **V-09. The Whale** — one customer, enormous value, unreasonable Patience and demands. Their
  traffic should be visually distinct so you can prioritize it — and prioritizing it is a QoS
  decision that degrades everyone else.
- **V-10. The Tire-Kicker** — a free-trial user. Costs capacity, pays nothing, and has a conversion
  chance proportional to how fast you served them. The argument for spending money on people who
  aren't paying you yet.
- **V-11. The Reseller** — brings 50 customers at a 40% discount and is a single point of churn.
- **V-12. The Migrator** — a customer arriving *from a competitor*, carrying their old, broken
  configuration with them, which becomes your problem. Adds a liability object to your board.
- **V-13. The Evaluator** — an enterprise prospect who runs a synthetic test against you for 3
  shifts before signing. Your performance *during a specific window you can see* determines a huge
  contract. A scheduled exam.
- **V-14. The Freeloader** — hotlinks your bandwidth, uses your free tier forever. Threat/visitor
  hybrid.
- **V-15. The Community** — a forum, a Discord, a modding scene attached to your service. Generates
  free marketing, free support (reduces ticket load), and occasionally a riot.
- **V-16. The Government Contract** — a customer that is mostly paperwork, pays late, pays a lot, and
  never churns. A stability anchor with an activation cost.
- **V-17. The Ghost** — a customer who pays and uses nothing. Pure margin. Losing them to a "cleanup"
  action is a hilarious self-own the game should allow.

### 3.3 What a visitor looks like per hosting type

- **Shared web:** a page-load request; lives ~2 seconds; dozens per second.
- **Managed WP:** same, but each failure also generates a ticket.
- **Game server:** a **player** who *joins and stays for 45 minutes*, occupying a slot, and whose
  experience degrades continuously with jitter. A visitor you have to keep happy over time, not just
  serve once. Changes the whole rhythm of a level.
- **VoIP:** a call — like a player but more fragile, and the failure is audible.
- **Backup:** a **job** — arrives on a schedule, takes hours, must not be interrupted, and its value
  is only realized at restore time.
- **CDN:** a torrent of tiny requests rendered as flow, where the interesting unit is a *cache miss*
  travelling back to origin.
- **GPU/AI:** an **inference request** (small, latency-critical, high value) or a **training job**
  (enormous, long, tolerant, pays like a whale).
- **Object storage:** a PUT (costs you) and a GET (pays you) — two visitor types with opposite
  economics moving in opposite directions. Visually lovely.
- **DNS:** near-invisible motes; you see them only in aggregate as a pressure gauge.
- **Email:** a message that must *leave* successfully; the destination judges you.
- **Colo:** a **person** — a tenant's engineer badging in, walking your floor, doing something to
  their own gear that you can only watch. A visitor that is also a risk.
- **Colo sales:** a **tour** — a prospect who walks a route through your facility and scores what
  they see. Your board's *tidiness* becomes a stat.
- **Dial-up:** a modem call seizing a port, with a busy signal as the bounce.
- **Streaming:** a viewer who tolerates exactly two buffer events.
- **HPC:** a submitted job with a deadline, in a queue you schedule.
- **Satellite:** a scheduled pass — a visitor with an appointment.
- **Crypto:** a tenant whose "traffic" is just power draw; the visitor concept nearly vanishes and
  the level becomes pure facility management. Good deliberate contrast.

### 3.4 Attraction — what the player actively does to win visitors

These are **the offensive half of the game**, and they deserve as much design love as the towers.

- **V-18. Marketing Spend** — a slider converting cash into spawn rate for N shifts. The simplest
  lever, with the classic trap: marketing into insufficient capacity = mass bounce = reputation
  damage. **Advertising is a self-inflicted DDoS if you're not ready.** Teach this in level 2.
- **V-19. SEO / Discoverability Structure** — a buildable that slowly raises organic spawn rate and
  is *damaged by downtime* (search rankings decay when you're unreachable). Long-term investment that
  punishes instability retroactively.
- **V-20. The Listing** — appearing in a public directory (server browser, marketplace, hosting
  review site, DNS anycast peering list). Instantly raises visitors *and* makes you discoverable to
  attackers. The purest expression of the brief's "more capability, more surface" rule.
- **V-21. Peering / Interconnect** — physically shortening the path to a population. Lowers latency
  (raises conversion), costs capital, and creates a new ingress you must defend.
- **V-22. Free Tier** — spawns Tire-Kickers at a cost. Conversion rate is a tunable you improve with
  onboarding upgrades.
- **V-23. Referral Program** — multiplies the Refer stage of the funnel; costs margin.
- **V-24. Status Page & Transparency** — publishing incidents honestly *reduces* reputation damage
  from an outage but *increases* the visibility of small ones. A genuine tone-setting choice.
- **V-25. The Uptime Badge** — advertise your SLA to attract enterprise visitors; now you're
  contractually liable for it. Opt-in difficulty with a revenue reward. Best kind of unlock.
- **V-26. Content Marketing / The Blog** — a slow-burn cheap attractor run by a staff member; also
  occasionally attracts a Researcher (good) or a Journalist (dice roll).
- **V-27. Conference Booth** — a one-shot spend that spawns a burst of Evaluators. Seasonal.
- **V-28. Price Cut** — raises spawn rate and lowers Value per visitor, and is **hard to reverse**
  (existing customers churn on increases). A ratchet the player can trap themselves in.
- **V-29. Migration Assistance** — an active ability aimed at a competitor's customers; costs staff
  hours, steals visitors from a rival's board. The only directly *aggressive* business action, and it
  should feel great.
- **V-30. Reputation Recovery Actions** — post-incident: a postmortem (costs staff hours, recovers
  reputation, and *unlocks a tech* — see §5), a credit (costs money), or silence (free, risky).
- **V-31. Anchor Tenant** — landing one famous customer raises the conversion rate of every future
  Evaluator. A logo is a stat.

### 3.5 Churn

- **V-32. Churn is a per-customer meter, not a dice roll.** Each customer has a Satisfaction bar
  that drains from incidents, slow support, and price increases, and refills from clean shifts and
  proactive contact. When it empties they give notice — **with a warning shift** where you can
  intervene (a save action: discount, credit, a call). Churn you can fight is far better than churn
  that just happens.
- **V-33. Churn is contagious.** A departed customer in a tight-knit community (game hosting, a
  niche vertical) raises churn risk for neighbors. Makes reputation feel networked.
- **V-34. Involuntary Churn** — their card expires. Costs you real money for no reason at all, is
  fixable with a dunning-process upgrade, and is exactly the kind of unglamorous problem that makes
  players feel like they're running a business.

---

## 4. Buildables: Services and Infrastructure

Card format used below: **Name** — role · rough cost shape · connects to · **Surface** (the new risk).

### 4.1 Compute

- **BL-01. Shared Web Node** — many small customers, one box. Cheap, high margin, fragile.
  Connects: LB, DB, storage. **Surface:** noisy neighbor, compromised CMS, one breach = all breached.
- **BL-02. VPS Host** — slices of a box sold as isolated machines. Higher price, isolation upgrades.
  **Surface:** oversell, hypervisor escape (rare, catastrophic), abusive tenants.
- **BL-03. Dedicated Server** — one customer, one box, high revenue, zero control over what they run.
  **Surface:** your customer's software is now your uptime problem and your abuse problem.
- **BL-04. Container Node / Scheduler** — density, elasticity, and a control plane.
  **Surface:** control-plane SPOF, autoscale-into-bankruptcy, image supply chain.
- **BL-05. GPU Node** — enormous revenue per U, enormous watts, theft-worthy.
  **Surface:** thermal, power, physical theft, "training" that is actually mining.
- **BL-06. Serverless Pool** — no idle cost, cold starts add latency, billed per invocation.
  **Surface:** a loop in a customer's function costs you or them a fortune in seconds.
- **BL-07. Batch/HPC Scheduler** — turns idle capacity into revenue by backfilling jobs.
  **Surface:** priority inversion at the worst moment; a job that won't checkpoint.
- **BL-08. Spare Capacity Pool ("the bench")** — deliberately idle machines. Costs money, buys you
  reaction speed during a spike. The game should make players feel smart for owning nothing.

### 4.2 Data

- **BL-09. Database Server** — the canonical example from the brief. Raises what every front-end can
  sell. **Surface:** SQLi, slow queries, connection exhaustion, the single hardest thing to replace.
- **BL-10. Read Replica** — capacity for reads, introduces **replication lag** as a visible
  travelling object and a whole class of "stale data" complaints.
- **BL-11. Cache Layer (Redis/memcache-alike)** — enormous latency and capacity win.
  **Surface:** cache stampede on expiry, amplification if exposed, and **the cliff** — when the cache
  dies, the DB takes 100% of load instantly and everything falls over. Great dramatic failure.
- **BL-12. Object Store** — cheap durable bulk. **Surface:** egress cost, public-bucket misconfig.
- **BL-13. NAS/SAN** — shared storage, convenient, and a glorious single point of failure.
- **BL-14. Tape Library / Vault** — cheapest durability, slowest restore, physically stealable,
  jams. The backup-level star.
- **BL-15. Backup Orchestrator** — schedules jobs; without a **Restore Test** upgrade its backups are
  Schrödinger's backups and the game should absolutely let them be worthless.
- **BL-16. Erasure Coding Upgrade** — durability per dollar, at a CPU and rebuild-time cost.
- **BL-17. Snapshot Layer** — cheap rollback; the counter to bad deploys and ransomware; consumes
  storage continuously.

### 4.3 Network

- **BL-18. Switch / Top-of-Rack** — connects things; oversubscription ratio is a tunable.
- **BL-19. Router / Edge** — where your policy lives.
- **BL-20. Load Balancer** — distributes, health-checks, terminates TLS. **Surface:** SPOF unless
  paired; health checks that flap and eject healthy nodes (a self-inflicted outage with a great name).
- **BL-21. Reverse Proxy / Cache Edge** — latency win + a place to put defenses.
- **BL-22. Transit Circuit (per carrier)** — bandwidth and reachability. Second carrier = redundancy
  with a permanent idle cost.
- **BL-23. IX Port / Peering** — cheaper and faster to specific populations. Politics minigame
  optional (peering disputes as an event).
- **BL-24. Anycast Announcement** — global presence, absorbs volumetric attacks by spreading them.
  **Surface:** a config mistake is global and instant.
- **BL-25. Private Interconnect / Cross-Connect** — the colo landlord's best product: near-zero
  marginal cost, recurring revenue, and it locks tenants in (raises their switching cost, lowers
  churn). Best business object in the game.
- **BL-26. IP Address Blocks** — a *finite, purchasable, reputation-bearing* resource. Segregate your
  spammy customers onto a separate block or watch your good block burn.
- **BL-27. Out-of-Band Management Network** — lets you fix things when the main network is down.
  Invisible value until the one night it saves the level. **Surface:** if exposed, it's the keys to
  the kingdom.

### 4.4 Defense (all of these have a Suspicion Dial, §0.2)

- **BL-28. Firewall** — coarse, cheap, fast, dumb.
- **BL-29. WAF** — inspects application traffic. Real damage to real attacks, real false positives on
  real customers, real latency. The archetypal Suspicion Dial object.
- **BL-30. Rate Limiter** — per-IP/per-key. Cheap. Catastrophic against NAT'd legitimate populations
  (an office, a school, a country) — the game should demonstrate this with a specific customer.
- **BL-31. Scrubbing Center (upstream)** — handles volumetric; costs a retainer or per-event fee;
  adds latency while engaged. **The always-on vs on-demand choice** is one of the best purchases in
  the game: always-on is safe and slow and expensive; on-demand is cheap but has an activation delay
  during which you're down.
- **BL-32. IDS/IPS** — detection vs. prevention as two separate modes with different failure costs.
- **BL-33. Bot Manager / CAPTCHA** — converts an attack into *friction*, which converts into bounce.
  Explicitly trades visitors for safety, with a number.
- **BL-34. MFA / Auth Hardening** — reduces credential stuffing, increases customer friction and
  support tickets.
- **BL-35. Segmentation / VLAN Policy** — no immediate benefit; caps blast radius later. The purest
  "insurance" buildable.
- **BL-36. Honeypot** — attracts and identifies attackers, generates intel (which is a currency, see
  §5), and occasionally attracts *more* attention. Risk/reward defense.
- **BL-37. Tarpit** — slows attackers down, consuming *their* resources. A tower that does no damage
  but buys time. TDs need more of these.
- **BL-38. Egress Filter** — stops your compromised boxes from being useful to attackers and stops
  amplification. Cheap, boring, saves you from the worst outcomes.
- **BL-39. Log Aggregator / SIEM** — no defense at all; it's the **fog-of-war remover**. Without it,
  threats are invisible until they do damage. With it, they're telegraphed. Directly converts money
  into *information*, which is the most underrated TD currency.
- **BL-40. Immutable Rebuild Pipeline** — lets you re-create any compromised node from scratch in
  seconds. The counter to persistence (TH-15). Expensive, requires discipline upgrades.

### 4.5 Facility

- **BL-41. Rack / Cabinet** — the placement grid itself; has U capacity, a power budget, and a
  thermal profile.
- **BL-42. PDU** — power distribution with a real amperage limit you can trip. A/B feeds as a choice.
- **BL-43. UPS** — bridges seconds-to-minutes. Batteries age; a neglected UPS fails *when used*.
- **BL-44. Generator** — bridges hours-to-days, needs fuel, needs testing (TH-34).
- **BL-45. Fuel Tank / Contract** — capacity and a delivery SLA that is worthless in a regional event.
- **BL-46. CRAC / Chiller / Containment** — cooling as a placement-shaped resource. Hot aisle / cold
  aisle containment as a *layout bonus*, which makes tidy building mechanically rewarded.
- **BL-47. Blanking Panels** — trivially cheap, small thermal bonus. The "free win if you're tidy"
  object that teaches players the layout system matters.
- **BL-48. Fire Suppression** — prevents catastrophe, occasionally causes damage on discharge.
- **BL-49. Physical Security (badge, mantrap, cameras, guard)** — required for regulated and colo
  levels; counters tailgating and theft; costs opex and slows *your own* staff down slightly.
- **BL-50. Meet-Me Room** — the colo landlord's monetizable chokepoint.
- **BL-51. Loading Dock / Staging** — affects how fast you can deploy new hardware. A logistics
  bottleneck that turns money into capacity at a rate you can upgrade.
- **BL-52. Spares Cabinet** — pre-purchased replacement parts. Turns a multi-shift outage into a
  20-minute one. Ties up cash. The inventory-vs-cash decision, cleanly.
- **BL-53. Cable Management** — pure aesthetic, small maintenance-speed bonus, and a **tour score**
  bonus (M-08). Making neatness pay is very funny and very true.

### 4.6 People

- **BL-54. Support Tech** — clears tickets. Ticket queue is a lane; unserved tickets become churn.
- **BL-55. Sysadmin / SRE** — executes maintenance, reduces Fat Finger odds, enables runbooks.
- **BL-56. Network Engineer** — unlocks peering, BGP actions, and faster incident diagnosis.
- **BL-57. Security Analyst** — turns SIEM data into *early warnings* (threat pre-telegraphs).
- **BL-58. Sales** — raises conversion of Evaluators; can oversell capacity you don't have, which is
  a *threat your own employee generates*. Delightful.
- **BL-59. Account Manager** — slows churn on the accounts they cover; there are never enough.
- **BL-60. Remote Hands (rented)** — in colo levels, the only way to touch hardware; billed per
  incident, arrives with a delay, and occasionally does the wrong thing.
- **BL-61. The On-Call Rotation** — a *system*, not a person: determines your response latency at
  night. Understaffed rotations burn Morale, and burned-out staff generate TH-19 and TH-20.
- **BL-62. Morale** — a per-staff meter drained by night incidents and drained hard by repeated
  ones. Refilled by clean shifts, hiring, raises, and *fixing the thing that keeps paging them*.
  Makes "stop the bleeding" an actual mechanical priority.
- **BL-63. Training / Certification** — staff upgrade paths; also a prerequisite for compliance.
- **BL-64. The Legend** — a rare hireable with a unique passive (e.g. "Greybeard: hardware failures
  are telegraphed one shift early"). Hero units for a TD, one or two per campaign.

### 4.7 Software, policy, and process (non-physical buildables)

I want a whole build category that occupies no space and costs staff-time instead of money, so the
player has two parallel economies to spend in.

- **BL-65. Monitoring & Alerting** — converts silent failures into visible ones.
- **BL-66. Runbook** — reduces the time and error rate of a specific response. Written *after* an
  incident (see §5 discovery).
- **BL-67. Change Review** — reduces Fat Finger odds, increases the time cost of every build.
  A direct pacing tax the player chooses to pay.
- **BL-68. Capacity Planning** — shows you future demand curves. Information as a purchase.
- **BL-69. Auto-Scaling Policy** — reacts to load; can be gamed by Pulse Wave (TH-06); costs money
  when it over-reacts.
- **BL-70. Load Shedding Policy** — deliberately drop the least valuable traffic to save the rest.
  **Should be an unlock the player is thrilled to get**, because it converts a loss into a choice.
- **BL-71. Graceful Degradation** — serve a static/cheap version when overloaded. Half revenue beats
  zero revenue.
- **BL-72. Backpressure / Queueing** — hold visitors in a waiting room rather than failing them.
  Trades Patience for Capacity, explicitly. Best-in-genre mechanic, straight from real life.
- **BL-73. Circuit Breaker** — stop calling a failing dependency so it can recover, and so its
  failure doesn't cascade. Visually excellent (a link that trips open and glows).
- **BL-74. Blue/Green Deploy** — safe changes at double cost.
- **BL-75. Canary** — expose 5% of visitors to a change. Cheap safety with a small guaranteed loss.
- **BL-76. Terms of Service / AUP** — a *policy* that lets you remove abusive customers without a
  penalty. Without it, firing a customer costs you money and reputation.
- **BL-77. SLA Tier Definition** — you author the SLA you sell: higher promises attract better
  customers and carry bigger penalties. The player sets their own difficulty and their own reward.
- **BL-78. Insurance** — pay a premium to cap catastrophic downside. Boring, correct, and a great
  late-game "I'm scaling now" purchase.
- **BL-79. Compliance Package** — unlocks regulated customers; imposes permanent process overhead.
- **BL-80. Documentation** — reduces the knowledge lost when staff leave; required for audits;
  produced by staff-time; decays if not maintained. A resource that *rots*.

---

## 5. Unlocks and Discovery

### 5.1 Discovery philosophy

**U-00. You learn by getting hurt, and the game says so.** The primary unlock currency is
**Insight**, earned from *incidents you survive and analyze*, not from cash. A postmortem after an
outage costs staff-hours and grants the tech that would have prevented it. This makes failure
generative, makes players want to poke at danger, and gives a beautiful narrative shape: your tech
tree is a scar map.

**U-01. Three unlock currencies, three feelings.**
- **Insight** (from incidents & postmortems) → defensive/architectural tech.
- **Revenue Milestones** (from scale) → bigger, faster, more expensive things.
- **Relationships** (from customers, vendors, peers, researchers) → business lines, discounts,
  hero staff, and intel.
Three tracks means no single dominant strategy and three different reasons to be excited.

**U-02. Discovery, not just purchase.** Some things aren't on a menu — you *find* them. Hover over
an unexplained log line; investigate; discover a technique. A small "hmm, what's this?" loop with an
investigate action makes the tech tree feel excavated rather than shopped.

**U-03. The tree is shared; the loadout is per-type.** All hosting types draw from one tech tree, but
each type has a **Loadout** of 8-12 buildables available at start. Unlocking "Anycast" in a DNS level
means you *have* it forever — it just isn't in the shared-hosting loadout until you unlock the
crossover node. This is the anti-fragmentation mechanism: variety without 14 separate progressions.

**U-04. Crossover Nodes** — the most satisfying unlocks are the ones that carry a lesson between
business types. "You learned rate-limiting in DNS; now it's available on your game servers."
Explicitly call these out in the UI as "Transferred Knowledge." Makes the campaign feel cumulative.

### 5.2 Concrete unlock triggers (action → reward)

- **U-05.** Survive your first DDoS → unlock **Scrubbing Retainer** and the Threat Intel panel.
- **U-06.** Suffer a breach and do a postmortem → unlock **Segmentation** and **Immutable Rebuild**.
- **U-07.** Lose data with no good backup → unlock **Restore Testing** (and a permanent, visible
  memorial entry in your company history, because shame is a great teacher).
- **U-08.** Serve 1M requests in one shift → unlock **Cache Layer** and **CDN business line**.
- **U-09.** Run a generator load test 3 times → unlock **Tier III Facility** rating, which unlocks
  enterprise customers.
- **U-10.** Keep 99.99% for a full quarter → unlock the **Uptime Badge** (V-25) and premium pricing.
- **U-11.** Fire an abusive customer → unlock **AUP Enforcement** and the Abuse Desk.
- **U-12.** Handle a Researcher (TH-25) well → unlock **Bug Bounty**, a permanent passive that
  pre-telegraphs one exploit class per level.
- **U-13.** Pass an audit → unlock **Regulated Hosting** business line + a certification badge that
  raises Evaluator conversion.
- **U-14.** Peer at an IX → unlock **Anycast** and the world map layer.
- **U-15.** Hit 100 customers → unlock **Automation** tier (policies that act without you).
- **U-16.** Hit 1,000 customers → unlock **Self-Service Portal**, which cuts ticket volume 40% and
  introduces a new attack surface (the portal itself).
- **U-17.** Survive a full power outage on generator → unlock **Fuel Contract** and **2N** designs.
- **U-18.** Have a customer's ransomware event → unlock **Immutable/Air-Gapped Backup** line of
  business (turn your trauma into a product — extremely true to life).
- **U-19.** Overheat a rack → unlock **Thermal Modeling** overlay (an information upgrade).
- **U-20.** Run out of IPv4 → unlock **IPv6** and **CGNAT**, each with distinct downsides.
- **U-21.** Get blacklisted once → unlock **Outbound Filtering** and **IP Segregation**.
- **U-22.** Have a staff member quit → unlock **Documentation** and **On-Call Rotation** tuning.
- **U-23.** Win a bidding war against The Competitor → unlock intel on their board.
- **U-24.** Accept a bad customer and survive → unlock **Risk Pricing** (charge more for danger),
  which is the gateway to the Bulletproof line.
- **U-25.** Complete a no-downtime migration → unlock **Live Migration** ability, usable in all
  future levels. A verb unlock, not a number unlock — always better.

### 5.3 Business-line unlocks (new hosting types as rewards)

Each is a **node on the Pivot Map (L-07)** with an entry cost, a prerequisite, and a change to the
rules. Framing them as unlocks makes type-swapping feel *earned* rather than imposed.

- **U-26. VPS** ← from shared hosting, needs virtualization tech + 50 customers.
- **U-27. Managed Apps** ← needs Support staff tier 2; doubles revenue per customer and triples
  ticket volume.
- **U-28. Game Hosting** ← needs low-latency network + a community relationship.
- **U-29. CDN** ← needs peering + multi-site.
- **U-30. Backup/DR** ← needs storage tech + a trauma (U-07 or U-18).
- **U-31. Colo Landlord** ← needs your own facility + physical security. **Changes the game's core
  loop** (you stop controlling the servers), which is the most dramatic unlock available and should
  be a mid-campaign act break.
- **U-32. GPU/AI Compute** ← needs power + cooling headroom + capital. Highest revenue, highest
  volatility.
- **U-33. Email/DNS** ← cheap entry, reputational minefield; unlocks the Reputation subsystem.
- **U-34. Bulletproof** ← a *choice*, not a reward: taints your reputation with legitimate customers
  while opening an enormous revenue stream. Should have a visible, permanent campaign consequence.
- **U-35. Regulated** ← the mirror of Bulletproof: slow, expensive, safe, prestigious.
- **U-36. Wholesale / Build-to-Suit** ← endgame: you build capacity for hyperscalers, one customer
  per building, and the entire game becomes construction and contracts.

### 5.4 Tech tree shapes worth stealing

- **U-37. The Three Pillars** — *Serve* (capacity, speed, features), *Survive* (defense, redundancy,
  process), *Sell* (marketing, pricing, contracts, support). Every node belongs to one. Players who
  neglect a pillar fail in a specific, diagnosable way, which teaches better than a generic loss.
- **U-38. Mutually Exclusive Doctrines** — pick one per campaign act:
  *Fortress* (max defense, high latency, enterprise customers) vs *Racetrack* (min latency, thin
  defense, consumer volume) vs *Sprawl* (many small cheap sites, no single failure matters).
  Locks in identity, drives replay.
- **U-39. Vendor Relationships** — pick a hardware vendor; get discounts, and eat their EOL and
  their recalls. A tech tree made of partnerships rather than technologies.
- **U-40. The Regret Node** — some techs can only be unlocked *after* the disaster they prevent.
  The game explicitly calls the category "Things We Learned The Hard Way."
- **U-41. Retired Tech** — old unlocks become obsolete each Act (L-11's Ratchet), so the tree keeps
  moving rather than accreting. Prevents the late-game "I have everything" flatline.

---

## 6. Economy, Money, and Scoring

### 6.1 Money model

**E-01. Three money states, and they diverge.**
- **Cash** — what you can spend right now.
- **MRR** — recurring revenue, your score's backbone, changes slowly.
- **Receivables** — invoiced, unpaid. Real revenue you can't spend yet.
The classic bankruptcy in this industry is *profitable and out of cash*, and the game should let you
do exactly that. A growth-driven cash crunch is more interesting than any combat loss.

**E-02. Capex vs Opex.** Buying a server is a lump sum; leasing it is a monthly. Early game favors
leasing (cash-poor), late game favors buying (margin). Add **Financing** with an interest rate and
a covenant that trips if your uptime falls — debt as a risk multiplier.

**E-03. Depreciation & Aging.** Hardware has an age stat. Older gear = higher failure rate, lower
efficiency, lower resale. Creates a **refresh cycle** rhythm across a long campaign, and makes the
"absorb junk hardware" scenario (L-30) mechanically meaningful.

**E-04. Utilization is the margin dial.** Revenue is roughly (customers served) × price. Cost is
roughly (capacity owned) × upkeep. So **profit = utilization**, and utilization is the enemy of
headroom, and headroom is the enemy of outages. One equation, endless tension. Show a live
utilization gauge with a green "efficient" band and a red "you have no room to breathe" band.

**E-05. Oversell as an explicit, tempting button.** Sell 130% of your capacity. Works fine at
average load. Catastrophic at peak. Should be *profitable in expectation* and *ruinous in variance*
— the single best gambling mechanic the theme offers.

### 6.2 Revenue streams (differ wildly by hosting type)

- **E-06. Per-seat recurring** (shared, VPS, managed) — predictable, low, churn-sensitive.
- **E-07. Per-resource metered** (bandwidth, GPU-hours, storage-GB, egress) — scales with success,
  spikes with abuse.
- **E-08. Per-slot** (game servers, modem ports) — capacity-bound, simple, very readable.
- **E-09. Long-term contract** (colo, wholesale) — huge, slow, lumpy, low churn, and a *cliff* at
  renewal time. Renewal negotiations as scheduled events.
- **E-10. Cross-connect & remote-hands fees** (colo) — tiny amounts, near-zero cost, enormous
  aggregate margin. The "passive income" object.
- **E-11. Setup / one-time fees** — cash-flow smoothing for the early game.
- **E-12. Overage billing** — profitable and the leading cause of angry customers. A direct
  money-vs-reputation trade, per incident.
- **E-13. Professional services / migration fees** — turn staff hours into cash; competes with the
  staff hours you need for stability.
- **E-14. Reselling upstream** (transit, licenses, SSL, domains) — thin margin, no risk, fills gaps.
- **E-15. Risk premium** (bulletproof, grey-area) — 5-10× normal rate, with an abuse-pressure cost.
- **E-16. Spot/preemptible pricing** — sell idle capacity cheaply with the right to reclaim it.
  Converts your safety margin into money, which is exactly the trap the game wants you to consider.

### 6.3 Costs

- **E-17. Power** — per kW, with a *demand charge* based on your single highest peak of the month.
  One bad spike sets your bill for 30 days. A fantastic, real, and cruel mechanic.
- **E-18. Cooling** — a multiplier on power; efficiency (PUE) is an upgradeable stat that shows up
  as a visible percentage the player can brag about.
- **E-19. Bandwidth** — 95th-percentile billing: **your five worst percent of minutes are free.**
  Which means a short DDoS costs nothing but a sustained one is ruinous. An actual strategic detail
  that changes how you respond to attacks.
- **E-20. Space/Rent** — per U or per cabinet or per square foot; in colo levels, this is what you
  *sell*, so the economy inverts.
- **E-21. Licenses** — per-core, per-socket, per-instance. A cost that punishes exactly the upgrade
  you wanted.
- **E-22. Staff** — the biggest opex, and the one that produces *time*, the other currency.
- **E-23. SLA Credits** — downtime converted to refunds. The bridge between the defense game and
  the money game.
- **E-24. Abuse handling** — every complaint consumes staff time; grey-area business is expensive
  in ways the revenue number doesn't show.
- **E-25. Hardware failure replacement** — scales with fleet size and age.
- **E-26. The Truck Roll** — any physical action has a cost and a delay. In remote colo levels, this
  dominates.

### 6.4 Pricing as gameplay

- **E-27. The Price Slider, with hysteresis.** Raising prices churns existing customers and lowers
  spawn rate; lowering does the reverse and is hard to undo. Model the asymmetry explicitly — it's
  the reason real operators agonize, and it makes the decision weighty.
- **E-28. Segmented Pricing** — different rates per customer archetype. Charge the Whale less per
  unit, charge the risky customer more. A small optimization layer for players who like it.
- **E-29. Grandfathering** — old customers keep old prices forever unless you spend reputation to
  migrate them. Legacy debt with a dollar sign.
- **E-30. The Unit Economics Card** — every customer type shows revenue, cost-to-serve, and support
  load, so the player can discover that their most popular plan loses money. That discovery moment
  is worth a whole level.
- **E-31. Commit Discounts** — lower price for a longer contract. Trades margin for churn immunity.
  Exactly the right decision to offer before a level you know will be rough.

### 6.5 Scoring, win/lose

- **E-32. The Quarterly Review** (end-of-level screen) scores five axes, each with a letter grade:
  **Uptime** (error budget remaining) · **Growth** (MRR delta) · **Margin** (profit %) ·
  **Reputation** (public score) · **Resilience** (a simulated stress test run against your final
  board — *you are graded on the disaster that didn't happen*). That last one is the key: it rewards
  investments that never got used, which is the only way to make defensive play feel good.
- **E-33. Star rating per level** from the composite, with clearly stated thresholds, plus
  **medals** for specific feats ("no SLA credits paid", "never oversold", "fired zero customers",
  "survived on one carrier").
- **E-34. Lose conditions, plural and distinct:**
  (a) **Insolvency** — cash < 0 for N shifts.
  (b) **Mass churn** — customers below threshold.
  (c) **Reputation collapse** — visitor spawn approaches zero; you can't sell your way out.
  (d) **Loss of license** — regulator or upstream terminates you (bulletproof/regulated levels).
  (e) **Catastrophic data loss** — instant fail in backup/regulated contexts.
  Different lose conditions per level type keep each business feeling like it has its own stakes.
- **E-35. The Death Spiral is visible.** When two negative loops are reinforcing, the HUD draws the
  loop explicitly ("Outage → Credits → No cash → No fix → Outage"). Players should be able to *see*
  they're spiraling in time to break it with a drastic action (fire customers, take a loan, shed a
  business line). A losing game you can fight is worth more than a losing game you can only watch.
- **E-36. Scored Retreats.** Shedding a business line, firing a whale, or declaring a maintenance
  outage on purpose should all be *legitimate scored strategies*, not admissions of failure. Give
  medals for well-executed retreats.
- **E-37. Company Valuation** — the meta-score across the campaign: MRR × a multiple modified by
  churn, margin, concentration risk, and reputation. The endgame is an acquisition offer whose size
  is your final score, and you may **refuse it** and keep playing endless.
- **E-38. Concentration Risk Penalty** — if one customer or one business line is >40% of revenue,
  valuation takes a hit and a targeted disaster becomes likelier. Encourages portfolio play.

---

## 7. Core Gameplay Mechanics

### 7.1 The universal verb set (what keeps 20 hosting types one game)

**G-00. Eight verbs, everywhere:** `PLACE` · `LINK` · `TUNE` (aggression / QoS / pricing sliders) ·
`SCALE` (add or shed capacity) · `SHIELD` (temporary defensive ability) · `INVESTIGATE` (spend
attention to reveal) · `MAINTAIN` (spend time to reduce future risk) · `SELL` (acquire / price /
retain). Every hosting type uses all eight; the types differ in which ones are *scarce* and which
are *decisive*. That's the whole anti-fragmentation thesis in one line.

### 7.2 Board and pathing

- **G-01. The board is a topology, not a maze.** Visitors don't wander; they follow the graph you
  wired. Placement matters because of *capacity, adjacency (thermal/power), and position in the
  path*, not because of maze-building. Resist the urge to make this a maze game — the theme's
  tension is filtration, not routing length.
- **G-02. ...but routing is still a choice.** Multiple ingress paths (carriers, PoPs, regions) with
  different latency, cost, and defense, and a **traffic-steering** control that splits percentages.
  Steering under attack is a real-time decision with real-time consequences.
- **G-03. Lanes** — traffic is grouped into lanes by service (web / mail / game / storage / mgmt).
  Defenses apply per-lane. A threat in one lane can spill into another only through shared
  resources (bandwidth, power, CPU), which makes **isolation** a visible, purchasable property.
- **G-04. Two Boards, Two Scales.** A **Rack View** (physical: U-space, power, heat, cables) and a
  **Topology View** (logical: services, links, flows). Toggling between them is the core navigation.
  Placement happens in Rack View, wiring happens in Topology View, and the *disagreements between
  them* (two "redundant" nodes sharing one PDU) are where the best gotchas live.
- **G-05. Blast Radius Overlay** — hover any component; the board dims except what dies with it.
  One hover answers "how bad is this?" This should be the most-used button in the game.

### 7.3 The connection interaction (asked for explicitly, so here are options and a recommendation)

- **G-06. Drag-a-Cable (recommended for Rack View).** Click a port, drag, drop on a port. The cable
  renders as a physical run with slack, colored by function (blue = data, red = power, yellow = OOB,
  green = storage). Ports are finite. Invalid drops show a red X with a one-line reason ("no free
  port", "wrong speed"). **Tactile, teaches port scarcity, and produces beautiful spaghetti that the
  Cable Management buildable (BL-53) then lets you tidy for a score bonus.**
- **G-07. Click-to-Link (recommended for Topology View).** Click source, click target; a labeled
  arrow appears with the relationship type auto-inferred ("web → db: 200 conns"). Fast, precise,
  scale-friendly. Rack View is for feeling, Topology View is for thinking.
- **G-08. Wiring Mode** — hold a key (or press W) to dim everything except ports and links. Prevents
  accidental drags during combat and makes a busy board legible. Also a natural place for a
  **link-health heat map**.
- **G-09. Adjacency Auto-Link** — for the early tutorial levels only: drop a DB next to a web server
  and they connect automatically with a little handshake animation. Trains the concept before
  introducing the cost of doing it manually. Later levels turn it off and the player feels growth.
- **G-10. Link Objects Are First-Class.** A link has: bandwidth, latency, current utilization, a
  health state, and *its own upgrades* (encryption, compression, connection pooling, circuit
  breaker). You can click a *wire* and buy something. This makes the connective tissue part of the
  build, not just decoration.
- **G-11. Link Visual Language.** Idle = thin, dim. Healthy traffic = flowing dashes at a speed
  proportional to throughput. Saturated = thick, pulsing amber. Failing = red, dashed, intermittent.
  Tripped circuit breaker = a visible gap with an arc symbol. Encrypted = a subtle braided texture.
  **You should be able to diagnose a board from across the room by link appearance alone.**
- **G-12. Templates / Blueprints.** Save a wired cluster as a stamp and re-place it. Essential once
  boards get big; also a lovely progression reward ("you've done this enough times to standardize").
  Blueprints can be *bad* — a flaw you standardized on propagates everywhere. Excellent.
- **G-13. Dependency Auto-Discovery** — in inherited-board scenarios (L-30), links are hidden until
  you run INVESTIGATE on a node. Fog of war over your own topology.

### 7.4 Time, attention, and action economy

- **G-14. Attention is the real resource.** The player has a limited number of **manual
  interventions** per Peak (represented as on-call capacity / staff availability). Everything else
  must be handled by things you built. This is the mechanism that pushes players from micro to
  systems as the game scales, which is exactly the arc a strategy game wants.
- **G-15. Incident Mode.** When something big breaks, the game shifts: a timer starts, a checklist
  appears, and you take triage actions (isolate / failover / roll back / communicate / escalate).
  Slower time, higher stakes, different verb set. A mini-game that breaks up the build/wave rhythm.
- **G-16. Communicate is an action.** Posting a status update during an incident costs time and
  *reduces reputation damage*. Forcing the player to choose between fixing it and telling people
  about it is painfully accurate and mechanically great.
- **G-17. The Pager.** Incidents at night interrupt the Business Day phase. Handling them costs
  staff Morale. Ignoring them costs uptime. **Auto-remediation** unlocks let you sleep.
- **G-18. Speed Controls with a twist:** pause is free and full-featured (this is a thinking game),
  but **fast-forward is only available when nothing is in an alert state.** The game literally will
  not let you skip past a problem. Elegant, and it enforces engagement without nagging.
- **G-19. Pre-authorized Changes.** During the Business Day you can queue a change to execute
  automatically at a trigger ("if p95 > 200ms, add two nodes"). Turns planning into a buildable.
- **G-20. The Maintenance Window.** A scheduled, announced outage. Costs a small reputation hit and
  zero SLA penalty; lets you do risky work safely. Scheduling it well is a skill.

### 7.5 Combat resolution (what actually happens when a threat meets a defense)

- **G-21. Threats are units with `Volume`, `Sophistication`, `Signature`, and `Persistence`.**
  Defenses reduce Volume (capacity-based, like scrubbing), or test Signature (classification-based,
  like a WAF), or raise the cost of Persistence (like a tarpit). Three distinct counter-axes means
  three distinct defensive builds, and a threat that beats one may be stopped by another.
- **G-22. Classification Rolls, shown honestly.** When a WAF inspects, it rolls against the threat's
  Sophistication and its own aggression setting. Results float as text: BLOCKED / MISSED /
  **FALSE POSITIVE** (in your customer's color, because that one hurts).
- **G-23. Saturation, not HP.** Structures don't lose hit points; they lose **headroom**. At 100%
  they queue, at 120% they shed, at 150% they fall over and take a recovery time. Failure is a state
  with a duration, not a death. Everything can come back, which suits a business sim.
- **G-24. Cascades.** When a node fails, its dependents inherit the load. Whether that cascades is
  determined by circuit breakers, capacity headroom, and timeouts — i.e. by things the player chose.
  A cascade should be visually spectacular and *replayable in the post-mortem*.
- **G-25. Partial Service.** The interesting middle state: you're up, but slow; up, but read-only;
  up, but degraded. Each state has a revenue multiplier and a reputation drip. **Most of the game
  should be spent in the middle states**, not in binary up/down.
- **G-26. Active Abilities (cooldowns).** Emergency Cache Freeze · Null-route a prefix (stops the
  attack, also kills those customers) · Divert to scrubbing · Failover region · Enable Under-Attack
  Mode (everyone gets a CAPTCHA; visitors halve; threats drop 90%) · Call the upstream NOC (a
  request with a wait time). Each is a big red button with a real cost — the "spell" layer of the TD.
- **G-27. Null-route is the game's hardest button.** It *always* works and it *always* costs you the
  customer you're protecting. Offering a guaranteed-but-terrible answer is what makes all the
  nuanced answers feel valuable.

### 7.6 Failure states and recovery

- **G-28. Recovery is gameplay.** Bringing things back has an order of operations (power → network →
  storage → DB → app), a dependency graph, and a **thundering herd** at the end where every queued
  client hits you at once. Restarting badly is its own failure. This makes the post-disaster ten
  minutes as engaging as the disaster.
- **G-29. Data loss is permanent.** Downtime is recoverable; lost data is not. Keep exactly one
  irreversible damage type so the player has something to actually fear.
- **G-30. The Post-Mortem Screen.** After any major incident: a timeline replay, a contributing-
  factors list, and **one Insight point** plus a choice of which lesson to formalize into a runbook
  or a tech unlock. Converts failure into progression (see §5) and is the single best place to put
  the game's teaching.

---

## 8. Visuals and Presentation

*(Lens caveat: I'm a designer, not an artist — these are readability-and-feel notes, aimed at making
the mechanics above legible at speed.)*

- **VZ-01. Readable isometric, semi-stylized.** Chunky, clean silhouettes with strong color coding.
  Not photoreal (racks all look the same in reality and that's a readability disaster), not cartoon
  slapstick (the business stakes need to land).
- **VZ-02. Silhouette rule for threats.** Every threat family has a distinct silhouette readable at
  thumbnail size: *volumetric* = a dense swarm blob; *application* = a single sharp angular dart;
  *slow/persistent* = a thin trickling worm; *insider* = a normal-looking sprite with a subtle wrong
  color; *physical/environmental* = an overlay effect on the board rather than a unit. Never require
  the player to read a label to know what's coming.
- **VZ-03. Visitors are warm, threats are cold.** Global rule. Your customers glow in warm gold/amber;
  threats are cold cyan/violet/red. The moment a threat is *disguised* as a visitor, it renders warm
  — and the reveal (when your IDS classifies it) is a color snap that feels great.
- **VZ-04. Bounced visitors are ghosts.** A bounced customer fades to grey and drifts off-screen
  upward with a tiny "$" ticking off. This is the game's most important visual, because the whole
  design is about making invisible losses visible.
- **VZ-05. False positives are the loudest event on screen** relative to their size — a warm sprite
  hit by your own defense, flashing your defense's color. The player must *feel* friendly fire.
- **VZ-06. Latency as literal distance/drag.** Packets visibly slow down passing through inspection
  layers. A stack of five defenses looks like molasses. Players should be able to *see* their
  latency budget being eaten.
- **VZ-07. Heat map overlay** with real hot/cold aisle shading; a badly laid-out room looks wrong at
  a glance. Same for a **power overlay** (circuits glowing toward their amperage limit) and a
  **blast-radius overlay** (G-05). Three overlays, one hotkey each.
- **VZ-08. Utilization as fill, everywhere.** Every object shows a fill bar in its own frame — server
  CPU, PDU amps, link bandwidth, rack U-space, ticket queue. One visual grammar for "how full is
  this" across every system in the game.
- **VZ-09. LED language.** Real gear communicates with tiny lights, and so should this: green
  heartbeat = healthy, amber = degraded, red blink = failed, blue = identify/selected, dark = no
  power. Learnable in thirty seconds, scales to 400 objects on screen.
- **VZ-10. Zoom-based LOD.** Zoomed in: individual servers, cables, LEDs, little animated fans.
  Zoomed out: racks become colored blocks, links become flow lines, and individual visitors merge
  into **rivers of traffic** whose width is throughput and whose color is health. Zoomed all the way
  out: a world map of PoPs with flow arcs. Same information, three densities.
- **VZ-11. The Aggregation Rule.** Never render 10,000 units. Above a threshold, visitors become
  fluid and threats become weather. A DDoS at scale should look like a *storm front* rolling toward
  your edge — far more intimidating than a thousand sprites, and far cheaper.
- **VZ-12. Money moves visibly.** Revenue coins arc from satisfied visitors into a counter; costs
  drain out in a steady trickle; SLA credits are a red arc going the *wrong way*. A glance at the
  money corner should tell you whether the last 10 seconds went well.
- **VZ-13. Sound as the alert channel.** Fan noise rises with load (the room *sounds* stressed).
  A dying drive clicks. The pager is a specific, memorable, slightly hateful sound. Generator
  transfer is a satisfying clunk-then-roar. Under-attack mode drops a low drone under everything.
  A hosting game where you can close your eyes and know what's wrong.
- **VZ-14. Per-type visual identity.**
  *Shared hosting:* beige, crowded, a wall of tiny customer site thumbnails.
  *Game hosting:* neon, dark, latency numbers everywhere, player-count badges.
  *Backup:* cold blue, robotic tape arms moving in an otherwise still room, a very slow clock.
  *CDN:* the world map is the main view; local detail is secondary.
  *GPU:* orange heat glow, visible power draw, giant fans, cables like arteries.
  *Colo:* your gear is grey and unlabeled and belongs to strangers; tenant cages have their own
  branding you don't control; the humans on the floor are the animation.
  *DNS/Email:* almost abstract — flows and reputation gauges, very little hardware.
  *Dial-up 1996:* CRT phosphor, beige plastic, modem banks with blinking rows, a 4:3 vignette, and
  a UI that looks like a Win95 control panel.
  *Financial colo:* clinical white, measurement everywhere, fiber lengths labeled in meters.
  *Bulletproof:* dim, cheap, mismatched hardware, a nervous energy, and an abuse-complaint inbox
  that is always full.
- **VZ-15. Era shift as a real transition.** When the campaign moves decades, the entire UI chrome,
  font, and palette change. Players should screenshot it.
- **VZ-16. The Rack as a progress bar.** An empty rack filling up over a level is the most satisfying
  visual progression the theme offers. Make it deliberate: gaps look bad, tidy fills look great,
  and the "one more U" feeling should be a genuine motivator.
- **VZ-17. Cables tell your story.** Early: a rat's nest. After investing in cable management:
  combed, color-coded, labeled. Purely cosmetic except for the tour-score bonus (M-08) and a small
  maintenance-speed bonus — and that's enough to make players care enormously.
- **VZ-18. The Incident Timeline.** A horizontal strip at the bottom logging events as icons.
  Scrubbing it replays the board state. This is both the post-mortem tool and the best "look what
  happened to me" screenshot generator.
- **VZ-19. Customer faces.** Every customer is a tiny portrait with a mood. A wall of happy faces
  turning amber one by one during a slow degradation is more affecting than any number, and it makes
  churn feel personal instead of statistical.
- **VZ-20. Threat approach telegraphs.** Threats are visible on an **approach band** at the edge of
  the board for 5-15 seconds before arrival, with an icon, a size indicator, and a target hint.
  Preparation time is what separates a strategy game from a reflex game.
- **VZ-21. Attack impact language.** Volumetric = the pipe visibly clogs and packets back up.
  Application-layer = a dart that lodges in a specific service and pulses. Exploit success = a
  component flickers to the attacker's color and stays tainted. Physical = the board itself shakes /
  darkens / heats. Each family gets its own verb, not just a generic explosion.
- **VZ-22. Defense firing is quiet and precise.** These aren't guns; they're filters. A WAF inspecting
  should look like a scanning line sweeping a queue, with tiny accept/reject flicks. Restrained
  visuals make the *rare* catastrophic events land much harder.
- **VZ-23. HUD layout.** Top strip: cash / MRR / error budget / reputation / current threat level.
  Left: build palette, grouped by the three pillars (Serve / Survive / Sell). Right: alert stack and
  ticket queue. Bottom: incident timeline + speed controls. Center: the board. Everything else is an
  overlay, not a panel.
- **VZ-24. One-glance diagnosis panel.** Hover any object for a card: what it does, what it's
  connected to, current load, what breaks if it dies, and *what threat it is currently vulnerable to*.
  The last line is the one that makes a complicated game feel fair.
- **VZ-25. The "Why Did I Lose Money" button.** A single click produces a ranked, plain-language list:
  "1,240 visitors bounced (too slow) · 310 blocked by your WAF · 88 capacity refused · $4,100." The
  game must always be able to explain itself in one screen, or the whole latency-budget design fails.
- **VZ-26. Colorblind-safe from day one**, because the entire game is color-coded. Every color cue
  also carries a shape or pattern cue (flow direction, dash pattern, icon).
- **VZ-27. Juice moments worth budgeting for:** the first customer signing (a little contract stamp),
  generator transfer under load, a cache going warm (the latency graph visibly dropping), a clean
  failover, and the end-of-quarter revenue tally counting up. Save the big feedback for the moments
  you want players to chase.

---

## 9. Anything Else

### 9.1 Modes

- **X-01. Campaign** — the Pivot Map (L-07) across three acts and multiple hosting types.
- **X-02. Endless / "The Long Haul"** — one facility, escalating forever, leaderboard by valuation.
  Difficulty scales on Variety more than Volume so it stays interesting past minute 40.
- **X-03. Roguelite Run Mode ("Bootstrapped")** — start with $500 and a used server; each shift you
  draft one of three offers (a customer, a piece of gear, a policy, a staffer); permadeath on
  insolvency; meta-unlocks between runs. This is probably the most replayable version of this game
  and worth prototyping first.
- **X-04. Scenario / Puzzle Mode** — fixed board, fixed waves, one correct-ish answer, three stars.
  "Here's a broken architecture. You have $2,000 and four shifts. Fix it." Short, sharp, shareable.
- **X-05. Attacker Mode (asymmetric)** — play the botnet operator against an AI or human defender.
  You spend a budget on vectors and timing; you win by making downtime, not by killing. Turns every
  threat in §2 into a purchasable, which is a very cheap way to double the content.
- **X-06. Co-op ("Two-Person On-Call")** — one player runs Ops (board, defenses, incidents), the
  other runs Business (pricing, sales, support, comms). They share a budget and must argue about it.
  The natural shape of this fantasy and an under-served co-op niche.
- **X-07. Competitive Market Mode** — 2-4 players run hosting companies in a shared market; customers
  churn *between* players; you can outbid, undercut, poach staff, and (if you're that sort) fund an
  attack. Reputation is public.
- **X-08. Daily Incident** — a fixed seeded scenario every day; everyone gets the same disaster;
  ranked by recovery time and money saved. Extremely shareable.
- **X-09. Sandbox / Architect Mode** — no threats, unlimited money, build your dream facility, then
  press **STRESS TEST** and watch the game try to kill it. Turns the sim into a toy.
- **X-10. Historical Scenarios** — recognizable-but-fictionalized versions of famous outage shapes:
  the certificate everyone forgot to renew, the routing leak, the "someone deleted the wrong
  database," the BGP self-lobotomy. Playable industry folklore.
- **X-11. Speedrun Category: "Ship It"** — reach $10k MRR as fast as possible, consequences be
  damned. The game should be *beatable irresponsibly*, because that's fun and it creates community.

### 9.2 Twists and rule-benders

- **X-12. The Inverted Level** — you play the *customer*, evaluating three hosting providers by
  running workloads on them. Teaches the system from the other side, and makes you hate yourself.
- **X-13. The Night Shift** — one level played entirely at 3am, half staff, alarms only, no building.
  Pure incident response. Tense, short, memorable.
- **X-14. The Board Meeting** — an interstitial where investors demand growth or margin, and your
  answer sets the next level's scoring weights. The player chooses their own grading rubric and then
  lives with it.
- **X-15. Technical Debt as a physical object** — a literal pile in the corner of the room that grows
  with every shortcut and periodically emits an incident. Visible, mockable, cleanable.
- **X-16. The Legacy Box** — one server in every late-game level that nobody understands, cannot be
  migrated, and must be protected. It hosts something absurd and critical. Running gag with teeth.
- **X-17. The "Works On My Machine" customer** — a recurring NPC who reports impossible bugs that are
  always their fault, and exactly once in the campaign is *right*, catastrophically.
- **X-18. Seasons** — traffic has a yearly shape: retail peaks in Q4, game hosting peaks on release
  days and school holidays, backup peaks at month-end, tax hosting peaks in April. Levels can be
  placed anywhere in the year, and the calendar becomes a strategic map.
- **X-19. The Upstream is a Character** — your transit provider has a reputation, a NOC that answers
  slowly, and its own outages. You can pay more for a better one. A supplier as an NPC relationship.
- **X-20. Reputation is asymmetric.** It falls ten times faster than it rises, and the game should
  say so in the tutorial, so the player understands why one bad night matters more than thirty good
  ones. Most business sims get this backwards.
- **X-21. The Ethics Track** — bulletproof hosting, selling customer data, cutting compliance corners,
  and lying during incidents are all *available and profitable*. There's no morality meter; there are
  just consequences, some of them delayed by two levels. Let the player find out.
- **X-22. New Game+: "The Incumbent"** — restart with your endgame company intact, but now you're the
  big slow one and a scrappy competitor is doing to you what you did to everyone else.

### 9.3 Humor (the theme is funny; don't be precious)

- **X-23. Ticket flavor text** generated from real support archetypes: "my website is down" (it isn't),
  "can you install [wildly inappropriate software]", "I deleted everything, please restore, I have no
  backups, also I cancelled backups to save $3."
- **X-24. The sticky note system** — inherited servers come with physical sticky notes. "DO NOT
  REBOOT." "ask dave." "temp — remove 2009."
- **X-25. Achievement names** that sysadmins will recognize instantly: *Worked In Staging* · *It Was
  DNS* · *The Cert Expired* · *Backups Are Not Backups Until You Restore One* · *Rebooted It, It
  Worked, Never Found Out Why* · *Hero Culture* (survive a quarter entirely on manual intervention —
  and get graded down for it).
- **X-26. The Postmortem Tone Setting** — you write your public postmortem in one of three voices:
  Honest, Corporate, or Defensive. Each has different reputation effects with different audiences
  (engineers vs. enterprise buyers vs. press). Purely a text choice with a real mechanical outcome.
- **X-27. Vendor sales calls** as a recurring interruption you can decline, or attend for a small
  discount and a large waste of time.
- **X-28. The Conference Talk** — late campaign, present your architecture publicly. Reputation
  bonus, plus attackers learn your topology. Fame has a cost.

### 9.4 Onboarding & accessibility (pacing note, since it's a complex sim)

- **X-29. Systems arrive one per level for the first act,** and each new level's tutorial is a *live
  problem*, not a text box: "your DB is melting" teaches caching better than a tooltip ever will.
- **X-30. Assistant modes** — *Advisor* (suggests actions), *Autopilot* on selected subsystems (the
  game runs your backups/patching for a small efficiency loss), and *Simplified Economy* for players
  who want the defense game without the spreadsheet. Three difficulty dials on three different axes
  rather than one "hard" slider.
- **X-31. The Glossary is diegetic** — every acronym is one click from a plain-language card written
  like a coworker explaining it. This game is a stealth education product and should own that.
- **X-32. Pause-and-plan is the default pacing.** Actively design for players who want to stop and
  think. Real-time pressure comes from *consequences*, not from APM.

### 9.5 Things I'd prototype first (designer's ordering, for whoever builds this)

1. **The latency budget + bounce loop** with one server, one defense, one aggression slider. If that
   isn't fun in 90 seconds with programmer art, nothing else matters.
2. **The Attack Surface Ledger** — prove that building a DB visibly changes the threat deck and that
   players notice and care.
3. **The Suspicion Dial with visible false positives** — prove players agonize over the slider.
4. **The rack/topology dual view and drag-a-cable** — prove the build interaction is tactile.
5. **One full quarter with a Quarterly Review** — prove the pacing arc and the five-axis grade.
6. **Two hosting types on the same engine** (shared web + game servers) — prove the Level Grammar
   produces genuinely different play from the same verbs. If this step works, the whole campaign
   scales; if it doesn't, cut the number of business types and go deeper on fewer.
