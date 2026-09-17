# Wave 2 — General lens (informed pass)

**What this is.** A second-wave contribution written *after* reading the full merged
`hosting_game.md` (all 11,236 lines). Nothing here is a restatement of what is already in the merged
doc. It is organised in two parts:

- **PART A — NEW IDEAS.** Things not in `hosting_game.md` at all. I went hunting specifically for
  thin categories, hosting business types nobody covered, scenario shapes nobody used, and
  mechanical spaces nobody entered.
- **PART B — IMPROVEMENTS AND EXPANSIONS.** Existing entries, referenced by their exact heading name
  and section number, with: missing mechanics filled in, hand-waved numbers made concrete,
  contradictions named, and design problems flagged with proposed resolutions.

**Where the merged doc is strongest (so I stayed out of the way):** the threat bestiary (§2 is close
to exhaustive for web/infra failure), the visual colour/shape language (§8.2), the per-type ruleset
card concept (§0.2), and the scar-driven unlock philosophy (§5.1).

**Where I found the biggest gaps, in rough priority order:**

1. **There is not one concrete number in the whole economy.** No build costs, no starting cash, no
   level lengths, no patience values, no capacity units. Part B §6 proposes a full baseline.
2. **The simulation model is never written down.** Patience, latency, queueing and capacity are each
   described separately and never reconciled into one loop an engineer could implement. Part B §7
   writes the loop out.
3. **"Waves" and "continuous flow" are two incompatible models both treated as canonical.** Part A
   §7 / Part B §1 reconciles them.
4. **Automation and standing policy — the thing the whole tech tree is *for* — has no UI and no
   visual language.** You cannot see what your system will do without you. Part A §7 and §8.
5. **QoS / traffic prioritisation is absent**, despite the entire design being about a shared pipe.
   That is the most obvious missing mechanic in the document. Part A §7.
6. **Cell-based architecture / shuffle sharding is absent**, despite blast radius being a
   first-class concept. Part A §4.
7. **Whole hosting business families are missing**: certificate authority, registrar/registry,
   package registry, monitoring-as-a-service, mirror hosting, CI/build-farm hosting, Mac hardware
   hosting, privacy/VPN/Tor hosting, event & conference NOC, ad-tech real-time bidding, IXP
   operation, DDoS-scrubbing-as-a-product, secure destruction, time services, and more. Part A §1.
8. **Physical/utility/supply-chain threat space is half-covered.** Water, grid interconnection,
   transformer lead times, customs, counterfeit parts, export controls, sanctions, wildfire smoke.
   Part A §2.
9. **Several flagship buildables violate the document's own Three-Column Law** (no pure upgrades).
   Part B §4 names each and prices them.

---

# PART A — NEW IDEAS

---

## 1. Levels, scenarios, and progression

### 1A.1 New hosting business lines (not in the §0.3 catalogue)

*Each passes the document's own Three-Change Rule (§0.2): it changes what is scarce, what failure is
fatal, and who the customer is. Each is given in Ruleset-Card shape so it drops straight into §0.3's
table.*

#### "Chain of Trust" — Certificate Authority / PKI operations
You issue the certificates everyone else's padlock depends on.

**How it works:** Unit = a certificate. Scarce resource = **trust-store inclusion**, which you do not
own and cannot buy — browser and OS vendors grant it and can revoke it. Fatal failure = **a single
mis-issuance**: one certificate issued for a domain the requester didn't control ends the company,
because the punishment is removal from root stores, which is commercial death with a six-month fuse.
Customer = everyone, indirectly; your paying customers are resellers and enterprises. Patience analog
= **issuance latency** (DV in seconds, OV in days, EV in weeks).
**New mechanics:** *Certificate Transparency* — every certificate you issue is published to a public
append-only log within seconds, so your mistakes are auditable by strangers in real time and the
entire internet is your QA department. A **CT Monitor** is a defensive buildable that watches for
certificates issued *for your own customers by other CAs* (hijack detection) and for your own
mis-issuance before someone else finds it. The **Root Ceremony**: a scripted, filmed, multi-party,
air-gapped key-generation event you must perform, with witnesses, in a locked room, on a schedule —
a beautiful set-piece level with no combat, where the threat is "somebody coughed and we have to
start over." The **Revocation Problem**: revoking a cert doesn't actually stop it working for most
clients; OCSP is slow, CRLs are huge. A mass-revocation event (revoke 3 million certs in 24 hours
per baseline requirements) is a boss fight where the enemy is your customers' inability to rotate.
**Threats:** the Baseline Requirements audit; a researcher who finds your domain-validation method is
bypassable (the White Hat archetype with company-ending leverage); intermediate key compromise; a
government demanding an intermediate; a customer who wants a cert for a domain they *almost* own.
**Visual:** notarial. Wax, seals, ledgers, a vault, a ceremony room with cameras. Signature meter:
**Trust Store Inclusion**, a row of browser/OS emblems that can go dark one at a time.
**Interacts with:** §2.9 Certificate Expiry (you are the other end of that story), §1.2 The Auditor,
§5.6 (a line that cannot be entered casually — the prerequisite is years of clean audits).

#### "Whois" — Domain registrar and registry operation
The most load-bearing and least visible business on the internet.

