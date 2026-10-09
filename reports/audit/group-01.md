# Group g01 audit — §0 Foundations + 1.1 scale ladder + 1.2 perspective levels — lines 216-1501

## MANIFEST
line|level|heading|STATUS|hash(es)|note
222|2|0.1 Design pillars|PARTIAL|-|17 of 21 pillars live in engine; P15 pivot + business-line pillars unbuilt (see rows)
224|3|P1 — The Shared Pipe|DONE|8fd409a|pipeline/queue.ts rho/(1-rho) hockey-stick + slot service; defense latency tax live; G1 gate proves it
241|3|P2 — Capability vs. Surface|DONE|47b2c33 0a2f1ca|waves/ attack-surface ledger; gates/g2 deriveThreatInvitations makes threats spawnable only after builds
254|3|P3 — Peacetime is the Real Boss|PARTIAL|a864061|opex/payroll as data rows halt runs (unattended fastForward.ts:218); morale/research/calm-period activities unbuilt
264|3|P4 — Attention is a Resource|DONE|8fd409a b1f757e|pipeline/intent-door.ts hands tokens + occupancyTicks + hands-exhausted refusal
275|3|P5 — Legibility Under Load|DONE|55a6086 faf81a7 1e6b306|observed/ dual-state; chrome hue-ledger vars, budget caps, StatusChip 12-vocab
284|3|P6 — The same pipe carries the thing you want and the thing you fear|DONE|8fd409a|restatement of P1 with instruction; both costs live: FP bounce fees + latency holds in pipeline/defaults.ts
291|3|P7 — Ship the real monsters|PARTIAL|4ce67fc|real-mode threat corpus shipped (registry-core.json + g2 THREAT_CATALOG 16); was-that-real markers unbuilt; rest deferred: Phase-1 scope
306|3|P8 — The business is the other half of the game|DONE|b7e262c faf81a7|economy ledger full run; chrome/metrics.ts permanent cash/mrr/reputation rows
317|3|P9 — The reward loop is on letting through not shooting down|PARTIAL|b7e262c 28f638e|conversion produces revenue in economy; coin/sound celebration unwired (AudioBus façade only, zero samples mounted)
326|3|P10 — Almost nothing you do has an immediate result|DONE|b7e262c b9295b5|renewal cliffs + dunning lag in economy; replay/causality.ts oneSentenceExplanation draws decision-to-consequence lines
337|3|P11 — Hosting is billed in terms not in months|DONE|b7e262c|economy/contract.ts term structure, renewal cliff, escalators, ramp as contract properties
351|3|P12 — Revenue has a colour not just a size|DONE|b7e262c|contract.ts RevenueColourTags five axes (margin/churnRisk/term/concentration/abuse) + revenueBar; G5 projection shows composition
362|3|P13 — The contract is a tower|PARTIAL|b7e262c|SLA_CLAUSE_IDS 13-clause table live as data refs; no placeable paper-layer clause board
372|3|P14 — Money you can't touch is not money|DONE|b7e262c|economy/buckets.ts six-bucket stack, isSpendableBucket free-only law
382|3|P15 — A pivot is a double-carry not a switch|MISSING|-|deferred: PHASE1-PLAN §Governing law; pivot levels are campaign content; no two-company overlap mechanic in economy
391|3|P16 — Path shaping not just tower shopping|DONE|8fd409a b1f757e|QosClassifyIn step + QosClassDef.budgetUs ms budget + per-node inspectionDepth; G3 express/deep two-lane gate
403|3|P17 — Defenses need roles and coverage must be legible|DONE|e24e1bb|coverage/ 12x9 threat-role x defense-role grid with dark-cell teaching; commit names P17
412|3|P18 — There must be something you spend to win right now|DONE|b7e262c 2eaf830|economy/errorBudget.ts spendable budget + exhaustion lock + clean-week refund; shed verb burns it
423|3|P19 — A tension without a number is a mood not a mechanic|DONE|b7e262c 24dfcfe|baseline economy numbers shipped; OD-2 tuning Sheet B ratified LIVE (ACTIVE_TUNING_SHEET)
434|3|P20 — The boring middle of the job is the unmined content|PARTIAL|8fd409a|retry storms + dependency holds + queue depth live (defaults.ts stormFactor); lead times/RMA/demand-charge unbuilt; rest deferred: Phase-1
446|3|P21 — Every mechanically-defined system owes a visual|DONE|4ff4a4f faf81a7 1e6b306|Hue Ledger single-source + render budget + instrument design language + chip notch vocabulary; CONVENTIONS generation law
460|2|0.2 The hosting-type variety engine (core design pillar)|PARTIAL|4ce67fc b3a149d|ruleset cards + laws + skin-kit live; Business Line System family absent
470|3|The Ruleset Card|DONE|4ce67fc ef8f35e|types/{shared-web,game-servers}.json carry the six slots (visitor/goal/scarce/threats/skin); loader strict-parses
489|3|The Three-Change Rule (design law)|DONE|ef8f35e|loader/lint.ts THREE_CHANGE code — scarce+fatal+customer must all differ
496|3|The Verb Shift Rule|DONE|ef8f35e|loader/lint.ts VERB_SHIFT code (dominant verb differs else MERGE)
504|3|The Business Line System|MISSING|-|deferred: PHASE1-PLAN §Governing law (late-campaign content); no multi-line facility model in engine
514|3|The Portfolio Meter|MISSING|-|deferred: PHASE1-PLAN §Governing law; diversification dial unimplemented
523|3|Line Synergies|MISSING|-|deferred: PHASE1-PLAN §Governing law; line pairs not modeled (depends on Business Line System)
534|3|Line Antagonisms|MISSING|-|deferred: PHASE1-PLAN §Governing law; no compliance-revocation/power-competition interactions
542|3|The "What Are We Even" identity stat|MISSING|-|deferred: PHASE1-PLAN §Governing law; brand-dilution stat unimplemented
549|3|Control Granularity as a difficulty axis|MISSING|-|deferred: PHASE1-PLAN §Governing law; no per-tier click-ability removal; observed fog is a different law
560|3|Same event different crisis (the proof the engine works)|MISSING|-|deferred: PHASE1-PLAN §Governing law; §9.1 mode not built; one g1 reskin pair exists (2 official types)
569|3|The Five-Asset Skin Kit (production spec)|DONE|b3a149d|tools/assetpack kit.ts FiveAssetSlot closed union meter/visitor/hero/palette/fx + seed kit + manifest law + atlas sampler wiring
580|2|0.3 The hosting-type catalogue and the Scarcity Table|PARTIAL|4ce67fc|2 of ~32 table rows shipped as types/*.json; rest deferred: PHASE1-PLAN §Governing law zero shipped content
620|3|Type-specific "fifth axis" scoring|PARTIAL|b7e262c 24dfcfe|scoring.ts fifth-axis law + applyFifthAxis live 20-pt displacement; shipped type bundles configure no fifth axis yet
634|2|0.4 The era axis|PARTIAL|17f3c8b|era machinery live at 2 eras (1998/2026); spec's 1994-2024 grid + expansion owner-open
636|3|Era × Type is a 2D content grid|PARTIAL|17f3c8b 08d4fe2|type JSON eras fields + i18n era-varied keys + era-tokens + end-to-end toggle; only 2 eras; not-invented-yet tech greying unbuilt
645|3|The Era Campaign ("From Dial-Up to GPU")|MISSING|-|deferred: PHASE1-PLAN §Governing law; campaign structure not in Phase-1 scope
654|3|The Era-Transition Cutscene|MISSING|-|deferred: PHASE1-PLAN §Governing law; zero cutscenes; @pixi/node audit lane deferred too (ADR-0008)
663|2|0.5 Working titles and tone|NA|-|editorial section; tone carried by i18n packs copy (08d4fe2) not an implementation surface here
665|3|Working title candidates|NA|-|title shortlist; no implementation surface
670|3|Tonal target|NA|-|tone note; carried indirectly by i18n pack copy discipline (08d4fe2)
677|3|The emotional arc|NA|-|design-essay arc; campaign pacing not built (deferred with 1.1)
684|2|0.6 What wave 2 changed (navigation map)|NA|-|pure navigation index per its own preamble; targets audited in their own ranges
690|3|The nine biggest structural additions|NA|-|nav index; its nine items are audited in their own section groups (1-7 live: queue/hands/errorBudget/coverage/contracts/cash-buckets/policy-UI)
707|3|Whole hosting business families added in wave 2|NA|-|nav index; families are catalogue content, deferred: Phase-1 shipped 2 types
716|3|Threat space that was half-covered and is now filled|NA|-|nav index; physical/lead-time layer audited at P20 (absent) and §2.x ranges
724|3|Known live disagreements|NA|-|editorial tension register; kept as prose per §9.6
737|2|1.1 The scale ladder (campaign spine)|MISSING|8a5f413|deferred: PHASE1-PLAN §Governing law zero campaign authoring in Phase-1; engine primitives ride sub-rows
749|3|The four ladders, and which one is the campaign (contradiction resolution)|NA|-|decision-resolution prose; each ladder classified on its own rows
772|3|Tier 0 — "Hello World" / `index.html` / "Inside the Box"|MISSING|8fd409a|deferred: PHASE1-PLAN zero campaign authoring; its lesson engine (12-slot hockey-stick) live in pipeline/queue.ts
804|3|Tier 0.5 — "The Noisy Neighbor" (the shared resource)|MISSING|4ce67fc|deferred: Phase-1 scope; noisy-neighbor exists only as data (registry hoarder-noisy-neighbor); apartment-cutaway visual unbuilt
820|3|Tier 1 — "One Box" / `root@localhost` / "Your Own Box"|MISSING|-|deferred: Phase-1 scope; port grid and OOM-killer entity absent from render and engine
840|3|Tier 2 — "Two U in Someone Else's Cage" / `Cage 14, Row C`|PARTIAL|e2f69d3 5a10383 0a2f1ca|physical-layer grammar live (rack grid, PDU powerFeeds, G4 cable drag); lead-time clocks + remote-hands latency unbuilt
866|3|Tier 2.5 — "A Rack Of Our Own"|PARTIAL|e2f69d3 8a5f413|failure-domain engine live (blast.ts, T-9 rack degrade-all ratified); IPMI/out-of-band + campaign tier itself deferred
879|3|Tier 3 — "The Stack" / "The Cage" / `prod`|PARTIAL|e2f69d3 b7e262c|tiers/flows graph + blast-radius stat + MRR customers live; failover, replication lag, cache-stampede/coalescing unlock unbuilt
903|3|Tier 3.5 — "The Platform" (you sell an API; other people build on you)|PARTIAL|8fd409a|retry-storm prerequisite live (retry generations + stormFactor pressure in defaults.ts); API-product quotas/SDK tower unbuilt
914|3|Tier 4 — "Landlord" / "The Floor" / "We Are The Datacenter" / `Suite 200`|PARTIAL|e2f69d3 8a5f413|rack-as-unit topology + shared-circuit redundancy live; cooling/CRAC/generator/peering/PUE/capacity-sales absent
943|3|Tier 5 — "Anycast" / "The Map" / "Two Datacenters, One Company"|MISSING|-|deferred: Phase-1 scope; no BGP/routing/quorum-witness anywhere (grep zero)
969|3|Tier 6 — "Hyperscale" / "Region Build" / "The Grid" (endgame)|MISSING|-|deferred: Phase-1 scope; arbitration play + constellation pullback unbuilt
991|3|The difficulty comes from coupling not HP (design rule)|PARTIAL|8fd409a e2f69d3|dependency holds first-class (blocked-occupied slots) + 4-relation graph; shared-dependency/upstream-blindness rungs 3-6 unbuilt
1006|3|The camera ladder (six fixed tiers as authored art treatments)|PARTIAL|4ff4a4f|camera.ts ALTITUDE_TABLE Z1-Z4 with LOD columns; Z0 chassis + Z5 globe + per-tier art sets deferred (ADR-0008 real atlases owed)
1019|3|The Elevator Transition|PARTIAL|4ff4a4f|CameraRig.go animates altitude change (600ms log-interp, never hard cut); tier-up dissolve + you-are-here frame unbuilt (no tiers)
1027|3|Zoom-as-Abstraction (the LOD swap)|PARTIAL|4ff4a4f 0acf46e|LOD0-3 discrete-swap law in camera.ts; per-entity four representations + heat-tile folding still spike-stage (substrate mount HOLD)
1038|3|The Scale Handshake Frame|MISSING|-|deferred: PHASE1-PLAN zero campaign authoring; tier-up snap frame needs tiers to exist
1048|3|Per-Tier Composition Rules|MISSING|-|deferred: Phase-1 scope (render polish beyond the test itself excluded); asset pipeline b3a149d is the substrate for it
1058|3|The Aisle Vanishing Point|MISSING|-|deferred: Phase-1 render scope; no facility-level wayfinding device
1066|3|The Growth Scar|MISSING|-|deferred: Phase-1 scope; legacy-object liability node unbuilt (save/lineage 9e701a0 preserves company history data only)
1075|3|The parallel business ladder (CEO framing)|MISSING|24dfcfe|deferred: Phase-1 scope; L0-L11 stages unmodeled; scorecard layer itself now LIVE (commitment-convergence)
1137|3|The business difficulty curve|PARTIAL|b7e262c|axes 1-3 primitives live (churn rates, contract obligation/commitments, delayed effects); axis 4 time-constants lengthening + org drag/turnover unbuilt
1156|3|The P&L Ladder (financial complexity as a gated HUD)|PARTIAL|b7e262c faf81a7|six-bucket stack + permanent cash/MRR/reputation HUD live; per-tier HUD strip gating (deferred revenue bar invisible until Tier 3) unimplemented
1177|2|1.2 Perspective-shift levels|MISSING|-|deferred: PHASE1-PLAN §Governing law; zero perspective levels shipped; primitives cited per sub-row
1184|3|The Invariant-Core filter (authoring law for every perspective level)|PARTIAL|ef8f35e b1f757e|seventh-verb ban enforced via loader VERB_SHIFT (lint.ts cites §1.9); door grammar is 8 verbs; no perspective levels to filter yet
1199|3|The Perspective Frame Device|MISSING|-|deferred: Phase-1 scope; no per-perspective viewport chrome (era-tokens is the only frame-adjacent system)
1219|3|`The Tenant` / "The Customer"|MISSING|-|deferred: Phase-1 scope; asset-tag recognition device unbuilt
1232|3|`Red Team Friday`|PARTIAL|2421257 d076ad5|attacker-side machinery live: versus deck draft/commit hh-versus-deck-v1 blind play; recon-aesthetic level + intel-unlocks-defense loop unbuilt
1248|3|`The NOC Shift` / "On-Call Night"|PARTIAL|b1f757e faf81a7|triage primitives live (hands, alertStack FP/SNR fatigue law, false-positive model); pure-reactive level + 4am grade unbuilt
1262|3|`The New Hire`|PARTIAL|55a6086|fog-of-instrumentation live in observed/ (grades stale/unknown); crated-object visual + runbook/ticket investigation tools unbuilt
1281|3|`The Auditor` / "Audit Week"|MISSING|-|deferred: Phase-1 scope; no findings/compliance engine (audit-right is only a clause id in SLA_CLAUSE_IDS)
1299|3|`The Auditor, Inverted`|MISSING|-|deferred: Phase-1 scope; depends on unbuilt audit machinery
1306|3|`The Datacenter Tech` / "Remote Hands"|PARTIAL|e2f69d3 0a2f1ca|connect/disconnect socket grammar + G4 drag-a-cable gate live; work-order ambiguity/part-wrong minigame + 1.7m no-zoom frame unbuilt
1325|3|`The Migration Crew` / `The Migration`|MISSING|-|deferred: Phase-1 scope; no TTL-drain/cutover crossfade mechanic
1341|3|`The Abuse Desk`|MISSING|-|deferred: Phase-1 scope; abuse exists only as registry prose + i18n abuse-flavour root (08d4fe2); no RBL/suspend mechanics
1358|3|`The Support Queue Level`|MISSING|-|deferred: Phase-1 scope; ticket vocabulary in packs only; no ticket handle-time/deflection mechanics (cost-to-serve unbuilt)
1376|3|`The Landlord`|MISSING|-|deferred: Phase-1 scope; tenant-tour/PUE sales verbs unbuilt
1385|3|`The CDN`|MISSING|-|deferred: Phase-1 scope; cache-hit-ratio playstyle absent (CDN appears only as a coverage defense-role example)
1391|3|`The Upstream`|MISSING|-|deferred: Phase-1 scope; transit-provider chair unmodeled
1398|3|`The Registrar` / `NXDOMAIN`|MISSING|-|deferred: Phase-1 scope; DNS-hosting and registrar types not in the 2 shipped type cards
1406|3|`Eyes of the Packet`|PARTIAL|0a2f1ca|its tutorial payload (Latency Ladder) is live: g4/latencyDelta.ts latencyLadderRows; first-person per-hop level unbuilt
1415|3|`Founder Mode` / "The CEO Chair"|PARTIAL|a864061|autopilot half exists: runUnattended executes with zero player actions + guardrail halts; chair-switch UI + delegation policies unbuilt
1431|3|`The Sales Chair`|MISSING|-|deferred: Phase-1 scope; sales-pipeline verbs unbuilt
1439|3|`The Board Meeting`|MISSING|-|deferred: Phase-1 scope; interstitial decision beat unbuilt
1446|3|`Due Diligence` (walking someone else's floor)|MISSING|-|deferred: Phase-1 scope; whatIf forward-sim (a864061) inspects own board only
1454|3|`The Capacity Planner`|MISSING|-|deferred: Phase-1 scope; 18-month horizon + order lead times unbuilt (whatIf horizons are its nearest primitive)
1460|3|`The Apprentice` (you may only write rules)|PARTIAL|1fb4fc6 b1f757e 2421257|rule-authoring-only loop live: policy rows-not-code interpreter + CommitPolicy card verb + AI rule-phase execution in versus; level + improvise-scoring unbuilt
1469|3|`The Acquisition` (fogged inheritance)|MISSING|-|deferred: Phase-1 scope; probe/trace economy + normalization bar unbuilt (observed fog is the reusable half)

## SUMMARY
DONE: 19
PARTIAL: 30
PROBLEM: 0
MISSING: 38
NA: 10

## TOP-PROBLEMS
1. P15 pivot double-carry (382) and the whole Business Line System family (504/514/523/534/542) are unbuilt: the variety engine's late-game half has no engine, only the two g1 type cards (deferred: PHASE1-PLAN §Governing law zero shipped content).
2. P13 contract-as-tower is data-only: SLA_CLAUSE_IDS 13-clause table ships as refs (b7e262c) but the paper-layer board where clauses are placed/negotiated does not exist — pillar language promises "a tower tree parallel to the technical one".
3. Camera ladder stops at Z1-Z4 (camera.ts ALTITUDE_TABLE): Z0 Chassis and Z5 Globe plus the six authored art sets are owed; substrate LOD folding is still a spike with mount HOLD (0acf46e, ADR-0008 deferral until real atlases).
4. 1.2's flagship premise — perspective levels — has zero shipped levels; only fragments exist (versus attacker deck 2421257, unattended autopilot a864061, policy-only commit verb, observed fog). The Invariant-Core filter is enforced for type cards via VERB_SHIFT lint but filters nothing yet.
5. Scarcity Table coverage is 2/~32 rows (4ce67fc): catalogue rows like GPU/colo/email each need a Ruleset Card + fifth axis; engine supports the shape (loader, applyFifthAxis) but no content lane is scheduled — OD-14 canon count still OPEN per DECISIONS-PENDING.
6. Era axis ships exactly 2 eras (1998/2026) with eraOverrides empty in the shared-web card; the spec's "not invented yet" tech greying and 5-era campaign spine are unbuilt; era expansion is an explicitly open owner item (OD list).
7. P20's "boring middle" — lead times, remote-hands latency, demand charges, RMA — is absent engine-wide (grep zero for leadTime/remoteHands); Tier 2's formative "eight weeks" moment has no mechanism to hang on.
8. P9 reward loop is silent: conversion economics are live but the celebration layer (coin/sound per conversion) never mounts — AudioBus is a zero-sample façade (28f638e) and no chrome wires conversions to presentation.
9. Business difficulty axis 4 (decision time-constants lengthening per rung) has no representation; the ladder rows (1075/1137/1156) are all PARTIAL/MISSING because campaign gating does not exist even though every underlying money primitive does.
10. Tier 0 (the doc's most-argued teaching level, three-lens powerlessness correction) has no artifact; its lesson engine (12-slot hockey-stick) is fully testable in pipeline/queue.ts — the gap is purely campaign authoring deferred by plan law.
