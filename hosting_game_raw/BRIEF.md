# Hosting Company Tower Defense — Idea Generation Brief

## What is being built

A tower-defense-style game themed around running a **hosting company** — a company that hosts
*things* for other people. The player starts small (a single service on a single box) and progresses
through levels of increasing scale and difficulty, up to running multiple datacenters.

### IMPORTANT: "hosting" means ANY kind of hosting, not just web hosting

This is deliberately broad. The company is a **hosting provider in general**, and **what kind of
hosting it does can change from level to level and from scenario to scenario**. One level you might
be running shared web hosting; the next you're running game servers; the next you're a colo operator
renting out cages; the next you're a GPU/AI compute host. The kind of hosting is a first-class
variable that reshapes the threats, the customers, the buildables, the economics, and the look.

Non-exhaustive list of hosting business types to draw on (invent more):

- Shared web hosting / cPanel-style mass hosting · managed WordPress / managed app hosting
- VPS / cloud instances · dedicated servers · bare metal · colocation (renting rack/cage/cabinet space
  and power to other companies) · wholesale datacenter / hyperscale build-to-suit
- Game server hosting (Minecraft, ARK, CS, private MMO shards) · voice / VoIP / SIP trunking
- Email hosting · DNS hosting / anycast DNS · CDN / edge caching · object storage / S3-alike
- Backup, archival, and disaster-recovery hosting · offsite tape vaulting
- Video hosting / transcoding / live streaming · image and file hosting · seedbox / storage boxes
- GPU + AI/ML compute hosting · HPC / render farms · crypto mining hosting
- Container / Kubernetes platform hosting · PaaS · serverless / function hosting
- Database-as-a-service · managed search · queue/broker hosting
- Bulletproof / anything-goes hosting (high revenue, high abuse, high reputational risk)
- Regulated hosting: HIPAA, PCI, FedRAMP, GDPR-resident, financial-exchange colocation
- Retro/period settings: dial-up ISP, BBS, IRC leaf, shell accounts, web rings, Usenet feeds
- Specialized: satellite ground-station hosting, edge/5G MEC, IoT backends, blockchain nodes

Each hosting type should imply its OWN customer archetypes, its OWN threat mix, its OWN failure
modes, its OWN cost structure, and its OWN visual identity. A game-server host fights DDoS and
cheaters and cares about tick-rate and latency; an archival backup host fights bit-rot and tape
library failures and cares about durability and restore times; a colo host's "customers" are other
companies who walk into your building and whose own gear you can't control. Lean into those
differences — they are the variety engine of the whole game.

## Core loop

- **Threats** approach your infrastructure. You build out your setup and defenses to stop them.
- **Visitors / traffic / clients** also approach, but they're fragile — they bounce or give up if the
  path to you is slow, broken, or unpleasant. You have to attract them and get them all the way to
  your company, because they're your revenue. ("Visitors" is generic: they might be web page loads,
  game players joining a server, API calls, backup jobs, streaming viewers, SIP calls, inference
  requests, or a prospective colo tenant touring your facility.)
- So it's two-directional: keep threats away while pulling visitors in. The goal is to keep the
  company alive and profitable.
- Building things is a tradeoff. Example: adding a database server behind your web server lets you
  do more and serve faster, but opens you up to new attack types (SQL injection, DB overload, etc.).
  Another: adding a public game-server browser listing brings players but also brings scanners and
  booters. Most builds should work this way — more capability, more attack surface, more upkeep.
- Progression: doing things in the game unlocks or lets you discover new abilities and buildables
  (tech tree / discovery mechanics). Progression can also mean *changing what kind of hosting
  company you are*, or running several lines of business at once.

## Deliverable

Brainstorming only — NO code, NO implementation details. A large, well-organized idea document
covering these 9 categories:

