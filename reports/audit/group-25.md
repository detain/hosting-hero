# Group g25 audit — 9.5 Educational angle … 9.13 Design priorities (wave-2 closing) — lines 34502-35507

## MANIFEST
line|level|heading|STATUS|hash(es)|note
34502|2|9.5 The educational angle|PARTIAL|faf81a7,9e701a0|only explain-on-demand machinery shipped (chrome explainRegistry + save codex facet), encyclopedia/glossary/drawer content absent
34504|3|⚔️ Teaching is by event; explaining is on demand|PARTIAL|faf81a7,9e701a0|ExplainValue/ExplainPopover on-demand affordance live, zero volunteered tutorial text in shipped surface, codex write facet LIVE in save, law itself has no test pin
34517|3|Field Notes|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 scope = six gates + P0 skeleton, save codex facet is the only data-plane seed
34540|3|The hosting glossary|MISSING|-|deferred: MASTER_REPORT §7, docs/GLOSSARY.md is a developer doc not an in-game feature
34549|3|The "was that real?" tag|MISSING|-|deferred: MASTER_REPORT §7, no authenticity-stamp code or schema anywhere (only flavour-word hits in packs)
34580|3|The Order of Operations card|MISSING|-|deferred: MASTER_REPORT §7, replay causality traces could supply both timelines (b9295b5) but the comparison card is unshipped
34589|3|The Unit Conversion drawer|PARTIAL|faf81a7|nines-to-minutes conversion shipped in chrome/numberLaw.ts ninesWithMinutes, the drawer and the other seven conversions absent
34598|3|The Real Postmortem Library ("this actually happened")|MISSING|-|deferred: MASTER_REPORT §7, no real-world outage corpus in repo
34609|3|A real post-level debrief card|PARTIAL|6f5da38,24dfcfe|G5 quarterly review ships the review screen + five-axis scorecard config ACTIVE, the one-sentence operational advice line absent
34616|3|Import Your Own Topology|MISSING|-|deferred: MASTER_REPORT §7, topology graph builder (e2f69d3) is internal not import-facing
34637|3|Educational mode|MISSING|-|deferred: MASTER_REPORT §7, no mode tiers in shipped product surface
34645|3|The community scenario editor|NA|-|cross-reference pointer row (see §9.7/§9.10), targets audited in the level-editor and scenario-sharing rows
34650|2|9.6 Design guardrails|PARTIAL|24dfcfe,ea7acee,faf81a7|many guardrails are now enforced code law (scorecard, three-clock, explain-all, skin kit), marking/downside/synergy-number rows unenforced
34655|3|Every tower has a downside — except a small curated set|MISSING|-|unlisted: the curated pure-win buildables (label printer, blanking panel, EPO guard …) are not in shipped g1 content and the law has no enforcement point
34672|3|No optimal build order|PARTIAL|47b2c33,e24e1bb|seeded wave generation and the Second-Answer rule (coverage secondAnswerGaps, ADR-0009 all-registry obligation) landed, Anticipation Track exists only as a save UnlockVia value
34683|3|Lose slowly — with an operational definition|PARTIAL|faf81a7,4ff4a4f|distanceToBreach + planPromotion + promotedClock cap ship the warning machinery, the three-minutes-of-visible-warning law is pinned by no test
34691|3|Teach through loss, never through text|PARTIAL|faf81a7|law holds in the shipped surface (player-initiated explaining only, no popups) but is unverifiable until campaign content exists
34698|3|The three-clock rule|DONE|4ff4a4f,faf81a7|BUDGET_CAPS.promotedClock = 3 in render/budget.ts with admit/refusal tested, chrome/promotion.ts enforces exactly-three promotion
34701|3|The player must always be able to answer "what is the worst thing that could happen right now"|MISSING|-|unlisted: no worst-case overlay exists, PanicLayout (faf81a7) dims non-essentials but never answers the question
34704|3|Every number on screen must be explainable|DONE|faf81a7,0a2f1ca|Explain This Number affordance shipped (chrome/explainRegistry.ts + ExplainValue.vue) and every G5 widget carries an ExplainPayload
34708|3|No mechanic may be invisible in both directions|PARTIAL|55a6086|observed/ dual-state + fog gives the see-it-working/see-it-failing contract used by all gates, no explicit per-subsystem visibility test
34712|3|Every irreversible action is marked before it is taken, not after|PARTIAL|0a2f1ca,40faf58|G4 terms card previews consequences before commit and the annual prepay-lock notice marks the one-way money move, the one-way-door icon law is unenforced
34718|3|Revenue is never just a number|PARTIAL|b7e262c|six-bucket ledger, deferred revenue, term cliffs, dunning model kind/duration/claims/arrival, the four-question gate is authoring practice not a lint
34724|3|Make the boring thing beautiful — with a budget mechanism|MISSING|-|unlisted: no FX catalogue or prevention-pairing approval machinery shipped, ADR-0009 scales the pairing budget to ~200 threats as future art-lane law
34743|3|Asset reuse discipline|DONE|b3a149d,4ff4a4f|Five-Asset Skin Kit is a closed contract (sixth asset throws, tools/assetpack), exactly-five instrument faces held (ADR-0001, G1_INSTRUMENTS)
34751|3|Accessibility as a feature, not a setting|PARTIAL|faf81a7,6f5da38|Shape-First pips and Readout Mode shipped as genuinely good-to-play modes, One-Hand/Sonified absent, Minimalist⇄Shape-First skin owed by OD-16
34762|3|Pause-and-plan is the default pacing|DONE|8fd409a,0a2f1ca|pause-with-orders is shipped door law (§7.13, intent-door header + GLOSSARY row), all six gates are step-driven discrete ticks
34767|3|Peacetime must be valuable|PARTIAL|a864061,b7e262c|Long-Weekend fast-forward + What-Would-Break + dunning/debt give real peacetime mechanics, drills/documentation/patching loops absent
34771|3|The reward is letting things through|DONE|24dfcfe,ea7acee|OD-1 commitment-convergence scorecard LIVE with conversion-funnel axis displayed leading (24dfcfe), OD-3 kept the wide census under the conversion-reason pacing-valve law (ea7acee)
34783|3|The game must let you be good at this job|MISSING|-|deferred: MASTER_REPORT §7, mastery-win campaign levels are out of Phase-1 scope
34792|3|Nothing has an immediate result|DONE|8fd409a,b7e262c|hand occupancy ticks, tick+1 queued intents (door refuses future stamps), contract terms/cliffs/dunning make every effect delayed by construction
34796|3|⚔️ "Ship the real monsters" vs "hosting is flavour for mechanics" — a resolution|PARTIAL|47b2c33,e24e1bb,ea7acee|role-coverage filter ships (contentInspector role laws + coverage grid) and OD-3 ratified the reality-source census, the playability veto has no code gate
34808|3|Hosting-type authoring tests (belongs with §0.2)|DONE|ef8f35e|loader lint enforces all three named tests: THREE_CHANGE (3–5 budget), VERB_SHIFT, ROSETTA
34817|3|Line synergy and antagonism, with numbers (belongs with §0.2)|MISSING|-|unlisted: multi-line play not shipped (two official types only), the proposed synergy/antagonism numbers were not in the ADR-0009 ratified batch
34836|2|9.7 Long-tail and stretch ideas|PARTIAL|b9295b5,ef8f35e|replay engine and scenario-as-data machinery shipped, spectator/editor/live-service ideas absent
34838|3|Level editor and workshop|PARTIAL|ef8f35e,4ce67fc|a scenario genuinely IS a small data file (type bundles + ruleset-diff linter shipped), no editor UI or workshop distribution
34846|3|Spectator, replay and the Timeline Scrubber|PARTIAL|b9295b5|full replay bundle/verify/bisection/causality/compact codec shipped, the scrubber UI, 16× speed, letterbox overlay and causality-line mode unshipped
34860|3|The Stream Overlay|MISSING|-|deferred: MASTER_REPORT §7, outside the six-gate Phase-1 scope
34869|3|Seasonal live events|MISSING|-|deferred: MASTER_REPORT §7, live-ops calendar not in any shipped plan
34875|3|Company culture as a stat|PARTIAL|9e701a0|culture is a real CompanyNode field governed by the save write matrix, the hiring/retention/late-warning consequence loops are not modelled
34886|3|Real uptime leaderboard|MISSING|-|deferred: OD-13 (save trust/notarization) explicitly lists leaderboard integrity for a later save lane, uptime streak ledger (9e701a0) is the kernel
34893|3|The screensaver / idle view — "The Aquarium"|MISSING|-|deferred: ADR-0001 keeps the Museum/Aquarium/export-screenshot budget line alive at 2D, ARCHITECTURE §9 Cinema clause defers the render work
34909|3|The Whiteboard Mode|MISSING|-|deferred: MASTER_REPORT §7, annotation exists only as a render layer (4ff4a4f), streaks lastEraseAtTick is a whiteboard-anchor field with no UI
34916|3|Mobile companion / status page|MISSING|-|deferred: MASTER_REPORT §7, the diegetic status surface exists only inside the desktop proto (G5)
34923|3|Franchise and multi-company play|MISSING|-|deferred: named a stretch goal by the heading itself (§9.1 mode tiering), lineage graph (9e701a0) is the only adjacent machinery
34934|2|9.8 Onboarding, difficulty and assistance|PARTIAL|faf81a7,6f5da38|assistance machinery (Readout, Shape-First, click-to-link, Explain) shipped, onboarding/tutorial design absent by scope
34939|3|The Tutorial Is An Interview|MISSING|-|deferred: MASTER_REPORT §7, concept documented in GLOSSARY (The Interview row) but unbuilt
34948|3|Systems arrive one per level for the first act|MISSING|-|deferred: campaign level sequence is out of Phase-1 scope
34954|3|Assistant modes — three dials on three different axes|PARTIAL|a864061|the autopilot axis is real (unattended Long Weekend + guardrails + What-Would-Break advisory), the three-dial UX and Simplified Economy axis absent
34966|3|"Explain This Incident" — an accessibility feature that is also a design test|DONE|b9295b5,faf81a7|replay/causality.ts oneSentenceExplanation + traceContributingFactors generate the plain-language chain from actual sim state (the design test), chrome Explain chain surfaces it, dedicated shell button not wired
34981|3|Readout Mode|DONE|faf81a7|chrome/instruments/InstrumentBezel.vue implements Readout Mode (numeric readout beside every diegetic face) with pinned component tests
34990|3|Accessibility Replay|PARTIAL|b9295b5|the replay substrate the heading says makes this cheap already exists (codec + verify), the 0.25× scrub + caption-track mode is unshipped
34997|3|One-Hand Mode|MISSING|-|deferred: ADR-0001 kept the accessibility program, OD-16 (Shape-First/one-hand a11y sprint) still OPEN
35003|3|Sonified Mode|MISSING|-|deferred: ADR-0008 lane 3 shipped the AudioBus façade (28f638e) with zero sonification/telemetry mapping and nothing mounted
35011|3|The baseline accessibility commitments|PARTIAL|faf81a7,0a2f1ca|shape-first chips (12-vocab notches), G4 click-to-link + keyboard port navigation, halt available, G3 shape pips shipped, scalable UI, captions with direction and reduced-flashing not enforced
35021|3|The Cursor|MISSING|-|deferred: OD-12(e) keymap/focus-order row still pending, no custom cursor state machine in chrome
35031|2|9.9 Endings and the shape of a finish|PARTIAL|9e701a0|succession kinds (exit/failure_restart/found/npc_pivot) + streak ledger ship the end-shape as data, no epilogue or narration is shipped
35036|3|The Acquisition Endgame|MISSING|-|deferred: MASTER_REPORT §7, acquisition exists only as a save UnlockVia value (node.ts), the versus competitor engine (2421257) is unwired to it
35046|3|The Exit Interview (yours)|MISSING|-|deferred: MASTER_REPORT §7, the five-years-after epilogue is unshipped, lineage tree is its data substrate
35055|3|The Quiet Handoff|MISSING|-|deferred: MASTER_REPORT §7, the keeps-ticking kernel exists (uptime streak + erase stamp, 9e701a0) but no handoff sequence
35065|3|Becoming the Thing|MISSING|-|deferred: MASTER_REPORT §7, postscript level is campaign content
35074|3|Two Companies, One You|MISSING|-|deferred: MASTER_REPORT §7, lineage models past companies as nodes but none run as an NPC
35083|3|Failure is Narrated, Not Punished|PARTIAL|9e701a0,b9295b5|failure_restart succession kind plus causality oneSentenceExplanation are the real-cause machinery, the obituary page and carried-over lesson are unshipped, insolvency end-state still an OPEN owner call (MODULE-STATUS.md:101, cross-cite group g19)
35095|3|The end credits roll down a cable tray|NA|-|one-line editorial gag, no implementation surface
35100|2|9.10 Community, cosmetics and exportable artifacts|PARTIAL|b9295b5,ef8f35e|the exportable-replay half has real machinery (bundle codec, scenario-as-data format), cosmetics/photo/logo systems wholly absent
35105|3|Photo Mode / Rack Portrait Studio|MISSING|-|deferred: ARCHITECTURE §9 Cinema-module clause, ADR-0001 traded free-camera photo mode to the 2D deferred budget line
35113|3|Blueprint Export|MISSING|-|deferred: MASTER_REPORT §7, no schematic renderer shipped
35118|3|The Rack Elevation Poster|MISSING|-|deferred: MASTER_REPORT §7, the two-face front/back law (ADR-0001 C13) is its precondition and is itself art-pending
35125|3|The "Everything Is Green" screenshot|MISSING|-|deferred: MASTER_REPORT §7
35131|3|The Logo Generator|MISSING|-|unlisted: no logo/mark generation machinery anywhere in src
35140|3|The Customer Logo Generator|MISSING|-|unlisted: G5 auto-names customers (6f5da38) but the logo system does not exist
35147|3|Sticker Pack Cosmetics|MISSING|-|deferred: no cosmetics layer shipped, the skin-kit pipeline (b3a149d) is its eventual vehicle
35154|3|Cosmetic Economy (non-pay)|MISSING|-|deferred: ADR-0008 lane 1 shipped only the build-time compiler, no earn/unlock economy exists
35162|3|The Seasonal Decoration Pack|MISSING|-|unlisted
35167|3|Rack Cards (collectibles)|MISSING|-|unlisted: hardware-afterlife data the card needs is not tracked
35174|3|The Hall of Fame Drive|MISSING|-|unlisted: streak ledger (9e701a0) is the nearest kernel
35181|3|The Postmortem Club|MISSING|-|deferred: social blob-store service outside Phase-1 scope, OD-5(b) portable-library stance is its architectural precondition
35193|3|The Failure Hall of Fame|MISSING|-|deferred: needs upload + scenario packaging, replay codec (b9295b5) is the shipped precondition the heading names
35200|3|Scenario sharing (and the interview-practice side effect)|PARTIAL|ef8f35e,4ce67fc|the export format IS designed as-if-shareable (strict type-bundle schema + 8-code ruleset diff linter shipped), the sharing surface itself is absent
35207|3|Real Runbook Export|MISSING|-|deferred: MASTER_REPORT §7, Policy Book rows are data (1fb4fc6) and thus exportable in principle, no renderer exists
35215|3|The Ledger Export (your P&L)|MISSING|-|deferred: chunked journal + invoice index ship the accounting data (d29867f), no statement document is produced
35223|3|The Ops Diary Comic and The Postmortem Blog|NA|-|cross-reference pointer row to §9.3, audited there
35229|2|9.11 Production guardrails and responsible depiction|PARTIAL|08d4fe2,354261d,ef8f35e|depiction ban-list enforced and localisation packs shipped LIVE, type-as-data at 2 of ~20 types, realism toggles parsed but unconsumed
35233|3|Responsible Depiction Note|DONE|08d4fe2|§9.11 technique ban-list is enforced by packages/content/script/validate.mjs (:67, :296) over every shipped template, business depicted never the how-to, validator CI-covered
35252|3|Localisation and ticket packs|DONE|08d4fe2,354261d,40faf58|swappable per-line i18n packs LIVE (98+75 templates, schema, validator gates, loader resolve/fill API, proto surfaces speak the packs), the community-pack format is exactly the per-type pack the heading prescribes
35261|3|Hosting-Type as Data (the variety engine's architecture)|PARTIAL|4ce67fc,ef8f35e,ea7acee|the bundle format (visitor/threat/buildable/ticket-pack/wave-table as one first-class object) is canonical and proven by both shipped official types and G6, the twenty-publication plus the ratified-but-owed metricNamespaceTier field are open
35273|3|Real-World-Shaped Data Mode|PARTIAL|ef8f35e|realismToggles (p95billing, demandCharges) exist as strict-parsed frozen bundle fields in types.ts + loader, but zero engine behaviour consumes them today, toggles are currently no-ops
35286|2|9.12 Small ideas that didn't fit anywhere else|MISSING|-|deferred: MASTER_REPORT §7, two rows have field-level seeds noted on their own rows below
35290|3|The Crash Cart|MISSING|-|unlisted
35296|3|The Blanking Panel|MISSING|-|unlisted: named only in the §9.6 curated pure-win list which is itself unenforced
35302|3|The Grounding / Bonding check|MISSING|-|unlisted
35308|3|The ESD strap|MISSING|-|unlisted
35314|3|Spare Parts Cannibalization|MISSING|-|unlisted
35320|3|Firmware as a hidden version axis|PARTIAL|e2f69d3|TopoNode.softwareVersion ships as the shared-version correlation field and software is one of the five CORRELATION_TYPES, per-component (BIOS/BMC/NIC/HBA) versioning absent
35326|3|Patch Debt|MISSING|-|unlisted: appears only as i18n flavour text, no risk-score mechanic
35332|3|The Maintenance Window Negotiation|MISSING|-|unlisted: TopoNode.changeWindow models the time-correlation bucket not the customer negotiation
35341|3|The Rollback That Isn't|MISSING|-|unlisted: the one-way-door icon law is unenforced (see the §9.6 marking row)
35348|3|The Runbook You Wrote At 4am|MISSING|-|unlisted: runbook ladder is named in save/faces.ts law text but no quality-penalty mechanic exists
35355|3|IP Reputation as an inherited property of address space|MISSING|-|unlisted: company-level reputation metric ships (save/economy + HUD), address-space history does not
35365|3|Latency as a physical constraint on the world map|MISSING|-|unlisted: queueing latency is live in the pipeline, the geographic ~5µs/km floor and POP geometry puzzle are not modelled
35375|3|The Broker Lunch|MISSING|-|unlisted
35381|3|Conference Booth Builder|MISSING|-|unlisted
35387|3|Cross-references for small ideas placed elsewhere|NA|-|navigation map row, all targets audited in the §9.1–9.4 groups
35398|2|9.13 Design priorities — the wave-2 closing notes|DONE|6f5da38,0a2f1ca,1b9b3ba|this section became the ratified Phase-1 scope itself: six gates shipped headless (sim-core gate-g1..g6 suites) and as mounted panels, priority rows tracked in the rows below
35405|3|What to prototype first (the game-design lens, in order)|DONE|6f5da38,0a2f1ca|the six steps shipped as gates G1–G6 in order: bounce loop, attack-surface ledger, suspicion dial, drag-a-cable, one quarter, two hosting types one engine (G6 carries the zero-type-specific-branch grep proof)
35419|3|The six changes the game-design lens would make first|PARTIAL|b7e262c,e24e1bb,24dfcfe|error-budget-as-spendable-currency LIVE (economy/errorBudget.ts deliberate spends), coverage grid LIVE, rosetta/invariant-core authoring lints LIVE, scorecard reweight landed, mazing layer and Handover Note partial or absent
35436|3|The ten highest-value items from the operations lens|PARTIAL|55a6086,47b2c33,e2f69d3|telemetry resolution, telegraph bands (waves/bands.ts) and all five correlation types shipped, DRaaS/what-grew/lead-time/demand-charge/grace-window items unshipped, hands ship attention but OD-17 names coordination unmodelled
35459|3|The structural fixes the generalist lens would insist on|PARTIAL|9e701a0,74f157b,58f5186|one Company object with four faces (save/faces.ts Wall/Scrapbook/Almanac/People) and the Long Save are DONE, mode tiering shipped as the 192-row save matrix but OD-16 amendments stay open, the four guardrails land mixed per the §9.6 rows
35471|3|What the art lens would fund first|PARTIAL|faf81a7,9e701a0|Readout/Shape-First modes and the Museum walk-through query view shipped, the prevention-FX budget line and the photo/export screenshot engine are deferred (ADR-0001 Cinema clause)
35482|3|The single most valuable moment the business lens would build|MISSING|-|deferred: MASTER_REPORT §7, the Hardest Lesson level is campaign content, the runner-up guardrail (revenue kind) is machinery-rich per the §9.6 row
35490|3|⚔️ Where the priority lists disagree|PARTIAL|ea7acee,08d4fe2|threat-mass vs service-mass resolved by OD-3 option (a) with binding consequences, ethics resolved and validator-enforced, the modes disagreement is still live OD-16, the accuracy-vs-immersion placement law has no Codex to live in yet

## SUMMARY
- DONE: 13
- PARTIAL: 35
- PROBLEM: 0
- MISSING: 59
- NA: 4
- Total rows: 111 (9 `##` + 102 `###`, matches outline for lines 34502-35507; file read directly, outline agreed)

## TOP-PROBLEMS
1. **Realism toggles are silent no-ops (35273)** — `realismToggles {p95billing, demandCharges}` parse strictly and freeze in the loader (types.ts:1046, bundle.ts:715) but zero economy/pipeline code reads them; a bundle author flipping them today gets no behavior change and no warning. Worth a fail-loud or a documented stub status.
2. **The one-way-door law is unenforced (34712, 35341)** — "every irreversible action marked before it is taken" is a §9.6 guardrail with only incidental coverage (G4 terms card, prepay-lock notice); no marking primitive or lint exists, and the Rollback-That-Isn't content class is absent.
3. **Lose-slowly's operational definition has no pin (34683)** — the three-minutes-of-warning-while-top-three-promoted testable law is exactly the kind of rule this repo proves with tests, yet promotedClock=3 is the only half that is enforced; the warning-to-loss interval is unpinned and untestable until campaign runs exist.
4. **Endings are data-shaped only (35031 group)** — save succession kinds and the uptime/erase streak ledger prove the engine knows an ending exists, but every narrated ending (acquisition epilogue, exit interview, quiet handoff) waits on the campaign lane, and insolvency — the failure gate itself — remains an OPEN owner call (MODULE-STATUS.md:101, cross-cited from group g19).
5. **OD-16 gates a cluster of rows** — one-hand mode, sonified mode, the Shape-First⇄Minimalist a11y skin, mode-list amendments and the co-op pause gap all route through the still-OPEN OD-16, so several §9.8 headings cannot move past MISSING/PARTIAL without an owner decision.
6. **Anticipation Track is a type, not a mechanic (34672)** — the no-optimal-build-order guardrail requires three fixes to land; two shipped (seeded orders, Second-Answer obligation per ADR-0009 §2), but buy-ahead anticipation exists only as one enum value in the save `UnlockVia` union.
