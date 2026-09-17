# 9. Anything else

*The catch-all. Game modes, structural twists, humour and tone, meta systems, the educational angle,
design guardrails, and the long tail. Because the hosting type changes per level/scenario and per era
— web, VPS, colo, game servers, GPU/AI compute, backup/DR, CDN, email/DNS, object storage, streaming,
bulletproof, regulated, retro dial-up ISP, satellite ground station — almost everything in this
section is written to be **type-agnostic**, with the hosting types called out wherever an idea is
narrower than that.*

---

## 9.1 Modes

### Campaign
The main arc: Tier 0 → Tier 6, across hosting types and eras.

**How it works:** A branching map (the Pivot Map) where you choose which line of business to open
next, so no two campaigns cover the same types in the same order. **The variety engine is the campaign
structure.** Persistent company, staff, scars, customer book and reputation carry across the whole
arc — customers you treated well in level 3 show up in level 9 as references, and shortcuts you took
in level 3 show up in level 9 as depositions. Three acts, multiple hosting types.

**Interacts with:** §9.9's Long Save, the persistent-Company object in §9.4, §5's scar system.

**Hosting types:** all — the campaign is the mechanism by which the player meets each one.

**Variations and additions**

- **Story framings for the same arc** — the campaign has been proposed with several narrative
  wrappers, all compatible with the branching Pivot Map: *"Ops Story Mode"* (you're the new sysadmin of
  **"HostHaven"**, a failing shared host, each level a calendar month with a cutscene), the
  **grizzled founding-sysadmin narrator** telling your company's history from server closet to global
  network with a staff-party scene closing each act, and **the campaign-as-incident-report**, where the
  story is told entirely through the postmortems and uptime graphs of completed levels. All three live
  in §9.14.
- **A month is a level.** Making the campaign's unit a *calendar month* rather than an abstract level
  gives the seasonal calendar (§9.2), the quarter close (§9.1) and the annual report (§9.4) a shared
  clock for free.

### Endless / Survival ("The NOC" / "The Long Haul" / "Keep It Running")
One infrastructure, escalating forever.

**How it works:** Waves keep coming and keep getting harder; you build, adapt, and eventually fall.
Scored on uptime-days, cumulative profit and valuation. **The mode people will actually play the
most** — which makes thinness a real risk.

**Expansion — Endless needs a run structure, not just escalation.** Propose **Seasons**: every ~12
waves the business rolls over — a quarter closes, the board sets a mandate, you draft one of three
modifiers, hardware ages one step, and **one new hosting line is offered**. That gives Endless a
rhythm, a reason to make long-term decisions, and the natural home for threat affixes. Difficulty
should scale on **Variety more than Volume**, or it stops being interesting past minute 40.

**Interacts with:** §0.2's line draft, §2's affix system, §6's quarterly review.

**Variations and additions**

- **Endless "Black Friday" / Endless Uptime** — wave-based survival on your *mature* multi-region
  architecture: flood heights on an escalating ladder, surge-pricing windows, staff overtime as the
  clock, every failure persisting as lore, and the attacker AI with the **full codex unlocked**. Score
  = **uptime-days × MRR**.
- **The visual ladder.** Arrivals climb every wave while the threat front escalates alongside; the
  screen literally darkens and the sky fills with incoming comets (referral overload rendered as
  weather). Leaderboard = longest survival, and **the grade screen *is* the status page "under
  pressure."**
- **"Black Friday War Room" as a recurring annual event**, not only a mode — retail customers' spikes,
  carrier congestion and your team's on-call endurance all landing in the same week of the campaign
  calendar.
- **Endless as "quarterly earnings"** — perpetual operation with escalating complexity, seasonal demand
  waves, tech-refresh cycles and a randomized event deck (ransomware wave, GPU shortage, a viral outage
  meme). Leaderboard on **longest profitable tenure** and **best CAGR before collapse**.
- **Uptime Endless** — waves never stop and only **efficiency (cash-per-Mbit)** ranks you. Plus
  *Endless on any campaign level* as a leaderboard run, and a **build-creativity leaderboard** for
  players scored on the shape of what they built rather than how long it held.
- **Endless Wave** — the single DDoS that grows every minute until you fall. Pure leaderboard bait, and
  the cheapest possible version of the mode.

### Incident Mode / Blitz Sev-1
A roguelite of single crises.

**How it works:** You're dropped into a pre-built (often badly built) system that is *already on fire*.
Diagnose and fix under a clock with limited hands. **Pure diagnosis, ten minutes, infinitely
replayable** — and the best possible showcase of what makes this game different. Bite-sized variants
run 5–10 minutes and are built from real incident archetypes: *"the site is slow but CPU is at 3%"*,
*"half the users can't reach us"*, *"backups have been green for 400 days"*, *"it's 3:14am, three
alerts, one is real."*

**Expansion — it is one paragraph and it is the game's best asset.** Two additions make it a mode
rather than a demo: **(a)** it needs the **Architectural Bad-Habit library** (§9.2) to generate boards
that are readable and unfair in *interesting* ways rather than random; **(b)** it needs a **par time**
per incident, so there is a mastery axis and a reason to replay one you already solved. It is also the
natural mission unit for a roguelite run structure — see **The Consultant** below, **probably the
highest-return single addition to the whole modes section.**

**Interacts with:** §7.6 diagnosis, §9.2's bad-habit library, The Consultant, Daily Outage.

### The Consultant (the 20-minute roguelite this design is secretly perfect for)
A run is a *career of short jobs*.

**How it works:** Each job is a stranger's infrastructure — already built (procedurally, from a library
of architectural *bad habits* rather than random noise), already in trouble, with a stated goal and a
15–20 minute clock. You bring your **toolbag**: five items drafted at run start and expanded between
jobs. Between jobs you pick the next contract from three cards with visible risk/reward. **Death is
running out of reputation, not money.**

