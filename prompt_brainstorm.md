# Hosting Company Tower Defense — Idea Generation

## What I'm building

A tower-defense-style game themed around running a hosting company — not specifically web hosting, but hosting of any kind. Each level or scenario puts the player in charge of a particular kind of hosting operation at a particular scale, and both can change from level to level.

**Hosting type is a scenario variable.** Types include (not exhaustive): shared web hosting, VPS / cloud, colocation, game servers, GPU / AI compute, backup & disaster recovery, CDN, email / DNS, video streaming, bulletproof / offshore, regulated (healthcare, finance, government), a retro dial-up ISP, and anything else that fits. The hosting type reshapes what threats show up, who the customers are and how they behave, how the money works, what you can build, and how everything looks.

Core loop:
- **Threats** approach your infrastructure. You build out your setup and defenses to stop them.
- **Customers / traffic** also approach — whatever the hosting type's paying load is: web visitors, gamers joining a server, tenants racking hardware, ML training jobs, backup streams, inbound mail, viewers, dial-up callers. They're fragile — they bounce, churn, or fail if the path to you is slow, broken, or unpleasant. You have to attract them and get them all the way to your company, because they're your revenue.
- So it's two-directional: keep threats away while pulling customers in. The goal is to keep the company alive and profitable.
- Building things is a tradeoff. Example: adding a database server behind your web server lets you do more and serve faster, but opens you up to new attack types (SQL injection, DB overload, etc.). Adding a GPU node attracts lucrative AI customers but also crypto-miners and abuse. Most builds should work this way — more capability, more attack surface, more upkeep.
- Progression: within a level the player starts small and grows; across the game, levels increase in scale and difficulty, from a single server up to multiple datacenters. Doing things in the game unlocks or lets you discover new abilities and buildables (tech tree / discovery mechanics).

## What I want right now

Brainstorming only — no code, no implementation details. I want a large, well-organized idea document covering:

1. **Levels, scenarios, and progression** — levels combine a scale and a hosting type, plus a scenario goal or constraint. Scale examples: a single site on a shared server; a small operator with a few rackmount servers colocated in someone else's datacenter; a medium-size company running its own service at a datacenter with a handful of web servers, DB servers, cache servers, load balancers, etc.; a large datacenter operator with many racks and many customers; multiple datacenters across regions. What changes, what's introduced, and what gets harder at each stage. Scenario ideas with different goals or constraints (e.g., survive a launch spike, migrate without downtime, recover from a breach, pass an audit, ride out a hurricane).
2. **Hosting types** — for each type listed above, and any new ones you propose: what makes it distinct — its characteristic threats, its customers and what they want, its buildables, how its money works, and how it should look and feel. Which types make good early vs. late levels, which combine well in one scenario, and what happens when a company transitions from one type to another.
3. **Threats** — attack types, attacker types (bots, script kiddies, competitors, nation-states, abusive customers, law enforcement, etc.), and non-attack problems (hardware failure, power loss, bad deploys, angry customers, regulators); how each behaves, what it costs you when it gets through, what counters it, and which hosting types it belongs to.
4. **Customers, traffic, and clients** — types of customers and traffic per hosting type, what makes them bounce or churn, how you attract them, how they convert to revenue, and what the player can actively do to win more of them.
5. **Buildables: services and infrastructure** — servers, services, network gear, defenses, staff, facilities, etc. For each: what it does, what it costs, what it connects to, what new risk or attack surface it introduces, and which hosting types use it.
6. **Unlocks and discovery** — what actions or milestones unlock what; tech tree ideas.
7. **Economy, money, and scoring** — revenue streams, costs, upkeep, pricing, cash flow, and how these differ by hosting type; how specific customers, staff, and threats raise or lower your money; scoring systems, win/lose conditions, how performance is rated at the end of a level.
8. **Core gameplay mechanics** — how it all fits together: pathing, placement, upgrades, resource management, failure states. Include concrete interaction design, e.g., how does the player actually connect a database object to a web server object on screen (drag a cable, place adjacent, click-to-link, a wiring mode?) and how is that connection represented once made.
9. **Visuals and presentation** — how things should look: art style, what servers/racks/services look like, what each threat looks like as it approaches, what customers look like, how attacks, defenses, connections, upgrades, failures, and money changes are expressed visually, UI/HUD ideas, readability at scale, and how the look shifts between hosting types (a dial-up ISP should not look like a GPU farm).
10. **Anything else** — modes, twists, humor, meta ideas.

For each idea be concrete: name, short description, how it works mechanically (or visually), how it interacts with other systems, and which hosting types it applies to. Quantity matters more than polish at this stage.

## Agent lenses

Every agent gets the full brief above. Each agent is also assigned one of the following points of view, which should color everything it generates. Every lens should consider the full range of hosting types, not just web.

