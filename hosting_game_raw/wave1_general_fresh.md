# Hosting Company Tower Defense — Wave 1 Idea Dump
## Lens: General (no lens) — wide and even across all 9 categories

*Working title candidates: **UPTIME**, **Packet & Rack**, **99.999**, **Five Nines**, **HOSTILE TRAFFIC**, **The Rack**, **Bare Metal**, **Ping of Death**, **Serving Suggestion**, **Load Bearing**.*

Everything below is a raw idea. Names are deliberately concrete so they can be argued about, merged,
or thrown away by name. Where an idea depends on another idea, the dependency is called out inline
so the web of systems is visible.

A note on the through-line I kept returning to while generating: **the same pipe carries both the
thing you want and the thing you fear.** A firewall that stops a botnet also stops a customer on a
bad mobile carrier. A cache that absorbs a flood also serves a stale checkout page. Almost every
good idea in this document is a version of that sentence. When in doubt, make the defense have a
visitor-facing cost, and make the growth have a threat-facing cost.

---

# 1. Levels, scenarios, and progression

## 1.1 The scale ladder (campaign spine)

Each rung changes the **unit of thought** — what one "object" on the board represents. This is the
main progression trick: the board doesn't just get bigger, it gets *coarser*, and the player is
promoted from tweaking single processes to commanding regions.

### **Tier 0 — "Hello World" (one site, shared hosting)**
- **Name: `index.html`**
- You are one website on somebody else's shared server. You don't own the server; you own a
  directory, a database, and a quota bar.
- Unit of thought: **files, queries, and a PHP process pool**.
- What's introduced: visitors as discrete walkers, page-load time as the only defense stat,
  the concept of "the bar at the top that must not fill" (CPU quota).
- What's hard: you cannot build anything. Your only verbs are optimize, cache, delete, and beg.
  The tutorial's whole emotional arc is *powerlessness*, so that Tier 1's first owned server feels
  enormous.
- Threat sampler: comment spam bots, one hotlinked image, a noisy neighbor on the same box you can
  see but cannot touch (see **Noisy Neighbor**, §2), the host's own abuse department.
- Win condition: survive being on the front page of an aggregator for one night without getting
  suspended.

### **Tier 1 — "One Box" (a single VPS/dedicated server you own)**
- **Name: `root@localhost`**
- You get root. Everything is one machine: web + DB + mail + cron all on the same silicon.
- Unit of thought: **daemons and ports**.
- Introduced: the **port grid** (open ports are literally gates on the board), services as placeable
  objects, RAM/CPU as a shared pool every service eats from, the first real defense (a firewall).
- Gets harder: every service you add to make money also opens a door. The map has exactly one
  building and it is *stuffed*.
- Signature moment: your first out-of-memory kill, where the OOM killer walks on screen and
  executes your largest service in front of the customers.

### **Tier 2 — "Two U" (colocation, a few rackmount servers in someone else's DC)**
- **Name: `Cage 14, Row C`**
- You rent 4U in a shared cage. Introduced: **physical layer** — cables, a switch, a cross-connect,
  a power strip with a finite amp budget, remote hands you have to *pay and wait for*.
- Introduced mechanics: **latency as distance** (your DC is far from some visitor origins),
  **hardware failure** as a real threat class, **the drive to the datacenter** (a timer for physical
  fixes you can shortcut with money).
- Gets harder: you can no longer fix everything from the keyboard. Some failures require a body.
- Scenario hook: the facility's badge system, the "ticket to remote hands" minigame, and a
  neighbor in the next cage whose misconfigured ARP floods your switch.

### **Tier 3 — "The Stack" (a real multi-tier production service)**
- **Name: `prod`**
- Load balancers, several web nodes, a DB primary + replica, a cache tier, object storage, a CDN
  contract, a job queue, a monitoring box.
- Unit of thought: **tiers and flows**, not machines. The board becomes a river system: visitors
  enter at the edge and flow inward.
- Introduced: **failover**, **replication lag**, **deploys** (as a self-inflicted threat),
  **on-call**, **the status page**, real SLAs.
- Gets harder: partial failures. Nothing is fully down anymore; things are *degraded*, and degraded
  is harder to read than dead. This is where the **Symptom vs Cause** mechanic (§7) turns on.

### **Tier 4 — "Landlord" (you run the facility; many racks, many customers)**
- **Name: `Suite 200`**
- You now sell to tenants. Your "visitors" become **customers with their own workloads**, each of
  which is a little autonomous tower-defense board you only partly control.
- Introduced: **power and cooling as first-class resources** (kW per rack, hot aisle/cold aisle,
  a CRAC unit, a UPS, a generator with a fuel gauge), **abuse handling** (your own customers are
  now a threat vector), **capacity sales** (selling space you don't have yet), **peering**.
- Gets harder: your customers actively make your life worse and you cannot fire the profitable ones.
- Signature moment: a tenant gets DDoSed and the collateral damage takes out the whole row; you
  must decide whether to null-route a paying customer to save the floor.

### **Tier 5 — "Anycast" (multiple datacenters, multiple regions)**
- **Name: `us-east-1 and friends`**
- Board becomes a **world map** with a zoomable per-site view. Traffic is steered, not just filtered.
- Introduced: **BGP and route steering**, **regional failover**, **data sovereignty rules**,
  **follow-the-sun staffing**, **cross-region replication cost**, **submarine cable cuts**,
  **currency and jurisdiction**.
- Gets harder: your mistakes are now global and instant. A bad route announcement is a 90-second
  apocalypse. The split-brain problem arrives: two regions both think they're primary.

### **Tier 6 — "Hyperscale" (endgame / sandbox)**
- **Name: `Region Build`**
- You place whole datacenters, sign power contracts years ahead, build your own fiber, and fight
  nation-state-scale adversaries and regulators. Mostly a sandbox/endless mode with narrative
  bookends.

## 1.2 Perspective shifts (not every level is "bigger")

The campaign should occasionally *rotate the camera* instead of zooming out. These break monotony
and teach the same systems from the other side.

- **`The Tenant`** — You are back to a small customer, but inside a datacenter you previously built
  in an earlier level. Your old decisions are now the constraints you suffer under. Emotional payoff:
  "who put the UPS there? …oh."
- **`Red Team`** — You play the attacker for one level, attacking an AI-run host. You learn each
  threat's actual pathing rules from the inside, which permanently improves your tooltips (attacks
  you have personally used show extra info forever after). Ties to **Threat Codex** (§5).
- **`The NOC Shift`** — A pure reactive level: no building allowed, only triage. Six things break in
  twenty minutes; you have three hands. Scoring is about *order of operations*, not construction.
- **`The Audit`** — No traffic at all. An auditor walks your floor and you must satisfy checklist
  items under time pressure with the infrastructure you already have. Introduces compliance as a
  buildable-shaping force.
- **`The Migration`** — Two boards side by side: old stack and new stack, with a shrinking bridge
  between them. Move every customer without dropping a visitor.
- **`The Acquisition`** — You inherit a competitor's infrastructure sight-unseen. Half the board
  starts fogged; you must *discover* what you own by probing it, and some of it is already
  compromised. (Great synergy with **Fog of Infra**, §7.)
- **`The Support Queue`** — You see only tickets, not the board. You must infer the outage from
  customer complaints and dispatch fixes blind. The board is revealed at the end and you're scored
  on how close your mental model was.
- **`Eyes of the Packet`** — A one-off perspective level where you *are* a single HTTP request
  navigating a stranger's badly built stack. Teaches pathing from the inside, mostly for comedy and
  for teaching latency intuition.
- **`Founder Mode`** — A business-only level: no infra placement, only pricing, hiring, and
  marketing decisions, with the infra running on autopilot. Scored on cash and churn.

## 1.3 Scenario library (one-off missions with distinct goals)

Each of these is stated as: **premise → special rule → win condition → failure texture.**

1. **`Launch Day`** — A client's product goes live at noon. Traffic ramps 100× over 10 minutes,
   then stays. Special rule: you cannot scale *during* the spike for the first 90 seconds (cold
   start timers). Win: 95% of visitors served under 2s. Failure: the spike converts into a permanent
   reputation loss because everyone who bounced tweets about it.
2. **`The Slashdotting`** — A single page goes viral. Only one URL matters. Teaches caching a hot
   object vs scaling the whole stack. Win: serve the hot page; it's fine if the rest degrades.
3. **`Black Friday`** — Sustained 6-hour high load with a hard money mechanic: every dropped
   checkout is measured in dollars, not in abstract score. Special rule: you can *pre-build* for two
   in-game weeks with a budget, so it's a planning test, not a reflex test.
4. **`Zero Downtime Migration`** — Move a live DB to new hardware. Special rule: a replication-lag
   meter; cut over too early and you lose writes (permanent data-loss penalty), too late and you
   blow the maintenance window and pay SLA credits.
5. **`Post-Breach`** — You start *already owned*. Attackers have persistence somewhere on your board.
   You must find and evict them while staying online. Special rule: rebuilding a box is the only
   guaranteed cleanse, and each rebuild costs uptime. Win: no attacker presence for 5 minutes AND
   service still up.
6. **`The Certificate Expired`** — Comedy-tragedy level. At T+0 your wildcard cert expires. Every
   visitor now sees a scary browser warning and bounces at 95%. You must reissue and deploy under a
   ticking clock while DNS validation fights you. Teaches that a non-attack can be worse than an
   attack.
7. **`Power Event`** — Utility drops. UPS gives you 8 minutes. Generator needs 40 seconds to take
   load and might not start (a dice roll you can improve by having done maintenance). Decide what to
   shed. Win: keep tier-1 customers up; it is *expected* that you sacrifice something.
8. **`Cooling Failure`** — CRAC dies on the hottest day. Temperature rises per rack; hardware starts
   throttling then failing. You fight with airflow, workload migration, and literally opening doors.
   Introduces heat as a slow, spreading "damage over time" field.
9. **`The Fiber Cut`** — A backhoe severs your primary transit. You're on a backup with 30% capacity.
   You must triage which traffic gets the pipe: paying customers, or the bots you can't yet
   distinguish from them.
10. **`Ransomware Sunday`** — Encryption spreads through shares. Your backups exist, but you never
    tested the restore. Restore speed becomes the whole game. Teaches backups-vs-restores distinction.
11. **`The Angry Whale`** — Your single biggest customer (40% of revenue) is furious and threatening
    to leave. Every minute they're unhappy, churn risk ticks. You must fix *their* problem
    specifically, even if a hundred small customers suffer. Moral/economic tension level.
