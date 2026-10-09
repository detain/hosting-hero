# Group g10 audit — hosting_game.md 2.14–2.27 threat catalog, generator systems, presentation language — lines 10158-11397

## MANIFEST

line|level|heading|STATUS|hash(es)|note
10158|##|2.14 Supply chain, logistics, and procurement threats|MISSING|—|deferred: no procurement/supply subsystem in Phase-1; only save/node.ts vendorTermsDays contract-terms effect (9e701a0) touches the domain
10163|###|The DOA Rate|MISSING|—|deferred: hardware lifecycle not modeled; no DOA stat in registry-core.json
10172|###|Counterfeit Components|MISSING|—|deferred: no component-granularity model
10181|###|The Hardware Broker|MISSING|—|deferred: no procurement market
10189|###|The Wrong SKU|MISSING|—|deferred: order system absent
10196|###|The RMA Black Hole|MISSING|—|deferred: RMA absent; save/ hits are format/platform substring noise
10203|###|The Freight Damage|MISSING|—|deferred: freight absent
10210|###|Allocation|MISSING|—|deferred: supply allocation absent
10218|###|Lead-Time Inflation|MISSING|—|deferred: lead times absent
10224|###|Component Shortage|MISSING|—|deferred: shortage absent; scarce field in type bundles is gameplay tempo not supply
10231|###|Component Recall|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10237|###|The Distributor Credit Hold|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10247|###|Customs, Duties, and the Seized Shipment|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10255|###|Currency / Import Tariff Shock|MISSING|—|deferred: single-currency economy (MoneyUnit µ$ bigint), no FX
10258|###|The Expired Support Contract / The Warranty Cliff|MISSING|—|deferred: save/node.ts U35 certifications are company credentials not hardware warranties
10265|###|The Acquired Vendor|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10274|###|The Acqui-Loss|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10282|###|Licensing Repricing / Licensing Change|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10289|###|The Vendor API Deprecation|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10297|##|2.15 Utility, environmental, and civic threats|MISSING|—|deferred: facility utilities not modeled; physical.ts room/facility tiers (e2f69d3) are topology anchors not utility feeds; capacityMW budgets exist for co-location domains only
10302|###|The Interconnection Queue|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10310|###|Demand Charge Ratchet / Demand Charge Shock|MISSING|—|deferred: no electricity billing
10326|###|Grid Curtailment and Frequency Events|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10333|###|The Energy Hedge Goes Underwater|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10343|###|Regional Power Price Spike|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10349|###|Water Restriction and the WUE Stat|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10356|###|The Neighbour's Construction|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10364|###|The Building Is Also An Office|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10371|###|The Landlord's Other Tenant|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10380|###|Lightning and Bonding|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10388|###|Wildlife (extended)|MISSING|—|deferred: squirrel-gnaw absent
10396|###|Climate and Weather Events (regional modifiers)|MISSING|—|deferred: waves weather band (47b2c33) is a telegraph band named by §8 homonym, not climate modifiers
10404|###|Community Opposition|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10411|###|Seismic / Storm / Flood (regional)|MISSING|—|deferred: storm band same homonym caveat; no regional disaster events firing the domain machinery
10416|##|2.16 AI-era and modern threats|MISSING|—|deferred: no AI-era threat family shipped; bot-adjacent vocabulary exists (UnitIntent automaton types.ts:241, crawler visitor archetype) but zero §2.16 mechanics
10421|###|Generative Abuse at Scale|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10431|###|Model Poisoning of Your Own Defences|MISSING|—|deferred: suspicion dial (g3) is the player-side analog, no adversary poisoning it
10443|###|The Agentic Customer|MISSING|—|deferred: visitor archetypes are scripted personas not LLM agents
10453|###|Prompt-Injected Support Automation|MISSING|—|deferred: no support automation to inject
10461|###|The AI Agent Incident|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10474|###|The Scraped Knowledge Base|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10482|###|Deepfaked Authority|MISSING|—|deferred: social-engineering family absent
10492|###|AI Bubble Deflation *(era-gated)*|MISSING|—|deferred: era machinery supports 2 eras only (MODULE-STATUS era-count gap row)
10498|###|AI Scraper Locusts (see §2.2)|MISSING|—|deferred: crawler visitor is organic traffic not a locust wave
10502|##|2.17 Structural and systemic threats|PARTIAL|47b2c33,5a10383,8a5f413|the strongest shipped cluster in this range: retry-storm engine, failure-domain correlation, and fog legibility all exist; several named threats still absent
10507|###|The Metastable Failure|DONE|6e1503e,41fcdd2|core engine law: bounced units re-enter via retry queue with retryDepth lineage (re mint at tick), FIX-8 queue-ghost dedup + audit-fix F6 export/import of retry depths; emergent retry-storm amplification is the sim's signature behavior, congestion bench pinned 13a6ace7
10518|###|Gray Failure|PARTIAL|55a6086|presentation half shipped — instrument lagUs/staleAfterUs classes grade readings live/stale/unknown so silent degradation stays legible; no gray-failure threat generator
10529|###|The Shared Fate You Bought (the Correlation Score)|PARTIAL|5a10383,8a5f413|correlation machinery DONE-as-substrate: failure domains same-PDU kill-all RED / rack degrade-all AMBER / switch / template one-artifact-one-blast (T-9 ratified ADR-0009); the point-of-purchase correlation SCORE widget not shipped (g4 terms card lists attack-surface relations, not co-fate cost)
10540|###|The Reconciliation Loop That Won't Stop|MISSING|—|deferred: economy dunning reconciliation (E-18) is payment matching, unrelated; no runaway reconciler threat; reconciler rung-4 card type still in unratified owner batch
10548|###|The Cache That Became A Database|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10557|###|The Config That Is Also Code|MISSING|—|deferred: loader ruleset-diff linter guards authors not runtime; risky-deploy appears only as authored memo in g5 fixture
10565|###|The Forgotten Environment|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10573|###|Abandoned / Shadow Infrastructure|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10581|###|The Employee Who Automated Themselves Into Load-Bearing|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10591|###|The Staffing Dispute|MISSING|—|deferred: payroll expense shipped in economy lane (589b41b battery) but no dispute/strike threat
10599|###|The Undocumented Dependency / The Correlated Failure|PARTIAL|5a10383|correlated-failure half shipped via template + switch domains; undocumented-dependency half absent — the door requires declared sockets (canConnect grammar), so undeclared deps cannot exist yet
10604|##|2.18 Storage, virtualization, and capacity failures|MISSING|—|deferred: no storage-internals model (thin provisioning, drives, VM schedulers); queue/slot capacity is request-plane only
10609|###|Thin Provisioning Cliff|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10620|###|Snapshot Sprawl|MISSING|—|deferred: repo snapshots are replay checkpoints, homonym
10629|###|The SSD Endurance Cliff|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10641|###|The Dying-But-Not-Dead Drive|MISSING|—|deferred: degrade-all domains are rack/switch granularity, not per-drive
10651|###|CPU Ready Time (the metric that lives in a third place)|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10662|###|Deleted But Open|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10670|###|The Filesystem That Slowed Down At 90%|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10676|###|Missing Capacity In The Least Obvious Place|MISSING|—|deferred: inode/PID/conntrack classes of hidden-limit failure unmodeled
10683|###|Backup Window Saturation|MISSING|—|deferred: backup only as coverage defense-role example string (e24e1bb)
10688|##|2.19 Identity, time, and trust failures|MISSING|—|deferred: no certificate/time-trust plane
10690|###|The Internal PKI Expiry|MISSING|—|deferred: cert-expiry exists only as a demo due-clock row in HudLabPanel (4ff4a4f era), no engine mechanic
10705|###|The OCSP Responder Outage|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10715|###|The GNSS/NTP Spoof — when all your clocks agree and are wrong|MISSING|—|deferred: ntp appears only as a SOCKET_PROTOCOLS label (e2f69d3 era sockets.ts), no clock-skew threat
10726|###|The HSTS Preload One-Way Door|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10734|###|The TLS Deprecation Cutoff|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10745|##|2.20 Abuse-desk and legal-pressure threats|MISSING|—|deferred: no abuse desk, legal, or network-registery family; economy abuse tag (contract.ts §4.4 revenue-quality axis) is customer cost-to-serve not abuse-desk workflow
10751|###|The Upstream Abuse Escalation Ladder|MISSING|—|deferred: dunning ladder (b7e262c) is the payment analog, ships for customers not upstream complaints
10759|###|DMCA Flood / Abuse Complaint Stack|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10772|###|Phishing Site on Your Network / The Phishing Tenant|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10779|###|The DDoS-for-Hire Tenant|MISSING|—|deferred: grudge-booter threat (4ce67fc) is an external booter attacker, not a tenant running the service
10785|###|IP Reputation Blacklist|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10792|###|CSAM Report|MISSING|—|deferred: sensitive-handling content deliberately absent from Phase-1 corpus
10800|###|Sanctions Screening Failure|MISSING|—|deferred: sanctioned hits in economy are prose substring (sanctioned write path)
10806|###|RIR Investigation|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10809|###|Law Enforcement Seizure|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10812|###|Compliance Sweep|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10820|##|2.21 Cost attacks (denial of wallet)|MISSING|—|deferred: cash denomination pressure ships (wave w1/w2 slices + chargeback-swarm 2-4pct revenue threat, 4ce67fc) but the cost-attack category grammar does not
10825|###|The Cost Attack (category rules)|MISSING|—|deferred: no-red/no-alert/damage-on-next-invoice grammar unimplemented; errorBudget meter (b7e262c) is SLA credit semantics not attack accounting
10838|###|Members of the family|MISSING|—|deferred: chargeback-swarm (cash customerAsThreat) is the nearest shipped cousin
10847|###|The Taxi Meter (shared widget)|MISSING|—|deferred: zero taxi hits repo-wide, no Meter-role widget system
10855|###|The Cost Anomaly Monitor (the missing Detect tower)|MISSING|—|deferred: anomaly detection appears only as a defenseRoles.ts example string (e24e1bb)
10864|##|2.22 HUD attacks: threats against your information|DONE|55a6086|the family's fairness contract is the shipped architecture: fog degrades, never fabricates, and truth-channels are immune
10869|###|The family and its fairness contract|DONE|55a6086|projectSeat fairness channels — site-preview and pulse-strip return always-truth readings (still scope-filtered, fog exempts degradation never scoping, co-op leak tests pin it); InstrumentClass stale/unknown grades make sensor decay visible
10878|###|Metric Poisoning|MISSING|—|deferred: observed store has no adversarial write path — attacks cannot yet falsify cells
10885|###|The Dead Sensor / The Monitoring Server Dies|PARTIAL|55a6086|dead-sensor rendering shipped as unknown canonical cell (? mark, dashed-ring UNVERIFIED chip) and staleAfterUs expiry; no threat that actually kills a sensor
10891|###|Alert Flooding|PARTIAL|1e6b306|defense shipped as fatigue mechanics: grouping, SNR-driven cap (0.4+ to 1), silenced-still-visible grey wash, N suppressed by fatigue; no flood generator targets it
10898|###|The Wrong Green|PARTIAL|6f5da38,faf81a7|counter-machinery shipped: gate-g1 paranoia ladder pins false-positive economy (FP drives 20M µ$ waste, landed 380→44), blocked-false-positive terminal keeps wrong-green honest, off-vocab chips throw
10906|###|Log Tampering|MISSING|—|deferred: replay bundle hashes are author-side integrity, no in-world tamper threat
10912|###|Referrer / SEO Spam Ghosts|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10916|###|The Telemetry Resolution Trap|PARTIAL|55a6086|resolution-decay substrate ships (confidence per cell, fog over state); the trap threat — coarse resolution hiding a real problem — not generated
10924|##|2.23 Overcorrection: threats that punish paranoia|PARTIAL|6f5da38,4ce67fc|the paranoia-tax loop is a ratified gate result (G1 ladder) even though most named threats are absent
10930|###|The Competitor's "No Robots" Campaign|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
10937|###|The Legitimate Burst You Blocked|DONE|6f5da38|gate-g1 law certified headless: tightening the slider strictly raises blocked-false-positive count and incident cost while served drops (monotone ladder ×5 seeds, conservation neutralized+landed+inFlight exact); the FP cost 20M µ$ is the paranoia tax
10944|###|The Accessibility Complaint|MISSING|—|deferred: a11y exists as panel design law (G4 keyboard nav), not as a threat
10950|###|The Support Tax|PARTIAL|4ce67fc|ticket-avalanche-hydra ships as hands-denomination data + in shared-web w4 slice; the doom-loop escalation (tickets→engineer time→slower response→more tickets) has no distinct engine loop yet
10956|###|fail2ban Self-DoS and the Rate Limit You Set|PARTIAL|4ce67fc,6f5da38|fail2ban ships as cheap Deter counter in type data; its self-DoS economics ride the generic FP machinery (legit units blocked = FP cost) rather than a dedicated mechanic
10959|###|Model Poisoning of Your Own Defences|MISSING|—|deferred:xref §2.16 — dup heading, same deferred verdict
10963|###|The Mound of the Stopped (the family's instrument)|MISSING|—|deferred: no drift/pile visual for blocked units; blocked units currently re-enter the retry queue (the metastable law) not a mound
10973|##|2.24 Threat economy, wave composition, and generator systems|DONE|47b2c33,24dfcfe|the highest-fidelity section of this range: waves/ module implements the budgets, ledger, and authoring-law enforcer nearly whole
10978|###|The two pressure budgets|DONE|47b2c33|director.ts: sawtooth-trough-depth and entropy-budget as closed SUBJECTS, incident-active hard refusal consumes no rng, 0.75-1.25 clamps, every draw logged as DirectorDraw for replay
10986|###|The active-family pool cap|PARTIAL|47b2c33|ledger.ts comment explicitly delegates pool cap 8-10 families to content-CI, but contentInspector.ts does not check it — zero code enforces the cap today; type data ships activeFamilies (3 of 5 vocab families per type)
10989|###|Mastery demotion and retirement|DONE|47b2c33|ledger.ts bandAfterMastery demotes ≥5 defeats to weather band (existence untouched — timing RNG only), retirement lag 60 ticks; certified seed-invariant in gate-g2 (storm→weather)
10996|###|The Copycat reserve|PARTIAL|4ce67fc|copycatReservePct [10,15] authored in shipped wave-table rules blocks but NO code consumes the rules block — declared law, zero enforcement or generator
10999|###|Affixes as a reward multiplier|PARTIAL|2421257,d076ad5|versus deck ships 16-slug affix vocabulary rolled per card at draft; the reward/payout multiplier math does not exist (affixes inert in v0, owner-question logged)
11002|###|The Two-Front requirement for hard waves|DONE|47b2c33|enforcer.ts TWO_FRONT_DENOMINATIONS_EXCEEDED + HARD_WAVE_SINGLE_FRONT laws + per-type twoFrontDraw in shipped bundles; both g1 slices carry 2-denomination w4 waves (hands×data-integrity, bandwidth×reputation)
11006|###|The denomination quota|DONE|47b2c33|enforcer.ts DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED (≤4 threats per denomination across table) + 6 DAMAGE_DENOMINATIONS closed vocabulary
11009|###|The Second Incident multiplier|PARTIAL|4ce67fc|1.8× during incident / 2.5× during recovery authored as wave-table rules data + g5 incident-window memo; no dynamic multiplier consumer
11012|###|The Feint budget|PARTIAL|4ce67fc|feints {maxPerLevel 1, neverTwoLevelsInRow, namedInPostmortem} in the same dead rules block — authored law awaiting a generator
11015|###|Grudge as a difficulty input|MISSING|—|deferred: grudgeCap 5 is a stat field on grudge-booter only; no attacker-memory state; save/treatment.ts grudgeScore is the customer-treatment ledger (different concept)
11018|###|Attacker budgets as a win condition|MISSING|—|deferred: no adversary cost/return accounting (attacker leaves after 3 cost-over-return)
11021|###|The Wave Composition Bar|MISSING|—|deferred: 3-segment widget absent from apps/proto
11030|###|The Threat Mass Bar|MISSING|—|deferred: stacked top-chrome bar absent
11037|###|The Pressure Gradient (ambient attack baseline)|MISSING|—|deferred: screen-space reach encoding absent; waves/baseline.ts diurnal curves model ambient TRAFFIC baseline (47b2c33) but no substrate-tint projection
11045|###|Compound-wave authoring|PARTIAL|47b2c33|grammar validates 3-shape wave structure (ramp/plateau/decay) and enforcer composition laws bind authored tables; multi-denomination compound authoring shipped by example (w4 slices) not by dedicated authoring tool
11051|##|2.25 Boss design and campaign-scale threats|MISSING|—|deferred: boss exists only as THREAT_ROLES vocabulary slot in table.ts — zero boss threats, zero phase machinery, unlisted in shipped gaps register
11053|###|Boss design specification (three phases, each invalidating one defense)|MISSING|—|deferred: no phase state machine anywhere
11069|###|The named campaign antagonists|MISSING|—|deferred: campaign structure absent (save scenario matrices are run modes not antagonists)
11078|###|Ransomware on your own management plane (the campaign boss)|MISSING|—|deferred: crystallize motion slug (4ce67fc validate.mjs) is the only ransomware token, no encryption-of-mgmt-plane mechanic
11086|###|The Zero-Day Drop as a shared global event|MISSING|—|deferred: match.ts zero-day is a versus omit-arms mode parameter, not a world-shared drop
11090|###|The Refund Cascade death spiral|MISSING|—|deferred: errorBudget E-9 refunds ship as SLA credit machinery (b7e262c); no self-reinforcing refund doom loop
11098|##|2.26 Threat presentation language (the visual grammar of §2)|PARTIAL|55a6086,faf81a7,1e6b306|identity discipline ships (hue ledger, 12-vocab chips, motion vocabulary in data) but the sprite/motion rendering layer awaits real atlases — mount HOLD gap row
11103|###|The Silhouette Rule|MISSING|—|deferred: seed kit ships 64×64 solid-hue placeholders (b3a149d), 24px silhouette test not authorable yet
11111|###|The threat visual contract, five channels|PARTIAL|faf81a7,1e6b306,28f638e|three channels live in law: colour (Hue Ledger, off-ledger admit throws), shape (notch glyphs incl dashed-ring), sound (three-bus AudioBus with signals-never-ducks); motion and scale channels unrendered
11117|###|The Threat Scale Law|MISSING|—|deferred: size-equals-money mapping absent
11127|###|The Wind-Up Frame|MISSING|—|deferred: 3-frame telegraph unrendered (telegraph bands ship as data law)
11133|###|Motion as behaviour — the seven motion primitives|PARTIAL|4ce67fc|advance hold sweep boil match walk crystallize off-board validated per-threat in content data; zero runtime motion renderer
11144|###|Approach Lanes|PARTIAL|589b41b|LaneStats per-lane rho/queue ship end-to-end (engine→wire→HUD beads) which is the data for lane heat; thickness/saturation lane rendering absent
11152|###|The Off-Board Register|PARTIAL|1e6b306|BezelHud ships 10px inner bezel with severity top-rule on ledger hues + pressure-lip + no-data dither — severity-driven, not the per-attack bezel-event register (BGP bar, lock glyph, grey money column) specified
11167|###|The Attribution Direction Law|PARTIAL|b9295b5|causality data ships (CauseRecord parent chains, traceContributingFactors root→effect with red-herring lanes); the grey-animates-from-causing-end rendering unmounted
11175|###|The Threat Despawn Vocabulary|MISSING|—|deferred: engine has 4 terminal outcomes (served bounced blocked-FP landed) + neutralized sub-cause; the 7 named visual exits (filtered tarpitted diverted expired...) unimplemented
11187|###|The Miss (the fourth attack-landing outcome)|DONE|6f5da38|OutcomeTerminal landed ships as the fourth outcome: arrival on empty path → goal breach cause breach:target:unit drives damage; ladder quantifies it (landed 380→44 as paranoia rises)
11195|###|Damage States, three stages plus one|MISSING|—|deferred: clean scuffed broken smoking asset states absent with real sprites
11201|###|The Entropy Eruption Grammar|PARTIAL|47b2c33|generator half ships: entropy band telegraph gated on foresight purchase (bands.ts foresightIsPurchase) + director entropy factor scales unit counts; the spall eruption visual unrendered
11212|###|The Paper Family (business and legal threats)|MISSING|—|deferred: legal-family threats absent wholesale (see 2.20)
11223|###|The Broadcast Family (reputation threats)|MISSING|—|deferred: reputation denomination ships in waves, broadcast visual absent
11233|###|The Human Family (credential, insider, physical)|MISSING|—|deferred: human family threats ship in data (5 of 16 registry entries) but insider/credential visual family unrendered
11239|###|The Camera Cone Gap|MISSING|—|deferred: camera rig has altitude ladder (Z1-Z4) but no cone darkness polygons
11247|###|The Designator|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
11256|###|The Poisoned Tint|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
11264|###|The Silent Threat Strip (the Hum Bar notch)|PARTIAL|28f638e|audio contract ships the silence law: alertBandReservationHz REQUIRED at pack parse, five hum voices bound to telemetry, signals-never-ducks triply enforced; nothing mounts it and the visual strip is absent
11272|###|The Correlated Failure White Line|MISSING|—|deferred: domains correlate in data (8a5f413) but no white-line visual
11276|###|The Zero-Day Sky|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
11285|###|The Turned-Away Map|MISSING|—|deferred: absent from engine and content data, outside the Phase-1 P0 build order (reports/MASTER_REPORT.md §7)
11293|###|The Taxi Meter|MISSING|—|deferred:xref 10847 — no meter widget on objects
11300|###|The Bestiary Card|PARTIAL|0a2f1ca,e24e1bb|the knowledge parts ship: g2 pool preview names the withheld bestiary, mastered badges + Coverage Grid 12×9 role matrix + dark-cell teaching + ledger mastery; the per-threat visual card with stamp unauthored
11310|##|2.27 Threat-to-hosting-type matrices|PARTIAL|4ce67fc|two of nineteen types shipped with real per-type threat structure; the three matrices exist as data skeletons awaiting weights
11315|###|Matrix A — signature threat, signature non-attack problem, and what it costs|PARTIAL|4ce67fc|2/19 type bundles carry signatureThreats lists (9 + 8 mechanical entries) + goal/scarce/tempo fields; G6 two-types-one-engine gate certifies the pattern; 17 types deferred
11339|###|Matrix B — the wave-deck mix per type (what the generator draws)|PARTIAL|4ce67fc,47b2c33|both shipped types have 5-wave g1 slices with per-type denomination mixes consumed by planWave; spec's 22-deck matrix not authored
11385|###|Matrix C — which threat families dominate which type|PROBLEM|4ce67fc|activeFamilies + qualitative _todo ship but familyWeights are null with stale _todo prose awaiting the ratified tuning sheet (OD-2) — OD-2 was ratified sheet B at 24dfcfe yet the weights were never re-authored; owner-gated content debt

