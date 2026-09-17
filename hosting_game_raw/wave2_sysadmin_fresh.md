# Hosting Company Tower Defense — Idea Dump
## Lens: Veteran Sysadmin / Hosting Engineer

> Everything below is grounded in how this stuff actually behaves at 3am. The design principle I'm
> applying throughout: **the game should teach you real operational instincts by accident.** If a
> player finishes the campaign and walks away with a gut feeling that "a single upstream is a single
> point of failure," that "backups you haven't restored aren't backups," and that "the customer who
> pays the least files the most tickets," the theming has done its job.
>
> Second principle: **in real hosting, almost nothing is a clean kill.** You don't defeat an attack;
> you absorb it, degrade gracefully, and pay for it somewhere. Mechanics should reflect *mitigation*
> and *blast radius* far more than *destruction*. A "tower" in this game is rarely a gun. It is a
> filter, a buffer, a bulkhead, a contract, or a person.
>
> Third principle: **the most expensive outages are self-inflicted.** Roughly speaking: change
> management, capacity misjudgment, and expiring things. The game should make player-caused incidents
> as common and as interesting as attacker-caused ones.

---

# 1. Levels, Scenarios, and Progression

## 1.1 The scale ladder (the campaign spine)

### L1 — "The Shared Box" (one cPanel-style server, you are a reseller)
You don't own the hardware. You own a **reseller account** on someone else's shared box, and you sell
slices of it. Your entire "map" is one server: a finite number of PHP-FPM worker slots, one MySQL
instance, one IP address, one mail queue.

- **Introduces:** worker-pool exhaustion as the core resource. Every visitor occupies a worker slot
  for N ticks; slow visitors (uncached WordPress) hog slots; a slot-starved server bounces everyone.
- **Gets hard because:** you cannot add hardware. Your only moves are *caching, limits, and eviction* —
  you must choose which customer to throttle. First taste of the "noisy neighbor" mechanic.
- **Signature moment:** one customer installs a plugin that does an uncached `SELECT * FROM wp_posts`
  on every page load and takes down all 40 of your tenants. You can see whose it is only if you built
  the per-account resource accounting (slow query log) buildable.
- **Win condition:** 30 days without your upstream provider suspending your reseller account for abuse.

### L2 — "Four U in Someone Else's Cage" (small colo tenant)
You now own four 1U boxes racked in a half-cabinet you rent. You get 2 power feeds (one is actually
the same PDU — a trap you can discover), 1 Gbps uplink, and remote hands at $150/hr with a 4-hour
response.

- **Introduces:** physical hardware. Disks, RAM, NICs, PSUs. IPMI/iDRAC as a buildable. The concept
  of "I can't touch this machine" — every physical action costs money and *time*.
- **Gets hard because:** the remote-hands timer is real. A failed boot drive at 2am means you're down
  until a stranger with a badge walks to your rack. Mitigation is redundancy you paid for in advance.
- **Signature moment:** you discover both your "redundant" PSUs are plugged into the same PDU strip.
  Fixing it requires a maintenance window, which requires telling customers, which costs reputation.

### L3 — "Our Own Suite" (private cage, ~2 racks, real architecture)
Load balancers, web tier, DB primary + replica, cache tier, a backup box, out-of-band management
network.

- **Introduces:** *tiering and pathing.* Visitors now traverse LB → web → cache → DB. Each hop is a
  place to filter threats and a place to add latency. Replication lag becomes a visible resource.
- **Gets hard because:** now you have split-brain, failover storms, and cache stampedes — failures
  that only exist *because* you added redundancy. The lesson: HA introduces its own failure class.
- **Signature moment:** first cache-stampede. Cache node reboots, 100% miss rate, every visitor hits
  the DB at once, DB falls over, cache can't warm because the DB is down. Requires a *request
  coalescing* / stale-while-revalidate unlock to survive.

### L4 — "The Facility" (you now own the building's power and cooling)
Genset, UPS strings, CRAC units, hot/cold aisle containment, fire suppression, loading dock, badge
access, a NOC.

- **Introduces:** the **physical layer as a tower-defense layer.** Heat is now a spreading, positional
  hazard. Power is a tree with capacity per branch. You place racks on a floor grid and the airflow
  matters.
- **Gets hard because:** thermal and electrical faults are *area-of-effect* and they cascade. One
  failed CRAC raises a hot-aisle temperature that throttles CPUs in a radius, which raises fan speeds,
  which raises power draw, which trips a breaker.
- **Signature moment:** annual generator load test. You must schedule it, and there's a small chance
  the ATS doesn't transfer and you eat a real outage — the only way to lower that chance is to have
  done the test regularly, which costs a small risk each time. Perfect risk-management minigame.

### L5 — "The Colo Landlord" (your customers are other hosting companies)
You rent cages, power, and cross-connects. You do not control what goes in them.

- **Introduces:** **uncontrolled tenants.** Each tenant is an NPC hosting company with its own build
  quality, power habits, and abuse profile. You can inspect, contract, and evict — but not fix.
- **Gets hard because:** your risks are now *other people's mistakes*. A tenant overdraws their circuit,
  a tenant's crappy gear catches fire, a tenant gets DDoSed and it saturates a shared upstream.
- **Signature moment:** a tenant who is a bulletproof host gets your entire building's IP space listed
  by a major blocklist. Do you evict a customer paying 30% of your revenue?

### L6 — "Multi-Region" (three facilities, one company)
Anycast, GeoDNS, cross-region replication, a follow-the-sun NOC.

- **Introduces:** latency as geography, and the **split-brain / consistency** axis. Also: correlated
  failure (same DNS provider, same certificate authority, same BGP transit, same software version).
- **Gets hard because:** the *control plane* becomes the single point of failure. Your regions are
  redundant; your deploy pipeline, your DNS, and your auth system are not.
- **Signature moment:** you push a config change that is correct in region A and fatal in region B,
  and your deploy tool helpfully rolls it out everywhere in 40 seconds.

### L7 — "The Platform" (you sell an API; other people build on you)
Multi-tenancy at the software layer, quotas, rate limits, a status page, an SLA with teeth.

- **Introduces:** the customer as a *programmatic* actor. A customer's retry loop is indistinguishable
  from a DDoS. Thundering-herd-of-your-own-clients after every blip.
- **Signature moment:** you recover from a 3-minute outage and immediately fall over again because
  every client retried simultaneously with no jitter. Unlock: **exponential backoff advocacy** (you
  literally publish a client SDK to make your customers less dangerous).

## 1.2 Hosting-type levels (the variety engine)

Each one rewrites the rules substantially. Names are the level names.

### "Tick Rate" — Game Server Hosting
- Visitors are **players joining servers**; they are extremely latency-sensitive and extremely
  loud when unhappy. A 90ms ping loses you the customer; a 20ms ping wins their whole clan.
- New resource: **tick budget.** Each game server instance must complete a simulation tick in ≤ X ms.
  CPU single-thread speed matters more than core count — you buy high-clock, low-core boxes, the
  opposite of every other level.
- Threats: **booters/stressers** (cheap, constant, aimed at individual players to win matches), *not*
  at your infrastructure — they're attacking your customer's game session from inside your network.
  Also: cheat clients, RCON brute-force, exploit-based crash packets, "server browser" scrapers, and
  a specific horror: **UDP amplification reflection where YOUR servers are the reflectors.**
- Buildables: per-instance CPU pinning, DDoS scrubbing with UDP-aware filters (hard — you can't just
  drop UDP), anti-cheat integration, automated server restarts on tick-drop, region pops for latency.
- Economics: tiny ARPU, enormous volume, brutal churn, seasonal (a new game release is a gold rush;
  the game dying is a cliff). Add a **hype cycle** mechanic: a new game launches, you can pre-build
  capacity on speculation. Guess right, print money. Guess wrong, eat idle hardware.

### "Bit Rot" — Backup / Archival / DR Hosting
- Visitors are **backup jobs**: they arrive on a schedule, in a huge burst, at night. They don't bounce
  — they *fail and retry*, and a failed job is invisible until restore time.
- Core inversion: **your success metric is something you can't observe.** Durability is a hidden stat.
  The only way to reveal it is **restore testing**, which costs money and produces no revenue.
- Threats: silent data corruption, tape library robot failures, an entire LTO generation going EOL,
  **ransomware that encrypts the customer's data and then sits for 90 days so it's inside your
  retention window**, a customer who deletes their data and wants it back from day 400 of a 365-day
  retention, and the classic: your backup job has been "succeeding" for two years while writing zero
  bytes.
- Buildables: immutable/WORM storage, air-gapped vault, offsite tape courier (a literal van on the
  map — it can crash), checksums/scrubbing (a continuous background process that costs IOPS and
  reveals corruption), 3-2-1 compliance meter.
- Signature scenario: **"The Restore Drill."** A customer declares a disaster. You have an RTO clock.
  You must actually walk the restore path — find the tape, load it, read it, ship the data — and any
  shortcut you took in the last 10 levels bites you now.

### "Anycast" — DNS Hosting
- Visitors are **queries**: billions of tiny UDP packets. Individually worthless, collectively the
  entire internet's front door.
- Core mechanic: **cache TTL as a strategic dial.** Low TTL = agility, high query volume, high cost,
  fast failover. High TTL = cheap, resilient to your own outage, but a mistake propagates for hours
  and you cannot take it back. Every TTL choice is a bet.
- Threats: DNS amplification (you are the weapon), random-subdomain / water-torture attacks (queries
  for `a8x7f2.victim.com` that you must recursively fail, blowing out your negative cache), cache
  poisoning, registrar account compromise, a **BGP hijack of your anycast prefix**, and the
  Dyn-2016-style scenario where you're attacked because of *who your customer is*.
- Buildables: anycast POPs (placed on a world map — each adds coverage and a new BGP session that can
  be hijacked or leaked), RRL (response rate limiting), DNSSEC (adds integrity, adds a key-expiry
  time bomb, adds packet size which makes you a *better* amplifier — a beautiful tradeoff),
  registrar lock, out-of-band secondary provider.
- Signature failure: **DNSSEC key rollover missed.** Your zone is cryptographically valid-until-it-
  isn't, and validating resolvers worldwide simply stop being able to resolve you. Nothing is "down."
  Everything is unreachable. Your monitoring, which uses a non-validating resolver, says green.

### "Deliverability" — Email Hosting
- Visitors are **messages** trying to get *out*, and the defense is inverted: you're not stopping
  attackers from reaching you, you're proving to *other people's* spam filters that you're legitimate.
- Core resource: **IP reputation**, a slow-moving stat that takes months to build and hours to destroy.
  New IP space starts cold and must be **warmed** — a literal ramp-up minigame where you send
  increasing volume and watch bounce rates.
- Threats: one compromised customer account sending 400k messages at 2am; a legitimate customer who
  bought a mailing list; backscatter; a joe-job; your /24 getting listed because of a *neighbor's* IP;
  Google silently deciding your mail goes to spam with no error and no appeal.
- Buildables: SPF/DKIM/DMARC (each is a config artifact that can be subtly wrong for months),
  outbound rate limiting per account, spam-scanning on egress, feedback loop subscriptions, dedicated
  IP pools separated by customer risk tier (a **quarantine pool** for new/risky senders), postmaster
  relationships.
- Signature moment: you discover your abuse@ mailbox has 6,000 unread messages, and that is why
  you're on a blocklist.

### "Edge" — CDN Hosting
- Visitors arrive *everywhere at once*; the map is a world map with POPs, and the mechanic is
  **cache hit ratio** as the master stat. Every percentage point of hit ratio is money off your origin
  bill and latency off your customer's page.
