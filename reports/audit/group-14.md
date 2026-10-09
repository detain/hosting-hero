# Group g14 audit — hosting_game.md 4.5-4.8 (Defenses, Observability, Facility, Staff) — lines 16285-17937

## MANIFEST
line|level|heading|STATUS|hash(es)|note
16285|2|4.5 Defenses|PARTIAL|e24e1bb 8fd409a 4ce67fc|posture/depth law + coverage grid + 49-counter catalog ship, per-tower mechanics thin
16291|3|The Nine Defense Roles|PROBLEM|e24e1bb 4ce67fc|shipped taxonomy follows the §2.1 list (absent Block, added Negotiate) — contradicts this heading's enumeration
16319|3|The Coverage Grid|DONE|e24e1bb e1190d1|coverage/grid.ts 12x9 with dark/thin/ok/strong rungs + holePairs + secondAnswerGaps, lab hole-map panel
16331|3|Defense-in-Depth stacking rules|PROBLEM|e24e1bb|matrix.ts combine law is MAX never multiplicative (deliberate, docblock cites §2.1 ratification), no latency-additive/diminishing/synergy/Waste-Indicator
16350|3|Defenses live on edges, not on the board|PARTIAL|8fd409a|per-hop inspection at routeHops (defaults.ts step 7) models path-position, defenses remain NODES
16362|3|Every defense has an aggression slider|PARTIAL|ff3249f 0a2f1ca|one run-level Fixed aggression moves ROC never damage + catches/FP counters in gates, not per-defense, no log-only stage
16373|3|The Defense Off-State and the Mis-Tune State|PARTIAL|0a2f1ca|posture readable via door receipts + G3 ROC arms, amber-haze mis-tune render awaits mount (PHASE1-PLAN:165), no dust/cobweb art
16383|3|WAF (Web Application Firewall) — "The Sieve"|DONE|0a2f1ca 4ce67fc|G1/G3 waf-1 pass-through⇄challenge door verb + waf-virtual-patching counter, inline-vs-cloud latency split absent
16411|3|Rate Limiter (per-IP / per-endpoint / per-ASN) — "The Turnstile"|DONE|4ce67fc|l7/login/outbound/response rate-limit + per-ip-concurrency-cap counters in shipped registry, keying dims data-only
16431|3|CAPTCHA Gate / Challenge Gate|PARTIAL|ff3249f 0a2f1ca|challenge depth is the user-challenge ROC arm w/ benign FP price (G3), no named product or friction dial
16447|3|Bot Fingerprinter / Behavioural Analysis|DONE|4ce67fc|bot-fingerprinter Classify counter shipped, training/drift/poisoning mechanics absent
16468|3|MFA / Auth Hardening|DONE|4ce67fc|two-factor-enforcement counter + shared-web distinct buildable
16475|3|fail2ban / Dynamic Blocklist|DONE|4ce67fc|fail2ban Deter counter + distinct buildable shipped
16482|3|IDS / IPS Sentry — "The Radar Dish"|PARTIAL|8fd409a faf81a7|detect-vs-block depth law + suspicion ledger + chrome alert SNR fatigue ship, no IDS counter row
16500|3|Honeypot|MISSING|-|unlisted: flavor example string only (defenseRoles.ts), no counter or mechanic
16516|3|The Decoy and the Sacrificial Service (the Divert family)|MISSING|-|unlisted: decoy/sacrificial-IP appear only as role example strings, no shipped counters
16532|3|The Tarpit|MISSING|-|unlisted: Divert example string only
16538|3|The Sinkhole|PARTIAL|4ce67fc|remotely-triggered-blackhole Divert counter ships the null-route shape, no sinkhole capture instrumentation
16544|3|The Canary|MISSING|-|unlisted: no canary-detection counter, canary pack keys are deploy-side (see 16627)
16556|3|Canary Credentials / Honeytokens|MISSING|-|unlisted: no plan ADR or source mention found
16568|3|File Integrity Monitoring|MISSING|-|unlisted: FIM appears only as a Detect role example
16574|3|SBOM / Software Inventory|MISSING|-|unlisted: no plan ADR or source mention found
16584|3|Patch Cart / Patch Management|DONE|4ce67fc|managed-patching-service Recover counter + distinct buildable, patch-lag stat absent
16596|3|Golden Image Bakery|MISSING|-|unlisted: Rebuildability stat absent
16608|3|Immutable Rebuild Pipeline|MISSING|-|unlisted: no plan ADR or source mention found
16614|3|Circuit Breaker|MISSING|-|unlisted: Contain example string only, topology circuits are power-domain objects
16627|3|Canary Deploy Rig / Blue-Green / Gradual Rollout|DONE|4ce67fc 08d4fe2|staged-version-pinning counter + canary.pool-notice/staged-rollout pack templates shipped
16636|3|Feature Flags / Kill Switches|PARTIAL|1fb4fc6 ea7acee|global Kill Switch setFrozen + Q-P3-1 freeze semantics ratified, per-rule shadow/live modes only, no deploy flags
16643|3|Chaos Monkey / Chaos Engineering Lab / GameDay|MISSING|-|deferred: PHASE1-PLAN:133 cut list incl drills + U21 foresight instruments out of Phase-1 (MASTER_REPORT §7)
16654|3|Load Testing Rig|PARTIAL|a864061|whatIf trafficSurge forward-simulates load before it happens (unattended lane), no purchasable rig product
16660|3|Tabletop Exercise|MISSING|-|deferred: U21 purchasable-foresight out of Phase-1, sealState drilled persistence only
16668|3|The Break-Glass Safe|MISSING|-|unlisted: no plan ADR or source mention found
16677|3|Abuse Detection Pipeline|MISSING|-|deferred: machine half of the §4.9 desk (g15 range), abuse i18n flavour root shipped only
16686|3|Rate Limiting / Quota Engine (per-account resource caps)|DONE|4ce67fc|per-account-cgroup-caging + quota-policy-cgroups-lve + enforce-limits counters shipped
16696|2|4.6 Observability and response|PARTIAL|55a6086 faf81a7|observed layer + instrument classes + alert stack + error budget ship, runbook/IC/status layers thin
16698|3|Monitoring Stack (purchased in layers) — "The Watchtower"|PARTIAL|55a6086 faf81a7|InstrumentClass ladder (graphs-5min/30s/tracing/synthetic) + coverage% + fog + no-data-is-not-zero ship, 7-layer purchase table absent
16752|3|External / Synthetic Monitoring|PARTIAL|55a6086|CLASS_SYNTHETIC binary probe class ships, no external-vantage purchase layer
16759|3|External Vantage Fleet|MISSING|-|unlisted: no multi-ASN probes or N-of-M agreement mechanic
16770|3|The Synthetic Customer|MISSING|-|unlisted: full-customer-journey tenant absent, CLASS_SYNTHETIC is a binary probe
16779|3|Alerting / Pager / On-call Rotation|PARTIAL|faf81a7 1fb4fc6|alert stack ack/snooze/silence + SNR fatigue + escalation-role/runbook policy arms ship, pager rotation absent
16796|3|Tracing|PARTIAL|55a6086|CLASS_TRACING + per-event causeId causality chains (replay/causality.ts) ship, span model absent
16802|3|Status Page|PARTIAL|ff3249f 4ce67fc|communicate-verb status-line law + status-page counter ship, off-infra page object absent
16828|3|Runbook Library / Documentation|PARTIAL|9e701a0 1fb4fc6|PlaybookSlotRecord 6-rung ladder + run-runbook policy action + WikiEntryRecord ship, card-on-incident UI absent
16843|3|Postmortem Process (blameless)|PARTIAL|9e701a0|PostmortemRecord (rootCause/correct/blameMode/published/unlocks) persists, morale/recurrence effects not simmed
16853|3|Runbook Automation|PARTIAL|1fb4fc6 9e701a0|rules-are-rows interpreter + rung ladder ship, 3-manual-uses-to-rule promotion law absent
16862|3|Incident Command Structure|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 = six gates + P0 skeleton, R39 IC/Comms/Scribe roles unshipped
16878|3|The Escalation Matrix|PARTIAL|1fb4fc6|escalation to role/runbook arms in policy evaluator ship, matrix object/UI absent
16886|3|The MOP and the Go/No-Go|MISSING|-|deferred: R40 change-discipline out of Phase-1 scope (MASTER_REPORT §7)
16896|3|The Error Budget Policy|DONE|b7e262c|errorBudget.ts spendable-currency law incl 43m@99.9 exact seconds + risky-lock at zero + clean-week refund
16910|3|Auto-Scaler / Auto-Scaling Policy|MISSING|-|unlisted: no plan ADR or source mention found
16918|3|Config Management (Ansible/Puppet-alike) — "The Stencil"|MISSING|-|unlisted: no plan ADR or source mention found
16927|3|Deploy Pipeline / CI-CD|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 scope, risky-deploy error-budget action label only
16935|3|Container Registry / Package Mirror|MISSING|-|unlisted: no plan ADR or source mention found
16941|3|Certificate Automation (ACME)|MISSING|-|unlisted: no plan ADR or source mention found
16947|3|Asset Inventory / CMDB|PARTIAL|e2f69d3|TopologyGraph + physical nested index serve as inventory-of-record, CMDB attributes/verification absent
16954|3|The Secondary Everything Register|PARTIAL|e2f69d3|redundancy.ts shared-SPOF audit (circuit/switch/template/admin domains) ships, register UI absent
16962|3|Capacity Planning / Forecasting Model|MISSING|-|unlisted: churn ghosted-forecast (economy/churn.ts) is a different lane's object
16972|2|4.7 Facility|PARTIAL|e2f69d3 8a5f413|rack grid + power tree + blast + redundancy audit ship, thermal/genset/fire cut (PHASE1-PLAN:133)
16977|3|The Facility Section Cut|PARTIAL|0acf46e 27f2856|substrate tilemap seam + signed BUDGET_CAPS.substrate 1200 ship, mount HOLD — no section-cut render
16985|3|Rack / Cabinet|DONE|e2f69d3 8a5f413|capacityU + floor-loading grams + T-9 degrade-all law + two-face-rack archetype, G4 2x42U board
17000|3|Rails, Cage Nuts, Depth Adapters and the Cable Comb|PARTIAL|0a2f1ca|port-shape fit refusals (gates/g4 portShapes.ts) are the mechanical analogue, no rail-depth modeling
17012|3|The Tool Crib and the Torque Standard|MISSING|-|unlisted: no plan ADR or source mention found
17019|3|PDU / Busway — "The Spine"|DONE|e2f69d3|circuit ratings mW + 80% derate + PDU kill-all domains + protective-device circuit owners
17031|3|Switched PDU (per-outlet power control)|MISSING|-|unlisted: door power-cycle check (intent-door.ts:573) is tree-legality not outlet control
17041|3|The Breaker Panel|PARTIAL|e2f69d3|breaker/PDU node owns circuit + trip cascade floods blast domains, panel grouping absent
17047|3|The Circuit Colour Band|MISSING|-|unlisted: render Hue Ledger colors are an unrelated channel
17055|3|A+B Power Feeds / Dual Cording|DONE|e2f69d3 5a10383 0a2f1ca|powerFeeds chain-head + redundancy shared-circuit audit + G4 seeded two-PSU-one-PDU trap
17072|3|UPS — "The Battery Ziggurat"|MISSING|-|unlisted: no plan ADR or source mention found
17094|3|Flywheel UPS — "The Spinner"|MISSING|-|unlisted: no plan ADR or source mention found
17100|3|Generator + Fuel Contract — "The Barn"|MISSING|-|unlisted: no plan ADR or source mention found
17140|3|Diesel Tank + Fuel Delivery Contract|MISSING|-|unlisted: no plan ADR or source mention found
17146|3|ATS / Static Transfer Switch — "The Big Lever"|PARTIAL|e2f69d3|graph.ts dual-fed outlet (ATS) yields one feed per upstream path, transfer-failure SPOF model absent
17154|3|Load Bank|MISSING|-|unlisted: no plan ADR or source mention found
17160|3|Battery Capacity Tester|MISSING|-|unlisted: no plan ADR or source mention found
17163|3|Utility Feed / Service Entrance|MISSING|-|unlisted: per-circuit budgets exist, facility kW grant/lead-time absent
17171|3|Second Utility Feed from a Different Substation|PARTIAL|e2f69d3|powerFeeds enumerates independent upstream paths (A+B), substation-disjointness not modeled
17177|3|Substation / Utility Yard — "The Yard"|MISSING|-|unlisted: no plan ADR or source mention found
17180|3|On-Site Generation and Storage (solar, BESS, fuel cell, microgrid)|MISSING|-|unlisted: no plan ADR or source mention found
17190|3|CRAC / CRAH Cooling Unit (N+1) — "The Cold Breath"|MISSING|-|deferred: PHASE1-PLAN:133 cut list incl thermal
17201|3|Chilled Water Plant (chillers, pumps, cooling towers, water treatment)|MISSING|-|deferred: cut list thermal
17216|3|Free Cooling Economizer / Dry Cooler / Evaporative / Adiabatic|MISSING|-|deferred: cut list thermal
17223|3|Thermal Storage / Thermal Ride-Through (ice bank, chilled-water buffer tank)|MISSING|-|deferred: cut list thermal
17237|3|Hot/Cold Aisle Containment + Blanking Panels — "The Glass Roof"|MISSING|-|deferred: cut list thermal
17252|3|In-Row Cooling — "The Slot Unit"|MISSING|-|deferred: cut list thermal
17257|3|Rear-Door Heat Exchanger|MISSING|-|deferred: cut list thermal
17262|3|Liquid Cooling (direct-to-chip loop / CDU / immersion tank)|MISSING|-|deferred: cut list thermal, 30kW density gate absent
17270|3|The Spill Kit, the Drip Tray and the Isolation Valve|MISSING|-|unlisted: no plan ADR or source mention found
17279|3|Raised Floor + Tile Puller|PARTIAL|e2f69d3|floor/row/rack nested grid + weight budgets ship, tile-pull interactions absent
17288|3|Airflow Streamers|MISSING|-|unlisted: no plan ADR or source mention found
17294|3|Environmental Sensor Mesh|MISSING|-|unlisted: modelled-vs-measured heatmap absent
17303|3|DCIM (the facility's monitoring stack)|MISSING|-|unlisted: no plan ADR or source mention found
17313|3|BMS / SCADA and OT Security|MISSING|-|unlisted: no plan ADR or source mention found
17325|3|Fire Detection (VESDA) — "The Sniffers"|MISSING|-|unlisted: no plan ADR or source mention found
17331|3|Fire Suppression|MISSING|-|unlisted: no plan ADR or source mention found
17348|3|The EPO Guard|MISSING|-|unlisted: no plan ADR or source mention found
17352|3|Water Leak Detection Cable / Thermal Imaging Survey|MISSING|-|unlisted: no plan ADR or source mention found
17358|3|Physical Security: Fence, Bollards, Gate, Mantrap, Badge, Biometrics, Cameras, Guard Post|MISSING|-|unlisted: chrome badge hits are HUD vocabulary not security stack
17374|3|Cable Management / Cable Tray / Patch Panel / Overhead Ladder Racking|PARTIAL|e2f69d3 0a2f1ca|link objects (first-class cables with ids + ordered beads) ship, Tidiness score/decay absent
17395|3|Cable Label Printer|MISSING|-|unlisted: render label budgets are an unrelated channel
17404|3|Spare Parts Inventory / Spares Bin / Crash Cart|MISSING|-|unlisted: spares is a Recover example string
17416|3|The Crash Cart (and the Crash Cart as Console)|MISSING|-|unlisted: no plan ADR or source mention found
17428|3|Loading Dock / Staging Area / Freight Elevator|MISSING|-|unlisted: no plan ADR or source mention found
17443|3|The Anteroom / Dust Lock|MISSING|-|unlisted: no plan ADR or source mention found
17450|3|The Burn-In Bench|MISSING|-|unlisted: no plan ADR or source mention found
17460|3|The Lab Rack / Reference Rack|MISSING|-|unlisted: no plan ADR or source mention found
17473|3|Diverse Fiber Entry|MISSING|-|unlisted: no plan ADR or source mention found
17479|3|Meet-Me Room — "The Cathedral"|MISSING|-|unlisted: no plan ADR or source mention found
17489|3|Carrier Diversity|MISSING|-|unlisted: bgp-flowspec counter is defense-side data not a carrier object
17495|3|Cabinet / Cage / Private Suite *(colo)*|MISSING|-|deferred: Phase-1 ships g1 slices only (AUDIT-BRIEF §4 census rule)
17498|3|Building Shell Expansion / Build-to-Suit / Build-Out Shell Space|MISSING|-|unlisted: no plan ADR or source mention found
17504|3|On-Site Water / Chiller Plant Politics|MISSING|-|deferred: cut list thermal
17509|3|Waste Heat Recovery|MISSING|-|unlisted: no plan ADR or source mention found
17517|3|Seismic Bracing / Raised Floor vs Slab / Roof Condition / Overhead Tray|MISSING|-|unlisted: no plan ADR or source mention found
17524|3|The Office|MISSING|-|unlisted: no plan ADR or source mention found
17536|3|NOC / Operations Floor|MISSING|-|unlisted: NOC renders as HUD chrome, the room-as-place absent
17544|2|4.8 Staff|PARTIAL|9e701a0 ff3249f|StaffRecord + culture + on-call persistence + hands-as-capacity law ship, no staff simulation
17551|3|The Team Model (four sub-stats, one owner each)|PARTIAL|9e701a0|morale/fatigue/culture Fixed fields ship as save data contract, sub-stat sim and ownership mechanic absent
17568|3|Role compression: five roles × three seniorities|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 scope, StaffRecord.role is a free string
17582|3|Staff Shifts as a Placement Puzzle|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 scope
17591|3|Staff as Rendering Modifiers|MISSING|-|unlisted: no plan ADR or source mention found
17600|3|The Hands Dock|PARTIAL|ff3249f 0a2f1ca|HandState tokens/occupancy + G4 hands rail ship, capacity documented as staff-hands but no roster-to-hands pipeline
17611|3|The Staff Silhouette Set|MISSING|-|unlisted: no plan ADR or source mention found
17623|3|The Fatigue Posture Ladder|MISSING|-|deferred: fatigue Fixed persists on StaffRecord only, posture ladder unshipped (MASTER_REPORT §7)
17633|3|Morale / Burnout (the playable states)|MISSING|-|deferred: morale Fixed persists only, playable states unshipped (MASTER_REPORT §7)
17647|3|Staff Skill Pips|MISSING|-|deferred: skillNodesHeld persists on StaffRecord, pip render + tech-tree unshipped
17653|3|The Bus-Factor Halo|PARTIAL|e2f69d3|blast.ts uniquelyHeld bus-factor count per governor ships, halo render absent
17661|3|The Pager (as an object)|MISSING|-|unlisted: pager-like mechanics live in the 16779 alert stack instead
17667|3|The Follow-the-Sun Band|MISSING|-|unlisted: no plan ADR or source mention found
17673|3|Junior Sysadmin|MISSING|-|deferred: apprenticeshipRemaining field persists only, role sim unshipped (MASTER_REPORT §7)
17680|3|The Sysadmin (generalist)|PARTIAL|ff3249f|one-hand-per-operator law documented in HandState contract (T0-1: 1 hand), generalist object absent
17683|3|Senior SRE / Greybeard|MISSING|-|deferred: U10 mercy-rule greybeard out of Phase-1 (MASTER_REPORT §7)
17694|3|The Legend|MISSING|-|unlisted: no plan ADR or source mention found
17700|3|Network Engineer|MISSING|-|deferred: staff roster sim out of Phase-1 scope (MASTER_REPORT §7)
17710|3|DBA|DONE|4ce67fc|dba-hire ships as shared-web nonPhysical buildable, hire sim absent
17716|3|Security Engineer / Security Analyst / SOC|MISSING|-|deferred: staff roster sim out of Phase-1 scope (MASTER_REPORT §7)
17730|3|Automation Engineer|MISSING|-|deferred: staff roster sim out of Phase-1 scope (MASTER_REPORT §7)
17736|3|Support Tier 1 / Tier 2 / Tier 3|DONE|4ce67fc|support-hire ships as shared-web nonPhysical buildable, tier ladder absent
17748|3|24/7 Coverage|MISSING|-|deferred: staff sim out of Phase-1 scope (MASTER_REPORT §7)
17753|3|Offshore / Follow-the-Sun Support Pod|MISSING|-|deferred: staff sim out of Phase-1 scope (MASTER_REPORT §7)
17762|3|Sales Rep / SDR / AE / Sales Engineer|MISSING|-|deferred: commercial board §7.15 out of Phase-1 scope
17775|3|Account Manager / Customer Success Manager|MISSING|-|deferred: commercial board §7.15 out of Phase-1 scope
17787|3|Marketing Lead|MISSING|-|deferred: commercial board §7.15 out of Phase-1 scope
17793|3|Abuse / Trust & Safety|MISSING|-|deferred: §4.9 abuse desk unshipped, moderation counters are threat-side data
17805|3|The Developer|MISSING|-|deferred: staff sim out of Phase-1 scope (MASTER_REPORT §7)
17810|3|The Intern|PARTIAL|08d4fe2|Intern's Log templates ship in both i18n packs (intern.entry.*), staff mechanic absent
17816|3|Datacenter Tech / Remote Hands|MISSING|-|deferred: staff sim + physical facility verbs out of Phase-1
17830|3|The Contractor / Consultant|MISSING|-|deferred: consultant mode §9.1 post-launch tier
17837|3|Contractor Surge|MISSING|-|deferred: staff sim out of Phase-1 scope (MASTER_REPORT §7)
17843|3|The Contractor's Contractor|MISSING|-|unlisted: no plan ADR or source mention found
17849|3|The Greybeard Consultant (rentable)|MISSING|-|deferred: Consultant mode §9.1 post-launch tier
17854|3|The Night-Shift Tech|MISSING|-|deferred: staff sim out of Phase-1 scope (MASTER_REPORT §7)
17859|3|The On-Call Rotation|PARTIAL|9e701a0 1fb4fc6|onCallTurn persists + escalation-role policy arm ships, rotation floor-cliff/handover sim absent
17875|3|Training / Certification Budget|MISSING|-|deferred: U35 credential gates out of Phase-1 scope
17881|3|Documentation Culture|PARTIAL|9e701a0|WikiEntryRecord + facemaker/bindermaker flag + HabitCounters.docRate ship as data, decay effects unapplied
17887|3|Background-Checked Staff Pool|MISSING|-|unlisted: no plan ADR or source mention found
17894|3|The Distributed-Team Toggle|MISSING|-|unlisted: no plan ADR or source mention found
17903|3|Additional roles with real mechanics|MISSING|-|deferred: all 14 enumerated roles unshipped (MASTER_REPORT §7 Phase-1 scope)

## SUMMARY
- DONE: 15
- PARTIAL: 37
- PROBLEM: 2
- MISSING: 103
- NA: 0
- Total rows: 157 (= 4 ## + 153 ###, matches outline.md Table 3 and the file itself, line numbers verified identical)

## TOP-PROBLEMS
1. **16291 Nine Defense Roles — vocabulary divergence.** Shipped taxonomy (coverage/defenseRoles.ts, ratified "verbatim against registry-core.json") uses Absorb/Classify/Meter/Contain/Detect/Recover/Deter/Divert/Negotiate; §4.5's own list here has **Block** and no Negotiate. The §2.1 vs §4.5 spec inconsistency was resolved toward §2.1 on disk; §4.5 was never amended.
2. **16331 Stacking rules — combine law contradicts spec.** matrix.ts pins MAX-never-sum per cell, explicitly rejecting §4.5's multiplicative 0.80 example; same-role diminishing returns, synergy bonuses and the Waste Indicator counter are unimplemented (secondAnswerGaps covers only the ≥2-different-roles law per-row).
3. **4.5 towers are catalog rows, not machines.** Of 33 defense headings only the posture system (inspectionDepth × aggression ROC, defaults.ts step 7, gates G1/G3) runs in the engine; 9 "DONE" product headings are shipped *names* in packages/content/threats/registry-core.json counters + types/*.json buildables (consumed by versus/deck.ts legality + loader parse), with zero per-tower mechanics.
4. **16350/16362 defense-placement laws diverge.** Spec puts defenses on edges with a per-object aggression slider and a log-only third position; shipped model is node-level inspectionDepth (4 enum depths) plus ONE run-level aggression Fixed.
5. **4.7 power chain stops at the PDU.** PDU/circuit/derate/A+B feeds/blast cascade are DONE (e2f69d3, 5a10383, T-9 8a5f413), but the entire UPS→generator→ATS→utility-failure ride-through chain is unmodeled, so breaker-trip cascades have no backup-power semantics.
6. **4.7 thermal/fire/security entirely cut.** PHASE1-PLAN:133 cut list names thermal as honored-out; all cooling, fire, physical-security and facility-room headings classify MISSING.
7. **4.8 has a data skeleton with no simulation.** save/node.ts (9e701a0) ships StaffRecord (morale/fatigue/onCallTurn/skillNodesHeld/apprenticeshipRemaining), PlaybookSlotRecord and WikiEntryRecord — persistence-only, no engine consumer; the only staff-adjacent live mechanic is the hands-as-capacity law (types.ts §7.5 docblock) and policy escalation-role arms.
8. **Status page (16802) shipped as a verb, not an object.** Communicate's status-page line law + a catalog counter exist; the off-infrastructure, graph-independent page (the spec's core question) is absent.
9. **Runbook ladder (16828/16853) is data + one action.** 6-rung PlaybookSlotRecord with hollow/drilled/stale seals and run-runbook policy action ship, but the "3+ manual uses → rule" promotion law and incident drag-to-execute UI do not — the automation mechanic the heading is named after.
10. **Mis-tune/off-state visual (16373) awaits render mount.** The amber-haze over-tuned-WAF readout is designed into the Fogged-NOC variant but panels remain DOM/SVG programmer art (PHASE1-PLAN:165), and the substrate section-cut seam (0acf46e/27f2856) is on mount HOLD.
