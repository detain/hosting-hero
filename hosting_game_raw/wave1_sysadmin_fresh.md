# Wave 1 — Idea Dump: **Sysadmin / Hosting Engineer Lens**

> Written from the chair of someone who has carried a pager, driven to a datacenter at 3am with
> a spare PSU in a backpack, argued with an upstream about a /24 on Spamhaus, and explained to a
> customer for the ninth time that their site is not down, their office ISP is.
>
> The organizing principle of everything below: **real infrastructure fails in specific,
> repeatable, weirdly funny ways, and those failure modes ARE the game.** A tower-defense game
> about hosting shouldn't invent fantasy monsters — it should ship the actual monsters, because
> the actual monsters are better designed than anything we'd make up. The player should finish
> a campaign having internalized real operational intuition: redundancy has a seam, monitoring
> is a service that itself fails, the second failure always happens during the rebuild, and
> it's always DNS.

---

## 1. Levels, Scenarios, and Progression

### 1.1 The scale ladder (campaign spine)

Each tier changes **what the unit of thought is**. That's the real progression, not just bigger
numbers. At tier 1 you think in processes. At tier 6 you think in regions. A good level design
makes the player's *mental model* upgrade, not just their buildings.

**L1 — "One Site, One Box" (unit of thought: the process)**
A single WordPress site on a shared cPanel server you don't own. You can't add servers. You can
only tune: PHP workers, a caching plugin, an .htaccess rule, an image optimizer, a `fail2ban`
request to the host. Threats are small and constant: wp-login brute force, xmlrpc pingback,
comment spam, a scraper that ignores robots.txt. The entire map is one server with 12 "PHP worker"
slots visualized as a row of lanes — every request occupies a lane for N ticks. Teaches the single
most important lesson in hosting: **you are not out of CPU, you are out of concurrency slots.**
Win condition: survive 30 days without the host suspending you for resource abuse.

**L2 — "The Noisy Neighbor" (unit of thought: the shared resource)**
Same shared server, but now you SEE the other tenants. Another customer's runaway cron pegs the
box. Your defenses are indirect: open a ticket (slow, RNG on the support tier), buy a "CloudLinux
LVE" cage upgrade, or migrate out. Introduces the idea that **not all your problems are yours**,
and the meta-lesson that the fix is sometimes commercial, not technical.

**L3 — "Two U in Someone Else's Cage" (unit of thought: the server)**
You are now a tiny hosting company. Two 1U servers colocated in a shared cabinet. New systems
unlocked: physical placement (rack units), power draw per outlet, a single uplink port, a /29 of
IPs, and **remote hands as a paid action with latency**. You cannot teleport to the datacenter —
every physical fix is a cost + delay roll. First hardware failures appear. First DNS zone. First
time a cert expires. First customer.

**L4 — "A Rack Of Our Own" (unit of thought: the rack)**
Full cabinet, your own switch, your own power budget (two 30A feeds, A+B), your first firewall,
your first out-of-band/IPMI network. Now you must think about **failure domains**: both PSUs on
the same PDU means the PDU is a single point of failure and the "redundant" label is a lie. The
game should let the player make this mistake and then punish it exactly once, memorably.

**L5 — "Multi-Rack, Real Customers" (unit of thought: the service tier)**
Load balancers, DB primaries and replicas, cache tier, storage tier, dedicated backup box,
staging environment. Customers become a managed population with churn and SLA credits. Attack
surface explodes: every tier you add is a new thing that can be misconfigured. Introduces
**blast radius** as an explicit displayed stat per object.

**L6 — "We Are The Datacenter" (unit of thought: the facility)**
You now own the building: UPS strings, generator, fuel contract, CRAC units, hot/cold aisle
containment, fire suppression, badge access, loading dock, a meet-me room. You sell colo and
cross-connects to *other* companies, which means other people's mistakes are now inside your
building. Introduces PUE, cooling as a resource, and the terrifying realization that **the
generator is a machine that runs 15 minutes a month and is expected to work perfectly forever.**

**L7 — "Two Datacenters, One Company" (unit of thought: the region)**
Replication topology, GSLB/anycast, split-brain, the WAN link that becomes the new SPOF, the
truth that **two datacenters is the most dangerous number of datacenters** (quorum needs three).
Failover is now a *decision* with a cost, not an automatic save.

**L8 — "Global Anycast Operator" (unit of thought: the routing table)**
BGP, peering vs transit, IX ports, route leaks, RPKI, prefix hijacks, 95th-percentile billing,
and the fun fact that your worst outage will be caused by someone else's typo in a route-map.

### 1.2 Perspective-shift levels (same world, different chair)

**"On-Call Night"** — You don't build anything. It's 2:47am, you have four alerts, one is a
false positive, one is a symptom of another, and you have a limited number of actions before
sunrise. A triage puzzle. Scoring is on MTTR and whether you woke anyone else up unnecessarily.

**"The New Hire"** — You inherit a stack you didn't build, with no documentation. Half the
objects on the map are fogged with "???" and must be *investigated* (an action that costs time)
before you can upgrade or even safely restart them. One of them is load-bearing and nobody knows
why. Brilliant tutorial-in-reverse and a comedy set piece.

**"The Auditor"** — A compliance level (PCI-DSS / SOC 2). You must reach a configuration state,
not survive an assault. Threats are *findings*: an open port, a shared root password, logs not
retained 90 days, no change control. The "tower defense" is defending against a clipboard.

**"The Datacenter Tech"** — Bottom-up perspective. You are the hands. The map is a cold aisle.
Tasks queue up: swap a drive in bay 7 of a machine whose front label fell off, trace a cable, run
a cross-connect, find which of 42 identical servers is beeping. The upstairs "player" (the NOC)
sends you instructions that are sometimes wrong. Teaches empathy and physical reality.

**"The Migration Crew"** — Move a customer with zero downtime. Pure logistics puzzle: lower the
TTL *days* before, sync data, cut over, keep the old box warm, handle the writes that landed on
the old side after cutover. The clock is a DNS TTL bar draining above the map.

**"The Abuse Desk"** — You are not defending against attacks, you are defending against *your own
customers*. Queue of abuse reports: phishing kit, outbound spam, a DMCA notice, a copyright troll,
a hacked Joomla serving a fake bank login, and one report that is a competitor filing bad-faith
complaints. Suspend too aggressively and you lose revenue and get a bad review; too slowly and
your whole /24 hits the RBL and *every* customer's mail stops delivering.

### 1.3 Scenario / mission ideas (one-off constraints)

- **"Hug of Death"** — Your customer hit the front page. 200x traffic in 90 seconds. Legitimate
  visitors, not an attack, and your defenses will happily block them if you're careless. The
  tension: rate-limiting saves the server and kills the revenue event.
- **"Black Friday"** — Scheduled spike you *know* about. Pre-scale, then pay for the capacity in
  the following month whether or not you used it. Teaches capacity planning regret.
- **"The Change Freeze"** — You may not deploy anything for 14 in-game days. Something breaks on
  day 3. You must fix it with runtime knobs only — config reloads, feature flags, cache TTLs.
- **"Cert Apocalypse"** — A root CA expires at midnight (an AddTrust/DST-Root-X3 style event).
  Modern browsers are fine; old Android, Java clients, curl on CentOS 6, and your *payment
  gateway callback* are not. Your monitoring, which uses a modern client, says everything is green.
- **"Rebuild Window"** — A RAID6 array is degraded. The rebuild takes 19 hours, during which
  performance is halved and a second drive failure is fatal. You choose: rebuild now during peak,
  or wait until 3am and risk 8 more hours degraded. This is a *real* decision real people make.
- **"Fuel Truck"** — Extended grid outage. Generator running. You have 8 hours of diesel, the
  fuel contract vendor has a 4-hour SLA they will miss, and you must shed load — decide which
  customers go dark first. Every choice has a reputation and SLA consequence.
- **"The Suspicious Login"** — A breach scenario. You find one webshell. The level is not over
  when you delete it; it's over when you've established when they got in, what else they touched,
  whether the backups are also poisoned, and whether to rebuild from scratch. Introduces the
  brutal truth: **after a real compromise you don't clean, you rebuild.**
- **"Blacklisted"** — Your /24 is on Spamhaus SBL because one reseller's client got popped. Mail
  delivery for 600 customers is broken. You must find the source, clean it, document it, and file
  a delisting request that has a cooldown. Support tickets flood in while you work.
- **"The Acquisition"** — You buy a competitor. You inherit 300 customers, 40 servers running
  three different control panels, two of which are EOL, and a support inbox with a 9-day backlog.
  Integration level. Everything is a landmine.
- **"The Data Center Move"** — Physically relocate a rack. Trucks, downtime windows, a server
  that won't POST after transport because a DIMM walked out of its slot, and the customer who
  didn't read the notice.
- **"Cost Cutting"** — Revenue is flat, the CFO says cut 20% of infrastructure spend. Every
  removal increases risk. You must choose which redundancy to sacrifice, and then live with it
  for 30 days.
- **"The Viral Competitor Smear"** — Someone posts "this host is down constantly" on a big forum.
  It's untrue-ish. Reputation damage happens regardless of uptime. You respond with transparency
  (publish a status page + post-mortem) or silence.
- **"Leap Second / DST"** — A time-handling event breaks cron, TLS validity checks, and one
  Java app that spins to 100% CPU. Deliciously specific.
- **"Zero-Day Tuesday"** — A critical RCE drops in a component 80% of your customers run. You
  have hours before mass exploitation. Patch everything (risk breaking sites), virtual-patch at
  the WAF (fast but leaky), or shield and schedule. Real triage, real tradeoff.
- **"The Long Weekend"** — 4-day holiday, skeleton crew, half your response actions cost double
  in time. Nothing dramatic happens until hour 60.

### 1.4 What gets harder, tier by tier (design rule)

Difficulty should come from **coupling**, not from bigger HP bars:
1. *More objects* (tier 3→4)
2. *More connections between objects* (tier 4→5) — the real complexity jump
3. *Shared dependencies* (tier 5→6) — one DNS resolver, one auth service, one monitoring box
4. *Other people's failures inside your domain* (tier 6) — colo tenants, upstream transit
5. *Failures you cannot see from where you are standing* (tier 7-8) — the other region's truth
   is delayed and possibly lying to you.

### 1.5 Difficulty modifiers / operator modes

- **"Snowflake Mode"** — no configuration management. Each server drifts individually. Fixes
  must be applied per-object. Makes the player *earn* Ansible.
- **"Bus Factor 1"** — only one staff member knows each subsystem. If they're on vacation or
  burnt out, that subsystem can't be touched.
- **"Budget Host"** — you sell at rock bottom prices. Huge customer volume, terrible margin,
  massive abuse rate. A completely different game shape from...
- **"Boutique Managed"** — 20 customers paying enterprise rates, each with an SLA that has teeth
  and a named contact who will call your cell phone.

---

## 2. Threats

Design principle: **most real "attacks" are not aimed at you.** They are indiscriminate internet
weather. The scary ones are the ones that know your name. So threats should come in three bands:
*weather* (constant, ambient, cheap to stop once, expensive to ignore), *storms* (event-shaped,
telegraphed, survivable with preparation), and *hunters* (adaptive, targeted, respond to your
defenses). And crucially, a fourth band that isn't an attacker at all: *entropy* — your own stuff
breaking.

### 2.A Ambient weather (constant background, low damage, unlimited supply)

1. **Scanner Swarm (Masscan Gnats)** — Endless tiny units drifting across the whole map probing
   every open port. Individually harmless. They *map* you: any service left exposed gets tagged,
   and the tag is what later attacks path toward. Counter: firewall default-deny. Visual: a grey
   drizzle of dots, each pinging one port and dying.
2. **`/wp-login.php` Brute Squad** — Slow, relentless credential guessing against every WordPress
   install. Costs CPU (each attempt is a full PHP bootstrap — that's the real damage, not the
   breach). Counter: fail2ban, rate limit, 2FA, or just moving the login URL (cheap, cheesy,
   surprisingly effective — the game should reward the cheesy fix at low tiers and reveal its
   limits later).
3. **`.env` / `.git` Crawlers** — Units that specifically probe for leaked secrets paths:
   `/.env`, `/.git/config`, `/backup.sql`, `/phpinfo.php`, `/adminer.php`. Harmless unless you
   have actually left one lying around — and the game should let players leave them around
   (e.g., "quick debug" action leaves a `phpinfo.php` artifact for 3 days).
4. **Comment/Form Spam Drones** — Attack the *content*, not the server. Reduces visitor trust and
   SEO score over time. Counter: honeypot field, captcha (which itself repels ~4% of real
   visitors — a genuine tradeoff), Akismet-style paid service.
5. **Referrer/SEO Spam Ghosts** — Pollute your analytics so the player's own dashboards lie. A
   *meta* threat: it attacks your information, not your infrastructure.
6. **Bad Bot Fleet (aggressive crawlers)** — Ignores robots.txt, crawls every faceted-search URL
   combination, generating infinite unique URLs that blow out your cache hit rate. Real and
   under-appreciated: **crawler traffic can be 40% of requests.** Counter: robots.txt (ignored by
   the bad ones), UA blocking, rate limit per ASN, or a "crawl trap" tarpit building.
7. **AI Scraper Locusts** — Modern flavor of the above: huge distributed residential-IP crawls
   with rotating user agents that are functionally indistinguishable from visitors. Blocking them
   costs you real visitors. Lovely no-win tradeoff.
8. **xmlrpc Pingback Amplifier** — Turns *your* server into an attacker against someone else.
   If unaddressed, your upstream sends you an abuse notice and eventually null-routes you. The
   threat that damages you by making you the bad guy.

### 2.B Volumetric and protocol attacks (the classic "waves")

9. **SYN Flood** — Fills the connection table. Visual: half-open handshakes piling up as
   incomplete arrows that never complete. Counter: SYN cookies (a one-time upgrade), conntrack
   tuning, upstream scrubbing.
10. **UDP Amplification Barrage (NTP monlist / DNS ANY / memcached 11211 / SSDP / CLDAP)** — A
    small attacker with a *huge* multiplier, crossing the map as a thin line that fans into a
    wall of bandwidth. Key mechanic: **it doesn't matter how good your server is — your pipe is
    the victim.** Only an upstream/scrubbing/anycast solution works. Teaches that some fights
    can't be won at your own edge. A 50Gbps event on a 1Gbps port is not a server problem.
11. **Slowloris** — Almost zero bandwidth, opens many connections and dribbles headers forever.
    Defeats bandwidth-based detection entirely; your graphs look *fine* while you are dead.
    Counter: switch the frontend from prefork-Apache to an event-driven proxy (nginx/haproxy),
    or set header timeouts. Gorgeous teaching moment about "the monitoring says green."
12. **RUDY / slow POST** — Same trick on the body side.
13. **Layer-7 GET Flood on the Expensive Endpoint** — Not random URLs: it hits `/search?q=<random>`
    or `/?s=` — the one path that bypasses cache and hits the DB. 200 req/s kills you where
    200,000 req/s of static content wouldn't. Counter: cache the uncacheable (query normalization),
    rate limit per endpoint class, a queue/ratelimit at the edge, or a "search is a separate
    service" architecture change.
14. **Cache-Buster Flood** — Appends random query strings to defeat your CDN and force origin
    hits. Counter: ignore-unknown-query-params rule at the CDN.
15. **Mirai-Style IoT Botnet** — Tens of thousands of weak sources, each sending little, from
    residential IPs all over the world. You cannot block by IP or country without eating real
    users. Visual: a swarm of tiny cheap-looking camera/DVR icons.
16. **Booter/Stresser Kid** — A script kiddie who rented 10 minutes of a botnet for $15 because
    someone beat them in a game hosted on your box. Short, sharp, and repeats every evening at
    the same time. Adaptive punchline: they give up if three attacks in a row do nothing.
17. **Ransom DDoS ("pay 5 BTC or Monday gets worse")** — A demo attack, then an email. Player
    chooses: pay (works once, marks you as a payer, increases future attack frequency — real
    dynamic), harden, or go public. Excellent economy/reputation hook.
18. **Reflection Aimed *Through* You** — Someone spoofs your IP as the source of their attack, so
    the *replies* come to you. You are being hit by responses from legitimate servers. Blocking
    them is blocking innocents.
19. **Carpet Bomb / Prefix Attack** — Targets your whole /24 at low rate per IP, staying under
    every per-IP threshold, but summing to a full pipe. Detection must be at the prefix level.
    Defeats naive per-host defenses — a great mid-game "your old counter stopped working" beat.

### 2.C Application and intrusion threats (the ones that end runs)

20. **SQL Injection Serpent** — Only spawns once the player builds a database tier. Slides along
    the web→DB connection. If it lands: data exfiltration (reputation + legal cost), or an
    `INTO OUTFILE` webshell drop. Counters: prepared statements (a code-quality upgrade for a
    customer, which you can *recommend* but not force — customers own their code), WAF rules,
    DB user least-privilege (huge: a read-only DB user turns a catastrophe into an incident).
21. **Webshell (`c99.php`, the eternal)** — The *persistence* threat. Once dropped it is quiet.
    It doesn't damage you now; it sits there and becomes the entry point for later waves. Only
    detectable by file-integrity monitoring, an outbound-traffic anomaly, or a rebuild. The
    game's version of a hidden debuff that nobody sees for 10 minutes.
22. **Cryptominer Infestation** — Post-compromise payload. Symptom is **load average 40 with no
    traffic**. Cost: CPU, power bill (literally, at tier 6+), customer slowness. Often the first
    visible sign of a much older breach. Counter: process auditing, egress filtering to mining
    pools, CPU anomaly alerts.
23. **Outbound Spam Cannon** — A compromised customer mailbox or a hacked contact form starts
    blasting. Damage is *delayed and collective*: your IP reputation degrades, then your whole
    range gets listed, then every customer's mail bounces. Superb slow-burn threat that punishes
    ignoring small alerts.
24. **Magecart Skimmer** — Injected JS steals card details from a customer's checkout. You find
    out from the *card brands*, not your monitoring. Massive reputation/legal damage. Counter:
    subresource integrity, CSP, file integrity monitoring, and a customer who lets you update
    their software.