12. **`Compliance Week`** — PCI/SOC2-style audit. You must add segmentation, logging, and access
    control *without* degrading performance. Every control you add has a latency or cost tax.
13. **`The Copycat`** — A competitor undercuts your pricing by 40%. Pure economy level: you must
    respond with price, features, or reputation, and each path has a different cost curve.
14. **`Hug of Death (Charity Stream)`** — You *want* the flood. A charity event drives massive good
    traffic. Every visitor served = money, every bounce = money lost. Inverts the usual instinct to
    throttle.
15. **`Bad Deploy Friday`** — At 4:55pm a deploy goes out with a bug. Rollback exists but takes 6
    minutes and the DB migration is not reversible. Teaches irreversible actions.
16. **`The Quiet Month`** — No threats at all. Only cash flow, upkeep, and the temptation to
    over-build. Scored on efficiency. The "boredom is a mechanic" level: you must resist the urge
    to spend.
17. **`Peering War`** — A big network depeers you. Latency to a third of your users triples
    overnight. Solve with transit, CDN, or negotiation.
18. **`The Insider`** — An employee is exfiltrating data. You cannot see who. You can add monitoring
    (which slows everything) or start revoking access (which breaks things). Social-deduction flavor.
19. **`Datacenter Build`** — Construction level. No live traffic; you're laying out power, cooling,
    cable trays, and rack rows against a blueprint and a budget, knowing you'll have to *operate*
    this layout in the next mission. The best "your past self is your enemy" hook in the game.
20. **`The Regulator`** — A government demands data localization in 30 days. Move workloads,
    re-sign contracts, or lose the region.
21. **`Leap Second / Y2038`** — A timing bug hits everything simultaneously at a known future
    moment. You know exactly when it's coming. Pure preparation level.
22. **`Free Tier Flood`** — Marketing launched a free tier without telling you. Thousands of
    low-value users arrive; some are crypto miners. Separate the wheat from the chaff without
    alienating future paying customers.
23. **`Sold Out`** — You have no capacity and a signed contract. Either buy emergency hardware at
    3× markup, cram tenants and risk thermal issues, or break the contract.
24. **`The Honeymoon`** — A brand-new datacenter with zero customers. You must *attract* everything
    from scratch, and the level is 80% §3 (visitors/clients) mechanics with almost no threats.
25. **`Two Masters`** — Split-brain scenario across regions. Both sides accept writes. You must
    reconcile, and the reconciliation choices permanently alter data (some customers lose orders and
    will be angry about it for the rest of the campaign).

## 1.4 Progression-shape ideas

- **Ratchet unlocks** — Each tier permanently adds an "always-on" mechanic to all later levels
  (power budget, then heat, then jurisdiction). Earlier mechanics never go away; the stack of
  concerns is the difficulty curve.
- **Legacy debt carry-over** — Choices in a level persist as **Legacy** objects in later levels: the
  cheap switch you bought in Tier 2 is still in the rack in Tier 4, still a bottleneck, and removing
  it costs downtime. Makes the campaign feel like one continuous company.
- **The Ledger continues** — Cash carries between campaign levels. A level you *barely* won with an
  emergency purchase leaves you poor for the next one. Optional "clean slate" difficulty toggle.
- **Named customers persist** — A customer you saved in Tier 1 refers you a big client in Tier 3; a
  customer you dropped shows up as a competitor's reference in a negative-review event.
- **Difficulty as SLA** — Instead of easy/normal/hard, you pick the SLA you contractually promise:
  99%, 99.9%, 99.99%, 99.999%. Higher SLA = more money per customer and far less tolerance for error.
  Elegant because it's diegetic and it directly changes both reward and failure threshold.
- **Seasonality** — A year cycle: summer heat (cooling costs + failures up), holiday traffic peaks,
  January churn ("budget review season"), conference season (marketing opportunities), August
  (everyone's on vacation, your staff pool is halved).
- **The Long Weekend** — Some levels start at Friday 5pm and staff availability decays.
- **Chapter bosses** — Each tier ends with a signature antagonist encounter: Tier 1 a script kiddie,
  Tier 2 an extortion botnet, Tier 3 a competitor's dirty tricks campaign, Tier 4 a coordinated abuse
  ring inside your own tenants, Tier 5 a state actor with BGP capability.
- **Sandbox unlock parity** — Every campaign scenario unlocks its map + ruleset in free play, so the
  campaign doubles as a tutorial for the sandbox.

---

# 2. Threats

Threats should differ along at least five axes so they feel distinct: **pathing** (where they enter
and how they move), **target** (what they aim at), **visibility** (can you see them coming),
**counter-shape** (what stops them), and **cost profile** (what it hurts — uptime, money,
reputation, data).

## 2.1 Volumetric / flood family

1. **`Script Kiddie Swarm`** — Cheap, numerous, slow, dumb. Walks the shortest path to the most
   obvious open port. Countered by literally any firewall. Exists to teach basics and to be the
   background noise that makes silence feel meaningful.
2. **`SYN Flood`** — Doesn't reach your app; it eats **connection slots** on the LB. Visualized as
   half-open ghosts that clog the entrance and never leave. Counter: SYN cookies (cheap upgrade),
   connection-rate limiter. Side effect of the counter: slightly higher latency for everyone.
3. **`UDP Amplification (`DNS Reflection`)`** — Arrives as an enormous, slow-moving *wall* of
   packets that doesn't path — it just occupies the pipe. Counter must be **upstream** (your transit
   provider), which is the lesson: some things you cannot fix on your own property. Introduces
   **upstream scrubbing** as a purchasable service with a monthly fee.
4. **`Slowloris`** — A handful of visitors who enter, sit down, and never leave, holding worker
   threads. Nearly invisible: low traffic, high damage. Counter: timeouts, which risk killing slow
   legitimate mobile users. Perfect embodiment of the core tension.
5. **`Layer 7 Flood`** — Bots that look exactly like visitors and request your *most expensive* page
   (search, cart, export). The only counter is behavioral, and behavioral counters have false
   positives that eat real visitors.
6. **`Cache-Buster Flood`** — Requests with random query strings to bypass your cache and hammer
   origin. Counter: cache key normalization, which you must *discover* (§5) by observing the pattern.
7. **`The Thundering Herd`** — Not an attacker at all: your own cache expires and 10,000 real
   visitors all miss simultaneously. A self-inflicted flood. Counter: staggered TTLs, request
   coalescing, stale-while-revalidate.
8. **`Retry Storm`** — Your own clients' retry logic amplifies a small blip into a full outage.
   Appears only *after* something else fails — a secondary threat that piggybacks on your bad minute.
   Counter: backoff, circuit breakers, load shedding.

## 2.2 Application / injection family

9. **`SQL Injection Probe`** — A slow, sneaky single unit that walks to your web server and, if a DB
   is connected behind it, tries the link. Only exists on boards where you've built a DB — the
   canonical "new capability = new attack surface" demonstrator. Counter: WAF, parameterized-query
   upgrade on the app, DB user least-privilege.
10. **`Blind SQLi`** — Same but invisible: it doesn't show as an attack marker, only as a faint
    anomaly in your query-latency graph. Requires monitoring to even *see*.
11. **`XSS Worm`** — Infects one visitor, and that visitor then infects other visitors. Spreads
    through your *user graph*, not your infrastructure. Uniquely creepy: your own traffic becomes
    the attack.
12. **`File Upload Backdoor`** — Enters disguised as a legitimate visitor using the upload feature
    you built to increase conversion. Once inside, it becomes a permanent resident (a **Squatter**)
    that spawns other threats until evicted.
13. **`Path Traversal Sneak`** — Small, fast, goes for config files. If it succeeds it steals
    **credentials**, which later spawn a **Credentialed Intruder** that walks in through the front
    door and your firewall waves at it.
14. **`Deserialization Bomb`** — Rare, high-damage, only possible if you installed a specific
    convenience plugin. Reward for the plugin was +conversion; the bill comes later.
15. **`SSRF Courier`** — Tricks your own server into attacking your *internal* network. Fun visual:
    a packet enters legitimately, then turns around and walks *backwards* through your trust boundary.
    Counter: egress filtering, metadata endpoint protection, internal segmentation.
16. **`Dependency Poisoning`** — Arrives during a *deploy*, not through the network. A package you
    pulled is malicious. Counter: pinning, mirrors, an internal registry (all of which slow down your
    deploy cadence, which slows down feature velocity, which slows visitor growth).
17. **`Log4Everything`** — A zero-day event: a mechanic you've relied on all game is suddenly a
    vulnerability. Global timer, everyone affected, patch or mitigate. Best used as a scripted
    campaign shock.

## 2.3 Credential / access family

18. **`Brute Force Drip`** — Endless slow login attempts. Low damage, constant noise, and it
    generates *log volume* that costs you storage — a threat whose real cost is operational, not
    security.
19. **`Credential Stuffing Crowd`** — Looks like a crowd of visitors logging in. Some succeed
    because your customers reuse passwords and you cannot fix that. Counter: MFA (reduces conversion
    slightly — real tradeoff), rate limits, breach-password checks.
20. **`Phishing Campaign`** — Targets your **staff**, not your servers. If it lands, a staff member
    becomes compromised and starts silently sabotaging. Counter: training (a recurring cost with no
    visible benefit until it saves you — the classic "insurance" mechanic).
21. **`The Insider`** — A disgruntled employee. Triggered by low morale (§6 staff happiness). The
    *prevention* is HR spending, which players will under-invest in, which is the point.
22. **`Forgotten Key`** — An SSH key from a contractor you fired six levels ago. Materializes as a
    threat only if you never did an access review. Rewards housekeeping.
23. **`Supply Chain Vendor`** — Your monitoring vendor gets breached, and their agent (which you
    installed on every box) is now the attack path. Punishes centralization; rewards diversity, which
    is more expensive.

## 2.4 Adversary archetypes (who is behind the units)

24. **`Bots`** — Autonomous, relentless, scale with the internet's background radiation. Never stop,
    never targeted. Scale with your *visibility*, not your wealth.
25. **`Script Kiddie`** — Chaotic, loud, easily stopped, but if they get in they do stupid
    destructive things (defacement) that cost **reputation** far more than money.
26. **`Extortion Crew`** — Sends a ransom demand *before* attacking. You can pay (instant cash loss,
    plus a permanent "known payer" tag that increases future extortion frequency) or defend. Pure
    risk/reward decision with a long tail.
