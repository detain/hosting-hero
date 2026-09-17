# Hosting Game — the complete idea index

> **3,907 ideas, one line each**, condensed from 3.62 MB of source across the eleven
> category files in `master/`. This is an *index*, not a design document: it exists so
> you can find an idea and then go read it.

## What this is

The eleven files in `master/` hold the full merged brainstorm — every idea written out
at length, with its variations, counter-arguments, numbers and presentation notes. That
is 3.62 MB of prose, and it is not skimmable.

This document is the other half: **every named idea in the entire corpus, reduced to a
single line**, in the same order it appears in its source file, under the same section
headings. Nothing has been dropped and nothing has been merged away — the 3,907 lines
below correspond one-to-one with the 3,907 named idea entries in the source.

## How to use it

**Every idea name here is reproduced verbatim from its source file.** That is the whole
point of the document, and the workflow it enables is:

1. **Skim or search this file** until you find the idea you want.
2. **Copy its name exactly** — the bolded text at the head of the line.
3. **Grep that exact string** in the corresponding file in `master/`, which is named in
   each section's `> Source:` line and in the mapping table below.

```sh
grep -n 'The Grudge system' master/03-threats.md
```

The full entry there carries what this line could not: the nested variations, the
opposing positions in full, the tuning numbers, the counter-lists and the visual specs.
Treat a line here as a *pointer with a summary attached*, never as the idea itself.

## Notation

| mark | meaning |
|---|---|
| `(+N var)` | the full entry in `master/` carries **N nested variations** not expanded here — alternate framings, per-era or per-type variants, rival numbers. A line with `(+9 var)` is the tip of a much larger entry; go read it. |
| ⚔️ | an **unresolved conflict**. Two or more positions are preserved in the source rather than reconciled, because the disagreement is real and someone has to rule on it. Every one of these is collected in the [Open conflicts index](#open-conflicts-index) below. |
| `§N.M` | a cross-reference to a **section number inside the source files**, *not* to a filename. See the numbering warning below. |
| *— CONFLICTING* | part of an idea's own name in the source: the entry exists specifically to hold a disagreement. These are always also ⚔️-flagged. |

## File mapping

| summary section | source file in `master/` | internal § | ideas | source |
|---|---|---|---:|---:|
| Foundations | `00-foundations.md` | §0.1, §0.4–§0.6 (+ TOC appendix) | 31 | 37 KB |
| Levels, scenarios, and progression | `01-levels-scenarios-and-progression.md` | §1 *minus* §1.3 | 405 | 390 KB |
| Hosting types | `02-hosting-types.md` | §0.2, §0.3, §1.3 | 102 | 308 KB |
| Threats | `03-threats.md` | **§2** | 603 | 488 KB |
| Visitors, traffic, and clients | `04-customers-traffic-and-clients.md` | **§3** | 456 | 340 KB |
| Buildables: services and infrastructure | `05-buildables-services-and-infrastructure.md` | **§4** | 500 | 384 KB |
| Unlocks and discovery | `06-unlocks-and-discovery.md` | **§5** | 312 | 232 KB |
| Economy, money, and scoring | `07-economy-money-and-scoring.md` | **§6** | 427 | 338 KB |
| Core gameplay mechanics | `08-core-gameplay-mechanics.md` | **§7** | 328 | 342 KB |
| Visuals and presentation | `09-visuals-and-presentation.md` | **§8** | 420 | 396 KB |
| Anything else — modes, twists, humour, meta | `10-anything-else-modes-twists-humor-meta.md` | **§9** | 323 | 281 KB |
| | | **total** | **3,907** | **3.62 MB** |

### ⚠️ The filename/section off-by-one

**Filenames are one higher than the `§N` numbering inside them.** Threats are
`03-threats.md` but every heading and cross-reference inside calls them **§2**.
Customers are file `04` but **§3**. Visuals are file `09` but **§8**.

This is deliberate and is not a bug to fix. The filenames were aligned to a companion
document's ordering so the two trees can be compared file by file; the internal numbering
was left alone because the corpus contains hundreds of inline cross-references (`§2.12`,
`§6.16`, `§9.11`, …) that renumbering would have silently invalidated.

So: **a `§N.M` reference anywhere in this document points at a section heading, and you
find its file by adding one** — `§2.x` → `03-`, `§7.x` → `08-`. The two exceptions are
the foundations split (`§0.1` and `§0.4`–`§0.6` are in file `00`, but `§0.2`/`§0.3` are in
file `02`) and `§1.3`, which lives in file `02` rather than file `01`.

---

# Open conflicts index

**135 unresolved decisions**, every ⚔️ in the corpus, gathered in one place.

These are the points where the source preserves two or more incompatible positions
instead of picking one. Some carry a proposed resolution in the full entry; most do not.
They are grouped by category and numbered continuously, so "conflict #57" is unambiguous.

Each line names **what is disputed**, not what the answer is. To see the positions in
full, grep the idea name in the file named at the head of each group — these lines are
deliberately compressed past the point of being decidable on their own.

> **Read §9.15 first.** The last seven entries (#129–#135) are *cross-cutting* — flagged
> in `10-anything-else` but binding on other categories' files, and each names the files
> it bears on. They are structural: each one is a pair of rules from different chapters
> that cannot both ship. Resolving a cross-cutting conflict may invalidate lines in two
> or three other sections, so rule on those before spending effort on the local ones.

## Foundations — `00-foundations.md` (1)

1. **P7 — Ship the real monsters** — authenticity-first (real failure modes *are* the game) vs hosting-as-flavour-for-mechanics. The corpus's oldest split; restated and given a proposed three-step resolution at #126.

## Levels, scenarios, and progression — `01-levels-scenarios-and-progression.md` (9)

2. **"First Byte" / "The Closet" / "The First Modem"** (§1.1) — random mom-unplugs-it loss vs a telegraphed hazard; and whether the bottleneck is a one-uplink gate or a POTS-line count.
3. **`The Auditor` / "Audit Week"** (§1.2) — one fixed studiable inspector route (a sightline puzzle) vs 2–3 randomised telegraphed routes (live misdirection and triage).
4. **`Launch Day` / `Hug of Death` / `The Slashdotting`** (§1.5) — pre-build then spectate under a hard no-scaling rule vs telegraphing the hype earlier and keeping a narrow live reactive channel.
5. **`Zero Downtime Migration` / `Silent Migration`** (§1.5) — one siege level doing everything at once vs a two-level act splitting pre-build/sync from the cutover gauntlet.
6. **`The Bill Comes Due`** (§1.5) — hard uplink-pull loss vs a soft deplatform patience meter that degrades as bills go late.
7. **`The Long Night`** (§1.5) — a literal 100-wave marathon vs ~10–12 escalating scripted incidents with a repair budget and sleep-or-patrol lulls.
8. **Difficulty as SLA** (§1.6) — scale reward and punishment together vs scale reward only and cap the penalty, since punishing a difficulty the player chose reads as cheating.
9. **Level-select presentation — *CONFLICTING*** (§1.11) — the patch panel plus job board, recording your route in cabling, vs your own company website upgrading from GeoCities to a docs site, recording your public face.
10. **End-of-level presentation — *CONFLICTING*** (§1.11) — an in-world printed artifact you keep and pin to the Company Wall vs a slow real-estate-listing sweep of the facility with stat pins popping.

## Hosting types — `02-hosting-types.md` (1)

11. **Colocation — which side of the cage the player is on — *CONFLICTING*** (§1.3) — landlord (own the building, collect MRC + power + cross-connects) vs tenant ("The Hangar of Cages": per-U rent, metered power, remote-hands fees, human-layer threats). Rent collected vs rent paid; the building as your asset or your captor. Explicitly **not** to be averaged — resolve per level or ship both as paired levels.

## Threats — `03-threats.md` (§2) (24)

12. **SYN Flood / The Half-Handshake Pile** (§2.3) — are SYN cookies a free permanent unlock, or do they carry a real cost (lost TCP options hurting lossy and mobile clients)? Tests §4.1's "no pure upgrades" law.
13. **Ransom DDoS (RDoS)** (§2.3) — may the ransom note occlude UI mid-incident? Proposed resolution limits it to a dismissable non-critical region.
14. **Zero-Day first strike — *CONFLICTING*** (§2.5) — can patch hygiene make a zero-day miss entirely (fizzle-by-recency), or does the first strike always land with only blast radius under your control? A fourth position scales damage off a patch-hygiene stat.
15. **The Insider / The Flickering Badge** (§2.6) — is the tell a pixel-level sprite cue, and is low morale the sole trigger? Leaning toward behavioural audit-log detection plus an independent lone-disgruntled trigger.
16. **BGP Prefix Hijack** (§2.7) — helplessness as a designed emotion vs an unplayable minute of nothing to do. Proposed fix gives three actions: verify externally, announce more-specifics, work the phone.
17. **Rodents, Wildlife, and the Literal Bug** (§2.8) — untelegraphed random link death vs the no-unfair-randomness rule. Proposed fix: buyable conduit and rodent guards plus a ~30-second visible chew-damage precursor.
18. **The entropy rate cap and aggregation rule** (§2.8) — "frequent, small, attention-taxing" entropy vs the Notification Discipline / Readability Budget.
19. **Rebuild Storm / The Double Failure** (§2.8) — the URE-guarantees-failure framing is disputed as wrong; the real killers are argued to be rebuild duration, performance collapse and correlated drive age.
20. **Correlated Batch Failure / The Bad Batch** (§2.8) — mixed-vendor procurement is argued overstated: it removes *batch* correlation but not environmental (same rack, thermal, power, vibration, age).
21. **Water Leak / Condensation / Puddle Creep** (§2.8) — is the CRAC the commonest source, or the floor above (bathroom, kitchen, sprinkler, another tenant) — which you cannot fix, only tarp and complain about?
22. **The Hardware Lottery** (§2.8) — hidden per-machine quality with no counterplay is noise; disputed fix adds a burn-in verb (24 in-game hours at load) and a warranty claim.
23. **Alert Fatigue** (§2.9) — may the game hide the real alert? Resolution says collapse it (`▸ 41 suppressed`) with a Signal-to-Noise meter, never hide.
24. **Fat-Finger** (§2.9) — a hidden die roll that punishes engagement vs a visible 1.5s confirmation showing target name and blast radius, which the player may disable (speed versus care).
25. **Documentation Rot** (§2.9) — per-document rot as a chore loop that teaches "don't write documentation" vs a single Freshness stat decaying ~4%/month where staleness costs *time*, not correctness.
26. **The SLA credit magnitude correction** (§2.10) — the widely-quoted $1,900-credit chain vs reality (~$25, often $0: credits not cash, capped at one month's MRC, claim rarely filed). Forces damage to lead with churn probability and review text instead.
27. **Processor Termination** (§2.10) — the "1% for two months" trigger is disputed as wrong: networks threshold on dispute *ratio* **and** absolute count, with a monitoring program, fines and a remediation window rather than a cliff.
28. **The Astroturf Temptation** (§2.10) — a choice labelled as a trap isn't a choice; argued that detection should scale with volume and pace so a slow buy is nearly undetectable, and the benefit should be real.
29. **Script-Kiddie movement speed — *CONFLICTING*** (§2.11) — slow tutorial walkers (a *reading* exercise) vs fast numerous chaff (a *throughput* and free-kill-economy exercise) vs a jittery middle that leaves speed unspecified. Decides what the tutorial teaches.
30. **The Competitor (the rival AI)** (§2.11) — an invisible antagonist existing only in churn graphs won't register; disputed fix gives them palette-swapped visible saboteurs and board-level state.
31. **Nation-State / APT / The Quiet Ones** (§2.11) — "if you never detect them you experience nothing" is an absence, not a design. Rebuilt on weak signals (log-volume absence, egress contradiction, third-party witness) where *flatness* is the tell.
32. **The Crawler Consortium** (§2.11) — the cyan-gold "both" colour fails colour-blind requirements; proposed fix keeps them cyan with a dashed outline against the Scraper Locust's dotted one.
33. **The pruning rule for type-specific threats** (§2.12) — pruning vs the document's comprehensiveness goal. Resolution: keep every entry written, prune only which ones get balance numbers.
34. **Threat pathing telegraph** (§2.13) — hundreds of dashed trajectories is noise at scale; resolved by drawing only above a cost threshold plus one centroid line per swarm.
35. **Hostile palette law — *CONFLICTING*** (§2.26) — all agree on exactly one reserved hostile hue customers may never wear, but not which: magenta-hostile/violet-unclassified/cyan-friendly vs acid-green+magenta+void-black vs violet-hostile with frost reserved to ransomware vs red-as-hostile-lane. Fixes what "unidentified" looks like and whether entropy can read as an attacker.

## Visitors, traffic, and clients — `04-customers-traffic-and-clients.md` (§3) (5)

36. **Customer lanes vs threat lanes** (§3.1) — one shared violet ingress separated only by inspection (so filters always tax revenue) vs two visually distinct rivers separated at spawn, with mimics as the named exception.
37. **Whale immortality** (§3.2) — is a signed whale a terminal state with expansion as the only variable, a standing obligation re-won at every renewal, or immortal within a level and mortal across levels?
38. **Retry forgiveness** (§3.4) — a universal N-second grace window in which fixing the cause pulls a departing customer back, vs forgiveness that is per-archetype, era-scaled, purchasable, or absent entirely for dial-up.
39. **The renewal beat** (§3.7) — one synchronised global pulse that makes revenue a felt heartbeat vs cohort-staggered rolling renewals that resist timing exploits.
40. **Patience as a visual channel** (§3.12) — redundant always-on channels for one stat vs one composite status chip vs a strict one always-on + one aggregate + one cinematic budget.

## Buildables: services and infrastructure — `05-buildables-services-and-infrastructure.md` (§4) (18)

41. **The Three-Column Law** (§4.1) — absolute law (no Friction/Surface/upkeep means it ships as a default) vs a capped ~12-item "hygiene" carve-out.
42. **Buildable silhouette language — *CONFLICTING*** (§4.1) — family-by-role shapes (network angular, storage vaulted) vs whom-it-serves shapes (round = visitor-facing, angular = defensive).
43. **The Capacity Reservation (for yourself)** (§4.1) — a held slice sales cannot sell, directly opposing the Yield Manager's job of selling idle capacity. Paired with #57.
44. **Staging Environment** (§4.2) — it mirrors the *service* while the Lab Rack mirrors the *hardware*: two different purchases, both of which players skip.
45. **NFS / SAN / Shared Storage** (§4.3) — prerequisite for stateless live-migratable compute vs the game's best single point of failure; the counter is argued to be cells, not avoidance.
46. **Air-gap doctrine — *CONFLICTING*** (§4.3) — five rival cost models for the one thing ransomware cannot walk through: drawn visual class, free tactical lever, zone seal earning nothing while sealed, one-way data diode, or courier/sneakernet logistics.
47. **DDoS Scrubbing Service — "The Comb"** (§4.4) — on-prem appliance (fast, uplink-capped) vs upstream service (unlimited, but a permanent 25–40ms detour on all traffic).
48. **Defenses live on edges, not on the board** (§4.5) — the edge-placement rule vs the fact that some defenses (scrubbing, blocklists, policies) are irreducibly Global and priced higher.
49. **The honeypot's escape risk — *CONFLICTING*** (§4.5) — everything agreed except the one number that decides whether you build it: risky live attractor (~4%/level) vs zero-surface decoy outside the perimeter vs telegraphed breakout with counter-play.
50. **Generator + Fuel Contract — "The Barn"** (§4.7) — a single "start confidence" readout vs a six-part failure taxonomy; proposed compromise ships both, taxonomy as the maintenance screen.
51. **Thermal Storage / Thermal Ride-Through** (§4.7) — hot-aisle containment *shortens* ride-through, from 8 minutes to 90 seconds, so two recommended buys fight each other.
52. **Cable Management / Cable Tray / Patch Panel** (§4.7) — the Tidiness stat rewards bundling, but bundled runs are harder to trace and a patch panel adds a latency hop.
53. **Cable Label Printer** (§4.7) — sanctioned as one of the ~12 hygiene pure-ish wins vs carrying a label-accuracy stat that decays as you re-patch, on the grounds that a wrong label is worse than none.
54. **Role compression: five roles × three seniorities** (§4.8) — the compressed grid vs the full named roster, which is more characterful and whose roles carry unique mechanics rather than stat deltas.
55. **Data Gravity Builds** (§4.9) — whether the storage anchor reads as convenience or hostage-taking; the Egress Policy Desk is what decides.
56. **Marketing Beacon / The Channel Portfolio** (§4.9) — over-marketing spikes expectation, so the arrivals it buys you come with tighter patience.
57. **The Yield Manager** (§4.9) — releasing idle capacity at a discount vs holding for full-price demand, directly opposed to the Capacity Reservation (#43); release too much and existing customers discover the spot price.
58. **Authoring rule: skins on shared mechanics** (§4.10) — one countable concurrency pool in five costumes vs fresh-eyes reports that hero objects are what make each line feel new. Proposed resolution: skin the mechanics, never the silhouette.

## Unlocks and discovery — `06-unlocks-and-discovery.md` (§5) (10)

59. **When does a counter unlock? — *CONFLICTING*** (§5.1) — is being hit the *only* gate, or the cheapest of five (news/CVE-gated, idle paid R&D, threat-drops-blueprint, honeypot specimen)? Strict pain-gating authors the build order, punishes competence and walls off new lines.
60. **The six-branch spine (Serve / Shield / Scale / Sustain / Sell / Sense)** (§5.5) — four rival taxonomies compete (six / eight / seven / Three-Pillars); resolution proposes deriving the branches from the nine defense roles instead.
61. **Regret Nodes** (§5.5) — fun-first says never punish an early reasonable choice, authenticity says debt is universal. Proposed fix: escapable-at-a-cost plus a "⚠ scales poorly" chevron.
62. **Alternative prerequisite sets** (§5.6) — a strict DAG collapses into one optimal path; the fix is 2–3 routes into every line, which weakens the tree as an authored sequence.
63. **The certification chain — *CONFLICTING*** (§5.6) — one canonical order paced by evidence periods vs five rival orderings, including a variant that denies the chain entirely and makes certs independent segment doors.
64. **The Deprecation Mechanic** (§5.7) — per-node rot becomes 40 chores; resolved by rotting whole generation bands as a single project.
65. **Concerns ratchet, implementations rot, eras gate** (§5.7) — the ruling that concerns never go away, implementations age out, and eras gate implementations only (you always think about power, not always about *this* PDU).
66. **The shape of the tech tree (presentation) — *CONFLICTING*** (§5.8) — which diegetic object is the default: hand-drawn whiteboard (PCB as accessibility skin), branch menus, a topology graph, a 42U rack elevation, or the patch-panel family?
67. **Channel and marketplace unlocks** (§5.9) — editor's choice has an honest route and a paid route, and both are kept rather than picked between.
68. **Unlock Rationing (the hard cap)** (§5.12) — the 2–4-per-level cap biases toward QoL where the cadence spec biases toward verbs; resolve by using the cap as budget and the grades as composition.

## Economy, money, and scoring — `07-economy-money-and-scoring.md` (§6) (22)

69. **MRR (the growth currency)** (§6.1) — two-currency confusion risk, and §6.8's "nothing you can't act on" rule formally excludes MRR; merged position keeps MRR under an explicit exemption and demotes NRR/LTV:CAC/DSO to the drawer.
70. **The Three Budgets (capex / opex / hands)** (§6.1) — fights the Three-Bucket Budget for the same HUD bar (purpose axis vs form axis); one ships on the HUD and one in the drawer, and the lenses disagree which.
71. **The core currency set — *CONFLICTING*** (§6.1) — the large set (Cash, Runway, MRR, Revenue Quality, Error Budget, Trust, Intel, Hands, upstream trust, power+space, lead time, receivables, Heat, EBITDA) with one death and many pressures, vs a deliberately small set. The most load-bearing economy decision.
72. **Data egress (the villain revenue)** (§6.2) — the ethics dial makes high egress pricing a reputation cost while the CEO lens calls it simply how the industry works; both are kept.
73. **Cash vs Profit (the two ledgers)** (§6.4) — the visual lens wants a Two-Pan Scale (a live-tilting balance), great for glances and terrible for precision; merged as a Gap Bar on the HUD with the scale in the drawer.
74. **The price slider (difficulty as a dial the player sets)** (§6.5) — competes with "Difficulty as SLA" for the same UI slot; merged so the *contract* is the difficulty selector and the price slider is the business-model selector. Paired with #83.
75. **SLA credit payout model — *CONFLICTING*** (§6.7) — three mutually exclusive payout physics disputing **who initiates the credit and what stops it**: a live-accruing meter bounded by the four real properties, vs two rival automatic models.
76. **The three-tier HUD restructure** (§6.8) — three lenses propose caps of five, six, and a named six; pick five and let promotion carry the sixth. Plus: MRR is technically un-actionable, so the "things you are playing for" exemption must ship explicitly or the rule eats the score.
77. **The four-axis scorecard** (§6.9) — uptime leading contradicts the "reward letting things through" pillar; the game-design lens counters with Conversion 35 / Profitability 25 / Resilience 20 / Growth 20, stating that 100% uptime at 30% conversion should score *worse*.
78. **What the headline score is — *CONFLICTING*** (§6.9) — no single number (multi-axis scores plus grade bands, with Company Valuation kept at campaign altitude and deliberately off the per-level card) vs one number with sub-scores.
79. **Four analog dials** (§6.9) — dials, four-axis bars and the letter-grade stamp all competed for the same screen; resolved by sequence — dials as hero image, bars as detail beneath, stamp on top at the end.
80. **The Board Review (the alternative framing)** (§6.9) — this, the Report Card and the four dials are three end-screen metaphors; proposal ships them as modes tied to your financing (VC → Board Review, bootstrapped → Report Card, operator → postmortem).
81. **Death by cash — *CONFLICTING*** (§6.10) — what happens *at the moment the number hits zero*, deciding whether insolvency is a fail condition, a warning line, or a game mode: warned/soft/escapable with named doors vs a hard stop.
82. **Total / partial data loss** (§6.10) — two lenses want unrecoverable loss to end the level immediately and quietly ("scarier than an explosion"), one wants it graduated; merged so total unambiguous whole-estate loss ends the run quietly and anything partial or ambiguous scars and continues.
83. **The contract as the difficulty selector** (§6.12) — competes with the price slider for the "player sets their own difficulty" role; both shippable only if labelled as different axes. Paired with #74.
84. **The Two-Pan Scale** (§6.15) — it and the liquid column compete for the same corner of the screen; merged position picks the column (it supports the Gap Bar) and demotes the scale to an optional drawer widget.
85. **Baseline tuning numbers — read first** (§6.16) — the three tuning sheets are pitched at different tiers and eras and disagree on unit costs: a web node is **$1,800 in Sheet A and $3,200 in Sheet B**, monthly upkeep per node ranges **$45–$190**, because the sheets bundle different things into "upkeep".
86. **Derived tuning constants worth stating once** (§6.16) — the default score weights **30/20/30/20 plus a fifth worth 20** carry an inline `(⚔️ §6.9)` pointing at the conversion-first **35/25/20/20** alternative; the constants block cannot be finalised until #77 is ruled.
87. **Per-type gross-margin bands — *CONFLICTING*** (§6.16) — colo and GPU get materially different numbers for the same dial, implying different correct decisions about power resale, occupancy targets, and whether colo is the "safe" line.
88. **GPU hourly price and the collapse curve — *CONFLICTING*** (§6.16) — different absolute prices *and* a different decay rate for the same asset, deciding whether GPU is a cyclical business or a bomb.
89. **Oversell ratio detents — *CONFLICTING*** (§6.16) — the headline shared-hosting overcommit ratio differs by an order of magnitude, and it is the most consequential number in the shared line.
90. **Dunning recovery rate — *CONFLICTING*** (§6.16) — a small number with a large consequence: dunning is proposed as the highest-ROI build in the game, and its ROI *is* this figure.

## Core gameplay mechanics — `08-core-gameplay-mechanics.md` (§7) (15)

91. **Two Boards, Two Scales (Rack View and Topology View)** (§7.2) — the visual lens wants one morphing world, the designer lens wants two discrete board modes.
92. **Hop latency vs distance latency — *CONFLICTING*** (§7.2) — where milliseconds come from: every hop taxed in real ms with chain length as the optimisation target, vs the counter-claim that "+2ms for a DAC" is ~1000× wrong and intra-DC latency is dominated by distance and queueing, not hop count.
93. **Cable colour semantics — *CONFLICTING*** (§7.2) — colour encodes class/role (orange LAN, blue storage, green public, purple management, red trust-boundary, gold billable cross-connect, grey out-of-band) vs colour encodes physical medium. Three positions on the game's most-repeated object.
94. **Rack U Tetris** (§7.3) — pure packing is busywork at forty racks; resolution is five conflicting forces (density vs spread vs proximity vs separation) plus auto-pack with a penalty.
95. **Tuning instead of levels** (§7.4) — depth overwhelms casuals but auto-mode deletes the game; four mitigations proposed (max three sliders per object, tuning as policy with a snowflake budget, ranges narrowing as monitoring improves, config snapshots).
96. **Speed controls, with a catch** (§7.5) — higher speed visibly removes information; a stricter variant bans fast-forward entirely while any alert is active.
97. **Time control: pause, OBSERVE, or real-time — *CONFLICTING*** (§7.5) — **the most load-bearing unresolved rule in the corpus.** Free pause-with-orders vs no full pause (time-scale slider, pause drains an SLA clock) vs OBSERVE (time slows, never stops) vs tiered plan-only pause. Decides whether the game is judgement-under-pressure or planning, and collides with accessibility. See also #127.
98. **Do waves respect maintenance windows? — *CONFLICTING*** (§7.5) — does a window pause the risk roll or the world? Waves keep coming and only SLA accrual is suspended, vs a voluntary board freeze halting spawns, vs a twice-per-level slow-time ability.
99. **Executive attention and the CEO Override** (§7.5) — hands vs executive attention would double-tax the same thing; resolutions are a sequential handover at Tier 5, or one resource in two denominations.
100. **Red herrings** (§7.6) — unfairness fixed by five rules (one per incident, resolvable in under 30s with an owned tool, plausible, cheap to check, always named in the postmortem) plus the proposal that at least one "herring" be a genuine smaller second problem.
101. **The in-game terminal** (§7.6) — large content for an optional feature; mitigation is 5–8 beautiful commands rather than forty shallow ones.
102. **Time rewind: world restore, or configuration-only undo? — *CONFLICTING*** (§7.7) — three narrow tools under the law that only mechanical/build actions are undoable, time is not, and data loss is permanent — vs a broader world-restore.
103. **The three-clock rule** (§7.9) — the design proposes ~20 timers and then demands three prominent; resolution is a Unified Clock Ribbon promoting three by `urgency × consequence` — a UI guarantee, not a content restriction.
104. **Suspicion Routing — the Two Lanes** (§7.10) — a wave-2 report argues the opposite of the mazing premise ("the board is a topology, not a maze; the tension is filtration, not routing length"), reconciled by never mazing the express lane and lengthening only the distrusted deep lane.
105. **The Wave Envelope** (§7.13) — continuous diurnal flow and discrete named waves are both canonical; resolution makes baseline traffic continuous and diurnal while the generator schedules *events* with ramp, plateau, decay, composition and telegraph. See also #135.

## Visuals and presentation — `09-visuals-and-presentation.md` (§8) (6)

106. **How much face? — *CONFLICTING*** (§8.1) — how anthropomorphic hardware may be; four positions kept and none picked: full literal faces (charm, undercuts ops credibility) vs behaviour-only posture and LED cues vs subtle pareidolia vs face-as-pure-telemetry.
107. **The one hue table — *CONFLICTING*** (§8.2) — seven rival tables, all agreeing that publishing two is fatal. Red vs magenta for hostility; green's double duty as healthy *and* backup/replication; money as gold vs yellow vs green. See also #35.
108. **Does the healthy rack blink? — *CONFLICTING*** (§8.4) — the chorus camp (calm randomised blink as signature ambience, pattern-break is the alarm) vs the anomaly-pulse camp (stillness is health, any pulse means trouble).
109. **Fibre/copper hue assignment — *CONFLICTING*** (§8.4) — whether cable hue may enter the semantic palette at all, and whether fibre is aqua, yellow, or white-blue with copper taking the other. Three incompatible medium palettes. See also #93.
110. **Focus dimming — may desaturation carry attention? — *CONFLICTING*** (§8.9) — desaturation reserved for urgency (so focus must use contrast and value) vs a global 15–30% desaturation pull as the only read strong enough at 100+ entities.
111. **The screen-shake rule — *CONFLICTING*** (§8.13) — shake allocated by event identity (four whitelisted events only) vs by magnitude (2/6/12px tiers on every hit, governed by a rate limit).

## Anything else — modes, twists, humour, meta — `10-anything-else-modes-twists-humor-meta.md` (§9) (24)

112. **Roguelite Run Mode ("Bootstrapped")** (§9.1) — a rival run-structure to The Consultant; the note says ship one first, without saying which.
113. **Versus / Red vs Blue** (§9.1) — free-form live (thrilling, unbalanceable) vs a drafted deck-vs-deck format over 8 timed waves.
114. **Mode tiering** (§9.1) — twenty-six modes is too many and none are prioritised. The proposed cut (ship four, then four cheap, never three) demotes Co-op NOC and The Consultant, which other lenses rank highest — a dispute about cost, not quality.
115. **The Camera Is a Camera** (§9.2) — the view as your CCTV, so losing a site loses the view; degenerate as written, bounded to greyed timestamped last-known state plus out-of-band telemetry.
116. **The Ethics Track** (§9.2) — no meter, just delayed consequences, with grey revenue available and profitable; collides with §9.11's rule that the bulletproof arc must end somewhere. See also #127.
117. **Weather Affects Everything — scoped** (§9.2) — first-class threat only for satellite, edge, microwave and owned facilities; elsewhere a slow economic modifier.
118. **The reboot fix-rate — *CONFLICTING*** (§9.3) — one dial, two numbers: 60% (a support macro whose joke is that the cheap answer is usually right) vs 30% (a free one-shot gamble, because a dominant one-click fix undercuts diagnosis). See also #129.
119. **One persistent Company object, four faces** (§9.4) — nine competing meta-progression screens vs one object collapsing to Wall / Scrapbook / Almanac / People.
120. **Teaching is by event; explaining is on demand** (§9.5) — resolves the no-tutorial-text guardrail against an encyclopedia, glossary and library: the game never volunteers text, every explainer is player-initiated.
121. **Import Your Own Topology** (§9.5) — risky as a tool; the "Would You Have Survived" output must be findings to investigate, never an audit.
122. **Every tower has a downside — except a small curated set** (§9.6) — the no-pure-upgrades law amended from two directions by a curated pure-win list (config backup, label printer, EPO guard, blanking panel, registrar MFA). See also #41 and #53.
123. **No optimal build order** (§9.6) — collides with scar-driven unlocking; needs an Anticipation Track, seeded threat order and the Second Answer rule. See also #59.
124. **The reward is letting things through** (§9.6) — **called the document's most serious contradiction**: ~200 threats against ~45 visitor archetypes plus an uptime-first scorecard. Needs both a scorecard reweight and a content rebalance. See also #77.
125. **Pause systems — *CONFLICTING*** (§9.6) — pause as a free accessibility floor (pricing it reintroduces the APM tax the guardrail forbids) vs one Composure budget that meters slow-mo and observe. Three or four answers to "can the player stop time". Duplicate framing of #97.
126. **"Ship the real monsters" vs "hosting is flavour for mechanics"** (§9.6) — a proposed three-step filter: reality is the source list, mechanical role coverage is the filter, playability is the veto. The resolution offered for #1.
127. **Responsible Depiction Note** (§9.11) — depict the business, never the technique; pulls against the Ethics Track (#116), with the resolution being consequence, not prohibition.
128. **Where the priority lists disagree** (§9.13) — four lens-level splits about emphasis: which modes are top value (cost, not quality — decide by prototype); threat mass vs service mass (ops wants more failure modes, design says the bestiary already drowns the service pillar); and accuracy weighting.

### Cross-cutting — §9.15 (bear on other categories' files)

129. **Reboot-as-cleanse vs persistent threats — *CONFLICTING*** — bears on `08-core-gameplay-mechanics` (the reboot/restart verb) and `03-threats` (persistence classes). A free cleanse hard-counters half the catalogue — webshells, cryptojackers, dormant APTs. See also #118.
130. **Build-homing spawn law vs blanket zero-day meteors — *CONFLICTING*** — bears on `03-threats` (the spawn law) and `05-buildables-services-and-infrastructure`. "Enemies home in on what you built" cannot coexist with a zero-day meteor that hits everything. See also #14.
131. **Metered-vs-flat pricing dial vs the "attacks award $0" heartbeat — *CONFLICTING*** — bears on `07-economy-money-and-scoring` (the MRR heartbeat) and `04-customers-traffic-and-clients` (the pricing dial). Under metered egress, serving attack traffic costs real money, so "$0" erases the dial's whole point.
132. **The auto-scaler spends money vs the War Chest rewards lean play — *CONFLICTING*** — bears on `05-buildables-services-and-infrastructure` (autoscaling) and `07-economy-money-and-scoring` (the War Chest). Autoscaling inherently wastes headroom and boot lag, so a spend-down metric punishes using a system the game sells you.
133. **The entry-side visual contract vs mimic threats entering as customers — *CONFLICTING*** — bears on `09-visuals-and-presentation` (the entry-side contract) and `03-threats` (mimic families). "Customers bright side, threats dark side, never mix" versus SYN-mimics, the Hug of Death and abusive tenants. See also #36.
134. **Three-star grading axes vs SLA difficulty modifiers — *CONFLICTING*** — bears on `01-levels-scenarios-and-progression` (three-star grading) and `07-economy-money-and-scoring` (SLA modifiers). Two redundant dials measuring uptime, one as grade and one as difficulty. See also #8 and #83.
135. **Difficulty-via-entropy vs the scaling-ladder wave-knob school — *CONFLICTING*** — bears on `01-levels-scenarios-and-progression` (wave scaling) and `03-threats` (entropy/rot). Two schools of difficulty flagged since wave 1 and never reconciled: authored difficulty via the wave knob vs difficulty emerging from accumulated entropy. See also #105.

---

# The sections

The eleven category summaries follow in filename order, each reproduced exactly as its
authoring pass produced it. Each opens with a `> Source:` line naming the file in
`master/` to grep for full entries.

---

# Foundations — summary

> Source: `master/00-foundations.md` · 31 idea entries · 37 KB

## 0.1 Design pillars

- **P1 — The Shared Pipe** — Lane carries creeps AND customers; every defense costs Friction (real visitors bounced) + Latency. No strictly-good tower.
- **P2 — Capability vs. Surface** — Buildables print Capability (richer traffic) and Surface (threat classes permanently added to the pool); tech tree = bestiary.
- **P3 — Peacetime is the Real Boss** — Loud spiky waves vs. silent compounding upkeep; overbuild in a scare, die to payroll.
- **P4 — Attention is a Resource** — Manual actions consume "hands" (1–2 early); automation is the real tech tree. Money without hands.
- **P5 — Legibility Under Load** — Board readable in half a second at 3×: strict colour language, greyscale-safe shapes, upward-propagating alarms.
- **P6 — The same pipe carries the thing you want and the thing you fear** — P1 as rule: defenses get a visitor-facing cost, growth a threat-facing one.
- **P7 — Ship the real monsters** — Real failure modes ARE the game, each marked "was that real?". ⚔️ Authenticity-first vs. hosting-as-flavour-for-mechanics; real failures = source list, role coverage = filter.
- **P8 — The business is the other half of the game** — Owner-operator frame; damage reads SLA credits → refunds → cancellations → reviews. MRR/Cash/Reputation always onscreen.
- **P9 — The reward loop is on letting through, not shooting down** — Payoff is the conversion moment (coin/receipt animation, sound), not the kill; every bounce visible.
- **P10 — Almost nothing you do has an immediate result** — Lagging information: cut support → churn month 3; raise prices → churn at renewal; skip backups → catastrophe.
- **P11 — Hosting is billed in terms, not in months** — Term is a contract property: shared 12/24/36-mo prepay with renewal cliff, colo 3–5yr escalator + ramp, GPU reserved.
- **P12 — Revenue has a colour, not just a size** — Dollars tagged margin/churn/support-load/term/concentration/multiple; HUD shows MRR composition as a stacked bar.
- **P13 — The contract is a tower** — Liability cap, credit cap, claim window, maintenance exclusion, auto-renew, escalator, MFN, audit, assignment — each buildable on a paper layer.
- **P14 — Money you can't touch is not money** — Split Cash into free, restricted (reserves/escrow/deposits), spent deferred revenue, AR aged 30/60/90+, fit-out, backlog.
- **P15 — A pivot is a double-carry, not a switch** — Carry the dying line's contracts, leases and staff to term while funding the new one: 12–24 months.
- **P16 — Path shaping, not just tower shopping** — Mazing restored on a graph: per-hop Inspection Depth, Suspicion Routing / the Two Lanes, hard Millisecond Budget.
- **P17 — Defenses need roles, and coverage must be legible** — Nine defense roles against §2.1's twelve threat roles as a Coverage Grid; dark cells teach.
- **P18 — There must be something you spend to win *right now*** — Error Budget as spendable in-combat resource: burn degradation (shed load, serve stale, drop region); refills during calm.
- **P19 — A tension without a number is a mood, not a mechanic** — Wave 2 attaches a baseline economy and tick model as deliberately arguable first-draft numbers.
- **P20 — The boring middle of the job is the unmined content** — Measurement resolution, lead times, RMA logistics, change correlation, decommissioning, inventory drift, demand charge, growing into a long-standing bug.
- **P21 — Every mechanically-defined system owes a visual** — Specs where wave 1 hand-waved, plus four rendering laws: Hue Ledger, Emissive Allowance, Ring Taxonomy, Instrument Design Language.

## 0.4 The era axis

- **Era × Type is a 2D content grid** — Same ruleset, different era (1994 dial-up → 2024 GPU → edge); era shifts costs, tech, threats, customers, palette.
- **The Era Campaign ("From Dial-Up to GPU")** — Spine dial-up → shared → dedicated → VPS → cloud → containers → GPU; each transition obsoletes hardware, asks "chase or stay niche?"
- **The Era-Transition Cutscene** — Your facility ages around you as a renovation; one 1998 server still runs in the corner.

## 0.5 Working titles and tone

- **Working title candidates** — UPTIME · Packet & Rack · 99.999 · Five Nines · HOSTILE TRAFFIC · The Rack · Bare Metal · Ping of Death · Serving Suggestion · Load Bearing · From Basement to Backbone.
- **Tonal target** — Recognition comedy, never parody: *Papers, Please* meets a rack elevation diagram; never punch down.
- **The emotional arc** — Panic → process → prevention → boredom; boredom is the highest achievement.

## 0.6 What wave 2 changed (navigation map)

- **The nine biggest structural additions** — Sim loop + economy, path shaping, Error Budget, defense roles + Coverage Grid, QoS, cell architecture/shuffle sharding, contract tower tree, restricted cash, automation UI.
- **Whole hosting business families added in wave 2** — Certificate authority, registrar/registry, package registry, monitoring-aaS, mirror hosting, CI farm, Mac hosting, VPN, event NOC, ad-tech RTB, IXP, scrubbing, secure destruction, time services.
- **Threat space that was half-covered and is now filled** — Physical/utility/supply-chain: water rights, grid interconnection queues, multi-year transformer lead times, customs, counterfeit parts, export controls, wildfire smoke, demand charge.
- **Known live disagreements** — Five kept forks: authenticity vs. mechanics-first; waves vs. continuous flow; degradation vs. destruction; sim depth vs. legibility; engineer vs. owner-operator.

---

*Source appendix (lines 391–568): the original pre-split `hosting_game.md` table of contents, preserved verbatim for navigation.*

---

# Levels, scenarios, and progression — summary

> Source: `master/01-levels-scenarios-and-progression.md` · 405 idea entries · 399 KB

## 1.1 The scale ladder (campaign spine)

- **The four ladders, and which one is the campaign (contradiction resolution)** — scale ladder T0–6 is the board/campaign, business L1–L10 the scorecard, P&L the HUD gate, camera Z0–Z5 the art spine (+11 var).
- **Tier 0 — "Hello World" / `index.html` / "Inside the Box"** — one directory on someone's shared server; 12 worker slots teach "out of concurrency, not CPU"; verbs optimize/cache/delete/beg; 6–8 min.
- **Tier 0.5 — "The Noisy Neighbor" (the shared resource)** — tenants visible as 200 windows lit by real resource use; fixes are ticket, resource cage or migrate — commercial, not technical (+2 var).
- **Tier 1 — "One Box" / `root@localhost` / "Your Own Box"** — root on one machine: port grid, services as placeables, RAM/CPU as build budget, first firewall; signature moment is the OOM killer.
- **Tier 2 — "Two U in Someone Else's Cage" / `Cage 14, Row C`** — rack units, cross-connects, amp budget, /29, remote hands $150/hr at 4hr; adds lead time (circuits 60–120 days, hardware 2–12 weeks) (+3 var).
- **Tier 2.5 — "A Rack Of Our Own"** — full cabinet, own switch, 2×30A A+B feeds, first IPMI; unit is the rack; punishes both-PSUs-one-PDU exactly once (+2 var).
- **Tier 3 — "The Stack" / "The Cage" / `prod`** — LB, web tier, DB+replica, cache, CDN, queue, staging; board becomes flows; failover, replication lag, blast radius, first cache stampede.
- **Tier 3.5 — "The Platform" (you sell an API; other people build on you)** — quotas and rate limits; a customer's retry loop is indistinguishable from DDoS; the unlock is a backoff SDK in someone else's codebase.
- **Tier 4 — "Landlord" / "The Floor" / "We Are The Datacenter" / `Suite 200`** — racks are the atom; kW/rack, CRAC, UPS, generator fuel, abuse desk, peering, PUE; renewal pricing is the discipline lever.
- **Tier 5 — "Anycast" / "The Map" / "Two Datacenters, One Company"** — BGP, GSLB, sovereignty, 95th-percentile billing; two DCs is the dangerous number and quorum is a $12–20/mo witness node (+10 var).
- **Tier 6 — "Hyperscale" / "Region Build" / "The Grid" (endgame)** — place datacenters, sign 20-year power contracts; unique verb is arbitration between your own directors, over 3–5 short levels not a sandbox.
- **The difficulty comes from coupling, not HP (design rule)** — six rungs: more objects → connections → shared deps → others' failures → invisible failures → systems you don't operate, where the only verb is communication.
- **The camera ladder (six fixed tiers as authored art treatments)** — Z0 Chassis · Z1 Rack Elevation · Z2 Room Isometric · Z3 Floor Plan · Z4 Campus · Z5 Globe, each its own asset set (+8 var).
- **The Elevator Transition** — no hard cuts between tiers: pull back, dissolve into the parent's summary glyph over 300ms, shrink a white "you are here" frame around what you left.
- **Zoom-as-Abstraction (the LOD swap)** — four representations per entity (sprite → icon → dot → heat-tile share); at LOD3 the object stops existing and folds into its parent's glyph.
- **The Scale Handshake Frame** — the old map fits a rectangle that hard-snaps with an audible detent into the new level's icon grid, labelled `RACK 04`/`IAD1`. The snap, not the zoom, sells it.
- **Per-Tier Composition Rules** — fixed composition per tier (centred warm → off-centre cool → vertical slice → horizontal flow → one-point aisle → orthographic map → orbit), so tier reads from a blurred thumbnail.
- **The Aisle Vanishing Point** — each Tier 4+ hall has one canonical aisle whose vanishing point is the camera home; a far-end alarm glows there even when you are zoomed elsewhere.
- **The Growth Scar** — the outgrown rig stays visible and obsolete (Tier-0 tower as dusty box, "DO NOT DECOM — DNS STILL ON THIS"), clickable and eventually a real liability.
- **The parallel business ladder (CEO framing)** — L0 Side Hustle → L11 Platform with real P&L per rung: L4 loses money at 100×$5, L9 roll-up buys books at 10–18× MRR with 20–35% churn (+3 var).
- **The business difficulty curve** — escalates on visibility (individuals → rates), obligation (commitment ledger), organizational drag, and time constants that outlive the level you decide in.
- **The P&L Ladder (financial complexity as a gated HUD)** — one statement strip per tier: Pocket Money → Invoice & Churn → Capex/Opex ("profitable but broke") → Working Capital → Financing → Portfolio → Enterprise Value.
- **"First Byte" / "The Closet" / "The First Modem" — the unified opener** — one tower in a coat closet, five friends' sites, the customer path a phone cord under the door; unlosable, rated on three thresholds (+11 var) ⚔️ random mom-unplug loss vs telegraphed hazard; one-uplink gate vs POTS-line count as bottleneck.
- **"Founding Day" — level 0 (company creation as a playable level)** — pick legal structure, jurisdiction (a tax and seizure-law dial), hosting type and founding trio; gates which threat families can ever appear.
- **"First Invoice" / "First $10K MRR" — the business-ladder openers** — the opening rung in money: first MRR tick on one VPS, or $10K MRR in 24 months under 8%/mo churn with threats kept gentle.

## 1.2 Perspective-shift levels

- **The Invariant-Core filter (authoring law for every perspective level)** — a perspective level may only change which of the six verbs dominates and what you can see; anything needing a seventh verb is cut or becomes a cutscene.
- **The Perspective Frame Device** — each perspective level gets viewport chrome that *replaces* the HUD (CRT bezels, helmet cam, clipboard, packet tube, desk, helpdesk window), so screen budget stays constant.
- **`The Tenant` / "The Customer"** — you are a small customer inside a datacenter you built earlier; your old decisions are now your constraints, with the payoff staged as your own asset-tag format read on-screen.
- **`Red Team Friday`** — play the attacker against an AI-run host with a budget for botnets and exploits; rendered in attacker tooling, and used attacks permanently enrich your own tooltips.
- **`The NOC Shift` / "On-Call Night"** — 2:47am, six breakages in twenty minutes, three hands, no building; scored on order of operations and MTTR; the false positive is the brightest alert (+4 var).
- **`The New Hire`** — inherit an undocumented stack half-fogged with "???"; three real tools — read runbooks (wrong), read six months of tickets (highest signal), ask someone (costs their hand).
- **`The Auditor` / "Audit Week"** — reach a configuration state, not survive an assault; threats are findings and an inspector walks a pathline with a hard-edged compliance glow (+4 var) ⚔️ one fixed studiable route (sightline puzzle) vs 2–3 randomized telegraphed routes (live misdirection and triage).
- **`The Auditor, Inverted`** — you are the auditor grading an AI-run facility with a checklist; a teaching device disguised as a power fantasy that reveals what auditors look for.
- **`The Datacenter Tech` / "Remote Hands"** — you are the hands in a cold aisle with a cart and ambiguous tickets; the two real problems are ambiguity and bringing the wrong part; camera locked at 1.7m, no zoom.
- **`The Migration Crew` / `The Migration`** — old stack in colour beside a translucent ghost build, TTL bar draining overhead, a detented crossfade lever; desaturation lags 5s so both stacks are briefly real.
- **`The Abuse Desk`** — judge a queue of abuse reports (phishing, spam, DMCA, LE request, one bad-faith competitor filing); too aggressive loses revenue, too slow puts your /24 on the RBL.
- **`The Support Queue Level`** — infer the outage from tickets alone behind a frosted board; handle time, agent cost and deflection ROI make the point that the cheapest ticket was never opened.
- **`The Landlord`** — you are the datacenter: visitors are touring prospects, threats are power/HVAC events and tenants overdrawing circuits; you sell space, power and cross-connects (+3 var).
- **`The CDN`** — you are the edge, hundreds of tiny PoPs and almost no compute; the whole job is cache hit ratio, played as routing and eviction policy rather than towers.
- **`The Upstream`** — you are a transit provider whose visitors are packets and customers are networks; peering disputes become a resource-negotiation minigame.
- **`The Registrar` / `NXDOMAIN`** — you run DNS for everybody; your lane is queries and the boss fight is a reflection/amplification attack that uses you as the weapon against a third party.
- **`Eyes of the Packet`** — you are one HTTP request; the verb is choosing between two paths at each fork with millisecond costs shown, used once as the Latency Ladder tutorial before the first WAF purchase.
- **`Founder Mode` / "The CEO Chair"** — business-only play with infra on autopilot; unified with Sales and Board into the Chair system (Ops/Sales/Finance, switchable with cooldown, delegated while away).
- **`The Sales Chair`** — play the pipeline lead → qualified → demo → security review → procurement → close, where threats are counter-offers, procurement delay, a departing champion and SLA redlines.
- **`The Board Meeting`** — a short interstitial of five slides and four decisions; investors are visitors, skepticism is the threat, and your answers set the next level's budget.
- **`Due Diligence` (walking someone else's floor)** — play an acquirer inspecting, appraising and pricing another company's infrastructure; what you flag becomes what you inherit.
- **`The Capacity Planner`** — a strategic chair with an 18-month horizon, order lead times and nothing to click during an incident; expanded into `The Fleet Week`.
- **`The Apprentice` (you may only write rules)** — you can only author prioritized if/then policies that an AI junior executes cheerfully at 3am; scored on how few times it had to improvise.
- **`The Acquisition` (fogged inheritance)** — half-fogged inherited estate with Probe (20s) and Trace (45s) actions for ~40% of objects; commercial fog too (lost contracts, twelve grandfathered tiers); normalizing their visual dialect is the win condition (+9 var).
- **`The Attacker` / "You Are The DDoS"** — short attacker-side interludes: build a botnet tree, pick a vector, crack an AI host; teaches defense by reversal and previews next level's threats.
- **`The DR Site` (disaster-recovery reversal)** — you play the standby, so the goal is be ready not busy; standby config decays into drift gremlins unless you drill, and grading is brutal.

## 1.3 Hosting-type levels — MOVED

Moved to `02-hosting-types.md` (alongside §0.2 variety engine and §0.3 type catalogue); §1.3 cross-references elsewhere remain valid.

## 1.4 Cross-type and structural levels

- **`Diversify` / `Two Businesses at Once`** — two lines on shared racks/power/staff with opposite peaks; the better version pairs game servers with backup so the "complementary" curves collide.
- **`Pivot` / "The Pivot Level"** — convert the facility to a new business line without stopping revenue; staged as a Mid-Level Re-Skin Wipe advancing one rack row per second (+7 var).
- **`The Junk Hardware Acquisition` / "The Junkyard" / "The Junk Drawer"** — three racks of mismatched gear off a truck: rack, strip, scrap or keep as legacy island; win by cutting acquired power 50% while churning <10%.
- **`The Landlord and the Tenant`** — you are both the colo landlord and one of its tenants, with conflicting interests over the price of power; natural split-screen Double-Header on one budget (+2 var).
- **`Multi-Line` / "The Convergence Level" / "Everything, Everywhere"** — the late-campaign exam: four lines in one facility in a busy week, colliding thermally, electrically and on attention.
- **`The Reseller Channel` — you host hosts who host hosts** — white-label revenue with no end-user visibility; the visitor stream is anonymized and you diagnose by aggregate signal only (+2 var).
- **`Tenant-of-a-tenant recursion`** — an abuse report arrives for a chain you cannot see the end of; the verb is the Passthrough: forward and wait, act on the tenant above, or absorb it yourself.
- **`Two Brands, One Datacenter` (the fighter-brand level)** — premium and budget brands on shared iron that must not share queue, status page or public linkage; win a 40% price war without moving the premium price.
- **`The Same Outage, Six Ways`** — one root cause as six short per-type levels; the cert-expiry version is strongest because colo notices nothing at all.
- **`Two Maps, One Level` — the physical and the logical** — SERVER ROOM and NETWORK are two toggleable views of one board; threats live on one layer or both and you cannot win watching one.
- **`Two-Board Duo Levels`** — an edge board and a back-office board share a data plane; missed payroll or an unpaid invoice silently weakens the edge, making business a load-bearing system.
- **`Dual-Direction Pressure Maps`** — customers and threats both arrive on many edges (mobile, API bots, office VPN), so you defend a shape and choose which edges are worth serving.
- **`Severance` (datacenter divorce)** — a graph-cut puzzle partitioning shared racks and tangled replication so neither half drops a customer, with both halves' threat sets live throughout.
- **`Stack Merge` (the integration level)** — run two incompatible stacks while migrating; no new threats at all, and score is downtime-free merges, ignoring both revenue and attacks.

## 1.5 Scenario library (one-off missions)

- **`Launch Day` / `Hug of Death` / `The Slashdotting`** — traffic ramps 40–200×; no scaling for the first 90s so caching is the only answer; win = convert ≥X% of the spike, not merely survive (+10 var) ⚔️ pre-build then spectate under a hard no-scale rule vs telegraph the hype earlier and keep a narrow live reactive channel.
- **`Black Friday` / `Peak Season`** — the wave schedule is published two in-game weeks ahead, so it is a planning test whose failure mode is over-provisioning into a loss; dropped checkouts cost dollars (+6 var).
- **`Zero Downtime Migration` / `Silent Migration` / `Lift and Shift`** — your build starts finished and must move while serving; replication-lag meter, TTL countdown, dual writes, and 12 sites with hardcoded IPs (+11 var) ⚔️ one siege level doing everything at once vs a two-level act splitting pre-build/sync from the cutover gauntlet.
- **`Post-Breach` / `The Breach` / `The Suspicious Login`** — you start already owned with persistence hidden; rebuild is the only guaranteed cleanse; Forensic Mode scrub bar hatches the window you lack logs for (+8 var).
- **`The Sev-0`** — a breach of regulated data where every technical instinct destroys evidence; the forced sequence is preserve, isolate, document, notify, then remediate, and scoring rewards restraint.
- **`The Certificate Expired` / `Cert Apocalypse`** — wildcard expiry at T+0 gives 95% bounce; harder variant distrusts a root CA so only old clients and your payment callback break while monitoring stays green (+1 var).
- **`Mass Revocation`** — your CA must revoke a date range and you have 5 days; two of them go on discovering how many certs exist, including mTLS, keystores and machines not in inventory.
- **`Power Event` / `Black Start` / `Generator Test`** — 8 minutes of UPS, a 40-second genset start that may fail on a maintenance-weighted roll; the real puzzle is staged restart against inrush (+1 var).
- **`EPO`** — someone hits Emergency Power Off and everything including UPS bypass dies instantly; a cold start from zero with crash recovery, a degraded array and two boxes that won't POST.
- **`Retransfer`** — the ATS won't transfer back off generator; repairing it requires a deliberate outage of the thing keeping you up, against fuel burn and noise complaints (+1 var).
- **`Wet Stacking`** — your own monthly 20-minute 5%-load genset test has been fouling the engine for two years; surfaces a hidden Engine Health stat degraded by your maintenance regime.
- **`Fuel Truck`** — 8 hours of diesel, a vendor that will miss its 4-hour SLA, and load to shed; whether you prepaid a fuel-priority agreement levels ago is the hidden variable.
- **`The Fire Department Cut The Power`** — a fire elsewhere in the building de-energises it and bars entry; you cannot act at all, only shut workloads down gracefully before the UPS dies (+1 var).
- **`Cooling Failure` / `Heatwave` / `Cold Aisle Chaos` / `Heat Dome`** — heat spreads as a DoT field making adjacency matter; ride-through time is computable from heat load and air volume; propping doors open is worse than it sounds.
- **`The Fiber Cut` / `Cable Cut` / `Fiber Seeking Backhoe`** — a backhoe halves inbound capacity; the real lesson is you cannot verify path diversity yourself, so buy a slow path audit that may answer "cannot confirm".
- **`Underwater`** — a submarine cable cut costs a region six weeks of connectivity; you re-architect around a permanently worse network and decide whether to refund or serve badly.
- **`Ransomware Sunday` / `Ransomware Friday`** — encryption spreads node to node; the question is whether backups actually restore, so restore speed is the whole game and untested backups are decorative (+4 var).
- **`Rebuild Window`** — a degraded RAID6 rebuilds for 19 hours at half performance; the real knob is the rebuild priority dial, plus restoring to new hardware in parallel and paying for both.
- **`The Angry Whale` / `The Concentration Crisis` / `The Sole Whale`** — your 30–80%-of-revenue customer threatens to leave; their demands distort the whole build and firing them is a legitimate scored strategy (+10 var).
- **`Compliance Week` / `The Audit` / `Audit Pass`** — add segmentation, logging and access control under a deadline, each with a latency or cost tax; you collect evidence tokens and are failed retroactively for earlier shortcuts (+7 var).
- **`The Copycat` / `The Price War`** — a competitor cuts 40% or a funded rival prices below your COGS; answer with price, features, reputation, differentiation or moving upmarket, and none is good (+3 var).
- **`Hug of Death (Charity Stream)` / `Viral Moment`** — you want the flood: every visitor served is money and every bounce is lost money, inverting the instinct to throttle.
- **`Viral Customer`** — a tiny customer becomes famous and cannot pay for what they now need; carry them for prestige, renegotiate mid-spike, throttle them, or let them eat the cluster.
- **`Bad Deploy Friday` / `The Ship-It Friday`** — a 4:55pm bug with a 6-minute rollback and an irreversible migration; a coincidental attack is live too, so you must identify the cause before choosing (+2 var).
- **`The Quiet Month` / `Reverse Wave` / `The Good Problem`** — no threats, only cash flow and the temptation to overbuild; needs a live antagonist (the budget, an Efficiency Frontier) and a decision every 25–40s (+4 var).
- **`Peering War` / `Peering Ratio` / `Peer Review` / `Ratio`** — settlement-free peering wants balanced traffic and you are 20:1 outbound; the interesting fix is acquiring an inbound-heavy business line to rebalance (+2 var).
- **`Upstream Divorce` / `Hostile Upstream` / `Null Route`** — your transit provider depeers or drops your prefix; re-home BGP under fire, and you have a second transit only if you bought one earlier (+2 var).
- **`The Insider`** — an employee is exfiltrating and you cannot see who; detection needs logging you may not have, and firing requires atomic revocation (+2 var).
- **`The Fake Employee`** — the remote contractor you hired three months ago is not who they claimed; access review and forensics under a disclosure clock, made worse by their work being load-bearing.
- **`Datacenter Build` / `First Watt`** — lay power, cooling, trays and rows to a blueprint with zero customers, knowing you must operate it next mission; threats are inspections, supply chain and permits (+2 var).
- **`Bare Metal Bring-Up`** — rack, cable, power and image 20 machines against a clock with zero threats; a breather that is secretly a cabling-skill exam.
- **`The Regulator` / `The Regulator Calls` / `Regulatory Shift`** — 30 days to localize data, or a takedown requiring you to find one tenant's content among thousands without collateral outage.
- **`The Lawful Intercept Request`** — a gagged, legally binding demand for ongoing access; you must build a backdoor-by-design with its own attack surface, operate it secretly, and live with it.
- **`Sanctions Screening` / `The Sanctioned Tenant` / `Sanction Line`** — identify affected customers among 4,000 by address, geo, ownership chain or payment method, using data you may never have collected; one is your best payer.
- **`Leap Second / Y2038 / DST` / `The Date Bug`** — a timing bug lands at a known future moment; pure preparation, breaking cron, TLS validity and one runtime that spins to 100% CPU (+1 var).
- **`Free Tier Flood` / `Free Tier Abuse` / `Free Tier Invaded`** — marketing launched a free tier; within 48 hours it is 90% miners and spam relays, and tightening verification kills genuine growth (+2 var).
- **`Sold Out` / `Lead Time`** — a signed contract and no capacity, servers 40 weeks out: buy at 3× markup, cram and risk thermals, sell what you lack, or break the contract (+3 var).
- **`The Honeymoon`** — a brand-new datacenter with zero customers; 80% attraction mechanics and almost no threats, with an empty visitor's chair as the objective totem.
- **`Two Masters` / `Split Brain`** — two DCs lose their link and both accept writes; reconciliation permanently destroys some customers' orders, and the cheap prevention was an unbought witness node (+3 var).
- **`Zero-Day Sunday` / `Zero-Day Tuesday` / `Zero Day Wednesday` / `Patch Tuesday`** — RCE in 80–100% of the fleet; phase one is discovering whether you are affected (inventory: hour 1 vs hour 30), then four bad options with stated cost/coverage (+2 var).
- **`The Change Freeze` / `Frozen Change` / `Read-Only Friday`** — no deploys for N days and something breaks on day 3; only runtime knobs, flags, TTLs and steering; you may break the freeze once and it is recorded.
- **`Cost Cut` / `Cost Cutting` / `The Bad Quarter`** — cut upkeep 20–40% and keep the SLA; each cut is a card whose delayed cost lands one or two levels later, teaching what you over-built.
- **`The Long Weekend` / "No Hands" / `Skeleton Crew` / `Founder's Vacation`** — manual actions are capped or banned, so only automation and standing rules run; nothing dramatic happens until hour 60.
- **`The Understaffed Sunday`** — an ordinary level with a quarter of your hands; nothing dramatic happens, the failure mode is accumulation, and the score is the backlog you hand to Monday.
- **`The Intern`** — an AI unit wanders your network doing well-meaning damage and cannot be fired; you build guardrails — permissions, staging, change windows — instead of defenses.
- **`The Influencer` / `The Demo` / `The Tour` / `White Glove`** — one escorted unit outweighs 10,000; the Demo's beautified presentation view (y-axis off zero) gives +35% close with a 20% chance their engineer notices.
- **`Chip Shortage` / `Supply Drought`** — one component triples in cost or cannot be bought at all for the level; you redesign around scarcity using only repair, repurpose and optimize.
- **`Blacklisted` / `Spamhaus SBL`** — one popped reseller client lists your /24 and breaks mail for 600 customers; the recovery curve is the level — delisting cooldowns, escalating repeat penalties, cached reputation (+2 var).
- **`The Lame Delegation`** — a stale glue record makes 25% of queries fail intermittently, below every alerting threshold; teaches partial DNS failure and per-nameserver synthetic checks.
- **`The Chargeback Wave` / `Processor Freeze` / `Rolling Reserve`** — four stages: disputes, a months-long monitoring program at $25–100/dispute, a 10–20% rolling reserve held 90–180 days, then termination above 1% (+3 var).
- **`Debanked`** — your bank, not your processor, exits with 30 days' notice; migrating money plumbing under a clock, where 40% of direct-debit mandates never re-authorize.
- **`Runway: 6 Weeks` / `Insolvency Run` / `Payroll Friday`** — profitable on paper, $40k short Friday; a six-tier escape menu from pausing ads to factoring, selling IPv4, and the merchant cash advance trap (+4 var).
- **`Covenant`** — your lender requires EBITDA above X, so otherwise-correct investments trip it; growth vs solvency with the bank as antagonist and no attacker on screen.
- **`Collections Week`** — aged receivables as cards with a hidden can/can't/won't-pay flag; the counterintuitive truth is that suspending a big delinquent guarantees you are never paid.
- **`Deadbeat Quarter`** — 20% of invoices go unpaid; the cash-flow-versus-revenue divergence lesson delivered as a whole-level condition rather than an event.
- **`Data Hostage`** — a non-paying customer's data is suspended; the PR risk of deleting it against the cost of keeping it, where one wrong move is a viral thread.
- **`The Price Hike` / `Vendor Shock` / `The Relicense`** — a vendor raises 300–400% on 60 days' notice, priced just below your migration cost — so a rehearsed migration path you never use is the negotiation leverage (+2 var).
- **`The Free Thing Started Charging`** — a free TLS issuer, DNS, mirror or API starts billing; invisible on the P&L and load-bearing, so the level is discovering everything free you depend on.
- **`The RFP`** — a 200-seat enterprise deal: security questionnaire, a SOC 2 you lack, net-60, real penalties, the incumbent, the champion who may leave, and column-fodder bidder counts (+2 var).
- **`Contract Recompete` / `The Renewal`** — improve metrics visibly within N waves or lose the tenant; in the vendor version your leverage is a credible threat to leave, credible only if you built the alternative.
- **`The Competitor's Obituary` / `Fire Sale` / `The Good Samaritan`** — 400–900 panicked refugees in an hour, price-anchored to the rates that killed their host; honouring those rates imports the failed business model (+6 var).
- **`The Reciprocal`** — a rival asks to run critical customers on your spare capacity for a fee; introduces the mutual-aid agreement as long-horizon insurance between competitors.
- **`Review Bomb` / `The Viral Competitor Smear` / `Media Attention`** — an astroturf campaign drops organic signups 60%; rebuild without buying fake reviews, which detonate later; damage lands regardless of real uptime.
- **`The Founder Bus Factor` / `Key Person` / `The Bus Factor` / `Two Weeks' Notice`** — your only senior resigns and you allocate their fourteen remaining days between documenting, training, fixing or handing over relationships; the rest is lost.
- **`IP Exhaustion`** — out of IPv4: buy at ~$40/IP, lease at ~$0.55/IP/mo, deploy IPv6+CGNAT and take complaints, or turn away business (+2 var).
- **`The Landlord Renewal` / `Landlord Squeeze`** — the colo renewal comes back +35% (or +60% after an acquisition); negotiate, sign longer for a better rate, or physically migrate across town (+1 var).
- **`The Data Center Move`** — physically relocate a rack: trucks, downtime windows, a server that won't POST because a DIMM walked, and the customer who ignored the notice (+1 var).
- **`Hurricane / Regional Event` / `Force Majeure`** — a weather front with a visible leading edge and ETA; fuel contracts, priority delivery agreements and generator runtime decide it, and fuel level becomes the HUD (+9 var).
- **`Smoke`** — a wildfire 50km away threatens only the air: filters clog, contacts corrode, economisers must shut, staff cannot be on site, and you have days.
- **`Dry Season`** — water restrictions make evaporative cooling illegal; PUE advantage evaporates and cooling jumps 40%, introducing WUE as a second efficiency number and a PR liability.
- **`The Cheap Bid`** — refurb-only hardware, budget as a shrinking ruler, scuffed mismatched beiges drawn from Vendor House Styles, each still wearing another company's readable asset tag.
- **`Hardware Refresh Weekend`** — a translucent change-window band sweeps the timeline; its hard trailing edge clips any operation still in flight, turning its progress arc red mid-sweep.
- **`The Warranty Cliff` / `Depreciation Cliff`** — 40 machines exit warranty the same day; renew punitively, stock spares, or gamble — and without support you cannot download firmware for a known vulnerability.
- **`DDoS Season`** — an elevated attack baseline for the whole level, rendered as permanent magenta haze at the map edges and a pressure gradient rather than discrete waves (+1 var).
- **`The Ransom Customer` / `Ransom DDoS` / `Extortion`** — a demo attack then a countdown email; paying works, is cheap, is scored as failure, marks you permanently, and worsens the next level's attacker pool (+3 var).
- **`Sell the Company`** — maximize valuation over 12 months; EBITDA tricks get clawed back in diligence, so split into the run-up here and `Due Diligence` as the close (+6 var).
- **`Legacy Mode` (period flashback)** — a 1998 flashback in the CRT/terminal art style with simplified mechanics, shipping the alternate art style as content rather than an option (+4 var).
- **`The Decom` / "Lights Out"** — shut a facility down row by row, cut and coil cables, lift the floor tiles; the last shot is an empty white room (+2 var).
- **`The Grand Opening`** — a ribbon, a photographer and 200 guests on an unfinished floor that is already live with tenants, so a real incident can happen with press in the room.
- **`The Slow Week After`** — nothing is broken and everything is fragile: postmortem, customer calls, credits, two engineers threatening to quit; scored on retained MRR and morale.
- **`The RFO`** — assemble a signed Reason For Outage in 5 days by dragging real telemetry into a report; what you can include is what you retained, and commitments become binding obligations (+4 var).
- **`Someone Else's Outage`** — a cloud region dies and you are fine, but your customers' dependencies are not; the support queue explodes and graceful handling spikes sales.
- **`The Vendor Bridge`** — an escalation-ladder minigame past L1, L2 and the account manager; your Vendor Relationship stat skips gates, and the fix is a known one-line change.
- **`Break Glass`** — your SSO is down and it authenticates everything; the only path is a sealed break-glass credential nobody tested, whose password is in the vault that is down.
- **`Metastable`** — retries sustain overload after the spike ends and the system won't recover at normal load; the fix is shedding load, and the instinct to add capacity makes it worse.
- **`The Threshold Day` (the "nothing changed" level)** — you grew into a limit that always existed (TCAM, a wrapping counter, a 90% filesystem); the question is what grew, not what changed.
- **`The Feature Flag That Was Left On`** — a dormant three-month-old config activates when another condition changes; diagnosis is impossible from present evidence and requires reading the change log.
- **`The Bisect`** — halve the backends out of rotation, observe, repeat; each bisection costs capacity and time, and the verb unlocks permanently as a general tool.
- **`The Whitelisted Office`** — you cannot reproduce it because your office IP has been allow-listed since 2019; the fix is testing from somewhere unprivileged via the External Vantage buildable.
- **`Index Rebuild`** — one eleven-hour unpausable operation at half capacity while everything else continues; the whole level is running the business at 50%.
- **`The Circuit Order`** — a second transit circuit starts a 60–120 day staged clock that can slip by months while you stay single-homed; installs the reflex to order before you need it.
- **`The Transformer`** — your utility feed needs a transformer with a 104-week lead time, so you cannot grow for two years and must find everything in efficiency and shedding.
- **`Customs`** — forty paid-for servers sit unreachable in a bonded warehouse 4km away on wrong paperwork; serve the contracted capacity by renting, borrowing, overselling or delaying.
- **`The Counterfeit`** — your last optics order was fake and mostly works; the mechanic is distrust, because every unrelated failure becomes a suspect until you test or replace wholesale.
- **`Export Control` / `In Scope, Out of Country`** — new rules bar specific hardware from specific customers; the GPU version is determining who really uses the compute, with a subpoena eighteen months out.
- **`The Nexus Letter`** — a tax authority bills three years of uncollected sales tax; register and negotiate disclosure, ignore and compound, or geo-block — then rebuild billing per jurisdiction.
- **`The Audit-Within-A-Level`** — a surprise SPLA licensing audit finds under-reported seats, producing a back-bill, a true-up and a permanent change to how carefully you count.
- **`Compliance Sunset`** — an attestation expires in 45 days and deals freeze until renewed; nothing breaks technically, your pipeline just stops moving while you watch.
- **`Insourcing`** — your biggest enterprise customer announces they are building their own; 18 months to replace the revenue, with a visible countdown and no villain.
- **`Reseller Revolt`** — a competitor courts the reseller holding 25% of your accounts; you have no direct relationship with the end customers, so all leverage is theirs.
- **`The Price of Power Went Negative`** — grid conditions make electricity free for hours and every interruptible workload prints money, paying off spot tiers and checkpointing others skipped.
- **`Dry Run` variants and the `Fire Drill` modifier** — cross-reference to `The Dry Run` (you prepare and the event is cancelled) and the `Fire Drill` modifier; both make preparation itself scoreable.
- **`The Two-Node Lie`** — survive a full server failure with zero downtime; a load balancer with one backend is a single point of failure with extra latency, taught by the corpse.
- **`The Bill Comes Due`** — a bandwidth overage invoice with three buttons: pay in full, pay partial (compounding late-fee units), or a terms-negotiation minigame buying 15 days ⚔️ hard uplink-pull loss vs a soft deplatform patience meter that degrades with late bills.
- **`Crypto Winter`** — GPU customers vanish, prices crater and upkeep stays; survive N months while repurposing the fleet, on the thesis that overbuilding is itself a threat.
- **`The Long Night`** — no build phases, limited repairs and an on-call fatigue mechanic; you win by not making a mistake at 4am ⚔️ a 100-wave literal marathon vs ~10–12 escalating scripted incidents with a repair budget and sleep-or-patrol lulls.
- **`Legacy Debt` / `Legacy Purge`** — infrastructure that works until you touch it; a DO-NOT-DELETE dependency that is the build cache and an unlabelled one that is load-bearing, plus the ongoing Legacy Tax upkeep.
- **`The Offshore Gamble` / `The Chain of Custody` / `The Subpoena Raid`** — bulletproof money pays 3× and raises a seizure meter; the raid is unstoppable and you only prepare, losing evidence rather than money.
- **`Escorting a Container` / `The Slug`** — physically drive one 40U GPU sled from truck to rack under attack; the Slug variant escorts an 800kg tape library whose loss destroys an archive permanently.
- **`The Cutting-Over Gantt`** — the whole UI is one timeline bar; all work must finish before the marker sweeps to GO LIVE, and the Gantt is the only clock, telegraph and score sheet.
- **`Everything Rains` (Murphy's week)** — 5–7 medium unrelated failures in one shift; triage ordering under a second-worst clock, because failures cluster when they share causes.
- **`The Straggler Tail`** — 97% cut over and the last 3% are ignored TTLs, a fax machine, a hardcoded embedded device and a guy on ISDN, each a tiny detective puzzle.
- **`The Maintenance Collision`** — your cutover, the carrier's no-exceptions window and a neighbour's power work land the same night, with fog of war on the calendar and no single wrong decision.
- **`The Subsea Severance` / `Cable-Cut Winter`** — three cables cut in a day make your landfall the last healthy lane; transit spot prices 100×, a charterable repair ship, and a gouge-or-hero pricing fork.
- **`Space Weather`** — a geomagnetic storm degrades power frequency, NTP and satellite backhaul on one noisy forecast clock; clock drift silently breaks auth, logs and consensus.
- **`The Deep Test` (the sealed capsule)** — a sealed undersea capsule serves 90 days with zero physical access; every repair is software-only and the pre-launch checklist decides everything.
- **`Light-Year Latency`** — your own inputs arrive 600ms late, so incident command becomes pre-authorizing policies; the level that justifies every automation purchase the player resented.
- **`Harvest Now, Decrypt Later`** — three or four quiet levels while an APT only mirrors your encrypted traffic, then every stored session replays as live attacks unless you rotated to post-quantum.
- **`The Oversell Doctrine`** — 500 sites on one machine if nothing goes wrong; the Oversell Ratio dial trades margin against chained noisy-neighbor events and reputation collapse.
- **`The Esports Finals` / `Game Launch Night`** — 10× concurrent players for six hours live-streamed; win is zero lag spikes on featured matches, and the auth queue is the launch variant's main defense.
- **`The GPU Gold Rush`** — AI tenants want 40× A-class nodes now; you can hit the revenue target and still go bankrupt on depreciation when the bubble cools mid-level.
- **`Green Datacenter`** — hit a PUE or renewable target while staying profitable; cooling and power quality are the whole puzzle, quietly teaching facility economics before they are charged for.
- **`The Open-Source Fork`** — a rival forks your published tooling and therefore knows your infrastructure patterns precisely; the one level where generosity is the attack surface.
- **`The Fire`** — a Strasbourg-style hall fire: halon pours, staff evacuate, territory is lost instantly, and it hard-pivots to DR while scammers pile on; untested backups half-fail.

## 1.6 Progression shape between levels

- **Ratchet unlocks (the world gets harder, announced)** — each tier permanently adds an always-on mechanic (power, heat, jurisdiction, compliance); the announced stack of concerns is the difficulty curve.
- **Legacy debt carry-over** — choices persist as Legacy objects you cannot cheaply remove; priced by the Rebuildability index, with debt amnesty at a one-off cost as a stated rule.
- **Carry-over, but thin (what actually persists)** — you keep tech, 3 named staff, reputation and capped cash; you lose the build, so layout resets while liabilities and relationships carry as constraint cards.
- **The Company Ledger** — a persistent meta-save of cash, reputation, staff and scars; better framed as a Book of Business that losing shortens rather than resets.
- **The three floors (required, or the campaign becomes unwinnable)** — a cash floor triggering a scripted bridge, a cap of three active scars, and debt amnesty for any legacy object.
- **Scars** — permanent failure modifiers capped at 3, each with a stated remission path, one granted upside, and a disclose-or-conceal choice that detonates in diligence.
- **Named customers persist (the recurring cast)** — cap at 12 named accounts split into spine cast (always present, safe to reference) and siding cast; churned customers are 20–40% winnable unless they left angry.
- **The difficulty dials, assigned to layers (contradiction resolution)** — business model is the run/faction selector, SLA tier a per-contract term, price an in-level lever, operator modifiers optional toggles; one derived Pressure Estimate.
- **Difficulty as SLA** — you contractually promise 99% to 99.999%, diegetically moving both reward and failure threshold (+2 var) ⚔️ scale reward and punishment together vs scale reward only and cap the penalty, since punishing a chosen difficulty reads as cheating.
- **Difficulty as Business Model (the faction selector)** — pick Budget Shared Host, Managed Enterprise or High-Risk Vertical; same systems, wildly different threat, margin and abuse profiles.
- **Operator-mode modifiers** — optional toggles: Snowflake (no config management), Bus Factor 1, Boutique Managed, Cash Only, Observability Debt (the game literally hides information) (+7 var).
- **Authentic difficulty knobs (rather than arbitrary multipliers)** — every axis is a nameable operating parameter — oversubscription ratio, lead time, staff depth, observability debt, config drift, customer quality mix; no hidden HP multipliers (+6 var).
- **Achievement gates (replacing MRR gates)** — MRR-duration gates reward waiting, so gate on shape instead: three $2k customers simultaneously with zero breaches, or revenue under contract past N months.
- **The Ratchet (product decisions are one-way doors)** — once you sell an SLA tier you can never quietly stop offering it, because downgrading a product is itself a churn event.
- **Cohort View** — between levels see the retention curve of everyone you signed; fast growth at 40% month-12 retention scores worse than slow growth at 85%.
- **The Quarterly Board Meeting** — between acts pick one company-wide mandate from Growth / Margin / Trust, shifting scoring weights and branching the campaign without building three campaigns (+5 var).
- **The Uptime Streak → the Credit Grade** — consecutive breach-free minutes plus documentation, audited financials and diversification feed a credit grade priced by four counterparties.
- **The Multiple (a persistent meta-stat)** — a valuation multiple on the ledger rising with contract length, diversification and margin, falling with concentration and key-person risk; `The Exit` cashes it.
- **Ramp-up debt (channels are expensive to start and impossible to restart quickly)** — content 6 months, SEO 9–12, outbound 4–6, partners 6–9 to ramp, instant to switch off, making a marketing cut feel irreversible.
- **Prestige: "The Exit"** — cash out and restart at Tier 0 keeping exactly three tech nodes, one Doctrine and your Playbook; seven exit types from IPO to dignified wind-down (+4 var).
- **Seasonality (the commercial and thermal year)** — summer heat, holiday peaks, January churn, Q4 spikes, August staffing, Patch Tuesday; each type's Timeline Ribbon silhouette becomes a business fingerprint.
- **The Seasonal Physical Calendar** — leaf-on, spring pollen in filters, ice storms, fire-marshal visits, load-bank tests, and the Dec 20–Jan 5 shipping dead zone, read off a twelve-wedge Season Wheel.
- **The Long Weekend / the on-call clock** — levels starting Friday 5pm with decaying staff availability; overnight runs fast, so risky maintenance there is safer for customers and worse for engineers.
- **Chapter bosses (with a readable three-phase shape)** — probing, then the real attempt at the weakest point found, then a consequence on the business screen: a bill, a listing, a lawsuit, a churn wave (+1 var).
- **Sandbox unlock parity** — every campaign scenario unlocks its map and ruleset in free play, making the campaign double as the sandbox's tutorial (+6 var).
- **The Type Ladder and the Sampler Structure** — types gate by tier, CA/PKI and registry last; 6–8 lines per run of which shared web and colo are mandatory, the rest drafted from ~35–40.
- **The Business-Type Tech Web (not a tree)** — types are web nodes where adjacency means shared infrastructure, so shared→VPS is cheap and shared→GPU needs an intermediate or capital injection.
- **The Era Track** — 1994 → 2001 → 2008 → 2016 → 2024 → near future as a third axis, changing tech, expectations, threat mix and palette, and retiring buildables (+4 var).
- **The Nine Tiers (uptime "lives" as the progression spine)** — lives denominated in nines: start at 99.9%, each outage or churned whale eats one, and restoring a nine buys back SLA-credit liability.
- **Reverse-gate progression** — some tech branches unlock only by having suffered the matching attack, so accepting risk becomes an unlock path; worth having exactly one of.
- **Reputation Echo chaining** — the previous grade rewrites the next opening: 3★ spawns customers closer with a referral wave, 1★ spawns them farther with churn vultures circling.
- **Three-star meter = Uptime / Profit / Retention** — three independent axes, so a level can be 3★ for profit and 0★ for retention, and star gates force replay with different strategies.
- **"New Game+ Compliance Mode"** — replaying early levels with a mature toolkit retroactively attracts tailored attacks, because your tech tree itself widens your threat surface.

## 1.7 Difficulty curve craft

- **The Wave Envelope (resolving waves vs continuous flow)** — baseline traffic is continuous and diurnal; events are shaped envelopes (ramp, plateau, decay, composition, telegraph) laid over it, so queueing and waves both survive.
- **The Pressure Budget** — a sawtooth with a rising floor where the dips are build time; at most 4 threat entries per wave, first wave ≤40% of par, troughs ≥45% below the preceding peak (+1 var).
- **The Two-Beat Wave** — every threat event is immediately followed by a visitor surge, so spending everything on survival leaves nothing to monetize; this rhythm generates most interesting decisions.
- **Two difficulty axes, never one** — waves scale on Volume (tests your build) and Variety (tests your coverage), alternating each shift so the player alternates between widening and deepening (+1 var).
- **Telegraph Depth, and the information-design law (three-way contradiction resolution)** — waves are loudly telegraphed, incidents never labelled; weather always visible, storms telegraphed, hunters symptom-only, entropy visible only if you bought the instrument.
- **Grace Windows → the Triage Window / the Attention Grace** — replaces the exploitable post-failure traffic pause: arrivals queue visibly outside with patience draining, while duplicate alerts are suppressed and one focus hand is freed for 30 seconds.
- **The Difficulty Dial the Player Turns** — price sets tempo, but affects the existing base only at renewal, so the slider shows immediate new-signup effect and a slow base fill bar; floored by minimum viable scale and market-share decay.
- **Anti-Turtle Clock (caused, not arbitrary)** — upkeep rises as a function of your own estate's age and size (depreciation, licence creep, patch debt, salary growth), not a wall clock, so camping is punished legibly.
- **Peacetime is the real boss (and must be scored)** — four scored meters (drills, hollow icons filled, debt paid, conformance) at ~60/40 peacetime-to-incident and up to 25% of points; speed >1× locked while any capability is undrilled.
- **Downshift levels (the deliberate exhale)** — after any "barely held it together" result the next level is automatically smaller and wave-free, scored on debt paid, drills run and documentation written.
- **Pressure carry-over (the fatigue ledger between levels)** — team fatigue and technical debt carry as starting values shown on the level-select card, so a brutal win begins the next level at 60% hands.
- **The Mercy Rule / Consultant Mode** — a third consecutive loss offers a greybeard who asks three questions (what changed, what does your monitoring say, is it actually down) rather than naming your mistakes.
- **The Comeback Curve** — the bottom must be playable: low reputation means fewer visitors and fewer threats, with an ordered survival ladder ending in firing the worst 10% of accounts before cutting staff.
- **The Failure Ladder (losing drops you, it doesn't restart you)** — failure routes to a recovery scenario matching its cause (Chapter 11, The Notification, The Win-Back, Re-homing) carrying a Failure-Only unlock (+4 var).
- **The Fail-Forward Fade (how a loss is presented)** — no modal: the camera pulls back to the Establishing Frame while the facility darkens in dependency order over eight seconds, the first thing you ever built going last.
- **The Three-Clock Rule** — the player watches exactly three clocks — the next wave, the next bill, the current incident — used as a design gate on adding any new timed system.
- **Soft failure over hard failure (and the hard-cliff exception rule)** — degrade rather than end, and permit a hard cliff only where reality has one and a cheap purchasable prevention was visible for 5+ minutes beforehand.
- **Difficulty expressed as chrome** — higher difficulty adds instrumentation rather than numbers, so a veteran level's HUD looks like an aircraft cockpit next to the tutorial's single dial (+2 var).
- **The Nines Ceiling** — each level's uptime target is a physical notch on the wall like a height chart, with your rolling uptime as a water line rising and falling against it.
- **The density/interface lockstep rule** — aggregate management verbs must unlock exactly one tier before the density that demands them; getting this off by one tier is the likeliest cause of a mid-campaign quit.
- **"Panic Button" levels (designed to lose)** — openly unwinnable bonus scenarios scored on grace under pressure: survival minutes, communication quality, postmortem accuracy, customers evacuated.
- **Scale-Skip challenge levels** — start cold at tier 4 with a pre-built bad datacenter and inherited upkeep debt, giving pure ops triage from the first second and generating every legacy-debt variant.

## 1.8 Tier postcards: the visual identity of each scale

- **The Closet (Tier 0 art note)** — one beige tower under a desk in a warm carpeted domestic room with a cat on the cable; deliberately un-sci-fi so Tier 1's cold blue reads as graduation.
- **The Density Ramp** — each tier raises objects per screen and lowers pixels per object, authored at four LODs where LOD3 means the object stops existing inside its parent's glyph.
- **The Cable Entropy Curve** — cable bundling collapses N links into one sheathed trunk with an "×12" badge at its midpoint; hovering fans it back out so tidiness never costs traceability.
- **The Noise Floor** — ambient activity you don't control (other tenants' lights, techs with carts, a flickering tube) makes the facility feel alive and forces your own signals to have better contrast.
- **Sky / Time-of-day Bands** — levels run dawn to night with traffic as a diurnal wave; era sets the base grade, line sets accent and material, time of day only sets light direction and temperature.
- **The Weather Card** — a mid-century forecast card in the corner with sun/cloud/storm glyph, outside temperature and a grid-price arrow, tinted to match the level's outdoor light.
- **The Blueprint Rewind / the Blueprint Wipe** — levels open as a cyanotype blueprint that develops into the world, reuse the look for pause/plan mode, and close leaving a shareable blueprint card.
- **The Establishing Frame vs the Working Frame** — every level ships two compositions: a cinematic 6-second establishing frame reused for cards and loading, and a flat boring-on-purpose working camera.
- **The Company Wall** — meta-progression is an office wall filling with framed blueprint cards, pegboard hardware, press clippings, swag, patches and denser whiteboard sketches.
- **The Asset-Tag Ledger** — every machine carries a numbered tag and one of five earned age states (New, Working, Aged, Legacy, Cursed) applied as material variants, not new models.
- **Rack Elevation Diff** — a between-levels before/after rack elevation animation of what changed, which reads like a changelog you can actually look at.
- **Scale-Anchor Object** — one object stays identical at every tier for reference — a coffee cup at board altitude, a person at rack scale, a city on the world map.
- **The "You Are Here" Sticker** — the camera's position is marked in-world by a printed floor-plan sticker on the nearest row's end cap, which grows on zoom-out until it becomes the minimap.
- **The Logo Evolves (reputation as typography)** — your mark goes from clip-art Comic Sans taped to a tower to etched aluminium, with the five fidelity bands tied to reputation rather than tier.
- **Tier-Up Title Card** — a full-screen typographic card between tiers set in that tier's font, from dot-matrix printout at Tier 0 to crisp modern sans at Tier 5.

## 1.9 Level grammar and authoring laws

- **The Level Grammar (anti-fragmentation rule)** — every level is assembled from six slots: SCALE × BUSINESS × SCARCITY × LANE SHAPE × CLOCK × GOAL, so one verb set is re-read through new constraints (+4 var).
- **The Binding Constraint promise** — each briefing states in one line which resource will kill you ("in cold storage, latency is free and durability is everything"), so players can name the level before wave one.
- **The Invariant Core (six verbs, never swapped)** — Observe, Diagnose, Place & Connect, Tune, Triage, Commit and no seventh; a new type may replace at most 20% of the palette, and Cash/Reputation/Hands are always on screen.
- **The Handover Note (60-second orientation for a ruleset swap)** — a hand-written sheet from the outgoing operator with exactly three lines: what runs out first, what kills you, what the customer actually wants.
- **The Rosetta Card (teaching that it is the same game)** — a renamed mechanic gets a one-line equivalence in different ink ("power oversubscription is your oversell ratio"), collecting into a Rosetta codex page.
- **The Returning Type doctrine (novelty, then mastery)** — every type appears at least twice: introduction with a restricted palette, then mastery two tiers later, unwinnable without a mechanic learned elsewhere.
- **The Portable Skill Table (what each type teaches that transfers)** — a 24-row table pairing each hosting type with its one transferable lesson (DNS: TTL is a throttle you own; HPC: the slowest member sets the speed); campaign order derives from it.
- **The Level Archetype Taxonomy (and the no-repeat rule)** — eleven archetypes (Endure, Convert, Reach-State, Escort, Diagnose, Build-to-Spec, Shrink, Schedule, Negotiate, Hold-Without-Hands, Inherit), one per level, never twice consecutively (+3 var).
- **The scenario length buckets** — Interludes 3–6 min (one mechanic, no build), Scenarios 12–20 min, Sieges 30–45 min; ship one interlude every two levels, one scenario every three, one siege per act (+1 var).
- **The Cold Start Minute (a spec for the first 90 seconds of every level)** — 0:00 cold open and handover, 0:15 one free successful conversion, 0:40 the signature constraint telegraphed harmlessly, 1:10 a two-option decision affordable once.
- **The Three-Act Shape (with concrete lengths)** — Act I 8 levels at 10–15 min, Act II 12 levels at 20–30 min, Act III 8 levels at 30–45 min; ~14–18 hours total, two perspective levels per act minimum (+4 var).
- **The Gated Syllabus rule** — each act ends with a competence check using only that act's verbs, and no new system ever lands in a boss level, so spikes are execution, never vocabulary.
- **QA grammar: the one-frame thumbnail test** — every level's 128px thumbnail must communicate hosting type, scale and scenario with no text, governing the visual budget from the first concept sketch.

## 1.10 In-level structure: shifts, windows, forks and framing

- **Shift Structure (day/night pacing)** — each shift is a soft-time Business Day (build, sell, price) then a hard-time Peak; Peak grows and the Business Day shrinks across the level (+2 var).
- **The Change Window** — building during Peak risks a self-inflicted outage proportional to the object's centrality, while Business Day building is free — fix now and maybe break it, or bleed until 3am.
- **Quarter Arc** — a campaign level is one fiscal quarter of ~13 shifts: 1–4 introduce, 5–9 mix, 10–12 stack, shift 13 is the Quarter Event, then the Quarterly Review score screen.
- **The Signed Contract (pre-level difficulty as a negotiation)** — four pre-level sliders (availability, response, scope, term) with a live reward number, stamped or rejected at level end, replacing a difficulty menu (+1 var).
- **The Difficulty Contract / Statement of Work** — the briefing is a signed one-page SOW naming the customer, the SLA promise, the budget, the duration and the three scored things, with some terms negotiable first.
- **The Deal Sheet (level intro card)** — every level opens on a physical artifact — a faxed RFP, a napkin diagram, a pager printout — whose art states era and hosting type before you read a word (+3 var).
- **The Objective Totem** — one physical on-board object *is* the win condition (a TTL hourglass, a blank framed certificate, a fuel gauge on the door) and does something physical on completion.
- **The Constraint Band** — scenario rules modify the UI furniture they constrain: hazard tape over the deploy button, a REFURB ONLY sticker, an out-of-office note on the hands dock, a dust sheet over graphs.
- **The Midpoint Fork** — at 45–55% play pauses on a two-card shape choice where both cards are attractive; the chosen card is stamped on the score screen, giving every level a second act (+1 var).
- **The Double-Header (two boards, one budget)** — two simultaneous split-screen scenarios sharing cash and hands, where the unwatched board runs on standing policies; teaches the Tier-5 lesson without Tier 5 (+1 var).
- **The Scenario Icon Family** — one 24px two-colour icon per scenario built from the same eight primitives (wave, clock, bolt, flame, padlock, coin, paper, person), reused on tickets, timeline, postmortem and achievements.
- **Architect Mode Pause** — pausing flips the world into white-on-blue CAD line art with dimension callouts, and building while paused is allowed on relaxed difficulties, making pause the planning tool.
- **Phase-adaptive HUD (shift-change UI)** — the interface reflows per phase: the catalog slides in during build, the alert stack and pager expand during ops, both shrink to ambient during breathers.
- **Starter Loadout = class select** — pick Lean Static, Dynamic Duo or Fortress Paranoia at level start, each biasing early buildables, upkeep and threat-attract profile, contrasting three architectures without tutorial text.
- **Contract Market draft (between levels)** — draft 3 of 5 customer cohorts from a refreshable market board, setting both flows' catalogs (gamers bring booters, shops bring fraud bots) on a calm screen.

## 1.11 Campaign metagame and topology

- **The Spine and the Sidings** — the scale ladder is a mandatory spine; after each spine level you pick one of two or three hosting-type sidings, permanently adding that line and making the map a build.
- **The Pivot Map (the campaign is a node map, not a line)** — finishing Shared Hosting opens VPS, Game Servers or Email/DNS; skipped nodes stay visible so you feel the shape of the industry you are not in (+2 var).
- **The Campaign Market Map (where you expand, not just what you build)** — between chapters choose a region × line node by demand, competition heat, regulatory weather and power price; adjacency pays a carry bonus and competitors take what you ignore.
- **Branch-and-Merge campaign topology** — branch at act boundaries into 3–4-level paths that merge onto a shared level modified by your route; two branches across three acts gives six paths through eight authored levels.
- **The Campaign Spine as a Patch Panel** — the campaign map is an office patch panel where each level is a labelled port, cleared levels are cabled, and the cable you seat stays seated as a record of your route.
- **Level Select as the Job Board** — scenario levels hang on a corkboard of printed tickets, work orders and faxes with era letterhead and priority stamps; completed ones are spiked on a bill spike.
- **The Retrospective Level Select** — the level select is a timeline of your own company annotated with what happened, and it visibly rewrites itself when a replay produces a different outcome.
- **The Recurring Cast** — six spine-cast NPCs with arcs: the first customer, the rival operator, the transit account manager, the auditor, the journalist, and the engineer you hired at Tier 1.
- **The Cold Open Level (the actual first five minutes)** — open on the last thirty seconds of a future success, then cut to "Eighteen months earlier" and Tier 0, so powerlessness becomes setup (+2 var).
- **Chapter Epigraphs** — each act opens on one true industry sentence on black ("Nobody buys backups. Everybody buys restores, once."), tone-setting for the price of a text file.
- **The Ratchet Audit (a level that tests only your carried-over automation)** — once a chapter, no build budget and no new tech; the score is a straight readout of how much of the level ran without you.
- **"The Same Company, Five Years Later" (time-skip levels)** — the board returns aged, with staff gone and undocumented changes the simulation made using your own habits as its model.
- **Lead Time as a first-class progression axis** — a persistent Lead Time Board shows everything ordered and its arrival: hardware 2–12 weeks, circuits 60–120 days, a hire 6–12 weeks, a transformer 104 weeks.
- **The Rebuildability stat** — hours to rebuild a machine from bare metal without its original person: snowflakes 40, config-managed 0.5, the Legacy Box unknown; it decides clean-it vs burn-it.
- **Redundancy grammar as a progression ladder** — climb N → N+1 → N+2 → 2N → 2N+1 → concurrently maintainable → fault tolerant, each a purchase with an enforceable meaning and a common marketing lie to catch.
- **Ratchet Progression (knowledge is never lost; capacity is)** — a failed level costs assets, never unlocked tech, which is what keeps the Failure Ladder from turning into a death spiral.
- **Seeded Weekly Ruleset** — a weekly generated hosting type × era × two affixes × one contract shape, shared as a 6-character code; the generator is the content because the ruleset card is already data (+2 var).
- **Level-select presentation — *CONFLICTING*** — what the campaign screen is as an object ⚔️ the patch panel plus job board, recording your route in cabling, vs your own company website upgrading from GeoCities to a docs site, recording your public face.
- **End-of-level presentation — *CONFLICTING*** — how a result is delivered ⚔️ an in-world printed artifact you keep and pin to the Company Wall vs a slow real-estate listing sweep of the facility with stat pins popping.
- **Endless and post-campaign modes** — the full roster lives under Sandbox unlock parity; the structural point is that every endless mode reuses an existing map, so post-campaign content costs almost no art time.
- **"Finale: The Split" (the branching campaign ending)** — the last act forks into the ethical giant (regulated tiers, audit bosses) or the bulletproof kingpin (abuse is revenue, law enforcement is the boss family).

## 1.12 New level shapes and business-layer levels

- **The Decommission** — turn something off completely and safely: migrate or terminate everyone, prove data destruction, cancel contracts in order; failure is finding out in three months it is still running.
- **The Scream Test** — remove 15 of 40 machines nobody understands by powering one off and waiting for screams; the cruelty is monthly and fiscal-year jobs that scream 25 days later.
- **The Reconciliation** — the CMDB says 214 servers and the floor has 209; find machines you never billed for, ghosts you still pay for, and one belonging to a customer who cancelled fourteen months ago.
- **The Dry Run** — you prepare for a launch or migration and it is cancelled; scored on preparation quality against a simulated version the game runs invisibly and then reveals.
- **The Second Opinion** — a consultant level where you can change nothing, only inspect and file ranked findings; scored six months later on hits, misses, and false alarms that cost credibility.
- **The Handover** — you build and operate the first half, then an AI (or co-op partner) plays the second half knowing only what you documented; the score is both of yours.
- **The Fleet Week** — no board at all, just a spreadsheet and calendar: order hardware, power and bandwidth for twelve months against a forecast with error bars and 8–40 week lead times.
- **The Bake-Off** — a split screen running the same traffic through two architectures on the same budget; a controlled experiment scored on the difference between scale-up and scale-out answers.
- **The Inherited Contract** — the level opens with a signed SLA your architecture cannot meet; reach the promise, renegotiate it as a costed conversation, or breach deliberately and manage fallout.
- **The Two-Timeline Level** — intercut between an incident now and the decisions eighteen months ago that caused it, where your past actions change the present board mid-level.
- **The Long Now** — ten in-game years in twenty minutes: lease renewals, hardware generations, staff careers and certification ladders, with incidents reported only as off-screen summaries.
- **The Postmortem Level** — reconstruct the timeline from logs, graphs and three conflicting eyewitness accounts; never a single root cause, and your corrective actions become real unlocks and obligations (+1 var).
- **The Sales Engineer's Nightmare** — a stream of attractive deals each containing a commitment you cannot meet; the level runs six months forward to show what each acceptance did.
- **Column Fodder** — five RFPs with hidden stats (incumbent present, spec written from their datasheet, required bidder count); qualify calls reveal one stat each, and winning usually means declining three.
- **The Capacity Auction** — power, space, transit, GPU allocation or IP blocks go to multi-bidder auction against AI competitors with imperfect information; winning at the wrong price beats losing.
- **The Regulator's Sandbox** — a new regulation and no other objective; the difficulty is an ambiguous text with three plausible readings at different costs, resolved only at the audit.
- **The Rate Card** — build the price book from real cost inputs, then watch twelve months simulate in ninety seconds; three attempts, one shipped card, and it decides which archetypes appear at all.
- **Due Diligence (the level where you are the one being read)** — eleven weeks after the LOI, a buyer's analyst issues requests not attacks; each unmet one becomes a finding cutting the multiple or forcing escrow.
- **Consent to Assignment** — change-of-control clauses let acquired customers refuse to transfer; 60 days to collect consents, and the ones who revert to month-to-month are exactly the big ones.
- **The Book Sale** — sell one customer book, line or region: which contracts assign, what you keep, a 3-year non-compete, a 9-month transition services agreement, and the staff with nowhere to go.
- **The Ramp** — a 20-cabinet tenant billing in stages from months 1, 7 and 13 with free rent up front, while you reserve all 20 cabinets' power from day one and they ask to delay.
- **Anchor Tenant** — one prospect wants 40% of the suite at 35% off on seven years; taking it makes you instantly profitable and permanently hostage, and filling with six smalls is an equally valid win.
- **Take-or-Pay** — a customer on minimum commit uses 40%, so you book pure profit while their satisfaction drains; enforce the contract or protect the renewal, with your own transit commit mirroring it.
- **Kilowatt Casino (power resale and demand response)** — stranded capacity, paid load-shedding during grid peaks, and time-of-use pricing; win by hitting PUE and collecting a demand-response payment with no SLA breach (+1 var).
- **Interconnect Queue** — you have customers, capital and land but the utility's queue for 10MW is 30–48 months; played on a calendar, with buying a competitor for their substation as an option.
- **Backlog** — $180k of signed-but-not-installed MRR queued behind hardware, space, power, IPs and hands, while sales keeps selling because sales is compensated on bookings.
- **Price Increase Day** — choose exemptions, notice period, scope, paired value and discount authority, then watch ninety days of tickets and a year of renewal-clustered churn (+4 var).
- **The Sunset Letter** — deprecate a platform 4,000 customers live on: the letter's tone is a mechanic, and the letter itself generates a churn pulse, press pickup and a competitor campaign.
- **The Insurance Renewal** — the cyber underwriting questionnaire as a compliance level (MFA, EDR, tested immutable restores, an IR plan, no EOL OS); non-renewal loses customers who require you carry cover.
- **Revenue Assurance Week** — no threats, just auditing your own billing for unbilled services, expired promos still running and cancelled customers' live VMs; real hosts leak 2–5% of revenue this way.
- **Metering Blackout** — the usage pipeline broke eleven days ago and nobody noticed because service was fine; estimate, skip, reconstruct or double-bill, and every option produces disputes.
- **The QBR** — a six-minute quarterly review presenting uptime, incidents and capacity, until they produce a competitor's quote in the last two minutes and you spend a small concession budget.
- **The Recommended Host** — win a slot on a platform's "recommended hosts" list through benchmarks, uptime history, sponsorship and upstream engineering; removal from the list is a cliff.
- **The Partner Turns** — three levels later the platform launches its own hosting product, so your best channel is now your biggest competitor with distribution built into your customers' product.
- **The Agent** — the telecom master-agency model: residual commission of 10–20% of MRC forever, agents own the relationship and shop you against rivals, and you win by signing agents not customers.
- **Repatriation Season** — hyperscaler refugees arrive with their own 3-year TCO spreadsheets, unexpired commit agreements delaying close 7 months, egress fees you may pay, and 4× support load.
- **Offshore** — a support pod drops cost per ticket from ~$9 to ~$3 after 90 days of worse service, and only works if you already wrote the runbooks the knowledge lives in (+1 var).
- **The Churn Cliff** — no attack at all: MRR erodes 1–2% a month and the gameplay is diagnosing why (tickets, latency drift, a price rise, one bad review) before month 18.
- **The Churn Auction** — start at 5%/mo churn with six months to bend the curve, granted exactly one lever per month while cohorts visibly change behaviour; lever scarcity is the puzzle.
- **Peak Season Yield (airline mode)** — maximize revenue per rack across Nov–Jan by mixing month-to-month, reserved commitments and spot overflow; the skill is knowing how much to hold back.
- **Tax Season (the SMB / accountant vertical)** — accounting-portal traffic triples nightly Feb–Apr and under-provisioning makes customers miss statutory deadlines, which that class never forgives.
- **Academic Year (game servers and the education vertical)** — September floods, May empties, and the cohort has zero budget and infinite entitlement; a real lesson in staffing elasticity.
- **The Registrar Grind** — wholesale $10.26 against retail $9.99, so you win only on renewals, privacy upsells and transfers-in; zero hardware, and every infrastructure lever removed.
- **The Product Sunset Dilemma** — your oldest SKU has 2,000 customers at 70% margin and one engineer about to quit with the knowledge; maintain, freeze-and-hike, or migrate off.
- **Dot-Com Bubble** — capital arrives absurdly cheap and every dollar spent converts into upkeep that outlives the boom; score is how much free money you declined.
- **Sell the Shovel (the post-breach pivot)** — your detection stack becomes a product sold to tenants, making every defensive investment re-scored as liability, because one slip is a class action.
- **Category Creator** — name a new market instead of climbing rankings: low spawn volume, zero competition and 3× content-marketing effectiveness until rivals clone the category page.
- **Founder Mode vs Manager Mode** — stay hands-on and capacity-capped, or institutionalize into an org chart that costs every tick but unlocks process-requiring enterprise deals; you cannot un-hire a CFO.
- **The Regulator Sandbag** — every dollar over a threshold attracts a tax/audit tick paid in paperwork from your logging towers, so profit manufactures its own overhead.

## 1.13 Level modifiers and mutators

- **`Skeleton Crew`** — half your staff and double action cooldowns for a holiday week; the gentle, ambient version of `The Long Weekend`'s no-hands constraint.
- **`Founder's Vacation`** — a hard cap on manual interventions for the whole level, forcing the player to pre-build and rely on automation they would otherwise micro past.
- **`Cash Only`** — no credit and no financing, so every purchase comes out of revenue; a brutal tempo lesson and the cleanest demonstration of profit versus cash.
- **`Frozen Change`** — an audit or code freeze bans new construction for N shifts mid-level, rendered as the Constraint Band's hazard tape across the build palette.
- **`Hostile Upstream`** — your transit provider is being acquired and unreliable, producing random upstream blackholes you must route around for the duration.
- **`Price War`** — a competitor undercuts you by 40% for the entire level and your only available lever is quality and differentiation rather than price.
- **`Viral Moment`** — one customer blows up and you may cash in on them or protect everyone else, but not both, for the rest of the level.
- **`The Tour`** — a prospective whale tenant walks the floor during peak, and cosmetic damage — cable mess, a warm aisle, a visible alarm — costs the contract, making tidiness matter.
- **`Regulatory Sunrise`** — a new law takes effect at shift 7 and its exact requirements are not revealed until shift 5, so compliance work is planned under uncertainty.
- **`Heat Dome`** — ambient temperature runs +12°C all level, doubling cooling costs and shrinking thermal margins, which grades every earlier cooling decision.
- **`Fiber Seeking Backhoe`** — a random shift loses one physical path entirely, so redundancy investment either visibly pays off or visibly does not.
- **`Deadbeat Quarter`** — 20% of invoices go unpaid, delivering the cash-flow-versus-revenue divergence lesson as an ambient level-long condition rather than an event.
- **`Patch Tuesday`** — a CVE drops mid-level for a component you built on, starting a timer where patching risks breakage and not patching guarantees compromise.
- **`The Whale`** — one customer is 60% of revenue and makes unreasonable demands that distort your whole build; firing them is a legitimate, scored strategy.
- **`Ghost Ship`** — you inherit a board with no documentation and must run it before you understand it, pairing directly with `The Acquisition`'s fogged inheritance.
- **`Fire Drill`** — a simulated disaster with no real damage where the score still counts your response; low-stakes rehearsal that teaches a mechanic before it bites.
- **`Sanction Line`** — a country lands on an embargo list and you must identify and cut those customers or eat a penalty; one of them is your best payer.
- **`Media Attention`** — a journalist is writing about you, so every incident this level counts double against reputation and every clean shift counts double for it.
- **`Supply Drought`** — you cannot buy new hardware for the entire level, leaving only repair, repurpose and optimize as available responses to any capacity problem.
- **`Blind Mode`** — instrumentation is degraded or unavailable for the level, rendered as a dust sheet draped over the graph drawer in the Constraint Band.
- **`Read-Only`** — all write actions are disabled, so breakage must be handled with traffic steering, pre-set flags, owned capacity and communication; you may break it once, recorded.
- **`Snowflake`** — no configuration management, so each server drifts individually and every fix is applied per object, which makes the player earn Ansible.
- **`Bus Factor 1`** — only one staff member knows each subsystem, and if they are on vacation or burnt out that subsystem simply cannot be touched.
- **`Boutique Managed`** — twenty customers paying enterprise rates on SLAs with teeth: low volume, zero tolerance, and every incident visible to someone who can call you.
- **`Customer Quality Mix`** — seed the level 80% good or 80% problem customers; same systems, completely different experience, and the honest meaning of difficulty in shared hosting.
- **`Observability Debt`** — a dial for how much of your infrastructure is instrumented, where low observability literally hides information from you instead of adding enemy HP.
- **`Lead Time`** — a dial for the gap between ordering hardware and its arrival, from 2 weeks to 9 months; the most authentic knob after oversubscription.

## 1.14 Boss-shaped events (the end-of-quarter beat)

- **`The Multi-Vector Day`** — volumetric plus application-layer plus an insider plus a hardware failure, staggered so each makes the next worse; tests whether you built breadth.
- **`Grid Down`** — utility power fails for 47 minutes, testing generators, fuel, the transfer switch and the one rack you forgot to put on UPS; a pure facility boss.
- **`The Zero-Day`** — an unpatchable exploit whose only counters are architectural ones you built earlier: segmentation, least privilege, immutable rebuilds, a software inventory.
- **`Extortion`** — a persistent attacker with a ransom demand where paying works, is cheap, is scored as failure, and worsens the next level's attacker pool.
- **`The Cascade`** — one small ignored failure propagates and the boss is your own technical debt, with the chain shown afterward in a post-mortem replay.
- **`Audit Day`** — no combat at all: a pure inspection encounter resolved by your documentation, logging and access controls, delivering genre whiplash on purpose.
- **`The Migration Deadline`** — your datacenter's lease ends and you must move everything within three shifts, compressing the whole migration ruleset into a boss slot.
- **`The Competitor's Collapse`** — a rival goes bankrupt and 400 refugee customers stampede at once; a positive boss you can still lose to by being overwhelmed by success.
- **`The Declaration Cascade`** — a regional event triggers simultaneous DR declarations across an oversubscribed standby pool, triaged against priority tiers you sold three years ago.
- **`Distrust Day`** — a root program announces certificates you issued after date X will not be trusted, so your product stops working for everyone publicly, on a schedule.
- **`The Broadcast Storm`** — one IXP member's misconfigured router floods the peering LAN and degrades every other member, resolved entirely by port policy you either enforced or didn't.

## 1.15 Era treatments and presentation devices

- **The Era Shader Stack** — five presets (1994 Phosphor, 2001 Beige & Bevel, 2008 Gloss, 2016 Flat, 2030 Volumetric) as a post chain plus UI skin over the active hosting kit (+2 var).
- **The Time-Lapse Wipe** — era transitions play a 3-second continuous shot of the same room aging: gear swaps, cable colours change, CRT becomes LCD becomes three, the wall gets repainted.
- **Era-Correct Failure Aesthetics** — a 1996 crash is a blue screen and a beep, a 2008 crash a glossy modal with a red X, a 2030 crash a silent panel that stops updating.
- **The Anachronism Flag** — gear kept across an era boundary keeps rendering in its original era's art style, so a beige box sits visibly out of time in a modern black room.
- **The Retro Boot Screen** — period levels load through that era's boot: a 1996 BIOS memory count, a 2005 gradient splash, a 2016 systemd scroll, a 2025 self-assembling dashboard.
- **Loading Is Provisioning** — the load screen is an install sequence (Racking, Cabling, Imaging, Configuring, Warming cache, Bringing into rotation) animated in the rack elevation.

## 1.16 Competitive, co-op and inverted modes

- **Two-Player Co-op: SecOps vs NetOps** — one board, one player owning defenses and the threat layer, the other service and the traffic layer, each seeing half the health bar so communication is the content.
- **Co-op split-campus mode** — two players run two datacenters of one company where the shared, finite interconnect must be negotiated live: whose scrubbing detour routes through whom.
- **Rival Escalation Duel** — a persistent competitor on a parallel board serving the same customer pool; each level you trigger one aggressive move and defend theirs until one base hits zero.
- **Peer-vs-Peer "hosting war" level** — a competitor's board across a shared transit cloud where both sides poach with marketing towers at the midline and fire DDoS reflectors, driven by AI so it ships without matchmaking.

---

# Hosting types — summary

> Source: `master/02-hosting-types.md` · 102 idea entries · 315 KB

## 0.2 The hosting-type variety engine (core design pillar)

- **The Ruleset Card** — Each type is a ruleset mod, not a reskin: a card redefining six slots — The Unit (what "a visitor" is), Goal Node, Scarce Resource, Patience Analog, Threat Mix, Look. Lane, Shared Pipe, hands, upkeep and scorecard stay identical. One engine, twenty games.
- **The Three-Change Rule (design law)** — Authoring checklist: every type must change *which resource is scarce*, *which failure is fatal*, and *who the customer is*; the rest reshapes itself. Tabulated as §0.3's Scarcity Table.
- **The Verb Shift Rule** — Ship a type only if it changes the player's most-frequent verb: web *tune latency*, game *place capacity near players*, backup *schedule and verify*, colo *sell space and police power*, GPU *schedule a queue*, email/DNS *protect reputation*, CDN *route and evict*, regulated *shrink scope*. Shared verb = merge the types.
- **The Business Line System** — Late campaign runs several lines in one facility with opposed requirements (game wants low latency and quiet neighbours, GPU wants density and makes heat, backup wants cheap bulk). Business-line tabs or tinted districts; conflict over power is the late strategy layer.
- **The Portfolio Meter** — Diversification punished at both ends: one line = high margin, high variance; many lines = smoothed risk but expertise spread thin and slower incident response everywhere. End-of-level **Portfolio Balance** dial drawn as an uncomfortable pie.
- **Line Synergies** — Pairs that multiply: CDN+video, backup/DR+colo, DNS+everything, backup+object storage, GPU+HPC, colo+transit. Opposite peak hours are themselves a synergy — web midday, games at night, backup overnight — smoothing the utilization curve. (+10 var)
- **Line Antagonisms** — Systems-enforced hostile pairs: bulletproof beside regulated revokes your certification; crypto mining steals game hosting's peak power headroom; email and bulletproof are mutually exclusive (IP reputation is one's product and the other's sacrifice); GPU and colo fight for the same amps.
- **The "What Are We Even" identity stat** — Too many unrelated lines dilutes brand and engineer expertise: support quality drops, automation stops transferring between lines, staff specialization bonuses decay. Makes diversification non-trivial.
- **Control Granularity as a difficulty axis** — The bigger the customer, the less you may touch: shared = everything inside the box, dedicated = nothing above the power cord, colo = nothing above the cabinet door, wholesale = nothing inside the shell. Some board objects simply cannot be clicked.
- **Same event, different crisis (the proof the engine works)** — One upstream carrier outage reskinned: an outage for web, a *routing* problem for game (one ISP's players blame you), a PoP withdrawal for CDN, a missed pass for satellite, a silent deliverability dip for email. Cheapest content multiplier in the design.
- **The Five-Asset Skin Kit (production spec)** — Per line ship exactly five bespoke assets: accent hue + secondary, visitor costume, hero buildable silhouette, one meter widget, one catastrophe FX. Everything else is shared, authored as silhouette + decal + emissive + swatch so lines and eras are swaps.
- **Type Transitions — "The Pivot" (cross-type campaign mechanic)** — Changing type is itself a playable event and the campaign's connective tissue: new wings with new palettes, threats and customers while old wings keep earning **and keep their old vulnerabilities**. Every type-change re-prices the whole book — a billing-model migration with a dual-ledger window, the revenue J-curve as a playable curve. (+14 var)

## 0.3 The hosting-type catalogue and the Scarcity Table

- **Type-specific "fifth axis" scoring** — Don't score every level on uptime. Game: p99 latency and tick stability at prime time. Backup: RPO/RTO and restore success. Colo: occupancy, PUE, SLA, tenant satisfaction. CDN: cache hit ratio and egress cost per GB. Email: inbox placement. DNS: global resolution success. GPU: utilization % and kWh per useful job. Regulated: findings count. Bulletproof: survival, and how much of your soul is left.
- **Early / mid / late placement of the catalogue** — Ordering rule is how many *simultaneous* scarcities a type asks the player to hold at once. Early: shared, dial-up, email. Mid: VPS, CDN, game, backup, storage. Late: GPU, regulated, video, colo-to-multirack, offshore, HFT, detonation.
- **The signature-resource HUD (one headline meter per type)** — One meter is promoted to the top of the HUD: shared = noise · VPS = quota · colo = power/cooling · game = latency · GPU = heat · backup = the RPO clock · CDN = cache-hit % · email = reputation · stream = the bitrate ladder · offshore = heat · regulated = compliance % · dial-up = modem slots.
- **Cross-type readability — the river is a pie chart** — The customer stream is colour- and wardrobe-coded by segment, so the road itself displays your customer mix; pivot levels show the river's pie composition changing in real time, with no UI panel at all.

## 1.3 Hosting-type levels (the variety engine as content)

- **Authoring requirements for every hosting-type entry (design law)** — Every type must carry three fields or it is evocative rather than authorable: the dominant verb (one of six invariants), the transferable lesson from the Portable Skill Table, and the **returning-visit hook** — what changes on the second visit. Without the third every type is a one-off.
- **The Visual Identity Kit (one "visual chord" per hosting type)** — Each type ships a 5-colour chord, lighting rig, material set, typeface, particle palette and signature ambient motion. Global constraints: the Flow layer's hue ledger wins (magenta reserved for hostile traffic), fixed emissive allowance, and a forced overlay drops the alert triad to two hues.
- **"The Mass Host" / "Cabinet 14" — Shared web hosting (cPanel-style)** — [EARLY, best teaching level] "The Apartment Block": visitor = a page load among thousands of tiny accounts (bloggers, SMBs, grandma's flower shop); scarce IOPS/concurrency; fatal = a control-panel RCE rooting every box at once. Threat mix is your own customers — noisy neighbours, nulled themes, spam poisoning the shared IP pool. Two levers: the Tenant Density oversell dial and term mix (annual prepay cuts payment fees ~13%→~1.1%, builds the Renewal Cliff). Razor margins × volume; you cannot remove the bad customer, they pay. (+20 var)
- **"Four Hundred Identical Sites" / "Managed Everything" / "White Glove" — Managed WordPress / managed app** — [EARLY/MID] "The Nursery" / "The Boutique": a monoculture fleet where the customer's *application* is your outage. Visitor = a site bought by agencies; scarce = staff attention; fatal = a plugin update breaking 800 sites. Signature mechanic the **Update Button** (patches 400, breaks ~2%); threats are plugin-vuln sweeps, xmlrpc amplification, page-builder bloat. Highest margin and highest false-positive cost; the "Premium Pivot" fires cheap customers to take ARPU $6→$60. (+9 var)
- **"Node 14 Is Full" — VPS / cloud instances** — [MID, core] "The Glass Hive" / "The Hotel Corridor": visitor = an instance, provisioned self-service at 3am by devs and startups. RAM always binds, overcommit tempts; fatal = hypervisor escape or a host node dying with 60 customers on it. Threats: fraud signups, miners, DDoS origination, stolen API keys, customers DDoSing each other. Metered per-hour revenue that churns easily; demand is **Reputation-as-demand** from one deal community that benchmarks your oversell publicly. (+18 var)
- **"Root Is Theirs" — Dedicated servers / bare metal** — "The Stable" / "The Car Lot": visitor = a whole labelled machine leased to technical customers with root. The twist is that **you cannot fix your customers' boxes** — you see only traffic, power and IPMI, so abuse response is email, null-route or power-off, with zero visibility into what they run. Defence is acceptance screening plus deposits. High revenue per box, low margin %, low support, 4-hour hardware-replacement expectation. (+8 var)
- **"Amps and Aisles" / "Cage 7" / "The Landlord's Grid" — Colocation landlord** — [MID/LATE] "The Estate Game": visitors are prospective tenants who physically walk your building; you sell space, power, cooling, cross-connects and remote hands and **do not control the gear**. Threats are facility- and human-shaped: overloaded circuits (20A derates to 16A continuous), blocked hot aisles, a hidden mining rig, mantrap tailgating, the non-paying tenant whose gear you legally cannot touch for 90 days. Verbs are Instrument, Negotiate, Enforce. Money: MRC per cabinet + power + cross-connect annuities, a 3%/yr escalator, and the committed-vs-metered-vs-flat power-billing slider; carrier density compounds as a network effect. (+20 var)
- **Colocation — which side of the cage the player is on — *CONFLICTING*** — Both documents ship a colo "estate game" but disagree who the player is; resolve per level or ship both as paired levels, never average them. Position A (landlord, master): own the building, collect MRC + power + cross-connects. Position B (tenant, opencode): "The Hangar of Cages" — you own boxes in someone else's hall, pay per-U rent, metered power and remote-hands fees, and threats are the human layer (wrong rack pulled, fake-ID intruders, smart-hands mistakes). ⚔️ Rent collected vs rent paid; building as your asset or your captor.
- **"Cage Match" / "Build-to-Suit" / "The Shell" — Wholesale / hyperscale shells** — Almost no combat: a construction-and-contract game on a 20-year term for one enormous tenant whose arrival is a motorcade. Scarce = construction capital and lead time; fatal = commissioning failure or the single customer walking. Threats are supply chain (a transformer at 74-week lead time), permitting, and a local community that does not want you. Units are megawatts, not servers; progress is literally the building getting built.
- **"Prime Time" / "Tick Rate" / "The Arena" — Game server hosting** — [MID, best *loud* level] "The Arcade": everything happens 6pm–midnight local. Visitors are *sessions* — player avatars with ping numbers who stay; above ~80ms they rage-quit and jitter is worse than latency, so geography is terrain and you buy high-clock low-core CPUs against a **tick budget**. Threats: booters aimed at one player's IP, UDP amplification with your servers as reflectors, cheat clients, mod-update day breaking 900 instances, the Empty Server Spiral; popularity is a targeting beacon. Tiny ARPU, enormous volume, brutal churn, 2–4% chargebacks, and the Hype Cycle (20× for 6 weeks, then 85% evaporates). (+19 var)
- **"The Launch Window" — Game hosting, scenario variant** — [LATE] A game launches at midnight and demand is 10× or 0.1× your forecast; you find out at 12:01. Pre-provision (waste) versus scale-on-demand (too slow) — a pure capacity gamble, with **Launch Day Decay** as the follow-on: not an attack but demand collapse leaving you owning 50× idle hardware and its upkeep. Success is the trap. (+2 var)
- **"Private Shard" — Community / MMO hosting** — [MID-EASY] "The Sandbox Farm": one server per small, passionate, loud community, where the signature mechanic is **drama** — communities fracture, half the players leave, someone DDoSes their ex-guild — so non-technical threats dominate. Customers are minors paying $5 who churn over a lag spike and post TikToks; every mod is a third-party supply-chain dependency. Comedic and cheap to author. (+2 var)
- **"Trunk Group" / "The Switchboard" — VoIP / SIP trunking** — [MID] Visitors are *calls*: long-lived fragile sessions where a drop is total loss, scored in MOS, spiking hard at 9am; customers are dental offices, clinics and call centres, sticky and contract-heavy. Jitter and packet loss bind, not throughput; 150ms one-way is the cliff. Signature threat is **toll fraud** — a brute-forced extension dials premium-rate numbers all weekend and a $60,000 carrier bill arrives Monday — plus one-way audio invisible to uptime checks, scanner floods and E911 obligations. Per-minute and per-DID billing, margin from least-cost-routing arbitrage. (+9 var)
- **"Postmaster" / "Deliverability" / "The Post Office" — Email hosting** — [MID, surprisingly deep] Scarce resource is **IP/domain reputation** — held by other people, slow to rebuild, destroyable by one tenant. Visitors are messages that must reach an *inbox*, so the defence flips outbound: you filter what leaves, and new IP space must be **warmed**. Threats: a compromised account sending 400k at 2am, a bought list, backscatter, joe-jobs, your /24 listed over a neighbour, and Google silently spam-foldering you with no error and no appeal. Cheap per-mailbox subscriptions to the stickiest customers in the catalogue, stable until one blocklist event triggers mass exodus; abuse vetting at signup suppresses growth. (+19 var)
- **"Authoritative" / "NXDOMAIN" / "Root Zone" — Anycast DNS hosting** — Infrastructure for other people's infrastructure: tiny queries, unimaginable volume, microsecond budgets; scarce = global PoP capacity *and correctness*; the unit is a zone sold to domains by the million. Core dial is **TTL** (low = agility and 10× queries forever; high = cheap, but a mistake propagates for hours). Threats: amplification where you are reflector and target, water-torture random-subdomain attacks, a BGP hijack of your anycast prefix, and the missed DNSSEC key rollover — nothing is "down," everything is unreachable, monitoring says green. Freemium: the free tier is your only lead source and an amplification magnet; convert 1.5% or lose money. (+4 var)
- **"Edge" / "Cache Hit" / "The Constellation" — CDN** — [MID] "The Postal Highway": hundreds of tiny nodes, no origin control; the product is proximity, the scarce resource is egress, the unit is a TB served to content owners, and **cache hit ratio alone decides profitability**. Threats: cache-busting (`?x=random` turns your CDN into a DDoS amplifier aimed at your own customer's origin), poisoning via an unkeyed header, cache deception serving a logged-in page to everyone, origin IP leakage, a 2%-hit-ratio customer. Pure arbitrage — buy at ~$0.30/Mbps, sell at ~$0.02/GB, with 95th-percentile transit commits one viral customer can blow; peering permanently cuts COGS. (+21 var)
- **"Eleven Nines" / "Bucket" / "The Honeycomb" — Object storage** — "The Endless Library": durability is arithmetic, not vibes, and there is no dramatic attacker — the enemy is entropy and your own rebuild math, where the scrub must finish faster than the failure rate. The *routine* catastrophe is the metadata layer: 400 million tiny files destroy your index. Threats: a misconfigured public bucket, egress bill shock, a bad firmware batch, a rebuild storm taking a second disk, a bug corrupting all replicas identically. Sold per GB-month to developers and backup vendors with egress as the revenue line, so a viral file is a bonanza or an unpaid catastrophe. (+8 var)
- **"Restore Point" / "The Vault" / "Bit Rot" — Backup / archival hosting** — [MID/LATE] The product is **restore time**, not storage; split deliberately from DRaaS. Visitors are backup *jobs* — slow night convoys that must finish inside a window; they never bounce, they fail invisibly until restore day, and latency does not matter at all. The success metric is unobservable except through restore testing that costs money and earns nothing. Threats: backups silently stopped six months ago, ransomware sitting 90 days to get inside retention, a window grown to 26 hours, a job "succeeding" for two years writing zero bytes. Sold per GB + an RTO; dedup ratio literally is gross margin and revenue never churns because switching costs the egress bill. (+21 var)
- **"Declaration Day" — Disaster-Recovery-as-a-Service (the oversubscription level)** — You sell standby capacity to 200 customers and own enough for 20, because DR events are assumed uncorrelated. They are not: a hurricane, regional power event or one ransomware strain triggers **simultaneous declarations**, and the Declaration Queue becomes triage against priority tiers you sold years ago. Second mechanic **failback (DR debt)**: customers who declare never leave, so standby stays occupied. Failing a declaration is not an outage but a breach of the one promise the product consists of.
- **"The Vault Run" / "Bit Rot" / "The Courier" — Offsite tape vaulting** — [LATE puzzle] Physical logistics as gameplay: robot arms, barcodes, courier runs to a salt mine, retrieval SLAs in hours-to-days, and keeping a drive that can still read 2009 tapes. Customers are regulated industries buying a slot plus a courier run. Threats: a tape that won't verify, a courier losing a case, a fire, a jammed arm, a format going EOL, and a missed courier run — an SLA breach with no technical fix. Slow, procedural, revenue weight-based and slow. (+1 var)
- **"Going Live" / "Transcode Queue" / "The Studio" — Video hosting / live streaming** — [LATE] "The Broadcast Studio": two opposed workloads in one business — schedulable batch transcoding and unschedulable live. All planning happens before the whistle; during the event you can only triage. Visitors are viewer-hours who tolerate buffering exactly twice. **Graceful degradation is a win condition** — 480p for everyone beats a perfect 4K stream that dies. Threats: ingest failure mid-event, a stream-key leak hijacking the broadcast, a live DMCA, 10× forecast viewers, DRM piracy. Per-viewer-minute plus ads to publishers and creators, margins one viral clip can erase. (+17 var)
- **"Dead Air" — Linear broadcast playout hosting** — A 24/7 scheduled channel whose failure state is silence: no "degraded" exists, only on-air and **dead air** — regulator-visible, contractually penalised, instantly noticed. The board is a playlist timeline; the job is that the next item is always ingested, transcoded, QC'd and frame-accurately ad-marked. Threats: a late asset, a file passing QC with 4 seconds of black at the head, a frame-rate mismatch, a misplaced SCTE-35 marker, the emergency-alert test that must pass untouched. Signature meter **Time To Dead Air**; buildables are a lockstep backup chain and a 30-minute filler loop.
- **"The Seedbox Farm" / "The Warehouse" — Image, file hosting, seedboxes** — [MID] "The Drop" / "The Dead Drop": high bandwidth, low margin, maximum abuse — halfway between shared hosting and bulletproof. The abuse desk is the main loop, DMCA notices being both countdown mechanic and opex line; ignore them and you lose your upstream to a null-route. Threats: hotlinkers siphoning egress with no coins back, crypto-locker payloads stored on you, forensic subpoenas, nervous payment processors. Customers buy a TB transferred, are price-obsessed and churn instantly, and the twist is an inverted value curve — the cheapest customers use the most bandwidth. (+3 var)
- **"Rack 4 Is 40 Kilowatts" / "Thermal Envelope" / "The Furnace" — GPU / AI compute** — [LATE, best risk/reward] "The Forge": power density breaks the building — a rack draws 40–120kW in a hall designed for 5kW, forcing a liquid-cooling retrofit, and a 1,500kg rack makes floor loading real. Two customer shapes: bursty **inference requests** and **training jobs** holding 8 GPUs for 11 days, where an interruption costs credits. Threats: thermal runaway, a failing-HBM GPU silently producing NaNs (a *correctness* failure that ruins their 11-day run), driver roulette, GPU theft, a coolant drip, a supply chain where you cannot buy more; a synchronized start-ramp sets a demand charge billing for eleven more months. Sold per GPU-hour at the highest revenue-per-rack and highest capex in the game: multi-year prepaid contracts finance the cards, customer credit quality is the whole deal, and a next-gen announcement craters residual value. (+21 var)
- **"Hour 39" / "Render Farm" / "The Anthill" / "The Loom" — HPC / render farm** — The customer's deadline is the clock: jobs are long, stateful and unkillable without loss, and a node dying at hour 39 of a 40-hour job destroys everything unless you bought checkpointing. The interconnect is a new failure class — one bad cable slows the whole cluster because everything waits on the slowest rank. Jobs burst before industry deadlines; fairness versus revenue maximisation is the core decision, and you can win by deliberately *cancelling* one job to save four. Sold per node-hour to studios and labs. (+2 var)
- **"Hashrate" / "The Boiler Room" / "The Barn" — Crypto mining hosting** — Pure power arbitrage with a bust guaranteed: revenue is per kW, not per server, tracking a live commodity price chart on your HUD you do not control. Tenants are volatile and non-sticky; gear is cheap, hot, fire-prone and constantly failing; neighbours hate you. Demand-response contracts pay you to shut down during grid peaks at the cost of SLAs. The economy itself is the antagonist and can collapse mid-level, turning every tenant into a deadbeat at once and ending the level as a walkable ruin. Best margins, worst customers, most fire risk.
- **"The Control Plane" / "Cluster" / "The Yard" / "Namespace" — Kubernetes / PaaS / containers** — "The Ant Farm": you host a platform, so customers deploy arbitrary code into your building and a "visitor" is a *deployment*. You place **policies**, not pods, and the failure mode is a reconciliation loop doing exactly what it was told, everywhere, instantly. Threats: etcd quorum loss (paralysis, not damage), an admission webhook blocking the fix for itself, CrashLoopBackOff storms, multi-tenancy escape, autoscaling attacked into bankruptcy. Sold per workload to dev teams on usage-based billing that makes revenue unforecastable, so you over-provision and eat it; free-tier miners leak COGS directly. (+6 var)
- **"Cold Start" / "The Mayfly Field" / "The Popcorn Pan" — Serverless / functions** — [MID/LATE] "The Food Court" / "The Ghost Kitchen": scarce resource is warm capacity, and **your visitor's experience depends on whether another visitor came recently** — scale-to-zero cost against cold-start latency. The unit is an invocation sold to app devs. Threats: a recursive function billing you $40,000 in nine minutes, and one tenant's burst starving others across a shared blast radius. The **Chrysalis Pool** of pre-warmed shells is the buildable — buying warmth is buying the absence of a stutter. (+6 var)
- **"The Managed Database" / "DBaaS" / "The Cellar" / "Read Replica" — Database-as-a-service** — [MID/LATE] "The State Farm": you run the thing that cannot lose data for people who write terrible queries against it. Scarce = IOPS plus durability, fatal = data corruption, unit = an instance + IOPS sold to app teams. Mechanics: automated failover that sometimes fires when it shouldn't, point-in-time recovery, major-version upgrades needing a window customers won't accept, and one tenant's missing index taking down a shared node. The boss is a **split brain**. (+1 var)
- **"Anything Goes" / "No Questions" / "The Back Alley" / "Blacksite" — Bulletproof hosting** — [LATE / side campaign, villain-simulator arc] "The Pirate Cove": systems flip — instead of preventing abuse you absorb it, every customer is an abuse report, and pressure comes from transit providers, registrars, payment processors, blocklists and eventually law enforcement, not hackers. Scarce is **payment rails** before transit, so the Heat Gauge has two needles. You sell deniability to criminals and dissidents alike at 6× pricing, crypto-only, zero refunds, no chargebacks; more upstreams absorb more heat. Failure state is **deplatformed**. Flagged as economically dominant unless heat compounds, transit scales 1.4×→2.2×→4×, and >20% of MRR permanently closes regulated, enterprise and government tiers. (+19 var)
- **"In Scope" / "Chapter 7 Compliant" / "The Clean Room" / "Chain of Custody" — Regulated hosting (HIPAA/PCI/FedRAMP)** — [LATE challenge] "The Hospital-Bank": the threat is a clipboard and **scope is the resource** — segmenting onto 3 machines instead of 40 drops audit cost 80%. Evidence collection is an ongoing staff cost, not an event; auditors are a visitor type who walk your facility and can fail you; the unit sold is a certified environment to compliance officers. Threats: a 30-day CVE clock, access not revoked on termination, a log-retention gap, a subcontractor with no BAA, backup keys stored beside the backups. You can be perfectly available and still fail, or pass with worse infrastructure. Deals take 6–18 months, are worth 10×, and almost never churn. (+21 var)
- **"FedRAMP Purgatory" — Regulated hosting, the extreme variant** — An 18-month, multi-million-dollar, **zero-revenue** sales cycle you cannot survive on cash flow: you must raise capital or co-fund with a sponsoring agency. Win is reaching authorization before the runway ends, and losing here is a legitimate, interesting loss.
- **"The Border" / "Sovereign" — GDPR / data residency / national cloud variant** — [LATE finale] "The National Cloud" / "The Embassy": data has a nationality. Borders are drawn at world-map altitude and data is tinted by residency — the whole mechanic is a green EU mote crossing a border and turning red. Buildable: the **Residency Fence**, policy as level geometry. Signature dilemma: a failover moved data across a border, so you survived the outage and broke the law. The sovereign variant adds procurement as a lane — tenders, local-ownership mandates, bid bonds, a competitor protesting your award — and makes residency a sellable feature. (+4 var)
- **"Exchange Colo" / "The Microsecond Cathedral" / "The Meter Stick" — Financial low-latency colocation** — A comedy of physics: cable length is measured in metres and *is* the product, contractually equalized across tenants, so what you sell trading firms is *equal* latency and a cabinet three metres closer to the matching engine. The threat is a tenant finding an unfair advantage — a microwave link, an FPGA, a cable cut 2m short — plus the regulator who audits your cable lengths. Catastrophe: one tenant gains 40ns and the others riot with lawyers. (+3 var)
- **"Pass Window" / "Ground Station" / "The Dish Field" — Satellite ground-station hosting** — [LATE] "The Sky Dock": you cannot reschedule the sky. The unit is a **pass** sold to constellation operators — antenna time in the 9–11 minutes a satellite is overhead — so airline-style yield management is the pricing game. Threats: rain fade, RF interference, a dish motor failure, two customers wanting overlapping passes. The site is hostile and far away, so every physical action costs days and a missed window is gone for 90 minutes with no way to buy out of time. (+3 var)
- **"Eighty Little Sites" / "MEC" / "The Roadside" / "The Street Cabinet" — Edge / 5G micro-datacenters** — [LATE capstone] "The City Diorama": 80 closets in cell towers and shopping centres instead of one datacenter, with **no staff anywhere** — 4U per site, flaky power, four-hour drives, so everything must be remotely recoverable or it is a truck roll. Threats are physical: heat, vandalism, a car hitting a cabinet, a cut padlock. Signature failure: a firmware push breaks the network stack on 40 sites at once and the only fix is physical. Economics: the carrier owns the customer, takes 40% revenue share, and can decide to compete with you. (+2 var)
- **"The Swarm" / "IoT Backhaul" / "The Hive Hum" — IoT device backends** — Millions of tiny devices with terrible firmware that can never be patched and all reconnect in the same second after any blip — the **thundering-herd reconnect storm**, the worst retry storm in the game; their certificates all expire the same day because they were provisioned in one batch. Visitors are dust-sized, visible only as aggregate texture, never individually. Twist: your customer *is* the botnet, accidentally, so the converging herd is a cyan wall, not a magenta one. Sold per device-month to device makers. (+11 var)
- **"Node Sync" / "The Ledger Wall" / "The Clock Tower" — Blockchain node hosting** — A workload you cannot pause, prune or reason with: storage grows forever, sync takes days, IOPS are brutal, and the network can hard-fork under you. Customers are protocol teams buying a node who care about exactly one number — uptime during a specific event. Everything is paced to block time; falling out of sync renders as a shorter chain and your tower's hands drifting from the reference clock. (+11 var)
- **"Busy Signal" / "Ring 0" / "The Modem Wall" / "Dial Tone" — Dial-up ISP (period, ~1996)** — [EARLY/MID era level] "The 1995 NOC", the best tutorial in the game: modems are a hard countable concurrency limit, visitors are individual callers, and three busy signals cancels a household. The core dial is the **oversubscription ratio** (~10:1 lines to subscribers), ancestor of every later capacity decision. Threats: a telco taking 45 days to provision a PRI, a lightning strike, a war-dialer, the always-on line hog, and the RADIUS server dying — every line answers, nobody can log in, dashboard green. Sold by the hour or the line until AOL goes flat-rate mid-level and destroys your per-hour billing. Its **Busy Wall** grammar becomes the canonical rendering of every hard concurrency limit. (+19 var)
- **"The Shell Box" / "MOTD" / "The Terminal Room" — BBS / shell accounts / IRC leaf (period)** — A single multi-user UNIX box with named humans in a userlist; tiny scale, huge personality, personal stakes. Threats are local and social: a fork bomb, an `.rhosts` file, trolls, floods, netsplits, an IRC bot that gets your server DDoSed off the net by a rival channel takeover. The 1988 "Sysop's Ledger" variant runs four phone lines on donations, door-game fees and a newsletter — the whole P&L fits on one screen and the win is paying the phone bill.
- **"The Usenet Feed" / "The Firehose" / "The Paper Mill" — Usenet (period)** — Scarce resource is disk plus inbound bandwidth, both consumed by a firehose you cannot slow, mostly binaries nobody admits to wanting; retention days is the product sold to retention shoppers and the economics are purely storage. Your "visitors" are *peers*, not customers — you exchange feeds and your standing in the network is social. Threats: spam cancels, flood bots, netsplits, takedown notices, and exponential binary growth eating every disk you own.
- **"Web Ring" — Early web hosting (period)** — Traffic comes from *links*, not search: attraction is a social graph, your site is one link in a visible circular chain, and a broken neighbour visibly stops traffic flowing around the ring. Pairs with the 1998 `index.html` tutorial — one Apache, one cgi-bin, and a guestbook whose enabling brings both the first visitors and the first spam bot. Win: 1,000 pageviews without the box falling over. (+1 var)
- **"Chain of Trust" / "Trust Store" — Certificate Authority / managed PKI** — [CAMEO, brutal] "The Trust Mint" / "The Notary": the unit is a certificate and the scarce resource is **root-program standing**, which you neither own nor can buy — your business exists at the pleasure of four browser vendors. A single mis-issuance ends the company: removal from root stores is commercial death with a six-month fuse. Certificate Transparency makes the whole internet your QA department; a mass revocation inside a mandated 5-day window is a boss fight whose enemy is your customers' inability to rotate. Threats are procedural — a Baseline Requirements audit, an unchecked CAA record, a researcher proving your validation bypassable. Paying customers are resellers and enterprises; patience is issuance latency. (+4 var)
- **"Whois" / "Redemption Grace" — Domain registrar and registry operation** — [EARLY/MID] "The Bait Shop" / "The Pawn Shop": the unit is a registration-year. Registrar is thin-margin, upsell-driven retail whose real product is *not losing people's domains*; registry operates a TLD under an ICANN contract with nightly data escrow, a price cap and the Emergency Back-End Registry Operator clause — you are not allowed to fail. Scarce = accreditation standing, which can be revoked. Threats: compliance notices escalating to termination, UDRP disputes, court-ordered seizures, a failed escrow deposit, auth-code theft, a reseller registering 40,000 spam domains overnight. Expiry→redemption→pending-delete is a drop-catching latency minigame. (+4 var)
- **"The Index" — Package registry / artifact repository hosting** — [MID/LATE] "The Library": the unit is a package download, scarce is bandwidth and namespace integrity, and traffic is 99% robots that never bounce, only retry. Fatal = a poisoned artifact served to thousands of builds, making you the origin of everyone's supply-chain incident. Dials: typosquat policy (aggressive takes down legitimate packages, permissive makes you the malware delivery mechanism) and **the Unpublish Problem**, where both answers are correct and both cause a crisis. Threats: a malicious release of a 40M-download package, dependency confusion, maintainer account takeover. Free for developers; monetised through private registries and enterprise mirrors. (+2 var)
- **"Who Watches" / "Cardinality" — Monitoring / observability as a service** — [LATE] "The Mirror": the unit is an ingested metric, log line or span; scarce is write throughput and **series cardinality** — unique streams, not volume. Fatal = being down during everyone else's outage, the only hour anyone notices you. Signature threat is a cardinality explosion (4,000 series to 40,000,000 in one 3am deploy), countered by a limiter that silently drops data they pay you to keep. Capacity planning is anti-correlated with your own reliability, so an external **dumb canary** is mandatory. Catastrophe: the flatline, where you cannot tell whether the internet died or you did. Customers are every other ops team. (+3 var)
- **"Mirror" — Open-source distribution mirror hosting** — Enormous bandwidth, zero revenue, maximum community reputation: nobody pays you, scarce is transit and peering, and fatal is serving a tampered mirror — community-trust death. The only output is intangible Engineer Reputation, which unlocks peering, hiring and word-of-mouth, making it the first deliberately unprofitable strategic line. Release Day is a scheduled 40× spike you know months ahead, and the 6GB `.iso` behaves nothing like the 40MB file.
- **"Green Light" / "Untrusted Code, By Design" — CI / build-farm hosting** — [MID/LATE] "The Forge That Builds Forges": you sell the execution of arbitrary code written by strangers, and that is the product. Unit is a build minute; scarce is cold-start time, cache locality and clean ephemeral capacity; fatal is a secret leaked between tenants, since runners hold production credentials for every customer. Central tension: warm reused runners are fastest and least safe. Threats: free-tier cryptomining (the industry's most abused free product), a fork-PR build running attacker code with your secrets, cache poisoning between builds. The Monday Morning Wall makes utilisation structurally terrible; the Flaky Test Tax makes their quality problem your capacity problem. (+4 var)
- **"Fruit Salad" — Apple / Mac hardware hosting** — A tiny, weird, real business: the unit is a Mac mini, scarce is *physical machines* (hardware cannot be virtualised or oversold and the licence caps VMs per host), and iOS developers and CI farms have no alternative — extraordinary pricing power over a captive, annoyed base. **No IPMI exists**, so the buildable answer is USB/HDMI capture, a smart PDU and a physical robot finger. Fatal = an OS update bricking a fleet you cannot downgrade. The September Problem: a vendor announcement everyone demands on day one wipes 40% of fleet value overnight; consumer hardware means no rails, no ECC, retail warranty runs.
- **"No Logs" — Privacy hosting: VPN endpoints, Tor exits, encrypted mail** — [LATE] "The Uncanny Post Office": you sell the absence of knowledge, and that absence is your only defence. Unit is a tunnel/session; scarce is clean IP reputation and upstream tolerance; fatal is being shown to have logs you said you didn't. The warrant canary is the signature chore — you cannot lie, only stop telling the truth, and stopping is itself the signal. No telemetry permanently worsens your own MTTR. Threats: law-enforcement requests you genuinely cannot answer, a disbelieving upstream, a payment processor who won't touch you, a customer attacking your other customers through your exit. Ethically distinct sibling to bulletproof. (+4 var)
- **"Zero Knowledge" — Password manager / secrets hosting** — You hold the data and are *contractually unable* to read it, so when a customer loses their key the only correct answer is "it's gone," said ten times a day. Every support-improving feature — recovery codes, admin reset, key escrow — reduces the core promise and adds breach surface. The signature threat is a breach of *trust*, not data: a researcher publishes a weakness in your client-side crypto, and belief is your only asset.
- **"The Show Floor" — Event, conference and broadcast NOC** — Infrastructure that exists for four days and must be perfect; contract length is one week, the fastest tempo in the game. Unit = an attendee device or production feed sold once to an organiser with a year's reputation on it; scarce = **RF spectrum and setup time**; fatal = the keynote. Build–Load–Show–Strike runs in four phases inside a hostile venue you did not design — union-only electricians, a shared loading dock, the venue's own DHCP — with no maintenance window, only during the keynote and not during it.
- **"Sub-100" — Ad-tech / real-time bidding infrastructure** — [LATE] "The Auction House": every bid request must be answered in under 100ms or it is worth exactly zero, at millions of QPS. **The Timeout Cliff** replaces the patience model — 97ms pays, 103ms pays nothing, and nobody tells you, so timing out is invisible while silently removing all revenue. Deciding *not* to bid, fast, is a capability you build; identity deprecation is regulatory weather deleting 30% of your product overnight; you must colocate inside specific exchange buildings. (+2 var)
- **"The Fabric" — Internet exchange point (IXP) operation** — [LATE, diplomacy-heavy] "The Town Square": you are neutral ground and may not compete with your members. Unit = a member port; scarce = **members**, whose value grows as the square of membership, so cold start is brutal. Visitors are peering sessions negotiated between members — you do not control whether two of them peer. Fatal = a broadcast storm on the shared peering LAN taking down a country's peering with gear you cannot touch. Neutrality is breakable for money and shouldn't be. (+2 var)
- **"Clean Traffic" — DDoS scrubbing as a product** — Unit = a protected prefix / clean Mbps sold to other hosts, game hosts and anyone with an enemy; scarce = scrubbing capacity and global absorption footprint; fatal = **collateral damage**, where your mitigation drops real users and the customer would rather have been attacked. The false-positive ledger *is* the SLA, and time-to-mitigate is contractual in seconds. Threats: an attack bigger than your capacity, an attacker tuning just beneath your thresholds, a peering partner null-routing your scrubbing prefix. You sell protection you may not have — oversell with a moral edge.
- **"In the Container" — Modular / prefab datacenter deployment** — You don't operate the facility, you build and ship it. Unit = a delivered, commissioned module sold to telcos, militaries, miners and disaster-response agencies needing a datacenter in a field in eight weeks; scarce = manufacturing slots and freight; fatal = a commissioning failure on the customer's site with the customer watching. Half the level is a repeating production line, half an unrepeatable logistics puzzle to a site with no roads; everything must survive a truck, and remote sites are never revisited.
- **"Chain of Custody" — Secure IT asset disposition (ITAD) and media destruction** — The end of every other line, as a business. Unit = a destroyed or resold asset with a certificate, sold to regulated companies and hosting providers including your own other lines; scarce = **verifiable custody**; fatal = a drive on an auction site with data on it, a notification event for them and an extinction event for you. Per-asset shred-vs-wipe-vs-resell pits margin against risk; witnessed destruction is the premium product; a gap in the serial-number ledger *is* the failure.
- **"Stratum One" / "The Roof Antenna" — Time, timing and precision services** — You sell accurate time to financial firms with timestamping obligations, broadcasters and telcos; fatal is **serving wrong time confidently**, which corrupts logs, kills certificates and desynchronises trading systems downstream. Scarce = GPS sky view and **holdover** quality — a purchasable "how long can I survive being cut off from reality" stat, hours on a TCXO to weeks on rubidium. GPS jamming and spoofing are the live threats (spoofing being the one where all your clocks agree and are all wrong), plus the leap second as a scheduled boss; the public NTP pool is free reputation and unmonetisable load.
- **"The Co-op" — Non-profit / member-owned / community hosting** — Same infrastructure, inverted incentives: the unit is a member, the customer is your owner, the scarce resource is **volunteer hours** you can ask for but never assign, and the fatal failure is a governance failure — a vote, not an outage. The AGM is the boss fight, where the people who paid may vote to do something operationally insane. Surplus, not profit: money above cost must be spent, refunded or reserved, so accumulating cash is itself a governance problem and the charter may forbid profitable lines.
- **"The Rig" — Offshore, maritime and extreme-remote hosting** — Every constraint at once: a workload on a platform, ship or research station for energy, shipping, research and defence. Scarce = weight, power and the supply-boat schedule; fatal = needing a part you don't have when the next delivery is eleven weeks out. **The Manifest** makes spares a months-ahead forecast with no do-overs; salt, vibration and roll multiply entropy; the satellite link has a price per megabyte, so telemetry is budgeted — **you decide what you can afford to know.** Crew rotation replaces your one technician with someone who has never seen the site.
- **"Cold Water" — Sustainability-first hosting (heat reuse, immersion, free cooling)** — [LATE modifier, or colo variant] "The Solar Cathedral": a line whose product is an externality — two revenue streams from one watt, compute plus recovered heat sold to a district heating utility, a pool, a greenhouse or a distillery. Scarce = a **heat customer**; fatal = losing the offtake agreement, which turns your advantage into expensive plumbing. Siting becomes civic: you sit next to the heat customer rather than the fibre, so now you have a fibre problem, and nobody wants your heat in July. (+1 var)
- **"Lights Out" — Fully automated / zero-touch facility** — No staff on site at all: scarce = automation coverage, fatal = any physical failure whose remediation you did not pre-build. Every physical action must be converted into a machine action in advance — robotic media handling, automatic workload evacuation, power-cycle-by-API — plus a deliberate decision to **let dead hardware stay dead** until a quarterly truck roll. **Failure accumulation as strategy**: plan for 3% of the fleet dead at any time and size for it.
- **"The Green Screen Annuity" — Legacy / mainframe / AS400 hosting** — The most profitable and most terrifying line: hosting systems nobody makes anymore for customers who cannot leave. Enormous contracts, zero churn, wonderful margins, and risk rising every year. Scarce = **people who still know this**, and it is not purchasable — you can only train, retain and dread. Each system has a named **Keeper** whose retirement date is visible from the start. Threats: a part that no longer exists, an OS unpatched since 2011, an auditor asking how you patch it, a bus factor falling to 1 then 0. Win by migrating them off, training a successor, or pricing the risk. (+2 var)
- **"Line of Sight" — Rural wireless ISP (WISP)** — Your cables are air: point-to-point radio links on a terrain map that exist only with line of sight and fail for reasons that are not your fault — a tree that grew, a new building, a crane, someone else's antenna in your band. Scarce = **unlicensed spectrum**, degraded as neighbours deploy. Threats: frequency-dependent rain fade, ice loading, wind misalignment, lightning down the tower ground, a landlord raising rent. The seasonal cycle is a real threat schedule — leaf-on in spring kills links that were fine all winter. Low ARPU, extremely loyal households nobody else serves, 300 per tower. (+4 var)
- **"The Radiologist Is Waiting" — Medical imaging (PACS/DICOM) hosting** — A "visitor" is a **study retrieval** — a 2GB CT series a radiologist needs *now*, with about 8 seconds of patience before they call the hospital's IT director. Simultaneously archival (7–30 year mandated retention) and interactive. Signature mechanic is **prefetch prediction** against the appointment schedule, where a good guess looks magical and a bad one costs retrieval fees for nothing. Threats: a scanner emitting malformed DICOM, a flapping hospital VPN, a deletion you are legally forbidden to perform, an outage with clinical consequence. Play it straight — no jokes in the failure states.
- **"Authorization" — Payment switch / POS hosting** — Visitors are authorization requests with a hard 2-second terminal timeout: binary, no partial credit, and a timeout is a queue of humans at a till across 4,000 stores. Scarce = **p99.9** latency, not p99, because 0.1% of a million transactions is thousands of angry stores. Threats: certificates expiring on *client* connections you don't control, a card-scheme mandate deadline, a BIN routing change, a Saturday peak that is also your maintenance window. Customers impose a **freeze calendar** — ship by October or wait until February.
- **"The Oracle Booth" — LLM inference API [EARLY-MID in the AI-era act]** — Distinct from GPU training: customers are *apps calling your model* and the unit is a token, giving the game its fastest MRR heartbeat as revenue ticks with every request. Applications, not people, expect 900ms p99 and have no patience for a cold queue. Threats: jailbreak mobs arriving as cheerful customers carrying cursed questions, **model extraction** by silent repeated sampling, prompt injection aimed at the model rather than the machine, and the demo that goes off the rails. The batching engine is the throughput-vs-latency dial — customer experience traded directly against margin.
- **"The Office Park" / "The Eight AM Stampede" — Virtual desktop / VDI [LATE-ish]** — The demand curve is a *wall*: 12,000 logins between 7:58 and 8:02, and the customers morally cannot churn — it's their exam. Signature mechanic is the **profile-storage crush**, a read-storm as everyone's desktop loads their whole life at once; a dropped session is a failed exam and a lawsuit. Threats: golden-image update storms, keyloggers baked into an image, session hijack, print-to-PDF exfiltration. Per-seat monthly billing to HR departments, schools and call centres who churn as 3,000-desktop blocks, with extreme exam-window seasonality and dead summers.
- **"The QPU Parlor" / "The Séance Room" — Quantum compute time sharing [VERY LATE capstone]** — Jobs are probabilistic: a run returns a **shot-quality meter**, not a result. Cryogenics uptime replaces the power feed and a dilution-refrigerator warm-up is unrecoverable in-level; decoherence makes queued jobs rot while waiting, so the queue is a spoilage bar, the anti-cache. Threats: algorithm-rationing disputes and the harvest-now-decrypt-later crypto-mob, which attacks your **backups**, not your QPU. Research grants and pharma whales; capacity in quantum-hours and everyone begs. (+6 var)
- **"The Last-Mile Host" — Fiber ISP (GPON) [EARLY-MID of its own act]** — The dial-up act's modern descendant: you host *networks*, not servers, and **splitters are the new shared hosting** — one PON tree is 32 neighbours sharing bandwidth, noisy-neighbour made optical, with dBm budgets instead of CPU quotas. Threats are physics and paperwork: flapping ONTs, the customer-equipment warranty swamp, a truck roll with its own budget line, CGNAT as a policy tower the homeowners' forum riots about. The inversion: abuse complaints originate *from* your customers' houses and your /22 lands on Spamhaus. ARPU economics, rural subsidies and a grant economy. (+1 var)
- **"The Physics Server Room" — OT / SCADA industrial hosting [LATE]** — Plant control for energy, water and manufacturing with every IT rule reversed: the air gap is *literal geography*, data crosses by hand-carry through one-way diodes, and the courier walk lane is your throughput limit. Latency is irrelevant but **determinism is god** — control-loop jitter bursts a pipe and you lose the level to a customer's own physics. Patching needs a shutdown contract; SLAs are signed in engineering units. Boss threat is the Stuxnet-archetype worm crossing the gap on a USB sprite, plus safety-instrumented sabotage where the worst outcome is a safety event, not downtime. Enormous contracts, decade-long procurement, zero churn.
- **"The Beach House" — Subsea cable landing station [LATE/finale]** — You host the cable landing and the map is a globe: latency is *the shape of the ocean*, and rerouting around a cut is literal traffic engineering. Your customers are every provider whose bits cross your sand. Threats are anchors, trawlers and earthquakes — three simultaneous cuts is the level — with the restoration ship as a slow weather system parked over the fault for days. The last place the network is unambiguously made of dirt and water.
- **"The Road Builder" — Transit wholesaler / dark-fiber baron [LATE interstitial]** — The inversion level: your customers are other hosts and the lanes themselves are the product. A customer river never reaches a core — it passes *through* you and pays a toll, and threats cut roads rather than besiege buildings, so **you play as the maze, not the castle.** Placed as a late-campaign interstitial or an endless-mode skin. (+1 var)
- **"The One Kitchen Row" — Multi-tenant SaaS / platform hosting** — You host one app many times, so a vulnerability in *your* app is a zero-day for every customer simultaneously — the correlated failure you built on purpose. The core instrument is a **blast-radius UI**: one vulnerability lights a heat overlay showing which tenants are exposed, which is all of them, instantly. Patch propagation is a wave that must outrun the exploit wave, making deploy speed the tower; per-tenant feature flags are the containment verb and the noisy-neighbour SLA becomes tiered fairness quotas. (+6 var)
- **"The Screen Wall" — MSP mode / managed service provider [MID/LATE overlay type]** — You don't own the datacenter, **you own the remote access**: the path is a graph of *client networks*, threats enter through their mistakes, and you defend with patch agents, RMM towers and "convince the client not to click" mechanics. Responsibility without authority; the signature humiliation is being locked out by your own customer. Borrowed-blame economy: their uptime clauses become your liability unless telemetry proves the client did it. Signature threat is the credential vault — a Kaseya-style RMM supply-chain event signing into every client at once — mirrored by an RMM-provider outage darkening all clients through no fault of yours. (+2 var)
- **"Detonation Terrariums" — Malware-intelligence / detonation hosting** — You host live malware *on purpose*, inside sandboxes: a breach level played from the other side. The threats are inside the tower from the start and **containment decay is the resource**, making isolation a consumable rather than a wall. Money is research grants — slow, dignified university cheques. A high-skill, high-horror bonus level.
- **"The Letter Carrier" — Bulk email / newsletter delivery (ESP) [MID]** — Distinct from hosting mailboxes: you send other people's campaigns, priced per 1,000 emails over **shared IP pools** where one spammy customer tanks everyone's placement. Signature event is "the Gmail loop" — your range gets loop-listed and every customer's open rate craters at once, a statistical threat that never touches a server. Counters: the dedicated-IP upsell (isolation you rent out) and list-hygiene gates enforcing a complaint-rate ceiling above which the internet closes doors. Metered revenue brutally correlated with your own platform behaviour.
- **"The Carrier's Child" — SMS / A2P messaging [LATE, small scenario]** — The same deliverability commons as email, but with **actual carriers as gatekeepers**: registration and compliance towers (a 10DLC analog) gate your traffic, filter events randomly blackhole messages, and carrier revenue-share negotiations are take-it-or-leave-it. Teaches that when the commons has an owner, the owner sets the price. A tight, cynical, high-margin palate cleanser.
- **"The Town Crier" — Push / mobile-backend hosting [MID]** — Notification fan-out for apps with 40 million devices, where load arrives as **scheduled tsunamis** — your customers' 9:00am campaign blasts, predictable if you watch their calendars. Threats: a misfired push becoming a hug-of-death, OS-version changes silently breaking your delivery pipes (external platform risk you can only diversify), device tokens as honey for credential stuffing at device scale. Buildables: the fan-out tree (depth traded against latency), per-platform rate governors, idempotency guards. Per-MAU billing with brutal tier cliffs.
- **"The On-Sale Stampede" — Ticketing / auction mega-event [MID-LATE]** — Revenue concentrated into 90-second tsunamis: two million humans and six million bots arrive at exactly T+0 for one artist's presale. The core puzzle is **queue fairness** — a visible lottery tower must bleed humans at a steady rate while scalper swarms wearing human-shaped masks try to jump it. Signature threat is cancelling the sale, a reputational rather than technical boss. Teaches that fairness is a capacity problem; pairs with game hosting and e-commerce.
- **"The Memory Palace" — Wiki / archive hosting [MID]** — The donation-economy inversion: money never arrives as MRR but in **fundraiser campaigns**, opt-in waves where you spend uptime goodwill to trigger donation geysers, so reputation is literally the revenue curve. Customers are pilgrims who never pay but *are* your reputation. Threats: takedown legal waves, crawler swarms (some welcome, some locusts), link-rot entropy, one-vandal-bot-per-minute attrition. The mission is durability — lose a page and it is gone from the world.
- **"Tax Day" — Government e-services portal [LATE]** — Deadline-shaped traffic: quiet until a legal deadline compresses a nation's filings, renewals and benefit enrollments into six hours. The constraints are the level — procurement law forces low-margin contracts, accessibility mandates are literal build requirements whose absence auto-fails you at a regulator event, and sovereignty rules forbid certain foreign buildables outright. Threats: DDoS by disgruntled citizens, defacement art, data-breach state emergencies. Constraints you cannot buy your way out of; composes with regulated and sovereign hosting.
- **"The Travel Agent" — Hybrid-cloud broker [MID]** — You own some racks and **rent everyone else's**: the board is a marketplace of other companies' capacity. The core mechanic is **arbitrage with reputation risk** — oversell a public-cloud tier and when *their* region burns, your customers blame *you*. Signature threat is the vendor outage, an entirely new failure class you do not control, plus price wars. Money is margin spreads that tick live; teaches multi-region dependency before you own any regions.
- **"The Quiet Lottery" — Quant research cluster [LATE]** — The batch inversion of the GPU level: **nobody is online at all.** Zero customer river for most of the level, enormous compute billing, and one brutal 90-second window per day at market open where everything that must work, must work. Threats are exfiltration and sabotage, never floods. A horror-flavoured stealth level where the *absence* of customers is the tension.
- **"The Running Room" — Arbitrary-code-execution hosting (E2B / online judge) [MID-LATE]** — Your *product* is RCE on demand, distinct from PaaS because every unit of traffic is a live exploit by design: the workload **is** the attack surface, so microVM/gVisor isolation is the main gun rather than a premium add-on. Container escape is the boss and egress lockdown matters because the only thing worse than running the code is the code calling home. Threats: infinite-fork students, cryptominers posing as "test #4811", and the prompt-injection wave the moment an LLM's tool-use executes. Per-second billing to AI-agent startups, cyber ranges and education, where isolation's ~8% CPU overhead is your entire gross margin.
- **"The Lighthouse Keeper" — Managed security / SOC-as-a-service [LATE, service business]** — You sell vigilance: per-endpoint monitoring MRR, incident-response retainers, and a hunt team you dispatch to *customers'* incidents — their map, your controls, their SLA counting against you. Reputation *is* the product in its purest form; one botched engagement stalls the RFP pipeline for a season. Signature threat is abuse of your own tooling, where leaked playbooks become someone else's evasion manual.

---

# Threats — summary

> Source: `master/03-threats.md` · 603 idea entries · 488 KB

## 2.1 Threat design principles and the role taxonomy

- **The five axes of threat distinctiveness** — pathing, target, visibility, counter-shape, cost profile; plus a sixth axis, damage *denomination*, capped at four threats per level sharing one.
- **The four damage currencies** — cash / churn / reputation / capacity, colour-coded on the HUD; best threats are cheap in one currency and devastating in another.
- **Every threat is quoted in dollars and churn** — HUD shows $ exposure + churn risk per incoming threat; "server down" isn't damage, the causal chain to renewal churn is.
- **The four bands (weather / storms / hunters / entropy)** — ambient noise / telegraphed events / adaptive targeted attackers / your own stuff breaking.
- **The four families (malicious / entropic / human / systemic)** — orthogonal cut governing wave composition; mixing families inside one wave turns a difficulty number into an encounter.
- **The Threat Role Taxonomy (design-first, theme-second)** — twelve mechanical roles (Swarm, Tank, Sapper, Stealth, Splitter, Healer/Spawner, Bypass, Siege, Debuffer, Mimic, Parasite, Boss); role legible at a glance, flavour on inspection.
- **The Nine Defense Roles and the Coverage Grid** — Absorb/Classify/Meter/Contain/Detect/Recover/Deter/Divert/Negotiate; UI grid of threat roles × defense roles names your uncovered holes in plain language.
- **Attacker budgets (making yourself expensive is the win condition)** — each archetype has hidden budget + expected return; cost > return three attempts running and they leave the level; Attacker Ledger shows it.
- **Every threat must be telegraphed, readable, and counterable by more than one build** — at least two viable counters from *different* defense roles, else it's a tax not a decision. (+2 var)
- **At least a third of all threats are non-attacks** — hardware, power, human error, regulators, customers; your own customers should cause as much trouble as all hackers combined.
- **The scariest threats look exactly like customers** — build a whole ambiguity family off the Shared Pipe pillar (§2.4).
- **Threats punish specific build choices (the wave deck is a mirror)** — wave generator draws from the Attack Surface Ledger; no DB, no SQLi. Capped by mastery demotion (5 clears → weather), 8–10 active families per level, and retirement-on-delete. (+4 var)
- **Damage types should differ so defenses aren't interchangeable** — availability, money, reputation, integrity, and *attention* (consumes player actions), the one the genre never models.
- **Nothing announces itself (presentation rule)** — alerts are symptoms ("load average high"), identification is a player diagnosis action; arrivals are telegraphed, identities are not.
- **Damage is often delayed and off-screen** — webshell → C2 → RBL listing across weeks; post-mortem screen shows the causal chain retroactively.
- **Threats path the dependency graph, not geometry** — published targeting function `attractiveness = (vulnerability × value × exposure) / defence_depth_on_path`; families weight different terms, so the security overlay is the attacker's own view.
- **The Two-Front Law (a wave design rule)** — every hard wave attacks two of {bandwidth, concurrency, hands, cash, reputation, data integrity}, so no single stockpiled resource solves it.
- **The Second Incident rule** — new-incident probability ×1.8 while already in an incident, ×2.5 during recovery; stated in the Codex, justifies change freezes and runbooks.
- **The Feint (the telegraph as a weapon against you)** — a loud over-telegraphed volumetric covering a quiet second vector; tell exists on one overlay. Cap one per level, never consecutive.
- **The Grudge system (attacker persistence with a visible state)** — 0–5 grudge pips per archetype; rises when you beat them humiliatingly, high grudge means they return sooner, bigger, countering your last defense.
- **The Copycat Wave (the game remembers what beat you)** — 10–15% of each level's pressure budget drawn from your personal miss list of the last two levels, flagged "familiar" in the forecast.
- **Threat behaviours worth designing around (an authoring checklist)** — persistent vs transient, visible vs invisible, attacks-the-defense, attacks-the-seam, sleeper, correlated (shared hidden dependency).
- **Threat delivery mechanics (how they "approach")** — seven arrival shapes: lane marching, rain, sleeper, pressure-meter, correspondence (inbox documents), compound waves, telegraphed bosses.

## 2.2 Ambient weather (constant background noise)

- **Scanner Swarm / Masscan Gnats / The Scanner Drone** — harmless drifting probes that tag exposed services within ~90s and build a visible Recon Map flagging targets for the next three levels; also generate the log noise that hides real attacks. Counter: default-deny, surface reduction. (+9 var)
- **The `/wp-login.php` Brute Squad** — endless credential guessing; real cost is CPU (full app bootstrap per attempt) plus log storage. Counter: fail2ban, rate limit, 2FA, or just move the login URL.
- **SSH Brute Force (the background radiation)** — permanent drizzle costing nothing until one lands. Counter: key-only auth, bastion, VPN-only mgmt — plus a *placebo* non-standard-port upgrade that demonstrably does little.
- **`.env` / `.git` Crawlers** — probe for `/.env`, `/.git/config`, `/backup.sql`, `/phpinfo.php`; harmless unless you left one behind, and the game lets a "quick debug" action leave one for three days.
- **Comment / Form Spam Drones** — attack content not server, eroding visitor trust and SEO. Counter: honeypot field, CAPTCHA (which repels ~4% of real visitors), or paid filtering.
- **Referrer / SEO Spam Ghosts** — pollute analytics so your own dashboards lie; damage is informational, leading to bad build decisions. Founding member of the HUD-attack family.
- **Bad Bot Fleet (aggressive crawlers)** — ignores robots.txt, walks faceted-search URL space (40M URLs from 300 products), destroying cache hit rate; crawlers can be 40% of requests. Counter: crawl-delay, per-ASN limits, tarpit. (+1 var)
- **AI Scraper Locusts** — distributed residential-IP crawls with rotating UAs, indistinguishable from visitors; blocking costs real customers. Counter: behavioural fingerprinting, ASN reputation, proof-of-work — or sell them an API plan.
- **Scraper Locust (content theft variant)** — purely economic bandwidth-and-content theft, visually defoliating your pages; dotted outline vs the legitimate Crawler Consortium's dashed one.
- **xmlrpc Pingback Amplifier** — turns your server into someone else's attacker; upstream sends abuse notices then null-routes you. Counter: disable the feature, egress filtering, outbound rate caps.
- **Revenue Leakage (the business layer's weather)** — 0.2–0.5% of MRR/month silently fails to reach billing; invisible unless you build Revenue Assurance. The money-side equivalent of scanner noise.
- **The Commoditization Fog** — product becomes 3% less differentiated each quarter unless you ship; shows up as declining conversion with no visible cause. Counter: new products, niche, brand.
- **Abuse Complaint Backlog (ambient form)** — a slowly filling tray, not an event; every unhandled complaint raises Heat and feeds §2.20's escalation doom clock.

## 2.3 Volumetric and protocol floods

- **SYN Flood / The Half-Handshake Pile** — fills the LB connection table with half-open connections so real customers get refused. Counter: SYN cookies, conntrack tuning, upstream scrubbing. ⚔️ whether SYN cookies are a free permanent unlock or carry a real cost (lost TCP options hurting lossy/mobile clients), vs §4.1's "no pure upgrades" law. (+9 var)
- **UDP Amplification Barrage (DNS ANY / NTP monlist / memcached / SSDP / CLDAP)** — a wall bigger than your pipe by design; you can't filter 400Gbps on a 10Gbps link. Counter: upstream scrubbing retainer, anycast, flowspec, or cheap RTBH blackholing your own customer's IP. (+6 var)
- **Reflection/Amplification where YOU are the reflector** — your open NTP/DNS/memcached is used to attack others; no damage until the abuse complaint, transit spike, and upstream null-route threat. Counter: BCP38, RRL, close resolvers.
- **Reflection Aimed *Through* You** — someone spoofs your IP as source, so legitimate servers' replies flood you; blocking them means blocking innocents.
- **Slowloris / RUDY (slow POST) / "The Sipper" / "The Molasses Sloth"** — near-zero bandwidth, dribbles headers forever holding worker threads; your bandwidth graphs stay green while you're dead. Counter: idle timeouts (kills slow mobile users), per-IP connection caps, event-driven frontend. (+7 var)
- **The Slow Read (reverse Slowloris)** — requests a big response then reads at 1 byte/sec, pinning a worker and memory; *write* timeouts are a different setting from read timeouts, so fixing one misses the other.
- **HTTP/2 Rapid Reset** — thousands of opened-and-cancelled streams on one well-behaved connection, defeating every connection-counting defense you built. Counter: concurrent-stream limits, reset-rate budget, proxy upgrade.
- **The Handshake Flood (asymmetric crypto cost)** — cheap TLS handshake initiations force 1:10 server CPU cost; trivial volume, 100% CPU. Counter: session resumption, handshake rate limits, offload, edge TLS termination.
- **Layer-7 GET Flood on the Expensive Endpoint / "Refresh Rats"** — 200 req/s aimed at the one uncacheable DB-hitting path (search, cart, export) kills you; every counter also repels revenue. Counter: query normalization, per-endpoint limits, JS challenge/CAPTCHA at a conversion cost. (+6 var)
- **ReDoS — The Regex That Ate A Core** — crafted input causes catastrophic backtracking, pegging a core for tens of seconds per request; the vulnerable regex is often in your own WAF ruleset. Counter: input length caps, regex timeouts, rule-cost profiler.
- **The Decompression Bomb** — a body that expands 1000:1 fills memory or disk in seconds; hits upload, backup ingest, log ingest, AV, object storage. Counter: decompression ratio limits + hard output cap.
- **Cache-Buster Flood / Cache-Miss Storm** — random query strings bypass cache, turning your own CDN into an amplifier at your origin. Counter: cache-key normalization (must be discovered by observation), origin shield, miss-rate limiting.
- **Mirai-Style IoT Botnet / The Murmuration** — tens of thousands of weak residential sources you cannot block by IP or country without eating real users; flock leans visibly toward its target. Counter: scrubbing. (+20 var)
- **Pulse Wave** — repeated short enormous bursts timed to land between autoscaler reaction windows, punishing reactive-only builds. Counter: pre-warmed capacity, faster detection, autoscaler floor.
- **Carpet Bomb / Prefix Attack** — low rate per IP across your whole /24, under every per-IP threshold but summing to a full pipe; defeats per-host defenses. Counter: prefix-level aggregation detection.
- **Connection Exhaustion** — fills the LB connection table with *real* connections (unlike SYN flood); visitors queue outside with patience draining.
- **Cache Stampede / Thundering Herd** — a popular cached item expires and 10,000 real visitors miss at once; family includes warm-up, restart, deploy, renewal and cron herds. Counter: jittered TTLs, request coalescing, stale-while-revalidate.
- **Retry Storm** — client retry logic turns a 2-second blip into a 4-minute outage; a secondary threat that only fires after something else fails. Counter: backoff with jitter, circuit breakers, load shedding, `429` + `Retry-After`. Worst in IoT and serverless.
- **TCP Incast** — many servers answer one request at once and swamp the requester's switch port; only emerges above a fan-out threshold, so scaling out creates it. Hits object storage, HPC, DBaaS, video ingest.
- **Packet Swarm (generic volumetric, presentation entry)** — generic DDoS rendered as mass: ribbon width = packets/sec, packets *pile up* in front of the server burying its faceplate; promote pile-up to the universal full-queue rendering, cyan for legitimate surges.
- **Booter / Stresser Kid** — $15 rented botnet, 30-second bursts aimed at one tenant every evening; forces the choice to null-route your own paying customer. Gives up after three ineffective attacks. Endemic to game hosting.
- **Ransom DDoS (RDoS)** — demo attack then an extortion email with a HUD countdown; paying works once but permanently marks you as a payer, raising future extortion frequency. ⚔️ whether the ransom note may occlude UI mid-incident; resolution limits it to a dismissable non-critical region.
- **Bandwidth Bill Bomb** — you survive the attack and lose the month: 95th-percentile billing makes absorbed/scrubbed traffic cost real money at zero downtime. Counter: scrubbing contract, itself sellable as a premium product.

## 2.4 Mimics: threats that look like visitors

- **Layer-7 Mimic** — human-plausible requests for your most expensive page from thousands of residential IPs; indistinguishable from popularity, and rate-limiting hard enough craters conversion. Counter: cache it, per-request cost budget, Bot Fingerprinter (slow to train, poisonable).
- **Card Tester** — tiny transactions validating stolen cards; revenue graph rises right before the processor drops you. Counter: display authorisation-rate beside revenue — card testing pushes revenue up and auth-rate down. (+1 var)
- **Scraper Locust (the ambiguity case)** — high-volume content theft where some scrapers are search engines you want; blocking indiscriminately tanks organic traffic two waves later. Counter: rate limits, robots, or sell them an API plan.
- **The Fake Signup Wave** — hundreds of free-tier accounts from one actor farming resources; your growth metric spikes while margins die. (+1 var)
- **Sybil Reviewers** — fake reviews positive or negative; the positive kind is nastier, inflating reputation, attracting clients you can't serve, then correcting twice.
- **The Squatter (a threat that enters through your revenue funnel)** — signs up with a stolen card and spams/mines/phishes from inside your network until your IP ranges get blacklisted. Counter: fraud scoring, manual review, deposits, KYC — each costing real conversions.
- **Slowloris Sloth (mimic framing)** — walks the lane at 2% speed and never arrives, holding a slot; its mimic quality (a patient customer) is what makes the timeout setting painful.
- **The Coat Thief (session hijack)** — wears a stolen session ribbon past every check satisfied at login; the real visitor bounces confused. Counter: short sessions, device/IP binding (breaks mobile), re-auth on sensitive actions.
- **The Vending Machine Shaker (API abuse)** — rattles your API for freebies: free tier, trial credits, unauthenticated and price-list endpoints. Rate limits drawn as a turnstile with a visible counter.
- **The Mimic Tell (design law)** — every mimic carries exactly one learnable non-colour tell (cadence / formation / path / prop), greyscale-survivable; tells are perceptual at Z1, formation-based at Z2, statistical at Z3+, and taught explicitly via a Codex Tell Trainer at 0.25× speed.
- **The Hug of Death (HN/Reddit/storm)** — legitimate joyful customers at 4000× volume that kill you exactly like a DDoS if scaling isn't ready; the mob is colourful while your alerts are identical to an attack.

## 2.5 Application, injection, and data threats

*Each entry is unspawnable until you build the thing that invites it (Pillar P2).*

- **SQL Injection Serpent / The Ink Worm *(unlocked by: a database)*** — attacks the web↔DB *link*, copies the customer table and leaves; damage is delayed reputation + legal cost discovered months later. Counter: prepared statements (customer-owned code), WAF, least-privilege DB user, egress filtering. (+10 var)
- **Blind SQLi** — same attack with no attack marker, visible only as a faint query-latency anomaly; requires monitoring to see at all.
- **The Dump (the consequence unit)** — arrives two levels after a successful SQLi as a news event: notification costs, credit monitoring, fines, deductible, a 3–6 month churn tail, and every enterprise deal freezing. (+1 var)
- **XSS Worm / XSS Marionette / The Mirror Moth *(unlocked by: user content)*** — spreads through your user graph; rides inside a legitimate visitor so killing the carrier loses a customer. Counter: output sanitization, CSP. (+1 var)
- **File Upload Backdoor / Webshell** — quiet permanent resident dropped via your upload feature; spawns later threats, re-infects after cleaning, requires an active hunt to remove. Counter: FIM, egress anomaly detection, immutable infra, rebuild-don't-clean. (+3 var)
- **Path Traversal Sneak / Directory Traversal Mole** — small fast unit going for config files; success steals credentials that later spawn a Credentialed Intruder walking in the front door. Counter: chroot/jail, least privilege.
- **Deserialization Bomb *(unlocked by: app framework / a convenience plugin)*** — rare one-shot enabled only by a specific convenience plugin you installed for +conversion; converts one of your servers into an enemy spawner.
- **SSRF Tunneler / SSRF Courier** — tricks your own server into attacking your internal network, walking backwards through the trust boundary; the cloud metadata endpoint is the flagship target. Counter: egress filtering, IMDSv2/metadata gating, segmentation. (+2 var)
- **Cache Deception (the mirror of cache poisoning)** — tricks the CDN into publicly caching an authenticated page under a static-looking URL; a data breach delivered by your own performance optimization, invisible in every metric. Counter: cache-key and content-type discipline.
- **Dependency Poisoning / Typosquat / Supply-Chain Trojan / The Tainted Crate** — arrives during a deploy inside something you asked for, spawning inside your walls at a rate proportional to third-party component count; no counter at arrival, only prior architecture. Counter: lockfiles, pinning, SBOM, artifact mirrors, build isolation — all of which slow deploy cadence. (+12 var)
- **Log4Everything / The Zero-Day Drop / Exploit Kit (CVE Drop)** — global disclosure event naming a component you actually built; hours between disclosure and mass exploitation, and patching itself risks breaking a customer's site. Rendered as a threat with *no icon* until incident analysis fills it in. (+14 var)
- **Zero-Day first strike: "patched-fizzles" vs "guaranteed first hit" — *CONFLICTING*** — four positions on the same event. ⚔️ whether patch hygiene can make a zero-day miss entirely (B: fizzle by recency) or the first strike always lands and you only control blast radius (A/C), with D proposing graduated damage scaling off a patch-hygiene stat.
- **The Opportunist Sprayer (CVE spray)** — sprays known exploits indiscriminately; harmless until you have an unpatched thing, then instantly lethal. Punishes patch debt and nothing else.
- **Magecart Skimmer** — injected JS steals card details at a customer's checkout; you learn it from the card brands, not your monitoring. Counter: SRI, CSP, FIM, and a customer who lets you patch.
- **Vulnerable Plugin / The Bad CMS Update** — outdated CMS plugin popped, causing mass defacement across every account on the box plus IP-range blocklisting; fleet homogeneity is the multiplier. Counter: managed patching (which sometimes breaks sites), virtual patching, per-account isolation.
- **Cryptominer Squatter / Infestation *(Sapper role)*** — post-compromise payload stealing ~30% CPU forever; diagnosed by convergence of three partial signals (flat traffic + high load, thermal outlier, consistent egress). Variants: GPU mining on rented AI capacity, free-tier CI mining, and proxyware (no CPU signature — detected by IP reputation decay). (+10 var)
- **Outbound Spam Cannon / Spam Relay** — a compromised mailbox or contact form blasts; damage is delayed and collective as your whole IP range gets listed and every customer's mail bounces. Counter: per-account outbound limits, abuse team, feedback loops, sending segmentation. (+1 var)
- **Backup Poisoner** — quietly corrupts backups, invisible until you need them; the only counter is restore testing, which costs time and shows no benefit until it does.
- **Ransomware on the File Server / Ransomware Bloom / The Padlock Bloom** — spreads node-to-node and reaches any mounted backup share; two authenticity upgrades: a multi-minute stealth *dwell* phase (of which Backup Poisoner is an earlier stage) and *double extortion*, so a perfect restore still loses. Counter: immutable/offline/pull-based backups with separate credentials, air gap, segmentation, tested restore. (+18 var)
- **The Hypervisor Ransomware** — encrypts datastores under the guests, taking 200 VMs at once; the guests' own AV, patching and backups are irrelevant. Counter: management-plane isolation and MFA bought long before.
- **Ransomware (customer-side)** — your customer is encrypted and you get called; your tested backups make you the hero or a corpse, and either way it eats your whole hands budget. Signature event for backup/DR and managed hosting.
- **Hypervisor Escape / Container Breakout / Multi-Tenancy Escape** — one tenant reaches another's data; extremely rare, reputation-ending. Counter: patch cadence, dedicated hosts, gVisor/Firecracker, disabling nested virt and SMT at a real ~20% capacity cost.
- **The Full Table Scan / The Noisy Query** — a customer query fine at 10k rows and fatal at 10M; the threat grows with your success and one tenant's missing index degrades everyone. Counter: DBA hire, query monitoring, per-tenant throttling.
- **Worm / Conficker (self-building threat)** — constructs attacker towers along your own lanes, turning your map into enemy TD territory; clearing means taking them one by one while customers bounce. (+1 var)
- **Rootkit / Bootkit Implant** — survives reboots and is invisible to basic monitoring until a beacon meter spikes. Counter: integrity-checking tower (AIDE class), known-good boot chain. VPS, dedicated, GPU.
- **DNS-Tunnel Tactician (exfil hiding in your plumbing)** — stolen data leaves in tiny A-record queries through the resolver you depend on; visible only on the DNS overlay. Counter: query-length/entropy telemetry; naive blocking breaks everyone's browsing.

## 2.6 Credential, access, and human threats

- **Brute Force Drip** — endless slow login attempts; low damage, constant noise, real cost is log volume and CPU. (+6 var)
- **Credential Stuffing Tide / Keyring Hail** — *correct* passwords from someone else's breach, so rate limiting doesn't help; each attempt is individually indistinguishable from a real login and can only be made unprofitable. Counter: MFA (a customer-behaviour stat you influence, not mandate), breached-password checks, impossible-travel detection. (+5 var)
- **Phishing Campaign / Phishing Kite** — targets staff not servers; a landed one silently compromises a staffer. Counter: training, a recurring cost with no visible benefit that decays over time and after turnover. (+9 var)
- **The Insider / Insider Badge / The Flickering Badge** — a hired staff unit with legitimate credentials most towers ignore. Redesigned as a three-clue deduction (off-hours access, data-volume anomaly, declined vacation; any two identify); you may accuse (wrong = team-wide morale hit) or contain quietly without ever learning who. ⚔️ whether the tell is a pixel-level sprite cue and whether low morale is the sole trigger — resolved toward behavioural audit-log detection plus an independent lone-disgruntled trigger. (+7 var)
- **The Disgruntled Admin** — morale hits zero: loud immediate sabotage, or they quit taking institutional knowledge — a permanent loss of a discovered tech until re-learned.
- **The Ex-Employee / Forgotten Key** — an old SSH key still in `authorized_keys` on 40 boxes; spawns only if you skipped offboarding, fires once, and paths straight to the weak point because they know your layout. Counter: offboarding checklist, periodic access reviews.
- **Social Engineering Call / Vishing the Support Desk** — attacker phones your support team for a password reset, bypassing all technology; variants include fake DMCA, fake transfer auth, fake law enforcement. Counter: callback verification (friction + handling time), account PIN, registrar lock, training stat.
- **The Friendly Face (badge tailgating, presentation)** — staff-coloured sprite walking past the badge reader behind a real employee; physical intruders path through the dark polygons where camera coverage is missing, making the route fixable by buying a camera.
- **Registrar / DNS Hijack / Domain Takeover** — your registrar is social-engineered and your domains point elsewhere; servers perfectly healthy and completely unreachable. Counter: registrar lock, registrar MFA, low-privilege domain account, DNSSEC, external NS monitoring. (+1 var)
- **Exposed Management Interface** — internet-reachable IPMI/iDRAC/Redfish with default creds gives physical-equivalent control (power off, mount virtual media); no in-guest software defense helps. Counter: OOB isolation, VPN-only management, rotation, self-scanning.
- **Living Off The Control Panel** — valid credentials, no malware: change MX, add a forwarding rule, restore an old backup over the live site. Nothing for an IDS to see; the mail forwarding rule survives password reset and MFA, so the counter is an audit of account *settings*, not credential rotation.
- **The Leaked Key In The Public Repo** — a committed API/SSH key found by scanners in under 90 seconds; arrives with valid credentials and correct fingerprint, so there is no network signature. Counter: secret scanning, short-lived credentials, spend/egress anomaly alerting — the first symptom is a bill. (+2 var)
- **The Canary That Nobody Watched** — a honeytoken fires a high-confidence alert into an inbox nobody has read for eight months, revealing a compromise and an alerting-path failure at once.
- **Supply Chain Vendor** — your monitoring vendor is breached and the agent you installed on every box becomes the attack path; punishes centralization, rewards expensive diversity.
- **Control Panel Exploit** — one vuln gives root on every server running the panel simultaneously; the homogeneity that made the fleet manageable kills it at once. Shared web, managed WordPress, any monoculture.
- **Tailgating / The Unescorted Visitor / The Evil Maid** — two sprites on one badge swipe in a one-frame animation, catchable later in the access-log overlay. Counter: mantraps, badge policy, cameras, escort policy — all friction on your own staff. Colo, regulated, GPU. (+3 var)
- **The Guy In A Hi-Vis Vest With A Clipboard / Sneakernet Intrusion** — a person with a plausible ticket walks in; exists only once you own a building. Counter: badging, mantraps, escort desk.
- **Privilege-Escalation Infiltrator** — disguised as admin traffic, gains a rank (user→root) at each buildable it passes unopposed; a rooted one doesn't attack, it opens the gate for a wave. Counter: least-privilege towers, session-audit drones.
- **The Watering Hole (delayed-fuse threat)** — prepares rather than attacks: a barely-visible progress bar only monitoring reveals, growing across several waves before detonating exactly when the next flood lands. Counter: sweeps, Canary Rack.
- **The Whistleblower** — offshore/regulated levels only: your own records walk out and the fog of war *inverts*, making every hidden defect permanently visible to the attack AI and every later wave more precise.
- **BEC / Invoice Fraud (the executive threat)** — attackers impersonate you to your customers ("rewire the payment") or a vendor to you; direct cash loss plus reputation damage with infrastructure untouched. Counter: DMARC/DNSSEC buildables, awareness training.

## 2.7 Infrastructure and network threats

- **BGP Prefix Hijack *(Siege role)*** — someone announces your /24 more specifically and your traffic goes to zero globally; unfixable from inside, fought with relationships and paperwork. Counter: RPKI/ROA, IRR objects, upstream prefix filters, route monitoring. ⚔️ helplessness as an emotion vs an unplayable minute — resolved by giving three actions: verify externally, announce more-specifics, work the phone. (+8 var)
- **BGP Leak / The Spill** — someone else's misconfiguration steals your traffic; you file and wait or announce more-specifics. Powerlessness as a designed feeling.
- **The Downstream Route Leak** — a multihomed customer re-advertises the internet through you; without prefix filtering you become transit for a continent and both routers and bill melt.
- **The Max-Prefix Shutdown** — announcing one prefix over a peer's configured limit drops the *entire* BGP session; recovery needs the other party's engineer on their timeline.
- **BGP Dampening — the punishment that outlasts the fault** — you fixed the flap, everything is green, and your prefix stays suppressed upstream for 45 more minutes. Lesson: administratively shut a flapping session before fixing it.
- **The RPKI Self-Inflicted Blackhole** — your ROA maxLength is /24 and you announce a /25, so validating networks reject you and the unreachable fraction *grows over time*; the security control you bought is now the outage.
- **DNS Poisoner / Cache Poisoning** — attacks before the lane so visitors never start walking; terrifying because the board looks totally healthy. (+6 var)
- **Subdomain Takeover** — a dangling CNAME to a decommissioned service someone else claims, so `status.yourcompany.com` serves a scam; created by your own cleanup sloppiness. Counter: DNS hygiene, dangling-record scanning.
- **Transit Flap** — upstream link cycling up-down-up-down, worse than a clean outage because failover keeps re-triggering; partial failure is harder than total failure.
- **Upstream Transit / Fiber Cut / The Backhoe** — a physical path removed for a long duration; only *diverse-path* redundancy counts, and two circuits in one conduit is the classic looks-redundant-but-isn't trap. Counter: separate routes plus a diverse-path audit buildable. (+6 var)
- **Upstream Carrier Outage / The Grey Ribbon** — your carrier simply drops; you did nothing wrong and pay anyway. Ribbon desaturates from the far end inward like a burning fuse.
- **Peering Dispute / De-peering** — a major eyeball network depeers your transit; nothing is down but latency to a chunk of customers doubles and conversion falls while everyone blames their own site.
- **The Blended Transit Downgrade** — your cheap transit quietly changes its upstream mix; same price, same "up", latency to a third of the internet doubles and conversion drops 4%. Counter: external latency measurement from many vantage points.
- **Asymmetric Routing After Failover** — traffic leaves one path and returns another through a stateful firewall that drops it; failover "worked" and nothing works, for some visitors only. A diagnosis puzzle.
- **The Half-Dead Link (unidirectional failure)** — one strand or transmitter dead, link light on at both ends, frames one-way, traffic blackholes while every up/down check says yes. Counter: UDLD or BFD, which must have been enabled beforehand.
- **The Microburst** — 30% utilization on the graph while dropping packets, because the drops are 50-microsecond buffer saturations under a 5-minute average. Implemented as a telemetry-resolution dial where buying finer sampling changes what is true. Storage nets, video ingest, HFT colo.
- **Spanning Tree Loop / Broadcast Storm / MAC Flood** — a cabling mistake *you* made takes the whole VLAN to zero instantly. Counter: BPDU guard / portfast, unlocked after doing it once. (+1 var)
- **Rogue DHCP / Rogue AP** — someone plugs in a consumer router "just to test" and half your servers get the wrong gateway. Counter: port security, at a setup-speed cost.
- **The PXE Reimage Incident** — a MAC typo or default PXE policy makes the wrong production machine net-boot and partition itself; fast, complete, self-inflicted by your own automation. Counter: separate provisioning VLAN, MAC allowlisting, confirm-target gate — all slowing provisioning.
- **Duplex/Speed Mismatch, Bad Optics, and the Dirty Connector** — link up, throughput 3% of nominal, error counters climbing; commonest real cause is a dirty connector fixed with a three-dollar tool. Counter: a deep-inspection action reading interface error counters.
- **NIC / Optic / Cable Gray Failure** — a dying SFP drops 0.4% of packets; TCP hides it and everything is mysteriously slow, invisible to up/down monitoring. (+4 var)
- **MTU Mismatch / PMTUD Blackhole** — small requests work, large uploads hang forever, and your monitoring pings are small and green. (+1 var)
- **The Asymmetric MTU Path** — a tunnel or interconnect cuts usable MTU on one direction only, so it affects some customers and not others and switches between them when routing changes.
- **Switch Firmware Bug / Stack Master Failover** — the HA mechanism causes the outage; stacked switches both rebooting during a stack upgrade is the classic. Every redundancy step adds a failure mode.
- **The Firmware Flash That Didn't Finish** — power loss mid-write bricks a RAID controller, BIOS or switch; on RAID the array may be unimportable by a different firmware revision — data intact and unreachable. Counter: staged rollouts, matched-firmware spares, dual-flash devices. (+1 var)
- **The Config Nobody Backed Up** — everyone config-manages servers and nobody exports the *switch* config; rebuilding from memory takes hours and misses a VLAN. Counter: automated network-config backup with diff view.
- **The Management Network That Rode The Production Switch** — your OOB is cabled to the same top-of-rack switch, so console, power control and diagnosis all vanish with the failure they exist for.
- **Clock Drift / NTP Failure — split into two failures** — *loss of time* (gradual, comparable) vs *wrong time* (instant, undetectable from inside); model slewing vs stepping, which breaks duration measurement and can send DB timestamps backwards. Consequences: cert validation, cron double-fire, unorderable logs, Kerberos death. (+2 var)
- **Conntrack Table Full / Ephemeral Port Exhaustion / File Descriptor Limit** — silent drops at a specific concurrency threshold; works perfectly under test load and dies at exactly 1024 connections. (+6 var)
- **The Loose Cable** — one cable end drawn slightly unseated, traffic flickering across it; a passing tech NPC can reseat it. Rewards looking closely.
- **Rodents, Wildlife, and the Literal Bug** — chewed cables, moths in relays, wasps in condensers, a cat in the raised floor causing random link death. ⚔️ untelegraphed random link death vs the design's no-unfair-randomness rule; resolved with conduit/rodent-guard purchases plus a ~30-second visible chew-damage precursor state. (+3 var)
- **DNS Failure Cascade (invisibility)** — blocked zone transfer, stale glue, or a dead authoritative provider means you can't be attacked *or* visited. Counter: anycast DNS, secondary on a different provider.
- **Man-in-the-Middle** — intercepts a cable mid-run, cuts in and repaints itself in your link's colours; only cert-sniffing patrol bots catch the mismatched pads. (+1 var)

## 2.8 Entropy: hardware, power, cooling, and physics

*Erupt from inside your own buildings; constant, probabilistic, never fully preventable. Redundancy converts them from outages into cost and toil.*

- **The entropy rate cap and aggregation rule** — at most one entropy event per 90 seconds reaches the alert stack; the rest accumulate silently into a maintenance-debt overlay cleared in batches. ⚔️ "frequent, small, attention-taxing" entropy vs the Notification Discipline / Readability Budget.
- **The Entropy Pressure Budget (a second, quieter generator)** — entropy runs its own budget, deliberately anti-correlated with the attack sawtooth, as a function of estate age × size × (1 − maintenance spend); makes peacetime non-idle.
- **The stated entropy budget (numbers)** — annualised failure rates scheduled as a designed distribution, not rolled per tick: drives 2%/yr rising to 8% after year 4, PSUs 1%, fans 3%, switches 0.5%, UPS batteries hard-failing at 4–5 years, optics 1% (tripled if counterfeit); events cluster during high load and heat.
- **Disk Failure / Click Death** — hidden wear stat per drive, SMART sells partial foresight; RAID absorbs it into a degraded window where a second failure is fatal and the fix needs a physical hand. Counter: RAID levels, hot spares, erasure coding, mixed batches, on-site spares. (+14 var)
- **Rebuild Storm / The Double Failure** — the fix is the second disaster: rebuild halves array performance and a second failure during it is fatal, with risk rising with array size. ⚔️ the URE-guarantees-failure framing is wrong; the real killers are rebuild duration, performance collapse, and correlated drive age. Counter: RAID6/erasure coding, smaller faster drives, distributed rebuild.
- **Correlated Batch Failure / The Bad Batch** — one lot, one firmware: the second drive dies within 48 hours, or 40 drives brick at exactly 32,768 power-on hours. ⚔️ mixed-vendor procurement is overstated — it only removes *batch* correlation, not environmental (same rack, thermal, power, vibration, age), which needs cross-rack/row/power-domain spread.
- **RAID Controller BBU Death** — battery fails, controller drops write-back to write-through, IOPS falls 10×; everything is "slow" with zero errors logged. A pure diagnostic puzzle with no alarm.
- **Silent Bit Rot / The Fade** — a file corrupts subtly and is faithfully backed up that way for six months, discovered only at restore. Counter: checksumming filesystem or scrub passes costing IOPS for no visible benefit. Signature threat of archival hosting. (+3 var)
- **RAM / ECC Error Cascade / Bad RAM / Static Fleck** — rising correctable-error counts are a *predictable* failure if you watch; non-ECC RAM is cheaper and removes the warning, converting failures into silent data corruption.
- **PSU Pop / The Pop** — single-corded machine dies; dual-corded on *separate PDUs* means nothing happens, retroactively rewarding a boring purchase. Redundant PSUs on the same feed are not redundant.
- **Fan Failure → Thermal Throttle / The Wobble** — gradual, not binary: latency creeps, visitors bounce, nothing is "broken", and you only see it by monitoring CPU *frequency* rather than utilization.
- **Backplane / Controller / Motherboard Failure** — takes out a whole chassis; rare; recovery is rebuild.
- **Switch Failure** — takes out a rack, and a failed firmware upgrade takes out a rack for longer.
- **PDU Overload / Breaker Trip** — one server past the 80% continuous-load rule on a 30A circuit kills everything on the feed including the switch, so you can't see what happened. Preventable by arithmetic; needs a visible per-rack power budget with a red line.
- **Phase Imbalance** — three-phase rack loaded unevenly, fine until it isn't; fixing it means redistributing cabinets, a genuinely spatial puzzle.
- **Power Loss / Brownout / The Power Event Ladder** — four-stage chain: utility failure → UPS countdown → generator start → generator fails because nobody ran the monthly test; the ATS itself is unredundant unless you buy two. A sub-second Utility Blip reveals exactly what you cheaped out on. (+12 var)
- **UPS Battery End-of-Life** — batteries die on a schedule while passing every voltage-only self-test; the grid blips 90 seconds, the UPS holds 11, and a UPS stuck in bypass is worse than none. Counter: capacity tester, periodic *load* testing.
- **Generator Fails to Start** — dead block heater, clogged filter, algae in the diesel, untested start battery, or ATS failure; probability set by whether you ran monthly *load* tests, which cost fuel and carry their own small outage risk. Counter: load-bank test, fuel polishing, priority refuelling contract.
- **Fuel Runs Out** — a long outage becomes logistics: delivery is a ticket with travel time, and during a regional disaster everyone called the same supplier. The prepaid priority contract is the whole difference.
- **CRAC / Chiller / Cooling Failure** — minutes not hours: throttle then thermal trip, with heat spreading as a field across adjacent racks so floor layout becomes a puzzle. N+1 cooling matters more than N+1 power in short outages. Counter: containment, setpoint raise, load shed, workload migration, portable units. (+10 var)
- **Blanking Panel Neglect / Hot Aisle Recirculation** — missing panels raise top-of-rack inlet temps so those servers run hotter and fail sooner; a "you didn't do the boring thing" debuff that makes placement matter.
- **Water Leak / Condensation / Puddle Creep** — damages a floor *region*, punishing co-located redundancy. ⚔️ the CRAC is not the commonest source — the floor above (bathroom, kitchen, sprinkler, another tenant) is, and you cannot fix that, only tarp it and file a complaint; the source should be randomized and diagnosable.
- **Fire, Fire Precursor, and Suppression Discharge** — the inert-gas discharge's acoustic shock crashes spinning disks (so an all-flash rack is a purchasable mitigation) and can blow out wall panels if relief dampers are undersized; the room goes offline either way. (+2 var)
- **Humidity / Static / Dust / The Grime Layer** — low humidity gives static death, high gives condensation; dust is a thermal debuff with a filter-cleaning chore, and the Grime Layer degrades the art itself so neglected areas become literally harder to read.
- **Seismic / The Tremor** — regional event making rack anchoring retroactively important; unanchored racks visibly walk across the floor. The reason multi-region exists.
- **Weather, Storm, Flood, Lightning** — regional, telegraphed; takes a site offline and blocks physical access, with heat waves raising cooling cost and winter giving free cooling. A *nearby* strike induces surges on copper leaving the building. Counter: grounding/bonding, surge protection at penetrations, fibre across building boundaries.
- **Kernel Panic / OOM Killer** — the OOM heuristic kills the biggest process, which is always the database. The worse case: swapping instead, so the health check passes while every request times out — alive and useless is worse than dead. Counter: memory/cgroup limits, `oom_score_adj`, or just buy RAM.
- **Inode Exhaustion** — disk shows 40% free and writes fail anyway because a session directory holds nine million files; the error message lies to you.
- **Log Partition Full** — debug logging left on fills `/var` and services that can't write logs refuse to start; your own monitoring kills the server. Preventable with a two-dollar upgrade nobody buys.
- **Weight Limits on Raised Floor** — forces battery strings and dense storage to slab positions, so UPS and storage can't sit near compute, lengthening power runs and shifting which failure domains overlap.
- **The Hardware Lottery** — hidden per-machine quality: silent lemons and golden samples revealed over time through subtly worse metrics. ⚔️ hidden quality with no counterplay is noise; fixed with a burn-in period verb (24 in-game hours at load) and a warranty claim.
- **Physical: Someone Unplugs The Wrong Thing** — remote hands pulls A17-U22 instead of U23. Counter: labelling — a cheap buildable with enormous payoff that nobody builds — plus coloured cables, port blockers, escorting.
- **Tape Library Robot Jam / Media Failure / The Arm Jam** — the arm sticks with a cartridge, the library goes offline, backups silently stop and every restore queues behind it until a hand fixes it. Archival signature failure.

## 2.9 Self-inflicted and operational failures

*Should be ~40% of all incidents, as in reality.*

- **Certificate Expiry / The Stale Seal** — a visible countdown you will forget; when it fires every visitor bounces at a browser warning, and it's a *trust* failure so the reputation hit is larger. Counter: ACME auto-renewal earned as an unlock after being burned, external expiry monitoring, staggered dates.
- **Let's Encrypt Rate Limit (the automation failure mode)** — the auto-renewal you finally built loops on a broken domain and burns the weekly quota, so the *other* renewals fail too. The counter becomes the problem.
- **Missing Intermediate Chain** — works in every browser you test, fails in old clients and the payment gateway's callback. Your test is not the world.
- **DNSSEC Signing Expiry / Bad KSK Rollover** — no degradation, just hard SERVFAIL for everyone behind a validating resolver. All or nothing.
- **Domain Expiry / The Tumbleweed** — nobody renewed and the registrar's card expired; total instant outage, trivially preventable by an auto-renew nobody buys. Buildings fine, nobody can find them.
- **License Expiry** — depended-upon software just stops; pure upkeep-forgetfulness punishment sharing the TLS wax-seal widget family.
- **Expired Things (the whole calendar)** — certs, domains, cards, contracts, support entitlements, licences, API keys, DNSSEC keys, OAuth secrets; an Expiry Register buildable converts pure gotcha into a purchasable habit. (+7 var)
- **Bad Deploy / The Wrong Commit** — the single most common cause of real outages; per-change defect probability modified by testing/staging/canary/review, with rollback costing time and internal trust. The missing shape is the deploy that only fails *at scale* (resource exhaustion above a threshold), making canary necessary but not sufficient and progressive rollout with soak the real answer. (+7 var)
- **Bad Config Push** — worse than a bad deploy because config is trusted, fast and goes everywhere; the classic is an ACL change locking you out of your own management network. Counter: OOB console — only if it isn't on the same switch.
- **"It Was Fine In Staging"** — data volume, cache warmth, topology, TLS, a missing env var; investing in staging *parity* reduces frequency.
- **The `rm -rf` / Wrong-Environment Incident** — a destructive command run against prod. Counter: per-environment prompts and colours, dual authorization, `--dry-run` defaults, restricted prod access.
- **Failed Rollback / The One-Way Door** — forward deploy takes 40 seconds, rollback needs an irreversible DB migration; which changes are one-way doors should be a real build decision made *before* you open them.
- **Migration Gone Wrong / Long ALTER TABLE Lock** — a "small schema change" locks a 90GB table for 40 minutes at peak; the site is up but frozen. Deploys are threats.
- **Migration Corruption** — a customer move silently drops data, discovered days later by the customer and unrecoverable by then; the most reputation-destroying migration failure.
- **Config Drift** — server 7 was hand-fixed during an incident and never re-templated. Counter: config management, which itself risks a bad fleet-wide playbook breaking 40 boxes in nine seconds; add a per-machine Managed Coverage % since drift lives in the ~15% unmanaged. (+3 var)
- **Runaway Cron / Cron Storm** — everything scheduled at midnight self-DDoSes, or one job overlaps itself and multiplies. Counter: jitter (cheap, clever unlock), overlap locks, staggered scheduling. (+1 var)
- **Time-Bomb Cron** — a yearly logrotate/cleanup job written by someone who left in 2019 deletes something important.
- **The Backup Window That Moved** — DST shifts the schedule so the nightly backup saturates the storage array for four hours during business hours; the job succeeds, nothing alerts.
- **The Logging Loop** — a service logs an error, the log fills the disk, disk-full causes errors, which are logged. Self-amplifying spiral.
- **Redis maxmemory Eviction** — sessions shared a cache with the page cache, so cache pressure logs every user out mid-checkout and nothing alerts on it.
- **Replication Lag / Silent Replica Drift** — the replica has been subtly wrong for a month; you find out on promotion, and users who write-then-read see old data. Counter: checksum verification jobs, read-your-writes routing.
- **Split-Brain** — two primaries accept writes and data is unresolvable; reconciliation should be painful and permanent, some customers losing orders. Counter: quorum/witness nodes, fencing (STONITH).
- **Backup That Never Restored** — the job has reported success for 14 months while writing a 4KB file; discovered only at restore. Counter: restore drills with a visible confidence stat. (+6 var)
- **Monitoring Blind Spot** — the new service was never added to monitoring and has been down three days; customers assumed it was supposed to be like that.
- **The Monitoring Server Dies** — everything is green, forever. Counter: dead-man's-switch / external heartbeat.
- **The Alerting Path Dependency** — alert email routes through the dead mail server, paging is hosted in the failed region, the on-call phone has no signal in the DC. Counter: an out-of-band alerting path plus a periodic test proving it works.
- **Alert Fatigue** — response time to real alerts degrades as low-value alerts accumulate; thresholds too tight = noise, too loose = missed incidents. ⚔️ whether the game may hide the real alert — resolved to collapsing (`▸ 41 suppressed`) plus a visible Signal-to-Noise meter, never hiding. Adds an alert-authoring choice: symptom alerts are fewer and higher-signal but demand better downstream diagnostics. (+6 var)
- **The Alert That Fires Correctly And Means Nothing** — a threshold set for a smaller system fires daily, correct and useless; the counter is re-deriving the threshold from the current baseline, not tuning the alert.
- **The Ticket Avalanche / The Ticket Hydra** — tickets consume the staff who would fix the incident: the purest Attention damage. Modelled as severity × customers × communication quality, so a proactive status post cuts volume dramatically. Counter: status page, proactive comms, KB, deflection, support hiring. (+2 var)
- **Support Queue Collapse** — the terminal state: unanswered tickets convert directly into churn and public reviews, making support headcount a defensive purchase.
- **Fat-Finger** — high-risk actions under stress hit the wrong node. ⚔️ a hidden die roll punishes engagement; replaced with a visible confirmation step showing target name and blast radius (1.5s), which the player may disable — making it a speed-versus-care decision. (+1 var)
- **The Fix That Causes The Outage** — ~30% of remediation actions can make things worse, scaled by team fatigue and panic; pairs with the Second Incident rule and Staff Burnout.
- **The Reconciliation Loop That Won't Stop** — automation as a threat in its own right (see §2.17).
- **The Helpful Vendor** — a support tech remotely "fixes" something and breaks another thing.
- **Capacity Creep** — not an event but a trend: customer usage grows ~3% a week forever, quietly turning a comfortable board critical.
- **Capacity Misjudgment / Forecast Miss** — you sized for average and got peak, or ordered too late and the lead time exceeds your runway.
- **The Rate Limit You Set** — an old defense now blocks a legitimate growing customer. Systematised with a per-threshold fit indicator (green→amber→red as your profile drifts) and a cheap peacetime Tuning Review action.
- **fail2ban Self-DoS** — a NAT'd office of 200 users trips the threshold and the whole company is banned; the satisfying cheap defense that eats a customer.
- **Your Own Scanner Got You Blacklisted** — your vulnerability scan touches customer IPs and abuse complaints arrive at your upstream about *you*. Counter: scan windows, source-IP declaration, published policy, warning your upstream.
- **The Compliance Scan That Took You Down** — a mandated, contracted ASV scan fuzzes a code path nobody ran since 2016; the only attack you paid for, scheduled, and can't cancel without failing an audit. Counter: staging replica (fails scope), throttling (vendor must agree), or fix the service.
- **Staff Burnout** — an engineer on-call through three incidents makes more mistakes, slows, then quits with tribal knowledge; documented systems are unaffected, undocumented ones re-fog. Every 3am page raises fatigue.
- **Key Person Risk / Bus Factor 1** — one person knows how a system works; if they leave it becomes a mystery box, and while they're on vacation that subsystem's response times double and some repairs are unavailable.
- **Documentation Rot** — stale runbooks. ⚔️ per-document rot is a chore loop and harmful docs teach "don't write documentation"; fixed with a single Documentation Freshness stat decaying ~4%/month, refreshed by a doc day or by drills, where staleness costs *time* not correctness. (+1 var)
- **The Undocumented Dependency** — you decommission an "unused" server and three services die because it ran the internal DNS secondary; discoverable in advance by documentation spend, which is what makes documentation pay.
- **The Correlated Failure (meta-threat)** — two apparently independent things fail together through a shared PDU, firmware, expiry date, upstream, rack or human; the postmortem draws one bright white line through whatever they shared. Designated the game's signature learning moment. (+5 var)
- **Vendor EOL** — the product keeps working but stops receiving patches, its vulnerability rating rising until it's a liability, forcing continuous modernization spend.
- **The Demo That Matters** — a prospect tours during an incident; bad luck with a real revenue consequence, and one of the few reasons to want a *presentable* facility.
- **The Customer Who Lies** — they swear they didn't change anything; investigating costs time, believing them costs more. A recurring diagnostic tax.
- **The Uninterpretable Log Line** — a meaningless message present since 2011 that can never be fixed; its one job is as the control condition for red herrings, and once, late, it turns out to matter.
- **Honeypot Go-Wrong** — an unpatched honeypot occasionally walks out as a threat; even your deceptions can turn. (+1 var)

## 2.10 Business, financial, and reputational threats

*Damage is expressed in money and reputation, not HP.*

- **The SLA credit magnitude correction (read this before pricing any outage)** — real SLAs cap credits at one month's MRC, issue service credits not cash, require a claim most customers never file, so a 40-min outage on a $500/mo customer costs ~$25 or $0. ⚔️ the widely-quoted $1,900-credit chain vs reality; rewrite damage to lead with churn probability, QBR concession and review text.
- **Business threats must consume a hand** — every business threat arrives as an Inbox card with 2–3 responses, at least one costing a hand, so the ops and business layers finally compete for the same resource.
- **The Chargeback Swarm** — each dispute costs revenue plus a $15–25 fee plus a ratio tick; stolen-card signups surface months later. Counter: fraud scoring, 3-D Secure, prepay, manual review — plus a recognizable billing descriptor and working phone number, a $0 fix with real effect. (+6 var)
- **Processor Termination** — a boss trigger: all card revenue stops and you scramble to a high-risk processor at 2× the rate. ⚔️ the "1% for two months" trigger is wrong — networks threshold on dispute *ratio* (~0.9–1.0%) **and** absolute count (~100/mo), with a monitoring program, monthly fines and a remediation window rather than a cliff; and cutting marketing during a crisis makes the ratio worse.
- **Rolling Reserve Imposition** — the processor withholds 5–20% of settlements for 90–180 days after ratio drift or a growth spike that looks like fraud; revenue unchanged, cash down, and switching processors doesn't release it. Counter: ACH/wire, annual prepay, second acquirer, cash buffer, dispute-alert services. (+1 var)
- **Merchant Category Reclassification / Debanking** — one line of business reclassifies your whole entity as high-risk: rates 2.9%→4.5–6%, reserves appear, the bank eventually exits. Counter is structural — separate legal entities per risk class.
- **Involuntary Churn / The Expired Card Ghost** — 20–40% of real churn is expired cards and is 100% preventable; invisible without a Dunning Engine. 5–9% of card subs fail monthly; naive retries recover ~20%, smart retry timing 40–55%, account-updater services +10–20 points, and hard vs soft declines need different handling.
- **Bad Debt Creep / The Deadbeat Cohort** — customers who use and don't pay, aged 15/30/60/90 days; a suspension-policy slider trades bad debt against churn and bad reviews, and a Collections desk converts aged receivables to cash at a discount. (+2 var)
- **DSO Drift (Days Sales Outstanding)** — enterprise customers pay net-60 then net-90; the revenue chart looks great and the bank account doesn't. Counter: early-pay discounts, factoring, deposits. (+1 var)
- **Deferred-Revenue Sinkhole** — 500 annual plans sold and spent on servers leaves 11 months owed with no incoming cash; annual prepay also makes measured churn lie until the renewal cohort lands, which the Cohort View catches.
- **The Refund Wave / The Refund Cascade** — refunds spawn adjacent refunds unless intercepted by good incident communication; a 30-day guarantee turns a bad quality month into a cash bomb 30 days later. Death-spiral version: outage → credits → cash crunch → no fix → outage.
- **The Unbilled Upgrade** — an engineer doubles a customer's RAM during an incident and never files a billing change; eleven months later you backbill (dispute), bill forward (awkward), or eat it. Eating it should cost real money so the process fix feels earned.
- **Billing Failure → the Billing Run as a scheduled high-risk event** — the monthly run gets its own calendar slot and failure table like a deploy: partial (double-billing), silent (stale price), against stale usage data, or correct-but-generating-200-tickets from a template change.
- **Currency & Cross-Border Drag / Tax Nexus Creep / Tax Assessment** — a permanent 3–4% FX nibble, VAT/GST registration obligations as you expand, and a jurisdiction deciding retroactively that you're taxable. Arrive as letters, not monsters. (+1 var)
- **FX Collapse in a Priced Market** — local-currency pricing plus a 35% currency move cuts converted revenue by a third while USD costs don't move. Choices: reprice (churn), hedge (costly, needs volume), exit (write off CAC), eat it. (+1 var)
- **The Reddit Thread / The Viral Post / The Review Bomb** — cuts signup-lane throughput 20–60% for N days, scaling with brand visibility; responding well converts a 1-star to a 4-star at labour cost, responding badly goes viral. The Streisand trap (legal threats/DMCA) triples damage; a transparent postmortem is net *positive*. (+7 var)
- **Status Page Denial** — the status page is on your own infrastructure and dies with it, amplifying every outage's reputation damage. Counter: an off-network status page, a cheap buildable new players skip.
- **The Industry-Insider Drama Thread** — operator reputation is a separate, slow, sticky stat from consumer reputation and governs reseller/agency and colo acquisition, which travel by sysadmin word of mouth.
- **The Astroturf Temptation** — $2,000 buys 200 five-star reviews and it works, until detection floors your reputation permanently. ⚔️ a choice labelled as a trap isn't a choice — make detection a function of volume and pace so a slow buy is nearly undetectable, and make the benefit real.
- **The Core Update (search algorithm apocalypse)** — an algorithm change halves your organic spawn rate overnight with no ticket to open; recovery is 3–9 months if ever. Teaches that a channel built over a year is removable by a third party in a day. Counter: channel diversification, brand/direct traffic, an owned email list.
- **Comparison Site Delisting** — an aggregator drops or demotes you; silent, gradual demand decay, hard to attribute. Counter: content/SEO buildables or paying for placement.
- **Brand Confusion Attack** — a competitor buys ads on your brand name; cheap to counter by buying your own terms, expensive to ignore, with a retaliation ladder ending in a trademark complaint.
- **The Affiliate Betrayal, the Clawback Wave, and the Coupon Hijack** — three failure modes of one channel: your top affiliate defects to a 200%-commission rival; commissions reverse on refunds within 45–90 days; coupon sites take last-click credit for customers you already had at $110 CPA. Both latter two are invisible without attribution tooling.
- **The Platform Partner Pivot / Channel Conflict** — your distribution channel becomes your competitor as a slow debuff: lead flow −15%/month for six months, marketplace position drifting down, their agents recommending their own product. No combat counter, only earlier diversification.
- **Referral Partner Defection** — the web agency that sent you 40% of your customers switches for a better rev-share.
- **The Reseller Who Was Actually A Competitor** — they built their book on your platform and migrate all of it away at once.
- **The Influencer Complaint** — a customer with 200k followers has a bad support experience; you can manually intervene on one ticket per wave (the "CEO reply"), enormously effective and unscalable — exactly why founders burn out.
- **Uptime-Monitor Public Shaming** — third-party monitors publish your uptime as a persistent reputational HUD element you cannot edit.
- **The Ex-Employee Post** — a burned-out staffer writes publicly about working for you; damages *hiring*, so your next engineer costs 20% more and takes twice as long to find.
- **Founder's Tweet** — an optional self-inflicted reputation swing in either direction; the only threat the player fires themselves.
- **The Support Vampire** — a $4–5/mo customer filing 11–40 tickets a month of questions that aren't your job; negative gross margin personified, visible only with cost-to-serve tracking. Counter: KB deflection, scope policy, a Professional Services upsell, firing them — but the structurally right fix is plan-level support entitlements, since unlimited support on a $5 plan is a pricing error.
- **The Hoarder / The Resource Hog / The Noisy Neighbor** — one tenant at 40× fair share degrading 200 others invisibly until they churn. Counter: quotas/cgroups/LVE policy, which makes them churn angrily and worsens your spec sheet; the profitable resolution is a polite upsell to VPS. (+1 var)
- **The Concentration Risk Whale** — one customer at 30% of revenue who knows it; warning above 25% of MRR, scored penalty above 35%, and above 50% a renewal-leverage mechanic demanding 8–15% discounts with a ~35% churn roll on refusal. Also introduces the unmodelled twin: *supplier* concentration, deserving its own donut. (+1 var)
- **The Departing Whale** — a 90-day notice from 30% of revenue; not instant damage but a countdown that reshapes every decision for the rest of the level.
- **The Key Customer's Acquisition** — your whale is bought and their new parent's global vendor agreement kills your contract at renewal; concentration risk materialising through nobody's fault.
- **The Insourcer** — an enterprise customer builds their own; unavoidable, only slowed by expansion upsells.
- **The Quiet Downgrade** — the customer shrinks rather than leaves: fewer servers, lower tier, cancelled add-on. Logo churn zero, revenue churn 30%, invisible on any dashboard counting customers instead of dollars.
- **The Migration Tourist** — signs up on a 90-day money-back promo, migrates in, uses 89 days, demands a refund and leaves; pure loss including onboarding labour.
- **The Compliance Tourist** — wants HIPAA guarantees on a $20 plan; consumes sales time, never buys. An attention drain in a revenue costume.
- **The Contract Lawyer** — an enterprise prospect whose redlines cost 30 hours of legal time before signing; a real acquisition cost that appears in no CAC calculation.
- **The Security Questionnaire Treadmill** — each prospect's 300-question questionnaire, pen-test request, portal registration and insurance certificate costs 8–20 senior engineering hours; answering doesn't close deals, not answering loses them. Counter: a Trust Center buildable that shortens the sales cycle by weeks.
- **The Audit Right** — an enterprise customer exercises their right-to-audit: three days of evidence, tours, logs and interviews consuming senior staff, with contractual remediation, and refusing is a breach.
- **The Most-Favoured-Nation Clause** — a clause you signed and forgot: discounting to win a new logo automatically and retroactively reprices your largest account. Counter: a Deal Desk buildable flagging clause interactions before signature.
- **The Overcommitted Salesperson** — your rep sold a feature you don't have, below cost, with a 100% uptime SLA; an internal threat spawner where everything downstream is a scheduled incident. (+1 var)
- **The Ransom Customer** — "six months free or I post the outage screenshots": pay, refuse, or publish first.
- **The Chargeback Artist / The Chargeback Gremlin** — buys, uses, disputes, repeats; costs money and processor standing, counterable only with verification friction that bounces good customers.
- **The Crypto Miner on a Free Trial** — pure COGS theft aimed at consumption billing and free tiers; the free tier is an acquisition channel and an attack surface simultaneously.
- **The Resold Reseller** — your reseller resells to resellers, so you don't know your end users and one is a phisher: abuse liability with no visibility.
- **The Reseller Who Oversells** — highest revenue and highest abuse rate, since their 300 unpatched sites are your abuse. The omitted upside: near-zero CAC and support cost, so a reseller trades support burden for abuse burden and concentration risk.
- **The Ghost Tenant (colo)** — a tenant stops paying but their gear stays racked drawing your power, and in some jurisdictions you legally cannot unplug it; a slow bleed plus a lien process.
- **The Price War / The Copycat** — a competitor drops shared to $0.99 and your conversion halves; undercutting starts a prisoner's dilemma with the AI. Four responses: match (margin death), differentiate, segment up, or launch a fighter brand — matching the price without repricing your base.
- **The Hyperscaler Free Tier / Cloud Giant Price Cut** — "free forever" at your entry tier erases your beginner funnel or puts your commodity tier underwater. Counter: be the place people go when free stops being free.
- **The Acquisition Predator / The Roll-Up Acquirer** — buys your three biggest competitors, then your biggest supplier, then offers an insulting multiple and poaches your staff. Makes the market hard *before* making the offer.
- **The Poison-Pill Customer** — a buyer's diligence flags one customer (bulletproof holdover, sanctioned jurisdiction, unlimited liability, 34% of revenue) and the deal is conditional on removing them; firing takes 90 days you may not have.
- **The Earnout Dispute** — retained-revenue definitions (downgrades, product moves, buyer-caused churn) give both parties incentive to read the same events differently, poisoning the relationship. A late-campaign narrative threat with no combat.
- **The Vendor Squeeze** — control panel, virtualization or backup vendor raises prices 200–400% at renewal, hitting every account retroactively; the increase is typically *structural* (per-server becomes per-account, punishing dense cheap plans) and priced to your switching cost. Counter: open-source migration, repricing, eating it, or making the licence a visible paid add-on. (+2 var)
- **The Landlord's Lender** — your colo provider or landlord defaults into receivership; nothing breaks at first, then capital projects stop, the chiller isn't replaced, remote hands are cut, and renewal reprices at market. No operational control, no counterparty who cares.
- **The Upstream Bankruptcy** — your transit provider or colo landlord goes under and you have 30 days to relocate. The single most expensive event in the game.
- **The Acquisition of Your Landlord** — new owner, new rates, new rules.
- **The Talent Raid** — a competitor offers your best engineer +40%; losing them costs MTTR on every future incident plus tribal knowledge, and they may take your account manager's relationships too.
- **Employee Misclassification / Contractor Audit** — night-shift remote hands, offshore pod and part-time support get reclassified as employees: back payroll taxes, penalties, and a permanent cost increase on a line you had optimized.
- **The Word "Unlimited"** — an "unlimited" plan becomes a consumer-protection complaint, class-action letter or advertising ruling; also triggered by auto-renewal laws requiring a one-click cancel you never built. Counter: a fair-use policy, visible cancel flow and honest packaging — all lowering conversion the day you ship them.
- **SLA Credit Claim (and the clause that actually bites)** — the credit is small; the real weapon is the enterprise termination right, where three breaches in a rolling 12 months lets them exit penalty-free, converting availability into a revenue cliff. (+2 var)
- **Regulatory Fine / Compliance Lapse** — disclosure speed becomes a decision (fast = small fine + reputation hit now; slow = huge fine if caught), and a lapsed certification is a cliff because regulated customers are contractually required to leave.
- **Licensing Audit** — a vendor finds you over your licence count; a pure cash hit that cannot be attacked, only prepared for.
- **Compliance Audit / Law Enforcement Request / Seizure** — a subpoena or seizure takes a whole shared server as evidence, downing 200 innocent customers and generating collateral churn. Counter: isolation architecture — a technical build decision made long beforehand answers a legal threat. (+12 var)
- **The Plaintiff's Lawyer** — arrives after a breach; damage denominated in legal-defence cash and in executive hours. A long timer and a large number. (+7 var)
- **Angry Customer Escalation** — ticket → phone call → public post → chargeback → lawsuit, each stage more expensive, with intervention possible at any stage at rising cost.
- **The 1-Star Review** — one customer's 4-minute blip measurably reduces new signups for 30 days. Counter: status page, proactive comms, postmortem — transparency actually raises trust and the game should model that.
- **The Disgruntled Ex-Customer** — left angrily but still holds API keys, still points DNS at you and still costs bandwidth; knows your architecture and posts everywhere.
- **The Investor Who Changed Their Mind** — a committed round, term sheet or credit facility is withdrawn or repriced after you had been spending against it.
- **Vendor Financing Recall** — your hardware vendor tightens credit terms and you now need cash up front.
- **The Reference Call** — a prospect calls your existing customers and hears how you handled their worst days months ago; a sales outcome determined by past operational behaviour with no visible mechanism, revealed once, late.
- **Ambulance Chasers** — post-incident swarm filing complaints, demanding SLA credits and scraping your status page, arriving when your attention is already exhausted. An attention tax on top of a bad moment.
- **The Founder's Bad Week** — illness, family emergency or a move removes the player's own Executive Attention; everything delegated works, everything you personally did doesn't. Converts bus factor into an experience.
- **Health and Safety** — lone 3am work, arc-flash on a live panel, a rack tipping, a lifting injury; safety as a policy buildable costing speed, with an incident halting all physical work for days plus an investigation.
- **Angry-Customer Ghosts (churn weaponized)** — churned customers return as poachers walking your path and raising live customers' bounce chance; retention loss becomes enemy support. (+8 var)
- **Bad-Press Flood / The Front Page** — a floating PRESS balloon casts an approaching shadow telegraphing where and roughly when the customer flood lands, shadow size = spike magnitude. (+2 var)
- **Price-Hike Revolt** — raising list prices churns sensitive segments; not raising during inflation squeezes margin. Tactics: grandfather existing customers, raise only new signups, or annual lock-in. Overreach spawns a "cancel batch" event walking your customer lane.
- **Bill-Shock Boomerang (the "gotcha" bill)** — a metered customer silently blows a cap, gets a $90K invoice, refuses to pay, posts it and churns: AR write-off + reputation + precedent at once. Counter: usage alerts, soft vs hard caps, overage grace, a bill-shock refund provision.
- **Rented-Channel Collapse** — Google/Meta freeze your ad account for "high-risk industry" and the PPC tower zeroes overnight, leaving only owned channels; companions are the ±70% SEO Core Update swing and affiliate cookie-stuffing / referral-abuse channel fraud. (+2 var)
- **The Zombie-Account Escheat Scandal** — dormant prepaid balances are pure breakage margin until a journalist and a regulator demand unclaimed-funds remittance; the choice is to donate the ghosts' balances instead.

## 2.11 Attacker archetypes (the "who")

*Each archetype is a behaviour policy shown on a border Threat Gantry with a portrait, spawn animation, unit colour trim and Grudge pip row.*

- **Bots / Scanner Bots / The Opportunist Scanner** — autonomous, relentless, never targeted; they scale with your visibility rather than your wealth and exist to make "zero alerts" impossible. The CVE-spray variant is harmless until you have an unpatched thing, then instantly lethal.
- **Script Kiddie** — fires one known exploit at whatever is most visible, gives up after ~three failures, but on success comes back with friends and tags your network on a list, permanently raising spawn rates. High frequency, low damage, high ticket noise; defacement costs reputation far more than money. (+9 var)
- **Script-Kiddie movement speed — *CONFLICTING*** — three positions on the tier-1 chaff unit's locomotion. ⚔️ slow tutorial walkers (a *reading* exercise) vs fast numerous chaff (a *throughput* and free-kill-economy exercise) vs master's jittery-erratic middle that leaves speed unspecified; this decides what the tutorial teaches.
- **The Grinder (Credential Stuffer)** — slow, relentless, tries lists forever and cannot be killed, only made unprofitable. The archetype the Attacker Budget system exists for: "Grinder: spent 41 hours, netted 0 accounts. Left."
- **Booter Kid** — buys 90 seconds of a large botnet because one of your customers beat them in a video game.
- **Botnet Herder / Botnet Operator** — spawns units from many map edges at once via leashes to compromised consumer devices; the herder is unkillable, you only cut leashes to thin the swarm. They rent capacity out, so the same botnet recurs across levels and can be fingerprinted into a permanent known-bad-ASN unlock.
- **Extortion Crew / The Extortionist** — demands ransom before attacking and escalates until paid, tracking whether you paid last time; payment is an instant cash loss plus a permanent "known payer" tag raising future extortion frequency. A negotiation decision, not a combat one. (+9 var)
- **The Griefer** — targets one of your customers rather than you; failing to defend that customer specifically churns them and generates a public post. Makes per-tenant defense something you must think about.
- **The Competitor (the game's rival AI)** — attacks your business, not your servers: watches your build, hits whatever you just removed or downgraded, and aims at your newest and biggest customers. Full legal arsenal includes SKU-surgical undercutting, brand-keyword buys, comparison pages, staff and account-manager poaching, ETF buyouts, community sponsorship, affiliate commission raises, and timing promotions to your renewal cohort. ⚔️ an invisible antagonist existing only in churn graphs won't register — resolved by giving them palette-swapped visible saboteurs and board-level state. (+9 var)
- **The Researcher / White Hat** — probes politely then emails a report: with a bug bounty or security contact they disclose responsibly and become an asset; threaten them and it becomes a reputation scar. Includes the beg-bounty variant (a "critical vulnerability" that is a missing HTTP header) as a recurring judgement call. (+3 var)
- **The Journalist / The Activist Blogger** — amplifies your worst moment of the quarter; the activist variant publishes your abuse-desk failures, and the damage scales with how *correct* they are, so it can only be prevented, never spun.
- **Spam Gang** — signs up as a customer, sends spam, and gets your IP ranges blacklisted, silently destroying your other customers' email deliverability. Counter: abuse team, signup KYC (lower conversion), outbound rate limits, sending segmentation.
- **Cryptominer Tenant** — a "customer" paying the minimum while consuming maximum CPU and power; profitable at first, catastrophic at scale.
- **The Booter Customer** — a customer who is also an attacker, paying you while attacking others; profitable and radioactive, and the cleanest statement of "your revenue is your enemy."
- **The Abusive Customer** — the paying source of your outbound spam, DDoS and copyright complaints; you must choose money or reputation, and they recur by name across levels so the choice compounds. (+12 var)
- **Nation-State / APT / The Quiet Ones** — wants presence, not money: sits dormant for minutes or a whole level, spreads quietly, targets data and your management plane. ⚔️ "if you never detect them you experience nothing" is an absence, not a design — rebuilt on weak signals (an absence in log volume, an egress contradiction, a third-party witness), any two sufficient. The tell is *flatness*: real logs are noisy, too-clean is the giveaway. Counter: IDS, log retention, egress filtering, segmentation, behavioural baselines — detection, never prevention. (+15 var)
- **Hacktivist Wave / Hacktivist Swarm** — triggered by accepting a customer whose politics attract attention; volume plus press, and the only threat generated entirely by the player's own business choices. (+5 var)
- **The Carder Ring** — uses your signup form to validate stolen cards, attacking your checkout rather than your servers and costing you processor standing.
- **The Disgruntled Ex-Customer** — left angrily but still holds API keys, still points DNS at you and still costs bandwidth (see §2.10).
- **The Abuse Desk of Another Provider** — not an attacker: they send complaints, and ignoring them escalates to your upstream. A threat whose entire attack surface is your inbox.
- **The Regulator** — arrives on a schedule with a deadline and a fine schedule, cannot be defeated, only prepared for; the joke is that your own defenses visibly acknowledge and stand down for them — the turnstile opens, the lattice switches off. (+13 var)
- **The Auditor** — a slow-moving "visitor" who walks your facility and converts findings into blocked revenue; shares a silhouette family with the Regulator and the Gavel so authority figures read as one visual class.
- **The Plaintiff's Attorney** — post-breach class action: a long timer and a large cash number (see §2.10).
- **The Bank** — your lender is an antagonist in exactly one way, covenants: a leverage ratio, minimum cash balance or debt-service coverage that turns an ordinary bad quarter into a default. The only antagonist whose weapon is a spreadsheet you signed.
- **The Market** — spawns macro events (GPU price crash, crypto crash, recession raising SMB churn everywhere, licensing repricing, component shortage); the antagonist of the business layer and the reason a well-run company can still lose.
- **Entropy (the unattributed director)** — not a person but a pressure, spawning hardware, power and environment events at a rate driven by fleet age, density and maintenance backlog.
- **Your Own Customers** — spawn tickets, misconfigurations, sudden traffic and abuse, and should cause roughly as much trouble as all the hackers combined.
- **Mother Nature** — hurricanes, heat domes, floods, wildfire smoke clogging filters, freezes, drought; regional, telegraphed by a weather system, and the entire argument for multi-region.
- **The Crawler Consortium (search engine bots)** — costs bandwidth like a scraper but *raises* your reputation, so blocking it visibly dims your SEO meter. ⚔️ the cyan-gold "both" colour fails colour-blind requirements — keep them cyan and make the ambiguity a dashed outline versus the Scraper Locust's dotted one.
- **The Quiet Professional** — the second attacker AI: where kiddies are loud and easily patterned, professionals arrive with three health bars (stealth, persistence, exfil speed) tuned differently, so defensive specialization matters.
- **Cybercrime-as-a-Service Cartel** — well-funded and adaptive; they read your build and upgrade their attack towers between waves to counter your counters. The anti-meta villain for late game.

## 2.12 Type-specific threats

*The threat mix is one of the six ruleset slots; these are the signature threats that make each hosting business feel like a different game.*

- **The pruning rule for this subsection** — a type-specific threat earns a full mechanical slot only if it changes the player's *verb*, not just the noun; the rest become Codex flavour attached to an existing threat. ⚔️ pruning versus the document's comprehensiveness goal — resolved: keep every entry written, prune only which get balance numbers.
- **The Population Effect (generalise the Empty Server Spiral)** — a positive-feedback curve with a floor below which it inverts, applied to game servers, forums, marketplaces, IX peering and the colo meet-me room. Shared strategic shape: get above the threshold fast or don't start.
- **Game hosting: The Grudge Booter** — an attack aimed at one player's session that collaterally kills the whole server. Counter: per-player IP obfuscation or a player-facing proxy, which costs latency — the thing you sell.
- **Game hosting: The Cheater / The Glitch Player** — lives inside the service and damages customer happiness rather than infrastructure; customers blame you. Counter: anti-cheat integrations you don't control, costing tick performance and occasionally banning innocents.
- **Game hosting: Mod Update Day** — a dependency you don't own updates and breaks 900 server instances simultaneously at a time chosen by someone else; the modding community is your best marketing and worst attack surface.
- **Game hosting: The Empty Server Spiral** — a server dipping below a population threshold empties and never recovers; a full server attracts players and an empty one repels them. Visitors affecting each other is unique to this type.
- **Game hosting: The Stream Sniper / Ghost Server** — fake servers in your public listing impersonating yours; pure reputation damage with no technical vector.
- **Game hosting: Competitor-Sponsored Attack** — a rival host booters your flagship server during a streamer's session; reputation and churn rather than cash, at the most visible possible moment, chosen by someone who knows your schedule.
- **Game hosting: Hype-Cycle Collapse** — a game's population peaks and collapses on a curve nobody controls; you built capacity at the peak and cash burned at the top is never recovered.
- **VoIP: Toll Fraud Night** — a brute-forced SIP extension dials premium-rate international numbers all weekend, producing a $60,000 carrier bill on Monday. Its tell is time of day. Counter: geo-dial restrictions, spend caps, anomaly detection, strong extension passwords, an SBC. (+1 var)
- **VoIP: Jitter Storms, Codec Mismatch, One-Way Audio** — degradations invisible to every uptime check; NAT/firewall misconfiguration makes RTP flow one direction so "they can hear me but I can't hear them" is a routing problem.
- **VoIP: SIP Scanner Chorus** — constant ambient registration attempts rendered as tiny cords repeatedly trying to seat and failing; audio-visual ambience as threat texture.
- **VoIP: The 911 Obligation** — emergency-calling obligations, address registration and the liability of getting them wrong; the one regulatory item in this business nobody argues about.
- **Email: The Snowshoe Spammer Customer** — 40 small accounts across your range spreading low-volume spam under every threshold; detecting it requires looking across accounts rather than at any one.
- **Email: The Customer Whose List Is Purchased** — a legitimate business with a bought marketing list whose complaint rate poisons your shared IP pool; the counter is onboarding hygiene checks that lose you the sale.
- **Email: The Silent Deprioritization** — a major mailbox provider throttles you with no bounce, notice or appeal and you hear it from customers. Counter: enrol in postmaster telemetry (a number nobody will explain) and segment sending by IP/domain for transactional vs bulk vs per-customer.
- **Email: Blocklist Cascade / Spamhaus SBL Listing** — one spammer listing drops deliverability and every customer complains at once; instant total email-product failure and delisting takes days. (+9 var)
- **Email: The Compromised Mailbox** — a customer's leaked password sends 200k messages before you notice. Counter: outbound rate limits, which anger bulk senders.
- **Email: Backscatter** — bounce messages from forged senders flood your queues.
- **Email: The Spam Cannon (presentation)** — a truck backing up to your mail gate dumping envelopes; filtering is a sorting machine and a false positive is a legitimate envelope shredded with a small guilty red pip.
- **DNS: Water Torture** — random-subdomain queries that cannot be cached and must be resolved, hammering the authoritative backend behind the cache. Counter: RRL plus NXDOMAIN synthesis / aggressive negative caching — whose cost is that a legitimately added subdomain waits for the negative cache to expire.
- **DNS: Reflection Conscription** — you become someone else's weapon and the victim's upstream starts blocking *you*. Counter: Response Rate Limiting.
- **DNS: The Fat-Finger Zone Push** — one bad zone file published globally in seconds; the registrar-hijack outcome with none of the villain. Counter: zone validation, staged publication, a survivable TTL.
- **DNS: NXDOMAIN Flood and Free-Tier COGS Leak** — resolution work for nothing, and a generous free tier costing query volume forever with no revenue; the DNS business's product is nearly free and its costs are not.
- **CDN: Cache Poisoning via Header** — an unkeyed header lets an attacker store a malicious response for everyone: one request, global impact, spreading to downstream caches. Purge is a bleach wave across the comb. (+3 var)
- **CDN: Purge Storm** — a customer purges everything and stampedes your origin; the CDN's self-inflicted-wound threat.
- **CDN: The 2% Hit Ratio Customer / The Un-cacheable Customer** — all-unique or dynamic content makes every request an origin fetch, so you pay bandwidth twice. A profitability threat with no alarm attached.
- **CDN: Peering Ratio Disputes and the 95th-Percentile Blowout** — a traffic-ratio imbalance turns a settlement-free peer into a paying relationship, and one flash crowd resets your 95th percentile for the month.
- **CDN: Regional PoP Loss and Hot-Object Imbalance** — one PoP dies and its traffic lands somewhere expensive, or one object is 60% of your requests and lives in the wrong place.
- **Object storage: Silent Corruption, The Public Bucket, Small File Apocalypse** — corruption consistent across all replicas that redundancy cannot save, a misconfigured public bucket leaking customer data, and a metadata layer dying under a million tiny objects. (+2 var)
- **Object storage: Erasure-Coding Math Failure** — two simultaneous disk failures during a rebuild; a probability you can actually compute and price, which is the point of the durability dial.
- **Egress Bill Shock** — a customer's content goes viral, your transit bill explodes, and they're on a flat plan: you lose money by succeeding. Object storage, CDN, file/video hosting.
- **Backup: The Missed Backup Window** — jobs don't fail loudly, they just don't finish, and you find out at restore time. Counter: window monitoring.
- **Backup: The Encryption Key Nobody Has** — perfect encrypted backups made unrecoverable because the key was on the dead server. Key escrow becomes a per-tier product decision: hold it (great support, breach and legal-request exposure), don't hold it (unrecoverable customers), or give it to them (they'll lose it).
- **Backup: The Restore That Doesn't** — the genre's ultimate boss (see §2.9, §4.3).
- **Backup: Restore Surge Cost** — a regional ransomware event means fifty customers restore at once against capacity sized for two; your product's busiest day is the day it's hardest to deliver.
- **Tape: The Unreadable Tape** — verified at write time, unreadable four years later at restore, when it's the only copy.
- **Tape: Library Jam / Robot Failure / Courier Loss** — the arm sticks and blocks every restore until a hand fixes it; the off-site variant is a courier losing a shipment or delivering it to the wrong vault — an SLA breach with no technical fix available to you.
- **GPU: Thermal Runaway and The Synchronized Ramp** — 400 GPUs starting a job in the same second is an electrical event, not a compute event, and it accidentally sets your demand charge for the next eleven months.
- **GPU: Driver Roulette** — a firmware/driver combination that works on 90% of your fleet.
- **GPU: Coolant Leak / Cooling-Loop Contamination** — water plus electricity. Counter: leak-detection cable, drip trays, a drain-and-isolate procedure, plus loop chemistry monitoring.
- **GPU: GPU Theft** — cards worth more than cars walk out, making physical security a real tower for the first time: cameras, mantraps, tamper-evident cabinets, asset tags, chain of custody — all slowing your own staff.
- **GPU: Hardware Back-Order** — capacity you cannot buy at any price, forcing scheduling and rationing instead of building.
- **GPU/HPC: Job Preemption Fallout** — you interrupted a 60-hour training run: the customer loses days, you owe credits, they churn loudly. Checkpointing is the counter and costs storage and throughput.
- **GPU/AI: Model Exfiltration** — a low-and-slow transfer out of a training cluster; the Nation-State visual grammar applied to a very expensive modern asset.
- **GPU: The Counterparty Default** — your anchor tenant, whose 3-year contract financed the hardware, runs out of funding in month 8, leaving you the cards, power contract and lease with no revenue in a market where everyone is subletting at once.
- **GPU: The Residual Value Cliff** — your depreciation schedule assumed a resale value; a generation launches or rental rates halve and the schedule was fiction. Depreciation plus debt with no incident to point at.
- **AI hosting: Prompt-Injected Tenant Workload** — a tenant's job starts making outbound requests it shouldn't, rendered as a friendly job crate sprouting a tentacle toward your internal network. Counter: egress filtering as a one-way gate. (+1 var)
- **HPC: The Slow Rank** — one node running 5% slow makes the whole parallel job run 5% slow, and finding it is a needle-in-haystack diagnostic. Counter: node health checks with auto-drain.
- **HPC: Interconnect Faults and Scheduler Starvation** — one bad interconnect port degrades collectives across the fabric; a scheduler policy starves small jobs behind one enormous reservation, churning the customers you could most easily have kept.
- **Crypto: Market Collapse** — your whole customer base leaves in one event, against the stranded power contract you signed to get them.
- **Crypto: Tenant Overdraw** — a tenant quietly plugs in more rigs than contracted; the tell is the amp-clamp readout creeping past its marked line while the rack looks fine. Reading meters instead of objects is the skill.
- **Crypto: Tenant Insolvency and Cheap-PSU Fire Risk** — a tenant goes under owing three months and leaves gear you can't legally remove; and lowest-bidder PSUs in a dense mining rack are a genuine fire risk.
- **Kubernetes: The Admission Webhook Deadlock** — a broken webhook blocks all deployments including the one that would fix the webhook. Self-locking failure.
- **Kubernetes: etcd Quorum Loss / Control Plane Outage** — workloads keep running but nothing can change, including failing over. A paralysis threat rather than a damage threat.
- **Kubernetes/PaaS: Multi-Tenancy Escape** — a customer breaks out of their container into yours; the signature platform-hosting catastrophe.
- **Kubernetes/PaaS: CI Stampedes, Secret Leakage, Free-Tier Mining** — a push spawns a thousand builds, a secret lands in a build log, the free tier becomes a mining farm; all three are unforecastable usage forcing over-provisioning.
- **Serverless: The Recursive Invocation Bill** — a function invokes itself and bills you $40,000 in nine minutes; Denial of Wallet in its purest form, spending your money without taking you down.
- **DBaaS: Replication Lag, Split Brain, Long-Query Starvation, Backup Locks** — one tenant's unindexed analytical query starves everyone's transactions, a backup lock blocks writes, and replication/split-brain become customer-visible correctness bugs.
- **Managed hosting: The Bad Plugin** — your customer installs something and it's your outage now.
- **Managed hosting: Scope Creep Support** — "managed" is a word customers define more generously than you do; every "can you just also…" is gross-margin erosion with no ticket category.
- **VPS / LowEnd: Public Benchmark Shaming and Oversell Exposure** — a community member publishes benchmarks of your contended node, or everyone's CPU steal time spikes at once and your oversell ratio becomes visible. Demand-lane closure with no technical outage.
- **Dedicated/bare metal: Hardware Failure + Truck Roll, and Utilization Below Breakeven** — every failure needs a physical hand and a drive, and an empty server costs exactly as much as a full one. Stranded capex is the quiet killer, not the outage.
- **Colo: The Tenant Who Overloads The Circuit** — someone else's gear trips a breaker feeding a third party: your building, their mistake, your reputation. You generally cannot cut a paying tenant's power, so the loop is detect → notify → bill the overage → negotiate an upgrade while carrying the breaker risk yourself.
- **Colo: The Blocked Hot Aisle** — a tenant leaves a pallet or cart in the containment and thermals drift for a week before anyone connects the dots; you can't touch their gear, so it's a diplomacy mechanic.
- **Colo: The Cable Spaghetti Tenant** — blocks airflow and degrades cooling for the whole row, and is untouchable.
- **Colo: Tenant Gone Rogue** — a tenant's rack emits hostile traffic from inside your building and your only option is pulling their port; the technician's 20+ second walk across the floor, cancellable, during which the attack continues, is the drama.
- **Colo: The Ambiguous Remote Hands Request** — "please reboot the server in rack 7" when rack 7 holds nine servers; a real, daily, expensive problem and a good minigame.
- **Colo: The Tenant Who Stops Paying / The Tenant Who Won't Leave** — their gear is in your building with legal steps before you can unrack it; or at lease end they hold over at the old rate, blocking space you already sold. The commercial equivalent of a stuck process.
- **Colo: The Carrier Exit** — a carrier leaves the building and tenants depending on them start looking elsewhere; your carrier list is a product feature.
- **Colo: Cross-Connect Errors and the Tenant's Own Fire** — a cross-connect patched to the wrong port downs a tenant you have no visibility into; a tenant's own gear fire is a liability, capacity and suppression-discharge event at once.
- **Wholesale / build-to-suit: Pre-Leasing Shortfall and Construction Overrun** — you financed a hall against leases you don't have yet, or the build runs long and the financing covenant, not the customer, punishes you.
- **Bulletproof: The Upstream Ultimatum / The Upstream Drop** — your transit provider terminates you and you re-home the entire network mid-level; the dead arc greys from *their* end, rendering attribution as direction.
- **Bulletproof: Payment Processor Termination / Registrar Seizure** — arriving from the commercial layer rather than the network: you can't collect money any more while costs continue.
- **Bulletproof: RIR Investigation** — your IP allocations are audited and hijacked or fraudulently obtained space is reclaimed; instant loss of sellable inventory, and uniquely *permanent* since allocation reputation doesn't wash off.
- **Bulletproof: The Abuse/Revenue Dial** — a slider from "vet everything" (low growth, low abuse) to "take all money" (high growth, escalating abuse ladder); each hosting type has a different optimum, and bulletproof's setting poisons every other line of business sharing the entity, ASN and processor.
- **Regulated: The Finding / The Regulator Visit** — unannounced; findings become mandatory builds with deadlines, and the auditor's final stamp is a green seal or a red one that ends the level.
- **Regulated: The Breach Notification Clock** — a legally mandated 72-hour timer that starts whether or not you understand what happened; you must disclose before you know.
- **Regulated: The Data Residency Violation** — a failover moved data across a border, so you survived the outage and broke the law doing it. A defense that is itself a violation.
- **Regulated: The Staff Clearance Lapse** — a background check expires and a staff member can no longer touch in-scope systems.
- **Regulated: Evidence Gaps and Access-Log Retention** — you did the right thing and cannot prove it; evidence-collection opex is a permanent line item and a failed audit costs a frozen enterprise pipeline.
- **Dial-up: The Line Hog, The Telco Outage, The Modem Card Death, The War-Dialer** — the always-on abuser holding a line 24/7, an unfixable telco outage, and finding one wrongly-blinking modem in a wall of 96 LEDs — made accessible by putting the bad blink off the global heartbeat so it can be found by rhythm.
- **Dial-up: The Busy Signal** — capacity failure rendered as churn, over the structural problem of flat pricing against metered cost; the clearest example of a business model that loses money by design at the margin.
- **Period: The Warez Kiddie on the Shell Box** — your shell server becomes a distribution hub.
- **Period: Netsplit and the Usenet Binary Flood** — the userlist tearing in two, and a binary group filling your spool overnight.
- **Satellite: Rain Fade and The Missed Pass** — the wedge closes and the data doesn't come; failure as an astronomical certainty. The non-attack problem is slot inventory waste — an unsold pass is gone forever, so yield collapse is the business risk.
- **Edge/MEC: The Site With No Remote Access** — a mall closet whose only network path is the thing that died; a four-hour high-cost truck roll teaches you to buy an out-of-band LTE modem per site. Add vandalism and backhaul cost.
- **IoT: Device Reconnect Storm** — millions of clients with zero backoff and no patching; their certificates also all expire on the same day because they were provisioned in one batch and cannot be updated without a connection they no longer have.
- **File hosting/video: The Copyright Bot Sweep** — a scanner-drone variant fingerprinting your stored content and stamping matches visibly on the offending object.
- **Video: Transcode Storm** — one 4K master upload spawns a visible explosion of sub-jobs saturating the farm; fan-out rendered as literal fan-out.
- **Video/streaming: The Event-Start Thundering Herd, Restream Piracy, and Buffering** — everyone joins in the same ten seconds, your content is rebroadcast free by someone else, and buffering (not downtime, not errors) is the churn mechanic.
- **Financial colo: Fairness Violations, Microburst Congestion, Clock-Sync Failure** — cable lengths must be equalised and a customer who measures will find out; microbursts are invisible to averaged graphs; and clock-sync failure is a *regulatory* event because timestamped trade records are the product.
- **Weather (satellite / remote edge / any facility)** — a storm takes a site offline and prevents physical access; heat waves raise cooling costs, winter is free cooling, so the level's colour grade carries an economic variable.
- **Autoresponder Apocalypse (mail loops)** — a vacation message meeting a delivery failure doubles: two emails become ten million in an hour, and tarpits make it worse. Counter: hop-count loop detection, vacation suppression, MTA edge rate limits — and if it escapes, the internet RBLs your range. (+1 var)
- **The Untouchable Job (maintenance hostage)** — one customer's 60-day training run makes a machine radioactive to your own maintenance: no kernel patch, firmware window, rack move or RDMA firewall change. Counter: checkpoint-interval discipline as a contract stat, progress-earned migration windows.

## 2.13 Threat behaviour rules and modifiers

- **Behaviour mix-ins (make familiar threats fresh)** — modifiers producing new encounters from existing assets: Low & Slow, Distributed, Encrypted, Adaptive, Timed (off-hours only), Piggyback (inside a legitimate spike), Mimic, and Persistent (regrows from a remnant, punishing half-fixes).
- **Mix-ins as visible, draftable affixes** — each level card shows 0–3 colour-coded affixes before you start, read like an ARPG affix row; accepting an extra affix is a reward multiplier you can opt into.
- **Each mix-in invalidates exactly one defense role** — Distributed beats per-IP Meter, Encrypted beats Classify, Low & Slow beats Detect thresholds, Adaptive beats static Deter, Timed beats staffed response, Piggyback beats blanket Absorb, Two-stage beats Hands. Published in the Codex so affix-reading becomes build-planning.
- **Hunters adapt (design law)** — block by IP and they rotate, by country and they use residential proxies, by UA and they copy Chrome's; each counter buys time, not permanence. Made visible by Adaptation Marks: three authored retrofit levels per family so you can see that they learned.
- **The Suspicious Uptick at 4am** — certain attacks always start at a given in-game hour because the operator's home country is asleep; the night grade desaturates everything except threats and alerts, so a magenta triangle at 4am is visually louder — correctly, since you have fewer hands.
- **The threat that is your own success** — an explicit category: cache stampede, retry storm, full table scan, client growth eating capacity, logged-in users bypassing cache, free-tier flood, TCP incast on scale-out, a viral customer's egress bill.
- **Threat pathing telegraph** — dashed magenta trajectories drawn a moment before units move. ⚔️ hundreds of dashed lines is noise at scale — resolved by drawing trajectories only above a cost threshold and one centroid line per swarm; the telegraph says *that*, never *what*.
- **Five telegraph grades** — (1) none/ambient, (2) a radar pip at 3s, (3) horizon glow plus hum drop at 8s, (4) camera pan plus composition bar at 15s, (5) a full Wave Telegraph with a named antagonist at 30s+. Assigning grades *is* the difficulty curve.
- **Breach Escalation Ladder** — the longer an intrusion persists undetected the higher-tier its payload becomes (recon → privilege → lateral → exfil), making time-to-detect a universal hidden score.
- **The Rumor (threat buff-carrier)** — a fast harmless-looking skitterer that touches other threats and inflates their size and speed; kill order matters because survivors multiply. Introduces wave priority targeting.
- **Graceful Degradation Bot (the anti-cascade)** — a friendly ambient unit unlocked with the auto-scaler lineage that visibly re-spreads load when you lose a node; its absence is what makes early-act node loss catastrophic.

## 2.14 Supply chain, logistics, and procurement threats

- **The DOA Rate** — 1–3% of new hardware is dead on arrival, discovered during install with a customer waiting. Counter: a burn-in bench and ordering spares as a percentage, so "order 20 servers" quietly means 21.
- **Counterfeit Components** — fake optics, remarked DIMMs, relabelled drives with falsified SMART, PSUs with no protection circuitry; symptoms are intermittent and unattributable, so the real damage is poisoning your trust in your own telemetry. Counter: authorised channels at 20–30% more, serial verification, vendor diversity.
- **The Hardware Broker** — the part hasn't been manufactured since 2016, so grey-market buying carries a quality roll: genuine used, refurbished, counterfeit, or an unknown-hours pull. Gives the hardware lottery an origin story.
- **The Wrong SKU** — you received 95% of the right thing: wrong rail kit, wrong power connector, a PCIe generation behind, a backplane that won't take your drives, a switch missing the licence. Delays a build a week and consumes hands on the phone.
- **The RMA Black Hole** — a failed part enters the vendor's process and doesn't return; replacement takes three weeks, arrives wrong, goes back, and you run degraded throughout. Counter: advance replacement, the cheapest insurance in the game.
- **The Freight Damage** — the box looks fine but the tilt-indicator sticker is red: install anyway (fast, risky) or refuse delivery (safe, three weeks lost). Noticing the sticker is the whole mechanic.
- **Allocation** — during a shortage vendors allocate rather than sell, based on relationship history and size; a threat whose counter was purchased two years earlier by not always buying from whoever was cheapest.
- **Lead-Time Inflation** — eight weeks becomes forty and growth stops dead because you cannot buy your way out of a capacity problem. Counter: forward buying (ties up cash), secondary-market gear (higher failure rate), or leasing.
- **Component Shortage** — 60-week lead times on transformers, switchgear, GPUs or memory; the facility long-poles are worse than the server ones and decide whether a build happens at all. (+1 var)
- **Component Recall** — a defective batch of drives, PSUs or DIMMs across your fleet; warranty covers the part, never the labour or the outage, and it is correlated-failure by definition with a paper trail.
- **The Distributor Credit Hold** — one late payment on your net-30 line puts you on credit hold: no shipments until cleared and future orders prepay. Your suppliers can strangle your growth faster than your customers can. Counter: vendor diversity, deposits, paying early, vendor-direct equipment financing.
- **Customs, Duties, and the Seized Shipment** — servers stuck six weeks over a wrong invoice value, a missing licensing declaration or an encryption-hardware permit, against committed install dates. Counter: a customs-broker buildable.
- **Currency / Import Tariff Shock** — hardware costs jump 20% mid-order.
- **The Expired Support Contract / The Warranty Cliff** — your 4-hour contract lapsed so the part takes five business days; the security version is a critical firmware advisory whose download sits behind an active-contract login you no longer have.
- **The Acquired Vendor** — the product you standardized on is bought: support collapses within two quarters, it enters maintenance mode, prices rise at renewal, your key feature is deprecated. Unlike EOL the product still exists and just quietly stopped being good.
- **The Acqui-Loss** — your backup vendor, billing platform, scrubber or control panel is bought by a competitor who now has your customer list, traffic patterns and renewal date. Nothing breaks; everything is uncomfortable.
- **Licensing Repricing / Licensing Change** — a per-account price explosion or a hypervisor moving to core-based subscriptions at 4×, instantly destroying the margin on your cheapest plans. Counter: open-source migration, repricing, or eating it.
- **The Vendor API Deprecation** — a provider retires an API version and your provisioning, billing sync or monitoring stops *silently*, after six months' notice in an email nobody read. Counter: a vendor advisory feed plus a dependency inventory nobody has.

## 2.15 Utility, environmental, and civic threats

*Arrives from outside your fence line; cannot be fought, only priced, contracted for, or moved away from.*

- **The Interconnection Queue** — you own the land, money and tenant, and the grid will connect you in four years. Counters: behind-the-meter generation, buying an already-energised site at a premium, or building elsewhere.
- **Demand Charge Ratchet / Demand Charge Shock** — billed on your worst fifteen minutes, and many tariffs ratchet that peak into a floor for eleven months, so one badly-timed load test or synchronized GPU ramp sets your bill for a year. Counter: peak shaving from battery/UPS, staggered scheduling, power capping, tariff renegotiation.
- **Grid Curtailment and Frequency Events** — under grid stress large consumers are curtailed; if you signed for cheaper interruptible power you must shed, and if you didn't you pay peak rates. A threat you opted into for a discount.
- **The Energy Hedge Goes Underwater** — you fixed power for 24 months and wholesale fell 40%, so a competitor signs at the new rate and undercuts you; the mirror is staying floating while prices double with no pass-through clause. The counter is a contract clause, not an operation.
- **Regional Power Price Spike** — margin evaporates with no technical failure; signature threat for GPU and mining levels where power is most of COGS, and alone enough to make a crypto level unprofitable overnight.
- **Water Restriction and the WUE Stat** — a seasonal cooling-cost multiplier in drought regions plus a local-news PR edge; introduces WUE beside PUE and gives evaporative cooling a civic cost.
- **The Neighbour's Construction** — vibration causing drive errors, dust in filters, a cut shared conduit, a crane over your roof, a piling rig through your fibre. Warned weeks ahead if you buy a Site Intelligence permit-notice subscription.
- **The Building Is Also An Office** — in mixed use you inherit fire alarms, elevator maintenance, dock rules and HVAC shutdown schedules; a floor-3 alarm shuts your air handling and you have zero leverage.
- **The Landlord's Other Tenant** — construction, a water feature, a shared fire system, dock use blocking yours every Tuesday: recurring unfixable negotiable-only friction from a party with no obligation to you.
- **Lightning and Bonding** — a nearby strike induces surges along copper runs leaving the building to a dish, tower or outbuilding. Counter: grounding and bonding, surge protection at every penetration, fibre across building boundaries.
- **Wildlife (extended)** — birds in outdoor condensers, wasps in cabinets, ants shorting a contactor, a cat in the raised floor, a snake in a generator enclosure, a bird strike on a microwave path, rodents in cable trays; each needs the precursor-state counterplay from §2.7.
- **Climate and Weather Events (regional modifiers)** — hurricane season, freezes, heat domes, drought restricting evaporative cooling, wildfire smoke, coastal salt air, chosen as *site modifiers at build time* rather than random events, making site selection strategic and multi-region a hedge.
- **Community Opposition** — a new build is protested over water use, noise, traffic, tax abatements and employment; the construction timer extends, answerable only with public-affairs spending and design concessions.
- **Seismic / Storm / Flood (regional)** — telegraphed by the map's weather system and the reason multi-region exists (see §2.8).
- **EMP / Solar Flare (endgame exotic)** — announced early, a rare global catastrophe across all facilities where a resilience score determines survival; unlocks Faraday/hardened buildables.

## 2.16 AI-era and modern threats

- **Generative Abuse at Scale** — fake signups with plausible companies, real-looking sites, coherent tickets and KYC documents that pass inspection; every quality heuristic dies in one event. The counter shifts from content to behaviour and provenance — payment history, device and network reputation, velocity — which the player won't have built.
- **Model Poisoning of Your Own Defences** — an adversary slowly trains your behavioural classifier to consider their pattern normal, or a legitimate pattern hostile so you block real customers; the tell is a false-positive rate drifting with no config change. Counter: holdout sets, drift monitoring, clean-baseline retraining.
- **The Agentic Customer** — a program with a credit card that provisions, scales and abandons resources at machine speed, retries aggressively, creates thousands of tiny resources and runs your free tier into the ground while being technically legitimate.
- **Prompt-Injected Support Automation** — a crafted ticket talks your Triage AI into misrouting, auto-approving or surfacing data it shouldn't; the counter is that automation may recommend but never act on anything privileged, halving the tool's value.
- **The AI Agent Incident** — your support agent deflects 35–50% of tickets, then confidently tells a customer to run a destructive command or leaks another customer's context: one screenshot, a viral thread, a permanent asterisk. Counter: scope limits, no write actions, human review above a confidence threshold, bot disclosure (which cuts deflection).
- **The Scraped Knowledge Base** — your docs are ingested and resurfaced by a third party, often wrong, so customers arrive having followed hallucinated instructions that broke their site. Support load rises for a problem you didn't cause and can't fix.
- **Deepfaked Authority** — a video call from your CFO's face requesting an emergency payment; the counter is process not perception (callback on a known number, out-of-band confirmation, a code phrase), and the game makes the perceptual tells deliberately unreliable.
- **AI Bubble Deflation *(era-gated)*** — GPU rental rates halve against a 3-year depreciation schedule that assumed they wouldn't; combines with Counterparty Default and the Residual Value Cliff into the full GPU-era failure chain.
- **AI Scraper Locusts (see §2.2)** — the modern distributed residential crawl problem, listed here too because it is era-defining.

## 2.17 Structural and systemic threats

*Emergent properties of your architecture or organisation; most cannot be stopped, only made visible.*

- **The Metastable Failure** — the only threat that persists after its cause is gone: load spike → retries → sustained overload that adding capacity doesn't clear. The exit is deliberate load shedding below a recovery threshold or a coordinated restart with admission control. Teaches backpressure.
- **Gray Failure** — the component is up, passing health checks, and wrong (3% loss on one path, stale reads, a LB member accepting then dropping). Detection requires *differential* observation comparing members against each other — a distinct capability, not more monitoring.
- **The Shared Fate You Bought (the Correlation Score)** — standardising on one vendor, image, control plane, region, processor or CDN converts many small independent risks into one large correlated one; tracked as a rising score, invisible until one event proves it.
- **The Reconciliation Loop That Won't Stop** — any desired-state enforcer fights you during an incident, un-fixing your manual fix ninety seconds later. The verb to learn is suspend the automation first, and the game should cost you twenty minutes exactly once.
- **The Cache That Became A Database** — data exists only in the cache by accumulation, not decision, so a flush or eviction loses it permanently with no backup because it was "just a cache." An Asset Discovery Scan should find it.
- **The Config That Is Also Code** — your change board reviews deploys but not DNS records, firewall rules, CDN settings, IAM policies, feature flags or a vendor-portal checkbox, which cause more outages than code; extending change control to config slows everything.
- **The Forgotten Environment** — a staging cluster with production data and no patching, a demo box with a public IP, a two-year-old PoC, a test account with admin rights; accrues vulnerability silently and is found by an attacker or auditor, never by you.
- **Abandoned / Shadow Infrastructure** — every temporary thing you build has a chance never to be cleaned up, accumulating automatically as a byproduct of play. Counter: asset inventory, discovery scans, and a decommission action that costs time and gives no visible reward, so players won't do it.
- **The Employee Who Automated Themselves Into Load-Bearing** — a script saving everyone an hour a day lives on one workstation under personal credentials and is now in the billing critical path, discovered when they take holiday. Choose to productionize it (costs hands) or keep benefiting (accepts risk).
- **The Staffing Dispute** — a dispute over on-call compensation, shifts or contractor pay becomes a work stoppage or mass resignation from the rota; triggered by your own accumulated morale, overtime and pay decisions. Collective, sudden, negotiable — a different lose path than burnout.
- **The Undocumented Dependency / The Correlated Failure** — cross-referenced from §2.9; these are the per-incident expressions of the Correlation Score.
- **Legacy Protocol Plagues** — TLS 1.0 customers who refuse to upgrade (compliance findings), a Windows-2008 box holding the last domain controller, IPv4-only tenants blocking your IPv6 migration; each must be negotiated away, not shot.
- **Race Condition Under Load** — fine at low volume, corrupting transactions once concurrency crosses a threshold, so it wakes as a side effect of success. Counter: locking/idempotency refactors and staged load testing, not raw capacity.

## 2.18 Storage, virtualization, and capacity failures

- **Thin Provisioning Cliff** — 400TB sold from a 200TB pool; at 100% writes don't slow, they *stop*, freezing every backed VM simultaneously with no degraded mode. Recovery needs capacity (lead time) or deletion (whose?). Counter: reservation policies, hard per-tenant caps, a 75% alert you will raise to 85% because it was noisy.
- **Snapshot Sprawl** — snapshots grow with the volume's *change rate*, so one on a busy database can exceed the database; invisible in capacity views, degrading writes, and consolidating a huge one stuns the VM — the cleanup is itself an outage. Created by prudence, forgotten, compounding.
- **The SSD Endurance Cliff** — identical write rates mean a cluster's drives hit write-endurance together on a date readable from SMART wear for three years; with telemetry it's a projected exhaustion date, without it five drives go read-only in one week. Counter: staggered replacement, mixed write loads, over-provisioning, buying in waves.
- **The Dying-But-Not-Dead Drive** — SMART-OK and answering every I/O in 800ms; arrays handle dead members gracefully and slow ones terribly because they wait, so one sick drive sets the array's latency. Found by per-device latency odd-one-out. Counter's own risk: ejecting a healthy device during a load spike.
- **CPU Ready Time (the metric that lives in a third place)** — the guest shows 20% idle, the host 40% idle, and the customer is still right: the VM is *ready and waiting for a physical core*, invisible from both. Caused by overcommit ratios and oversized VMs, and the perfect teaching mechanic for the overcommit slider.
- **Deleted But Open** — `df` says full, `du` says not: a process holds a descriptor for a rotated-and-deleted log, so the largest file on the disk doesn't exist. One correct move — a restart the player will be scared to perform.
- **The Filesystem That Slowed Down At 90%** — past the threshold where the allocator works hard; no alert fires because there's still space, while write latency, commit times and queues all climb. A best-in-class "nothing changed" incident.
- **Missing Capacity In The Least Obvious Place** — inode, PID, conntrack, ephemeral port and ARP table exhaustion plus file descriptor limits and a full `/var/log`; they share one property — the error message points somewhere else.
- **Backup Window Saturation** — the scheduling version of a capacity failure (see §2.9's Backup Window That Moved).

## 2.19 Identity, time, and trust failures

- **The Internal PKI Expiry** — mutual TLS, a cluster CA, device client certs, a Java keystore, or the ten-year internal CA root nobody remembers; long lifetimes, no monitoring, no browser warning, and every symptom looks like a network problem. The boss version is 40,000 batch-provisioned devices that can't be updated without the connection they've lost. Counter: a certificate inventory plus automated rotation, itself a new failure mode.
- **The OCSP Responder Outage** — your cert is valid but your CA's revocation service is down; browsers soft-fail while some enterprise clients, payment gateways and hardened configs hard-fail, so you work for 97% of visitors and are broken for a high-value 3%. Counter: OCSP stapling promoted from speed optimization to resilience purchase.
- **The GNSS/NTP Spoof — when all your clocks agree and are wrong** — your time source is confidently, uniformly incorrect: certs validate inexplicably, logs are unorderable against everyone else's, jobs fire wrong, distributed conflict resolution makes permanent wrong choices, and nothing alerts because there's no disagreement. Counter: multiple independent time sources of different kinds plus sanity comparison.
- **The HSTS Preload One-Way Door** — submitting to the browser preload list means every subdomain must be HTTPS forever, including the self-signed internal tool and the legacy endpoint; removal takes months and ships with browser releases.
- **The TLS Deprecation Cutoff** — correctly disabling TLS 1.0/1.1 makes a measurable slice of traffic vanish: old Android, POS terminals, a Java 6 integration, an embedded fleet, a gateway callback. The failure is on someone else's equipment; the choice is compliance versus a named list of accounts.

## 2.20 Abuse-desk and legal-pressure threats

*Cost money in three directions at once — staff time, upstream standing, legal exposure.*

- **The Upstream Abuse Escalation Ladder** — warning → filtered → null-routed, advancing with every unhandled complaint and holding with every handled one; because it's drawn, ignoring the abuse desk becomes an explicit bet rather than an oversight.
- **DMCA Flood / Abuse Complaint Stack** — volume-based staff cost; ignoring loses safe harbour and gets you null-routed, over-enforcing nukes innocent customers and goes viral. Requires an Abuse Desk with an aggressive/balanced/permissive policy dial trading legal risk against customer trust.
- **Phishing Site on Your Network / The Phishing Tenant** — a bank phishing kit on your IP brings fast escalation and browsers flagging *neighbouring* sites; a Safe-Browsing listing is the damage and delisting takes days. Counter: content scanning at signup, a fast takedown SLA.
- **The DDoS-for-Hire Tenant** — a VPS customer originates attacks from your network and your upstream threatens termination; the customer is paying you and destroying you simultaneously.
- **IP Reputation Blacklist** — one customer gets your whole netblock listed and all email plus some traffic degrades. Counter: cleanliness, subnet segregation, and a second block bought for a benefit that only ever appears as an absence.
- **CSAM Report** — mandatory, non-negotiable, immediate action; the one threat with no ignore option and where cost minimization is not an available strategy. Failure terminates the level, and the design's job is restraint.
- **Sanctions Screening Failure** — you signed up a sanctioned entity: fines, and more damagingly your bank gets interested in you, routing into the debanking chain. (+1 var)
- **RIR Investigation** — your IP allocations are audited (see §2.12 bulletproof).
- **Law Enforcement Seizure** — a rack is taken including other customers' data on the same host (see §2.10).
- **Compliance Sweep** — the non-dramatic twin of the seizure: a scheduled review converting a policy gap into a deadline, where nobody is accused of anything and you still lose two engineers for a week.

## 2.21 Cost attacks (denial of wallet)

*The only class where the player's instinct — tank it, serve everyone — is actively wrong.*

- **The Cost Attack (category rules)** — never reduces availability: no red on the board, no alert without a cost anomaly monitor, and damage landing on the next invoice after the level's climax. Every counter sits in the Meter role (spend caps, quotas, egress caps, concurrency caps, percentile shaping) and every one caps your own upside too.
- **Members of the family** — Bandwidth Bill Bomb, Egress Bill Shock, Toll Fraud Night, the Recursive Invocation Bill, 95th-percentile overage, SLA credit accrual, free-trial and free-tier mining, the Agentic Customer, the Un-cacheable Customer, Demand Charge Ratchet, and the Leaked Key whose first symptom is a bill.
- **The Taxi Meter (shared widget)** — any threat costing money per second attaches a mechanical clicking fare meter to the *object* incurring the cost, never the HUD; several can run at once and they are horrible to look at, which is the point.
- **The Cost Anomaly Monitor (the missing Detect tower)** — a purchasable Detect building whose only output is "this line item is rising faster than its baseline"; boring, no combat feedback, and the only thing converting a Cost Attack from post-hoc punishment into a fightable event.

## 2.22 HUD attacks: threats against your information

- **The family and its fairness contract** — a HUD attack must always be detectable by cross-checking two sources you own, and the Pulse Strip and Site Preview Window are never lied to; without that contract the family is indistinguishable from a bug.
- **Metric Poisoning** — spam inflates traffic numbers or a broken exporter zeroes a counter, so you build from a false picture; the tell is a second source disagreeing — analytics vs server logs, billing vs metering, graph vs preview window.
- **The Dead Sensor / The Monitoring Server Dies** — monitoring dies and everything is green forever. Counter: dead-man's switch, external heartbeat, out-of-band alerting path.
- **Alert Flooding** — a deliberate noise generator burying a real alert; the attacker-driven version of Alert Fatigue and the purest Attention damage in the game, always paired with a second vector.
- **The Wrong Green** — a health check that checks the wrong thing after a config change: it passes, the service is broken, and the check is technically correct. Commonest real form is a 200 while the database behind it is dead.
- **Log Tampering** — the trail is edited after a breach and only immutable logging survives; it is also the APT's signature tell, since log *volume* drops slightly when something is trimming.
- **Referrer / SEO Spam Ghosts** — pollute your analytics so your own dashboards lie; the ambient-weather member of the family (see §2.2).
- **The Telemetry Resolution Trap** — a HUD attack with no attacker: the HUD is wrong by construction because your sampling interval decides what is true, and the counter is a purchase that changes what the HUD can show.

## 2.23 Overcorrection: threats that punish paranoia

*P1 is the central pillar and it deserves a predator; nothing else hunts an over-tuned build.*

- **The Competitor's "No Robots" Campaign** — a rival advertises no CAPTCHAs and no checks, so every point of your Friction stat converts a share of your bounced good traffic into *their* signups. Your false-positive rate becomes their acquisition channel.
- **The Legitimate Burst You Blocked** — a real customer's real launch trips your thresholds, producing a support escalation, an SLA claim and a public post while your monitoring shows the attack was successfully blocked. The Fit Indicator would have caught it.
- **The Accessibility Complaint** — bot detection blocks screen readers and old clients: a slow reputational bleed with a legal tail, and the only threat auditing the *quality* of your Classify buildings rather than their quantity.
- **The Support Tax** — friction generates roughly 0.8 tickets per 100 false positives, so an over-tuned WAF eats hands directly, coupling paranoia to the Attention economy rather than only to revenue.
- **fail2ban Self-DoS and the Rate Limit You Set** — cross-referenced from §2.9; both are overcorrection threats that arrive on a delay.
- **Model Poisoning of Your Own Defences** — cross-referenced from §2.16: the version where overcorrection is induced by an adversary rather than chosen, with a false-positive rate drifting with no config change.
- **The Mound of the Stopped (the family's instrument)** — blocked units accumulate as a visible drift at the base of the defense that stopped them, magenta for correctly blocked and amber for false positives; an amber-heavy drift under your WAF is the most damning image the game can show.
- **The Suspension Bot Misfire** — your own dunning automation clips a whale mid-quarter over a $2 rounding error or a net-60 PO in process, triggering SLA clocks, executive email and poaching vultures. Counter: a human-approval lane on suspensions, at the cost of slower cash hygiene.

## 2.24 Threat economy, wave composition, and generator systems

- **The two pressure budgets** — the attack budget follows the level's sawtooth while the entropy budget peaks in its troughs as estate age × size × (1 − maintenance spend); two dials deliberately out of phase so no quiet minute is also idle.
- **The active-family pool cap** — 8–10 threat families per level, drawn from your unlocked pool by the level's ruleset card.
- **Mastery demotion and retirement** — countered threats become weather and removed buildables retire their threats with a lag; with the pool cap these keep a fifty-buildable late game readable and make deleting infrastructure a defensive move.
- **The Copycat reserve** — 10–15% of each level's pressure budget drawn from your personal miss list of the previous two levels.
- **Affixes as a reward multiplier** — accepting extra mix-ins on a level card raises the payout.
- **The Two-Front requirement for hard waves** — every hard wave draws from two of {bandwidth, concurrency, hands, cash, reputation, data integrity}.
- **The denomination quota** — no more than four threats per level may share a damage denomination.
- **The Second Incident multiplier** — 1.8× during an incident and 2.5× during a recovery, stated openly in the Codex so it never reads as cheating.
- **The Feint budget** — at most one feint per level, never two levels in a row, always named in the postmortem.
- **Grudge as a difficulty input** — per-archetype 0–5, visible on the Gantry, raised by loud or humiliating wins.
- **Attacker budgets as a win condition** — cost exceeding return for three consecutive attempts and the archetype leaves the level.
- **The Wave Composition Bar** — three segments above the incoming edge: solid glyphs with counts, filled silhouettes without, then a single `?` in a dashed box; better monitoring shifts the boundary right as a permanent felt UI upgrade.
- **The Threat Mass Bar** — aggregate inbound bad traffic as stacked coloured segments in the top chrome; the one place a 40 Gbps flood and a single SQL injection can be compared.
- **The Pressure Gradient (ambient attack baseline)** — a screen-space gradient from the inbound edge whose *reach* rather than opacity encodes baseline attack pressure, tinting only the substrate and never obscuring. Ambient difficulty as measurable distance.
- **Compound-wave authoring** — a small DDoS plus a disk failure plus an angry customer call, timed so attention is the scarce resource. (+2 var)
- **Threat Intelligence Feed (purchasable early warning)** — upcoming waves appear in a news ticker with 60–90s lead time, so you buy intel and build the counter; interlocks with economy, research and the booter's escalating-purchase preview panel.
- **Kill-Chain Assembly (wave design language)** — waves arrive as visible teams (Scanner tags the DB → Brute finds its door → Webshell walks in → Ransomware follows), with a chain UI drawn in real time; breaking any link dissolves the whole combo, making priority targeting a readable skill.

## 2.25 Boss design and campaign-scale threats

- **Boss design specification (three phases, each invalidating one defense)** — every chapter boss follows one three-phase grammar and is announced two levels ahead in the trade-press ticker, so preparation is possible and reading the world is rewarded. (+4 var)
- **The named campaign antagonists** — the Competitor (four visible stats and a stated strategy), the Nation-State (multi-level, losable without losing a level), the Roll-Up Acquirer (buys the market over chapters before offering), and the Market (business-layer weather). None can be killed; all can be priced, prepared for or out-manoeuvred.
- **Ransomware on your own management plane (the campaign boss)** — untested backups mean game over; the clearest justification for twenty levels of spending on something with no visible benefit, and a *detection* fight rather than a recovery fight thanks to dwell time and double extortion. (+1 var)
- **The Zero-Day Drop as a shared global event** — every player hit on the same night, with response speed as the sole differentiator.
- **The Refund Cascade death spiral** — outage → SLA credits → cash crunch → the crunch prevents the fix → another outage; the business layer's boss shape is not a fight but a trajectory the player can see coming and fight out of.

## 2.26 Threat presentation language (the visual grammar of §2)

- **The Silhouette Rule** — every threat must be identifiable as a black silhouette at 24×24px, tested on a Silhouette Sheet *against every other threat in its band*; the comparison is the test, not the asset.
- **The threat visual contract, five channels** — silhouette, colour, motion, lane texture, and the usually-omitted fifth: scale. (+5 var)
- **The Threat Scale Law** — rendered size is proportional to what a threat will *cost* you, not to packet volume: a tiny $60,000 toll-fraud cord renders large, an absorbed 50Gbps flood renders visibly thin. Size means money, which stops mis-triage by spectacle.
- **The Wind-Up Frame** — every damaging threat plays a three-frame telegraph: gather (shrink and darken), strike (stretch toward target), recover. Damage never happens without a visible wind-up, which is what makes reactive play fair.
- **Motion as behaviour — the seven motion primitives** — volumetric = advance, slow-drip = hold, scanner = sweep, swarm = boil, mimic = match (zero cadence offset), insider = walk (the only ground gait), ransomware = crystallize, siege = no motion at all. Seven primitives cover the whole bestiary.
- **Approach Lanes** — magenta hot lanes on the Signal layer where thickness = volume, saturation = severity and texture (dotted/solid/braided) = type; at Tier 4–5 you often see only lanes and that is still enough to play.
- **The Off-Board Register** — threats that never enter the board (BGP hijack, registrar hijack, DNS poisoning, blocklisting, null-route, processor termination, silent deprioritization, regulatory action) render on the *screen frame*: a magenta bar eating leftward, a stained bottom edge, a lock glyph, greyed money-column chrome. Deliberately outside the Three-Layer Rule — the call is coming from outside the house.
- **The Attribution Direction Law** — every failed link animates its grey *from the end that caused it*: your port, their router, a spark at the midpoint cut, or the meet-me room panel for a billing dispute. Direction of failure is free information no game uses.
- **The Threat Despawn Vocabulary** — seven exits whose difference is the diagnosis: blocked (recoils intact, will retry), dropped (stops rendering mid-stride, no particle — a null-route, whose silence is the tell), filtered (grey ash), tarpitted (sinks and stays), expired (fades having found nothing), diverted (walks eagerly to the honeypot), neutralized (domed as a Codex specimen).
- **The Miss (the fourth attack-landing outcome)** — beyond blocked/damaged/breach: a threat reaches its target and finds nothing (a scanner with no open port, SQLi with no DB). The absence of feedback is the feedback, and the only way the player learns surface reduction works.
- **Damage States, three stages plus one** — clean / scuffed / broken plus a catastrophic "smoking" state, so you can walk a row and read its history.
- **The Entropy Eruption Grammar** — entropy never has a creature and never has magenta; it uses a shared *spall* language where a hairline crack propagates over 2–8 seconds on the object's own faceplate and the failure emerges through it. The read: damage coming *from* the object, not at it.
- **The Paper Family (business and legal threats)** — the whole §2.10 family shares one material: a fluttering receipt, a manila envelope with red string, a sealed cream sheet, a briefcase, a thudding tariff letter, a carbon-copy form, an endlessly printing spreadsheet. Unhandled paper stacks on the desk, then the floor, then blocks the door — the doom clock made physical.
- **The Broadcast Family (reputation threats)** — signage and screens rather than creatures or paper: a billboard truck, a star rating clicking down, a headline crawl, a forum thread as a wall poster visitors stop to read, a sky-darkening flock calmed only by a status-page beacon. Positioned outside your perimeter facing inward.
- **The Human Family (credential, insider, physical)** — drawn from your own staff art re-lit, casting a visible shadow when nothing else does; the badge is the tell (inverted, visitor-in-staff-zone, expired, two on one swipe) and they always move at walking pace.
- **The Camera Cone Gap** — camera coverage drawn as pale floor cones with gaps as literal dark polygons that the Insider, Tailgater and Evil Maid path through, making their route predictable, discoverable and fixable by buying one more camera.
- **The Designator** — a thin magenta reticle with a triangulation animation locks onto a specific tenant *before* the attack lands, plus a tenant-coloured tag; this is what makes the null-route-your-own-customer decision playable.
- **The Poisoned Tint** — wrong-but-serving content carries a faint off-register tint, one channel shifted like bad print registration, that propagates downstream with the data. The grammar of "this is working and it is wrong."
- **The Silent Threat Strip (the Hum Bar notch)** — a live room-tone strip where a silent threat cuts a visible notch in the noise floor; rendering silence as a hole is the only way deaf players get the mimic's best tell, and it also catches the APT's variance flattening.
- **The Correlated Failure White Line** — the game's signature learning moment, specified in §2.9; belongs to both places and should be built first.
- **The Zero-Day Sky** — on a disclosure event the facility's outdoor light washes sodium-orange across every level simultaneously, the trade-press ticker scrolls, and patch-lag pips light up. Nothing on the board changed and the room feels different.
- **The Turned-Away Map** — for blocklisting, deliverability collapse and geo-blocking, destinations refusing you rotate their arrival arcs away and curl them back; a map of curled arcs reads instantly as the world declining to talk to you, with only *some* curling slowly for silent deprioritization.
- **The Taxi Meter** — a shared mechanical fare meter with clicking digits attached to the object incurring per-second cost, never the HUD; several at once, deliberately horrible to look at. One widget, six threats, one unforgettable sound.
- **The Bestiary Card** — every encountered threat gets a collectible field-guide card with silhouette, lane texture, counters and a scribbled staff note, carrying the Mastered stamp so the collection doubles as a record of what you permanently solved. (+2 var)
- **The Threat Grammar Law (visual)** — every hostile is an angular/spiked silhouette in a toxic-cool palette with jittery skitter motion, telegraphing a signature sound and directional edge-arrow before entering frame; each enemy is a packet-shaped metaphor for the protocol it abuses. (+3 var)
- **Threat Vignette Rule (feedback law)** — consequences localize: a hit building glitches its own sprite with a red vignette pulse and a short data-spill, and the screen only ever flashes fully red on total failure. Feedback is pointed, never spammy.
- **Hostile palette law — magenta vs acid-green/magenta vs violet vs red — *CONFLICTING*** — all agree on exactly one reserved hostile hue customers may never wear. ⚔️ which hue: magenta-hostile with violet-unclassified and cyan-friendly (master's two-hue system, with entropy explicitly excluded from magenta), versus acid-green/magenta/void-black, versus violet-as-hostile with the frost shader reserved to ransomware, versus red-as-hostile-lane. The choice fixes what "unidentified" looks like and whether entropy can read as an attacker.

## 2.27 Threat-to-hosting-type matrices

- **Matrix A — signature threat, signature non-attack problem, and what it costs** — a per-type table: shared/cPanel mass WordPress compromise vs noisy neighbor costing churn and support; VPS benchmark shaming vs oversell exposure costing demand-lane closure; dedicated hardware failure vs sub-breakeven utilization costing stranded capex; colo tenant fire vs stranded power costing liability and capacity; wholesale pre-leasing shortfall vs construction overrun costing a financing covenant; email blocklisting vs deliverability decay costing total product failure.
- **Matrix B — the wave-deck mix per type (what the generator draws)** — the variety engine at a glance, listing 8–9 draw items for each of ~22 types (shared web, VPS/cloud, dedicated, colo, game, backup/DR, CDN, GPU/AI, HPC, email, DNS, object storage, video, mining, K8s/PaaS, DBaaS, VoIP, bulletproof, regulated, financial colo, dial-up era, satellite/edge).
- **Matrix C — which threat families dominate which type** — a four-family split per type for wave-budget authoring: shared web and VPS skew malicious + human; colo, GPU and wholesale entropic + systemic; email, DNS and bulletproof systemic; backup/DR and archive entropic; game hosting malicious + human with a large customer-as-threat share; regulated human + systemic with almost no volumetric content. Matching the split to the type is the cheapest way to make two levels feel like different games.

---

# Visitors, traffic, and clients — summary

> Source: `master/04-customers-traffic-and-clients.md` · 456 idea entries · 348 KB

## 3.1 The visitor model

- **Patience as HP — the unified visitor spec (the reverse creep)** — a visitor is a millisecond budget plus a value; every node subtracts its current response time, errors subtract chunks, and bounce is a sigmoid on budget consumed rather than a hard step.
- **A visitor is a five-stat unit** — Patience, Value, Weight, Loyalty, Fragility; the same five slots costume a DNS query (patience 100ms, value ~0) and a colo tour (patience months, value enormous). (+7 var)
- **Visitors take damage from *your* stack** — they are not shot by enemies, they are worn down by queueing, inspection, retries and errors, so every tower you place is a tax on the people paying you.
- **Customer Duality (the figure and the stream)** — accounts are walking figures you can name and grieve for; load is a parallel stream of packets you can only measure. Both must arrive and survive. (+5 var)
- **The closed loop — patience, latency, queueing, and slots, written out once** — `queue_wait = base_ms × u/(1−u)`; latency is emergent from load not additive from a spec sheet, the hockey stick falls out of the formula, and headroom is purchasable as slots.
- **The Latency Ladder readout** — live stacked per-hop ms against a bounce-threshold line, whiskers for the compounding tail, RTT count for distant visitors, plus a baseline node-cost table (WAF 20–60ms, CAPTCHA 2–8s, unindexed DB scan 400–4,000ms).
- **The Millisecond Budget (defense selection as a knapsack)** — the level states a budget ("your customers bounce past 400ms") and every defense publishes an ms cost, a confidence gain and a friction %, so paranoia becomes a number instead of a mood.
- **Suspicion Routing — the Two Lanes (the game's mazing layer)** — unclassified violet traffic is split by a player-set threshold into a cheap shallow Fast Lane and a deep expensive Slow Lane; confidence composes as `C = 1−Π(1−cᵢ)`, latency as the sum.
- **Customer lanes vs threat lanes** — ⚔️ one shared violet ingress separated only by inspection (so filters always tax revenue), vs two visually distinct rivers separated at spawn with mimics as the named exception.
- **Friction Gates** — every defense carries a % of legitimate visitors bounced: it applies only where placed, compounds multiplicatively (three 5% gates pass 85.7%), order matters, and it is a defense × cohort matrix, not a scalar.
- **Classification, not destruction — and the third outcome** — defenses classify rather than kill: Pass is free, Drop is total, and Challenge is the tunable middle that costs latency and patience, giving two distinct ways to wrong a customer.
- **Value as Bounty — and value accrues per hop** — reaching the Conversion Node pays the visitor's Value and a bounce subtracts a reputation tick; partial progress draws a partly-filled coin, so a bounce at hop 4 hurts visibly more than one at hop 1.
- **The Conversion Node** — the base you are defending is actually the thing you escort visitors *to*, so win and lose conditions live in the same object: threats want to reach it, visitors need to.
- **Session Depth** — visitors make several trips (browse → search → product → cart → pay) and can bounce at any hop, so deep-funnel units are higher value, higher fragility, and exposed to your weaknesses repeatedly.
- **Duration classes — and the resource each one eats** — Instant consumes throughput, Session a slot for its duration, Batch a window, Resident committed capacity that cannot be shed at all; shape encodes duration class only.
- **Patience → Trust → Tenure (three timescales)** — per-request patience, per-incident trust, per-month tenure; a DDoS hurts patience, a breach hurts trust, bad pricing hurts tenure, so you can be fast and still lose customers.
- **The Expectation Ratchet** — patience is relative to your own recent history, so a flawlessly served cohort's tolerance tightens and five-nines customers start bouncing at two-nines; excellence buys a harder exam. (+1 var)
- **Contagious feelings** — a bouncing customer flicks a −20% patience droplet onto its neighbours and a well-served one sparkles; a stall near checkout poisons the whole river while one at the edge poisons nobody.
- **The self-service skill axis** — every customer carries a competence stat: skilled developers route around half your failures and grumble less, unsophisticated SMBs bounce on the first 502 and scream, so tower choice picks a clientele.
- **Priority Classes and the Shed Ladder (pre-configured triage)** — paint traffic into P0 contractual, P1 revenue, P2 normal and P3 opportunistic, then author rungs in advance (80% drop P3 … 98% P0 only) that the system walks automatically and visibly.
- **Visitor Trust as a per-identity value the defenses can read** — logged-in, verified, long-tenure identities accrue trust that bypasses the Slow Lane and challenges; the matching downside is that compromised trusted accounts become the best attack vector. (+1 var)
- **The Return Cadence (today's service is tomorrow's wave size)** — `P(return) = base × (1 + 0.6 · budget_left/budget)`, a bounce setting it to `base × 0.15` and a scary-warning bounce to zero, with returns landing one to three waves later.
- **Returners and Referrers** — a satisfied visitor slightly enlarges the next wave and a delighted one spawns a referral, so the mid-game reward for playing well is more pressure rather than less.
- **Word of Mouth is the wave-size dial** — reputation moves with uptime, latency, support response and public incidents and directly multiplies spawn rate, but unbounded 2–3× advocacy is exponential without a network-saturation curve. (+2 var)
- **The Satisfaction Bank (goodwill as a spendable buffer)** — well-served visitors deposit into a goodwill pool capped at ~2 weeks of revenue and decaying 5%/month, spent automatically to absorb reputation damage or deliberately on a price rise or maintenance window.
- **Party Arrival, generalised (all-or-nothing units)** — a 5-player party, a multi-item cart, a procurement delegation, a backup job chain, a simulcast ladder, a seven-cabinet deployment: linked units that visibly fail to fit and rebound, arguing for headroom over average capacity. (+2 var)
- **Capacity as concurrency slots, not bandwidth** — N slots each occupied for a visitor's service time makes Little's Law intuitive, and one slow endpoint eating every slot teaches the lesson in ten seconds.
- **The Queue and the Death Spiral** — queued visitors still consume resources while waiting, so past the timeout point you do 100% of the work for 0% of the revenue and the only escape is deliberately shedding load.
- **Cache Hit Ratio as a visible visitor path** — hits take the short green path and leave happy, misses take the long route through app and DB, so warming, invalidation and TTL become visible routing decisions instead of config.
- **Keepalive and Connection Reuse** — a returning visitor on an existing connection skips TCP and TLS, so HTTP/2-3, pooling and session resumption raise effective capacity with no new hardware — one of the few builds that is pure profit.
- **Geographic origin (speed of light is a hard game constant)** — visitors spawn from world-map regions and distance is latency you cannot optimise away, which is why the world map and the build tree are the same decision. (+2 var)
- **The Diurnal Curve** — each region and each hosting type has its own daily shape (business email 9am, games 8pm, backups 2am, CDN at primetime), and running complementary businesses smooths the curve. (+1 var)
- **Seasonality** — retail peaks in Q4, games at expansion launches, tax hosting in April, education dies over summer and HPC spikes at fiscal year end; a calendar you can plan against makes forecasting a skill. (+1 var)
- **Flash crowd / viral spike** — a front-page hit is 40× normal traffic for 90 minutes from a narrow geography hitting one URL, survivable only with caching; the perfect tutorial for keeping static assets off your app server. (+2 var)
- **The bot fraction** — a large invisible share of traffic is non-human and some of it is disguised; classification accuracy is a stat improved by bot-management builds, and misclassification is punished in both directions.
- **Retry amplification** — an unhappy visitor retries and doubles your load exactly when you can least afford it, with mobile apps the worst offenders, turning a small outage into a self-inflicted DDoS.
- **Visitor weight varies wildly** — the rule is really 99/1, not 80/20: one customer's 4K video file equals ten thousand page loads, drawn as a physically huge sprite that occupies a whole lane. (+1 var)
- **Herding (visitors follow other visitors)** — a populated server attracts more players and an empty one repels them, creating runaway winners and empty-server death spirals you must manage by seeding; the only unit that influences other units.
- **Sticky vs. fluid traffic** — a game player holds a slot for hours while a DNS query is gone in a millisecond, so sticky traffic holds capacity and you cannot burst your way out of a slot shortage.
- **Demand Elasticity by Latency (the visible curve)** — a plotted per-segment curve of conversion against response time, showing mobile falling off a cliff at 1.2s while enterprise doesn't care until 8s, turning optimisation into a targeted choice. (+1 var)
- **The Latency-Blind Visitor** — batch jobs, async webhooks, replication, log shipping, crawlers and backup transfers have effectively infinite patience and huge throughput demands, so the prioritisation mechanic always has something obvious to demote.
- **Traffic That Is Not For You** — at Tier 5+ traffic crosses your network that neither originates nor terminates with you: it eats capacity, may be someone else's attack, and may be revenue or obligation. (+1 var)
- **The Bounce Ticker** — a HUD element showing a running count and dollar value of visitors lost in the last 60 seconds, broken out by cause (too slow, blocked by you, capacity full, error).
- **The Live Bounce-Reason Strip** — an always-visible one-line readout of the top three bounce reasons right now with percentages, converting the whole §3.4 catalogue from flavour into a live diagnostic.
- **The Conversion Funnel as literal geometry** — the path has stages, Arrive → Reach → Served → Satisfied → Return → Refer, each a place on the board with its own counter, so the player diagnoses which stage leaks. (+2 var)
- **The Visitor↔Build counter-matrix (a legible answer table)** — one Codex page of archetypes against builds saying which build saves which visitor (Mobile Commuter ← CDN, API Client ← p99 and `429 Retry-After`), true enough to double as the educational spine.
- **The Cohort as a unit (customers own their traffic)** — at Tier 3+ visitors spawn from a customer card in that customer's colour, so you see whose traffic is hurting you, firing a customer visibly removes their stream, and growth is a thickening river.
- **Declining demand as a verb (the "we're full" sign)** — cap intake, close signups or go invite-only: latency, support load and abuse all drop immediately, and reputation moves sideways from "available" to "exclusive" rather than down. (+3 var)

## 3.2 Visitor archetypes

- **Family I — Browsers** — the human-eyeball family, grouped so the silhouette read is fast: skimmers, mobile commuters, desktop regulars, deep readers, power users, ghosts and geo-distant visitors.
- **The Skimmer / Casual Browser** — 800–1,500ms of patience, tiny value, enormous volume; the chaff that nevertheless funds you, drawn as fast tiny darts arriving like rain on a window. (+1 var)
- **The Mobile Commuter / Impatient Mobile Visitor** — arrives with pre-damaged patience on a lossy link where every round trip costs double; the aggressive timeouts you set against Slowloris kill exactly these people, and CAPTCHA costs them 22% versus 12% on desktop.
- **The Desktop Regular / Returning Customer** — ~3,000ms plus a 1,000ms trust buffer, a warm cache and path memory; they visibly pave their route over time, and if they do bounce they are gone permanently with their lifetime value.
- **The Deep Reader** — a larger slower unit visiting many pages: far more ad and engagement revenue, but exposed to your failures for far longer, and you watch them traverse the whole site.
- **The Deep-Link Visitor** — arrives from search on a specific product page rather than the homepage, so front-door optimisation is irrelevant; the reason the Latency Ladder must be per-path rather than global.
- **The Power User** — high patience and high value but 5× the load from dashboards, exports and API calls; the clearest single unit for teaching that revenue and cost are not the same axis.
- **The Logged-In User** — bypasses your cache by definition, making a wave of them ~30× more expensive than the same count of anonymous visitors; success at signing people up makes your defenses less effective.
- **The Night Owl** — arrives during your maintenance window, punishing lazy scheduling and turning the window into a placement decision on the diurnal curve rather than a checkbox.
- **The Ghost Visitor (adblocked / no-JS / privacy)** — a translucent outline that counts for load and contributes less revenue, and the cohort a JS challenge bounces at 100%.
- **The Accessibility Visitor** — screen reader, slow device, text-only; punishes JS-heavy builds, carries disproportionate CAPTCHA friction, and cannot be won by caching, hardware or CDN at all. (+1 var)
- **The Geo-Distant Visitor** — spawns at the far map edge where every kilometre is latency; only a PoP or regional replica saves them, and RTT count matters more than server milliseconds.
- **The Regional Wave** — at world-map scale visitors arrive as population-weighted regional tides that follow the sun, turning capacity planning into a timing game rather than a sizing one.
- **Family II — Buyers** — the money-carrying family that must traverse the full funnel: shoppers, impulse buyers, comparison shoppers, cart-abandoners, refund hunters, tire-kickers and migrators.
- **The Buyer / Power Shopper / Checkout Whale** — carries a visible money bag through landing → product → cart → checkout → payment → email; worth 50× a pageview, cannot exist before you build a database, and drops everything if any hop fails.
- **The Impulse Buyer** — roughly 1,200ms of patience carrying a conversion worth fifty skimmers; the single best argument in the game for optimising your slowest path.
- **The Comparison Shopper** — visits, leaves, and returns later only if your performance was good; a delayed-reward loop where today's speed is tomorrow's traffic. (+2 var)
- **The Returning Cart-Abandoner** — comes back if and only if session state survived, punishing the player who put sessions in an evictable cache two levels ago.
- **The Refund Hunter** — converts and then reverses, with negative expected value; detectable only by pattern, and concentrated in the affiliate and deal-forum cohorts so channel choice determines refund rate. (+2 var)
- **The Tire-Kicker** — signs up for a trial, uses a lot, converts at ~8%; hovers at the pricing node with a visible hesitation wobble that sales and marketing upgrades visibly reduce. (+5 var)
- **The Migrating Customer / The Migration-In** — a giant slow convoy escorted over a long duration, drawn as a moving truck of crates; with no landing zone ready it visibly circles the block on a grace-period loop before leaving. (+3 var)
- **The Repatriator** — a prospect leaving a hyperscaler with a spreadsheet and a grievance, blocked by committed spend, generating 4× tickets for ninety days, then an excellent long-tenure customer if you survive onboarding.
- **Family III — Machines** — the non-human family whose failure modes are binary rather than gradual: API clients, integration partners, crawlers, uptime monitors, pentesters and IoT fleets.
- **The API Client / API Consumer** — huge latency tolerance and zero error tolerance; no jitter so retries synchronise, no circuit breaker, timeouts shorter than your recovery, and it runs in infrastructure you cannot fix. (+2 var)
- **The Integration Partner** — your customer's *other* vendor — their payment callbacks, monitoring, CDN origin fetches, nightly ERP sync — with no contract, changing IP ranges, and a ticket that blames you.
- **Googlebot / The Crawler (friendly bot)** — serving it fast raises crawl budget and therefore future spawn rate; it looks exactly like a scraper locust, and a 503 visibly un-fills tiles on its site-map grid. (+4 var)
- **The Uptime Monitor** — hits `/health` every minute and publishes what it sees; it also generates false incidents when its own network breaks, so N-of-M vantage agreement is the counter.
- **The Customer Who Monitors You Better Than You Do** — runs synthetic checks from five regions and reports outages before your own monitoring, because they measure p99 and you measure p50; handled well they become a free sensor and a reference.
- **The Authorized Attacker (the customer's pentester)** — genuinely hostile traffic in a contracted window: allow-list them for a real report and three free findings, or fight them and learn nothing while the customer pays $30,000 for a WAF advert. (+1 var)
- **IoT — the device fleet** — populations of millions synchronised by accident, drawn only as aggregate ribbons or a granular texture whose grain visibly coarsens and goes magenta when the fleet misbehaves.
- **Bot Traffic That Isn't Malicious** — search crawlers, uptime monitors, AI scrapers, price-comparison and archive bots that cost resources and may or may not provide value; the category exists so "block all bots" is never simply correct.
- **Family IV — Amplifiers** — the family whose real output is other visitors: advocates, reviewers, influencers, press, streamers, communities and referrers you never asked for.
- **The Advocate / Word-of-Mouth Visitor** — converts and spawns 2–3 extra visitors after a delay, or a grey suppressor token if served badly; capped by `wom_spawn = base × (1 − reached/addressable)` so the channel fills up. (+6 var)
- **The Reviewer** — a single slow-walking spotlit VIP with a live star rating that other visitors can see, so a Reviewer having a bad time in public depresses nearby conversion in real time.
- **The Influencer / The Press** — rare and loudly telegraphed ("400k followers, arriving in 10s"); a good trip fans out new visitors from the map edge, a bad one permanently dims a section of the inbound gate. (+4 var)
- **The Streamer / Sponsored Creator (game hosting and developer products)** — pays little or nothing but generates enormous signup flow; model them as a demand multiplier whose retention is a marketing budget line, not a support one.
- **The Journalist** — like the Reviewer but appears only during incidents; serve them a good status page and the story becomes "handled it well". The only visitor your failures summon.
- **The Community** — a forum, Discord or modding scene generating free marketing, free support and the occasional riot; a two-way reputation amplifier with a high churn-contagion multiplier. (+1 var)
- **The Referrer You Didn't Ask For** — someone posts you on a forum or a foreign-language deal site, bringing a cohort with completely different behaviour — sometimes excellent, sometimes 400 fraudulent signups — that you cannot turn off.
- **Family V — Costs** — the family that consumes without paying: freeloaders, hotlinkers, support seekers, locked-out customers, repeat bouncers, uploaders and fraud signups.
- **The Freeloader / Free Tier Tourist** — zero value and full resource cost, whose only function is possibly converting later at 1–3%; the natural first citizen of P3, drawn filling with gold when it does convert. (+6 var)
- **The Hotlinker / Bandwidth Parasite** — spends your bandwidth from someone else's page: looks like traffic, costs like traffic, pays nothing, and the referer rules that stop it occasionally break a real customer.
- **The Support Seeker** — doesn't want to buy, wants a human; consumes a staff hand, converts into a churn event if ignored, and is the only unit whose damage lands on your attention budget rather than your capacity.
- **The Customer Who Has Locked Themselves Out** — firewalled their own VPS, changed the SSH port, deleted their sudo user; a high-frequency low-severity class solvable only with console/IPMI, which is how out-of-band access pays for itself.
- **The Repeat Bouncer** — has bounced before and needs *two* good experiences to be won back, modelling trust decay at the individual level and justifying a per-identity rather than global trust buffer. (+1 var)
- **The Upload Visitor** — large POST bodies sensitive to timeouts, body-size limits and temp-disk space; fails into a support ticket rather than a bounce, skipping your latency graphs entirely.
- **The Sanctioned Entity / Fraud Signup** — must be rejected, and rejecting costs conversion rate while accepting costs the run; the unit that makes fraud screening a real decision rather than a free tower.
- **Family VI — Evaluators** — the family that grades your architecture rather than your speed: enterprise buyers, delegations, auditors, compliance questionnaires, bankers and silent scorers.
- **The Enterprise Buyer / Enterprise Evaluator** — effectively infinite patience, walking slowly while inspecting your status page, SLA, certifications, uptime history and support response; cannot be won with speed, only with boring things you built. (+3 var)
- **The Evaluator's synthetic test (the scheduled exam)** — an enterprise prospect runs a synthetic test against you for three shifts before signing, so a huge contract turns on a window you can see on the calendar.
- **The Procurement Delegation (a multi-headed customer)** — engineer, lawyer, CFO, security reviewer and insurance officer on one slow base with five satisfaction pips, where satisfying the CFO structurally dissatisfies the security reviewer. (+3 var)
- **The Column-Fodder Prospect** — looks exactly like a high-value evaluator, consumes pre-sales engineering, requests a proposal and vanishes; their only function was to be someone else's third quote, and only qualification reveals the tell.
- **The Incumbent-Locked Lead** — a perfect customer whose contract ends in eight months and who cannot convert now at any price; nurture them cheaply across levels, or buy out their early-termination fee.
- **The Auditor (regulated)** — walks your *evidence* rather than your network — logs, change tickets, access reviews, training records — and is the only visitor for whom documentation is the product. (+1 var)
- **The Compliance Visitor (the security questionnaire)** — a 340-row spreadsheet with a 10-day deadline where each row is answerable only if you built the thing and every answer is checkable later; your architecture is the sales document.
- **The Banker** — your lender's annual review arriving as a visitor to grade your financials, revenue concentration, contract terms and covenants, then raising, holding, repricing or pulling your credit line.
- **The Buyer's Analyst** — due diligence as a visitor, walking your documentation rather than your network; every shortcut you took in the build and ops sections is now sitting in a data room.
- **The Lurker (the silent scorer)** — an analytics-crawler-shaped evaluator with no speech bubble that watches your public metrics for several waves, then converts at whale value or posts a teardown; only the Monitoring Eye reveals it.
- **The Eraser (the deletion demand)** — a timed, legally-backed deletion unit aimed at the Archive, where WORM vaults, offsite tape and fanned-out log copies say no; survivable only with crypto-shredding and per-customer keys.
- **The Distributor Rep** — a supply-side visitor arriving at quarter-end desperate to move inventory, worth 8–15% off hardware to a patient buyer with cash and flexibility on spec.
- **Cross-family specials** — units that cut across the six families because their behaviour is defined by scale or dormancy rather than by role: whales, media streamers, ghosts, resellers and lurkers.
- **The Whale** — one client worth more than your other hundred combined, moving slowly with an entourage; one SLA breach takes 30–40% of MRR, and prioritising their traffic is a QoS decision that degrades everyone else. (+10 var)
- **Whale immortality** — ⚔️ is a signed whale a terminal state with expansion as the only variable, a standing obligation re-won at every renewal, or immortal within a level and mortal across levels?
- **The Media Streamer / Streaming Viewer** — a long-lived thick ribbon sensitive to jitter and rebuffering rather than TTFB, tolerating about two buffer events and blowing up your 95th-percentile transit bill rather than your servers. (+1 var)
- **The Ghost (the dormant payer)** — signed up long ago, pays, uses nothing: pure profit and an unpatched forgotten compromise waiting to happen, with an audit-or-ignore fork and a Dormant Wake-Up at 400× traffic. (+2 var)
- **The Reseller (any type) — a client who brings their own swarm** — a single figure trailing a flock whose portrait contains smaller portraits; losing them loses fifty customers in one visible exodus. (+1 var)
- **The Lurker (BBS / IRC / community)** — costs a slot, generates nothing, and is the soul of the community; a comedy unit with a tiny real reputation function, and the reason community levels cannot be scored on revenue.

## 3.3 What "a visitor" is per hosting type

- **Web host — a page load** — a latency budget walking a topology: tiny fast cyan darts bouncing at ~3 seconds, arriving in bursty clumps tied to *your customer's* marketing rather than yours.
- **Managed WordPress — a page load *plus* a plugin-update event** — heavier per request, the worst ticket-per-visitor ratio of any line, blamed for the customer's own plugin, and an update event that can break the site it arrives at.
- **VPS / cloud — a provisioning request, and then someone else's traffic** — the customer is the unit and the traffic is theirs; the request is rare, large and patient in minutes, but more than a few minutes of setup and the developer cancels.
- **Dedicated / bare metal — a sales inquiry** — slow-moving, high-value, needs a human; the line where a sales desk is literally part of the infrastructure.
- **Game host — a player joining a server** — a ~45-minute session with a ping chip (green under 30ms, amber under 80, red beyond) that degrades continuously; parties are all-or-nothing and players visibly affect each other. (+3 var)
- **Game host — the Tournament** — a scheduled high-value high-visibility event with a known date, a known load, a known audience and nowhere to hide; the natural escort or showcase level.
- **VoIP / SIP — a call** — binary with no partial credit, scored by MOS, spiking hard at 9am, and drawn as a taut two-way thread that frays with jitter and shows holes with packet loss.
- **Email host — a message** — the only visitor whose journey continues after it leaves you: inbound must be filtered without false positives, outbound must be delivered by strangers, and the destination is the boss.
- **DNS host — a query** — microscopic, astronomically numerous and individually worthless; TTL is a throttle you control, the whole level is a shimmer, and the customer only notices when it fails.
- **CDN — a request at a PoP** — the interesting event is the miss, which spawns a second visitor headed inward to origin; the hit/miss split and which PoP catches it is the gameplay.
- **Object storage — a GET/PUT** — two visitor types with opposite economics moving in opposite directions: PUTs cost you and build a liability, GETs carry the egress revenue.
- **Backup host — a backup job (and, rarely, a restore request)** — big slow patient freight that retries rather than bouncing, bounded by a visible window band that physically cuts unfinished crates off at its trailing edge with a red seal.
- **Backup / DR — the restore request, and the declaration** — the rarest and most valuable unit in the game, arriving by phone at night from someone having the worst day of their career; the red case opens full or empty.
- **Tape vault — a courier, and a recall request** — a physical visitor with an SLA measured in hours-to-truck and a chain-of-custody stamp; the only visitor that can be stuck in traffic.
- **Video / streaming — a viewer** — an extremely long-lived bandwidth-heavy connection joining mid-stream, sensitive to startup time and rebuffering, arriving in perfectly correlated tides at 8pm or kickoff. (+1 var)
- **Playout / broadcast — the schedule itself is the visitor** — it never stops arriving and cannot be queued; the only line where being early is exactly as wrong as being late.
- **GPU / AI host — an inference request, or a training job** — tiny latency-bound prisms whose patience depends on whether a human waits, against enormous multi-day slabs that reserve capacity and crack on preemption. (+3 var)
- **HPC / render — a job submission** — enters a queue with priorities and fair-share, submitted in batches with deadlines, with an angry researcher whose job has been pending nine hours.
- **CI host — a build job** — bursty with the working day, patient until the developer context-switches away; value decays with queue time, so it is the only visitor that can succeed and still be a loss.
- **Kubernetes / PaaS — a deployment** — a visitor that changes your infrastructure: it unrolls a blueprint at the control plane and the board physically rearranges, wrongly and watchably if the manifest is bad.
- **Serverless — an invocation** — the first after idle is slow and the rest are fast, making it the only unit whose patience cost is set by the arrival history of other units.
- **DBaaS — a query** — small, chatty and millisecond-scale, except for the few that are catastrophic: one unindexed full scan at 400–4,000ms eats every slot you have.
- **Observability host — a metric series** — not a request but a stream that never ends, whose cost is cardinality rather than volume, so one customer adding a label multiplies your storage overnight.
- **Colo — a prospective tenant touring the facility** — walks your building judging cable tidiness, spare capacity, UPS maintenance bypass, fuel contracts, concurrent maintainability and whether your techs know the answers; the prep is the level and the tour is a 90-second rail-cam.
- **Colo — the tenant's engineer badging in** — once signed, the tenant's people are visitors too: they walk your floor and touch their own gear while you watch, which is why access control and escort policy are gameplay.
- **Colo — install day (dock → lift → rack → power → network)** — a physical logistics chain where failure is not a bounce but a "couldn't install" churn with a scathing review, from a customer who already signed. (+1 var)
- **Wholesale / build-to-suit — a site-selection team** — a visitor in a suit with a lawyer, evaluating power availability, fibre routes, tax abatement and water rights; arrives about once a year and is worth the whole level.
- **Colo / wholesale — The Broker** — brings you tenants you would never meet for 3–6% of first-year contract value; a channel partner with real leverage, and not optional in real colo.
- **Regulated — an auditor** — a visitor with a checklist walking your evidence rather than your network; certifications are the marketing and the audit itself is the funnel.
- **IX operator — a peering session** — not traffic but a relationship, with a watchable establishment sequence (port up → LACP → ARP → BGP → prefixes) that then sits producing value for years, and whose loss is silent for a month.
- **Registrar — a registration, a renewal, and a transfer** — three units with opposite emotional valences, including a transfer-out you are legally obliged to assist and a transfer-in you win by being faster at paperwork.
- **CA — a certificate signing request with a validation challenge attached** — the visitor must prove something before you serve it, the proof can fail entirely on their side, and each one is near-zero value and enormous liability.
- **PACS / medical imaging — a study retrieval with a human attached** — an enormous payload with tiny patience, where the person who bounces is a clinician standing in front of a patient.
- **POS / payments — an authorization** — binary with a 2-second hard timeout, where the bounce is a person standing at a till with a queue behind them.
- **WISP — a subscriber's CPE** — a resident unit with a physical aim and a signal-quality stat that degrades with weather and vegetation; the only visitor a tree can bounce.
- **Time service (NTP) — a synchronization client** — does not bounce and does not complain; it quietly becomes wrong along with you, the only visitor whose failure mode is silent corruption of everyone downstream.
- **Legacy / mainframe — a batch window** — the nightly job run is the visitor: enormous, must finish before the branch offices open, and has run at exactly the same time since 1997.
- **Dial-up — a dialling subscriber** — one customer, one port, one line, with a modem LED bank where the last light lit means callers visibly turn away and three busy signals means cancellation. (+2 var)
- **BBS / shell / Usenet — a user session** — blinking cursors occupying pty slots and typing, so load is readable as how many are blinking, plus a newsfeed flowing whether anyone reads it or not.
- **Seedbox / storage users — occupancy, not traffic** — hoarders that arrive once and then simply grow as slowly inflating blobs, teaching the difference between bandwidth customers and capacity customers.
- **IoT — a device check-in** — populations of millions synchronised by a firmware default nobody chose, drawn as granular grain with a density and never as individuals above Tier 1.
- **Satellite ground station — a pass** — a timed window that is either captured or lost forever; a visitor with an appointment on a schedule you neither control nor can delay.
- **Mining hosting — no visitors at all** — only tenants and kilowatts; a level with no visitor lane, which is a change of pace and makes every other level legible by comparison.
- **Bulletproof — a client who asks no questions** — arrives via encrypted channels, pays in crypto, and is itself the risk; revenue with a half-life attached.
- **Ad-tech / RTB — a bid request** — 100ms, hard: the Timeout Cliff, where there is no slow, only late, and late is worth exactly zero.

## 3.4 Why visitors bounce

- **Latency drain / TTFB over budget** — the master stat: every hop with queueing costs patience and every intermediate hop adds TTFB, and it is emergent from load rather than additive from a spec sheet.
- **Bounce is not churn (the two-tier failure model)** — a bounce means they left the path and may retry, countered by path speed; a churn means they cancelled the contract, countered by relationship health. Conversion sits between them. (+3 var)
- **The KYC verification queue** — signups stall grey and pending at the border, draining at the rate of your review desks; too strict throttles your own funnel, too lax admits card-testing abusers with your fingerprints on them.
- **Retry forgiveness** — ⚔️ a universal N-second grace window in which fixing the cause pulls a departing customer back, vs forgiveness that is per-archetype, era-scaled, purchasable, or (for dial-up) absent entirely.
- **Path Ugliness (too many hops)** — extra proxies, a distant PoP or an overloaded firewall accumulate latency per hop, which makes elegant infrastructure literally look shorter on screen.
- **Redirect chains** — `http → https → www → trailing slash` is four round trips before a byte of content, drawn as four extra path segments and costing a geo-distant visitor a full RTT each.
- **TLS handshake cost** — expensive on first visit and cheap on resumption, rewarding session tickets, 0-RTT, OCSP stapling and keep-alive, and punishing the mobile cohort twice over.
- **The Error cliff** — an error ends the visitor rather than draining them, and presentation matters: a branded 503 bounces politely while a raw "Internal Server Error" bounces angrily and files a ticket. (+1 var)
- **The Scary-warning cliff** — cert warnings, browser interstitials and malware flags bounce near 100%, and because it is a trust failure rather than a speed failure the reputation damage is disproportionate.
- **The browser warning that isn't yours** — a Safe Browsing or reputation-vendor interstitial fires on a neighbouring site or an ad inside your customer's page: near-100% bounce for something you did not do, with a form and a wait to fix.
- **The Captcha tax / your own defenses** — every bot defense costs real humans a slice of patience; blocked legitimate visitors flash amber, pile up under the offending defense, and tick a live false-positive counter on its faceplate. (+2 var)
- **The defense that is invisible to you because it works before your logs** — anything blocked at your edge, CDN, scrubber or DNS bot manager never reaches your application logs, so your own instrumentation systematically under-reports false positives until you buy edge-side logging.
- **The Phantom Funnel (demand you cannot see)** — a parallel invisible stream of people who failed before your board saw them (DNS failures, IPv6-only clients, dropped TLS versions, geo-blocks); RUM and external synthetics reveal a slice, often ~6% of demand.
- **Protocol Compatibility as a Visitor Filter** — a live matrix of IP versions, TLS versions, ciphers, HTTP versions, SNI, ALPN and old CA roots, each row carrying a population share; dropping TLS 1.0 costs 0.4% of visitors and one payment gateway callback.
- **Happy Eyeballs failure** — publishing an AAAA record adds 300ms of fallback timer for the slice with broken IPv6, or blackholes them entirely when the fallback never fires; a strictly-good upgrade that made a cohort slower.
- **The cert chain that only fails on old clients** — a missing intermediate produces a specific invisible cohort loss with no error in your logs, because the connection never completed and you look perfect on every dashboard you own.
- **The visitor's ISP is the problem** — a hijacked NXDOMAIN, a carrier NAT behind an IP you rate-limited, a MITM proxy your HSTS rejects, or congested 8pm transit: you are perfect and they bounce, and only outside measurement finds it.
- **The mobile-carrier NAT block** — one per-IP rate limit bounced 40,000 subscribers behind a single carrier NAT gateway, which argues for per-ASN and per-session limits as a real and non-obvious build.
- **Geo-IP misclassification** — a stale database sends your CDN's visitor to the wrong continent after an IP transfer; they experience 280ms and you see nothing wrong at all.
- **Cold start** — a newly scaled-up node serves its first N visitors badly, so scaling is not instantly good; also applies to cold caches after restarts and to serverless at 300–1,500ms.
- **Cold cache after a deploy** — every deploy that busts the cache opens a slow window, which makes deploying a defensive vulnerability and argues for the deploy calendar and the wave calendar on one strip. (+1 var)
- **Queue Despair (the visible queue)** — a waiting room drains patience more slowly but drops conversion about 15%; queued visitors visibly colour-drain, and comfortable queueing means they sit while bad queueing means they pace.
- **Queue-time value decay (the patience model that depreciates instead of bouncing)** — for CI, HPC, transcode and support the request eventually succeeds but the human has moved on; the counters are priority, preemption and a progress indicator that keeps them engaged.
- **Ugly / broken / degraded layout** — CSS from a dead CDN, missing images, broken mobile layout and heavy JS cost a flat −25% patience even though the site is up, and you watch it in the Site Preview Window.
- **Third-party drag** — analytics, ads and chat widgets added for revenue slow the page for everyone; a revenue decision that costs conversion, and one whose cost stays invisible unless you measure it.
- **Search ranking decay** — chronic slowness reduces the spawn rate of *future* visitors; damage to the future rather than the present, rendered as the crawler's site-map grid visibly un-filling.
- **Mail deliverability** — password resets and receipts landing in spam churn customers for reasons no latency graph shows; requires SPF, DKIM, DMARC, reverse DNS, a warm IP and a clean neighbourhood.
- **Reputation Bounce (email)** — if your IP is listed the visitor never even arrives; the only bounce that happens entirely outside your board, decided by a third party with no obligation to you.
- **The Slow Landing Page (business recursion)** — your marketing site runs on your own struggling infrastructure, so an attack on your servers is simultaneously an attack on your customer acquisition.
- **The Trust Gap** — visitors pause about 0.4s at the doorstep checking a real address, a phone number, a status page, review scores, a padlock and years-in-business, then walk on or path straight past you.
- **Price Shock at Checkout** — advertised $2.95, renews at $11.95: converts brilliantly, churns horribly at month 13, and generates the angriest reviews in the industry as a deliberately poisoned strategy.
- **Form Friction** — every extra signup field loses ~8% of visitors and buys fraud-screening accuracy; one of the few places where the anti-fraud build and the conversion build are the same build at a different setting.
- **Payment declined** — a silent loss of often 5–15% of attempted orders that the player never sees without order analytics; the single most under-modelled leak in every business game.
- **Fraud check false positive** — strict screening rejects about 4% of good customers, and each one bounces at the most valuable moment in the entire funnel.
- **No Instant Provisioning** — if setup takes more than a few minutes visitors bail, which makes automation a marketing investment rather than an ops one.
- **The Missing Feature Filter** — visitors carry a checklist (SSH, Node, staging, daily backups, free SSL, a panel, a region, a certification) and visibly turn around when you cannot satisfy it. (+4 var)
- **Pre-sales response time (the lead decay timer)** — a pre-sales chat answering in 30 seconds converts at roughly 3×, and every lead carries a literal decay timer drawn on it, so live chat is both a cost centre and your highest-ROI tower.
- **Contract-end bounce (colo and enterprise)** — invisible for 35 months and then a single decision point that cannot be fixed in the last month, which is what makes the Renewal Calendar a real object.

## 3.5 Customer and client archetypes

- **The $3 Shared Hosting Customer / The Hobbyist** — $3–5/mo, arrives from a Google search, churns in four months, opens tickets at 3am, and costs 40× their monthly fee the moment they are hacked; profitable only in aggregate. (+3 var)
- **The Small Business Site** — $15–25/mo, prepays annually, medium support, very low churn if you never break anything; the quiet backbone of shared hosting and the archetype that rewards simply not screwing up. (+3 var)
- **The WordPress Agency** — 80 client sites running the same 12 plugins, so one vulnerability compromises all of them at once; wants white-label panels and a phone number, and leaves with 40–200 accounts on one notice. (+3 var)
- **The Developer Customer** — low revenue and high technical demands, but benchmarks you publicly, reports real bugs and refers others; a reputation multiplier disguised as a support cost who leaves instantly for a better API. (+3 var)
- **The Forum / Community** — bursty and database-heavy, attracts attacks and drama, generates its own abuse reports; loyal and long-lived if you keep it up, and a high churn-contagion node.
- **The E-Commerce Store** — revenue tracks *their* revenue and they will quote you the exact cost of your downtime; PCI scope, seasonal, and frequently bimodal with a cacheable storefront and a brutal admin panel.
- **The SaaS Company** — your customer whose customers are the traffic: their growth is your growth and their outage is your fault regardless of cause, so the two-layer sentiment mechanic bites hardest here.
- **The Startup Rocket / The Startup That Might Be Huge** — pays $200/mo now and might pay $80k in 18 months or evaporate; discounting them is a bet, made informed by a scouting mechanic reading funding, hiring and press. (+2 var)
- **The Enterprise** — slow to sign and slow to leave, demanding audits, SLAs and paperwork: net-60, three-year term, 60-day procurement, 60-page security questionnaire, and it unlocks regulated business lines. (+1 var)
- **The Legacy Anchor** — one high-MRR enterprise whose integration predates your platform, still hitting FTP with a 1024-bit key; you cannot modernise that lane without a churn boss-fight, and every hardening tower needs an exception.
- **The Root-Seeker** — a growing contract that keeps asking for the one thing you cannot safely give (hypervisor root, BGP from your core, its own ODF plug); granting it adds a permanent exception surface, refusing it risks churn.
- **The API Partner Whale** — a faceless machine customer under contractual SLAs arriving as perfect clockwork; your new defensive rule silently breaks their integration and you learn about it from the legal letters.
- **The Enterprise Procurement Monster** — a nine-month sales cycle, a SOC 2 requirement, net-90 terms and a legal team wanting unlimited liability; won only by compliance artifacts built levels in advance.
- **Government Greg / the Government-Institutional Buyer** — $12k/mo at net-90 behind purchasing vehicles, bid protests, annual appropriations and set-asides, with a fiscal-year-end buying spree; a cash-flow puzzle rather than a credit-risk one. (+1 var)
- **The Dormant Account / The Zombie Account / The Ghost** — pays monthly for a site nobody visits on a server you forgot, running an OS six years EOL; pure profit and an unmonitored compromise, until the card expires.
- **The Zombie (the one who already left)** — cancelled eight months ago and still has data on your array, a DNS record pointing at you and 404s in your logs; a customer-shaped cost with a data-retention liability attached.
- **The Mail-Only Customer** — tiny revenue and outsized risk, because mail is the most abuse-prone service you can sell and one compromised mailbox puts your whole outbound reputation on a blocklist.
- **The Spammer Tenant** — high-paying and corrosive: their output poisons a blacklist HP bar shared across every tenant on the range, so eviction is a visible collective repair and restraint unlocks a "Clean Nets" perk.
- **The Email Newsletter Sender** — arrives at scale and leaves the instant your IPs hit a blocklist, so their churn correlates to your shared-neighbourhood quality rather than your uptime; retention decided by who else you accepted.
- **The Crypto / Streaming / "Special" Customer** — offers 5× rates and brings 10× abuse complaints plus upstream attention; taking them is a run-defining choice rather than a line item.
- **The Gray Tenant (bulletproof)** — 6× MRR paid in crypto, generating abuse tickets from hour one; legal but reputationally risky, raises Heat, and is revenue with a half-life. (+1 var)
- **The Adult Site** — high bandwidth and high revenue with payment-processor complications and objecting upstreams; a real business decision with real tradeoffs, presented as commerce rather than scandal.
- **The Abuser (Knowing)** — signs up with a stolen card to host phishing, a spam relay or a booter panel; spotted by instant heavy outbound, port scanning, odd geography and rapid account creation, and screening also rejects ~4% of real customers.
- **The Abuser (Unknowing)** — a real customer whose site is compromised and serving malware: suspend-first protects your IP reputation and enrages them, help-first costs staff hours, and no option is free or clearly correct.
- **The Crypto Miner** — buys the "unlimited" plan and pegs 100% CPU forever, abandoning the moment the index dips; every unmetered product you ship is discovered by these people within 72 hours. (+1 var)
- **The Exchange** — a hundred SMBs of revenue in one contract, plus quarterly subpoena waves with enforcement clocks, a 3am escalation culture, and reputation meters that move with *their* industry's news cycle.
- **The Phisher** — pays absurdly well and carries a Seizure Magnet and a Reputation Dark Cloud; a deliberate trap for experts, designed so the player who has learned to read revenue will take it.
- **The Bandwidth Hog** — bought a "1Gbps unmetered" port and actually uses 1Gbps, which your entire pricing model assumed nobody would; the reason "unmetered" is a game mechanic. (+1 var)
- **The Bargain Hunter Tenant** — wants your cheapest rack space, will leave for $5, and generates disproportionate support load; the colo expression of LowEnd Larry.
- **The Colo Tenant (another hosting company)** — signs 3–5 year terms and is extremely sticky because moving racks is agony, but you inherit their bad habits, their outage becomes your building's story, and they compete with you retail.
- **The Financial Firm (exchange colo)** — pays absurdly for microseconds and demands documented fairness guarantees like equal cable lengths; the only tenant for whom your cable management is a contractual term.
- **The Healthcare Practice (HIPAA) / The Compliance Customer** — small MRR at 4× price with zero churn, but requires evidence, audits and controls and will terminate the entire contract on a single finding. (+2 var)
- **The Fintech Startup** — tiny traffic, enormous money and terrifying demands — SOC 2, PCI, sub-10ms and a call with your compliance officer — and it unlocks the compliance-tier buildables it demands mid-level.
- **The Game Community Admin / The Clan or Guild** — a 19-year-old running a $12 server for 200 friends with one payer; churns for a free month, but their community follows them in a single Discord message. (+3 var)
- **The Modded-Server Owner** — high resource use, high support, high loyalty and hard evangelism: the customer sitting at the top of both the cost-to-serve and referral-coefficient columns simultaneously.
- **The Streamer / Influencer (as a client)** — pays little or nothing and generates enormous signup flow; a prestige client whose value is a demand multiplier and who leaves instantly for a better sponsorship deal.
- **The Broadcaster (video)** — enormous bursts, hostile to your 95th-percentile transit bill, entirely event-driven, and capable of compressing their whole year into four nights. (+2 var)
- **The AI Startup (GPU)** — needs 64 H100s yesterday, has funding and zero ops experience, will `pip install` at an NCCL misconfiguration and then blame your fabric; six weeks later needs 1,000 GPUs or zero. (+3 var)
- **The AI Lab / Research Lab (HPC & GPU)** — books 18 months of capacity, changes requirements monthly and makes you turn everyone else away; the grant-funded variant buys in a burst at fiscal year end and returns exactly a year later. (+4 var)
- **The Grant-Funded Lab (revenue with a published expiry)** — an excellent customer funded by a grant with a known end date, so you watch the revenue cliff on your calendar for two years and must replace it before it lands.
- **The Backup Customer** — buys terabytes, grows monotonically because data only increases, and never leaves because egress is the moat; the best customer in the game, the most boring, and the living argument for data gravity. (+2 var)
- **The Migration-In Refugee** — fleeing a competitor's outage with high intent and low trust; they arrive in bursts after a rival's incident and will flee you exactly as fast as they fled them.
- **The Agent / Master Agency** — brings real qualified demand representing a customer rather than themselves, costs 10–20% of MRC as a residual for the life of the contract, owns the relationship, and shops you against three rivals.
- **The ISV / OEM Embedder** — a software vendor hosting all their customers on you and never mentioning your name: enormous single-invoice low-touch revenue, zero brand benefit, and the whole block gone in one notice period.
- **The Credit-Risk Startup** — a great logo with real usage, six months of runway and a twelve-month contract; require prepayment, a personal guarantee, a deposit, a credit limit with auto-suspend, or take the risk.
- **The Ex-Customer** — cheaper to re-acquire than a cold lead, but only if you actually fixed the reason they left; emailing them is nearly free and converts a few percent, or generates fresh reputation damage. (+1 var)
- **The Migration-Out (the customer leaving who still needs you)** — has given notice, still pays, files more tickets than ever and saturates your egress; helping enthusiastically, helping minimally or charging for retrieval is the most reputation-relevant billing choice in hosting.
- **The Bimodal Customer** — one account with two totally different traffic shapes — a cacheable storefront and a brutal admin panel, latency-bound players and bandwidth-bound patches — so isolating a customer from themselves becomes an architecture decision.
- **The Off-Peak Customer (selling the shape of your own valley)** — discounted capacity sold only outside your peak to batch, backup, render and crypto buyers; the best margin improvement available, and it fills the headroom that absorbed surprises.
- **The Customer's Customer Sentiment (two layers of anger)** — their end users complain to them and they complain to you, amplified and distorted at each hop; a shared status page reveals the real number, which is sometimes lower than claimed.
- **The Compliance-Driven Buyer** — arrives because a rule in their industry changed, not because of features or price; the whole segment appears at once on a deadline and disappears once everyone has moved.
- **The Silent Majority** — 80% of your base never files a ticket, answers a survey or appears in any qualitative signal, so every conclusion you draw from feedback comes from the loud 20%.
- **Payment temperament (a customer stat)** — card-on-file pays and churns instantly, net-30 SMB lags and complains, net-90 government is cash-toxic and churn-proof, and the invoice-disputer pays 80% and fights the rest.
- **The credit voucher (the VC-credits startup)** — arrives on a cloud-credits deal burning none of your money for months, scaling wildly on someone else's budget, then converting at list price or churning the day the credits end.
- **Design partners** — loud demands and generous patience, contractually bound and churning only on public failure; serving one through its launch grants a permanent "first customer" aura for the whole category.
- **Litigation, not churn** — some clients sue rather than leave, triggering a cash-freezing lawsuit wave; the tell is a prospect who loves compliance language, and it is the one time the ToS tower visibly earns its upkeep.
- **The Legacy Loyalist ("Grandpa Tenant")** — paying $4.95/month since 2009 for a Pentium 4, never filing a ticket, whose hardware will fail in a way that costs more to replace than their entire lifetime value. (+2 var)
- **The Undercover John** — a customer who is actually law enforcement: never churns, just watches, indistinguishable by any visible stat; ejecting them heats raid odds and tolerating them raises raid severity.
- **The Goodwill Tenant (cause célèbre)** — a nonprofit, library or dissident press at zero or 90% discount, granting a global attraction buff and a social-cost shield — and becoming a liability in regulated or offshore levels. (+1 var)
- **The Student / The Nonprofit-Education tier** — broke, converting to reputation rather than cash at low staff load, and years later some of those students become enterprise buyers who grew up on you.
- **The Self-Hoster** — arrives, looks around at your magnificent infrastructure, sneers and leaves; a joke archetype where watching one convert unlocks a free delight bonus and an angry exit costs a churn penalty.
- **The Persona Zoo (the named cast)** — the archetype table cast as sprites, one silhouette per business archetype mapping a want to a buildable, so the end-of-level scoreboard is about people rather than segments. (+1 var)
- **The Legacy Migrant** — an enterprise refugee dragging a 1988 AS/400 or FoxPro app that pays 20× MRR and demands a shrine box that cannot be patched, migrated or replaced; the contract outlives your company.

## 3.6 Attraction and acquisition channels

- **Demand Mix (marketing as creep-wave composition)** — each channel produces a different archetype mix, so funding channels chooses which enemies, abuse levels and ticket loads you fight. (+4 var)
- **The SEO Garden / Organic Search Road** — a plot of content plants: 3 months to full yield, decays 6%/month untended, damaged −1 health per 15 min of crawler 5xx; brand traffic is the only insurance against a Core Update.
- **The Ad Spend Dial / Paid Search Highway / The Beacon** — a lighthouse beam that spawns visitors where it sweeps; instant, linear, stops with spend, and CPC rises as rival beacons dim your reach.
- **The Banner Ad Kite (cheap/spammy marketing)** — a tacky kite bringing a wider, greyer stream: high volume, low patience, high bounce; channel quality visible in the crowd's colour.
- **Content Drops / The Content Engine** — hire writers for a ~6-month lag then a permanent free tap, bumping spawn rate in a chosen archetype. (+1 var)
- **The Page Speed Score** — one visible 0–100 number from your real latency budget that multiplies both conversion and organic spawn rate.
- **The Status Page (honesty as a resource)** — publishing in 5 min cuts reputation damage 60% and tickets 70%; hiding and being caught doubles it, over-publishing suppresses signups ~8%, and missing your own stated update cadence costs more than the outage.
- **The Speed Badge / Uptime Badge** — hold p95 or 99.9% for a period to earn a public badge that raises conversion and client tier, and makes you contractually liable.
- **Uptime History** — a public track record enterprise units check, which is how early-level failures keep mattering in late levels.
- **Latency as a Product (publish your numbers)** — a looking glass and global latency table; in game and finance colo being 12ms closer is the entire pitch, but published numbers invite disproof.
- **Benchmark Publication** — publish performance figures and developers arrive alongside people trying to disprove them; a channel with a built-in adversary.
- **Referral Program / Word-of-Mouth Footpaths** — $50 bounties buy the cheapest CAC and highest-LTV traffic; flows segment-locally, so niches compound and generalists don't, drawn as gold threads that grey out when unhappy.
- **Affiliate / Review-Site Pipeline** — $100–200 CPA, deal-seeker quality, 45–90 day clawbacks, and purchasable "top 10" placement; a grey channel, not a black one.
- **Review Aggregators** — paid placement with reputation-dependent ranking, where a third party holds your position and delisting is the threat.
- **The Review Wall** — star cards flipping in beside the front door, gold for five and ash for one; arriving visitors glance at it. (+3 var)
- **The Deal-Forum Chute** — a 70%-off post fills capacity instantly with your worst customers, and is reputation-gated so only a good host can misuse it.
- **Partner / Reseller / Agency Channel** — cheap volume at a 20–40% margin share; they own the relationship, you inherit their customers' problems, and churn is invisible until it lands.
- **Brokers (colo / wholesale)** — 3–6% of first-year contract value for tenants you'd never meet; a one-off fee rather than the agent's permanent residual leak.
- **Registrar Cross-Sell** — break-even domains as near-zero-CAC hosting leads, and customers whose domain sits with you churn far less.
- **Community Presence / Open Source Karma** — sponsorship, meetups and upstream engineering time buy developer traffic, patch access and hiring — and one bad incident destroys it.
- **Dogfooding / Open Source Release** — releasing your tooling buys engineer mindshare, doubles as a hiring channel, and multiplies every other developer-facing channel.
- **Content & Tooling Magnets** — free speed tests, DNS, status pages and a good blog: a permanent low-rate tap with forever upkeep you cannot switch off cheaply.
- **The Community / Forum (your own)** — free support labour that cuts tickets and raises retention, but is itself a target for spam, defacement and drama. (+1 var)
- **Sponsorships (streamers, podcasts, open-source projects)** — dominant for game hosting and dev products; lumpy, personality-driven, and a competitor can simply outbid you for your own channel.
- **Outbound Sales** — a rep dialling: expensive per meeting, enterprise and colo only, long lag between spend and revenue, a cash-flow trap for the impatient. (+1 var)
- **The Conference Booth** — spend $40k, get 12 leads, 2 close in 9 months; a deployable that also pulls your best staff away from the NOC. (+1 var)
- **Migration Assistance / The Migration Concierge** — "we'll move you free" converts a rival's customers, best timed to their outage; opens a refugee road and angers the Competitor AI. (+3 var)
- **The Competitor's Outage (a free lane that opens by itself)** — a lane that appears when a rival has a bad day; readiness spend catches it, and it is the purest reward for headroom.
- **The Repatriation Wave** — late-campaign event of workloads coming back from big cloud; technically sophisticated, spreadsheet-led, won by migration engineering not sales.
- **PR / Post-Mortem Publishing** — a genuinely good incident write-up opens a small high-quality lane; a well-handled outage can gain you customers.
- **Free Backups / Free SSL / Free Staging** — upkeep-costing features that massively cut churn; retention beats acquisition on cost.
- **The Free Tier** — costs COGS rather than marketing budget, converts at 1–3%, requires abuse controls first, and rewards serving non-payers fast. (+4 var)
- **Localization / Regional PoP** — cuts latency for a region and directly raises conversion there; the only acquisition build that is also a defense build.
- **Marketplace Listing** — steady visitors for a 15–25% platform cut; a "recommended provider" slot is hosting's best channel and its most fragile.
- **The Listing (the generic case)** — appearing in any public directory raises visitors and makes you discoverable to attackers; more capability, more surface.
- **Niche Positioning / The Niche Play** — narrows the funnel while raising conversion, ARPU, referrals, price tolerance and defensibility, and lowers support cost via a homogeneous stack.
- **Geographic Positioning** — "servers in Ohio, support in Ohio"; being the local host is a durable moat a small operator can actually dig.
- **Peering at an IX** — each peer cuts latency for that network free and cuts transit cost; peering relationships are friendship stats, and network gravity attracts tenants.
- **IPv6 Support** — reaches cohorts IPv4-only misses and relieves address cost, but publishing AAAA can make a broken-IPv6 cohort slower.
- **Green / Renewable Power Certification** — a reputation modifier tied to real PUE and power contracts; wins a segment that will not consider you without it.
- **Certifications as a Lead Magnet** — SOC 2 / PCI / HIPAA / FedRAMP don't generate leads, they unblock a queue that was already waiting behind a gate.
- **Case Study with a Whale / The Anchor Tenant** — permission to use a famous logo raises the conversion rate of every future Evaluator; a logo is a stat.
- **Promo Codes / Black Friday / Seasonal Promo** — a temporary 5× lane at destroyed margins that churns at renewal; a sugar rush with a 12-month time bomb.
- **Acquisition (buy the lane)** — buy a competitor's customers outright: instant volume, integration pain, and a predictable attrition tax for the ownership change.
- **The Price Tag (attraction by price)** — always works, always the worst tool; cuts raise spawn and lower value, attract hobbyists and hogs, and cannot be reversed without churn. (+3 var)
- **The Front Door and The Sign** — the storefront's condition is your sales funnel, and the marquee's bolted-on sub-signs are your visible product line-up.
- **The Front-Page Geyser** — a viral hit as a vertical geyser from one map-edge point with a decaying height curve you can read before the numbers.
- **Attraction towers (towers that spawn your resources)** — buildings whose output is inbound units; capped by upkeep and a quality filter that makes marketing over a broken stack negative ROI.
- **LTV:CAC as the live scoreboard** — a live HUD ratio per segment, with a post-level feed naming every customer acquired for $40 with an LTV of $30.
- **Qualified traffic and interception** — units carry graded intent (blog reader cold, comparison-page hot, pricing repeater buying now); chat popups and exit offers intercept before they bounce.
- **Local payment rails (regional access keys)** — iDEAL, SEPA, PIX, UPI, Boleto, vouchers, crypto; without the rail those units cannot convert at all, and each has its own dispute economics.
- **The attraction action list (the "pull" half as verbs)** — campaign, price cut, feature unlock, uptime badge, outage credits, status page, review ad, sponsorship, HN post — each on a cooldown. (+3 var)
- **Attraction by hosting type** — per-line attraction stats: SEO for web, DDoS badge for game, carrier density and engineer word-of-mouth for colo, deliverability for email, verified restore time for DR, sheer availability for GPU.

## 3.7 Conversion, churn, and retention

- **The Funnel Lane** — Landing→Pricing→Cart→Payment→Provisioned→Onboarded→Renewed as a narrowing chute with drop-through grates showing where losses fall. (+4 var)
- **Onboarding as a funnel with its own bounce rate** — account created → payment verified → DNS pointed → data migrated → first use → first invoice, each with its own drop-off and its own fix.
- **The Onboarding Gauntlet** — customers not live within 7 days churn ~5×; new accounts render as pale outlines that fill in as they deploy. (+6 var)
- **The Grudge Meter** — incidents accumulate grudge that decays with good service; three small outages hurt more than one honest big one, and only a real fix reduces it across all customers. (+3 var)
- **Health Scoring / Churn Radar** — a buildable aura derived from usage trend, ticket sentiment, login frequency and payment history; the prerequisite for any save offer working. (+3 var)
- **Save Offers (and the ladder that makes them a real calculation)** — preference order pause > downgrade > add value > term extension > months free > permanent discount; each save cuts ARPU, raises expectations, and zeroes referral value. (+2 var)
- **The Exit Survey / Exit Interview** — churned customers state why, feeding a diagnostic panel that literally names the next tower to build.
- **The Win-Loss Review (the acquisition half of the exit survey)** — spend a hand after a lost deal to learn why; the accumulated loss-reason chart tells you what to build.
- **The Churn Taxonomy (five kinds, tracked separately)** — dissatisfied, outgrown, involuntary, mortality (~1%/mo, unfixable floor) and displacement, each with a different counter and cost.
- **Silent Churn (the client who stops growing)** — they don't leave, they stop expanding; revenue flatlines and only a usage-trend buildable sees it. (+1 var)
- **Involuntary Churn / Dunning** — expired cards lose money for no reason; fixed by retry schedules, pre-expiry notices, card updaters and a grace period. (+2 var)
- **Contagious Churn / The Word of Mouth Graph** — a churned client bumps churn probability for same-segment neighbours; high multiplier for game, dev and niche, near zero for anonymous shared. (+3 var)
- **Contract Lock-in** — long terms cut churn but change the shape of anger: angry customers stay and get loud, so reputation damage rises instead of falling.
- **The Contract Term Ladder** — monthly vs annual vs multi-year alters cash timing, churn and repricing freedom; colo's 5-year 3%/yr escalator locks you out of an upward market.
- **NPS Ticker** — promoters spawn word-of-mouth visitors and detractors spawn reputation threats; surveying too often reminds unhappy customers they are unhappy. (+1 var)
- **The Renewal Wave and the Renewal Calendar** — each cohort reprices twelve months of your behaviour at once; a HUD calendar showing "47 accounts, $12,400 MRR in 3 weeks" makes retention proactive. (+5 var)
- **The renewal beat** — ⚔️ one synchronised global pulse that makes revenue a felt heartbeat, vs cohort-staggered rolling renewals that resist timing exploits.
- **Win-Back Campaigns** — churned customers are a cheap lead list converting a few percent, but only if you fixed the reason they left; angry ones generate fresh damage. (+1 var)
- **Annual Prepay Push** — two months free buys cash and retention, creates deferred-revenue liability, lowers total revenue, and delays your churn signal by up to a year. (+1 var)
- **Data Gravity as a retention mechanic** — churn resistance that grows with stored data, until Lock-In Awareness crosses a threshold and the customer architects away and leaves loudly.
- **Domain stickiness** — owning the customer's domain makes them ~3× less likely to leave; underpriced product whose real value is retention glue.
- **Proactive Notification** — telling customers before they notice cuts both churn and tickets; one of the few strictly-positive actions, costing attention not money.
- **QBR (Quarterly Business Review)** — spend account-manager time on a whale to cut churn and surface expansion; makes account management a headcount decision.
- **The Expansion Trigger Library** — detectable gold-pip conditions: 80% of a limit, a second site, a teammate invited, a spike survived, an outage handled well, a rival's price rise.
- **The Upsell Ladder and Cross-Sell** — backups→SSL→dedicated IP→managed→DDoS→bigger plan at near-zero CAC, and shared→VPS→dedicated→colo as the ten-year graduation ladder. (+3 var)
- **Negative Churn as a Win Condition** — expansion exceeding churned revenue puts net retention above 100%, so the business grows while acquiring nothing. (+1 var)
- **The Reference Ladder** — logo → quote → case study → reference call → conference speaker, each gated by satisfaction and tenure; asking too often burns goodwill. (+1 var)
- **Free Migration Service (as a retention *and* acquisition tool)** — the highest-leverage offer in hosting; costs staff hours, moves the immovable, and counters a rival running it on you.
- **Fire the Customer** — proactively terminate a negative-margin or abuse-generating account: a small immediate hit for a long-term gain.
- **The Churn Walk (presentation)** — boxes packed, racks greying, logo peeling, reversible until the truck leaves; angry leavers spray a 1-star that accumulates and occludes your window. (+3 var)
- **Cohorts as pattern (not colour)** — acquisition channel encoded as a fill pattern on the livery band (solid organic, hatch paid, dotted referral, cross-hatch affiliate) so a channel's drain is watchable.
- **Satisfaction as posture** — happy clients stand tall and glow, unhappy ones slouch and emit ticket-paper; posture reads at 12px where numbers don't.
- **Customers sit down in your building** — converts take desks so the office fills as MRR grows, whales at four desks; mass churn renders as a room emptying. (+5 var)
- **The Logo Wall** — marquee logos mounted in the lobby as long-arc progress; losing one leaves a clean rectangle, a brutal silent churn signal.
- **The SLA Credit Coin** — a missed SLA sends a gold coin flying back out to the customer's card; money moving backward is always drawn as reverse motion.
- **Reputation Weather** — reputation as the sky over your facility (clear, overcast, smog, storm), shifting the whole scene's colour temperature.
- **Churn Vultures** — rival hosts circle an unhappy customer, and a poached exit is a double loss, which is what gives At-Risk Windows their deadline. (+2 var)
- **Tenure badges and loyalty tiers** — grey→bronze→gold→legendary; tenure cuts churn and adds passive defense, and losing a founding customer leaves a permanent attraction scar. (+1 var)
- **Grandfathering and the COLA decision** — a periodic price-increase event: +X% now against a three-month churn spike, or grandfather legacy plans as a slow leak with a loyalty aura.

## 3.8 Segmentation and positioning

- **The Positioning Dial** — Cheapest / Fastest / Most Supported / Most Compliant / Most Niche, each setting the archetype mix, threat mix, support cost and which lines it locks; changeable at real cost.
- **Vertical Compliance Moat** — certifications gate whole customer classes; huge capex, but those customers never churn and don't shop on price.
- **Revenue diversification as an explicit goal** — a Concentration Warning above 30% of MRR from one client, channel or line, plus a diversification objective after your first whale loss. (+1 var)
- **Customer-mix correlation as a strategy** — each card carries a peak-correlation profile; capacity must cover the sum of peaks, so anti-correlated customers are worth more per dollar.
- **The Niche compounds, the generalist doesn't** — segment-local referral makes a niche word-of-mouth lane grow densely while a generalist's referrals scatter and evaporate.
- **Declining demand as positioning** — turning people away moves you sideways on reputation: you lose "available" and gain "exclusive", which some archetypes prefer.
- **The Controlled Shrink (positioning by subtraction)** — deliberately closing a line, region or segment should sometimes be a winning move scored as strategy, not retreat.
- **Long Tail vs the Head (portfolio management)** — tail-heavy shared hosting vs head-heavy regulated; concentration risk against the overhead of diversity, and the threat mix decides which survives. (+3 var)
- **The compliance record is permanent (campaign memory with teeth)** — one violation anywhere in the save and that whale-class visitor is gone from the save forever, not penalised.

## 3.9 The client (tenant) system

- **Clients are Spawners** — each client is a visitor factory with its own traffic, enemies, tickets, abuse risk, growth curve and peak-correlation profile. (+2 var)
- **Client Cards (the game's best recurring choice)** — offer three, take one, allow a pass; MRR, appetite, threat draw, support burden, churn risk, plus term, escalator, commit, payment terms, sophistication, change rate and contribution margin.
- **The Client Interview** — spend to reveal hidden card stats before signing; information as a purchasable good, shown as hairline strokes becoming heavy.
- **The Qualification Step (the pre-sale version)** — a small spend revealing whether a prospect has budget, timeline and access to the technical buyer; the only counter to Column-Fodder.
- **SLA Contracts (per client) — and the Contract Clause Library** — higher MRR for credit caps, claim windows, maintenance exclusions and the three-breaches exit right, where the real risk lives. (+2 var)
- **The Upsell Moment** — a gold pip pops when a happy client nears a resource ceiling; a 30-second whack-a-mole that rewards watching your board.
- **Noisy Tenant Isolation** — cheap shared tenancy at higher margin with interference, or expensive isolation with a contained blast radius; revisited every tier.
- **The Sacrifice Decision** — deliberately drop a client's traffic to save the rest; promoted from panic button to peacetime Shed Ladder policy, with the portrait sent to the Wall of Ghosts.
- **Client Growth** — successful clients compound 3–8% per in-game month with step changes; whether that growth is windfall or wound depends on how you priced them.
- **The Reseller (client card)** — one card that is secretly fifty clients, with hidden support burden and inherited abuse risk; if they vanish you inherit their angry customers. (+5 var)
- **Whale Management (four concrete verbs)** — multi-thread the relationship, structure the contract into a slope, dilute with volume, or cap by declining their expansion revenue. (+2 var)
- **Firing a customer** — unlocked by cost-to-serve analytics; a legal, sometimes-correct move that should feel awful.
- **Repricing them so they fire themselves (the third option)** — the quiet realistic middle path: reprice at renewal and either the economics fix themselves or the customer leaves without a review.
- **The Deposit and the Credit Limit** — per-customer credit limits, auto-suspend thresholds and 1–2 months refundable deposits; requiring one loses ~15% of deals and most bad debt.
- **The Controlled Shrink** — deliberately closing a product line, region or segment, with a scoring path that rewards it.
- **Customer hostages (the live compliance dilemma)** — during a raid, paying customers are held mid-path with patience draining while you choose service versus compliance.

## 3.10 Support and tickets as a visitor-facing system

- **The attention budget** — support spends hands, not money; the scarcest resource and the one that cannot be bought instantly, attacked by a different threat class than capacity. (+4 var)
- **First response time as a conversion stat** — 30-second pre-sales chat converts ~3×, a 30-minute ticket reply prevents a churn two months out; the same hand is both towers.
- **Support-experience churn (the delayed fuse)** — a ticket ignored for three days churns the account two months later, with no visible link unless you built the analytics.
- **Tier-1 deflection and the self-service tower** — KB, status page, rescue mode, control panel and forum each deflect a share; deflection is the only way support scales, and stale articles backfire. (+1 var)
- **The escalation path** — Tier 1 → Tier 2 → engineering, where a ticket costs a buildable's worth of progress; support load as opportunity cost, not tax.
- **The ticket avalanche** — volume scales with affected customers × inverse sophistication × warning given; only proactive notice and a subscribed status page cut the slope. (+3 var)
- **The Concierge (support made visible)** — staff sprites intercept unhappy visitors before the exit, walk them back and restore patience; retention you can watch and root for.
- **The Ticket Paper Grammar** — physical slips encoding sentiment as colour, value as size, age as corner fold, SLA breach as a red stamp, parent incident as a paperclip.
- **The customer who files better tickets than your staff** — a Sophistication stat that lowers cost-to-serve and occasionally hands you free incident detection; turning a complainer into a sensor.
- **The self-inflicted ticket class** — lockouts, deleted sudo users, cron-filled disks; solvable only with console/IPMI, and automatable into a self-service rescue tower.
- **The ticket persona roster** — Panic Seller distorts triage, Log Dumper drops intel, CEO-Caller escalates over your head, Works-On-My-Machine baits wrong repairs, Night-Before asks at 22:47.
- **The Support-Ticket Trojan** — recon disguised as a plausible credential-reset ticket; reading it costs attention, acting on it plants a webshell wearing your badge.
- **First-response clocks (support tiers as a product)** — Bronze email 2 days, Silver chat 4 hours, Gold phone 30 minutes; charging is MRR, staffing the promise is the capacity puzzle.

## 3.11 The sales pipeline and the deal

- **The lead decay timer** — a visible countdown per lead: contacted in 5 minutes converts many times better than at 24 hours, making sales an urgency problem.
- **The Sales Pipeline Rail** — prospects ride lead → qualified → quote → signed as HUD stations, and a stalled deal sits and visibly dims.
- **The RFP Fax** — enterprise leads arrive as a fax printing line by line; reskins as a tender alert or procurement-portal notification in later eras. (+3 var)
- **Qualification (and the cost of skipping it)** — a small spend revealing budget, timeline and technical-buyer access; skipping is fast and occasionally correct, which makes it a decision.
- **The security questionnaire as a gate** — 340 rows in 10 days: honest answers lose deals, aspirational ones win the deal and create a dated obligation.
- **Compliance attestation as a gate-opener** — SOC 2 / PCI / HIPAA / FedRAMP unblock a queued backlog rather than generating leads, making attestation timing strategic.
- **The Procurement Portal (the delay nobody expects)** — supplier onboarding (tax forms, insurance certs, banking callback, portal account) adds 30–60 days between won and first invoice. (+1 var)
- **Channel Conflict and Deal Registration** — direct sales, resellers and affiliates reaching the same prospect; a deal-registration policy costs margin and keeps the channel loyal.
- **The residual commission leak** — agent-sourced deals pay 10–20% of MRC forever including renewals, so agent revenue should render as a different colour of money.
- **The broker's cut** — 3–6% of first-year value, one-off, for tenants you'd never meet; the expensive channel is the only one reaching that class of deal.
- **The buy-out play** — pay a prospect's early-termination fee to convert an Incumbent-Locked Lead now, at a known cash cost; the highest-leverage competitive tactic.
- **The credit decision** — prepayment, personal guarantee, deposit, credit limit with auto-suspend, or nothing; a deposit loses ~15% of deals and most bad debt.
- **The ramp and the commit** — a signed contract isn't revenue: the ramp schedule says when money starts, the commit says what they pay regardless of usage.
- **The win-loss loop** — a purchasable post-mortem per lost deal, accumulating into a loss-reason chart that tells you what to build next.
- **The poached pilot (competitive free-migration pilots)** — rivals offer your enterprise accounts free 60-day migration pilots; an approaching wave with a countdown, not a renewal dice roll.

## 3.12 The visual grammar of visitors, clients, and the front of house

- **Visitors Are Light; Threats Are Mass** — good approaches are luminous, cool, weightless and smoothly arced; bad ones opaque, warm, heavy and jittering, separable with colour muted. (+1 var)
- **The Costume Kit (the spec behind "one shape, many costumes")** — five slots: Hull (duration class), Livery (hosting line), Prop (archetype), Ring (patience), Tag (one floating datum). (+2 var)
- **Value as Ornament, not size or glow** — each value tier adds an embellishment (rim, second rim, corner notch, crown notch) so a whale reads decorated at 8px and in greyscale. (+2 var)
- **The Patience Ring, with a three-stage LOD** — full ring close up, three-state colour-plus-notch at mid zoom, stream colour temperature and velocity at crowd density. (+1 var)
- **Patience as a visual channel** — ⚔️ redundant always-on channels for one stat, vs one composite status chip, vs a strict one always-on + one aggregate + one cinematic budget.
- **The Trail = Latency** — trail length equals accumulated round-trip, so a healthy platform sparks and a struggling one smears; the field's smear is your latency graph. (+6 var)
- **The Bounce (a universal six-frame animation)** — grey, stop, rotate 180°, accelerate away, pop into three fragments with a negative-gold puff; identical in every level.
- **The Bounce Cause Tag** — a 12px glyph on the puff (clock, shield, broken page, padlock-slash, price tag, checklist, spinner) shared with the Sankey and the live strip. (+2 var)
- **The Bounce Heatmap and its decay** — bounce marks persist ~60s and accumulate into path scorch that fades over minutes; the same signed shader as repeat-visitor paving.
- **The Convert (and the hard spec that keeps it from becoming noise)** — one white frame, a gold spark, and a forward exit; capped at 0.4s, 12px, rate-limited sound, and never confetti.
- **The Happiness Halo** — served visitors leave a ring that accumulates on the service that served them, making well-loved services visibly brighter over time.
- **The false-positive flash, reinforced** — amber piles up under the offending defense, a live false-positive counter sits on its faceplate, and an unpleasant audio cue fires.
- **Crowd density as a particle field (four bands with hysteresis)** — discrete <150, clustered 150–1,000, ribbon 1,000–20,000, aggregate >20,000, with ±15% hysteresis at each boundary. (+1 var)
- **The Path Preview Ribbon** — hold a key to draw the route a visitor would take now, with per-hop time chips and dead ends glowing red at the break.
- **The Lookalike Test** — some visitors and threats share silhouettes and differ only in a small tell, so the player's eye upgrades alongside the tech tree. (+1 var)
- **Glance Animations** — a 0.3s head-turn toward the uptime board, a price tag, a queue, a rival billboard or another bouncing visitor; word-of-mouth rendered without a system.
- **The Doorstep** — a threshold strip where visitors pause ~0.4s over a trust-signal checklist, then walk on or turn; turning at the door is a different diagnosis from bouncing at the app.
- **The Waiting Room** — queued visitors in a visible antechamber: good backpressure means they sit and read, bad means they pace and leave; p99 as body language. (+2 var)
- **The Turnstile** — rate limits and admission control drawn as counting turnstiles, showing the good crowd flowing while a herd backs up behind.
- **The Party Chain** — tethered party members occupying slots as a unit; a 5-party against 3 slots visibly fails to fit and rebounds. (+1 var)
- **The Entourage (whales and delegations)** — high-value units orbited by satellites, delegations as three to five props on one slow base, each with its own satisfaction pip.
- **The Arrival Metronome** — a 60-second tick strip whose silhouette fingerprints the hosting line: DNS a grey blur, games an evening ramp, backup one block at 01:00, colo one huge tick a quarter.
- **The Convoy and the Window Band** — a translucent timeline band for the backup window that physically cuts unfinished crates off at its trailing edge with a red seal.
- **The Red Case (the restore)** — one courier, red hard case, taxi meter running, everything else dimming; the case opens full or empty.
- **The Blueprint Visitor** — a deployment unrolls its blueprint at the control plane and the board physically rearranges, wrongly if the manifest is bad.
- **The Customer Portrait System** — paperdoll busts with one garment, one prop and a cohort tint; Raj's portrait contains smaller portraits, Wendy's card doesn't fit the tray.
- **The Contract Card** — a physical card per client: logo, MRR, SLA stripe, health glow, confidence-weighted micro-bars; churn curls and burns a corner, renewal stamps a date.
- **The Wall of Mirrors (customer-eye previews at scale)** — a 4/9/16-tile monitor wall of per-tenant previews that go red when that customer's experience breaks.
- **The Empty Server Spiral, drawn** — each shard's faceplate shows a crowd that thins, and arriving players glance at it and turn away; the fix is visibly to seed the server.
- **The Busy Wall (capacity, universal)** — the modem bank generalised to ports, slots, cabinets, GPUs and licence seats: the last light means callers turn away at the door.
- **The Front Door, the Sign, the Billboard, the Kite** — marketing as physical objects: door condition is the funnel, the sign is your line-up, the billboard is ad spend, the kite is cheap traffic.
- **The Beacon and the competing beacons** — a lighthouse spawning visitors where its beam lands, with visible fuel draw and rival beams overlapping to dim your reach.
- **The Front-Page Geyser** — a viral spike as a vertical geyser with a decaying height curve you can read before the numbers report it.
- **The Dandelion and the referral web** — happy visitors puff seeds that return later, or trail gold threads that become new spawn points and grey out when unhappy.
- **The Review Wall and the Uptime Trophy Wall** — flipping star cards and a 90-pip uptime board printed daily by a staff sprite, so publishing a bad day is a visible act.
- **The Status Page Beacon** — a green/amber/red lamp on your building; lighting it honestly during an incident calms the social-media flock and slows churn.
- **The Logo Wall and the clean rectangle** — marquee logos in the lobby as long-arc progress, and a clean rectangle where a lost one used to hang.
- **The SLA Credit Coin** — a gold coin flying out of your revenue gutter back to the customer's card, because money moving backward is always reverse motion.
- **The Churn Ledger Draft** — a departing customer's lane thins over several seconds like a tap closing; the fade is more legible, and sadder, than a hard stop.
- **The 1-star on the window** — an angry leaver sprays a star that passing visitors react to; removable at a staff cost, and accumulating stars occlude the window entirely.
- **Reputation Weather** — reputation as the sky (clear, overcast, smog, storm), always in frame from Tier 2 and shifting the whole scene's colour temperature. (+1 var)
- **The Sales Pipeline Rail and the RFP Fax** — deals ride stations and dim when stalled; enterprise leads arrive as a fax printing line by line.
- **The Tour Rail and the verdict photograph** — a 90-second shoulder-cam with no free-roam, a filling verdict strip, and a post-tour photograph of the moment they saw the bad thing.
- **Lag as frame-rate** — a slow-served customer animates at 30 → 12 → 8 → 4 fps and snaps back with a stretch-pop; works on whole zones when a tier drags.
- **The Retransmission Walk** — packet loss as two steps back mid-stride, up to three times before bouncing; separates "slow" from "lossy" without a metric.
- **The Review Comet** — past customers orbit HQ broadcasting stars that magnetise or repel future arrivals; your reputation is made of people you actually served. (+2 var)
- **Churn ghosts and detractor debt** — a departed customer haunts the aisle that lost them, files a ticket per wave, and degrades that asset until a fix or winback exorcises it.
- **Spawn-ring settlements** — customer origins as distant hamlets that bloom and edge closer when you win a segment, and dim under review storms.
- **Tenant clutter tells quality** — happy tenants decorate their pods with plants and string lights while abandoned ones go cobweb-grey; building state as the only meter needed.
- **The pitchfork mob** — angry customers circle the broken service firing red stars; they damage nothing but scare arrivals at the gate until you fix the root asset or ship comms.

---

# Buildables: services and infrastructure — summary

> Source: `master/05-buildables-services-and-infrastructure.md` · 500 idea entries · 394 KB

## 4.1 Design rules for buildables

- **The Three-Column Law** — every buildable states what it gives, what it costs to run and what it lets in; no Friction, Surface or upkeep means it ships as a default instead. (+2 var) ⚔️ absolute law vs a capped ~12-item "hygiene" carve-out.
- **The Build Card** — Capability, Cost, Upkeep, Latency, Friction + red "Opens:" row; wave 2 adds Closes, lead time, blast radius, removal cost. (+2 var)
- **"What does this let me charge for?"** — mandatory tooltip line; if the answer is nothing, it had better be defense.
- **Every buildable is a toy first, a stat block second** — 16px silhouette, load-showing idle, surface markers, placement anim; five artifacts or no ship. (+3 var)
- **Universal visual grammar for buildables** — faceplate, load donut (green≤70/amber/red), port studs with orange hazard chevrons, heat plume, upgrade slots, age plate. (+3 var)
- **Buildable silhouette language — *CONFLICTING*** — a single shape code telling you what an object is from its outline alone. ⚔️ family-by-role shapes (network angular, storage vaulted) vs whom-it-serves (round = visitor-facing, angular = defensive).
- **The Exposure Chevron Count** — the number of lit hazard chevrons on an object *is* its attack-surface score, echoed on its Build Card and in the security overlay; closing a port extinguishes one with a clunk. (+2 var)
- **The Exposure Ring** — every buildable draws a dotted floor ring whose radius and thickness equal the attack surface it adds; exposing it publicly thickens the ring and tints it magenta.
- **The Attack Surface Rose** — inspector radial diagram with one petal per threat class the object is vulnerable to and petal length as severity; stacking a WAF in front visibly clips the petals.
- **The Upkeep Drip** — every object sheds a gold droplet into the money gutter at its upkeep cadence, so a full facility drips constantly; earners like a cross-connect or a leased /24 drip toward you. (+1 var)
- **The Truth/Face Pair Law** — every object has a Face (claim) and a Truth (cabling, restore log, ledger); press F flips it.
- **The Idle Animation Catalogue** — twelve reusable idles (Breathe, Chatter, Seek, Sweep, Meter, Drip, Shuffle, Tend, Settle, Vent, Tick, Sleep) cover ~120 buildables.
- **The Wear Channel Triad** — dust = maintenance debt, heat stain = thermal, hand wear = change debt; one shader.
- **The Faceplate Contract** — four front zones at every zoom, collapsing LED > capacity > ports > label.
- **LED Grammar** — colour plus rhythm gives ~8 states in a 2px dot; amber blink = predicted failure, blue = locate.
- **The Locate Beacon** — list click strobes the blue LED and raises a light column visible at any zoom.
- **U-Height Silhouettes** — 1U pizza box, 2U with drive bays, 4U caddy face, blade chassis and floor tower, so a fleet's character is estimable from its silhouette skyline alone. (+2 var)
- **Armor Snap-Ons and Kitbashed Tiering** — security upgrades physically bolt plating, mesh, antennas and extra PSU bricks onto a chassis, so level 1 and level 10 read like character gear progression. (+1 var)
- **Cable Colour Code** — amber copper, aqua fiber, black/red power A/B, grey OOB, violet cross-connect, white temporary (and it stays white).
- **Cable Physics** — cables sag under their own weight, bundle when parallel, and visibly tension when you drag a device; pulling a still-cabled unit out goes taut and then warns.
- **The Vendor House Styles** — four hardware dialects (Institutional, Budget, Enthusiast, Whitebox); normalizing a mixed rack is tracked.
- **The Golden Image Tint** — standard-image nodes share a palette; drifted nodes render a half-step off, like a stain.
- **Build Ghost** — translucent placement preview with footprint, power/heat figures, red hatching for no-fit or over-circuit.
- **The Build Palette as a Pegboard** — pegboard of painted tool outlines; painted-floor defense radii, fill gauges, one signature firing verb per defense.
- **Starter Loadouts (the "class" objects)** — Lean Static / Dynamic Duo / Fortress Paranoia kits; each opens a different threat lane from click one.
- **The Placement Refusal Icon Set** — eleven 20px icons (no power, thermal, no U, wrong zone, no port, floor load, era-locked, leak zone, suppression conflict, no path, can't afford) drawn on the offending rack.
- **The Rack Elevation as a Buy Screen** — drag builds into U slots on the front-on diagram, with live amp and thermal bars.
- **Construction Animation** — crate → forklift → rails → chassis clunk → cabling → POST beep; 4–8 skippable seconds.
- **Decommission Animation** — gear leaves on a pallet; never hauling it away piles up e-waste debt that blocks the dock.
- **Build time and cold start** — seconds (POST, cache warm) → days (delivery) → weeks (vendor, hires) → months (circuits, audits, permits); teardown fast, rebuild slow.
- **The Surface Budget** — per-build Surface 1–10 totals into a meter weighting the wave generator's threat mix; valves are Decommission, Narrow, Wrap.
- **The Build Role Taxonomy (nine roles)** — every buildable tagged Capacity, Throughput, Latency, Classify, Contain, Detect, Recover, Revenue or Policy, so the palette is decision-ordered rather than encyclopedia-ordered mid-fight.
- **The Platform Chassis** — chassis with power envelope + slots, filled with role modules, re-rolable for a maintenance window.
- **The Instance-Size Slider** — many small nodes (granular failure, more to patch) vs few large (cheaper, bigger blast radius), per purchase.
- **The Two Jobs Rule** — one job well or two at 60%; the cheap all-in-one is correct at Tier 1, a trap at scale.
- **Warm-up and wind-down curves** — builds ramp over weeks (training, IP reputation) and decay unused (runbooks rot, models drift).
- **The Warm Bench** — powered-down racked capacity at ~15% upkeep holding U and a power reservation; Cold 8min → Warm 90s → Hot standby 3s.
- **Headroom as an explicit, purchasable, visible stat** — (capacity − peak-of-last-3-waves)/capacity drawn as a band above the utilization bar; below 25% headroom every incident costs roughly double.
- **The Capacity Reservation (for yourself)** — an explicit visible slice of capacity sales cannot sell, held for failover, burst, migrations and growth; it shows up as an occupancy penalty on the scorecard. ⚔️ directly opposes the Yield Manager's job of selling idle capacity.
- **Policies as a buildable class** — no capex, hands-per-month upkeep, friction on your own org; suspendable for one incident at a cost.
- **The Standard Build (templates with a doctrine bonus)** — save clusters as named templates; 70%+ estate conformance earns −25% MTTR, −30% toil, +1 effective hand and fleet-wide config actions, and every one-off build lowers it. (+3 var)
- **The Dependency Contract** — links declare expected latency, error rate, availability and flag "out of contract" before anything breaks.

## 4.2 Compute and application tier

- **Web Server (the 1U pizza box)** — cheap starter front door; LB in, DB/cache out; opens every web vuln, DDoS target, bad-deploy risk. Two annuli: utilization + worker slots. (+5 var)
- **The Monolith (scale-up server)** — huge single-node capacity, no coordination overhead; high upkeep, SPOF, and unupgradable without downtime.
- **App Server / Worker Pool** — dynamic logic and richer pages; opens deserialization, dependency poisoning, runaway processes, a targetable framework badge.
- **Shared Web Node (control-panel style)** — highest revenue-per-U, highest blast radius; per-account licence fee, oversell dial, panel RCE hits every box, one tenant infects all.
- **VPS / KVM Node (hypervisor)** — density plus isolation at higher ARPU; RAM-bound; opens hypervisor escape, noisy neighbours, overcommit, guest-installed malware. CPU ready time is invisible inside the guest. (+2 var)
- **Dedicated Server** — isolation at premium price, depreciated 36–48 months; empty = pure loss; customer has root, so their mess and their network abuse are yours.
- **Bare-Metal-as-a-Service / Provisioning System (PXE/iPXE/Foreman-alike)** — 3-hour install becomes 8 minutes and an API product; an unauthenticated PXE server can reimage your whole fleet.
- **Container Host / Orchestrator (Kubernetes-alike)** — pools servers, auto-heals, autoscales; opens a whole control plane: etcd quorum loss, CNI packet drops, one bad manifest killing 200 workloads, cert expiry. (+5 var)
- **Hypervisor Host — "The Tray"** — VM tiles draggable between trays; live migration needs shared storage; opens per-socket licence repricing events and total loss on management-plane compromise. (+2 var)
- **Serverless / Edge Function Tier** — instant burst, pay-per-invoke, scale to zero; opens Denial of Wallet, runaway self-invoking recursion, cold-start latency tax.
- **Warm Pool / Chrysalis Pool *(serverless)*** — pre-warmed shells shortening cold starts; you pay idle money for a stutter you only notice by its absence.
- **Worker / Queue Pool** — decouples slow work from the request path; opens silent backlog, poisoned jobs, job loss — a queue backing up is a delayed outage. (+1 var)
- **Cron / Scheduler Node** — runs maintenance, reports, billing, warmups; opens overlapping runs, cron storms, the 00:00 stampede (countered by jitter).
- **Batch / HPC Job Scheduler (Slurm-alike)** — fills idle capacity and enables a spot tier; opens starvation, priority inversion, preemption without checkpointing; fairness policy is monetization. (+1 var)
- **Bare-Metal Build Box / CI Runner** — builds and deploys, sellable as CI; a privileged path — own it and you own every deploy; invites crypto-mining abuse.
- **Staging Environment** — pure cost, ~80% fewer bad-deploy incidents; duplicates everything and is always subtly different, so parity is its own upgrade. (+2 var) ⚔️ mirrors the service; the Lab Rack mirrors hardware — different purchases, both skipped.
- **Connection Pooler (pgbouncer-alike)** — multiplies effective DB capacity near-free; adds a hop, a memory hog and a new SPOF in front of the database.
- **Keepalived / VRRP Floating IP** — cheap HA for a pair; opens split-brain when the heartbeat link itself fails and both claim the VIP.
- **Bare-Metal Beast (GPU box)** — flex object with the biggest heat plume and thickest cable; needs a facility upgrade first; opens thermal limits, silent NaN corruption, driver fragility, hardware theft. (+4 var)
- **FPGA / ASIC Shelf** — era-gated niche for miners and trading tenants; enormous draw, near-zero general utility, a customer base your abuse desk will meet. (+1 var)
- **The Legacy Box You Can't Turn Off** — inherited unit with unknown critical role; earns revenue, fails at the worst time, costs hands to identify before decommissioning.
- **Cell-Based Architecture / Shuffle Sharding** — N independent stack copies so failure hits 1/N; costs N× headroom and change velocity, and the cell-router becomes a new global dependency.
- **The Bulkhead / Resource Pool Partition** — per-dependency pools and queues so one saturating dependency can't eat all capacity; turns a total outage into partial degradation.

## 4.3 Data and storage tier

- **Database Primary (the Vault / "The Drum")** — unlocks accounts, carts, sessions; opens SQLi, connection exhaustion, lock contention, data theft, regulatory scope; SPOF by design. (+5 var)
- **Read Replica** — offloads reads and enables failover; opens replication lag as a correctness bug, silent stop-replicating, split-brain, a second copy to steal. (+2 var)
- **Automatic Failover / Cluster Manager** — cuts MTTR, makes a replica worth having; opens split-brain and flapping; needs fencing/STONITH and a third-domain witness. (+1 var)
- **Cache Layer (Redis / Memcached / Varnish) — "The Coil"** — slashes latency and DB load; opens poisoning, stale-data tickets, 50,000× amplification if exposed, cache stampede on death. Cache Dependency Score >90% = load-bearing. (+4 var)
- **Local Disk** — tier-0 storage; failure is uncorrelated, but it pins workloads to a machine and blocks live migration.
- **RAID Array** — survives one or two disk deaths; the rebuild window is slower, hotter and one failure from total loss, and bigger disks widen it. (+1 var)
- **Erasure-Coded Pool / Erasure Coding Policy** — durability vs usable capacity slider that is literally a data-loss probability; costs CPU and rebuild-network bandwidth.
- **NVMe Cache Tier** — speed multiplier on a storage pool; opens write-cache loss on a power cut unless you buy the capacitor-backed version.
- **Object / Blob Storage — "The Comb Cell Block"** — cheap bulk media, sold by GB-month, paid by egress; opens the public-bucket breach, egress surprises, hotlinking, rebalancing storms. (+4 var)
- **NFS / SAN / Shared Storage** — enables stateless, live-migratable compute; turns N servers into one failure domain, plus D-state stale mounts and IOPS contention. ⚔️ prerequisite for migration vs the game's best SPOF; counter is cells, not avoidance.
- **Search Index / Search Cluster — "The Card Index Whirl"** — site search and the Comparison Shopper; opens index staleness, very expensive queries as an L7 flood target, a second store to secure. (+1 var)
- **Snapshot Layer / Snapshot Scheduler** — cheap rollback against bad deploys and ransomware; eats storage quietly until the volume fills, and snapshots on the same array aren't backups.
- **Immutable / WORM Storage** — undeletable before retention expires, including by root; the ransomware answer, and a GDPR erasure and cost problem because you can't delete it either.
- **Backup System / Backup Vault** — the only ransomware counter, sellable as an add-on; opens backup windows overrunning, untested restores, and read access to everything if online. 3-2-1 pips; restore rate ≠ backup rate. (+7 var)
- **Air-gap doctrine — *CONFLICTING*** — the one thing ransomware cannot walk through, and what it costs you to hold it. ⚔️ five cost models: drawn visual class, free tactical lever, zone seal earning 0 while sealed, one-way data diode, or courier/sneakernet logistics.
- **Hot Site / The Jet Hangar** — full standby estate bought months ahead, upkeep while dark, fires once per level at big cash and consistency cost.
- **Off-Site Replication / DR Site** — async copy with a visible RPO clock and drill events; defeats site-loss fire/flood; costs a second everything plus replication bandwidth.
- **Backup Agent — "The Little Robot"** — sprite that visits each object and carries a copy out; when it can't reach one it stands there and shrugs, marking an unbacked-up thing.
- **Restore Drill / Restore Test Runner / Restore Test Harness** — recurring action costing time and giving no capability; turns an estimated RTO into a measured one and ages a "last verified" counter.
- **Data Warehouse / Analytics Store** — reveals bounce points, mimic threats, unprofitable clients; opens another copy of sensitive data, big storage cost, privacy scope.
- **Log Aggregator / SIEM** — no defense at all, just fog-of-war removal and breach forensics; opens runaway storage, cardinality blowups, and logs full of secrets and PII. (+4 var)
- **Tape Library / Robot — "The Vault Wall + Arm"** — slow, cheap, air-gapped by nature; opens jams, media degradation, courier logistics, and no drive left to read it in five years. (+2 var)
- **Cold Archive Vault (offsite)** — second location, courier and chain-of-custody log; cheapest durable storage, slowest retrieval, and the bill lives in getting data back.
- **Secrets Manager / Vault — "The Safe"** — ends passwords-in-config; becomes a single point of total compromise and nothing starts when it's down. (+4 var)
- **The Read-Only Mode Switch** — one-click degraded state refusing writes and serving reads from replicas; requires the app to have been built for it, so you cannot buy it mid-incident.

## 4.4 Network and edge

- **Reverse Proxy / Edge Tier — "The Mirror" / "The Gatehouse"** — absorbs Slowloris, terminates TLS, caches; becomes the single pass-through, holds your keys, can be made an open proxy. (+4 var)
- **Load Balancer (L4 and L7 as separate builds) — "The Prism"** — health checks and zero-downtime deploys; SPOF until paired, DDoS magnet, and health-check misconfig is a top outage source. Dials: depth, interval, slow-start, outlier ejection. (+5 var)
- **LB Pair (HA)** — double cost, zero added capacity, removes the choke point; VRRP can split-brain, so it wants a witness.
- **Firewall — "The Portcullis"** — blocks ports cleanly at near-zero friction; opens state-table exhaustion under SYN flood, lockout rules, a 4,000-line debt meter, L7 blindness. (+5 var)
- **Switch (top-of-rack) — "The Comb"** — finite ports as a diegetic gate, tunable oversubscription; rack SPOF unless doubled, broadcast storms, a VLAN that bridges two tenants. (+1 var)
- **BPDU Guard / Storm-Control Port Guards** — per-port arming against layer-2 melt; trivially cheap, and the only answer a firewall-only player has to a loop.
- **Core / Aggregation Switch + Router — "The Junction" / "The Roundabout"** — the spine, grown by line cards; opens firmware bugs, non-seamless stack failover, silent TCAM exhaustion.
- **Redundant Pair + VRRP / MLAG** — cheapest HA on the shelf; the heartbeat link is itself breakable, so it trades a SPOF for split-brain.
- **Link Aggregation (LACP) Bond** — capacity and redundancy from one purchase; a bond whose two ends disagree is the loop that starts a broadcast storm.
- **The Witness / Tiebreaker Node** — a vote-only node in a third failure domain fixes two-site quorum; depends on a third party, and placing it inside one site is worse than none.
- **Transit Link / Transit Contract — "The Big Ribbon"** — raw inbound capacity on 95th-percentile billing; you owe the commit unused, and one customer's spike prices your month. (+2 var)
- **Second Transit Provider (multihoming)** — survives an upstream failure only if diverse path; doubles cost, adds routing asymmetry; gated on ASN, portable space, IRR/RPKI, a full-table router. (+3 var)
- **IX / Peering Port — "The Handshake Bridge"** — permanently cuts bandwidth COGS and local latency; opens IX outages, de-peering, route-server misconfig, peering politics. (+3 var)
- **BGP Speaker + RPKI / "The Lighthouse"** — your own routing, unlocking peering, multihoming, anycast; opens leaks, hijacks, self-blackholing, accidental transit between peers.
- **IRR / RPKI Publication and Peering Hygiene** — registry objects, ROAs, a PeeringDB entry; changes nothing on your network, decides whether others accept and peer with you.
- **Anycast Network / Anycast Constellation — "The Tuning Fork"** — one IP everywhere, diluting volumetric load; opens BGP complexity and config mistakes that are global and instant. (+1 var)
- **Traffic Engineering Controller / Anycast Ring** — a road builder steering demand per region between PoPs; costs a globally correct control plane, and its errors are instant everywhere.
- **Anycast Health Withdrawal Controller + Withdrawal Policy** — tunes when a sick PoP stops announcing; opens the withdrawal cascade onto neighbours, countered by a floor plus hysteresis.
- **Private Interconnect / Dark Fiber** — dedicated site-to-site link, drawn premium and braided; you own the capacity and the backhoe risk. (+2 var)
- **Cross-Connect — "The Violet Run"** — per-cable monthly fee that inverts at colo into ~95%-margin recurring revenue and lock-in; opens orphaned cables, tray capacity limits, doc debt. (+3 var)
- **CDN Contract / Edge PoP — "The Star"** — edge caching and DDoS absorption, cutting origin load and transit bill; opens poisoning, origin-IP leaks, third-party bad days, per-PoP jurisdictions. (+4 var)
- **DDoS Scrubbing Service — "The Comb"** — retainer plus per-incident fees, sellable as a premium tier; the detour taxes latency ~25–40ms always, covers Absorb only. (+5 var) ⚔️ on-prem appliance (fast, uplink-capped) vs upstream service (unlimited, permanent detour).
- **Upstream Blackhole Signalling (RTBH) + Flowspec** — BGP community dropping traffic in the upstream's network; granularity is the mechanic (/32 kills one customer, /24 kills 250), 30–120s fuse. (+3 var)
- **Network Segmentation / VLANs — "The Coloured Floor Paint"** — limits lateral movement; cheap in money, paid in future flexibility, and a misconfigured trunk silently joins networks.
- **Microsegmentation — "The Grid Lines"** — a fine grid of tiny gates; expensive and visibly a maintenance burden, taxing every cross-boundary flow. (+4 var)
- **Egress Filtering** — stops your compromised box exfiltrating, mining or attacking others; breaks legitimate outbound things you forgot about. (+2 var)
- **VPN / Bastion / Jump Host / Zero-Trust Access — "The Gatehouse" / "The Tunnel Mouth"** — shrinks admin surface to one door; that door is now total compromise, unpatched, and capacity-limited. (+2 var)
- **Out-of-Band Management (IPMI/iDRAC/iLO) + Console Server — "The Grey Shadow Network"** — remote fix instead of a physical hand; a weak second login surface with atrocious firmware. Wants its own switch and uplink. (+3 var)
- **Out-of-Band LTE/5G Modem (per site)** — turns a truck roll into a click at unstaffed sites; a classic breach path, so it needs default-deny ACLs and one-time pairing. (+2 var)
- **IPv6 Deployment** — cheap addresses and future-proofing; opens a second firewall rule set nobody writes, leaving v6 wide open while v4 is locked. (+1 var)
- **IP Space (owned vs leased)** — owned IPv4 is an appreciating asset; an unused /22 rents for $500–800/mo, but a cheap block inherits its blacklist history. (+2 var)
- **Flow Telemetry (NetFlow / sFlow / IPFIX)** — attributes every bit to customer, prefix and protocol for billing and attack shape; opens storage cost and who-talked-to-whom retention. (+3 var)
- **API Gateway (the toll plaza)** — keys, quotas, schema validation and the billing signal; its key database is an exfil magnet and killing it is silent revenue denial.
- **Network Config Backup + Diff** — nightly export and diff answering "what changed"; the repo holds every credential and ACL in the estate. (+2 var)
- **Tap / Port Mirror — "The Periscope"** — feeds the IDS traffic it can't otherwise see; a placement puzzle costing switch capacity and duplicating internal traffic. (+1 var)
- **Patch Panel — "The Jack Field"** — structured cabling as a commitment: two cables and two ports per link, a documented re-patch, an extra latency hop. (+5 var)
- **Looking Glass / Public Route Server / Public Speed Test** — a public page showing your routing table and running traceroutes, costing nothing and feeding Engineer Reputation; its attack surface is transparency itself, since it hands attackers free recon.
- **QoS / Traffic Shaping Policy** — guarantees each traffic class a link share; cheap in money, expensive in thought, and the management class you forgot locks you out mid-congestion. (+2 var)
- **Load Shedding by Priority** — pre-set shed order (free tier, anonymous, background, low-tier) so overload becomes a choice rather than uniform misery. (+3 var)
- **Admission Control and Bounded Queues** — bounded edge queue with a rejection policy: rejecting 10% immediately serves the other 90% properly.
- **The Queue Dial** — per-node queue depth: shallow = fast 503s, deep = everyone waits and you serve requests whose senders already left.
- **Structured Cabling Tray / Overhead Ladder Racking** — the required cable route; anything outside the tray becomes the Rat's Nest and its tidiness penalties.

## 4.5 Defenses

- **The Nine Defense Roles** — every defense tagged Absorb, Block, Classify, Meter, Deter, Divert, Contain, Detect or Recover; the palette filters on it.
- **Sensor vs Enforcer doctrine** — sensors reveal and cost no latency; enforcers decide, cost latency and can be wrong about a customer.
- **The Coverage Grid** — threat roles × defense roles matrix auto-generated from placed objects; empty cells show exactly what you're missing.
- **Defense-in-Depth stacking rules** — coverage composes multiplicatively, latency additively; third same-role defense at 50%, fourth 25%; cross-role pairs get synergy; a Waste Indicator counts wasted latency.
- **Defenses live on edges, not on the board** — a defense is placed on a link and taxes only the traffic crossing it, making coverage spatial and the Tap placement puzzle meaningful. ⚔️ some (scrubbing, blocklists, policies) are irreducibly Global and priced higher.
- **Every defense has an aggression slider** — one faceplate widget with catches vs false positives side by side, plus a third "log only" position.
- **The Defense Off-State and the Mis-Tune State** — off = mechanism parked with dust film; mis-tuned = strain plus amber piling in its Mound of the Stopped; never-fired rules grow cobwebs.
- **WAF (Web Application Firewall) — "The Sieve"** — stops SQLi/XSS/traversal at 3–8% friction; opens false positives that break customers' own apps and a false sense of security. Inline 1–5ms vs cloud ~40ms fork. (+4 var)
- **Rate Limiter (per-IP / per-endpoint / per-ASN) — "The Turnstile"** — cheap and effective; the key you choose (IP/session/account/ASN/fingerprint/cost) decides the collateral against NAT'd populations. (+3 var)
- **CAPTCHA Gate / Challenge Gate** — stops bots hard at 12%+ friction, higher on mobile; correct in emergencies, disastrous as a default. False-positive counter sits beside the bots-blocked one.
- **Bot Fingerprinter / Behavioural Analysis** — identifies mimics without friction; pays with a training period, model drift, poisoning, privacy scope, and blocks that have no explainable reason.
- **MFA / Auth Hardening** — kills credential stuffing; opens permanent lockout tickets, a recovery flow that is now the weak link, token logistics; also an insurance and enterprise prerequisite. (+2 var)
- **Identity Provider (the "front-desk master key")** — one SSO/MFA revocation point; becomes the juiciest target (compromise opens every door) and its downtime locks out even you.
- **fail2ban / Dynamic Blocklist** — cheap auto-banning of repeat offenders; self-DoS when a NAT'd office trips it, plus log-parsing CPU and an ever-growing list. (+2 var)
- **IDS / IPS Sentry — "The Radar Dish"** — the only APT counter; opens encrypted-traffic blindness, rule-tuning labour, and alert fatigue as a literal mechanic. IDS outlines, IPS shoots. (+3 var)
- **Honeypot** — fake target wasting attacker time and generating intel that unlocks counters early; it is a live exposed service (~4%/level foothold) and raises your visibility score. (+5 var)
- **The honeypot's escape risk — *CONFLICTING*** — everything is agreed except the one number deciding whether you build it: does the pot itself become a way in? ⚔️ risky live attractor (~4%/level) vs zero-surface decoy outside the perimeter vs telegraphed breakout with counter-play.
- **The Decoy and the Sacrificial Service (the Divert family)** — Decoy Origin, Sacrificial Endpoint, Tarpit Lane, Null-Route Pool, Bait Account; gives the player agency over threat pathing.
- **The Tarpit** — holds attacker connections open, spending their resources; the bill is your bandwidth, and tarpitting an autoresponder makes it worse. (+3 var)
- **The Sinkhole** — destination rather than bait: redirects malicious traffic into a pit you can study; RTBH is its blunt cousin.
- **/dev/null Pit Tower** — humour object swallowing small threats; the toy-scale picture of what a null route looks like before you learn its cost.
- **The Canary** — fragile, exposed, cheap sentinel in a failure domain that dies first and loudly; adds its own false positives and the temptation to silence it. (+1 var)
- **Canary Credentials / Honeytokens** — fake secrets inside real systems; near-zero false positives and the only cheap detector of an attacker already inside.
- **Threat-Intel Feed Tower** — buys wave-composition preview wholesale; costs a subscription, leaks your own attack data, and is a feed an adversary can shape.
- **File Integrity Monitoring** — the only reliable webshell detector; its noise on every legitimate update trains you to ignore it.
- **SBOM / Software Inventory** — answers "are we affected?" in minutes; costs an agent per host and produces a complete map of your surface in one file.
- **Patch Cart / Patch Management** — patch lag as a per-faceplate colour ramp, so a zero-day's triage order is already visible; the patch window itself bounces customers. (+2 var)
- **Golden Image Bakery** — versioned tested base image making recovery a redeploy; a vulnerability baked in propagates everywhere, and images generational-drift.
- **Sandbox / Threat-Analysis Gate + Detonation Chamber** — holds packets for deep inspection (latency on all traffic) and burns updates before they touch the estate (deploy delay).
- **Immutable Rebuild Pipeline** — recreates any compromised node from scratch; the counter to persistence, priced in discipline (no pets, no manual fixes, no local state).
- **Circuit Breaker** — auto-sheds a sick dependency to stop cascades; threshold wrong in both directions, half-open flapping, and an open breaker hides the real problem.
- **Canary Deploy Rig / Blue-Green / Gradual Rollout** — 1–5% of traffic to the new version; costs double capacity during rollout and can't cover schema changes. (+1 var)
- **Feature Flags / Kill Switches** — runtime mitigation without a deploy; opens flag sprawl and combinatorial states nobody tested. (+3 var)
- **Chaos Monkey / Chaos Engineering Lab / GameDay** — a planned outage now for permanently smaller real ones; an opt-in difficulty increase that is also a strategy. (+1 var)
- **Load Testing Rig** — finds the stack's actual breaking point and reveals which component fails first, which is never the expected one. (+1 var)
- **Tabletop Exercise** — staff-only incident practice, the cheapest defensive build; also buys an unlock node without the damage if you guess the threat right.
- **The Break-Glass Safe** — sealed one-use credential for when the identity system is the outage; it bypasses everything and will be two years untested.
- **Abuse Detection Pipeline** — outbound anomalies, spam scoring, port-scan and new-account scoring feeding suspensions; false positives suspend paying customers.
- **Rate Limiting / Quota Engine (per-account resource caps)** — per-account CPU/IO/inode/API caps, the direct noisy-neighbour fix; a low cap turns success into a ticket and "unlimited" into a contract fight.

## 4.6 Observability and response

- **Monitoring Stack (purchased in layers) — "The Watchtower"** — the fog-of-war remover, bought as layers from ping to business-metric checks, each with its own blind spot and observation lag; per-object agent cost, retention-vs-resolution choice; opens alert fatigue, volume-scaled cost, cardinality explosions, and a monitor that dies leaving everything green forever. (+5 var)
- **External / Synthetic Monitoring** — cheap multi-region checks from outside that catch the DNS, BGP, certificate and CDN failures internal monitoring is structurally blind to; opens low-value alerts from flaky vantage points.
- **External Vantage Fleet** — probes inside other people's networks measuring latency, DNS and TLS from many ASNs; the only way to see blended-transit downgrades, lame delegation and hijacks; costs alert fatigue from other networks' bad days, teaching N-of-M agreement.
- **The Synthetic Customer** — a permanent fake tenant continuously exercising signup, provision, deploy, transaction, backup, restore and ticket; catches business-layer failures (billing, provisioning, mail) that technical monitoring never touches; costs a slot and a resource trickle.
- **Alerting / Pager / On-call Rotation** — converts silent failure into a notification; upgrades buy precision not power, alerts without an attached runbook double alert fatigue, and the alerting path must not depend on the thing it watches.
- **Tracing** — late-game unlock showing exactly which hop is slow, turning "the site is slow" into "the payment service's retry loop is slow"; expensive, and blind to anything uninstrumented.
- **Status Page** — halves reputation damage and cuts ~40% of incident ticket volume; free internally and a lesson you learn once, because independence is a whole-dependency-graph question (DNS, ACME, SSO), and it publicly advertises your downtime. (+4 var)
- **Runbook Library / Documentation** — staff-time investment that turns procedures into playable cards with lower time and failure chance; makes juniors effective, immunizes against bus factor, and rots into misfires if never reviewed. (+2 var)
- **Postmortem Process (blameless)** — costs a hand and a day after every sev-1 and permanently reduces recurrence of that incident type; feeds culture, runbooks and morale, and is always tempting to skip mid-incident.
- **Runbook Automation** — converts a thrice-performed manual response into a standing rule; opens automation running the *wrong* runbook confidently, fleet-wide, at 3am, and masking the signal that would have told you the real problem.
- **Incident Command Structure** — assign IC, Operations, Comms Lead and Scribe during a sev-1; spending your scarcest hands on coordination shortens MTTR and stops duplicate actions; opens an IC who starts debugging and a comms lead who promises a fix time.
- **The Escalation Matrix** — a document defining severity levels, notification targets, decision authority and customer-comms timing; removes the "do we wake someone" debate at the cost of occasional over-escalation.
- **The MOP and the Go/No-Go** — a written Method of Procedure with per-step verification, rollback and a clicked abort point; slower and safer, but rots against last quarter's topology and invites skipped verification when behind schedule.
- **The Error Budget Policy** — a declared target (99.9% = 43 min/month) you may spend on risky changes until exhaustion auto-triggers a change freeze; per-customer variant shows minutes of budget left per relationship.
- **Auto-Scaler / Auto-Scaling Policy** — adds capacity automatically under load, and scales up under attack too, spending your money serving the attacker; gameable by pulse waves, and costs money on every over-reaction. (+4 var)
- **Config Management (Ansible/Puppet-alike) — "The Stencil"** — ends config drift and makes rebuilds fast; one bad playbook applied fleet-wide is the fastest outage in the game, so power and danger are the same stat. (+5 var)
- **The Tag & Policy Engine** — label anything (`tier:gold`, `pci:true`) so defenses target by tag across the fleet and everything built later; opens policy drift, where a mis-scoped tag over-taxes latency or silently under-protects.
- **The IaC State Vault** — the state file and repo your whole estate re-renders from, turning restore into re-render; breached, it hands an attacker your blueprint and the waves that follow are targeted.
- **Deploy Pipeline / CI-CD** — repeatable releases, rollback and faster shipping; it can deploy a bad build everywhere at once and holds production credentials, making it the highest-value target in the building. (+1 var)
- **Container Registry / Package Mirror** — supply-chain control with pinned, signed, scanned artifacts; opens a stale mirror serving known-vulnerable packages forever and an outage that stops every deploy and pod restart. (+4 var)
- **Certificate Automation (ACME)** — ends cert expiry; opens rate limits, a DNS-challenge dependency, renewal failures silent for 89 days, and a quiet dependency inside things you thought were independent. (+3 var)
- **Asset Inventory / CMDB** — reveals shadow infrastructure and answers "how many servers do we have"; an inventory that is wrong is worse than none because you will now trust it. (+1 var)
- **The Secondary Everything Register** — a graph-generated list of every single-instance dependency: one nameserver, one registrar account, one supplier, one person who knows the thing.
- **Capacity Planning / Forecasting Model** — information as a purchase: projects when you run out, early enough to act on lead times measured in months rather than minutes. (+1 var)

## 4.7 Facility

- **The Facility Section Cut** — togglable vertical architectural slice showing utility entry, transfer switch, UPS room, generator yard, busway, CRAC loop and plenum, so power and air render natively.
- **Rack / Cabinet** — the placement unit granting U slots with power, weight and airflow budgets; mesh vs solid door trades airflow for noise, and front/back are separate flippable scenes. (+5 var)
- **Rails, Cage Nuts, Depth Adapters and the Cable Comb** — consumables gating placement speed; a fit check on depth, rail type, weight and clearance adds time and a Missing Screw chance when it fails.
- **The Tool Crib and the Torque Standard** — shadow board, fastener bin, torque driver, ESD station and a mounting standard; cuts Missing Screw frequency and remote-hands error, granting a permanent MTTR bonus.
- **PDU / Busway — "The Spine"** — power distribution with a trippable breaker; tiers run basic → metered (bill actual amps) → switched (remote outlet cycling, sellable); enforcement creates colo disputes. (+2 var)
- **Switched PDU (per-outlet power control)** — rung three of the recovery ladder, fixing the wedged machine whose BMC also hung; it is a network device that can power off any server, on 2017 firmware with a default password.
- **The Breaker Panel** — wall of physical breakers you can see tripped or set; one click darkens a row of racks, the bluntest failure visualization available.
- **The Circuit Colour Band** — printed colour band at the PDU matched on every cord, so a dual-corded server with two same-colour bands is visibly not redundant.
- **A+B Power Feeds / Dual Cording** — real redundancy only if every device is dual-corded to different PDUs on different feeds; a free Redundancy Audit overlay shows bought vs effective and names the shared dependency. (+2 var)
- **UPS — "The Battery Ziggurat"** — bridges seconds-to-minutes power gaps; batteries degrade invisibly over 3–5 years, a UPS stuck in bypass protects nothing, and eco mode trades ~5–8% of the power bill against transfer time. (+3 var)
- **Flywheel UPS — "The Spinner"** — battery-free alternative with a visibly spinning mass and much shorter but very legible ride-through; a design tradeoff rendered as a picture.
- **Generator + Fuel Contract — "The Barn"** — survives long outages on monthly tests, fuel, polishing and start batteries; opens start-failure odds (18% → 1.5% with maintenance), ATS as a new SPOF, and emissions runtime caps. (+3 var) ⚔️ single "start confidence" readout vs a six-part failure taxonomy — both ship, taxonomy as the maintenance screen.
- **Diesel Tank + Fuel Delivery Contract** — float-gauged tank plus a contracted truck whose arrival is the cheer moment; the delivery SLA is worthless in a regional event.
- **ATS / Static Transfer Switch — "The Big Lever"** — decides utility vs generator and is itself a facility-wide SPOF unless you buy two, which nobody does; testing it causes The Flicker. (+2 var)
- **Load Bank** — tests the generator under real load; the boring purchase that decides whether "Generator Fails to Start" kills you, and the cure for wet stacking.
- **Battery Capacity Tester** — reveals the UPS runtime you actually have rather than the one printed on the label.
- **Utility Feed / Service Entrance** — a hard kW ceiling on the whole facility; upgrading takes months to years with the power company as an NPC, so it must be started levels early.
- **Second Utility Feed from a Different Substation** — real diversity at big money, drawn as two genuinely different routes across the map so redundancy is geographic and legible.
- **Substation / Utility Yard — "The Yard"** — campus-scale object with buzzing insulators and a visible one-line diagram overlay, sitting at the top of the facility power ladder.
- **On-Site Generation and Storage (solar, BESS, fuel cell, microgrid)** — cuts grid draw, rides short outages and sells grid services back; opens lithium fire safety, new regulatory approvals, and solar producing least when you need most. (+2 var)
- **CRAC / CRAH Cooling Unit (N+1) — "The Cold Breath"** — removes heat within a hard-edged throw cone, making cooling capacity the cap on room density; opens short-cycling, clogged condensate drains and a shared chilled-water loop. (+4 var)
- **Chilled Water Plant (chillers, pumps, cooling towers, water treatment)** — efficient cooling at density with free-cooling mode; opens a whole second infrastructure: pump seals, valve actuators, glycol and water treatment, makeup-water loss, legionella duty.
- **Free Cooling Economizer / Dry Cooler / Evaporative / Adiabatic** — climate-dependent efficiency that makes site selection matter; works until the heat wave, and adds water supply, drought and usage regulation as dependencies. (+4 var)
- **Thermal Storage / Thermal Ride-Through (ice bank, chilled-water buffer tank)** — purchasable cooling minutes plus night-ice arbitrage; costs a large tank, floor loading and water biology. ⚔️ hot-aisle containment *shortens* ride-through, from 8 minutes to 90 seconds.
- **Hot/Cold Aisle Containment + Blanking Panels — "The Glass Roof"** — best-ROI efficiency build raising the density ceiling; contained hot aisles hit 50°C+, heat up far faster on cooling failure, and block some placements.
- **In-Row Cooling — "The Slot Unit"** — a cooling unit occupying a rack slot in the row, trading floor space for targeted cold as a literally spatial tradeoff.
- **Rear-Door Heat Exchanger** — a heat exchanger you bolt onto the back of a rack, after which that rack's heat plume visibly stops leaving it and the room's thermal load drops.
- **Liquid Cooling (direct-to-chip loop / CDU / immersion tank)** — required above ~30kW/rack, the GPU gate; opens leaks, coolant chemistry, a new maintenance discipline and vendor lock-in.
- **The Spill Kit, the Drip Tray and the Isolation Valve** — four cheap physical objects — leak cable, tray per CDU, valve per loop, kit plus a trained person — that turn a coolant catastrophe into a mop.
- **Raised Floor + Tile Puller** — perforated tiles placed individually to direct airflow, with a real weight limit that storage and GPU racks can exceed; lifting tiles reveals a second cable-and-pipe layer.
- **Airflow Streamers** — ribbons on grilles showing direction and speed; a free continuous readout with no HUD cost.
- **Environmental Sensor Mesh** — per-rack inlet/outlet temp, humidity, differential pressure, door sensors and floor leak cable; before you buy them the thermal map is a smoothed simulation, after it is noisier and true. (+3 var)
- **DCIM (the facility's monitoring stack)** — layered facility observability from asset tracking to capacity modelling and change workflow; it holds credentials into building automation, so a compromise here is physical.
- **BMS / SCADA and OT Security** — the building's control system is a computer nobody treats like one: old software, flat network, default password, a contractor with standing remote access, and an attacker who can turn off your cooling.
- **Fire Detection (VESDA) — "The Sniffers"** — aspirating early smoke detection with a sensitivity dial; too sensitive and dust or a missing anteroom produces nuisance alarms.
- **Fire Suppression** — required by insurance and enterprise tenants; wet-pipe vs pre-action vs clean agent vs gambling, and clean-agent discharge acoustics damage spinning drives. (+2 var)
- **The EPO Guard** — an $8 hinged plastic cover in the facility tab next to the six-figure generator; the joke is the price and the joke is correct.
- **Water Leak Detection Cable / Thermal Imaging Survey** — periodic sensors and surveys that find a hot connection before it is a fire and catch the drip before the short; cheap, boring, decisive.
- **Physical Security: Fence, Bollards, Gate, Mantrap, Badge, Biometrics, Cameras, Guard Post** — compliance gate and tour selling point; slows your own techs, and every layer has a bypass — tailgating, a propped door, an uncovered camera cone. (+7 var)
- **Cable Management / Cable Tray / Patch Panel / Overhead Ladder Racking** — Tidiness 0–100 scaling remote-hands duration and neighbour-knockout chance, decaying ~3 per action, restored by a 4-minute pass. (+3 var) ⚔️ bundled runs are harder to trace and a panel adds a latency hop.
- **Cable Label Printer** — a tiny cheap purchase that permanently reduces remote-hands errors, and one of the ~12 sanctioned hygiene pure-ish wins. ⚔️ its cost is a label-accuracy stat that decays as you re-patch; a wrong label is worse than none.
- **Spare Parts Inventory / Spares Bin / Crash Cart** — pre-paid response time turning a 4-hour part-order outage into a 12-minute swap; ~2%/month holding cost and per-part-type coverage. (+3 var)
- **The Crash Cart (and the Crash Cart as Console)** — rolling monitor and keyboard with visible travel time, letting a hand work a networkless machine; doubles as the diegetic console UI at the machine itself.
- **Loading Dock / Staging Area / Freight Elevator** — throughput constraint on growth with booked deliveries, elevator weight limits and queues; opens unescorted drivers, cardboard fire load, and gear sitting for weeks.
- **The Anteroom / Dust Lock** — unboxing and cardboard removal outside the data hall; cheap, boring, and it deletes a whole family of particulate and fire-load entropy events.
- **The Burn-In Bench** — 24–72 hour soak under synthetic load before racking; costs floor space, power and time-to-revenue, and invites skipping when a customer is waiting.
- **The Lab Rack / Reference Rack** — non-production rack with its own power and switch mirroring your hardware and network; a rack of capital that earns nothing and quietly becomes production when someone needs a box fast.
- **Diverse Fiber Entry** — two physical conduits into the building; the only counter to the backhoe, and the thing everyone claims to have and few actually do.
- **Meet-Me Room — "The Cathedral"** — the most profitable room in a colo: ~95%-margin recurring cross-connects, switching costs, and carrier density as a real network effect.
- **Carrier Diversity** — multiple carriers in the building as both resilience stat and marketing asset; "carrier-neutral" is a sales term that literally closes deals.
- **Cabinet / Cage / Private Suite *(colo)*** — three escalating tiers of sellable space with escalating isolation and price.
- **Building Shell Expansion / Build-to-Suit / Build-Out Shell Space** — pre-purchased future capacity: dead money now and the only way to grow fast later, with enormous financed capex and an overrunnable construction timeline.
- **Datacenter Shell vs Leased Space** — own (capex, depreciation, lower unit cost, balance-sheet asset) vs lease (opex, flexible, no equity); the bundled power tier is the SLA-class unlock and N+1 is dead cost until used.
- **Vendor TAC Support / "Phone a Friend"** — per-incident fees buying a scripted early hotfix and one escalation per level that one-shots an incident and reveals its codex tip forever.
- **On-Site Water / Chiller Plant Politics** — water usage as a community-relations and permitting stat in drought regions, not merely a bill.
- **Waste Heat Recovery** — sells BTUs to a neighbour within a kilometre, turning a cost into revenue and creating a contractual duty to keep producing heat, so you cannot idle down. (+3 var)
- **Seismic Bracing / Raised Floor vs Slab / Roof Condition / Overhead Tray** — structural and site-quality modifiers; the under-floor vs overhead routing choice is an aesthetics-and-legibility decision with a real floor weight limit.
- **The Office** — staff quarters with a whiteboard auto-drawing your topology as of the last update, dated in the corner; updating costs a hand, so the minimap lies.
- **NOC / Operations Floor** — staffed monitoring as a room; opens the big-screen-nobody-watches problem, a room whose value depends entirely on attention.

## 4.8 Staff

- **The Team Model (four sub-stats, one owner each)** — collapses seven overlapping systems into Capacity (hands now), Energy (0–100, errors below 30), Knowledge (per subsystem, walks out the door) and company-wide Culture.
- **Role compression: five roles × three seniorities** — hire Ops/Network/Data/Security/Support at Junior/Mid/Senior plus specialisations; named roles become what the grid produces. (+6 var) ⚔️ the full roster is more characterful and several roles carry unique mechanics, not stat deltas.
- **Staff Shifts as a Placement Puzzle** — each person covers 8 hours with a preferred band and degrades outside it; coverage gaps show as dark bands on the clock, and Timed-affix threats aim at them.
- **Staff as Rendering Modifiers** — hiring changes what you can see: the analyst raises stealth alpha, the DBA exposes query internals, the network engineer reveals link error counters. (+1 var)
- **The Hands Dock** — peg rail of physical hand tags that hang on the object being worked; overtime hands hang crooked below, and an empty rail is the clearest panic signal in the game.
- **The Staff Silhouette Set** — eight-to-ten roles distinguishable at 16px by head shape, carried object and gait, with a print-black-on-white sign-off rule.
- **The Fatigue Posture Ladder** — five authored postures from Fresh to Gone plus desaturation over a shift, so the team's state reads from the establishing frame rather than a number.
- **Morale / Burnout (the playable states)** — Fresh → Tired (−20% speed) → Strained (won't volunteer information) → Checked Out (does exactly what's asked) → Gone; recovery needs root-cause fixes, not rest alone. (+3 var)
- **Staff Skill Pips** — 1–5 chevrons per skill earned by handling incidents, giving visible growth and attachment to the people who've been there since Tier 1.
- **The Bus-Factor Halo** — a staffer who is the only one who knows a system gets an ominous halo and faint tethers to those systems; you watch the tethers snap when they quit.
- **The Pager (as an object)** — off-shift staff are a phone icon; paging shows a buzz, a car arriving and a walk-in, rendering the 3-minute response time.
- **The Follow-the-Sun Band** — a lit band across the globe view showing which team is awake, with handoffs drawn as a baton pass — also where handover loss happens.
- **Junior Sysadmin** — cheap routine-ticket handler who occasionally causes an incident and grows into a senior if trained and not burned out.
- **The Sysadmin (generalist)** — one hand performing any manual action at base speed; the unit everything else is measured against.
- **Senior SRE / Greybeard** — halves MTTR and is the only one who can safely do risky actions, but is a bus-factor risk; in SRE framing builds automation instead of doing manual work.
- **The Legend** — a rare found-not-hired hireable with a unique passive (e.g. hardware failures telegraphed a shift early); one or two per campaign, and losing one hurts.
- **Network Engineer** — 2× on routing tasks and the only one who can safely touch BGP, so extremely bus-factor-y; refuses application problems, and idles by tidying cables into a real Tidiness gain.
- **DBA** — adds index and query-tuning actions nobody else has, preventing the slow-query apocalypse; often the highest-ROI hire nobody makes.
- **Security Engineer / Security Analyst / SOC** — passively reduces Surface and unlocks hardening and threat hunting; produces no visible revenue, and firing them has a 90-day lag before consequences arrive.
- **Automation Engineer** — converts recurring toil into a one-time cost, literally deleting an upkeep drain from the ledger; the mechanical expression of the Runbook Ladder.
- **Support Tier 1 / Tier 2 / Tier 3** — ticket throughput protecting your engineers' attention; understaffing Tier 2 pushes everything to engineering, and understaffing at all carries a 60-day delayed churn tail.
- **24/7 Coverage** — a step-function cost: roughly 5 FTEs per seat round the clock, unlocking enterprise and game-hosting customers who won't buy without it.
- **Offshore / Follow-the-Sun Support Pod** — ~60% lower cost per ticket and timezone coverage; costs a 90-day ramp, a documentation prerequisite, CSAT drift and two teams giving contradictory answers.
- **Sales Rep / SDR / AE / Sales Engineer** — converts evaluators and tours into contracts, gated on your reputation; reps take 4–6 months to ramp, 30–40% fail, and a rep's pipeline leaves with them.
- **Account Manager / Customer Success Manager** — covers 20–40 mid-market or 3–8 enterprise accounts for 2–5 points of churn reduction; marginal by design, and they take relationships with them when they go. (+3 var)
- **Marketing Lead** — improves ad efficiency and content output and allocates budget across lanes; opens CAC inflation and demand you cannot fulfil, which is worse than no demand.
- **Abuse / Trust & Safety** — permissive↔aggressive policy dial trading legal exposure against customer trust; your RIR and upstream expect `abuse@` actioned in 24–48 hours or you get null-routed. (+3 var)
- **The Developer** — improves application efficiency and per-request cost while increasing Bad Deploy frequency; the cleanest two-column staff member in the game.
- **The Intern** — nearly free at 0.5 hands with a small incident chance, trainable into a full sysadmin; an investment with a variance tax.
- **Datacenter Tech / Remote Hands** — on staff (fixed, instant) or contracted (per-15-minute, 30min–4hr delay); outsourced attention that does exactly what the ticket said, comically literally. (+3 var)
- **The Contractor / Consultant** — instant expensive temporary expertise that gains no pips and writes no runbooks, and leaves behind an SSH key you might forget.
- **Contractor Surge** — money into throughput during a build-out, with no institutional knowledge left behind, so the build finishes and nobody knows how it was wired.
- **The Contractor's Contractor** — a sub-subcontractor on your floor with a badge you didn't issue: a threat wearing a staff sprite, and the reason escort policy exists.
- **The Greybeard Consultant (rentable)** — rentable for one level at high cost to instantly diagnose any mystery; an expensive get-unstuck button that respects the player's time.
- **The Night-Shift Tech** — visible only in the night band, their lonely flashlight moving through a dark room as a mood piece.
- **The On-Call Rotation** — a sleep budget you manage; below 4–6 people it degrades both people continuously regardless of incident volume, and follow-the-sun trades night pages for handover loss. (+6 var)
- **Training / Certification Budget** — converts juniors into seniors over time; also a compliance prerequisite in regulated lines and a retention lever.
- **Documentation Culture** — slow cheap passive that blunts turnover damage and runbook rot, required for audits, and decays if not maintained.
- **Background-Checked Staff Pool** — regulated-hosting requirement making hiring slower and dearer; a clearance lapse pulls someone off in-scope work mid-level.
- **The Distributed-Team Toggle** — wider hiring pool and free follow-the-sun, paid for with slower knowledge transfer, harder Culture, and no hands for anything physical.
- **Additional roles with real mechanics** — Controller, Capacity Planner, FinOps, Release Manager, Technical Writer, Deliverability Specialist, Peering Coordinator, DPO (who can block you), Compliance Officer, Facilities Manager and Tech, Safety Officer, Community Manager, HR, Procurement.

## 4.9 The business machine

- **Scoping rule: six departments, not forty buildings** — group business buildables into Billing, Support, Sales, Marketing, Legal/Compliance and Finance, each one building with internal slots, so the floorplan states your strategy.
- **Reveal schedule: nothing appears before its tier** — Tier 0–1 none, Tier 2 three objects, Tier 3 six more, Tier 4 sales/legal/compliance, Tier 5+ everything else; the business layer grows with the infrastructure layer.
- **The Rate Card / Price Book** — every plan, term, renewal and regional variant with live per-SKU contribution margin; free to hold, expensive to change, and opens off-card price inconsistency you honour for years. (+3 var)
- **Pricing Engine / The Plan Builder** — drag resources and features onto a plan card and read live conversion, cost-to-serve, margin, tickets-per-account and payback; renewal shock, overage policy and the "Unlimited" trap are fields. (+1 var)
- **Order Form / Storefront** — public entry point of the client lane with checkout and localisation upgrades; carding bots test stolen cards against it and every fraudulent order costs a gateway fee.
- **Payment Gateway (primary + redundant)** — ~2.9% + $0.30 skimmed off all revenue forever; opens chargeback ratios, rolling reserves and processor termination, and real redundancy needs a second acquirer under a second entity. (+1 var)
- **Billing Platform / Billing Engine (WHMCS-alike)** — automates invoicing, provisioning, suspension and dunning; holds every customer's billing data, can suspend paying customers on a bug, and its downtime is a silent revenue outage. (+4 var)
- **Metering & Rating Engine** — turns usage into invoices and unlocks overage, egress, GPU-hours and 95th-percentile revenue; opens 2–5% silent revenue leakage, bill shock, and a meter that disagrees with the customer's by 4%.
- **Revenue Assurance** — reconciles assets, provisioning and billing three ways to recover 1–4% of MRR permanently for one analyst's salary; gated behind a scar rather than money.
- **Dunning Engine** — retries failed cards and recovers 30–70% of involuntary churn; opens dunning fatigue and network penalties, erroneous suspensions, and upkeep against changing processor rules.
- **Fraud / Risk Screening** — tunable signup scoring where strict blocks ~4% of good customers and loose invites the carder ring; should be per-SKU, and costs roughly 15% of checkout conversion. (+3 var)
- **Quote & Contract Desk / CPQ** — produces MSAs, SLAs, DPAs and net terms, unlocking enterprise and colo lanes; introduces AR aging, reps quoting below cost, and signable terms that torch your valuation. (+2 var)
- **Deal Desk / Discount Authority** — per-role discount ceilings and clause-interaction flags before signature; slows every non-standard deal by days and earns a "hard to work with" reputation.
- **Sales Compensation Plan (a tunable object, not a salary)** — pay on bookings, MRR, TCV, margin or collected cash and reps optimise exactly that; opens sandbagging, deal-pulling-forward and customers you should have declined. (+3 var)
- **The Sales Floor** — a room whose size gates how many prospects you can work at once, with a closed-deal gong you can disable and never will.
- **CRM Pipeline Tower** — leads walk visitor→trial→opportunity→close as physical units, converting founder relationships into company assets; costs per-seat SaaS fees that scale with the floor, not revenue.
- **Win/Loss Interview Program** — third-party interviews of prospects who chose someone else, producing real loss reasons; opens uncomfortable truths, one of which is a named rep's win rate.
- **Customer Advisory Board / Reference Program** — 6–10 quarterly customers who take reference calls that enterprise deals stall without; opens reference fatigue, an honest damaging answer, and your most demanding customers organising.
- **Tender Desk / Bid Bot** — scheduled RFP events where you compose a bid from real certs, uptime history and references, cashing out every boring certification purchase.
- **Analyst-Relations Briefing Room** — paid briefings that shift your quadrant dot; high cost, high leverage, occasionally humiliating, and a bad placement persists in the HUD for a quarter.
- **Customer Health Score Engine** — one per-account number from usage, sentiment, logins, payments and contact turnover, flagging churn 60–90 days early; opens false positives and gaming the score instead of fixing the account.
- **The Trust Center / Security Portal** — pre-answered questionnaires, SOC 2 under NDA, subprocessors and insurance certs that shorten enterprise cycles; publishes your control set as a map, and anything stale is a lie with your logo.
- **The Upsell Shelf** — add-ons with real attach rates: managed backups 25–40%, dedicated IP 8–15%, SSL 3–8%, priority SLA 5–12%, pro services 1–3% at 5–20× ARPU; domains are worst-margin and best-retention.
- **Data Gravity Builds** — every gigabyte the customer stores with you lowers churn probability independently of price or satisfaction. ⚔️ the Egress Policy Desk decides whether that anchor reads as convenience or hostage-taking.
- **Self-Serve Portal / Customer Control Panel** — each self-service feature is a support-cost tower in disguise; it is an authenticated public app with control over infrastructure, the juiciest target you own. (+4 var)
- **API / Terraform Provider** — attracts developer customers and automation-heavy usage; a runaway customer script provisions 400 servers at 3am and you either eat it or fight the dispute.
- **Marketplace / App Store / Add-on Catalog** — partner apps on revenue share, low effort and sticky; a compromised marketplace plugin is your breach and your brand on the invoice.
- **Affiliate Portal / Partner Program** — CPA affiliates and white-label tiers as lane multipliers; opens self-referral fraud and cookie stuffing, poor customer quality, and partners bought away by competitors. (+4 var)
- **Reseller / White-Label Portal** — sells your capacity through partners; you lose end-user visibility, inherit their abuse, and can be disintermediated.
- **Partner Portal with Deal Registration** — 90-day protected margin on registered deals plus visibility into pipeline you were blind to; opens channel conflict, and deciding against a partner once costs the partner forever.
- **Partner Certification Program** — trains and certifies resellers so they escalate less and sell more accurately; costs a training function and is the counter to partners blaming you.
- **Multi-Brand Storefronts** — N brands on one infrastructure for segment positioning and a fighter brand; costs duplicated marketing and queues, and opens linkage risk when customers discover it's one company.
- **The Brand Building** — a literal structure whose height is Reputation, raising conversion on every lane at once, built slowly by shipping, communicating and not lying.
- **Content Engine / SEO Rig** — writers plus technical SEO with a six-month lag and a permanent tap afterwards.
- **Ad Console** — a real-time budget dial where turning it off is instant cash relief and instant growth stall; opens CAC inflation at scale and demand you cannot fulfil.
- **Marketing Beacon / The Channel Portfolio** — SEO decays, paid search rents its own existence, events are bursty, owned channels are drought-proof, affiliates are ~20% of industry CAC; the beacon also attracts scrapers as bycatch. ⚔️ over-marketing spikes expectation so arrivals have tighter patience.
- **Knowledge Base / Docs** — triple-purpose deflection, SEO and onboarding, and the prerequisite for the AI Support Agent; stale docs create wrong-expectation tickets worse than no docs. (+5 var)
- **Social / Community Desk** — monitors mentions and responds publicly, converting angry visitors before they reach review sites; costs salary.
- **PR / Comms Desk** — pre-drafted statements, media contacts and a rehearsed spokesperson that halve incident reputation damage, but only if built before the incident.
- **Reputation Laundering Office** — converts marketing spend into reputation repair by hiding old incident headlines from the spawn ring's memory; regulated and offshore levels raise its price.
- **The Lobbying Office** — campaign-wide influence softening audits, seizures and reclassifying jurisdictions; every action moves an "industry capture" meter that eventually makes you a hacktivist arc's villain.
- **Case Study Factory** — turns happy customers into sales assets, which requires their permission and therefore requires them to actually be happy. (+1 var)
- **Trust Badge Row** — uptime, tenure, review-score, security and compliance badges, each a tiny permanent conversion bump and each a liability you must live up to.
- **Startup-Credits Program** — real money out today seeding cohorts that may graduate into enterprise 10+ waves later; a cohort that never graduates is pure loss, and one that graduates to a competitor is worse.
- **Free-Tool Lead Magnets** — public WHOIS, speed test or uptime tools trading compute for high-intent traffic, each gating a segment; they are unauthenticated public endpoints with your logo, so a free abuse target.
- **Ticketing / Helpdesk System** — turns chaotic customer anger into a queue with an SLA timer; required before support staff can scale at all.
- **Live Chat** — a conversion tower on the sales path and a cost centre on the support path; sub-30-second answers convert ~3×, agents run 3–5 concurrent chats, and coverage gaps read as abandonment.
- **Phone Support** — the most expensive support channel and the biggest trust signal for small-business customers; a real strategic fork.
- **Follow-the-Sun NOC** — night shift or 24/7 vendor, converting churn events into credits you never had to give; opens alert fatigue whose fix is tuning monitors, not adding them.
- **Ticket Router / Triage AI** — classifies and routes incoming tickets to cut cost per ticket, and occasionally misroutes a critical one into a low-priority queue.
- **AI Support Agent** — 30–50% tier-1 deflection at a tenth of human cost, dependent on your KB; opens invented policies, CSAT drops, and hidden signal because deflected tickets never reach humans. (+1 var)
- **Onboarding / Migrations Team** — directly raises the probability a new customer survives to month 3; charge enterprise for it and give it free to win SMB.
- **Account Management / Renewals Desk** — works the renewal calendar, converting monthly to annual, upselling at renewal and negotiating enterprise increases.
- **Collections Desk** — the ladder from reminder through payment plan, suspension, agency (25–40% fee) and legal to write-off; suspending a large delinquent usually guarantees you'll never be paid.
- **Collections Agency Contract / Factoring Facility** — agencies take 25–40% and burn the relationship permanently; factoring sells invoices at 1–3% per 30 days and is not the trap a cash advance is. (+1 var)
- **Finance Buildables (the working-capital arsenal)** — line of credit, invoice factoring at 3–5%, hardware leases and a VC term sheet with dilution, board seats and a permanently lower ceiling.
- **The Retrieval / Egress Policy Desk** — what you charge a departing customer for their own data; a revenue line, a churn-friction mechanic, and the most viral-post-generating decision available. (+3 var)
- **QA / Change-Management Board / Internal Audit** — an explicit velocity-vs-stability dial that slows deploys and cuts self-inflicted outages, the #1 real cause; mandatory in regulated lines.
- **Compliance Vault / Compliance Office** — unlocks customer segments, shortens sales cycles and allows 20–40% premium pricing; expiring is cliff churn, and it slows every other department plus a growing evidence-collection cost.
- **The Subprocessor Register and DPA Desk** — every vendor touching customer data listed, contracted, assessed and notified, so adopting a new SaaS tool carries a compliance cost beyond price.
- **Legal Retainer** — makes legal events 3× cheaper and 5× faster, handling DMCA, subpoenas and lawsuits; upgrade path runs retainer → in-house GC → enforcement credibility. (+5 var)
- **Cyber-Insurance Policy** — converts catastrophic breach cash into a deductible plus premium; exclusions (no MFA, nation-state, unpatched, unencrypted, own employees) bite, and enterprise contracts require you to carry it.
- **Insurance Broker (the wider policy set)** — the broker is the unit and cyber, E&O, D&O, BI and property are the slots; retentions per incident, premiums re-rate on claims, and offshore lines cannot buy at all. (+5 var)
- **E&O / SLA Reserve** — a voluntary cash bucket for SLA credits that keeps a bad month from becoming a death spiral.
- **Accounting / FP&A / Finance** — buys the forecast view and cost-to-serve, and gates bank debt, diligence and knowing which line of business is profitable; finance is observability for money.
- **Tax Engine / Nexus Monitor** — correct per-jurisdiction tax plus a nexus dashboard warning before you cross a threshold; costs a per-transaction fee, and its absence opens the Nexus Letter.
- **Entity & Ring-Fence Structure** — separate legal entities per risk class contain a processor termination, lawsuit or debanking to one entity; you must respect the separation, and comingling when cash is tight voids it.
- **Transfer Pricing / Internal Chargeback** — your colo line sells space and power to your hosting line at an internal rate, and a wrong rate can make you divest a line that was actually profitable.
- **Rack Sublet Desk** — pure-income MRR with no customers of your own; your tenants run their threat sets on your floor, route abuse to your upstream, and you cannot patch their boxes.
- **The Board / Investor Relations** — capital in exchange for growth targets and pressure events; debt instead gives covenants measured quarterly whose breach hands the lender rights.
- **Procurement Desk** — turns a 400% price hike into a 90% one via multi-year commits, contractual increase caps, quarter-end timing and migration-plan leverage; pays for itself at scale.
- **Vendor Exit Plans** — a documented and tested plan for leaving each critical vendor; costs staff time, produces nothing, and converts a Vendor Squeeze into an inconvenience.
- **Vendor Diversity** — deliberately using two suppliers: costs efficiency, buys resilience, the purchasing equivalent of A+B feeds.
- **Hardware Support Tier** — next-business-day vs 4-hour onsite vs self-maintain with spares, setting hardware MTTR and your achievable SLA; the right answer flips with fleet size and lapsing is a tempting trap.
- **OEM Capacity Reservation** — guaranteed allocation of scarce hardware 12–18 months forward for a deposit and a commitment to buy whether or not you have customers.
- **ITAD Contract + Certificate of Destruction** — recovers 10–20% residual at year 4 and produces a destruction certificate; opens a data-breach liability with your name on it if the vendor doesn't actually wipe drives.
- **Energy Hedge / PPA / Demand-Charge Manager** — fixed-price power, renewable PPAs, peak shaving and demand-response revenue; the hedge can go underwater, and your contracts need a pass-through clause or you carry all the risk.
- **Reserved Capacity Contract / Transit Commit** — trades price for certainty and improves forecasting; you owe the commit whether you use it or not. (+2 var)
- **The Yield Manager** — a slider releasing idle capacity at a discount versus holding it for full-price demand; release too much and existing customers discover the spot price. ⚔️ directly opposed to the Capacity Reservation.
- **The Backlog Board** — signed-but-not-installed orders queued with required hardware, power, space, hands, install date and a penalty clock; the Signed vs Billing MRR gap is the level's tension.
- **The Comp-Account Auditor** — audits free, internal, employee, partner and demo accounts typically holding 3–8% of fleet capacity; reclaiming them badly produces a viral thread about a sponsorship you forgot.
- **The Renewal Calendar** — customer and vendor contracts renewing in the next 12 months on one timeline, converting a whole class of ambushes into a schedulable workstream.
- **Localisation and Regional Presence** — local language support, currency, payment methods, invoicing, tax, phone number and business hours, each a separate purchase unlocking a fraction of a market.
- **Bug Bounty Program** — converts would-be attackers into reporters and slashes catastrophic-breach probability; has a running cost and occasionally a bill you didn't expect. (+1 var)
- **Source Code / Data Escrow + Business Continuity Agreement** — removes the "what if you go out of business" objection by depositing recovery materials; a stale deposit is worse than none and the customer may test it.
- **Business Continuity / DR Plan (the document, not the infrastructure)** — a written, tested, dated plan; infrastructure without the document fails the audit and the document without infrastructure passes it.
- **Upstream Abuse Relationship** — good terms with your transit providers' NOC and abuse teams materially change scrubbing speed and how much rope you get when a customer misbehaves.
- **SLA Contract Tier (a product you define)** — you author the promise you sell, so higher promises attract better customers and carry bigger penalties; the meter shows minutes of budget left per contract.
- **The Escort Desk** — tenant visitor check-in whose understaffing is visible as a queue of impatient suits in your lobby.
- **The Contract Clause Library — the legal tower tree** — each clause is an unlockable defensive module priced in deal friction: liability caps, credit caps, 30-day claim windows, escalators, take-or-pay, plus red-flagged clauses imposed on you (MFN, right to audit, unlimited liability, 100% uptime).

## 4.10 Type-specific buildables

- **Authoring rule: skins on shared mechanics** — modem bank, VoIP channel group, game slot and warm pool are one countable concurrency pool in five costumes; ~15 objects change a verb. ⚔️ fresh-eyes reports say hero objects are what make each line feel new — resolution: skin the mechanics, never the silhouette.
- **Mail Server / MTA Cluster — "The Sorting Table" *(email)*** — transactional mail and mailboxes; opens open-relay misconfiguration, outbound spam, blacklisting, backscatter and deliverability maintained by strangers. (+5 var)
- **Outbound Relay with Per-Account Rate Limits *(email)*** — protects deliverability by capping per-account send rates, and annoys your bulk senders in the process.
- **Reputation Warm-Up IP Pool *(email)*** — new IPs warm slowly over in-game weeks; the canonical Warm-up Curve build, useless the day you buy it.
- **DKIM Signer / SPF + DMARC Config / Reverse DNS *(email)*** — the deliverability stack: cheap, mandatory, invisible when working, and one of the ~12 sanctioned hygiene wins.
- **Feedback Loop Processor *(email)*** — consumes complaint data from mailbox providers to find bad tenants early, before the shared IP pool is tainted.
- **IP Reputation Manager *(email)*** — one console for warming pools, feedback loops, delisting requests and per-IP reputation tracking.
- **Spam Filter Cluster / Mail Sorter *(email)*** — aggressiveness slider with its false-positive rate displayed, because losing one real invoice email costs more than receiving 200 spams.
- **DNS Authoritative Pair — "The Index Card Cabinet" *(any)*** — your name is your existence; opens recursion amplification, AXFR leakage of your internal naming, lame delegations, and total invisibility if both servers share a facility. (+6 var)
- **Recursive Resolver (internal) *(any)*** — speeds everything up, and when it dies every server fails at once while half your alerts say "connection timed out" instead of "DNS is down."
- **NTP Source *(any)*** — boring and tiny, and its failure breaks certificates, logs and auth all at once; a GPS-disciplined stratum-0 antenna is an attraction gate for telecom and HFT customers. (+3 var)
- **Anycast DNS Node / Signpost *(DNS)*** — cheap, numerous, globally distributed, and the object that introduces BGP tech to the player.
- **Response Rate Limiter (RRL) *(DNS)*** — caps identical responses so your nameservers cannot be used as someone else's amplification weapon.
- **DNSSEC Signer + Expiry Monitor *(DNS)*** — a hard-fail system: get signing or expiry wrong and you SERVFAIL for every validating resolver on the internet.
- **Secondary DNS with a *second provider* *(DNS)*** — the counterintuitive build where the correct answer is to also use a competitor, so one provider's outage isn't yours.
- **Origin Shield / Tiered Cache *(CDN)*** — a cache in front of your cache that stops a PoP-wide miss stampede from reaching the origin.
- **Purge Control / Rate-Limited Invalidation *(CDN)*** — bounds customer-triggered invalidations so a purge button cannot start an origin stampede across every PoP at once.
- **Cache Key Normalizer *(CDN)*** — collapses query-string noise into a single cache key, killing cache-buster floods at the edge before they become origin misses.
- **Bot Manager *(CDN)*** — edge bot classification with its own aggression slider and the false-positive tax that comes with it.
- **Erasure-Coded Pool / Erasure Coding Policy *(object storage)*** — a durability-vs-capacity slider that is literally a probability of data loss, costing CPU and rebuild network.
- **Scrub / Verify Runner *(storage, backup)*** — periodically re-reads everything to catch bit rot; costs IOPS and produces nothing visible.
- **Object Lock / WORM *(object storage)*** — retention-locked objects nobody can delete early, including you; the ransomware answer and the erasure-request problem.
- **Lifecycle Tiering to Cold Storage *(object storage)*** — automatic demotion of cold objects that is cheap until the day someone needs it back at retrieval prices.
- **Pull-Based Backup Orchestrator / Immutable Snapshot Vault *(backup)*** — the architectures that actually survive ransomware, because the backup host reaches in rather than the client writing out.
- **Restore Test Harness *(backup)*** — the build that converts faith into evidence, replacing an estimated RTO with a measured one.
- **Seed Drive Shipping *(backup)*** — ships the first full backup physically, because the network is slower than a van full of disks; a gag with real math behind it.
- **Tape Library + Robot / Drive Pool / Barcode System / Courier Contract / Media Rotation *(tape vaulting)*** — the physical logistics kit for offline retention, with couriers, barcodes and rotation schedules to maintain.
- **The Legacy Drive Museum *(tape vaulting)*** — keeping the ability to read what you stored, because the format outlives the drive that reads it.
- **Tick-Rate Optimized Node *(game hosting)*** — high single-thread clock over core count: worse on paper, better in practice, teaching workload-appropriate hardware.
- **Game Server Instance + Per-Instance IP Isolation *(game hosting)*** — one shard per instance with isolated IPs, limiting a booter attack's blast radius to a single lobby.
- **Player-Facing Proxy / IP Masking Layer *(game hosting)*** — hides players' IPs from each other, killing the grudge-booter vector at the cost of a few ms; the thing you actually sell.
- **Matchmaker / Lobby Service *(game hosting)*** — routes players to the nearest healthy shard; a routing tower that is a single point of failure for the whole platform.
- **Anti-Cheat Service *(game hosting)*** — raises customer happiness, costs tick performance, and its false positives are player bans, the loudest complaints in the genre. (+1 var)
- **One-Click Modpack Provisioner / Instant Server Rollback *(game hosting)*** — save-state restore plus one-click modpack installs, the single most-demanded feature in that market and a direct ticket deflector.
- **Session Border Controller (SBC) *(VoIP)*** — the firewall of telephony, stopping toll fraud and SIP scanning; adds a stateful chokepoint that blocks legitimate odd call flows.
- **Spend Cap / Destination Whitelist / Fraud Anomaly Monitor *(VoIP)*** — cheap controls preventing the single most expensive failure; the best purchase in the VoIP ruleset and a sanctioned hygiene win.
- **Transcode Farm *(video/streaming)*** — batch capacity that can be preempted for live events; melts under viral spikes and gates the paid DRM licence server studios require. (+2 var)
- **Bitrate Ladder Config / Ingest Redundancy / Low-Latency Delivery Path / DVR Storage *(video)*** — the streaming kit; missing ladder rungs drop viewers on bad connections, and DVR storage grows with every hour broadcast.
- **GPU Node / Liquid Cooling Loop / CDU *(GPU)*** — high density and heat with leak failure modes, and the first buildable requiring a facility upgrade before it can be placed at all.
- **High-Density Busway / Busbar *(GPU, colo)*** — absurdly thick power delivery drawn like architecture, and the prerequisite for GPU-density racks.
- **Power Capping Controller *(GPU)*** — a live tunable dial trading compute performance for staying under the breaker, and the thing standing between a dense GPU rack and a trip.
- **GPU Health Telemetry / Tamper-Evident Cabinets + Asset Tracking *(GPU)*** — health monitoring plus physical anti-theft, because the cards are worth stealing and datacenter GPU theft is real.
- **Job Checkpointing Service *(GPU, HPC)*** — the difference between losing an hour and losing 39 when a long job dies; mandatory for whale training runs.
- **Job Scheduler + Preemption Policy *(GPU, HPC)*** — configures who gets bumped, so your fairness policy is a monetization decision; opens starvation and priority inversion.
- **Spot / Interruptible Tier *(GPU, any)*** — sells idle capacity cheap with the right to reclaim it, raising utilization; customers build critical things on spot and rage when evicted.
- **Low-Latency Interconnect Fabric / Parallel Filesystem *(HPC)*** — cluster plumbing whose slowest member sets everyone's speed, so one dirty optic degrades the whole job.
- **Node Health Check + Auto-Drain *(HPC)*** — yanks a slow node out of the pool before it poisons jobs, converting a silent corruption into a capacity dip.
- **Control Plane HA / etcd Quorum / Admission Policy Engine / Resource Quotas / Progressive Delivery *(Kubernetes / PaaS)*** — the platform-hosting kit and the platform-hosting failure surface in one purchase: quorum loss, admission policy gaps and quota exhaustion all live here.
- **Chrysalis Pool / Warm Pool *(serverless)*** — pre-warmed function shells where buying warmth is buying the absence of a stutter, paid as idle cost.
- **Cabinet / Cage / Private Suite *(colo)*** — three escalating tiers of sellable space with escalating isolation and price.
- **Metered PDU + Circuit Enforcement *(colo)*** — see and police tenant draw and bill actual amps; enforcement creates disputes with the tenants you just metered.
- **Meet-Me Room + Cross Connect Panel *(colo)*** — the colo revenue engine where each cable is MRR, turning the wiring verb into the economy.
- **Carrier Diversity *(colo)*** — each carrier in the building is a marketing stat and a resilience stat at once.
- **Customer Portal with Power Graphs *(colo)*** — a sales feature and a support-ticket deflector in one build, showing tenants their own draw.
- **Tour Route *(colo)*** — a clean impressive path through the facility for prospects, feeding off rack Tidiness, cable trays and the meet-me room's look.
- **Office / Customer Lounge *(colo)*** — pure cosmetics whose only mechanical effect is raising tour conversion for prospective tenants; a great joke and entirely true.
- **Escort Policy / Badge System / Lockable Cabinet Doors *(colo)*** — tenant-facing physical security required by regulated audits, which also slows your own staff and remote hands every time they enter a cage.
- **Remote Hands (as a sellable product) *(colo)*** — billable in 15-minute increments, a margin product and a retention tool, staffed out of your own hands budget.
- **Compliance Boundary Paint *(regulated)*** — a literal painted line placed on the floor defining scope, with in-scope objects taking a uniform skin and the asset count printed on the boundary.
- **Faraday Cage / SCIF *(regulated, government)*** — a sealed room with no visible network exit; it is a room not a tower, so it spends your best real estate on your worst secrets. (+3 var)
- **Evidence Collection System / Quarterly Scan Vendor *(regulated)*** — audit artifacts as an ongoing staff cost, and a sellable product once you already generate them.
- **Residency Fence *(GDPR, data sovereignty)*** — a fence drawn on the world map that data motes bounce off; policy expressed as level geometry.
- **Abuse Desk *(shared, seedbox, bulletproof, email)*** — a staffed complaints function whose under-staffing is a slow doom clock; on bulletproof levels it is optional with a direct revenue tradeoff.
- **Modem Bank / RAS / Terminal Server / RADIUS Auth *(dial-up)*** — countable concurrency as the purest capacity object, with a grid of lamps whose full wall is a busy signal.
- **News Spool / Mail Spool / Shell Server / Web Ring Node / Telco PRI Lines *(period)*** — same mechanics with completely different silhouettes, a cheap and delightful way to reuse the engine across retro dial-up and ISP campaigns.
- **The Dish *(satellite ground station)*** — tracks a visible arc across the sky, and its motion is the level's clock.
- **The Street Cabinet *(edge / MEC)*** — a lonely roadside box with weather effects, no staff, and an LTE modem you had better have bought.
- **Provisioning Automation *(shared, VPS, any volume business)*** — new customer live in 60 seconds instead of two hours of staff time, decoupling revenue from headcount; its speed becomes the attacker's speed, so it needs velocity limits and fraud scoring. (+2 var)
- **Control Panel *(shared, VPS)*** — product-market fit in a box that customers demand; opens a per-account licence cost scaling with your success and repriceable by the vendor at will.

## 4.11 Non-physical buildables: policy, process and paper

- **Graceful Degradation** — serves a static or cheap version when overloaded because half revenue beats zero; requires the app to support it, so it cannot be bought during the incident.
- **Backpressure / The Waiting Room** — queues visitors with a position number rather than failing them, explicitly trading Patience for Capacity.
- **Load Shedding Policy** — the ordered shed list itself, authored in peacetime and reviewed quarterly, and the thing you are grateful for exactly once.
- **Change Review / Change Control** — cuts fat-finger odds and taxes the time cost of every build; mandatory in regulated lines, and the policy you will want to suspend mid-incident.
- **Change Freeze** — a temporary global halt triggered manually or automatically by an exhausted error budget; near-zero self-inflicted incidents and zero progress.
- **Capacity Planning Policy** — information as a purchase, revealing future demand curves early enough to act on build lead times measured in months.
- **Auto-Scaling Policy** — the rule set behind the scaler: thresholds, cooldowns, maximum spend, and whether it may scale during a suspected attack.
- **Terms of Service / Acceptable Use Policy** — lets you remove abusive customers without penalty; without it, firing a customer costs money and reputation, and it decides whether "Unlimited" is marketing or a lawsuit. (+3 var)
- **SLA Tier Definition** — you author the SLA you sell, setting your own difficulty and your own reward, with penalties scaling alongside the price.
- **Compliance Package** — unlocks regulated customers and imposes permanent process overhead on every other action you take.
- **Documentation** — reduces knowledge lost to turnover and is required for audits; produced by staff time and decays if unmaintained, a resource that rots.
- **The Offboarding Checklist** — badge, VPN, SSH keys, password manager, cloud console, registrar, the undocumented shared account and the personal phone with the MFA app; its absence is a threat that waits months.
- **The Escort Policy** — who may be in the building unaccompanied; slows your own staff and vendors, catches the Contractor's Contractor, and is a compliance line item.
- **The Abuse Triage Dial** — the permissive↔aggressive setting the abuse desk enforces, trading legal exposure against customer trust.
- **The Refund Policy** — generous refunds cost margin and buy reputation; strict refunds hold cash and generate chargebacks, which are worse than refunds.
- **Discount Authority** — the per-role discount ceiling the Deal Desk enforces, above which deals route to you and consume executive attention.
- **Mixed-Vendor Procurement Policy** — deliberately buying two of everything: costs efficiency, buys resilience, the purchasing twin of A+B feeds.
- **The Company Handbook** — the written form of Culture covering on-call expectations, blameless postmortems, promotion criteria and remote policy; modifies hiring cost, retention and whether people tell you bad news early.
- **Retention Schedule / Legal Hold** — the policy half of the backup object, turning "delete it" into a legal question and holding storage cost forever.
- **Anycast Withdrawal Policy · Escalation Matrix · MOP and Go/No-Go · Error Budget Policy** — four cross-referenced policy objects defined in §4.4 and §4.6, all using the same Policy card.

## 4.12 Productization: turning operations into SKUs

- **Managed Services Tier** — work you were doing free becomes a line item; once it is a SKU, doing it free for anyone else is a discount you cannot report on.
- **Premium Support SLA** — 15-minute response sold at a price, rationing your best support capability; you must now actually staff it or it becomes an SLA-credit machine. (+2 var)
- **Backup-as-an-Add-on** — the highest-attach upsell in hosting at 25–40%; you have now promised restores, so the Restore Drill stops being optional.
- **DDoS Protection Tier** — defense as a SKU at roughly a 40% markup, so the scrubbing retainer pays for itself.
- **Monitoring as a Product** — resell the monitoring stack you built for yourself, inheriting customer expectations about its accuracy.
- **Migration Services** — charge enterprise and give it free for SMB acquisition, converting your onboarding cost into a revenue line. (+3 var)
- **Dedicated IP / SSL / Domain Registration** — small-ticket, high-attach, near-zero COGS add-ons; domains have the worst margin and the strongest retention effect.
- **Compliance-Ready Hosting** — the same servers with a policy wrapper at 4× the price, and entirely real.
- **Reserved Capacity / Committed-Use Discounts** — trade price for certainty, improving forecasting, then capacity planning, then margin; you hold the capacity against the promise.
- **Spot / Preemptible Capacity** — monetizes idle inventory at a discount with eviction rights; customers build critical things on it and rage when evicted.
- **Colo Cross-Connect** — the purest margin in the industry, recurring monthly per cable and creating switching costs.
- **IPv4 Leasing** — rents your scarce addresses to other operators at near-100% margin, with their reputation attached to your block.
- **Bandwidth Resale / Transit** — sell cheap-bought transit to smaller hosts and inherit their abuse; the commit floor still bites if your own usage drops. (+2 var)
- **White-Label Everything** — your infrastructure under someone else's brand at ~60% of retail; you lose end-user visibility and can be disintermediated by your own partner.
- **Remote Hands / Smart Hands** — billable in 15-minute increments, a margin product and a retention tool, drawn from the same hands you need elsewhere.
- **Escrow, Evidence Packs and Audit Artifacts** — sell the compliance paperwork you already generate, which makes its accuracy a contractual promise.

## 4.13 Rentals, burst, and the panic economy

- **Emergency Scrubbing Activation** — per-hour on-demand scrubbing at several multiples of the retainer rate, activating in ~30 seconds — a decision with a delay fuse.
- **Burst Transit** — 10× your commit for an hour at 8× the rate, instantly available only if pre-arranged, making the arrangement a peacetime purchase.
- **The Burst-Capacity Gate family (three skins)** — Overflow Marketplace Booth, Multi-Cloud Escape Hatch (cash per second plus a lock-in debuff and re-pricing if overused) and Burst-Cloud Gate whose capacity arrives with onboarding work attached.
- **Rented Hands** — a contractor's four hours at an insulting rate, arriving in 30–90 minutes and leaving no institutional knowledge.
- **Competitor Capacity** — borrowed capacity from a peer at insulting prices, available only if you have a relationship; a social stat that becomes a capacity stat during a crisis.
- **Emergency Courier / Expedited Freight** — buys back lead time on a part, a tape or a seed drive at whatever the spot rate is.
- **Emergency Fuel Delivery** — priority refuelling on the spot market during a regional event, at whatever it costs, if anyone answers.
- **The Rule** — panic-buying doesn't save you, panic-activating what you already bought does; rentals are the expensive exception that proves it.

## 4.14 Where the business machine lives: the mezzanine and the desk grammar

- **The Back Office Mezzanine** — a glass-fronted office level above the floor where business buildables are desks and furniture, so an understaffed support function is visibly empty desks.
- **The Desk Grammar** — four slots, forty buildings: surface says tier, tray says workload, prop says function, seat says whether it is staffed and by whom.

---

# Unlocks and discovery — summary

> Source: `master/06-unlocks-and-discovery.md` · 312 idea entries · 238 KB

## 5.1 Unlock philosophy

- **Scar-driven progression (the core principle)** — unlock by experiencing, not by ticking XP; the tree reads as a memoir, each hosting type with its own scar vocabulary.
- **Postmortem Research (the primary engine)** — hit by a threat → its counter's research node opens; *completing the postmortem* is what unlocks it, so every loss is productive. (+10 var)
- **When does a counter unlock? — *CONFLICTING*** — ⚔️ is being hit the *only* gate, or the cheapest of five (news/CVE-gated, idle paid R&D, threat-drops-blueprint, honeypot specimen)? Strict pain-gating authors the build order, punishes competence, walls off new lines.
- **The three acquisition paths (Scar / Foresight / Testimony)** — every node priced three ways: Scar free+fast, Foresight expensive (tabletop/chaos/spike), Testimony cheap but slow (others' scars).
- **Earn the right to be trusted (the CEO framing)** — credit, credentials, allocations and references gate unlocks by an outside party's decision; money alone can't buy parity.
- **Three unlock currencies, three feelings** — Insight (analyzed incidents→defensive tech), Revenue Milestones (scale→bigger kit), Relationships (people→lines, discounts, intel); non-substitutable.
- **The Anticipation Track (unlocking by prediction, not only by suffering)** — bet ≤2 Preparation Tokens on un-hit Codex entries; if that threat lands, counter at half cost + "Called It" bonus.
- **Seeded threat introduction order** — early threat *set* fixed per level, order shuffled per run, so scar trees diverge from hour one.
- **The Second Answer rule (every threat has ≥2 counters at different prices)** — authoring law: each threat needs a cheap leaky partial, an expensive real fix, and ideally a lateral business answer.
- **The lock-and-key fairness rule** — no threat or customer arrives before its counter is at least discoverable; gates may price an answer, never make it unreachable.
- **The Scar Tree** — nodes unnamed/grey until an incident lights them with date, "LEARNED THE HARD WAY" stamp and that incident's cost, summed into lifetime tuition; exportable artifact. (+2 var)
- **Postmortem → Prevention, and Unlock Drafts (pick one of three)** — each incident offers three discounted preventions, take one; the two passed on stay at full price, visibly marked. (+5 var)
- **The Postmortem minigame** — pick root cause from evidence; right unlocks the specific counter, wrong unlocks a partial/incorrect mitigation that mostly works.
- **Symptom → Hypothesis → Tool** — three unexplained latency events or three identical complaints unlock the *option to buy* the profiler that would have found it.
- **Teach through loss, never through text (and the Near-Miss clause)** — no tutorial pop-ups; lessons too costly to teach by loss (total data loss, shutdown) arrive first as a near miss that still unlocks.
- **Discovery, not just purchase** — an "investigate" verb on odd log lines excavates ~a fifth of the tree that no amount of money can reach. (+1 var)
- **The unlock trigger taxonomy** — the coverage-audit list: Survive-It, Fail-It, Autopsy, Volume, Relationship, Intel, Hire, Certification, Acquisition, Geography, Era, Inspection.

## 5.2 Scar-driven unlocks (pain → capability)

- **Certificate expiry ladder** — expire once → expiry dashboard; twice → ACME automation; internal PKI expiry → Certificate Inventory scan. The template for "just automate it" scars.
- **First "everything is green but customers are down"** — → synthetic transaction monitoring + percentile alerting; teaches you to stop trusting the green square.
- **First backup restore failure — *and the earlier, kinder trigger*** — → Restore Drill + "Verified Backup" badge; also fires when a prospect asks your RTO and you don't know.
- **First Slowloris** — → event-driven reverse proxy. Triad: raise timeouts (cheap, kills slow mobile) / proxy (correct) / put a CDN in front (lateral).
- **First OOM kill of the database** — → memory limits, `oom_score_adj`, and the swap-tuning panel.
- **First cache stampede** — → request coalescing + stale-while-revalidate; sharpest on CDN, web and API lines.
- **First correlated batch drive failure** — → Mixed-Vendor Procurement *policy* (costs more per drive, removes correlation); a policy unlock, not a building.
- **First rebuild failure during a degraded RAID** — → RAID6, hot spares, batch diversity; the counter nobody buys until they've watched a 14-hour rebuild bar fail.
- **First breach** — → the whole Forensics branch (log retention, FIM, immutable audit trail, timeline minigame), Segmentation, Immutable Rebuild, IR Plan, cyber insurance, "we've been through it" trust modifier.
- **First blocklist listing** — → outbound mail monitoring, per-account send caps, dedicated IP pools, Delisting Request, IP Reputation stat; email/shared/VPS. (+1 var)
- **First alert-fatigue-induced miss** — → alert tuning, dependency-aware suppression, severity tiers.
- **First bad fleet-wide config run** — → canary deploys and `--limit`.
- **First time a firewall rule locked you out of your own estate** — → commit-confirm: risky changes auto-revert in ten minutes unless you cancel a visible countdown.
- **First split-brain** — → quorum/witness nodes and fencing (STONITH), with flavour text explaining the name.
- **First BGP incident** — → RPKI/ROA signing and prefix filters.
- **First BGP dampening event** — → "administratively shut a flapping session" as a first-response action; being intermittently up is punished.
- **First health-check flap cascade** — → slow-start, connection draining, outlier ejection.
- **First retry storm you caused yourself** — → jitter and exponential backoff; three lines of config against a full outage.
- **First time you lost a whole rack to a single PDU** — → A/B feed auditing plus the power-path visualizer that highlights feeds secretly sharing.
- **First gray failure discovered the hard way** — → synthetic monitoring, percentile alerting, then distributed tracing and error budgets.
- **First unidirectional link failure** — → link-verification protocols and the is-it-bidirectional check.
- **First microburst-caused drop with a flat graph** — → fine-grained interface telemetry plus a resolution dial that trades storage cost for seeing the outage.
- **First thin-pool exhaustion** — → storage reservation policies and pool-level alerting; the overcommit lesson in storage form.
- **First "nothing changed" incident** — → the Growth Ceiling overlay; teaches that there are two kinds of failure and knowing which matters.
- **First time your alerting path was down with the service** — → out-of-band alerting.
- **First time you needed a switch config you didn't have** — → network config backup, plus the realisation your backups covered servers only.
- **First incident where three engineers duplicated each other's work** — → Incident Command: roles, a commander, a scribe, one comms channel.
- **First RFO demanded by a customer** — → structured timeline capture and the evidence system.
- **First time a customer's pentest found something you didn't** — → the Bug Bounty node early, plus the Customer's Pentest Report as a recurring discovery source.
- **First break-glass need** — → the break-glass safe, only after the level where you needed it.
- **First counterfeit / grey-market part failure** — → procurement provenance policy: more per unit, guaranteed supply chain. (+1 var)
- **First decommission that broke something** — → the Scream Test as a usable verb.
- **First warranty-expiry incident** — → support-contract planning view with expiry dates across the fleet.
- **First DR declaration you could not honour** — → DR oversubscription model and priority tiering; you sold the same failover capacity nine times.
- **First time the lab became production** — → environment tagging and a hard `production` flag that changes which actions are permitted.
- **First chargeback** — → Fraud Screening; first wave → scoring tiers; sustained spike → rolling-reserve preparedness (a second acquirer standing by). (+1 var)
- **First key employee quits** — → Documentation as a first-class buildable, Offboarding Checklist (retroactively kills the Ex-Employee threat), on-call rotation tuning.
- **First traffic spike survived** — → Caching branch; at 1M requests in one shift, Cache Layer *and* the CDN business line.
- **First DB built** — → SQL injection enters the bestiary and WAF becomes purchasable.
- **First hardware failure** — → RAID and spare-parts inventory.
- **First customer churn** — → Exit Interview and Save Offer. (+1 var)
- **First low-and-slow attack detected** — → the Anomaly Detection branch.
- **First chaos test run** — → resilience scoring and the "Confidence" stat become visible.
- **First abuse complaint received** — → Trust & Safety hireable; first upstream warning → the Abuse Ladder revealed (warning → suspension → null-route → de-peering).
- **First refund demanded** — → the Refund Policy setting.
- **First outage with customers on it** — → the Status Page and the concept of an SLA. (+1 var)
- **First SLA credit paid** — → the SLA Reserve and the contract-tier editor that lets you write your own SLA terms. (+1 var)
- **First churn survey response** — → the Save Offer.
- **First customer who came from another customer** — → the Referral Program.
- **First enterprise prospect** — → Security Questionnaire minigame → Compliance Vault line; a deal lost to one → the Trust Center public controls page.
- **First month where support cost > 30% of revenue** — → cost-to-serve analytics per customer; you can finally see your Support Vampires.
- **First cash crunch** — → the Cash Forecast view.
- **First annual prepay** — → Deferred Revenue tracking, and the realisation the cash is not yours yet.
- **First employee / first employee quitting** — → payroll and the org chart / runbooks and documentation.
- **First acquisition offer received / first acquisition made** — → the Valuation view / the Migration Toolkit and Integration Playbook.
- **Lose a whale** — → Concentration Risk alerts and the Diversification objective.
- **Running out of IPv4** — → IPv6 (long tail of unreachable customers) and CGNAT (shared reputation, support burden), each with its own downside. (+1 var)
- **Overheating a rack** — → the Thermal Modeling overlay; an information upgrade rather than a building.
- **Surviving a full power outage on generator** — → Fuel Contract and 2N designs; three generator load tests → Tier III rating → enterprise customers.
- **A customer's ransomware event** — → the immutable / air-gapped backup line of business; trauma converted into a product.
- **Firing an abusive customer** — → AUP Enforcement and the Abuse Desk; surviving a bad customer instead → Risk Pricing, gateway to the Bulletproof line.
- **Handling a security Researcher well** — → Bug Bounty, a permanent passive that pre-telegraphs one exploit class per level.
- **Winning a bidding war against The Competitor** — → intel on their board: you see part of what they've built.
- **Completing a no-downtime migration** — → Live Migration as an ability in all future levels; a verb unlock, not a number unlock.
- **Passing an audit** — → the Regulated Hosting business line plus a badge that raises Evaluator conversion.
- **Peering at an IX** — → Anycast and the world-map layer.
- **Business scars (the commercial half of the table)** — 14 commercial pain→tool rows: unbilled service→Revenue Assurance, MFN surprise→Clause Library, stranded capacity→Yield Manager, price rise churn→grandfathering, etc.
- **Failure-Only Nodes** — elite branches reachable only by catastrophe: total data loss → elite backup, bankruptcy → next-run financial discipline, plus a permanent memorial entry; collides with the Near-Miss clause.

## 5.3 Milestone unlocks

- **The milestone law (the threshold is the consequence, not the count)** — a milestone fires when the old method visibly breaks, after 60–90s of felt strain, not at a round number.
- **Scale milestones (infrastructure)** — the size table: 10 customers→ticketing, 50→provisioning automation, 100→abuse desk+cohort analytics, 1,000→self-service portal (−40% tickets, new attack surface), own /24+ASN→BGP, 2nd site→GSLB/quorum, 1 PB→tiered storage. (+3 var)
- **Operational-threshold milestones (the numbers that change how the job *feels*)** — 2nd person→naming conventions + shared inbox, ~50 machines→config management, ~150→spares pipeline/RMA, two timezones→shift handoff, two power feeds→power-path model.
- **Commercial-threshold milestones** — first invoice request→AR/net terms, first inbound contract→MSA+quote desk, $10k MRR→bookkeeper, first renewal cohort (elapsed time, not achievement)→renewal calendar.
- **Invisible-save milestones (the achievements nobody else can see)** — zero-impact incident, unnoticed failover, air-gapped restore, own ASN, hiring someone better than you (cuts your AP cost); pay reputation nobody sees.
- **Event unlocks (the first-time-it-happened table)** — good-event triggers: first HTTPS customer→cert automation, competitor's regional outage→multi-site, DDoS survived→scrubbing partner; breached while uninstrumented locks out learnings. (+1 var)

## 5.4 Discovery mechanics

- **The Threat Codex / Bestiary (fill-in-the-blank)** — black `???` silhouette cards upgrading Seen→Analyzed→Countered→Mastered; each carries your win/loss record, what stopped it last time, lifetime cost, and a build-invites filter. (+5 var)
- **Progressive Icon Disclosure** — the board glyph itself gains detail with Codex level, so a veteran's screen visibly differs from a novice's.
- **Asset Discovery Scan / The Audit Sweep** — spend staff-hours scanning your own estate; repeatable, and always finds something embarrassing (forgotten server, open test VM, default creds).
- **The Discovery Ledger (making the scan a recurring, positive action)** — the scan as a cheap repeatable peacetime action with an authored table: 40% forgotten machine, 25% exposure, 20% dependency, 10% forgotten cost, 5% strange.
- **The External Attack Surface Scan** — the same scan run from outside: forgotten subdomains, exposed management interfaces, buckets, CT-log hostnames you thought were private.
- **Certificate Inventory Discovery** — finds every cert including internal CAs, keystores and dead hosts still in DNS; unlocked by the first internal PKI outage.
- **Growth Ceiling Discovery** — after a "nothing changed" outage, every component shows its nearest hard limit (table size, ports, inodes, TCAM) and a projected arrival date.
- **Change Correlation ("What changed?")** — overlays every change by anyone onto the incident timeline; unlocked after a change nobody remembered, and teaches the "nothing changed" branch.
- **The Scream Test (an unlockable verb)** — discover dependencies by removing availability on purpose; three tiers (unplug/power off/unrack) with a player-set duration dial as the real decision.
- **Bisection (an unlockable verb)** — split-the-suspect-set generalised to backends, versions, tenants, paths, ASNs and time, with a visible 2^n countdown.
- **The Depth Test** — pull a cable or fail a feed to check the redundancy you paid for actually exists; the best way to learn your A/B feeds share a PDU.
- **Packet Capture (the expensive, definitive, late-game tool)** — a timed tap with a size budget on a link you must choose before you know where the problem is; the last observability unlock.
- **Flow Records and Traffic Archaeology** — cheap months-long aggregated retention; answers who talked to the box you're about to unrack, and what beaconed since March.
- **Traffic Analysis** — the business read of your own flows: who's the bandwidth hog, what share is bots, which host talks to a country it shouldn't.
- **Cable Tracing / Cable Archaeology** — a facility minigame correcting the logical map you've been playing on; can find a free existing cross-connect or a live circuit you nearly cut.
- **The Undocumented Dependency** — hidden map edges that surface only when they break; the game tracks what-you-know vs what-is-true as a closable percentage.
- **The Undocumented Machine** — inherited hardware of unknown function: unplug and find out (fast, risky), trace cables (slow, safe), or leave it to become load-bearing.
- **The Forgotten Subnet** — an old routed range found by your scanner or by an attacker's; whoever finds it first decides what it's for.
- **The Ghost Customer** — an account with no contact info still consuming resources; unbillable, unreachable, undeletable until you resolve it for capacity and compliance.
- **The Inherited Estate** — acquisition-scenario discovery minigame: map the network, find the undocumented, identify the load-bearing hack that's terrible and irreplaceable.
- **Log Archaeology / Log Reading (active discovery)** — spend staff time on old logs to find an earlier compromise or true degradation start; optional detective layer, requires log aggregation.
- **Threat Hunting** — expensive senior time searching with no alert; sometimes finds a two-year-old backdoor, often nothing, and the game must not soften that.
- **Hardware Autopsy** — dissect an RMA part to learn random vs batch defect; changes response scale from replace-one-drive to replace-forty.
- **Honeypot Intel** — honeypots and sinkholes passively mint Intel, which researches un-met threats, fingerprints attackers, and at scale sells as a threat feed. (+3 var)
- **Reverse-Engineering an Attack** — capture a threat alive and dissect it at a Research Bench with specimen dome, microscope and labelled sample jars; the museum is the menu. (+1 var)
- **Boss Blueprints** — defeating a boss-tier threat drops a schematic obtainable no other way, making disasters read as content rather than punishment. (+1 var)
- **Blueprint Fragments (repurposed as partial intelligence)** — torn pieces carrying provenance marks (scorched/stamped/letterhead) that pre-fill Codex sections on threats you haven't met, feeding the Anticipation Track. (+1 var)
- **The Runbook Ladder** — six rungs Notice→Runbook→Assisted→Automated→Policy→Retired, with a 3→4 fork ("automate this" vs "investigate why") and rung 6 celebrated loudest. (+7 var)
- **The Runbook Library** — each documented incident type becomes a one-click reduced-MTTR response; spines visibly fade and warp when unexercised.
- **Post-Mortem Writeup (blameless postmortems as an XP mechanic)** — per incident pick Blame (fast, free, morale −) or Blameless (costs a hand, double research); N published writeups set a permanent reputation floor.
- **The Post-Mortem Photo** — a developing polaroid of the failure moment, captioned and pinned to a scrapbook wall; some unlock the matching preventative buildable.
- **The Graph You Didn't Have** — post-incident, the game shows the graph that would have caught it had you bought monitoring; once per metric, never repeated.
- **The Fog of Instrumentation** — uninstrumented estate renders fogged in three grades — Unknown (grey `?` mass), Stale (`last seen 4m` watermark), Live; buying observability buys sight.
- **X-Ray Inspector** — cutaway vision into any object showing a fixed five-plate stack (firmware→OS→runtime→framework→app) with CVEs as cracks and patch lag as dust.
- **Chaos Engineering Lab** — a Foresight path: pay a small planned outage to open nodes you haven't been scarred into. (+3 var)
- **Load Testing Rig** — reveals your real breaking point and which component fails first, almost never the one you expected.
- **Tabletop Exercise** — the purchasable-foresight shortcut; converts an Anticipation Token into a guaranteed partial unlock for cash.
- **Postcard from the Future / Capacity Forecast** — enough monitoring history unlocks trend projection ("DB disk fills in 41 days"), turning reactive play proactive.
- **Vendor Advisory Feed** — a cheap build giving one turn of advance warning on zero-days and hardware advisories; surprise attacks become scheduled patch work. (+5 var)
- **The Vendor's Own RFO** — your upstream/CDN/DNS vendor publishes a post-incident report; reading it costs nothing and unlocks a node.
- **The Reading Room** — a quiet-time screen of public postmortems from companies you don't use, sold as cheap Intel; the canonical Testimony path.
- **The Competitor's Postmortem** — a rival's public outage write-up appears in the trade ticker; a small hand cost unlocks that counter at a discount, unsuffered.
- **The Customer's Pentest Report** — an enterprise client's test of you arrives as a free list of weaknesses, each finding an obligation with a clock on it.
- **Threat Intel Sharing / Peer Network** — join an operator community so other players'/NPCs' incidents become your early warnings; the group form of Testimony.
- **The Escalation Ladder (vendor relationship as a mechanic)** — L1→L2→TAC→named SE→the person who wrote the code; rungs skipped by relationship stat and whether you file *good* tickets.
- **Vendor Demo / The Vendor Trial** — once per level a vendor lends an unowned tool free for three minutes; it fully works, then leaves a visible "you had this" gap. (+2 var)
- **Vendor Relationships** — repeat buying unlocks premium lines, lead times and a phone that answers — plus lock-in, inherited EOLs, and art-palette changes per vendor house style. (+9 var)
- **Job Applicant Skills / Staff-Carried Knowledge** — hires unlock their specialty branch and draw it on your whiteboard in their own handwriting; if they leave the marker fades to 40% but never erases. (+7 var)
- **The Conference Talk** — send or give a talk: returns a choice of three nodes weighted to your struggles; giving one converts your worst day into reputation and cheaper hiring. (+2 var)
- **The Field Trip** — tour another operator's facility for one facility node, one layout improvement, and a relationship.
- **The Standards Body** — fund an engineer in a working group for a one-era protocol head start, deprecation warnings, and standing with technical customers. (+2 var)
- **Research Papers / Conference Talks (the library path)** — spend staff time to learn a technique permanently across the campaign, not just the level.
- **The Mentor** — an NPC veteran giving one hint per level, unlocking a node if followed; the only acceptable tutorial text. (+2 var)
- **Reading the Docs** — idle staff in quiet periods slowly generate insight that unlocks nodes, so 100% utilization is punished.
- **The Scale Threshold Reveal** — topology shape triggers the reveal: at 3+ web servers the Load Balancer node visibly pops onto the whiteboard with a "!" burst.
- **The Mystery Box Reverse-Engineer** — spend hands on an acquisition's undocumented server to learn what it does; a gambling minigame built from technical debt.
- **Competitor Intel** — scan their IP space, read their status page, watch their outages; unlocks poaching openings and a read on where they're weak. (+1 var)
- **The Competitor Teardown** — buy their product to learn features and pricing, unlocking counter-positioning; Tier 4+ adds an ethically dubious copy-at-a-discount.
- **Trade Show Serendipity** — attending yields a partnership, a hiring lead, or a market-shift read, offered as a choice of three rather than rolled.
- **Customer Conversations / Discovery by Customer Request** — a request you can't fill starts a research node; the same ticket twenty times is a product unlock, and the game counts them. (+7 var)
- **The Accidental Niche** — 30%+ of customers sharing a vertical triggers a "Specialize?" offer: big conversion multiplier there, penalty everywhere else.
- **The Feature You Built for One Customer** — bespoke enterprise work (SSO, say) becomes a productizable line.
- **The Support Macro That Became a Product** — a script your team wrote for a common problem, packaged and sold as a managed service.
- **The Log That Told You Something** — analytics surface insight cards ("week-1 installer users churn 60% less") and acting on one is a buildable objective.
- **Business discoveries (the economics you learn by running into them)** — 19 reveal-is-the-mechanic moments: overselling dial, renewal cliff, cross-connect margin, 95th percentile, dedup, negative-margin customers, whale problem, MDF, demand response.
- **Discovery by Incident Adjacency (near misses teach too)** — a near miss pays smaller Intel and a Codex partial-fill, rewarding instrumentation good enough to notice it.
- **The Rumor Board** — a corkboard of clippings, list printouts and blurred CVE advisories hinting at threats you can half-see and prepare for. (+1 var)
- **The Acquisition Folder** — a manila folder of the acquired company's gear photos to browse before inheriting; deliberately incomplete, so surprises survive.
- **The Overlay Unlocks (new ways to see)** — each lens (heat, power, blast radius, cost-per-U, latency, thermal, growth ceiling, change correlation) is itself an unlock with a re-render animation. (+1 var)
- **Open Source Contribution** — contributing draws your logo on a community board and unlocks free tooling; maintainer trust tiers to private pre-CVE warnings. (+4 var)
- **Attack Fingerprint → Signature** — every L7 attack that lands leaves a log pattern; senior time analysing it mints a permanent WAF rule from your own traffic.
- **The Dark Forest (reconnaissance reveals what is aimed at you)** — you never see the full catalogue; recon shows only what targets you, so your build choices generate your enemy list.
- **The Status-Page Crawler** — subscribe to every upstream and peer's status feed; their incidents arrive as a rumor curve 5–20 min before your first ticket.
- **The Abandoned Datacenter (exploration and salvage)** — a mid-campaign side map of a dead host's estate; salvage drives, tapes and patch panels to reverse-engineer lost tech. (+8 var)
- **Proactive hidden unlocks** — invisible nodes that fire only for discipline: patch within X minutes three CVEs running → zero-day hardening; low PUE all campaign → green-power discount. (+1 var)
- **The Acquired Tech Tree (M&A as progression)** — buying a smaller host instantly grants their buildables at degraded quality plus upkeep debt and ~80% customer retention; the only cash→tree route. (+4 var)
- **The Consultant** — pay a snooty expert to preview the next wave and recommend builds; ignore them and survive and your next consultant is cheaper.
- **Case Study Vending (peer learning)** — a kiosk selling anonymized aggregate disaster stats from other players ("41% lost this level to memcached reflection") as pre-level intel.

## 5.5 Tech tree branches and shapes

- **The six-branch spine (Serve / Shield / Scale / Sustain / Sell / Sense)** — a top-level taxonomy every buildable maps to; ⚔️ four rival taxonomies (six/eight/seven/Three-Pillars) compete, resolution proposes deriving branches from the nine defense roles. (+4 var)
- **The shared tree, the per-type Loadout** — one shared tree, but each hosting type starts a level with an 8–12 buildable Loadout; unlocks persist, availability is per-type.
- **Crossover Nodes ("Transferred Knowledge")** — a lesson learned in one type becomes available in another, labelled with its origin line, making the campaign cumulative not episodic.
- **The CEO branches** — a parallel business tree (Pricing Science, Retention, Margin, Trust, Channel, Brand, Finance, M&A) modifying rates, gated on measured data rather than money. (+7 var)
- **Branch ladders (the concrete step sequences)** — 13 authored rung sequences (Availability, Performance, Security, Data, Facility, Density, Network, Automation, Commercial, Compliance, Efficiency, Sustainability) where each rung raises a ceiling and adds a failure mode. (+1 var)
- **Cross-Branch Synergy Nodes** — nodes requiring two branches: Observability+Automation=Auto-Remediation, Security+Compliance=Certification, Sell+Sense=Cost-to-Serve Pricing; each has a worse single-branch substitute. (+1 var)
- **Mutually Exclusive Forks** — sibling-locking choices for the run: Managed Everything vs Roll Your Own, Vertical Integration vs Asset-Light, Scale Up vs Scale Out. (+3 var)
- **Mutually Exclusive Doctrines (one per campaign act)** — pick Fortress (defense, enterprise), Racetrack (latency, consumer volume) or Sprawl (many cheap sites); each fails in its own characteristic way.
- **The Doctrine card (a loadout you declare before a level)** — one framed card on the office wall per level: Belt and Braces, Fast and Loose, Sell the Sizzle, Nobody Gets Paged, Boring on Purpose, Scale Out/Up. (+1 var)
- **Regret Nodes** — cheap early nodes (a per-account-licence control panel) that turn harmful at scale; ⚔️ fun-first says never punish an early reasonable choice, authenticity says debt is universal — resolved by escapable-at-a-cost plus a "⚠ scales poorly" chevron.
- **Certification Gates** — nodes that cost clean operating days rather than money; patience bought with gameplay you must actively maintain.
- **Rival Tech / Espionage** — observe a competitor's stack to copy it at reduced research cost, with an ethical cost and reputation risk if caught.
- **Rediscovery / Prestige** — a new run keeps a fraction of prior knowledge: previously-unlocked nodes are cheaper but never free. (+3 var)
- **Retired Tech (the tree keeps moving)** — old unlocks go obsolete each Act so the tree doesn't merely accrete into an "I have everything" flatline.
- **The Whiteboard Tree (the tree is a diegetic object)** — the tree is the office whiteboard: messy, hand-drawn, carrying the roads not taken, who-knows-what markers, and generation bands.
- **The Dependency Atlas** — an unlock draws new *edges*, not just nodes: KMS draws the key-supply lines making your topology and attack graph visible in one stroke.

## 5.6 Unlocking whole lines of hosting business

- **The prerequisite lattice** — each line gated on what it really depends on: anycast+3 PoPs→DNS then CDN, verified restores→Backup/DR, power density+liquid cooling→GPU, 12 clean IP months→email. (+1 var)
- **The commercial prerequisites** — the other half of the gate: regulated needs insurance limits + 12 months auditable history, GPU needs OEM allocation and financing, colo landlord needs an insurance program.
- **Alternative prerequisite sets (two or three routes into every line)** — ⚔️ a strict DAG becomes one optimal path; fix is 2–3 routes per line (12 clean months OR acquire a company that has them OR hire a deliverability specialist).
- **The visible lattice, with readable locks** — lock conditions readable from the start so the twelve months mean something while you live them; open a line at 60% readiness for a permanent "we launched early" scar.
- **The playable 12 months (making the best gate interactive)** — the reputation meter moves on individual decisions (marginal customer, spam incident, slow abuse response), so the gate is maintained not waited out.
- **The Pivot Lattice (what a pivot actually costs)** — every transition rated on customer overlap, hardware reuse, staff transfer and regulatory delta; you pay both lines' P&Ls through the overlap period.
- **The line catalogue (every pivot, its gate, and what it does to you)** — 22 pivots with gates and consequences: Dedicated→Colo (spare rack space), →Managed (2× revenue, 3× tickets), →Bulletproof (gate is choosing to), Operator→Landlord→REIT (score becomes NOI).
- **The Adjacent Opportunity** — an event card offers the next line when you're structurally ready ("400TB unused and three backup requests — open a Backup line?").
- **Discovery by Customer Request (the customer is the tech tree)** — saying yes to an adjacent ask discounts the research node and guarantees the new line's first customer; saying no may cost the client, shown two levels later.
- **Repurposing** — retired hardware seeds a cheaper line (budget VPS, seedbox), ending in ITAD residual value that funds the next generation.
- **Type Mastery / cross-line buffs** — running a type well grants a permanent everywhere bonus: Game Hosting→latency, Backup→durability, Colo→facility efficiency. (+1 var)
- **Retiring a line, and the knowledge you keep (the distillate)** — closing a line yields one permanent cross-line bonus from what it taught you, so deliberate shrinking becomes a winning move.
- **The Certification Ladder** — SOC 2 I → II → ISO 27001 → PCI → HIPAA BAA → FedRAMP, each costing in-game months, clean history and a playable audit, each opening a customer tier that cannot otherwise buy. (+14 var)
- **The certification chain — *CONFLICTING*** — ⚔️ is there one canonical order paced by evidence periods, or five rival orderings — including Variant E, which denies the chain entirely and makes certs independent segment doors?
- **Carrier & Peering unlocks** — single transit→dual→IX port→private peering→own ASN and /24→anycast→global, each cutting transit cost and opening the line above it. (+4 var)
- **The Era Unlock** — the campaign moves dial-up ISP→shared→VPS→cloud→GPU; each era obsoletes lines and opens others, and failing to transition is a real lose condition. (+1 var)
- **Geography unlocks** — new regions grant free cooling in the north, desert solar, hydro, a cable landing or a tax abatement, each with its own regulatory regime and opposition risk. (+2 var)
- **The Reputation Gate (both directions)** — high reputation opens enterprise/regulated/government; low reputation locks those and opens the grey lines that pay better and cost everything else.
- **Portfolio unlocks** — 2 lines→Portfolio Meter, 3→Line P&L, 4→Cross-Sell engine and synergy map, 5→"What Are We Even" identity stat and the Focus divest decision.
- **The Forbidden Branch (the dark-web market and the tech you cannot unlearn)** — zero-days, bribes and rented botnets raise a permanent heat meter; bulletproof upgrades become unlearnable if you go legit. (+4 var)

## 5.7 Anti-unlocks, deprecation, and rot

- **The Deprecation Mechanic** — nodes go yellow (aging) then red (EOL); EOL still works but blocks newer dependents; ⚔️ per-node rot is 40 chores, resolved by rotting whole generation bands as one project.
- **Concerns ratchet, implementations rot, eras gate** — ⚔️ resolved: concerns never go away, implementations age out, eras gate implementations only — you always think about power, not always this PDU.
- **Product rot (commercial deprecation, which is worse)** — a 2019 plan on a dead platform with customers who won't migrate; sunsetting is a whole scenario with notice periods, grandfathering and a priced churn spike.
- **The accreditation-loss rule** — the law: losing an accreditation doesn't break what you have, it stops what's next — existing contracts run to term, no new ones, re-cert costs more than upkeep.
- **Lapsed certification** — an expired cert loses its customer tier; framed certificates go crooked and dusty and the lobby wax seals tarnish into a to-do list.
- **Losing insurability** — a claim history or failed underwriting locks the enterprise tier that contractually requires you to carry cover.
- **Losing peering** — a ratio dispute or de-peering spikes transit cost overnight and evaporates a latency advantage you were selling.
- **Losing a brand** — a trademark dispute or a non-compete sale removes a storefront, and its customers do not transfer to your other brand.
- **Losing the recommended-host slot** — one bad support-metrics quarter drops you from a platform's recommended page; signups fall four weeks later, not immediately.
- **Losing your acquirer relationship** — a processor exit or termination locks the card-payment node until you requalify under new underwriting, reserves, maybe a new entity.
- **The commission residual you can never stop paying** — a permanent margin tax on a book bought on residual terms; undoable only by expensive buyout.
- **Three SLA breaches** — the 99.99% product locks until you re-earn it over N clean months; the SLA is a privilege you can lose.
- **Burned affiliate relationships** — late payments or clawbacks grey out the channel node; re-earning it demands worse terms than you had.
- **Fired the CSM / cut the content team** — cutting cost removes capability on a delay: churn steepens two months later, organic acquisition decays over a quarter.
- **Knowledge decay** — a runbook unused for N months loses its MTTR bonus until a drill refreshes it; binder spines fade and warp.
- **The Abandoned Wing** — divested lines go dark, not away: dust sheets, belt barriers, accent hue at 15% saturation, one motion-sensor light that follows your camera.
- **The Rot Materials** — four visible material states (Current / Aging "EOL 20XX" peeling sticker / EOL orange faceplate band + off-temperature LEDs / Abandoned dust sheet) so rot reads without an overlay.

## 5.8 Unlock presentation and payoff

- **The Unlock Ceremony Tiers** — a stated ceremony budget by cost: Tier 0 chime 0.2s, Tier 1 faceplate wipe 1s, Tier 2 cutscene 6–10s, Tier 3 full ceremony 15–20s.
- **The Whiteboard Tree / The Tech Wall** — the tree as a hand-drawn office whiteboard with smudges, coffee rings, pinned Polaroids and string; locked items face-down, unlocking redraws a section. (+1 var)
- **The Marker Colour Code** — black = exists, blue = planned, red = scars, green = worked, faded blue = decayed knowledge; staff-drawn nodes keep their own handwriting.
- **The Whiteboard at Scale** — the board grows with you: one at Tier 1, four plus taped A3 printouts by Tier 5; a "clean copy" action costs a hand and stays neat ten minutes.
- **Blueprint Export as a Reward** — a high-scoring level yields a printable cyanotype one-page schematic of your build with company mark, date range and scar count.
- **The Blueprint Tube** — major unlocks arrive rolled in a cardboard tube you physically unroll with a drag, giving you something to do at the moment of reward.
- **Rack Elevation Catalog** — the buildables list as a vendor PDF spec sheet; locked items blacked out like a redaction, era-locked items absent with the page numbering skipping.
- **Rack Mail — "The Catalog"** — a glossy catalog arrives periodically for window shopping before affordability; era-shaded (1994 fax, 1998 newsprint, 2024 web configurator).
- **The Trade Show Floor** — an unlockable convention-hall hub of vendor booths you walk between, each demoing one buildable and offering a trial. (+2 var)
- **The Lab Bench / Research Bench** — a physical R&D corner where in-progress research is a half-assembled thing on the bench with a scrub, readable from across the room. (+1 var)
- **Floorplan Blueprint** — facility unlocks draw as new rooms on an architectural plan whose title-block revision number increments with each expansion.
- **The Pegboard (specified)** — a shadow board where unowned tools are painted silhouettes, owned tools hang in outlines, in-use tools are missing, and lost tools leave a dusty hook.
- **The PCB Trace Tree (alternate unlock skin)** — a conventional-tree option: solder pads light and traces carry current; locked branches are unpopulated footprints showing the shape of what's missing.
- **Censored Silhouettes** — undiscovered items render as name-redacted black shapes, so you can see the rack-, dish- or generator-shaped hole and start planning.
- **The Confidence Stroke Law** — universal: hollow stroke = asserted, solid fill = verified; untested backups, failovers, certs and N+1 badges all render hollow.
- **Certification Wall / Trophy Rack / The Seal Wall** — certs as wax or foil lobby seals that tarnish approaching re-audit and frames that go crooked when lapsed, making the wall a to-do list. (+2 var)
- **The Sticker Progression** — certs, vendor partnerships and passed audits become stickers on gear, laptop lids and rack sides; a veteran company is covered in them.
- **The Patch Jacket** — a hanging jacket accumulating embroidered patches per milestone (first DDoS, first PB, first clean audit); the only display about you rather than the company.
- **The Dead Drive Shelf (prestige)** — every drive that ever died, shelved in rows with a handwritten date; the physical twin of the Scar Tree's lifetime-cost figure.
- **The Hiring Board** — a corkboard of resume cards with photo, role silhouette, skill pips and salary tag; better reputation makes better cards appear, so you see your employer brand.
- **The Vendor Rolodex** — one card per vendor with a relationship edge-glow in their own brand style; good standing shows as visibly shorter truck ETAs and catalog early access.
- **The Delivery** — hardware arrives as a 10s cutscene: liveried truck, pallets, rails, the detent as the unit slides in — with a crate-on-the-dock state making lead time physical. (+1 var)
- **Faceplate Reveal / Blueprint Stamp** — cheap unlock variants: the front panel wipes in as its LEDs sequence, or a blueprint card is stamped red UNLOCKED and filed.
- **The Lights Come On** — the universal unlock beat: POST sequence, fans spinning to pitch, LEDs walking left to right, then settling to idle. (+1 var)
- **Zoom Tier as an Unlock** — you earn the Campus and Globe cameras; the first pull-back to a view you've never had is the cheapest Tier-3 ceremony in the game.
- **Tier-Up Title Card** — crossing a tier plays a slow camera pull-back from your infrastructure revealing the new scale, tier name typeset over it.
- **The Overlay Reveal** — each new lens announces itself by re-rendering the world in that lens (heat, power, blast radius, latency field). (+1 var)
- **Business License Board / Pivot Blueprint / The Sign-Bolt** — a new line gets the biggest ceremony: framed placard, floor-plan redraw, and a sign crane-bolted to the building, making a three-line company a visible chimera.
- **The Wing Build-Out** — new lines start as a taped floor outline, then studs, then walls, so a pivot is visibly under construction and visibly stalls if money runs out.
- **The Business Licence Wall (with a lifecycle)** — framed placards in launch order with accent colour and date; active lit, divested turned to face the wall, badly-lost lines with cracked glass.
- **Cross-Line Synergy Glyphs** — synergies render on the placard board as two line icons joined by a bracket; antagonisms show the same pair with the bracket cracked.
- **Whiteboard Redraw** — a pivot, divestiture or era change wipes and redraws the board with a squeaky-wipe animation; the only time the game destroys player work on purpose.
- **The Runbook Binder Tabs** — each solved incident class adds a labeled tab; a thick tabbed binder is the game's best "number goes up" without a number.
- **The Post-Mortem Polaroid wall** — one wall for what you won, one for what it cost: real captured frames with UI hidden, chemically developing and pinned with a handwritten date.
- **The Conference Talk (as a presentation beat)** — publishing a postmortem plays a bad-clip-art slide deck, clears your reputation sky a shade, and unlocks a hiring bonus.
- **Diegetic tech-tree presentations (patch panel, terminal popup, showroom)** — three house-style skins: cable arcs plugged across a patch panel, era-styled DOS `NEW SERVICE AVAILABLE` popups, and a showroom where research pulls the dust sheet off.
- **The Handbook and the RFC Bin** — every unlock prints a page into a desk binder you can watch thicken, annotated with coffee stains from the incident that taught it. (+1 var)
- **Tech Tree as Energized Schematic** — the tree as a NOC-wall wiring diagram where buying a node closes a circuit and current visibly runs down the newly lit branch.
- **Rack Space as Unlock Currency** — early on the unlock *is* a free U in the rack: facility tiers add real estate rather than menu entries, teaching spatial reasoning for free.
- **Sketchbook Reveal** — discovery flips a sketchbook open and draws the item pencil → inked → rendered in the level palette, showing what it looks like before what it does.
- **The Failure Museum** — each unique way you have lost becomes a wax-museum diorama in an HQ hall; visiting one grants a small permanent buff against that failure class.
- **The shape of the tech tree (presentation) — *CONFLICTING*** — ⚔️ which diegetic object is the default: the hand-drawn whiteboard (with PCB as accessibility skin), or branch menus / a topology graph / a 42U rack elevation / the patch-panel family?

## 5.9 Credentials, permissions, and accreditation (the unlocks you cannot buy)

- **Capability vs Permission (the shape)** — a third gate beside cost and pain: an external party's yes (registry allocation, root-program inclusion, ICANN, underwriting) costing calendar time and clean history, and revocable.
- **Payment and processing unlocks** — merchant account after N clean months (chargebacks revoke it), volume caps that a viral month can breach and freeze revenue, a standby second acquirer. (+2 var)
- **Working-capital unlocks** — capability gated on your books: net-30 then net-60 terms, credit line after clean close + 2 years, cohort view at 12 months data, "since 20XX" badge at 3 years, PE inbound at $1M ARR <2% churn.
- **Vendor and supply-chain unlocks** — Gold partner tier (discounts, demo units, MDF), GPU *allocation* by relationship not purchase, carrier MSA at committed volume enabling transit resale, procurement provenance. (+1 var)
- **Network and numbering unlocks** — RIR/LIR membership + justified IP allocation (→ASN, anycast, reverse DNS, IPv4 leasing), peering eligibility, ICANN registrar accreditation (3× retention), VoIP/ITSP authority with its fee stack. (+2 var)
- **Compliance and audit unlocks** — SOC 2 I (fast) → II (6–12 months evidence), PCI incl. Level 1 Service Provider, HIPAA BAA, ISO 27001/27017/27701, FedRAMP (18 months), GDPR residency, cyber-insurance eligibility.
- **Facility and jurisdiction unlocks** — Uptime Tier III→mid-market, IV→financial/government; permits and zoning gate building at all; utility power allocation is a multi-year queue you join early or regret. (+1 var)
- **Channel and marketplace unlocks** — marketplace listing approval, hyperscaler co-sell against committed spend, the recommended-host slot, master agency/TSD, affiliate tier; ⚔️ editor's choice has an honest and a paid route, both kept. (+6 var)

## 5.10 Reputation and social-proof unlocks

- **First Case Study** — a named happy reference customer unlocks an enterprise conversion bonus, at the risk that they later churn loudly.
- **Three Logos** — three named customer logos in a "Trusted by" strip unlock a flat funnel-wide conversion multiplier. (+3 var)
- **Community Standing** — a reputation threshold opens the forum/deal-community lane: high volume, low ARPU, opinionated, and it turns instantly if support slips. (+1 var)
- **Analyst Coverage** — appearing in a market quadrant unlocks enterprise inbound; requires revenue scale plus a paid briefing, and pays off two quarters later.
- **Uptime Streak** — twelve months without an SLA breach unlocks a sellable "99.99% guarantee" SKU; losing the streak locks the SKU until re-earned.
- **Published Post-Mortem Credibility** — N honest published post-mortems set a permanent reputation floor that reduces damage from every future incident; transparency as insurance.
- **Open-Source Sponsorship** — a recurring spend buying a slow durable developer acquisition lane and a permanent reputation modifier with the most technical segment.
- **Conference Speaking Slot** — unlocked by being big enough to be invited; thereafter a recurring near-free acquisition and hiring channel.
- **The "we've been through it" modifier** — a permanent enterprise-trust bonus for having survived a breach and disclosed it properly; the only unlock whose prerequisite is a disaster handled well.

## 5.11 Staff, organizational, and knowledge unlocks

- **First Hire** — unlocks doing two things at once; the moment the action economy changes shape, presented as bigger than any building. (+1 var)
- **The First Salesperson** — opens outbound, partner and deal-desk lanes you can't work yourself, at base plus commission and the first goal misalignment (signed deals ≠ profitable ones). (+1 var)
- **The First Accountant / Controller** — the gate on cost-to-serve, per-customer profitability and deferred revenue; half your customers turn red the day they start.
- **A Real CTO** — change-control discipline lowers the bad-deploy rate and raises time-to-feature; a genuine trade most players resent before thanking.
- **A COO** — the gate on the portfolio game: running multiple sites and lines without spending personal attention on each.
- **An Abuse / Trust & Safety Lead** — lets you take the risky segment under a managed AUP: risk-priced hosting rather than bulletproof hosting.
- **A CFO** — unlocks financing instruments, forecasting, and the Exit level.
- **A Board** — unlocks capital and adds quarterly targets plus a scored review you must sit through; the clearest power-with-strings unlock.
- **On-Call Rotation** — 24/7 coverage without burning out your one admin; since exhausted engineers cause outages, it is a defensive structure with a payroll cost.
- **Runbook Library (as an org unlock)** — unlocks handing off work and mitigates the Key Person threat.
- **The Apprenticeship (growing your own)** — hire juniors and spend hands mentoring for 12–18 in-game months to get cheaper, loyal mid-levels; the only staffing path that improves culture. (+1 var)
- **Knowledge as a transferable asset (the staff carry the tree)** — each staffer holds 1–3 nodes personally, single-holder nodes flag bus-factor-1, documentation flips the marker from a face to a binder, departures grey nodes out.
- **The Wiki** — a knowledge base new staff read to onboard faster, shortening every future hire's ramp; optional and compounding. (+1 var)
- **The Mentor relationship (NPC)** — a veteran giving one hint per level and unlocking a node if followed; the only acceptable persistent tutorial text.
- **The Conference / Community channel** — one spend returning three currencies (a technique unlock, a peering contact, a hiring lead), the best-value peacetime action.
- **Cross-Training** — staff covering a second role, trading trainee time now for surviving a resignation later; the human form of documentation against Key Person and Burnout.
- **Staff Certifications** — training unlocks the *right to operate* advanced buildables: you own the hardware and nobody may touch it until someone is certified.
- **The Incident Commander role** — unlocked after a multi-system incident; coordinates across simultaneous problems, hiring the person who runs the roles that scar taught.

## 5.12 The research economy and unlock pacing

- **The Research Queue (how research actually happens)** — research is a queue of parallel slots (1 at Tier 1, 3 by Tier 4); each node costs money, engineer-weeks and risk, and pausing loses progress.
- **The Lab (research as a buildable)** — an on-board object spending money and time per wave to advance the tree while you defend: build future or survive now. (+4 var)
- **The Spike** — a timeboxed two-engineer-day investigation buying information about a node, returning "yes, cost X" / "yes, but Y first" / "no".
- **Negative Discovery (learning what you don't need)** — a spike concluding "this wouldn't have helped" refunds part of its cost as Intel and permanently greys the branch with a note explaining why.
- **The Debt Unlock (borrow a capability now, pay interest)** — take any node on credit at 1.4× over six months; while the debt stands the node is fragile (1-in-8 per incident it behaves like the cheap version).
- **Sealed Capability (you own it, but it doesn't work until you drill it)** — failover pairs, DR sites, restore paths and generators arrive hollow with zero benefit until you spend a drill (a scheduled outage); they re-hollow after N months.
- **Unlock cadence spec (how often, and what kind)** — a pacing budget by type: a new *verb* every 25–35 minutes and never two per level, 2–4 new *objects* per level, numbers unlimited but never the only unlock.
- **Unlock Rationing (the hard cap)** — 2–4 meaningful unlocks per level, at most one new buildable, at least one QoL; ⚔️ it biases QoL where the cadence spec biases verbs — resolve by using the cap as budget and the grades as composition.
- **Hardware Generation Unlocks (time, not achievement)** — new CPU, drive and network generations land on a campaign calendar regardless of play, changing the math (density ceiling, storage economics, 400G) rather than adding features.
- **The Debt-to-Capability Conversion (refactoring as research)** — paying down debt in an area unlocks that branch's next node because the old thing was blocking it; migrating off the legacy panel unlocks provisioning automation.
- **Unlock by Decommission** — successfully retiring a legacy system permanently grants the tooling that did it (migration automation, shims, conversion pipelines), making the next decommission cheaper. (+1 var)
- **The Deprecation Notice You Wrote** — announcing EOL on your own product or plan tier unlocks the migration tooling branch, because you now have to move everybody.
- **Intel as a spendable currency** — Intel from honeypots, near misses, negative discoveries and published postmortems buys un-met-threat research, Codex pre-fills, fingerprinting and a sellable threat feed.

---

# Economy, money, and scoring — summary

> Source: `master/07-economy-money-and-scoring.md` · 427 idea entries · 338 KB

*Framing: **separate CASH from PROFIT and make both visible.** **(T1)** hosting bills in terms, not months. **(T2)** revenue has a colour, not just a size.*

## 6.1 The currency set

- **Cash (the survival currency)** — liquid money; zero = death however healthy the business looks. Only the top layer of the six-bucket stack (§6.13) is spendable.
- **The Runway Bar (the actual health bar)** — cash ÷ net burn in months as the headline; under 6 months it recolours, under 3 the UI tone shifts and long-horizon purchases grey out. (+3 var)
- **The MRR Heartbeat — killing gives nothing** — attacks award $0; revenue ticks monthly from survivors. Amendments: attack-saved-egress coins, metered DDoS *bills* you, intel-only bounties, signup bonus + seed round. (+12 var)
- **MRR (the growth currency)** — the score, not the health bar. Waterfall: new + expansion − contraction − churned. Needs an explicit exemption from §6.8's "actionable only" rule.
- **Revenue Quality — colour the money (T2)** — each MRR dollar graded **Gold** multi-year direct · **Green** annual prepaid · **Blue** monthly self-serve · **Amber** commissioned/volatile · **Red** negative-contribution. Valuation reads the bar.
- **Error Budget (the spendable in-combat currency)** — downtime as a tank: 99%=7h18m · 99.5%=3h39m · 99.9%=43m · 99.95%=21m36s · 99.99%=4m19s per 30 days. Spend on maintenance, no-canary deploys (−3min), reboot-to-fix (−90s); exhaustion locks deploys.
- **Reputation split into Visibility and Trust** — Visibility is buyable (ads, affiliates, PR, MDF) and raises funnel volume; Trust is unbuyable, raises conversion and gates enterprise. Segments: developer, enterprise, gamer, compliance, deliverability.
- **Intel / Knowledge** — earned from honeypots, postmortems, logs, conferences; spent on research nodes; productizable as a Threat Intel Feed.
- **Hands / Attention (staff-time)** — one concurrent action per staffer, unbankable, resets each tick, overtime borrows at morale interest. Most crises are lost on hands.
- **Trust-with-upstreams (the hidden fifth, made real)** — per-vendor standing moved by abuse-response speed, payment timeliness, traffic ratios, AP past 45 days; pays as a warning instead of a null route.
- **Power and space (physical currencies)** — kW and rack units bought in blocks, resold at margin, stranded amounts pure loss. Contracted, drawable and utility-billed kW are three different numbers.
- **Lead time (the currency you cannot buy with money)** — circuits 60–90 days, hardware 8 weeks, cross-connects need a scheduled tech visit; a Lead Time Board shows everything in flight.
- **Receivables (money that is real and unspendable)** — invoiced, unpaid, aged: how winning a big enterprise logo makes you poorer for a quarter.
- **The Heat meter (the grey-play currency)** — rises with abuse complaints, unsavoury tenants, unactioned DMCA and LE requests; consequences escalate upstreams → processor → authorities. (+1 var)
- **EBITDA / contribution margin (the quality meter)** — third bar beside Cash and MRR, per line, because company-wide margin hides which line subsidises the other.
- **The Three-Bucket Budget (Grow / Defend / Sustain)** — three-segment bar under cash reflecting rather than restricting spend, against a healthy band of ~**45 / 25 / 30**.
- **The Three Budgets (capex / opex / hands, with lossy conversion)** — cash→hands slow and at a premium, hands→capex costs risk, capex→opex needs financing. Contests the Three-Bucket Budget's HUD bar: form axis vs purpose axis.
- **The core currency set — *CONFLICTING*** — ⚔️ **A (master)**: the large set (Cash, Runway, MRR, Revenue Quality, Error Budget, Visibility+Trust, Intel, Hands, upstream trust, power+space, lead time, receivables, Heat, EBITDA) with **one** death — free cash — and a three-tier HUD for legibility. **B (opencode)**: a small closed set where losing any pool is its own game over — seven shortlists, wave-1 consensus Cash+Bandwidth/Compute+Reputation, bankruptcy = cash<0 at wave end with one bridge loan at evil rates. Cross-cutting: split Reputation into brand / trust (a gate) / deliverability — fine for A, fatal to any single-Reputation shortlist.

## 6.2 Revenue streams

*Organised by **shape** (recurring / one-time / metered / contracted / negative) — shape sets cash timing, churn exposure and valuation multiple.*

- **The recurring core (MRR)** — monthly plans in advance or arrears; each type counts its own unit of sale (account, instance, socket, U, kW, TB-month, slot, query, GPU-hour, mailbox, zone, prefix, pass).
- **The three money clocks** — MRR (predictable, churn-attacked) · metered (grows with customer success, lumpy) · prepaid/float (cash now, liability later). Level goals *specify* the mix. (+4 var)
- **Annual and multi-year prepay** — cheapest capital there is: better runway, less churn, lower total revenue, refund liability. One $36 annual charge costs **$1.34 (3.7%)** vs twelve monthlies at **$4.68 (13%)**.
- **Setup, provisioning, and one-time fees** — install, migration, smart hands, cross-connect NRC, expedite and retrieval fees: the cash-starved operator's lever and a checkout conversion killer. (+1 var)
- **Overage and usage billing (metered)** — bandwidth, storage, request, GPU-hour, API-call and egress overage: scales with success, spikes with abuse. Three policies: bill, warn, absorb.
- **95th-percentile bandwidth revenue (selling what you buy)** — bill on 95th, flat port, or unmetered; selling flat while buying 95th means you eat the variance.
- **Add-ons, upsells, and the attach-rate economy** — backups, monitoring, SSL, dedicated IPs, DDoS tiers, priority support, log retention, managed DB, WAF, panel licence: near-zero COGS with an improvable attach rate.
- **Managed services and support plans** — labour markup sold as guarantees, not resources: **55–70% gross margin**, high touch, can destroy revenue-per-engineer.
- **Professional services and migrations** — migrations, architecture reviews, audits: lumpy, **60–80% margin on senior hours**, doesn't scale, opens enterprise doors. (+1 var)
- **Premium support tiers** — sell an SLA on *answering* rather than uptime: cheaper to deliver, exposure bounded by a response clock.
- **Cross-connect fees** — ~**$100–350 MRC** plus **$250–500 NRC** each, ~**90–95% margin**, near-zero cost and churn, forever.
- **Remote hands / smart hands** — hourly in 15-minute increments at profit-centre rates; in colo-tenant levels the meter runs against you.
- **Power resale (colo)** — buy wholesale, sell retail, by **circuit** (committed amps paid whether drawn, near-pure profit unconsumed, strands capacity) or **metered** (efficient, volatile).
- **Space rent (colo)** — per rack, cabinet, cage or square foot, on multi-year contracts with annual escalators.
- **Reserved / committed / prepaid capacity** — one or three years prepaid at a discount: cash now, margin lower, a revenue floor plus take-or-pay penalty. Drawn as The Anchor. (+2 var)
- **Spot / preemptible sales** — monetises idle capacity at a discount with a right to reclaim. Most valuable in GPU/HPC. Drawn as The Kite.
- **Domain registration and renewal** — **5–15% margin**: loss-leader at signup, margin at renewal, extremely sticky; carried for retention.
- **SSL, licences, and third-party resale** — cPanel, Plesk, SPLA, VMware, certs: pass-through markup, small margins, vendor-price-shock exposure. SSL margin collapsed after free certs.
- **Marketplace and platform revenue** — one-click apps, plugin and template stores: **20–30% revenue share** on other people's work, plus stickiness.
- **Reseller and white-label programs** — lower revenue per account, near-zero CAC, reseller owns support. Risk: one reseller leaves with 400 accounts in an afternoon.
- **Wholesale / peering / transit resale** — IP transit, dark fibre, wavelengths, rack-and-power wholesale: thin unless you built a network, where blended delivery runs **40–60% below pure transit**.
- **Transit blend tiering (premium network as a SKU)** — sell a premium-network tier above your commodity one, turning a rival's silent blend downgrade into your weapon.
- **IPv4 address leasing** — ~**$30–50/address** to buy, ~**$0.50–0.80/address/month** to lease; selling a legacy /16 is a late-game cash lever that forces IPv6/CGNAT.
- **Data egress (the villain revenue)** — enormous margin and resentment; waiving it is a weapon. Ethics dial prices it as reputation cost, CEO lens calls it industry-normal. (+1 var)
- **Retrieval and early-deletion fees (archive tiers)** — cold storage charges for *reading* and for deleting before minimum retention: excellent margin, maximum resentment.
- **Backup / DR retainer** — customers pay for capacity they hope never to use; beautiful margins until everyone needs it at once.
- **Demand-response and grid-services payments** — revenue from *not* using power: a capacity payment plus per-event payments for dropping to generator at grid peak.
- **Heat reuse** — sell waste heat to district heating, a greenhouse or a pool: small, real, slow, good for carbon score. Late-game unlock.
- **Threat Intel feed** — productize honeypot intel into a revenue line that improves with every attack survived.
- **MDF and vendor co-op marketing** — hardware vendors fund your marketing for co-branding and a purchase commitment: lower effective CAC, vendor lock attached.
- **Referral income and overflow monetization** — take a cut for sending a partner the leads you can't serve: zero cost, zero risk.
- **Termination and early-exit fees (ETF)** — a percentage of remaining contract value: softens churn's cash hit, adds deal friction.
- **Asset resale and scrap recovery** — decommissioned gear retains **10–20% residual at year 4**; decommissioning and e-waste are the mirror liability. (+1 var)
- **Sale-leaseback** — sell your building or hardware and lease it back: one-time cash for permanent opex and worse unit economics forever.
- **SLA credits (negative revenue)** — selling 99.99% raises price *and* this liability; the accrued balance sits on the balance sheet.
- **Referral and affiliate payouts (negative revenue)** — affiliate CPA **$65–150** with a **45–90 day clawback window**: a cohort churning on day 91 costs the full CPA. (+1 var)
- **The whale contract** — one customer at 20%+ of revenue, transforming the P&L and the risk profile simultaneously. (+1 var)
- **Margin ranking (the honest hierarchy)** — cross-connects (~90–95%) → professional services (60–80%) → colo power and space → managed → dedicated → VPS/cloud → shared → bandwidth resale on your own network → domains/SSL/licences → bandwidth resale on bought transit → GPU at spot → anything won on price alone.

## 6.3 Costs

*Spine: **COGS** (power, transit, licensing, depreciation, colo/lease, payment fees, support) · **Opex** (salaries, marketing, tooling, insurance, legal, audit) · **Capex** (servers, network gear, facility build, GPUs — over 36–60 months).*

- **The upkeep ledger — every build is a bill** — every buildable carries an upkeep line, and live burn-vs-revenue *is* your effective HP. Shared ≈ near-zero · GPU = hourly power burn · colo = fixed, capex-heavy · regulated = paperwork burn. (+6 var)
- **Hardware (capex) and the depreciation curve** — straight-line over **3–5 years**, **10–20% residual at year 4**. A **$1,800 1U over 48 months = $37.50/month** before power or space.
- **Capex vs opex as the payment mode of every buildable** — per-purchase toggle: **buy** = cash cliff, no lock-in; **rent** = flat bleed, easy autoscale. Big builds show an amortization paydown meter. (+4 var)
- **The Depreciation Play (the tax shield)** — a declining staircase per rack with **end-of-fiscal-year accelerated-depreciation windows** making big buys temporarily cheaper. Depreciated racks cut upkeep but worsen PUE.
- **Bandwidth: the 95th-percentile bill** — bills the **95th percentile of 5-minute samples**, discarding the worst 5% (**~36 hours**). Per-direction, **higher of in/out billed**; **commit-and-burst** charges a discounted commit regardless plus punitive overage; the **36 free hours are a strategy** for backups and CDN pre-fills; transit deflates **15–20%/year** to **$0.15–0.60 per Mbps/month at 10G+ commit**. In-flood: **absorb** · **shape** · **divert to scrubbing**. (+9 var)
- **Power, PUE, and cooling** — you pay **IT load × PUE**: **1.1–1.25** modern, **1.4–1.8** retail colo, **2.0+** legacy; power **$0.06–0.14/kWh**, so **1kW continuous ≈ $65–100/month × PUE**. 30% IT load is far worse than 80%. (+4 var)
- **The Demand Charge (the 95th percentile of electricity)** — bills **energy** (kWh) *and* **demand** (highest **15-minute average kW**), often **ratcheting** a floor for eleven more months. Counters: staggered startup, power capping, peak shaving, off-peak batch.
- **kVA vs kW, power factor, and the 80% you can actually sell** — a "20A 208V circuit" is **4,160 VA** nameplate, derated to 80% ≈ **3,328 VA**, with power factor (**0.95 typical**) lowering it further. Readouts **sold / usable / drawn**.
- **Power purchase structures** — **index** (cheapest on average, occasionally ruinous) · **fixed/hedged** (premium, 1–5 year lock) · **PPA** (decade lock-in, liability if prices fall), demand charges on top.
- **Space and facility** — per cabinet or per kW as tenant, building if owner; multi-year terms with **annual escalators (typically 3%)**, deposit and install NRC. Stranded space and power are pure loss.
- **Licensing** — per-core, per-socket, per-account or per-instance across panels, OS, virtualization, backup, DBs. Per-*account* is worst — it scales with customers, not revenue. Anchor **$2–20/account/month**.
- **The true-up** — a licensing vendor's *scheduled* annual reconciliation: you deployed more than you licensed, the bill is retroactive plus penalty, and you count yourself.
- **Payroll and the true cost of people** — salary × **loaded multiplier 1.25–1.4×** plus on-call stipend; **turnover costs 6–9 months of salary** plus three months of ramp. (+3 var)
- **Support cost-to-serve** — tickets × minutes × loaded rate **per customer**: **15–30 tickets/agent/day**, **$4–12/ticket US, $1.50–4 offshore, $14–22 fully loaded**; the real driver is **escalation rate**, a senior ticket costing **10–20×**. (+2 var)
- **Customer acquisition cost (CAC)** — payback computed on **gross margin, not revenue**: $10/month at 70% margin with $65 CAC pays back in **9.3 months, not 6.5**. Rule: **payback under 60% of tenure**.
- **Transaction and payment costs** — ~**2.9% + $0.30** per card charge = **13% of a $3 plan, 0.6% of a $500 plan**; **1.5–2.5% interchange-plus** at volume; **$15–25 per chargeback**. Why $3 plans sell annually.
- **Abuse cost** — staff time, IP reputation damage, upstream complaints and legal requests at a predictable per-customer rate. **Abuse tickets per 1,000 accounts** leads your upstream relationship.
- **The cost of a breach (the itemized receipt)** — **five bills on five clocks**: immediate damage, forensic hours, churn, insurance premium spike, fines. In regulated types **per-record fines usually exceed total level income**.
- **Compliance and audit cost** — audit fees, staff time, tooling, evidence collection, remediation; pays back only via the customer tier it unlocks.
- **The Tax Hydra (VAT/GST and the nexus threshold)** — cross a per-jurisdiction threshold and registration fires; file monthly or **the money stops arriving** (escrow freeze). Absorb-vs-show-at-checkout moves conversion. The cost that grows with success **in geography**.
- **Insurance, legal, and the SLA reserve** — cyber, E&O, property and BI cover, counsel, and an SLA reserve you won't fund. Premiums quoted from a **controls questionnaire**; the exclusion that bites is **nation-state** attribution. (+4 var)
- **Support contracts and warranties** — per-device next-business-day / 4-hour / 24×7×4 tiers with a **price cliff at year 4** pushing a refresh. Spares inventory is the self-insurance alternative.
- **The RMA pipeline** — fault → RMA → **advance replacement** or **return-first** → often-refurbished part → **refurb fails again at ~2× base rate** → original returned within **10 days** or you're billed.
- **The Truck Roll** — any physical action carries cost and delay. Why out-of-band management, smart PDUs and local remote hands pay for themselves.
- **Circuit contract liabilities (NRC, MRC, term, ETL)** — install charge, monthly charge, **12/24/36-month term**, and **early-termination liability equal to the remaining term**: cancel in month 4 of 36 and you owe 32.
- **Egress to your own DR site** — continuous replication is continuous **egress**; if DR sits at a cloud provider you pay *their* egress for your own insurance.
- **Transit commits and take-or-pay** — a commit you **outgrow** is free money, one you **undershoot** is a monthly tax on your own optimism.
- **Double-running during migration** — paying for old and new simultaneously; full treatment in §6.14.
- **Marketing spend (as a cost with a lag)** — money in, customers maybe out, on a delay; full event treatment in §6.7.
- **Bad debt, chargebacks, and fraud loss** — **consumer/low-end shared 2–4%, VPS 1–3%, SMB dedicated 1–2%, enterprise <0.5%, colo <0.5%**, **bulletproof ~0** because prepaid-only.
- **Decommissioning and e-waste disposal** — certified destruction, recycling fees and sanitization evidence: the bill at the end of the depreciation tail, accrued as a **liability over the asset's life**.
- **Interest and debt service** — **principal repayment is a cash outflow that is not a P&L expense** — another cash-vs-profit divergence.
- **Toil (the staff-hour cost of every shortcut)** — staff-hours drained by unautomated recurring tasks, tracked as a **toil ratio**, shown at level end beside the automation you could have bought.
- **Technical debt interest** — a monthly P&L line called **"Technical Debt Service"**: debt accrues at **0.8% of estate value per month per debt point**, paydown costs **3 months of that interest**. IOU slips raise each object's failure probability. (+4 var)
- **Churn (the cost that isn't a cost)** — lost MRR appears nowhere in expenses; show it as **negative revenue**, split voluntary/involuntary and logo/revenue. (+2 var)
- **The trap list (costs that look like nothing and eat you)** — transit commit · power commit · per-account licensing · ~3% payment processing on a $3 plan · support cost per ticket · CAC payback exceeding tenure · depreciation vs cash · stranded capacity · double-running · idle GPU-hours · the letter of credit attacking runway. (+1 var)

## 6.4 Cash-flow mechanics

*Hosting companies die of cash flow, not unprofitability. Classic killer: $200k of hardware today for a customer who pays $8k/month starting in 90 days.*

- **Cash vs Profit (the two ledgers)** — two readouts that disagree, itemising why (capex, receivables, deferred revenue, principal, inventory) plus a money-in → committed → available waterfall. The **Gap Bar** hatches the gap, amber `UNCOLLECTED` / grey `DEFERRED`. (+3 var)
- **Net-30 / 60 / 90 — and why net-60 is really net-75** — the clock starts when enterprise AP *processes* the invoice. Levers: invoice immediately, **get the PO number first**, offer **2/10 net 30**, track **DSO**.
- **Deferred revenue** — annual prepay banks immediately but recognises **1/12 per month**; spend it, then refund, and you're short. Comes off the price at sale. (+3 var)
- **Annual prepay discount** — **2 months free (≈15% discount)**: fixes cash today, locks price, cuts churn and payment fees by ~9 points of revenue on small plans.
- **The refund window and the money-back guarantee** — a 30-day guarantee raises conversion and refund exposure, 90 days raises both further. (+1 var)
- **Involuntary churn and dunning** — **20–40% of gross churn is involuntary**, card failure **5–9%/month**, **dunning recovers 30–50%**. Pipeline: failed → retry → reminder → warning → **suspend** → terminate, under a **Suspension Policy Dial** (day 3 / 10 / 30). (+4 var)
- **The invoice calendar** — billing the **1st**, declines **days 1–4**, dunning **days 5–20**, payroll the **15th and last day**, transit and power mid-month. Money arrives on a distribution and leaves on a deadline. (+3 var)
- **The Payroll Clock** — a hard deadline with a non-monetary penalty: missing payroll costs **staff** — morale collapse, resignations, a permanent hiring premium.
- **Seasonality** — Black Friday, back-to-school, tax season, fiscal-year-end, holiday game surges, Q4 e-commerce. **Cash seasonality ≠ demand seasonality**: clustered renewals give a January bulge and a June drought. (+2 var)
- **Capex lead time** — order → deposit → **8-week lead** → delivery → install → burn-in → revenue: cash today against revenue a quarter away.
- **The Fiscal Year Spend Deadline** — approved capex **evaporates** unspent at year end: the December panic to pre-buy hardware *and* absorb its upkeep, on the accelerated-depreciation date.
- **Working capital in hardware** — inventory is money on a shelf; the failure mode is the drive you didn't stock on a Saturday. A part in an RMA queue is neither cash nor capacity.
- **Vendor terms (AP as a lever)** — negotiating NET-60 with your hardware supplier is an unglamorous power move that saves a level; full mechanic in §6.13.
- **Deposits and prepay requirements** — demand prepayment from risky customers: fewer signups, less bad debt, better cash. Turns bad debt from a fact into a choice.
- **The credit line** — a revolving shock absorber at **8–14% APR on drawn balance** with **covenants** (minimum EBITDA, maximum leverage, sometimes uptime).
- **Multi-currency FX** — revenue in named currencies on a live ticker; a swing between invoice-issued and paid burns real cash. Costs exposed the other way (revenue USD, GPUs TWD, colo EUR). Dark variant: **hyperinflation** turns a bulk-prepay customer into a laundering threat.
- **Crypto rails (the fast-money faucet)** — instant settlement, no chargebacks, no processor haircut. Choose **auto-sell, hold, or "HODL infrastructure"**; a **sanctioned-wallet hit turns an invoice into seizure evidence**.
- **Runway** — months of survival at current burn. Chrome-only: **>6mo** normal · **3–6mo** desaturates ~30% with an amber rule on the money column · **<3mo** colder grey, runway promoted to the top bar at double size. Nothing flashes.
- **The working-capital squeeze (you can lose by winning)** — fast growth on monthly billing plus up-front hardware is the configuration that kills companies; its own lose condition (Growth Death).
- **The cash conversion cycle** — **prepaid shared is negative**, **enterprise dedicated on net-60 is +120 days**, **colo with a fit-out allowance is +18 months**. A fifth score dial.
- **Capital injection events** — angel, VC, private equity, bank loan or bootstrapping, each **changing the win condition**: VC demands growth, PE margin, a bank covenants, bootstrapping patience.

## 6.5 Pricing as a mechanic

- **The price slider (difficulty as a dial the player sets)** — per line: raise for fewer, higher-margin customers; lower for a flood, thin margin, abuse and support load. Model **hysteresis** — cuts re-anchor expectations. (+6 var)
- **The Margin Death Zone** — a band below which **more customers make you less money**: at **$3/month with 2.9% + $0.30, 13% of revenue is gone before you serve a byte**, and **0.35 tickets/account/month at $18** puts you underwater.
- **The Pricing Floor Calculator** — an unlockable tool drawing a red line on the price slider from true cost-to-serve: amortisation, power, blended bandwidth, support minutes, payment fees, abuse allowance, fixed-cost share.
- **The Unit Economics Card** — per plan: price, cost-to-serve, gross margin, tickets/month, abuse propensity, tenure, CAC, payback, LTV, LTV:CAC. Lets you ship a **14-month payback against 11-month tenure without warning**. (+2 var)
- **The oversell ratio** — a **1:1 to 30:1** slider. Detents safe/aggressive/reckless: **shared disk-CPU 5:1 / 12:1 / 20–30:1** · **VPS RAM 1:1 / 1.2:1 / 1.5:1** · **VPS CPU 4:1 / 10:1 / 16:1** · **colo power diversity 1.2:1 / 1.4:1 / 1.6:1** · **bandwidth 5:1 / 20:1 / 50:1** · **GPU inference 1:1 / 3:1 / 6:1** · **GPU training 1:1, cannot oversell**. Failure is correlated: `P = (ratio/10)^2.2 × homogeneity`. CPU/bandwidth degrade gracefully, **RAM catastrophically**, **storage stops dead**, **power trips a breaker**. (+3 var)
- **Grandfathering** — **keep them** (permanent margin loss) · **migrate with notice** (churn, reputation, support surge) · **migrate with a sweetener** (cash, half the churn). Slow tactics: deprecate the plan not the customer (3–5 years), raise price with added value (**half** the churn). (+2 var)
- **The Price Increase (the four-parameter decision)** — set **size (%)**, **notice period**, **scope** and **exemptions**; churn scales with size and inversely with notice, plus **permanent trust loss if done twice in eighteen months**.
- **Intro pricing and the renewal cliff** — **$1 first month, $15 after**: spikes acquisition, tanks renewal retention, damages reputation if hidden. Two numbers per plan.
- **Term discounting and commit discounts** — monthly / annual / 2-year / 3-year: margin traded for predictability, locking *your* price while costs move — why contracts carry escalators.
- **Volume and committed-use discounts** — the customer commits to a volume for a rate: a revenue floor for you, unused commit their penalty and your free margin.
- **Tier design and the good-better-best ladder** — anchoring, decoy pricing and feature-fencing set which feature sits in which tier, which determines your customer mix. Highest-margin move: charge for **guarantees**. (+2 var)
- **Cost-plus vs value pricing** — a compliance-hosted server is the same server at **4×**: positioning carries a multiple unrelated to cost.
- **Usage-based vs flat** — flat is risky for you (the customer using **40× the average**); usage-based terrifies them. Hybrid — flat with a generous cap — is the industry answer.
- **Metered vs unmetered vs "unlimited"** — a marketing weapon that guarantees abuse; the failure mode is a support argument about the word "unmetered".
- **Overage policy** — **hard cap** (service stops, anger without an invoice) · **soft cap** (bill shock) · **burst allowance** (costs you the variance). (+2 var)
- **SLA tier pricing and the true shape of a credit** — credits are a **percentage of the monthly fee**, **capped at ~100% of one month**, **claimable within N days**, mostly never claimed; **reputation damage exceeds credit cost by ~10×**.
- **The Cost of a Nine (an explicit, visible cost curve)** — ~**3.5× infrastructure and 2× operational discipline per nine**: 99% = one box and a backup, 99.9% = redundancy, 99.99% = plus automation, **99.999% = multi-site plus a practised organisation, not purchasable**.
- **Segmented pricing** — the Whale pays less per unit, risky customers more, enterprise more; the mechanism behind the grey-area **5–10× risk premium**.
- **Yield management** — dynamic pricing for scarce inventory: GPU hours, satellite passes, cabinets near the meet-me room, cold-aisle racks. Your floor plan becomes a pricing surface.
- **Regional pricing / PPP** — purchasing-power-adjusted pricing expands the market and invites VPN resellers reselling into expensive markets.
- **Bundling** — hosting + domain + SSL + email at a blended price raises attach rate and **obscures margin**: the bundle is often carried by one component.
- **Free tier and free trial** — **free-to-paid 1–4%**, unverified free tiers **30–60% abusive signups**, with a card on file **trial-to-paid 35–60%**. The abuse rate is the knob between growth and fraud.
- **Loss leaders and attach rate** — priced below cost and measured on **attach rate**, not margin; works only if the upsell path is built. (+1 var)
- **The Promo Engine** — coupons with expiry, first-term-only flags and a redemption budget. One leaking to a deal site floods you with the worst cohort at the worst price, permanently grandfathered.
- **Fee-Trap Design (pricing as defence engineering)** — **setup fees deter drive-by abuse tenants**, **storage overage fees punish hoarders** and summon the Filler Swarm, **egress fees are the landmine**. Live "exploitability" heat per fee.
- **The discounting spiral and discount authority** — each discount is invisible alone and collectively destroys margin; a **discount authority** setting makes it a delegation decision, on a lag.
- **Elasticity testing** — split new signups across two prices for N weeks via a Pricing Science node; the game should occasionally **prove the estimate wrong**.
- **The race to the bottom** — an NPC competitor undercuts you; matching is a trap you're allowed to walk into. Price Tags hang at your market's edge with visitor lanes bending toward the cheaper tag. (+2 var)
- **Custom enterprise pricing (the quote)** — a negotiation minigame: discount, custom SLA, security review, net-60, audit right, uncapped liability, MFN — each a buildable contract clause.
- **Eviction economics (the decision to fire a customer)** — **churn cost now vs expected incident and legal cost later**; **firing a money-losing whale is a winning move the tutorial should teach with confetti**.
- **The Margin Tint (pricing made ambient)** — service and customer cards tinted green (high margin) to rust (losing money), so scanning for rust tells you who to fire.
- **The Pay-It-Forward economy of kindness** — overcharging boosts short-term cash but stacks hidden **resentment** that amplifies later churn storms; nothing announces it.

## 6.6 Per-type economics

*Every hosting type is a different business, not a different skin.*

- **The fundamental hosting economic truth** — a capacity business with a utilization problem: **profit = utilization × price − (capex amortization + power + bandwidth + labor)**; idle capacity bleeds, full capacity is a cliff.
- **The revenue-shape table** — 30 types by unit of sale / revenue shape / margin / cash timing / signature cost (shared, managed WP, VPS, dedicated, colo, wholesale DC, game, VoIP, email, DNS, CDN, object storage, backup/DR, tape, streaming, seedbox, GPU/AI, HPC, crypto, K8s/PaaS, serverless, DBaaS, bulletproof, regulated, dial-up, satellite, edge/5G, IoT, blockchain node). Corrections: retail shared is **12/24/36-month prepay at intro rate renewing at full**; colo **multi-year billed monthly in advance**; GPU cash timing **a financing structure, not a rate card**.
- **Companion table A — term, churn, and cash conversion** — shared 12–36mo prepaid, **3–6%**, **negative** · managed WP monthly–annual, 1.5–3%, slightly negative · VPS monthly, **4–8%**, ~0 · dedicated monthly–annual, 1–2%, **+60 to +120 days** · colo 3–5yr, **0.3–0.8%**, **+12 to +18 months** · wholesale DC 10–15yr, ~0, **+24 to +48 months** · game monthly prepay, **6–12% seasonal**, negative · email annual, 1–2%, negative · backup annual, 0.5–1.5%, +30 to +90d · GPU hourly-to-3yr, varies, **+6 to +18 months** · bulletproof monthly prepaid crypto, **8–15%**, strongly negative · regulated annual–multi-year, **0.2–0.5%**, +60 to +120d. Negative = financing instrument; positive = capital requirement.
- **Companion table B — acquisition and support load** — CAC / time to profitability / tickets per customer per month: shared **$65–150**, 9–18mo, 0.3–0.6 · managed WP **$150–400**, 5–9mo, 0.4–0.8 · VPS **$40–120**, 4–10mo, 0.2–0.5 · dedicated **$300–900**, 3–6mo, 0.15–0.4 · colo **$2,000–15,000**, 12–30mo, 0.05–0.2 · **cross-connect ~$0 CAC, immediate, ~0 tickets** · backup **$400–1,500**, 6–12mo, 0.1–0.3 · GPU **$1,000–20,000**, contract-dependent, 0.2–1.0 · free tier $0–15, **never by design**, 0.8–2.0.
- **Companion table C — what a bad month looks like** — shared an unattributable churn bleed · managed WP a client site hacked in public · VPS a noisy neighbour across a node · dedicated a hardware batch failure · colo a tenant not renewing · wholesale DC a delayed power date · game a title dying · VoIP weekend toll fraud · email a blocklisting · DNS an amplification from you · CDN an origin-shield miss storm · object storage a disputed egress bill · backup a public restore failure · seedbox a takedown wave · GPU a price collapse with hardware financed four more years · HPC a missed deadline penalty · crypto a halving · bulletproof law enforcement · regulated an audit finding before renewal · satellite an unrepeatable pass.
- **Data gravity** — at **80TB** with you, moving costs time, money and egress fees. Strong for object storage, backup/DR, DBaaS, tape, video archive; weak for VPS; absent for stateless compute.
- **Lease terms and the colo cash profile** — **3–5 year contracts**, **annual escalators ~3%/yr**, deposits, and **fit-out paid upfront, recovered over the lease** (capitalized ~60 months).
- **Occupancy, stranded capacity, and absorption rate** — built 1MW / sold 640kW = 64%; **target 85%+, below 65% the building loses money**. **Stranded**: one resource without its complements. **Absorption**: kW leased per month vs build rate. **The shortest of space/power/cooling is your real capacity**.
- **Power as a product** — sell electricity at markup by **circuit** (committed amps, predictable, strands capacity) or **metered** (efficient, volatile). Carry kVA/kW/power-factor onto the contract card.
- **Colo's three meters (and the spread you profit on)** — **space** ($/U/cabinet/month) · **power** ($/kW contracted and/or metered, with penalties past contract) · **bandwidth** (95th percentile), plus **NRCs** and remote hands. Profit on the **spread**. (+3 var)
- **Cross-connects: the best line item in hosting** — a patch cable billed monthly forever at ~**90–95% margin** plus **NRC $250–500**: a tenant with 40 never leaves. Why carrier-neutral matters. (+1 var)
- **Peering ratio as a cost driver (and a diversification payoff)** — settlement-free peering needs a balanced ratio, so an **inbound-heavy line** (backup, ingest, CDN origin-pull) is a literal financial synergy.
- **Deliverability as revenue (email)** — IP reputation is a balance-sheet asset: good reputation → inbox placement → renewals; one blocklisting → support flood → churn.
- **Per-query and per-invocation pricing (DNS, serverless, IoT)** — fractions of a cent, billions of times; above **500 conversions/second** particles must become a **sheen**.
- **Restore-SLA pricing (backup/DR)** — you sell *getting it back*: price by RTO/RPO, "restore within 4 hours" costing many times "within 7 days". **Restore Verified** is a level medal.
- **Deadline premiums (HPC / render)** — a multiplier for guaranteed completion by a date, so **scheduling, not utilization, is the revenue optimization**.
- **GPU price volatility — and the financing mismatch underneath it** — **$2–4/GPU-hr H100-class in 2024 drifting to $1.5–2.5; reserved 30–50% below spot**; **$250–400k per 8×H100 node**; **below ~55–65% utilization loses money, above 90% you can't maintain**. Four years of hardware debt against one-year contracts. Make **contract-term-versus-financing-term mismatch** a scored stat. (+4 var)
- **The abuse cost line** — bulletproof, free-tier, seedbox and cheap-VPS lines generate abuse tickets, complaints, blocklistings and legal requests at a predictable rate: budget the abuse desk.
- **The obsolescence clock and the cascade down-tier** — premium dedicated → budget dedicated → VPS node → backup target → lab box → scrap with a destruction certificate.
- **Demand response and time-of-use** — the utility pays you to shed load at peak; with the demand-charge ratchet, the **shape** of your power draw becomes a managed resource.
- **Contract length as per-type personality** — shared churns monthly, colo signs five years, wholesale fifteen. **Long contracts fix your price while costs move**, so **pass-through clauses and escalators** must be negotiable.
- **Internal transfer pricing (once you run more than one line)** — see §6.14; the mechanism by which your worst line can look like your best.

## 6.7 Money-moving events

*Discrete events moving cash, MRR or reputation in one beat — the level's punctuation.*

- **The governing rule for this subsection** — every event arrives as a card with 2–3 responses, at least one costing a hand. Most in need of agency: whale signs, bill shock, audit finding, viral moment, vendor price increase.
- **The whale signs** — doubles MRR and is a cash-flow crisis: security questionnaire (1–3 weeks of hands) → **legal redlines 2–6 weeks** → onboarding **30–60 days post-signature** → hardware up front → **net-60 from first invoice**. January deal, June cash.
- **The whale leaves** — 20% of revenue walks on ~90 days' notice, and the notice period *is* the level. GPU's version is a contract expiring into a collapsed spot market.
- **SLA credit event** — credits accrue *live* during an incident, so the meter runs while you fix it. Drawn as the **Taxi Meter**, shared with toll fraud and egress shock.
- **SLA credit payout model — *CONFLICTING*** — ⚔️ three payout physics disputing **who initiates the credit and what stops it**. **A (master)**: a live-accruing meter bounded by the real properties — a percentage of the affected service's monthly fee, capped at 100% of one month, claimable within N days (most never claim), never near actual loss (reputation ~**10×** credit cost). **B (opencode)**, pick one: **auto-apply** (breach minutes pay out automatically; hitting the monthly cap is a breach-of-contract fail, bankruptcy-by-refunds the true death); **claim-based** (disputable tickets capped **30–100%** of the affected fee, consequential damages excluded, auto-apply becoming a paid trust feature); or **escrow pool** (enterprises fund escrow per wave, breaches drain it, **an empty pool terminates the contract**). Uncontested: 99.9% = **~43 min/month**, 99.99% = **~4.4 min**; credits **5–100% of monthly fee per tier** with enterprise **10× multipliers**; higher tiers need **2N**; **pre-announced maintenance carries zero credit liability**.
- **The Downtime Value Curve** — minutes cost differently by **hour** (business hours ~**20×** a 3am equivalent), **day** (launch day, Black Friday, month-end) and **customer**.
- **The chargeback wave** — you lose the revenue, the delivered service, and **$15–25 per chargeback**; cross **1%** and the processor opens a monitoring program, then terminates. (+3 var)
- **Bill shock** — a usage invoice arrives **40× normal**. Choices: **full credit**, **partial credit plus a forward cap** (correct), or **hold firm**. Sources: egress, GPU-hours, recursive invocation, retrieval fees, toll fraud.
- **The vendor renewal price increase** — a supplier raises prices while your prices are fixed: **absorb**, **renegotiate** or **migrate off**, each with cost, lead time and risk.
- **The true-up** — the scheduled annual licence reconciliation: retroactive, plus penalty, and **you count yourself** (see §6.3).
- **The invoice that doesn't get paid** — AR aging → dunning → **suspension** (guarantees non-payment, stops the bleeding) → collections → write-off. The customer's size *is* the difficulty.
- **The audit finding** — remediate (cash plus hands on a deadline), negotiate the deadline, or accept with a compensating control — cheaper, recurs next year.
- **The lawsuit / the legal letter** — DMCA, defamation, patent troll, or a customer suing over an outage. Your liability cap decides expensive vs existential.
- **The Ransom-or-Restore Ledger** — **paying** costs cash now plus a hidden "soft target" flag raising future attack rates; **restoring** costs capex now, reputation later.
- **The Metering Bug (billing is production)** — your billing double-counts egress and **40,000 customers get a 3× invoice**: refund tickets, cancellations, a Reddit thread. **Billing is production.**
- **The Invoice Boss (the end-of-level bill)** — at wave end a giant PDF monster sums all upkeep, power, licences and wages; paying earns a **surplus star**. (+4 var)
- **The acquisition offer** — a multiple of ARR (or NOI, or backlog) modified by your diligence report: accept to end the run with a score, refuse and it may not return.
- **The acquisition opportunity** — buy a failing competitor: cheap MRR, filthy infrastructure. **Buying revenue is buying somebody else's technical debt** — plus ETF exposure and blocklist history.
- **The customer-book purchase** — buy accounts from an exiting operator at a **churn haircut of 20–40%** lost in migration, with a dual-run cost.
- **The grant / the tax credit / the utility rebate** — efficiency rebates for PUE work you did anyway, regional build incentives, heat-reuse subsidies. Rewards the boring decision, late. (+2 var)
- **The viral moment** — a customer's site hits the front page: free reputation, a bandwidth bill and a stress test at once. Spend to capture it, or protect existing customers.
- **Marketing spend** — **channels saturate**: **paid search fastest, affiliate next, referral capped by customer count, content compounds slowly with no ceiling**. Trap: **ad spend never moves Trust**.
- **The insurance payout** — covers some of the loss, arrives late, raises premiums after: a cash-timing instrument, not a solution.
- **The refund wave** — after a bad outage, clustered refund requests: granting costs cash and saves reputation, refusing does the opposite.
- **The processor's rolling reserve is imposed** — a percentage of card revenue withheld for **90–180 days**: frozen not lost, with a brutal transition cost.
- **The distributor credit hold** — your hardware supplier stops shipping over stretched AP, converting a cash problem into a **capacity** problem.
- **Covenant breach** — high utilization, EBITDA below minimum, or an uptime covenant trips; escalating from a waiver fee to forced asset sales to loss of control.
- **The double-carry begins (a pivot event)** — you commit to a second business while still running the first; see §6.14.

## 6.8 The metrics HUD

*The second board: every entry a real operator metric.*

- **The three-tier restructure (the fix that makes the metric wealth playable)** — **HUD** (cap five or six): Runway/Cash, MRR, Reputation/Trust, hands, error budget, and the level's objective metric. **Drawer**: seven blocks. **Postmortem**: counterfactuals. Rule: **promotion on actionability** (runway <3mo, chargebacks near 1%, error budget <20%, bus factor 1, AR 90+). **Every HUD number names its action on hover**: `RUNWAY 2.1 MO` → `collect receivables · sell annual · delay hardware`.
- **The growth block** — MRR waterfall, ARR, **NRR** (>100% = growth without selling), logo vs revenue churn separately, ARPU/ARPA. **NRR per line**: **storage 110–130%, shared 85–92%**.
- **The margin block** — gross margin per line, contribution margin per tier/cohort/channel, revenue per employee, cost-to-serve per customer, EBITDA, **Rule of 40**. (+2 var)
- **The acquisition block** — CAC by channel, **payback on gross margin**, **LTV:CAC** (under 3:1 warns), conversion by channel, saturation curves, time-to-first-value, free-to-paid and trial-to-paid. (+2 var)
- **The cash block** — six cash buckets, runway, burn rate, **AR aging (0–30 / 31–60 / 61–90 / 90+)**, DSO, deferred revenue, credit-line utilization, covenant headroom, cash conversion cycle per line.
- **The risk block** — **chargeback ratio with a hard red line at 1%**, concentration, security posture, compliance expiry dates, insurance vs exposure, bad debt %, refund rate, involuntary churn %, abuse tickets per 1,000 accounts, term mismatch, bus factor.
- **The obligation block** — per-contract SLA meter with live credits, uptime vs committed, **error budget remaining**, commitments due, take-or-pay obligations, **WARCT**, **contracted revenue %**.
- **The operations block** — **MTTD and MTTR separately**, change failure rate, **toil ratio**, **bus factor** (below 2 flashes red), ticket backlog, escalation rate, PUE/WUE/carbon, headroom per resource, absorption vs build rate.
- **The revenue-quality block (new)** — Revenue Quality composition bar, contracted revenue %, WARCT, revenue by source and commission load, payment-method mix, prepay mix.
- **The satisfaction block** — NPS/CSAT feeding the referral lane, review score, first-response and resolution time, exit-survey reason codes.
- **The rule of the HUD** — nothing on the HUD the player cannot act on. Applied hard, only **cash/runway, MRR, reputation, hands, error budget and the SLA meter** stay on screen.
- **The Death-Spiral Diagram (a HUD element that draws the loop)** — a node-and-arrow diagram naming the cycle ("Outage → Credits → No cash → No fix → Outage") with per-arrow strength, in time to break it.
- **The Concentration Donut (and its agreement with the floor)** — revenue-by-customer donut with the top 10 named, extended as tenant tint, so **the whale's racks are the most saturated things in the room**. (+1 var)
- **The Cohort Wall** — retention heat grid: rows are signup cohorts, columns months since signup; hovering a row highlights those customers on the board.
- **The Obligation Rail** — a rail of everything owed and coming due (payroll, invoices, audit seals, renewals, true-ups, financing), shape-coded, with 90-day-lag consequences in the Intent layer.
- **The Cost-of-Downtime Dashboard (ghost money)** — a live trace of revenue lost to slowness, blocks and bounces; hovering a blocked customer shows the contract they would have signed.

## 6.9 Scoring and end-of-level rating

- **The four-axis scorecard — and the reweighting that makes it teach the pillar** — Uptime / Performance / Profitability / Growth plus a per-type fifth. Weights **30 / 20 / 30 / 20**, fifth worth 20; bands **S ≥ 92 · A ≥ 82 · B ≥ 70 · C ≥ 58 · D ≥ 45 · F**; published before the level. Counter-proposal: **Conversion 35 / Profitability 25 / Resilience 20 / Growth 20**, uptime folded into conversion. Both measure availability **against commitment, not raw uptime**. Per-type: colo 25 / **Occupancy 30** / 30 / 15 · backup **Durability 40 / Restore 30** / 20 / 10 · game **Tick stability 35** / 20 / 25 / 20 · GPU **Utilization 30** / 30 / Term-coverage 20 / 20 · email **Inbox placement 35** / 20 / 25 / 20. (+10 var)
- **What the headline score is — *CONFLICTING*** — ⚔️ **A (master)**: no single number — multi-axis normalized scores plus grade bands, with **Company Valuation kept at campaign altitude** and off the per-level card. **B (opencode)**: one number, five candidates — (i) axes as mere *presentation* (3–4 normalized axes plus stars); (ii) **Company Valuation live during play** = revenue multiple × uptime reputation × risk discount, endless mode as revenue × multiple + reputation − tech-debt liability; (iii) **Score = Growth × Stability × Margin × Reputation** graded D–S as a *product*, so one zero is fatal; (iv) three axes normalized **0–1 against the level's own targets**, **stars = floor of the minimum**, plus a hidden **Craft score** gating cosmetics; (v) **Score = "NPS of the board"** from happy-served / bounced / breached.
- **Score the conversion rate first** — the headline is **Served / Arrived**, the share of legitimate demand reaching the goal node; threats blocked shown smaller.
- **The Nines** — availability as nines with minutes: 99.9% = **43 min/month**, 99.99% = **4.3 min**, 99.5% = **3h 39m**, annually 99.99% = **52 min/year**.
- **Perceived vs actual reliability** — two uptime numbers with the gap drawn: **measured** (what monitoring saw) vs **experienced** (what customers got). 99.99% against 99.6% is a diagnosable failure.
- **Detection quality** — of incidents that occurred, what fraction were found by **you** / a **customer** / a **third party** / **never**. "Found by customer: 4 of 7" is the most damning line on the screen.
- **The Uptime Ribbon** — a per-level strip colouring every second green/amber/red with incident markers, plus **a thinner lane beneath for business events** so cause and effect align vertically.
- **The Incident Timeline Strip** — a film strip of the level's incidents as scrubbable thumbnails; raw material for the end-of-level comic.
- **The Traffic Sankey** — an inbound ribbon splitting into `SERVED`, `QUEUED→SERVED`, `BOUNCED`, `BLOCKED` and **`BLOCKED IN ERROR` (amber)**, drawn last and on top, each branch labelled with a count **and a dollar figure**.
- **The Attacker Ledger** — per threat type: attempts, blocked, landed, damage, time-to-detect, plus a **"threats that got through and you never noticed"** count revealed at the end, each naming the monitoring purchase that would have caught it.
- **Money Left On The Table (three columns, not one number)** — **didn't earn it** (bounces, blocks in error, queuing past patience) · **didn't bill it** (leakage) · **didn't collect it** (bad debt). Column 1 splits into latency, errors, **your own false positives**, capacity, never arrived.
- **The Leak Report** — revenue earned and never invoiced: unbilled overage, un-provisioned upgrades, free add-ons, expired promos, cancelled services still running. **0.2–0.5%/month**, **2–5% of MRR** unmanaged.
- **Blast Radius Rating** — the maximum customers a single failure could have taken out: you can win and still grade poorly, which tells you the win was luck.
- **The "Would You Have Survived" Simulator** — runs your final topology against **five hypothetical failures you didn't experience** — rack, transit, DB, key-staff, region.
- **Preparedness score** — scored **independently of outcome** from tested restores, exercised failovers, current runbooks, spares, break-glass tested, config backups, early orders, drills.
- **Rebuildability index** — fleet-average hours-to-rebuild: one number summarising technical debt, falling as you automate, rising with every snowflake.
- **Near-miss ledger** — the second drive failing two days after the rebuild, the circuit ordered three weeks early, the breaker peaking at 79%, the backup succeeding on its last retry.
- **Toil hours** — total hand-time on repetitive manual work, shown next to the automation you could have bought.
- **Par time to detect / par time to repair** — an authored par MTTD/MTTR per incident type with your result against par and what would have moved it. (+1 var)
- **Cost per served unit** — dollars per thousand requests / player-hour / GB restored / GPU-hour / mailbox / pass, **per line**: the operational twin of gross margin.
- **Revenue per kW, per rack unit, and per engineer** — **$/U/month**, **$/kW/month** (decisive at Tier 4+), **revenue per engineer** (the real constraint). $/sq ft makes a floor heat map.
- **The Externality Score** — a fifth axis: outbound abuse originated, amplification reflected, spam delivered, DMCA unactioned, carbon emitted, water consumed. Feeds Trust-with-upstreams.
- **The Decision Audit** — surfaces the **three moments that mattered most** by counterfactual impact, with what the alternatives would have produced and the sim's confidence.
- **The Attribution Ledger** — every delayed consequence stamped with its cause at creation: *"Churn +6 this month. Source: support headcount cut, 89 days ago."* The **Retro-Thread** animates back along the Timeline Ribbon.
- **The letter grade and the derived flavour title** — S/A/B/C/D/F plus a title **generated from your two most extreme axes**: "Immaculate and Broke", "Selling Faster Than We Can Serve". The Grade Stamp slams off-register in 0.4s, gold foil at S. (+1 var)
- **The Report Card** — the level as one physical sheet with embossed stamps for uptime, margin, growth, security and customer-sat, thunking down in sequence.
- **Four analog dials — and the sequencing that resolves the three-presentation conflict** — needle gauges for Uptime, Margin, Growth, Trust with a physical wobble, plus a fifth for cash conversion cycle. **Dials are the hero, bars the detail, the stamp lands on top.**
- **The Instrument Cluster (one bezel, many faces)** — ~25 per-line meters share one housing (44mm circular or 120×28 rectangular); only the face changes: pendulum (tick rate), clamp-meter (amps), hourglass (RTO), candle (p99), postmark (email), fill gauge (durability), dual-needle (crypto), checklist (compliance), closing wedge (satellite), density comb (shared).
- **Per-line scorecard reweighting** — the score screen skinned per type: backup leads with restores tested, game with tick stability, email with inbox placement, colo with occupancy, GPU with utilization.
- **The Board Review (the alternative framing)** — the end screen as a board-meeting deck grading Growth, Profitability, Efficiency, Risk and Cash Discipline with in-character lines. Ship as modes tied to financing: VC → Board Review, bootstrapped → Report Card, operator → postmortem. (+3 var)
- **The postmortem screen** — the debrief as a document: timeline, three biggest cost drivers, the decision that mattered most, churn reasons, MTTR, revenue by line, **the three most expensive mistakes**, and unlock choices from what went wrong.
- **The Efficiency Frontier** — outcome per dollar against a par curve: beating it earns medals, over-building earns a **"Bought It"** tag. Shown *during* play as a faint line on your spend graph.
- **Par and efficiency medals** — a par build cost and par hand-count per level with medals for beating them: elegance over brute force.
- **The medal / star roster** — *Zero-Touch* · *Clean Sheet* · *Frugal* · *Honest Broker* · *Antifragile* · **No Heroes** · *Restore Verified* · *No SLA Credits Paid* · *Never Oversold* · *Fired Zero Customers* · *Survived On One Carrier* · **The Boring Win**. Stars on Uptime, Profit, Growth, Reputation, Efficiency, Safety.
- **Scored Retreats** — shedding a line, firing a whale, declaring planned maintenance, exiting a market or migrating off a dying platform, with execution medals.
- **The Streak Ladder** — consecutive days without an SLA breach, data loss, security incident, missed backup or reliability churn, each with a reward tier. Breaking one hurts more the longer it ran.
- **The Customer's Scorecard** — three named customers each write a one-page assessment: uptime as *they* experienced it, support, value, renewal intent. **They disagree with each other and with your dashboard.**
- **Star ratings as real reviews** — generated reviews in the customer's voice, each carrying portrait, **date and tenure** — a 1-star from a four-year customer reads nothing like one from last week. (+2 var)
- **Score = Status Page** — the grade as your own public status page: **all-green = A, scattered red = D**, incidents in the language customers read during play, with per-era skins.
- **The Wall of Ghosts** — lost customers as greyscale portrait cards pinned crooked with name, tenure and exit quote; one you saved then lost carries a repaired tear.
- **The Blueprint Card** — the level as a collectible spec card: your topology in blueprint style with stats in a title block.
- **The Grade Curve Portrait** — a generated illustration of your facility as it ended, with actual rack count, sky colour, sign and scars.
- **The Sankey Payoff** — one dense end-of-level chart: visitors in → served/bounced, revenue → costs → profit. The one place a chart beats a metaphor.
- **The Trophy Shelf** — level awards as physical objects in your office: a bent drive on a plaque, a framed first dollar, a melted optic, a signed jersey.
- **The comparative ghost run / Par Ghost** — replay against your own or a friend's attempt as a ghost line on the uptime ribbon, timeline and money curve.
- **Endless-mode scoring** — a **weekly leaderboard on (uptime × profit) at day 7**, each survived incident adding a **visible scar**; the score prints as a receipt with a **QR code decoding to the run's topology**.
- **Company Valuation (the campaign meta-score)** — MRR/ARR × a multiple modified by growth, NRR, churn, concentration, margin, reputation and infrastructure quality, so "ugly profitable" and "beautiful unprofitable" both lose.
- **Per-line valuation bases (because real buyers don't use one multiple)** — shared/VPS **3–6× EBITDA or 10–18× monthly revenue** · managed/cloud **6–12× EBITDA** · **colo on NOI and cap rate, 6–9% cap ≈ 11–16× NOI** · wholesale DC on backlog at per-MW valuations · GPU/AI on backlog plus hardware residual · **bulletproof effectively unsellable**. The same revenue is worth **3× more** on a 5-year contract with a creditworthy tenant.
- **The valuation modifiers that actually move a hosting price** — **WARCT** · **concentration** (>25% in one customer costs **20–30% of the multiple**) · **owner dependence** · **quality of earnings** · **contract assignability** · **deferred revenue balance**, which comes off the price as a working-capital adjustment.
- **Adjusted EBITDA and the addback game** — present *adjusted* EBITDA, adding back one-time costs, above-market owner comp, the failed line, the settlement. Each rejected addback costs credibility and drags the others down.
- **Escrow, holdback, and the working-capital adjustment** — **10–20% of price escrowed for 12–24 months**, a **retention holdback** on customers present at month 12, and a **working-capital adjustment at close**: "5× EBITDA" pays **62% at close**.
- **The diligence report / The Diligence Memo** — a buyer's memo: *"Customer concentration: 34%. Documentation: minimal. Key-person risk: high. No evidence of restore testing."* Three pages on letterhead, **red sticky tab per flag**, underlined in red pen.
- **Concentration Risk Penalty** — one customer or line above **40% of revenue** takes a valuation hit *and* makes a targeted disaster likelier, because events are weighted toward your concentration.
- **Scoring additions worth calling out separately** — contribution margin by cohort and channel · **contracted revenue %** · NRR by line · revenue per kW and rack unit plus the $/sq ft heat map · cash conversion cycle as a fifth dial · Rule of 40 · **WARCT** · cost per served unit · toil hours and escalation rate.

## 6.10 Win and lose conditions

- **The soft-over-hard rule (the governing principle)** — prefer slow, visible, recoverable decline over instant loss: **you should lose slowly enough to understand why**. (+2 var)
- **The Goal Card — declare your win condition at the start** — declare The Exit / The Institution / The Nines / The Scale / The Niche / The Independent / The Annuity (re-choosable once per chapter, at a cost); it **reweights the scorecard, board mandates and which opportunity events appear**.
- **Win conditions, with stated thresholds** — **Exit**: sell at **≥ 4× ARR** · **Institution**: **5 in-game years at ≥ 99.95%, reputation ≥ 80, positive cash every quarter** · **Nines**: **99.99% for 12 months at ≥ 500 customers** · **Scale**: **Tier 6 with ≥ 3 regions** · **Niche**: **≥ 40% share of one type** · **Independent**: **$1M ARR, no outside money** · **Annuity**: contracted revenue with **>24 months remaining exceeding fixed costs**. Per-level: Survival, Profitability, Quality, Strategic, Valuation, **Pivot (≥ 50% of MRR from the new line)**. (+3 var)
- **Bankruptcy / cash zero (Insolvency)** — payroll doesn't clear, warned for months, and **it should frequently happen while the P&L is green**. Escapes: financing, cut staff, raise prices, sell a line, factor receivables, sell the company.
- **Death by cash — *CONFLICTING*** — ⚔️ what happens *at the instant cash hits zero*, deciding whether insolvency is a fail condition, a warning line, or a game mode. **A (master)**: warned, soft, escapable insolvency with named doors, the Death-Spiral Diagram as UI, Zombie Host as a separate inhabitable mode. **B (opencode)**, six designs: **hard bankruptcy** (cash < 0 at wave end = loss, one bridge loan at evil rates); **runway death** (die when **runway < one payroll cycle**); **soft-fail ladder** (a **60-second "the bank holds your checks" red clock**, or **20-second bounced-cheque overdraft theatre** with the right to **liquidate anything at 50%**); **running broke as a state** (below zero triggers a Credit Line / Angel Round — cash for a % of future revenue plus board restrictions, game over only after the grace expires); **bankruptcy with dignity** (a rival absorbs you and the level continues under worse ownership, making customer-trust zero the real game over); **the losing animation as the rule** (vendors repossess, buildables leave the map).
- **Growth Death** — you grew fast, CAC-financed, and the working-capital gap ate you: its own headline because **the mistake was the thing you were proud of**. (+1 var)
- **Concentration Collapse** — your whale leaves and you cannot cover fixed costs; the notice period gives a finite window to replace irreplaceable revenue.
- **Churn Spiral / Mass churn cascade** — churn exceeds adds for N months, or a trigger starts a cascade where **each departure raises the next probability**. Three exits: shed a line, take a loan, fire the worst customers.
- **Reputation Collapse / the empty lane** — Trust below a floor closes every acquisition lane and **demand goes to zero regardless of capacity**. You cannot buy out — Visibility spend does not move Trust. (+2 var)
- **Total / partial data loss** — loss has a shape: how much, how old, and **how provable** — **not knowing what you lost is worse than losing it**. Merged: **total unambiguous whole-estate loss ends the run quietly; anything partial scars and continues**.
- **Upstream termination** — sustained abuse, unpaid bills or nation-state attention gets you fired by your provider. High trust buys a warning call, low trust a null route.
- **Payment processor termination** — chargebacks over the line too long and you can't take money: revenue to zero while costs continue.
- **Debanked (new)** — your bank exits over risk category, regulatory pressure or a sanctions screen, taking cards, ACH and wires together: harder to route around than processor termination.
- **Regulatory shutdown** — an order to cease from the bulletproof line, a compliance failure, a data-residency violation, or a failed audit. Sometimes only the regulated portion closes. (+1 var)
- **Deplatforming** — payment processor **and** upstream both drop you: the bulletproof ending.
- **Uninsurable (new)** — a three-step chain: you lose cover, then the **contracts that require it**, then the **customers**. Each step with a window to act.
- **Covenant Default** — sustained utilization, an EBITDA breach or a leverage test, escalating from waiver fee to forced asset sales to control. Still profitable, still lose.
- **Team collapse / total staff burnout** — no rotation, no documentation, everyone quits: **you keep the infrastructure and lose the ability to operate it**. The *No Heroes* medal is its mirror.
- **Facility loss** — fire, flood, code violation, condemnation, or a landlord who didn't renew; your DR architecture is the difference between a loss condition and a bad quarter.
- **Obsolescence** — in era-spanning play, failing to transition means demand evaporates; the pivot that avoids it is a double-carry.
- **The Zombie Host (a soft fail you inhabit)** — still online, no growth, minimum staff, slowly rotting. You lose growth systems but gain **total focus**. Escape needs a health bar (debt below X, drills current, churn under Y) held three months.
- **Acquisition at a bad multiple (a soft loss/win)** — a competitor buys you cheap: you survive, the score is mediocre, and **the campaign continues under a new owner** with a cost-cutting thesis.

## 6.11 Financing instruments

- **The instrument table (cost, speed, and failure mode)** — bootstrap (0 cost, capped by cash conversion cycle) · customer prepay (~15% discount, a deferred-revenue hole) · revolving credit (**8–14% APR on drawn**, covenant breach) · equipment finance (**6–11%**, 2–4 weeks) · vendor/OEM finance (vendor lock) · term loan (1–3 months, restrictive covenants) · invoice factoring (**1–3% per 30 days**, a distress signal at run-rate) · **merchant cash advance (35–80% effective**, hours, death spiral) · venture (**15–25% dilution**, you can lose by growing slowly) · private equity (control, margin pressure) · sale-leaseback · seller financing/earnout. **Cheap boring money beats fast expensive money.**
- **Bootstrap** — customer revenue only: slowest growth, total control, every decision constrained by cash.
- **Customer-financed growth (the elegant one)** — annual prepay, setup fees and deposits fund the hardware serving those same customers, bought by asking a year up front for two free months.
- **Revolving credit line** — cheap, small, needs a relationship built over time; carries **covenants** (minimum EBITDA, maximum leverage, sometimes uptime). (+3 var)
- **Equipment financing / leasing — the defining instrument of hosting** — hardware is the collateral, converting a capex spike into a monthly cost, sometimes with a **covenant that trips if uptime falls**. **Equipment finance at 8–12% is dramatically cheaper than equity at any price.**
- **Vendor / OEM financing** — the vendor finances the purchase to close the sale, often beating a bank because **they know the collateral's value**. Enormous in GPU-era hosting.
- **Term loan** — for a facility build: long, cheap, restrictive.
- **Invoice factoring / AR financing** — **1–3% per 30 days** for immediate cash on receivables; rational for a one-time enterprise-onboarding gap, a distress signal at run-rate. (+1 var)
- **Merchant cash advance (the labelled trap)** — a fixed percentage of daily card receipts until repaid at an effective **35–80%**, instant and always available. Label it in the postmortem, not before.
- **Venture capital** — equity for speed: dilution, a board seat, and a failure mode where **you lose by growing too slowly while profitable**. Swaps the end screen for the Board Review. (+4 var)
- **The rescue round (the anti-death-spiral boss)** — at **cash < 0 and uptime > X**, a round **conditional on hitting growth metrics for three waves**: rescue and difficulty boost at once.
- **Board dividend pressure (the endgame trilemma)** — the board demands a **payout percentage each quarter**; reinvesting everything triggers a **board-mutiny event**. Bootstrapped runs choose war chest or payout.
- **Private equity / roll-up** — money with an operating thesis: they want **margin, not growth**, bringing a conflict between short-term EBITDA and infrastructure health.
- **Seller financing and earnouts** — buy a competitor out of the revenue it generates, with an **earnout tied to retained customers**: if they churn **you still owe**.
- **The shrinking instruments (the dignified retreat)** — **sell a line of business** (**8–14× its monthly profit**, keeping the distillate) · **sale-leaseback** · **sell your IPv4 block** (~**$30–50/address**) · **fire the worst customers** · **secondary-market liquidation**.
- **Loans priced by your uptime streak — and the operational credit rating beneath it** — one **operational credit rating** with six consequences: insurance premiums · transit terms from traffic ratios and abuse-response speed · vendor credit lines from payment history · enterprise conversion · hiring cost · loan and lease rates.
- **Grants, incentives, and rebates** — slow, regional, rewarding the boring decision; see §6.7.
- **Covenant breach** — the failure mode shared by half the instruments above; see §6.7 and §6.10.

## 6.12 Contract and term structure

*(T1) hosting is billed in terms, not months; **(T3) the contract is a tower** — its clauses are separately buildable defences.*

- **The contract is a tower** — each clause is buildable with a deal-friction cost and defence value: **liability cap** · **SLA credit cap** · **claim window** · **maintenance exclusion** · **auto-renew** · **annual escalator** · **power pass-through** · **MFN** · **audit right** · **consent to assignment** (**your company becomes harder to sell**) · **ETF** · **deposit / letter of credit** · **notice period**. (+5 var)
- **The contract as the difficulty selector** — 99.9 vs 99.99 sets your error budget, price, credit exposure and infrastructure requirement. Merged: **the contract sets difficulty, the price slider sets business model**.
- **The term-length matrix** — effective monthly / cash at signing / 12-month retention / renewal shock: **monthly $12.00 / $12 / ~55% / none** · **annual $8.00 / $96 / ~78% / moderate** · **2-year $6.50 / $156 / ~82% / large** · **3-year $5.50 / $198 / ~85% / severe**. A book of 3-year prepay gives a catastrophic level **36 months later**.
- **The renewal cliff as a scheduled event** — with prepaid terms churn is a **calendar, not a rate**: 400 renewals due is 400 decisions at once, and the intro-vs-renewal spread decides how many go badly.
- **Ramp schedules and the revenue start date** — model **TCV**, **ACV** and **Billing MRR**: a build-to-suit colo deal might be **$14M TCV, $2.8M ACV, and $0 Billing MRR for eleven months**.
- **Take-or-pay and commit burn-down (both directions)** — **a commit you outgrow is free money and one you undershoot is a monthly tax on your own optimism**; customer commits give a floor plus a satisfaction penalty when unused.
- **Reserved vs. spot (the GPU/compute term structure)** — **reserved 1–3 years at 30–50% below spot, often prepaid** · **on-demand** · **spot/preemptible**. Key stat: **contract-term coverage**, the fraction of the financing term covered by contracted revenue.
- **MRC + NRC + settlement (the three-component bill)** — **NRC** one-time cash up front, **MRC** the annuity, **settlement/usage** (per-minute VoIP, per-GB egress, per-GPU-hour overage) a variable tail reconciling in arrears.
- **Circuit and cross-connect contract liabilities (NRC, MRC, term, ETL)** — **cancelling a 36-month circuit in month 4 costs 32 months**, and moving facilities is hard because end dates never line up.
- **The ETF Buyout (contract buyout as an offensive weapon)** — a prospect locked to a rival for 14 months at **$4,000/mo** with an ETF of **50% of remaining value ($28,000)**: **$28,000 to acquire $144,000 of contracted revenue — a 7-month payback**. The competitor AI can do it to you.
- **Escalators, pass-throughs, and the fixed-price trap** — an **annual escalator (typically 3%)** raises MRC yearly and a **power pass-through** transfers energy-cost rises; without them a 5-year lease signed before an energy spike bleeds for four more years.
- **Auto-renew, notice periods, and the evergreen clause** — auto-renew with a **90-day notice window** makes churn a visible notice event. **The customer who forgets to give notice is renewed for a year.**
- **Contract assignability (consent to assignment)** — if a material share of contracts require consent before assignment, **your exit requires their permission**, and buyers discount heavily.
- **WARCT and contracted revenue % (the two numbers that make revenue an asset)** — weighted average remaining contract term and the fraction of MRR with >12 months left: **better health measures than churn, which is backward-looking**.
- **The Contract Term Ribbon (visual)** — term as ribbon length on every customer card: a wall of short ribbons is a business-model problem; a wall of long ones is what an acquirer buys.

## 6.13 Restricted cash and the balance sheet

*Thesis **(T4): money you can't touch is not money** — cash is a stack, not a scalar.*

- **The six cash buckets** — **Free cash** · **Restricted** (rolling reserve, escrow, tenant deposits, letters of credit — **no, and it *looks* like cash**) · **Deferred** · **AR** (only via factoring) · **Backlog** (signed, not installed, not billing) · **Committed out** (negative). **The spendable layer thinning while the total grows is the picture of "profitable and insolvent"**.
- **The Balance Sheet (assets, liabilities, equity)** — **assets**: depreciated hardware, **owned IP space (which appreciates)**, prepaid contracts, receivables, spares, building, capitalized fit-out. **Liabilities**: debt, leases, **deferred revenue**, **accrued SLA credits**, committed-out, **decommissioning obligation**.
- **The Rolling Reserve** — a permanent haircut plus a one-time trough of *reserve % × monthly card revenue × reserve months*: at **10% and 180 days on $200k/month that's $120,000 permanently parked**. (+1 var)
- **Escrow holdbacks and the working-capital adjustment** — exit-side restricted cash: **10–20% of price held 12–24 months**, plus a retention holdback, plus a claw-back of deferred revenue you already spent.
- **Security deposits and letters of credit (both directions)** — *you hold* tenant deposits and *you post* deposits, letters of credit and sometimes a **personal guarantee**. Cash locked for the term, invisible on the P&L, attacking runway.
- **The Performance Bond** — above a deal size **a bank co-signs your SLA** at **1–3% per year upkeep that shrinks as your claims history improves**. On breach the customer **draws the bond directly**, and **two draws in a year blacklists you from the government/enterprise RFP lane**.
- **Deferred revenue, spent** — prepay lands as cash and recognises 1/12 per month; let the player spend it, then punish at the refund, the working-capital adjustment, or the auditor's question.
- **AR aging and DSO** — buckets **0–30 / 31–60 / 61–90 / 90+** with **DSO** as summary. The **AR Aging Shelf** is four trays of invoice slips sliding right and yellowing. (+1 var)
- **Bad debt and the write-off (with provisioning)** — you either **provision** (reducing profit now) or take a lump later. Bands: shared **2–4%**, VPS **1–3%**, SMB dedicated **1–2%**, enterprise **<0.5%**, colo **<0.5%**, bulletproof **~0**. (+2 var)
- **Revenue leakage and Revenue Assurance** — unbilled overage, un-provisioned upgrades, free add-ons, expired promos, cancelled services still running: **0.2–0.5%/month**, **2–5% of MRR** unmanaged. (+1 var)
- **Backlog (signed, not installed, not billing)** — the gap between TCV and Billing MRR: enormous in colo, wholesale and GPU, near-zero in self-serve. Your best asset and worst cash problem at once.
- **Committed out (take-or-pay, leases, open POs)** — negative cash already promised; see §6.12.
- **AP as a lever (and a trap)** — stretching to **pay at 45 instead of 30** smooths a trough, but past a point the distributor puts you on credit hold and **word travels in a small industry**.
- **Capitalized fit-out** — a build-out **amortized over ~60 months** against a 60-month lease: why colo's cash conversion cycle is **+18 months**; leave early and the unamortized balance is written off at once.
- **The decommissioning obligation** — certified destruction, recycling fees, sanitization evidence and "make good" lease clauses, **accrued over the asset's life** — and the player who never accrues gets the surprise.
- **The cash conversion cycle (as a balance-sheet readout)** — shown **per line**: why prepaid shared funds itself, dedicated needs a credit line, and colo needs a bank.
- **The cash-flow waterfall** — the monthly bridge: money in → money committed → money actually available. Why the whale contract is a crisis.

## 6.14 Multi-line, transition, and portfolio economics

*Thesis **(T5): a pivot is a double-carry** — for 12–24 months you pay for two companies.*

- **The pivot double-carry** — for **12–24 months** you carry the old platform's hardware, licences, transit and staff plus the new platform's capex, hiring and learning curve, **two support organisations** and two toolchains. A **Double-Carry meter** shows a moving crossover date.
- **The Line J-Curve** — **months 1–6 negative**, **7–18 near breakeven**, **19+ contributing**, and you must fund the trough. Colo's is deeper and longer, a reseller's nearly flat, a GPU line's enormous with time-limited upside.
- **The dual-run cost** — during migration both environments run: a **6-week migration on a $12k/month footprint has an $18k overlap cost**, and who eats it is a negotiation.
- **Internal transfer pricing** — internal usage is **free** (hides which line is profitable) or **charged at market** (accurate, with conflict and overhead). Get it wrong and **your worst line looks like your best**. (+2 var)
- **Revenue per rack unit, per kW, and per engineer** — GPU is brilliant on $/U and terrible on $/kW, shared is the reverse, managed looks great on both and destroys revenue-per-engineer.
- **The Secondary Market** — **used hardware** (**buy a liquidation at 20 cents on the dollar**) · **IPv4 blocks** (a block with blacklist history is cheap for a reason) · **customer books** · **spot capacity** rented at a punitive rate.
- **The Capital Cycle (bubble years and winter years)** — **bubble years** (cheap money, GPU demand, everyone building) and **winter years** (customers vanish, capex stranded, the used market full of liquidations). "Buy or rent" becomes a timing bet.
- **Portfolio synergies that pay actual bills** — **peak-hour** · **peering-ratio** (inbound-heavy offsets outbound-heavy, lowering transit) · **seasonal** · **interruptibility mix** (batch enables demand-response revenue) · **support-load** complementarity. Anti-synergies: correlated peaks, carrier risk, affiliate cohorts.
- **Carbon and water accounting** — **carbon intensity** (gCO2/kWh by grid and time of day) and **WUE**, increasingly thresholded by enterprise buyers. Improve by **efficiency**, **renewable procurement** or **certificates** (a **greenwashing reputation event** if low-quality).
- **Insurance vs redundancy as an explicit decision curve** — per risk, **prevent** (redundancy, drills — reduces *probability*) against **absorb** (insurance, reserves, contract terms — reduces *consequence*); **the crossing point is where the right answer flips**. (+2 var)
- **Meta-currencies (the War Chest, War Stories, and the case for just one)** — **War Chest** (under-spent upkeep becomes next-level cash), **War Stories** (earned from unusual disasters survived, spent on lore cosmetics and start bonuses), and **postmortem tokens**. (+3 var)
- **The meta-economy across the campaign** — what carries forward: **technical debt** · **reputation and per-segment Trust** · **hardware, which ages** · **institutional knowledge** as runbooks and retained staff · **relationships** with carriers, peers, vendors, processor · **error budget surplus** · **the Streak Ladder** · **Company Valuation**. (+1 var)

## 6.15 The money design language (drawing the economy)

*The visual grammar that makes forty cost lines and thirty-five metrics legible; several entries are the missing *specification* for ideas above.*

- **Gold Is Reserved** — nothing in the world is gold except money: no gold accents, chrome or lighting. Makes money legible in the busiest frame at zero cost.
- **Money Always Moves** — money in flies toward the gutter, money out drips away, money reversed (refund, credit, chargeback) flies **backward**. Winning is readable with sound off. (+4 var)
- **Money at Three Scales (the LOD system)** — **discrete** (<~30 conversions/sec, coin motes), **drizzle** (30–500/sec, a fine gold stream whose density is the rate), **sheen** (>500/sec, **no particles**, a gold rim-light). Automatic, or DNS/serverless/IoT levels melt the frame budget.
- **Per-Type Currency Glyphs** — the coin mote takes the line's unit: **U-bracket** (colo space), **plug** (kW), **slot** (game), **GB-month tile** (storage), **minute** (VoIP), **GPU-hour chip**, **mailbox**, **query fleck** (DNS), **pass wedge** (satellite), **patch cable** (cross-connect — the fattest glyph in the game).
- **The Per-Visitor Coin (value as physical size)** — every converted visitor drops a coin sized by value: a page load drops a fleck, a colo contract an **ingot the size of a rack**.
- **The Revenue Gutter** — a channel along the bottom where earned coins collect and flow into the treasury: a healthy company has a visible **current**, a struggling one a trickle.
- **The MRR Spine** — a stack of contract cards on the right edge whose **total height is your MRR**; new customers slot in, churned ones fall out. Each card carries its Term Ribbon, SLA Tier Stripe, Margin Tint and Anchor or Kite. (+1 var)
- **The Recurring Pulse** — on the monthly boundary every contract card flashes gold in sequence, a wave down the spine, and a large amount lands in the gutter.
- **The HQ Plaza (the composition law)** — MRR Fountain, Burn-Rate Smoke, Coin Physics and Invoice Train each get **one axis of one fixed plaza**: fountain centre, chimney rear, ledger printer at the desk, train platform on the flank. Without the law every money idea claims the same corner.
- **The MRR Fountain** — recurring revenue as the fountain's spray height: churn lowers the water level, a big enterprise close makes it geyser.
- **Burn-Rate Smoke** — the HQ chimney encodes profit: **white = thriving, grey = thin, black = bleeding**; a cryptominer infestation turns it black with nothing visibly on fire.
- **The Invoice Train** — each billing cycle a tiny train departs HQ with coin wagons and returns with payment blips; **late payments = the train coming back empty, with a sad horn**.
- **Income as Fluid Light (the Vault as base HP)** — revenue as luminous fluid flowing through invoice cables into a glass vault whose fullness is your score-during-play; ransomware, fines and refunds drain it through a visible outflow.
- **The Meter** — a vintage electric-meter dial spinning faster as revenue ticks; **the game's money sound is the meter's hum**, and churning a big customer makes it skip backward.
- **The Ledger Tape** — a receipt printer bottom-right printing one monospace line per financial event, spooling a scrubbable paper tail. (+2 var)
- **The Ledger Drawer, specified** — a **ring binder** over the bottom third with **tabbed dividers in five colours** on **accounting stock**: pale green ruled paper, typewriter figures, blue-pen totals, a red circle around anything bad. Closing it is a physical snap.
- **The Gap Bar** — the specification for §6.4's Cash-vs-Profit, where **the gap is the widget rather than a byproduct of two widgets**.
- **The Burn Candle** — net burn as a candle: tall and steady when profitable, shrinking with a visible wick when burning cash, **runway in days = candle length**. (+1 var)
- **The Drain Choir** — below the cash column, **five labelled streams** falling at rates proportional to spend — `POWER`, `PAYROLL`, `TRANSIT`, `LICENCES`, `DEBT` — each with its own particle and pitch; hovering traces one to the objects producing it. (+1 var)
- **Capex vs Opex Split Bar** — one bar in two materials: capex as **solid metal blocks**, opex as **flowing liquid**. An accounting concept made intuitive with no text.
- **The Two-Pan Scale** — a balance with revenue on one pan and costs on the other: great for glances, **terrible for precision**. Loses the HUD corner to the liquid column and becomes a drawer widget. (+1 var)
- **The Invoice Bird and the Dunning Ladder** — invoices as a flock returning as a gold coin, grey envelope or red RETURN stamp, and escalation as a ladder you watch a customer climb (§6.4).
- **The Invoice Calendar Strip** — 31 cells with icons on the days that matter, making cash a visible timing puzzle (§6.4).
- **The AR Aging Shelf** — four trays of invoice slips sliding right and yellowing as they age (§6.13).
- **The Overage Meter** — a tank filling past a marked line, beyond which the coin flow turns a brighter, greedier gold (§6.2).
- **Setup Fee Confetti** — one-time fees drop as a burst that is **brighter and once**, distinguishable from recurring gold.
- **The Upsell Handshake** — an upsell adds a coloured stripe to the customer card and **the card grows taller with a satisfying push**.
- **The Marketplace Shelf** — add-ons as products on a storefront shelf, where **attach rate is how many customers carry your shopping bag**.
- **The Cross-Connect Faucet** — every cross-connect adds a small faucet dripping gold; a meet-me room full of faucets is a picture of a very good business.
- **The Power Resale Meter** — a spinning utility meter dial mounted on each cage: you literally sell the spinning of a dial.
- **The Upkeep Drip** — the constant ambient cost, always visible, always draining: the baseline against which every revenue stream is read. (+1 var)
- **The Power Bill Dial** — a wall meter whose dial speed is live power draw, whirling when a GPU row comes on; at month end it stops, is read, and a very large coin leaves the treasury. The demand-charge ratchet scars the same graph.
- **PUE as a Leak** — the share of the incoming power ribbon that never reaches the racks visibly leaks sideways into cooling; improving PUE narrows the leak.
- **The 95th-Percentile Graph, specified** — the top 5% **lifted and greyed**, floating above the plot as **countable discarded confetti** (36 hours' worth), the bill a heavy rule **labelled in dollars, not Mbps**, the commit a second dashed rule.
- **Payroll Pulse** — a biweekly red pulse across the staff roster and a chunk leaving the treasury.
- **The Lease Stamp** — facility rent as a big rubber stamp on the ledger tape each month: bigger facility, bigger stamp, bigger noise.
- **The Depreciation Fade** — owned gear's card value fades until end-of-life gear is nearly transparent on the balance-sheet widget **while still fully solid in the world**.
- **Shipping & Lead Time** — ordered gear crosses the region map as a truck or plane with an ETA; **expedited shipping is a faster, gold-tinted vehicle**.
- **The Remote Hands Clock** — every minute a datacenter tech works for you is a visibly ticking meter, like a taxi. You will hurry.
- **The Incident Cost Meter** — during an outage a red top-bar counter accumulates **lost revenue + SLA credits + staff overtime**. Shares the **Taxi Meter** with toll fraud, egress shock and recursive invocation. (+2 var)
- **The Technical Debt Ledger** — deferred maintenance as **literal IOU slips pinned to affected objects**, each raising that object's failure probability; paydown tears them off.
- **The Price Dial + Demand Ghost** — turn the dial and a **ghost preview** of the resulting visitor stream renders beside the real one (§6.5). (+1 var)
- **The Competitor Price Tag** — rivals' prices as tags hanging at the edge of your market view, making price wars a watchable tug-of-war.
- **The Margin Tint** — service and customer cards tinted green (high margin) to **rust** (losing money): scan for rust to know who to fire.
- **The Oversubscription Slider** — a green safe zone, a yellow zone, and **a red zone where your tenement windows start flickering**.
- **The SLA Tier Stripe** — Bronze/Silver/Gold/Platinum as stripes on the contract card *and* the infrastructure, high-tier gear glowing so you know which rack you cannot take down.
- **The Contract Term Ribbon** — remaining term as ribbon length, so a wall of short ribbons is a visible business-model problem (§6.12).
- **The Three-Clock Cluster** — concentric dials: **inner (fast)** the current wave or incident; **middle** the month or migration as a filling arc; **outer (slow)** the contract, audit or era. **A fourth timed system with no ring doesn't ship.**
- **The Runway Tone Shift** — the three-stage chrome-only spec in §6.4: nothing flashes, it just gets quieter and colder.
- **The Instrument Cluster (one bezel, many faces)** — the shared industrial design keeping ~25 per-line meters from reading as a flea market (§6.9).
- **The Report Card, the Grade Stamp, and the Diligence Memo** — embossed stamps on heavy paper, an off-register rubber stamp with a hand-written title, and a three-page memo with red sticky tabs.
- **The Sankey Payoff and Money Left On The Table as negative space** — the one place a chart beats a metaphor, and the missing money drawn as a silhouette above the bar you achieved.
- **The Trophy Shelf and the Grade Curve Portrait** — your office as a museum of the campaign, and a generated portrait of the facility as it ended.
- **Chargeback Flies and Fraud Pops** — failed billing becomes **literal flies buzzing out of the vault** leaving coin-dust trails; paid coins occasionally fly *back* mid-arc with a red receipt, making velocity checks feel like interceptors.
- **SLA Contract Pin and Lightning** — the active contract pinned in the HUD corner, **breaches tearing red pen across its text in real time**; a missed SLA fires red lightning from the customer's hourglass to your cash column.
- **The Error-Budget Hourglass** — **incidents drain sand, time refills it, and risky changes require sand to spend**, answering in one glance: *can I afford to touch prod right now?*
- **Insurance Wall of Frames** — policies as framed documents: **filing a claim flips a frame to a grey photocopy with a CLAIMED stamp**, and **an empty frame means a fraud audit is pending**.
- **The VC Puppeteer** — investment lays translucent hands-and-strings over HQ and growth quotas render as a boardroom countdown on the sky. Credit-line counterpart: an overdraft bar with an interest ticker tinting every purchase button red.
- **Spot-Market Weather** — transit, IP and hardware prices as a live ticker, so buying burst capacity on the green tick is a micro-skill. The ticker's font matches each act's era.
- **Season-Pass Contracts** — annual-prepay customers land as **a fat briefcase up front**, then their auras become **locked gold**. Churning a prepaid account triggers a bigger, louder storm.
- **Cost-on-Hover Chits** — hover shows price as **coin-stack icons** and upkeep as a **chimney-smoke glyph**; the Price Tag Everything variant pops a hang-tag with cost, upkeep, revenue and risk.
- **The Profit Glow** — at positive cashflow the facility takes a warmer grade and the ambient LED hum rises; losses creep desaturation in from the edges.
- **Revenue-Mix Mobile** — end-of-level revenue composition as a hanging kinetic sculpture: the Sankey is for reading, the mobile for keeping.
- **Customer Lifetime Trail** — each customer sprite leaves a warm trail of historical payments, and **when they churn the wake cuts**.
- **The Reputation Sky-Gauge** — ambient weather as the long-term economy read: **clear skies = premium pricing power, storm = discounts needed**. The cheapest HUD element: none.
- **The Dust Sheet Ending** — on failure the camera pulls back and dust sheets fall over the racks row by row while the lights go out from the far wall toward you.
- **Bankruptcy Cascade** — progressive shutdown: ambient lighting, then non-critical racks, then cooling, then the sign outside. Fifteen seconds, hurting throughout.
- **The Acquisition Ending (good)** — a competitor's logo beside yours on the sign, or your logo going up on *their* building. Endings expressed as signage.
- **Par Ghost** — each level's "par" run as a faint ghost line on the incident timeline and revenue graph.

## 6.16 Baseline tuning numbers

*⚔️ the three sheets sit at different tiers and eras and disagree on unit costs — a web node is **$1,800 in Sheet A and $3,200 in Sheet B**, upkeep per node **$45–$190**. A = "Tier 1–3, own boxes, upkeep = power + space"; B = "Tier 2–3, upkeep includes transit, licences, monitoring"; C = "real-market retail/wholesale, mid-2020s". Pick one canonical; the merge does not choose.*

- **Sheet A — the starting-position baseline** — Tier 1 start: cash **$4,000**, MRR **$0**, upkeep **$180/mo**, **1 hand**. Capex / upkeep: 1U web **$1,800 / $45** · app 2U **$3,400 / $80** · DB primary **$6,500 / $140** · replica **$4,000 / $95** · cache **$1,200 / $35** · object node **$5,500 / $120** · ToR **$2,500 / $25** · core pair **$16,000 / $120** · firewall **$4,500 / $90 + $150 licence** · L7 LB **$3,000 / $70** · rented cabinet **$700–1,200 incl. 5kW** · own cabinet **$18,000 fit-out / $340 power** · UPS 6kVA **$4,200 / $30** · 250kW generator + ATS **$95,000 / $600 + fuel** · CRAC **$28,000 / $400** · 1Gbps transit commit **$600–1,400** · 10G IX port **$1,500 / $400** · cross-connect **$300 / $80–300** · managed WAF **$250 + $0.60/GB** · scrubbing retainer **$900 + per-incident** · CDN **$0.02–0.08/GB** · backup **$6/TB hot, $1.20/TB cold** · panel licence **$2.50–8.00/account** · monitoring per layer **$80 / $150 / $400 / $700 / $1,100**. Staff loaded monthly: intern **$1,800** · junior sysadmin **$4,500** · sysadmin **$7,000** · senior SRE **$11,000** · network engineer **$10,000** · DBA **$10,500** · security engineer **$11,500** · support T1 **$3,600** · T2 **$5,500** · sales **$6,000 + commission** · account manager **$6,500** · abuse analyst **$5,000** · DC tech **$5,000** (or **remote hands $180/hr, 4-hour minimum**). Revenue units: shared account **$5–12** · managed WP **$30–90** · VPS **$6–60** · dedicated **$90–400** · colo cabinet **$700–1,600 + power** · cross-connect **$80–300** · game slot **$3–15** · mailbox **$1.50–5** · DNS zone **$0.50–4** · CDN **$0.02–0.08/GB** · object storage **$0.015–0.025/GB/mo + egress** · backup **$8–25/TB protected** · GPU-hour **$0.90–4.50** · scrubbing **$400–4,000/mo per prefix**. Checks: payment fees **13% of a $3 plan, 0.6% of a $500 plan**; a ticket costs **$14–22 loaded**; a $1,800 1U over 48 months is **$37.50/month**.
- **Sheet B — the opening tuning spine (with time, pressure, and patience)** — **Time**: **1 real second = 1 simulated minute**, **business month every 4 real minutes**, a 20-minute level = **5 in-game months = 1 quarter**, waves on an **85–110 second cycle**. **Money** (capex / upkeep): web node 2U **$3,200 / $190** · DB primary **$9,000 / $520** · replica **$6,500 / $380** · cache **$2,100 / $120** · LB pair **$7,000 / $420** · firewall **$2,500 / $150** · managed WAF **$0 / $600 + $0.40/1k req** · tier-2 monitoring **$1,200 / $240** · 10TB immutable vault **$4,500 / $310** · scrubbing **$900 always-on, $2,500/incident** · junior sysadmin **$5,400** · senior SRE **$11,000** · support T1 **$3,900**. **Revenue anchors**: shared **$5.99** · VPS **$22** · managed WP **$35** · dedicated **$189** · colo cabinet + 5kW **$1,450** · cross-connect **$290** · GPU-hour **$2.10** · backup **$0.019/GB-mo** · game slot **$0.85/slot-mo**. **Health ratios**: upkeep as % of revenue **<45% under-built, 55–70% healthy, >80% one incident from insolvency**; support cost **>30% of revenue means the plan tier is wrong**; CAC payback **under 60% of tenure**; **headroom below 25% doubles incident cost**. **Wave pressure** `P(n) = 100 × 1.115^n × S(n)`, sawtooth `[1.0, 0.55, 1.3, 0.7, 1.55, 0.6, 1.75, 0.65, …]`, at most two threat roles above 30% of a wave, a new role every fourth wave. **Patience (ms, bounce at 50%)**: Skimmer 1,800 · Mobile Commuter 1,100 (arrives at 60% patience) · Desktop Regular 3,500 · Deep Reader 4,200 · Impulse Buyer 900 · Comparison Shopper 2,400 · Checkout Buyer 3,000 over 6 hops · Enterprise Evaluator **∞ latency / finite evidence** · API Client **hard-fails at 5,000** · Streamer 2 rebuffers per 10 min. **Bounce sigmoid**: **10% at 0.6× budget, 50% at 1.0×, 95% at 1.6×**. **Values**: Skimmer 1 · Deep Reader 4 · Comparison Shopper 6 · Impulse Buyer 28 · Checkout Buyer 50 · Power User 12 (**5× load**) · Enterprise lead 900 · **colo lease signature 20,000** · Reviewer ±180 reputation · Influencer **400 future spawns**.
- **Sheet C — the real-market number sheet** — **Retail**: shared **$3–15/mo advertised, renewing $9–25** · managed WP **$25–100/site** · VPS **$5–40** · dedicated **$80–400** · colo **$500–1,400/cabinet at 3–5kW retail, $120–180/kW wholesale** · cross-connect **$100–350 MRC, $250–500 NRC** · transit **$0.15–0.60/Mbps at 10G+ commit** · IPv4 **~$30–50 buy, $0.50–0.80/mo lease** · backup **$0.02–0.12/GB/mo by RTO tier** · H100-class GPU **$2–4/hr in 2024 drifting to $1.5–2.5, reserved 30–50% below spot**. **Costs**: power **$0.06–0.14/kWh**, 1kW continuous ≈ **$65–100/mo × PUE**; PUE **1.1–1.25 / 1.4–1.8 / 2.0+**; commodity 1U **$1,500–4,000**, 8×H100 **$250–400k**; depreciation **3–5 years straight line, 10–20% residual at year 4**; payments **2.9% + $0.30 retail, 1.5–2.5% interchange-plus at volume, $15–25/chargeback**; loaded support agent **$45–75k US / $12–22k offshore**, sysadmin **$75–115k**, SRE **$130–190k**, DC tech **$45–70k**, multiplier **1.25–1.4×**; support **15–30 tickets/agent/day at $4–12 US, $1.50–4 offshore**; panel licence **$2–20/account/mo**. **Rates**: monthly logo churn shared **3–6%**, VPS **4–8%**, managed WP **1.5–3%**, dedicated **1–2%**, colo **0.3–0.8%**, enterprise managed **0.2–0.5%**; involuntary churn **20–40% of gross** (dunning recovers **30–50%**); card failure **5–9%/month**; free-to-paid **1–4%** (unverified free tiers **30–60% abusive**); trial-to-paid with card **35–60%**; affiliate CPA **$65–150 with 45–90 day clawback**; CAC payback **under 12 months**, LTV:CAC **above 3:1**; support cost **healthy under 15% of revenue, dead above 30%**; gross margin shared **70–80%**, VPS **60–75%**, managed **55–70%**, dedicated **45–60%**, colo **55–70% after power**, backup **60–75%**, GPU **40–60% when hot**, bandwidth resale **20–40%**; bad debt **2–4% consumer, <0.5% enterprise**; leakage **2–5% of MRR**; colo occupancy **85%+ target, below 65% loses money**; GPU utilization breakeven **~55–65%, above 90% no maintenance**.
- **Derived tuning constants worth stating once** — contention `P = (ratio/10)^2.2 × homogeneity` · technical debt `0.8% of estate value per month per debt point`, paydown `3 months of that interest` · cost of a nine `~3.5× infrastructure, ~2× operational discipline per nine`, the fifth not purchasable · error budget `(1 − commitment) × 30 days` = 7h18m / 3h39m / 43m / 21m36s / 4m19s · wave pressure `P(n) = 100 × 1.115^n × S(n)` · bounce sigmoid 10/50/95% at 0.6×/1.0×/1.6× · grade bands **S ≥ 92 · A ≥ 82 · B ≥ 70 · C ≥ 58 · D ≥ 45 · F** · score weights **30/20/30/20 plus a fifth worth 20**, or conversion-first **35/25/20/20** (⚔️ §6.9) · budget split **Grow 45 / Defend 25 / Sustain 30** · rolling reserve `reserve % × monthly card revenue × reserve months` · J-curve months 1–6 negative, 7–18 near breakeven, 19+ contributing · pivot double-carry 12–24 months.
- **Sheet D — additional anchors that do not conflict** — 3-year commit discount **~40% off list** · tenant-side cross-connect MRC **$150–300/month forever** · cooling overhead **~0.4W per watt of compute (PUE ≈ 1.4), super-linear with heat** · colo connected-power overcommit **~1.2× diversified demand** · SLA credits **5–100% of monthly fee per tier, enterprise 10× multipliers plus liquidated damages, higher tiers 2N** · error-budget headlines **99.9% ≈ 43 min/month, 99.99% ≈ 4.4 min/month** · rolling reserve **~10% of card revenue on a 180-day release** · invoice factoring **3–5% haircut** (same instrument as §6.11's 1–3%/30 days) · Rule of 40 gate **growth% + FCF% ≥ 40** · CAC payback **<12 months = investor-patience buff, >18 months = growth-without-funding fails** · leakage callout sized as **"you gave away $4,200 this month"**.
- **Per-type gross-margin bands — *CONFLICTING*** — ⚔️ colo and GPU get materially different numbers for the same dial, implying different correct decisions about power resale, occupancy targets and whether colo is the "safe" line. **A (Sheet C)**: shared **70–80%** · VPS **60–75%** · managed **55–70%** · dedicated **45–60%** · **colo 55–70% after power** · backup **60–75%** · **GPU 40–60% when hot** · bandwidth resale **20–40%**. **B (opencode)**: shared **~70% if overcommit is right, −200% if support explodes** · VPS thin and metered · **colo ~40–50% on the real estate** · GPU fat during mania, negative on idle · backup low per-unit with eternal tenure · email/DNS pennies at volume · regulated huge with slow deals · **bulletproof 80% until seized**; an earlier version disagrees again — shared **~80% until support load**, **colo ~50%**, cloud **60–70%**, **GPU 70% today collapsing as spot falls**, offshore **90% until seized**. A quotes steady-state margins, B the top of the range with the failure mode attached; the in-game readout must agree with exactly one.
- **GPU hourly price and the collapse curve — *CONFLICTING*** — ⚔️ different absolute prices *and* a different decay rate for the same asset, deciding whether GPU is cyclical or a bomb. **A**: **H100-class $2–4/GPU-hour in 2024 drifting to $1.5–2.5**, reserved **30–50% below spot**, against **$250–400k per 8×H100 node**, breakeven **~55–65% utilization** — a **35–40% decline**, painful but survivable, making contract-term coverage the deciding stat. **B (opencode)**: **$8/hr falling to $2/hr in two years — a 75% collapse**, at which rate four-year hardware financing against a market repricing in two is an extinction event.
- **Oversell ratio detents — *CONFLICTING*** — ⚔️ the headline shared overcommit ratio differs by an order of magnitude, and it is the most consequential number in the shared line. **A**: **5:1 safe, 12:1 aggressive, 20–30:1 reckless**, with per-resource failure shapes (CPU graceful, RAM catastrophic, storage stops dead, power trips a breaker) and `P = (ratio/10)^2.2 × homogeneity`. **B (opencode)**: **400:1 per-pool**, or **10:1 stated as "500 plans onto hardware sized for 50"**, or **"sell 400% of capacity at low burst probability"** — three inconsistent figures quoting *different resources* under one word, which argues for A's per-axis structure even though B's headline is what the industry used.
- **Dunning recovery rate — *CONFLICTING*** — ⚔️ a small number with a large consequence, since dunning is proposed as the highest-ROI build and its ROI *is* this figure. **A**: 20–40% of gross churn is involuntary, payment failure **5–9%/month**, retries plus emails recover **30–50%** (card-updaters more) — pays for itself in one billing cycle. **B (opencode)**: agrees on the share but puts recovery at **~20–40%**, two-thirds of A's figure — still worth building, no longer an automatic first purchase, changing early-game build order.

---

# Core gameplay mechanics — summary

> Source: `master/08-core-gameplay-mechanics.md` · 328 idea entries · 350 KB

## 7.1 The board: flow, topology, and the two directions

- **The dependency graph IS the map** — no separate level layout vs tech stack; what you wire is the board traffic walks and threats attack. Logical graph sets *what can happen*, physical layout sets *what happens simultaneously* (shared PDU/rack/switch/template) (+4 var).
- **Two-directional flow (the core tension)** — visitors and threats share one pipe; every buildable both filters threats and costs visitor latency/patience. Visual separation without mechanical separation (+7 var).
- **The Funnel (depth is a resource)** — edge → transit → border → firewall → LB → service → data tier; deeper is more defensible and slower, depth purchasable/spendable in milliseconds.
- **The Return Path** — served visitors walk back out carrying money and satisfaction; satisfied ones may split into a referral unit; egress bandwidth costs and asymmetric routing matter.
- **The mixed lane** — legit and malicious traffic arrive in one unclassified stream; defenses classify rather than kill, every filter has a false-positive rate. Fantasy is triage, not slaughter.
- **Service lanes (isolation as a purchasable property)** — traffic grouped per service (web/mail/game/storage/mgmt), QoS and defense apply per lane; spill only via shared resources. Isolation becomes visible and purchasable.
- **Capacity as concurrency slots, not HP** — nodes have `S` slots, throughput `S/service_time`, queue at 100%, shed ~120%, fall over ~150% with a recovery duration. A slot frees only when the slowest dependency returns — so timeouts, not capacity, are the fix (+5 var).
- **The queueing hockey-stick** — latency rises gently to ~70–80% utilisation then goes vertical; a 75% tick mark printed on every Load Donut teaches headroom passively.
- **Backpressure and the red tide** — saturation propagates backwards (DB → pools → LB queues → edge) as a persistent full-width red wash, distinct from the cascade fuse's travelling point + char trail (+2 var).
- **Blast radius as a first-class concept** — hover any node to flood-highlight everything that dies with it, plus a count; flat unambiguous colour, hard boundary, amber for degraded, ignores walls/rows/racks (+3 var).
- **The Blast Radius of a Person** — same flood for staff: systems only they can touch, runbooks only they've exercised, relationships and credentials only they hold. Bus factor as a spatial problem.
- **Effective vs nominal redundancy** — board computes effective N+1 separately; five voiders (shared power, path, firmware version, human, time) across all four topologies. Struck-through `+1` badge names the shared domain; hollow stroke if failover untested.
- **Bottleneck highlight** — the limiting component pulses; fixing it moves the marker forever. Purchased capability arriving with distributed tracing, and occasionally wrong.
- **Topology matters: chokepoints vs meshes** — chokepoint is efficient, defensible, a SPOF; mesh is resilient, expensive, hard to reason about. Neither is correct; the level decides.
- **Multiple valid paths, and the routing rule that chooses between them** — round-robin, least-connections, latency-based, weighted, sticky, hash; each has a gotcha (least-connections feeds the broken-fast node; sticky kills carts).
- **Path preference and failover order** — you define primary/secondary/tertiary and the failover order; untested failover paths that don't work are the classic real outage. Drills exist for this.
- **Traffic steering (routing is still a choice, even without mazing)** — carriers/PoPs/regions are distinct ingress paths; a percentage-split control lets you pull load off a flooded carrier mid-attack.
- **Traffic Gravity (placement shapes the river)** — customers path dynamically along latency gradients toward the nearest healthy checkout, so adding capacity physically bends the flow field. Mazing texture without walls (+2 var).
- **Saturation cascade (emergent, not scripted)** — saturation → retries → more load → more saturation; whether it cascades depends on breakers, headroom and timeouts the player chose. Replayable in the post-mortem (+3 var).
- **The entrance and the goal** — traffic spawns at "the internet" edge and must reach a per-type goal node (page render, game join, completed backup, DNS answer, signed lease); swapping the goal reshapes a level without engine change (+3 var).
- **DNS is the first hop** — resolution happens before your board; TTLs are pre-committed hours ahead (one-way door) and DNS failure makes a healthy estate unreachable. In DNS levels the first hop is the whole map.
- **Out-of-band entry points (threats that don't use the front door)** — insiders spawn inside, supply-chain at a component you built, intruders at the loading dock, power failures down the separate electrical tree (+3 var).
- **Capacity as terrain** — utilisation drawn on the board not in a panel: nodes go amber then red, queues stack as waiting motes, visitors in red queues leave. The board is the capacity chart (+4 var).

## 7.2 Connections: the central interaction

*Source's own stated convergence: **drag a cable between typed ports**, with click-to-link as a permanent equal-status fallback, a schematic Wiring Mode for bulk work, and a late-game progression that replaces drawing cables with declaring relationships.*

- **Drag-a-cable (the recommended primary interaction)** — click a typed coloured port (data cyan, power copper, control white, trust teal-violet, storage, out-of-band), drag, release on a compatible port; valid targets highlight, invalid refuse with a bounce plus a Refusal Icon naming why. Live Latency Ladder delta during the drag; a Terms Card flips up on release showing bandwidth, monthly cost, latency added, SLA implication and new attack surface (Shift skips it). Catenary sag, magnetic snap, red recoil on refusal (+7 var).
- **Connection grammar: three input modes and nothing else** — everything resolves to BUILD (place), LINK (draw a dependency), TOGGLE (turn a dial). A closed grammar is what lets twenty hosting types ship with no new controls.
- **Click-to-link (the accessibility fallback, never second-class)** — click source, click destination; always available, keyboard/controller navigable, used by the tutorial, and must produce an identical cable object (+1 var).
- **Wiring Mode** — hold TAB/press W: world desaturates to ~30%, valid ports glow as sockets, optional flat schematic view; bulk rubber-band select, "connect all selected to X", doubles as diagram export and link-health heat map (+3 var).
- **The Port Row (shape-coded sockets)** — faceplates carry a row of type-coded socket shapes (RJ45 trapezoid, SFP slot, power kettle-plug, console circle), readable colourblind and at small size (+1 var).
- **Ports as a finite resource — with type and speed** — fixed port counts; running out forces a switch purchase (extra hop, latency, failure domain, power). Type and speed mismatch is visible: a 25G optic in a 10G port negotiates down silently, shown on the port LED (+2 var).
- **Link Objects Are First-Class (the connection is a game object, not a line)** — dropping a cable creates an object with bandwidth, latency, utilisation, encryption, auth, firewall rule, health state, and its own upgrades. You can click a wire and buy something; most real outages live on the connection.
- **Connection contracts (the link carries the policy) and the Policy Bead Set** — eight clickable beads threaded on the cable: padlock (TLS), valve (rate limit), fuse (breaker), hourglass (timeout), fan-out+number (pool), loop-arrow (retry), gate (firewall), filter cone (egress). Beads visibly trip; they collapse to one numbered bead at Z3. **Timeouts must monotonically decrease with depth** — a violation marker where they don't; this is what causes retry storms. Beads are what templates copy, and the bead audit is the recommended default security overlay.
- **Contracts are cables (one gesture for technical and commercial links)** — the same drag provisions a customer to a service, assigns a salesperson to a lead, an AM to a whale, a partner to a product, a transit provider into your edge router. Core verb: decide what depends on what and accept the terms (+3 var).
- **Contract-driven pathing (contracts as level geometry)** — contracts specify dedicated hardware, region residency, named carrier, encryption in transit, no subprocessors; these become routing constraints drawn as coloured locks, so your cheapest failover may be contractually illegal mid-incident.
- **Link health rendering (and the non-colour channels)** — idle thin/dim · flowing brightness+dash-speed ∝ throughput · congested amber with pulses bunching · failed grey, dashed and slack with break spark · draining chevrons away from node · encrypted braided texture · tripped breaker a gap with an arc glyph. Every state has a non-colour channel so the language survives greyscale (+2 var).
- **The Packet Bead Simulation** — traffic drawn as beads moving at throughput speed and spaced by packet rate; bunching is congestion, winking out is loss, one bead at a time is a half-open breaker. The main diagnostic instrument, not a chart.
- **Logical links are dashed; physical links are solid** — non-cable relationships ("this app uses that DB", "this pool contains these nodes") draw as dashed cyan arcs floating on the Signal layer; physical is solid and in-world.
- **Physical vs logical vs documented: three views that can disagree** — what *is*, what it *does*, what you *think*; gaps are where bugs live. A **Reconcile** action costs hands and updates belief to match truth, so "how stale is my map" is a tracked stat. Two Truths Toggle morphs between views; Compare mode draws both and separates disagreements into a hatched, counted lens-shaped **Mismatch Seam** (+1 var).
- **Two Boards, Two Scales (Rack View and Topology View)** — Rack View is physical U-space/power/heat/cables and is for feeling; Topology View is services/links/flows and is for thinking. Placement in one, wiring fastest in the other. ⚔️ visual lens wants one morphing world, designer lens wants two board modes.
- **Typed sockets: `needs` and `provides`** — services expose typed sockets (`http-in`, `db-out`, `cache-out`, `storage-out`, `log-out`; DB exposes `db-in`); you drag web's `db-out` to the DB's `db-in` and incompatible pairs refuse with a reason. One rule that enables validation, templates, declared intent and auto-link (+1 var).
- **Four topologies, one board — and how much of each you actually wire** — data (request path), power (tree, hard capacity), control (who administers what), trust (who authenticates to whom, lateral movement). Only data is drawn cable-by-cable; power is assigned via A-feed/B-feed menu, control is painted as admin domains, trust is derived plus a few grants — four graphs at one graph's interaction cost (+1 var).
- **Adjacency bonuses, not adjacency requirements** — proximity gives small tiebreaker bonuses, never gating: same rack −0.3ms (+shared power/cooling), same row −0.1ms, same room baseline, different room +0.2ms, different building +0.4ms plus cross-connect, different metro +2–8ms, different region +60–160ms (+4 var).
- **Adjacency auto-link (tutorial-only, then taken away)** — early levels auto-connect an adjacent DB with a handshake animation and auto-patch servers under a switch; later levels turn it off so the player feels the growth (+2 var).
- **Cable types and length costs** — copper (cheap, short, lossy), fibre (expensive, long, fast), billable cross-connect, wireless/microwave (weather-sensitive), satellite (huge latency); length costs money and milliseconds. Thickness = provisioned capacity, brightness/flow = utilisation, dashed = unsecured/uncontracted, padlock = DPA/BAA covered, midpoint tag shows monthly cost (+1 var).
- **Hop latency vs distance latency — *CONFLICTING*** — two models of where milliseconds come from. ⚔️ Position A (master): every hop is taxed in real ms, the drag quotes "+2ms" deltas, the adjacency table prices proximity, chain length is the optimisation target, and one Millisecond Budget currency pays for everything. Position B (opencode): "+2ms for a DAC" is ~1000× wrong — intra-DC copper is microseconds; a hop adds **burst sensitivity** (the queue in front of the port *is* the latency, bufferbloat), while **distance** moves real ms. Decides whether wiring discipline is a latency or a reliability optimisation, whether globe levels differ from rack levels, and whether the HFT "shorter cable for microseconds" joke lands.
- **Cable colour semantics — *CONFLICTING*** — three positions on what hue may encode. ⚔️ A (master): colour = class/role — orange LAN, blue storage, green public, purple management, red crossing a trust boundary, gold/white billable cross-connect, grey out-of-band; medium rides on thickness/brightness. B (opencode): colour = physical medium — power orange, copper cyan dashed, **fibre yellow with light-pulse** — because medium is what you look for at the rack. C (opencode): the §9 Colour Contract reserves yellow for money, so medium moves entirely to shape and texture (fibre twin strands, copper braided, power ribbed), freeing hue for role and the alert triad.
- **Bundling and the trunk** — parallel cables between the same pair auto-merge into one thicker trunk with a `×4` count badge, click to fan out; also needs a real bulk action linking N pairs at once (+1 var).
- **Auto-route vs hand-route, and the Ugly Auto-Route** — cables auto-route through the nearest tray orthogonally, SHIFT hand-routes via waypoints; an auto-connect button builds a working but suboptimal topology. Auto-routed cable is rendered *deliberately ugly* — unbundled, wrong lengths, wrong colours, the long way — and counts against the tidiness score.
- **Declared intent (the endgame of wiring)** — at high tiers the verb becomes a rule ("this tier connects to that tier") with cables generated and maintained for you; new tier members auto-wire. Failure mode: a bad declaration propagates instantly to fifty machines.
- **Firewall rules as gates on the cable** — drop a gate onto a connection and configure what passes; too permissive lets threats through, too strict bounces visitors into support tickets.
- **VLAN painting / segmentation** — paint nodes into segments that can't cross without an explicit gateway, shrinking lateral movement and blast radius at the cost of "why can't these two talk" debugging. Rule: VLAN uses hue on ports and cables only; blast/failure domains use floor boundary lines and hatching, never object hue (+3 var).
- **Dependency ghosting / the Dependency Reveal** — hover a node: upstream dependencies glow blue, downstream dependents orange, pulses travel each arc, hold to freeze. Answers "what breaks if I reboot this" in under a second (+3 var).
- **Dependency auto-discovery (fog over your own topology)** — in inherited/acquisition scenarios links stay hidden until you run INVESTIGATE on a node; you own a datacenter whose wiring you must discover.
- **Miswiring is allowed** — nothing blocks plugging both PSUs into one PDU; no modal warning, just a quiet single-fed mark in the power overlay and a breaker that trips one day. Hence overlays must be one keypress away.
- **The Patch Panel and the Patch Panel Widget** — route cables through a panel for less clutter and a tidiness bonus at the cost of a hop and a new SPOF; double-click opens a flat 24/48-port grid you wire with the keyboard, then collapses back to physical cables (+1 var).
- **Bus Mode** — draw one cable to a switch, rail or bus and everything attached inherits the connection; prevents spaghetti at scale and matches real provisioning.
- **Templates, snap groups, blueprints and the stamp** — save a wired cluster and stamp it pre-wired for a cost; the offered templates teach good architectures. Blueprints can be bad — a standardised flaw propagates and fixing it is a fleet-wide change with its own blast radius.
- **Auto-Cable (pay a tech to do it)** — hire a field tech who wires it imperfectly for money; the result is an Ugly Auto-Route with a human excuse, costing money and tidiness.
- **Disconnect is dangerous; drain is the verb** — yanking a live link drops in-flight requests; drain stops new traffic, lets existing finish, then disconnects. Drain animation: chevrons moving away, intake barrier bouncing new traffic, slot ring emptying, port stud solid→hollow with a green wrench. Yanking plays FX_SnapThread with motes winking out; a live pull needs a 1-second hold-to-confirm ring (+4 var).
- **Cable management score** — tidiness improves MTTR, airflow, wrong-unplug chance, morale and colo tour conversion; mess accumulates and needs a cleanup project. The score is visible as the render itself, and the Ugly Auto-Route is what makes it meaningful (+2 var).
- **The Mystery Cable and the toner probe** — inherited sites carry white "temporary" cables with unknown endpoints disappearing into a wall; trace with a beeping-wand toner-probe minigame, payoff is "goes nowhere" or "load-bearing and undocumented".
- **Collapse to meta-node (readability at wiring scale)** — select a group and collapse to a labelled meta-node ("Web Tier ×40") expandable on demand, trunks between meta-nodes carrying counts, plus a tidy auto-layout-by-tier button.
- **Cross-connect wiring as revenue** — in colo levels tenants request cross-connects, fulfilled by physical routing through the meet-me room, each becoming recurring revenue. The wiring minigame becomes the money minigame.

## 7.3 Placement and space

- **Nested grids (floor → row → rack → U)** — four continuous zoom levels, no mode switch, so you never lose the object; replaced by a world map for CDN/edge/game and a timeline for backup/archive.
- **Rack U Tetris — made strategic by conflicting constraints** — 42U racks, 1U/2U/4U devices, rails and blanking panels. ⚔️ pure packing is busywork at forty racks; resolution is five conflicting forces — U-space wants density, power and thermal want spread, latency wants proximity, blast radius wants separation — plus auto-pack with a penalty (+3 var).
- **Power budget per circuit** — per-rack amperage limit loaded to only 80% of rated; exceed it and the breaker takes everything on the circuit including the "redundant" partner next to it. Amp meter goes amber at the derate line (+2 var).
- **The placement loop (ghost, refusal icon, and live preview as one interaction)** — pick up a build → valid racks light eligible U slots, invalid racks show a Refusal Icon *on the rack* (bolt=power, thermometer=heat, ruler=U, padlock=zone, weight=floor, fan=airflow) → hovered rack's amp bar and thermal tint update live, ghost shows blue intake/red exhaust arrows → two-stage rail click (+1 var).
- **The Blast Radius Preview (hover-before-you-buy)** — the placement ghost also floods and counts the new blast radius, showing the delta in red if it worsens your worst case; converts a post-hoc grade into a pre-commit choice (+1 var).
- **The Fit Check (why the thing didn't go in the rack)** — validates depth, rail type, hole type (square vs threaded), weight, PDU clearance, cable-arm room, airflow direction; failing costs time fetching rails, not a refusal. A side-exhaust switch in a contained rack is allowed and silently degrades its neighbours.
- **Thermal map / hot aisle management** — devices emit heat, heat pools, hot spots throttle CPUs and shorten drive life; orientation, blanking panels and containment help. Critical for GPU/AI, HPC, dense VPS.
- **Airflow arrows and light airflow simulation** — faint intake/exhaust arrows, blocked paths render as turbulence, containment literally draws walls that channel flow; the overlay is how the player learns why containment exists.
- **Adjacency effects** — same rack shares power and failure domain, same row shares cooling, adjacent means shorter cable and lower latency. Redundant pairs want distance, performance pairs want proximity — two opposing pressures on one decision (+2 var).
- **Zones and blast domains** — explicitly defined power, cooling, network, security and compliance domains; spanning them costs money and latency, not spanning concentrates risk. Drawn as floor boundary lines and hatching, never object hue (+2 var).
- **Weight, floor loading and centre of gravity** — floor tiles have weight limits that warn when exceeded; top-heavy racks visibly lean with a warning glyph and tip in a seismic event. Matters for dense storage, colo tenant gear, upper floors.
- **The Floor Tile Grid, the Row Stamp and the Rack Template** — racks place on floor tiles with front/rear aisle and door-swing clearance rules (violations hatch red); draw a rectangle to stamp a whole correctly-oriented row, or stamp copies of one perfected rack that build in staggered sequence (+2 var).
- **Blueprint / Queue-Build Mode** — ghost-place objects *and cables* with funding triggers ("build when cash > $40k", "after this wave", "when the order arrives"); crews visibly execute the cascade when a trigger fires, and blueprints persist between levels.
- **Latency geometry (when the board is a map)** — in multi-region levels physical distance on the globe *is* latency and PoP-to-population proximity is the whole optimisation; the nested grid is replaced by a globe.
- **Placement is a commercial decision too** — colo cabinets near the meet-me room are worth more, PoP placement sets which eyeball networks you serve cheaply, exchange colo regulates cable length, held wholesale space is unsold space. Stranded capacity is a spatial failure state.
- **Move cost, downtime and legacy placement debt** — moving a live device needs a window, hands, and risks not coming back up; some things effectively cannot move, giving inherited facilities decisions you didn't make and can't cheaply undo.
- **Undo ghost** — a brief window that restores position and refunds, shown as a ghost of the previous state, drawn as a backward-spinning tape reel with a VHS smear. Only mechanical/build actions are undoable; time is not.

## 7.4 Upgrades

- **Upgrade paths, not upgrade levels** — branching mutually-informative upgrades per object (a web server goes toward concurrency, speed, or hardening) instead of a Level 1→2→3 treadmill (+3 var).
- **Policy Cards in Tower Slots** — firewall/WAF/rate-limit config as physical cards slotted into N slots per tower (`default-deny`, `geo-block`, `JS-challenge`, `SYN-cookie`); conflicting cards glow red at the seam, new cards mint from survived attack fingerprints, loadouts are tradeable.
- **Upgrades as sidegrades: every capability has a cost somewhere else** — upgrades move the problem rather than delete it: more RAM → bigger blast radius, bigger drives → longer rebuilds, faster NICs → bottleneck moves to CPU, redundancy → split-brain, automation → catastrophes at machine speed.
- **Upgrades improve the ROC curve, not the damage number** — defensive upgrades raise true positives at the same false-positive rate; the card shows the curve moving, so every Classify build's upgrade axis is "narrow the overlap" and two defenses compare on one picture.
- **Scale up vs scale out** — up is cheaper per unit, faster, bigger blast radius; out costs more, needs a load balancer, shrinks blast radius. Neither correct; recurs at every tier (+2 var).
- **Tuning instead of levels** — worker count, pool size, cache TTL, timeouts, retries, keepalive, queue depth, shed threshold, each with a system-dependent optimum. ⚔️ depth overwhelms casuals but auto-mode deletes the game; four mitigations — max three sliders per object, tuning is a policy with marked per-object overrides against a snowflake budget, suggested ranges narrow as monitoring improves, config snapshots make experiments safe. Exposed in three tiers: Presets (Safe/Balanced/Aggressive) → Sliders unlocked per object by its monitoring layer ("you may not tune what you cannot measure") → Policy.
- **Config snapshot and restore (as a gameplay verb)** — named snapshots of configuration (not data): thresholds, policies, routes, weights, shed ladders, beads. Restoring is itself a change that settles, takes ~40 seconds, costs only time.
- **Tuning cost** — applying a config change consumes hands and may need a restart with brief capacity loss, which pushes changes into maintenance windows and gives the Change Budget teeth.
- **Soft caps and diminishing returns** — each upgrade line has a knee past which returns drop sharply, forcing diversification and preventing a degenerate single-strategy build.
- **Retrofit vs rebuild** — retrofit is cheap, fast, leaves debt; rebuild is expensive, slow, risky, clean. The technical-debt decision made explicit at every upgrade.
- **In-place vs replace (the downtime question)** — in-place is cheap with rollback risk, blue/green needs double capacity and is safe, rolling needs a balancer and takes longer. With N+1 rolling upgrades are zero-downtime, so redundancy buys uptime *and* maintainability.
- **Firmware and patch cadence** — firmware/patch levels drift and skipping visibly raises vulnerability probability; applying costs windows and hands, and occasionally the update itself causes the outage (+1 var).
- **Efficiency upgrades** — better PSUs, higher inlet-temperature tolerance, containment, newer CPUs-per-watt, denser drives; they reduce cost rather than add capability and shrink the power line.
- **Cross-building buffs** — a better switch improves every device on it, containment the whole row, a senior hire the whole team, a tidy cable run every future repair in that rack. Upgrades with a radius.
- **Physical module insertion (bolt-on upgrades are the upgrade UI)** — RAM, drives, NICs, GPUs and second PSUs slide in with a click and visibly change the front panel, so you read a machine's whole spec and upgrade history off its face with no stat sheet (+1 var).
- **The Plating Pass and tier rim-lights** — software upgrades render as a sweep of light leaving a different finish (satin hardened, matte patched) that accumulates; hardware tier is a rim-light colour bronze → silver → gold → white, legible at any zoom.
- **Upgrade regret and the parts bin** — removed components go to a parts bin to redeploy at a lower tier, sell used, or keep as spares; today's production CPU is next year's dev box.

## 7.5 Time, tempo, and player actions

- **Pause with orders** — pause, inspect, queue numbered actions, unpause and watch them execute; placing and wiring while paused is encouraged. Pause Frostpane (motion stops, −15% saturation, blueprint grid) plus a white dashed Intent layer.
- **Speed controls, with a catch** — 1×/2×/4×, and higher speed visibly removes information: log lines become a density bar at 2×, stat plates and anomaly pips vanish at 4×, Pulse Strip coarsens. Guard: a degradation indicator naming what's hidden plus configurable auto-drop to 1× on severity. ⚔️ stricter variant bans fast-forward entirely while any alert is active (+2 var).
- **Auto-pause on severity** — configurable stop on sev-1, any customer-visible impact, first alert, or first sighting of an unseen threat type; a setting, and choosing it states how you operate.
- **Time control: pause, OBSERVE, or real-time — *CONFLICTING*** — the most load-bearing unresolved rule; decides whether the game is judgement-under-pressure or planning, and collides with accessibility. ⚔️ **A (master)**: free pause-with-orders, tempo cost paid by the speed tax, auto-pause config and the Two-Action Rule. **B**: no full pause, live building with a time-scale slider; pause drains an SLA clock. **C**: OBSERVE — time slows, never stops. **D**: tiered — pause is plan-only with money frozen, slow-mo watch-and-fiddle, real-time full; threats still chew clocks while paused. **E**: pause free, *rewind* costs reputation; 5s consultation freeze per wave. **F**: instant pause to build/price/reroute, but waves don't respect it and waiting customers levy a reputation tax. **G**: full pause for money decisions, soft pause for incidents. **H**: build live, but incident-time actions carry a stress-scaled error chance. **I**: active pause, one command at a time ("the shell"). **J**: no pause — *Investigate* live instead; time is the resource. **K**: triage mode, spacebar slows and you pick three attention targets. **L**: Hotfix Mode 3-second freeze on detection, one triage beat. **M**: pause-to-think *is* the difficulty dial. **Unification 1 — Composure budget**: a regenerating pool of slow-mo seconds, full freeze costs SLA-seconds. **Unification 2 — accessibility doctrine**: OBSERVE canonical, boss dilation automatic, hard pause is an accessibility option not a difficulty mechanic; tax cheese, not thinking.
- **Hands as action slots** — each staff member is one concurrent action costing time, not mana. Hands per tier: T0–1 **1**, T2 **2**, T2.5–3 **3**, T4 **5** plus paid delayed remote hands, T5 **7** plus follow-the-sun, T6 fully delegated with 2 executive actions per business month. Simultaneous-incident peak is tuned to ≈1.5 × hands — that ratio *is* the difficulty. Rendered as a peg rail you watch empty.
- **The Dispatch Board (staff as a physical wall)** — drag staff name-magnets onto incident cards; a specialist solves 3× faster and concentrates bus-factor risk; unassigned cards go yellow → red → self-escalate. The verb that keeps the hands economy working past five hands and fifteen fires.
- **Actions cost time, not mana — split into duration and attendance** — duration and hand-occupancy are separate numbers: RAID rebuild 19h/0 hands, restore 4h/0.2 hands, cable trace 40min/1 hand, `ALTER TABLE` 40min/1 hand exclusive. Reference durations at 1× (1 sim-min/sec): restart 20s, config change 40s, failover 90s, disk swap 6min on-site / 45min remote hands, cable trace 3min, investigate 2min.
- **The pager and triage** — a severity-ranked alert stack you assign hands to; some self-resolve, some are five symptoms of one cause, some are noise. The skill is choosing what to ignore; auto-remediation unlocks are what let you sleep.
- **Severity classification as a player choice** — the player sets severity; over-classify and burn out the team, under-classify and respond too slowly. Drives paging, the SLA clock, the status page and auto-pause — four downstream consequences.
- **Incident Mode** — a declared incident changes the verb set to isolate / failover / roll back / shed / communicate / escalate, starts a timer, drops time to 0.25×, and flips the HUD to a red-chrome Triage Board with staff as assignable cards (+11 var).
- **Communicate is an action** — posting a status update costs the time you'd spend fixing and reduces reputation damage; silence damages reputation even if you fix it fast.
- **The Runbook Quick-Bar** — documented procedures appear as one-click icon buttons during an incident; an undocumented incident shows an empty bar. Writing things down rendered as a purchase.
- **Maintenance windows** — declared in advance (notice period sets the reputation cost), with a chosen duration and a slot count; SLA accrual suspends, customers are notified, risky changes get legal and cheaper. Two teeth: **overrun** and **the window you needed and didn't declare** (emergency change outside a window costs triple reputation). Crucially **customers set the windows, not you** — ten customers leave almost no legal time and finding the intersection is the puzzle (+5 var).
- **Do waves respect maintenance windows? — *CONFLICTING*** — does a window pause the risk roll or the world? ⚔️ **A (master)**: waves keep coming; a window suspends only SLA accrual and risk pricing, threats sometimes arrive *during* it deliberately. **B**: voluntary board freeze — customer spawns stop and threat waves pause, except stealth. **C**: a twice-per-level ability — time slows 50%, prices discounted, no attacks, but customers only trickle and the status page costs a little reputation. **D**: the window changes nothing about the world, only whether the consequence is billable — planned downtime forgiven, live chops risk SLA credits. Decides whether a window is a planning verb or a tempo verb, and whether the player can ever buy a quiet minute.
- **The Settling Window and Change Interference** — every change enters a 60–180s settling window; two overlapping windows multiply both failure probabilities by **1.6×**, and an incident during two settling changes cannot be attributed, so you forfeit the postmortem unlock. A "Changes In Flight" counter sits in the HUD.
- **The Change Budget** — each window has a slot count derived from QA build, standardisation score and team size; exceeding it applies the interference penalty, and a visible backlog accumulates between windows so a freeze ends with twenty-three changes landing at once.
- **The Change object (risk, window, rollback plan, freeze, commit-confirm)** — a Change carries a risk score (reduced by staging, canary, peer review, declared window, rollback plan, runbook), a window choice trading blast radius against 3am fatigue, an optional rollback plan whose absence is punished specifically, and a freeze state. **Commit-confirm**: network changes apply with a 10-minute auto-revert countdown you watch while verifying you still have access.
- **The Change Request Flow** — at Tier 3+: draft → impact preview → approval (self/peer/board per policy) → scheduled window → apply → verify → close; any stage is skippable, faster and riskier. The emergency-change path is fast and leaves a mark at the next audit (+1 var).
- **Plan / Apply (the build mode is a deploy)** — every nontrivial change runs plan → diff → apply, with a ghost-diff in the game's own nouns ("ADDS: 3306 exposed ×1, replication path ×1, backup obligation ×1; RISK +2; LATENCY TAX web-2 +2ms"). Apply is a logged commit point with a mid-wave confirmation cost, and plan reveals unknown dependencies on legacy levels.
- **The Verification Step** — separate, skippable, slow: reboot then verify (the service was never enabled at boot), fail over then verify (the target runs a stale config), restore then verify (the data isn't there). Skipping is free and its failures surface later, misattributed. Tracked as a verification-rate stat.
- **The Pre-Mortem** — spend a hand before a big change to predict how it will fail from a list; correct predictions grant a prepared mitigation (faster rollback, warmed standby, pre-written status update, a spare on the shelf). A mechanic that rewards pessimism.
- **Drills and rehearsals as a scored action type** — failover, restore, power/load-bank, tabletop, game day, black start; each costs a window and hands, yields a **Confidence** value that decays, and has a chance of finding a real problem. The Recovery Rehearsal reveals the one step that doesn't work and makes the real event measurably faster.
- **Change freeze** — freeze changes before a known high-traffic event: nothing breaks and nothing improves, so both extremes are wrong. The **Change Freeze Bank** piles up blocked changes that all deploy at once afterward, so the cost is deferred not avoided (+1 var).
- **Drain before reboot** — time pressure's favourite casualty and the most satisfying operational verb in the game (see §7.2).
- **The Big Red Button — with a scope selector** — emergency null-route that always works and always costs you the customer. Scope selector: one IP · one customer · one prefix · one traffic class · one region · everything, with an affected-customer count updating live as you widen. Mushroom head under a hinged cover; the cover stays open and lit until reset.
- **Degraded-mode toggles and the Degraded-Mode Console** — read-only mode, static fallback page, disable search, disable uploads, serve stale cache, shed non-paying traffic first; pre-configured in peacetime on a physical five-switch panel with threshold dials, thrown in sequence during crisis while features grey out in the Site Preview.
- **Active abilities with cooldowns (the "spell" layer)** — Emergency Cache Freeze, Null-route a prefix, Divert to scrubbing, Failover region, Under-Attack Mode (visitors halve, threats drop 90%), Call the upstream NOC (a wait you don't control), Blast Door; each with a stated collateral cost (+1 var).
- **Autoscaling as a summoned resource** — four compatible framings: cash-per-second spin-up with a boot delay (minutes on-prem vs seconds in cloud = era progression, and the DB won't replicate in time), a pre-cast scale policy, elastic surge pools billed per second (a compromised API gateway summons them for the attacker's miners), and a pre-authorised credit contract with two-wave lag plus debt interest.
- **Ship-It-Friday** — deploy an improvement immediately for a bonus with a much higher failure chance and no rollback plan. Named for the sin it represents.
- **The Bad Deploy (the enemy you bring)** — a deploy is a wave you stage yourself with canary (5% first), blue/green, and rollback options; failure spawns rollback wraiths, an error-rate climb and a downtime meter. Underneath sits the **Single-Writer Rule**: two automation systems on one config oscillate and flap, countered by state locking and a declared IaC-dominance doctrine.
- **Undo window / rollback** — revert cleanly within N seconds/minutes; after that the change is entangled with new state and rollback becomes its own project.
- **Capacity ordering with lead times** — quote → approval → order → manufacture → ship → customs → receive → burn-in → rack → cable → provision, each with a duration and possible hiccup, tracked on an order board; expediting costs money at any stage. You must buy against a forecast because you cannot buy against a fact.
- **The Inbox: decisions as cards** — between waves, cards (customer request, vendor quote, hire, press inquiry, compliance deadline, abuse complaint) with 2–3 costed choices and delayed effects. Four rules: every card states *when* the consequence lands; deadlines expire to the status quo, never the worst option; at most 3 open and ~8 per level; each card icons the resource it costs, and at least one per level has no downside. Rendered as a fanned physical deck with per-source paper stocks.
- **The Lag Table (formerly "the 90-day lag")** — business decisions pay off later and the *variance* is the strategy: ad spend instant both ways · price change immediate on new, 12 months on installed base · support cuts 60–120 days · content/SEO 6–12 months to arrive, 3–6 to decay · sales hire 4–6 months to productivity and their pipeline leaves with them · certification 6–18 months then a step change · reputation damage instant, repair 6–18 months · technical debt 1–3 years then all at once. Supported by an Attribution Ledger, a forecast band, and `stated ± 15%` variance with direction certain.
- **The month as the tick** — infrastructure runs in seconds, business in months; a month-end sequence (billing, invoices, payroll, P&L, board meeting) punctuates play. Two layered time scales, formalised by §7.13's two-clock rule.
- **Autopilot and delegation policies** — hand routine categories to staff with a policy ("restart on OOM, page me if it recurs"; "approve refunds under $50"); they handle 90% correctly. Commercial dials are richer: discount ceiling, credit-limit threshold, refund authority, non-payment suspension, abuse-desk aggressiveness, escalation rules, non-standard contract terms.
- **Executive attention as a tiny pool, and the CEO Override** — at high tiers you get very few personal actions per month and **CEO Override** spends them to force a full-effectiveness outcome, costing the rest of the month *and* degrading the organisation (the team didn't learn, the runbook wasn't written, a precedent is set). ⚔️ hands vs executive attention would double-tax; resolutions are sequential handover at Tier 5, or one resource in two denominations where executive attention is simply *your* hand.
- **Chair switching with a cost** — you occupy one chair (Ops, Sales or Finance) with a switching cooldown; everything unwatched runs on your delegation policies. The mid-game skill is picking the chair, and it's rarely the one you enjoy.
- **Night shift / the on-call clock / the 2am multiplier** — 3AM incidents get slower response, fewer hands and a higher error rate per action; staffing nights costs money, not staffing costs MTTR. The **Two-Person Rule** gates dangerous actions on two simultaneously-available staff, sometimes making "wait until morning" correct (+6 var).
- **Patch lag** — days behind on patching per fleet, rising automatically, driving vulnerability probability; lowering it costs windows and hands. A number that quietly gets worse while you're busy.
- **Toil accumulation** — repeated manual tasks accumulate as a visible recurring staff-hour drain until automated; you watch the same three actions eat a hand every cycle. Feeds the Toil Debt meter (+2 var).
- **Slow-mo incident cam** — a cascade briefly slows time and pushes the camera onto the **first domino**, at most once per incident and never on a cascade already watched. The camera arcs over ~0.6s with a white line connecting HUD alert to world object.

## 7.6 Information, fog, and diagnosis

- **Ground Truth vs Observed Truth (the engine rule beneath this whole section)** — the sim keeps two parallel states per object: what is true and what your instrumentation reports. Observation has latency (graphs 30–60s behind, tickets minutes more), coverage (uninstrumented objects report *nothing*, not zero), and can be wrong (a check on the wrong thing reports healthy forever). The player may only act on observed truth.
- **Fog of infrastructure** — uninstrumented components render fogged with "?" stats; monitoring buys sight. Fog is **per-property**, not per-object ("I can see three of the four numbers"), and known unknowns stay visible — fog covers state, never existence — with a permanent HUD Coverage percentage (+5 var).
- **Bounded Fog (the fairness contract)** — three hard rules: ground truth is never hidden (Site Preview and Pulse Strip always tell the truth); the cause is always findable with tools you could have bought, and the postmortem names which purchase would have helped; **fog costs time, never certainty** — hand diagnosis works, it just takes 4–8× as long. Monitoring buys speed, not possibility.
- **Telemetry Resolution** — every graph has a sampling interval and the interval determines what is true: microbursts are sub-second, latency outliers per-request, thermal transients seconds, the 95th-percentile bill 5 minutes, growth days. Observability upgrades grant *classes of phenomena*, and you trade retention against resolution (a year at 5 minutes or a week at one second, not both).
- **Symptom vs cause** — "website slow" could be the DB, the disk under it, the network to the disk, a noisy neighbour, a DNS timeout or a bad deploy; each investigation action costs time and narrows the possibility space (+1 var).
- **The two diagnostic modes: "What changed?" vs "What grew?"** — the player picks a line of inquiry; change-driven uses the Change Correlation overlay, growth-driven the Growth Ceiling overlay. Picking wrong costs time; the tell is the onset shape — a step function means change, a curve reaching a knee means growth.
- **Confidence as a diagnostic resource** — a tracked hypothesis-confidence number from evidence gathered and tools owned; acting at 40% is fast and often wrong and can make things worse, gathering evidence costs time. Turns "wait or act" into a real decision.
- **Red herrings** — several things look wrong, one is the cause; chasing wrong costs hands and time. ⚔️ unfairness fixed by five rules: at most one per incident, resolvable in under 30s with an owned tool, plausible, cheap to check, always named in the postmortem — and at least one "herring" per incident should be a genuine smaller second problem worth fixing later.
- **Alert fatigue as a mechanic** — an alert-volume stat above which staff miss real alerts, with miss probability a function of noise; countered by tuning, deduplication and dependency-aware suppression. Alert routing (what pages at 3am vs waits for morning) is the dial (+3 var).
- **MTTD and MTTR as separate stats** — monitoring lowers detection time, runbooks/automation/spares lower repair time; most players overinvest in repair and underinvest in detection, and the postmortem should say so.
- **The "everything is green" trap — and its two siblings** — green-but-broken (200 over an error page, a replica 40 minutes behind; synthetic monitoring is the counter), red-but-fine (a monitoring/network fault; verify from a second vantage point before "fixing" forty healthy machines), and green-but-not-production (pointed at staging, an old IP, or an endpoint stubbed to 200 in 2022).
- **The dashboard as a weapon** — each monitoring build adds a specific visible graph and graphs are how you win. Rendered as the **NOC Wall**: a diegetic wall of monitors in your office; clicking one jumps the camera, so the minimap is furniture you built.
- **The Traffic Inspector (freeze-the-frame zoom)** — right-click a point in the river to slow to a crawl and label the units in flight: packet cards with protocol glyphs, "customer (retry ×3)!" badges, a mimic's torn disguise. It costs click budget so it never becomes wallpaper, and evidence pins go into the post-mortem.
- **The status page and its false economy** — a real-state-driven green/amber/red page customers bounce off even when the service works, detractors quote and attackers probe. You're simultaneously incentivised toward honesty (reputation, forgiveness) and optimism (traffic); degrade notices buy patience you can't buy otherwise.
- **The overlay wheel, specified** — hold Tab for ten wedges with opposites opposite (Traffic ↔ Cost, Thermal ↔ Power, Security ↔ Capacity); only one active at a time, announced by a 2px viewport border tint, a name chip and a legend card showing the scale. Lenses: Traffic, Latency, Power, Thermal, Security Surface, Cost-per-U, Capacity Headroom, Maintenance Debt, Blast Radius, Redundancy, Compliance, Age; two can be pinned at 50% each (+5 var).
- **The overlay palette table** — exclusive palettes so two overlays are never confused: Traffic cyan mono · Latency cyan→magenta divergent · Power copper mono · Thermal iron (black→red→white) · Security Surface pure luminance on black · Cost green mono · Capacity green→amber→red · Maintenance Debt sepia/grime · Blast Radius a single flood fill with no ramp · Redundancy two-tone paired/unpaired. None reuse the alert triad.
- **Security-surface overlay as literal brightness** — the world darkens and each component glows in proportion to its attack surface, so your shiny new feature is the brightest thing on the board; doubles as the attractiveness field. Guard: luminance overlays suspend colour alerts and substitute shape pips.
- **Capacity headroom overlay** — every component tinted by utilisation against the hockey-stick threshold, everything above 80% glowing amber; one glance answers "what will break first".
- **Maintenance debt overlay, split into three wear channels** — grime tinting split into **dust** (maintenance/patch debt), **heat stain** (thermal debt) and **hand wear** (change/config debt), so the overlay says which action to take rather than only that something is wrong.
- **The log panel** — real-ish log lines from the actual simulation, filterable and scrubbable back in time; anomalies appear before the alert fires. The **Anomaly Tick** is a 1px violet left-edge tick — subtle enough that noticing it feels like a skill.
- **The in-game terminal** — real commands returning game-accurate simulation state, everything also available in the GUI. ⚔️ large content for an optional feature; mitigation is 5–8 beautiful commands not forty shallow ones: `top`, `df -h`/`df -i`, `ss -s`/`netstat` (SYN flood, conntrack, TIME_WAIT), `dig +trace`, `mtr`/`traceroute` (intermediate-hop loss is a lie, only the final hop counts), plus `dmesg | tail`, `iostat -x`, `tail -f`. Renders as a floating CRT with barrel curvature and scanlines (+5 var).
- **The "Is It Actually Down?" check** — verify from outside before panicking; costs seconds and sometimes reveals the problem is the customer's DNS, ISP or office wifi, and you were about to reboot production.
- **The Change Log (documentation as a mechanic)** — every action timestamped and reviewable after an incident; players who *label* their changes diagnose faster, because "raised pool size on web tier" beats ten lines of "config change". Labelling costs a moment and pays at 3am.
- **The Decision Highlight (making the board's *choices* legible)** — at most three objects at a time carry a white corner bracket plus a "Now" list entry, marked as decisions when two options are viable, the window is closing, and you can afford to act. Tells you where the fork is, never which branch.
- **The Board Diff (what changed since you last looked)** — renders the board as a diff against a snapshot (N minutes ago, your last camera bookmark, or pre-incident): additions glow green, removals ghost red, changed values show deltas. Essential for multi-line, multi-site and time-skip play.
- **The Timeline Scrubber (drag history over the live map)** — drag monitoring history backwards over the live map so configs, flows, port LEDs and alert states ghost in as they were; diff "02:14 vs 02:15". Costs a staff-hour, late unlock adds anomaly-jump, and it replays **observed** truth — an uninstrumented window scrubs back blank. It looks but never restores.
- **Live-Path Preview and the Customer Trace Inspector** — before building, send a dummy customer down the prospective route with latency speed-bumps as physical humps; after, click a live customer for a per-hop latency waterfall (DNS, TCP, TLS, TTFB). Inspectors add monitoring load and tickets auto-attach their evidence.
- **The Watchlist (pin what you're worried about)** — pin any object, link, customer or metric to a rail with a live sparkline, exempt from LOD collapse and label culling; the postmortem scores whether the thing that broke was pinned ("you were watching it, you just couldn't get to it").
- **The Attention Heatmap (a post-level self-portrait)** — records camera position and selection and renders it as a heat map against where the damage actually was; the cheapest possible "you were looking at the wrong thing" lesson.

## 7.7 Failure, recovery, and consequence

- **Degradation, not destruction (the anti-tower-defense principle)** — the failure vocabulary is saturation → brownout → partial failure → cascade, never damage; failure is a state with a duration and almost everything comes back. Most play happens in the middle states.
- **Graceful degradation, pre-configured — and the Degradation Ladder editor** — define the ladder in advance (70% disable recommendations, 85% serve stale cache, 90% shed class 4, 95% static page only) and the system walks it automatically. Editor is a vertical strip of load thresholds with drop zones, each rung previewing the customer-visible consequence live in the Site Preview; during an incident a marker rises up the strip (+2 var).
- **Load shedding (and why it requires peacetime work)** — dropping the least valuable traffic requires classifying it in advance; a system that can't tell a whale from a scraper can only shed at random, which is the same as failing (+3 var).
- **Granularity of sacrifice (the triage ladder)** — ordered cheapest to most brutal: disable an expensive feature → stale cache → shed anonymous → shed an endpoint → rate-limit a tenant → rate-limit their worst endpoint → null-route one IP → null-route their allocation → suspend them. Each rung reversible with its own revenue/reputation/contract cost; the skill is the lowest rung that works.
- **Circuit breakers** — a threshold on a link (the fuse bead) that opens when downstream fails, failing fast so the retry storm never forms; sheds that feature and saves everything else. Half-open lets one bead through at a time to test the water.
- **Cascades with a visible fuse** — the cascade travels as a bright node with a char trail at a fixed **1.5 seconds per hop regardless of simulation speed** (drama, not simulation — at 4× it would otherwise be an instant loss screen), so you can cut ahead of it; a breaker in its path pops and kills it with a puff (+3 var).
- **Brownouts over blackouts** — most failures degrade rather than stop, making "is this bad enough to act on?" the question; the player can also brown out deliberately, turning degradation into an active ability.
- **Partial failure states (enumerated and rendered)** — six, each with a look: **read-only** (hollow write port, padlock on inbound), **stale** (poisoned tint, clock watermark), **degraded** (warm shift, slower idle animation), **flapping** (LEDs desynchronised from the global heartbeat), **split** (hairline vertical seam, two tints), **silent-wrong** (looks perfect; only a Face/Truth discrepancy tells).
- **Gray failure (the component that is 40% working)** — dropping 1% of packets, one slow request in twenty, one corrupt write in ten thousand; passes every health check, poisons everything downstream, and needs deliberate investment (tracing, synthetic checks, resolution) to detect.
- **Failure states worth explicitly modelling** — split-brain (two crowns), deadlock/lock contention, queue collapse, **metastable failure** (stays broken after the trigger is removed because retry load sustains it; escaping requires shedding), correlated failure, silent data corruption, configuration drift, capacity cliff.
- **The Second Failure Window** — during any degraded state (RAID rebuilding, one of two LBs alive, generator running) an explicit "you cannot survive another failure right now" bar runs; a timer you desperately want to expire, making redundancy's absence felt continuously.
- **The Failover Handoff** — active/passive failover draws as a crown physically moving along an arc. **Two crowns = split brain. One crown = correct. Zero crowns = nobody is serving and everyone thinks someone else is.**
- **Recovery is gameplay (and recovery order matters)** — restart in dependency order (power → network → storage → database → cache → app → LB → traffic); wrong order gives thundering herds, cold caches, auth storms, inrush trips. A dependency-ordered list with lock icons that warn but never block; a written runbook auto-sorts it. Rendered as the **Recovery Ladder** with rungs lighting upward, or thunking back to dark if out of order.
- **The cold-start dependency cycle** — DNS needs storage, storage authenticates to LDAP, LDAP needs DNS; fine forever until all three are off at once. The counter is an ugly, unfashionable, drift-prone static bootstrap path, plus a purchasable cycle-highlighting analysis view.
- **Restore service or restore redundancy? (the recovery decision nobody states)** — rebuild the array and re-arm failover before readmitting traffic (safer, slower, customers still down) versus serving on a fragile single copy while the rebuild runs (faster, and a second failure is fatal). The game never says which is correct.
- **The cold-cache thundering herd** — restoring service sends all the waiting traffic at an empty cache; countered by slow-start, gradual admission and cache warming. Its electrical twin is inrush, which trips the breaker you just restored.
- **Degradation Debt** — every hour degraded accrues deferred writes, growing queues, unreplicated data and unsent mail; restoring means paying the debt down, and a long degradation's catch-up is itself an overload event. The missing explanation for the second outage.
- **The Blast Door** — deliberately sever a segment of your own estate to stop ransomware, a worm, a compromised tenant or a retry storm; takes those customers offline immediately and definitely, and it works. Trades certain small damage for uncertain large damage (+1 var).
- **Data loss is permanent** — exactly one irreversible damage type so there is something to fear; downtime is recoverable, lost data is not, which is what gives backups, restore tests and durability dials real weight.
- **The Corruption Horizon** — the question is "restore to *when*": every hour you go back destroys an hour of legitimate data, and finding the corruption onset requires investigation. Losing a day of orders to remove four bad rows is a choice.
- **Partial restore and prioritised recovery** — restore bandwidth is finite so you order which customers, systems and data ranges come back; prioritising your whale is rational and visible, and the ones restored last will know they were last.
- **The Failback Problem** — after failing over, failing back is a separate riskier operation: data has diverged, the secondary is authoritative, the primary is cold. Many organisations live at the secondary forever, and choosing to stay is a legitimate outcome that changes your cost base and latency map.
- **Multi-region failover and the Quorum Game** — capacity-limited backbone links; draining to region B carries cooldown, cost and a replication-lag consistency penalty resolving into split-brain repair. Consensus is a **handshake ring** of three or five nodes pulsing per commit round, with an election animation (longest log wins) and a per-datastore **CAP dial**: CP bounces during partitions, AP creates split-brain repair events later.
- **The Reboot Roulette (state you didn't know you had)** — a hidden per-machine **Boot Confidence** stat falls with every live change you never persisted (hand-started service, unsaved firewall rule, missing `fstab` entry, manual `ip addr`, a 2019 `sysctl`); rebooting low-confidence machines risks them not coming back, discoverable only by a persistence audit or a deliberate window reboot.
- **Reboot, reimage, rebuild (the three tiers of surgery)** — each rung clears a different persistence class: **reboot** clears memory-resident only (miners return, firmware doesn't care), **reimage** clears disk persistence at the cost of config loss without a CMDB, **rebuild plus credential rotation** is the only rung that ends a credentialed intruder and touches every system that trusted this one.
- **The rollback, one-way doors, and the third category** — reversible (undo window), irreversible one-way doors (schema migrations, deletions, cert revocations, a DNS TTL set hours ago), and **delayed-irreversible**: reversible now, irreversible later (TTL until propagation, a deleted snapshot until blocks reclaim, a migrated DB until the first write lands), shown as a shrinking reversibility window. Amber ratchet glyph; irreversible actions confirm with a drag-slider, and the heaviest need a **Two-Key Action** — typing the object's name or a second staffer's approval (+1 var).
- **Time rewind: world restore, or configuration-only undo? — *CONFLICTING*** — does undo cover only what you built and configured, or the world itself? ⚔️ **A (master)**: three narrow tools — config snapshot/restore (~40s, costs only time), the placement undo ghost, and the rollback triad — under the law that only mechanical/build actions are undoable, **time is not**, and **data loss is permanent**; rebuilding is a playable state, not a game over. **B (opencode)**: snapshots are a capacity-costed strategic resource and catastrophe rewinds the whole map to one, losing everything since but keeping the company — ransomware then asks "how far back can you afford to lose?" Generalised as **Undo with a Price Tag**: every destructive action undoable for a visible delta with a ghost preview naming who churns; rendered as a two-reel tape deck and a film-strip scrubber, and **the enemy can rewind too**. Decides whether data loss is really permanent and whether catastrophe is played out of or reloaded past.
- **Salvage and the rebuild** — pull drives, recover partial data, reuse chassis, re-sign the customers who'll return; rebuilding is a playable state and rebuilding *better* is the emotional payoff of the whole failure system.
- **The Post-Mortem (screen, sheet, and progression hook)** — timeline replay, contributing factors, the named red herring, the Attention Heatmap, one Insight point and a choice of which lesson to formalise (runbook, policy rule, monitoring unlock, prevention discount). A self-filling paper form costing staff time. If two changes were settling, attribution fails and you get no unlock (+5 var).
- **Action-Item Re-Arm (the postmortem that bites)** — surviving an incident drops a fix-list obligation; completed items permanently degrade that incident class's recurrence, ignored ones age and **re-arm the incident one severity tier higher with the same signature**. The backlog becomes a standing threat you chose not to defuse.
- **Root cause vs band-aid** — the band-aid resolves it now, cheap, and adds debt; the root fix costs hands you don't have and prevents recurrence. Correct answer is band-aid now, root fix scheduled — and the game tracks whether you did the second part.
- **The technical debt meters (four, not one)** — named, itemised, separately priced: **config debt** (per manual intervention; paid by a config-management run; interest is incident probability), **knowledge debt** (per undocumented change and departing staffer; paid by writing; interest is MTTR), **toil debt** (grows with fleet; paid by automation; interest is hands per month), **structural debt** (grows with scale; paid only by migration; interest caps what you can build next). Headline numbers: toil hours per week and a Rebuildability index. A fifth in a different colour is **commercial debt** — non-standard terms, grandfathered prices, one-off SLAs, undiscoverable reseller agreements — invisible until diligence, paid in your attention (+6 var).
- **The Blame vs Blameless choice** — values with mechanical consequences (see §5.4).
- **The death spiral and its three exits** — outage → churn → less revenue → less investment → more outages; the game detects and marks it, then the Inbox presents exactly three cards — **Shed** (sell or close a line), **Fund** (financing at bad terms), **Fix** (a root-cause project with a stated duration you must survive). All three genuinely survivable; taking none is possible and fatal.
- **The loss conditions, enumerated** — four slow, visible doors: cash = 0, reputation = 0, one permanent customer-data loss, seizure meter maxed; plus total compromise and domino churn on longer boards. A meltdown meter fills per second of unserved core (checkout / game-join / restore-RTO per type, and in backup levels the core moves), mirrored by the staged de-lighting building. Four visible stages Healthy → Degraded → Brownout → Outage. Governing rule: **failure must always be attributable to a visible decision.** Win condition: survive N waves above the uptime floor with net-positive cash.
- **The grace timer / the landlord at the door** — unpaid colo bill, payroll or transit invoice gives a grace period with a visible countdown and a named person asking about it. A deadline with a face beats ten progress bars.
- **The repair loop: the Walk and the minigames** — all repairs need a staff sprite to physically reach the object, so layout, spares placement and out-of-band management are felt rather than calculated. Optional short minigames (reseat an optic, crimp a cable, swap a drive), all skippable with auto-resolve at a time penalty.

## 7.8 Per-type mechanical shifts

- **The Three-to-Five Change Rule (the variety budget, stated)** — a hosting type must change 3–5 items in this section and no more; two is a reskin, eight is a different game. The core verbs never change — `PLACE · LINK · TUNE · SCALE · SHIELD · INVESTIGATE · MAINTAIN · SELL` — only which is scarce and which is decisive.
- **The scarce-resource meter swaps** — the main HUD meter per type: shared = oversell contention, VPS = overcommit ratio, GPU = kW and thermal headroom, backup = durability and restore-test freshness, CDN = cache hit ratio, email = IP reputation, colo = occupancy and stranded capacity, game = tick stability, DNS = p99 query latency, VoIP = concurrent channels and MOS, object storage = durability nines, bulletproof = upstream patience.
- **The commercial slider swaps (the fourth axis)** — one signature economic dial per line: shared = oversell ratio, VPS = overcommit, colo = power billing model (committed/metered/flat), GPU = reserved-vs-spot mix, backup = restore-SLA tier pricing, CDN = commit level and overage rate, email = outbound rate limits, game = monthly vs hourly, VoIP = rate-deck margin per destination, regulated = attestation scope.
- **Per-type sliders (the operational signature dial)** — tick budget (game), deliverability aggressiveness (email), durability level (backup), residency fence (regulated), escort policy (colo), abuse-triage sort order (bulletproof), cache TTL (CDN), oversell ratio (shared), inspection depth default (everywhere).
- **Time granularity changes** — game servers run in milliseconds, ad-tech and financial colo in microseconds, web in seconds, backup in hours (the window), colo in years (the lease); the tempo of thought changes, and incident-time scale is permanently on for millisecond types (+1 var).
- **What "pathing" means changes** — web = requests along a path, backup = jobs through a window (Gantt), colo = a tenant walking your floor then leasing then their gear arriving, CDN = content propagating outward, email = messages through reputation gates, HPC = jobs through a scheduler queue, satellite = passes through a sky window, tape = media through a robot and a courier, DNS = a resolution walking a delegation chain.
- **Control granularity as a difficulty axis — across four independent scales** — hardware, software, network and data are controlled separately: managed = all four, dedicated = hardware+network, colo = network+power only, reseller = none but owns the relationship, cloud tenant = software+data, wholesale = the building. Rendered as a four-pip badge. Rule: **every unit of agency removed must be replaced with two units of visibility.**
- **Scale changes the verbs (and zoom is a strategic act)** — you click processes at server scale, servers at rack scale, tiers at datacenter scale, policies at multi-datacenter scale; zoom runs sprites → racks → tier blocks → globe. **The Three-Verb Law**: verbs stay Build / Filter / Triage forever and every scale unlock automates a verb, never adds one; late game adds the **Director Bot** as a visible fourth hand. "Details lie when you're not looking" becomes a threat family (falsified-green monitor, log-drop gap) countered by a periodic verify-your-telemetry action.
- **The Tech Stack Editor (pre-level loadout)** — pick nginx vs apache, MySQL vs Postgres, Linux vs Windows and later the container layer before a level; each carries a strengths-and-warts table defining which threats hit hardest and which defenses come cheap. A roguelike loadout screen that costs the engine nothing.
- **Keyhole mode** — the colo/managed extreme: you see only tenant-reported symptoms plus your own facility telemetry, and your verbs become ask, advise, escort, escalate and prove it isn't us.
- **The Window mechanic (backup, maintenance, satellite)** — a finite Gantt-like time box jobs must complete inside; overruns collide with the business day and the optimisation is packing, prioritisation and parallelism.
- **The Queue mechanic (HPC, render, transcode, GPU)** — allocate finite nodes to queued jobs with different deadlines, sizes and customers; starving a small customer to serve a whale is a visible choice. §7.11's QoS ladder in another hat.
- **The Geography mechanic (CDN, game, edge, DNS anycast)** — PoPs are towers on a globe, each covering a region with a latency radius; the board stops being a rack and becomes a map.
- **The Floor Plan mechanic (colo, wholesale)** — sell space as shapes (cabinets, cages, suites), fitting tenants efficiently while preserving contiguous space for a future big tenant. Stranded capacity is the spatial failure state.
- **The Durability mechanic (backup, archive, object storage)** — a durability dial (copies, locations, media, verification frequency) against a cost curve, attacked by bit-rot, media failure and correlated loss. The only type where the threat is entropy on a decade timescale; the Restore Test is the only proof.
- **The Reputation mechanic (email, bulletproof)** — a single stat gating whether the product works at all, earned slowly and destroyed by one bad customer, which makes customer *selection* the main defensive verb.
- **Concurrency slots (VoIP, game servers)** — you sell N concurrent channels/players and exceeding is an instant hard failure, not a slowdown; binary capacity instead of a curve, the one place the hockey stick doesn't apply.
- **Unmanaged tenant objects** — colo tenant racks you can see telemetry on and cannot touch; they draw your power, make your heat, block your airflow and can cause your outage.
- **Remote-site delay** — a hands action at a remote facility costs travel time or a remote-hands fee to someone else's technician who does exactly what you say and nothing more. Delegation with latency.
- **Era-locked tech** — the tech tree is period-gated: no CDN in a dial-up level, no containers in 2005, and in 1998 your DDoS mitigation is a phone call.
- **Multi-line tabs and the portfolio altitude** — each line is a tab/district with its own board under a portfolio view showing shared resources, staff, facility and cross-line effects; attention is the cross-line currency and the Board Diff is how you learn what happened elsewhere.
- **Time-axis connections (backup, archive)** — backups connect a system to a *point in time*; restore points are nodes on a timeline rather than the floor and a restore is a cable drawn backwards through it.
- **Contract drag (colo, wholesale, enterprise)** — long leases make mistakes and wins both persist, slowing the whole game and weighting each decision. The mechanical opposite of hourly billing.
- **The ticket-driven verb (colo cross-connects, remote hands, managed)** — a tenant files a ticket, you schedule it, a technician executes it, it becomes revenue; work arrives as requests rather than initiative, and the Ticket Queue is the main board.
- **Per-type QoS answers** — game hosts prioritise in-session players over joiners, email transactional over bulk, backup **restores over backups** (almost nobody configures it that way), CDN cache fills over purges, and colo prioritises nothing because you don't control the packets — which is itself the lesson.

## 7.9 Meta-loops and rhythm

- **Calm / storm rhythm** — peacetime is for building, tuning, documenting, drilling, debt payment, pre-mortems, policy authoring and forecasting; storms execute what you prepared. Target **60/40 peacetime to incident by wall clock**, peacetime blocks of **60–120 seconds**; blocks under ~45s make actions unfinishable (+1 var).
- **The weather forecast / threat radar** — an incoming-threat indicator gaining specificity as it approaches ("something big" → "volumetric" → the signature); preview quality is itself a monitoring purchase, and each event carries a visible name ("Wave 7: Evening Peak + Firmware Recall") (+5 var).
- **Bosses are black swans** — one scripted event per level with a three-stage telegraph (news-ticker rumour → one-wave warning → impact); vocabulary is correlated catastrophe — DDoS-plus-ransomware, the Seizure raid, the Cascade, the Viral Moment (100× customers, 20× attackers). Each boss tests the weakness your own build revealed, and boss behaviour is learnable across runs.
- **The seasonality calendar** — always visible: Black Friday, game launches, fiscal year-end buying, holiday freezes, hurricane season, grid peak months, audit dates, patch Tuesdays, cert expiries, contract renewals, customer launch dates, generator tests. Events collide on purpose.
- **Opportunity events** — a big customer, partnership, hardware deal or press feature, each with a cost and deadline. Quota: **at least one opportunity per two threats**, and at least one positive event per level requiring no decision at all. Vocabulary includes a competitor's outage, a quarter-end vendor discount, a transit renegotiation, a utility rebate, a marketplace listing, the IPv4 block you forgot you owned.
- **Reputation as a slow resource** — everything nudges it on a monthly scale, so you cannot just optimise this month; damage is instant, repair 6–18 months (+2 var).
- **Escalation via customer demographics** — the base shifts hobbyists → businesses → streamers → enterprises → regulators and each demographic introduces a new vulnerability class (phishing and procurement, mobs and spikes, audits and evidence). Growth *is* the difficulty setting, and refusing a segment is a legitimate defensive play.
- **The three-clock rule** — exactly three timers prominent: one immediate (wave/incident), one medium (month, project, window), one long (contract, audit, era). ⚔️ the design proposes ~20 timers and then demands three; resolution is a **Unified Clock Ribbon** holding all of them with the UI promoting three by `urgency × consequence` — a UI guarantee, not a content restriction.
- **The Difficulty Director with an honest face** — a corner "Heat" gauge showing how hard the generator is pushing **and why** ("3 waves ahead of par", "on a losing streak"); it adjusts only sawtooth trough depth and the entropy budget, never a telegraphed wave's composition and never during an incident (+2 var).
- **The month-end sequence as the business heartbeat** — invoices fire, cash lands delayed, failures go to dunning, payroll clears, the P&L updates, the Cash bar jumps, and the board meeting happens every N months with objectives and a reckoning.

## 7.10 Path shaping: the Millisecond Budget, Inspection Depth, and Suspicion Routing

- **The Millisecond Budget (your real health bar)** — every defense, inspection, hop, proxy, queue and overloaded node stamps latency onto passing packets; visitors carry **Patience** and bounce silently when it's crossed. Patience per population: ~800ms casual page load · 60ms game player · 4ms financial-colo tenant · 250ms API consumer · 12 hours backup job · a business day for a colo tour. More towers = safer but poorer. Per-lane HUD budget bar plus a **Latency Ladder** breaking it down by hop (+3 var).
- **Inspection Depth (the per-node ladder)** — a per-node slider, not a purchase: **pass-through** (0ms, no confidence), **sample** (1 in 20; catches sustained patterns, misses one-shots), **inspect** (full latency, full confidence), **challenge** (active; machines fail it, humans resent it). Sample is the correct default almost nobody realises — volumetrics and sustained mimics for 5% of the latency.
- **Suspicion Routing — the Two Lanes** — **this is the mazing**: traffic is *scored* on arrival and the score picks its path. The **express lane** is short, shallow and cheap; the **deep lane** is the long hostile route the player builds (more hops, higher inspection, rate limits, challenges, tarpits, honeypots). Lengthening the deep lane is free against real customers and expensive against attackers; getting the score wrong sends a paying customer down the maze. Scoring inputs (reputation, ASN, behaviour, auth state, request shape, rate, geography, prior challenges) are all player-built; mid-path promotion and demotion re-route motes visibly; **sticky suspicion** persists per source for ~ten minutes. ⚔️ a wave-2 report argues the opposite — "the board is a topology, not a maze; the theme's tension is filtration, not routing length" — reconciled by never mazing the express lane and lengthening only the distrusted deep lane (+2 var).
- **Tide Locks (defense as hydrology)** — a lock chamber fills with bot-water, drains it harmlessly and refills while customers boat-lift past at a fixed toll; a small latency tax on everyone and enormous protection from nobody in particular. Controlled leaking as a tower — the answer to Volume that neither blocks nor inspects.
- **The Suspicion Dial (every defense is a classifier with a false-positive rate)** — an aggression slider per device, lane or globally: low lets everyone through cheaply and fast, high blocks threats *and* a percentage of real visitors at CPU and latency cost. The false-positive rate is visible as blocked-visitor ghosts drifting away greyed out with a "403" above them.
- **The Filter Grid (one matrix, all tradeoffs)** — one persistent panel with every defense as a row and every customer archetype as a column, each cell showing the friction that tower adds (latency, challenge tax, false-ban risk). Teaches the two-dial tradeoff as a shape rather than one tooltip at a time.
- **Classification confidence, not a boolean** — defenses produce a confidence score per unit and the player sets an action threshold; the UI shows the live distribution as a histogram with a draggable threshold line and **the overlap region shaded, because that overlap is the entire game**. Better classification narrows it, never eliminates it. Resolution floats as BLOCKED / MISSED / **FALSE POSITIVE**, the last in your customer's colour.
- **Threat units: Volume, Sophistication, Signature, Persistence** — defenses reduce Volume (scrubbing, anycast, rate limits), test Signature (WAF, bot detection, reputation), or raise the cost of Persistence (tarpits, proof-of-work, challenge escalation, lockout backoff); three axes mean an all-in build has a shape it cannot answer (+1 var).
- **Defense-in-depth scoring** — a single fat firewall passes early waves then fails suddenly; scoring rewards two or three cheap complementary layers because each layer discounts the previous one's leak rate. Three 70% layers beat one 95% layer, discovered by watching your leak rate.
- **Aggro shaping (the player's control over threat pathing)** — threats path to the most attractive reachable node where `attractiveness = exposure × value × (1 − apparent_hardening)`, and all three terms are player-controllable: exposure (firewall, segmentation, VLANs, trust graph), value (move the DB behind a tier), apparent hardening (a visible WAF banner, a challenge page, a honeypot with exaggerated attractiveness — appearance and reality may differ, and the gap is a strategy). The security-surface overlay renders this field as brightness.
- **The Attack Surface Ledger (capability and risk are the same purchase)** — every buildable card shows **Capability** and **Surface**: a database raises the revenue ceiling *and* unlocks SQL injection, slow-query storms and replication-lag events in the threat pool for the rest of the level; an admin panel unlocks credential attacks, a public API scraping and abuse, customer uploads malware hosting and takedowns. The game gets harder exactly because you got richer, in the shape you chose (+3 var).
- **The Heat Sheet (customer → threat coupling)** — each onboarded cohort visibly adds named threat lanes to your forecast: gamers bring booters, bulk senders bring RBL listings, crypto tenants bring miners and their hijackers, enterprises bring phishing and targeted intrusion. Makes *selling* feel like accepting risk the way the Ledger does for building.

## 7.11 QoS and traffic prioritisation

- **QoS Classes and the Priority Ladder** — define 3–5 classes sorted by customer tier, request type, auth state, endpoint, source reputation or contract SLA; each carries a **weight** (capacity share under contention), a **queue depth**, a **shed-order position**, and optionally its own latency budget and inspection depth. Under pressure high classes are served and low ones dropped or delayed automatically. Converts the Sacrifice Decision from a panic button into a standing policy. Lanes physically split into weighted channels with class as a mote edge-stripe.
- **Every hosting type has a different correct answer** — game hosts prioritise in-session players over joiners, email transactional over bulk, backup **restores over backups**, CDN cache fills over purges, GPU reserved over spot (pre-empting spot is a product feature), VoIP in-progress calls over new ones, and colo nothing at all because you don't control the packets.
- **Selling the ladder (priority as a product)** — classes are sellable as priority support, guaranteed IOPS, burstable vs dedicated, premium routing, "we will never shed you", each a contractual promise at a higher price. Sharpest conflict in the game: **a class you sold is a class you cannot shed**, so every premium customer shrinks the set you're allowed to sacrifice.
- **Fairness vs value (the visible, uncomfortable dial)** — sort by revenue (protect the whale), fairness (everyone degrades equally), cost-to-serve (protect the profitable), or contract (protect the biggest SLA credit exposure). All four defensible, the game never says which is right, but it reports at the end which one you actually ran.

## 7.12 The resource model: what is actually scarce

- **The eleven resources** — deliberately non-fungible: **cash · credit · power (kW, hierarchically capped per circuit/rack/room/facility) · cooling (must exceed power and is positionally distributed) · space (U/sq ft/weight) · bandwidth (Gbps and the 95th percentile) · IP addresses (scarce in v4, tradeable) · staff-hours (gates every action) · attention/on-call capacity · reputation (gates which customers talk to you) · trust/knowledge (lost on turnover; low knowledge literally makes the UI vaguer with "?" labels)**, plus the wall that is not a pool: **time / lead time** — expediting shortens an eight-week hardware lead, nothing eliminates it (+2 var).
- **The Two-Health-Bar Rule** — threat damage drains **Service Health**, customer damage drains **Trust**, and a level can be lost with 100% uptime by destroying trust. Trust also slightly hinders social-engineering threats, the one mechanic paying out on both boards from one action.
- **Uptime Nines — the error budget as a spendable in-combat resource** — lives are downtime seconds: 99.9% over a 30-day level = **43 minutes**; four nines = **four minutes**, which changes every window, upgrade and Ship-It-Friday decision. Burn it and you pay SLA credits, then churn, then fail; taking a deliberate 40-second outage to avoid a 20-minute one is a legitimate play. Overrun currency swaps per type — SLA credits, refunds, regulatory findings, data-loss exposure, reputation (+1 var).
- **The Uptime Fetish (streak score)** — a per-system continuous-uptime streak that grading rewards, making reboot-as-cleanse expensive (a 418-day streak has real score and reputation value). The designed trap: players defer maintenance to feed it, the zero-day shrugs off a five-year-old kernel, and the outage breaks the streak anyway. Optional hardcore "Uptime Purist" doubles entropy.
- **Capacity as the exchange rate between the two boards (the Bridge)** — signing a contract on the commercial board allocates capacity on the infrastructure board; money flows right-to-left as capacity and left-to-right as revenue, and over-signing is a dial-controlled gamble. A player who only plays one half loses.
- **Staff-hours as the universal drain** — support tickets, migrations, abuse takedowns, sales calls, audits, security reviews, cable traces and incident response all draw one pool, so every business decision is "what do my people *not* do this month". The sales pipeline's Security Review column is staffed by the same engineers your incidents need.

## 7.13 The simulation loop, written down

- **The tick, step by step** — twelve ordered stages: (1) arrival from the diurnal baseline plus event envelopes, each unit carrying type, size, patience, hidden `true_intent` and source reputation; (2) scoring — accumulating confidence, never boolean; (3) QoS classification; (4) routing — express or deep lane by suspicion, then the LB rule, subject to contract locks; (5) per-hop service (free slot or queue or shed); (6) queue wait `service_time × ρ/(1−ρ)` above ~70%, ≈0 below; (7) inspection-depth latency; (8) **dependency blocking** — a slot isn't released until downstream returns; (9) patience check → silent bounce; (10) outcome served/bounced/blocked/landed; (11) backpressure and retries fed back as new arrivals; (12) state, economics and the observed-truth write. Every mechanic in §7 is a modifier on exactly one step.
- **Ground truth vs observed truth** — a tick-order rule: steps 1–11 run on ground truth, step 12 writes the observed layer, and every UI element reads that layer. Monitoring purchases change only step 12's fidelity, freshness and coverage.
- **The Time Model (one coherent clock scheme)** — three nested clocks with stated ratios: **sim time** at 1 real second = 1 sim minute (a 20-minute level is ~20 sim hours); **business time** with a month boundary every ~7 real minutes (≈3 per level) firing billing, payroll, churn and P&L, so a 90-day lag lands two to three levels later; **incident time** dropping to 0.25× so millisecond phenomena are legible, permanently on for game, ad-tech and financial-colo levels.
- **The Dual Clock rule (and the thing it prevents)** — the **Ops Clock** (seconds/minutes) obeys pause and speed controls; the **Business Clock** (days/months) does not pause during an incident; and an action belongs to exactly one clock so the player never converts. Prevents pausing to fix a server and accidentally pausing payroll.
- **The Wave Envelope (reconciling waves with continuous flow)** — ⚔️ continuous diurnal flow and discrete named waves are both canonical; resolution is that **baseline traffic is continuous and diurnal** while the generator schedules **events** with a ramp, plateau, decay, composition and telegraph — a "wave" *is* an event envelope. Preserves the two-beat rhythm, pressure budget and sawtooth while keeping traffic never-zero, and gives each type its own baseline (backup near-zero with a nightly cliff, CDN a smooth sine, game a sharp evening peak) (+2 var).
- **The Determinism and Fairness Contract** — every run is seeded and replayable; no failure is unavoidable (every threat has a counter purchasable before it landed); **randomness determines timing and target, never existence** — the wave table is authored, the dice pick which drive and which minute; and a losing run must be explicable in one sentence on the postmortem.
- **The correlated-event rule** — a heatwave raises cooling load, power price, hardware failure rate, utility-event chance and neighbours' demand: five effects from one cause. A correlated event must read as one cause with many arms, not five unlucky rolls, and the postmortem draws the arms.

## 7.14 Automation, standing policy, and the policy UI

- **The Policy Book (standing rules as a first-class object)** — rules composed, not scripted, in a **when / for / then / unless** form of game nouns ("*when* web-tier CPU > 85% *for* 2 min *then* scale out by 2 *unless* budget remaining < $200"); full late grammar `WHEN [condition] IF [guard] THEN [action] ELSE [escalate to]`. Rules are visible, ordered, editable, auditable, each carrying upkeep; **conflicts are shown** (the scale-out rule fighting the cost-cap rule at 3am), and a live "rules fired" ticker lets you watch policy work or misfire (+3 var).
- **The Dependency Lock (pin)** — padlock a buildable and no human, script or automator may modify it; it also ignores improvements, and **pinned-but-vulnerable** is a named failure mode. Unpinning during a crisis costs extra focus. The Kill Switch stops all automation globally; the lock stops it on one thing permanently.
- **Ghost Hands (rendering automation)** — automated actions are performed by translucent ghost staff walking the board with the same animation and time cost; armed-but-idle automations stand next to what they watch, so **the parts of your estate with no ghost are where you are still the automation**.
- **The Dry-Run Toggle** — a rule in dry-run logs what it *would* have done without doing it, and after N successful shadow-firings the game offers to arm it. Prevents "I automated it and it destroyed everything" from ever feeling unfair.
- **Pre-authorized changes (planning as a buildable)** — queue a change to fire on a condition ("if p95 > 200ms, add two nodes", "if the queue clears, start the migration", "if the attack exceeds 5 Gbps, engage upstream scrubbing"), turning planning into a thing you build rather than intend.
- **The Kill Switch / Stop The Robots** — one instant global button (with per-rule suspension) freezing the autoscaler, reconciliation loop, config-management schedule, auto-remediation and failover, because otherwise your automation keeps "fixing" things indistinguishably from the failure. Cost: everything you automated stops helping — and forgetting to un-pause means a whole level run manually without noticing.
- **Delegation Bands** — three bands per staff member or rule: **inform** (they act and tell you), **consult** (they propose, you approve), **execute** (you find out in the log). Widening frees attention and raises variance; narrowing makes you the bottleneck. A two-click matrix, not a menu tree; richer on the commercial side.
- **Delegation and subsystem ownership** — assign a senior engineer to *own* a subsystem: they handle its routine incidents, absorb its toil and accumulate knowledge; costs salary, they can be wrong, and their knowledge leaves with them.
- **The Handoff (what the player must say to the machine)** — when setting a delegation policy or going off-shift you pick three lines from a candidate list ("watch the replica lag", "the cache node is new", "don't touch rack 4"); what you include is what staff and policies act on, what you omit they won't. A five-second interaction with a twenty-minute consequence.
- **Runbook Cards** — a documented procedure becomes a card you drag onto a live incident, executing the steps in order faster and with lower error rate than improvisation while occupying a hand. Building the library is the meta-progression of an ops game (+1 var).
- **Alert routing** — a routing table in the Policy Book mapping severity → destination → time-of-day rule → escalation path; over-paging burns out staff, under-paging misses incidents, and both have their own failure animation (+1 var).
- **Batch and Fleet operations — as an earned capability, not a UI feature** — a four-rung unlock ladder: select many (marquee, cyan outline, count badge) → apply one action to many (progress bar, per-object failure rate, animated as a wave you can catch mid-flight) → apply by tag or query ("all nodes with patch lag > 20 days") → standing rules. Mandatory rails at every rung: a blast-radius preview ("47 machines, 12 customers") and a rollout policy — all at once / canary / rolling / one rack at a time.
- **Policy authoring as the late-game verb** — from Tier 4 you stop issuing orders and maintain a system that issues them; **wrong rules execute faithfully**, and the late diagnosis puzzle is "which of my forty rules is doing this" — read the ticker, check conflicts, dry-run the suspect, watch the ghost (+3 var).

## 7.15 The commercial board: the other half of the map

- **The Pipeline Board** — a kanban of deals moving Lead → Qualified → Technical Review → Security Review → Proposal → Procurement → Signed → Installed → Billing, each column with a capacity (hands again), a stage-conversion rate and an average duration; deals decay if they sit, shown as fading cards with decay timers. Teaches throughput thinking as the infrastructure board teaches queueing, and the Security Review column is staffed by the engineers your incidents need (+3 var).
- **Funnel-stage checkpoints** — four conversion gates on the customer road, each a drop gauge: **pricing page** (plan-tile quality), **signup** (the fraud-vs-funnel dial: friction loses bad *and* good customers), **activation** (onboarding, docs, templates), **payment** (processor and decline rates). Staff and buildables near a gate buff it; a bot swarm jamming signup is a revenue attack that never touches a server. The **ghost customer** paid and never activated.
- **The Contract Card** — MRR, term length, start/end date, SLA tier, notice period, escalator, termination fee, support entitlement, plus one or two special clauses (most-favoured pricing, unlimited liability, right to audit, no price increases, assignment restriction, custom SLA). Bad clauses are cheap now and expensive at Exit, and they carry the routing constraints that become level geometry (+4 var).
- **The Deal Sheet (negotiation as clause-level trading)** — both sides hold terms with a value to you and a hidden value to them (price, term, SLA tier, credit cap, liability cap, payment terms, escalator, ETF, assignment, MFN, audit right, notice); you trade net-60 for 36 months, a 3% credit cap for an escalator. Every concession writes a permanent line the campaign remembers — the MFN you accepted reprices your best account three levels later (+1 var).
- **The Renewal Window** — a contract card pulses 90 days before expiry and you renew flat, renew with an escalator, upsell, or let it lapse; **doing nothing = it lapses**. Colo and enterprise levels live and die here (+4 var).
- **The Invoice Run** — the monthly heartbeat: invoices fire, cash lands with a delay, failures go to dunning, the Cash bar jumps, and the two ledgers disagree most visibly.
- **Dunning and collections** — a three-strike email → suspend → terminate dial with a speed setting; fast gives clean receivables and hot churn-ghosts, slow lets deadbeats float on your money. Failed invoices become "unpaid" units that age into bad debt. Named failure: **the whale misfire** — the dial correct for a thousand $9 accounts is catastrophic on one $40k account whose card expired.
- **The Churn Queue** — at-risk accounts surfaced with a reason code against a limited number of interventions per month (discount, escalate, call, or fix the actual problem); you cannot save everyone so you triage by value, and the game records whether you always chose the whale.
- **Service-recovery credits, winback budgets and the Escalation Ladder** — proactively crediting affected accounts before they ask beats prevention per reputation-dollar, but overuse breeds discount-junkies who farm incidents; a per-cycle retention budget spent poorly makes you a doormat. The Escalation Ladder lets an angry unit demand a manager, each rung burning staff time for better concessions, capping at **you**, inside Incident Command.
- **Upsell timing** — segments accept offers only under conditions (a trust threshold, a minimum plan age, an incident-free period) and spamming triggers churn, making revenue growth from your existing book a timing skill rather than a slider.
- **The Abuse Queue** — inbound complaints with SLA timers; clearing costs staff time, ignoring advances the upstream escalation ladder toward your own provider disconnecting you. On bulletproof levels the queue *is* the level.
- **Suspension and enforcement as player abilities** — five verbs, each a moral ledger entry: **suspend** (recovers cash, churns them), **throttle** (protects neighbours, produces a ticket storm), **evict a spammer** (blocklist reputation recovers, MRR drops), **ban on ToS** (cleaner platform, "do they censor?" review risk), **look away** (cash now, liability later). Mirrored by offboarding lock-in, where cancellation friction raises revenue, wrecks reviews and can be fined.
- **The Ticket Queue** — tickets walk into a lane and age, overdue ones turning red; unanswered tickets convert to churn with a 30–60 day lag shown as a ghosted forecast so the causal chain is learnable. Hiring L1 fixes the symptom; fixing what generates them is better and slower (+6 var).
- **The Phone** — high-value customers call; answering costs attention and prevents churn. A ringing phone during an incident is the purest expression of the game's central scarcity, and picking it up is not always correct.
- **The Capacity Planner** — a forward chart of committed capacity vs contracted demand vs forecast; hardware lead times mean you buy against a forecast, buying too early burns cash and too late loses deals. The screen where the Iron Board and the Book are the same problem (+3 var).
- **The Oversell Dial** — a per-node subscription ratio where higher means more margin and more risk of an incident when usage correlates — and it will: Black Friday, a game launch, a backup window, a viral moment, a patch Tuesday (+1 var).
- **The Pricing Console and the Rate Card as a live object** — editing the rate card mid-level is allowed: existing customers are grandfathered, new customers price off the new card, and **outstanding quotes honour the old card until they expire**, so a price increase carries a queue of pending deals grandfathered into it (+2 var).
- **Discount authority as a delegation slider** — set the % each role may grant without approval; higher means faster deals, worse margin and a discount spiral found in the quarterly P&L, lower means better margin, slower deals and your executive attention spent approving $200/mo discounts (+1 var).
- **The Two Books toggle** — one HUD switch between cash view and accrual/P&L view: a prepay is a spike in cash and spread over twelve months in accrual; hardware is a crater in cash and a depreciation line in accrual. Toggling constantly is what real operators do.
- **The Commit Ledger** — a rail of obligations: transit commits, power contracts, hardware leases, licence minimums, marketplace revenue shares, agent residuals, the office lease, and the SLA credits accruing right now. The negative of the backlog board.
- **The Quarter Close** — a recurring 30-second sequence: which deals can you pull forward at a discount, which revenue can you recognise, which expenses defer, and what do you tell the board. Every choice is legal, every choice is a loan from the future, and the game counts consecutive quarters of borrowing.
- **The Forecast Commit** — commit to next quarter's MRR at the board meeting; beating it is good, missing it triggers pressure events (cut costs, raise prices, fire people), and the trap is hitting the number by pulling deals forward and emptying the pipeline. Difficulty as a dial you set with your own mouth.
- **The Board Meeting and the Advisor** — every N months the board sets objectives and holds a reckoning, a soft timer shaping strategy without dictating it, alongside an in-fiction old operator who says true things at the right moment instead of a tooltip (+2 var).
- **The Org Chart** — each person has a specialty, ramp time, salary, morale stat and knowledge set; overworking causes outages *and* resignations, and a resignation takes knowledge with it (+1 var).
- **The Budget Allocator** — split marketing spend across acquisition channels with CAC and lead quality updating on a lag because attribution is always late; turning a channel off is instant, turning it on is not.
- **Delayed damage and the churn forecast** — outages, bad support and price hikes set a fuse rather than churning instantly, and a forecast overlay shows projected churn from this month's sins landing two months out.
- **Insurance and hedges (things that do nothing until they do everything)** — a redundant processor, a second transit provider, a fuel contract, a cyber policy, tested backups, documented runbooks, a shelf spare, a remote-hands standby contract. Routinely rewarded, and occasionally someone who skipped them gets away with it so the choice stays real.
- **Business-shaped difficulty levers** — market conditions (price war / boom / credit-tight), starting posture (bootstrapped cash-poor no-debt, venture-funded cash-rich growth-gated, **inherited** with legacy customers, technical debt and one furious whale), customer mix, regulatory intensity, and a Legacy Debt Modifier. Each changes what you do, not the enemy's health.
- **The Living Market (rivals as a sim, and share as the real final score)** — competitors with goals, tech trees and dirt launch products (stealing your attraction), fail publicly (spawning migration caravans), read your status page and time attacks to your incidents, and grow into acquisition targets. A share-of-voice board plots you against three to five rivals, share gates inbound volume, and market share is a persistent 0–100 campaign score.

## 7.16 Interaction laws and readability at scale

- **Everything Is a Thing** — no abstract menu where an object could exist: order a server from the catalog and rack it, drag a cable to connect, use the panel on the device to change a setting. The HUD carries only money, time, alerts and scores; everything else is pointable furniture.
- **The Two-Action Rule** — nothing done *during* an incident may take more than two inputs; every object's inspector carries an "Act" row of at most four one-click emergency verbs (drain, restart, isolate, shed) above everything else. Deeper work is peacetime work and may be as deep as it likes.
- **The Selection Grammar** — three states: **hover** (thin white outline, hover card, no world change), **select** (white floor base ring, inspector opens, dependency ghosting fires), **pin** (a physical clip tag that stays highlighted while you select something else, with a tether line to a docked mini-inspector; up to four). Pinning is how you watch the database while you fix the cache (+1 var).
- **The Squint Test (a design rule for every screen)** — every screen must be evaluated at 25% size with detail at 10% opacity; if the single most important thing isn't still visible, the screen fails. Applied to every altitude, overlay and mode.
- **The Icon Budget** — a hard renderer-enforced cap on simultaneously-drawn alert glyphs per screen region, with overflow merging into a "+7" cluster badge that expands on hover, so a content update cannot violate it.
- **Clustering with Intent** — at Tier 3+ identical adjacent states merge into one labelled soft-outlined region ("Row C: 14 nodes, healthy") and only exceptions stay drawn individually, pulling the eye without a blinking pixel (+1 var).
- **The Two-Planes Rule and Three Elevations** — building happens at floor level and defensive action above and below, so combat never occludes layout: **ground = customers** (the money road), **sky lanes = network threats** (drones, flood-tides), **sub-floor grates = physical and hardware problems** (rats, cracks, leaks). Manages collision rather than density.
- **The Exception Spotlight** — one amber unit in a sea of green gets a subtle radial darkening of everything around it rather than a flash; less fatiguing than blinking and it composes with clustering.
- **Motion as the Last Channel** — colour, shape and position first, motion reserved for what needs action now; idle animations subtle, LEDs slow-breathing, cable sag static, so an emergency registers instantly by contrast.
- **Alert Taxonomy — exactly three tiers, three distinct looks** — **toast** (bottom-right, slides in, silent, auto-dismisses), **badge** (persistent pip on the object and the Rack Ribbon), **klaxon** (screen-edge red vignette pulse, sound, camera offer). Never more than one klaxon at a time; additional criticals queue behind it.
- **The Vignette Language** — screen-edge tints carry global state without consuming layout: red pulse = critical incident, blue = brownout/power, white = suppression discharge, violet = audit in progress, gold = a big payday landing.
- **The Rack Ribbon** — a thin persistent bottom strip with one slim vertical bar per rack coloured by its most salient state; 200 racks fit, click one to fly there. The minimap for a facility that no longer fits on screen.
- **Quiet Mode** — a toggle that hides everything healthy entirely, leaving only problems drawn on a dark ghost of the facility; with the Watchlist it is the difference between a Tier 5 board being overwhelming and readable.
- **Colourblind shape-coding (every semantic colour also has a shape)** — ● healthy, ▲ warning, ■ fault, ✖ down; threats carry an angular chevron, visitors a round mote, money a hexagon. Full deuteranopia/protanopia/tritanopia palettes plus a patterns mode using hatching for zones.
- **Text Scale Independence and the Label Budget** — HUD text lives in the Chrome layer and never scales with zoom; a 75%–200% global UI scale reflows panels rather than magnifying them. Device labels render only at close altitudes and only for selected, alerting or pinned objects, and any label can be permanently pinned.

## 7.17 Modes, sandbox, and the shareable artifact

- **Sandbox, scenario editor, and the Lab** — the full build palette plus a scripted-scenario editor so the community can author launch spikes, audits, acquisitions and disasters, over a no-fail homelab **Lab** where every mechanic can be poked safely and a chaos monkey can be flung at your own infrastructure to watch cascades without losing anything.
- **The replay as the post-mortem artifact** — every completed run exports a shareable JSON replay plus a postmortem card (uptime, profit, reputation, worst-moment screenshot); the richer **NOC Wall** version records an all-screens replay of tickets, graphs and the incident timeline. Possible only because every run is seeded.
- **Co-op split roles and asymmetric versus** — co-op splits edge board (network and defenses) from core board (services and customers), or infrastructure (placement, upgrades) from traffic and incident response, with follow-the-sun co-op making the Handoff a two-player mechanic. Asymmetric versus gives one player the competitor's DDoS and abuse budget scoring **points per bounce** against a defender scoring **points per retained customer**.

---

# Visuals and presentation — summary

> Source: `master/09-visuals-and-presentation.md` · 420 idea entries · 396 KB

## 8.1 Art direction candidates

- **A. Clean Isometric Diorama (the recommended world layer)** — fixed 2:1 isometric, matte materials, one gloss accent, colour reserved for state; scales one box → hall of racks without changing metaphor. (+9 var)
- **B. Technical Blueprint / Schematic (cyanotype)** — white-on-blue linework, monospace labels, dimension lines; the world *is* a diagram. Ink Blue, never cyan (cyan = traffic). Ships as a mode. (+3 var)
- **C. CRT / Terminal Retro (diegetic terminal)** — phosphor green, scanlines, box-drawing, blinking cursor; era shifts become full UI re-skins (green→amber→Win95 grey→dark dashboards). (+4 var)
- **D. Cozy Miniature / Tilt-Shift** — soft DOF, warm desk lamps, tiny people, a cat; a lighting and scale treatment over A, focal row crisp and the rest soft. Disableable.
- **E. Gritty Industrial Realism** — concrete, cable ladders, sodium light, grime, real proportions. Best atmosphere at Z4, worst readability at Z1; use for the shell and establishing shots.
- **F. Cutaway Dollhouse 2.5D** — orthographic 3D with front walls removed; uniquely good at facility systems invisible top-down (power path, chilled-water loop, plenum). Most expensive option. (+1 var)
- **G. Paper Diorama / Craft** — cardboard racks, paper cables, felt tiles, visible glue and fold lines; fights heat and light, so best as a cosmetic skin or museum diorama. (+1 var)
- **H. The Isometric Ledger** — warm blinking physical world plus a cool flat financial-dashboard overlay; the eye is trained on what's dark, what's hot, what's unlabelled.
- **I. Low-Poly Neon** — emissive night-city against near-black geometry; best for the *outside* (threat skybox, customer origins, spawn edge) and the arcade/edge kit, not the world.
- **J. Isometric Voxel** — everything is blocks, so racks assemble block-by-block at tier-up; the tier-up ceremony comes free because the geometry already knows how to be half-built.
- **K. PCB Plan-view** — the map as a circuit board: soldermask green, copper traces as roads, vias as junctions, silkscreen labels diegetic by construction. Good for flow tutorials.
- **L. Corporate Infographic Flat Vector — as satire** — smug pastel flat-vector corporate illustration used deliberately as a joke; best for menus, reports, and the in-world advertisements layer.
- **The recommended shipping combination** — A as world, B as schematic mode, C as retro era and terminal, D as lighting philosophy, E as materials at high zoom; phrased World / Signal / Chrome. (+5 var)
- **The Style Allocation Table** — each style *owns* named surfaces and is explicitly banned from others, so no frame ever requires a "how much blueprint" judgement call.
- **The Two-Palette Discipline** — the world layer uses only muted materials plus LED points; the signal layer owns every saturated hue. Nothing in the world is saturated for decoration.
- **The Two-Tone Rule (the money reading of the same discipline)** — world neutral, only money and risk saturated. Its green=revenue conflicts with the Hue Ledger; resolved by delivering the intent through Utilization Glow instead.
- **Utilization Glow** — money legibility as fill level not colour: empty/dark = paying for nothing, warm = money, pulsing hot = about to breach SLA. Matters most in colo, VPS, GPU, wholesale.
- **Grain and Materiality** — a light static film grain plus per-material noise (brushed streaks, plastic speckle, concrete pores); static, so free at runtime and outside the motion budget.
- **The Lighting Model** — rooms are dim and lit by their own equipment, so a dead rack is a dark rack and a power failure is a literal descent into darkness. Replaces a dozen HUD elements.
- **The Practical Lights List** — the named reusable sources: exit signs, EPO under glass, aisle strips, CRAC lamps, generator panel, camera IR, monitor wash on faces, a 3AM desk lamp, UPS tint.
- **Depth of Field, Sparingly** — tilt-shift and DOF at Tier 3+ to make a huge facility read as a model; never strong enough to hide state, and auto-disabled in Reduced Motion mode.
- **"State is colour, identity is silhouette"** — you must tell *what* a thing is with the colour drained and *how it is doing* with the shapes blurred; two orthogonal channels, each separately tested.
- **The design north star** — readable infrastructure, felt consequences, hosting type recognizable in one frame; shape grammar before colour, every system earns a diegetic view, the rack is the hero object.
- **The material alphabet** — one material per concept, never mixed: brushed steel=healthy, chrome=hardened, rust=unmaintained, frost=cooling, ember=hot, black glass=down, translucent=virtualized, paper=compliance.
- **Beige-to-Chrome Lineage** — beige towers → black steel → white lab slabs → black glass, so the era of your operation reads from the metal alone; each tier changes silhouette and footprint.
- **How much face? — *CONFLICTING*** — how anthropomorphic hardware may be; four positions kept, none picked. ⚔️ Full literal faces (charm, undercuts ops credibility) vs behaviour-only posture and LED cues vs subtle pareidolia vs face-as-pure-telemetry.

## 8.2 Rendering rules, colour language, and shape tokens

- **The Layer Law (Three layers, plus Intent, plus Attachment)** — Substrate never glows, Flow never has flat UI colour, Annotation never has perspective; Intent (white, dashed, unlit, perspective-correct) holds things that do not exist yet, Attachment holds unit-riding UI at fixed pixel scale.
- **The Emissive Allowance** — substrate may emit only as points and thin rims capped at ~2% of the object's screen area in its own state colours; Flow may emit as volume; Annotation and Intent never emit at all.
- **The Diegetic Annotation Exception ("Objects of Record")** — Substrate geometry carrying Annotation content; never load-bearing during an incident, always has a flat HUD twin one key away, always Readout-Mode capable. (+2 var)
- **The Hue Ledger** — one hue one job with reassignments named: cyan=traffic, magenta=hostile, amber=self-inflicted friction, gold=money, copper=power, orange=heat, red=failure (reserved), green=verified, violet=unidentified, white=intent, Ink Blue=blueprint, warm grey-amber=degraded, grey=inert.
- **The one hue table — *CONFLICTING*** — seven rival tables; all agree that publishing two is fatal. ⚔️ Red vs magenta for hostility, green's double duty as healthy vs backup/replication, and money as gold vs yellow vs green.
- **Gold moves, amber fills, orange is a lens, red is final** — the warm end separates by form as well as hue: money is always a discrete mote, coin or arc; warning is always a static fill, tint or pip; heat only inside its own overlay.
- **Saturation, value, and temperature — the three state axes, reconciled** — health is value and colour temperature, urgency is saturation; stressed warms and brightens, dying warms and darkens, dead goes grey. Distance may never use desaturation.
- **Money has colour and weight (revenue quality, rendered)** — coins are tinted by revenue-quality band within the gold family and sized by margin, so slow heavy coins and fast dull confetti summing to the same MRR teach revenue quality.
- **Self-inflicted failure: white-cored red** — a failure you caused renders as white (the player-intent colour) bleeding into red, distinguishing it from an external attack. Amber remains "friction you caused", white-cored red "an outage you caused".
- **Purple means "we don't know yet"** — all arriving traffic is violet until classified, and watching violet resolve into cyan and magenta *is* the core loop rendered. Forces mimic tells to be motion and path, never colour.
- **The Confidence Blur** — classification uncertainty rendered as continuous blur that sharpens as confidence rises, so the board's overall sharpness is a live readout of how well you are seeing. Cap the radius in screen pixels.
- **The Alert Triad Rule** — at most three alert hues may be simultaneously active, allocated by severity rather than by subsystem; everything below third aggregates into a single neutral counted pip. A forced overlay cuts the budget to two.
- **The Ring Taxonomy** — five annular forms, never interchanged: Ring = time running out, Donut = utilization, Halo = mood or sentiment, floor Arc = player state, Pips = discrete counts and levels.
- **The Instrument Design Language** — one bezel, five permitted faces (needle dial, bar, water line, oscilloscope, counter), four fixed elements each (unit stamp, nominal band, threshold mark, ghost trace), one alarm behaviour, and total stillness at nominal.
- **Stroke Weight as Certainty** — hairline = inferred, normal = measured, heavy = verified or contractual, applied across every glyph, badge, line, needle and check; survives every colour-blind palette.
- **Shape tokens** — circle=request, triangle=attack, square=batch job, diamond=high-value entity, hexagon=infrastructure node, teardrop=persistent session, starburst=incident, chevron=threat family, ring=patience timer. (+3 var)
- **The Two-Channel Law (formerly the Diamond/Circle/Triangle law)** — no information is ever carried by colour alone, and a greyscale pass is a sign-off gate for every unit, overlay and alert. One stated exemption: identity-under-deception. (+3 var)
- **Decision-cost colour: spending vs committing** — actions spending a reversible resource render gold; irreversible one-way doors get a distinct hatched border plus a two-stage confirm that names the consequence.
- **Player-authored vs system-default rendering** — anything the player explicitly configured carries a small white hand-set tick and defaults render plain, so a board with no white ticks anywhere is one nobody has thought about.
- **Motion language** — drift=healthy flow, pulse=heartbeat, jitter=instability, bunching=queueing, snapping taut=saturation, recoil=rejection, dissolve=timeout, slam=hard failure, cling=held resource, sweep=methodical scan. (+2 var)
- **The Readability Budget** — at most 3 alert colours, 1 active overlay, 5 animated *event* FX types and 1 modal on screen; ambient FX are unbudgeted. Extended to agency: 3 decisions, 3 promoted clocks, 3 open inbox cards. (+5 var)
- **The Motion Budget per Altitude** — Z1 unlimited, Z2 max three continuous animations per rack, Z3 no per-object animation except state changes and the global heartbeat, Z4 motion only on arcs and weather.
- **The Chroma Meter** — a developer overlay counting live alert hues, active event FX, animated elements, labels drawn and saturated-pixel percentage, going red over budget; also ships as a player accessibility readout.
- **Per-line tint vs alert colour arbitration** — tenant and business-line tints are restricted to a low-saturation band on the Substrate layer only, and suppressed entirely inside any object in a warning-or-worse state. Alert colour always wins.
- **The Foreignness Budget** — deliberately foreign art may differ only in decal, bezel geometry, cable colour and label font; never in silhouette family, status-LED language, the load donut or the hue ledger.
- **Status Chips** — one rounded-chip state vocabulary used identically everywhere: HEALTHY, DEGRADED, DOWN, DRAINING, PATCHING, COMPROMISED, SEALED, EXPIRED, OVERDUE, AT RISK, PENDING, UNVERIFIED, each carrying a shape notch as well as a colour.
- **The Handmade Layer** — anything authored by a person in the fiction uses marker, label-maker tape, ballpoint, sticky note or Dymo, and the game itself never generates in those materials, so human decisions read at a glance.
- **Zero-State Art** — empty is authored: empty U slots show rails and a cable-arm stub lit from above as invitation, unsold floor is sealed concrete with row markings already painted, an empty desk has a chair pushed in and a dark monitor.
- **The Colour Contract** — customer spectrum warm gold→green, threat spectrum acid-green→magenta→void-black, money yellow only; the overlay wheel never breaks these, and only chrome and environment palettes rotate per act.
- **The Entry-Side Contract** — customers always enter from the bright side and the front door, threats from the dark map edges, the back, above or through; origins never mix, and it is the one contract that still works at Z4.
- **Three Elevations** — ground level = customers, sky lanes = network threats, sub-floor grates = physical and hardware problems; a paused frame therefore sorts itself by height before anything else resolves.

## 8.3 Camera, altitudes, and level of detail

- **The Four Altitudes** — Z1 the Machine (faceplate), Z2 the Rack, Z3 the Room/Topology, Z4 the World/Portfolio, with six rungs for artists; each altitude owns different verbs, and detail drops going up but meaning never does.
- **The altitude transition rules** — transitions are animated never cut, selection persists across altitudes, the selected object's screen position may not change, and alarms pull the camera only on sev-1 with a stated skippable one-second move.
- **Per-Line Default Altitude** — each Ruleset Card declares a home and a detail altitude and camera plus LOD budgets follow; edge/5G MEC has only Z4 and Z1, and that jarring jump is deliberately the line's feel.
- **Alarm propagation up the altitudes** — a failing drive is a red LED at Z1, a red chassis stripe at Z2, a red-tinted rack at Z3 and a red pip on the site marker at Z4; aggregation is always worst-state-wins.
- **Iconographic LOD and the Density Ramp** — LOD0 full sprite → LOD1 simplified to heartbeat only → LOD2 a glyph with state colour and pip → LOD3 the object ceases to exist and lives inside its parent's aggregate glyph. (+5 var)
- **Semantic zoom** — detail is replaced rather than shrunk: drive LEDs and port labels → per-server health bars → racks as coloured blocks and rows as bars → facilities and regions as aggregate-health blocks. (+3 var)
- **Depth fog and focus** — distant or irrelevant parts of the scene lose contrast and gain a slight value lift, and focus dimming darkens the unrelated; never desaturation, which is permanently reserved for urgency.
- **Camera bookmarks** — camera positions saved per subsystem and jumped to on number keys; essential once you have more than one rack, and it makes big builds navigable.
- **Smart Focus** — selection frames the object with a small dead-zone camera so related things stay visible; it never centre-locks, which is nauseating at high zoom and hides the context that prompted the selection.
- **The Camera Grammar** — eight reusable shots: Establish, Drop (world→building→aisle→rack), Snap (0.25s to an incident), Orbit, Fold (Room↔Board), Rail, Pullback, and Hold (two seconds of deliberate stillness). (+1 var)
- **The Establishing Shot** — each level opens with a slow four-second push-in from Z4 to its working altitude over the Deal Sheet's audio; free grandeur for one camera move and no art cost.
- **The Tour Camera / The Tenant's-Eye Walkthrough** — a slow scripted Rail fly-through of your own facility with stats overlaid; the eye-height variant adds handheld sway and aisle lens flare for colo tours, audits and the ending.
- **The Ceiling Cam** — a top-down orthographic option for pure layout work: no perspective, no charm, maximum precision, and the natural home of the Floor Plan rung of the camera ladder.
- **The Security Camera Feed** — a grainy, timestamped, slightly fisheyed picture-in-picture from any placed camera, for security events, after-the-fact investigation and comedy. Essential in colo and regulated lines.
- **The Ghost Facility** — when you fly to another site the previous one persists as a dim ghost at the map edge showing its single most salient state, because the site you are not watching is the one that fails.
- **The Nobody-Is-Watching Frame** — if the camera is untouched for 45 peacetime seconds it begins a very slow drift along an authored path, so calm periods feel like something rather than like waiting.
- **Sort-by-Risk Camera** — a button that re-frames the view on whatever is currently costing you the most money rather than whatever is loudest; the frequent difference between the two is the lesson.
- **The Attention Gravity Well** — incidents auto-nudge the camera only if both severe AND unobserved, and stop pulling the moment they are seen; a "3 incidents" stack chip queues the rest for manual stepping.
- **Landmark hierarchy for campus zoom** — the UPS pillar, the steam-stacked chiller, the generator shed and the badge kiosk are never aggregated, culled or re-skinned, so orientation survives the Density Ramp destroying *where*.
- **Zoom is diegesis** — details lie when you are not looking at them, so staying at Z4 is choosing not to see the drive lights; unlocks that automate reporting and keep far-zoom honest are a purchasable progression beat.
- **Multi-DC split-canvas** — at multi-region scale the screen becomes 3-4 live regional windows arranged around a central trunk schematic, each a real running view of that site rather than a thumbnail.

## 8.4 What infrastructure looks like

- **The universal object grammar** — five glanceable channels: silhouette=family, faceplate=model and tier, lights=what it is doing now, rim-light colour=upgrade tier, grime and wear=age and maintenance debt.
- **Servers by shape** — 1U pizza box, 2U with visible bays, 4U storage wall, blade grid, GPU node (deep, finned, wrist-thick power cable, expensive and slightly dangerous), fixed-function appliance. Health runs green breathing → fast flicker → one amber drive LED → dark with a red fault LED.
- **The object catalogue (shared visual grammar per family)** — short specs for rack, switch (per-port LEDs synced to cable traffic), router, storage array with a rebuild wave and progress ring, tape library with a robot arm, UPS, generator, CRAC airflow arrows, firewall grates, LB Y-junction, cache reservoir, gaudy honeypot, cross-connect panel, PDU amp bar, ATS.
- **Racks, front and back** — the front is the public face of faceplates, LEDs and labels; the back is the truth of cables, feeds and mess. Three things are back-only: verifying dual-cord power, tracing a cable, reading negotiated link speed.
- **The back-of-rack detail set** — two cord colours to two PDUs make the single-corded machine an instantly visible asymmetry; plus swing-out cable arms, velcro-vs-zip-tie MTTR, a red bend-radius glyph, discolouring dust filters, the PDU blocking a rail U forever.
- **Blinkenlights as primary telemetry** — a stated grammar: steady green=idle, flicker=load, steady amber=degraded, slow-blink amber=predicted failure, fast-blink amber=rebuild window, red=failed, blue=locate, dark=unpowered and scariest. LEDs are present-tense and local; monitoring is historical and looks for you. (+6 var)
- **Does the healthy rack blink? — *CONFLICTING*** — whether healthy idle racks are visually active at all. ⚔️ Chorus camp (calm randomized blink as signature ambience, pattern-break is the alarm) vs anomaly-pulse camp (stillness is health, any pulse means trouble).
- **Link LED colour language** — port LEDs encode negotiated speed by colour, so a 10G port that came up at 1G is visibly the wrong colour from across the rack with no overlay at all.
- **The half-dead link** — flow pulses carry direction, so a unidirectional failure shows outbound pulses with none returning while both end LEDs stay green; a player who learns to look for return pulses has learned something real.
- **Health as flow, not bars** — smooth=healthy, stuttering=packet loss, backed-up=congestion, one-directional=asymmetric routing, none=down; no health bar on a cable is needed at all. (+4 var)
- **Airflow direction as a visible object property** — each device carries an airflow arrow (front-to-back correct, back-to-front, side-to-side); in the overlay a side-exhaust switch visibly blows into its neighbour's intake.
- **Cable colour coding** — convention lives as a sheath band near the connector drawn from six desaturated non-semantic hues while the body carries Flow telemetry. House set: amber copper, aqua fibre, black/red power A/B, grey OOB, violet cross-connect, white "temporary". (+2 var)
- **Fibre/copper hue assignment — *CONFLICTING*** — three incompatible medium palettes for the game's most-repeated object. ⚔️ Whether cable hue may enter the semantic palette at all, and whether fibre is aqua, yellow, or white-blue with copper taking the other.
- **Cable archaeology** — old cable colours persist, so a facility through four eras has beige Cat5, grey Cat5e, blue Cat6 and aqua fibre in one tray; nothing forces a re-cable and the strata accumulate.
- **Progressive disclosure of cables** — above Z2 individual cables stop drawing and become link ribbons between racks whose width is aggregate bandwidth, still carrying the Flow language.
- **The power tree as a visible circulatory system** — utility→ATS→UPS→PDU→RPP→rack PDU→outlet as a glowing branching structure in Copper with current as particles and thickness ∝ capacity; a breaker trip darkens its whole branch visibly.
- **Cooling, CRAC units, and airflow** — cold mist from perforated tiles, heat shimmer over hot aisles, and visible recirculation eddies the player fixes with click-to-place blanking panels. Cooling failure grows the shimmer and climbs the room's colour temperature for five minutes before anything throttles.
- **The heat bloom** — an expanding orange gradient across floor tiles with a temperature number creeping toward a red threshold; machines inside it visibly throttle as clock readouts drop and performance bars shrink. (+4 var)
- **Thermal ride-through as a draining reservoir** — cooling failure drains a visible blue reservoir sized by the thermal mass you bought; containment makes the reservoir smaller *and* the racks cooler, rendering the counterintuitive tradeoff in one image.
- **The generator and the lighting shift** — utility fails → dim cool UPS lighting → crank, cough, shudder → warm light at a slightly different colour temperature. Needs an exact colour-temperature spec per power state; a generator that fails to start gives three seconds of silence.
- **The facility exterior** — a small side view: generator yard with fuel tank and level gauge, chiller plant, utility transformer, meet-me room, loading dock with pallets. Weather happens here, and the fuel truck that does not arrive is a visible absence.
- **The Window** — exactly one window per facility showing weather, time of day, season and the hurricane; one asset, enormous atmosphere return, and the only place the player ever sees outside.
- **The internet cloud / spawn edge** — a stylized boundary at the board edge (a cloud, a horizon, a bank of upstream routers) from which visitors and threats emerge; at Z4 it becomes actual geography.
- **Cross-connect ladder racking** — the colo signature image: overhead ladder racking dense with orange fibre jumpers running to the meet-me room, where each strand is a revenue line and the room literally glitters.
- **Labels, and label quality as a visible investment** — a labelled port carries a readable tag and an unlabelled one shows `?`; labelled infrastructure is mechanically faster to interact with in a crisis, and labels made during an incident are visibly scrawled. (+1 var)
- **Wear, grime, and dust** — the Wear Channel Triad splits one overloaded channel into three: dust = time since last touched, yellowing = age of the asset (never cleans up), disorder = maintenance debt, which is the one with mechanical consequences.
- **Cable management debt as a rendering penalty** — a neglected rack grows a spaghetti nest that physically obscures the equipment behind it and makes things harder to click; the gameplay penalty *is* the rendering penalty.
- **Cables tell your story** — a rat's nest early, then combed, colour-coded and labelled after investment; purely cosmetic apart from tour-score and maintenance-speed bonuses, and that is enough to make players care. (+3 var)
- **The rack as a progress bar** — an empty rack filling up over a level is the most satisfying visual progression the theme offers; gaps look bad, tidy fills look great, and "one more U" is a genuine motivator.
- **Auto-generated rack elevations** — any rack viewable as a proper printed elevation diagram with U numbers and device labels, the same picture a real DC hands you; doubles as a shareable and as the Z1 racking view. (+1 var)
- **The elevation-vs-reality diff** — an overlay drawing the *documented* elevation as Ink Blue linework over the actual contents with mismatches highlighted; a horror show in acquisition levels, a quieter one in your own after two years.
- **The cage nut** — a four-frame racking micro-animation: the cage nut, the cage nut tool, and occasionally a tiny red particle for a bloodied knuckle. Everyone who has done it will make a noise.
- **Cold-aisle breath and the hoodie** — the cold aisle is genuinely cold: visible breath at Z1, techs in hoodies, and a space heater under a NOC desk plugged into something it absolutely should not be.
- **The Scar Map** — every major incident leaves one small permanent physical trace at its location (a scorch on a PDU, a patched floor tile, a panel in slightly different beige, a wrong-colour cable); they never clean up automatically. (+2 var)
- **Sticker archaeology** — gear carries stickers from its era: asset tags, warranty voids, "PROPERTY OF", a dead vendor's logo, a previous owner's hostname scratched out. Inherited gear tells a whole story for one decal atlas.
- **The phantom cabinet** — an empty cabinet, lit, with your asset tag on the door and an invoice glyph floating above it, found during The Reconciliation: paying rent on nothing, rendered.
- **The Fresnel zone** — for WISP and fixed-wireless: a translucent ellipse between two towers with terrain and vegetation intruding, narrowing seasonally with leaf-on. Line of sight rendered as a volume, not a line.
- **The two registers: Room vs Board** — the Room is warm, lit and material where you *feel* the business; the Board is flat, cool, precise Ink Blue where you *reason* about it. The Fold takes 0.6s and objects keep their screen position throughout. (+2 var)
- **Chassis mood and posture** — hot rigs sweat, DDoSed boxes tremble, idle boxes breathe, dying boxes spool down and lose lights one by one; racks stand straight when healthy, lean under sustained load, slump when degraded.
- **Rack-face close-ups and per-server micro-fiction** — Z1 flips to a front-panel view with fake dashboards and per-server storytelling: a cat photo taped to the ESXi box, a shrine of config printouts by the machine nobody dares reboot. (+5 var)
- **Connection-visualization alternatives to wiring** — cables stay the default; the alternatives are Light Cones (gorgeous at scale, weak infrastructure feel), Circuit Traces that etch themselves in, Pipe-and-Valve for throttleable power and cooling, and Star-Map Threads for CDN links.
- **The Cable-Legend Poster** — a zoomable diegetic legend hanging in the HQ rendering the player's chosen cable palette once and authoritatively; the tutorial never explains cables, you walk past the poster.
- **Server Ghosts and Orphaned Records** — dead machines flicker translucent into the LED chorus for one beat doing their old duty; orphaned DNS, crons and switch ports drift as translucent icons and can be claimed by an attacker. Ghosts are customer-warm in colour but wrong in shape.
- **The Floor is a Schedule** — under-floor tiles glow where cable trays run hot and high-traffic routes polish a shine into the floor, so a well-served level literally looks worn-in and the floor records where packets actually went.
- **Rack Beasts** — cable rats and dust bunnies wander behind the racks chewing neglected cables, which is real maintenance pressure; a tidy server room never sees them, and they inhabit the space without spawning gameplay entities.
- **Day/night, timezones, and the shift-change ceremony** — facility lighting cycles with real time-of-day, the night side has dimmed desks but still-glowing racks and a cleaning robot, and shift handoffs are visible with lanyards passed and the audio re-voiced.
- **The interior light-temperature channel** — warm interior light means happy ops, creeping cooler and dimmer with incident load until the fluorescents gain that 2am buzz. It modulates colour temperature and intensity only, never saturation.
- **The rack-aisle perspective shot** — a receding aisle into soft fog, your territory lit door-by-door, and a power dip rippling darkness from the far end; store-page key art composed entirely from assets the game already ships.

## 8.5 What threats look like

- **The threat visual contract** — five readable channels: silhouette for family, colour within the magenta family with a per-class hue shift, motion signature, telegraph, and scale proportional to pressure on you rather than raw volume. Class must be identifiable at Z3 with colour removed. (+2 var)
- **Motion as behaviour (the seven motion primitives)** — advance (a wall), drip (a thin thread), sweep (a methodical scan), swarm (cluster and disperse), cling (occupy a slot), mimic (indistinguishable until it isn't), crystallize (spread along links); every threat is one primitive plus modifiers. (+2 var)
- **Silhouette rule for threats** — volumetric = a dense swarm blob or rising tide, application = a single sharp angular dart, slow/persistent = a thin trickling worm, insider = a normal sprite with one wrong property, physical = a board overlay rather than a unit.
- **Threat class marks** — volumetric=three stacked chevrons, application=a bracket pair, physical=a cracked square, legal/abuse=a stamp corner, human=a silhouette head, environmental=a wave, financial=a torn receipt edge; the mark reappears on lanes, alerts and telegraphs.
- **The Counter Match** — every defense object's icon visibly contains the mark of what it stops (the scrubber holds the volumetric chevrons, the WAF the brackets, the abuse desk the stamp corner), so the counter table is learned at the point of purchase.
- **Telegraphs** — the warning is proportional to a threat's *pressure cost*, not its danger, so telegraph-reading becomes a genuine skill. Five grades: none, instrument-only, edge contact, horizon, cinematic; entropy and hunter threats get no telegraph at all.
- **The unidentified state** — an unclassified contact is a violet blob with an indistinct silhouette at maximum Confidence Blur; as inspection works, the silhouette resolves, the blur sharpens, and the colour snaps to its true class with a one-frame identification flash.
- **Attack landing (the impact language)** — four shared elements (a 1-frame red flash, a directional impact spark, a chip of health bar breaking off and falling, a magenta grit puff) plus a distinct per-family verb. Never a generic explosion. (+7 var)
- **Persistence and infestation** — a compromised node grows a subtle corruption of dark veins and flickering wrongness that spreads along trust links if untreated; visible slow corruption is far scarier than a damage number.
- **The Poisoned Tint** — the missing failure axis, wrong-but-serving: a thin sick-green film outside the semantic palette over a node's output flow, covering cache poisoning, bad deploys, stale reads, DNS hijack and corrupt backups.
- **The Threat Gantry** — the bestiary as portraits, each threat with card art in a consistent specimen-under-glass frame carrying name, class mark, first-encountered date and lifetime cost; earned through play.
- **Attack telegraphs and the radar sweep** — FX_PrismSplit resolves a single incoming contact into its constituent sources as analysis completes; the board-edge radar's sweep rate is a function of detection investment, so a poorly-instrumented player finds out late.
- **The threat catalogue — technical threats** — DDoS as a rising tide filling a drawn pipe while legitimate visitors pile up outside, L7 as perfect visitor mimicry until detection flips it red, Slowloris slumped motionless in connection slots, scanners swarming any newly-exposed port within seconds, ransomware crystal-frosting along dependency links, BGP hijack rerouting your own traffic arrows to a POP that isn't yours, hardware failure deliberately undramatic with a hateful chassis beep, fire as the one genuinely dramatic event. (+12 var)
- **The threat catalogue — business, financial, legal and commercial threats** — the wave-1 gap filled: chargebacks as backwards red coins and a tearing receipt, review bombs literally pinching the acquisition lane narrower, churn waves as clients silently standing and filing out, a padlock slamming over the cash bar, vendor hikes stamping "+$" on every affected object at once, the upstream abuse-ladder totem that unplugs your uplink at red, the whale as a cracking load-bearing pillar, the auditor walking in the front door immune to every defense. (+5 var)
- **Specimen Cards on Hover** — hovering any threat pauses nothing but flips up a tiny field-guide card showing protocol abused, preferred target and counters that hurt it, each as an icon; the card grows richer as your knowledge does.
- **The Threat Horizon** — a top-of-map strip of shadowy question-marked silhouettes massing on the Internet road, borrowing the weather-forecast grammar wholesale; click a shadow for details, and pacing arrives without map clutter.
- **The Attack Sky (the geo-arc threat map)** — threats arrive as literal red arcs from their geographic origin; arc density and thickness are per-source strength, spoofed sources render as jittery dashed lines, and scrubbing bends an arc down into the treatment plant. Arcs always come from the dark side.

## 8.6 What visitors look like

- **The patience ring** — a thin Ring depleting clockwise as a visitor waits: full=happy, empty=gone. Three-stage LOD keeps it honest — per-unit ring at Z1/Z2, Aggregate Patience at Z3, lane colour temperature only at Z4. (+4 var)
- **Aggregate Patience** — at Z3/Z4 the ring is replaced by the stream's colour temperature and coherence: healthy is tight, bright and fast; suffering is spread, dim and slow with visible fraying at the trailing edge where the bouncers are.
- **Segment-coded appearance** — costume and colour by customer segment with value as size and glow; the five-channel mapping gives shape=duration class, ornament=value, prop=archetype, livery=business line, ring=patience, and no channel does two jobs. (+3 var)
- **Client avatars and the Suit Gradient** — chunky figures with a nameplate showing MRR, term and a 1-3 bar support-burden headset; hoodie=developer, polo=SMB, blazer=enterprise, hard hat=auditor, broker badge=colo tour, sunglasses=grey tenant, quarter-zip=diligence analyst, high-vis=vendor.
- **The Whale** — literally larger, slower, with a longer shadow and a faint gold tint on everything nearby; rendered as a Diamond token with a slower patience ring and a much bigger bounty, and their shadow pulses when the renewal window opens.
- **Customer faces** — every customer is a tiny portrait with a mood Halo, so a wall of happy faces turning amber one by one during a slow degradation makes churn personal rather than statistical.
- **The conversion moment** — a visitor reaching the goal node performs a small flourish and emits a gold coin mote that arcs to the money counter; it happens thousands of times, so it must be tiny, crisp and never annoying. (+1 var)
- **The bounce** — the patience ring empties, the visitor dissolves into a puff and drifts backward off the board greying, leaving a faint grey mark where it gave up. High-value units always bounce individually at every altitude; everything else aggregates. (+3 var)
- **The false-positive flash** — a defense blocking a legitimate visitor flashes the victim amber, never magenta, and ticks the offending defense; the tick accumulates into a persistent count, and at volume into an amber haze readable from Z3.
- **Word-of-mouth tokens** — a delighted customer emits a small green mote that travels to the spawn edge and returns later with a friend, or splits into a golden duplicate that walks off and comes back as a new signup.
- **Crowd density as a particle field** — below a threshold, discrete entities with rings; above it, a continuous particle stream whose density, colour and velocity carry the same information. At the largest scale visitors are rivers and threats are weather. (+1 var)
- **Latency as literal drag** — packets visibly slow down passing through inspection layers, so a stack of five defenses looks like molasses and the player watches their latency budget being eaten in real time. (+2 var)
- **The queue made visible** — when capacity is exceeded, visitors stack up in a visible line in front of the saturated component and the line's length *is* your queue depth; watching a line form beats any number.
- **Session and duration classes** — page load = a dot, game player = a persisting teardrop, backup job = a growing square, SIP call = a held line between two points, inference = a glowing dot that sits, training job = a translucent block that occupies a cluster.
- **The visitor catalogue** — per-type specs: fast API darts, game players with rubber-banding colour-coded ping numbers, streamers trailing a crowd that leaves with them, DNS drizzle, stamped ACCEPTED/DEFERRED/REJECTED email envelopes, the freight-train backup crate that fails at 94%, the urgent glowing restore crate with a customer waiting at the door, inference bubbles emitting token streams, parked training jobs rewinding to checkpoint pips, unbreakable SIP lines, tour groups with thought bubbles, dial-up busy signals, IoT dust, metronomic blocks, the Support Vampire's accumulating envelopes, the grey tenant's opaque cabinet.
- **Parcels and state bubbles** — customers haul labelled boxes of their data and leave them at the door when you are slow, so visible backlog sits physically on the doorstep; each figure also carries a ping bar, a patience fill and a wallet-glint when paying.
- **The Jitter Stutter-Walk** — served units walk on a metronome beat, and under jitter each figure's steps arrive early or late while still making progress, so smooth-but-late reads degraded and fast-with-stumbles reads destroyed. Packet loss keeps a separate rubber-band teleport.
- **Aggregate demand weather** — at mid zoom the individual need-bubbles merge into district-level fronts of "want fog" that settle over the neighbourhood about to riot; zooming back in resolves them to individual bubbles again.
- **Churn ghosts** — departed customers linger briefly as semi-transparent units at their old desks and sites, and a winback campaign visibly possesses a ghost back into colour, giving retention a place rather than a percentage.
- **The Customer POV cutaway** — click any bouncing customer for a three-second vignette of their loading spinner, their face falling, their mouse heading to a rival; the companion verb follows any customer hero-cam style.

## 8.7 Expressing actions, money, and state

- **Traffic as light** — requests as luminous motes on cables: throughput is density and brightness, latency is speed, queueing is bunching, failure is motes winking out, incorrectness is the Poisoned Tint. One metaphor covers all four failure axes. (+4 var)
- **The queue as physical stacking** — requests pile visibly at a node's intake: a short pile is fine, a growing one is the hockey stick beginning, an overflowing one spills dropped traffic onto the floor. You see the queue before the alert. (+1 var)
- **The red tide / backpressure** — saturation crawls backward along the flow as a red wash one hop at a time with each hop snapping taut (FX_CascadeRipple), paired with FX_SagStrain on the links about to go. (+3 var)
- **Health as colour temperature** — a healthy node is neutral-lit, a stressed one warms toward orange and stays bright, a failing one warms and darkens, a dead one goes grey and unlit. Temperature reads instantly and never needs a number.
- **Money as motion** — coin motes arc in, labelled drain lines run out to each cost sink with thickness proportional to spend, and the balance is a liquid column with a projected month-end line. Big amounts are one heavy coin, not many small ones; losses fall, gains fly; gold for positive, rust for negative, never red. The finance rhythm is a trickle in and four monthly thuds. (+6 var)
- **Coin trails follow cables** — revenue flows along the connection cables into the cash bar, so the most profitable cable on screen is visibly the busiest with gold; revenue gold stays sparse and heavy against cyan's dense and light.
- **Costs as drips** — opex drains continuously as small red droplets falling from each object into a gutter, so an idle server dripping money with no gold flowing in is the clearest possible over-buy signal, and it is per-object and spatial.
- **Depreciation fade** — capex items visibly age over their depreciation life with a small residual-value tag, rendered as warm yellowing rather than desaturation, since desaturation is reserved for urgency.
- **Upsell pop** — a small gold `+$29/mo` floats up from a customer and merges into the MRR bar with a satisfying chime; expansion revenue is the cheapest revenue and the game wants you addicted to it.
- **SLA credit** — a green coin arrives, then immediately turns and walks back out with a little apology note, draining to a specific named customer. Tiny, humiliating and correct.
- **Price increase ripple** — raising prices sends a visible wave across your customer board; most figures shrug, some turn red and start a churn timer, so you watch your decision propagate.
- **Invoice Run Confetti** — on billing day a burst of small green invoice sprites fly from customers to your building; successes convert into coins on arrival and failures turn red and fall into the dunning tray.
- **The business machine, rendered** — diegetic props for the commercial half: the coffee-stained price book with struck-through grandfathered rates, the layered cash column (free gold, deferred amber, barred reserve), the rolling-reserve cage with a 180-day ring, the AR spindle yellowing through 30/60/90, the backlog dock with stencilled install dates, the magnetic pipeline board where stalled deals gather dust, the commission gong and its dull clawback tap, the demand-charge high-water line, the ramp staircase of hollow cabinets, the escrow lockbox and diligence room, the P&L printout whose EBITDA addbacks are peel-off sticky notes, contract clauses as green and red dog-ear tabs, revenue-quality carpet tinting, and the brand street with one shared loading dock. (+8 var)
- **Upgrades visible on the object** — added drives, an extra PSU, a new NIC, a bigger heatsink, more lights; the tech walks over, the unit goes amber with scaffolding, then three signals in one second — a light sweep, the new hardware present, and a spec plate flipping to the new value. (+4 var)
- **The connection-made click** — drag socket to socket with a catenary sag, compatible sockets glowing and incompatible greying out with a reason; on drop a click, a routed tray path, a two-beat green handshake, a settling sag, and the first packet bead. Failures name themselves on the link.
- **Defense firing** — interception, never projectiles: the rate limiter meters, the WAF's lattice sweeps with accept/reject flicks, the scrubber wave leaves only cyan, the firewall's grates slam, the tarpit sinks attackers into amber, fail2ban yanks, IDS only outlines, the blackhole swallows and dims the customer behind it. Every defense also needs a disabled and a mis-tuned look. (+3 var)
- **The sieve** — one image for the entire defensive tradeoff: mixed violet pours in, cyan passes through, magenta is caught and accumulates visibly, and amber false positives fall through the wrong side highlighted.
- **Recovery** — FX_Reseat (slide out, slide back, POST), FX_LightsOn (an LED sequence walking left to right), FX_FleetSync (a config change rippling across a fleet), FX_GhostSolidify (a restored dataset fading from ghost to solid), and cache warming filling from the bottom as the latency graph drops.
- **Degraded mode** — disabled features grey out *in the world*: the recommendation service dims, the search node goes dark, the site preview switches to a simplified layout, so you see exactly what your customers are no longer getting.
- **Failure feedback, in three tiers** — routine is a subtle LED change and a wrench icon, notable is an amber edge vignette plus a toast and an outline, critical is full desaturation, alarm, slow-motion and the bezel rule. Never more than one critical treatment at once.
- **Damage feedback on infrastructure** — a stressed server's fan blur increases and thermal tint rises, and a failing drive slow-blinks amber *before* it dies, so pre-failure warnings are visual rather than textual and the observant player gets a free save. (+6 var)
- **Breaker trip and power events** — FX_BreakerTrip: a snap, a chain of devices going dark in physical order along the circuit, and the amp meter dropping to zero. The most brutal two seconds in the game.
- **Data loss and corruption** — FX_SealDrain (a volume's fill draining as its seal breaks), FX_FrostBloom (ransomware crystallizing across files), FX_RansomOverlay, FX_ForensicDesat (the world desaturates except the evidence trail), FX_DriftPile (bit-rot as accumulating discoloured blocks).
- **The blast-radius preview** — hover a component with the modifier held and everything that would fail with it desaturates to grey with a red outline plus a count: "42 customers · $18,400 MRR · 3 SLA breaches". (+1 var)
- **Before/After overlay for any change** — any change can be toggled between before and after rendering for 30 seconds with metric deltas floating beside it; toggling the WAF to watch the latency ladder grow and the magenta thin out is a repeatable moment of comprehension.
- **The Consequence Fuse** — an action that schedules a future consequence draws a thin slow-burning fuse line to its landing point on the timeline, gold for good and amber for bad; nine fuses burning is a visceral picture of a decision-heavy month.
- **The "It Was Fine" replay stamp** — a fully absorbed threat prints a tiny unobtrusive stamp on the Timeline Ribbon with the damage value, accumulating into a spatial, cumulative record of everything that did not happen to you.
- **The status page as an in-game object** — a rendered customer-facing status page that you actually edit, where writing an honest update versus a vague one is a UI action with a reputation number attached and customers can see it. (+2 var)
- **Alert escalation visuals** — five distinguishable steps each carrying a shape channel: an info dot → an amber pip with a notch → a dashed object outline → a rack tint plus corner flag → a full alert card plus the bezel rule and a red NOC wall. (+2 var)
- **The de-escalation animation** — clearing an alert gets as much presence as firing one: the outline retracts, the tint drains, the ticker line greys and slides down, and the object's light returns to its idle cadence with a soft tick.
- **The quiet moment** — after an incident resolves the game Holds for a beat: alerts clear one by one with soft ticks, colours settle back to neutral, the hum returns to idle pitch, and the camera stops entirely for two seconds.
- **The empty lane** — perfect infrastructure, all green, humming, and no visitors at all; zero reputation rendered as silence and stillness, with one piece of litter blowing across a fully-lit, perfectly-healthy inbound edge.
- **Build satisfaction and the boot sequence** — the ghost solidifies, rails click, the cage nut goes in, power connects, fans spin up with an audible ramp, POST lights sequence, then idle: ten seconds of ceremony for a meaningful purchase, one for a small one. (+3 var)
- **Money number feel** — tabular figures so digits do not jitter, counters that roll rather than snap, a brief scale-up on large gains, a red tick and downward slide on losses. Never a silent instant change for anything that matters. (+1 var)
- **The Money River** — a literal flowing band across the map where inflows join as tributaries, outflows branch off, and the river's level is cash; deferred revenue is an underground aquifer and AR is water still in the pipe. The only proposal that renders *timing*.
- **The Receipt Printer HUD** — a receipt printer by the finance desk prints one paper receipt per money event with length proportional to amount, so a big month prints a physically long, scrollable receipt that is both brag and warning.
- **The Renewal Fork** — the customer path physically splits at a junction: renewals walk back into your campus with a green pulse, churners exit through a door with an MRR-counting ticker, and poached units leave with tiny competitor flags planted on them.
- **Silver motes — cost avoidance as a second currency colour** — blocked-attack savings drop silver motes beside gold revenue in the same coin physics, making security spend a watchable stream; must be adjudicated by whichever hue table is published.
- **East-west traffic is visible** — interior motes between web, DB and cache proportional to real request flow, so a web shell shows as a black mote walking a DB path no legitimate flow has ever used; lateral movement is tendrils crawling your own cables and "isolate" becomes a spatial cut line.
- **Contract Cables** — wires run from contract nodes to the infrastructure satisfying them, glowing steady when satisfiable, flickering amber when margins thin, arcing sparks at SLA risk, and snapping with a burst of paperwork on breach. Concentration risk is how many cables land on one box.
- **Defeat teaches — the forensic aftermath** — chalk outlines, tape Xs and numbered tent cards persist on the scene until someone walks over and closes them; after a loss the screen freezes into a forensic diagram with markers on root-cause nodes and a dotted kill path.
- **Outage weather and the reputation sky** — company health paints the sky: a sunny campus when clean, dark clouds over the rack you broke, lightning and a literal red 503 sky at full outage. Money weather adds coin-clouds, drizzle, hail and a calm golden hour at the win.
- **The building reads your progress** — the HQ acquires additions as you unlock (cable management → glass partitions → biometric doors → mezzanines → a rooftop chiller forest); certifications mount as physical badges, and regulated customers pathfind toward the signage.
- **The Graveyard of Neglect** — churned customers are buried as tombstones at the map edge with nameplate and reason ("took too long", "got 503'd", "rival was cheaper"); decommissioned buildables are hauled to a visible corner and churn-led levels go ghost-town dark.
- **Competitors live across the street** — rival hosts as actual storefronts with price-sign placards, customers visibly comparison-shopping at the intersection, and a race to the bottom ending with both of you in a strip mall.
- **The Org Chart as a Living Tree** — staff buildables grow your company org chart on a side board; when someone resigns through burnout or poaching their node dims and any towers that depended on them visibly lose skill.
- **The Motivation Wall** — the break-room wall accumulates framed milestones: certificates, first-postmortem prints, the day-1 sticker from your oldest asset's boot, and team photos that grow with headcount. Seen in passing, never a screen.
- **The self-updating war room** — an in-world whiteboard that sketches incoming threats, strikes through mitigations as they land and doodles fire-drills when idle; the meta-space lobby hosts the R&D whiteboard, contract signings and chatting staff.
- **The QBR Boss Aesthetic** — the quarterly business review staged as a boss encounter: the customer's CIO, security officer and procurement at the table with gauges showing *their* experienced numbers. Survive for renewal plus expansion, fumble and the enterprise convoy reverses.

## 8.8 UI and HUD

- **The HUD skeleton** — top bar vitals, left build palette, right inspector, bottom ticker/alert stack/pulse strip/hum bar, centre world, bezel for off-board state; plus a permanent "Now" strip holding up to three active decisions.
- **The Screen Budget** — at 1920×1080 the world keeps ≥66% of screen: top bar 48px, left palette 220px collapsible to 56, right inspector 320px closed by default, bottom furniture 120px total. Ultrawide gives extra width to the world, never to panels.
- **The Bezel HUD / the Instrument Bezel** — the viewport frame promoted to an information surface: a 10px inner border carrying off-board threat state, the active overlay's tint, the worst-severity rule and the pressure lip. (+4 var)
- **The Panic Layout** — during a klaxon incident the HUD auto-simplifies: the build dock collapses, the incident-cost meter goes big, the triage board is one key away, everything non-essential dims 60%. (+2 var)
- **The Top Bar — the Vitals** — company mark, cash plus delta and runway, MRR spine, Threat Mass Bar, uptime nines water line, reputation sky swatch, time dial, per-line gauge slot. Threshold-driven: two flexible slots promote whatever is nearest a threshold. (+3 var)
- **The Bottom Dock — the build bar** — buildables as physical product tiles with price, power draw and U-height; locked items are censored silhouettes that tease the tech tree; a radial menu at the cursor for speed.
- **The Tradeoff Bar on every build card** — a two-sided horizontal bar, capability right in cyan and cost-of-capability left in amber (latency plus friction plus surface); an empty left side is visual proof of a broken buildable.
- **The Cost Ghost (lifetime cost, not sticker price)** — hovering a build shows two equally prominent numbers: purchase price and "$X over the rest of this level" covering upkeep, power, licence and expected support load. The second is usually bigger.
- **The Compare Tray** — drag two or three build cards into a bottom tray to align their Capability, Cost, Upkeep, Latency, Friction and Surface rows with deltas called out, turning the catalogue into a decision tool.
- **The Right Panel — the Inspector Faceplate** — one layout for every object: header with status chip, a faceplate rendering, live stats, the attack-surface rose, connections, config sliders, upgrades, actions, a mini log — plus a Truth tab where the disagreements live.
- **The Left Rail — the Alert Stack** — newest on top, grouped by object and cause, each with a world thumbnail, a one-line cause and an assign-a-hand button; silenced alerts stay visible but greyed, and a signal-to-noise bar dims the whole stack when it stops earning attention. (+3 var)
- **The Bottom Strip — the Rack Ribbon and the Ledger Tape** — one 120px band holding every rack as a thin vertical state column plus a receipt printer paying out money events as they happen.
- **The Site Preview Window** — a small mock browser, game client, mail client or phone showing what a customer is experiencing right now: slow rendering, error pages, degraded layouts, the ransom note. Re-skins per hosting type, picks a specific customer, offers four vantage-point tabs, a competitor pane and the enterprise client's own monitoring view.
- **The Pulse Strip** — a compact sparkline-plus-colour band of the last N minutes of system health, carrying a faint ghost band of the same period yesterday and last week so "is this normal" is answered by comparison.
- **The Hum Bar** — a ~6px room-tone strip whose baseline height is fan load and texture is the sound's character, with named event marks: a rising wedge for a fan ramp, a hard notch for silence, a comb for drive click, a spike for a breaker snap.
- **The overlay wheel and its discipline** — one overlay at a time with exclusive palettes and a border tint naming the lens: Power, Thermal, Airflow, Network, Security, Money, Per-Customer Profitability, Tenant, Age/Warranty, Dependency, Blast radius, Noise, Maintenance debt, Elevation-vs-reality, Policy. (+3 var)
- **The Policy Layer view** — a toggled view showing intent rather than state: armed automations as ghost figures, standing rules as translucent tethers, the shed-order as numbered tags on traffic classes, scheduled actions as faint timeline objects.
- **Visual grammar for "not built"** — unbuilt-but-buildable infrastructure appears as faint construction-line ghosts where it would go when the relevant overlay is active: the empty U for a second LB, the blank wall for a generator, the missing second transit arc. (+1 var)
- **The incident ticker** — timestamped plain-language one-liners scrolling at the bottom; narrative during an incident, atmosphere and foreshadowing in peacetime, and every line clickable to Snap the camera to its subject. (+2 var)
- **The Unified Clock Ribbon (Timeline + Obligation Rail, merged)** — one scrubbable strip with "now" in the middle, history left and obligations right, on ops and business tracks; the three nearest or most consequential pips enlarge and take colour while the rest stay small grey ticks.
- **The graph drawer and the Graph Specification** — a pull-up drawer of unlocked graphs in one house style: p50/p95/p99 bands never an average alone, a last-week ghost line, deploy and incident annotation pins, a shaded SLO band, and a "no data" state visually distinct from zero.
- **The Telemetry Resolution zoom** — grabbing a graph's time axis and zooming the timebase resolves a flat green line into a forest of spikes that were always there; discovering your calm average hid a sawtooth should be a genuine gasp.
- **The Demand Ratchet marker** — on the power graph, one spike with a horizontal line drawn from it to the right edge of the year, labelled with what it costs every month. One visual explaining a whole tariff structure.
- **"Explain This Number"** — every figure in the game is clickable and returns a card with the formula, the inputs and where each input came from, with those inputs themselves clickable. Also the Field Notes delivery mechanism.
- **The Diff View** — any two moments, configs or objects diffed side by side with changes highlighted in a dedicated diff colour outside the semantic palette; config changes show a red/green diff before applying. (+1 var)
- **The dependency map** — a generated graph of what depends on what, including dependencies you did not know about and discovered via traffic analysis; watching it fill in as observability grows is the progression visual.
- **Sparklines everywhere** — every component carries a tiny 60-second sparkline of its key metric, so at a glance you read shape rather than only state.
- **Group / meta-nodes** — "Web Tier ×40" as one object with a count badge and a health distribution bar (34 green / 5 amber / 1 red), expandable to individuals. How a 10,000-node estate stays playable.
- **Growing tooltips** — tooltips get richer as your knowledge does, from "some kind of bot" to full behaviour, weakness and your history with it; build cards likewise accumulate your utilisation and incident record.
- **The hover-card contract** — every hoverable thing shows the same four regions: identity, current state, relationships, what you can do; plus monthly cost/revenue/net contribution and a closing "what is this currently vulnerable to" line.
- **The "Why Did I Lose Money" button** — one click produces a ranked plain-language list: "1,240 visitors bounced (too slow) · 310 blocked by your WAF · 88 capacity refused · $4,100". The game must always explain itself in one screen.
- **The minimap, the NOC wall, and the Money Minimap** — a schematic minimap that at high tiers becomes a diegetic wall of screens; as an Object of Record it must have a flat equivalent on `M`. Tinted by the active overlay, with a Money Minimap showing revenue density instead of geography. (+6 var)
- **The Ledger Drawer** — a physical ledger binder that pulls out with tabs for P&L, Cash Flow, AR Aging, Per-Line Margin and Cohorts; numbers feel better when they live in an object.
- **The Drawer System** — Sales, Support, Abuse, Finance, Capacity and Compliance drawers slide up from the bottom with badge counts, so a player under pressure watches their departments light up red in sequence.
- **The MRR Waterfall Widget** — a live four-segment bar (New green, Expansion bright green, Contraction orange, Churn red) filling and draining across the month; the densest, most satisfying single widget available.
- **The Cash Calendar** — a 30-day strip with known inflows (invoice run, enterprise payment) and outflows (payroll, power, lease, loan) as green and red pips; watching payroll approach while the enterprise payment slides right is cheap tension.
- **The Runway Bar** — drains in real time, turning amber at six months, red at three, and starting a soft heartbeat under one. Money is never abbreviated below $10k, which matters exactly here.
- **The Funnel Column** — a vertical stack from Impressions → Clicks → Leads → Orders → Provisioned → Paying, with each stage's drop-off rendered as visible particles spilling out the side. Losses are animated, not just counted. (+1 var)
- **The Cohort Wall / Cohort Grid** — the classic cohort triangle as a grid of cells that fade as each month's customers churn; a steep fade is viscerally wrong in a way a percentage never is.
- **The Contract Gantt** — a horizontal timeline of every contract's remaining term sorted by value, with renewal windows glowing; a whale's bar ending in four months is impossible to ignore.
- **The Renewal Calendar** — the business layer's wave telegraph: upcoming renewals laid out as a forecast, so the commercial side gets the same "you can see it coming" treatment as the technical side.
- **The SLA Meter** — a per-contract meter showing uptime against commitment, turning red and counting money upward during an incident. Credits stay small and projected churn risk large, because counting credits alone teaches that outages are cheap.
- **The Concentration Donut** — a donut chart where one enormous slice is instantly legible as the risk it is; ship two, revenue by customer and revenue by line of business, since line concentration is less obvious.
- **The Obligation Rail / the Commit Ledger** — a horizontal rail of upcoming commitments — payroll, invoices due, SLA windows, audit deadlines, renewals, 90-day-lag consequences — turning the future into a visible object.
- **View filters: Money / Risk / Customer** — three lenses tinting the same board by revenue contribution, risk exposure, or affected customers; the customer lens during an incident is the one that changes decisions.
- **The ticket queue panel** — a stack of tickets with age colouring, sentiment icons and the customer's value shown; the pile growing while you are inside an incident is the truest thing in the game. (+3 var)
- **The DR Declaration board** — for DRaaS: a physical board of customer name cards flipping from green STANDBY to red DECLARED with timestamps, while the capacity bar at the bottom fills during a regional event.
- **Dead Air** — for playout and streaming: one enormous unmissable black frame with a silence meter and an always-on countdown labelled TIME TO DEAD AIR. The restraint is the point.
- **Time-of-day lighting and the Diegetic Clock** — office and world light shift through the day and 3AM is dark, blue and lonely; a facility wall clock plus a shift indicator is how you read time, which affects staffing and traffic.
- **Diegetic meters** — amp meters on PDUs, temperature gauges on CRACs, a wall-mounted bandwidth graph, a storage fill gauge, the generator fuel gauge, the UPS water-line; each an Object of Record with a flat twin and Readout Mode. (+4 var)
- **Notification discipline** — interruption is a budget with a declared channel per system: ticker line for ambient, pip or badge for state, alert-stack card for actionable, modal for sev-1 only and never more than one.
- **Tutorial-free onboarding** — teach with events and a 2-second looping textless micro-demo in the hover card's top region, authored as a tiny isometric vignette; ~60 of them at 200×120px in one style is what makes it affordable.
- **The Attention Heatmap** — a post-level overlay showing where the camera actually spent its time laid over where incidents actually occurred; players discover they watched the interesting rack while the boring one failed.
- **The Regret Marker** — during the postmortem replay the game places two or three numbered markers at moments where a different action was available and would have mattered, with the cost of the road not taken. Never during play.
- **The Scale Bar and the Unit Stamp** — every meter carries a permanent unit stamp (kW, Gbps, ms, TB, req/s, $/mo) plus a familiar-comparison tick: "1 MW ≈ 750 homes", "11 nines ≈ one lost object per 10 million years".
- **Quiet Mode and Packet Mode** — two supported ways to play: Quiet Mode hides all combat VFX and shows only the commercial layer, Packet Mode hides the money and shows only the technical layer.
- **The Player Character Question** — you are the cursor and the clipboard: the selection reticle, the flashlight cone, the hand tokens at the bottom (also the Hands resource's visual), and a desk that accumulates a mug, a pager, a photo, a plant.
- **Diagram export** — export the Wiring Mode view as a clean Ink Blue blueprint image with your company name and mark in the title block; free marketing and a genuine player-pride feature.
- **The Two-Second Rule for Every Screen** — any panel opened during an incident must yield its primary answer within two seconds, or be restructured until the answer is at the top in the largest type. Enforced by stopwatch playtest.
- **The Uptime Ring** — a top-centre ring breathing once per healthy second and stuttering on downtime, its colour and rhythm shifting per act palette. Ships instead of the uptime nines water line, never alongside it.
- **The Attack-Surface view** — every listening port rendered as a glowing door on your building with forgotten open ports the *brightest*, so neglect renders as light; objects emit a halo sized by enabled services.
- **Countdown rings and ticking props** — every timed system uses a shrinking ring in the item's own colour: ransomware timers, SLA hourglasses, TTLs, generator warmup, cert expiry with a seal-stamp on renewal, the Runway Hourglass frosting near empty.
- **The Corner-Zone HUD Constitution** — fixed zones so peripheral vision can be trained: money top-left, uptime ring top-centre, pager bottom-right, tickets left-middle, minimap top-right, nothing floating mid-screen but incident-command cards.
- **Edge-cue arrows with heraldry** — off-screen threats get edge arrows carrying their family sigil plus a 1-3 pip distance ring for near/mid/far; silent, no audio spam, and colour-blind-safe by sigil.
- **The Ribbon-of-Realms edge meter** — the map edges carry a thin animated border: the market side shows incoming customer density as a golden tide-line, the internet side shows threat density as a churning red line.
- **The Wave Clock** — the next-wave timer as a physical corner clock or modem-handshake dial winding down, with the final five seconds ticking audibly and synced to a pulse on the approach lane.
- **Cursor personality** — dial-up is an hourglass-and-hand, colo a cable-tester probe, regulated a rubber stamp, GPU a laser level; and mode-uncertainty is answered at the cursor with a wire spool, wrench, magnifier or red-X.
- **The Dark-Pattern Radon Meter** — a Geiger-style clicker in the regulator corner rising with every cancel-maze, egress toll or dark pattern enabled; at threshold an inspection walks in. The player hears themselves drifting.
- **The Quadrant Plot (the satire HUD)** — a framed 2×2 wall chart of execution ability against completeness of vision with your dot drifting as analyst events land, clickable for notes in dry consulting-speak.

## 8.9 Readability at scale

- **Aggregate, don't shrink** — entities merge into one glyph with a count and worst-state colour, never into tiny unreadable versions; the aggregate must carry count, worst state, count of non-nominal members, a trend arrow and whether anything inside is pinned. (+2 var)
- **The Aggregate Glyph** — a rack summarizing 40 servers draws one glyph: a 40×1 vertical bar chart of its servers' states, a literal sparkline made of your fleet and readable at 12px.
- **Heat Tiles over Sprites** — at Z3+ individual state dissolves into per-rack tile colour, turning the floor plan into a low-res image of company health that the eye scans well; with the Money overlay, of margin.
- **The Fleet Sparkline Wall** — an optional Z3 overlay rendering every rack as a small sparkline of its last five minutes; 200 tiny graphs are very readable when identical in shape and you scan for the odd one out.
- **Anomaly highlighting, not status highlighting** — at scale, colour by deviation from each object's own baseline rather than by status, since everything would be green; a rack that is fine but weird is the one you want to see.
- **Roll-Up Rendering** — beyond a zoom threshold individual servers merge into a single row object inheriting the worst member status and displaying aggregate MRR and utilization, so you never lose the ability to read the money.
- **Aggregation badges** — a rack shows "3 warnings" rather than three tiny icons. Never three tiny icons.
- **The colour budget** — three alert colours on screen maximum, allocated by severity, per the Readability Budget and the Alert Triad Rule.
- **Alarm propagation and worst-state-wins** — you cannot hide a problem by zooming out; every aggregate inherits the worst state beneath it.
- **Row rhythm and floor signage** — consistent row spacing, aisle numbers painted on the floor, rack labels at cabinet tops, and hot/cold aisle hints in the floor paint. Real datacenter wayfinding, solving the same problem. (+1 var)
- **Tenant tinting** — a low-saturation band on the cabinet frame only, from a muted 12-hue set distinct from the semantic palette; beyond 12 tenants the game switches to initial-lettered nameplates rather than inventing hues.
- **The Heartbeat Sync** — every idle pulse, LED blink and flow pulse synchronizes to one global ~0.5Hz heartbeat so the room breathes together, which turns desynchronization itself into an alarm channel.
- **The Cadence — rendering "nothing is happening" as an achievement** — when everything is inside its dependency contracts all flow pulses synchronise and the room visibly breathes together; one object out of contract breaks the sync visibly before any alert fires.
- **The Quiet Frame Test** — a screenshot of a healthy system must be calm: low contrast, slow motion, few colours. If a healthy screenshot looks busy, nothing loud can ever mean anything.
- **The Loud Frame Test** — a peak-crisis screenshot must let a stranger answer in five seconds what is broken, what is worst, and what to do now; and it must contain exactly one obviously most-urgent thing.
- **The Thumbnail Test** — a 128px thumbnail must answer which hosting line this is, what tier it is, and whether it is okay right now; cheap, ruthless, and it directly serves the thirty-distinct-types promise.
- **Auto-LOD collapse and label culling** — labels are ranked by importance and culled from the bottom as density rises, with the selected object's label always surviving; never clip, overlap or shrink below legibility. Budget 30 labels at Z3.
- **The readability targets** — legible at 2,000 discrete objects and 20,000 in-flight entities at Z3, on 1080p, at 2× speed, for a player who has not looked there for 60 seconds. Aggregation kicks in at 40 entities per glyph.
- **Zoom tiers change the metaphor** — Z1 is a machine, Z3 a diagram, Z4 a map; the transition animation teaches they are the same thing, and the selected object's screen position may never move across it.
- **The Squint Test as Ritual** — any mid-to-late screenshot squinted at must answer "where's money, where's trouble, what's failing" in three squints, enforced by an auto-dim pass that keeps the three brightest things the largest money flow, the worst failure and an incoming boss.
- **Function Grouping Brackets and Neighbourhoods** — selection brackets cluster same-role services so a bracket flickers as a unit when attacked; neighbourhoods give each logical group a shared floor-tile tint whose colour shows aggregate health.
- **The Importance Halo and the focus assists** — anything on the critical customer path or under active attack gets a subtle under-glow while the rest recedes; implemented as screen-space edge-glow outlines, which cost nothing and never occlude at 2,000 objects.
- **Focus dimming — may desaturation carry attention? — *CONFLICTING*** — which channel pushes the irrelevant world back. ⚔️ Desaturation is reserved for urgency so focus must use contrast and value, vs a global 15-30% desaturation pull as the only read strong enough at 100+ entities.
- **Ghost of Uptime Past** — yesterday's traffic renders as a translucent ribbon beneath today's, making "am I growing?" answerable at a glance in the world rather than in a chart.
- **Seismograph Radar Blooms** — attacks announce themselves as concentric ripples from their entry point propagating along the cabling and arriving just before impact; ripples are layered per family, so a flood is a wide slow wave and an exploit a tight fast ping.
- **The Wireframe Census ("flow mode")** — a held key dims all entities to their paths and streams, leaving only warm customer currents and red threat eddies; it subtracts the substrate rather than adding a dimension, so it costs no overlay budget.

## 8.10 Per-type and per-era visual identity

- **The Business-Line Skin System — the Five-Asset Skin Kit** — each line ships five bespoke assets: signature meter, visitor form, hero silhouette, palette, and a catastrophe FX plus ambient sound. Meter first — if you cannot name the meter, the type is a costume not a ruleset. Everything else is a parameter of a shared system.
- **The required five-field catalogue format** — every line fills `palette (2 hex + material)`, `hero silhouette`, `visitor costume`, `signature meter`, `ambient FX + sound`, plus density signature and arrival rhythm, which carry the most identity per pixel.
- **The Hero Object Rule** — every level must have one object worth a screenshot; design the level around making the player build it and then look at it. It is also the subject of the Signature Frame and key art.
- **The HUD Swap Per Type** — the top bar's gauge slot is the "what this business cares about" slot: accounts and abuse for shared, power and cooling for colo, hit ratio for CDN, RPO/RTO for backup, $/GPU-hour for GPU, tick rate for game hosting.
- **The Cross-Business Facility** — the facility is visually zoned by Identity Kit and the HUD gains a business-line selector that dims the other zones and swaps the specialized gauge, making your company's messiness legible.
- **Multi-line districts** — each line occupies a visually distinct district with its own floor paint, lighting, density and material language; you should name the business from a single frame with the UI hidden.
- **The Business Line Placard** — a mounted placard per line with name, icon, palette swatch and start date; multi-line companies get a wall of them, and divested lines get theirs turned to face the wall.
- **Cross-line collision control** — on shared screens palettes drop to their dominant hue at low saturation on the substrate, and the Flow layer stays globally neutral: districts colour the building, never the packets.
- **Density signature** — shared hosting is crowded, dedicated sparse, wholesale nearly empty, crypto absurdly overpacked, edge tiny and many, tape tall and still. Density alone identifies a line from a thumbnail.
- **Visitor rhythm signature** — DNS is a constant fine drizzle, game servers arrive in evening waves, backup in a nightly burst, colo once a quarter in a suit, blockchain on a metronome, email as a morning spike and long tail.
- **Material and lighting language per line** — shared is plastic and fluorescent, colo steel and mesh, GPU copper and liquid and orange, tape matte black and barcode white, regulated clinical white. Only albedo, roughness and one accent emissive may vary.
- **Per-line visual identities — the catalogue** — Identity Kits in shorthand for ~35 lines: the shared-hosting apartment block, VPS nested translucent tenant cells, colo's frosted opaque cages you cannot see into, wholesale's empty build-to-suit pads, the game-server tick-rate oscilloscope, VoIP's Frayed Line, email's stamped envelopes, DNS drizzle, the CDN world map with gold peering shortcuts, the tape ballet, TIME TO DEAD AIR, GPU's kW meter and thermal shimmer, serverless blooms, DBaaS replication rubber band, bulletproof's police-scanner heat gauge, regulated's audit-readiness dial, dial-up modem banks, the satellite dish field, the WISP Fresnel ellipse, edge's 80-pip site board, IoT's ingest weir, blockchain's sync-height gap gauge. (+23 var)
- **Era presentation shifts** — each era re-skins UI chrome, palette, typography and materials: 1995 beige plastic and CRT green, 2005 brushed aluminium and gloss, 2015 flat and dark mode, 2025 liquid cooling and glass. The Comic Sans gag stays on in-world signage only.
- **The Chrome Skin Token Set** — an era changes exactly four tokens — typeface, corner-radius, surface and accent — while layout, hierarchy, iconography and spacing never change, so the player never relearns where anything is.
- **Era UI skins, enumerated** — 1994 text-mode box-drawing, 2001 Win95 grey with bevels, 2008 glassy gradients and rounded corners, 2016 flat with generous whitespace, 2030 translucent dark panels with subtle blur. Same layout, different skin.
- **The era kits (art bible notes)** — the set dressing that dates a frame: the 1990s kit of beige plastic and ribbon cable and a fax machine, the 2000s blue-LED and KVM crash-cart kit, the 2010s containment-and-Nagios-wall kit, the 2020s liquid-manifold and busway kit, and a Near-Future kit whose theme is the absence of people.
- **The Era Transition Animation** — between eras the camera holds on your facility while palette, chrome, silhouettes and typography crossfade forward a decade; the old cables and stickers survive the fade, which is what makes the era feel earned. (+1 var)
- **The signature-motion set** — one memorable motion per line: the Frayed Line, the Busy-Signal Lamp, the Tape Ballet, the Heat Shimmer, the Pod Reschedule, the Serverless Bloom, the Propagation Wave, the Weir Overtopping, the Fork, the Split-Brain Seam, the Truck Roll, the Capped Pipe, the Declaration Flip.
- **The Skin Preview Room** — a gallery where unlocked lines appear as dioramas you can walk the camera through; doubles as the Company Museum and as where a player decides what business to start next.
- **The Signature Frame** — each line has one canonical camera angle used for loading screens, the placard, the level-select card and the score screen, so the game's variety is legible in menus where players actually perceive it.
- **Weather and place at Z4** — regional weather affecting satellite and microwave links, storms approaching a facility, time zones showing which site is on night shift, latency arcs between sites, and the Window showing local weather from inside.
- **The Two-Screenshot Test** — two screenshots from two hosting types shown to a four-hour player, who must name both; failure means that type's Skin Kit needs a new asset, usually the signature meter or the density signature.
- **Cross-Act Palette Guardrails** — environment palettes rotate per act but the colour contract and overlay coding never do, so a regulated-white level still screams magenta on intrusion. Tested by lining up one screenshot per act.

## 8.11 Audio

- **The three-bus rule** — three buses with separate sliders: Ambience (hum, fans, drives — continuous telemetry), Signals (pagers, breaker snaps, beeps — discrete, prioritised, accessibility-critical), Score (optional). Signals always duck Ambience.
- **The datacenter hum** — a continuous bed whose pitch and volume track load, composed of five separable voices — fans (load), drives (I/O), CRAC (thermal), UPS (power state), room tone (occupancy) — so a trained player hears *which* voice changed. (+3 var)
- **The fan-row unison ramp** — one fan ramping is noise, forty ramping together is a thermal event, and the sound arrives before any graph moves because fans respond to inlet temperature in real time.
- **The silence of power loss** — when utility fails everything stops: a moment of true silence, then the UPS whine, then the generator turning over. Silence as an alarm is unforgettable.
- **Fan spin-up and thermal audio** — a rack heating produces a rising unmistakable whoosh, emergency full-speed fans are genuinely alarming, and FX_FanSpindown is the melancholy counterpart on shutdown.
- **The drive click of death** — a failing drive clicks characteristically when you are zoomed near it, so a player who investigates the sound saves the array; captioned with position as `[drive click — rack 4, bay 7]`.
- **The beep** — the real, hateful, unmistakable chassis alarm beep; muting it is a button that does not fix the problem, which is a joke and a mechanic in one control.
- **The breaker snap** — a single sharp crack followed by silence in one part of the room, rendered on the Hum Bar as a spike with a lightning glyph.
- **The relay clack and the genset** — a satisfying mechanical clunk when the ATS transfers, telling you before any indicator moves; then the diesel crank-cough-roar and the warm light returning with it.
- **Drive seek chatter** — heavy I/O produces audible seek chatter and a RAID rebuild has its own sustained signature, so you can hear a backup running.
- **Pager tones and severity** — distinct tones per severity with a sev-1 tone that raises your pulse; at 3AM it plays over near-silence, which is the whole on-call experience in one design choice.
- **The noise problem** — in the hot aisle at Z1 the ambient is loud enough to mask the pager cue and staff wear ear defenders, so you miss the page because you are standing in the room the page was about. Used once.
- **The cash register rhythm** — conversions tick pleasantly so you can hear your conversion rate; payday is heavier, an SLA credit is a sour note, the commission gong rings on a close and taps dully on a clawback. (+3 var)
- **Threat audio signatures** — a volumetric flood is a rising roar, a scanner a rhythmic ping sweep, ransomware a crystalline shatter, brute force a patter, under-attack mode a low drone. A mimic is silent, and its silence is a Hum Bar notch. (+1 var)
- **Per-line sound palettes** — tape libraries clunk and whirr, dial-up has handshakes and busy signals, GPU halls have pumps and roar, colo has badge beeps. Every line's bed must leave the same frequency band free for alert tones. (+2 var)
- **The other named sounds** — the modem handshake, the dot-matrix printer, the receipt printer, the badge beep, the coin chime, the cage-nut ping, the connection-made click, the suppression discharge and the silence after it, a single ringing phone. (+1 var)
- **Audio as visual redundancy, and visual as audio redundancy** — every critical visual alert has an audio counterpart and vice versa, and the game is fully playable with either channel off; the Hum Bar and EQ strip extend this from discrete alerts to continuous ambient telemetry. (+3 var)
- **The Ops-Mix score track** — the score is the telemetry: percussion is the active ticket stack, strings are MRR growth, dissonant brass is under attack, and ransomware ducks the whole mix to a heartbeat.
- **"Money Has an Orchestra"** — each customer archetype is an instrument (bloggers pizzicato, SMBs woodwinds, gamers chiptune, whales brass, GPU jobs a synth drone), so churn deletes notes and an outage leaves an audible hole in the mix.
- **Traffic choreography** — waves arrive in rhythm with the level's score, so Black Friday crescendos and quiet nights are literally quiet; the Wave Clock's final five ticks land as music rather than as a beep.

## 8.12 Presentation moments and the effects catalogue

- **The Cold Open** — the Drop shot flies from world map through the building down the aisle to your rack as the HUD assembles; full on first visit to a level type, abbreviated to 3s after, skippable on the first frame.
- **The Wave Telegraph** — the horizon glows, the hum drops, the radar fills, the forecast escalates and the bezel's off-board register lights. Reserved for volumetric and scheduled events only, which is what makes it mean something.
- **The Save** — half a second of slow-motion as the scrubbing wave passes and the flood dissolves; fires only when a threat dies with under 8% of the affected resource left *and* the player acted within 6 seconds. Cap ~2 per level.
- **The 100% Uptime Stamp** — a heavy rubber stamp slams onto the month's report; the same stamp instrument serves three uses (grade, uptime, audit seal) for one animation.
- **The Night Shot** — at 3AM, lights low, LEDs the only illumination, the hum at idle, a single desk lamp on; the game's wallpaper, generated from your own build.
- **Loading screens as rack diagrams** — rack elevations, network diagrams and spec sheets with real ops advice as tips; better still, Loading Is Provisioning — a live bring-up sequence of POST, link negotiation, service start, health check.
- **The Credits Rack** — credits presented as labels on a rack elevation, scrolling as the camera pans down on the Pullback shot.
- **Transition wipes by meaning** — blueprint wipe = planning, dust-sheet wipe = ending a facility, iris on a rack = zooming into a specific thing, fade to black = era change, paper slide = a document opening.
- **The juice moments worth budgeting for** — the first customer signing, generator transfer under load, a cache going warm, a clean failover, the quarter-end tally counting up, a verified restore stamping green, the whale signing, the first cross-connect landing.
- **The particle vocabulary** — twelve reusable systems: sparks, magic smoke, steam, dust, glass shards, paper, packing foam, gold flecks, cyan motes, magenta grit, white fog, water.
- **The FX catalogue** — 24 named effects split Ambient (unbudgeted) vs Event (5 concurrent max), each shipping a reduced-motion equivalent so the table doubles as the accessibility translation layer. FX_Deflect — a threat being blocked — is the most frequent effect in the game and was missing from wave 1.
- **Signature moments — the ceremony set** — the breach as one glitched frame plus a low thud, downtime as the lights literally going out, success as an LED happy-dance, halon theatre with single-file evacuation, ransomware padlocks creeping in from the screen edges, and the Restore Resurrection light shaft. (+3 var)
- **The Attack Cut-in** — the first appearance of each threat type per level freeze-frames into a full-screen bestiary card with a hand-inked one-line callout, then snaps back to play. One per encounter, like a monster-movie reveal.
- **The Failure Cinematic** — a breach is a slow dolly through your racks as the lights die one by one, with the APT silhouette strolling past carrying your database like a briefcase; an outage is pitch black except one chirping UPS.
- **Growth shots and the act-boundary assembly** — every scale-tier promotion gets a one-take pull-back revealing the whole facility; at act boundaries it becomes dollhouse → city → globe while your entire set assembles itself on screen.

## 8.13 Animation and motion language

- **The Breathing LED** — a 1.6s sine breath on healthy green LEDs with a small fixed per-unit phase offset, so a rack shimmers gently while the beat stays shared; a unit drifting *off the beat* is the anomaly.
- **Fan Blur Ramp** — fans are three blur states — slow, fast, screaming — so rack noise level is readable purely visually, and a room going slow-to-screaming during a heat event is the best ambient alarm buildable.
- **Idle Fidgets** — staff drink coffee, check phones, lean on racks, carry a box; cables sway in airflow and dust drifts in light beams. Lives on the background plane at reduced contrast, excluded from the Motion Budget. (+2 var)
- **The Anticipation Budget** — every action gets a 3-5 frame pre-motion: a server slides back before sliding in, a cable pulls taut before connecting, a coin dips before flying, a stamp lifts before it slams.
- **Screen Shake Budget** — shake reserved for exactly four events: generator start, breaker trip, seismic, a whale signing. Everything else uses a flash or vignette; in Reduced Motion every shake becomes a 4px settle.
- **The screen-shake rule — *CONFLICTING*** — two incompatible budgets for the same effect. ⚔️ Shake allocated by event identity (four whitelisted events only) vs by magnitude (2/6/12px tiers on every hit, governed by a rate limit).
- **The Flash Language** — three one-frame flashes, never mixed: white = something was created or served, red = something was hit, blue = something was identified. Bounded by the Strobe Budget.
- **Motion identity beats colour identity** — two lines with the same palette but different density and arrival rhythm are more distinguishable than the reverse; motion survives every zoom, palette and accessibility mode, so author rhythm first.
- **The de-escalation language** — recovery animations share the quiet moment's language at every scale, so an alert clearing is as legible as an alert firing.
- **Animation as the explanation** — never explain a behaviour in text if you can show it in motion: a threat's behaviour is its motion primitive, a defense's function its verb, a failure's nature its collapse. Text is the fallback.

## 8.14 Accessibility, colour-blind safety, and redundant encoding

- **The Two-Channel Law, enforced** — no information by colour alone, with a greyscale pass promoted from an option to a production sign-off gate for every unit, overlay and alert state. (+3 var)
- **Contrast Audit Mode** — a mode rendering the screen as luminance only to verify everything stays distinguishable without colour; shipped as a player option too, since some will prefer it. (+2 var)
- **Three colour-blind palettes, named** — Deuteranopia/Protanopia (magenta→deep orange-red, green→blue-white, amber→yellow-white, shape weight +25%), Tritanopia (cyan→grey-blue, gold→pink-red, violet→dark teal), and Monochrome + Shape-First carrying all encoding in shape, pattern, stroke and motion.
- **Colour-blind-safe money** — money uses shape as well as hue — coins, droplets, receipts, invoice slips — so income, outflow, receivables and bills are distinguishable with no colour at all.
- **The Strobe Budget** — a hard engine rule of no more than 3 luminance transitions per second across more than 25% of the screen, plus a Reduced Flashing mode converting every flash FX from a published table. A legal requirement in several markets. (+4 var)
- **Reduced Motion mode** — every animation has a static or minimal-motion fallback: brightness steps instead of sine breathing, static particles, border flashes for shakes, cuts for camera moves, an instant Room/Board swap. The FX catalogue's reduced-motion column is the published table.
- **The Hum Bar** — the room-tone strip that makes ambient audio telemetry visible and gives audio a scrubbable history, which benefits hearing players too.
- **The visual EQ strip** — the hum's five separable voices (fans, drives, CRAC, UPS, room tone) rendered as five bars: a trained player hears which voice changed, a deaf player sees which bar moved.
- **Diagnostic audio captions, with location** — an optional caption line for diagnostic sounds only, carrying position: `[drive click — rack 4, bay 7]`, `[breaker snap — circuit A3]`, with a directional arrow. Location is what makes the Beeping Server minigame playable at all.
- **Readout Mode** — every diegetic gauge, Object of Record and instrument switches to a plain numeric readout, a number and unit in the Chrome face, flat and frontal. The diegetic version is pretty, the readout honest, both always available.
- **UI scale and the collapse behaviours** — UI scale to 200% using the Screen Budget's stated collapses (palette to icons, inspector to full-screen overlay, bottom furniture stacking), full keyboard navigation, tabular figures so scaled numbers never reflow. (+2 var)
- **The full accessibility affordance list** — three named palettes, reduced motion with a published table, Reduced Flashing and the Strobe Budget, audio↔visual redundancy including ambient, the Hum Bar and EQ strip and located captions, three audio buses, Readout Mode, 200% scale, keyboard nav, tabular figures, the Chroma Meter as a player readout, and pause always available. (+1 var)
- **The mimic exemption, written down** — the Two-Channel Law applies to state, not identity-under-deception: a mimic's unknown-ness is doubly encoded, but its hostility is deliberately unencoded until classification, which is the game.
- **Runbook / Blueprint mode as an accessibility preset** — the high-contrast flat diagram render run as a whole-game mode, serving colour-blind and cognitive-access players while doubling as the strategic clarity mode everyone eventually turns on.
- **Full blind-play mode** — the audio landscape designed so a determined player could follow critical state by sound alone via the hum ladder, the money pulse and per-family threat cues; a goal rather than a guarantee, which keeps the Signals bus disciplined.

## 8.15 Typography, numbers, and iconography

- **The Type System** — four families never mixed within a surface: Signage (condensed industrial sans, surviving 8px and extreme perspective), Chrome (neutral UI sans with true tabular figures), Doc (typewriter/serif for all paper), Marker (whiteboard and sticky notes). (+2 var)
- **Era display faces** — 1994 a chunky bitmap, 2001 a beveled humanist sans, 2008 a glossy grotesk, 2016 a geometric sans, 2030 a variable-weight sans animating its weight on state change. Titles and signage only.
- **The Number Law** — tabular figures always, counters roll never snap, units always present in lighter weight, money never abbreviated below $10k, one decimal on percentages only under 10, latency always ms, nines always rendered with the minutes beside them. (+2 var)
- **The Big Number Rule** — exactly one number on screen may be large, chosen contextually: cash in calm play, incident cost during an outage, time remaining in a timed scenario, time-to-dead-air in playout.
- **Three icon tiers** — Tier-A world glyphs drawn in-world isometric at 16-32px, Tier-B chrome icons flat at 24px on a strict 24-grid with 2px stroke, Tier-C micro pips at 4-6px single colour with no stroke.
- **The icon family rules** — everything composes from ten primitives: rounded rectangle (device), circle (service), hexagon (money), chevron (threat), mote (visitor), shield (defense), wrench (action), seal (compliance), clock face (timer), receipt (financial event). (+1 var)
- **Status Chips** — one state vocabulary used identically on every card in the game — HEALTHY, DEGRADED, DOWN, DRAINING, PATCHING, COMPROMISED, SEALED, EXPIRED, OVERDUE, AT RISK, PENDING, UNVERIFIED — each with a shape notch as well as a colour.
- **The Label Plate Aesthetic** — in-world text renders as Dymo tape, printed label, or Sharpie on tape depending on era and how hurried the player was, and labels made during an incident are visibly scrawled.
- **The Player Company Mark Generator** — pick a glyph from ~24 simple marks, a wordmark and a Hue-Ledger-safe muted colour; the mark renders at five fidelity levels tied to Reputation, from Comic-Sans-on-paper to etched lit aluminium, and appears on every branded surface.
- **The Company Letterhead** — an auto-generated letterhead with your mark, name and tagline framing report cards, invoices, postmortems and contracts, tying all the paper UI into one brand from one template.

## 8.16 The production asset spec, acceptance tests, and style guide

- **The LOD Contract — every entity declares five things** — a full sprite and animation set, a 16px icon, a semantic colour plus a 4px pip shape, its contribution to its parent's aggregate glyph, and a one-line inspector summary. Enforced by tooling at authoring time.
- **The Silhouette Sheet (production gate)** — every unit, buildable, staff member and threat ships black-on-white silhouette plates at 16, 24 and 48px; sign-off requires no two units confusable within a family at 24px and no two families at 48px. (+1 var)
- **The silhouette-first authoring test** — every visitor archetype and threat class must be identifiable from a 16px black silhouette in motion with no colour by a tester who has seen it three times; failures get a new silhouette or get merged. A threat you cannot silhouette is a threat you do not need.
- **The Salience Score** — every entity computes severity × recency × player-pinned each frame, and parent containers display only their highest-salience child, so zooming out merges alarms instead of drawing all of them.
- **The Zoom Budget** — hard animated-entity caps per tier: Z0 ≤40, Z1 ≤120, Z2 ≤400, Z3 ≤1200 mostly static tiles, Z4 ≤300 large objects, Z5 ≤200 map marks; everything above merges into the parent glyph via LOD3.
- **The acceptance-test roster** — eleven gates collected: Quiet Frame, Loud Frame, Thumbnail, Two-Screenshot, Silhouette Sheet, silhouette-first authoring, the greyscale pass, the greyscale-motion test, the Two-Second Rule, the Chroma Meter, and the Strobe Budget check.
- **The one-page style guide** — the whole of §8 on one wall card: the five layers, the reserved hues, the form rule, the four state axes, the Ring taxonomy, the motion and shake rules, the cable code, the LED grammar, the camera ladder and eight shots, every budget, and what every entity, instrument, level and FX must ship.

## 8.17 Photo mode, key art, and shareable artifacts

- **Photo Mode** — a free camera with focal-length and DOF controls, time-of-day slider, HUD and overlay toggles, an era grain filter, thirds guides, and a title-block frame stamping company mark, tier, uptime and date. Every artifact the game asks for comes from this one tool.
- **Key Art Direction** — the hero image is not an explosion but a low warm shot down a cold aisle at 3am: one silhouetted person with a flashlight, one amber rack among a hundred green, cable plumes overhead. The promise is competence under pressure, alone.
- **The Money Shot** — the campaign's authored climax: the camera pulls back through the hot aisle, past the containment glass, out the door, up over the campus, and the sign lights up. A level-completion reward, not a cutscene.
- **The Rack Portrait** — a poster-style render of a single rack with its elevation labels, in cyanotype or full colour; cheap to generate, deeply satisfying to own, and free from the auto-generated rack elevations.
- **The Before/After Slider** — auto-captured screenshots from level start and level end presented as a draggable comparison. Zero design cost, maximum "look what I did".
- **The Incident Poster** — on incident close the game composes a poster from the Post-Mortem Polaroid, the uptime ribbon segment, the duration in the Doc face, the root-cause line and the cost; printed-looking and slightly imperfect.
- **The Screenshot Watermark and the share frame** — every exported image carries the Company Letterhead treatment with the player's mark, name, tier and date in a title block, so everything shared looks like it came from one company.
- **The scrapbook wall** — the physical place artifacts accumulate: incident posters, uptime stamps, the first-customer contract, rack portraits, before/after pairs, the placard wall of divested lines. Doubles as the Company Museum and ends the Tour Camera.
- **The end-of-level story artifacts** — four composed from existing systems: the postmortem as a tech-blog endcard with the user rating as the review score, the Growth Timelapse at 500× with era music, the infographic replay with attack paths as red lines, and a re-dressed hero shot with a generated case-study caption.
- **The Snow Globe Archive** — the menu as a shelf of snow globes, each a live still-simulating miniature of a completed level; click one to descend into its endless mode, so the save file becomes a physical collection.

## 8.18 The visual-coverage audit — systems that had no picture

- **The audit finding** — five clusters had essentially no visual specification: the business machine, business and financial threats, most visitor archetypes, the Three-Clock Rule, and the Hands resource; the table names where each is now filled.
- **The hand-wave detector** — flag any entry described only as "a meter", "a gauge", "a bar", "it looks different" or "an indicator", and replace it with which instrument face, what it binds to, its nominal band, its threshold, and what it does when it crosses.
- **The systems still thin, flagged for wave 3** — the reputation sky swatch, the Threat Mass Bar, the attack-surface rose, the uptime nines water line, the bezel's pressure-gradient lip, staff fatigue/morale/skill art, the Retro-Thread, the Company Wall and whiteboard tech tree's flat equivalents, and six lines still lacking a commercial artifact.

---

# Anything else — modes, twists, humour, meta — summary

> Source: `master/10-anything-else-modes-twists-humor-meta.md` · 323 idea entries · 288 KB

## 9.1 Modes

- **Campaign** — Tier 0→6 across types and eras on a branching Pivot Map, so no two runs cover the same order; persistent company, staff, scars, customers and reputation. Three acts. (+2 var)
- **Endless / Survival ("The NOC" / "The Long Haul" / "Keep It Running")** — One infrastructure escalating forever, scored on uptime-days × MRR; needs a Seasons rollover every ~12 waves and must scale on Variety, not Volume. (+6 var)
- **Incident Mode / Blitz Sev-1** — Dropped into a system already on fire; diagnose under a clock, 5–10 min, needs par times.
- **The Consultant (the 20-minute roguelite this design is secretly perfect for)** — A career of short jobs on strangers' broken infra; 15–20 min each, 5-item toolbag, death = reputation. (+1 var)
- **Roguelite Run Mode ("Bootstrapped")** — $500 and a used server; draft 1 of 3 per shift, permadeath, no financing at all. ⚔️ Rival run-structure to The Consultant; ship one first. (+4 var)
- **Puzzle Mode ("Root Cause") and The Postmortem Puzzle** — Hand-authored diagnosis puzzles: here are the symptoms, graphs and logs, name the cause. Fixed board, fixed waves, three stars, scored on hints used.
- **Daily Outage / Daily Incident / Scenario Weekly** — One shared seed per period, leaderboard on MTTR or incident cost; weekly business sibling scored on EBITDA. (+7 var)
- **Sandbox / Architect / Lab / Zen / "Rack Builder"** — Unlimited money, no threats; the game's screenshot engine and marketing department. Aquarium idle cam, Photo Mode, free palette choice, cable-neatness score, STRESS TEST button. (+8 var)
- **Co-op NOC (asymmetric information)** — 2–4 seats, no player sees the whole board; coordination flows through one shared incident timeline. (+8 var)
- **Co-op: Ops and Commercial ("Two Departments" / "Two-Person On-Call")** — Ops and Business share one cash bar; sales overselling an SLA infra can't meet is the comedy engine. (+4 var)
- **Versus / Red vs Blue (and the drafted-deck version)** — Attacker sees only recon. ⚔️ Free-form live (thrilling, unbalanceable) vs drafted deck-vs-deck over 8 timed waves. (+7 var)
- **Attacker Mode / Reverse TD interlude** — Botnet an NPC's infra; win by downtime. Threats you personally use get their decision function in the Codex. (+9 var)
- **Async "Attack My Network"** — Publish your topology; others break it and you get their attack reports. Explicitly a stretch goal. (+1 var)
- **Competitive Market Mode / Market Share** — 2–4 companies on a shared customer pool with poachable staff; indirect competition, undercutting below COGS valid.
- **Hot-seat: "Two Companies, One Keyboard"** — Alternate one business month each, seeing the rival only via status page, trade press, reviews and prices.
- **Historical Scenarios / Historical Reenactments** — Famous disasters, serial numbers filed off: BGP leak, expired cert, cable cut, leap second. Period tooling, wry epilogue.
- **Historical Campaign / Through the Eras** — BBS 1988 → ISP → shared 2003 → VPS → cloud → GPU 2024; each era's winning strategy becomes the next one's losing. (+4 var)
- **Campaign+ / New Game+ / "The Incumbent"** — Replay with your knowledge and little tech; "Incumbent" keeps the endgame company and makes you the slow one being disrupted.
- **Minimalist Mode** — The game as a text-only CRT terminal; real cost is a full ASCII glyph set, which doubles as Shape-First accessibility.
- **Speedrun ("Zero to Nines" / "Zero to Rack" / "Ship It")** — Fastest to your own ASN, 99.99% sustained, a full rack, or $10k MRR. Leaderboards without a competitive mode.
- **Hardcore / Ironman / On-Call** — No pause, no undo, one save, cash never resets. A toggle, not a mode; home of the Scar system. (+3 var)
- **The business modes** — Presets reweighting the whole game: Bootstrapped, VC-Backed, Roll-Up, Turnaround, Bulletproof, Landlord, Niche, Solo Founder, Ethics toggle, Multi-Brand. (+2 var)
- **Mode: The Analyst** — You play the buyer: a data room, 20 diligence requests, a price, then a 3-minute sim of what happens post-close.
- **Mode: Auditor Mode (post-game)** — Replay a level you played as the diligence analyst and find every shortcut you took.
- **Mode: The Agent** — A channel partner with no infrastructure; threats are providers failing your customers, defense is diversification.
- **Mode: Quarter Close** — Three days to quarter end: a number, a pipeline, a discount budget, a waiting board. The business Incident Mode.
- **Mode: The Investor Update** — Choose which metrics to lead with and which to bury; confidence gates capital, credibility tracks whether they held up. (+1 var)
- **Line Draft** — Pick 1 of 3 hosting lines at start and at each milestone; needs a visible pool, rarity tiers and a pivot cost.
- **One Building, Four Lines** — Four types sharing power, cooling, staff and network, with every line's needs in direct conflict.
- **Landlord vs Tenant** — Play a level as the colo operator, then replay it as your own tenant with the information asymmetry that implies. (+1 var)
- **Tenant Mode / The Inverted Level** — You are a customer inside someone else's AI- or player-run facility, so their reliability becomes your terrain; harder variant evaluates three providers by running workloads. (+1 var)
- **The Night Shift / "On-Call Night"** — One level at 3am: half staff, alarms only, no building. Screen dims to dawn, coffee cups as a timer. (+4 var)
- **The Handover** — Play the second half of someone else's incident: bad notes, a running action you can't identify, a wrong hypothesis. Scored on time-to-disprove.
- **Chaos Mode** — A run modifier breaking something random every N minutes; the exam to the chaos lab's practice. (+3 var)
- **The Sunset (the decommissioning level)** — Shut a line down gracefully: migrate, honour contracts, wipe drives, end leases, return IP space. The only level whose verb is removal.
- **Succession / The Handoff** — You leave and the game keeps running; score is how well the company does for 90 days without you. The ultimate measure of an ops engineer's work.
- **The Pager Simulator** — A masochist mode where a mobile companion sends real phone notifications during an in-game incident. Half a joke, and half this audience would enable it once. (+1 var)
- **Blind Mode** — No monitoring; problems arrive only as tickets. Board is flat grey wireframe, and telemetry flooding back at the end is the lesson.
- **The Same Outage Six Ways** — One power failure played out across web, colo, game, GPU, backup/DR and regulated. The purest variety-engine demo.
- **Museum Mode / The Era Gallery** — A walk-through hall preserving each era's facility as a diorama with a placard; pure art showcase, doubles as tutorial reference, folds into the Company Museum as its public wing.
- **Photo Contest / Rack Gallery** — Submit and browse builds, rendered as a physical print wall of pinned photographs with corner cards.
- **⚔️ Mode tiering — twenty-six modes is too many, and none of them are prioritised** — Ship four (Campaign, Endless, Incident, Sandbox), then four cheap (Daily, Puzzle, Speedrun, Minimalist); never Competitive Market, Franchise, Async Attack. ⚔️ Demotes Co-op NOC and The Consultant, which other lenses rank highest — a dispute about cost, not quality; decide by prototype.
- **Ghost Datacenter races** — Race a friend's async ghost on the same scenario; their uptime graph underlays yours. Multiplayer with no netcode.
- **Friday 5PM Deploy Mode** — An arcade spin-off of only deploys and failures: night palette, rollback economy, five minutes. Also a campaign run modifier.
- **Cable-Management Leaderboard (weekly zen)** — Tidy a spaghetti disaster on a timer, judged by a monocled NPC. Siblings: hidden grade component, the Rat King, the Janitor.
- **Support Hero / Support Hell (the queue *is* the game)** — The ticket queue as the whole screen: correct/diplomatic/BOFH replies, spot Trojans, survive the 4:59pm bomb. Support Hell: 30 days at 400 tickets/day.
- **"War Dialing" Retro Mode** — The map is a phone-number range being scanned, the attacker playing a modem-tone symphony. The one threat you hear first.
- **The Neglect Run (challenge mode)** — Build a stack then take your hands off for 30 in-game days; certs, disk fill, patching, backups and rota fatigue tick hidden clocks.
- **"Five-Nines Club" and "Compliance Bingo" (the two trophy challenges)** — 99.999% = 5.26 min downtime/year under full pressure; Bingo passes a HIPAA audit on used hardware with one staffer.

## 9.2 Twists and systemic wildcards

- **Your Past Self Is The Boss** — A level generated from your own save: your build aged three years, decayed docs, EOL parts, driven by a habit-tracker not a script.
- **The Architectural Bad-Habit library** — Generators compose boards from real mistakes ("everything on one PDU", "the replica is the backup", "two DCs, no quorum"), each with a look and a Codex entry.
- **The Inherited Mess / The Inherited System** — The previous owner's facility: single-fed racks, undocumented boxes, "DO NOT TOUCH" labels. The first act is archaeology.
- **The Ghost of the Previous Admin** — Their labels, scripts and naming convention, plus a note reading "DO NOT REMOVE — ASK DAVE." Dave left in 2019.
- **The Legacy Box / "The Do Not Reboot Machine"** — 1,847 days of uptime running something unknown; unpatchable, unmigratable, risk growing monthly. Hosts `fix.sh`, which the game won't open. (+4 var)
- **Documentation as a mechanic** — Purchasable, compounding: documented objects show purpose on hover, become one-click runbooks, and are the prerequisite for delegation. (+1 var)
- **Technical debt as visible substance** — A meter that only grows, whose repayment has zero visible benefit and is always correct. Renders as physical mess. (+2 var)
- **The Slow Boss** — The antagonist is a trend line — a growing competitor, compounding debt, a depreciation schedule — beatable only by decisions made levels earlier.
- **The On-Call Clock** — A visible rotation; the pager-carrier is less effective next day, and carrying it yourself is cheapest and burns you.
- **The Vacation mechanic** — Everyone takes N weeks a year and you pick when, so your bus factor is revealed at a time of your choosing. (+2 var)
- **Career Mode — a life outside the pager** — A non-optional personal meter (sleep, relationships, hobby); zeroing it degrades judgement then forces an absence at the worst time.
- **The 3AM toggle and The 2am Rule** — Page-for-everything vs sev-1-only as a personality setting; actions between 1am and 5am carry higher mistake odds unless staff are fresh.
- **Rubber Duck and The Second Opinion** — Selecting symptoms to explain narrows the possibilities; a second engineer costs a staff-hour and cuts misdiagnosis. (+4 var)
- **Vendor Personalities — the full counterparty cast** — Nine counterparties with trust stats that matter only on the day they matter: transit, landlord, processor, bank, auditor, insurer, distributor, reseller, lender.
- **The vendor prices to your switching cost** — Price increases are computed from your estimated migration cost, so abstraction layers literally lower future increases. (+1 var)
- **You become the vendor squeezing someone else** — Late campaign you sell wholesale and may raise prices on people who can't migrate. A mirror level with no combat.
- **The customer who is also your investor** — A second conflicting relationship on one account card, so firing or outaging them lands in a different system.
- **The founders' agreement** — An NPC co-founder whose conviction is a stat; enough disagreement and they leave with equity, relationships and their subsystem.
- **The Personal Guarantee** — Signing the lease personally changes the lose condition; release from it is a celebrated milestone.
- **Regulatory Weather / Regulatory Drift** — New law, residency rule, sanctions or export control makes your legal business non-compliant while you were busy.
- **Community Bug Reports** — Customers report issues before your monitoring does, but only if you treated them well enough to bother. Reputation as monitoring.
- **The Threat You Can Hire** — Hire a beaten archetype: cuts their spawn rate, Codex to Mastered, plus a permanent trust flag locking out background-checked lines. (+4 var)
- **Defend Someone Else** — A guest level inside infrastructure built by someone with different habits. Reading another's architecture under pressure is the real job.
- **The Dependency Web** — Your providers have their own outages. Three verbs: detect in 90 seconds, fail away to pre-paid secondaries, communicate first.
- **The Hidden Dependency / The Dependency Nobody Knew About** — An edge that exists only when it fails; the best are circular — runbooks on the wiki in the downed DC.
- **Shared World Events** — Simultaneous global events: a disclosed vuln, a cable cut, a region down, an energy spike. Everyone patches the same weekend. (+6 var)
- **The Seasonal Calendar / Seasons** — A type-specific year shape: retail Q4, game release days, backup at month-end, tax in April, GPU on training starts.
- **Market Cycles** — A visible macro index of credit cost, boom/bust and hardware glut; buying counter-cyclically is the rewarded expert move. (+3 var)
- **"It's Always DNS" (with an honest counter)** — A live counter of DNS-caused incidents, with an honest end-of-campaign breakdown showing attacks are a small minority. (+3 var)
- **The Unreliable Dashboard** — A stuck metric, a dead collector, a graph flat because the scrape interval is 5 min and the outage was 90 seconds. Verify from a second source.
- **The Reveal Mechanic (your own infrastructure as fog of war)** — The map shows only what monitoring covers; blind spots are literal dark areas and acquisitions arrive dark.
- **Metric Gaming** — Measure only the endpoints you control and uptime looks perfect; the game notices and reputation diverges from uptime.
- **Everything Is Someone's Fault, Nothing Is Simple** — Incidents resolve to a contributing-factor set; blaming a person is always available and always wrong. (+3 var)
- **Difficulty via Honesty ("Sysadmin Mode")** — Strips aggregation, suppression, hints, the bottleneck highlight, auto-postmortem, duck and mentor; leaves logs and a terminal, grants a score multiplier. (+9 var)
- **The Pivot** — Change which business you're in mid-run: expensive, slow, sometimes the only way to survive an era change.
- **You Can Fire Customers (and its quieter sibling)** — Terminate an abusive account for revenue loss and a public complaint; repricing at renewal sits beside it, visibly cheaper. (+1 var)
- **The One Customer Who Is Always Right / The Unremovable Customer** — Big, demanding, often correct, eats one hand permanently, and so bespoke you can't migrate anything near them. (+1 var)
- **The "Unlimited" Trap** — Available from level 2; always spikes signups, always ends badly. The asterisk opens a scrollable fair-use policy of absurd length. (+3 var)
- **The Legacy Plan** — A grandfathered plan with 340 customers who'd riot: sunsetting costs reputation, keeping it costs margin forever, and it grows.
- **The Handshake Deal** — An undocumented promise you made verbally in level 2, which surfaces at Exit as an unassignable contract in diligence. Keep a ledger, or don't, and find out.
- **Every Decision Has a Receipt / the time-delayed consequence engine** — Choices schedule future effects and are surfaced later by name; Time-Bomb Decisions are the sharpest instances.
- **The Camera Is a Camera** — The view is your CCTV, so losing a site loses the view. ⚔️ Degenerate as written; bounded to greyed timestamped last-known state plus out-of-band telemetry.
- **The Investor Dashboard Lie** — Selective emphasis is available and effective; each framing becomes a named diligence line an analyst asks about two levels later.
- **Postmortem Publishing and the Status Page Voice** — Pick honesty and detail, or an Honest/Corporate/Defensive voice; effects are segment-specific and weaseling risks catastrophic discovery. (+6 var)
- **The Compliance Theater Meter** — Actual Security and Demonstrable Compliance as separate 0–100 stats; the gap is named Theater, a scored penalty and a breach modifier.
- **The RFP Minigame** — A 200-question questionnaire answered by allocating staff hours; unanswerable questions are the gaps you skipped, and lies become Receipts.
- **The Migration Weekend** — A timed cutover of a big customer: success is a case study, failure a public postmortem and a churned whale. (+1 var)
- **Named Disasters** — The same disaster shape returns with a rising number ("Fuel Truck Friday", "Maintenance Window Three"), building institutional memory.
- **The Green Dilemma** — Ignorable for several levels; unlocks enterprise/public buyers, permits and interconnect priority, and bites as a lost RFP not a lecture. (+1 var)
- **Reversible Bad Ideas** — The game lets you oversell 40:1, skip backups, defer patches, and makes it briefly profitable, never blocking with a dialog that says no.
- **The Ethics Track** — No meter, just delayed consequences; grey revenue is available and profitable. ⚔️ Collides with §9.11's rule that the bulletproof arc must end somewhere — consequence, not prohibition. (+3 var)
- **You Are the Attacker's Target Board** — Your infra shown as attacker recon sees it: exposed services, stale versions, employee names, CT logs, the forgotten staging subdomain.
- **The Conference Talk** — Reputation, hiring and enterprise-conversion bonuses for presenting your architecture — and attackers learn your topology. (+2 var)
- **The marketing site on your own infra** — Your status page dies with you unless you had the sense to host it elsewhere. A purchasable lesson.
- **The customer who becomes a competitor** — A technical customer builds their own infra, competes, then poaches your staff; the window to acquire them cheaply is visible only in hindsight.
- **The acquisition offer you should refuse** — Great-looking terms with an earnout that will never pay. The diligence report is available if you read it.
- **Weather Affects Everything — scoped** — Heat, storms, floods and fuel delivery. ⚔️ First-class threat only for satellite, edge, microwave and owned facilities; elsewhere a slow economic modifier.
- **The Hardware Lottery and the Uptime Superstition** — Some units are simply worse; staff attach persistent notes ("cursed") generated from real history, sometimes correct and sometimes superstition.
- **Reputation Has a Face** — Recurring characters with five authored expressions each stand in for the bar; reputation falls roughly ten times faster than it rises.
- **The Line That Eats You** — A line becomes 60% of support load and 15% of revenue, invisible until you build per-line contribution margin after allocated support.
- **The Hardware Afterlife** — One server followed from premium dedicated to budget, VPS node, backup target, lab box, scrap and a certificate of destruction.
- **Reverse Colo** — You rent space in someone else's building and learn what filing a ticket for a reboot and waiting is like.
- **"Works On My Machine" (the card, and the customer)** — The card closes a ticket without fixing anything and it returns bigger; the customer is always wrong until exactly once, catastrophically.
- **The Missing Screw** — Wrong rail kits and short cables cost seconds; a stocked consumables bin removes it entirely as a variance-reducer purchase.
- **The Beeping Server** — Find it by stereo pan, capped at ~20 seconds, used twice a campaign, with a buyable tracking overlay and captioned direction and distance.
- **The What Would Break tool** — Kill any object in Sandbox or the Lab, watch the cascade at 4× with the fuse visible, then rewind. Resilience you can practise.
- **The Long Weekend (an offline/idle layer)** — The company runs on your policies for up to 48 real hours; you return to a report and queued decisions. Nothing catastrophic can happen offline.
- **The Company Handbook** — Authored policies ("nobody works alone at night") with mechanical effects, checked against your actual behaviour at a culture cost.
- **The Board Meeting** — Investors demand growth or margin and your answer sets the next level's scoring weights. You pick your own rubric.
- **The "It's Fine" counter** — How many alerts you dismissed that later mattered. Never shown during play; shown once, at the end of the campaign.
- **The Hardest Lesson, Delivered Once** — A mid-campaign level winnable only by repricing up and watching the logo count fall while margin and reliability improve.
- **The Recurring Nemesis** — A named adversary learning your layout between levels and countering your last build; three faces, including one who graffitis your building.
- **The "It Was You" twist** — A level presenting as an external attack resolves to your own fat-finger — the only way change-induced failure lands emotionally.
- **The Trojan Award** — A "Best Uptime" badge raises your profile, and profile is targeting data. Capability-equals-surface applied to marketing.
- **The Hacker News Hug-of-Death** — A free inbound spike with a hostile comment thread attached: serve it for a decade of loyal customers, choke and the thread is your obituary.
- **The Marketing Gimmick Deck** — One-shot commercial gambits that cheapen or build the brand with real decay curves. The commercial twin of the Chaos Card Draft.
- **Vaporware Announcement** — Announce the roadmap before it exists for an instant attraction buff, with a ship-delay churn bomb and credibility tax if you miss.
- **Ransom Negotiation (two win-paths)** — Refusing and restoring publicly is the reputation win; paying is faster and flags you to the next crew. Both legitimate.
- **The Rival Operator** — An AI company you can peer with, poach from or DDoS; named cast, visible growth, hires your quitters, outbids you, may acquire you.
- **The Abuse Contact and the Spamhaus Cascade** — The peer operator you email about shared abusers; ignore them and they go public. Set-piece: a peer's retaliation de-peers you tile by tile.

## 9.3 Humour and tone

- **Recognition comedy, not parody** — Humour from accuracy, never punching down; never inside an alert, build card or crisis prompt, and never at the moment of loss.
- **The ticket text generator** — Per-type procedural tickets: "URGENT!!! site down (it is not down)", the angled photo of a screen, "I didn't change anything" with a diff attached. (+5 var)
- **Server naming and the label maker** — Functional names give an MTTR bonus, thematic ones morale plus an MTTR penalty at scale; a renaming project breaks every runbook and is correct. (+4 var)
- **The label maker that ran out of tape** — Half a rack labelled, half masking tape and Sharpie, persisting for the rest of the campaign.
- **The cable colour war** — Two internally-consistent conventions, neither budging; the game never resolves it and it shows in every screenshot of that row.
- **The sticky note system** — Inherited paper ("DO NOT REBOOT", "ask dave"), player-placeable, and a "DO NOT UNPLUG" post-it excludes an object from bulk operations.
- **The Intern's Log** — A hand-lettered spiral notebook between levels, getting more competent and world-weary; the filling notebook is the campaign's emotional progress bar.
- **Achievements** — A large authored list across classic, business, diagnosis, Scream Test, finance, comedy and suffering tiers, each rendered as a printed asset tag. (+7 var)
- **Outage Bingo** — A 5×5 card of real causes ("the redundant pair was on the same PDU"); fill a line for a cosmetic. It teaches the bestiary by joking about it.
- **The fictional trade press and the Competitor Obituary Feed** — A news ticker that sometimes foretells what's coming, plus one-line causes of death for other hosts. (+3 var)
- **The industry forum thread** — A recurring thread about you, escalating from "anyone else seeing packet loss?" to "RIP [you]." A live reputation channel.
- **The Trade Radio** — Optional background audio reporting real in-game world events a few minutes before the mechanical consequence lands.
- **The status page euphemism ladder — and its commercial twin** — "Investigating elevated error rates" up to "we are aware of the fire", mirrored by the price-increase ladder you write yourself.
- **The vendor comedy channel** — The support response generator, per-vendor hold music players learn to dread, the sales email, and junk-looking auto-renewals, one of which matters.
- **The maintenance notification nobody reads** — You send it; a customer complains about a maintenance they were notified of four times; the one who read it asks a question you missed and is right.
- **The office set dressing** — The cat on the warm rack, the shared-circuit coffee machine, the Days Since Last Outage board. Rule: at least one is mechanically live. (+8 var)
- **The Office Cat** — Sleeps on the warmest rack, so where it sleeps is a real heat indicator; in Realistic difficulty it is part of your monitoring stack. (+2 var)
- **The Legacy Server With a Name** — Inherited machines get names like `BEHEMOTH`, `tiny` and `webserver2-old-DO-NOT-DELETE`; retiring one after eleven in-game years earns a ceremony, a Hall of Fame plaque and a sad animation. (+2 var)
- **The certificate whose CN is `localhost`** — In production. Working. For four years.
- **"Restart it."** — A support macro that resolves 60% of tickets, is deeply unsatisfying and is correct. Hard constraint: it must never cleanse persistent threats. (+5 var)
- **The reboot fix-rate — *CONFLICTING*** — One dial, two numbers for the same verb. ⚔️ A (master) 60%: a support macro, the joke being that the cheap answer is usually right, and the player's discomfort is the content. B (opencode) 30%: a free one-shot spell you gamble on when out of ideas, because a dominant one-click fix undercuts the diagnosis loop the design calls its most distinctive pleasure. Third path offered: price the action instead of rolling — clears most afflictions, 60s downtime, permanent wear — which lets either number stand.
- **The on-call handoff note that says only "quiet night"** — Immediately before everything explodes.
- **The Advisor Voicemail** — Dry monthly voicemails on your metrics ("a great quarter and a terrible year"), audio with transcript, never blocking.
- **The corporate comedy set** — The acquisition email shown verbatim including when you send it, the quietly-dropped all-hands mandate, the quota whiteboard, the PO-number invoice trap.
- **Cameo Customers** — Era-appropriate procedural customers whose business type predicts traffic shape and survival odds, making customer-reading a forecasting skill.
- **The Post-It with the root password** — A collectible you can find hidden in the acquisition level, left behind by whoever ran the company you just bought.
- **The RFC 2324 easter egg** — A coffee-machine buildable that returns 418.
- **The Cursed Basement** — A joke level of consumer router, daisy-chained extension cords and drives on a plank, secretly a tutorial for why every proper buildable exists.
- **The Postmortem Blog** — Published postmortems accumulate into a fake engineering blog with era-correct web design; costs nothing because the data already exists.
- **The Ops Diary Comic** — A six-panel strip auto-generated at level end from your event log, halftone screenshots with hand-lettered captions from the log text.
- **Loading-screen tips that are real advice** — Dry wisdom as flavour not instruction: "a backup you haven't restored is a hypothesis", "diverse paths that share a conduit are one path". (+4 var)
- **Staff chatter** — Ambient team dialogue during quiet moments and during incidents; what they say mid-cascade is the game's best writing opportunity. Nobody panics; everyone is tired.
- **The rm -rf moment** — A confirmation you will one day click through too fast; survivable, and nobody's fault but yours. Sibling: the type-the-hostname dialog you stop reading.
- **The ToS Scroll and the fine-print card game** — Unroll the ToS to stun legal threats; DMCA and abuse claims become clause-citing card battles, and scrolling far enough finds a clause that helps.
- **The industry-folklore grab-bag** — The Stack Overflow golem, the intern's `rm -rf /`, 404 gremlins, RAID as tiny knights, /dev/null as a pit tower, the blame-the-CDN button.
- **Ops Horror (the dread skin)** — An unlockable layer re-lighting events as sysadmin horror; set piece is the glitch-art "There Is No Level" 404 level. Chosen, never default.
- **The Scare** — Once per save, a fake ransomware overlay that unlocks with a pop — a pen test, or a cosmic-ray flip pranking you. Grants "Cold Hands"; disableable.
- **"The Rack Rate"** — Enterprise customers asking for rack rate, with a dev-mode dial labelled "sales bullshit"; better as a negotiation bonus you must earn.

## 9.4 Meta systems

- **⚔️ One persistent Company object, four faces** — Nine meta systems collapse into the Wall (what you achieved), Scrapbook (what it cost), Almanac (the numbers) and People (who was there). ⚔️ Nine competing meta-progression screens vs one object; the Museum is just the room you walk through.
- **The Long Save** — One company persisting across every mode for hundreds of hours; campaign, scenarios, endless and daily all write into it.
- **The Playbook** — Runbooks carry between runs, improving with use; costed at 8 slots, and carried procedures restart at Assisted rather than Automated.
- **The Company Wiki / Knowledge Base** — The Playbook's prose half: your notes, diagrams and conventions, written by Documentation, read by the Handover, exportable.
- **The Alumni Network** — Departed staff refer candidates, recommend you, become customers or compete — depending on how you treated them, and they remember.
- **Career Mode for Staff** — Named staff with visible arcs: your first junior becomes CTO or burns out, and what they learned, were blamed for and now own is legible.
- **The Persistent Reputation Ledger** — Reputation and relationships carry across levels; level 3's shortcut is level 9's deposition. Substrate for diligence, hiring and financing.
- **The Annual Report** — A generated six-page document: cover, CEO letter written from your events, financial spread on ledger stock, operations and customer spreads. Exports as one image.
- **The Anniversary** — Once a year: a team photo, a one-line summary, customers served, incidents survived, one thing that changed. Four in a row beat any cutscene.
- **The Ops Almanac** — A career record book across every company you ran: worst outage, longest streak, most expensive mistake, the line you never played.
- **Industry Benchmarks** — "Your churn is 4.2%; the industry median is 2.8%." Context turns a number into a judgment.
- **The Uptime Streak — one shared, persistent, cross-mode object** — One counter on the Days Since Last Outage board feeding financing, enterprise conversion, insurance and hiring; erasing it is an animation you watch.
- **The Postmortem Wall / The Postmortem Reading Room** — Every incident of your career with cause, cost and what changed, plus a library of NPC and fictionalised-famous writeups that convert peacetime into Intel.
- **The Company Museum** — A walkable wing: timeline corridor per era, Trophy Rack, Placard Wall, Scrapbook Room, the dim Wall of Ghosts, Skin Preview Room.
- **The Museum Docent** — A staffer tours new hires through your history, script generated from your actual run. The cheapest emotional payoff in the design.
- **The Company Wall** — The always-visible small Museum — certificates, press clippings, the first dollar, lanyards — living in the office you already render.
- **Business Mix Panel** — A revenue pie with a diversification score rewarding complementary lines: day- plus night-peaking, capex-heavy plus opex-light, Q4 plus April.
- **Procedural label text** — Asset tags, rack, port and cable labels and patch-panel legends generate consistent in-fiction text, so close zoom rewards reading.
- **The diegetic settings menu — per era** — 1996 BIOS screen, 2005 tabbed panel, 2016 flat drawer, 2025 telemetry console — same options, same order, same labels.
- **Screenshot watermark** — A corner card with company name, tier, uptime and date using the company mark at its current fidelity, from clip-art to etched aluminium.
- **Modding the skin kit — and the Ruleset Card as a shipped editor** — A line is five assets plus a ruleset card, so ship the editor and publish the twenty official types as editable cards. Needs the Instrument Design Language.
- **The tutorial is a job** — You're hired at a small host, your first tasks are real, your training is being told to go look at something. No tutorial UI.
- **The Ending camera move** — One pullback with three readings: acquisition (your mark cross-fades to theirs), institution (mark intact, held uncomfortably long), collapse (lights out in dependency order).
- **Meta-currency: War Stories** — Earned from unusual disasters survived, spent at the trade-show merch table; better payout forms are conference talks and outage postcards.
- **The "500 — Internal Server Error" Tavern** — A hub where customers, attackers and ex-staff drink: overhear coming threats, hire the reformed attacker, apologise to the churned whale.

## 9.5 The educational angle

- **⚔️ Teaching is by event; explaining is on demand** — Resolves the no-tutorial-text guardrail against an encyclopedia, glossary and library: the game never volunteers text, every explainer is player-initiated.
- **Field Notes** — Plain-language entries unlocked on encounter (95th percentile, PUE, RAID, BGP, quorum, deferred revenue) in a ring-bound field guide, one spread per concept. (+2 var)
- **The hosting glossary** — The business half: MRC/NRC, TCV/ACV, NRR, DSO, cap rate, take-or-pay, MFN, ETF, CAC payback. Every acronym one click from a plain card.
- **The "was that real?" tag** — Four stamps — REAL, SIMPLIFIED, LIBERTY, and "REAL, AND WORSE" — on Codex cards only, never in the world. Business mechanics need it most.
- **The Order of Operations card** — After resolution, the canonical first five actions a good operator would have taken, compared to yours, in order. Not a grade, a comparison.
- **The Unit Conversion drawer** — One drawer converting nines→minutes, Mbps→GB/month, amps→kW→annual dollars, TB→rebuild-hours, RPO/RTO→business impact, rack units→floor area→lease cost, PUE→the power bill. How the game teaches its own numeracy.
- **The Real Postmortem Library ("this actually happened")** — After each incident, a card on an analogous public outage: what happened, the cause, what the company changed.
- **A real post-level debrief card** — MTTR, incidents by class, the biggest avoidable cost, and one sentence of real advice derived from your own run.
- **Import Your Own Topology** — A file or ten-question wizard builds a level with your node names, plus a "Would You Have Survived" findings report. ⚔️ Risky as a tool; findings to investigate, never an audit.
- **Educational mode** — A slower classroom variant with Field Notes inline and Puzzle Mode at the core, pairing with the community scenario library.
- **The community scenario editor** — See §9.7 and §9.10.

## 9.6 Design guardrails

- **Every tower has a downside — except a small curated set** — No pure upgrades. ⚔️ Amended from two directions: a curated pure-win list (config backup, label printer, EPO guard, blanking panel, registrar MFA) must exist.
- **No optimal build order** — Correctness depends on level, type, threat mix and money. ⚔️ Collides with scar-driven unlocking; needs an Anticipation Track, seeded threat order and the Second Answer rule.
- **Lose slowly — with an operational definition** — At least three minutes from first visible warning to unavoidable loss, that warning in the top three clocks throughout. Anything shorter is a bug.
- **Teach through loss, never through text** — The game should have almost no tutorial pop-ups; resolved against the educational layer as teaching-by-event, explaining-on-demand, with Field Notes and the glossary always player-initiated.
- **The three-clock rule** — Exactly three timers promoted at any moment, no more; the cap that keeps a board with a dozen running clocks readable at a glance.
- **The player must always be able to answer "what is the worst thing that could happen right now"** — If the board can't answer in one glance, add the overlay that can.
- **Every number on screen must be explainable** — If a player cannot find where a figure came from, it should not be displayed. Enforced by "Explain This Number".
- **No mechanic may be invisible in both directions** — If you can see neither it working nor it failing, it is a random number, not a mechanic.
- **Every irreversible action is marked before it is taken, not after** — The one-way-door symbol as law on migrations, revocations, disposals, wipes, terminated leases and released IP space.
- **Revenue is never just a number** — Any money-adding mechanic must say how long it lasts, what it costs to serve, who else has a claim, and when it reaches the bank.
- **Make the boring thing beautiful — with a budget mechanism** — Unglamorous correct actions get the best FX, enforced by approving no threat FX before its prevention FX. Seven to fund first, led by the restore that works.
- **Asset reuse discipline** — Variety comes from the Five-Asset Skin Kit; new content may add one FX and one gauge face, anything more requires cutting something.
- **Accessibility as a feature, not a setting** — Colour-blind-first, motion-optional, audio-redundant, keyboard-complete, pause-always; the strong form names modes a sighted, hearing player would choose — Shape-First, Readout, Reduced Flashing, One-Hand, Sonified.
- **Pause-and-plan is the default pacing** — Pressure comes from consequences, not actions-per-minute; a sim that punishes deliberation is a sim nobody finishes.
- **Peacetime must be valuable** — Drills, debt, documentation, forecasting, patching and tuning are the peacetime game. Boredom between waves is a design failure.
- **The reward is letting things through** — Score is visitors served, not threats stopped. ⚔️ The document's most serious contradiction: ~200 threats vs ~45 visitor archetypes plus an uptime-first scorecard; needs both a reweight and a content rebalance.
- **The game must let you be good at this job** — One level per chapter winnable cleanly with no trick, or 25 hours of near-misses produce fatigue instead of pride.
- **Nothing has an immediate result** — Builds take time, changes land after a delay, business decisions land in 90 days. Anticipation is the game.
- **⚔️ "Ship the real monsters" vs "hosting is flavour for mechanics" — a resolution** — Three-step filter: reality is the source list, mechanical role coverage is the filter, playability is the veto. ⚔️ Authenticity-first vs mechanics-first; both lenses get what they want.
- **Hosting-type authoring tests (belongs with §0.2)** — Three-Change Rule, Verb Shift Rule, and the Rosetta Test: if the type can't be mapped to known mechanics in three lines, cut it.
- **Line synergy and antagonism, with numbers (belongs with §0.2)** — Synergy −15% infra cost and +10% cross-sell; peaks 8h apart size to ~70% of the naive sum; antagonism is an allocation slider; variance 1/√n less 8% per extra line.
- **Pause systems — *CONFLICTING*** — Three or four answers to "can the player stop time". ⚔️ A (master): pause is a free accessibility floor and pricing it reintroduces exactly the APM tax the guardrail forbids, removing a guarantee for players who cannot hold six systems in their head. B (opencode): one Composure budget — slow-mo/observe seconds regenerating in breathers, a full freeze costing SLA-seconds, boss auto-slow dipping the same pool. Turns on whether attention is a resource or a right. Unadopted reconciliation: price the slow-mo, never the freeze.
- **The Difficulty-Budget Rule** — Wave richness, patience, capital, entropy and SLA are unbudgeted knobs; define one difficulty-budget axis, publish it per tier, show each knob's cost pre-run.

## 9.7 Long-tail and stretch ideas

- **Level editor and workshop** — Author topology, waves, customers, money, constraints and type; given the ruleset card, a scenario is a small data file. (+3 var)
- **Spectator, replay and the Timeline Scrubber** — Letterboxed replay with a full-width incident-marked scrubber, persistent overlays, 16× speed, and causality lines to the decision that caused each event. (+2 var)
- **The Stream Overlay** — Reserves a clean corner, doubles the clock cluster and money column, hides the idle palette, and adds a plain-language spectator ticker. (+1 var)
- **Seasonal live events** — Calendar events — a month-long Black Friday, a Patch Tuesday weekend, a global vuln, a recall week — giving community cohesion without multiplayer. (+5 var)
- **Company culture as a stat** — Drives hiring, retention and whether people tell you bad news early; a hiding company gets later incidents, worse MTTR and customers as first warning. (+4 var)
- **Real uptime leaderboard** — Longest continuous simulated uptime on a persistent save; runs render as Uptime Ribbons, which compare legibly where numbers don't. (+3 var)
- **The screensaver / idle view — "The Aquarium"** — A slow HUD-less camera cycle through your facility with hum, LEDs and the cat; reachable from the main menu on a generated facility. (+1 var)
- **The Whiteboard Mode** — Marker annotations that persist, appear in screenshots and are visible to co-op partners. The lightweight half of Documentation.
- **Mobile companion / status page** — A phone-shaped view of your status page and alerts, as a real app or a diegetic device. The on-call fantasy completed.
- **Franchise and multi-company play** — Run a group of companies or become the upstream for NPC hosts whose outages become yours. Tier 7; deliberately a stretch goal.

## 9.8 Onboarding, difficulty and assistance

- **The Tutorial Is An Interview** — A ten-minute watched working interview; what you do seeds your first Doctrine card — read logs for Sense, buy hardware for Scale. (+2 var)
- **Systems arrive one per level for the first act** — One new system per level through act one, each taught by a live problem rather than a text box.
- **Assistant modes — three dials on three different axes** — Advisor (explains, never acts), Autopilot on chosen subsystems for a small efficiency loss, and Simplified Economy. (+1 var)
- **"Explain This Incident" — an accessibility feature that is also a design test** — Generates a plain-language causal chain from simulation state; if the engine can't write it, the simulation isn't coherent.
- **Readout Mode** — Numeric or text readouts beside every gauge, dial and posture — `23.4A / 24A`, `68%` — which min-maxers will prefer.
- **Accessibility Replay** — Every incident replayable at 0.25× with all overlays, a narrated caption track and causality lines. Also the best tutorial format.
- **One-Hand Mode** — The whole game from a radial menu and four keys; it is genuinely fast, and speedrunners adopting it is the proof it's finished.
- **Sonified Mode** — Screen-reader board navigation plus full audio telemetry, pitch-mapped to load and panned to location. Also the best second-monitor mode.
- **The baseline accessibility commitments** — Shape-distinct colour-blind-safe states, full pause always, no required dragging, scalable UI, audio twins with direction and distance, reduced flashing, keyboard-complete. (+7 var)
- **The Cursor** — A white crosshair-and-caret that adds a glyph per tool — cable end, wrench, magnifier, flashlight cone — rather than changing shape, so it never gets lost.
- **Operational philosophy as a faction choice** — "Cowboy" versus "ITIL" biasing staff behaviour, spawn mix and scoring weights. The difficulty selector that doesn't feel like one.

## 9.9 Endings and the shape of a finish

- **The Acquisition Endgame** — Selling ends the campaign with a score and epilogue; refusing continues it against a now-funded competitor, because the money went somewhere.
- **The Exit Interview (yours)** — Your handover document read back, then a five-year epilogue driven by the documentation, bus factor, debt, culture and rota you left. (+3 var)
- **The Quiet Handoff** — The final screen is your infrastructure running fine without you, the Days Since Last Outage counter still climbing after the credits start.
- **Becoming the Thing** — The acquirer's postscript level: ten minutes cutting costs at a company you just bought, shown in the detail once reserved for yours.
- **Two Companies, One You** — Start a second company while the first persists as an NPC run by your successor, using your architecture and making your mistakes.
- **Failure is Narrated, Not Punished** — Losing produces an obituary with the real simulation-derived cause, and the next run starts with one carried lesson. Dry, never a punchline. (+2 var)
- **The end credits roll down a cable tray** — Because of course they do.
- **The Acqui-Hire End** — Sell for the team plus earnouts; the company dies, the people don't. "Personal Outcome: Excellent. Customer Outcome: We'll be in touch."

## 9.10 Community, cosmetics and exportable artifacts

- **Photo Mode / Rack Portrait Studio** — Framing, time-of-day, hide-HUD, lenses, depth of field, a title-card generator and export, watermarked and default-unlocked in Sandbox. (+5 var)
- **Blueprint Export** — Any facility exports as a cyanotype schematic plus a rack elevation set, wallpaper-suitable and genuinely postable.
- **The Rack Elevation Poster** — Print-ready front and rear elevations with title block, company mark, legend, dimension lines and a bill of materials down the side.
- **The "Everything Is Green" screenshot** — One button, one clean frame, every pip green. The single image this audience most wants to be true.
- **The Logo Generator** — Mark, wordmark and colour driving building signs, letterhead, invoices, badges, asset tags and watermarks, with clip-art-to-etched-aluminium fidelity tiers.
- **The Customer Logo Generator** — The same system filling contract cards and the logo wall with era-appropriate plausible fake companies, making the Wall of Ghosts hit harder.
- **Sticker Pack Cosmetics** — Unlockable stickers plus custom Dymo labels you type; player-authored labels are the cheapest source of joy and appear in every screenshot. (+2 var)
- **Cosmetic Economy (non-pay)** — Faceplates, LED colours, cable schemes, floor tiles, logo kits, sign fonts, NOC wallpaper and desk clutter, all earned, mostly by doing something correct. (+4 var)
- **The Seasonal Decoration Pack** — Tinsel on the racks in December, which very slightly increases fire risk. Cosmetic that is also, quietly, a mechanic. Perfect.
- **Rack Cards (collectibles)** — An illustrated trading card per hardware model with spec, era and your stats with it, generated from Hardware Afterlife data.
- **The Hall of Fame Drive** — The longest-uptime drive gets a crown and a plaque, and a short genuinely sad animation when it dies.
- **The Postmortem Club** — Publish a postmortem for others to read and vote on; published ones accrue industry reputation feeding your own hiring and enterprise conversion. (+8 var)
- **The Failure Hall of Fame** — Opt-in upload of your worst incident as a playable scenario for others to beat. The community's best content is its worst nights. (+2 var)
- **Scenario sharing (and the interview-practice side effect)** — A community library of "diagnose this" puzzles that companies will use for interview practice; design the export format for it.
- **Real Runbook Export** — Your policy book, escalation matrix, incident template and architecture diagram as usable Markdown/PDF — and permanent marketing.
- **The Ledger Export (your P&L)** — A formatted one-page income statement, balance sheet and cohort table for the company you ran.
- **The Ops Diary Comic and The Postmortem Blog** — See §9.3: both are comedy features and exportable artifacts at once, generated entirely from postmortem and event-log data the game already has.

## 9.11 Production guardrails and responsible depiction

- **Responsible Depiction Note** — Depict the business, never the technique; abuse abstracted to tickets, chargebacks and upstream pressure. ⚔️ Pulls against the Ethics Track — resolution is consequence, not prohibition.
- **Localisation and ticket packs** — Tickets, trade press, chatter, euphemisms, achievement names and the Intern's Log are culture-specific; make them swappable packs from day one.
- **Hosting-Type as Data (the variety engine's architecture)** — Each type is a bundle of visitor definition, patience and demand curves, threat weights, buildables, cost model, scoring, palette, ticket pack and wave table.
- **Real-World-Shaped Data Mode** — Per-toggle realism: true 95th-percentile billing, demand charges, PUE math, lead times, depreciation, payment terms. Difficulty from accuracy, not multipliers.

## 9.12 Small ideas that didn't fit anywhere else

- **The Crash Cart** — A wheeled monitor and keyboard with a real location, always left in the wrong row; a second one is a small correct purchase.
- **The Blanking Panel** — Place them and cooling efficiency jumps. It should feel like finding free money, because it is.
- **The Grounding / Bonding check** — You will never see it work; you will see it not-work exactly once, in the campaign where you skipped it.
- **The ESD strap** — Skipping it occasionally kills a DIMM with no error message, days later, as unexplained instability.
- **Spare Parts Cannibalization** — Pull a part from a lower-priority machine in an emergency; the donor is now a landmine the game won't remind you about.
- **Firmware as a hidden version axis** — BIOS, BMC, NIC, HBA and drive firmware independently versioned, occasionally the root cause, all needing a reboot.
- **Patch Debt** — Unpatched CVEs as a visible per-host risk score; patching costs reboots costs downtime costs windows costs negotiation.
- **The Maintenance Window Negotiation** — Big customers say no, mid-size say not this month; eventually you do it anyway or never patch anything.
- **The Rollback That Isn't** — Migrations, revocations, disposals, deleted data, released IP space and terminated leases are one-way, marked with a distinct icon.
- **The Runbook You Wrote At 4am** — Documents written during an incident or by a fatigued staffer carry a hidden quality penalty that surfaces when someone else follows them.
- **IP Reputation as an inherited property of address space** — A secondary-market /24 comes with blocklist entries, spam history, wrong geolocation and a former tenant. Critical for email and VPS.
- **Latency as a physical constraint on the world map** — ~5µs per km of fibre; the only counter is being closer, making POP placement a geometry puzzle money can't solve.
- **The Broker Lunch** — Spending on colo broker relationships, which actually works, priced honestly with reputation and diminishing returns. (+1 var)
- **Conference Booth Builder** — Booth size, position, banner and swag quality with real lead-gen consequences; the badges end up on the Company Wall. (+3 var)
- **Cross-references for small ideas placed elsewhere** — A pointer list routing seven small ideas (the Do-Not-Reboot machine, Second Opinion, weather layer, doorstop, root-password Post-It) to their home sections.
- **Cosmic Rays** — One bit flips from space, exactly once per save, with a deadpan log line and no counterplay, so the excuse can be true exactly once.
- **Open-Source Karma** — OSS lowers cost but opens a maintainer-burnout supply-chain attack; contributing back lowers the risk. The only dependency countered by generosity.
- **The Holiday-Card Account** — Skip the greetings and renewal odds dip; send them for a delight buff; automate the personalisation, get detected, and churn.
- **The AI Support-Bot swap** — One swap that churns customers and reshuffles your threat mix, demonstrating that who you serve changes what hunts you.

## 9.13 Design priorities — the wave-2 closing notes

- **What to prototype first (the game-design lens, in order)** — Six gates: the latency-budget bounce loop, the Attack Surface Ledger, the Suspicion Dial with visible false positives, drag-a-cable dual view, one full quarter, two types on one engine.
- **The six changes the game-design lens would make first** — Error Budget as currency; Suspicion Routing plus Millisecond Budget plus Inspection Depth; Nine Defense Roles and the Coverage Grid; Invariant Core plus Rosetta Card; numbers on the tensions; a conversion-led scorecard.
- **The ten highest-value items from the operations lens** — Telemetry Resolution, the Threshold Bug, DRaaS oversubscription, the Scream Test level, lead time as currency, the demand charge, fixing Grace Windows, telegraph by threat band, five correlation types, Incident Command.
- **The structural fixes the generalist lens would insist on** — Tier the modes to four; collapse nine meta systems into one Company object; commit to the Long Save; state the teaching/explaining split; add four guardrails; add the never-funny-at-loss rule.
- **What the art lens would fund first** — The boring-thing-beautiful budget line; Photo Mode, the Aquarium and export artifacts; accessibility modes everyone would choose; the Museum floorplan and Annual Report layout.
- **The single most valuable moment the business lens would build** — The Hardest Lesson, Delivered Once. Runners-up: "revenue is never just a number", and the "was that real?" tag on business mechanics.
- **⚔️ Where the priority lists disagree** — Four lens-level splits about emphasis: modes (four-well vs Co-op NOC and The Consultant as top value — cost not quality, decide by prototype); threat mass vs service mass (ops wants more failure modes, design says the bestiary already drowns the service pillar); accuracy vs immersion (resolved by placement — Codex only, never volunteered); ethics (consequence, not prohibition).
- **The design theses — one sentence each** — Nine one-sentence cut tests led by "their enemies look exactly like their customers", including the CEO lens, the genre inversion, the pressure loop, and the customer→threat Heat Sheet, the one thesis not yet a mechanic anywhere.

## 9.14 Campaign narrative, story arcs and world lore

- **Ops Story Mode ("HostHaven")** — New sysadmin of a failing shared host; each level is a calendar month with a cutscene, and the villain is "The Cloud" rendered as a boss.
- **The Status-Page Narrator** — A dry voice reads incidents as public postmortems in-level; upgrades add typed story beats, a calm→clipped→dry→silence telegraph ladder, and sincerity as churn-heal rate.
- **Newspaper Montage Transitions** — Between-wave transitions as trade-press cover stories: level intro, worldbuilding and save menu from one asset.
- **The "You Are a Customer Once" prologue twist** — You play the prologue as a customer and it ends with your first server hacked and your site dark. The game is "never again".
- **The SLA Villain Arc (the final level designed to be lost)** — Demands reach 99.999% and the last level is designed to be lost; you end by renegotiating and choosing which customers to fire. Announce the frame; grade how well you lose.
- **The Ethics Arc, the Nemesis, and the debt that becomes a boss** — Three campaign-spanning threads documented with their systems: the three-ending ethics branch, the Recurring Nemesis with redemption, and the Tech-Debt Golem finale.
- **HOSTARD, the Fallen Giant** — A collapsed predecessor visible as haunted abandoned datacenters you can scavenge, carrying cursed buildables like the Mainframe that whispers CVEs.
- **The "There Is No Cloud" reveal** — The camera pulls back to show the cloud is just more buildings with worse coffee, unlocking a "cloud-washing" perk worth three quarters of brand hype.
- **The Customers Are the DDoS** — Your growth is the attack: a fake launch farms you into collapse and the postmortem reframes every good-wave filter decision you ever made.
- **The Startup Throughline** — Garage → colo → own DC → global network → a catastrophic public outage as third-act boss → back, with customer logos as trophies.
- **The Meta-Narrative of Incident Reports** — The company's story told entirely through the incident reports and uptime graphs of completed levels, reading like early internet history.
- **The Customer Is a Person (named-customer throughlines)** — A named cast carried across levels — the bakery, the memorial archive, the cookie-recipe grandma whose survival is the secret "Guardian Angel" ending.
- **The Boss Gallery** — Bosses are situations, not health bars: the 10/10 DDoS black hole, the Toll-Free Number Boss, the appeasement-only Printer Boss, the Audit Boss, the Chargeback Duel.

## 9.15 Cross-cutting contradictions needing rulings

*Seven unresolved rule-level conflicts, each bearing on a mechanic documented in ANOTHER category file and preserved here because the ruling must be made once, centrally, then applied in both places. Each carries its author's proposed resolution; none is adopted. (§9.13's "Where the priority lists disagree" holds four lens-level disagreements about emphasis; these seven are about rules.)*

- **Contradiction: reboot-as-cleanse vs persistent threats — *CONFLICTING*** — Bears on `08-core-gameplay-mechanics` (the reboot/restart verb) and `03-threats` (persistence classes); a free cleanse hard-counters half the catalogue — webshells, cryptojackers, dormant APTs. ⚔️ A: keep the cheap universal reboot, simple and consistent with the joke that it works. B: a persistence ladder — reboot → restart-service → reimage → rebuild-and-rotate — each tier clearing a different persistence class at rising cost, making persistence class the thing the player is actually diagnosing and stopping the free reboot being a dominant action. Same verb as §9.3's fix-rate conflict, argued on a different axis — what it clears rather than how often it works.
- **Contradiction: build-homing spawn law vs blanket zero-day meteors — *CONFLICTING*** — Bears on `03-threats` (the spawn law) and `05-buildables-services-and-infrastructure`; "enemies home in on what you built" cannot coexist with a zero-day meteor that hits everything. ⚔️ A: targeting follows construction choices, which is what makes the Attack Surface Ledger legible and the build weighty. B: say two rules apart — targeted follows your build, blanket follows your stack — making the CMDB the load-bearing counter and handling inherited infra: "threats home in on what you run, built or inherited."
- **Contradiction: metered-vs-flat pricing dial vs the "attacks award $0" heartbeat — *CONFLICTING*** — Bears on `07-economy-money-and-scoring` (the MRR heartbeat) and `04-customers-traffic-and-clients` (the pricing dial); under metered egress, serving attack traffic costs real money, so "$0" erases the dial's whole point. ⚔️ A: attacks award $0 — a clean readable economy where threat traffic is worth nothing. B: attacks *bill* $N via a variable metered-cost tick, so a volumetric event becomes a cash-flow event rather than only a downtime event.
- **Contradiction: the auto-scaler spends money vs the War Chest rewards lean play — *CONFLICTING*** — Bears on `05-buildables-services-and-infrastructure` (autoscaling) and `07-economy-money-and-scoring` (the War Chest); autoscaling inherently wastes headroom and boot lag, so a spend-down metric punishes using a system the game sells you. ⚔️ A: efficiency measured as spend↓, simple and immediately legible. B: efficiency = utilisation × uptime so waste is what's measured; a tuned autoscaler then reduces waste, making the systems synergistic and tuning a scored skill.
- **Contradiction: the entry-side visual contract vs mimic threats entering as customers — *CONFLICTING*** — Bears on `09-visuals-and-presentation` (the entry-side contract) and `03-threats` (mimic families); "customers bright side, threats dark side, never mix" versus SYN-mimics, the Hug-of-Death and abusive tenants that enter as customers by design. ⚔️ A: origins never mix AND appearances never mix — maximum readability, zero ambiguity. B: split the contract — origins never mix so spawn lanes stay typed, while appearance-mixing becomes an explicit rare high-skill family readable on inspection via the tear frame, or the visual law kills the systems law's best ideas.
- **Contradiction: three-star grading axes vs SLA difficulty modifiers — *CONFLICTING*** — Bears on `01-levels-scenarios-and-progression` (three-star grading) and `07-economy-money-and-scoring` (SLA modifiers); two redundant dials measuring uptime, one as grade and one as difficulty. ⚔️ A: keep both independently — stars grade performance, SLAs raise difficulty, each individually reasonable. B: collapse them so the contract sets the bar and stars measure you against the bar you signed, making "five-nines difficulty" a player decision rather than an invisible stat bump — the shape the Difficulty-Budget Rule asks for.
- **Contradiction: difficulty-via-entropy vs the scaling-ladder wave-knob school — *CONFLICTING*** — Bears on `01-levels-scenarios-and-progression` (wave scaling) and `03-threats` (entropy/rot); two schools of difficulty flagged since wave 1 and never reconciled. ⚔️ A: the wave-knob school — authored difficulty via richer waves, tighter clocks and more simultaneous pressure; legible, tunable, schedulable. B: endorse both sliders and add the missing coupling — rot scales with time since the last maintenance action per device — making entropy a playable schedule, on the principle that rot punishing the passive is fair and rot punishing the busy is not.
