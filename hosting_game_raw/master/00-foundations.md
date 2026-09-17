# Hosting Company Tower Defense — Merged Idea Document

**Wave 2 merge.** This document consolidates fifteen independent idea reports into one organized
working set, structured under the nine categories from `BRIEF.md`:

- **Wave 1 (5 reports)** — general, sysadmin, game-designer, CEO/marketing, and graphics/visual
  lenses, each written cold from the brief.
- **Wave 2 "fresh" (5 reports)** — the same five lenses, run again from the brief alone, to find
  ideas the first pass happened not to reach.
- **Wave 2 "informed" (5 reports)** — the same five lenses again, this time written *after* reading
  the full wave-1 merge. Each produced a **Part A** (ideas genuinely absent from the document) and a
  **Part B** (corrections, missing mechanics, concrete numbers, and named contradictions attached to
  existing entries by heading).

**How wave 2 was merged.** Part B material is *not* listed separately. Every Part B improvement has
been folded **into the entry it referenced**, so each entry now reads as one richer idea rather than
an idea plus a list of notes. Where two reports proposed the same idea, the strongest version was
kept and the best details of the others were merged into it. Where two ideas genuinely conflict,
**both are kept** and the conflict is flagged inline with ⚔️. Nothing was dropped for length.

**Important framing note.** The wave-1 reports were written against an earlier brief that said "web
hosting company." The brief has since been broadened: the game is about a **hosting company in
general** — any kind of hosting service — and **the kind of hosting changes from level to level and
scenario to scenario.** All web-hosting material is preserved here, but reframed as *one hosting type
among many*. Where an idea is stated universally but is actually web-specific, this is flagged; where
an idea generalizes naturally, a short generalization note is attached. Wave 2 pushed hard on this
axis and added a large number of hosting business types nobody had covered (certificate authority,
registrar/registry, package registry, monitoring-as-a-service, mirror hosting, CI/build-farm, Mac
hardware hosting, privacy/VPN, event NOC, ad-tech RTB, IXP operation, scrubbing-as-a-product, secure
destruction, time services, and more). See §0.2 and §0.3 for the variety engine that carries this.

**Conventions used throughout.** Each idea gets a `###` heading with a short description, then:
- **How it works** — the mechanic or visual expression.
- **Interacts with** — the other systems it touches.
- **Hosting types** — which hosting businesses it applies to (omitted when truly universal).
- **Tension** (⚔️) — noted where two merged ideas contradict each other. Both are kept.

Headings are used at exactly three depths so future waves can merge in cleanly: `#` for a category,
`##` for a subsection, `###` for an individual idea.

---

# 0. Foundations

*This section did not exist in any single wave-1 report; it is the merged spine. §0.1 collects the
load-bearing design theses that all five lenses converged on. §0.2–§0.4 establish hosting-type
variety and era as first-class design pillars, per the broadened brief.*

## 0.1 Design pillars

### P1 — The Shared Pipe
In classic tower defense, creeps walk the lane and towers shoot them. Here **the lane carries creeps
AND customers.** Threats and visitors travel the same path through the same equipment. Every defense
you place is a checkpoint that adds latency, and latency is the thing that kills visitors.

**How it works:** Every defensive buildable carries a **Friction** stat (% of legitimate visitors it
bounces or flags) and a **Latency** stat (ms added to every request). A CAPTCHA gate stops
credential stuffing *and* bounces 12% of real shoppers. A WAF stops SQL injection *and* adds 40ms to
every page load. There is no strictly-good tower; every tower is a tax. The core knob of the entire
game is: **how paranoid can I afford to be?**
**Interacts with:** every entry in §4.5 (defenses), §3.4 (bounce model), §6 (friction costs are
denominated in customers, and therefore in money).
**Hosting types:** universal, but the *unit* of friction changes — for a game host it's added ping;
for an email host it's a false-positive spam filter shredding a real invoice; for a colo it's a badge
policy that slows your own techs; for a backup host it's a verification pass that eats the backup
window.

### P2 — Capability vs. Surface
Every buildable has two numbers printed on its card: **Capability** (what new, richer traffic it lets
you serve) and **Surface** (what new threat classes it invites into the wave table).