25. **Supply-Chain Package Poisoning** — A dependency the customer pulls at deploy time is
    backdoored. The compromise arrives through your own trusted deploy pipeline. Counter:
    lockfiles, artifact mirrors, build isolation.
26. **The Zero-Day Drop (Log4Shell/Struts/ProxyShell archetype)** — Announced globally as an
    event. There's a window of hours between disclosure and mass exploitation. The player's whole
    fleet is flagged vulnerable; they must triage patch order. Patching is *itself* risky (a
    patch can break a customer's site — introduce a small chance of that, it's real).
27. **Credential Stuffing Tide** — Not brute force — *correct* passwords from someone else's
    breach. Rate limiting doesn't help because the success rate is high and the volume is low.
    Counter: 2FA, breached-password checks, impossible-travel detection.
28. **Control Panel Exploit (cPanel/Plesk/Webmin RCE)** — One vuln, root on *every* server that
    runs the panel simultaneously. The homogeneity that made the fleet easy to manage is what
    makes it die all at once. Great argument-for-diversity lesson.
29. **Insider / Ex-Employee** — A former admin's SSH key is still in `authorized_keys` on 40
    boxes. Triggered by the "fire staff" economy action if the player skipped the offboarding
    step. Beautiful: a threat the player *creates* through a business decision.
30. **Social Engineering Call** — "Hi, this is Dave from the datacenter, I need the root password
    to fix your server." Or a fake DMCA. Or a fake domain-transfer authorization. Presented as a
    dialog with tells the player can learn to read. Counters: callback verification policy,
    registrar lock, PIN on the account.
31. **Registrar / DNS Hijack** — Someone social-engineers your registrar. Your domains now point
    at them. Your servers are perfectly healthy and completely unreachable. The best "everything
    is green and nothing works" threat in the business.
32. **BGP Prefix Hijack** — Tier 8. Someone else announces your /24 more specifically. Traffic
    goes to them globally. You cannot fix it from inside. You must call upstreams and hope RPKI
    saves you. The game's ultimate helplessness moment.
33. **Subdomain Takeover** — A dangling CNAME to a decommissioned service that someone else
    claims. Now `status.yourcompany.com` serves a scam. Created by the player's own *cleanup*
    sloppiness — a punishment for deleting a service without deleting the record.
34. **Ransomware on the File Server** — Encrypts customer data AND, crucially, reaches the
    backup share if the backup share was mounted. The entire point: **a mounted backup is not a
    backup.** Immutable/offline/pull-based backups are the only counter, and they cost more.

### 2.D Entropy — hardware, power, network, and physics (non-attack threats)

These should be a full-fledged threat class with their own visual language (no "enemy" walking in
— they *erupt from inside your own buildings*). Half a sysadmin's life is here.

35. **Drive Failure** — A disk dies. Fine, you have RAID. Except:
36. **Correlated Batch Failure** — All 8 drives came from the same lot, same day, same firmware.
    The second one dies within 48 hours of the first. Real, documented, brutal.
37. **URE During Rebuild** — The rebuild reads every sector of every remaining drive, which is
    exactly when the latent bad sector surfaces. Array lost. The player learns why RAID5 on big
    disks is a trap and why RAID is not backup.
38. **RAID Controller BBU Death** — The battery fails, the controller drops write-back cache to
    write-through, IOPS falls 10x, everything is "slow" with zero errors logged anywhere obvious.
    A pure diagnostic puzzle with no alarm attached to it.
39. **Silent Bit Rot** — A file is subtly corrupted and faithfully backed up in its corrupted
    form for six months. Counter: checksumming filesystem (ZFS/btrfs) or scrub jobs.
40. **PSU Failure** — Half of a redundant pair dies. No impact... unless both were on the same
    PDU/feed, in which case you discover your redundancy was decorative.
41. **PDU Overload / Breaker Trip** — You added one more server to a rack and crossed the 80%
    continuous-load rule on a 30A circuit. The breaker trips, killing *everything* on that feed
    at once — including the switch, so you can't even see what happened. Power budgeting must be
    a real, visible per-rack constraint with a red line.
42. **Phase Imbalance** — Three-phase rack loaded unevenly. Works fine right up until it doesn't.
43. **UPS Battery End-of-Life** — Batteries were "tested" by a self-test that only checks voltage,
    not capacity. The grid blips for 90 seconds; the UPS holds for 11. Everything drops.
44. **Generator Fails to Start** — Dead block heater, clogged fuel filter, a start battery that
    nobody load-tested, or the ATS itself failing. The generator that passed every monthly no-load
    test fails on the one day of actual load. The counter is "load-bank test," an expensive,
    boring, unglamorous purchase that the player will resent buying and later worship.
45. **CRAC/Cooling Failure** — Temperature climbs. You have minutes, not hours. Servers begin
    thermal-throttling (a soft degrade the player can see as reduced capacity), then start
    shutting down on thermal trip. Counter: N+1 cooling, containment, raising the setpoint,
    emergency: prop the doors and bring in portable units (a hilarious real move).
46. **Blanking Panel Neglect / Hot Aisle Recirculation** — A slow, invisible efficiency drain:
    missing blanking panels raise inlet temps at the top of the rack, and the top servers run
    hotter and fail sooner. A "you didn't do the boring thing" debuff.
47. **Water Leak / Condensation** — Above-rack chilled water pipe. Or a roof. Choose your fear.
48. **Fire Suppression Discharge** — The gas dump itself produces an acoustic shock that has been
    documented to **crash hard drives from noise**. Absurd, true, and a perfect game event.
49. **Kernel Panic / OOM Killer** — Memory pressure; the kernel kills the largest process, which
    is always the database. Counter: swap tuning, memory limits, `oom_score_adj`, or just buying
    RAM (the cheapest fix in the game and the one players will still postpone).
50. **Inode Exhaustion** — Disk shows 40% free; writes fail anyway because a session directory has
    9 million tiny files. The error message lies to you. Great "your dashboard is wrong" event.
51. **Log Partition Full** — Someone left debug logging on. `/var` fills. Services that can't
    write logs refuse to start. Cascading and self-inflicted.
52. **Conntrack Table Full / Ephemeral Port Exhaustion** — Silent packet drops at a specific
    concurrency threshold. Looks like "the network is flaky."
53. **File Descriptor Limit** — `Too many open files`. The service works perfectly under test load
    and dies at exactly 1024 connections.
54. **Certificate Expiry** — The single most common self-inflicted outage in the industry. Must be
    a recurring, visible timer on every TLS-bearing object, and auto-renewal must be an *unlock*
    the player earns after being burned at least once.
55. **Let's Encrypt Rate Limit** — The auto-renewal the player finally built loops on a broken
    domain and burns the weekly quota, so the *other* renewals fail too. Automation failure mode.
56. **Missing Intermediate Chain** — Works in every browser you test, fails in Java clients, old
    Android, and the payment gateway's callback. Partial-failure threats are the best threats.
57. **DNSSEC Signing Expiry / Bad KSK Rollover** — You don't get "degraded." You get a hard
    SERVFAIL for everybody with a validating resolver. All or nothing.
58. **Domain Expiry** — Nobody renewed. The credit card on file at the registrar expired.
    Reputation catastrophe, trivially preventable, happens to billion-dollar companies annually.
59. **Spanning Tree Loop** — A tech patches two ports of the same switch together while cabling.
    Broadcast storm. The entire VLAN goes to zero instantly. Counter: BPDU guard / portfast
    config (an unlock), or just... training.
60. **Rogue DHCP Server** — Someone plugs in a consumer router "just to test." Half your servers
    get the wrong gateway.
61. **Duplex/Speed Mismatch & Bad Optics** — Link is up, throughput is 3% of nominal, error
    counters climb. Dirty fiber or a flaky SFP. Counter: check interface error counters (a
    "deep inspection" action that the player learns to do).
62. **MTU Mismatch / PMTUD Blackhole** — Small requests work, large uploads hang forever. The
    most maddening real bug in networking, and a *perfect* puzzle: your monitoring pings (small)
    are green.
63. **Switch Firmware Bug / Stack Master Failover** — The HA mechanism causes the outage.
64. **Upstream Transit Flap / Fiber Cut** — A backhoe 40 miles away. You are perfect; you are
    unreachable. Only multihoming helps.
65. **Asymmetric Routing After Failover** — Traffic goes out one path and back another through a
    stateful firewall that drops it. Failover "worked" and nothing works.
66. **Clock Drift / NTP Failure** — Certificates fail validation, cron double-fires, logs are
    unorderable, Kerberos dies, and replication gets confused. An invisible foundation crumbling.
67. **Replication Lag / Silent Replica Drift** — The replica has been subtly wrong for a month.
    You find out when you promote it. Counter: checksum verification jobs (boring, essential).
68. **Split-Brain** — Two primaries accept writes. Data is now in an unresolvable superposition.
    The reconciliation minigame should be genuinely painful.
69. **Long ALTER TABLE Lock** — A "small schema change" locks a 90GB table for 40 minutes at
    peak. Deploys are threats.
70. **Cache Stampede / Thundering Herd** — A popular cache key expires; 4,000 concurrent requests
    all try to regenerate it; the DB dies. Counter: lock-and-refresh, stale-while-revalidate,
    jittered TTLs. Essentially: **your cache is a load-bearing wall and it expires on a schedule.**
71. **Redis maxmemory Eviction** — Sessions were stored in the same Redis as the cache. Cache
    pressure evicts session keys. Every user is logged out mid-checkout. Nobody alerts on it.
72. **Backup That Never Restored** — The backup job has been "successful" for 14 months and has
    been writing a 4KB file. The counter is a **restore drill**, a recurring cost with no visible
    benefit until the one day it's everything. Make players schedule it; make the ones who don't
    lose a save-run's worth of data.
73. **Bad Deploy / No Rollback** — A Friday 5pm deploy. Introduce a "deploy confidence" stat and
    a rollback mechanism that only exists if the player built immutable artifacts.
74. **Config Drift** — Server 7 was hand-fixed during an incident and never re-templated. Six
    months later it's the one that breaks. Counter: config management, which *itself* introduces
    a new threat: **a bad Ansible run breaking all 40 boxes in 9 seconds.**
75. **Monitoring Blind Spot** — The new service was never added to monitoring. It's been down
    for three days. Nobody noticed because customers assumed it was supposed to be like that.
76. **Alert Fatigue** — A flapping check has cried wolf 400 times. The game should literally
    start *hiding* or dimming alerts the player has repeatedly dismissed, then hide the real one.
    Devastating and fair.
77. **The Monitoring Server Dies** — Everything is green, forever. Counter: dead-man's-switch /
    external heartbeat. Meta-threat of the highest order.
78. **Time-Bomb Cron** — A yearly logrotate/cleanup job that deletes something important, written
    by someone who left in 2019.

### 2.E Human / business threats

79. **Chargeback Fraudster** — Signs up with a stolen card, uses resources for 60 days, disputes.
    You lose the money *and* pay a chargeback fee. Counter: fraud scoring at signup (which
    rejects some real customers — tradeoff), manual review (staff time), deposit requirements.
80. **The Reseller Who Oversells** — One customer account whose own customers are 300 sites of
    unpatched WordPress. Highest revenue, highest abuse rate. A walking risk/reward decision.
81. **The Resource Hog** — Runs a `find /` every minute, or a backup script that tars the whole
    home directory to the same disk. Not malicious, just catastrophic. Counters: cgroups/LVE,
    quotas, a polite email, or the nuclear option of suspension.
82. **Support Ticket Flood** — After any outage, tickets spike. Ticket backlog is a resource the
    player manages with staff. Unanswered tickets convert to churn and public reviews.
83. **The 1-Star Review** — A single customer's 4-minute blip becomes a public review that
    measurably reduces new signups for 30 days. Counter: a status page, proactive comms, and a
    post-mortem (transparency actually *raises* trust — model that).
84. **SLA Credit Claim** — An enterprise customer invokes the SLA. Real money leaves. The bigger
    the customer, the more they read the contract.
85. **Compliance Audit / Law Enforcement Request** — Subpoena, seizure order, or a raid that takes
    a whole server (with 40 other customers on it) as evidence. Real and terrifying.
86. **Staff Burnout** — A named engineer who has been on-call for 3 straight incidents starts
    making mistakes (increased chance of a bad change), then quits, taking their subsystem
    knowledge with them. Burnout as a resource meter is the truest hosting mechanic there is.
87. **Vendor Lead Time / Supply Chain** — The replacement RAID card is 12 weeks out. Your spare
    parts pool is either stocked (capital tied up) or it isn't (downtime). A pure inventory game.
88. **The Acquisition Rumor / Price War** — A competitor drops prices 40%. Churn spikes among
    price-sensitive customers only. You choose: match (margin death), differentiate (slow), or
    let them go (short-term pain, better book of business).

### 2.F Threat behavior rules (how they should act on the map)

- **Attacks probe the weakest listed port, not the nearest object.** Pathing should follow the
  *dependency graph*, not geometry. Threats enter at your edge and traverse the same links your
  visitors do — which is why a defense that blocks a threat can also block a visitor.
- **Hunters adapt.** Block by IP → they rotate. Block by country → they use residential proxies.
  Block by UA → they copy Chrome's. Each counter should buy time, not permanence. The lesson:
  **defense is attrition and economics, not a wall.**
- **Damage is often delayed and off-screen.** A webshell today is a botnet C2 next week is an
  RBL listing the week after. Show the causal chain in the post-mortem screen so the player
  connects the dots retroactively — that "oh, THAT'S what that was" moment is the whole game.
