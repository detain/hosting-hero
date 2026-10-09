# Group g05 audit — 1.10–1.15 In-level structure, campaign metagame, level shapes, mutators, bosses, eras — lines 5095-5995

Scope note: outline.md Table 2 shows 6 ## + 109 ### in range (brief said 100 ###; disk says 109 — trusted disk, 115 rows). Overarching fact: `docs/PHASE1-PLAN.md:60` ratifies Phase-1 scope as "zero shipped content, zero campaign authoring, zero render polish beyond the test itself" — every named level/campaign/boss/mutator catalog item in this range is out-of-scope by design, hence MISSING `deferred:` with engine-enablement notes. All hashes verified via `git cat-file -e` at master tip `58f5186`.

## MANIFEST
line|level|heading|STATUS|hash(es)|note
5095|2|1.10 In-level structure: shifts, windows, forks and framing|MISSING|-|deferred: PHASE1-PLAN ln60 zero content. No shift/window/fork/framing machinery in sim-core or proto
5100|3|Shift Structure (day/night pacing)|MISSING|-|deferred: PHASE1-PLAN ln60. Business-clock substrate exists (kernel/time.ts SimMinute + macro clock) but no shift/peak phase pacing
5109|3|The Change Window|MISSING|-|deferred: PHASE1-PLAN ln60. No build-during-peak self-inflicted-outage risk anywhere in pipeline/
5117|3|Quarter Arc|PARTIAL|b7e262c 0a2f1ca|Quarter machinery shipped (economy term/cliff/dunning + gates/g5/quarter.ts month boundaries + shift-13-style incident at 77760) but no 13-shift pacing arc
5124|3|The Signed Contract (pre-level difficulty as a negotiation)|PARTIAL|b7e262c|PHASE1-PLAN:146 records clause DATA live (13-clause SLA table economy/contract.ts SLA_CLAUSE_IDS) with slider UI ⏳ partial. errorBudget.ts covers availability dial semantics only
5146|3|The Difficulty Contract / Statement of Work|MISSING|-|deferred: PHASE1-PLAN ln60. No briefing-screen object
5154|3|The Deal Sheet (level intro card)|MISSING|-|deferred: PHASE1-PLAN ln60. i18n ticket.* flavour copy ships (08d4fe2) but no intro-card artifact
5161|3|The Objective Totem|MISSING|-|deferred: PHASE1-PLAN ln60. No objective-object render surface anywhere
5173|3|The Constraint Band|MISSING|-|deferred: PHASE1-PLAN ln60. No UI-furniture mutation by scenario rule
5184|3|The Midpoint Fork|MISSING|-|deferred: PHASE1-PLAN ln60. No in-level two-card choice mechanics
5197|3|The Double-Header (two boards, one budget)|MISSING|-|deferred: co-op slice PHASE1-PLAN:167 marked not-yet-built. Single GameState.board only
5206|3|The Scenario Icon Family|MISSING|-|deferred: PHASE1-PLAN ln60. Media prompt library ships art-generation prompts but no scenario icon set
5217|2|1.11 Campaign metagame and topology|MISSING|-|deferred: PHASE1-PLAN ln60 zero campaign authoring. No campaign/run-structure code exists
5221|3|The Spine and the Sidings|MISSING|-|deferred: PHASE1-PLAN ln60. Tier ladder is design-law only (ADR-0005 one-engine-seven-tiers) with no campaign runner
5230|3|The Pivot Map (the campaign is a node map, not a line)|MISSING|-|deferred: PHASE1-PLAN ln60. Generic graph substrate topology/MultiGraph e2f69d3 could host it but nothing campaign-shaped does
5236|3|The Campaign Market Map (where you expand, not just what you build)|MISSING|-|deferred: PHASE1-PLAN ln60. No competitor AI or market nodes anywhere in repo
5247|3|Branch-and-Merge campaign topology|MISSING|-|deferred: PHASE1-PLAN ln60. save/lineage.ts (9e701a0) models generational edges but not level-graph branching
5255|3|The Campaign Spine as a Patch Panel|MISSING|-|deferred: PHASE1-PLAN ln60. Cosmetic campaign-map concept unimplemented
5264|3|Level Select as the Job Board|MISSING|-|deferred: PHASE1-PLAN ln60. i18n ticket.* copy (08d4fe2) is the only adjacent artifact
5272|3|The Retrospective Level Select|MISSING|-|deferred: PHASE1-PLAN ln60. Lineage graph + replay causality could source it but no screen exists
5279|3|The Recurring Cast|MISSING|-|deferred: PHASE1-PLAN ln60. Named NPCs absent. visitors/archetypes-core.json is anonymous archetypes only
5292|3|The Cold Open Level (the actual first five minutes)|MISSING|-|deferred: PHASE1-PLAN ln60
5301|3|Chapter Epigraphs|MISSING|-|deferred: PHASE1-PLAN ln60. Editorial text device with no shipped text file
5310|3|The Ratchet Audit (a level that tests only your carried-over automation)|PARTIAL|a864061|runUnattended (unattended/fastForward.ts) literally runs the sim without a player and reports what ran unattended — the engine core of this level — but the no-budget audit level shell is absent
5319|3|"The Same Company, Five Years Later" (time-skip levels)|MISSING|-|deferred: PHASE1-PLAN ln60. Nothing ages a board off-screen or models undocumented drift
5328|3|Lead Time as a first-class progression axis|MISSING|-|deferred: PHASE1-PLAN ln60. grep leadTime across sim-core src = zero hits. No ordering pipeline
5337|3|The Rebuildability stat|MISSING|-|deferred: PHASE1-PLAN ln60. No per-machine rebuild-hours field in topology node records
5347|3|Redundancy grammar as a progression ladder|PARTIAL|5a10383 e2f69d3|topology/redundancy.ts ships effective-vs-nominal N+1 verdicts ("Broken N+1" §4.2 R14). The purchase ladder and concurrently-maintainable enforcement are absent
5357|3|Ratchet Progression (knowledge is never lost; capacity is)|PARTIAL|9e701a0|save/lineage.ts encodes the law exactly (child inherits EXACTLY 3 tech nodes + doctrine + playbook, never cash/customers). No campaign unlock graph exists to lose capacity against
5361|3|Seeded Weekly Ruleset|PARTIAL|2421257|versus/ seeded draft (streamFor versus/draft) + affix slots + era data are the generator primitives; no weekly scheduler, no 6-char share code
5368|2|1.12 New level shapes and business-layer levels|MISSING|-|deferred: PHASE1-PLAN ln60. Phase-1 shipped only the g1 wave slices + six gate fixtures
5375|3|The Decommission|MISSING|-|deferred: PHASE1-PLAN ln60. disconnect verb + opt-in drain policy (c253643) are the shipped primitives; no sunset-the-whole-thing level
5388|3|The Scream Test|MISSING|-|deferred: PHASE1-PLAN ln60. Unplug-and-wait verb cycle absent (drain is graceful-shutdown only)
5402|3|The Reconciliation|MISSING|-|deferred: PHASE1-PLAN ln60. No CMDB-vs-floor inventory dual-source or ghost-asset concept
5415|3|The Dry Run|PARTIAL|a864061|whatIf (unattended/whatIf.ts) runs a simulated counterfactual of an event and reports deltas — the invisible-simulation core — but preparation scoring and cancellation level shell absent
5424|3|The Second Opinion|MISSING|-|deferred: PHASE1-PLAN ln60. consultant save-mode rows ship as write-matrix data (74f157b) with no inspect-only runner; findings report unbuilt
5434|3|The Handover|MISSING|-|deferred: co-op slice PHASE1-PLAN:167 awaits build (OD-5 ratified 2026-10-09 but unblocked-not-built)
5443|3|The Fleet Week|MISSING|-|deferred: PHASE1-PLAN ln60. No spreadsheet-only capacity-planning mode
5451|3|The Bake-Off|MISSING|-|deferred: PHASE1-PLAN ln60. tools/perf ab.ts A/Bs engine code paths, not two player architectures
5459|3|The Inherited Contract|PARTIAL|b7e262c|Contract object with termStart/End + clause refs + errorBudget + dunning breach machinery ships (economy/); reach/renegotiate/breach three-path level absent (no renegotiation API at all)
5467|3|The Two-Timeline Level|MISSING|-|deferred: PHASE1-PLAN ln60. No mid-level intercut or past-actions-change-present loop
5475|3|The Long Now|MISSING|-|deferred: PHASE1-PLAN ln60. fastForward substrate (a864061) runs long horizons but no 10-year strategy layer with off-screen incident summaries
5483|3|The Postmortem Level|PARTIAL|b9295b5|replay/causality.ts ships the investigation core: buildCauseIndex, traceContributingFactors (plural factors), redHerringLane, oneSentenceExplanation — never accepts single root cause per spec. Level shell + corrective-action unlocks absent
5494|3|The Sales Engineer's Nightmare|MISSING|-|deferred: PHASE1-PLAN ln60. Deal-accept stream + six-months-forward reveal unbuilt
5503|3|Column Fodder|MISSING|-|deferred: PHASE1-PLAN ln60. RFP qualification hidden stats unmodeled
5516|3|The Capacity Auction|MISSING|-|deferred: PHASE1-PLAN ln60. No bidding AI
5524|3|The Regulator's Sandbox|MISSING|-|deferred: PHASE1-PLAN ln60. No ambiguous-rule interpretation object
5533|3|The Rate Card|MISSING|-|deferred: PHASE1-PLAN ln60. billing.ts billedMrc/escalator is per-contract pricing only. No price-book authoring level (§4.9 Pricing Engine not built)
5549|3|Due Diligence (the level where you are the one being read)|MISSING|-|deferred: PHASE1-PLAN ln60. Buyer-request loop unmodeled. audit-right clause ref (b7e262c) is the only adjacency
5564|3|Consent to Assignment|PARTIAL|b7e262c|economy/contract.ts SLA_CLAUSE_IDS ships consent-to-assignment as a LIVE clause data-ref (P13 law: ids in economy, semantics on ruleset cards). The 60-day consent-collection level is absent
5575|3|The Book Sale|MISSING|-|deferred: PHASE1-PLAN ln60. Partial-divestiture mechanics (TSA/non-compete/staff transfer) absent
5585|3|The Ramp|MISSING|-|deferred: PHASE1-PLAN ln60. Colo ramp schedules absent. etf + deposit-or-loc clause ids (b7e262c) are token-level adjacency only
5597|3|Anchor Tenant|MISSING|-|deferred: PHASE1-PLAN ln60. Concentration risk exists as a revenue-quality tag axis (contract.ts RevenueQualityTags) but no concentration meter or whale-tenant level
5604|3|Take-or-Pay|MISSING|-|deferred: PHASE1-PLAN ln60. No minimum-usage commit field. commitmentBps is SLA-availability only
5615|3|Kilowatt Casino (power resale and demand response)|MISSING|-|deferred: PHASE1-PLAN ln60. Power graph shipped (topology powerFeeds e2f69d3) but demand-response revenue + TOU pricing + PUE targets absent
5622|3|Interconnect Queue|MISSING|-|deferred: PHASE1-PLAN ln60. Utility-queue calendar absent
5635|3|Backlog|MISSING|-|deferred: PHASE1-PLAN ln60. Installed-vs-signed MRR queue absent
5647|3|Price Increase Day|PARTIAL|b7e262c 0a2f1ca|annual-escalator clause live (billing.ts:135 hasClause) + churn ladder + g5 whale price-increase-refused/lapse scripted. Player-driven across-the-board hike with grandfathering/notice/save-desk unmodeled
5662|3|The Sunset Letter|MISSING|-|deferred: PHASE1-PLAN ln60. notice-period clause id (b7e262c) only. Deprecation-wave level absent
5672|3|The Insurance Renewal|MISSING|-|deferred: PHASE1-PLAN ln60. No insurability state machine
5684|3|Revenue Assurance Week|MISSING|-|deferred: PHASE1-PLAN ln60. Ledger exists (economy/ledger.ts) but no leak-hunt/audit-your-own-billing level
5697|3|Metering Blackout|MISSING|-|deferred: PHASE1-PLAN ln60. No metering-pipeline failure mode
5707|3|The QBR|MISSING|-|deferred: PHASE1-PLAN ln60. Concession-budget negotiation set piece absent
5717|3|The Recommended Host|MISSING|-|deferred: PHASE1-PLAN ln60. Channel-list mechanics absent
5728|3|The Partner Turns|MISSING|-|deferred: PHASE1-PLAN ln60. Platform-competitor event absent
5738|3|The Agent|MISSING|-|deferred: PHASE1-PLAN ln60. Residual-commission channel unmodeled. Revenue-quality tags are not per-source agent split
5751|3|Repatriation Season|MISSING|-|deferred: PHASE1-PLAN ln60
5762|3|Offshore|MISSING|-|deferred: PHASE1-PLAN ln60. No staffing-region model
5776|2|1.13 Level modifiers and mutators|PARTIAL|2421257|The only mutator-shaped slot in the codebase: versus AFFIX_VOCABULARY (16 §2.13 slugs, deck.ts:63) is parsed-validated but INERT in the v0 deck→waveTable converter (owner question in versus lane). None of §1.13's 27 named mutators implemented
5782|3|`Skeleton Crew`|MISSING|-|deferred: PHASE1-PLAN ln60. handCapacity dial (intent-door config) is the substrate knob a mutator would ride
5786|3|`Founder's Vacation`|MISSING|-|deferred: PHASE1-PLAN ln60. No manual-intervention budget concept separate from hands
5790|3|`Cash Only`|MISSING|-|deferred: PHASE1-PLAN ln60. No financing/credit lines exist to disable
5794|3|`Frozen Change`|MISSING|-|deferred: PHASE1-PLAN ln60. g5 scripts an E-9 refund-freeze as fixture data (0a2f1ca) only. No construction-ban rule
5798|3|`Hostile Upstream`|MISSING|-|deferred: PHASE1-PLAN ln60. No external-provider failure injection
5802|3|`Price War`|MISSING|-|deferred: PHASE1-PLAN ln60. No competitor pricing at all
5805|3|`Viral Moment`|MISSING|-|deferred: PHASE1-PLAN ln60. spike envelopes (waves/envelope.ts role spike) are the traffic primitive it would use
5808|3|`The Tour`|MISSING|-|deferred: PHASE1-PLAN ln60. No cosmetic-state scoring
5813|3|`Regulatory Sunrise`|MISSING|-|deferred: PHASE1-PLAN ln60
5817|3|`Heat Dome`|MISSING|-|deferred: PHASE1-PLAN ln60. No thermal/cooling model in sim
5821|3|`Fiber Seeking Backhoe`|MISSING|-|deferred: PHASE1-PLAN ln60. Blast-domain node kill (e2f69d3) covers graph damage but no random path-cut event
5825|3|`Deadbeat Quarter`|PARTIAL|b7e262c|dunning FSM (economy/dunning.ts: suspension ladder + write-off + E-2 recovery) ships the unpaid-invoice consequence engine. The ambient 20%-nonpayment mutator selector absent
5828|3|`Patch Tuesday`|MISSING|-|deferred: PHASE1-PLAN ln60. vulnerable-plugin-compromise threat ships in registry-core.json but no patch-timer decision object
5832|3|`The Whale`|PARTIAL|b7e262c 0a2f1ca|concentration revenue-quality axis LIVE (contract.ts RevenueQualityTags) + whale fixture c01 ($2500/mo cliff-lapse 86400) scripted in gates/g5/quarter.ts. Demand-pressure mutator absent
5836|3|`Ghost Ship`|MISSING|-|deferred: PHASE1-PLAN ln60. No inherited-undocumented-board state
5840|3|`Fire Drill`|MISSING|-|deferred: PHASE1-PLAN ln60. Dry-run-of-disaster modifier unmodeled
5845|3|`Sanction Line`|MISSING|-|deferred: PHASE1-PLAN ln60. No customer-geography enforcement
5849|3|`Media Attention`|MISSING|-|deferred: PHASE1-PLAN ln60. Reputation metric exists as observed cell (company::reputation, chrome metrics.ts) but no double-weight attention window
5853|3|`Supply Drought`|MISSING|-|deferred: PHASE1-PLAN ln60. No purchase channel to disable
5856|3|`Blind Mode`|PARTIAL|55a6086|ObservedStore fog grades (observed/instrument.ts FogGrades §4.5 R42: stale/unknown) implement "the game hides information" as shipped engine law. The level-wide instrumentation-off mutator toggle absent
5860|3|`Read-Only`|MISSING|-|deferred: PHASE1-PLAN ln60. save writeGuard facet denial (74f157b) is save-matrix semantics not in-run action denial
5865|3|`Snowflake`|MISSING|-|deferred: PHASE1-PLAN ln60. No configuration-management progression axis or per-object drift
5869|3|`Bus Factor 1`|MISSING|-|deferred: PHASE1-PLAN ln60. No staff-subsystem knowledge map
5873|3|`Boutique Managed`|MISSING|-|deferred: PHASE1-PLAN ln60. Customer-mix preset absent
5876|3|`Customer Quality Mix`|MISSING|-|deferred: PHASE1-PLAN ln60. churnRisk/abuse tag axes (contract.ts) + visitor archetypes exist as data. Seeded-mix level modifier absent
5880|3|`Observability Debt`|PARTIAL|55a6086|Uninstrumented-coverage fog is engine law (PHASE1-PLAN:165 "40% uninstrumented → all fog widgets render from the ObservedCell contract with zero bespoke fog code"). The continuous debt dial as level modifier absent
5884|3|`Lead Time`|MISSING|-|deferred: PHASE1-PLAN ln60. No hardware-arrival latency to dial (see 5328)
5890|2|1.14 Boss-shaped events (the end-of-quarter beat)|PARTIAL|b7e262c 0a2f1ca|The quarter-end beat itself exists: g5 fixture fires wave-4-slot incident at 77760 with cliff/dunning/write-off consequence sequence on the business screen; spike envelopes (waves/envelope.ts) are the shaping primitive. No named boss institution or probing→attempt→consequence three-phase object
5896|3|`The Multi-Vector Day`|MISSING|-|deferred: PHASE1-PLAN ln60. Staggered multi-family boss composition unauthored in g1 slices
5900|3|`Grid Down`|MISSING|-|deferred: PHASE1-PLAN ln60. powerFeeds graph + T-9 racks-degrade-all (8a5f413) are facility primitives. No generator/fuel/UPS model
5904|3|`The Zero-Day`|MISSING|-|deferred: PHASE1-PLAN ln60. No unpatchable-exploit event class
5909|3|`Extortion`|MISSING|-|deferred: PHASE1-PLAN ln60. No ransom decision object or attacker-pool consequence
5913|3|`The Cascade`|MISSING|-|deferred: PHASE1-PLAN ln60. blast.ts explosion chains (e2f69d3) + dependency blocking model the physics. The ignored-debt-triggered boss event absent
5917|3|`Audit Day`|MISSING|-|deferred: PHASE1-PLAN ln60. No documentation/controls inspection encounter
5921|3|`The Migration Deadline`|MISSING|-|deferred: PHASE1-PLAN ln60. Lease-end forced-move absent
5924|3|`The Competitor's Collapse`|MISSING|-|deferred: PHASE1-PLAN ln60. Competitor AI exists nowhere in repo (also blocks 5236)
5928|3|`The Declaration Cascade`|MISSING|-|deferred: PHASE1-PLAN ln60. DRaaS product line not shipped (backup is a _todo 3rd type PHASE1-PLAN:155)
5933|3|`Distrust Day`|MISSING|-|deferred: PHASE1-PLAN ln60. CA/PKI trust-anchoring event absent. ssl is a hosting type with no shipped slice
5938|3|`The Broadcast Storm`|MISSING|-|deferred: PHASE1-PLAN ln60. IXP/peering layer not modeled in topology relations (4 shipped: data/power/control/trust)
5945|2|1.15 Era treatments and presentation devices|PARTIAL|4ff4a4f ef8f35e 17f3c8b|Era ships as DATA + tokens + i18n: loader/eras.ts availability resolution (availableFrom/obsoleteBy), era-tokens.css two theme blocks, i18n era-variant packs + eraState. None of the five spec'd render presets or presentation devices exist
5950|3|The Era Shader Stack|PARTIAL|4ff4a4f c503d2d 17f3c8b|Two era themes live (data-era 1998/2026 in chrome/styles/era-tokens.css — spec wants 1994/2001/2008/2016/2030 = 5). Post-chain (render/post haze+blur+grain+vignette law) shipped but is budget-driven NOT era-driven. Era expansion an open calibration item (PHASE1-PLAN:35)
5963|3|The Time-Lapse Wipe|MISSING|-|deferred: PHASE1-PLAN ln60 zero render polish. No transition set piece
5970|3|Era-Correct Failure Aesthetics|MISSING|-|deferred: PHASE1-PLAN ln60. Alert/error chrome is era-token'd but no per-era crash aesthetic variants
5975|3|The Anachronism Flag|MISSING|-|deferred: PHASE1-PLAN ln60. Per-object era-provenance rendering absent
5981|3|The Retro Boot Screen|MISSING|-|deferred: PHASE1-PLAN ln60. No boot-sequence transition device
5988|3|Loading Is Provisioning|MISSING|-|deferred: PHASE1-PLAN ln60. loading.tip.* flavour copy ships in game.i18n.json (08d4fe2) but no staged bring-up animation screen

