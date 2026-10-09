# Group g21 audit — §7.7–§7.16 — lines 27380-28896

## MANIFEST
line|level|heading|STATUS|hash(es)|note
27380|2|7.7 Failure, recovery, and consequence|PARTIAL|8fd409a 2eaf830|failure ENGINE (shed bounce degrade) strong, recovery family (cold-start restore failback) unbuilt
27382|3|Degradation, not destruction (the anti-tower-defense principle)|DONE|8fd409a|slots-not-HP: queue-then-latency-then-bounce law, LaneStats.health R-73, pipeline/defaults.ts
27391|3|Graceful degradation, pre-configured — and the Degradation Ladder editor|PARTIAL|b1f757e|engine rungs exist (ConfigureNode inspectionDepth+shedOrder via door); ladder editor UI + Site-Preview consequence render absent
27410|3|Load shedding (and why it requires peacetime work)|DONE|2eaf830 8fd409a|hard-ceiling shed terminates units, step-5 shed path, qos-classify precondition step exists, shed-terminal.test.ts
27417|3|Granularity of sacrifice (the triage ladder)|PARTIAL|8fd409a|ShedOrder union incl lowest-value-first/qos-weighted in types.ts:300; nine-rung per-rung clickable reversible ladder not built
27429|3|Circuit breakers|PARTIAL|e2f69d3|breaker declared in link alphabet topology/link.ts:34 (fuse-open semantics); no open/half-open runtime behavior in pipeline
27440|3|Cascades with a visible fuse|PARTIAL|0a2f1ca|g1 fuse beads render from LaneStats (gates/g1); cascade travel animation + 1.5s-per-hop decoupling + breaker-stops-cascade not wired
27453|3|Brownouts over blackouts|PARTIAL|8fd409a|saturation/brownout states real via rho-queue-bounce continuum; deliberate player-initiated brownout ability absent
27461|3|Partial failure states (enumerated and rendered)|PARTIAL|faf81a7 55a6086|chrome 12-vocab StatusChip incl DEGRADED/UNVERIFIED, observed staleness+face/truth exist; the six-state enumeration and per-state renderings not implemented
27479|3|Gray failure (the component that is 40% working)|PARTIAL|55a6086|detection-investment machinery real (resolution bands, freshness, confidence fold); engine has no partial-drop/fault-injection node failure
27487|3|Failure states worth explicitly modelling|PARTIAL|8fd409a e2f69d3|dependency-block deadlock step 8, queue collapse, metastable retry-storm (retry-storm.test.ts), correlated failure via blast domains; split-brain/config-drift/silent-corruption absent
27498|3|The Second Failure Window|MISSING|-|deferred: PHASE1-PLAN scope - no redundancy-rebuild danger-window timer in sim or chrome
27508|3|The Failover Handoff|MISSING|-|deferred: crown sprite + active/passive failover behavior absent; failover exists only as policy grammar noun
27515|3|Recovery is gameplay (and recovery order matters)|MISSING|-|deferred: no cold-restart order puzzle; dependency order exists only structurally in topology graph
27534|3|The cold-start dependency cycle|MISSING|-|deferred: cycle detector exists (policy/graph.detectDirectedCycles) but no cold-start cycle view or bootstrap-path object
27546|3|Restore service or restore redundancy? (the recovery decision nobody states)|MISSING|-|deferred: recovery decision family not in Phase-1 build
27554|3|The cold-cache thundering herd|PARTIAL|8fd409a|retry-storm twin implemented (timeouts re-arrive as new arrivals step 11); cache tier / cold-cache admission absent
27562|3|Degradation Debt|MISSING|-|unlisted: no degraded-hours backlog accumulator; economy debt fields are bad-debt receivables not ops debt
27571|3|The Blast Door|PARTIAL|a864061 c253643|removeNode/disableDefense exist as whatIf primitives + drain verb choreography; no player-facing certain-damage containment verb
27581|3|Data loss is permanent|MISSING|-|deferred: no durability/data-loss modeling shipped (backup types deferred per content scope)
27589|3|The Corruption Horizon|MISSING|-|deferred: restore-point-in-time arithmetic absent with all backup mechanics
27597|3|Partial restore and prioritised recovery|MISSING|-|deferred: restore queue ordering mechanic unbuilt
27605|3|The Failback Problem|MISSING|-|deferred: secondary-site authority model out of Phase-1 scope
27614|3|The Reboot Roulette (state you didn't know you had)|MISSING|-|unlisted: Boot Confidence stat nowhere in sim-core or content
27628|3|The rollback, one-way doors, and the third category|MISSING|-|deferred: reversibility-window timers not built; only door hand-token refund (snapshot-undo) exists
27652|3|Salvage and the rebuild|MISSING|-|deferred: post-loss salvage state machine unbuilt
27659|3|The Post-Mortem (screen, sheet, and progression hook)|PARTIAL|b9295b5 6f5da38|machinery done: causality.ts traceContributingFactors + redHerrings, timeline replay harness, one-sentence attribution proven in gate-g5; sheet UI + Insight-point progression absent
27672|3|Root cause vs band-aid|MISSING|-|unlisted: no bandaid-vs-rootfix tracking; tech-debt accrual also absent
27679|3|The technical debt meters (four, not one)|MISSING|-|deferred: PHASE1-PLAN scope - five itemized debt meters unbuilt (commercial-debt fields exist only in save schema)
27706|3|The Blame vs Blameless choice|NA|-|editorial cross-reference to §5.4 (audited in g-sibling range), no own surface
27709|3|The death spiral and its three exits|PARTIAL|b7e262c|economy/runway.ts death-spiral detector LIVE (spiralFlagged, PROVISIONAL streaks); Shed/Fund/Fix exit cards absent
27721|3|The grace timer / the landlord at the door|PARTIAL|b7e262c|dunning FSM grace ladder live (economy/dunning.ts); named-person countdown face not built (i18n press/chatter voices adjacent)
27728|3|The repair loop: the Walk and the minigames|MISSING|-|deferred: staff-sprite physicality out of Phase-1 render scope
27739|2|7.8 Per-type mechanical shifts|PARTIAL|4ce67fc ef8f35e|two type bundles ship real mechanical differences + lint enforcement; single-type-in-play means most swaps are declarative only
27744|3|The Three-to-Five Change Rule (the variety budget, stated)|DONE|ef8f35e 4ce67fc|loader lint CHANGED_HOOKS per-baseline vs canonical anchor; shipped pair changes 5 of 9 hooks (within 3-5), core verbs unchanged in both bundles
27754|3|The scarce-resource meter swaps|PARTIAL|ff3249f 4ce67fc|BundleScarce.resourceId/meterWidget shipped in both type bundles (concurrency-slots vs tick-budget) + lint; HUD meter swap not wired
27764|3|The commercial slider swaps (the fourth axis)|PARTIAL|4ce67fc|commercialSlider declared per bundle (oversell-ratio vs ddos-protection-tier); no live dial in economy
27773|3|Per-type sliders (the operational signature dial)|PARTIAL|4ce67fc b1f757e|operationalDials declared; inspection-depth-default dial genuinely live via door ConfigureNode
27780|3|Time granularity changes|PARTIAL|4ce67fc ff3249f|BundleTempo.simTimeScale/permanentIncidentClock parsed (game-servers ms+permanent); engine runs one sim-time scale
27788|3|What "pathing" means changes|PARTIAL|ef8f35e 4ce67fc|pathing-semantics lint rule R19 + per-type diurnal baselines (web-midday vs evening-peak) ship; Gantt/tour/delegation-chain pathings deferred with their types
27797|3|Control granularity as a difficulty axis — across four independent scales|PARTIAL|4ce67fc|control.pips{hardware,software,network,data} in bundle schema (shared-web 1/1/1/1, game-servers _todo); four-pip badge not rendered
27813|3|Keyhole mode|PARTIAL|4ce67fc|control.keyhole flag parsed from bundle; ask/advise/escort/escalate verb set not built
27821|3|The Window mechanic (backup, maintenance, satellite)|MISSING|-|deferred: windowGrows is a lint slot only; Gantt window mechanic ships with backup type
27827|3|The Queue mechanic (HPC, render, transcode, GPU)|DONE|8fd409a|the queue IS the mechanic: per-node FIFO with depth, hold, size-ceil multi-slot, hard-ceiling shed — pipeline step 5
27834|3|The Geography mechanic (CDN, game, edge, DNS anycast)|MISSING|-|deferred: world-map board variant out of Phase-1 scope (hop-count latency exists in g4 math)
27840|3|The Floor Plan mechanic (colo, wholesale)|PARTIAL|e2f69d3|nested rack/cabinet grids + power tree ship in topology; lease-rectangle packing/stranded-capacity gameplay absent
27847|3|The Durability mechanic (backup, archive, object storage)|MISSING|-|deferred: durability nines/restore-test ship with backup type
27854|3|The Reputation mechanic (email, bulletproof)|PARTIAL|faf81a7|reputation is a live metric (company::reputation HUD cell, g5 gauge, denominations vocab); reputation-gates-product-function absent
27860|3|Concurrency slots (VoIP, game servers)|DONE|8fd409a 2eaf830|hard simultaneous slot limits + hard-ceiling instant-deny discipline = binary capacity semantics live, multi-slot-completion.test.ts
27867|3|Unmanaged tenant objects|MISSING|-|deferred: unclickable-tenant objects ship with colo type (bundle control.unclickableObjects flag parses)
27874|3|Remote-site delay|MISSING|-|deferred: multi-site travel-time/remote-hands fee unbuilt
27881|3|Era-locked tech|PARTIAL|ef8f35e 17f3c8b|loader era resolution + 1998/2026 era state end-to-end ship; buildability gated by era not enforced in engine
27887|3|Multi-line tabs and the portfolio altitude|MISSING|-|deferred: Phase-1 = one line per run; versus deck is the only multi-face mode
27895|3|Time-axis connections (backup, archive)|MISSING|-|deferred: restore-point timeline ships with backup type
27902|3|Contract drag (colo, wholesale, enterprise)|PARTIAL|b7e262c|term months/years geometry + escalators persist in economy/contract.ts; year-scale lease levels absent
27908|3|The ticket-driven verb (colo cross-connects, remote hands, managed)|PARTIAL|08d4fe2|ticketPack field parses from bundles, ticket i18n flavour voices shipped; ticket queue as main board absent
27915|3|Per-type QoS answers|PARTIAL|4ce67fc|qosAnswer declared per bundle (scarce.shared-web.qos / scarce.game-servers.qos); engine does not select policy by type answer
27924|2|7.9 Meta-loops and rhythm|PARTIAL|47b2c33 faf81a7|rhythm machinery (envelopes/telegraph/director/clocks) strong; calendar/opportunity/progression loops thin
27926|3|Calm / storm rhythm|PARTIAL|47b2c33|envelope-over-continuous-baseline creates calm/storm texture (waves/generate.ts); 60/40 wall-clock targets unratified and unmeasured
27940|3|The weather forecast / threat radar|DONE|47b2c33 4ce67fc|telegraphBand per envelope + bands.ts weather/storm/hunter/entropy vocab + named-wave content (g1 waves telegraph strings); radar UI is gate-level
27950|3|The seasonality calendar|PARTIAL|4ce67fc|tempo.seasonality arrays ship in both bundles (renewal-cliff, launch-window, tournament-weekend...); visible calendar UI unbuilt
27959|3|Opportunity events|MISSING|-|deferred: positive-event mechanic absent; only press/forum/chatter flavour copy in i18n packs (08d4fe2 adjacent)
27975|3|Reputation as a slow resource|PARTIAL|faf81a7|monthly-scale slow stat exists as observed cell + HUD permanent row; damage-instant/repair-18-months asymmetry not modeled
27982|3|The three-clock rule|DONE|faf81a7|clockRibbon.ts two tracks + promotion.ts promotes exactly 3 by urgency×consequence with pins + capacity-refusal semantics
27998|3|The Difficulty Director with an honest face|PARTIAL|47b2c33|waves/director.ts by-construction limits (trough depth + entropy budget only, incident-locked, replay-logged draws); Heat gauge UI absent
28009|3|The month-end sequence as the business heartbeat|DONE|b7e262c 0a2f1ca|rollMonth/invoice/dunning/payroll cadence live in economy + g5 quarter view makes the heartbeat legible; board-meeting reckoning absent
28017|2|7.10 Path shaping: the Millisecond Budget, Inspection Depth, and Suspicion Routing|PARTIAL|8fd409a|three mechanics all engine-present but mazing is demo-grade: product runner pins expressPath==deepPath (simCoreRunner.ts:215-216)
28027|3|The Millisecond Budget (your real health bar)|PARTIAL|8fd409a 0a2f1ca|hop latency stamps + patience bounce + g4 Latency Ladder with before-commit delta are live; per-lane HUD budget bar and universal-comparator pricing not shipped
28049|3|Inspection Depth (the per-node ladder)|DONE|b1f757e 8fd409a|four depths live incl sample-1-in-20 per-unit forked sampling (defaults.ts:605-629), settable per node via door
28067|3|Suspicion Routing — the Two Lanes|PARTIAL|8fd409a 6f5da38|createRouteStep steers by confidence vs expressMaxConfidence, g3 proves mid-path demotion re-routing; main runner lanes identical, deep-lane building (player-lengthened route) absent
28107|3|The Suspicion Dial (every defense is a classifier with a false-positive rate)|PARTIAL|8fd409a 6f5da38|aggression slider + suspicionOf() FP engine live, g3 S5 ROC-shift byte-proven; per-device dial UI and 403-ghost visual product-side absent
28120|3|Classification confidence, not a boolean|PARTIAL|55a6086 8fd409a|Fixed confidence accumulates, threshold gates action (weight ladder + route split); histogram-with-draggable-line UI and BLOCKED/MISSED/FALSE-POSITIVE floats absent
28134|3|Threat units: Volume, Sophistication, Signature, Persistence|PARTIAL|4ce67fc|four-stat schema ships in threats/registry-core.json with all values null + _todo pending ratified tuning; no engine consumption of the three counter-axes
28144|3|Aggro shaping (the player's control over threat pathing)|MISSING|-|unlisted: attractiveness field (exposure×value×hardening) nowhere; g2 ledger invites threats but does not steer them
28162|3|The Attack Surface Ledger (capability and risk are the same purchase)|DONE|47b2c33 0a2f1ca|waves ledger + gates/g2 deriveInvitations/spawnablePool + THREAT_CATALOG 16 + gate-g2 13 golden tests + G5 mirror sync law
28179|2|7.11 QoS and traffic prioritisation|PARTIAL|8fd409a|classes exist as data+classification; contention behavior does not — queue service and shed order are class-blind
28186|3|QoS Classes and the Priority Ladder|PARTIAL|8fd409a|QosClassDef (weight/shedPriority/budgetUs/inspectionDepth) + sticky classify step 3 + classMix in LaneStats; hard-ceiling shed iterates queue FIFO ignoring shedPriority, queue never serves by weight (g20 uniform-degradation confirmed)
28217|3|Every hosting type has a different correct answer|PARTIAL|4ce67fc|per-type qosAnswer data field shipped in both bundles; nothing selects or enforces the answer
28229|3|Selling the ladder (priority as a product)|PARTIAL|b7e262c|types.ts:867 sold-class shed-respect comment + clause machinery exist; no sellable QoS tier product loop
28239|3|Fairness vs value (the visible, uncomfortable dial)|MISSING|-|unlisted: fairness hits are RNG rejection-sampling and versus-deck fairness, not a shed sort-order dial
28251|2|7.12 The resource model: what is actually scarce|PARTIAL|8fd409a ff3249f|money/hands/power/slots/error-budget real; six of eleven resources absent
28256|3|The eleven resources|PARTIAL|8fd409a e2f69d3|cash 6-bucket ledger, hands tokens (door capacity), power kW hierarchy (topology), slots, reputation metric; credit/cooling-thermal/IP/staff-hours-pool/lead-time absent, BundleScarce declares per-type scarcity
28282|3|Uptime Nines — the error budget as a spendable in-combat resource|DONE|b7e262c|economy/errorBudget.ts: budgetSecondsFor(commitmentBps), weekly index, burn accounting; g5 runs 99.9pct commitment live
28303|3|Capacity as the exchange rate between the two boards (the Bridge)|PARTIAL|b7e262c|contracts reserve against slots/bandwidth in economy+g5; over-signing gamble dial (oversell) and hard allocation coupling absent
28311|3|Staff-hours as the universal drain|PARTIAL|b1f757e|hands-per-action is the working drain (door occupancy table); shared staff-hour pool across tickets/audits/incidents is the open hands-vs-attention OD
28322|2|7.13 The simulation loop, written down|DONE|8fd409a ff3249f|this section is the shipped spine: 12 steps in TICK_STEP_ORDER, determinism battery in CI
28328|3|The tick, step by step|DONE|8fd409a ff3249f|TICK_STEP_ORDER (types.ts:673) implements all twelve steps incl dependency-hold step 8, patience bounce step 9, backpressure+retry re-arrival step 11, observed-write step 12
28366|3|Ground truth vs observed truth|DONE|55a6086 faf81a7|observed module step-12 gate + fog/freshness/coverage; every HUD read path goes through observed cells (proto reads only projections)
28371|3|The Time Model (one coherent clock scheme)|PARTIAL|ff3249f|sim-time µs + business scale 43200/7 pinned in kernel/time.ts with partition-safety law; incident-time 0.25x drop not implemented (SpeedX allows 1/2/4 only)
28385|3|The Dual Clock rule (and the thing it prevents)|DONE|faf81a7 ff3249f|ops and business clocks both visible in ClockRibbon two tracks, business advances independently of incident firefighting, action-belongs-to-one-clock law held in door/economy split
28397|3|The Wave Envelope (reconciling waves with continuous flow)|DONE|47b2c33|WaveEnvelope contract (types.ts:382) ramp/plateau/decay + telegraphed over continuous diurnal baseline; content 3-shape structural check in loader lint
28414|3|The Determinism and Fairness Contract|DONE|ff3249f b9295b5|seeded rng domains, replay ×100 harness gates in every module suite, CI determinism job over 14 dirs (cf7c7b0), explicable-run one-sentence attribution tested
28428|3|The correlated-event rule|PARTIAL|e2f69d3 b9295b5|correlated failure real via blast domains/shared dependency groups + causality parent chains; no multi-arm event generator (heatwave five-arm) and no arm-drawing postmortem
28441|2|7.14 Automation, standing policy, and the policy UI|PARTIAL|1fb4fc6 734ea56|policy engine is DONE-grade across the board; ghost/handoff/fleet rungs and authoring UI missing
28447|3|The Policy Book (standing rules as a first-class object)|DONE|1fb4fc6 734ea56|when/for/then/unless grammar, rows-not-code store, conflicts.ts shows order-shadowing and trigger clashes, fireLog rules-fired ticker, fused-index evaluator
28471|3|Ghost Hands (rendering automation)|MISSING|-|deferred: ghost-sprite population render out of Phase-1 render scope
28482|3|The Dry-Run Toggle|PARTIAL|1fb4fc6|evaluator live/shadow modes (store mode field, shadowEvaluationConfig) — dry-run semantics live; after-N-successful-shadow-firings arm offer absent
28489|3|Pre-authorized changes (planning as a buildable)|PARTIAL|1fb4fc6|standing trigger-armed rules cover condition-fires; one-shot queued change (fires once then disarms) not distinguished from standing policy
28497|3|The Kill Switch / Stop The Robots|PARTIAL|734ea56|frozen kill-switch verdict path in evaluator (shadow/live/kill-switch slot swap); Q-P3-1 kill-switch TTL owner-gated per DECISIONS-PENDING
28511|3|Delegation Bands|DONE|1fb4fc6|DelegationBand inform/consult/execute closed enum in contract (types.ts:756) wired into rule records and grammar target
28522|3|Delegation and subsystem ownership|MISSING|-|deferred: staff-owns-subsystem mechanic absent (staff morale field exists in save schema only)
28530|3|The Handoff (what the player must say to the machine)|MISSING|-|deferred: hand-written 3-line handoff mechanic absent; handoverNote is a static bundle field
28541|3|Runbook Cards|PARTIAL|9e701a0|save/node.ts U19/U38 runbook ladder (runbookId, stale/hollow runbook failure modes, MTTR bonus) — data+law live; drag-onto-incident card UI absent
28550|3|Alert routing|PARTIAL|1fb4fc6|policy/routing.ts severity→destination→escalation table + cycle detector (paging-yourself caught); time-of-day leg explicitly NOT invented — queued as D-14
28557|3|Batch and Fleet operations — as an earned capability, not a UI feature|MISSING|-|deferred: four-rung select-many→tag-query→standing-rules ladder with blast-radius preview unbuilt
28574|3|Policy authoring as the late-game verb|PARTIAL|1fb4fc6 2421257|autopilot rule-phase step runs policies unattended (createRulePhaseStep in versus + unattended fastForward); authoring is code-level, no card-composer UI
28586|2|7.15 The commercial board: the other half of the map|PARTIAL|b7e262c 0a2f1ca|economic machinery genuinely DONE; the board-as-physical-map (pipeline kanban of deals, negotiation table) not shipped
28595|3|The Pipeline Board|PARTIAL|0a2f1ca|g5 renewal kanban (5 cols incl offbook) is the same visual language; Lead→...→Signed sales pipeline with decay/capacity absent
28610|3|The Contract Card|DONE|b7e262c|contract.ts: MRR, term, SLA clauses incl MFN/audit-right, escalators, grandfather locks, renewal pulse, revenue quality bands; g5 whale-cliff + renewal cohort live
28619|3|The Deal Sheet (negotiation as clause-level trading)|MISSING|-|deferred: clause-trading minigame absent; clauses exist as static card data with repricing effects (MfnRepriceEvent)
28629|3|The Renewal Window|DONE|b7e262c|renewalPulseOpenMin 90-day pulse + resolveRenewalCliff (lapse vs renew) + g5 cliff-renewal at 126720 proven
28636|3|The Invoice Run|DONE|b7e262c 0a2f1ca|billing.ts monthly issue + cash-lands-with-delay + dunning failures + g5 minute-by-minute audit of the run
28643|3|The Churn Queue|PARTIAL|b7e262c|churn signals accumulate with reason (addChurnSignal) + GhostedForecast; limited monthly intervention actions absent
28650|3|The Abuse Queue|MISSING|-|deferred: abuse i18n flavour voices only (packs root vocab)
28656|3|The Ticket Queue|MISSING|-|deferred: ticket flavour copy only; aging-lane mechanic unbuilt
28664|3|The Phone|PARTIAL|b1f757e|communicate player verb live at the door (cost 2 hands); answer-costs-attention/prevents-churn loop absent
28671|3|The Capacity Planner|PARTIAL|a864061|whatIf forward-sim (removeNode/trafficSurge bisection) is forecasting muscle; committed-vs-contracted-vs-forecast chart absent
28679|3|The Oversell Dial|PARTIAL|4ce67fc|oversell-ratio declared as shared-web commercialSlider + correlation pressure real in topology; no dial, no oversubscription accounting
28687|3|The Pricing Console and the Rate Card as a live object|MISSING|-|deferred: GrandfatherLock concept exists in contract.ts; editable rate-card object absent
28696|3|Discount authority as a delegation slider|MISSING|-|deferred: delegation bands cover ops verbs only, not wallet authority
28703|3|The Two Books toggle|PARTIAL|b7e262c 0a2f1ca|both books computed (cash free-bucket vs accrualRevenue in g5); one-HUD-switch interaction not shipped
28712|3|The Commit Ledger|PARTIAL|faf81a7|obligations rail real (ClockRibbon RIGHT side = upcoming commitments) + commitmentBps error budgets; full owe-to-whom-until-when ledger absent
28719|3|The Quarter Close|PARTIAL|0a2f1ca|g5 makes one quarter playable+legible incl refund-stack/E-9-freeze quarter dynamics; pull-forward deals + recognition choices + borrowing streak tracker absent
28727|3|The Forecast Commit|MISSING|-|deferred: board-commitment pressure loop unbuilt
28735|3|The Board Meeting and the Advisor|MISSING|-|deferred: soft-timer objectives + old-operator advisor voice unbuilt
28743|3|The Org Chart|PARTIAL|9e701a0|staff records with morale Fixed field ship in save schema; hire/assign/burnout→outage loop absent
28750|3|The Budget Allocator|MISSING|-|deferred: marketing-spend allocation with late CAC attribution absent (marketing mentions are content flavour only)
28757|3|Delayed damage and the churn forecast|DONE|b7e262c|GhostedForecast + churn-signal fuse with lagged landing — the projected-churn-from-this-month-sins mechanic is literally named in churn.ts
28765|3|Insurance and hedges (things that do nothing until they do everything)|PARTIAL|9e701a0|insurancePremiumMicroUsd + personalGuarantees fields in save company-finance schema; contingent-purchase mechanic absent
28774|3|Business-shaped difficulty levers|PARTIAL|24dfcfe|tuning sheet B RATIFIED live (waves/pressure.ts ACTIVE_TUNING_SHEET); market conditions / starting posture / customer-mix levers absent
28786|2|7.16 Interaction laws and readability at scale|PARTIAL|4ff4a4f faf81a7|the enforced laws (icon budget, shape coding, label caps) are genuinely live; rack ribbon, quiet mode, selection pin layer missing
28791|3|Everything Is a Thing|PARTIAL|0a2f1ca faf81a7|diegetic objects exist (clock ribbon, panic layout, HUD lab, g4 cable drag); catalog-order→arrival→rack pipeline absent
28800|3|The Two-Action Rule|PARTIAL|b1f757e|every door verb is single-mint one-shot (≤2 inputs incl selection); the inspector Act-row-of-four layout not built
28811|3|The Selection Grammar|PARTIAL|faf81a7|pin concept live for clocks/metrics (toggleUserPin, capacity refusal semantics); object hover/select/pin triple + tethered mini-inspector absent
28822|3|The Squint Test (a design rule for every screen)|NA|-|design review heuristic with no implementation surface; cited in doc law only
28826|3|The Icon Budget|DONE|4ff4a4f 28d8b6b|BudgetManager hard caps per category enforced by renderer, overflow collapses to +N cluster badges, unknown-category admit throws loud
28833|3|Clustering with Intent|PARTIAL|4ff4a4f|budget cluster merge + LaneStats stats-not-entities law (aggregates not per-mote) ship; identical-adjacent-state region merging not rendered
28840|3|The Exception Spotlight|PARTIAL|faf81a7|panic dims non-essentials + alertStack low-SNR dim (<0.4); radial darkening around exceptions absent
28847|3|Motion as the Last Channel|PARTIAL|4ff4a4f c503d2d|0.5Hz global heartbeat law with desync-as-alarm (filters grain offsetZ phase) enshrines the channel order; idle-animation subtlety is render-craft not code
28855|3|Alert Taxonomy — exactly three tiers, three distinct looks|PARTIAL|1fb4fc6 4ff4a4f|4-severity vocab + KLAXON_PRIORITY 90 preemption + modal cap 1 (one klaxon, others queue) + alertStack grouping live; toast/badge/klaxon three-look spec only partially maps
28861|3|The Vignette Language|PARTIAL|4ff4a4f 1e6b306|hue ledger carries red final-state/gold money-moves/violet pre-classification/alarm klaxon as single-source vars; per-mood screen-edge vignette tint compositor absent
28868|3|The Rack Ribbon|MISSING|-|unlisted: no per-rack salience strip anywhere in chrome
28875|3|Quiet Mode|PARTIAL|faf81a7|panic-mode dimming is the nearest live mechanic; hide-everything-healthy toggle absent
28882|3|Colourblind shape-coding (every semantic colour also has a shape)|DONE|faf81a7 1e6b306|Two-Channel Law: all 12 StatusChip states carry distinct SVG notch glyphs + color, tests assert distinctness; hue ledger var-ified; hatching patterns mode absent
28888|3|Text Scale Independence and the Label Budget|PARTIAL|4ff4a4f|DOM chrome never scales with zoom (annotation layer + screenSpace law) and LABEL_CAP_BY_ALTITUDE budget enforced; user 75-200 pct UI scale reflow absent

## SUMMARY
DONE: 25
PARTIAL: 79
PROBLEM: 0
MISSING: 39
NA: 2

## TOP-PROBLEMS
1. **QoS is a label, not a behavior (27186/28186)** — QosClassDef carries weight/shedPriority/budgetUs and step-3 classifies stickily, but the hard-ceiling shed path iterates the queue in FIFO order ignoring shedPriority and the queue never serves by weight; congestion degrades all classes uniformly, which is exactly the opposite of §7.11's promise. (defaults.ts:525-529)
2. **Mazing exists only inside the G3 gate (28067)** — createRouteStep genuinely splits express/deep by confidence, but the product runner wires expressPath == deepPath (simCoreRunner.ts:215-216), so the shipped mainline never routes anything down a hostile lane; the strategic core §7.10 calls "the mechanic wave 1 was missing" is demonstrable but not playable in the default board.
3. **Whole recovery half of §7.7 is absent (27498-27605)** — Second Failure Window, Failover Handoff, recovery-order puzzle, cold-start cycle, restore prioritisation, failback: nine consecutive headings with zero surface, all legitimately out of Phase-1 scope but this makes "failure recovery consequence" currently only half of its name.
4. **Threat four-stats are null-valued scaffolding (28134)** — registry-core.json ships sophistication/volume/signature/persistence keys with every value null and _todo pending the tuning sheet; OD-2 sheet B went live at 24dfcfe but the content values were never filled, so the three-counter-axis defensive meta (28144 aggro-shaping also absent) cannot resolve.
5. **Commercial board ships as ledger, not as board (28595-28750)** — the economic engine (contracts/cliffs/renewals/dunning/churn-fuses/ghosted forecasts) is genuinely DONE, but the physical-board framing — sales-pipeline kanban with decay, deal-sheet trading, quarter-close choices, board meetings, org chart, pricing console — is one MISSING/PARTIAL row after another; only the renewal kanban and g5 quarter view gesture at it.
6. **Boot Confidence / Reboot Roulette and Degradation Debt are `unlisted:`** — nothing in PHASE1-PLAN, MODULE-STATUS, or the gap register mentions these mechanics at all; they are silent absences rather than tracked deferrals.
7. **Incident-time 0.25× clock (28371) never lands** — tempo data declares permanentIncidentClock for game-servers and kernel/time.ts pins business scale, but SpeedX only admits 1|2|4, so §7.13's "millisecond types run permanently slow-scale" is a declared-but-dead field.
