# Hosting Tower Defense — Idea Dump (Lens: **Game Designer**)

*Written from the chair of someone who has shipped tower-defense and strategy games. The hosting
theme is treated as **flavor for mechanics**, never the reverse. Every idea below is judged on one
question: does this create a decision the player has to think about?*

---

## 0. Design Thesis (the spine everything else hangs off)

Before the 9 categories, five load-bearing design pillars. Every idea in this document is a
consequence of one of these.

### P1. The Shared Pipe
In classic TD, creeps walk the lane and towers shoot them. **Here the lane carries creeps AND
customers.** Threats and visitors travel the same path, through the same equipment. Every defense
you place is a checkpoint that adds **latency**, and latency is the thing that kills visitors.

> *The core knob of the entire game: **how paranoid can I afford to be?***

This is the one idea that makes the game not-just-another-TD. A WAF that inspects every request
stops SQL injection **and** adds 40ms to every page load. A CAPTCHA gate stops credential stuffing
**and** bounces 12% of real shoppers. There is no strictly-good tower. Every tower is a tax.

### P2. Capability vs. Surface
Every buildable has two numbers printed on its card: **Capability** (what new, richer traffic it
lets you serve) and **Surface** (what new threat classes it invites into the wave table).

Adding a database server means you can now serve Power Shoppers and Enterprise Buyers — the
high-value visitors — but it *permanently adds SQL Injection, DB Overload, and Backup Corruption to
the enemy pool for the rest of the run.* You cannot earn premium customers without inviting premium
attackers. **The tech tree is also the bestiary.**

### P3. Peacetime is the Real Boss
Two currencies of time pressure: **waves** (spiky, loud, obvious) and **upkeep** (slow, silent,
compounding). Overbuild during a scary wave and you die three quiet minutes later to payroll.
A huge fraction of the strategy is *knowing when to under-defend.*

### P4. Attention is a Resource
The player is one engineer (early) or a small team (later). Manual interventions — restarting a
service, answering a ticket, physically swapping a disk — occupy **hands**. You have 1-2 hands at
the start. Automation is the real tech tree: every unlock that converts a manual action into a
standing rule is a *huge* felt upgrade. This gives the game a satisfying "I used to have to do this
myself" arc.

### P5. Legibility Under Load
A TD lives or dies on whether you can read the board in half a second at 3x speed. Every visual and
UI idea in §8 is subordinated to that. If the player can't tell at a glance *which link is
saturated*, the game is broken no matter how good the systems are.

---

## 1. Levels, Scenarios, and Progression

### 1A. The Zoom-Out Ladder (macro progression structure)

The single most satisfying progression trick available to this theme: **each tier's entire map
becomes one icon in the next tier's map.** The player physically watches their world shrink into a
component. Six camera scales:

#### 1. **Tier 0 — "Inside the Box"**
*Scale: one server's internals. Camera: a motherboard / a process tree.*
You are a single website on shared hosting. You do not own the machine. The "map" is one request
lane: Port 80 → Apache worker pool → your PHP script → the shared MySQL you get 20 connections to.
3 build slots. Threats are tiny: one scraper bot, one form spammer. Teaches: the lane, patience
bars, the pipe metaphor. **10-12 minutes.**

#### 2. **Tier 1 — "Your Own Box"**
*Scale: one server, plus its network edge.* You now own the machine, so you own its failures.
Introduces: root access (= you can build inside the server), the first real upkeep bill, and the
first hardware failure die-roll. Build slots become **RAM/CPU budget** — a soft cap that teaches
resource ceilings before physical racks do.

#### 3. **Tier 2 — "Half a Rack, Someone Else's Building"**
*Scale: a rack elevation, 21U of yours inside 42U.* Colocation. New systems: **physical space (U)**,
**power draw (amps on a circuit)**, **cross-connects you have to pay the facility for**, and the
**Noisy Neighbor** — the other tenant's gear in the same rack, which you cannot control and which
occasionally sets your thermals on fire. Teaches: constraint stacking (space AND power AND money AND
latency, all at once).

#### 4. **Tier 3 — "The Cage"**
*Scale: a small room, 6-10 racks, top-down.* You run a real service: several web nodes, DB
primary+replica, cache tier, a pair of load balancers, your own switches. **Now you have customers,
not just visitors** — tenants who pay you MRR and who generate their *own* visitor streams and their
*own* attackers. Introduces: SLAs, tickets, and the first staff hires.

#### 5. **Tier 4 — "The Floor"**
*Scale: a datacenter floor plan, dozens of racks, hundreds of tenants.* You are now a hosting
operator. Individual servers stop being units; **racks** are the unit. New systems: HVAC and hot/cold
aisle layout, UPS/generator, fire suppression zones, badge access, abuse desk, a NOC. Threats scale
to: sustained volumetric DDoS against a customer that hurts *everyone*, and the first
**tenant-as-threat** (your own customer is the bad guy).

#### 6. **Tier 5 — "The Map"**
*Scale: a world map. Each datacenter is one node.* Multi-region. New systems: anycast, BGP,
peering/transit economics, regional demand curves, latency-to-population, time zones (the sun moves;
traffic follows it), regional regulation, and submarine cable cuts. The "lane" is now
inter-continental routing. **Your Tier 3 cage is a single dot you can zoom into.**

> **Why this works:** it's the Factorio/Civ dopamine — old mastery becomes a primitive. It also
> solves the TD scaling problem (too many units on screen) by *changing the unit of abstraction*
> rather than just adding more sprites.

### 1B. Alternate Perspective Stages (lens flips)

Break the campaign's rhythm every ~5 levels with a stage played from a different chair. These are
where the design gets to be weird, and they double as teaching tools.