## SUMMARY

- Rows: 156 (14 ## + 142 ###), reconciled against outline.md Tables 2-3 by exact diff
- Tally: DONE 10 (incl ## rows 10864, 10973), PARTIAL 29, MISSING 116, PROBLEM 1, NA 0
- Per section (DONE/PARTIAL/MISSING/PROBLEM, rows incl ##): 2.14 0/0/19/0 · 2.15 0/0/15/0 · 2.16 0/0/10/0 · 2.17 1/4/7/0 · 2.18 0/0/10/0 · 2.19 0/0/6/0 · 2.20 0/0/11/0 · 2.21 0/0/5/0 · 2.22 2/4/3/0 · 2.23 1/3/4/0 · 2.24 5/6/5/0 · 2.25 0/0/6/0 · 2.26 1/9/15/0 · 2.27 0/3/0/1

## TOP-PROBLEMS

1. 2.27 Matrix C drift finding: familyWeights null with _todo text still awaiting the tuning sheet that was RATIFIED at 24dfcfe (OD-2, sheet B) — content debt now contradicts the decision record; needs re-authoring by the content lane.
2. Pool-cap delegation hole (10986): ledger.ts delegates the 8-10 active-family cap to content-CI by comment, but contentInspector.ts implements no such check — the law exists only in prose (grep poolCap zero code hits).
3. The content wave-table rules block (copycat reserve, feint budget, second-incident multipliers, family-pool cap, entropy formula) is dead data: parsed-and-carried, zero consumers — three PARTIAL rows in 2.24 rest on authored-but-inert laws.
4. Metric Poisoning (10878) is architecturally impossible today in both directions: the observed store has no adversarial write path, so the flagship HUD attack of the family whose fairness contract is DONE cannot actually be generated — Phase-2 needs a lie-channel design that does not violate the shipped honesty invariants.
5. Entire boss chapter 2.25 (5 headings) unlisted in the MODULE-STATUS gap register despite being a named spec pillar — only a boss role-enum slot exists; recommend adding a gap row.
6. 2.26 rendering debt is one root cause (no real sprite atlases, mount HOLD per ADR-0008 gap rows) blocking ~15 headings from PARTIAL to DONE; the data/law halves (motion vocab, telegraph bands, hue ledger, causality traces, hum-pack contract) are ready.
7. Despawn vocabulary mismatch (11175): engine ships 4 terminal outcomes vs the spec's 7 named visual exits — a mapping decision (which engine outcome renders which exit) is owed before the atlas wave.
8. Support Tax / fail2ban self-DoS (10950/10956) ride generic FP machinery without the doom-loop feedback (tickets→engineer time→slower→more tickets) the spec makes the point of — credit given as PARTIAL, but the distinctive loop is the missing piece.
