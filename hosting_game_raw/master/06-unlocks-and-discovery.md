# 5. Unlocks and discovery

## 5.1 Unlock philosophy

### Scar-driven progression (the core principle)
**You should unlock things by *experiencing* things, not by ticking XP.**

**How it works:** The sysadmin truth about learning is that **nobody buys a solution before they've had
the problem.** You don't install monitoring because it's best practice; you install it because you were
down for six hours and didn't know. So most unlocks are earned by suffering. The tech tree should feel
like a lab notebook — or a memoir. **A tech tree you buy is a shopping list; a tech tree you unlock by
living through things is a memoir.** The same principle stated from the other side: **unlocks should
come from things that happened, not from a shop.** The best unlocks are the ones you earn by surviving
something, by noticing something, or by being forced into something.
**Hosting types:** universal — every type has its own scar vocabulary (a CDN learns cache poisoning, a
GPU line learns power capping, an email line learns blocklists).

### Postmortem Research (the primary engine)
**You cannot research a counter until you've been hit by the threat it counters.**

**How it works:** Getting SQL-injected unlocks the WAF research node. Losing a disk unlocks RAID. A
power event unlocks the generator. This inverts the usual TD structure — **the enemy teaches you the
tower.** It makes every loss productive, it makes the difficulty curve self-pacing, and it means two
players' tech trees look different by hour three. Mechanically, *completing the postmortem document*
is what unlocks the counter, not merely surviving: fail → understand → build → never fail that way
again. That is literally the job.
**Interacts with:** §6.9 (the postmortem screen generates the unlock choices), the Second Answer rule
below, the three acquisition paths below.

**⚔️ Tension — the structural flaw, flagged by three separate reviewers.** Taken alone, strict
pain-gating has four consequences:
1. **It collides with "no optimal build order" (§9.6).** If you can only research a counter after
   being hit, and the threat order is authored, then the tech order is authored and identical for
   every player.
2. **It punishes competence.** A player who builds well and avoids incidents ends up with a *smaller*
   tech tree than one who plays badly. That is backwards.
3. **It makes new hosting lines unplayable.** Switching to email hosting with no email scars means you
   cannot buy any email defence at all — a hard wall, not a difficulty curve.
4. **On a second playthrough it converts the tree into a checklist of damage you must deliberately
   take**, which is the exact opposite of the intended memoir feel.

The four fixes, all of which the document already half-contains and which should be promoted to
first-class: the **three acquisition paths** (below), the **Anticipation Track** (below), **seeded
threat introduction order** (below), and the **Second Answer rule** (below). Without these, §5.1 and
§9.6 cannot both be true and the design has to say which one wins.

**Variations and additions**

- **The Ticket System as tech tree / Incident-to-Runbook / Post-Mortem Drops.** Run the same engine off
  the *support queue* as well as off outages: every resolved ticket of a **new class** has a chance to
  discover a buildable ("we needed a cache because the DB fell over" → cache unlocked), and surviving —
  or losing to — an incident type teaches a **runbook card** so that next time one click executes the
  correct response. The level-end blameless post-mortem then drops the counter's blueprint *and* a
  codex entry: **the best way to discover the counter to SQLi is to get SQLi'd.** Failure is the
  tutorial, and **failed levels are generous unlock sources.**
  **Visual:** a sticky note slaps onto the office whiteboard — *"TLS: worth it — 3 breaches!!"* — and
  **peeling it off literally unlocks the counter**, so every unlock carries the narrative memory of the
  pain that bought it.
- **The Failure Lottery.** Your *first* loss to any novel threat always gifts the guaranteed blueprint
  of its counter, plus a museum plaque. Loss-gated progression is **kind on the first wound**; repeat
  losses stay worthless, because you already have the thing.
- **Cap the generosity — the due-diligence floor.** If *every* failure teaches, failure stops being
  scary. Only failures **below your due-diligence floor** teach: if the counter was already available
  and you chose not to build it, there is no gift — you get the codex entry, not the discount. This is
  also what keeps a New Game+ compliance run honest.
- **Support-Ticket Autopsy.** Resolve 100 tickets → discover the pattern → unlock the knowledge-base
  buildable. Discovery via play: you notice tickets repeat, so a "canned responses" tier appears.
- **Support-Ticket Archaeology.** Reading the actual tickets in the queue sometimes surfaces feature
  requests ("please support Postgres 16") that unlock buildables — **customer demand literally
  discovers tech.**
- **Metered Billing after a Spike Loss.** Overprovision and go broke, or underprovision and lose the
  customer — either way the autoscaling / metered-pricing branch appears. Pain reveals the node.
- **Incident-Driven Discovery — the locked box.** A threat you have deliberately never seen shows its
  counter as **a locked box with a "?"** rather than as an absent node, so the shape of your ignorance
  is visible. Survive it once and the box opens permanently (ransomware → tested backups; first hijack
  → RPKI).
- **Discovery-by-Incident, the school of hard knocks.** Losses still count **if you lasted past the
  incident wave** — surviving *or* losing to a threat family once opens its counter for purchase.
  Ransomware → backup automation; worm → isolation field; APT → threat intel. Real-ops flavour: the
  first memcached-reflection hit teaches the "bind to localhost" perk. You learn the tech tree by
  getting hurt, like real ops.
- **Threat Codex via First Blood.** Each threat type gets exactly one appearance as an unannounced
  ambush; after you survive it, it is *discovered* — catalogued, detectable by monitors, and blockable
  by the matching upgrade. **Encourages surviving early and mastering later.**
- **"The Playbook" runbook artifact.** Surviving a named disaster — hurricane, breach, mass migration —
  unlocks a runbook that makes **that whole disaster class damage you less when it repeats**, because
  your staff have now done it. Institutional knowledge as an upgrade you can only earn by suffering.

### When does a counter unlock? — *CONFLICTING*

Both documents agree that getting hit teaches you things. They disagree on whether **being hit is the
*only* gate** on a counter, or merely the cheapest of several. The decision turns on whether the tech
tree is allowed to be legible in advance — and therefore on whether §9.6's "no optimal build order" or
§5.1's pain-gating wins when they collide.

#### Position A — pain-gating is the spine, with three priced paths out of it *(master)*

Strict "you cannot research a counter until you've been hit by the threat it counters" is the primary
engine, and the document explicitly names its four structural flaws: it collides with **no optimal
build order** (authored threat order ⇒ authored tech order); it **punishes competence** (the careful
player ends up with the smaller tree); it makes **new hosting lines unplayable** (no email scars ⇒ no
email defences at all); and on a second playthrough it converts the tree into **a checklist of damage
you must deliberately take.** The resolution is not to abandon pain-gating but to price the
alternatives: **every node carries all three acquisition paths** — **Scar** (free, fastest, steep
post-incident discount), **Foresight** (expensive: tabletop, chaos lab, load test, pre-mortem, the
Spike), **Testimony** (cheap but slow: the Reading Room, a competitor's postmortem, a hired engineer's
prior experience, a vendor advisory, a peer network) — reinforced by the **Anticipation Track**,
**seeded threat introduction order**, and the **Second Answer rule**. A careful player pays money and
time for what a careless player pays for in damage.

#### Position B — five competing gates, one of which is scars *(opencode)*

- **Scar-gated only (pain is the tutorial).** Many buildables never appear in the shop at all; they
  unlock when the problem they solve first hits you (first SQLi infection → the parameterized-query
  firewall appears; first thermal event → N+1 cooling; first cascade → bulkhead cells). **The tech tree
  *is* your scar tissue.** Counter-proposal riding the same bullet: some players will want research
  trees anyway, so offer a **parallel paid-R&D path for completionists.**
- **The threat drops its own blueprint.** The first time a threat class lands it drops the counter's
  blueprint (survive first SQLi → unlock WAF ruleset research). **Threats are the curriculum**, and the
  drop is an object rather than a state change.
- **News-gated research (pre-listed counters).** The CVE ticker and the radar make matching towers
  researchable *without* being hit first — **the catalogue is legible from the news cycle**, which is
  how the profession actually shops.
- **Purchasable / idle research (the RTS economy).** The Lab advances the tree while you defend; off-
  shift staff research speculative tech. **Counters exist before you ever meet their threat.**
- **Specimen-gated.** Neither the hit nor the news, but the **capture**: the attack your honeypot or
  capture-node caught is the thing that teaches its counter (the ransomware frost sample unlocks the
  cure research slot).

### The three acquisition paths (Scar / Foresight / Testimony)
**Every node has all three paths priced.** This is the clean resolution of the gating problem.

**How it works:**
- **Scar** — free, and the fastest. You got hit; the node opens at a steep post-incident discount.
- **Foresight** — expensive. Tabletop Exercise, Chaos Lab, Load Test, Pre-Mortem, or the Spike (§5.12).
  You pay cash and senior hands to *simulate* the incident and open the node at full price. §4.5 has
  all of these and never connects them to §5.1 as the structural counterweight they need to be.
- **Testimony** — cheap, slow. The Competitor's Postmortem, a hired engineer's prior experience
  (§5.4's Job Applicant Skills), a conference talk, a vendor advisory, the Vendor's Own RFO, a peer
  network, the Reading Room. **You learn from other people's scars.** This is the most true-to-life
  path — the real profession learns mostly from other people's outages; that is what conference talks,
  public postmortems, mailing lists and "did you see what happened to them" are *for* — and the
  document had all the pieces scattered across §5.4 without ever naming it as the answer.
**Why it works:** a careful player pays money and time for what a careless player pays for in damage.
The philosophy survives; the flaw does not. Testimony is also gated by *time rather than money*, which
gives quiet levels another thing to be for.

### Earn the right to be trusted (the CEO framing)
In a real hosting company you don't unlock things by researching them — you unlock them by **earning
the right to be trusted with them.**

**How it works:** Credit, credentials, certifications, allocations, references and reputation are the
real tech tree. A large fraction of unlocks should be gated by a *business* achievement or an
*external party's decision* rather than by a spend. See §5.9 for the full ladder and §5.10 for the
reputation gates. **A well-funded new entrant cannot buy their way to parity**, which is the truest
thing about this industry.

### Three unlock currencies, three feelings
Not one XP bar — three tracks that feel different and cannot substitute for each other.

**How it works:**
- **Insight** — earned from incidents you survive *and analyze*. Buys defensive and architectural tech.
- **Revenue Milestones** — earned from scale. Buys bigger, faster, more expensive things.
- **Relationships** — earned from customers, vendors, peers and researchers. Buys business lines,
  discounts, hero staff, and intel.
Three tracks means no single dominant strategy and three different reasons to be excited. It also
means a player starved on one axis still has somewhere to go.

### The Anticipation Track (unlocking by prediction, not only by suffering)
A parallel, smaller unlock path where you **bet on what's coming.**

**How it works:** Before each level you may place up to two **Preparation Tokens** on Codex entries you
have *not* been hit by. If that threat appears and you had the token on it, you unlock its counter at
**half cost** and the level scores a **"Called It"** bonus. If it doesn't appear, the token is spent
for nothing. The forecast (§7.9), the trade press (§9.3), vendor advisories (§5.4), the Rumor Board
(§5.4) and your own Coverage Grid holes all give you information to bet on. Tabletop Exercises (§4.5)
let you *convert* a token into a guaranteed partial unlock at a cash cost.
**Why it works:** it restores player agency to the tech tree, makes "reading the world" a rewarded
skill, and means two players' trees diverge from hour one rather than hour three. It is also exactly
what being a senior engineer is: **buying the thing before it bites you.**
**Interacts with:** §5.4 Tabletop and Blueprint Fragments (repurposed as partial Codex pre-fills),
§7.9 forecast, §9.3 trade press.

### Seeded threat introduction order
The *set* of early threats is fixed per level; the *order within a chapter* varies per run.

**How it works:** Two players starting the same campaign meet the same cast in a different sequence, so
their scar trees diverge immediately rather than converging on one authored path. Cheap to author,
and it is the minimum requirement for §9.6 to be true at all.

### The Second Answer rule (every threat has ≥2 counters at different prices)
**An authoring law:** no threat may have exactly one counter.

**How it works:** Each threat must have at least a **cheap partial** (fast, leaky, has a downside) and
an **expensive complete** (slow to get, real fix) — and ideally a **lateral** (change the *business*
rather than the infrastructure). Slowloris: raise timeouts (cheap, kills slow mobile users) /
event-driven proxy (expensive, correct) / put a CDN in front and stop caring (lateral). Toll fraud:
spend cap (cheap) / SBC + anomaly detection (expensive) / stop selling international dialling
(lateral). Backup restore failure: Restore Drill (cheap, recurring, gives confidence) / Immutable
pull-based vault (expensive, architectural, actually solves it) / Restore-as-a-Product (lateral: sell
verified restores at a premium, which funds the drills and turns your weakness into a revenue line).
**Why it works:** without this, the scar-driven tree is a lookup table. With it, every scar is a
*decision*, and the lateral answers are where the game's business half earns its place.
**Interacts with:** §5.2 — the entire scar table should be authored to this shape; §9.6 no optimal
build order.

### The lock-and-key fairness rule
**The one hard balance law:** a customer type never arrives that requires tech you cannot yet obtain,
and **a threat never appears before its counter is at least *discoverable*.**

**How it works:** The level's design target is always "**the player knows one answer but must pay for
it**" — never "the player has no answer." It is the floor under every gating mechanic in this section:
scar-gating, certification gates, era locks and prerequisite lattices may all make a counter
*expensive*, slow, or conditional, but none of them may make it *unreachable* at the moment the threat
lands.
**Interacts with:** the Second Answer rule above (which guarantees the second price point), §5.1's
three acquisition paths, §5.12's cadence spec.

### The Scar Tree
**The tech tree UI *is* your incident history.**

**How it works:** Nodes are greyed-out and *unnamed* until a matching incident occurs, at which point
the node lights up with the date and a one-line description of what happened to you. Getting hit by
something new adds its counter to your tree greyed with a red **"LEARNED THE HARD WAY"** stamp —
*damage is progression, and the stamp says so.* Each lit node also carries **the cost of the incident
that lit it**, and those aggregate into a single figure on the Company Museum wall: **"lifetime cost of
things we learned the hard way."** One number that quantifies the price of your own education is a
better emotional payload than any individual node's flavour text.
**Visual — the stamp spec:** a rubber-stamp impression in dark red, slightly **off-register**,
partially overlapping the node's box, with the date **hand-written into it in a different pen.** It
never lines up neatly. **The imperfection is the emotional content.** Hovering shows the one-line
incident description in the Doc typeface.
**Visual — shareability:** a one-key **export** renders the whiteboard as a clean photograph with your
company mark, the run's date range, and the scar count. **Your tech tree becomes a personal narrative
artifact**, and an enormously shareable one — so ship it *as* an artifact rather than only describing
it as one.
**Interacts with:** §5.8's Whiteboard-at-Scale and Marker Colour Code (without which a 300-node tree
on a whiteboard is unreadable by Tier 4).

**Variations and additions**

- **Scar Unlocks light specific edges.** Beyond the node stamp: a *specific* loss lights a *specific*
  tree edge — a ransomware hit makes the "automated backups" branch glow, with **a tiny scar icon on
  the node itself.** The tree grows out of your defeat history, and **save files have visibly
  different-looking trees because of it** — which is the strongest argument for making the tree a
  screenshot artifact.
- **The victory tree (the other half of the same idea).** Wins should leave **polish marks**: your
  most-used counters earn cosmetic tier-ups and your map shows where they held. If defeats are the only
  thing that shape the board's appearance, a clean run looks like an empty one — save-file trees should
  differ by triumphs too, not only by scars.

### Postmortem → Prevention, and Unlock Drafts (pick one of three)
Each incident offers a concrete prevention purchase afterward, at a discount, while the pain is fresh —
but it offers **three**, and you take one.

**How it works:** Mechanizes "we'll fix it after the outage" institutional behaviour — and makes it
actually happen. The two you don't take remain in the tree at full price and are **visibly marked as
things you passed on.** Over a campaign the tree accumulates a legible history of the roads you didn't
take. One offer is a formality; three-choose-one is the single most reliable way to create build
identity, and the "passed on" marks are free narrative.
**Interacts with:** §5.8 whiteboard presentation (crossed-out nodes), §6.9 postmortem screen, the
Second Answer rule (the three offers should be the cheap/expensive/lateral triad).

**Variations and additions**

- **Postmortem tokens (a spendable currency, not a single offer).** Every failure earns a **Postmortem
  token**; tokens are spent across hardening upgrades — runbooks, the chaos monkey, blameless-culture
  morale buffs — so a run of bad luck accumulates into a deliberate hardening project rather than three
  disconnected discounts.
- **Pick ONE lesson to institutionalize.** The leaner framing of the draft: finish an incident, win or
  lose, and the postmortem screen asks you to **institutionalize exactly one lesson**, which unlocks
  the matching upgrade or reaction. **Your build list literally grows from your scars**, and the rule
  "no blame" is itself one of the selectable lessons (with a morale unlock instead of a technical one).
- **The Tech-Debt Fork.** Completing the postmortem awards the point that opens the **"action items"
  branch** — the fix you promised in the writeup becomes a buildable. **Skipping the postmortem gives
  you immediate cash and stalls the tree**, which is the most honest tradeoff in the section.
- **Root-cause tagging as grading.** The postmortem screen asks you to *tag* the root cause; correct
  tagging yields **bonus research plus an "institutional knowledge" buff** that auto-detects repeat
  same-cause incidents. The game is literally grading your learning, and the buff is what a real
  organisation gets from an accurate writeup.
- **Publishing converts tokens to reputation.** A blameless postmortem you publish pays out in the
  reputation currency as well as the research one — the tuition you paid becomes marketing.

### The Postmortem minigame
A small interactive screen where you pick the root cause from evidence.

**How it works:** Getting it right unlocks the *specific counter* to that incident type. A wrong answer
unlocks a partial or incorrect mitigation, which is realistic and funny — and leaves you with a
mitigation that mostly works, which is the most authentic possible outcome.

### Symptom → Hypothesis → Tool
**You can't buy a tool you don't know you need.**

**How it works:** Seeing unexplained latency three times unlocks the *option to purchase* profiling.
Repeated customer complaints about the same thing unlock the feature that fixes it — three "checkout is
slow" tickets unlocks the profiling tool for the checkout path.

### Teach through loss, never through text (and the Near-Miss clause)
A design guardrail that falls out of the above: **the game should have almost no tutorial pop-ups.**

**How it works:** Every tutorial concept in this document is delivered by an event that hurts a little
and then unlocks its own counter.
**The Near-Miss clause:** some lessons are too expensive to teach by loss (total data loss, processor
termination, regulatory shutdown). Those are taught by a **near miss first** — the restore fails on a
non-critical dataset before it fails on a critical one; the chargeback ratio spikes to 0.9% before it
crosses 1%; the generator starts on the third try before it doesn't start at all. The player gets the
fright *and* the unlock, and the catastrophic version is reserved for the player who ignored the
warning. This is also simply how careers work.
**Interacts with:** §5.12's Discovery by Incident Adjacency (near misses pay Intel too).

### Discovery, not just purchase
Some things aren't on a menu — you *find* them.

**How it works:** Hover over an unexplained log line; investigate; discover a technique. A small "hmm,
what's this?" loop with an **investigate** action makes the tech tree feel **excavated rather than
shopped.** Roughly a fifth of the tree should be unreachable by any amount of money and reachable only
by paying attention.

**Variations and additions**

- **Hidden Buildables — discovered, never researched.** A small set of items appear on no tree at all
  and are triggered by play history: the **tarpit** appears only after ten DDoS waves survived; the
  **cat** appears after the rat incident; the **rubber duck** appears after three post-mortems (a real
  support tool, and a pure humour unlock). They cost nothing to author and they are the clearest
  possible proof that the game is watching what you actually did.

### The unlock trigger taxonomy
A stated list of the *kinds* of trigger, so the design can audit its own coverage.

**How it works:** **Survive-It** (survive your first amplification attack → *Response Rate Limiting* +
*BCP38 Egress Filter*; survive a rebuild storm → *Hot Spares* + *Erasure Coding*). **Fail-It, the scar
path** (lose a level to a generator that wouldn't start → *Monthly Load Test* permanently, plus a wry
line added to the tooltip). **Autopsy** (spend time on a post-mortem to convert the incident into a
permanent unlock; skipping it gets you back to revenue faster — a recurring, meaningful tradeoff).
**Volume** (host 100 accounts → *Reseller Panel*; push 1 Gbps → *Peering Eligibility*; store 1 PB →
*Erasure Coding*). **Relationship** (keep a whale happy for 12 months → they introduce you to another
whale; treat a bug-bounty hunter well → recurring ally). **Intel** (honeypots and sinkholes generate
Intel, spent in a research tree to fingerprint attackers, pre-empt waves, or sell threat feeds as a
product). **Hire** (a network engineer unlocks BGP entirely; a compliance officer unlocks the regulated
branch — **staff are keys, not just labor**). **Certification** (passing an audit unlocks a client
segment and a price tier). **Acquisition** (absorbing a competitor gives you their tech, their
customers, *and* their technical debt). **Geography** (entering a new region unlocks region-specific
tech: free cooling in the north, solar in the desert, hydro power, a subsea cable landing).
**Era** (time advances; new tech appears and old tech becomes unsupported — forced modernization
pressure). **Inspection** (opening a rack you inherited reveals what's in it; running a trace reveals
the real path; a floor walk reveals the propped-open door — **rewards curiosity directly**).

---
## 5.2 Scar-driven unlocks (pain → capability)

*A concrete table of pain → capability. Each is a small, memorable lesson with a mechanical payoff.
**Authoring note:** every row below should ultimately be expressed in the Second Answer shape (§5.1) —
a cheap partial, an expensive complete, and where possible a lateral business answer — because as
written a row is `pain → one specific building`, which makes the table a lookup rather than a decision
set. The rows are listed here by their trigger; the triad is the implementation.*

### Certificate expiry ladder
**Expires once** → the Certificate Expiry Dashboard unlocks. **Expires twice** → ACME automation
unlocks. **An internal PKI expiry** (a client cert, a keystore, an internal CA) → the **Certificate
Inventory** scan (§5.4).

**How it works:** The game literally rewards you for the mistake, which is exactly how careers work.
The ladder shape — dashboard first, automation only on the repeat — is the template for every scar
with an obvious "just automate it" answer: you must demonstrate you'll keep making the mistake.
**Hosting types:** universal; brutal on email, CDN and any TLS-terminating line.

### First "everything is green but customers are down"
→ unlocks **Synthetic Transaction Monitoring**, and (the gray-failure sibling) **percentile alerting.**

**How it works:** The dashboard's own credibility is the thing that broke. This is the unlock that
teaches the player to stop trusting the green square, which is the single most transferable lesson in
operations.

### First backup restore failure — *and the earlier, kinder trigger*
→ unlocks the **Restore Drill** action and the "Verified Backup" badge.

**How it works:** Until then, backups show a checkmark and the player has no reason to doubt it.
**Better trigger (recommended):** the drill should *also* be unlockable **the first time a customer
asks you what your RTO is and you don't know** — which is a sales event, not a disaster. That's a
nicer progression (the business teaches ops something, for once) and it's true: most companies start
testing restores because a prospect asked, not because they lost data. Keep both triggers; whichever
fires first opens the node.
**Second Answer triad:** Restore Drill (cheap, recurring, gives confidence) / Immutable pull-based
vault (expensive, architectural, actually solves it) / **Restore-as-a-Product** (lateral — sell
verified restores at a premium, which funds the drills).
**Interacts with:** §5.12's Sealed Capability — an undrilled restore path is a hollow icon with zero
benefit.

### First Slowloris
→ unlocks the **event-driven reverse proxy.**

**How it works:** The player literally cannot buy the counter before they've met the attack that
requires it, which makes the purchase *mean* something. Triad: raise timeouts (cheap, kills slow mobile
users) / event-driven proxy (expensive, correct) / front it with a CDN and stop caring (lateral).

### First OOM kill of the database
→ unlocks memory limits, `oom_score_adj`, and the swap-tuning panel.

### First cache stampede
→ unlocks **request coalescing** and **stale-while-revalidate.**

**How it works:** The lesson that a cache miss is not a small event when ten thousand of them arrive
at once. Especially sharp on CDN, web and API-hosting levels.

### First correlated batch drive failure
→ unlocks the **Mixed-Vendor Procurement** policy (costs more per drive, removes correlated failure). A
*policy* unlock, not a building — one of the few, and it should feel different in the UI for that.

### First rebuild failure during a degraded RAID
→ unlocks **RAID6**, **hot spares**, and **batch diversity.**

**How it works:** The second-disk-dies-during-rebuild scar; the counter is the one nobody buys until
they've watched a 14-hour rebuild bar and lost.