27. **`Competitor`** — Doesn't attack your servers; attacks your *business*. Fake reviews, poaching
    your best employees, undercutting on price, buying your brand keywords, filing abuse complaints
    against you. Countered by §3/§6 business mechanics, not firewalls. Their attacks are invisible on
    the infra board entirely — you see them only in churn graphs.
28. **`Researcher (White Hat)`** — Not a threat, but *arrives like one*. Probes you, then emails a
    report. If you have a bug bounty / security contact, they disclose responsibly (small cash cost,
    big benefit). If you have no contact channel, they go public and it becomes a reputation event.
    Beautiful teaching device: the same unit is a gift or a disaster depending on prior investment.
29. **`Spam Gang`** — Doesn't attack you; **uses** you. Signs up as a customer, sends spam, gets your
    IP ranges blacklisted, which silently destroys your email deliverability and your other
    customers' business. Counter: abuse team, KYC on signup (reduces signup conversion), outbound
    rate limits.
30. **`Cryptominer Tenant`** — A "customer" whose workload is pure parasitism: pays the minimum,
    consumes maximum CPU and power. Profitable at first, catastrophic at scale.
31. **`Nation-State`** — Extremely rare, extremely patient. Doesn't flood. Sits dormant in your
    network for many minutes doing nothing, spreading quietly, and only reveals itself when it wants
    something. Cannot be "beaten" — only detected and contained. Endgame-only.
32. **`Hacktivist Wave`** — Triggered by a customer you accepted whose politics attract attention.
    Business decision creates a security event — an explicit cross-system link between §3 and §2.
33. **`Scraper Fleet`** — Not malicious, just rude. Massive read volume, zero revenue, and if you
    block them you may lose search indexing (which cuts your visitor supply). Distinguishing "good
    bot" from "bad bot" becomes its own minigame.
34. **`The Ex-Customer`** — Left angrily, still has API keys, still points DNS at you, still costs
    you bandwidth. A slow leak with a legal-ish resolution path.

## 2.5 Non-attack problems (arguably the better half of the game)

35. **`Disk Failure`** — A drive dies with no warning (or with SMART warning if you bought
    monitoring — buying foresight is a mechanic). RAID absorbs it; RAID rebuild then makes everything
    slow for 4 minutes, and a *second* failure during rebuild is a total loss. Perfect risk escalation.
36. **`Bad RAM`** — Intermittent, undiagnosable corruption. Symptoms are random and wrong. Only ECC +
    monitoring reveals it. The "you will waste 10 minutes chasing the wrong thing" threat.