- **"Red Team Friday"** — *You are the attacker.* You get a budget and a target network (usually a
  network the player themselves built two levels ago, or a rival's). You buy botnet time, scanners,
  and exploits and try to get through. Enormously effective as a **teaching level**: nothing makes a
  player understand why rate limiting matters like watching their own credential stuffer get walled.
  Reward: intel that unlocks defensive tech.
- **"The Landlord"** — *You are the datacenter, not the hosting company.* Your "visitors" are
  prospective tenants touring the facility; your "threats" are power events, HVAC failures, and
  tenants who overdraw their circuits. Completely different verbs (you sell space, power, and
  cross-connects), same core loop. Introduces facilities tech that carries back into Tier 4+.
- **"The CDN"** — *You are the edge, not the origin.* You have hundreds of tiny PoPs and almost no
  compute. Your job is cache hit ratio. Puzzle-flavored: routing and eviction policy, not towers.
- **"The Customer"** — *You are a tenant on someone else's hosting.* Short, tense, comedic: your
  provider is failing and you have almost no control. Teaches empathy for the ticket queue — and
  every complaint you file in this level shows up as a mechanic you'll be on the receiving end of.
- **"The Upstream"** — *You are a transit provider.* Your visitors are packets, your customers are
  networks. Peering disputes as a resource negotiation minigame.
- **"The Auditor"** — *You inspect a network.* No combat. You walk a grid and tag findings; you're
  graded on what you caught. A palate cleanser that teaches threat identification.
- **"The Registrar"** — a tiny weird one: you run DNS for everybody. Your lane is queries. Your boss
  is a reflection/amplification attack that uses *you* as the weapon.

### 1C. Scenario Types (goal/constraint variants — the real replay value)

Each is a **win condition that isn't "survive N waves."** Mixing these into the campaign is what
stops TD fatigue at hour six.

1. **"Hug of Death"** *(survive a spike)* — A post goes viral at T+60s. Traffic goes 40x for 90
   seconds, then collapses. **Win = convert ≥X% of the spike.** The trap: you can trivially survive
   by rate-limiting everything to death — but then you converted nothing and you *lose*. Forces the
   player to build for *throughput*, not safety. Best early lesson in the game.
2. **"The Migration"** *(no downtime)* — Two topologies live simultaneously. You must move every
   service from the left cluster to the right cluster while the lane stays open. Introduces
   **cutover mechanics**: DNS TTL as a literal countdown timer on how long stale traffic keeps
   arriving at the old box. Dramatic, entirely non-combat.
3. **"The Breach"** *(start compromised)* — You begin the level with a hostile unit already inside
   your perimeter, invisible. Symptoms only: odd egress, a slow CPU climb, a login at 4am. You must
   find it via logs and forensics **while keeping the site up**. A detective level. Failure is not
   dramatic, it's quiet — you just find out at the end that it exfiltrated everything.
4. **"Cost Cut"** *(budget halved)* — Board mandate: reduce upkeep 40%, keep SLA. Pure
   optimization/tear-down puzzle. Forces the player to learn what they over-built. Deliciously
   uncomfortable.
5. **"Audit Week"** *(compliance)* — An auditor walks the lane. Certain builds are now *illegal*
   (unencrypted link, no logging, shared admin credential). You must retrofit under a deadline
   without downtime. Constraint-driven, no enemies at all. Optional boss: the auditor asks you to
   *prove* something and you have to produce a log you may not have been keeping.
6. **"The Acquisition"** *(inherited mess)* — You're handed a pre-built network you didn't design:
   miscabled, undocumented, one machine nobody knows what it does (touching it breaks something
   three hops away). Goal: modernize without breaking the mystery box. **The single funniest and
   most authentic level type available to this theme.**
7. **"Black Friday"** *(scheduled peak)* — You know exactly when the spike lands and how big. Pure
   capacity planning: provision too early and upkeep eats you, too late and you drop the peak.
   Introduces **pre-warming** and **burst capacity** as real decisions.
8. **"The Long Weekend"** *(no hands)* — All staff are away; you cannot perform manual actions. Only
   automation and standing rules run. Everything you automated over the campaign pays off here. If
   you hand-flew everything up to now, you get destroyed. Beautiful skill check.
9. **"Ransomware Friday"** *(recovery)* — Encryption spreads node-to-node like a fire. The question
   isn't "can you stop it" — it's "do your backups actually restore?" Restore time is a real timer.
   Players who bought backups but never tested a restore discover their backups are decorative.
10. **"Cable Cut"** *(lost capacity)* — A backhoe severs a transit link mid-level. Half your inbound
    capacity vanishes instantly. Reroute or die. Tests whether you built redundancy or theater.
11. **"Generator Test"** *(planned risk)* — Facility does a scheduled failover test. If your UPS
    runtime math is wrong, you find out live.
12. **"Zero-Day Sunday"** *(unknown counter)* — A threat arrives that **no existing tower stops**.
    You must improvise: take the service offline (lose revenue), block by crude signature (lose
    visitors), or eat the damage while researching an emergency patch. Every answer is bad. Great
    level.
13. **"The Regulator"** — A legal/takedown event: you must locate and remove one specific tenant's
    content out of thousands, under a clock, without collateral outage.
14. **"Peering War"** — A rival network de-peers you. Your traffic reroutes through expensive
    transit. Economic pressure level: revenue stays flat, costs spike.
15. **"The Influencer"** — A single visitor with huge value walks the lane. If they have a good
    experience, you get a permanent traffic multiplier. If they bounce, you get a permanent
    reputation scar. **One unit matters more than the other 10,000.** Enormous tension.
16. **"Chip Shortage"** — Build costs for a specific component triple mid-campaign; you must
    redesign around scarcity.
17. **"Heatwave"** — Ambient temperature rises all level; cooling costs scale nonlinearly; you must
    throttle (lose capacity) or spend.
18. **"Bare Metal Bring-Up"** — A pure build/logistics level, zero threats: rack, cable, power,
    image, and bring 20 machines into service against a clock. A breather level that is secretly a
    cabling-skill exam.
19. **"The Intern"** *(chaos agent)* — An AI-controlled unit wanders your network doing well-meaning
    damage. You can't fire them (story reasons). You must build **guardrails** — permissions,
    staging, change windows — instead of defenses. Teaches process as a mechanic.
20. **"Split Brain"** — Two datacenters lose their link to each other but both stay up. Both think
    they're primary. You must reconcile. A conceptual boss fight.
21. **"Reverse Wave"** — *No threats at all for the whole level.* Your only enemy is bounce rate and
    cost. A pure funnel-optimization stage. Proves the visitor system can carry a level alone.
22. **"The Demo"** — A prospective whale client is watching your dashboard live for 3 minutes. Your
    *metrics* must look good, not just be good. Introduces the delicious option to **cheat the
    dashboard**, with consequences.

### 1D. Progression Systems (between-level)

23. **The Company Ledger** — A persistent meta-save across the campaign. Cash, reputation, staff,
    and *scars* carry level to level. Losing a level doesn't reset you; it leaves damage.
24. **Scars** — Permanent negative modifiers earned by failure (e.g. "Data Loss 2023" caps starting
    reputation; "Known Breached" increases attacker spawn interest). They can be *paid off* over
    several levels, giving losing runs a recovery arc instead of a restart.
25. **The Quarterly Board Meeting** — Between acts, pick one of three company-wide mandates (Growth
    / Margin / Trust). Each shifts scoring weights and unlocks a different branch. Makes the campaign
    branch without building three campaigns.
26. **Difficulty as Business Model** — Instead of Easy/Normal/Hard, the player picks a *business*:
    Budget Shared Host (huge visitor volume, razor margins, low-tier threats), Managed Enterprise
    (few high-value clients, brutal SLAs, nation-state attention), or Crypto/Adult/Gaming Host
    ("high-risk vertical": enormous margins, constant DDoS, payment processor problems). Same
    systems, wildly different pressure profile. **This is the difficulty selector and the faction
    selector at once.**
27. **The Uptime Streak** — A cross-level counter of consecutive minutes without an SLA breach.
    Higher streak = better financing terms (cheaper loans) and better client quality. Breaking it
    hurts for hours. Creates real dread in an otherwise abstract stat.
28. **Prestige: "The Exit"** — Sell the company or IPO. You cash out for meta-currency and restart
    at Tier 0 with a permanent perk tree. IPO gives more currency but adds a permanent "shareholder
    pressure" modifier (quarterly profit targets) to all future runs. Acquisition gives less but is
    clean. A genuinely thematic prestige.

### 1E. Difficulty Curve Craft

29. **The Pressure Budget** — Under the hood, each wave has a numeric "pressure" allowance that the
    generator spends on enemy types. The curve isn't linear: it's **sawtooth with a rising floor**
    — hard wave, easy wave, harder wave, easy-but-not-as-easy wave. The dips are where the player
    builds; without dips, building never feels like a choice, just a chore.
30. **The Two-Beat Wave** — Every wave is a threat pulse *immediately followed by* a visitor surge.
    The player who spends everything surviving the threat has no capacity left to monetize the
    surge. **This single rhythm generates 80% of the game's interesting decisions.** Do you buy
    another WAF, or another web node?
31. **Telegraph Depth** — The next wave's composition is always visible; the wave after that is
    visible as a silhouette; the one after that is a question mark. Gives the player a planning
    horizon without removing surprise. Unlockable monitoring extends the horizon by one wave — an
    information upgrade, which is a rare and delightful kind of upgrade.
32. **Grace Windows** — After any catastrophic failure, a mandatory 30-second "the site is down and
    nobody is arriving" window. Removes the death-spiral where a failure cascades faster than the
    player can respond. Failure should cost money and reputation, not agency.
33. **The Difficulty Dial the Player Turns** — The player sets their own pricing. Lower prices =
    more clients = more revenue = more traffic = more attackers, faster waves. **The player chooses
    the game's tempo by setting prices.** Best kind of difficulty: self-inflicted, legible, reversible.
34. **Anti-Turtle Clock** — Upkeep rises slowly every minute regardless of what you do (salaries,
    depreciation, vendor increases). You cannot camp a safe build forever. Forces growth.
35. **The Mercy Rule** — Third consecutive loss on a level offers "Consultant Mode": an NPC greybeard
    marks the two worst decisions on your board. Not an auto-win, a hint. Keeps novices in.

---

## 2. Threats

### 2A. The Threat Role Taxonomy (design-first, theme-second)

A TD needs its enemies to occupy **mechanical roles**, not just flavor slots. Here's the role grid,
each mapped onto a hosting-authentic threat. Every wave generator pulls from these roles so waves
stay legible: the player should identify the *role* at a glance and the *flavor* on inspection.

| Role | What it does to the player | Hosting flavor |
|---|---|---|
| **Swarm** | Overwhelms by count; punishes single-target defenses | Botnet zombies |
| **Tank** | Huge HP; punishes low-DPS defenses | Volumetric DDoS |
| **Sapper** | Ignores HP, drains a *resource* | Cryptominer, bandwidth thief |
| **Stealth** | Invisible without detection tech | APT, insider |
| **Splitter** | Spawns children on death | Worm |
| **Healer/Spawner** | Off-map source that must be cut | C2 server |
| **Bypass/Flyer** | Skips the lane entirely | Supply-chain, physical, insider |
| **Siege** | Attacks from outside your range | BGP hijack, DNS poisoning |
| **Debuffer** | Weakens your *economy*, not your HP | SEO spam, review bombing |
| **Mimic** | Looks exactly like a visitor | Layer-7 attack, card testing |
| **Parasite** | Rides in on a legitimate visitor | Malvertising, XSS |
| **Boss** | Multi-phase, requires a built answer | Nation-state, ransomware crew |

**The Mimic role is the star of this game.** It's the role that only works *because* of the Shared
Pipe pillar. See 2C.

### 2B. Attacker Archetypes (the "who," with distinct behavior AI)

36. **Scanner Bots** — Constant, ambient, low-damage background noise. Never stop, never escalate.
    Their purpose is to make "zero alerts" impossible, so the player learns to triage instead of
    react to everything. **Mechanically: they generate log noise that hides real attacks.**
37. **Script Kiddie** — Fires one known exploit, loudly, at a random service. If it fails, they
    leave. If it *works*, they come back with friends (spawn rate up) and they **tell people** —
    your network gets tagged on a list, raising future spawn rates permanently. Punishes leaving one
    hole open, in a way that compounds.
38. **The Grinder (Credential Stuffer)** — Slow, relentless, never stops, tries lists forever.
    Cannot be "killed," only rate-limited and made unprofitable. Teaches the concept of defenses
    that *change the economics* rather than defenses that destroy.
39. **Booter Kid (DDoS-for-hire)** — Buys 90 seconds of a large botnet because a customer of yours
    beat them in a video game. Enormous, dumb, short, and *aimed at one tenant*. Introduces the
    "your customer is the target and everyone else is collateral" problem, and the horrible decision
    to **null-route your own paying customer to save everyone else.**
40. **The Competitor** — An intelligent adversary who watches your build. They don't attack your
    strongest point; they attack whatever you *just* removed or downgraded. They also undercut your
    pricing, poach staff, and file abuse complaints about you. **The game's rival AI.**
41. **The Researcher** — Finds a real vulnerability and emails you. If you respond well (pay a
    bounty, patch fast), they become an asset who warns you about future threats. If you ignore or
    threaten them, they publish and you eat a public scar. **A "threat" whose correct counter is
    being a decent person.**
42. **Ransomware Crew** — Multi-phase boss. Phase 1: quiet recon (weeks, compressed). Phase 2:
    credential harvest. Phase 3: they delete your backups *first*. Phase 4: encryption. Countered
    almost entirely by things you built long before — offline backups, segmentation, least privilege.
    **The boss that grades your past decisions.**
43. **Nation-State / APT** — Doesn't want money, wants presence. May sit dormant for an entire level
    doing nothing. If you never detect them, you "win" the level and lose the campaign beat. The
    only threat whose damage is *narrative*.
44. **The Insider** — A staff unit you hired turns. Has legitimate credentials, so most towers
    ignore them. Countered only by process tech (2-person rule, audit logging, least privilege) —
    all of which cost efficiency. Perfect Capability-vs-Surface case study applied to *staff*.
45. **Supply-Chain Ghost** — Arrives inside a package you installed voluntarily. Bypasses the entire
    lane. Countered by slow-rolling updates (which costs you security elsewhere). **A genuine
    dilemma with no right answer, which is exactly what you want in a late-game threat.**
46. **The Squatter** — Signs up as a legitimate customer, pays with a stolen card, and immediately
    starts spamming/mining/phishing from inside your network. Your abuse desk must find them before
    your IP ranges get blacklisted. **A threat that enters through your revenue funnel.** The
    ultimate expression of "attracting visitors is dangerous."
47. **The Chargeback Gremlin** — Not an attacker; a customer who disputes every invoice. Costs money
    and processor reputation. Counterable with verification friction — which bounces good customers.
48. **The Hoarder** — A customer who uses 40x their fair share of a shared resource. Not malicious.
    Degrades everyone else. Counter is a *policy* (quotas), and enforcing it makes them churn angrily
    and leave a bad review.
49. **The Ex-Employee** — Fires once, at a specific service, using credentials you forgot to revoke.
    Spawns only if you've fired/lost staff. **A threat generated by your own HR decisions.**
50. **Ambulance Chasers** — Post-incident, a swarm of low-value units arrive to file complaints,
    demand SLA credits, and scrape your status page for content. They arrive *after* the fight,
    when your attention is exhausted. Mechanically: an attention tax on top of a bad moment.

### 2C. Mimic Attacks (the signature threat class)

The mechanical crown jewel. These units are **rendered identically to visitors** until identified.
Every counter that kills them also kills real customers at some rate. This is where the game's
central tension becomes a literal targeting problem.

51. **Layer-7 Mimic** — Requests your most expensive page over and over, at human-plausible rates,
    from thousands of residential IPs. Indistinguishable from popularity. If you rate-limit hard
    enough to stop it, your conversion rate craters. Correct answers are *nuanced*: cache the
    expensive page, add a cost-per-request budget, fingerprint behavior over time.
52. **Slowloris Sloth** — Occupies a connection slot and does almost nothing, forever. Zero
    bandwidth, enormous damage. Visually: a visitor that walks the lane at 2% speed and never
    arrives, holding a slot open the whole time. **Teaches that capacity is about concurrency, not
    throughput.** Excellent early "huh, that's clever" moment.
53. **Card Tester** — Runs tiny transactions through your checkout to validate stolen cards. Looks
    like conversion! Your revenue graph goes *up* right before your payment processor drops you.
    **A threat that masquerades as success.**
54. **Scraper Locust** — Steals your content at high volume. Ambiguous: some scrapers are search
    engines you *want*. Blocking indiscriminately tanks your organic traffic two waves later — a
    **delayed-consequence** punishment, which the game should telegraph exactly once and then never
    again.
55. **Referral/Ghost Spam** — Pollutes your analytics. Damage is *informational*: your dashboard
    lies to you, so you make bad build decisions. A threat that attacks the HUD.
56. **The Fake Signup Wave** — Hundreds of free-tier accounts created by one actor to farm your
    resources. Your "customer growth" metric spikes. Your margins die.
57. **Sybil Reviewers** — Units that look like advocates but leave fake reviews (positive *or*
    negative). Positive fakes are the nastier version: they inflate your reputation, attract clients
    you can't serve, and then the correction hurts twice.

### 2D. Volumetric / Brute Threats

58. **SYN Flood Swarm** — Classic swarm. Cheap, fast, infinite. Countered by SYN cookies (a cheap,
    early, satisfying "problem solved forever" unlock — every game needs a few of those).
59. **Amplification Truck (DNS/NTP/memcached)** — A *tank*: enormous HP, slow, telegraphed 10
    seconds out. Bigger than your pipe by design. You cannot kill it at home — you must **divert**
    it (scrubbing center, upstream null-route). Introduces the concept of a threat whose counter is
    "have a relationship with someone bigger than you."
60. **Bandwidth Bill Bomb** — A sneaky variant: the attack is *survivable* but the traffic is
    metered. You win the fight and lose the month. Damage is dealt to the invoice, not the servers.
    **Wonderful because the player's instinct (tank it) is the wrong answer.**
61. **Connection Exhaustion** — Fills your LB's connection table. Visually: the lane's "slots" fill
    up with gray, and visitors queue outside, patience draining.
62. **Cache Stampede / Thundering Herd** — Triggered by *your own* success: a popular cached item
    expires and 10,000 visitors hit the DB simultaneously. **A self-inflicted threat spawned by good
    traffic.** The best kind of enemy — it makes the player suspicious of their own wins.
63. **Retry Storm** — After any brief outage, every client retries at once, turning a 2-second blip
    into a 4-minute outage. Punishes bad recovery order. Countered by backoff/jitter tech.

### 2E. Application & Data Threats (the Surface tax of building services)

Each of these should be **unspawnable until you build the thing that invites it** — so the player
literally watches their bestiary grow as their network grows.

64. **SQLi Needle** *(unlocked by: database)* — A single unit that walks straight to the DB and, if
    it arrives, doesn't damage anything visible — it **copies** your customer table and walks back
    out. Damage is delayed reputation + legal.
65. **The Dump** — The consequence unit: if SQLi succeeded earlier, this arrives 2 levels later as a
    news event. Delayed-consequence design; makes the campaign feel causal.
66. **XSS Parasite** *(unlocked by: user content)* — Rides *inside* a legitimate visitor. If you kill
    the carrier you lose a customer; if you let them through, the payload infects other visitors.
    **Perfect hostage mechanic.**
67. **Deserialization Bomb** *(unlocked by: app framework upgrades)* — Small, fast, one-shot: if it
    lands, it doesn't damage — it *converts* one of your servers to an enemy spawner.
68. **Path Traversal Rat** — Scurries along links looking for a misconfigured mount. Only dangerous
    if you left a specific build in a specific state. Rewards tidy building.
69. **SSRF Tunneler** — Uses your own web server to attack your internal network. **Turns your tower
    into the attacker's weapon.** The counter (egress filtering) is something players never build
    until this hits them once.
70. **Log4Shell-style Zero-Day** — Periodic, campaign-level, unpatchable-on-arrival event. Every
    player is hit. The differentiator is *response speed*, which is a function of how much monitoring
    and automation you built. A great "the whole industry is on fire tonight" shared moment.
71. **Dependency Typosquat** — You install a package; it's the wrong one by one letter. Enters at
    *build time*, not run time. Counter: a package-pinning / review process that costs you build
    speed.
72. **Cryptominer Squatter** *(Sapper role)* — Doesn't break anything. Just steals 30% of your CPU
    forever, silently, raising your power bill and slowing every visitor. Detected only by noticing
    a slow drift in a graph. **The most satisfying "aha" detection in the game.**
73. **Spam Relay** — Uses your mail server; damage is your IP reputation, which degrades *deliver-
    ability for legitimate customers* — a multi-hop consequence chain that rewards understanding.
74. **Backup Poisoner** — Quietly corrupts backups. Invisible until you need them. The only counter
    is **restore testing**, which costs time and produces no visible benefit — until it does. A
    mechanic that rewards paranoid, boring virtue.

### 2F. Infrastructure & Network Threats

75. **BGP Hijacker** *(Siege role)* — Doesn't come down your lane at all. Simply **redirects your
    visitors to someone else's network** on the world map. Your traffic graph goes to zero for no
    apparent reason. Counter: RPKI/route monitoring — an information tower, not a weapon.
76. **DNS Poisoner** — Same family: attacks *before* the lane. Visitors never even start walking.
    Terrifying because the board looks totally healthy.
77. **Transit Flap** — Your upstream link goes up-down-up-down. Worse than a clean outage, because
    failover keeps triggering. Teaches that **partial failure is harder than total failure**,
    which is the truest lesson in operations and a great mechanic.
78. **Asymmetric Route Gremlin** — Packets go out one way and come back another; some visitors work,
    some don't, seemingly at random. A diagnosis puzzle rather than a fight.
79. **The Rogue DHCP / Rogue AP** — Someone plugs something in. Now some of your traffic goes
    somewhere else. Physical-layer threat; countered by port security, which costs you setup speed.
80. **MAC Flood / Broadcast Storm** — One bad loop and the whole switch fabric melts. Caused by *a
    cabling mistake the player made themselves* when connecting two switches. **The player is the
    threat.** Countered by spanning-tree tech that you unlock after doing it once.

### 2G. Non-Attack Problems (entropy as an enemy faction)

These are the game's "weather." They should be **frequent, small, and attention-taxing** rather than
rare and huge, because their job is to compete for the player's hands during combat (see Pillar P4).

81. **Disk Death** — A drive fails. Nothing happens immediately (RAID). But you're now in a **degraded
    window** and a second failure is fatal. Fix requires a *physical hand* at the rack. Creates the
    beautiful choice: interrupt your defense to go swap a disk, or gamble on the window.
82. **Rebuild Storm** — The RAID rebuild itself halves that server's performance for 4 minutes. The
    *fix* is the second disaster. Superb tension.
83. **PSU Pop** — A power supply dies audibly. If the server was single-corded, it's down now. If
    you paid for dual-corded + dual PDU earlier, nothing happens and you feel like a genius. **The
    purpose of this event is to retroactively reward an expensive, boring earlier purchase.**
84. **Fan Failure → Thermal Throttle** — Gradual, not binary: the machine gets slower and slower.
    Latency creeps up; visitors start bouncing; nothing is "broken." Diagnosis puzzle.
85. **ECC Error Cascade** — Random, tiny corruptions. Occasionally a request just... returns wrong
    data. Maddening. Counter: spend on better RAM up front.
86. **Kernel Panic / OOM Killer** — A process gets killed at random under memory pressure. Which
    process? The wrong one. Teaches headroom.
87. **Disk Full (Logs)** — Your own monitoring fills the disk and takes the server down. **Your
    defenses killed you.** Deeply authentic, deeply funny, great mid-game gotcha.
88. **Cert Expiry** — A visible countdown you can see for the entire campaign and will absolutely
    forget about. When it fires, *every* visitor bounces at a scary browser warning. Counter: an
    automation unlock. One of the best "automate this and never think about it again" beats.
89. **The Bad Deploy** — You (or your dev staff) push a change; error rate spikes. You have a
    rollback button with a cooldown. The tension: is it the deploy, or a coincidental attack?
90. **Config Drift** — Servers slowly diverge from each other. One node starts behaving differently.
    Countered by config management tech, which costs flexibility.
91. **Cron Storm** — Everything scheduled at midnight fires at once, self-DDoSing. Fixed by
    *jitter*, a delightfully cheap and clever unlock.
92. **Clock Skew** — Timestamps disagree; auth tokens start failing; logs become unreadable. Subtle
    and horrible.
93. **The Full Table Scan** — A customer adds a query that's fine at 10k rows and fatal at 10M. The
    threat *grows with your success*.
94. **License Expiry** — Software you depend on just stops. Pure upkeep-forgetfulness punishment.
95. **Fiber Cut / Backhoe** — External, unavoidable, instant capacity loss.
96. **Power Event Ladder** — Brownout → UPS → generator start → generator *fails to start* because
    nobody ran the monthly test. A 4-stage failure chain where each stage is a thing you could have
    bought insurance against.
97. **HVAC Failure** — Temperature rises across the floor. You get ~90 seconds before thermal
    shutdowns start cascading. Emergency options: throttle everything (lose revenue), shut down
    non-critical racks (choose which customers to sacrifice), or prop the doors open (a comedy
    option with a real small benefit and an access-control penalty).
98. **Humidity / Static** — Rare, random component death. Pure entropy tax.
99. **Rodents / Wildlife** — Chewed cable, random link death. A joke that is also a real cause.
100. **Dust Bunny Accumulation** — Slowly raises failure rates across a rack unless you spend hands
     on maintenance. A "chore" system that can be automated away later.
101. **Fat-Finger** — When the player performs a manual action under high stress (lots happening on
     screen), a small chance the action targets the wrong node. **Mistakes as a mechanic.** Reduced
     by change-control tech and by *not doing risky things during incidents* — i.e., the game
     teaches change windows by punishing cowboy ops.
102. **The Helpful Vendor** — A support tech remotely "fixes" something and breaks another thing.
103. **Ticket Avalanche** — Any visible outage generates tickets. Tickets consume staff hands.
     **A failure cascade that attacks your response capacity**, which is the most authentic and
     most mechanically interesting kind.
104. **Viral Bad Review** — One bad experience by an Influencer-class visitor becomes a permanent
     reputation debuff that decays slowly. Counter: a public, honest status page (which also
     advertises your outages — tradeoff!).
105. **Billing Failure** — Your payment processor has an outage; MRR doesn't collect this cycle.
     Cash crunch with no combat cause.
106. **DMCA / Abuse Complaint** — Forces a hands action to investigate. Ignoring it stacks toward
     an upstream disconnection — a slow doom clock driven by neglect.
107. **The Audit Finding** — A past shortcut surfaces as a compliance penalty. Delayed consequence.
108. **Staff Burnout** — A staff unit worked too many incidents; their effectiveness drops, then
     they quit and take knowledge with them (removing an automation you had). **Your team is a
     resource that can be strip-mined.** Deeply underused mechanic in strategy games.
109. **Key Person Risk** — One staff member is the only one who knows how a system works. Visually
     marked. If they leave, that system becomes an "Acquisition"-style mystery box.

---

## 3. Visitors, Traffic, and Clients

### 3A. The Core Visitor Unit (the "reverse creep")

110. **Patience as HP** — A visitor spawns with a Patience bar. Every millisecond of latency, every
     queue, every error page, every friction gate drains it. **Reach zero anywhere along the lane
     and they bounce.** The visual is exactly a TD health bar, but *you* are the one damaging it by
     building things. Instantly legible inversion.
111. **Value as Bounty** — Each visitor carries a Value number. Reaching your Conversion node pays
     it. A bounced visitor pays nothing *and* subtracts a small reputation tick. Losing a
     high-value visitor should feel like a monster leaking in a normal TD.
112. **The Latency Budget Readout** — Above the lane, a running tally: "Edge 8ms + WAF 40ms + LB 3ms
     + App 120ms + DB 200ms = 371ms". Next to it, the **bounce curve**. The player can see exactly
     which tower is eating their revenue. This single UI element makes Pillar P1 playable.
113. **Friction Gates** — Every security tower has a **Friction** stat (% of visitors it bounces or
     flags). CAPTCHA: 12%. Aggressive WAF: 3%. Geo-block: 100% of a region. **Friction is the price
     of safety, denominated in customers.**
114. **The Conversion Node** — The "base" you're defending is actually the thing you're *escorting
     visitors to*. Elegantly, the win and lose conditions live in the same object: threats want to
     reach it, visitors need to reach it.
115. **Session Depth** — Visitors don't make one request; they make several (browse → search →
     product → cart → pay). Each is a separate trip down the lane. **A visitor can bounce at any
     hop**, so deep-funnel visitors are exposed to your weaknesses many times. Higher value,
     higher fragility — a natural risk/reward gradient built into the traffic itself.

### 3B. Visitor Archetypes

116. **The Skimmer** — Huge volume, tiny value, enormous patience-sensitivity. Bounces at 500ms.
     Your bread and butter at Tier 0-1; basically ad revenue.
117. **The Mobile Commuter** — Arrives with *pre-damaged* patience (bad connection). Extremely
     sensitive to page weight. Rewards caching and edge builds specifically. Introduces the idea
     that **some visitors are only winnable with certain infrastructure**.
118. **The Power Shopper** — High value, deep funnel, needs the DB and search to be fast. **Cannot
     exist until you build a database.** Literally the payoff for accepting SQLi into your bestiary.
119. **The Impulse Buyer** — Tiny patience, high value, converts instantly if checkout is fast. The
     single best argument for optimizing your slowest path.
120. **The Comparison Shopper** — Visits, leaves, and **comes back later** if your performance was
     good. Introduces a delayed-reward loop: today's speed is tomorrow's traffic.
121. **The Enterprise Buyer** — Walks the lane slowly, *inspecting* your setup: checks your status
     page, your SLA, your certifications, your security posture. **Doesn't care about latency;
     cares about what you've built.** A visitor that grades your architecture rather than your
     speed. Brilliant because it rewards a totally different build than everyone else.
122. **Googlebot / The Crawler** — A *friendly bot*. Looks exactly like a Scraper Locust. If you
     block it, your organic traffic collapses two waves later. If you let it through, your ranking
     rises. **The identification minigame in a single unit.**
123. **The Advocate** — Converts, and on success spawns 2-3 extra visitors. A compounding unit —
     protecting them is disproportionately valuable.
124. **The Reviewer** — Their outcome permanently moves your reputation ±. Highlighted with a glow
     so the player knows the stakes, which turns one unit into a mini-boss of positive valence.