- Threats: cache-busting attacks (attacker appends `?x=random` to every request, forcing 100% miss
  and turning your CDN into a DDoS amplifier *aimed at your own customer's origin*), cache poisoning
  via unkeyed headers, **cache deception** (attacker tricks you into caching a logged-in user's
  private page and serves it to everyone), a flash crowd from a single viral link, and TLS cert
  management across thousands of customer domains.
- Buildables: POPs, tiered/shield caching (mid-tier caches that protect origin), origin shielding,
  purge infrastructure (a global purge that takes 8 seconds is a *feature you sell*), WAF at edge,
  bandwidth commit contracts with transit providers (95th percentile billing as an actual mechanic —
  see Economy).
- Signature scenario: **"The Super Bowl Ad."** Customer buys a 30-second spot. You know the minute it
  airs. You have 2 weeks to pre-position capacity. Over-provision and you eat cost; under-provision
  and you're a news story.

### "Melt" — GPU / AI Compute Hosting
- Visitors are **inference requests** and **training jobs** — two totally different shapes. Inference
  is latency-sensitive, bursty, small. Training is a job that occupies 8 GPUs for 11 days and must
  not be interrupted, and *checkpointing* is the only thing standing between you and a very angry
  customer.
- Core resource: **power and heat, brutally.** A rack of GPUs draws 40-120kW. Your L4 facility
  designed for 5kW/rack is now useless. This level forces a **retrofit**: liquid cooling, rear-door
  heat exchangers, new busway, possibly a new building.
- Threats: thermal runaway, a GPU with failing HBM that silently produces NaNs (a *correctness*
  failure, not an availability one — the customer's 11-day training run is garbage and they blame
  you), crypto miners lying about their workload, model-weight exfiltration, NVLink/fabric failures,
  a firmware bug that bricks a whole tray, and **supply chain** — you literally cannot buy more.
- Buildables: liquid cooling loops (with their own leak risk — water in the datacenter), power capping
  / DVFS (trade performance for staying under the breaker), job scheduler with preemption, MIG
  partitioning, checkpoint-to-fast-storage, ECC monitoring, a spot/preemptible tier.
- Economics: the highest revenue-per-rack in the game and the highest capex. Utilization is
  everything — an idle GPU is a bleeding wound. Add a **spot market** where you sell idle capacity
  cheap and can reclaim it, at a reputation cost.

### "The Cage" — Colocation
- Your customers physically enter your map. **Tenant NPCs** arrive with their own gear, plug it in,
  and leave. You see their racks as opaque boxes with a power draw and a heat output you can measure
  but not control.
- Mechanics: power circuits (A/B feeds, breaker capacity, the fact that a 20A circuit is derated to
  16A continuous and tenants *always* forget this), cross-connects (a physical fiber run you bill
  monthly forever — the single best-margin product in hosting), cabinet density limits, badge access
  control, escort requirements, the **loading dock** as a queue.
- Threats: tenant overdraws a circuit and trips a breaker taking down their neighbor on the same PDU;
  a tenant's consumer-grade PSU fails violently; a tenant runs a space heater under their desk in the
  build room; social-engineered physical access ("I'm here from Dell, I need to swap a drive");
  tailgating; a tenant's DDoS saturating a shared uplink; a tenant who stops paying and whose gear you
  now legally cannot touch for 90 days while it consumes your power.
- Signature moment: **"Whose Cable Is That?"** A cable in the overhead tray is unlabeled, running to
  a cage that was decommissioned 3 years ago, and may or may not be carrying live production traffic
  for a customer who no longer exists in your billing system.

### "Bulletproof" — Anything-Goes Hosting
- Highest revenue per customer, no SLA, prepaid in crypto. Your threat model inverts: the attacks
  come from **abuse complaints, law enforcement, upstream carriers, and blocklist operators.**
- Mechanics: a **Heat** meter instead of (or alongside) reputation. Every sketchy customer adds heat.
  Heat draws: abuse reports (cheap to ignore, but they stack), upstream carrier warnings (3 strikes
  and your transit is cut), blocklist listings (kills your legitimate customers), payment processor
  termination, and eventually a **raid event** where your gear is physically seized.
- Player choices: how much do you know about your customers (KYC costs revenue but lowers heat), how
  fast do you respond to abuse, do you have a "we null-route on complaint" policy, do you keep logs
  (logs protect you legally and endanger you politically).
- Beautifully cynical mechanic: **the more upstream providers you have, the more heat you can absorb**
  — you can lose one and survive. Redundancy as legal armor.

### "Dial Tone" — 1996 Dial-Up ISP (period level)
- Visitors are **modem calls**. Your capacity is literally a count of **modem ports** in a rack of
  Portmasters/Total Controls, and your bottleneck is **inbound phone lines (a PRI = 23 channels)**.
- Mechanics: busy signals as the bounce condition (a customer who gets 3 busy signals cancels).
  Oversubscription ratio as the core economic dial — the industry standard was ~10:1 and you tune it
  live. Long-distance charges if you don't have a local POP in a town. AOL's flat-rate pricing as a
  scripted market event that destroys your per-hour billing model mid-level.
- Threats: a lightning strike on the copper plant, a telco that takes 45 days to provision a PRI,
  the RADIUS server dying (nobody can log in, but the lines all answer — a perfect "green dashboard,
  dead service" scenario), users leaving their connection open 24/7, a war-dialer, and the
  **"free hour" promo** that triples call volume overnight.
- Buildables: modem banks, PRI/T1 lines, RADIUS, a news (NNTP) feed server that costs more bandwidth
  than everything else combined, a shell box, a web-hosting box with 5MB per user, a Usenet spool
  that grows faster than you can buy disk.
- Aesthetic: beige, CRT green, blinking channel LEDs, the sound design is *modem handshakes*.

### "The Feed" — Usenet / IRC / BBS era (deep retro side-level)
- Your "visitors" are *peers*, not customers: you exchange feeds with other sites, and your standing
  in the network is social. Threats are spam cancels, flood bots, netsplits, and the sheer
  exponential growth of binaries groups eating every disk you own.

### "In Scope" — Regulated Hosting (HIPAA / PCI / FedRAMP)
- The primary antagonist is an **auditor**, who arrives on a schedule and attacks your *documentation*,
  not your infrastructure. Controls are buildables that cost money and provide no performance.
- Mechanics: **scope** is a drawable boundary on your map. Anything inside scope needs controls;
  anything outside doesn't. **Scope reduction is a legitimate and powerful strategy** — segment the
  cardholder data environment onto 3 machines instead of 40 and your audit cost drops 80%.
- Threats: an unpatched CVE with a 30-day remediation clock; an employee whose access wasn't revoked
  on termination; a log retention gap; an untested DR plan; a subcontractor without a BAA; a finding
  that your "encrypted" backups use a key stored next to the backups.
- Scoring: you can be perfectly available and still *fail the level* by failing the audit. Great
  change of pace.

### "Uptime Is A Contract" — Financial Exchange Colo (hyper-niche, delicious)
- Latency measured in **nanoseconds**. Fiber length is a physical resource — every tenant gets
  **exactly the same length of fiber** regardless of where their cage is, because fairness is
  regulated. Cross-connects are sold by the meter. Customers pay obscene money for a cabinet 40 feet
  closer to the matching engine.
- Mechanics: you sell *equal* latency as a product, and the threat is a tenant who finds an unfair
  advantage (a microwave link, an FPGA, a cable someone cut 2m short) and the regulator who finds out.

### "Ground Station" — Satellite / Edge / Remote Site Hosting
- Your sites are in places with no staff, bad power, and 600ms of latency. Every failure is a
  multi-day truck roll. **Everything must be remotely recoverable** — out-of-band management,
  watchdog reboots, dual-bank firmware, A/B partitions.
- Signature failure: you push a firmware update that breaks the network stack on 40 remote sites at
  once and now the only fix is physical. This is the game's ultimate "verify your rollback path"
  lesson.

## 1.3 Scenario types (drop-in, replayable, orthogonal to level)

1. **"Launch Day"** — customer's product launches at a known time. Pre-provision capacity blind.
2. **"The Migration"** — move 400 sites from old hardware to new with zero downtime. Mechanics: dual
   writes, DNS TTL lowering *in advance*, a cutover window, and the discovery that 12 sites have
   hardcoded IPs.
3. **"Post-Breach"** — you start the level already compromised. Objective: contain, evict, rebuild
   trust. You don't know which machines are dirty. Forensics costs time; rebuilding costs downtime;
   ignoring it costs everything.
4. **"Audit Week"** — no attacks at all. Pure documentation/controls puzzle.
5. **"The Acquisition"** — you inherit a competitor's infrastructure: undocumented, out of warranty,
   running EOL OSes, with a customer list that includes three people who haven't paid since 2019 and
   one who is 40% of the revenue. Objective: integrate or divest without losing customers.
6. **"Carrier Cut"** — a backhoe severs your primary transit. Survive on backup capacity; decide who
   gets deprioritized.
7. **"The Heat Wave"** — ambient temperature exceeds your cooling design point for 5 consecutive days.
   Shed load or melt.
8. **"Cert Apocalypse"** — a CA is distrusted overnight. Every certificate you issued from them is
   now invalid. Reissue at scale, and discover which services pin certificates.
9. **"Leap Second" / "Y2K38" / "The Date Bug"** — a time-based bug fires simultaneously everywhere.
10. **"Rate Limited By Your Own Success"** — a customer goes viral; you must decide between letting
    them consume the whole cluster or throttling your best-performing customer.
11. **"The Regulator Calls"** — a government asks for data. Legal, reputational, and technical
    consequences branch.
12. **"Zero Day Friday"** — a critical RCE drops at 4pm Friday in software running on 100% of your
    fleet. Patch now (risk of breakage, no testing) or wait (risk of compromise). Timer running.
13. **"The Bus Factor"** — your only engineer who understands the legacy billing system quits.
    Knowledge becomes a depletable resource.
14. **"Black Friday for a Client"** — e-commerce customer, hard revenue numbers, you get a bonus tied
    to their conversion rate.
15. **"The Renewal"** — your colo lease / transit contract / hardware warranty is up. A negotiation
    minigame where leverage is your ability to credibly threaten to leave.
16. **"Someone Else's Outage"** — a major cloud region dies. You're fine, but your *customers'*
    dependencies aren't, and your support queue explodes with tickets that aren't your fault.
    Opportunity: a sales spike if you handle it gracefully.
17. **"The Insider"** — an employee is exfiltrating data. Detection requires logging you may not have
    built; accusation requires evidence; firing them requires revoking access *atomically*.
18. **"Free Tier Abuse"** — you launch a free tier for growth. Within 48 hours it is 90% crypto miners
    and spam relays. Tune the abuse controls without killing genuine signups.
19. **"Depreciation Cliff"** — a whole generation of your hardware hits end-of-life warranty in the
    same quarter because you bought it all at once. Lesson: stagger your refresh.
20. **"The Good Problem"** — you're profitable and idle. Objective is *growth*, not survival. All the
    pressure is sales/marketing-side. A palate cleanser level.

## 1.4 Perspective shifts (same infra, different camera)

- **NOC view** — you don't build, you only *respond*. A wall of alerts, an on-call rotation, and a
  scoring system based on MTTA/MTTR. Pure triage gameplay.
- **Remote Hands view** — you're the datacenter tech. Tickets arrive: "reseat the DIMM in A17-U22."
  You walk the floor. Physical puzzle layer. Fun as an interstitial minigame.
- **Customer view** — play one level as a *customer* of a hosting company, experiencing outages you
  can't fix and support you can't reach. Reframes everything after it.
- **The Attacker view** — one optional level where you run the botnet. Teaches threat mechanics from
  the inside so the player understands the defenses.
- **Capacity Planner view** — a spreadsheet-ish strategic layer, no real-time combat, 18-month
  horizon, order lead times.

## 1.5 Difficulty knobs that are *authentic* rather than arbitrary

- **Oversubscription ratio** — the single most honest difficulty dial in hosting. Higher = more money,
  less headroom.
- **Lead time** — how long between ordering hardware and it arriving (2 weeks vs. 9 months).
- **Staff depth** — 1 engineer vs. follow-the-sun.
- **Observability debt** — how much of your infrastructure is instrumented. Low observability = the
  game literally hides information from you.
- **Technical debt / config drift** — accumulates passively if you take shortcuts; manifests as
  random variance in every operation.
- **Customer quality mix** — a level can be seeded with 80% good customers or 80% problem customers.

---

# 2. Threats

Organized by *how they behave on the map*, because that's what matters mechanically.

## 2.1 Volumetric / saturation threats (the "swarm" class)

**T-01 · Volumetric DDoS (UDP flood / amplification)**
Thousands of tiny identical units arriving from every edge of the map at once. They don't need to
reach your servers to hurt you — they only need to **fill the pipe**, which means they damage you at
the *uplink*, before any of your towers. Counters: upstream scrubbing (expensive, adds latency to
legitimate traffic), BGP flowspec, blackhole/RTBH (you win by *killing your own customer's IP* — the
attack succeeds but the blast radius is contained), anycast dispersion, bigger transit commits.
**Key authenticity:** you cannot filter a 400Gbps attack on a 10Gbps link. The fight has to happen
upstream, which means the fight is really a *contract negotiation* you made months ago.

**T-02 · Reflection/Amplification where you are the reflector**
Your own open NTP/DNS/memcached/SSDP/CLDAP services get used to attack someone else. Visually: your
own towers start *firing at the map edge*. Consequences: transit bill spike, upstream complaints,
reputation. Counter: egress filtering, BCP38, closing open resolvers. Teaches that being a good
netizen is self-interest.

**T-03 · Application-layer DDoS (L7)**
Far fewer units, each disguised as a legitimate visitor, each requesting your **most expensive
endpoint** (search, cart, login, a PDF generator). They walk the same path as real visitors and only
reveal themselves by *behavior*. Counters: rate limiting, JS challenge / proof-of-work interstitial
(costs you real visitors — a visible conversion hit), CAPTCHA (worse conversion hit), behavioral WAF,
caching the expensive endpoint. **The core tension of the whole game in one threat: every defense you
add to stop this also repels revenue.**

**T-04 · Slowloris / Slow POST / R.U.D.Y.**
A tiny number of units that *never leave*. They occupy connection slots indefinitely at near-zero
bandwidth. Visually: units that sit down on your path and refuse to move. Counters: connection
timeouts, a reverse proxy that buffers (nginx in front of Apache — a real, specific, teachable fix),
per-IP connection limits.

**T-05 · Cache-busting / Cache-miss storm**
Requests crafted to always miss cache. Turns your CDN into an amplifier pointed at your origin.
Counter: normalize cache keys, ignore unknown query params, origin shield, rate-limit misses.

**T-06 · The Thundering Herd (not an attack — your own clients)**
After any outage, every client retries at once. Also caused by cron jobs all set to `0 * * * *`.
Counter: jitter, backoff, staggered scheduling, request coalescing. Visually: a wall of visitors that
arrives in a perfectly straight line.

**T-07 · Search Engine / AI Crawler Storm**
Not malicious, enormously expensive. A crawler discovers your faceted-search URL space and generates
40 million unique URLs. Counters: robots.txt (which polite crawlers honor and impolite ones don't),
crawl-delay, rate limiting by ASN, `nofollow` on facets. Modern variant: **AI scrapers that ignore
robots.txt entirely** and rotate residential IPs, which is genuinely one of the biggest real-world
traffic problems right now.

## 2.2 Precision / intrusion threats (the "infiltrator" class)

**T-08 · Credential Stuffing**
Low-and-slow login attempts using leaked password dumps. Individually indistinguishable from a real
login. Succeeds on the customers who reuse passwords — i.e., **the threat lands on your customer, not
you, but the cleanup is yours.** Counters: MFA (adoption is a customer-behavior stat you can only
influence, not mandate, without churn), rate limiting, breached-password checks, device fingerprinting.

**T-09 · SSH Brute Force**
The constant background radiation of the internet. Thousands of attempts/day against every public IP.
Mechanically: a permanent low-level drizzle that costs nothing until one succeeds. Counters: key-only
auth, fail2ban, non-standard port (a *placebo* upgrade that the game should let you build and then
show you has minimal effect — teaching moment), bastion host, VPN-only management plane.

**T-10 · SQL Injection**
Only exists if you built a DB tier. A single unit that, if it reaches the DB, doesn't cause an outage
— it causes **silent data exfiltration**, which you discover 6 months later. Counters: WAF (partial),
prepared statements (a *code-level* fix you can only request from a customer), least-privilege DB
users, egress filtering (the DB shouldn't be able to talk to the internet), query anomaly detection.

**T-11 · Web Shell / Backdoor**
Post-compromise persistence. Once one lands, it is *invisible on your dashboard* and re-infects after
you clean. Only file-integrity monitoring or an outbound-traffic anomaly reveals it. Mechanically:
a hidden unit that spawns new threats until located. Counters: FIM, immutable infrastructure,
rebuild-don't-clean policy, outbound egress filtering.

**T-12 · Supply Chain Compromise**
A dependency, a container base image, a vendor firmware, or a monitoring agent you installed on every
box turns hostile. **It bypasses every perimeter defense because you invited it in.** Mechanically:
a threat that spawns *inside* your walls proportional to how many third-party components you built.
Counters: SBOM, pinned versions, internal mirror/registry, vendor review, reducing agent sprawl,
network segmentation so the agent can't reach everything.

**T-13 · Hypervisor Escape / Container Breakout**
Multi-tenancy's nightmare. One customer reaches another customer's data. Rare, catastrophic,
reputation-ending. Counters: patching cadence, dedicated hardware for high-value tenants, gVisor/
Firecracker-style isolation, NUMA/CPU pinning, disabling risky features (nested virt, SMT — the
latter at a *real performance cost*, which is a great tradeoff: turn off hyperthreading and lose 20%
capacity to close a side-channel).

**T-14 · Insider Threat**
An employee (or a contractor, or a remote-hands tech) with legitimate access. No perimeter stops it.
Counters: least privilege, dual control for destructive ops, session recording, offboarding
automation, and **job satisfaction as an actual stat** — an underpaid, overworked, on-call-every-week
engineer is a higher insider risk *and* a higher mistake risk.

**T-15 · Ransomware**
Encrypts production, then the backups, then leaves a note. Specifically targets your backup
infrastructure first because that's what makes the ransom work. Counters: immutable/WORM backups,
air gap, separate backup credentials (a backup system that uses domain admin is not a backup system),
tested restores, segmentation.

**T-16 · Social Engineering / Vishing the Support Desk**
An attacker calls *your support team* and gets a password reset. Bypasses all technology. Counters:
callback verification, PIN on account, "we will never ask you to..." training, a support-staff
**training stat** that decays over time and after turnover.

**T-17 · Domain / Registrar Hijack**
Nobody attacks your servers. They attack your *registrar account* and point your domain elsewhere.
Everything you own is fine and completely unreachable. Counters: registrar lock, MFA on registrar,
separate low-privilege registrar account, DNSSEC, monitoring your own NS records from outside.

**T-18 · BGP Hijack / Route Leak**
Someone announces your prefix. Your traffic goes to them. You cannot fix it from inside your network
— you must call other humans at other networks. Mechanically: a threat you fight with **relationships
and paperwork**, not towers. Counters: RPKI/ROAs, IRR objects, peering relationships, BGP monitoring
(an alert that says "someone else is announcing you"), prefix filters at your upstreams.

**T-19 · TLS Cert Expiry**
Not an attack. A timer you set yourself and forgot. Takes out an entire service instantly and
completely. Counters: ACME automation, expiry monitoring (from *outside*), staggered expiry dates.
Should absolutely be in the game as a recurring self-inflicted wound. Corollary: **the internal CA
root cert expiring after 10 years**, which nobody has ever remembered.

**T-20 · Exposed Management Interface**
An IPMI/iDRAC/Redfish/admin panel accidentally reachable from the internet, often with default
credentials. Gives an attacker *physical-equivalent* control — they can power off your machines and
mount virtual media. Counters: OOB network isolation, VPN, credential rotation, port scanning
yourself (a buildable: "attack surface scanner" that reveals your own exposure).

**T-21 · Abandoned / Shadow Infrastructure**
The dev box from 2019 that's still running, unpatched, with a DNS record pointing at it. Mechanically:
**accumulates automatically as a byproduct of playing** — every temporary thing you build has a chance
to never get cleaned up. Counter: asset inventory, periodic discovery scans, a "decommission" action
that costs time and gives no visible reward (so players won't do it — which is the point).

**T-22 · Subdomain Takeover**
You pointed `status.customer.com` at a SaaS you stopped paying for. Now anyone can claim it. Counter:
DNS hygiene, dangling-record scanning.

## 2.3 Hardware and physical failure (the "entropy" class)

These should be **constant, probabilistic, and never fully preventable** — the background hum of the
game. Redundancy converts them from outages into *cost and toil*.

**H-01 · Disk failure** — the most common event in the game. Mechanically: every drive has a hidden
wear stat; SMART gives you *partial* foresight. A RAID array survives it but enters a **rebuild**
state — degraded performance, and a window during which a *second* failure is fatal. Big drives =
long rebuilds = the famous "RAID5 is dead" problem. Counter: RAID levels, hot spares, mixing drive
batches (two disks from the same batch fail at the same time — a real and nasty correlation the game
should model), erasure coding.

**H-02 · The bad batch** — you bought 40 drives from one lot; they share a firmware bug that bricks
them at exactly 32,768 power-on hours. Every one of your machines dies the same week. (This actually
happened — HPE SSDs.) Ultimate lesson in correlated failure.

**H-03 · RAM / ECC errors** — correctable errors are a warning; uncorrectable ones crash the box. A
DIMM with rising correctable-error counts is a *predictable* failure if you're watching. Non-ECC RAM
(cheaper) removes the warning entirely and turns failures into **silent data corruption**.

**H-04 · PSU failure** — instant if non-redundant, a beep and a ticket if redundant. Combined with
the A/B feed mechanic: redundant PSUs on the same feed = not redundant.

**H-05 · Fan failure / thermal throttle** — performance degrades silently. Your capacity drops and
you don't know why unless you monitor CPU frequency, not just CPU utilization.

**H-06 · NIC / optic / cable failure** — the worst kind: **partial**. A dying SFP doesn't go down, it
drops 0.4% of packets, which TCP hides, which makes everything mysteriously slow. Should exist in the
game as a "gray failure" that your simple up/down monitoring **cannot see**.

**H-07 · Backplane / controller / motherboard** — takes out a whole chassis. Rare. Recovery = rebuild.

**H-08 · Switch failure** — takes out a rack. Switch *firmware upgrade* failure takes out a rack for
longer. Stacked switches that both reboot during a stack upgrade is a classic.

**H-09 · Power: breaker trip** — you exceeded a circuit. Instant, total, for everything on that
circuit. Preventable purely by *arithmetic you should have done*.

**H-10 · Power: UPS battery EOL** — batteries die on a schedule; a UPS with dead batteries passes
every green-light test and fails the moment it's needed. Requires periodic *load testing* to reveal.

**H-11 · Power: generator fails to start** — the big one. Fuel contamination (diesel grows algae),
a dead starter battery, a fuel filter, or an ATS that doesn't transfer. Only regular testing reduces
the probability, and testing itself carries a small risk.

**H-12 · Power: utility failure** — the trigger for the whole chain. A transformer, a storm, a car
into a pole, a squirrel.

**H-13 · Cooling: CRAC/CRAH failure** — a spreading heat zone. Time-to-thermal-shutdown is a visible
countdown. Your responses: emergency load shed, open doors and blow fans (ugly, works), fail to a
neighboring unit. **N+1 cooling matters more than N+1 power** in a short outage because thermal mass
runs out in minutes.

**H-14 · Cooling: chilled water loop / leak** — water on a raised floor. Also: a leak in a liquid-
cooled GPU rack, which is a modern, genuinely scary one.

**H-15 · Humidity** — too low = static discharge; too high = condensation. A subtle, slow stat.

**H-16 · Fire / fire suppression discharge** — the suppression system itself is a hazard: an inert-gas
dump is loud enough that **the acoustic shock breaks hard drives**. (Real: ING Bank, 2016.) Perfect
game moment — your safety system destroys your storage array.

**H-17 · Physical: someone unplugs the wrong thing** — remote hands pulls A17-U22 instead of A17-U23.
Mitigation: labeling (a cheap buildable with an enormous payoff that nobody builds), colored cables,
port blockers, and **escorting**.

**H-18 · Seismic / weather / flood** — regional. Drives the multi-region argument.

**H-19 · Fiber cut** — a backhoe, a ship anchor, a squirrel, a hunter shooting at an insulator.
Your "redundant" circuits from two carriers that both ride the same conduit under the same bridge is
the classic. Counter: **diverse path audits** — a buildable that literally asks your carriers to prove
their fiber takes different physical routes.

**H-20 · Tape library robot jam / tape media failure** — archival levels. The robot arm drops a
cartridge; the library goes offline; your backups silently stop.

## 2.4 Human / process failure (the "self-inflicted" class — should be ~40% of all incidents)

**P-01 · Bad deploy** — the single most common cause of real outages. Mechanically: every change you
make has a defect probability modified by testing, staging, canary, and review buildables. Reward
players for slow rollouts by making fast rollouts occasionally catastrophic.

**P-02 · Bad config push** — worse than a bad deploy because config pushes are trusted and fast and
go everywhere. The classic: a firewall/ACL change that locks you out of your own management network.

**P-03 · The `rm -rf` / wrong-environment incident** — a destructive command run against prod instead
of staging. Counter: different prompts/colors per environment, dual authorization, `--dry-run`
defaults, restricting who has prod access.

**P-04 · Failed rollback** — you can deploy forward in 40 seconds but rolling back requires a database
migration that isn't reversible. The **one-way door**. Should be a real category of build decision.

**P-05 · Capacity misjudgment** — you sized for average, got peak.

**P-06 · The fix that causes the outage** — 30% of your remediation actions should have a chance to
make things worse, scaled by how tired/panicked the team is.

**P-07 · Alert fatigue** — if your monitoring generates too many low-value alerts, your staff's
response time to a *real* alert degrades. Mechanically brilliant: **a monitoring system can be so
noisy it's worse than none.** Tuning alerts is a real, rewarding action.

**P-08 · Runbook rot** — documentation that describes a system that no longer exists. Decays over time.

**P-09 · On-call burnout** — a staff stat. Every 3am page raises fatigue. High fatigue = slower
response, higher error rate, and eventually **resignation**, which costs you institutional knowledge
permanently.

**P-10 · Expired things** — certs, domains, credit cards, contracts, support entitlements, licenses,
API keys, DNSSEC keys, OAuth secrets, and the corporate card that the SaaS subscriptions are on.
There should be an entire *calendar* of these, and a buildable ("expiry register") that surfaces them.

**P-11 · Missing capacity in the least obvious place** — inode exhaustion, PID exhaustion, conntrack
table full, ephemeral port exhaustion, ARP table overflow, file descriptor limits, a full `/var/log`.
These should all be real, discoverable failure modes, because they're the ones that actually get you.

**P-12 · The logging loop** — a service logs an error, the log fills the disk, the disk-full causes
errors, which are logged. Self-amplifying. Great visual: a spiral.

## 2.5 Business / external threats

**B-01 · Angry customer** — a single customer whose downtime turns them into a threat: SLA credits,
public tweets, a chargeback, a bad review that reduces inbound leads for 90 days.
**B-02 · Chargeback / payment fraud** — stolen-card signups that later reverse, costing you the
revenue *and* a fee, *and* raising your processor risk score.
**B-03 · Competitor** — poaches customers with lower pricing; occasionally does something dirtier
(scraping your customer list from your own reverse-DNS, or reporting you to a blocklist).
**B-04 · Regulator / auditor / subpoena** — consumes staff time, demands artifacts.
**B-05 · Upstream carrier outage / de-peering** — your transit provider has a bad day, or two big
networks get into a peering dispute and your traffic to half the internet gets worse for a month.
**B-06 · Vendor EOL / price shock** — VMware licensing, a bandwidth price hike, a hardware vendor
discontinuing your platform, a cloud provider raising egress fees.
**B-07 · Landlord / lease** — your colo provider gets acquired and triples your renewal price, or
sells the building, or goes bankrupt with your gear inside it.
**B-08 · Currency / power price spike** — your electricity cost doubles. In a GPU or mining level,
this alone can make the business unprofitable overnight.
**B-09 · Reputation cascade** — one public incident → Hacker News → churn spike + lead freeze.
**B-10 · The "free" support customer** — a customer on the $3/mo plan who files 40 tickets a month.
Mechanically: negative-margin customers you must identify and gracefully offboard.

## 2.6 Threat behaviors worth designing around

- **Persistent vs. transient** — a DDoS ends; a backdoor does not.
- **Visible vs. invisible** — the best threats in this game are ones you *cannot see* without having
  pre-built the observability for them. Make information itself a purchasable resource.
- **Attacks the defense** — threats that specifically target your monitoring, your backups, your
  jump host, or your DNS, because that's what real attackers do.
- **Attacks the seam** — threats that exploit the *connection* between two things you built rather
  than either thing itself.
- **Sleeper** — lands quietly, activates in a later level.
- **Correlated** — many "independent" components that fail together because they share a hidden
  dependency. The single most underrated real-world failure mode and the most satisfying thing to
  discover in a game.

---

# 3. Visitors, Traffic, and Clients

## 3.1 What "a visitor" is, per hosting type

The unit that walks your path should change shape, speed, size, and patience per business type. This
is the cheapest possible way to make every level feel different while reusing one engine.

| Hosting type | Visitor unit | Size | Patience | Bounce condition | Revenue model |
|---|---|---|---|---|---|
| Shared web | Page load | Small | ~3s | TTFB > threshold, 5xx | Indirect (customer's plan) |
| VPS/dedicated | Provisioning request | Rare, large | Hours | Stock-out, slow deploy | Monthly recurring |
| Game servers | Player joining | Small, constant | ~90ms ping | Lag, full server, crash | Per-slot monthly |
| CDN | Asset request | Tiny, enormous count | ~200ms | Cache miss + slow origin | Per-GB / per-req |
| DNS | Query | Microscopic, billions | ~100ms | SERVFAIL / timeout | Per-million queries |
| Email | Message | Small | Retries for days | Blocked / spam-foldered | Per-mailbox |
| Backup | Job | Huge, scheduled | Retries | Window overrun, checksum fail | Per-TB stored |
| Object storage | PUT/GET | Variable | Seconds | 503, slow | Per-GB + per-request |
| GPU inference | Prompt/request | Small in, heavy compute | 1-30s | Queue depth, OOM | Per-token / per-second |
| GPU training | Job | Enormous, days | Infinite (but fragile) | Preemption w/o checkpoint | Per-GPU-hour |
| Video/streaming | Viewer session | Continuous bitrate | ~2s rebuffer | Buffering, quality drop | Per-GB / per-viewer-hour |
| VoIP/SIP | Call | Continuous, jitter-sensitive | Instant | Jitter, packet loss, one-way audio | Per-minute / per-channel |
| Colo | Tenant tour → contract | One, huge | Months | Bad tour, no power available | Per-cabinet + per-kW + x-connect |
| Dial-up | Modem call | One port | 3 busy signals | Busy signal, line noise | Per-hour or flat monthly |
| K8s/PaaS | Deploy / pod schedule | Medium | Minutes | Unschedulable, image pull fail | Per-node / per-app |
| DBaaS | Query / connection | Small, chatty | ms | Connection pool exhausted | Per-instance-hour |

## 3.2 Visitor mechanics grounded in reality

**V-01 · Latency Budget** — every visitor carries a patience meter that drains as it traverses hops.
Each buildable on the path adds latency (a WAF adds 8ms, a scrubbing center adds 25ms, an extra
region hop adds 60ms). **Your defenses literally consume your visitors' patience.** This single
mechanic expresses the entire security-vs-performance tradeoff.

**V-02 · Concurrency, not throughput** — the real limit on a web server isn't bandwidth, it's
*simultaneous workers*. Model it: N slots, each visitor occupies one for its service time. Little's
Law becomes intuitive: queue length = arrival rate × service time. Make one slow endpoint eat all
your slots and the player learns why.

**V-03 · The Queue and the Death Spiral** — when arrivals exceed capacity, a queue forms. Visitors in
the queue *still consume resources* while waiting. If the queue grows past the point where visitors
time out before being served, you're doing 100% work for 0% revenue. Only **load shedding** (refusing
requests fast) escapes it. Teaching the player to deliberately drop traffic to survive is one of the
most valuable real lessons in ops.

**V-04 · Cache Hit Ratio as a visible visitor path** — cached visitors take the short green path and
leave happy; misses take the long path through app and DB. Warming, invalidation, and TTL all become
visible routing decisions.

**V-05 · Keepalive and Connection Reuse** — a returning visitor on an existing connection is much
cheaper than a new one (no TCP+TLS handshake). Rewards HTTP/2, connection pooling, and session
resumption as real upgrades that raise effective capacity without new hardware.

**V-06 · Geographic origin** — visitors spawn from world-map regions. Distance = base latency you
cannot optimize away (speed of light is a hard game constant). The only fix is a POP closer to them.

**V-07 · Diurnal curve** — traffic follows a real daily pattern per region, so a global business has
a rolling peak. Batch jobs (backups, reports, reindexing) should be scheduled into the trough — and
the "cron at midnight" collision is a recurring self-own.

**V-08 · Flash crowd / viral spike** — a Hacker News or Reddit front page. 40x normal traffic for
90 minutes, from a narrow geography, hitting one URL. Survivable *only* with caching. Great tutorial
for "static assets should never touch your app server."

**V-09 · The bot fraction** — a large, invisible share of all traffic is non-human. Some is good
(search engines, uptime monitors, your own health checks), some neutral (AI scrapers), some hostile.
Mechanically: a percentage of the visitor stream is *disguised*, and classification accuracy is a
stat improved by bot-management buildables. **Misclassification is the punishment:** block a real
user and you lose revenue; allow a bot and you burn capacity.

**V-10 · Retry amplification** — an unhappy visitor retries, doubling your load exactly when you can
least afford it. Mobile apps are the worst offenders. Ties into T-06.

**V-11 · Visitor "weight" varies wildly** — the 80/20 rule is really 99/1: one customer's 4K video
file is 10,000 page loads. Show it: some visitors are physically huge sprites.

## 3.3 Customer archetypes (the people, not the packets)

**C-01 · The Hobbyist** — $5/mo, one WordPress site, 4 tickets a month, will leave over $1.
Low revenue, disproportionate support cost. Keep them for volume and word-of-mouth or shed them.

**C-02 · The Agency** — brings 40 client sites at once. High value, high concentration risk: when
they leave, they leave with all 40. Demands white-label, reseller tooling, and a phone number.

**C-03 · The Whale** — 35% of your revenue in one logo. Gets custom terms, custom SLAs, a dedicated
Slack channel, and the power to ruin you by leaving or by having one bad quarter.

**C-04 · The Startup That Might Be Huge** — currently pays $200/mo, might pay $80k/mo in 18 months,
might evaporate. Discounting them now is a bet. **Give the player a scouting mechanic** (funding
rounds, hiring signals) to make the bet informed.

**C-05 · The Abuser (Knowing)** — signs up with a stolen card to host phishing, a spam relay, or a
booter panel. Spot them by behavior: instant heavy outbound, port scanning, weird geography, rapid
account creation. Fraud screening on signup is a buildable that also rejects real customers.

**C-06 · The Abuser (Unknowing)** — a real customer whose site got compromised and is now serving
malware. You must notify, help, or suspend. Suspend-first protects your IP reputation and enrages
them; help-first costs staff hours.

**C-07 · The Crypto Miner** — signs up for the "unlimited" plan and pegs 100% CPU forever. Every
unmetered product you ship will be discovered by these people within 72 hours.

**C-08 · The Enterprise Procurement Monster** — huge contract, 9-month sales cycle, a 60-page
security questionnaire, a SOC 2 requirement, net-90 payment terms, and a legal team that wants
unlimited liability. **Winning them requires building compliance artifacts levels in advance.**

**C-09 · The Migrator (Inbound)** — leaving a competitor, angry, needs hand-holding, arrives with
technical debt. Free migration service is your single best acquisition tool and your biggest hidden
labor cost.

**C-10 · The Ghost** — pays on autopay, never logs in, never files a ticket, runs on a server you
forgot exists, on an OS that's 6 years EOL. Pure profit and pure risk.

**C-11 · The Developer Who Knows Better Than You** — will argue about your kernel version, will
report real bugs, will write a blog post about you. Handle well = your best evangelist.

**C-12 · The Reseller** — buys wholesale, sells retail, insulates you from end-user support but also
hides who your actual users are. If they vanish, you inherit their angry customers.

**C-13 · The Colo Tenant** — signs 3-5 year terms. Revenue is extremely sticky (moving racks is
agony) but you inherit their bad habits. Sub-types: *the neat freak*, *the cable spaghetti artist*,
*the one who exceeded their power allocation 8 months ago and nobody noticed*, *the one whose gear is
all out of warranty*, *the one who's actually a competitor scoping you out.*

**C-14 · The Bandwidth Hog** — bought a "1Gbps unmetered" port and actually uses 1Gbps. Your entire
pricing model assumed nobody would. Seedbox and file-host customers live here.

**C-15 · The Compliance Customer** — pays 4x but requires evidence, audits, and controls, and will
terminate the entire contract on one finding.

**C-16 · The Government / Education Buyer** — huge, slow, stable, seasonal (fiscal year end = a
buying spree in a 2-week window), and will pay late but always pays.

**C-17 · The Game Community Admin** — a 19-year-old running a Minecraft server for 200 friends. Will
churn the moment a competitor offers a free month, but their community *follows them*, so winning one
wins 200 players' worth of goodwill.

**C-18 · The AI Startup** — needs 64 H100s yesterday, has funding, has zero ops experience, will try
to `pip install` their way out of a NCCL misconfiguration and then open a ticket blaming your fabric.

**C-19 · The Zombie** — cancelled 8 months ago, still has data on your array, still has a DNS record
pointing at you, still generates 404s in your logs.

## 3.4 Attracting visitors (what the player actively *does*)

**A-01 · Latency as marketing** — publish your latency. In game-hosting and finance-colo levels,
being 12ms faster than the competitor *is* the entire sales pitch.
**A-02 · Uptime page / public status page** — transparency increases trust and conversion, but a
public status page means your outages are *public*. A genuinely double-edged buildable.
**A-03 · Free migration** — converts competitor customers at a labor cost.
**A-04 · The free tier** — enormous top-of-funnel, immediately abused (see "Free Tier Abuse"
scenario). Requires abuse controls as a prerequisite build.
**A-05 · Community presence** — sponsoring a game server community, running an IRC channel, being
helpful on forums/HN/Reddit. Slow-burn, cheap, high-trust lead source, destroyed by one bad incident.
**A-06 · Peering** — every peer you add makes you faster for that network's users *for free* and
reduces transit cost. Peering at an IX is simultaneously a technical, economic, and social action.
Add **peering relationships as friendship stats** with other networks.
**A-07 · The referral program** — customers bring customers, best conversion rate, lowest CAC.
**A-08 · Benchmarks & review sites** — get listed, get reviewed, get a top-3 placement. Vulnerable to
competitors gaming it.
**A-09 · Certifications as a lead magnet** — SOC 2 / PCI / HIPAA unlock whole *customer classes* that
were previously invisible on your funnel.
**A-10 · Case study with a whale** — permission from a big logo multiplies inbound.
**A-11 · Word of mouth from a well-handled outage** — counterintuitive and true: a great incident
response *gains* you customers. Let players earn reputation from a disaster they handled honestly.
**A-12 · Price** — always works, always the worst tool. Attracts C-01 and C-14.
**A-13 · Dogfooding / open source** — release your tooling, gain engineer mindshare.
**A-14 · Trade shows / a booth** — for colo and enterprise levels, real pipeline comes from
handshakes, not ads.
**A-15 · The datacenter tour** — a colo-specific conversion mechanic: a prospect physically walks your
floor. Every visible flaw (messy cabling, a propped-open door, a dirty floor, a beeping unacknowledged
alarm) reduces close probability. **Housekeeping becomes literally worth money.**

## 3.5 Churn and bounce mechanics

- **Instant bounce**: timeout, 5xx, busy signal, SERVFAIL, full server, queue overflow.
- **Slow churn**: repeated small degradations. A customer tolerates one outage, remembers three.
  Model a per-customer **grievance meter** that decays slowly and spikes on incidents. When it caps,
  they leave — often quietly, without ever filing a ticket, which means you learn about it from the
  billing report.
- **Churn triggers that aren't your fault**: they got acquired, they went out of business, they moved
  to AWS because a new CTO said so, they built their own.
- **Save mechanics**: proactive outreach after an incident, an SLA credit issued *before* they ask
  (disproportionately effective), a free upgrade, a phone call from a human. Each costs money and
  works better the *faster* you do it.
- **The exit interview**: churned customers optionally tell you why. Buying this information (a
  buildable: "customer success function") turns churn into intel.

---

# 4. Buildables: Services and Infrastructure

Every entry: **what it does · what it costs · what it connects to · what it opens up.**
The last field is the important one — nearly everything should have a downside.

## 4.1 Compute

**BLD-01 · Shared Web Node (cPanel-alike)**
Serves many small tenants. Cheap per-customer. Connects to: LB, DB, storage, mail. **Opens:** noisy
neighbors, one compromised account infecting all (symlink attacks, world-readable configs), a single
suspension decision affecting 300 sites.

**BLD-02 · VPS Host / Hypervisor Node**
Divides one box into many. Connects to: SAN/local NVMe, network fabric. **Opens:** overcommit risk
(memory ballooning, steal time), hypervisor escape, one tenant's I/O storm starving the rest,
live-migration failures.

**BLD-03 · Dedicated Server**
One customer, one box. Highest isolation, worst utilization. **Opens:** the customer installs
whatever they want and you're responsible for the *network* consequences (T-02 reflection, spam).

**BLD-04 · Bare Metal Provisioning System (PXE/iPXE/Foreman-alike)**
Turns a 3-hour manual install into 8 minutes. Unlocks "instant dedicated" as a product. **Opens:**
an unauthenticated PXE server is a way to reimage your own fleet; a bad template poisons every new
build.

**BLD-05 · Container Platform / Kubernetes Cluster**
Density, scheduling, self-healing. **Opens:** an entire new failure surface — etcd quorum loss, a
CNI bug that silently drops packets, image pull failures when the registry is down, a rolling update
that rolls out a crash-loop, and the nightmare of a control-plane cert expiry (Kubernetes certs
expire in 1 year by default and take out the whole cluster).

**BLD-06 · Serverless/Function Runtime**
Scale-to-zero, pay-per-invoke. **Opens:** cold starts (a latency tax on the first visitor), runaway
recursion (a function that invokes itself — a self-DDoS with a bill attached), and per-invocation
billing that a customer can weaponize against themselves.

**BLD-07 · GPU Node**
Enormous compute, enormous power. Connects to: high-speed fabric (InfiniBand/RoCE), fast local NVMe
scratch, the power and cooling tree. **Opens:** thermal limits, silent NaN corruption, driver/firmware
fragility, the world's most stealable hardware (GPU theft from datacenters is real).

**BLD-08 · Job Scheduler / Batch Queue (Slurm-alike)**
Fills idle capacity, enables preemption, enables a spot tier. **Opens:** starvation of small jobs,
fairness disputes, and preemption-without-checkpointing rage.

## 4.2 Data

**BLD-09 · Database Primary**
Enables dynamic anything. Connects to: app tier, replicas, backups. **Opens:** SQLi, connection
exhaustion (the #1 real cause of "the site is down"), slow queries, lock contention, the fact that
it's a **single point of failure by design**, and the truth that vertical scaling is the only easy
answer and it has a ceiling.

**BLD-10 · Read Replica**
Scales reads, enables failover. **Opens:** **replication lag** — a visible, fluctuating stat that
causes read-your-own-write bugs; a replica that silently stops replicating while still answering
queries (serving stale data with a straight face); and the temptation to fail over to a replica that
is 40 minutes behind.

**BLD-11 · Automatic Failover / Cluster Manager**
Reduces MTTR. **Opens:** **split-brain** (two primaries, both accepting writes, data divergence you
must later reconcile by hand), and flapping failovers triggered by a network blip rather than an
actual failure. Requires a **fencing/STONITH** sub-build to be safe — a great "the fix needs its own
fix" chain.

**BLD-12 · Connection Pooler (pgbouncer-alike)**
Multiplies effective DB capacity for near-zero cost. One of the best value buildables in the game.
**Opens:** a new single point of failure in front of the DB, and transaction-mode subtleties.

**BLD-13 · Cache Tier (Redis/Memcached)**
Massive latency and load reduction. **Opens:** cache stampede on restart, stale data, eviction
surprises (your "cache" silently becomes a database when someone stores the only copy of something in
it), and — famously — **an open memcached port becomes a 50,000x DDoS amplifier.**

**BLD-14 · Object Storage Cluster**
Cheap bulk. **Opens:** a public bucket (the most common cloud breach in the world), egress cost
surprises, eventual-consistency confusion, and rebalancing storms when you add a node.

**BLD-15 · SAN / NAS / Shared Storage**
Lets compute be stateless. **Opens:** the mother of all blast radii — the SAN dies, *everything*
dies. Also: IOPS contention across tenants, and multipath failover that doesn't.

**BLD-16 · Backup System**
Connects to: everything. **Opens:** backup windows that overrun into business hours, backup traffic
saturating the network, restore times nobody measured, and a backup server with credentials to
everything (a ransomware operator's dream).

**BLD-17 · Tape Library / Offsite Vault**
Slow, cheap, air-gapped, the only real defense against ransomware and `rm -rf`. **Opens:** robot
failures, media degradation, the courier van, and the *very real* problem that in 5 years you may not
own a drive that can read the tape.

**BLD-18 · Immutable / WORM Storage**
Cannot be deleted before retention expires — including by you, including by an attacker with root.
**Opens:** you cannot delete it either, which is a GDPR right-to-erasure problem and a cost problem.
Genuinely delicious tradeoff.

## 4.3 Network

**BLD-19 · Top-of-Rack Switch** — connects a rack. **Opens:** a rack-sized blast radius; a broadcast
storm if someone loops two ports (see: spanning tree, and the intern with a patch cable).
**BLD-20 · Core / Spine Switch + Router** — the fabric. **Opens:** a config typo that takes out
everything; ASIC table exhaustion (TCAM full = routes silently not installed).
**BLD-21 · Redundant Uplinks / Multi-Homing + BGP** — survive one carrier dying. **Opens:** you now
run BGP, so you can leak routes, get hijacked, blackhole yourself with a bad prefix filter, or
accidentally become a transit provider between two of your peers.
**BLD-22 · IX / Peering Port** — cheaper, faster traffic to peers. **Opens:** an IX outage, a peer
who de-peers you, and route-server misconfigurations.
**BLD-23 · Load Balancer (L4 and L7)** — distributes, health-checks, terminates TLS. **Opens:** a
health check that's too aggressive (flapping backends out under load, cascading the failure) or too
lax (sending traffic to a dead box); session affinity that concentrates load; and it's a SPOF unless
you build a pair, and a pair needs VRRP, and VRRP can split-brain.
**BLD-24 · Reverse Proxy / Edge Cache (nginx/varnish)** — absorbs slow clients, caches, buffers.
The single highest-leverage buildable in the web levels.
**BLD-25 · Firewall / ACLs** — **Opens:** the rule that locks you out; the rule set that grows to
4,000 lines nobody understands; stateful table exhaustion under DDoS (your firewall dies before your
servers do — extremely real).
**BLD-26 · DDoS Scrubbing (on-prem appliance or upstream service)** — **Opens:** latency during
scrubbing, false positives dropping real customers, and a monthly bill or a per-event bill that a
sustained attack can make ruinous.
**BLD-27 · WAF** — **Opens:** false positives that break customer applications in ways they blame you
for; a rule update that blocks all POST requests; and the maintenance burden of tuning per-customer.
**BLD-28 · IPS/IDS + NetFlow/sFlow collector** — visibility. **Opens:** the data volume itself, and
alert fatigue.
**BLD-29 · Out-of-Band Management Network (separate switch, console servers, PDU control)**
Lets you fix things when the production network is down. **The most underrated buildable — should be
cheap, boring, and level-saving.** **Opens:** if it's ever reachable from prod or the internet, it's
game over (T-20).
**BLD-30 · VPN / Bastion / Zero-Trust Access** — shrinks the management attack surface to one door.
**Opens:** that one door is now extremely valuable; and VPN concentrator capacity becomes a real limit
(remember March 2020).
**BLD-31 · Anycast Deployment** — one IP, many locations. **Opens:** stateful protocols break if a
flow moves POPs; withdrawal/announcement mistakes move global traffic instantly.
**BLD-32 · IPv6** — cheap addresses, future-proofing. **Opens:** a *second* firewall rule set that
everyone forgets to write, so your v6 address is wide open while v4 is locked down. Very real bug.
**BLD-33 · Cross-Connect (colo levels)** — a physical fiber between two cages. Best margin product in
the industry: near-zero marginal cost, billed monthly forever. **Opens:** patch-panel documentation
debt, and the "whose cable is that" problem.
**BLD-34 · Transit Contract** — committed bandwidth at a rate. **Opens:** 95th-percentile billing and
overage exposure; a commit you can't grow into is a dead cost.

## 4.4 Platform, tooling, and observability

**BLD-35 · Monitoring / Metrics (Prometheus-alike)** — reveals hidden state. **Opens:** cardinality
explosion killing your own monitoring; alert fatigue (P-07); and the **monitoring blind spot** —
your monitoring runs *inside* your network and can't tell you you're unreachable from outside.
**BLD-36 · External / Synthetic Monitoring** — checks from outside, from multiple regions. Catches
DNS, BGP, cert, and CDN failures your internal monitoring is structurally blind to. Cheap. Essential.
**BLD-37 · Log Aggregation** — forensics, debugging, compliance. **Opens:** storage cost that grows
faster than your business; and logs containing secrets/PII, making your log store a breach target.
**BLD-38 · Distributed Tracing** — finds *which hop* is slow. Unlocks diagnosing gray failures.
**BLD-39 · Alerting + On-Call Rotation** — converts signal into human action. **Opens:** burnout.
**BLD-40 · Status Page** — customer trust. **Opens:** the pressure to update it *during* an incident,
and the temptation to lie on it (a real player choice with reputational consequences).
**BLD-41 · Configuration Management (Ansible/Puppet-alike)** — consistency at scale. **Opens:** the
ability to break every machine simultaneously, at machine speed. Power and danger are the same stat.
**BLD-42 · CI/CD Pipeline** — velocity. **Opens:** P-01 at scale; a compromised pipeline is a
compromise of everything (T-12).
**BLD-43 · Staging Environment** — reduces deploy defect rate. **Opens:** cost, and the illusion of
safety when staging drifts from prod (staging has 1 web node, prod has 40 — the bug only appears at
scale).
**BLD-44 · Canary / Blue-Green / Gradual Rollout** — limits blast radius of bad deploys. The single
best P-01 mitigation. **Opens:** double capacity cost during rollout; schema changes that can't be
blue-green'd.
**BLD-45 · Feature Flags / Kill Switches** — instant mitigation without a deploy. **Opens:** flag
sprawl and combinatorial states nobody tested.
**BLD-46 · Secrets Manager** — stops credentials living in git. **Opens:** a new SPOF — if the vault
is down, nothing can start.
**BLD-47 · Asset Inventory / CMDB** — reveals shadow infrastructure (T-21). Boring, unglamorous,
saves you in the audit and breach levels.
**BLD-48 · Runbooks + Postmortem Process** — lowers MTTR and *permanently* reduces recurrence of any
incident type you've written up. **Best long-term investment in the game, zero short-term payoff.**
**BLD-49 · Chaos Engineering / GameDay** — deliberately break things to find weakness. Costs a small
real risk; converts unknown failures into known ones. A player who runs gamedays should face fewer
*surprise* catastrophes and more *scheduled* ones.
**BLD-50 · Capacity Planning / Forecasting** — shows you a projection of when you run out. Prevents
the most boring and most common outage type.
**BLD-51 · Rate Limiting / Quota System** — protects you from customers and customers from each other.
**BLD-52 · Abuse Detection Pipeline** — outbound traffic anomalies, spam scoring, port-scan detection,
new-account behavioral scoring. Essential the moment you have untrusted customers.

## 4.5 Facility (the physical tower-defense layer)

**BLD-53 · Utility Feed** — a service entrance with a hard kW ceiling. Upgrading takes *months* and
involves the power company as an NPC.
**BLD-54 · Generator + Fuel Tank** — bridges a utility outage indefinitely *if* it starts and *if*
fuel keeps arriving. Fuel is a consumable with a delivery-truck logistics layer. **Opens:** monthly
test obligation, fuel polishing, emissions permits (a runtime-hours cap per year — you can be legally
forbidden from running your generator!).
**BLD-55 · UPS + Battery String** — bridges the ~10-45 seconds until the genset takes load. Batteries
have a 3-5 year lifespan and must be tested. **Opens:** a UPS in bypass mode is just an expensive
wire; a failed UPS can take down what it was protecting.
**BLD-56 · ATS (Automatic Transfer Switch)** — the piece that actually decides utility-vs-generator.
Single point of failure for the entire facility unless you buy two, and nobody buys two.
**BLD-57 · PDUs (rack) + Busway/RPP** — distribution with per-circuit capacity. Metered PDUs (see
usage) vs. switched PDUs (remotely power-cycle a hung box — a massive quality-of-life buildable).
**BLD-58 · A/B Power Feeds** — true redundancy requires dual-corded gear **and** the discipline to
actually plug the second cord into the *other* feed. Single-corded gear needs an ATS in the rack.
**BLD-59 · CRAC/CRAH Units** — cooling with N+1 or N+2 sizing. **Opens:** short-cycling, condensate
drains that clog, and the fact that they all share one chilled water loop.
**BLD-60 · Hot/Cold Aisle Containment** — massively improves efficiency; makes hot aisles genuinely
dangerous (50°C+) for staff. **Opens:** a contained hot aisle heats up *much faster* when cooling
fails, because there's no mixing to buffer it.
**BLD-61 · Chillers / Cooling Towers / Free Cooling / Adiabatic** — climate-dependent efficiency.
Free cooling works great until the heat wave (a scenario hook). Water-cooled systems introduce *water
supply* as a dependency and a drought as a threat.
**BLD-62 · Liquid Cooling (DLC / rear-door HX / immersion)** — required above ~30kW/rack. **Opens:**
leaks, coolant chemistry, a whole new maintenance discipline, and vendor lock-in.
**BLD-63 · Fire Detection (VESDA) + Suppression (inert gas / pre-action sprinkler)** — **Opens:**
H-16 acoustic drive damage; accidental discharge; and the fact that a pre-action sprinkler means
water pipes above your servers.
**BLD-64 · Raised Floor vs. Slab** — cable/air routing vs. weight limits. A rack of storage or GPUs
can exceed raised-floor load ratings, which is a genuinely real constraint nobody thinks about.
**BLD-65 · Physical Security: mantrap, badge, biometric, cameras, guard, cage locks, cabinet locks**
— **Opens:** each is a cost and a *tenant convenience* penalty. A colo with a 3-factor mantrap is
secure and annoying; tenants complain about access friction constantly.
**BLD-66 · Loading Dock + Staging/Build Room** — where gear arrives and gets prepped. A bottleneck
during any growth phase. **Opens:** unescorted delivery drivers; cardboard in the whitespace (a real
fire-code violation); and equipment sitting on the dock for weeks.
**BLD-67 · NOC / Operations Floor** — staffed monitoring. **Opens:** the "big screen with graphs
nobody is looking at" problem.
**BLD-68 · Spares Depot / Crash Kit** — on-site inventory of drives, DIMMs, PSUs, optics, cables.
Cuts MTTR from days to minutes. Ties up capital in parts you hope never to use.
**BLD-69 · Labeling & Cable Management** — the cheapest buildable with the largest effect on every
future physical operation's error rate and duration. Should decay if you keep making changes without
re-labeling. **A "cable management debt" meter is both funny and true.**
**BLD-70 · Meet-Me Room** — where carriers land. Controls how many carriers your tenants can reach;
directly drives colo desirability and cross-connect revenue.

## 4.6 People (staff as towers)

Every staff member has: **skills, capacity (hours), fatigue, knowledge (of your specific systems),
and cost.** Knowledge is the important one — a new hire with great skills is useless for 3 months.

**BLD-71 · L1 Support Tech** — handles ticket volume, resets passwords, escalates. Cheap. High churn.
**BLD-72 · L2/L3 Systems Engineer** — fixes real things. Expensive. Bus-factor risk.
**BLD-73 · Network Engineer** — the only one who can touch BGP. Extremely bus-factor-y.
**BLD-74 · DBA** — prevents the slow-query apocalypse. Often the highest-ROI hire nobody makes.
**BLD-75 · Datacenter Technician / Remote Hands** — physical actions. Either employed (fixed cost,
instant response) or contracted (per-hour, 4-hour SLA). The employed-vs-contracted decision should be
a real crossover calculation the player can get wrong.
**BLD-76 · Security Engineer** — reduces incident probability, runs the audit, does the threat
hunting. Pure insurance; produces nothing visible until the day it matters.
**BLD-77 · Abuse/Compliance Desk** — answers abuse@, handles takedowns and law enforcement. Required
above a certain customer count or heat builds.
**BLD-78 · Sales / Account Management** — converts leads, saves at-risk accounts, upsells.
**BLD-79 · Automation Engineer** — converts recurring toil into a one-time cost. Should let the
player literally delete a recurring upkeep drain. The best long-run investment.
**BLD-80 · On-Call Rotation Depth** — 1 person = burnout; 4 people = sustainable; follow-the-sun =
expensive and excellent. Directly modifies MTTR and error rates at 3am.
**BLD-81 · Documentation Culture** — a slow, cheap, passive buildable that reduces the damage of
staff turnover and reduces P-08 runbook rot.

## 4.7 Contracts and intangibles (non-physical towers)

**BLD-82 · SLA Tiers** — what you promise. Higher promises win customers and cost you on credits.
**BLD-83 · Cyber Insurance** — converts catastrophic loss into a premium + deductible + a mountain of
required controls.
**BLD-84 · Vendor Support Contract (4-hour on-site, NBD, or none)** — a per-asset cost that converts
hardware failure from a crisis into a ticket. Letting warranties lapse to save money is a classic and
very tempting trap.
**BLD-85 · Legal / Terms of Service + AUP** — your right to suspend an abuser. Without it, you can't.
**BLD-86 · Compliance Certification (SOC 2, PCI DSS, HIPAA BAA, ISO 27001, FedRAMP)** — unlocks
customer classes; costs money annually and imposes permanent process overhead.
**BLD-87 · Upstream Abuse Relationship** — being on good terms with your transit providers'
NOC/abuse teams materially changes how fast a DDoS gets scrubbed and how much rope you get.
**BLD-88 · Escrow / Business Continuity Agreement** — what happens to customer data if you go under.
Enterprise customers demand it.

---

# 5. Unlocks and Discovery

## 5.1 The core discovery principle: **you unlock things by surviving them**

The most authentic progression model for this game is **incident-driven learning**. In real hosting,
nobody builds a thing until it has hurt them. Mirror that:

- Suffer a cache stampede → unlock **request coalescing** and **stale-while-revalidate**.
- Suffer a split-brain → unlock **fencing/STONITH** and **quorum witness**.
- Get your IP blocklisted → unlock **outbound rate limiting** and **dedicated IP pools**.
- Have a cert expire → unlock **ACME automation** and the **expiry register**.
- Have a rebuild fail during degraded RAID → unlock **RAID6**, **hot spares**, and **batch diversity**.
- Get locked out by a firewall rule → unlock **commit-confirm** (a config change that auto-reverts in
  10 minutes unless you confirm — a real network-engineering feature and a *wonderful* game verb).
- Discover a gray failure the hard way → unlock **synthetic monitoring** and **percentile alerting**.
- Lose data because a backup never ran → unlock **backup verification** and **restore drills**.
- Get hit by your own retry storm → unlock **jitter & exponential backoff**.
- Lose a whole rack to a single PDU → unlock **A/B feed auditing** and the **power-path visualizer**.

This is a **postmortem-driven tech tree.** Completing a postmortem for an incident type is what
actually unlocks its counter. It makes the loop: fail → understand → build → never fail that way
again. That's literally the job.

## 5.2 Tech tree branches

### Branch: Availability
`Monitoring` → `Alerting` → `On-Call` → `Runbooks` → `Postmortems` → `Error Budgets` → `Chaos
Engineering` → `Multi-Region Active/Active`
Gate: you cannot build Error Budgets until you have percentile-based SLOs, which require distributed
tracing, which require you to have suffered a gray failure.

### Branch: Performance
`Static Caching` → `Reverse Proxy` → `Object Cache` → `Cache Coalescing` → `CDN` → `Edge Compute` →
`Anycast`
Parallel: `Query Log` → `Index Analysis` → `Connection Pooling` → `Read Replicas` → `Sharding`

### Branch: Security
`Patching Cadence` → `Firewall` → `Bastion/VPN` → `MFA` → `Least Privilege` → `Segmentation` →
`Zero Trust` → `Threat Hunting`
Parallel: `Abuse Desk` → `Egress Filtering` → `Behavioral Detection` → `SOC`

### Branch: Resilience / Data
`Backups` → `Offsite Copy` → `Restore Testing` → `Immutable/WORM` → `Air Gap` → `Cross-Region DR` →
`Active/Active with RPO=0`
Key gate: **Restore Testing is required before anything downstream.** Untested backups block the tree,
which is exactly right.

### Branch: Facility
`Rack & Stack` → `Metered PDU` → `Switched PDU` → `UPS` → `Generator` → `N+1 Cooling` → `Containment`
→ `2N Electrical` → `Liquid Cooling` → `Concurrently Maintainable (Tier III equivalent)` → `Fault
Tolerant (Tier IV equivalent)`
Each tier upgrade unlocks a *customer class* that requires it contractually.

### Branch: Network
`Single Uplink` → `Dual Uplink` → `BGP + own ASN + IP space` → `RPKI` → `IX Peering` → `Private
Network Interconnects` → `Anycast` → `Global Backbone (your own long-haul)`
**Owning your own ASN and IP space is a genuine milestone** — it's the moment you stop being a
customer of the internet and start being *part* of it. Should feel like a huge unlock, and it opens
BGP threats as the price.

### Branch: Automation
`Shell Scripts` → `Config Management` → `Immutable Images` → `CI/CD` → `Infrastructure as Code` →
`Self-Healing` → `Autoscaling`
Each step converts *toil* (recurring staff-hour drain) into *capex + risk*.

### Branch: Business
`Terms of Service` → `Billing System` → `Metered Billing` → `Self-Service Portal` → `API` →
`Reseller Program` → `Marketplace`
Parallel compliance ladder: `Security Questionnaire Answers` → `Pen Test` → `SOC 2 Type I` → `Type II`
→ `PCI DSS` → `HIPAA` → `FedRAMP`, each unlocking bigger, slower, richer customers.

## 5.3 Line-of-business unlocks (changing what kind of company you are)

These are the big pivots. Each should require prerequisite infrastructure and unlock a whole new
economy, threat mix, and visual layer.

- **Shared hosting → VPS**: requires virtualization + provisioning automation + metered billing.
- **VPS → Dedicated/Bare metal**: requires PXE provisioning, spares depot, IPMI fleet management.
- **Anything → Colo landlord**: requires owning (or master-leasing) a facility, meet-me room,
  physical security, and a very different sales motion. The pivot everyone makes when they realize
  selling power and space is less work than selling servers.
- **Web hosting → Email hosting**: requires IP reputation management, abuse desk, deliverability
  tooling. The trap: it looks adjacent, it's a completely different business.
- **Web → CDN**: requires multiple POPs, anycast, peering. Leans entirely on the cache-hit economy.
- **Anything → GPU/AI**: requires a power/cooling retrofit, a capital raise, and supply-chain
  relationships. Highest-risk pivot in the game — enormous capex, and the market could crater.
- **Storage → Backup/DR as a service**: requires immutability, restore tooling, and a very different
  SLA vocabulary (RPO/RTO instead of uptime %).
- **Hosting → Managed services**: you stop selling infrastructure and start selling *labor*. Margins
  improve, but headcount becomes the constraint instead of hardware.
- **Any → Bulletproof**: a one-way door. High revenue, and it permanently damages your ability to get
  clean transit, payment processing, and enterprise customers. **Make it genuinely tempting and
  genuinely regrettable.**
- **Any → Wholesale/Build-to-suit**: you stop having thousands of customers and have four, each
  enormous. Entire risk profile inverts from "abuse management" to "concentration risk."
- **Regional → Multi-region → Global**: each step multiplies coordination cost.

## 5.4 Discovery mechanics (finding out things you didn't know)

**D-01 · The Audit Sweep** — spend staff-hours to scan your own estate; reveals shadow infrastructure,
unpatched hosts, expired things, undocumented cables, and forgotten customers. Should always find
something embarrassing. Should be repeatable and always worth doing.

**D-02 · Reading the Logs** — an actively player-triggered investigation that reveals *why* something
happened. Only possible if you built log aggregation. The information is the reward.

**D-03 · The Postmortem** — after each incident, spend time to produce a document. Yields: a permanent
reduction in recurrence, an unlock, and a reputational bonus if published publicly (a real and
underrated trust-building move).

**D-04 · Vendor Advisory Feed** — subscribe to CVE feeds, vendor bulletins, and hardware advisories.
Gives you *advance warning* of threats. Turns some surprise attacks into scheduled patch work.
**The best defensive buildable in the game is information arriving early.**

**D-05 · Threat Hunting** — proactively search for compromise with no alert prompting you. Costs
expensive senior time. Sometimes finds nothing (and that's a valid, frustrating, realistic outcome).
Sometimes finds a two-year-old backdoor.

**D-06 · The Depth Test** — deliberately pull a cable / kill a node / fail a feed to see what
*actually* happens versus what the diagram says. Reveals hidden dependencies (the correlated-failure
class). The single best way to discover that your A/B feeds share a PDU.

**D-07 · Competitor Intel** — scan competitor IP space, read their status page, notice their outages.
Mildly cynical, entirely realistic, unlocks poaching opportunities.

**D-08 · Customer Conversations** — talking to customers reveals the roadmap. A support ticket that
says "can you do X?" repeated 20 times is a product unlock.

**D-09 · Conference / Community** — sending an engineer to a conference costs money and time and
returns: a new technique unlock, a peering contact, and a hiring lead.

**D-10 · Hardware Autopsy** — RMA a failed part and analyze it. Reveals whether the failure was
random or a **batch defect**, which changes your entire remediation strategy (replace one drive vs.
replace forty).

**D-11 · The Inherited Estate** — in acquisition scenarios, an entire discovery minigame: what did we
just buy? Map the network, find the undocumented, identify the load-bearing hack.

**D-12 · Traffic Analysis** — inspecting your own flows reveals: which customer is the bandwidth hog,
what percentage is bots, where your visitors actually come from, and which of your machines is
talking to a country you have no business talking to.

## 5.5 Milestone unlocks (moments that should feel big)

- First customer who pays more than $1,000/mo.
- First time you survive an incident with **zero customer-visible impact** — unlock the "invisible
  save" achievement track and a reputation bonus you can't even show anyone.
- **Getting your own ASN + /24.** You are now on the internet, not just attached to it.
- First successful failover that nobody noticed.
- First tested restore from an air-gapped copy.
- First 100% month on your SLA.
- First time you say no to a customer for the right reason (evicting an abuser at revenue cost).
- Opening a second facility.
- Hiring someone who is better at your job than you are (unlocks delegation; reduces your own
  personal action-point cost).
- The first postmortem you publish publicly.
- Retiring the last machine from your original generation of hardware.

---

# 6. Economy, Money, and Scoring

## 6.1 The fundamental hosting economic truth to model

**Hosting is a capacity business with a utilization problem.** You buy capacity in lumps (a server, a
rack, a circuit, a megawatt), pay for it whether it's used or not, and sell it in slices. Profit is
almost entirely a function of **utilization × price − (capex amortization + power + bandwidth +
labor)**. Everything interesting in the economy flows from that.

Corollary that should drive the whole game: **idle capacity is a slow bleed, and full capacity is a
cliff.** The player should live permanently in the uncomfortable band between the two.

## 6.2 Revenue streams (per hosting type)

**R-01 · MRR (monthly recurring)** — the backbone. Predictable, slow to grow, slow to lose.
**R-02 · Setup / provisioning fees** — one-time, good cash flow, a barrier to signup.
**R-03 · Metered usage (bandwidth, storage, requests, GPU-hours, tokens)** — scales with success,
unpredictable, occasionally produces a bill so large the customer disputes it.
**R-04 · Overage charges** — high margin, high resentment. Customers *hate* surprise bills more than
they hate high prices.
**R-05 · Cross-connects (colo)** — the best product in hosting: ~$0 marginal cost, $300/mo forever.
**R-06 · Power (colo)** — you buy at wholesale, sell at retail, per kW committed whether used or not.
**Selling committed power that isn't consumed is nearly pure profit** — and it's also why colo
providers oversubscribe power and occasionally trip.
**R-07 · Remote hands** — billed hourly, in 15-minute increments, at a rate that makes it a profit
center *and* an incentive for tenants to do things themselves badly.
**R-08 · Managed services / support plans** — labor markup.
**R-09 · Professional services / migrations** — one-time, high margin, consumes senior time.
**R-10 · Licensing resale (cPanel, Plesk, Windows, VMware)** — pass-through with markup; also a
vendor-price-shock exposure (see B-06).
**R-11 · Backup/DR retainer** — customers pay for capacity they hope never to use. Beautiful margins
until the day everyone needs it at once.
**R-12 · Spot/preemptible sales** — monetizes idle GPU/compute at a discount; reclaimable.
**R-13 · Domain registration / SSL resale** — small, sticky, high-frequency touchpoint.
**R-14 · IPv4 address leasing** — a genuinely lucrative modern revenue line; your legacy /16 is a
literal appreciating asset.
**R-15 · Peering-driven cost avoidance** — not revenue, but functionally identical: every bit you
peer is a bit you don't pay transit for.

## 6.3 Cost structure

**Capex (lumpy, amortized):** servers, switches, generators, UPS, cooling, the building, the fiber.
Model **depreciation over 3-5 years** and let the player see the tension between "buy now, own it" and
"lease/cloud it, pay forever."

**Opex (relentless, monthly):**
- **Power** — often the #1 line item. Split into IT load + cooling load, tracked by **PUE**. Improving
  PUE from 1.8 to 1.3 is a genuine strategic goal with a big money number attached.
- **Bandwidth** — sold on **95th percentile** billing, which deserves to be a real mechanic: your bill
  is based on your 95th-percentile 5-minute sample over the month, meaning **you get ~36 hours of
  free spikes per month.** A player who understands this can schedule backups and batch jobs into a
  spike they're not paying for. That's a real trick and an excellent puzzle.
- **Space/lease** — per cabinet or per square foot, with escalators.
- **Labor** — salaries, on-call stipends, contractor hours, recruiting costs, and the hidden cost of
  turnover.
- **Licensing/software** — per-socket, per-core, per-account. Vendor price shocks hit here.
- **Support contracts / warranties** — per-asset.
- **Transit commits** — you pay the commit whether you use it or not.
- **Insurance, legal, compliance audits** — annual lumps.
- **Bad debt / chargebacks / fraud losses.**
- **Toil** — a *staff-hour* currency drained by every unautomated recurring task. The real hidden cost
  of every shortcut.

## 6.4 Pricing mechanics the player manipulates

**E-01 · Price per unit** — the blunt instrument. Lowering price raises volume and lowers customer
quality (attracts C-01, C-07, C-14).
**E-02 · Oversubscription ratio** — the central profit dial. 1:1 is honest and unprofitable; 20:1 is
lucrative and one bad day from disaster. **Should be a slider the player can move mid-level**, with
consequences that appear hours later.
**E-03 · Tiering** — Bronze/Silver/Gold. Charging for *guarantees* (dedicated resources, priority
support, higher SLA) rather than for resources. The highest-margin move in hosting.
**E-04 · Commit discounts** — a customer prepays for 12/36 months in exchange for a lower rate. Cash
now, locked-in revenue, and an inability to reprice when your costs rise.
**E-05 · Grandfathering** — old customers on old prices. Sticky loyalty vs. margin erosion. Raising
prices on legacy customers triggers a churn event; not raising them slowly starves you.
**E-06 · Metered vs. unmetered** — unmetered is a marketing weapon that guarantees abuse. "Unlimited"
should be an option the player can offer and will regret.
**E-07 · SLA credits** — what you pay when you break a promise. Note the realistic detail that credits
are usually capped at the monthly fee, meaning **the SLA never actually compensates the customer's
real loss** — which is why enterprise customers demand more and why reputation damage exceeds the
credit cost by 10x. Model that gap.
**E-08 · Free tier / trial** — CAC reduction vs. abuse exposure.
**E-09 · Setup fee waivers, promo pricing, annual discounts** — levers with churn-timing effects.
**E-10 · The Renewal Increase** — colo levels: a 3-5% annual escalator baked into contracts.

## 6.5 Cash flow (should be a separate, lethal system from profitability)

**Most hosting companies that die, die of cash flow, not of unprofitability.** The classic killer:
you buy $200k of hardware today to serve a customer who pays $8k/mo starting in 90 days.

Mechanics:
- **Cash on hand** is a hard constraint, separate from P&L. Running out = game over even while
  profitable.
- **Net terms** — enterprise customers pay in 30/60/90 days. Winning a big contract can *worsen*
  your cash position for a quarter.
- **Capex lead time** — order → deposit → 8-week lead → delivery → install → revenue. Money out long
  before money in.
- **Financing options**: equipment leasing (expensive, preserves cash), a line of credit (interest,
  covenants), venture capital (dilution, growth pressure, and a board that wants you to pivot to AI),
  bootstrapping (slow, safe), or **customer prepayment** (the cheapest capital in the world —
  annual-prepay discounts are literally a financing instrument).
- **Seasonality** — Q4 e-commerce, back-to-school for edu, fiscal-year-end for government, summer for
  game hosting.
- **The Depreciation vs. Cash trap** — your P&L looks great while your bank account empties, because
  depreciation is non-cash and your capex was.

## 6.6 Money-affecting events tied to specific game objects

| Event | Money effect | Ties to |
|---|---|---|
| Visitor served successfully | + micro-revenue or + satisfaction | Visitor system |
| Visitor bounces | − opportunity, + churn pressure | Latency budget |
| Outage minute | − SLA credits, − reputation, + support cost | Incident system |
| DDoS absorbed | − scrubbing fee or − transit overage | Network |
| Customer churns | − MRR permanently, − LTV | Grievance meter |
| New customer signed | + MRR, − onboarding labor, + capacity used | Sales |
| Disk failure | − part cost, − tech hours, − risk window | Hardware |
| Generator test | − fuel + hours, + reliability confidence | Facility |
| Blocklist listing | − deliverability, − all email customers' value | Email level |
| Abuse complaint ignored | + heat, → upstream termination risk | Bulletproof level |
| Audit finding | − remediation cost, − contract at risk | Compliance |
| Idle GPU-hour | − pure loss | GPU level |
| Cross-connect installed | + recurring, − 1 tech hour | Colo level |
| Peering session turned up | − transit cost, + latency improvement | Network |
| Automation built | − one-time, − recurring toil forever | Automation |
| Engineer quits | − knowledge, − 3 months of recruiting + ramp | Staff |

## 6.7 Scoring and end-of-level rating

Rather than a single score, rate on **five axes** with a letter grade each, and a summary "postmortem
report card":

1. **Availability** — measured in nines, but shown honestly: "99.5% = 3.6 hours of downtime this
   month." Weighted by *which customers* were affected, because a whale's downtime hurts more.
2. **Profitability** — net margin and cash position at close.
3. **Growth** — net-new MRR, customer count, logo quality.
4. **Resilience** — a hidden-until-scored measure of your *unexercised* safety margin: untested
   backups, single points of failure, expired warranties, staff bus factor, technical debt. **You can
   win every visible metric and get an F here**, which sets up the next level's difficulty. Brutal
   and accurate.
5. **Integrity / Reputation** — did you tell the truth on your status page, did you pay credits
   without being asked, did you evict the abuser, did you honor your commitments.

**Star/medal conditions (per level):**
- *Zero-Touch*: complete the level without a manual emergency intervention.
- *Clean Sheet*: no customer-visible downtime.
- *Frugal*: hit objectives under a capex cap.
- *Honest Broker*: never lied on the status page, never hid an incident.
- *Antifragile*: finish with higher resilience than you started.
- *No Heroes*: no staff member exceeded fatigue threshold. (A pointed anti-crunch achievement.)
- *Restore Verified*: proved a restore actually worked.
- *The Boring Win*: nothing happened, everything worked, you made money. The highest honor in ops.

**Lose conditions:**
- Cash reaches zero.
- Reputation floor breached (no new customers, mass churn cascade).
- A catastrophic data-loss event with no recoverable copy.
- Upstream/transit terminated (bulletproof levels) — you are literally disconnected.
- Facility condemned (fire, flood, code violation).
- Regulator shuts you down / certification revoked.
- **Total staff burnout** — everyone quits; you cannot operate.

## 6.8 Meta-economy across the campaign

- **Technical debt carries forward.** Shortcuts in level 3 become failure probability in level 6.
- **Reputation carries forward** and gates which customers even talk to you.
- **Hardware carries forward and ages.** Machines bought in an early level are still there in a later
  one, out of warranty, running an old OS, and someone's production database is on them.
- **Institutional knowledge carries forward** in the form of runbooks and retained staff, and is lost
  on turnover.
- **Relationships carry forward**: carriers, peers, vendors, and the customers you treated well.

---

# 7. Core Gameplay Mechanics

## 7.1 The two-directional core, expressed as one system

The elegant unification: **there is exactly one path network, and both visitors and threats traverse
it.** Every buildable on the path is a filter with two effects: it stops some fraction of threats and
it costs some amount of visitor patience/latency/conversion. The entire game is tuning that stack.

That means "tower placement" is really **topology design**, and "upgrading a tower" is really
**tuning a tradeoff**. This is far more faithful to real ops than shooting arrows at goblins.

## 7.2 Connection / wiring interaction design (the key UX question)

I'd build **three layered interaction modes**, because real infrastructure has three distinct planes
and conflating them is what makes network diagrams unreadable.

**M-01 · Rack View (physical)** — a front/rear elevation of a cabinet. You drag a server into a U
slot. Rear view shows **ports**. You drag a cable from a NIC port to a switch port. Cable color is
chosen by the player (and color-coding is a real, mechanically rewarded discipline: color-coded,
labeled cabling reduces the error rate of every future physical operation). Power cords drag to PDU
outlets, and the PDU shows a live amperage bar that **turns amber and then red as you approach the
circuit limit** — so you *see* yourself about to trip a breaker.

**M-02 · Logical/Service View (the "cable drag" the brief asks about)** — the main play surface.
Services are nodes. To connect a web server to a database:
  - **Drag from the web server's "needs" socket to the DB's "provides" socket.** The web node has
    typed sockets (`http-in`, `db-out`, `cache-out`, `storage-out`, `log-out`), and the DB exposes
    `db-in`. Incompatible sockets refuse to connect and show why.
  - The moment you drop the cable, a **connection object** is created with its own properties:
    latency, bandwidth, encryption on/off, auth method, and — crucially — a **firewall rule**. That
    connection is now a first-class thing you can inspect, upgrade, monitor, and that can *fail*.
  - **This is the important design idea: the connection is a game object, not a line.** Gray failures,
    latency, TLS, credentials, and firewall rules all live on the connection. Most real outages live
    on the connection too.
  - Connections render as **animated flow**: packets/requests visibly moving, thickness = throughput,
    color = health, dashes = encrypted, a stutter = packet loss.

**M-03 · Policy/Overlay View** — toggleable overlays that recolor the whole map by one dimension:
  - **Power overlay**: every object tinted by which feed/PDU/breaker it's on. **Instantly reveals
    that your "redundant" pair is on one circuit.** This single overlay is worth a whole mechanic.
  - **Failure-domain overlay**: tint by rack, by row, by switch, by availability zone.
  - **Trust overlay**: what can talk to what. Reveals over-permissive firewall rules.
  - **Heat overlay**: thermal map of the floor.
  - **Latency overlay**: heat map of where time is being spent on the visitor path.
  - **Blast-radius mode**: click any object and the game highlights *everything that dies if this
    dies.* The best teaching tool possible, and a genuinely great game verb.
  - **Money overlay**: tint by cost and by revenue attribution.

**M-04 · "What Breaks If I Pull This?" (the Depth Test verb)** — hold a modifier and hover any
component to preview its blast radius; click to actually test it in a controlled window. Converts an
unknown dependency into a known one.

**M-05 · Auto-layout with manual override** — as the estate grows, hand-placed spaghetti becomes
unreadable. Give a "tidy" button that arranges by tier, plus the ability to **collapse a group into a
single meta-node** ("Web Tier ×40") that can be expanded. Readability at scale is the #1 risk for
this design and grouping is the answer.

## 7.3 Pathing

- Visitors enter at **edges** (geographic ingress points) and must reach a **revenue sink** (a
  served request) and, often, *exit* again (a response path, which matters for asymmetric routing
  and for egress bandwidth costs).
- **Multiple valid paths** exist once you build redundancy, and routing is determined by rules you
  set: round-robin, least-connections, latency-based, weighted, sticky sessions. Each has a failure
  mode the player will discover (least-connections sends everything to the broken-and-therefore-fast
  node — a beautiful real-world gotcha).
- **Threats often choose the same paths**, but some enter *out of band*: an insider spawns inside, a
  supply-chain compromise spawns at a component you built, a physical intruder enters at the loading
  dock, and a power failure enters from the utility feed — **a totally separate "path" up the
  electrical tree.**
- **DNS as the first hop** — before anything touches your network, it resolves. Which means your DNS
  is the actual front door of the entire path, and in the DNS level it's the whole map.

## 7.4 Resource systems (multiple, deliberately non-fungible)

1. **Cash** — buys things.
2. **Power (kW)** — hard-capped per circuit/rack/room/facility, hierarchical.
3. **Cooling (kW of heat removal)** — must ≥ power, positionally distributed.
4. **Space (U / sq ft / weight)** — physical.
5. **Bandwidth (Gbps + 95th percentile)** — shared, burstable, billed weirdly.
6. **IP addresses** — genuinely scarce in v4, a real constraint and a tradeable asset.
7. **Staff-hours** — the resource that gates *every action*. Making change management cost staff-hours
   is what makes automation feel great.
8. **Attention / on-call capacity** — a separate, smaller pool for incident response specifically.
9. **Reputation** — slow to gain, fast to lose, gates customer classes.
10. **Trust/Knowledge** — accumulated understanding of your own estate; lost on turnover, gained via
    documentation and tenure. **Low knowledge should literally make the UI vaguer** — undocumented
    machines display with "?" labels.
11. **Time/lead time** — you cannot buy your way out of an 8-week hardware lead.

## 7.5 The change-management mechanic (the heart of the "self-inflicted" loop)

Every modification to a running system is a **Change**, with:
- A **risk score** (reduced by: staging, canary, review, change window, rollback plan, runbook).
- A **window** (business hours = faster but higher blast radius; maintenance window = safer but you
  must schedule it, notify customers, and someone has to be awake at 3am — fatigue cost).
- A **rollback plan** — optional, and the game should punish its absence *specifically*.
- A **freeze period** — during Black Friday / an audit / a launch, changes are blocked or penalized.
- **Commit-confirm** for network changes: a 10-minute auto-revert timer. If you lock yourself out,
  it saves you. A wonderful, real, tense mechanic — you make the change and *watch a countdown*
  while verifying you still have access.

## 7.6 Incident response loop (the real-time layer)

When something breaks, the game enters an **Incident** state:
1. **Detect** — only if you have monitoring for it. Undetected incidents run silently, costing money.
2. **Alert** — page someone. Response time = f(on-call depth, fatigue, alert fatigue, hour of day).
3. **Triage** — the map shows symptoms, not causes. You must *investigate* (each investigation action
   costs time and narrows the possibility space). **The fog-of-war here is the best part**: build more
   observability and the fog is thinner.
4. **Mitigate** — restore service (failover, restart, shed load, roll back, blackhole) — often
   *before* you understand the cause. Real ops prioritizes mitigation over diagnosis; the game should
   reward that.
5. **Communicate** — update the status page, notify customers. Honest + fast = reputation preserved.
   Silent = reputation damage even if you fix it quickly. **Communication is a mechanic, not flavor.**
6. **Resolve + Postmortem** — unlock the counter, reduce recurrence.

Add a **Severity** classification the player chooses: over-classify and you burn your team out on
false alarms; under-classify and you respond too slowly to something real.

## 7.7 Time and pacing

- **Variable clock**: normal operation runs fast (days per minute); incidents drop to near-real-time.
  This naturally creates the ops rhythm of long boredom punctuated by terror.
- **Pause-and-plan** is essential for the building/topology phase.
- **A "night" phase** where your staff are asleep and response times double — making automation and
  self-healing feel disproportionately valuable.
- **Scheduled events calendar**: maintenance windows, generator tests, audits, contract renewals,
  certificate expiries, patch Tuesdays, customer launches. The player plans against a visible calendar
  and events collide.

## 7.8 Degradation, not destruction (the anti-tower-defense principle)

Nothing should have "HP that reaches zero and the thing explodes." Instead:
- **Saturation** — a component at 100% doesn't die, it queues, and queuing causes latency, and latency
  causes bounces. Degradation before failure.
- **Brownout** — the player can deliberately degrade (turn off image optimization, serve stale cache,
  disable search) to preserve core function. **Graceful degradation as an active ability** is
  fantastic gameplay and exactly what real ops does.
- **Load shedding** — deliberately drop the least valuable traffic to save the most valuable.
  Requires you to have *classified* your traffic in advance.
- **Partial failure / gray failure** — components that are 40% working, which is worse than 0%
  because health checks say they're fine. Should require deliberate detection investment.
- **Cascading failure** — the real killer. Node A dies, its load moves to B and C, which now exceed
  capacity, which die, which move load to D... **The counter is not more capacity; it's circuit
  breakers, backpressure, and load shedding.** Make the player learn this the hard way once.

## 7.9 Failure states worth explicitly modeling

- **Split-brain** (two authorities, divergent data).
- **Deadlock / lock contention** (everything alive, nothing progressing).
- **Queue collapse** (see V-03).
- **Metastable failure** — the system stays broken *after* the trigger is removed, because retry load
  now sustains the failure. Requires you to actively shed load to escape. Extremely real and almost
  never modeled in games.
- **Correlated failure** (shared hidden dependency).
- **Silent data corruption** (the failure with no alarm).
- **Configuration drift** (machines that are supposed to be identical and aren't).
- **Capacity cliff** (fine, fine, fine, catastrophic).

## 7.10 Upgrade design

Upgrades should be **sidegrades with tradeoffs** far more often than pure improvements:
- More RAM → more cache → fewer DB hits, but a bigger blast radius per node loss.
- Bigger drives → more density → longer rebuild times → wider risk window.
- More cores → more density → more tenants per box → worse noisy-neighbor.
- Faster NICs → more throughput → the bottleneck moves to CPU and you must discover that.
- Redundancy → higher availability → new HA-specific failure classes.
- Automation → less toil → catastrophes now happen at machine speed.
- Security control → lower risk → higher latency, more false positives, more staff-hours.

## 7.11 Small mechanics worth stealing from real life

- **The 2am Multiplier** — every action taken during a night incident has a higher error rate.
- **The Second Failure Window** — during any degraded state (RAID rebuild, one-of-two LB alive,
  generator running), the game explicitly shows a "you cannot survive another failure right now" bar.
  Tension without an enemy.
- **The Change Freeze Bank** — changes you couldn't make during a freeze pile up and all deploy at
  once afterward, which is exactly why post-freeze outages are a real phenomenon.
- **Toil accumulation** — repeated manual tasks visibly accumulate as a recurring staff-hour drain
  until automated. The player *sees* their team drowning.
- **The Ticket Queue** — a background pressure system. Left unattended, tickets age, customers get
  angry, and the grievance meter ticks. Hiring L1 support is the fix; so is fixing the underlying
  problem that generates the tickets, which is better and slower.
- **"It's always DNS"** — a small running gag with real teeth: a fixed, nonzero chance that any
  mysterious failure's root cause is DNS. Players will start checking it first. That's a learned
  instinct and it's correct.
- **The Vendor Ticket** — escalating with a hardware/software vendor is its own timer-based minigame:
  collect logs, escalate, get a useless first response, escalate again, eventually reach an engineer
  who knows. Buying premium support shortens it.
- **Grandfathered Hack** — an old workaround still load-bearing years later. Removing it is a project;
  leaving it is a risk multiplier.

---

# 8. Visuals and Presentation

Grounding principle: **the real aesthetic of a datacenter is information density plus blinking
lights.** The visual language should borrow from the tools sysadmins actually stare at — rack
elevations, Grafana dashboards, network topology maps, PDU amperage readouts, `htop`, and the
physical reality of cable trays and LED status panels.

## 8.1 Overall art direction

**Vis-01 · "Clean Isometric Industrial"** — the main mode. Isometric floor tiles, racks as chunky
readable boxes, cable trays overhead, cold aisle in blue-white light, hot aisle in amber. Readable
silhouettes over realism. Think a cross between a factory-builder and a network diagram.

**Vis-02 · The Dual Register** — every scene is drawable in two registers, switchable:
 - **Physical**: actual racks, actual cables, actual blinking drive lights, floor tiles.
 - **Logical**: a clean topology diagram — nodes and edges, tiers as rows, the flow animated.
 The player flips between them constantly, and each reveals problems the other hides. (Real engineers
 do exactly this, all day, in two browser tabs.)

**Vis-03 · Status-LED language** — the entire game's health encoding reuses the vocabulary of actual
equipment: solid green (healthy), blinking green (activity), solid amber (degraded/predictive
failure), blinking amber (attention), solid red (failed), blinking red (critical), and **off**
(which is the scariest one, because "off" means you don't know). Colorblind-safe by pairing each
with a distinct blink rhythm and a glyph.

**Vis-04 · Everything blinks at the right rate** — drive activity LEDs stutter with real I/O, NIC
lights flicker with packets, fan speed visibly ramps with heat, PDU digits tick with amperage.
**Ambient animation IS the telemetry.** A veteran player should be able to glance at a rack and know
something's wrong before any alert fires, purely from rhythm.

## 8.2 What infrastructure looks like

**Vis-05 · Servers by shape** — 1U pizza boxes (thin, many), 2U (with visible drive bays), 4U storage
(a wall of drive carriers), blade chassis (a grid of slots), GPU node (deep, loud, glowing, with
visible finned heatsinks or coolant lines). Form factor telegraphs function at a glance.

**Vis-06 · Racks fill visibly and get messy** — an empty rack is clean rails. As you add gear, cables
accumulate. **Cable management debt is rendered literally**: a well-managed rack has neat vertical
bundles and velcro; a neglected one grows a spaghetti nest that physically obscures the equipment
behind it, making it *harder for the player to click on things*. The messiness is a gameplay penalty
expressed as a rendering penalty. I love this and it's completely true to life.

**Vis-07 · Labels** — a labeled port has a tiny readable tag; unlabeled ports show a "?" The game
should let you zoom in and read the labels. In a crisis, labeled infrastructure is *literally faster
to interact with* because you can find the right thing.

**Vis-08 · The cable tray** — overhead runs, color-coded by function (yellow = fiber, blue = copper
data, red = crossover/legacy, black = power, orange = OM2 legacy fiber, aqua = OM3/OM4). When a
player standardizes on colors, the map becomes legible. When they don't, it's a mess. Color discipline
as visual reward.

**Vis-09 · The power tree as a visible circulatory system** — utility → ATS → UPS → PDU → RPP → rack
PDU → outlet. Rendered as a glowing branching structure in the power overlay, with **current flowing
as animated particles** and thickness = capacity. Amperage bars fill toward a red line. When a
breaker trips, you *see* the branch go dark, and you see exactly what was downstream of it. This is
the single most valuable visualization in the game.

**Vis-10 · Airflow** — in the thermal overlay, cold air flows blue from perforated tiles into cold
aisles, gets pulled through racks, and exits hot and orange. Bad layouts produce visible
**recirculation eddies** (hot air looping back to intakes) that the player can literally see and
fix by adding blanking panels. Blanking panels — the cheapest, dorkiest, most effective datacenter
improvement in existence — should be a satisfying little visual click-to-place item.

**Vis-11 · The heat bloom** — a cooling failure renders as an expanding orange gradient across floor
tiles with a temperature number, creeping toward a red threshold. Machines inside it show throttling
(their clock-speed readout drops, their performance bar shrinks). It's a slow, spreading, terrifying
AoE and it reads instantly.

**Vis-12 · The facility exterior** — a small side-view of the building: the generator yard with a fuel
tank that has a visible level gauge, the chiller plant, the utility transformer, the meet-me room, the
loading dock with pallets. Weather happens here. A truck arriving with fuel is a visible, reassuring
event.

## 8.3 What visitors look like

**Vis-13 · Visitor as a data-shaped mote** — small glowing packets traveling the connection lines.
Their color = type (green human, blue API, grey bot, gold high-value customer), their size = payload
weight, their **trailing tail length = remaining patience** (a shortening tail is an impending
bounce). When they're served, they flash and emit a tiny coin. When they bounce, they turn grey,
stall, and fade with a small down-tick sound.

**Vis-14 · Per-type visitor sprites**:
 - **Page load** — a tiny document icon.
 - **Game player** — a small avatar with a **ping number floating above them**, color-coded. They
   visibly rubber-band when latency spikes. Iconic and instantly legible.
 - **DNS query** — a swarm of nearly-invisible specks, so dense they render as a *stream*, not units.
 - **Backup job** — a big slow freight-train sprite that occupies the link for a long time and has a
   progress bar. Watching one *fail at 94%* is the level's emotional core.
 - **Inference request** — a glowing prompt bubble that queues visibly at the GPU and emits tokens as
   a little stream while being served.
 - **Training job** — an enormous parked sprite sitting on 8 GPUs with a day-counter and a
   **checkpoint pip** every N hours. If it dies, you see it rewind to the last pip.
 - **SIP call** — a persistent thin line that must remain unbroken; jitter renders as a wobble in the
   line, packet loss as visible gaps, and one-way audio as an arrow that only points one direction.
 - **Colo tenant tour** — an actual little person walking your floor with a clipboard, looking at
   things, with a visible impression meter.
 - **Modem call (dial-up level)** — a phone-line channel lighting up on a rack of modem cards, with
   the handshake screech.

**Vis-15 · The queue made visible** — when capacity is exceeded, visitors *stack up* in a visible line
in front of the saturated component, and the line's length is your queue depth. Watching a line form
is a far better alert than a number.

## 8.4 What threats look like

**Vis-16 · Volumetric DDoS** — not individual enemies: a **flood, rendered as a rising tide** at the
map edge that fills your uplink pipe. The pipe is drawn as an actual pipe with a fill level. When it
saturates, legitimate visitors *visibly can't get in* — they pile up outside. The visual
communicates the crucial truth that your servers are fine and irrelevant.

**Vis-17 · L7 DDoS** — units that look *exactly* like real visitors until a detection tower reveals
them, at which point they flip to a red-outlined silhouette. Before detection, the player sees a
traffic graph that's suspiciously high and has to decide. Perfect fog-of-war visual.

**Vis-18 · Slowloris** — units that arrive, sit down on a connection, and just... stay. Rendered as
slumped, grey, motionless figures occupying slots. Visually infuriating in the right way.

**Vis-19 · Brute force** — a persistent rain of tiny hammer icons pattering against an SSH door
sprite, with a counter ticking up. Constant, harmless-looking background texture that you eventually
stop noticing — which is the point.

**Vis-20 · Intrusion / web shell** — once landed, it's **invisible** unless you have FIM/EDR. With
detection built, it renders as a small pulsing purple spore inside one of your machines, occasionally
emitting an outbound thread toward the map edge. Chasing that thread is the investigation.

**Vis-21 · Ransomware** — a creeping crystalline encryption effect that spreads across storage volumes
node-by-node, turning healthy blue data blocks into locked grey ones. You can watch it *walk the
network*, which makes segmentation viscerally valuable.

**Vis-22 · BGP hijack** — on the world map, your prefix's traffic-flow arrows visibly **reroute to a
different POP that isn't yours**, drawn in an alien color. You see your own traffic leaving you.

**Vis-23 · Hardware failure** — a small physical animation: the drive LED goes amber then red, a
carrier icon appears in a "needs replacement" tray, a fan icon stops spinning, a PSU shows a red
cross. Plus **an audible beep** — the real, hateful, unmistakable server alarm beep. Muting it should
be a button that does not fix the problem.

**Vis-24 · Power failure** — the lights in the affected zone go out, emergency lighting kicks in
(everything tinted amber-red), UPS runtime shows a visible countdown, and the generator sprite has a
crank animation. **If it doesn't start, you get three seconds of silence before everything dies** —
the most dramatic beat available.

**Vis-25 · Fire** — VESDA detectors chirp, an aspirating smoke effect, then the suppression discharge:
a white gas flood, a deafening acoustic shock, and — the sting — **half your drive LEDs turn amber
afterward** from the noise.

**Vis-26 · The auditor** — a small figure in a blazer who walks onto your map with a clipboard,
stops at objects, and puts a red or green checkmark on them. Non-violent, deeply stressful.

**Vis-27 · The regulator / law enforcement (bulletproof level)** — a scripted arrival: vehicles at the
loading dock, badge-access logs, and racks being physically removed from your map. Play it straight;
it's more chilling.

**Vis-28 · Abuse complaints** — accumulate as a visible stack of envelopes on the abuse desk. Ignored
ones pile into a leaning tower. When the tower topples, your upstream calls.

## 8.5 Actions, feedback, and juice

**Vis-29 · Making a connection** — drag from socket to socket; the cable follows the cursor with a
physical catenary sag; compatible sockets glow, incompatible ones grey out with a reason tooltip.
On drop: a satisfying *click*, the cable snaps into a routed path (through the tray, not through the
air), the link runs a brief handshake animation, and then flow particles begin. If it fails to
establish, you get a specific, readable error on the link itself ("connection refused",
"auth failed", "no route to host") rather than a generic X.

**Vis-30 · Health as flow, not bars** — a link's health is visible in the *behavior* of its particle
flow: smooth = healthy, stuttering = packet loss, backed-up = congestion, one-directional = asymmetric
routing problem, none = down. A player learns to read flow the way an engineer reads a graph.

**Vis-31 · Upgrades** — a tech sprite physically walks to the rack, the unit goes amber (maintenance
mode), a progress bar runs, and the component visibly *changes* (more drive carriers, a bigger
heatsink, a second PSU appears). Upgrades that require downtime dim the component and reroute traffic
visibly around it.

**Vis-32 · Money** — money moves as *flows*, not popups: a thin green stream of revenue from served
visitors into your balance, and thin red streams draining continuously for power, bandwidth, and
payroll. **You can literally see your power bill running.** Big one-time costs are a chunky animated
deduction. SLA credits drain *out to a specific customer*, which makes it personal.

**Vis-33 · The blast-radius preview** — hover a component with the modifier held and everything that
would fail with it desaturates to grey with a red outline, plus a count: "42 customers · $18,400 MRR
· 3 SLA breaches." The most honest, most useful visual in the game.

**Vis-34 · The incident timeline** — during an incident, a horizontal timeline builds at the bottom of
the screen with real timestamps: detection, page, ack, mitigations attempted, resolution. Afterward it
becomes the postmortem document. Turning the gameplay into an artifact is extremely satisfying and
extremely true to life.

**Vis-35 · The status page as an in-game object** — a rendered customer-facing page you actually edit.
Writing an honest update vs. a vague one is a UI action with a reputation number attached.

## 8.6 HUD and readability at scale

**Vis-36 · The wall of glass (NOC HUD)** — a top strip that mimics a NOC video wall: uptime %, current
RPS, error rate, p50/p95/p99 latency, power draw vs. capacity, temperature, open tickets, cash.
**Percentiles, not averages** — and the game should quietly teach why, by having a p99 spike while the
average looks fine.

**Vis-37 · Sparklines everywhere** — every component carries a tiny 60-second sparkline of its key
metric. At a glance you see shape, not just state.

**Vis-38 · Semantic zoom** — zoomed way out you see facilities and regions as blocks with aggregate
health; mid-zoom, rows and racks; close, individual units and ports. Aggregation rolls up **worst-
child status**, so a single failing drive in a 500-node estate still colors its parent amber. Never
lose a failure in aggregation.

**Vis-39 · Group/meta-nodes** — "Web Tier ×40" as one object with a count badge and a health
distribution bar (34 green / 5 amber / 1 red). Expand to see individuals. This is how you keep a
10,000-node estate playable.

**Vis-40 · The alert list with severity and *silence*** — alerts stack in a panel. You can ack,
snooze, or silence them. **Silenced alerts remain visible but greyed**, so the game can later show you
that the thing that killed you was something you silenced three weeks ago. Devastating and fair.

**Vis-41 · The dependency map** — a generated graph view of what depends on what, including the
dependencies you *didn't know about* (discovered via traffic analysis). Watching it fill in as you
gain observability is a great progression visual.

**Vis-42 · Diff view for changes** — before applying a config change, show a literal red/green diff.
Approving a diff you didn't read is a player choice with consequences.

## 8.7 Era and type-specific visual identity

**Vis-43 · 1996 Dial-Up ISP** — beige and putty plastic, amber CRT monitors, a wall of modem status
LEDs, coiled phone cable, a Sun pizza box, a wire shelf instead of a rack, a whiteboard with IP
assignments, fluorescent light hum. UI chrome becomes Win95/motif-ish. Sound: modem handshake, dot
matrix printer, a single ringing phone.

**Vis-44 · 2004 Colo Cage** — black steel racks, a KVM crash cart being wheeled around, the first
blade chassis, blue cat5 everywhere, a CRT on a shelf. UI in early-2000s web-panel colors.

**Vis-45 · 2012 Cloud Era** — uniform white-label servers, a sea of identical units, containment
curtains, hot-aisle plastic doors, the first flat-design dashboards.

**Vis-46 · Modern AI DC** — dense, dark, liquid-cooled, coolant distribution units, quick-disconnect
hoses, orange fiber bundles thick as an arm, busway overhead, and an ambient roar. Everything glows.
UI goes dark-mode, telemetry-heavy.

**Vis-47 · Game Hosting** — the UI is skinned like a game server control panel; visitors are player
avatars with pings; the "map" has server browser listings; the aesthetic is neon/Discord-adjacent.

**Vis-48 · Archival/Tape** — cold blue lighting, a huge robotic tape library with a visible arm
moving cartridges, barcode labels, a courier van on a little road. Everything is slow and quiet and
enormously reassuring until it isn't.

**Vis-49 · Colo Landlord** — your map is mostly *other people's cages*, rendered as semi-opaque
frosted boxes you can't see into, each with a nameplate, a power meter, and a temperature readout.
The opacity is the whole point: your customers are black boxes.

**Vis-50 · Bulletproof Host** — deliberately dingy: a basement, mismatched hardware, a single flickering
light, hand-written labels, a stack of unopened abuse-complaint envelopes, and a very good lock on
the door.

## 8.8 Sound design (it matters enormously here)

- The **datacenter roar** as constant ambience, with pitch that rises as fan speeds increase. A
  cooling failure is *audible* before it's visible.
- **The beep.** Every sysadmin's blood pressure spikes at the sound of a chassis alarm.
- Relay clack when an ATS transfers. The diesel genset spinning up (a genuinely heroic sound).
- Drive seek chatter under heavy I/O.
- The modem handshake in the retro level.
- The **absence of sound** when power dies — a moment of total silence that is far scarier than noise.
- A pager/PagerDuty tone for alerts. Configurable, and the fact that players will grow to hate it is
  correct and intentional.

---

# 9. Anything Else

## 9.1 Modes

**X-01 · Endless / "Keep It Running"** — no win condition, escalating difficulty, score = uptime-days
and cumulative profit. The ops equivalent of survival mode.

**X-02 · Incident Mode (bite-sized)** — 5-10 minute scenarios that drop you into a broken system with
a specific failure and ask you to diagnose and fix it. Essentially *troubleshooting puzzles*. Highly
replayable, great for daily challenges. Each one is a real incident archetype: "the site is slow but
CPU is at 3%", "half the users can't reach us", "backups have been green for 400 days."

**X-03 · The Postmortem Puzzle** — you're given the artifacts (graphs, logs, a timeline) from an
incident that already happened and must identify the root cause and the contributing factors. Pure
deduction. Scored on how few hints you needed.

**X-04 · Sandbox / Architect Mode** — unlimited money, build a datacenter, then trigger failures and
see what survives. Basically a toy for infrastructure nerds, and extremely shareable.

**X-05 · Chaos Mode** — the game deliberately breaks something random every N minutes, Netflix-style.

**X-06 · Historical Scenarios** — playable recreations of famous, *publicly documented* outage shapes
(anonymized/fictionalized): the DNS provider that took down half the web, the BGP leak that took a
country offline, the config push that removed every route, the certificate that expired on a holiday,
the datacenter that had a fire suppression discharge, the cloud region that lost a whole AZ. Great
educational hook and great marketing.

**X-07 · Co-op On-Call** — two players share an incident. One investigates, one communicates and
mitigates. Forced information asymmetry — each sees different dashboards. This is *exactly* what a
real incident bridge feels like and it would be fantastic multiplayer.

**X-08 · Competitive: Two Hosting Companies** — asymmetric PvP where you compete for the same
customer pool. You don't attack each other directly (mostly) — you compete on price, latency, and
uptime, and customers move between you. Occasionally a shared event (an upstream outage, a hardware
recall) hits you both differently based on your choices.

**X-09 · Red Team Mode** — one player attacks, one defends. The attacker has limited budget and must
pick attack vectors; the defender has limited budget and must pick controls. Simultaneous, blind
pre-commitment, then resolution. Essentially a bluffing game about threat modeling.

**X-10 · The Pager Simulator** — a masochist mode where the game can wake you up. (Joke... mostly.
A mobile companion that sends real notifications during an incident is a genuinely funny idea.)

**X-11 · Ironman/On-Call** — one save, no reloading, permanent consequences. The honest mode.

## 9.2 Twists and structural ideas

**X-12 · Technical Debt as the real antagonist** — a persistent, visible meter that grows from every
shortcut and never goes down on its own. Paying it down produces *zero* visible benefit in the moment
and is always the correct thing to do. The game's central moral.

**X-13 · The Unreliable Dashboard** — sometimes your monitoring is *wrong*. A stuck metric, a
collector that died, a dashboard showing cached data. The player must learn to distrust their
instruments and verify from a second source. This is a genuinely daring design choice and it's
absolutely authentic.

**X-14 · The Inherited System** — start a level with infrastructure you didn't build, partially
documented, with things labeled "DO NOT TOUCH" that you must eventually touch.

**X-15 · The Unremovable Customer** — one customer whose setup is so bespoke and so load-bearing that
you cannot migrate, upgrade, or decommission anything near them. Every level, they're still there.
A recurring character.

**X-16 · The Dependency Nobody Knew About** — a hidden edge in the dependency graph that's only
revealed when something fails. E.g., your monitoring depends on your DNS which depends on your
monitoring's health checks. **Circular dependencies as puzzle content.**

**X-17 · Time-Bomb Decisions** — choices whose consequences land 3 levels later. Buying all your
hardware from one batch. Choosing a vendor that gets acquired. Building on a framework that's
abandoned. Storing the backup key next to the backups.

**X-18 · The Honest Status Page mechanic** — every incident, choose your public wording. Options range
from full transparency to weasel-words ("elevated error rates for a subset of users"). Transparency
costs short-term reputation and builds long-term trust; weaseling does the opposite, and there's a
small chance of being *caught*, which is catastrophic.

**X-19 · Regulatory Drift** — laws change between levels. GDPR arrives. Data residency requirements
appear. An export control lands on your GPU customers. Your perfectly legal business becomes
non-compliant while you were busy.

**X-20 · The Sunset** — a late-campaign level where you must *shut down* a line of business gracefully:
migrate customers, honor contracts, decommission hardware, wipe drives, terminate leases. Scored on
how many customers you keep on other products and how cleanly you exit. Nobody makes games about
decommissioning and they should.

**X-21 · Succession / The Handoff** — you leave. Score is how well the company runs for 90 days
without you. **The ultimate measure of an ops engineer's work is what happens when they're not
there.** Extremely poignant final level.

## 9.3 Humor (sysadmin-specific, earned rather than goofy)

- **"It's always DNS"** as a running gag with mechanical teeth (see 7.11).
- The **ticket titles** — the game should generate customer tickets in authentic voice: "URGENT:
  website down" (it's their WiFi), "your server deleted my files" (they FTP'd over them), "can you
  make my site faster" (they uploaded a 40MB hero image), "why did my bill go up" (they enabled
  backups 11 months ago), "I need this fixed in 5 minutes it's very important" (sent Saturday 11pm).
- **The vendor support response generator** — "Have you tried updating to the latest firmware?"
  "Please collect a full log bundle." "This is a known issue, fixed in the next release (no ETA)."
  "Closing due to inactivity."
- **Machine naming schemes** as a small customization: Greek gods, Tolkien, Pokémon, cheeses,
  `web-prod-us-east-1a-07`. The boring one is mechanically better (lower error rate during incidents)
  and the fun one gives a small morale bonus. A perfect tiny tradeoff and a real argument every
  sysadmin has had.
- **The rack elevation nobody updated** — your documentation diagram vs. reality, side by side.
- **Achievement: "Worked As Intended"** — you spent three hours diagnosing a problem that was a
  typo in your own config.
- **Achievement: "Certified"** — finally got the cert you forgot to renew, 6 minutes after expiry.
- **Achievement: "Percussive Maintenance"** — reseating a card fixed it and you'll never know why.
- **The Post-It with the root password** — a collectible you can find in the acquisition level.
- **Achievement: "Works On My Staging"**.
- **The RFC 2324 easter egg** — a coffee machine buildable that returns 418.
- The **on-call handoff note** that says only "quiet night" immediately before everything explodes.

## 9.4 Educational / community angles

**X-22 · The Real Postmortem Library** — after each incident, the game shows a short, real-world
"this actually happened" card describing an analogous public outage. Turns the game into an
accidental ops education. Would genuinely get used in onboarding.

**X-23 · Scenario Editor + Sharing** — let players build incident scenarios and share them. The
community would produce an enormous library of "diagnose this" puzzles, and companies would literally
use them for interview practice.

**X-24 · Import Your Own Topology** — a stretch idea: import a simplified description of a real
architecture and let the game show you its blast radii and single points of failure. Half game, half
tool. Risky, but the "what would break" visualization is genuinely valuable.

**X-25 · Difficulty named honestly** — instead of Easy/Normal/Hard: *"Managed Service", "Startup",
"Understaffed", "Two Engineers and a Prayer", "It's Just You"*.

## 9.5 Small ideas that didn't fit anywhere else

- **The Crash Cart** — a wheeled monitor/keyboard you move around the floor to work on a machine with
  no network. A physical object with a location. Someone always leaves it in the wrong row.
- **The Blanking Panel** — the cheapest, highest-ROI item in the game. Place them and watch your
  cooling efficiency jump. It should feel like finding free money, because it is.
- **The Grounding/Bonding check** — an obscure buildable that prevents a rare, catastrophic event.
- **The ESD strap** — a tiny probability modifier on physical work. Skipping it occasionally kills a
  DIMM.
- **Spare Parts Cannibalization** — during an emergency, pull a part from a lower-priority machine.
  Fast, free, and creates a hidden inconsistency you'll forget about.
- **The "Do Not Reboot" Machine** — a server with 1,400 days of uptime that everyone is afraid to
  restart because nobody knows if it'll come back. It's running something important. Eventually you
  have to. **The uptime counter as a horror meter** is a wonderful inversion.
- **Firmware as a hidden version axis** — BIOS, BMC, NIC, HBA, drive firmware. All independently
  versioned, all occasionally the root cause, all requiring a reboot to change.
- **The Maintenance Window Negotiation** — you must get customers to agree to a window. Big customers
  say no. Eventually you do it anyway or you never patch anything.
- **Patch Debt** — unpatched CVEs accumulate as a visible risk score per host. Patching costs
  reboots costs downtime costs windows costs negotiation. **The single most realistic loop in ops.**
- **The Runbook You Wrote At 4am** — lower quality, and you'll discover that next time.
- **The Second Opinion** — during an incident, calling in another engineer costs a staff-hour and
  reduces the chance of a mistaken diagnosis. Modeling "rubber ducking" as a mechanic.
- **The Rollback That Isn't** — some changes are one-way (schema migrations, cert revocations,
  hardware disposals, deleted data). Mark them clearly in the UI with a distinct icon. Players should
  learn to fear that icon.
- **IP Reputation as an inherited property of address space** — buy a /24 on the secondary market and
  discover it has history. A genuinely real and rarely-discussed problem.
- **The "Please Confirm By Typing The Hostname"** dialog for destructive operations — and the fact
  that players will start typing it automatically without reading, which is exactly what happens in
  real life and should occasionally cost them.
- **The Weather Layer** — storms affect utility power, hurricanes affect fuel delivery, heat waves
  affect cooling, cold snaps affect... nothing, actually, which is why everyone builds in cold places.
- **Latency as a physical constraint on the world map** — ~5µs per km of fiber, and no amount of money
  changes it. The only counter is being closer. Makes POP placement a real geometry puzzle.
- **The "Everything Is Green" Screenshot** — a shareable end-of-level image of a fully healthy estate.
  Sysadmins will absolutely post these.