### First breach
→ unlocks the entire **Forensics branch**: log retention, file-integrity monitoring, an immutable audit
trail, and the timeline-reconstruction minigame. Plus **Segmentation**, **Immutable Rebuild**, Incident
Response Plan and Cyber Insurance, and a permanent **"we've been through it" trust modifier with
enterprise buyers** (real: buyers trust operators who've been tested).

### First blocklist listing
→ unlocks Outbound Mail Monitoring, per-account send rate limits, **outbound rate limiting**,
**dedicated IP pools / IP segregation**, the Delisting Request action, and **IP Reputation as a visible
stat.**
**Hosting types:** email obviously, but also shared hosting and VPS (your tenants' outbound is your
reputation) and any line with a customer-facing SMTP relay.

**Variations and additions**

- **Abuse-driven discovery.** The same scar read from the outbound side: getting **spammed hard** —
  by your own tenants or through your own relay — unlocks the **DMARC / RBL management toolkit**, which
  is the piece most operators only ever build the week after they need it.

### First alert-fatigue-induced miss
→ unlocks Alert Tuning, dependency-aware suppression, and severity tiers.

### First bad fleet-wide config run
→ unlocks canary deploys and `--limit`.

### First time a firewall rule locked you out of your own estate
→ unlocks **commit-confirm** — a config change that automatically reverts in ten minutes unless you
confirm it.

**How it works:** A real network-engineering feature and a *wonderful* game verb: every risky change
afterwards has a visible countdown over it that you must go and cancel. It turns "am I sure?" into a
timer on the board.

### First split-brain
→ unlocks quorum/witness nodes and fencing (STONITH), with flavour text explaining the name.

### First BGP incident
→ unlocks RPKI/ROA signing and prefix filters.

### First BGP dampening event
→ unlocks **"administratively shut a flapping session"** as a first-response action.

**How it works:** Teaches that the network sometimes punishes you for being *intermittently* up, and
that the correct move is to make yourself decisively down.

### First health-check flap cascade
→ unlocks slow-start, connection draining, and outlier ejection.

### First retry storm you caused yourself
→ unlocks **jitter and exponential backoff.**

**How it works:** The purest "we were our own DDoS" lesson. The counter is three lines of config and
the scar is a full outage, which is the correct ratio.

### First time you lost a whole rack to a single PDU
→ unlocks **A/B feed auditing** and the **power-path visualizer**, which draws every device's two feeds
and highlights the ones that secretly share.

### First gray failure discovered the hard way
→ unlocks **synthetic monitoring** and **percentile alerting**, and (downstream) distributed tracing
and error budgets.

### First unidirectional link failure
→ unlocks link-verification protocols and the "is-it-bidirectional" check.

### First microburst-caused drop with a flat graph
→ unlocks fine-grained interface telemetry and the **telemetry resolution dial.**

**How it works:** The dial is the decision: higher resolution costs storage and money, and the graph
you were looking at was averaging your outage away.

### First thin-pool exhaustion
→ unlocks storage reservation policies and pool-level alerting. The overcommit lesson, in storage form.

### First "nothing changed" incident
→ unlocks the **Growth Ceiling** overlay (§5.4).

**How it works:** The incident where change-correlation returns nothing is the one that teaches you
there are two kinds of failure, and knowing which one you're in is the skill.

### First time your alerting path was down with the service
→ unlocks **out-of-band alerting.**

### First time you needed a switch config you didn't have
→ unlocks **network config backup** (and the realisation that your backup system covered servers only).

### First incident where three engineers duplicated each other's work
→ unlocks **Incident Command**: roles, a commander, a scribe, and a single comms channel.

### First RFO demanded by a customer
→ unlocks structured timeline capture and the evidence system.

### First time a customer's pentest found something you didn't
→ unlocks the **Bug Bounty** node early, and the Customer's Pentest Report as a recurring discovery
source (§5.4).

### First break-glass need
→ unlocks the break-glass safe — and, brutally, only *after* the level where you needed it.

### First counterfeit / grey-market part failure
→ unlocks a **procurement provenance policy** (costs more per unit, guarantees the supply chain).

**Variations and additions**

- **The Firmware/BMC Supply-Chain Trapline.** The slower, nastier sibling: install too many
  "too good to be true" cheap boards and a **BMC backdoor** is eventually discovered in your own
  estate. It teaches provenance the hard way and unlocks the **hardware-audit** buildable — and unlike
  a dead part, the discovery is of something that has been working perfectly for months.

### First decommission that broke something
→ unlocks the **Scream Test** (§5.4) as a usable verb.

### First warranty-expiry incident
→ unlocks the support-contract planning view with expiry dates across the whole fleet.

### First DR declaration you could not honour
→ unlocks the **DR oversubscription model** and priority tiering — the discovery that you sold the same
failover capacity to nine customers, and a scar to go with it.
**Hosting types:** backup/DR above all; also colo (generator capacity) and any line selling a failover
promise.

### First time the lab became production
→ unlocks environment tagging and a hard `production` flag that changes what actions are permitted.

### First chargeback
→ unlocks **Fraud Screening**; the first *wave* unlocks fraud scoring tiers; a sustained spike unlocks
**rolling-reserve preparedness** (standing up a second acquirer before you need one).

**Variations and additions**

- **The Chargeback Threshold Lesson.** The sharper version of the same trigger: the first time fraud
  losses cross the line, **the merchant account locks**, and the fraud-screening tree opens with a
  scarred tutorial attached. **You learn by getting robbed** — as in life — and the lesson arrives
  attached to a revenue outage rather than to a fee.

### First key employee quits
→ unlocks **Documentation as a first-class buildable** and the Offboarding Checklist (which
retroactively prevents the Ex-Employee threat), plus **On-Call Rotation tuning.**

### First traffic spike survived
→ Caching branch opened. (At 1M requests in one shift: **Cache Layer** *and* the **CDN business line**.)

### First DB built
→ SQL injection is introduced to the bestiary **and** WAF becomes purchasable.

### First hardware failure
→ RAID and spare-parts inventory.

### First customer churn
→ Exit Interview and Save Offer.

**Variations and additions**

- **The Exit Interview as a vignette.** Make the unlock a *scene*: when a big customer churns you get
  a **phone-call vignette** in which they explain, plainly, exactly which mechanic drove them out.
  Educational, emotionally effective, and far more useful than a churn-reason dropdown.

### First low-and-slow attack detected
→ Anomaly Detection branch.

### First chaos test run
→ Resilience scoring and the "Confidence" stat become visible.

### First abuse complaint received
→ Trust & Safety team becomes hireable. **First upstream warning email** → the **Abuse Ladder** is
revealed as a system (warning → suspension → null-route → de-peering), which most players do not know
exists until it is pointed at them.

### First refund demanded
→ unlocks the Refund Policy setting.

### First outage with customers on it
→ unlocks the **Status Page** and the concept of an SLA.

**Variations and additions**

- **The status page as an unlock the player resists.** Publishing your uptime publicly *feels* risky,
  and players hesitate — which is the point. After first adoption, a **"trust aura"** raises conversion
  and retention, because customers really do check status pages before they buy. Mechanically the
  unlock exists to teach the player a real-world norm they would not have chosen on their own.

### First SLA credit paid
→ unlocks the SLA Reserve and the ability to *write your own SLA terms* (the contract-tier editor).

**Variations and additions**

- **"Say It in Writing" → the SLA Engine.** After the first *unpaid* SLA dispute — where you and the
  customer disagree about what you owed — you unlock **structured SLA authoring**: availability
  percentages, credit ladders, carve-outs (force majeure, scheduled maintenance windows), and
  exclusions for customer-caused load. The engine converts marketing copy into **contract objects with
  risk parameters**, which is what an SLA actually is.

### First churn survey response
→ unlocks the Save Offer.

### First customer who came from another customer
→ unlocks the Referral Program.

### First enterprise prospect
→ unlocks the **Security Questionnaire minigame**, which unlocks the Compliance Vault research line.
**First deal lost to a security questionnaire** → unlocks the **Trust Center** (a public page of your
controls that pre-answers the questionnaire).

### First month where support cost > 30% of revenue
→ unlocks **Cost-to-Serve analytics per customer.** Suddenly you can *see* your Support Vampires, and
it changes everything.

### First cash crunch
→ unlocks the Cash Forecast view.

### First annual prepay
→ unlocks Deferred Revenue tracking (and the unsettling realization that the cash is not yours yet).

### First employee / first employee quitting
→ unlocks Payroll and the org chart / unlocks Runbooks and Documentation.

### First acquisition offer received / first acquisition made
→ unlocks the Valuation view / the Migration Toolkit and Integration Playbook.

### Lose a whale
→ unlocks Concentration Risk alerts and the Diversification objective.

### Running out of IPv4
→ unlocks **IPv6** and **CGNAT**, each with distinct downsides (IPv6: a long tail of customers who
can't reach you; CGNAT: shared-reputation problems and a support burden).

**Variations and additions**

- **IPv6 and immutable infrastructure as late-game paradigm unlocks.** IPv6 is not only a bigger
  address pool — it is **scarce-address pressure replaced by a doubled attack surface**, because
  dual-stack means every service is now reachable two ways and you must defend both. Its natural
  partner is **immutable infrastructure**, which turns rebuild-after-breach from an agonizing minigame
  into a one-button mass replace — **the reward for having *wanted* it all campaign** rather than a
  node you can simply buy in act one.

### Overheating a rack
→ unlocks the **Thermal Modeling** overlay — an *information* upgrade rather than a building, which is
a category the tree should use more.

### Surviving a full power outage on generator
→ unlocks the **Fuel Contract** and **2N** designs. Running a generator load test three times unlocks
the **Tier III facility rating**, which in turn unlocks enterprise customers.

### A customer's ransomware event
→ unlocks the **Immutable / Air-Gapped Backup line of business.** Turn your trauma into a product —
extremely true to life, and the cleanest example of a lateral answer in the game.

### Firing an abusive customer
→ unlocks **AUP Enforcement** and the Abuse Desk. **Accepting a bad customer and surviving** →
unlocks **Risk Pricing** (charge more for danger), which is the gateway to the Bulletproof line.

### Handling a security Researcher well
→ unlocks **Bug Bounty**, a permanent passive that pre-telegraphs one exploit class per level.

### Winning a bidding war against The Competitor
→ unlocks intel on their board: you can see part of what they've built.

### Completing a no-downtime migration
→ unlocks **Live Migration** as an ability usable in all future levels. **A verb unlock, not a number
unlock — always better**, and the design should bias toward verbs at every opportunity.

### Passing an audit
→ unlocks the **Regulated Hosting** business line plus a certification badge that raises Evaluator
conversion.

### Peering at an IX
→ unlocks **Anycast** and the world-map layer.

### Business scars (the commercial half of the table)
**The business tree should be almost entirely scar-driven** — more so than the infrastructure tree,
because nobody builds a dunning engine or a deal desk speculatively. You build it the month after it
cost you.

**How it works:**
- First **unbilled service** discovered → **Revenue Assurance** (an audit that finds what you're
  running and not charging for).
- First **discount you couldn't undo** → **Deal Desk** and discount authority levels.
- First **MFN surprise** (a most-favoured-nation clause you forgot you signed) → **Contract Clause
  Library.**
- First customer who **refused to consent to assignment** during an acquisition → the assignment clause.
- First month you **couldn't close the books** → Accounting / FP&A.
- First **install-date penalty** → the Backlog Board.
- First **stranded capacity** → the Yield Manager.
- First **agent who moved their book** to a competitor → residual commission terms and agent
  relationship management.
- First **price increase that churned 9%** → grandfathering policy plus notice-period discipline.
- First customer who was **40% of revenue and left** → Concentration alarm plus the diversification
  objective (the alarm exists in §3.8; tie it to this scar so it is *earned*).
- First time you **had cash but no bank account that would take it** → Entity and Ring-Fence.
- First **demand-charge ratchet** on the power bill → peak shaving.
- First **competitor who stole a customer with a free migration** → the Free Migration weapon becomes
  yours to use.
- First **acquisition that lost 30% of customers in transit** → Migration Attrition modelling.

### Failure-Only Nodes
A handful of powerful techs that can *only* be unlocked by suffering a catastrophic loss.

**How it works:** Total data loss unlocks the elite backup branch; bankruptcy unlocks the
financial-discipline branch on your next run. **Rewards for failing in an interesting way.** Losing
data with no good backup also plants a permanent, visible **memorial entry in your company history** —
because shame is a great teacher, and because a memoir needs its worst chapter.
**⚔️ Tension:** these collide with the Near-Miss clause (§5.1), which says catastrophic lessons should
be rehearsed before they land. Resolution: the near miss fires first *and* the Failure-Only node stays
locked — the player who heeded the warning never gets the node and never needs it, and the player who
didn't gets both the catastrophe and the elite branch. Keep both.

---
## 5.3 Milestone unlocks

### The milestone law (the threshold is the consequence, not the count)
**A milestone unlock fires at the exact point the old method visibly stops working** — and the game
lets the player *feel the strain for 60–90 seconds first.*

**How it works:** "50 customers → provisioning automation" is weaker than "the level in which manual
provisioning first causes you to miss an SLA on a new signup unlocks provisioning automation." The
count is the setup; the broken promise is the trigger. Manual provisioning should become **unbearable**
before automation arrives. That 90 seconds of friction is the difference between an unlock and a gift,
and restating every milestone in this form makes §5.3 an extension of §5.1 rather than a parallel
system.
**Interacts with:** §5.1 scar-driven progression, §1.7 pacing.

### Scale milestones (infrastructure)
Capability unlocked by reaching a size where the old way visibly stops working.

**How it works:** **10 customers** → ticketing system, basic billing (before that, support is just you,
one at a time). **50 customers** → provisioning automation. **100 customers** → an abuse desk as a
distinct queue (you now have enough customers that some of them are bad), **Cohort Analytics** so you
can finally see churn as a curve, and the **Automation tier** (policies that act without you).
**1,000 customers** → the **Self-Service Portal**, which cuts ticket volume 40% *and introduces a new
attack surface* (the portal itself). **Hire a 5th employee** → on-call rotation, HR and morale systems
turn on. **Serve 10,000 visitors in one level** → CDN vendors start calling you. **Your own /24 + ASN**
→ BGP, multihoming, peering branch. **First BGP announcement** → Anycast branch, and the BGP Leak
threat. **Second facility** → replication topology, GSLB, and the quorum problem. **Operate 2 sites**
→ replication, failover, and the split-brain threat. **First petabyte stored** → tiered storage,
dedupe, and the archive/restore-cost tradeoff. **First enterprise contract** → SLA engine, account
management, change-control board. **Own the building** → the entire facility branch. **Serve a customer
in the EU** → the GDPR/DPA branch and regional data residency. **Reach 99.99% for 12 months** → the
Premium SLA product tier and the ability to charge for it. **First 30 days at 100% uptime** → the Speed
Badge and premium pricing tier.

**Variations and additions**

- **Scale-gated trees (the general rule behind the table).** Many nodes require you to have reached
  scale N before they can be *researched at all* — **you cannot research multi-DC traffic engineering
  with one rack.** Stated as a law rather than a list, it makes discovery follow growth naturally and
  removes the need to hand-author a gate per node.
- **Scale-triggered unlocks, stated as the moment hand-management dies.** Crossing 1,000 customers
  unlocks autoscaling *and* the control panel, because you can no longer hand-manage anything.
- **Tier gates on the network side.** Reaching multi-rack unlocks the networking ladder in order:
  managed switch → BGP → anycast. The facility's shape gates the network's shape.

### Operational-threshold milestones (the numbers that change how the job *feels*)
The counts at which the job stops being one thing and becomes another.

**How it works:**
- **Second person** → you can no longer keep state in one head. Unlocks naming conventions and a shared
  inbox. **The first genuinely organizational unlock**, and it should feel like a bigger deal than the
  fifth server.
- **~50 machines** → manual patching stops working. This is the real number at which config management
  becomes mandatory rather than nice.
- **~150 machines** → hardware failures become a **weekly routine** rather than an event, which changes
  their emotional register entirely. Unlocks the spares pipeline and the RMA system, and the game's
  own alert styling for a dead disk should get quieter at this point.
- **Two timezones of staff** → handover becomes a system; the shift-handoff mechanic turns on in
  single-player.
- **First time you are someone else's upstream** → your outage is now on *their* status page, and you
  inherit an obligation to communicate to people who are not your customers.
- **Two racks with different power feeds** → the power-path model turns on and A/B becomes a thing you
  can get wrong.

### Commercial-threshold milestones
The business milestones are as load-bearing as the infrastructure ones and are usually missing.

**How it works:**
- **First customer who asks for an invoice instead of paying by card** → invoicing, net terms, AR.
- **First customer who sends you a contract instead of clicking your terms** → the MSA and Quote Desk.
- **$10k MRR** → you can afford a part-time bookkeeper, which unlocks everything financial downstream.
- **First international customer** → currency, tax, and the nexus monitor.
- **First customer above 10% of revenue** → the Concentration alarm.
- **First renewal cohort** (12 months after your first annual sale) → the Renewal Calendar and cohort
  retention. **A mechanic gated on elapsed in-fiction time rather than on achievement** — rare, and
  exactly appropriate here, because cohort retention *cannot* exist before you have a year of history.
- **First month where a line's gross margin is computable** → the per-line P&L.
- **First customer who pays more than $1,000/mo** → the account-management motion and the realisation
  that one customer can now ruin a quarter.

### Invisible-save milestones (the achievements nobody else can see)
Moments that should feel big precisely because no customer will ever notice them.

**How it works:** **First time you survive an incident with zero customer-visible impact** → unlocks
the "invisible save" achievement track and a reputation bonus you cannot show anyone. **First
successful failover that nobody noticed.** **First tested restore from an air-gapped copy.** **First
100% month on your SLA.** **First time you say no to a customer for the right reason** (evicting an
abuser at revenue cost). **Getting your own ASN + /24** — you are now *on* the internet, not merely
attached to it. **Opening a second facility.** **Hiring someone who is better at your job than you
are** (unlocks delegation and permanently reduces your own personal action-point cost). **The first
postmortem you publish publicly.** **Retiring the last machine from your original generation of
hardware** — the end of an era, rendered as an actual retirement ceremony (§5.8).
**Why it works:** the game's reward system otherwise only pays out for things customers see, which
teaches exactly the wrong lesson about operations.

### Event unlocks (the first-time-it-happened table)
Milestones that fire on **an event occurring**, not on a count being reached — including good events,
which the scar table by definition cannot cover.

**How it works:** **First HTTPS customer** → certificate automation (a Let's-Encrypt analog: free
certs, 90-day bombs, ACME rate limits). **First regional outage — yours *or* a competitor's on the
news** → the multi-site branch and Anycast. **Breach survival** → the SIEM/EDR line; and being breached
while uninstrumented **locks you out of some of the learnings** with a "the logs were gone" debuff,
which is the cruellest and truest unlock rule in the section. **Own ASN + RPKI at scale** → the BGP
branch, so route leaks become defendable — and hijack waves begin. **Meeting an SLA threshold for a
season** → carrier relationships and cheaper lanes. **Surviving a DDoS** → the scrubbing-vendor
partnership.
**Why it works:** it gives the game a second trigger vocabulary beside pain and counting, and it is
where positive reinforcement lives.

**Variations and additions**

- **"Unknown Unknowns" Event Cards.** Random events whose whole function is to **name a thing you
  didn't build**: a competitor announces GPU cloud, a customer asks for IPv6-only, a carrier adds a
  DCV tax. Each card teaches, and some unlock the corresponding node. The cheapest way to make the
  world feel like it is moving without you.
**Interacts with:** §5.2 (the scar table's positive-event rows), §5.1's unlock trigger taxonomy.

---
## 5.4 Discovery mechanics

### The Threat Codex / Bestiary (fill-in-the-blank)
Every threat starts as a **black silhouette card with ??? fields.**

**How it works:** Entries upgrade in stages: **Seen** (icon only) → **Analyzed** (behaviour visible) →
**Countered** (weak point shown) → **Mastered** (auto-flagged by your systems). Surviving an encounter
fills in the silhouette; analyzing logs fills in its stats; countering it three times reveals its weak
point highlighted in green on the card art. Each entry also records the date you first met it and how
much it has cost you lifetime — **a trophy case of trauma.** Repeated exposure becomes permanent
quality-of-life, and **tooltips grow richer as Codex knowledge improves** ("Some kind of bot" → full
behaviour, weakness, and expected damage). **The single best art showcase in the game, and it earns
itself.**

**Make it actionable, not just a museum.** Each entry additionally carries: **(a)** your **personal
record** against it — encounters / blocked / landed / mean time to detect / best response time — so you
can see which threats you are actually bad at, with numbers that make you want to improve them;
**(b)** a **"what stopped it last time"** line, which is the single most useful thing an on-call
engineer wants; **(c)** a **lifetime cost-to-date** figure; **(d)** a **filter that shows only the
threats your current build invites**, which turns the Codex from a museum into a **pre-level briefing
tool**; **(e)** a **Tell Trainer** on each Mimic-family entry, a practice mode for spotting the
giveaway. This is the best candidate in the whole document for "the screen players will actually spend
time in outside of play," and it should be built for that.

**Visual — the Codex Card, specified.** A specimen card in a consistent frame, with **five states that
are visibly different as physical artifacts**:
- *Unseen* — a blacked-out silhouette on grey stock with `???` fields.
- *Seen* — the silhouette filled but flat; one field filled (date first encountered).
- *Analyzed* — the specimen rendered properly, **pinned under glass like an entomology mount**,
  behaviour fields filled, motion described by a small looping animation in the corner.
- *Countered* — a green weak-point highlight drawn onto the art, and a counter-item icon clipped to
  the card.
- *Mastered* — the card gains a **letterpress-embossed border** and the lifetime-cost figure is stamped
  across the bottom in red.
**The card becomes a better object as you learn**, so the Codex is itself a physical progress bar.
**Interacts with:** Progressive Icon Disclosure (below), §5.1's Anticipation Track (you bet on Codex
entries), §8.8's growing tooltips.

**Variations and additions**

- **First Blood as the fill trigger.** Each threat type gets exactly one **unannounced ambush**
  appearance; surviving it is what converts the silhouette into a catalogue entry, after which your
  monitors can see it and the matching upgrade can block it.
- **Every entry pays a perk (the Incident Library / Monster Compendium).** Completing an entry grants a
  **small permanent bonus against that class** — 1% detection, say — so completionism has real
  mechanical payoff rather than being a scrapbook. At the far end, **after N incidents of a class your
  staff gain a permanent intuition**: that failure now always announces itself thirty seconds early,
  which is exactly what experience feels like.
- **The War Stories codex.** Every first-time incident defeated writes an entry containing three
  things: the real counter, a joke, and **the "correct answer" from the ops world** — real-world
  postmortem wisdom, attributed. The completionism loop doubles as the education layer, and it is where
  the game can be genuinely useful to a working engineer.
- **Port-Scan Fog of War (the unseen state, visualized).** Unknown threat types render on the board as
  **"?" glitch blobs**; the first encounter auto-unlocks the bestiary card with a hand-drawn portrait,
  and **the threat becomes fully drawn the instant it is understood** — i.e. the moment a firewall or
  IDS can counter it. Comprehension and rendering fidelity are the same variable.
- **The codex mugshot wall.** The physical form of the same screen: entries pin to a corkboard as
  **polaroids, red-stringed to their counters** once learned; a threat you have never met is a blank
  card with a "?" stamp. Dark-forest discovery, made tactile.

### Progressive Icon Disclosure
Your growing literacy should be visible **in the world**, not only in a menu.

**How it looks:** A threat's board glyph gains detail with Codex level. At *Seen* it is an
undifferentiated violet blob; at *Analyzed* it is the family silhouette; at *Countered* it carries its
class marking; at *Mastered* it carries a small tag showing the counter that handles it. **A veteran's
board genuinely looks different from a novice's** — and that is the whole point, because the altitudes
where players actually play are the altitudes where the growth needs to be legible.
**Interacts with:** §8.8 growing tooltips (text) — the two together make the UI itself a progression
system.

### Asset Discovery Scan / The Audit Sweep
Run a network scan of *your own* estate; spend staff-hours to find out what you actually have.

**How it works:** You find three servers nobody knew were still running, a test VM with a public IP and
no firewall, an old staging database with a copy of production customer data, a switch with default
credentials, undocumented cables, expired things, and forgotten customers. **Discovering your own
infrastructure is a real, humbling, recurring exercise.** Available any time, repeatable, always worth
doing, and **it should always find something embarrassing.**

### The Discovery Ledger (making the scan a recurring, positive action)
Turning the Asset Discovery Scan from a one-shot reveal into a reliable low-stakes thing to do in a
quiet minute.

**How it works:** A cheap, repeatable action with an authored result table: **40%** you find a
forgotten machine (free capacity, unknown patch level); **25%** an exposure (free surface reduction);
**20%** an undocumented dependency (free fog removal); **10%** a cost you forgot you were paying (free
money); **5%** something genuinely strange (a narrative hook). Results are logged in a ledger you can
scroll, which accumulates into a comic history of your own negligence.
**Why it works:** peacetime needs a reliable, positive, low-stakes thing to do more than it needs
anything else, and this mirrors the real experience of running infrastructure more accurately than
almost anything in the design.
**Interacts with:** §7.6 fog, §5.12 peacetime economy.

### The External Attack Surface Scan
The sibling of the Asset Discovery Scan, run from **outside** instead of inside.

**How it works:** It finds what the internet can see of you: a forgotten subdomain, a dev environment
on a public IP, a management interface exposed by a firewall rule added during an incident in 2021, an
object-storage bucket, a service on a high port nobody remembers, and a certificate-transparency log
entry revealing a hostname you thought was private. **"What does the internet see when it looks at me"
is a different and more alarming question than "what do I own."** §9.2's *You Are the Attacker's Target
Board* twist is exactly this idea — promote it from a one-time twist to a purchasable, repeatable tool.
**Hosting types:** universal; devastating on bulletproof and regulated levels where exposure has legal
weight.

### Certificate Inventory Discovery
A scan that finds every certificate in your estate, including the ones you forgot.

**How it works:** Internal CAs, client certs, keystores, load-balancer configs, an expired cert on a
decommissioned host still referenced in DNS. Unlocked by the first *internal* PKI outage. **Its first
run should always find something frightening.**

### Growth Ceiling Discovery
Converting a category of invisible future failures into a visible calendar.

**How it works:** Unlocked after a **Threshold Day** incident (the outage where nothing changed).
Afterwards, every component displays its **nearest hard limit** — table sizes, counter widths, port
counts, licence counts, address space, inode counts, TCAM entries — and a **projected date of
arrival.** The natural late-game partner to the Capacity Forecast below, and the answer to "we didn't
change anything."

### Change Correlation ("What changed?")
An overlay, not a graph: the incident timeline with **every change anyone made** laid over it.

**How it works:** Your deploys, your config pushes, a customer's DNS edit, a vendor's firmware
auto-update, a certificate that rotated, a cron that fired for the first time this year, a traffic
threshold that was crossed. Unlocked after an incident whose cause was a change nobody remembered.
**The real teaching moment is the cases where the answer is "nothing changed"** — which sends the
player to the Growth Ceiling overlay instead. **Two diagnostic modes, and knowing which one you're in
is the skill.**

### The Scream Test (an unlockable verb)
The game's only tool that discovers dependencies by **destroying availability on purpose.**

**How it works:** Unlocks after the player's first Undocumented Dependency incident. Three tiers, each
with a different reversal cost: **unplug the network** (reversible in seconds), **power off**
(reversible in minutes), **unrack** (reversible in a truck roll). The **test duration is a player-set
dial and the dial is the whole decision** — leave it long enough that anyone who needed it screams,
short enough that the scream doesn't cost you the contract.
**Interacts with:** The Depth Test, Flow Records (which tell you who was talking to the box *before*
you pull it), §5.7 decommissioning.

### Bisection (an unlockable verb)
"Split the suspect set in half," generalized.

**How it works:** Once unlocked, usable against backends, versions, tenants, paths, client ASNs and
time windows. The game shows the **suspect-set size shrinking — a visible `2^n` countdown** — which
makes a methodical technique *feel* like progress, which is exactly what it is.

### The Depth Test
Deliberately pull a cable / kill a node / fail a feed to see what *actually* happens versus what the
diagram says.

**How it works:** Reveals hidden dependencies and the correlated-failure class. **The single best way
to discover that your A/B feeds share a PDU.** Distinct from the Scream Test in intent: the Scream
Test asks "does anyone still need this?", the Depth Test asks "does the redundancy I paid for exist?"

### Packet Capture (the expensive, definitive, late-game tool)
A tcpdump-alike. Expensive in storage, produces enormous data, and **answers questions nothing else
can.**

**How it works:** One-way audio, MTU blackholes, retransmits, malformed frames, who actually sent the
reset. Capture is a **timed action on a specific link with a size budget**: you must decide where to
put the tap *before* you know where the problem is, which is the real skill, and capturing on the
wrong interface costs you the window. Pairs with a **port mirror / TAP** buildable.
**Progression note:** this should be the **last observability unlock**, and it should feel like getting
a microscope.

### Flow Records and Traffic Archaeology
Cheaper than packet capture, retained for months, aggregated. **Retrospective visibility is a distinct
kind of observability: the ability to ask a question about the past.**

**How it works:** Answers "who was talking to that decommissioned server" (essential before a Scream
Test), "where did the bandwidth go last Tuesday" (essential for a 95th-percentile bill dispute), and
"has this host been beaconing to the same IP every four hours since March" (the APT detector that
actually works).

### Traffic Analysis
Inspecting your own flows, for business reasons rather than forensic ones.

**How it works:** Reveals which customer is the bandwidth hog, what percentage of your traffic is bots,
where your visitors actually come from, and **which of your machines is talking to a country you have
no business talking to.**

### Cable Tracing / Cable Archaeology
A facility-level minigame that reveals what's actually plugged into what.

**How it works:** It corrects the (wrong) logical map you've been playing on. **The map you believe is
not the map that exists.** In colo levels it extends to tracing a mystery cross-connect, where the
payoff can be **a free existing circuit you didn't know you had** — or a live customer circuit you
were one snip away from cutting.

### The Undocumented Dependency
Some connections on the map are hidden until they break.

**How it works:** See §2.9. Discoverable in advance via investigation or documentation spend, which is
what makes documentation *pay*. The game maintains **a map of what you know versus what is true**, and
closing that gap is itself a progression system with a percentage you can watch.

### The Undocumented Machine
Inherited hardware whose function is unknown.

**How it works:** Three options, each a different risk profile: **unplug it and find out** (fast,
risky — the Scream Test in miniature), **trace its cables** (slow, safe), or **leave it forever**
(free, and it will be load-bearing at the worst possible moment).

### The Forgotten Subnet
An old IP range still routed to something.

**How it works:** Discovered by your scanner if you run one — or by an attacker's scanner if you don't.
Whoever finds it first gets to decide what it's for.

### The Ghost Customer
An account with no contact information still consuming resources.

**How it works:** You can't bill them, you can't reach them, and you can't safely delete them. Resolving
a ghost is a small, satisfying, entirely mundane cleanup that returns capacity and closes a compliance
hole.

### The Inherited Estate
In acquisition scenarios, an entire discovery minigame: *what did we just buy?*

**How it works:** Map the network, find the undocumented, identify the load-bearing hack. Every
acquisition should ship with at least one thing that is both terrible and irreplaceable.
**Interacts with:** The Mystery Box Reverse-Engineer, the Acquisition Folder (§5.8).

### Log Archaeology / Log Reading (active discovery)
Spend staff time reading old logs.

**How it works:** Discover an earlier compromise or the true start time of a slow degradation, which
answers "how long have they been in here" and changes the whole incident's cost. Some unlocks are
hidden in the live log stream and only appear if the player *opens the log panel and clicks the
anomalous line*. Only possible if you built log aggregation — **the information is the reward.** **A
quiet, optional detective layer**: never mandatory, but the players who do it feel clever and the ones
who don't never feel punished.

### Threat Hunting
Proactively search for compromise with **no alert prompting you.**

**How it works:** Costs expensive senior time. **Sometimes finds nothing — and that is a valid,
frustrating, realistic outcome the game should not soften.** Sometimes finds a two-year-old backdoor.
The expected value is genuinely ambiguous, which is the honest representation.

### Hardware Autopsy
RMA a failed part and analyze it before you send it back.

**How it works:** Reveals whether the failure was **random or a batch defect** — which changes your
entire remediation strategy from "replace one drive" to "replace forty." One of the few discoveries
whose payoff is a change in *scale* of response rather than a new capability.

### Honeypot Intel
Honeypots and sinkholes passively generate **Intel** currency.

**How it works:** Intel buys research into threats you *haven't* been hit by yet, funds fingerprinting
of attackers, pre-empts waves, and — at scale — can be **sold as a threat-feed product.** **Converts a
defensive build into a progression engine**, and gives the Anticipation Track (§5.1) something to spend.

**Variations and additions**

- **The honeypot economy is self-balancing.** Captured attacker data is spendable **on the Security
  branch only** — so the more aggressive your honeypot placement, the faster that branch advances *and*
  the bigger your decoy surface. The tree pays for itself in the currency of risk.
- **Threat Intel as deck-building-lite.** Caught scanners and honeypot hits yield Intel, which is spent
  on **pre-level counter-tuning**: choose which one tower class starts "patched" against an anticipated
  threat family. It connects attacker behaviour directly to the strategy layer instead of to a stat.
- **An economy of attacks.** Captured attacker *methods* convert into the currency that buys threat-
  intel warnings — **the better your honeypots, the safer you run**, stated as a clean loop.

### Reverse-Engineering an Attack
Capture a threat alive in a honeypot and dissect it.

**Visual:** its sprite appears in your lab under a glass dome, dissected, with labelled parts. **The lab
becomes a museum of things that tried to kill you.**
**Visual — the Research Bench, specified:** Intel needs a place to be spent. A corner of the office
with a workbench, a **captured specimen under a dome**, a microscope, pinned printouts, and a rack of
**labelled sample jars — one per threat you've dissected.** Spending Intel plays a short assembly
animation at the bench. The museum is the menu.

**Variations and additions**

- **The specimen card.** Certain threats, when they hit a honeypot or a capture node, yield a
  **"specimen card"**: the attack you just survived *becomes the object that teaches its counter.*
  **Visual:** a forensic evidence board that physically fills with pinned printouts, so the lab's wall
  is a second progress bar beside the sample-jar rack.

### Boss Blueprints
Defeating a boss-tier threat drops a schematic.

**How it works:** Surviving a nation-state grants you their toolkit as a defensive capability. Surviving
a specific named disaster grants a blueprint you can't get any other way — **which makes disasters feel
like content, not punishment.**

**Variations and additions**

- **Named drops, and they persist between runs.** Beat the Hurricane cleanly → the **Flood-Barrier**
  buildable. Repel the Seizure → the **Warrant-Winder** (a Legal upgrade). Win Ransom Night without
  paying → the **Immutable Vault**. Naming the drops turns each boss into a piece of content players
  will discuss, and the drops open in-level build options in *future* runs, not only in the one where
  they fell.

### Blueprint Fragments (repurposed as partial intelligence)
Some discoveries arrive as torn pieces from incidents, audits, or poached staff.

**How it works:** **⚔️ Tension, resolved:** as a pure collect-three-pieces mechanic this adds waiting
rather than decisions. The fix keeps the art and changes the payload — each fragment is **partial
information about a threat you have not met**: a pre-filled section of a Codex entry, obtained from
honeypots, peer intel, audits and conference talks. Then fragments **feed the Anticipation Track**
(§5.1) and are informative rather than a second currency.
**Visual:** the torn edges genuinely interlock (authored as a matched set), and the assembly animation
ends with **the seams visibly remaining** — a repaired document, not a new one. Fragments carry
provenance marks: an incident fragment is **scorched**, an audit fragment is **stamped**, a
poached-staff fragment has **another company's letterhead corner** on it.

**Variations and additions**

- **Blueprint loot (the flavour-skin variant).** Post-level reward chests contain **one-off "special"
  variants** of things you already own — a custom WAF tuned for this hosting type, say. A light gacha
  of skins rather than a second currency: it keeps the shop tidy, rewards completion, and never grants
  power the tree hasn't priced.

### The Runbook Ladder
**The game notices what's annoying you and offers to fix it.**

**How it works — the full six-rung ladder:**
1. **Notice** — the game highlights that you have done this three times and asks whether you want to.
2. **Runbook** — a written procedure; one click, still yours to execute.
3. **Assisted** — staff can execute it without you.
4. **Automated** — it fires on a condition.
5. **Policy** — it fires on a condition, with a guard and an escalation path.
6. **Retired** — you fixed the root cause and the runbook is **no longer needed.**
**Rung 6 should be celebrated far louder than rung 4**, because automating toil is good and *removing*
toil is better, and this is the one place the game can make that distinction. **The single best
quality-of-life-as-progression idea in the document; it makes the player feel *seen*.**

**The trap that makes it a decision rather than a free win:** **an automated response to a symptom you
never diagnosed hides the problem.** Auto-restarting a service that leaks memory means you never fix
the leak, and the automation quietly masks a worsening condition until it fails in a way the automation
can't handle. So rung 3→4 offers an explicit fork the player can decline: **"automate this"** vs
**"investigate why this keeps happening."** Automating is cheap and correct most of the time;
occasionally it is how you end up with a machine that has been auto-restarting every forty minutes for
eight months.
**Second guard:** promotion from rung 2 to rung 3 requires the runbook to have been **used successfully
twice**, not merely written — because a runbook that is subtly wrong is worse than none (§2.9's
Documentation Rot).
**Visual:** each solved incident class adds a **labeled tab to the binder.** A thick, tabbed binder is
a visible measure of institutional knowledge and is the game's most satisfying "number goes up" without
a number.

**Variations and additions — the automation ladder**

- **The same tower, five rungs.** Beside the procedural ladder above, the *object* ladder:
  **Manual → Scripted** (cron-towers; still fragile) **→ Config-Mgmt → IaC → Orchestrated/Self-Healing**
  (declare desired state; it repairs itself). Each rung cuts micromanagement — **real quality-of-life
  delivered as in-game progression** — shifts the threat surface toward *your policies*, and **retires
  early-game play while opening late-game play**, which is the design's answer to "tower defense gets
  boring at scale."
- **Where do the hands play, then?** If the late game is dashboards, the verbs have to go somewhere.
  Resolution: automation shrinks routine, but **every act introduces one manual-only class** — APTs,
  storms, mergers: the things that refuse to be policy — so incident command remains the human verb at
  every scale. Ship it as an authoring rule: **"automation may retire no more than 80% of a level's
  verbs."**
- **The Playbook Library.** Repeating a successful *action pattern* (a scrubbing response, a DR
  failover) lets you codify it into an automated Playbook. One-time manual mastery becomes reusable
  automation **with a slightly worse effect than perfect manual play** — automation always pays a small
  tax, which is a thematic choice as much as a balance one.
- **Automation gated by repetition.** Do manual task X ten times — cert renewals, disk swaps — and the
  game *offers* the automation (the ACME tower, the PXE rebuild pipeline). **Teaches via tedium,
  rewards with relief**, and is the most sysadmin-authentic unlock trigger available.
- **The trust dial.** Tier 3 auto-remediation ships with a **trust dial**: too much automation and one
  bad rule kills your own datacentre. Progression here is **gaining time back as scale grows**, which
  is precisely the feel of becoming a mature hosting company — and the blast radius is the price.
- **Misfire modes per rung.** Each tier removes micromanagement and **adds a failure mode where the
  automation misfires during weird attacks.** The classic: the autoscaler scales the DDoS.
- **The staffing read.** Stated from the labour side, the ops-tooling track — scripts → config
  management → IaC → self-healing — is simply **each rung reducing the headcount needed to survive a
  big level**, which is why it is also an economic decision.

### The Runbook Library
Every incident type you've survived and documented becomes a one-click response next time, at reduced
MTTR.

**How it works:** **The knowledge tree *is* the progress bar.**
**Visual:** spines visibly **fade and warp** with age (§5.7's knowledge decay). A runbook used recently
is bright and slightly pulled proud of the shelf; one not exercised in months is flush, dull, and its
label is unreadable at mid zoom. **A staffer grabbing a faded binder should read as a bad sign
*before* the outcome is worse.**

### Post-Mortem Writeup (blameless postmortems as an XP mechanic)
After each incident, spending time writing it up converts the event into a permanent small buff.

**How it works:** A "lesson learned" modifier — plus a *reputation gain* if published. The choice per
incident: **"Blame"** (fast, free, morale −) or **"Blameless"** (costs a hand, morale +, converts the
incident into Intel/research at double rate). **A values choice with mechanical teeth.** Publishing N
honest post-mortems unlocks a permanent **reputation floor** — you become "the honest host," which
reduces damage from every future incident.

### The Post-Mortem Photo
After each major incident you get a "polaroid" of the moment of failure.

**How it works:** An actual captured frame from gameplay with a caption. These go in a scrapbook, and
some unlock a corresponding preventative buildable. **Using the game's own screenshots as progression
currency** is cheap to build and enormously charming.
**Visual:** the Polaroid **develops** with that chemical fade-in and pins itself to the wall with a
scrawled note; the capture hides the game UI and applies the Camera Grammar's Snap treatment so it
reads as a **photograph rather than a screenshot**, with the date written on the white strip in the
handmade layer. **Failure literally becomes wall art**, and the Polaroid unlocks the counter's research.

### The Graph You Didn't Have
A moment where the game shows you, post-incident, the graph that *would have* told you what was
happening — if you'd built the monitoring.

**How it works:** Teaches by regret, once, gently. Never repeated for the same metric.

### The Fog of Instrumentation
Parts of your own infrastructure you haven't instrumented render **fogged** in analysis overlays.

**How it works:** Buying observability is buying *sight*, and the fog receding is the reward animation.
**Fog of war over your own stuff is unique and thematically perfect.**
**Visual — the Fog Grades (it is not binary; there are three states):**
- **Unknown** — the object renders as an untextured grey mass with a `?` and no readouts. You know
  something is there because a cable goes to it.
- **Stale** — the object renders correctly, but its readouts carry a small clock glyph and a
  `last seen 4m` watermark, and its numbers are set in a lighter weight.
- **Live** — full fidelity.
**The stale state is the important one**, because "my monitoring is running but this agent stopped
reporting" is a real and common failure that a binary fog cannot show at all.

### X-Ray Inspector
An unlockable ability that lets you see *inside* any object. **Literally unlocking vision.**

**How it works:** A cutaway view revealing the plate-stack with vulnerabilities drawn as cracks in
specific plates. Before you have it, internals are opaque.
**Visual — a fixed stack order so it's learnable.** Five plates, always bottom to top:
**hardware/firmware → OS/kernel → runtime → framework/library → application.** Cracks are drawn on the
plate that carries the CVE. **Patch lag renders as dust between the plates.** Fixed this way it is a
readable diagnostic image rather than an illustration.

### Chaos Engineering Lab
See §4.5. Costs a small planned outage; prevents a large unplanned one. A **Foresight** path to
unlocks you have not yet been scarred into (§5.1).

**Variations and additions**

- **Disaster Drills (unlock via optional loss).** Run an off-cycle failure drill — **you deliberately
  kill your own primary region** — and passing earns permanent cascade-hardening tech. Practising
  failure, as a feature.
- **Deliberately-failed exercises.** The nastier version: **pull the generator** and see what the UPS
  was lying about. Failing your own exercise on purpose exposes the lie and unlocks the hardened
  variant — *practice when it's cheap, not when it's expensive.*
- **Chaos Engineering as a late-game unlock.** Injecting failures for **permanent resilience stat
  gains** — testing your own company on purpose — is the Netflix-flavoured inversion of the threat
  waves, and it should read as an inversion in the UI too: you are the monster this time.

### Load Testing Rig
Reveals your actual breaking point and which component fails first — which is almost never the one you
expected.

### Tabletop Exercise
The purchasable-foresight shortcut. See §4.5. Converts an Anticipation Token into a guaranteed partial
unlock at a cash cost (§5.1).

### Postcard from the Future / Capacity Forecast
Once you have enough monitoring history, unlock trend projection.

**How it works:** "At current growth, the DB disk fills in 41 days." **Turns reactive play into
proactive play, which is the whole arc of becoming a senior engineer.** Pairs with Growth Ceiling
Discovery, which supplies the hard limits the trend is running at.

### Vendor Advisory Feed
A cheap build that gives advance warning on zero-days, vendor bulletins and hardware advisories.

**How it works:** You see the threat wave form one turn earlier; some surprise attacks become scheduled
patch work instead. **The best defensive buildable in the game is information arriving early.**
**Information as a defensive structure.**

**Variations and additions**

- **The CVE Ticker.** The diegetic form of the feed: as the in-game news ticker announces vulnerability
  *classes*, the matching defence towers become **researchable** — so the player learns the threat
  landscape at the same time their company does, from the same source.
- **The CVE Calendar (hire a security analyst).** One level of early warning about **which threat
  family the next waves favour**, which converts into a pre-wave **"patch window"** where you can
  pre-patch or buy the counters cheap. Foreknowledge as a purchasable staff capability.
- **CVE Radar (the ambient drip).** Every few waves, an off-screen vulnerability **in a stack you
  actually use** surfaces: patch it for a small cost, or roll with it and the threats of that type are
  buffed next level. A living tech tree with decay built in.
- **The CVE Research Tree.** Discovering a zero-day opens its own branch: **virtual patching**,
  mitigation builds, and **vendor patch-ETA gambles** — early adopters get the fast-but-broken patch,
  waiting is safer, and the exploit scales with your delay. The best small decision the feed can
  generate.
- **Abuse-Intelligence Feed.** Handle a new abuse class once and you unlock the **intel subscription**
  for it: that class now telegraphs before waves. The subscription model matters — it is an ongoing
  cost, not a one-time unlock.

### The Vendor's Own RFO
When your upstream, cloud provider, CDN or DNS vendor has an outage, they publish a post-incident
report.

**How it works:** Reading it **costs nothing and unlocks a node** — you learn a failure mode from
someone else's pain, which is literally how this profession transmits knowledge. It makes the
Dependency Web twist *productive* instead of purely helpless: your vendor's bad day becomes your
capability.

### The Reading Room
A quiet-time screen where public postmortems from companies you don't even use are available as cheap
Intel.

**How it works:** Real-shaped incident write-ups, gated only by the player choosing to spend peacetime
reading them. The canonical **Testimony** path (§5.1). Slow, cheap, and the most authentic unlock
channel in the game.

### The Competitor's Postmortem
Free education from someone else's worst day, delivered diegetically.

**How it works:** When a rival (or a famous NPC company) has a public outage, their postmortem appears
in the trade-press ticker. Reading it (a small hand cost) unlocks the counter to that failure at a
discount **without you having suffered it.** The cleanest fix for the §5.1 gating problem, with lovely
industry-authentic flavour.

### The Customer's Pentest Report
A free, detailed, externally produced list of your weaknesses — **with a deadline attached, because the
customer has read it too.**

**How it works:** Arrives from an enterprise client who tested you as part of their own compliance. Each
finding is a discovery; each finding is also an obligation with a clock on it. The most stressful
useful document in the game.

### Threat Intel Sharing / Peer Network
Join an operator community; other players'/NPCs' incidents become your early warnings.

**How it works:** A great multiplayer or meta hook, and the group version of Testimony.

### The Escalation Ladder (vendor relationship as a mechanic)
**A progression system built entirely out of being professional to strangers.**

**How it works:** Each vendor has a ladder: L1 → L2 → TAC engineer → named account SE → the person who
wrote the code. Your **Vendor Relationship** stat, your support tier, and **whether you have ever filed
a *good* ticket** (reproducible, with logs, in their format) determine how many rungs you skip. Filing
good tickets is a purchasable staff skill.
**Interacts with:** Vendor Relationships below, §5.9's permission gates.

### Vendor Demo / The Vendor Trial
A salesperson offers a free trial. **The single most effective possible way to create desire for a
specific unlock.**

**How it works:** Try it for three minutes free; if it helps, you unlock the ability to buy it.
Diegetic, funny, and it teaches the tool for free. **Make it systemic rather than a one-off:** once per
level, a vendor offers a free three-minute trial of a tool you haven't unlocked. It works, **fully**,
and then it is taken away — leaving a visible **"you had this and lost it" gap** in your board.

**Variations and additions**

- **The vendor cart (FOMO as a mechanic).** Occasionally a traveling vendor rolls a cart to the map
  edge with a shiny prototype **for rent-trial**: a demo unit that works for two waves and then must be
  bought, or it is crated up and driven away in front of you. Showman UI, gold leaf, zero subtlety.
- **The Vendor Roadshow's deal structure.** The rep arrives with **locked boxes** and you choose ONE:
  buy a box outright (overpriced, today-only) or sign **the cheap multi-level contract** — and the
  contract is lock-in, because that vendor becomes your **only upgrade path** for its duration, so one
  bad vendor event hits every node you placed under it. Deals visibly expire, on-screen.

### Vendor Relationships
Buying repeatedly from one vendor unlocks their premium line and better support response.

**How it works:** **Loyalty as a tech tree with a trap in it** — it creates lock-in, and switching
vendors later costs a re-learning penalty. Cultivating a vendor also unlocks **early access, better
lead times, and a phone number that actually answers during a shortage.** You also inherit their EOL
announcements and their recalls: a tech tree made of partnerships rather than technologies.
**Visual:** each vendor is a logo card with a relationship bar, **drawn in that vendor's own brand
style**, so the four house dialects are visible in the menu before they ever arrive in your racks. Their
premium line is drawn in that vendor's distinct style too (one is all brushed aluminium, one is cheap
blue plastic, one is aggressively gamer-RGB). **Unlocks that change your art palette make progression
aesthetically felt.** Good standing shows as visibly shorter truck ETAs.

**Variations and additions**

- **Vendor standing as an explicit stat.** Repeated on-time payments and a clean abuse record raise a
  **vendor standing** number that buys three concrete things: better transit pricing, **early security
  advisories** (warning ticks before CVE waves), and advance-replacement hardware (faster RMA).
- **Faction unlocks.** A vendor **takes notice of you**: a large GPU deployment earns a discount and
  early beta gear — and ties your fate to theirs, because **their outage becomes your outage.**
- **The Upstream Account Manager (relationship NPC).** Unlocks **"call in a favour"**: emergency
  transit bursts during a spike, an early heads-up on carrier maintenance windows, and — in a
  "not your fault" crisis — **their NOC actually picks up.** Earned by years of low-abuse history
  rather than by money: infrastructure relationships are a stock you draw down.
- **The Borrowing Hand (a mutual-aid pact between peers).** Formalize the favours you can call between
  operators whose abuse desks know you: an **emergency /24 loan** for a launch, **ten minutes of a
  neighbour's scrubbing capacity** during your flood, a **borrowed remote-hands tech** when you are
  locked out. Each ally is a relationship you *spend* — asking erodes the reserve, being generous first
  grows it. Dark use: a grey-jurisdiction ally will "loan" you capacity you would rather not bill
  against your own SLA. **The anti-loneliness mechanic in a game of pager nights.**
- **Abuse-Desk Reputation / the ISAC network.** Fast, complete abuse responses accrue **"good citizen"
  standing between hosts**: delisting timers shorten, blocklists trust you, and coordinated takedowns —
  a spam botnet shared with the next host along — become **multi-company operations you can join.** The
  flip is exact: ignoring abuse desks unlocks the Bulletproof branch faster.
- **The OEM-relations ladder, spelled out.** Per-vendor relationship meters fed by buying brand, passing
  certifications, and joining a "customer advisory board." The tiers unlock the **RMA fast lane**
  (a hardware death drops a spare part *during* the level), **firmware previews** (patch the zero-day
  meteor before the ticker), **allocation priority in shortages** (the GPU supply-crisis event becomes
  "you're in — sorry, rival, you're out"), and co-marketing attraction buffs. The trap: a maxed
  relationship quietly **discounts that vendor's failures in your tech-debt ledger** while your
  mixed-vendor resilience decays — and then a capacitor-plague batch turns out to share a manufacturer.
- **The amicability meter, per vendor class.** Simplest form: one meter each for upstream, transit,
  hardware and cloud-of-the-clouds, raised by repeatedly weathering peering and hardware events
  together, cashed out as preferred pricing.
- **Vendor Ecosystem deals carry hidden clauses.** Deal events open at reputation thresholds and come
  with fine print — **the cheap vendor has the lower MTBF**, so the hardware-entropy threat scales with
  your price-greed. Unlock decisions carry a theme-perfect moral: everything is a contract.
- **Vendor conferences and free-tier trials.** A periodic event where a booth hands you **a temporary
  free buildable** — test before committing a research node, which makes the trial a *scouting* tool
  for the tree rather than a giveaway.

### Job Applicant Skills / Staff-Carried Knowledge
**Staff *are* tech tree nodes.**

**How it works:** Hiring a person with an unusual background unlocks their specialty branch. Hiring a
senior from a bigger company unlocks nodes *they* know. Hiring a network engineer unlocks BGP entirely;
a compliance officer unlocks the regulated branch.
**Visual:** they walk in and draw new sections on your whiteboard themselves, **each in their own
distinct handwriting**, so the board becomes a record of who taught you what. If they burn out and
leave, **the marker fades to about 40% but never erases** — a visual for knowledge loss, and a faded
section is identifiably *theirs*. The Alumni Network can re-darken a section if you rehire them.
**Interacts with:** §5.11's knowledge-as-transferable-asset rules, §2.9 burnout.

**Variations and additions**

- **Hire archetypes unlock plays, not stats.** A **grey-hat** unlocks honeypots and offensive
  countermeasures; a **compliance nerd** unlocks audit-prep; an **ex-cloud-founder** unlocks
  autoscaling; a trained **security analyst** eventually unlocks the SOC facility; a **DevOps** hire
  unlocks blue/green; a **lawyer** unlocks offshore. **People ARE the tech tree** — the roster shapes
  which tech exists for you at all, which is the cheapest replayability the design has.
- **Staff XP from repetition.** Automation unlocks from what your people actually did: **manually
  restart a service twenty times and the "watchdog" research appears.** The staff who do the work
  level; **the one you leave idle stays junior** — which ties directly into the insider-risk loyalty
  system.
- **Hired knowledge carries liabilities.** A former registry engineer, a grey-hat, a compliance auditor
  each unlock their personal branch when hired — **and carry a hidden liability** (the grey-hat "may
  attract law-enforcement attention"). People carry the tree, and the tree carries them back.
- **Talent Gacha: the job market.** Each level the candidate pool refreshes and you may hire a weird
  specialist — *"ex-SIGINT, paranoid, +stealth detection, −teamwork, 2× salary."* Staff are
  discoverable, permanent-ish, and **opinionated.**
- **The staff skill tree.** Hires carry specializations and training spends; a senior who has survived
  ten incidents levels into an **SRE archetype that auto-defines new buildables** — "they built this at
  their last job."
- **The Greybeard Hire.** A rare character who has seen it all: unlocks a **short story chain of
  historical incident classes** — the Morris worm, the Spamhaus takedown — with era-authentic counters.
  A living codex, and the best excuse in the design for teaching real history.
- **Competitive espionage via the job boards.** Late game you can **steal unlocks by hiring a rival's
  engineers** — but a poached hire arrives with a trojan-lottery risk, and the rival can poach yours
  back. See Rival Tech / Espionage (§5.5) for the non-human version.

### The Conference Talk
Send a staff member, or give a talk yourself.

**How it works:** Costs an engineer time and money; returns **a choice of three** tech-tree nodes,
weighted toward what you're currently struggling with, with a sympathetic pity timer. **Random offer,
player selection — that's the difference between a slot machine and a decision.** *Giving* a talk —
submitting a post-mortem as a talk — gains enormous reputation, makes hiring cheaper, and spawns Press
visitors. **Ops culture rendered as a mechanic.**
**Visual:** a slide-deck cutscene with deliberately bad clip art; on publication, your reputation sky
clears a shade. **Turning your worst day into a visible asset.**

**Variations and additions**

- **Conference tracks gate specific branches.** Attending is not a generic research spend: **the track
  you attend gates the branch you can advance** (a Kubernetes conference opens orchestration), so the
  conference calendar becomes a route through the tree.
- **The rep aura.** Beyond the node, submitting talks gives the company an aura that **attracts
  developer-customer spawns** — the acquisition channel and the research channel are the same spend,
  which is exactly why real hosting companies over-invest in speaking.

### The Field Trip
Visiting another operator's facility.

**How it works:** Real operators tour each other's buildings constantly and steal ideas shamelessly. A
costed action returning one facility-branch node, one "why didn't we do that" layout improvement, and a
relationship. Lovely, cheap, and completely true to the industry.

### The Standards Body
Participating in the thing that makes the rules.

**How it works:** Send an engineer to a working group. Costs a recurring fraction of a senior hand.
Returns early access to protocol changes (**a one-era head start**), advance warning of deprecations,
and a reputation modifier with the most technical customer segment. Occasionally a change you argued
for lands and permanently benefits your architecture. **The slowest, most prestigious, most
operator-authentic unlock channel available.**

**Variations and additions**

- **The Standards Track (the "RFC tree").** A parallel tech line rather than a single action:
  TCP-wrappers → TLS → HSTS → DNSSEC → RPKI → post-quantum crypto. Each standard unlocks passive
  defences **and attracts standards-nerd customers** — higher quality, more demanding, and vocal.
- **The Standards-Body Seat (the endgame flip).** Late campaign you stop reading the protocols and
  start **writing** them: propose clauses ("require RPKI", "deprecate reflectors") and an accepted one
  **nerfs a global threat family for everyone, including you** — amplification attacks halve in
  strength industry-wide, a macro-defence no turret can match — while buffing the architectures you
  happen to run. **Your moat, laundered as progress.** Rival AIs counter-propose, so it is a lobbying
  minigame; and the failure mode is beautiful: **write the standard around your *current* build and
  watch the meta move on without you.**

### Research Papers / Conference Talks (the library path)
Spend staff time to learn a technique; the knowledge is permanent across the campaign, not just the
level.

### The Mentor
An NPC veteran who gives you one hint per level and unlocks a node if you follow it.

**How it works:** The tutorial voice that persists as a system, and the only acceptable form of
tutorial text in a game whose guardrail is "teach through loss."

**Variations and additions**

- **The Mentor as a late-game hire, and what he says.** A grizzled senior engineer who **drops proverbs
  that ARE the mechanic hints** — *"never trust the smart hands," "backups don't count until
  restored"* — and unlocks a tier of options each act. The proverbs double as the game's only
  acceptable tutorial text because they are indistinguishable from flavour.
- **The Mentor as a campaign throughline.** The stronger framing: the mentor (or his rival mirror, the
  Nemesis thread) is **a single recurring NPC who comments on the player's choices across the whole
  campaign**, not a hire who appears in act three. Continuity is what makes the hints land.

### Reading the Docs
An idle action during quiet periods.

**How it works:** Staff with free time slowly generate "insight" that unlocks nodes. **Makes quiet
levels mechanically valuable and punishes running your team at 100% utilization forever.** Real lesson,
real mechanic.

### The Scale Threshold Reveal
The game notices your architecture and draws the next idea for you.

**How it works:** Certain unlocks appear only when your topology reaches a shape — once you have 3+ web
servers, the Load Balancer node *visibly appears* on the whiteboard with a little "!" burst. A great
teaching moment and a great animation.

### The Mystery Box Reverse-Engineer
In Acquisition levels, spending hands on the undocumented server eventually reveals what it does.

**How it works:** Occasionally something genuinely great. **A gambling minigame built out of technical
debt.**

### Competitor Intel
Scan competitor IP space, read their status page, notice their outages.

**How it works:** Mildly cynical, entirely realistic; unlocks poaching opportunities and a read on
where they are weak this quarter.

**Variations and additions**

- **Pricing intelligence.** A later tier of the same lens: a **competitor-price tracker** that reveals
  when to raise and when to hold, by showing you the elasticity meters you were previously guessing at.
  **Early game you price blind** — like 2003 — and the unlock is the moment that stops.

### The Competitor Teardown
Buy a competitor's product (a small cash cost) to discover their feature list and pricing.

**How it works:** Unlocks counter-positioning options. At Tier 4+ there's an ethically dubious version:
learn what a competitor deployed and copy it at a discount.

### Trade Show Serendipity
Attending unlocks a partnership offer, a hiring lead, or intelligence on a market shift — **offered as
a choice of three**, not rolled for you.

### Customer Conversations / Discovery by Customer Request
**The customer is the tech tree.**

**How it works:** A client asks for something you don't offer ("can you store our backups too?").
Saying yes starts a research node. A support ticket that says "can you do X?" **repeated twenty times
is a product unlock** — the game should count them and surface the count. Exactly how real hosting
companies actually grow.
**Interacts with:** §5.6, where the same mechanic opens whole business lines.

**Variations and additions**

- **Feature-Request Quests, with a drawback package.** Customers periodically beg for things —
  *"we need websockets," "HIPAA," "IPv6," "SSH," "PCI"* — and fulfilling one unlocks it **for
  everyone**, plus a contract renewal. The rule that makes it a decision: **every unlock arrives with a
  drawback package.** Unlocking SSH unlocks the root-access layer *and its threats.* You are choosing
  which door to open, not which reward to collect — **discovery as a menu, not a tree.**
- **The Customer Request Board.** The product-management pipeline as a literal board: customers file
  requests that become unlockable buildables, and **fulfilling popular ones boosts reputation**
  ("they listen!"). Enterprise prospects file the expensive ones — KMS, HSM, bare metal — and accepting
  those adds real branch nodes.
- **Customer-Funded R&D.** The whale says *"build KMS support and we'll sign — and we'll pay for the
  lab work."* Enterprise deals arrive as **milestone contracts**: upfront cash plus staged payouts, in
  exchange for a build requirement **and a visibility clause** (their logo on your page is attraction;
  their outages trending in *their* industry press doubles your reputation leverage). The dark fork: a
  funder can demand you **not ship the same feature to a competitor** — exclusivity money versus market
  share. A strategic contract, not a quest marker.
- **The Queue Board — ignore at your peril.** Filling requests grants research points and a conversion
  boost for that customer type; **ignoring them lets competitors steal whole customer breeds.** Late
  requests are also Trojan horses, since each new capability opens its threat family.
- **Segment-demand unlocks.** Sometimes the arrival of a *segment* is the unlock: the e-commerce
  segment showing up is what opens DB + WAF, because without them you would simply over-provision.
- **Governance: the queue is contested.** Loud hobbyists and quiet whales request **incompatible
  things**, and building for one segment can *block* an RFP item for another. The roadmap needs a
  politics layer, not just a priority order.
- **Upsell discovery via usage.** New buildables reveal themselves **only as customer behaviour demands
  them**: the first metered bill unlocks the quota engine, the first enterprise convoy unlocks the TAM
  role, the first toll fraud unlocks the trunk firewall. **The tech tree is partially drawn by the
  market** — the purest expression of "the world teaches you."

### The Accidental Niche
If 30%+ of your customers happen to share a vertical, the game *notices*.

**How it works:** It offers the "Specialize?" decision — reposition around them for a big conversion
multiplier in that segment and a penalty everywhere else.

### The Feature You Built for One Customer
Bespoke work unlocks productizable features.

**How it works:** An enterprise client demanded SSO; you built it; now it's a product line. **A very
real hosting-company growth pattern.**

### The Support Macro That Became a Product
Your team wrote a script to fix a common problem. Package it and sell it as a managed service.

### The Log That Told You Something
Good analytics surface *insights* as unlockable cards.

**How it works:** "Customers who install the 1-click installer in week 1 churn 60% less." Acting on the
insight is a buildable objective.

### Business discoveries (the economics you learn by running into them)
A whole family of discoveries where the reveal *is* the mechanic — the moment the player understands
how this industry actually makes money.

**How it works:**
- **Discover Overselling** — the first time a box sits at 8% utilization, an advisor points out you
  could sell 4× the accounts. Unlocks the **Oversell Dial.** A genuine "oh no, I understand the
  industry now" moment.
- **Discover the Renewal Cliff** — the first time a promo cohort renews at full price.
- **Discover Expansion Revenue** — when a customer upgrades unprompted, the Upsell system unlocks.
- **Discover Cross-Connect Margin** — after your first tenant asks for a patch between cabinets and you
  charge $0, the **Meet-Me Room** unlocks with a very pointed tooltip.
- **Discover 95th Percentile** — after your first bandwidth bill doesn't match your traffic graph.
- **Discover Dedup** — after your first storage bill comes in lower than expected, the dedup-ratio dial
  unlocks, and with it "sell 10TB, store 2TB."
- **Discover Deferred Revenue** — after your first annual prepay, the Finance HUD splits cash from
  revenue and the player learns why they felt rich and then poor.
- **Discover Cohort Analysis** — after your third month, the churn view unlocks by signup cohort,
  revealing that the Black Friday cohort was worthless.
- **Discover Negative-Margin Customers** — per-customer profitability unlocks once the Controller is
  built. **Half your customers turn red.** Genuinely one of the best reveals available to this game.
- **Discover "Fire the Customer"** — unlocked after you have watched a red customer stay red for three
  consecutive months.
- **Discover Peering** — after transit costs cross a threshold.
- **Discover the Abuse Ladder** — after your first upstream warning email.
- **Discover Yield Management** — on satellite / GPU / scarce-capacity levels, after you sell out of a
  scarce resource too cheaply.
- **Discover the Whale Problem** — the concentration meter unlocks when one account crosses 20% of MRR.
- **Discover the Land-and-Expand Ladder** — when a shared-hosting customer outgrows their plan.
- **Discover Migration Attrition** — after your first acquisition loses 30% of its customers in transit.
- **Discover MDF** — after reaching a vendor partner tier, you learn that vendors will pay for your
  advertising.
- **Discover the "Free Migration" Weapon** — after a competitor uses it to take a customer from you.
- **Discover Demand Response** — after your first grid-peak event and an email from the utility
  offering to pay you to shed load.
**Hosting types:** overselling and dedup are shared/VPS/storage; cross-connect and demand response are
colo/facility; yield management is GPU, satellite and any capacity-constrained line; 95th percentile is
universal the moment you buy transit.

### Discovery by Incident Adjacency (near misses teach too)
An incident that *nearly* happened produces a smaller Intel payout and a Codex partial-fill.

**How it works:** A threshold approached, a redundancy that held by one unit, a backup that restored on
the second attempt. **Rewards the player for having instrumentation good enough to notice a near
miss**, which is a real and rare organisational maturity — most companies never find out how close
they came.

### The Rumor Board
Upcoming threats hinted before they arrive.

**Visual:** a corkboard of a pinned news clipping, a mailing-list printout, a CVE advisory with the
details blurred. **You can prepare for a shape you can only half-see.**
**Interacts with:** §5.1's Anticipation Track — this is where you get the information you're betting on.

**Variations and additions**

- **Night Events / the Rumor Mill.** The board should occasionally *push* rather than wait: dark-web
  chatter, a CISA alert, a competitor outage, each presenting a choice with a **delayed payoff.** This
  is the discovery channel for hidden threats **before they appear on your network**, and delayed
  payoff is what stops it from being a free warning.

### The Acquisition Folder
Buying a competitor unlocks a manila folder of their gear photos.

**How it works:** You browse their junk before you inherit it and decide what to keep. **Visual due
diligence** — and the folder is deliberately incomplete, so some of what you inherit is still a
surprise.

### The Overlay Unlocks (new ways to see)
Each new **lens** is itself an unlock: heat map, power map, blast radius, cost-per-U, latency field,
thermal model, growth ceiling, change correlation.

**How it works:** Announced with a short animation of the world being **re-rendered in that lens.**
**Giving the player new ways to see is as good a reward as new things to build**, and it is the
cheapest category of unlock in the entire design.

**Variations and additions**

- **The overlays are instruments you buy.** Rather than lenses that simply appear, each view mode is
  **a purchased tool with a physical form** — a multimeter, a thermal camera, a sniffer — and owning
  the object is what grants the view. **Literally new eyes on the same world**, and the most satisfying
  kind of late-game UI growth precisely because the instrument sits on the bench where you can see it.

### Open Source Contribution
A community branch.

**How it works:** Contributing draws your logo onto an off-map "community" board and unlocks free
tooling.
**Visual:** other companies' logos appear there too, making the world feel populated.

**Variations and additions**

- **Contribution as karma currency.** Spend credits to contribute fixes upstream and you buy a
  **global** effect: public CVEs get patched faster **for everyone, including you.** Mostly flavour,
  with a small real payoff — and in a competitive mode, rivals **free-ride** on your work, which is the
  commons problem stated exactly.
- **The Giveback Tree, deepened.** The real currency is **maintainer trust**, and it tiers: upstream
  warns you **privately before a CVE publishes** (your Log4Shell raid now hits your competitors first),
  your bug reports get priority fixes, and at the top **"we employ the maintainer"** unlocks a
  legendary hire. The fork is time versus money — **your staff** contribute (a morale tax) or **your
  cash** sponsors (cheap, less trust). The anti-branch: using open source without giving back raises a
  **"leech debt" meter** the community someday cashes in as a coordinated negative-review event —
  **karma as a scheduled threat.**
- **Sponsorship as a slow-burn investment vehicle.** A recurring donation buildable that returns as
  upstream patches (threats targeting your OSS stack get auto-mitigated) and goodwill (a dev-customer
  spawn boost).
- **The Open-Source Migration Path.** Unlocked by the vendor-squeeze event: a branch of buildables —
  control panels, virtualization stacks — that **trade licence COGS for support load and expertise
  requirements.** A tech tree that says *cheap has a headcount price.*

### Attack Fingerprint → Signature
Every L7 attack that gets through **leaves a pattern in your logs**; analyzing it mints a WAF rule.

**How it works:** The discovery unit is the attack you *actually met*, not the catalogue — so your
ruleset is a record of your own traffic rather than a vendor's default. Analysis costs senior time and
the rule is yours permanently; a fingerprint you never analyze is a log line you paid to store.
**Interacts with:** the Threat Codex (the fingerprint fills the entry), Honeypot Intel, §5.1's scar
path.

### The Dark Forest (reconnaissance reveals what is aimed at you)
A discovery *theme*, stated as a rule: **you never see the full threat catalogue.**

**How it works:** Reconnaissance reveals only what is **aimed at you specifically**, which means
**your build choices generate your enemy list.** Running an open relay populates a different forest
than running a GPU cluster. The Codex is therefore never complete, completion is not the goal, and the
sensible defensive question changes from "what exists?" to "what is looking at me?"
**Interacts with:** The External Attack Surface Scan, the Threat Codex's coverage filter, §5.1's
Anticipation Track.

### The Status-Page Crawler
Subscribe to the public status pages and RSS feeds of every major upstream and peer, and **the
industry's incidents become your advance intel.**

**How it works:** An outage at your CDN's CDN shows up as a **rumor curve five to twenty minutes before
the first customer ticket.** Other operators' published postmortems occasionally drop a **named
counter** for a threat family you have not met — war stories harvested from strangers — and over a
campaign you start seeing attack patterns in the wild as **a calendar of industry events** rather than
as surprises. Cheap, true, and available to every hosting type.
**Why it works:** the Mentor is *your* lore; the crawler is *the world's.* It is the Testimony path
(§5.1) automated, and it is the only intel source that improves purely because the industry is having
a bad week.

### The Abandoned Datacenter (exploration and salvage)
A mid-campaign side map: a dead host's infrastructure, left as it fell.

**How it works:** Salvage fragments — drives, config tapes, a labelled patch panel — and
**reverse-engineer lost tech**: unlock by archaeology rather than by research. **Secrets under the
floorboards**, and the best possible use of the game's own art budget for a level nobody defends.

**Variations and additions**

- **Salvage carries inoculation risk.** Salvaged media has a real, telegraphed, codex-learnable chance
  of containing a **dormant implant** — you have just adopted an APT. Archaeology is powerful *and*
  poisonous: every build is a bill, **including a bill for knowledge itself.** The patent-troll's
  prior-art hoard should come out of this same room: one set piece, two payoffs.
- **Glitch Archaeology (the retro-act form).** In retro acts, discovering a **legacy behaviour combo**
  — correctly hand-terminating a hundred lines, say — unlocks a modern descendant technology as a
  "port," so the old skill pays out in the new era.
- **The Used-Equipment Find.** Buy cheap second-hand servers and sometimes **a prior tenant left
  something on the disk**: lore fragments, cash from responsible disclosure, or a reputation bomb if
  you mishandle it. Discovery through scavenging, with an ethics check attached.
- **Dark Forest discoveries on the map.** Certain maps have fogged regions — unlit fiber paths,
  abandoned peering agreements — and **sending a scout** (spending a maintenance window) reveals loot
  or buildables. **Visual:** unexplored tech clusters sit in a dark room and research is **your work-
  light sweeping the wall**, silhouettes resolving into equipment as the beam passes.
- **Buried infrastructure on your own site.** Some buildables are discovered **on-level, not in the
  tree**: the dead IX port under the floor, the abandoned fiber ring, the second power substation. A
  **site-survey hire** reveals them. Real datacentres hide treasures and traps in equal measure.
- **Zero-Downtime Secrets.** Hidden techniques — blue/green deploy, connection draining, graceful drain
  mode — each found by **attempting a migration scenario and succeeding at zero drops**, so the
  discovery is a demonstration of skill rather than a purchase.
- **The Old Protocol Crypt.** Discovering retro buildables in early levels — a Gopher hole, a Usenet
  tree, an IPv4-only router with a legacy patina — unlocks **alternate cheap-but-flawed defences** in
  the modern game. *"Do you dare run sendmail again?"*
- **Rescue-discovery.** The smallest version of the same idea: **a failed restore in an early DR level
  teaches you restore-test automation.**

### Proactive hidden unlocks
A set of techs that unlock **only if you do the right thing before you are forced to.**

**How it works:** Patch within X minutes of a CVE for three events in a row → the **zero-day hardening**
ability. Keep PUE low across a campaign → the **green-power discount.** They are invisible on the tree
until they fire, which is the point: the reward for discipline should arrive as a surprise, because
otherwise it is a checklist.
**Variations and additions**
- **The Incident Retrospective Bonus.** Voluntarily running a retrospective after a **minor** incident
  has a chance to surface an unlock or a discount early — the game paying out for reflection nobody
  demanded.
**Interacts with:** §5.1's three acquisition paths (this is Foresight paid in behaviour rather than
cash), §5.12's Sealed Capability.

### The Acquired Tech Tree (M&A as progression)
Buying a smaller host **instantly unlocks their buildables** — and their problems.

**How it works:** A mini-acquisition action grants their tech at **degraded quality** (their technical
debt becomes a maintenance upkeep bump for months) and their customers at **~80% retention** (expect
angry mail). **Integration is the hard part, dramatized** — and it is the only route in the game that
converts cash directly into tree progress, which is why it must hurt.

**Variations and additions**

- **Blueprint fragments via acquisition.** Buying a rival yields **blueprints plus baggage** — the
  tech tree advanced by purchase order.
- **Acquiring a distressed rival.** Buy a failing host's customer base at a price per account: instant
  MRR, instant churn liability, and inherited debt — **their ancient servers arrive on your power
  bill, their bad reputation merges into yours.** A late-game shortcut to scale, with a hangover.
- **The Acqui-Hire.** A small rival's "secret sauce" arrives as **a feature branch unlocked plus a
  team-morale timer** — growth by M&A as an alternate progression economy rather than a one-off event.
- **The diligence reveal.** Buying a failed company hands you **whole finished tech rows instantly**,
  and the diligence screen shows **their buried zero-days, now yours.** Shortcut and landmine in one
  transaction.
**Interacts with:** §5.4's Inherited Estate and Acquisition Folder, §5.6's Operator → Acquirer pivot,
§5.1's unlock trigger taxonomy.

### The Consultant
Pay a snooty expert for two levels of advice.

**How it works:** They **preview the next wave and recommend builds.** The elegant part is the pricing:
**if you ignore them and survive anyway, your next consultant is cheaper** — the learning curve is
priced in, and the mechanic quietly measures how much you still need the hint.
**Interacts with:** §5.1's Foresight path, the Mentor (free, slower, kinder), §5.12's research economy.

### Case Study Vending (peer learning)
An in-world kiosk selling **anonymized aggregate disaster reports from other players.**

**How it works:** *"41% of hosts lost this level to memcached reflection."* Purchasable pre-level intel
that doubles as **the community's shared language** and as a meta-sway that pushes the whole player
base toward patching its blind spots. The group version of Testimony, with real data behind it.
**Interacts with:** Threat Intel Sharing / Peer Network, the Reading Room, §5.1's Anticipation Track.

---
## 5.5 Tech tree branches and shapes

### The six-branch spine (Serve / Shield / Scale / Sustain / Sell / Sense)
A memorable, alliterative top-level shape that covers everything in this document.

**How it works:** **Serve** (what you sell: compute, storage, delivery), **Shield** (defenses),
**Scale** (multiplication: LBs, anycast, automation), **Sustain** (facility, power, cooling, people),
**Sell** (pricing, channels, contracts), **Sense** (observability and intel). Every buildable in §4 maps
to exactly one branch, which is how the build palette gets organized too.

**⚔️ Tension: four competing branch taxonomies, explicitly unresolved.**
- **Six-branch spine** (above) — reads best on a screen.
- **Eight, more granular:** Speed / Scale / Shield / Sight / Endurance / People / Commerce / Facility.
- **Seven, named for the *outcome* rather than the thing:** Availability / Performance / Security /
  Efficiency / Scale / Commercial / Resilience-Human — teaches best.
- **Three Pillars:** *Serve* (capacity, speed, features) / *Survive* (defense, redundancy, process) /
  *Sell* (marketing, pricing, contracts, support). Every node belongs to exactly one. **Players who
  neglect a pillar fail in a specific, diagnosable way**, which teaches far better than a generic loss
  — the failure message can name the pillar.

**Recommended resolution:** derive the branches from the **nine defense roles plus three production
roles** (§2), because then the tree structure and the Coverage Grid become *the same object* and the
player only has to learn one taxonomy. Proposed final six: **Serve** (capacity/throughput/latency) ·
**Shield** (classify/meter/contain/divert) · **Sense** (detect) · **Survive** (recover) · **Sustain**
(facility/people/maintenance) · **Sell** (revenue/deter/negotiate). Every node's role tag then tells
you which branch it is in automatically, with no separate authoring pass. Pick one scheme and rename
the others' nodes into it — but keep the Three Pillars' *diagnostic failure messages* whichever you
pick.

**Variations and additions — two further taxonomies, and a resolution**

- **The six-branch *operational* layout.** SECURITY (detect/block) · RELIABILITY (redundancy, restore) ·
  NETWORK (routing, peering) · OPS (automation, staff) · PHYSICAL (power, cooling, cage) · COMMERCIAL
  (pricing, funnel, reputation) — **with mutual pressures authored in**: every RELIABILITY node lowers
  per-customer margin, every COMMERCIAL node raises blast radius. The pressures are the point; a
  taxonomy with no tension between branches is only a filing system.
- **The four-branch layout.** SECURE (firewalls → WAF → zero-trust) · SCALE (cache → LB → orchestrator
  → autoscale) · OPS (monitoring → automation → blue/green → chaos) · BIZ (billing → contracts →
  marketing → legal/SLAs). Two rules keep it honest: **each new tier opens a new threat category**, and
  **branches gate each other** (the orchestrator needs monitoring, which needs logs, which need
  storage).
- **"Ops Maturity," the other four.** Infra / Security / Customer-Ops / Legal-Finance, with **one branch
  focus recommended per act** and cross-branch prerequisites for the best combinations — so the tree
  rewards specialists and still permits generalists.
- **Resolution of the four-versus-six tension: terrain roots.** Ship **four always-visible roots**
  (SECURE / SCALE / OPS / BIZ) and make **PHYSICAL and NETWORK *terrain* roots that only render when a
  level contains those substrates** — invisible in the garage, PHYSICAL blooms in the colo act, NETWORK
  blooms at multi-region. "Ship both as eras" becomes **one graph with visibility rules**, and the tree
  UI ends up expressing the "scale changes the game" pillar directly.

### The shared tree, the per-type Loadout
**The tree is shared; the loadout is per-hosting-type.** The anti-fragmentation mechanism.

**How it works:** All hosting types draw from **one** tech tree, but each type has a **Loadout** of
8–12 buildables available at the start of a level. Unlocking "Anycast" in a DNS level means you *have*
it forever — it simply isn't in the shared-hosting loadout until you unlock the crossover node.
**Why it works:** variety across fourteen hosting types without fourteen separate progressions, and it
is the reason a campaign that changes hosting type per level doesn't reset the player to zero.

### Crossover Nodes ("Transferred Knowledge")
The most satisfying unlocks are the ones that carry a lesson **between** business types.

**How it works:** "You learned rate-limiting in DNS; now it's available on your game servers."
Explicitly labelled in the UI as **Transferred Knowledge**, with the origin line named. Makes the
campaign feel cumulative rather than episodic, and it is the mechanical expression of why a veteran
operator is better at the *next* thing.
**Interacts with:** §5.6's Type Mastery and the Portable Skill table.

### The CEO branches
A parallel business tree so the commercial half is not an afterthought.

**How it works:** **Pricing Science** (elasticity testing, packaging, usage-based billing), **Retention**
(onboarding, QBRs, save offers, health scoring), **Margin** (automation, cost-to-serve analytics,
efficiency), **Trust** (compliance, audits, status page maturity, insurance), **Channel** (affiliates,
resellers, partners, marketplaces), **Brand** (content, events, community), **Finance** (forecasting,
credit lines, deferred revenue handling), **M&A** (diligence, integration, migration tooling).
These nodes mostly modify *rates and multipliers*, not board objects, which is exactly how a business
tree should feel next to an infrastructure one.

**Two structural improvements:**
1. **Gate them on data, not money.** Pricing Science requires 12 months of cohort data. Retention
   requires exit-survey history. Margin requires cost-to-serve instrumentation. M&A requires clean
   books. **You cannot buy business capability without having measured something first** — which is
   true, and a lovely mirror of the Sense branch on the ops side.
2. **Interlock them with the ops tree.** Trust requires Sense (you can't publish a status page honestly
   without monitoring). Margin requires Scale (automation). Channel requires Serve (you can't let
   partners provision without an API). **Cross-branch synergy nodes should specifically span the ops
   and business trees**, which makes the two halves one game instead of two.
**Interacts with:** §6 throughout; §5.9's financial-maturity gates.

**Variations and additions — the concrete commercial nodes**

*Pricing Science.*
- **The Pricing Experiment unlock.** An A/B pricing tool that runs two price points per segment and
  reads the elasticity. **Turns pricing from a static slider into a discovered science**, and it is the
  gateway to the offer tactics (annual-prepay discount, first-month-50%).
- **The Pricing Psychology Lab.** Unlocked **after three *failed* A/B tests** — failure as discovery —
  and containing decoy tiers, charm pricing ($9.99 versus $10), and annual-anchor displays
  ("save 40%"). Conversion micro-mechanics that look like alchemy and are just behavioural economics
  with receipts.
- **"Repricing Epiphany" — per-outcome billing.** After surviving a race-to-the-bottom loss, unlock
  **value-metric pricing**: per email sent, per render, per GB restored. A premium revenue mode aimed
  squarely at the segments that hate paying for idle capacity — the lesson-to-mechanic pipeline in one
  node.
- **Tiered support as a product.** Discovered via churned-enterprise feedback: customers **will pay for
  support.** Bronze/silver/gold attach SLA response times to price and turn the support desk itself
  into a profit centre, with **cost-to-serve versus tier fee** as the live balance.

*Retention and Margin.*
- **The Churn Analytics dashboard.** Unlocked by hiring a data analyst (or by upgrading billing);
  reveals cohorts, usage-drop signals, and **why** customers leave — **before it is visible in MRR.**
  A late-game x-ray of your own business rather than of your infrastructure.

*Channel and Brand.*
- **Panel/API → the developer halo.** Shipping a public API unlocks **developer personas**: self-serve,
  low support, loud advocates. A visible *quality* change in who walks your roads, not just a volume
  change.

*Finance and scale.*
- **The Network Effects Node.** Late game, reaching N hosted sites in a region unlocks **peering and
  transit leverage**: your traffic becomes valuable to eyeball networks → settlement-free peering
  discount → lower COGS → **price cuts competitors cannot match.** Scale literally buys cheaper packets;
  it is the moat mechanic, and it should be the last thing unlocked on this tree.

### Branch ladders (the concrete step sequences)
Each branch is a legible ladder where every rung both raises a ceiling and adds a new failure mode.

**How it works:**
- **Availability:** `Monitoring` → `Alerting` → `On-Call` → `Runbooks` → `Postmortems` → `Error
  Budgets` → `Chaos Engineering` → `Multi-Region Active/Active`. **Gate:** you cannot build Error
  Budgets until you have percentile-based SLOs, which require distributed tracing, which require you to
  have suffered a gray failure. Alternate framing of the same ladder from the data side: `backups` →
  `tested backups` → `replicas` → `multi-AZ` → `multi-region` → `active-active`, where **each step
  multiplies cost and unlocks a higher SLA tier you can *sell*.**
- **Performance:** `Static Caching` → `Reverse Proxy` → `Object Cache` → `Cache Coalescing` → `CDN` →
  `Edge Compute` → `Anycast`. Parallel database line: `Query Log` → `Index Analysis` →
  `Connection Pooling` → `Read Replicas` → `Sharding`.
- **Security:** `Patching Cadence` → `Firewall` → `Bastion/VPN` → `MFA` → `Least Privilege` →
  `Segmentation` → `Zero Trust` → `Threat Hunting`. Parallel abuse line: `Abuse Desk` →
  `Egress Filtering` → `Behavioral Detection` → `SOC`. Gates the regulated business lines.
- **Resilience / Data:** `Backups` → `Offsite Copy` → `Restore Testing` → `Immutable/WORM` → `Air Gap`
  → `Cross-Region DR` → `Active/Active with RPO=0`. **Key gate: Restore Testing is required before
  anything downstream. Untested backups block the tree**, which is exactly right.
- **Facility:** `Rack & Stack` → `Metered PDU` → `Switched PDU` → `UPS` → `Generator` → `N+1 Cooling`
  → `Containment` → `2N Electrical` → `Liquid Cooling` → `Concurrently Maintainable (Tier III)` →
  `Fault Tolerant (Tier IV)`. **Each tier upgrade unlocks a customer class that requires it
  contractually.**
- **Density:** `blanking panels` → `containment` → `in-row cooling` → `rear-door HX` →
  `direct liquid` → `immersion`. Each step raises the kW-per-rack ceiling, which raises the revenue
  ceiling *and* the heat risk. The gateway branch for GPU/AI.
- **Network:** `Single Uplink` → `Dual Uplink` → `BGP + own ASN + IP space` → `RPKI` → `IX Peering` →
  `Private Network Interconnects` → `Anycast` → `Global Backbone (your own long-haul)`, with
  `your own dark fiber` as the terminal node. **Owning your own ASN and IP space is a genuine
  milestone** — the moment you stop being a customer of the internet and start being *part* of it. It
  should feel enormous, and it opens the BGP threat family as the price.
- **Automation:** `Shell Scripts` → `Config Management` → `Immutable Images` → `CI/CD` →
  `Infrastructure as Code` → `Self-Healing` → `Autoscaling`. **Each step converts toil (a recurring
  staff-hour drain) into capex plus blast radius.**
- **Commercial:** `Terms of Service` → `Billing System` → `Metered Billing` → `Self-Service Portal` →
  `API` → `Reseller Program` → `Marketplace`; and the contract-length ladder `hourly` → `monthly` →
  `annual` → `multi-year colo` → `reserved capacity` → `build-to-suit`, which **trades flexibility for
  predictability** at every step.
- **Compliance:** `Security Questionnaire Answers` → `Pen Test` → `SOC 2 Type I` → `Type II` →
  `PCI DSS` → `HIPAA` → `FedRAMP`, each unlocking bigger, slower, richer customers.
- **Efficiency:** PUE improvements → waste-heat reuse (**sell heat to a greenhouse or district
  heating — a real thing and a lovely late-game revenue line**) → on-site solar → **battery arbitrage**
  (charge cheap, discharge at peak — genuinely profitable and a fun dial).
- **Sustainability / Politics:** renewable PPAs → water-free cooling → community investment. **Unlocks
  permits in restrictive regions and deflects the community-opposition threat** — the only branch whose
  payoff is that a level is playable at all.

**Variations and additions**

- **The Observability Track, where each tier reveals a threat class.** `ping` → `logs` → `metrics` →
  `traces` → `AIOps anomaly detection`, and the defining rule is that **each rung reveals threats that
  were previously invisible** rather than merely improving a number. It is the Sense branch's ladder,
  and it is the one ladder whose reward is *seeing the other ladders' failures.*

### Cross-Branch Synergy Nodes
Powerful nodes that require progress in two branches.

**How it works:** Observability + Automation = **Auto-Remediation.** Security + Compliance =
**Certification.** Network + Storage = **Geo-Replication.** Sell + Sense = **Cost-to-Serve Pricing.**
Sense + Trust = **Honest Status Page.** Serve + Channel = **Partner Provisioning API.**
**Rewards breadth without punishing specialization**, because each synergy node has a cheap
single-branch substitute that's simply worse.
**Visual:** drawn as a node sitting on the *line between* two branches on the whiteboard, with both
branch colours bleeding into it.

**Variations and additions**

- **Adjacency synergies — discovered, not documented.** Some pairs do something special **when
  physically connected**: Honeypot + SIEM = attack replay; Backup + Orchestrator = one-click restore;
  Cache + CDN = origin-shield buff. Crucially they are **not listed anywhere** — you find one by
  running an in-world **"architecture review"** action, which pops an achievement and a diagram card.
  Undocumented synergies are the cheapest secret-hunting layer the tree can carry.

### Mutually Exclusive Forks
Some nodes lock out their sibling permanently for that run.

**How it works:** **"Managed Everything"** (higher revenue per customer, much higher support cost, you
own their problems) vs **"Roll Your Own"** (lower revenue, near-zero support, customers self-serve).
Similarly **Vertical Integration** (own the building) vs **Asset-Light** (lease everything), and
**Scale Up** vs **Scale Out**. Creates build identity and replay value, and makes the *second*
playthrough a different game.

**Variations and additions**

- **Hyperscaler versus boutique.** The coarsest specialization fork: committing to one unlocks a
  different set of late-game buildables entirely.
- **The proposed middle path.** Rather than locking whole capabilities, **specializations lock out
  *which specific counter-buildable* answers a threat** — flavour and identity — while **every branch
  still contains some counter to every major threat** (the Two-Solve-Paths rule). Needs playtesting,
  but it is the version that cannot soft-lock a run.
- **The open question that decides how punishing this feels:** are branches locked **for a full
  playthrough**, or **re-speccable**? The document should answer it explicitly, because the same fork
  is either an identity or a trap depending on which way it goes.

### Mutually Exclusive Doctrines (one per campaign act)
A coarser, more legible version of the fork, declared at act scale.

**How it works:** Pick one per act: **Fortress** (max defense, high latency, enterprise customers) vs
**Racetrack** (min latency, thin defense, consumer volume) vs **Sprawl** (many small cheap sites, no
single failure matters). Locks in identity, drives replay, and each one fails in its own characteristic
way, which is more interesting than a generic loss.

### The Doctrine card (a loadout you declare before a level)
The player-expression system the design otherwise lacks — and it is trivially cheap content.

**How it works:** Before each level you pick **one doctrine card** from those you've unlocked, and it
stays visible all level as a framed card on the office wall:
- **Belt and Braces** — +20% effectiveness on Recover-role builds, −10% on Capacity.
- **Fast and Loose** — deploys are 40% faster, bad-deploy chance +60%.
- **Sell the Sizzle** — +25% conversion, −15% headroom (marketing outruns ops).
- **Nobody Gets Paged** — automation effectiveness +30%, manual actions −20% speed.
- **Boring on Purpose** — entropy pressure −25%, growth rate −20%.
- **Scale Out / Scale Up** — mirrored modifiers to the §7.4 fork.
**Why it works:** it makes runs **readable to the player themselves** ("this is my Boring on Purpose
run"), gives the campaign a build identity without a skill tree, and gives the level-select screen
something to be about.
**Interacts with:** Mutually Exclusive Forks and Doctrines above, §9.1 modes.

**Variations and additions**

- **Doctrine Cards as permanent company rules (the soft tech tree).** The campaign-scale version:
  rules adopted **once, forever** — mixed-vendor policy, blue-green-only, patch-within-24h — that
  **alter global probabilities instead of unlocking objects.** They make **"how you work"** a
  progression surface rather than "what you have," and they pair naturally with the Board Meeting
  system, which is where a company would actually adopt one.

### Regret Nodes
Cheap early nodes that become actively harmful later.

**How it works:** A cheap shared-hosting control panel early becomes a per-account licence millstone at
scale (§4.10). The game doesn't lecture you; the postmortem later does. **Realistic, and it teaches
architecture.**
**⚔️ Tension:** pure fun-first design says never punish an early reasonable choice; the authenticity
lens says technical debt is the single most universal hosting experience. **Three-part resolution,
all needed:** (a) regret nodes are *escapable at a cost* — a migration project — rather than permanent;
(b) they are **visibly signposted as a short-term choice at purchase time**, not warned about but
*labelled*, the way a real shortcut is: **"Quick Setup (recommended for under 100 accounts)"** is
honest, tempting, and makes the later pain the player's own — **regret without signposting is just a
trap**; (c) the build card carries a small, honest, *non-specific* marker — a **"⚠ scales poorly"
chevron** — that tells an attentive player there is a cliff without telling them where. **Information
that rewards reading without removing the lesson.**

### Certification Gates
Some nodes require not money but *time and audit.*

**How it works:** You must operate cleanly for N days before the node opens at all. **Buys patience with
gameplay instead of a timer** — the clean days are something you are actively maintaining, not waiting
through.
**Interacts with:** §5.9's permission gates, §5.6's email-reputation gate.

### Rival Tech / Espionage
Observe a competitor's stack to unlock a copy at reduced research cost.

**How it works:** Slight ethical cost, small reputation risk if caught. See also Competitor Teardown
and Competitor Intel (§5.4) for the legal versions.

### Rediscovery / Prestige
On a new run, you keep a fraction of your knowledge.

**How it works:** Previously-unlocked nodes are cheaper but not free — the second company you build
knows things the first one learned. **Ties the meta-progression to the memoir framing**, and it is the
only honest way to make a roguelike loop out of a career.

**Variations and additions**

- **"Lessons Learned" as the meta-currency.** Earned on every level end — **more on losses** — and
  spent in a meta-skill loop on start-of-run perks: cheaper backups, +1 staff-hire cap, better starting
  reputation. The clean split it enforces: **within-level progression is the tech tree, between-level
  progression is the codex**, and the two must not substitute for each other.
- **Knowledge-base persistence.** Between levels, the knowledge base you built persists — **learned
  runbooks become permanent minor buffs** — so replaying an earlier hosting type is easier. The game
  remembers your scars even when the board resets.
- **Unlocks should recontextualize the past.** A major unlock offers an **optional replay of an earlier
  level** showing how differently it would have gone. The cheapest way to make a player *feel* their
  own growth rather than read it off a node count.

### Retired Tech (the tree keeps moving)
Old unlocks become obsolete each Act, so the tree does not simply accrete.

**How it works:** Prevents the late-game "I have everything" flatline by retiring the bottom of the tree
as the top grows. See §5.7 for the rot mechanics and the generation-band restructure that makes this
a decision rather than a chore.

### The Whiteboard Tree (the tree is a diegetic object)
Structurally worth stating here: **the tech tree is the whiteboard in your office**, so its shape is
allowed to be messy, hand-drawn, and annotated rather than a neat grid — and it must carry three things
a node graph can't: **the roads not taken** (passed-on unlock drafts, crossed out), **who knows what**
(face markers vs binder markers, §5.11), and **the generation bands** (§5.7). A board that shows your
history, your organisation's fragility and your technical age all at once is **the best single screen
in the game.** Full art direction in §5.8.

### The Dependency Atlas
**Discovering a tech draws a connection onto your board**, not just a node onto your tree.

**How it works:** Unlocking KMS draws the literal **key-supply lines** between everything that now
depends on it, which makes your topology — **and your attack graph** — visible in the same stroke.
Stated as a rule: **an unlock is new edges as much as new nodes**, and a tree that only ever adds
nodes is hiding the half of progression that actually kills you.
**Interacts with:** §5.4's Undocumented Dependency and the map of what-you-know-versus-what-is-true,
§5.7's EOL blocking-chain highlight, §5.5's Cross-Branch Synergy Nodes.

---
## 5.6 Unlocking whole lines of hosting business

*The brief's explicit ask: progression includes changing what kind of hosting company you are. A new
line is not a node — it is a **Ruleset Card** (§0.2) becoming available, with its own scarce resource,
unit of sale, threat mix, economics and look.*

### The prerequisite lattice
**Each new line is unlocked by having built the thing it actually depends on.** This is the most
satisfying structure in the whole document because the prerequisites are *real*.

**How it works:**
- **Anycast + 3 PoPs** → unlocks **DNS hosting**, then **CDN.** (Additionally: **a relationship with an
  IX or transit at each PoP** — so the CDN line is gated on the carrier branch, not just on hardware.)
- **Object storage + verified restores** → unlocks **Backup/DR**, then **Offsite Tape Vaulting**, then
  **Compliance/Archival** (which needs WORM, chain of custody and auditors on top).
- **Your own facility + power headroom** → unlocks **Colocation** (you become a landlord).
- **Power density + liquid cooling** → unlocks **GPU/AI compute.**
- **Low-latency network + high-clock nodes** → unlocks **Game server hosting.**
- **Clean IP reputation for 12 months** → unlocks **Email hosting.** *The hardest and best gate in the
  game: you must have been well-behaved for a year.* It additionally requires **reverse DNS control**,
  which requires **your own address space**, which requires the ASN/registry branch — so the email line
  depends on the network line, which is exactly right and gives the network branch a second payoff.
- **Compliance staff + network segmentation** → unlocks **Regulated hosting** (HIPAA/PCI/FedRAMP).
- **Legal budget + a risk tolerance setting** → unlocks **Bulletproof hosting**, and **the door locks
  behind you**: taking this line makes several reputable lines unavailable for the rest of the run.
- **Transcoding hardware + egress deals** → unlocks **Video/streaming.**
- **Kubernetes competence + multi-tenant isolation** → unlocks **Container platform / PaaS**, then
  **Serverless.**
- **DBA staff + backup verification** → unlocks **Database-as-a-Service.**
- **Carrier relationships + meet-me room** → unlocks **cross-connects as a product**, the
  highest-margin line in the game.
- **A scheduler + a fast interconnect** (on top of GPU) → unlocks **HPC / render farm.**

**Variations and additions**

- **The Product Ladder *is* the tech tree.** The commercial restatement of the lattice: a shared-hosting
  milestone unlocks hypervisors, which unlocks the VPS line — and the gate on each product type's core
  unlock is **having operated the previous one profitably**, not merely having paid for it. Profit, not
  purchase, is the prerequisite; it makes the lattice a business document rather than a shopping list.

### The commercial prerequisites
The technical prerequisites are the strongest structural idea in the section — and they are only half
the gate. The commercial ones bind just as hard in reality.

**How it works:**
- **Regulated hosting** also needs cyber insurance at required limits, a legal budget, a compliance
  officer, background-checked staff, **and 12 months of clean auditable history** — most frameworks
  audit a *period* (a Type II report covers 6–12 months of evidence), so **you must have been compliant
  for longer than you wanted to be.** You cannot buy your way in this quarter. **A prerequisite measured
  in months of good behaviour**, the same beautiful gate as the email one.
- **Enterprise / government** needs an MSA template, the ability to accept net-60 terms, a reference
  program, and a supplier-registration capability.
- **Colocation landlord** needs a lease you can sublet or a building you own, **an insurance program**
  (your tenants will demand certificates), and a security/escort capability.
- **GPU** needs an OEM allocation relationship and a way to finance the hardware — **the capital
  structure is the gate, not the cooling.**
- **Reseller / agent channel** needs a commission portal and a quotable rate card.
- **Wholesale / build-to-suit** needs multi-MW capacity and a credit-worthy balance sheet.

### Alternative prerequisite sets (two or three routes into every line)
**⚔️ Tension, resolved:** a strict DAG of line unlocks risks becoming a single optimal path, which
violates §9.6's "no optimal build order."

**How it works:** Give each line **two or three alternative prerequisite sets.** Email hosting: "12
months clean IP reputation" **OR** "acquire a company that has one" **OR** "hire a deliverability
specialist from a large provider and accept a longer warm-up." Colo: "own a facility" **OR** "sublease
a suite from your own landlord." GPU: "build the power" **OR** "take over a crypto tenant's abandoned
high-density space" (a beautiful link to §1.3's crypto ruins). **Alternative prerequisites are cheap to
author and they are what turns a lattice into a decision.**

### The visible lattice, with readable locks
Show the lattice as **a map with locked doors whose conditions are readable from the start.**

**How it works:** Knowing that email hosting needs twelve clean months is what makes those twelve months
*meaningful while you are living them.* A hidden prerequisite is a surprise; a visible one is a plan.
**Add partial prerequisites:** you can open a line at **60% readiness for a penalty** — worse margins,
more incidents, and a permanent **"we launched early" scar** on the line's placard — which gives the
impatient player a real option with a real cost rather than a wall.

### The playable 12 months (making the best gate interactive)
A 12-month gate with no interaction is just a timer. Make the twelve months *played.*

**How it works:** A visible reputation meter that **individual decisions move**: accepting a marginal
customer nudges it down, an outbound spam incident dents it, a slow abuse response bleeds it, a clean
month with proactive filtering builds it. Then the email gate is something you are **actively
maintaining** rather than waiting through, and unlocking email feels **earned rather than survived.**
The same treatment applies to the regulated line's audit period and to Certification Gates generally.

### The Pivot Lattice (what a pivot actually costs)
Making `Pivot` a structured, costed decision rather than a research purchase.

**How it works:** Every line-to-line transition is rated on four axes — **customer overlap** (can you
sell the new thing to the people you already have?), **hardware reuse**, **staff skill transfer**, and
**regulatory delta.** Cheap pivots: shared → VPS (same customers, same staff, hardware reuses); backup
→ object storage (same hardware, adjacent customers); colo → managed (same building, new staff);
dedicated → GPU (new hardware, same customers, new power). Expensive pivots: anything → VoIP (an
entirely new regulatory regime); anything → regulated (an audit-history requirement money cannot
shorten); GPU → anything (your capital is sunk in cards that only do one thing); bulletproof →
anything reputable (the door locked behind you).
**And the honest part:** during any pivot you pay for **both** lines through the overlap period — the
old line's leases, licences, staff and contracts run to term while the new line is funded from scratch.
**The Pivot level should have two P&Ls on screen, one shrinking and one growing, with a combined cost
line above both that is higher than either.**

### The line catalogue (every pivot, its gate, and what it does to you)
Each entry is a full ruleset change with its own economics, threats and visual identity.

**How it works:**
- **Shared → VPS** — gate: virtualization + provisioning automation + metered billing, plus a customer
  outgrowing shared. Lower volume, higher ARPU, lower support, higher capex. Risk: outbound abuse from
  your own tenants is now your problem.
- **VPS → Dedicated / Bare Metal** — gate: PXE provisioning, a spares depot, IPMI fleet management, and
  a vendor credit line. Higher ARPU, inventory risk, remote hands become a cost centre.
- **Dedicated → Colo** — gate: more rack space than servers. *You start renting out what you already
  pay for.* **The most natural and most real pivot in the industry.** Risk: you lose control of what is
  inside the cabinet, and your uptime now depends on other people's hardware.
- **Colo → Wholesale / Build-to-Suit** — gate: filling a building, a power allocation, a credit-worthy
  balance sheet. You stop having thousands of customers and have four, each enormous. **The entire risk
  profile inverts from abuse management to concentration risk**, and the game becomes construction and
  contracts. A legitimate endgame act break.
- **Anything → Managed** — gate: a Tier-2 support desk. Layer services on top of iron: **doubles revenue
  per customer and triples ticket volume.** You stop selling infrastructure and start selling *labor*;
  margins improve but **headcount becomes the constraint instead of hardware**, and the staff layer
  becomes the product.
- **Hosting → Backup/DR** — gate: storage plus offsite capacity plus retention policy and restore
  testing — and, most authentically, **a trauma** (your own data loss, or a customer's ransomware
  event). Countercyclical, recession-proof, near-zero churn: **the classic "stabilize the business"
  pivot.** New SLA vocabulary: RPO/RTO instead of uptime %.
- **Hosting → CDN / Edge** — gate: multi-PoP presence + anycast + peering. Synergy: **makes every other
  product you sell faster.** Leans entirely on the cache-hit economy.
- **Hosting → Email / DNS** — gate: IP reputation management + anycast + an abuse desk + deliverability
  tooling. **DNS is the cheapest sticky product in hosting.** **The email trap: it looks adjacent and
  it is a completely different business** — one spammer poisons everything, and it unlocks the whole
  Reputation subsystem as a permanent new concern.
- **Hosting → GPU / AI** — gate: power density, a cooling retrofit, capital, and a **vendor
  allocation.** Highest revenue, highest volatility, **the highest-risk pivot in the game** — enormous
  capex, and the market can crater under you. Requires abandoning your cost discipline.
- **GPU → HPC / Render** — gate: a scheduler and an interconnect. A quieter, stickier, lower-margin
  sibling that survives an AI winter.
- **Hosting → Game Servers** — gate: DDoS scrubbing + low-latency network + a **community marketing
  presence.** Cheap to enter, seasonal, fraud-heavy, and the customers are the loudest in the game.
- **Hosting → Regulated** — gate: the Compliance Office + an audit + operational history. Slow, sticky,
  expensive, prestigious. **The mirror of Bulletproof.**
- **Hosting → Bulletproof** — gate: **choosing to.** Needs no technology at all, only a decision.
  Instant, lucrative, contaminating. **Immediately profitable, slowly fatal — the most interesting
  unlock in the game because its cost is entirely downstream.** Must carry a one-way-door warning and
  a permanent campaign flag.
- **Hosting → Reseller Platform / White Label** — gate: automation maturity. **Turns competitors into
  customers**, which is a beautiful strategic idea the game should let players *find* rather than be
  told.
- **Hosting → Transit / Carrier / IP Leasing** — gate: ASN + surplus capacity. You become someone else's
  upstream, sell your COGS advantage to smaller hosts, lease unused IPv4 — **and inherit all the
  abuse-desk duties that implies**, including other people's spam being your reputation.
- **Hosting → Software** — gate: having built your own control panel. License it to other hosts. **The
  highest-margin pivot available and a real industry path**; changes the revenue model from capacity to
  licenses. A meta-unlock: the game stops being about servers.
- **Hosting → MSP / Professional Services** — sell people instead of machines. Lower margin, lower
  capex, stabilizes revenue, hardest to scale.
- **Shared/VPS → Container platform / PaaS → Serverless** — gate: Kubernetes competence and
  multi-tenant isolation. Each step abstracts the customer further from the metal and moves the failure
  modes into your own control plane.
- **Regional → Multi-region → Global** — not a product change but a shape change; **each step multiplies
  coordination cost** and adds a timezone of staff.
- **Operator → Acquirer** — gate: a credit facility. You stop building customers and start buying them,
  and the Migration Attrition model becomes your central mechanic.
- **Operator → Landlord → REIT** — the endgame financial pivot: your company becomes a real-estate
  asset with a cap rate, and **your score changes from EBITDA to NOI.** The most complete
  transformation of the game's own win condition available.

### The Adjacent Opportunity
The game *proactively offers* the next line when you're structurally ready.

**How it works:** An event card: "You have 400TB of unused storage and three customers have asked about
backups. Open a Backup line? (Cost: X, Time: Y)." **Growth by noticing**, which is exactly how real
hosting companies diversify.

### Discovery by Customer Request (the customer is the tech tree)
An existing client asks for something adjacent.

**How it works:** Saying yes opens the research node at a discount *and* guarantees the first customer
of the new line. Saying no is free, but the client may leave for a provider who does both — and the
game should show you, two levels later, that they did.

### Repurposing
Retired hardware seeds a cheaper new line.

**How it works:** Your obsolete dedicated servers become the first fleet of a budget VPS line or a
seedbox line. **Ties the obsolescence clock to progression** — the depreciation curve becomes a feature
rather than a tax. **Complete the cascade commercially:** the last step isn't scrap, it's **ITAD with
residual value and a certificate of destruction**, and that residual is a real, forecastable line of
cash that funds the next generation. **A game where old hardware pays for new hardware** makes
depreciation feel like a strategy.
**Interacts with:** §6.6's obsolescence clock and cascade down-tier — the same idea from two directions;
they should cross-reference.

### Type Mastery / cross-line buffs
Running a hosting type well earns a permanent cross-line bonus.

**How it works:** Mastering Game Hosting grants a permanent latency bonus everywhere. Mastering Backup
grants a durability bonus everywhere. Mastering Colo grants a facility-efficiency bonus. **Encourages
trying all the types without forcing it**, and it explains why the veteran operator is better at the
*next* thing.

**Variations and additions**

- **A Mastery track per *buildable*, separate from the tech tree.** Using a specific buildable
  repeatedly and successfully grants **small passive bonuses to that object specifically** — a
  parallel, granular progression that runs underneath the tree. It **explicitly excludes Temporary and
  Emergency buildables**, so their deliberate cost-inefficiency is never quietly undercut by mastery.

### Retiring a line, and the knowledge you keep (the distillate)
Shutting something down should be a **progression event**, not pure loss.

**How it works:** When you divest or close a hosting line (§5.7's Abandoned Wing), you keep a
**distillate**: one permanent cross-line bonus derived from what the line taught you. Closing your
backup line permanently improves durability everywhere; closing a game-hosting line leaves you
permanently better at latency.
**Why it works:** rot and divestiture are otherwise all downside, which means players will never
voluntarily shrink — and **"shrink deliberately" should be a winning move** (§3.9 says so explicitly
and then gives it no reward). This is the reward.

### The Certification Ladder
Compliance certs are themselves a progression track.

**How it works:** SOC 2 Type I → Type II → ISO 27001 → PCI DSS → HIPAA BAA → FedRAMP. Each takes real
in-game months, costs money and staff-hands, requires clean operational history, and **unlocks a
customer tier that literally cannot buy from you without it.** The audit is a playable scenario (§1.5).
Full accreditation roster in §5.9.

**Variations and additions**

- **Publish the gate table, and name the threats each badge buys.** Every cert should state its
  requirement set explicitly — *ISO 27001 = {audit pass, 90-day clean log, bastion + HSM built}* — and
  **name the two threats it *gains* you** (regulator walk-by enabled, breach-notification timers
  enabled). The attack-surface-preview rule, applied to paperwork: **an unlock is an opportunity and a
  new surface, pre-telegraphed.**
- **The Certification Ladder, reversed (compliance as subtraction).** In the regulated branch some
  unlocks are **losses**: after the audit, "Telnet" greys out forever, "console access from home" dies,
  "quick reboot without a change ticket" is gone. **A negative tech tree** — *what did I used to be
  able to do?* — and the freshest way in the document to make paperwork emotional: compliance should
  feel like safety and loss at the same time.
- **The Certification Exam.** Certifications are not only built, they are **taken**: a timed,
  closed-book quiz **generated from your own live architecture** — *"show me where customer X's data
  rests; how many people have root?"* — so **studying your own estate is the prep.** Pass for the badge
  and the regulated customer pool; fail for a retake cooldown.
- **Badge earned ≠ badge kept.** **Annual re-attestation** folds into the Exam as a small timed audit,
  which is what stops set-and-forget compliance.
- **Compliance gated by requests (how you find out you need it).** A lost enterprise deal triggers
  **"security questionnaire received"** — open it, read what certs they demand, and the compliance
  stack becomes visible. Real: nobody pursues SOC 2 until they lose deals to it.
- **SOC 2 Type II as a sustained project.** Type I is a badge; **Type II is a 6–12 in-game-month
  sustained-compliance project where every lapse restarts the clock**, and the sales unlock lags
  accordingly. The most accurate possible model of how enterprise deals are actually gated.
- **PCI as the other door.** The same shape, a different customer class: PCI unlocks the e-commerce
  segment — higher plan values, more breach exposure — which teaches that **compliance is a set of
  segment doors**, not a single quality bar.
- **Earned by build composition, not by tech points.** *"Hold 99.95% for three waves with full audit
  logging"* **earns** the badge. Progression as demonstrated competence in-fiction.
- **Certs impose build restrictions.** Each cert in the chain **takes options away**: no shared admin,
  retention required. Progression = market access, paid for in flexibility.
- **Certs as doors, not buffs.** Some tech is **legal-gated rather than research-gated**: government
  hosting unlocks only once the compliance tower exists; the KSK ceremony tech only after DNSSEC
  training.
- **Evidence-based chains, and failed audits as maps.** Nobody hands you SOC 2 — you unlock it by
  surviving X months with audit-ready monitoring and documented policies **that are objects you had to
  build.** And **a failed audit *discovers* your gaps**: it reveals a branch of what you must build
  next, which makes failing an audit a progression event rather than a dead end.
- **Cert badges as mini-levels.** Each cert is **a playable audit scenario**; passing it unlocks the
  enterprise customer class permanently.
- **Gated by trust tiers, not by money.** The strongest framing: regulated and enterprise customers —
  and their buildables — unlock by **reputation milestones**. *Trust is the real tech tree;* reputation
  gates whales, and whales gate the endgame.
- **Visual — certifications gate the grid.** Certs appear as **framed stamps that physically unlock
  entire customer classes at the gate**: the regulated enterprise golem simply **cannot enter** until
  the stamp is on the wall, and **you watch the customer read the wall and walk in.**

### The certification chain — *CONFLICTING*

Both documents make compliance certifications a gated ladder. They disagree on **whether there is one
canonical order at all**, and if so which — a question that decides whether the regulated branch is a
linear campaign spine or a fan of independent doors.

#### Position A — one canonical chain, paced by evidence periods *(master)*

`SOC 2 Type I → Type II → ISO 27001 → PCI DSS → HIPAA BAA → FedRAMP`, with the compliance branch ladder
stated as `Security Questionnaire Answers → Pen Test → SOC 2 Type I → Type II → PCI DSS → HIPAA →
FedRAMP`. Each rung takes real in-game months, costs money and staff-hands, requires clean operational
history, and **unlocks a customer tier that literally cannot buy from you without it.** The pacing comes
from the *evidence period* rather than from the ordering — Type I is point-in-time and fast, Type II
requires 6–12 months of evidence and is slow — which is what makes the two-stage enterprise unlock
pace the mid-game. The audit is a playable scenario.

#### Position B — five competing chains, one of which denies the chain *(opencode)*

- **Variant A — `ISO27001 → SOC2 → HIPAA → FedRAMP`**, the single linear chain, each rung needing an
  audit-passed level plus paperwork buildables.
- **Variant B — `SOC2 → HIPAA → ISO27001 → FedRAMP`**, earned by **build composition** ("hold 99.95%
  for three waves with full audit logging") rather than by tech points.
- **Variant C — `TLS discipline → PCI awareness → ISO 27001 → SOC 2 → HIPAA`**, each rung gating
  customer types and requiring **staff-training investments** as well as infrastructure.
- **Variant D — `ISO 27001 → SOC2 → HIPAA → FedRAMP` in strict dependency order, but each cert imposes
  build restrictions** (no shared admin, retention required): progression is market access bought with
  flexibility.
- **Variant E — no chain at all.** Certs are **independent segment doors**: SOC 2 → enterprise
  customers, HIPAA → hospital whales, PCI → e-commerce tiers, ISO → EU government deals. *"Compliance
  is a set of segment doors"; "certs as doors, not buffs."*

### Carrier & Peering unlocks
Network progression as its own ladder and its own set of business lines.

**How it works:** Single transit → dual transit → IX port → private peering → your own ASN and /24 →
anycast → global anycast. Each step cuts transit cost, adds resilience, and opens a line above it —
and the terminal steps turn the network itself into a product (transit resale, IP leasing,
cross-connects).

**Variations and additions**

- **Network-tier milestone trees.** The ladder restated as milestones that **reshape what can reach
  you**: own ASN (the BGP play opens) → RPKI → anycast (**only after 3+ locations**, at which point the
  world map becomes a tower-placement board). Each rung changes the threat surface, not just the cost
  line.
- **The IX Peering Discovery.** The trigger that makes the branch appear at all: **once your transit
  bill passes X% of revenue**, a "peering exchange" icon appears on the map and the network-economics
  branch opens. The bill is the teacher.
- **The PeeringDB Profile.** A listing that makes **other networks find you** — passive attraction of
  settlement-free peers, with your transit bill ticking down over several levels. And the honest cost:
  it also makes you visible **to exactly the wrong actors** in a bulletproof arc, because your abuse
  contact is public. Unlock = opportunity plus exposure.
- **The Network Effects endgame.** At sufficient regional density your traffic becomes valuable to
  eyeball networks, converting peering leverage into **a COGS advantage competitors cannot price
  against** (see also the CEO branches, §5.5).

### The Era Unlock
Progression through *time*, not just scale.

**How it works:** The campaign moves through eras (§0.4); each era makes some lines obsolete and opens
others. **Dial-up ISP → shared hosting → VPS → cloud → GPU.** Surviving a transition is its own
achievement; failing to transition is a real lose condition (§6.10's Obsolescence).
**Visual:** the era shift changes the whole palette and UI chrome — see §8.10.

**Variations and additions**

- **Era and scenario unlocks delivered as story.** Tie the era beats to narrative: **your first GPU
  order arrives after the ML-boom story event**, so a new mechanic lands *as a story beat* rather than
  as a menu dump. The rule generalizes — no ruleset should ever arrive as a notification.

### Geography unlocks
Entering a new region unlocks region-specific capability.

**How it works:** Free cooling in the north, solar in the desert, hydro power, a subsea cable landing, a
tax abatement, a power queue you can join early. Each region also brings its own regulatory regime and
its own community-opposition risk, so geography is a branch with a politics tax.

**Variations and additions**

- **The international entity.** Opening a local company or reseller in another region unlocks regional
  customers — **data residency satisfied, local payment methods available** (PIX in Brazil, iDEAL in
  the Netherlands; the real list is a puzzle in itself) — and **doubles your tax and compliance
  surface.** Geography bought with paperwork.
- **Support Locales.** A second-language support desk unlocks **whole regional pools** (and the retro
  ISP arc gets a localized '98 level). The cost is a real tradeoff: offshore-hire arbitrage versus
  quality perception, because **customers detect robotic answers** and churn in a micro-event unless
  the tier is genuinely staffed.

### The Reputation Gate (both directions)
Reputation opens and closes lines.

**How it works:** High reputation unlocks enterprise, regulated and government lines. Low reputation
locks them and unlocks the **grey lines** — bulletproof, no-questions-asked, unmetered-everything —
which pay better and cost you everything else. **A two-directional tech tree** is unusual and thematic:
the tree grows in whichever direction your behaviour points it.

### Portfolio unlocks
Running multiple lines unlocks portfolio-level tools.

**How it works:** Two lines → the Portfolio Meter (§0.2). Three → the Line P&L view (§6.8). Four → the
Cross-Sell engine and the Synergy/Antagonism map. Five → **"What Are We Even"**, the identity stat, and
with it the Focus decision: divest a line for cash and a specialization bonus.

### The Forbidden Branch (the dark-web market and the tech you cannot unlearn)
A branch that unlocks in the offshore arc and **locks doors behind you.**

**How it works:** The Dark Web Market sells things no vendor will: **zero-days** (offence!), **bribes**
(defuse a subpoena!), **rented botnets** (traffic!). Each purchase raises a **heat meter** — permanent
and damning. The branch's defining property is asymmetry: **bulletproof-track upgrades (fast
re-provision after seizure, traffic obfuscation) are *unlearnable* if you go legit**, so the morality
tree does not merely branch, it **closes**.

**Variations and additions**

- **Dark-web intel — the enemy is also the merchant.** Buying intel on upcoming exploit kits pre-warns
  the next zero-day, but **the vendor is an attacker too**: a trust meter, or you are funding the
  enemy.
- **The Zero-Day Broker.** Purchasable foreknowledge of next level's threat family from a shady NPC —
  **who also leaks your defences.** Knowledge with a tail risk.
- **Purchasable threat-intel feeds.** The legitimate-looking version: the feed pre-announces coming
  waves for a price, **sometimes carries misinformation**, and unlocks proactive blocklist towers.
- **The Offshore Branch (the moment of temptation).** At a point of heavy abuse-takedown pressure, a
  shady consultant offers an **offshore reseller arrangement** — the bulletproof line with inverted
  reputation mechanics. Optional, and it should arrive when you are losing.
**Interacts with:** §5.6's Reputation Gate (both directions) and the Hosting → Bulletproof pivot,
§5.7's accreditation-loss rule.

---
## 5.7 Anti-unlocks, deprecation, and rot

### The Deprecation Mechanic
**A tech tree that rots.**

**How it works:** Things you unlocked years ago go **yellow (aging)** then **red (EOL)**. An EOL item
still works but attracts vulnerabilities, fails audits, and blocks newer nodes that depend on a modern
base. Upgrading costs a migration project with downtime risk. **Progression that requires maintenance
is the single most authentic idea about running infrastructure**, and no tower-defense game does it.

**⚔️ Tension (and its resolution): per-node rot is a chore, not a decision.** Rot applied to each of a
120-node tree individually is forty small maintenance tasks with no strategy in them, and it also reads
as the game taking things away. **Restructure to technology *generations*, not nodes:** your whole
"2019 platform" ages together and is shown as a single **generation band** across the tree.
Modernising is **one project per generation** — a cost, a duration, a downtime risk, a benefit. Then
rot is a recurring strategic decision three or four times a campaign instead of forty chores. Rot also
remains **visible years in advance** on the band itself, and the Sustain branch contains nodes that
slow it.

**The specific EOL that actually hurts** (because "attracts vulnerabilities" is too abstract): **the
unsupported version blocks something else.** You cannot get the new feature, the compliance control,
the required TLS version, the driver for the new hardware, or the security patch, because the base
you're on doesn't support it — **a piece of rot in one place freezes progress in three others.**
**Visual:** hovering an EOL node **highlights everything it is now blocking**, with dependency chains
greying out along the board. Far more motivating than a slowly rising vulnerability number, and exactly
how legacy debt actually constrains a company.

### Concerns ratchet, implementations rot, eras gate
**⚔️ Tension resolved:** three rules about the same axis that appear to contradict — §1.6 says earlier
mechanics never go away, §5.7 says nodes rot to EOL, §7.8 says whole branches are era-locked.

**How it works:** Distinguish *concerns* from *implementations*. **Concerns ratchet** — once power is a
concern, it is always a concern. **Implementations rot** — this specific switch, panel, protocol or
vendor ages out. **Eras gate implementations, never concerns.** Stated that way, all three rules
coexist cleanly: **you will always have to think about power; you will not always use this PDU.**

### Product rot (commercial deprecation, which is worse)
Tech nodes rotting is good. **Products rot too, and it costs more.**

**How it works:** A plan you sold in 2019, with features you no longer offer, on a platform you no
longer maintain, to customers who will not migrate. Every host carries these. Deprecating it is a whole
scenario (the Sunset Letter level): notice periods, grandfathering, a migration path, and a churn spike
you have to price in advance. **Product debt is more expensive than technical debt because it has
customers attached to it** — and it is a better fit for the Legacy Box theme than a server is.
**Interacts with:** §5.12's Deprecation Notice You Wrote (announcing an EOL unlocks migration tooling).

### The accreditation-loss rule
Generalize the lapsed-certification mechanic into a law.

**How it works:** **An accreditation loss doesn't break what you have — it stops what's next.** Existing
contracts survive to term; no new ones can be signed. Re-certification costs more than maintenance
would have. The same shape applies to a lapsed cert, an insurance lapse, a peering loss, a marketplace
delisting, and losing a platform recommendation. A slow, visible, fair failure mode entirely in keeping
with §6.10's soft-over-hard rule.

### Lapsed certification
Let a cert expire and you lose the customer tier it unlocked.

**How it works:** Existing contracts survive to term; no new ones. Re-certification costs more than
maintenance would have.
**Visual:** framed certificates go crooked and dusty, and the wax seals on the lobby wall visibly
**tarnish** — so the certification wall doubles as a to-do list (§5.8).

### Losing insurability
A claim history or a failed underwriting questionnaire.

**How it works:** Cascades: losing cover locks the **enterprise customer tier that contractually
requires you to carry it.** The three-link chain from §5.9 (security investment → insurance →
enterprise customers) runs backwards just as cleanly.

### Losing peering
A ratio dispute or a de-peering removes an unlock you'd earned.

**How it works:** Your transit costs jump overnight and a latency advantage you'd been selling
evaporates. The counterparty is an NPC with a grudge and a spreadsheet.

### Losing a brand
A trademark dispute, or a sale with a non-compete, removes a storefront.

**How it works:** The brand's customers do not automatically move to your other brand — you have to
win them again.

### Losing the recommended-host slot
One bad quarter of support metrics and a platform's "recommended hosting" page drops you.

**How it works:** The single largest acquisition channel in shared hosting disappears, and the drop
shows up in signups four weeks later, not immediately.

### Losing your acquirer relationship
A payment processor exits your vertical or terminates you.

**How it works:** The card-payment node **locks** until you requalify under a new entity — which means
new underwriting, new reserves, and possibly a new corporate structure. One of the fastest ways to kill
a healthy hosting company.

### The commission residual you can never stop paying
An anti-unlock that is a permanent margin tax you accepted years ago.

**How it works:** An agent sold you a book of business on residual terms; you pay a slice of that
revenue forever, including on customers they have not spoken to since. It cannot be undone, only
bought out — expensively — and it is the clearest illustration in the game that **some decisions are
permanent liabilities rather than temporary costs.**

### Three SLA breaches
The premium tier locks.

**How it works:** You cannot sell the 99.99% product until you've earned it back over N clean months.
**The SLA is a privilege you can lose.**

### Burned affiliate relationships
Late payments or clawbacks make a channel refuse you.

**How it works:** The channel node greys out with a note. Re-earning it requires better terms than you
had before.

### Fired the CSM / cut the content team
Cutting costs removes a capability, on a delay.

**How it works:** Firing the customer success manager removes proactive retention; the churn curve
steepens two months later, not immediately (§7.5's 90-day lag). Cutting content marketing decays the
organic acquisition channel over a quarter. **The lag is the lesson:** the saving is visible this month
and the damage is visible next quarter, which is exactly why real companies keep doing it.

### Knowledge decay
Runbooks rot if not exercised.

**How it works:** A runbook not used in N months loses its MTTR bonus until a drill refreshes it.
**Justifies the drill mechanic** and punishes set-and-forget play. Ties directly to §5.12's Sealed
Capability, which re-hollows after N months without exercise.
**Visual:** binder spines fade and warp; the whiteboard's knowledge nodes drop to a **faded blue**
marker.

### The Abandoned Wing
Divested or obsolete lines don't vanish — they go dark.

**Visual (specified):** dust sheets over racks; a cordon of retractable belt barriers; floor paint faded
and scuffed; the line's accent hue drained to 15% saturation; **one working light on a motion sensor
that turns on when your camera enters and off when it leaves.** No sound but the building's. **A
melancholy, characterful representation of the road not taken**, a reminder that you used to do this,
**the best screenshot in the game, and it costs almost nothing.** It deserves to be one of the game's
best-looking spaces because it is the emotional counterweight to everything else the player builds.

### The Rot Materials
Deprecation described in colour only violates the design's own "never colour alone" law.

**Visual:** four material states, applied to the tree node **and** to the real object on the board:
- **Current** — clean.
- **Aging** — a small **"EOL 20XX" sticker** applied, corner peeling.
- **EOL** — the sticker is now a **large orange band across the faceplate**, and the object's LEDs run
  at a slightly different colour temperature from its neighbours.
- **Abandoned** — dust sheet, cordon post, one red standby pip.
**Rot you can see across the room without an overlay.**

---
## 5.8 Unlock presentation and payoff

*Unlocks should be **objects**, not toast notifications. The house style: nothing is a pop-up if it can
be a thing in the world.*

### The Unlock Ceremony Tiers
A stated ceremony budget, because eight unlock presentations with no rule for which to use is how you
get unlock fatigue.

**How it works:** Four weights, assigned by cost:
- **Tier 0 — a tuning option:** a soft chime and the control appears. 0.2s.
- **Tier 1 — a small build:** the Faceplate Reveal wipe. 1s, no camera move.
- **Tier 2 — a major build or research node:** The Delivery cutscene or a Whiteboard Redraw. 6–10s,
  skippable.
- **Tier 3 — a new hosting line, a tier-up, an era change:** full ceremony — title card, placard
  mounting, floor-plan redraw, palette shift. 15–20s, skippable but nobody will.
**A stated ceremony budget is what stops unlock fatigue.**

### The Whiteboard Tree / The Tech Wall
The tech tree is a hand-drawn whiteboard and corkboard in the office — not a node graph floating in
space.

**Visual:** marker strokes, smudges, coffee rings, a "DO NOT ERASE" note in the corner, printed spec
sheets, torn catalog pages, Polaroids, and string connecting them. Locked items are face-down or
censored; hovering flips them. Unlocking redraws a section in a satisfying hand-drawn line-on
animation. Staff hires *draw their own nodes onto it* (§5.4), each in their own handwriting. It is
diegetic, it is charming, and it scales because you can pan a physical board.

**Variations and additions**

- **Blueprint Graduation (the pinboard form).** The same object drawn as **an engineer's pinboard**:
  strings, index cards, coffee rings — and **new branches are literally pinned on** as they open, so
  the animation of unlocking is someone reaching past the camera with a pin.

### The Marker Colour Code
Three marker colours with no assignment is a wasted system.

**Visual:** **Black** = things that exist. **Blue** = things you're planning. **Red** = things that hurt
you (the Scar nodes). **Green** = things that worked. A fourth, **faded blue**, is knowledge that
decayed (§5.7). **The *hand* matters too:** system-drawn nodes are neat; staff-drawn nodes are in a
visibly different handwriting, and when that person leaves their strokes fade to 40% but never erase.

### The Whiteboard at Scale
A 300-node tech tree does not fit on a whiteboard — so let the board grow.

**Visual:** one board at Tier 1; a second wheeled in beside it at Tier 3; by Tier 5 it is a wall of four
boards plus taped-on A3 printouts plus **a photographed section pinned over an erased area.** Navigation
is pan/zoom on the wall; branches cluster by marker colour. **The tree's unreadability is authored and
characterful rather than accidental.** A **"clean copy"** action costs a staff hand and redraws the
board as a neat blueprint — which stays neat for about ten minutes before annotations start again.
**Documentation as Sisyphus, rendered**, and a joke the audience will get.

### Blueprint Export as a Reward
High-scoring level completions unlock a printable-looking one-page schematic of your final build.

**Visual:** rendered in cyanotype, with your company mark, the date range, and the scar count. **An
unlock whose reward is *a picture of what you did*** — and the single cheapest shareable artifact the
game can produce.

### The Blueprint Tube
Major unlocks arrive as a rolled blueprint in a cardboard tube that you **physically unroll** with a
drag gesture.

**Visual:** the reveal is worth the two seconds, and it gives the player something to *do* at the moment
of reward instead of clicking OK.

### Rack Elevation Catalog
The buildables catalogue is a vendor PDF.

**Visual:** a spec-sheet page per item with a front-panel illustration, dimensions, power draw and a
pull-quote. **Locked items are blacked out like a redacted document.** **Era-locked items are not
redacted but *absent, with the page numbering skipping*** — a gap in the catalogue that says "this does
not exist yet," which is a different and better feeling than "you can't afford it."

### Rack Mail — "The Catalog"
A glossy vendor catalog arrives periodically and you flip through it with a page-turn animation.

**Visual:** new gear appears here *before* it's affordable, so you **window shop.** Era shading applies:
a 1998 catalog is newsprint, a 2024 one is a web configurator, a 1994 one is a fax.

### The Trade Show Floor
An unlockable hub screen: a convention hall with vendor booths you walk between.

**Visual:** each booth demos one buildable with a little looping animation; talking to a vendor unlocks
a trial (§5.4). **It's a *place*, which makes browsing tech feel like an event** rather than opening a
menu.

**Variations and additions**

- **The Vendor Trade Show as a periodic event.** Booths **wander in as little tents**; you get **one
  purchase token** for the whole fair; there is **swag physics** (slappable stress balls); and the
  **"enterprise lunch" buys time** — accepting it extends the fair. A place *and* a resource puzzle.
- **Trade Show Interstitials.** The cheap between-levels version: a small vendor-show scene with
  **three clickable stands per era**, revealing exotic buildables and joke items — and **the booth
  flyers become the in-game tooltips** for whatever you saw there, which is the best tooltip
  provenance in the design.

### The Lab Bench / Research Bench
A physical R&D area in your facility.

**Visual:** a workbench, an oscilloscope, a test rig, a captured specimen under a glass dome, a
microscope, pinned printouts, and a rack of labelled sample jars. Research in progress is visible as a
**half-assembled thing on the bench with a progress scrub** — **you can see what you're working on from
across the room.** Spending Intel plays a short assembly animation here.

**Variations and additions**

- **Research reads as a half-built device.** The progress indicator should be the object itself: a
  staff member tinkering at the bench while **a half-assembled device visibly completes** — the
  **antenna going on is the wireless unlock.** No bar, no percentage; you can read the research queue
  from across the room by looking at what is on the bench.

### Floorplan Blueprint
Facility unlocks appear as new rooms drawn onto an architectural plan.

**Visual:** blue paper, white linework, a title block in the corner with your company name and a
**revision number that increments each time you expand.** **The revision number is a progress bar you
never had to design.**

### The Pegboard (specified)
A shadow board of tools in the workshop — **the best "what am I missing" UI available.**

**Visual:** unowned tools are **painted silhouettes**; owned tools **hang in their outlines**; a tool
**currently in use is missing from its outline** (a staff member has it), which doubles as a hands
readout; tools you owned and lost — fired staff, divested lines — leave their outline and **a small
dusty hook.** **Absence rendered three different ways, all readable.**

### The PCB Trace Tree (alternate unlock skin)
For players who want a conventional tech tree.

**Visual:** a green PCB where unlocked nodes are solder pads that light and traces carry a visible
current to the next node. **Locked branches are unpopulated footprints with silkscreen outlines only —
you can see the *shape* of what's missing**, which is a great teaser mechanic and works as an
accessibility option for players who find the whiteboard illegible.

### Censored Silhouettes
Undiscovered items render as black silhouettes with the name redacted.

**Visual:** **you can see the shape of the future.** A rack-shaped hole, a dish-shaped hole, a
tank-shaped hole, a generator-shaped hole. The shape alone is enough to start a plan.

### The Confidence Stroke Law
**Hollow stroke = asserted. Solid fill = verified.** A universal law, not one backup widget.

**Visual:** a backup that has never been restored is a **hollow check.** An untested failover path is a
**hollow arrow.** A cert whose chain you haven't validated is a **hollow padlock.** A redundancy you
bought but never load-tested is a **hollow N+1 badge.** A compliance control with evidence is solid;
one with only a policy document is hollow. **One stroke property carries the entire theme of the game**,
and **a board full of hollow glyphs is the most honest picture of a company you can draw.**
**Interacts with:** §5.12's Sealed Capability (hollow = zero benefit until drilled), §4.3's Restore
Drill, §4.5's chaos and load testing, §5.7's knowledge decay, §7.1's effective redundancy, §9.2's
Compliance Theater Meter.

### Certification Wall / Trophy Rack / The Seal Wall
Achievements and certs framed on the office wall or bolted into a dedicated display rack.

**Visual:** the first server you ever built, retired and mounted with a small plaque. SOC 2, PCI, HIPAA,
ISO each rendered as a **wax or foil seal** mounted in the lobby. Framed certificates go **crooked and
dusty** if lapsed, and seals visibly **tarnish** as they approach re-audit — **so the wall is also a
to-do list.**

**Variations and additions**

- **The Trophy Rack as physical objects.** Milestones mount as **things**, not plaques-in-general: a
  **golden UPS**, a framed **99.999% uptime** certificate. Your hall of fame is **a level of visual
  clutter you earned.**
- **The wall as a gate the customers read.** The certification wall is not only decor — **regulated
  customers walk up, read it, and turn around** if the stamp is missing (§5.6). Putting the gate and
  the trophy in the same object is the cheapest way to make compliance feel load-bearing.

### The Sticker Progression
Certifications, vendor partnerships and completed audits become **stickers** — on your gear, your laptop
lid, your office door, the side of a rack.

**Visual:** a veteran company is *covered* in stickers. **Pure, cheap, endlessly readable progression
texture**, and it works at every zoom level.

### The Patch Jacket
Personal-scale progression: a hanging jacket in the office that accumulates **embroidered patches** for
milestones.

**Visual:** first DDoS survived, first PB stored, first 100k concurrent, first clean audit. Zoom in for a
beautifully rendered close-up. **Screenshot bait**, and the only progression display in the game that is
about *you* rather than the company.

### The Dead Drive Shelf (prestige)
Every drive that has ever died in your company is kept on a shelf with a handwritten date on it.

**Visual:** hundreds of them by endgame, in rows. **Morbid, funny, and a perfect long-arc progress
display** — the physical twin of the Scar Tree's lifetime-cost figure.

### The Hiring Board
A corkboard of resume cards.

**Visual:** photo, role silhouette, skill pips, salary tag. **Better reputation = better cards appear**,
so **you can *see* your employer brand** without a stat readout anywhere.

### The Vendor Rolodex
Each vendor is a card with a relationship edge-glow, drawn in that vendor's own brand style.

**Visual:** good standing unlocks better lead times, shown as **visibly shorter truck ETAs**, and advance
access in the catalog. The four vendor house dialects are legible in the menu before they ever arrive in
your racks.

### The Delivery
New hardware arrives as a cutscene.

**Visual:** a truck backs in **in that vendor's livery**, pallets come off, boxes are unwrapped, rails go
in, the unit slides into the rack with a satisfying detent. **Ten seconds, skippable, and never gets
old** if the sound design is right. Add the **crate-on-the-dock intermediate state**, so lead time is
visible as **a physical object sitting in a doorway** rather than a timer somewhere.

**Variations and additions**

- **Crate-Drop Unlocks (the universal ritual).** Every new buildable arrives as **a shipping crate that
  rolls in and unboxes with paper confetti**, stamped with the vendor's fake logo. Keeping the crate
  identical across every reskin makes it **the game's unlock ritual** — the one beat players will
  recognise in a trailer.

### Faceplate Reveal / Blueprint Stamp
Two smaller variants for cheaper unlocks.

**Visual:** the new unit's front panel wipes in from an unlit state as its LEDs sequence
(**FX_LightsOn**); or an unlock stamps a blueprint card with a red **UNLOCKED** and files it into the
catalogue.

### The Lights Come On
The universal unlock beat.

**Visual:** whatever you just unlocked powers up — POST sequence, fans spinning to pitch, LEDs walking
left-to-right, then settling to idle. **Boot sequences are inherently satisfying and cost nothing to
reuse.**

**Variations and additions**

- **The First-Boot Ritual.** The *first* time each new buildable type is placed, play a **longer**
  power-on — POST beeps, LEDs rolling in sequence — and give that unit a permanent **"day-1 sticker."**
  Later units boot fast. The stickers become **your fleet's veteran tree rings**, readable at a glance
  years later.

### Zoom Tier as an Unlock
You **earn** the Campus and Globe cameras.

**Visual:** the first time the camera pulls back to a view you have never had is a genuine "oh" moment
and **costs nothing but a gate.** The cheapest Tier-3 ceremony in the game.

### Tier-Up Title Card
Crossing a tier gets a full-screen card.

**Visual:** a slow camera pull-back from your current infrastructure to reveal the new scale, with the
tier name typeset over it. See §1.8's tier postcards.

### The Overlay Reveal
Each new lens is announced with a short animation of the world **being re-rendered in that lens** —
heat, power, blast radius, cost-per-U, latency field. **New ways to see are as good a reward as new
things to build.**

**Variations and additions**

- **Tier reveals change the lens, not just the list.** Major unlocks should **toggle a visual layer over
  the whole world**: virtualization overlays a blueprint wireframe on the physical room; observability
  turns on LED strips and monitor glow everywhere. **Each era of tech re-skins how you see your own
  company**, which is a bigger reward than any single object.

### Business License Board / Pivot Blueprint / The Sign-Bolt
Opening a new hosting line is a ceremony — **the most important unlock in the game gets the biggest
animation**, correctly.

**Visual:** a framed business licence or service-launch placard mounted on the wall, one per line, with
the date. A **Pivot Blueprint** animation redraws your floor plan into the new line's shape, old
equipment fading and new equipment inking in. And the exterior beat: **a new sign is physically bolted
onto your building with a small crane animation**, and the facility gains that line's Visual Identity
Kit in one wing. **Running three lines means your building is visibly a chimera — the colo wing is
concrete, the GPU wing glows orange, the mail wing is beige — and that is the single best image for
"diversified hosting company" in the entire design.**

### The Wing Build-Out
New business lines don't appear finished.

**Visual:** they start as a **taped outline on the floor**, then studs, then walls, then finished space.
**You can see your pivot under construction**, and you can see it stall if you run out of money halfway.

### The Business Licence Wall (with a lifecycle)
Give the placards a wall and a history.

**Visual:** a row of framed service-launch placards, one per hosting line, **in launch order**, each with
the line's accent colour and start date. Active lines are lit. **Divested lines are turned to face the
wall.** **A line you lost badly gets its glass cracked.** The wall is the single image that answers
"what kind of company is this."

### Cross-Line Synergy Glyphs
Synergies between lines render as a small linked glyph pair on the placard board.

**Visual:** two line icons joined by a bracket; antagonisms show the same pair **with the bracket
cracked.**

### Whiteboard Redraw
When the tree restructures — a pivot, a divestiture, an era change — the board is wiped and redrawn.

**Visual:** a genuine squeaky-wipe animation. Melancholy and great, and the only time the game destroys
something the player made on purpose.

### The Runbook Binder Tabs
Institutional knowledge as a thickening object.

**Visual:** each solved incident class adds a labeled tab to the binder. **A thick, tabbed binder is the
game's most satisfying "number goes up" without a number.** Spines fade and warp with disuse (§5.7).

### The Post-Mortem Polaroid wall
The scrapbook is the emotional counterpart to the trophy rack: **one wall for what you won, one for what
it cost.**

**Visual:** real captured frames with the game UI hidden and the Camera Grammar's Snap treatment applied,
so they read as **photographs rather than screenshots**, physically pinned with the date written on the
white strip in the handmade layer. They develop with a chemical fade-in when they arrive.

### The Conference Talk (as a presentation beat)
Publishing a postmortem plays a slide-deck animation with deliberately bad clip art; your reputation sky
**clears a shade**; a hiring bonus unlocks. **Turning your worst day into a visible asset.**

### Diegetic tech-tree presentations (patch panel, terminal popup, showroom)
Three further house-style skins for the unlock screen, each doing a different job.

**Visual:**
- **The Patch-Panel Tech Tree.** The tree **is** a wall of patch panel: research is **plugging a new
  cable arc between sockets**, unlocked nodes glow, locked ones dim — and **zoomed out it doubles as
  office wall art.**
- **Terminal Popups.** Unlocks announced with a **full-screen DOS prompt styled to the era**:
  `NEW SERVICE AVAILABLE: REDIS. PRESS ANY KEY.` **The game's treasure chest**, and free to author.
- **Showroom power-on.** The tree as a **product showroom**: un-researched machines sit **under dusty
  sheets**, research **pulls the sheet off** and the unit powers up with a warm-up whine, and buying a
  higher tier is the same unit **on a better pedestal.** A companion to the patch panel rather than a
  replacement — **showroom for browsing, patch panel for wiring.**

### The Handbook and the RFC Bin
Unlocks print themselves into **a physical binder on the HQ desk.**

**Visual:** every unlock **prints a page** into the binder, and **you can see it thicken from across the
room.** Flipping through it *is* your tech-tree history, **annotated with coffee stains from the
incidents that taught you each entry.** The lighter sibling: a growing **bin of printed RFCs, tweets
and incident reports** — unlocking rate limiting shows a tiny printed page flying into the binder.
Collectible feel, archive aesthetic, zero UI chrome.

**Variations and additions**

- **The Ancient Manuals.** Some advanced options hide as **readable artifacts** rather than as nodes:
  a printed vendor manual on a shelf, a forgotten wiki server, a bindered SOP in the legacy rack.
  **Finding and reading one** — in a diegetic document viewer — unlocks that technology's advanced
  panel (*"you can set `tcp_tw_reuse` now"*). Manuals scattered per-level **reward zooming into clutter
  you never noticed**, and they are strongest in the retro and colo acts.

### Tech Tree as Energized Schematic
The tree drawn as **a wiring diagram on the NOC wall.**

**Visual:** purchasing an unlock **closes a circuit** — current visibly runs down the newly lit branch
and its endpoints become placeable. Your company's grid **looks more energized as you progress**, which
makes the tree readable as a single image from any distance.

### Rack Space as Unlock Currency
Early on, your "unlock" for a build is literally **that there is a free U in the rack.**

**How it works:** The **rack elevation is the tech tree** for facility growth: bigger facility tiers
don't add menu entries, **they add real estate.** A more hosting-flavoured kind of discovery than any
node graph, and it makes the first fifteen levels teach spatial reasoning for free.

### Sketchbook Reveal
Discovering a tech **flips a sketchbook open.**

**Visual:** the item is drawn **pencil-sketch → inked → rendered in the level's live palette**, showing
the player **what it will look like before what it does** — which is the correct order for a game whose
board is the reward.

### The Failure Museum
Every unique way you have lost gets **a wax-museum diorama in an HQ hall.**

**Visual:** the diorama is built from the actual moment of failure; **visiting one grants a small
permanent buff against that failure class.** Death-learning, with a gift shop. It is the physical twin
of the Scar Tree's lifetime-cost figure and of the Dead Drive Shelf, and the three together give the
building an entire wing about what things cost you.

### The shape of the tech tree (presentation) — *CONFLICTING*

Both documents agree the tree must be a diegetic object rather than a floating node graph. They
disagree about **which object it primarily is** — and since only one presentation can be the default,
this is a real fork rather than a menu of skins.

#### Position A — the hand-drawn whiteboard, with a PCB skin as the accessibility alternate *(master)*

The tech tree **is the whiteboard and corkboard in your office**: marker strokes, smudges, coffee
rings, a "DO NOT ERASE" note, printed spec sheets, torn catalog pages, Polaroids and string. Its shape
is *allowed* to be messy because it must carry three things a node graph cannot — **the roads not
taken** (crossed-out unlock drafts), **who knows what** (face markers versus binder markers), and
**the generation bands** (rot). It scales by physically growing (a second board wheeled in at Tier 3, a
wall of four plus taped-on A3 by Tier 5), staff draw their own nodes on it in their own handwriting,
and **the PCB Trace Tree is offered explicitly as an alternate skin** for players who find the
whiteboard illegible.

#### Position B — four competing presentation shapes *(opencode)*

- **Branch menus.** The four- or six-branch grid, per the taxonomy proposals and the "Ops Maturity"
  four-branch layout — legible, conventional, and the only one that survives a 300-node tree without
  authoring tricks.
- **A network diagram, not a grid.** A literal **topology graph** where nodes require upstream
  *connections* to research; **the root node is your first server**, and the branches are Performance,
  Security, Facility, Platform, Reputation, Economics. The tree and the architecture become the same
  picture.
- **The rack elevation as the unlock screen.** The tree **is a tall empty 42U rack**: purchased tech
  **slides in as a labeled unit and screws itself in with a ratchet animation**, and skipped tech
  leaves **blank panel-plates.** Your build literally mirrors your tech tree.
- **The energized schematic / patch panel / pinboard family.** Circuit-closing currents, cable arcs,
  strings and index cards (see the entries above).

---
## 5.9 Credentials, permissions, and accreditation (the unlocks you cannot buy)

*A third gate beside "can I afford it" and "have I been hurt by it": **am I allowed to?** This is the
axis the industry actually runs on, and the reason a well-funded new entrant cannot simply buy their
way to parity.*

### Capability vs Permission (the shape)
Some nodes require an external permission you cannot purchase directly.

**How it works:** An ASN and address space from a registry (with a justification process), a root-program
inclusion, an ICANN accreditation, a carrier interconnect agreement, an ASV scanning vendor's approval,
a sanctions licence, a payment processor's underwriting decision, a mailbox provider's feedback-loop
enrolment. Each takes **calendar time and a clean history**, **cannot be rushed with money**, and can be
**revoked.** This turns the *trust-with-upstreams* currency (§6.1) into an actual visible progression
axis rather than a hidden stat.
**Interacts with:** §5.7's accreditation-loss rule (a revocation stops what's next, not what you have).

### Payment and processing unlocks
Progression you can lose, gated on your own transaction history.

**How it works:**
- **Merchant Account Approval** — early game you are stuck on a high-fee aggregator; after N months of
  clean history you unlock a real merchant account with materially better rates. **Chargebacks can
  revoke it.**
- **Higher Processing Limits** — monthly volume caps rise with history. Early on, **a viral month can
  exceed your cap and freeze your revenue.** Brutal and real.
- **A second acquirer** — the rolling-reserve scar (§5.2) teaches you to stand one up before you need it.

**Variations and additions**

- **The Merchant-Category Ladder.** A slow prestige ladder **on the revenue pipe itself**: a clean
  fraud track record plus processor relations **reclassify you** out of "excessive-risk" 4.5% fees down
  to a qualified 2.9%. **The cheapest permanent raise in the game, earned by clean books** — and the
  clearest demonstration that your *history* is an asset on the balance sheet.
- **Payment-Rail Unlocks.** PayPal, SEPA, Apple Pay, crypto, local rails — **each adds conversion
  percentage in its region or segment**, and each is **discovered via churned-region analytics that
  name the missing rail** ("they couldn't pay you"). The most satisfying kind of unlock: one where the
  analytics tell you the answer and you still have to go and build it.

### Working-capital unlocks
Capability gated on your books rather than your tech.

**How it works:**
- **Net Terms with Vendors** — you start prepaying for everything; you earn net-30, then net-60. **A pure
  working-capital unlock that feels amazing: suddenly you can buy servers before you're paid.**
- **Bank Relationship / Line of Credit** — requires clean financials (which requires the Controller
  building) and two years of operating history. Unlocks surviving cash-timing disasters.
- **Equipment Lease Facility** — buy hardware without cash, at the cost of interest and covenants.
- **Clean monthly close for 6 months** → the FP&A forecast view and a credit line.
- **Reviewed / audited financials** → bank debt at real rates, and eligibility for enterprise
  procurement (large buyers ask for your financials).
- **12 months of cohort data** → the Cohort View and elasticity testing.
- **3 years of operating history** → insurance at reasonable rates, and the **"since 20XX" trust badge**,
  which is a real conversion factor.
- **$1M ARR with <2% monthly churn** → institutional lenders and PE inbound.
**Why it works:** **it makes bookkeeping a progression system**, which no game does, and it is true —
your access to capital is gated on your accounting quality.

### Vendor and supply-chain unlocks
- **Vendor Tier / Partner Level** — Gold partner status unlocks deeper hardware discounts, demo units,
  and **MDF** (marketing development funds — real money vendors give you to advertise them).
- **GPU Allocation from the vendor** — **you don't buy GPUs, you're *allocated* them.** Unlocked by
  relationship, volume commitment, and sometimes by who you know. Absolutely real, and the best flavour
  in the whole gate list.
- **Carrier MSA** — signing a transit agreement at committed volume unlocks lower per-Mbps rates and, at
  higher tiers, **the ability to resell transit.**
- **Procurement provenance** — after a counterfeit part failure (§5.2), the policy that guarantees the
  supply chain at a per-unit premium.

**Variations and additions**

- **Hardware wholesale after volume.** Once you have repeatedly bought single servers — a hundred
  dedicated units, say — a **volume-pricing and procurement node** unlocks: capex discounts and supply
  contracts, which are also your hedge against the component-shortage threat. The unlock is triggered
  by **the boring repetition of buying**, which no other node in the section uses.

### Network and numbering unlocks
- **RIR / LIR Membership + IP Allocation** — requires justification of utilization. Unlocks ASN,
  multi-homing, anycast, reverse-DNS control (and therefore the email line), **and IPv4 leasing revenue**
  — plus the obligation to keep abuse contacts accurate.
- **Peering Eligibility** — requires traffic volume and a router presence at the exchange. Unlocks the
  COGS drop that makes CDN economics work at all.
- **Domain Registrar Accreditation (ICANN)** — you stop reselling domains at 5–15% margin and start
  earning the registry-to-retail spread, **and you own the customer's domain (3× retention).** Costs an
  annual fee, an accreditation process, and a permanent compliance obligation: WHOIS accuracy, UDRP
  handling, data escrow.
- **Telecom / VoIP authority (ITSP, FCC 499 filer, CLEC)** — you can sell DIDs and terminate calls
  directly instead of reselling. Opens an entire regulatory-fee stack: USF contributions, 911/E911
  obligations and fees, CALEA compliance, per-state registrations. **A line whose real threat is a
  quarterly filing deadline.**

**Variations and additions**

- **The IPv4 market unlock (gated on pain).** When your address demand exceeds your stock, **the broker
  market appears**: ARIN-style transfers, lease platforms, and the IPv6 migration project — a whole
  sub-tree that only exists once you have run out.
- **PI space / LIR membership, and the knife inside it.** Getting your **own portable block** — an ASN
  exists in the ladder already; *portable address space* does not — softens upstream churn events. And
  then the cost: **customer portability.** Clients can take their IPs with them when they leave, so
  churn arrives with zero friction, **and you can never un-build it.** The late-game question the node
  poses is a good one: *is our address space a moat, or a door?*

### Compliance and audit unlocks
The accreditation ladder, stated as gates rather than as a tech branch.

**How it works:**
- **SOC 2 Type I → Type II** — Type I is point-in-time (fast); Type II requires **6–12 months of
  evidence** (slow). **Unlocks the enterprise lane in two stages, which paces the mid-game perfectly.**
- **PCI DSS Level** — unlocks e-commerce customers and, separately, lets you store card data yourself
  instead of paying a gateway. **PCI DSS Level 1 Service Provider** goes further: you can be *in scope*
  for other people's card data, a premium tier nobody else can bid on.
- **HIPAA Readiness + BAA capability** — unlocks healthcare customers.
- **ISO 27001 / 27017 / 27701** — unlocks European enterprise and government.
- **FedRAMP / IL-level Authorization** — unlocks federal. Costs a fortune and eighteen months, and is
  the clearest "you are playing a different game now" gate available.
- **GDPR data-residency certification** — unlocks EU customers who **legally cannot use you otherwise.**
- **Cyber Insurance Eligibility** — insurers require MFA, backups, and an IR plan before they will write
  a policy. **Security investments unlock insurance, which unlocks enterprise customers who require you
  to carry it. A lovely three-link chain**, and it runs backwards just as cleanly when you lose cover
  (§5.7).

### Facility and jurisdiction unlocks
- **Uptime Institute Tier rating (III, IV) / carrier-neutral certification** — colo sales gates. **Tier
  III unlocks mid-market tenants; Tier IV unlocks financial and government.**
- **Local permits / zoning / tax abatement** — unlocks building in a region *at all*; the wholesale
  game's opening move, and the reason the Sustainability/Politics branch exists.
- **Power Allocation from the utility** — **you cannot sell kilowatts you were not granted.** A queue
  with a multi-year wait that you either join early or regret. The single most authentic scarcity in the
  modern industry.
- **Wholesale energy procurement / becoming a load-serving entity** — buy power at wholesale instead of
  a retail tariff. A late-game facility unlock with enormous margin implications.

**Variations and additions**

- **Uptime Institute Tier III/IV design stamps (the facility-class attraction buff).** Design and
  facility certifications act as **permanent attraction buffs for facility-class customers**, and they
  carry the rule that makes them real: the boring N+1 / 2N topology must **have existed *during*
  assessment.** You cannot retro-paper a fragile hall.

### Channel and marketplace unlocks
- **App Store / Marketplace Listing Approval** — unlocks a distribution lane and a revenue share.
- **Cloud marketplace listing + co-sell** — your product becomes billable against a customer's existing
  hyperscaler committed spend, **which removes the single biggest procurement objection.** Costs a
  revenue share and an integration project.
- **The recommended-host slot** — a platform's official hosting recommendation page. Unlocked by
  benchmark performance, upstream contribution, and relationship. Losable in one bad quarter (§5.7).
- **Master agency / TSD contract** — unlocked by having a commission portal, a channel manager, and a
  quotable rate card. Opens the agent lane.
- **Affiliate network tier promotion** — volume plus a low refund rate promotes you to better placement.
- **Review-site "editor's choice"** — **⚔️ Tension by design:** there is an honest version (earn it) and
  a dishonest version (pay for it, which much of the industry does). The dishonest one detonates later
  via the Astroturf Temptation (§2.10). Keep both routes and let the player choose.

**Variations and additions**

- **The Channel Program, and channel conflict.** After three reseller deals you discover **wholesale
  pricing** and unlock agency partnerships; the first reseller signs free if you have built a **partner
  portal.** Then partner-sourced revenue **dwarfs direct** — and brings **margin dilution and channel
  conflict**, because your resellers undercut your own direct pricing. A real phenomenon, and the
  reason this unlock deserves a downside.
- **Affiliate program via a happy reseller.** The trigger that starts the whole lane: **one agency
  customer doing well** turns into *"they want to resell"*, which opens the channel branch.
- **The channel bundle.** Affiliate program, **marketplace listings** (a store presence you pay a
  percentage on), and a **strategic partnership with an ISV whose product runs on you** (co-marketing
  waves). Each raises an acquisition lane **and adds a revenue-share upkeep**, so the channel is a
  margin decision, not a growth freebie.
- **Marketplace listings as a conversion engine.** An app marketplace of one-click installers converts
  hobbyist traffic dramatically — and is **discovered when competitors' listings rank for your
  keywords**, which is how it actually happens.
- **Zero-rating / sponsored-data deals.** A partnership unlock with a carrier, CDN or OS vendor:
  subsidized acquisition — **and a monopoly signal if abused**, which regulators notice late-game.
- **Partnerships gated by incident history.** Some channels — eyeball networks for CDN, IX peering,
  hardware OEMs, marketplace listings — **only open after visible proof**: an uptime season record, an
  abuse-desk grade, or a scale threshold. **Earning distribution is the reward for playing defence
  well**, which is the section's best argument that the two halves of the game are one game.

---
## 5.10 Reputation and social-proof unlocks

*Reputation is a two-directional gate (§5.6) and also a progression track in its own right. These are
the unlocks that come from what other people say about you.*

### First Case Study
Requires a happy reference customer willing to be named.

**How it works:** Unlocks an enterprise conversion bonus. The cost is a small amount of account-manager
time and the risk that the referenced customer later churns loudly.

### Three Logos
The "Trusted by" strip on the storefront.

**How it works:** Three named customer logos unlock a **flat conversion-rate multiplier** across the
whole funnel. The cheapest marketing unlock in the game, and it requires nothing but having kept three
customers happy enough to ask.

**Variations and additions**

- **The first enterprise logo as a *gate*, not a bonus.** Landing your first whale or regulated contract
  unlocks **case-study production, reference customers** (RFP auto-win percentage up) **and a corporate
  pricing tier** — and **before that, whales do not spawn at all.** The first logo is a lock, not a
  multiplier.
- **The Logo Key.** One logo opens a **whole segment**: a single bank logo visibly opens the finance
  pipeline — prospects spawn faster **and pay more for the proof.** The Logo Wall becomes a literal
  progression map you can read from the lobby.
- **The mean part of the cascade.** Closing your first whale also **reveals your pipeline to the
  competitor AIs**, who now bid against your own numbers. **Winning changes the market around you**,
  which is the honest version of a reputation unlock.

### Community Standing
A threshold on the reputation stat unlocks the deal-community lane.

**How it works:** The forum/community acquisition channel — high volume, low ARPU, brutally opinionated,
and it turns on you instantly if your support slips.

**Variations and additions**

- **The Community Forum unlock.** The buildable underneath the standing: basic community features unlock
  **word-of-mouth visitor growth**, are fed by the open-source contribution program, and double as the
  **free-but-lossy support deflection channel** — cheap support that occasionally answers wrongly in
  public.

### Analyst Coverage
Appearing in a market quadrant unlocks enterprise inbound.

**How it works:** Requires revenue scale **plus a briefing** (a spend, and a day of executive time).
A slow, expensive, entirely real channel whose payoff arrives two quarters later.

### Uptime Streak
**Your operational record becomes a product.**

**How it works:** Twelve months without an SLA breach unlocks a **"99.99% guarantee" SKU you can
actually sell at a premium.** Losing it locks the SKU again until you have re-earned it (§5.7's three
SLA breaches).

### Published Post-Mortem Credibility
Publishing N honest post-mortems unlocks a **permanent reputation floor.**

**How it works:** You become "the honest host," which **reduces the damage from every future incident.**
The most counterintuitive and most real reputation mechanic available: transparency is insurance.
**Interacts with:** §5.4's Blameless/Blame postmortem choice; the Conference Talk.

### Open-Source Sponsorship
Unlocks the developer lane and cheap word-of-mouth.

**How it works:** A recurring spend that buys a slow, durable acquisition channel and a permanent
reputation modifier with the most technical customer segment. Draws your logo onto the community board
(§5.4).

### Conference Speaking Slot
Unlocked by scale; a free marketing lane thereafter.

**How it works:** Once you are big enough to be invited, every talk is a recurring, nearly free
acquisition and hiring channel — which is why so many hosting companies over-invest in it.

### The "we've been through it" modifier
A permanent enterprise-trust bonus earned by having survived a breach and disclosed it properly.

**How it works:** Real buyers trust operators who have been tested. **The only unlock in the game whose
prerequisite is a disaster you handled well**, and the strongest argument the design has for why a scar
is not simply damage.

---

## 5.11 Staff, organizational, and knowledge unlocks

*Staff are keys, not just labor. The org chart is a tech tree, and the knowledge it holds is an asset
that can walk out of the building.*

### First Hire
**Unlocks doing two things at once.**

**How it works:** The whole early game is **you** as the constraint, and the first hire is the moment the
game's action economy changes shape. It should be presented as a bigger unlock than any building.

**Variations and additions**

- **Staff titles → departments.** The second-order unlock nobody expects: **hiring past five people
  triggers "you need managers"**, and org-structure buildables — department heads, an on-call rotation
  — become available. **Scale forces formalization**, and the game should present it as a cost you did
  not choose.

### The First Salesperson
Unlocks lanes you cannot reach yourself.

**How it works:** Outbound, partner conversations, and deal-desk motions that require someone whose job
is not firefighting. Costs base plus commission, and introduces the first goal misalignment: their
incentive is signed deals, not profitable ones.

**Variations and additions**

- **The Sales Comp Plan.** The unlock that makes salespeople *priced* rather than merely hired: quota,
  commission and accelerators turn a sales buildable into **1.5–2× pipeline output at the cost of a
  percentage of closed MRR as a recurring expense** — plus **a clawback line when the customer churns
  in-quarter.** People systems, with their incentives modelled.

### The First Accountant / Controller
Unlocks financial visibility.

**How it works:** The gate on cost-to-serve analytics, per-customer profitability, deferred-revenue
tracking, and everything in §5.9's working-capital ladder. Half your customers turn red the day they
start (§5.4).

### A Real CTO
Unlocks reduced self-inflicted outages — **at the cost of slower shipping.**

**How it works:** Change-control discipline lowers the bad-deploy rate and raises the time-to-feature.
A genuine trade, and the one most players will resent before they thank it.

### A COO
Unlocks running multiple sites and multiple lines **without micromanaging each.**

**How it works:** The gate on the portfolio game: without one, every additional line costs you personal
attention you do not have.

### An Abuse / Trust & Safety Lead
Unlocks bulletproof-adjacent revenue **safely.**

**How it works:** Lets you take the risky customer segment with a managed AUP rather than a blanket
policy — the difference between risk-priced hosting and bulletproof hosting.

### A CFO
Unlocks financing instruments, forecasting, and the Exit level.

### A Board
Unlocks capital — **and adds quarterly targets as a constraint**, plus a scored quarterly review you
have to sit through. The clearest "power with strings" unlock in the design.

### On-Call Rotation
Unlocks 24/7 coverage **without burning out your one admin.**

**How it works:** Burnout is a modeled risk — an exhausted engineer *causes* outages — so the rotation
is not a convenience, it's a defensive structure with a payroll cost.

### Runbook Library (as an org unlock)
Unlocks **handing off work** and mitigates the Key Person threat. See §5.4 for the ladder.

### The Apprenticeship (growing your own)
Two theories of staffing, both viable.

**How it works:** Hire juniors cheaply, invest hands in mentoring, and in **12–18 in-game months** you
have mid-level engineers who cost less than market and are far less likely to leave. Competes directly
with hiring senior (fast, expensive, flight-risky). **The apprenticeship path is the only one that
improves your culture stat**, and it is the only staffing investment that pays off after the level it
was made in.

**Variations and additions**

- **The University Pipeline.** A *staff-quality* lane above the apprenticeship: **sponsor a lab, host
  interns, fund a chair.** Graduates arrive with **modern-tech affinity** — the framework *you* taught
  them becomes a free upgrade instead of a research node — and **interns are cheap staff towers with a
  rookie mistake-rate and discoverable potential** (a great intern project can unlock a real tool; your
  bug-bounty platform might have started as one). It eases bus-factor risk by deepening the knowledge
  pool rather than by documenting it.

### Knowledge as a transferable asset (the staff carry the tree)
Make "staff are tech tree nodes" symmetrical **and consequential.**

**How it works:** Each staff member holds **1–3 unlocked nodes as personal knowledge.** A node held by
only one person is flagged **bus-factor-1 on the tree itself**, not merely on the person.
**Documentation converts personal knowledge into institutional knowledge** — the node's marker changes
**from a face to a binder.** Losing a person **removes their undocumented nodes from the tree**, greyed
out and recoverable by re-research at half cost.
**Why it works:** it is the only way to make documentation feel like anything other than a chore; it
gives Staff Burnout (§2.9) real teeth without being punitive; and **it makes the tech tree itself a
display of organisational health.**
**Interacts with:** §5.8's marker colour code and handwriting (a departed person's strokes fade to 40%),
§9.4's Alumni Network (rehiring re-darkens their section).

### The Wiki
As you discover things, they get written down.

**How it works:** A literal in-game knowledge base that **new staff read to onboard faster** — every
entry shortens the ramp time of every future hire. Building it is optional and compounding, which makes
it the purest expression of the game's "invest in boring things" thesis.

**Variations and additions**

- **Documentation Culture as a deliberate spend.** The unlock earned by **voluntarily spending staff
  time writing docs during a quiet level** — not after an outage, not because someone left. It directly
  prevents documentation rot and **speeds Cross-Training**, and it is the purest test of whether the
  player has understood what peacetime is for.

### The Mentor relationship (NPC)
See §5.4. A veteran who gives one hint per level and unlocks a node if you follow it — the only
acceptable form of persistent tutorial text.

### The Conference / Community channel
Sending an engineer costs money and time and returns **a new technique unlock, a peering contact, and a
hiring lead** — three different currencies from one spend, which is why it is the best-value peacetime
action in the game and should be priced accordingly.

### Cross-Training
Staff who have been through the training pipeline can be unlocked to **cover a second role.**

**How it works:** Directly reduces the impact of **Key Person Dependency** and of **Staff Burnout
Resignation** — the two threats that a pure hiring strategy cannot answer. It costs the trainee's time
now and buys you the ability to survive a resignation later, which is the same trade as every other
resilience purchase in the game, applied to people.
**Interacts with:** the knowledge-as-transferable-asset rules above (cross-training is the human form
of documentation), §5.4's Runbook Ladder.

### Staff Certifications
Sending staff to training **unlocks their ability to operate advanced buildables.**

**How it works:** A cert-as-door on the *operations* side rather than the compliance side: the hardware
exists, you own it, and **nobody on the roster is allowed to touch it** until someone is certified.
The cleanest possible demonstration that staff are keys.

### The Incident Commander role
Unlocked after a large **multi-system** incident — the one where several things failed at once.

**How it works:** The commander coordinates response **across simultaneous problems**, which is a
distinct capability from resolving any one of them, and it feeds the runbook slots of the Incident
Command system. It is the org chart's answer to the scar where three engineers duplicated each other's
work (§5.2) — that scar teaches the *roles*; this unlock hires the person who runs them.

---
## 5.12 The research economy and unlock pacing

*The tree describes ~200 unlockable things and never says how you pay for them, how fast they should
arrive, or what it costs to be wrong. This subsection is the machinery underneath §5.1–§5.6.*

### The Research Queue (how research actually happens)
Research is not an instant purchase; it is a **queue with a limited number of parallel slots.**

**How it works:** One slot at Tier 1, three by Tier 4. Each node has **three costs**: **money**,
**engineer-weeks** (which consume hands, competing directly with operations), and **risk** (a chance of
producing nothing). **Pausing a project loses a fraction of its progress.** This makes "we'll do it
after the incident" a real, compounding cost, and it makes **which three things you are working on**
the strategic core of the tech tree rather than a shopping trip.
**Interacts with:** §4.8 staff hands, the Spike below, the Debt Unlock below.

### The Lab (research as a buildable)
Research can also be **an object on the board** that spends money and time per wave to advance the tree
**while you defend.**

**How it works:** The standard RTS choice, in hosting clothes: **build economy or build army — here,
build future or survive now.** Idle progress from the Lab competes directly with manual spend-now
unlocks for the same cash, and the Lab keeps working during the waves when you have no hands free.

**Variations and additions**

- **The 20% Time Lab.** Assign a *fraction of staff* to open-ended research: spend salary-hours on
  **random rolls against the tree**, returning jackpot unlocks, **useless** unlocks (a blockchain joke
  item), or **burnout** (morale debt). Rare crits discover "lost" techs early — **post-quantum crypto
  before the arc demands it** — which is the only way to pre-arm for the harvest-now endgame.
- **Idle staff as researchers.** The simpler form: assign **off-shift sysadmins** to research nodes and
  unlock speculative tech (RDMA fabric, homomorphic search, a tape robot).
- **The Internal Fuzzing Lab.** A room where a robot **throws nonsense at your own APIs forever**,
  converting idle compute into **pre-discovered zero-days.** Each internal "kill" **stamps out the
  corresponding incoming threat** — or converts it into a harmless "already patched" pop, which is
  cathartic — and the lab's kill-list feeds your CVE calendar. Escalation tiers: **dumb fuzzer →
  coverage-guided → protocol-aware**, each retiring whole threat families in its lane. And the comedy:
  **the fuzzer eventually finds your *billing* engine's infinite-money bug** — do you file it, or…
- **Research Roulette (allocation pools).** Instead of per-item pricing, **pour points into one of four
  branches**; at each wave end the branch **finishes the next most-relevant thing in its pool.** A
  priority-revealing discovery — *"we needed the cache, so the cache came"* — that makes a softer tech
  tree for the narrative campaign, and should be optional-off for theorycrafters.
**Interacts with:** the Research Queue above (the Lab is the idle counterpart to its parallel slots),
§5.8's Lab Bench presentation, §4.8 staff hands.

### The Spike
A timeboxed investigation that may return nothing. **Buying information about the tech tree rather than
buying the tech tree.**

**How it works:** Spend two engineer-days to find out whether a research node is even viable in *your*
environment. Returns one of three answers: **"yes, cost X"**, **"yes, but it requires Y first"**, or
**"no."** It is how real engineering organisations de-risk, and it is the cheapest way to stop the
player from sinking six weeks into a dead branch.

### Negative Discovery (learning what you don't need)
Some investigations conclude **"this wouldn't have helped."**

**How it works:** Those results are *valuable*: they **refund a portion of the spike cost as Intel** and
**permanently grey out a branch with a note explaining why**, which stops the player wondering about it
for the rest of the campaign. **A game that lets you rule things out respects the player's time** — and
ruling things out is most of senior engineering.

### The Debt Unlock (borrow a capability now, pay interest)
A legitimate way to answer a crisis the tree hasn't reached, without handing out free power.

**How it works:** Any research node can be taken **on credit**: you get it immediately at **1.4× cost**,
repaid over six in-game months, and **while the debt is outstanding that node is *fragile*** — a 1-in-8
chance per incident that it behaves like the cheap version instead of the real one. Thematically: **you
bought the tool but didn't build the practice around it**, which creates the wonderfully authentic
situation of **owning a WAF that mostly works.**
**Interacts with:** §6.11 financing, §7.7 technical debt.

### Sealed Capability (you own it, but it doesn't work until you drill it)
**The single mechanic that converts the design's most-repeated lesson — "the failover you never tested
is not a failover" — from flavour text into the core loop.**

**How it works:** Certain purchases arrive **sealed**: the failover pair, the DR site, the restore path,
the generator, the incident-response plan, the runbook. They show a **hollow icon** and provide **zero
benefit** until you spend a **drill** on them. The drill costs a planned, announced, scheduled outage
window. Once drilled, the icon fills and the capability is real — **and it re-hollows after N months
without exercise.**
**Why it works:** it gives peacetime an unambiguous, satisfying, *visible* job — **turning hollow icons
into filled ones** — which is the best possible use of "make the boring thing beautiful."
**Interacts with:** §5.8's Confidence Stroke Law (hollow = asserted, solid = verified), §4.3's restore
drill, §4.7's load bank, §5.7's knowledge decay.

### Unlock cadence spec (how often, and what kind)
**A level that grants only numbers is a level that feels like it granted nothing.**

**How it works:** An explicit pacing budget in three grades, because unlock *feel* decays if the type is
wrong:
- **A new verb** (you can now do something you could not) — the big one. Target: **one per 25–35
  minutes**, never two in a level. Examples: automation, wiring mode, drain, anycast, delegation, live
  migration, a new hosting line.
- **A new object** (a thing to place) — **2–4 per level.**
- **A new number** (a buff, a modifier, a stat reveal) — as many as you like, **but never the only
  unlock in a level.**
**Why it works:** §5 has roughly 200 unlockable things and no cadence at all. This is the tool that
stops the tree from feeling either starved or like confetti.

### Unlock Rationing (the hard cap)
The complementary rule stated from the other direction.

**How it works:** **2–4 meaningful unlocks per level, of which at most one is a new buildable and at
least one is an automation or quality-of-life improvement.** A hard cap prevents the mid-campaign
avalanche where the player has more options than attention. Everything else is a *modifier* to things
they already own.
**⚔️ Tension:** the cadence spec is phrased per-25-minutes and biases toward verbs; the rationing rule
is phrased per-level and biases toward QoL. They agree on volume (2–4) and disagree on which category
is mandatory. Resolution if one is needed: use the rationing cap as the budget and the cadence grades
as the composition rule inside it — at most one buildable, at least one QoL, and a verb no more than
once per two levels.

### Hardware Generation Unlocks (time, not achievement)
**A tech tree that advances without you.**

**How it works:** New CPU, drive and network generations arrive on a campaign calendar regardless of what
you do. Each **changes the math rather than adding a feature**: more cores per watt shifts your density
ceiling, NVMe changes your storage economics, 400G makes your aggregation design obsolete. It forces
periodic re-evaluation of decisions that were correct when you made them — which is what the industry
actually feels like.
**Interacts with:** §5.7's generation bands and rot, §5.6's era unlocks.

### The Debt-to-Capability Conversion (refactoring as research)
**Turns maintenance from a tax into a gate**, which is more accurate and much more motivating.

**How it works:** Paying down technical debt in a specific area doesn't merely remove a penalty — it
**unlocks the next node in that branch**, because the old thing was blocking it. Migrating off the
legacy control panel unlocks provisioning automation; cleaning up the network unlocks segmentation;
documenting the mystery box unlocks its replacement.

### Unlock by Decommission
**Removing something teaches you something.**

**How it works:** Successfully retiring a legacy system unlocks the tooling that made it possible —
migration automation, a compatibility shim, a data-conversion pipeline — as a permanent capability,
which makes **the next decommission cheaper.** Converts the least glamorous work in the industry into
visible progression, and it is the only reward the game offers for making itself smaller.
**Interacts with:** §5.6's distillate, §3.9's Controlled Shrink.

**Variations and additions**

- **Retire-a-Tech ("forgetting") — the tree as an editing surface.** Deliberately decommission a
  buildable *family* for a refund **and permanently remove its threat family from your future spawn
  pool.** "Attack surface grows with tech" becomes **a two-way door**, and the compliance-minimalist
  playstyle becomes a verb rather than a game mode. The cost is real: you cannot un-forget, and the
  next line you open may need exactly what you scrapped.

### The Deprecation Notice You Wrote
Unlocks from your own product decisions.

**How it works:** Announcing the end-of-life of one of *your* products or plan tiers unlocks the
**migration tooling branch**, because you now have to move everybody. **A capability created by a
commercial decision**, which is exactly how it happens in real companies — and it pairs with §5.7's
product rot, which is what made the announcement necessary.

### Intel as a spendable currency
The three-currency model (§5.1) needs Intel to have a sink.

**How it works:** Intel comes from honeypots, sinkholes, near misses, negative discoveries, published
postmortems at double rate, peer networks and the Reading Room. It buys: research into threats you have
not met, Codex pre-fills, Anticipation Track conversions, attacker fingerprinting, and — at scale — a
sellable threat-feed product. It is spent at the Research Bench with a visible assembly animation
(§5.8), so the currency has a *place*.

---