37. **`Fan Failure`** — Silent, then thermal throttle, then shutdown. Slow burn.
38. **`PSU Pop`** — Instant loss of a node unless dual-PSU on separate circuits (an upfront cost
    you'll skip once and regret).
39. **`Power Loss`** — Utility drops. UPS timer, generator start roll, transfer switch. Layered
    dependency chain where each layer is a separate purchase.
40. **`Cooling Failure`** — Heat spreads as a field across adjacent racks. Adjacency suddenly matters
    for placement. Makes floor layout a real puzzle.
41. **`Water Leak`** — From the CRAC or the floor above. Damages a *region* of the floor, not a
    machine. Randomized location; punishes putting all redundancy in one physical spot.
42. **`Fiber Cut`** — Backhoe, ship anchor, squirrel. Removes a network path entirely for a long
    duration. Only redundancy helps, and redundancy must be *diverse-path* to count (a great
    "looks redundant but isn't" trap — two circuits in the same conduit).
43. **`BGP Leak`** — Someone else's mistake steals your traffic. You cannot fix it directly; you
    file and wait, or mitigate with more specific announcements. Introduces powerlessness at Tier 5.
44. **`DNS Expiry`** — You forgot to renew the domain. Total, instant, humiliating outage. Fixed by
    an auto-renew purchase that costs almost nothing and which players will absolutely not buy.
45. **`Cert Expiry`** — As §1.3. Recurring unless automated.
46. **`Bad Deploy`** — Self-inflicted. Error rate spikes on release. Rollback costs time; forward-fix
    costs risk.
47. **`Migration Gone Wrong`** — Schema change locks a table; the site is up but frozen.
48. **`Runaway Cron`** — A scheduled job that overlaps itself and multiplies. Visually: one unit that
    clones every few seconds until you notice.
49. **`Log Disk Full`** — The most boring outage in the world. Logs fill the disk, everything stops.
    Preventable with a two-dollar upgrade. Should absolutely be in the game.
50. **`Backup Silently Failing`** — Has been failing for six in-game months. Only discovered at
    restore time. The game should let this happen. Counter: **restore drills** (a recurring cost with
    zero visible benefit until the one time it's everything).
51. **`Noisy Neighbor`** — On shared/virtualized tiers, another tenant's load degrades you. You can
    see the symptom, not the cause.
52. **`Licensing Audit`** — A vendor discovers you're over your license count. Pure cash hit.
53. **`Vendor EOL`** — Your favorite piece of hardware/software goes unsupported. It keeps working
    but stops receiving patches, gradually raising its vulnerability rating until it becomes a
    liability. Forces continuous modernization spending.
54. **`Capacity Creep`** — Not an event; a trend. Your customers' usage grows 3% a week forever.
    The quiet threat that turns a comfortable board into a critical one if you stop paying attention.
55. **`Staff Burnout`** — Too many incidents, too little rest → your ops staff get slower, then quit,
    taking **tribal knowledge** with them (documented systems are unaffected; undocumented ones become
    partially fogged again). Direct link between §6 staff and §7 fog.
56. **`The Ticket Avalanche`** — Any visible incident generates support tickets at a rate
    proportional to customer count. Tickets consume staff. Staff consumed by tickets can't fix the
    incident. A genuine doom-loop mechanic that rewards status pages and proactive comms.
57. **`Angry Customer Escalation`** — A customer's complaint escalates from ticket → phone call →
    public post → chargeback → lawsuit, one stage at a time, and each stage is more expensive.
    You can intervene at any stage at increasing cost.
58. **`Chargeback Wave`** — Fraudulent signups pay with stolen cards; months later the chargebacks
    hit, plus processor penalties, plus possible loss of your payment processor entirely.
59. **`Regulatory Fine`** — Triggered by a data breach you failed to disclose fast enough. Disclosure
    speed becomes a decision: fast (reputation hit now, small fine) vs slow (maybe nobody notices,
    huge fine if they do).
60. **`The Rate Limit You Set`** — A defense you deployed months ago is now blocking a legitimate
    growing customer. Your old defenses should occasionally become your new problems.

## 2.6 Threat behavior modifiers (mix-ins that make familiar threats fresh)

- **`Low & Slow`** — Same threat, 1/10th the rate, below your detection threshold.
- **`Distributed`** — Same threat from many source IPs; IP-based counters fail.
- **`Encrypted`** — Inside TLS; inspection requires termination (which costs CPU and privacy points).
- **`Adaptive`** — Retreats and changes approach when it sees a defense fire. Rewards layered,
  non-obvious defenses over one big wall.
- **`Timed`** — Only attacks during your staff's off-hours.
- **`Piggyback`** — Hides inside a legitimate traffic spike, so blanket rate limiting kills revenue.
- **`Mimic`** — Visually identical to a visitor until it's inside. Requires you to build detection
  you'd otherwise skip.
- **`Persistent`** — If not fully removed, regrows from a remnant. Punishes half-fixes.

---

# 3. Visitors, traffic, and clients

The central design claim: **visitors are not "score," they're fragile units with patience meters.**
They should be as mechanically interesting as threats.

## 3.1 Visitor archetypes (the traffic that pays)

1. **`Casual Browser`** — Low patience (~3s), low value, enormous volume. Most of your traffic.
   Bounces instantly on slow pages. The "chaff" that nevertheless funds you.
2. **`Mobile Visitor`** — Arrives over a lossy, high-latency link. Suffers doubly from your latency.
   Aggressive timeouts you set to stop Slowloris will kill these people. Explicit tension unit.
3. **`Power User`** — High patience, high value, but generates 5× the load (dashboards, exports,
   API calls). Profitable *and* expensive.
4. **`The Buyer`** — Carries a visible money bag. Must traverse the *full* path (landing → product →
   cart → checkout → payment) and if any hop fails, the money bag drops and is gone. Long path =
   many chances to lose them = the most satisfying unit to protect.
5. **`Returning Customer`** — Enters already trusting you; higher patience, and immune to the first
   bad experience (trust buffer). But if they bounce, they're gone *permanently* and take their
   lifetime value with them.
6. **`Search Crawler`** — Not revenue itself, but its treatment determines your future visitor
   *spawn rate*. Serve it fast → rankings rise → more visitors next wave. Serve it 500s → rankings
   drop. Long-feedback-loop unit; teaches thinking beyond the current wave.
7. **`Social Referral Burst`** — Arrives as a sudden clump from one entrance. Spiky, unpredictable,
   high bounce.
8. **`The Reviewer`** — A single, slow-walking, extremely visible VIP unit. Whatever they experience
   becomes a public review that modifies your spawn rate for the rest of the level. High-stakes
   escort mission embedded in normal play.
9. **`Journalist`** — Like the Reviewer but only shows up during incidents. Serve them a good status
   page and the story is "company handled it well."
10. **`Enterprise Evaluator`** — Walks your whole stack slowly, checking for compliance markers,
    uptime history, and support response time. Cannot be won with speed alone; requires having built
    boring things (logging, redundancy, docs).
11. **`Price Shopper`** — Bounces based on your pricing, not your performance. Only §6 affects them.
12. **`Free Tier Tourist`** — Costs you resources, pays nothing, but a small percentage converts.
    Tuning the free tier is a slider with a real curve.
13. **`API Consumer`** — A machine customer. Very high patience but zero tolerance for *errors*
    (a 500 breaks their integration and they file a ticket). Different failure sensitivity than humans.
14. **`Streaming Viewer`** — Long-lived connection, bandwidth heavy, sensitive to jitter not latency.
    Introduces a second quality axis.
15. **`The Bargain Hunter Tenant`** — A customer type at Tier 4: wants your cheapest rack space, will
    leave for $5, generates disproportionate support load.
16. **`Whale Client`** — 30-40% of revenue in one logo. Everything about the level bends around them.
    Losing them is often an instant fail state. Should be simultaneously a blessing and a trap; the
    game should reward **revenue diversification** explicitly.
17. **`Referral Chain`** — A happy customer occasionally spawns a "referral" visitor with a much
    higher conversion chance. Makes retention mechanically compounding rather than just defensive.
18. **`The Ghost`** — A visitor that signed up long ago, pays, uses nothing. Pure profit. Treasure
    them. (And feel slightly bad.)

## 3.2 Why visitors bounce (the fragility model)

Give each visitor a **patience budget** that drains from multiple sources, so there are many
distinct ways to fail them:

- **Latency drain** — every hop with queueing costs patience.
- **Error cliff** — an error doesn't drain patience, it *ends* the visitor (and adds a reputation tick).
- **Scary-warning cliff** — cert warnings, browser interstitials, malware flags: near-100% bounce.
- **Captcha tax** — your bot defenses cost every human a slice of patience. Directly quantifies the
  cost of security.
- **Ugly/broken layout** — degraded mode (CSS from a dead CDN) costs patience even though "the site
  is up."
- **Queue visible** — if you use a waiting room, patience drains slower but conversion drops.
- **Cold start** — first byte from a scaled-up node is slow; the newly-launched node serves its first
  N visitors badly. Scaling is not instantly good.
- **Third-party drag** — analytics/ads/chat widgets you added for *money* slow the page for everyone.
  A revenue decision that costs conversion.

## 3.3 Attracting visitors (the other half of the two-directional loop)

Buildables and actions that increase visitor *spawn rate* or *quality*:

- **`SEO Investment`** — Slow-acting, compounding, dies if your uptime is bad. The patient strategy.
- **`Ad Spend Dial`** — Instant, expensive, non-compounding, shuts off the moment you stop paying.
  The panic button.
- **`Content Engine`** — Hire writers; spawn rate grows over time and is threat-resistant.
- **`Status Page`** — Doesn't attract, but *retains*: during an incident it halves reputation damage
  and cuts the ticket avalanche.
- **`Speed Badge`** — If your p95 stays under a threshold for N minutes, you earn a visible badge that
  permanently raises conversion. Rewards excellence, not just survival.
- **`Uptime History`** — A public track record; enterprise units check it. Makes early-level failures
  matter in late levels.
- **`Referral Program`** — Pay a bounty per referred customer; converts cash into spawn rate.
- **`Conference Booth`** — One-shot big spend, produces a burst of Enterprise Evaluators.
- **`Community / Forum`** — Free support labor from users; reduces ticket load and increases retention,
  but is itself a target (spam, defacement) — a defense that needs defending.
- **`Free Tier`** — Big spawn increase, big cost increase, attracts miners and abusers.
- **`Partnerships / Resellers`** — Another company sends you customers for a revenue share. Cheap
  growth, thin margins, and you inherit *their* customers' problems.
- **`Open Source Sponsorship`** — Slow reputation build, immunity to certain competitor attacks,
  attracts good staff (links §3 to §6 hiring).
- **`Migration Assistance Offer`** — Actively poach a competitor's customers during *their* outage.
  A reactive opportunity: when a rival goes down (a visible world event), you can spend to capture
  refugees. Makes the outside world feel alive.
- **`Localization / Regional PoP`** — Reduces latency for a region → directly raises conversion there.
  Ties §5 expansion to §3 revenue in a legible way.
- **`Marketplace Listing`** — Be on a big platform's marketplace: steady visitors, platform takes a cut,
  and platform policy changes are a threat you can't control.

## 3.4 Churn and retention mechanics

- **`Patience → Trust → Tenure`** — Three timescales: per-request patience, per-incident trust,
  per-month tenure. Different threats attack different timescales. A DDoS hurts patience; a breach
  hurts trust; bad pricing hurts tenure.
- **`Grudge Meter`** — Each customer accumulates grudge from incidents; it decays slowly during good
  service. Above a threshold, they churn. Visible as a color on the customer's icon so the player can
  triage.
- **`Save Offer`** — When a customer signals churn, you can spend money (discount, credit, an
  engineer's time) to save them. Cheaper than acquiring new ones — teaches the CAC/LTV lesson without
  a spreadsheet.
- **`The Exit Interview`** — Churned customers tell you *why*, feeding a visible diagnostic panel.
  Turns failure into information.
- **`Contract Lock-in`** — Annual contracts reduce churn but make angry customers stay and become
  loud instead of leaving quietly (more reputation damage).
- **`Word of Mouth Graph`** — Customers are connected; a churning customer damages the retention of
  its neighbors. Makes clusters of loss feel like cascades.

---

# 4. Buildables: services and infrastructure

Format: **what it does / cost shape / connects to / new attack surface.** The attack-surface column
is the soul of the game — nothing should be free of consequence.

## 4.1 Compute & core services

1. **`Web Server`** — Serves visitors. Cheap, fast to place. Connects to: LB (in), DB/Cache/Storage
   (out). Surface: every web vuln; it's the front door.
2. **`App Server / Worker Pool`** — Handles dynamic logic; separates rendering from serving. Enables
   richer pages (higher conversion). Surface: deserialization, dependency poisoning, runaway processes.
3. **`Database Primary`** — Enables dynamic content, accounts, carts — a huge revenue multiplier.
   Surface: SQLi, connection exhaustion, slow queries, data theft (the only component whose *loss of
   confidentiality* is catastrophic even if it stays up).
4. **`Read Replica`** — Offloads reads, adds capacity. Surface: **replication lag** (serving stale
   data = wrong prices, double-sold inventory), plus a second copy of your data to steal.
5. **`Cache (Memcached/Redis-alike)`** — Massive latency win, absorbs floods. Surface: cache
   poisoning, stale data, and the catastrophic **cache stampede** when it dies (your DB, sized for
   a cached world, instantly melts). The "defense that becomes a dependency" archetype.
6. **`Object Storage`** — Cheap bulk storage for media. Surface: public bucket misconfiguration
   (data leak), egress cost surprises, hotlinking.
7. **`Job Queue / Worker`** — Moves slow work off the request path (big latency win). Surface: queue
   backlog invisible to visitors until it isn't; poisoned jobs; a worker that never finishes.
8. **`Cron/Scheduler`** — Enables maintenance, reports, billing. Surface: overlapping runs, jobs that
   fire during peak.
9. **`Search Index`** — Enables site search (big conversion win for stores). Surface: extremely
   expensive queries = a perfect L7 flood target.
10. **`Mail Server`** — Enables transactional email (password resets, receipts). Surface: open relay,
    blacklisting, spam abuse by customers, and the misery of deliverability. High-pain, high-need.
11. **`DNS Server`** — You control your own names. Surface: amplification abuse, cache poisoning,
    and the catastrophic single point of failure. Alternative: managed DNS (costs money, removes risk,
    removes control).
12. **`CI/CD Pipeline`** — Faster feature shipping (raises conversion over time). Surface: it can
    deploy a bad build to everything at once; and it holds credentials to everything.
13. **`Container Orchestrator`** — Late-tier: turns individual servers into a capacity pool, enabling
    autoscaling. Surface: enormous complexity, a control plane that can fail everything at once, and
    misconfigured network policy letting tenants see each other.
14. **`Serverless Function Tier`** — Infinite burst scale, pay-per-invoke. Surface: cost explosion
    under attack — a DDoS that doesn't take you down, it just *bills you*. A wonderful modern threat
    shape ("Denial of Wallet").
15. **`Analytics/Telemetry Store`** — Business insight (reveals which pages lose visitors). Surface:
    huge storage cost, privacy/compliance exposure.

## 4.2 Network & edge

16. **`Firewall`** — The first real defense. Blocks by port/IP. Cheap. Surface: false positives that
    kill visitors; rule-set complexity that eventually nobody understands (a "technical debt" meter).
17. **`WAF`** — Blocks application-layer attacks. Expensive, adds latency, false-positive prone.
    Should have a tunable aggression slider with a live visible tradeoff.
18. **`Load Balancer`** — Distributes to multiple web nodes, enables health checks and zero-downtime
    deploys. Surface: itself a single point of failure (until you pair it), SSL termination CPU load,
    connection table exhaustion.
19. **`Reverse Proxy`** — Caching, compression, request shaping. Cheaper LB-lite.
20. **`CDN Contract`** — Massive edge caching and DDoS absorption; reduces your origin load and your
    latency to distant visitors. Costs per-GB (variable, scary). Surface: cache-poisoning, origin
    exposure if your real IP leaks, and dependence on a third party who can have *their* bad day.
21. **`DDoS Scrubbing Service`** — Upstream protection; the only counter to volumetric floods.
    Monthly retainer + per-incident fee. Surface: traffic detour adds latency; "always on" costs more.
22. **`Rate Limiter`** — Cheap, effective, and the single biggest source of accidental
    visitor-killing. Should be placeable at multiple points (edge, LB, app, DB) with different
    tradeoffs.
23. **`VPN / Bastion`** — Secure admin access. Reduces credential-attack surface. Surface: the bastion
    itself becomes the crown jewel.
24. **`Switch`** — Physical connectivity with finite ports. Running out of ports is a real, dumb,
    satisfying constraint.
25. **`Router / Transit Link`** — Your connection to the internet, with a committed bandwidth level
    (95th percentile billing! see §6). Surface: saturation, BGP misconfiguration.
26. **`Second Transit Provider`** — Redundancy. Only counts if diverse path. Surface: doubles cost,
    introduces routing asymmetry problems.
27. **`IX / Peering Port`** — Cheaper bandwidth to peers, better latency. Requires scale to justify.
28. **`Anycast Network`** — Endgame: one IP everywhere. Enables regional absorption of attacks.
29. **`Network Segmentation (VLANs)`** — Limits blast radius; an attacker in one zone can't roam.
    Costs configuration time and creates "why can't A talk to B" incidents.
30. **`Egress Filtering`** — Stops your compromised box from phoning home or attacking others.
    Prevents you from becoming *someone else's threat* (and the abuse complaints that follow).

## 4.3 Data safety & observability

31. **`Backup System`** — Enables recovery. Surface: backup storage cost, and a backup accessible from
    production is a ransomware target. Distinguish **backup** (cheap) from **offsite backup**
    (costlier, survives site loss) from **immutable backup** (costliest, survives ransomware).
32. **`Restore Drill`** — Not a building; a recurring *action* that costs time and proves your backups
    work. Skipping it is free until it's fatal. Should give a small visible "confidence" stat so the
    player has something to watch.
33. **`Monitoring / Metrics`** — Reveals invisible threats and shows *cause* rather than *symptom*.
    Arguably the most important buildable in the game. Surface: alert fatigue (too many alerts and
    your staff start ignoring the real one — a genuinely modelable mechanic).
34. **`Log Aggregation`** — Enables forensic investigation after a breach; required for compliance.
    Surface: storage cost that grows with traffic; logs containing secrets.
35. **`Alerting / On-call Rotation`** — Wakes staff for incidents at night. Improves response time,
    lowers staff morale.
36. **`Tracing`** — Late-game: shows exactly which hop is slow. Turns the guessing game into a
    solvable one. Should be an expensive, genuinely transformative unlock.
37. **`Status Page`** — Public communication. Halves reputation damage during incidents. Cheap.
    Should be hosted *off* your own infrastructure (a trap: hosting your status page on the thing
    that's down).
38. **`Runbook / Documentation`** — Reduces incident resolution time and protects you from the
    tribal-knowledge loss when staff quit. The least glamorous, most quietly powerful building.
39. **`Chaos Testing`** — Voluntarily break things during calm periods to find weaknesses. Costs a
    little uptime now to prevent a lot later. Gambling in reverse.

## 4.4 Facility (Tier 4+)

40. **`Rack`** — Holds N U of equipment, has a power budget and a weight limit.
41. **`PDU`** — Power distribution with a breaker that trips if you overload it. Satisfying, legible
    failure.
42. **`UPS`** — Bridges short outages; has a battery health that degrades and needs replacement.
43. **`Generator`** — Long outages; needs fuel (a gauge!), monthly test runs, and has a start-failure
    probability inversely related to maintenance spending.
44. **`CRAC / Cooling Unit`** — Removes heat within a radius. Placement puzzle.
45. **`Hot/Cold Aisle Containment`** — Efficiency upgrade that reduces cooling cost and raises
    density ceiling.
46. **`Fire Suppression`** — Prevents total loss. Never used, until it is. Also: a discharge takes the
    room offline, so it's a partial loss either way.
47. **`Physical Security / Badging / Mantrap`** — Stops the "guy in a hi-vis vest with a clipboard"
    threat. Yes, that should be an actual unit that walks in.
48. **`Cable Management`** — Cosmetic-seeming upgrade that actually reduces the time for every
    physical repair and reduces accidental-unplug incidents. Rewards tidiness with real numbers.
49. **`Spare Parts Inventory`** — Pre-purchased drives/PSUs/NICs. Converts a 4-hour outage into a
    10-minute one. Classic capital-vs-risk tradeoff.
50. **`Loading Dock / Staging Area`** — Determines how fast new hardware can be racked. A throughput
    constraint on growth itself.
51. **`Diverse Fiber Entry`** — Two physical conduits into the building. Expensive; the only counter
    to the backhoe.

## 4.5 People (staff as buildables)

52. **`Junior Sysadmin`** — Cheap, handles routine tickets, occasionally causes an incident.
53. **`Senior SRE`** — Expensive, halves incident duration, can be in only one place at a time.
54. **`Security Engineer`** — Passive detection improvement; makes invisible threats visible.
55. **`DBA`** — Prevents slow-query disasters, speeds migrations.
56. **`Network Engineer`** — Required for BGP/peering actions at Tier 5.
57. **`Support Rep`** — Consumes tickets, protects engineers' attention. The unsexy unit that keeps
    your expensive units productive.
58. **`Sales Rep`** — Converts Enterprise Evaluators into contracts. Also over-promises features you
    don't have, creating future obligations (a threat generated by your own business side).
59. **`Account Manager`** — Reduces churn on big clients; the "save offer" enabler.
60. **`Marketing Lead`** — Improves ad efficiency and content output.
61. **`Abuse/Trust & Safety`** — Handles complaints, keeps your IP space clean, evicts spammers.
62. **`Remote Hands (contracted)`** — Pay-per-incident physical labor at a remote site. Slow but no
    salary.
63. **`Contractor / Consultant`** — Instant expertise, costs a lot, and leaves behind an SSH key you
    might forget (§2 idea 22).
64. **`On-call Rotation Depth`** — Not a person, a *structure*: more people in rotation = less burnout
    per person.

## 4.6 Business/abstract buildables

65. **`SLA Contract Tier`** — A product you define: higher promise, higher price, higher penalty.
66. **`Bug Bounty Program`** — Converts would-be attackers into reporters. Cost per report; massive
    reduction in catastrophic-breach probability.
67. **`Insurance (Cyber / Business Interruption)`** — Pay premium, reduce the financial tail of
    disasters. Doesn't reduce reputation damage. Should feel boring and be correct.
68. **`Legal Retainer`** — Handles the lawsuit branch of the angry-customer escalation ladder.
69. **`Compliance Certification`** — Unlocks enterprise customers; imposes permanent operational
    constraints (mandatory logging, access reviews, change control that slows deploys).
70. **`Reserved Capacity Contract`** — Commit to volume for a discount; a bet on your own growth.
71. **`Vendor Diversity`** — Deliberately using two suppliers. Costs efficiency, buys resilience.

---

# 5. Unlocks and discovery

The design goal: **you should unlock things by *experiencing* things, not by ticking XP.** The
tech tree should feel like a lab notebook.

## 5.1 Discovery triggers (learn-by-suffering)

- **`Postmortem Unlocks`** — After any incident, you run a postmortem (a small interactive screen:
  pick the root cause from evidence). Getting it right unlocks the *specific counter* to that
  incident type. Wrong answer unlocks a partial/incorrect mitigation, which is realistic and funny.
- **`Symptom → Hypothesis → Tool`** — You can't buy a tool you don't know you need. Seeing
  unexplained latency three times unlocks the *option to purchase* profiling.
- **`Threat Codex`** — Every threat you survive gets a codex entry revealing its behavior. Entries
  upgrade: **Seen** (icon only) → **Analyzed** (behavior visible) → **Countered** (weak point shown) →
  **Mastered** (auto-flagged by your systems). Repeated exposure = permanent quality-of-life.
- **`Autopsy of a Dead Box`** — Failed hardware can be examined (costs staff time) to reveal the
  failure mode, unlocking preventative maintenance for that component class.
- **`Customer Feedback Unlocks`** — Repeated complaints about the same thing unlock the feature that
  fixes it (three "checkout is slow" tickets unlocks the profiling tool for the checkout path).
- **`The Conference Talk`** — Sending a staff member to a conference costs time and money and returns
  a random tech-tree node, biased toward what you're currently struggling with. Gambling with a
  sympathetic pity timer.
- **`Reading the Docs`** — An idle action during quiet periods: staff with free time slowly generate
  "insight" that unlocks nodes. Makes quiet levels mechanically valuable and punishes running your
  team at 100% utilization forever. (Real lesson, real mechanic.)
- **`Vendor Demo`** — A salesperson offers a free trial of a service. Try it for 3 minutes free; if
  it helps, you unlock the ability to buy it. Diegetic, funny, and teaches the tool for free.
- **`Reverse-Engineering an Attack`** — Capture a threat unit alive (requires a honeypot) and dissect
  it to unlock counters early.
- **`Job Applicant Skills`** — Hiring a person with an unusual background unlocks their specialty
  branch of the tree. Staff *are* tech tree nodes.
- **`The Mentor`** — An NPC veteran who gives you one hint per level and unlocks a node if you follow
  it. The tutorial voice that persists as a system.

## 5.2 Tech tree branches (shape ideas)

- **Six branches**: **Serve** (performance/caching/CDN), **Shield** (security), **Scale**
  (automation/orchestration), **Sustain** (power/cooling/hardware/reliability), **Sell**
  (marketing/sales/pricing), **Sense** (observability/forensics).
- **Cross-branch synthesis nodes** — Some nodes require two branches: "Autoscaling" needs Scale +
  Sense (you can't scale what you can't measure). "Zero-Downtime Deploy" needs Serve + Scale.
  "Threat Intelligence Feed" needs Shield + Sense. "Performance Marketing" needs Serve + Sell
  (you can only advertise speed if you have it).
- **Regret nodes** — Cheap early nodes that are strictly good now and become liabilities later (e.g.
  "Single Big Server" gives a huge early boost, then blocks the "Horizontal Scale" node until you
  pay a migration cost). Teaches architectural debt.
- **Mutually exclusive forks** — "Managed Services" vs "Own Everything": one path is expensive and
  safe with little control, the other cheap and dangerous with total control. You can switch, at a
  cost. Two viable playstyles.
- **Deprecation** — Nodes can go obsolete over campaign time (§2 idea 53). The tree is not a
  monotonic climb; it needs weeding.
- **Certification gates** — Some customers require tree nodes ("we only buy from SOC2 vendors"),
  linking §5 to §3 directly.
- **Blueprints from incidents** — Surviving a specific named disaster grants a blueprint you can't
  get any other way. Makes disasters feel like content, not punishment.
- **Rival tech espionage** — At Tier 4+, you can (ethically or not) learn what a competitor deployed
  and copy it at a discount. A morality-flavored shortcut.

## 5.3 Milestone unlocks (concrete examples)

| Milestone | Unlocks |
|---|---|
| Survive first traffic spike | Caching branch opened |
| First DB built | SQLi threat introduced + WAF becomes purchasable |
| First hardware failure | RAID + spare parts inventory |
| First successful restore | Backup branch expanded; "Immutable Backup" visible |
| Serve 10,000 visitors in one level | CDN vendors start calling you |
| First customer churn | Exit interview + Save Offer unlocked |
| Hire a 5th employee | On-call rotation, HR/morale system turns on |
| First SLA breach paid | Contract-tier editor unlocked (you can now design SLAs) |
| Detect a low-and-slow attack | Anomaly detection branch |
| Run a chaos test | Resilience scoring + "Confidence" stat becomes visible |
| Operate 2 sites | Replication, failover, and the "split-brain" threat |
| First BGP announcement | Anycast branch; also the BGP Leak threat |
| First abuse complaint received | Trust & Safety team hireable |
| First 30 days at 100% uptime | "Speed Badge" and premium pricing tier |

---

# 6. Economy, money, and scoring

## 6.1 Revenue streams

1. **`Per-visitor conversion revenue`** — For the "you run a website" tiers: money per completed
   Buyer path. Immediate, visible, satisfying.
2. **`Monthly recurring revenue (MRR)`** — For hosting tiers: each customer pays a tick every cycle.
   The heartbeat of the economy. Should be shown as a rhythmic, calming pulse — and its stutter
   during churn should be viscerally noticeable.
3. **`Overage billing`** — Customers exceeding bandwidth/storage pay more. Profitable, but the surprise
   bill raises their grudge meter. Greed with a cost.
4. **`Setup fees`** — One-time cash injections on new signups. Makes growth feel good immediately.
5. **`Managed services upsell`** — Charge more to manage a customer's stack. Higher margin, higher
   support load.
6. **`Professional services / migrations`** — One-off project revenue that consumes staff time you
   might need for incidents. The classic "do I take the contract" tension.
7. **`Colocation rent`** — Per-U, per-kW, per-cross-connect. Tier 4's core revenue.
8. **`Cross-connect fees`** — Tiny, pure-margin, and hilariously real.
9. **`Domain & cert resale`** — Small, steady, sticky (increases retention).
10. **`Backup-as-a-service`** — Sell the thing that saves you to others.
11. **`Premium support tier`** — Sell faster response times you must then actually deliver.
12. **`Reseller channel`** — Volume at low margin, and they own the customer relationship (so churn
    is invisible to you until it happens).

## 6.2 Costs

- **Fixed/recurring**: salaries, rack rent, transit commit, licenses, insurance, retainers.
- **Variable**: bandwidth (with **95th percentile billing** — your 95th-percentile Mbps sets the bill,
  so a single sustained spike costs you all month; this is a *fantastic* mechanic because a DDoS costs
  you money even if you survive it), power (kWh), cloud egress, per-invoke serverless costs.
- **Capital**: servers, switches, generators, building. Depreciation over time makes old gear cheaper
  to run on paper but riskier in reality.
- **Incident costs**: SLA credits, overtime, emergency hardware at markup, expedited shipping,
  scrubbing service per-incident fees, PR/legal.
- **Hidden costs**: alert fatigue → slower response; technical debt interest (every unmaintained
  thing adds a small permanent tax to all future changes); onboarding cost for new staff (a new hire
  is *negative* productivity for their first stretch).

## 6.3 Money-flow mechanics

- **`Cash vs Profit`** — Two separate numbers. You can be profitable and still die of cash flow when
  an annual invoice lands. Introduce **Net 30 payment terms**: enterprise customers pay 30 in-game
  days late. Growth consumes cash.
- **`The Invoice Calendar`** — Big bills arrive on a visible schedule so the player can plan. Missing
  one has escalating consequences (late fee → service suspension by your vendor → eviction).
- **`Credit Line`** — Borrow to survive a crunch; interest is a permanent drag. A loan should feel
  like both a lifeline and a mistake.
- **`Investor Round`** — Optional: take money in exchange for a growth *mandate* that changes your
  win conditions mid-campaign (now you're scored on growth rate, not profit). A genuine twist.
- **`Bootstrapped path`** — Refuse investment; slower, but you keep control and the scoring stays
  profit-based. Two economic playstyles.
- **`Price Elasticity Curve`** — A real slider: raise prices → fewer signups, more revenue per
  customer, higher churn among price-sensitive tiers, and a *delayed* effect (churn takes weeks to
  show). Delayed feedback makes pricing a skill.
- **`Discounting Spiral`** — Discounts to save customers are sticky; you can rarely raise them back.
  Each save-offer permanently lowers that customer's LTV.
- **`Unit Economics Panel`** — A late-game screen showing revenue per customer minus cost to serve.
  Reveals that your cheapest plan is losing money on every sale. The "aha" moment of the business layer.
- **`SLA Credits`** — Contractually automatic. Downtime converts directly into refunds at a rate you
  chose when you set your SLA tier. Makes the difficulty setting (§1.4) an economic instrument.
- **`Denial of Wallet`** — Attacks that don't take you down, they just run up your variable costs.
  The modern nightmare, and a great mid-late-game threat class.
- **`Efficiency Score / PUE`** — Power Usage Effectiveness as a real stat at Tier 4+: how much power
  goes to compute vs cooling. Improving it is pure profit and feels great.
- **`Capacity Utilization`** — Empty racks are burning money; 100% full racks have no headroom for a
  spike. The optimal is uncomfortable, around 70-80%, and the game should reward finding it.

## 6.4 Scoring and end-of-level rating

- **Four-axis score, shown as a radar/diamond**: **Uptime**, **Revenue**, **Reputation**,
  **Resilience**. You almost never max all four, which makes replay meaningful.
- **`The Nines`** — Headline stat: your measured availability rendered as 99.x%. Simple, iconic,
  and instantly legible to anyone who's ever seen an SLA.
- **`Visitors Served / Visitors Lost`** — The tower-defense leak counter, themed. Lost visitors should
  be shown as a literal pile.
- **`Money Left On The Table`** — Estimated revenue lost to bounces. The cruelest and best stat.
- **`Blast Radius Rating`** — A simulated post-level analysis: "if X had failed, Y% of customers would
  have been affected." Scores your architecture, not just your performance.
- **`Toil Percentage`** — How much of your staff's time went to manual firefighting vs improvement.
  A low score here is how you rate a "won ugly" playthrough.
- **`Letter grade + flavor title`** — "A / Unflappable", "C / Held Together With SSH And Hope",
  "F / Acquired For Parts".
- **Failure states (multiple, distinct)**:
  - **Bankruptcy** — cash below zero for N cycles.
  - **Mass churn** — customer count below threshold.
  - **Reputation collapse** — nobody will buy from you; spawn rate hits zero.
  - **Data loss event** — irrecoverable customer data lost; instant fail at high SLA tiers.
  - **Legal shutdown** — repeated abuse or compliance failure gets your network de-peered or your
    company enjoined.
  - **Burnout ending** — all staff quit; you're alone with a board you can't operate. Should be a
    real, reachable ending and the game should treat it seriously.
- **Soft-fail preferred over hard-fail** — Most failures should shrink your board and continue
  (lose a rack, lose a customer) rather than ending the run, so the fun is in recovery.
- **`The Postmortem Screen`** — Every level ends with a timeline of your incidents, annotated. Doubles
  as the scoring screen and the learning tool, and generates the unlock choices from §5.

---

# 7. Core gameplay mechanics

## 7.1 The board and the two flows

- **`Two-directional board`** — The map has **Ingress edges** (where both visitors and threats enter,
  mixed together) and a **Core** (your company/revenue heart). Visitors must *reach* the core; threats
  must be *stopped before* it. Same lane, opposite goals. Every filter you place is a judgment call
  applied to a mixed crowd.
- **`The Mixed Lane`** — The signature mechanic. Since threats and visitors share the path, an
  area-of-effect defense hits both. Precision defenses cost more, act slower, or need intel.
- **`Classification, not destruction`** — Defenses don't "kill"; they **classify**. A firewall sorts
  units into pass/drop. Getting it wrong in either direction has a cost: false negative = damage,
  false positive = lost revenue. Both should be shown on a live counter so the player can tune.
- **`Depth vs Breadth path`** — Visitors traverse *your architecture graph*, so the longer and more
  complex your stack, the longer the path, the more latency, the more failure points. Complexity is
  literally distance. This makes architectural elegance a mechanical advantage.
- **`Capacity as a fluid`** — Each node has throughput. Excess traffic queues; queues add latency;
  latency drains patience. Nodes turn from green to amber to red as their queue fills. The board
  reads as a plumbing diagram under pressure.
- **`Backpressure`** — A saturated downstream node (DB) causes upstream queues (web) to fill, which
  saturates the LB. Congestion propagates *backwards* against the flow, which is visually striking and
  educational.

## 7.2 Connections — the key interaction design question

Several candidate schemes, with tradeoffs; the strong recommendation is a hybrid.

- **`Drag-a-Cable` (primary proposal)** — Click and hold a port on one object, drag, release on a
  compatible port of another. The cable animates into place and thereafter renders as a visible
  line whose **thickness = bandwidth**, **color = protocol/tier**, and **animation speed = current
  traffic**. Cables sag slightly, can be dragged to reroute, and can be cut (by you or by an event).
  Rationale: it's tactile, it's physically true at colo tiers, and the cable *is* the status display.
- **`Ports as a resource`** — Each device has a limited number of ports of each type. Running out is a
  real constraint that forces you to buy a switch — a natural, diegetic gating mechanism.
- **`Click-to-Link fallback`** — Click source, click target. Same result, faster for keyboard/
  accessibility players. Both should exist; the cable drag is the "feel," the click-link is the "flow."
- **`Wiring Mode / Blueprint Overlay`** — Press a key to dim the world and show only the graph:
  nodes as boxes, links as clean orthogonal lines. Essential for readability at Tier 4+, where dozens
  of racks would otherwise be spaghetti. The player should be able to *design in blueprint mode* and
  *watch in world mode*.
- **`Adjacency bonuses, not adjacency requirements`** — Physical closeness gives small latency/cost
  benefits (short cable run, same switch, same rack) but isn't required. Encourages thoughtful layout
  without forcing Tetris.
- **`Link types with distinct rules`**:
  - **Data link** (traffic flows) — the main one.
  - **Trust link** (credentials/auth) — invisible in normal view, visible in a security overlay; this
    is how lateral movement happens. Attackers traverse trust links, not data links, which makes the
    security overlay a genuinely different map of the same board.
  - **Power link** — from PDU to device; a separate overlay entirely.
  - **Control link** — monitoring/deploy/management; how a compromised CI/CD reaches everything.
  - The insight: **the same board has four different topologies**, and disasters travel along the one
    you weren't looking at.
- **`Link health`** — Links can be degraded (packet loss shown as dropped dots), saturated (line
  glows and pulses fast), or severed (frayed ends, sparks).
- **`Auto-wire with a penalty`** — A "let the system figure it out" button that creates a working but
  suboptimal configuration. Good for onboarding and for late-game when you have 200 nodes; costs a
  little efficiency so experts still hand-wire the important parts.
- **`Connection contracts`** — When you link a web server to a DB, a small popup lets you set the
  terms: max connections, timeout, read-only or read-write. These settings are where 90% of the
  interesting decisions live, and they're attached to the *link*, not the node. Makes links
  first-class objects worth clicking on.
- **`Snap groups / templates`** — Save a wired cluster (LB + 3 web + cache) as a reusable blueprint
  you can stamp down. Essential for the late game, and an unlock in its own right.

## 7.3 Placement, upgrades, time

- **`Build time and cold start`** — Nothing is instant. Ordering hardware takes real in-game time
  (with expedited shipping as a cash option); provisioning takes time; warming a cache takes time.
  Pre-building during calm is the core strategic skill.
- **`Upgrade vs Replace vs Add`** — Three distinct verbs. Upgrade (in place, brief downtime), Replace
  (buy new, migrate, old one is salvage), Add (horizontal, no downtime, more complexity/upkeep).
  Each has a different risk/time/cost shape and the right answer varies.
- **`Maintenance Windows`** — Some actions require downtime. You schedule a window; during the window,
  visitors are lost but threats also can't hurt you. Announced windows cost less reputation than
  surprise ones. Scheduling is a planning minigame.
- **`Config sliders with living tradeoffs`** — Every defense has a slider (WAF aggression, rate limit
  threshold, timeout length, cache TTL). Moving a slider shows a live preview of estimated false
  positives vs blocked threats. The whole mid-game is slider tuning under changing conditions.
- **`Pause-and-plan`** — Active pause where you can queue actions. Non-negotiable for a game this
  dense. Real-time with pause, plus adjustable speed (1×/2×/4×) and **auto-pause on incident** as a
  toggleable option.
- **`Action Points / Staff Attention`** — Your ability to *do things* is gated by staff, not just
  money. During an incident, every action consumes an engineer for a duration. This is what makes
  simultaneous failures genuinely hard: you have money but no hands.
- **`The Incident Queue`** — Multiple concurrent problems shown as a triage list you assign staff to.
  A hospital-ER feel layered onto a tower defense.

## 7.4 Information, fog, and diagnosis

- **`Fog of Infra`** — You don't automatically see what's wrong. Without monitoring, you see only the
  *symptom* (visitors bouncing) and must probe to find the cause. Buying observability literally
  lifts fog off the board. This single mechanic makes "boring" purchases exciting.
- **`Symptom vs Cause`** — Multiple causes produce identical symptoms. A slow site could be: DB lock,
  full disk, saturated uplink, a noisy neighbor, or a bot flood. The diagnosis loop (observe →
  hypothesize → test → fix) *is* the gameplay in mid-late tiers.
- **`Red Herrings`** — The obvious suspect is sometimes innocent. The alert that's firing loudest is
  sometimes a downstream effect. Reward players who check the graph direction.
- **`Alert Fatigue`** — If you have too many noisy alerts, the real one is visually buried. You can
  tune alert thresholds; too tight = noise, too loose = missed incidents. Self-inflicted difficulty.
- **`Time to Detect / Time to Resolve`** — Two separately-tracked stats, separately improvable, that
  feed the score. Makes "I fixed it fast but took 8 minutes to notice" a legible failure.
- **`The Dashboard as a Weapon`** — Player-customizable dashboard: choose which 6 metrics to show.
  Choosing well is a skill. Expert players build a different dashboard per level type.

## 7.5 Failure, recovery, and consequence

- **`Graceful Degradation as a strategy`** — Deliberately turn off features (search, recommendations,
  images) to save the core path. A "shed load" button with granular controls. Losing 20% of function
  to save 100% of checkout is a genuinely satisfying decision.
- **`Circuit Breakers`** — Auto-shed when a dependency is sick. Placeable, tunable, and prevents
  cascade failure. The first automation that feels like a superpower.
- **`Cascade rules`** — Failures propagate along links with probability, so poorly-isolated
  architectures can domino. Segmentation and circuit breakers are the counters. Watching a cascade
  is the game's best spectacle and worst moment.
- **`The Rollback`** — A universal "undo the last change" action with a cost and a time. Not always
  available (irreversible DB migrations). Teaches which actions are one-way doors — the game should
  visually mark one-way-door actions with a distinct confirmation.
- **`Salvage`** — Dead hardware can be stripped for parts, recovering some value. Failure isn't total.
- **`The Rebuild`** — Nuking and reprovisioning a compromised box: guaranteed clean, costs time and
  the data you didn't back up. The only reliable answer to persistence.
- **`Postmortem → Prevention`** — Each incident offers a concrete prevention purchase afterward, at a
  discount, while the pain is fresh. Mechanizes "we'll fix it after the outage" institutional behavior.

## 7.6 Meta-loops

- **`Calm/Storm rhythm`** — Explicit phases. Calm = build, plan, research, do maintenance, restore
  drills. Storm = defend. The calm phase must be genuinely useful or players will just rush; it's
  where insight, morale recovery, and preparation happen.
- **`The Weather Forecast`** — A threat radar showing what's coming in the next wave with decreasing
  certainty further out. Investable: better threat intel = better forecast. Converts observability
  into foresight.
- **`Opportunity Events`** — Positive random events to balance the disasters: a viral mention, a
  competitor's outage (poach!), a hardware fire-sale, a talented applicant.
- **`Reputation as a slow resource`** — Rises slowly with good service, falls fast with incidents,
  gates customer quality. The long-term currency the player must protect.

---

# 8. Visuals and presentation

## 8.1 Art direction candidates

- **`Clean Isometric Tech`** (primary) — Isometric 3/4 view, flat-shaded with soft gradients, chunky
  readable silhouettes, a restrained palette (deep slate background, cool cyan/teal for "yours,"
  warm amber/red for "theirs," green for money/health). Servers are stylized but recognizable.
  Reads well at both 1 server and 200.
- **`CRT Terminal`** alternate skin — Everything in phosphor green/amber on black, ASCII-adjacent.
  A cosmetic mode for nostalgia, and genuinely good at high density.
- **`Blueprint mode`** — The functional overlay described in §7.2: white-on-blue, orthogonal lines,
  labeled nodes, no decoration. This is not just a style, it's the *readability solution* for scale.
- **`Diorama physicality`** — At colo/DC tiers, lean into the tactile: visible rack rails, cable
  bundles, blinking LEDs, a dangling zip tie, coffee cup on top of the KVM. The humanity of a real
  datacenter is a huge part of the charm.

## 8.2 What things look like

**Infrastructure**
- **Web server** — A 1U pizza-box with a soft cyan glow on the front bezel; the glow *pulses with
  request rate*, so you can read load from across the map without a number.
- **Database** — A heavier 2U/4U with visible drive bays; drive activity lights flicker with query
  volume. A replica looks identical but tinted and slightly translucent, connected by a "lag cord"
  that stretches visibly when replication falls behind. **Replication lag is literally a stretched
  rubber band.**
- **Cache** — A small, bright, fast-blinking box with a translucent bubble/aura around it; the aura
  is the "shield" that visibly absorbs traffic. When the cache dies, the bubble pops with a
  shockwave and you *see* the flood hit the DB. Best single visual in the concept.
- **Load balancer** — A splitter/prism shape; incoming traffic beam splits into colored strands that
  fan out to web nodes. Uneven balancing is visible as uneven strand thickness.
- **Firewall** — A physical gate/portcullis on the path with slots. Blocked units bounce off with a
  spark; allowed units pass through with a soft chime.
- **WAF** — A translucent scanning curtain; units pass through and get briefly x-rayed, revealing
  their true nature (threat icons flash red inside the curtain before being rejected).
- **CDN** — Satellite-like nodes at the map edges with a halo; traffic that gets served at the edge
  never enters your board at all and is shown as "absorbed" counters at the perimeter. Visually
  communicating "traffic you never had to handle" is important.
- **Rack** — A cabinet with sliding-glass front; you can open it to see units. Fullness is legible at
  a glance; empty U slots are dark gaps.
- **Power** — A separate overlay where cables glow; a tripped breaker snaps to red and everything
  downstream goes grey and still. Silence is the effect.
- **Cooling** — Cold aisle rendered with pale blue floor mist; heat rendered as rising orange
  distortion. Thermal overlay turns the whole floor into a heatmap.

**Threats**
- Give every threat a **silhouette-readable shape** so the player identifies by outline at speed.
- **Bot swarm** — Tiny identical angular drones moving in lockstep grid formation.
- **Script kiddie** — A scruffy, jittery, hoodie-shaped blob leaving a trail of dropped soda cans;
  moves erratically.
- **SYN flood** — Semi-transparent "half packets" — units drawn as literal half-shapes — that pile up
  at the gate and don't despawn. The clog is the visual.
- **Slowloris** — A single slug-like unit that oozes in, sits on a web server, and slowly turns it
  grey. Barely moves. Easy to miss on purpose.
- **SQL injection** — A thin, serpentine unit (an actual snake silhouette; the pun earns its place)
  that ignores the front door and slithers along the *cable* between web and DB. Attacking the link
  rather than the node is a great visual differentiator.
- **DDoS** — Not units: a rising tide/flood plane that washes across the map edge. Volumetric attacks
  should feel like weather, not enemies.
- **Ransomware** — A creeping purple crystalline growth that spreads node to node along links,
  freezing each one solid. Visual spread rate = urgency.
- **Nation-state** — Almost invisible: a faint shimmer/heat-haze that only appears in the security
  overlay. Its presence is shown by *absence* — telemetry going suspiciously quiet.
- **Competitor** — Never appears on the infra board at all. Appears only as a smug logo in the
  business panel and as red arrows on your churn graph. Threats that exist on a different screen are
  a genuinely interesting design space.
- **Hardware failure** — The unit itself changes: smoke wisp, a red LED, a grinding-noise icon; a
  dead drive bay literally goes dark. No enemy arrives — something just stops.

**Visitors**
- **Base visitor** — Small rounded figures, warm-colored, walking a path, carrying an intent icon
  (magnifying glass = browsing, shopping bag = buying, wrench = API call).
- **Patience** — A shrinking arc/halo around each visitor's head. When it empties, the visitor puffs
  out with a grey "bounce" arrow that flies back off the map edge. **Every bounce should be
  individually visible** so loss is felt, not just tallied.
- **Buyer** — Carries a glowing coin purse; on success the purse flies to your money counter with a
  satisfying arc and sound. On bounce, the coins spill and fade.
- **Returning customer** — Wears a small badge/hat indicating tenure; visibly more patient (bigger
  halo).
- **VIP / Reviewer** — Larger, spotlit, with a floating star rating that fills or empties in real time
  based on their experience. Everyone watching knows the stakes.
- **Crawler** — A little wheeled robot that methodically visits many nodes and leaves a trail.
- **Crowd density** — At high traffic, render visitors as a flowing stream/particle field rather than
  individuals, with individuals only rendered for high-value units. Solves the readability-at-scale
  problem while keeping the important ones legible.

## 8.3 Expressing actions and state

- **`Traffic as light`** — Data flows along cables as moving dots of light. Speed = throughput,
  color = type, gaps = packet loss. This one system communicates most of the board's state.
- **`Queue as physical stacking`** — Units waiting at a node visibly pile up. A long queue is a
  crowd, and crowds are instantly readable as "bad."
- **`Health as color temperature`** — Not health bars: nodes shift hue from cool cyan (idle) → green
  (healthy load) → amber (stressed) → red (saturated) → grey (dead). No numbers needed for triage.
- **`Money as motion`** — Income flies in as coins from served visitors; costs drain as a steady
  trickle from the counter. A big invoice is a visible chunk being carved off. Never let money change
  silently.
- **`Upgrades`** — A brief "install" animation: the unit is briefly wrapped in scaffolding/a progress
  ring, then flashes and looks visibly beefier (more drive bays, extra fans, added LEDs). Progression
  must be *visible on the object*, not just in a stat.
- **`Connection made`** — Cable snaps into place with a click, the port LED goes from dark to green,
  and a first test packet runs the length of the cable. Tiny, satisfying, immediate confirmation.
- **`Attack landing`** — Screen-space impact: a localized shake, a red rim-light on the affected node,
  and a floating damage readout in the units that matter (lost visitors, lost dollars, lost data).
- **`Defense firing`** — Firewalls flash and units bounce; WAF curtain ripples; rate limiter shows a
  literal turnstile clicking. Defenses should feel like they're *working*, with the false-positive
  visitors visibly bouncing too so the cost is never hidden.
- **`Cascade failure`** — A wave of grey washing outward along links, node by node, with a descending
  audio tone. It should be genuinely dreadful to watch.
- **`Recovery`** — Color returning node by node, LEDs coming back, the queue draining, visitors
  resuming. The relief must be as visually strong as the disaster.
- **`Degraded mode`** — The site's mini-preview window (see below) visibly loses its images/CSS. You
  can literally see your website getting uglier.

## 8.4 UI / HUD

- **`The Site Preview Window`** — A small always-visible mock browser in the corner showing what a
  visitor actually sees right now: fast, slow (spinner), broken (error page), or insecure (cert
  warning). Converts abstract metrics into visceral truth. Possibly the most valuable UI element in
  the whole concept.
- **`Top bar`** — Cash, MRR, uptime %, reputation stars, current wave/time, and a single composite
  "Are things OK" indicator (a traffic light) for glanceability.
- **`Overlay hotkeys`** — 1-5 switch between World / Network / Power / Thermal / Security views.
  Each overlay is a full re-render of the same board along a different topology (§7.2). Teaching
  players to flip overlays is teaching them to think like an operator.
- **`The Incident Ticker`** — A scrolling log at the bottom with severity colors; clicking an entry
  jumps the camera to the location. Your alert feed, doubling as navigation.
- **`Ticket Panel`** — Customer complaints as little cards with faces and moods; drag a support rep
  onto one to consume it. Visible pile-up during incidents.
- **`Graph drawer`** — A pull-up panel with a few sparkline graphs (RPS, p95 latency, error rate,
  queue depth). Graphs should be *legible while playing*, not a separate screen.
- **`Build menu as a catalog`** — A vendor-catalog aesthetic: product cards with spec sheets, prices,
  a cheesy marketing blurb, and a "known issues" line that only appears once you've been burned.
- **`Tooltips that grow`** — Tooltips get richer as your Codex knowledge of a thing improves. Early
  game: "Some kind of bot." Late game: full behavior, weakness, and expected damage.
- **`Readability at scale`** — At Tier 4+, auto-LOD: individual servers collapse into rack-level
  aggregate indicators when zoomed out, racks collapse into row-level, rows into floor-level. You
  should be able to see a whole datacenter's health as ~20 colored blocks, then drill in.
- **`Minimap with threat radar`** — Shows incoming waves at the perimeter with time-to-impact.
- **`Color-blind and audio-first accessibility`** — Never encode critical state in hue alone; pair
  with shape and pattern. Distinct audio signature per failure class, so an experienced player can
  diagnose with their eyes on another part of the map.

## 8.5 Audio (inseparable from presentation)

- Ambient **datacenter hum** as the baseline; its pitch and intensity track total load. Players will
  learn to feel load before they look at it.
- **Fan spin-up** as a node gets hot; a **drive click-of-death**; a **breaker snap**; the sudden
  **total silence** of a power loss (the most effective sound in the game is no sound).
- A soft **cash register chime** per conversion, becoming a pleasant rhythm at good throughput. When
  the rhythm stutters, you know before any meter tells you.
- **Pager/alert tones** with distinct severity, deliberately slightly stressful.
- **Threat audio signatures** — a dry rattle for bot swarms, a rising roar for volumetric floods, a
  slither for injection attacks.

---

# 9. Anything else

## 9.1 Modes

- **`Campaign`** — The tier ladder of §1, with persistent company, staff, and reputation.
- **`Endless / Survival`** — One board, escalating waves forever. Leaderboard by uptime-weeks survived.
- **`Incident Mode (roguelite)`** — Short 10-minute runs. You're handed a randomly generated,
  somewhat-broken stack and a cascading disaster. Pure triage. Perfect for repeat play and streaming.
- **`Sandbox / Architect`** — No threats, unlimited money; build and admire. With a "run simulation"
  button to stress-test your design (which then scores it — a creative mode with feedback).
- **`Puzzle Mode`** — Fixed board, fixed budget, one correct-ish solution. "Serve this traffic with
  $400 and three devices." Great bite-sized content and a natural daily-challenge format.
- **`Daily Outage`** — A shared daily scenario with a global leaderboard. Everyone gets the same
  disaster; compare recovery times.
- **`Co-op NOC`** — Two-to-four players share one board with divided responsibilities (network,
  compute, business, security). The comedy and the tension both come from miscommunication. Voice-chat
  emergent gameplay is the whole point.
- **`Versus`** — Both players run competing hosts; you bid for the same customers, and (optionally,
  in a "dirty tricks" ruleset) can spend money on attacks against each other. Reputation is the
  shared scoreboard.
- **`Attacker Mode`** — Asymmetric PvP: one player defends, the other spends a budget on attack waves
  and picks timing. Small, focused, extremely replayable.
- **`Historical Scenarios`** — Fictionalized versions of famous internet outages, clearly renamed:
  "The Great Route Leak," "The Certificate That Ate Tuesday," "The Region That Depends On Itself."
  Educational and irresistible to the target audience.

## 9.2 Twists and long-shot mechanics

- **`Your Past Self Is The Boss`** — In later levels, the infrastructure you built earlier returns as
  legacy you must maintain. The best-designed early playthroughs produce the easiest late game — a
  long-range consequence loop almost no TD game has.
- **`Documentation as a mechanic`** — Writing docs costs time now, and reduces incident duration and
  protects against staff loss later. Players who take notes are rewarded. Possibly the most honest
  mechanic in the design.
- **`The On-Call Clock`** — Some levels run overnight; staff availability drops, response times rise,
  and mistakes become more likely. Time-of-day as a difficulty modifier.
- **`Technical Debt as a visible substance`** — Every shortcut leaves a physical residue on the board
  (cable clutter, a sticky note, duct tape, a "temporary" box that's been there for years). Enough
  residue slows everything down. You can spend calm time cleaning it up. Debt you can *see* is debt
  you'll actually pay down.
- **`The Legacy Box`** — Every established company has one machine nobody understands, that nobody
  will touch, that everything depends on. Give the player one, unlabeled, discovered by accident.
  Touching it is a gamble with a huge payoff.
- **`Rubber Duck`** — A desk item you can click during an incident that pauses and asks you to select
  what you think the cause is; correct guesses grant a small speed bonus (and feed the postmortem).
  Charming, and it makes players articulate their hypothesis.
- **`The Pager Goes Off At 3AM`** — An optional "hardcore" toggle where some incidents begin while the
  game is auto-running on a low speed and you must respond within a window. Very divisive; very
  memorable.
- **`Vendor Personalities`** — Recurring NPC vendors with distinct characters: the enterprise sales
  rep who won't stop calling, the boutique provider who's excellent but might go out of business, the
  cheap provider whose gear works until it catastrophically doesn't. Relationships with vendors
  (discounts, priority support) built over the campaign.
- **`The Acquisition Ending`** — One win condition is being acquired. It's lucrative, it ends your
  run, and the epilogue tells you what the acquirer did to your beautiful infrastructure. Bittersweet
  by design.
- **`Ethics dial`** — Optional decisions with money-vs-integrity shape: overselling capacity, hosting
  a sketchy but lucrative client, quietly not disclosing a breach, using customer data for ads. These
  should genuinely pay off in cash and genuinely cost you later — no free virtue, no free vice.
- **`Regulatory Weather`** — Laws change during the campaign, invalidating prior optimal strategies.
  Keeps late-game from calcifying.
- **`Community Bug Reports`** — Your users report bugs; fixing them costs dev time but raises
  retention. Ignoring them accumulates into a churn event.

## 9.3 Humor and tone

The subject matter is intrinsically funny to anyone who's lived it; the game should be **dry and
affectionate**, never mocking.

- Flavor text on every purchase written like a vendor datasheet, with an increasingly unhinged
  "known issues" section.
- Ticket text from customers that is recognizably real: "the internet is broken," "it worked
  yesterday," "can you make the logo bigger, also the site is down."
- **`Achievement names`**: *"Works On My Machine"* (ship a bad deploy), *"It's Always DNS"* (lose a
  level to DNS three times), *"I'll Fix It Properly Later"* (keep a temporary fix for 6 in-game
  months), *"Have You Tried Turning It Off And On Again"* (resolve an incident by rebooting),
  *"Load Bearing Intern"*, *"The Backup Was The Problem"*, *"Five Nines, Zero Sleep"*,
  *"Blameless, Mostly"*.
- **Loading-screen tips that are actually true sysadmin wisdom**, delivered deadpan.
- **The `rm -rf` moment** — one scripted, survivable, hilarious self-inflicted catastrophe in the
  campaign, handled with sympathy rather than punishment.
- Post-incident Slack-style chatter from your staff that reacts to how the incident went — a cheap,
  high-value way to make the company feel populated.
- **Never punch down at users.** The joke is always the situation, never the customer's ignorance.

## 9.4 Long-tail / stretch ideas

- **`Level editor + workshop`** — Share scenarios. This genre lives forever on user content.
- **`Import your real stack`** — A toy mode where you sketch your actual architecture and the game
  tells you (playfully) where it would break. Marketing gold, and genuinely useful.
- **`Spectator/replay`** — Every level records; replays can be scrubbed, and the postmortem timeline
  links to moments. Also makes a great streaming/teaching artifact.
- **`Educational mode`** — Toggle that surfaces the real-world concept name behind every mechanic with
  a one-paragraph explanation. The game could plausibly be used to teach infrastructure fundamentals,
  which is a real audience beyond gamers.
- **`Seasonal/live events`** — A "Patch Tuesday" event, a "Black Friday" event, a "Leap Day" event.
- **`Company culture stat`** — An aggregate of morale, documentation, and blamelessness that quietly
  modifies incident duration, staff retention, and hiring quality. The invisible multiplier on
  everything.