## SUMMARY
DONE: 0
PARTIAL: 19
PROBLEM: 0
MISSING: 96
NA: 0

## TOP-PROBLEMS
1. **Scope truth, not drift**: 96 of 115 headings are MISSING by explicit Phase-1 design (`docs/PHASE1-PLAN.md:60` — "zero shipped content, zero campaign authoring"), and none of them is silently unlisted — the plan records the exclusion. The audit found no case where this range's spec was claimed done but is absent.
2. **§1.13 mutators have no registry**: the only mutator-shaped machinery is versus `AFFIX_VOCABULARY` (16 §2.13 threat affixes, `packages/sim-core/src/versus/deck.ts:63`, `2421257`) — parsed and validated but INERT in the v0 deck→wave-table converter, and its vocabulary overlaps NONE of §1.13's 27 named level mutators. Both the inertness and the naming mismatch should be tracked as one gap row.
3. **Signed Contract four-slider is a recorded ⏳** (`PHASE1-PLAN.md:146`): 13-clause SLA data refs live (`economy/contract.ts SLA_CLAUSE_IDS`, `b7e262c`) but availability/response/scope/term as difficulty dials with a live reward formula exist nowhere; G5's contract-signing uses raw clause ids, not the negotiation front-end.
4. **Quarter Arc engine beats are scripted in a fixture, not in the engine**: `gates/g5/quarter.ts` (`0a2f1ca`) hand-scripts month boundaries, the whale cliff at minute 86,400, and the shift-13-style incident at 77,760 — the pacing law (§1.10's 13-shift arc) is represented only inside one test scenario, so it is not reusable level structure.
5. **Era rendering is 2-of-5 and data-only**: `loader/eras.ts` + `era-tokens.css` + i18n era variants ship a genuine era-resolution spine, but the spec's five shader presets (1994/2001/2008/2016/2030 vs shipped 1998/2026), era-driven post-chain wiring, Time-Lapse Wipe, and Anachronism Flag are unbuilt; era expansion is an explicitly open calibration item (`PHASE1-PLAN.md:35`).
6. **Campaign metagame (1.11) is the largest conceptual hole**: spine/sidings, pivot map, market map with competitor AI, and job-board level select have zero representation — although `save/lineage.ts` (`9e701a0`) already encodes generational edges and the exact-inheritance law that a campaign would ride.
7. **Engine enablers deserve promotion notes**: unattended/fastForward (`a864061`) is effectively the Ratchet-Audit and Dry-Run simulator; `replay/causality.ts` (`b9295b5`) is the Postmortem's multi-factor cause tracer; ObservedStore fog (`55a6086`) is Blind Mode/Observability Debt. Three of §1.12's most distinctive level types and three §1.13 mutators are therefore closer than the MISSING count suggests.
8. **No competitor AI anywhere**: blocks §1.11 market map, §1.12 Capacity Auction, §1.14 Competitor's Collapse, and §1.13 Price War simultaneously — a single missing subsystem with five heading-level blast radius.
9. **Take-or-Pay / Rate Card / metering gap in economy**: economy lanes shipped ledger/cliff/dunning/churn but no usage-commitment billing (min-commit), no authored price-book object, and no metering-failure path — the three most-requested business-layer level substrates in this range.