1. **Levels, scenarios, and progression** — distinct stage types at different scales, different
   hosting business types, and different perspectives, each with its own complexity. Examples of the
   range: a single site or service on a shared box; a small hosting company with a few rackmount
   servers colocated in someone else's datacenter; a medium company running its own suite at a
   datacenter with a handful of compute nodes, DB servers, cache servers, load balancers; a large
   datacenter operator with many racks and many customers; a colo landlord whose tenants are other
   hosting companies; multiple datacenters across regions. Explicitly include levels built around
   DIFFERENT hosting types (game hosting level, backup/DR level, CDN level, GPU-compute level, colo
   level, email/DNS level, dial-up-ISP period level, bulletproof-host level, etc.) and what each one
   changes about the rules. What's introduced, and what gets harder at each stage. Scenario ideas
   with different goals or constraints (e.g., survive a launch spike, migrate without downtime,
   recover from a breach, pass an audit, absorb an acquired competitor's junk hardware).
2. **Threats** — attack types, attacker types (bots, script kiddies, competitors, nation-states,
   etc.), and non-attack problems (hardware failure, power loss, bad deploys, angry customers,
   regulators, upstream carrier outages); how each behaves, what it costs you when it gets through,
   and what counters it. Note which threats are specific to which hosting types.
3. **Visitors, traffic, and clients** — types of visitors and customers, what makes them bounce or
   churn, how you attract them, how they convert to revenue, and what the player can actively do to
   win more of them. Cover how "a visitor" looks different per hosting type (page load vs. player
   joining vs. backup job vs. inference request vs. a tenant signing a 5-year colo contract).
4. **Buildables: services and infrastructure** — servers, services, network gear, defenses, staff,
   facilities (power, cooling, generators, fire suppression, security), etc. For each: what it does,
   what it costs, what it connects to, and what new risk or attack surface it introduces.
5. **Unlocks and discovery** — what actions or milestones unlock what; tech tree ideas. Include
   unlocking whole new *lines of hosting business*.
6. **Economy, money, and scoring** — revenue streams, costs, upkeep, pricing, cash flow; how specific
   visitors, clients, staff, and threats raise or lower your money; scoring systems, win/lose
   conditions, how performance is rated at the end of a level.
7. **Core gameplay mechanics** — how it all fits together: pathing, placement, upgrades, resource
   management, failure states. Include concrete interaction design, e.g., how does the player actually
   connect a database object to a web server object on screen (drag a cable, place adjacent,
   click-to-link, a wiring mode?) and how is that connection represented once made.
8. **Visuals and presentation** — how things should look: art style, what servers/racks/services look
   like, what each threat looks like as it approaches, what visitors look like, how attacks, defenses,
   connections, upgrades, failures, and money changes are expressed visually, UI/HUD ideas, readability
   at scale. Include how the game's look shifts between hosting types and eras.
9. **Anything else** — modes, twists, humor, meta ideas.

For each idea be concrete: name, short description, how it works mechanically (or visually), and how it
interacts with other systems. **Quantity matters more than polish at this stage.**

## Agent lenses

Every agent gets this full brief. Each agent is also assigned one point of view, which should color
everything it generates:

- **General (`general`, no lens):** Just the brief. Go wide across all categories and across many
  hosting business types.
- **Sysadmin (`sysadmin`):** You're a veteran sysadmin / hosting engineer who has run more than one
  kind of hosting. Draw on how real infrastructure actually works and fails — real attack patterns,
  real hardware and network failures, real operational tradeoffs, real things customers do. Ground
  ideas in authenticity, then translate them into game mechanics.
- **Game designer (`gamedesigner`):** You're an experienced tower-defense / strategy game designer.
  Focus on what makes the game fun — pacing, difficulty curves, meaningful choices, satisfying unlocks,
  risk/reward, and the tension between attracting visitors and repelling threats. Use the hosting theme
  as flavor for good mechanics, not the other way around. Think about how swapping hosting type between
  levels keeps the game fresh without fragmenting it.
- **CEO / marketing (`ceo`):** You run or market a real hosting company. This is NOT about marketing the
  game — it's about making the business side of the game realistic. What does the player do to attract
  and keep clients, make more money, price services, handle reputation, sales, support, SLAs, upsells,
  partnerships, churn? How do business decisions and events affect cash flow? What would a real operator
  recognize as true? Cover how the business model differs across hosting types (shared vs. colo vs.
  GPU vs. backup vs. game servers) and how a company pivots between them.
- **Graphics / visual designer (`visual`):** You're a game artist / UI designer. Focus on how everything
  is expressed visually — what each threat, visitor, service, and piece of infrastructure looks like, how
  actions and interactions (attacks landing, defenses firing, connections being made, upgrades, failures,
  money moving) are shown on screen, art style, animation, iconography, and keeping it readable as the
  setup grows large. Include how the visual language changes per hosting type and era.

## Output rules

- Write your FULL report to the file path you were assigned. Organize it under the 9 categories above.
- Your reply to the orchestrator is ONE LINE ONLY: `DONE — wrote <path>` or `FAILED — <reason>`.
  No ideas, no summary, nothing else in the reply.
- Go long. Depth and quantity both matter. Aim for a substantial document — dozens of distinct,
  named, concretely-described ideas across the categories, not a thin outline.