- **Nothing announces itself.** The alert the player gets should be the *symptom* ("load avg
  high", "5xx rate up", "mail queue growing"), and identification should be a player action.

---

## 3. Visitors, Traffic, and Clients

The sysadmin framing: **a visitor is a request that has a deadline and a patience budget.** Every
hop you add (TLS handshake, DNS lookup, a proxy, a DB query, a cold cache) spends milliseconds out
of that budget. When it hits zero, they bounce. This makes latency a *pathing* mechanic, which is
exactly what a tower defense wants.

### 3.1 Visitor unit types (they walk the same paths as threats)

1. **The Impatient Mobile Visitor** — 3-second patience bar, on a bad LTE connection (high RTT, so
   every round trip costs double). Extremely sensitive to TLS handshake count, redirect chains,
   and uncached assets. Rewards CDN, HTTP/2-3, keep-alive, and OCSP stapling.
2. **The Desktop Regular** — Generous patience, returns daily, carries a warm browser cache. Cheap
   to serve on repeat visits. The bread and butter. Rewards long cache headers and ETags.
3. **The Deep-Link Visitor** — Arrives from search on a specific product page, not the homepage.
   Your homepage being fast is irrelevant. Punishes players who only optimize the front door.
4. **The Search Engine Crawler (the good one)** — Doesn't spend money directly but *its* experience
   determines your visitor supply rate for the next several waves. Slow responses → reduced crawl
   budget → fewer indexed pages → fewer visitors later. A delayed-feedback economy lever, very
   real, and a great way to punish short-term thinking.
5. **The Uptime Monitor** — An external checker that hits `/health` every minute. If it sees a
   failure, it publishes to a status page and (if a customer's monitor) generates a ticket. The
   visitor that tattles.
6. **The Checkout Visitor (Whale)** — Worth 50x a pageview but traverses the *entire* stack: web →
   session store → DB → payment gateway → email. Any weak link kills the conversion. Visually: a
   visitor carrying a shopping basket that must physically reach the "conversion" node at the
   back of your topology. Make the player build a *complete healthy path*, not just a fast edge.
7. **The API Consumer** — A machine client with a retry loop. When you fail, it doesn't bounce, it
   **retries harder** — turning a small outage into a self-inflicted DDoS (retry storm). Counter:
   exponential backoff (you can't control the client), circuit breakers, and a 429 with
   `Retry-After` that well-behaved clients honor. Superb: the "friendly" traffic that finishes you.
8. **The Media Streamer** — Long-lived connection, huge bandwidth, minimal CPU. Blows up your
   95th-percentile transit bill rather than your servers. Different resource axis entirely.
9. **The Upload Visitor** — Large POST bodies. Sensitive to timeouts, `client_max_body_size`,
   temp-disk space, and PHP's `upload_max_filesize`. Fails in ways that produce a support ticket
   rather than a bounce.
10. **The Logged-In User** — Bypasses your cache entirely by definition. A wave of logged-in users
    is 30x more expensive than the same count of anonymous ones. Beautiful mechanic: **success
    (people signing up) makes your defenses less effective.**
11. **The Repeat Bouncer** — Has bounced before. Requires *two* good experiences to be won back.
    Models trust decay.
12. **The Word-of-Mouth Visitor** — If served well, spawns 2-3 more visitors after a delay. If
    served badly, spawns a negative-reputation unit. Makes quality compound in both directions.
13. **The Journalist / Influencer Visitor** — One unit, massive downstream consequence. Serve
    them well → a traffic spike event next wave. Serve them badly → a public post.
14. **The Accessibility Visitor** — Screen reader / slow device / text-only. Punishes JS-heavy
    builds. A small, principled niche that rewards lean pages.
15. **The Geo-Distant Visitor** — Spawns at the far edge of the map; every kilometer is latency.
    Only a CDN PoP or a regional replica can save them. The visual argument for global buildout.
16. **The Returning Cart-Abandoner** — Comes back if and only if session state survived. Punishes
    the player who put sessions in an evictable cache (see threat #71).

### 3.2 Customer/client types (the recurring-revenue population)

17. **The $3 Shared Hosting Customer** — One tiny site. Almost no revenue, almost no cost — until
    they get hacked, at which point they cost 40x their monthly fee in abuse handling. Volume
    business: profitable only in aggregate, and only if your automation is good.
18. **The WordPress Agency** — 80 client sites, all with the same 12 plugins. One plugin vuln
    compromises all 80 simultaneously. High revenue, terrifying correlation risk.
19. **The Forum / Community** — Bursty, DB-heavy, attracts attacks and drama. Generates its own
    abuse reports. Loyal and long-lived if you keep it up.
20. **The E-Commerce Store** — Revenue tracks *their* revenue. Downtime cost is quantified in
    their lost sales and they will tell you the number. PCI scope. Seasonal (Black Friday).
21. **The Enterprise Whale** — 30% of your MRR in one contract. Demands architecture changes,
    a named account engineer, quarterly reviews, and a real SLA. Losing them is a run-ending
    event; serving them distorts your whole roadmap. Classic concentration risk.
22. **The Developer Customer** — Low revenue, high technical demands, but writes about you
    publicly and refers others. A reputation multiplier disguised as a support cost.
23. **The Reseller** — Buys wholesale, sells retail, and you never see their end customers. Great
    margins, zero visibility, and their end-users' abuse is your abuse.
24. **The Dormant Account** — Paying monthly for a site nobody visits. Pure profit. Also an
    unpatched, unmonitored, forgotten compromise waiting to happen. **The best customer and the
    worst risk are the same account.** That is a genuinely great game object.
25. **The Startup on a Free Tier** — Costs you money now, might become a whale, might vanish.
    An investment bet.
26. **The Mail-Only Customer** — Tiny revenue, outsized risk: mail is the single most abuse-prone
    service you can sell.
27. **The Crypto/Streaming/"Special" Customer** — Offers 5x rates, brings 10x abuse complaints and
    upstream attention. Taking them is a run-defining choice.
28. **The Migrating-In Customer** — Arrives with a broken site built by someone else and expects
    you to fix it for free. Onboarding cost is real and should be modeled.
29. **The Government/Healthcare Contract** — Compliance overhead, slow payment terms (net-90 — a
    cash flow problem, not a profit problem), and enormous stability.

### 3.3 What makes them bounce or churn (the anti-conversion table)

- **TTFB over budget** — the master stat. Every intermediate hop adds to it.
- **Redirect chains** — `http → https → www → trailing slash` is four round trips before a byte
  of content. Make this visible as four extra path segments the visitor must physically walk.
- **TLS handshake cost** — first visit expensive, resumption cheap. Rewards session tickets/0-RTT.
- **Cold cache after a deploy** — every deploy that busts the cache creates a slow window. So
  **deploying is a defensive vulnerability**, which is delightfully true to life.
- **Cert warning** — not slow, just *scary*. Near-100% bounce and a trust hit. Binary damage.
- **A captcha or an aggressive WAF rule** — your own defenses bouncing real visitors. This should
  be measurable: every defense shows a "false positive rate" stat that costs you visitors.
- **5xx vs 4xx** — 503 with a nice branded maintenance page bounces politely; a raw white
  "Internal Server Error" bounces angrily and generates a support ticket.
- **Mobile layout breakage / heavy JS** — bounce for the mobile cohort only.
- **Search ranking decay** — chronic slowness reduces the *spawn rate* of future visitors. Damage
  to the future, not the present. Hardest lesson in ops, perfectly gamifiable.
- **Mail deliverability** — if password resets and receipts land in spam, customers churn for
  reasons the player will not see on any latency graph. Requires SPF, DKIM, DMARC, reverse DNS,
  a warm IP, and a clean neighborhood.

### 3.4 How the player actively wins more visitors/customers

30. **Performance Budget** — Every 100ms of TTFB shaved raises conversion measurably. A direct,
    satisfying dial between engineering work and money.
31. **CDN / Edge PoPs** — Physically shortens the walk. The most legible "build a shortcut" tower.
32. **Status Page + Public Post-Mortems** — Converts an outage's reputation damage into a partial
    *gain* in trust. Radical honesty as a mechanic. (It is genuinely what works.)
33. **Migration Concierge ("we'll move you free")** — A staff-time cost that converts competitor
    customers. The single highest-ROI real hosting tactic.
34. **Free Backups / Free SSL / Free Staging** — Features that cost you upkeep but massively
    reduce churn. Retention beats acquisition on cost.
35. **Uptime Guarantee Badge** — Advertise your real measured uptime. Raises signups; makes SLA
    credits expensive. Risk/reward on a stat you control.
36. **Response-Time SLA on Support** — Staffing decision that becomes a marketing asset.
37. **Referral/Affiliate Program** — Cheap customer acquisition that also attracts fraud signups.
38. **Niche Specialization** — "The Magento host", "the host for Laravel devs". Narrows the
    visitor pool but raises price tolerance and lowers support cost (homogeneous stack = better
    automation). A strong strategic branch.
39. **Peering at an IX** — Cuts latency to local eyeballs *and* cuts transit cost. A rare
    build that improves both the visitor lane and the money lane.
40. **IPv6 Support** — Reaches visitor cohorts that IPv4-only misses; also halves your IPv4 cost
    pressure. Cheap goodwill, real benefit.
41. **Green/Renewable Power Certification** — A reputation/marketing modifier tied to a real
    operational cost (PUE, power contracts). Wins a specific customer segment.

---

## 4. Buildables: Services and Infrastructure

Universal design rule for every buildable: **three columns — what it gives you, what it costs to
run, and what it lets in.** There should be no pure upgrades. Ever. If a player can build
something with no downside, it should just be a default.

### 4.1 Compute / servers

| Build | Gives | Costs | Opens |
|---|---|---|---|
| **Shared Web Node (cPanel)** | Many small customers per box, high margin | License fee, CPU contention | Control-panel RCE hits every box at once; one bad tenant slows all |
| **Dedicated Server** | Isolation, premium price | High capex, idle waste | Customer has root — you can't fix their mess; they become an attacker's foothold you don't control |
| **VPS/KVM Node** | Density + isolation, best margin | RAM is the binding constraint | Hypervisor escape (rare, catastrophic), noisy-neighbor I/O, overcommit risk |
| **Container Host** | Fastest density, quick provisioning | Orchestration complexity | Shared kernel, image supply chain, a bad manifest kills 200 workloads in one apply |
| **Bare-Metal Build Box** | Deploy pipeline, artifact builds | Idle cost | The build pipeline is a *privileged* path — compromise it and you own every deploy |

42. **Reverse Proxy / Edge Tier (nginx/haproxy)** — The most important early build. Absorbs
    slowloris, terminates TLS, does rate limiting, buffers slow clients so backends stay free.
    Opens: it is now the single point through which everything passes, and a bad config reload
    takes the whole site down. Also becomes the place all your rules accumulate into an
    unreviewable mess.
43. **Load Balancer (L4 and L7 as separate builds)** — L4 is fast and dumb; L7 can route by path
    and do health checks but is more expensive per request. Opens: **health check misconfiguration
    is a top-tier outage source** — a check that's too shallow keeps a dead backend in rotation;
    too aggressive and a slow backend gets flapped out, shifting load to the others and cascading.
44. **Keepalived/VRRP Floating IP** — Cheap HA for a pair. Opens: split-brain if the heartbeat
    link is the thing that fails, and both nodes claim the VIP.
45. **Database Primary** — Unlocks dynamic apps. Opens: SQLi, slow queries, lock contention,
    connection limits, and the fact that it's the hardest thing to scale out.
46. **Read Replica** — Offloads reads. Opens: **replication lag as a correctness bug** — a user
    writes then immediately reads and sees old data ("I placed my order and it's gone"). Requires
    a "read-your-writes" routing upgrade to fix properly.
47. **Connection Pooler (pgbouncer/ProxySQL)** — Fixes connection exhaustion. Opens: another hop,
    another process to run out of memory, and prepared-statement weirdness.
48. **Cache Tier (Redis/Memcached)** — Enormous performance win. Opens: eviction bugs, stampedes,
    an unauthenticated service that must never touch the internet (memcached on UDP is a famous
    amplification vector), and the psychological trap of building an app that **cannot survive
    its own cache being cold**. Add a "cold start" test: if you flush cache, can you come back up?
49. **Object/Blob Storage Node** — Cheap bulk. Opens: a misconfigured public bucket leaking
    customer data, and egress costs.
50. **NFS/Shared Storage** — Lets web nodes share files. Opens: the classic — **NFS turns N
    independent servers into one correlated failure domain**, and a stale mount hangs processes in
    uninterruptible D-state where even `kill -9` doesn't work.
51. **Mail Server (MTA + IMAP)** — A revenue line and a permanent liability. Opens: open-relay
    misconfiguration, outbound spam, blacklisting, backscatter, and the fact that deliverability
    is a reputation score maintained by strangers.
52. **DNS Authoritative Pair** — Your name is your existence. Opens: amplification abuse if
    recursion is left on, zone transfer leakage (AXFR open to the world — a real, common finding),
    and total invisibility if both nameservers are in one facility.
53. **Recursive Resolver (internal)** — Speeds up everything. Opens: if it dies, *every* server
    fails simultaneously in confusing ways, and half your alerts will say "connection timed out"
    instead of "DNS is down." A dependency so fundamental it's invisible until it isn't.
54. **NTP Source** — Boring, tiny, and if it fails, certificates and logs and auth all break.
55. **Backup Server** — Unlocks recovery. Opens: it is a machine with read access to *everything*,
    which makes it the juiciest target on your network. Variants matter enormously:
    - *Push backups* (client writes to backup host) — ransomware reaches them.
    - *Pull backups* (backup host reaches in) — safer, but now the backup host holds keys to all.
    - *Immutable/offsite/air-gapped* — expensive, slow to restore, actually survives.
56. **Staging Environment** — Reduces bad-deploy probability. Costs a full duplicate of everything
    and is always subtly different from production, which is where the bugs hide.
57. **Bastion / Jump Host** — Consolidates SSH access. Opens: single point of compromise, and it
    is the box everyone forgets to patch because "it doesn't do anything."
58. **Out-of-Band Management (IPMI/iDRAC/iLO) Network** — Lets you fix a wedged box without
    driving in — massively reduces remote-hands cost. Opens: **IPMI firmware is historically
    atrocious**; if it's ever reachable from the internet, it's a free root shell with a built-in
    remote KVM. The build that saves you money and can end your company. Must be on its own VLAN.
59. **Console Server / Serial Concentrator** — Last resort when networking is the thing that broke.
60. **Config Management (Ansible/Puppet)** — Ends config drift, makes rebuilds fast. Opens: a
    single bad playbook applied fleet-wide is the fastest outage in the game. Add a "canary/limit"
    upgrade that reduces the blast radius at the cost of deploy speed.
61. **Monitoring Stack (metrics + logs + alerting)** — Reveals the hidden state of everything.
    This should be the game's "fog of war" remover, purchased in layers:
    - *Ping/port checks* — knows if a box is up.
    - *Service checks* — knows if the service answers.
    - *Synthetic transactions* — knows if a *checkout* works (catches the "everything green,
      nothing works" class).
    - *Real User Monitoring* — knows what visitors actually experience.
    - *Distributed tracing* — tells you *which* hop is slow instead of that something is.
    Opens: alert fatigue, cost, and the monitoring system itself as a dependency.
62. **Log Aggregation** — Forensics after a breach, and the only way to answer "when did they get
    in." Opens: enormous storage cost, and logs contain secrets (so the log server is now in PCI
    scope and is a data breach waiting to happen).
63. **File Integrity Monitoring (AIDE/tripwire)** — The only reliable webshell detector. Opens:
    false-positive noise every time anyone legitimately updates anything.
64. **WAF (ModSecurity/CRL)** — Blocks SQLi/XSS patterns. Opens: **false positives that block real
    customers**, an enormous rule-tuning cost, and a false sense of security that delays fixing
    the actual code.
65. **IDS/IPS** — Sees attacks. Opens: encrypted traffic blindness (needs TLS termination in front
    of it), and rule-tuning labor.
66. **fail2ban / Dynamic Blocklist** — Cheap early defense, extremely satisfying to watch. Opens:
    a self-DoS when a legitimate NAT'd office of 200 users trips the threshold and the whole
    company is banned, and log-parsing CPU cost at scale.
67. **Rate Limiter (per-IP / per-endpoint / per-ASN)** — Tiered granularity as an upgrade path.
68. **DDoS Scrubbing / Upstream Filtering** — The only real answer to volumetrics. Costs a monthly
    retainer or a per-event fee, and adds latency when active (a visible visitor-speed penalty
    while under protection — the real tradeoff of always-on scrubbing).
69. **Anycast Network / Multiple PoPs** — Spreads volumetric load across many sites so no single
    one drowns. Tier 8 build.
70. **CDN** — Offloads static, absorbs floods, shortens visitor walks, cuts the transit bill.
    Opens: cache poisoning, origin exposure if the origin IP leaks (historical DNS records, mail
    headers, or a `cpanel.` subdomain pointing straight at it — a real and very common leak),
    and stale content confusion.
71. **Secrets Manager / Vault** — Ends passwords-in-config. Opens: it's a new single point of
    total compromise, and if it's down, nothing can start.
72. **Certificate Automation (ACME)** — Ends cert expiry. Opens: rate limits, DNS-challenge
    dependency, and renewal failures that are silent for 89 days.
73. **Deploy Pipeline / CI** — Repeatable releases, rollback. Opens: the pipeline has production
    credentials and is the highest-value target in the building.
74. **Container Registry / Package Mirror** — Supply-chain control. Opens: stale mirror serving
    known-vulnerable packages forever.
75. **Ticketing/Helpdesk System** — Turns chaotic customer anger into a manageable queue with
    an SLA timer. Opens: nothing technical, but it's a real building with real cost.
76. **Billing System** — Automates invoicing, dunning, suspensions. Opens: a bug that suspends
    paying customers (catastrophic and 100% real), and PCI scope.
77. **Provisioning Automation** — New customer live in 60 seconds instead of 2 hours of staff
    time. The single biggest margin lever in shared hosting. Opens: automated provisioning means
    automated abuse signup at scale.

### 4.2 Network and facility

78. **Top-of-Rack Switch** — Opens: it's the SPOF for the rack unless you buy two and run LACP/MLAG.
79. **Core Switch Pair / Router** — Opens: firmware bugs, and a stack-failover that isn't seamless.
80. **Firewall (stateful)** — Opens: state table exhaustion under SYN flood, asymmetric-routing
    drops after failover, and a rule list nobody dares clean up ("what does rule 47 do?" "nobody
    knows, don't touch it").
81. **VLAN Segmentation / Private Network** — Limits lateral movement post-breach. Opens: complexity
    and a misconfigured trunk that silently joins two networks that should never meet.
82. **Cross-Connect** — Physical fiber to another tenant or carrier. Costs a monthly recurring fee
    per connect (a genuinely annoying real cost) plus an install fee.
83. **Second Transit Provider (multihoming)** — Survives an upstream failure. Requires your own
    ASN and IP space, BGP knowledge, and doubles your commit costs. Opens: route leaks *you* cause.
84. **IX Port / Peering** — Cheap, low-latency traffic to local networks. Opens: a peer's
    misconfiguration becoming your problem.
85. **IP Space (/24, /22)** — A capital asset that appreciates (IPv4 scarcity is real money now).
    Opens: **reputation is attached to addresses** — buy a cheap block and inherit its blacklist
    history, a fantastic buyer-beware mechanic.
86. **UPS String** — Bridges the gap to generator start. Opens: batteries degrade invisibly and
    need capacity testing; a failed UPS in bypass is worse than no UPS.
87. **Generator + Fuel Contract** — Survives long outages. Opens: monthly test cost, fuel polishing,
    start-battery maintenance, and the ATS as a new single point of failure.
88. **ATS / Static Transfer Switch** — The device whose entire job is redundancy and which is
    itself unredundant unless you buy two.
89. **A+B Power Feeds** — Real redundancy only if every device is dual-corded AND the two cords
    go to different PDUs on different feeds. The game must track this per-device and expose
    "effective redundancy" as a computed stat, because the gap between *bought* redundancy and
    *effective* redundancy is where real outages live.
90. **CRAC / CRAH Units (N+1)** — Cooling capacity as a hard cap on how much compute a room can
    hold. Ties compute density to a facility constraint.
91. **Hot/Cold Aisle Containment + Blanking Panels** — Efficiency upgrade; raises usable capacity
    and lowers the power bill via PUE. The unglamorous build with the best ROI.
92. **Fire Suppression (pre-action / inert gas)** — Required, expensive, and see threat #48.
93. **Badge Access + Cameras + Mantrap** — Physical security. Opens: nothing, but it's a compliance
    gate, and it slows down your own techs (a small ongoing time tax — accurate!).
94. **Loading Dock + Staging Room + Spare Parts Cage** — Inventory of cold spares. Capital tied up
    vs. mean-time-to-repair. Direct, tunable tradeoff.
95. **Meet-Me Room** — Lets you sell cross-connects to tenants. A high-margin revenue line that
    makes your facility stickier (carrier density attracts more tenants — a real network effect).

### 4.3 Staff (people are buildables and they are the most important ones)

96. **Junior Sysadmin** — Cheap, handles tickets, occasionally causes an outage. Grows into a
    senior if you invest in training and don't burn them out.
97. **Senior SRE** — Expensive, prevents outages, halves MTTR, and is the only one who can safely
    perform "risky" actions. Bus-factor risk if they're your only one.
98. **Network Engineer** — Required for BGP/peering builds. Idle most of the time, indispensable
    once a year.
99. **DBA** — Turns "the database is slow" from a mystery into a fix. Adds index/query-tuning
    actions that no one else can do.
100. **Security Engineer** — Unlocks hardening actions, incident response, and vulnerability
     triage. Costs money and produces no visible revenue — the classic budget-cut victim, and
     the game should make cutting them *feel* fine for 30 days and then not.
101. **Support Tier 1 / Tier 2** — Queue throughput. Tier 1 deflects; Tier 2 solves. Under-staffing
     Tier 2 makes Tier 1 escalate everything to engineers, which destroys engineering velocity —
     a real and very satisfying second-order effect.
102. **Datacenter Tech / Remote Hands** — Either on staff (fixed cost, instant response) or
     contracted (per-incident cost, 30-minute-to-4-hour delay). A pure build-vs-buy decision.
103. **The On-Call Rotation** — Not a person, a *schedule*. Requires enough people that nobody is
     always on. Burnout meter rises for whoever is paged; a one-person rotation is a slow-motion
     resignation.
104. **Documentation / Runbooks** — An investment of staff time that reduces MTTR for everyone and
     immunizes you against bus-factor loss. Decays if not maintained (stale runbooks are worse
     than none — they send you confidently in the wrong direction).
105. **The Account Manager** — Reduces enterprise churn, catches problems before they become SLA
     claims, and upsells. The one hire an engineer-player will resist and shouldn't.

---

## 5. Unlocks and Discovery

The sysadmin truth about learning: **nobody buys a solution before they've had the problem.** You
don't install monitoring because it's best practice; you install it because you were down for six
hours and didn't know. So the tech tree should be **scar-driven**: most unlocks are earned by
suffering, not by spending research points.

### 5.1 Scar-driven unlocks (pain → capability)

106. **Cert expires once → "Certificate Expiry Dashboard" unlocks; expires twice → ACME automation
     unlocks.** The game literally rewards you for the mistake, which is exactly how careers work.
107. **First "everything is green but customers are down" → unlocks Synthetic Transaction Monitoring.**
108. **First backup restore failure → unlocks the Restore Drill action and the "Verified Backup"
     badge.** Until then, backups show a checkmark and the player has no reason to doubt it.
109. **First slowloris → unlocks the event-driven reverse proxy.** The player literally cannot buy
     nginx as a defense before they've met the attack that requires it, which makes the purchase
     *mean* something.
110. **First OOM kill of the database → unlocks memory limits, `oom_score_adj`, and the swap-tuning
     panel.**
111. **First correlated batch drive failure → unlocks "Mixed-Vendor Procurement" policy** (costs
     more per drive, removes correlated failure). A policy unlock, not a building.
112. **First breach → unlocks the entire Forensics branch** (log retention, FIM, immutable audit
     trail, the timeline reconstruction minigame).
113. **First RBL listing → unlocks Outbound Mail Monitoring, per-account send rate limits, and the
     Delisting Request action.**
114. **First alert-fatigue-induced miss → unlocks Alert Tuning, dependency-aware suppression
     ("don't page me about 40 children of a dead router"), and severity tiers.**
115. **First bad fleet-wide Ansible run → unlocks canary deploys and `--limit`.**
116. **First split-brain → unlocks quorum/witness node and fencing (STONITH).** With a nice bit of
     flavor text about why it's called "shoot the other node in the head."
117. **First BGP incident → unlocks RPKI/ROA signing and prefix filters.**
118. **First health-check flap cascade → unlocks slow-start, connection draining, and outlier
     ejection.**
119. **First chargeback wave → unlocks fraud scoring.**
120. **First key employee quits → unlocks Documentation as a first-class buildable and the
     Offboarding Checklist (which retroactively prevents threat #29).**

### 5.2 Milestone unlocks (scale → capability)

121. **10 customers** → Ticketing system, basic billing.
122. **50 customers** → Provisioning automation; manual provisioning becomes untenable by design
     (the staff-time math should visibly stop working).
123. **100 customers** → Abuse desk as a distinct queue; you now have enough customers that some
     of them are bad.
124. **Your own /24 + ASN** → BGP, multihoming, peering branch.
125. **Second facility** → Replication topology, GSLB, and the quorum problem.
126. **First petabyte stored** → Tiered storage, dedupe, and the archive/restore-cost tradeoff.
127. **First enterprise contract** → SLA engine, account management, change control board.
128. **Own the building** → Facility branch (power, cooling, fire, physical security, colo sales).

### 5.3 Discovery mechanics (things you find, not buy)

129. **Asset Discovery Scan** — Run a network scan of *your own* estate and find: three servers
     nobody knew were still running, a test VM with a public IP and no firewall, an old staging
     database with a copy of production customer data, and a switch with default credentials.
     **Discovering your own infrastructure is a real, humbling, recurring exercise.** This should
     be an action the player can run any time, and it should always find something.
130. **Cable Tracing** — In facility levels, a minigame that reveals what's actually plugged into
     what, correcting the (wrong) logical map you've been playing on. The map you believe is not
     the map that exists.
131. **The Undocumented Dependency** — Some connections on the map are hidden until they break.
     E.g., you decommission an "unused" server and three unrelated services die because it was
     quietly running the internal DNS secondary. Reveal it in the post-mortem.
132. **Log Archaeology** — Spend staff time reading old logs to discover an earlier compromise or
     the true start time of a slow degradation. Unlocks the "how long have they been in here"
     answer, which changes the whole incident's cost.
133. **Vendor Advisory Feed** — Subscribing (a cheap build) gives you advance warning on zero-days:
     you see the threat wave form one turn earlier. Information as a defensive structure.
134. **Threat Intel Sharing / Peer Network** — Join an operator community; other players'/NPCs'
     incidents become your early warnings. Great multiplayer or meta hook.
135. **Post-Mortem Writeup** — After each incident, spending time writing it up converts the event
     into a permanent small buff (a "lesson learned" modifier) AND a reputation gain if published.
     **Blameless post-mortems literally as an XP mechanic.**
136. **The Runbook Library** — Every incident type you've survived and documented becomes a
     one-click response next time, at reduced MTTR. The knowledge tree *is* the progress bar.
137. **Chaos Engineering Lab** — Deliberately break things in a controlled window to discover
     hidden dependencies before they discover you. Costs a small planned outage; prevents a large
     unplanned one. A very satisfying "pay now or pay later" purchase.
138. **Load Testing Rig** — Reveals the *actual* breaking point of your stack (the game shows you a
     real number instead of a guess), and also reveals which component fails first — which is
     almost never the one you expected.
139. **Tabletop Exercise** — Practice an incident with staff, no infrastructure involved. Reduces
     human error during the real thing. The cheapest defensive build in the game.
140. **Postcard from the Future / Capacity Forecast** — Once you have enough monitoring history,
     unlock trend projection: "at current growth, the DB disk fills in 41 days." Turns reactive
     play into proactive play, which is the whole arc of becoming a senior engineer.

### 5.4 Tech tree branch shapes

- **Availability branch** — redundancy, failover, HA pairs, quorum, multi-region. Expensive,
  defensive, and each step adds a new failure mode of its own (the central irony of HA).
- **Performance branch** — caching, CDN, query optimization, HTTP/2-3, compression. Directly
  feeds the visitor economy.
- **Security branch** — hardening, segmentation, detection, response. Produces no revenue and
  prevents losses you'll never see. Must be made emotionally rewarding via near-miss telemetry
  ("your WAF blocked 4,102 attempts this week" — the dopamine of prevented harm).
- **Efficiency branch** — density, automation, power/cooling, overselling ratios. The margin game.
- **Scale branch** — orchestration, config management, multi-tenancy, provisioning. Turns linear
  staff cost into sublinear.
- **Commercial branch** — SLAs, upsells, support tiers, partnerships, reseller programs.
- **Resilience/Human branch** — documentation, on-call health, training, hiring, retention.
  Crossing branches should matter: *automation reduces burnout*, *documentation reduces MTTR*,
  *monitoring makes security detection possible*. Model the cross-links explicitly.

---

## 6. Economy, Money, and Scoring

The sysadmin's economic worldview: hosting is a business where **the marginal cost of a good
customer is near zero and the marginal cost of a bad one is unbounded.** Everything interesting
in the economy flows from that asymmetry.

### 6.1 Revenue streams

141. **Recurring hosting fees (MRR)** — The spine. Monthly tick. Varies by plan tier.
142. **Setup / onboarding fees** — One-time, offsets acquisition cost.
143. **Overage billing** — Bandwidth, storage, and CPU overages. A revenue line that *also*
     generates support tickets and churn, so maxing it is not optimal.
144. **Domain registration + renewals** — Tiny margin, enormous stickiness. Owning the customer's
     domain makes them ~3x less likely to leave. A strategically underpriced product.
145. **SSL certificate sales** — Dying business (free ACME killed it), but enterprise customers
     still buy EV/OV. Model a product line that decays over the campaign — a nice touch of
     industry realism.
146. **Managed services upsell** — "We'll patch, monitor, and back up your site." Highest margin,
     highest staff cost, best churn reduction.
147. **Migration services** — One-time fee, wins customers from competitors.
148. **Colo / rack space / power** — Billed per U and per amp. Power is often the real product;
     you sell space and you're actually selling kilowatts.
149. **Cross-connect MRR** — Pure margin once the fiber is run.
150. **IP address leasing** — Your unused /24 is a rentable asset.
151. **Backup / DR as a service** — Charge for storage and for restores.
152. **Professional services / consulting hours** — Lumpy, non-scalable, saves a bad quarter.
153. **Reseller wholesale** — Volume at thin margin with hidden risk.
154. **Overselling** — Sell 10TB of "unlimited" on 2TB of real capacity. Increases revenue per
     node dramatically. The game should let the player set an **oversell ratio slider** per node,
     with real consequences: higher ratio = more revenue and a rising probability of resource
     contention incidents. This is the single most honest mechanic you can put in a hosting game.

### 6.2 Costs (the part players underestimate, exactly like real operators)

155. **Capex: hardware** — Depreciated over 36-60 months. Introduce a depreciation schedule so
     players feel the difference between "we bought it" and "we can afford it."
156. **Opex: power** — Billed per kW, plus PUE overhead for cooling. In a real facility, power is
     often the largest line item. The player should be able to see kW next to every rack.
157. **Bandwidth: 95th percentile transit** — NOT total transfer. Bill on the 95th percentile of
     5-minute samples, which means **five hours a month of unlimited free burst** and a single
     sustained six-hour spike that costs you for the month. This is a wonderfully gamey real
     billing model: it rewards smoothing traffic and punishes sustained spikes specifically.
     A DDoS that you absorb rather than drop can cost real money even with zero downtime.
158. **Commit vs burst** — Commit to 10Gbps for a discount; overage above commit is punitive; under
     commit you pay anyway. Classic capacity-planning bet.
159. **Cross-connect / IX port MRR**, **remote hands per incident**, **cabinet rental**.
160. **Software licenses** — cPanel per-account pricing (which went from flat to per-account and
     reshaped the entire shared-hosting industry — that could literally be a mid-campaign event),
     virtualization, monitoring, backup, OS support subscriptions.
161. **Staff salaries + on-call stipends + overtime** — the dominant cost at small scale.
162. **Support cost per customer** — varies wildly by segment; the $3 customer who opens 4 tickets
     a month is unprofitable and the player should be able to *see that* in a per-customer P&L.
163. **Abuse handling cost** — staff time per report. Scales with bad customers, not with revenue.
164. **Chargebacks + payment processing fees + failed-payment dunning.**
165. **SLA credits** — a direct revenue reversal tied to measured uptime.
166. **Insurance** (cyber liability, business interruption), **legal**, **compliance audits**.
167. **Spare parts inventory carrying cost.**
168. **Technical debt interest** — a literal recurring cost line that grows with every "temporary"
     fix, unpatched system, and undocumented change. Pay it down with refactor/cleanup actions.
     Making debt a *visible monthly expense* is the most valuable thing this game could teach.

### 6.3 Cash-flow mechanics (not just profit)

169. **Net-30/60/90 terms** — Enterprise customers pay late. You can be profitable and insolvent
     simultaneously. Model a cash balance separate from P&L; running out of *cash* ends the run
     even if the business is "healthy."
170. **Annual prepay discount** — Trade margin for cash now. A genuinely useful lever in a crunch.
171. **Hardware financing / leasing** — Converts capex to opex at a premium. Lets you grow faster
     with worse unit economics. The classic hosting-company growth trap.
172. **The Refund Window** — Customers in their first 30 days can leave with a full refund, so
     acquisition spend is at risk until they cross that line.
173. **Involuntary Churn (failed cards)** — A shockingly large share of real churn is just expired
     credit cards. A "dunning" upgrade (retry logic + reminder emails) recovers a chunk of it —
     the highest-ROI, least-glamorous feature in any subscription business.
174. **Seasonality** — Q4 spikes for e-commerce customers; summer lull; January signup surge.

### 6.4 How specific entities move money

- A **visitor served fast** → micro-revenue + reputation tick + crawl-budget credit.
- A **visitor bounced** → lost micro-revenue + a small negative reputation tick (and a bigger one
  if they bounced on a cert error, which is a *trust* failure not a *speed* failure).
- A **customer churned** → MRR removed permanently + a review with a chance to suppress signups.
- A **customer upgraded** → MRR increase, usually triggered by good performance or a support win.
- A **DDoS absorbed** → transit overage cost, even with zero downtime. Sneaky and true.
- A **DDoS that lands** → downtime cost + SLA credits + churn + reputation.
- An **abuse incident** → staff hours + possible IP reputation damage affecting *all* customers.
- A **hardware failure** → parts + remote hands + downtime + possibly a data loss event.
- A **great post-mortem** → reputation *gain* that can exceed the outage's reputation loss.
- A **senior engineer hired** → cost now, fewer incidents later (a delayed-payoff investment the
  game should make legible via an "incidents prevented" counter).
- A **security build** → pure cost until the day it isn't. Show a running "estimated losses
  prevented" figure so the player can justify it to themselves.

### 6.5 Scoring and end-of-level rating

Rate the player like an actual operations review, not like a shooter:

175. **Uptime (the nines)** — Show it the honest way: 99.9% = 43m/month, 99.99% = 4.3m/month. The
     difference between three and four nines should cost roughly an order of magnitude more to
     achieve, exactly as it does in life.
176. **MTTD / MTTR** — Time to detect and time to restore, tracked per incident. Detection time is
     the more damning metric and players will initially ignore it.
177. **Error budget** — Borrowed from SRE and perfect for a game: you get a monthly budget of
     allowed downtime. Spend it on shipping features fast; blow it and you're forced into a change
     freeze. Elegantly converts the availability/velocity tension into a resource.
178. **Change failure rate** — % of deploys that caused an incident.
179. **Customer satisfaction / NPS** — driven by support responsiveness and comms during incidents.
180. **Churn rate + net revenue retention.**
181. **Gross margin per node** — are you actually making money on that box?
182. **Power efficiency (PUE)** — facility-tier score.
183. **Security posture score** — derived from actual config state (open ports, patch lag, shared
     credentials, segmentation), not from what you bought.
184. **Toil ratio** — % of staff time spent on manual repetitive work vs. improvement work. A
     high-toil company is a doomed company even when the graphs look fine. Great late-game metric.
185. **Bus factor** — minimum number of people whose departure breaks a subsystem.
186. **End-of-level letter grade with an incident report**: "3 incidents, 41 minutes total
     downtime, 1 preventable, MTTD 19 minutes (industry median: 6), 2 SLA credits issued,
     $14,200 net. Grade: B-." Plus one pointed sentence of feedback from your fictional CTO.

### 6.6 Win / lose conditions

- **Win:** survive the level's duration with cash > 0, uptime above the level's SLA threshold, and
  reputation above the churn-spiral floor. Bonus objectives for margin, security posture, zero
  data loss, and zero preventable incidents.
- **Lose — Cash Death:** you run out of money. The most common real death.
- **Lose — Reputation Spiral:** reputation drops below a floor, signups stop, churn accelerates,
  and revenue decays past recovery. Slow and terrifying — the player should be able to *see* it
  coming for several turns and fight it.
- **Lose — Data Loss Event:** an unrecoverable loss of customer data. Instant credibility death.
  This should be the one failure state the game treats as unforgivable, because it is.
- **Lose — Upstream Termination:** your transit provider or datacenter terminates you for abuse
  after repeated unhandled complaints. You are evicted from the internet.
- **Lose — Legal/Compliance:** a breach of regulated data with no controls in place; fines exceed
  your ability to pay.
- **Lose — Total Staff Attrition:** everyone burns out and quits. No buildings are broken; nobody
  is left to run them. A genuinely novel and very real failure state.

---

## 7. Core Gameplay Mechanics

### 7.1 The central loop: the dependency graph IS the map

The single best design decision available here: **the map is not terrain, it's a topology.**
Objects are nodes, links are edges, and both visitors and threats traverse edges. Latency is edge
weight. Blast radius is graph reachability. Everything flows from this.

187. **Two-directional pathing** — Visitors enter at the "internet cloud" edge and must reach the
     **Conversion Node** deep inside your topology (for an e-commerce customer, that means
     traversing edge → web → cache → DB → payment → mail). Threats enter from the same cloud and
     seek the **most vulnerable reachable node**. Your defenses sit on the shared edges, which is
     precisely why every defense has a false-positive cost. Same road, opposite intents.
188. **Latency budget as visitor HP** — Each visitor carries a millisecond budget drawn as a
     draining bar. Every node it passes through subtracts its current response time. Reach the
     conversion node with budget left = revenue. Hit zero = bounce. This makes *every* engineering
     decision legible: adding a hop costs budget; adding a cache refunds it.
189. **Capacity as concurrency slots, not HP** — Servers don't have hit points; they have a fixed
     number of worker slots and a queue. Requests occupy a slot for their service time. Queue
     full = 503. This models reality far better than damage, and it makes **queueing theory
     visible**: as utilization approaches 100%, queue wait time goes vertical. The player will
     *feel* the hockey stick at 80% utilization, which is the most important intuition in ops.
190. **Saturation cascade** — When one node saturates, retries and timeouts push load onto its
     neighbors, which saturate, and so on. Cascading failure should be an emergent property of
     the queue model, not a scripted event. Circuit breakers and load shedding are the builds
     that interrupt the cascade (by deliberately failing fast — the counterintuitive lesson that
     **serving errors quickly is better than serving nothing slowly**).
191. **Blast radius preview** — Hover any object and the game highlights, in red, every other
     object that dies with it. This one UI feature would teach more architecture than a textbook.
     The player designing to *shrink the red* is the entire strategy game.
192. **Effective vs nominal redundancy** — Every "redundant" pair displays a computed effective
     redundancy that accounts for shared power feeds, shared switches, shared racks, shared
     facility, and shared human. A pair of servers in the same rack on the same PDU shows
     "Redundancy: 1.0 (shared PDU)". The moment the player sees that, they get it.
193. **The alert queue** — Incidents arrive as alerts, not as visible enemies. The player must
     *triage*: which alert is the cause and which are symptoms. Dependency-aware alerting (an
     unlock) collapses 40 alerts into 1 root cause. Before that unlock, the flood itself is the
     enemy.
194. **Actions cost time, not mana** — Every response (restart a service, fail over, call remote
     hands, roll back) has a duration. Staff are the parallelism limit: two engineers means two
     concurrent actions. This makes staffing the real resource and makes 3am feel like 3am.
195. **The change window** — Risky actions performed during peak traffic have a higher chance of
     causing a secondary incident and a much higher cost if they do. Scheduling is a mechanic.
196. **Runbook cards** — Documented procedures become playable cards with reduced time and
     failure chance. Undocumented responses are improvised: slower, riskier, and they consume
     more of the engineer's focus meter.
197. **Toil tax** — Manual/repetitive work consumes staff time every tick until automated. A player
     who never automates finds their entire staff capacity eaten by upkeep, unable to respond to
     anything. This is the honest depiction of an under-automated ops team.

### 7.2 Connecting objects — concrete interaction design

This is the question the brief specifically asks, so here are several concrete schemes, with the
recommendation up front.

**RECOMMENDED: "Patch Panel" drag-cabling with typed ports.**
198. Every object renders with visible **ports on its edges**, and ports are *typed and colored*
     the way real cabling is:
     - **Blue = data/LAN** (front of the object)
     - **Yellow = fiber/uplink**
     - **Red = power** (rear, always two if dual-PSU)
     - **Grey/green = out-of-band / management**
     - **White = console/serial**
     You click-drag from a port to a port. The cable renders as a real cable with a little bit of
     slack and drape, snapping into place with a satisfying click. **A connection is only valid
     between compatible port types** — you physically cannot plug a power cable into a switch
     port, which teaches the model without a tutorial. Wrong-but-plausible connections (a server's
     both PSUs into the same PDU) ARE allowed, because that mistake is the lesson.
199. **Cable Management as a real, scored thing** — Unruly cabling accumulates a "spaghetti"
     penalty: remote-hands actions in that rack take longer and have a chance to knock out a
     neighboring cable ("while replacing the drive, the tech bumped the uplink"). A **Cable
     Management pass** costs staff time and clears the penalty. Every single datacenter person
     will make an involuntary noise of recognition at this, and it makes tidiness mechanically
     worth doing.
200. **Logical layer toggle** — Because physical cabling gets unreadable fast at scale, a hotkey
     flips the whole map between **Physical view** (racks, cables, power) and **Logical view**
     (services, dependencies, traffic flow). The two views can *disagree*, and the disagreement
     is the bug. E.g., logical view shows two independent web servers; physical view shows both
     plugged into the same ToR switch. Making the player reconcile the two views is a genuinely
     original and deeply authentic mechanic.
201. **Firewall rules as gates on the cable** — Right-click a link to open a rule list. Rules are
     ordered, first-match-wins, and the player can see live counters of packets hit per rule. A
     rule with a zero counter after 30 days is a rule you can probably delete — and the game
     should let you discover that the one you delete was the one that only matters in December.
202. **VLAN painting** — Drag a color across ports to assign a VLAN. Segmentation becomes literally
     coloring in your network. A threat that lands can only spread along same-colored links, so
     segmentation's value is visually obvious.
203. **Alternative/complementary scheme — "Wiring Mode" (`W` key)** — Dims the map, shows only
     ports, lets you drag many cables rapidly, then exit. Reduces misclicks during normal play.
     Good for mobile/controller support too.
204. **Alternative — click-to-link with a "requires" list** — Select a web server, see its
     "Requires: [DB] [Cache] [DNS] [Storage]" checklist, click each unfilled requirement, then
     click a candidate object. Slower but unambiguous. Best as the accessibility/simplified mode.
205. **Adjacency bonuses without adjacency requirements** — Objects in the same rack get a small
     latency bonus (shorter cable, same switch) and a large correlated-failure penalty. Placement
     matters but doesn't gate connectivity. Avoids the tedium of pure adjacency puzzles while
     keeping physical layout meaningful.
206. **How a connection is represented once made:** a persistent cable with (a) a color for type,
     (b) a **thickness** that reflects provisioned capacity (1G vs 10G vs 40G), (c) **animated
     flow particles** whose density is current utilization and whose color indicates health
     (green normal, amber queuing, red erroring), (d) a small label badge on hover with live
     stats (Mbps, pps, errors, latency), and (e) **visible error state**: a link with CRC errors
     shows tiny red sparks at one end — the exact end with the bad optic. Diagnosis becomes a
     visual act.
207. **Dependency ghosting** — Select any node and all of its transitive dependencies glow, with
     the *unexpected* ones (dependencies you didn't intend, like everything depending on the one
     internal DNS box) highlighted in warning yellow. This is how the player discovers their own
     architecture.

### 7.3 Placement, upgrades, resources

208. **Rack units as the placement grid** — Objects occupy 1U/2U/4U. Racks are 42U. You must also
     respect **power budget per rack** (amps) and **thermal budget** (kW), so a rack can be
     physically empty and functionally full. Three simultaneous constraints on one grid is a
     genuinely good puzzle space, and it's exactly the real one.
209. **Weight limits on raised floor** — a joke that is also real, for battery and storage arrays.
210. **Upgrade paths, not upgrade levels** — Instead of "Web Server Lv3," upgrades are *specific
     and named*: +RAM, +NVMe, 10G NIC, second PSU, newer CPU generation, OS major version. Each
     changes a different stat and some are mutually exclusive (this chassis fits 8 drives OR 2
     GPUs). Real procurement is a shape-fitting problem, not a level-up.
211. **Maintenance state** — Objects can be put into **drain** (stop accepting new connections,
     finish existing ones) before maintenance. A player who reboots without draining drops
     in-flight visitors. Teaches graceful shutdown with one button.
212. **Patch lag as a visible per-object stat** — days since last patch, with a color ramp. When a
     zero-day drops, the map lights up by patch lag and the triage order is immediately visual.
213. **Resource types:** Cash, Staff-hours (parallel action capacity), Power (kW), Cooling (kW),
     Rack space (U), Bandwidth (Gbps + 95th percentile tracker), IP addresses, Reputation, Error
     budget, and **Focus** (a per-engineer meter that depletes during incidents and recovers with
     rest — the anti-burnout resource).
214. **Failure states that are partial** — The most authentic thing this game can do is make most
     failures *degradations* rather than binary down states: slow, flapping, intermittent, working
     for 80% of users, working except for uploads, working except from one country. Binary
     up/down is the rarest kind of outage in real life and the most common kind in games.
215. **The "Is It Actually Down?" check** — A recurring mechanic where an alert may be real, a
     monitoring artifact, or a problem on the *reporter's* end. Investigating costs time;
     assuming costs credibility. Real triage in one decision.
216. **Time controls** — pause, 1x, 2x, 4x, with **automatic pause on new severity-1 alert**.
     Tower defense pacing needs this and ops pacing demands it (long boring stretches punctuated
     by frantic minutes — lean into that rhythm rather than fighting it).
217. **The Night Shift** — Overnight hours run at high speed with reduced staff availability. You
     can schedule risky maintenance there (safer for customers, worse for your engineers' focus
     meters). The game's day/night cycle is a genuine strategic axis.
218. **Post-incident replay** — After every incident, scrub a timeline showing the causal chain,
     including what was happening *before* you noticed. The learning tool and the reward screen
     in one.

---

## 8. Visuals and Presentation

Guiding principle from the sysadmin chair: **the aesthetic of hosting is blinkenlights, cable
color-coding, and dashboards at 3am.** Lean into the real visual language of the field — it's
already gorgeous and nobody has mined it. And build readability around the one thing ops people
actually do: **scan for the thing that is the wrong color.**

### 8.1 Art style

219. **Isometric rack-and-room** with clean, slightly stylized hardware. Not cartoon-cute, not
     photoreal — think "technical illustration with personality." Servers have front bezels,
     drive caddies, and rear I/O that are *legible*, because recognizing "that's a 2U storage
     chassis" at a glance is part of the fantasy.
220. **Palette drawn from the real thing** — dark room, the deep blue-black of an unlit cold aisle,
     punctuated by green/amber status LEDs, the blue of a UPS display, the sodium-orange of an
     emergency light, and the sickly white of the one overhead fluorescent above the work bench.
     Money is green, danger is amber-then-red, and *nothing else in the game is allowed to be
     amber or red*. That color discipline is what makes a busy screen readable.
221. **Blinkenlights as the primary telemetry** — Every server has an activity LED whose blink
     rate is its real request rate, a drive-activity LED per bay, and a network LED per port.
     Before you open a single graph, the room *sounds and looks* like its load. A room under
     attack has one rack strobing. This is the game's signature visual and it's free realism.
222. **Cable color coding** as described in §7.2, consistently applied, including the bad case:
     a rack cabled by someone in a hurry is visibly ugly and the ugliness is mechanical.
223. **Wear and grime** — Old hardware yellows, gathers dust in the intake, and its LEDs dim.
     A server's age is readable at a glance. Dust buildup as a literal thermal debuff with a
     "filter cleaning" maintenance action.
224. **Two rendering registers**: the **Room** (physical, warm, tactile, where you feel scale) and
     the **Board** (logical topology, flat, diagrammatic, clean lines — like a network diagram
     come to life). Toggling between them is the core visual pleasure of the game.
225. **CRT/terminal UI chrome for the HUD** — monospaced numbers, thin rules, subtle scanline on
     panels only (never on the world). Grafana-dark aesthetic for dashboards, because that IS
     the aesthetic of the profession.

### 8.2 What infrastructure looks like

226. **Web server** — 1U pizza box, calm green LED, a small icon halo showing its worker slots as
     a ring of segments that fill up like a parking lot. Full ring = queueing.
227. **Database server** — 2U, more drive bays, a heavier presence, a subtle "heartbeat" pulse at
     transaction rate. When locked, the pulse stalls visibly — you can *see* a lock contention.
228. **Cache node** — small, glowing, almost weightless; visually "hot" (a warm halo) that literally
     cools down and dims when cache hit rate drops. Cold cache = visibly cold.
229. **Load balancer** — a splitter/prism shape at the front of the topology; incoming particle
     streams visibly fan out to backends, and the fan is *uneven* if weights or health are off.
     You can see an imbalance before any graph tells you.
230. **Firewall** — a gate with visible rule slats; blocked packets hit it and produce a tiny
     spark and a counter tick. A rule that never fires has a dusty, unused look.
231. **Storage array** — a wall of drive bays, each with its own LED. A failed drive shows amber;
     a rebuilding array shows a slow sweeping progress light across the whole face, and the array
     visibly "strains" (heat shimmer, slower activity elsewhere). **The rebuild is a visible,
     stressful, watchable event**, which is exactly what it is in life.
232. **Switch** — port LEDs across the face, blink patterns matching real traffic, and an
     error-counter overlay that shows a red tick at the exact port with CRC errors.
233. **UPS** — a battery bank with a charge meter and a runtime-remaining readout that only becomes
     important once, and then is the most important number on screen.
234. **Generator** — outside the building, dormant, with a visible fuel gauge. When it starts, the
     whole scene gets a subtle vibration and the lighting shifts (the room goes to generator
     lighting — a distinct, slightly wrong color). Unforgettable.
235. **CRAC unit** — visible airflow (subtle particle drift through the cold aisle). When cooling
     fails, the airflow stops and a heat shimmer creeps up the racks from the bottom. Temperature
     is shown as a **thermal overlay** view — a literal heatmap of your room.
236. **Racks** — front and rear views (flippable!), with the rear being where the real mess is:
     power cords, network cables, and the airflow. Half of datacenter work happens at the back of
     the rack and no game has ever shown it.
237. **Cross-connects** — fiber runs overhead in ladder racking, glowing faintly, disappearing into
     the meet-me room.
238. **The internet cloud** — the map's spawn edge, rendered as a churning, restless boundary you
     never fully see into. Threats and visitors both emerge from it. It should feel like weather.

### 8.3 What threats look like

240. **Scanner swarm** — grey static drizzle, each mote briefly touching a port and vanishing.
241. **Brute force** — a persistent little unit tapping repeatedly at a door, with a visible attempt
     counter. When fail2ban trips, it gets yanked backward off-screen with a satisfying snap.
242. **SYN flood** — half-drawn connection arcs that never complete, stacking up as a visible
     thicket of unfinished lines in front of the target. Beautiful and instantly legible.
243. **Amplification DDoS** — a single small unit that fires a thin thread at a distant reflector,
     which returns a *torrent* of thick traffic. The visual explains the mechanic with no text:
     the attacker is tiny, the payload is enormous, and it arrives from somewhere else.
244. **Slowloris** — many thin, slow tendrils that latch onto connection slots and just... hold.
     No motion, no noise. The scariest visual in the game precisely because it's so quiet, while
     the bandwidth graph in the HUD stays flat and green.
245. **Layer-7 flood** — a focused beam aimed at one specific endpoint, rendered as a bright line
     that goes *past* your cache and lands directly on the database. You can see it bypassing.
246. **SQL injection** — a serpentine thing that slips along the web→DB cable rather than flying
     at the server. If it reaches the DB, the DB's face goes briefly transparent and you see rows
     of data being siphoned out along the wire toward the internet cloud. Data exfiltration should
     look like *theft*, visibly, in transit.
247. **Webshell** — after the attack resolves, a small dark glyph remains embedded in the web
     server's file icon. It's easy to miss. It pulses once every 30 seconds. Later, when it wakes
     up, that pulse is the "oh no" moment.
248. **Cryptominer** — the infected server's fans visibly spin up, its thermal overlay goes bright,
     and the load ring is full while the request-rate LED is idle. **The visual contradiction IS
     the diagnosis.**
249. **Outbound spam** — a stream of envelope particles leaving your mail server and going *out*
     to the cloud, gradually turning the cloud's edge red as reputation degrades. You watch your
     own reputation being spent.
250. **Botnet** — thousands of tiny distinct silhouettes (cameras, routers, DVRs, a fridge) rather
     than a uniform mass. Recognizable junk hardware = instant thematic read.
251. **Nation-state actor** — no swarm at all. A single, slow, dark unit that moves deliberately,
     ignores your loud defenses, and probes quietly. It doesn't attack when you're watching. It
     should never be flashy; the horror is how ordinary it looks.
252. **Ransom DDoS** — the attack stops, and an email notification arrives with a countdown timer
     pinned to the HUD. The threat becomes a *UI element*, which is unnerving in the right way.
253. **Hardware failures** — erupt *from inside*, not from the cloud edge. A drive fails: its bay
     LED goes amber and a soft alarm tone begins (and the tone should be a real, annoying,
     continuous chassis beep that the player will want to make stop — a small piece of genuine
     emotional truth).
254. **Power events** — the room's lighting is the health bar. Grid loss: everything flickers and
     goes to UPS lighting. Generator start: a rumble and a shift to generator lighting. Total
     loss: **actual darkness with only the amber emergency lights and the sound of fans spinning
     down.** That silence should be the most frightening thing in the game.
255. **Cert expiry** — the padlock icon on the affected service turns into a broken padlock and
     every arriving visitor visibly *recoils* at the front door and turns around. No damage
     numbers needed.
256. **DNS failure** — visitors arrive at the cloud edge and then mill around, unable to find the
     entrance at all. Your buildings are fine and nobody can find them. Perfect metaphor.
257. **The alert wall** — When a cascade happens, alerts stack up the right side of the screen
     fast, with dependency-aware grouping collapsing them into one when you've unlocked it. The
     *visual difference* between 40 alerts and 1 alert is the reward for that upgrade.

### 8.4 What visitors look like

258. **Visitors as small directed figures/packets** with a **patience bar** that is their entire
     silhouette — a figure that visually shortens/dims as latency drains. At zero they pop into a
     little "bounce" puff and a tiny red minus-sign floats up.
259. **Segment-coded silhouettes**: mobile visitors are small and fast-moving with a weak signal
     icon; desktop regulars walk steadily and carry a small cache icon (visibly making their
     second visit cheaper); checkout whales carry a glowing cart and are visually *precious*;
     API clients are angular, mechanical, and come in trains; crawlers are spider-ish and carry a
     clipboard.
260. **The conversion moment** — when a checkout visitor reaches the conversion node, a coin/receipt
     animation and a real, satisfying sound. The whole game's dopamine should be here, not in
     killing things. **This is what distinguishes it from every other tower defense: the reward
     loop is on the *letting through*, not the *shooting down*.**
261. **False positive visualization** — when your WAF or rate limiter blocks a real visitor, that
     visitor bounces with a distinctive **amber** flash and a "blocked by your own defense"
     micro-icon. A stream of amber flashes at your firewall is the player *seeing* their own
     over-tuning. No dashboard needed.
262. **Word of mouth** — a well-served visitor occasionally drops a small glowing token at the exit
     that spawns friends later; a badly-served one drops a grey one that suppresses a future
     spawn. Reputation becomes a visible object in the world.

### 8.5 UI / HUD

263. **The Status Bar (top)** — Cash, MRR, Reputation, Uptime-this-month, Error budget remaining,
     Staff availability (N of M idle), and a live requests/sec sparkline. Everything else is a
     drill-down.
264. **The Rack Elevation panel** — a scrollable front/rear elevation of any rack, showing U
     positions, occupancy, power draw per outlet against the breaker limit, and a thermal gradient
     up the face. Exactly like the real rack diagrams everyone maintains in a spreadsheet.
265. **The Grafana Panel** — an in-game dashboard with real-looking time-series: requests/sec,
     p50/p95/p99 latency (teach percentiles! p99 is where the pain is and the average hides it),
     error rate, CPU/memory/disk, replication lag, queue depth. The player should learn to read
     graphs. Make the graphs *actually diagnostic* — the shape of the curve should tell you what
     kind of problem it is (a sawtooth = memory leak + restart; a step change = a deploy; a
     flat-topped plateau = you hit a limit, not a demand ceiling).
266. **The "everything is green" trap** — Sometimes the dashboard is entirely green and the business
     is failing. Synthetic monitoring and RUM are the unlocks that close that gap, and the game
     should let the player sit in that trap at least once.
267. **The Terminal** — an optional in-game shell for power users. Typing `top`, `df -h`, `dmesg`,
     `tail -f`, `iostat`, `ss -s` returns stylized, *game-accurate* output. This is both a
     diagnostic tool and enormous flavor. Advanced players who diagnose via terminal get faster
     answers than the GUI provides; casual players never need it. A perfect optional depth layer.
     `df -h` showing 40% free while writes fail is the inode puzzle, delivered perfectly in-fiction.
268. **The Ticket Queue** — a helpdesk panel with customer messages written in real customer voice:
     "my site is down" (it isn't), "URGENT!!! please respond", "hi, quick question, can you make
     my site faster", and one well-written ticket with a full traceroute that you should
     immediately promote to a priority.
269. **The Status Page** — a player-facing *and* public-facing artifact you update during
     incidents. Writing a good update is a small interaction (pick tone + detail level) with real
     reputation consequences. Vague corporate-speak loses trust; specific honesty gains it.
270. **The Pager** — a distinct sound and a distinct UI intrusion. Page severity should be visually
     and audibly different from a normal alert. And the game should let you *snooze* one, which
     is where the trouble starts.
271. **Readability at scale** — At tier 6+ individual servers become too small. Solution: **the
     map aggregates automatically by zoom level** — servers → racks → rows → rooms → facilities —
     and each aggregate shows the *worst* status of its children. Zooming is drilling down into
     a problem. A red row at max zoom-out means exactly one thing: something in there is on fire,
     go look. This is the same way real NOC wallboards work.
272. **Overlay views (hotkeys)**: Traffic, Thermal, Power, Patch lag, Blast radius, Security
     posture, Cost-per-object, Age/warranty, VLAN/segmentation, Latency contours. One map, ten
     lenses. Switching lenses should be instant and is the core "reading the situation" verb.
273. **The Night Mode of the room** — At in-game night the room lighting dims and the LEDs become
     the dominant light source. It is beautiful and it makes the 3am incidents feel like 3am.
274. **Money visualization** — Revenue trickles in continuously as tiny particles from converted
     visitors into a counter; costs leave on the monthly tick as a visible, chunky debit. Seeing
     the power bill hit as a single large outflow while revenue arrives as a thin steady stream
     is emotionally accurate and instructive about margin.
275. **The Post-Mortem Screen** — full-width timeline with the causal chain rendered as a
     left-to-right graph: root cause → contributing factors → detection → response → resolution,
     with the gap between "started" and "detected" highlighted in a color that makes you feel bad.

---

## 9. Anything Else

### 9.1 Modes

276. **Campaign ("From Basement to Backbone")** — The tier 1→8 ladder, with narrative beats: the
     first customer, the first outage, the first hire, the first firing, the first acquisition
     offer.
277. **Incident Mode (roguelike-lite)** — Randomized incident, randomized stack you didn't build,
     limited actions, scored on MTTR. Short sessions. This is the daily-challenge mode, and it's
     genuinely great practice.
278. **Sandbox / Architect Mode** — Unlimited money, build a topology, then press **"Chaos"** and
     watch it get tested. Shareable topologies. This mode alone could have a community around it.
279. **Historical Scenarios** — Thinly-veiled recreations of famous real outages: the DNS provider
     DDoS that broke half the web, the BGP route leak that took a country offline, the cert-root
     expiry, the S3 typo, the airline that couldn't reboot. Each with a "could you have done
     better?" scoring comparison. Educational, hilarious, and instantly recognizable.
280. **Co-op NOC** — 2-4 players share one infrastructure, each with a role (network, systems,
     security, support) and **asymmetric information** — the network engineer can see interface
     errors the sysadmin can't, the support person sees customer reports nobody else sees.
     Communication is the actual gameplay. This is an extremely strong multiplayer concept because
     it's literally what a NOC is.
281. **Red vs Blue / Versus** — One player attacks, one defends. Attacker has a budget and picks
     techniques; defender doesn't know which. Asymmetric and tense.
282. **Competitive Market Mode** — Multiple hosting companies in one market, competing for the same
     visitor/customer pool, with the option to poach customers after a rival's public outage.
     Schadenfreude as a mechanic.
283. **Hardcore / Ironman** — One save, no undo, permadeath. Because ops people are like that.
284. **Zen Mode** — No threats. Just build a beautiful, well-cabled, well-labeled datacenter. There
     is a real audience for this and it costs almost nothing to ship.

### 9.2 Twists and hooks

285. **"It's Always DNS"** — A running gag with teeth: a meaningful percentage of incidents should
     genuinely resolve to DNS, and the game should track a counter. The achievement for the 50th
     DNS incident is called *"I Told You."*
286. **The Uninterpretable Log Line** — Occasionally a log message appears that means nothing to
     anyone, is unrelated to the incident, has appeared in every log since 2011, and can never be
     fixed. It's just there. Forever.
287. **The Server That Must Not Be Rebooted** — One inherited machine with 1,847 days of uptime.
     Nobody knows if it will come back up. It's running something important. Rebooting it is an
     explicit, terrifying player choice with a genuine coin flip attached. (It also has 200
     unpatched CVEs.)
288. **The Load-Bearing Intern Script** — A cron job called `fix.sh` that someone wrote in 2019
     that keeps the whole billing system working, and which nobody understands.
289. **Technical Debt as a visible, growing pile** — A literal pile of sticky notes/cable spaghetti
     in the corner of the room that gets taller. When it's tall enough, things start falling out
     of it at random.
290. **The Vendor Rep** — A recurring NPC who tries to sell you an appliance that solves a problem
     you don't have, at a price you can't afford, with a demo that's very impressive. Sometimes
     they're actually right. Skepticism must be calibrated, not absolute.
291. **The Conference Talk** — Submit a post-mortem as a talk. Costs an engineer a week, gains
     enormous reputation and makes hiring cheaper. Ops culture rendered as a mechanic.
292. **"Works On My Machine" Card** — A one-time-use card that resolves an incident by pure luck
     and teaches you nothing. Using it increases the chance of recurrence.
293. **The Vacation Mechanic** — When a key engineer is on vacation, their subsystem's response
     times double. Forcing people to take vacation (and surviving it) is a resilience *test*,
     exactly like real cross-training. "Nobody may touch prod while Dave is at the beach."
294. **The Hardware Autopsy** — A failed component can be inspected to learn *why* it failed
     (bad capacitor batch, firmware bug, thermal). Learning the cause can preempt the next eight
     failures of the same batch. Turns a loss into information.
295. **Cable Label Printer** — A cheap, tiny purchase that permanently reduces remote-hands errors.
     Every single ops person will buy it immediately and feel deeply seen.
296. **The Beeping Server** — A minigame where something in the room is beeping and you must find
     which of 84 machines it is. Play it for real: the audio pans as you move the camera.
297. **The Missing Screw** — You cannot rack the server. There is one screw. Where is the screw.
298. **The Suspicious Uptick at 4am** — A recurring pattern the player can learn to recognize
     across levels: certain attacks always start at a certain in-game hour because that's when
     the operator's home country is asleep.
299. **Documentation Rot** — Runbooks visibly yellow and fade over time; using a stale one gives
     you a *worse* outcome than improvising. Maintenance of knowledge as upkeep.
300. **The Compliance Theater Meter** — Some security purchases improve your audit score and your
     actual posture; some improve only the audit score. The game lets you buy either, and
     explicitly grades them separately at the end. Brutal, honest, funny.
301. **The "It Was Fine In Staging" Incident** — A specific, recurring incident class where the
     difference between staging and production (data volume, cache warmth, network topology, TLS,
     a missing environment variable) is the root cause. Investing in staging *parity* reduces it.
302. **The One Customer Who Is Always Right** — Occasionally a customer's bizarre bug report that
     everyone dismisses is the earliest signal of a real, subtle problem. Rewarding the player for
     taking weird reports seriously is a wonderful, true lesson.
303. **Seasonal Events** — Patch Tuesday (monthly), the end-of-quarter change freeze, the annual
     holiday moratorium, a summer heatwave that strains cooling and raises power prices, the day
     a major CVE lands, and the one week a year the fire marshal visits.
304. **"Everything Is On Fire" Screensaver** — Idle for two minutes and the game switches to a
     NOC-wallboard view of your own infrastructure. It's a screensaver of your company running.
305. **Achievements with ops-culture names** — *"It Was DNS"*, *"Works In Prod Only"*, *"Restored
     From Tape"*, *"Four Nines, One Year"*, *"Nobody Got Paged"* (survive a month with zero
     out-of-hours pages — arguably the hardest and most meaningful achievement in the game),
     *"Blameless"* (publish 10 post-mortems), *"The Rebuild"* (recover fully from total
     compromise), *"Bus Factor Three"*, *"I Read The Runbook"*, *"Load Bank Tested"*.
306. **Real Uptime Leaderboard** — Global scoreboard measured in nines, with the honest note that
     the top of the board is mostly people who ran nothing.

### 9.3 Meta / educational angle

307. **Teaching layer** — Every real concept the game models gets a one-paragraph, jargon-accurate
     "Field Notes" entry, unlocked by encountering it. Over a campaign the player accumulates a
     genuinely useful little encyclopedia of operations. This game could be the best hosting
     education tool ever made *as a side effect of being fun*, and that's a legitimate hook.
308. **"Was that real?" tag** — Every event carries a small marker distinguishing "this is a real
     failure mode" from "this is a game simplification." Ops people love being told the truth
     about what's simplified, and it builds credibility with the exact audience that will evangelize
     the game.
309. **Import Your Own Topology** — Let players sketch (or import) a diagram of a real system and
     run chaos scenarios against it. Half toy, half genuinely useful architecture review tool.
310. **Community Scenario Editor** — Players build incidents. The best community content in this
     genre would be recreations of outages people personally lived through, and every ops person
     has one they want to tell you about.

### 9.4 Tone

The comedy should be **recognition comedy**, never parody. The funniest thing in hosting is how
mundane the catastrophes are: a $3 part, a forgotten renewal, a typo, a screw. The game should
respect the work — the people in it are competent and the systems are genuinely hard — and get
its laughs from truth. Tonally: *Papers, Please* meets a rack elevation diagram, with the warmth
of a team that's been through some things together.

The emotional arc the game should deliver, which is the real arc of the job:
**panic → process → prevention → boredom, and learning that boredom is the highest achievement.**

---

*End of sysadmin-lens idea dump. ~310 numbered ideas across the nine categories.*

---
---

# PART II — The Hosting-Type Variety Engine (sysadmin lens)

> The brief was expanded mid-drafting: "hosting" means **any** kind of hosting, and the *type* of
> hosting is a first-class per-level variable. This part re-walks all nine categories through that
> lens. From the ops chair this is the best idea in the brief, because it's true: **the word
> "hosting" covers a dozen completely different jobs that only look similar from the outside.**
> A shared-hosting admin and a tape-vault operator and a GPU-farm engineer share almost no daily
> reality. What they share is a rack, a power bill, and a pager.
>
> Design rule for the whole variety engine: each hosting type should change **which resource is
> scarce**, **which failure is fatal**, and **who the customer is.** Change those three and
> everything else reshapes itself.

## The Scarcity Table (the spine of the whole thing)

| Hosting type | Scarce resource | Fatal failure | Customer is | Unit of sale |
|---|---|---|---|---|
| Shared web | Concurrency slots / IOPS | Mass compromise via panel | Thousands of tiny accounts | An account |
| Managed WordPress | Staff attention | A plugin update breaking 800 sites | Agencies | A site |
| VPS / cloud | RAM (always RAM) | Hypervisor escape / host node death | Semi-technical individuals | An instance |
| Dedicated / bare metal | Rack space + provisioning time | Hardware with no hot spare | Technical customers with root | A server |
| Colocation | **Power and cooling** | Facility-level power event | Other companies' engineers | A cabinet + amps |
| Game servers | **Latency + tick budget** | Sustained DDoS during prime time | Communities + kids with allowances | A slot / a server |
| Voice / SIP | Jitter + packet loss | Toll fraud | Businesses + carriers | A channel / a DID |
| Email | **IP reputation** | Blacklisting | Everyone, cheaply | A mailbox |
| DNS (anycast) | Query capacity + global reach | Total resolution failure | Domains by the million | A zone |
| CDN | **Egress bandwidth** | Cache poisoning / origin exposure | Content owners | A TB served |
| Object storage | Disk + durability math | Silent data loss | Developers, backup vendors | A GB-month |
| Backup / DR | **Restore time**, not storage | An unrestorable backup | Everyone's worst day | A GB + an RTO |
| Tape vault | Physical logistics | Losing a tape, or a fire | Regulated industries | A slot + a courier run |
| Video / streaming | Egress + transcode CPU | A live event failing live | Publishers, creators | A viewer-hour |
| GPU / AI compute | **Power density and cooling** | Thermal event / GPU theft | Researchers, startups | A GPU-hour |
| HPC / render farm | Job scheduling + interconnect | A 40-hour job dying at hour 39 | Studios, labs | A node-hour |
| Crypto mining host | Power price | Power price going up | Volatile, non-sticky | A kW |
| Kubernetes / PaaS | Control-plane stability | A bad operator reconciling everything to death | Dev teams | A workload |
| Serverless | Cold-start latency | Noisy multi-tenant blast radius | App devs | An invocation |
| DBaaS | IOPS + durability | Data corruption | App teams | An instance + IOPS |
| Bulletproof | **Upstream tolerance** | Losing your transit | Criminals and dissidents alike | Deniability |
| Regulated (HIPAA/PCI/FedRAMP) | Audit evidence + staff clearance | A finding | Compliance officers | A certified environment |
| Dial-up ISP (period) | Modems in the bank + phone lines | Busy signals | Households | An hour / a line |
| Satellite ground station | Sky windows / pass schedules | Missing a pass | Constellation operators | A pass |
| Edge / 5G MEC | Site count + physical security | A site being unreachable | Carriers | A PoP |

---

## 1'. Levels and Scenarios — one per hosting type

311. **"The Mass Host" (shared web, 800 accounts/box)** — Density is the whole game. You are
     fighting for IOPS and concurrency, and every customer is a stranger's PHP. Introduces
     **overselling ratio**, per-account cgroup caging, and the fact that one account's `find /`
     is everyone's outage. The map is a single box zoomed *in*, showing accounts as tenants.
312. **"Four Hundred Identical Sites" (managed WordPress)** — Your fleet is a monoculture. Your
     superpower is that one fix fixes everything; your nightmare is that one vuln breaks
     everything. Level mechanic: **the Update Button**. Pressing it patches 400 sites and breaks
     an unknown 2% of them. Not pressing it leaves 400 sites exploitable. Staged rollout is the
     unlock, and the level exists to teach it.
313. **"Node 14 Is Full" (VPS)** — RAM is the binding constraint and overcommit is the temptation.
     Live migration is the hero tool (move a VM off a dying host with no downtime) and also the
     villain (a migration storm saturating the storage network). Introduces the host-node as a
     blast radius: one node dying takes 60 customers at once.
314. **"Root Is Theirs" (dedicated servers)** — The level's twist: **you cannot fix your customers'
     boxes.** You can only see traffic, power, and IPMI. When a customer's server starts attacking
     someone, your options are: email them, null-route them, or power them off via IPMI. That's
     it. A level entirely about acting through a keyhole.
315. **"Amps and Aisles" (colocation landlord)** — Your customers are *other engineers* who bring
     their own gear into your building. You sell **space, power, cooling, and cross-connects**,
     and you control none of what's in the cabinets. Threats become: a tenant overloading a
     circuit, a tenant blocking a hot aisle with a badly-placed switch, a tenant's unsecured
     cabinet, a tenant whose "remote hands, please reboot rack 7" request is ambiguous, and a
     tenant who quietly runs a mining rig that blows your power budget. **Carrier density is your
     product**: the more networks in your meet-me room, the more tenants you attract — a genuine
     network-effect mechanic that grows slowly and then compounds.
316. **"Cage Match" (wholesale / build-to-suit)** — You're building shells for one enormous tenant.
     The game becomes construction, lead times, commissioning, and a single customer who can walk.
     Slow, capital-heavy, terrifyingly concentrated.
317. **"Prime Time" (game server hosting)** — The most different level in the game. Everything
     happens between 6pm and midnight local. The metric is not uptime, it's **tick rate and ping**
     — a server that is "up" at 140ms is dead to the customer. Threats: booters aimed at a single
     match (players buy attacks to win), cheat-client scanners, a DDoS aimed at *one player's* IP
     that hits your whole box, and a mod update day that breaks every server at once. Customers
     are 14-year-olds with community Discords who will move 200 players to a competitor over one
     laggy weekend. Loyalty is brutal and instant. **Latency contours on the map are the terrain.**
318. **"The Launch Window" (game hosting, scenario)** — A new game launches at midnight. Demand is
     either 10x or 0.1x your forecast and you find out at 12:01. Pre-provision (waste) or
     scale-on-demand (too slow). Pure capacity-gamble scenario.
319. **"Busy Signal" (dial-up ISP, 1997)** — Period level, period aesthetics. Scarce resource is
     **modems in the modem bank and phone lines from the telco**. Customers get busy signals when
     you oversubscribe; your ratio (lines to subscribers) is the entire economy. Threats: a telco
     outage, a modem card dying, a war-dialer, a user who stays connected 24/7 to hold their line
     (the "always-on abuser" — genuinely a thing), and AOL mailing 40 million CDs. Visuals go
     beige-and-CRT. The support queue is a *phone* queue with hold music.
320. **"The Shell Box" (BBS / shell accounts / IRC leaf, period)** — A single multi-user UNIX box
     with actual humans logged in. Threats are local: a user compiling a fork bomb, a `.rhosts`
     file, someone running an IRC bot that gets your whole server DDoSed off the net by a rival
     channel takeover. The scale is tiny and the stakes are personal. Wonderful tutorial level
     with real character.
321. **"The Usenet Feed" (period, hilarious)** — Your scarce resource is **disk and inbound
     bandwidth**, both consumed by a firehose you cannot slow down, mostly of binaries nobody
     admits to wanting. Retention days is your product. A great absurdist level.
322. **"Postmaster" (email hosting)** — The scarce resource is **reputation**, which is held by
     other people and can be destroyed by one customer. Buildables: SPF/DKIM/DMARC, reverse DNS,
     feedback loops with the big mailbox providers, outbound rate limits, a dedicated warm-up IP
     pool, spam filtering (which itself has false positives that lose real mail — the classic
     tradeoff, and losing a real email is worse than receiving spam). Threats: a compromised
     mailbox, a customer buying a list, backscatter, an RBL listing, a mailbox provider silently
     deprioritizing you with no notification at all. **The level's cruelty: you can be perfect and
     still be blocked, and nobody will tell you why.**
323. **"Authoritative" (anycast DNS hosting)** — You are infrastructure for infrastructure. Scarce
     resource: global PoP capacity. Threats: massive amplification attacks (you're a reflector
     *and* a target), a water-torture/random-subdomain attack designed to blow past your cache and
     hammer your backend, a DNSSEC signing mistake that takes out every zone you host, and a
     customer's zone change that breaks their business and becomes your ticket. The stakes: when
     you go down, **hundreds of other companies go down**, publicly, with your name attached.
324. **"Edge" (CDN)** — Scarce resource is egress. Your product is proximity. Mechanics: cache
     hit ratio is the single number that decides your profitability; purge propagation time is a
     customer-visible feature; origin shielding protects your customers' origins; and **origin IP
     leakage** undoes all of it. Threats: cache poisoning, a customer with a 2% hit ratio
     destroying your margins, a flash crowd, and a legal takedown that must propagate to 80 PoPs.
325. **"Eleven Nines" (object storage)** — The level about **durability math**. Replication factor
     vs. erasure coding vs. cost. Silent corruption and scrub cycles. The nightmare: a bug in the
     software layer that corrupts consistently across all replicas, which redundancy cannot save
     you from. Customers never notice you until the day they do.
326. **"Restore Point" (backup / DR hosting)** — The product is not storage, it's **restore time**.
     Level scoring is on RPO and RTO, not uptime. Threats: a customer whose backups silently
     stopped 6 months ago, ransomware reaching into backup shares, a restore that runs slower than
     the customer's business can survive, and the discovery that a customer's "backup" was of the
     wrong volume. Signature scenario: **a customer calls at 4am having lost everything, and you
     find out live whether the last year of green checkmarks meant anything.**
327. **"The Vault" (offsite tape / archival)** — Physical logistics as gameplay: tape libraries,
     robot arms, barcode labels, courier runs, offsite rotation schedules, media degradation, and
     the fact that you must maintain a *drive that can still read 2009 tapes*. Threats: a tape
     that doesn't verify, a courier losing a case, a fire, a robot arm jamming, and a media format
     going end-of-life. Utterly different rhythm from every other level: slow, procedural, and
     with an air of a library. Beautiful contrast piece.
328. **"Going Live" (video / live streaming)** — Zero tolerance for failure because it's *live*.
     Scarce: transcode CPU/GPU and egress. Mechanics: bitrate ladders, transcode queues that back
     up, a redundant ingest path, and the fact that adding transcode quality costs viewers on slow
     connections. Threats: an ingest failure mid-event, a stream key leak (someone hijacks the
     broadcast), a DMCA on a live feed, and a viewer count 10x forecast. No do-overs.
329. **"Rack 4 Is 40 Kilowatts" (GPU / AI compute)** — The level where **power density breaks the
     building.** A GPU rack can draw what an entire row of web servers drew. Introduces liquid
     cooling, rear-door heat exchangers, power capping, and the reality that you cannot fill your
     cabinets because you'd melt them. Threats: thermal runaway, a PSU sag under synchronized load
     (all GPUs ramping at once is a genuine electrical event), driver/firmware incompatibility
     bricking a fleet, GPU theft (they're worth more than cars — physical security becomes a real
     buildable), and customers whose jobs run for 3 weeks and cannot be interrupted. Economics:
     brutal capex, insane demand, and an obsolescence clock ticking loudly.
330. **"Hour 39" (HPC / render farm)** — Job scheduling as tower defense. Jobs are long, stateful,
     and unkillable without loss. A node failing at hour 39 of a 40-hour job destroys everything
     unless you built checkpointing. The interconnect (InfiniBand/RDMA) is a new failure class:
     one bad cable slows the *whole cluster* because everything waits on the slowest rank.
331. **"Hashrate" (crypto mining hosting)** — Pure power arbitrage. Your customer is volatile, your
     revenue tracks a price chart you don't control, your gear is fire-prone and your neighbors
     hate you. Includes the very real mechanic of **demand-response contracts** (get paid to
     shut down during grid peaks). Boom-bust level with a bust guaranteed.
332. **"The Control Plane" (Kubernetes / PaaS)** — Your customers deploy anything, constantly. The
     failure mode is exquisitely modern: **a reconciliation loop doing exactly what it was told,
     everywhere, instantly.** An etcd quorum loss, a bad admission webhook that blocks all deploys
     including the fix, a CrashLoopBackOff storm, a namespace with no resource limits eating a
     node. Threats come from your own automation being *too good at its job*.
333. **"Cold Start" (serverless / functions)** — Scarce: warm capacity. The tension between
     cost (scale to zero) and latency (cold starts). Threats: a recursive function that invokes
     itself and bills you $40,000 in 9 minutes; a single tenant's burst starving others.
334. **"The Managed Database" (DBaaS)** — You run the thing that cannot lose data, for people who
     will write terrible queries against it. Mechanics: automated failover (which sometimes fires
     when it shouldn't), point-in-time recovery, major version upgrades with a maintenance window
     your customers will not accept, and a customer whose missing index takes down a shared node.
335. **"Anything Goes" (bulletproof hosting)** — Very high revenue, extreme risk. Every customer
     is an abuse report. The game systems flip: instead of *preventing* abuse you're *absorbing*
     it — managing upstream relationships, rotating IP space, and deciding where your actual line
     is. The pressure comes from transit providers, registrars, payment processors, and eventually
     law enforcement, not from hackers. A genuinely uncomfortable, genuinely interesting level
     about the fact that infrastructure has politics. Failure state: **deplatformed** — no
     transit, no payments, no domains.
336. **"In Scope" (PCI / HIPAA / FedRAMP regulated hosting)** — The threat is a clipboard.
     Everything you build is either in scope or out of scope, and scope is the resource you
     manage. Mechanics: segmentation to shrink scope, evidence collection as an ongoing staff
     cost, quarterly scans, annual audits, background-checked staff, and a change-control board
     that slows every action. The reward: contracts nobody else can bid on.
337. **"Exchange Colo" (financial low-latency)** — A comedy of physics: cable length is literally
     regulated to be equal for all tenants, microseconds are the product, and a customer will pay
     enormous money for a cabinet three meters closer to the matching engine. Introduces
     nanosecond-scale thinking and a market where fairness is enforced by *cable spool*.
338. **"Pass Window" (satellite ground station hosting)** — Your customers need the dish at exactly
     the 11-minute window their satellite is overhead. You cannot reschedule the sky. Scarce
     resource: antenna time. Threats: weather (rain fade), RF interference, a motor failure on the
     dish, and two customers wanting overlapping passes. Scheduling puzzle with an immovable clock.
339. **"Eighty Little Sites" (edge / 5G MEC)** — Instead of one datacenter you have 80 closets in
     cell towers and shopping centers, each with 4U of gear, no staff, flaky power, and a 4-hour
     drive between them. Everything must be remotely recoverable or it's a truck roll. The whole
     level teaches **operational leverage at low density.**
340. **"The Seedbox Farm"** — Storage boxes with very high sustained I/O and, ahem, legally
     interesting traffic. Cheap, dense, DMCA-heavy, and the customers are technically savvy and
     price-obsessed. A fun, scrappy low-tier level.
341. **"IoT Backend"** — Millions of tiny devices with terrible firmware, all reconnecting at the
     same second after a blip (**thundering-herd reconnect storm** — a real, brutal failure mode),
     all with certificates that expire on the same day because they were provisioned in one batch.
342. **"Blockchain Nodes"** — Storage grows forever, sync takes days, and the network can hard-fork
     under you. A level about a workload you cannot pause, prune, or reason with.

### Cross-type structural levels

343. **"Diversify"** — Run two lines of business at once (say, shared hosting + game servers) on
     shared infrastructure. They compete for the same racks and staff and have *opposite* peak
     hours (web peaks midday, games peak at night) — which is actually a synergy and the player
     should discover it. Mixed portfolios smooth your utilization curve. That is a real, clever,
     true business insight rendered as a mechanic.
344. **"Pivot"** — Your main line of business is dying (shared hosting margins collapse; cPanel
     changes its pricing; crypto crashes). Convert your fleet to a new type. Old hardware fits
     the new workload badly. A whole level about the cost of transition.
345. **"The Junk Hardware Acquisition"** — You buy a failing competitor and inherit their gear:
     mixed vendors, no documentation, three control panels, out-of-warranty chassis, and 200
     customers on a platform you'd never build. Decide what to migrate, what to keep running as a
     legacy island, and what to switch off (and which customers you lose doing it).
346. **"The Landlord and the Tenant"** — A two-sided level where you are a colo landlord AND one of
     your tenants is a hosting company you also run. Your two halves have conflicting interests.
     Deliciously structural.
347. **"Everything, Everywhere"** — Late campaign: multiple business lines across multiple regions,
     where the skill is no longer technical, it's **portfolio and attention management**. You
     cannot look at everything; you must choose what to watch.

---

## 2'. Threats by hosting type

348. **Game hosting: "The Grudge Booter"** — An attack aimed at a *single player's* game session
     that collaterally kills the whole server. Counter: per-player IP obfuscation/proxying, which
     costs latency — the thing you sell. Perfect tradeoff.
349. **Game hosting: "The Cheat Vector"** — Not an attack on you; an attack on the *game* hosted
     by you. Customers blame you for cheaters. Counters are anti-cheat integrations you don't
     control.
350. **Game hosting: "Mod Update Day"** — A dependency you don't own updates and breaks 900 server
     instances simultaneously at a time chosen by someone else.
351. **Game hosting: "The Empty Server Spiral"** — A server that dips below a population threshold
     empties out and never recovers. Reputation failure specific to communities.
352. **Voice/SIP: "Toll Fraud"** — Attackers brute-force a SIP extension at 2am Friday and dial
     premium-rate international numbers all weekend. You get the carrier bill on Monday for
     $60,000. **The attack that costs money directly and instantly**, the fastest-bleeding threat
     in the game. Counters: geo-dialing restrictions, spend caps, anomaly detection, strong
     extension passwords.
353. **Voice/SIP: "Jitter and One-Way Audio"** — Degradations invisible to every uptime check.
     NAT/firewall misconfiguration causing RTP to flow one direction only. Customers report "they
     can hear me but I can't hear them," which is a routing problem, not a phone problem.
354. **Email: "The Snowshoe Spammer Customer"** — Signs up for 40 small accounts across your range
     to spread low-volume spam under thresholds. Detecting the pattern requires looking across
     accounts, not at any one.
355. **Email: "The Silent Deprioritization"** — A major mailbox provider starts throttling you with
     no bounce, no notice, no appeal. Delivery just gets slower. You find out from customers.
356. **DNS: "Water Torture"** — Random-subdomain queries that can't be cached and must be resolved,
     hammering the authoritative backend behind the cache. The attack designed specifically to
     beat the defense.
357. **CDN: "Cache Poisoning via Header"** — An unkeyed header lets an attacker store a malicious
     response for everyone. One request, global impact.
358. **CDN: "The 2% Hit Ratio Customer"** — Not malicious. Their content is all unique/dynamic, so
     every request is an origin fetch and you're paying for bandwidth twice. A *profitability*
     threat with no alarm attached.
359. **Object storage: "The Silent Corruption"** and **"The Public Bucket."**
360. **Backup: "The Encryption Key Nobody Has"** — Backups are perfect, encrypted, and
     unrecoverable because the key was on the server that died. The most bitter possible loss.
361. **Backup: "Backup Window Overrun"** — The nightly job now takes 26 hours. Backups overlap,
     compete for I/O, and eventually the chain breaks.
362. **Tape: "The Unreadable Tape"** — Verified at write time, unreadable at restore time, four
     years later, when it's the only copy.
363. **GPU: "Thermal Runaway"** and **"The Synchronized Ramp"** — 400 GPUs starting a job in the
     same second is an electrical event, not a compute event. Also **"Driver Roulette"**: a
     firmware/driver combination that works on 90% of your fleet.
364. **GPU: "GPU Theft"** — Physical. Cards walk out. Chain-of-custody, cameras, and tamper-evident
     cabinets become real buildables with real ROI.
365. **HPC: "The Slow Rank"** — One node running 5% slow makes the entire parallel job run 5% slow,
     and finding which node is a needle-in-haystack diagnostic.
366. **Kubernetes: "The Admission Webhook Deadlock"** — A broken webhook blocks all deployments
     including the deployment that would fix the webhook. Self-locking failure. Chef's kiss.
367. **Kubernetes: "etcd Quorum Loss"** — The control plane can't decide anything; workloads keep
     running but nothing can change, including failing over.
368. **Serverless: "The Recursive Invocation Bill."**
369. **Colo: "The Tenant Who Overloads The Circuit"** — Someone else's gear trips a breaker that
     also feeds someone else's gear. Your building, their mistake, your reputation.
370. **Colo: "The Blocked Hot Aisle"** — A tenant leaves a pallet/cart in the containment. Thermals
     drift for a week before anyone connects the dots.
371. **Colo: "Tailgating"** — Someone follows a tenant through the badge door. Physical intrusion
     in a building full of other people's data.
372. **Colo: "The Ambiguous Remote Hands Request"** — "Please reboot the server in rack 7." There
     are nine servers in rack 7. This is a real, daily, expensive problem, and a great minigame.
373. **Bulletproof: "The Upstream Ultimatum"**, **"The Payment Processor Drop"**, **"The Registrar
     Seizure"** — threats arriving from the commercial layer, not the network layer.
374. **Regulated: "The Finding"**, **"The Breach Notification Clock"** (a legally mandated 72-hour
     timer that starts whether or not you understand what happened yet — a superb pressure
     mechanic), **"The Staff Clearance Lapse."**
375. **Dial-up: "The Line Hog"**, **"The Telco Outage"**, **"The Modem Card Death"**, **"The
     War-Dialer."**
376. **Satellite: "Rain Fade"** and **"The Missed Pass"** — the only threats in the game caused by
     weather and orbital mechanics.
377. **Edge/MEC: "The Site With No Remote Access"** — A closet in a shopping mall whose only
     network path is the thing that died. Truck roll: 4 hours, high cost. The player learns to
     buy an out-of-band LTE modem for every site, which is exactly what real operators do.
378. **Universal but type-flavored: "The Upstream Carrier Outage"** — Your transit provider has a
     bad day. For a web host it's an outage; for a game host it's a *routing* problem (players on
     one ISP can't connect and blame you); for a CDN it's a PoP withdrawal; for a satellite
     operator it's a missed pass. **Same event, four different-looking crises.** This is the best
     proof that the variety engine works: reuse the event, reskin the consequence.

---

## 3'. What "a visitor" is, per hosting type

379. **Web host** — a page load with a latency budget. (Part I, §3.)
380. **Game host** — **a player joining a server.** They don't bounce on latency, they *join, play
     badly, and leave angry* — a delayed bounce that also damages the server's population, which
     damages its ability to attract the next player. Visitors that affect *each other* is unique
     to this type and mechanically rich. A full server attracts players; an empty one repels them.
381. **Voice/SIP** — **a call.** It either connects with good audio or it doesn't; quality
     degradation is measured in MOS score, and a bad call is remembered far longer than a bad
     page load. Calls arrive in predictable business-hour patterns with a hard 9am spike.
382. **Email host** — **a message**, arriving in both directions. Inbound must be filtered without
     false positives; outbound must be delivered by strangers who don't owe you anything.
383. **DNS host** — **a query**, billed by the million, cached by resolvers so that your actual load
     is a fraction of the real demand. TTL is literally a throttle you control — a rare case where
     the operator sets how much traffic they receive.
384. **CDN** — **a request at a PoP**, where the interesting event is the cache miss that becomes
     an origin fetch. Your "visitor" spawns a *second* visitor headed inward.
385. **Object storage** — **a GET/PUT**, with the twist that a small number of huge objects and a
     huge number of small objects are completely different workloads on the same product.
386. **Backup host** — **a backup job**: arrives on a schedule, is large, is long-running, and is
     *patient* (it won't bounce, it'll retry). The real "visitor" that matters is the **restore
     request**, which is rare, urgent, and the only one anyone judges you on. Beautiful inversion:
     the traffic you serve constantly is not the traffic you're graded on.
387. **Tape vault** — **a courier**, physically. And a **recall request** with an SLA measured in
     hours-to-truck.
388. **Video/streaming** — **a viewer**, who is an extremely long-lived, bandwidth-heavy connection
     that joins mid-stream and is sensitive to startup time and rebuffering ratio, not to TTFB.
389. **GPU/AI host** — **an inference request** (latency-sensitive, small, spiky) or **a training
     job** (latency-insensitive, enormous, days long). Same customer, opposite requirements,
     competing for the same cards. Excellent scheduling tension.
390. **HPC** — **a job submission** entering a queue with priorities, fair-share, and an angry
     researcher whose job has been pending for 9 hours.
391. **Kubernetes/PaaS** — **a deployment**, which is a visitor that *changes your infrastructure*.
     Your customers reconfigure your platform all day. Terrifying and correct.
392. **Serverless** — **an invocation**, where the first one after idle is slow and the rest are
     fast. Your visitor experience depends on whether another visitor came recently.
393. **Colo** — **a prospective tenant touring the facility.** This is the best visitor idea in the
     brief. They physically walk your building: through the lobby, past the security desk, into
     the meet-me room, down a cold aisle. **They judge what they see**: cable management, labeling,
     spare capacity, a clean floor, the age of your UPS, whether a tech is currently swearing at
     something. Every cosmetic thing the player was tempted to skip is now literally being
     inspected. The tour is a level. Mess in aisle 3 loses a five-year contract.
394. **Wholesale/build-to-suit** — a visitor who arrives once, in a suit, with a lawyer, and whose
     single decision is worth more than a year of everything else.
395. **Regulated** — **an auditor**, who is a visitor with a checklist that walks your evidence
     rather than your network.
396. **Dial-up** — **a dialing subscriber**, who gets either a connect tone or a busy signal. The
     most binary and most nostalgic visitor in the game, complete with handshake sound.
397. **IoT** — **a device check-in**, in populations of millions, all synchronized by accident.
398. **Bulletproof** — a visitor who arrives via encrypted channels, pays in crypto, asks no
     questions, and whose presence is itself a risk. Revenue with a half-life.

### Attracting them, per type
399. **Game host** — server-browser listing quality, a free trial server, one-click modpacks,
     a DDoS-protected badge (the single biggest buying factor in that market), and sponsoring a
     community. Also: **population seeding** — running your own popular server attracts customers.
400. **Colo** — carrier density, tour quality, a good SLA, and *reputation among engineers*. Colo
     is sold by word of mouth between sysadmins more than by marketing, and the game should model
     that as a slow, sticky, engineer-reputation stat separate from consumer reputation.
401. **CDN/DNS** — published global latency numbers and a status page with a long clean history.
402. **Backup/DR** — a published, *verified* restore-time guarantee. Proof beats promises.
403. **GPU** — availability, honestly. In a shortage, having capacity is the entire sales strategy.
404. **Regulated** — certifications are the marketing. The audit *is* the funnel.

---

## 4'. Type-specific buildables

405. **Game hosting: Tick-Rate Optimized Node** — high single-thread clock CPUs, not core count.
     A build that's *worse* on paper and better in practice. Teaches workload-appropriate hardware.
406. **Game hosting: Player-Facing Proxy / IP Masking Layer** — hides individual players' IPs from
     each other, killing the grudge-booter vector at the cost of a few ms.
407. **Game hosting: One-Click Modpack Provisioner** and **Instant Server Rollback** (a save-state
     restore, which is the single most-demanded feature in that market).
408. **Voice: Session Border Controller (SBC)** — the firewall of telephony. Stops toll fraud and
     SIP scanning; introduces a new stateful chokepoint.
409. **Voice: Spend Cap / Destination Whitelist** — a cheap control that prevents the single
     most expensive failure. The player who skips it will only skip it once.
410. **Email: Outbound Relay with Per-Account Rate Limits**, **Feedback Loop Subscriptions**,
     **Warm IP Pool**, **DKIM Signer**, **Spam Filter Cluster** (with a tunable
     aggressiveness slider whose false-positive rate is *displayed*, because losing a real invoice
     email costs more than 200 spams).
411. **DNS: Anycast PoP**, **Response Rate Limiting (RRL)** (stops you being an amplifier),
     **DNSSEC Signer** (and an expiry monitor, because see threat #57), **Secondary DNS with a
     second provider** — the counterintuitive build where the correct answer is "use a competitor
     too."
412. **CDN: PoP**, **Origin Shield**, **Purge Fabric**, **Tiered Cache**, **Cache Key Normalizer**
     (kills cache-buster floods), **Bot Manager** (with its false-positive tax).
413. **Storage: Erasure-Coded Pool**, **Scrub Scheduler**, **Object Lock / WORM** (the
     ransomware answer), **Lifecycle Tiering to Cold Storage** (cheap until someone needs it back).
414. **Backup: Pull-Based Backup Orchestrator**, **Immutable Snapshot Vault**, **Restore Test
     Harness** (the build that converts faith into evidence), **Seed Drive Shipping** (for the
     first full backup — because the network is slower than a van full of disks, which remains
     true and is a great gag with real math behind it).
415. **Tape: Library + Robot**, **Drive Pool**, **Barcode/Labeling System**, **Offsite Courier
     Contract**, **Media Rotation Schedule**, **Legacy Drive Museum** (a real requirement: you
     must keep the ability to read what you stored).
416. **Video: Ingest Redundancy (dual ingest)**, **Transcode Farm**, **Bitrate Ladder Config**,
     **Low-Latency Delivery Path**, **DVR/Recording Storage**.
417. **GPU: Liquid Cooling / Rear-Door Heat Exchanger**, **High-Density Busway**, **Power Capping
     Controller** (trades performance for staying under the breaker — a live, tunable dial),
     **GPU Health Telemetry**, **Tamper-Evident Cabinets + Asset Tracking**, **Job Checkpointing
     Service**.
418. **HPC: Scheduler (Slurm-alike)**, **Low-Latency Interconnect Fabric**, **Parallel Filesystem**,
     **Node Health Check + Auto-Drain** (yank a slow node out of the pool before it poisons jobs).
419. **Kubernetes: Control Plane HA**, **etcd with proper quorum**, **Admission Policy Engine**,
     **Resource Quotas per Namespace**, **Progressive Delivery Controller**.
420. **Colo: Cabinet / Cage / Suite** (three tiers of sellable space), **Busway + Per-Outlet
     Metering** (so you can bill actual amps and catch the overloader), **Meet-Me Room + Cross
     Connect Panel**, **Customer Portal with Power Graphs** (a sales feature and a support-ticket
     deflector), **Escort Policy / Badge System**, **Tour Route** (yes — a build: a clean,
     impressive path through your facility for prospects), **Crash Cart + Shared KVM**,
     **Lockable Cabinet Doors**, **Overhead Ladder Racking**.
421. **Facility (all types): Load Bank** (tests the generator under real load — the boring purchase
     that decides whether threat #44 kills you), **Fuel Polishing System**, **Battery Capacity
     Tester**, **Thermal Imaging Survey** (finds a hot connection before it becomes a fire — a
     periodic maintenance action with a real-world basis), **Water Leak Detection Cable**,
     **Early Smoke Detection (VESDA)**, **Seismic Bracing**, **Redundant Building Entrances for
     fiber** (diverse-path conduit — the thing everyone claims to have and few actually do).
422. **Regulated: Evidence Collection System**, **Change Control Board** (slows all actions,
     reduces change-failure rate — a genuine tradeoff object), **Background-Checked Staff Pool**,
     **Segmentation to Reduce Scope**, **Quarterly Scan Vendor**.
423. **Dial-up (period): Modem Bank**, **Terminal Server**, **RADIUS Auth**, **News Spool**,
     **Mail Spool**, **Telco PRI Lines**, **Shell Server**, **Web Ring Node**. Same mechanics,
     completely different silhouettes — a cheap and delightful way to reuse the engine.
424. **Universal: Out-of-Band LTE/5G Modem per site** — the cheap insurance that turns a truck
     roll into a click. Buy it for every edge site; the player who doesn't will learn.

---

## 5'. Unlocking new lines of business

425. **Business-line unlocks are the second tech tree.** Each new hosting type is a *building
     permit* earned by a prerequisite:
     - Have anycast + multiple PoPs → unlock **DNS hosting** and **CDN**.
     - Have large storage + verified restores → unlock **Backup/DR**, then **Archival/Tape**.
     - Have your own facility + power headroom → unlock **Colocation**.
     - Have power density + liquid cooling → unlock **GPU/AI**.
     - Have low-latency network + high-clock nodes → unlock **Game hosting**.
     - Have clean IP reputation for 12 months → unlock **Email hosting**. (Reputation as a
       *prerequisite* rather than a score is a great twist.)
     - Have compliance staff + segmentation → unlock **Regulated hosting**.
     - Have a legal budget and a high risk tolerance → unlock **Bulletproof**, and permanently
       lose access to certain respectable partnerships. A branch with a door that locks behind you.
426. **Cross-pollination unlocks** — Running a CDN teaches you edge caching, which makes your web
     hosting faster. Running backups teaches you storage economics, which makes object storage
     cheaper. Skills transfer between lines, modeled as small permanent buffs. Encourages breadth.
427. **Type-specific mastery trees** — each business line has its own 6-8 node mini-tree, so
     specializing deep is as viable as spreading wide.
428. **The Era Unlock (retro campaign)** — Start in 1996 as a dial-up ISP and advance through eras:
     dial-up → shared hosting → dedicated → VPS → cloud → containers → GPU. Each era transition
     obsoletes some of your hardware and buildings, changes the aesthetic, changes the customer
     base, and introduces the strategic question **"do we chase this or stay in our niche?"** —
     which is the actual history of the entire hosting industry. This might be the strongest
     single campaign structure available.

---

## 6'. Economy shifts by type

429. **Different margin shapes** — Shared hosting: tiny per-unit revenue, huge volume, margin from
     density and automation. Colo: high fixed cost, very high margin once occupied, and the metric
     is **occupancy rate** (an empty cabinet earns nothing and costs cooling anyway). GPU: enormous
     capex with a 24-36 month obsolescence window, so utilization must be near 100% or you lose.
     Backup: revenue is steady and boring, costs grow forever because nobody ever deletes anything.
     CDN: revenue per TB falls every year forever; you survive on volume and hit ratio.
430. **Occupancy and stranded capacity (colo)** — You can have empty racks and still be full,
     because you're out of power or cooling. **Stranded capacity** should be a visible, painful
     stat: "Rack space used: 41%. Power used: 97%." That single line explains the entire
     datacenter industry.
431. **Power as the real product (colo/GPU)** — Bill per kW committed, not per U. A tenant who
     commits to 5kW and uses 1kW is your best customer. One who commits to 5kW and draws 7kW is a
     crisis.
432. **Demand response revenue (crypto/GPU)** — Get paid by the utility to shut down during grid
     peaks. Real money for doing nothing, at the cost of customer SLAs.
433. **95th-percentile vs. flat-rate vs. per-request billing** — different types bill differently,
     and the player should learn to choose plans that match their traffic shape. A bursty game
     host wants 95th; a steady backup host wants flat; a CDN sells per-TB.
434. **Long contracts vs. monthly** — Colo is 3-5 year contracts (stable, hard to grow fast);
     game hosting is monthly and sometimes hourly (volatile, instantly responsive to quality).
     **Contract length should be a per-type economic personality**, and it changes how fast
     reputation damage becomes revenue damage: a colo landlord feels a bad year two years later;
     a game host feels a bad weekend on Monday.
435. **Deposit and setup fees** — Colo and dedicated take install fees; VPS and shared can't.
436. **The obsolescence clock** — GPU and CPU generations age visibly. Old gear can be re-sold into
     a secondary market, re-purposed for a lower tier of service (yesterday's GPU farm is today's
     rendering budget tier), or run until it dies. **Cascading hardware down your own product
     tiers** is exactly what real operators do and it's a great mechanic.
437. **Type-specific end-of-level scoring** — Don't score every level on uptime:
     - Game host: **p99 latency and tick stability during prime time.**
     - Backup host: **RPO/RTO achieved and restore success rate.**
     - Colo: **occupancy, PUE, SLA adherence, and tenant satisfaction.**
     - CDN: **cache hit ratio and egress cost per GB served.**
     - Email: **inbox placement rate.**
     - DNS: **global resolution success and query latency.**
     - GPU: **utilization percentage and kWh per useful job.**
     - Regulated: **findings count and evidence completeness.**
     - Bulletproof: **survival, and how much of your soul is left** (a literal tongue-in-cheek
       stat).
     Changing the scoreboard per level is the cheapest, strongest way to make each type feel
     genuinely different to play.

---

## 7'. Mechanics that change with hosting type

438. **The scarce-resource meter is type-swapped.** The HUD's primary gauge changes per level:
     concurrency slots, RAM, amps, kW, egress Gbps, tick-rate ms, antenna-minutes, tape slots,
     GPU-hours, or modem lines. **One gauge, many meanings** — cheap to build, huge variety payoff.
439. **Time granularity changes.** Game hosting runs in seconds (a lag spike is an event); backup
     hosting runs in nights (a job window); tape vaulting runs in weeks (a courier rotation); colo
     runs in years (a contract). Varying the clock per level radically changes the feel while
     reusing the engine.
440. **What "pathing" means changes.** Web: a request path through a topology. Game: a network
     route with a latency contour map. Backup: a data flow with a bandwidth and window constraint.
     Colo: a *person* walking through a building. Tape: a physical object moving on a truck.
     Satellite: an orbital pass window. The game should embrace all five and let them share the
     same path-and-obstacle grammar.
441. **Control granularity changes.** In shared hosting you control everything inside the box. In
     dedicated you control nothing above the power cord. In colo you control nothing above the
     cabinet door. **Progressive loss of control as the business scales up** is a genuinely novel
     difficulty axis, and it's true: the bigger the customer, the less you're allowed to touch.
442. **The "you can only act through a keyhole" mode** — For dedicated/colo levels, most of your
     verbs are indirect: email the customer, throttle the port, null-route the IP, cut power,
     send a tech with an escort. Fewer verbs, higher stakes, more thought per action.
443. **Multi-line management** — When running several business types at once, the map gets
     **business-line tabs** and a shared resource pool (racks, power, staff, network). Conflicts
     between lines are the late-game strategy layer: the GPU line wants the power the colo line
     already sold.

---

## 8'. Visual identity per type and per era

444. **Shared/web** — dense 1U rows, green LEDs, calm. The "default" look.
445. **Game hosting** — neon accents, an in-world server browser UI, latency shown as glowing
     contour rings radiating from your PoPs across a world map. The whole level looks like a game
     because it *is* hosting games.
446. **Colo** — the camera pulls out to the *building*: aisles, containment doors, overhead ladder
     racking, and rows of cabinets you can't see inside (tenant gear is deliberately rendered as
     anonymous dark silhouettes behind mesh doors — you can see power draw and port lights and
     nothing else, which is exactly the colo operator's epistemic position).
447. **GPU/AI** — hot, loud, bright. Visible liquid cooling manifolds, thick busway overhead,
     heat shimmer, and a power meter that is always the most prominent thing on screen.
448. **Backup/DR** — cool blues, slow-moving progress bars, a calm nightly rhythm, and a big
     visible "last verified restore: 41 days ago" counter that turns amber as it ages.
449. **Tape vault** — dim, cold, library-like. A robot arm moving in a long dark aisle. Barcode
     labels. The most *atmospheric* environment in the game and completely unlike everything else.
450. **CDN/DNS** — the map becomes the globe. PoPs as points of light, queries as arcs, and an
     attack as a red bloom spreading across regions.
451. **Video/streaming** — a wall of preview thumbnails as your primary monitoring surface, which
     is literally how broadcast ops rooms look.
452. **Satellite ground station** — dishes against sky, a pass-schedule timeline as the main HUD,
     weather overlays.
453. **Dial-up era (1996)** — beige boxes, CRT amber/green terminals, a modem bank with 96 tiny
     blinking lights, a dot-matrix printer logging events, and dial-up handshake audio. The UI
     itself becomes period (text-mode menus, ASCII graphs). **Era as a full visual reskin of the
     same systems** is enormous value for modest art cost.
454. **2005 era** — pizza-box 1U servers, KVM crash carts, cable spaghetti, a wall-mounted MRTG
     graph. **2015 era** — blade chassis, virtualization dashboards. **Modern era** — hyperconverged
     nodes, dark-mode dashboards, everything-as-code.
455. **The consistent readability rule across all skins** — no matter the era or type, the same
     color grammar holds: green = healthy, amber = degraded or self-inflicted, red = failing, blue
     = data at rest, white = a human doing something. A player who learns to read one level's
     screen can read all of them.
456. **Type-specific "attack looks"** — a booter hitting a game server should look different from a
     scanner hitting a web server: a booter is a targeted red lance aimed at one match in progress,
     with the affected players' ping numbers spiking visibly in a scoreboard overlay. **Show the
     customer's experience degrading, not just your server's metrics** — in game hosting, the
     scoreboard IS the damage display.
457. **The Tour Camera (colo)** — a first-person walk mode used for prospect tours and for the
     player's own inspections. Seeing your own facility at eye level, with a stranger's judgment
     attached, is a spectacular way to make cosmetic upkeep mechanically meaningful.

---

## 9'. Extra ideas from the broadened scope

458. **"The Same Outage, Six Ways" mode** — One event (a fiber cut) presented as six short levels,
     one per hosting type, showing how differently the same root cause manifests. A superb
     teaching module and a very cheap content multiplier.
459. **Type-matchup meta** — Some businesses pair beautifully (colo + transit + cross-connects;
     backup + object storage; CDN + DNS) and some conflict (GPU + colo compete for power; email +
     bulletproof are mutually exclusive because reputation is the product of one and the sacrifice
     of the other). A light "synergy/conflict" grid gives the player real portfolio strategy.
460. **The "What Are We Even" identity stat** — Running too many unrelated lines dilutes your
     brand and your engineers' expertise: support quality drops, automation doesn't transfer,
     and your staff's specialization bonuses decay. A gentle force toward coherence that makes
     the diversification decision non-trivial.
461. **Tenant-of-a-tenant recursion** — In a colo level, one of your tenants is a hosting company
     whose own customer is a reseller whose customer is a spammer. The abuse report arrives at
     *you* and must be passed down a chain you cannot see the end of. A brilliant, very real
     piece of internet plumbing rendered as a puzzle.
462. **The "legacy island"** — Every long-running hosting company has one: an old platform, kept
     alive for a handful of customers who pay well and will never migrate. It costs upkeep, it's
     unpatchable, and switching it off means losing them. Model it explicitly; let players carry
     one for the whole campaign as a running cost and a running joke.
463. **The Era-Transition Cutscene** — Between eras, show your own facility aging around you: the
     beige boxes leave, the racks get denser, the lights get LED, the graphs get prettier, and one
     server from 1998 is still there in the corner, still running, still nobody knows why.
464. **The "Type Card" draft mode** — A roguelike run where each level you draft which hosting type
     you'll add next from three offered cards, with your existing infrastructure partially
     transferring. Enormous replayability from the variety engine.
465. **Achievements for the expanded scope** — *"Amps Not Us"* (fill a colo to 100% power with 50%
     space free), *"Restored In Anger"* (complete a full DR failover under real failure), *"Zero
     Findings"*, *"Nobody Missed A Pass"*, *"Warmed The Pool"* (reach full inbox placement from a
     cold IP range), *"Still Running"* (keep one machine alive across three eras), *"The Tour"*
     (win a 5-year colo contract off a walkthrough alone), *"Toll Free"* (survive a SIP fraud
     attempt with a spend cap you bought before you needed it).

---

*End of Part II. Combined with Part I: ~465 numbered ideas across the nine categories, with the
hosting-type variety engine treated as a cross-cutting dimension rather than a separate list.*
