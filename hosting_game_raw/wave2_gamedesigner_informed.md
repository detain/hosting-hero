# Wave 2 — Game Designer lens (informed pass)

*Read against the full merged `hosting_game.md` (§0–§9, ~11.2k lines). Everything below is either
absent from that document or is a concrete mechanical upgrade to something already in it. My lens:
tower-defense / systems-strategy design. I care about the minute-to-minute loop, the shape of the
difficulty curve, whether a choice is a real choice, whether a number is tunable, whether a system
creates micromanagement, and whether the hosting-type swap makes the game bigger or makes it
twenty smaller games.*

**Headline read on the current document.** The idea inventory is outstanding and the pillars (P1
Shared Pipe, P2 Capability/Surface, P4 Hands, P9 reward-on-letting-through) are the right spine.
But as a *playable* design it has four structural holes:

1. **There is no mazing.** Classic TD's deepest strategy layer is *path shaping*. This design has a
   dependency graph as the map but never lets the player shape the path for defensive advantage.
   Everything in §4.5 is "buy a filter, pay a global latency tax." Part A §7 fixes this with
   **Inspection Depth**, **Suspicion Routing (the Two Lanes)**, and **the Millisecond Budget** —
   which together turn defense from a shopping list into a spatial puzzle.
2. **There is no defense taxonomy to match the threat taxonomy.** §2.1 has twelve threat roles.
   There is no corresponding role list for defenses and no coverage matrix, so the player can never
   reason "I have no answer to the Sapper role." Part A §4 supplies the **Nine Defense Roles** and
   the **Coverage Grid**.
3. **There is no in-combat currency.** Money is slow, hands are the only thing you spend during a
   fight, and hands are also the peacetime currency. A TD needs something you *spend to win right
   now* with a visible refill. Part A §6 proposes **Error Budget as a spendable resource** — the
   single highest-leverage addition I can offer.
4. **Almost nothing is numbered.** The document is a brilliant list of tensions with no tuning
   values attached to any of them. Part B is heavy with proposed numbers, because a tension without
   a number is a mood, not a mechanic.

A fifth, softer note: the document is *enormous*, and roughly 15% of its entries are flavour with
no verb attached. Those are flagged individually in Part B under "mechanically inert."

---

# PART A — NEW IDEAS

---

## A1. Levels, scenarios, and progression

### A1.1 — The Signed Contract (pre-level difficulty as a negotiation)
*Replaces "pick easy/normal/hard" with a diegetic draft, and resolves the three-way difficulty-dial
collision in §1.6/§6.5.*

**How it works.** Every level opens on a contract sheet with four sliders and a live-updating
reward number. The player sets them *before* play, and the sheet is a physical prop the level
ends by stamping or rejecting:
- **Availability commitment** — 99% / 99.5% / 99.9% / 99.95% / 99.99%. Sets your error budget for
  the level (see A6.1) and the per-minute credit rate.
- **Response commitment** — 24h / 4h / 1h / 15min first-response on tickets. Sets the ticket-timer
  pressure and how many hands the support queue will eat.
- **Scope** — how many services/customers/lines you accept. More scope = more revenue and more
  simultaneous fires.
- **Term** — monthly / annual / multi-year. Longer terms pay a premium up front (cash now), lock
  your price, and mean a mistake follows you into the next two levels.

Reward scales roughly as `base × (1 + 0.35·availability_step + 0.2·response_step + 0.15·scope_step)`
with term acting as a cash-timing modifier rather than a total modifier.
**Why it's better than a difficulty menu.** It is *the same decision a real operator makes*, it
produces a legible reason for the difficulty ("I promised four nines, that's on me"), it is
per-level rather than per-campaign so a player can back off after a rough night, and it makes the
score screen readable ("you beat a 99.9 contract at 99.94 — B+").
**Interacts with:** §1.6 Difficulty as SLA (this subsumes it), §6.5 price slider (kept, but demoted
to an in-level lever rather than the difficulty selector), §6.8 obligation block, A6.1 Error Budget.

### A1.2 — The Handover Note (60-second orientation for a ruleset swap)
*The missing onboarding beat for the variety engine. Right now a new hosting type drops the player
into a game whose rules changed with no in-fiction teacher.*

