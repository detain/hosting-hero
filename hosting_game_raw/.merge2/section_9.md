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

### Roguelite Run Mode ("Bootstrapped")
Start with $500 and a used server.

**How it works:** Each shift you draft one of three offers — a customer, a piece of gear, a policy, or
a staffer. Permadeath on insolvency. Meta-unlocks between runs. No financing is available at all;
every dollar must come from a customer. **Brutal, pure, and the way most real hosts actually started.**
Probably the most replayable version of this game and worth prototyping early.

**Tension:** ⚔️ Bootstrapped-as-a-roguelite and The Consultant are two different run structures over
the same systems (build-your-own vs inherit-someone-else's). Both are strong; they should not compete
for the same slot in the shell. Ship one first, and the other as its mirror.

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

### Co-op: Ops and Commercial ("Two Departments" / "Two-Person On-Call")
One player runs Ops, one runs the Business, sharing one cash bar.

**How it works:** Ops owns the board, the defenses and the incidents; Commercial owns pricing, sales,
support and comms. They share a budget and must argue about it. **They will fight. That's the
feature.** The sales player selling an SLA the infra player can't meet is **the single best comedy
engine available** in the whole design, and it's also how the real tension in a hosting company works.

**Interacts with:** §6's P&L, the SLA system, the status-page voice mechanic (§9.3).

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

### Async "Attack My Network"
Share your build as a puzzle for others to break.

**How it works:** Your topology is published; others attempt to find its weak point. You get their
attack reports. **Community-generated difficulty**, and a brutal architecture review.

**Note:** see §9.1's mode-tiering — this is honestly a stretch goal, and naming it as one stops it
competing for design attention.

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

### Campaign+ / New Game+ / "The Incumbent"
Replay with your knowledge and a fraction of your tech.

**How it works:** See §5.5's Rediscovery. Harder threats, tighter money, and the levels you found hard
are now the tutorial. The **"Incumbent"** variant is better still: restart with your endgame company
intact, but **now you are the big slow one**, and a scrappy competitor is doing to you exactly what you
did to everyone else.

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

### Tenant Mode / The Inverted Level
You are the customer.

**How it works:** You're a customer *inside* someone else's facility — AI-run or player-run — which
turns **their** reliability into **your** terrain. A harder variant: evaluate three hosting providers
by running workloads on them and picking one. **Teaches the system from the other side, and makes you
hate yourself.**

**Interacts with:** Landlord vs Tenant, §9.2's Reverse Colo, the Dependency Web.

### The Night Shift / "On-Call Night"
One level played entirely at 3am.

**How it works:** Half staff, alarms only, **no building allowed** — you can only operate what already
exists. Pure incident response. As an endless variant, a single night shift with escalating incidents
where the screen slowly dims toward dawn and the coffee cups accumulate on your desk **as a visible
timer**. Score = incidents survived. **The most atmospheric mode in the design and the one that best
captures the actual job.** Tense, short, memorable.

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

### The One Customer Who Is Always Right / The Unremovable Customer
A named recurring account.

**How it works:** They're big, they're demanding, they're often actually correct, and they will eat one
hand permanently. Their setup is so bespoke and so load-bearing that **you cannot migrate, upgrade or
decommission anything near them.** Every level, they're still there. **Firing them is an option and you
will think about it constantly.**

### The "Unlimited" Trap
Offering an unlimited plan is available from level 2 onward.

**How it works:** It **always** spikes signups. It **always** ends badly. **Players will do it anyway,
exactly like the industry did.** The asterisk is rendered on the marketing page, and clicking it opens
a fair-use policy of absurd length that the player can actually scroll.

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

### The Office Cat
Fully diegetic monitoring.

**How it works:** An NPC cat sleeps on the **warmest rack**. Where it sleeps is **actually a heat
indicator.** It occasionally walks across a keyboard. In the "Realistic" difficulty (§9.2) the cat is
part of your monitoring stack, which is the funniest sentence in this document and also true.

### The Legacy Server With a Name
Inherited machines get names.

**How it works:** `BEHEMOTH`. `tiny`. `webserver2-old-DO-NOT-DELETE`. Retiring one that's been running
for eleven in-game years **should get a small ceremony** — and the Hall of Fame Drive (§9.10) gets a
plaque and, when it finally dies, **a short, genuinely sad animation.**

### The certificate whose CN is `localhost`
In production. Working. For four years.

### "Restart it."
A support macro that resolves 60% of tickets, is deeply unsatisfying, and is **correct.**

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

---

## 9.7 Long-tail and stretch ideas

### Level editor and workshop
Author scenarios, share them.

**How it works:** Define the topology, the threat waves, the customers, the money, the constraints, and
the hosting type. **Given the ruleset-card structure, a scenario is a small data file** — which makes
this unusually cheap for what it returns. Paired with the Skin Kit Editor (§9.4), a community member
can author **a whole hosting business plus the level it lives in.**

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

### The Stream Overlay
Cheap, and this game **will** be streamed.

**How it looks:** a toggle that **reserves a clean corner**, promotes the three-clock cluster and the
money column to **double size**, hides the build palette when idle, and draws every alert twice as
large. Plus a **spectator ticker** that narrates in plain language what the player just did, and a
**spectator camera that auto-pounces on incidents.** **Readability for someone watching at 720p on a
phone is a different design problem and it takes ten minutes to solve.**

### Seasonal live events
Shared world events on a calendar.

**How it works:** A month-long "Black Friday" event; a "Patch Tuesday" weekend; a global vulnerability
that everyone responds to at once; a hardware-recall week. **Community cohesion without multiplayer.**

### Company culture as a stat
The soft thing, made mechanical.

**How it works:** Culture affects hiring, retention, incident behaviour, and **whether people tell you
bad news early.** **Blameless postmortems, sustainable on-call and documentation all feed it** — and a
company where people hide problems fails in a distinctive, awful way: your incidents get later, your
MTTR gets worse for no visible reason, and your first warning of anything is a customer.

**Interacts with:** the Company Handbook (§9.2), "Everything Is Someone's Fault" (§9.2), the Alumni
Network (§9.4).

### Real uptime leaderboard
A long-horizon competition.

**How it works:** Longest continuous simulated uptime across a persistent save. **The streak is the
score**, and losing it hurts in a way no number does. **Render a run as its Uptime Ribbon rather than
as a number** — comparing two ribbons side by side is instantly legible and a number is not.

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

### The Cursor
Unspecified in wave 1 and used constantly.

**How it looks:** **Not an arrow.** A small **crosshair-and-caret** in white (the player-intent hue),
which changes tool-state by **adding a glyph** rather than changing shape: a **cable end** when wiring,
a **wrench** when assigning a hand, a **magnifier** when inspecting, a **flashlight cone** during a
black start. **One base, many badges**, so the cursor never gets lost on a busy board.

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

### The end credits roll down a cable tray
Because of course they do.

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

### Cosmetic Economy (non-pay)
All earned, all visible, all screenshot-relevant.

**How it works:** Rack faceplate styles, LED colours (**including the tasteless all-blue 2004 pack**),
cable colour schemes, floor tile patterns, company logo kit, sign fonts, NOC wallpaper, desk clutter.
**No purchases** — everything is unlocked by play, and most of it is unlocked by doing something
unglamorous and correct.

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

### The Failure Hall of Fame
Community content generated from failure rather than from authoring.

**How it works:** Opt-in upload of **your worst incident as a playable Incident Mode scenario.** Others
play your disaster and try to do better. **Costs almost nothing once replay exists**, and it fits this
game perfectly — the community's best content will be its worst nights.

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

### Conference Booth Builder
A tiny, silly customization with real lead-gen consequences.

**How it works:** Booth size, position, banner, and **swag quality.** **Swag quality matters. It
genuinely does.** The badge collection it produces ends up on the Company Wall (§9.4).

### Cross-references for small ideas placed elsewhere
- **The "Do Not Reboot" machine / the uptime counter as a horror meter** → §9.2's Legacy Box.
- **The Second Opinion** → §9.2's Rubber Duck.
- **"Please confirm by typing the hostname"** → §9.3's rm -rf moment.
- **The Weather Layer** → §9.2's Weather Affects Everything (scoped).
- **The "Everything Is Green" screenshot** → §9.10.
- **The Doorstop, the amber LED, the rack elevation nobody updated** → §9.3's office set dressing.
- **The Post-It with the root password, the RFC 2324 coffee machine** → §9.3.

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
