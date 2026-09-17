# Hosting Company Tower Defense — Idea Dump (Wave 2, General Lens)

Wide and even across all 9 categories, deliberately spread across many hosting business
types: shared hosting, VPS, dedicated, colo, wholesale DC, game servers, VoIP, email,
DNS, CDN, object storage, backup/DR, video/streaming, GPU/AI, HPC, mining, Kubernetes/PaaS,
DBaaS, bulletproof, regulated (HIPAA/PCI/FedRAMP), retro (dial-up ISP / BBS / Usenet),
satellite ground station, edge/5G, IoT, blockchain nodes, seedbox/storage, and a few
invented ones.

Working title candidates: **UPTIME**, **Rack & Ruin**, **Five Nines**, **The Noisy Neighbor**,
**Packet Loss**, **Datacenter Tycoon Defense**, **Ping of Death**, **99.999**.

---

## 1. Levels, Scenarios, and Progression

### 1.1 The scale ladder (the spine of the campaign)

Each rung changes the *unit of thought*: what a single tile represents, what a single
visitor represents, and what a single dollar represents. This is the game's main
difficulty escalator and its main novelty engine.

1. **One Box** — a single shared server. Tiles are *processes and directories*. Visitors
   are individual HTTP requests. Money is measured in dollars-per-month, three digits.
2. **One Rack** — a few 1U machines in someone else's cage. Tiles are *servers*. Visitors
   are request streams. Money in thousands.
3. **One Suite** — your own private room: compute, DB, cache, load balancers, your own
   switch stack. Tiles are *roles and clusters*. Visitors are traffic classes.
4. **One Datacenter** — rows, PDUs, chillers, your own staff, your own customers. Tiles
   are *racks and rooms*. Visitors are *accounts*.
5. **Colo Landlord** — your customers are other hosting companies. Tiles are *cages*.
   Visitors are *tenants and their unpredictable gear*.
6. **Multi-Region** — several DCs plus the links between them. Tiles are *sites and
   circuits*. Visitors are *global demand curves*.
7. **The Grid** — you are utility-scale: build-to-suit halls, substations, a 20-year power
   contract, and one hyperscaler tenant who can end you by not renewing.

**Zoom-level continuity idea — "The Same Map, Further Out":** every promotion literally
zooms the camera out and your entire previous level becomes one icon in the new one. Your
old One Rack is now a single cabinet in the new DC floor plan, still running, still
earning, still occasionally on fire. Emotional payoff: you can click it and see the little
map you used to play.

### 1.2 Named campaign levels (by hosting type)

- **L1 — "index.html"** *(shared hosting, 1998 flavor)*: one Apache, one cgi-bin, a
  guestbook script. Teaches pathing and the first tradeoff: enabling the guestbook brings
  visitors AND brings the first spam bot. Win: 1,000 pageviews without the box falling over.
- **L2 — "The Slashdotting"** *(shared hosting, traffic spike)*: a customer's page hits
  the front page of a link aggregator. You cannot scale hardware in time. You must choose:
  static-cache the page, rate-limit, or let the box die and lose the account. Introduces
  the spike wave archetype.
- **L3 — "Reseller Row"** *(cPanel-style mass hosting)*: 400 accounts on two boxes.
  Introduces the **noisy neighbor** threat and the **oversell** economic dial. First
  appearance of "one customer's bad PHP loop starves everyone else."
- **L4 — "The Cage"** *(colocating your own gear)*: you rent 1/4 cabinet from a bigger
  provider. New constraints: remote hands cost money per incident, a 2-hour drive is a
  real resource, and the landlord's power outage is not your fault but is your outage.
- **L5 — "Tick Rate"** *(game server hosting — Minecraft/CS shards)*: visitors are
  *players*, and they leave instantly if latency crosses a threshold. New threats:
  booters/stressers aimed at individual match servers, cheat clients, and a 6pm-to-midnight
  demand curve that is brutal and predictable. New buildable: a public server browser
  listing (brings players, brings scanners).
- **L6 — "Mailbox Full"** *(email hosting)*: visitors are messages, and the real boss is
  *deliverability*. Your score is your IP reputation. One compromised customer account
  sending spam gets your /24 blocklisted and every other customer's mail bounces. Teaches
  the "shared fate" mechanic.
- **L7 — "Anycast"** *(DNS hosting)*: tiny packets, enormous volume, no room to be slow.
  Introduces the amplification-reflection attack, where YOUR servers become the weapon
  against someone else and you get the abuse complaints.
- **L8 — "Cache Hit"** *(CDN / edge)*: you play a *map of the world*, not a room. Place
  PoPs, manage cache-fill cost vs. hit-ratio, and discover that your origin is now the
  single point of failure everyone forgot about. Win condition is a hit-ratio percentage,
  not a survival timer.
- **L9 — "Eleven Nines"** *(object storage / S3-alike)*: durability is the score. Threats
  are silent: bit rot, a bad firmware batch, a rebuild storm that takes a second disk with
  it. There is no dramatic attacker — the enemy is entropy and your own rebuild math.
- **L10 — "Restore Test"** *(backup / DR hosting)*: you take backups all level and are
  graded only at the end, on whether they *restore*. Twist: the "attack wave" is a customer
  ransomware event at 3am, and your defense is whatever you actually verified.
- **L11 — "Go Live"** *(video / live streaming)*: a single scheduled event. All your
  capacity planning happens before the whistle; during the event you can only triage.
  Introduces transcode ladders as a resource-conversion mechanic.
- **L12 — "H100 Season"** *(GPU / AI compute)*: absurd revenue per rack, absurd power per
  rack, and a cooling system that is now a first-class combat unit. Threats: thermal
  throttle, a power-capping trip, and a customer whose job checkpoint fails so they demand
  a refund for 40 hours of burn.
- **L13 — "Render Deadline"** *(HPC / render farm)*: batch, not interactive. Visitors are
  *jobs with deadlines*, and the scoring is throughput + on-time delivery. Teaches queue
  management and preemption.
- **L14 — "Hashrate"** *(crypto mining hosting)*: your tenants' gear is cheap, hot, and
  constantly failing; your revenue is per-kW not per-server; and a price crash mid-level
  makes half your tenants stop paying and abandon their hardware in your building.
- **L15 — "Ingress"** *(Kubernetes / PaaS)*: you host *platforms*, not machines. The
  abstraction itself becomes the attack surface: a misconfigured ingress, a leaked service
  account, a noisy CI pipeline that rebuilds everything at once.
- **L16 — "Read Replica"** *(DBaaS)*: everything is about failover and replication lag.
  The boss is a *split brain*.
- **L17 — "Bulletproof"** *(anything-goes hosting)*: highest revenue-per-rack in the game,
  and a rising **Heat** meter. Upstream carriers, payment processors, and eventually law
  enforcement become the threats. A branching morality level with a real economic pull.
- **L18 — "Audit Day"** *(HIPAA/PCI/FedRAMP)*: no traffic spike, no DDoS. The enemy is a
  clipboard. You must produce evidence for controls you were supposed to have been building
  for the whole level. Fails you retroactively for shortcuts you took in earlier waves.
- **L19 — "Dial Tone"** *(1996 dial-up ISP)*: modem banks, busy signals, a POP per area
  code, and a "hours per month" pricing model. Visitors are *callers*; the bounce condition
  is a busy signal. Period-accurate threats: war dialers, a flood of AOL CD refugees, and
  one guy hogging a line for 19 hours.
- **L20 — "NNTP"** *(Usenet / BBS / shell accounts)*: storage retention as the core stat,
  binaries groups eating your disk, and a takedown notice mechanic.
- **L21 — "Cage Landlord"** *(colo, tenants are hosting companies)*: you no longer control
  the gear inside your building. You sell **space, power, cooling, and cross-connects**.
  Your threats become your tenants: overdrawn circuits, blocked airflow, a tailgater at
  the mantrap, a tenant whose DDoS saturates the shared uplink you sold everyone.
- **L22 — "Build-to-Suit"** *(wholesale / hyperscale)*: you're building a hall for one
  customer with a 20-year term. The level is mostly construction and negotiation; the
  threats are supply chain (a transformer with a 74-week lead time), permitting, and a
  local community that does not want you.
- **L23 — "Ground Station"** *(satellite teleport hosting)*: pass windows are a timing
  puzzle — a customer's satellite is overhead for 9 minutes and you must have the dish,
  the backhaul, and the storage ready. Weather is a literal enemy (rain fade).
- **L24 — "Tower Edge"** *(5G MEC / edge)*: dozens of tiny sites, each too small to be
  redundant. Teaches fleet management: you can't fix them individually, only in policy.
- **L25 — "Cold Vault"** *(offsite tape vaulting)*: the slowest, quietest level. A courier
  van is a game unit. The threat is a fire, a flood, and a chain-of-custody failure.

### 1.3 Perspective-shift levels (same world, different chair)

- **"Remote Hands"** — You play the *datacenter tech*, not the owner. A ticket queue, a
  cart, a long walk, and a customer on the phone. Micro-scale, tactile, timed.
- **"NOC Night Shift"** — You only have dashboards and a phone. You cannot touch anything;
  you can only route information to the right people. Scoring is time-to-correct-escalation.
- **"The Tenant"** — You play a customer of a hosting company, trying to keep YOUR service
  up while the provider (an AI) has outages you can't control. Teaches empathy and sets up
  the multi-provider mechanic.
- **"Due Diligence"** — You play an acquirer walking another company's floor, choosing
  what to keep. Converts directly into the acquisition scenario below.
- **"The Auditor"** — Inverted level: you inspect an AI-run facility and score it. Unlocks
  knowing exactly what auditors look for in your own levels.

### 1.4 Scenario types (replayable modifiers, not story levels)

- **Launch Spike** — a known event at a known time; all prep, then triage.
- **Silent Migration** — move every customer to new hardware with zero downtime; visitors
  keep flowing the whole time and any drop counts against you.
- **Breach Recovery** — you start already compromised. Find it, contain it, notify, rebuild
  trust. Revenue starts falling on turn one.
- **Audit Pass** — collect evidence tokens for controls.
- **Junkyard Inheritance** — you acquire a competitor and get their hardware: mixed vendors,
  no documentation, three machines nobody knows the purpose of, and one that is load-bearing.
- **The Sole Whale** — 80% of revenue is one customer. They make demands. Saying no costs
  money; saying yes costs capacity.
- **Cost Cut** — survive a quarter with a 30% budget reduction; something must be given up.
- **Contract Recompete** — your biggest tenant goes to market; you must improve metrics
  *visibly* within N waves or lose them.
- **Regulatory Shift** — mid-level, a data-residency law passes; some customers must be
  physically moved to a compliant region within a deadline.
- **Upstream Divorce** — your transit provider gets acquired and depeers; you must re-home
  your BGP under fire.
- **Heat Wave** — ambient temperature rises all level; every cooling decision you made
  earlier is now graded.
- **Supply Drought** — you cannot buy new hardware for the entire level. Only repair,
  repurpose, and optimize.
- **Zero Day Wednesday** — a critical CVE drops in software 100% of your fleet runs. Patch
  waves vs. traffic waves, simultaneously.
- **Viral Customer** — one of your tiny customers becomes famous overnight; they cannot pay
  for what they now need. Do you carry them for the prestige?
- **The Pivot** — mid-campaign, your primary business type becomes unprofitable (shared
  hosting commoditized, mining crashes, a platform vendor changes licensing). You must
  convert your facility to a new hosting type without stopping revenue.
