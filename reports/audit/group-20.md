# Group g20 audit — §7 Core gameplay mechanics (7.1–7.6) — lines 25651-27379

## MANIFEST

25653|2|7.1 The board: flow, topology, and the two directions|DONE|e2f69d3 8fd409a|Parent. Board-as-graph realized: topology MultiGraph + twelve-step pipeline; gates G1/G4 built exactly to prove 7.1-7.3 (6f5da38).
25655|3|The dependency graph IS the map|DONE|e2f69d3 8fd409a|topology/ four-relation multigraph IS the board state; pipeline walks it per tick; no separate map structure exists.
25673|3|Two-directional flow (the core tension)|DONE|8fd409a 6f5da38|One shared pipe carries visitors and adversarial units; G1 acceptance counts neutralized/landed/in-flight on the same lane (gate-g1.test.ts).
25688|3|The Funnel (depth is a resource)|PARTIAL|8fd409a|Hop-depth paths exist and G4 latency math prices each hop, but depth is not a purchasable/managed resource; no funnel-pressure mechanic.
25696|3|The Return Path|DONE|8fd409a b7e262c|referralProbability/returnProbability drafts at serve (pipeline/defaults.ts:131,827-876); egress/bandwidth billing in economy lane.
25705|3|The mixed lane|DONE|8fd409a 6f5da38|Gold and threats share the lane unclassified; false-positive counter (blockedFalsePositive) proves mixed-lane tension in G1.
25715|3|Service lanes (isolation as a purchasable property)|PARTIAL|8fd409a|LaneStats metering real; lane isolation not purchasable — no per-lane QoS good; spill modeled only via capacity/rho.
25725|3|Capacity as concurrency slots, not HP|DONE|8fd409a b4481b5 2eaf830|Slots-not-HP core law; createDefaultSlots; hard-ceiling shed now TERMINATES (2eaf830 behavior fix).
25749|3|The queueing hockey-stick|DONE|8fd409a 41fcdd2|latency = service x rho/(1-rho) in defaults/queue; G4 effectiveHopUs saturation formula; FIX-8 keeps queue honest under load.
25759|3|Backpressure and the red tide|PARTIAL|fca91f1 41fcdd2 b4481b5|BackpressureInExt + UNIT_HOLD + terminal purge real; retry re-entry real; upstream red-tide crawl per dependency not measured as propagating backpressure.
25771|3|Blast radius as a first-class concept|DONE|e2f69d3 5a10383|topology/blast.ts flood domains over DomainSet; pair-keyed projection cache; racks degrade-all per T-9 (8a5f413).
25784|3|The Blast Radius of a Person|MISSING|deferred:|-|Staffing/person blast radius outside Phase-1 gate scope; no person entities in topology.
25794|3|Effective vs nominal redundancy|PARTIAL|e2f69d3 5a10383 8a5f413|redundancy.ts computes shared power/path domains (correlated-by-circuit); shared software/human/time legs and broken-N+1 badge not computed.
25817|3|Bottleneck highlight|MISSING|deferred:|-|Zero grep hits for bottleneck in sim-core or proto src; §8 presentation mechanic unbuilt.
25830|3|Topology matters: chokepoints vs meshes|PARTIAL|e2f69d3|Graph shape + blast/powerFeeds expose chokepoints structurally; no measured pressure difference between mesh and single-path boards yet.
25837|3|Multiple valid paths, and the routing rule that chooses between them|PARTIAL|1fb4fc6|policy/routing.ts is ALERT routing (severity/destination/escalation, cycles caught); traffic/LB path-choice rules not implemented.
25847|3|Path preference and failover order|MISSING|deferred:|-|No failover-order engine; units walk declared paths only; grep failover order = zero.
25854|3|Traffic steering (routing is still a choice, even without mazing)|MISSING|deferred:|-|Zero steering/multi-carrier mechanics; arrivals follow envelope-to-node defaults.
25864|3|Saturation cascade (emergent, not scripted)|DONE|8fd409a fca91f1|Retry storms emergent from bounces + patience LUT; retry-storm.test.ts pins endogenous cascade; no scripted surge triggers.
25874|3|The entrance and the goal|DONE|8fd409a 4ce67fc|types.ts SLOT 2 goal node; served/landed terminals at goal (defaults.ts:785-813); per-type goal shaping is content-corpus work.
25882|3|DNS is the first hop|MISSING|deferred:|-|DNS-level content absent from g1 corpus slices; no DNS hop in wave tables.
25891|3|Out-of-band entry points (threats that don't use the front door)|PARTIAL|e2f69d3 8a5f413|Power relation is a genuine second path in (utility feed to PDU tree, degradable); insider/supply-chain spawn-inside threats not implemented.
25901|3|Capacity as terrain|PARTIAL|faf81a7|LaneStats rho/queueDepth stamped into observed cells and HUD chips; board-as-chart mote rendering is §8 and unmounted.
25910|2|7.2 Connections: the central interaction|DONE|0a2f1ca 1b9b3ba|Parent. GATE-G4 drag-a-cable is the phase-1 proof-of-concept for this exact section (48 panel tests + 19 headless).
25918|3|Drag-a-cable (the recommended primary interaction)|DONE|0a2f1ca|G4GatePanel pointerdown/move/up with live latency ladder preview over port hotspots; terms card confirm/cancel.
25942|3|Click-to-link (the accessibility fallback, never second-class)|DONE|0a2f1ca|Enter-arm/Enter-target keyboard path; gate-g4 headless proves drag and click digests byte-identical.
25949|3|Wiring Mode|DONE|0a2f1ca|W-key mode toggles dim (saturate .28) + port glow; documented deliberate deviation from TAB.
25960|3|The Port Row (shape-coded sockets)|DONE|0a2f1ca|portShapes.ts R32: trapezoid/kettle/circle/slot per relation with dash identity.
25967|3|Ports as a finite resource — with type and speed|DONE|e2f69d3 0a2f1ca|sockets.ts typed needs/provides, slot-occupied refusal; link.ts negotiate-down flagged; LED rendering is §8.
25981|3|Link Objects Are First-Class (the connection is a game object, not a line)|DONE|e2f69d3|topology/link.ts side table keyed by edge id with per-link telemetry; buying per-link upgrades not wired (beads are config).
25992|3|Connection contracts (the link carries the policy) and the Policy Bead Set|DONE|e2f69d3|POLICY_BEADS closed 8-shape enum, ordered, dupes illegal; findTimeoutViolations enforces monotonic budget-shrink law; bead rendering §8.
26019|3|Contracts are cables (one gesture for technical and commercial links)|PARTIAL|1fb4fc6 b7e262c|Commercial contracts exist as economy data and policy cards commit through the door; single-gesture commercial drag not implemented.
26031|3|Contract-driven pathing (contracts as level geometry)|MISSING|deferred:|-|Contracts never constrain routing (routing itself unbuilt for traffic).
26042|3|Link health rendering (and the non-colour channels)|MISSING|deferred:|-|§8 presentation lane; no link-health visuals in proto.
26053|3|The Packet Bead Simulation|PARTIAL|4ff4a4f 0a2f1ca|flow layer + SmokeField motes exist; per-bead speed/spacing/loss-wink packets not simulated.
26061|3|Logical links are dashed; physical links are solid|PARTIAL|0a2f1ca|G4 dashes encode RELATION (R32), not logical-vs-physical layer split; the two layers themselves are not both drawn.
26069|3|Physical vs logical vs documented: three views that can disagree|MISSING|deferred:|-|Reconciler rung-4 card type still unratified (DECISIONS-PENDING batch); only the physical/logical graph exists.
26095|3|Two Boards, Two Scales (Rack View and Topology View)|PARTIAL|4ff4a4f e2f69d3|Camera Z1-Z4 altitude ladder + rack-grid physical index exist as data; no Rack-view/Topology-view morph.
26105|3|Typed sockets: needs and provides|DONE|e2f69d3 0a2f1ca|sockets.ts canConnect + refusalReason(needs,provides) preflight; G4 socket grammar tests pin it.
26114|3|Four topologies, one board — and how much of each you actually wire|DONE|e2f69d3 8fd409a|One MultiGraph carries data/power/control/trust with per-relation door grammar (power-cycle refusal proves relation semantics).
26132|3|Adjacency bonuses, not adjacency requirements|DONE|e2f69d3|physical.ts ADJACENCY_LATENCY_TABLE (:100) ships the exact numbers; classifyPlacement scores adjacency, never requires it.
26144|3|Adjacency auto-link (tutorial-only, then taken away)|MISSING|deferred:|-|No tutorial level in Phase-1 scope.
26153|3|Cable types and length costs|PARTIAL|e2f69d3|Adjacency classes price cross-room/rack/building/metro LATENCY; cable type catalog and length dollar costs unbuilt.
26169|3|Bundling and the trunk|MISSING|deferred:|-|No bundle/trunk aggregation structures.
26178|3|Auto-route vs hand-route, and the Ugly Auto-Route|MISSING|deferred:|-|Door never names auto-routing; every edge is hand-minted.
26191|3|Declared intent (the endgame of wiring)|PARTIAL|1fb4fc6|Policy Book rows are declarative and auto-fire (rule phase), but nothing generates or reconciles wiring from declared intent.
26202|3|Firewall rules as gates on the cable|PARTIAL|e2f69d3|firewall bead exists on links (L3/L4 allow-list alphabet); rule editing/strictness pass not wired to flow.
26209|3|VLAN painting / segmentation|MISSING|deferred:|-|No segmentation layer in topology.
26220|3|Dependency ghosting / the Dependency Reveal|PARTIAL|e2f69d3|dependents/powerFeeds chains computable (blast.ts, graph.ts); hover-reveal interaction not shipped.
26228|3|Dependency auto-discovery (fog over your own topology)|MISSING|deferred:|-|Discovery-by-traffic scenario not implemented; fog degrades values, not existence of edges.
26236|3|Miswiring is allowed|DONE|e2f69d3 5a10383|Door permits both PSUs fed from one PDU (only slot-occupied/cycle refusals); redundancy.ts then computes the shared-feed trap; overlay absence noted.
26244|3|The Patch Panel and the Patch Panel Widget|MISSING|deferred:|-|No patch-panel indirection object.
26254|3|Bus Mode|MISSING|deferred:|-|No shared-bus edge mode.
26260|3|Templates, snap groups, blueprints and the stamp|MISSING|deferred:|-|No build templates; board edits are one-intent-at-a-time.
26269|3|Auto-Cable (pay a tech to do it)|MISSING|deferred:|-|No tech labor entity.
26276|3|Disconnect is dangerous; drain is the verb|DONE|c253643 62ffbeb|Opt-in drainPolicy: hand token IS the pending-disconnect record, edge-draining refusal, drained continuation; v0 plain-pull default documented; G4 click offers drain.
26292|3|Cable management score|MISSING|deferred:|-|No aesthetic score.
26304|3|The Mystery Cable and the toner probe|MISSING|deferred:|-|No undocumented-edge discovery gameplay.
26312|3|Collapse to meta-node (readability at wiring scale)|MISSING|deferred:|-|§8 readability mechanic; unbuilt.
26320|3|Cross-connect wiring as revenue|MISSING|deferred:|-|No interconnection revenue product line.
26329|2|7.3 Placement and space|DONE|e2f69d3|Parent. Placement machinery (validator, refusals, nested grid) real; preview/thermal/weight layers thin.
26331|3|Nested grids (floor to row to rack to U)|DONE|e2f69d3|physical.ts createPhysicalIndex models floor/row/rack/U nesting with adjacency classification.
26340|3|Rack U Tetris — made strategic by conflicting constraints|PARTIAL|e2f69d3 0a2f1ca|U-space + rack-profile kind constraints enforced (placement-rejected detail); power/thermal/latency/blast constraints exist as DATA but do not collide at placement time.
26355|3|Power budget per circuit|PARTIAL|e2f69d3 8a5f413|derate80 MW rule + protective-device circuit ownership + power-domain blast semantics; no amp draw accumulating until a breaker trips per tick.
26364|3|The placement loop (ghost, refusal icon, and live preview as one interaction)|PARTIAL|8fd409a 0a2f1ca|canPlaceDevice validator seam + placement-rejected refusal with detail icon in G4 palette; ghost preview and live amp/thermal preview not shipped.
26380|3|The Blast Radius Preview (hover-before-you-buy)|PARTIAL|e2f69d3 0a2f1ca|blastDomains API computes radii; G2 shows surface-growth previews at purchase; placement-hover blast not wired.
26389|3|The Fit Check (why the thing didn't go in the rack)|PARTIAL|e2f69d3 0a2f1ca|Refusal detail names the reason; delta: spec wants wasted-time-but-not-rejected plus a 5-checklist (depth/rails/weight absent); door rejects instead of costing time.
26399|3|Thermal map / hot aisle management|PARTIAL|e2f69d3|thermalCouplingFixed(distance) models heat coupling between placements; no aisle topology, no pooling, no overlay.
26409|3|Airflow arrows and light airflow simulation|MISSING|deferred:|-|No airflow model.
26417|3|Adjacency effects|DONE|e2f69d3 8a5f413|Same-rack = shared power domain (powerFeeds), shared blast domain (rack anchor degrades members), adjacency latency priced — three real co-location effects.
26425|3|Zones and blast domains|DONE|e2f69d3|domains.ts DomainSet tiers (rack/row/room/building/metro) + blast.ts flood; per-zone cost tiers not modeled.
26433|3|Weight, floor loading and centre of gravity|MISSING|deferred:|-|No weight physics.
26442|3|The Floor Tile Grid, the Row Stamp and the Rack Template|MISSING|deferred:|-|physical.ts nests floors but has no tile grid, clearance rules, stamps or templates (grep tile/clearance zero).
26452|3|Latency geometry (when the board is a map)|PARTIAL|e2f69d3|Adjacency table prices same-metro and cross-region hops; world-map/PoP geographic placement not a gameplay surface.
26460|3|Placement is a commercial decision too|MISSING|deferred:|-|Placement never touches economy (no per-site pricing/lease decisions).
26468|3|Move cost, downtime and legacy placement debt|MISSING|deferred:|-|No relocation verb; devices appear and vanish only via place/implicit retention.
26476|3|Undo ghost|MISSING|deferred:|-|Door has no undo; placement errors persist.
26485|2|7.4 Upgrades|PARTIAL|55a6086 b1f757e|Parent. Thinnest subsection vs build: instrument-binding upgrades + ROC depth verbs exist; the hardware upgrade economy is unbuilt (matches plan: no upgrade lane in Phase-1).
26487|3|Upgrade paths, not upgrade levels|MISSING|deferred:|-|No device upgrade trees; device kinds are flat.
26494|3|Upgrades as sidegrades: every capability has a cost somewhere else|MISSING|deferred:|-|No cost-coupled upgrade tradeoff mechanic.
26509|3|Upgrades improve the ROC curve, not the damage number|PARTIAL|b1f757e 6f5da38|ConfigureNode inspectionDepth (pass-through/challenge/...) shifts the ROC — gate-g3 S5 pins byte-identical damage + FP-arm change; no upgrade CARD carrying the curve delta.
26518|3|Scale up vs scale out|PARTIAL|8fd409a|Door places N units and per-node slots allow both shapes; the up-vs-out decision is not surfaced as an upgrade choice with measured tradeoff.
26525|3|Tuning instead of levels|PARTIAL|1fb4fc6|Policy Book tuning-as-rows realized (rules are data, edited not coded); per-object slider/preset/snowflake budget not implemented.
26550|3|Config snapshot and restore (as a gameplay verb)|PARTIAL|b9295b5 9e701a0|Replay checkpoints/snapshots and THE LONG SAVE capture full state; no player-facing named config-snapshot verb in the door.
26560|3|Tuning cost|DONE|8fd409a|ConfigureNode occupies hands per §7.5 reference durations (intent-door.ts:175-178); restart-capacity dip not modeled.
26567|3|Soft caps and diminishing returns|MISSING|deferred:|-|No diminishing-returns curves on repeated buys.
26573|3|Retrofit vs rebuild|MISSING|deferred:|-|No retrofit path.
26579|3|In-place vs replace (the downtime question)|MISSING|deferred:|-|Replacement-downtime choice unbuilt.
26589|3|Firmware and patch cadence|MISSING|deferred:|-|Firmware appears only as threat-family vocabulary; no patch-cadence state.
26598|3|Efficiency upgrades|MISSING|deferred:|-|No power-efficiency purchases despite derate/thermal data existing.
26605|3|Cross-building buffs|MISSING|deferred:|-|No adjacency-buff economy.
26612|3|Physical module insertion (bolt-on upgrades are the upgrade UI)|MISSING|deferred:|-|No module slots.
26621|3|The Plating Pass and tier rim-lights|MISSING|deferred:|-|§8 visual tier language unbuilt (era tokens only).
26630|3|Upgrade regret and the parts bin|MISSING|deferred:|-|No salvage/resale.
26639|2|7.5 Time, tempo, and player actions|DONE|8fd409a 1b9b3ba|Parent. The action economy (hands, durations, pause-with-orders) is among the best-realized sections; the change-management workflow layer is not.
26641|3|Pause with orders|DONE|8fd409a 1b9b3ba|Door queues ExternalIntents stamped tick+1 and executes on resume; halt envelope in protocol.ts; G4 step-button demos the pattern (frosted visual §8).
26656|3|Speed controls, with a catch|PARTIAL|1b9b3ba b1f757e|SpeedX 1/2/4 validated (bad values refused via M2 grammar); the catch — observation fidelity loss at speed — and auto-downgrade policy not wired.
26680|3|Auto-pause on severity|MISSING|deferred:|-|No auto-pause setting in door, runner or chrome.
26687|3|Hands as action slots|DONE|8fd409a b1f757e|Hand tokens with capacity default 2 per §7.5, busyUntilTick/busyCauseId, hands-exhausted refusal; per-tier ladder and difficulty ratio config open.
26702|3|Actions cost time, not mana — split into duration and attendance|PARTIAL|8fd409a|Per-verb occupancyTicks = reference durations honored; intent-door.ts:177 docblocks the v0 collapse (attendance == duration; unattended-job split needs a scheduler).
26718|3|The pager and triage|PARTIAL|faf81a7|alertStack groups/severity/snooze/SNR capping real; assigning a hand to an alert (triage as verb) not built; Triage Window still unratified.
26726|3|Severity classification as a player choice|PARTIAL|faf81a7 1fb4fc6|sev-1..4 vocabularies exist (policy/routing + chip); classification is emitted by rules, not chosen by the player.
26734|3|Incident Mode|MISSING|deferred:|-|No verb-set-shifting mode.
26747|3|Communicate is an action|PARTIAL|8fd409a|Communicate verb (2-tick hand, empty-note refusal) exists; reputation/customer-response payoff not wired.
26755|3|The Runbook Quick-Bar|PARTIAL|9e701a0|Runbook ladder as data with MTTR bonus + knowledge decay (save/node.ts:422-435); quick-bar UI and incident-button invocation unbuilt.
26762|3|Maintenance windows|PARTIAL|b7e262c|economy config has maintenance-window spend category (PROVISIONAL 3600n) and contract maintenance-exclusion clause; declaration verb and customer-override calendar unbuilt.
26783|3|The Settling Window and Change Interference|MISSING|deferred:|-|No post-change settling window (economy settling hits are invoice settlement, unrelated).
26798|3|The Change Budget|MISSING|deferred:|-|No per-period change allowance.
26806|3|The Change object (risk, window, rollback plan, freeze, commit-confirm)|PARTIAL|8fd409a b1f757e|Commit verb produces a hashed, replayable change object (card-hash, ruleBookHash); risk score, window, rollback plan, commit-confirm timer absent.
26817|3|The Change Request Flow|MISSING|deferred:|-|No approval pipeline.
26826|3|The Verification Step|MISSING|deferred:|-|replay/verify checks replay integrity, not the gameplay verify-after-change toggle.
26838|3|The Pre-Mortem|MISSING|deferred:|-|No pre-mortem action (whatIf is post-hoc sandbox, unattended lane).
26847|3|Drills and rehearsals as a scored action type|MISSING|deferred:|-|No drill verb.
26862|3|Change freeze|PARTIAL|1fb4fc6|Global Kill Switch freezes ALL automation with pending consults preserved (policy/store.ts:43, evaluator.ts:773); change-pileup bank economics unbuilt.
26873|3|Drain before reboot|DONE|c253643|Cross-ref 7.2 drain: door phases pending-disconnect with hand as the record; opt-in flag documented.
26876|3|The Big Red Button — with a scope selector|MISSING|deferred:|-|No null-route/deny-all verb (grep zero).
26892|3|Degraded-mode toggles and the Degraded-Mode Console|PARTIAL|8fd409a 2eaf830|Shed machinery real: shedOrder/discipline via ConfigureNode, hard-ceiling shed terminates with roster exclusion; pre-configured degraded-mode console/toggle unbuilt.
26907|3|Active abilities with cooldowns (the spell layer)|MISSING|deferred:|-|No cooldown ability layer (hands+durations are the whole cost model so far).
26916|3|Ship-It-Friday|MISSING|deferred:|-|No risky-fast-change modifier mechanic.
26922|3|Undo window / rollback|MISSING|deferred:|-|No player rollback; driver exportPending (6e1503e) is crash-resume forensics, not undo.
26929|3|Capacity ordering with lead times|MISSING|deferred:|-|Procurement pipeline with lead times not a verb.
26939|3|The Inbox: decisions as cards|MISSING|deferred:|-|Decision-card copy exists in i18n packs (37 templates, 08d4fe2) but no inbox mechanic surfaces them as choices.
26964|3|The Lag Table (formerly the 90-day lag)|PARTIAL|b7e262c|Churn fuse seeds a 30-60 day lag band (economy/churn.ts:18-95) + contract cliffs/renewals = real lag lanes; unified lag table with variance rule unbuilt.
26985|3|The month as the tick|DONE|ff3249f b7e262c|Dual clock (SimTimeUs + business minutes, 43200/7 scale); monthly payroll/invoice cadence in economy; ClockRibbon renders both tracks (faf81a7).
26994|3|Autopilot and delegation policies|PARTIAL|1fb4fc6 2421257 a864061|Rule-phase autopilot auto-fires policies (versus + unattended fastForward with guardrails); delegation to staff personas unbuilt.
27008|3|Executive attention as a tiny pool, and the CEO Override|PARTIAL|8fd409a|Single tiny hands pool exists; exec-vs-hands dual ledger still an open OD friction (intent-door lane report); no CEO override verb.
27033|3|Chair switching with a cost|MISSING|deferred:|-|No role/chair switching.
27042|3|Night shift / the on-call clock / the 2am multiplier|MISSING|deferred:|-|policy/routing.ts docblock confirms: no day/night primitive exists; time-of-day leg queued as D-14.
27053|3|Patch lag|MISSING|deferred:|-|No patch-lag clock on defenses.
27060|3|Toil accumulation|MISSING|deferred:|-|No toil meter.
27067|3|Slow-mo incident cam|PARTIAL|4ff4a4f|CameraRig animates altitude with screen-invariant selection; incident auto-pounce trigger unbuilt.
27079|2|7.6 Information, fog, and diagnosis|DONE|55a6086|Parent. Ground-vs-observed is the most fully realized law in the repo (accepted at gate level).
27081|3|Ground Truth vs Observed Truth (the engine rule beneath this whole section)|DONE|55a6086 ff3249f|Two state stores by construction; UI reads observed cells only; digest and replay operate on ground; G1/G3 gate tests pin the split.
27098|3|Fog of infrastructure|DONE|55a6086 faf81a7|Per-property fog cell is THE binding contract (types.ts:163); value null + coverage 0 when uninstrumented; UNVERIFIED chip state ships.
27113|3|Bounded Fog (the fairness contract)|PARTIAL|b9295b5|Replay can attribute every visible effect (causeIds complete); the fairness rule (hand-diagnosis within 4-8x) not enforced; site-preview/pulse-strip channels exist only as store fields.
27126|3|Telemetry Resolution|DONE|55a6086|ResolutionBand None-Coarse-Medium-Fine-Exact (types.ts:156) bound per cell; instrument classes are purchasable binding upgrades (observed/instrument.ts:30); storage-vs-resolution price split not modeled.
27148|3|Symptom vs cause|DONE|8fd409a b9295b5|Every bounce/serve/shed event carries causeId; causality.ts traces contributing factors; dedicated investigate-cost action not a door verb.
27156|3|The two diagnostic modes: What changed? vs What grew?|MISSING|deferred:|-|Change-overlay vs growth-overlay lens pair unbuilt (Board Diff also absent).
27165|3|Confidence as a diagnostic resource|DONE|55a6086 6f5da38|ObservedCell.confidence drives routing decisions; G3 fold Pi(1-ci) and express/deep split prove it as a spent resource.
27175|3|Red herrings|DONE|b9295b5|CausalTrace ships redHerrings lanes (same-tick window + same-subject) so postmortems name them explicitly (causality.ts:135-143).
27191|3|Alert fatigue as a mechanic|DONE|faf81a7 1fb4fc6|alertStack SNR-thresholded display caps with suppressed-by-fatigue overflow; alert routing table closes the production side.
27202|3|MTTD and MTTR as separate stats|PARTIAL|9e701a0|MTTR bonus ladder with knowledge decay in save/node.ts:422-435; MTTD stat absent (grep zero); per-incident detect/repair timing not measured.
27208|3|The everything is green trap — and its two siblings|DONE|55a6086|Stale and unknown cells (band + certainty) ship — G1 instruments demo live/stale-p50/unknown-p99 trio; second-vantage and synthetic-monitor unlocks unbuilt.
27224|3|The dashboard as a weapon|MISSING|deferred:|-|Monitoring-buildables not mounted as gameplay goods.
27233|3|The overlay wheel, specified|MISSING|deferred:|-|§8 input mechanic unbuilt.
27248|3|The overlay palette table|MISSING|deferred:|-|Visual language table has no rendering consumer yet.
27257|3|Security-surface overlay as literal brightness|PARTIAL|47b2c33 0a2f1ca|Per-node attack-surface exposure computed (G2 deriveInvitations/spawnable pool); brightness overlay not rendered.
27268|3|Capacity headroom overlay|PARTIAL|8fd409a|Per-node rho/queueDepth real in cells and gauges (unattended lane); headroom lens not drawn.
27274|3|Maintenance debt overlay, split into three wear channels|MISSING|deferred:|-|No wear channels exist to overlay.
27283|3|The log panel|PARTIAL|0a2f1ca|G4 receipt-log and G5 notices ticker render real sim events with i18n copy; filter and scrub-back not implemented.
27295|3|The in-game terminal|MISSING|deferred:|-|No terminal toy surface.
27323|3|The Is It Actually Down? check|MISSING|deferred:|-|Second-vantage check verb absent (grep zero).
27330|3|The Change Log (documentation as a mechanic)|PARTIAL|8fd409a b1f757e|Every action logs causeId + detail + clientLabel (door receipts exclude label from digest by design); labeling-quality bonus mechanic unbuilt.
27339|3|The Decision Highlight (making the board's choices legible)|PARTIAL|4ff4a4f|Budget marks DECISIONS category cap 3 (render/budget.ts) but ZERO producers call it — bucket reserved, no decision emitter.
27350|3|The Board Diff (what changed since you last looked)|MISSING|deferred:|-|save compare diffs code units, not board state deltas.
27360|3|The Watchlist (pin what you're worried about)|PARTIAL|faf81a7|User pins exist for HUD rows/clocks (toggleUserPin, promotion.ts); object-pinning with sparkline and LOD exemption not built.
27370|3|The Attention Heatmap (a post-level self-portrait)|MISSING|deferred:|-|No attention telemetry to aggregate.

## SUMMARY

- Rows: 157 (6 `##` + 151 `###`; self-verified against outline inventory — matches /tmp/opencode/g20-headings.txt)
- DONE: 42
- PARTIAL: 50
- PROBLEM: 0
- MISSING: 65
- NA: 0
- Per subsection (DONE/PARTIAL/MISSING): 7.1 = 10/8/5 · 7.2 = 13/8/16 · 7.3 = 4/7/6 · 7.4 = 1/5/11 · 7.5 = 5/14/18 · 7.6 = 9/8/9

## TOP-PROBLEMS

1. §7.4 Upgrades is the chapter's dead zone: 11 of 16 headings MISSING — no upgrade trees, sidegrade costs, retrofit/replace, firmware cadence, or module insertion; only tuning-cost-via-hands and ROC-depth-via-Configure exist.
2. Traffic routing is entirely absent while the spec treats it as load-bearing (§7.1 routing rules, failover order, traffic steering; §7.2 contract-driven pathing): policy/routing.ts routes ALERTS only — a common misreading risk since the filename says routing.
3. Fit Check delta (§7.3:26389): spec demands mis-placement wastes time but never hard-rejects; the door's canPlaceDevice HARD-refuses with placement-rejected — inverted acceptance model, deliberate and documented but a true spec-vs-impl divergence.
4. Change-management workflow (§7.5:26783-26847) unbuilt as a chain: Settling Window, Change Budget, Change Request Flow, Verification Step, Pre-Mortem, Drills — only the Commit-object substrate and Kill-Switch freeze exist.
5. Decision Highlight (§7.6:27339) is a reserved-but-empty seam: BudgetManager DECISIONS cap ships with zero producers repo-wide — the "choices legible" loop is scaffolded, never fed.
6. Duration-vs-attendance collapse (§7.5:26702) acknowledged in intent-door.ts:177 as needing a scheduler — unattended jobs (RAID 19h/0-hands), the spec's headline tempo example, cannot be expressed today.
7. Person/staff blast radius (§7.1:25784) and night-shift clock (§7.5:27042, D-14 blocked) mean several §7 "human" lanes wait on an owner decision, not on code.
