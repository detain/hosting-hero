# Wave 2 — Sysadmin lens (informed pass)

**Lens:** veteran sysadmin / hosting engineer. Shared web, VPS, colo, game servers, storage, GPU,
email/DNS, CDN, edge. Everything below is grounded in how infrastructure actually works and actually
fails, then translated into a mechanic.

**Read state:** this report was written after reading `hosting_game.md` end to end (§0 through §9.7).
Part A contains only material I could not find in the merged document. Part B references existing
entries by their exact heading so the merge agent can attach the change to the right place.

**A note on what I went hunting for.** The merged doc is strong on the famous failures — DDoS, cert
expiry, RAID rebuilds, power chains, BGP hijack, backups that don't restore. What it is missing is
the *boring middle* of the job: measurement resolution, lead times, warranty and RMA logistics,
change correlation, decommissioning, inventory, the electricity bill's demand charge, protocol-level
resource attacks, and the whole class of failures where **nothing changed and you simply grew into a
bug that was always there**. That's where most of Part A lives.

---

# PART A — NEW IDEAS

---

## 1. Levels, scenarios, and progression

### 1A.1 New hosting business types (each a full Ruleset Card per §0.2)

#### "The Fabric" — Internet Exchange (IX) operator
You are not a host. You are a switch fabric that other networks plug into, and your product is
**who else is already plugged in**.