- **Two Businesses at Once** — run game hosting and backup hosting on the same floor. Their
  demand curves are *complementary* (games peak at night, backups run at night too — oops)
  and the level is about the collision.
- **Insolvency Run** — you're 45 days from missing payroll. Every decision is cash-timed.
- **The Good Samaritan** — a neighboring provider goes down; you can take their refugees
  (revenue + reputation) but they arrive as an unplanned spike with no onboarding.

### 1.5 Progression structures

- **Business-Type Tech Web (not a tree)** — hosting types are nodes on a web; adjacency
  means "shares infrastructure." Shared hosting → VPS is cheap to reach; shared hosting →
  GPU is far. Reaching a distant node requires an intermediate or a big capital injection.
- **Ratchet Progression** — you never lose unlocked *knowledge*, but you can lose *capacity*.
  A failed level costs assets, not tech.
- **Era Track** — a parallel progression axis: 1994 → 2001 → 2008 → 2016 → 2024 → near
  future. Advancing eras changes available tech, customer expectations, threat mix, and
  the entire visual palette, and *retires* some buildables (your modem bank becomes scrap).
- **Reputation Gates** — some levels only open at a reputation threshold (you cannot get a
  FedRAMP level until you've run clean for N levels).
- **Scar System** — failures leave permanent map scars in campaign mode: a burned rack
  position that costs more to reuse, a customer segment that will never trust you again.
- **Prestige / "Sell the Company"** — end a campaign by exiting: IPO, acquisition, or
  going private. Each exit type grants a different permanent starting bonus for the next
  run and a different narrative epilogue.

---

## 2. Threats

Threats come in four families, and mixing families in one wave is what makes a wave
interesting: **Malicious** (someone wants to hurt you), **Entropic** (things break),
**Human** (people make mistakes or demands), and **Systemic** (the world changes).

### 2.1 Malicious — volumetric

- **Packet Flood (SYN/UDP)** — a thick, dumb stream of identical units marching down your
  uplink lane. Counter: upstream scrubbing, SYN cookies, blackhole. Cost if through:
  saturated uplink, *all* visitors bounce, not just the target's. Present in every hosting
  type; worst in game hosting and DNS.
- **Amplification Reflection** — attacker spoofs a victim and uses YOUR open resolver /
  NTP / memcached as the gun. Uniquely nasty: you take no damage at first, then an abuse
  complaint arrives and your transit provider threatens null-routing your whole range.
  Counters: response rate limiting, BCP38 egress filter, closing open services.
- **Carpet Bomb** — instead of one target IP, low-rate traffic to *every* IP in your /24,
  each below your per-IP detection threshold. Counters: subnet-level aggregation detection.
  Teaches that thresholds are a thing attackers know about.
- **Booter / Stresser Burst** — 30-second bursts, repeated, aimed at a single game server
  to grief one match. Cheap for the attacker. Counters: per-instance IP rotation, hiding
  real IPs behind a proxy layer, anti-DDoS game-protocol filters.
- **Slowloris / Slow Read** — a trickle of units that hold connections open forever. Almost
  no bandwidth. Kills a naive web server via connection exhaustion. Counter: reverse proxy
  with a timeout, connection limits. Visual: units that grab the gate and simply *don't
  let go*.
- **Application-Layer Flood (L7)** — requests that look exactly like visitors but are
  expensive: search queries, cart pages, cache-busting query strings. Counter: challenge
  pages, per-route rate limits, cache rules. Core mechanic: you *cannot* filter these
  without also filtering revenue.

### 2.2 Malicious — intrusion

- **Credential Stuffing** — a rain of login attempts using leaked passwords. One lands.
  Counter: MFA, lockout, breach-password lists. Damage: one compromised account, which
  becomes a spam relay (email host), a crypto miner (VPS host), or a phishing page
  (shared host).
- **Vulnerable Plugin** — the classic shared-hosting cause of death. An outdated CMS plugin
  gets popped. Counter: managed patching service, WAF virtual patching, per-account
  isolation. Damage: mass defacement across every account on that box, plus blocklisting.
- **SQL Injection** — only exists if you *built a database tier*. Perfect illustration of
  the brief's core tradeoff. Counter: WAF, prepared-statement linting service, DB user
  privilege separation.
- **Supply Chain / Poisoned Dependency** — a package your management stack uses gets
  backdoored. Nothing on your perimeter sees it. Counter: artifact pinning, internal
  mirror, SBOM scanning.
- **Insider** — a staff unit whose loyalty meter dropped. Steals data, or leaves a
  backdoor on the way out. Counter: least privilege, offboarding checklist, morale.
- **Hypervisor Escape** — endgame threat in VPS/cloud levels: one tenant reaches another.
  Extremely rare, extremely fatal. Counter: dedicated hosts for sensitive tenants, patch
  cadence, silicon-level mitigations (which cost you 8% performance — a real dial).
- **Ransomware (customer-side)** — not an attack on you, but you're the one who gets called.
  Your backups are the counter, and *only if tested*.
- **Ransomware (you-side)** — hits your management plane, your billing DB, your backup
  index. The true boss fight of the campaign. Counter: immutable/air-gapped backups,
  segmented management network.
- **BGP Hijack** — someone announces your prefixes. Your visitors literally go somewhere
  else. Counter: RPKI ROAs, IRR objects, peer filtering, upstream monitoring. Visual: your
  visitor lane is *rerouted off-screen* to an enemy building.
- **DNS Hijack / Registrar Takeover** — attacker social-engineers your registrar. All
  defenses inside the building are irrelevant. Counter: registrar lock, dedicated registrar
  account, out-of-band comms.
- **Cryptojacking** — hidden load: a slow, constant tax on CPU that you only notice via a
  power-bill anomaly. Counter: utilization baselining, per-account resource caps.
- **Sneakernet Intrusion (colo)** — a person in a hi-vis vest with a clipboard and a
  plausible ticket. Counter: mantrap, escort policy, badge audit. Purely a physical-layer
  threat; only exists once you own a building.

### 2.3 Malicious — attacker archetypes (behavior profiles, not just damage numbers)

- **The Scanner** — ambient background noise. Never stops, never strong. Finds anything you
  expose within 90 seconds of exposing it. Its only role is to punish carelessness instantly.
- **Script Kiddie** — bursty, loud, copies whatever is trending. Gives up if the first three
  attempts fail. Cheap to repel, good early-level teacher.
- **The Griefer** — targets one customer, not you. If you don't defend that customer
  specifically, they churn and post about it.
- **Competitor** — doesn't attack directly. Poaches customers, undercuts price, hires your
  staff, and occasionally pays someone else to attack you. Shows up as market pressure and
  suspicious timing.
- **Extortionist** — sends a ransom note first, gives you a deadline, then demonstrates.
  Introduces a *negotiation* mini-decision: pay (cash loss, marks you as payer, recurring),
  or don't (take the hit).
- **Botnet Herder** — rents capacity to others. Attacks are large but generic; the same
  botnet shows up across levels and you can gradually fingerprint it into a permanent
  unlock ("known-bad ASN list").
- **Nation-State** — patient, quiet, targets your *management plane* and stays for months.
  Almost undetectable without expensive tooling. Cannot be repelled, only detected and
  evicted. Endgame only.
- **Hacktivist Swarm** — triggered by a *business decision* you made (hosting a controversial
  customer). Volume plus press. The only threat generated by the player's own choices.
- **The Abuse Desk of Another Provider** — an antagonist that isn't an attacker: they send
  complaints, and ignoring them escalates to your upstream.
- **The Bug Bounty Hunter** — a friendly-adjacent unit: finds real holes, but posts publicly
  if you ignore them for too long. Can be converted into an asset by paying them.

### 2.4 Entropic — hardware, power, environment

- **Disk Failure** — routine, expected, cheap *if* you have redundancy and a spare on site.
- **Rebuild Storm** — the *second* failure during a rebuild. The real killer. Argues for
  wider parity, faster rebuild, hot spares.
- **Bit Rot / Silent Corruption** — invisible until a restore. Only checksumming/scrubbing
  reveals it. The signature threat of archival hosting.
- **Bad Firmware Batch** — 40 drives from one lot all die within the same week. Counter:
  vendor diversity (which costs more and complicates spares).
- **PSU Failure** — trivial if dual-corded to A+B feeds; fatal if someone cheaped out and
  single-corded.
- **PDU Overdraw / Breaker Trip** — you sold 8kW to a cabinet drawing 9.2kW. The breaker
  doesn't negotiate. Colo signature threat.
- **UPS Battery End-of-Life** — a slow meter that nobody watches until the transfer fails.
- **Generator Won't Start** — the punishment for never running a load test. Deterministic:
  if you skipped N monthly tests, it fails.
- **ATS Failure** — power is there, the switch isn't. Rare, spectacular.
- **CRAC / Chiller Failure** — heat climbs on a visible gradient. You get minutes. Counters:
  N+1 cooling, hot-aisle containment, emergency doors-open + portable units.
- **Condensate Leak / Water Above the Racks** — a slow drip that becomes a short.
- **Fire (and the suppression that follows)** — the real damage is often the *inert gas
  discharge* acoustics killing spinning disks, which is both true and darkly funny.
- **Fiber Cut / Backhoe Fade** — an entire uplink vanishes instantly. Counter: diverse
  path entry, and the expensive discovery that your two "diverse" carriers share a conduit.
- **Cooling-Loop Contamination (liquid-cooled GPU halls)** — modern, era-gated threat.
- **Rodents / Insects** — chewed fiber, a wasp nest in the outdoor condenser. Comedy threats
  with real consequences.
- **Dust and Construction** — a neighboring build-out pushes particulates into your intake.
- **Salt Air / Humidity** (coastal site modifier), **Wildfire Smoke** (intake filters clog),
  **Lightning** (surge, plus a scary noise).
- **Tape Library Robot Jam** — archival signature. Cartridge stuck; restores queue behind it.
- **Seismic Event** — rack anchoring becomes retroactively important.

### 2.5 Human — mistakes, customers, and internal chaos

- **Bad Deploy** — a config push rolls out fleet-wide in 12 seconds. Counter: canary,
  staged rollout, a rollback button that is itself a buildable.
- **Fat-Finger Rule** — someone pushes a firewall rule that blocks the management network
  they're connected through. Locks the whole team out. Counter: out-of-band console/serial.
- **Expired Certificate** — an entirely self-inflicted outage on a known date. Counter:
  automated renewal. Comedy: the renewal reminder went to a person who left.
- **Expired Domain** — same, but worse.
- **DNS TTL Regret** — you set a 24-hour TTL and now cannot move fast.
- **Capacity Forecast Miss** — you ordered too late; the lead time is longer than your
  runway.
- **Key Person Bus Factor** — one staff unit knows the legacy system. If they're on leave,
  certain repairs are unavailable.
- **Burnout** — a staff unit with too many night pages loses effectiveness, then quits.
- **Support Queue Collapse** — tickets exceed capacity; unanswered tickets convert directly
  into churn and public reviews.
- **Angry Whale Customer** — demands a dedicated engineer, a custom SLA, and a price cut.
- **The Customer Who Lies** — swears they didn't change anything. They changed something.
  Investigating costs time; believing them costs more.
- **Chargeback Wave** — fraudulent signups charge back; your payment processor raises
  reserve requirements. Cash-flow damage without any technical event.
- **Abuse Complaint Backlog** — every unhandled complaint raises your Heat meter.
- **Migration Corruption** — a customer move that silently drops data; discovered days later.
- **The Demo That Matters** — a prospect tours during an incident.

### 2.6 Systemic — the world moves

- **Upstream Carrier Outage** — not your fault, entirely your problem.
- **Peering Dispute** — a major eyeball network depeers your transit; latency to a big chunk
  of your customers doubles overnight.
- **Regional Power Price Spike** — your margin evaporates without any technical failure.
  Signature threat for GPU/mining levels.
- **Currency / Import Tariff Shock** — hardware costs jump 20% mid-order.
- **Component Shortage** — 60-week lead times on transformers, switchgear, GPUs, or memory.
- **Licensing Change** — a virtualization or OS vendor changes per-core pricing; your whole
  cost model shifts. Response: migrate stacks (expensive, slow) or eat it.
- **Regulation** — data residency, encryption mandates, breach notification windows,
  environmental reporting, a local water-usage ordinance for your cooling.
- **Law Enforcement Request / Seizure** — in bulletproof levels, they take the rack. Any
  *other* customers on that rack are also gone. Teaches the real cost of mixed tenancy.
- **Blocklist Listing** — email and bulletproof levels. Your IP space becomes less valuable.
- **Public Incident / Press Cycle** — a status-page outage becomes a news story, which
  becomes a churn wave three days later. Damage is *delayed*, which is the interesting part.
- **Cloud Giant Price Cut** — the hyperscaler drops prices; your commodity tier is
  underwater. Forces differentiation or pivot.
- **AI Bubble Deflation** *(era-gated)* — GPU rental rates halve; your 3-year depreciation
  schedule was written assuming they wouldn't.
- **Climate / Weather Events** — hurricane season for a Gulf-coast site, freeze for a Texas
  site, drought restricting evaporative cooling.
- **Community Opposition** — a new build gets protested; the level's construction timer
  extends.

### 2.7 Threat-to-hosting-type matrix (which enemies show up where)

- **Shared hosting:** vulnerable plugins, noisy neighbor, mass defacement, blocklisting,
  L7 floods, oversell collapse.
- **VPS/cloud:** abuse from your own customers (outbound attacks!), cryptojacking, hypervisor
  escape, resource contention, snapshot storage bloat.
- **Dedicated/bare metal:** hardware failure, slow provisioning, remote-hands dependency.
- **Colo:** power overdraw, airflow blocking, tailgating, tenant-caused shared-uplink
  saturation, cross-connect errors, a tenant going bankrupt and abandoning gear.
- **Game hosting:** booters, cheaters, latency sensitivity, evening demand spikes, DDoS
  aimed at individual players, community drama.
- **Email:** spam outbound, reputation, phishing, backscatter, deliverability blocklists.
- **DNS:** amplification, cache poisoning, NXDOMAIN floods, registrar attacks.
- **CDN:** cache poisoning, origin overload, purge storms, hot-object imbalance.
- **Object storage/backup:** bit rot, rebuild storms, restore-time failure, retention-policy
  compliance, egress-fee disputes.
- **Video/streaming:** transcode capacity, thundering herd at event start, piracy/restream,
  buffering as the churn mechanic.
- **GPU/HPC:** thermal, power capping, job checkpointing, interconnect faults, scheduler
  starvation, extremely expensive idle.
- **Mining hosting:** heat, power price, tenant insolvency, fire risk from cheap PSUs.
- **K8s/PaaS:** misconfiguration, secret leakage, control-plane overload, CI stampedes.
- **DBaaS:** replication lag, split brain, long-running query starvation, backup locks.
- **Bulletproof:** law enforcement, upstream termination, payment processor loss, hacktivists.
- **Regulated:** auditors, evidence gaps, access-log retention, encryption-at-rest proofs.
- **Dial-up era:** busy signals, line hogs, war dialers, modem incompatibilities.
- **Satellite/edge:** weather, pass windows, physical remoteness, vandalism, backhaul cost.

### 2.8 Threat delivery mechanics (how they "approach")

- **Lane Marching** — classic TD: threats walk a network path from the internet edge inward.
- **Rain Threats** — hardware failures fall onto random tiles from above; no path, no
  warning, countered by redundancy rather than by towers.
- **Sleeper Threats** — enter disguised as visitors and activate later (an account signup
  that turns into a spam relay on wave 7).
- **Pressure Threats** — never "arrive"; they raise a meter (heat, power draw, queue depth)
  until something breaks.
- **Correspondence Threats** — arrive as documents in an inbox: abuse complaints, legal
  notices, audit findings. Handled by staff units, not by defenses.
- **Compound Waves** — a small DDoS *plus* a disk failure *plus* an angry customer call,
  timed so that your attention is the scarce resource.
- **Telegraphed Bosses** — a 3-wave countdown with visible intel ("chatter suggests a
  Tuesday attack"), giving prep meaning.

---

## 3. Visitors, Traffic, and Clients

Two distinct populations that the game should never conflate:
**Traffic** (transient units — a request, a player join, a backup job) and
**Clients** (persistent entities — accounts, tenants, contracts). Traffic generates
*satisfaction*; satisfaction over time generates and retains *clients*; clients generate
*money*. A level can be scored on either, and that choice alone changes how it plays.

### 3.1 What a "visitor" looks like, per hosting type

- **Shared web hosting:** a page load. Small, fast, impatient. Bounces at ~3 seconds. Comes
  in bursts tied to a customer's own marketing.
- **Managed WordPress:** same, but heavier per unit (plugins!) and the customer blames you
  for their own plugin's slowness.
- **VPS/cloud:** an API call to provision, plus continuous background traffic. The visitor
  you really court is the *developer signing up*, not the packet.
- **Dedicated/bare metal:** a sales inquiry. Slow-moving, high-value, needs a human.
- **Colo:** a *tour*. A prospect physically walks your floor; every visible flaw (cable
  spaghetti, a propped-open door, dust) reduces conversion. Converts to a 3-5 year contract.
- **Game hosting:** a player. Joins a server from a browser list, checks ping, leaves in
  under 10 seconds if it's bad. Travels in *parties* — if one leaves, friends follow.
- **VoIP/SIP:** a call. Extremely latency- and jitter-sensitive; a single bad second is
  remembered. Arrives in business-hours waves.
- **Email:** a message. Two-directional: inbound (must be filtered) and outbound (must be
  *accepted by strangers*). Success = delivered to inbox, not just accepted.
- **DNS:** a query. Millions, microscopic, must never be slow, and 99% should be answered
  from cache.
- **CDN:** a request that either hits (cheap, fast, happy) or misses (expensive, slow,
  origin load). The hit/miss split IS the gameplay.
- **Object storage:** a PUT or GET. PUTs are cheap and build a liability; GETs are where
  egress revenue lives.
- **Backup/DR:** a backup job. Large, scheduled, tolerant of slowness but intolerant of
  failure. The *restore* is the rare visitor that actually matters.
- **Video/streaming:** a viewer, who shows up 10,000-at-once at event start and whose
  tolerance is measured in rebuffer events.
- **GPU/AI:** an inference request (small, latency-sensitive) or a training job (enormous,
  long-lived, and it *reserves* capacity you then can't sell).
- **HPC/render:** a job with a deadline, submitted in batches.
- **Mining hosting:** there are effectively no visitors — only tenants and kilowatts. A
  level with no visitor lane at all is a great change of pace.
- **K8s/PaaS:** a deploy. Frequent, self-service, and the customer's own CI is a traffic
  source you don't control.
- **DBaaS:** a query. Some are cheap; a few are catastrophically expensive.
- **Dial-up ISP:** a caller. Gets a busy signal (hard bounce) or connects for hours.
- **BBS/Usenet:** a user session, plus a newsfeed that flows constantly whether anyone
  reads it or not.
- **Satellite:** a pass. Arrives on a schedule you don't control and cannot be delayed.

### 3.2 Bounce and churn mechanics

- **Latency Gate** — each visitor type has a patience value; exceeding it converts them to
  a bounce and a small reputation tick. Game players: ~60ms. Web: ~2-3s. Backup job: hours.
- **Error Bounce** — a 5xx is worse than slow. Two in a row from the same client = churn risk.
- **Queue Despair** — visitors waiting in a queue visibly degrade (color drain) and leave.
- **Path Ugliness** — a visitor routed through too many hops (extra proxies, a distant PoP,
  an overloaded firewall) accumulates latency per hop. Elegant infrastructure literally
  looks shorter on screen.
- **Captcha Friction** — challenge pages stop bots AND annoy a percentage of real visitors.
  A slider the player tunes: security vs. conversion.
- **Trust Bounce** — expired cert, mixed content, a browser warning: visitors turn around at
  the door even though the service is up.
- **Reputation Bounce** — for email, if your IP is listed, the visitor never even arrives.
- **Churn Triggers (clients):** N incidents in a window, an unanswered ticket past SLA,
  a price increase, a competitor promo, an invoice problem, a bad migration, a public outage.
- **Silent Churn** — a client stops growing rather than leaving; revenue flatlines. Detected
  only with a usage-trend report (a buildable).
- **Contagious Churn** — a churned client posts publicly; nearby clients in the same segment
  get a churn-probability bump. Community-driven hosting types (game, dev, forum) have a
  high contagion multiplier.

### 3.3 Client archetypes (persistent customers)

- **The Hobbyist** — pays $5, uses nothing, never complains, never grows. Pure margin,
  zero prestige. Great filler revenue, terrible for capacity planning because there are
  thousands of them.
- **The Small Business** — pays modestly, calls on the phone, needs hand-holding, extremely
  loyal if treated well. High support cost, high retention.
- **The Developer** — self-serve, price-sensitive, technically demanding, will absolutely
  notice your oversell. Brings friends via word of mouth. Leaves instantly for a better API.
- **The Agency/Reseller** — brings 200 accounts at once and can take all 200 away at once.
  Concentration risk in a friendly package.
- **The Whale** — 30-80% of your revenue. Demands custom terms. Negotiation events.
- **The Startup Rocket** — tiny now, 50x in six months, may die instead. A gamble: invest
  capacity now for a chance at a whale later.
- **The Enterprise** — slow to sign, slow to leave, demands audits, SLAs, and paperwork.
  Unlocks regulated business lines.
- **The Game Community** — a clan or server owner who brings hundreds of players and a
  Discord full of opinions. Reputation-amplifier, positive or negative.
- **The Streamer** — enormous spiky load, enormous free marketing. A "prestige client"
  whose value is partly non-monetary.
- **The Abuser** — signs up with a stolen card, spins up outbound attacks, disappears. Net
  negative, and detecting them early is a skill unlock.
- **The Gray Customer** — legal but reputationally risky. Pays 3-5x. Raises Heat.
- **The Zombie Account** — long-dead, still paying, still consuming a slot. Free money until
  their expired card fails.
- **The Colo Tenant (another hosting company)** — your peer and your risk. Their outage is
  your building's outage story.
- **The Government/Institution** — pays late but forever; requires compliance investment;
  immune to competitor poaching.
- **The Crypto Tenant** — pays in advance, disappears when prices crash, leaves hardware.
- **The AI Lab** — books 18 months of GPU capacity, changes requirements every month, and
  makes you turn away everyone else.

### 3.4 Attraction (how you actively win traffic and clients)

- **Word of Mouth Engine** — happy clients emit "referral" units that walk into your
  signup funnel. The single most efficient acquisition channel and it's earned, not bought.
- **Uptime Advertising** — publishing a real status page converts uptime into leads, but
  also makes your outages public. Genuine tradeoff.
- **Benchmark Publication** — publish a performance benchmark; developers arrive; so do
  people trying to disprove it.
- **Forum Presence / Community Hosting** — sponsor a community (a game clan, an open-source
  project) for a steady low-cost lead trickle and a reputation buffer.
- **Free Tier** — a lead magnet that consumes real capacity and attracts abuse. Tunable:
  how generous, how gated.
- **Migration Assistance** — offer free migrations and you poach competitors' clients, but
  you inherit their mess (see Junkyard Inheritance).
- **Promo Codes / Black Friday** — a burst of signups at terrible margin who churn at
  renewal. Classic hosting trap, perfect game mechanic: a sugar rush with a hangover.
- **SEO / Content** — slow-building passive lead flow; a long-term investment building.
- **Paid Ads** — instant lead flow, stops the moment you stop paying, rising cost per click
  as competitors bid.
- **Marketplace/Reseller Channel** — someone else sells for you; you get volume and lose margin.
- **Peering/Interconnect as Marketing** — in CDN/colo levels, being present at the right
  exchange literally attracts tenants who want to be near their peers ("network gravity").
- **Certifications** — SOC 2, PCI, HIPAA badges unlock whole client segments that would
  otherwise never even look at you.
- **The Tour** — colo-specific: a prospect visit that you can prep for (clean the floor,
  schedule it away from maintenance) and that converts at a huge value.
- **Conference Booth** — an event window where lead flow multiplies but your best staff are
  away from the NOC.
- **Latency as a Product** — publishing a looking glass / ping page; players and traders
  pick you because you're 4ms closer.

### 3.5 Visitor-side interesting behaviors

- **Herding** — visitors follow other visitors. A server with people on it attracts more
  (game browser sorting by population). Creates runaway winners and empty-server death
  spirals you must manage.
- **Time-of-Day Curves** — every hosting type gets its own daily shape: business email
  peaks 9am, games peak 8pm, backups peak 2am, CDN peaks at streaming primetime, batch
  render fills the gaps. Running complementary businesses smooths the curve — a genuinely
  strategic reason to diversify.
- **Seasonality** — retail hosting peaks in Q4, game hosting peaks at expansion launches,
  tax software hosting peaks in April, education hosting dies in summer.
- **Sticky vs. Fluid Traffic** — a game player is sticky for hours; a DNS query is gone in
  a millisecond. Sticky traffic means capacity is *held*, which changes placement strategy.
- **VIP Visitors** — occasionally a high-value unit (a journalist, a prospective whale's
  CTO testing your service, a compliance scanner) walks the same path as normal traffic.
  Treating it well pays out big. You can't tell which one it is without an analytics build.
- **Bot Traffic That Isn't Malicious** — search crawlers, uptime monitors, AI scrapers.
  They cost resources, provide value (indexing) or don't (scrapers), and blocking them has
  side effects.

---

## 4. Buildables: Services and Infrastructure

Format for each: **what it does / cost shape / what it connects to / new attack surface**.
The rule from the brief is honored everywhere: **almost every build adds capability AND
exposure AND upkeep.**

### 4.1 Compute

- **Shared Box** — runs many small accounts. Cheap, high density, high blast radius.
  Connects to: storage, DNS, mail. Surface: one bad account hurts all; noisy neighbor.
- **VPS Node (hypervisor)** — slices one machine into many. Cost: RAM-dominated. Surface:
  resource contention, escape, per-tenant abuse, snapshot storage growth.
- **Dedicated Server** — one customer, one box. High revenue, low density, provisioning
  latency. Surface: you can't see inside it, and you're still blamed.
- **Container Host / K8s Worker** — dense, fast, elastic. Surface: misconfig, shared kernel,
  a CI stampede scheduling 400 pods at once.
- **Bare-Metal-as-a-Service Provisioner** — turns dedicated servers into an API product.
  Unlocks developer clients. Surface: automated reinstall is a beautiful target.
- **Serverless Runner Pool** — burst capacity with cold starts. Surface: a runaway recursive
  function that bills you into the ground.
- **GPU Node** — enormous revenue, enormous power/heat. Requires the power and cooling
  chain to be built FIRST — the game should let you buy one you cannot power, and fail.
- **FPGA / ASIC Shelf** — niche, era-gated, for mining and specialized trading tenants.
- **Legacy Box You Can't Turn Off** — an inherited unit with an unknown but critical role.
  Provides revenue, refuses documentation, fails at the worst time.

### 4.2 Storage

- **Local Disk** — fast, cheap, dies alone.
- **RAID Array** — redundancy with a rebuild-window vulnerability.
- **Erasure-Coded Cluster** — high durability, high rebuild network cost, complex to reason
  about — pairs with the "eleven nines" level.
- **NVMe Cache Tier** — speed multiplier; a new failure mode (write cache loss on power cut
  unless you buy the capacitor-backed version).
- **SAN / Shared Storage** — lets you do live migration; introduces a *shared fate* central
  point that can take down everything at once.
- **Object Store** — S3-alike; unlocks backup, CDN origin, and media hosting lines.
- **Tape Library + Robot** — cheap per TB, slow, air-gapped by nature. The strongest
  ransomware counter in the game. Surface: robot jams, cartridge wear, off-site logistics.
- **Cold Archive Vault (offsite)** — a second location, a courier, a chain-of-custody log.
- **Snapshot Scheduler** — cheap safety net; quietly consumes storage until it doesn't.
- **Immutable/WORM Backup Target** — expensive, can't be deleted even by you. That's the point.
- **Restore Test Harness** — the buildable that converts backups from a liability into a
  defense. Without it, backups have a hidden failure chance revealed only at the worst moment.

### 4.3 Data and platform services

- **Database Primary** — the brief's canonical example: more capability, new attack surface
  (SQLi, overload, lock contention), new upkeep (backups, tuning).
- **Read Replica** — offloads reads; introduces replication lag as a visible, exploitable stat.
- **Database Proxy/Pooler** — connection management; a new single point of failure.
- **Cache Layer (memcached/redis-alike)** — huge speed gain; risks stale data, a thundering
  herd on cache flush, and (historically) becoming an amplification weapon if exposed.
- **Search Cluster** — enables site search; expensive queries become a DoS vector.
- **Message Queue / Broker** — decouples work; a queue that backs up silently is a delayed
  outage.
- **Cron / Scheduler Node** — runs everyone's jobs; the 00:00 stampede is a designed threat.
- **CI/Build Runners** — a customer-facing product that also invites crypto-mining abuse.

### 4.4 Network

- **Switch (ToR)** — connects a rack. Cheap. Surface: a loop, a broadcast storm, a
  misconfigured VLAN bridging two tenants.
- **Core Router** — the real spine; expensive; a config typo here is level-ending.
- **Redundant Pair + VRRP/MLAG** — removes a SPOF, adds split-brain and complexity.
- **Transit Circuit (per-carrier)** — raw internet. Billed 95th percentile — a mechanic in
  itself (see economy).
- **IX / Peering Port** — cheaper bits, better latency, requires relationships.
- **BGP Speaker + RPKI** — control over your own routing; unlocks anycast and multihoming.
- **Anycast Deployment** — the same IP in many places. Unlocks DNS/CDN business lines.
- **Load Balancer (L4)** — spreads traffic, cheap, dumb.
- **Load Balancer (L7) / Reverse Proxy** — routing rules, TLS termination, caching, header
  rewrites. Powerful. Surface: it now holds your private keys and can be misconfigured into
  an open proxy.
- **Firewall** — filtering. Surface: throughput ceiling (it becomes the bottleneck under
  DDoS), and the fat-finger lockout.
- **IDS/IPS** — detection; false positives block real visitors.
- **WAF** — stops L7/SQLi; tuned too tight, it blocks checkout pages and costs you revenue.
- **DDoS Scrubbing (on-prem appliance)** — fast, capped at your uplink size.
- **DDoS Scrubbing (upstream/cloud)** — unlimited capacity, adds latency on all traffic when
  active, costs per scrubbed gigabit.
- **Blackhole / RTBH Trigger** — instantly saves everyone except the victim. A brutal,
  satisfying, morally interesting button.
- **Out-of-Band Network + Serial Console** — boring, cheap, and the thing that saves you
  from the fat-finger lockout. Great "you'll wish you'd built it" purchase.
- **IPMI/BMC Management** — remote power cycling; a notorious attack surface if exposed.
- **VPN / Bastion / Zero-Trust Access** — how staff get in; consolidating access is safer
  and also makes one thing catastrophic.
- **Cross-Connect Panel (colo product)** — sell fiber runs between tenants; near-pure-margin
  recurring revenue and the best lock-in in the industry.
- **Looking Glass / Public Speed Test** — marketing tool; also free reconnaissance for
  attackers.

### 4.5 Facility

- **Rack / Cabinet** — the placement unit. Has U-space, weight, power, and airflow budgets.
- **Blanking Panels & Airflow Management** — cheap, unglamorous, measurably improves cooling
  efficiency. A great "small thing with real numbers" build.
- **Hot/Cold Aisle Containment** — big efficiency win, blocks some placements, expensive.
- **PDU (basic / metered / switched)** — tiers matter: metered lets you *see* overdraw,
  switched lets you reboot remotely and sell that as a service.
- **UPS + Battery String** — bridges the gap to generator. Has a maintenance schedule.
- **Flywheel UPS** — no batteries, short ride-through, era/branch alternative.
- **Generator + Fuel Tank** — the fuel level is a resource; so is the monthly load test.
- **Fuel Contract (priority delivery)** — insurance you only value during a regional event.
- **ATS / Switchgear** — the thing between utility and generator.
- **Second Utility Feed from a Different Substation** — real diversity, big money.
- **CRAC / CRAH Units**, **Chiller Plant**, **Dry Cooler**, **Evaporative Cooling**
  (water usage becomes a regulatory/community stat), **Free Cooling Economizer**
  (climate-dependent — makes site selection matter), **Rear-Door Heat Exchanger**,
  **Direct-to-Chip Liquid Loop** (required for high-density GPU), **Immersion Tank**.
- **Fire Detection (VESDA) + Suppression (inert gas / pre-action)** — required by insurance;
  discharge itself causes damage.
- **Leak Detection Rope** — cheap sensor that prevents a catastrophic class of failure.
- **Security: Fence, Bollards, Mantrap, Badge System, Biometrics, Camera Coverage,
  Guard Post, Visitor Escort Policy** — each raises the compliance score and gates certain
  client segments; each has an upkeep and a bypass (tailgating, a propped door).
- **Loading Dock + Staging Room** — unglamorous logistics that speeds every deployment.
- **Build-Out Shell Space** — pre-purchased capacity for future expansion; dead money now,
  the only way to grow fast later.
- **Substation / Utility Contract** — gates total facility capacity in MW. In hyperscale
  levels, power is the real currency.
- **Seismic Bracing, Raised Floor vs. Slab, Roof Condition** — site-quality modifiers.

### 4.6 Software / operational buildables

- **Monitoring + Alerting** — converts invisible problems into visible ones. Without it,
  threats damage you silently. With it, you get alert fatigue as a new resource drain.
- **Observability Stack (metrics/logs/traces)** — lets you see *why*, not just *that*.
  Reduces mean-time-to-repair substantially, costs storage and money.
- **Status Page** — turns outages public; reduces support ticket volume during incidents
  by a large factor; increases press exposure.
- **Ticketing System / Helpdesk** — required before support staff scale.
- **Billing System** — automates invoicing, dunning, suspension. Its own failure is a
  revenue outage with no technical symptom.
- **Provisioning Automation** — cuts delivery time; a compromised control plane is fatal.
- **Configuration Management** — consistency; also a fleet-wide bad-deploy accelerator.
- **Canary / Staged Rollout** — the direct counter to bad deploys.
- **Runbooks / Documentation** — reduces key-person risk, speeds junior staff, boring to buy,
  saves the level.
- **Chaos Testing / GameDay** — deliberately break things during calm waves to find hidden
  SPOFs before a real wave does. Costs a little uptime, buys a lot of information.
- **Capacity Planning Model** — forecasts demand; reveals the build-lead-time problem early.
- **Abuse Desk Tooling** — processes complaints quickly, lowers Heat.
- **Fraud Screening at Signup** — filters Abusers; also rejects a % of legitimate customers
  (a false-positive dial with a revenue cost).
- **SIEM / Log Retention** — compliance requirement and breach-detection tool.
- **Rate Limiter / Quota Engine** — per-account resource caps; the direct noisy-neighbor fix.
- **IP Reputation Manager** — email hosting: warming pools, feedback loops, delisting requests.

### 4.7 Staff (units with schedules, morale, and skills)

- **Junior Tech** — cheap, slow, can make mistakes that create threats.
- **Senior SysAdmin** — fast repairs, can do two things at once, expensive, burns out.
- **Network Engineer** — the only one who can safely touch BGP.
- **Security Engineer** — reduces intrusion probability, runs incident response.
- **DBA** — prevents the slow-query apocalypse.
- **Remote Hands (contracted)** — per-incident cost at facilities you don't staff.
- **Support Rep** — drains the ticket queue; morale drops with abuse.
- **Sales Rep** — generates leads and occasionally sells something you can't deliver.
- **Account Manager** — reduces whale churn, costs salary, has a relationship stat.
- **Compliance Officer** — required for regulated lines; produces evidence tokens.
- **Facilities Tech / Electrician** — performs generator tests, PM schedules.
- **On-Call Rotation** — a system, not a person: who gets paged, how often, and the burnout
  cost of 3am pages. A scheduling mini-game with real consequences.
- **Training Budget** — converts juniors into seniors over time.
- **Contractor Surge** — expensive temporary hands for a build-out; no institutional knowledge.

### 4.8 "Tower"-style defenses (the TD-native layer)

- **The Filter** — drops traffic by rule. Range: the lane it sits on. Upgrades: deeper
  inspection at higher latency cost.
- **The Sinkhole** — redirects malicious traffic into a pit; useful for study (generates
  Intel resource).
- **The Tarpit** — slows attackers by holding their connections. Cheap, and it also punishes
  scanners deliciously.
- **The Honeypot** — a fake, juicy-looking service. Attracts attacks away from real assets
  and generates Intel. Risk: if compromised deeply, it becomes a real foothold.
- **The Challenge Gate** — proof-of-work/captcha; blocks bots at the cost of some visitors.
- **The Scrubber** — the anti-DDoS heavy turret; expensive, has a throughput cap you can see.
- **The Bulkhead** — segmentation wall; limits blast radius rather than stopping anything.
- **The Circuit Breaker** — sheds load automatically when a dependency degrades; prevents
  cascading failure at the cost of some rejected visitors.
- **The Canary** — an early-warning unit that dies first and loudly.
- **The Air Gap** — a physically disconnected backup; immune to everything network-borne,
  useless for anything fast.

---

## 5. Unlocks and Discovery

Design principle: **unlocks should come from things that happened, not from a shop.** The
best unlocks are the ones you earn by surviving something, by noticing something, or by
being forced into something.

### 5.1 Unlock triggers

- **Survive-It Unlocks** — surviving your first amplification attack unlocks *Response Rate
  Limiting* and the *BCP38 Egress Filter*. Surviving a rebuild storm unlocks *Hot Spares*
  and *Erasure Coding*.
- **Fail-It Unlocks (the scar path)** — losing a level to a generator that wouldn't start
  unlocks *Monthly Load Test* permanently and adds a wry line to the tooltip. Failure
  teaches, which makes failure less punishing and more interesting.
- **Autopsy Unlocks** — after any incident you can spend time on a *post-mortem*. Spending
  it converts the incident into a permanent knowledge unlock; skipping it gets you back to
  revenue faster. A recurring, meaningful tradeoff.
- **Volume Unlocks** — host 100 accounts → unlock *Reseller Panel*. Push 1 Gbps → unlock
  *Peering Eligibility*. Store 1 PB → unlock *Erasure Coding*.
- **Relationship Unlocks** — keep a whale happy for 12 months → they introduce you to
  another whale. Treat a bug-bounty hunter well → they become a recurring ally.
- **Intel Unlocks** — honeypots and sinkholes generate *Intel*, spent in a research tree to
  fingerprint attackers, pre-empt waves, or sell threat feeds as a product.
- **Hire Unlocks** — hiring a network engineer unlocks BGP entirely. Hiring a compliance
  officer unlocks the regulated branch. Staff are keys, not just labor.
- **Certification Unlocks** — passing an audit unlocks a client segment and a price tier.
- **Acquisition Unlocks** — absorbing a competitor gives you their tech, their customers,
  and their technical debt.
- **Geography Unlocks** — entering a new region unlocks region-specific tech (free cooling
  in the north, solar in the desert, hydro power, subsea cable landing).
- **Era Unlocks** — time advances; new tech appears and old tech becomes unsupported
  (a nice forced-modernization pressure).
- **Discovery by Inspection** — some things you only learn by clicking: opening a rack you
  inherited reveals what's in it; running a trace reveals the real path; a floor walk
  reveals the propped-open door. Rewards curiosity directly.

### 5.2 Tech branches (sketch)

- **Density Branch:** blanking panels → containment → in-row cooling → rear-door HX →
  direct liquid → immersion. Each step raises kW-per-rack ceiling, which raises revenue
  ceiling and heat risk.
- **Availability Branch:** backups → tested backups → replicas → multi-AZ → multi-region →
  active-active. Each step multiplies cost and unlocks a higher SLA tier you can *sell*.
- **Security Branch:** firewall → segmentation → IDS → WAF → SIEM → zero trust → threat
  intel. Gates regulated business lines.
- **Network Branch:** single transit → multihomed BGP → IX peering → anycast → private
  backbone → your own dark fiber. Each step cuts per-bit cost and adds operational risk.
- **Automation Branch:** manual → scripts → config management → full provisioning API →
  self-healing. Cuts staff need, raises blast radius.
- **Commercial Branch:** hourly billing → monthly → annual contracts → multi-year colo →
  reserved capacity → build-to-suit. Trades flexibility for predictability.
- **Efficiency Branch:** PUE improvements, waste heat reuse (sell heat to a greenhouse or
  district heating — a real thing and a lovely late-game revenue line), on-site solar,
  battery arbitrage (charge cheap, discharge at peak — genuinely profitable and a fun dial).
- **Sustainability/Politics Branch:** renewable PPAs, water-free cooling, community
  investment. Unlocks permits in restrictive regions and deflects the community-opposition
  threat.

### 5.3 Unlocking whole new lines of business

Each line has an **entry requirement**, a **conversion cost**, and a **synergy**:

- **Shared → VPS:** needs virtualization + provisioning automation. Synergy: same customers,
  upsell path. Risk: outbound abuse from your own tenants.
- **VPS → Dedicated/Bare Metal:** needs inventory and remote hands. Synergy: higher ARPU.
- **Anything → Colo:** needs your own building. Synergy: your excess power/space becomes
  product. Risk: you lose control of what's inside the cabinet.
- **Colo → Wholesale:** needs multi-MW capacity and a credit-worthy balance sheet.
- **Web → Email:** needs reputation management. Synergy: bundling. Risk: one spammer
  poisons everything.
- **Web → DNS:** needs anycast. Synergy: it's the cheapest sticky product in hosting.
- **Storage → Backup/DR:** needs retention policy and restore testing. Synergy: recession-
  proof revenue.
- **Backup → Compliance/Archival:** needs WORM + chain of custody + auditors.
- **Compute → GPU/AI:** needs power density and cooling. Synergy: enormous. Risk: enormous.
- **GPU → HPC/Render:** needs a scheduler and interconnect.
- **Anything → CDN:** needs many PoPs and peering. Synergy: makes every other product faster.
- **Anything → Bulletproof:** needs no technology at all, only a decision. Immediately
  profitable, slowly fatal. The most interesting unlock in the game because its cost is
  entirely downstream.
- **Hosting → Software:** productize your own control panel and sell it to other hosts. A
  meta-unlock that changes the revenue model from capacity to licenses.
- **Hosting → Transit/Carrier:** sell bandwidth to other providers; you become someone
  else's upstream, with all the abuse-desk duties that implies.
- **Hosting → Managed Services:** sell *people* instead of *machines*. Highest margin, least
  scalable, changes the whole staff layer into the product.

### 5.4 Discovery mechanics (the "I didn't know that was in here" layer)

- **The Undocumented Machine** — inherited hardware whose function is unknown. Options:
  unplug it and find out (fast, risky), trace its cables (slow, safe), or leave it forever.
- **The Hidden Dependency Graph** — dependencies you didn't build are *discovered* by
  incidents. The game keeps a map of what you know vs. what's true, and closing the gap is
  itself a progression system.
- **The Forgotten Subnet** — an old IP range still routed to something. Discovered by a
  scanner finding it before you do.
- **The Ghost Customer** — an account with no contact info still consuming resources.
- **Cable Archaeology** — in colo levels, tracing a mystery cross-connect; the payoff can
  be a free existing circuit you didn't know you had.
- **Vendor Rep Relationships** — cultivating a hardware vendor unlocks early access,
  better lead times, and a phone number that actually answers during a shortage.
- **Research Papers / Conference Talks** — spend staff time to learn a technique; the
  knowledge is permanent across the campaign.
- **The Wiki** — as you discover things, they get written down. A literal in-game knowledge
  base that new staff read to onboard faster. Building it is optional and compounding.

---

## 6. Economy, Money, and Scoring

### 6.1 Revenue streams

- **Recurring Subscription (MRR)** — the spine. Monthly per-account. Predictable, slow to
  grow, slow to lose. The "tick" of the game's economy.
- **Setup Fees** — one-time, front-loaded cash. Tempting when cash-starved; discourages signups.
- **Metered Usage** — bandwidth, GPU-hours, storage-GB, API calls. Scales with traffic,
  which means a viral customer is both a cost and a windfall.
- **Egress Fees** — object storage's dirty secret and a great mechanic: customers hate them,
  they're pure margin, and waiving them is a competitive weapon.
- **Overage Billing** — the customer exceeds their plan. Free money that generates support
  tickets and churn risk. Tunable: bill it, warn it, or absorb it.
- **Power Billing (colo)** — by circuit (sell the breaker) or by metered draw. Selling the
  circuit is simpler and lets tenants under-use what they paid for — a pure-margin pattern.
- **Space Rent (colo)** — per rack, cabinet, cage, or square foot; multi-year contracts with
  annual escalators.
- **Cross-Connect Fees** — tiny monthly amounts, enormous margin, near-zero churn.
- **SLA Credits (negative revenue)** — you pay customers back for downtime. Selling a
  99.99% SLA raises price AND raises this liability. A genuinely strategic pricing dial.
- **Professional Services / Migrations** — one-off labor revenue that consumes staff.
- **Managed Add-ons** — backups, monitoring, patching, WAF, a control panel license. High
  attach-rate upsells that are where hosting margin actually lives.
- **Reserved / Prepaid Capacity** — customer pays a year up front at a discount. Cash now,
  capacity locked, margin lower. Excellent when insolvency-running.
- **Reseller Wholesale** — volume at low margin.
- **IP Address Leasing** — scarce IPv4 becomes a rentable asset in later eras.
- **Heat Reuse / Grid Services** — sell waste heat, or sell demand-response capacity back to
  the utility (you agree to drop to generator during grid peaks, and get paid for it).
  Deliciously real, and it turns your generator from a cost into a profit center with risk.
- **Threat Intel Feed** — productize the Intel your honeypots generate.
- **Referral/Affiliate Payouts (negative)** — you pay for word of mouth you didn't earn.

### 6.2 Cost structure

- **CapEx** — hardware, build-out, switchgear. Lumpy, depreciated over 3-7 years. Buying a
  server is not a cost event, it's a *schedule* — and the game should show the depreciation
  tail, because that's what makes a mining crash or an AI-rate crash hurt.
- **Power** — the dominant operating cost in dense levels. Two components: consumption
  (kWh) and **demand charge** (your highest 15-minute peak in the month, which prices the
  entire month). Peak-shaving with batteries directly attacks this — a superb mechanic.
- **Cooling** — expressed via **PUE**: total facility power / IT power. Every efficiency
  build lowers it; every hot spot raises it. A single, legible number to optimize.
- **Bandwidth** — **95th percentile burstable** billing: your five worst percent of traffic
  are free. Means a short spike is free and a sustained one is expensive. This is a real
  billing model and it makes traffic shaping strategic.
- **Transit vs. Peering Mix** — peering is cheaper per bit but requires ports and
  relationships; the blend is an optimization puzzle.
- **Rent / Mortgage / Property Tax** — site cost.
- **Payroll** — the biggest line in managed businesses; scales with support load.
- **Licensing** — per-core OS/virtualization/control-panel fees that scale badly with density.
- **Hardware Failure Replacement** — actuarial; a spares pool is insurance.
- **Insurance** — required for some clients; premiums drop with fire suppression, security,
  and a clean incident history.
- **Abuse Handling Cost** — staff time per complaint.
- **Chargebacks and Fraud Loss.**
- **Marketing Spend** — CAC, which should be explicitly compared against LTV in the UI.
- **Interest / Debt Service** — if you financed the build.
- **Decommissioning / E-waste Disposal** — the bill at the end of the depreciation tail.

### 6.3 Cash-flow mechanics (the part most tycoon games skip and shouldn't)

- **Cash vs. Profit** — you can be profitable and die. Invoices are paid on NET-30; payroll
  is not. A visible *runway in days* counter alongside profit.
- **Receivables Aging** — a bucket of money owed to you, with a collection minigame:
  dunning emails, service suspension (which loses the customer AND the money), or writing
  it off.
- **Deposit / Prepay Requirements** — demand prepayment from risky customers; fewer signups,
  less bad debt.
- **Credit Line** — expensive emergency cash with an interest cost and a covenant that
  triggers if your metrics slip.
- **Vendor Terms** — negotiating NET-60 with your hardware supplier is a legitimate,
  unglamorous power move that saves a level.
- **The Payroll Clock** — a recurring hard deadline. Missing it costs staff, not just money.
- **Seasonal Cash Dips** — annual renewals cluster; a January cash bulge and a June drought.
- **Capital Injection Events** — angel, VC, private equity, a bank loan, or bootstrapping.
  Each changes the win condition: VC demands growth, PE demands margin, a bank demands
  covenants, bootstrapping demands patience.

### 6.4 Pricing as gameplay

- **The Price Slider** — per product line, with a live elasticity readout. Cheap = volume +
  worse customers + thinner margin. Expensive = fewer, better, more demanding customers.
- **Oversell Ratio** — the shared-hosting core dial. Sell 10x your real capacity and you
  profit until one wave arrives. A slider with a visible risk gauge.
- **Tier Design** — you design the plans themselves: how much disk, how much bandwidth,
  what's included. Badly designed tiers attract exactly the customers you don't want.
- **Grandfathering** — old customers on old prices. Raising prices triggers churn AND
  reputation damage; never raising them slowly strangles you.
- **Contract Length vs. Discount** — longer term, lower price, but you're locked in if costs
  rise.
- **SLA Tier Pricing** — sell 99.9 / 99.95 / 99.99; the higher tiers need real redundancy
  investment or you're selling a liability.
- **Loss Leaders** — a cheap entry product designed for upsell; measure attach rate.
- **Free Trial Abuse Rate** — the tuning knob between growth and fraud.

### 6.5 Scoring

- **Primary Score: Company Value** — a multiple of profit adjusted by growth rate, churn,
  concentration risk, and reputation. Makes "ugly profitable" and "beautiful unprofitable"
  both losing strategies.
- **Star Ratings per Level** on several axes so you can replay for different stars:
  **Uptime**, **Profit**, **Growth**, **Reputation**, **Efficiency (PUE/cost per unit)**,
  **Safety (no incidents)**.
- **The Five Nines Meter** — cumulative uptime with a *minutes-of-downtime-remaining-this-year*
  budget. 99.99% = 52 minutes a year. Watching that budget drain is inherently dramatic.
- **Reputation** — split into segment-specific reputations (developer cred, enterprise
  trust, gamer goodwill, compliance standing). Actions that raise one can lower another;
  taking a gray customer raises revenue and lowers enterprise trust.
- **Heat Meter** — for bulletproof/gray play. Rises with abuse complaints and unsavory
  customers; at thresholds, upstreams, payment processors, and then authorities act.
- **Technical Debt Meter** — accumulates from shortcuts; raises the probability of human-error
  threats and slows every future build. Payable down with refactor/cleanup actions.
- **Customer Satisfaction (NPS)** — drives referrals and churn probability.
- **Concentration Risk** — % of revenue from your largest client; a scoring penalty that
  makes the Whale strategy genuinely double-edged.
- **Win conditions:** survive N waves; hit a revenue/MRR target; keep uptime above X; pass
  the audit; complete the migration with zero dropped visitors; keep every tenant's SLA
  intact; reach a valuation; retire with the company still standing.
- **Lose conditions:** cash below zero past the grace period; reputation floor; losing your
  last upstream; a seizure/shutdown; every customer churned; a fire that destroys the
  facility; an unrecoverable data-loss event (the only truly unforgivable failure — and it
  should end the level immediately and quietly, which is scarier than an explosion).
- **End-of-Level Report** — an operator's-eye debrief: uptime, incidents by cause, MTTR,
  revenue by line, churn reasons, the three most expensive mistakes, and a one-line
  "post-mortem headline" generated from the level's events.

---

## 7. Core Gameplay Mechanics

### 7.1 The two-directional core loop (making it actually work)

- **Two Lanes, Opposite Directions** — visitors flow *inward* along a green path to reach
  your services; threats flow *inward* along the same or a parallel path. The twist that
  makes it a real design instead of a gimmick: **most defenses sit on the shared segment**,
  so every filter you place taxes both populations. Anti-DDoS adds latency. A WAF adds
  false positives. A captcha adds friction. You are always deciding how much revenue to
  spend on safety.
- **The Funnel** — the path narrows toward you: internet edge → transit → border → firewall
  → load balancer → service → data tier. Depth is a resource: a deeper funnel is more
  defensible and slower.
- **Return Path** — visitors that are served successfully walk *back out* carrying money and
  satisfaction. Seeing them leave happy (or leave angry, in red) is the feedback channel.
  A satisfied visitor occasionally splits into a referral unit at the exit.
- **Capacity as Terrain** — each service node has a throughput and a queue. Overloaded nodes
  turn amber then red; queues visibly stack up; visitors in a red queue start leaving.
- **Blast Radius** — every node has a dependency set. When it fails, everything downstream
  highlights. Bulkheads and segmentation literally draw walls that stop the red from
  spreading across the map.

### 7.2 Connection interaction design (the brief's explicit question)

Multiple complementary schemes, layered by zoom level:

- **Drag-a-Cable (primary, tactile)** — click and hold a port on the web server object, drag;
  a cable follows the cursor with realistic slack/catenary; valid targets glow, invalid ones
  gray out with a reason tooltip ("no free NIC", "different VLAN", "would cross a security
  boundary"). Release on the DB server to connect. The cable stays as a visible, colored,
  routed line. **Cable color = link type** (copper amber, fiber yellow/aqua, power red/blue
  for A/B feeds, management gray, cross-connect white).
- **Port-and-Socket Discipline** — objects have a finite number of visible ports. You can
  *see* that a switch has 24 and 19 are used. Running out of ports is a physical, legible
  constraint that teaches you to buy the bigger switch. Pulling a cable out is a drag-away
  gesture with a satisfying unplug sound and an immediate, visible consequence.
- **Wiring Mode (bulk)** — press W (or a toolbar tab) and the world desaturates into
  schematic mode: racks become boxes, ports become labeled dots, and you can drag many
  links quickly, rubber-band-select groups, and use "connect all selected to X" for a rack
  of 20 machines. Essential once you're past ~30 objects.
- **Click-to-Link (accessibility/controller)** — click source, click target. Same result,
  no drag. Always available, never the only option.
- **Adjacency-Implied Links** — inside a rack, a server placed directly under a switch
  auto-patches to it (with a faint auto-generated cable). Explicit cables override.
  Removes tedium for the common case while keeping the mechanic visible.
- **Policy Links (late game)** — at DC scale you stop wiring individual machines and start
  drawing *rules*: "all web tier → this DB cluster." The visual becomes a thick trunk
  between groups, with a fan-out you can expand on demand. Progression literally changes
  the interaction model, which is a nice way to express growing seniority.
- **Cable Management as a Stat** — the game tracks messiness. Spaghetti raises repair time,
  raises the chance a tech unplugs the wrong thing, and tanks colo tour conversion. A
  "Cable Management" action (or a staff task) tidies runs into neat bundles, with a
  genuinely satisfying visual snap into velcro'd rows. Purely cosmetic-seeming, mechanically
  real — a favorite kind of mechanic.
- **Connection Health Overlay** — once made, a link shows: utilization (thickness/glow),
  errors (flickering red dashes), latency (particle travel speed), and redundancy status
  (a dual-path link draws as two strands; when one dies, the survivor pulses).
- **Dependency Inspector** — hover a node, hold a key: everything it depends on lights blue,
  everything depending on it lights orange. Instantly answers "what breaks if I reboot this."
- **Miswiring Is Allowed** — you *can* plug both power supplies into the same PDU. Nothing
  stops you. The game never blocks it, it just quietly marks the rack as single-fed in the
  power overlay, and one day the breaker trips. Letting players make real mistakes that are
  visible in an overlay they chose not to look at is the heart of the fantasy.

### 7.3 Placement

- **Nested Grids** — a floor grid holds rows; rows hold racks; racks hold U-slots; U-slots
  hold gear. Zooming in and out moves between grids with continuous animation.
- **Physical Constraints** — U-height, depth, weight per tile, power per circuit, heat per
  rack, airflow direction. A rack that's too hot glows; a floor tile over its weight limit
  warns.
- **Airflow Simulation (light)** — hot exhaust flows in a direction; blocking it with a
  badly oriented machine creates a hot spot you can see in a thermal overlay. Containment
  literally draws walls that channel the flow.
- **Latency Geometry** — in multi-region levels, physical distance on the world map equals
  latency. Placing a PoP closer to a population center is the whole optimization.
- **Legacy Placement Debt** — you can't always move things. Relocating a live service costs
  a maintenance window.

### 7.4 Time, waves, and pacing

- **Two Clocks** — a fast *tick* clock (traffic, attacks, per-second events) and a slow
  *calendar* clock (billing, contracts, hiring, depreciation, audits). Pausing affects both;
  speed-up affects the fast one more. The tension between a 3-second outage and a 30-day
  invoice cycle is the game's texture.
- **Wave Structure** — each wave is a *named incident* with a visible preview: "Wave 7:
  Evening Peak + Firmware Recall." Preview quality improves with monitoring investment
  (unmonitored players fly blind, which is both realistic and a great upgrade motivation).
- **Build Phase vs. Live Phase** — but with leakage: you *can* build during a wave, at a
  risk multiplier and with a change-freeze penalty if you're in a regulated level.
- **Maintenance Windows** — schedule risky changes for 3am. Doing risky work during peak
  has a much higher failure chance. Scheduling is a real decision with a real calendar.
- **Attention as the Real Resource** — late levels deliberately create simultaneous demands
  so the scarce resource is *you*. Automation exists specifically to buy attention back.
- **Pause-and-Plan** — full pause with full interaction, because this is an operations game
  and panicking should be optional.
- **Slow-Motion Incident Mode** — during a major failure, the game can drop to 0.25x so a
  dramatic cascading outage is legible instead of a blur.

### 7.5 Upgrades and the failure spiral

- **In-Place Upgrades** — add RAM, swap a disk, upgrade a switch. Requires downtime unless
  you built redundancy — making redundancy pay off *twice* (uptime AND maintainability),
  which is exactly how it works in reality.
- **Rolling Upgrades** — with N+1, upgrade one at a time with no downtime. A satisfying,
  visible sequence.
- **Firmware/Patch Cadence** — a recurring chore with a compounding risk if skipped. Skipped
  patches raise vulnerability probability visibly.
- **Degradation, Not Death** — nodes rarely die outright; they get slow, throw errors, drop
  1% of packets. Detecting "brown" failures is harder and more interesting than detecting
  black ones.
- **Cascading Failure Rules** — a failure raises load on peers, which can push them over,
  which raises load further. Circuit breakers and load shedding are the designed counters.
  The game should absolutely allow a full cascade and make it *survivable but expensive*.
- **The Death Spiral** — outages → churn → less revenue → can't afford redundancy → more
  outages. The game must show the spiral clearly and offer non-obvious exits (cut a product
  line, raise prices on the loyal, take a loan, sell hardware, pivot the business type).
- **Recovery Is Gameplay** — restoring from backup is a timed, multi-step process you
  actually perform: locate the backup, verify it, restore, replay logs, validate, cut over.
  Each step can fail. This turns "you had backups" into a real scene.

### 7.6 Automation and orders

- **Policies, Not Clicks** — as you scale, you author rules: "if queue depth > 80%, spin up
  a node"; "if attack > 5 Gbps, engage upstream scrubbing"; "if disk SMART warns, order a
  replacement." Automation executes while you're busy elsewhere and occasionally does
  something stupid at exactly the wrong moment (which you can then tune).
- **Runbook Cards** — pre-authored incident responses you drag onto an active incident.
  Building your runbook library IS the meta-progression of an ops game.
- **Alert Routing** — decide what pages a human at 3am vs. what waits. Over-paging burns
  out staff; under-paging misses incidents. A deliciously real dial.
- **Delegation** — assign a senior engineer to "own" a subsystem; they handle its routine
  incidents without you. Frees attention, costs salary, and they can be wrong.

### 7.7 Misc mechanics worth stealing

- **The Change Log** — everything you do is recorded. After an incident, you can review the
  change log to find the cause. Players who label their changes get faster diagnosis. This
  makes documentation a mechanic.
- **The Ticket Queue as a Lane** — support tickets literally walk into a queue lane and
  age; overdue ones turn red and spawn churn events.
- **The Phone** — high-value customers call. Answering costs attention but prevents churn.
- **Fuel, Spares, and Consumables** — inventory that must be ordered ahead with lead times.
- **The Maintenance Backlog** — a list of deferred tasks, each with a growing risk value.
  You'll never clear it; you choose what to let rot.
- **Two-Person Rule** — some dangerous actions require two staff available, which makes
  staffing levels matter during night shifts.
- **The Undo That Isn't** — some actions (deleting data, terminating a contract) require a
  typed confirmation and cannot be undone. Rare, weighty, memorable.

---

## 8. Visuals and Presentation

### 8.1 Art direction options

- **Option A — "Isometric Technical"** (recommended default): clean isometric 3/4 view,
  flat-shaded with crisp outlines, saturated status colors on a desaturated equipment
  palette. Reads well at any density because *color is reserved for state*, not decoration.
- **Option B — "CRT Operator"**: the whole game rendered as a period-appropriate terminal /
  NOC display — phosphor green for the dial-up era, amber for the 80s, Win95 gray for the
  90s, dark-mode dashboards for modern. Era shifts become full UI re-skins.
- **Option C — "Diagram Made Physical"**: network-diagram aesthetic where objects are
  stylized icons and cables are bezier curves, but with real weight, dust, and blinking
  LEDs. Best of both legibility worlds.
- **Option D — "Cutaway Dollhouse"**: the datacenter as a cross-section building you can
  peel open floor by floor. Great for showing facility systems (power path, chilled water
  loop) that are invisible in a top-down view.
- **Unified rule across all options:** *state is color, identity is silhouette*. You should
  be able to tell what something is with the color drained out, and tell how it's doing
  with the shapes blurred.

### 8.2 What things look like

- **Server (1U/2U)** — a thin slab with a front bezel, a row of drive LEDs, and a power
  LED. Healthy: a slow green breathing pulse. Busy: LEDs flicker fast. Degraded: one amber
  drive LED. Failed: dark with a red fault LED and a small smoke wisp if it's serious.
- **Rack** — a vertical frame with visible U-slots. Empty U's are dark gaps. A full rack
  looks *dense and alive*; an over-hot rack has a heat shimmer over it.
- **Switch** — a shallow unit with a dense strip of link LEDs; each active port's LED
  flickers in sync with the traffic on its cable. Beautiful and informative.
- **Router** — heavier, with big optic ports and a sparse but confident LED pattern.
- **Storage Array** — a fat chassis packed with drive bays, each with its own LED. A rebuild
  is a visible wave of blinking across the bays and a progress ring.
- **Tape Library** — a tall cabinet with a window; a tiny robot arm visibly moves cartridges.
  The most charming object in the game.
- **GPU Node** — oversized, fan-dense, with a visible heat plume and a power cable as thick
  as a wrist. Should look *expensive and slightly dangerous*.
- **UPS** — a bank of batteries with a charge bar; on utility loss it goes into a distinct
  "on battery" state with a drain timer and an audible tone.
- **Generator** — outside the building, with a fuel gauge, an exhaust animation when running,
  and a start-up sequence (crank, cough, settle) that is genuinely tense during an outage.
- **CRAC Unit** — a big box with visible airflow arrows; failing units' arrows fade.
- **Firewall / WAF** — a gate structure straddling the traffic lane; its rule set visualized
  as a set of grates that visibly slam on blocked units.
- **Load Balancer** — a Y-junction that visibly distributes; its weighting shown as how many
  units go each way.
- **Cache** — a glowing reservoir that fills; a hit is a unit bouncing straight back out
  (fast, bright), a miss is a unit continuing deeper (slow, dim).
- **Honeypot** — deliberately gaudy: a slightly-too-shiny box with a fake label. Attackers
  crowd it. Funny and readable.
- **Cross-Connect Panel** — a patch panel with neat fiber runs; each one a revenue line
  literally drawn across the room.

### 8.3 What visitors look like

- **Web pageview** — a small rounded packet with a page glyph, moving quickly, tinted by
  content type.
- **Game player** — a little avatar with a ping number floating above it that turns from
  green to yellow to red as latency climbs. When it hits red, they visibly turn around.
- **API call** — a tiny, fast dart; they come in streams that read like a flow of sparks.
- **Backup job** — a slow, heavy freight crate that takes real seconds to traverse; you
  *feel* the weight.
- **Restore** — the same crate, but glowing gold and urgent, going the other direction.
- **Inference request** — a small glowing orb that visibly "thinks" (a spinner) at the GPU
  node and leaves brighter.
- **Training job** — not a unit at all: a big translucent block that lands on a cluster and
  *occupies* it for a long time, visually reserving the space.
- **SIP call** — a continuous ribbon rather than a packet; jitter shows as fraying in the
  ribbon's edge.
- **Email** — an envelope; outbound envelopes get stamped ACCEPTED, DEFERRED, or REJECTED
  at the far edge, which makes deliverability legible.
- **Streaming viewer** — a small eye icon; rebuffering shows as a stutter ring.
- **Colo prospect (tour)** — a walking human figure with a clipboard who physically moves
  through your facility, pausing at things and emitting little thought bubbles ("dusty",
  "nice containment", "is that door propped open?").
- **Dial-up caller** — a phone handset icon that either connects (a handshake squiggle) or
  gets a busy signal (a red bounce with the classic two-tone).
- **Referral** — a visitor exiting happy occasionally splits into a small golden duplicate
  that walks off-screen and comes back later as a new signup. The visual literally shows
  word of mouth compounding.

### 8.4 What threats look like

- **Volumetric DDoS** — not individual units but a *rising flood* — a dark tide filling the
  uplink lane with a fill-level indicator against your capacity line. Scrubbing shows as the
  tide passing through a filter and emerging thin.
- **Slowloris** — spidery units that reach the gate and *cling*, each one holding a
  connection slot you can see being occupied on a meter.
- **Bot/Scanner** — small insects that crawl the perimeter probing for openings; they cluster
  instantly on anything newly exposed. A newly-opened port should attract a visible swarm
  within seconds — the best possible teaching visual.
- **Credential stuffing** — a rain of keys hitting a lock, with a counter.
- **Exploit** — a sharp, fast projectile with a CVE label; it either shatters on a patched
  service or punches through and leaves a glowing breach marker.
- **Ransomware** — a creeping crystalline frost that spreads node to node along dependency
  links, freezing them one at a time. Air-gapped assets are visibly outside its reach.
- **Insider** — no visual at the perimeter at all; it appears *inside*, which is the point.
- **Hardware failure** — a dull thunk, an LED going amber, a small wrench icon appearing.
  Deliberately undramatic: the boring killer.
- **Thermal event** — a heat map bleeding from blue to orange to white, with a countdown to
  thermal shutdown.
- **Power event** — the room lights literally change: utility (white) → UPS (amber, with a
  hum) → generator (a warmer, flickering tone with an exhaust plume outside).
- **Fire** — the alarm strobe, the pre-action countdown, then a whoomp of gas and total
  silence as everything stops.
- **Regulatory/legal threat** — a paper envelope that walks in the front door, immune to
  every firewall. Wonderfully deflating and thematically perfect.
- **Nation-state** — visible only as an *absence*: a faint anomaly marker in your logs that
  you only see if you built the right tooling. Represent it as a barely-visible shimmer.

### 8.5 Expressing actions and state

- **Money** — floating +$ / -$ numbers at the point of cause, colored and sized by
  magnitude; a bottom bar with cash, MRR, runway-in-days, and a sparkline. Recurring
  revenue ticks in with a soft repeating chime that becomes the game's heartbeat.
- **Connections being made** — the cable snaps taut with a satisfying click; a brief pulse
  travels the new link to confirm it carries traffic; the link's endpoints flash green.
- **Upgrades** — a scaffolding/progress overlay on the object, a work-light glow, a tech
  unit physically walking to it and standing there. Completion is a bright ring-out pulse
  and a small stat popup showing what changed.
- **Defenses firing** — filters "clack" like a turnstile; scrubbing looks like a sieve;
  a blackhole is a literal dark circle that swallows a lane and dims the customer behind it
  (so you *see* the collateral damage of the decision you made).
- **Failures** — three tiers of feedback: a subtle LED change (routine), a screen-edge amber
  vignette + toast (notable), a full desaturation + alarm + slow-motion (critical). Never
  more than one critical treatment on screen at once, or it stops meaning anything.
- **Alerts** — stack in a corner, aged by color, dismissible, groupable. Alert fatigue is
  simulated by making the stack genuinely hard to read when you've over-alerted.
- **Latency** — shown as *particle speed on the wire*, not a number. A slow link visibly
  crawls. Numbers are available on hover for precision.
- **Utilization** — cable thickness and glow; node fill bars; a rack's overall "temperature"
  in the thermal overlay.

### 8.6 Overlays (the readability-at-scale answer)

Hotkeyed, exclusive overlays that recolor the whole map by one dimension:
**Power** (A/B feeds, circuit load, single-fed racks flagged) · **Thermal** (heat map, hot
spots, airflow arrows) · **Network** (link utilization, VLANs, redundancy) ·
**Security** (trust zones, exposed services, unpatched nodes) · **Money** (revenue and cost
per object — the most addictive one) · **Customer** (color by tenant; shows blast radius per
client) · **Age/Warranty** (what's out of support) · **Dependency** (what depends on what) ·
**Noise/Alerting** (what's paging whom). Overlays are how a 40-rack floor stays legible.

### 8.7 Scale readability

- **Semantic Zoom** — zoomed in, you see individual drive LEDs; mid-zoom, per-server health
  bars; far zoom, racks become colored blocks and rows become bars. Detail is *replaced*,
  not just shrunk.
- **Aggregation Badges** — a rack shows "3 warnings" rather than three tiny icons.
- **The Minimap With Weather** — a floor minimap tinted by whatever overlay is active, so
  you can spot a hot corner or a dark (powerless) row from anywhere.
- **Audio as a Channel** — the DC's ambient hum rises with load, fans spin up audibly when
  a rack heats, drive chatter during a rebuild, the distinct tone of UPS-on-battery, the
  silence after suppression discharge. An experienced player should be able to tell
  something's wrong *with their eyes closed* — the single most authentic detail available.

### 8.8 Look per hosting type and era

- **Shared hosting:** warm, cluttered, consumer-ish; lots of small colorful account icons;
  a control-panel UI aesthetic.
- **Colo:** cold, gray, industrial, cage mesh, tenant-colored cabinets, signage.
- **GPU/AI:** dark room, dense light, liquid lines glowing, an oppressive thermal palette,
  everything slightly over-engineered.
- **Backup/archival:** dim, quiet, blue-white, a cathedral of tape; the calmest visual
  language in the game and deliberately so.
- **Game hosting:** neon accents, player avatars everywhere, a server-browser UI motif,
  energetic.
- **CDN:** a world map with glowing PoPs and arcs; the only level that looks like a strategy
  map rather than a room.
- **Email/DNS:** text-forward, log-stream aesthetics, envelopes and record tables.
- **Dial-up era (1996):** beige plastic, CRT curvature, dithered 256-color palette, modem
  lights, a phone-line motif, Windows 95 chrome, and a genuinely period-correct handshake
  sound.
- **BBS era:** ANSI art, block characters, a single phone line, a literal bulletin board.
- **Near-future:** photonics, dark-fiber ribbons, autonomous floor robots, an almost
  unmanned facility where the absence of people is the visual theme.
- **Era Transition Animation** — between campaign eras, the camera holds on your facility
  while the palette, UI chrome, and equipment silhouettes crossfade forward a decade. Cheap
  to produce, enormously satisfying.

---

## 9. Anything Else — Modes, Twists, Humor, Meta

### 9.1 Modes

- **Campaign** — the scale ladder plus era track, with persistent company, staff, scars,
  and reputation.
- **Scenario Pack** — self-contained puzzles with fixed starting conditions (the scenarios
  in §1.4), each rated on a leaderboard.
- **Endless / Sandbox** — one facility, infinite escalating waves, an economy that slowly
  tightens. Score = how long and how large.
- **Ironman** — no reloads, one save, permanent consequences. The natural home for the
  Scar system.
- **Incident Mode (short-session)** — 10-minute standalone crises: "It's 3:14am, three
  alerts, one is real." Perfect for daily challenges.
- **Daily Outage** — everyone gets the same seeded incident and competes on MTTR.
- **Historical Reenactments** — fictionalized versions of famous-shaped internet incidents:
  the BGP route leak, the certificate that expired, the region-wide cloud failure, the
  undersea cable cut, the leap-second bug, the DNS provider taken down by a botnet. Each
  with period-correct tooling and a wry epilogue card.
- **Coop (asymmetric)** — one player runs infrastructure, one runs the business (sales,
  pricing, support). They share one company and can absolutely ruin each other. The sales
  player selling an SLA the infra player can't meet is the single best comedy engine
  available.
- **Coop (shift handoff)** — players alternate shifts; you inherit whatever the last person
  left running, plus their notes (or lack of them).
- **Versus — Market Mode** — two hosting companies compete for the same customer pool.
  You can undercut, poach staff, out-market, and (if you're that sort) buy an attack.
  Customers flow to whoever serves them best, so it's indirect competition — better than
  direct combat for this theme.
- **Versus — Red vs. Blue** — one player attacks, one defends, with an economy on both
  sides. The attacker buys botnet capacity and intel; the defender buys mitigation.
- **Tenant Mode** — you're a customer *inside* someone else's facility (AI or player-run),
  which turns their reliability into your terrain.
- **Editor / Workshop** — build custom facilities, threat waves, hosting types, and eras;
  share them. The hosting-type system is inherently moddable because each type is just a
  bundle of visitor rules, threat weights, buildables, and a palette.

### 9.2 Twists and structural ideas

- **The Documentation Twist** — the game lets you write notes on objects. Late levels, or
  a coop handoff, or a returning-after-a-week save, hand you a facility you must re-learn.
  Players who documented are rewarded by their past selves. Almost no game does this and
  it's *perfectly* on theme.
- **The Inherited Mess** — start a level with a facility built by "the previous owner"
  (procedurally generated with deliberate anti-patterns: single-fed racks, one cable doing
  two jobs, an undocumented box). The first act is archaeology.
- **The Reveal Mechanic** — you don't see everything. Your map shows what your *monitoring
  covers*. Blind spots are literal dark areas. Buying observability lights up the map.
  Fog of war, but it's your own infrastructure — which is horribly realistic.
- **The Postmortem Wall** — a persistent gallery of every serious incident across your whole
  career, with its cause, cost, and what you changed. A trophy case made of failures.
- **Metric Gaming** — you can hit your SLA number while customers are miserable (measuring
  only the endpoints you control). The game notices, and reputation diverges from uptime.
  A quiet lesson delivered purely through mechanics.
- **The Slow Boss** — a boss that isn't a wave: a competitor who grows over ten levels,
  or technical debt that compounds, or a depreciation schedule that comes due.
- **Everything Is Someone's Fault, Nothing Is Simple** — root-cause analysis as a minigame
  with multiple contributing factors rather than one cause. Assigning blame to a person is
  always an option and always the wrong one (morale penalty).
- **The 2am Rule** — actions taken between 1am and 5am in-game have a higher mistake
  probability unless the staff member is fresh. Makes scheduling and staffing matter.
- **Reversible Bad Ideas** — the game should *let* you oversell 40:1, put everything on one
  breaker, host the gray customer, and skip backups. It should be profitable, briefly.
  The game's whole argument is made by letting you do the wrong thing and feel it later.
- **The Green Dilemma** — a sustainability track that costs money and unlocks clients,
  permits, and community goodwill, and that you can absolutely ignore for several levels
  before it bites.
- **The Acquisition Endgame** — a suitor appears. Selling ends the campaign with a score
  and a good epilogue; refusing continues the game with a now-funded competitor.

### 9.3 Humor and flavor (dry, insider, never winking too hard)

- **Ticket Text** — real-feeling absurd support tickets: "site is down" (it is not), "can
  you make the font bigger on my server", "I deleted the database, can you undelete it",
  "my cron didn't run" (they misspelled it), "please remove my IP from the blocklist I keep
  spamming from".
- **Achievement Names** — *It Was DNS*, *Works On My Machine*, *We'll Fix It Monday*,
  *Certificate of Achievement* (survive a cert expiry), *Five Nines and a Lie*,
  *Backhoe Season*, *The Rack Was Load-Bearing*, *Two Is One, One Is None*,
  *That Cable Was Definitely Unused*, *Rebuilt the Wrong Drive*, *Read the Runbook*,
  *Free Beer Is Not a Migration Plan*.
- **Status Page Voice** — the player writes (or picks from) status updates, and the tone
  affects reputation: honest-and-specific builds trust slowly, vague-corporate
  ("elevated error rates for a subset of users") avoids press but erodes developer cred.
  Choosing the corporate-mush option repeatedly should have a visible cumulative cost.
- **The Vendor Rep** — a recurring NPC who sells you things you don't need, is right
  exactly once, and remembers if you were rude.
- **The Forum** — an in-game community thread reacting to your outages and prices in real
  time. Brutal, funny, and a legitimate reputation feedback channel.
- **The Legacy Server With a Name** — inherited machines get names (BEHEMOTH, tiny,
  webserver2-old-DO-NOT-DELETE). Retiring one that's been running for eleven in-game years
  should get a small ceremony.
- **The One Blinking Amber LED** you never quite get around to. It's fine. It's been fine
  for two years.
- **Loading-Screen Tips That Are Actually Operations Wisdom** — "the backup you never
  restored is a rumor", "diverse paths that share a conduit are one path", "every
  monitoring gap is discovered by a customer".

### 9.4 Meta / systems ideas

- **Hosting-Type as Data** — formalize each hosting type as a bundle: visitor definition,
  patience curve, demand curve, threat weights, buildable set, cost model, scoring weights,
  palette. Then a "hosting type" is a first-class moddable object, levels can *mix* two of
  them, and the game's variety scales without new code paths.
- **Business Mix Panel** — a pie of your revenue by line, with a diversification score.
  Explicitly rewards running complementary businesses (day-peaking + night-peaking; capex-
  heavy + opex-light; sticky + high-margin).
- **The Company Wiki / Knowledge Base** as a real persistent artifact across the campaign.
- **Career Mode for Staff** — individual staff have names, histories, and arcs; your first
  junior tech can become your CTO, or burn out and leave, and it should land.
- **The Alumni Network** — staff who leave on good terms show up later at customers,
  vendors, and competitors, and their opinion of you matters.
- **Real-World-Shaped Data Mode** — optional realism toggles: true 95th-percentile billing,
  true demand charges, true PUE math, true lead times. A "hard mode" made of arithmetic
  rather than bigger enemy numbers.
- **Accessibility Commitments** — colorblind-safe status palettes (every state also has a
  distinct *shape*: triangle=warning, X=failed, ring=degraded), full pause, click-to-link
  as a first-class alternative to dragging, scalable UI, and audio cues that duplicate every
  critical visual cue.
- **Photo Mode / Facility Portrait** — export a clean render of your floor plan with stats.
  People who build things like to show them.
- **The Timeline Scrubber** — after a level, scrub through the whole run and watch your own
  incidents play back in fast-forward with annotations. Doubles as a learning tool and a
  shareable clip generator.
- **A Real Post-Level Debrief Card** — MTTR, incidents by class, the biggest avoidable cost,
  and one sentence of genuine operational advice. Turns the score screen into the most
  educational moment in the game rather than the most numeric one.