**Why:** the campaign is a 25-hour commitment; this is the same systems in a 25-minute commitment, it
is the best possible showcase of the diagnosis loop (the game's most distinctive pleasure), and it is
where the procedural-generation work pays off. Incident Mode is a single mission; **this is the run
structure around it.**

**Interacts with:** Incident Mode, §1.2's Defend Someone Else, §5.4 discovery, §9.2's Bad-Habit library.

**Variations and additions**

- **The Consulting Arc (NG+ joke tier)** — replay *campaign* levels as the consultant parachuted into
  the failure: you get **three advice cards per level instead of build power.** The same run structure
  applied to boards the player already knows, which makes it a victory lap and a humility lesson at
  once.

### Roguelite Run Mode ("Bootstrapped")
Start with $500 and a used server.

**How it works:** Each shift you draft one of three offers — a customer, a piece of gear, a policy, or
a staffer. Permadeath on insolvency. Meta-unlocks between runs. No financing is available at all;
every dollar must come from a customer. **Brutal, pure, and the way most real hosts actually started.**
Probably the most replayable version of this game and worth prototyping early.

**Tension:** ⚔️ Bootstrapped-as-a-roguelite and The Consultant are two different run structures over
the same systems (build-your-own vs inherit-someone-else's). Both are strong; they should not compete
for the same slot in the shell. Ship one first, and the other as its mirror.

**Variations and additions**

- **Startup Roguelite ("Pre-Seed Mode")** — 20-minute arcs where **your *company* is the build**: a
  random customer deck, random market events, and on death **a generated post-mortem blog post as the
  loss screen.** Meta-runs persist as "company lore."
- **"Startup Run" framing** — the one-more-run version: random **investors as buffs with clauses**,
  random disasters, permadeath per run, meta-unlocks via the codex; shorter levels, harsher economy.
- **"The Company" meta-progression** — persist one company across runs: brand colour, motto, and a
  **history wall generated from your best post-mortems**; each New Game+ opens with the prior company's
  obituary or its museum.
- **The Home Base hub** — a recurring between-levels screen where staff, unlocks and economy carry over
  *visibly*, with staff as persistent, individually-named people rather than an abstract pool. Its
  **"Company History" tab** is the natural anchor for the **Changelog Wall** (a cosmetic wall of the
  patch notes and fixes you have actually shipped) and the final-campaign **Legacy Report** — a
  personalised, shareable summary of the specific path taken: specialisation branch, hardest-hitting
  threats, most-leaned-on buildables.

### Puzzle Mode ("Root Cause") and The Postmortem Puzzle
Hand-authored diagnosis puzzles.

**How it works:** Here are the symptoms, the graphs, and the logs. Name the cause. **A whole game
inside the game**, and the most educational mode. The **Postmortem Puzzle** variant hands you the
artifacts from an incident that *already happened* — graphs, logs, a timeline — and asks for the root
cause *and its contributing factors*, scored on how few hints you needed. Fixed board, fixed waves,
one correct-ish answer, three stars: *"Here's a broken architecture. You have $2,000 and four shifts.
Fix it."* Short, sharp, shareable.

**Interacts with:** §9.5's education layer, the Order of Operations card (§9.5), the scenario editor.

### Daily Outage / Daily Incident / Scenario Weekly
One shared scenario per period, global leaderboard.

**How it works:** Everyone gets the same seed, the same broken system, the same clock. **Comparison
without multiplayer**, and a reason to open the game daily. Ranked by MTTR, incident cost, or money
saved. The facility is one **you didn't build and therefore don't understand**, which is, again,
exactly the real job. The weekly **business** sibling — *Scenario Weekly* — uses a fixed seed and a
shared balance sheet, scored on EBITDA or valuation; **watching how differently people solve the same
balance sheet is the draw.** Extremely shareable.

**Interacts with:** the replay/clip exporter (§9.7), the Failure Hall of Fame (§9.10).

**Variations and additions**

- **"The pager is your puzzle."** One procedurally-assembled scenario everyone plays simultaneously,
  NYT-style: fixed seed, shared, with one unusual constraint — *"you start with one IP address," "patching
  costs double."* Leaderboard resets daily. **A cheap content engine that keeps the meta honest.**
- **Seed it from a real-world-inspired event mashup** — *"this is exactly what a Redis-auth +
  Black-Friday combo day feels like."*
- **Fairness spec.** Three curated tiers per day (like the NYT's puzzle sizes), difficulty-tagged, and
  modifiers drawn **only from the already-learned system space**, so a daily never tests something the
  campaign hasn't taught. A brutal fixed seed otherwise poisons the habit loop.
- **Social frame spec.** Fixed seed derived from the **date string**; leaderboard = (survived waves,
  MRR kept, ***funniest failure tag***); the 30-second incident-documentary clip auto-posts with the
  day's number; and the daily always renders in the **published-only red-green palette** so clips from
  any era stay readable. **Every share is a legible ad.**
- **The punch card.** The daily arrives as a literal **Hollerith punch card** in your inbox tray —
  holes are constraints — and submitting your run **staples it to the communal board.** NYT-puzzle
  energy with museum-object charm.
- **The Incident Tarot** — a daily fortune card (*"Beware the Idempotent Retry"*) that secretly encodes
  the day's modifier: the card **is** the hint. Collecting the full deck is an achievement with a
  hidden rule (*"the 13th card is always the UPS relay"*).
- **Fire-Drill Micro-Mode** — the 90-second daily trainer: one incident drawn from **your own run
  history** (or the community corpus), four actions, one grade. A Duolingo-streak habit loop that
  teaches incident-command grammar in bite form.

### Sandbox / Architect / Lab / Zen / "Rack Builder"
Unlimited money, no threats, build what you want.

**How it works:** For designing, for screenshots, for learning, and for the players who just want to
arrange a beautiful datacenter. **Chill Mode / Dream Datacenter** with optional ambient audio only.
**Never underestimate how many people will play only this** — so give it the art budget that implies.

**Expansion (art + toy):** Sandbox should default to the **Aquarium** idle camera (§9.7) after 60
seconds of inactivity, ship with **Photo Mode** unlocked, allow **free palette selection across all
unlocked line skins** (a sandbox player wants to build a GPU hall in tape-vault lighting), and include
a **blank-facility preset** showing the Zero-State art at its best. Add a **cable-neatness score** and
a shareable rack-elevation export. And add the button that makes it a game: **STRESS TEST** — press it
and the sim tries to kill what you built, at 4×, with the cascade fuse visible. **This mode is the
game's screenshot engine and its marketing department.**

**Interacts with:** §9.10's exports, the What Would Break tool (§9.2), Photo Mode.

**Variations and additions**

- **"Home Lab" mode** — no waves; break things for free; **restore drills as a zen sim.**
- **Blueprint Sandbox** — no economy, no threats, pure diorama builder with photo mode and shareable
  save-links ("show me your rack porn"). Shared blueprints can then appear **as decoys and mirrors** in
  the campaign's trade-show.
- **"Build Your Empire"** — no lose condition, pure creativity, scale to a global cloud. The tycoon
  mode for players who want the map, not the pager.
- **Homelab Zen Mode** — post-campaign: no waves, no clock, just LEDs, the hum, cable tidying and
  firmware updates for fun. **The reward for a career spent fighting entropy.**
- **Museum / free-play "Diorama mode"** — post-level, build and dress a miniature DC with no enemies
  and **earnable props from past levels** (a seized rack, a GPU monolith, the vendor cart), with
  photo-mode share. An Animal-Crossing tail-end for an ops game.
- **The Off-Season** — revenue-drought interludes where you run experiments (build the tape robot, try
  the new hypervisor): a sandbox with **high unlock value and zero stakes.** Teaches by play.
- **The Dark Fiber Sandbox** — a bonus level on a long fibre route with no customers and no threats:
  just a fibre line, some routers, and the goal to **light it and find the first customer yourself.** A
  zen puzzle with a lonely ending, and a sequel hook.
- **The split, stated:** campaign for the arc, sandbox for the builders, endless for the leaders.

### Co-op NOC (asymmetric information)
Two to four players, one infrastructure, **asymmetric information.**

**How it works:** Each player sees different dashboards and must communicate. One is on the network
overlay, one on the application, one on the customer tickets, one on the facility floor. **Incident
response is a communication problem, and this mode is about that.** Plus **shift handoff**: a player
leaving must brief the player arriving, and what they forget to say is the next incident.

**Expansion — the hard rule the design implies: no player may ever see the whole board.** Give each
seat a genuinely partial view, make the overlaps deliberate, and make the win condition require
information that no single seat has. **Add one more rule to make it playable without voice chat: a
private view and a shared artifact.** Everyone writes into **one shared incident timeline** that all
seats can see; all coordination flows through it. It gives the mode a diegetic voice channel, it
produces a postmortem automatically, and it makes the handoff mechanic work for people who don't have
a headset. The visual version — *"Two Datacenters, One Phone"* — gives one player the physical floor
and one the network/logical view, literally different overlays of the same facility, with the Locate
Beacon as the communication tool. Built-in comedy, built-in tension.

**Also:** pull **shift handoff out into single-player** (see The Handover) — it's too good to leave
behind a multiplayer paywall.

**Variations and additions**

- **"Follow-the-Sun."** Two players, two regional maps, **live handoffs of the same customer base**, and
  **one shared global SLA**; the failover link is a shared object requiring negotiation.
- **"Follow the Sun, the Real Version"** — player A's *end of shift* is player B's handover: you
  annotate live incidents on the dispatch board and leave **runbook cards with half-burned timers**, so
  you inherit **decisions in flight**, not save-states. The incoming player's map is literally lit by
  the outgoing player's lighting. **A bad handover is a co-op argument; a good one is a war story.**
- **Split-role rosters proposed, all compatible with the "no player sees the whole board" rule:**
  *Security Ops vs Capacity & Money* (A wants MFA everywhere, B hates the latency tax) · *Threat lane
  vs Customer lane* with a shared money pool ("your shiny DB is bleeding Stringers into my board!") ·
  *Facility vs NOC* with the ticket queue between them as the shared interface · *Two Chairs*, network
  vs capacity-and-staff, where neither sees the other's tier-1 alerts and **the role tell is each
  player's cursor skin** · *NOC + NOC asymmetry*, one physical/racking, one logical/defenses/pricing,
  each seeing **a different HUD layer of the same map** (cable-cam vs graph view).
- **"5-Minute Warning"** — one player is network/infra, one is security/abuse desk, on a shared
  economy, and **the incident feed that pages one partner delays the other's view.** Communication is
  the game.
- **Squad & Stack (up to four)** — one ops infra, one incident response, one comms/legal, one customer
  success, on one shared balance. Great emergent comedy and roleplay.
- **The NOC shared control wall** — two players split desks and comms are **ticket comments left in the
  world as sticky notes on each other's screens.**
- **Night-shift drop-in co-op** — the second player runs the ticket board while the on-call hero fights
  the alarm cascade. The lowest-commitment door into the mode.
- **Open question (carried):** is the asynchronous rival-hosting-company mode compatible with
  synchronous co-op, or are they alternate modes for different sessions? Both were proposed
  independently and both occupy the same *"another party affects your board"* space. Worth deciding
  whether they can coexist in one session.

### Co-op: Ops and Commercial ("Two Departments" / "Two-Person On-Call")
One player runs Ops, one runs the Business, sharing one cash bar.

**How it works:** Ops owns the board, the defenses and the incidents; Commercial owns pricing, sales,
support and comms. They share a budget and must argue about it. **They will fight. That's the
feature.** The sales player selling an SLA the infra player can't meet is **the single best comedy
engine available** in the whole design, and it's also how the real tension in a hosting company works.

**Interacts with:** §6's P&L, the SLA system, the status-page voice mechanic (§9.3).

**Variations and additions**

- **The founders' split.** Player A commands the infrastructure TD (placement, defenses, ops); player B
  commands the business lane (pricing, funnel, support tiers, sales). **The whole thesis is that the two
  halves lose together** — B oversells, A can't deliver.
- **The pitch writes itself:** *"one of you promises uptime, the other has to build it."* Every tower
  has a price and every customer a load, so the mode forces exactly the conversation the design is
  about.
- **CTO & CEO framing** — one owns net/infra/defenses, the other funnel/pricing/support staffing, and
  **victory requires the business**, not just the uptime.
- **Design the quiet phases too:** both seats need a fun job during peacetime (one builds, one plans or
  purges), or the commercial player is spectating for the half of the level that matters most to them.

### Versus / Red vs Blue (and the drafted-deck version)
One attacks, one defends, live.

**How it works:** The attacker picks tools and timing with a budget; the defender responds.
Asymmetric, tense, and it makes the bestiary matter. The attacker's UI is a **dark, minimal terminal
that only shows what reconnaissance has revealed** — so the two players are playing visually opposite
games. Enormous style opportunity.

**Expansion — a live, free-form asymmetric mode is very hard to balance.** Propose the proven
structure instead: **both players draft.** One drafts a threat deck (roles, affixes, budget), one a
defense deck (builds, policies, doctrine). The attacker then spends their budget against the
defender's board over **eight timed waves**, with the defender holding a small live reserve. A
simultaneous **blind pre-commitment** round before resolution turns it into a bluffing game about
threat modeling. Asymmetric, snappy, spectator-legible — and it turns the threat-role taxonomy and the
Coverage Grid into a **competitive metagame**, which is how asymmetric PvP stays interesting past
week two.

**Tension:** ⚔️ Free-form live Red vs Blue is more thrilling and nearly unbalanceable; drafted
deck-vs-deck is balanceable and slightly less visceral. Keep both on the table; ship the draft version
first because it costs almost no new simulation.

**Variations and additions**

- **"The Outage Wars" / Attack-a-Friend.** Two hosts mirrored; you **rent *their* attackers** (grey
  hats) to send subtle sabotage into their lane, judged on who kept customers longest — toxin exchange
  in a real TD. The **stresser economy becomes the multiplayer economy**: player B spends their own MRR
  to buy waves against player A's datacenter.
- **"Shared River" (two-player, one map)** — one board, two companies, and the customer river **forks
  between you**: poach with price signs, leak spam-mould onto their lanes with an attack card, and
  **win by skyline glow at dusk.**
- **Two-Player Rival Datacenters** — head-to-head on mirrored boards with a **shared customer pool**,
  each able to launch attribution-plausible dirty tricks; you win by poaching the rival's entire
  customer base. **PvP with hosting flavour instead of nukes.**
- **Build-battle "Spam Duel"** — send *cosmetic* nuisances (a bot swarm, a review storm, a warrant) at
  an opponent's map; everything stays legible because **both players share the shape-code language.**
- **"Incident Duel"** — the fully asymmetric version: one player is the attacker, one the defender.
- **Fairness rails.** A **tech-parity clamp** (rented attackers capped to threat families the defender's
  tier could legitimately face); attacking costs the attacker's **own customers' patience**, so war is
  mutual bleeding; and **no live-scumming** — the defender's snapshot comes from their declared
  "practice hall," not their last real loss. The postmortem-replay doubles as the legal fixture.
- **Anti-grief fix.** Live attacker budgets spiral into grief loops, so attack the friend's **saved
  snapshot** (async ghost wars reusing the ghost-race tech), with **symmetric intel** ("you're being
  probed") and an **automatic peace cooldown** after each hit. All the schadenfreude, none of the
  resignation.

### Attacker Mode / Reverse TD interlude
Play the other side.

**How it works:** A limited-length mode where you build a botnet and attack an NPC (or your past
self's) infrastructure. **Teaches defense by requiring offense**, and it's the best possible bestiary
tutorial. You win by making downtime, not by killing — which turns every threat in the bestiary into a
purchasable, **a very cheap way to double the content.**

**Expansion — make the reward specific.** "You learn each threat's pathing rules from the inside" is
vague. Concretely: any threat you have **personally used** is permanently marked in your Codex with
its **decision function** — what it targets, what makes it give up, what it does when blocked. That is
a real, legible, permanent advantage, and it makes the interlude something a player will *choose*
rather than tolerate.

**Variations and additions**

- **Rent booters, scan for CVEs, breach a rival host** — same maps, flipped objective. Teaches defense
  by offense, and unlocks "red team" flavour in the main game.
- **Plan-the-DDoS spin-off** — pick threat decks and time **multi-vector waves** against an AI-run
  datacenter's defense topology. Deeply educational: it shows *why* the defenses matter.
- **"Boot Sector: The Prequel"** — play one level backwards as the attacker breaching a rival's setup:
  a **stealth-puzzle** mode that teaches the defense systems by violating them.
- **"Audit Invaders"** — you ARE the red team hired to breach a competitor's hosting company; all your
  knowledge inverts. Unlocks the pentest staff branch.
- **"Multi-Tenant You"** — *players are the tenants* of an AI-run mega-host and build **legitimate
  red-team attack chains** against their board, scored by what you found. Teaches offense and **seeds
  the next campaign's threat table.**
- **"You Are The Outage"** — a budget of bots and booter contracts against a scripted or rival host's
  defenses.
- **Rules of Engagement twist — *don't touch what you didn't buy*.** A scoping minigame where your
  rented botnet hits the **wrong customer** of the target (the collateral-damage reality of IP-range
  attacks) and you eat an abuse-relationship penalty. **Offense as precision, not volume.**
- **The booter-storefront loop** — rent DDoS with real in-game economics and learn which of *your own*
  defense builds are "for sale" weaknesses. The inverted mode becomes the red-team tutorial engine and
  a PvP practice ground.
- **The Regulator Campaign** — the other inversion: play the **auditor**, touring AI-generated hosting
  companies under time pressure, citing violations and scored on fines levied. The inspector's-gaze
  light-cone weaponised for comedy (the unpatched exposed DB, the log-less bastion, the janitor with
  root) — and your own playstyle gets rated: ***"Would you pass your own audit?"***

### Async "Attack My Network"
Share your build as a puzzle for others to break.

**How it works:** Your topology is published; others attempt to find its weak point. You get their
attack reports. **Community-generated difficulty**, and a brutal architecture review.

**Note:** see §9.1's mode-tiering — this is honestly a stretch goal, and naming it as one stops it
competing for design attention.

**Variations and additions**

- **The Dark Forest Sandbox** — the honest extreme: **your own boxes can be attacked by other players'
  bots.** Every facility is also a threat source for someone else's level, which completes the circle of
  abuse and is mechanically truthful — your open resolver *will* be discovered and used, and you can
  exploit it or fix it.

### Competitive Market Mode / Market Share
Multiple companies in one market.

**How it works:** 2–4 players, shared customer pool and shared demand, real price competition,
poachable staff and customers, public reputation, and the occasional suspiciously well-timed DDoS.
Customers flow to whoever serves them best, so it's **indirect competition** — better than direct
combat for this theme. Undercutting someone below their COGS is a valid, hilarious strategy.
Occasionally a shared event (an upstream outage, a hardware recall, a CVE) hits everyone at once and
lands differently based on their choices. **The business layer as a multiplayer game.**

### Hot-seat: "Two Companies, One Keyboard"
Local competitive, one month per turn.

**How it works:** Two players alternate months in the *same* market, each running their own company,
each seeing the other **only through public signals** — the status page, the trade press, review
scores, price changes. Turn length is one business month. Cheap, local, and **the information
asymmetry is the entire game.**

**Interacts with:** Competitive Market Mode, §2.11's Competitor NPC.

### Historical Scenarios / Historical Reenactments
Recreations of famous infrastructure disasters, serial-numbers filed off.

**How it works:** The BGP leak that took out a continent. The certificate that expired on a holiday.
The config push that removed every route. The DNS provider taken down by a botnet. The cascading retry
storm. The region that lost a whole AZ. The fire-suppression discharge. The undersea cable cut. The
leap-second bug. Each with **period-correct tooling** and a wry epilogue card. **You know it's coming
and you still can't stop it**, which is the point. Great educational hook and great marketing —
playable industry folklore.

**Interacts with:** §9.5's Postmortem Library, which turns this from a level pack into a permanent
system.

### Historical Campaign / Through the Eras
A campaign spanning decades.

**How it works:** Start as a BBS (1988) or dial-up ISP (1995) and survive to a GPU host in 2025,
transitioning your business four or five times: BBS → ISP → shared hosting (2003) → VPS (2010) →
cloud (2016) → GPU/AI (2024). **Each era's winning strategy becomes the next era's losing one**, which
is both fun and *true*. **The most ambitious mode here and the best premise.**

**Interacts with:** §5.6's Pivot, the era chrome/skin system, the Museum's timeline corridor (§9.4).

**Variations and additions**

- **The 1998 Prequel Campaign** — an entire game on **one pegboard with one modem bank**: all beige, one
  customer type (dialers), one threat (a kid with a port scanner). Teaches the full loop in miniature
  and **ends with the Y2K boss.** The best possible tutorial-shaped standalone.
- **"Kernel Panic of '99"** — historical era scenarios as their own arc: the 56k ISP boom and bust, the
  dot-com hosting mania, the great spam years.
- **The Old Internet as a playable timeline** — dial-up ISP → Usenet era → web-2.0 boom → the cloud era,
  with **period-accurate threats**: wardialers → worms → ransomware → AI-jailbreakers.
- **Legacy Media rendering** — retro levels presented **as a 1996 web page** (frames! under
  construction!): the dial-up ISP levels literally appear as Netscape with server-status GIFs. An era
  aesthetic goldmine, and free chrome for work the skin system already does.

### Campaign+ / New Game+ / "The Incumbent"
Replay with your knowledge and a fraction of your tech.

**How it works:** See §5.5's Rediscovery. Harder threats, tighter money, and the levels you found hard
are now the tutorial. The **"Incumbent"** variant is better still: restart with your endgame company
intact, but **now you are the big slow one**, and a scrappy competitor is doing to you exactly what you
did to everyone else.

**Variations and additions — the prestige ladder**

A family of distinct NG+ frames, each replaying the campaign through a different business lens:

- **Acquisitions** — replay levels as an investor rolling up failing hosts: same maps, inverted
  objective (fix P&Ls, cut costs, keep or strip customers).
- **Sell The Company** — exit to a PE firm; the cash carries to a new garage startup with permanent lore
  unlocks and **the same mistakes re-armed.**
- **Private Equity Edition** — forced margin extraction, quarterly covenant stress, and cost-slashing
  temptations (cut support! fire engineers!) trading short-term cash for long-term churn decay. **A
  scathingly fun critique of roll-ups.**
- **Scale-Up** — start with your reputation and one carried-over staff archetype, **but the threats
  learned you too**: mirror builds.
- **Legacy Cruft** — NG+ carries your reputation *and* your accumulated legacy: the ancient PHP app you
  can never remove, the zombie rack from the acquired company that hums ominously. **Strength carries
  flavour-cost.**
- **You Get Acquired** — post-campaign a mega-cloud buys you; replay with cosmetic hyperscale assets,
  bigger numbers, and passive-aggressive corporate dashboards. The humour is the point.
- **Serial Founder** — keep knowledge unlocks (runbooks, playbook discoveries) but **zero customers**;
  market conditions have evolved and **your previous brand lingers as a competitor AI.** You play
  against your own old company.
- **Reputation Mode** — your past runs' dashboards hang on the wall of later games, and customers arrive
  *citing them*: *"saw your 99.99% on Dashville, I need that."*
- **Bureaucracy Mode (the look)** — the compliance NG+ re-skins **your own HUD** with more approval
  stamps, required checkboxes and a slow loading-time POST. **Difficulty delivered as interface friction
  you can feel.**

**⚔️ The compliance-NG+ caution.** Making your mature toolkit a *punishment* inverts the power fantasy.
Frame it as **"they prepared, you prepared"** — the adapted threats arrive *with* your automation tier
bumped — and keep it opt-in. And note that the **"surface grows with tech" law is the game's thesis**,
so it should live in the base game (feature-fatigue pricing on tech), not only in a mode veterans touch.

### Minimalist Mode
The whole game as a terminal.

**How it works:** CRT aesthetic, text-only, no diorama. Cheap to build on top of the existing
simulation **and will be somebody's favourite way to play.**

**Cost correction:** it's only cheap **if the CRT style has a complete glyph set** — which means
authoring an ASCII/box-drawing equivalent for every unit, state and alert. **State that as the actual
cost**, and then take the bonus: that glyph set **is** the Shape-First accessibility mode in another
skin. **Build it once, ship it twice.**

### Speedrun ("Zero to Nines" / "Zero to Rack" / "Ship It")
Timed progression challenges.

**How it works:** Fastest to your own ASN. Fastest to 99.99% sustained. Fastest to a full rack.
Fastest to $10k MRR, consequences be damned. **Leaderboards without needing a competitive mode** — and
the game **should be beatable irresponsibly**, because that's fun and it creates community.

### Hardcore / Ironman / On-Call
No pause, no undo, one save, cash never resets.

**How it works:** For the people who will ask for it. **Should be a toggle, not a separate mode.** The
natural home for the Scar system and permanent consequences. The honest mode.

**Variations and additions**

- **Hardcore "Production" Mode** — one life, **no pause** (well, a 5-second grace), real-clock pacing;
  levels run 6+ compressed hours and you deploy on maintenance windows. Built for the incident-sim
  audience. (See §9.6's pause conflict — this is the position that a full freeze should cost something.)
- **"Real Outage" permadeath** — a single bad decision ends the run. The Friday-deploy mode, taken
  literally.
- **"Real-World Mode"** — outages can trigger at 4 a.m. and **your *session* can be paged.** Alongside
  it, **"Regulator Mode"** (audits always) and **"Startup Mode"** (random market events) as NG+ replay
  knobs rather than separate modes.

### The business modes
Different starting conditions that reweight the entire game.

**How it works:** each is a preset of capital, obligations, customer book and scoring weights —
cheap to author, and each produces a genuinely different puzzle from the same simulation.

- **Bootstrapped** — no financing available at all; every dollar comes from a customer. Pure cash
  discipline.
- **VC-Backed** — infinite early cash, mandatory growth targets, and a board that forces you to
  destroy your own margins. **Losing by "succeeding" is the designed ending.**
- **Roll-Up Tycoon** — you never build anything. You only acquire. Every level is a diligence,
  integration and retention problem. **A genuinely different game using the same systems.**
- **The Turnaround** — you inherit a dying host: 40% churn, a furious customer base, a failed audit,
  five months of runway, and rotten infrastructure. **The most interesting starting position in the
  genre.**
- **Bulletproof Run** — a high-score cash-extraction mode with a **heat meter** and an **exit timer**.
  Explicitly framed as a morally grubby side mode, with the earnings unusable in the main campaign.
  (See §9.11's responsible-depiction rule: the line's arc must *end* somewhere.)
- **Landlord Mode** — colo only. Slow, lease-driven, WARCT-scored. Almost a real-estate game.
- **Niche Run** — one hosting type only. Mastery over breadth.
- **Solo Founder / "Nobody Is Coming"** — one pair of hands, forever; you never hire. Every automation
  is the only way to scale, vacations are impossible, and the win condition shifts from growth to
  **sustainability**. Explicitly a mode about whether you can build something that doesn't need you —
  **the actual ambition of most one-person hosting companies.**
- **Free-Play Sandbox** — pick a hosting type, a market, a starting capital and a difficulty mix.
- **Ethics toggle** — whether the grey-area revenue is available at all.
- **Multi-Brand** — run three brands on one infrastructure with one staff. Score on blended margin
  with a penalty for **brand-linkage events** (someone notices the budget brand and the premium brand
  share an IP range, a support queue, or an outage). **The most commercially realistic mode available
  and a genuinely different puzzle.**

**Variations and additions**

- **"Terms of Service" Mode (hardmode)** — every business-risk clause amplified: every SLA is
  max-severed, every contract is naked, abuse policy is whatever you can get away with, and regulators
  spawn more often. Tagline: ***"All risk, no cover."***
- **Faction choice as a preset** — pick an operational philosophy at start: **"Cowboy"** (fast, risky,
  big spikes, disasters) vs **"ITIL"** (slow, boring, resilient, lower revenue). Genuinely different
  playstyles from the same simulation, and it reads as identity rather than as a difficulty slider.

### Mode: The Analyst
You play the *buyer*.

**How it works:** Given a data room and 20 diligence requests, you value a target and recommend a
price. You then watch a **3-minute simulation of what actually happens post-close.** The best possible
way to teach the player what their own company looks like from outside, and **a brilliant use of the
existing simulation with zero new systems.**

**Interacts with:** §6.9's diligence report, the Investor Dashboard Lie (§9.2), Auditor Mode.

### Mode: Auditor Mode (post-game)
Replay a finished level as the diligence analyst.

**How it works:** You go back through a level *you* already played and find every shortcut you took —
the single-fed rack, the undocumented dependency, the grandfathered plan, the unlogged change. **A
brilliant, cheap way to teach the systems**, and mortifying in the right way.

### Mode: The Agent
You play a channel partner with no infrastructure at all.

**How it works:** Just relationships. You place customers with hosting companies (some of them
player-built) and earn residuals. **Your "threats" are the providers failing your customers**, and your
defense is diversifying which providers you sell. Inverts the whole game without touching the sim.

### Mode: Quarter Close
Three days to the end of the quarter.

**How it works:** A number to hit, a pipeline, a discount budget, and a board waiting. Ten minutes,
infinitely replayable. **The business analog of Incident Mode.**

### Mode: The Investor Update
Once a month, you write the update.

**How it works:** You choose which metrics to lead with and which to bury. Your investors' confidence
(which gates future capital) responds to the update; your **credibility** responds to whether the
numbers you emphasized hold up next month. **Selective honesty as a resource with a memory.**

**Interacts with:** §9.2's Investor Dashboard Lie, §6.9's diligence report.

**Variations and additions**

- **Optional "Investor Mode" alternate ruleset** — rather than an interstitial, a whole-run frame: the
  player must periodically satisfy an outside investor's demands (growth targets, dividends) instead of
  freely reinvesting profit. Framed deliberately as **a distinct harder variant, not a mandatory
  base-game system.**

### Line Draft
A roguelite structure for the variety engine.

**How it works:** At the start of a run you're offered three hosting lines and pick one; at each
milestone you draft another from three. **Every run is a different portfolio**, and the synergies and
antagonisms make the draft a real decision.

**Expansion — it needs the standard draft affordances to be a real draft**, plus numbers (see §0.2):
a **visible pool** (what could still come), a **rarity tier** (some lines are rare and swing a run),
and a **pivot cost** (drop a line mid-run for a partial refund and a specialisation penalty). Those
three turn a pick-one screen into a drafting game.

### One Building, Four Lines
A constrained challenge.

**How it works:** Run four different hosting types in one facility with shared power, cooling, staff
and network. **Every line's needs conflict** — the GPU line eats the power the colo tenants were
promised, the backup line's month-end window collides with the game line's release day, the regulated
line's audit scope swallows everything it touches.

### Landlord vs Tenant
The same facility, two perspectives.

**How it works:** Play a level as the colo operator, then replay it as one of your own tenants, with
all the information asymmetry that implies. **The most illuminating design in the document about what
hosting actually is.**

**Variations and additions**

- **Landlord Mode (NG++)** — the tower you spent the game defending is now **the map you rent out.**
  Tenants — *including your own previous save files as guest hosts* — build, break and generate your
  abuse tickets; you profit from power, cage space and cross-connects, and you fear their disasters on
  your UPS. Threats become **entirely facility-shaped.** The final twist: your best tenant keeps getting
  breached, and **you choose to be the honest landlord or the willfully-blind one.**

### Tenant Mode / The Inverted Level
You are the customer.

**How it works:** You're a customer *inside* someone else's facility — AI-run or player-run — which
turns **their** reliability into **your** terrain. A harder variant: evaluate three hosting providers
by running workloads on them and picking one. **Teaches the system from the other side, and makes you
hate yourself.**

**Interacts with:** Landlord vs Tenant, §9.2's Reverse Colo, the Dependency Web.

**Variations and additions**

- **Play as the Customer (inverted empathy mode)** — one level, or a full spin-off, where **you are a
  bakery migrating to a host**: you navigate marketing beacons (temptation towers), price-sign traps
  (grandfathering!), onboarding gauntlets, and **the horror of watching your site die during someone
  else's outage.** Your bakery's patience ribbon sits on screen the whole time. **No player looks at
  churn the same way afterwards.**

### The Night Shift / "On-Call Night"
One level played entirely at 3am.

**How it works:** Half staff, alarms only, **no building allowed** — you can only operate what already
exists. Pure incident response. As an endless variant, a single night shift with escalating incidents
where the screen slowly dims toward dawn and the coffee cups accumulate on your desk **as a visible
timer**. Score = incidents survived. **The most atmospheric mode in the design and the one that best
captures the actual job.** Tense, short, memorable.

**Variations and additions — the compressed-panic family**

- **Endless "On-Call Weekend"** — incidents stack with escalating severity; score is how long you keep
  the pager up, against a literal **sleep meter.** Pure triage pressure.
- **"Night Shift" endless** — pure survival, escalating incidents, **zero building**; score = average
  MTTR. The roguelike of on-call.
- **Night Shift mini-mode** — it's 03:00, one on-call hero, alarms cascade: a **pager-frenzy rhythm game
  of priority calls**, scored on how little you broke. A palate-cleanser and a great co-op drop-in.
- **"The 4 a.m. page"** — the screen goes dark and red, **PAGER OUT**, and a mini-game of waking up and
  triaging while the world burns. Its quiet-stretch sibling is **"The 3 a.m. Escalation"**: a one-shot
  decision (wake the senior? restart the box? tweet about it?) with real consequences. **Atmosphere, not
  tutorial.**

### The Handover
The most under-dramatized moment in operations: the shift change.

**How it works:** You play the **second half** of an incident someone else started. You inherit their
notes (incomplete), their half-finished actions (one is still running and you don't know what it
does), their hypothesis (wrong), and their customer communications (which promised something you can't
deliver). **Scored on how quickly you discover the wrong hypothesis.**

**Note:** the co-op version already exists in Co-op NOC — but the **single-player version is better**,
because the game can author the previous shift's mistakes *deliberately*.

### Chaos Mode
The game breaks something random every N minutes, Netflix-style.

**How it works:** A run modifier rather than a standalone mode. Pairs with the chaos lab and the What
Would Break tool (§9.2) — one is practice, this is the exam.

**Variations and additions — card-driven chaos**

- **Chaos Card Draft (in-run difficulty)** — at each breather, draft **1 of 3 modifier cards** that
  apply immediately: *"Black Friday coupon blast: +60% spawns, booters find you," "lay off a sysadmin:
  cash +, MTTR ++."* **Self-imposed difficulty as tempo play**, and it is the same card language the
  daily-incident seed uses.
- **"War Stories" endless with modifiers** — **draft the level yourself** from incident cards ("add a
  noisy neighbour!", "make it rain (DDoS)", "a customer demands a refund"). Co-op table-top feel.
- **The event deck** — *"Black Friday," "Ransomware Tuesday," "CEO on a Podcast," "TikTok Takedown"*
  (your datacenter goes viral as mysterious architecture), *"EU Delegation Tour," "BGP Mistake
  (self-inflicted boss)," "The Price Increase Your CFO Demands."* Drives replay variety and **teaches
  scenario-forecasting.**

### The Sunset (the decommissioning level)
A late-campaign level where you must **shut down** a line of business gracefully.

**How it works:** Migrate customers, honour contracts, decommission hardware, wipe drives, produce
certificates of destruction, terminate leases, return IP space, cancel circuits. Scored on how many
customers you keep **on other products** and how cleanly you exit. **Nobody makes games about
decommissioning and they should** — it is the only level whose verb is *removal*.

**Interacts with:** §6.6's hardware afterlife, the Scream Test, §9.9's endings.

### Succession / The Handoff
You leave, and the game keeps running.

**How it works:** Score is how well the company runs for **90 days without you**. **The ultimate
measure of an ops engineer's work is what happens when they're not there.** Extremely poignant as a
final level. (See §9.9 for the ending variants built on the same idea.)

### The Pager Simulator
A masochist mode where the game can wake you up.

**How it works:** A mobile companion that sends **real** notifications during an in-game incident.
(Joke... mostly. It is a genuinely funny idea and half this audience would enable it once.)

**Interacts with:** §9.7's mobile companion / status page.

**Variations and additions**

- **The Pager as opt-in ambient play.** With consent, the game pings your **real** phone for rare,
  meaningful events on your idle save — a daily incident you didn't take, a renewal pulse that mattered
  — with a context-rich inbox on return. Explicitly **anti-FOMO: ignoring the pager costs nothing**
  except a smaller postmortem gift, and **the game apologises for interrupting you.** A joke about
  on-call culture with real teeth, and the honest way to ship the Pager Simulator's premise.

### Blind Mode
No monitoring at all, by design.

**How it works:** You only learn about problems from customer tickets. **A short, horrifying, extremely
effective way to teach why observability exists.**

**How it looks:** the board renders as a **flat grey wireframe with no telemetry at all** — shapes and
cables, no lights, no donuts, no rings — and the only coloured objects on screen are incoming tickets.
When the mode ends, the telemetry **floods back in** in one animation. **That flood is the lesson.**

### The Same Outage Six Ways
A showcase mode.

**How it works:** One event — a power failure, say — played out as six different hosting types: web,
colo, game servers, GPU, backup/DR, and regulated. **The purest demonstration of the variety engine**,
and a great demo/marketing mode.

### Museum Mode / The Era Gallery
A walk-through hall where each era's facility is preserved as a diorama with a placard.

**How it works:** Pure art showcase, doubles as a tutorial reference, and **makes the era work pay off
twice.** Folds into the Company Museum (§9.4) as its public wing.

### Photo Contest / Rack Gallery
Community screenshots.

**How it works:** Submit your build; browse others'. **Cheap, social, and it rewards the art.**

**How it looks:** the gallery is **a physical print wall** — a grid of pinned photographs with the
submitter's company mark and tier in the corner card, browsable with the Orbit camera. Consistent with
the house rule that *nothing is a pop-up if it can be a thing.*

### ⚔️ Mode tiering — twenty-six modes is too many, and none of them are prioritised
**The problem:** several of the modes above are full games (Competitive Market, Co-op NOC, Versus,
Async Attack, Franchise). **Shipping a quarter of them well beats shipping all of them.**

**Proposed tiering:**
- **Ship with v1 (four):** **Campaign, Endless ("The NOC"), Incident Mode, Sandbox.** These four cover
  every audience and reuse one simulation.
- **Cheap additions once those exist (four):** **Daily Outage** (a seed + a leaderboard), **Puzzle
  Mode** (authored data), **Speedrun** (a timer + goals), **Minimalist Mode** (a render swap — but see
  its glyph-set cost above).
- **Post-launch, in priority order:** Line Draft · The Consultant · Through the Eras · The Same Outage
  Six Ways · Co-op NOC · Historical Scenarios.
- **Probably never (name them as stretch so they stop competing for design attention):** Competitive
  Market, Franchise, Async Attack.

**Tension:** ⚔️ This tiering demotes Co-op NOC, which another lens calls "the best multiplayer idea
here," and The Consultant, which a third calls "the highest-return single addition to the modes
section." The disagreement is about *cost*, not quality — both are right that the ideas are strong and
right that they are expensive. Decide by prototype, not by argument.

### Ghost Datacenter races
Async multiplayer with no netcode.

**How it works:** Race an **async ghost** of a friend's build on the same scenario; at the end **their
uptime graph underlays yours.** Passive multiplayer, huge shareability, and the same technology the
anti-grief version of Attack-a-Friend needs.

**Interacts with:** Daily Outage, Versus (async snapshot attacks), the Uptime Ribbon (§9.4).

### Friday 5PM Deploy Mode
An arcade spin-off: **only deploys and failures.**

**How it works:** Night palette, rollback economy, the whole loop in five minutes — the deploy/rollback
system shipped as a standalone snack. *[EARLY, best teaching level for the change-induced failure
class.]*

**Note:** the *"please deploy on Friday"* challenge framing predates the arcade spin-off and also works
campaign-side, as a run modifier on any level — same gag, two homes.

**Interacts with:** §9.2's Friday-deploy risk meter, the change freeze calendar, "It's Always DNS"'s
honest counter (change-induced is the biggest bucket).

### Cable-Management Leaderboard (weekly zen)
Tidy a provided spaghetti disaster on a timer.

**How it works:** Judged by **a tiny interior-designer NPC with a monocle and a scorecard**, and it
cross-posts with Photo Mode. A weekly, wordless, extremely shareable competition built entirely from
assets the game already has.

**Its campaign-side siblings:**
- **As a hidden grade component** — tidy parallel runs vs rat-nest sprawl; sloppy management gives a
  slow **fire-risk debuff** and a visual gag (the inspector NPC shaking his head as he walks past).
- **The Rat King of neglect** — if cable management stays terrible too long, the chewed-cable rats
  coalesce into a tiny, harmless **Rat King** that sits on the worst rack wearing your shame. Tidying
  disperses it with indignant squeaks.
- **The Janitor NPC** — a silent janitor walks the racks; ignore cleanliness (cable clutter raises dust
  meters) and the hot aisles get worse. There is a hidden **"perfect datacenter" ending where the
  janitor nods at you.**

**Interacts with:** §9.6's "make the boring thing beautiful", Photo Mode (§9.10), the office set
dressing (§9.3).

### Support Hero / Support Hell (the queue *is* the game)
The ticket queue promoted from a subsystem to a whole mode.

**How it works — Support Hero:** a Papers-Please-scale mini-game where **the ticket queue is the
screen.** Read tickets, choose replies (correct / diplomatic / BOFH), **detect the Support-Ticket Trojan
before acting**, and keep CSAT green through the day's arc — morning ramp, noon deploy, **the 4:59pm
bomb.** Each "day" is a level, and the escalation trees teach incident command in text. **It is also the
best possible tutorial for the main game's ticket queue.**

**How it works — "Support Hell" (challenge):** survive **30 days with a broken product, a hostile review
site and 400 tickets/day** on one junior hire and a chatbot, scored purely on retention and NPS. **A
pure business-defense scenario with no network threats at all.**

**Sibling — "Startup Sim Lite" (no-threat economy interlude):** a pure-optimisation level between
sieges — price, provision, hire — that doubles as a palate-cleanser and sets up your war chest for the
next scenario. *Together, Support Hell and Startup Sim Lite prove that **business itself is a defense
game.***

**Interacts with:** §9.3's ticket generator, Co-op: Ops and Commercial, Quarter Close.

### "War Dialing" Retro Mode
An audio-forward dial-up variant.

**How it works:** The map **is** a range of phone numbers, literally scanned, and the attacker plays a
**modem-tone symphony** as they sweep it. The one level where the threat is something you *hear* before
you see. *[EARLY, era-locked to the dial-up ISP skin.]*

**Interacts with:** the 1998 Prequel Campaign, §9.3's 56k ASMR, the dial-up ticket pack.

### The Neglect Run (challenge mode)
Build a full stack, then **take your hands off for 30 in-game days.**

**How it works:** Zero clicks, zero maintenance, staff auto-behaviour only. A **reverse-roguelite**
scoring how long the machine you built runs unwatched, while certificates, disk fill, patch cadence,
backup freshness and rota fatigue all tick hidden clocks. **Every survived day is a design review of your
own automation**, and the leaderboard's **cause-of-death histograms are the funniest postmortem the game
can print.** *[LATE, best risk/reward — it requires a mature build to be interesting at all.]*

**Its meta-joke twin:** a flavour event stating plainly that **the player is the single point of
failure** — the biggest remaining risk is you going on holiday.

**Interacts with:** §9.2's Vacation mechanic and Long Weekend, §9.9's Succession, the automation tree.

### "Five-Nines Club" and "Compliance Bingo" (the two trophy challenges)
Single levels engineered to be *almost* impossible.

**How it works — Five-Nines Club:** 99.999% uptime — **5.26 minutes of downtime per year** — under full
random failure pressure with everything you have unlocked. Leaderboard = seconds survived without
dropping a request. **The industry's folklore number as the game's hardest trophy.**

**How it works — Compliance Bingo:** pass a HIPAA audit with **only used hardware and one staff
member.** The same joke from the paperwork side.

**Interacts with:** §9.2's Compliance Theater Meter, the SLA system, §9.3's achievement tier.

---

## 9.2 Twists and systemic wildcards

### Your Past Self Is The Boss
The best twist in the document.

**How it works:** A late-campaign level hands you the infrastructure *you* built in an earlier level,
now three years old, undocumented, and someone else's problem — which is to say, yours again. **Every
shortcut you took is now a monster.** Nothing else in the genre does this.

**Expansion — make it literal, automatic and systematic rather than a scripted one-off.** The level is
**generated from the player's own save**: the actual topology they built in a specific earlier level,
aged by three years (patch lag accrued, documentation decayed, staff turned over, one component EOL,
two undocumented dependencies added by "someone"). Underneath, the game should be **recording habits**
throughout the campaign — did you document, did you standardise, did you leave snowflakes, did you
over-permission — and the returning board is **generated from those habits, not from a script.** A
player who was tidy gets a tidy inheritance and a smug feeling; a player who wasn't meets their own
ghost. **The most personal possible content, for the cost of a habit-tracker and a generator** — and
the strongest single argument for the Long Save (§9.9).

**Interacts with:** The Architectural Bad-Habit library, §9.9's Long Save, "Two Companies, One You".

### The Architectural Bad-Habit library
Procedural generation that isn't noise.

**How it works:** The generator for inherited, consultant, acquisition and Incident-Mode boards
**doesn't randomise topology** — it composes from a library of **recognisable real mistakes**:
*"everything on one PDU," "the replica is the backup," "one enormous box," "shared cache for sessions
and pages," "monitoring inside the thing it monitors," "the firewall rules nobody understands," "two
datacenters, no quorum," "a cron on a laptop," "the redundant pair on the same breaker," "the DR site
that has never been tested."* Each habit has a **signature look, a characteristic failure, and a Codex
entry.**

**Why:** infrastructure generated from noise is unreadable and unfair. Generated from a **vocabulary of
mistakes** it is legible, teachable and funny — and **the player's growing ability to recognise a habit
at a glance is the deepest skill the game can offer.**

**Interacts with:** The Consultant (§9.1), Incident Mode, The Inherited Mess, §9.5 education.

### The Inherited Mess / The Inherited System
Start a level with a facility built by "the previous owner."

**How it works:** Procedurally generated with deliberate anti-patterns from the Bad-Habit library —
single-fed racks, one cable doing two jobs, an undocumented box, things labelled **"DO NOT TOUCH"** that
you must eventually touch. **The first act is archaeology.** Partial documentation, at best.

**Hosting types:** universal, but it plays very differently per type — an inherited colo is a *lease
and tenant* archaeology problem, an inherited email host is a *reputation* archaeology problem, an
inherited GPU cluster is a *thermal and power* archaeology problem.

### The Ghost of the Previous Admin
Inherited systems come with a person's fingerprints.

**How it works:** In acquisition and turnaround levels, you find their labels, their scripts, their
naming convention, and a sticky note reading **"DO NOT REMOVE — ASK DAVE."** Dave left in 2019. **You
have to decide whether to touch it**, and the game never tells you what it does. Their conventions are
internally consistent and completely different from yours.

### The Legacy Box / "The Do Not Reboot Machine"
The server with 1,847 days of uptime.

**How it works:** It runs something important. Nobody knows what. It has never been patched. It cannot
be migrated. **Rebooting it may be the end of it**, and every month you don't, the risk grows.
Eventually you have to. **The uptime counter as a horror meter is a wonderful inversion** — in every
other game a big number is good.

One of the load-bearing files on it is a shell script named **`fix.sh`** that nobody wrote. It appears
on exactly one machine in every campaign, its contents are never shown, and **the game will not let you
open it.** The box hosts something absurd and critical. A running gag with teeth.

**Variations and additions — the untouchable legacy boxes**

- **The Legacy System NPC** — an ancient **COBOL** box you *inherit*: can't be patched, can't be moved,
  **earns rent**, and every late-game level a Y2K-shaped calendar event threatens it. **Managing what you
  cannot fix is the maintenance sim's soul.**
- **The look:** the COBOL server literally wears a **nightcap and leans on a cane** — terrifying to
  touch, earning money it doesn't spend.
- **Boss: The Legacy Codebase** — the customer-owned version: an ancient PHP 4 monolith that **refuses
  modernization**, immune to most upgrades, breaks when patched, emits weekly outages — and **you can't
  kill it, because it's a customer.** You host it and build around it. Final form: hire an archaeologist
  (a consultant) to migrate it.
- **Haunted hardware, generally** — a machine that boots only when addressed kindly; **the firewall rule
  nobody understands but everyone fears** (delete it and everything breaks, obviously); the **cursed
  rack** that nobody will admit is cursed, which works for years and breaks when touched; the Pentium 4
  you dare not touch ("it runs something important, nobody knows what"); **the rack labelled DO NOT
  POWER OFF** that turns out to be the building's HVAC controller.

### Documentation as a mechanic
Writing things down is a purchasable action with compounding returns.

**How it works:** Documented systems have lower MTTR, survive staff turnover, and make delegation
possible. Undocumented systems are fine until the person leaves. **The most undervalued real practice,
correctly valued in a game.**

**Expansion — it needs a positive, immediate, *felt* return or players will rationally skip it.** Three
returns, all immediate:
- **(a)** documented objects show their **purpose on hover** instead of `???`;
- **(b)** documented procedures become **one-click runbook cards**;
- **(c)** documented systems can be **delegated** — undocumented ones cannot. **Documentation is
  literally the prerequisite for having a team do anything**, which is the real reason it exists and
  which no game has ever modelled.

**The Documentation Twist:** the game also lets you **write your own notes on objects**, freehand. Late
levels, a co-op handoff, or simply a save you return to after a week hand you a facility you must
re-learn — **and players who documented are rewarded by their past selves.** Almost no game does this
and it is *perfectly* on theme.

**Interacts with:** the Vacation mechanic, Your Past Self Is The Boss, the Playbook (§9.4).

**Variations and additions**

- **Notes to My Future Self.** At the end of a level, write **one free-text note**; the next time you
  replay that map it appears **pinned to your in-world monitor** — your own past advice as a diegetic
  hint (*"the memcached box is the lie — CHECK IT AGAIN"*). Notes from *other players* can optionally
  pin, which makes it **async mentoring**, and the accumulated set becomes a museum of your own
  learnings. The cheapest possible version of the Documentation Twist, and the one most likely to make
  someone laugh at themselves.

### Technical debt as visible substance
Debt you can see by looking at the room.

**How it works:** A persistent meter that grows from every shortcut and **never goes down on its own.**
Paying it down produces **zero visible benefit in the moment** and is always the correct thing to do.
**The game's central moral.** Mechanically it is also an explicit, quantified **balance-sheet
liability** that accrues interest in the form of outage probability and slower build times — you can
pay it down, it's never the most urgent thing, **and that is the trap.**

**Visual:** it accumulates as physical mess — cable spaghetti, sticky notes, stacked boxes, dust, a
whiteboard nobody has erased, a literal pile in the corner that **periodically emits an incident.**
Split the mess across the **Wear Channel Triad** so the room tells you *which kind* of debt you're
carrying (deferred maintenance vs deferred cleanup vs deferred decision), and give paying it down a
**cleanup-pass animation** so it is a thing you watch rather than a number that drops.

**Interacts with:** §7.7, §9.6's "make the boring thing beautiful", the Slow Boss.

**Variations and additions**

- **Final Boss = Your Own Complexity.** The Act IV finale: the **Tech-Debt Golem** spawns from your
  neglected surfaces (config drift, unpatched units, sprawl wiring) **with HP equal to your accumulated
  mess-score.** The endgame is literally fighting the cost of everything you said yes to — and **every
  mechanic in the game pays off in that fight.**
- **The Tech-Debt Meter as an economy, not just a mess.** Every quick fix you ship to survive raises
  **future fragility**; you repay it with refactoring. The point is that the meter is *spendable* — the
  shortcut is a legitimate move, priced.

### The Slow Boss
A boss that isn't a wave.

**How it works:** A competitor who grows over ten levels. Technical debt that compounds. A
depreciation schedule that comes due. A grandfathered plan whose customer base quadruples. **The
antagonist is a trend line, and you can only beat it with decisions made many levels earlier.**

### The On-Call Clock
Someone is always carrying the pager.

**How it works:** A visible rotation. The person on call has reduced effectiveness the next day. Being
on call yourself is cheapest and burns *you*. **Sustainability as a mechanic.**

### The Vacation mechanic
Staff must take time off.

**How it works:** Refusing causes burnout; allowing it removes a hand for two weeks and reveals your
bus factor. **The most humane mechanic here and one of the sharpest** — you find out what only one
person knew when that person is on a beach.

**Expansion — make it a scheduled obligation with a visible calendar**, so it becomes a planning
puzzle rather than a random tax: everyone must take N weeks per year, **you choose when**, and the
weeks you choose reveal your bus factor **at a time of your choosing rather than the universe's.**
Deliberately scheduling someone's vacation in order to *test* your cross-training is one of the most
satisfying possible strategy-game actions, **and it is a real management technique.**

**Variations and additions**

- **Bus Factor as a visible stat.** Knowledge concentration shown as a staff icon with **a little bus
  counter**: hire pairs, write runbooks — or one resignation on Black Friday ends the game. Real, and
  spicy, and it gives the vacation calendar something to *read*.
- **The reward for cross-training is nothing happening.** The cheap-but-boring action that pays off
  precisely when the metaphorical bus arrives. **Negative-space teaching**, and the same shape as the
  Grounding check (§9.12).

### Career Mode — a life outside the pager
The most honest mode-twist available.

**How it works:** A parallel, small, **non-optional** meter: *your own life* — sleep, relationships, a
hobby, a holiday you've booked. Every 3am page costs sleep; every skipped weekend costs the other bar.
Running it to zero doesn't end the game, it **degrades you**: slower decisions, higher fat-finger
chance, worse judgement, and eventually a forced two-week absence at the worst possible time. The
counter is **exactly** the set of investments that makes the company resilient — automation,
documentation, hiring, on-call rotation. **The game's thesis made personal**, and it reframes every
"boring virtue" purchase as self-preservation rather than optimisation.

**Interacts with:** the On-Call Clock, the 3AM toggle, the 2am Rule, Solo Founder mode.

### The 3AM toggle and The 2am Rule
Choose whether to be woken — and pay for being awake.

**How it works:** **The toggle:** page-me-for-everything (fast response, burnout) vs
page-me-for-sev-1-only (rest, slower response, the occasional very bad morning). **A setting that is a
personality.** **The rule:** actions taken between 1am and 5am in-game carry a **higher mistake
probability** unless the staff member is fresh. Together they make scheduling, staffing and
alert-tuning into the same decision.

**Interacts with:** The Runbook You Wrote At 4am (§9.12), Career Mode.

### Rubber Duck and The Second Opinion
A diegetic hint system, and its staffed sibling.

**How it works:** **The duck:** explain the problem to the duck on your desk; the act of selecting the
symptoms to describe narrows the possibilities. **A hint system disguised as a real debugging
technique**, which is charming and also true. **The second opinion:** during an incident, calling in
another engineer costs a staff-hour and **reduces the chance of a mistaken diagnosis.** Rubber-ducking
and peer review, both modelled, both priced.

**Interacts with:** §9.8's "Explain This Incident", Sysadmin Mode (which removes the duck).

**Variations and additions**

- **Rubber-Duck Operations, as a placeable.** Put a duck on a rack and nearby sysadmin avatars gain
  focus: **cost almost nothing, effect small and real, charm ROI enormous.** Description: *"it doesn't
  judge."*
- **The placebo tier.** One proposal is that the duck has **no mechanics at all beyond a placebo stat**
  — a big orange, absurdly high-poly duck that visibly **quiets one random bug-threat per incident.**
  Ship whichever reads funnier; both are true to the practice.
- **A duck on every rack** as ambient set-dressing, with **one** of them wired to the buff — consistent
  with §9.3's set-dressing rule that the player can never be sure which object is live.
- **The Debugging Minigame.** Freeze play and let the player **narrate the problem to a floating duck**;
  if they hover the actual culprit, **the duck nods** and a hint card appears. It teaches the fault-tree
  mental model without a single tutorial box — and it is the natural UI for §9.8's "Explain This
  Incident" in reverse.

### Vendor Personalities — the full counterparty cast
Suppliers as recurring characters, extended to **every** counterparty the business has.

**How it works:** The classic four: the reliable-but-expensive one; the cheap one whose gear fails at
18 months; the one with great support and terrible availability; the one that gets acquired and
becomes bad. **Relationships you build and get burned by.**

**Expansion — every counterparty behaves differently and they are all recurring characters.** Nine
relationships you maintain or neglect, each with a **trust stat**, most of which **only matter on the
day they matter** (the hidden fifth currency, trust-with-upstreams, given a cast):
- your **transit provider / upstream** — competent, bureaucratic, **will not admit an outage**, has a
  NOC that answers slowly and its own outages; you can pay more for a better one;
- your **landlord** — fine until the building is sold;
- your **payment processor** — invisible until they're a threat;
- your **bank** — invisible until they're a threat;
- your **auditor** — thorough and expensive;
- your **insurer** — asks harder questions every year;
- your **distributor** — your friend at quarter end;
- your **biggest agent/reseller** — charming and disloyal;
- your **lender** — fine as long as the covenant holds.

**And the vendor rep himself:** a recurring NPC who sells you things you don't need, **is right exactly
once**, and remembers if you were rude. His sales calls are a declinable interruption; attending gets
you a small discount and a large waste of time.

**Interacts with:** the Dependency Web, the vendor-prices-to-your-switching-cost twist, §9.3's vendor
hold music and support-response generator.

### The vendor prices to your switching cost
A systemic honesty about how B2B pricing actually works.

**How it works:** Your licence vendor's price increase is **computed from an estimate of your migration
cost** — how many accounts, how entangled, how much engineering you'd need. **Reducing your switching
cost (abstraction layers, open formats, a documented migration path) literally lowers your future price
increases**, which is elegant, true, and completely un-gamified.

**Hosting types:** sharpest in web/shared (control-panel licensing), VPS (hypervisor and panel), and
regulated (compliance tooling) — but every type has one vendor it can't leave.

**Variations and additions**

- **The vendor blame wheel.** When a third-party outage hits, a **"public statement" wheel** lets you
  shift blame (a short-term churn shield) or own it (long-term trust). PR as a tower-defense mechanic,
  and the counterparty cast above is what makes the choice cost something.

### You become the vendor squeezing someone else
Late campaign, you're the upstream.

**How it works:** You now sell wholesale to small hosts. Your pricing decisions do to *them* what the
Vendor Squeeze did to you. The game lets you **raise prices on people you know can't migrate**, and the
ethics dial notices. **A mirror level with no combat, and the sharpest moral beat available in the
theme.**

### The customer who is also your investor
Or your landlord, or your competitor's investor.

**How it works:** Their account card gains a **second, conflicting relationship**. Firing them, billing
them, or having an outage on them has consequences in a different system than the one you're used to.
A small mechanic with a lot of narrative leverage.

### The founders' agreement
Two-founder runs where the co-founder is an NPC with opinions.

**How it works:** They disagree with some of your decisions and their **conviction is a stat**. Enough
disagreement and they leave, taking their equity, their relationships, and whatever subsystem they
owned. **Bus factor as a *person* rather than a number**, and it gives the early campaign a voice.

### The Personal Guarantee
To sign the colo lease or the credit line, you personally guarantee it.

**How it works:** A permanent flag on the company ledger in the early levels. It **changes the lose
condition** — bankruptcy no longer just ends the run, it takes something of *yours* — and it makes the
first five levels feel materially different from the ones after you've grown out of it. **Getting
released from a personal guarantee should be a celebrated milestone unlock with a little ceremony.**

### Regulatory Weather / Regulatory Drift
Rules change over time, without asking you.

**How it works:** New data-protection law. A data-residency requirement appears. A sanctions regime
lands. New energy regulation. An export control lands on your GPU customers. A new compliance framework
everyone suddenly demands. **Your perfectly legal business becomes non-compliant while you were busy.**

**Hosting types:** brutal for regulated (HIPAA/PCI/FedRAMP), GPU/AI compute (export control), email
(deliverability and consent regimes), bulletproof (obviously), and any type with cross-border data.

### Community Bug Reports
Your customers find your problems.

**How it works:** Attentive customers report real issues before your monitoring does — **if you've been
good enough to them that they bother.** **Reputation as a monitoring system.**

### The Threat You Can Hire
Yesterday's attacker is today's security engineer.

**How it works:** After beating a specific attacker archetype, you may be able to hire them. Expensive,
morally ambiguous, extremely effective, and occasionally a disaster.

**Expansion — give it three real consequences so it's a priced decision rather than a hook.** The hired
attacker **(1)** reduces spawn rate from **their own archetype** (they know the community); **(2)**
unlocks that archetype's Codex entry to **Mastered**; **(3)** carries a **permanent trust flag** —
other staff morale is slightly lower, background-check-required lines (regulated, government,
FedRAMP) are unavailable while they're employed, and there's a small ongoing chance of an insider
event. **Now it's a real, spicy, priced decision.**

**Variations and additions**

- **The Hacker Who Became a Consultant.** A **recurring** attacker you survive often enough — or
  honeypot-capture — can be hired. **Mid-bosses become staff**: redemption as progression, with the
  codex entry *"she knows all your tricks"*, because **she counter-targets your old build.** The
  redemption branch of the Recurring Nemesis relationship.
- **The Bug Bounty Board (recruit mechanic).** An attacker wave that fails at your gate can be
  **converted** via a bounty-offer minigame: the pen-tester unit then **patrols your defenses, revealing
  holes as they're tried.** Turning your enemies into researchers — **offense funds defense.**
- **Pay an internal attacker between waves.** The simplest version: a red-team retainer that **finds
  your holes before the game does**, converting vulnerability points into fix-points. **It keeps
  breathers busy**, which is exactly what §9.6's "peacetime must be valuable" guardrail asks for.
- **The Gray-Hat Recruiter (the inverse risk).** A nation-state APT tries to hire **your** admin — and
  if you don't catch it, you have an insider threat. The hiring mechanic cuts both ways.

### Defend Someone Else
A guest level.

**How it works:** A friend's, a customer's, or a rival's infrastructure — built by someone with
different habits — and you have to work in it. **Reading someone else's architecture under pressure is
the real job.** The Consultant mode (§9.1) is this, as a career.

### The Dependency Web
You depend on other providers who have their own outages.

**How it works:** Your DNS provider, your CDN, your payment processor, your monitoring vendor, your
cloud region, your registrar, your certificate authority. **When theirs goes down, yours does.** The
most helpless and most realistic twist available.

**Expansion — make it *playable* rather than purely helpless, with three real verbs:**
1. **Detect fast.** A provider-status aggregator and an External Vantage fleet let you determine in
   **90 seconds** that the problem is not yours — worth an enormous amount, because the wrong answer is
   an hour of debugging your own healthy systems.
2. **Fail away.** Pre-built secondary providers you can switch to: a second DNS provider, a second
   payment gateway, a CDN you can bypass, a resolver you can point elsewhere. **Each is paid for in
   advance and used once a year**, which is this design's favourite kind of purchase.
3. **Communicate first.** Being the company whose status page explains *their* outage before they do is
   a measurable reputation gain. **You cannot fix it and you can still win the hour.**

### The Hidden Dependency / The Dependency Nobody Knew About
An edge in the graph that only exists when it fails.

**How it works:** A hidden edge revealed only by an outage. The best ones are **circular**: your
monitoring depends on your DNS which depends on your monitoring's health checks; your password vault is
behind the SSO that authenticates against the directory hosted on the box you're trying to reach; your
runbooks are on the wiki that's in the datacenter that's down. **Circular dependencies as puzzle
content.**

### Shared World Events
Global events affecting all players at once.

**How it works:** A major vulnerability disclosed, a submarine cable cut, a cloud region down, an
energy price spike, a hardware recall. **Everyone is patching the same weekend**, which is exactly how
it feels.

**Variations and additions — shared-fate weather and refugee waves**

- **The Internet Weather meta-map.** A global outage/weather/attack ticker runs **above** levels: a
  fibre cut near Singapore raises transit prices worldwide. **A persistent world economy the player
  cannot control, only prepare for.**
- **Shared-Fate Weather.** When *someone else's* platform falls (a big streaming site, a cloud region),
  traffic migrates to competitors and **your inbound stream spikes for hours with refugees.** If you're
  the good neighbour they convert; if your capacity is thin **you choke on their failure.** The lesson
  is the correlation: **your downtime risk peaks when your neighbour's does.**
- **"The Competitor's Outage."** The single-player version: periodically a rival suffers a disaster and
  a surge of refugees arrives at your gates. **Opportunity waves mirror threat waves** — prepare
  capacity to capitalise.
- **"The Last Resort Host" (spin-off scenario).** The big clouds have a *synchronised* meltdown and you
  are one of the only stacks still up; every level's customers arrive **as refugees at 10× flow with
  desperate patience bars.** Your long-term hygiene pays a literal rescue dividend — **the "why does
  good ops matter" capstone.**
- **"Lighthouse" (co-op twist).** Your DDoS scrubbers and peering can **shelter nearby smaller operators
  (NPCs) for favours** — mutual-aid economics, and when *you* burn, the favours cash out. Community-ISP
  energy.
- **Real-Weather Integration (optional).** Pull your real location's weather, so a storm outside is a
  hurricane modifier inside — *"go check your backups."*

### The Seasonal Calendar / Seasons
The year has a shape, and it is different per hosting type.

**How it works:** Black Friday, the holiday freeze, tax season, back-to-school, the summer slump, the
January renewal wave. **Predictable if you look, brutal if you don't.** Crucially the shape is
**type-specific**: retail web peaks in Q4; **game hosting** peaks on release days and school holidays;
**backup/DR** peaks at month-end and fiscal year-end; **tax/regulated hosting** peaks in April;
**streaming** peaks on event nights; **CDN** peaks on patch-day for a big game; **GPU** peaks whenever
someone's training run starts. Levels can be placed anywhere in the year, so **the calendar becomes a
strategic map.**

### Market Cycles
A visible macro index.

**How it works:** Cheap credit / expensive credit. Boom / bust. Hardware glut / shortage. **Buying
counter-cyclically is the expert move and should be rewarded** — the rack of servers you bought during
the glut is the margin you have during the shortage.

**Interacts with:** §6's financing, the era system, lead-time-as-currency.

**Variations and additions — the market-event deck**

- **"The Pivot" (endless market-event survival).** Random annual events drawn as cards: a crypto boom,
  an AI boom, **a tweet from a celebrity customer**, an upstream outage that makes you look great, a
  datacenter-district flood, a hacktivist grudge, a hostile Hacker News thread. **Deck-built business
  survival.**
- **The Black Swan draws.** *"OpenAI-alike launches self-hosting tutorials"* (GPU demand ×2) · *"the EU
  passes a resilience act"* (colo audit demand spike) · *"a competitor goes bankrupt"* (a migrant wave
  **and** a chance to buy the book cheap) · *"a rant trends"* (shared-hosting stigma, conversion dip).
- **The Price-War Truce Event.** Two AI hosts — you included — tacitly **match each other's prices
  forever** in a cosy oligopoly HUD, until a **"whistleblower" card** breaks it and the regulator wakes
  up. Market economics with a conspiracy cap: dark, real, and with obvious airline/fuel parallels.

### "It's Always DNS" (with an honest counter)
The joke, made mechanical — and then made truthful.

**How it works:** A meaningful share of incidents genuinely trace to DNS, and the game keeps a visible
counter of how many times it was. **A running gag that is also a statistic.**

**Expansion — make the counter honest and it becomes a better joke.** Track root causes **by category**
across the whole campaign and show the real distribution at the end. In a well-modelled version of this
game the categories should land roughly where they land in life: **change-induced** (deploys, configs)
is the largest single bucket, followed by capacity/growth, then hardware/facility, then
dependency/third-party, **then actual attacks, a long way down.** **A game whose end-of-campaign pie
chart shows the player that attacks were 8% of their incidents has taught something real** — and it
makes the tower-defense framing quietly subversive in the best way.

**Tension:** ⚔️ This is a tower-defense game in which the honest statistics say most of your pain is
self-inflicted. That's the point, and it must be handled so it reads as insight rather than as the game
telling you the genre you chose was wrong.

**Variations and additions**

- **Mode: "It Was DNS" (one-word boss rush).** A gauntlet level where **every threat is actually DNS**,
  which teaches the entire resolution stack as a set of towers. **Boss: the glue record.** The perfect
  home for the running gag without letting it leak into the honest counter above.
- **The April Fools' DNS Outage.** A rare super-event: **half the world's resolvers forget you.**
  Customers arrive at competitor addresses while your fleet is **perfectly healthy**, and the counter is
  status-page comms plus the patience meter. **The rare threat that is about managing perception, not
  packets.**
- **The honest extension of the gag:** *"it's always DNS until it's DHCP."*

### The Unreliable Dashboard
Sometimes your monitoring is *wrong*.

**How it works:** A stuck metric. A collector that died. A dashboard showing cached data. A graph that
is flat because the scrape interval is 5 minutes and the outage was 90 seconds. **The player must learn
to distrust their instruments and verify from a second source.** A genuinely daring design choice and
absolutely authentic.

**Interacts with:** telemetry resolution (§7), the External Vantage fleet, Sysadmin Mode.

### The Reveal Mechanic (your own infrastructure as fog of war)
You don't see everything. Your map shows what your **monitoring covers**.

**How it works:** Blind spots are **literal dark areas** on the board. Buying observability lights up
the map. Fog of war, but it's your own infrastructure — **which is horribly realistic.** Acquisitions
arrive almost entirely dark.

**Interacts with:** Blind Mode, The Camera Is a Camera, the Unreliable Dashboard.

### Metric Gaming
You can hit your SLA number while customers are miserable.

**How it works:** Measure only the endpoints you control and your uptime looks perfect. **The game
notices, and reputation diverges from uptime.** A quiet lesson delivered purely through mechanics — and
a very short walk from here to the Compliance Theater Meter.

### Everything Is Someone's Fault, Nothing Is Simple
Root-cause analysis as a minigame with **multiple** contributing factors.

**How it works:** Incidents resolve to a contributing-factor *set*, not a single cause. **Assigning
blame to a person is always an option and always the wrong one** (morale penalty, culture cost, and the
next incident gets reported later because people learned to hide).

**Interacts with:** §9.4's culture stat, the Postmortem Puzzle, blameless-postmortem achievements.

**Variations and additions — the Blame Engine**

Deflection, modelled as a sport, so that refusing to play it is a visible choice:

- **The Blame Game cutscene.** A post-incident corporate scene where you deflect blame from the board,
  the press or the customer onto a rival vendor **or the intern.** Success buys stock price and **costs
  reputation with staff.** Optional, satirical, and it doubles as a cash valve.
- **The vendor-blame wheel** — see "The vendor prices to your switching cost" above.
- **The cheap version:** a literal **"blame the network" / "blame the user" button** that deflects
  tickets, sibling to §9.3's blame-the-CDN button. Once per level, with karma risk.

**Why it belongs here:** the guardrail above says assigning blame to a person is **always available and
always wrong.** These give the wrong answer a *tempting* interface, which is the only way the right
answer costs anything.

### Difficulty via Honesty ("Sysadmin Mode")
Turn off the helpful lies.

**How it works — enumerated, because otherwise it is just a vibe.** It **removes**: alert aggregation,
dependency suppression, root-cause hints, the bottleneck highlight, symptom-to-cause arrows, the
auto-generated postmortem, the Rubber Duck, and the Mentor. **What remains:** raw logs, raw graphs, and
the terminal. And it **gives** one thing, because a mode this punishing needs a visible badge: a
**permanent score multiplier** and a distinct end-of-level stamp.

**Related — "The Difficulty Called Realistic."** The art-side variant: turn off the alert stack
entirely. You only find out about problems by **looking**. The lighting, the LEDs, the fan noise, the
cat and the airflow streamers become your entire monitoring system. **A whole difficulty mode built
purely out of the art.**

**Related — difficulty named honestly.** Instead of Easy/Normal/Hard: *"Managed Service" · "Startup" ·
"Understaffed" · "Two Engineers and a Prayer" · "It's Just You"*. And era-named business presets:
*"2005: Everyone Is Making Money" · "2013: The Price War" · "2023: Capital Is Expensive."*

**Variations and additions — difficulty by *information*, not numbers**

The governing idea: **same simulation, two interfaces.** Novices get colour-blind-safe labelled
everything and forgiving meters; experts play **"blind ops"** — no overlays, raw logs only.

- **The money axis: "Academia vs Marketing."** Marketing mode shows **your website as customers see
  it** — confident promises, stock photos, *"24×7 support!"* — while the truth (one guy, two Red Bulls,
  a flaky UPS) **glitches through.** Academia/ops mode shows the honest topology. **The gap between the
  SLA and reality is the entire hosting industry in one visual gag.**
- **Arcade vs Operator (the economy face).** Arcade: static prices, forgiving churn. Operator: elastic
  curves, cohorts, claims. Both faces of the same sim, mirroring the raw-logs-vs-overlays idea on the
  money axis.
- **Realism Toggle ("Economy Mode").** A dial from arcade (money is gold coins) to **C-suite** (balance
  sheet, and **accrual vs cash revealed as a late-game lesson**: profits you can't pay payroll with,
  revenue you can't bank yet).
- **Founder Mode / Employee Mode.** One toggle for the whole game: **Employee Mode is all mechanics, no
  economy** (fixed budget, no bankruptcy, pure ops); **Founder Mode** adds money, contracts and the
  board. **Same sim, two audiences, zero difficulty-illusion.**
- **"The BOFH Difficulty."** The support-quality dial extended past "bad" to **hostile**: support costs
  $0 and deflects tickets by **making customers give up** — but every BOFH interaction burns retention
  roots, and you can *see* it (the customer's little root withers mid-walk). Max-profit playstyle with a
  slow poison.
- **The realism slider (failure-naming axis).** Casual = generic malware; hardcore = **specific named
  failure modes** (SMART vs NVMe wear, BGP vs OSPF, ext4 fsck). An **MTBF dial** controls how often
  hardware actually dies, and separate toggles decide whether DNS/TLS renewals are managed at all or
  abstracted to "background."

**Variations and additions — difficulty named after real things**

- **The tier names:** *"Shared Hosting," "VPS," "Enterprise," "Government,"* and **"Production on a
  Friday"** (max chaos: any change is riskier). Plus **the pager-severity scale** (Sev4 → Sev1) as an
  accessibility-friendly naming alternative.
- **The Friday Deploy mechanic.** Feature buttons **glow with a risk meter** on simulated Fridays and
  holidays; shipping a big change before a long weekend (no staff coverage, higher exploit probability)
  is an eternal self-inflicted gamble. Achievement **"YOLO"** for each successful Friday deploy — **and
  it always fails eventually.**
- **The ops-calendar axis (difficulty as diegetic texture, not a slider):** the **change freeze**
  (Dec 15 – Jan 5, you simply cannot act), the **post-holiday capacity hangover** (idle burn), and
  **conference season** (staff XP *and* attrition risk — recruiters poach your people at the
  conference). **The industry's own clock, used as the difficulty curve.**

### The Pivot
Change what business you're in, mid-run.

**How it works:** See §5.6. Expensive, slow, and occasionally the only way to survive an era change.

### You Can Fire Customers (and its quieter sibling)
The most cathartic verb in the game.

**How it works:** Terminate an unprofitable, abusive or dangerous account. Costs revenue and a possible
public complaint; saves support hands, abuse risk and morale. **Every real operator knows exactly which
customer this is.**

**Expansion — put the realistic option next to it:** **repricing at renewal**, which achieves the same
outcome without the public review. Having both in the UI side by side, **with the cathartic one visibly
costlier**, is a small piece of design that teaches restraint.

**Variations and additions**

- **Fire the Customer (goodwill termination).** The third option next to firing and repricing:
  **actively pay a margin-negative account to leave** — their next host's gain. A real practice, weirdly
  satisfying, and it makes the point that **customers aren't only protected; they can be *released*.**

### The One Customer Who Is Always Right / The Unremovable Customer
A named recurring account.

**How it works:** They're big, they're demanding, they're often actually correct, and they will eat one
hand permanently. Their setup is so bespoke and so load-bearing that **you cannot migrate, upgrade or
decommission anything near them.** Every level, they're still there. **Firing them is an option and you
will think about it constantly.**

**Variations and additions**

- **The Customer From Hell.** The sharper framing: one customer whose demands — *open everything, run
  this sketchy thing* — **are worth more than they cost.** A moral and economic dilemma that is
  genuinely the job, and the honest reason the Unremovable Customer is still on your books.

### The "Unlimited" Trap
Offering an unlimited plan is available from level 2 onward.

**How it works:** It **always** spikes signups. It **always** ends badly. **Players will do it anyway,
exactly like the industry did.** The asterisk is rendered on the marketing page, and clicking it opens
a fair-use policy of absurd length that the player can actually scroll.

**Variations and additions**

- **The Bluff Meets Reality (challenge level).** You ran a campaign promising unlimited everything; now
  **play the level where that promise meets reality.** Dark comedy plus a lesson, and it works as a
  standalone scenario as well as a campaign beat.
- **"UNLIMITED everything!" as a permanent marketing buff** with a hidden cost curve: **gluttons arrive
  in force**, and it is survivable only behind a **Fair-Use Policy and scrubbing capacity.** A joke every
  hosting buyer recognises, and a stress test every host actually runs.
- **"Uptime Theater" — the lie you advertise.** The same mechanic on the reliability axis: you may
  **advertise an SLA you do not offer**, and a meter tracks **promise vs delivered** until the bill
  arrives at the renewal fork **as reputation debt.** Tempting early, fatal late.

### The Legacy Plan
A grandfathered plan from level 2 that is still on your books in level 8.

**How it works:** Unprofitable, with 340 customers who will riot if you touch it. Sunsetting it costs
reputation and churn; keeping it costs margin forever; **and it grows.** **Every real host has one.**

### The Handshake Deal
An undocumented promise you made in level 2.

**How it works:** A founder (you) promised a customer something verbally. It surfaces at Exit as an
**unassignable contract** in diligence. **Keep a ledger, or don't, and find out.**

### Every Decision Has a Receipt / the time-delayed consequence engine
The systemic version of the 90-day lag.

**How it works:** Many actions **schedule their effects into the future** — some good, some bad, some
forgotten. The game silently logs your choices and surfaces them later, by name: *"In year 2 you signed
14 contracts with unlimited liability. −0.4×."* **The game's most distinctive feel: you are always
living inside the consequences of a decision you've stopped thinking about.**

**Time-Bomb Decisions** are the sharpest instances: buying all your hardware from one batch; choosing a
vendor that gets acquired; building on a framework that's abandoned; **storing the backup key next to
the backups**; signing a three-year lease on a building that's about to be sold.

**Interacts with:** §6.9's diligence report, the Investor Dashboard Lie, the Hardware Lottery.

### The Camera Is a Camera
Diegetic viewing.

**How it works:** The game view *is* your CCTV/monitoring system. Losing power or network to a site
means **losing the view of it** — you're flying blind on a part of your own company. **Terrifying and
elegant.**

**⚔️ Bounded, because as stated it is degenerate:** removing the player's ability to act at exactly the
moment they most need to act is the definition of an unfun mechanic. **The bound:** losing visibility at
a site means you lose **live detail** but keep **last-known state, greyed and timestamped**, plus
whatever out-of-band telemetry you bought. The **out-of-band LTE modem** becomes the purchase that
restores partial sight — which is exactly the lesson — and the fear becomes *"my picture is 90 seconds
old"* rather than *"I am blind and helpless."*

**How it looks:** a lost site's viewport degrades in **stages** — first a frame-rate drop and
compression artifacts (network degraded), then a **freeze with a timestamp watermark** (last known
frame), then **static and a `NO SIGNAL` card** in the era's own style. You can still open the site's
tile; it just shows you the last thing you saw, **which is worse than nothing.**

### The Investor Dashboard Lie
Two sets of numbers.

**How it works:** You control what the investor dashboard emphasizes. Presenting selectively is
available, effective, and carries a risk of being discovered at the next diligence. **The ethics dial
with a spreadsheet.**

**Expansion — make the discovery moment concrete.** Every optimistic framing you used becomes a
**specific line in the diligence report** two levels later, where an analyst **asks about it by name.**
**Consequences with receipts** beat a generic reputation hit, and it makes the Due Diligence level the
payoff for a mechanic seeded twenty hours earlier.

### Postmortem Publishing and the Status Page Voice
Your public wording is a mechanic.

**How it works:** After an incident you write the postmortem and the status update by picking from
options along two axes — **honesty** and **detail** — or by choosing a voice: **Honest / Corporate /
Defensive**, or **corporate / human / jokey**. Honest-and-detailed heals reputation slowly and durably;
blaming a vendor, or saying *"a third party experienced an issue"*, makes it worse. The effects are
**segment-specific**: developers love a human voice; enterprise buyers do not; the press responds to a
third thing. Transparency costs short-term reputation and builds long-term trust; weaseling does the
opposite — **and there is a small chance of being caught, which is catastrophic.** Choosing the
corporate-mush option repeatedly should have a **visible cumulative cost.**

Short, funny, teaches a real lesson, and it is **a text choice with a real mechanical outcome.**

**Interacts with:** §9.3's status-page euphemism ladder (the humour rendering of the same mechanic),
the Postmortem Club (§9.10), reputation segments.

**Variations and additions — comms as a mechanic**

- **The Postmortem Editor (the honesty minigame).** The game **drafts the public postmortem from your
  actual logs** and you edit it: **admit the real root cause, or soften it.** Honesty takes a short-term
  reputation hit and pays a long-term attraction buff plus a campaign-wide **"trust" modifier**; spin
  gives an instant buff **and a scripted "an insider leaks the truth" event later, at ×3 cost.**
  **Language itself becomes a lever** — the most distinctive social sim available in a tower defense.
- **The Rant Button.** During a crisis, *"release a status page update"* **actually restores customer
  patience** (a transparency buff). A tiny social mechanic that doubles as emotional regulation and is
  extremely true to hosting life.
- **Spin Control (the press-kit tower).** Temporarily boost reputation and customer arrival after an
  incident: it **buys time and cannot fix the problem**, and if overused it becomes a visible meme — the
  **"status-page gaslighter" debuff event.** Satire with mechanical teeth.
- **NTR (Net Trust Retention).** A hidden-but-earned stat: how much goodwill your comms style builds
  (status-page honesty, incident ownership, no dark patterns). **High trust bends renewal waves toward
  staying even through outages** — *a cheaper defense than any tower*, if you earn it.
- **The status-page poetry generator.** During outages your PR bot auto-emits *"We are aware of an issue
  affecting…"* headlines and players **collect the absurd ones** — cosmetic humour with teeth, because
  an **overly clever** status update can delay or worsen sentiment recovery.
- **Level story beats delivered as status-page updates you type** (or the game auto-writes):
  *"DEGRADED PERFORMANCE — under investigation (we are being DDoS'd and we are scared)."* A comedy layer
  **and** a strategic tool.

### The Compliance Theater Meter
Real security vs the appearance of it.

**How it works:** Two separate 0–100 stats — **Actual Security** and **Demonstrable Compliance**.
**Audits score the second; threats test the first.** Some purchases move one and not the other:
evidence collection, policy documents and a penetration-test report move **compliance**; segmentation,
MFA and patching move **security**; a few move both. The gap between them is displayed as a single
number with a name — **Theater** — and a high Theater score is **both** a scored penalty at level end
**and** a threat modifier: you are more breachable than your certifications suggest. **The best cynical
mechanic available and it costs one number.**

**Hosting types:** load-bearing for regulated (HIPAA/PCI/FedRAMP), enterprise colo and anything selling
to government; present but lighter everywhere else.

### The RFP Minigame
A 200-question security questionnaire.

**How it works:** Answer it by **allocating staff hours**. The questions you can't answer honestly are
**exactly the compliance gaps you skipped.** Winning the RFP with a dishonest answer is available and
it becomes a Receipt later.

**Interacts with:** the Compliance Theater Meter, Every Decision Has a Receipt.

### The Migration Weekend
An optional high-intensity timed sub-level.

**How it works:** You cut over a big customer. Success = a case study and expansion revenue. Failure =
a public post-mortem and a churned whale. **The highest-stakes voluntary event in the game**, and the
one most likely to be attempted at the wrong time.

**Variations and additions**

- **The Migration, as a cross-level arc.** The ongoing version: a **massive customer migrates *into*
  your platform** from a provider who "went down a lot," and absorbing them **reshapes your map, your
  budget and your threat profile for hours of gameplay.** The "big one" campaign arc — the Migration
  Weekend is one night of it; this is the season.

### Named Disasters
Recurring named events with escalating versions.

**How it works:** The same disaster shape returns across the campaign with a rising number — *"Breaker
Trip," "The Tuesday Deploy," "Fuel Truck Friday," "The Cert," "Maintenance Window Three."* **Players
build institutional memory** and start preparing for a named thing rather than a generic one, which is
exactly how real operators talk.

### The Green Dilemma
A sustainability track you can ignore, for a while.

**How it works:** Costs money; unlocks clients (enterprise and public-sector buyers with procurement
requirements), permits, grid interconnect priority, and community goodwill. **You can absolutely ignore
it for several levels before it bites** — and the bite arrives as a lost RFP, a refused permit, or a
planning objection rather than as a moral lecture.

**Hosting types:** heaviest for GPU/AI compute and any owned facility; near-zero for reseller and
channel play.

**Variations and additions**

- **The Carbon-Offset Sticker.** A one-click purchase that **does nothing except look good in the RFP
  screen** — until an auditor or journalist exposes it, at which point **it costs double.**
  Greenwashing as a literal sticker, and the honest route (real PPAs) sits right next to it on the same
  screen.

### Reversible Bad Ideas
The game should **let** you do the wrong thing.

**How it works:** Oversell 40:1. Put everything on one breaker. Host the grey customer. Skip backups.
Defer the patch. **It should be profitable, briefly.** **The game's whole argument is made by letting
you do the wrong thing and feel it later** — and by never blocking it with a dialog box that says no.

**Interacts with:** the time-delayed consequence engine, §9.6's "teach through loss."

### The Ethics Track
No morality meter — just consequences.

**How it works:** Bulletproof hosting, selling customer data, cutting compliance corners, and lying
during incidents are all **available and profitable.** There's no meter; there are just consequences,
**some of them delayed by two levels.** Let the player find out.

**Tension:** ⚔️ This collides with §9.11's responsible-depiction rule, which asks that the bulletproof
arc **end somewhere** rather than being a stable rewarded strategy. Both are right: the ethics track
must never be a morality meter, **and** it must not be a dominant long-run strategy. Resolve with
consequence, not with prohibition.

**Variations and additions**

- **The Ethics Arc (the meta-branch).** Across the campaign you accept or decline dark money: the
  bulletproof contract, the "aggressive" scraper customer, the data-resale perk. It **branches the late
  game** — clean (regulation whales), grey (fast cash plus Heat), dark (a seizure boss as the final
  boss, **but winnable**). **Three endings, one game.**
- **The Dark-Pattern Tech Tree (the villain branch).** Egress tolls, cancel mazes, teaser renewals,
  pre-checked add-ons: **every node pays immediate cash and adds regulator heat plus brand fog**, while
  "honest path" nodes cost now and compound brand later. The banal-evil branch, with a final
  **"Click-to-Cancel reckoning"** event — the pirate-cove temptation structure mirrored into *ordinary
  business*, which is both funnier and more damning than the bulletproof line.
- **Consistency note:** all of this stays inside §9.11's resolution — **consequence, not prohibition.**
  The dark-pattern branch is available and profitable; what it must not be is *indefinitely stable*.

### You Are the Attacker's Target Board
Perspective flip.

**How it works:** Occasionally the game shows your infrastructure **as it appears in an attacker's
reconnaissance tooling** — your exposed services, your stale software versions, your employee names
from LinkedIn, your certificate transparency log, your forgotten staging subdomain. **Seeing yourself
from outside is the single best security lesson available.**

### The Conference Talk
Fame has a cost.

**How it works:** Late campaign, you present your architecture publicly. Reputation bonus, hiring
bonus, enterprise conversion bonus — **and attackers learn your topology.** A purchase with a genuinely
two-sided outcome.

**Variations and additions**

- **The Keynote Boss (social-combat finale).** Before the hardest ops level you must **present your
  architecture at a conference**: a quiz-duel against audience Q&A where **the claims you made in-game
  become the question set** (bluffing your own architecture fails), hecklers spawn as competitor FUD, and
  **your codex knowledge is the ammo.** The Conference Talk's two-sided outcome, staged.
- **The conference buff with a real cost.** Send a staff unit to the event: they return with a
  **permanent skill-up and a tech-tree discount for one theme** — and **during their absence your
  coverage drops** (an incident window). The eternal *"do we send the team?"* board-game choice.

### The marketing site on your own infra
Dogfooding, with consequences.

**How it works:** Your own website is hosted on your own infrastructure. When you go down, your status
page goes down too — **unless you had the sense to host it somewhere else**, which is a purchasable
lesson.

### The customer who becomes a competitor
They learn from you and leave.

**How it works:** A large technical customer — often your best reseller — gradually builds their own
infrastructure, then competes with you, then poaches your staff. **Modeled explicitly, with a window in
which you could have acquired them cheaply**, which you will notice only in hindsight. Nothing you can
do about it afterwards, which is the lesson.

### The acquisition offer you should refuse
Not every exit is good.

**How it works:** An offer arrives with terms that look great and an earnout that will never pay. **The
diligence report is available if you bother to read it.**

### Weather Affects Everything — scoped
Physical world, physical consequences.

**How it works:** Heat waves stress cooling and raise power prices. Storms threaten utility power,
microwave links and fuel delivery. Floods threaten basements (where the generators are). Cold snaps
spike regional demand. Hurricanes threaten the fuel truck, not the generator. **A datacenter is a
building, and buildings have weather.**

**⚔️ Scoped, because unbounded weather in every level is noise.** Weather is a **first-class threat
only in the types where it actually is** — satellite ground station, edge/MEC, microwave links, and any
owned facility. **Everywhere else it is a slow economic modifier** (summer raises cooling cost and power
price; winter gives free cooling) rendered in the level's colour grade and nowhere else. **Two
behaviours, clearly separated.**

**Wry note:** cold snaps affect... nothing, actually, which is why everyone builds in cold places.

### The Hardware Lottery and the Uptime Superstition
Not all identical machines are identical — and your team knows it.

**How it works:** Some units from a batch are simply worse — thermal outliers, early failures, firmware
oddities. **A small random factor that makes fleet management feel real** and rewards paying attention
to per-unit telemetry.

**Expansion — extend it from a stat into a culture.** The game tracks which machines happened to be
involved in incidents and lets staff attach **hand-written sticky notes**: *"DO NOT REBOOT" · "this one
is fine, actually" · "ask Priya first" · "cursed."* The notes persist across levels and are generated
from **real event history**, so they are sometimes correct and sometimes **pure superstition — and the
player cannot tell which.** Emergent, player-and-NPC-authored folklore.

**Interacts with:** the "DO NOT UNPLUG" post-it (objects with one are excluded from bulk operations),
the Legacy Box, the Ghost of the Previous Admin.

**Variations and additions — the used-hardware market**

- **eBay Snipe.** A bid war against AI flippers for grey-market servers: **cheap, risky, occasionally
  legendary.** Timed auctions for mystery lots — *refurb PSU = fine, ex-crypto rig = capacitor roulette,
  "untested" = entropy bomb* (possible Time-Bomb Firmware). **Lot histories are diegetic codex
  snippets**, and there is a **1-in-200 "immortal" battleship unit** that never fails and hums show
  tunes.
- **The Server Graveyard economy.** When hardware dies it can be **sold on the secondary market** — a
  low-cost, high-risk vendor with a joke flavour line for every item (*"Refurbished 'barely used' — it's
  been rebranded"*). Beware the **haunted UPS**: it fails, but you bought it used.

**Interacts with:** §9.12's IP-reputation-as-inherited-property (the same "you bought someone's past"
shape, on the address side), the Hardware Afterlife, Rack Cards (§9.10).

### Reputation Has a Face
Personify the abstract — and make reputation asymmetric.

**How it works:** Reputation is shown as a small cast of recurring characters — a trade journalist, a
prominent customer, a forum regular — whose opinion of you visibly changes and who show up at the worst
times. **Far more affecting than a bar.** Their **expressions are the readout**: five authored
expressions each, and the current worst one sits next to the Reputation number in the HUD. **A face is a
legible stat.**

**And state the asymmetry out loud, in the tutorial:** **reputation falls roughly ten times faster than
it rises.** The player needs to understand why one bad night matters more than thirty good ones.
**Most business sims get this backwards.**

### The Line That Eats You
A business line that grows past your ability to run it.

**How it works:** The line you opened opportunistically becomes **60% of your support load and 15% of
your revenue.** **The divest decision is genuinely hard** because it's still growing.

**Expansion — give it the instrument that reveals it, and the trap that hides it.** The instrument is
**per-line contribution margin after allocated support.** The trap is that **without transfer pricing
and cost allocation, the line looks profitable** because its costs are pooled with everyone else's.
**You cannot see the line eating you until you build the accounting to see it** — a perfect
Sense-branch payoff on the business side.

### The Hardware Afterlife
Follow a single server through its whole life.

**How it works:** Premium dedicated → budget dedicated → VPS node → backup target → lab box → scrap,
with a certificate of destruction. **A game that tracks one machine's biography is a game people write
about.**

**Interacts with:** Rack Cards (§9.10), the Hall of Fame Drive, the Sunset level.

### Reverse Colo
You become the tenant.

**How it works:** A level where *you* rent space in someone else's building and discover what it's like
to file a ticket for a reboot and wait. **Empathy as a mechanic**, and it makes your own colo levels
better. (Tenant Mode in §9.1 is the full-length version.)

### "Works On My Machine" (the card, and the customer)
The joke, made mechanical, twice.

**How it works — the card:** playable once. Closes a ticket without fixing anything. The problem comes
back, bigger. **Pure joke, pure mechanic.**

**How it works — the customer:** a recurring NPC who reports impossible bugs that are always their
fault... **and exactly once in the campaign is right, catastrophically.** The player will have learned
to dismiss them, which is the trap, and it is fair because the game told them the rule and then
honoured the exception.

### The Missing Screw
Small physical friction — with exactly one job.

**How it works:** Occasionally a task takes longer because the rail kit is wrong, the screw is missing,
the cable is six inches too short, or the box is on the wrong side of the room. **The tiny indignities
are what make it feel real.**

**Expansion — give it a purpose or it is unpaid friction.** It is a **variance *reducer* purchase**: a
stocked rail-kit and consumables bin **removes it entirely.** A tiny, cheap, deeply satisfying "I fixed
the annoying thing" purchase — which is a real feeling and a real line item.

### The Beeping Server
A minigame everyone will recognize — bounded.

**How it works:** Something in the room is beeping. You have to find it by walking the camera through
the aisles, listening to the stereo pan. **Absurd, delightful, and completely authentic.**

**Expansion — bound it so it stays a joke rather than becoming a chore:** a hard **~20-second** cap, an
**asset-tracking overlay you can buy** that finds it instantly, and **use it exactly twice in the
campaign.** For accessibility, the audio caption carries **direction and approximate distance**
(`[beeping — ahead, 3 racks]`), and an unlockable **acoustic overlay** shows a heat-map of sound
intensity — both an accessibility path and a funny purchase. Keep the stereo-pan version as default.

### The What Would Break tool
A thought-experiment machine, not a chaos monkey.

**How it works:** In Sandbox and in the Lab, pick **any object and kill it** — then watch the
consequence at 4× with the cascade fuse visible, **and rewind.** Players will use it to audit their own
builds, and **its existence makes the resilience half of the design something you can *practise*
rather than only suffer.**

**Interacts with:** §4.5's chaos lab, §7.1's blast radius, Sandbox's STRESS TEST button, Import Your
Own Topology (§9.5).

### The Long Weekend (an offline/idle layer)
The company keeps running when you're not there.

**How it works:** Optional. When you close the game, the company runs on **your policies** for up to 48
real hours. On return you get a short report and a small number of decisions that were **queued** for
you. **Hard rule: nothing catastrophic can happen offline.** A *lot* can drift.

**Why:** it is thematically perfect — **the whole point of automation is that it runs when you're not
there** — and it is the most natural idle layer any strategy game has ever had. **The hard rule against
offline catastrophe is non-negotiable**, or it becomes a punishment for having a life.

**Interacts with:** §7.5 delegation, §1.5's Long Weekend level, policy automation, Succession.

### The Company Handbook
A document you write, that the game reads.

**How it works:** A small set of authored policy statements the player selects at founding and can
revise: *"We never take on abuse-heavy customers." "We always publish a postmortem." "We do not deploy
on Fridays." "Nobody works alone at night." "We answer the phone."* Each has a **mechanical effect**
**and** each is **checked against your actual behaviour.** Violating your own handbook has a culture
cost. **The ethics dial with a memory**, and it makes the company feel *authored* rather than
optimised.

### The Board Meeting
An interstitial that sets your own grading rubric.

**How it works:** Investors demand growth or margin, and **your answer sets the next level's scoring
weights.** The player chooses their own rubric and then lives with it — which is a much more
interesting difficulty selector than a slider.

### The "It's Fine" counter
A small, dry, permanent stat.

**How it works:** The number of times the player **dismissed an alert that later turned out to matter.**
**Never shown during play. Shown once, at the end of the campaign.**

### The Hardest Lesson, Delivered Once
The level you can only win by **raising prices and losing customers.**

**How it works:** Somewhere in mid-campaign, a level whose only winning line is to **reprice up and
watch the logo count fall** while margin, support load and reliability all improve. **It is the single
most counterintuitive, most real, most valuable move in the hosting business, and no game has ever made
a player feel it.** Deliver it once, unmistakably, and never again.

### The Recurring Nemesis
A named adversary that **learns across levels.**

**How it works:** Personal stakes beat abstract difficulty. The nemesis returns level after level,
**learning your layout between appearances**, and each time arrives with a counter to whatever you built
last time. Three proposed faces of the same character:

- **"nullbyte" / "The Ticket That Never Closes"** — a legendary cracker who studies the board between
  visits.
- **"Pl3ague"** — taunts you in the ticker across levels and attacks harder **after you humiliate
  them**; if they win, they **brand your DC**: visible graffiti on your building that **costs reputation
  until cleaned.**
- **The Gray-Hat Recruiter** — the quiet one: a nation-state APT that tries to **hire your admin**, and
  if you don't catch it you have an insider threat.

**The redemption branch** is The Threat You Can Hire, above: survive them often enough, or
honeypot-capture them, and **the nemesis becomes staff who knows all your tricks.**

**Interacts with:** the Codex, §9.3's industry forum thread, the persona threat families.

### The "It Was You" twist
Your own config mistake caused the "attack."

**How it works:** A level presents as an incident with an external cause and resolves to **a fat-finger
of yours.** It teaches the single most common real root cause, and it is the only way to make
**change-induced failure** land emotionally rather than statistically.

**Interacts with:** "It's Always DNS"'s honest counter (change-induced is the largest bucket), the
rm -rf moment (§9.3), the 2am Rule.

### The Trojan Award
You win a "Best Uptime" badge — **and attackers target you because you advertise it.**

**How it works:** Success raises your profile, and profile is targeting data. A reputation gain with an
attached threat modifier, which is the cleanest possible statement of the design's "every capability is
also surface" law applied to **marketing** rather than to infrastructure.

**Interacts with:** §9.2's You Are the Attacker's Target Board, the Conference Talk, the G2-badge
achievements (§9.3).

### The Hacker News Hug-of-Death
A free inbound traffic spike **with a hostile comment thread attached.**

**How it works:** Serve it well and earn **a decade of loyal customers**; choke on it and **the thread
is your obituary.** The famous slashdot effect, modernised — and the purest example of the design's
thesis that a good wave and a bad wave look identical on arrival.

**Interacts with:** §9.3's industry forum thread, the Customers Are the DDoS arc (§9.14), capacity
headroom purchases.

### The Marketing Gimmick Deck
Collectable one-shot commercial gambits.

**How it works:** *"Free Domain with Hosting!" · "2-for-1 month!" · "Celebrity server unboxing!"* Each
**cheapens or builds the brand**, with real decay curves rather than a flat buff. The commercial twin of
the Chaos Card Draft — you play them for tempo and pay for them later.

**Sibling:** **Vaporware Announcement** — see below.

### Vaporware Announcement
Reveal the roadmap **before it exists.**

**How it works:** An instant attraction buff — sign-ups pre-order vapour — **with a ship-delay churn
bomb and a credibility tax if you miss.** A timed bet on your own build velocity, and one of the few
mechanics that makes the *build queue* a public promise.

**Interacts with:** the Investor Dashboard Lie, Every Decision Has a Receipt, the trade press (§9.3).

### Ransom Negotiation (two win-paths)
After a breach — with backups intact, ha — the crew offers **a discount for early payment.**

**How it works:** **Refusing and restoring publicly is the reputation win.** **Paying is faster in cash
terms and flags you to the next crew** — they keep your card. Both are legitimate win-paths, which is
what makes the choice a choice. A politer variant leaves **a README** and invites you to negotiate.

**Interacts with:** the backup/restore loop, §9.11's responsible-depiction rule (the business, never the
technique), the Postmortem Editor.

### The Rival Operator
An AI company on the same map.

**How it works:** You can **peer with them** (mutual discount), **poach from them**, or **DDoS them**
— morally grey, with a fallout system. The rival mirrors your moves: poaches customers, copies features,
**outbids you in RFPs**, or eventually **acquires you.**

**The competitor cast, with personalities:** **CloudOx**, the hypervisor-funded Goliath who prices below
cost forever and then jacks it up · **the bargain-bin volume king** · **SecureVault**, the compliance
boutique that never loses an RFP but has a $10K minimum · **GhostHost**, the offshore ghost that gets
seized every 24 game-months and rebranded. **Market share as a four-lane race.**

**Rival Evolution — the part that makes it felt:** the AI competitor **actually grows.** Its builds are
visible across the property line, its status page upgrades, it **hires your quitters** and poaches with
price-signs — and **its collapse triggers migration caravans you must escort.** A living benchmark that
turns "beating the competition" into a readable race.

**Their events ripple into your funnel:** their disaster is your surge, your disaster is their ad copy,
and an end-of-level **market-share pie** scores it. (See also Shared World Events, above.)

**Interacts with:** §9.1's Competitive Market Mode and Hot-seat, §9.3's Competitor Obituary Feed,
§9.14's rival-as-your-old-company NG+ frames.

### The Abuse Contact and the Spamhaus Cascade
The peer-operator relationship, **given a face and a voicemail.**

**How it works — the Abuse-Contact NPC:** the person **at the next host over** whom you email about your
mutual abuser. It is a relationship arc: **fast, polite abuse responses build them**; ignored tickets
make them **go public about *you*** — a review-bomb from your peers, which is worse than one from
customers. In bulletproof arcs, they become your adversary. This is the doc's "upstream relationships"
made into a person.

**How it works — the cascade set-piece:** a **Spamhaus-2014-shaped boss level** for the offshore arc.
The bulletproof host **you are peering with** gets DDoSed by a nation-state-scale retaliation for
delisting spam, and **the blast radius crosses your ASN because you trusted the same upstream.** You
fight **no one directly**: you lose your peers one by one in a cascade of de-peering, and **the customer
road narrows tile by tile.** *[LATE, best risk/reward — it only works once the player has peers to
lose.]*

**Interacts with:** §9.11's responsible-depiction rule, the Dependency Web, §9.12's IP reputation.

---

## 9.3 Humour and tone

### Recognition comedy, not parody
The governing rule, with three clauses.

**How it works:** The humour comes from **accuracy** — the ticket that says "it's slow" and nothing
else, the customer who changed something and swears they didn't, the label maker that ran out of tape
halfway through the row. **It should make an operator laugh and a civilian merely smile.** Never punch
down at customers; **the joke is always the situation.**

**Clause two — the comedy must never interrupt a decision.** Jokes live in ticket text, staff chatter,
loading screens, labels, achievement names, set dressing and the Intern's Log — all of which are read
during calm. **Nothing funny should appear inside an alert, a build card, or a crisis prompt**, because
the comedy will undercut the tension you spent twenty minutes building.

**Clause three — the game is never funny at the moment of loss.** Comedy lives in the setup, the
flavour text, the ticket generator, the vendor personalities and the postmortem — **never in the
failure animation, never on the loss screen, never in an alert.** A game that jokes while you are
losing money feels contemptuous. **This one rule protects the tone more than the other two combined.**

### The ticket text generator
Endless procedural support tickets, per hosting type.

**How it works:** Subject lines from real life: *"URGENT!!! site down (it is not down)" · "can you make
it faster" · "I deleted something, can you get it back" · "what is my password" · "my developer left" ·
"is this a virus?" · "my cron didn't run"* (they misspelled it) · *"please remove my IP from the
blocklist I keep spamming from" · "can you make the font bigger on my server" · "your server deleted
my files"* (they FTP'd over them) · *"why did my bill go up"* (they enabled backups eleven months ago)
· *"I need this fixed in 5 minutes it's very important"* (sent Saturday 11pm) · *"I deleted
everything, please restore, I have no backups, also I cancelled backups to save $3."*

**And its siblings, which are the real comedy:** the ticket that is **a photograph of a screen, taken
at an angle**; the ticket that is a **forwarded email chain fourteen replies deep with no question in
it**; the ticket titled **"URGENT" sent at 4:55pm on Friday** describing something broken since
Tuesday; and the ticket that says **"I didn't change anything" with a diff attached.**

**Hosting types — per-line ticket packs give each type its own comedy:** **game hosting** gets *"someone
griefed my base, can you roll back the world"*; **email** gets *"my mail goes to spam and it is your
fault"*; **colo** gets *"can your tech plug in this thing I FedEx'd you, instructions are on a
napkin"*; **backup/DR** gets *"I need the file from Tuesday. No, the other Tuesday."*; **GPU** gets
*"my training run died at hour 40, can you restart it from where it was"*; **CDN** gets *"it's fast for
me but slow for my client in Perth and that is your problem"*; **streaming** gets *"the stream buffered
during the important bit"*; **dial-up/retro ISP** gets *"it disconnects when my mum picks up the
phone."*

**Interacts with:** §9.10's ticket packs as a localisation and community-contribution surface.

**Variations and additions — support-ticket folklore generators**

**Tone law first:** affectionate nerd-insider, **never mean at a real outage.** With that fixed, the
generator has several registers worth authoring separately:

- **The Support-Call Vignette Generator.** Churned or angry customers **phone in** with procedurally
  assembled one-liners — *"my site was down during MY wedding livestream."* The human texture of the
  queue; pure flavour, enormous engagement.
- **The billing tier, which is pure industry folklore.** *"I was charged $4.99, I only wanted the FREE
  trial (74 times)" · "My site down since 3 days, also this is unrelated and I forgot my password on
  [other registrar]" · "Per your last email"* (there was no previous email) · *"URGENT: password reset
  request sent to a Gmail address."* Ship them as an **unlockable ticket gallery** — operators will
  collect them.
- **Ticket-GPT.** A background stream of plausible absurdities — *"my site is down and it's your vibe",
  "please migrate us at 4am, it's fine"* — cheap procedural flavour that **rewards glancing at the
  queue.**
- **The recurring types with real support-log DNA.** *"My site slow"* (it's their DNS, they don't know)
  · *"pls add root to my friend"* · *"URGENT" at 2am Sunday* · *"it worked on my machine"* (you don't
  have *their* machine) · *"printer on fire"* · *"my website is 404-ing since tuesday plz help — $0
  budget."*
- **"Support Horror Stories" flavour mode.** A daily-haiku ticker of absurd tickets (*"the customer
  emailed the fax machine"*) with **an unlocked quote for each ticket closed.**

### Server naming and the label maker
The naming-convention arc — a running joke that becomes an operational problem.

**How it works:** You choose a scheme early — Greek gods, Star Wars, Tolkien, Pokémon, colours,
cheeses, or functional (`web01`, `web-fra1-07`). By Tier 4 you have hundreds and your early scheme has
become a liability. **Exactly the right kind of joke for this game**, and the design's best
**player-expression** hook in a category it is otherwise thin on.

**Expansion — make it a real choice with real effects, and give it a correct answer.** **Functional**
names give a small **MTTR bonus** and no personality. **Thematic** names give a small **morale bonus**
and a small **MTTR penalty at scale** — because `thor` tells you nothing about what it does, where it
is, or what depends on it. A **mixed/legacy estate** (what you get after an acquisition) carries a real
penalty until you run a **renaming project**, which costs a maintenance window, **breaks every runbook
and monitoring reference**, and is correct. The genuine expert answer is the hybrid: **thematic names
for pets, functional names for cattle** — and the moment your fleet crosses the threshold, the game
should offer the project. **A cosmetic decision that becomes an operational debt is the most on-theme
joke available.**

**How it looks:** the scheme is a real generator; names appear on **real label tape in the Handmade
Layer** at close zoom; and at Tier 4 the game should show you a rack where **three schemes coexist** —
the Greek gods from Tier 1, the functional names from Tier 3, and the acquired company's names — which
is the joke, the problem and the history **in one photograph.**

**Variations and additions — easter-egg fleets and hostname lore**

- **The auto-named estate.** `web01`, `web02`, `web03`, **`backup (DO NOT TOUCH)`**,
  `temp_DO_NOT_PRODUCTIONIZE`, and **`jimmy-laptop`** — which always, hilariously, **has the highest
  uptime in the fleet.** Achievement: *"jimmy-laptop"*, for surviving a level in which it never crashed.
- **The protocol-joke fleet.** The **418 teapot** (serves tea, blocks nothing, +1 duck morale) · the
  **perpetual-redirect loop**, a tiny ouroboros carousel that **traps one script-kiddie forever** (a
  real tarpit) · **"the bit bucket,"** a literal bucket and cousin to the /dev/null pit · and the
  **Y2.038K countdown clock**, ticking in the corner of every endgame level as a sequel hook.
- **RFCs-as-Sacred-Texts (the lore codex layer).** The RFCs are the game's **religion**: codex entries
  written in archaic prose (*"Thou shalt not send a reply to a reply's reply, lest storms of loops
  consume thee"*), **RFC numbers as easter-egg item codes** (RFC 2324: the Hyper Tea Pot, a functional
  buildable that brews nothing), and **heresy mechanics** — you can literally leave the church of TCP to
  found the cult of QUIC.
- **/dev/null as a buildable joke** — a black monolith that absorbs dropped traffic and, late-game,
  **whispers things.** The null device knows what it swallowed.

### The label maker that ran out of tape
Halfway through a row.

**How it works:** Half a rack is beautifully labelled and half is **masking tape and Sharpie**. **The
masking tape should persist for the rest of the campaign.**

### The cable colour war
Two engineers, two conventions.

**How it works:** Both are internally consistent. Neither will budge. **The game should never resolve
it.** It shows up in every screenshot of that row forever.

### The sticky note system
Inherited servers come with physical paper.

**How it works:** *"DO NOT REBOOT." · "ask dave." · "temp — remove 2009." · "this one is fine,
actually."* Player-placeable too — and an object with a **"DO NOT UNPLUG" post-it is excluded from bulk
operations**, which makes player-authored safety rails into physical objects. (See §9.2's Uptime
Superstition for the generated version.)

### The Intern's Log
A diary that appears between levels.

**How it works:** An intern's increasingly world-weary observations about what you've been doing.
**Cheap, characterful, and the best place to put the game's voice.**

**How it looks:** a **spiral notebook**, one spread per level, hand-lettered in the Marker face, with
doodles — a sketch of the rack that caught fire, an arrow pointing at a cable, a drawing of the cat.
Entries get visibly **more competent and more world-weary** as the campaign proceeds, and **the
handwriting gets faster.** **The notebook fills up, and that is the campaign's emotional progress
bar.**

### Achievements
A list that is itself the joke.

**How it works — the classics:** *"It Was DNS." · "Works On My Machine." · "Works In Staging." · "Works
On My Staging." · "We Have Backups (Untested)." · "Five Nines, Zero Sleep." · "Five Nines and a Lie." ·
"Nobody Got Paged." · "Blameless." · "The Rebuild." · "Bus Factor: Three." · "Load Bank Tested." · "Amps
Not Us." · "Restored In Anger." · "Zero Findings." · "Nobody Missed A Pass." · "Warmed The Pool." ·
"Still Running." · "The Tour." · "Toll Free." · "Ask Dave." · "Days Since Last Outage: 1." · "The Cert
Expired." · "Certificate of Achievement" (survive a cert expiry) · "Certified" (renewed it six minutes
after expiry) · "Rebooted It, It Worked, Never Found Out Why." · "Percussive Maintenance" (reseating a
card fixed it and you'll never know why) · "Worked As Intended" (three hours diagnosing a typo in your
own config) · "Backhoe Season." · "The Rack Was Load-Bearing." · "Two Is One, One Is None." · "That
Cable Was Definitely Unused." · "Rebuilt the Wrong Drive." · "Read the Runbook." · "We'll Fix It
Monday." · "Free Beer Is Not a Migration Plan." · "Hero Culture"* (survive a quarter entirely on manual
intervention — **and get graded down for it**) · *"Found It"* (successfully trace a mystery cable).

**The business tier — achievements that are business truths:** *"Ramen Profitable"* (first month of
positive cash without financing) · *"Net Negative Churn"* (NRR > 100%) · *"Fired a Customer"* · *"Never
Missed Payroll"* · *"Read the Contract"* · *"Tested a Restore"* · *"Sold the Cost Center"* (turned an
internal tool into a product line) · *"Boring and Rich"* (finish a level with zero incidents and
top-quartile margin) · *"The Whale Stayed."*

**The diagnosis tier — the achievements a competent player is actually proud of:** *"Called It"* (used
a Preparation Token correctly) · *"Named the Cause First Time"* (postmortem minigame, ten times) ·
*"Never Chased the Herring"* · *"Found It Before the Alert"* · *"Shrank On Purpose"* · *"Under Par,
Over Nines."*

**The Scream Test family:** *"Turn It Off And See: 7 days"* · *"…30 days"* · *"…Fiscal Year End"*
(survive a machine you powered off in June until the January batch run doesn't fire).

**How it looks:** each achievement is a **printed asset tag** — a small metallic sticker with a barcode,
a number, and the name in the Signage face — stuck to a board. **Locked ones are blank tags.** Rare
ones are a different colour stock. **`Days Since Last Outage: 1` is deliberately a cheap paper one.**
They look like something you'd actually find in a datacenter, **which is the whole joke.**

**Variations and additions — the design rule, and the great lists**

**The design rule first:** **every achievement must be a *story unit*** — *survived X via Y*, *witnessed
Z* — and the **count-based grind walls should be cut.** The template is *"an unusual combination
survived = a War Story."* Second rule: **map the losses the design keeps insisting teach**, and tie each
to the Failure Museum's halls, so **achievements, the museum and the scar tree are one collection loop
rather than three lists**: *"Beautiful Disaster"* (trigger 10 distinct failure types) · *"Fireable"*
(3 whale-churns in one level) · *"Ghost Writer"* (10 postmortems filed) · *"The Longest Night"* (survive
to minute N at 0% cash).

**Presentation:** achievement toasts land as **giant rubber stamps thudding onto the Handbook page**,
which animates to the desk and **stacks visibly**; a rare achievement's stamp gets **gold foil.**

**Achievements with bite:** *"Works on My Machine"* (win with a container stack only) · *"Blameless"*
(resolve an incident without firing anyone) · *"5-9s"* (survive a 9-hour outage that *is* the level) ·
*"YAML Horror"* (clear a k8s level with zero crash loops) · *"Churn Burner"* (lose every customer but
stay profitable 20 waves) · *"Never Slept Again"* (survive The Long Night) · *"You're On The News Now"* ·
*"Blacklisted"* · *"Free the Drive"* (a successful RAID rebuild under load) · *"It Worked In Testing"*
(zero bad deploys) · *"Clean Hands"* (pass an audit with zero findings).

**The five-nines elaborations:** the **"99.999 Club"** across a full calendar year — **the entire hall
goes silent and a platinum server racks itself in as a trophy** — plus the hidden one, *"60 seconds of
downtime, but it was YOUR blog post about it."* And the holy grail **99.999%**, which the game respects
with **a golden rack and an awards-show cutscene every level thereafter.**

**Names only operators get:** *"Zero-Downtime Sunday"* · *"Card Declined: All of Them"* · *"You Are Now a
Ransomware Statistic"* · *"The Cages Are Full (Of Regret)"* · *"SOC2 Type II (Emotional Damage)"* ·
*"Grandfathered."*

**The billing-office and finance tier:** *"Chargeback Champion"* (process 1,000 chargebacks in one run —
**the medal is engraved with the merchant-account ban you earned**) · *"Rule of 40"* · *"CAC Slayer"* ·
*"Float YOLO"* (survive spending deferred revenue) · *"No Naked SLAs"* (finish a level with every
contract carrying caps and exclusions) · *"Grandpa's Rate"* · *"Clean Books"* · *"Churn Whisperer"* (save
10 at-risk accounts in one renewal window) · *"Net Negative Churn"* · *"Chargeback Ratio Virgin"* ·
*"Sold a Cross-Connect at Midnight"* · *"Escaped VMSS"* · *"Won on a G2 Badge"* · *"Ran 95th Percentile
Against You and Lived."* **The trophy list doubles as an educational glossary of business concepts.**

**The comedy tier:** *"Uptime Saint"* (zero nines lost on three levels) · *"Sudo Sudo"* (fix 100 problems
with a reboot) · *"Ph.D. in Stack Overflow"* · *"0.999"* · *"It's Not a Bug, It's a Feature"* · *"Have
You Tried Restarting It?"* · *"CIS Benchmarked"* · *"Postmortem Approved"* · *"The Cloud Is Just Someone
Else's Colo."*

**The sysadmin-suffering tier:** *"0 Days Uptime"* (never rebooted) · *"Five Nines Club"* · *"Bird's
Nest"* (cable spaghetti over threshold) · *"Contact Abuse@"* · *"Certified Panic"* (renew a cert at
00:00) · *"The Cowpaths"* (customers happy despite the topology) · *"RPKI, Finally"* · *"Restored The
Backup (It Worked)"* · *"Ctrl-Alt-Defeated"* · *"It Was DNS"* · *"0.4% Uptime (Down For Everyone)"* ·
*"Bold Strategy, Cotton"* · *"The Tamagotchi Is Dead"* · *"First BGP Leak (Everyone's First)"* · *"Ran
Out of IPv4"* · *"The Great Capacitor Plague"* · *"Fixed It With A Cable Tie"* · *"Backbliss"* (survive
ransomware with only the tape) · *"Ransomware Breakfast"* (restore from snapshot in under 30 seconds).

**The cheap trophies that teach — each one a lesson in a real operator value the tutorial never states:**
*"Power of One"* (finish a colo level **never tripping the second feed** — you lived on one transformer
the whole time and *felt* it) · *"Grandpa's Rate"* (an account profitable since 2009 still at $4.95 —
your shame and your pride) · *"RTFM"* (resolve an incident by opening **your own documentation tower** —
**the game checks the hover, not the outcome**) · *"Zero-Ghost Audit"* (a certification pass with an
empty orphan-record count) · *"Bonded"* (survive a government RFP cycle with performance bonds intact) ·
*"The Longest TTL"* (survive an outage you caused, **because your DNS TTLs were patient**) ·
*"Sustainably Greedy"* (win with 80% overcommit) · *"The Real Boss"* (fire the abusive customer right
before a seizure).

**And the honourable mentions:** *"Tough Love"* (fire a whale and stay solvent through the next quarter)
· *"Ran a Successful Migration (Nobody Noticed)"* · *"Guardian Angel"* (keep the cookie-recipe grandma
alive through every era — see §9.14) · *"jimmy-laptop"* · *"Works on My Machine"* in its purist form:
**win a level without ever consulting the community answer site.**

### Outage Bingo
A joke card that is also a taxonomy.

**How it works:** A 5×5 grid — *"it was DNS" · "expired cert" · "disk full" · "someone deployed on
Friday" · "it worked in staging" · "the backup was of the wrong volume" · "the redundant pair was on
the same PDU" · "nobody had the vendor's phone number."* Fill a line for a cosmetic. **It teaches the
bestiary by being a joke about the bestiary.**

### The fictional trade press and the Competitor Obituary Feed
A ticker of industry news.

**How it works:** Competitor announcements, acquisitions, outage coverage (sometimes yours), breathless
coverage of whatever the current hype cycle is. **World-building and mechanics at once** — the news
sometimes tells you what's coming.

**The obituary feed is the best channel in it:** other hosts go bankrupt, get acquired, or get
deplatformed, **with one-line causes.** *"LowEndVPS.biz shut down after a chargeback ratio breach."*
*"Northgate Colo sold to a REIT; tenants given 90 days."* **Free tutorialization, great flavour, and it
makes the world feel populated.**

**Variations and additions — the news ticker as an intel channel**

- **The persistent ticker.** Your company gets mentioned — launches, outages, lawsuits, acquisitions —
  and **your reputation on the ticker persists into the next level's customer mix.**
  Meta-progress as tabloid.
- **The internet news crawl.** Parody headlines covering your incidents, competitor collapses and fresh
  CVEs, living in the same world your alerts do: a humour channel **and** subtle intel.
- **The Slack Ticker.** A scrolling office-chat delivering lore, hints, passive-aggressive ticket
  threads, vendor spam and incident blame (*"it's definitely the database guy"*) — **and it is a
  gameplay channel:** the on-call can type `/rollback` if you have wired the CI tower. A secret command
  layer hiding inside the comedy feed.

### The industry forum thread
A recurring in-fiction thread where operators discuss **you**.

**How it works:** The titles escalate beautifully: *"Anyone else seeing packet loss to [you]?"* →
*"[You] — what's going on?"* → *"[You] acquired by [conglomerate]. Thoughts?"* → *"RIP [you]."* The
general in-game forum is also a **legitimate reputation feedback channel**, reacting to your outages and
your prices in real time. Brutal, funny, and mechanically live.

### The Trade Radio
Ambient world-building you can listen to.

**How it works:** An optional background audio channel — a low-key industry podcast, a news bulletin on
the hour, a conference talk recording. It reports **real in-game world events** (a competitor's outage,
a vulnerability, an acquisition, a regulation) **a few minutes before the mechanical consequence
lands.** **A player who listens gets a head start**, exactly as reading logs does, and the game gets an
enormous amount of personality for the price of some audio.

### The status page euphemism ladder — and its commercial twin
Escalating honesty, in two registers.

**How it works:** *"Investigating elevated error rates"* → *"Degraded performance"* → *"Partial
outage"* → *"Major outage"* → *"We are aware of the fire."* **The player chooses the wording and the
customers notice the gap between the words and reality.** (The mechanical version is §9.2's Postmortem
Publishing / Status Page Voice.)

**The commercial mirror — the price increase euphemism ladder:** *"Investing in our platform."* →
*"Aligning our pricing with the value we deliver."* → *"A modest adjustment."* → *"Your plan is being
upgraded."* Same structure, same recognition comedy, **and the player writes it themselves, which makes
them complicit.**

### The vendor comedy channel
Three recurring bits.

**How it works:** **The support response generator** — *"Have you tried updating to the latest
firmware?" · "Please collect a full log bundle." · "This is a known issue, fixed in the next release (no
ETA)." · "Closing due to inactivity."* **The hold music** — per vendor, as an actual recurring audio
motif; **players will learn to dread one of them.** **The sales email**, which is its own genre. Plus
the **renewal notice**: your *own* vendors' evergreen auto-renewal notices arrive as **junk-looking
emails you can miss**, locking you in for another year — **and one of them is genuinely important.**

### The maintenance notification nobody reads
A three-beat joke.

**How it works:** Beat one: you send it. Beat two: a customer complains about a maintenance **they were
notified of four times.** Beat three: the *one* customer who **read it** asks a question you hadn't
considered **and is right.**

### The office set dressing
Where the warmth lives — and one rule that makes it work.

**How it works:** The cat that sits on the warm equipment (and occasionally causes an incident). The
coffee machine that shares a circuit with something important. The one beige server nobody will
replace. Cable colours nobody agreed on. The gong for closing a big deal. The **"Days Since Last
Outage"** whiteboard with a number you have to erase. The Comic Sans warning sign from 1998 that nobody
has taken down. **The one blinking amber LED** you never quite get around to — it's fine, it's been
fine for two years. **The rack elevation diagram nobody updated**, shown next to reality. **The
doorstop**: a decommissioned Sun/SGI/DEC box propping open a door, rendered lovingly — and one
achievement makes you realise **it's still in DNS.**

**The rule:** every set-dressing object lives in the **Handmade Layer**, and **at least one of them is
mechanically live** — the coffee machine really *is* on a shared circuit, the cat really *can* cause an
incident, the Days Since Last Outage board really *is* the uptime streak. **Set dressing that is 90%
flavour and 10% real is far better than either extreme**, because the player can never be sure which is
which.

**Variations and additions — ambient gags and the commitment-to-the-bit layer**

- **The Colophon of Downtime.** The game ships with a real, funny **"SLA"**: the EULA is a parody hosting
  agreement, the pause menu is a NOC room, settings is **"Configuration,"** and quitting mid-level is a
  **"planned maintenance window."**
- **The Boss Key.** A literal *"boss is coming"* button that instantly swaps the screen to a fake
  spreadsheet — **and during Boss Mode the game runs defenceless.** Pure nostalgia gag, zero balance
  cost, with an optional **"HR audit"** version for modern-era levels.
- **Customer Quotes.** Tiny speech bubbles on walking customers — *"is this thing down?", "my nephew said
  hosting is easy", "why is the internet in the toilet?", "uptime or it didn't happen"* — ambient flavour
  **and an instant read of sentiment.**
- **The Cloud is a Cloud.** A literal cloud floats above the map and traffic goes up into it; during a
  global provider outage **the competitors' clouds visibly wilt** while **yours puffs up** with new
  customers.
- **The office and support bits.** *"Please hold"* when your support rep is on break · a **`sudo make me
  a sandwich`** easter egg in the openable shell terminal · your product's changelog getting
  **progressively more passive-aggressive** (*"Fixes the thing you broke on deploy"*) · the *"one weird
  trick to halve your bandwidth bill"* popup **that is itself adware** · **your monitoring's own
  dashboard going down** (who watches the watchmen?) as a recurring gag with real teeth · and the **"no
  socks" server-room penalty event.**
- **56k ASMR.** Modem handshake on level start, **floppy clicks on saves**, cooling fans crescendoing
  with load. Sound design as a love letter.
- **"Works On My Machine" Shrine.** A buildable — a tiny altar with a dev laptop — that **reduces
  bad-deploy risk by 50%, and increases it by 50% when discovered.** Humour with a real risk mechanic
  behind it, paired with the *works-on-my-machine* deploy-failure animation.
- **Uptime Theater (decor edition).** At 100% uptime your lobby has **a ping-pong table and bean bags**;
  chronic incidents replace them with **Red Bull and cots.** Company morale expressed purely as decor.
- **The Easter-Egg Wing.** The server-room ceiling hides **a catwalk** where a founder-type staff avatar
  walks past muttering mutating rumours — **follow him for unlock breadcrumbs.**

### The Office Cat
Fully diegetic monitoring.

**How it works:** An NPC cat sleeps on the **warmest rack**. Where it sleeps is **actually a heat
indicator.** It occasionally walks across a keyboard. In the "Realistic" difficulty (§9.2) the cat is
part of your monitoring stack, which is the funniest sentence in this document and also true.

**Variations and additions**

- **The Rack Cat's full job description.** It roams the datacenter, **catches phishing-mice**, and
  **refuses to move during audits** — relocating it is a real, funny, clickable action. Deeply optional
  and infinitely memeable.
- **The NOC Cat variant (an ambient danger-radar).** An untouchable cat wanders the facility and, **if a
  thermal or power event is coming, avoids that zone first.** A living early-warning system disguised as
  set dressing — and it will be everyone's favourite UI element.

### The Legacy Server With a Name
Inherited machines get names.

**How it works:** `BEHEMOTH`. `tiny`. `webserver2-old-DO-NOT-DELETE`. Retiring one that's been running
for eleven in-game years **should get a small ceremony** — and the Hall of Fame Drive (§9.10) gets a
plaque and, when it finally dies, **a short, genuinely sad animation.**

**Variations and additions**

- **The sticky-note tier.** A **"this machine is haunted"** note on the one that fails randomly; the
  machine that **boots only when addressed kindly**; the firewall rule nobody understands but everyone
  fears. (The full haunted-hardware family lives under §9.2's Legacy Box.)
- **The RAID Array as a Tamagotchi.** One rebuildable pet-drive you must replace **before its SMART
  counter hits the threshold.** It chirps. **Everyone ignores it once. Everyone.**

### The certificate whose CN is `localhost`
In production. Working. For four years.

### "Restart it."
A support macro that resolves 60% of tickets, is deeply unsatisfying, and is **correct.**

**Variations and additions**

- **The spell version — "Have You Tried Turning It Off And On Again?"** A cheap, free, one-shot reboot
  with a **90-second tech-support voice line** attached.
- **The tactical-lever version.** Force-restart a tower: it **clears most afflictions**, costs **60
  seconds of downtime**, and **each use adds a tiny permanent "wear" stat.** The joke that is also a real
  tactical lever.
- **Its support-minigame form.** Escalating absurd tickets with **correct deadpan answers that reward
  patience** — a beloved flavour system in its own right.
- **VFX spec.** A localised power-down wave: the target's LEDs die **top-to-bottom**, a **two-beat
  silence**, then the **boot chorus re-lights in sequence.** The most familiar sound in hosting, made
  into a spell animation.
- **Hard constraint (from §9.15's contradiction C1):** whatever the fix rate, **reboot must not cleanse
  persistent threats.** Miners come back. That is what the reimage/rebuild tiers are for.

### The reboot fix-rate — *CONFLICTING*
Both documents make the reboot a headline joke-mechanic and then give it **a different success number**
for the same action. The dispute is a single dial: **how often does turning it off and on again actually
work?** It matters because the number decides whether the reboot is a *habit* or a *gamble*.

#### Position A — 60%, the support macro *(master)*

Master states it plainly: *"Restart it."* is **a support macro that resolves 60% of tickets, is deeply
unsatisfying, and is correct.** At 60% the joke is about **institutional embarrassment**: the cheap answer is the right
answer most of the time, and the player's discomfort is the content. A universal-reboot variant states
the same figure from the other direction — **"fixes 60% of weird problems."**

#### Position B — 30%, the one-shot spell *(opencode)*

The reboot is **a cheap free one-shot spell with a 30% fix rate** and a 90-second voice line. At 30% it
is a **gamble you take when you are out of ideas**, which keeps diagnosis valuable — if the reboot works
most of the time, the diagnosis loop (the game's most distinctive pleasure, per §9.1) is undercut by a
one-click dominant action.

**What the decision turns on:** whether the reboot is meant to be *funny* (60%, and the joke is that it
works) or *tempting* (30%, and the joke is that you try it anyway). The tactical-lever version above —
clears most afflictions, 60s downtime, permanent wear — is a third path that prices the action instead of
rolling for it, and would let either number stand.

### The on-call handoff note that says only "quiet night"
Immediately before everything explodes.

### The Advisor Voicemail
Your mentor leaves short voicemails commenting on your metrics.

**How it works:** Dry, dead-on, occasionally brutal: *"Saw your renewal pricing. You're going to have a
great quarter and a terrible year."* Delivered as audio with a transcript, once a month, never
blocking.

### The corporate comedy set
Four small recurring bits from the business side.

**How it works:** **The acquisition email** — *"Nothing will change for our customers."* Displayed
verbatim, every time, **including the time you send it.** **The quarterly all-hands slide** where last
quarter's mandate is quietly not mentioned. **The sales rep's whiteboard countdown** to quota, erased
and rewritten daily. **The invoice with a PO number field** that an enterprise customer will use to not
pay you for 60 extra days — **and the moment the player learns to ask for the PO number *before*
invoicing.** Plus the **conference badge collection** on the company wall, accumulating lanyards, one
of which is from an event that no longer exists because the organizer went under.

### Cameo Customers
Procedural customers with era-appropriate flavour.

**How it works:** Names and site types generated per era — a webring, a Geocities-alike, a forum, a
phpBB install, a crypto exchange, an AI wrapper startup, a regional newspaper, a Minecraft server for a
school. **Their business type predicts their traffic shape and their survival odds**, so **reading your
customers' businesses becomes a forecasting skill.** Paired with the Customer Logo Generator (§9.10),
your contract cards and logo wall fill with plausible fake companies with plausible fake logos —
**instant world texture.**

### The Post-It with the root password
A collectible you can find in the acquisition level.

### The RFC 2324 easter egg
A coffee-machine buildable that returns **418**.

### The Cursed Basement
A joke level that is secretly a tutorial.

**How it works:** A residential basement, a consumer router, an extension-cord daisy chain, a window AC
unit, a shelf of drives on a plank. **Everything is wrong and the art should revel in it.** Also a
surprisingly good tutorial for **why the real stuff exists** — every proper buildable in the game is
visibly the fix for something you can see failing here.

### The Postmortem Blog
Your published postmortems accumulate into a fake company engineering blog.

**How it works:** Browsable, **with era-appropriate web design** — the 1998 one has a tiled background
and an under-construction GIF; the 2012 one is a Bootstrap three-column; the 2024 one is a dark
minimalist with a huge hero. **Best single joke in the game**, and it costs nothing because the
postmortems already exist as data.

### The Ops Diary Comic
A six-panel strip generated from your incident timeline.

**How it works:** At level end, the game auto-generates a comic from your actual event log, using real
screenshots stylized with halftone and **hand-lettered captions pulled from the log text.** Shareable,
hilarious, **and built entirely from data you already have.**

### Loading-screen tips that are real advice
Useful humour — **flavour, not instruction** (see §9.5's teaching/explaining split).

**How it works:** Actual operational wisdom, delivered dryly. *"A backup you haven't restored is a
hypothesis." · "The backup you never restored is a rumour." · "The failover you never tested is not a
failover." · "It is always DNS. Except when it's MTU." · "Diverse paths that share a conduit are one
path." · "Every monitoring gap is discovered by a customer." · "Two of something is often one of
something."*

**Variations and additions — the three registers**

- **Deadpan operational one-liners as worldbuilding.** *"There are two hard problems in hosting: cache
  invalidation, naming, and off-by-one errors."*
- **The snark channel.** *"Real-time is a feature of uptime."* — every vendor. *"A backup you've never
  restored is a rumour."* *"The network is stable. The user is the outage."*
- **Tips operators recognise.** *"The bottleneck is never the network; it's the meeting about the
  network."* *"Uptime is a social contract."* Plus the one-star review that belongs on the same screen:
  *"server is not a cloud, should be more clouds."*
- **Loading Screens as Error Pages.** Every era gets its own: a **90s blue screen**, a hand-drawn nginx
  *"502 (bad gateway) — the penguins are on strike"*, a compliant corporate *"we're improving our
  services."* **The joke teaches the iconography**, which keeps it inside §9.5's flavour-not-instruction
  rule.

### Staff chatter
Ambient dialogue.

**How it works:** Your team talks during quiet moments and during incidents. **What they say during a
cascade is the game's best writing opportunity. Nobody panics; everyone is tired.**

### The rm -rf moment
The game's most careful joke.

**How it works:** A confirmation dialog that you will one day click through too fast. **It must be
survivable** — that's what backups are for — and it must be nobody's fault but yours. Its sibling is
the **"please confirm by typing the hostname"** dialog, and the fact that players will start typing it
automatically without reading, **which is exactly what happens in real life and should occasionally
cost them.**

### The ToS Scroll and the fine-print card game
Your Terms of Service, promoted from flavour text to a strategy surface.

**How it works:** **Unroll the ToS to stun legal threats.** DMCA and abuse claims arrive as **short legal
card-battles won by citing the right clause** — speed rounds between defense waves, with lawyers
available as a buildable staff card. **The SLA Fine Print:** the contract screen is a **real scrollable
legal document**, and the joke is that it's accurate — scrolling far enough reveals **a hidden clause
that helps.** ***Reading is power.***

**The variants, all compatible:**
- **"TOS Fine Print" card draft** — occasionally choose clauses (auto-renew, termination window,
  liability caps); **each clause is a money shield *and* a review bomb.**
- **The ToS as a spellbook** — your Terms of Service is **a living document the player edits.** Clauses
  are literal cards (Acceptable Use, Suspension Without Notice, No Liability for Lost Data, Binding
  Arbitration), each granting or limiting enforcement powers and shifting the customer-trust meter, and
  **editing mid-game triggers a customer-reaction wave** (*"they changed the ToS?!"*).
- **The achievement set** — collectible easter eggs for clauses (*"We reserve the right," "at our sole
  discretion," "arbitration in the state of Delaware"*), each granting a tiny defense against a specific
  threat. The humour of reading your own ToS at 3am.
- **The EULA-popup gag** — end-user licence popups as accept/deny trade-off decisions inside the game's
  own humour lane.

**Interacts with:** §9.2's Handshake Deal and the RFP Minigame, §9.11's responsible-depiction rule,
the Colophon of Downtime (the parody EULA the game itself ships with).

### The industry-folklore grab-bag
The set-pieces the industry has already written, collected.

**How it works:** **Stack Overflow copy-paste** summoned as an ancient golem · **the intern who ran
`rm -rf /` on prod** as a scripted boss, and the intern NPC who "fixes" prod **by deleting the backup
server** · tickets reading *"computer won't work"* · **404 gremlins** and **the 404 ghost** (a customer
you can never quite serve) · a server that only runs **if kept in a freezer** ("that's normal") · the
legacy box nobody dares reboot, with **a shrine of config printouts** · the rack of doom where all cables
are a single grey nest · log files that occasionally print `TODO: fix before production` · **RAID staffed
by tiny knights** — *Redundant Array of Independent Devoted Knights* · **/dev/null as an actual pit
tower** · **the blame-the-CDN button** (transfers a minor incident to a fictional upstream, once per
level, karma risk) · **the tape monster that eats tapes** · **the rack that falls like dominoes** when
the seismic event hits · and *"the cloud is just other people's computers"* as the final revelation.

**Two with real teeth:**
- **The `rm -rf` random event.** An extremely low chance that **your own automation script** — a poorly
  written buildable — executes the forbidden command on prod. The screen goes quiet, then a single
  `deleting...`. **There is no counter, only mitigation: backups.** (Its player-facing sibling is §9.3's
  rm -rf moment.)
- **Stack Overflow as a Healing Spring.** Engineers path to it to recover — and **occasionally it is
  down** as a world event, and the whole industry slows down. Achievement *"Works on My Machine"* for
  winning a level without ever consulting it.

### Ops Horror (the dread skin)
The same events, re-lit.

**How it works:** An **unlockable aesthetic layer** where every event plays as *sysadmin horror* — red
emergency lighting, klaxons, **the nation-state van as a lurking slasher.** The art style becomes a joke
about pager fatigue, and it costs nothing but a grade and a sound bank.

**Its set piece — the "There Is No Level" 404 Level:** a glitch-art level built on the real
deleted-datacenter incident — broken render, missing textures, **enemies that *undo*.** The corruption
shader taken full-screen.

**Guardrail:** this must stay inside §9.3's clause three — **the game is never funny at the moment of
loss** — and inside §9.8's reduced-flashing and Quiet Mode commitments. Dread is a skin the player
chooses, never a default.

### The Scare
The one-time fakeout, and the design's only deliberate jump.

**How it works:** **Once per save**, at a random mid-level moment, the screen tapers to a
ransomware-style overlay: padlocks creeping in, a heartbeat sound, *"YOUR FILES HAVE BEEN…"* — and then
**it unlocks with a pop.** It was a penetration test, or a certification exercise, or — the cruellest and
best version — **the cosmic-ray bit flip rendered as a full prank on the player.**

**The aftermath grants the "Cold Hands" buff** (you spot the real one faster) and a codex entry about
incident adrenaline. **Configurable OFF in accessibility** — the *right* to disable fear is written into
the game's own parody TOS.

**Interacts with:** §9.12's Cosmic Rays, §9.8's baseline accessibility commitments, the ransomware
threat family.

### "The Rack Rate"
A small, knowing joke about enterprise pricing.

**How it works:** Certain customers ask for **"rack rate"** — and there is a literal dial labelled
**"sales bullshit"** (internal comedy/dev-mode only). The better version promotes it to **an enterprise
negotiation minigame bonus** you only get if you've earned it. Hidden, silly, and deeply understood by
exactly one half of the audience.

---

## 9.4 Meta systems

### ⚔️ One persistent Company object, four faces
**The problem, stated first, because this subsection invents nine meta-progression systems:** the
Playbook, the Alumni Network, the Annual Report, Industry Benchmarks, the Company Museum, the Company
Wall, the Ops Almanac, Prestige/The Exit and the Company Ledger are **nine separate meta systems**, and
they will compete for the same screen and the same player attention.

**The fix — one persistent Company object with four faces:**
- **The Wall** — *what you achieved*: certificates, badges, press clippings, streaks, the first dollar.
- **The Scrapbook** — *what it cost*: postmortem polaroids, the Wall of Ghosts, the scar ledger.
- **The Almanac** — *the numbers*: records, benchmarks, annual reports, industry comparisons.
- **The People** — *who was there*: alumni, current staff, the recurring cast, who left and why.

**Everything proposed below slots into exactly one of those four, and the Museum is simply the room you
walk through to see all four.** One object, four faces, nine ideas preserved, **one screen.**

### The Long Save
A design commitment worth making explicit.

**How it works:** **A single company, persisting across every mode, for hundreds of hours** —
accumulating history, staff careers, hardware biographies, scars, museum exhibits and records.
Campaign, scenarios, endless and daily challenges all **write into it**. It is the object the four
faces above are faces *of*, and it is the thing that makes "Your Past Self Is The Boss" (§9.2) and
"Two Companies, One You" (§9.9) possible at all.

### The Playbook
Your accumulated runbooks, carried between runs.

**How it works:** Procedures you wrote become permanently available, slightly improved each time you
use them. **Meta-progression that is literally institutional knowledge.**

**Expansion — it needs a cost, or it is pure snowball.** The Playbook holds a **fixed number of slots**
(say 8) and you **choose which procedures to carry** between runs. Carried procedures start at
**Assisted** rather than **Automated**, so **you keep the knowledge and re-earn the automation.**
**Meta-progression that preserves the moment-to-moment loop is the only kind worth shipping.**

### The Company Wiki / Knowledge Base
The Playbook's prose half.

**How it works:** A real persistent artifact across the campaign — your own notes, your own diagrams,
your own naming conventions, your own "how we do things." It is what §9.2's Documentation mechanic
writes into, it is what the Handover reads from, and it is exportable (§9.10).

### The Alumni Network
Staff who left stay in the world.

**How it works:** They turn up at other companies, refer candidates to you, recommend you to customers,
become your customers, or compete with you — **depending on how you treated them.** Staff you treated
well go on to **run other companies** and show up later as partners, customers, or competitors **with
memory of how you managed them.** **The most elegant long-term consequence system here.**

### Career Mode for Staff
Individual staff have names, histories, and arcs.

**How it works:** Your first junior tech can become your CTO, or burn out and leave, **and it should
land.** Their arc is visible: what they learned, what they were on call for, what they were blamed for,
what they now own. Feeds the Alumni Network on exit and the Museum's People face forever.

### The Persistent Reputation Ledger
Reputation with a memory across the whole campaign.

**How it works:** Reputation, customer relationships, staff and industry standing **carry across every
level.** **Level 3's shortcut is Level 9's deposition.** It is the substrate the diligence report, the
enterprise conversion gate, the hiring pool and the financing rate all read from.

### The Annual Report
An end-of-year document — designed, not dumped.

**How it works:** A generated report with your financials, your uptime, your biggest incidents, your
best and worst customers, and a letter from the CEO (you). **Highly shareable, and it makes a year of
play feel like a chapter.**

**How it looks:** a **six-page generated document with a real annual-report layout** — a cover with the
Establishing Frame of your facility and your company mark; **a letter from the CEO set in the Doc face
with your company's actual events written into it**; a financial spread on ledger stock; an operations
spread with the Uptime Ribbon and the Nines; a customer spread with portrait cards for your best and
worst; and a closing page with one photograph. **Exports as a single tall image.**

### The Anniversary
A small recurring beat with a big cumulative effect.

**How it works:** Once per in-game year, a short interstitial: a photo of the team, a one-line summary
of the year, the number of customers served, the number of incidents survived, and one thing that
changed. **Four of them in a row at the end of a campaign is a better ending than any cutscene.**

### The Ops Almanac
A record book, not an achievement list.

**How it works:** Your worst outage. Longest streak. Biggest customer. Most expensive mistake. The
threat that has cost you the most **across every company you have ever run.** The line you have played
most; the line you have **never** played. It accumulates forever. **A save file that reads like a
career.**

### Industry Benchmarks
Compare yourself to the field.

**How it works:** *"Your churn is 4.2%; the industry median is 2.8%."* Sourced from aggregate player
data or from authored norms. **Context turns a number into a judgment.**

### The Uptime Streak — one shared, persistent, cross-mode object
Unify the several streak proposals into one.

**How it works:** **One persistent counter for the company**, surviving across levels and modes,
displayed on the office wall as the **"Days Since Last Outage" whiteboard** (the prop already exists in
§9.3). It feeds **financing rates, enterprise conversion, insurance premiums and hiring**. And
**erasing the number by hand after an outage should be an animation the player has to watch.**

**Interacts with:** §9.7's real uptime leaderboard, where a run renders as its **Uptime Ribbon** rather
than as a number — comparing two ribbons side by side is instantly legible and a number is not.

### The Postmortem Wall / The Postmortem Reading Room
A trophy case made of failures, and a library made of other people's.

**How it works — the Wall:** a persistent gallery of every serious incident across your **whole
career**, with its cause, its cost, and what you changed afterwards. **The Scrapbook face of the
Company object.**

**How it works — the Reading Room:** a permanent in-game library of incident write-ups — **from your own
campaign, from NPC competitors, and from fictionalized versions of the industry's famous public
postmortems.** Reading one during peacetime **converts quiet time into Intel.** It models the actual
mechanism by which operations knowledge is transmitted between companies, **and it turns Historical
Scenarios from a level pack into a permanent system.**

### The Company Museum
A permanent gallery of your history — with a floorplan.

**How it works:** Every line you ever ran, every era you lived through, your first server, your worst
outage, your biggest customer, the Wall of Ghosts. **It's the Skin Preview Room, the trophy rack, the
scrapbook and the postmortem archive in one place** — and it's the single best reason to keep a long
save.

**How it looks — a wing of the facility laid out as a real small museum:**
- a **timeline corridor** — one plinth per era you lived through, with that era's hardware **and its UI
  chrome** preserved;
- the **Trophy Rack** — your first server, mounted, with a plaque;
- the **Placard Wall** — one placard per business line you ever ran;
- the **Scrapbook Room** — post-mortem polaroids and incident posters;
- the **Wall of Ghosts** — churned customers, deliberately in a dim side room;
- the **Skin Preview Room** — every hosting-type skin as a set of lit dioramas.

Walkable with the Tour camera. **Everything in it is an artifact the game already generates.**

### The Museum Docent
A reason to revisit it.

**How it works:** A staff member gives tours of your own history to new hires (and to the player). **The
script is generated from your actual run:** *"This is the first server. It ran for four years. We lost
it in the flood of year three and Maria drove out at 2am to get the drives out."* **The game narrating
your own history back to you is the cheapest emotional payoff in the design and it lands every time.**

### The Company Wall
The small, always-visible version of the Museum.

**How it works:** Certificates, framed press clippings, the first dollar, the conference lanyards, the
Days Since Last Outage board. It lives in the office you already render, so it costs nothing.

### Business Mix Panel
A pie of your revenue by line, with a diversification score.

**How it works:** Explicitly rewards running **complementary** businesses — day-peaking + night-peaking,
capex-heavy + opex-light, sticky + high-margin, seasonal-Q4 + seasonal-April. It is the readable face
of §0.2's synergy/antagonism numbers, and it is where "The Line That Eats You" (§9.2) first becomes
visible **if** you built the cost allocation to see it.

### Procedural label text
Detail that generates itself.

**How it works:** Asset tags, rack labels, port labels, cable tags, patch-panel legends and warning
stickers all generate **consistent, readable, in-fiction text.** **At close zoom the world should
reward reading.**

### The diegetic settings menu — per era
Options as a physical object.

**How it works:** The settings are on a clipboard, or a BIOS screen, or a terminal. **Consistency of
fiction, top to bottom.**

**How it looks, per era** (free, because the chrome-skin token set already exists): **1996** — a BIOS
setup screen with a blue background and F-key hints. **2005** — a chunky tabbed control panel. **2016**
— a flat settings drawer. **2025** — a dark telemetry console. **Same options, same order, same
labels**, so nobody ever has to hunt.

### Screenshot watermark
Shareable by default.

**How it works:** Screenshots carry a small tasteful corner card with your company name, tier, uptime
and date.

**Expansion:** it uses the **Player Company Mark at its current fidelity level**, so the watermark
itself shows how far you've come — **a Tier-1 screenshot is watermarked in clip-art and a Tier-5 one in
etched aluminium.** **Free storytelling on every shared image.**

### Modding the skin kit — and the Ruleset Card as a shipped editor
The five-asset structure is a modding surface; go further and ship the editor.

**How it works:** Because a hosting line is **five assets plus a ruleset card**, players can author new
hosting types — **the perfect community content format for this game.** Ship the **Ruleset Card editor
in the base game**: unit definition, goal node, scarce resource, patience analog, threat-mix weights,
and the five skin assets. **Publish the twenty official hosting types as editable cards**, so modders
learn from them and the tooling is proven by the base game itself.

**How the editor looks — a five-slot form mirroring the kit exactly:** **Palette** (two swatches + a
material picker) · **Hero Silhouette** (import, or assemble from a parts library) · **Visitor Costume**
(the five costume slots) · **Signature Meter** (choose a gauge face from the Instrument Design Language
and bind it to a resource) · **Ambient FX + Sound**. Plus the Ruleset Card as a simple form. **A mod is
five assets and one form, previewed live in the Skin Preview Room.**

**Critical dependency:** it needs the **Instrument Design Language** shipped as part of the kit —
without a shared gauge-face system, **community meters will be the single thing that makes modded lines
look wrong.**

**Full mod format (the data bundle):** six ruleset slots (unit, goal node, scarce resource, patience
analog, threat mix, look) + a five-asset skin folder + **a ticket-text pack** + **a wave table**. **A
community member can author a whole hosting business in an afternoon.**

### The tutorial is a job
Onboarding as fiction.

**How it works:** You're hired at a small host; your first tasks are real tasks; your "training" is a
senior engineer telling you to go look at something. **No tutorial UI at all.** (Sharpened in §9.8 as
*The Tutorial Is An Interview*.)

### The Ending camera move
How a run finishes.

**How it works:** Whatever the ending — acquisition, institution, collapse — the camera pulls back
through the building, out of the city, to the world, and the lights of your sites stay on (or don't).
**One shot, earned.**

**Three variants, specified so the ending actually reads:**
- **Acquisition** — the pullback happens and the lights stay on, **but your mark on the building
  cross-fades to the acquirer's.**
- **Institution** — the pullback, lights on, **your mark intact**, and the camera **holds much longer
  than is comfortable.**
- **Collapse** — the pullback happens with the lights **going out in dependency order** beneath it
  (reusing the Fail-Forward Fade), and **the last light is the exit sign.**

**Same shot, three meanings.** (See §9.9 for the endings themselves.)

### Meta-currency: War Stories
Earned from **unusual disasters survived**, not from grinding.

**How it works:** A hurricane plus a nation-state plus ransomware on one level pays out **War Stories**,
spent at the HQ shop on lore-flavoured cosmetics and start bonuses. **It encourages self-imposed
chaos**, which is exactly the behaviour the Chaos Card Draft and the difficulty-confession systems want
to reward. It slots into **the Almanac face** of the Company object.

**Two better payout forms than a number:**
- **War stories reborn as conference talks.** After a level, your best incident **becomes a talk**, which
  is a **permanent talent-attraction buff** rather than a currency. (The Keynote Boss in §9.2 is its
  boss-fight form.)
- **"Postcard from the outage."** After surviving an unusual combination you receive **a diegetic
  postcard** illustrated as a tourist brochure of the event — *"Greetings from Black Hole DDoS!"*
  Collectable art that documents your own history, and a natural Scrapbook-face object.

**Where it is spent:** the **merch table** at the vendor trade show — rack stickers, LED-colour themes,
custom horn sounds, a mascot plush for the break room. **Cosmetics living diegetically inside the
world's economy** rather than in a store screen.

### The "500 — Internal Server Error" Tavern
A neutral between-levels hub where **everyone in the game drinks.**

**How it works:** The error code is the house motto — *"something went wrong on our end."* Your
customers, your attackers and your ex-staff all have a standing tab, and the room is a **dialogue and
social hub where unlocks gossip**: overhear which threat you'll face next, **sell your war stories as
rounds**, hire the reformed attacker, apologise to the churned whale. **Redemption quests begin at a
table.**

**The deepest joke is structural:** *everyone in the game is in the same industry.* The Rack Cat, the
BOFH, the intern, the regulator, the abuse contact from the next host over and the vendor rep are all
regulars — which makes the world feel like a trade, not a battlefield.

**Interacts with:** the Home Base hub (§9.1's roguelite variations), §9.2's Recurring Nemesis and The
Threat You Can Hire, the Alumni Network, §9.14's narrative cast.

---

## 9.5 The educational angle

### ⚔️ Teaching is by event; explaining is on demand
The contradiction this subsection has to resolve first.

**The problem:** the design is committed to *"teach through loss, never through text"* and *"almost no
tutorial pop-ups"* (§9.6) — **and** it ships Field Notes (an encyclopedia), loading-screen tips (real
advice), a glossary, a Postmortem Library and a "was that real?" tag.

**The fix, in one sentence: teaching is always by event; explaining is always on demand.** **The game
never volunteers text.** Field Notes are only ever reached by the player **clicking something they were
already curious about** — the "Explain This Number" affordance is the ideal delivery mechanism.
Loading-screen tips are **flavour, not instruction.** The "was that real?" tag lives **only in the
Codex, never in the world.** One sentence resolves it and **makes both systems better.**

### Field Notes
An in-game encyclopedia written in plain language.

**How it works:** Every concept the game models — the 95th percentile, PUE, RAID levels, BGP, RPKI,
anycast, quorum, error budgets, deferred revenue, the queueing curve — gets a short, genuinely accurate
entry, **unlocked when you encounter it.** **A game that teaches this material by accident is worth more
than one that teaches it on purpose.**

**Two entries this design most needs**, because they are the concepts that most reliably separate
people who understand infrastructure from people who don't:
- **"Averages hide everything."** Percentiles, measurement resolution, and why your graph was flat
  while you were dropping packets.
- **"Redundancy is a property of the whole path, not of the component."** Why two of something is often
  one of something — with the five shared-correlation types (power, path, firmware, human, time).

Both are short, both are genuinely useful outside the game, and **both are already load-bearing
mechanics** — so the Field Note is *documentation of the simulation* rather than an add-on.

**How it looks:** a **ring-bound field guide** in the Doc typeface with hand-drawn diagrams from the
Handmade Layer, **one spread per concept**, unlocked entries tabbed and un-unlocked ones showing only
the tab. The "was that real?" stamp sits in the bottom corner. **It is the one place in the game where
a wall of text is correct**, so it should look like a book worth reading.

**Variations and additions — the codex as curriculum**

- **The slang glossary as a lore codex.** Every threat, customer and buildable gets a codex entry that is
  **also a real-world mini-lesson**, with a joke caption on top. The game teaches genuine hosting and
  security literacy **while pretending to be flavour text**, which is the only delivery route §9.5's
  teaching/explaining split allows.
- **The Internet-history wing.** Each unlocked buildable adds an entry to an **"Internet history"**
  gallery with the real story behind it — the Morris Worm, the first DDoS, the big TLS memory bug. **An
  educational flavour layer that doubles as progression art**, and the natural bridge between Field
  Notes and §9.4's Museum.

### The hosting glossary
Term by term, unlocked as you meet each concept.

**How it works:** The business half of Field Notes, written plainly: **MRC/NRC, TCV/ACV, NRR, DSO, cap
rate, take-or-pay, MFN, ETF, PUE, the 95th percentile, CAC payback, COGS, churn vs logo churn, deferred
revenue.** And the ops half's acronym layer: **every acronym in the game is one click from a
plain-language card written like a coworker explaining it.** **This game is a stealth education product
and should own that.**

### The "was that real?" tag
Authenticity, marked.

**How it works:** Entries and events carry a small tag saying whether the mechanic **reflects real
practice**, is a **simplification**, or is a **liberty taken for fun**. **Enormous trust-builder with
the audience who will care most.**

**Add a fourth value, which is funnier, more honest, and more flattering to the audience than any of
the other three: "real, and worse."** For the many cases where the game had to **soften reality to be
playable** — real restore times, real audit durations, real BGP propagation, real hiring timelines,
real lead times on a cross-connect.

**How it looks:** a small stamp in the corner of a Codex or Field Notes card, in one of four states:
**REAL** (a plain rectangular stamp) · **SIMPLIFIED** (the same stamp with a dashed edge) · **LIBERTY**
(the stamp at a slight angle with a small asterisk) · **REAL, AND WORSE** (the stamp overprinted).
**Never appears in the world, only on documents** — which is the mitigation the tension below asks for,
made concrete.

**Tension:** ⚔️ The game-design lens warns that too much accuracy-flagging breaks immersion. Mitigation:
**it lives in the Codex, never in the world.**

**The business mechanics need this tag most.** The business layer is where players will most often
assume the game is exaggerating, **and most often be wrong.** Tag at minimum: the **95th percentile**,
**rolling reserves**, **demand-charge ratchets**, **MFN clauses**, **consent-to-assignment**, **agent
residuals paid forever**, **ETF buyouts**, **the control-panel repricing**, **"unlimited" fine print**,
**net-60 meaning net-75**, **SLA credits being trivially small**, and the fact that **most "top 10
hosting" lists are affiliate-monetized.** **Every one of those will read as invented and none of them
are** — which is exactly the reaction that makes an educational tag worth shipping, and it is where the
game earns its "I learned something" reviews from the business side just as Field Notes does from the
ops side.

### The Order of Operations card
The single highest-value educational artifact the game could produce — and it is free.

**How it works:** For each incident type, **after** you resolve it, the game shows **the canonical first
five actions a good operator would have taken, compared to yours, in order.** **Not a grade — a
comparison.** It is free because the game already has both timelines: the ideal one and yours.

**Interacts with:** the Postmortem Puzzle, the post-level debrief card, §9.8's Explain This Incident.

### The Unit Conversion drawer
A permanent reference that makes the game's numbers real.

**How it works:** One clickable drawer converting: **nines → minutes**, **Mbps → GB/month**, **amps →
kW → annual dollars**, **TB → rebuild-hours**, **RPO/RTO → business impact**, **latency → conversion-rate
delta**, **rack units → floor area → lease cost**, **PUE → the power bill**. **Every one of these is
something a working operator does in their head and nobody outside the industry can do at all.** Putting
them in one drawer is **how the game teaches its own numeracy.**

### The Real Postmortem Library ("this actually happened")
Turning the game into accidental ops education.

**How it works:** After each incident, the game shows a short real-world card describing **an analogous
public outage** — what happened, what the cause was, what the company changed. Anonymized or attributed
depending on the source. **Would genuinely get used in onboarding**, which is the highest compliment
available to this feature.

**Interacts with:** §9.4's Postmortem Reading Room (the permanent home), §9.1's Historical Scenarios
(the playable version).

### A real post-level debrief card
Turn the score screen into the most educational moment in the game.

**How it works:** MTTR, incidents by class, **the biggest avoidable cost**, and **one sentence of
genuine operational advice** derived from what actually happened in your run. **Turns the score screen
into the most educational moment in the game rather than the most numeric one.**

### Import Your Own Topology
The power-user feature — made concrete enough to be real.

**How it works:** Describe your real (or imagined) infrastructure and the game builds a level from it.
**Every ops team will want to do this to their own stack**, and the results will be shared widely.

**The concrete proposal:** accept **either** a simple declarative file (nodes, links, roles,
capacities) **or** a guided wizard of ten questions. Generate a playable level **with the player's own
node names on the faceplates.** Then run the **"Would You Have Survived" simulator** against it and hand
back a **findings report** — blast radii, single points of failure, correlated redundancy, the five
shared-correlation types. **An ops team will do this to their real production estate on the first day,
and the report they get back is the marketing.**

**Make it a rendering feature as much as an import feature:** the import's output should land first as
a **Blueprint Card and a rack-elevation poster** (§9.10), *then* become a playable level. **People will
share the diagram whether or not they play the level.**

**Tension:** ⚔️ Half game, half tool, and genuinely risky — a "what would break" answer that is wrong
about someone's real production estate is worse than no answer. Mitigation: present it as **findings to
investigate**, never as an audit, and carry the "SIMPLIFIED" stamp on every conclusion.

### Educational mode
A classroom variant.

**How it works:** Slower, more explanatory, with Field Notes surfaced inline and Puzzle Mode as the
core. **A real market for this exists** and it costs little beyond what's already built. Pairs with the
community scenario library, which teams will use for **interview practice** whether or not anyone
intended it (§9.10).

### The community scenario editor
See §9.7 and §9.10.

---

## 9.6 Design guardrails

*Rules to hold the design to, collected from across the lenses — with the wave-2 corrections,
operational definitions, and flagged contradictions folded in.*

### Every tower has a downside — except a small curated set
**No pure upgrades.** Everything you build adds capability *and* surface, cost, or complexity. If a
build has no downside, it isn't finished.

**⚔️ Two corrections, from two directions, and they agree:**
- **The design lens:** the document itself ships roughly five deliberate pure wins **and is right to** —
  so the guardrail needs a **two-clause rewrite** rather than enforcement.
- **The operations lens:** there genuinely *are* a small number of real interventions with no
  meaningful downside, and **pretending otherwise is its own kind of falseness.** The list:
  **network config backup · a label printer · an EPO guard · a blanking panel · MFA on the registrar ·
  an offboarding checklist · a spend cap on the phone bill.**

**Amended guardrail:** *"No tower is free of downside — **except a small, explicitly curated set of
'why didn't I do this years ago' items**, which exist precisely so the player experiences the feeling
of finding one."* **That feeling — discovering a $12 purchase that removes a whole class of disaster —
is one of the genuine joys of the job**, and the unamended guardrail forbids it.

### No optimal build order
The correct build must depend on the level, the hosting type, the threat mix and your money. **If the
community finds one build order, the design has failed.**

**⚔️ Contradiction:** this collides directly with **scar-driven unlocking** — if your available builds
are gated by what has already hurt you, and threats arrive in a designed order, then there *is* a
dominant order and the game taught it to you. **Three fixes, all of which must land or the claim should
be dropped:** an **Anticipation Track** (you can buy ahead of the scar), a **seeded threat order** (the
order varies per run), and the **Second Answer rule** (every threat has at least two viable counters
with different costs).

### Lose slowly — with an operational definition
See §6.10's soft-over-hard rule. **You should always understand why you lost, and have seen it coming.**

**The testable version:** **from the first visible warning to the unavoidable loss there must be at
least three minutes of level time, and the warning must be in the top three promoted clocks for that
whole period.** **If a playtest produces a loss the player didn't see coming for three minutes, that's
a bug** — not a difficulty setting.

### Teach through loss, never through text
See §5.1. **The game should have almost no tutorial pop-ups.**

**Resolved against the educational layer (§9.5): teaching is by event; explaining is on demand.** The
game never volunteers text; Field Notes, the glossary and the "was that real?" tag are all
player-initiated.

### The three-clock rule
**Exactly three timers** promoted at any moment. See §7.9.

### The player must always be able to answer "what is the worst thing that could happen right now"
If the board cannot answer that **in one glance**, add the overlay that can.

### Every number on screen must be explainable
**If a player cannot find out where a figure came from, it should not be displayed.** Enforced by the
"Explain This Number" affordance, which is also the delivery mechanism for Field Notes (§9.5).

### No mechanic may be invisible in both directions
**If the player cannot see a system working *and* cannot see it failing, it is not a mechanic — it is a
random number.** Every subsystem needs at least one of the two.

### Every irreversible action is marked before it is taken, not after
The **one-way-door symbol**, promoted from a UI nicety to a law. Schema migrations, cert revocations,
hardware disposals, drive wipes, deleted data, terminated leases, released IP space. **Players should
learn to fear that icon** — and they can only learn it if it is always there, on every one-way action,
from the first hour.

### Revenue is never just a number
Any mechanic that adds money **must also say what *kind* of money it is** — how long it lasts, what it
costs to serve, who else has a claim on it, and **when it actually arrives in the bank.** If a design
change adds revenue without answering those four questions, **it isn't finished.** (The CEO lens
compressed to four lines, and the thing that keeps the business half from collapsing into a score.)

### Make the boring thing beautiful — with a budget mechanism
The unglamorous correct actions — documentation, drills, patching, dunning, cable management, blanking
panels — must have the **best animations, the best sounds, and the most satisfying feedback in the
game.** **This is the single most important tonal decision available**, because it's what makes the
game *about* something.

**And it needs an enforcement mechanism, or it will lose every budget argument to explosions.** State
it as a **budget line**: the unglamorous-correct actions — restore drill, patch pass, blanking panels,
dunning, cable management, documentation, load-bank test, scrub pass, tabletop exercise — each get **a
named FX in the catalogue, a bespoke sound, and a minimum two-second animation**, and **no threat FX is
approved until its corresponding *prevention* FX is.** **Pairing every monster with its chore, in the
production schedule, is how this rule survives contact with a ship date.**

**The seven to spend the animation budget on first, in order:** **the restore that works** (a progress
bar that completes and a checksum that matches) · **the failover nobody noticed** (traffic shifting with
no graph moving) · **the fleet-sync wave** · **the patch cart turning a wall of amber pips green** ·
**the cable-management pass** · **the generator starting** · **the label printer.** **If those seven
feel better than the explosions, the game is about the right thing.**

### Asset reuse discipline
The Five-Asset Skin Kit and the FX catalogue exist so that variety is cheap. **Any new content that
requires more than five bespoke assets needs to justify itself.**

**Extended:** the discipline applies to the **FX catalogue and the instrument faces** too — **new
content may add one FX and one gauge face; anything more requires cutting something.** **That is what
keeps the readability budget achievable at 30 hosting lines.**

### Accessibility as a feature, not a setting
Colour-blind-first, motion-optional, audio-redundant, keyboard-complete, pause-always. **These also
make the game more readable for everyone** (the Diamond/Circle/Triangle law).

**The strongest version of the principle is to name the modes that are *good to play*, not merely
possible to play:** **Shape-First** (the greyscale/pattern mode, which doubles as Minimalist Mode's
glyph set) · **Readout Mode** (numbers on every diegetic gauge, which min-maxers will prefer) ·
**Reduced Flashing** (which is simply more comfortable for long sessions) · **One-Hand Mode** and
**Sonified Mode** (§9.8). **If the accessibility modes aren't ones a sighted, hearing player would
sometimes choose, they aren't finished.**

### Pause-and-plan is the default pacing
**Actively design for players who want to stop and think.** Real-time pressure comes from
**consequences**, not from actions-per-minute. A complex sim that punishes deliberation is a sim
nobody finishes.

### Peacetime must be valuable
If the player is bored between waves, the design has failed. **Drills, debt, documentation,
forecasting, patching and tuning are the peacetime game.**

### The reward is letting things through
Most tower defense rewards killing. **This game rewards service** — the score is how many visitors you
served, not how many threats you stopped.

**⚔️ Contradiction, and it is the most serious one in the document:** this guardrail is stated as a
pillar and then contradicted by **§6.9's uptime-first scorecard** and by **the sheer mass of the
bestiary** — roughly 200 threats against roughly 45 visitor archetypes. **Two fixes, both required:**
**(1) reweight the scorecard** so it leads with conversion and service, not with uptime; and **(2)
rebalance the content ratio** — for every new threat added, the design should ask **what new *visitor*
or *conversion* mechanic it creates a reason for.** **A design that is 80% about monsters will play as
a game about monsters no matter what the pillars say.**

### The game must let you be good at this job
A tone guardrail worth stating because the document's register is relentlessly about things going
wrong.

**How it works:** **At least one level per chapter must be winnable cleanly and feel like mastery** —
no trick, no ambush, no lesson. The player executes competently and **the game says so.** Without
these, a 25-hour campaign of near-misses produces **fatigue rather than pride**, and the emotional arc
the design promises (panic → process → prevention → boredom) **never reaches its last two stages.**

### Nothing has an immediate result
Builds take time, changes take effect after a delay, business decisions land in 90 days.
**Anticipation is the game.**

### ⚔️ "Ship the real monsters" vs "hosting is flavour for mechanics" — a resolution
The document flags this tension and never resolves it. Proposed **three-step filter**, stated so a
content author can apply it without a judgement call:
1. **Reality is the source list.** Never invent a monster; **the real ones are better.**
2. **Mechanical role coverage is the filter.** A real failure mode that **duplicates an existing role
   on every axis** becomes **Codex flavour attached to an existing threat**, not a new threat.
3. **Playability is the veto.** A real failure with no counterplay, no telegraph and no diagnostic path
   is **a random number generator wearing a costume** — it gets cut, or given counterplay, which is
   usually available, **because real operators do have counterplay for almost everything.**

**Both lenses get what they actually want.**

### Hosting-type authoring tests (belongs with §0.2)
Three tests that catch a bad hosting type **before it is built**.

**How they work:** **The Three-Change Rule** and **The Verb Shift Rule** are both correct and both need
their enforcement clauses (the Invariant Core; a 3–5 change budget per type). Add a third: **the
Rosetta Test** — *can you write the type's Rosetta Card in three lines, mapping its mechanics to ones
the player already knows?* **If you can't, the type is a new game and should be cut. If you can, it's a
variation — and it will feel fresh *and* familiar, which is the target.**

### Line synergy and antagonism, with numbers (belongs with §0.2)
Four related ideas that are currently qualitative and together are the late game.

**Proposed numbers:**
- **Synergy:** a synergistic pair grants **−15% shared infrastructure cost** and **+10% cross-sell
  conversion** between their customer bases. **Peak-hour complementarity is separate and mechanical:**
  your facility is sized to *peak* load, so two lines whose peaks are **8+ hours apart** let you size to
  **~70% of the naive sum** — a large, real, discoverable saving.
- **Antagonism:** a conflicting pair competes for a **named shared resource** (power, staff attention,
  IP reputation, compliance scope), and the conflict is rendered as **a literal allocation slider
  between the two districts.** **Not a penalty — a *fight*, which is much better.**
- **Portfolio Meter:** variance reduction of **1/√n** across lines, offset by an expertise penalty of
  **−8% operational effectiveness per line beyond the second** unless you've hired dedicated staff for
  it. **That is the whole diversification tradeoff in two terms.**
- **"What Are We Even" stat:** **derive it rather than tracking it separately** — it is just the
  expertise penalty made visible, plus a brand-conversion modifier. **One fewer stat, same idea.**

### Pause systems — *CONFLICTING*
The design has accumulated **three or four different answers to "can the player stop time"** — full pause
as an accessibility floor, an OBSERVE mode, slow-mo, and boss encounters that auto-slow — and they cannot
all be the rule at once. The dispute is whether **stopping time is free.**

#### Position A — pause is a floor, and it is free *(master)*

**"Pause-and-plan is the default pacing"** (above) and **"Full pause, always"** (§9.8's baseline
accessibility commitments) state it as a **commitment, not a dial**: real-time pressure comes from
**consequences**, not from actions-per-minute, and *"a complex sim that punishes deliberation is a sim
nobody finishes."* Under this position, pause is never priced, because pricing it re-introduces exactly
the APM tax the guardrail exists to forbid, and it removes an accessibility guarantee for players who
cannot hold six systems in their head at once.

#### Position B — a Composure budget, one economy for attention *(opencode)*

Live building with no pause, OBSERVE mode, slow-mo and boss auto-slow are **three pause systems in
tension**; unify them into **one readable economy for attention itself.** Every level grants a pool of
**slow-mo / observe seconds** that **regenerates in breathers**; a **full freeze costs SLA-seconds**; and
**boss auto-slow dips the same pool.** Hardcore "Production" mode (§9.1) is the extreme end of the same
idea — one life, no pause beyond a 5-second grace.

**What the decision turns on:** whether attention is a *resource* (Position B: interesting, unifying, and
it makes the three-clock rule bite) or a *right* (Position A: an accessibility commitment that must not
be negotiated away). A possible reconciliation, stated but not adopted: **price the slow-mo, never the
freeze** — Composure governs OBSERVE and boss auto-slow, while full pause stays free and untimed, so the
economy exists without costing anyone the floor.

### The Difficulty-Budget Rule
Many knobs, no shared budget — which is how modular difficulty systems ship 400% levels.

**How it works:** The design lists **wave richness, patience, capital, entropy and SLA** as independent
difficulty knobs with nothing keeping them honest against each other. **Define ONE axis of "difficulty
budget" spent across the knobs per level, publish the budget per tier, and make every knob's cost visible
on the pre-run screen.**

**Why:** without it, two individually-reasonable modifiers multiply into an unplayable level that nobody
authored on purpose, and the tuning conversation has no unit. With it, "harder" becomes a **spend
decision** the designer and the player can both read — and it is the enforcement mechanism the SLA-vs-
stars contradiction (§9.15) needs in order to resolve.

**Interacts with:** §9.1's mode tiering, §9.2's honestly-named difficulties, §9.15's entropy-vs-wave-knob
contradiction.

---

## 9.7 Long-tail and stretch ideas

### Level editor and workshop
Author scenarios, share them.

**How it works:** Define the topology, the threat waves, the customers, the money, the constraints, and
the hosting type. **Given the ruleset-card structure, a scenario is a small data file** — which makes
this unusually cheap for what it returns. Paired with the Skin Kit Editor (§9.4), a community member
can author **a whole hosting business plus the level it lives in.**

**Variations and additions**

- **Vendor/Rule Workshop.** Threats, buildables and customers **as data cards**, plus a scenario-pack
  workshop for community specials (*"what if HFT got nation-stated"*). The deep version lets players
  **write real WAF/IPS signatures in-game** with a sharing workshop, and **downloaded community rules
  appear as in-game "marketplace of knowledge" NPCs.** A genuine learning vehicle, and it makes the
  threat-codex entries into **a shared language between players.**
- **The moddable scenario kit.** A level **is** `(scale, hosting type, goal, constraints)` as data. Ship
  the editor plus a curated **"real incidents pack"** — simulated named events, hurricanes,
  outages-as-levels — and the content roadmap writes itself.
- **The Community Scenario Maker.** Pick scale, type and modifiers, then share; **the daily-challenge
  pipeline feeds off community seeds.** Hosting jokes are infinite — let them in.

### Spectator, replay and the Timeline Scrubber
Watch a run back.

**How it works:** Full replay with a scrubbable timeline, overlay switching, and commentary markers.
After a level you can **scrub through the whole run and watch your own incidents play back in
fast-forward with annotations.** **Perfect for teaching, for postmortems, and for streaming**, and it
doubles as a **shareable clip generator.**

**How it looks — the Replay Overlay, a viewing language distinct from play:** a **letterboxed** frame
(so you always know it's a replay), the Timeline Ribbon promoted to a **full-width scrubber with
incident markers**, an overlay switcher that **persists while scrubbing**, a speed control that goes to
**16×**, and **causality mode**: hold a key and **every event on the timeline draws a thin Intent-layer
line to the decision that caused it.** The correlated-failure white line, applied to an entire run.

**Variations and additions**

- **Spectator / Tournament Mode.** Netcasts of high-level games in which **viewers see the codex of
  incoming threats** while the player does not — **streamer-friendly asymmetry**: the player sees fog,
  the viewer sees the storm.
- **The Incident VCR.** The after-action replay rendered as **a CCTV scrub**: click any timestamp and the
  screen becomes a security-camera feed of that moment, so you can **slow-mo a breach to understand
  it.** A study tool, a screenshot tool, and **the most diegetic UI in the game.**

### The Stream Overlay
Cheap, and this game **will** be streamed.

**How it looks:** a toggle that **reserves a clean corner**, promotes the three-clock cluster and the
money column to **double size**, hides the build palette when idle, and draws every alert twice as
large. Plus a **spectator ticker** that narrates in plain language what the player just did, and a
**spectator camera that auto-pounces on incidents.** **Readability for someone watching at 720p on a
phone is a different design problem and it takes ten minutes to solve.**

**Variations and additions**

- **Streaming Integration.** Twitch viewers **spawn as customers** — chat commands register signups, hype
  triggers launch spikes. The hosting company as **a literally audience-hosted service**, and the one
  multiplayer feature that needs no matchmaking.

### Seasonal live events
Shared world events on a calendar.

**How it works:** A month-long "Black Friday" event; a "Patch Tuesday" weekend; a global vulnerability
that everyone responds to at once; a hardware-recall week. **Community cohesion without multiplayer.**

**Variations and additions**

- **Seasonal event packs from real life.** Community events modelled on industry disasters with fictional
  skins: **"the capacitor plague," "the big cert expiry," "the route leak."** The in-game news ticker
  announces them, and **veterans remember and prep** — which is the whole point.
- **Season Pass / Weekly Ops Events.** Seeded challenge scenarios — *"Wednesday: launch day on a 30%
  power budget, nation-state interest"* — with a global leaderboard and an end-of-season **"incident
  retrospective"** highlight reel. Live-service framing that is perfectly on theme, because **hosting
  never sleeps.**
- **The seasonal event calendar.** **Spam-lanche** (March) · **Black Friday** (November) · the
  **New-Year Traffic Hangover** · **"Solar Flare Week"** · weekly **cursed-configs** with leaderboards.
- **"Blackhat"/"Conf" season events.** A zero-day drops mid-level as a global event, or **the whole map's
  attackers level up after a big disclosure week.**
- **Real CVE Feed Mode (optional mod).** A toggle that pulls **real-world advisories from a public feed**
  and injects *"a vulnerability in X"* into your next waves — **a level whose threat list is today's
  news.** The educational nuclear option: obviously opt-in, obviously a community goldmine, and it must
  carry §9.5's SIMPLIFIED stamp on every conclusion it implies.

### Company culture as a stat
The soft thing, made mechanical.

**How it works:** Culture affects hiring, retention, incident behaviour, and **whether people tell you
bad news early.** **Blameless postmortems, sustainable on-call and documentation all feed it** — and a
company where people hide problems fails in a distinctive, awful way: your incidents get later, your
MTTR gets worse for no visible reason, and your first warning of anything is a customer.

**Interacts with:** the Company Handbook (§9.2), "Everything Is Someone's Fault" (§9.2), the Alumni
Network (§9.4).

**Variations and additions — the staff-morale thesis**

- **The On-Call Vending Machine.** A coffee machine, flex schedules and post-incident days off:
  **morale reduces MTTR and quit risk.** The humane sysadmin's argument, made mechanical.
- **The Therapy Room (the post-incident morale loop).** After a catastrophic loss the HQ gains **a circle
  of chairs** — a debrief minigame where **blameless answers restore team-wide morale and speed
  learning-unlocks**, while **blameful answers scapegoat one staffer who then quietly updates their
  résumé.** *The insider-threat pipeline created by your management style rather than by a random roll.*
  The rubber duck cameos as office décor.
- **The Engineering-Culture Dial.** Global choices — **cut corners for speed vs over-engineer for
  safety** — bias every level's spawn table toward **bad-deploys vs zero-days.** A personality system
  that makes the same level play differently per save file.
- **The flavour-only variant**, for those who don't want it touching balance: a lightweight **"company
  culture" slider set once at campaign start** (move fast vs move careful, in-house vs outsourced) that
  subtly reskins flavour text and default staff behaviour throughout. **Identity without touching core
  balance.**

### Real uptime leaderboard
A long-horizon competition.

**How it works:** Longest continuous simulated uptime across a persistent save. **The streak is the
score**, and losing it hurts in a way no number does. **Render a run as its Uptime Ribbon rather than
as a number** — comparing two ribbons side by side is instantly legible and a number is not.

**Variations and additions**

- **The Uptime Badge as a public page.** A persistent **public status page with uptime history**, where
  **friends visiting your page show up as traffic on your menu screen.** Meta-progression as ambient
  flavour.
- **The status page as a multiplayer handshake.** Visiting a friend's page shows their **real-time uptime
  widget**; subscribing puts you **on their subscriber list**; and **a cascade of friends all down at
  once** renders shared-fate weather **visible in the menu.** A social layer that teaches correlation
  without a single line of netcode beyond a blob store.
- **The leaderboard stats players will actually flex:** best NRR · lowest CAC · longest SLA streak ·
  richest whale ratio · **highest overcommit with zero tickets (the villain stat)** · fastest MTTR.
  **Business metrics as competitive sport.**

### The screensaver / idle view — "The Aquarium"
The game as ambience, treated as a feature rather than an afterthought.

**How it works:** A slow camera drifting through your datacenter, lights blinking, hum playing, numbers
ticking. **Half the audience for this game would leave it running on a second monitor**, and that is a
feature worth shipping.

**How it looks:** a slow randomized **Orbit/Drop camera cycle** through your own built facility with
the HUD hidden, the hum playing, **LEDs blinking on the global heartbeat**, staff sprites doing idles,
the cat walking through occasionally, and the **Days Since Last Outage** board visible. **Optional
real-clock mode** so the lighting matches your actual time of day.

**And one addition that makes it earn its keep twice:** it should be **reachable from the main menu
without loading a save**, running a **generated** facility — so it works as a trade-show demo loop and
as a **storefront video** at zero extra cost.

**Variations and additions**

- **The Ambient Screen.** The minimum-viable version, shipped as a window mode: **the current diorama
  just runs as a cosy NOC screensaver** with soft LEDs and slow traffic. *The diorama charm is the
  product* — which is the argument for funding it rather than treating it as an afterthought.

### The Whiteboard Mode
Draw on the world with a marker.

**How it works:** Arrows, circles, and **"WHY IS THIS HERE?"** Your annotations **persist**, appear in
screenshots, and are visible to co-op partners. It is the lightweight half of the Documentation
mechanic (§9.2) and the natural coordination tool in Co-op NOC.

### Mobile companion / status page
A second-screen conceit.

**How it works:** A phone-shaped view of your company's status page and alerts. Possibly literal, as an
actual companion app; possibly just a diegetic in-game device. **The on-call fantasy completed.** The
opt-in extreme is the **Pager Simulator** (§9.1) — real notifications during an in-game incident.

### Franchise and multi-company play
The far horizon.

**How it works:** Run a group of companies, or license your platform to others, or **become the upstream
for NPC hosts who then have their own outages that become yours.** Tier 7, if it ever exists.

**Note:** named as a stretch goal in §9.1's mode tiering, deliberately, **so it stops competing for
design attention.**

---

## 9.8 Onboarding, difficulty and assistance

*New in wave 2: a complex sim needs a stated pacing and assistance design, and several of the best
accessibility ideas here are good enough that everyone will use them.*

### The Tutorial Is An Interview
Sharpen "the tutorial is a job" (§9.4) into something shorter and more characterful.

**How it works:** The tutorial is a **working interview.** A small host has a problem; you are given ten
minutes and a terminal; **you are watched.** Whatever you do **is** your tutorial — and **how** you do
it seeds your first Doctrine card and your opening Codex entries: a player who **reads the logs** starts
with a **Sense** bias; one who **buys hardware** starts with a **Scale** bias. **No skip button needed
— it's short, and it's already the game.**

**Variations and additions**

- **The in-game status page *is* the tutorial.** The very first level **is your status page**: every
  green bar you add is a concept learned, and **in the final level you watch your own status page hold
  under load.** The same arc, bookended.
- **Add the incident-comment thread.** The tutorial's bars get **commented on by ambient customers** —
  *"my site's fine lol," "second day down, moving hosts in 5"* — a living wall of micro-narrative that
  **turns your UI into a neighbourhood** and foreshadows the churn and poaching systems before they are
  mechanics.

### Systems arrive one per level for the first act
Pacing, stated as a rule.

**How it works:** **One new system per level** through act one, and **each new level's tutorial is a
live problem, not a text box.** *"Your DB is melting"* teaches caching better than a tooltip ever will.

### Assistant modes — three dials on three different axes
Rather than one "hard" slider.

**How it works:**
- **Advisor** — suggests actions, explains its reasoning, never acts.
- **Autopilot on selected subsystems** — the game runs your backups, your patching, your dunning for a
  **small efficiency loss.** Thematically perfect: delegation is the real skill.
- **Simplified Economy** — for players who want the defense game **without the spreadsheet.**

**Three dials on three different axes** means a player can be an expert operator and a novice CFO, or
the reverse, **which is exactly how real people arrive at this subject.**

**Variations and additions**

- **A "difficulty confession" option.** Struggling players can **ease difficulty mid-level with an
  in-fiction justification** — a story beat rather than a bare menu toggle: *"you finally call in the
  consultant you kept refusing to hire."* It keeps accessibility **inside the comedy**, which is the only
  way a proud audience will actually use it.

### "Explain This Incident" — an accessibility feature that is also a design test
A button, available any time.

**How it works:** It generates a **plain-language causal chain** of the current or last incident **from
the actual simulation state**: *"The cache node restarted at 04:12. The database, which is sized for a
warm cache, went to 100% utilisation in 40 seconds. Web workers queued. The load balancer's health
checks timed out and removed all four web nodes. Nobody was served for 90 seconds."*

**Why — two reasons, and the second is the important one.** **(1)** It is a genuine accessibility
feature for players who can't hold six systems in their head at once. **(2)** **If the engine cannot
generate that sentence, the simulation isn't coherent.** **It is a design test disguised as a
feature** — and it should be built early for exactly that reason.

**Interacts with:** §9.5's Order of Operations card, the Rubber Duck, Sysadmin Mode (which removes it).

### Readout Mode
Numbers on every diegetic gauge.

**How it works:** Every gauge, meter, dial, light and posture in the game gains a **small numeric or
text readout beside it.** The amp clamp gets `23.4A / 24A`. The fatigue posture gets `68%`. The mood
halo gets a word. The hum bar gets a dB figure. **It makes the game playable for anyone who can't read
analogue at a glance, and it makes it better for min-maxers** — which is the usual outcome when
accessibility is treated as design rather than compliance.

### Accessibility Replay
Every incident replayable at 0.25× with everything on.

**How it works:** All overlays visible, a **narrated caption track**, and the causality lines drawn.
**Both an accessibility feature and the best tutorial format available** — and it costs nothing beyond
the replay system that already exists.

### One-Hand Mode
Accessibility as a mode that is *also fast*.

**How it works:** The entire game playable from a **radial menu and four keys.** It turns out to be a
**fast** way to play, **and speedrunners will adopt it** — which is the proof that it's finished.

### Sonified Mode
Full audio telemetry.

**How it works:** Screen-reader-compatible board navigation plus complete audio telemetry — every
critical visual cue duplicated in sound, pitch-mapped to load, panned to location. **It is also the
best "play it on a second monitor while doing something else" mode**, which means sighted players will
use it too.

### The baseline accessibility commitments
The floor, stated so it isn't negotiated away later.

**How it works:** **Colour-blind-safe status palettes where every state also has a distinct *shape***
(triangle = warning, X = failed, ring = degraded, diamond = critical). **Full pause, always.**
**Click-to-link as a first-class alternative to dragging** — no mechanic may require a drag.
**Scalable UI.** **Audio cues that duplicate every critical visual cue**, and captions that carry
**direction and distance** where the sound is positional (the Beeping Server, §9.2). **Reduced
flashing.** **Keyboard-complete.**

**Variations and additions — accessibility as a design pillar**

- **Shape-grammar guarantees make colour-independence structural, not patched.** The colour language is
  **icon-backed from day one** — circles are customers, triangles are attacks, squares are services — and
  **every audio cue has a visual twin.** There is then no tension between readability and theme.
- **The high-contrast schematic-only mode** ships as a real mode (the Living-Blueprint render), and
  **reduced-motion swaps particle effects for LED-colour and icon states.**
- **Screen-reader narration comes free from the fiction**, because every incident line is **already
  diegetic text** — tickets, the pager stack, the status page.
- **"NoJank" toggle** — removes all customer-patience time pressure, for pure builder play.
- **"Quiet mode"** — strips horror VFX, slows pulses and desaturates reds (migraine-safe) **while keeping
  every state readable via shape and pattern codes.** *A toggle, not a compromise* — and proof that the
  core visual language is strong.
- **CRT / Bezel Modes.** A global **era filter**: the whole game can render through curved glass,
  scanlines, or a phone screen. Cosmetic, atmospheric, **and an accessibility-friendly framing device.**
- **Dark mode is mandatory, not optional.** Datacenters are dark; the NOC wall glows.

### The Cursor
Unspecified in wave 1 and used constantly.

**How it looks:** **Not an arrow.** A small **crosshair-and-caret** in white (the player-intent hue),
which changes tool-state by **adding a glyph** rather than changing shape: a **cable end** when wiring,
a **wrench** when assigning a hand, a **magnifier** when inspecting, a **flashlight cone** during a
black start. **One base, many badges**, so the cursor never gets lost on a busy board.

### Operational philosophy as a faction choice
Pick an identity at start, not a difficulty.

**How it works:** **"Cowboy"** — fast, risky, big spikes, disasters — versus **"ITIL"** — slow, boring,
resilient, lower revenue. Two genuinely different playstyles out of one simulation, expressed as **who
you are** rather than as how hard the game is. It biases staff default behaviour, the spawn mix and the
scoring weights, and it pairs with the Engineering-Culture Dial (§9.7) as its coarse, one-click form.

**Why it belongs in this section:** it is the **difficulty selector that doesn't feel like one** —
the same trick as the Board Meeting's self-chosen rubric (§9.2) and the difficulty confession above.

**Interacts with:** §9.1's business modes (where it appears as a preset), §9.7's culture stat,
§9.2's honestly-named difficulties.

---

## 9.9 Endings and the shape of a finish

*New in wave 2: the document has an Exit, a collapse and an acquisition, and wave 2 proposed five more
endings — most of which are better than the three it had.*

### The Acquisition Endgame
A suitor appears.

**How it works:** Selling ends the campaign with a score and a good epilogue. **Refusing continues the
game with a now-funded competitor** — because the money the suitor had did not evaporate, it went
somewhere. Both branches are real endings; neither is the "correct" one.

**Interacts with:** §9.2's "acquisition offer you should refuse", §6.9's diligence report, §9.4's
Ending camera move (Acquisition variant).

### The Exit Interview (yours)
An ending the design didn't have: **you leave.**

**How it works:** You hire a successor, hand over, and go. **The ending sequence is the handover
document you wrote, read back** — then a slow epilogue showing what happened to the company for **five
years afterward**, based on the state you left it in: the documentation, the bus factor, the debt, the
culture, the runbooks, the on-call rotation. **The only ending in the genre where your score is what the
thing does without you.**

**Variations and additions — feedback as content**

- **The churned-customer voicemail.** Departing customers occasionally leave a **voicemail-shaped popup
  quoting a demand bubble you ignored** — feedback as content, and **the exact hint the player needed**,
  delivered by the person who left because of it.
- **The Exit Interview Museum.** A scrapbook of **every churned whale with their reason** — replayable
  lore that doubles as strategy feedback, and the natural contents of the Wall of Ghosts (§9.4).
- **The endgame retrospective letter.** When you sell or shut down, a generated retrospective **reads
  your telemetry back at you**: the churn decisions that mattered, the pricing regrets, **the one
  customer you shouldn't have kept.** The game ends by *explaining the business you built* — a
  satisfying "how'd I do" letter rather than a score.

### The Quiet Handoff
The same idea, rendered as one shot.

**How it works:** You hand the company to your team and leave. The final screen is **your infrastructure
running fine without you**, with a **`Days Since Last Outage` counter that keeps going up after the
credits start.** **The best ending available for a game with this thesis.**

**Interacts with:** §9.1's Succession level (the playable 90-days-without-you version), §9.4's uptime
streak.

### Becoming the Thing
The ending that turns the campaign's antagonist into you.

**How it works:** The roll-up conglomerate buys you, and the epilogue offers a **postscript level where
you operate *as* them** — cutting costs at a company you just bought, with its own staff, customers and
history, all of which the game shows you in the same detail it once showed you yours. **Ten minutes, no
combat, quietly devastating.** **The most interesting thing a game about business could do with an
acquisition ending.**

### Two Companies, One You
A late-game structural twist that is also an ending.

**How it works:** After an Exit, an option to start a **second** company while the first **continues to
exist in the world as an NPC** — run by your successor, using your architecture, making your mistakes,
and occasionally competing with you or partnering with you. **Your own past self as a persistent
character in the world**, which is a stronger version of §9.2's "Your Past Self Is The Boss" and a
direct payoff of §9.4's Long Save.

### Failure is Narrated, Not Punished
Losing a company should read as a chapter, not a game over.

**How it works:** Losing produces an **obituary page** with the **real cause** — derived from the
simulation, not authored — and the next run starts with **one carried-over lesson** (a small permanent
unlock). **The industry is full of second and third companies by the same founder; the game should be
too.** Pairs with the Competitor Obituary Feed (§9.3), which is the same page written about someone
else.

**Guardrail interaction:** this must not violate §9.3's rule that **the game is never funny at the
moment of loss** — the obituary is dry and accurate, never a punchline.

**Variations and additions**

- **The "You Get Fired" failure animation.** Bankruptcy doesn't cut to a menu: **your badge deactivates,
  a security escort walks you out, and the new guy's terrible setup loads as the next level's start
  state.** The obituary made physical — and it hands the next run a board with a story already in it.
- **Guardrail check:** per §9.3's clause three, the escort walk must be **dry, not a punchline.** The
  joke is the *situation*; the moment of loss is played straight.

### The end credits roll down a cable tray
Because of course they do.

### The Acqui-Hire End
You can **lose the company and win the game.**

**How it works:** Sell to the whale-competitor for **the team plus earnouts.** The company does not
survive; the people do. The exit screen reads:

> **Personal Outcome: Excellent. Customer Outcome: We'll be in touch.**

**Why it belongs:** it is the only ending that separates **your** outcome from **your customers'**
outcome, and stating the two on the same card — in that order — is the sharpest thing the business layer
can say about the industry it is modelling.

**Interacts with:** The Acquisition Endgame, Becoming the Thing, §9.4's Alumni Network (the team you sold
lands somewhere and remembers), §9.14's SLA Villain Arc.

---

## 9.10 Community, cosmetics and exportable artifacts

*New in wave 2: a large cluster of ideas whose common thread is that the player takes something out of
the game — a picture, a document, a scenario, a postmortem — and shows it to someone.*

### Photo Mode / Rack Portrait Studio
In a game about building a beautiful thing, letting players photograph it is **most of the meta-game
for free.**

**How it works:** Full framing controls, time-of-day, hide-HUD, lens options, depth of field, a
**title-card generator**, and export. Unlocked by default in Sandbox. The company-mark watermark (§9.4)
rides along on every shot.

**Variations and additions**

- **"Datacenter Pinup."** Free camera, **era-correct magazine-logo overlays**, and **auto-captions from
  fake trade-press headlines generated from your stats** — *"Katherine's Rack of Glory Hits 60°C on
  Launch Day."* A community gallery as marketing.
- **Photo Mode "Ops Poster."** Framing plus a poster filter plus the mission typeface exports **a
  shareable gig poster** of your current build.
- **Squint-score and composition guide.** An optional framing grid and a computed **"3-squint" verdict**
  — *money visible? trouble visible? failure visible?* — printed like **a critic's review card** on
  export.
- **The NOC tour.** Walk your finished datacenter **as your own avatar** while the AI voice of a visiting
  customer asks questions **your actual builds must answer** (the uptime wall, the blinking racks, the
  cable porn). The ending screen every player wants.
- **Diegetic props only.** A built-in photographer's toolkit that uses **nothing but in-world objects**:
  hold a tiny printed sign reading **"SLA 99.999"**, place a coffee cup, open a rack door. A community
  content engine with a consistent art frame.

### Blueprint Export
Any facility exports as a **cyanotype schematic** plus a rack elevation set.

**How it works:** Suitable for a desktop wallpaper. Also, genuinely, **the thing players will post.**

### The Rack Elevation Poster
The upgraded version, and a real word-of-mouth feature for this audience.

**How it looks:** a **print-ready rack elevation** — front and rear views, a **title block** with your
company mark and date, a legend, dimension lines, and a **bill of materials down the side**, all in the
Ink Blue blueprint register. **A diagram export upgraded from a screenshot into an artifact.**

### The "Everything Is Green" screenshot
A shareable end-of-level image of a fully healthy estate.

**How it works:** One button, one clean frame, every pip green. **Sysadmins will absolutely post these**
— it is the single image this audience most wants to be true.

### The Logo Generator
Procedural company logo builder: mark + wordmark + colour.

**How it works:** One system, **dozens of placements** — your building sign, your letterhead, your
invoices, your staff badges, your gear asset tags, the lobby wall, the screenshot watermark, the annual
report cover, the conference booth. **Enormous ownership return for one tool.** It also has **fidelity
tiers** that track your company's growth (clip-art → vinyl → etched aluminium), which is free
storytelling on every shared image.

### The Customer Logo Generator
The same system, applied to auto-generated customers.

**How it works:** Your contract cards and your logo wall fill with **plausible fake companies with
plausible fake logos**, era-appropriate to the level. **Instant world texture**, and it makes the Wall
of Ghosts (§9.4) hit much harder.

### Sticker Pack Cosmetics
Unlockable stickers you place on your own gear, **plus custom Dymo labels you can type.**

**How it works:** **Player-authored labels are the single cheapest source of joy available** and they
show up in every screenshot. The "DO NOT UNPLUG" post-it (§9.3) is the mechanically-live member of this
family.

**Variations and additions**

- **Name Every Chassis.** Any device takes a custom name printed as **a tiny LOD-aware decal**, so the
  fleet becomes personal — *"Katherine" is a rack you will now defend irrationally well.* Plus a
  **rack-slot stamp for your own in-game-designed company logo**, so your fleet wears your brand.
  **Emotional investment at near-zero development cost.**
- **The Sticker System proper.** Cosmetic-only physical stickers placed on chassis — overdriven vendor
  logos, **"no u"**, **DO NOT REMOVE** — shareable as screenshots.

### Cosmetic Economy (non-pay)
All earned, all visible, all screenshot-relevant.

**How it works:** Rack faceplate styles, LED colours (**including the tasteless all-blue 2004 pack**),
cable colour schemes, floor tile patterns, company logo kit, sign fonts, NOC wallpaper, desk clutter.
**No purchases** — everything is unlocked by play, and most of it is unlocked by doing something
unglamorous and correct.

**Variations and additions — skins and the trophy wall**

- **Status skins and "merch."** Buyable-with-play rack skins, LED colour packs, and **"certified" trophy
  racks**: your node gets **a framed SOC-2 on it, visible to whales** — cosmetic *and* mechanical.
- **Seasonal threat skins (harmless).** December botnet drones get snowflakes; Halloween ransomware frost
  gets jack-o-lanterns. **A calendar of the internet's moods**, cosmetic only, and it keeps the visual
  language legible.
- **Easter-egg era skins.** **"Y2K panic"** UI (tinsel, WordArt) · **"Web2.0 badge"** UI (glossy orbs,
  beta ribbons) · **"crypto-bro"** UI (green candles everywhere) — each a **visual-era costume earned by
  playing the matching chapter.**
- **Achievement Badges as a Certification Frame Wall.** The achievement system rendered as **in-world
  framed certificates** — collectible art cards with era-correct graphic design, and a genuinely
  desirable screenshot object.

### The Seasonal Decoration Pack
Tinsel on the racks in December.

**How it works:** Which **very slightly increases fire risk.** Perfect.

### Rack Cards (collectibles)
A hardware nostalgia engine.

**How it works:** Every piece of hardware you've ever run gets a **trading card** with a gorgeous
illustration, its spec, its era, **and your personal stats with it**: *"42 units deployed, 3,110 days of
service, 6 failures."* Generated from the Hardware Afterlife data (§9.2) that the sim already tracks.

### The Hall of Fame Drive
The single drive in your company with the longest uptime.

**How it works:** It gets a **little crown and a plaque.** When it finally dies, there is **a short,
genuinely sad animation.** Same treatment for the Legacy Server With a Name (§9.3) when you finally
retire it.

### The Postmortem Club
Asynchronous social, **zero multiplayer code.**

**How it works:** After any incident you may **publish your postmortem** — the timeline, the graphs, the
root cause you named, and a one-paragraph write-up. Other players read them and vote **"would have
caught it / wouldn't have"**; the best ones surface. Your published postmortems accrue **industry
reputation** that feeds your hiring pool and your enterprise conversion **in your own single-player
campaign.**

**Why:** it is exactly what this industry actually does, it turns the game's most distinctive screen
into social content, **and it needs no netcode beyond a blob store.**

**Variations and additions — the postmortem as artifact and engine**

**One ruling first, because this family sprawls:** the **Failure Museum *is* the Incident Documentary
*is* the post-mortem replay.** One hall, three verbs — **view, watch, replay.** Everything below is a
rendering of the same data.

- **The Incident Documentary (auto-replay).** After each level, **a 30-second highlight reel of your
  biggest failure and your biggest save**, with dramatic narration: *"At 02:14, the backup **wasn't**."*
  A shareable artifact and **the best teaching tool in the game.**
  - **Auto-director lower-thirds** — the replay renders like sports coverage, with **a chyron per
    highlight** in the act's typeface, and **the "director" picks shots by attention-priority ladder** so
    replays are automatically well-framed.
  - **Failure-Museum buffs made spatial** — the wax diorama **emits its buff as a visible halo over the
    current-level object it protects**: glance at the ransomware diorama and see the anti-ransomware
    shimmer on your real vault. **Memory palace as UI.**
- **The end-of-level customer reviews screen.** Generated reviews reacting to how the level actually
  went — **the same events filtered through public opinion**, one last time, in the voices you never hear
  during play.
- **The weekly "Incident Report" epilogue.** A generated post-mortem **in real SRE format** — 5 whys, a
  timeline, and **action items the player can literally click into next-run upgrades.**
- **Incident-Log Story Mode.** The sim's timeline rendered as **a narrated outage story** — the
  postmortem as campfire tale — with achievements named after your worst moments: *"The Great Padlock
  Cascade of Rack 7."*
- **The Postmortem Generator / PDF / PNG.** A mock **public** postmortem from your incident history with
  real timeline data, stylised like a hosting blog (blameless tone optional), **one-click shareable.**
  Also as a PNG **"incident report"**: what got in, what bounced, the kill-path replay. Screenshot bait,
  **and a game about hosting that markets itself through hosting culture's favourite genre.**
- **The "War Story" generator.** The same export rendered as **a short illustrated blog post** about your
  weirdest incident, auto-picked from the log — *"the day the intern plugged the firewall into itself."*
- **Postmortem Haiku Mode.** Auto-generated haiku postmortems for small events and **a proper blameless
  doc for big ones.** Copy-pasteable.
- **"Status Page Mode" end-of-level art.** Results render as **a beautiful public status-page incident
  report with a timeline.** Players will screenshot these — **make the typography chef's kiss.**
- **Blameless Postmortem (puzzle mode).** Given a dead system and its logs, **reconstruct the story in
  reverse.** The forensic mode, and the natural Puzzle Mode (§9.1) content generator.

### The Failure Hall of Fame
Community content generated from failure rather than from authoring.

**How it works:** Opt-in upload of **your worst incident as a playable Incident Mode scenario.** Others
play your disaster and try to do better. **Costs almost nothing once replay exists**, and it fits this
game perfectly — the community's best content will be its worst nights.

**Variations and additions — the memorials (the anti-brag board)**

- **Tombstone Meta: "Greatest Hits of Outages."** The global leaderboard of **player-caused disasters** —
  costliest single outage, most customers churned in a wave, longest ransomware hold — each getting **a
  little gravestone on a memorial lawn.** Optional, blackly comic, **aspirationally avoidable.**
- **The Server Graveyard.** A persistent meta-screen of **everything you ever killed or retired**,
  rendered as a field of tiny tombstones **with real epitaphs**; late-game **it becomes a park you can
  stroll.**

### Scenario sharing (and the interview-practice side effect)
Let players build incident scenarios and share them.

**How it works:** The community would produce **an enormous library of "diagnose this" puzzles** — and
**companies would literally use them for interview practice**, whether or not anyone intended that.
Worth designing the export format as if that will happen, because it will.

### Real Runbook Export
Take something out of the game.

**How it works:** Export your **Policy Book, escalation matrix, incident timeline template and
architecture diagram** as actual, usable Markdown/PDF. It costs nothing, it is a **genuinely useful
artifact**, and it is **the most effective possible marketing for a game like this** — an ops team that
puts a game-generated diagram in their real wiki has advertised it forever.

### The Ledger Export (your P&L)
The business-side twin.

**How it works:** At the end of a run, produce **a real, formatted, one-page income statement and
balance sheet** — plus a cohort table — for the company you ran. **A niche feature that this audience
will adore and post screenshots of**, and genuinely instructive: most players have never seen their own
decisions arranged as accounting.

### The Ops Diary Comic and The Postmortem Blog
See §9.3 — both are comedy features **and** exportable artifacts, generated entirely from data the game
already has.

---

## 9.11 Production guardrails and responsible depiction

*New in wave 2: three production realities that will shape the content long before anyone plays it.*

### Responsible Depiction Note
A production guardrail for the grey lines.

**How it works:** The bulletproof, privacy and abuse material is **some of the most interesting content
in the design and the easiest to get wrong.** Proposed rule: **the game may depict the business, never
the technique.** Abuse is abstracted to **tickets, complaints, chargebacks, upstream pressure and
consequences**; it never teaches anything operational about committing it. And the **bulletproof line's
arc should end somewhere** — deplatformed, or an exit ramp to legitimacy — **rather than being a
stable, rewarded strategy.**

**Tension:** ⚔️ This pulls against §9.2's Ethics Track, which insists on *"no morality meter, just
consequences — let the player find out."* Both are correct and they are compatible: **the resolution is
consequence, not prohibition.** Grey revenue stays available and profitable; what it must not be is
**indefinitely stable**, and what the game must never render is **the how.**

**Hosting types:** bulletproof obviously, but also anything adjacent — email (spam), object storage
(piracy/CSAM reporting obligations abstracted to takedown volume), VPS (abuse-heavy resellers), and
regulated (the temptation to fake evidence).

### Localisation and ticket packs
A text-heavy game's production reality.

**How it works:** The procedural ticket generator, the trade press, staff chatter, the status-page
euphemism ladder, the achievement names and the Intern's Log are **all culture-specific humour.**
Structure them as **swappable packs from day one**, so localisation is *translation-plus-authoring*
rather than *translation-of-untranslatable-jokes.* **The ticket pack is also a perfect
community-contribution surface** — and a per-hosting-type pack is already the format (§9.3).

### Hosting-Type as Data (the variety engine's architecture)
Formalise it, and the game's variety scales without new code paths.

**How it works:** Each hosting type is **a bundle**: visitor definition, patience curve, demand curve,
threat-mix weights, buildable set, cost model, scoring weights, palette, ticket pack, wave table.
Then **a hosting type is a first-class moddable object**, **levels can mix two of them**, and adding a
type is a data task rather than an engineering one. **Publish the twenty official types in exactly this
format so the tooling is proven by the base game.**

**Interacts with:** §9.4's Skin Kit Editor and Ruleset Card, §9.6's Rosetta Test and Three-Change Rule,
§9.1's Line Draft and One Building/Four Lines.

### Real-World-Shaped Data Mode
A hard mode made of arithmetic rather than bigger enemy numbers.

**How it works:** Optional realism toggles — **true 95th-percentile billing, true demand charges, true
PUE math, true lead times, true depreciation schedules, true payment terms.** Each is a switch, so a
player can turn on the two they care about. **Difficulty from accuracy rather than from multipliers**,
which is the only kind of hard mode this audience respects.

**Interacts with:** §9.5's "was that real?" tag (every toggle is a REAL stamp made playable), §9.2's
honestly-named difficulties.

---

## 9.12 Small ideas that didn't fit anywhere else

*Kept deliberately — several of these are the most-recognised details in the whole design.*

### The Crash Cart
A wheeled monitor and keyboard you move around the floor to work on a machine with no network.

**How it works:** **A physical object with a location.** Someone always leaves it in the wrong row.
Finding it costs seconds you don't have, and buying a second one is a real, small, correct purchase.

### The Blanking Panel
The cheapest, highest-ROI item in the game.

**How it works:** Place them and watch your cooling efficiency jump. **It should feel like finding free
money, because it is.** One of §9.6's explicitly-curated "why didn't I do this years ago" pure wins.

### The Grounding / Bonding check
An obscure buildable that prevents a rare, catastrophic event.

**How it works:** You will never see it work. You will see it not-work exactly once, in a campaign where
you skipped it. **The purest expression of the game's argument about prevention.**

### The ESD strap
A tiny probability modifier on physical work.

**How it works:** Skipping it occasionally kills a DIMM — with no error message, days later, as an
unexplained instability. **The smallest possible time-delayed consequence.**

### Spare Parts Cannibalization
During an emergency, pull a part from a lower-priority machine.

**How it works:** Fast, free, and **creates a hidden inconsistency you'll forget about** — the donor
machine is now a landmine, and the game will not remind you.

### Firmware as a hidden version axis
BIOS, BMC, NIC, HBA, drive firmware.

**How it works:** All independently versioned, all occasionally the root cause, **all requiring a reboot
to change.** Invisible until you build the tooling to see it, which is itself the lesson.

### Patch Debt
Unpatched CVEs accumulate as a **visible risk score per host.**

**How it works:** Patching costs reboots costs downtime costs windows costs negotiation. **The single
most realistic loop in ops**, and the one most players will neglect in exactly the way real teams do.

### The Maintenance Window Negotiation
You must get customers to agree to a window.

**How it works:** Big customers say no. Mid-size customers say "not this month." Eventually **you do it
anyway, or you never patch anything.** Both options are available and both have consequences.

**Interacts with:** Patch Debt, the maintenance-notification joke (§9.3), the One Customer Who Is
Always Right (§9.2).

### The Rollback That Isn't
Some changes are one-way.

**How it works:** Schema migrations, cert revocations, hardware disposals, deleted data, released IP
space, terminated leases. **Marked in the UI with a distinct one-way-door icon** (§9.6 promotes this to
a law). **Players should learn to fear that icon.**

### The Runbook You Wrote At 4am
Lower quality, and you'll discover that next time.

**How it works:** Documents authored during an incident, or by a fatigued staff member, carry a hidden
quality penalty that only surfaces when someone else follows them. **A quiet, brutal argument for the
On-Call Clock and the 2am Rule** (§9.2).

### IP Reputation as an inherited property of address space
Buy a /24 on the secondary market and discover it has history.

**How it works:** Blocklist entries, a spam reputation, a Spamhaus listing, a geolocation database that
thinks you're in another country, a former tenant who ran something awful. **A genuinely real and
rarely-discussed problem**, and a great acquisition surprise.

**Hosting types:** critical for email/DNS and VPS; significant for bulletproof-adjacent, web and game
hosting; near-zero for colo and backup.

### Latency as a physical constraint on the world map
**~5µs per km of fiber, and no amount of money changes it.**

**How it works:** The only counter is **being closer.** Makes POP placement a real **geometry puzzle**
rather than a shopping decision — and it is the single most honest constraint in the whole design,
because it is the one thing the player cannot buy their way out of.

**Hosting types:** load-bearing for CDN, edge, game hosting and streaming; a rounding error for backup
and object storage.

### The Broker Lunch
A colo-level event where you spend money on relationship-building with brokers.

**How it works:** And it **actually works**, because it does. Priced honestly, with a reputation
component and a diminishing return.

**Variations and additions**

- **Sponsor the Local Meetup.** The small, unglamorous, community-ISP version of the same spend: a
  recurring goodwill line that unlocks **grey-hat talent applicants**, **intel rumours** (*"someone's
  planning to hit you Thursday"*), and **neighbourhood scrub-shelter from peer operators.** Mutual aid,
  priced in pizza money — and the cheapest possible on-ramp to the Lighthouse co-op twist (§9.2).

### Conference Booth Builder
A tiny, silly customization with real lead-gen consequences.

**How it works:** Booth size, position, banner, and **swag quality.** **Swag quality matters. It
genuinely does.** The badge collection it produces ends up on the Company Wall (§9.4).

**Variations and additions — the conference circuit**

- **The booth as a lead-gen minigame.** Budget the booth: spend, **swag quality**, lead count — and
  **2–3 pipeline deals appear on the map.** Sales theatre as a side activity, complete with giving away
  too many stress balls.
- **"The Conference Circuit" mini-mode.** Between levels, spend **a fixed travel budget across 2–3
  events** — a container conference, a games expo, a health-IT show — with meeting mechanics that **seed
  the next level's lead pipeline** and can unlock partnerships. **The board game inside the tower
  defense.**
- **The staffing cost** of attending lives in §9.2's Conference Talk variations: the unit you send comes
  back better, and while they are away **your coverage drops.**

### Cross-references for small ideas placed elsewhere
- **The "Do Not Reboot" machine / the uptime counter as a horror meter** → §9.2's Legacy Box.
- **The Second Opinion** → §9.2's Rubber Duck.
- **"Please confirm by typing the hostname"** → §9.3's rm -rf moment.
- **The Weather Layer** → §9.2's Weather Affects Everything (scoped).
- **The "Everything Is Green" screenshot** → §9.10.
- **The Doorstop, the amber LED, the rack elevation nobody updated** → §9.3's office set dressing.
- **The Post-It with the root password, the RFC 2324 coffee machine** → §9.3.

### Cosmic Rays
The industry myth, made mechanical — **once per save.**

**How it works:** One pixel from space flips one bit. **Exactly once in a save file**, with a deadpan log
line and no counterplay whatsoever. It exists so that the *"it was cosmic rays"* excuse can be **true
exactly once**, which is what makes it funny every other time someone says it.

**Interacts with:** §9.3's The Scare (the cruellest version of which is this event rendered as a prank on
the player), the ESD strap, §3's entropy layer.

### Open-Source Karma
Your dependencies have maintainers, and maintainers have limits.

**How it works:** Using OSS **lowers cost** but opens the door to a **maintainer-burnout-shaped
supply-chain attack**; **contributing back lowers that risk.** A small two-line mechanic that models the
single most uncomfortable dependency in modern infrastructure, and the only one whose counter is
*generosity*.

**Interacts with:** §9.2's Dependency Web, the Threat You Can Hire, §9.11's responsible-depiction rule.

### The Holiday-Card Account
High-touch enterprise sales, as a rhythm minigame.

**How it works:** Skip the annual greetings and **renewal odds dip**; send them and get **a tiny delight
buff**; **automate the personalisation and get detected — and churn.** The absurdity of high-touch sales
priced in three lines, and a neat inversion of the usual automation-is-always-right lesson.

**Interacts with:** §6's renewal fork, the whale accounts, §9.2's Reputation Has a Face.

### The AI Support-Bot swap
Replace your support-bot buildable with an AI.

**How it works:** It **churns customers** — and, because threat-hunters hate the new billing spam, it
also **reshuffles your threat mix.** A single swap that moves both flows at once, which makes it a clean
demonstration of the design's central coupling: *who you serve changes what hunts you.*

**Interacts with:** §9.13's Heat Sheet thesis, the support-quality dial, the BOFH difficulty.

---

## 9.13 Design priorities — the wave-2 closing notes

*Several wave-2 reports ended by naming the handful of items they thought actually decided whether the
game works. Collected here rather than dropped, because a priority list is a design document in its own
right. **These are opinions from different lenses and they do not fully agree** — the disagreements are
as informative as the agreements.*

### What to prototype first (the game-design lens, in order)
Six steps, each of which is a gate: **if it isn't fun with programmer art, nothing downstream matters.**

1. **The latency budget + bounce loop** — one server, one defense, one aggression slider. **If that
   isn't fun in 90 seconds with programmer art, nothing else matters.**
2. **The Attack Surface Ledger** — prove that building a database **visibly changes the threat deck**
   and that players notice and care.
3. **The Suspicion Dial with visible false positives** — prove players **agonize** over the slider.
4. **The rack/topology dual view and drag-a-cable** — prove the build interaction is **tactile.**
5. **One full quarter with a Quarterly Review** — prove the pacing arc and the five-axis grade.
6. **Two hosting types on the same engine** (shared web + game servers) — prove the Level Grammar
   produces **genuinely different play from the same verbs.** **If this step works, the whole campaign
   scales; if it doesn't, cut the number of business types and go deeper on fewer.**

### The six changes the game-design lens would make first
If only six of that lens's wave-2 proposals ship, these are the ones that change **whether the game
works**:

1. **Error Budget as a spendable currency** — the missing in-combat resource.
2. **Suspicion Routing + the Millisecond Budget + Inspection Depth** — the missing mazing layer; **turns
   defense from shopping into architecture.**
3. **The Nine Defense Roles and the Coverage Grid** — the missing half of the threat taxonomy; makes the
   tech tree reasonable-about.
4. **The Invariant Core + the Rosetta Card + the Handover Note** — the answer to the fragmentation
   question: **twenty rulesets, one game, taught in three lines each.**
5. **Numbers on the document's tensions** — the tensions become *mechanics* the moment they have values
   (§9.6's synergy/antagonism figures are the model).
6. **Reweight the scorecard to lead with conversion** — **until the score sheet implements "the reward
   is letting things through," the game will be played as a game about stopping things, and the entire
   premise is that it isn't.**

### The ten highest-value items from the operations lens
1. **Telemetry Resolution as a mechanic** — measurement interval determines truth; unifies the 95th
   percentile, microbursts, percentiles and retention-vs-resolution into one idea **no game has ever
   modelled and every operator lives inside.**
2. **The Threshold Bug / "what grew?" diagnostic mode** — the entire class of incidents **where nothing
   changed**, currently absent.
3. **DRaaS oversubscription and correlated declarations** — **the best untouched level premise** (and a
   backup/DR-specific one, which the web-skewed material needs).
4. **The Scream Test / decommissioning level** — **the only level whose verb is removal** (§9.1's The
   Sunset).
5. **Lead time as a currency, and the Circuit Order** — **the constraint money cannot buy.**
6. **The demand charge** — the 95th percentile's electrical twin, and **it makes the GPU
   synchronized-ramp event pay rent for eleven months.**
7. **Fixing Grace Windows** — as written they contradict four other systems; **move the grace to
   attention rather than to traffic.**
8. **Resolving the telegraph contradiction** — telegraph **by threat band**: weather and storms are
   visible, hunters and entropy are not, **and entropy is visible only if you bought the instrument.**
9. **Effective redundancy extended to five correlation types** — shared **power, path, firmware, human,
   and time.**
10. **Incident Command as a hand-assignment system** — **the design models attention beautifully and
    coordination not at all**, and coordination is the difference between a 20-minute incident and a
    three-hour one.

### The structural fixes the generalist lens would insist on
1. **Tier the modes** (§9.1) — ship four well: **Campaign, Endless, Incident Mode, Sandbox.**
2. **Collapse the nine meta-progression systems into one Company object with four faces** (§9.4) — **the
   Wall, the Scrapbook, the Almanac, the People.**
3. **Commit to the Long Save** (§9.4) — it is the object every other meta idea is a facet of, and it is
   what makes "Your Past Self Is The Boss" generatable rather than authored.
4. **State the teaching/explaining split** (§9.5) — **teaching is by event; explaining is on demand.**
5. **Add the four unstated guardrails** (§9.6) — explainable numbers, no doubly-invisible mechanics,
   irreversible actions marked before the fact, and *"what is the worst thing that could happen right
   now"* answerable in one glance.
6. **Add the missing humour rule** (§9.3) — **the game is never funny at the moment of loss.**

### What the art lens would fund first
1. **Make the boring thing beautiful, enforced as a budget line** (§9.6) — **no threat FX is approved
   until its prevention FX is.** Without this mechanism the rule loses every budget argument.
2. **Photo Mode, the Aquarium, and the export artifacts** (§9.10) — **the screenshot engine is the
   marketing department**, and it is nearly free on top of the camera grammar that already exists.
3. **Accessibility modes good enough that everyone uses them** (§9.8) — Shape-First, Readout Mode,
   One-Hand, Sonified. **If a sighted, hearing player wouldn't sometimes choose them, they aren't
   finished.**
4. **The Museum Floorplan and the Annual Report layout** (§9.4) — both assemble artifacts the game
   already generates into things players will keep.

### The single most valuable moment the business lens would build
**The Hardest Lesson, Delivered Once** (§9.2): the mid-campaign level you can only win by **raising
prices and losing customers.** **The most counterintuitive, most real, most valuable move in the
hosting business, and no game has ever made a player feel it.** Runner-up: **Revenue is never just a
number** (§9.6) as a standing guardrail, and the **"was that real?" tag applied to the business
mechanics** (§9.5), which is where the game earns its "I learned something" reviews from the half of
the audience that doesn't run servers.

### ⚔️ Where the priority lists disagree
- **Modes.** The generalist wants four modes shipped well and names Co-op NOC, Competitive Market and
  Async Attack as stretch-or-never. The design lens calls Co-op NOC "the best multiplayer idea here"
  and The Consultant "the highest-return single addition to the modes section." **They are arguing
  about cost, not quality.** Decide by prototype.
- **Threat mass vs service mass.** The operations lens wants *more* real failure modes (its top-ten is
  almost entirely new threats and new instrumentation); the design lens says the bestiary is already
  80% of the content and **is drowning the pillar that says the reward is letting things through.**
  The three-step filter in §9.6 is the proposed reconciliation: **real is the source, role coverage is
  the filter, playability is the veto.**
- **Accuracy vs immersion.** The education layer wants tags, glossaries, conversion drawers and
  "this actually happened" cards; the design lens warns that accuracy-flagging breaks immersion. **The
  resolution is placement, not volume:** all of it lives in the Codex and on documents, **never in the
  world**, and **the game never volunteers it.**
- **Ethics.** "No morality meter, just consequences" vs "the bulletproof arc must end somewhere."
  **Resolved by consequence rather than prohibition** (§9.11) — available and profitable, never
  indefinitely stable, and never a how-to.

### The design theses — one sentence each
Several lenses ended by trying to compress the whole design into **one defensible sentence.** They are
collected here because a store page can carry only one, and because each is a usable **cut test.**

- **The game-design lens:** ***"Their enemies look exactly like their customers."*** Every mechanic in
  this document is a variation on that line — mimics, sorters, rate-limit sliders, spam tenants, the hug
  of death. **If a future feature doesn't play with that ambiguity, cut it.**
- **The designer's complement:** ***"Every build is a door — the trick is making it a door your customers
  slide through happily and attackers trip the alarm on."*** If an idea doesn't create that two-faced
  choice, **it's decoration.**
- **The CEO lens:** **defenses that slow customers to stop threats are taxes on revenue; builds that
  please customers open attack surface; both flows meet in the billing system — and cash flow kills more
  hosting companies than hackers do.**
- **The missing coupling, proposed as a first-class rule — the customer→threat Heat Sheet.** ***Who you
  serve* is as radioactive as *what you build*.** Every cohort adds **visible threat lanes to your
  forecast**, so attracting the right customers is also defense strategy and **pricing becomes a security
  decision.** This is the one thesis-level item that is not yet a mechanic anywhere else in the document.
- **The genre novelty, stated plainly:** the **inversion.** In classic tower defense you **starve**
  enemies; here you **feed customers**, the pathing is shared, **the streams look similar at distance**,
  and the game is about **distinguishing and routing.**
- **The two-directional pressure loop:** build → more capability **and** more surface → more customers
  (revenue) **and** more threats → build. **Every buildable carries all three legs of the
  capability/surface/upkeep triangle.**
- **Discovery as pedagogy:** threats teach, incidents unlock, drills pre-empt — **no dry tech-tree
  walls.** Knowledge is earned by *running operations*.
- **Economy realism vs fun:** 95th-percentile billing, overselling, SLA credits, NET-90 cash flow —
  **real hosting economics are already game mechanics. Mine them before inventing.**
- **Tonal strategy:** affectionate parody of ops culture **with real stakes beneath** — an outage is both
  funny (the cat) and genuinely tense (the restore under the clock).

**Interacts with:** §9.6's "the reward is letting things through" (the guardrail these theses all
presuppose), §9.15's contradictions (which are what happens when two of these sentences are applied to
the same dial).

---

## 9.14 Campaign narrative, story arcs and world lore

*New in the opencode merge: the story layer the modes section assumes and never writes down. §9.1's
Campaign entry is the **structure** (a branching Pivot Map across types and eras); this subsection is the
**fiction** that structure carries — the framing device, the recurring cast, the arcs that span levels,
and the world the company lives in. Everything here is optional narrative dressing on mechanics that
already exist elsewhere in the document, which is exactly why it is cheap.*

### Ops Story Mode ("HostHaven")
The campaign given a name, a place and a villain.

**How it works:** You are the new sysadmin of **"HostHaven,"** a failing shared host. **Each level is a
calendar month**, opening with a cutscene from increasingly unhinged teammates. **The villain is "The
Cloud" itself** — a seductive SaaS competitor rendered as a boss rather than as a market force.

**Why it works:** it gives the campaign a *place* to be about, it makes the calendar the unit of
progression (which the seasonal calendar, quarter close and annual report all already want), and **it
gives the player someone to be angry at** in a genre where the antagonist is usually a spreadsheet.

**Interacts with:** §9.1's Campaign, §9.2's Rival Operator, the "There Is No Cloud" reveal below.

### The Status-Page Narrator
The game's voice, and the best joke that is also a mechanic.

**How it works:** A **dry-voiced narrator reads your incidents as public postmortems during the level**
— *"we are investigating degraded performance to region EU-WEST"* — and at level end **the postmortem
*is* your replay.** Loading screens carry true-ish outage histories from the industry's folklore,
teaching real ops lore while loading.

**The three upgrades that make it more than flavour:**
- **Story beats delivered as status-page updates you type** (or the game auto-writes): *"DEGRADED
  PERFORMANCE — under investigation (we are being DDoS'd and we are scared)."* A comedy layer **and** a
  strategic tool.
- **The tone ladder as a formal telegraph.** Codify the narrator's voice — **calm → clipped → dry-humour
  → silence** — as **the game's pre-boss telegraph.** Veterans learn to read incident-voice the way RTS
  players read unit-production sounds, and **the silence tier** (reserved for nation-state events) gets
  the *"silence is scary"* sound rule for free.
- **The narrator is upgradeable.** As your comms towers improve, **the postmortems get more sincere and
  more effective** — apology strength becomes churn-heal rate. **PR as a stat expressed purely through
  writing quality: the joke IS the mechanic.**

**Interacts with:** §9.2's Postmortem Publishing and the Status Page Voice, §9.3's euphemism ladder,
§9.10's postmortem artifacts.

### Newspaper Montage Transitions
Between-wave transitions rendered as a trade-publication cover story.

**How it works:** *"Offshore Haven Survives the Tide!"* — the act's world rendered as a front page.
**Level intros that are also worldbuilding and also the save menu**, which is three jobs for one asset.

**Interacts with:** §9.3's fictional trade press, §9.4's Annual Report layout, the era chrome system.

### The "You Are a Customer Once" prologue twist
The prologue ends with **your** site going down.

**How it works:** You play the prologue as a customer, and it closes with **your first server getting
hacked and your site going dark.** The whole game is revenge — or, more honestly, *never again*.
**Instant motivation to learn every counter**, delivered before the player has any idea what a counter
is.

**Interacts with:** §9.1's Tenant Mode / Play as the Customer (the full-length version of the same
empathy move), §9.5's education layer.

### The SLA Villain Arc (the final level designed to be lost)
The campaign ending where the demand becomes the antagonist.

**How it works:** In the final act, customer demands reach **99.999%** and **the last level is honestly
designed to be lost.** The penultimate unlock is **"renegotiate"**, and you end the game by **choosing
which customers to fire.** Theme-as-mechanic, about sustainable operations.

**Framed honestly, which is the whole ask:** **announce the frame up front** (*"Story level: hold out
until the renegotiation"*), make ***how well you lose*** the graded thing — customers rescued, contracts
transferred, dignity kept — and **let the renegotiation itself be player-driven.** A designed loss that
tells you it is one is a climax; a designed loss that doesn't is a bug report.

**Interacts with:** §9.2's The Hardest Lesson Delivered Once, §9.6's "lose slowly" operational
definition, §9.9's endings (especially The Acqui-Hire End).

### The Ethics Arc, the Nemesis, and the debt that becomes a boss
Three campaign-spanning threads that live as mechanics elsewhere.

**How it works:** The three arcs that give the campaign its spine are documented with their systems
rather than here, and are cross-referenced so the narrative layer can find them:
- **The Ethics Arc** — accept or decline dark money across the campaign, branching into clean, grey and
  dark late games with **three endings** → §9.2's Ethics Track.
- **The Recurring Nemesis** — a named adversary who learns your layout between levels, with a
  **redemption branch** where they become staff → §9.2's Recurring Nemesis and The Threat You Can Hire.
- **Final Boss = Your Own Complexity** — the **Tech-Debt Golem**, with HP equal to your accumulated
  mess-score → §9.2's Technical debt as visible substance.

### HOSTARD, the Fallen Giant
World lore you can walk into.

**How it works:** The predecessor megacorp that collapsed, **visible on the map as haunted abandoned
datacenters** you can scavenge or buy cheap — carrying **cursed buildables**: the Mainframe that whispers
CVEs, the Tape Vault that holds evidence of something terrible. **Worldbuilding by scavenging, one
dungeon-ruin at a time**, and the perfect source of the Inherited Mess's worst boards.

**Interacts with:** §9.2's Inherited Mess and Architectural Bad-Habit library, §9.12's IP reputation
(HOSTARD's address space has *history*), §9.4's Company Museum.

### The "There Is No Cloud" reveal
The campaign's late-act camera move.

**How it works:** The map camera **pulls back to show that "the cloud" is just more buildings with worse
coffee.** The meta-joke unlocks the **"cloud-washing" perk**: rename a product to *XaaS* and gain **+brand
hype for three quarters** — satire of pricing language every player recognises from their own inbox.

**Its quieter sibling — the narrative frame.** The campaign narrator can be **a grizzled founding-sysadmin
voice** telling your company's history from server closet to global network, under the title *"The Cloud
Is Just Other People's Computers,"* with **each act's epilogue a staff-party scene.** **Warmth is
retention** — for the company in the fiction and for the player holding the controller.

**Interacts with:** §9.3's office set dressing (the literal floating cloud), §9.2's The Pivot,
the era system.

### The Customers Are the DDoS
The mid-campaign reveal that re-reads every earlier decision.

**How it works:** A level where **your growth is the attack**: a fake product launch farms you into
collapse, and **the postmortem reframes every "good wave" filter decision you have ever made.**
Emotional payload and mechanical lesson in one beat — and the single clearest dramatisation of the
design's thesis that the two streams are indistinguishable at distance.

**Interacts with:** §9.2's Hacker News Hug-of-Death, §9.13's design theses, the suspicion-routing layer.

### The Startup Throughline
Garage → colo → own DC → global network → the public outage → back.

**How it works:** The arc most players expect and the document never states: a startup's whole life,
with a **catastrophic public outage as a boss level** somewhere in the third act and a rise afterwards.
**Customer logos are the trophies**, and the through-line is what makes the Long Save (§9.4) feel like a
biography rather than a save file.

**Interacts with:** §9.1's Historical Campaign, §9.4's Anniversary and Annual Report, §9.9's endings.

### The Meta-Narrative of Incident Reports
The campaign told entirely through its own artifacts.

**How it works:** Your company's story is told through **the incident reports and uptime graphs of
completed levels.** Campaign summaries read like **the history of the early internet**, and the emotional
hook is that **you built something people depended on.** It costs nothing, because the postmortems,
timelines and ribbons already exist as data.

**Interacts with:** §9.4's Postmortem Wall and Museum Docent, §9.10's export artifacts.

### The Customer Is a Person (named-customer throughlines)
Generic churn made personal, so that an outage can be *felt.*

**How it works:** A small cast of **named customer characters with stories** — the bakery site, the
memorial archive, the indie game that employs the whole map — carried across levels as an optional
narrative layer.

- **The Ticket (the dark-humour version).** A recurring NPC customer — **a sweet old lady running a
  cookie-recipe site** — whose tickets arrive ever more desperate across eras. **Keeping her alive
  through every campaign tier is the secret "Guardian Angel" ending.** An emotional throughline for a
  systems game.
- **The period cameo.** A customer named **"Lance, 1999 GeoCities survivor"**, and his equivalent in every
  era, as flavour that dates the level without a caption.

**Interacts with:** §9.3's Cameo Customers and the Customer Logo Generator (§9.10), §9.4's Wall of
Ghosts, §9.8's churned-customer voicemail.

### The Boss Gallery
Every set-piece encounter the industry already mythologises.

**How it works:** Bosses in this game are **situations, not health bars**, and most of them teach *"some
threats are managed, not defeated."* The gallery:

- **"10/10 DDoS."** A literal **black hole of packets** opens over the map mid-level, pulling everything
  in: bring enough scrub capacity or **go dark in triage order.**
- **The Toll-Free Number Boss.** An endgame shared-hosting level where **every customer insists on
  calling a human** — the support lane becomes the whole map. Humour, a difficulty spike, and the genuine
  history of an industry standard.
- **The Printer Boss.** Every hosting type shares one raid enemy: **the office laser printer.** A
  paper-jam hydra with an error-code roar and toner-burst attacks, **unkillable by force and beatable
  only by appeasement** — and it jams mid-audit. *The tutorial for "managed, not defeated."*
- **The Legacy Codebase.** The customer-owned monolith you cannot kill because **it is a customer** →
  §9.2's Legacy Box variations.
- **The "47 Warnings" event.** A scripted compliance-nitpick boss: your stack floods with warnings, and
  **each dismissed warning spawns a regret later.** Tech-debt humour with a delayed fuse.
- **The Audit Boss.** An actual inspection **walks through the DC asking questions** — passwords under
  keyboards get found by the CCTV, missing door locks get the red pen. **A dialogue/stealth reverse-TD
  where the real play happened earlier**, when you arranged the room to satisfy the checklist.
- **The Chargeback Duel.** A whale disputes **six months of invoices at once**, and your **evidence stack
  is your deck**: logs, signatures, ticket history, **your status-page honesty record.** Genuinely tense,
  genuinely real.
- **The Keynote Boss** → §9.2's Conference Talk variations.
- **A "ticket from Karen"** boss variant, for the support lane's own difficulty spike.

**Interacts with:** §9.2's named disasters, §9.6's three-step "ship the real monsters" filter (every boss
here is a real situation, which is the point), §9.5's Postmortem Library.

---

## 9.15 Cross-cutting contradictions needing rulings

*Carried across whole from the opencode pass, where a wave-2 informed sysadmin review swept the entire
document for **rules that cannot all be true at once.** These are **not** category-9 disputes: each one
bears on a mechanic documented in another category file, and is preserved here — rather than edited into
someone else's section — because the ruling has to be made once, centrally, and then applied in both
places. **Each is stated with the resolution its author proposed; none is adopted here.***

*Related, and deliberately not duplicated: §9.13's **"Where the priority lists disagree"** holds the
four lens-level disagreements (modes, threat mass vs service mass, accuracy vs immersion, ethics). Those
are arguments about **emphasis**; the seven below are arguments about **rules**. Read them as one list in
two registers — §9.13 first, then this.*

### Contradiction: reboot-as-cleanse vs persistent threats — *CONFLICTING*
**Bears on:** `08-core-gameplay-mechanics` (the reboot/restart verb) and `03-threats` (the persistence
classes).

The core-mechanics "reboot as cleanse" verb would **hard-counter half the threat catalogue for free** —
webshells, cryptojackers, dormant APTs.

#### Position A — keep the free cleanse *(as written)*
The reboot stays a cheap, universal, satisfying answer. Simple, readable, and consistent with the joke
being that it works.

#### Position B — the persistence ladder *(resolution offered)*
**reboot → restart-service → reimage → rebuild-and-rotate**, where **each tier clears a different
persistence class at a rising cost.** The threat's persistence class then becomes the thing the player
is actually diagnosing, and the free reboot stops being a dominant action.

*(See also §9.3's reboot fix-rate conflict, which is the same verb argued on a different axis — how
often it works, rather than what it clears.)*

### Contradiction: build-homing spawn law vs blanket zero-day meteors — *CONFLICTING*
**Bears on:** `03-threats` (the spawn law) and `05-buildables-services-and-infrastructure` (what you are
made of vs what you exposed).

The threats file states that **"enemies home in on what you built"** — and then also ships the
**Universal Library Exploit / Zero-Day Meteor that hits everything.** Both cannot be the spawn law.

#### Position A — enemies home in on what you built *(as written)*
Targeting follows the player's **construction choices**, which is what makes the Attack Surface Ledger
legible and the build decision weighty.

#### Position B — targeted follows your build; blanket follows your stack *(resolution offered)*
**Say the two rules apart, explicitly.** *Targeted* threats follow your **build** (what you exposed);
*blanket* threats follow your **stack** (what you are made of). That makes **the CMDB the load-bearing
counter**, and it correctly handles **inherited** infrastructure, which spawns threats you never built.
The law then reads: ***"threats home in on what you run, built or inherited."***

### Contradiction: metered-vs-flat pricing dial vs the "attacks award $0" heartbeat — *CONFLICTING*
**Bears on:** `07-economy-money-and-scoring` (the MRR heartbeat) and `04-customers-traffic-and-clients`
(the pricing dial).

Under **metered egress**, serving attack traffic **costs real money mid-attack** — so a heartbeat rule
that says attacks simply award nothing erases the entire difference the pricing dial is supposed to make.

#### Position A — attacks award $0 *(as written)*
A clean, readable economy rule: threat traffic is worth nothing, customer traffic is worth something.

#### Position B — attacks *bill* $N *(resolution offered)*
The MRR heartbeat needs **a variable "metered cost" tick**, so the dial's difference is **felt rather
than flavour.** *"Attacks award $0"* sharpens to ***"attacks bill $N"*** — and a volumetric event becomes
a **cash-flow** event, not merely a downtime event.

### Contradiction: the auto-scaler spends money vs the War Chest rewards lean play — *CONFLICTING*
**Bears on:** `05-buildables-services-and-infrastructure` (autoscaling) and
`07-economy-money-and-scoring` (the War Chest / efficiency metric).

Autoscaling **inherently wastes** — headroom, boot lag — so a War Chest metric that rewards *spending
less* punishes the player for using a system the game sells them.

#### Position A — the War Chest rewards lean play *(as written)*
Efficiency is measured as **spend down**, which is simple and immediately legible.

#### Position B — the War Chest counts *waste* *(resolution offered)*
Score **efficiency = utilisation × uptime**, not spend↓. Waste is the thing measured, and **a *tuned*
autoscaler reduces waste** — so the two systems become **synergistic instead of contradictory**, and
tuning becomes a scored skill rather than an unscored chore.

### Contradiction: the entry-side visual contract vs mimic threats entering as customers — *CONFLICTING*
**Bears on:** `09-visuals-and-presentation` (the entry-side contract) and `03-threats` (the mimic
families).

The visuals file states **"customers bright side, threats dark side, never mix."** The threats file ships
**SYN-mimics, the Hug-of-Death and abusive tenants — all of which enter as customers, which is the
point.**

#### Position A — origins never mix, and appearances never mix *(as written)*
An absolute entry-side contract: the player can always trust which side of the board a thing came from
*and* what it looks like. Maximum readability, zero ambiguity.

#### Position B — origins never mix; appearance-mixing is a documented exception *(resolution offered)*
**Split the contract in two.** ***Origins* never mix** — spawn lanes stay typed, so the law survives
where it earns its keep. **Appearance-mixing becomes an explicit, rare, high-skill threat family**,
readable on inspection via the tear frame. State it as a documented exception, **or the visual law kills
the systems law's best ideas.**

### Contradiction: three-star grading axes vs SLA difficulty modifiers — *CONFLICTING*
**Bears on:** `01-levels-scenarios-and-progression` (three-star grading) and
`07-economy-money-and-scoring` (SLA modifiers).

Two redundant dials measuring **the same axis** — uptime — one as a grade and one as a difficulty
modifier.

#### Position A — both dials, independently *(as written)*
Stars grade performance; SLA modifiers raise difficulty. Each is individually reasonable.

#### Position B — SLAs set the targets; stars grade against the targets you signed *(resolution offered)*
Collapse them: **the contract sets the bar, the stars measure you against the bar you agreed to.**
*"Five-nines difficulty"* then means **"you chose the hardest contract,"** which is a *player decision*
rather than an invisible stat bump — and it is exactly the shape §9.6's Difficulty-Budget Rule asks for.

### Contradiction: difficulty-via-entropy vs the scaling-ladder wave-knob school — *CONFLICTING*
**Bears on:** `01-levels-scenarios-and-progression` (wave scaling) and `03-threats` (entropy/rot).

Two schools of difficulty, flagged since the first wave and never reconciled: **difficulty as ambient
entropy** vs **difficulty as a wave ladder.**

#### Position A — the wave-knob school *(as written)*
Difficulty is authored: richer waves, tighter clocks, more simultaneous pressure. Legible, tunable,
schedulable.

#### Position B — both sliders, plus the interaction wave 1 missed *(resolution offered)*
Endorse **both** sliders — **and then add the coupling:** rot should scale with **the time since your
last maintenance action, per device.** Entropy then becomes **a playable schedule rather than an ambient
tax.** The principle underneath, worth stating on its own: ***rot that only punishes the passive is fair;
rot that punishes the busy is unfair.***