**How it works.** Every hosting-type level opens with a single sheet of paper on a desk, written by
the outgoing operator, containing exactly three lines: **what runs out first**, **what kills you**,
and **what the customer actually wants**. Three lines, hand-written, skippable, and they are the
three ruleset-card slots that changed. ("Backups: you never run out of disk. You run out of *night*.
Jobs that don't finish by 06:00 didn't happen. Nobody cares how fast you are; they care whether
Tuesday's file comes back.")
**Why.** A ruleset swap is only fresh if the player can act competently inside the first two
minutes. This is the cheapest possible teaching device, it is 100% diegetic, and it doubles as the
level's thesis statement for the player who comes back to it in sandbox six months later.
**Interacts with:** §0.2 Ruleset Card (this is the card, rendered as a prop), §1.3 all hosting-type
levels, §9.3 tone.

### A1.3 — The Rosetta Card (teaching that it is the same game)
*The single most important anti-fragmentation device.*

**How it works.** The second time a new ruleset introduces a mechanic that is a rename of something
you already know, the game draws a one-line equivalence on the Handover Note in a different ink:
"**Power oversubscription** is your oversell ratio." "**Backup window** is your maintenance window."
"**IP reputation** is your uptime streak, but held by strangers." "**Tick budget** is your latency
budget with a harder cliff." Collecting these fills a **Rosetta page** in the Codex which is,
functionally, the game's thesis: hosting is one job with twenty costumes.
**Why.** Without this, twenty hosting types read as twenty minigames. With it, each new type makes
the player feel *smarter about the previous ones*.
**Interacts with:** §0.2 Three-Change Rule, §5.4 Codex, §9.5 Field Notes.

### A1.4 — The Invariant Core (six verbs, never swapped)
*A design law, stated so that content authors can't break the game by accident.*

**How it works.** Every hosting type, every era, every perspective level must be playable with the
same six verbs and no others: **Observe** (open an overlay / read a graph), **Diagnose** (narrow
symptom to cause), **Place & Connect** (add a node, draw a link), **Tune** (move a slider, set a
policy), **Triage** (assign a hand / choose what burns), **Commit** (schedule a change into a
window). A type may change what the nouns are; it may never introduce a seventh verb. The two
corollaries:
- **The 20% palette rule.** A new hosting type may replace at most 20% of the build palette. The
  other 80% must be objects the player already knows, doing a recognisable job.
- **The Three Meters Law.** Cash, Reputation and Hands are on screen in *every* type, always, in the
  same place. Only the fourth meter (the scarce resource from §7.8) swaps.
**Why.** This is the answer to the brief's question about fragmentation. Variety comes from *which
verb dominates*, not from new verbs.
**Interacts with:** §0.2 Verb Shift Rule (this is its enforcement clause), §7.8, §8.10 skin kit.

### A1.5 — The Returning Type doctrine (novelty, then mastery)
**How it works.** No hosting type ships as a one-off. Every type appears at least twice:
- **Introduction** at tier N — restricted palette, one scarce resource, a single antagonist, a
  Handover Note.
- **Mastery** at tier N+2 — same type, twice the scale, *plus* one mechanic you learned elsewhere in
  between, and the level is explicitly built to be unwinnable without it. ("Game hosting, again —
  but now your capacity is multi-region and you learned anycast in the DNS level.")
- Optional **Capstone** in an endgame multi-line level where the type is one district.
**Why.** A type you visit once is a minigame. A type you return to, changed, is a *character*.
This is also the cheapest possible content: the second visit reuses 100% of the first's assets.
**Interacts with:** §1.3, §1.6 Type Ladder, §5.6 Type Mastery.

### A1.6 — The Portable Skill Table (what each type teaches that transfers)
**How it works.** Authoring constraint: every type must be designed around one *transferable*
lesson, and the campaign order is built from this table, not from theme.

| Type | Teaches (transfers everywhere) |
|---|---|
| Dial-up ISP | Concurrency is countable; oversubscription is a bet |
| Shared web | Density vs blast radius; one tenant is everyone's problem |
| Game hosting | p99 is the product; geography is latency |
| Email | Some resources are held by third parties and cannot be bought back |
| DNS | You are load-bearing for other people; TTL is a throttle you own |
| CDN | Offload is margin; the miss is the event |
| Object storage | Durability is arithmetic, not vibes |
| Backup/DR | Verification is the only proof; the window is the constraint |
| Colo | You will have to fix things you are not allowed to touch |
| GPU | Power and heat are the real ceiling |
| HPC | The slowest member sets everyone's speed |
| Serverless | Cost can be attacked without touching availability |
| Kubernetes | Automation executes your mistakes at machine speed |
| Regulated | Shrinking scope is cheaper than defending it |
| Bulletproof | Some revenue is a loan against your future options |

**Interacts with:** §1.6 Type Ladder, §5.6, A1.3.

### A1.7 — The Level Archetype Taxonomy (and the no-repeat rule)
*§1.5 has ~55 scenarios and no classification, which means the campaign editor has no way to check
its own rhythm.*

**How it works.** Every level is tagged with exactly one of eleven archetypes, and **no two
consecutive levels may share an archetype**:
1. **Endure** — survive N waves (the default; should be < 30% of the campaign).
2. **Convert** — maximize throughput of *good* traffic (Launch Day, Hug of Death). Rate-limiting to
   survive is a loss.
3. **Reach-State** — attain a configuration (Audit, Compliance Week, Migration). No combat.
4. **Escort** — one unit matters (The Influencer, The Whale Demo, a Tournament, a restore).
5. **Diagnose** — the board is already broken; find why (NOC Shift, Root Cause, Post-Breach).
6. **Build-to-Spec** — construction against a blueprint and a budget (Datacenter Build, Bring-Up).
7. **Shrink** — remove things without breaking anything (Cost Cut, scope reduction, divestiture).
8. **Schedule** — fit work into windows (Backup, HPC queue, satellite passes, change freeze).
9. **Negotiate** — the opponent is a person (RFP, Peering War, vendor squeeze, ransom).
10. **Hold-Without-Hands** — no manual actions allowed (Long Weekend, holiday, founder away).
11. **Inherit** — fogged board you didn't build (Acquisition, New Hire, Defend Someone Else).
**Why.** This is the single highest-value editorial tool you can give a campaign designer, and it is
how you prevent the 55-scenario library from collapsing into "another wave level with a story."
**Interacts with:** §1.5 entire library, §1.7 pacing.

### A1.8 — The Cold Start Minute (a spec for the first 90 seconds of every level)
**How it works.** Hard authoring rule, enforced in review:
- **0:00–0:15** — Cold Open camera (§8.12), Handover Note, contract already signed. No threat.
- **0:15–0:40** — one *free* successful conversion. The player watches a visitor arrive and pay
  before anything goes wrong. This is the promise of the level.
- **0:40–1:10** — the level's signature constraint asserts itself once, harmlessly, with a
  telegraph. (The backup window bar appears and shows 8 hours. The amp meter ticks. The tick
  metronome wobbles.)
- **1:10–1:30** — the first decision, with exactly two viable options and enough money for one.
- **1:30+** — normal play.
**Why.** Levels that open on chaos teach nothing, and levels that open on nothing feel like setup.
Every good TD level opens with one free kill; this design's equivalent is one free *sale*.
**Interacts with:** P9, §1.7 pacing, §8.12.

### A1.9 — The Midpoint Fork
**How it works.** At roughly 45–55% of a level's length, play pauses on a two-card choice that
reshapes the back half. Not a difficulty choice — a *shape* choice, and both cards are attractive:
- "*Marketing landed a feature in a newsletter. Traffic +140% for the rest of the level.*" vs
  "*Legal wants a change freeze. No deploys, but no bad-deploy risk and +1 hand.*"
- "*Take the emergency contract: +$8k now, a 4-hour RTO promise you cannot currently meet.*" vs
  "*Decline. Keep the headroom.*"
The chosen card is stamped on the score screen, so two players' stories of the same level differ.
**Why.** Levels currently have one act. A fork gives every level a second-act turn and gives the
Timeline Ribbon a narrative bend. It also multiplies replay value at essentially zero content cost.
**Interacts with:** §7.5 Inbox cards (this is the Inbox promoted to a structural beat), §8.8
Timeline Ribbon, §6.9 postmortem.

### A1.10 — The Campaign Market Map (where you expand, not just what you build)
**How it works.** Between chapters, the campaign shows a map of *markets*, not levels: regions ×
hosting lines, each node showing demand, competition heat, regulatory weather, and power price.
You choose your next node. Choosing a node adjacent to one you already hold gives a **carry bonus**
(shared staff, shared network, shared reputation); choosing a distant node gives higher reward and
starts you cold. Competitor AI expands on the same map between chapters, and nodes you ignore get
taken.
**Why.** §9.1 says "Campaign: a branching map" in one line and never develops it. A market map makes
the hosting-type choice a *strategic* decision instead of a content playlist, gives the Competitor
AI somewhere to live between levels, and makes the Portfolio Meter (§0.2) a consequence of
navigation rather than a stat.
**Interacts with:** §0.2 Portfolio/Synergies/Antagonisms, §2.11 The Competitor, §5.6 line unlocks.

### A1.11 — Downshift levels (the deliberate exhale)
**How it works.** After any level scored "Barely Held It Together" or worse, the next level is
automatically a **downshift**: smaller board, fewer simultaneous systems, one clear goal, and it is
explicitly framed as such ("*Q3. Nothing on fire. Fix the things you promised you'd fix.*"). It is
not easier in the sense of being trivial — it is scored on **debt paid, drills run, documentation
written** — but it has no wave pressure.
**Why.** §1.7 has a sawtooth *within* a level and nothing between levels. A 20-hour campaign of
escalating crises is exhausting. The downshift is also where §9.6's "Peacetime must be valuable"
actually gets its real estate.
**Interacts with:** §1.5 The Quiet Month, §1.7 Pressure Budget, §7.9 calm/storm.

### A1.12 — The Failure Ladder (losing drops you, it doesn't restart you)
**How it works.** Failing a level does not show a game-over. It routes you to a **recovery
scenario** generated from *how* you failed:
- Cash zero → "**Chapter 11**": 15 minutes, negotiate with creditors, sell a line, keep a core.
- Data loss → "**The Notification**": you play the 72 hours after, not the outage.
- Mass churn → "**The Win-Back**": your ex-customers are the level's visitor pool.
- Upstream termination → "**Re-homing**": move your entire network in 30 in-game days.
You return to the campaign poorer, scarred, and with a specific unlock only obtainable this way
(§5.2's Failure-Only Nodes, now with a delivery mechanism).
**Why.** §6.10 says "lose slowly" and §1.6 says scars persist, but there is no *scene* for losing.
This makes failure a chapter rather than a reload.
**Interacts with:** §1.6 Scars, §5.2 Failure-Only Nodes, §6.10.

### A1.13 — The Double-Header (two boards, one budget)
**How it works.** Occasional levels present two short scenarios *simultaneously* on split screen —
often two lines of business, or two regions — with one shared pool of cash and hands. You can pause
one and not the other only by *choosing where to look*; the unwatched board runs on its standing
policies. Scored jointly.
**Why.** It is the cheapest possible way to teach the Tier-5 lesson ("you cannot look at
everything") without building Tier 5, and it makes the delegation/policy systems (§7.5) matter two
tiers earlier than they otherwise would.
**Interacts with:** §7.8 multi-line tabs, §7.5 autopilot, §1.4 Multi-Line.

### A1.14 — The Ratchet Audit (a level that tests only your carried-over automation)
**How it works.** Roughly once per chapter, a level gives you **no build budget at all** and no new
tech. It is a stress test of everything you automated, documented, and pre-configured in previous
levels. The score is a straight readout of how much of the level ran without you. It is the only
level type where the *ideal* play is to do nothing and watch.
**Why.** §1.5's "The Long Weekend" is exactly this idea used once. Make it a recurring institution
and it becomes the campaign's report card on whether the player is actually building an *operation*
rather than hand-flying a stack.
**Interacts with:** §1.5 Long Weekend, §5.4 Runbook Ladder, §7.5 delegation.

### A1.15 — Pressure carry-over (the fatigue ledger between levels)
**How it works.** A level's final **team fatigue** and **technical debt** carry to the next level as
starting values, visible on the level-select card before you commit. A brutal win leaves you
starting the next level at 60% hands. The Downshift level (A1.11) is how you clear it, and choosing
to *skip* a downshift for a bigger reward is a legitimate, tempting, dangerous strategy.
**Why.** Makes §2.9's Staff Burnout and §7.7's debt meter matter across the campaign instead of
resetting every level, and creates a genuine risk/reward rhythm at the campaign layer.
**Interacts with:** §1.6 Company Ledger, §4.8 morale, §7.7 debt.

### A1.16 — "The Same Company, Five Years Later" (time-skip levels)
**How it works.** Occasionally the campaign jumps forward. Your board comes back with: hardware aged
one tier down the cascade, two staff gone, three undocumented changes made by people who are no
longer here, one customer grown 8×, and a compliance requirement that didn't exist. **You did not
make these changes; the simulation did, using your own habits as its model.** A player who never
documented gets a fogged board; a player who documented gets a board with notes.
**Why.** This is §9.2's "Your Past Self Is The Boss" turned from a one-off gag into a recurring
structural device — and it is the most honest possible expression of P10.
**Interacts with:** §9.2, §1.6 legacy debt, §5.7 rot.

### A1.17 — The Apprentice level (you may only write rules)
**How it works.** You cannot act. You can only author **policies** — if/then rules with a priority
order — and an AI junior executes them, including the parts you got wrong, cheerfully, at 3am.
Scored on how few times the junior had to improvise. An entire level about the gap between what you
meant and what you wrote.
**Why.** A perspective level that is genuinely a different *game verb* while using zero new systems,
and the perfect pre-cursor to the late-game delegation arc (§7.5).
**Interacts with:** §7.5 autopilot, §1.2 perspective levels, A7.9 Policy Authoring.

### A1.18 — Seeded Weekly Ruleset
**How it works.** A weekly generated combination: hosting type × era × two affixes × one contract
shape, expressed as a 6-character share code. Everyone plays the same one. The *generator* is the
content, and it costs almost nothing because the ruleset card is already data.
**Interacts with:** §9.1 Daily Outage, §0.2 ruleset cards, §9.7 workshop.

---

## A2. Threats

### A2.1 — The Nine Defense Roles and the Coverage Grid
*The missing half of §2.1's Threat Role Taxonomy, and the single biggest legibility gap in the
design.*

**How it works.** Every defensive buildable is tagged with exactly one primary role:

| Defense role | What it does | Examples |
|---|---|---|
| **Absorb** | Adds raw capacity ahead of the thing being hit | scrubbing, anycast, CDN, edge cache, extra nodes |
| **Classify** | Decides good vs bad | WAF, fingerprinter, IDS, fraud scoring, spam filter |
| **Meter** | Caps consumption per identity | rate limits, quotas, spend caps, concurrency caps, cgroups |
| **Contain** | Limits how far a landed threat spreads | VLANs, least privilege, circuit breakers, blast domains, WORM |
| **Detect** | Tells you it happened | monitoring, tracing, FIM, log retention, anomaly detection |
| **Recover** | Undoes damage | backups, spares, checkpoints, runbooks, rebuild |
| **Deter** | Changes the attacker's economics | MFA, KYC, deposits, bug bounty, reputation, legal posture |
| **Divert** | Sends it somewhere else | honeypot, decoy service, null-route, tarpit, sacrificial IP |
| **Negotiate** | Uses a relationship instead of a machine | upstream retainer, registrar lock, insurance, peering, counsel |

And the **Coverage Grid** is a UI panel: threat roles down the side, defense roles across the top,
your current coverage as filled cells. A row with no filled cell is a hole, and the game says so in
plain language: "*Nothing you own changes an attacker's economics. Everything you have is a wall.*"
**Why.** Without this, a player facing a Sapper (cryptominer, toll fraud, egress bill) buys more
walls and dies confused. With it, the tech tree has a *readable shape* and the phrase "defense in
depth" becomes a thing you can see rather than a thing the game says.
**Interacts with:** §2.1, §4.5, §5.5 branches (the six-branch spine should be re-derived from these
nine roles), §8.8 HUD.

### A2.2 — Attacker budgets (making yourself expensive is the win condition)
**How it works.** Every attacker archetype carries a hidden **budget** and an **expected-return**
estimate. Defenses in the **Deter** and **Divert** roles raise their cost; defenses in **Absorb**
and **Classify** lower their return. When cost > return for three consecutive attempts, that
archetype **stops coming** for the rest of the level (and, at campaign scale, deprioritises you).
The Attacker Ledger (§6.9) shows this: "*Grinder: spent 41 hours, netted 0 accounts. Left.*"
**Why.** §2.13 says "hunters adapt; each counter buys time, not permanence" and §2.6 says credential
stuffing "can only be made unprofitable" — but there is no *system* that models unprofitability, so
the lesson is text. This makes it arithmetic, and it makes the Deter role (currently almost empty)
mechanically load-bearing.
**Interacts with:** §2.6 Grinder, §2.11 archetypes, §6.9 Attacker Ledger, A2.1.

### A2.3 — The Feint (the telegraph as a weapon against you)
**How it works.** A small number of waves are *deliberately* over-telegraphed: a huge, loud,
slow-approaching volumetric that the forecast widget screams about — and that is entirely cover for
a quiet second vector arriving during the 40 seconds your attention and your hands are committed to
the obvious one. The tell is always available (the second vector shows on exactly one overlay you
are probably not looking at) and is never *required* to survive, only to survive cheaply.
**Why.** §2.13's Threat pathing telegraph makes all telegraphs honest. A genre needs at least one
lie, or telegraph-reading stops being a skill and becomes a reflex. Cap: **at most one feint per
level, never two levels in a row**, and the postmortem always names it so the player learns the
pattern rather than resenting it.
**Interacts with:** §1.7 Telegraph Depth, §7.6 fog, §7.9 forecast.

### A2.4 — The Two-Front Law (a wave design rule)
**How it works.** An authoring rule: **the best waves attack two different resources at once and
the correct response uses different currencies for each.** A volumetric (costs bandwidth, answered
with money/relationships) arriving with a disk failure (costs hands, answered with attention) is a
better encounter than either doubled. Every "hard" wave in the pressure budget must draw from two of
{bandwidth, concurrency, hands, cash, reputation, data integrity}.
**Why.** §1.7's Two-Beat Wave is about threat-then-visitors. This is the *within-threat* version,
and it is what makes Pillar P4 (hands) bite. Without it, every wave is solvable by whichever
resource the player has most of.
**Interacts with:** §1.7, P4, §7.5 hands.

### A2.5 — The Grudge system (attacker persistence with a visible state)
**How it works.** Each attacker archetype carries a **Grudge** value toward you, 0–5, shown as pips
on their Threat Gantry portrait. Grudge rises when you humiliate them cheaply (null-routing a booter
kid instantly, publicly blogging about beating them, refusing a ransom loudly), and falls with time
or with a quiet, unremarkable defense. High grudge = they return sooner, bigger, and *specifically
counter your last successful defense*.
**Why.** Gives the player a genuinely novel strategic axis — **win quietly or win loudly** — and it
makes §2.11's "The Competitor" pattern (attacks whatever you just removed) generalise to every
antagonist. Also rewards humility, which is thematically perfect.
**Interacts with:** §2.11, §2.13 Hunters adapt, §3.6 status page / publicity choices, A2.2.

### A2.6 — The Overcorrection threat family (threats that punish paranoia)
*The design currently has no enemy that punishes over-defense, so the Shared Pipe tension is
one-sided: friction costs you revenue passively, but nothing actively hunts an over-tuned build.*

**How it works.** A small family whose damage scales with *your own friction*:
- **The Competitor's "No Robots" Campaign** — a rival advertises "no CAPTCHAs, no checks." Every
  point of your Friction stat converts a percentage of your bounced-good-traffic into *their*
  signups. Your false-positive rate becomes their acquisition channel.
- **The Legitimate Burst You Blocked** — a real customer's real launch trips your own thresholds.
  The damage is a support escalation, an SLA claim, and a public post — and your monitoring shows
  the attack was *successfully blocked*, which is the joke.
- **The Accessibility Complaint** — your bot-detection blocks screen readers and old clients; a
  visible, slow, reputational bleed with a legal tail.
- **The Support Tax** — friction generates tickets at `0.8 tickets per 100 false positives`, so an
  over-tuned WAF eats hands directly.
**Why.** P1 is the design's central pillar and currently it only has a passive cost. Give paranoia a
predator and the dial becomes a real fight.
**Interacts with:** P1, §4.5 all friction stats, §3.4 captcha tax, §2.10 competitor.

### A2.7 — The Copycat Wave (the game remembers what beat you)
**How it works.** Each level's generator reserves 10–15% of its pressure budget for threats drawn
from your **personal miss list** — the specific attacks that landed on you in the previous two
levels. Presented diegetically ("*your incident report got scraped; someone's reading it*"), and
visible in the forecast as a small "familiar" icon.
**Why.** Adaptive difficulty that is *legible* and *fair*, and it converts the postmortem screen from
a retrospective into a threat forecast. It also fixes §9.6's "no optimal build order": the wave table
becomes a function of the player's own history rather than an authored script.
**Interacts with:** §5.1 scar-driven unlocks, §6.9 postmortem, §1.7 pressure budget.

### A2.8 — The HUD-Attack family (formalised)
*§2.2 has Referrer/SEO spam ghosts and §2.9 has the monitoring server dying; these are the same
idea and deserve to be a named family with rules.*

**How it works.** Threats whose damage is *to your information*, with a strict fairness contract:
**a HUD attack must always be detectable by cross-checking two sources you own.** Members:
- **Metric Poisoning** — a graph lies (spam inflates traffic; a broken exporter zeroes a counter).
- **The Dead Sensor** — monitoring dies; everything is green forever.
- **Alert Flooding** — a deliberate noise generator to bury a real alert (the attacker's version of
  §2.9's alert fatigue).
- **The Wrong Green** — a health check that checks the wrong thing after a config change.
- **Log Tampering** — after a breach, the trail is edited; only immutable logging survives it.
**Fairness rule:** the Pulse Strip (§8.8) and the Site Preview Window (§8.8) are **never lied to**.
They are the two ground truths, so a player who develops the habit of checking "what does the
customer actually see" is always able to catch a HUD attack.
**Interacts with:** §7.6 information/fog, §8.8, §4.6 monitoring.

### A2.9 — The Second Incident rule
**How it works.** A generator rule, not a threat: **the probability of a new incident is multiplied
by 1.8× while the player is already in an incident**, and by 2.5× during a *recovery* (restart,
rebuild, failover, restore). Surfaced honestly in the Codex as "*things break when you're
touching them*" — which is true, and which is the reason maintenance windows exist.
**Why.** It is the real texture of operations, it makes the "root cause vs band-aid" choice actually
tense (do you have time?), and it is the mechanical justification for change freezes, drills and
runbooks all at once. It must be *stated*, not hidden, or it reads as the game cheating.
**Interacts with:** §7.7 recovery, §2.8 rebuild storm, §7.5 maintenance windows.

### A2.10 — Boss design specification (three phases, each invalidating one defense)
*§1.6's "Chapter bosses" is one line. Here is a spec.*

**How it works.** Every chapter boss follows the same three-phase shape, so the player learns the
grammar:
- **Phase 1 — the announcement.** A survivable version of the attack that reveals its class. The
  player's *existing* defense works. Lasts ~60s.
- **Phase 2 — the counter.** The boss invalidates the defense that just worked (rotates IPs, moves
  to a different layer, attacks through a trusted path). The player must switch to a *different
  defense role* (A2.1) — this is the phase that checks Coverage Grid breadth.
- **Phase 3 — the cost.** The boss cannot be stopped, only priced. The player chooses what to
  sacrifice: a customer, a region, a feature, money, or their weekend. **Every boss ends in a
  decision, never in a kill.**
Boss telegraph window: announced **two levels in advance** in the trade press ticker (§9.3), so
preparation is possible and the player who reads the world is rewarded.
**Interacts with:** §1.6 chapter bosses, §2.1 roles, A2.1, §9.3 trade press.

### A2.11 — The Entropy Pressure Budget (a second, quieter generator)
**How it works.** Hardware/power/cooling/self-inflicted failures (§2.8, §2.9) run on their **own**
pressure budget, *deliberately anti-correlated* with the attack budget: entropy pressure is highest
during the calm troughs of the attack sawtooth. Its budget is a function of **estate age × estate
size × (1 − maintenance spend)** rather than of wave number.
**Why.** Two things: it makes peacetime genuinely non-idle (P3), and it means the player who solves
security still has a game. It also gives the maintenance/drill economy a visible dial — you can
literally see entropy pressure fall when you fund maintenance.
**Interacts with:** §2.8, §2.9, §1.7 Pressure Budget, §7.9 calm/storm.

### A2.12 — Threat affixes as a visible, draftable modifier set
**How it works.** §2.13's behaviour mix-ins become a formal, *seen* system. Each level shows 0–3
affixes on its level card before you start (Low & Slow, Distributed, Encrypted, Adaptive, Timed,
Piggyback, Persistent, Mimic). In "Contract" terms (A1.1), **accepting an extra affix is a reward
multiplier** — the player can opt into a harder wave table for money. Affixes are colour-coded and
have a fixed icon set, so by hour six the player reads a level card the way a Diablo player reads an
affix row.
**Interacts with:** §2.13, A1.1, §9.1 Line Draft.

### A2.13 — The Cost Attack as a first-class threat category
*§2.3 has "Bandwidth Bill Bomb" and §2.12 has "recursive invocation bill" and "egress bill shock"
as scattered one-offs. This is a whole category and deserves rules.*

**How it works.** A **Cost Attack** never reduces availability. It is fully "survived" and fully
successful. Rules: it produces no red on the board, it produces no alert unless you built a **cost
anomaly monitor**, and its damage lands on the *next* invoice — i.e. after the level's climax. The
counters are all in the **Meter** role (spend caps, quotas, egress caps, 95th-percentile shaping)
and all of them cap your own upside too.
**Why.** It is the only threat class where the player's instinct (tank it, serve everyone) is
actively wrong, and it is the purest expression of P8 (damage is denominated in money).
**Interacts with:** §6.3 95th percentile, §6.7 bill shock, A2.1 Meter role.

### A2.14 — The Insider, redesigned as a fair deduction puzzle
*§2.6's Insider currently resolves to "spot a one-pixel badge difference," which is pixel-hunting.*

**How it works.** The insider leaves **three** signals across three different systems, and any
**two** identify them: an access-log entry outside their normal hours, a data-volume anomaly on one
link, and a behavioural tell (they decline the vacation the game offers). None alone is conclusive;
each is individually plausible. The player can **accuse** at any time: correct accusation ends it
cheaply; a wrong accusation costs morale across the whole team and the real insider accelerates.
Or they can **contain without accusing** (two-person rule, rotate keys, segment) — slower, no
drama, no morale hit, and the campaign never tells you who it was.
**Why.** Turns a cosmetic tell into a genuine three-clue deduction with a meaningful "don't play the
game, engineer around it" option, which is exactly the right lesson.
**Interacts with:** §2.6, §9.2 Vacation mechanic, §4.8 morale.

---

## A3. Visitors, traffic, and clients

### A3.1 — Suspicion Routing: the Two Lanes (the game's mazing layer)
**The most important single addition in this report.**

**How it works.** Traffic arrives **violet** (unclassified, per §8.2). Every node the traffic passes
through contributes a small amount of **classification confidence** and a small amount of
**latency**. The player builds not one path but **two**, and sets a **suspicion threshold**:
- **The Fast Lane** — short, shallow, cheap. Traffic below the suspicion threshold takes it. Low
  latency, low confidence, some threats get through.
- **The Slow Lane** — long, deep, expensive: extra inspection hops, a challenge, a queue, a tarpit.
  Traffic above the threshold is routed here. High confidence, high latency, and every real customer
  routed here is patience you are burning.

Confidence composes as `C = 1 − Π(1 − cᵢ)` over the hops on the path; latency as `L = Σ lᵢ`.
Threshold is a single always-visible slider. The strategic space is immediately rich:
- Do you build one medium lane, or a very fast lane plus a very deep one?
- Where do you put the *cheap* classifier — early (routes more traffic correctly, less confident) or
  late (more confident, everyone paid the latency to get there)?
- A **pre-classifier** at the edge (ASN reputation, geo, TLS fingerprint) is cheap in ms and buys
  a huge amount of correct routing — which is exactly what real edge security does.

**Why this is the fix.** It converts §4.5's shopping list into a *layout puzzle*, gives the Shared
Pipe pillar a spatial expression, makes the purple→cyan/magenta resolution (§8.2) something you can
see happening in physical space, and gives the game its mazing. It also makes the Mimic role
(§2.4) genuinely deep: a mimic's whole job is to score below your threshold.
**Interacts with:** P1, §2.4 Mimics, §4.5 all defenses, §8.2 purple, A3.2, A3.3.

### A3.2 — The Millisecond Budget (defense selection as a knapsack)
**How it works.** Each level states a **latency budget** derived from its dominant visitor
archetype — e.g. "*Your customers bounce past 400ms. You have 400ms to spend.*" Every hop and every
defense has a published ms cost. The budget is drawn as a physical ruler at the top of the screen
with your current path stacked against it (this is §3.1's Latency Ladder, promoted to a *constraint*
rather than a readout).
Indicative costs, as a starting tuning set:

| Element | ms | Confidence gain | Friction |
|---|---|---|---|
| Edge/ASN reputation check | 2 | 0.25 | 0.2% |
| TLS fingerprint | 4 | 0.30 | 0.3% |
| L4 rate limiter | 1 | 0.10 | 0.5–6% (tunable) |
| L7 WAF (balanced) | 40 | 0.55 | 4% |
| Behavioural fingerprinter (trained) | 6 | 0.70 | 0.4% |
| JS challenge | 300 | 0.85 | 3% (100% for no-JS) |
| CAPTCHA | 900 | 0.97 | 12% (18% mobile) |
| Origin round trip (uncached) | 120–260 | — | — |
| Cache hit | 8 | — | — |

**Why.** This is what makes "how paranoid can I afford to be" a *number* instead of a mood. It also
makes the CDN/cache purchase feel enormous, correctly: caching doesn't just reduce load, it **buys
you milliseconds to spend on security**.
**Interacts with:** §3.1 Latency Ladder, §4.5, A3.1.

### A3.3 — Priority Classes and the Shed Ladder (pre-configured triage)
**How it works.** The player paints traffic into 4 priority classes — **P0 contractual** (SLA
customers, paid API), **P1 revenue** (checkout, conversion paths), **P2 normal**, **P3 opportunistic**
(free tier, crawlers, prefetch). Then they author a **Shed Ladder** in peacetime:
`at 80% → stop serving P3 · at 88% → degrade P2 to cached-only · at 94% → P1 only · at 98% → P0 only.`
Under load the system walks it automatically, visibly, with a sound.
**Why.** §7.7 mentions "shed non-paying traffic first" in a list. Promoted to a system, this is (a) a
peacetime activity with a crisis payoff, which is the reward loop P3 wants, (b) an *economic* triage
verb — your business model literally determines your failure mode — and (c) the answer to "what does
the player configure that isn't a slider on one box."
**Interacts with:** §7.7 graceful degradation, §3.9 Sacrifice Decision, §6.5 pricing.

### A3.4 — Demand Mix (marketing as creep-wave composition)
**How it works.** The acquisition channels in §3.6 don't just change *volume*, they change the
**composition** of your incoming units, and the game shows this as a stacked bar you are shaping:

| Channel | Mix it produces |
|---|---|
| SEO garden | Deep Readers, Comparison Shoppers, Googlebot; low abuse |
| Paid search | Impulse Buyers, Tire-Kickers; +15% fraud rate |
| Deal forum | LowEnd Larrys, Crypto Chads; +400% abuse; instant volume |
| Referral | Small Biz Brendas; highest retention; slowest |
| Affiliate | Refund Hunters, Migration Tourists; volume, poor LTV |
| Conference/outbound | Enterprise Evaluators, Procurement Delegations; 90-day lag |
| Community/OSS | Developer Customers; high expectation, high reputation |
| Marketplace | API Clients; machine traffic; retry-storm exposure |

**Why.** This is the thing that makes §3.6 a *strategy layer* rather than a list of taps. The player
is choosing which enemies they fight — because in this game, your customers are also your load, your
abuse surface and your ticket volume. "Turn off paid search to reduce fraud" becomes a real move.
**Interacts with:** §3.6, §3.5 archetypes, §2.4 mimics, §6.3 CAC.

### A3.5 — The Return Cadence (today's service is tomorrow's wave size)
**How it works.** Served visitors don't just pay; they schedule their own return. Each archetype has
a return probability modified by the *quality* of their experience:
`P(return) = base × (1 + 0.6·(budget_remaining / budget))`, with a bounce setting it to
`base × 0.15` and a scary-warning bounce to `0`. Returns land 1–3 waves later.
The result is a compounding loop the player can *see*: a great wave 4 makes wave 7 bigger.
**Why.** §3.2 has "Comparison Shopper comes back if you were fast" as one archetype's quirk. Making
it universal converts P9 ("the reward is letting through") from a scoring statement into the
**engine of your own traffic growth** — which means success is genuinely the thing that raises
difficulty, which is exactly the loop this design wants.
**Interacts with:** P9, §3.2, §2.13 "the threat that is your own success", §1.7 pressure budget.

### A3.6 — The Satisfaction Bank (goodwill as a spendable buffer)
**How it works.** Every well-served visitor deposits a fraction of their value into a **Goodwill**
pool, capped at ~2 weeks of revenue. Goodwill is *spent automatically* to absorb reputation damage:
an outage that would cost 8 reputation costs 3 if you have goodwill banked. It can also be spent
deliberately: a price increase, a migration, a maintenance window, an unpopular policy change.
It decays 5%/month.
**Why.** Gives §6.1's Reputation a short-term buffer layer, which solves two problems at once — it
makes a *streak of good service* tangible rather than abstract, and it gives the player a
recognisable, gameable reason to over-deliver during calm periods (P3 again).
**Interacts with:** §6.1 Reputation, §3.7 grudge meter, §7.5 maintenance windows.

### A3.7 — Party Arrival generalised (all-or-nothing units)
**How it works.** §3.3 gives game hosting "players arrive in parties — five at once, all or nothing."
This is too good to leave in one type. Generalise it as a **unit property** that appears across types
with different costumes:
- Game: a 5-player party.
- E-commerce: a multi-item cart (partial availability = whole cart abandoned).
- Enterprise: the Procurement Delegation (three heads, all must be satisfied).
- Backup: a job chain (an incremental is worthless without its full).
- Video: a simulcast (all bitrate rungs must be produced or you drop a viewer tier).
- Colo: a tenant's deployment (7 cabinets, or they go elsewhere).
**Why.** All-or-nothing units are the best possible argument for *headroom over average capacity*,
and they make partial capacity feel bad in a way that a throughput number never does.
**Interacts with:** §3.3, §7.1 capacity as slots.

### A3.8 — Declining demand as a verb (the "we're full" sign)
**How it works.** An explicit, always-available control: cap intake. Set a hard admission limit, or
close signups, or go invite-only. Effects: latency for admitted traffic improves immediately,
support load drops, abuse drops — and **reputation shifts sideways rather than down**: you lose
"available" and gain "exclusive." Some customer archetypes (Enterprise, Regulated, Niche) *prefer*
a provider who turns people away; others never come back.
**Why.** The design has 40 ways to attract and effectively zero ways to deliberately shrink demand,
which means the only anti-overload verb is failure. Giving the player a dignified "no" is both a
real business move and a genuinely interesting strategic option.
**Interacts with:** §3.8 positioning, §6.5 pricing, §3.9 firing customers.

### A3.9 — The Visitor↔Build counter-matrix (a legible answer table)
**How it works.** A single Codex page: rows = visitor archetypes, columns = builds, cells = which
build "saves" which visitor. Mobile Commuter ← CDN + keepalive + fewer redirects. Impulse Buyer ←
checkout path optimisation. Enterprise Evaluator ← status page + logging + uptime history. API
Client ← p99 consistency + `429 Retry-After`. Logged-In User ← session store + read replica. Whale
← isolation + account management. Freeloader ← quota + conversion nudge.
**Why.** TDs need a legible answer table or players brute-force. This one has the additional virtue
that it is *true*, so it doubles as the educational spine (§9.5).
**Interacts with:** §3.2, §4, §5.4 Codex.

### A3.10 — The Cohort as a unit (customers own their traffic)
**How it works.** At Tier 3+, visitors don't spawn from "the internet" — they spawn **from a
customer card**, in that customer's colour, at that customer's rate and profile. The consequences
are excellent:
- You can see *whose* traffic is hurting you, in the lane, live.
- Firing a customer visibly removes their stream (and their revenue) from the board.
- The Sacrifice Decision (§3.9) becomes literal: you can see the colour you're about to cut.
- A customer's growth is visible as their stream thickening over the level.
**Why.** §3.9 says "clients are spawners" and then never makes the spawning visible. This is the
render that makes the whole client system tangible, and it makes tenant tinting (§8.9) carry real
mechanical information rather than being decoration.
**Interacts with:** §3.9, §8.9 tenant tinting, §6.8 concentration.

### A3.11 — Visitor Trust as a per-identity value the defenses can read
**How it works.** Returning identities accumulate a **trust score** (logged-in, verified payment,
long tenure, consistent behaviour). High-trust identities bypass the Slow Lane (A3.1), skip the
challenge, and get priority class bumps. This is a genuinely valuable build (an identity/session
layer) with the perfect matching downside: **compromised trusted accounts are the best attack vector
in the game** — credential stuffing now buys the attacker a fast-lane pass.
**Why.** It gives the player a way to *reduce* friction without reducing security, which the current
design lacks entirely (every defense is a flat tax on everyone), and it opens the single best
Capability/Surface trade in the game.
**Interacts with:** A3.1, §2.6 credential stuffing, P1/P2.

---

## A4. Buildables: services and infrastructure

### A4.1 — The Surface Budget (Capability/Surface as a managed resource, not a ratchet)
**How it works.** P2 currently only goes one way: build things, permanently add monsters. Give it a
number and a valve. Every buildable carries a **Surface** value (1–10). Your **total Surface** is a
visible meter, and the wave generator's *composition* (not its size) is drawn from a pool weighted
by your surface profile: 40 points of application surface means the generator can afford SQLi,
deserialization and webshells; 6 points means it cannot.
The valve is three verbs the design currently lacks:
- **Decommission** — remove a service; surface falls immediately; you lose its capability and, if
  customers used it, you eat a churn event. (This is the missing counterpart to §5.7's rot.)
- **Narrow** — restrict a service to fewer entry points (internal-only, one VLAN, one region). Costs
  flexibility, halves that object's surface.
- **Wrap** — put a Classify or Meter defense directly on its edge. Reduces effective surface at a
  latency cost.
**Why.** P2 is the design's best idea and it currently has no player agency inside it. A budget plus
three verbs turns "more capability = more monsters" from a punishment into a *strategy*.
**Interacts with:** P2, §4.1 Build Card "Opens:" row, §2 wave generator, §5.7 deprecation.

### A4.2 — The Build Role taxonomy (nine roles, so the palette has a shape)
**How it works.** Every buildable — not just defenses — is tagged with one of nine roles, and the
build palette is organised by them: **Capacity** (more slots), **Throughput** (more bytes),
**Latency** (fewer ms), **Classify**, **Contain**, **Detect**, **Recover**, **Revenue** (a thing you
can charge for), **Policy** (a rule, not an object). The Coverage Grid (A2.1) reads from the same
tags.
**Why.** §4 currently has ~180 buildables organised by *what they are* (compute, storage, network,
facility, staff, business). That's an encyclopedia ordering, not a decision ordering. A player
mid-fight needs to find "something that adds Capacity," not "something in the compute tier."
**Interacts with:** §4 all, §8.8 build catalogue, §5.5 branches.

### A4.3 — Defense-in-Depth stacking rules (and the redundant-defense waste rule)
*The design has no rules for what happens when two defenses overlap, which means stacking is
either free or unknowable.*

**How it works.**
- **Coverage composes multiplicatively, latency composes additively.** Two Classify defenses with
  0.5 and 0.6 catch rates give 0.80 combined — but you pay both latency costs *and* both friction
  costs, and false positives also compound (1 − 0.96·0.97 = 6.9%).
- **Same-role stacking has hard diminishing returns**: the third defense in a role contributes at
  50% effectiveness, the fourth at 25%. The UI shows this as a greyed portion of the added bar.
- **Different-role stacking has a synergy bonus**: Classify + Contain gives a 15% reduction to the
  damage of anything that *does* get through, because it can't spread. Detect + Recover halves MTTR.
  Deter + Divert stacks into "they stop coming" (A2.2) twice as fast.
- **The Waste Indicator**: a defense whose catch is >80% covered by another defense renders with a
  small "redundant" pip and a running counter of the latency it has cost you for nothing. This is the
  single best anti-hoarding mechanic available.
**Why.** "Layered defense" is a phrase the document uses and never models. These three rules make
breadth mechanically better than depth, which is both true and good play.
**Interacts with:** §4.5, A2.1, A3.2.

### A4.4 — The Warm Bench (capacity you own but don't run)
**How it works.** A distinct capacity class: hardware racked, cabled, powered down. Costs 15% of
normal upkeep, occupies U and a power *reservation* (not draw), and takes 45–120 seconds to bring
into service with a visible boot sequence. Three grades, as an upgrade path:
**Cold** (racked, 8 min, cheapest) → **Warm** (powered, image loaded, 90s) → **Hot standby** (in
rotation at zero weight, 3s, full upkeep).
**Why.** §4.1 correctly says "panic-building mid-incident doesn't save you." That's a good rule, but
it leaves the player with *no* burst answer except serverless. The bench is the burst answer with an
honest price, it makes the §4.1 build-time rule survivable, and it creates the game's best
peacetime-prep purchase: "how much of my money is sitting idle so that a bad Tuesday is survivable."
**Interacts with:** §4.1 build time, §6.4 working capital, §7.7 degraded modes, A4.5.

### A4.5 — Headroom as an explicit, purchasable, visible thing
**How it works.** A single top-level stat, **Headroom %**, = (capacity − peak-of-last-3-waves) /
capacity, shown as a thin band above the utilization bar. The game states its own rule openly:
*below 25% headroom, every incident costs roughly double* (because the hockey stick, §7.1, means you
have no room to absorb a surprise). Headroom is boring, expensive and invisible in every other
strategy game; making it a named, tracked, scored stat is what makes over-building a *legible*
strategy rather than an accident.
**Interacts with:** §7.1 queueing hockey-stick, §6.9 scoring (Headroom should be a scored axis),
A4.4.

### A4.6 — Policies as a buildable class
**How it works.** The document scatters policies everywhere (mixed-vendor procurement, offboarding
checklist, escort policy, change control, abuse triage dial, refund policy, discount authority).
Make **Policy** a first-class build category with a consistent card: no capex, a **hands-per-month**
upkeep, an **effect**, and a **friction on your own organisation**. Policies are the only buildable
that can be *violated* — you can suspend a policy for one incident at a cost, which is exactly the
decision every real operator makes at 3am.
**Why.** It gives the abstract half of the game the same UI grammar as the concrete half, and
"suspend the change-control policy to fix this faster" is one of the best tense decisions available.
**Interacts with:** §4.9, §5.2 policy unlocks, §7.5 change freeze.

### A4.7 — The Decoy and the Sacrificial Service (Divert as a real build family)
**How it works.** §4.5 has one honeypot. Build it out into a family, because Divert is a whole
defense role (A2.1):
- **The Decoy Origin** — a fake IP that absorbs scanning and reconnaissance; makes your real origin
  harder to find; costs an IP and a small amount of your own confusion.
- **The Sacrificial Endpoint** — you deliberately leave one cheap, isolated, monitored service
  exposed *specifically* so attacks path there. It is the mazing lure: it shapes threat pathing the
  way a maze shapes creep pathing. If it's too convincing, a real customer uses it.
- **The Tarpit Lane** — suspected traffic is routed into a deliberately slow path (A3.1's Slow Lane
  at its extreme). Costs nothing but the attacker's time; catastrophic if you misroute a whale.
- **The Null-Route Pool** — pre-arranged blackhole IPs you can move a tenant onto in 3 seconds.
- **The Bait Account** — a fake customer record whose use in a dump proves your breach's date.
**Why.** Divert is the role that gives the player *agency over threat pathing*, which is the thing a
TD player most wants and which this design currently only offers passively.
**Interacts with:** §4.5 honeypot, A2.1, A3.1.

### A4.8 — The Queue Dial (one slider that exists on every node)
**How it works.** Every capacity-bearing node gets a **queue depth** setting, 0 to deep:
- **Shallow queue** — fast failure. Requests over capacity are dropped instantly with a `503`. Low
  latency for the served, high visible error rate, no stale work.
- **Deep queue** — nobody is refused, everybody waits. High latency, patience drains, and the
  classic disaster: you serve requests whose senders left four seconds ago, burning capacity on
  work nobody wants.
The correct setting is different per visitor archetype (an API client wants shallow + `Retry-After`;
a checkout wants deep; a stream wants shallow) and per level, which makes it a genuine recurring
decision rather than a set-and-forget.
**Why.** It is one slider, it exists everywhere, it is always consequential, it teaches the single
most counterintuitive thing in operations ("serving errors quickly beats serving nothing slowly"),
and it makes §8.7's "queue as physical stacking" mechanically meaningful.
**Interacts with:** §7.1 slots, §4.5 circuit breaker, §8.7.

### A4.9 — The Platform Chassis (modular builds, fewer objects)
**How it works.** Instead of 40 distinct server types, you buy a **chassis** (1U/2U/4U, a power
envelope, a slot count) and fill its slots with **role modules** — compute, storage, cache, network,
accelerator. A "database server" is a 2U chassis with 3 storage modules and a memory module. The
same chassis can be *re-roled* later for the cost of a maintenance window.
**Why.** Three wins: (1) it collapses an unmanageable palette into a composable one, (2) it makes
§6.6's hardware-cascade and §5.6's Repurposing mechanically real — you re-role rather than re-buy,
(3) it makes §7.4's "physical module insertion" the actual upgrade system instead of a visual
flourish.
**Interacts with:** §4.2, §7.4 upgrades, §6.6 obsolescence cascade.

### A4.10 — Rentals and Burst as a distinct economic class
**How it works.** A third column beside capex and opex: things you can rent **for the duration of
one incident**. Emergency scrubbing (per-hour, activates in 30s), burst transit (10× your commit for
an hour at 8× the rate), a contractor's hands for four hours, a competitor's spare capacity at
insulting prices, an emergency courier. All are expensive, all are *available*, and all are correct
sometimes.
**Why.** Every good strategy game needs an expensive panic button that is occasionally the right
play. Currently the only panic button is the Big Red Button, which is pure loss. Rentals give the
player a way to *spend money to win a fight*, which is the classic TD pleasure this design is
otherwise missing.
**Interacts with:** §6.3 costs, §4.4 scrubbing, §7.5 actions.

### A4.11 — The Two Jobs rule (an authoring law for buildables)
**How it works.** A buildable may do one job well, or two jobs at 60% each — never two at 100%. The
cheap combined box (the "does everything" appliance, the all-in-one control panel, the single server
running web+DB+mail) is genuinely correct at small scale and genuinely a trap at large scale, and
the game should sell it cheerfully at Tier 1.
**Why.** It gives the early game a real, satisfying decision ("one box or two?") that is *correct*
early and *wrong* later, which is the best kind of progression — the player outgrows their own
choice rather than being told it was wrong.
**Interacts with:** §4.1 Three-Column Law, §1.1 Tier 1, §7.4 scale up vs out.

### A4.12 — Warm-up and wind-down curves as a general property
**How it works.** §4.10's email IP warm-up pool is the only build in the document that takes time to
become good. Generalise: some builds ship at a fraction of their final effectiveness and improve
over in-game weeks — the behavioural fingerprinter (trains), the SEO garden (grows), a new hire
(ramps), a cache (warms), a reputation (earns), a runbook library (accretes), a peering relationship
(matures). And symmetrically, some decay when unused.
**Why.** It is the mechanic that makes *pre-building during calm* structurally necessary rather than
merely advised, and it gives the game a class of purchase whose value is "start it now, thank
yourself in three waves" — which is the entire emotional thesis of the design.
**Interacts with:** P3, §4.10, §5.7 rot.

### A4.13 — Staff shifts as a placement puzzle
**How it works.** Staff are not a headcount number; they are **blocks on a 24-hour strip**. Each
person covers 8 hours, has a preferred band, and degrades outside it. The player drags shift blocks
to build coverage. Gaps in coverage are visible as *dark bands on the clock* — and threats with the
"Timed" affix (§2.13) are drawn into exactly those bands.
**Why.** §4.8's on-call rotation and §7.5's night shift are both text. As a spatial strip they become
the game's cleanest resource-placement puzzle, and "there is a hole in your coverage at 03:00 and
something knows it" is a genuinely great pressure image.
**Interacts with:** §4.8, §7.5 night shift, §2.13 Timed affix, §9.2 On-Call Clock.

### A4.14 — The Standard Build (templates with a doctrine bonus)
**How it works.** The player saves a cluster as a named template (§7.2 has this as "stamp"). New:
if 70%+ of your estate conforms to your own saved templates, you earn a **Standardisation bonus**:
−25% MTTR, −30% toil, +1 effective hand, and config-management actions apply fleet-wide instead of
per-object. Every one-off "we'll fix it properly later" build lowers conformance.
**Why.** It converts §2.9's Config Drift from a punishment into a *positive economy* the player is
chasing, gives §9.3's "server naming and the label maker" joke a mechanical payload, and makes
"boring consistency" a thing you can see paying off on a meter. It's also the best possible carrier
for player expression: your templates are your architectural signature.
**Interacts with:** §2.9 config drift, §4.6 config management, §7.2 templates.

### A4.15 — The Dependency Contract (what a link promises)
**How it works.** §7.2's "connection contracts" are properties on a cable. Extend them into a
promise that can be *broken*: each link declares an expected latency, error rate and availability.
When the real numbers drift outside the declared band, the link flags **out of contract** — before
anything breaks. This is the game's earliest possible warning system and the thing a good monitoring
build buys you.
**Why.** Gives §7.6's "symptom vs cause" a concrete narrowing tool that is *earned* rather than
given, and it means that the answer to "which of my 200 links is the problem" is a single overlay
rather than a hunt.
**Interacts with:** §7.2, §7.6, §4.6 monitoring.

---

## A5. Unlocks and discovery

### A5.1 — The Anticipation Track (unlocking by prediction, not only by suffering)
*§5.1's scar-driven progression is the document's best idea and also its biggest determinism
problem: if the threat order is authored, the tech order is authored, and §9.6's "no optimal build
order" is violated on the first playthrough.*

**How it works.** A parallel, smaller unlock path where you **bet on what's coming**. Before each
level you may place up to two **Preparation Tokens** on Codex entries you have not been hit by.
- If that threat appears and you had the token, you unlock its counter *at half cost* and the level
  scores a "Called It" bonus.
- If it doesn't appear, the token is spent for nothing.
The forecast (§7.9), the trade press (§9.3), vendor advisories (§5.4) and your own Coverage Grid
holes all give you information to bet on. Tabletop Exercises (§4.5) let you *convert* a token into a
guaranteed partial unlock at a cash cost.
**Why.** It restores player agency to the tech tree, makes "reading the world" a rewarded skill, and
means two players' trees diverge from hour one rather than hour three. It is also *exactly* what
being a senior engineer is: buying the thing before it bites you.
**Interacts with:** §5.1, §5.4 Tabletop, §7.9 forecast, §9.3 trade press.

### A5.2 — Unlock drafts (pick one of three, and the other two stay visible)
**How it works.** Every postmortem offers **three** prevention purchases and you may take one at the
discounted post-incident rate. The other two remain in the tree at full price and are *visibly
marked as things you passed on*. Over a campaign the tree accumulates a visible history of the
roads you didn't take.
**Why.** §5.1's "Postmortem → Prevention" currently offers one concrete purchase, which is a
formality rather than a decision. Three-choose-one is the single most reliable way to create build
identity, and the "passed on" marks are free narrative.
**Interacts with:** §5.1, §5.8 whiteboard presentation, §6.9 postmortem screen.

### A5.3 — The Second Answer rule (every threat has ≥2 counters at different prices)
**How it works.** Authoring law: no threat may have exactly one counter. Each must have at least a
**cheap partial** (fast, leaky, has a downside) and an **expensive complete** (slow to get, real fix)
— and ideally a **lateral** (change the business rather than the infrastructure). Slowloris: raise
timeouts (cheap, kills slow mobile users) / event-driven proxy (expensive, correct) / put a CDN in
front and stop caring (lateral). Toll fraud: spend cap (cheap) / SBC + anomaly detection (expensive)
/ stop selling international dialling (lateral).
**Why.** Without this, the scar-driven tree is a lookup table. With it, every scar is a *decision*,
and the lateral answers are where the game's business half earns its place.
**Interacts with:** §5.2 (the whole table should be rewritten to this shape), §9.6 no optimal build.

### A5.4 — The Doctrine (a loadout you declare before a level)
**How it works.** Before each level you pick **one doctrine card** from those you've unlocked, and
it is visible to you all level as a framed card on the wall:
- **Belt and Braces** — +20% effectiveness on Recover-role builds, −10% on Capacity.
- **Fast and Loose** — deploys are 40% faster, bad-deploy chance +60%.
- **Sell the Sizzle** — +25% conversion, −15% headroom (marketing outruns ops).
- **Nobody Gets Paged** — automation effectiveness +30%, manual actions −20% speed.
- **Boring on Purpose** — entropy pressure −25%, growth rate −20%.
- **Scale Out** / **Scale Up** — mirrored modifiers to the §7.4 fork.
**Why.** This is the player-expression system the document lacks. It makes runs *readable to the
player themselves* ("this is my Boring on Purpose run"), it gives the campaign a build identity
without a skill tree, and it is trivially cheap content.
**Interacts with:** §5.5 mutually exclusive forks, §9.1 modes, A1.1 contract.

### A5.5 — Unlock cadence spec (how often, and what kind)
**How it works.** An explicit pacing budget, because unlock *feel* decays if the type is wrong.
Three grades, with a required rhythm:
- **A new verb** (you can now do something you couldn't) — the big one. Target: **1 per 25–35
  minutes**, never two in a level. Examples: automation, wiring mode, drain, anycast, delegation,
  a new hosting line.
- **A new object** (a thing to place) — **2–4 per level**.
- **A new number** (a buff, a modifier, a stat reveal) — as many as you like, but never the *only*
  unlock in a level.
Rule: **a level that grants only numbers is a level that feels like it granted nothing.**
**Why.** §5 has ~90 unlock ideas and no cadence. This is the tool that stops the tree feeling either
starved or like confetti.
**Interacts with:** §5 throughout, §1.7 pacing.

### A5.6 — Sealed capability (you own it, but it doesn't work until you drill it)
**How it works.** Certain purchases arrive **sealed**: the failover pair, the DR site, the restore
path, the generator, the incident-response plan, the runbook. They show a hollow icon and provide
**zero benefit** until you spend a drill on them. The drill costs a planned, announced, scheduled
outage window. Once drilled, the icon fills and the capability is real — and it re-hollows after N
months without exercise.
**Why.** This single mechanic converts the design's most-repeated real-world lesson ("the failover
you never tested is not a failover") from flavour text into the core loop, and it gives peacetime an
unambiguous, satisfying, *visible* job: turning hollow icons into filled ones. It is the best
possible use of §9.6's "make the boring thing beautiful."
**Interacts with:** §4.3 restore drill, §4.7 load bank, §5.7 knowledge decay, P3.

### A5.7 — The Debt Unlock (borrow a capability now, pay interest)
**How it works.** Any research node can be taken **on credit**: you get it immediately at 1.4× cost,
paid back over six in-game months, and while the debt is outstanding that node is **fragile** (a 1
in 8 chance per incident that it behaves like the cheap version). Thematically: you bought the tool
but didn't build the practice around it.
**Why.** Gives the player a legitimate way to answer a crisis the tree hasn't reached, without
handing out free power, and it creates the wonderfully authentic situation of owning a WAF that
mostly works.
**Interacts with:** §6.11 financing, §7.7 technical debt, §5.5 tree.

### A5.8 — The Discovery Ledger (find things you already own)
**How it works.** §5.4's Asset Discovery Scan is described as "always finds something" but is a
one-shot. Make it a recurring, cheap, *rewarding* action with a table: 40% you find a forgotten
machine (free capacity, unknown patch level), 25% an exposure (free surface reduction), 20% an
undocumented dependency (free fog removal), 10% a cost you forgot you were paying (free money), 5%
something genuinely strange (a narrative hook).
**Why.** Gives the player a reliable, low-stakes, *positive* thing to do in a quiet minute, which is
what peacetime needs most. It also mirrors the real experience of running infrastructure more
accurately than almost anything else in the document.
**Interacts with:** §5.4, §7.6 fog, P3.

### A5.9 — Knowledge as a transferable asset (the staff carry the tree)
**How it works.** §5.4 says "staff *are* tech tree nodes." Make it symmetrical and consequential:
each staff member holds 1–3 unlocked nodes as **personal knowledge**. A node held by only one person
is flagged **bus-factor-1** on the tree itself (not just on the person). **Documentation converts
personal knowledge into institutional knowledge** — the node's marker changes from a face to a
binder. Losing a person removes their undocumented nodes *from the tree*, greyed, recoverable by
re-research at half cost.
**Why.** It is the only way to make documentation feel like anything other than a chore, it gives
§2.9's Staff Burnout real teeth without being punitive, and it makes the tech tree itself a display
of organisational health.
**Interacts with:** §4.8 staff, §2.9 burnout, §9.2 documentation.

### A5.10 — The Vendor Trial (learn the tool before you can want it)
**How it works.** §5.4's Vendor Demo is a great idea used once. Make it systemic: once per level, a
vendor offers a **free 3-minute trial** of a tool you haven't unlocked. It works, fully, and then it
is taken away — leaving a visible "you had this and lost it" gap in your board. This is the single
most effective possible way to create *desire* for a specific unlock.
**Interacts with:** §5.4, §9.2 vendor personalities.

### A5.11 — Retiring a line, and the knowledge you keep
**How it works.** When you divest or close a hosting line (§5.7's Abandoned Wing), you keep a
**distillate**: one permanent cross-line bonus derived from what the line taught you (the Portable
Skill Table, A1.6). Closing your backup line permanently improves durability everywhere. This makes
shutting something down a *progression event* rather than pure loss.
**Why.** §5.7's rot and divestiture are all downside, which means players will never voluntarily
shrink — and "shrink deliberately" should be a winning move (§3.9 says so explicitly and then gives
it no reward).
**Interacts with:** §3.9 Controlled Shrink, §5.6 Type Mastery, §5.7.

---

## A6. Economy, money, and scoring

### A6.1 — Error Budget as the spendable in-combat currency
**The design's missing third resource, and the one that makes the whole thing play like a game.**

**How it works.** Your contract (A1.1) sets an availability commitment; the **error budget** is the
downtime it permits, expressed in minutes and drawn as a visible tank:

| Commitment | Budget / 30-day month |
|---|---|
| 99% | 7h 18m |
| 99.5% | 3h 39m |
| 99.9% | 43m |
| 99.95% | 21m 36s |
| 99.99% | 4m 19s |

It drains when you're down — but crucially, **you may also spend it deliberately**:
- **Take a maintenance window** — costs budget, grants safe change.
- **Risky deploy without canary** — costs 3 minutes of budget up front, ships instantly.
- **Reboot to fix instead of diagnosing** — costs 90 seconds, resolves now.
- **Drain and move a live workload** — costs budget, avoids a bigger later cost.
- **Reclaim**: every clean week refunds a small amount; a level with zero incidents banks a surplus
  you can carry to the next level.
When the budget is exhausted, the game **locks risky actions**: no deploys, no non-emergency
changes, change-control mandatory — exactly the real policy, arriving as a mechanical consequence
rather than a rule.
**Why this matters so much.** A tower defense needs something you *spend to win right now* with a
visible refill, or the moment-to-moment loop is just waiting. Money is too slow (it arrives monthly)
and hands are already the peacetime resource. Error budget is fast, visible, thematically perfect,
ties §1.6's difficulty selector to a live number, and turns "how much risk can I take today" into
the central question of every single minute. §6.8 already lists it as a HUD item — it deserves to be
the spine.
**Interacts with:** A1.1 contract, §7.5 all actions, §6.9 The Nines, §6.10 SLA credits, P3.

### A6.2 — The Three-Bucket Budget (a visible allocation the player argues with)
**How it works.** Every dollar is visibly allocated to one of three buckets, shown as a three-segment
bar under your cash: **Grow** (capacity, marketing, sales), **Defend** (security, redundancy,
insurance), **Sustain** (maintenance, staff wellbeing, documentation, drills, debt). The bar is not
a constraint — it's a *mirror*. The game names your shape ("*You are 71% Grow. That's a bet.*") and
the end-of-level card shows the industry-typical band (roughly 45/25/30 for a healthy operator).
**Why.** It gives the player one glance-able read on their own strategy, it makes §9.6's "peacetime
must be valuable" visible as a number they can be ashamed of, and it is the single cheapest way to
make an economy with 40 cost lines feel comprehensible.
**Interacts with:** §6.3, §6.8 HUD, §6.9 scoring.

### A6.3 — A concrete opening tuning spine
*The document has essentially no numbers. Here is a consistent starting set so the systems can be
argued about. All figures are "Tier 2–3, modern era, web hosting" and scale from there.*

**Time.** At 1× speed, 1 real second = 1 simulated minute of infrastructure time. The business month
advances every 4 real minutes. A 20-minute level = 5 in-game months = 1 quarter. Waves arrive on an
85–110 second cycle (a "day" of traffic compressed).

**Money.**
| Item | Capex | Monthly upkeep |
|---|---|---|
| Web node (2U, mid) | $3,200 | $190 (power, space, share of transit) |
| Database primary | $9,000 | $520 |
| Read replica | $6,500 | $380 |
| Cache node | $2,100 | $120 |
| Load balancer pair | $7,000 | $420 |
| Firewall | $2,500 | $150 |
| WAF (managed) | $0 | $600 + $0.40/1k requests |
| Monitoring stack (tier 2) | $1,200 | $240 |
| Backup vault (10TB, immutable) | $4,500 | $310 |
| Scrubbing retainer | $0 | $900 (always-on), $2,500/incident (on-demand) |
| Junior sysadmin | — | $5,400 loaded |
| Senior SRE | — | $11,000 loaded |
| Support T1 | — | $3,900 loaded |

**Revenue anchors.** Shared account $5.99/mo · VPS $22 · Managed WP site $35 · Dedicated $189 ·
Colo cabinet + 5kW $1,450 · Cross-connect $290 · GPU-hour $2.10 · Backup $0.019/GB-mo ·
Game server slot $0.85/slot-mo.

**Health ratios the game should teach by making them visible.**
- Upkeep as % of revenue: **<45% = under-built** (you'll be caught out), **55–70% = healthy**,
  **>80% = one incident from insolvency.**
- Support cost as % of revenue: >30% means your plan tier is wrong (unlocks cost-to-serve, §5.2).
- CAC payback must be under 60% of average tenure or the growth is a cash bonfire.
- Headroom (A4.5) below 25% doubles incident cost.

**Wave pressure.** `P(n) = 100 × 1.115^n × S(n)` where `S` is the sawtooth
`[1.0, 0.55, 1.3, 0.7, 1.55, 0.6, 1.75, 0.65, …]`. Role quota: at most two threat roles may exceed
30% of a wave's pressure; every fourth wave must introduce a role not seen in the previous three.

**Patience (ms budgets, bounce at 50% of curve).**
Skimmer 1,800 · Mobile Commuter 1,100 (arrives at 60% patience) · Desktop Regular 3,500 ·
Deep Reader 4,200 · Impulse Buyer 900 · Comparison Shopper 2,400 · Buyer/Checkout 3,000 across
6 hops · Enterprise Evaluator ∞ latency / finite *evidence* · API Client hard-fails at 5,000 ·
Streamer: no TTFB sensitivity, rebuffer tolerance 2 events per 10 minutes.
**Bounce curve:** sigmoid, 10% at 0.6× budget, 50% at 1.0×, 95% at 1.6×. Not linear — the cliff is
the point.

**Values (bounty).** Skimmer 1 · Deep Reader 4 · Comparison Shopper 6 · Impulse Buyer 28 ·
Checkout Buyer 50 · Power User 12 (but 5× load) · Enterprise lead 900 · Colo lease signature 20,000
· Reviewer ±180 reputation-equivalent · Influencer: 400 future spawns.

**Interacts with:** everything in §6; offered as a spine to be argued with, not as gospel.

### A6.4 — The Cost of a Nine (an explicit, visible cost curve)
**How it works.** The game shows, as an actual curve in the contract screen, what each additional
nine costs: roughly **3.5× the infrastructure cost and 2× the operational discipline per nine**.
99% is one box and a backup. 99.9% is redundancy. 99.99% is redundancy *plus* automation, because
humans are too slow. 99.999% is multi-site plus a practised organisation, and is not purchasable.
**Why.** The single most useful thing this game can teach, and it makes A1.1's contract slider a
*decision* rather than a difficulty toggle. It also gives the player the pleasure of correctly
choosing to under-promise and over-deliver.
**Interacts with:** A1.1, §6.9 The Nines, §6.5 pricing.

### A6.5 — Score the conversion rate first (making P9 real)
**How it works.** The headline score of every level is **Served / Arrived** — the percentage of
legitimate demand that reached the goal node. Threats blocked is a *secondary* stat, shown smaller.
And explicitly: a level survived with 100% uptime and 30% conversion scores **worse** than one with
two brief outages and 88% conversion.
**Why.** §9.6 states "the reward is letting things through" as a guardrail, and then §6.9's
scorecard leads with uptime and §6.9's Attacker Ledger gets a whole panel. The scoring must actually
implement the pillar, or players will optimise for what's on the card — which is throttling
everything into safety.
**Interacts with:** P9, §6.9, §1.5 Launch Day (whose trap becomes the general rule).

### A6.6 — The Efficiency Frontier (a score for elegance)
**How it works.** A second scored axis: **outcome per dollar**, plotted against a par curve derived
from the level's design. Beating the curve earns medals; massively over-building to win earns a
"Bought It" tag. Crucially, the frontier is shown *during* play as a faint line on your spend graph,
so over-building is a visible choice rather than a post-hoc scolding.
**Why.** §6.9's "Par and efficiency medals" is one line. Made visible in-level, this is the mechanism
that makes §4.1's "no pure upgrades" bite: buying more of everything is now legibly bad.
**Interacts with:** §6.9, §4.1.

### A6.7 — The Margin Death Zone
**How it works.** A visible band on the pricing screen. Below a certain price point, *more customers
make you less money* — because transaction fees are fixed per charge, support cost is per-account
and abuse rate is per-account. The game draws the band and lets you price into it. Indicatively: at
$3/mo with a 2.9%+30¢ fee, 13% of revenue is gone before you serve a byte, and 0.35 tickets/account/
month at $18/ticket puts you underwater at any support quality above "none."
**Why.** It makes §6.5's race-to-the-bottom a visible cliff rather than a moral, and it gives the
player a genuine reason to raise prices — which is the hardest real decision in the business and
currently has no in-game pressure toward it.
**Interacts with:** §6.5, §6.3 transaction costs, §2.10 price war.

### A6.8 — Insurance vs redundancy as an explicit decision curve
**How it works.** For each risk, the game can show two purchasable curves: **prevent** (redundancy,
capacity, drills — expensive, reduces probability) and **absorb** (insurance, reserves, credits,
contract terms — cheaper, reduces consequence). Overlay them and the crossing point is where the
correct answer flips. Low-probability/high-consequence risks (fire, total loss, lawsuit) sit on the
absorb side; high-probability/moderate risks (disk failure, bad deploy) sit on the prevent side.
**Why.** Gives §4.9's insurance products and §4.7's facility redundancy a shared decision grammar
instead of being two unrelated shopping lists, and it is a genuinely instructive model.
**Interacts with:** §4.7, §4.9, §6.3.

### A6.9 — The Attribution Ledger (making P10's lag learnable)
**How it works.** Every delayed consequence is *stamped with its cause at creation time*, invisibly,
and the ledger reveals the chain when it lands: "*Churn +6 this month. Source: support headcount cut,
89 days ago.*" Over a campaign the ledger becomes a searchable history of your decisions and their
actual outcomes, sortable by "biggest surprise."
**Why.** P10 ("almost nothing has an immediate result") is the design's most distinctive claim and
its most dangerous one: a 90-day lag with no attribution is indistinguishable from randomness, and
players will read it as the game being arbitrary. The ledger is what converts lag from noise into a
lesson.
**Interacts with:** P10, §7.5 the 90-day lag, §6.9 postmortem, §8.8 Obligation Rail.

### A6.10 — The Runway Bar as the actual health bar
**How it works.** Replace "cash" as the primary top-left number with **months of runway** (cash ÷
net burn), drawn as a horizontal bar, with cash as the smaller secondary figure. Under 6 months the
bar changes colour; under 3, the UI tone shifts (§6.4 already proposes this) and a subset of
long-horizon purchases grey out with the reason "*you can't afford to wait for this.*"
**Why.** §6.1 flags the two-currency confusion risk (Cash vs MRR) and proposes two meters. Runway is
the single number that *resolves* it: it contains both, it is intuitively a health bar, and it makes
the growth-consumes-cash tension legible without teaching accounting.
**Interacts with:** §6.1, §6.4, §8.8 HUD.

### A6.11 — Fire sale, sale-leaseback, and the dignified retreat
**How it works.** Three additional cash instruments that are *shrinking* rather than borrowing:
- **Sell a line of business** — immediate cash at 8–14× its monthly profit, permanent loss of that
  revenue and its tech, keeps the distillate (A5.11).
- **Sale-leaseback** — sell your hardware to a financier and rent it back. Big cash now, worse unit
  economics forever. Deliciously realistic.
- **Sell your IPv4 block** — a real asset with a real market price, and losing it forces IPv6/CGNAT
  which costs you a slice of visitors.
**Why.** §6.11 is all borrowing. A player in trouble currently has "take expensive money" as the only
lever, which makes the death spiral one-dimensional. Shrinking should be a legitimate, painful,
survivable option, and §7.7's "three exits from the death spiral" needs actual doors.
**Interacts with:** §6.11, §7.7, §3.9 Controlled Shrink.

### A6.12 — The Goal Card (declare your win condition at the start)
**How it works.** §6.10 offers six win conditions and never says how the player chooses one. Fix:
at campaign start (and re-choosable once per chapter, at a cost) the player declares a goal — The
Exit / The Institution / The Nines / The Scale / The Niche / The Independent. The declared goal
**reweights the score card, the Board's mandates, and which opportunity events appear**. An
Institution player gets offered long contracts and community partnerships; an Exit player gets
offered acquisitions and growth-at-any-cost deals.
**Why.** Multiple win conditions only create replay value if the player commits to one; otherwise
they're just a menu at the end. This makes the campaign's *content stream* respond to the player's
stated intent, which is enormous value for very little work.
**Interacts with:** §6.10, §1.6 Board Meeting mandates, §9.1 business modes.

---

## A7. Core gameplay mechanics

### A7.1 — Inspection Depth (the mechanic behind the Two Lanes)
**How it works.** Formal statement of the A3.1 layer as a core rule. Every node on a path may be set
to one of four inspection levels, which is a per-node slider, not a purchase:
**Pass-through** (0ms, 0 confidence) → **Sample** (1 in 20 requests inspected; cheap; catches
sustained patterns, misses one-shots) → **Inspect** (full cost, full confidence contribution) →
**Challenge** (active: it asks the client to do something, which machines fail and humans resent).
The tactical texture: **Sample is the correct default and almost nobody realises it**, because it
catches the volumetric and the sustained mimic for 5% of the latency, and misses exactly the
single-shot exploit that a WAF should be catching anyway.
**Interacts with:** A3.1, A3.2, §4.5, §2.4.

### A7.2 — The Settling Window and Change Interference
**How it works.** Every change (deploy, config, capacity, topology) enters a **settling window** of
60–180 seconds during which its effects are still landing. Rules:
- Two overlapping settling windows multiply the failure probability of both by 1.6×.
- **Attribution requires isolation**: if an incident occurs while two changes are settling, the
  postmortem cannot determine which caused it, and **you do not get the unlock**.
- A "Change In Flight" counter sits in the HUD; the Standardisation and QA builds widen how many you
  may safely run at once.
**Why.** This is the missing rule that makes change management, maintenance windows, canaries and
change freezes into *mechanics* rather than flavour. It gives the player a reason to slow down that
isn't a moral, and it links pacing directly to progression via the attribution clause, which is a
genuinely novel coupling.
**Interacts with:** §7.5 maintenance windows/freeze, §2.9 bad deploy, §5.1 postmortem unlocks.

### A7.3 — Classification confidence as a probability, not a boolean
**How it works.** Defenses do not "catch" or "miss." Each produces a **confidence score** for each
unit, and the player sets an **action threshold** per defense: below it, pass; above it, act. The UI
shows the live distribution as a histogram with your threshold as a draggable line — with the
overlap region (where good and bad traffic have the same score) shaded, because **that overlap is
the entire game.** Buying better classification narrows the overlap; it never eliminates it.
**Why.** It is the honest model, it makes the false-positive tradeoff a *picture the player drags*,
and it is the single best expression of P1 available. It also gives every Classify build an obvious,
consistent upgrade axis: narrow the overlap.
**Interacts with:** §3.1 classification-not-destruction, §4.5, §8.2 purple, A3.1.

### A7.4 — The Decision Highlight (making the board's choices legible)
**How it works.** At any moment, the game marks **at most three** things as *decisions* — a subtle
white corner bracket plus an entry in a small "Now" list. Everything else is information. The
selection rule: a decision is something where (a) two options are both viable, (b) the window is
closing, and (c) the player has the resources. It is *not* a hint system — it tells you where the
fork is, never which branch.
**Why.** §8.9's readability work is all about seeing *state*. Nothing in the document helps the
player see *choice*, and at Tier 4 with 300 objects the hardest problem is not "what's red" but
"what am I actually being asked." This is a direct implementation of §7.9's three-clock philosophy
applied to agency rather than to time.
**Interacts with:** §8.8 HUD, §7.9 three-clock rule, §7.6 overlays.

### A7.5 — The Board Diff (what changed since you last looked)
**How it works.** A toggle that renders the board as a diff against a snapshot: the state N minutes
ago, or when you last visited this camera bookmark, or before the current incident began. Additions
glow green, removals ghost red, changed values show deltas. Essential in multi-line/multi-site play
and in any level with a slow clock.
**Why.** A game with a 20-minute level, four altitudes, multi-line tabs and a business month that
advances off-screen *must* answer "what happened while I was elsewhere," and currently the only
answer is the incident ticker. The diff is also the correct UI for §1.16's time-skip levels and for
§1.2's Acquisition.
**Interacts with:** §8.3 camera bookmarks, §7.8 multi-line, §8.8 Timeline Ribbon.

### A7.6 — The Watchlist (pin what you're worried about)
**How it works.** Pin any object, link, customer or metric to a compact rail. Pinned items keep a
live sparkline and are exempt from LOD collapse and label culling. Pinning is a tiny act of
*intention* and the game scores it: the postmortem shows whether the thing that broke was pinned
("*You were watching it. You just couldn't get to it.*" vs "*You weren't looking there.*").
**Why.** Cheap, universally useful at scale, and the postmortem hook turns it into a self-assessment
tool rather than just a convenience.
**Interacts with:** §8.9 LOD, §6.9 postmortem, §7.6.

### A7.7 — Snapshot and Restore of configuration (as a gameplay verb)
**How it works.** Take a named snapshot of your whole configuration (not data — config: thresholds,
policies, routes, weights, shed ladders). Restoring is a change (it settles, A7.2), takes ~40
seconds, and **costs nothing but time**. This makes experimentation safe, which makes tuning fun.
The game encourages naming them ("*pre-blackfriday*", "*before I touched the WAF*").
**Why.** §7.4's tuning system is the design's real upgrade layer, and a tuning layer without a
revert is a tuning layer players won't touch. The named snapshots are also a lovely artifact and a
comedy source.
**Interacts with:** §7.4 tuning, §7.3 undo ghost, §7.7 rollback.

### A7.8 — Batch and Fleet operations (as an earned capability, not a UI feature)
**How it works.** Early game, every action is per-object — deliberately. The unlock ladder is:
**select many** → **apply one action to many** (with a progress bar and a failure rate per object)
→ **apply by tag/query** ("all nodes with patch lag > 20 days") → **standing rules** ("keep this
true"). Each step is a discrete, *enormously felt* unlock.
**Why.** §5.4's Runbook Ladder does this for *incident responses*. The same ladder should exist for
*fleet operations*, because that is where the micromanagement problem lives. Making it an unlock
means the pain of doing it by hand is the tutorial for why automation matters — which is exactly the
design's stated philosophy (§5.1), just applied to the right problem.
**Interacts with:** §4.6 config management, §5.4 Runbook Ladder, §7.5 delegation.

### A7.9 — Policy authoring as the late-game verb
**How it works.** From Tier 4 the player's primary interaction shifts from *acting* to *writing
rules that act*. A simple, readable, ordered rule list:
`WHEN [condition] IF [guard] THEN [action] ELSE [escalate to]`, built from a constrained vocabulary
(no scripting language — a card composer). Rules are visible, ordered, and **wrong rules execute
faithfully**. The game shows a live "rules fired" ticker so you can watch your own policy work or
misfire.
The essential tension: a rule that is 95% right is better than a human who is 100% right and asleep,
and *finding out which 5%* is the late-game diagnosis puzzle.
**Why.** §7.5's "Executive attention as a tiny pool" says the game takes the controls away and gives
you a company — which is a brilliant arc that currently has nothing to *do* at the far end.
Policy authoring is the thing you do instead, it is genuinely engaging, and it makes A1.17 (the
Apprentice level) the tutorial for the endgame.
**Interacts with:** §7.5, A1.17, A4.6 policies as buildables.

### A7.10 — The Change Budget (how many changes per window)
**How it works.** Each maintenance window has a **slot count** — how many changes you may safely
land — derived from your QA build, your standardisation score (A4.14) and your team size. Exceeding
it is possible and applies the interference penalty (A7.2). Between windows, a backlog of desired
changes accumulates visibly, which makes §1.5's Change Freeze scenario mechanically automatic
("*the freeze ends and 23 changes want to land at once*").
**Interacts with:** A7.2, §7.5 change freeze, §1.5.

### A7.11 — The Drill as a scored action type
**How it works.** Drills become a first-class action with their own small reward structure:
`Failover drill · Restore drill · Power drill (load bank) · Incident tabletop · Game day (chaos)`.
Each costs a window and hands, each produces a **Confidence** value on the thing drilled, and each
has a small chance of **finding a real problem** — which is a free save and feels fantastic.
Confidence decays (A5.6). The game tracks **"drills run"** as a scored axis, and the Ratchet Audit
level (A1.14) is graded on it.
**Why.** Peacetime needs a scored loop of its own or it is dead air, no matter how many times §9.6
insists otherwise.
**Interacts with:** A5.6 sealed capability, §4.5 chaos lab, §6.9 scoring.

### A7.12 — The Dual Clock, formalised
**How it works.** Two clocks, always both visible, at different granularities, explicitly:
- **The Ops Clock** — seconds/minutes. Governs traffic, incidents, actions, waves. Affected by speed
  controls and pause.
- **The Business Clock** — days/months. Governs billing, payroll, churn, contracts, the 90-day lag,
  hiring, audits. **Does not pause during an incident** — it keeps advancing while you firefight,
  which is precisely the feeling.
Rule: an action may belong to only one clock. A restart is an ops action; a hire is a business
action. The player never has to convert between them.
**Why.** §7.5's "the month as the tick" proposes two timescales and never says how they interact.
Stating the rule prevents the single worst possible outcome: a game where you pause to fix a server
and accidentally pause your payroll.
**Interacts with:** §7.5, §6.4 invoice calendar, §7.9.

### A7.13 — Two-Action Rule (an interaction-design law)
**How it works.** Nothing that must be done *during* an incident may take more than two inputs.
Everything deeper — tuning, wiring, policy authoring, plan building — is a peacetime activity and is
allowed to be as deep as it likes. Concretely: every object's inspector has an "Act" row of at most
four one-click emergency verbs (drain, restart, isolate, shed) at the top, above everything else.
**Why.** A game with this much configuration depth will be unplayable under pressure unless the
crisis verbs are separated from the design verbs. This is the rule that makes both halves possible.
**Interacts with:** §8.8 Inspector Faceplate, §7.5 hands.

### A7.14 — The Handoff (what the player must say to the machine)
**How it works.** When you set an autopilot/delegation policy or go off-shift, you write a
**handoff**: pick three things from a list ("watch the replica lag," "the cache node is new," "don't
touch rack 4"). What you include is what your staff/policies will actually act on; what you omit,
they won't. Omitting the thing that breaks is the game's best self-inflicted wound.
**Why.** §9.1's Co-op NOC has "shift handoff" as its best idea, trapped inside a multiplayer mode.
Pulled into single-player as a delegation mechanic, it is the most interesting possible expression
of "you cannot be everywhere," and it is a genuinely novel strategy verb.
**Interacts with:** §7.5 delegation, §9.1 Co-op, A7.9 policies.

### A7.15 — Bounded Fog (a fairness contract for §7.6)
**How it works.** Three hard rules on the fog-of-infrastructure system, because unbounded fog is
just a guessing game:
1. **Ground truth is never hidden.** The Site Preview Window and the Pulse Strip always tell the
   truth (see A2.8). You can always find out *whether* you have a problem.
2. **The cause is always findable with tools you could have bought.** Never with tools that don't
   exist. The postmortem must always be able to say which purchase would have shortened this.
3. **Fog costs time, never certainty.** An uninstrumented system can always be diagnosed by hand —
   it just takes 4–8× as long and consumes hands. Monitoring buys *speed*, not *possibility*.
**Why.** Without rule 3 in particular, fog converts into "you lose because you didn't buy the right
thing three levels ago," which is the least fun failure mode in strategy games.
**Interacts with:** §7.6, §5.4 Fog of Instrumentation, §6.9.

### A7.16 — Recovery as a puzzle with a stated correct order
**How it works.** §7.7 says recovery order matters. Make it explicit and playable: after a full
outage, services show a **dependency-ordered list** with lock icons on anything whose dependency
isn't up yet. Starting something out of order is possible (the lock is a warning, not a block) and
produces a specific, named failure (cold-cache stampede, auth storm, replication confusion). A
written runbook auto-sorts the list; no runbook means you sort it yourself under a clock.
**Why.** Converts "recovery order matters" from a sentence into a 45-second minigame with a correct
answer, a satisfying failure mode, and an obvious reason to have written things down.
**Interacts with:** §7.7, §4.6 runbooks, §2.3 thundering herd.

### A7.17 — The Blast Radius Preview (hover-before-you-buy)
**How it works.** While *placing* any object, the ghost shows not just power/heat (§7.3 has that) but
the **new blast radius** — everything that would now fail with it, highlighted, with a count. A
placement that increases your worst-case blast radius shows the delta in red. This is the single
most useful piece of pre-commit information the game can give, and it makes §6.9's Blast Radius
Rating something you can play toward rather than be graded on.
**Interacts with:** §7.1 blast radius, §7.3 ghost build, §6.9.

### A7.18 — Aggro shaping (the player's control over threat pathing)
**How it works.** Threats path toward the **most attractive reachable node**, where attractiveness =
`exposure × value × (1 − apparent_hardening)`. All three terms are player-controllable:
- **Exposure**: which ports/paths are reachable (firewall, segmentation).
- **Value**: what's actually there (move the database behind a tier and it stops being the front
  door).
- **Apparent hardening**: what the attacker can *see* — a visible WAF banner, a challenge page, a
  honeypot's exaggerated attractiveness. **Appearance and reality can differ**, and the gap is a
  strategy.
The security-surface overlay (§7.6) renders exactly this attractiveness field as brightness, so the
player can literally see where threats will go and rearrange to change it.
**Why.** This is the other half of mazing: A3.1 shapes where *visitors* go, this shapes where
*threats* go, and the two together give the design the strategic depth a TD needs.
**Interacts with:** §2.1 threat pathing, §7.6 security overlay, A4.7 decoys.

### A7.19 — The Attention Heatmap (a post-level self-portrait)
**How it works.** The game records where the camera was and what was selected, and the postmortem
shows it as a heat map over the board: where you spent your attention versus where the damage
actually happened. Players will find this uncomfortable and share it constantly.
**Why.** In a game whose central scarce resource is attention, the post-level readout should be
about attention. It's also the cheapest possible "you were looking at the wrong thing" lesson, and
it requires no simulation work at all.
**Interacts with:** P4, §6.9 postmortem, A7.6 watchlist.

### A7.20 — Difficulty Director with an honest face
**How it works.** A dynamic-difficulty system that is **visible**: a small "Heat" gauge in the corner
showing how hard the generator is currently pushing, and *why* ("you're 3 waves ahead of par,"
"you're on a losing streak"). It adjusts only the **sawtooth trough depth** and the **entropy
budget** — never the composition of a telegraphed wave, and never during an incident.
**Why.** Hidden rubber-banding is the fastest way to lose a systems-literate audience's trust, and
this audience is unusually systems-literate. Showing the dial makes it a feature; hiding it makes it
a betrayal.
**Interacts with:** §1.7 Pressure Budget, §1.7 Comeback Curve, A2.11.

---

## A8. Visuals and presentation

*Through the design lens: visuals here are judged on whether they make a **decision** legible, not
just a state.*

### A8.1 — The Tradeoff Bar on every build card
**How it works.** A single horizontal two-sided bar on every build card and every placement ghost:
**capability to the right in cyan, cost-of-capability to the left in amber** (latency + friction +
surface, normalised). A strictly-good build would show an empty left side — which is the visual
proof that §4.1's Three-Column Law is being obeyed. Reviewers can spot a broken buildable in a
screenshot.
**Interacts with:** §4.1 Build Card, §8.8 catalogue.

### A8.2 — The Cost Ghost (lifetime cost, not sticker price)
**How it works.** Hovering a build shows two numbers with equal prominence: the purchase price, and
**"$X over the rest of this level"** — upkeep, power, licence, expected support load, expected
ticket volume. The second number is usually the bigger one, and showing it is what makes P3
(peacetime is the boss) something the player internalises *before* they die of payroll rather than
after.
**Interacts with:** §6.3, P3, §4.1.

### A8.3 — The Confidence Blur
**How it works.** Render classification uncertainty as **blur**, not as a separate icon: a unit the
system is 50% sure about is visually indistinct; as confidence rises through the inspection pipeline
(A7.1), it sharpens into a crisp circle or triangle. The whole board's visual sharpness therefore
becomes a live readout of how well you're seeing.
**Why.** §8.2's "purple means we don't know yet" is excellent but binary. Blur is continuous, reads
instantly at every zoom, requires no legend, and makes the act of buying classification feel
literally like putting on glasses.
**Interacts with:** §8.2, A7.3, §2.4 mimics.

### A8.4 — The Regret Marker
**How it works.** During the postmortem replay, the game places small numbered markers at the two or
three moments where a different action was available and would have mattered — with the cost of the
road not taken. Never during play; only in review. It is the single most efficient teaching device
available because it uses the player's own run as the lesson.
**Interacts with:** §6.9 postmortem, §5.4 The Graph You Didn't Have.

### A8.5 — The Unified Clock Ribbon (fixing the three-clock contradiction)
**How it works.** One horizontal ribbon at the top containing **all** timed things, on two tracks:
ops-clock items above, business-clock items below, each as a small labelled pip approaching the
"now" line. Cert expiry, the next wave, the backup window, payroll, the audit, the renewal wave, the
fuel gauge — all in one place, all comparable. The three-clock rule (§7.9) is then enforced as a
**promotion rule**: the three nearest/most-consequential pips are enlarged and given colour; the
rest are small grey ticks.
**Why.** §7.9 demands exactly three clocks and the document proposes roughly twenty timers. The
promotion ribbon is the only way to honour both — you keep all the timers and the *interface*
guarantees the player only has to hold three in their head.
**Interacts with:** §7.9, §8.8 Obligation Rail + Timeline Ribbon (this merges them), §2.9 cert
expiry et al.

### A8.6 — Player-authored vs system-default rendering
**How it works.** Anything the player has explicitly configured — a threshold, a policy, a weight, a
shed ladder rung, a priority class — renders with a small white "hand-set" tick. Defaults render
plain. At a glance you can see how much of your system is deliberate and how much is inherited.
**Why.** In a game whose whole late-game is configuration, "what did I actually decide here?" is the
most common question, and it is currently unanswerable. It also makes inherited/acquisition boards
(§1.2) instantly readable: a board with no white ticks anywhere is a board nobody has thought about.
**Interacts with:** §7.4 tuning, §1.2 Acquisition, A7.9 policies.

### A8.7 — Before/After overlay for any change
**How it works.** Any change you make can be toggled between "before" and "after" rendering for 30
seconds afterward, with the delta on key metrics floating beside it. Turning on the WAF and toggling
back and forth to see the latency ladder grow and the magenta thin out is a tiny, repeatable,
delightful moment of comprehension.
**Interacts with:** §3.1 Latency Ladder, A7.5 board diff, §7.4.

### A8.8 — The "It Was Fine" replay stamp
**How it works.** When a threat is fully absorbed with no impact, the game does *not* stay silent —
it prints a tiny, unobtrusive stamp on the Timeline Ribbon with the absorbed damage value. Over a
level these accumulate into a visible record of everything that didn't happen to you.
**Why.** §4.8 correctly identifies that the security engineer "produces no visible revenue — the
classic budget-cut victim" and proposes a "losses prevented" figure. A stamp trail on the timeline is
better than a figure: it's spatial, it's cumulative, and it means the player *sees* their defensive
spend working continuously rather than only when it fails.
**Interacts with:** §4.8 security engineer, §8.8 Timeline Ribbon, §6.9.

### A8.9 — Silhouette-first authoring test for the visitor set
**How it works.** A production acceptance test: every visitor archetype and every threat class must
be identifiable from a **16px black silhouette in motion, with no colour**, by a playtester who has
seen it three times. Anything that fails gets a new silhouette or gets merged with whatever it is
being confused with. This is the practical enforcement of §8.2's Diamond/Circle/Triangle law and it
is also a *content pruning tool*: a threat you cannot silhouette is a threat you don't need.
**Interacts with:** §8.2, §8.5, §2.1 five-axes cut rule.

### A8.10 — The Two-Screenshot Test for hosting types
**How it works.** Acceptance test for the variety engine: two screenshots, one from each of two
hosting types, shown to a player who has played 4 hours. They must name both. If they can't, the
type's Five-Asset Skin Kit has failed and one of its five assets needs replacing — usually the
signature meter or the density signature, which are the two that carry the most identity per pixel.
**Interacts with:** §8.10, §0.2 skin kit.

### A8.11 — Rendering "nothing is happening" as an achievement, not an absence
**How it works.** A healthy, quiet board should have one distinctive positive visual — not merely
the absence of red. Proposal: **the Cadence** — when everything is inside its dependency contracts
(A4.15), all the flow pulses synchronise to the global heartbeat (§8.9) and the room visibly
"breathes together." A single object out of contract breaks the sync, and you can see it from across
the room before any alert fires.
**Why.** §8.9's Quiet Frame Test says a healthy screenshot must be calm; §9.6 says peacetime must be
valuable. Calm-as-absence is boring. Calm-as-*synchrony* is beautiful, is a diagnostic, and turns
"everything is fine" into something worth looking at.
**Interacts with:** §8.9 Heartbeat Sync, A4.15, P3.

### A8.12 — Decision-cost colour: spending vs committing
**How it works.** A visual distinction the UI currently lacks: actions that spend a **reversible**
resource (money, error budget you can rebuild) render in gold; actions that spend an **irreversible**
one (a one-way door, a data deletion, a contract signature, a customer terminated) render with a
distinct hatched border and require a two-stage confirm that names the consequence. §7.7 already
calls for marking one-way doors; make it a colour class rather than a symbol so it survives at every
zoom and in peripheral vision.
**Interacts with:** §7.7 one-way doors, §8.2 colour language.

---

## A9. Anything else — modes, twists, meta

### A9.1 — "The Consultant" (the 20-minute roguelite this design is secretly perfect for)
**How it works.** A run is a career of short jobs. Each job is a stranger's infrastructure, already
built (procedurally, from a library of architectural *bad habits* rather than random noise), already
in trouble, with a stated goal and a 15–20 minute clock. You bring your **toolbag**: 5 items drafted
at run start and expanded between jobs. Between jobs you choose the next contract from three cards
with visible risk/reward. Death is running out of reputation, not money.
**Why.** The campaign is a 25-hour commitment. This mode is the same systems in a 25-minute
commitment, it is the best possible showcase of the diagnosis loop (which is the game's most
distinctive pleasure), and it is where the procedural-generation work pays off. §9.1's "Incident
Mode / Blitz Sev-1" is a single mission; this is the run structure around it.
**Interacts with:** §9.1 Incident Mode, §1.2 Defend Someone Else, §5.4 discovery.

### A9.2 — The Architectural Bad-Habit library (procedural generation that isn't noise)
**How it works.** The generator for inherited/consultant boards doesn't randomise topology — it
composes from a library of **recognisable real mistakes**: "everything on one PDU," "the replica is
the backup," "one enormous box," "shared cache for sessions and pages," "monitoring inside the thing
it monitors," "the firewall rules nobody understands," "two datacenters, no quorum," "a cron on a
laptop." Each habit has a signature look, a characteristic failure, and a Codex entry.
**Why.** Procedural infrastructure generated from noise is unreadable and unfair. Generated from a
vocabulary of mistakes, it is *legible, teachable, and funny* — and the player's growing ability to
recognise a habit at a glance is the deepest skill the game can offer.
**Interacts with:** A9.1, §1.2 The New Hire / The Acquisition, §5.4 discovery, §9.5 education.

### A9.3 — Draft-based PvP (attack decks vs defense decks)
**How it works.** Both players draft: one a threat deck (roles, affixes, budget), one a defense deck
(builds, policies, doctrine). Then the attacker spends their budget against the defender's board
over eight timed waves, and the defender may spend a small reserve live. Asymmetric, snappy,
spectator-legible, and it turns §2.1's role taxonomy and A2.1's Coverage Grid into a competitive
metagame.
**Why.** §9.1's Red vs Blue is described as live and free-form, which is very hard to balance. A
draft-and-deck structure is the proven way to make asymmetric PvP work and it costs almost no new
simulation.
**Interacts with:** §9.1 Versus, A2.1, A2.12 affixes.

### A9.4 — The Postmortem Club (asynchronous social, zero multiplayer code)
**How it works.** After any incident you may publish your postmortem — the timeline, the graphs, the
root cause you named, and a one-paragraph write-up. Other players read them, vote "would have caught
it / wouldn't have," and the best ones surface. Your published postmortems accrue **industry
reputation** that feeds your hiring pool and your enterprise conversion, in your own single-player
campaign.
**Why.** It is exactly what this industry actually does, it turns the game's most distinctive screen
into social content, and it needs no netcode beyond a blob store.
**Interacts with:** §6.9 postmortem, §5.4 conference talk, §3.6 community presence.

### A9.5 — "Explain This Incident" (an accessibility and onboarding feature that is also a design test)
**How it works.** A button, available any time, that generates a plain-language causal chain of the
current or last incident from the actual simulation state: "*The cache node restarted at 04:12. The
database, which is sized for a warm cache, went to 100% utilisation in 40 seconds. Web workers
queued. The load balancer's health checks timed out and removed all four web nodes. Nobody was
served for 90 seconds.*"
**Why.** Two reasons. One: it is a genuine accessibility feature for players who can't hold six
systems in their head. Two, and more importantly: **if the engine cannot generate that sentence,
the simulation isn't coherent.** It is a design test disguised as a feature.
**Interacts with:** §7.6 diagnosis, §9.5 education, §6.9.

### A9.6 — The Tutorial Is An Interview
**How it works.** §9.4 proposes "the tutorial is a job." Sharpen it: the tutorial is a **working
interview**. A small host has a problem; you are given 10 minutes and a terminal; you are watched.
Whatever you do is your tutorial, and how you do it seeds your first Doctrine card (A5.4) and your
opening Codex entries. A player who reads the logs starts with a Sense bias; one who buys hardware
starts with a Scale bias. No skipping needed — it's short and it's already the game.
**Interacts with:** §9.4, A5.4 Doctrine, §5.1.

### A9.7 — Hot-seat "Two Companies, One Keyboard"
**How it works.** Two players alternate months in the *same* market, each running their own company,
each seeing the other only through public signals — the status page, the trade press, review scores,
price changes. Turn length is one business month. Cheap, local, and the information asymmetry is the
entire game.
**Interacts with:** §9.1 Competitive Market Mode, §2.11 The Competitor.

### A9.8 — "The Long Weekend" as an offline/idle layer
**How it works.** Optional: when you close the game, the company keeps running on your policies for
up to 48 real hours. On return you get a short report and a small number of decisions that were
queued for you. Nothing catastrophic can happen offline (hard rule), but a *lot* can drift.
**Why.** It is thematically perfect — the whole point of automation is that it runs when you're not
there — and it is the most natural idle-layer any strategy game has ever had. The hard rule against
offline catastrophe is non-negotiable or it becomes a punishment for having a life.
**Interacts with:** §7.5 delegation, §1.5 Long Weekend, A7.9 policies.

### A9.9 — The Ruleset Card as a moddable data file, shipped with the game
**How it works.** §9.4 proposes modding the skin kit. Go further and ship the **ruleset card editor**
in the base game: unit definition, goal node, scarce resource, patience analog, threat mix weights,
five skin assets. A new hosting type is then a community artifact, and the game's variety engine
becomes its content pipeline. Publish the twenty official types as editable cards so modders learn
from them.
**Interacts with:** §0.2, §9.4, §9.7 workshop.

### A9.10 — The "What Would Break" sandbox tool
**How it works.** In sandbox and in the lab, a tool that lets you *pick any object and kill it* and
watch the consequence at 4× with the cascade fuse (§7.7) visible, then rewind. Not a chaos monkey —
a **thought experiment machine**. Players will use it to audit their own builds, and its existence
makes the resilience half of the design something you can *practise* rather than only suffer.
**Interacts with:** §4.5 chaos lab, §7.1 blast radius, §9.1 sandbox.

### A9.11 — Achievements that are diagnoses, not milestones
**How it works.** Beyond §9.3's excellent joke list, a second achievement tier tied to *understanding*:
"**Called It**" (used a Preparation Token correctly), "**Named the Cause First Time**" (postmortem
minigame, 10 times), "**Never Chased the Herring**", "**Found It Before the Alert**", "**Shrank On
Purpose**", "**Under Par, Over Nines**". These are the achievements a competent player is proud of.
**Interacts with:** §9.3, A5.1, §5.1 postmortem minigame.

### A9.12 — The Uptime Streak as a shared, persistent, cross-mode object
**How it works.** §1.6 and §9.7 both propose an uptime streak. Unify it: one persistent counter for
the *company*, surviving across levels and modes, displayed on the office wall as the "Days Since
Last Outage" whiteboard (§9.3 already has the prop). It feeds financing rates (§6.11), enterprise
conversion, insurance premiums and hiring — and **erasing the number by hand after an outage should
be an animation the player has to watch.**
**Interacts with:** §1.6, §6.11 loans priced by uptime, §9.3.

### A9.13 — Tone guardrail: the game must let you be good at this job
**How it works.** A design principle worth stating because the document's tone is relentlessly about
things going wrong: at least **one level per chapter must be winnable cleanly and feel like mastery**
— no trick, no ambush, no lesson. The player executes competently and the game says so. Without
these, a 25-hour campaign of near-misses produces fatigue rather than pride, and the emotional arc
§0.5 promises (panic → process → prevention → boredom) never reaches its last two stages.
**Interacts with:** §0.5 emotional arc, §1.7, A1.11 downshift levels.

---

# PART B — IMPROVEMENTS AND EXPANSIONS

*Each entry names the existing idea by its heading so the merge agent can attach it. Categories:
**[EXPAND]** add mechanics · **[NUMBERS]** replace hand-waving with tuning · **[INERT]** cool but no
verb · **[DEGENERATE]** creates a dominant or exploitable strategy · **[MICRO]** micromanagement
risk · **[CONTRADICTION]** conflicts with another entry.*

---

## B1. Levels, scenarios, and progression

### §0.1 P3 — "Peacetime is the Real Boss" · [EXPAND][NUMBERS]
The pillar is right and under-specified. Concretely: **peacetime must have its own scored loop**, or
players will fast-forward it no matter what the design document asserts. Attach four scored peacetime
activities with visible meters — **drills run** (A7.11), **hollow icons filled** (A5.6), **debt paid**
(§7.7's meter, made reducible), **conformance %** (A4.14). Target ratio: a healthy level is roughly
**60% peacetime / 40% incident by wall-clock time**, and the score card should award up to 25% of
total points for peacetime work. Also add the anti-fast-forward rule: **speed >1× is unavailable
while any hollow (undrilled) capability exists**, framed diegetically as "*you have things you
haven't checked.*"

### §1.1 Tier 0 "Hello World" · [EXPAND]
Ten to twelve minutes of *powerlessness* is a risky opening. Keep the powerlessness but give it a
win the player authored: the level's three verbs (optimize, cache, delete) should each be able to
**visibly buy back concurrency slots**, so the emotional shape is "I am trapped, and I am still
good at this." Also: Tier 0 is the right place to teach **the queueing hockey-stick** (§7.1) because
12 worker slots is small enough to count, and the player should *see* latency go vertical at slot 10
of 12. That single moment is worth more than the rest of the tutorial.

### §1.1 "Tier 5 — Anycast" and "Tier 6 — Hyperscale" · [EXPAND]
Tier 6 is currently "mostly a sandbox with narrative bookends," which means the campaign's last hour
has no designed play. Proposal: Tier 6's actual game is **A7.9 policy authoring plus A1.13's
double-header**, and its unique verb is **arbitration** — you no longer fix things, you decide
between two of your own directors who both want the same power, staff, or capital. Three to five
short arbitration levels beat one big sandbox.

### §1.1 "The parallel business ladder (CEO framing)" · [CONTRADICTION]
This is a *second complete campaign spine* sitting beside the scale ladder, and the document never
says which one ships. They cannot both be the campaign. Recommendation: the **scale ladder is the
campaign**; the business ladder becomes the **stage labels and the score-card weighting** on top of
it (L4 "The Shared Hosting Shop" is what Tier 3 is *called* when your line is shared hosting). That
preserves every idea and removes the fork.

### §1.2 Perspective-shift levels (all of them) · [EXPAND][MICRO]
Fifteen perspective levels is fifteen potential rulesets, which is exactly the fragmentation risk the
brief asks about. Apply **A1.4's Invariant Core** as a hard filter: a perspective level may change
*which verb dominates* and *what you can see*, and nothing else. Concretely:
- `The NOC Shift` = Triage-dominant, no Place/Connect.
- `The Auditor` = Observe+Commit dominant, no Triage.
- `The Datacenter Tech` = Place/Connect only, no Observe (you're told what to do and it's wrong).
- `The Support Queue` = Diagnose-only, with the board hidden.
- `Red Team Friday` = the same six verbs with the goal node inverted.
Any perspective level that needs a seventh verb gets cut or becomes a cutscene. Also: **cap
perspective levels at one per chapter**, because their novelty is exactly proportional to their
rarity.

### §1.2 `Eyes of the Packet` · [INERT]
"You *are* a single HTTP request" is a lovely image with no stated verb. Give it one: it is the
**tutorial for the Latency Ladder** (§3.1) — you experience each hop as a wait, and your one verb is
choosing which of two paths to take at each fork, with the ms cost shown. Two minutes, once, before
the first WAF purchase. Otherwise cut it.

### §1.2 `The Acquisition` (fogged inheritance) · [EXPAND][NUMBERS]
The best level premise in the document; it needs an economy. Proposal: you get **Probe actions**
(costs 1 hand, 20 seconds) that reveal one object's identity, and **Trace actions** (costs 1 hand,
45 seconds) that reveal one object's dependencies. You have far fewer probes than objects — roughly
**probes = 40% of object count** — so the level is fundamentally about *choosing what to understand*.
Add the killer rule: **an unprobed object cannot be safely modified**, but it *can* be modified
unsafely, and the temptation to just reboot the mystery box is the level.

### §1.3 hosting-type levels (all 30) · [EXPAND]
Add three fields to every type entry so they're authorable rather than evocative: **(1) the dominant
verb** (from A1.4's six), **(2) the transferable lesson** (from A1.6), **(3) the returning-visit
hook** — what changes on the second visit (A1.5). Without field 3 every type is a one-off and the
content budget is spent on novelty rather than mastery.

### §1.3 "Amps and Aisles" (Colo) and §7.8 "Keyhole mode" · [EXPAND]
Removing agency is a great difficulty axis and a terrible *fun* axis if there's nothing to do
instead. Colo/keyhole levels need **three indirect verbs, always available**:
1. **Instrument** — you can always add *your own* telemetry at the boundary (port counters, PDU
   metering, temperature). You cannot see inside the cabinet; you can absolutely see what it draws.
2. **Negotiate** — a ticket/conversation system with a tenant, with tone options and a relationship
   meter. This is the level's combat.
3. **Enforce** — the escalation ladder: notice → warning → billed overage → circuit cap → port
   disable, each with a legal/reputational cost. Having a ladder makes the powerlessness *tense*
   rather than *flat*.

### §1.3 "Anything Goes" (Bulletproof) · [DEGENERATE]
As written, bulletproof is high revenue with a soft, slow, narrative penalty ("the Heat Gauge"),
which in practice makes it the economically dominant line for a player who doesn't care about
flavour. Fixes: (a) **heat compounds**: each grey customer raises the *rate* at which the next one
raises heat, so the line has a hard mathematical ceiling; (b) **upstream cost scales with heat** —
you pay 1.4× then 2.2× then 4× for transit; (c) the **reputation gate is two-way and sticky**
(§5.6 says this — enforce it numerically: bulletproof revenue above 20% of MRR permanently closes
regulated, enterprise and government tiers for the run). Then it is a genuine fork rather than a
free money button with a sad face.

### §1.4 `Tenant-of-a-tenant recursion` · [INERT]
Brilliant, and currently a description with no action. Give it a verb: **the Passthrough** — you
receive an abuse report and must choose per-report to (a) forward it down the chain and wait (cheap,
slow, may time out into your own liability), (b) act directly on the tenant above (fast, breaks the
contract, angers a paying customer), or (c) absorb it yourself (costs hands and reputation with the
complainant). A three-option card, repeated, with a visible countdown per report. That's a level.

### §1.5 `The Quiet Month` / `Reverse Wave` · [EXPAND]
Both risk being *nothing happening* rather than *pressure without combat*. Give both a live
antagonist that isn't a threat: **the budget**. Specifically a visible **Efficiency Frontier** (A6.6)
and a board mandate ("cut upkeep 15% without dropping conversion"), plus §7.9's opportunity events
arriving on a timer so there is always a decision on screen. Rule of thumb: a no-combat level needs
**a decision every 25–40 seconds** or it reads as filler.

### §1.5 `Zero-Day Sunday` · [EXPAND][NUMBERS]
"Every answer is bad" is the right shape; it needs numbers or the player can't choose. Give each
option an explicit cost/coverage pair, visible: take offline (100% coverage, 100% revenue loss,
0 risk), virtual patch at the WAF (70% coverage, +40ms, 3% friction, 15 min to deploy), crude
signature block (90% coverage, 11% friction, immediate), real patch (100%, 45 min, 8% chance of
breaking a customer per fleet segment). Now it's a decision rather than a mood.

### §1.5 `Bad Deploy Friday` · [EXPAND]
Add the mechanic that makes it a *puzzle* rather than a coin flip: **the deploy and a coincidental
attack are both live**, and the player must determine which is causing the error rate before
choosing. Rolling back a good deploy during a real attack wastes six minutes and the attack window.
That turns the level's stated tension ("is it the deploy, or an attack?") into actual play.

### §1.5 `The Influencer` / `The Demo` · [DEGENERATE]
"Cheat the dashboard" is offered with consequences but the consequences are unstated, which means
the correct play is always to cheat. Make it a probability with a visible tell: cheating gives
+35% close probability, and a **20% chance the prospect's own engineer notices** (they're looking at
your status page on their phone, visible in the scene) — which loses the deal *and* costs
reputation. Now it's a gamble with a readable tell rather than a free win.

### §1.6 "Difficulty as SLA" vs "Difficulty as Business Model" vs §6.5 "The price slider" · [CONTRADICTION]
Three difficulty dials competing for one slot; the document flags two of the three. **Resolve with
A1.1**: the Contract sheet is the single pre-level dial (SLA + response + scope + term). Business
Model becomes the **campaign-level faction choice** (picked once, at the start, like a civ). The
price slider stays as an **in-level economic lever** and is explicitly *not* labelled a difficulty
control. Three ideas, three different jobs, no collision.

### §1.6 "MRR Gates" · [DEGENERATE]
"Sustain MRR above a threshold for N months" creates the worst possible play pattern: the player
stops doing anything interesting and waits. Replace with **achievement gates that require a shape,
not a duration**: "unlock the enterprise tier by serving three customers above $2k/mo *simultaneously*
with zero SLA breaches" — which requires building something, not waiting for something.

### §1.6 "Scars" · [EXPAND][DEGENERATE]
Permanent negative modifiers that stack across a campaign are a death-spiral generator. Add three
rules: **(a) cap at 3 active scars** (a fourth replaces the oldest); **(b) every scar has a stated
payoff path** shown on its card ("Known Breached: clears after 90 clean days *or* after passing an
audit"); **(c) each scar grants one thing** — access to a Failure-Only Node (§5.2) or a permanent
small discount on its own counter. A scar that is purely a tax is a punishment; a scar with a door
is a story.

### §1.6 "Named customers persist" · [EXPAND][MICRO]
Lovely, and unbounded. Cap the persistent cast at **12 named accounts** at any time; everyone else is
statistics. Promotion into the cast happens when a customer crosses a threshold (revenue, tenure, or
having been personally saved by the player). Demotion is quiet. Twelve is enough for a soap opera
and few enough to remember.

### §1.6 "Prestige: The Exit" · [EXPAND]
Add the thing that makes prestige systems actually work: **the choice of what to keep must be
painful and small.** Concretely: you keep **three** nodes from a tree of ~120, plus one Doctrine
(A5.4), plus your Playbook (§9.4). Not a percentage — three cards, chosen on a screen, with
everything else visibly filed away. Also: the *specific three* should be shown on the next run's
whiteboard in the previous company's handwriting.

### §1.7 "The Pressure Budget" · [NUMBERS]
See A6.3 for a concrete formula. Additional authoring rules worth stating: **(a)** a wave's pressure
may be spent on at most 4 distinct threat entries — more than that is noise the player can't parse;
**(b)** the *first* wave of any level spends ≤40% of par, always, so the player gets a read on the
board; **(c)** trough waves must be ≥45% below the preceding peak or the sawtooth isn't felt.

### §1.7 "Grace Windows" · [DEGENERATE][CONTRADICTION]
"After any catastrophic failure, ~30 seconds where nobody is arriving" is exploitable (deliberately
fail to buy a free build window) and contradicts §2.9's Ticket Avalanche (failure *generates* work)
and P9 (loss should be felt). Replace with **the Triage Window**: after a catastrophic failure,
arrivals don't stop — they queue *visibly outside*, patience draining, while your hands are freed
from the failed subsystem for 30 seconds. You get breathing room for your *hands*, not a pause in
consequences, and you can watch exactly what the pause is costing you. Same anti-death-spiral
function, none of the exploit, and much better drama.

### §1.7 "The Difficulty Dial the Player Turns" · [EXPAND]
Excellent and needs one guardrail: there must be a **floor** on demand, or the optimal play is
"price yourself out of the market and win a level with four customers." Floor it with fixed costs
(A6.3's upkeep ratios), a **minimum viable scale** per level (below N customers you fail the
contract), and **market-share decay** — a market you don't serve is served by the Competitor, and
coming back costs more than staying.

### §1.7 "Anti-Turtle Clock" · [EXPAND]
Upkeep rising on a wall clock is a treadmill and reads as arbitrary. Better: upkeep rises as a
function of **your own estate's age and size** — depreciation, licence creep, patch debt, salary
growth — so it is *caused* by the player, visible in the Three-Bucket bar (A6.2), and reducible by
the Sustain actions the design wants them to take. Same anti-camping effect, legible cause.

### §1.7 "Telegraph Depth" vs §2.1 "Nothing announces itself" · [CONTRADICTION]
These read as opposite rules. Resolve by scoping them to different layers, and say so explicitly:
- **Waves are loudly telegraphed** (size, timing, and rough composition are always visible) — this
  is the planning horizon.
- **Incidents are never labelled** (you get the symptom, not the diagnosis) — this is the play.
So: you always know *that* a storm is coming and roughly how big; you never know *what specifically
is wrong* without doing the work. Both entries are correct; the document just needs the sentence.

### §1.7 "Soft failure over hard failure" vs §6.10 "Total data loss" and §2.9 "Certificate Expiry" · [CONTRADICTION]
The rule says everything degrades; two entries are instant cliffs. That's fine — but state the
exception rule so authors can apply it: **hard cliffs are permitted only where the real world has
one, and only where a cheap, boring, purchasable prevention existed for at least 5 minutes of level
time beforehand, visibly.** Cert expiry qualifies (the countdown is on screen all level). Data loss
qualifies (the backup icon was hollow). A random hardware death would not.

### §1.8 "The Density Ramp" / "Cable Entropy Curve" · [EXPAND]
Both are art-production notes with a hidden gameplay consequence worth stating: **the tier at which
the player can no longer track individual objects is the tier at which aggregate management verbs
must already be unlocked.** Tie A7.8's batch-operations ladder explicitly to the density ramp, so
the interface capability arrives exactly one tier before the density that demands it. Getting this
off by one tier is the single most likely cause of a mid-campaign quit.

---

## B2. Threats

### §2.1 "The five axes of threat distinctiveness" · [EXPAND]
Add a sixth axis that the document's own content implies but never names: **which resource the
damage is denominated in** (uptime / money / reputation / data / attention / future demand). Two
threats that differ on all five stated axes but both cost "uptime" still feel the same in play.
Also add the merge rule as an actual quota: **no more than 4 threats per level may share a
denomination.**

### §2.1 "Threats path the dependency graph, not geometry" · [EXPAND][NUMBERS]
Needs an actual pathing rule or the AI is unpredictable. See A7.18: attractiveness =
`exposure × value × (1 − apparent_hardening)`, evaluated per reachable node, with each threat family
applying a multiplier to one term (data thieves weight `value`, volumetrics weight `exposure`,
opportunists weight `1 − apparent_hardening`). Publish it in the Codex. A threat AI the player can
*reason about* is the precondition for every interesting defensive decision in the game.

### §2.2 "Scanner Swarm" · [EXPAND]
Its stated job — "make zero alerts impossible" — is excellent, but as written it's ambient texture.
Give it a mechanical output the player can act on: scanners build a **visible Recon Map** of what
they've found, shown as small flags on your exposed surfaces. The flags are the **advance telegraph
for the next three levels' targeted attacks**. Now a player who watches scanners gets a genuine
forecasting advantage, and "reduce your surface" has an immediately visible effect (flags vanish).

### §2.3 "SYN Flood — SYN cookies, a cheap, satisfying 'problem solved forever' unlock" · [CONTRADICTION]
Directly contradicts §4.1's Three-Column Law ("no pure upgrades. Ever."). Two ways out, pick one:
either give SYN cookies their real cost (they break certain TCP options and add a small per-
connection CPU cost under load — a genuine if minor tax), **or** amend the Three-Column Law to say
"**no pure upgrades at the strategic layer; a small number of *tactical* problems may be permanently
solved, and solving them is one of the game's pleasures.**" I recommend the second — a game where
literally nothing is ever finished is exhausting — but the law has to be rewritten to permit it.
Same issue applies to §4.7's **Cable Label Printer**, §4.10's **DKIM/SPF/reverse DNS**, and §4.10's
**Spend Cap** (all correctly described as cheap, obvious and downside-free).

### §2.3 "Cache Stampede / Thundering Herd" · [EXPAND]
The best-designed threat in the document — "an enemy spawned by your own success." Extend it into a
small family so the lesson lands more than once: **the Warm-Up Stampede** (a scale-out event where
the new node is cold), **the Restart Herd** (everything reconnecting after a blip), **the Deploy
Herd** (cache busted by a release), **the Renewal Herd** (all your annual customers billing on the
1st). Same shape, four contexts, and together they teach "synchronisation is the enemy" — which is
the actual generalisable lesson and which §2.12's IoT reconnect storm also depends on.

### §2.4 "The Mimic Tell (design law)" · [EXPAND][MICRO]
"One tiny tell the player learns to spot" risks becoming pixel-hunting at Tier 4 density. Three
fixes: **(a) tells must be motion or path, never colour or a single pixel** — motion survives LOD
collapse and colour-blindness; **(b) tells are *statistical*, not per-unit** — you spot the tell in
a *group's* behaviour (too-regular spacing, identical inter-arrival times), which is how it actually
works and which scales to a crowd; **(c) a Tell Trainer in the Codex** where you can watch a mimic
and a visitor side by side at 0.25× speed as many times as you like. The skill should be learnable
deliberately, not only by accident.

### §2.4 "Card Tester" · [EXPAND]
"Your revenue graph goes up right before your processor drops you" is a superb image. Add the
counterplay that makes it a decision rather than a trap: an **authorisation-rate** stat next to
revenue. Card testing pushes revenue up and auth-rate *down*. A player who knows to watch the ratio
catches it in 20 seconds; a player watching only revenue celebrates. That's a perfect
information-design puzzle and it costs one number.

### §2.5 "Cryptominer Squatter" · [EXPAND]
Described as "the most satisfying 'aha' detection in the game" and given only one tell (thermal).
Add a second and third so it's a *convergence* rather than a lookup: load average high with flat
traffic (the stated contradiction), the thermal outlier (stated), and **an egress pattern to a
consistent destination** visible only in the flows overlay. Any two confirm. This is the right
template for every Stealth-role threat: three partial signals across three overlays, any two
sufficient.

### §2.6 "The Insider / Insider Badge" · [EXPAND]
See A2.14 for the full redesign. Additionally: the current trigger ("triggered by low morale") makes
the counter "keep morale high," which collapses the whole idea into one meter. Add a second,
independent trigger — **a single disgruntled individual** who can exist on a healthy team — so the
answer is process (two-person rule, audit logging, least privilege) rather than a morale slider.

### §2.7 "BGP Prefix Hijack — the game's ultimate helplessness moment" · [EXPAND]
Helplessness is a great *feeling* and a terrible *minute*. Give the player three things to do while
helpless, all of which matter: (1) **verify from outside** (the §7.6 check — is it a hijack or are
you actually down?), (2) **announce more specifics** (a real mitigation, works partially, takes
minutes to propagate, drawn as a slow global colour change), (3) **work the phone** — a relationship
minigame with upstreams whose speed is a function of Trust-with-upstreams (§6.1's hidden fifth
currency, which currently has no gameplay attached to it anywhere). That third one is the payoff for
a currency the document invents and never uses.

### §2.8 Entropy family (all) · [CONTRADICTION][MICRO]
§2.8 says entropy events should be "frequent, small, and attention-taxing." §8.8's Notification
Discipline and §8.2's Readability Budget say the opposite. Resolve with a **rate cap and an
aggregation rule**: at most **one entropy event per 90 seconds** reaches the alert stack; everything
below that threshold accumulates silently into the **maintenance-debt overlay** (§7.6) and is cleared
in batches by a scheduled maintenance action. That preserves "the estate is always quietly rotting"
without generating 40 popups an hour.

### §2.8 "The Hardware Lottery" · [INERT][DEGENERATE]
Hidden per-unit quality with no counterplay is noise — it makes telemetry unreliable without making
any decision more interesting. Fix by adding the counterplay that exists in reality: a **burn-in
period** (run a new machine at load for 24 in-game hours before putting customers on it — costs
time, reveals the lemon) and a **warranty claim** verb. Now it's a decision ("do I burn in, or do I
need the capacity today?") instead of a dice roll.

### §2.8 "Weight Limits on Raised Floor" · [INERT]
Currently a one-line joke. Give it the one job it can do: it is the constraint that forces **battery
strings and storage arrays to ground-floor or slab positions**, which means your UPS and your
storage can't be near your compute, which means power runs are longer and the failure domains
overlap differently. One constraint, real spatial consequence, keeps the joke.

### §2.7 "Rodents, Wildlife, and the Literal Bug" · [INERT][DEGENERATE]
"Random link death" with no counterplay and no telegraph is exactly the kind of unfair randomness
§7.6 elsewhere forbids. Either make it cosmetic-only (a chewed cable that a tech finds during
routine maintenance, costing nothing) or give it counterplay (conduit and rodent guards as a cheap
facility purchase, and a chew-damage precursor state visible in the cable's rendering for ~30
seconds before failure). I'd keep the joke and make it a precursor state — "there's a cable that
looks wrong in aisle 4" is a great thing to notice.

### §2.9 "Alert Fatigue" · [DEGENERATE]
"The game literally starts hiding the real alert" will read as cheating. Fix with transparency: the
game **never hides**; it **collapses**. A suppressed group shows as `▸ 41 suppressed` and the real
one is inside it. The failure is that the player doesn't expand it — which is their choice, is
exactly what happens in reality, and is fair. Additionally, make the noise *source-attributable*: a
flapping check should be identifiable and mutable in two clicks, so the counter is available.

### §2.9 "Fat-Finger" · [DEGENERATE]
A random chance that a manual action targets the wrong node under stress is the least fun mechanic
in the document: it is invisible, unavoidable, and it punishes engagement. Replace with a *visible,
avoidable* version: under high alert density, high-risk actions gain a **confirmation step showing
the target's name and blast radius**, which costs 1.5 seconds. Skipping confirmation is a setting
the player can turn off. Now the mistake is a decision the player made about speed versus care,
which is the actual lesson.

### §2.9 "Documentation Rot" · [MICRO]
"Runbooks visibly yellow and using a stale one gives a *worse* outcome than improvising" creates a
chore loop across potentially dozens of runbooks. Fix: rot applies at the **library** level, not
per-document — a single "Documentation Freshness" stat, decaying ~4%/month, refreshed in one action
(a doc day) or passively by drills that exercise the relevant procedure. And stale runbooks should
be **slower**, not *wrong* — actively harmful documentation is a punishment that teaches "don't
write documentation," which is the opposite of the intended lesson.

### §2.9 "The Uninterpretable Log Line" · [INERT]
Pure flavour, and good flavour. Give it exactly one mechanical job, once per campaign: it is the
**control condition for red herrings** — the game's way of teaching that not every anomaly is a
cause. And at one specific late moment, it turns out to matter, which makes the joke land twice.

### §2.9 "The Rate Limit You Set" · [EXPAND]
The best "your old defenses become your new problems" idea and it's a single sentence. Systematise
it: every tuned threshold carries a **fit indicator** — green while your traffic profile matches
what it was tuned against, amber as the profile drifts, red when it's actively blocking growth. A
**Tuning Review** action (cheap, peacetime) surfaces all drifted thresholds at once. Now old
decisions rot *legibly* and there's a boring, satisfying maintenance verb for it.

### §2.10 Business threats, whole section · [EXPAND]
These are excellent and almost all resolve as "a number goes down." Give the family a shared
mechanical shape so they play rather than just happen: **every business threat should arrive as an
Inbox card (§7.5) with 2–3 responses, at least one of which costs a *hand*.** Making business threats
consume attention is what couples the two halves of the game; right now the ops layer and the
business layer never compete for the same resource, which is the single biggest missed opportunity
in the design.

### §2.10 "The Astroturf Temptation" and §6.11 "Merchant cash advance (the labelled trap)" · [DEGENERATE]
A choice labelled as a trap is not a choice. Both need to be *correct sometimes*:
- **Astroturf**: make the detection probability a function of *volume and pace* (buying 20 reviews
  slowly is nearly undetectable; buying 200 in a week is caught), so there's a skilled version of
  the dirty play. And make the benefit real and immediate, because that's why people do it.
- **MCA**: make it genuinely correct in the narrow case it's correct in reality — a short, certain,
  high-return cash need (hardware for a signed contract that starts in 30 days). Then it's a trap
  only for players who use it to plug a structural hole, which is the real lesson.

### §2.10 "The Concentration Risk Whale" · [NUMBERS]
Give the threshold and the curve: concentration risk becomes a visible warning at **>25% of MRR in
one account**, a scored penalty at **>35%**, and at **>50%** the whale gains a **renewal leverage**
mechanic — each renewal they demand a discount of 8–15% or they walk, and refusing has a 35% churn
roll. That turns the whale from a narrative caution into a compounding squeeze the player can feel.

### §2.11 "The Competitor (the game's rival AI)" · [EXPAND]
The best antagonist idea in the document and it currently has no *state*. Give it four visible
numbers on a rival card: **their price, their reputation, their capacity, their cash**. All four move
in response to the market and to your actions, and all four are *knowable* via the Competitor
Teardown (§5.4). Then their behaviour becomes predictable-but-adversarial rather than scripted, and
the market map (A1.10) gives them somewhere to move. Also: they should occasionally **do something
correct that you should copy**, which is far more motivating than pure antagonism.

### §2.12 type-specific threats · [EXPAND]
Roughly 60 entries, many one line. The pruning rule from §2.1 should be applied hard: a type-specific
threat earns its slot only if it **changes the player's verb**, not just the noun. Keep: Toll Fraud
(spend caps), Water Torture (defeats the cache — changes the answer), the Empty Server Spiral
(visitors affecting visitors), the Admission Webhook Deadlock (self-locking), the Encryption Key
Nobody Has, the Tenant Who Overloads The Circuit, Rain Fade, the Missed Pass, Silent
Deprioritization, the Un-cacheable Customer. Demote the rest to **Codex flavour entries attached to
an existing mechanical threat** — they still appear, they still read as different, and they cost
nothing to balance.

### §2.12 "Game hosting: The Empty Server Spiral" · [EXPAND]
Generalise it — "visitors affect other visitors" is too strong a mechanic to use once. Name it the
**Population Effect** and apply it wherever it's true: game servers (population attracts
population), community/forum hosting (activity attracts activity), marketplaces, IX peering (carrier
density attracts carriers — §1.3 already notes this), and the colo meet-me room. It's the same
positive-feedback curve with a floor below which it inverts, and it gives several hosting types a
shared strategic shape: **get above the threshold fast, or don't start.**

### §2.13 "Behaviour mix-ins" · [EXPAND]
See A2.12 — make them *visible pre-level affixes* the player can accept for reward. Additionally,
each mix-in should invalidate exactly one defense role (A2.1): Distributed beats per-IP Meter;
Encrypted beats Classify without termination; Low & Slow beats Detect thresholds; Adaptive beats
static Deter; Timed beats staffed response; Piggyback beats blanket Absorb. Stating the mapping is
what makes mix-ins strategic rather than decorative.

---

## B3. Visitors, traffic, and clients

### §3.1 "Patience as HP" and "Latency budget as visitor HP" · [CONTRADICTION][NUMBERS]
These are two names for one model, presented as separate entries, and they'll drift. Merge into a
single spec: **a visitor is a unit with a millisecond budget and a value.** Patience *is* the
budget; every hop subtracts its current response time; error and trust events subtract fixed large
chunks; bounce is a sigmoid on budget consumed (A6.3 gives the curve). One model, one bar, one
number, drawn as §8.6's patience ring. Then §3.1's "Latency Ladder readout" becomes its HUD and
A3.2's Millisecond Budget becomes its constraint.

### §3.1 "Friction Gates" · [NUMBERS]
Give the full table (A3.2 offers one) and add the rule that makes friction strategic rather than a
flat tax: **friction applies only to traffic that traverses that defense.** A defense on the
checkout path taxes buyers; a defense at the edge taxes everyone. This single change turns §4.5 from
a shopping list into a placement puzzle and is the precondition for A3.1's Two Lanes.

### §3.1 "Duration classes" (Instant / session / resident) · [EXPAND]
An excellent unifying idea that deserves a mechanical consequence, not just a visual one: **each
class consumes a different resource.** Instants consume *throughput*. Sessions consume *slots* for
their duration (so a session-heavy line runs out of concurrency long before bandwidth). Residents
consume *committed capacity* and cannot be shed at all — which is why a colo lease and a GPU
training job feel identical to manage. State that and the three classes become three different
capacity-planning games.

### §3.2 The archetype list (35 entries) · [MICRO]
Thirty-five visitor archetypes is more than a player can hold, and many differ only in bounty. Group
them into **six families** with variants inside, so the read is fast: **Browsers** (skimmer, deep
reader, night owl, ghost), **Buyers** (impulse, comparison, cart-abandoner, whale), **Machines**
(API client, crawler, uptime monitor, IoT), **Amplifiers** (advocate, reviewer, influencer,
journalist), **Costs** (freeloader, support seeker, refund hunter, tire-kicker), **Evaluators**
(enterprise, procurement, auditor, tenant tour). Six silhouettes, then variants within each. This
also fixes A8.9's silhouette test, which 35 distinct archetypes would fail.

### §3.2 "The Advocate / Word-of-Mouth Visitor" · [NUMBERS][DEGENERATE]
"Converts, and spawns 2–3 extra visitors" is an unbounded exponential if unchecked. Add a **network
saturation curve**: word-of-mouth spawn rate is `base × (1 − reached/addressable)`, so the channel
fills up and the marginal advocate is worth less. Without it, the dominant strategy in every level
is to over-serve early and coast on compounding, which collapses the economy.

### §3.2 "The Ghost (the dormant payer)" · [INERT]
"Pure profit, treasure them" is a fact, not a decision. Give it a fork: dormant accounts are
**unpatched, unmonitored and forgotten** (the document says so) — so the player periodically gets a
choice: audit and secure them (costs hands, no revenue upside) or leave them (free money, rising
compromise probability). That's a real decision and it's the most authentic kind of neglect.

### §3.3 "Colo — a prospective tenant touring the facility" · [EXPAND]
Correctly identified as the best visitor idea in the brief, and it needs a *scoring rubric* the
player can see beforehand or the tour is a black box. Publish the checklist as a visible pre-tour
prep screen: cable tidiness, labelling, spare capacity, PUE, carrier count, security theatre,
references, whether the floor is clean, whether a tech is visibly stressed. Each is a small
percentage of a close probability, each is fixable in advance, and **the prep is the level**. The
tour itself is then a 90-second walk where you watch your own preparation get judged.

### §3.4 "Why visitors bounce" (18 entries) · [EXPAND]
All good, and they need a shared mechanical form or they can't be balanced: **every bounce source is
either a millisecond cost, a fixed patience subtraction, or a hard cliff.** Classify each:
- *Millisecond costs*: latency drain, redirect chains, TLS handshake, third-party drag, cold start,
  cold cache, queue wait.
- *Fixed subtractions*: ugly/degraded layout (−25% patience), form friction (−8% per field), price
  shock (−40%), visible queue (−15%).
- *Hard cliffs*: error page, scary warning, no instant provisioning, missing feature filter, captcha
  fail, mail non-delivery.
Once classified, the entire bounce system is tunable from one table.

### §3.5 The customer archetype table · [NUMBERS][EXPAND]
The best table in the document. Two additions that would make it playable: **(a) a `Threat Draw`
column** — which threat families this customer attracts, which is the actual §3.9 "clients are
spawners" mechanic made concrete; **(b) a `Fits With` column** — which other archetypes they
co-exist with well or badly (Crypto Chad next to Enterprise Edith is a compliance problem; Agency
Anya plus Dev-Shop Dan share a support skill set). Customer *mix* then becomes a drafting puzzle
rather than a sum.

### §3.6 "The SEO Garden" · [NUMBERS]
The best acquisition metaphor here, with no rates. Proposal: each content plant takes **3 in-game
months** to reach full yield, yields `base × quality × freshness`, decays 6%/month without tending,
and an algorithm-update event rerolls `quality` on ±30% of plants. Outages damage the garden at
`−1 plant-health per 15 minutes of 5xx seen by crawlers`. That gives the player a compounding
channel with a real maintenance cost, which is exactly what SEO is.

### §3.6 "The Ad Spend Dial / The Beacon" · [EXPAND]
Add the auction: cost-per-click rises with the Competitor's spend on the same keywords, visible as
a small contested bar. Then ad spend becomes a *two-player* decision rather than a tap, the
Competitor AI gains a lever that doesn't require attacking you, and turning the beacon off during a
crunch has a visible consequence (the competitor's beam widens into your territory).

### §3.6 "The Status Page (honesty as a resource)" · [EXPAND][NUMBERS]
The best trust mechanic in the document. Give it a curve rather than a binary: publishing an
incident within **5 minutes** cuts reputation damage 60% and ticket volume 70%; within **20 minutes**,
40%/50%; after resolution, 15%/0%. Publishing *nothing* and being found out doubles the damage.
Publishing *too often* (more than ~2 minor incidents a month) suppresses new signups by ~8%. Now the
player is managing an honesty *budget*, which is a genuinely novel and very true mechanic.

### §3.7 "Save Offers" · [DEGENERATE]
As written, save offers are unboundedly better than losing a customer, so the optimal play is always
to save. The document notes the discounting spiral; make it numeric: each save offer permanently
reduces that customer's ARPU by the discount and raises their **expectation** (a hidden stat) so the
next save costs more. After two saves, the third is refused. And a saved customer's **referral
value drops to zero** — they're staying for the price, not the love. Then saving is a real
calculation.

### §3.7 "The Grudge Meter" · [EXPAND]
Add the thing that makes it a *game* rather than a gauge: grudge should be **reducible by specific
actions, not just by time** — a proactive apology (costs a hand, works once), a credit (costs cash),
a personal call from the founder (costs executive attention, very effective, doesn't scale — which
is the §2.10 Influencer lesson generalised), or genuinely fixing the thing they complained about
(costs the most, reduces grudge across *all* customers with the same complaint). That last option is
the one that teaches root-cause thinking through the customer layer.

### §3.9 "Client Cards (the game's best recurring choice)" · [EXPAND]
Correct, and it needs the structure that makes drafting games work: **offer three, take one, and
make the hand occasionally bad.** A round where all three options are unattractive (a miner, a
whale who'd concentrate you, and a customer you can't technically serve) is the most interesting
round in a drafting game. Add a **pass** option that costs nothing but leaves your capacity idle,
so the player learns that saying no is a move.

### §3.9 "The Sacrifice Decision" · [EXPAND]
Promote it from a button to a **pre-configured ladder** (A3.3) plus a live override. The reason:
making the sacrifice choice *during* a crisis with no preparation is pure panic; making it in
peacetime as a policy and then watching it execute is *tragedy*, which is much better. The live
override stays for the cases your policy didn't anticipate, and every override is a candidate for a
new policy rung afterward.

### §3.9 "Client Growth — your best customer becomes your biggest capacity problem" · [NUMBERS]
Give it a rate so it's plannable: successful clients grow **3–8% per in-game month, compounding**,
with occasional step changes (a launch, a funding round, a seasonal spike). Surface it as a
projected-growth band on the client card so the player can see the collision coming two months out —
which is exactly the "postcard from the future" (§5.4) applied where it matters most.

---

## B4. Buildables: services and infrastructure

### §4.1 "The Three-Column Law — no pure upgrades. Ever." · [CONTRADICTION][EXPAND]
Violated by at least five entries in the document's own §4 (cable label printer, DKIM/SPF, spend
cap, SYN cookies, NTP source) and it *should* be, because a game where nothing is ever finished is
exhausting. Rewrite the law in two clauses:
1. **No strategic build may be a pure upgrade** — anything that changes capacity, capability,
   revenue, or reach must carry cost, friction, surface or complexity.
2. **A small, explicitly budgeted set of "hygiene" items may be pure wins** — cheap, obvious,
   unglamorous, and their entire design purpose is to reward the player for doing the boring thing.
   **Cap the set at ~12 items across the whole game** and make them *cheap but not free*, so buying
   them is a statement about your priorities rather than a no-brainer you'd never skip.
This preserves the law's intent, matches the content, and creates a category of purchase that feels
*good* — which the design currently has almost none of.

### §4.1 "The Build Card" · [EXPAND]
The "Opens:" row of threat icons is the best UI idea in §4. Three additions: **(a)** the Tradeoff Bar
(A8.1); **(b)** a **"Closes:"** row — what this build *removes* from the threat pool, which almost
every buildable also does and which the current card never shows, making every purchase look
one-sidedly scary; **(c)** the lifetime cost (A8.2). With "Closes" present, P2's tension becomes a
genuine two-sided trade instead of a tax.

### §4.1 "Build time and cold start — panic-building mid-incident doesn't save you" · [EXPAND]
Correct rule, and it leaves the player with nothing to spend money on during a crisis, which removes
the genre's core pleasure. Pair it with **A4.10 (Rentals and Burst)** and **A4.4 (the Warm Bench)**
so the sentence becomes: *"panic-buying doesn't save you; panic-**activating** what you already
bought does."* That's a much better lesson and a much better minute of gameplay.

### §4.2 Compute tier · [EXPAND]
Missing the decision that dominates real capacity planning and would be excellent here: **the
instance-size question**. Many small nodes = better failure granularity, worse per-unit efficiency,
more coordination overhead, more things to patch. Few large nodes = cheaper per unit of capacity,
bigger blast radius, harder to bin-pack. §7.4's "scale up vs scale out" states the fork abstractly;
it should be a *per-purchase* slider on the chassis (A4.9) so the player makes it forty times rather
than once.

### §4.3 "Backup System / Backup Vault" and "Restore Drill" · [EXPAND]
The best pair in the document and the one most likely to be skipped by players, because both are
pure cost. Make the reward legible with **A5.6's sealed capability**: the backup vault ships with a
hollow icon, provides *zero* protection until drilled, and the hollow icon is impossible to
misinterpret. Add a **Restore Time estimate** that is *wrong until you've measured it* — the
estimate shows "~2 hours (estimated)" and after a real drill shows "6h 40m (measured)". Watching
that number triple is the single most valuable thing this game can teach anyone.

### §4.3 "Cache Layer" · [EXPAND]
Add the mechanic the entry's own text implies: a **cache dependency score** — the percentage of your
current traffic that your origin *could not* serve if the cache vanished. It rises silently as you
tune for cost. Above 70% you get a visible warning; above 90% your cache is load-bearing
infrastructure with no failover. The score is only measurable if you run a **cold-start test** (the
entry mentions it — make it an action). This converts "the defense that becomes a dependency" from a
sentence into a number you watch with dread.

### §4.4 "Load Balancer — health-check misconfiguration, a top-tier outage source" · [EXPAND]
Give the player the actual dials so this is a decision rather than a hidden trap: **check depth**
(TCP / HTTP 200 / synthetic transaction — deeper is more accurate and more expensive), **interval**,
**failure threshold**, **slow-start**, and **outlier ejection**. Then the classic failure modes
(shallow check keeps a dead backend; aggressive check flaps a slow one and cascades) are things the
player *configured*, which makes them teachable rather than arbitrary.

### §4.4 "DDoS Scrubbing Service" · [DEGENERATE]
As written, an always-on retainer at a flat monthly fee trivialises the entire volumetric threat
family, which is a large fraction of §2.3. Fixes: **(a)** price it as a percentage of your peak
traffic so it scales with your success rather than being a flat early purchase; **(b)** always-on
costs a permanent, visible latency detour (the entry says this — make the number big enough to
matter, ~25–40ms, which is 10% of a typical budget); **(c)** it covers the **Absorb** role only —
L7 mimics, cache-busters and application floods still arrive, because that's true. Then it is a
correct and expensive answer to one threat role rather than a subscription that ends a category.

### §4.4 "IP Space (owned vs leased)" · [EXPAND]
"Reputation is attached to addresses — buy a cheap block and inherit its blacklist history" is a
superb buyer-beware mechanic that needs a verb. Add **address due diligence**: a cheap check before
purchase that reveals the block's history (some of it), and a **reputation rehab** process that
takes in-game months of clean sending. Then a cheap /24 is a *project*, which is exactly right.

### §4.5 Defenses (whole section) · [EXPAND]
Every defense in §4.5 currently applies globally and permanently. Three structural changes that make
the whole section into a game:
1. **Defenses live on edges, not on the board** (see B3/§3.1 above). A WAF is placed on a link and
   taxes only what crosses it.
2. **Every defense has an aggression slider with a live two-sided readout** (catches / false
   positives). §4.5 gives this to the WAF and the spam filter; give it to all of them, with the same
   widget, so tuning is one learnable interaction.
3. **Every defense has a role tag** (A2.1) and the Coverage Grid reads from it.
Together these convert §4.5 from a list of 14 purchases into a system with placement, tuning and
coverage — three orthogonal skills instead of one shopping decision.

### §4.5 "Honeypot" · [DEGENERATE]
"Attracts attackers, wastes their time, and generates Intel that unlocks tech you haven't been hit
by" is strictly positive and cheap, which makes it a mandatory first purchase in every run. Add
real costs: **(a)** a honeypot is a live, exposed service — a misconfigured one is a genuine foothold
(the entry says this; make the probability non-trivial, ~4% per level unless maintained);
**(b)** Intel yield has hard diminishing returns after the second honeypot; **(c)** attracting
attention is *literally attracting attention* — honeypots raise your visibility score, which raises
the baseline scanner rate and the chance of drawing a targeted attacker. Then it's a genuine
risk/reward rather than free research.

### §4.5 "CAPTCHA Gate — available very early so players learn to regret it" · [EXPAND]
Perfect design intent. Sharpen the regret so it's *visible within one wave*: when CAPTCHA is on, the
bounce animation for a blocked human should be individually visible and the false-positive counter
should sit right next to the "bots blocked" counter, the same size. The lesson is the *adjacency of
the two numbers*, and most games would show only the flattering one.

### §4.5 "Bot Fingerprinter — the late-game answer to the game's central dilemma" · [DEGENERATE]
If a late-game tower resolves the central tension, the central tension has an expiry date and the
last third of the game is flat. Fix: the fingerprinter **narrows the overlap, never eliminates it**
(A7.3), and it is subject to §2.13's "hunters adapt" — a fingerprint profile decays as attackers
learn it, requiring periodic retraining (a recurring cost with a visible freshness meter). The
end-state should be "I am 90% good at this and it costs me constant attention," not "solved."

### §4.6 "Monitoring Stack (purchased in layers)" · [EXPAND]
The layered purchase is exactly right. Add the thing that makes it a *decision* rather than a
ladder: **monitoring coverage is per-object, not global.** You buy a tier and then choose which
objects get an agent, with a per-agent cost (money + a small performance tax + a small surface
addition). Now "what do I instrument?" is a recurring choice, §5.4's Fog of Instrumentation becomes
spatially meaningful, and the classic failure — the one uninstrumented thing being the thing that
breaks — becomes the player's own doing.

### §4.6 "Status Page — must be hosted OFF your own infrastructure" · [EXPAND]
Make the trap explicit and *cheap to fall into*: the status page is free and instant if hosted
internally, and costs a small monthly fee plus a setup step if hosted externally. Nearly every
player takes the free one, exactly once. That's a perfect five-dollar lesson and the entry currently
describes the outcome without pricing the temptation.

### §4.7 "A+B Power Feeds / Dual Cording" and §7.1 "Effective vs nominal redundancy" · [EXPAND]
This is the single best "you thought you were safe" mechanic in the document and it needs a UI or
it's a gotcha. Add the **Redundancy Audit** overlay: every object shows `bought: N+1 / effective:
N+0` with the shared dependency named. It should be available from Tier 2.5 onward and it should be
*free*, because the lesson is not "you couldn't see it," it's "you didn't look."

### §4.7 "Generator + Fuel Contract" · [NUMBERS]
Give the start-failure probability an explicit, visible curve so maintenance spending is a
calculable bet: base start-failure **18%**, reduced to 9% by monthly no-load tests, to 3% by an
annual load-bank test, to 1.5% by both plus fuel polishing. Display it on the object as
"start confidence: 82%." A probability the player can read is a probability they'll invest in; a
hidden one just feels unfair when it fires.

### §4.7 "Cable Management / spaghetti penalty" · [EXPAND][NUMBERS]
Excellent mechanic, no numbers. Proposal: each rack carries a **Tidiness 0–100**. Remote-hands and
physical actions in that rack take `duration × (1 + (100 − tidiness)/100)` and carry a
`(100 − tidiness)/400` chance of knocking out a neighbouring link. Tidiness decays ~3 points per
physical action and is restored by a cable-management pass (1 hand, 4 minutes, +35). At colo tiers
it also feeds the tour score (B3/§3.3). Now tidiness is a maintenance economy with a visible payoff
and the game's most photogenic virtue.

### §4.7 "Spare Parts Inventory / Crash Cart" · [NUMBERS]
The cleanest capital-vs-MTTR tradeoff in the document; give it the numbers. A stocked spare converts
a 4-hour part-order outage into a 12-minute swap. Holding cost ~2% of part value per month plus the
cash being tied up. Coverage is per part-type, so the decision is "which three failures do I pre-pay
to fix fast?" — which is a genuinely good recurring choice.

### §4.8 Staff (whole section) · [EXPAND][MICRO]
Fourteen staff types with individual stats is a management sim inside a tower defense. Compress to
**five roles × three seniorities**: Ops, Network, Data, Security, Support — each Junior / Mid /
Senior, plus a small set of **specialisations** (a Mid Ops with a DBA specialisation). The
document's other ten types become specialisations or named individuals, not separate hireable
classes. This keeps every flavour idea, removes the hiring-screen paralysis, and makes A4.13's shift
placement tractable.

### §4.8 "Morale / Burnout Meter" · [EXPAND]
Currently a drain with one output (they quit). Add the intermediate, playable states so it's a
system rather than a countdown: **Fresh** (full speed, catches things) → **Tired** (−20% speed) →
**Strained** (+error chance, won't volunteer information) → **Checked Out** (does exactly what's
asked and no more — the most realistic and most dangerous state) → **Gone**. And make recovery
*actionable*: time off, a quiet week, a win, a blameless postmortem, fixing the thing that keeps
waking them up. The last one is the important one: **burnout is caused by recurring incidents, so
root-cause fixes are the real morale mechanic.**

### §4.8 "Security Engineer — produces no visible revenue, the classic budget-cut victim" · [EXPAND]
Correctly diagnosed. The fix the entry gestures at needs teeth: the security engineer's value should
be shown as a **continuous, running "prevented" counter** on their card (A8.8's stamp trail feeds
it), and **firing them should have a 90-day lag before the consequences arrive** (P10). Then the
player who cuts them experiences the exact real-world sequence: three good months, then a bad
quarter, and the Attribution Ledger (A6.9) names the cause.

### §4.9 "The business machine" (40+ entries) · [EXPAND][MICRO]
The single best structural insight in the document ("half your towers aren't servers") and it is
currently 40 separate buildings. Group them into **six departments** — Billing, Support, Sales,
Marketing, Legal/Compliance, Finance — each a single building with **internal slots** you fill with
the specific capabilities. Then the player's decision is "how much of my floor is Support?" rather
than "do I own a dunning engine, a collections desk and a ticket router?" Same content, one tenth
the cognitive load, and the floorplan becomes a readable statement of strategy.

### §4.9 "Pricing Engine / The Plan Builder" · [EXPAND]
The best *systemic* business idea in the document and it deserves promotion to a signature mechanic.
Additions: **(a)** the live estimates should be *ranges with confidence*, narrowing as you gain
market data — so elasticity testing (§6.5) has something to narrow; **(b)** a **plan is a contract
with your future self** — changing it later triggers grandfathering (§6.5), so plan design is a
one-way door and should be marked as one (§7.7); **(c)** show the **support-tickets-per-account**
projection as prominently as margin, because that's the number that actually kills cheap plans.

### §4.9 "SLA Contract Tier — a tower you build and a bomb you carry" · [EXPAND]
Give the bomb a fuse the player can watch: the **SLA Meter** (§8.8) should show, per contract,
*minutes of budget remaining this month* rather than a percentage — i.e. the error budget (A6.1),
per customer. Then an incident's cost is legible in real time and per relationship, and the
Sacrifice Decision (§3.9) has the numbers it needs.

### §4.10 type-specific buildables (~70 entries) · [MICRO]
Same treatment as §2.12: most should be **skins on shared mechanics** rather than distinct objects.
The Modem Bank, the Concurrency Slot pool, the VoIP channel group, the game-server slot and the
serverless warm pool are *one object* — "a countable concurrency pool" — with five costumes. Saying
so in the document is what keeps the variety engine affordable and keeps balancing tractable. Reserve
genuinely distinct buildables for the ~15 that change a verb (tape robot, residency fence, compliance
boundary paint, tick-optimised node, checkpointing service, meet-me room, dish, warm pool, spend
cap, erasure-coding policy, immutable vault, matchmaker, busway, out-of-band modem, origin shield).

### §4.10 "Provisioning Automation — the single biggest margin lever" · [EXPAND]
Correct, and it should be the game's showcase automation unlock. Give it the full before/after:
before, each signup consumes 0.4 hands for 90 seconds and a visible staff member walks to a
terminal; after, a signup is a 2-second animation and the staff member goes and does something else.
The *visible reclaiming of a person's time* is the best possible way to sell what automation is for,
and it should be the template for every other automation unlock in the game.

### §4.10 "Control Panel — a per-account licence cost that scales with your success" · [EXPAND]
The best regret node in the document. Make the regret *arrive on a schedule the player can see*: the
licence cost per account should be shown on the plan builder from day one, and the vendor should
announce a repricing **two levels in advance** in the trade press (§9.3). A regret you could have
seen coming and ignored is a lesson; a regret sprung on you is a punishment.

---

## B5. Unlocks and discovery

### §5.1 "Scar-driven progression" / "Postmortem Research" · [CONTRADICTION][DEGENERATE]
The document's best idea and it collides head-on with §9.6's "No optimal build order." If you can
only research a counter after being hit, and the threat order is authored, then the tech order is
authored and identical for every player. Three fixes, all needed:
1. **A5.1's Anticipation Track** — bet on threats you haven't met.
2. **Seeded threat introduction order** — the *set* of early threats is fixed per level, but the
   *order within a chapter* varies per run, so two players' trees diverge immediately.
3. **A5.3's Second Answer rule** — each scar opens 2–3 counters, not one, so even identical scars
   produce different trees.
Without these, §5.1 and §9.6 cannot both be true and the document should say which one wins.

### §5.1 "Teach through loss, never through text" · [EXPAND]
A great guardrail with a failure mode: some lessons are too expensive to teach by loss (total data
loss, processor termination, regulatory shutdown). Add the **Near-Miss clause**: catastrophic lessons
are taught by a *near miss first* — the restore fails on a non-critical dataset before it fails on a
critical one; the chargeback ratio spikes to 0.9% before it crosses 1%. The player gets the fright
and the unlock, and the catastrophic version is reserved for the player who ignored the warning.
This is also simply how careers work.

### §5.2 The scar table (~35 entries) · [EXPAND]
Rewrite every row to A5.3's shape (cheap partial / expensive complete / lateral). As written, each
row is `pain → one specific building`, which makes the table a lookup rather than a decision set.
Example rewrite — *First backup restore failure* → unlocks **Restore Drill** (cheap, recurring cost,
gives confidence), **Immutable Pull-Based Vault** (expensive, architectural, actually solves it),
and **Restore-as-a-Product** (lateral: sell verified restores at a premium, which funds the drills
and turns your weakness into a revenue line).

### §5.3 "Scale milestones" · [EXPAND]
Good, and it should be stated as a design law rather than a list: **a milestone unlock fires at the
exact point the old method visibly stops working**, and the game should let the player feel the
strain for 60–90 seconds *before* the unlock arrives. Manual provisioning should become
*unbearable* before automation unlocks. That 90 seconds of friction is what makes the unlock land,
and it is the difference between an unlock and a gift.

### §5.4 "The Threat Codex / Bestiary" · [EXPAND]
The four-stage fill (Seen → Analyzed → Countered → Mastered) is excellent. Two additions: **(a)** the
Codex should show **your personal statistics** against each entry (times seen, times it landed,
lifetime cost, best response time) — a trophy case of trauma, as the entry says, but with numbers
that make you want to improve them; **(b)** a **Tell Trainer** (B2/§2.4) per Mimic-family entry.
The Codex is the best candidate in the whole document for "the screen players will actually spend
time in outside of play," and it should be built for that.

### §5.4 "The Runbook Ladder" · [EXPAND]
Called "the single best quality-of-life-as-progression idea in the document," and I agree. Extend
the ladder by two rungs at each end so it covers the full arc: **Notice** (the game highlights that
you've done this 3× and asks if you want to) → **Runbook** (one click, still yours) → **Assisted**
(staff can execute it) → **Automated** (fires on condition) → **Policy** (fires on condition, with a
guard and an escalation — A7.9) → **Retired** (you fixed the root cause and the runbook is no longer
needed, which should be *celebrated*). That last rung is the one the design most wants to reward and
currently has no expression for.

### §5.4 "Blueprint Fragments" · [INERT]
Collect-three-pieces is a collectathon that adds waiting, not decisions. Repurpose the art: make
fragments **partial information about a threat you haven't met** (a piece of the Codex entry
pre-filled), obtained from honeypots, peer intel and conference talks. Then they feed A5.1's
Anticipation Track and they're informative rather than a currency.

### §5.4 "The Conference Talk" / "Trade Show Serendipity" · [DEGENERATE]
"Returns a random tech-tree node" is arbitrary — random unlocks feel like the game choosing your
build. Fix: both should return a **choice of three**, weighted toward what you're struggling with
(the document already proposes the weighting; add the choice). Random *offer*, player *selection*
— that's the difference between a slot machine and a decision.

### §5.5 "The six-branch spine" vs the two alternate schemes · [CONTRADICTION]
Three competing branch taxonomies, explicitly unresolved. Recommendation: **derive the branches from
A2.1's nine defense roles plus three production roles**, because then the tree structure and the
Coverage Grid are the same object and the player only learns one taxonomy. Proposed final:
**Serve** (capacity/throughput/latency) · **Shield** (classify/meter/contain/divert) · **Sense**
(detect) · **Survive** (recover) · **Sustain** (facility/people/maintenance) · **Sell** (revenue/
deter/negotiate). Six branches, and every node's role tag tells you which branch it's in
automatically.

### §5.5 "Regret Nodes" · [EXPAND]
The tension noted in the document (fun-first vs authenticity) is real, and the proposed resolution
(escapable at a cost) is right but needs one more clause: **a regret node must be visibly signposted
as a short-term choice at purchase time** — not warned about, but *labelled*, the way a real
shortcut is. "Quick Setup (recommended for under 100 accounts)" is honest, tempting, and makes the
later pain the player's own. Regret without signposting is just a trap.

### §5.6 "The prerequisite lattice" · [EXPAND]
The strongest structure in the document. Two additions: **(a)** show the lattice as a **visible map
with locked doors and their conditions readable from the start** — knowing that email hosting needs
12 clean months is what makes the 12 months *meaningful* while you're living them; **(b)** add
**partial prerequisites** — you can open a line at 60% readiness for a penalty (worse margins, more
incidents, a "we launched early" scar), which gives the impatient player a real option with a real
cost rather than a wall.

### §5.6 "Clean IP reputation for 12 months → unlocks Email hosting" · [EXPAND]
Called "the hardest and best gate in the game," and it is — but a 12-month gate with no interaction
is just a timer. Make the 12 months *playable*: a visible reputation meter that individual decisions
move (accepting a marginal customer, an outbound spam incident, a slow abuse response), so the gate
is something you're *actively maintaining* rather than waiting through. Then unlocking email feels
earned rather than survived.

### §5.7 "The Deprecation Mechanic (a tech tree that rots)" · [MICRO][EXPAND]
Per-node rot across a 120-node tree is a maintenance chore with no decision in it. Restructure:
rot applies to **technology generations**, not nodes — your whole "2019 platform" ages together,
shown as a single generation band on the tree. Modernising is **one project** per generation, with a
cost, a duration, a downtime risk, and a benefit. Then it's a recurring strategic decision (three or
four times a campaign) instead of forty small chores. The document's own tension note is correct and
this is the resolution.

### §5.8 "The Whiteboard Tree" · [EXPAND]
Beautiful, and it should carry three things it currently doesn't: **(a)** the roads not taken
(A5.2's passed-on nodes, crossed out); **(b)** who knows what (A5.9's face-vs-binder markers);
**(c)** the generation bands (above). A whiteboard that shows your history, your organisation's
fragility and your technical age all at once is the best single screen in the game.

---

## B6. Economy, money, and scoring

### §6.1 "Cash (the survival currency)" and "MRR (the growth currency)" · [CONTRADICTION][EXPAND]
The document flags the two-currency confusion risk and proposes two distinct visualisations. That
isn't enough — the real problem is that neither number is a *health bar*, so the player can't tell
how close to death they are. **A6.10's Runway Bar** resolves it: runway is the health bar, cash is
the fuel, MRR is the score. Also: §8.8's rule "nothing on the HUD that the player cannot act on"
excludes MRR (you can't act on MRR directly) — which means either MRR moves off the HUD or the rule
needs a "and the three things you are ultimately playing for" exemption. Say which.

### §6.1 "Trust-with-upstreams (a hidden fifth)" · [INERT]
Invented in §6.1 and then never used as a mechanic anywhere in the document. It deserves to be real,
because it is the resource that decides the outcome of the game's most helpless moments. Make it
visible (a small relationship bar per upstream/vendor/registrar/processor), make it move (abuse
handling speed, payment timeliness, honest incident communication, traffic ratios), and make it pay:
it sets response time on BGP incidents (B2/§2.7), whether you get null-routed or warned, whether a
processor calls before terminating, and whether your transit provider lets you burst past commit
without a bill. That's four mechanics from one existing idea.

### §6.2 "Margin ranking (the honest hierarchy)" · [EXPAND]
The most useful teaching table in §6 and it should be **playable, not just printed**: show each
revenue line's actual margin as a live bar in the Ledger Drawer, sorted, so the player *discovers*
the hierarchy in their own P&L. The moment where a player realises their cross-connects out-earn
their servers should happen in their own data, not in a tooltip.

### §6.3 "Bandwidth: the 95th-percentile bill" · [EXPAND]
Called the most teachable cost in hosting, correctly. Make it *playable* by giving the player the
lever it implies: a **traffic-shaping decision** during a flood. You can absorb (costs 95th
percentile, keeps everyone served), shape (caps the bill, drops some legitimate traffic), or divert
to scrubbing (costs a fee, adds latency). Three buttons, three different currencies, and the correct
answer depends on how many hours are left in the month and how much of your top-5% allowance you've
already burned — which should be **shown as a visible "free spikes remaining" counter**. That
counter turns an accounting rule into a tactical resource.

### §6.3 "Technical debt interest — a line called 'Technical Debt Service' on the P&L" · [EXPAND]
The best version of this metaphor anywhere, and it needs the other half: a **paydown action** with a
visible return. Proposal: debt accrues at `0.8% of estate value per month per debt point`, and a
Paydown project costs `3 months of that debt's interest` to remove a point. Then debt is a loan with
a stated rate and paying it down is a calculable investment rather than a virtue.

### §6.4 "Cash vs Profit (the two ledgers)" · [EXPAND]
Add the single most instructive visual available: a **cash-flow waterfall** for the month, showing
money in, money committed, money actually available. The gap between "profitable" and "solvent"
becomes one picture, and it's the picture that explains why the whale contract (§6.7) is a crisis.

### §6.5 "The oversell ratio" · [DEGENERATE][NUMBERS]
As a single slider with a smooth downside, the optimal play converges on "push until complaints
start, back off one notch, done." Make the optimum *uncertain and moving*: the failure is not smooth
but **correlated** — the risk is that several tenants peak *simultaneously*, whose probability rises
super-linearly with the ratio and with tenant homogeneity. Concretely: `P(contention event per wave)
= (ratio/10)^2.2 × homogeneity`. A rack of 200 identical WordPress sites is far more dangerous at
8:1 than a mixed rack at 12:1. Now the decision involves *who* you packed together, not just how
many — which is a much better decision and is also true.

### §6.5 "Grandfathering" · [EXPAND]
A genuinely great decision that needs its three options priced. **Keep them** (margin loss, shown as
a widening gap on the per-plan margin chart), **migrate them with notice** (X% churn, Y reputation,
one support surge), **migrate them with a sweetener** (cash cost, half the churn). Add the cruel
detail that makes it real: grandfathered customers are disproportionately your *oldest and most
vocal*, so the churn you take is the churn that gets written about.

### §6.6 "The revenue-shape table" · [EXPAND]
The best single table in the document. One addition per row that would make it a design tool rather
than a reference: **"what a bad month looks like"** — the specific failure shape of each business.
Shared hosting's bad month is a slow churn bleed; colo's is a single tenant not renewing; GPU's is a
price collapse; backup's is a restore that fails in public; email's is a blocklisting. Authors then
know what pressure to write for each type.

### §6.6 "Occupancy and stranded capacity" · [EXPAND]
The most underused idea in §6 — it is a genuine, spatial, hosting-shaped optimisation puzzle and it
currently exists as a stat. Give it the overlay and the verb: a **capacity map** showing space,
power and cooling as three overlapping availability layers, with stranded regions hatched. The verb
is **tenant placement**: where you put each new tenant determines how much of your remaining
capacity stays sellable. That's Tetris with three simultaneous dimensions and it's excellent.

### §6.7 "Money-moving events" · [EXPAND]
All 17 are good and all are currently *announcements*. Apply the B2/§2.10 rule: each should arrive as
a card with 2–3 responses and at least one option that costs a hand. Specifically, the ones that
most need player agency: the whale signs (which of your capacity do you commit?), bill shock (which
credit do you offer?), the audit finding (remediate now or negotiate the deadline?), the viral
moment (spend to capture it, or protect the existing customers?).

### §6.8 "The metrics HUD" (seven blocks, ~35 metrics) · [MICRO]
Thirty-five metrics is a dashboard, not a HUD, and the section's own closing rule ("nothing on the
HUD the player cannot act on") would cut most of them. Restructure into **three tiers**: **HUD**
(always visible: runway, MRR, reputation, hands, error budget, headroom — six things);
**Drawer** (on demand: everything else, organised by the seven blocks); **Postmortem** (revealed at
level end: the counterfactual metrics like Money Left On The Table and un-noticed threats). Then the
metric wealth is preserved and the screen is playable.

### §6.8 "Error budget remaining" · [EXPAND]
Listed as one metric among 35. It should be the spine — see **A6.1**. This is the single highest-
value promotion available anywhere in the document.

### §6.9 "The four-axis scorecard" · [EXPAND][CONTRADICTION]
Uptime leads, which contradicts P9 ("the reward is letting through, not shooting down") and §9.6's
restatement of it. Reorder and reweight: **Conversion (Served/Arrived) 35% · Profitability 25% ·
Resilience 20% · Growth 20%**, with Uptime folded *into* Conversion (downtime is just the most
extreme way to fail to serve). Then the score card teaches the pillar instead of undermining it. Add
**Headroom** (A4.5) and **Drills** (A7.11) as the two components of Resilience so peacetime work is
directly scored.

### §6.9 "The Attacker Ledger — 'threats that got through and you never noticed'" · [EXPAND]
The best single line on the score screen. Make it *actionable*, not just chilling: each un-noticed
threat should name **the specific monitoring purchase that would have caught it**, and offer it at
the post-incident discount. Dread plus a door.

### §6.9 "Money Left On The Table" · [EXPAND]
Excellent framing. Break it into its causes so it's diagnostic rather than a single sad number:
lost to latency / lost to errors / lost to your own false positives / lost to capacity / lost to
never arriving (reputation). The **false-positive slice should be rendered in the same amber as the
in-world false-positive flash** (§8.6), closing the loop between the moment and the accounting.

### §6.10 "Win conditions — multiple, and the player picks" · [EXPAND]
See A6.12: the player must *declare* one, or multiple win conditions are just a menu at the end.
Declaring also solves a real problem the document has — the campaign currently has no way to know
what the player wants, so it can't tailor its opportunity events, board mandates or offers.

### §6.10 "The Zombie Host (a soft fail)" · [EXPAND]
Genuinely novel and it needs an exit ramp with a shape. Proposal: in zombie state you lose access to
growth systems (no marketing, no new lines, no hiring) but gain **one** thing — total focus. Your
hands are no longer contested, so you can actually fix the estate. Escaping requires reaching a
stated health bar (debt below X, drills current, churn under Y) over three months. It's a genuinely
different, slower, quieter game mode and it's the best possible expression of a turnaround.

### §6.11 "Loans priced by your uptime streak" · [EXPAND]
Called a delightful crossover and it is. Extend the principle: **operational quality should price
everything external** — insurance premiums (drills and MFA), transit terms (traffic ratios and abuse
response), vendor support tiers (payment history), enterprise conversion (uptime history), hiring
cost (the ex-employee posts of §2.10). One underlying "operational credit rating," six visible
consequences. That's the cleanest possible link between the ops half and the business half.

---

## B7. Core gameplay mechanics

### §7.1 "The dependency graph IS the map" · [EXPAND]
Correct and load-bearing, and it leaves one question unanswered that determines whether the game
works: **what does the player actually do with space?** If topology is logical and placement is
physical, the two layers must interact or one of them is decoration. Proposal, stated as a rule:
**the logical graph determines *what can happen*; the physical layout determines *what happens at
the same time*.** Two nodes on one PDU fail together. Two nodes in one rack heat each other. Two
nodes on one switch share a bandwidth ceiling. That single sentence makes §7.3's placement puzzle
mechanically necessary rather than flavour, and it is the honest description of real infrastructure.

### §7.1 "Capacity as concurrency slots, not HP" · [NUMBERS]
The right model; it needs its constants stated. A node has `S` slots; a request occupies a slot for
`service_time`; throughput is `S / service_time`; queue depth is set by A4.8's dial; latency is
`service_time + queue_wait`, and `queue_wait` follows the hockey stick — negligible below 70%
utilisation, `service_time × ρ/(1−ρ)` above it. Publish that curve in the Field Notes (§9.5) because
it is the single most useful thing anyone learns in this profession, and the game is built on it.

### §7.1 "Bottleneck highlight — the board always knows what your constraint is" · [CONTRADICTION]
Directly contradicts §7.6's "Fog of infrastructure — you can only see what you've instrumented." If
the game always tells you the bottleneck, diagnosis (the stated core gameplay) is solved for free.
Resolve: **bottleneck highlight is a purchased capability** (it arrives with distributed tracing,
the top monitoring tier) and before that the player has only *symptoms*. Getting it should feel like
an enormous late-game power-up — and it should still be *wrong* occasionally, because tracing shows
you where time is spent, not why.

### §7.1 "Effective vs nominal redundancy" · [EXPAND]
See B4/§4.7 — it needs the free audit overlay. Additionally: it should be **computed across all four
topologies** (data, power, control, trust — §7.2), because the most interesting version is a trust
dependency nobody drew: both "independent" services authenticate against one directory, so it is one
service wearing a costume.

### §7.2 "Drag-a-cable" · [EXPAND][MICRO]
The right primary verb, and at Tier 4+ with hundreds of links it becomes the game's main source of
tedium. Add the three scaling affordances explicitly: **bundle** (§1.8 mentions it visually — make
it a real object that links N pairs in one action), **template stamping** (§7.2 has it), and
**declared intent** ("this tier connects to that tier" as a *rule*, with the individual cables
generated and maintained). The last one is the endgame: you stop drawing cables and start declaring
relationships, which is exactly the real progression from patch panels to infrastructure-as-code.

### §7.2 "Physical vs logical views that can disagree" · [EXPAND]
Called the best idea in the section, and it is. Give it the verb it's missing: a **Reconcile** action
that costs hands and *updates the logical map to match reality*. Before reconciling, your logical map
is your *belief*; the physical is the *truth*; and the game should let your beliefs be wrong for a
long time. Every acquisition, every emergency change, every contractor visit desynchronises them.
"How stale is my map" becomes a stat, and it is a genuinely novel thing for a strategy game to track.

### §7.2 "Connection contracts / policy beads" · [EXPAND]
Excellent — configuration lives on the edge. Add the consequence: **beads are what you actually
copy.** A template's value is its beads, not its boxes. And a **bead audit** overlay (which links are
encrypted, which are rate-limited, which have breakers) is the fastest possible way to see your
security posture, far better than a per-node view. Recommend making the bead audit the *default*
security overlay.

### §7.3 "Rack U Tetris" · [DEGENERATE][MICRO]
Pure packing with no strategic content is busywork, and at Tier 4 (40 racks) it's a lot of busywork.
Make the packing *mean* something by making the three constraints conflict: **U space** wants density,
**power** wants spread (circuit balance), **thermal** wants spread (hot spots), **latency** wants
proximity, **blast radius** wants separation. When five constraints pull in different directions on
the same decision, packing becomes a genuine puzzle. Also: give the player **auto-pack with a
penalty** (§7.2 does this for cabling) so it's never mandatory.

### §7.4 "Tuning instead of levels" · [MICRO][EXPAND]
The right upgrade system and the biggest micromanagement risk in the document — dozens of sliders
across hundreds of objects. Four mitigations, all needed:
1. **Cap at three sliders per object.** If a fourth matters, it belongs on a policy, not an object.
2. **Tuning is a *policy* by default and a *per-object override* by exception.** You set worker
   counts for "web tier," not for `web07`. Overrides are visibly marked (A8.6) and count against a
   **snowflake budget** — exceed it and you lose the Standardisation bonus (A4.14).
3. **Suggested ranges narrow as monitoring improves** (the document proposes this; make it the
   primary progression of the tuning system — better observability literally shrinks the search
   space).
4. **A7.7's config snapshots** so experimentation is safe.

### §7.5 "Hands as action slots" · [NUMBERS][EXPAND]
The core resource, unnumbered. Proposal: hands per tier — T0–1: **1**; T2: **2**; T2.5–3: **3**;
T4: **5** plus remote hands (delayed, paid); T5: **7** plus remote plus follow-the-sun; T6:
hands are delegated entirely and the player has **2 executive actions per business month**. Action
durations (at 1× = 1 sim-minute/sec): restart a service **20s**, config change **40s**, failover
**90s**, physical disk swap **6 min** on-site / **45 min** remote hands, full restore **long enough
to hurt**, cable trace **3 min**, investigation of a fogged object **2 min**. Crucially: **the
number of simultaneous incidents the generator may produce should be tuned as a ratio to hands**
(target peak: 1.5 × hands), because that ratio *is* the difficulty.

### §7.5 "Executive attention as a tiny pool" vs P4 "Hands" · [CONTRADICTION]
Two attention economies that would double-tax the player if both are live. Resolve by making them
**sequential, not simultaneous**: hands are the resource from Tier 0 to Tier 4; from Tier 5, hands
are fully delegated (you set policies, staff execute) and **executive attention replaces hands as
the scarce resource**. The handover moment — when the game takes the wrench out of your hand — should
be an explicit, dramatic, slightly sad beat, because it is the actual arc of the career.

### §7.5 "The 90-day lag" · [EXPAND]
The signature business mechanic and the one most likely to read as randomness. It needs three things:
**A6.9's Attribution Ledger** (so consequences name their causes), a **forecast band** on the
Obligation Rail (so the player can see a consequence approaching before it lands), and a **variance
rule**: the lag should be `90 ± 15 days` with the *magnitude* uncertain but the *direction* certain.
Uncertain timing plus certain direction is tense; uncertain direction is just noise.

### §7.5 "Speed controls, with a catch — at high speed you get less information" · [EXPAND]
A great idea that needs to not feel like a punishment for wanting to skip. Make the tradeoff
*explicit and adjustable*: at 2× the log panel summarises, at 4× only sev-2+ surfaces, and the player
sets **what speed auto-drops to on which severity** (§7.5 has auto-pause; make it a full policy).
Then fast-forwarding is a delegation decision rather than a gamble, which is much more in keeping
with the rest of the design.

### §7.5 "The Inbox: decisions as cards" · [EXPAND]
The cheapest and best carrier for the entire business layer. Three rules to make it work: **(a)**
cards have **deadlines**, shown, and expiring is always a (bad) choice; **(b)** at most **three
cards open at once** — a full inbox blocks new ones, which is itself informative; **(c)** every card
shows **which resource it costs** as an icon, so the player can triage the inbox against their
current constraint without reading. The Inbox is also the right home for every §2.10 business threat
(B2 above) and every §6.7 money event (B6 above).

### §7.5 "Maintenance windows" · [EXPAND]
Underdeveloped relative to its importance — it is the hinge between peacetime and crisis. Give it
structure: windows are **declared in advance** (notice period affects reputation cost), have a
**duration you choose** (longer = more changes land = more customer annoyance), suspend SLA accrual,
and have a **slot count** (A7.10). Add the two failure modes that make them interesting: **overrun**
(you didn't finish; do you stop half-done or run over into SLA-bearing time?) and **the window you
needed and didn't declare** (an emergency change outside a window costs triple reputation).

### §7.6 "Fog of infrastructure" · [EXPAND]
See A7.15 for the fairness contract. One addition: fog should be **per-property, not per-object** —
you might know a machine's CPU and not its disk latency. That makes the monitoring ladder (§4.6)
meaningful at object granularity and produces the real experience of "I can see three of the four
numbers I need."

### §7.6 "Red herrings" · [DEGENERATE]
The document's own tension note is right and needs a hard rule: **at most one red herring per
incident, and it must be resolvable by a tool the player owns in under 30 seconds.** A red herring
that costs two minutes of a four-minute incident isn't a puzzle, it's a tax. Also: the postmortem
must always *name* the herring, so the player learns the pattern rather than concluding the game is
capricious.

### §7.6 "The in-game terminal" · [EXPAND]
The document flags the scope risk and proposes five commands. Concretely, the eight that carry the
most game state and the most charm: `top` (what's eating this box), `df -h` (the inode joke lives
here), `dmesg | tail` (hardware and OOM), `ss -s` (connection states — makes SYN floods legible),
`dig +trace` (it's always DNS), `mtr` (where the path breaks), `iostat -x` (the IO wait that explains
everything), `tail -f` (the log). Rule: **every one of them must reveal something the GUI shows
too**, so the terminal is speed and pleasure, never a requirement — and every one of their outputs
should be *readable to a non-expert* with a one-line annotation the first time.

### §7.7 "Graceful degradation, pre-configured" · [EXPAND]
Called the most important failure mechanic, and it is — this is the mechanism by which peacetime
preparation pays off in crisis, which is the game's entire thesis. It deserves a proper editor: the
**Degradation Ladder** as a vertical list of rungs, each with a trigger condition, an action, and a
customer-visible consequence preview (rendered live in the Site Preview Window so you can *see* what
your customers will see at 85% load). Combine with A3.3's priority classes and this is the single
best peacetime screen in the game.

### §7.7 "The technical debt meter" · [EXPAND]
Needs the two things any debt system needs: a **rate** (B6/§6.3 gives one) and a **visible
composition** — which debts you're carrying, each nameable and individually payable. An undifferen-
tiated debt number is a guilt meter; a list of five named debts with costs and paydown prices is a
decision screen.

### §7.7 "The death spiral and its three exits" · [EXPAND]
Naming the pattern is excellent; the exits need to be *purchasable objects on screen* when the game
detects the spiral, not concepts. When the spiral is detected, the Inbox should present exactly
three cards: **Shed** (sell/close a line — A6.11), **Fund** (financing, at bad terms), **Fix**
(a focused root-cause project with a stated duration you must survive). All three should be genuinely
survivable, and taking none of them should be possible and fatal.

### §7.8 "Per-type mechanical shifts" · [EXPAND]
This section is the operational heart of the variety engine and it should state its own budget:
**a hosting type must change 3–5 of these and no more.** Change two and it's a reskin; change eight
and it's a different game and the player has to relearn everything. Add the corollary from A1.4:
**the six core verbs never change**, only which of them dominates.

### §7.8 "Control granularity as a difficulty axis" / "Keyhole mode" · [EXPAND]
See B1/§1.3 — needs the three indirect verbs. One more point worth stating: **removing agency is
only fun if the *information* is rich.** The colo operator can't touch the tenant's server but can
see its power draw to the watt, its port counters, its temperature and its inlet airflow. Rule:
**every unit of agency you remove must be replaced with two units of visibility**, or the level is
just frustrating.

### §7.9 "The three-clock rule" · [CONTRADICTION]
The document proposes roughly twenty timers (cert expiry, patch lag, backup window, fuel gauge,
renewal wave, audit deadline, breach-notification clock, 90-day lag, on-call clock, settling windows,
error budget, DNS TTL, pass window, lease term, grace timer, obligation rail, uptime streak...) and
then insists on exactly three. Resolve with **A8.5's Unified Clock Ribbon plus a promotion rule**:
all timers exist, all live in one ribbon, and the interface *promotes* exactly three to prominence
by urgency × consequence. The rule then becomes a UI guarantee rather than a content restriction,
which is the only way to keep both halves of the document.

### §7.9 "Calm / storm rhythm" · [NUMBERS]
Give it a target: **60/40 peacetime/incident by wall clock**, with peacetime blocks of **60–120
seconds** (long enough to start something, short enough to stay engaged). Also state the anti-pattern
to avoid: peacetime blocks shorter than ~45 seconds produce a game where you can never finish an
action, which is the most common failure mode of real-time strategy pacing.

### §7.9 "Opportunity events" · [EXPAND]
Correctly identified as necessary ("a game that only threatens becomes exhausting"). Give the
generator a quota: **at least one opportunity per two threats**, and at least one *positive event
that requires no decision* per level — a customer says thank you, a referral arrives unprompted, the
graph is just good. A game about operations needs unearned small joys or it becomes a grind about
guilt.

---

## B8. Visuals and presentation

### §8.2 "The Three-Layer Rendering Rule" · [EXPAND]
The best production rule in §8. Add the fourth layer the design actually needs: **Intent** — the
player's own configuration, decisions and pending changes (A8.6's hand-set ticks, ghost builds,
scheduled actions, policy markers). It renders above Annotation, in white, and it answers the
question a configuration-heavy game must answer constantly: "what did I ask for, and has it happened
yet?"

### §8.2 "The colour language" · [EXPAND]
Nine colours with fixed meanings is right. One gap: there is no colour for **"this is your own doing"**
— a self-inflicted failure (bad deploy, misconfiguration, your own rate limit, your own automation)
currently renders identically to an external attack, which destroys the most important distinction
in the whole game. Proposal: self-inflicted failures carry a **white-cored** version of red — the
control-plane colour bleeding into the failure colour. It reads instantly, it's thematically exact,
and it makes the postmortem's most important sentence visible in real time.

### §8.2 "The Readability Budget" · [EXPAND]
Excellent and it should extend to *decisions* as well as to visuals: **at most three things marked as
decisions at once** (A7.4), **at most three promoted clocks** (A8.5), **at most three open inbox
cards** (B7/§7.5). Three budgets, one number, applied to visuals, time and agency. That consistency
is itself a design asset.

### §8.3 "The Four Altitudes" · [EXPAND]
Add the rule that makes altitudes a *verb* rather than a zoom: **each altitude owns a different set
of actions.** Z1: inspect, tune, swap. Z2: wire, place, rack. Z3: route, segment, triage, degrade.
Z4: allocate, contract, expand, arbitrate. Then changing altitude is changing what you're doing, not
just how much you can see, and the Four Altitudes become the game's mode structure.

### §8.5 "Telegraphs — the size of the telegraph is proportional to the threat" · [EXPAND]
Combine with A2.3's Feint and state the honest rule: **the telegraph is always proportional to the
threat's *pressure cost*, not its danger to you.** A huge, loud, well-countered volumetric telegraphs
enormously and does nothing. A small quiet thing that you have no answer to telegraphs faintly. That
makes telegraph-reading a genuine skill — you learn to ask "big for whom?" — instead of a
proportional warning system.

### §8.6 "The bounce" / "Every bounce is individually visible so loss is felt" · [CONTRADICTION]
Directly conflicts with §8.9's "Aggregate, don't shrink" and "Crowd density as a particle field."
At Tier 4 you cannot render ten thousand individual bounces. Resolve with a **guaranteed-individual
subset**: high-value units (Buyers, Whales, Reviewers, Enterprise, anything above a value threshold)
are **always** rendered individually at every altitude, with their own bounce animation and sound;
everything else aggregates into the particle field with a density drop and a single tally. Loss is
felt where it matters and legibility survives. This is also economically correct — losing a skimmer
should not feel the same as losing a checkout.

### §8.6 "The false-positive flash" · [EXPAND]
Called the most important negative feedback in the document, and it is. Two upgrades: **(a)** the
amber tick should accumulate on the *defense that did it* as a visible running count, so an
over-tuned defense becomes progressively uglier; **(b)** at high volume, false positives should
render as an amber **haze** around the offending defense — you should be able to see over-tuning from
Z3 as a coloured cloud without reading a number.

### §8.7 "Money as motion" · [EXPAND]
Add the one that would do the most work: **the drain lines should be attributable on hover.** Hovering
the outflow stream shows its composition — power, payroll, transit, licences, debt service — as
labelled sub-streams. §6.3 has 14 cost categories and the player currently has no spatial
relationship with any of them. Making the burn rate a thing with visible *parts* is what turns cost
management from a spreadsheet into a feeling.

### §8.8 "The HUD skeleton" · [EXPAND]
See B6/§6.8's three-tier restructure. One addition to the skeleton itself: a permanent **"Now" strip**
holding A7.4's up-to-three decisions. In a game this dense, the most valuable screen real estate is
whatever answers "what am I being asked right now," and nothing in the current skeleton does.

### §8.8 "The Site Preview Window" · [EXPAND]
Called the single best UI idea in the document; I agree, and it should do three more jobs:
**(a)** it previews the *consequence of a pending change* (what the customer will see if you fire
this degradation rung, before you fire it); **(b)** it is one of the two ground truths that HUD
attacks may never lie to (A2.8); **(c)** in colo/keyhole levels it becomes **the tenant's dashboard**
— what your customer can see about you, which is a brilliant way to render the information asymmetry
of that whole hosting type.

### §8.8 "The Timeline Ribbon" and "The Obligation Rail" · [EXPAND]
These are the past and the future of the same object. Merge them into A8.5's Unified Clock Ribbon —
one strip, "now" in the middle, history to the left, obligations to the right, scrubbable in both
directions. Built once, used in four places (play, postmortem, replay, share image), and it's the
single most information-dense element the game can have.

### §8.8 "Growing tooltips" · [EXPAND]
Delightful, and it should extend to the *build cards*: an early build card shows cost and capability;
a later one shows cost, capability, your historical utilisation of the last three you built, your
average incident rate with them, and what they cost you in friction. **The UI itself becomes an
experience record**, which is a genuinely novel progression axis.

### §8.9 "The Quiet Frame Test" · [EXPAND]
The best acceptance test in the document. Add its inverse, which is equally important: **the Loud
Frame Test** — a screenshot of a system in crisis must contain **exactly one obviously most-urgent
thing.** If a crisis screenshot has five equally loud things, the alert hierarchy has failed. Two
tests, one for each end of the range, and they'll catch nearly every readability regression.

### §8.9 "Aggregate, don't shrink" · [EXPAND]
Add the aggregation *contract*: an aggregate glyph must carry (1) a count, (2) the worst state
inside it, (3) a *trend* arrow, and (4) whether anything inside it is **pinned** (A7.6). Without the
trend, an aggregate tells you where you are and not where you're going, which at Z3/Z4 is the only
thing that matters.

### §8.10 "The Business-Line Skin System / Five-Asset Skin Kit" · [EXPAND]
The most practical production idea in the document. One amendment from the design side: of the five
assets, **the signature meter is the one that carries the gameplay identity**, and it should be
specified first, not last. If you can't name the meter, the type doesn't have a ruleset yet — it has
a costume. Recommend reordering the kit as: **meter → visitor form → hero silhouette → palette →
ambient FX/sound**, so authoring starts with the mechanic.

### §8.10 "Per-line visual identities (the catalogue)" · [EXPAND]
Add a **density and rhythm signature row** to each entry (the section has both ideas as separate
general notes; putting them per-line makes them authorable). Two lines with the same palette but
different density and arrival rhythm are more distinguishable than two with different palettes and
the same rhythm — motion identity beats colour identity at every zoom and in every accessibility
mode.

### §8.11 "The datacenter hum — ambient audio as telemetry" · [EXPAND]
Called the most underused idea in strategy games, correctly. Push it further: **the hum should be
composed of separable voices** — fans (load), drives (IO), CRAC (thermal), UPS (power state), and
the room tone (occupancy). A trained player hears *which* voice changed. And the accessibility
inverse must exist: a **visual EQ strip** showing the same five voices as bars, so the audio
telemetry is available to players who can't use audio.

### §8.12 "The Save" · [EXPAND]
"Design the clutch moment deliberately or it won't happen" is exactly right and needs a trigger
definition, or the game will never fire it. Proposal: a Save fires when a threat is neutralised with
**less than 8% of the affected resource remaining** *and* the player took a deliberate action within
the preceding 6 seconds. Both conditions matter — the second is what makes it feel like *your* save
rather than luck. Cap at ~2 per level so it stays special.

---

## B9. Anything else

### §9.1 "Endless / Survival (The NOC)" · [EXPAND]
Described as "the mode people will actually play the most," which makes its thinness a risk. Endless
needs a **run structure**, not just escalation: propose **seasons** — every ~12 waves the business
rolls over (a quarter closes, the board sets a mandate, you draft one of three modifiers, hardware
ages one step, and one hosting line is offered). That gives endless a rhythm, a reason to make
long-term decisions, and a natural place to put A2.12's affixes.

### §9.1 "Incident Mode / Blitz Sev-1" · [EXPAND]
The best showcase of what makes this game different and it's one paragraph. It needs A9.2's
architectural bad-habit library to generate boards that are *readable and unfair in interesting
ways*, and it needs a **par time** per incident so there's a mastery axis. It is also, per A9.1, the
natural mission unit for a roguelite run structure — which is probably the highest-return single
addition to the whole modes section.

### §9.1 "Co-op NOC — asymmetric information" · [EXPAND]
The best multiplayer idea here, and the design implies a hard requirement worth stating: **no player
may see the whole board.** Give each seat a genuinely partial view (network / application / customer
/ facility), make the overlaps deliberate, and make the win condition require information that no
single seat has. Also pull **shift handoff** out into single-player as A7.14 — it's too good to
leave behind a multiplayer paywall.

### §9.1 "Versus / Red vs Blue" · [EXPAND]
See A9.3 — a live free-form asymmetric mode is very hard to balance; a drafted deck-vs-deck structure
over timed waves is achievable and uses the taxonomy work you've already done. It also makes the
Coverage Grid (A2.1) into a metagame, which is how asymmetric PvP stays interesting past week two.

### §9.1 "Line Draft" · [EXPAND]
The best roguelite structure offered and it needs the synergy/antagonism numbers (see §0.2 below) to
be a real draft. Add the standard draft affordances: a **visible pool** (what could still come), a
**rarity tier** (some lines are rare and swing a run), and a **pivot cost** (you can drop a line
mid-run for a partial refund and a specialisation penalty). Those three turn a pick-one screen into
a drafting game.

### §9.2 "Your Past Self Is The Boss" · [EXPAND]
Called the best twist in the document. Make it *systematic* rather than a one-off (A1.16): the game
should be **recording your habits** — did you document, did you standardise, did you leave snowflakes,
did you over-permission — and the returning board should be *generated from those habits*, not from a
script. A player who was tidy gets a tidy inheritance and a smug feeling; a player who wasn't meets
their own ghost. That's the most personal possible content and it costs a habit-tracker and a
generator.

### §9.2 "The Camera Is a Camera" · [EXPAND][DEGENERATE]
Terrifying and elegant, and as stated it can remove the player's ability to act at exactly the
moment they most need to — which is the definition of an unfun mechanic. Bound it: losing visibility
at a site means you lose **live detail** but keep **last-known state, greyed and timestamped**, plus
whatever out-of-band telemetry you bought. The out-of-band LTE modem (§4.10) becomes the purchase
that restores partial sight, which is exactly the lesson, and the fear becomes "my picture is 90
seconds old" rather than "I am blind and helpless."

### §9.2 "Documentation as a mechanic" · [EXPAND]
It needs a positive, immediate, *felt* return or players will rationally skip it. Three returns,
all immediate: **(a)** documented objects show their purpose on hover instead of "???"; **(b)**
documented procedures become one-click runbook cards (§5.4); **(c)** documented systems can be
**delegated** — undocumented ones can't, so documentation is literally the prerequisite for having a
team do anything. That third one is the real reason documentation exists and no game has ever
modelled it.

### §9.2 "The Vacation mechanic" · [EXPAND]
Called one of the sharpest ideas here and I agree. Make it a *scheduled obligation with a visible
calendar*, so it's a planning puzzle: everyone must take N weeks per year, you choose when, and the
weeks you choose reveal your bus factor at a time of your choosing rather than the universe's.
Deliberately scheduling someone's vacation to *test* your cross-training is one of the most
satisfying possible strategy-game actions, and it is a real management technique.

### §9.2 "The Threat You Can Hire" · [EXPAND]
Great hook, no consequence. Give it three: the hired attacker **reduces spawn rate from their own
archetype** (they know the community), **unlocks that archetype's Codex to Mastered**, and carries a
**permanent trust flag** — other staff morale is slightly lower, background-check-required lines
(regulated, government) are unavailable while they're employed, and there's a small ongoing chance of
an insider event. Now hiring them is a real, spicy, priced decision.

### §9.2 "The Compliance Theater Meter" · [EXPAND][NUMBERS]
Called one of the sharpest observations in the document and it's currently two sentences. Give it
teeth: **Actual Security** and **Demonstrable Compliance** are two separate 0–100 stats. Audits score
the second; threats test the first. Some purchases move one and not the other (evidence collection,
policy documents, a penetration-test report = compliance; segmentation, MFA, patching = security;
a few move both). The gap is displayed as a single number with a name — **Theater** — and a high
Theater score is a scored penalty at level end *and* a threat modifier (you are more breachable than
your certifications suggest). It's the best cynical mechanic available and it costs one number.

### §9.2 "Weather Affects Everything" · [MICRO]
Unbounded weather across every level is noise. Scope it: weather is a **first-class threat only in
types where it actually is** (satellite, edge/MEC, any owned facility, microwave links) and elsewhere
it is a **slow economic modifier** (summer raises cooling cost and power price; winter gives free
cooling) rendered in the level's colour grade and nowhere else. Two behaviours, clearly separated.

### §9.2 "The Missing Screw" / "The Beeping Server" · [INERT]
Both are charming and both are unpaid friction. Give each exactly one job. **The Missing Screw**: a
variance *reducer* purchase — a stocked rail-kit and consumables bin removes it entirely, which is a
tiny, cheap, deeply satisfying "I fixed the annoying thing" purchase. **The Beeping Server**: bound
it to a maximum of ~20 seconds, make it findable by an overlay you can buy (asset tracking), and use
it exactly twice in the campaign so it stays a joke rather than becoming a chore.

### §9.3 "Recognition comedy, not parody" · [EXPAND]
The right tone, and worth adding the design consequence: **the comedy should never interrupt a
decision.** Jokes live in ticket text, staff chatter, loading screens, labels, achievement names and
the Intern's Log — all of which are read during calm. Nothing funny should appear inside an alert, a
build card, or a crisis prompt, because the comedy will undercut the tension you spent twenty minutes
building. State it as a rule so writers can be trusted with the rest.

### §9.3 "Server naming and the label maker" · [EXPAND]
"A running joke that becomes an operational problem" is exactly right and is also the document's best
*player-expression* hook, which is a category it's otherwise thin on. Make the naming scheme a real
choice with real effects: **functional** names (`web-fra-07`) give a small MTTR bonus and no
personality; **thematic** names give a small morale bonus and a small MTTR penalty at scale; a
**mixed/legacy** estate (which is what you get after an acquisition) carries a real penalty until
you do a renaming project, which is a genuinely funny thing to have to schedule.

### §9.4 "The Playbook" · [EXPAND]
Meta-progression as institutional knowledge is the right idea; it needs a cost or it's pure
snowball. Proposal: the Playbook holds a **fixed number of slots** (say 8) and you choose which
procedures to carry between runs. Carried procedures start at **Assisted** rather than **Automated**
(A5.4's ladder), so you keep the knowledge and re-earn the automation. Meta-progression that
preserves the moment-to-moment loop is the only kind worth shipping.

### §9.5 "Field Notes" and "The 'was that real?' tag" · [EXPAND]
Both good, and the tag deserves a third value beyond real/simplified/liberty: **"real, and worse"** —
for the many cases where the game had to *soften* reality to be playable (real restore times, real
audit durations, real BGP propagation, real hiring timelines). That tag is funnier, more honest, and
more flattering to the audience than either of the other two.

### §9.6 "Every tower has a downside" · [CONTRADICTION]
See B4/§4.1 — needs the two-clause rewrite, because the document itself ships ~5 deliberate pure
wins and is right to.

### §9.6 "No optimal build order" · [CONTRADICTION]
See B5/§5.1 — collides with scar-driven unlocking. Needs the Anticipation Track, seeded threat order,
and the Second Answer rule, or the claim should be dropped.

### §9.6 "The reward is letting things through" · [CONTRADICTION]
Stated as a guardrail and then contradicted by §6.9's uptime-first scorecard and by the sheer mass of
§2 (roughly 200 threats against roughly 45 visitor archetypes). Two fixes: **reweight the scorecard**
(B6/§6.9), and **rebalance the content ratio** — for every new threat added, the design should ask
what new *visitor* or *conversion* mechanic it creates a reason for. A design that is 80% about
monsters will play as a game about monsters no matter what the pillars say.

### §9.6 "Lose slowly" · [EXPAND]
Add the operational definition so it's testable: **from the first visible warning to the unavoidable
loss must be at least 3 minutes of level time, and the warning must be in the top three promoted
clocks (A8.5) for that whole period.** If a playtest produces a loss the player didn't see coming for
three minutes, that's a bug.

### §0.2 "Line Synergies" / "Line Antagonisms" / "The Portfolio Meter" / "The 'What Are We Even' stat"
· [NUMBERS][EXPAND]
Four related ideas, all currently qualitative, and together they're the late game. Proposed numbers:
- **Synergy**: a synergistic pair grants **−15% shared infrastructure cost** and **+10% cross-sell
  conversion** between their customer bases. Peak-hour complementarity is separate and mechanical:
  your facility is sized to *peak* load, so two lines whose peaks are 8+ hours apart let you size to
  ~70% of the naive sum — a large, real, discoverable saving.
- **Antagonism**: a conflicting pair competes for a **named shared resource** (power, staff
  attention, IP reputation, compliance scope), and the conflict is rendered as a literal allocation
  slider between the two districts. Not a penalty — a *fight*, which is much better.
- **Portfolio Meter**: variance reduction of `1/√n` across lines, offset by an expertise penalty of
  **−8% operational effectiveness per line beyond the second** unless you've hired dedicated staff
  for it. That's the whole diversification tradeoff in two terms.
- **"What Are We Even"**: derive it rather than tracking it separately — it's just the expertise
  penalty made visible, plus a brand-conversion modifier. One fewer stat, same idea.

### §0.2 "The Three-Change Rule" and "The Verb Shift Rule" · [EXPAND]
Both are correct and both need their enforcement clauses (A1.4's Invariant Core, B7/§7.8's 3–5
change budget). Add one more test that would catch a bad hosting type before it's built: **the
Rosetta Test** — can you write the Rosetta Card (A1.3) for this type in three lines, mapping its
mechanics to ones the player already knows? If you can't, the type is a new game and should be cut.
If you can, it's a variation and it will feel fresh *and* familiar, which is the target.

### §0.1 P7 vs the game-design lens · [CONTRADICTION — resolution proposed]
The document notes the tension between "ship the real monsters" and "hosting is flavour for
mechanics." Proposed resolution, stated as a two-step filter rather than a preference:
1. **Reality is the source list.** Never invent a monster; the real ones are better.
2. **Mechanical role coverage is the filter** (A2.1's grid, §2.1's five axes plus the sixth from
   B2). A real failure mode that duplicates an existing role on every axis becomes **Codex flavour
   attached to an existing threat**, not a new threat.
3. **Playability is the veto.** A real failure with no counterplay, no telegraph and no diagnostic
   path is a random number generator wearing a costume, and it gets cut or given counterplay —
   which is usually available, because real operators *do* have counterplay for almost everything.
Both lenses get what they actually want, and the rule is applicable by a content author without
a judgement call.

---

## Closing note — the six changes I would make first

If only six of the above ship, these are the ones that change whether the game works:

1. **A6.1 — Error Budget as a spendable currency.** The missing in-combat resource.
2. **A3.1 + A3.2 + A7.1 — Suspicion Routing, the Millisecond Budget, Inspection Depth.** The missing
   mazing layer; turns defense from shopping into architecture.
3. **A2.1 — The Nine Defense Roles and the Coverage Grid.** The missing half of the threat taxonomy;
   makes the tech tree reasonable about.
4. **A1.4 + A1.3 + A1.2 — The Invariant Core, the Rosetta Card, the Handover Note.** The answer to
   the brief's fragmentation question: twenty rulesets, one game, taught in three lines each.
5. **A6.3 + B-wide numbers.** The document's tensions become mechanics the moment they have values.
6. **B6/§6.9 — reweight the scorecard to lead with conversion.** Until the score sheet implements
   P9, the game will be played as a game about stopping things, and the entire premise is that it
   isn't.