125. **The Influencer** — Spawns a burst of hundreds if satisfied. The "escort mission" unit. Should
     appear rarely and be *loudly telegraphed* ("Incoming: @somebody, 400k followers, arriving in
     10s") so the player can pre-build for it.
126. **The Whale** — One client worth more than your other hundred combined. Fragile relationship:
     one SLA breach and they're gone, taking 40% of MRR. Creates the classic risk/reward:
     concentrate revenue and win big, or diversify and grind.
127. **The Returning Customer (Cached Path)** — Has "path memory": if they had a good experience,
     their patience starts higher and they tolerate more. Loyalty as a stat. Makes past performance
     mechanically compounding.
128. **The Freeloader** — Free tier. Zero value, full resource cost. Their only function is
     *possibly* becoming a paying customer later, and meanwhile they're indistinguishable from load.
     The decision to serve them well is a bet.
129. **The Refund Hunter** — Converts, then reverses. Negative expected value. Detectable only by
     pattern. Encourages building analytics tooling.
130. **The Support Seeker** — Doesn't want to buy; wants a human. Consumes a staff hand. If ignored,
     converts into a churn event. **A visitor that attacks your attention budget.**
131. **The Migrating Customer** — A big client transferring in from a competitor. Arrives as a giant
     slow convoy that must be escorted for a long duration. If anything goes wrong mid-migration,
     they abort and you eat a reputation hit. **A literal escort mission built from the traffic
     system.**
132. **The Tire-Kicker** — Signs up for a trial, uses a lot, converts at ~8%. Volume play.
133. **The Night Owl** — Arrives during your maintenance window. Punishes lazy scheduling.
134. **The API Client** — Machine traffic from a paying integration: perfectly regular, high volume,
     zero patience (a timeout is a hard fail, no gradual bounce). A binary-outcome visitor that
     rewards consistency over average speed. **Teaches p99 vs. mean.**
135. **The Regional Wave** — At Tier 5, visitors arrive as population-weighted regional tides that
     follow the sun around the globe. Capacity planning becomes a *timing* game.

### 3C. Attraction — How the Player Actively Wins Traffic

This is the half of the game that TDs never have, and it's where the strategy depth lives. The
player should have **an offensive economy**, not just a defensive one.

136. **The SEO Garden** — A slow-growing, compounding attraction stat fed by uptime, page speed, and
     content investment. Takes many minutes to grow, seconds to damage. **Models "reputation is
     built slowly and lost instantly" as a literal growth curve.**
137. **Ad Spend Dial** — Cash → immediate visitor spawn rate. Instant, linear, expensive, and
     **stops the moment you stop paying**. The perfect contrast to the SEO Garden. The strategic
     question: buy traffic now or build traffic forever?
138. **Content Drops** — Spend a staff-hand on writing/marketing to create a permanent
     spawn-rate bump in a specific visitor archetype. Lets the player *choose which visitors they
     get*, and therefore *shape the difficulty of their own traffic*.
139. **The Page Speed Score** — A single visible 0-100 number derived from your actual latency
     budget. It multiplies both conversion and organic spawn rate. **One number that connects
     defensive build decisions to offensive revenue** — the game's central feedback loop made
     numeric.
140. **The Status Page (honesty as a resource)** — Publishing incidents publicly *reduces* the
     reputation damage of an outage but *advertises* that the outage happened, slightly suppressing
     new signups. Hiding incidents preserves signups but, if discovered, doubles the damage.
     **A trust/short-term-revenue tradeoff with a bluff mechanic in it.**
141. **Uptime Badge** — Cross a 99.9% threshold and earn a public badge that upgrades your inbound
     client quality tier. A milestone reward that feels earned rather than granted.
142. **Referral Program** — Pay a % of MRR to have converted customers spawn new customers. A
     revenue-for-growth conversion lever with a tunable ratio. Classic and readable.
143. **The Conference Talk** — Spend a senior staff hand for a level; gain a big one-time enterprise
     lead and a permanent hiring discount. **Trading present capacity for future capacity.**
144. **Open Source Karma** — Contribute engineering time upstream; gain reputation with the
     Researcher archetype and faster access to patches. A long-horizon investment.
145. **Partner Channel** — Sign an agency/reseller partner: they bring a steady stream of clients
     you never have to market to, but they're *low-margin* and they blame you for everything. A
     volume-vs-margin faction choice.
146. **Free Tier as a Funnel** — Deliberately serve Freeloaders well to farm conversions. Costs
     capacity now for MRR later. A build-around strategy.
147. **Price Slider** — The most important economic control in the game. Lower price → more clients
     → more traffic → more threats → faster tempo. **The player sets their own difficulty via
     pricing.** (See also idea 33.)
148. **Niche Positioning** — Declare a vertical (agencies / e-commerce / gaming / compliance-heavy).
     Shifts your inbound visitor mix, your threat mix, and your margins simultaneously. A
     mid-campaign identity choice with wide consequences.
149. **The Migration Offer** — Actively poach a competitor's clients by offering free migration.
     Costs staff hands, gains MRR, and **angers the Competitor AI** into attacking you. Offensive
     play with a retaliation mechanic.

### 3D. Client (Tenant) System — Tier 3+

150. **Clients are Spawners** — Once you're a host, you don't get visitors directly; **your clients
     do**, and their traffic flows through your infrastructure. Each client is a little visitor
     factory with its own profile. Signing a client is signing up for their traffic *and* their
     enemies.
151. **Client Cards** — Every client shows: MRR, resource appetite, traffic profile, threat
     attraction, support burden, and churn risk. **Accepting a client is a drafting decision.** The
     "Crypto Exchange" pays 5x but attracts constant DDoS and legal attention. The "Local Bakery"
     pays nothing and never causes problems. **This is the game's best recurring choice.**
152. **The Client Interview** — Before signing, spend a small amount to reveal hidden card stats.
     Information as a purchasable good. Skipping it is a gamble that occasionally lands you the
     Squatter (idea 46).
153. **Churn Pressure** — Each client tracks Happiness, driven by uptime, ticket response time, and
     price changes. Below a threshold they churn, taking their MRR **and** posting a review. Churn
     should be visible as a slow-filling meter so it's a manageable pressure, not a surprise.
154. **SLA Contracts** — Optional per-client: higher MRR in exchange for penalty clauses. **Gambling
     on your own reliability.** Beautifully self-balancing: confident players take SLAs and are
     punished for overconfidence.
155. **The Upsell Moment** — When a client is happy AND near a resource ceiling, an upsell prompt
     appears. Catching these is a skill-based income stream that rewards watching your board.
156. **Noisy Tenant Isolation** — Choose: cheap shared tenancy (higher margin, tenants interfere) or
     expensive isolation (lower margin, contained blast radius). A core architecture-level bet.
157. **The Sacrifice Decision** — Under extreme load you may **deliberately drop a client's traffic**
     to save the rest. Instant MRR loss and a reputation hit, but it prevents a cascade. Every good
     strategy game needs a "cut off your arm" button.
158. **Client Growth** — Successful clients grow, consuming more resources. Your best customer
     eventually becomes your biggest capacity problem. **Success is the threat.**
159. **The Reseller** — A client who resells your service. One card that is secretly fifty clients,
     with all the support burden hidden behind them.

---

## 4. Buildables: Services and Infrastructure

*Format: **Name** — Cost / Upkeep | **Capability** | **Surface** | **Links**. Every entry is
designed so the Surface line is a real cost, not a footnote.*

### 4A. Compute & Application Tier

160. **Web Node** — Low cost / low upkeep | Serves basic visitors; adds throughput | Surface: DDoS
     target, bad-deploy risk | Links: LB upstream, DB/cache downstream. The basic unit. Scaling it
     horizontally is the game's default answer, which makes the *vertical* alternative interesting.
161. **The Monolith (scale-up server)** — High cost / high upkeep | Huge single-node capacity, zero
     coordination overhead, fewer cables | Surface: single point of failure, and **you cannot
     upgrade it without downtime** | A genuine strategic fork against horizontal scaling.
162. **Container Host / Orchestrator** — Mid cost | Lets you move workloads between nodes freely;
     enables auto-healing | Surface: an entire new control plane that can itself fail, plus
     misconfiguration threats | The classic "power with complexity" build. Should visibly add a
     second, abstract layer of cabling that some players will hate and some will love.
163. **Serverless Edge Function** — No upkeep, per-request cost | Infinite instant burst capacity |
     Surface: cost explosion under DDoS (**an attacker can spend your money**) | A brilliant
     risk/reward object: perfect for spikes, catastrophic when attacked.
164. **Worker/Queue Pool** — Mid | Decouples slow work from the request path, *directly reducing
     latency* | Surface: queue backlog as a new failure mode, silent job loss | The main
     "architecture, not hardware" upgrade.
165. **Cron/Scheduler Node** — Cheap | Enables maintenance, backups, warmups | Surface: cron storms,
     jobs that overrun into peak hours.
166. **Staging Environment** — Pure cost, zero direct capability | Reduces Bad Deploy incident rate
     by 80% | **A building that produces no output and is obviously correct only in hindsight.**
     Excellent for teaching players to value prevention.

### 4B. Data Tier

167. **Database Primary** — High | Unlocks Power Shoppers, Enterprise Buyers, sessions, search |
     Surface: SQLi, slow queries, overload, data theft, backup corruption | **The archetypal
     Capability/Surface trade and the tutorial for Pillar P2.**
168. **Read Replica** — Mid | Offloads reads; big latency win | Surface: replication lag producing
     *wrong data* to some visitors, split-brain | The counter isn't free: stale reads cause a
     subtle, hard-to-diagnose bounce source.
169. **Cache Layer (Redis/Memcached)** — Cheap, enormous effect | Slashes latency and DB load |
     Surface: cache stampede, cold-start after restart, exposed-cache data leak | The single
     best-value early build, which makes its failure modes (63) land hard.
170. **CDN / Edge PoP** — Per-GB cost | Moves static content close to visitors; absorbs volumetric
     attacks | Surface: cache poisoning, stale content, and **it hides your real traffic patterns
     from your own analytics** | At Tier 5 this becomes a map-level placement game.
171. **Object Storage** — Cheap per GB | Offloads media | Surface: misconfigured public bucket (an
     instant, classic breach), egress bills.
172. **Search Index** — Mid | Unlocks the Comparison Shopper and deep-funnel value | Surface: index
     staleness, expensive queries, a second data store to secure.
173. **Backup Vault** — Steady upkeep, zero visible benefit | The only counter to ransomware and
     data loss | Surface: if online, it's an attack target; if offline, restores are slow |
     **Sub-choice: Fast/Online vs Slow/Offline — a pure insurance-design decision.**
174. **Restore Test Runner** — Small upkeep | Converts "we have backups" into "we have *working*
     backups" | No capability at all. The purest virtue-purchase in the game.
175. **Data Warehouse / Analytics** — Mid | **Reveals information**: which visitors bounce where,
     which threats are mimics, which client is unprofitable | Surface: another copy of sensitive
     data | An *information tower*, and information is the scarcest resource in this game.

### 4C. Network & Traffic Tier

176. **Load Balancer** — Mid | Splits traffic, enables health checks and rolling deploys | Surface:
     single choke point, connection table exhaustion | Should be the first build where the player
     feels like an architect.
177. **LB Pair (HA)** — Double cost | Removes the choke point | The first time the player pays 2x
     for zero extra capacity, purely to not die. A formative lesson.
178. **Reverse Proxy** — Cheap | Compression, TLS termination, routing rules | Surface: config
     complexity, request smuggling.
179. **Firewall** — Cheap | Blocks whole protocols/ports cleanly | Friction: near zero | Surface:
     none, but it's also *nearly useless against modern threats* — deliberately, so the player
     learns that the cheap obvious answer has a ceiling.
180. **WAF (Web Application Firewall)** — Expensive, high upkeep | Stops SQLi/XSS/traversal class |
     **Friction 3-8%, Latency +40ms** | Surface: false positives that bounce real customers, and it
     needs constant rule tuning (a recurring staff-hand cost) | **The flagship Shared Pipe tower.**
181. **Rate Limiter** — Cheap | Caps requests per source | Friction scales with aggressiveness |
     Tunable via a slider the player will move during every fight. **A tower with a live dial is
     worth ten towers with a fixed stat.**
182. **CAPTCHA Gate** — Cheap | Stops bots hard | **Friction 12%+, and higher on Mobile Commuters**
     | The bluntest instrument in the game; correct in emergencies, disastrous as a default. Should
     be available very early so players learn to regret it.
183. **Bot Fingerprinter** — Expensive, needs data | Identifies Mimics *without* friction | **The
     late-game answer to the game's central dilemma**, and therefore should be expensive, slow to
     "train," and worth every credit. A perfect capstone unlock.
184. **Scrubbing Center Contract** — Large monthly upkeep, no build cost | Diverts volumetric
     attacks upstream | Surface: adds latency *always*, even when not under attack (or requires a
     manual "flip to scrubbing" action with a 30s propagation delay — **a decision with a delay
     fuse**, which is great drama).
185. **Anycast Announcement** *(Tier 5)* — Spreads one address across regions; absorbs attacks by
     distribution | Surface: BGP complexity, route leaks.
186. **Transit Link** — Per-Mbps cost | Raw inbound capacity | Surface: metered bandwidth bills.
187. **IX / Peering Port** — Flat cost | Cheap high-volume traffic to specific networks | Surface:
     dependency on a peer who can de-peer you (see idea 14).
188. **Switch / Router** — Cheap | Required plumbing | Surface: broadcast storms, loops, a config
     you can get wrong.
189. **Out-of-Band Management (iDRAC/IPMI + console server)** — Mid | Lets you fix a dead box
     *remotely* instead of spending a physical hand | Surface: a second, weaker login surface that
     attackers love | **Converts a physical action into a remote action — a pure Pillar-P4 upgrade.**
190. **VPN / Bastion Host** — Mid | Safely exposes admin access | Surface: it *is* the admin access,
     so compromising it is total.
191. **Segmentation / VLANs** — Cheap to build, costly in flexibility | Contains blast radius: a
     compromised node can't reach the rest | Surface: none — its cost is that every future cable you
     want to run requires an extra approval step. **A build whose price is paid in future
     convenience**, which is a rare and wonderful cost type.
192. **Egress Filter** — Cheap | Stops SSRF and data exfiltration | Surface: breaks legitimate
     outbound things you forgot about (a comedic, recurring small pain).

### 4D. Observability & Response

193. **Monitoring Agent** — Cheap | Makes invisible things visible; shortens every incident |
     Surface: consumes resources, generates the logs that fill your disk (87).
194. **Log Aggregator** — Mid | Required for forensic/detective levels; unlocks Postmortem Research
     | Surface: storage cost, and it's a juicy target containing secrets.
195. **IDS/IPS** — Mid | Detects Stealth-role threats; the *only* counter to APTs | Friction: false
     positives; Surface: alert fatigue as a literal mechanic — too many alerts and the player's
     real ones get buried in noise. **A tower that can be over-leveled into uselessness.**
196. **Honeypot** — Cheap, fun | Attracts attackers to a fake target, wasting their time and
     **generating intel that unlocks tech** | Surface: if misconfigured, a real foothold. The best
     "playful" build in the game.
197. **Alerting / Pager** — Cheap | Converts a silent failure into a notification | Its upgrade path
     is about *precision*, not power: fewer, better alerts. Refreshing inversion of upgrade logic.
198. **Runbook Automation** — Expensive | Converts a manual response you've performed 3+ times into
     an automatic standing rule | **The single most satisfying unlock category in the game.**
199. **Auto-Scaler** — Mid | Adds capacity automatically under load | Surface: **scales up under
     attack too, spending your money on serving the attacker** — unless you also built the Bot
     Fingerprinter. A gorgeous system interaction.
200. **Chaos Monkey** *(optional, self-inflicted)* — Randomly kills your own services. Costs you
     uptime now; permanently reduces the damage of real failures because you'll have built for it.
     **An opt-in difficulty increase that is also a strategy.** Players will love or hate it, which
     means it's a good mechanic.
201. **Status Page** — Cheap | Reduces ticket volume during incidents (deflects Support Seekers) |
     Surface: publicly advertises your downtime. See idea 140.

### 4E. Staff (units with hands, not stats)

202. **The Sysadmin** — 1 hand. Generalist. Performs any manual action at base speed.
203. **The Network Engineer** — 1 hand, 2x speed on cabling/routing/BGP tasks, refuses to touch
     application problems (comedic, and mechanically forces role diversity).
204. **The Security Engineer** — 1 hand; passively reduces Surface on all builds; unlocks the
     security branch of research.
205. **The SRE** — Expensive. Doesn't do manual work — **builds automation**. Converts hands into
     permanent standing rules. The "invest in the future" unit.
206. **Support Rep** — Cheap. Absorbs tickets and Support Seekers, protecting engineer hands.
     **The unit that protects your other units' attention.**
207. **Sales** — Generates client leads; the quality of leads depends on your reputation, so sales
     without ops is worthless (a nice anti-degenerate-strategy check).
208. **The Developer** — Improves application efficiency (reduces per-request cost) but **increases
     Bad Deploy frequency**. Progress with a risk attached.
209. **The Intern** — Nearly free, 0.5 hands, small chance of causing an incident. Over time, can be
     trained into a full Sysadmin. **A unit that is an investment with a variance tax.**
210. **The Greybeard Consultant** — Rentable for one level at high cost. Instantly diagnoses any
     mystery. An expensive "get unstuck" button that respects the player's time.
211. **On-Call Rotation** — A roster mechanic: assign who covers nights. Covering nights costs the
     next day's effectiveness (fatigue). **You are managing a sleep budget**, which is the most
     authentic operations mechanic imaginable and also a genuinely novel resource.
212. **Morale / Burnout Meter** — Team-wide. Fed by incident frequency and overtime; drained by
     quiet weeks and by *actually fixing root causes* instead of firefighting. **Rewards the player
     for choosing durable fixes over quick ones**, which is exactly the value the game wants to teach.
213. **Documentation** — A buildable "structure" that reduces the Key Person Risk penalty and speeds
     every staff action slightly. Boring, cheap, correct — and players will still skip it.

### 4F. Facilities (Tier 3+)

214. **Rack** — Grants U slots. The physical inventory grid.
215. **PDU (single/dual)** — Power distribution; dual-cording is the classic pay-2x-for-nothing
     insurance purchase.
216. **UPS** — Bridges power gaps measured in seconds-to-minutes. A literal countdown bar during
     power events.
217. **Generator** — Bridges long outages | Requires monthly test upkeep; skipping tests silently
     raises failure chance. **Upkeep you can cheat on, with hidden consequences** — one of the best
     tension devices available.
218. **CRAC / Cooling Unit** — Removes heat proportional to rack density. Creates the **hot aisle
     puzzle**: packing racks densely is space-efficient and thermally suicidal.
219. **Hot/Cold Aisle Layout** — A *free* bonus available only if you arrange racks correctly.
     Layout skill rewarded with efficiency — great for players who enjoy spatial optimization.
220. **Fire Suppression** — Pure insurance | Sub-choice: water (cheap, destroys hardware) vs inert
     gas (expensive, saves hardware) vs none (gambling).
221. **Badge Reader / Mantrap** — Blocks the Tailgater and Evil Maid physical threats | Friction:
     slows your own staff's physical actions. **The Shared Pipe principle applied to the building
     itself** — lovely symmetry.
222. **Camera / Access Log** — Forensic capability after a physical incident.
223. **Spares Bin** — Pre-purchased disks/PSUs on site. Converts a 10-minute RMA wait into a
     30-second swap. **Pre-paying for response time** — a wonderfully "ops" flavored upgrade.
224. **Crash Cart** — Lets a hand work on a machine with no network. Niche, and one day it saves you.
225. **Cross-Connect** — Physical cable to another tenant/carrier in the building. The colo-tier
     link primitive, with a monthly fee per cable — **so cabling literally costs upkeep**, which
     makes tidy topology an economic decision.
226. **Remote Hands Contract** — Pay the facility to perform physical actions for you. Slower and
     more expensive than doing it yourself, but it doesn't consume your staff. **Outsourcing
     attention** — a direct Pillar-P4 lever.

---

## 5. Unlocks and Discovery

*Design principle for this whole category: **unlocks should be earned by experience, not by
currency.** A tech tree you buy is a shopping list. A tech tree you unlock by living through things
is a memoir. The second one is the game.*

### 5A. The Core Unlock Engines

227. **Postmortem Research (the primary engine)** — **You cannot research a counter until you've
     been hit by the threat it counters.** Getting SQL-injected unlocks the WAF research node.
     Losing a disk unlocks RAID. A power event unlocks the generator. This inverts the usual TD
     structure: *the enemy teaches you the tower.* It makes every loss productive, it makes the
     difficulty curve self-pacing, and it means two players' tech trees look different by hour three.
228. **The Scar Tree** — The tech tree UI *is* your incident history. Nodes are grayed-out and
     unnamed until a matching incident occurs, at which point the node lights up with the date and
     a one-line description of what happened to you. **Your tech tree becomes a personal narrative
     artifact.** Enormously shareable.
229. **Tabletop Exercise** — The paid shortcut: spend cash + a senior staff hand to *simulate* an
     incident you haven't had, unlocking its research node without the damage. Expensive, and it
     requires you to guess correctly what's coming. **Turns foresight into a purchasable action**
     and gives experienced players a way to skip the pain.
230. **Log Reading (active discovery)** — Some unlocks are hidden in the log stream and only appear
     if the player *opens the log panel and clicks the anomalous line*. A quiet, optional
     detective layer for players who like to poke. Reward: rare research nodes and early threat
     warnings. Never mandatory — but the players who do it will feel clever, and the ones who don't
     will never feel punished.
231. **Honeypot Intel** — Honeypots (196) passively generate "Intel" currency. Intel buys research
     into threats you *haven't* been hit by yet. **Converts a defensive build into a progression
     engine.**
232. **Boss Blueprints** — Defeating a boss-tier threat drops a schematic: surviving a nation-state
     grants you their toolkit as a defensive capability. Classic and satisfying.
233. **The Runbook Ladder** — Perform the same manual action 3 times → the game offers to write a
     runbook (semi-automatic, still needs a click). Do it 3 more times → full automation. **The
     game notices what's annoying you and offers to fix it.** This is the single best
     quality-of-life-as-progression idea in the document; it makes the player feel *seen*.
234. **Vendor Relationships** — Buying repeatedly from one vendor unlocks their premium line and
     better support response times. Also creates lock-in: switching vendors later costs a
     re-learning penalty. **Loyalty as a tech tree with a trap in it.**
235. **Certifications** — Spend staff time + money to earn compliance badges (PCI-ish, SOC-ish, ISO-
     ish, thematically renamed). Unlocks the **Enterprise Buyer** and government client tiers.
     A pure "grind for access to a better market" gate, which is very authentic.
236. **Conference / Community Rep** — Talks, blog posts, and open-source work generate a reputation
     currency that unlocks *hiring* (better staff apply to you) rather than tech. **A separate
     unlock economy for people instead of things.**
237. **The Bug Bounty Program** — Pay out to Researchers. Unlocks early warnings and reduces
     zero-day damage. Has a running cost and occasionally a bill you didn't expect.
238. **Failure-Only Nodes** — A handful of powerful techs that can *only* be unlocked by suffering
     a catastrophic loss (total data loss unlocks the elite backup branch; bankruptcy unlocks the
     financial-discipline branch on your next run). **Rewards for failing in an interesting way.**
239. **The Mystery Box Reverse-Engineer** — In Acquisition levels, spending hands on the undocumented
     server eventually reveals what it does — occasionally something genuinely great. A gambling
     minigame built out of technical debt.

### 5B. Tech Tree Branch Sketches

240. **Branch: Speed** — Cache → CDN → Edge Compute → Prefetch/Prewarm → HTTP/3 → Predictive Warm.
     Payoff: raises Page Speed Score, which raises *everything else*. The compounding branch.
241. **Branch: Scale** — LB → Autoscale → Orchestration → Multi-AZ → Multi-Region → Anycast.
     Payoff: capacity ceiling. Costs: complexity, which literally adds new failure event types to
     your random table.
242. **Branch: Shield** — Firewall → Rate Limit → WAF → Behavioral Analysis → Fingerprinting →
     Adaptive Defense. **Every node in this branch trades Friction for Protection, and the branch's
     endgame is "protection with zero friction," which is the thing the whole game has been teaching
     you to want.** Perfect capstone design.
243. **Branch: Sight** — Monitoring → Logging → Tracing → Anomaly Detection → Forecasting.
     Payoff: information. Its capstone extends the wave-preview horizon — an upgrade to *knowledge*.
244. **Branch: Endurance** — RAID → Backups → Restore Testing → Replication → Failover → DR Drills.
     Payoff: nothing visible, ever, until the day it's everything.
245. **Branch: People** — Hiring → Onboarding → Documentation → Automation → On-Call Health →
     Blameless Culture. Payoff: more hands and fewer self-inflicted incidents. **A tech tree made of
     process**, which no TD has, and which this theme makes natural.
246. **Branch: Commerce** — Billing → Upsells → Contracts/SLA → Channel Partners → Enterprise Sales.
     Payoff: money per visitor rather than more visitors.
247. **Branch: Facility** — Power → Cooling → Physical Security → Redundancy → Efficiency (PUE).
     Payoff: cost per unit of capacity. The "margin" branch.
248. **Cross-Branch Synergy Nodes** — A small number of nodes that require **two** branches
     (Autoscaler + Fingerprinting = "Scale Only For Humans"; Logging + People = "Blameless
     Postmortem," which turns incidents into research at double rate). **Synergy nodes are where
     build identity comes from** — they reward specialization in a specific pair.
249. **Mutually Exclusive Nodes** — A few forks where taking one permanently locks the other for the
     run: "Managed Everything" (cheap, fast, but you can't customize and vendor outages hit you) vs
     "Roll Your Own" (expensive, slow, total control). Real identity-defining commitment.
250. **The Deprecation Mechanic** — Some early tech becomes *obsolete and starts costing more* as
     the campaign advances (that old server needs an OS you can't patch). **A tech tree that rots**,
     forcing continual reinvestment instead of a finished build. Keeps late-game from going static.
251. **Rediscovery on Prestige** — After "The Exit" (28), you keep a small number of chosen nodes
     permanently unlocked. Picking *which* memories to keep is the meta-progression choice.

### 5C. Discovery Moments (the "oh!" beats)

252. **First Cache Hit** — The moment the player installs a cache and watches the latency bar
     collapse. Should be given the full audiovisual treatment; it's the game's first big dopamine hit.
253. **First Mimic Identified** — The first time the Fingerprinter colors a "visitor" red, revealing
     that a chunk of your "traffic" was never real. Reframes the entire game. Should be scripted to
     land at a specific campaign point.
254. **First Automated Response** — You go to click the restart button and it's already been clicked.
     Small, quiet, enormously satisfying.
255. **First Time a Backup Saves You** — Scripted to happen at least once, because the emotional
     payoff retroactively justifies dozens of boring purchases.
256. **First Deliberate Sacrifice** — The first time you null-route your own customer. The UI should
     make it feel heavy: a confirmation, a name, a number.
257. **The Graph You Didn't Have** — A moment where the game shows you, post-incident, the graph
     that *would have* told you what was happening — if you'd built the monitoring. Teaches by
     regret, once, gently.

---

## 6. Economy, Money, and Scoring

### 6A. The Currency Set (why four and not one)

258. **Cash** — Spendable now. Buys buildings, staff, emergency capacity. Volatile.
259. **MRR (Monthly Recurring Revenue)** — The *real* score. Slow to build, sticky, compounding.
     Adds to cash every billing tick. **The game is about converting Cash into MRR without dying in
     the middle.**
260. **Reputation** — Gates client quality and organic spawn rate. Earned in minutes, lost in
     seconds. Not spendable — it's a *multiplier*, which makes it feel different from money and
     stops players from treating it as just another resource.
261. **Intel** — Buys research into the unknown. Earned by honeypots, logs, and surviving incidents.
262. **Hands / Attention** — The hard cap on everything (Pillar P4). Not tradeable except via hiring
     and automation.
263. **Trust (late-game)** — A slow-moving Enterprise-tier stat built from audited uptime and
     certifications. Gates the top revenue tier. Deliberately impossible to buy quickly, so late-game
     progression has something money can't rush.

### 6B. Revenue Streams

264. **Per-Visitor Conversion** — The Tier 0-2 income model. Fast, spiky, tied directly to
     performance. Teaches the latency→money link viscerally.
265. **Ad Impressions** — Revenue per *served page*, not per conversion. Rewards raw volume over
     quality. A distinct strategy for players who'd rather serve 100k skimmers than 100 shoppers.
266. **Hosting Plans (MRR)** — Tiers: Shared / VPS / Dedicated / Managed, each with a margin and a
     support-burden profile. **The core Tier 3+ income model.**
267. **Overage Billing** — Charge clients for bursts. Lucrative and **it makes a DDoS against your
     client profitable for you**, which is a hilariously authentic and morally interesting wrinkle.
268. **Setup Fees** — One-time cash injections on signing. Tempting for players in a cash crunch,
     which creates a "sign bad clients to make payroll" death-spiral risk. Good trap.
269. **Managed Services Upsell** — Higher margin per client but consumes staff hands. **Revenue that
     costs attention**, forcing the player to weigh money against capacity to respond.
270. **Professional Services / Migrations** — One-off cash for staff time. The classic
     consulting-to-cover-payroll lever.
271. **Domain & SSL Resale** — Tiny margin, near-zero effort, adds up. The "passive trickle" income.
272. **Colocation / Cross-Connect Fees** *(Landlord levels)* — Rent for space, power, and cables.
     Extremely stable, extremely low-margin.
273. **Backup / DR as a Product** — Sell the thing you already built for yourself. **Turning a cost
     center into a revenue stream is a genuinely great mid-game unlock feeling.**
274. **CDN Resale** — Sell edge capacity to clients; it also improves your own resilience. A build
     that pays twice.

### 6C. Costs and Cash Flow

275. **The Payroll Tick** — Salaries hit on a visible, dreaded schedule. Missing payroll causes
     immediate morale collapse and staff departures. **A recurring cliff, not a slow drain**, which
     creates rhythm.
276. **Power Bill** — Scales with *actual utilization*, so an idle over-provisioned fleet is
     expensive and a cryptominer (72) is directly visible as a bill anomaly.
277. **Bandwidth (95th Percentile Billing)** — Billed on your 95th-percentile usage, not your
     average. **So five bad minutes set your bill for the whole month.** A magnificent mechanic: it
     makes a short, survivable attack financially devastating, and it rewards traffic *smoothing*
     as a strategy.
278. **Hardware Depreciation** — Servers lose capability over time (they don't break, they just get
     slower relative to demand) and eventually cost more to run than to replace. Forces refresh
     cycles and keeps the mid-game from calcifying.
279. **Licensing & Vendor Increases** — Annual price hikes on things you depend on. Models the slow
     upward pressure of Pillar P3 and occasionally forces a migration.
280. **Transit Commit** — You commit to N Mbps for a discount. Under-use and you paid for nothing;
     over-use and the overage rate is brutal. **A forecasting bet with a penalty on both sides.**
281. **SLA Credits** — Downtime literally refunds money to clients. **Outages cost revenue twice:**
     lost conversions plus credits. Makes uptime the central financial metric rather than an
     abstract score.
282. **Incident Cost Accounting** — After every incident, a small receipt: "Outage 4m12s — 1,840
     bounced visitors, $312 lost conversion, $900 SLA credits, 2 tickets, -3 reputation." **Putting
     a dollar figure on every failure is how the player learns to price prevention.**
283. **The Loan** — Borrow cash against future MRR. Interest scales inversely with your Uptime
     Streak (27). **Your reliability is your credit rating** — a gorgeous systemic link between
     ops quality and finance.
284. **Investor Round** — Big cash for a permanent growth mandate (quarterly targets you must hit or
     eat penalties). The Faustian option.
285. **Insurance** — Pay a premium to cap catastrophic losses. Claims raise your future premium.
     Genuinely fun to reason about, and it's a *second* insurance system layered on the in-fiction
     insurance (backups, redundancy) — players will enjoy the recursion.
286. **The Margin Readout** — A persistent, honest "$/visitor served" and "$/watt" display. **Gives
     optimization players a number to grind against** without adding a subsystem.

### 6D. Pricing as a Mechanic

287. **The Price Slider** — Global or per-plan. Lower = more volume, lower margin, worse client
     quality, faster tempo. Higher = fewer, better, calmer, but more fragile (lose one whale and
     you're in trouble). **The purest strategic dial in the game.**
288. **Overselling Ratio** — Sell 5x the resources you have, betting clients won't all use them at
     once. Enormous margin. **Occasionally, they all use them at once.** A dial that is literally
     a gamble knob, with a probability the player can learn to read.
289. **Grandfathering** — Raising prices only applies to new clients unless you explicitly break
     grandfathering, which triggers a churn + reputation event. A satisfying "do I dare" moment.
290. **Introductory Pricing** — Cheap first term, then a jump. Boosts signups, raises churn at
     renewal. Short-term/long-term tension in a single toggle.
291. **The Race to the Bottom** — If the player undercuts the Competitor AI, the Competitor
     undercuts back. Continue and both of you bleed. **A prisoner's dilemma with an AI opponent**,
     resolvable by differentiating on quality instead — which is the lesson.

### 6E. Scoring, Rating, and End-of-Level

292. **The Five Nines Rating** — Levels are graded in nines: 99%, 99.9%, 99.99%... Displayed as
     literal glowing nines. An instantly legible, thematically perfect star rating.
293. **The Four-Axis Scorecard** — Every level ends with: **Uptime / Speed / Security / Margin.**
     You are graded on all four, and **maxing all four is nearly impossible** — the level's
     par is designed so the player must choose which two to excel at. Replay incentive baked in.
294. **The Postmortem Screen** — Not a score screen, a *document*: a timeline of incidents, the
     cost of each, what would have prevented it, and the graph of visitor bounce over time.
     **The score screen as a teaching tool.** Players will screenshot these.
295. **The Traffic Sankey** — End-of-level flow diagram: 100,000 visitors arrived → 12k bounced at
     DNS → 8k bounced on latency → 3k blocked by your own CAPTCHA → 61k converted. **Seeing how
     many customers your own defenses killed is the emotional core of the game's scorecard.**
296. **Attacker Ledger** — The mirror: what each attack cost you, what stopped it, what got through
     unnoticed. Reveals the Stealth units you never saw — a genuine gut-punch when it works.
297. **Par Times / Efficiency Medals** — Optional challenge medals: survive with under N buildings,
     under $X upkeep, zero CAPTCHAs, zero customers sacrificed. **Constraint medals are the cheapest
     replayability you can buy.**
298. **The Win Condition Set** — Levels can require: survive N waves / reach $X MRR / convert N
     visitors / maintain 99.9% for the duration / complete a migration / identify the intruder /
     end with positive cash. Mixing these is what keeps the campaign fresh (see §1C).
299. **Lose Conditions (multiple, distinct, all thematic)** —
     - **Bankruptcy** (cash < 0 at a payroll tick) — the slow, honest death.
     - **Reputation Zero** — nobody comes anymore; the lane is empty; you starve. **A loss state
       where nothing is attacking you at all** — chilling and unique to this genre.
     - **Total Data Loss** — a hard fail regardless of money.
     - **Upstream Disconnection** — ignored abuse complaints get you cut off. Death by neglect.
     - **Regulatory Shutdown** — the compliance failure ending.
     - **Team Collapse** — everyone quits; you have zero hands; you can still see the board but you
       can't touch it. **The most horrifying lose state available**, and a perfect punishment for
       ignoring the People systems.
300. **Soft Failure Over Hard Failure** — Most failures should degrade you, not end you. The game's
     death should be a *trend* the player can see coming for three minutes and fight against. Only
     Data Loss is instant.
301. **The Comeback Curve** — Explicitly design an economy where a player at 20% health can recover:
     low reputation means fewer visitors means fewer threats, and cheap "survival mode" builds
     exist. **The bottom of the curve must be playable**, or players quit instead of rebuilding.

---

## 7. Core Gameplay Mechanics

### 7A. The Board: Flow, Not Path

302. **Traffic as Flow, Not Creeps (the central mechanical decision)** — Early tiers render
     individual units walking a lane (readable, cute, teaches the rules). From Tier 3 up, traffic
     becomes a **flow with volume, composition, and pressure** moving through a *graph* of nodes and
     links. The units don't disappear — they become the visible "texture" of the flow, with
     individual high-value units (Whales, Influencers, Mimics, bosses) still rendered discretely.
     **Named units at every scale, ambient flow underneath.** This is how you keep a TD readable at
     500 racks.
303. **Links Have Capacity** — Each cable/link has a throughput number. Exceed it and traffic
     **queues**, which adds latency, which bounces visitors. Nothing "breaks"; it just gets slower.
     **Congestion is the primary failure mode**, and it's beautifully continuous rather than binary.
304. **Backpressure** — When a downstream node saturates, the queue propagates upstream. The player
     literally watches a red tide creep backward through their topology from the DB to the LB to the
     edge. **The single most valuable diagnostic visual in the game** — you can see the root cause
     because it's the far end of the red.
305. **The Bottleneck Highlight** — Any time the board has a single limiting node, it pulses. The
     game tells you where the problem is; the *interesting* decision is what to do about it, not
     where it is. Removing false difficulty (hunting) preserves real difficulty (choosing).
306. **Topology Matters** — Same set of buildings, different wiring, different outcomes. A DB wired
     directly to the internet is fast and suicidal. A DB behind a cache behind an app behind an LB
     is slow to build and hard to kill. **The player's creativity lives in the graph, not the
     shopping list.** This is what makes it a building game and not a placement game.
307. **The Blast Radius Overlay** — Hover any node: the game shades everything that dies with it.
     Instantly teaches redundancy and segmentation without a tutorial. **One of the highest-value
     UI features in the whole design.**
308. **Chokepoints vs Meshes** — A chokepoint is cheap, inspectable, and a single point of failure.
     A mesh is expensive, resilient, and impossible to fully inspect (threats can take unmonitored
     paths). **A permanent architectural tradeoff the player revisits at every tier.**
309. **Path Preference & Failover Order** — The player sets priorities on links; on failure, traffic
     reroutes down the next-best path. Getting failover order wrong is a great, subtle mistake —
     traffic reroutes onto a link that can't carry it and you cascade.

### 7B. The Connection Interaction (how you actually wire things)

*This deserves real design attention — it's the verb the player performs a thousand times.*

310. **Drag-a-Cable (the primary verb)** — Click and hold a **port** on one object, drag; a live
     cable follows the cursor with real sag/tension; valid targets glow, invalid ones dim with a
     reason tooltip ("no free port," "wrong VLAN," "would create a loop"). Release to connect.
     Tactile, physical, universally understood. **The cable should have weight and snap satisfyingly.**
311. **Ports Are Finite** — Every object has a visible, countable number of ports. Running out of
     switch ports is a real, physical constraint that makes you buy another switch. **Finite ports
     turn wiring into inventory management**, which is far more interesting than unlimited links.
312. **Cable Types as Meaningful Choices** — Copper (cheap, short, slow), Fiber (expensive, long,
     fast), Direct-Attach (very fast, very short — forces physical adjacency). **Cable choice
     constrains layout**, so your floor plan and your network diagram become the same puzzle.
313. **Cable Length Costs** — Longer runs cost more and add a hair of latency. Tidy, short topology
     is mechanically rewarded. Encourages good layout without lecturing.
314. **Wiring Mode (the bulk verb)** — Hold Tab (or click a wrench) to enter a schematic overlay:
     the physical world fades, the graph comes forward, and you can drag many links quickly with
     snapping and auto-routing. **Two views of the same truth: the Rack View (physical, pretty) and
     the Topology View (logical, clear).** Switching between them is instant and animated so the
     player never loses their mental model.
315. **Click-to-Link for Accessibility / Controller** — Click source, click target. Same result. The
     drag is the *feel*; the click is the *floor*. Ship both.
316. **Templates / Copy a Wiring Pattern** — Select a wired group, save as a template ("Standard Web
     Tier"), stamp it down pre-wired for a cash premium. **Late-game QoL that respects that the
     player already proved they know how.** Pairs with the Runbook Ladder (233) philosophy.
317. **The Patch Panel** — At Tier 3+, an optional intermediate object that makes re-wiring cheap.
     Costs money and ports up front; saves enormous time later. **A build whose only benefit is
     making future edits easier** — an infrastructure-investment decision expressed as UI friction.
318. **Cable Management Score** — A soft, comedic stat: messy wiring (crossings, long runs, spaghetti)
     raises the chance that a physical hand action touches the wrong cable (101), and lowers staff
     action speed at that rack. **Tidiness as a real mechanic**, which will delight exactly the kind
     of person who plays this game.
319. **Link Health Rendering** — A connection's appearance carries its state at a glance:
     - thickness = capacity, brightness = utilization
     - flowing dots = traffic, dot color = traffic composition (green legit / red threat / gray
       unknown)
     - amber pulse = congested, red dashes = errors, gray dotted = down
     - **a visible "kink"** where a queue is forming
     So you never have to click a link to know how it's doing.
320. **Logical Links vs Physical Links** — Later, you configure logical routes *on top of* physical
     cables. A physical cut breaks several logical paths at once. Adds a layer without adding a
     second wiring chore, because logical links are drawn with lasso/route tools, not cables.
321. **Auto-Route Assist (with a cost)** — A button that wires a valid topology for you. It always
     picks a *correct but unimaginative* layout: safe, more expensive, slightly slower. **A ramp for
     new players that expert players will beat by hand** — the best kind of assist.
322. **Disconnect Is Dangerous** — Pulling a live cable drops traffic immediately. Held-modifier
     required. At higher tiers, you can "drain" a node first (stop sending it new traffic, let
     existing sessions finish) — **a graceful-shutdown verb that is itself an unlock.** Learning to
     drain before you pull is a real skill moment.

### 7C. Placement & Space

323. **Rack U as Inventory Tetris** — Servers occupy 1U/2U/4U. Racks hold 42U. Big powerful machines
     eat space. **Physical packing puzzle with strategic weight** (density vs heat vs blast radius).
324. **Power Budget per Circuit** — Each rack sits on a circuit with an amp limit. Exceeding it trips
     a breaker and takes the whole rack down. **A second, invisible dimension of packing** — players
     will over-pack once and never again.
325. **Thermal Map** — Heat accumulates by density; cooling removes it by placement. A visible heat
     overlay makes this a spatial optimization layer rather than a hidden stat.
326. **Adjacency Effects** — Direct-attach cables and low-latency links require physical proximity.
     **The physical layout and logical topology pull against each other**, which is exactly the kind
     of tension that makes layout interesting instead of decorative.
327. **The Move Cost** — Relocating a running server costs downtime or a maintenance window.
     Punishes sloppy early planning, gently. Pairs with the Patch Panel (317) as the antidote.
328. **Zones & Blast Domains** — Draw a zone; everything inside shares power, cooling, and fate.
     **Deliberately spreading redundant pairs across zones is the core Tier 4 skill.**

### 7D. Time, Tempo, and Player Actions

329. **Pause With Orders** — Full pause, queue actions, unpause and watch them execute. Essential for
     a game with this much simultaneous stuff. **The strategy lives in planning; the tension lives in
     watching your plan meet reality.**
330. **Speed Controls with a Catch** — 1x/2x/4x, but **manual actions execute at a fixed real-world
     duration**, so fast-forwarding through peacetime is free while fast-forwarding through an
     incident is dangerous. The speed control becomes a risk decision.
331. **The Maintenance Window** — A schedulable period where changes are safe (no visitor penalty for
     brief disruption) but **it's a fixed slot you have to plan around**, and it happens at 3am so it
     costs staff fatigue. Converts "when do I make this change?" into a real decision.
332. **Hands as Action Slots** — Visible tokens at the bottom of the screen, one per available staff
     member. Every manual action consumes one for its duration. **Seeing your last free hand get
     consumed while three alerts are firing is the game's best panic moment.**
333. **The Pager** — Incoming incidents queue in a pager list with severity. You choose the order.
     **Triage as a core verb** — the game is often about deciding what *not* to fix.
334. **The Ship-It-Friday Button** — Deploy an improvement immediately (big benefit) with an elevated
     chance of a Bad Deploy, or schedule it for the maintenance window (safe, delayed).
     **A voluntary gamble available at all times** — the purest risk/reward button in the game, and
     a joke everyone in the audience will get.
335. **Degraded Mode Toggles** — Emergency switches that trade capability for survival: disable
     search, serve static-only, turn off image resizing, read-only mode. **Deliberately making your
     product worse to stay alive** is a fantastic, under-used strategy verb.
336. **The Big Red Button (Null Route)** — Drop all traffic from a source/region/customer. Instant
     relief, instant collateral damage. Confirmation required. Should feel heavy every time.
337. **Undo Window** — A 3-second undo on *build* actions only (never on destructive ops). Removes
     misclick frustration without removing consequence.
338. **Change Freeze** — Declare a freeze during a critical period: no builds allowed, but incident
     rate drops sharply. **Voluntarily surrendering your own agency for safety** — an unusual and
     interesting player choice.
339. **Autopilot Delegation** — Assign a staff member to "own" a subsystem; they handle its routine
     incidents without consuming your attention, at reduced effectiveness. **Trading control for
     bandwidth.**

### 7E. Upgrades

340. **Scale Up vs Scale Out (the recurring fork)** — Every capacity problem offers both: a bigger
     box (cheap, fast, fragile, downtime to install) or more boxes (expensive, resilient, needs an
     LB, more cables, more upkeep). **Neither is dominant, and the right answer changes by tier.**
341. **Tuning Instead of Levels** — Many buildings upgrade not by "Level 2" but by **configuration
     sliders** (cache TTL, worker count, rate limit threshold, WAF aggressiveness). Free to change,
     instantly effective, and **a player who understands the systems beats a player who just spends
     money.** This is the skill ceiling.
342. **The Tuning Cost** — Changing config takes a hand and a brief reload. So you can't micro-tune
     every second — you tune between waves. Preserves the rhythm.
343. **Soft Caps & Diminishing Returns** — The 5th web node adds less than the 2nd. Pushes players
     toward *architecture changes* (cache, queue, CDN) instead of infinite duplication. **Prevents
     the classic TD degenerate strategy of "just build more of the best tower."**
344. **Retrofit vs Rebuild** — Old builds can be upgraded in place (cheap, keeps accumulated
     configuration and trust) or replaced (expensive, better, resets tuning). A nostalgia tax.
345. **Efficiency Upgrades** — Some upgrades add no capability, just lower upkeep. **Boring on
     purpose** — and in an economy driven by Pillar P3, they're often the correct buy. Players who
     discover this feel smart.
346. **Cross-Building Buffs** — Monitoring makes every nearby building's incidents shorter.
     Documentation speeds all staff actions. **Support buildings that multiply rather than add**,
     which creates build-order depth.

### 7F. Failure & Recovery

347. **Cascading Failure with Visible Fuse** — Failures propagate along links with a short,
     animated delay, so the player can *see the cascade coming* and has 2-4 seconds to intervene
     (drain a node, shed load, null-route). **A cascade you can watch and fight is drama; one that
     resolves instantly is just damage.**
348. **The Brownout** — Partial degradation: 30% of requests fail. Worse than a clean outage for
     diagnosis, better for revenue. The game should have many more brownouts than outages.
349. **Graceful Degradation Ladder** — Under load, a well-built system automatically sheds features
     in a player-configured priority order (drop image resizing → drop search → drop personalization
     → static only). **Pre-configuring your own failure order is a genuinely novel strategic task.**
350. **Recovery Order Matters** — After a total outage, bringing services back in the wrong order
     causes a retry storm (63) that knocks you down again. **A puzzle inside the recovery**, which
     makes the comeback skillful rather than automatic.
351. **The Incident Timeline** — A live, scrolling record during an incident that becomes the
     Postmortem (294). Being able to *see* what happened in what order is what makes incidents
     learnable instead of chaotic.
352. **Root Cause vs Band-Aid** — Every incident offers a fast fix (restart it, 5 seconds) and a real
     fix (expensive, takes a hand for 60 seconds, prevents recurrence). Band-aids **stack a hidden
     debt** that eventually triggers a bigger failure. **The game's most honest mechanic.**
353. **Technical Debt Meter** — Visible. Rises with band-aids, rushed deploys, skipped documentation.
     Raises incident frequency across the board. Payable down with dedicated staff time that
     produces nothing else. **Players will hate paying it, which is the point.**
354. **The Postmortem Choice** — After each incident: "Blame" (fast, free, morale -) or "Blameless"
     (costs a hand, morale +, converts the incident into Intel/research). **A values choice with
     mechanical teeth.**

---

## 8. Visuals and Presentation

*Lens note: judged purely on **legibility under load** and **feedback clarity**. A TD's art
direction is a readability system first and an aesthetic second.*

### 8A. Art Direction

355. **Clean Isometric, High Contrast, Flat-ish** — Readable silhouettes over detail. Racks and
     servers are simple boxes with strong, distinct front-panel light patterns. The art must survive
     being 40px tall.
356. **The Color Language (locked, never violated)** — Green = healthy traffic/revenue. Red =
     threat. Amber = degraded/congested. Blue = infrastructure/idle. Purple = unknown/unidentified
     (the Mimic color). White flash = money event. **Purple is the emotional heart of the palette**
     because "I don't know what that is" is the game's signature feeling.
357. **Threat Silhouette Rules** — Every threat class has a distinct silhouette readable at a
     glance: swarms are many small angular shards; tanks are big slow blocks; stealth units are
     *outlines only*; splitters have visible seams; sappers have a straw/siphon shape; mimics look
     exactly like visitors **except for one tiny tell** the player learns to spot (a slightly too-
     regular gait, a footstep that lands on the beat). **Teaching players to see the tell is the
     game's deepest skill.**
358. **Visitor Design** — Small, warm, rounded, humanoid-ish glyphs with a **patience ring** around
     them that drains from green through amber to red. When it empties they don't die — they
     **turn around and walk back out**, which is far more affecting than an explosion. A steady
     stream of people walking away from your building is the best "you're losing" visual imaginable.
359. **Value Shown as Size/Glow** — High-value visitors are bigger and brighter. Whales have a gold
     aura. **You can see revenue walking down the lane**, which makes protecting it emotional.
360. **The Lane vs The Graph** — Tier 0-2: a literal lane with walking units. Tier 3-4: nodes and
     links with flowing particles. Tier 5: a globe with arcs. Each transition should be a scripted
     "camera pulls back" cinematic moment; the previous view is always still reachable by zooming in.
361. **Level of Detail by Zoom** — Zoomed in: individual packets, blinking drive lights, a tech
     walking with a cart. Mid: nodes, bars, flows. Zoomed out: a heat/health map of colored blocks.
     **Nothing is ever "too small to read" — it just becomes a different, coarser truth.**

### 8B. Expressing the Core Tension Visually

362. **The Latency Ladder** — A vertical bar along the screen edge showing the latency contribution
     of each hop as stacked colored segments. When you add a WAF, a new segment visibly pushes the
     total past the bounce threshold line. **The Shared Pipe pillar rendered as one widget.**
363. **The Bounce Threshold Line** — A horizontal line on that ladder. Traffic above it bounces.
     Everything you build pushes the stack toward it. **Simple, constant, merciless.**
364. **The Sieve Visual** — At each defensive tower, traffic visibly *splits*: red units get zapped,
     green units pass, and **a few green units get zapped too**, tumbling out sideways with a sad
     little puff. The friction cost is never a hidden number — you *watch* your customers get
     killed by your own firewall. **This one visual carries the game's whole thesis.**
365. **Money Motes** — Converted visitors emit a coin that arcs to the cash counter. Lost visitors
     emit a small gray wisp that fades. The screen's overall warmth tracks your margin.
366. **The Red Tide (backpressure)** — Congestion renders as color creeping *backward* along links
     from the saturated node. Root cause is always the far end of the red. See 304.
367. **Rack Front-Panel Language** — Status is told by drive/NIC lights: steady green (fine), fast
     flicker (busy), amber (degraded), red (failed), dark (dead). **Reading a rack at a glance is a
     skill the game teaches through pure visual pattern** — deeply authentic and deeply legible.
368. **The Heat Bloom** — Thermal problems render as a visible orange haze over a rack region.
     Spatial problems get spatial visuals.
369. **Attack Telegraphs** — 5-10 seconds before a big wave, the incoming direction glows and a
     "pressure wave" silhouette appears at the map edge with its composition icons. **Never surprise
     the player with size; surprise them with composition.**
370. **The Radar Sweep** — A periodic sweep across the board that briefly reveals stealth units
     within detection range. Turns "do I have enough IDS coverage" into a visible, rhythmic,
     dread-inducing animation.
371. **Identification Reveal** — When a Mimic is unmasked, it visibly **peels** — the friendly
     visitor sprite cracks open and a red threat steps out. Should be loud, satisfying, and always
     worth watching. Give the Fingerprinter tower a signature "tick-tick-tick... confirmed" sound.
372. **The Empty Lane** — The reputation-death state: no threats, no visitors, just an immaculate,
     perfectly healthy, completely idle network. **Silence as a fail state visual.**

### 8C. Feedback & Juice

373. **Build Satisfaction** — Placing a rack: a thunk, a dust puff, LEDs booting in sequence
     (POST!). Placing a cable: a click and a taut snap. **Wiring should feel like plugging in a
     real cable**, because the player will do it thousands of times.
374. **The Boot Sequence** — New servers take a real few seconds to come online, with a visible
     progress of lights. **Not instant** — so panic-building mid-incident doesn't save you, which
     enforces planning.
375. **Damage Feedback on Towers** — A WAF under heavy load visibly strains: its indicator saturates,
     it starts leaking units. **You can see a tower being overwhelmed before it fails.**
376. **The Cascade Animation** — Failures propagate with a visible, traceable pulse along links, at
     a speed slow enough to react to. See 347.
377. **Money Number Feel** — Revenue ticks up in small increments constantly (satisfying hum); costs
     land in visible chunks (payroll THUD). **Slow trickle in, hard thump out** — the emotional
     shape of running a business.
378. **Alert Escalation Visuals** — Sev3 = a small dot. Sev2 = a pulsing border on the affected node.
     Sev1 = the whole UI edge flashes amber and the music drops out. **Severity should change the
     screen, not just add a line to a list.**
379. **The Quiet Moment** — After a resolved incident, a deliberate 5-second calm: music resolves,
     lights go green one by one, a small "All Clear." **Games forget to let players exhale.**
380. **Upgrade Visual Diffs** — Upgrades visibly change the object (more drives, a second PSU, a
     thicker cable, a fiber that glows). **You should be able to read your own build history off
     the board.**
381. **Staff as Visible Units** — Little techs walking to racks with carts, kneeling to swap drives,
     sitting at desks answering tickets. **Seeing all your staff busy is how you feel the attention
     cap** without reading a number.
382. **Ghost Preview** — While placing, show the projected effect: latency delta, upkeep delta,
     capacity delta, and **new threats this unlocks** — the Surface preview, shown as small enemy
     icons that will join the bestiary. "Building this adds these three monsters to the game." That
     preview is the entire Pillar-P2 experience in one tooltip.

### 8D. HUD / UI

383. **The NOC Wall** — The top strip of the screen is a bank of dashboards: traffic graph,
     error rate, latency p50/p95/p99, cash, MRR, reputation, hands available. **Diegetic HUD** — it
     looks like the wall of a real operations center and the player learns to read graphs.
384. **p99 vs p50 Education** — Show both. The average looks fine while the p99 is on fire. Teaching
     players that *some* customers are having a terrible time while the average is green is one of
     the most valuable things this game can do, and it's free — it's just a second line on a chart.
385. **The Funnel Widget** — A live Sankey of visitors flowing and shedding at each stage. Click any
     shed point to jump the camera to the culprit.
386. **The Bestiary** — Grows as you encounter threats. Each entry: silhouette, behavior, counter,
     the date you first met it, and how much it has cost you lifetime. **A trophy case of trauma.**
387. **The Build Palette with Surface Warnings** — Every build card shows Capability, Upkeep,
     Latency, Friction, and a red "Opens:" row of threat icons. **The most important UI element in
     the game**, because it makes the central tradeoff a reading-comprehension task rather than a
     hidden surprise.
388. **The Diagram Export** — A button that renders your topology as a clean architecture diagram
     you can share. Free marketing, and players adore artifacts of their own systems.
389. **Colorblind-First Iconography** — Every color state is *also* a shape/pattern (threat = angular
     + hatched, degraded = amber + diagonal stripes). Non-negotiable in a game where color carries
     this much meaning.
390. **The Ticket Queue Panel** — A readable list of customer tickets with names and one-line
     complaints. Doubles as comedy and as a diagnostic channel ("site slow on mobile in Europe" is a
     *clue*). **Customer complaints as a telemetry source** is authentic and fun.
391. **Time-of-Day Lighting** — The board lights shift with the in-fiction clock. 3am incidents look
     and feel different from 2pm ones. Cheap, enormous atmosphere, and it makes the on-call/fatigue
     systems legible.
392. **The Minimap Health Grid** — At Tier 4-5, a grid of colored tiles, one per rack/region.
     Peripheral vision does the work; you glance and know.

---

## 9. Anything Else

### 9A. Modes

393. **Endless: "The NOC"** — Survival with an ever-rising pressure budget. Leaderboard by uptime
     streak and MRR. The mode the community will actually live in.
394. **Blitz: "Sev-1"** — 3-minute incident scenarios. You're dropped into a broken system and must
     diagnose and fix it under a clock. **The game's puzzle mode**, and a perfect daily-challenge
     format.
395. **Daily Outage** — One seeded incident per day, same for everyone, global leaderboard on
     resolution time and revenue preserved. Tiny time commitment, high replay.
396. **Sandbox / Lab** — Unlimited money, all tech, a threat spawner you control. **Let players
     build the cursed topologies of their dreams** and test them. Doubles as the community's
     content-creation tool.
397. **Speedrun: "Zero to Nines"** — Tier 0 to a 99.999% month, fastest time.
398. **Co-op: On-Call Rotation** — 2-4 players share one company. Alerts route to whoever is "on
     call"; shifts rotate. **Handoff between shifts is the co-op mechanic** — you inherit the
     previous player's mess and their half-finished builds. Wildly thematic and genuinely novel.
399. **Asymmetric PvP: Red vs Blue** — One player builds and defends in real time; the other spends
     an attack budget probing for holes. Blue sees alerts, not the attacker. **Fog of war for the
     defender, resource management for the attacker.** The single best competitive framing this
     theme offers.
400. **Async PvP: "Attack My Network"** — Upload your topology as a defense puzzle; other players
     attack it with a fixed budget. You get notified how they broke in. **Player-generated levels
     with zero level editor work.**
401. **Competitive Market Mode** — 4 players run rival hosts in one market, competing for a shared
     pool of clients. Prices, reputation, and poaching all interact. Economic PvP with almost no
     direct combat.
402. **Campaign+ / New Game Plus** — Replay the campaign with your endgame threats from wave one.
403. **Historical Scenario Packs** — Fictionalized versions of famous outages and attacks, playable.
     "The Day the Certificate Expired," "The Great Route Leak," "The Left-Pad Incident." **Free
     narrative content from an industry that generates it constantly.**
404. **Puzzle Mode: "Root Cause"** — Static snapshots of a broken system. No timer. Find the cause.
     Hand-authored, dozens of them, deeply satisfying for the target audience.
405. **Minimalist Mode** — Fixed budget, no economy, pure topology optimization. For players who
     want the systems without the business.

### 9B. Twists and Systemic Wildcards

406. **The Threat You Can Hire** — After beating certain attackers, you can hire them as security
     staff. High skill, permanent small insider risk. **Reformed-villain unit with a real drawback.**
407. **Reverse Level: Defend Someone Else** — You're brought in as an incident responder for another
     company's network (one you didn't build). All the Acquisition-level confusion, on a clock.
408. **The Dependency Web** — Some of your own services depend on *other players'/NPCs'* services
     (a payment processor, a DNS provider, a cloud region). When they go down, you go down, and
     **there is nothing you can do about it except have built an alternative earlier.** Models the
     real modern internet, and it's a great "you can't control everything" lesson.
409. **Shared World Events** — Server-wide zero-days that hit every player on the same day. The
     community scrambles together. Free social energy.
410. **The Seasonal Calendar** — Black Friday, tax season, holiday freezes, leap day, DST changes,
     the annual certificate apocalypse. **A predictable calendar the player learns to plan around**
     across multiple in-game years.
411. **The Legacy System** — One server from your Tier 0 days that you can never turn off because
     something important still depends on it. Fragile, un-upgradeable, quietly costing you.
     **A permanent, affectionate monument to your own past decisions.**
412. **The Hidden Dependency** — Occasionally, two builds have an undocumented link that you only
     discover when one breaks the other. Discoverable in advance via investigation/documentation
     spend. Makes documentation *pay*.
413. **The "It Was DNS" Rule** — Statistically, a slightly higher share of mystery incidents should
     turn out to be DNS. It's a joke, it's true, and it's a usable heuristic that rewards players who
     know the meme.
414. **Difficulty via Honesty** — A hard-mode toggle that removes the bottleneck highlight, the
     telegraphs, and the ghost previews. You must diagnose from graphs and logs alone. **"Sysadmin
     Mode."** The community will treat clearing it as a badge.
415. **The Karma System** — Small ethical choices (hide an outage, oversell, sacrifice a small
     client to save a whale, blame an engineer) accumulate. High karma unlocks staff loyalty and
     community goodwill; low karma unlocks ruthless efficiency options. **Two viable playstyles,
     both mechanically supported.**
416. **The Pivot** — A mid-campaign option to abandon hosting and become something else (a CDN, a
     security vendor, a SaaS) — reusing your infrastructure differently. A big, dramatic branch
     that reuses existing systems.

### 9C. Humor and Texture

417. **Ticket Text Generator** — Endless, specific, painfully real customer complaints. "The
     internet is broken." "Can you make the logo bigger *and* faster?" "I deleted the database, can
     you undo it?" "URGENT: my email from 2019 is missing." **The game's primary comedy channel**,
     and it costs nothing to write hundreds.
418. **Vendor Personalities** — Recurring NPC vendors with distinct, funny sales behavior: the one
     whose product is great but who raises prices annually; the one who is cheap and always late;
     the enterprise rep who wants a 40-minute call for a quote.
419. **The Intern's Log** — The Intern unit narrates their mistakes afterward, in a cheerful tone.
420. **Server Naming** — Let players name machines. Auto-suggest thematic sets (Greek gods, Simpsons
     characters, colors, `web01`). The Postmortem quotes them by name: "`thor` went down at 03:14."
     **Naming creates attachment; attachment makes failure hurt.**
421. **The Achievement Set** — "It Was DNS." "We Have Backups (Untested)." "Works On My Machine."
     "Five Nines, One Month." "Never Rebooted." "Zero Tickets." "Served 1,000,000 Visitors Without a
     CAPTCHA." "Fired The Chaos Monkey." "Read The Logs."
422. **The Fictional Trade Press** — An in-game news ticker that reports your outages, your
     competitor's outages, and industry drama. Reputation events become *stories*. Your worst
     moments get headlines. **Public accountability as flavor text.**
423. **Sound Design as Information** — Fan hum rises with load; a drive failure is a specific click;
     the pager has a sound you will grow to hate; the money tick is warm. **You should be able to
     play half of this game with your eyes closed**, which is exactly how real operators feel.
424. **The Screensaver / Idle View** — Zoom out, hide the UI, watch your datacenter run. Lights,
     traffic, techs walking. No goal. Players will leave it running on a second monitor, which is
     free marketing forever.

### 9D. Meta / Design Guardrails

425. **Every Tower Has a Downside — Enforce It in Review** — A hard design rule: if a new buildable
     has no Friction, no Surface, and no meaningful upkeep, it is not allowed to ship. Strictly-good
     items are decision-destroyers.
426. **No Optimal Build Order** — Regularly playtest for a dominant opening. If one exists, raise its
     Surface until it doesn't. The wave generator should also react: the Competitor AI specifically
     counters over-used strategies.
427. **The Player Must Be Able to Lose Slowly** — Every fail state (299) should have a 60+ second
     visible approach. Sudden death only for Data Loss.
428. **Teach Through Loss, Never Through Text** — Every tutorial concept in this document is
     delivered by an event that hurts a little and then unlocks its own counter (227). The game
     should have almost no tutorial pop-ups.
429. **The Three-Clock Rule** — At any moment the player should be watching exactly three clocks:
     the next wave, the next bill, and the current incident. More than three and the board becomes
     noise; fewer and it becomes idle.
430. **Make the Boring Thing Beautiful** — Backups, documentation, restore tests, and change
     management are the least exciting purchases in the game and the most important. Give them the
     best audio, the best animation, and the most dramatic payoff moments. **The design succeeds if
     players get genuinely excited about buying a second power supply.**

---
---

# PART II — HOSTING TYPE AS A RULESET

*(Addendum written after the brief was expanded: the company is a **hosting provider in general**,
and the kind of hosting changes level to level. From a game-design chair this is the single best
thing in the brief — it is a **variety engine that costs almost nothing to build** if you frame it
right. What follows is organized under the same 9 headings.)*

## P2.0 The Framing: Hosting Type = Ruleset Mod

431. **The Ruleset Card (the core structural idea)** — Do **not** treat hosting types as reskins.
     Treat each as a **ruleset mod** that redefines six slots in the existing engine:

     | Slot | What it means | Example variance |
     |---|---|---|
     | **The Unit** | What "a visitor" is | page load / player joining / backup job / inference request / SIP call / tenant tour |
     | **The Goal Node** | What they're trying to reach | checkout / game shard / storage vault / GPU queue / mailbox |
     | **The Scarce Resource** | What you actually run out of | bandwidth / concurrency / IOPS / GPU-hours / tick budget / floor space+amps / IP reputation |
     | **The Patience Analog** | What makes them leave | latency / ping+jitter / backup window / queue wait / deliverability / lease terms |
     | **The Threat Mix** | Which roles dominate | swarm+tank / mimic+parasite / entropy / regulator+abuse |
     | **The Look** | Palette, silhouettes, sound | see §8 addendum |

     **Everything else — the lane, the Shared Pipe, Capability/Surface, hands, upkeep, the scorecard
     — stays identical.** That's the trick: one engine, twenty games.

432. **The "Verb Shift" Rule** — A hosting type is only worth shipping if it changes the **verb the
     player performs most often**. Web hosting: *tune latency*. Game hosting: *place capacity near
     players*. Backup hosting: *schedule and verify*. Colo: *sell space and police power*. GPU:
     *schedule a queue*. Email/DNS: *protect reputation*. If two types share a verb, merge them.
433. **The Business Line System** — Late campaign, you can run **several hosting lines at once** in
     one facility. Lines share facilities, staff, and network, but have **opposed requirements**:
     game hosting wants low latency and hates noisy neighbors; GPU hosting wants density and makes
     enormous heat; backup hosting wants cheap bulk storage and doesn't care about latency at all.
     **Co-locating incompatible lines in one building is the endgame optimization puzzle** —
     thermally, electrically, and in staff attention.
434. **The Portfolio Meter** — A diversification stat. One line = high margin, high variance (a
     single market shock kills you). Many lines = lower margin, smoothed risk, but **your staff's
     expertise is spread thin** and incident response is slower in every line. A real,
     mathematically honest strategic dial.
435. **Line Synergies** — Some pairs multiply: CDN + video hosting (your own edge carries your own
     streams); backup/DR + colo (sell DR to your own tenants); DNS + everything (you already own
     the infrastructure). **Discovering synergies is a whole discovery layer** (see §5 addendum).
436. **Line Antagonisms** — Some pairs actively hurt: bulletproof hosting next to regulated hosting
     gets your compliance certification revoked; crypto mining next to game hosting steals the power
     headroom you need at peak. **Mutually exclusive markets**, enforced by systems rather than rules
     text.
437. **The Era Axis (a second variety dimension, nearly free)** — Same ruleset cards, different
     **era**: 1994 dial-up ISP, 2001 dot-com colo, 2009 shared-hosting-and-cPanel, 2016 cloud,
     2024 GPU boom, near-future edge. Era changes costs, available tech, threat sophistication, and
     the entire palette. **Era × Type is a 2D grid of scenarios from one engine.** Enormous
     content-per-unit-of-work ratio.

---

## 1 (cont.) Levels, Scenarios, and Progression — by Hosting Type

*Each entry: what the level changes about the rules, and why it's fun as a distinct stage.*

438. **"Cabinet 14" — Shared Web Hosting (cPanel-style mass hosting)** — Thousands of tiny tenants on
     a few boxes. **New rule: the Tenant Density dial.** Pack more sites per server for margin;
     every added tenant raises the chance one of them is compromised/abusive. The level's signature
     threat is **your own customers**. Verb: triage and quarantine. Great as an early Tier-2 level
     because it introduces "your customer is the attack surface" cheaply.
439. **"Tick Rate" — Game Server Hosting** — **New rule: latency is binary and merciless.** Players
     don't "bounce slowly" — above ~80ms ping they rage-quit, and jitter is worse than latency.
     Geography becomes the whole game: you must place capacity near player populations. Signature
     threats: booters aimed at specific matches, cheaters (a threat that lives *inside* the service),
     and the **Launch Day** curve — a new game releases, 50x load for 72 hours, then 90% decay.
     **The most spike-shaped economy in the game.** Verb: place capacity near people, absorb spikes,
     decide what to do with the empty racks in week three.
440. **"Private Shard" — Community/MMO Hosting** — Small, passionate, loud customers. One server per
     community. Signature mechanic: **drama** — communities fracture, half the players leave,
     someone DDoSes their ex-guild. Non-technical threats dominate. Comedic and cheap to author.
441. **"The Vault" — Backup / Archival / DR Hosting** — **New rule: latency doesn't matter at all.**
     Visitors are backup *jobs* — big, slow, scheduled convoys that must complete inside a **backup
     window** or fail. The scarce resource is **durability and restore time**. Signature threats:
     bit rot, tape library jams, silent corruption, and **the restore that has to work**. The
     level's climax is always a real restore under a clock. **The most novel-feeling ruleset in the
     set** because every reflex the player built in web-hosting levels is wrong here.
442. **"Bit Rot" — Offsite Tape Vaulting** — A sub-variant, almost a puzzle game: robotic libraries,
     media rotation, off-site courier runs (a *physical* transport lane), retention policy, and the
     slow accumulation of unreadable media. Verb: verify.
443. **"Cache Hit" — CDN / Edge** — **New rule: you have hundreds of tiny nodes and no origin
     control.** Score is cache-hit ratio and egress cost. Signature mechanics: eviction policy,
     origin shielding, and **flash crowds arriving at one PoP**. Threats: cache poisoning,
     purge storms, and a customer whose content is un-cacheable by design. Verb: route and evict.
444. **"Thermal Envelope" — GPU / AI Compute Hosting** — **New rule: power and heat are the primary
     constraints, not network.** A rack draws 5-10x a normal rack; cooling is liquid; a single
     circuit trip costs a fortune in lost job-hours. Visitors are **inference requests** (tiny,
     latency-sensitive, high volume) and **training jobs** (enormous, long-running, and if
     interrupted you lose *days* of work and owe the customer). Signature tension: do you sell
     interruptible capacity cheap or reserved capacity expensive? Threats: power events become
     catastrophic, hardware is scarce and back-ordered, and **your hardware is worth stealing**
     (physical security matters for the first time). Verb: schedule the queue, manage the heat.
445. **"Render Farm" — HPC / Rendering** — Deadline-driven batch work. **New rule: the customer's
     deadline is the clock.** Jobs arrive in bursts before industry deadlines. Scheduling fairness
     vs. revenue maximization is the core decision. Threats: a job that runs 10x longer than
     estimated and starves everyone.
446. **"Hashrate" — Crypto Mining Hosting** — High margin, brutal power draw, customers who vanish
     when the market turns. **New rule: your entire revenue base can evaporate in one event.** The
     level teaches concentration risk. Also: the most fire risk, the worst customers, the best
     margins. Deliciously cynical.
447. **"Cage 7" — Colocation Landlord** — **New rule: you don't control the gear.** Your product is
     space, power, cooling, cross-connects, and remote hands. Your "visitors" are **prospective
     tenants touring the facility** (they inspect your generators, your PUE, your carrier list, your
     SLA — an Enterprise-Buyer-style *inspection* unit). Your threats are tenants who overdraw
     circuits, run untidy cabling, prop open doors, and get DDoSed in ways that hurt neighbors.
     Verb: sell space, police power, arbitrate disputes. **Completely different game, same engine.**
448. **"Build-to-Suit" — Wholesale / Hyperscale** — One customer, enormous, multi-year. **New rule:
     almost no combat; it's a construction and contract game.** Milestones, penalties for late
     delivery, and a customer who can walk away. Long-horizon, high-stakes, zero-twitch.
449. **"Deliverability" — Email Hosting** — **New rule: your currency is IP/domain reputation, and
     it's fragile, slow to rebuild, and destroyable by one customer.** Visitors are messages that
     must reach an inbox; "bouncing" is literal. Threats: spammers signing up, compromised accounts,
     blocklist operators, and **a single bad tenant blacklisting your whole range**. Counters are
     policy and rate-limiting, which anger legitimate bulk senders. **The purest expression of the
     game's "your customer is your threat" theme.**
450. **"NXDOMAIN" — Anycast DNS Hosting** — **New rule: you are infrastructure for other people's
     infrastructure, so your outages are everyone's outages.** Tiny queries, enormous volume,
     microsecond budgets. Signature threat: you are the perfect amplification reflector, so you're
     both target and weapon. The boss is a reflection attack that uses you against a third party.
451. **"Bucket" — Object Storage / S3-alike** — **New rule: durability math is visible.** Replication
     factor, erasure coding, and the horrifying arithmetic of "how many simultaneous failures until
     data loss." Threats: a misconfigured public bucket, egress bill shock, and a customer who
     uploads 400 million tiny files and destroys your metadata layer.
452. **"Transcode Queue" — Video Hosting / Live Streaming** — **New rule: two totally different
     workloads in one business** — batch transcoding (CPU/GPU-bound, schedulable) and live streaming
     (latency-bound, unschedulable). Balancing them in one facility is the puzzle. Threats: a viral
     live event, a DMCA wave, and the "everyone watches at 8pm" curve.
453. **"Seedbox Row" — File/Image Hosting & Seedboxes** — High bandwidth, low margin, **maximum
     abuse**. Signature mechanic: the abuse desk is the main gameplay loop. Threats: DMCA, CSAM
     scanning obligations, and upstream providers who will drop you.
454. **"Trunk Group" — VoIP / SIP Trunking** — **New rule: jitter and packet loss, not throughput.**
     Visitors are *calls*; a dropped call is a total loss, not a slow bounce. Signature threat:
     **toll fraud** — an attacker who compromises a customer's PBX and racks up $40,000 of
     international calls in one night, which *you* get billed for. **A threat that attacks your bank
     account directly and silently overnight.** Superb.
455. **"Ring 0" — Dial-Up ISP (period level, ~1996)** — **New rule: modems are a hard, countable
     concurrency limit.** Visitors are callers; if all modems are busy, they get a busy signal and
     churn. The core decision is the **oversubscription ratio** — the ancestor of every capacity
     decision in the game, made beautifully concrete. Threats: warez kiddies on your shell server,
     a Usenet feed that eats your entire transit budget, and a competitor offering unlimited hours.
     **The best tutorial level in the entire game**, because every modern concept has a simple
     physical analog here.
456. **"MOTD" — BBS / Shell Accounts / IRC Leaf** — Tiny scale, huge personality. Users are named
     individuals. Threats are social. A charming, low-pressure narrative level.
457. **"The Feed" — Usenet** — Comedy of scale: an infinite firehose of data nobody reads, eating
     your disks. Retention as a product. Purely about storage economics.
458. **"Web Ring" — Early Web Hosting** — Traffic comes from *links*, not search. Attraction is a
     social graph. A completely different §3 attraction model for one level.
459. **"Ground Station" — Satellite / Remote Edge Hosting** — **New rule: the physical site is
     hostile and far away.** Every physical hand action takes hours or days. Weather is a threat.
     You must build for remote recovery or you lose the site for a week. **The ultimate expression
     of Pillar P4 (attention scarcity).**
460. **"MEC" — Edge / 5G Micro-Datacenters** — Dozens of tiny unmanned sites. **New rule: no staff
     anywhere.** Full automation or bust. A late-campaign capstone that tests everything you
     automated.
461. **"Node Sync" — Blockchain Node Hosting** — Enormous state sync times, brutal IOPS, customers
     who care about one number (uptime during a specific event). Niche and cheap to author.
462. **"Cluster" — Kubernetes / PaaS / Serverless Platform Hosting** — **New rule: you host a
     platform, so your customers deploy arbitrary code into your building.** Multi-tenancy escape is
     the signature threat; noisy neighbors are constant; and your control plane is a new, enormous,
     fragile dependency that can take down everything at once.
463. **"Managed Everything" — Managed WordPress / Managed App Hosting** — **New rule: you are
     responsible for the customer's application, not just the box.** Their bad plugin is now your
     outage. Support burden is the scarce resource. Highest margin, highest attention cost.
464. **"DBaaS" — Database-as-a-Service** — Every customer's query is your problem. Signature
     mechanic: one tenant's full table scan degrades everyone. Verb: isolate and throttle.
465. **"Chapter 7 Compliant" — Regulated Hosting (HIPAA/PCI/FedRAMP/GDPR-resident)** — **New rule:
     some builds are illegal and some data cannot leave a region.** Auditors are recurring NPCs;
     certification is a gate to an entire premium customer tier; a single violation can be a
     campaign-level catastrophe. **Constraint-driven design instead of threat-driven.**
466. **"Exchange Colo" — Financial / Low-Latency Colocation** — **New rule: cable length is measured
     in meters and it is the product.** Customers pay for *equal-length* cross-connects and
     nanoseconds. Fairness is contractual. A hyper-specific, delightful puzzle level.
467. **"No Questions" — Bulletproof / Anything-Goes Hosting** — **New rule: enormous margins, every
     threat at once, and your upstreams keep dropping you.** You're constantly re-homing your
     network. Reputation is inverted: being notorious attracts *more* of this business. Karma system
     (415) interacts heavily. **The game's "dark path," and mechanically the most chaotic level.**
468. **"IoT Backhaul" — IoT Device Backends** — Millions of tiny, dumb, badly-written clients that
     **all reconnect simultaneously after any blip** (the worst retry storm in the game) and can
     never be patched. Signature threat: your own customers' devices are the botnet.
469. **"Multi-Line" — The Convergence Level** — Late campaign: run four lines at once in one
     facility, with all their opposed requirements, during a busy week. The exam.
470. **"The Pivot Level"** — Your dominant line collapses (crypto crash / game shuts down /
     regulation change) and you must convert your facility to a different business inside one level.
     Existing hardware repurposes at a discount. **A whole level about adaptive reuse.**
471. **"The Junkyard" — Absorb an Acquired Competitor's Hardware** — Three racks of mismatched,
     undocumented, out-of-warranty gear arrive on a truck. Decide what to rack, what to strip for
     spares, what to scrap. **A logistics and appraisal puzzle** with a comedy payload (one machine
     is genuinely great; one is a fire hazard; one is still serving a customer nobody told you about).

### Progression across types

472. **The Type Ladder** — Types are gated by tier: shared web and dial-up at Tier 0-1; game servers,
     email, DNS at Tier 2-3; colo, CDN, object storage at Tier 3-4; GPU, wholesale, regulated, edge
     at Tier 4-5. **Unlocking a new line of business is the single most exciting unlock in the
     game** — it's not a new tower, it's a new *game*.
473. **The Sampler Structure** — The campaign visits a new type every 3-4 levels, then returns to a
     familiar one *changed* by what you learned. **Alternating novelty and mastery** is the
     classic, correct campaign rhythm.
474. **Line Prestige** — Each line has its own small mastery track with its own medals, so
     specialists have something to chase.

---

## 2 (cont.) Threats — Type-Specific Bestiary Additions

475. **The Booter, Aimed at a Match** *(game hosting)* — Targets one game server during a tournament.
     Counter: per-instance IP isolation + on-demand scrubbing. **Your customer's enemies are your
     enemies.**
476. **The Cheater** *(game hosting)* — A threat that lives *inside* the service and damages
     **customer happiness**, not infrastructure. Countered by anti-cheat tooling that costs
     performance and occasionally bans innocents (Friction, applied to reputation).
477. **The Stream Sniper / Ghost Server** *(game hosting)* — Fake servers in your public listing that
     impersonate yours. Reputation damage with no technical vector.
478. **Launch Day Decay** *(game hosting)* — Not an attack: a *demand collapse*. You built for 50x
     and now you own 50x of idle hardware and its upkeep. **Success is the trap.**
479. **Toll Fraud Night** *(VoIP)* — See 454. Silent, overnight, financially enormous. Counter:
     spending limits and anomaly detection — which occasionally blocks a legitimate customer's
     conference call.
480. **Jitter Storms / Codec Mismatch** *(VoIP)* — Degradation that is audible rather than numeric.
481. **Blocklist Cascade** *(email)* — One spammer → one blocklist → deliverability drops → every
     customer complains at once. **A single-point-of-failure reputational cascade.**
482. **The Compromised Mailbox** *(email)* — A customer's password leaks; their account sends 200k
     messages before you notice. Counter: outbound rate limits, which anger bulk senders.
483. **Backscatter** *(email)* — Bounce messages from forged senders flood your queues.
484. **Reflection Conscription** *(DNS)* — You become someone else's weapon; the victim's upstream
     starts blocking *you*. Counter: response rate limiting.
485. **Cache Poisoning / Purge Storm** *(CDN)* — Bad content served globally in seconds; or a
     customer purges everything and stampedes your origin. **The CDN's self-inflicted-wound threat.**
486. **The Un-cacheable Customer** *(CDN)* — A tenant whose content defeats your entire business
     model. An economic threat with a technical face.
487. **Bit Rot / Silent Corruption** *(backup, storage)* — Damage you cannot detect without
     scrubbing. Counter: periodic verification passes that cost IOPS and produce nothing visible.
488. **Tape Library Jam / Robot Failure** *(archival)* — Physical, comedic, and it blocks every
     restore until a hand fixes it.
489. **The Missed Backup Window** *(backup)* — Jobs don't fail loudly, they just don't finish. You
     find out at restore time. Counter: window monitoring.
490. **The Restore That Doesn't** *(backup)* — The genre's ultimate boss. See 174, 255.
491. **Erasure-Coding Math Failure** *(object storage)* — Two simultaneous disk failures during a
     rebuild. A probability you can actually compute and price.
492. **Small File Apocalypse** *(object storage)* — Metadata layer death by a million tiny objects.
493. **Egress Bill Shock** *(object storage, CDN)* — A customer's content goes viral; your transit
     bill explodes; they're on a flat plan. **You lose money by succeeding.**
494. **Job Preemption Fallout** *(GPU/HPC)* — You interrupted a 60-hour training run. The customer
     loses days; you owe credits; they churn loudly.
495. **The Circuit Trip** *(GPU/crypto)* — Density plus a bad power estimate equals a whole rack of
     the most expensive hardware in your building going dark instantly.
496. **Coolant Leak** *(GPU, liquid-cooled)* — A new, terrifying failure mode: water plus
     electricity. Requires a specific facility investment to mitigate.
497. **GPU Theft** *(GPU)* — Physical security becomes a real tower for the first time. Countered by
     cameras, mantraps, asset tags — all of which slow your own staff.
498. **Hardware Back-Order** *(GPU, chip shortage)* — Capacity you cannot buy at any price. Forces
     scheduling and rationing instead of building.
499. **Market Collapse** *(crypto, GPU)* — Your whole customer base leaves in one event.
500. **The Overdrawn Tenant** *(colo)* — A customer exceeds their contracted amps and trips a shared
     breaker. **Another company's mistake takes down your other customers.** Counter: metered PDUs
     and enforcement (which makes you the bad guy).
501. **The Cable Spaghetti Tenant** *(colo)* — Blocks airflow, degrades cooling for the whole row.
     You can't touch their gear. Diplomacy mechanic.
502. **The Tailgater / Social Engineer** *(colo, any physical)* — Walks in behind a real customer.
     Countered by mantraps + badge policy (Friction on your own staff).
503. **The Tenant Who Stops Paying** *(colo)* — Their gear is in your building, they owe you money,
     and there are legal steps before you can unrack it. A slow, frustrating, completely authentic
     economic threat.
504. **The Carrier Exit** *(colo, any)* — A carrier leaves the building; tenants who depend on them
     start looking elsewhere. Your *carrier list* is a product feature.
505. **Multi-Tenancy Escape** *(PaaS/K8s)* — A customer breaks out of their container into yours.
     The signature platform-hosting catastrophe.
506. **Control Plane Outage** *(PaaS/K8s)* — Everything is technically still running but nobody can
     change anything, including you. **A paralysis threat rather than a damage threat.**
507. **The Bad Plugin** *(managed hosting)* — Your customer installs something; it's your outage now.
508. **The Noisy Query** *(DBaaS)* — See 93, scaled to multi-tenant.
509. **The Regulator Visit** *(regulated)* — Unannounced. Findings become mandatory builds with
     deadlines.
510. **The Data Residency Violation** *(regulated)* — A failover moved data across a border. You
     "survived" the outage and broke the law doing it. **A defense that is itself a violation** —
     the purest compliance-flavored dilemma.
511. **The Upstream Drop** *(bulletproof)* — Your transit provider terminates you. You must re-home
     your entire network mid-level.
512. **Payment Processor Termination** *(bulletproof, high-risk)* — You can't collect money anymore.
     Revenue goes to zero while costs continue.
513. **The Busy Signal** *(dial-up)* — Not a threat, a *capacity failure rendered as churn*.
514. **The Warez Kiddie on the Shell Box** *(period)* — Your shell server becomes a distribution hub.
515. **Device Reconnect Storm** *(IoT)* — See 468. Millions of clients, zero backoff, no patching.
516. **Weather** *(satellite/remote edge)* — A storm takes a site offline and prevents access.

---

## 3 (cont.) Visitors and Clients — What "a Visitor" Looks Like Per Type

517. **The Unit Table (design reference)** — page load · game player joining a lobby · voice call
     setting up · backup job starting its window · restore request (rare, critical, high-stakes) ·
     inference request · training job submission · DNS query · cache fill / cache hit · email
     message seeking an inbox · stream viewer joining · file download · API call · container
     deploying · a prospective colo tenant *walking through your front door with a clipboard*.
     **Each has a different size, speed, patience curve, and failure sound.**
518. **The Player (game hosting)** — Arrives in **parties** (5 at once, all-or-nothing: if the party
     can't get in together, all of them leave). **Group-arrival units are a fantastic mechanic** —
     partial capacity is worthless.
519. **The Tournament** *(game hosting)* — A scheduled, high-value, high-visibility event. Perfect
     for an escort/showcase level.
520. **The Backup Job** *(backup)* — Huge, slow, patient about latency but **absolutely intolerant of
     the window closing**. Visually a freight train. Fails silently if you let it.
521. **The Restore Request** *(backup)* — Rare. Enormous stakes. Its success or failure is the entire
     level's grade. **A single unit that is the win condition.**
522. **The Inference Request** *(GPU)* — Tiny, constant, latency-sensitive. Behaves like web traffic.
523. **The Training Job** *(GPU)* — Arrives once, occupies enormous capacity for a very long time,
     and **must not be interrupted**. Placing it is like placing a building. **A visitor that is
     also a commitment.**
524. **The SIP Call** *(VoIP)* — Binary: connects clean or fails. No partial credit.
525. **The Message** *(email)* — Must reach an inbox, not just your server. **The only visitor whose
     journey continues after it leaves you**, which makes reputation the real product.
526. **The Query** *(DNS)* — Microscopic, astronomically numerous, and individually worthless;
     collectively, your whole business. Rendered as a fine mist rather than units.
527. **The Viewer** *(streaming)* — Arrives in synchronized tides (everyone at 8pm, everyone at the
     kickoff). **Perfectly correlated demand** — the opposite of the smooth web curve.
528. **The Tenant Tour** *(colo)* — A slow-walking inspection unit that examines your generators,
     your carrier list, your PUE, your security, your references. **Graded on what you built, not
     how fast you are.** Signing them is a multi-year MRR commitment — the highest-value single
     unit in the game.
529. **The Broker** *(colo/wholesale)* — Brings tenants for a cut. A channel partner with leverage.
530. **The Deploy** *(PaaS)* — Your visitor is a customer's code being pushed. Frequent, small, and
     occasionally catastrophic.
531. **The Caller** *(dial-up)* — Gets a busy signal if all modems are occupied. **The most legible
     capacity visual ever invented**, and worth reusing conceptually at every tier.
532. **The Lurker** *(BBS/IRC)* — Costs a slot, generates nothing, is the soul of the community.
     A comedy unit with a real (tiny) reputation function.
533. **Client Card Variance by Type** — Reuse the Client Card system (151) with type-specific stats:
     a game-hosting client shows peak concurrency and drama risk; a colo tenant shows contracted
     amps, cabinet count, and lease length; a GPU client shows job length and interruption tolerance;
     an email client shows send volume and list hygiene. **Same UI, radically different reading.**
534. **Attraction by Type** — Web: SEO + speed. Game: latency maps and community presence (being
     *listed* in the server browser). Colo: carrier density, tours, references, and the PUE number.
     GPU: available capacity right now (**scarcity itself is the marketing**). Email: deliverability
     reputation. Backup: audited restore success rate. **Each line has its own attraction stat,
     which means each line has its own §3 mini-game.**

---

## 4 (cont.) Buildables — Type-Specific Additions

535. **Modem Bank / RAS** *(dial-up)* — Countable concurrency. The purest capacity object.
536. **Game Server Instance** — One shard per instance; per-instance IP isolation is a real
     upgrade that limits booter blast radius.
537. **Matchmaker / Lobby Service** *(game)* — Routes players to the nearest healthy shard. A
     *routing* tower rather than a defensive one. Surface: a single point of failure for the whole
     platform.
538. **Anti-Cheat Service** *(game)* — Raises customer happiness, costs tick performance, and
     produces false positives. A Friction tower aimed at reputation.
539. **Tape Library / Robot** *(archival)* — Slow, cheap, mechanical, jam-prone.
540. **Scrub / Verify Runner** *(storage)* — Periodically re-reads everything to catch bit rot.
     Costs IOPS, produces nothing visible. See 430.
541. **Erasure Coding Policy** *(object storage)* — A configuration, not a building: durability vs
     usable capacity vs rebuild cost. **A slider that is literally a probability of data loss.**
542. **Origin Shield** *(CDN)* — Protects the origin from PoP misses. A cache in front of your cache.
543. **Purge Control / Rate-Limited Invalidation** *(CDN)* — Prevents customer-triggered stampedes.
544. **Transcode Farm** *(video)* — Batch capacity that can be preempted for live events. **A
     building whose capacity can be borrowed** — a lovely flexible-resource object.
545. **Ingest Edge / RTMP Endpoint** *(streaming)* — Latency-critical inbound.
546. **SBC (Session Border Controller)** *(VoIP)* — The VoIP firewall: stops toll fraud and
     malformed signaling. High Friction risk (blocks legitimate odd call flows).
547. **Spending Limit / Fraud Anomaly Monitor** *(VoIP)* — Caps overnight catastrophe. The single
     best purchase in the VoIP ruleset.
548. **MTA Cluster + Outbound Rate Limiter** *(email)* — Protects deliverability; annoys senders.
549. **Reputation Warm-Up Pool** *(email)* — New IPs must be slowly "warmed." **A building that
     takes in-game weeks to become useful** — a genuinely unusual and interesting build.
550. **Feedback Loop Processor** *(email)* — Consumes complaint data to find bad tenants early.
551. **Anycast DNS Node** — Cheap, many, globally distributed. Introduces BGP tech.
552. **Response Rate Limiter** *(DNS)* — Stops you being used as a weapon.
553. **GPU Node / Liquid Cooling Loop / CDU** *(GPU)* — High density, high heat, new failure modes
     (leaks), and a facility prerequisite chain. **The first buildable that requires a facility
     upgrade before you can even place it** — a nice gating pattern.
554. **Job Scheduler + Preemption Policy** *(GPU/HPC)* — Configure who gets bumped. **Your fairness
     policy is a monetization decision.**
555. **Spot / Interruptible Tier** *(GPU)* — Sell idle capacity cheap with the right to reclaim it.
     Raises utilization, risks customer anger. Excellent risk/reward dial.
556. **Metered PDU + Circuit Enforcement** *(colo)* — Lets you see and police tenant power draw.
     Surface: enforcement creates disputes.
557. **Cross-Connect Panel / Meet-Me Room** *(colo)* — The colo revenue engine. Each cable is MRR.
     **Cabling literally becomes income** — the §7 wiring verb becomes the §6 economy. Beautiful.
558. **Carrier Diversity** *(colo)* — Each carrier in the building is a marketing stat and a
     resilience stat at once.
559. **Cage / Cabinet / Private Suite** *(colo)* — Escalating product tiers with escalating
     isolation and price.
560. **Loading Dock / Freight Elevator** *(colo, facility)* — Logistics throughput for move-ins. A
     bottleneck object that only matters on busy days — and then matters enormously.
561. **Fuel Contract** *(generator)* — Runtime beyond your on-site tank requires a priority refueling
     contract. **Insurance on your insurance**, and it comes due in the worst scenarios.
562. **Dual Power Feed / A+B Distribution** — The classic pay-twice-for-nothing purchase, at
     facility scale.
563. **Hot Aisle Containment** — Efficiency upgrade; unlocks higher density safely.
564. **Compliance Control Set** *(regulated)* — Bundles of mandated builds (encryption at rest,
     audit logging, access review, change control). Expensive, high Friction, unlocks the premium
     market. **Compliance as a tech branch you buy access to a customer tier with.**
565. **Abuse Desk** *(shared/bulletproof/seedbox)* — A staffed function that processes complaints.
     Under-staffing it is a slow doom clock (106).
566. **Legal Retainer** — Converts certain incidents from catastrophic to expensive.
567. **The Sales Engineer** — A staff type that specifically converts Tenant Tours and Enterprise
     Buyers. Useless in web-hosting levels, essential in colo levels. **Staff whose value depends on
     your line of business** — a nice portfolio consideration.

---

## 5 (cont.) Unlocks — Unlocking New Lines of Business

568. **The Business License Unlock** — Each hosting line is a major tech-tree node with real
     prerequisites: *Game hosting* needs low-latency network + burst capacity. *Colo* needs a
     building + power + physical security. *GPU* needs high-density power and cooling. *Regulated*
     needs certifications and process tech. **You unlock a business by having accidentally built
     most of its requirements**, which makes the unlock feel like a discovery about yourself.
569. **The Adjacent Opportunity** — The game *notices* when you're one build away from a new line
     and offers it: "You've got spare transit and idle nights — want to try backup hosting?"
     **Proactive opportunity surfacing** keeps players from missing the best content.
570. **Repurposing** — Hardware from a dying line converts to a new line at a discount (crypto rigs →
     GPU compute → render farm). **The pivot is mechanically supported, not just narratively.**
571. **Type Mastery Unlocks** — Doing well in one line unlocks cross-line tech: mastering CDN unlocks
     edge caching for your web line; mastering backup unlocks better DR for everything; mastering
     game hosting unlocks latency-optimized routing everywhere.
572. **The Certification Ladder** — Compliance badges unlock regulated lines, which unlock government
     and financial customers, which unlock the highest MRR tier. A long, deliberate grind with a
     clear payoff.
573. **Carrier & Peering Unlocks** — Relationships unlock at traffic thresholds; more carriers unlock
     colo as a viable business.
574. **The Era Unlock** — In the campaign, time advances: new tech becomes available, old tech
     deprecates (250), and **new hosting lines come into existence** (nobody hosted GPUs in 1998).
     **Progression through history as a tech tree.**
575. **The Reputation Gate** — Bulletproof hosting is *unlocked by low karma*; regulated hosting is
     unlocked by high karma. **The ethics system gates content in both directions**, so neither path
     is a punishment.
576. **Discovery by Customer Request** — A client asks for something you don't offer ("can you store
     our backups too?"). Saying yes starts a research node. **The customer is the tech tree**, which
     is exactly how real hosting companies actually grow.

---

## 6 (cont.) Economy — Per-Type Money Shapes

577. **The Revenue Shape Table** — Each line has a distinct cash-flow silhouette, and the fun is in
     combining shapes: shared hosting = **flat and thin**; game hosting = **enormous spike then
     decay**; colo = **long, flat, multi-year, very sticky**; GPU = **high and volatile, priced by
     the hour**; backup = **slow, compounding, extremely sticky (data gravity)**; CDN = **usage-based
     and unpredictable**; email/DNS = **tiny per unit, enormous volume, near-zero churn**;
     bulletproof = **huge margin, huge variance, sudden death**.
578. **Data Gravity as a Retention Mechanic** *(backup, storage)* — The more data a customer stores
     with you, the more it costs them to leave. **Churn resistance that grows automatically with
     usage.** The single best MRR quality in the game, and it should be visibly tracked.
579. **Lease Terms** *(colo)* — Multi-year contracts with escalators. Revenue you can *forecast*,
     which unlocks better financing (283). **Predictability is itself a currency.**
580. **Per-Hour Pricing** *(GPU)* — Volatile, market-driven, and you can raise prices during
     scarcity — at a reputation cost. **A dynamic pricing minigame.**
581. **Utilization Rate** *(GPU/HPC/colo)* — The headline efficiency metric: idle capacity is pure
     loss. Drives the spot/interruptible decision (555).
582. **Power as a Product** *(colo)* — You sell amps, not servers. Your margin is the spread between
     what you pay per kWh and what you charge. **PUE directly becomes profit** — the most
     satisfying efficiency-to-money link available.
583. **Cross-Connect MRR** *(colo)* — Every cable is recurring revenue. See 557.
584. **Deliverability as Revenue** *(email)* — Your reputation score directly multiplies what you can
     charge. A stat that *is* the price.
585. **Per-Query Pricing** *(DNS)* — Fractions of a cent at enormous volume. Teaches unit economics.
586. **Restore SLA Pricing** *(backup)* — Sell faster restores for more money — and then be held to
     it under a clock. **Charging for a promise you have to keep.**
587. **Deadline Premiums** *(render/HPC)* — Rush jobs pay more and disrupt your schedule.
588. **Abuse Cost Line** *(bulletproof/seedbox)* — A real, recurring expense: legal, staff, upstream
     re-homing. High-margin lines with high hidden costs teach players to read the *net*.
589. **The Concentration Warning** — A HUD indicator when >30% of MRR comes from one client or one
     line. **The game tells you you're fragile before it kills you** — fair warning, not a gotcha.
590. **Scoring by Line** — The four-axis scorecard (293) re-weights per type: game hosting weights
     Speed heavily; backup weights Durability (a fifth axis that replaces Speed); colo weights
     Margin and Uptime; regulated weights Compliance. **Same scorecard, different emphasis** — so
     the player learns that "good" is contextual.

---

## 7 (cont.) Mechanics — What Each Ruleset Changes at the Board Level

591. **Type-Swapped Scarce Resource Meter** — The HUD's primary capacity gauge changes per level:
     Mbps · concurrent sessions · IOPS · GPU-hours · tick budget · modem lines · kW and floor U ·
     IP reputation. **One widget, many meanings** — and swapping it is what makes each level feel
     different in the first ten seconds.
592. **The Window Mechanic** *(backup/batch)* — Instead of a continuous flow, work must fit inside
     time boxes. The board gains a **timeline/Gantt view** and the verb becomes scheduling.
     Completely different play feel from the same engine.
593. **The Queue Mechanic** *(GPU/HPC/render)* — A visible job queue you reorder. Fairness vs revenue
     vs deadlines. **Direct manipulation of a priority list is a great, tactile strategy verb.**
594. **The Geography Mechanic** *(game/CDN/edge)* — The board is a map with player-population heat.
     Placement is about *proximity to demand*, not topology. **Turns the game into a
     location-selection puzzle for a level.**
595. **The Floor Plan Mechanic** *(colo/wholesale)* — The board is a building. You sell rectangles.
     Power and cooling are zoned. **A real-estate game inside the TD.**
596. **The Durability Mechanic** *(storage/backup)* — Replication and erasure-coding policy are
     visible as a probability-of-loss number that you drive down with spending. **A gauge you can
     never take to zero** — permanent low-grade dread.
597. **The Reputation Mechanic** *(email/DNS/bulletproof)* — A single fragile bar that gates
     everything and rebuilds slowly. When it's your primary resource, the whole game becomes about
     *who you let in the door*.
598. **Concurrency Slots** *(dial-up/VoIP/game)* — Hard countable slots instead of soft bandwidth.
     **Binary admission instead of gradual degradation** — a totally different tension shape, and
     the clearest one to read.
599. **Cross-Connect Wiring as Revenue** *(colo)* — The drag-a-cable verb (310) now *earns money*
     instead of costing it. **Recontextualizing an existing verb is the cheapest way to make a level
     feel new.**
600. **Unmanaged Tenant Objects** *(colo)* — Some objects on your board **cannot be clicked**. You
     can see their power draw and their heat, and you can file a request, but you can't fix them.
     **Removing agency selectively is a fantastic and underused difficulty tool.**
601. **The Remote Site Delay** *(satellite/edge)* — Physical actions queue for hours. Every fix is
     planned, batched, and irreversible. Pillar P4, dialed to maximum.
602. **Era-Locked Tech** *(period levels)* — Whole branches of the tech tree are grayed out with
     "not invented yet." Playing 1996 with 1996 tools is a puzzle about *constraint*, and it makes
     modern tools feel like magic when you return.

---

## 8 (cont.) Visuals — How the Look Shifts Between Types and Eras

603. **The Palette Swap Per Line** — Web: warm, bright, consumer-friendly. Game hosting: neon,
     high-contrast, arcade energy, ping numbers everywhere. Backup/archival: cold blues, slow
     motion, industrial, quiet — **deliberately boring, and gorgeous for it**. GPU: hot oranges,
     glowing liquid loops, visible heat shimmer. Colo: architectural, blueprint-flavored, concrete
     and cable ladders. Email/DNS: abstract, text-forward, telemetry-heavy. Bulletproof: grimy,
     dim, improvised cabling. **The player should know what kind of level they're in from a single
     screenshot.**
604. **Unit Silhouettes Per Type** — Page loads are small warm dots. Game players are little
     helmeted figures that arrive in squads. Backup jobs are freight containers. Training jobs are
     enormous slow cargo crates that park. Calls are thin bright lines that must stay unbroken
     (**the line visibly frays with jitter** — audio quality made visual). Emails are envelopes that
     must pass through a *reputation gate* at the far end. Tenant tours are people with clipboards
     walking your floor. **Every unit type should be identifiable at 30px.**
605. **The Frayed Line** *(VoIP)* — Worth calling out separately: a call rendered as a taut thread
     between two points that visibly frays, thins, and snaps with packet loss. Instantly legible,
     emotionally direct, and it teaches jitter without a tutorial.
606. **The Busy Signal Light** *(dial-up)* — A bank of modem LEDs; when the last one lights, callers
     visibly turn away at the door. **The clearest capacity visual in the game** — reuse its
     grammar at every tier.
607. **Heat Shimmer and Liquid Loops** *(GPU)* — Density is *visible*: air distortion over hot rows,
     glowing coolant in transparent tubing, and a chilling "drip" animation when a leak begins.
608. **The Tape Ballet** *(archival)* — Robotic arms moving cartridges. Slow, hypnotic, mechanical.
     A totally different kind of screen to look at, which is valuable for pacing across a campaign.
609. **The Durability Dial** *(storage)* — A physical-looking gauge showing "nines of durability"
     with a tiny, never-zero red sliver. Anxiety as a UI element.
610. **The Floor Plan View** *(colo)* — Architectural top-down, leased rectangles shaded by tenant,
     power zones as colored overlays, heat as a second overlay you toggle. **Overlay toggles are the
     right UI answer for multi-constraint spatial levels.**
611. **The Ping Map** *(game/edge)* — A world map with isochrone rings around your capacity. You can
     *see* which populations you can serve well. Placement decisions become obvious and satisfying.
612. **Era Presentation Shifts** — 1996 levels: CRT curvature, beige plastic, 16-color UI, dial-up
     handshake audio, a physical modem bank. 2003: blue-glow tower cases, CAT5 spaghetti. 2012: neat
     1U rows, blue LEDs. Now: black monoliths and fiber. Future: sealed liquid pods.
     **The UI chrome itself changes era** — an enormous amount of felt variety for very little
     systems work.
613. **The Diegetic Line Dashboard** — When running multiple lines, the NOC wall splits into per-line
     panels with their own units and colors. **Seeing four different kinds of traffic on four screens
     at once is the visual payoff of the whole portfolio system.**
614. **Readability Rule Across Types** — Regardless of skin, the color language (356) never changes:
     green legit, red threat, amber degraded, purple unidentified, gold high-value. **The skin
     changes; the grammar never does.** This is what lets a player who learned web hosting read a
     GPU level instantly.

---

## 9 (cont.) Anything Else — Type-Driven Modes, Twists, and Jokes

615. **Mode: "Line Draft"** — Roguelike structure: you're offered three hosting lines, pick one; play
     a level; get offered three more, some synergistic, some antagonistic. **Build a company out of
     a draft.** Enormous replayability from existing content.
616. **Mode: "One Building, Four Lines"** — A pure optimization sandbox: fixed facility, choose your
     mix, maximize margin over a simulated year.
617. **Mode: "Through the Eras"** — Start in 1994 as a dial-up ISP and play the same company forward
     to a modern GPU host across a full campaign. **Your legacy systems from 1994 are still running
     in 2024** (411). This is the emotional spine the era system was built for.
618. **Mode: "Landlord vs Tenant"** — Asymmetric multiplayer: one player is the colo operator, others
     are hosting companies inside the building competing for power, cooling headroom, and remote
     hands. **A shared-resource negotiation game** built entirely out of the colo ruleset.
619. **Twist: The Customer Who Becomes a Competitor** — A tenant grows inside your building, learns
     your business, and leaves to start their own. Your best client becomes your rival AI.
620. **Twist: The Line That Eats You** — One line grows so profitable it crowds out everything else,
     and then it collapses. A scripted arc about concentration risk, triggered by the player's own
     success.
621. **Twist: The Hardware Afterlife** — Servers you retire can be sold, repurposed to a lower-margin
     line, donated (reputation), or scrapped. **A satisfying end-of-life decision for every object
     you ever placed.**
622. **Twist: Reverse Colo** — You're a hosting company *inside someone else's building*, and the
     landlord is the antagonist: they raise power prices, schedule disruptive maintenance, and
     fumble your remote hands requests. **Being on the receiving end of the colo ruleset** teaches
     the player what their own tenants feel.
623. **Humor: The Line-Specific Ticket Packs** — Game hosting: "the server is lagging" (it is their
     wifi). Backup: "I need the file I deleted in 2017." Email: "why is my newsletter to 90,000
     purchased addresses going to spam." Colo: "can your tech plug in the blue cable, not that
     blue cable, the other blue cable." GPU: "my job has been queued for six minutes, this is
     unacceptable." **Free comedy, and each pack instantly establishes a level's flavor.**
624. **Humor: Server Naming by Era** — The auto-namer offers period-appropriate sets: 1996 gets
     mythology and Star Trek; 2008 gets `web01`-`web47`; 2024 gets whatever the orchestrator
     generated. A joke that also dates every machine on your board.
625. **Meta: The Company Museum** — A persistent room displaying one artifact from every line you've
     run and every era you've survived: a modem bank, a tape robot, a dead GPU, the first server you
     ever named. **A trophy room built from your own history**, which is the natural endpoint of the
     Scar Tree (228) and the reason to keep one save alive for a hundred hours.