**How it works:** Two sub-lines with completely different rules. **Registrar**: retail, thin margin,
volume, upsell-driven, and your real product is *not losing people's domains*. **Registry**: you
operate a TLD, with an ICANN contract, a mandatory data-escrow obligation, a price cap, and a
requirement to keep resolving even if you go bankrupt (the *Emergency Back-End Registry Operator*
clause — a fascinating "you are not allowed to fail" constraint).
**New mechanics:** the **Drop Catch** — expiring domains release on a schedule and a swarm of bots
races for them; running a drop-catching operation is a pure latency-and-connection-count minigame.
**EPP throughput** as the scarce resource during a drop. **Transfer wars**: a competitor sends
transfer-out requests to your customers; your only defences are registrar lock, a good renewal
experience and auth-code policy. **The Zone File Publish** — you publish the zone every N minutes and
a mistake is globally visible and unfixable for the TTL. **Registry Lock** as a premium product you
sell (and as the thing that saves your own company in §2.6's Registrar Hijack).
**Threats:** ICANN compliance notices escalating to termination; a registrant dispute (UDRP); a court
order to seize a domain; an escrow deposit that fails validation; a country demanding a suspension;
the reseller who registers 40,000 spam domains through you overnight.
**Visual:** a giant card catalogue, a stamping desk, a public ledger wall. Signature FX is the
**Zone Publish**, a wave of updated signposts propagating across the whole world map.
**Interacts with:** §3.6 Registrar Cross-Sell (now you *are* it), §2.6, §2.9 Domain Expiry.

#### "The Index" — Package registry / artifact repository hosting
You host the thing everyone's build pulls from.

**How it works:** Unit = a package download. Scarce = **bandwidth and namespace integrity**. Fatal =
a poisoned artifact served to thousands of builds, because you are now the origin of everyone's
supply-chain incident. Customer = every developer, mostly for free; you monetise private registries
and enterprise mirrors. **Your traffic is 99% robots and they never bounce, they retry.**
**New mechanics:** **Typosquat/namespace policy** as a dial (aggressive = false-positive takedowns of
legitimate packages and a viral thread; permissive = you are the delivery mechanism for malware).
**The Unpublish Problem**: a maintainer deletes a popular package and breaks the world's builds — do
you allow deletion (author rights) or freeze it (ecosystem stability)? Both answers are correct and
both generate a crisis. **Immutability as a product promise.** **Mirror lag** — regional mirrors
serving stale indexes cause "works on my machine" across a continent. **Signing and provenance** as a
late-game buildable that makes the supply-chain threat class unspawnable but costs every publisher
friction, so adoption is a slow curve you manage.
**Threats:** a malicious release of a package with 40 million weekly downloads; a
dependency-confusion attack against your *enterprise* customers via your public namespace; a
maintainer account takeover; a legal demand to remove a package 200,000 builds depend on; a crawler
that pulls the entire registry nightly.
**Visual:** a vast library of identical boxes; provenance stamps; a "downloads this second" counter
in the millions. Poisoned packages are visually *identical* until inspected — the Mimic role applied
to inventory rather than to traffic.
**Interacts with:** §2.5 Dependency Poisoning (you're the other side), §4.6 Container Registry.

#### "Who Watches" — Monitoring / observability as a service
You are the thing that tells everyone else they're down.

**How it works:** Unit = an ingested metric, log line or trace span. Scarce = **write throughput and
cardinality** (the killer: one customer adds a user-ID label to a metric and creates 40 million
series). Fatal = **being down during everyone else's outage**, because that is the only hour anybody
notices you. Customer = every other ops team — the most demanding and most technical buyers alive.
**New mechanics:** **Correlated demand** — your load spikes exactly when the internet has a bad day,
so your capacity planning is anti-correlated with your own reliability. The **Cardinality Bomb** as a
signature threat with a signature counter (ingest-time cardinality limits, which drop a customer's
data and make them furious). **The Alerting Duty** — you are contractually the thing that pages
people, so a dropped alert is worse than a dropped metric, and your architecture must prioritise the
alert path over the data path, which is a visible, buildable split. **The dogfooding paradox**: you
monitor yourself with yourself, which works right up until it doesn't, so a *second, external,
deliberately primitive* watchdog is a mandatory buildable ("the dumb canary").
**Threats:** the retention-cost spiral; a customer shipping debug logs at 400GB/day on a flat plan;
the query that scans a year; the "everyone's agent reconnects at once" storm after your own blip.
**Visual:** wall-to-wall graphs — the *only* line where the HUD and the world are the same thing.
Signature catastrophe: **the flatline**, every customer's graph going to zero simultaneously, and you
cannot tell whether the internet died or you did.
**Interacts with:** §4.6 Monitoring Stack, §2.9 The Monitoring Server Dies, §9.2 Dependency Web.

#### "Mirror" — Open-source distribution mirror hosting
Enormous bandwidth, zero revenue, maximum community reputation.

**How it works:** Unit = a package/ISO download. Scarce = **transit and peering**. Customer = nobody
pays you. Fatal = serving a *corrupted or tampered* mirror, which is community-trust death.
**New mechanics:** **Reputation-as-currency made literal** — the mirror line generates no cash and a
large amount of Engineer Reputation (§2.10's Industry-Insider stat), which unlocks peering, hiring,
and the colo/dedicated word-of-mouth channel. It is the first line whose *only* output is an
intangible, and running it is a deliberate, defensible, unprofitable strategic choice. **Release Day**
as a scheduled 40× spike whose date you know months ahead. **rsync window management.** **The `.iso`
that is 6GB and the one that is 40MB** — object-size mix as a mechanic.
**Visual:** warm, communal, a wall of distro logos, a "thank you" board. Deliberately the least
corporate-looking line in the game.
**Interacts with:** §3.6 Community Presence / Open Source Karma (this is that channel as a business),
§6.1 Reputation.

#### "Green Light" — CI / build-farm hosting
You rent compute by the minute to people whose builds are their heartbeat.

**How it works:** Unit = a build minute / a job. Scarce = **cold-start time and cache locality** — a
build farm's economics live entirely in how much dependency cache you keep warm. Fatal = a **leaked
secret between tenants' builds**, because CI runners hold production credentials for every customer.
Customer = engineering teams, who feel every second.
**New mechanics:** **Queue depth is the only metric anyone looks at** — developers tolerate slow
builds and not queued builds. **Ephemeral-vs-reused runners** as an explicit security/performance
dial: reused is fast and a cross-tenant contamination vector; ephemeral is safe and cold. **The
Monday Morning Wall** — demand is a sawtooth with a hard weekly shape and a dead weekend, so
utilisation is structurally terrible and pricing must account for it. **The Flaky Test Tax** —
customers re-run failed builds, so *their* quality problem is *your* capacity problem, and a
"flakiness report" is a product you can sell them that reduces your own load.
**Threats:** crypto-mining in free-tier CI (the most abused free product in the industry); a fork-PR
build that runs attacker code with your secrets; a customer whose monorepo needs 400GB of RAM; the
upstream API rate limit that stalls every build at once.
**Visual:** a wall of green/red status squares — the most instantly readable board in the game, and
it's real. Signature FX: **the wall going red left-to-right** as a bad dependency propagates.
**Interacts with:** §4.2 Bare-Metal Build Box (now a whole business), §2.5 supply chain.

#### "Fruit Salad" — Apple / Mac hardware hosting
A tiny, weird, real business with rules nobody else has.

**How it works:** Unit = a Mac mini (or a VM on one, capped by licence). Scarce = **physical
machines**, because the hardware cannot be meaningfully virtualised or oversold and the licence caps
VMs per host. Fatal = an OS update that bricks a fleet you cannot downgrade. Customer = iOS
developers and CI farms with no alternative, which gives you extraordinary pricing power and a
captive, annoyed customer base.
**New mechanics:** **No IPMI.** There is no out-of-band management; the buildable answer is a
**USB/HDMI capture + smart PDU + a physical robot finger**, which real operators really build, and it
is the funniest and most authentic buildable available. **The September Problem** — a vendor
announces a new OS and a new chip on a schedule you don't control, 100% of customers demand it on day
one, and your existing fleet loses 40% of its value. **Consumer hardware in a datacenter** — no
rails, no redundant PSU, no ECC, no hot-swap, and a density problem solved with laser-cut shelves.
**Warranty is retail** — you drive machines to a shop.
**Visual:** a wall of identical small silver boxes on custom shelving, cabled like a hobby project
that got out of hand, because that is exactly what it is.
**Interacts with:** §2.8 (entropy on hardware with no telemetry), §7.8 Keyhole mode.

#### "No Logs" — Privacy hosting: VPN endpoints, Tor exits, encrypted mail
You sell the absence of knowledge, and the absence of knowledge is your only defence.

**How it works:** Unit = a tunnel/session. Scarce = **clean IP reputation and upstream tolerance**.
Fatal = being shown to have logs you said you didn't have. Customer = privacy-conscious individuals
and, unavoidably, people doing crimes through you.
**New mechanics:** **The Warrant Canary** — a diegetic object you must *actively refresh* every
period; the mechanic is that you cannot lie, you can only stop telling the truth, and stopping is
itself the signal. Letting it lapse by accident (because you were busy) is a catastrophic unforced
error and a superb "boring chore with enormous stakes" beat. **The No-Log Architecture** as a
buildable with a real cost: you cannot debug what you don't record, so MTTR is permanently worse and
§7.6's diagnosis loop is played one-handed. **Exit-node abuse ratio** — a Tor exit generates abuse
complaints as a *constant*, not an event, and your operational job is managing the complaint stream
and your upstream's patience. **Jurisdiction shopping** as a map-level placement decision with real,
differing rule sets.
**Threats:** law-enforcement requests you genuinely cannot answer; an upstream who doesn't believe
you; a payment processor who won't touch you; a researcher who catches you TLS-intercepting; the
customer using your exit to attack your *other* customers.
**Visual:** deliberately featureless. No tenant names, no labels, a canary in a cage on the desk.
**Interacts with:** §1.3 Bulletproof — adjacent but ethically distinct, and worth having *both* so the
game can show the difference between "no questions asked" and "principled minimum knowledge."

#### "The Show Floor" — Event, conference and broadcast NOC
Infrastructure that exists for four days and must be perfect.

**How it works:** Unit = an attendee device / a production feed. Scarce = **RF spectrum and setup
time**. Fatal = the keynote. Customer = the event organiser, once, with a year's reputation on it.
Contract length = **one week**, making it the fastest-tempo line in the game.
**New mechanics:** **Build–Load–Show–Strike** as a four-phase level: 36 hours to build, the show runs,
8 hours to tear down and get the gear to the next city. **Spectrum management** as a genuinely new
resource: Wi-Fi channels, wireless mic frequencies, and 6,000 attendees hotspotting, with a "rogue
AP" threat that is now a *someone's phone* problem you cannot fix by policy. **The Venue** is a
hostile environment you did not design: the conduit is full, only the union's electricians may touch
power, the loading dock is shared with a wedding, and the building's own IT department is unhelpful.
**No maintenance window** — there is only "during the keynote" and "not during the keynote."
**Threats:** a power circuit shared with catering; the venue's own DHCP server; a presenter's laptop;
weather on the satellite uplink; the attendee whose gadget jams 5GHz by accident.
**Visual:** road cases, gaffer tape, cable ramps, a temporary rack in a hallway, a laminated
run-of-show. Signature meter: **the countdown to doors**, which never stops.
**Interacts with:** §1.5 (a whole level family), §4.7 (a facility you don't own).

#### "Sub-100" — Ad-tech / real-time bidding infrastructure
Every request must be answered in under 100 milliseconds or it is worth exactly zero.

**How it works:** Unit = a bid request. Scarce = **p99 latency under a hard deadline** and **QPS at a
scale nothing else in the game touches** (millions/sec). Fatal = timing out, which is invisible,
costless-looking and silently removes all your revenue. Customer = exchanges and advertisers.
**New mechanics:** **The Timeout Cliff** — unlike the patience model everywhere else, there is no
gradual bounce: you answer in 97ms and get paid, or 103ms and get nothing, and *nobody tells you*.
The purest possible expression of "p99 is the business." **Bid shading and the economics of
answering** — some requests are not worth the CPU to evaluate, so *deciding not to bid, fast* is a
capability you build. **Identity deprecation** as a regulatory-weather event that deletes 30% of your
product overnight. **Colocated with the exchange** — you must place compute inside specific
buildings, turning §7.3 placement into a map-level problem.
**Visual:** a latency histogram as the entire HUD, with the 100ms line in red and the tail past it
shaded as pure lost money.
**Interacts with:** §1.3 Exchange Colo (sibling: both are latency-as-product, one physics, one
software).

#### "The Fabric" — Internet exchange point (IXP) operation
You are the neutral ground everyone meets on, and you are not allowed to compete with your members.

**How it works:** Unit = a member port. Scarce = **members** — value grows with the square of
membership, so growth is pure network effect and a cold start is brutal. Fatal = a **broadcast storm
on the peering LAN**, the IXP's unique and famous catastrophe: one member's misconfigured router
floods a shared layer-2 domain and takes down a country's peering. Customer = networks, including
your own competitors, who must all trust you equally.
**New mechanics:** **Neutrality as a rule you can break for money and shouldn't.** You will be
offered a lucrative deal that compromises neutrality and it will cost you the membership. **Port
sizing and the upgrade dance** (a member congesting a 10G port who won't buy 100G). **The Route
Server** as a buildable that makes peering easy for small members and is a single point of a very
specific kind of failure. **Member policy enforcement**: MAC limits, BPDU filters, proxy-ARP bans —
the boring rules that prevent the famous catastrophe, which players will not buy until it happens.
**Visual:** a beautiful, cold, nearly empty room that is almost entirely patch panels and one switch
pair — the highest value-per-object ratio in the game. Signature image: the **peering matrix**, a
grid of who-talks-to-whom that fills in as the exchange grows.
**Interacts with:** §4.4 IX / Peering Port (now the other side), §6.6 cross-connects.

#### "Clean Traffic" — DDoS scrubbing as a product
The service everyone else buys in §4.4, run as your own business.

**How it works:** Unit = a protected prefix / a clean Mbps delivered. Scarce = **scrubbing capacity
and global absorption footprint**. Fatal = **collateral damage** — your mitigation drops a customer's
real users and they would rather have been attacked. Customer = other hosting companies, game hosts,
and anyone with an enemy.
**New mechanics:** **The false-positive ledger is the product.** Every other line treats false
positives as a cost; here it *is* the SLA. **Time-to-mitigate** as the contractual number, measured
in seconds, with a credit meter. **Always-on vs on-demand** as a per-customer architecture choice
with a latency cost and a detection-speed benefit. **Signature development**: novel attacks require
authoring a filter *during* the attack, a live authoring minigame where each rule you write has a
visible legitimate-traffic cost. **Your capacity is the ceiling**: you are selling protection you may
not have, which is an oversell mechanic with a moral edge.
**Threats:** an attack bigger than your total capacity; an attacker who probes your thresholds and
tunes just beneath them; a customer being attacked *because* they're your customer (someone testing
you); a peering partner who null-routes your scrubbing prefix to protect themselves.
**Visual:** the sieve (§8.7) as the entire game — traffic pours in violet and leaves cyan, and the
amber fraction falling through the wrong side is your live scorecard.

#### "In the Container" — Modular / prefab datacenter deployment
You don't operate the facility; you build and ship it.

**How it works:** Unit = a delivered, commissioned module (a POD, a container, a skid). Scarce =
**manufacturing slots and freight**. Fatal = a commissioning failure at the customer's site, in front
of the customer. Customer = telcos, militaries, miners, disaster-response agencies, and anyone who
needs a datacenter in a field in eight weeks.
**New mechanics:** **Factory-then-field**: half the level is a production line (a repeating assembly
optimisation), half is a deployment (an unrepeatable logistics puzzle to a site with no roads).
**Everything must survive a truck** — shock, vibration, and a hard weight/width limit that is a legal
constraint on what fits inside. **Commissioning as a checklist minigame** with a customer watching.
**Remote sites you can never revisit.**
**Visual:** cranes, flatbeds, shrink-wrap, a container opening to reveal a perfect cold aisle in a
desert. The best "reveal" shot available to the game.
**Interacts with:** §1.3 Edge/MEC, §1.5 Datacenter Build.

#### "Chain of Custody" — Secure IT asset disposition (ITAD) and media destruction
The end of every other line, as a business.

**How it works:** Unit = a destroyed or resold asset with a certificate. Scarce = **verifiable
custody**. Fatal = **a drive turning up on an auction site with data on it**, which is a notification
event for your customer and an extinction event for you. Customer = every regulated company and every
hosting provider, including your own other lines.
**New mechanics:** **The serial-number ledger** — every asset tracked individually from pickup to
shred; a gap in the chain *is* the failure. A **shred-vs-wipe-vs-resell** decision per asset, resale
being profitable and shredding safe; the tension is entirely margin against risk. **Witnessed
destruction** as a premium product (the customer watches by video). **The pallet that arrives with
one extra drive nobody logged.**
**Visual:** a cage, a scale, a shredder producing a satisfying river of metal confetti, a certificate
printer. Signature meter: the **custody chain**, an unbroken line of stamps that can visibly break.
**Interacts with:** §6.6 obsolescence cascade (this is the last stage), §1.3 Regulated.

#### "Stratum One" — Time, timing and precision services
You sell accurate time, and nothing you host matters more than it.

**How it works:** Unit = a synchronised client. Scarce = **GPS sky view and holdover quality**. Fatal
= **serving wrong time confidently**, which corrupts logs, kills certificates, breaks authentication
and desynchronises trading systems everywhere downstream. Customer = financial firms (regulated
timestamping obligations), broadcasters, telcos, and the whole public NTP pool.
**New mechanics:** **Holdover** — when GPS is lost, your rubidium or caesium oscillator carries you
for hours or days depending on what you bought: a purchasable "how long can I be wrong before anyone
notices" stat. **GPS jamming and spoofing** as a real, current threat with a real counter
(multi-constellation, antenna siting, spoof detection). **The leap second** as a scheduled boss.
**Being in the public pool** is free reputation and uncapped, unmonetisable load.
**Visual:** an antenna on the roof, a rack unit with an atomic-clock front panel, and a single number
— offset from UTC — drawn enormous, in nanoseconds.
**Interacts with:** §4.10 NTP Source, §2.7 Clock Drift (now your fault, for everyone).

#### "The Co-op" — Non-profit / member-owned / community hosting
Same infrastructure, completely inverted incentives.

**How it works:** Unit = a member. Scarce = **volunteer hours**, which are unreliable, unmanageable
and free. Fatal = **a governance failure** — not an outage, a vote. Customer = your owners.
**New mechanics:** **Hands you cannot direct.** Volunteers arrive with skills and enthusiasm on their
own schedule; you can ask, not assign — a genuinely different action economy and a fresh take on
Pillar P4. **The Annual General Meeting** as the boss fight: justify last year's spending to the
people who paid for it, who may vote to do something operationally insane. **Surplus, not profit** —
money above cost must be spent, refunded or reserved, so accumulating cash is itself a governance
problem. **Mission constraints** — the charter may forbid profitable lines.
**Visual:** mismatched donated hardware, a noticeboard, a kettle. Warm, shabby, beloved.
**Interacts with:** §6.11 financing (a line with no access to capital), §9.1 business modes.

#### "The Rig" — Offshore, maritime and extreme-remote hosting
Every constraint at once.

**How it works:** Unit = a workload on a platform, a ship, or a research station. Scarce = **weight,
power, and the supply boat schedule**. Fatal = anything requiring a part you don't have, because the
next delivery is in eleven weeks. Customer = energy, shipping, research, defence.
**New mechanics:** **The Manifest** — you specify what goes on the next resupply *months* ahead, so
the spares mechanic becomes a forecasting exercise with no do-overs. **Salt, vibration and roll** as
continuous entropy multipliers. **The satellite link is the only link** and it has a price per
megabyte, so telemetry itself becomes a budgeted resource: you must decide *what you can afford to
know*, the sharpest possible version of §7.6's fog of instrumentation. **Crew rotation** — your one
technician leaves in six weeks and the replacement has never seen the site.
**Visual:** steel, condensation, hazard stripes, a window with weather in it.

#### "Cold Water" — Sustainability-first hosting (heat reuse, immersion, free cooling)
A line whose product is an externality.

**How it works:** Unit = a kW of compute *and* a kW of recovered heat. Scarce = **a heat customer** —
waste heat is only valuable if someone nearby wants it. Fatal = losing the offtake agreement, which
turns your economic advantage into an expensive plumbing system. Customer = tenants who need a green
credential, plus a district heating utility, a swimming pool, a greenhouse or a distillery.
**New mechanics:** **Two revenue streams from one watt.** Placement becomes a *civic* problem: you
site next to the heat customer, not next to the fibre, and now you have a fibre problem. **Seasonal
heat demand** — nobody wants your heat in July, so your advantage is seasonal and your contracts must
price that. **Immersion cooling** as line-specific tech with real drawbacks (serviceability, fluid
cost, drip trays, warranty voids, and "you cannot just pull a drive out any more").
**Visual:** pipes, a greenhouse next door, steam, a public sign showing homes heated. The prettiest
line in the game and the best marketing screenshot.
**Interacts with:** §6.3 PUE, §6.7 grants and rebates.

#### "Lights Out" — Fully automated / zero-touch facility
The endgame of Pillar P4, run as a business line.

**How it works:** Unit = the same as any line, but **you have no hands on site at all**. Scarce =
**automation coverage**. Fatal = any physical failure whose remediation you did not pre-build.
**New mechanics:** every physical action must be converted into a machine action *in advance* or it
is simply impossible: robotic media handling, automatic workload evacuation from failing nodes,
power-cycle-by-API, and a deliberate decision to **let dead hardware stay dead** until a quarterly
truck roll. **Failure accumulation as a strategy**: you plan for 3% of the fleet being dead at any
time and size for it — a real hyperscale practice and a lovely inversion of the "fix everything"
instinct the rest of the game teaches.
**Interacts with:** §1.3 Edge/MEC, §7.8 remote-site delay.

---

### 1A.2 New level *shapes* (structures nobody used)

#### The Decommission
A level whose objective is to **turn something off, completely and safely.**

**How it works:** Sunset a product line, close a region, or retire a platform. You must migrate or
terminate every customer, prove every piece of data is destroyed (or handed back), cancel every
contract in the right order, and not break the six things you discover were secretly depending on it.
The failure state is not an outage — it is **finding out in three months that it's still running**,
or that you cancelled the circuit before the migration finished. Scored on completeness and on how
few customers you lost on the way out. A brilliant tonal counterpoint to a genre entirely about
building, and it exercises §2.9's Undocumented Dependency system harder than anything else.
**Interacts with:** §5.7 The Abandoned Wing, §3.9 The Controlled Shrink.

#### The Dry Run
You build the whole thing, and then it doesn't happen.

**How it works:** You prepare for an event — a launch, a migration, a tournament, a Black Friday —
and at the last moment it is cancelled or postponed. The level scores you on *preparation quality*
against a simulated version of the event that the game runs invisibly and then reveals. Teaches that
preparation has value even when nothing happens, which is the hardest lesson in operations and one no
game has tried to teach.

#### The Second Opinion
You are a consultant brought in to assess someone else's infrastructure.

**How it works:** You cannot change anything. You can only inspect, measure, interview and write.
Your deliverable is a **findings report**: you place markers on the board identifying risks, ranked.
At the end the game fast-forwards six months and shows what actually broke; you're scored on what you
flagged, what you missed, and — crucially — how many things you flagged that never mattered (false
alarms cost credibility). Pure diagnosis, zero building, extremely replayable, and it uses the entire
threat bestiary as an answer key.

#### The Handover
A level split across two operators.

**How it works:** The first half you build and operate. Then the level *changes hands* — the
simulation continues, but the second half is played by "the next shift," an AI (or, in co-op, another
player) who only knows what you documented. The score is theirs, and it's yours. The only thing that
transfers is what you wrote down. **This makes documentation an actual mechanic rather than a buff**,
which the merged doc wants and never achieves.

#### The Fleet Week
A level with no board at all — only a spreadsheet and a calendar.

**How it works:** Pure capacity planning. You order hardware, power and bandwidth for the next twelve
months against a demand forecast with error bars. Lead times are 8–40 weeks. You commit, and then the
game runs the year in 90 seconds and shows you where you were short and where you wasted.
Deliberately, gloriously un-tower-defense — and it is genuinely the job at Tier 5.

#### The Bake-Off
Two architectures, same traffic, side by side.

**How it works:** The screen is split. You build two different answers to the same problem with the
same budget and run the same traffic through both. The level is a controlled experiment and the score
is the difference. The best possible teaching device for "scale up vs scale out," "chokepoint vs
mesh," "cache vs capacity," and every other §7.4 fork.

#### The Inherited Contract
You must honour a promise you did not make.

**How it works:** The level opens with a signed SLA, a customer list and an architecture that cannot
meet it. You did not sign it; the previous owner did, or your own sales team did, or you did two
levels ago. You must reach the promise, renegotiate it (a costed conversation), or breach it
deliberately and manage the fallout. Three legitimate paths, no correct one.

#### The Two-Timeline Level
A level intercut between "now" and "eighteen months ago."

**How it works:** You alternate between an incident in the present and the decisions that caused it in
the past — and your past actions change the present state of the board mid-level. The pedagogical
payload is Pillar P10 (nothing has an immediate result) rendered as *structure* rather than as a
delay timer. Used once, near the end of a chapter, it is the most memorable level the game could
ship.

#### The Long Now
A level that runs ten in-game years in twenty minutes.

**How it works:** The clock is aggressive and every decision is long-horizon: lease renewals, hardware
generations, staff careers, technology transitions, a certification ladder. Incidents happen
*off-screen* and are reported as summaries. A strategy layer without an operations layer, and the
ideal transition into each new era.

#### The Understaffed Sunday
Not a crisis level — an ordinary level with a quarter of your hands.

**How it works:** Nothing dramatic happens. There is simply too much routine work and not enough
people, for forty minutes. The failure mode is *accumulation*: tickets, patches, drills and small
maintenance all slip a little, and the score is the size of the backlog you hand to Monday. The most
honest level in the game and the one that will make operators nod.

#### The Sales Engineer's Nightmare
A level where your job is to say no.

**How it works:** A stream of prospective deals arrives, each attractive, each containing a commitment
you cannot meet (a 4-hour RTO you can't deliver, an on-prem requirement, a custom SLA, a compliance
regime you don't have, a price below cost). You may accept any of them. The level runs six months
forward and shows what each acceptance did. Teaches that **the most profitable thing a hosting
company does is decline business.**

#### The Postmortem Level
You play the *investigation*, not the incident.

**How it works:** The outage already happened. You have logs, graphs, a chat transcript, three
conflicting eyewitness accounts and a publication deadline. You reconstruct the timeline by placing
events on a rail, identify contributing factors (plural — the game should never accept a single root
cause), and write the corrective actions. Your corrective actions become *actual unlocks* and *actual
obligations* in later levels. This turns §5.4's postmortem minigame into a full level type and gives
the game its most distinctive single mode.

#### The Capacity Auction
A multi-bidder negotiation level.

**How it works:** Power, space, transit, GPU allocation or IP blocks come up for sale and several AI
competitors bid. You have imperfect information about their needs. Winning at the wrong price is
worse than losing. Runs five minutes, slots anywhere, and gives the Competitor AI something to do
other than undercut you.

#### The Regulator's Sandbox
You are given a rule and must design around it.

**How it works:** The level opens with a new regulation (data residency, energy reporting,
accessibility, lawful intercept, hardware provenance) and no other objective. You must reach
compliance without losing more than X% of customers, and the real difficulty is **interpreting an
ambiguous rule** — the game gives you a genuinely ambiguous text and three plausible readings, each
with a different cost, and only tells you which was right at the audit.

---

### 1A.3 New scenarios (one-off missions)

*Stated as premise → special rule → win condition → failure texture, per the §1.5 convention.*

#### `The Transformer`
Your utility feed needs a new transformer. Lead time: 104 weeks.

**How it works:** A real and currently catastrophic constraint. You cannot grow past your current
power draw for two in-game years. Everything must come from efficiency, density management, workload
shedding, demand-response, or renting space elsewhere. **The level where you cannot buy your way
out**, and a perfect counterweight to a campaign otherwise driven by purchases.

#### `Dry Season`
The municipality restricts water use. Your evaporative cooling is now illegal.

**How it works:** Your PUE advantage evaporates and cooling costs jump 40%. Options: switch to dry
coolers (capex, worse efficiency), raise inlet temperature (hardware risk), shed load, or buy water at
a punitive rate. Introduces **WUE (water usage effectiveness)** as a second efficiency number and a
public-relations liability.

#### `Export Control`
The GPUs you ordered are now restricted for your customer's jurisdiction.

**How it works:** Mid-level a regulation lands: specific hardware cannot serve specific customers or
regions. You must identify which existing tenants are now non-compliant, relocate or terminate them,
and re-plan a build you have already paid for. Legal, technical and commercial at once, and entirely
real.

#### `Customs`
Forty servers are in a bonded warehouse and the paperwork is wrong.

**How it works:** The hardware exists, you have paid for it, and it is 4km away and unreachable. You
must serve the contracted capacity anyway — rent, borrow, oversell, or delay the customer — while a
broker slowly fixes a form. The comedy of hardware being *nearby and useless* is underexploited and
very authentic.

#### `The Counterfeit`
Your last order of optics (or DIMMs, or drives) was fake.

**How it works:** They work. Mostly. For a while. The real mechanic is **distrust**: once you know
part of your fleet is counterfeit but not which part, every unrelated failure becomes a suspect. You
can test (slow, hands), replace wholesale (expensive), or live with it. Teaches supply chain in the
most visceral way available.

#### `The Fake Employee`
The remote contractor you hired three months ago is not who they said they were.

**How it works:** Extremely current and horribly real. A "staff member" on your board has been quietly
exfiltrating and has legitimate access to everything they touched. The level is an access-review and
forensics exercise under a disclosure clock, complicated by the fact that they were genuinely
productive and their work is load-bearing. Countered retroactively by identity verification, device
management and least privilege — none of which players will have bought.

#### `Smoke`
A wildfire fifty kilometres away. The facility is not threatened; the air is.

**How it works:** Particulates clog filters in hours, corrosive gases attack contacts, outside-air
economisers must be shut (cooling cost spikes), and staff cannot safely be on site. You have days.
A disaster that never touches the building and still costs you everything — a completely different
texture from `Hurricane`.

#### `The Fire Department Cut The Power`
A fire in an unrelated part of the building.

**How it works:** There is no fire in your suite. The fire department has de-energised the building
and will not let anyone in, including to start your generator manually. Your UPS is running. The clock
is your battery. **You cannot act at all**, and the only decisions available are which workloads to
shut down gracefully by remote before the lights go out. The purest expression of powerlessness and a
genuinely great five-minute scenario.

#### `Metastable`
The trigger went away and the system is still broken.

**How it works:** A real and under-modelled distributed-systems failure: a load spike causes retries,
retries sustain the overload after the spike ends, and the system will not recover on its own even at
normal load. Restarting parts of it re-triggers it. The only fix is **deliberately shedding load below
the recovery threshold** — turning away customers to get the system back — and the player's instinct
(add capacity) makes it worse. The best "your intuition is wrong" scenario available.

#### `The Relicense`
The open-source component your entire platform is built on changes its licence.

**How it works:** Keep using it at a cost that scales with your size, fork and maintain it yourself,
migrate to an alternative over months, or ignore it and accept legal exposure. Extremely current,
deeply real, and it makes the player feel the difference between "free" and "free."

#### `The Free Thing Started Charging`
A dependency you never paid for now has a price.

**How it works:** A free TLS issuer, a free DNS, a free tier of a monitoring vendor, a public mirror,
a free API. It was invisible on your P&L and load-bearing in your architecture. The level is an
inventory exercise: you must first *discover* everything free you depend on, which is more than you
thought.

#### `The Sanctioned Tenant`
One of your customers appears on a sanctions list overnight.

**How it works:** You must terminate immediately, freeze their data (not delete it), report, and not
tell them why. Their services are load-bearing for *other* customers because they are a reseller.
Every action is legally constrained and commercially painful.

#### `Peer Review`
A big network audits your peering ratio and threatens to de-peer you.

**How it works:** Settlement-free peering usually carries an unstated traffic-ratio requirement. Yours
has drifted because you launched a video line. Options: buy transit for the excess (expensive),
rebalance by attracting inbound-heavy traffic (slow), pay for peering (galling), or lose the peer
(latency and cost). Introduces the actual rule that causes real de-peering fights, which §1.5's
`Peering War` gestures at without explaining.

#### `The Sev-0`
An incident where the correct first action is to call a lawyer.

**How it works:** You have found evidence of a breach involving regulated data. Technical instincts —
reboot, rebuild, clean up — **destroy evidence and increase liability**. The level forces the
counterintuitive sequence: preserve, isolate, document, notify, and only then remediate. The scoring
rewards restraint, which nothing else in the game does.

#### `Two Weeks' Notice`
Your most senior engineer resigns at the start of the level.

**How it works:** You have fourteen in-game days of their time. You choose, day by day, what they
spend it on: documenting, training, fixing, or handing over relationships. Whatever you don't choose
is lost permanently. A pure prioritisation scenario about the least fungible resource in the company.

#### `The Reciprocal`
A competitor calls and asks for help.

**How it works:** Their facility is down. They want to run their critical customers on your spare
capacity, temporarily, for a fee. Saying yes costs headroom and creates a precedent (and a reciprocal
claim you can call in later); saying no is free and closes a door. Introduces the **mutual-aid
agreement** as a purchasable, long-horizon insurance instrument between *rival companies* — which
happens constantly in the real industry and appears nowhere in games.

#### `The Grand Opening`
A brand-new facility, a ribbon, a photographer, and 200 guests on the datacenter floor.

**How it works:** The building is not finished. You must make the tour route perfect, keep guests away
from the parts that aren't, and — the twist — the facility is *live* with early tenants, so a real
incident may occur with press in the room. §3.3's tenant-tour mechanics as a set piece.

#### `The Slow Week After`
The level immediately following a major outage.

**How it works:** Nothing is broken. Everything is fragile. The mechanics are all social and
commercial: the post-mortem, the customer calls, the credits, the review responses, the two engineers
who want to quit, the enterprise prospect who saw the news. Scored on retained MRR and team morale.
**A level made entirely of consequences**, which Pillar P10 demands and never gets.

#### `Index Rebuild`
A single boring maintenance task that takes eleven hours and cannot be paused.

**How it works:** One long operation with a progress bar, during which everything else still happens
and capacity is halved. The entire level is "can you run the business at 50% for eleven hours." It
sounds like nothing and it is exactly what half of operations feels like.

#### `The Feature Flag That Was Left On`
A change from three months ago that was never cleaned up.

**How it works:** A dormant configuration becomes active because some *other* condition changed. The
diagnosis is impossible from present-tense evidence; you must go to the change log and read history.
Rewards the player who keeps records, punishes the one who ships and forgets.

#### `Underwater`
A submarine cable cut takes a region's connectivity for six weeks.

**How it works:** Not a blip — a *duration*. You must re-architect around a permanently worse network
for a month and a half of game time: reroute, move workloads, renegotiate, and decide whether to
refund the region or keep serving it badly. Teaches that some failures are conditions, not events.

#### `The Price of Power Went Negative`
An opportunity scenario.

**How it works:** Grid conditions make electricity free or negative for a few hours. Every
interruptible workload you built the ability to schedule now prints money. Players who built spot
tiers, checkpointing and demand-response get an enormous payoff for a boring investment; players who
didn't watch it happen to someone else.

---

### 1A.4 Campaign and progression structure

#### The Three-Act Shape (with concrete lengths)
The merged doc has a tier ladder and a scenario library and never says how long anything is.

**How it works:** Proposed: **Act I (Tiers 0–2)**, 8 levels, 10–15 minutes each, teaching the core
loop. **Act II (Tiers 3–4)**, 12 levels, 20–30 minutes each, where hosting *types* start swapping and
the business layer turns on. **Act III (Tiers 5–6)**, 8 levels, 30–45 minutes each, portfolio and
geography. Total campaign ≈ 14–18 hours. Two perspective-shift levels and one scenario per act
minimum. **A named number for level length is the single most useful thing a design doc can
contain**, because it constrains everything else.

#### The Spine and the Sidings
A campaign structure that supports the variety engine without fragmenting.

**How it works:** The **spine** is the scale ladder (Tier 0 → 6), mandatory, always
web/infrastructure-flavoured, always teaching a new core system. The **sidings** are hosting-type
levels: after each spine level you choose one of two or three type levels, and the one you pick
permanently adds that line to your company. You physically cannot play them all in one run, which
makes the campaign map a *build* rather than a checklist and gives replay a reason.

#### The Recurring Cast
Named NPCs who persist across the whole campaign.

**How it works:** Five or six characters with arcs: **the first customer** (still tiny, still paying
$10, still referring people); **the rival operator** (the competitor AI with a face, who you will
eventually buy, be bought by, or partner with); **the account manager at your transit provider**
(whose goodwill is a real resource); **the auditor** (the same person every year, whose opinion
accumulates); **the journalist** (who writes about you three times across the campaign, and whose last
article depends on the first two); **the engineer you hired at Tier 1** (who becomes your CTO or
leaves, based on how you managed them). Reputation with each is tracked separately. **The cheapest
possible way to give a systems game a story.**

#### The Cold Open Level (the actual first five minutes)
Tier 0 opens on powerlessness, which is a risky first impression.

**How it works:** Open instead on the **last thirty seconds of a success**: a site you built handling a
spike beautifully, everything green, coins arcing, camera pulling back — then a title card saying
"Eighteen months earlier." Cut to Tier 0. The player has now *seen* the thing they're working toward
and has a reason to endure the quota bar. Standard technique, unused here, and it converts the
powerlessness tutorial from a risk into a setup.

#### The Difficulty Contract
A per-level, pre-level, explicit statement of what you're being asked to do.

**How it works:** Before every level the player signs a one-page **Statement of Work**: the customer,
the promise (SLA), the budget, the duration, and the three things you will be scored on. Diegetic,
replaces a briefing screen, sets expectations precisely — and crucially, **some of its terms are
negotiable before you start**, which makes the briefing screen itself a decision.

#### Branch-and-Merge campaign topology
How choices diverge without tripling content.

**How it works:** The campaign branches at act boundaries into two or three paths of 3–4 levels each,
then merges at the next act boundary onto a shared level that is *modified* by which branch you took
(different starting assets, different customers, different scars). Two branches × three acts = six
paths through eight authored levels. Cheap, and it makes the campaign feel personal.

#### The Retrospective Level Select
A level-select screen that is your own company history.

**How it works:** Instead of a node map, the level select is a **timeline of your company** with levels
as events on it, annotated with what happened (the outage, the whale, the pivot). Replaying a level is
"revisiting" it, and the timeline visibly rewrites itself if you get a different outcome.

#### Chapter Epigraphs
Each act opens with a single true sentence about the industry.

**How it works:** No cutscene, no exposition — one line on black. *"Every hosting company is one
customer away from being a different hosting company."* / *"Nobody buys backups. Everybody buys
restores, once."* / *"The cheapest hosting in the world is still more expensive than free, and free
has a sales team."* Tone-setting for the price of a text file.

---
## 2. Threats

### 2A.1 Supply chain, logistics and procurement threats
*A family the merged doc barely touches: it has vendor EOL, vendor squeeze and chip shortage, and
nothing about actually getting hardware into a building.*

#### The DOA Rate
A percentage of every shipment simply doesn't work.

**How it works:** 1–3% of new hardware is dead on arrival, and you find out during install, at the
worst moment, with a customer waiting. The counter is a **burn-in bench** (Part A §4) and ordering
spares as a percentage rather than exactly what you need. A small, constant, correct tax that makes
"order 20 servers" quietly mean "order 21."

#### Counterfeit Components
It works, it's cheap, and it will kill you in eighteen months.

**How it works:** Fake optics, remarked DIMMs, relabelled drives with falsified SMART data,
counterfeit PSUs with no real protection circuitry. Symptoms are *intermittent and unattributable*,
so the threat's real damage is that it poisons your trust in your own telemetry. Counter: authorised
channels (20–30% more expensive), serial verification, vendor diversity.

#### The Wrong SKU
You ordered the right thing and received a thing that is 95% the right thing.

**How it works:** Different rail kit, different power connector, one PCIe generation behind, a
backplane that doesn't take your drives, a switch without the licence that enables the feature you
bought it for. Delays a build by a week and consumes hands on the phone. Comedy that is also real.

#### The RMA Black Hole
A failed part enters the vendor's process and does not come back.

**How it works:** A replacement takes 3 weeks, arrives wrong, goes back, and meanwhile you have been
running degraded. Advance replacement (a premium support tier) is the counter and the cheapest
insurance in the game.

#### Allocation
You are told how much you may buy.

**How it works:** During a shortage, vendors allocate rather than sell. Your allocation is a function
of relationship history and size — which retroactively rewards §5.4's Vendor Relationships and
punishes players who always bought from whoever was cheapest. **A threat whose counter was purchased
two years earlier, invisibly.**

#### The Interconnection Queue
Your utility connection request is number 340 in a queue.

**How it works:** You own the land, you have the money, you have the tenant — and the grid will connect
you in four years. The only counters are behind-the-meter generation, buying a site that is already
energised (at a premium), or building somewhere else. **The single most important real constraint on
datacenter growth right now, and it appears nowhere in the merged doc.**

#### The Freight Damage
The pallet was dropped.

**How it works:** The box looks fine. The tilt-indicator sticker is red. Install it anyway (fast,
risky) or refuse delivery (safe, three weeks lost)? A small decision that repays attention to detail —
noticing the sticker is the whole mechanic.

---

### 2A.2 Utility, environmental and civic threats

#### Grid Curtailment and Frequency Events
The utility tells you to stop.

**How it works:** Under grid stress, large consumers may be curtailed contractually or by emergency
order. If you signed for interruptible power (cheaper), you must shed. If you didn't, you pay peak
rates. **A threat you opted into for a discount**, which is the best kind.

#### Demand Charge Shock
You are billed on your worst fifteen minutes.

**How it works:** Utility demand charges are set by your peak draw, not your consumption. One
synchronised GPU ramp, one generator test done wrong, one simultaneous restart of everything after an
outage — and you pay a premium for the next twelve months. **The 95th-percentile rule for power**, and
the symmetry with §6.3's bandwidth billing is elegant and teachable.

#### The Neighbour's Construction
A crew next door.

**How it works:** Vibration (drive errors), dust (filters), a cut to a shared conduit, a crane over
your roof, and one day a piling rig through your fibre. Warned weeks in advance if you read city
permit notices — which can be a purchasable **Site Intelligence** subscription, turning paranoia into
a product.

#### The Building Is Also An Office
Mixed-use hazards.

**How it works:** In a multi-tenant building you inherit its fire alarms, elevator maintenance,
loading dock rules, HVAC shutdown schedule and evacuation drills. A fire alarm on floor 3 shuts your
floor's air handling. **Someone else's building policy is your outage**, and you have zero leverage.

#### Lightning and Bonding
A strike doesn't have to hit you.

**How it works:** A nearby strike induces surges along copper runs — especially ones leaving your
building to a dish, a tower, or an outbuilding. Counters: grounding/bonding, surge protection at every
penetration, and fibre instead of copper for anything crossing a building boundary. Extremely real,
cheap to build, and never bought.

#### Water Restriction (ambient form)
A seasonal cooling-cost multiplier in drought-prone regions, with a public-relations edge: a
datacenter using municipal water during a shortage is a local news story. Introduces **WUE** as a
second efficiency stat next to PUE.

#### Wildlife (extended)
The merged doc has rodents and a moth. There is more.

**How it works:** Birds nesting in an outdoor condenser; wasps in a cabinet; ants shorting a contactor
(a documented failure mode); a cat in the raised floor; a snake in a generator enclosure; a bird
strike on a microwave path. Each is a bespoke five-second animation and a genuine incident report
somebody has written.

---

### 2A.3 Modern and AI-era threats

#### Generative Abuse at Scale
Fraud that is no longer distinguishable by quality.

**How it works:** Fake signups with plausible company names, real-looking websites, coherent support
tickets, and KYC documents that pass visual inspection. Every heuristic the player built against
sloppy fraud stops working in one event. The counter is no longer *content* but *behaviour and
provenance*: payment-instrument history, device reputation, network reputation, velocity — none of
which the player will have built. **A wave that invalidates existing defences rather than
overwhelming them** is a rare and valuable threat shape.

#### Model Poisoning of Your Own Defences
Your bot fingerprinter can be taught to be wrong.

**How it works:** An adversary slowly feeds your behavioural classifier traffic that trains it to
consider their pattern normal — or, nastier, trains it to consider a *legitimate* pattern hostile, so
your own system starts blocking real customers. The tell is a false-positive rate drifting without a
config change. The counter is holdout sets, drift monitoring and periodic retraining from a clean
baseline, all of which cost hands. **This is the downside §4.5's Bot Fingerprinter is missing.**

#### The Agentic Customer
Your customer is a program with a credit card.

**How it works:** Autonomous agents provision, scale and abandon resources at machine speed. They do
not read your documentation, they retry aggressively, they create and destroy thousands of small
resources, and they will run your free tier into the ground while being technically legitimate. Your
rate limits, your provisioning automation and your billing all break in new ways. Modern, real and
completely absent.

#### Prompt-Injected Support Automation
Your own tooling gets talked into things.

**How it works:** If the player builds §4.9's Ticket Router / Triage AI, a crafted ticket can cause it
to misroute, auto-approve, or surface data it shouldn't. The counter is that automation may
*recommend* but not *act* on anything privileged — which halves the tool's value. A clean, current
Capability/Surface trade for a buildable the merged doc currently ships with no downside.

#### The Scraped Knowledge Base
Your documentation becomes someone else's product.

**How it works:** Your carefully written docs are ingested and resurfaced by a third party, often
wrong, and customers arrive having followed hallucinated instructions that broke their site. Support
load rises for a problem you did not cause and cannot fix. A genuinely modern reputation threat with
no clean counter, which is the point.

#### Deepfaked Authority
The social-engineering call, upgraded.

**How it works:** A video call from your CFO's face asking for an emergency payment, or from a
customer's known contact asking for a password reset. The counter is process, not perception:
callback verification on a known number, out-of-band confirmation, a code phrase. **The game should
make the perceptual tells unreliable on purpose**, so the player learns to trust the procedure rather
than their own eyes.

---

### 2A.4 Structural and systems threats

#### The Metastable Failure (threat form)
The only threat in the game that **persists after its cause is gone** and is made *worse* by the
player's correct-seeming instinct.

**How it works:** Load spike → retries → sustained overload → the spike ends and the overload doesn't.
Adding capacity often doesn't clear it because the retry load scales with the number of failing
requests. The exit is deliberate load shedding below a recovery threshold, or a coordinated restart
with admission control on. Deserves a full bestiary entry and a scar unlock (it teaches backpressure).

#### Gray Failure
The component is up, passing health checks, and wrong.

**How it works:** 3% packet loss on one path, one node returning stale reads, a load balancer member
that accepts connections and drops them. Nothing alerts because every binary check passes. Detection
requires *differential* observation — comparing members against each other (outlier detection) — which
is a distinct monitoring capability rather than more monitoring.

#### The Shared Fate You Bought
Consolidation as a threat.

**How it works:** Every efficiency gained by standardising — one vendor, one image, one control plane,
one region, one processor, one CDN — converts many small independent risks into one large correlated
one. The game should track a **Correlation Score** that rises as you standardise and is invisible
until a single event proves it. Generalises §2.9's Correlated Failure from an event into *a stat you
can watch and choose to accept*.

#### The Reconciliation Loop That Won't Stop
Automation as a threat in its own right.

**How it works:** Beyond Kubernetes: any system that continuously enforces desired state will fight you
during an incident. You manually fix a thing; ninety seconds later the automation un-fixes it. The
verb the player must learn is **suspend the automation first**, and the game should let them lose
twenty minutes to this exactly once.

#### The Cache That Became A Database
A dependency that changed category without anyone noticing.

**How it works:** Data exists only in the cache. Nobody decided this; it accumulated. When the cache is
flushed, restarted or evicted, that data is simply gone, and there is no backup because it was "just a
cache." A slow-growing, silent, self-inflicted data-loss threat that §5.4's Asset Discovery Scan
should be able to find.

#### The Config That Is Also Code
Change control's blind spot.

**How it works:** Your change board reviews deploys. It does not review DNS records, firewall rules,
CDN settings, IAM policies, feature flags or a checkbox in a vendor portal — and those cause more
outages than code does. The threat is an outage from a change that went through no process at all;
the counter is extending change control to config, which slows everything.

#### The Vendor API Deprecation
Your automation breaks because someone else shipped.

**How it works:** A provider retires an API version. Your provisioning, billing sync or monitoring
stops silently. Arrives with six months' notice in an email nobody read. Counter: the vendor advisory
feed (§5.4) plus a dependency inventory nobody has.

#### The Forgotten Environment
Something you built and stopped thinking about.

**How it works:** A staging cluster with production data and no patching; a demo environment with a
public IP; a proof-of-concept from a sales cycle two years ago; a test account with admin rights. It
accrues vulnerability silently and is found by an attacker or an auditor, never by you. §5.4's Asset
Discovery Scan should always find one.

#### The Alert That Fires Correctly And Means Nothing
A specific, common failure of alerting.

**How it works:** A threshold alert that has fired daily for a year because the threshold was set for a
smaller system. It is *correct* and *useless*. The counter is not tuning the alert but **re-deriving
the threshold from current baseline**, which is a different action and a different lesson.

#### The Downstream Route Leak
Your own customer announces the internet through you.

**How it works:** A multihomed customer misconfigures and re-advertises everything they learn from
another provider to you. If you don't filter, you become a transit path for a continent and your
routers and your bill both melt. The counter is prefix filtering on customer sessions — boring,
mandatory, and exactly the thing nobody does until it happens.

#### Your Own Scanner Got You Blacklisted
The defence that looks like an attack.

**How it works:** You run a vulnerability scanner across your estate; it touches customer IPs; abuse
complaints arrive at your upstream about *you*. Counter: scan windows, source-IP declaration, a
published scanning policy, and telling your upstream first. A small, funny, extremely real own-goal.

---

### 2A.5 Business and human threats

#### The Acqui-Loss
A vendor you depend on is acquired by a competitor of yours.

**How it works:** Your backup vendor, billing platform, DDoS scrubber or control panel is bought by
someone who now competes with you and has your customer list, your traffic patterns and your renewal
date. Nothing breaks. Everything is now uncomfortable. The counter is exit planning you should have
done and didn't.

#### The Key Customer's Acquisition
Your whale gets bought.

**How it works:** They did not churn and did not complain — their new parent has a global vendor
agreement with someone else, and your contract dies at renewal for reasons entirely outside the
relationship. **Concentration risk materialising through no fault of anyone**, the truest version of
it.

#### The Staffing Dispute
Labour as a system.

**How it works:** In facility-heavy lines, a dispute over on-call compensation, shift patterns or
contractor pay becomes a work stoppage or a mass resignation from the on-call rota. Not villainous —
the trigger is *your own* accumulated decisions about morale, overtime and pay. A different
lose-condition path than burnout: **collective, sudden, and negotiable.**

#### Health and Safety
A near miss.

**How it works:** Someone working alone at 3am. Arc-flash risk on a live panel. A rack tipping during a
move. A lifting injury. Safety should be a **policy buildable** (two-person rule for energised work, a
lifting plan, PPE, lone-worker check-in) with a real cost in speed, and an incident should be a hard
stop that halts all physical work for days plus a regulatory investigation. Handled soberly it is one
of the most respectful things the game could include.

#### The Founder's Bad Week
The player character has a life.

**How it works:** A personal event — illness, a family emergency, a move — removes the player's own
attention (§7.5's Executive Attention) for a period. Everything you delegated works; everything you
personally did doesn't. **The most honest mechanic available to a game about running a small hosting
company**, and it converts "bus factor" from an abstraction into an experience.

#### The Investor Who Changed Their Mind
Financing risk.

**How it works:** A committed round, a signed term sheet or an extended credit facility is withdrawn or
repriced. You had been spending against it. The counter is not spending against money you haven't
received, which every player will do anyway.

#### The Reference Call
A silent, invisible, enormous sales threat.

**How it works:** A prospect calls your existing customers. What they hear is a function of how you
handled those customers' worst days, months ago. **A sales outcome determined entirely by past
operational behaviour, with no visible mechanism** — the player only ever sees a deal that quietly
didn't close. Revealing the mechanism once, late, is retroactively devastating in the best way.

#### The Quiet Downgrade
Churn that isn't churn.

**How it works:** A customer doesn't leave — they shrink. Fewer servers, a lower tier, a shorter
retention, the managed add-on cancelled. Logo churn is zero and revenue churn is 30%. Invisible on
every dashboard that counts customers rather than dollars, and it is how a hosting company dies
without noticing.

---

## 3. Visitors, traffic, and clients

### 3A.1 New visitor and demand concepts

#### The Phantom Funnel (demand you cannot see)
The visitors who never arrived. **The biggest single missing idea in §3.**

**How it works:** A parallel, *invisible* stream: people who tried to reach you and failed before your
board saw them — a DNS resolution failure, an IPv6-only client you don't support, a TLS version you
dropped, a geo-block, a mobile carrier whose routing to you is terrible, a browser flagging you. They
never enter the lane, so no counter on your HUD ever ticks. **Buying certain observability (RUM,
third-party synthetic checks from many networks, a customer-reported-issues channel) makes a slice of
the phantom funnel visible** — and the reveal that you have been losing 6% of demand for an entire
level is the strongest possible argument for external monitoring.
**Visual:** when unlocked, a translucent ghost-stream alongside the real one at the spawn edge, with
its own counter and its own bounce reasons.

#### Protocol Compatibility as a Visitor Filter
Who can even talk to you.

**How it works:** A live compatibility matrix: IPv4/IPv6, TLS versions, cipher suites, HTTP versions,
SNI, ALPN, old CA roots, and whatever ancient client one important customer uses. Each row has a
visitor-population share attached. Dropping TLS 1.0 is a security win costing 0.4% of visitors, and
one of them is a payment gateway callback. **A security decision expressed as a population decision.**

#### Demand Elasticity by Latency (the visible curve)
Not just "they bounce" — how many, at what speed.

**How it works:** A per-segment curve, plotted in the UI, of conversion rate against response time. The
player can *see* that the mobile segment falls off a cliff at 1.2s while the enterprise segment
doesn't care until 8s. Optimising becomes a targeted decision ("who am I optimising for?") rather than
a general one. Pairs with the Latency Ladder (§3.1): the Ladder shows what you spend, this shows what
it buys.

#### The Bimodal Customer
One account, two totally different traffic shapes.

**How it works:** An e-commerce customer whose storefront is cacheable and whose admin panel is
brutally expensive; a game studio whose players are latency-bound and whose patch distribution is
bandwidth-bound; a SaaS whose app is steady and whose nightly export flattens your database. **One
customer card, two profiles, and isolating them from each other is an architecture decision.**

#### Traffic That Is Not For You
Transit, reflection, and passing trade.

**How it works:** At Tier 5+, traffic crosses your network that neither originates nor terminates with
you. It consumes capacity, it can be attack traffic aimed elsewhere, and it may be revenue (transit)
or an obligation (peering). **A third flow direction** in a game that currently has two, and it is
what makes you feel like part of the internet rather than a website.

#### The Off-Peak Customer as a Product
Selling the shape of your own valley.

**How it works:** Because opposite peak hours are already identified as a synergy (§0.2), make it a
*sellable product*: discounted capacity available only outside your peak, enforced automatically.
Batch, backup, render and crypto customers all buy it. Your utilisation curve flattens and your risk
profile changes, because now your valley is full and a peak surprise has nowhere to go.

#### The Customer's Customer Sentiment
Two layers of anger.

**How it works:** When you host a business, their end users complain to *them* and they complain to
*you*, with amplification and distortion at each hop. Model end-user sentiment separately and show the
player only the filtered version — so during an incident your customer says "our users are furious"
and you cannot verify it. A **shared status page** or a direct end-user comms channel lets you see the
real number, and sometimes it's lower than they claimed.

#### The Dormant Wake-Up
A sleeping account becomes a spike.

**How it works:** The Ghost (§3.2) is pure profit until the day their forgotten site is linked from
somewhere and takes 400× its normal traffic on a plan sized for nothing. The best customer becomes an
incident. Cheap, rare, and it makes the player look at their long tail differently.

#### The Compliance-Driven Buyer
A customer who arrives because of a rule, not a need.

**How it works:** New regulation in *their* industry forces them to move data somewhere compliant. They
are not shopping on features or price — they are shopping on a certificate you either have or don't.
The whole segment appears at once, on a deadline, and disappears once everyone has moved.
**Regulatory weather as a demand event rather than a threat event**, which the merged doc never does.

#### The Repatriation Wave
Customers leaving hyperscalers.

**How it works:** A recurring late-campaign demand event: companies moving workloads *back* from big
cloud for cost reasons. They arrive technically sophisticated, with a spreadsheet, a dollar target,
and an architecture full of assumptions your platform doesn't satisfy. Winning them requires a
**migration engineering** capability, not a sales one. A great counterpoint to §2.10's Hyperscaler
Free Tier.

#### The Latency-Blind Visitor
Traffic that genuinely doesn't care.

**How it works:** Batch jobs, async webhooks, replication streams, log shipping, crawler traffic and
backup transfers have effectively infinite patience and enormous throughput demands. They are the
*perfect* candidates for the lowest QoS class (Part A §7), which is how the player discovers that not
all traffic deserves the same treatment. Every level should have some, so the prioritisation mechanic
always has something obvious to demote.

---

### 3A.2 Churn, retention and commercial mechanics

#### The Churn Taxonomy
The merged doc has involuntary churn and a grudge meter; it needs the full set, because each kind has
a different counter and a different cost.

**How it works:** Five kinds, tracked separately on the HUD:
1. **Voluntary–dissatisfied** — they left because you were bad. Counter: be less bad.
2. **Voluntary–outgrown** — they got too big or too small for your product. Counter: a product ladder.
3. **Involuntary** — payment failure. Counter: dunning.
4. **Mortality** — the customer's business closed. Counter: none; it is a floor, and it should be
   visible so the player stops trying to fix it.
5. **Displacement** — acquired, merged or mandated elsewhere. Counter: multi-threading the
   relationship so you're not dependent on one champion.
**Showing these separately is the difference between "churn is 4%" and "churn is 4% and 1.6% of it is
unfixable"**, which changes every retention decision a player makes.

#### Negative Churn as a Win Condition
Growth without selling.

**How it works:** When expansion revenue from existing customers exceeds lost revenue from churned
ones, net revenue retention exceeds 100% and the business grows while acquiring nothing. Make this an
explicit, celebrated, *hard* milestone with a permanent effect (investors and lenders treat you
differently). It is the most important metric in subscription businesses and §6.8 lists it without
ever making it a goal.

#### The Win-Loss Review
Learning from deals you lost.

**How it works:** A purchasable action after any lost deal: spend a hand to find out why. Answers form
a real distribution — price, a missing feature, a failed security review, a bad reference, a slow
response, or "we went with the incumbent." Accumulating them produces a **loss-reason chart that tells
you what to build**, exactly as the Exit Survey does for churn. The merged doc has the churn half and
not the acquisition half.

#### Channel Conflict
Your own sales channels fighting each other.

**How it works:** Once you have direct sales, resellers and affiliates, they will all reach the same
prospect. The reseller demands protection; the affiliate claims the referral; direct sales undercuts
both. You need a **deal-registration policy** (a buildable) which costs margin and flexibility and
prevents the channel quietly abandoning you. Real, unglamorous, and a great late-game business puzzle.

#### The Reference Ladder
Turning customers into a sales asset, with a cost.

**How it works:** Customers can be asked to be a logo, a quote, a case study, a reference call, or a
conference speaker — escalating in value to you and in cost to them. Asking too often burns goodwill;
never asking leaves your best asset on the shelf. Each rung requires a *satisfaction threshold* and a
*tenure threshold*, so the ladder is gated by actual operational quality.

#### Onboarding as a Funnel With Its Own Bounce Rate
Post-sale drop-off, measured.

**How it works:** Extend §3.7's Onboarding Gauntlet into a real funnel: account created → payment
verified → DNS pointed → data migrated → first successful use → first invoice paid, each with a
drop-off percentage and a specific fix. **The highest-leverage place to spend in a real hosting
company**, and it is currently one sentence.

#### The Expansion Trigger Library
Upsell moments, enumerated.

**How it works:** §3.9's Upsell Moment needs specifics: crossing 80% of a resource limit; a second site
added; a team member invited; a compliance question asked in a ticket; a traffic spike survived; **an
outage handled well** (customers genuinely buy more after a well-handled incident — counterintuitive
and real); a renewal date approaching; a competitor's price increase. Each is a detectable game-state
condition that fires a gold pip.

#### The Contract Term Ladder
Length as a lever with three simultaneous effects.

**How it works:** Monthly / annual / multi-year each change cash timing, churn rate, and **your
flexibility to raise prices**. A three-year fixed-price contract during a power-cost spike is a loss
you signed up for. Give each term an explicit modifier set so the choice is legible rather than
intuitive.

#### The Silent Majority
Customers who never contact you at all.

**How it works:** 80% of your base never files a ticket, never answers a survey, and never appears in
any qualitative signal. Every conclusion the player draws from tickets and surveys is drawn from the
loud 20%. The game should show this explicitly — a "coverage" percentage on every feedback panel —
and give a purchasable way to sample the silent ones (a proactive outreach action, an in-product
signal, a usage-based health score). **Teaching a player to distrust their own feedback data is a real
and rare lesson.**

---
## 4. Buildables: services and infrastructure

### 4A.1 Facility and physical plant (gaps)

#### The Burn-In Bench
New hardware does not go straight into production.

**How it works:** A staging area where new machines run a 24–72 hour soak under synthetic load and
thermal stress before being racked. Costs floor space, power and time-to-revenue; catches the DOA rate
and a meaningful share of infant-mortality failures before they become customer-facing. **Buys
certainty with time**, and converts a random failure into a scheduled one.
**Opens:** the temptation to skip it when a customer is waiting, which is exactly the decision worth
having.

#### DCIM (the facility's monitoring stack)
The building's equivalent of §4.6's Monitoring Stack, and equally layered.

**How it works:** Bought in layers, each closing a category of "I don't know": asset tracking (what's
where) → power monitoring (per-circuit, per-outlet) → environmental (temperature/humidity per rack,
per U) → capacity modelling (what fits where, with power and cooling headroom computed) → workflow
(change tickets tied to physical assets). Without it, the facility half of the board is fogged exactly
as §7.6 fogs the compute half.
**Opens:** DCIM holds credentials into your building automation — a compromise here is physical.

#### BMS / SCADA and OT Security
The building's control system is a computer and nobody treats it like one.

**How it works:** Chillers, generators, transfer switches, the fire panel and access control all speak
to a building management system running old software on a flat network with a default password,
installed by a contractor who still has remote access. **An entire second attack surface with physical
consequences** — an attacker who reaches the BMS can turn off your cooling. The counter is OT
segmentation, which is genuinely hard because the vendor needs remote access to support it.
**Interacts with:** §2.6 (a whole new access-threat family), §4.7.

#### Thermal Storage (ice bank / chilled water reservoir)
A battery for cooling.

**How it works:** Stores cooling capacity so you can (a) ride through a chiller restart with no
temperature rise — a genuinely different kind of redundancy than N+1 — and (b) make ice at night when
power is cheap and use it at peak. **Turns cooling into a schedulable, arbitrageable resource.** Costs
a large tank, floor loading and pumps.

#### On-Site Generation and Storage (solar, BESS, fuel cell, microgrid)
Power as something you produce.

**How it works:** Reduces grid draw, rides through short outages without the generator, can sell grid
services back (frequency regulation pays real money for doing nothing most of the time), and provides
a green credential with a number behind it.
**Opens:** a serious fire-safety consideration for lithium storage, new regulatory approvals, and the
fact that solar produces least when you need most.

#### Waste Heat Recovery
Selling the by-product.

**How it works:** Heat exchangers and a pipe to a neighbour. Turns a cost into a revenue line, requires
a *physical customer within a kilometre*, and creates a contractual obligation to keep producing heat
— so you cannot idle down without breaching it. **A revenue line that constrains your operations** is
a lovely, unusual object.

#### The Anteroom / Dust Lock
A small room that changes everything.

**How it works:** Unboxing, staging and cardboard removal happens outside the data hall. Cardboard and
pallets in a raised-floor room are a fire load and a particulate source, and every real facility bans
them. Cheap, boring, and it removes a whole family of small entropy events.

#### The Tool Crib and the Torque Standard
Micro-infrastructure.

**How it works:** A shadow board of tools (the Pegboard from §5.8, made functional), a labelled
fastener bin, a torque driver, an ESD station, and a laminated standard for how things are mounted.
Reduces Missing Screw (§9.2) frequency and remote-hands error rate, and gives a small permanent MTTR
bonus. Every ops person will buy it on sight.

#### The Reference Rack / The Lab
A non-production replica for reproducing customer problems.

**How it works:** Distinct from Staging (§4.2), which mirrors your *service*; this mirrors your
*hardware and network*. Lets you test firmware, reproduce a customer's weird configuration, and try
the risky thing before doing it to production. Costs a rack of capital that earns nothing.
**Opens:** it becomes a dumping ground for old gear and quietly turns into production when someone
runs something important on it — which is the Forgotten Environment threat above.

#### Loading Dock Scheduling
The bottleneck object with a calendar.

**How it works:** Extends §4.7's Loading Dock: deliveries must be booked, the freight elevator has a
weight limit and a queue, and two things arriving the same morning means one waits. During a build
this is the actual constraint on progress, and it makes "order everything at once" a mistake.

#### The Spill Kit, the Drip Tray and the Isolation Valve
Liquid-cooling specific plant.

**How it works:** Once GPU/immersion lines exist, a coolant leak (§2.12) needs a counter chain that is
*physical and boring*: leak detection cable, a drip tray under each CDU, an isolation valve per loop,
and a spill kit with a trained person. Each is cheap; together they turn a catastrophe into a mop.
**A counter made of four small unglamorous objects** is a better lesson than one big one.

---

### 4A.2 Network and platform (gaps)

#### Flow Telemetry (NetFlow / sFlow / IPFIX)
The tool that answers "who is using my bandwidth." **The most conspicuous missing buildable.**

**How it works:** Without it, a traffic spike is an anonymous number. With it you attribute every bit
to a customer, a prefix, a protocol and a destination — which is how you (a) bill accurately, (b) find
the customer causing your 95th percentile, (c) identify an attack's shape, and (d) prove to an
upstream that abuse isn't yours. **It is the prerequisite for every interesting bandwidth decision in
§6.3 and it is not in the document.**
**Opens:** storage cost, and the privacy/compliance implications of retaining who-talked-to-whom.

#### Traffic Shaping and QoS Policy
Deciding, explicitly, whose packets matter. Full mechanic in Part A §7.

**How it works (as a buildable):** a policy engine at the edge where the player assigns traffic
classes, weights, queue depths and shed order. **The most obviously correct missing feature in a game
whose central pillar is a shared pipe.**

#### Looking Glass and Public Route Server
Marketing disguised as a tool.

**How it works:** A public page showing your routing table and letting anyone run a traceroute from
your network. Costs nothing, is used by other engineers evaluating you, and feeds Engineer Reputation
directly. Also becomes an information source an attacker can use. **A build whose attack surface is
transparency itself.**

#### IRR / RPKI Publication and Peering Hygiene
The paperwork half of networking.

**How it works:** Registering routes in internet routing registries, publishing ROAs, and maintaining a
PeeringDB-alike entry. None of it affects your network at all; all of it affects whether *other*
networks accept your announcements and whether they will peer with you. **A build whose entire value
is other people's opinion of you, expressed as configuration.**

#### Anycast Withdrawal Policy
A control §4.4's anycast build implies and never gives you.

**How it works:** The point of anycast is that a sick PoP stops announcing. *When* it withdraws is a
tuning decision: too eager and you flap and shift load onto neighbours (cascading); too slow and you
keep sending users to a broken site. A slider with a genuinely non-obvious optimum, and the failure
mode — a **withdrawal cascade** where each PoP falls over in turn as it inherits the previous one's
traffic — is a fantastic emergent disaster.

#### Cell-Based Architecture / Shuffle Sharding
The modern answer to blast radius, entirely absent. **The single best missing buildable.**

**How it works:** Instead of one big pool, you build N independent **cells**, each a complete miniature
of your stack, and assign each customer to a cell. A failure takes out 1/N of customers instead of all
of them. **Shuffle sharding** goes further: each customer is assigned a random *pair* of cells, so any
two customers rarely share both — meaning one customer's poison affects a tiny, mathematically bounded
fraction of others. Costs efficiency (each cell needs headroom, so total headroom is N× worse) and
complexity (deployments roll cell by cell, so change velocity drops).
It turns §7.1's "blast radius as a first-class concept" from an observation into a purchasable
strategy, and it is the structural counter to §2.9's Correlated Failure.
**Visual:** the board visibly divides into repeated identical districts, and during an incident you
watch exactly one district go red while the others stay green — the most satisfying possible
demonstration of an architectural decision paying off.

#### The Bulkhead / Resource Pool Partition
Cell thinking at a smaller scale.

**How it works:** Reserve separate connection pools, thread pools or queues per dependency or per
customer class, so one saturating dependency cannot consume all of a service's capacity. Cheap,
subtle, and it converts a total outage into a partial degradation. The specific counter to "a slow
third-party API consumed every worker thread."

#### Load Shedding by Priority
Deliberately serving fewer people, well.

**How it works:** A pre-configured policy: under overload, shed in this order — free tier, anonymous
traffic, background jobs, non-paying features, low-tier customers. The alternative (uniform
degradation) means *everyone* has a bad time. **Choosing who suffers, in advance, in peacetime, is one
of the most interesting decisions in operations** and the merged doc has only a vague nod at it.

#### Admission Control and Bounded Queues
Saying no at the front door.

**How it works:** A queue with a bounded length and a rejection policy at the *edge*, so overload
produces fast, cheap, honest failures instead of slow, expensive timeouts. The counterintuitive
lesson: **rejecting 10% immediately serves the other 90% properly; accepting 100% serves nobody.** The
mechanical partner to §7.7's Circuit Breaker, and missing.

#### The Read-Only Mode Switch
A pre-built degraded state for the data tier.

**How it works:** A one-click mode where writes are refused with a friendly message and reads continue
from replicas. Requires the application to have been *built* for it (a prerequisite purchase), which
is the point: you cannot buy it during the incident. Turns a total outage into a browsable, ugly,
survivable one.

#### The Secondary Everything Register
An inventory of what has no backup.

**How it works:** A screen listing every single-instance dependency in your estate — one nameserver,
one payment processor, one registrar account, one person who knows the thing, one supplier. It is
simply a *list*, generated from the graph, and it is terrifying. Cheap to build, enormously valuable,
and it is the buildable form of §7.1's effective redundancy.

#### The Synthetic Customer
A fake tenant that is always running.

**How it works:** You provision an account for yourself and continuously exercise the full customer
journey — signup, provisioning, deploy, a transaction, a backup, a restore, a support ticket. It costs
a slot and a trickle of resource, and it catches the entire "everything is green but customers are
down" class *including* the business-layer parts (billing, provisioning, email delivery) that
technical monitoring never touches. A strictly better version of §4.6's synthetic transactions,
because it is end-to-end and includes the commercial path.

---

### 4A.3 Business machine (gaps)

#### The Trust Centre / Security Portal
The document that answers the questionnaire before it's asked.

**How it works:** A public page with your certifications, architecture overview, subprocessor list,
uptime history and standard answers. Deflects a meaningful share of §5.2's Security Questionnaire
minigame, shortens enterprise sales cycles, and costs real effort to keep accurate. **A marketing
asset that is also a compliance artifact** — the highest-leverage document in B2B hosting, absent from
the doc.

#### The Metering and Rating Engine
Billing's hard half.

**How it works:** §4.9's Billing Platform assumes you know what to charge. Metering is the system that
*counts*: usage records, deduplication, late-arriving data, rating rules, proration, and the
reconciliation between what you metered and what actually happened. Under-building it means you
undercharge silently (**revenue leakage**, often 2–5% of revenue in real companies) or overcharge
occasionally (a bill-shock event and a refund). **Revenue leakage as an invisible, permanent,
discoverable drain** is a superb mechanic that doesn't exist anywhere in the doc.

#### The Subprocessor Register and DPA Desk
The compliance paperwork of using other companies.

**How it works:** Every vendor that touches customer data must be listed, contracted, assessed and
notified about. Adding a new SaaS tool becomes a small compliance transaction; changing one requires
notifying customers. **Makes vendor adoption have a cost beyond price**, which is accurate and a
useful brake on the player's shopping.

#### Vendor Exit Plans
Insurance against your own suppliers.

**How it works:** For each critical vendor, a documented and *tested* plan for leaving them. Costs
staff time, produces nothing, and converts an Acqui-Loss or a Vendor Squeeze from a crisis into an
inconvenience. Another entry in the "boring virtue" family the game is good at.

#### The Capacity Reservation (for yourself)
Not selling everything you have.

**How it works:** An explicit, visible reservation of a percentage of capacity that sales cannot sell:
for failover, burst, migrations, and the customer who grows. It appears as an occupancy penalty on the
scorecard and as survival during every incident. **A number the player sets that is pure discipline**,
and the game should let them set it to zero.

#### The Escalation Matrix
Who gets called, by whom, when.

**How it works:** A buildable document defining severity levels, notification targets, decision
authority and customer-communication timing. Without it, every incident includes a debate about
whether to wake someone. With it, response is faster and occasionally over-escalates. **Process as a
purchasable object** with a legible speed/noise tradeoff.

#### Incident Command Roles
A three-person structure, not three people doing everything.

**How it works:** During a sev-1 you may assign **Incident Commander** (decides, doesn't touch
keyboards), **Communications Lead** (status page, customers, internal) and **Scribe** (timeline).
Assigning them *removes* three hands from fixing and makes everything else faster and better —
shorter MTTR, better postmortem quality, fewer duplicated actions, far less reputation damage.
**A mechanic where spending your scarcest resource on coordination is correct** is a sophisticated and
very true idea, and it is absent.

#### The Error Budget Policy (as an object, not a HUD number)
The most elegant reliability mechanic in the industry.

**How it works:** §6.8 lists "error budget remaining" in the HUD and never makes it a system. As an
object: you declare a target (say 99.9%), which allocates 43 minutes of monthly downtime. Spending it
is *allowed* — you may ship risky changes while budget remains. When it is exhausted, a **freeze
triggers automatically** and only reliability work is permitted until the window resets. This turns
reliability from a vibe into **a currency with a spending rule**, gives the player a legitimate reason
to take risks, and makes the velocity/stability argument mechanical rather than moral.

#### The Customer Advisory Board
Structured feedback with a cost.

**How it works:** Recruit 6–10 customers who meet quarterly, get early access, and tell you the truth.
Costs staff time and some product control (they will ask for things), and substantially improves your
roadmap hit-rate and their retention. **Also a threat**: they talk to each other, and now your most
demanding customers are organised.

#### Partner Certification Program
Making your resellers competent.

**How it works:** Train and certify partners; certified partners generate fewer escalations and sell
more accurately. Costs a training function; returns support-cost reduction and channel loyalty. The
counter-move to §3.6's "resellers blame you for everything."

#### Localisation and Regional Presence
Being genuinely local.

**How it works:** Not just a PoP: local-language support, local billing currency and payment methods,
local invoicing and tax compliance, a local phone number, local business hours. Each is a separate
purchase and each unlocks a fraction of a regional market. **Reveals that "expanding to a region" is
eight decisions, not one** — exactly the kind of honest complexity this game trades in.

#### The Renewal Calendar as a Buildable
Knowing what is coming up for renewal, on both sides.

**How it works:** One object that shows every contract that renews in the next 12 months — customer
contracts (revenue at risk, price-increase opportunity) and vendor contracts (cost at risk,
renegotiation opportunity), on the same timeline. Without it, renewals ambush you. With it, they
become a schedulable workstream. Trivially cheap, and it converts a whole class of surprise events
into planned ones — which is what growing up as an operator actually feels like.

---

### 4A.4 Staff roles (gaps)

*The merged doc has a good roster and misses several roles that carry real mechanics.*

- **Capacity Planner** — converts monitoring history into purchase orders with lead times. Without
  one, you always buy late. Idle 90% of the time and worth their salary twice a year.
- **FinOps / Cost Analyst** — finds the revenue leakage, the idle capacity, the forgotten environment
  and the plan that loses money. Pays for themselves and is always the first cut.
- **Release Manager / Change Coordinator** — owns the calendar, the freeze windows and conflict
  detection ("these two changes cannot happen the same night").
- **Technical Writer** — converts tribal knowledge into runbooks at a much better rate than engineers
  do, and the runbooks decay slower. The cheapest MTTR purchase in the game.
- **Deliverability Specialist** — email-line-specific; a human whose job is relationships with mailbox
  providers. Cannot be automated, which is the joke and the point.
- **Peering Coordinator** — attends conferences, negotiates, maintains PeeringDB, and their entire
  output is other networks' willingness to peer. **A role whose stat is social.**
- **Data Protection Officer** — mandatory above a threshold in some regimes; can *block* the business
  from doing things. The first staff member who reduces your agency and is correct to.
- **Facilities Manager** — owns the building, the vendors, the maintenance calendar and the
  inspections. In facility lines, more important than any engineer.
- **Safety Officer** — gates physical work, slows everything, prevents the one incident you cannot
  recover from.
- **Community Manager** — the forum, the Discord, the subreddit. Converts angry users into moderators
  and is the cheapest support capacity in existence.
- **The Contractor's Contractor** — a sub-subcontractor who appears on your floor with a badge you
  didn't issue. Not a hire; a *hole* in the staff system, and a threat wearing a staff sprite.

---

## 5. Unlocks and discovery

#### The Research Queue (how research actually happens)
The merged doc has a rich tree and never says how you spend on it.

**How it works:** Research is not instant purchase; it is a **queue with a limited number of parallel
slots** (1 at Tier 1, 3 by Tier 4). Each node has three costs: **money**, **engineer-weeks** (which
consume hands, competing with operations) and **risk** (a chance of producing nothing). Pausing a
project loses a fraction of progress. This makes "we'll do it after the incident" a real, compounding
cost, and it makes *which three things you work on* the strategic core of the tech tree rather than a
shopping trip.

#### The Spike
A timeboxed investigation that may return nothing.

**How it works:** Spend two engineer-days to find out whether a research node is even viable in your
environment. Returns one of: "yes, cost X", "yes, but it requires Y first", or "no." **Buying
information about the tech tree rather than buying the tech tree**, and it is how real engineering
organisations de-risk.

#### Negative Discovery
Learning what you don't need.

**How it works:** Some investigations conclude "this wouldn't have helped." Those results are
*valuable*: they refund a portion of the spike cost as Intel and permanently grey out a branch with a
note explaining why, which stops the player wondering. **A game that lets you rule things out respects
the player's time.**

#### Unlock by Decommission
Removing something teaches you something.

**How it works:** Successfully retiring a legacy system unlocks the tooling that made it possible
(migration automation, a compatibility shim, a data-conversion pipeline) as a permanent capability —
which makes the *next* decommission cheaper. Converts the least glamorous work in the industry into
visible progression.

#### The Standards Body
Participating in the thing that makes the rules.

**How it works:** Send an engineer to a working group. Costs a recurring fraction of a senior hand.
Returns early access to protocol changes (a one-era head start), advance warning of deprecations, and
a reputation modifier with the most technical customer segment. Occasionally a change you argued for
lands and permanently benefits your architecture. **The slowest, most prestigious, most
operator-authentic unlock channel available.**

#### Hardware Generation Unlocks
Time, not achievement.

**How it works:** New CPU/drive/network generations arrive on a campaign calendar regardless of what
you do. Each changes the *math* rather than adding a feature: more cores per watt shifts your density
ceiling, NVMe changes your storage economics, 400G makes your aggregation design obsolete. **A tech
tree that advances without you**, which is what the industry feels like, and it forces periodic
re-evaluation of decisions that were correct when you made them.

#### Unlock Rationing (a stated rule)
The merged doc has ~200 unlockable things and no pacing rule.

**How it works:** Proposed: **2–4 meaningful unlocks per level**, of which at most one is a new
buildable and at least one is an automation or quality-of-life improvement. A hard cap prevents the
mid-campaign avalanche where the player has more options than attention. Everything else is a
*modifier* to things they already own.

#### The Debt-to-Capability Conversion
Refactoring as research.

**How it works:** Paying down technical debt in a specific area doesn't just remove a penalty — it
**unlocks the next node in that branch**, because the old thing was blocking it. Migrating off the
legacy control panel unlocks provisioning automation; cleaning up the network unlocks segmentation;
documenting the mystery box unlocks its replacement. **Turns maintenance from a tax into a gate**,
which is more accurate and much more motivating.

#### Discovery by Incident Adjacency
Near misses teach too.

**How it works:** An incident that *nearly* happened — a threshold approached, a redundancy that held
by one unit, a backup that restored on the second attempt — produces a smaller Intel payout and a
Codex partial-fill. Rewards the player for having instrumentation good enough to notice a near miss,
which is a real and rare organisational maturity.

#### The Competitor's Postmortem
Free education from someone else's worst day.

**How it works:** When a rival (or a famous NPC company) has a public outage, their postmortem appears
in the trade-press ticker. Reading it (a small hand cost) unlocks the counter to that failure at a
discount **without you having suffered it**. This is the clean fix for §5.1's biggest structural
problem (see Part B), delivered diegetically and with lovely industry-authentic flavour.

#### The Apprenticeship
Growing your own.

**How it works:** Hire juniors cheaply, invest hands in mentoring, and in 12–18 in-game months you have
mid-level engineers who cost less than market and are far less likely to leave. Competes directly with
hiring senior (fast, expensive, flight-risky). **Two different theories of staffing, both viable**, and
the apprenticeship path is the only one that improves your culture stat.

#### The Field Trip
Visiting another operator's facility.

**How it works:** Real operators tour each other's buildings constantly and steal ideas shamelessly. A
costed action returning one facility-branch node, one "why didn't we do that" layout improvement, and
a relationship. Lovely, cheap, and completely true to the industry.

#### The Deprecation Notice You Wrote
Unlocks from your own product decisions.

**How it works:** Announcing the end-of-life of one of your own products or plan tiers unlocks the
**migration tooling** branch, because you now have to move everybody. A capability created by a
commercial decision, which is exactly how it happens in real companies.

---
## 6. Economy, money, and scoring

### 6A.1 Missing economic systems

#### The Balance Sheet (assets, liabilities, equity)
The merged doc models cash and P&L and stops there.

**How it works:** A third ledger. **Assets**: hardware at depreciated value, owned IP space (which
*appreciates*), prepaid contracts, receivables, inventory, the building if you own it.
**Liabilities**: debt, leases, deferred revenue, accrued SLA credits, and the decommissioning
obligation on your own hardware. **Equity** is what's left, and it is the number an acquirer actually
buys. Adding it makes several existing systems suddenly legible: why leasing changes your risk, why
IPv4 is a strategic asset, why deferred revenue is genuinely scary, and how the diligence report
(§6.9) reaches its number.

#### Revenue per Rack Unit, per kW, and per Engineer
The three unit-economics numbers real operators actually manage.

**How it works:** Three derived stats, always available in the ledger drawer:
- **$/U/month** — whether a line is worth the space.
- **$/kW/month** — whether a line is worth the power, which at Tier 4+ matters far more.
- **Revenue per engineer** — whether a line is worth the *attention*, which is the real constraint.
A GPU line can be brilliant on $/U and terrible on $/kW; shared hosting is the reverse; a managed line
looks great on both and destroys you on revenue-per-engineer. **Three numbers that make the portfolio
decision mathematically interesting instead of vibes-based.**

#### Internal Transfer Pricing
What your own lines charge each other.

**How it works:** Once you run multiple lines, your CDN line uses your transit, your backup line uses
your storage, your colo line houses your own gear. You decide whether internal usage is free (simple,
hides which line is actually profitable) or charged at market (accurate, creates internal conflict and
accounting overhead). **Getting it wrong means your worst line looks like your best** — the CDN line
that looks fantastic is being subsidised by the transit line it never pays. A real and very satisfying
trap.

#### The Line J-Curve
New businesses lose money before they make it.

**How it works:** Every new line has an explicit, visible profitability curve: months 1–6 negative
(capex, staff, no customers), 7–18 approaching breakeven, 19+ contributing. The player must fund the
trough. **Opening a second line during a cash crunch becomes a specific, comprehensible mistake**
rather than a vague one, and the curve shape differs per line (colo's trough is deeper and longer; a
reseller line's is almost flat).

#### Power Purchase Structures
How you buy electricity is a strategic decision.

**How it works:** Three options with different risk shapes: **index** (pay spot, cheapest on average,
occasionally ruinous), **fixed** (premium for certainty), and a **PPA** (a long-term contract with a
generator — cheapest long-run, locks you in for a decade, a liability if prices fall). Plus **demand
charges**, billed on your peak draw rather than consumption.

#### Carbon and Water Accounting
Two numbers with commercial consequences.

**How it works:** A **carbon intensity** stat (gCO2/kWh, varying by grid, by time of day and by
contract) and a **WUE** stat. Enterprise and public-sector customers increasingly require reporting;
some require thresholds. Improve them by efficiency (real, slow), renewable procurement (real, costs
money), or certificates (fast, cheap, and if the certificates are discovered to be low-quality, a
greenwashing reputation event). **A third ethics dial** beside bulletproof and astroturf.

#### The Secondary Market
Buying and selling the things you own.

**How it works:** Four markets: **used hardware** (sell your cascade output, or buy a competitor's
liquidation at 20 cents); **IPv4 blocks** (an appreciating asset with a broker and a due-diligence
problem — see §4.4's blacklist-history trap); **customer books** (buy or sell a set of accounts with a
churn haircut); and **spot capacity** (rent from a competitor in an emergency at a punitive rate, or
rent yours out). **Makes your assets liquid**, which turns a cash crisis from a death sentence into a
decision about what you are willing to lose.

#### Insurance Priced by Behaviour
Premiums as a scorecard.

**How it works:** Extends §6.11's "loans priced by your uptime streak." Cyber-insurance premiums and
deductibles are quoted from a *questionnaire about your controls* — MFA coverage, backup testing,
segmentation, patch lag, incident response plan. The quote is a free, honest, external assessment of
your security posture delivered annually, and improving it is directly worth money. **An audit you're
paid to pass.**

#### Bad Debt and the Write-Off
Money you will never get.

**How it works:** Receivables age; past 90 days a percentage becomes uncollectable. You must
**provision** for it (reducing reported profit now, correctly) or not (looking better now, taking a
lump later). A small accounting mechanic that teaches conservatism and makes §6.8's AR aging buckets
actually matter.

#### The Pricing Floor Calculator
Knowing when you are selling below cost.

**How it works:** An unlockable tool that computes true cost-to-serve per plan — hardware
amortisation, power, bandwidth at your blended rate, support minutes, payment fees, abuse allowance
and a share of fixed costs — and draws a **red line on the price slider**. Players will discover their
most popular plan is below it. **The single most eye-opening moment the economy can deliver**, and it
is a UI element rather than a system.

#### The Cost of a Ticket
One number that reframes support.

**How it works:** A running, visible **cost per ticket** figure (fully loaded), alongside **tickets per
100 accounts per month** per plan tier. The moment the player sees that their $5 plan generates 0.4
tickets a month at $18 each, the entire shape of the business changes. Every support-deflection
purchase in §4.9 becomes obviously worth it, and the Support Vampire stops being a joke and becomes a
line item.

#### The Three Budgets
Separating money that cannot substitute for each other.

**How it works:** Capex, opex, and **hands** are tracked as three separate budgets with explicit
conversion rules and friction between them. You can convert cash to hands (hiring, contractors) slowly
and at a premium; you can convert hands to capex savings (do it yourself) at a risk cost; you *cannot*
convert capex to opex instantly without financing. **Making the conversions visible and lossy is what
makes resource management interesting** rather than a single pool with a colour.

---

### 6A.2 Scoring gaps

#### The Externality Score
What you did to everyone else.

**How it works:** A fifth axis on every scorecard: outbound abuse originated from your network,
amplification attacks you reflected, spam delivered, DMCA notices unactioned, carbon emitted. **You
can win a level and be a bad neighbour**, and the game should say so without lecturing. Feeds directly
into Trust-with-upstreams (§6.1) so it has teeth.

#### Perceived vs Actual Reliability
Two uptime numbers.

**How it works:** **Measured uptime** (what your monitoring saw) and **experienced uptime** (what
customers actually got, including things you didn't monitor and partial failures you called degraded).
The gap between them is your observability quality, shown as a bar. A level scored at 99.99% measured
and 99.6% experienced is a specific, diagnosable failure. The reliability version of §9.2's Compliance
Theater Meter, and a better idea than most of §6.9.

#### The Decision Audit
Three decisions, scored.

**How it works:** At level end the game surfaces the **three moments that mattered most** — measured by
counterfactual impact in the simulation — and shows what you chose, what the alternatives would have
produced, and how confident it is. Not a grade; an explanation. **It answers "what should I have done
differently" directly**, which is the question every strategy-game player has and almost never gets
answered.

#### Par Time to Detect / Par Time to Repair
Benchmarks with a face.

**How it works:** For every incident type the game holds a par MTTD and MTTR (authored, or derived from
aggregate play). Your result is shown against par with a note on what would have moved it. Turns two
abstract acronyms into a golf score.

#### The Streak Ladder
Long-horizon achievement with escalating stakes.

**How it works:** Consecutive days without: an SLA breach, a data-loss event, a security incident, a
missed backup window, a reliability-driven churn. Each streak has its own counter and its own reward
tier (better financing, better customers, better hiring, an insurance discount). **Breaking one hurts
more the longer it ran**, creating real, earned dread — and the game should let you see other players'
streaks.

#### The "Would You Have Survived" Simulator
An end-of-level resilience probe.

**How it works:** After scoring, the game runs your final topology against five hypothetical failures
you *didn't* experience — a rack loss, a transit loss, a DB loss, a key-staff loss, a region loss —
and reports which you would have survived. **A resilience score derived from your architecture rather
than from your luck**, converting §6.9's Blast Radius Rating from an observation into a test.

#### The Customer's Scorecard
Being graded by the people you serve.

**How it works:** At level end, three of your named customers each produce their own one-page
assessment of you — uptime as *they* experienced it, support responsiveness, value for money, and
whether they will renew. They disagree with each other and with your dashboard. **A score written in
the second person is worth ten written in the third.**

---

## 7. Core gameplay mechanics

### 7A.1 The biggest missing mechanic: traffic prioritisation

#### QoS Classes and the Priority Ladder
Deciding whose packets, requests and jobs matter — in advance.

**How it works:** The player defines 3–5 **traffic classes** and assigns rules that sort incoming work
into them: by customer tier, by request type, by authentication state, by endpoint, by source
reputation. Each class gets a weight, a queue depth and a shed-order position. Under pressure the
system serves high classes first and drops or delays low ones automatically.

This one mechanic makes the whole game work better, because:
- It gives the player a **peacetime decision with wartime consequences**, which is Pillar P3 made
  concrete.
- It turns the Shared Pipe (P1) from a lament into a control surface: you cannot stop threats without
  hurting visitors, but you *can* decide which visitors get hurt last.
- It makes the Sacrifice Decision (§3.9) a standing policy instead of a panic button.
- It gives every hosting type a different correct answer: a game host prioritises in-session players
  over joiners; an email host prioritises transactional over bulk; a backup host prioritises restores
  over backups (obviously, and yet almost nobody configures it); a CDN prioritises cache fills over
  purges; a colo prioritises nothing, because you don't control the packets — which is itself a lesson.
- **Getting it wrong is visible and specific**: you prioritised your whale, starved the long tail, and
  the review sites noticed.
**Visual:** the lane physically splits into weighted channels at the edge, with class colour carried as
an *edge stripe* on each mote so it never collides with the violet/cyan/magenta semantics.
**Interacts with:** §7.1 (the mixed lane), §7.7 (graceful degradation), §3.9 (the sacrifice), §4.4
(the edge tier), §6.5 (tiering becomes a product you can sell).

---

### 7A.2 Automation, policy and delegation

#### The Policy Book (standing rules as a first-class object)
The game's entire tech tree is about automation and there is no UI for it.

**How it works:** A book the player writes rules into, in a simple **when / for / then / unless** form
built from game nouns:
> *When* `web-tier CPU > 85%` *for* `2 min` *then* `scale out by 2` *unless* `budget remaining < $200`.
> *When* `a drive fails` *then* `open a ticket and dispatch remote hands` *unless* `it is the second
> failure in this array`, *in which case* `page me`.
> *When* `load > 90%` *then* `shed class 4`.

Rules carry a small upkeep (each is a thing that can be wrong) and are **visible, editable and
auditable**. The Runbook Ladder (§5.4) drafts them for you after you have done something three times,
which is the perfect on-ramp. Critically, **rules can conflict**, and the book shows conflicts — two
rules firing on the same condition is the origin of a wonderful class of self-inflicted incident.
**Interacts with:** §4.6 Runbook Automation, §7.5 Autopilot, §7.7 graceful degradation.

#### Ghost Hands (rendering automation)
You should be able to *see* what the system will do without you.

**How it works:** Automated actions are performed by translucent "ghost" staff sprites that walk the
board and do the thing. When an automation is armed but not firing, its ghost stands next to the
object it watches, idle. **Your automation coverage is therefore visible as a population of ghosts
standing around your datacenter**, and the parts of your estate with no ghost are the parts where you
are still the automation. The best possible visual answer to "what does my tech tree actually do."

#### The Dry-Run Toggle
Every automation can be run in observation mode first.

**How it works:** A rule in dry-run logs what it *would* have done without doing it. After N successful
shadow-firings the game offers to arm it. **The correct way to deploy automation, as a mechanic**, and
it prevents "I automated it and it destroyed everything" from feeling unfair.

#### The Kill Switch and the Suspension Verb
Turning automation off during an incident.

**How it works:** A global "pause all automation" control, and per-rule suspension. Learning that you
must suspend the automation *before* manually fixing something is a lesson the game should teach by
letting the automation undo your fix once, visibly, with the ghost hand walking over and putting it
back.

#### Delegation Bands
Who may do what without asking you.

**How it works:** Three bands per staff member: **inform** (they do it and tell you), **consult** (they
propose and you approve), **execute** (they do it and you find out in the log). Widening bands frees
your attention and increases variance; narrowing them makes you the bottleneck. **The scaling verb of
the entire late game**, and it should be a two-click matrix rather than a menu.

---

### 7A.3 The simulation and the board

#### Ground Truth vs Observed Truth (the engine rule)
The merged doc leans heavily on dashboards that lie and never states how.

**How it works:** The simulation maintains **two parallel states** for every object: what is actually
true, and what the player's instrumentation reports. Monitoring buildables improve the fidelity,
freshness and coverage of the observed layer. Every "everything is green" moment, every gray failure,
every stale replica, every fog-of-instrumentation blank, and every red herring falls out of this one
structural decision rather than being authored per-incident. **Stating it explicitly turns a dozen
scattered ideas into one system**, and it is the most important missing line in §7.

Corollary rules:
- Observation has **latency** (graphs 30–60s behind by default; tracing faster; a customer ticket
  minutes behind that).
- Observation has **coverage** (uninstrumented objects report *nothing*, not zero).
- Observation can be **wrong** (a health check that checks the wrong thing reports healthy).
- **The player may only act on observed truth.** The camera itself is part of the observed layer —
  §9.2's "The Camera Is a Camera" is the visual expression of this rule.

#### The Determinism and Fairness Contract
What the game promises about randomness.

**How it works:** A stated design contract: (1) every run is **seeded and replayable**; (2) no failure
is unavoidable — every threat has at least one counter that was purchasable before it landed; (3)
randomness determines **timing and target**, never **existence** — the wave table is authored, the dice
only decide which drive and which minute; (4) a losing run must be explicable in one sentence on the
postmortem screen. **This contract is what lets the game be brutal without being unfair**, and every
"realistic random failure" idea in the document needs it.

#### The Time Model (one coherent clock scheme)
The doc has milliseconds, seconds, hours, months and years all claimed as "the tick."

**How it works:** Three nested clocks with stated ratios:
- **Sim time** — 1 real second = 1 sim minute at 1× speed. A 20-minute level is ~20 sim hours.
- **Business time** — a **month boundary** every ~7 real minutes (≈3 per level), triggering billing,
  payroll and the P&L. A 90-day-lag consequence therefore lands 2–3 levels later, or, for within-level
  lags, on the Obligation Rail.
- **Incident time** — during a declared incident the game may drop to 0.25× so millisecond-scale
  phenomena (tick rate, jitter, p99) become legible. Game-hosting and ad-tech levels run permanently
  at this scale.
Stating the ratios makes every timer in the document commensurable, which currently it is not.

#### The Wave Envelope (reconciling waves with continuous flow)
See Part B §1 for the problem.

**How it works:** Baseline traffic is **continuous and diurnal** — it never stops and it has a shape.
On top of it the generator schedules **events**; an event has a ramp, a plateau, a decay, a composition
and a telegraph. A "wave" is an event envelope, and a level's rhythm is the pattern of events over the
baseline. This preserves everything §1.7 wants (two-beat rhythm, pressure budget, telegraph depth)
while keeping §7.1's continuous model. **Different hosting types get different baselines and different
event vocabularies**, which is another cheap variety axis.

#### Confidence as a Diagnostic Resource
Acting on incomplete information, explicitly.

**How it works:** During diagnosis the game tracks your **hypothesis confidence**, derived from the
evidence you have gathered and the tools you own. You may act at any confidence level. Acting at 40%
is fast and often wrong (and a wrong action costs time *and* can make things worse); gathering more
evidence costs the thing you have least of. **A visible confidence number turns "should I wait or act"
into a real decision** rather than a feeling, and it is the mechanical heart of what makes incident
response hard.

#### Multi-Select, Batch Actions and the Fleet Verb
Essential at scale and never mentioned.

**How it works:** Select by drag, by filter ("all nodes with patch lag > 30 days"), or by saved group.
Batch actions have a **blast-radius preview** ("this will affect 47 machines and 12 customers") and a
mandatory rollout policy (all at once / canary / rolling / one rack at a time). **The rollout policy is
where §4.6's config-management threat lives**, and putting it in the UI means the player chooses their
own blast radius every single time.

#### The Change Request Flow
Proposing, reviewing and applying.

**How it works:** At Tier 3+, risky changes go through a lightweight flow: draft → impact preview →
approval (self, peer, or board depending on policy) → scheduled window → apply → verify → close. Each
stage can be skipped; skipping is faster and riskier. The QA/Change-Management Board (§4.9) sets how
much of the flow is mandatory. **Process rendered as a pipeline you watch your change move through** —
and during an incident, the emergency-change path exists and leaves a mark.

#### The Pre-Mortem
A planning action, not a reaction.

**How it works:** Before a big change or event, spend a hand to run a pre-mortem: the game asks you to
predict *how this will fail* by selecting from a list, and rewards correct predictions with a prepared
mitigation (a faster rollback, a warmed standby, a pre-written status update). **A mechanic that
rewards pessimism**, which is the correct disposition for this job and which no game rewards.

#### Handoff and Shift Notes
Continuity as a mechanic in single-player.

**How it works:** At shift or level boundaries the game asks you to write — by selecting from generated
candidate lines — what the next shift needs to know. What you include is available to your staff
afterward (they act correctly on it); what you omit produces a specific wrong action later. **A
five-second interaction with a twenty-minute consequence.**

#### The Two-Key Action
Irreversible things require deliberate friction.

**How it works:** Certain actions (delete customer data, revoke a certificate, drop a table, cancel a
circuit, terminate a tenant) require a second confirmation that is *not* a click-through: typing the
object's name, or a second staff member's approval if you have one. **Deliberate UI friction as a game
mechanic** — and the game should let the player turn it off in settings and then live with that.

#### Capacity Ordering with Lead Times
The purchase pipeline.

**How it works:** Buying isn't instant; it is a **pipeline with stages** — quote, approval, order,
manufacture, ship, customs, receive, burn-in, rack, cable, provision — each with a duration and a
possible hiccup. An order board shows what is in flight. **Expediting** costs money at any stage. This
makes §4.1's "build time" into a system and makes capacity planning (the actual Tier 4+ job) playable.

---

### 7A.4 Failure and recovery (gaps)

#### The Recovery Rehearsal
Practising the thing you hope not to do.

**How it works:** A scheduled, costed exercise where you actually execute a failover, a restore or a
black start during a declared window. It reveals the specific step that doesn't work (there is always
one), which you then fix. **Every rehearsal makes the real event measurably faster**, tracked as a
per-procedure confidence stat that decays over time.

#### The Failback Problem
Getting home is harder than leaving.

**How it works:** After failing over to a secondary site, **failing back** is a separate, riskier
operation: data has diverged, the secondary is now authoritative, and the primary is cold. Many real
organisations fail over and then live at the secondary forever. The game should model this: failback
is its own project with its own risk, and choosing to stay is a legitimate, slightly sad, very real
outcome.

#### Partial Restore and Prioritised Recovery
You don't restore everything at once.

**How it works:** During a restore you choose the **order**: which customers, which systems, which data
ranges. Restore bandwidth is finite. Prioritising your whale is rational and visible, and the
customers restored last will know they were last. **The most uncomfortable decision in disaster
recovery, made into a queue you arrange.**

#### The Corruption Horizon
How far back do you have to go?

**How it works:** When corruption is discovered, the question is not "restore" but "restore to *when*"
— and every hour you go back destroys an hour of legitimate data. Finding the corruption onset
requires investigation. **A restore that loses a day of orders to remove four bad rows is a choice**,
and it is one the merged doc's backup material never reaches.

#### Degradation Debt
Running in degraded mode has a cost that accrues.

**How it works:** Every hour in a degraded state (cache disabled, replica down, redundancy consumed, a
feature off) accumulates a debt: deferred data, growing queues, unwritten replication, unsent email,
uncollected metrics. **Restoring service means paying the debt down**, and a long degradation can
produce a backlog whose catch-up is itself an overload event. The best argument for fixing things
quickly, and it explains the real phenomenon where recovery causes a second outage.

#### The Blast Door
A manual, deliberate, damaging containment action.

**How it works:** Sever a segment of your own network or estate to stop something spreading —
ransomware, a worm, a compromised tenant, a cascading retry storm. It takes those customers offline
immediately and definitely, and it works. **A verb that trades certain small damage for uncertain
large damage**, which is the actual calculus of containment and which the game currently only has in
the form of the Big Red Button (a much blunter instrument).

---
## 8. Visuals and presentation

#### The Policy Layer (rendering standing rules)
The game has no way to draw a decision that hasn't happened yet.

**How it works:** A fourth, optional rendering layer above Annotation, toggled by a key, showing
**intent** rather than state: armed automations as ghost figures, standing rules as translucent tethers
between a condition and its object, the shed-order as numbered tags on traffic classes, and scheduled
future actions as faint objects on the Timeline Ribbon. Paired with Ghost Hands (Part A §7), it makes
the entire automation half of the tech tree visible.

#### "Explain This Number"
Every figure is clickable and shows its derivation.

**How it works:** Click any number anywhere — MRR, PUE, p99, occupancy, a bill, a score — and get a
card with the formula, the inputs, and where each input came from, with the inputs themselves
clickable. For a game with this many derived metrics it is not a nice-to-have: **it is the difference
between a strategy game and a spreadsheet you don't trust.** It also doubles as the Field Notes (§9.5)
delivery mechanism, in context, at the moment of curiosity.

#### The Graph Specification
The doc says graphs are how you win and never describes one.

**How it works:** A house style for every time-series: percentile bands (p50/p95/p99 as three lines,
never an average alone), a **last-week ghost line** for comparison, annotation pins for deploys and
incidents, a shaded band for the SLO, and a clearly-marked "no data" state that is visually distinct
from zero. **The distinction between "zero" and "we don't know" is the single most important thing a
monitoring UI can communicate**, and it is exactly the game's theme.

#### The Diff View
Comparing two states.

**How it works:** Any two moments, configurations or objects can be diffed: a rack elevation before and
after, a config now versus last known-good, your topology versus a template, two supposedly identical
machines, this month's P&L versus last. Rendered side by side with changes highlighted in a dedicated
diff colour *outside* the semantic palette. **The most useful diagnostic UI in real operations, absent
from the doc.**

#### The Compare Tray
Evaluating purchases side by side.

**How it works:** Drag two or three build cards into a tray at the bottom of the screen and see their
Capability / Cost / Upkeep / Latency / Friction / Surface rows aligned, with deltas called out. **Turns
the build catalogue from a list into a decision tool.**

#### The Attention Heatmap
Where have you been looking?

**How it works:** A post-level overlay showing where the camera actually spent its time, laid over
where incidents actually occurred. Players discover they watched the interesting rack while the boring
one failed. **A self-knowledge tool disguised as a stat**, and it makes the "attention is a resource"
pillar visible retroactively.

#### The Consequence Fuse
Drawing time-delayed effects.

**How it works:** When an action schedules a future consequence, a thin, slow-burning fuse line runs
from the action to its landing point on the Timeline Ribbon / Obligation Rail. Good consequences burn
gold, bad ones amber. **You can literally see how much is coming**, and a screen with nine fuses
burning is a visceral picture of a decision-heavy month.

#### Aggregate Patience
Reading visitor health when there are no individual visitors.

**How it works:** At Z3/Z4, where individuals become a particle field, the patience ring is replaced by
the **stream's colour temperature and coherence**: a healthy stream is tight, bright and fast; a
suffering one is spread, dim and slow, with visible fraying at the trailing edge where the bouncers
are. Resolves the conflict between "the ring is readable at any zoom" and "aggregate, don't shrink."

#### The Thumbnail Test
An art-direction acceptance test to sit beside the Quiet Frame Test.

**How it works:** A 128px thumbnail of any screenshot must answer three questions: which hosting line is
this, what tier is it, and is it okay right now. If it can't, the composition has failed. Cheap,
ruthless, and it directly serves the game's biggest production risk — thirty hosting types that must
read as distinct.

#### The Player Character Question
Who are you, visually?

**How it works:** Propose: **you are the cursor and the clipboard.** No avatar in the world; you are the
selection reticle, the flashlight cone in dark scenes, the hand tokens at the bottom of the screen, and
a desk in the office that accumulates objects (a mug, a pager, a photo, awards, a plant that lives or
dies with your morale stat). The one time you appear is **the photo on the About page of your own
website**, visible in the Site Preview Window — a wonderful, subtle joke. Keeps the fantasy flexible
and costs almost nothing.

#### The Nobody-Is-Watching Frame
An idle-camera behaviour with a purpose.

**How it works:** If the player doesn't move the camera for 45 seconds during peacetime, it begins a
very slow drift along a pleasing path. Combined with day/night lighting and the hum, this is the
screensaver mode (§9.7) happening *during play*, and it makes calm periods feel like something rather
than like waiting.

#### Visual Grammar for "Not Built"
Rendering the absence of capability.

**How it works:** The Pegboard (§5.8) handles tools. Extend it: unbuilt-but-buildable infrastructure
appears as **faint construction-line ghosts in the places it would go** when the relevant overlay is
active — the empty U where a second load balancer belongs, the blank wall where the generator would be,
the missing second transit arc at the map edge. **Seeing the shape of what you haven't done** is a
quietly excellent teaching device and costs one shader.

#### Per-Line Tint vs Alert Colour Arbitration
A concrete rule for a collision the doc creates.

**How it works:** Tenant tints and line tints are restricted to a **low-saturation band** applied to the
substrate layer only, and are suppressed entirely within the bounds of any object in a
warning-or-worse state. In short: **alert colour always wins, identity colour retreats.** State it
once, enforce it in the renderer.

#### The Incident Replay Frame
A shareable artifact from your worst moment.

**How it works:** After any major incident the game generates a single composite image: the Timeline
Ribbon with the incident marked, the topology at the moment of failure, the three key graphs, and the
outcome. Captioned automatically. **The postmortem as a poster**, and the thing players will actually
post.

#### The Scale Bar and the Unit Stamp
Making magnitude legible.

**How it works:** Every meter in the game carries a small permanent unit stamp (kW, Gbps, ms, TB,
req/s, $/mo) and, where relevant, a **familiar-comparison tick** — "1 MW ≈ 750 homes", "40 Gbps ≈ this
city's residential peak", "11 nines ≈ one lost object per 10 million years." The game is full of
numbers whose scale is meaningless to a newcomer, and one tick mark fixes each of them.

#### The Two-Second Rule for Every Screen
An acceptance test for UI panels.

**How it works:** Any panel the player opens during an incident must yield its primary answer in two
seconds. Panels that fail get restructured until the answer is at the top in the largest type.
Enforced by playtest with a stopwatch. A small discipline that would materially improve every UI idea
in §8.8.

---

## 9. Anything else

#### Career Mode (a life outside the pager)
The most honest mode available.

**How it works:** A parallel, small, non-optional meter: **your own life** — sleep, relationships, a
hobby, a holiday you've booked. Every 3am page costs sleep; every skipped weekend costs the other bar.
Running it to zero doesn't end the game, it degrades *you*: slower decisions, higher fat-finger chance,
worse judgement, and eventually a forced two-week absence at the worst possible time. The counter is
exactly the set of investments that makes the company resilient — automation, documentation, hiring,
on-call rotation. **The game's thesis made personal**, and it reframes every "boring virtue" purchase
as self-preservation rather than optimisation.

#### The Trade Radio
Ambient world-building you can listen to.

**How it works:** An optional background audio channel: a low-key industry podcast, a news bulletin on
the hour, a conference talk recording. It reports real in-game world events (a competitor's outage, a
vulnerability, an acquisition, a regulation) a few minutes before the mechanical consequence lands.
**A player who listens gets a head start**, exactly as reading logs does, and the game gets an enormous
amount of personality for the price of some audio.

#### The Company Handbook
A document you write, that the game reads.

**How it works:** A small set of authored policy statements the player selects at founding and can
revise: *"We never take on abuse-heavy customers." "We always publish a postmortem." "We do not deploy
on Fridays." "Nobody works alone at night." "We answer the phone."* Each has a mechanical effect **and**
each is checked against your actual behaviour. Violating your own handbook has a culture cost. **The
ethics dial with a memory**, and it makes the company feel authored rather than optimised.

#### The Exit Interview (yours)
An ending where you leave.

**How it works:** A win condition the doc doesn't have: you hire a successor, hand over, and go. The
ending sequence is the handover document you wrote, read back — then a slow epilogue showing what
happened to the company for five years afterward, based on the state you left it in: the
documentation, the bus factor, the debt, the culture. **The only ending in the genre where your score
is what the thing does without you.**

#### Becoming the Thing
An ending that turns the campaign's antagonist into you.

**How it works:** The roll-up conglomerate (§2.10's Acquisition Predator) buys you, and the epilogue
offers a postscript level where you operate *as* them — cutting costs at a company you just bought,
with its own staff and customers and history. Ten minutes, no combat, quietly devastating. The most
interesting thing a game about business could do with an acquisition ending.

#### The Ops Almanac
A persistent meta-document across all runs.

**How it works:** Not achievements — a **record book**. Your worst outage, longest streak, biggest
customer, most expensive mistake, the threat that has cost you the most across every company you have
ever run, the line you have played most, the line you have never played. It accumulates forever. **A
save file that reads like a career.**

#### Real Runbook Export
Take something out of the game.

**How it works:** Export your Policy Book, escalation matrix, incident timeline template and
architecture diagram as actual, usable Markdown/PDF. It costs nothing, it is a genuinely useful
artifact, and it is the most effective possible marketing for a game like this — an ops team that puts
a game-generated diagram in their real wiki has advertised it forever.

#### The Ruleset Card as a Mod Format
Community hosting types.

**How it works:** Formalise §0.2's Ruleset Card as an actual data file: six slots (unit, goal node,
scarce resource, patience analog, threat mix, look) plus a five-asset skin folder, a ticket-text pack
and a wave table. **A community member can author a whole hosting business in an afternoon.** Publish
the twenty official lines in exactly this format so the tooling is proven by the base game.

#### Localisation and Ticket Packs
A text-heavy game's production reality.

**How it works:** The procedural ticket generator, the trade press, staff chatter and the status-page
euphemism ladder are all **culture-specific humour**. Structure them as swappable packs from day one so
localisation is translation-plus-authoring rather than translation-of-untranslatable-jokes. The ticket
pack is also a perfect community-contribution surface.

#### Responsible Depiction Note
A production guardrail for the grey lines.

**How it works:** The bulletproof, privacy and abuse material is some of the most interesting content in
the design and the easiest to get wrong. Proposed rule: **the game may depict the business, never the
technique.** Abuse is abstracted to tickets, complaints and consequences; it never teaches anything
operational about committing it. The bulletproof line's arc should end somewhere — deplatformed, or an
exit ramp to legitimacy — rather than being a stable, rewarded strategy.

#### Accessibility Modes as Content
Two that are also good game modes.

**How it works:** **One-Hand Mode** — the entire game playable from a radial menu and four keys, which
turns out to be a *fast* way to play and which speedrunners will adopt. **Sonified Mode** — full audio
telemetry with screen-reader-compatible board navigation, which is also the best "play it on a second
monitor while doing something else" mode. Designing accessibility as a mode rather than a settings
page makes it good enough that everyone uses it sometimes.

#### The Museum Docent
A reason to revisit the Company Museum.

**How it works:** A staff member gives tours of your own history to new hires (and to the player). The
script is generated from your actual run: *"This is the first server. It ran for four years. We lost it
in the flood of year three and Maria drove out at 2am to get the drives out."* **The game narrating
your own history back to you** is the cheapest emotional payoff in the design and it lands every time.

#### The Failure Hall of Fame
Community-shared disasters.

**How it works:** Opt-in upload of your worst incident as a playable Incident Mode scenario (§9.1).
Others play your disaster and try to do better. **Community content generated from failure rather than
from authoring**, which fits this game perfectly and costs almost nothing once replay exists.

#### The Long Save
A design commitment worth making explicit.

**How it works:** A single company, persisting across every mode, for hundreds of hours, accumulating
history, staff careers, hardware biographies, scars and museum exhibits. Everything else — campaign,
scenarios, daily challenges — writes into it. **The merged doc keeps inventing meta-progression
systems (the Playbook, the Museum, the Alumni Network, the Ledger, Prestige, the Almanac) and they
should all be facets of one persistent company object**, or they will compete for the same screen.

#### The Anniversary
A small recurring beat with a big cumulative effect.

**How it works:** Once per in-game year, a short interstitial: a photo of the team, a one-line summary
of the year, the number of customers served, the number of incidents survived, and one thing that
changed. Four of them in a row at the end of a campaign is a better ending than any cutscene.

#### Two Companies, One You
A late-game structural twist.

**How it works:** After an Exit, an option to start a *second* company while the first continues to
exist in the world as an NPC — run by your successor, using your architecture, making your mistakes,
and occasionally competing with you or partnering with you. **Your own past self as a persistent
character in the world**, which is a stronger version of §9.2's "Your Past Self Is The Boss."

---
---

# PART B — IMPROVEMENTS AND EXPANSIONS

*Each entry names the existing heading it applies to, states the problem or gap, and proposes a
concrete fix. Where a number is proposed it is a starting value for tuning, not a claim of truth — but
a starting value is what the document is missing.*

---

## 1. Levels, scenarios, and progression

### → "The Pressure Budget" / "The Two-Beat Wave" (§1.7) vs "The dependency graph IS the map" + continuous flow (§7.1)
**Problem — a real contradiction.** §1.7 is written for a classic discrete-wave tower defense
("each wave has a numeric pressure allowance," "every wave is a threat pulse immediately followed by a
visitor surge"). §7.1 and all of §3 describe a **continuous** flow of traffic with queueing,
utilisation curves and patience drain. These are different games. If waves are discrete, the queueing
model is decoration; if flow is continuous, "wave" has no referent.

**Fix — the Wave Envelope (Part A §7).** Baseline = continuous, diurnal, never zero. Events = shaped
envelopes laid over the baseline, each with ramp / plateau / decay / composition / telegraph. Restate
§1.7 in these terms: the **Pressure Budget** becomes the budget for *events per unit of level time*;
the **Two-Beat Wave** becomes an authoring pattern (a threat event immediately followed by a demand
event); **Telegraph Depth** becomes "you can see the next two envelopes on the Timeline Ribbon."
Everything §1.7 wants survives; the model becomes coherent.

### → "Tier 0 — Hello World / Inside the Box" (§1.1)
**Problem.** A ten-to-twelve minute tutorial whose "whole emotional arc is *powerlessness*" is a
significant risk for the first ten minutes of a game people bought voluntarily.

**Fixes:** (a) Precede it with the Cold Open (Part A §1) so the player has seen the destination.
(b) Give Tier 0 **one genuinely satisfying win** in the first three minutes — the player adds a cache
and watches the worker-slot ring visibly empty out. Powerlessness should be the *frame*, not the
*feel*. (c) Cut it to 6–8 minutes. (d) End it with the shared host suspending you anyway, so the
powerlessness pays off as a *narrative* beat rather than as twelve minutes of gameplay.

### → "Tier 5 — Anycast / The Map" (§1.1), "Two datacenters is the most dangerous number"
**Gap.** The line is stated as a slogan and never given a mechanic.

**Fix.** Make quorum an explicit, purchasable, *cheap* object: a **witness / tiebreaker node** that
costs almost nothing (it's a tiny VM in a third location) and whose absence is the thing that turns a
WAN partition into a split-brain. The lesson lands hard precisely because the fix costs $12/month and
the player didn't buy it. Show it in the Secondary Everything Register (Part A §4) with "quorum: 2 of
2" flagged in red from the moment the second site goes live.

### → "The parallel business ladder (CEO framing)" (§1.1) and the scale ladder
**Problem.** Two complete campaign spines are proposed (L1–L10 business stages, Tier 0–6 scale tiers)
and the document never says how they relate. A reader cannot tell whether these are alternatives, an
overlay, or two halves of one thing.

**Fix.** State explicitly: **the scale ladder is the board and the business ladder is the scorecard.**
Each tier maps to one or two business stages (Tier 2 ≈ L3; Tier 3 ≈ L4–L6; Tier 4 ≈ L7; Tier 5 ≈ L8).
The business stage determines what the §6 HUD shows and what the level's win condition is denominated
in; the tier determines what the board looks like. One campaign, two readouts.

### → "Difficulty as SLA" vs "Difficulty as Business Model" (§1.6) vs "The price slider" (§6.5)
**Problem.** The doc flags two of these as competing for the same UI slot. There are actually **three**,
and adding the Operator-mode modifiers makes four.

**Fix — assign them to different layers:**
- **Business Model** = the *run* selector (like a faction). Chosen once, at company founding.
- **SLA tier** = a *per-contract* commercial term. Chosen per customer, many times per run.
- **Price slider** = an *in-level* dial the player moves continuously.
- **Operator modifiers** (Snowflake, Bus Factor 1, Boutique) = *optional challenge toggles*, in a
  separate menu, orthogonal to all three.
None of them is labelled "difficulty." A single derived **Pressure Estimate** number is shown at
founding so the player knows what they're signing up for.

### → "Legacy debt carry-over" (§1.6) + "The Company Ledger" (§1.6) + "The Comeback Curve" (§1.7)
**Problem.** Cash carrying between levels plus permanent scars plus legacy debt can compound into an
unwinnable campaign state three levels deep, which is exactly what "the bottom of the curve must be
playable" is meant to prevent — and there is no stated floor.

**Fix — three explicit floors.** (1) **Cash floor**: entering a level below a threshold triggers a
scripted bridge (a small emergency loan, an asset sale, a customer prepay offer) so you always start
with at least the level's minimum viable budget. (2) **Scar cap**: no more than three active scars;
a fourth replaces the oldest. (3) **Debt amnesty**: any legacy object can be retired at any time for a
one-off cost equal to its accumulated penalty, so debt is always escapable at a price. State these as
rules, not as GM discretion.

### → "Named customers persist" (§1.6) and the branching campaign (§9.1 Campaign)
**Problem.** Persistent named customers and a branching campaign conflict: if the player skips the
level where Brenda appears, later references to Brenda are broken.

**Fix.** Split the cast into **spine cast** (introduced on the mandatory spine, always present, safe to
reference forever — see the Recurring Cast in Part A §1) and **siding cast** (line-specific, referenced
only within that line's content). Every narrative callback must be rooted in the spine cast.

### → "The Type Ladder and the Sampler Structure" (§1.6)
**Gap.** Says types are "gated by tier" and lists the gating, but does not say how many types a single
campaign run actually visits.

**Fix.** Proposed: **6–8 lines per run**, of which 2 are mandatory (shared web at Tier 0–1, colo at
Tier 4 because it teaches the facility layer), and the rest are drafted from the sidings. With ~30
lines in the catalogue, that's a genuine replay proposition and it caps the authoring the player has
to absorb.

### → "Scenario library" (§1.5) generally
**Gap.** 50+ scenarios with no stated length, no stated position in the campaign, and no stated
frequency.

**Fix — a three-bucket taxonomy with lengths.**
- **Interludes (3–6 min):** one-mechanic, one-decision, no build phase. `Fuel Truck`, `The Loose
  Cable`, `The Missing Screw`, `The Fire Department Cut The Power`.
- **Scenarios (12–20 min):** one premise, a build phase and a resolution. The bulk of §1.5.
- **Sieges (30–45 min):** multi-phase, multi-system. `Post-Breach`, `The Audit`, `Datacenter Build`,
  `The Same Outage Six Ways`.
Ship roughly one interlude every two levels, one scenario every three, one siege per act.

### → "Chapter bosses" (§1.6)
**Gap.** A list of five antagonists with no stated structure.

**Fix.** Give every chapter boss the same three-phase shape so the player can learn to read it:
**Phase 1 — probing** (small, cheap, testing which of your defences exist); **Phase 2 — the real
attempt** (aimed at whatever Phase 1 found weakest); **Phase 3 — the consequence** (not more attack: a
bill, a listing, a lawsuit, a review, a churn wave). Phase 3 is the innovation — **a boss whose third
phase happens on the business screen** is unique to this game and it enforces P8.

### → "The Acquisition (fogged inheritance)" (§1.2)
**Problem.** The level requires "a completely different art skin (different faceplates, cable colours,
label font)" and makes normalising it the win condition. That is a genuinely expensive ask for one
level.

**Fix.** Make it a **three-parameter swap**, not a skin: (1) a different **cable palette**, (2) a
different **label typeface + naming scheme**, (3) a "grime + mismatched faceplate decal" layer. All
three are already parameters of the universal object grammar (§8.4). The level then costs three
variant values rather than an art pass, and "normalising" is literally re-running those three
parameters to your own values — which is a satisfying, animatable win condition.

### → "The Same Outage, Six Ways" (§1.4)
**Expansion.** Currently a fiber cut. The mechanic is much stronger with a **less obviously physical**
root cause, because the point is that the *same* thing manifests differently. Propose a second
version: **an expired certificate.** Web host: 95% bounce. Email host: TLS delivery fails to some
providers only, silently, and you find out from a customer. Game host: the launcher won't
authenticate, so nobody can join, but existing sessions are fine. API/DBaaS: every integration breaks
at once and retries hammer you. CDN: your edge can't reach your own origin. Colo: **nothing happens,
because you don't own any certificates** — and that is the joke and the lesson.

### → "Scars" (§1.6)
**Expansion — scars should be *readable* and *tradeable*.** Each scar carries (a) a name and a date,
(b) an explicit mechanical modifier, (c) a stated **remission condition** ("no data-loss event for 12
months"), and (d) a **disclosure choice**: you may proactively disclose the scar in sales
conversations, which costs some deals and makes the ones you win far more durable, or conceal it,
which wins more deals and detonates if discovered in diligence. **A permanent negative that the player
can *play* is far better than one they merely carry.**

### → "The Quiet Month" (§1.5) and "Peacetime must be valuable" (§9.6)
**Gap.** Peacetime is repeatedly asserted to be valuable and the only peacetime verbs listed are
research, drills and documentation — which are abstract and will feel like chores.

**Fix — give peacetime five *concrete* verbs with visible, immediate feedback:**
1. **Tidy** (cable management pass — the room visibly improves).
2. **Label** (asset tags and port labels — remote-hands error rate drops, and you can read the board).
3. **Drill** (a rehearsal with a visible confidence stat that goes up).
4. **Walk** (an inspection pass that finds one small thing, always).
5. **Write** (documentation, with the shelf visibly filling).
Each has a satisfying animation and a number that moves *now*. **Peacetime fails when its rewards are
all deferred**; at least one reward must be immediate and tactile.

---

## 2. Threats

### → "Capability vs. Surface" (P2, §0.1) and §2.5's "unspawnable until you build the thing"
**Problem — unbounded threat-pool growth.** If every buildable permanently adds threats to the pool and
the player builds fifty things over a campaign, the late game's wave table contains fifty threat
families. That is unreadable, it dilutes every individual threat to noise, and it makes the bestiary
(§5.4) pointless because nothing is ever *the* threat any more.

**Fix — three rules:**
1. **Mastery demotion.** A threat you have countered successfully N times (say 5) is demoted to
   **weather**: it still occurs, it is handled automatically by your standing defences, it produces a
   small background cost, and it stops appearing as a discrete event. The bestiary marks it "Mastered."
   This is already half-present in §5.4's Codex stages — make it mechanical, not cosmetic.
2. **Pool cap.** The wave generator draws from at most 8–10 *active* families per level, selected from
   your unlocked pool by the level's ruleset card.
3. **Retirement.** Removing a buildable removes the threats it invited (with a lag, because attackers
   don't get the memo immediately). This makes **deleting things a defensive move**, which is true and
   which the game currently cannot express.

### → "Nothing announces itself" (§2.1) vs "Threat pathing telegraph" (§2.13) and "Telegraphs" (§8.5)
**Problem — a direct contradiction.** §2.1 says the player gets the symptom, never the label, and
identification is a player action. §2.13 and §8.5 say threats are telegraphed with dashed magenta
trajectories before they move, and that "nothing lands without warning."

**Fix — separate *arrival* from *identity*.** You always see **that something is coming** (volume,
direction, magnitude — the telegraph). You never see **what it is** (family, intent, target) until
classification completes. Restate §2.1 as "arrivals are telegraphed; identities are not." That
preserves TD fairness and preserves the diagnosis loop, and it makes the violet-until-classified
palette rule (§8.2) the visual expression of exactly this split.

### → "The Mimic Tell (design law)" (§2.4) vs "Legibility Under Load" (P5) and the Readability Budget (§8.2)
**Problem.** "A fill colour a few degrees off," "a footstep that lands exactly on the beat," "a
slightly too-regular gait" cannot be perceived on a screen with 400 objects at 3× speed. The mimic
tell as specified only works at Z1 in a quiet frame.

**Fix — tells scale with altitude, and change *kind*.**
- **Z1 (one object):** the visual tell as written — gait, colour, timing. Rewards close looking.
- **Z2 (rack/cluster):** a **formation** tell — mimics arrive with unnaturally uniform spacing,
  identical inter-arrival times, or perfectly identical payload sizes.
- **Z3+ (room/topology):** a **statistical** tell surfaced in the UI — a histogram whose shape is
  wrong, a conversion rate that dropped while traffic rose, a request-size distribution with a spike
  at one value. At scale you don't *see* the mimic, you *notice the aggregate is wrong*, which is
  exactly how it works in real life and is a much better lesson.
State this as the rule: **the tell is perceptual at low zoom and statistical at high zoom.**

### → "Alert Fatigue" (§2.9) — "the game should literally start hiding or dimming alerts"
**Problem.** Silently hiding a real alert will read to most players as a bug, not a mechanic, and it
violates the fairness contract.

**Fix.** Make the fatigue *visible before it bites*: a **Signal-to-Noise meter** on the alert stack that
degrades as you dismiss repeats, with the dimming applied as a visible grey wash and a count ("14
alerts suppressed by fatigue"). The player can always expand the suppressed list at the cost of
attention. Then, when the real one is in there, the loss is **fair and legible** — they could have
looked, and they chose not to. That is a mechanic; silently hiding it is a trick.

### → "The Insider / Insider Badge" (§2.6) — "visually identical except for one pixel-level cue"
**Problem.** Same as the mimic problem, worse: a pixel-level cue on a staff sprite is not a fair tell,
and "players will screenshot and argue about it" is a description of frustration, not fun.

**Fix.** The insider is **not** detectable by looking at the sprite. They are detectable by
**behaviour over time** in the audit-log overlay: access outside their normal pattern, at unusual
hours, to systems outside their role, in a volume that doesn't match their job. The counter is
therefore **buying the log and reviewing it**, not staring. Keep the desaturated-badge art as a
*post-reveal* confirmation, not as the tell.

### → "Ransom DDoS" / "Extortion Crew" (§2.3, §2.11) — the ransom overlay that occludes the UI
**Problem.** "The attack is literally UI occlusion" is a great image and an accessibility and
usability hazard, especially during a live incident.

**Fix.** Occlude a **non-critical region** only (the incident ticker area), make it dismissable with
one key, and make the *dismissal itself* the mechanic: dismissing it starts the countdown visibly on
the Obligation Rail so you cannot forget it. The dread survives; the UI stays usable.

### → "The Competitor" (§2.11) — "their attacks are invisible on the infra board entirely"
**Gap.** A rival AI that only manifests as numbers in a business panel will not register as an
antagonist. The doc calls this "a genuinely interesting design space" and then leaves it empty.

**Fix — give the Competitor three visible surfaces:**
1. **The storefront at the map edge** (already proposed) — but make it *react*: it grows when they win
   a deal you lost, it puts up a banner when they launch a competing product, and its lights go out if
   you win.
2. **The trade-press ticker** — every competitor action generates a headline, so their strategy is
   *readable* if you follow the news.
3. **A shared-market panel** — a single bar showing the segment split between you, them, and the rest,
   updated monthly. Not a dashboard: one bar.
Also give them **a stated strategy per run** ("undercut," "upmarket," "acquire," "niche") that the
player can infer from the first three moves and then counter — which converts them from a random
event generator into an opponent.

### → "Nation-State / APT" (§2.11)
**Gap.** "If you never detect them, you win the level and lose the campaign beat" is elegant, but with
no counter-signal the player experiences nothing at all, which is not a design — it's an absence.

**Fix — three graduated tells that a prepared player can catch:**
1. **An absence:** one machine's log volume drops slightly because something is trimming logs. Visible
   only if you have baselines.
2. **A contradiction:** egress bytes exceed what your traffic model predicts, by a small margin, only
   at night.
3. **A witness:** a third party (a peer network, a researcher, a vendor advisory) mentions an
   indicator that matches something in your estate, in the ticker, once.
None of the three is conclusive; any two together are. **A boss made of weak signals** is exactly
right for this archetype, and it makes the detection genuinely earned.

### → "Threats path the dependency graph, not geometry" (§2.1)
**Gap.** States the principle and never gives the targeting rule, which is the thing an implementer
needs.

**Fix — a stated targeting function.** Each threat family carries a **target predicate** (node type,
exposure requirement, and a preferred property) and picks the **highest-scoring reachable node**, where
score = (vulnerability × value × exposure) / (defence depth on the path). Exposure is the orange hazard
chevron from §4.1; defence depth is the count and quality of classifying objects between the edge and
the node. This makes §7.6's security-surface overlay *literally the attacker's targeting view*, which
is both elegant and a great mechanic ("look at the board the way they do").

### → "Entropy: hardware, power, cooling, and physics" (§2.8) — frequency and tuning
**Gap.** An enormous family of small failures with no stated rate, which risks either "never happens"
or "constant noise."

**Fix — a stated entropy budget.** Each object has an **annualised failure rate** and the level's sim
time determines the expected count; the generator then *schedules* those events rather than rolling
each tick, so the player experiences a designed distribution rather than a Poisson process. Starting
values: drives 2%/yr rising to 8%/yr after year 4; PSUs 1%/yr; fans 3%/yr; switches 0.5%/yr; UPS
batteries hard-failing at 4–5 years; optics 1%/yr, tripling if counterfeit. Also: **entropy events
cluster deliberately** during high-load and high-heat periods, because that is both true and much
better drama.

### → "Threat behaviour mix-ins" (§2.13)
**Expansion — five more mix-ins, all real:**
- **Off-hours-only** (already present as "Timed") — extend it to *your* off-hours specifically, which
  means the mix-in adapts to the player's staffing.
- **Ramped** — starts below every threshold and increases 10% a day until something breaks, so no
  single moment triggers an alarm.
- **Targeted-at-one-customer** — the whole event is aimed at your most valuable tenant, so every
  mitigation is a customer-relations decision.
- **Piggybacked-on-a-maintenance-window** — arrives exactly when you declared an SLA suspension,
  because you announced it publicly.
- **Two-stage** — a loud, obvious, easily-defeated attack whose only purpose is to consume your hands
  while the real one happens elsewhere. **The most underused idea in the whole threat section** and it
  is the single best use of the Hands mechanic.

---
## 3. Visitors, traffic, and clients

### → "Patience as HP" (§3.1) + "Latency budget as visitor HP" (§3.1) + "Capacity as concurrency slots" (§7.1) + "The queueing hockey-stick" (§7.1)
**Problem.** Four separate descriptions of what is obviously meant to be one model, never reconciled,
with no formula. Patience drains from latency; latency comes from queueing; queueing comes from
utilisation; utilisation comes from concurrency slots — but the document never closes the loop, so it
is unimplementable and untunable as written.

**Fix — write the loop out, once.** Proposed:

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
  budget_ms <= 0  -> bounce (record where)
  reaches goal node with budget left -> convert, pay Value
```

Three consequences worth stating in the doc: (1) **latency is not additive across a static list, it is
emergent from load** — so the Latency Ladder readout (§3.1) must show *live* per-node values, not
spec-sheet values; (2) **the hockey stick falls straight out of the formula** rather than needing to be
authored; (3) **headroom is purchasable as slots**, which finally connects §4's buildables to §3's
bounce model numerically.

### → "The Latency Ladder readout" (§3.1) — the numbers
**Gap.** Gives one example (`Edge 8 + WAF 40 + LB 3 + App 120 + DB 200 = 371ms`) and no table.

**Fix — a proposed baseline table (idle service time, before queueing):**

| Node | Base ms | Notes |
|---|---|---|
| CDN edge hit | 5–15 | never reaches your board |
| Reverse proxy / edge | 2–5 | plus TLS on first connection: +40–80 |
| L4 load balancer | 1–2 | |
| L7 load balancer | 3–8 | path routing costs |
| WAF | 20–60 | tunable with aggression; the doc's 40 is a good mid |
| CAPTCHA challenge | 2,000–8,000 | it is a *human* interaction, and that is the point |
| Rate limiter | <1 | cheap, which is why it is over-used |
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

### → "Why visitors bounce" (§3.4) — the patience numbers
**Gap.** One number in the whole section ("bounces at ~500ms–3s").

**Fix — a proposed patience table (total budget, ms):**

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
| Streaming viewer | 3,000 to start, then jitter-sensitive | a second axis entirely |
| Game player joining | 2,000 to connect; then ping-bound | 80ms sustained = rage-quit |
| Backup job | infinite, but the *window* is finite | patience is the wrong model; use the window |
| Inference request | 200–2,000 | depends entirely on whether a human is waiting |
| Bid request (ad-tech) | 100, hard | the Timeout Cliff |

### → "Friction Gates" (§3.1) — friction must compound, and order matters
**Gap.** Friction is given as a per-defence percentage and never composed.

**Fix — two stated rules.** (1) **Friction compounds multiplicatively**, not additively: three 5%
gates pass 0.95³ = 85.7%, so the fourth gate is much more expensive than the first, and the UI should
show *cumulative* pass-through alongside per-gate friction. (2) **Order matters**: cheap, low-friction
classifiers should run first so expensive high-friction ones see less traffic — which makes **gate
ordering a player decision** on the cable, and it is free content.

**Fix — the missing friction numbers:**

| Defence | Friction (legit bounced/flagged) | Latency | Notes |
|---|---|---|---|
| Firewall (port/protocol) | ~0% | <1ms | the reason it feels free, and its ceiling |
| Rate limiter (generous) | 0.5–2% | <1ms | rises steeply as you tighten |
| Rate limiter (aggressive) | 8–15% | <1ms | and it eats NAT'd offices whole |
| fail2ban | 1–3% | 0 | but each false positive is a *whole office* |
| WAF (default rules) | 3–8% | 20–60ms | |
| WAF (paranoid) | 12–20% | 40–90ms | and it blocks your own admin panel |
| Bot fingerprinter | 0.5–2% | 5–15ms | low friction is what you pay for |
| CAPTCHA | 12–18%, 22% on mobile | human-scale | the bluntest instrument |
| MFA at login | 2–4% abandonment | human-scale | |
| 3-D Secure at checkout | 5–12% cart abandonment | human-scale | and it moves liability |
| Fraud screening (strict) | 4% good customers rejected | 0 | the doc's own number; keep it |
| Geo-block | 100% of a region | 0 | |
| Aggressive spam filter | 0.5–2% of *real mail* | 0 | and each one is an invoice |

### → "Classification, not destruction" (§3.1)
**Gap.** States that defences classify rather than kill, and then only ever describes two outcomes
(pass/drop).

**Fix — three outcomes, and the middle one is the interesting one.** **Pass** (free), **Challenge**
(costs latency and a fraction of patience; most real visitors survive it and most bots don't), **Drop**
(free for you, total for them). Making Challenge a first-class outcome gives every defence a
**tunable middle setting**, turns the aggression slider into a three-way mix rather than a line, and
directly models how real bot management works. It also makes the amber false-positive flash (§8.6)
more interesting, because there are now two ways to wrong a customer: bouncing them, and *annoying*
them.

### → "The Conversion Node" (§3.1) and "Value as Bounty" (§3.1)
**Gap.** Value is a flat number per visitor; session depth is described separately and never priced.

**Fix.** **Value accrues per hop, and the tail is where the money is.** A visitor that reaches hop 3 of
5 has generated some value (an ad impression, a signal, a cached warm path) but not the conversion.
Show it as a partially-filled coin. This makes deep-funnel protection *quantitatively* more valuable
than shallow, explains why the checkout path deserves disproportionate investment, and makes a bounce
at hop 4 visibly more painful than a bounce at hop 1 — which it is.

### → "The visitor model" (§3.1) — the missing bounce *reason* ledger
**Gap.** The Traffic Sankey (§6.9) shows bounce categories at the end of the level. There is nothing
during it.

**Fix.** A live, always-visible **top-three bounce reasons** strip, with counts, updated continuously:
"Latency at DB (41%) · CAPTCHA (22%) · TLS handshake (9%)." One line, three items, and it converts the
entire §3.4 catalogue from flavour into a live diagnostic. **The most actionable single UI element the
game could add.**

### → "Clients are Spawners" (§3.9)
**Gap.** Each client generates traffic, tickets, abuse risk and growth — but the doc never says how
their traffic *interacts*. In practice, at multi-tenant scale, the interesting thing is correlation.

**Fix.** Each client card carries a **correlation profile**: does their peak coincide with everyone
else's? Twenty e-commerce tenants all peak at the same hour and your capacity must cover the sum of
peaks, not the peak of the sum. **Deliberately signing anti-correlated customers is a strategy**, and
it is the customer-level version of the line-synergy idea in §0.2, which the doc has at the business
level and never at the account level.

### → "The Whale" (§3.2) / "The Concentration Risk Whale" (§2.10) / "The Concentration Donut" (§6.8)
**Gap.** Three entries about the same thing, all describing the danger and none describing the
*management*.

**Fix — four concrete whale-management verbs**, so it is a system rather than a warning:
1. **Multi-thread the relationship** — build relationships with three people at the account, not one.
   Costs account-management hands; protects against the champion leaving.
2. **Structure the contract** — a longer term with a ramp and a notice period, bought with a discount.
   Converts a cliff into a slope.
3. **Dilute** — deliberately pursue lower-value volume to reduce the percentage. Costs margin.
4. **Cap** — decline expansion revenue from the whale. **The most counterintuitive correct move in the
   game**, and it should be available and painful.

### → "Attraction and acquisition channels" (§3.6) — the missing numbers
**Gap.** Eighteen channels with no cost, no lag, no quality and no saturation point, which makes the
acquisition game unplayable as specified.

**Fix — a proposed channel table:**

| Channel | CAC | Lag | Quality (LTV mult.) | Saturates at |
|---|---|---|---|---|
| Organic search | ~$0 marginal | 4–6 months to build | 1.4× | your content volume |
| Paid search | $60–200 | instant | 0.8× | competitor spend |
| Affiliate / review site | $100–200 | 1 month | 0.6× | the number of sites |
| Deal forum | $5–15 | instant | 0.2× | one post, then nothing |
| Referral | $30–60 | 2 months | 1.8× | your happy-customer count |
| Reseller channel | ~$0 (20–30% margin share) | 3 months | 1.1×, invisible churn | partner count |
| Registrar cross-sell | ~$5 | instant | 1.3× | your domain base |
| Community / open source | staff time | 6–12 months | 2.0× | your credibility |
| Conference booth | $8k–40k one-off | 2–3 months | 1.6× (enterprise) | one per season |
| Outbound sales | $2,000–8,000 | 4–9 months | 2.5× (enterprise) | rep count |
| Migration concierge | staff time | instant, opportunistic | 1.7× | rival outages |
| Marketplace listing | 15–25% rev share | 1 month | 0.9× | the platform |
Two stated rules: **channels saturate** (doubling spend yields ~1.4× customers, not 2×) and **channel
quality is inversely correlated with speed** — the fast channels bring the worst customers, which is
the truest thing in hosting marketing.

### → "The Positioning Dial" (§3.8)
**Expansion.** Currently one dial with five settings and a sentence of consequence. Give each setting
its full consequence set — inbound archetype mix, threat mix shift, support cost per account, price
tolerance, churn baseline, and **which lines of business it makes harder**:
- *Cheapest*: volume + abuse, support cost 3×, price tolerance nil, churn 2×; locks enterprise and
  regulated lines.
- *Fastest*: performance-sensitive segments, a permanent infrastructure cost floor, high review
  sensitivity; pairs naturally with game hosting and CDN.
- *Most Supported*: highest margin per account, headcount-bound growth, best referral rate; fails at
  scale unless you automate.
- *Most Compliant*: slowest sales, highest ARPU, near-zero churn, enormous fixed cost; locks
  bulletproof forever.
- *Most Niche*: smallest addressable market, best conversion, best defensibility, catastrophic if the
  niche moves.
**The dial should also be *changeable* at a real cost**, because repositioning is a real and painful
thing companies do, and the doc's version is a one-time choice.

---

## 4. Buildables: services and infrastructure

### → "The Three-Column Law" (§4.1) — four buildables violate it
**Problem.** The doc states, in review-gate language, that "if a new buildable has no Friction, no
Surface, and no meaningful upkeep, **it is not allowed to ship**." At least four flagship buildables
are described as pure goods.

**Fixes, one each:**

**1. "Bot Fingerprinter / Behavioural Analysis" (§4.5)** — described as "identifies Mimics *without*
friction" and "the late-game answer to the game's central dilemma." As written it resolves the game's
core tension, which is a design failure.
*Give it:* (a) a **training period** during which its false-positive rate is *worse* than a WAF's;
(b) **model drift** — accuracy decays slowly and requires retraining hands; (c) **poisoning
vulnerability** (Part A §2); (d) a **privacy/compliance cost** — behavioural fingerprinting is a
regulated activity in some jurisdictions and disclosure obligations follow; (e) most importantly,
**it blocks without a reason** — its false positives generate the worst support tickets in the game,
because neither you nor the customer can find out why they were blocked. That last one is real,
specific, and it preserves the central dilemma rather than dissolving it.

**2. "Dunning Engine" (§4.9)** — "the cheapest-ROI tower in the entire game."
*Give it:* (a) **dunning fatigue** — retry too aggressively and card networks penalise you, and
customers who get five emails about a failed card sometimes just cancel; (b) a **false-positive
class**: a legitimate temporary decline treated as churn, and an account suspended in error, which is
the most reputationally expensive mistake a billing system can make; (c) **upkeep** in the form of
maintaining the retry schedule against changing processor rules.

**3. "Circuit Breaker" (§4.5/§7.7)** — "the first automation that feels like a superpower."
*Give it:* (a) **a threshold you can set wrong in both directions** — too tight and it opens during
normal load spikes, cutting a healthy feature; (b) **half-open flapping**, where the breaker
repeatedly probes a recovering dependency and re-kills it; (c) the fact that **an open breaker hides
the underlying problem**, so your alerting sees a healthy system serving fast errors and you don't
notice for an hour.

**4. "Cable Label Printer" (§4.7)** — "every ops person will buy it immediately."
*Give it at least a joke-shaped cost:* labels that are *wrong* are worse than no labels, so the
printer's benefit is conditional on a maintenance habit — a **label-accuracy stat** that decays as you
re-patch and that produces a specific, funny, painful incident when a tech trusts a stale label.

Also flag: **"Runbook Automation" (§4.6)** and **"Provisioning Automation" (§4.10)** are both described
in superlatives with only upside. Both need the same treatment: automation that runs the wrong
runbook, and provisioning that provisions abuse at machine speed (the doc mentions the latter in one
clause — promote it to a real, recurring consequence).

### → "The Build Card" (§4.1)
**Expansion — add three rows.** The card currently shows Capability, Cost, Upkeep, Latency, Friction
and Surface. Add:
- **Lead time** (how long until it exists — see Part A §7's ordering pipeline).
- **Blast radius** (how many customers depend on it once built) — the single most useful number for a
  placement decision and it belongs at the point of purchase.
- **Removal cost** (what it takes to get rid of it later). **Showing the exit cost at the entrance** is
  a genuinely novel UI idea and it directly serves the Regret Nodes concept in §5.5.

### → "Monitoring Stack (purchased in layers)" (§4.6)
**Gap.** Five layers with no costs, no coverage semantics, and no statement of what "not monitored"
looks like numerically.

**Fix — give each layer a coverage percentage and a blind spot:**

| Layer | What it sees | Blind to | Observation lag |
|---|---|---|---|
| Ping/port | the box is reachable | the service being broken | 60s |
| Service check | the service answers | the answer being wrong | 60s |
| Synthetic transaction | a real user journey works | everything you didn't script | 5 min |
| Real user monitoring | what real users experienced | anything that failed before reaching you | 2 min, sampled |
| Distributed tracing | which hop is slow | anything not instrumented | 10s, sampled |
| External multi-region synthetic | reachability from elsewhere | your internals entirely | 1–5 min |
Plus the stated rule from Part A §7: **uninstrumented means no data, not zero**, and the UI must never
draw "no data" as a flat line at zero. That single rendering rule teaches more about monitoring than a
paragraph of text.

### → "Backup System / Backup Vault" (§4.3)
**Expansion — make the 3-2-1 rule a literal widget.** Three copies, two media types, one offsite. The
backup object displays it as three filled/unfilled pips, and the player can see at a glance that they
have 3-1-0 and think they're covered. Add:
- **Restore throughput as a separate stat from backup throughput** — you can back up over a link you
  cannot restore over in an acceptable time, which is the single most common real backup mistake.
- **Backup window vs backup duration**, tracked separately, with the overlap failure state made
  explicit.
- **Retention schedule as a policy object** (GFS-style), with **legal hold** as an override that
  prevents deletion and costs storage forever.
- **The encryption key's own backup**, as a separate, checkable object. §2.12 has "The Encryption Key
  Nobody Has" as a threat with no corresponding buildable to prevent it.

### → "A+B Power Feeds / Dual Cording" (§4.7) and "Effective vs nominal redundancy" (§7.1)
**Expansion — make effective redundancy a computed, displayed, sortable stat.** Every object shows
**N+x (effective)** alongside **N+x (purchased)**, and a dedicated overlay colours objects by the gap.
Add the two specific traps as computed checks: (1) both cords on the same PDU; (2) both cords on
different PDUs fed from the same upstream breaker. The second is the one real operators miss, and a
game that catches it is teaching something genuinely useful.

### → "Generator + Fuel Contract" (§4.7)
**Expansion — the readiness stat.** Give the generator a single **Readiness** percentage derived from:
months since last load-bank test, months since fuel polishing, start-battery age, block-heater status,
fuel level, and whether the ATS has been exercised. Readiness is the *actual* probability it starts.
Displayed on the object, degrading visibly over time, restorable by boring maintenance. **This converts
§2.8's "Generator Fails to Start" from a dice roll into a consequence**, which satisfies the fairness
contract and makes the maintenance purchase legible.

### → "Cross-Connect" (§4.4) and "Cross-connects: the best line item in hosting" (§6.6)
**Expansion — the cross-connect needs a lifecycle, not just an MRC.** Add: an **install fee** and a
**lead time** (a tech has to actually run it); a **capacity constraint** (the tray between two rooms
holds a finite number); an **as-built record** that can be wrong, so cross-connects get orphaned and
you bill for cables nobody uses (real, embarrassing, and a lovely revenue-leakage story); and a
**disconnect process** with a notice period. The revenue is the point, but the *physicality* is what
makes the wiring minigame become the money minigame.

### → "Staff" (§4.8) — four overlapping people systems
**Problem.** Morale, Burnout, the On-Call Rotation, the Vacation mechanic, Staff Skill Pips, Bus Factor
and Culture are seven systems describing one thing, with overlapping stats and no arbitration.

**Fix — one Team model with four sub-stats and clear ownership:**
- **Capacity** (hands available now) — reduced by on-call recovery, vacation, illness, and meetings.
- **Energy** (0–100, per person) — drains with incidents, overtime and night work; recovers with quiet
  time and with *root-cause fixes* rather than firefighting. At <30, error rate rises; at 0, they
  leave.
- **Knowledge** (per person, per subsystem) — the source of bus factor, the thing documentation
  externalises, and the thing that walks out the door.
- **Culture** (company-wide) — a slow stat fed by blameless postmortems, sustainable on-call,
  documentation and whether you keep your Company Handbook. It modifies hiring cost, retention, and
  **whether people tell you bad news early**, which is the most important and least modelled thing in
  any organisation.
Everything else in §4.8 becomes a modifier on one of these four.

### → "The Office" (§4.7) and remote work
**Gap.** The entire staff model assumes people are in a room. A modern hosting company is often
distributed.

**Fix.** A **distributed-team toggle** with real tradeoffs: a wider hiring pool (cheaper senior talent,
follow-the-sun coverage for free) against slower informal knowledge transfer (Knowledge decays faster
and spreads slower), a harder culture stat to move, and **no hands for anything physical** — which
makes remote hands, out-of-band management and automation *mandatory* rather than optional. A single
toggle that reshapes the entire §4.8 economy and is extremely current.

### → "4.9 The business machine" as a whole
**Problem — scope.** §4.9 contains ~40 buildables. Presented all at once it is a second game. The doc
never says when each appears.

**Fix — a stated reveal schedule tied to tier:**
- **Tier 0–1:** none. You are the business.
- **Tier 2:** Billing Platform, Payment Gateway, a ticketing system. Three objects.
- **Tier 3:** Dunning, Fraud Screening, Status Page, Knowledge Base, the Pricing Engine, one support
  tier. Six more.
- **Tier 4:** Sales, Account Management, Abuse Desk, Legal Retainer, Compliance Vault, Collections.
- **Tier 5+:** the rest.
**Nothing appears in the build palette before its tier**, so the business layer grows at the same rate
as the infrastructure layer and neither one ever presents forty unexplained options.

---

## 5. Unlocks and discovery

### → "Postmortem Research (the primary engine)" / "Scar-driven progression" (§5.1)
**Problem — the core structural flaw in §5.** "You cannot research a counter until you've been hit by
the threat it counters" has three consequences the doc doesn't address:
1. **It punishes competence.** A player who builds well and avoids incidents has a smaller tech tree
   than one who plays badly. That is backwards.
2. **It makes new hosting lines unplayable.** Switching to email hosting with no email scars means you
   cannot buy any email defence, which is a hard wall, not a difficulty curve.
3. **On a second playthrough it converts the tree into a checklist of damage you must deliberately
   take**, which is the exact opposite of the intended "memoir" feel.

**Fix — three alternate acquisition paths, all already half-present in the doc, promoted to
first-class:**
- **Scar** (free, and the fastest) — you got hit; the node opens at a discount.
- **Foresight** (expensive) — Tabletop Exercise, Chaos Lab, Load Test, Pre-Mortem, or the Spike. You
  pay cash and senior hands to *simulate* the incident and open the node at full price. The doc has
  this in §4.5 and never connects it to §5.1 as the structural counterweight it needs to be.
- **Testimony** (cheap, slow) — the Competitor's Postmortem (Part A §5), a hired engineer's prior
  experience (§5.4's Job Applicant Skills), a conference talk, a vendor advisory, a peer network. **You
  learn from other people's scars.** This is the most true-to-life path and the doc has all the pieces
  scattered across §5.4 without ever naming it as an answer to the gating problem.
State the rule: **every node has all three paths priced**, so a careful player pays money and time for
what a careless player pays for in damage. That preserves the philosophy and fixes the flaw.

### → "The Scar Tree" (§5.2) and the campaign
**Expansion.** Add a **date and a cost** to each node when it lights up, and then aggregate them: a
"lifetime cost of things we learned the hard way" figure on the Company Museum wall. **A single number
that quantifies the price of your own education** is a better emotional payload than any individual
node's flavour text.

### → "Milestone unlocks / Scale milestones" (§5.3)
**Gap.** A dense paragraph of thresholds with no structure. It should be a table, and several
thresholds are missing their *pain* (the milestone should be triggered by the old way visibly
breaking, not by a number).

**Fix — add the breaking moment to each.** "50 customers → provisioning automation" is better as "the
level in which manual provisioning first causes you to *miss an SLA on a new signup* unlocks
provisioning automation." The threshold should be the consequence, not the count. Restate every
milestone in that form and §5.3 becomes an extension of §5.1 rather than a parallel system.

### → "The Deprecation Mechanic" (§5.7) vs "Ratchet unlocks" (§1.6) vs "Era-locked tech" (§7.8)
**Problem — three rules about the same axis that contradict.** §1.6 says "earlier mechanics never go
away; the stack of concerns is the difficulty curve." §5.7 says nodes rot to EOL and stop being
viable. §7.8 says whole branches are unavailable by era.

**Fix — distinguish *concerns* from *implementations*.** **Concerns ratchet** (once power is a concern,
it is always a concern). **Implementations rot** (this specific switch, panel, protocol or vendor ages
out). **Eras gate implementations, never concerns.** State it that way and all three rules coexist
cleanly: you will always have to think about power; you will not always use this PDU.

### → "The Threat Codex / Bestiary" (§5.4)
**Expansion — make the Codex *actionable*, not just a trophy case.** Add to each entry: (a) **your
personal record** against it (encounters / blocked / landed / mean time to detect), so you can see
which threats you are actually bad at; (b) a **"what stopped it last time"** line, which is the single
most useful thing an on-call engineer wants; (c) a **cost-to-date** figure; (d) **a filter that shows
only threats your current build invites**, which turns the Codex into a pre-level briefing tool rather
than a museum.

### → "The Runbook Ladder" (§5.4)
**Expansion — add the fourth rung and the failure mode.** The ladder is manual → runbook → automated.
Add **rung 4: eliminated** — the action is no longer necessary because the underlying cause was fixed.
The game should celebrate rung 4 far louder than rung 3, because automating toil is good and removing
toil is better, and this is the one place the game can make that distinction.
Add the failure mode: **a runbook that is subtly wrong is worse than none** (already noted in §2.9's
Documentation Rot), so promotion from rung 2 to 3 should require the runbook to have been *used
successfully* twice, not merely written.

### → "The prerequisite lattice" (§5.6)
**Problem.** A strict DAG of line unlocks risks becoming a single optimal path, which violates §9.6's
"no optimal build order."

**Fix.** Give each line **two or three alternative prerequisite sets**, so there are multiple routes in.
Email hosting: "12 months clean IP reputation" OR "acquire a company that has one" OR "hire a
deliverability specialist from a large provider and accept a longer warm-up." Colo: "own a facility"
OR "sublease a suite from your own landlord." GPU: "build the power" OR "take over a crypto tenant's
abandoned high-density space" (a beautiful link to §1.3's crypto ruins). **Alternative prerequisites
are cheap to author and they are what turns a lattice into a decision.**

### → "Regret Nodes" (§5.5)
**Expansion — signal without spoiling.** The doc says "the game doesn't warn you; the postmortem later
does," and flags the tension with fun-first design. A middle path: regret nodes carry a small, honest,
*non-specific* marker on the build card — a "⚠ scales poorly" chevron — that tells an attentive player
there is a cliff without telling them where. **Information that rewards reading without removing the
lesson**, and it satisfies both lenses.

---
## 6. Economy, money, and scoring

### → §6 as a whole — the missing baseline economy
**Problem.** §6 is eleven subsections of excellent economic *concepts* and contains essentially no
numbers. Nobody can tune, balance, or even imagine the game from it.

**Fix — a proposed starting baseline.** All figures are for tuning, in whatever the game's currency
is; the point is that a designer now has a scaffold to argue with.

**Starting position (Tier 1, one owned box):** cash $4,000 · MRR $0 · upkeep $180/mo · 1 hand.

**Buildable capital costs (Tier 2–3 scale):**

| Object | Capex | Monthly upkeep |
|---|---|---|
| 1U web server | $1,800 | $45 (power+space) |
| App server (2U, dual CPU) | $3,400 | $80 |
| Database primary | $6,500 | $140 |
| Read replica | $4,000 | $95 |
| Cache node | $1,200 | $35 |
| Object storage node (12-bay) | $5,500 | $120 |
| Top-of-rack switch | $2,500 | $25 |
| Core switch (pair) | $16,000 | $120 |
| Firewall appliance | $4,500 | $90 + $150 licence |
| L7 load balancer | $3,000 | $70 |
| Cabinet (rented) | — | $700–1,200 incl. 5kW |
| Cabinet (in your own building) | $18,000 fit-out | $0 rent, $340 power |
| UPS (rack, 6kVA) | $4,200 | $30, batteries every 4 yrs |
| Generator (250kW) + ATS | $95,000 | $600 + fuel + testing |
| CRAC unit | $28,000 | $400 |
| Transit, 1Gbps commit | — | $600–1,400 (region-dependent) |
| IX port, 10G | $1,500 install | $400 |
| Cross-connect | $300 install | $80–300 (and you *charge* this at colo tiers) |
| WAF (managed) | — | $250 + $0.60/GB |
| DDoS scrubbing retainer | — | $900 + per-incident |
| CDN | — | $0.02–0.08/GB |
| Backup storage | — | $6/TB/mo (hot), $1.20/TB/mo (cold) |
| Control panel licence | — | $2.50–8.00 per account |
| Monitoring (per layer) | — | $80 / $150 / $400 / $700 / $1,100 |

**Staff (fully loaded monthly):** intern $1,800 · junior sysadmin $4,500 · sysadmin $7,000 · senior
SRE $11,000 · network engineer $10,000 · DBA $10,500 · security engineer $11,500 · support T1 $3,600 ·
support T2 $5,500 · sales rep $6,000 + commission · account manager $6,500 · abuse analyst $5,000 ·
DC tech $5,000 (or remote hands at $180/hr, 4-hour minimum).

**Revenue units:** shared account $5–12/mo · managed WP site $30–90 · VPS $6–60 · dedicated
$90–400 · colo cabinet $700–1,600 + power · cross-connect $80–300 · game server slot $3–15 ·
mailbox $1.50–5 · DNS zone $0.50–4 · CDN $0.02–0.08/GB · object storage $0.015–0.025/GB/mo + egress ·
backup $8–25/TB protected · GPU-hour $0.90–4.50 · scrubbing $400–4,000/mo per protected prefix.

**Three derived sanity checks the game should surface:** payment fees are **13% of a $3 plan** and
**0.6% of a $500 plan**; a single support ticket costs **$14–22 fully loaded**; and a 1U server at
$1,800 over 48 months is **$37.50/month of pure depreciation before you pay for power, space or
anyone's time.** Those three numbers reframe the whole game.

### → "Cash vs Profit (the two ledgers)" (§6.4)
**Expansion — make the gap *causal*, not just displayed.** Show, on the cash meter, a small breakdown
of *why* cash differs from profit this month: hardware bought (capex, not expense), receivables
outstanding, deferred revenue recognised, debt principal repaid. **The player should be able to point
at the gap and name it**, which is the entire lesson.

### → "Bandwidth: the 95th-percentile bill" (§6.3)
**Expansion — make it playable, not just explained.** Three additions:
1. A **live running 95th percentile** displayed on the bandwidth graph with the current month's
   projected bill next to it, so the player can watch a sustained flood cost money in real time.
2. A **"samples remaining"** counter — you get ~36 hours of free spikes a month; a burst in week one
   spends them, and the same burst in week four is free. **A budget you can spend, which is a much
   better mechanic than a rule you must know.**
3. **Commit and burst pricing**: you commit to X Mbps at a discounted rate and pay a punitive overage
   above it, so under-committing and over-committing are both mistakes with different shapes.

### → "The oversell ratio" (§6.5)
**Gap.** A slider from 1:1 to 30:1 with no failure curve, which means it is currently a number with no
consequence model.

**Fix — a stated curve.** Contention probability rises as the product of (ratio × correlation), where
correlation is how synchronised your tenants' peaks are. Concretely: at 5:1 with uncorrelated tenants,
performance complaints are negligible; at 5:1 with correlated tenants (all e-commerce, all the same
timezone), you are already in trouble. **This makes the tenant-mix decision and the oversell decision
the same decision**, which is true and much more interesting than a lone slider.
Add the **cliff**: above a threshold, contention doesn't degrade gracefully — it produces a correlated
failure where everyone is slow at once and the support queue takes the whole team out. The slider
should be smooth until it isn't.

### → "Per-type economics / The revenue-shape table" (§6.6)
**Expansion.** The table is excellent and missing three columns that would make it a design tool:
**customer acquisition cost**, **time to profitability per customer** (the payback period), and
**support tickets per customer per month**. Those three turn a descriptive table into a prescriptive
one — the player can look at it and understand *why* shared hosting is a grind and why cross-connects
are the best business in the industry, without being told.

### → "Scoring and end-of-level rating / The four-axis scorecard" (§6.9)
**Gap.** Four axes, no weights, no per-type numbers, no thresholds for grades.

**Fix — a stated weighting scheme.** Default weights: Uptime 30 / Performance 20 / Profitability 30 /
Growth 20, with a fifth per-type axis worth 20 that displaces proportionally. Per-type reweights,
stated: colo = Uptime 25 / Occupancy 30 / Profit 30 / Tenant-satisfaction 15. Backup = Durability 40 /
Restore-success 30 / Profit 20 / Growth 10. Game hosting = Tick stability 35 / Uptime 20 / Growth 25 /
Profit 20. Grade bands: S ≥ 92, A ≥ 82, B ≥ 70, C ≥ 58, D ≥ 45, F below. **Publishing the weights
before the level (on the Statement of Work) is what makes the scoring a target rather than a verdict.**

### → "Win conditions" (§6.10)
**Gap.** Six win conditions, none with a threshold, so none of them is playable as stated.

**Fix — proposed thresholds.** *The Exit*: sell at ≥ 4× ARR. *The Institution*: 5 consecutive in-game
years at ≥ 99.95% and reputation ≥ 80 with positive cash every quarter. *The Nines*: hold 99.99% for
12 consecutive months at ≥ 500 customers. *The Scale*: reach Tier 6 with ≥ 3 regions. *The Niche*:
≥ 40% share of one hosting type's market. *The Independent*: reach $1M ARR having never taken outside
money. Each is visible as a progress meter from the moment you make it your declared goal, which turns
the win condition into a **chosen objective** rather than an ending you stumble into.

### → "The letter grade and the flavour title" (§6.9)
**Expansion — the title should be *derived*, not selected from a list.** Generate it from the two most
extreme axes: high uptime + low profit = "Immaculate and Broke." Low uptime + high growth = "Selling
Faster Than We Can Serve." High everything + high externality = "Profitable, Reliable, and Somebody
Else's Problem." **A title generated from your own numbers is far more shareable than one drawn from a
list**, and the combinatorics are free.

### → "The metrics HUD" (§6.8) vs "The rule of the HUD"
**Problem.** §6.8 lists roughly thirty-five metrics across seven blocks, and then states "nothing is
on the HUD that the player cannot act on." Most of the thirty-five are lagging indicators nobody can
act on directly (NRR, PUE, DSO, LTV:CAC).

**Fix — three tiers, stated.** **On the HUD (always, max 6):** Cash, MRR, Reputation, the active
incident, hands available, and the current level's declared objective metric. **One click away (the
Ledger Drawer):** everything else. **Surfaced only when actionable:** a metric is *promoted* to the
HUD temporarily when it crosses a threshold where a player action exists (runway under 3 months,
chargeback ratio approaching 1%, error budget under 20%, bus factor hitting 1). **Promotion on
actionability** is the rule that reconciles the list with the principle, and it is a good UI idea in
its own right.

### → "Financing instruments" (§6.11)
**Expansion — give each instrument a stated cost and a stated failure mode:**

| Instrument | Cost | Speed | Failure mode |
|---|---|---|---|
| Bootstrap | 0 | — | growth capped by cash conversion cycle |
| Revolving credit | 8–14% APR on drawn | days | covenant breach if utilisation stays high |
| Equipment finance | 6–11% | 2–4 weeks | you own the term even if the market moves |
| Merchant cash advance | 35–80% effective | hours | daily receipts skim, death spiral |
| Venture | dilution 15–25% | 3–6 months | you can now lose by growing slowly |
| Private equity | control | 4–9 months | margin pressure, deferred maintenance |
| Customer prepay | a 15% discount | instant | deferred-revenue hole (§2.10) |
| Seller financing | a premium on price | negotiated | you still owe if acquired customers churn |
State also the **order in which a sensible operator uses them**, because the game's implicit lesson is
that cheap boring money beats fast expensive money, and the table makes that argument by itself.

### → "Reputation / Trust" (§6.1) — "the only resource you cannot buy"
**Problem — contradicted twice in the same document.** §2.10's Astroturf Temptation explicitly lets you
buy reputation (temporarily), and §3.6's affiliate/review-site pipeline buys visibility that acts as
reputation at the point of conversion.

**Fix — split the stat.** **Visibility** (buyable: ads, affiliates, reviews, PR, sponsorships — it
raises the *volume* at the top of the funnel). **Trust** (not buyable: earned by behaviour over time —
it raises *conversion* and *price tolerance* and gates enterprise/regulated lines). Astroturfing buys
Visibility while secretly *risking* Trust, which is exactly the right shape for that mechanic. The
statement then becomes true: you cannot buy trust, and the doc's own counterexamples become
illustrations rather than contradictions.

### → "Pricing as a mechanic" (§6.5) — the missing price-change mechanic
**Gap.** The doc has grandfathering, intro pricing and the renewal cliff, and nothing about the *act*
of raising prices on existing customers, which is the most consequential commercial action a hosting
company ever takes.

**Fix — a four-parameter price increase.** You set: **size** (%), **notice period**, **who it applies
to** (new only / renewals / everyone), and **exemptions** (a list you can hand-pick). Consequences are
computed: churn spike proportional to size and inversely to notice; a reputation event if the notice
is short or the communication is bad; a support-ticket wave proportional to affected count; and a
**permanent** trust reduction if you do it twice in eighteen months. **One decision, four dials, and
every hosting company's most-feared board meeting, made playable.**

---

## 7. Core gameplay mechanics

### → "Pause with orders" (§7.5) + "Speed controls, with a catch" (§7.5) + "The month as the tick" (§7.5) + "Time granularity changes" (§7.8)
**Problem.** Four time systems with no stated relationship. See the Time Model in Part A §7 for the
proposed reconciliation (sim time / business time / incident time with explicit ratios). Additionally:

**"Speed controls, with a catch" needs a fairness guard.** "At high speed you get less information" is
a good idea that becomes a trap if the player cannot tell what they're missing. Fix: at 2× and 4×, a
**visible degradation indicator** shows what is being suppressed ("small anomalies hidden"), and the
game **auto-drops to 1× on any severity threshold you've configured**. The catch remains; the
unfairness doesn't.

### → "Hands as action slots" (§7.5) + "Executive attention as a tiny pool" (§7.5) + "Attention is a Resource" (P4)
**Problem.** Two attention economies with different units, overlapping scope and no exchange rate.

**Fix — one resource, two denominations.** **Hands** are the operational unit (one concurrent action,
consumed for a duration). **Executive attention** is not a separate pool; it is a special hand — *your*
hand — that is (a) more effective than any other, (b) replenished per month rather than per action, and
(c) the only hand that can perform certain commercial actions (close a whale, override a policy, make a
public statement). At high tiers your hand's *count* stays at one while everyone else's grows — which
is exactly the intended feeling ("the game takes the controls away and gives you a company") without
needing a second resource system.

### → "Drag-a-cable" (§7.2) and the four topologies
**Gap.** Four link graphs (data, power, control, trust) is a superb idea and, as specified, quadruples
the wiring work. There is no statement of how much the player actually wires.

**Fix — three of the four are mostly *painted*, not drawn.**
- **Data** is drawn cable by cable. It is the tactile verb and it stays manual.
- **Power** is *assigned*, not routed: you drop a device into a rack and pick its A-feed and B-feed
  from a two-item menu. The graph is derived; the decision is two clicks.
- **Control** is *painted* — you brush an admin domain across objects.
- **Trust** is *derived* from what you built plus a small number of explicit grants.
This keeps the depth of four graphs and the interaction cost of one, and it means the interesting
failure (your "redundant" pair on one feed) is still a two-click mistake you can make in half a second.

### → "Ports as a finite resource" (§7.2)
**Expansion — give ports a type and a speed, and make mismatches visible.** A 1G port and a 10G port
are not interchangeable; an SFP+ cage and an RJ45 are not interchangeable; a 25G optic in a 10G port
negotiates down silently. **Make the negotiated speed a visible property of the link** (the port LED
colour, per §4.4's switch), so §2.7's Duplex/Speed Mismatch becomes something you can *see* rather than
something you must go looking for. The single most satisfying "I spotted it" moment available in the
network layer.

### → "Adjacency bonuses, not adjacency requirements" (§7.3)
**Gap.** States the principle, gives no numbers, so placement currently has no measurable payoff.

**Fix — concrete adjacency values.** Same rack: −0.3ms, shared power domain (a risk), shared cooling
domain. Same row: −0.1ms, shared cooling. Same room: baseline. Different room: +0.2ms. Different
building: +0.4ms plus a cross-connect. Different metro: +2–8ms. Different region: +60–160ms. **The
numbers are small on purpose** — adjacency should be a tiebreaker and a risk decision, never a
requirement, exactly as the entry says.

### → "Upgrade paths, not upgrade levels" (§7.4) and "Tuning instead of levels" (§7.4)
**Gap — the tension is flagged and not resolved.** Deep tuning sliders will overwhelm casual players;
the mitigation offered ("a sane default and an auto mode") removes the gameplay for the people who
would enjoy it.

**Fix — three tuning tiers exposed progressively.**
1. **Presets** (early): every tunable object has 3 named presets ("Safe / Balanced / Aggressive")
   chosen from a card. That is the whole interaction for the first three tiers.
2. **Sliders** (mid): unlocked per-object by the relevant monitoring layer, because **you may not tune
   what you cannot measure** — a beautiful gate that is also the real rule.
3. **Policy** (late): tuning becomes conditional, expressed in the Policy Book ("aggressive during a
   declared incident, balanced otherwise").
Progressive disclosure driven by instrumentation, which turns a UX problem into a progression system.

### → "Fog of infrastructure" (§7.6)
**Problem.** If uninstrumented objects are simply fogged, a player can be unaware that they are unaware
— which produces frustration rather than a lesson.

**Fix — known unknowns must be visible.** An uninstrumented object is drawn **clearly, with a "?"
badge** — you can see *that* you cannot see it. The fog is over the *state*, never the *existence*.
Add a permanent **Coverage percentage** on the HUD's operations block ("instrumented: 64% of nodes,
41% of links") so the blind spot is a number. Discovering an object you didn't know existed (the
Asset Discovery Scan) is then a genuinely different and much rarer event.

### → "Red herrings" (§7.6)
**Expansion — a stated authoring rule.** Every red herring must be (a) *plausible* (it is a real
anomaly, not noise), (b) *dismissible with a specific tool you could own*, and (c) *cheap to check*
relative to the cost of chasing it. Add one more: (d) **at least one red herring per incident should
be a genuine second problem** — smaller, unrelated, and worth fixing later. That is how real incidents
work, it makes investigation feel rewarded rather than punished, and it is the difference between a
red herring and a lie.

### → "Graceful degradation, pre-configured" (§7.7)
**Expansion — this needs a UI and it doesn't have one.** The ladder is the single best mechanic in §7
and the doc never says how you build it. Proposal: **the Degradation Ladder editor** — a vertical
strip with load thresholds on the left and a drop zone at each rung. You drag features, customer
classes and whole subsystems onto rungs. During an incident, a marker rises up the strip in real time
and you *watch which rung you are on*. It is readable at a glance, it is diegetic (it looks like a
runbook page), and it is the visual home for the QoS classes and the shed order from Part A §7.

### → "The technical debt meter" (§7.7)
**Gap.** Debt accumulates from "every band-aid, skipped upgrade, manual process and undocumented
change" with no rates and no payment mechanic beyond "a purchasable action."

**Fix — four named debt types, each with its own accrual and its own payment:**
- **Config debt** (hand-fixed servers, drift) — accrues per manual intervention; paid by a
  config-management run; interest is incident probability.
- **Knowledge debt** (undocumented systems) — accrues per undocumented change and per departing
  staffer; paid by writing; interest is MTTR.
- **Toil debt** (manual processes) — accrues as your fleet grows; paid by automation; interest is
  hands consumed per month, which is the most painful currency.
- **Structural debt** (architecture you've outgrown) — accrues as scale increases; paid only by a
  migration project; interest is a cap on what you can build next.
**Four meters is better than one** because each has a different, legible remedy, and "toil debt eats
hands" is the version that will actually change player behaviour.

### → "The Inbox: decisions as cards" (§7.5)
**Gap.** No cadence, no cap, no anti-fatigue rule.

**Fix.** At most **3 cards between events**, at most **8 per level**, and every card carries a
**visible deadline** so deferring is a legitimate choice rather than a gamble. Cards that expire
unanswered resolve to the *status-quo* option, never to the worst one. Also: **one card per level
should have no downside at all** — a genuinely good opportunity — or the player will learn to dread
the inbox and stop reading it.

### → "The in-game terminal" (§7.6)
**Expansion — the five commands, chosen.** The doc flags the scope risk and says ship five. Proposed
five, each of which teaches a distinct diagnostic idea and each of which has a GUI equivalent:
`top` (what is consuming this box), `df -h` + `df -i` (the inode joke lands here), `dig +trace` (it is
always DNS, and the trace shows *where*), `ss -s` (connection states — this is how you see a SYN flood
and conntrack exhaustion), and `mtr` (where in the path the loss is). Every one of them is a real
first move, and `df -i` alone justifies the feature.

### → "The Big Red Button" (§7.5)
**Expansion — give it a scope selector.** Null-routing "an IP or service" is too coarse to be
interesting. Scope options, escalating: one IP · one customer · one prefix · one traffic class · one
region · everything. Each has a different collateral cost, and choosing scope under pressure — with an
affected-customer count shown live as you widen it — is a far better ten seconds of gameplay than a
single button.

---

## 8. Visuals and presentation

### → "The colour language" (§8.2) — three warm hues doing four jobs
**Problem.** The table assigns **gold/amber** to *both* "money" and "warning," **orange** to "heat and
power," and **red** to failure. On a screen that is simultaneously showing revenue motes, a degraded
node, a hot rack and a down service, the warm end of the palette is overloaded and ambiguous.

**Fix — separate by hue *and* by form, and state the rule.**
- **Money = gold, and money is always a discrete mote or a coin, never a fill or a tint.** Motion and
  form carry it, not just hue.
- **Warning = amber, and warning is always a fill, a tint or a pip, never a moving particle.**
- **Heat/power = orange, and it only ever appears inside its own overlay** (the substrate is never
  orange-tinted outside the thermal/power lens).
- **Red = failure, and red is reserved** — nothing else may use it, ever.
One sentence: **gold moves, amber fills, orange is a lens, red is final.**

### → "Shape tokens" (§8.2) — violet is double-booked
**Problem.** §8.2 assigns **violet = unidentified** (the emotional heart of the palette, per its own
text), and §7.2 assigns **violet = the trust/auth port and link type.** Those will appear in the same
frame.

**Fix.** Trust/auth links become **white with a keyed texture** (they are control-plane-adjacent, and
white is already "control plane, player intent"). Violet stays exclusively for unclassified entities.

### → "The Diamond/Circle/Triangle law" (§8.2) vs "Mimics" (§2.4)
**Problem.** "No information is ever colour-only" and "mimics are rendered identically to visitors"
cannot both be unconditionally true.

**Fix — state the exemption explicitly.** The law applies to **state**, not to **identity-under-
deception**. A mimic's *unknown-ness* is encoded twice (violet fill + indistinct silhouette), which
satisfies accessibility; its *hostility* is deliberately not encoded at all until classification,
which is the game. Write that down or an accessibility reviewer will (correctly) flag it.

### → "The Readability Budget" (§8.2) vs "The FX catalogue" (§8.12)
**Problem.** The budget allows 5 animated FX types on screen; the catalogue has 20 and several are
continuous states rather than events.

**Fix — split the catalogue into two classes.** **Ambient FX** (continuous, low-contrast, always
allowed, unbudgeted): heat shimmer, fan blur, LED cadence, cable pulse, dust. **Event FX** (loud,
transient, budgeted at 5 concurrent): everything with a snap, a bloom or a slam. When more than five
events fire, the lowest-severity ones **collapse into a single aggregate indicator** with a count,
which is the same rule §8.9 already uses for objects. One rule, applied to effects.

### → "The Four Altitudes" (§8.3)
**Gap.** Four fixed altitudes with no statement of how the transition works or what happens to
selection and camera state.

**Fix — three rules.** (1) **Transitions are animated and continuous**, not cuts, because the
animation is what teaches that the altitudes are the same thing. (2) **Selection persists across
altitudes** — if you had a rack selected at Z2 and zoom to Z3, its parent room is highlighted and the
rack stays in the inspector. (3) **Alarms pull the camera only on sev-1, and only with a stated,
skippable 1-second move** — automatic camera movement is the fastest way to make a player feel they
have lost control.

### → "The Site Preview Window" (§8.8)
**Expansion — the best idea in §8 needs two more states.** Add: (a) **a second pane showing a
competitor's equivalent**, so the comparison is visceral during a price war or a performance push; and
(b) **a "what a customer on the other side of the world sees" toggle**, which is the single clearest
argument for a CDN or a regional PoP ever devised. Also: the window should occasionally show a
*customer's* site rather than yours, so the player feels the second-order relationship — when your
database is slow, it is somebody's bakery that looks broken.

### → "Money as motion" (§8.7)
**Expansion — the drain lines need labels and the balance needs a horizon.** Continuous drain lines to
cost sinks are a lovely image and become noise without attribution. Give each drain a tiny persistent
label (power / payroll / transit / licences) and make its thickness proportional, so **the player can
see their cost structure without opening the ledger.** Add a faint **projected level** line on the
cash column showing where the balance will be at month end at current rates — the runway, rendered as
a water line, which is far more visceral than a number in months.

### → "Blinkenlights as primary telemetry" (§8.4)
**Expansion — give the light language a stated grammar**, because "LEDs flicker with load" is not
enough to diagnose from:
- **Steady green** = up and idle. **Flickering green** = working, rate ∝ load.
- **Steady amber** = degraded but serving. **Slow-blink amber** = predicted failure (SMART, thermal).
- **Fast-blink amber** = rebuild or resync in progress (the vulnerability window).
- **Steady red** = failed. **Dark** = unpowered.
- **Synchronised blink across a group** = a fleet-wide operation in progress.
- **One light out of phase with its neighbours** = the odd one out, and the whole mechanic.
That last rule is the payoff: §8.9's Heartbeat Sync makes desynchronisation itself an alarm channel,
and this grammar is what lets the player *read* it.

### → "Racks, front and back" (§8.4)
**Expansion.** Rotating a rack is called "one of the most satisfying possible verbs" and then does
nothing mechanical. Make the back view **where three specific things can only be done**: verifying
dual-cord paths, tracing a cable, and reading the negotiated link speed. Then the verb has a reason,
and the player learns the real lesson that **the front of the rack is marketing and the back of the
rack is the truth.**

### → "The Business-Line Skin System / Five-Asset Skin Kit" (§0.2, §8.10)
**Problem — the kit says five assets and the catalogue describes far more per line.** §8.10's
per-line catalogue specifies palette, silhouettes, visitor forms, meters, FX, materials, lighting,
density, visitor rhythm and sound for each of thirty lines. That is not five assets; it is ten-plus,
and thirty lines × ten is a real budget.

**Fix — reclassify.** The **five bespoke assets** are: palette, hero silhouette, visitor costume,
signature meter widget, signature catastrophe FX. Everything else in the catalogue is a **parameter
of shared systems** and should be written as such: *density* is a spawn-count multiplier; *material
and lighting* is a lookup of existing shader presets; *visitor rhythm* is a curve on the baseline
generator; *sound palette* is a sample-set swap on the existing ambient bus. Rewriting §8.10's
catalogue as "five assets plus eight parameter values" makes the whole variety engine credible
instead of aspirational — and it is the same content, just honestly accounted.

### → "Audio" (§8.11) — one channel, two jobs
**Problem.** The hum encodes load (ambient telemetry) *and* audio is required to be redundant with
every critical visual alert (accessibility). If both live in the same mix, the alerts fight the
telemetry.

**Fix — three separate buses with separate sliders.** **Ambience** (hum, fans, room tone — carries
load and health continuously). **Signals** (pager tones, breaker snaps, cash ticks — discrete,
prioritised, duckable, and the accessibility-critical channel). **Score** (music, optional, ducks under
signals). State that **Signals always duck Ambience**, so an alert is never masked by a busy room, and
give each bus its own volume control. A two-line rule that makes the whole audio design shippable.

### → "Alert escalation visuals" (§8.7)
**Expansion — add the *de-escalation* animation**, which no game ever does and which this game needs.
An alert clearing should have as much presence as an alert firing: the outline retracts, the tint
drains, the ticker line greys and slides down, and the object's light returns to its idle cadence with
a soft tick. **§8.7's "The quiet moment" is the right instinct; make the de-escalation of individual
alerts share its language**, so recovery feels earned at every scale and not just at the end.

### → "Readability at scale" (§8.9) — the missing number
**Gap.** Excellent rules, no target. "Readable at scale" is unfalsifiable without a figure.

**Fix — state the targets.** The game must remain legible at **2,000 discrete objects and 20,000
in-flight entities at Z3**, on a 1080p display, at 2× speed, by a player who has not looked at that
part of the board for 60 seconds. Aggregation kicks in at 40 entities per glyph. Label budget: 30
visible labels maximum at Z3. **Numbers make the rules testable**, and testable art direction is the
only kind that survives production.

---

## 9. Anything else

### → "Modes" (§9.1) — too many, and no priority
**Problem.** Twenty-six modes are listed, several of which are full games (Competitive Market, Co-op
NOC, Versus, Async Attack, Franchise). Shipping a quarter of them well beats shipping all of them.

**Fix — a stated tiering.**
- **Ship-with-v1 (four):** Campaign, Endless ("The NOC"), Incident Mode, Sandbox. These four cover
  every audience and reuse one simulation.
- **Cheap additions once the above exist (four):** Daily Outage (a seed + a leaderboard), Puzzle Mode
  (authored data), Speedrun (a timer + goals), Minimalist Mode (a render swap).
- **Post-launch, in priority order:** Line Draft, Through the Eras, The Same Outage Six Ways, Co-op
  NOC, Historical Scenarios.
- **Probably never:** Competitive Market, Franchise, Async Attack. Name them as stretch so they stop
  competing for design attention.

### → "Co-op NOC" (§9.1)
**Expansion — the asymmetric-information idea needs one more rule to work.** Give each player a
**private view and a shared artifact**: they see different dashboards (as specified) *and* they write
into one shared incident timeline that everyone can see. All coordination flows through that timeline.
It gives the mode a diegetic voice channel, it produces a postmortem automatically, and it makes the
shift-handoff mechanic work without anybody having to be on voice chat.

### → "Attacker Mode / Reverse TD interlude" (§9.1) and "Red Team Friday" (§1.2)
**Expansion — make the reward *specific*.** "You learn each threat's pathing rules from the inside" is
vague. Concretely: any threat you have personally *used* is permanently marked in your Codex with its
**decision function** — what it targets, what makes it give up, what it does when blocked. That is a
real, legible, permanent advantage, and it makes the interlude something a player will choose rather
than tolerate.

### → "Your Past Self Is The Boss" (§9.2)
**Expansion — make it literal and automatic.** The level should be **generated from the player's own
save**: the actual topology they built in a specific earlier level, aged by three years (patch lag
accrued, documentation decayed, staff turned over, one component EOL, two undocumented dependencies
added by "someone"). No authoring required, maximum personal sting, and it is the strongest possible
argument for the Long Save (Part A §9).

### → "Difficulty via Honesty (Sysadmin Mode)" (§9.2)
**Expansion — enumerate exactly what it removes**, or it is just a vibe: alert aggregation, dependency
suppression, root-cause hints, the bottleneck highlight, symptom-to-cause arrows, the auto-generated
postmortem, the Rubber Duck, and the Mentor. What remains: raw logs, raw graphs, and the terminal.
Add one thing it *gives* you: a **permanent score multiplier** and a distinct end-of-level stamp,
because a mode this punishing needs a visible badge.

### → "The educational angle" (§9.5) vs "Teach through loss, never through text" (§5.1, §9.6)
**Problem — a soft contradiction.** The game is committed to almost no tutorial text, and also ships
Field Notes (an encyclopedia), loading-screen tips (real advice), and a "was that real?" tag.

**Fix — state the distinction.** **Teaching is always by event; explaining is always on demand.** The
game never volunteers text. Field Notes are only ever reached by the player clicking something they
were already curious about (the "Explain This Number" affordance in Part A §8 is the ideal delivery
mechanism). Loading-screen tips are flavour, not instruction. The "was that real?" tag lives only in
the Codex. One sentence resolves it and makes both systems better.

### → "Humour and tone" (§9.3) — the missing rule about failure
**Expansion.** "Recognition comedy, not parody" and "never punch down at users" are both right and
both incomplete. Add a third rule: **the game is never funny at the moment of loss.** Comedy lives in
the setup, the flavour text, the ticket generator, the vendor personalities and the postmortem — never
in the failure animation, never in the loss screen, never in an alert. A game that jokes while you are
losing money feels contemptuous. This one rule protects the tone more than the other two combined.

### → "Design guardrails" (§9.6)
**Expansion — four more guardrails the document's own content implies and never states:**
- **Every number on screen must be explainable.** If a player cannot find out where a figure came
  from, it should not be displayed. (Enforced by Part A §8's "Explain This Number.")
- **No mechanic may be invisible in both directions.** If the player cannot see a system working *and*
  cannot see it failing, it is not a mechanic, it is a random number.
- **Every irreversible action is marked before it is taken, not after.** (The one-way-door symbol in
  §7.7, promoted to a law.)
- **The player must always be able to answer "what is the worst thing that could happen right now."**
  If the board cannot answer that in one glance, add the overlay that can.

### → "Long-tail and stretch ideas" (§9.7) — "Import Your Own Topology"
**Expansion — make it concrete enough to be real.** The feature is one of the most valuable in the
document and is a sentence. Proposal: accept a simple declarative file (nodes, links, roles,
capacities) *or* a guided wizard of 10 questions; generate a playable level with the player's own
node names on the faceplates; then run the **"Would You Have Survived" simulator** (Part B §6) against
it and hand back a findings report. **An ops team will do this to their real production estate on the
first day**, and the report they get back is the marketing.

### → "The Company Museum" (§9.4) and the other six meta systems
**Problem.** The Playbook, the Alumni Network, the Annual Report, Industry Benchmarks, the Company
Museum, the Company Wall, the Ops Almanac (mine), Prestige/The Exit and the Company Ledger are nine
separate meta-progression systems.

**Fix — one persistent Company object with four faces.** **The Wall** (what you achieved: certs,
badges, press, streaks). **The Scrapbook** (what it cost: postmortem polaroids, the Wall of Ghosts,
the scar ledger). **The Almanac** (the numbers: records, benchmarks, annual reports). **The People**
(alumni, current staff, the recurring cast, who left and why). Everything currently proposed slots
into exactly one of those four, and the Museum is simply the room you walk through to see all four.
**One object, four faces, nine ideas preserved, one screen.**