- **General (no lens):** Just the brief. Go wide across all categories.
- **Sysadmin:** You're a veteran sysadmin / hosting engineer who has worked across many kinds of hosting. Draw on how real infrastructure actually works and fails — real attack patterns, real hardware and network failures, real operational tradeoffs, real things customers do. Ground ideas in authenticity, then translate them into game mechanics.
- **Game designer:** You're an experienced tower-defense / strategy game designer. Focus on what makes the game fun — pacing, difficulty curves, meaningful choices, satisfying unlocks, risk/reward, and the tension between attracting customers and repelling threats. Use the hosting theme as flavor for good mechanics, not the other way around.
- **CEO / marketing:** You run or market real hosting companies of various types. This is NOT about marketing the game — it's about making the business side of the game realistic. What does the player do to attract and keep clients, make more money, price services, handle reputation, sales, support, SLAs, upsells, partnerships, churn? How does this differ between, say, colo, game servers, and regulated hosting? How do business decisions and events affect cash flow? What would a real operator recognize as true?
- **Graphics / visual designer:** You're a game artist / UI designer. Focus on how everything is expressed visually — what each threat, customer, service, and piece of infrastructure looks like, how actions and interactions (attacks landing, defenses firing, connections being made, upgrades, failures, money moving) are shown on screen, art style, animation, iconography, how the visual language changes per hosting type, and keeping it readable as the setup grows large.

Lens slugs for filenames: `general`, `sysadmin`, `gamedesigner`, `ceo`, `visual`.

## Output rules (keep the orchestrator's context small)

- **Every agent writes its own report to a file.** The orchestrator assigns each agent a filename when it spawns it: `hosting_game_raw/wave{N}_{lens}_{informed|fresh}.md`. The agent writes its full report there, organized under the 10 categories.
- **Agents reply with one line only:** `DONE — wrote hosting_game_raw/wave2_sysadmin_informed.md` (or `FAILED — <reason>`). No ideas, no summary, nothing else in the reply. If an agent reports FAILED, or its file is missing or empty, re-spawn that one agent with the same assignment.
- **Informed agents read `hosting_game.md` from disk themselves.** The orchestrator does not paste it into their prompt.
- **Merging is delegated.** The orchestrator never reads the raw reports. After each wave it spawns one merge agent (see below) and waits for its one-line confirmation.
- The orchestrator's job is only: spawn agents with the right assignment and filename, collect one-line confirmations, re-spawn failures, and move to the next wave.

## Process

Run 4 waves — 5 agents in wave 1, then 10 agents in each of waves 2–4 — for 35 idea agents total, plus one merge agent per wave and one final cleanup agent.

**Wave 1** — 5 agents, all fresh (brief only, no existing ideas):
- 1 general, 1 sysadmin, 1 game designer, 1 CEO / marketing, 1 graphics / visual designer
- Files: `hosting_game_raw/wave1_{lens}_fresh.md`

Each generates as many ideas as possible across every category, writes its report, and replies DONE.

**Waves 2, 3, and 4** — 10 agents per wave:

*Informed agents* (5) — get the brief and are told to read the current `hosting_game.md` before starting. Instruct them to (a) come up with new ideas not already in the list, and (b) expand, refine, and improve what's already there — add mechanics, strengthen weak ideas, fill gaps, point out contradictions. Their report should contain both the new ideas and the improvements/expansions, clearly labeled.
- 1 general, 1 sysadmin, 1 game designer, 1 CEO / marketing, 1 graphics / visual designer
- Files: `hosting_game_raw/wave{N}_{lens}_informed.md`

*Fresh agents* (5) — get only the brief, exactly like wave 1. Do not tell them `hosting_game.md` exists; they're there for uncontaminated perspective.
- 1 general, 1 sysadmin, 1 game designer, 1 CEO / marketing, 1 graphics / visual designer
- Files: `hosting_game_raw/wave{N}_{lens}_fresh.md`

**Merge agent (one per wave, after all that wave's agents report DONE):** Reads every `hosting_game_raw/wave{N}_*.md` for the current wave plus the current `hosting_game.md` (if it exists), and rewrites `hosting_game.md` as a single organized document. Merge rules: dedupe overlapping ideas but keep the strongest version (or combine details from multiple versions); organize under the 10 categories; do not drop ideas to save space — the goal is comprehensiveness; if two ideas contradict, keep both and note the tension; apply the informed agents' improvements to the existing entries rather than listing them separately. The raw reports stay on disk untouched. Replies with one line: `DONE — merged wave N into hosting_game.md` (or FAILED).

**Final cleanup agent (after wave 4's merge):** Reads `hosting_game.md` and rewrites it with consistent structure, a short summary at the top of the most promising ideas, and a closing section of open design questions that still need decisions. Replies with one line when done.
