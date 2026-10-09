# Group g24 audit — §9 head + 9.1 Modes, 9.2 Twists, 9.3 Humour, 9.4 Meta — lines 32668-34501

## MANIFEST
line|level|heading|STATUS|hash(es)|note
32679|2|9.1 Modes|PARTIAL|74f157b|SaveMode enum + write-access matrix shipped, mode loops absent, tiering OD-16 open
32681|3|Campaign|PARTIAL|9e701a0 74f157b|campaign SaveMode + full-write rows, no pivot map or act loop shipped
32694|3|Endless / Survival ("The NOC" / "The Long Haul" / "Keep It Running")|PROBLEM|74f157b|endless rows held PENDING_OD8 (32 rows contested) per DECISIONS-PENDING OD-8, no loop shipped
32709|3|Incident Mode / Blitz Sev-1|PARTIAL|74f157b|blitz SaveMode LIVE write rows, no incident generator or par-time machinery
32728|3|The Consultant (the 20-minute roguelite this design is secretly perfect for)|PARTIAL|74f157b|consultant SaveMode LIVE write rows, toolbag/job-loop absent
32744|3|Roguelite Run Mode ("Bootstrapped")|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 scope, not in SAVE_MODES enum, Consultant-vs-Bootstrapped tension unadjudicated
32756|3|Puzzle Mode ("Root Cause") and The Postmortem Puzzle|MISSING|-|deferred: MASTER_REPORT §7, replay/causality factor-set machinery (b9295b5) is the unbuilt-mode substrate
32768|3|Daily Outage / Daily Incident / Scenario Weekly|PARTIAL|74f157b|daily SaveMode LIVE write rows, shared-seed distribution and leaderboard absent
32780|3|Sandbox / Architect / Lab / Zen / "Rack Builder"|PARTIAL|1b9b3ba 74f157b|App.vue sandbox view (mock-runner canvas) + ledger-only sandbox law, no stress-test or photo affordances
32797|3|Co-op NOC (asymmetric information)|MISSING|-|deferred: ADR-0004 co-op law ratified but engine slice unbuilt, per-seat projection machinery exists (observed/view.ts 55a6086)
32818|3|Co-op: Ops and Commercial ("Two Departments" / "Two-Person On-Call")|MISSING|-|deferred: ADR-0004 lane unbuilt, OD-9 co-op save ownership open
32828|3|Versus / Red vs Blue (and the drafted-deck version)|PARTIAL|2421257 7607361|drafted deck/draft/commit/match headless engine + eight-wave forced anchors shipped, no live session transport or UI
32849|3|Attacker Mode / Reverse TD interlude|MISSING|-|deferred: MASTER_REPORT §7, versus threat-deck drafting (2421257) is adjacent machinery, codex-marking reward loop absent
32863|3|Async "Attack My Network"|MISSING|-|deferred: ADR-0004 names it stretch goal, versus commits authored decks not player boards
32872|3|Competitive Market Mode / Market Share|MISSING|-|deferred: line 33149 itself names it probably-never stretch, nothing shipped
32882|3|Hot-seat: "Two Companies, One Keyboard"|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 scope
32892|3|Historical Scenarios / Historical Reenactments|MISSING|-|deferred: MASTER_REPORT §7, era machinery partial (era-tokens 4ff4a4f, i18n era variants 08d4fe2), reenactment content absent
32905|3|Historical Campaign / Through the Eras|MISSING|-|deferred: MASTER_REPORT §7, only two eras exist (1998/2026), era expansion open item
32915|3|Campaign+ / New Game+ / "The Incumbent"|MISSING|-|deferred: MASTER_REPORT §7, depends on unbuilt campaign
32923|3|Minimalist Mode|MISSING|-|deferred: OD-16 unratified (Minimalist glyph ⇄ Shape-First a11y skin), no glyph set authored
32934|3|Speedrun ("Zero to Nines" / "Zero to Rack" / "Ship It")|MISSING|-|deferred: MASTER_REPORT §7, no timer-goals shell
32941|3|Hardcore / Ironman / On-Call|MISSING|-|deferred: MASTER_REPORT §7, scars facet storage exists (9e701a0) but toggle unshipped
32947|3|The business modes|MISSING|-|deferred: MASTER_REPORT §7, none of the eleven presets authored
32978|3|Mode: The Analyst|MISSING|-|deferred: MASTER_REPORT §7, diligence data-room shell absent
32988|3|Mode: Auditor Mode (post-game)|MISSING|-|deferred: MASTER_REPORT §7, replay verify+bisection (b9295b5) is the unbuilt-mode machinery
32995|3|Mode: The Agent|MISSING|-|deferred: MASTER_REPORT §7, channel/reseller economy unmodeled
33002|3|Mode: Quarter Close|MISSING|-|deferred: MASTER_REPORT §7, GATE-G5 quarter sim (0a2f1ca) is adjacent showcase not this mode
33008|3|Mode: The Investor Update|MISSING|-|deferred: MASTER_REPORT §7, metric-emphasis choice unimplemented
33017|3|Line Draft|MISSING|-|deferred: MASTER_REPORT §7, versus/draft offer-pick machinery (2421257) drafts decks not hosting lines
33029|3|One Building, Four Lines|MISSING|-|deferred: only shared-web and game-slices exist, multi-line facility level unauthored
33037|3|Landlord vs Tenant|MISSING|-|deferred: MASTER_REPORT §7, colo line unbuilt
33044|3|Tenant Mode / The Inverted Level|MISSING|-|deferred: MASTER_REPORT §7
33054|3|The Night Shift / "On-Call Night"|MISSING|-|deferred: MASTER_REPORT §7
33063|3|The Handover|MISSING|-|deferred: OD-16 says SP-Handover ships regardless but unratified, handover.* advisory copy in packs (08d4fe2) is the only artifact
33074|3|Chaos Mode|MISSING|-|deferred: MASTER_REPORT §7, whatIf kill-deltas (a864061) adjacent, no every-N-minutes modifier
33080|3|The Sunset (the decommissioning level)|MISSING|-|deferred: MASTER_REPORT §7, door disconnect+drain verbs (c253643) are the only removal verbs, decommission level unauthored
33090|3|Succession / The Handoff|PARTIAL|9e701a0|SuccessionType + ExitKind + lineage-node model shipped, 90-days-without-you autoplay scoring absent
33097|3|The Pager Simulator|MISSING|-|unlisted: mobile companion nowhere in plan or code
33105|3|Blind Mode|MISSING|-|deferred: MASTER_REPORT §7, observed fog (55a6086) is the shipping substrate, no zero-telemetry mode
33115|3|The Same Outage Six Ways|MISSING|-|deferred: Phase-1 shipped one hosting line slice, showcase mode unauthored
33122|3|Museum Mode / The Era Gallery|PARTIAL|9e701a0 4ff4a4f|readMuseum union view + exhibit records + two-era token set shipped, no walkable gallery or diorama content
33128|3|Photo Contest / Rack Gallery|MISSING|-|unlisted: community gallery nowhere in plan or code
33137|3|⚔️ Mode tiering — twenty-six modes is too many, and none of them are prioritised|PROBLEM|-|OD-16 open in DECISIONS-PENDING (ratify ~15 orphan re-tierings), tiering adopted-as-law nowhere
33159|2|9.2 Twists and systemic wildcards|PARTIAL|a864061 55a6086|twist-delivery machinery partial (whatIf harness, Long Weekend, fog, causality), most catalog entries unbuilt
33161|3|Your Past Self Is The Boss|PARTIAL|9e701a0|habit-tracker schema shipped (docRate standardizationRate snowflakesLeft overPermissionCount via Scrapbook face), aged-board generator absent
33180|3|The Architectural Bad-Habit library|MISSING|-|deferred: MASTER_REPORT §7, named-habit generator library unauthored (habits fields are counters not a library)
33197|3|The Inherited Mess / The Inherited System|MISSING|-|deferred: MASTER_REPORT §7, procedural anti-pattern board generator absent
33208|3|The Ghost of the Previous Admin|MISSING|-|deferred: MASTER_REPORT §7, ghosts facet (9e701a0) serves churned-customer ghosts not admin folklore
33216|3|The Legacy Box / "The Do Not Reboot Machine"|MISSING|-|unlisted: no do-not-reboot object anywhere in code or plan
33228|3|Documentation as a mechanic|PARTIAL|9e701a0|wiki entries + docRate habit counters + staff documented-field storage shipped, hover/runbook/delegation verbs absent
33250|3|Technical debt as visible substance|MISSING|-|deferred: MASTER_REPORT §7, no debt meter in pipeline or economy (only debtPayoffLatencyMin habit field)
33267|3|The Slow Boss|MISSING|-|unlisted: trend-line antagonist unmodeled
33274|3|The On-Call Clock|MISSING|-|deferred: MASTER_REPORT §7, onCallTurn/morale/fatigue are save-schema fields only
33280|3|The Vacation mechanic|MISSING|-|deferred: MASTER_REPORT §7, no staff-absence scheduler
33293|3|Career Mode — a life outside the pager|MISSING|-|deferred: MASTER_REPORT §7, no player-life meter
33306|3|The 3AM toggle and The 2am Rule|MISSING|-|deferred: MASTER_REPORT §7, no mistake-probability-by-clock model
33317|3|Rubber Duck and The Second Opinion|MISSING|-|deferred: MASTER_REPORT §7, ExplainValue popover (chrome) is adjacent hint furniture not the duck
33328|3|Vendor Personalities — the full counterparty cast|MISSING|-|deferred: MASTER_REPORT §7, vendor.reply.* pack copy (08d4fe2) is bank not cast, trust stats absent
33356|3|The vendor prices to your switching cost|MISSING|-|unlisted: switching-cost pricing model absent
33367|3|You become the vendor squeezing someone else|MISSING|-|unlisted: wholesale mirror level absent
33375|3|The customer who is also your investor|MISSING|-|deferred: MASTER_REPORT §7, customerBooks treatment dimensions could host it (9e701a0) but dual-role unmodeled
33382|3|The founders' agreement|MISSING|-|unlisted: co-founder NPC absent
33389|3|The Personal Guarantee|MISSING|-|unlisted: personal-liability flag absent
33397|3|Regulatory Weather / Regulatory Drift|MISSING|-|deferred: MASTER_REPORT §7, no regulation timeline
33407|3|Community Bug Reports|MISSING|-|deferred: MASTER_REPORT §7, reputation-driven early reports unmodeled
33413|3|The Threat You Can Hire|MISSING|-|deferred: MASTER_REPORT §7, hire-attacker consequences unmodeled
33426|3|Defend Someone Else|MISSING|-|deferred: MASTER_REPORT §7, guest-level machinery absent
33433|3|The Dependency Web|PARTIAL|5a10383|internal dependency graph shipped (MultiGraph 4 relations + blast radius + powerFeeds chains), external-provider outages absent
33450|3|The Hidden Dependency / The Dependency Nobody Knew About|MISSING|-|deferred: MASTER_REPORT §7, door refuses power cycles but reveal-on-failure hidden edges unmodeled
33459|3|Shared World Events|MISSING|-|deferred: MASTER_REPORT §7, no global event layer
33466|3|The Seasonal Calendar / Seasons|MISSING|-|deferred: MASTER_REPORT §7, seasonalityPhase is a save field only, wave tables carry no calendar
33477|3|Market Cycles|MISSING|-|deferred: MASTER_REPORT §7, no macro index
33486|3|"It's Always DNS" (with an honest counter)|MISSING|-|deferred: MASTER_REPORT §7, causeId taxonomy exists (b9295b5) but category-distribution counter unshipped
33504|3|The Unreliable Dashboard|PARTIAL|55a6086|staleness + fog-filtered reads + Readout Mode shipped in observed layer, lying-collector cases not modeled
33514|3|The Reveal Mechanic (your own infrastructure as fog of war)|PARTIAL|55a6086|fog-over-state law shipped ("fog is over the state never the existence"), observability-purchase lighting unmodeled
33523|3|Metric Gaming|MISSING|-|deferred: MASTER_REPORT §7, reputation value exists but uptime-vs-reputation divergence unmodeled
33530|3|Everything Is Someone's Fault, Nothing Is Simple|PARTIAL|b9295b5|traceContributingFactors + redHerrings factor-set machinery shipped, blame-assignment minigame and morale cost absent
33539|3|Difficulty via Honesty ("Sysadmin Mode")|MISSING|-|deferred: MASTER_REPORT §7, no hint-removal difficulty tier
33557|3|The Pivot|MISSING|-|deferred: §5.6 pivot machinery unbuilt, nothing shipped in this repo
33562|3|You Can Fire Customers (and its quieter sibling)|MISSING|-|deferred: MASTER_REPORT §7, churn and dunning ship (economy) but player-initiated termination absent
33573|3|The One Customer Who Is Always Right / The Unremovable Customer|MISSING|-|unlisted: bespoke-tenant lock-in NPC unmodeled
33581|3|The "Unlimited" Trap|MISSING|-|unlisted: oversell-plan trap unmodeled
33588|3|The Legacy Plan|MISSING|-|unlisted: grandfathered-plan growth trap unmodeled
33594|3|The Handshake Deal|MISSING|-|unlisted: undocumented-promise surfacing unmodeled (treatment log 9e701a0 could host it)
33600|3|Every Decision Has a Receipt / the time-delayed consequence engine|PARTIAL|9e701a0|attributionEvents + treatment event store ship as receipt substrate, future-scheduled consequence engine absent
33614|3|The Camera Is a Camera|MISSING|-|deferred: MASTER_REPORT §7, visibility-loss view degradation unmodeled (fog adjacent)
33633|3|The Investor Dashboard Lie|MISSING|-|deferred: MASTER_REPORT §7, diligence payoff loop absent
33645|3|Postmortem Publishing and the Status Page Voice|PARTIAL|08d4fe2 9e701a0|euphemism copy + PostmortemRecord (published flag blameMode) shipped, wording-choice mechanics absent
33662|3|The Compliance Theater Meter|MISSING|-|unlisted: theater dual-stat absent
33676|3|The RFP Minigame|MISSING|-|unlisted: questionnaire minigame absent
33685|3|The Migration Weekend|MISSING|-|unlisted: cutover sub-level absent
33692|3|Named Disasters|MISSING|-|unlisted: recurring named-event series unauthored
33700|3|The Green Dilemma|MISSING|-|unlisted: sustainability track absent
33711|3|Reversible Bad Ideas|NA|-|design-law heading (never block with a dialog), honored by the engine's permissive semantic-refusal architecture not by code
33720|3|The Ethics Track|MISSING|-|deferred: OD-16 ethics standing-author law unratified, bulletproof line unbuilt
33732|3|You Are the Attacker's Target Board|PARTIAL|0a2f1ca|GATE-G2 derives threat invitations and newly-spawnable pool from your own board (attack-surface legibility), recon-tool aesthetic absent
33740|3|The Conference Talk|MISSING|-|unlisted: fame/tradeoff event absent
33747|3|The marketing site on your own infra|MISSING|-|unlisted: dogfooding dependency absent
33754|3|The customer who becomes a competitor|MISSING|-|unlisted: competitor-emergence sim absent
33762|3|The acquisition offer you should refuse|MISSING|-|unlisted: earnout-trap offer absent
33768|3|Weather Affects Everything — scoped|MISSING|-|unlisted: weather modifier absent
33784|3|The Hardware Lottery and the Uptime Superstition|MISSING|-|unlisted: per-unit variance and staff-authored sticky folklore absent (sticky.* pack copy only)
33800|3|Reputation Has a Face|MISSING|-|unlisted: personified reputation cast absent, numeric reputation ships (economy + HUD cells)
33813|3|The Line That Eats You|MISSING|-|deferred: OD-7 accounting menu open (transfer pricing and cost allocation unmodeled)
33825|3|The Hardware Afterlife|PARTIAL|9e701a0|machine biography schema ships (serials installedAtTick retiredAtTick deadDrives in Scrapbook face), downgrade-ladder lifecycle unmodeled
33834|3|Reverse Colo|MISSING|-|unlisted: tenant-side level absent
33841|3|"Works On My Machine" (the card, and the customer)|MISSING|-|unlisted: joke card and pattern customer absent (achievement.* pack naming aside)
33852|3|The Missing Screw|MISSING|-|unlisted: task-variance friction absent
33863|3|The Beeping Server|MISSING|-|unlisted: audio-hunt minigame absent
33875|3|The What Would Break tool|PARTIAL|a864061 4389737 e1190d1|whatIf removeNode/disableDefense/trafficSurge with exact bisection + Sim Lab tab shipped, in-sandbox 4x play-and-rewind UI absent
33886|3|The Long Weekend (an offline/idle layer)|DONE|a864061 4389737|fastForward.ts is literally the Long Weekend engine, 2880-tick cap, no-catastrophe guardrail halts, full report, host-side on-close persistence is a later shell lane
33899|3|The Company Handbook|MISSING|-|deferred: MASTER_REPORT §7, policy-store card machinery (1fb4fc6) is the substrate, handbook-vs-behaviour check unmodeled
33909|3|The Board Meeting|MISSING|-|deferred: MASTER_REPORT §7, scoring sheets ship static (24dfcfe), rubric-choice interstitial absent
33916|3|The "It's Fine" counter|MISSING|-|unlisted: dismissed-alert counter unshipped (alertStack tracks actioned/SNR adjacent)
33922|3|The Hardest Lesson, Delivered Once|MISSING|-|unlisted: authored reprice-up level unauthored
33932|2|9.3 Humour and tone|PARTIAL|08d4fe2|copy bank of 102+75 templates with flavour namespaces for nearly every heading shipped, zero UI consumers of flavour lines
33934|3|Recognition comedy, not parody|PARTIAL|08d4fe2|decision/flavour root wall + sober-during-decision clauses enforced by validate.mjs, runtime surfaces too young to violate it
33952|3|The ticket text generator|PARTIAL|08d4fe2 354261d|ticket.* (25+11 templates) + abuse.* shipped and loader-resolvable, procedural combinator and ticket UI absent
33979|3|Server naming and the label maker|MISSING|-|deferred: MASTER_REPORT §7, naming-scheme generator and MTTR effects unmodeled
34002|3|The label maker that ran out of tape|MISSING|-|unlisted: only the chatter.quiet.label-tape line ships (08d4fe2)
34008|3|The cable colour war|MISSING|-|unlisted: unresolved-convention gag unshipped
34014|3|The sticky note system|PARTIAL|08d4fe2|sticky.note.* copy shipped (reboot/dave/temp), player-placeable notes and bulk-op exclusion unmodeled
34022|3|The Intern's Log|PARTIAL|08d4fe2|intern.entry.* copy shipped (one per pack), diary rendering absent
34034|3|Achievements|PARTIAL|08d4fe2 9e701a0|achievement.* name copy + medals/codex facets ship, unlock-condition engine and printed-asset-tag UI absent
34069|3|Outage Bingo|MISSING|-|unlisted: bingo card absent
34077|3|The fictional trade press and the Competitor Obituary Feed|PARTIAL|08d4fe2|press.headline.obit-* copy ships verbatim, no ticker consumer or competitor state feeding it
34089|3|The industry forum thread|PARTIAL|08d4fe2|forum.thread.tier-1..4 escalation ladder ships verbatim, live reputation-reactive forum absent
34097|3|The Trade Radio|MISSING|-|unlisted: three-bus audio seam exists (28f638e) but no radio content channel
34106|3|The status page euphemism ladder — and its commercial twin|PARTIAL|08d4fe2|status.rung-1..5 verbatim in BOTH packs decision namespace, player-wording-choice mechanic unshipped
34119|3|The vendor comedy channel|PARTIAL|08d4fe2|vendor.reply.* ×4 per pack ships (firmware/log-bundle/known-issue), hold music and renewal-notice mail unshipped
34129|3|The maintenance notification nobody reads|PARTIAL|08d4fe2|canary.notice.window + canary.early-cohort copy ships, three-beat mechanic unmodeled
34136|3|The office set dressing|MISSING|-|unlisted: Handmade Layer unbuilt (chatter.quiet.amber-led line only)
34154|3|The Office Cat|MISSING|-|unlisted: heat-indicator cat NPC absent
34161|3|The Legacy Server With a Name|MISSING|-|unlisted: named-inheritance ceremony absent
34168|3|The certificate whose CN is `localhost`|MISSING|-|unlisted: one-line gag unshipped
34171|3|"Restart it."|MISSING|-|unlisted: support macro unshipped
34174|3|The on-call handoff note that says only "quiet night"|MISSING|-|unlisted: gag unshipped (handover.* advisories are different lines)
34177|3|The Advisor Voicemail|MISSING|-|unlisted: mentor audio channel absent
34184|3|The corporate comedy set|MISSING|-|unlisted: four business-side bits unshipped
34195|3|Cameo Customers|MISSING|-|deferred: MASTER_REPORT §7, visitors registry ships (packages/content) but era-named customer/logo generator absent
34205|3|The Post-It with the root password|MISSING|-|unlisted: collectible unshipped
34208|3|The RFC 2324 easter egg|MISSING|-|unlisted: 418 coffee machine unshipped
34211|3|The Cursed Basement|MISSING|-|unlisted: joke tutorial level unauthored
34219|3|The Postmortem Blog|MISSING|-|deferred: MASTER_REPORT §7, postmortem data already ships (9e701a0) but era-styled blog renderer absent
34227|3|The Ops Diary Comic|MISSING|-|unlisted: auto-comic generator absent
34234|3|Loading-screen tips that are real advice|PARTIAL|08d4fe2|loading.tip.* ×8+4 verbatim ships, no loading screen renders them
34243|3|Staff chatter|PARTIAL|08d4fe2|chatter.quiet.* + chatter.cascade.* lines ship, ambient dialogue system absent
34249|3|The rm -rf moment|MISSING|-|unlisted: confirm-by-typing hazard unshipped
34260|2|9.4 Meta systems|PARTIAL|9e701a0|the one-Company-object engine ships, most sub-systems are schema + face-reads without generators or screens
34262|3|⚔️ One persistent Company object, four faces|DONE|9e701a0 74f157b|save/faces.ts wall/scrapbook/almanac/people readFace dispatcher + museum union ratified R-3, write side under Matrix B, WS-7 screens are contractually downstream
34277|3|The Long Save|DONE|9e701a0 74f157b|company lineage tree + canonical envelope + mode write-access matrix shipped (commit title THE LONG SAVE), cross-mode writes gated per Matrix B
34286|3|The Playbook|PARTIAL|9e701a0 74f157b|PlaybookSlotRecord schema + write-matrix rows ship, slot-carry and re-earn-automation loop unmodeled
34297|3|The Company Wiki / Knowledge Base|PARTIAL|9e701a0|wiki entries with authorStaffId exposed via People face ship, authoring UI and export absent
34304|3|The Alumni Network|PARTIAL|9e701a0|AlumniRecord (sentiment rehireDarkened currentCompany) ships, referral/competition behaviour engine absent
34312|3|Career Mode for Staff|PARTIAL|9e701a0|StaffRecord arcStage careerLog skillNodesHeld morale fatigue ship, arc-progression engine absent
34319|3|The Persistent Reputation Ledger|DONE|9e701a0|treatment.ts append-only treatment-event ledger with grudge/reference/deposition queries, exactly the heading's flagship quotes
34326|3|The Annual Report|PARTIAL|9e701a0|annualReports refs + globalRecords ride the Almanac face, six-page document generator absent
34339|3|The Anniversary|MISSING|-|unlisted: yearly interstitial unshipped
34346|3|The Ops Almanac|PARTIAL|9e701a0|records/finances/theMultiple read via Almanac face ships, worst-outage accumulation content absent
34354|3|Industry Benchmarks|MISSING|-|unlisted: only benchmarksContextRef schema slot ships (9e701a0)
34360|3|The Uptime Streak — one shared, persistent, cross-mode object|DONE|9e701a0 74f157b|streaks.ts shared cross-mode counters at save root with break-as-event and erase stamp, cross-mode sharing enforced via streaksShared Matrix-B writes
34371|3|The Postmortem Wall / The Postmortem Reading Room|PARTIAL|9e701a0|PostmortemRecord polaroid/hint/cost/blameMode via Scrapbook face ships, reading-room library and Intel conversion absent
34384|3|The Company Museum|PARTIAL|9e701a0|MuseumExhibitRecord + readMuseum tour view ship, floorplan and wing rendering are WS-7 lanes
34403|3|The Museum Docent|PARTIAL|9e701a0|treatment events carry verbatim quotable summaries explicitly docent-ready, tour-script generator absent
34411|3|The Company Wall|PARTIAL|9e701a0|readWall (credentials medals first-dollar streaks) ships, in-office rendering absent
34417|3|Business Mix Panel|MISSING|-|unlisted: revenue-by-line pie and diversification score unshipped
34425|3|Procedural label text|MISSING|-|unlisted: label generators unshipped
34432|3|The diegetic settings menu — per era|PARTIAL|4ff4a4f 40faf58|era token set (1998/2026) + live era-state switch ship as the prerequisite, per-era settings screens unshipped
34443|3|Screenshot watermark|MISSING|-|unlisted: export lane is §9.7, nothing shipped
34453|3|Modding the skin kit — and the Ruleset Card as a shipped editor|PARTIAL|b3a149d|Five-Asset Kit compiler + kit.json + make-kit CLI + card-as-shipped-data ship, editor UI and Instrument Design Language dependency absent
34476|3|The tutorial is a job|MISSING|-|deferred: MASTER_REPORT §7, no onboarding fiction built
34483|3|The Ending camera move|MISSING|-|deferred: MASTER_REPORT §7, CameraRig (4ff4a4f) exists but no ending sequences