**How it works:** You sell ports (1G/10G/100G) and the value of a port is a pure function of member
count — a true network-effect economy where the first 20 members are nearly worthless and member 200
makes every port repriceable. Your "visitors" are **peering sessions**, which must be negotiated
between *members* (you don't control whether two of your members peer). Your scarce resource is
**fabric stability** and your signature catastrophe is a **member leaking a full routing table onto
the peering LAN** or a **broadcast/proxy-ARP storm across the exchange** — one member's misconfigured
router degrades every other member simultaneously, and you cannot touch their gear. You run a route
server as a convenience and it becomes a single point of failure you didn't want.
**Verb:** recruit, police the port, arbitrate between people who dislike each other.
**Signature meter:** **Member Count × Peering Density** as a literal wiring diagram that fills in.
**Visual:** a single enormous switch room, the quietest level in the game, where everything that
matters is happening in other people's buildings.
**Interacts with:** §4.4 (IX/Peering Port becomes a thing you *sell*), §6.6 (cross-connect economics),
§1.2 (`The Upstream` perspective level).

#### "Redemption Grace" — Domain registrar / registry operator
The `The Registrar` / `NXDOMAIN` perspective level in §1.2 treats a registrar as a DNS host. A real
registrar is a completely different business and deserves its own card.

**How it works:** Your unit of sale is a **registration-year**. Your scarce resource is **registry
compliance standing** — you hold an accreditation that can be revoked, you must maintain **data
escrow** (a nightly deposit of your entire customer database to a third party, and failing to deposit
is a compliance event), and you must handle **transfers**, which are the attack surface: auth-code
theft, transfer-out hijacking, and a 60-day post-transfer lock. Domains move through a lifecycle
**active → expired → 30-day auto-renew grace → 30-day redemption (restore fee) → 5-day pending
delete → drop**, and that lifecycle IS the level's clock. Signature threats: a UDRP dispute, a court
order to transfer a domain, a registry price increase you must pass through, and the customer who
lets a domain expire and then screams at you during redemption.
**Signature meter:** the **Expiry Wheel** — a circular calendar showing every domain you manage
rotating toward its renewal date.
**Comedy beat:** a customer's domain is worth $4,000,000 and their contact email is a Hotmail account
that no longer exists.

#### "Trust Store" — Certificate Authority / managed PKI
The hosting business whose existence is granted by four browser vendors and can be revoked by them.

**How it works:** You issue certificates. Your scarce resource is **root program standing**. Your
failure modes are *procedural*, not technical: a mis-issuance (a cert for a domain the requester
didn't control), a CAA record you failed to check, a validation method that gets deprecated
retroactively, an audit finding. The signature catastrophe is **distrust** — a browser announces that
certificates issued by you after date X will not be trusted, and your entire product stops working
for everyone at once, on a schedule, publicly. Also the **mass revocation event**: a compliance bug
means you must revoke and reissue tens of thousands of certs within a **5-day window mandated by the
root program**, whether or not your customers can deploy that fast.
**Verb:** validate, log, prove.
**Signature meter:** **Root Program Standing**, a row of four browser-vendor pips that are green,
amber, or gone. You cannot influence them directly; you can only be boring for years.
**Why it earns a slot:** it is the purest possible expression of "your business runs at the pleasure
of someone bigger than you," which §6.1's *Trust-with-upstreams* currency wants a level for.

#### "Cardinality" — Observability / telemetry hosting
You host other people's metrics, logs and traces. Their carelessness is your capacity plan.

**How it works:** Your scarce resource is **series cardinality** — the number of unique metric streams,
not the volume of data. A customer adds one label containing a UUID or a user ID and their metric
count goes from 4,000 to 40,000,000 in one deploy, at 3am, without warning, and your time-series
database falls over. This is the modern "one tenant's missing index" and it is **instantaneous,
customer-triggered, and invisible until it lands**. Second failure mode: **the log line that is
itself a log line** — a customer ships your own error logs back to you in a loop. Third: retention
math, where "keep everything for 13 months" is a promise you make at signup and a bill you pay
forever.
**Buildables:** a **Cardinality Limiter** (drops a customer's excess series — which means silently
losing the data they are paying you to keep, a perfect Friction tower), per-tenant ingest quotas,
downsampling/rollup rules, and a cost-attribution dashboard you give the customer so they police
themselves.
**Signature meter:** the **Cardinality Gauge**, drawn as a fan of threads that visibly splays.
**Catastrophe:** the ingest queue backs up and you start dropping *everyone's* telemetry — meaning
every one of your customers is now blind during an incident, and some of those incidents are yours.
**Interacts with:** §7.6 (fog of instrumentation — you are the fog vendor), §2.10 (bill shock).

#### "Untrusted Code, By Design" — CI / build-farm hosting
You sell the execution of arbitrary code written by strangers. That is not a bug in the product; it
is the product.

**How it works:** Every "visitor" is a build job containing code you have never seen. Your entire
defensive posture is **isolation and time limits**, because you cannot filter the workload. Signature
threats: **free-tier cryptomining** (the dominant real abuse in this business), a build that forks
until the host dies, a job that exfiltrates another job's cache, **cache poisoning between builds**
(a shared dependency cache is a shared attack surface), and a customer whose secrets leak into a
public build log. Scarce resource: **clean ephemeral capacity** — a runner must be destroyed and
rebuilt between jobs, and the rebuild time is pure overhead you can't bill for.
**Verb:** isolate, expire, reclaim.
**Signature meter:** **Runner Hygiene** — the percentage of your fleet that is genuinely fresh vs
"reused because we were busy."
**Great tension:** the fastest way to serve customers (warm, reused runners with populated caches) is
exactly the least safe way.

#### "The Green Screen Annuity" — legacy / mainframe / AS400 hosting
The most profitable and most terrifying line in the catalogue: hosting systems nobody makes anymore
for customers who cannot leave.

**How it works:** Your scarce resource is **people who still know this**, and it is not purchasable —
you can only train, retain, and dread. Contracts are enormous, churn is zero, margins are wonderful,
and every year the operating risk rises because the hardware is out of support, the vendor's last
engineer retired, and the documentation is a binder. Signature threats: a hardware failure with no
replacement part in existence (you buy from a broker on the grey market), an OS patch that hasn't
been issued since 2011, a compliance auditor who asks how you patch it, and **your own bus factor
dropping to 1 and then 0**.
**Signature mechanic:** each legacy system has a named **Keeper** — a staff member. The Keeper's
retirement date is visible from the start of the level. The whole level is about what you do with
that date.
**Win condition options:** migrate the customer off (expensive, slow, they resist), train a successor
(slow, they may leave), or **price the risk** — raise the contract to fund a standby expert.
**Interacts with:** §2.9 (Key Person Risk), §9.2 (The Legacy Box) — this is that idea promoted from a
twist to a business.

#### "Declaration Day" — Disaster-Recovery-as-a-Service (the oversubscription level)
§1.3's "Restore Point"/"The Vault" covers backup. DRaaS is a different and more dangerous business,
and the difference is *one number*.

**How it works:** You sell standby capacity to 200 customers and you own enough for 20, because DR
events are assumed to be uncorrelated. **They are not uncorrelated.** A regional power event, a
hurricane, a cloud-region outage, or a single widely-used ransomware strain causes **simultaneous
declarations**, and your oversubscription ratio becomes a triage problem with contracts attached.
The core mechanic is the **Declaration Queue**: customers declare a DR event, each declaration
consumes standby capacity for the duration, and your contracts specify priority tiers you sold years
ago and forgot about. Failing to honour a declaration is not an outage — it is a **breach of the one
promise the entire product consists of.**
**Second mechanic:** **failback**. Customers run in your DR environment, love it, and never leave —
so your standby capacity is now permanently occupied by someone who is supposed to be gone, and the
next declaration has nowhere to go. "DR debt."
**Signature meter:** **Committed vs Available standby**, drawn as a stack of promises taller than the
building holding them up.
**Signature scenario:** a hurricane crosses the map (§1.5) and you watch declarations arrive one by
one, knowing what the total is going to be.
**Why this is the best untouched idea in the set:** it makes an *actuarial* assumption into a
playable, visible, foreseeable catastrophe.

#### "Line of Sight" — Rural wireless ISP (WISP)
Your cables are air.

**How it works:** Links are **point-to-point radio paths** placed on a terrain map. A link exists if
there is line of sight, and line of sight can be lost by things that are not your fault: a tree that
grew, a new building, a crane on a construction site, someone else's antenna on the same tower in the
same band. Scarce resource: **spectrum** — unlicensed bands are shared with everyone else, so your
capacity degrades as your neighbours deploy. Threats: **rain fade** (frequency-dependent — 5GHz
shrugs, 24/60GHz drowns), ice loading on a dish, wind twisting an alignment out of true, a lightning
strike travelling down the tower ground, a tower landlord raising rent, and **a subscriber's CPE
pointed at the wrong tower**.
**Verb:** survey, align, re-aim.
**Signature meter:** **Fresnel clearance** per link, drawn as an elliptical zone between two points
that visibly clips into a treeline as the season advances.
**Signature mechanic:** the seasonal cycle is a *real threat schedule* — leaf-on in spring degrades
links that were fine all winter, and the game shows the trees growing.
**Economics:** your customers are households nobody else will serve, they are extremely loyal, ARPU
is low, and a single tower's backhaul serves 300 of them.

#### "The Radiologist Is Waiting" — medical imaging (PACS/DICOM) hosting
Regulated storage where the unit is enormous and the consumer is a human being under time pressure.

**How it works:** A "visitor" is a **study retrieval** — a 2GB CT series that a radiologist needs
*now*, and their patience is measured in the 8 seconds before they call the hospital's IT director.
The product is simultaneously archival (7–30 year retention, legally mandated) and interactive
(prefetch the study before the radiologist opens it). The interesting mechanic is **prefetch
prediction**: you can warm studies from cold storage based on the appointment schedule, and a good
prediction makes you look magical while a bad one costs you retrieval fees for nothing.
**Threats:** a modality (the scanner itself) that sends malformed DICOM, a hospital VPN that flaps, a
retention deletion you are legally forbidden from performing, and an outage that has an actual
clinical consequence — the only level in the game where the failure text should be genuinely sober.
**Tone note:** play this one straight. No jokes in the failure states.

#### "Authorization" — payment switch / POS hosting
Sub-second, PCI-scoped, and the failure is that nobody in 4,000 stores can buy anything.

**How it works:** Visitors are **authorization requests** with a hard **2-second terminal timeout** —
binary, no partial credit, and a timeout means a queue of humans at a till. Scarce resource: **p99.9
latency**, not p99, because 0.1% of a million transactions is thousands of angry stores. Signature
threats: a certificate on a *client* connection expiring (thousands of terminals, staggered, none of
which you control), a card-scheme mandate with a deadline, a BIN range routing change, and the
**Saturday-afternoon peak that is also your maintenance window**.
**Signature mechanic:** a **freeze calendar imposed by your customers** — retail freezes changes from
November to January, which means every improvement you want to make must ship by October or wait.
**Interacts with:** §7.5 (change freeze), §1.3 (regulated hosting).

#### "Dead Air" — linear broadcast playout hosting
Video hosting in §1.3 is VOD + live streaming. **Playout** is a third thing: a 24/7 channel with a
schedule, and the failure state is silence.

**How it works:** There is no "degraded." There is on-air and there is **dead air**, which is
regulator-visible, contractually penalized, and instantly noticed by every viewer. Your board is a
**playlist on a timeline** and your job is that the next item is always ready: assets ingested,
transcoded to the right profile, QC'd, with ad breaks inserted at frame-accurate positions. Threats:
an asset that arrives late from the content owner, a file that passes QC and has 4 seconds of black
at the head, a frame-rate mismatch, an SCTE-35 ad marker in the wrong place, and **the emergency
alert system test that must pass through untouched**.
**Signature meter:** **Time To Dead Air** — a countdown showing how long the current playout buffer
can survive if everything upstream stopped right now. It is the single most stressful number I can
imagine putting on a HUD.
**Buildable:** the **Backup Playout Chain**, a second identical path running in lockstep with a
manual takeover switch, plus an **Emergency Filler Loop** (30 minutes of evergreen content) that is
the difference between embarrassment and a regulatory finding.

#### "The Roof Antenna" — time / GNSS timing as a service
Stratum-1 NTP and PTP for finance, broadcast, and mobile networks.

**How it works:** Your product is **truth about what time it is**, sourced from a GPS antenna with
sky view. Threats: an antenna cable water ingress, a building next door that blocks the sky, **GPS
jamming** (increasingly real near ports and airports), **GPS spoofing** (your clocks all agree and
they are all wrong — the most quietly horrifying failure available), a leap-second event, and a
firmware bug in a GNSS receiver that rolls over its week counter.
**Signature mechanic:** **holdover** — when GNSS is lost, your local oscillator drifts at a rate
determined by what you paid for it. A cheap TCXO drifts out of spec in hours; a rubidium oscillator
holds for weeks. **A purchasable "how long can you survive being cut off from reality" stat.**
**Why it's a great level:** the only hosting business where the customers' systems all break at once
and none of them will initially suspect the clock.

#### "Zero Knowledge" — password manager / secrets hosting
The business where you are *contractually unable* to help.

**How it works:** You hold the data and cannot read it. When a customer loses their key, the correct
and only answer is "it's gone," and your support team says that sentence ten times a day. Every
support-improving feature you could build (recovery codes, admin reset, key escrow) is a reduction in
the product's core promise and a new breach surface. **A whole level where the tension is between
support quality and the thing you sell.**
**Signature threat:** not a breach of data — a breach of *trust*: a researcher publishes that your
client-side crypto has a weakness, and your product's only asset is the belief that it doesn't.

### 1A.2 New scenarios

#### `The Scream Test`
A decommissioning level. You have 40 machines and a mandate to remove 15. Nobody knows what most of
them do.

**How it works:** Your tools are: read the docs (stale), check netflow (if you bought it), check the
switch's MAC table for activity, ask around (costs hands and returns opinions), or — the real
technique — **unplug it and see who screams**. The Scream Test is a literal action: power the machine
off, wait a configurable number of in-game days with a visible timer, and if nothing screams, unrack
it. The cruelty is the tail: some things only run monthly, quarterly, or at fiscal year end. A
machine you passed on a 7-day scream test takes out payroll 25 days later.
**Win condition:** decommission the target count without a customer-visible incident.
**Why it's great:** it is the only level in the genre where the verb is *removing* things, it is
exactly how this is actually done, and it teaches dependency discovery better than any tutorial.
**Interacts with:** §2.9 (The Undocumented Dependency), §5.4 (Asset Discovery Scan), §9.2 (The Legacy
Box).

#### `The Reconciliation`
An inventory level. Your asset database says 214 servers. The floor has 209. Find the difference.

**How it works:** Walk the aisles at Z1, read asset tags, scan barcodes, compare to the CMDB. Some
machines are physically present and not in the database (nobody billed for them — you have been
giving away capacity). Some are in the database and not present (you have been paying colo, power,
support contracts and licences on ghosts). One is present, in the database, and belongs to a customer
who cancelled fourteen months ago. Ends with a financial adjustment in both directions and a
permanent unlock: **automatic asset reconciliation**, which quietly saves money every month for the
rest of the campaign.
**Comedy payload:** the machine nobody can find is behind a cable tray, mounted sideways, with a
label in another company's font.

#### `The Circuit Order`
A patience level built on the most underrated real constraint in hosting: **telecom lead time.**

**How it works:** You need a second transit circuit. Ordering it starts a **60–120 day clock**
composed of visible stages — quote, contract, LOA/CFA paperwork, carrier survey, construction if
needed, cross-connect scheduling, turn-up testing, BGP session establishment — each of which can slip
and one of which (construction) can slip by months. Meanwhile the level runs normally and your
single-homed network is exposed the entire time. You can pay for expedite (rarely works), order from
two carriers in parallel (double cost, and you may end up with both), or accept the exposure.
**The lesson:** in hosting, the correct time to order the thing is **before you need it**, and this
is the level that installs that reflex.
**Interacts with:** §4.1 (Build time and cold start — this extends it from seconds to months),
§6 (lead time as a currency, §6A below).

#### `Mass Revocation`
Distinct from `The Certificate Expired`: your CA has a compliance incident and must revoke every
certificate it issued in a date range. You have **5 days** to reissue and deploy.

**How it works:** The first two days are spent discovering **how many certificates you actually
have** — not just the obvious web ones, but internal mTLS, client certs on a device fleet, a cert in
a Java keystore, one inside a load balancer config from 2019, and three on machines that are not in
your inventory (see `The Reconciliation`). Players with certificate inventory tooling breeze through;
players without it spend the level doing archaeology.
**Failure texture:** you miss one. It is on the payment callback path. You find out on day 6.

#### `The Threshold Day` (the "nothing changed" level)
No attack, no hardware failure, no deploy. Something breaks because you **grew into a limit that has
always been there.**

**How it works:** Candidate triggers, one randomly selected and telegraphed only by a slowly rising
graph: a router's TCAM fills as the global routing table crosses a round number and it drops to
software forwarding; a 32-bit counter wraps; a hash table degrades past N entries; an IP pool
exhausts; a filesystem crosses 90% and its allocator starts behaving differently; a session table
hits a compiled-in maximum; a licence count is reached; a database's auto-increment column hits its
type's ceiling. **The diagnostic is not "what changed" but "what grew."**
**Why it deserves a level:** it is a huge fraction of real incidents and the merged doc's threat model
is almost entirely "something happened to you" or "you did something."
**Unlock on completion:** the **Growth Ceiling overlay** — every component displays its nearest hard
limit and the projected date you reach it.

#### `EPO`
Someone presses the Emergency Power Off button. The entire room, including the UPS bypass, goes
instantly and completely dark.

**How it works:** No ride-through, no generator, no graceful shutdown — EPO is designed to remove all
energy from the room for firefighter safety, and it does. The level is a **cold start from absolute
zero** with the added cruelty that everything went down *hard* mid-write: filesystems need checking,
databases need crash recovery, a RAID array comes back degraded, and two machines don't POST. The
comedy is the cause, revealed at the end: a contractor mistook it for a door release, or a cleaner
leaned on it, or it was unlabelled and unguarded.
**Retroactive purchase:** an **$8 plastic EPO guard cover**, which the game should offer you
afterwards at full price, deadpan.
**Interacts with:** §1.5 (`Power Event`/`Black Start`) as its crueller sibling — Black Start assumes
an orderly shutdown; EPO assumes none.

#### `Retransfer`
The generator started. The utility came back. **The transfer switch will not transfer back.**

**How it works:** You are now running the entire facility on a diesel generator indefinitely, which
is fine for hours and a crisis over days: fuel burn, service intervals, noise ordinances, a
neighbourhood complaint, and the knowledge that the generator has never run this long. Meanwhile the
ATS needs a controlled outage to repair, which means you must *deliberately drop the facility* to fix
the thing that is currently keeping it up.
**The decision:** schedule a planned outage now while you have fuel and daylight, or keep running and
hope the parts arrive. **A genuinely excellent "the fix requires the failure" dilemma.**

#### `Wet Stacking`
The maintenance level for `Generator Fails to Start`'s cousin.

**How it works:** Your monthly generator test runs 20 minutes at 5% load, which is worse than not
testing: a diesel run at low load doesn't reach operating temperature, unburned fuel accumulates in
the exhaust, and the engine slowly fouls. The level surfaces this as a hidden **Engine Health** stat
that your testing regime has been *degrading* for two years. Fixes: a load bank (§4.7, already in the
doc) or scheduling tests to coincide with real load. **The unique lesson: a maintenance practice can
itself be the damage.**

#### `The Warranty Cliff`
A fleet of 40 machines all bought in the same quarter come out of 3-year warranty on the same day.

**How it works:** Renew (expensive, and vendors price year-4 support punitively), self-insure by
stocking spares (capital, and you must guess which parts), or run bare and gamble. The twist nobody
expects: **without an active support contract you cannot download firmware**, so a security patch for
a known RAID-controller vulnerability is behind a paywall you declined. A whole level about the
difference between owning hardware and being allowed to maintain it.

#### `Break Glass`
Your identity provider / SSO / password vault is down and **it is the thing that authenticates you to
everything else.**

**How it works:** You cannot log in to fix the thing you need to log in to fix. The only path is the
break-glass credential — a sealed, offline, audited emergency account. Using it is one click and
triggers a mandatory review, a compliance event, and a forced rotation of everything afterward. The
level tests whether you ever created one, whether you know where it is, whether it still works
(nobody tested it), and whether it can even reach the network in the current failure mode.
**Failure texture:** you have a break-glass account and its password is stored in the vault that is
down.

#### `The Bisect`
A pure diagnosis level with one specific method.

**How it works:** Something is wrong intermittently and affects roughly half of requests. You have a
**bisect verb**: take half the backends out of rotation, observe, and repeat. Each bisection costs
capacity and time and narrows the space. Variants: bisect by backend, by version, by path, by client
ASN, by DNS resolver, by time window. The level is short, tight, and teaches the single most
transferable debugging technique in the profession.
**Unlock:** the bisect action becomes available in all later levels as a general-purpose tool.

#### `The Whitelisted Office`
The problem is real, it has been happening for three weeks, and **you cannot reproduce it** because
your office IP has been on the allow-list since 2019 and bypasses the thing that's broken.

**How it works:** All your testing succeeds. Every customer report says otherwise. The level's
solution is to **test from somewhere you are not privileged** — a purchasable external probe fleet, a
mobile connection, a rented VM in another ASN. Teaches that your own convenience is a blind spot, and
introduces the **External Vantage** buildable (§4A).

#### `Read-Only Friday`
A constraint scenario: for one level, all *write* actions are disabled — no deploys, no config pushes,
no schema changes, no rule edits.

**How it works:** Whatever breaks must be handled with traffic steering, feature flags set in advance,
capacity you already own, and communication. Rewards everything you pre-configured (§7.7's graceful
degradation ladder) and punishes players who fly by hand.
**Variant:** you *may* break the freeze, once, and the game records that you did.

#### `The RFO`
Post-incident, your largest enterprise customer contractually requires a written **Reason For Outage**
within 5 business days, signed, with a timeline, root cause, and remediation commitments.

**How it works:** A document-assembly minigame where you drag evidence from your actual level
telemetry — graph excerpts, log lines, the change record, the timeline — into a report. What you can
include is limited by what you instrumented and retained. Vague reports lose trust; specific reports
*gain* trust even after a bad outage; **and any remediation you commit to in the document becomes a
binding obligation on the Obligation Rail** with a deadline the customer will check.
**The best part:** it converts §5.1's postmortem-as-progression into something the *business* forces
you to do, and it makes log retention (§4.3) pay off visibly.

#### `Peering Ratio`
A large network tells you your traffic ratio is out of policy — you send far more than you receive —
and unless it changes in 90 days, settlement-free peering becomes paid transit.

**How it works:** A content-heavy host is structurally outbound-dominant and cannot fix this by
trying harder. Options: pay, find inbound-heavy traffic to balance (acquire a backup/upload-heavy
line of business — a genuine cross-line synergy), move traffic to an IX, or accept the cost.
**Why it's good:** an economic threat with no technical fix and a *portfolio* answer.

#### `The Lame Delegation`
Your customer's domain resolves for some people and not others, intermittently, for two weeks.

**How it works:** The registrar's NS records list four nameservers; one of them was decommissioned
last year and the glue still points at an IP that now belongs to someone else. Resolvers pick
randomly. 25% of queries fail, which is below every alerting threshold you have. The level teaches
that **partial DNS failure is invisible to binary monitoring** and introduces per-nameserver
synthetic checks.

#### `Sanctions Screening`
A compliance level with no technical content and real stakes.

**How it works:** A jurisdiction is added to a sanctions regime overnight. You must identify which of
your 4,000 customers are affected — by billing address, by IP geolocation, by corporate ownership
chain, by the payment method they used — and cut them off within a deadline, while not cutting off
anyone you shouldn't. The data you need is data you may never have collected.
**Interacts with:** §9.2 (Regulatory Weather), §3.9 (client cards), §4.9 (Legal Retainer).

#### `The Lawful Intercept Request`
An edgier compliance scenario: you receive a legally binding request to provide ongoing access to a
customer's traffic, with a gag order.

**How it works:** You must build the capability (it is a buildable with an ongoing cost and its own
attack surface — an intercept system is a backdoor by design and has been abused), operate it
secretly, and live with knowing. Costs staff morale if discovered internally; can leak. Purely a
choice level with no "correct" outcome, and an option to refuse at legal cost.
**Tone:** handle carefully, but it is a real part of running infrastructure and the doc's bulletproof
line already establishes the game is willing to have a grey path.

#### `The Vendor Bridge`
A pure frustration-as-gameplay level: the problem is in a vendor's product and you must get to
someone who can fix it.

**How it works:** An escalation ladder minigame — L1 support wants you to reboot, L2 wants logs in a
specific format, the account manager wants to schedule a call, and the actual engineer exists behind
three gates. Your **Vendor Relationship** stat (§5.4) determines how many gates you skip, and a
**premium support contract** buys a direct number. Meanwhile your customers are down and the ticket
you opened has an auto-responder.
**Payoff:** the fix is a one-line config change the vendor has known about for eight months.

### 1A.3 Progression structures

#### Lead Time as a first-class progression axis
Add a persistent **Lead Time Board**: a pipeline showing everything you have ordered and when it
arrives. Hardware (2–12 weeks), circuits (60–120 days), cross-connects (5–20 business days), an audit
slot (a quarter), a new hire (6–12 weeks to start, 3 months to useful), a licence (instant), a
building permit (a year).
**Why:** the merged doc's §4.1 Build time is measured in seconds-to-minutes. Real hosting is a
business where **the most important skill is ordering things before you know you need them**, and
that is currently unmodelled. Making lead time visible and long converts panic-buying into planning.

#### The Rebuildability stat
A per-machine number: **hours to rebuild this from bare metal, from scratch, without the original
person.** Snowflakes score 40; config-managed nodes score 0.5; the Legacy Box scores "unknown."
**How it works:** It is the single cleanest measure of technical debt, it is directly improved by
config management / golden images / documentation, and it is the number that decides whether the
correct response to a compromise is "clean it" or "burn it." §1.5's `Post-Breach` becomes far more
interesting when the rebuild cost is a known per-machine figure rather than a generic penalty.

#### Redundancy grammar as a progression ladder
Teach the actual vocabulary as tiers you climb: **N → N+1 → N+2 → 2N → 2N+1 → concurrently
maintainable → fault tolerant.** Each step is a purchase and each has a precise meaning the game can
enforce: *concurrently maintainable* means you can take any single component out for service without
losing redundancy, which is a genuinely different (and more expensive) property than merely having a
spare. A facility marketed as 2N that is not concurrently maintainable is a real and common lie, and
catching it in an acquisition level is a great beat.

#### The Seasonal Physical Calendar
§1.6's Seasonality is commercial and thermal. Add the *physical* year: leaf-on season (WISP), pollen
clogging intake filters in spring, ice storms, hurricane season, the annual fire-marshal inspection,
the utility's scheduled maintenance window, the annual generator load-bank test, the quarterly
vulnerability scan, the semi-annual tape rotation to the vault, and the fact that **nothing ships
between Dec 20 and Jan 5** so any hardware you need in that window must be on site by mid-December.

---

## 2. Threats

### 2A.1 Protocol and resource-exhaustion attacks (the ones that beat your counters)

#### HTTP/2 Rapid Reset
Opens a stream, cancels it immediately, repeats — thousands of times on **one connection**.

**How it works:** Defeats every defense the player has built that counts *connections* — connection
limits, per-IP caps, SYN cookies, conntrack limits — because there is only one connection and it is
well-behaved. The cost lands on request-processing capacity. The game's payoff: the player's
carefully tuned connection-based defenses show **green** while the app dies.
**Counter:** per-connection concurrent-stream limits and a reset-rate budget; a proxy version upgrade.
**Why it belongs:** the doc's flood taxonomy is entirely connection- or volume-shaped. This is the
"your mental model of the resource is wrong" attack.

#### The Handshake Flood (asymmetric crypto cost)
A small client forces expensive server-side cryptography by initiating TLS handshakes and walking
away, or by requesting renegotiation.

**How it works:** Costs almost nothing to send and a lot to answer — the attacker's CPU:your CPU ratio
can be 1:10 or worse. Traffic volume is trivial; your CPU graph is at 100%. **Another "the bandwidth
graph is flat and you are dead" threat**, in the same family as Slowloris but attacking a different
resource.
**Counter:** session resumption, handshake rate limiting, hardware offload, moving TLS termination to
an edge that has more CPU than you do.

#### The Slow Read (reverse Slowloris)
Requests a large response and then reads it at 1 byte/second.

**How it works:** Your server has generated the whole response and is holding it in a socket buffer,
consuming a worker and memory, for as long as the attacker wants. The distinction from slow-POST
matters mechanically: **write timeouts are a different setting from read timeouts** and players who
fixed one have not fixed the other. A wonderful "you patched the wrong half" beat.

#### ReDoS — The Regex That Ate A Core
A crafted input causes catastrophic backtracking in a regular expression, pegging one CPU core for
tens of seconds per request.

**How it works:** A handful of requests per second takes down a machine. The delicious version: **the
vulnerable regex is in your WAF rule set** — your defense is the amplifier, and disabling the WAF
fixes the outage, which is the most uncomfortable remediation in the game.
**Counter:** input length caps, regex timeouts, and a rule-cost profiler that makes the player audit
their own defenses.

#### The Decompression Bomb
An upload or a request body that expands 1000:1 when decompressed.

**How it works:** Hits upload handlers, backup ingestion, log ingestion, mail scanning, antivirus,
and object-storage servers that transparently decompress. Fills memory or disk in seconds. Great in
the object-storage and backup rulesets specifically.
**Counter:** decompression ratio limits and a hard output cap — a cheap, boring, decisive purchase.

#### Cache Deception
Not cache poisoning — the reverse. The attacker tricks the cache into storing a **private,
authenticated page** under a URL that looks static, then fetches it themselves.

**How it works:** `/account/settings/logo.css` — the origin serves the account page, the CDN sees a
`.css` extension and caches it publicly. The damage is a **data breach delivered by your own
performance optimization**, and it is invisible in every metric you have. The counter is cache-key
and content-type discipline.
**Interacts with:** §2.12 (CDN: Cache Poisoning via Header) as its mirror image; ship both.

#### The Hypervisor Ransomware
Ransomware that targets the *virtualization layer* rather than the guest.

**How it works:** Encrypts datastores directly, taking 200 VMs simultaneously with no per-guest
defense possible — the guests' own antivirus, patching and backups are irrelevant because the attack
is underneath them. The entry vector is a management interface exposed to the internet or a
compromised admin credential. **The specific horror: every one of your customers is down at once, and
their own precautions did not matter.** The counter is management-plane isolation and MFA, purchased
long before.

#### Living Off The Control Panel
An attacker with valid credentials who never installs anything.

**How it works:** They log into the hosting control panel (or your customer's) and use only supported
features: change the MX record, add a mail forwarding rule, restore a three-month-old backup over the
current site, create an FTP account, change the DNS to point elsewhere, add a second admin. **No
malware, no webshell, no file-integrity alert, nothing for an IDS to see** — every action is one your
product is designed to permit. Detection requires *behavioural* analysis of admin actions, which is a
different and more expensive tower than everything the player has bought so far.
**Signature persistence:** **the mail forwarding rule.** You reset the password, you enable MFA, you
feel safe, and they still receive every message including the password-reset emails. The counter is
an *audit of account settings*, not a credential rotation — a genuinely instructive distinction.

#### The Leaked Key In The Public Repo
Your customer commits an API key, an SSH private key, or your control-panel token to a public
repository. Automated scanners find it in **under 90 seconds.**

**How it works:** The attack arrives from a completely legitimate direction with valid credentials and
the correct client fingerprint. There is no network signature. Counters are detection-side: secret
scanning as a service, short-lived credentials, and **egress/spend anomaly alerting**, because the
first symptom is usually a bill.

#### The Compliance Scan That Took You Down
Your own quarterly vulnerability scan — mandated, scheduled, contracted — knocks over a fragile
service.

**How it works:** An authenticated ASV scan opens thousands of connections, fuzzes inputs, and
triggers a code path nobody has executed since 2016. It is the only attack in the game you **paid
for, scheduled, and cannot cancel without failing an audit.** Mitigations: scan a staging replica
(which fails the audit unless it is in scope), throttle the scan (the vendor must agree), or fix the
fragile service.

#### The Canary That Nobody Watched
Not a threat — an anti-threat the player forgot they deployed. (Listed here because it fires as an
event.) A honeytoken credential is used, generating a high-confidence alert that has been routed to
an unmonitored inbox for eight months. Reveals both a compromise *and* an alerting-path failure in
one beat.

### 2A.2 Network and physical-layer failures

#### The Half-Dead Link (unidirectional failure)
A fibre pair where one strand is broken or one transceiver's transmitter is dead.

**How it works:** **The link light is on at both ends.** Frames go one way and not the other. Spanning
tree and routing protocols may or may not notice, depending on whether you enabled the protocol
designed for this. Traffic blackholes. Every "is the link up?" check says yes. This is the purest
"your monitoring asks the wrong question" failure in networking and the doc doesn't have it.
**Counter:** UDLD-style link verification, or bidirectional forwarding detection on routed links —
both of which are *configuration you must have turned on beforehand*, not tools you can buy during.

#### The Microburst
Your interface graph shows 30% utilization. You are dropping packets.

**How it works:** The graph is a 5-minute (or 30-second) average. The drops happen in 50-microsecond
bursts that saturate the switch's egress buffer. **This is a mechanic about measurement resolution,
and it is entirely unmodelled in the merged doc.** Implement it as a **telemetry resolution dial**:
the player's graphs have a sampling interval, and buying finer resolution (or interface drop counters,
or a buffer-occupancy readout) is an *observability upgrade that changes what is true*. Nothing else
in the game teaches "your instrument's resolution determines what you can see."
**Where it bites:** storage networks, video ingest, HFT colo, anything with many-to-one traffic
patterns (TCP incast). Pairs beautifully with §6.3's 95th-percentile billing — the same "averaging
hides the truth" idea on two different axes, one financial and one operational.

#### TCP Incast
Many servers answer one request simultaneously and collectively overwhelm the requester's switch port.

**How it works:** Emerges only above a certain fan-out, so it appears when you *scale out* — the
architecture that solved your last problem creates this one. Classic in distributed storage, map-reduce,
and erasure-coded reads. **A failure caused by adding capacity**, which fits the doc's "your success is
the threat" family perfectly.

#### The Max-Prefix Shutdown
You announce one prefix more than your peer's configured limit and **they shut down the entire BGP
session**, not just the extra prefix.

**How it works:** A routine, correct-looking change (announcing a new /24 you legitimately own) drops
a transit or peering session entirely. Recovery requires the other party's engineer, on their
timeline. **A configuration limit in someone else's router that ends your traffic.**

#### BGP Dampening — the punishment that outlasts the fault
Your circuit flapped six times in ten minutes. It is stable now. **Your prefix is suppressed
upstream for the next hour.**

**How it works:** Converts the doc's `Transit Flap` from a during-fault problem into an
after-the-fault problem: you fixed it, everything is green on your side, and traffic does not come
back for 45 more minutes while you can do nothing. The lesson — **stop flapping something before you
try to fix it; administratively shut the session down first** — is a genuine senior-engineer reflex
and a great unlock.

#### The RPKI Self-Inflicted Blackhole
Your ROA says maximum length /24. You announce a /25 for a customer. **Validating networks now reject
your announcement and that customer is unreachable from a growing fraction of the internet** — and
the fraction grows over time as more networks enable validation, so the symptom gets slowly worse.

**How it works:** The security control you bought in §5.2 ("First BGP incident → unlocks RPKI") is now
the outage. Consistent with the doc's own excellent principle that every defense opens a surface, and
currently RPKI is listed only as a pure counter.

#### The Blended Transit Downgrade
Your cheap transit provider quietly changes its upstream mix. Your bandwidth is the same price, the
same committed rate, and the same "up." Your **latency to a third of the internet doubles** because
your packets now take a scenic route.

**How it works:** Nothing is down, nothing alerts, your customers' conversion rate drops 4% and they
blame their own websites. Introduces the real distinction between **transit quality and transit
quantity** — Mbps are not fungible, and the cheap bid in §1.5 should apply to circuits as well as
hardware. The diagnostic tool is external latency measurement from many vantage points.

#### The Asymmetric MTU Path
A tunnel, a VPN, or a cloud interconnect reduces the usable MTU on one path only.

**How it works:** Small requests work perfectly; anything above ~1400 bytes on that path vanishes.
Because it is path-dependent, **it affects some customers and not others, and switches between them
when routing changes.** The doc has `MTU Mismatch / PMTUD Blackhole`; the asymmetric, intermittent,
route-dependent version is meaningfully nastier and worth calling out separately.

#### The Management Network That Rode The Production Switch
You bought out-of-band management (§4.4). It is cabled to the same top-of-rack switch as production.

**How it works:** Everything works perfectly until the failure that takes the switch, at which point
your remote hands, your console access, your power control and your ability to diagnose all vanish
together. **The purest expression of the doc's own `Effective vs nominal redundancy` rule applied to
the recovery path instead of the service path**, and it is a mistake almost everyone makes once.

#### The PXE Reimage Incident
Your provisioning network re-images a production machine.

**How it works:** A new machine is racked and net-boots. A DHCP scope, a MAC address typo, or a
default-install PXE policy means the wrong machine picks up the install profile and begins partitioning
itself. Nobody is watching. The damage is complete, fast, and self-inflicted by the automation that
makes you efficient.
**Counter:** a provisioning VLAN separate from production, MAC allowlisting, and a "confirm target"
gate — all of which slow provisioning down, which was the entire reason you built it.

#### The Firmware Flash That Didn't Finish
A RAID controller, BIOS, switch or drive firmware update loses power or times out mid-write.

**How it works:** The device is now a brick with no bootloader. On a switch this is an outage with no
console banner to read; on a RAID controller it can mean an array that cannot be imported by a
replacement card of a different firmware revision — **your data is intact and unreachable.** Counters:
staged firmware rollouts, matched-firmware spares on the shelf, and a dual-flash device (a real
feature you can pay for).

#### The Config Nobody Backed Up
The switch died. You have a replacement. Nobody has a copy of its configuration.

**How it works:** The doc has excellent config management for *servers* and nothing for *network
devices*, which is exactly the real-world gap — everyone Ansible-izes their fleet and nobody exports
the switch config. Rebuilding from memory takes hours, introduces subtle differences (see `Config
Drift`), and you will miss one VLAN.
**Counter:** an automated network-config backup with a diff view — cheap, boring, and the single
highest-value network purchase in the game.

### 2A.3 Storage, virtualization and capacity failures

#### Thin Provisioning Cliff
You sold 400TB out of a 200TB pool because nobody uses their full allocation. **They do now.**

**How it works:** The oversell slider (§6.5) exists for CPU and bandwidth in the doc. Storage
overcommit has a categorically different failure shape: when a thin pool hits 100%, **writes do not
slow down, they stop**, and every VM or volume backed by that pool freezes simultaneously. There is
no degraded mode and no graceful shedding — it is the most binary capacity failure in infrastructure.
Recovery requires either adding capacity (lead time) or deleting something (whose?).
**Counters:** pool reservation policies, hard per-tenant caps, and an alert threshold at 75% that you
will raise to 85% because it was noisy.

#### Snapshot Sprawl
A snapshot taken "just in case" before a maintenance window in March.

**How it works:** Snapshots grow with the *change rate* of the volume, so a snapshot on a busy
database can exceed the size of the database itself. They are invisible in normal capacity views,
they degrade write performance, and consolidating a huge one causes a long stun of the running VM —
**so the cleanup is itself an outage.** Great slow-burn threat: created by prudence, forgotten,
compounding.

#### The SSD Endurance Cliff
Every solid-state drive in a cluster is written at the same rate. They therefore reach their
write-endurance limit **at the same time**, on a date you could have read off the SMART wear
indicator for three years.

**How it works:** Unlike the doc's `Correlated Batch Failure` (which is a probability), this is a
**deterministic, readable, ignorable countdown**. If the player bought drive telemetry, the fleet
shows "media wear: 94%" with a projected exhaustion date; if not, five drives go read-only in one
week. **A doom clock that rewards looking.**
**Counter:** staggered replacement, mixed write loads, over-provisioning, and a procurement policy
that buys in waves rather than batches.

#### The Dying-But-Not-Dead Drive
A drive that has not failed, reports SMART-OK, and answers every I/O — in 800 milliseconds.

**How it works:** RAID and distributed storage both handle *dead* members gracefully and handle *slow*
members terribly, because the array waits. One sick drive drags the entire array's latency to its
own. Finding it means comparing per-device latency across otherwise identical devices — an
**odd-one-out diagnostic**, the same shape as the doc's lovely cryptominer-thermal puzzle.
**Counter:** per-device latency monitoring and an automatic slow-device ejection policy, which
introduces its own risk of ejecting a healthy device during a load spike.

#### CPU Ready Time (the metric that lives in a third place)
Your VPS customer says their server is slow. Inside the guest, CPU is 20% idle. On the host, CPU is
40% idle. **Both are true and the customer is right.**

**How it works:** The guest is spending time *ready to run and waiting for a physical core*, which is
invisible from inside the guest and invisible from a naive host utilization graph. It is caused by
overcommit ratios and by oversized VMs (an 8-vCPU VM must wait for 8 free cores). **A perfect
teaching mechanic for the doc's overcommit slider**, because it explains *why* overcommit hurts in a
way that a generic "contention" number never will. It also models the most common real support
argument in VPS hosting.

#### Deleted But Open
`df` says the disk is full. `du` says it isn't.

**How it works:** A process holds a file descriptor for a log file that was rotated and deleted; the
space is not released until the process is restarted. The disk is 100% full and **the largest file on
it does not exist.** A short, perfect diagnostic puzzle that has exactly one correct move, and the
correct move is a restart the player will be scared to perform.

#### The Filesystem That Slowed Down At 90%
Not full, just past the threshold where its allocator starts working hard.

**How it works:** No alert fires because there's still space. Write latency climbs, the database's
commit times climb, and requests queue. Belongs to the `Threshold Day` family and is one of the best
"nothing changed" incidents available.

#### The Backup Window That Moved
Daylight saving time shifts your schedule. Your nightly backup now starts during the business day.

**How it works:** No failure, no alert — the job runs, succeeds, and saturates your storage array for
four hours while customers are working. Two days later someone connects the dots. Small, true,
perfect.

### 2A.4 Identity, time, and trust failures

#### The Internal PKI Expiry
Everyone's TLS story is about the public certificate on the front door. The one that actually takes
you down is the **internal** one: mutual TLS between services, a Kubernetes cluster CA, a client
certificate on a fleet of 40,000 devices, a cert inside a Java keystore.

**How it works:** They have long lifetimes (2–5 years), nobody monitors them because they're not
public, and there's no browser to warn you. When one expires, service A can no longer talk to service
B and **every symptom looks like a network problem**. The device-fleet version is worse: 40,000
devices that provisioned in one batch have certificates that expire in one batch, and the devices
cannot be updated without a working connection they no longer have. (This is the same class as the
doc's IoT cert observation, generalized and made central.)
**Counter:** a **certificate inventory** that scans your own estate, plus short lifetimes with
automated rotation — which is itself a new failure mode when the rotation service breaks.

#### The OCSP Responder Outage
Your certificate is valid. Your CA's revocation-checking service is down.

**How it works:** Clients diverge: browsers soft-fail and shrug, but some enterprise clients, some
payment gateways and some hardened configurations **hard-fail and refuse the connection.** So your
site works for 97% of visitors and is completely broken for a specific, high-value, hard-to-identify
3%. The counter (OCSP stapling) is something the doc already mentions as a speed optimization —
promote it to a resilience purchase.

#### The GNSS/NTP Spoof — when all your clocks agree and are wrong
Distinct from the doc's `Clock Drift / NTP Failure`, which is about *losing* time.

**How it works:** Your time source is confidently, uniformly incorrect. Certificates validate or fail
inexplicably, logs are unorderable against everyone else's logs (which is how you eventually find
out), scheduled jobs fire at the wrong moment, and a distributed database's conflict resolution makes
permanent wrong choices. **Nothing alerts because there's no disagreement to detect.** Counter:
multiple independent time sources of *different kinds* (GNSS + a peered NTP pool + a local
oscillator) and a sanity comparison between them.

#### The HSTS Preload One-Way Door
You submit your domain to the browser preload list. **Removal takes months and ships with browser
releases.**

**How it works:** Now every subdomain must be HTTPS forever, including the internal tool on a
self-signed cert and the legacy customer endpoint that can't do TLS. A one-way door with a
multi-month reversal, which is exactly the kind of irreversible decision the doc's §7.7 wants more of.

#### The TLS Deprecation Cutoff
You disable TLS 1.0/1.1 (correctly, for compliance). A measurable slice of traffic disappears.

**How it works:** Old Android devices, point-of-sale terminals, a customer's Java 6 integration, an
embedded device fleet, a payment gateway's outbound callback. The failure is **on someone else's
equipment and you cannot fix it.** The player's choice is compliance vs those customers, made
concrete as a visible percentage of traffic and a named list of accounts. This is the doc's `Missing
Intermediate Chain` idea generalized into a recurring, calendar-driven decision.

### 2A.5 Human, vendor and organizational threats

#### The Alerting Path Dependency
Your alerting emails route through the mail server that is down. Your paging integration is hosted on
the cloud region that failed. Your on-call phone has no signal inside the datacenter.

**How it works:** A **meta-failure that removes your ability to know about failures**, one level above
the doc's excellent `The Monitoring Server Dies`. Counter: an out-of-band alerting path — a second
provider, an SMS gateway, a physical siren — and a periodic test that proves it works.

#### The Vendor Support Contract Wall
See `The Warranty Cliff` above; as a threat, the specific beat is: a critical firmware security
advisory is published, and the download is behind an active-contract login you no longer have.

#### The Acquired Vendor
The company whose product you standardized on is bought. Support quality collapses within two
quarters, the product enters maintenance mode, prices rise at renewal, and the feature you depend on
is deprecated.

**How it works:** A slow, unavoidable, three-level-long degradation with a forced migration at the
end. Different from the doc's `Vendor EOL` because the product still exists and is still sold — it
just quietly stopped being good, and the transition is a business decision with no technical trigger.

#### The Employee Who Automated Themselves Into Load-Bearing
Someone wrote a script that saves everyone an hour a day. It lives on their workstation. It uses
their personal credentials. It is now in the critical path of billing.

**How it works:** Discovered when they go on holiday. The general principle — **shadow automation is
technical debt with a face** — deserves a mechanic: periodically, a staff member's productivity bonus
is revealed to be a script, and the player chooses to productionize it (costs hands) or continue
benefiting from it.

#### The Hardware Broker
The part you need has not been manufactured since 2016.

**How it works:** A grey-market purchase with a quality roll: genuine used, refurbished, counterfeit,
or a pull from a decommissioned system with unknown hours. Counterfeit optics and counterfeit memory
are real and their failures are *weird* — intermittent, temperature-dependent, and they pass initial
testing. A great source of "the hardware lottery" with an origin story.

#### The Landlord's Other Tenant
Colo has this (`Colo: The Tenant Who Overloads The Circuit`), but the *building* version is missing:
the tenant on the floor above you is not a datacenter. They are doing construction, or they have a
water feature, or their fire system is tied to yours, or their loading dock use blocks yours every
Tuesday.

**How it works:** Recurring, unfixable, negotiable-only friction from a party who has no obligation to
you at all. Pairs with the doc's `Water Leak` (which is currently framed as a CRAC/pipe failure — the
more common cause is the floor above).

---

## 3. Visitors, traffic, and clients

### 3A.1 New "what is a visitor" definitions for the new lines

- **IX operator — a peering session.** Not traffic: a *relationship*. It arrives as two members
  agreeing (which you can encourage but not force), it has an establishment sequence you can watch
  (port up → LACP → ARP on the peering LAN → BGP session established → prefixes exchanged), and once
  established it is a **resident** unit (§3.1's duration classes) that sits there producing value for
  years. Losing one is silent and you may not notice for a month.
- **Registrar — a registration, a renewal, and a transfer.** Three units with opposite emotional
  valences: a registration is revenue, a renewal is retention, and a **transfer-out is a visitor
  walking out the door that you are legally obliged to assist**. The transfer-in is the only visitor
  in the game you can win by being *faster at paperwork*.
- **CA — a certificate signing request with a validation challenge attached.** The visitor must prove
  something before you serve it, and the proof mechanism (DNS record, HTTP file, email) can fail for
  reasons on their side. High volume, near-zero value each, enormous liability each.
- **Observability host — a metric series.** The visitor is not a request, it is a *stream that never
  ends*, and its cost is its cardinality rather than its volume. The only visitor whose arrival is
  permanent.
- **CI host — a build job.** Arrives in bursts tied to the working day and to merges; is patient
  (queues happily) up to a point and then the developer context-switches away and the value
  evaporates even if the build eventually succeeds. **Value decays with queue time rather than
  vanishing at a threshold** — a distinct patience curve worth modelling.
- **DRaaS — a declaration.** The rarest and most valuable visitor in the game: most customers never
  send one, and when they do it is the entire product. It arrives by phone, at night, from a person
  who is having the worst day of their career.
- **PACS — a study retrieval with a human attached.** Enormous payload, tiny patience, and the
  bouncer is a clinician.
- **POS — an authorization.** Binary, 2-second hard timeout, and the bounce is a person at a till.
- **Playout — the schedule itself is the visitor.** It never stops arriving and it cannot be queued.
- **WISP — a subscriber's CPE**, which is a resident unit with a *physical aim* and a signal-quality
  stat that degrades with weather and vegetation.
- **Time service — a synchronization client**, which does not bounce and does not complain. It just
  quietly becomes wrong along with you.
- **Legacy/mainframe — a batch window.** The nightly job run is the visitor, it is enormous, it must
  finish before the branch offices open, and it has run at the same time since 1997.

### 3A.2 New visitor and customer archetypes

#### The Authorized Attacker (the customer's pentester)
Your customer hires a penetration-testing firm and sends you a notification with an IP range and a
date window.

**How it works:** For that window, a stream of genuinely hostile traffic arrives that you are
contractually expected to *tolerate* and permitted to defend against. The player's decision is
whether to allow-list them (they get a clean test, you learn what's actually weak, and the report
becomes Intel currency) or to let your defenses fight them (you look great in the report and learn
nothing, and the customer paid $30,000 to be told their WAF vendor works). **A threat unit whose
correct handling is to let it in.**
**Payoff:** the resulting report is a §5.4-style discovery document listing three real weaknesses,
free, that you now have a deadline to fix because the customer has read it too.

#### The Integration Partner
A customer's *other* vendor who talks to your platform: their payment processor's callback, their
monitoring service, their CDN's origin fetches, their ERP's nightly sync.

**How it works:** A machine visitor you have no contract with, whose behaviour you cannot influence,
whose IP ranges change without notice, and whose failure generates a ticket blaming you. They are the
main reason "block by ASN" is dangerous. **The third-party you must serve and cannot manage.**

#### The Compliance Visitor (the questionnaire)
Not the auditor (already in the doc) — the **security questionnaire**, which arrives as a 340-row
spreadsheet from a prospect's procurement team with a 10-day deadline.

**How it works:** Each row is answerable only if you actually built the thing, and the answers are
*checkable* later. Answering honestly loses some deals; answering aspirationally wins the deal and
creates a future obligation with a date attached. A great, cheap, recurring Inbox card, and a direct
bridge between §4 buildables and §6 revenue: **your architecture is literally the sales document.**

#### The Customer Who Monitors You Better Than You Do
A technically sophisticated client who runs their own synthetic checks against your service from
five regions.

**How it works:** They tell you you're down before your monitoring does — sometimes before you *are*
down, because they're measuring p99 and you're measuring p50. Handled well they are the best free
monitoring you will ever have and become a reference customer; handled badly ("we don't see it on our
end") they become the doc's `Uptime-Monitor Public Shaming`. **Turning a complainer into a sensor is
a real skill and a lovely mechanic.**

#### The Migration-Out
The doc has `The Migrating Customer / The Migration-In` and `The Churn Walk`. Missing: the customer
leaving *while still your customer*, who needs your help to go.

**How it works:** They have given notice, they still pay, they now file more tickets than ever, and
their data extraction is saturating your egress. Your options — help enthusiastically (costs money,
they may come back, they will definitely talk about you), help minimally (they'll talk about you
too), or charge for the retrieval (correct, legal, and the fastest way to create a viral post). The
retrieval fee decision is the single most reputation-relevant billing choice in hosting.

#### The Customer Who Has Locked Themselves Out
They enabled a firewall on their own VPS, changed the SSH port and forgot it, deleted their sudo
user, or set a boot parameter that doesn't boot.

**How it works:** An extremely high-frequency, low-severity ticket class that **is only solvable if
you built console/IPMI access** — so it is the ticket that pays for the §4.4 out-of-band purchase in
support-minutes rather than in outages. Automating it (a self-service rescue mode in the control
panel) is a classic support-cost-reduction tower.

#### The Referrer You Didn't Ask For
Someone posts your service on a forum, a subreddit, or a Chinese-language deal site you cannot read.

**How it works:** A traffic channel you didn't build, cannot control, and that brings a customer cohort
with completely different behaviour — sometimes excellent, sometimes 400 fraudulent signups in an
afternoon. The mechanic: an **unattributed acquisition channel** appears in your cohort view and you
must decide whether to lean into it, and you cannot turn it off.

### 3A.3 New bounce and churn causes (all real, all unmodelled)

- **The visitor's ISP is the problem.** Their resolver is hijacking NXDOMAIN, their carrier-grade NAT
  put them behind an IP you rate-limited, their corporate proxy is MITM-ing TLS and your HSTS/pinning
  rejects it, or their ISP's transit to you is congested at 8pm. **You are perfect and they bounce**,
  and the only way to know is measurement from outside your network.
- **Happy Eyeballs failure.** You published an AAAA record. A slice of visitors have broken IPv6 and
  their browser's fallback timer is 300ms of pure added latency — or, worse, their IPv6 path is up
  but blackholed and the fallback never triggers. **Adding a capability made a cohort slower**, which
  is a lovely inversion of a "strictly good" upgrade.
- **Geo-IP misclassification.** Your CDN sends a visitor to the wrong continent because a database
  says their IP is in the wrong country — common after IP transfers. They experience 280ms and you
  see nothing wrong.
- **The browser warning that isn't yours.** A Safe Browsing or reputation-vendor interstitial fires on
  a *neighbouring* site on shared infrastructure, or on an ad on your customer's page. Near-100%
  bounce, and the delisting process is a form and a wait.
- **The mobile-carrier NAT block.** Your per-IP rate limit bounced 40,000 subscribers behind one
  carrier NAT gateway. The doc has `fail2ban Self-DoS` for an office; the carrier-scale version is a
  different order of magnitude and argues for per-ASN and per-session limits rather than per-IP.
- **The cert chain that only fails on old clients.** Already in the doc as `Missing Intermediate
  Chain`; the bounce-side framing — a specific, invisible cohort loss with no error in your logs
  because the connection never completed — belongs in §3.4 too.
- **Queue-time value decay** (CI, HPC, transcode, support): the request eventually succeeds and the
  value is gone anyway because the human moved on. A patience model that doesn't *bounce*, it
  *depreciates*.

---

## 4. Buildables: services and infrastructure

*All of these follow the doc's Three-Column Law: capability, cost, and what they let in.*

### 4A.1 Network and traffic control

#### QoS / Traffic Shaper
The tower the doc is missing entirely: prioritization rather than blocking.

**Gives:** classify traffic into classes (interactive, bulk, replication, backup, management) and
guarantee each a share of the link. A backup job can no longer starve a customer's checkout. Turns a
congested link from "everything is bad" into "the right things are fine."
**Costs:** cheap in money, expensive in thought — every class you define is a policy you must
maintain, and the classification itself is CPU on the device.
**Opens:** misclassification (traffic you didn't categorize lands in the default class and starves),
and the management class you forgot to protect — so during the congestion event you cannot log in to
the device causing it.
**Why it matters mechanically:** it is a defense that costs **nothing in Friction to legitimate
visitors** but costs something to *other legitimate traffic of yours*, which is a new and interesting
kind of tradeoff for this game: a tower that prioritizes rather than filters.

#### Upstream Blackhole Signalling (RTBH) + Flowspec
The thing that actually stops a volumetric attack, as distinct from the doc's local `Big Red Button`.

**Gives:** a BGP community you announce to your transit providers that causes them to drop traffic to
a given IP **in their network, before it reaches your circuit.** Granularity is the mechanic: a /32
blackhole sacrifices one customer; a /24 sacrifices 250; Flowspec (if your upstream supports it) lets
you drop by port/protocol and keep the customer up.
**Costs:** a relationship with your upstream and pre-arranged configuration. Propagation is 30–120
seconds, so it's a **decision with a delay fuse**, exactly as the doc wants.
**Opens:** you have handed a third party the ability to drop your traffic; a mis-tagged announcement
blackholes something you needed.
**Why it belongs:** without it, the player's mental model is "I can drop it at my firewall," which is
the single most common misconception about DDoS and is wrong for any attack larger than your pipe.

#### External Vantage Fleet (probes in other people's networks)
Monitoring, but from outside.

**Gives:** latency, reachability, DNS resolution and TLS validity measured from many ASNs and
countries. This is the only tool that can see the `Blended Transit Downgrade`, the `Lame Delegation`,
the geo-misrouting, the `Whitelisted Office` blind spot, and a BGP hijack.
**Costs:** cheap monthly, and a modest flood of low-value alerts from flaky vantage points.
**Opens:** alert fatigue from other people's networks having bad days, which teaches the player to
require *N-of-M* agreement before believing a probe — a genuinely good lesson about distributed
measurement.

#### Network Config Backup + Diff
Automated nightly export of every switch, router, firewall and PDU configuration, with a visible diff.

**Gives:** device replacement in minutes instead of hours; and the diff view answers "what changed on
the network" instantly, which is the first question of half of all incidents.
**Costs:** trivial. This is deliberately one of the cheapest, most powerful purchases in the game, and
players will still not buy it until a switch dies.
**Opens:** a repository containing every credential and every ACL in your estate — a very high-value
target. (Encrypt it, and now the encryption key is a dependency.)

#### Anycast Health Withdrawal Controller
For CDN/DNS/anycast lines: automatically withdraw a PoP's BGP announcement when it becomes unhealthy.

**Gives:** a sick PoP stops attracting traffic instead of black-holing it.
**Opens:** **withdrawal cascades** — the withdrawn PoP's traffic lands on its neighbours, which are
now overloaded, which withdraw, which... The counter is a floor (never withdraw more than N% of the
constellation) and damped hysteresis. A beautiful automation-eats-itself failure specific to anycast
and absent from the doc.

#### The Witness / Tiebreaker Node
The cheapest fix for the doc's own "two datacenters is the most dangerous number."

**Gives:** quorum for a two-site cluster by placing a tiny, cheap vote-only node in a **third failure
domain** — a VM at a cloud provider, a box in a colleague's rack, anything that is independently
reachable. Costs almost nothing and converts split-brain from likely to unlikely.
**Opens:** a dependency on a third party for your own failover decisions; and a witness placed in one
of the two existing sites (which players will do, to save money) is worse than no witness at all
because it makes one site structurally privileged and hides that fact.

### 4A.2 Facility, power and cooling

#### Thermal Ride-Through (chilled-water buffer tank / thermal storage / flywheel)
Explicitly purchasable *minutes*.

**Gives:** when cooling stops, this is how long you have before anything throttles. A buffer tank of
chilled water, or simply a large air volume, converts a 90-second chiller restart from a crisis into
a non-event.
**Costs:** space, capital, and maintenance (water treatment, glycol, biology).
**The counterintuitive part worth teaching:** **hot-aisle containment reduces ride-through time.**
Containment is more efficient precisely because there is less mixed air mass buffering the room, so
the same investment that lowered your PUE shortened your grace period from 8 minutes to 90 seconds.
The game should let the player discover this by surviving a cooling failure *before* containment and
not surviving one after. It's real, it's counterintuitive, and it's a perfect Capability-vs-Surface
demonstration in the facility branch.

#### Chilled Water Plant (chillers, pumps, cooling towers, water treatment)
The doc stops at the CRAC. At scale, the CRAC is the least interesting part of cooling.

**Gives:** efficient cooling at density, and **economizer / free-cooling mode** when outside
conditions allow — a large seasonal cost saving.
**Opens:** an entire second infrastructure with its own failure modes: a pump seal, a valve actuator,
a control-system failure that puts everything into a safe-but-useless state, **glycol concentration
and water treatment** (neglect it and you get biological fouling or corrosion), a cooling tower in a
heatwave running out of makeup water, and **legionella management** as a genuine regulatory
obligation. The chilled-water loop is also the source of the leak that lands on your racks.
**Great mechanic:** economizer mode has a **changeover threshold** (outside wet-bulb temperature), so
your cooling cost has a visible seasonal shape, and a humid week costs real money.

#### Switched PDU (per-outlet power control)
The unglamorous purchase that converts a truck roll into a click.

**Gives:** remotely power-cycle an individual outlet. Fixes the wedged machine whose BMC has also
hung — which is the specific case where IPMI/iDRAC (already in the doc) does not help.
**Costs:** more than a basic PDU, and per-outlet metering on top of that.
**Opens:** a network-attached device that can turn off any server in the rack, running firmware from
2017, with a default password. **A remote power-off button for anyone who finds it.**

#### Environmental Sensor Mesh
Per-rack inlet/outlet temperature, humidity, differential pressure, door-open sensors, and a leak
cable under the floor.

**Gives:** the data behind the thermal overlay. Without it, the thermal map is a *simulation* and not
a *measurement* — which is a great fog-of-instrumentation distinction: before you buy sensors, the
game should show you a **modelled, smoothed, slightly wrong** heat map, and after you buy them the map
gets noisier and truer, and the hot spot turns out to be somewhere else.

#### Pre-Action Dry-Pipe Sprinkler
The choice the doc's `Fire Suppression` entry is missing.

**Gives:** a sprinkler system whose pipes are empty until *two* independent triggers (smoke detection
plus heat) — so a burst pipe or a single false smoke alarm doesn't flood the room. Cheaper than inert
gas, protects the building, and won't discharge on you accidentally.
**Costs:** more than wet-pipe, less than gas, and it still ruins hardware when it does fire.
**Interacts with:** the acoustic-damage note in Part B.

#### The EPO Guard
An $8 hinged plastic cover, purchasable in the facility tab, next to the six-figure generator.
**The joke is the price and the joke is correct.**

#### The Lab Rack
A physically separate, non-production rack with its own power and switch.

**Gives:** a place to test firmware upgrades, practise failovers, reproduce a customer's environment,
and run the chaos experiments the doc already has. Converts "we'll test in production" into a
purchasable alternative.
**Costs:** hardware and space that produce zero revenue — the purest §4.5 `Staging Environment` idea
applied to *hardware*, and therefore harder to justify and more valuable.
**Opens:** the lab that quietly becomes production because someone needed a box quickly. (The game
should let this happen and then run a real customer's workload on unpatched lab hardware for three
levels before anyone notices.)

#### Rails, Cage Nuts, Depth Adapters and the Cable Comb
A bundle of tiny physical consumables that gate placement speed.

**Gives:** a racking job takes 10 minutes with the right rail kit and 50 minutes without. A cabinet
that is 1000mm deep will not take a 1100mm chassis no matter how much you paid for it.
**How it works mechanically:** placement in a rack has a small **fit check** — depth, rail type,
square-hole vs threaded, weight, and PDU clearance. Failing it doesn't block the build; it adds time
and a chance of a `Missing Screw` event. Buying a standard rail kit for your standard chassis (a
procurement decision) removes it.
**Why:** it is the single most universally recognized indignity in the job, and it makes §7.3's
placement layer physical instead of abstract.

### 4A.3 Operations and safety tooling

#### The Break-Glass Safe
A sealed emergency credential with an audit trail.

**Gives:** a way in when your identity system is the outage. One use, logged, alarmed, and it triggers
a mandatory rotation afterward.
**Costs:** almost nothing, plus a quarterly test you will skip.
**Opens:** a credential that bypasses everything, which is exactly what an attacker wants; and a
credential that hasn't been tested in two years, which is exactly what you'll have.

#### Canary Credentials / Honeytokens
Fake secrets scattered in plausible places: an AWS-looking key in an old config, a decoy admin
account, a fake customer database row.

**Gives:** an extremely low-false-positive breach signal. Unlike the doc's Honeypot (a fake server),
these are **planted inside real systems**, so they detect the attacker who is already in — which is
the detection problem the doc's APT threat otherwise has no cheap answer to.
**Costs:** trivial money, and the discipline to document where they are so your own team doesn't chase
one.
**Opens:** nothing technical, and one excellent comedy beat where a new hire finds the decoy
credentials and helpfully "fixes" the security problem by rotating them.

#### SBOM / Software Inventory
A live list of what software, at what version, runs where.

**Gives:** the ability to answer "are we affected?" in minutes instead of days. This is the tool that
makes a zero-day survivable, and the doc's §2.5 `Log4Everything` currently skips the discovery phase
entirely (see Part B).
**Costs:** ongoing maintenance and a scanning agent per host.
**Opens:** a complete map of your own attack surface, in one file, which an attacker would very much
like to have.

#### Golden Image Bakery
A pipeline that produces a known, versioned, tested base image for every machine.

**Gives:** the `Rebuildability` stat drops fleet-wide. Recovery from compromise becomes "redeploy"
rather than "investigate and clean." New machines are identical by construction rather than by
convergence.
**Costs:** a build pipeline, storage for images, and the discipline to rebuild rather than patch in
place.
**Opens:** **a vulnerability baked into the image propagates to every machine you build from it**, and
the machines built last month are now a different generation from the ones built this month —
"generational drift," which is config drift with a version number.

#### Provisioning Network (PXE/netboot) — with its own hazard
Listed as a buildable because its catastrophe (§2A.2) is one of the best self-inflicted failures
available and needs a structure to attach to.

#### Incident Command Structure
Not a person — a **role assignment system.**

**Gives:** during an incident, the player assigns roles rather than just hands: **Incident Commander**
(decides, does not debug), **Operations** (does the work), **Communications** (status page, customers,
tickets), **Scribe** (records the timeline — which later becomes the RFO and the postmortem's
evidence). Having an IC measurably reduces the "three people independently restarting the same
service" failure and prevents the doc's `Ticket Avalanche` from consuming the engineers.
**Costs:** it consumes a hand that could have been debugging, which is exactly why players won't do it
and exactly why it works.
**Opens:** an IC who starts debugging (a real and common failure), and a communications lead who
promises a fix time.
**Why:** the doc models hands and attention beautifully but has no model of *coordination*, which is
the actual difference between a 20-minute incident and a 3-hour one.

#### The MOP and the Go/No-Go
A structured change procedure as a playable object.

**Gives:** for any risky change, write a Method of Procedure: the steps, the verification after each
step, the rollback plan, and the point of no return. Executing a change *with* a MOP is slower, has a
lower failure chance, and — crucially — has a **defined abort point** with a **go/no-go decision**
the game makes you click. Without one, a failed change becomes improvisation at 2am.
**Opens:** a MOP written for last quarter's topology; and the temptation to skip the verification
steps because you're behind schedule.

#### The Retrieval / Egress Policy Desk
A tiny business object with outsized reputational weight: the policy for what you charge a departing
customer to get their own data out.

**Gives:** a revenue line (§6.6's data gravity) and a churn-friction mechanic.
**Opens:** the single most viral-post-generating decision available to a hosting company.

---

## 5. Unlocks and discovery

### 5A.1 New discovery mechanics

#### The Scream Test (as an unlockable verb)
See §1A.2. As a *mechanic*, it is the game's only tool that discovers dependencies by **destroying
availability on purpose**, and it should unlock after the player's first `Undocumented Dependency`
incident. Three tiers: unplug the network (reversible in seconds), power off (reversible in minutes),
unrack (reversible in a truck roll). The test duration is a player-set dial and the dial is the whole
decision.

#### Bisection (as an unlockable verb)
See `The Bisect` scenario. Once unlocked, a general "split the suspect set in half" action usable
against backends, versions, tenants, paths, client ASNs and time windows. The game should show the
suspect-set size shrinking — a visible `2^n` countdown — which makes a methodical technique *feel*
like progress, which is exactly what it is.

#### Change Correlation ("What changed?")
An overlay, not a graph: the incident timeline with **every change anyone made** overlaid — your
deploys, your config pushes, a customer's DNS edit, a vendor's firmware auto-update, a certificate
that rotated, a cron that fired for the first time this year, a traffic threshold that was crossed.

**How it works:** Unlocked after an incident where the cause was a change nobody remembered. The
overlay's real teaching moment is the cases where **the answer is "nothing changed"** — which sends
the player to the Growth Ceiling overlay and the `Threshold Day` family instead. Two diagnostic modes,
and knowing which one you're in is the skill.

#### Packet Capture (the expensive, definitive, late-game tool)
A tcpdump-alike: expensive in storage, produces enormous data, and **answers questions nothing else
can** — one-way audio, MTU blackholes, retransmits, malformed frames, who actually sent the reset.

**How it works:** Capture is a *timed action* on a specific link with a size budget; you must decide
where to put the tap before you know where the problem is, which is the real skill. Capturing on the
wrong interface costs you the window. Pairs with a **port mirror / TAP** buildable.
**Progression note:** this should be the last observability unlock, and it should feel like getting a
microscope.

#### Flow Records (netflow/sflow) and Traffic Archaeology
Cheaper than packet capture, retained for months, aggregated.

**How it works:** Answers "who was talking to that decommissioned server" (essential for the Scream
Test), "where did the bandwidth go last Tuesday" (essential for a 95th-percentile bill dispute), and
"has this host been beaconing to the same IP every 4 hours since March" (the APT detector that
actually works). **Retrospective visibility is a distinct kind of observability the doc doesn't have
— the ability to ask a question about the past.**

#### The Vendor's Own RFO
When your upstream, cloud provider, CDN or DNS vendor has an outage, they publish a post-incident
report.

**How it works:** Reading it costs nothing and unlocks a node — you learn a failure mode from someone
else's pain, which is *literally how this profession transmits knowledge.* Makes the doc's `The
Dependency Web` twist productive instead of purely helpless. Extends to public postmortems from
companies you don't even use: a **Reading Room** where real-shaped incident write-ups are available as
cheap Intel, gated only by the player choosing to spend quiet time reading.

#### The Customer's Pentest Report
See `The Authorized Attacker` (§3A.2). A free, detailed, externally-produced list of your weaknesses,
with a deadline attached because the customer has read it too.

#### Certificate Inventory Discovery
A scan that finds every certificate in your estate, including the ones you forgot: internal CAs,
client certs, keystores, load-balancer configs, an expired cert on a decommissioned host still in
DNS. Unlocked by the first *internal* PKI outage. **Its first run should always find something
frightening**, in the same spirit as the doc's excellent `Asset Discovery Scan`.

#### Growth Ceiling Discovery
Unlocked after a `Threshold Day`. Every component displays its nearest hard limit (table sizes,
counter widths, port counts, licence counts, address space, inode counts, TCAM entries) and a
projected date of arrival. **Converts a category of invisible future failures into a visible
calendar**, and it is the natural late-game partner to the doc's `Postcard from the Future / Capacity
Forecast`.

#### The Escalation Ladder (vendor relationship as a mechanic)
Each vendor has a ladder: L1 → L2 → TAC engineer → named account SE → the person who wrote the code.
Your **Vendor Relationship** stat, your support tier, and whether you have ever filed a *good* ticket
(reproducible, with logs, in their format) determine how many rungs you skip. Filing good tickets is a
purchasable staff skill. **A progression system built entirely out of being professional to
strangers.**

### 5A.2 New unlock triggers (scar-driven, in the doc's own style)

- **First unidirectional link failure** → unlocks link-verification protocols and the
  "is-it-bidirectional" check.
- **First microburst-caused drop with a flat graph** → unlocks fine-grained interface telemetry and
  the **telemetry resolution dial**.
- **First thin-pool exhaustion** → unlocks storage reservation policies and pool-level alerting.
- **First "nothing changed" incident** → unlocks the Growth Ceiling overlay.
- **First internal certificate expiry** → unlocks certificate inventory.
- **First time your alerting path was down with the service** → unlocks out-of-band alerting.
- **First time you needed a switch config you didn't have** → unlocks network config backup.
- **First incident where three engineers duplicated each other's work** → unlocks Incident Command.
- **First RFO demanded** → unlocks structured timeline capture and the evidence system.
- **First time a customer's pentest found something you didn't** → unlocks the Bug Bounty node early.
- **First break-glass need** → unlocks the break-glass safe (and, brutally, only *after* the level
  where you needed it).
- **First BGP dampening** → unlocks "administratively shut a flapping session" as a first-response
  action.
- **First counterfeit/grey-market part failure** → unlocks a procurement provenance policy.
- **First decommission that broke something** → unlocks the Scream Test.
- **First warranty-expiry incident** → unlocks the support-contract planning view with expiry dates
  across the fleet.
- **First DR declaration you could not honour** → unlocks the DR oversubscription model and priority
  tiering (and a scar).
- **First time the lab became production** → unlocks environment tagging and a hard "production" flag.

### 5A.3 A new unlock *shape*: Capability vs Permission

The doc's tree is "can I afford it / have I been hurt by it." Add a third gate that is very real:
**am I allowed to?**

**How it works:** Some nodes require an external permission you cannot buy directly — an ASN and
address space from a registry (with a justification process), a root-program inclusion, an ICANN
accreditation, a carrier interconnect agreement, an ASV scanning vendor's approval, a sanctions
licence, a payment processor's underwriting decision, a mailbox provider's feedback-loop enrolment.
Each takes **calendar time and a clean history**, cannot be rushed with money, and can be **revoked**.
This makes §6.1's *Trust-with-upstreams* currency into an actual progression axis rather than a hidden
stat, and it explains why a well-funded new entrant cannot simply buy their way to parity — which is
the truest thing about this industry.

---

## 6. Economy, money, and scoring

### 6A.1 New cost structures

#### The Demand Charge (the 95th percentile of electricity)
The single best unmodelled cost in the document, and it rhymes perfectly with the one that *is*
modelled.

**How it works:** Commercial electricity is billed on two axes: **energy** (kWh consumed) and
**demand** (your single highest 15-minute average kW draw in the billing period, which then sets a
charge for the whole month — and in many tariffs **ratchets**, setting a floor for the next eleven
months). So one afternoon of simultaneous GPU ramp can cost you money every month for a year, even
though you consumed almost nothing extra.
**Mechanically:** a peak marker on the power graph with a ratchet line that stays. Counters are
exactly the interesting ones: **staggered startup**, power capping, thermal/battery storage used for
peak shaving, scheduling batch work off-peak, and the doc's existing demand-response contracts.
**Why it's excellent:** it makes the doc's `GPU: The Synchronized Ramp` a *financial* event as well as
an electrical one, gives batch-vs-interactive workload mixing a hard number, and teaches a real
operator cost that almost nobody outside the industry knows exists.

#### kVA vs kW, power factor, and the 80% you can actually sell
Colo power billing has three different numbers and customers conflate them.

**How it works:** You sell a "20A 208V circuit" = 4,160 VA nameplate. The continuous-load derate means
the customer may only draw 80% = ~3,328 VA. Power factor (0.95 typical, worse with older or
lightly-loaded supplies) means the *real* power is lower still. So **the number on the contract, the
number the customer can use, and the number you pay the utility for are all different**, and the gap
is a recurring source of disputes and of your margin.
**Mechanically:** three readouts on the cabinet power ledger (sold / usable / drawn), and a dispute
event when a tenant's engineer discovers the derate for the first time. Also: **billing on breaker
size vs metered draw** is the single biggest strategic choice in colo pricing and the doc's `Power as
a product` entry should carry these numbers.

#### Lead time as a currency
Formalize it: some things cannot be bought with money, only with **foresight**. A visible Lead Time
Board (§1A.3) with expedite options that are expensive and only sometimes work.
**The scoring consequence:** a level-end stat, **"Decisions made under lead-time pressure,"** which is
a proxy for how far ahead the player was actually planning.

#### Circuit contract liabilities (NRC, MRC, term, ETL)
Circuits and cross-connects carry a non-recurring install charge, a monthly recurring charge, a
**term** (12/24/36 months) and an **early termination liability** equal to the remaining term.

**How it works:** Cancelling a 36-month circuit in month 4 costs you 32 months of payments. This makes
the doc's `The Landlord Renewal` and `The Data Center Move` scenarios *much* sharper: moving isn't just
logistics, it's a stack of contracts with different end dates that never line up. A real operator's
spreadsheet of "when can we actually leave" is a genuinely good puzzle object.

#### Support contract and warranty as an ongoing line
Per-device, per-year, with tiers (next-business-day / 4-hour / 24x7x4 with a parts locker on site) and
a **cliff at year 4** where vendors price you toward a refresh. The doc's spare-parts inventory is the
self-insurance alternative; make them a real either/or with numbers.

#### The RMA pipeline
Failed hardware is not gone, it is **in a state**.

**How it works:** a returned part moves through: fault confirmed → RMA raised → advance replacement
shipped (if your contract includes it) or return-first (if not, you are down until it arrives) →
replacement arrives, sometimes refurbished → the refurb fails again at 2× base rate → the original
must be returned within 10 days or you are billed for it. **Cash, capacity and attention all sitting
in a logistics queue**, and forgetting to return a part is a real and very funny recurring cost.

#### Egress to your own DR site
An expense nobody budgets: continuous replication to a second site is continuous *egress*, and if the
second site is at a cloud provider you are paying their egress rates for your own insurance. Makes DR
architecture a cost-shaped decision rather than a purely technical one.

#### The insurance exclusion that bites
Cyber policies commonly exclude acts attributed to a nation-state, and attribution is made by someone
else after the fact.

**How it works:** You had insurance. The claim is denied on an attribution you cannot contest. The
game should let the player *read the exclusions* if they bother (a document you can click) and should
absolutely punish the player who didn't. Pairs with the doc's existing "it doesn't cover you if MFA
wasn't enforced" exclusion.

#### The letter of credit / deposit
A small hosting company signing a colo, transit or power contract is asked for a security deposit or
a personal guarantee.

**How it works:** Cash locked up for the term, unavailable, and invisible on the P&L. Directly attacks
§6.4's runway. A brutally real early-stage constraint that also explains why small hosts under-buy
redundancy.

### 6A.2 New revenue and pricing mechanics

- **Peering ratio as a cost driver.** See §1A.2. Outbound-heavy portfolios pay more for connectivity,
  which makes acquiring an inbound-heavy line (backup, upload, ingest) a genuine **financial**
  synergy on top of the doc's peak-hour synergy. A rare case where diversification pays a literal
  bill.
- **Transit blend tiering.** Sell "premium network" as a product SKU, priced above your commodity
  tier, backed by actually buying better transit. Makes §2A.2's `Blended Transit Downgrade` a
  competitive weapon as well as a threat.
- **Retrieval and early-deletion fees** (archive tiers charge for reading and for deleting before a
  minimum retention). Excellent margin, maximum resentment, and the source of the industry's worst
  billing-surprise stories.
- **The SLA credit's real shape.** Credits are a percentage of the *monthly fee for the affected
  service*, capped (often at 100% of one month), **must be claimed by the customer within N days**,
  and never approach the customer's actual losses. Model all four properties: most customers never
  claim (a quiet, cynical, entirely true windfall), the ones who do are your biggest, and the credit
  is simultaneously too small to satisfy them and large enough to hurt you. The doc's live-accruing
  SLA meter is great; this gives it teeth *and* a cap.
- **The true-up.** A licensing vendor's annual reconciliation: you deployed more than you licensed,
  and the bill is retroactive plus a penalty. Distinct from the doc's `Licensing Audit` in that it is
  *scheduled and contractual*, not an investigation — you must count yourself, honestly, once a year.
- **Power purchase agreement / hedging.** Lock an energy rate for 1–5 years. A bet: you win if prices
  rise, you eat it if they fall, and your competitor who didn't hedge now undercuts you. Pairs with
  the doc's green-power certification.
- **Unmetered vs 95th vs flat, honestly.** "Unmetered 1Gbps port" in practice means a shared uplink
  with a fair-use clause. Make it a sellable, tempting, contention-ratio-bearing SKU whose failure
  mode is a support argument about the word "unmetered."

### 6A.3 New scoring dimensions

- **Preparedness score.** Computed at level end from things you did *before* you needed them: tested
  restores, exercised failovers, current runbooks, spares on hand, break-glass tested, config backups
  current, lead-time orders placed early. **Scored independently of outcome**, so a player who
  prepared well and got unlucky is told so — which is both fairer and truer than scoring on uptime
  alone.
- **Rebuildability index.** Fleet-average hours-to-rebuild. A single number summarizing technical debt
  in a way an engineer will immediately respect.
- **Detection quality.** Of the incidents that occurred, what fraction did *you* detect first, versus
  a customer, versus a third party, versus never? **"Found by customer: 4 of 7"** is the most damning
  line the score screen can print, and it's the number real operations teams actually track.
- **Toil hours.** Total hand-time spent on repetitive manual work, shown next to the automation you
  could have bought.
- **Near-miss ledger.** Things that almost happened: the second drive that failed two days after the
  rebuild finished, the circuit you ordered three weeks before you needed it, the breaker that peaked
  at 79%. **Surfacing luck explicitly** is a wonderful, humbling score element and it makes the
  Blast Radius Rating land harder.
- **Cost per served unit.** Dollars per thousand requests / per player-hour / per GB restored / per
  GPU-hour delivered, per line. The one number that lets you compare a colo line to a shared line
  honestly.

---

## 7. Core gameplay mechanics

### 7A.1 Telemetry Resolution (the most important new mechanic in this report)
**Every graph in the game has a sampling interval, and the interval determines what is true.**

**How it works:** Each monitoring buildable has a **resolution** stat — 5-minute averages, 30-second,
1-second, per-packet. Phenomena exist at each scale and are **invisible above it**: microbursts
(sub-second), request-level latency outliers (per-request), thermal transients (seconds), the
95th-percentile bill (5 minutes), capacity growth (days). A player watching 5-minute averages and
dropping packets sees a flat green line and is *not being lied to* — they are looking at a true
average of a situation that is not average.

**Why it's a great mechanic:**
- It gives observability upgrades a *qualitative* payoff instead of a numeric one: you don't get a
  better graph, you get **access to a class of phenomena**.
- It makes "the graph says it's fine" a legitimate, defensible, wrong position — which is the actual
  texture of the job.
- It costs real money in a real way: higher resolution means more storage and more ingest, so the
  player is trading retention against resolution (**you can keep a year at 5 minutes or a week at one
  second, not both**) — a genuinely interesting purchasing decision that has never been in a game.
- It pairs with the doc's excellent p50/p95/p99 note: percentile *and* resolution are two orthogonal
  axes of "which truth am I looking at."
**Interacts with:** §6.3 (95th percentile billing is a resolution artifact), §2A.2 (microbursts),
§7.6 (fog of instrumentation), §4.6 (monitoring layers).

### 7A.2 The Two Diagnostic Modes: "What changed?" vs "What grew?"
Make the game's diagnosis loop explicitly bimodal, because real diagnosis is.

**How it works:** When an incident starts, the player chooses a line of inquiry. **Change-driven**
uses the Change Correlation overlay (§5A.1) and is right most of the time. **Growth-driven** uses the
Growth Ceiling overlay and is right when nothing changed. Picking wrong costs time; the tell is
whether the onset was a step function (change) or a curve reaching a knee (growth). **Teaching a
player to read the shape of the onset is a real skill and a beautiful, teachable, purely visual
mechanic.**

### 7A.3 Stop The Robots
An emergency verb the doc doesn't have: **pause your own automation.**

**How it works:** During an incident, the first correct action is often to freeze the autoscaler, the
orchestrator's reconciliation loop, the config-management run schedule, the auto-remediation rules,
and the failover logic — because otherwise your automation will keep "fixing" things while you try to
diagnose, and its actions will be indistinguishable from the failure. One button, instant, with a
visible cost: everything you automated stops helping too.
**Great consequence:** if you forget to un-pause it afterwards, you spend the next level running
manually without realizing it, until the first thing that should have auto-healed doesn't.
**Interacts with:** §4.6 (Auto-Scaler, Config Management), §2.9 (the bad fleet-wide playbook), §7.5.

### 7A.4 The Verification Step
Every action in the game currently *happens*. Add: every action can be **verified**, and verification
is a separate, skippable, time-consuming step.

**How it works:** Reboot a machine → it comes back; verify → discover the service didn't start,
because it was never enabled at boot. Fail over → traffic moves; verify → discover the failover
target is running a config from before the last change. Restore a backup → it completes; verify →
check the data is actually there. Skipping verification is free and fast, and the failures it would
have caught surface **later, at a worse moment, attributed to something else.**
**Why:** "it seemed to work" is the root cause of an enormous fraction of real second-outages, and it
is the one habit that separates a senior engineer from a fast one. Mechanically it's a per-action
toggle with a time cost, and the game should track a **verification rate** stat.

### 7A.5 The Reboot Roulette (state you didn't know you had)
Machines accumulate **uncommitted state**: a service started by hand and never enabled, a firewall
rule added at runtime and not saved, a mounted filesystem missing from `fstab`, a kernel module
loaded manually, an IP added with `ip addr` and never put in a config, a `sysctl` set for a test.

**How it works:** A per-machine hidden stat, **Boot Confidence**, that *decreases* every time you make
a live change without persisting it. Rebooting a machine with low Boot Confidence risks it not coming
back correctly — and this is discoverable in advance only by a **config-persistence audit** or by
rebooting it deliberately during a maintenance window (which is exactly why people reboot things on
purpose). The doc's `The Legacy Box` with 1,847 days of uptime is the extreme case; this generalizes
it into a stat every machine carries.
**Best beat:** an unplanned power event reboots the whole fleet at once and you find out your Boot
Confidence across forty machines simultaneously.

### 7A.6 The Dependency Order of Recovery, made concrete
The doc has `Recovery order matters`. Give it teeth with the real trap: **circular dependencies
during cold start.**

**How it works:** Your DNS server needs storage; storage authenticates against LDAP; LDAP needs DNS.
Everything is fine forever until the day all three are off at the same time, at which point none of
them can start. The counter is a **static bootstrap path** — hard-coded IPs, a local hosts file, a
cached credential — which is ugly, unfashionable, drifts out of date, and is the only thing that lets
you come back from zero. **The player should have to draw their own bootstrap order and then be told
it has a cycle in it.**
**Great UI:** a cold-start dependency graph view that highlights cycles in red, purchasable as an
analysis and hilarious the first time you run it.

### 7A.7 Simultaneity and the correlated-event rule
Give the wave generator a rule the doc doesn't state: **events are allowed to correlate, and the
player is allowed to know the correlation exists.**

**How it works:** A heatwave raises cooling load, raises power price, raises hardware failure rate,
raises the chance of a utility event, and raises your neighbours' demand — five effects from one
cause. A ransomware wave causes many DR declarations. A widely-deployed vulnerability causes every
customer to patch at once, which causes a reboot storm. **The design rule: a correlated event should
be readable as one cause with many arms, not as five unlucky rolls**, and the post-mortem should draw
the arms.

### 7A.8 Granularity of sacrifice
The doc's `The Sacrifice Decision` and `Big Red Button` are all-or-nothing per customer. Real triage
has a ladder, and the ladder is the gameplay.

**How it works:** Ordered from cheapest to most brutal — disable an expensive feature → serve stale
cache → shed anonymous traffic → shed a specific endpoint → rate-limit one tenant → rate-limit one
tenant's *worst* endpoint → null-route one IP of theirs → null-route their whole allocation → suspend
them. Each rung is a separate, clickable, reversible action with a different cost in revenue,
reputation and contract exposure, and **the skill is choosing the lowest rung that works.** Players
will reach for the bottom rung first and learn not to.

### 7A.9 The Blast Radius of a Person
Blast radius (§7.1) is computed for components. Compute it for **humans** too.

**How it works:** Hovering a staff member highlights every system only they can safely touch, every
runbook only they have exercised, every customer relationship only they hold, and every credential
only they possess. **It is the bus-factor stat rendered as the same visual language as the
infrastructure one** — and it makes the doc's `Vacation mechanic` and `Key Person Risk` into a spatial
problem you can look at and fix.

### 7A.10 Two clocks on every action: wall time and staff time
Refine the doc's excellent "actions cost time, not mana."

**How it works:** Separate **duration** (how long until it's done) from **attendance** (how much of
that duration occupies a hand). A RAID rebuild is 19 hours of duration and 0 hands. A restore is 4
hours duration and 0.2 hands (you check on it). A cable trace is 40 minutes duration and 1 full hand.
An `ALTER TABLE` is 40 minutes duration, 1 hand, and **you may not do anything else on that system.**
This one split makes scheduling genuinely strategic: you learn to start long unattended jobs before
you start short attended ones, which is the actual rhythm of a maintenance window.

### 7A.11 The Fit Check
See §4A.2's rails and cage nuts. Mechanically: placement validates against **depth, rail type, hole
type, weight, PDU clearance, cable-arm room, and airflow direction**, and a failed check costs time
rather than blocking. A **side-exhaust switch placed in a hot-aisle-contained rack** should be
allowed, and should silently degrade the thermals of the two devices next to it until the player
turns on the airflow overlay and sees why.

### 7A.12 The reversible / irreversible / *delayed*-irreversible triad
The doc marks one-way doors. Add the third and nastiest category: **actions that are reversible now
and become irreversible later.**

**How it works:** A DNS TTL change is reversible until it propagates. A deleted snapshot is
recoverable until the pool reclaims the blocks. A suspended customer is restorable until the
retention window passes. A rotated key is recoverable until the old one is purged. A migrated
database is rollback-able until the first write lands on the new side. **The UI should show a
shrinking reversibility window**, which turns "decide now or lose the option" into a visible timer and
is one of the most authentic pressures in the job.

---

## 8. Visuals and presentation

### 8A.1 The back of the rack, properly
The doc already says the back of the rack is a distinct view, which is exactly right. Specifics that
make it *read* as authentic:

- **Two colours of power cord** going to two PDUs, and the single-corded machine is instantly visible
  as an asymmetry — you can audit power redundancy **by looking**, with no overlay.
- **Cable arms** that swing out when a machine is pulled forward, and the machine whose cabling is too
  short so pulling it forward disconnects it — a visible hazard.
- **Velcro vs zip ties**: a purely cosmetic choice that is also a small MTTR modifier, because you can
  re-dress velcro and you must cut a zip tie. Players will have opinions. Let them.
- **Fibre bend radius**: a cable kinked tighter than its minimum radius renders with a small red arc
  glyph and produces intermittent errors. The most satisfying "look closely and you can see the bug"
  detail available.
- **Dust filters** that visibly discolour on a schedule.
- **The PDU mounted where the rail screws go**, so one specific U cannot be used. A one-time
  installation mistake you live with forever.

### 8A.2 Airflow direction as a visible object property
Each device carries an **airflow arrow** on its silhouette: front-to-back (correct), back-to-front
(some network gear, and reversible fan trays are a purchase), or **side-to-side** (most switches,
which is the real problem). In the airflow overlay, a side-exhaust switch blows visibly into its
neighbour's intake. **This is a genuine, common, invisible-until-you-know thermal problem and it makes
a beautiful spatial puzzle** — the correct answer is a side-to-front duct kit, which is a real product
you can buy and looks funny.

### 8A.3 The Telemetry Resolution zoom
A signature animation for §7A.1: the player grabs a graph's time axis and **zooms into the timebase**,
and as the resolution increases, a flat green line **resolves into a forest of spikes** that were
always there. Doing this for the first time — discovering that your calm average was hiding a
sawtooth — should be one of the game's genuine gasps, and the same animation works for the 95th
percentile, for microbursts, for latency percentiles and for power demand.

### 8A.4 The Demand Ratchet marker
On the power graph: one spike, and a horizontal line drawn from it **to the right edge of the year**,
labelled with the money it costs every month. A single visual that explains an entire tariff
structure.

### 8A.5 Thermal ride-through as a draining reservoir
When cooling fails, don't just start heating things — drain a visible blue reservoir whose size is the
thermal mass you bought. Containment makes the reservoir *smaller* and the racks cooler, which is the
counterintuitive tradeoff rendered in one image.

### 8A.6 The "phantom cabinet"
An empty cabinet, lit, with your asset tag on the door and an invoice glyph floating above it, found
during `The Reconciliation`. **Paying rent on nothing, rendered.**

### 8A.7 The noise problem
The datacenter hum in §8.11 is atmosphere. Make it a *mechanic* once: in the hot aisle at Z1, the
ambient is loud enough that **the pager's audio cue is masked**, and staff wear ear defenders. A
short, funny, completely authentic beat — you missed the page because you were standing in the room
the page was about.

### 8A.8 Cold-aisle breath and the hoodie
The cold aisle is genuinely cold: visible breath at Z1, techs in hoodies, and a small space heater
under a desk in the NOC that is plugged into something it absolutely should not be. One frame of
set-dressing that says "this is a real building" better than any amount of grime.

### 8A.9 The elevation-vs-reality diff
An overlay that draws the *documented* rack elevation as blue linework over the *actual* contents.
Mismatches highlight. Running it in an acquisition level is a horror show. Running it in your own
facility after two years is a quieter horror show.

### 8A.10 The cage nut
A micro-animation for racking: the cage nut, the cage nut tool, and — occasionally — a tiny red
particle. Every person who has done this will make a noise. It costs four frames.

### 8A.11 Link LED colour language
Port LEDs encode negotiated speed by colour (a real convention), so a 10G port that negotiated 1G is
**the wrong colour** and visible from across the rack without an overlay. The duplex/speed mismatch
threat becomes findable by eye, which is exactly the kind of "reward the player for looking" design
the doc already does well with the loose cable.

### 8A.12 The DR Declaration board
For the DRaaS line: a physical board of customer name cards, each flipping from green (standby) to
red (DECLARED) with a timestamp. Watching cards flip during a regional event, while the capacity bar
at the bottom fills, is the level.

### 8A.13 Dead Air
For playout: a single, enormous, unmissable **black frame with a silence meter**, and a countdown
labelled TIME TO DEAD AIR that is always on screen. The visual restraint is the point — the scariest
HUD element in the game should be a number counting down next to a black rectangle.

### 8A.14 The Fresnel zone
For WISP: a translucent ellipse drawn between two towers, with terrain and vegetation intruding into
it. Seasonal leaf-on visibly narrows it. **Line of sight rendered as a volume rather than a line** is
both correct and unusual.

### 8A.15 The half-dead link
Render directionality: a cable's flow pulses have a direction, and a unidirectional failure shows
pulses going one way and **none coming back**, while both end LEDs stay green. A player who learns to
look for return pulses has learned something real.

---

## 9. Anything else

### 9A.1 Modes and twists

#### "The Handover"
A mode built entirely on the most under-dramatized moment in operations: the shift change.

**How it works:** You play the second half of an incident that someone else started. You inherit their
notes (which are incomplete), their half-finished actions (one is still running and you don't know
what it does), their hypothesis (which is wrong), and their customer communications (which promised
something). Scored on how quickly you discover the wrong hypothesis. The co-op version is already
gestured at in the doc's `Co-op NOC`; the **single-player version is better**, because the game can
author the previous shift's mistakes deliberately.

#### "Outage Bingo"
A joke card that is also a taxonomy: a 5×5 grid of "it was DNS," "expired cert," "disk full," "someone
deployed on Friday," "it worked in staging," "the backup was of the wrong volume," "the redundant pair
was on the same PDU," "nobody had the vendor's phone number." Fill a line for a cosmetic. **It teaches
the bestiary by being a joke about the bestiary.**

#### "The Postmortem Reading Room"
A permanent in-game library of incident write-ups — from your own campaign, from NPC competitors, and
from fictionalized versions of the industry's famous public postmortems. Reading one during peacetime
converts quiet time into Intel. **It models the actual mechanism by which operations knowledge is
transmitted between companies**, and it makes the doc's `Historical Scenarios` mode into a permanent
system rather than a level pack.

#### "Nobody Is Coming" (the solo-operator modifier)
A run modifier where you never hire. Every hand is yours forever; every automation is the only way to
scale; vacations are impossible; and the campaign's win condition shifts from growth to
**sustainability**. Explicitly a mode about whether you can build something that doesn't need you —
which is the actual ambition of most one-person hosting companies and a genuinely different game.

#### "The Quiet Handoff" ending
An alternative to the doc's Exit endings: you hand the company to your team and leave. The final
screen is your infrastructure running fine without you, with a `Days Since Last Outage` counter that
keeps going up after the credits start. **The best ending available for a game with this thesis.**

#### The Uptime Superstition system
Emergent, player-authored folklore. The game tracks which machines happened to be involved in
incidents and lets staff attach **hand-written sticky notes** — "DO NOT REBOOT", "this one is fine,
actually", "ask Priya first", "cursed". The notes persist across levels and are generated from real
event history, so they are sometimes correct and sometimes pure superstition, and **the player cannot
tell which**. Extends the doc's `Hardware Lottery` from a stat into a culture.

#### The "It's Fine" counter
A small, dry, permanent stat: the number of times the player dismissed an alert that later turned out
to matter. Never shown during play. Shown once, at the end of the campaign.

#### "Turn It Off And See"
An achievement family for the Scream Test: *"Scream Test: 7 days"*, *"Scream Test: 30 days"*,
*"Scream Test: Fiscal Year End"* (survive a machine you powered off in June until the January batch
run doesn't fire).

### 9A.2 Tone and humour (operator-recognition tier)

- **The ticket that just says "it's slow."** Already in the doc — add its siblings: the ticket with a
  photograph of a screen, taken at an angle; the ticket that is a forwarded email chain 14 replies
  deep with no question in it; the ticket titled "URGENT" sent at 4:55pm on Friday describing
  something that has been broken since Tuesday; and the ticket that says "I didn't change anything"
  attached to a diff.
- **The vendor hold music**, per vendor, as an actual recurring audio motif. Players will learn to
  dread one of them.
- **The maintenance notification** nobody reads, followed by the customer who complains about a
  maintenance they were notified of four times, followed by the *one* customer who read it and asks a
  question you hadn't considered and is right.
- **The label maker running out of tape** exactly halfway through a row, so half a rack is
  beautifully labelled and half is masking tape and Sharpie. **The masking tape should persist for
  the rest of the campaign.**
- **The cable colour war.** Two engineers have different conventions. Both are internally consistent.
  Neither will budge. The game should never resolve it.
- **`fix.sh`** — already in the doc under The Legacy Box, and it deserves promotion: a file that
  appears on exactly one machine in every campaign, whose contents are never shown, and which the
  game will not let you open.
- **The certificate whose CN is `localhost`**, in production, working, for four years.
- **"Restart it."** A support macro that resolves 60% of tickets, is deeply unsatisfying, and is
  correct.

### 9A.3 The educational payload, sharpened

The doc's `Field Notes` and `"was that real?"` tag are excellent. Two additions:

- **The Order of Operations card.** For each incident type, after you resolve it, the game shows the
  canonical first five actions a good operator would have taken, compared to yours, in order. Not a
  grade — a comparison. **This is the single highest-value educational artifact the game could
  produce**, and it is free because the game already has both timelines.
- **The Unit Conversion drawer.** A permanent reference that makes the game's numbers real: nines to
  minutes, Mbps to GB/month, amps to kW to annual dollars, TB to rebuild-hours, RPO/RTO to business
  impact, latency to conversion-rate delta. Every one of these conversions is something a working
  operator does in their head and nobody outside the industry can do at all. Putting them in one
  clickable drawer is how the game teaches its own numeracy.

---
---

# PART B — IMPROVEMENTS AND EXPANSIONS

*Each item names the existing heading it modifies.*

---

## 1. Levels, scenarios, and progression

### → §1.1 "Tier 2.5 — A Rack Of Our Own" / §1.1 "Tier 2 — Two U in Someone Else's Cage"
**Missing constraint: lead time.** Both tiers assume you buy a thing and it arrives. Add the circuit
order (60–120 days), the cross-connect order (5–20 business days, plus an LOA/CFA paperwork step where
you must get a document from the *other* party), and the hardware order (2–12 weeks, longer for
anything with a GPU or a specific drive). **The first time a player cannot solve a problem with money
because the answer is "eight weeks" is a formative moment**, and Tier 2 is where it should happen,
cheaply and survivably.

### → §1.1 "Tier 5 — Anycast / The Map"
The entry says "two datacenters is the most dangerous number of datacenters (quorum needs three)" —
correct, and it should immediately offer the cheap correct answer rather than implying you need a
third site. **You need a third *failure domain*, not a third datacenter**: a witness node the size of
a postage stamp, in someone else's building, for $20 a month. Add the Witness/Tiebreaker buildable
(§4A.1) here, and make the level's teaching beat be that the player *over-solves* the problem
expensively before discovering the cheap answer.

### → §1.1 "The difficulty comes from coupling, not HP"
Excellent rule. Add a sixth rung, which is the real endgame: **(6) failures in systems you do not
operate and cannot see at all** — your upstream's upstream, a shared BGP route server, a cloud
provider's control plane, a certificate authority's compliance process, a root DNS operator, a
payment network. At Tier 5–6 a growing share of your incidents should have **no action available
except communication**, and the skill being tested becomes "how fast can you correctly determine that
this is not your problem, and how well do you tell people."

### → §1.2 "The New Hire"
Strengthen with a specific, better verb. Right now investigation is an abstract time cost. Give the
new hire the three tools a real new hire uses: **read the runbooks** (which are wrong in interesting
ways), **read the tickets** (the last six months of tickets tell you exactly which systems are
fragile — a brilliant, free, underused information source), and **ask someone** (which costs *their*
hand, not yours, and whose accuracy depends on their morale and tenure). The ticket-archaeology tool
is the best of the three and doesn't exist anywhere in the doc: **historical support tickets are the
highest-signal documentation in any hosting company.**

### → §1.2 "The Datacenter Tech"
Add the two things that actually dominate that job: **the ticket is ambiguous** (already noted in
§2.12's Colo entry — connect it) and **the part is wrong**. A remote-hands job where you arrive with
the wrong rail kit, the wrong optic (LR vs SR, a real and constant confusion), a cable six inches too
short, or a drive caddy that doesn't fit the chassis generation. Each is a trip back, an hour, and a
customer waiting. **"Did you bring the right thing" is 40% of that job.**

### → §1.3 "Restore Point / The Vault — Backup / archival / DR hosting"
This entry conflates backup with DR. They are different products with different economics and
different catastrophes, and the doc loses a whole level by merging them. **Split it**: keep this as
backup/archival (window, verification, bit rot, restore time), and add DRaaS separately (§1A.1
"Declaration Day") whose scarce resource is **oversubscribed standby capacity** and whose catastrophe
is *correlated declarations*. The two share art and share nothing else.

### → §1.3 "Rack 4 Is 40 Kilowatts — GPU / AI compute"
Three corrections and one addition.
1. **"A PSU sag under synchronized load"** is right but underspecified: the electrical event is
   primarily an **inrush/step-load** problem at the breaker and UPS, not at the PSU. The mechanic
   should be a **ramp-rate limit** — the player configures how fast jobs are allowed to start, trading
   scheduler throughput against electrical safety. That's a better and more real dial than a random
   event.
2. Add the **demand charge** (§6A.1). The synchronized ramp should set a monthly peak that costs money
   for eleven more months. It turns a one-second event into a recurring line item, which is exactly the
   kind of delayed consequence the doc's P10 wants.
3. **Liquid cooling** deserves its specifics: the failure mode that matters most is not a dramatic
   burst but a **slow drip at a quick-disconnect**, plus **coolant chemistry** (the wrong fluid, or
   biological growth in a poorly treated loop, clogging cold plates months later) and the fact that a
   **CDU is a single point of failure for a whole pod** unless you bought two. Add a "coolant
   condition" maintenance stat.
4. Add **rack weight**: a fully populated GPU rack can exceed 1,500kg and the floor loading, the
   freight elevator and the route from the dock are real constraints. The doc mentions raised-floor
   weight limits as a joke in §2.8 — GPU is where it stops being a joke.

### → §1.3 "Eleven Nines / Bucket — Object storage"
The entry says the nightmare is "a bug in the software layer that corrupts consistently across all
replicas, which redundancy cannot save you from." Correct and excellent. Add the second, more common
nightmare: **the metadata layer, not the data layer.** Object stores lose availability far more often
through metadata/index problems (a small-file flood, a hot shard, an index rebuild) than through drive
loss. And add the operational truth that makes durability real: **the scrub must complete faster than
the failure rate**, so at large enough scale you are always rebuilding something, and the interesting
stat is not "how many copies" but **"can I finish verifying everything before it changes."**

### → §1.3 "Amps and Aisles / Cage 7 — Colocation landlord"
Two additions that are the daily reality of that job and are missing:
1. **The access-list problem.** Every tenant has a list of people allowed into their cage. The list is
   never current. A tenant's contractor arrives at 2am with a truck and is not on it, and the tenant's
   authorized contact is not answering. **You are the one who says no, at 2am, to someone whose
   business is down.** A perfect recurring decision card with no good answer.
2. **The deliveries.** Tenant gear arrives at your dock addressed to a person who doesn't work there,
   with no cabinet number, in seven boxes of which one is missing. Receiving, storing, and staging
   other people's hardware is a real service line (you can charge for it) and a real cost.

### → §1.5 "Power Event / Black Start"
The restoration sequence is under-modelled and the real trap is missing: **inrush.** When power
returns, every device tries to start simultaneously and the combined inrush current is several times
the steady-state load — which trips the breaker again, sometimes repeatedly. The correct procedure is a
**staged restart**, rack by rack, with a wait between stages, which is slow and agonizing while
customers are down. Make this the level's central puzzle: the player wants to turn everything on and
must not. Pairs with 7A.6's cold-start dependency cycle for a genuinely excellent recovery level.

### → §1.5 "Cooling Failure / Heatwave"
Add the ride-through mechanic (§4A.2) and correct the timescale. "You have minutes, not hours" is
right for a dense modern room and wrong for a lightly loaded one — **the time you have is a computable
function of heat load and air volume**, which is exactly the sort of number this game should let the
player know in advance and then watch drain. Also: the emergency action list should include **raising
the setpoint** and **shutting down non-critical load to buy time**, which are the two moves real
operators actually make, and **propping the doors** should be explicitly worse than it sounds (you're
now pulling unfiltered, humid, uncontrolled air into the room).

### → §1.5 "Rebuild Window"
Sharpen the numbers and the real decision. A 19-hour rebuild is right for a modern large-drive array;
add the **rebuild priority dial** (fast rebuild = slower production; slow rebuild = longer exposure
window), which is the actual knob and a much better decision than "now or 3am." And add the real
second option almost nobody models: **restore from backup to new hardware in parallel** while the
rebuild runs, so you're racing two recoveries and paying for both.

### → §1.5 "The Fiber Cut"
Add the detail that makes diverse-path redundancy meaningful: **you cannot verify diversity yourself.**
Two carriers can sell you "diverse" circuits that share a conduit, a bridge crossing, or a manhole,
because carrier A leases from carrier B without telling either of you. The game should offer a
purchasable **path audit** (expensive, slow, sometimes returns "we cannot confirm") and should
occasionally reveal, at the worst moment, that the audit you didn't buy would have found a shared
segment. **"You bought two circuits and own one path" is the single most common redundancy lie in the
industry.**

### → §1.5 "Zero-Day Sunday / Zero-Day Tuesday"
The entry says "the player's whole fleet is flagged vulnerable and they must triage patch order." That
skips the hardest and most realistic phase: **determining whether you are affected at all.** Insert a
discovery stage before triage. Without a software inventory/SBOM (§4A.3), finding every instance of a
library — including the one bundled inside a vendor appliance, the one in a container image you didn't
build, and the one on a customer's machine you don't manage — takes days, during which mass
exploitation begins. **The player with inventory tooling starts patching in hour 1; the player without
it starts in hour 30.** That single change makes a boring-but-vital purchase into the hero of a level.

### → §1.5 `Blacklisted / Spamhaus SBL`
Add the part that hurts most and is always forgotten: **you cannot fix this quickly even after you fix
it.** Delisting has a cooldown, some lists require a waiting period after cleanup, and **repeated
listings escalate the penalty**, so a second listing within 30 days is much harder to clear than the
first. Also: the damage continues after delisting because some receivers cache reputation locally for
days. **The recovery curve, not the incident, is the level.**

### → §1.6 "Legacy debt carry-over" and §9.2 "The Legacy Box"
Give these a stat so they're playable rather than narrative: the **Rebuildability index** (§1A.3).
A legacy object's debt is precisely "hours to recreate this if it vanished," and that number is what
makes the decision to touch it or not a calculation instead of a vibe.

### → §1.7 "Grace Windows"
**This one is both anti-authentic and in direct contradiction with the doc's own systems.** After a
catastrophic failure, real traffic does not stop — it *increases*: retry storms (§2.3), the ticket
avalanche (§2.9), customers refreshing, monitoring systems escalating, and the press arriving. A
30-second window where "nobody is arriving" contradicts `Retry Storm`, `The Ticket Avalanche`,
`Ambulance Chasers` and `The cold-cache thundering herd` simultaneously.
**Fix, keeping the design intent (prevent unrecoverable death spirals):** make the grace window
operate on **attention, not traffic.** On a sev-1, the game automatically groups and suppresses
duplicate alerts, holds low-severity pages, and gives the player one free "focus" hand for 30 seconds.
The world gets *worse* on schedule; the player's ability to think gets temporarily protected. Same
anti-frustration effect, and it teaches incident command instead of teaching something false.

### → §1.7 "Telegraph Depth" vs §2.1 "Nothing announces itself" vs §2.13 "Threat pathing telegraph"
**A three-way contradiction the doc has not resolved.** §2.1 says the player should only ever see
symptoms and must diagnose; §1.7 says the next wave's composition is always visible; §2.13 says threat
pathlines are drawn as dashed magenta trajectories before they move.
**Proposed resolution, which also improves all three:** telegraphing is allowed **exactly in proportion
to how a real operator would see it coming**, which happens to map cleanly onto the doc's own four
bands (§2.1):
- **Weather** — fully visible, always, as a baseline level. You can see the scanner drizzle.
- **Storms** (volumetric floods, scheduled events, launches, patch Tuesdays) — telegraphed, because in
  reality you see traffic building at the edge, or you were told the date. Dashed trajectories are
  fine here.
- **Hunters** (targeted, adaptive, mimic, insider, APT) — **never telegraphed**. Symptom-only. No
  magenta anything until classification.
- **Entropy** — telegraphed *only if you bought the instrument* (SMART, error counters, battery
  capacity tests, thermal imaging). **Foresight is a purchase**, which the doc already says under
  `Disk Failure` and should generalize into the rule.
This turns a contradiction into the game's cleanest information-design law.

### → §1.7 "The Mercy Rule / Consultant Mode"
Small improvement: the greybeard shouldn't mark "the two worst decisions." A real senior engineer asks
**three questions**: what changed, what does the monitoring you *do* have say, and have you checked
that it's actually down. Framing the hint as questions rather than answers preserves the player's
agency and teaches the method rather than the fix.

---

## 2. Threats

### → §2.3 "SYN Flood"
Correct a technical overstatement. The entry calls SYN cookies "a cheap, early, satisfying 'problem
solved forever' unlock," and adds "slightly higher latency for everyone." SYN cookies are not free:
because the server keeps no state, **TCP options negotiated in the SYN are lost or constrained** —
window scaling and selective acknowledgement can be degraded, which disproportionately hurts
**high-latency and lossy clients**, i.e. exactly the doc's Mobile Commuter archetype. So the correct
cost is not "a bit of latency for everyone" but **"a throughput penalty for your worst-connected
customers, only while under attack."** That is a far better fit for the Shared Pipe pillar, and it
means SYN cookies should be a *conditional* defense (armed above a threshold) rather than always-on —
which is also how it actually works.

### → §2.3 "UDP Amplification Barrage"
One addition that changes the counterplay: the correct first response is not always "buy scrubbing,"
it's **ask your upstream to blackhole the target IP** (§4A.1), which is free, instant-ish, and
sacrifices one address. The doc's framing ("you must have a relationship with someone bigger than
you") is right; make the *cheap* version of that relationship available early so the lesson lands
before the player can afford a retainer.

### → §2.5 "Ransomware on the File Server / Ransomware Bloom"
Excellent entry. Two authenticity upgrades:
1. **The dwell time.** Real ransomware sits for days to weeks first — mapping, escalating, exfiltrating,
   and **deleting or corrupting backups** before encrypting anything. The encryption is the *last*
   step, not the first. So the mechanic should be: a Stealth-role unit is present for several minutes
   of gameplay, and the "bloom" is its exit animation. **This makes detection during dwell the entire
   game**, and makes the backup-poisoning entry (which the doc already has separately) into the same
   creature's earlier phase rather than a different threat.
2. **The double extortion.** They took a copy before encrypting. Restoring perfectly from immutable
   backups solves your availability problem and does nothing about the disclosure problem. **A restore
   that works and you still lose** is the most modern and most instructive version of this threat, and
   it forces the player to value the doc's egress-filtering and exfil-detection builds, which
   otherwise have weak payoff.

### → §2.5 "Cryptominer Squatter / Infestation"
Correct one thing and add one. Modern CPU-mining of the kind implied is largely unprofitable; today's
equivalent parasites are **GPU mining on rented AI capacity**, **proxyware** (selling your bandwidth
and IP reputation as a residential proxy — which silently poisons your address space and gets you
listed), and **free-tier CI mining**. Proxyware in particular is a wonderful game threat: **no CPU
signature at all**, the symptom is your IP range's reputation degrading and abuse complaints arriving
for traffic you didn't send. Keep the thermal-odd-one-out puzzle for the CPU version; add the
reputation-odd-one-out puzzle for proxyware.

### → §2.7 "Duplex/Speed Mismatch & Bad Optics"
Add the specific, extremely common failure this entry is adjacent to: **the wrong optic type**. SR
(multimode) vs LR (singlemode) vs the wrong wavelength on a WDM system — link either doesn't come up
or comes up marginal with climbing errors. Also **dirty connectors**, which is genuinely the single
most common cause of fibre problems in the field and whose fix is a $3 cleaning tool. A "clean the
fibre" action that resolves a whole class of intermittent errors is both funny and true.

### → §2.7 "Clock Drift / NTP Failure"
Split into the two distinct failures, because they need different counters. **Loss of time** (your
source is unreachable; you drift) is gradual and detectable by comparison. **Wrong time** (your source
is confidently incorrect, or a step correction is applied) is instant and undetectable from inside.
Add the operational distinction between **slewing** (gradually adjusting, safe) and **stepping**
(jumping, which breaks anything measuring durations and can make a database's timestamps go backwards
— a genuine data-integrity event). And add §2A.4's GNSS spoofing as the "wrong time" boss.

### → §2.8 "Correlated Batch Failure" and §5.2 "First correlated batch drive failure"
The unlock claims Mixed-Vendor Procurement "removes correlated failure." **Overstated — it removes one
class.** Mixing vendors and manufacture dates defeats *firmware-and-batch* correlation. It does nothing
about environmental correlation (same rack, same thermal profile, same power event, same vibration,
same age of service). Suggest the policy reduce the *batch* correlation coefficient specifically, and
introduce a separate, more expensive answer for environmental correlation: **spread redundant copies
across racks, rows and power domains**, which is exactly the doc's own blast-radius mechanic and gives
the two ideas a satisfying relationship.

### → §2.8 "Rebuild Storm / URE During Rebuild"
The reasoning as stated ("the rebuild reads every sector, which is exactly when the latent bad sector
surfaces… array lost. Teaches why RAID5 on big disks is a trap") is the popular version and slightly
overstated — the arithmetic behind "a 12TB rebuild is guaranteed to hit a URE" relies on a spec-sheet
error rate that real drives beat by a wide margin, and most controllers can survive a single URE with
a partial-sector failure rather than dropping the array.
**Keep the mechanic; fix the reason.** The genuine killers are: (a) **rebuild duration** — a
multi-day window during which you have no redundancy, (b) **the performance collapse** during it, and
(c) **correlated age** — the drives are all the same age and the rebuild's sustained read load is the
heaviest work they've done in years. That reasoning supports the same gameplay, survives contact with
anyone who knows the topic, and points at better counters (RAID6/erasure coding, faster smaller
drives, distributed rebuild that recruits the whole pool).

### → §2.8 "Fire Suppression Discharge"
Correct and lovely. Two refinements: the mechanism is the **high-velocity nozzle noise** of an inert
gas discharge, and it affects **spinning disks, not solid-state**, which makes an all-flash rack an
actual, purchasable, thematically perfect mitigation. Also add the **overpressure** problem — a gas
dump into a sealed room can blow out wall panels and ceiling tiles if the pressure-relief dampers are
undersized, which is a comedic and entirely real facility detail.

### → §2.8 "Water Leak / Condensation"
Broaden the source list: the most common cause is **not** the CRAC — it is the floor above (a
bathroom, a kitchen, a sprinkler, another tenant), followed by roof drains, condensate lines that
clogged, and a humidifier. Make the *source* randomized and diagnosable, because "where is this water
coming from" is the actual gameplay and the answer determines whether you can even fix it (you
cannot fix the floor above; you can only place a tarp and file a complaint).

### → §2.8 "Kernel Panic / OOM Killer"
Add the specific, teachable detail: the OOM killer's heuristic targets the process with the highest
score, which is generally **the one using the most memory, which is almost always the database** — so
the victim is the thing you least wanted to lose, every time, by design. The counters
(`oom_score_adj`, cgroup limits, disabling overcommit) are all things you set *before*. And add the
**worse** case: the machine doesn't OOM-kill, it starts swapping, and a swapping database is slower
than a dead one but stays "up," so your health check passes while every request times out. **Alive and
useless is worse than dead** is one of the best lessons in operations and the doc doesn't have it
anywhere.

### → §2.9 "Bad Deploy"
Add the most common real shape, which is missing: **the deploy that only fails at scale or under real
traffic.** It passed CI, it passed staging, it passed canary at 1% — and it fails at 40% because the
failure is a resource exhaustion (connection pool, file descriptors, memory per worker) that only
manifests above a threshold. This makes canary deploys **necessary but not sufficient**, which is more
honest than the doc's current framing where canary basically solves it, and it introduces the
**progressive rollout with soak time** as the actual answer (and a patience cost).

### → §2.9 "Config Drift"
Expand the resolution, not just the problem. Config management fixes drift **only for the things it
manages**, and the interesting failure is the 15% it doesn't: a hand-edited kernel parameter, a
firewall rule added during an incident, a package installed manually, a file the playbook doesn't
template. Add a per-machine **Managed Coverage** percentage, visible on the machine's faceplate, so
the player can see that a "config-managed" fleet is 85% managed and that the drift lives in the gap.
Pairs with §7A.5's Boot Confidence — both are measures of "how much of this machine exists only in its
running state."

### → §2.9 "Alert Fatigue"
Strong entry. Add the specific cure that operators actually use and the doc omits: **alerting on
symptoms, not causes.** A page should fire for "checkout success rate is below 98%" (one alert, always
meaningful) rather than for "CPU on web07 above 90%" (forty alerts, usually meaningless). Model this
as an alert-authoring choice: symptom-based alerts are fewer, higher-signal, and **give you less
information about where the problem is**, so they require better diagnostic tooling downstream. That
tradeoff — fewer better alerts but more diagnostic work — is a genuinely good decision the player
should get to make.

### → §2.9 "The Ticket Avalanche"
Add the multiplier that makes it real: **tickets arrive after a lag proportional to your customer
base's sophistication**, and the volume is driven far more by whether you *told* them than by the
severity. A 40-minute outage with a proactive status-page post and an email generates a fraction of
the tickets of a 10-minute outage with silence. Make the ticket volume an explicit function of
(severity × customers × communication quality), because that formula is the entire argument for the
status page and currently it's asserted rather than modelled.

### → §2.10 "The Chargeback Swarm" / "Processor Termination"
Two factual sharpenings that make the mechanic bite correctly. Card-scheme monitoring programs
threshold on **both ratio and count** (e.g. ~0.9–1.0% *and* a minimum number of disputes per month),
so a very small merchant can sit above the ratio harmlessly while a larger one is enrolled at a lower
ratio. And enrolment isn't instant termination: there's a **monitoring program with monthly fines and
a remediation window**, which is *better gameplay* — a visible escalation ladder with a countdown
rather than a cliff. Also add the counter nobody thinks of: **a recognizable billing descriptor and a
working phone number** measurably reduce chargebacks, because a large share of disputes are customers
who don't recognize the charge. A $0 fix with real effect is exactly the kind of thing this game
should reward.

### → §2.10 "The Concentration Risk Whale"
Add the second concentration nobody models: **supplier concentration.** One transit provider, one
hardware vendor, one control-panel vendor, one payment processor, one cloud region, one colo landlord.
The doc has `Vendor Diversity` as a buildable and `The Vendor Squeeze` as a threat but no *meter*.
Give supplier concentration its own donut next to the customer one — **you can be diversified on
revenue and completely undiversified on dependency**, which is how most hosting companies actually die.

### → §2.11 "Nation-State / APT"
The behaviour described (dormant, quiet, only detectable, damage is narrative) is right. Add the two
things that make it playable rather than purely atmospheric:
1. **They use your tools.** APT activity looks like administration because it *is* administration —
   legitimate credentials, standard utilities, scheduled tasks, the backup agent. The detection signal
   is not "malware" but **"an admin action at an unusual time, from an unusual place, by an account
   that doesn't normally do that."** That makes the counter a *behavioural baseline*, which requires
   history, which requires you to have been collecting logs for months before the incident. A defense
   that must be purchased a long time in advance is a wonderful thing.
2. **You will be told by someone else.** The single most common way an APT is discovered is a phone
   call from a government agency, a vendor, or a journalist. Make that the standard reveal, and make
   the player's **log retention depth** determine how much of the story they can reconstruct — with a
   brutal beat if retention is 30 days and the intrusion is 8 months old: *you will never know what
   they took.*

### → §2.11 "The Researcher / White Hat"
Add the version that is more common and more awkward: **the beg bounty.** Someone emails claiming a
critical vulnerability, refuses to detail it before you agree to pay, and the "finding" turns out to
be a missing HTTP header. Handling it is a small triage decision: pay (invites more), ignore (a small
chance they were real), or publish a security policy that sets expectations. Distinguishing the real
researcher from the beg bounty is a nice, low-stakes, recurring judgement call, and it makes the
genuine researcher feel more valuable when they appear.

### → §2.12 "Colo: The Tenant Who Overloads The Circuit"
Add the enforcement reality that makes this a *business* problem rather than a technical one: you
generally cannot cut a paying tenant's power for overdrawing, because the contract says what it says
and the remedy is billing, not disconnection. So the actual gameplay is: detect (metered PDU), notify,
bill the overage, negotiate an upgrade, and **meanwhile carry the risk on your own breaker**. The most
interesting version: the tenant is over their *contracted* draw but under the *breaker's* limit, so
you are losing money rather than risking an outage — and enforcing it costs you the relationship.

### → §2.12 "Email: The Silent Deprioritization"
Add the mechanic that gives the player *something to do*, because as written it is pure helplessness:
the large mailbox providers publish **postmaster telemetry** (reputation, spam rate, authentication
rates) that is the only window into this. Making that a purchasable/enrollable data source — one that
shows you a number nobody will explain — turns despair into a diagnostic loop. And add the actual
lever: **segment your sending** (separate IPs/domains for transactional vs bulk vs per-customer), so
one bad tenant damages one pool instead of everything. That is the single most important architectural
decision in email hosting and it isn't in the doc.

### → §2.12 "DNS: Water Torture"
Add the counter-side nuance that makes it a real fight: the defense is not just RRL but **NXDOMAIN
synthesis / aggressive negative caching** at your edge, and the cost is that a customer who legitimately
adds a new subdomain waits for the negative cache to expire before it resolves. **A defense that makes
your product slower to change** — perfectly on-theme.

### → §2.12 "Backup: The Encryption Key Nobody Has"
Extend into a full mechanic, because it deserves one: **key escrow is a product decision with a
security cost.** Hold the customer's key and you can always restore them (great support, terrible
breach exposure, and a legal-request surface). Don't hold it and you are sometimes forced to tell a
customer their data is unrecoverable. Give it to them and they will lose it. The three-way choice
should be set per plan tier, visibly, at the Pricing Engine. Pairs with §1A.1's "Zero Knowledge" line.

### → §2.13 "Behaviour mix-ins"
Add three more mix-ins that produce genuinely different encounters from existing assets:
- **Rate-shaped** — the threat's intensity is deliberately held just under your configured threshold,
  which means **the threat's size is a function of your own configuration** and tightening the
  threshold makes it shrink to match. Unsettling and real.
- **Diurnal** — active only during your customers' peak, so blocking it aggressively costs maximum
  revenue, and it's quiet when you have time to investigate.
- **Bounded** — it stops on its own after N minutes regardless of what you do, so the player's real
  score is how much they *spent* responding. Punishes overreaction, which nothing else in the doc
  does.

---

## 3. Visitors, traffic, and clients

### → §3.1 "Latency budget as visitor HP" and "The Latency Ladder readout"
The ladder (`Edge 8ms + WAF 40ms + LB 3ms + App 120ms + DB 200ms = 371ms`) is excellent and slightly
wrong in a way that matters: **latency does not add, it composes, and the interesting part is
variance.** Two improvements:
1. **Show the distribution, not the sum.** The same stack with a 371ms mean can have a 340ms p50 and a
   3,200ms p99 if one hop has a long tail (a GC pause, a slow disk, a lock). Since a request must
   traverse every hop, **tail latency compounds**: with five hops each having a 1% slow path, roughly
   5% of requests are slow. This is the single most important and least-known fact about
   multi-tier latency, and it argues directly for the doc's own "fewer hops" architecture decisions.
   Render it as a ladder with a **whisker on each segment**, and let the player see that the fat
   whisker, not the tall bar, is what's killing conversion.
2. **Round trips, not milliseconds, for distant visitors.** For a visitor 150ms away, the thing that
   matters is how many *round trips* your stack requires (DNS → TCP → TLS → redirect → HTML →
   subresources), because each one costs a full RTT. Make the ladder show **RTT count** alongside
   server time for geo-distant cohorts. It's the correct model, it explains why the doc's
   `Redirect chains` and `TLS handshake cost` entries hurt so much, and it makes CDN purchases obvious
   in a way an ms figure doesn't.

### → §3.1 "Friction Gates"
The flat percentages (CAPTCHA 12%, WAF 3–8%) should be **per-cohort, not global**, because that's
both truer and better gameplay. A CAPTCHA costs almost nothing from a desktop regular on a residential
IP and a great deal from a mobile visitor on carrier NAT, an accessibility visitor, a visitor behind a
corporate proxy, or anyone in a region your bot vendor has poor data for. Model friction as a
**matrix** (defense × cohort) rather than a scalar, surfaced simply as "this defense is costing you
mostly *mobile* customers." **That single change converts a number into a decision**, because now the
player can tune a defense to protect the cohort they care about.

### → §3.2 "The API Client / API Consumer"
Correct and add. The entry says it "retries harder," which is right; add the specific behaviours that
make machine clients uniquely dangerous: **no jitter** (all clients retry at the same interval, so
retries synchronize into pulses), **no circuit breaker** (they will retry forever), **fixed timeouts
shorter than your recovery time** (so they give up, retry, and stack), and **they run in someone
else's infrastructure**, so you cannot fix any of it. The counter — `429` with `Retry-After`, which
well-behaved clients honour — should be a purchasable that only works on *some* clients, with a visible
"share of clients that respect backpressure" stat that slowly improves as you nag integrators. **A
defense whose effectiveness depends on other people's code quality** is a new and very authentic
category.

### → §3.2 "The Uptime Monitor"
Expand: third-party uptime monitors are also a **source of false incidents**. A monitor whose own
network has a problem reports you down, publishes it, and generates tickets from customers who saw
the badge — while you were fine. The counter is the doc's own `The "Is It Actually Down?" check`
generalized to require **N-of-M agreement across vantage points** before believing anything, yours or
theirs. Makes the External Vantage Fleet (§4A.1) meaningful and teaches a real epistemic habit.

### → §3.3 "Colo — a prospective tenant touring the facility"
The best idea in the doc, and it can be sharpened with what tenants **actually** look at, which is
more specific and more damning than "cable management and a clean floor":
- The **single-line diagram** on the wall (and whether you can explain it).
- Whether the UPS bypass is **maintenance bypass** (can you service the UPS without dropping load?) —
  the question that separates a real facility from a room with batteries in it.
- The **fuel contract**, not the generator: how many hours on site, and is your refuelling priority
  contractual or aspirational.
- **Concurrent maintainability**: can you take a CRAC, a UPS, a PDU or a switch out of service without
  losing redundancy? Ask it about each one.
- Whether the **meet-me room** has spare capacity, and who else is in it.
- **The last power event** — they will ask, and the correct answer is a date and a story, not "never."
  ("Never" is either a lie or means you've never been tested, and both are bad answers.)
- Whether your techs know the answers, or have to go get someone.
Making these the actual scored tour questions turns the tour from a tidiness check into an
**architecture exam**, which is what it is, and it retroactively justifies every boring purchase in
§4.7.

### → §3.4 "The Captcha tax / your own defenses"
Add the strongest available version of this, which is missing: **the defense that is invisible to you
because it works before your logs.** A blocked visitor at your edge, at your CDN, at your scrubbing
provider, or at your DNS provider's bot manager **never appears in your application logs at all** — so
the player's own instrumentation systematically under-reports false positives. Model this as a
deliberate blind spot: the false-positive counter only becomes accurate once you buy edge-side
logging. **The game should let the player over-tune a defense and genuinely not be able to see the
damage**, then reveal it later. That's the most valuable lesson in the whole Shared Pipe pillar.

### → §3.6 "The Status Page (honesty as a resource)"
Two additions from painful experience:
1. **Update cadence beats update content.** Customers tolerate "still investigating, next update in
   20 minutes" far better than silence followed by a perfect explanation. Model a **cadence promise**:
   you commit to an interval, and *missing your own stated interval* costs more trust than the outage.
   That's a much better mechanic than a single post's tone.
2. **The subscriber list is an asset.** A status page nobody is subscribed to deflects nothing.
   Growing the subscriber base is a slow, cheap, pre-incident investment that determines the
   ticket-deflection multiplier when it matters. **Preparation for communication, not just for
   infrastructure.**

### → §3.7 "Data Gravity as a retention mechanic"
Add the dark twin the doc gestures at but doesn't mechanize: **data gravity is retention until the day
it's resentment.** Model a per-customer **Lock-In Awareness** stat that rises as their stored data
grows and as they encounter egress pricing. Below a threshold it's pure retention; above it, the
customer begins architecting *away* from you, quietly, over months, and when they finally leave they
leave loudly and write about it. **Making the retention mechanic carry a delayed reputational charge**
is both true and exactly the doc's P10.

### → §3.9 "Client Cards"
Add three stats that operators would immediately want and the card doesn't have:
- **Sophistication** — how good is this customer at diagnosing their own problems? A sophisticated
  customer files fewer, better tickets and catches your problems early; an unsophisticated one files
  more, vaguer tickets and blames you for their own code. It is orthogonal to revenue and it's the
  single best predictor of cost-to-serve.
- **Change rate** — how often do they touch their own environment? A static customer is nearly free; a
  customer deploying twelve times a day generates incidents.
- **Correlation** — does this customer's peak coincide with your existing peaks? Signing a customer
  whose traffic is anti-correlated with your base is worth materially more than the same revenue
  correlated, and this gives the doc's excellent opposite-peak-hours synergy a per-customer version.

---

## 4. Buildables: services and infrastructure

### → §4.1 "Build time and cold start"
Extend the time scale by two orders of magnitude. Current framing is seconds-to-minutes (POST, cache
warm, provisioning). Add the real tiers: **minutes** (provision, boot, warm), **days** (hardware
delivery, rack and stack), **weeks** (vendor lead time, a new hire's start date), **months** (circuits,
audits, certifications, IP allocations, a building permit). And add the asymmetry that defines
planning: **decommissioning is fast and rebuilding is slow**, so every capacity cut is a one-way door
for months.

### → §4.2 "VPS / KVM Node (hypervisor)"
The overcommit visualization (VMs clipping through each other) is great. Add the *metric* that makes
it playable: **CPU ready time** (§2A.3) — a host-side number that is invisible from inside the guest
and is the real experience of overcommit. Also add **memory ballooning and swap-on-the-host**, which
is where overcommit goes from "slow" to "catastrophic," because a host that swaps guest memory to disk
degrades every VM on it simultaneously and the guests' own monitoring shows nothing wrong. **"All of
my customers are slow and none of them can see why" is the signature VPS failure and it isn't in the
doc.**

### → §4.3 "Backup System / Backup Vault"
The push/pull/offsite/immutable taxonomy is exactly right. Three additions:
1. **The 3-2-1 rule as a visible scorecard** — three copies, two media types, one offsite — rendered
   as three pips per dataset. It's the industry's actual shorthand, it's instantly legible, and it lets
   the game show at a glance which datasets are under-protected.
2. **Backup ≠ archive.** Backup is for restoring recent state; archive is for retrieving old state
   under a retention policy. They have different access patterns, different media, different costs and
   different legal weight, and conflating them is how companies end up with 400TB of "backups" they
   can neither restore quickly nor legally delete. Worth one sentence and one separate object.
3. **The restore *rate*, not the restore *time*.** The number that matters is GB/hour of restore, and
   it's usually a fraction of backup throughput because restores are random-access and backups are
   sequential. A customer with 40TB and an 8-hour RTO needs 5TB/hour, which is a network and storage
   design constraint, not a backup-software setting. **Make RTO a computed value from real throughput
   rather than a promise the player types in** — that single change makes the whole backup ruleset
   honest.

### → §4.4 "Out-of-Band Management (IPMI/iDRAC/iLO) + Console Server"
Strong entry. Add the failure that makes it more than a convenience: **the BMC itself hangs.** A
wedged BMC cannot be reset over the network, is unreachable while its host is up, and requires
physically removing power from the chassis. This is the specific case that justifies the **switched
PDU** (§4A.2) as a *separate* purchase, creating a nice three-tier recovery ladder: software reboot →
IPMI reset → outlet power cycle → hands. Each rung costs more and is more certain, and buying the
whole ladder is a real strategy.
Also: the doc says OOB "must be on its own VLAN." Sharpen to **its own physical switch and its own
uplink**, because a VLAN on the production switch dies with the production switch (§2A.2).

### → §4.4 "Second Transit Provider (multihoming)"
Add the unglamorous prerequisites, because they are the actual barrier and they are all lead-time
gated: **your own ASN** (a registry application), **your own portable address space** (increasingly
expensive/leased), **an IRR object and an RPKI ROA** (or your announcement will be filtered), **a
router that can hold a full table** (see the TCAM threshold), and **a maintenance contract on that
router**. The doc treats multihoming as a purchase; it's a *project*, and modelling it as a
multi-month prerequisite chain makes Tier 4→5 feel earned.

### → §4.5 "WAF (Web Application Firewall)"
Correct the latency figure by splitting the object, which also creates a genuinely good decision.
**+40ms on every request** is right for a *cloud* WAF (where the cost is the network detour to the
provider and back) and wrong for an **inline** WAF (1–5ms, but it consumes your own CPU and scales
with your traffic). Ship both:
- **Inline WAF** — low latency, CPU cost that grows with traffic, you own the rules and the tuning,
  and it is in the blast radius of your own outage.
- **Cloud WAF** — meaningful added latency, no CPU cost, DDoS absorption included, rules maintained by
  someone else — **and it only works if your origin IP stays secret**, which the doc already knows
  from its CDN entry. Connect them.
That's a real architectural fork with real numbers and it's currently one blurred object.
Also: a WAF's aggression slider should have a **third position the doc doesn't have — "log only."**
Running in detection mode for two weeks before enforcing is how this is actually deployed, it costs
nothing but patience, and it is the correct answer almost every time.

### → §4.5 "Rate Limiter"
Add the dimension that matters most and is missing: **what you key on.** Per-IP (breaks carrier NAT
and corporate offices), per-session (defeated by clearing cookies), per-account (only works
post-login), per-ASN (blunt but effective against cloud-hosted bots and harmless to residential
users), per-fingerprint (expensive), or per-**cost** (a token budget where an expensive endpoint
consumes more than a cheap one — by far the best answer and the one real operators arrive at last).
Making the *key* a player choice, rather than just the threshold, turns one slider into a real tower
with an upgrade path.

### → §4.6 "Monitoring Stack (purchased in layers)"
The five layers are excellent. Add a sixth that is chronologically first and conceptually last:
**the business-metric check.** "Signups in the last 10 minutes" or "orders per minute" — a single
number that catches every failure mode the other five miss, including the ones where every component
is genuinely healthy and the product is broken (a payment gateway failing, a form validation bug, a
DNS record pointing at a working server that serves the wrong site). **It is the cheapest and most
powerful monitor in existence and almost nobody builds it.**
Also add **retention vs resolution** as an explicit purchase axis (§7A.1): you store a year at coarse
resolution or a week at fine, and choosing wrong means that during a post-incident investigation the
data you need has already been rolled up into an average.

### → §4.6 "Alerting / Pager / On-call Rotation"
Add the two properties that determine whether alerting is useful at all:
- **Every alert must be actionable and must link to a runbook.** An alert with no defined response is
  noise with a pager attached. Model it: alerts you create *without* an attached runbook contribute
  double to the alert-fatigue stat.
- **The alerting path must not depend on the thing being monitored** (§2A.5). Add an out-of-band
  alerting purchase and a **periodic test page** that proves the whole chain works, which is exactly
  the kind of boring ritual the doc's "make the boring thing beautiful" guardrail wants.

### → §4.6 "Status Page"
Sharpen the "must be hosted OFF your own infrastructure" lesson, because there's a subtler trap: the
status page hosted elsewhere but whose **DNS is yours**, or whose **TLS cert is on your ACME
automation**, or which **authenticates against your SSO**. Independence is a property of the entire
dependency chain, not of the hosting location — and that generalizes to the whole game as a rule:
**"is this genuinely independent?" is a graph question, not a location question**, which ties it to
§7.2's four-topologies idea beautifully.

### → §4.7 "UPS"
Add two real properties. **Efficiency mode**: a double-conversion UPS is clean and wastes ~5–8% of
everything it passes; eco/line-interactive mode saves that and adds a transfer time when the utility
fails — so UPS mode selection is a direct, permanent power-bill-vs-ride-through trade, and it should
be a dial. **Bypass state**: a UPS in maintenance bypass is passing raw utility power through and
protecting nothing, which is normal and correct during service and catastrophic if you forget to take
it out of bypass afterwards. A **"UPS in bypass" indicator that stays lit for three levels because
nobody noticed** is a superb slow-burn threat.

### → §4.7 "Generator + Fuel Contract"
Add the failure taxonomy, because "start-failure probability" is too coarse for something this
teachable. Generators fail for specific, preventable reasons: **the start battery** (the single most
common cause, and it is a $200 part), **the block heater** (a cold engine won't start under load),
**fuel filters and fuel age** (diesel degrades in 6–12 months; hence polishing), **the coolant/
louvre/damper interlocks**, and **wet stacking** from low-load testing (§1A.2). Making each a separate,
cheap, boring maintenance line item — with a visible "last serviced" date — turns a dice roll into a
checklist the player either keeps or doesn't. Also add the genuinely funny real one: the generator
starts perfectly and **the ATS doesn't tell it to**, so you sit in the dark listening to a running
generator.

### → §4.7 "Cable Management / Cable Tray / Patch Panel"
Add the constraint that produces the real decisions: **structured cabling is a commitment.** Patch
panels mean every connection costs two patch cables and a port on each side, so you consume ports
three times as fast, and re-patching is a documented change rather than "move the cable." Point-to-
point is faster today and unmaintainable at 200 cables. **The crossover point is around one rack**,
and letting the player feel that crossover — by living with point-to-point until it becomes
unbearable — is better teaching than offering the panel up front.

### → §4.8 "The On-Call Rotation"
The sleep-budget framing is the best staffing idea in the document. Two additions:
- **Rotation size has a hard floor.** Below roughly 4–6 people, on-call is not sustainable at any
  compensation, and the model should make this a cliff rather than a gradient: a 2-person rotation
  degrades both people continuously regardless of incident volume, because the *anticipation* is the
  cost even on quiet nights. **You are paying for the pager whether or not it rings**, and that is the
  single truest thing about on-call.
- **Follow-the-sun is not free.** A 3-region rotation eliminates night pages and introduces **handover
  loss** — context dropped between shifts — which measurably lengthens multi-shift incidents. So the
  humane answer costs MTTR, which is a genuinely hard and genuinely real trade.

### → §4.9 "Cyber-Insurance Policy"
Add the exclusions that actually bite, since the doc already gestures at MFA: **nation-state
attribution** (the big one — see §6A.1), **failure to patch a known vulnerability within the policy's
stated window**, **unencrypted data at rest**, and **acts of your own employees**. Also add that
underwriting is a questionnaire: getting the policy requires *proving* controls, so the insurance
purchase is itself a compliance mini-audit — a nice way to make insurance teach security rather than
substitute for it.

### → §4.10 "DNS Authoritative Pair"
Add the two most common real findings, both of which are free to fix and invisible until they aren't:
**open recursion** (already noted) and **both nameservers in one place** (noted) — plus **zone transfer
(AXFR) open to the world**, which hands an attacker your complete internal naming, and **NS records
that don't match the parent delegation**, which produces the intermittent lame-delegation failure in
§1A.2. A one-click "DNS hygiene check" that finds these is exactly the kind of boring, decisive,
cheap tool this game should sell.

### → §4.10 "Provisioning Automation"
The margin analysis is right. Add the risk the doc names but doesn't mechanize: **automated
provisioning means automated abuse signup at scale**, and the specific consequence is that your
*speed* becomes an attacker's speed. A fraud ring can create 400 accounts in the time it used to take
you to create one. So the correct pairing is provisioning automation **plus** velocity limits plus
fraud scoring, and shipping the first without the other two should reliably produce a bad week. That
makes the doc's "biggest margin lever" also its most dangerous single purchase, which is correct.

---

## 5. Unlocks and discovery

### → §5.1 "Postmortem Research" / "Scar-driven progression"
The principle is the best idea in the document. One structural addition to stop it from being punishing
in a specific way: **you should be able to unlock a counter by seeing someone *else* get hit.** The
real profession learns mostly from other people's outages — that's what conference talks, public
postmortems, mailing lists, and "did you see what happened to them" are for. Add the Reading Room
(§9A.1) and the Vendor's RFO (§5A.1) as **cheap, slow, peacetime alternatives to being hurt**, gated
by time rather than money. This preserves the pain→capability shape while modelling how knowledge
actually propagates, and it gives quiet levels another thing to be for.

### → §5.2 "First backup restore failure → unlocks the Restore Drill"
The trigger is too late. The restore drill should be unlockable **the first time a customer asks you
what your RTO is and you don't know** — which is a sales event, not a disaster. That's both a nicer
progression (the business teaches ops something, for once) and true: most companies start testing
restores because a prospect asked, not because they lost data.

### → §5.3 "Scale milestones"
Add the milestones that mark real operational thresholds and change how the job *feels*:
- **Second person** → you can no longer keep state in one head; you need naming conventions and a
  shared inbox. The first genuinely organizational unlock.
- **~50 machines** → manual patching stops working; this is the number at which config management
  becomes mandatory rather than nice.
- **~150 machines** → hardware failures become a *weekly routine* rather than an event, which changes
  their emotional register entirely and unlocks the spares-pipeline and RMA systems.
- **Two timezones of staff** → handover becomes a system, and the doc's Co-op NOC shift-handoff
  mechanic turns on in single-player.
- **First time you're someone's upstream** → your outage is now on *their* status page, and you
  inherit an obligation to communicate to people who are not your customers.

### → §5.4 "Asset Discovery Scan"
Perfect entry, and it should have a sibling: **the External Attack Surface Scan**, run from outside
instead of inside. It finds what the internet can see of you: a forgotten subdomain, a dev environment
on a public IP, a management interface exposed by a firewall rule added during an incident in 2021, an
S3-alike bucket, a service on a high port nobody remembers, and a certificate-transparency log entry
revealing a hostname you thought was private. **"What does the internet see when it looks at me" is a
different and more alarming question than "what do I own,"** and the doc's §9.2 `You Are the Attacker's
Target Board` twist is exactly this idea — promote it from a twist to a purchasable, repeatable tool.

### → §5.4 "The Runbook Ladder"
The three-times-then-automate progression is the best QoL idea in the doc. Add the trap that makes it
a real decision rather than a free win: **an automated response to a symptom you never diagnosed
hides the problem.** Auto-restarting a service that leaks memory means you never fix the leak, and the
automation quietly masks a worsening condition until it fails in a way the automation can't handle.
So the runbook ladder should have a third rung the player can *decline*: **"automate this" vs
"investigate why this keeps happening."** Automating is cheap and correct most of the time; occasionally
it's how you end up with a machine that has been auto-restarting every 40 minutes for eight months.

### → §5.6 "The prerequisite lattice"
This is the strongest section in the document. Three prerequisites to add, all real:
- **Email hosting** additionally requires **reverse DNS control**, which requires **your own address
  space**, which requires the ASN/registry branch. That makes the email line depend on the network
  line, which is exactly right and gives the network branch a second payoff.
- **CDN/anycast** requires not just PoPs but **a relationship with an IX or transit at each PoP** —
  so the CDN line is gated on the carrier branch, not just on hardware.
- **Regulated hosting** requires **operational history**, not just controls: most frameworks audit a
  *period* (a Type II report covers 6–12 months of evidence), so you must have been compliant for
  longer than you've wanted to be. **A prerequisite measured in months of good behaviour** is the same
  beautiful gate as the email reputation one, and it should be stated as such.

### → §5.7 "The Deprecation Mechanic"
Add the specific EOL that hurts most, because "attracts vulnerabilities" is too abstract: **the
unsupported version blocks something else.** You cannot get the new feature, the compliance control,
the TLS version, the driver for the new hardware, or the security patch, because the base you're on
doesn't support it — so a piece of rot in one place freezes progress in three others. Render it as
**dependency chains greying out**: hovering an EOL node highlights everything it is now blocking.
That's much more motivating than a slowly rising vulnerability number and it's exactly how legacy debt
actually constrains a company.

---

## 6. Economy, money, and scoring

### → §6.3 "Bandwidth: the 95th-percentile bill"
The explanation is correct and is the best cost entry in the document. Three refinements that make it
sharper:
1. **Percentile is usually computed per-direction and the higher of in/out is billed.** So a host
   absorbing an inbound flood pays for inbound even though the product is outbound. That makes a DDoS
   a direct bill increase in a way the entry implies but doesn't state.
2. **Commit-and-burst.** Most transit contracts have a committed rate (paid regardless) and an
   overage rate above it (usually higher per Mbps). So the player is choosing a commit level as a bet
   on their own growth, exactly like the doc's `Reserved Capacity Contract` — connect them.
3. **The 36 free hours are a strategy.** Because the top 5% of samples are discarded, the correct
   operational move is to **schedule bulk transfers — backups, replication, migrations, CDN
   pre-fills — into deliberately concentrated bursts** rather than spreading them out. Spreading load
   evenly, which feels responsible, is the *expensive* choice. That's a delicious, counterintuitive,
   completely real optimization and it should be a discoverable player strategy.

### → §6.3 "Power, PUE, and cooling"
Add the second half of the electricity bill (§6A.1's demand charge) and one nuance: **PUE is seasonal
and load-dependent.** A facility at 30% IT load has a much worse PUE than the same facility at 80%,
because the fixed overhead of cooling and distribution is amortized over less useful work. So a
half-empty datacenter is inefficient *by arithmetic*, which means **occupancy and PUE are the same
problem** and the doc's stranded-capacity entry should link to it. It also means a player's PUE number
improves when they sell more, which is a satisfying and real feedback loop.

### → §6.3 "Support cost-to-serve"
Add the cost driver nobody attributes: **the ticket that requires an engineer.** Tier-1 minutes are
cheap; a ticket that escalates to a senior engineer costs 10–20× because it consumes the scarcest
resource in the company *and* interrupts deep work. So cost-to-serve should be measured in
**escalation rate**, not ticket count, and reducing escalation rate (better docs, better tooling,
better Tier-2 training) is a different and more valuable investment than reducing ticket count. This
also connects it to §4.8's note about understaffed Tier-2 destroying engineering velocity, which is
currently a nice observation with no number behind it.

### → §6.5 "The oversell ratio"
Excellent, and it needs one more dimension to be honest: **oversell has different failure shapes per
resource.** CPU overcommit degrades gracefully (everyone gets slower). RAM overcommit degrades
catastrophically (swap, then OOM). **Storage capacity overcommit does not degrade at all — it stops
dead** (§2A.3's thin-pool cliff). Bandwidth overcommit degrades gracefully. Power overcommit degrades
catastrophically and instantly (a breaker). IOPS overcommit degrades in a hockey stick. **The player
should learn that the same 4:1 ratio is prudent on one axis and suicidal on another**, which makes
one slider into six meaningfully different decisions and is a huge amount of depth for almost no
design cost.

### → §6.6 "Occupancy and stranded capacity"
Sharpen the definition of stranded capacity, because it's the most interesting number in facility
operations and the entry is slightly loose. Capacity is stranded when you hold **one resource without
its complements**: space without power, power without cooling, cooling without space, any of them
without network. The most common real form is **power stranded by density mismatch** — you sold your
kW to low-density tenants who used all your floor, so you have amps left and nowhere to put a
cabinet. Render it as a **three-bar readout per suite (space / power / cooling)** where the shortest
bar is your real capacity and the excess on the other two is drawn as visibly wasted. One widget,
whole concept.

### → §6.6 "Contract length as per-type personality"
The insight is right and it should carry the consequence: **long contracts mean your price is fixed
while your costs are not.** A 5-year colo lease signed before an energy price spike is a slow bleed,
which is why real contracts contain **power pass-through clauses and annual escalators** — and
negotiating those is the single most consequential thing in a colo contract. Make the escalator and
the pass-through clause explicit negotiable terms on the contract card; the player who gives them away
to win a deal finds out in year three.

### → §6.9 "The four-axis scorecard"
Add the axis this lens would insist on: **Preparedness** (§6A.3), scored from what you had ready
before you needed it. And reframe one existing axis: `Uptime / Availability` measured as raw uptime
rewards luck. Measure it as **availability against commitment** (did you hit the SLA you sold?) and
add **error budget consumed**, which the doc already has in §6.8's obligation block but doesn't use in
scoring. A player who ran at 99.95% having sold 99.9% should score *better* than one who ran at 99.99%
having sold 99.99%, because the first one had headroom to spend and the second was lucky.

### → §6.10 "Total data loss"
Nuance the hardest lose condition, because as stated it's binary and real data loss almost never is.
Data loss has a **shape**: how much (one customer / one tenant / one volume / everything), how old
(the last hour / the last week / the archive), and how *provable* (can you tell the customer exactly
what was lost?). The last one is the cruelest and least-modelled: **not knowing what you lost is worse
than losing it**, because you cannot notify accurately, cannot restore selectively, and cannot close
the incident. A partial, ambiguous data loss should be survivable and should leave a permanent scar,
which fits the doc's own soft-over-hard rule far better than an instant game over.

---

## 7. Core gameplay mechanics

### → §7.1 "Capacity as concurrency slots, not HP"
Right, and it needs the second half to be complete: **the slot is released when the slowest dependency
returns.** A worker holding a slot while waiting on a database is not doing work, but it is consuming
capacity — which is why a slow dependency causes an outage in a service that is itself perfectly
healthy, and why the fix is a **timeout**, not more capacity. Adding "what is this slot waiting on"
to the slot visualization turns the doc's excellent parking-lot ring into a *diagnostic*: a ring full
of slots all waiting on the same downstream is the picture of the entire incident.

### → §7.1 "Effective vs nominal redundancy"
The best mechanic in the document. Extend it beyond power and network to the four correlations that
actually void redundancy:
- **Shared power** (the doc has this).
- **Shared path** (two circuits, one conduit — §1.5 above).
- **Shared software/firmware version** — two identical devices running the same buggy firmware fail
  identically, which is why the doc's `Switch Firmware Bug` exists and should connect here.
- **Shared human** — both units were configured by the same person from the same (wrong) template, or
  both depend on a credential only one person holds.
- **Shared time** — both certificates expire the same day; both drives are the same age; both
  contracts renew in the same month.
Displaying **effective redundancy** as a number that accounts for all five is the single highest-value
UI element the game could ship, and it turns "I thought I was redundant" from an event into an
inspectable property.

### → §7.2 "Physical vs logical views that can disagree"
Correctly identified as the best idea in the section. Add the **third view that disagrees with both**:
the **documented** view. Physical (what is), logical (what it does), documented (what you think).
Three-way diffs are where real incidents live, the discrepancy between documented and physical is what
`The Reconciliation` (§1A.2) and the elevation diff (§8A.9) are for, and it gives documentation a
visual payoff instead of being an invisible stat.

### → §7.2 "Connection contracts (the link carries the policy)"
Superb. Add **timeout** as the most important bead, with the property that makes it interesting:
**timeouts must decrease as you go deeper.** If your edge times out at 30s and your database times out
at 60s, the edge gives up while the database keeps working, and the work is wasted — and worse, the
client retries, stacking new work on top. Rendering a **timeout budget that must monotonically shrink
along a path**, with a visible violation when it doesn't, is a genuinely novel mechanic, it's a real
and widely-misconfigured thing, and it directly causes the doc's `Retry Storm`.

### → §7.5 "Maintenance windows"
Add the constraint that makes windows strategic rather than administrative: **windows are set by your
customers, not by you.** An e-commerce customer forbids November–January; a payroll customer forbids
month-end; a game community's window is 4am and lasts 90 minutes; an enterprise requires 14 days'
notice in writing. With ten customers you have a **calendar with almost no legal time in it**, and
finding the intersection is a genuine, visible, spatial puzzle. That's much better gameplay than
declaring a window freely, and it's exactly what scheduling actually feels like.

### → §7.5 "Actions cost time, not mana"
Split into duration vs attendance (§7A.10) — the single highest-value refinement I'd make to this
section.

### → §7.6 "The 'everything is green' trap"
The best-named idea in §7. Add its two siblings so it becomes a family:
- **Everything is red and nothing is wrong.** A monitoring or network problem makes healthy systems
  appear down. The correct response is to verify from a second vantage point *before* acting, and the
  failure mode is a player who "fixes" forty healthy machines.
- **Everything is green and you are not looking at production.** The monitoring is pointed at staging,
  at the old IP after a migration, or at a health endpoint that was stubbed out during a deploy in
  2022 and has returned 200 unconditionally ever since. **The check that always passes is worse than
  no check**, and finding one during an audit or a chaos test should be a genuine unlock.

### → §7.6 "The in-game terminal"
Enthusiastically endorse, and with a specific shortlist so the tension about scope resolves: **five
commands that carry 80% of real diagnosis** — something that shows load and per-process state (`top`),
something that shows disk (`df`/`du`, including the deleted-but-open disagreement), something that
shows network state (`ss`/`netstat`, including conntrack and TIME_WAIT), something that shows DNS
(`dig`, with the ability to query a *specific* resolver, which is the actual skill), and something
that shows the path (`traceroute`/`mtr`, with the crucial detail that intermediate hop loss is
usually a lie and only the final hop's loss matters — a real misconception the game could correct
single-handedly). Those five, with accurate output derived from simulation state, would be the most
talked-about feature in the game.

### → §7.7 "Recovery order matters"
Add the cold-start dependency cycle (§7A.6) and the inrush staging problem (§1.5 above). Also add the
recovery decision the doc's list implies but doesn't state: **restore service before restoring
redundancy.** During recovery the player will want to rebuild the array, re-establish replication and
re-arm failover before letting traffic back — which is safer and slower — versus serving customers on
a fragile single copy while the rebuild runs behind. **Both are defensible and the game should never
say which is correct.**

### → §7.7 "The technical debt meter"
Add the two components that make debt legible instead of abstract: **toil hours per week** (how much
of your team's time is consumed by manual repetition — a number you can *measure* and therefore
justify spending against) and **the Rebuildability index** (§1A.3). Together they convert a
metaphorical meter into two numbers an engineer would actually put in a budget request, which is
exactly the register this game wants.

### → §7.8 "Control granularity as a difficulty axis"
Superb axis, and one refinement that generalizes it further: control is not a single scale, it's **four
independent ones** — you may control the *hardware*, the *software*, the *network*, and the *data*
separately. Managed hosting = all four. Dedicated = hardware and network only. Colo = network and
power only. Reseller = none, but you own the customer relationship. Cloud tenant = software and data
only. Rendering the four as a little four-pip badge per business line instantly communicates "what can
I even do here," and it explains why the same incident is a 10-minute fix in one line and a 3-day
diplomatic process in another.

---

## 8. Visuals and presentation

### → §8.2 "The colour language"
One conflict to resolve: **gold/amber is doing double duty as "money" and as "warning/degraded,"** and
those two appear on screen simultaneously constantly — a degraded server next to a revenue mote is
the game's most common frame. Suggest: money is **gold with a specular highlight and arc motion**
(always moving, always with a coin silhouette), while warning is **amber, flat, static, and attached
to an object**. Motion and shape carry the distinction; the doc's own Diamond/Circle/Triangle law
demands it. Worth stating explicitly because it will otherwise be discovered in playtest.

### → §8.2 "Purple means 'we don't know yet'"
Excellent and slightly in conflict with §2.4's `The Mimic Tell`, which says a mimic's tell can be "a
fill colour a few degrees off." If unclassified traffic is violet, then a mimic is violet too and the
colour tell cannot exist. **Resolve in favour of purple**: mimic tells must be **motion and path**
tells (gait regularity, a too-systematic route, arrival synchrony), never colour. That's also the
stronger design — a behavioural tell rewards watching, a colour tell rewards pixel-peeping.

### → §8.4 "Blinkenlights as primary telemetry" vs §7.6 "Fog of infrastructure"
A tension worth resolving explicitly, because it's a genuinely good distinction once stated: if LEDs
are readable telemetry, what does buying monitoring get you? **Answer: LEDs are present-tense, local,
and require you to be looking.** Monitoring is **historical, aggregated, remote, and it looks for
you.** So an uninstrumented machine's LEDs work perfectly at Z1 and it is fogged at Z3 — you can
diagnose it if you walk to it and watch it, and you will never know it had a problem at 3am. That
single sentence makes both systems coherent and maps exactly onto the real difference between "I can
see the drive light" and "I have a graph."

### → §8.5 "Telegraphs"
See the three-way contradiction resolution under §1.7 above. The key visual consequence: **entropy and
hunter threats should have no horizon glow, no radar contact, and no dashed path** — their only
telegraph is a subtle change in an instrument the player may or may not own. Reserving the big
cinematic telegraphs for volumetric and scheduled events makes them *mean* something, and makes the
quiet threats genuinely quiet.

### → §8.7 "Money as motion" / "The cash register rhythm"
One addition that makes the economy audible in the right way: the doc renders **income** as coins and
**burn** as falling streams. Add a third, which is the one operators actually feel: **the bill that
arrives once a month and is bigger than you expected**, rendered as a single heavy object landing on
the desk with a thud, at a fixed date, every month, with its size varying. The rhythm of hosting
finance is not a stream, it's a **steady trickle in and four thuds a month** (payroll, power, transit,
licences) — and building the month around those four impacts makes cash-flow timing (§6.4's invoice
calendar) legible without a single number.

### → §8.8 "The Site Preview Window"
Rightly called the best UI idea in the doc. Two extensions that cost almost nothing:
- **Show it from multiple vantage points.** A little tab strip: your office, a mobile connection,
  another continent, a customer's ISP. The same page rendering differently in four tabs is the entire
  `Whitelisted Office` lesson (§1A.2) delivered in one widget with no text.
- **Show the customer's *own* monitoring view** for enterprise clients — the dashboard they are
  looking at while they are on the phone with you. It is a different, often more pessimistic, truth,
  and seeing it is what turns an argument into a diagnosis.

### → §8.8 "The Alert Stack"
Add the visual that makes alert fatigue legible before it bites: a small **signal-to-noise bar** on
the stack showing what fraction of recent alerts required action. When it drops below a threshold, the
stack itself should start rendering *dimmer* — the UI visibly losing the player's attention, which is
a beautifully literal rendering of the doc's own alert-fatigue mechanic and much better than silently
hiding alerts.

### → §8.9 "Aggregate, don't shrink"
Add the aggregation rule that matters most for this game specifically: when N objects collapse into
one glyph, the glyph must carry **worst state** *and* **count of non-nominal members**. "Rack 7: 40
units, 2 degraded" reads instantly; "Rack 7: degraded" hides whether it's one drive or the whole row.
The count is what turns a summary into a triage decision.

### → §8.11 "The datacenter hum"
Add the specific audio cue that every operator knows and no game has used: **the pitch change when a
row of fans ramps in unison.** A single fan ramping is noise; forty fans ramping together is a thermal
event, and the sound arrives *before* any graph moves because the fans respond to inlet temperature in
real time. **Ambient audio as the fastest sensor in the building** — it is genuinely true, and it makes
the doc's "hear a problem before seeing it" claim concrete.

---

## 9. Anything else

### → §9.2 "The Dependency Web"
Called "the most helpless and most realistic twist available," and it can be made *playable* instead of
purely helpless with three real verbs:
1. **Detect fast.** A provider-status aggregator and the External Vantage fleet let you determine in
   90 seconds that the problem is not yours — which is worth an enormous amount, because the wrong
   answer is an hour of debugging your own healthy systems.
2. **Fail away.** Pre-built secondary providers you can switch to: a second DNS provider, a second
   payment gateway, a CDN you can bypass, a resolver you can point elsewhere. Each is paid for in
   advance and used once a year, which is the doc's favourite kind of purchase.
3. **Communicate first.** Being the company whose status page explains *their* outage before they do
   is a measurable reputation gain. **You cannot fix it and you can still win the hour.**

### → §9.2 "It's Always DNS (with a counter)"
Make the counter honest and it becomes a better joke: track root causes by category across the
campaign and show the real distribution at the end. In a well-modelled version of this game the
categories should land roughly where they land in life — **change-induced** (deploys, configs) is
the largest single bucket, followed by capacity/growth, then hardware/facility, then dependency/
third-party, then actual attacks a long way down. **A game whose end-of-campaign pie chart shows the
player that attacks were 8% of their incidents has taught something real**, and it makes the tower-
defense framing quietly subversive in the best way.

### → §9.3 "Server naming and the label maker"
Sharpen the joke into a mechanic with a correct answer. Thematic naming (gods, cheeses, Star Wars)
is charming at 20 machines and a liability at 200, because the name carries no information — you
cannot tell from `thor` what it does, where it is, or what it depends on. Functional naming
(`web-fra1-07`) is boring and scales. The real hybrid: **thematic names for pets, functional names for
cattle**, and the moment the player's fleet crosses the threshold, the game should offer a **renaming
project** that costs a maintenance window, breaks every runbook and monitoring reference, and is
correct. **A cosmetic decision that becomes an operational debt is the most on-theme joke available.**

### → §9.5 "Field Notes"
Add the two entries this lens would most want in there, because they are the concepts that most
reliably separate people who understand infrastructure from people who don't:
- **"Averages hide everything."** Percentiles, resolution, and why your graph was flat while you were
  dropping packets (§7A.1).
- **"Redundancy is a property of the whole path, not of the component."** Why two of something is
  often one of something, with the five shared-correlation types from §7.1 above.
Both are short, both are genuinely useful outside the game, and both are already load-bearing
mechanics — so the Field Note is documentation of the simulation rather than an add-on.

### → §9.6 "Every tower has a downside"
One friendly amendment for authenticity. There *are* a small number of real interventions with no
meaningful downside, and pretending otherwise is its own kind of falseness: **network config backup,
a label printer, an EPO guard, a blanking panel, MFA on the registrar, an offboarding checklist, and
a spend cap on the phone bill** are all essentially free wins. The doc's guardrail should be amended
to: *"no tower is free of downside — except a small, explicitly curated set of 'why didn't I do this
years ago' items, which exist precisely so the player experiences the feeling of finding one."* That
feeling — discovering a $12 purchase that removes a whole class of disaster — is one of the genuine
joys of the job and the design currently forbids it.

### → §9.6 "Make the boring thing beautiful"
Wholeheartedly endorsed, and I'd nominate the specific list this lens would spend the animation budget
on, in order: **the restore that works** (a progress bar that completes and a checksum that matches),
**the failover that nobody noticed** (traffic shifting with no graph moving), **the fleet-sync wave**,
**the patch cart turning a wall of amber pips green**, **the cable management pass**, **the generator
starting**, and **the label printer**. If those seven feel better than the explosions, the game is
about the right thing.

---

## Summary of the highest-value items in this report

If the merge agent takes only a handful of things from this pass, I would argue for these:

1. **Telemetry Resolution as a mechanic** (§7A.1) — measurement interval determines truth; it unifies
   the 95th percentile, microbursts, percentiles and retention-vs-resolution into one idea that no
   game has ever modelled and every operator lives inside.
2. **The Threshold Bug / "what grew?" diagnostic mode** (§1A.2, §7A.2) — the entire class of incidents
   where nothing changed, currently absent.
3. **DRaaS oversubscription and correlated declarations** (§1A.1) — the best untouched level premise.
4. **The Scream Test / decommissioning level** (§1A.2) — the only level whose verb is removal.
5. **Lead time as a currency and the Circuit Order** (§1A.3, §6A.1) — the constraint money cannot buy.
6. **The demand charge** (§6A.1) — the 95th percentile's electrical twin, and it makes the GPU
   synchronized-ramp event pay rent for eleven months.
7. **Fixing Grace Windows** (Part B §1.7) — as written it contradicts four other systems; move the
   grace to attention rather than traffic.
8. **Resolving the telegraph contradiction** (Part B §1.7 / §8.5) — telegraph by threat band; weather
   and storms are visible, hunters and entropy are not, and entropy is visible only if you bought the
   instrument.
9. **Effective redundancy extended to five correlation types** (Part B §7.1) — shared power, path,
   firmware, human, and time.
10. **Incident Command as a hand-assignment system** (§4A.3) — the doc models attention beautifully
    and coordination not at all, and coordination is the difference between a 20-minute incident and a
    three-hour one.