**How it works:** Adding a database server means you can now serve Power Shoppers and Enterprise
Buyers — the high-value visitors — but it *permanently adds SQL Injection, DB Overload, and Backup
Corruption to the enemy pool for the rest of the run.* You cannot earn premium customers without
inviting premium attackers. **The tech tree is also the bestiary.** Threats in §2.5 should be
literally unspawnable until you build the thing that invites them, so the player watches their
bestiary grow as their network grows.
**Interacts with:** §4 (every buildable), §2 (wave generator pool), §5 (unlocks), §8.8 (the build
card's red "Opens:" row of threat icons).

### P3 — Peacetime is the Real Boss
Two currencies of time pressure: **waves** (spiky, loud, obvious) and **upkeep** (slow, silent,
compounding). Overbuild during a scary wave and you die three quiet minutes later to payroll.

**How it works:** Upkeep rises slowly every minute regardless of what you do (salaries,
depreciation, vendor increases, licensing). A huge fraction of the strategy is *knowing when to
under-defend.* Calm periods must be genuinely useful — that's where research, morale recovery,
restore drills, and maintenance happen — or players will just rush them.
**Interacts with:** §6.3 (costs), §7.9 (calm/storm rhythm), §1.7 (anti-turtle clock).

### P4 — Attention is a Resource
The player is one engineer (early) or a small team (later). Manual interventions — restarting a
service, answering a ticket, physically swapping a disk — occupy **hands**.

**How it works:** You have 1–2 hands at the start, visible as tokens at the bottom of the screen.
Every manual action consumes one for its duration. Automation is the real tech tree: every unlock
that converts a manual action into a standing rule is a huge felt upgrade. This is what makes
simultaneous failures genuinely hard — you have money but no hands. Seeing your last free hand get
consumed while three alerts are firing is the game's best panic moment.
**Interacts with:** §4.8 (staff), §2.9 (ticket avalanche), §5 (runbook ladder), §7.5.

### P5 — Legibility Under Load
A tower defense lives or dies on whether you can read the board in half a second at 3× speed.

**How it works:** Every visual and UI decision in §8 is subordinated to this. If the player can't
tell at a glance *which link is saturated*, the game is broken no matter how good the systems are.
Enforced by hard rules: a strict colour language, shape tokens that survive greyscale, a readability
budget, and alarm propagation to parent glyphs at every zoom.
**Interacts with:** all of §8.

### P6 — The same pipe carries the thing you want and the thing you fear
The general lens's through-line, and a restatement of P1 with a design instruction attached.

**How it works:** A firewall that stops a botnet also stops a customer on a bad mobile carrier. A
cache that absorbs a flood also serves a stale checkout page. **When in doubt, make the defense have
a visitor-facing cost, and make the growth have a threat-facing cost.**

### P7 — Ship the real monsters
The sysadmin lens's organizing principle: real infrastructure fails in specific, repeatable, weirdly
funny ways, and **those failure modes ARE the game.** Don't invent fantasy monsters; the actual
monsters are better designed than anything we'd make up.

**How it works:** The player should finish a campaign having internalized real operational intuition:
redundancy has a seam, monitoring is a service that itself fails, the second failure always happens
during the rebuild, and it's always DNS. Every mechanic carries a "was that real?" marker
distinguishing real failure modes from game simplifications (see §9.5).
**Tension:** ⚔️ P7 (authenticity-first) vs. the game-designer lens's stance that hosting is *flavour
for mechanics, never the reverse.* Both are kept because they mostly agree in practice — the
disagreement surfaces only when a real failure mode makes a bad decision (e.g. a purely random
component death with no counterplay). Rule of thumb: real failure modes are the *source list*;
mechanical role coverage (§2.1) is the *filter*.

### P8 — The business is the other half of the game
The CEO lens's frame: the player is not "a sysadmin who also has customers," they're the
owner-operator. Servers are cost centres that produce billable capacity. Customers are revenue with
a support-cost tail. Attacks are unbudgeted expense events.

**How it works:** "Server down" is not damage. "Server down → 40 min of SLA breach → $1,900 in
credits → 6 refund requests → 3 cancellations → one 1-star review" is damage. Every threat's cost is
expressed in money and reputation. Three numbers are on screen at all times: **MRR**, **Cash**, and
**Reputation**.
**Interacts with:** all of §6; §4.9 (half your towers aren't servers).

### P9 — The reward loop is on letting through, not shooting down
What distinguishes this from every other tower defense: the dopamine lives in the **conversion**
moment, not the kill.

**How it works:** When a checkout visitor reaches the conversion node, a coin/receipt animation and a
real, satisfying sound. Defenses firing are functional feedback; visitors arriving are the payoff.
Every bounce is individually visible so loss is *felt*, not just tallied.
**Interacts with:** §3, §8.6, §8.7.

### P10 — Almost nothing you do has an immediate result
The CEO lens's core twist, generalized: the game's difficulty comes from acting on lagging
information.

**How it works:** Cut support → churn rises in month 3. Cut marketing → leads dry up in month 4.
Raise prices → revenue up now, churn in month 13 at renewal. Skip backups → nothing, nothing,
nothing, catastrophe. Serve a crawler badly → your visitor spawn rate drops two waves later. The
post-mortem screen (§6.9) exists specifically to draw the line between decision and consequence
after the fact.
**Interacts with:** §2 (delayed-damage threats), §3.6 (90-day marketing lag), §6.

### P11 — Hosting is billed in terms, not in months
*(Wave-2 CEO thesis; developed throughout §6.)* Almost no real hosting revenue is a simple monthly
charge, and the term structure is what actually determines cash, churn shape, and company value.

**How it works:** Shared hosting sells as 12/24/36-month prepay with a **renewal cliff** (the
promo rate ends and a third of the cohort leaves at once). Colo is a 3–5 year term billed monthly in
advance with an **annual escalator** and a **ramp schedule** (the tenant takes 2 cabinets now, 8 in
month 18 — and you must hold that power for them, unsold). GPU is 1–3 year reserved with
prepayment, with spot as the leftovers. VoIP is MRC plus per-minute settlement. Dedicated is
month-to-month with a setup fee. **Term is a property of every contract object**, and it makes a
signed deal an asset with a shape, not a number.
**Interacts with:** §6.2, §6.4, §6.5, §3.9 (the contract system), §1.4 (Pivot).
**Hosting types:** universal, with the term length itself as a type differentiator.

### P12 — Revenue has a colour, not just a size
*(Wave-2 CEO thesis.)* $10k of MRR from 400 coupon-driven shared accounts, $10k from one colo
cabinet on a five-year term, and $10k of GPU spot are three completely different assets.

**How it works:** Every revenue dollar carries tags: **margin**, **churn rate**, **support load per
dollar**, **term remaining**, **concentration**, and **valuation multiple**. The HUD shows MRR
*composition* (a stacked bar by colour), not a single scalar, and the end-of-level valuation multiple
is computed from the mix. This makes "grow revenue" an insufficient goal and "grow the right revenue"
the actual game.
**Interacts with:** §6.1, §6.2, §6.9, §8.8 (HUD), §2.10 (concentration risk).

### P13 — The contract is a tower
*(Wave-2 CEO thesis.)* An SLA is not a toggle. The liability cap, credit cap, claim window,
maintenance-exclusion clause, auto-renew, escalator, MFN clause, audit right, and assignment clause
are each a separately buildable, separately negotiable **defense**.

**How it works:** Contract clauses are placeable on a "paper" layer of the board with real costs
(each one you insist on lowers close rate or price) and real effects (each one you lack is how a bad
month becomes a bad year). The legal layer is a tower tree parallel to the technical one.
**Interacts with:** §3.9, §4.9, §6.2, §2.10.

### P14 — Money you can't touch is not money
*(Wave-2 CEO thesis.)* A real operator has about six cash numbers and only one of them pays payroll.

**How it works:** Split the single Cash stat into **free cash**, **restricted cash** (processor
rolling reserve, escrow holdbacks, tenant security deposits), **deferred revenue already spent**,
**AR aged 30/60/90+**, **capitalized fit-out recovered over 60 months**, and **backlog** (signed but
not installed, worth nothing until it turns on). The classic death is a profitable company with no
free cash.
**Interacts with:** §6.1, §6.4, §6.11, §6.10 (lose conditions).

### P15 — A pivot is a double-carry, not a switch
*(Wave-2 CEO thesis.)* Changing what kind of hosting company you are is not a research purchase.

**How it works:** You carry the dying line's contracts, hardware leases, licences, and staff **to
term** while simultaneously funding the new line — 12 to 24 months of paying for two companies. The
overlap window is the actual drama of a pivot, and the strategic question is whether you can reach
the new line's break-even before the old line's obligations run you out of free cash.
**Interacts with:** §1.4 (Pivot levels), §5.6 (line unlocks), §6.4, §0.2 (business lines).

### P16 — Path shaping, not just tower shopping
*(Wave-2 game-designer thesis.)* Classic TD's deepest strategy layer is *shaping the path*. The
wave-1 design had a dependency graph as its map but never let the player bend the route for
defensive advantage — every defense was "buy a filter, pay a global latency tax."

**How it works:** Three mechanics restore mazing without abandoning the graph: **Inspection Depth**
(how deeply a given hop examines traffic, chosen per hop rather than globally), **Suspicion Routing /
the Two Lanes** (a fast lane and a scrutiny lane, and the routing decision is the puzzle), and **the
Millisecond Budget** (a hard per-request latency allowance that every hop spends from, so defense
becomes a spatial allocation problem instead of a shopping list).
**Interacts with:** §7.1, §7.2, §7.3, §4.5, P1.

### P17 — Defenses need roles, and coverage must be legible
*(Wave-2 game-designer thesis.)* §2.1 defines twelve threat roles. Without a matching defense-role
list and a coverage matrix, the player can never reason "I have no answer to the Sapper role."

**How it works:** Nine defense roles and a **Coverage Grid** UI: threat roles down one axis, your
built defenses across the other, cells lit where you have an answer and conspicuously dark where you
don't. The dark cell is the single best teaching device in the game.
**Interacts with:** §2.1, §4.5, §8.8.

### P18 — There must be something you spend to win *right now*
*(Wave-2 game-designer thesis; the single highest-leverage wave-2 addition.)* Money is slow and Hands
(P4) are both the combat currency and the peacetime currency, so there is no in-combat resource with
a visible refill.

**How it works:** **Error Budget as a spendable resource** — a per-level allowance of degradation you
may deliberately burn (shed load, serve stale, disable a feature, drop a region, take the SLA hit) to
survive a moment, with a visible meter that refills slowly during calm. Spending it is a real
decision with a real bill, and it converts panic into agency.
**Interacts with:** P3, P4, §6.1, §7.5, §7.7.

### P19 — A tension without a number is a mood, not a mechanic
*(Wave-2 game-designer and general theses, jointly.)* The wave-1 document contained essentially no
tuning values: no build costs, no starting cash, no level lengths, no patience values, no capacity
units.

**How it works:** Wave 2 attaches a proposed baseline economy and a written-down simulation loop
(patience, latency, queueing, and capacity reconciled into one tick model) so the design is
implementable rather than merely evocative. Numbers in this document are **first-draft tuning
values**, deliberately concrete so they can be argued with.
**Interacts with:** §6.3, §7.1, §7.5.

### P20 — The boring middle of the job is the unmined content
*(Wave-2 sysadmin thesis.)* The famous failures — DDoS, cert expiry, RAID rebuilds, power chains, BGP
hijack, backups that don't restore — were well covered by wave 1. The gap was the unglamorous
operational middle.

**How it works:** Wave 2 adds measurement resolution (you cannot see a 200ms stall on a 5-minute
graph), lead times, warranty and RMA logistics, change correlation, decommissioning, inventory
drift, the electricity bill's **demand charge**, protocol-level resource attacks, and the whole class
of failures where **nothing changed and you simply grew into a bug that was always there** — the
most authentic failure shape in the industry and one the player will not see coming.
**Interacts with:** §2.8, §2.9, §4.6, §6.3, §7.6.

### P21 — Every mechanically-defined system owes a visual
*(Wave-2 visual thesis.)* A system with no described visual expression will be built wrong or not at
all: the business machine (§4.9), most of §2.10, most of §3.2's archetypes, the Three-Clock Rule
(§7.9), and the Hands resource (P4) all had mechanics and no picture.

**How it works:** Wave 2 supplies specs where wave 1 hand-waved ("a meter," "a gauge," "it looks
different"), and resolves four collisions where two entries gave the same colour, shape, or screen
surface two different jobs. The four cross-cutting rendering laws — the **Hue Ledger**, the
**Emissive Allowance**, the **Ring Taxonomy**, and the **Instrument Design Language** — live in §8.2
and are referenced from every other category.
**Interacts with:** all of §8; P5.

---

## 0.4 The era axis

### Era × Type is a 2D content grid
A second variety dimension that is nearly free once the skin kit exists.

**How it works:** Same ruleset cards, different **era**: 1994 dial-up ISP, 2001 dot-com colo, 2009
shared-hosting-and-cPanel, 2016 cloud, 2024 GPU boom, near-future edge. Era changes costs, available
tech, threat sophistication, customer base, and the entire palette. Whole branches of the tech tree
are greyed out with "not invented yet."
**Interacts with:** §5.6 (era unlock), §8.10 (era kits), §9.1 ("Through the Eras" mode).

### The Era Campaign ("From Dial-Up to GPU")
Possibly the strongest single campaign structure available.

**How it works:** Start in 1996 as a dial-up ISP and advance: dial-up → shared hosting → dedicated →
VPS → cloud → containers → GPU/AI. Each era transition obsoletes some of your hardware and
buildings, changes the aesthetic, changes the customer base, and poses the strategic question **"do
we chase this or stay in our niche?"** — which is the actual history of the entire hosting industry.
**Interacts with:** §1.4 ("Pivot"), §9.2 (the legacy box that survives every era).

### The Era-Transition Cutscene
Between eras, show your own facility aging around you.

**How it works:** The beige boxes leave, the racks get denser, the lights go LED, the graphs get
prettier — and one server from 1998 is still there in the corner, still running, still nobody knows
why. Presented as a renovation: scaffolding, dust sheets, then the reveal.

---

## 0.5 Working titles and tone

### Working title candidates
**UPTIME** · **Packet & Rack** · **99.999** · **Five Nines** · **HOSTILE TRAFFIC** · **The Rack** ·
**Bare Metal** · **Ping of Death** · **Serving Suggestion** · **Load Bearing** · **From Basement to
Backbone**.

### Tonal target
**Recognition comedy, never parody.** The funniest thing in hosting is how mundane the catastrophes
are: a $3 part, a forgotten renewal, a typo, a screw. The game should respect the work — the people
in it are competent and the systems are genuinely hard — and get its laughs from truth. Tonally:
*Papers, Please* meets a rack elevation diagram, with the warmth of a team that's been through some
things together. **Never punch down at users**; the joke is always the situation.

### The emotional arc
The real arc of the job, and the arc the campaign should deliver:
**panic → process → prevention → boredom**, and learning that boredom is the highest achievement.

---


## 0.6 What wave 2 changed (navigation map)

*A short index of where the second pass did the most work, so a reader who knows the wave-1 document
can jump straight to what's new. Every item listed here is developed in full in the category section
named.*

### The nine biggest structural additions
**How it works:** In rough priority order, as identified independently by more than one lens:
1. **A written-down simulation loop** reconciling patience, latency, queueing, and capacity into one
   tick model, plus a full baseline economy with actual numbers — §7.1, §6.3.
2. **Path shaping restored**: Inspection Depth, Suspicion Routing / the Two Lanes, and the
   Millisecond Budget — §7.1–§7.3.
3. **Error Budget as an in-combat spendable currency** — §6.1, §7.5.
4. **The Nine Defense Roles and the Coverage Grid**, matching the twelve threat roles — §4.5, §8.8.
5. **QoS / traffic prioritisation**, the obvious missing mechanic in a design about a shared pipe —
   §7.1.
6. **Cell-based architecture and shuffle sharding**, making blast radius a buildable property rather
   than a described concept — §4.2, §4.4.
7. **Contract structure as a tower tree**: terms, escalators, ramps, caps, clauses — §3.9, §6.2.
8. **Restricted vs. free cash**, deferred revenue, AR aging, and backlog — §6.1, §6.4.
9. **Automation and standing policy given a UI and a visual language** — you can finally *see* what
   your system will do without you — §7.5, §8.8.

### Whole hosting business families added in wave 2
**How it works:** Certificate authority · domain registrar / registry operator · package registry
(npm/PyPI-alike) · monitoring-and-observability-as-a-service · open-source mirror hosting · CI /
build-farm hosting · Mac hardware hosting · privacy / VPN / Tor infrastructure · event and conference
NOC · ad-tech real-time bidding · IXP operation · DDoS-scrubbing-as-a-product · secure destruction
and decommissioning · time services (NTP/PTP/GPS) · and more. Each ships a Ruleset Card (§0.2) and
appears as a level in §1.3 and an economics row in §6.6.
**Interacts with:** §0.3 (catalogue), §1.3, §6.6.

### Threat space that was half-covered and is now filled
**How it works:** The physical, utility, and supply-chain layer: water supply and water rights, grid
interconnection queues, transformer lead times (measured in *years*), customs and import delays,
counterfeit parts, export controls and sanctions, wildfire smoke and air quality, and the demand
charge on the power bill. Plus the operational middle of P20 and the protocol-level resource attacks
that don't look like floods.
**Interacts with:** §2.7, §2.8, §2.10, §6.3.

### Known live disagreements
**How it works:** Wave 2 was explicitly asked to surface contradictions rather than silently resolve
them. The major unresolved ones are flagged inline with ⚔️ throughout, and the biggest are:
authenticity-first (P7) vs. mechanics-first (the game-designer stance); waves vs. continuous flow as
the canonical traffic model; degradation vs. destruction as the failure idiom; simulation depth vs.
legibility under load (P5); and whether the player is one engineer or an owner-operator commanding a
company. Each is kept as a tension because each is a real design fork, not an error.
**Interacts with:** §9.6 (design guardrails).

---


---

## Appendix: original monolith table of contents (pre-split)

Preserved verbatim for navigation. Section numbers below refer to the original
single-file `hosting_game.md`; see `README.md` for the file mapping.

## Table of Contents

**[0. Foundations](#0-foundations)**
- [0.1 Design pillars](#01-design-pillars)
- [0.2 The hosting-type variety engine (core design pillar)](#02-the-hosting-type-variety-engine-core-design-pillar)
- [0.3 The hosting-type catalogue and the Scarcity Table](#03-the-hosting-type-catalogue-and-the-scarcity-table)
- [0.4 The era axis](#04-the-era-axis)
- [0.5 Working titles and tone](#05-working-titles-and-tone)
- [0.6 What wave 2 changed (navigation map)](#06-what-wave-2-changed-navigation-map)

**[1. Levels, scenarios, and progression](#1-levels-scenarios-and-progression)**
- [1.1 The scale ladder (campaign spine)](#11-the-scale-ladder-campaign-spine)
- [1.2 Perspective-shift levels](#12-perspective-shift-levels)
- [1.3 Hosting-type levels (the variety engine as content)](#13-hosting-type-levels-the-variety-engine-as-content)
- [1.4 Cross-type and structural levels](#14-cross-type-and-structural-levels)
- [1.5 Scenario library (one-off missions)](#15-scenario-library-one-off-missions)
- [1.6 Progression shape between levels](#16-progression-shape-between-levels)
- [1.7 Difficulty curve craft](#17-difficulty-curve-craft)
- [1.8 Tier postcards: the visual identity of each scale](#18-tier-postcards-the-visual-identity-of-each-scale)
- [1.9 Level grammar and authoring laws](#19-level-grammar-and-authoring-laws)
- [1.10 In-level structure: shifts, windows, forks and framing](#110-in-level-structure-shifts-windows-forks-and-framing)
- [1.11 Campaign metagame and topology](#111-campaign-metagame-and-topology)
- [1.12 New level shapes and business-layer levels](#112-new-level-shapes-and-business-layer-levels)
- [1.13 Level modifiers and mutators](#113-level-modifiers-and-mutators)
- [1.14 Boss-shaped events (the end-of-quarter beat)](#114-boss-shaped-events-the-end-of-quarter-beat)
- [1.15 Era treatments and presentation devices](#115-era-treatments-and-presentation-devices)

**[2. Threats](#2-threats)**
- [2.1 Threat design principles and the role taxonomy](#21-threat-design-principles-and-the-role-taxonomy)
- [2.2 Ambient weather (constant background noise)](#22-ambient-weather-constant-background-noise)
- [2.3 Volumetric and protocol floods](#23-volumetric-and-protocol-floods)
- [2.4 Mimics: threats that look like visitors](#24-mimics-threats-that-look-like-visitors)
- [2.5 Application, injection, and data threats](#25-application-injection-and-data-threats)
- [2.6 Credential, access, and human threats](#26-credential-access-and-human-threats)
- [2.7 Infrastructure and network threats](#27-infrastructure-and-network-threats)
- [2.8 Entropy: hardware, power, cooling, and physics](#28-entropy-hardware-power-cooling-and-physics)
- [2.9 Self-inflicted and operational failures](#29-self-inflicted-and-operational-failures)
- [2.10 Business, financial, and reputational threats](#210-business-financial-and-reputational-threats)
- [2.11 Attacker archetypes (the "who")](#211-attacker-archetypes-the-who)
- [2.12 Type-specific threats](#212-type-specific-threats)
- [2.13 Threat behaviour rules and modifiers](#213-threat-behaviour-rules-and-modifiers)
- [2.14 Supply chain, logistics, and procurement threats](#214-supply-chain-logistics-and-procurement-threats)
- [2.15 Utility, environmental, and civic threats](#215-utility-environmental-and-civic-threats)
- [2.16 AI-era and modern threats](#216-ai-era-and-modern-threats)
- [2.17 Structural and systemic threats](#217-structural-and-systemic-threats)
- [2.18 Storage, virtualization, and capacity failures](#218-storage-virtualization-and-capacity-failures)
- [2.19 Identity, time, and trust failures](#219-identity-time-and-trust-failures)
- [2.20 Abuse-desk and legal-pressure threats](#220-abuse-desk-and-legal-pressure-threats)
- [2.21 Cost attacks (denial of wallet)](#221-cost-attacks-denial-of-wallet)
- [2.22 HUD attacks: threats against your information](#222-hud-attacks-threats-against-your-information)
- [2.23 Overcorrection: threats that punish paranoia](#223-overcorrection-threats-that-punish-paranoia)
- [2.24 Threat economy, wave composition, and generator systems](#224-threat-economy-wave-composition-and-generator-systems)
- [2.25 Boss design and campaign-scale threats](#225-boss-design-and-campaign-scale-threats)
- [2.26 Threat presentation language (the visual grammar of §2)](#226-threat-presentation-language-the-visual-grammar-of-2)
- [2.27 Threat-to-hosting-type matrices](#227-threat-to-hosting-type-matrices)

**[3. Visitors, traffic, and clients](#3-visitors-traffic-and-clients)**
- [3.1 The visitor model](#31-the-visitor-model)
- [3.2 Visitor archetypes](#32-visitor-archetypes)
- [3.3 What "a visitor" is per hosting type](#33-what-a-visitor-is-per-hosting-type)
- [3.4 Why visitors bounce](#34-why-visitors-bounce)
- [3.5 Customer and client archetypes](#35-customer-and-client-archetypes)
- [3.6 Attraction and acquisition channels](#36-attraction-and-acquisition-channels)
- [3.7 Conversion, churn, and retention](#37-conversion-churn-and-retention)
- [3.8 Segmentation and positioning](#38-segmentation-and-positioning)
- [3.9 The client (tenant) system](#39-the-client-tenant-system)
- [3.10 Support and tickets as a visitor-facing system](#310-support-and-tickets-as-a-visitor-facing-system)
- [3.11 The sales pipeline and the deal](#311-the-sales-pipeline-and-the-deal)
- [3.12 The visual grammar of visitors, clients, and the front of house](#312-the-visual-grammar-of-visitors-clients-and-the-front-of-house)

**[4. Buildables: services and infrastructure](#4-buildables-services-and-infrastructure)**
- [4.1 Design rules for buildables](#41-design-rules-for-buildables)
- [4.2 Compute and application tier](#42-compute-and-application-tier)
- [4.3 Data and storage tier](#43-data-and-storage-tier)
- [4.4 Network and edge](#44-network-and-edge)
- [4.5 Defenses](#45-defenses)
- [4.6 Observability and response](#46-observability-and-response)
- [4.7 Facility](#47-facility)
- [4.8 Staff](#48-staff)
- [4.9 The business machine](#49-the-business-machine)
- [4.10 Type-specific buildables](#410-type-specific-buildables)
- [4.11 Non-physical buildables: policy, process and paper](#411-non-physical-buildables-policy-process-and-paper)
- [4.12 Productization: turning operations into SKUs](#412-productization-turning-operations-into-skus)
- [4.13 Rentals, burst, and the panic economy](#413-rentals-burst-and-the-panic-economy)
- [4.14 Where the business machine lives: the mezzanine and the desk grammar](#414-where-the-business-machine-lives-the-mezzanine-and-the-desk-grammar)

**[5. Unlocks and discovery](#5-unlocks-and-discovery)**
- [5.1 Unlock philosophy](#51-unlock-philosophy)
- [5.2 Scar-driven unlocks (pain → capability)](#52-scar-driven-unlocks-pain--capability)
- [5.3 Milestone unlocks](#53-milestone-unlocks)
- [5.4 Discovery mechanics](#54-discovery-mechanics)
- [5.5 Tech tree branches and shapes](#55-tech-tree-branches-and-shapes)
- [5.6 Unlocking whole lines of hosting business](#56-unlocking-whole-lines-of-hosting-business)
- [5.7 Anti-unlocks, deprecation, and rot](#57-anti-unlocks-deprecation-and-rot)
- [5.8 Unlock presentation and payoff](#58-unlock-presentation-and-payoff)
- [5.9 Credentials, permissions, and accreditation (the unlocks you cannot buy)](#59-credentials-permissions-and-accreditation-the-unlocks-you-cannot-buy)
- [5.10 Reputation and social-proof unlocks](#510-reputation-and-social-proof-unlocks)
- [5.11 Staff, organizational, and knowledge unlocks](#511-staff-organizational-and-knowledge-unlocks)
- [5.12 The research economy and unlock pacing](#512-the-research-economy-and-unlock-pacing)

**[6. Economy, money, and scoring](#6-economy-money-and-scoring)**
- [6.1 The currency set](#61-the-currency-set)
- [6.2 Revenue streams](#62-revenue-streams)
- [6.3 Costs](#63-costs)
- [6.4 Cash-flow mechanics](#64-cash-flow-mechanics)
- [6.5 Pricing as a mechanic](#65-pricing-as-a-mechanic)
- [6.6 Per-type economics](#66-per-type-economics)
- [6.7 Money-moving events](#67-money-moving-events)
- [6.8 The metrics HUD](#68-the-metrics-hud)
- [6.9 Scoring and end-of-level rating](#69-scoring-and-end-of-level-rating)
- [6.10 Win and lose conditions](#610-win-and-lose-conditions)
- [6.11 Financing instruments](#611-financing-instruments)
- [6.12 Contract and term structure](#612-contract-and-term-structure)
- [6.13 Restricted cash and the balance sheet](#613-restricted-cash-and-the-balance-sheet)
- [6.14 Multi-line, transition, and portfolio economics](#614-multi-line-transition-and-portfolio-economics)
- [6.15 The money design language (drawing the economy)](#615-the-money-design-language-drawing-the-economy)
- [6.16 Baseline tuning numbers](#616-baseline-tuning-numbers)

**[7. Core gameplay mechanics](#7-core-gameplay-mechanics)**
- [7.1 The board: flow, topology, and the two directions](#71-the-board-flow-topology-and-the-two-directions)
- [7.2 Connections: the central interaction](#72-connections-the-central-interaction)
- [7.3 Placement and space](#73-placement-and-space)
- [7.4 Upgrades](#74-upgrades)
- [7.5 Time, tempo, and player actions](#75-time-tempo-and-player-actions)
- [7.6 Information, fog, and diagnosis](#76-information-fog-and-diagnosis)
- [7.7 Failure, recovery, and consequence](#77-failure-recovery-and-consequence)
- [7.8 Per-type mechanical shifts](#78-per-type-mechanical-shifts)
- [7.9 Meta-loops and rhythm](#79-meta-loops-and-rhythm)
- [7.10 Path shaping: the Millisecond Budget, Inspection Depth, and Suspicion Routing](#710-path-shaping-the-millisecond-budget-inspection-depth-and-suspicion-routing)
- [7.11 QoS and traffic prioritisation](#711-qos-and-traffic-prioritisation)
- [7.12 The resource model: what is actually scarce](#712-the-resource-model-what-is-actually-scarce)
- [7.13 The simulation loop, written down](#713-the-simulation-loop-written-down)
- [7.14 Automation, standing policy, and the policy UI](#714-automation-standing-policy-and-the-policy-ui)
- [7.15 The commercial board: the other half of the map](#715-the-commercial-board-the-other-half-of-the-map)
- [7.16 Interaction laws and readability at scale](#716-interaction-laws-and-readability-at-scale)

**[8. Visuals and presentation](#8-visuals-and-presentation)**
- [8.1 Art direction candidates](#81-art-direction-candidates)
- [8.2 Rendering rules, colour language, and shape tokens](#82-rendering-rules-colour-language-and-shape-tokens)
- [8.3 Camera, altitudes, and level of detail](#83-camera-altitudes-and-level-of-detail)
- [8.4 What infrastructure looks like](#84-what-infrastructure-looks-like)
- [8.5 What threats look like](#85-what-threats-look-like)
- [8.6 What visitors look like](#86-what-visitors-look-like)
- [8.7 Expressing actions, money, and state](#87-expressing-actions-money-and-state)
- [8.8 UI and HUD](#88-ui-and-hud)
- [8.9 Readability at scale](#89-readability-at-scale)
- [8.10 Per-type and per-era visual identity](#810-per-type-and-per-era-visual-identity)
- [8.11 Audio](#811-audio)
- [8.12 Presentation moments and the effects catalogue](#812-presentation-moments-and-the-effects-catalogue)
- [8.13 Animation and motion language](#813-animation-and-motion-language)
- [8.14 Accessibility, colour-blind safety, and redundant encoding](#814-accessibility-colour-blind-safety-and-redundant-encoding)
- [8.15 Typography, numbers, and iconography](#815-typography-numbers-and-iconography)
- [8.16 The production asset spec, acceptance tests, and style guide](#816-the-production-asset-spec-acceptance-tests-and-style-guide)
- [8.17 Photo mode, key art, and shareable artifacts](#817-photo-mode-key-art-and-shareable-artifacts)
- [8.18 The visual-coverage audit — systems that had no picture](#818-the-visual-coverage-audit--systems-that-had-no-picture)

**[9. Anything else](#9-anything-else)**
- [9.1 Modes](#91-modes)
- [9.2 Twists and systemic wildcards](#92-twists-and-systemic-wildcards)
- [9.3 Humour and tone](#93-humour-and-tone)
- [9.4 Meta systems](#94-meta-systems)
- [9.5 The educational angle](#95-the-educational-angle)
- [9.6 Design guardrails](#96-design-guardrails)
- [9.7 Long-tail and stretch ideas](#97-long-tail-and-stretch-ideas)
- [9.8 Onboarding, difficulty and assistance](#98-onboarding-difficulty-and-assistance)
- [9.9 Endings and the shape of a finish](#99-endings-and-the-shape-of-a-finish)
- [9.10 Community, cosmetics and exportable artifacts](#910-community-cosmetics-and-exportable-artifacts)
- [9.11 Production guardrails and responsible depiction](#911-production-guardrails-and-responsible-depiction)
- [9.12 Small ideas that didn't fit anywhere else](#912-small-ideas-that-didnt-fit-anywhere-else)
- [9.13 Design priorities — the wave-2 closing notes](#913-design-priorities--the-wave-2-closing-notes)

---