## SUMMARY
DONE: 5
PARTIAL: 47
PROBLEM: 2
MISSING: 117
NA: 1
TOTAL: 172

Row-count self-verify: 172 rows written = 172 `##`+`###` headings on disk in lines 32668-34501 (4 `##` + 168 `###`; orchestrator's "5 ##" counted the level-1 `# 9. Anything else` at 32668, which is out of manifest scope — disk trusted). All hashes pass `git cat-file -e` at master tip 58f5186.

## TOP-PROBLEMS
1. **Endless/Survival (32694, PROBLEM)** — the mode people play most is the one still contested: 32 of its write-matrix rows stay PENDING_OD8 after the 2026-10-09 Matrix B ratification (74f157b), and `guardBatch` throws on exercising one; no endless loop exists either way.
2. **Mode tiering (33137, PROBLEM)** — 26+ modes listed, none prioritized in code; OD-16 (ratify ~15 orphan re-tierings, Minimalist⇄Shape-First a11y skin, SP-Handover, ethics law) is open in DECISIONS-PENDING, so all of 9.1 is scaffolding whose target list is unratified.
3. **9.3 is a copy bank with no mouth** — 08d4fe2 ships ticket/press/forum/chatter/loading/sticky/vendor/intern/achievement/canary templates (with era variants) and the loader resolves them (354261d), but zero UI consumes any flavour key; every 9.3 PARTIAL collapses to MISSING the moment content-delivery work lands.
4. **Versus is a headless engine, not a game mode (32828)** — deck/draft/commit/match + memoization shipped (2421257, 7607361) including the eight timed-wave anchor law, but there is no transport, opponent, or shell; the mode-tiering note "ship the draft version first because it costs almost no new simulation" is half-true: the simulation cost is paid, the 95% around it is not.
5. **Co-op entirely unbuilt** — ADR-0004's ratified co-op scenario law has engine adjacency (per-seat observed projection, 55a6086) but both co-op headings (32797, 32818) are MISSING and OD-9 (co-op save ownership) stays open.
6. **9.4 meta systems are face-reads over empty drawers** — the architecture is DONE (four faces, Long Save, streaks, treatment ledger — 9e701a0/74f157b), but no simulation-to-save bridge exists: nothing in pipeline/economy appends a scar, record, postmortem, or treatment event yet, so all thirteen PARTIAL sub-systems are storage contracts awaiting their first writer.
