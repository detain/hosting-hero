# Group g19 audit — §6.8–6.16 metrics HUD, scoring, win/lose, financing, terms, balance sheet, portfolio, money language, tuning — lines 23752-25650
## MANIFEST
line|level|heading|STATUS|hash(es)|note
23752|2|6.8 The metrics HUD|PARTIAL|faf81a7 b7e262c|chrome/metrics.ts HUD_PERMANENT_METRICS + promotion.ts + Drawer.vue skeleton, postmortem tier absent
23757|3|The three-tier restructure (the fix that makes the metric wealth playable)|PARTIAL|faf81a7|permanent four + threshold planPromotion + ExplainValue hover-action naming LIVE, drawer skeleton-only, no postmortem tier
23785|3|The growth block|PARTIAL|b7e262c|mrrMicroUsd company cell LIVE via metrics.ts, no ARR/NRR/ARPU/net-new waterfall math
23794|3|The margin block|MISSING||unlisted: no gross-margin/EBITDA/Rule-of-40 computation in economy/
23800|3|The acquisition block|MISSING||unlisted: no CAC/LTV/channel models in economy/
23805|3|The cash block|PARTIAL|b7e262c|buckets + runway + AR 4 trays + DSO + deferred LIVE, credit-line utilization detector-only, no cash conversion cycle
23811|3|The risk block|MISSING||unlisted: no risk block computed, chargeback fee + badDebtBps are config values only
23817|3|The obligation block|PARTIAL|b7e262c|errorBudget.ts + slaCreditOwedSec + renewal pulses LIVE, WARCT/contracted-revenue-% absent
23824|3|The operations block|MISSING||unlisted: no MTTD/MTTR/toil/PUE math, busFactor exists only inside topology/blast.ts
23832|3|The revenue-quality block (new)|PARTIAL|b7e262c|RevenueColourTags + revenueBar + bandFromTermMonths LIVE, payment-method/prepay mix absent
23838|3|The satisfaction block|MISSING||unlisted: reputation modeled as wave facet + observed cell but no NPS/CSAT/review score
23842|3|The rule of the HUD|PARTIAL|faf81a7|promotion-on-actionability mechanism + permanent-four law LIVE, but drawer/postmortem tiers unbuilt so rule only half-applied
23848|3|The Death-Spiral Diagram (a HUD element that draws the loop)|PARTIAL|b7e262c|observeRunway spiralFlagged detector LIVE (runway.ts), HUD loop diagram not built
23858|3|The Concentration Donut (and its agreement with the floor)|MISSING||unlisted: no donut, save NodeRecords.biggestCustomerMrrMicroUsd is the only concentration datum
23866|3|The Cohort Wall|MISSING||unlisted: no cohort-retention heat grid, churn.ts is rate-based
23874|3|The Obligation Rail|MISSING||unlisted: no rail widget, invoice/renewal schedules exist engine-side
23884|2|6.9 Scoring and end-of-level rating|PARTIAL|24dfcfe b7e262c|scorecard engine LIVE (scoring.ts), most end-of-level rating screens absent
23886|3|The four-axis scorecard — and the reweighting that makes it teach the pillar|DONE|24dfcfe b7e262c|3 weight candidates catalogued side-by-side, OD-1 ratified active=commitment-convergence, grade bands + fifth-axis LIVE
23922|3|Score the conversion rate first|DONE|24dfcfe|conversion-first candidate B catalogued + OD-1 records conversion axis DISPLAYED LEADING, served/arrived counters in projection
23930|3|The Nines|PARTIAL|faf81a7|numberLaw.ninesWithMinutes LIVE (43m/mo rule), Nines Meter/pip visuals not built
23941|3|Perceived vs actual reliability|PARTIAL||observed/ fog + coverage bands give ground-vs-observed substrate, measured-vs-experienced uptime pair not computed
23949|3|Detection quality|MISSING||unlisted: no found-by-you/customer/third-party fractions anywhere
23956|3|The Uptime Ribbon|MISSING||unlisted: no health-colour timeline strip
23965|3|The Incident Timeline Strip|MISSING||unlisted: replay causeIds are raw material but no strip UI
23971|3|The Traffic Sankey|MISSING||unlisted: zero sankey hits repo-wide
23981|3|The Attacker Ledger|PARTIAL|0a2f1ca|G1 gate lane counters neutralized/landed/blocked-FP + save CodexEntry silhouettes, no ledger screen or never-noticed row
23995|3|Money Left On The Table (three columns, not one number)|MISSING||unlisted: no counterfactual revenue columns, whatIf is the closest primitive
24012|3|The Leak Report|MISSING||unlisted: no unbilled-leak model (badDebtBps covers AR only)
24020|3|Blast Radius Rating|PARTIAL|e2f69d3|computeBlast/computePersonBlast LIVE (topology/blast.ts), no rating or score-screen use
24027|3|The "Would You Have Survived" Simulator|PARTIAL|a864061|runWhatIf removeNode/disableDefense/trafficSurge + exact bisection LIVE, five-failure authored set and level-end wiring absent
24036|3|Preparedness score|MISSING||unlisted: no drills/restores-tested/runbooks sim systems
24044|3|Rebuildability index|MISSING||unlisted: no rebuild-hours metric
24050|3|Near-miss ledger|MISSING||unlisted: no luck-surfacing ledger
24058|3|Toil hours|MISSING||unlisted: no staff model
24062|3|Par time to detect / par time to repair|MISSING||unlisted: save runbook MTTR bonus is a data ref only
24069|3|Cost per served unit|MISSING||unlisted: no cost-per-served-unit metric
24075|3|Revenue per kW, per rack unit, and per engineer|MISSING||unlisted: no $/U, $/kW or revenue-per-engineer math
24085|3|The Externality Score|MISSING||unlisted: no abuse/carbon externality axis
24093|3|The Decision Audit|MISSING||unlisted: no top-3 counterfactual decision picking, whatIf is a weekend bench
24101|3|The Attribution Ledger|DONE|b7e262c b9295b5 9e701a0|causeId stamped at creation + entriesWithoutCause audit, causality.oneSentenceExplanation, save L13 AttributionEvent append-only, G5 attributionTrail P10 proof
24116|3|The letter grade and the derived flavour title|PARTIAL|b7e262c|gradeFor S-F bands LIVE, derived flavour titles not generated
24132|3|The Report Card|MISSING||unlisted: no stamped end-of-level sheet
24138|3|Four analog dials — and the sequencing that resolves the three-presentation conflict|PARTIAL|faf81a7|instrument faces (Needle/Scope etc.) exist as HUD bezel, score-screen hero-dial sequence not built
24147|3|The Instrument Cluster (one bezel, many faces)|DONE|faf81a7|InstrumentBezel one-bezel-many-faces, 5 G1_INSTRUMENTS one per face, faces.ts closed enum
24159|3|Per-line scorecard reweighting|PARTIAL|b7e262c|applyFifthAxis per-type 20-pt displacement LIVE, per-line fifth-axis content unauthored (only g1 slice ships)
24169|3|The Board Review (the alternative framing)|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, financing-tied end screen mode unbuilt
24184|3|The postmortem screen|MISSING||unlisted: no debrief document screen
24193|3|The Efficiency Frontier|MISSING||unlisted: no par-curve spend plot
24201|3|Par and efficiency medals|PARTIAL|9e701a0 74f157b|save MedalRecord + OD-8 append-law rows LIVE, no awarding logic or par costs
24207|3|The medal / star roster|PARTIAL|9e701a0|storage plane only (MedalRecord in save schema), none of the 12 named medals implemented
24221|3|Scored Retreats|MISSING||unlisted: unit shed is load-shedding not line-exit, no retreat medals
24229|3|The Streak Ladder|PARTIAL|9e701a0|streaksShared at save root LIVE as meta-economy spine data-refs, ladder reward tiers not built
24238|3|The Customer's Scorecard|MISSING||unlisted: no customer-authored assessments
24246|3|Star ratings as real reviews|MISSING||unlisted: no review vocabulary in i18n packs
24257|3|The Wall of Ghosts|MISSING||unlisted: no lost-customer wall
24265|3|The Blueprint Card|MISSING||unlisted: no blueprint-style topology export card
24271|3|The Grade Curve Portrait|MISSING||unlisted: no generated facility portrait
24278|3|The Sankey Payoff|MISSING||unlisted: no end-level chart payoff
24282|3|The Trophy Shelf|MISSING||unlisted: no persistent trophy objects
24288|3|The comparative ghost run / Par Ghost|PARTIAL|b9295b5|replay capture/diff/harness can drive ghost runs, no par-run data or overlay built
24295|3|Company Valuation (the campaign meta-score)|PARTIAL|9e701a0|save TheMultipleState L12 (current+history+factors) LIVE, valuation computation absent
24303|3|Per-line valuation bases (because real buyers don't use one multiple)|MISSING||unlisted: no per-line valuation bases
24320|3|The valuation modifiers that actually move a hosting price|MISSING||unlisted: TheMultipleState.factors is a container only, no modifier math
24333|3|Adjusted EBITDA and the addback game|MISSING||unlisted: no EBITDA at all, addback game impossible
24343|3|Escrow, holdback, and the working-capital adjustment|MISSING||unlisted: transferBetween doc names escrow as a future path, not built
24352|3|The diligence report / The Diligence Memo|MISSING||unlisted: no buyer memo
24364|3|Concentration Risk Penalty|MISSING||unlisted: no concentration computation or event weighting
24372|3|Scoring additions worth calling out separately|MISSING||unlisted: WARCT/Rule-of-40/NRR-per-line all absent
24386|2|6.10 Win and lose conditions|PARTIAL|a864061 b7e262c|lose-slowly + insolvency guards LIVE engine-side, win/lose screens absent
24388|3|The soft-over-hard rule (the governing principle)|DONE|b7e262c|runwayTone 3-stage + meetsLoseSlowlyGuard §9.6 tripwire (>=3 real-min warning) LIVE with tests
24397|3|The Goal Card — declare your win condition at the start|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, no goal-declaration system
24412|3|Win conditions, with stated thresholds|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, zero win thresholds implemented
24433|3|Bankruptcy / cash zero (Insolvency)|PARTIAL|a864061 b7e262c|spendFree death-on-free law + guardrail freeCashDepleted halt + OPEX-REFUSED warns LIVE, settle-side insolvency is open owner call (MODULE-STATUS:101), no bankruptcy state machine
24440|3|Growth Death|MISSING||unlisted: no named growth-death failure
24447|3|Concentration Collapse|MISSING||unlisted: whale-departure window not modelled as a fail state
24454|3|Churn Spiral / Mass churn cascade|PARTIAL|b7e262c|addChurnSignal/forecastChurnBps cascade signals LIVE, spiral loss-check + exits not built
24463|3|Reputation Collapse / the empty lane|MISSING||unlisted: reputation rides wave facets/cells but no trust-floor demand gate
24472|3|Total / partial data loss|MISSING||unlisted: no data-loss model in engine
24488|3|Upstream termination|MISSING||unlisted: no null-route/upstream firing
24495|3|Payment processor termination|MISSING||unlisted: chargeback fee config only
24502|3|Debanked (new)|MISSING||deferred: bulletproof line out of Phase-1 content (MASTER_REPORT §7)
24509|3|Regulatory shutdown|MISSING||unlisted: no regulatory enforcement states
24516|3|Deplatforming|MISSING||unlisted: compound ending unbuilt
24519|3|Uninsurable (new)|MISSING||unlisted: no insurance system
24526|3|Covenant Default|PARTIAL|b7e262c|Covenant + covenantBreaches evaluator LIVE with zero consumers, waiver/forced-sale/control escalation absent
24533|3|Team collapse / total staff burnout|MISSING||unlisted: no staff model at all
24540|3|Facility loss|PARTIAL|8a5f413 e2f69d3|failure domains + rack degrade-all (T-9) + blast compute give the architecture, no facility-loss scenario or lose state
24547|3|Obsolescence|MISSING||unlisted: era system is presentation + content, era demand-evaporation unmodeled
24553|3|The Zombie Host (a soft fail you inhabit)|MISSING||unlisted: no zombie soft-fail mode
24565|3|Acquisition at a bad multiple (a soft loss/win)|MISSING||unlisted: no acquisition system
24574|2|6.11 Financing instruments|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, no financing instruments built, only covenant/runway detectors
24576|3|The instrument table (cost, speed, and failure mode)|MISSING||deferred: MASTER_REPORT §7, no instrument exists to price
24597|3|Bootstrap|PARTIAL|b7e262c|the sim is bootstrap-only de facto (customer cash + spendFree law), not a selectable instrument with difficulty framing
24601|3|Customer-financed growth (the elegant one)|DONE|b7e262c|annualPrepayDiscountBps 15% + deferred-bucket prepay + 1/12 recognition + refund-at-cancel settlement (tick.ts §6.13) LIVE
24608|3|Revolving credit line|PARTIAL|b7e262c|creditLineAprBps config + creditDrawnThisMonth spiral detector + covenant evaluator LIVE, no draw/repay ledger mechanics
24615|3|Equipment financing / leasing — **the defining instrument of hosting**|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24629|3|Vendor / OEM financing|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24635|3|Term loan|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24638|3|Invoice factoring / AR financing|MISSING||deferred: buckets.ts doc names factoring as intended AR transfer path, not implemented
24646|3|Merchant cash advance (the labelled trap)|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24653|3|Venture capital|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24660|3|Private equity / roll-up|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24667|3|Seller financing and earnouts|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24674|3|The shrinking instruments (the dignified retreat)|MISSING||deferred: MASTER_REPORT §7, line/asset sales unbuilt (load-shed is unrelated)
24693|3|Loans priced by your uptime streak — and the operational credit rating beneath it|PARTIAL|9e701a0|save/streaks.ts declares financing rates as a streak consumer over DATA refs, no pricing math exists
24710|3|Grants, incentives, and rebates|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope
24713|3|Covenant breach|PARTIAL|b7e262c|covenantBreaches evaluator LIVE, breach consequences unwired (§6.7 refs outside this group)
24718|2|6.12 Contract and term structure|PARTIAL|b7e262c|term/cliff/escalator/MFN spine LIVE, spot/ETF/WARCT side absent
24726|3|The contract is a tower|PARTIAL|b7e262c|all 13 clauses enumerated + parse wall + hasClause, escalator/MFN enforced in billing, deal-friction costs of concessions unmodeled
24758|3|The contract as the difficulty selector|DONE|b7e262c|commitmentBpsOf -> budgetSecondsFor: the sold SLA sets the error budget, credit exposure via slaCreditOwedSec, difficulty-by-contract is engine law
24768|3|The term-length matrix|PARTIAL|b7e262c|term geometry + prepay discount LIVE, term-indexed retention ladder (55/78/82/85) unmodeled - churn is bundle-keyed
24786|3|The renewal cliff as a scheduled event|DONE|b7e262c 0a2f1ca|resolveRenewalCliff + 90d renewalPulseLeadDays + G5 whale cliff-lapse/renew replay demonstrate scheduled cliffs
24797|3|Ramp schedules and the revenue start date|PARTIAL|b7e262c|setPhase + termYearsElapsed exist, TCV/ACV/Billing-MRR triple not modeled
24806|3|Take-or-pay and commit burn-down (both directions)|PARTIAL|b7e262c|committedOut bucket with conservation law LIVE, commit burn-down/undershoot tax not built
24818|3|Reserved vs. spot (the GPU/compute term structure)|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, no spot market
24831|3|MRC + NRC + settlement (the three-component bill)|PARTIAL|b7e262c|billedMrc + card settlement fees LIVE, NRC and usage-settlement tail absent
24841|3|Circuit and cross-connect contract liabilities (NRC, MRC, term, ETL)|MISSING||unlisted: cross-connect/circuit contracts absent (§6.3 pointer)
24846|3|The ETF Buyout (contract buyout as an offensive weapon)|MISSING||deferred: MASTER_REPORT §7, etf clause id enumerated only, no buyout mechanic
24859|3|Escalators, pass-throughs, and the fixed-price trap|PARTIAL|b7e262c|3% annual escalator + grandfather lock LIVE, power-pass-through clause is an id only
24868|3|Auto-renew, notice periods, and the evergreen clause|PARTIAL|b7e262c|auto-renew/notice clauses + evergreenExtensionMonths + renewedContractGeometry reclock LIVE, notice-event surfacing absent
24876|3|Contract assignability (consent to assignment)|MISSING||unlisted: consent-to-assignment clause id only, no exit-side effect
24885|3|WARCT and contracted revenue % (the two numbers that make revenue an asset)|MISSING||unlisted: WARCT/contracted-revenue-% not computed, bandFromTermMonths is an adjacent ingredient
24893|3|The Contract Term Ribbon (visual)|MISSING||unlisted: no ribbon visual
24902|2|6.13 Restricted cash and the balance sheet|PARTIAL|b7e262c|cash-stack thesis LIVE, balance-sheet ledger absent
24908|3|The six cash buckets|DONE|b7e262c|buckets.ts six (free/restricted/deferred/accountsReceivable/backlog/committedOut) with invariant laws + tests
24927|3|The Balance Sheet (assets, liabilities, equity)|MISSING||unlisted: journal + buckets exist, no assets/liabilities/equity ledger
24942|3|The Rolling Reserve|DONE|b7e262c|tick.ts parks rollingReserveBps 10 percent x 180d free->restricted behind release schedules exactly per §6.13 example
24953|3|Escrow holdbacks and the working-capital adjustment|MISSING||unlisted: exit-side holds unbuilt
24957|3|Security deposits and letters of credit (both directions)|MISSING||unlisted: deposit-or-loc clause id enumerated only, no deposit cash flows
24967|3|Deferred revenue, spent|DONE|b7e262c|deferred bucket + 1/12 recognition + planRefund + cancellation settlement refund-punishes (tick.ts §6.13)
24974|3|AR aging and DSO|DONE|b7e262c|arAgingTrays 4 trays 0-30/31-60/61-90/90+ + DSO readout via trayMidpointDays
24986|3|Bad debt and the write-off (with provisioning)|PARTIAL|b7e262c|dunning write-off posting AR-negative LIVE + badDebtBpsByBundle, provision-vs-not choice not modeled
24997|3|Revenue leakage and Revenue Assurance|MISSING||unlisted: no unbilled leakage model
25006|3|Backlog (signed, not installed, not billing)|PARTIAL|b7e262c|backlog bucket + netPosition LIVE, no TCV-ramp feeding it
25013|3|Committed out (take-or-pay, leases, open POs)|PARTIAL|b7e262c|committedOut bucket + non-negativity law LIVE, no take-or-pay accruals
25016|3|AP as a lever (and a trap)|MISSING||unlisted: supplier-side payment stretching absent (customer-side net terms only)
25027|3|Capitalized fit-out|MISSING||unlisted: no capitalization/amortization
25035|3|The decommissioning obligation|MISSING||unlisted: no decommissioning accrual
25043|3|The cash conversion cycle (as a balance-sheet readout)|MISSING||unlisted: CCC not computed (§6.4 pointer)
25047|3|The cash-flow waterfall|PARTIAL|0a2f1ca|G5 quarter.ts computes collected/opex/free bridges over the quarter, generic monthly waterfall widget unbuilt
25053|2|6.14 Multi-line, transition, and portfolio economics|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, engine runs one line, portfolio unmodeled
25058|3|The pivot double-carry|MISSING||deferred: MASTER_REPORT §7, no multi-line pivots
25077|3|The Line J-Curve|MISSING||deferred: MASTER_REPORT §7
25088|3|The dual-run cost|MISSING||unlisted: no migration-overlap costing
25099|3|Internal transfer pricing|MISSING||unlisted: no internal billing between lines
25110|3|Revenue per rack unit, per kW, and per engineer|MISSING||unlisted: no unit-economics math
25115|3|The Secondary Market|MISSING||deferred: MASTER_REPORT §7, no asset liquidity
25128|3|Portfolio synergies that pay actual bills|MISSING||unlisted: no portfolio-level effects
25140|3|Carbon and water accounting|MISSING||unlisted: no carbon/WUE stats
25151|3|Insurance vs redundancy as an explicit decision curve|MISSING||unlisted: no insurance products to curve against
25163|3|The meta-economy across the campaign|PARTIAL|9e701a0|THE LONG SAVE lineage carries forward-as-data rows (streaks/medals/codex/records), sim carry-over rules absent
25184|2|6.15 The money design language (drawing the economy)|PARTIAL|1e6b306 faf81a7|hue law + number law + instrument cluster LIVE, money-particle grammar unbuilt
25190|3|Gold Is Reserved|DONE|1e6b306|HUE_LEDGER pins gold 0xe8b23c to job money-moves, one-hue-one-job law + hueLaw scans enforce reservation repo-wide
25196|3|Money Always Moves|MISSING||deferred: MASTER_REPORT §7 Phase-1 scope, money-motion renderer unbuilt
25203|3|Money at Three Scales (the LOD system)|MISSING||deferred: MASTER_REPORT §7, no coin LOD system
25213|3|Per-Type Currency Glyphs|MISSING||deferred: MASTER_REPORT §7
25222|3|The Per-Visitor Coin (value as physical size)|MISSING||deferred: MASTER_REPORT §7
25229|3|The Revenue Gutter|MISSING||deferred: MASTER_REPORT §7
25236|3|The MRR Spine|MISSING||deferred: MASTER_REPORT §7
25244|3|The Recurring Pulse|MISSING||deferred: MASTER_REPORT §7
25248|3|The Ledger Tape|PARTIAL|0a2f1ca|Gate5Ticker streams ledger rows in the G5 panel, Drawer.vue names Ledger Tape as a future chrome resident, receipt-printer chrome unbuilt
25255|3|The Ledger Drawer, specified|PARTIAL|faf81a7|Drawer.vue skeleton (tabbed, closable, explicitly unimplemented body), no ring-binder paper design
25266|3|The Gap Bar|MISSING||deferred: MASTER_REPORT §7, gap-bar widget absent (§6.4 pointer)
25270|3|The Burn Candle|MISSING||deferred: MASTER_REPORT §7
25277|3|The Drain Choir|MISSING||deferred: MASTER_REPORT §7
25287|3|Capex vs Opex Split Bar|MISSING||deferred: MASTER_REPORT §7
25292|3|The Two-Pan Scale|MISSING||deferred: MASTER_REPORT §7
25302|3|The Invoice Bird and the Dunning Ladder|PARTIAL|b7e262c 0a2f1ca|6-stage dunning FSM with ladder-order assert LIVE, G5 invoice tape shows the ladder, no invoice-flock visual
25305|3|The Invoice Calendar Strip|MISSING||deferred: MASTER_REPORT §7, no 31-cell day strip (§6.4 pointer)
25309|3|The AR Aging Shelf|PARTIAL|b7e262c|arAgingTrays 4-tray data model LIVE, tray visual unbuilt
25312|3|The Overage Meter|MISSING||deferred: MASTER_REPORT §7
25316|3|Setup Fee Confetti|MISSING||deferred: MASTER_REPORT §7
25320|3|The Upsell Handshake|MISSING||deferred: MASTER_REPORT §7
25324|3|The Marketplace Shelf|MISSING||deferred: MASTER_REPORT §7
25328|3|The Cross-Connect Faucet|MISSING||deferred: MASTER_REPORT §7
25332|3|The Power Resale Meter|MISSING||deferred: MASTER_REPORT §7
25335|3|The Upkeep Drip|MISSING||deferred: MASTER_REPORT §7
25339|3|The Power Bill Dial|MISSING||deferred: MASTER_REPORT §7
25345|3|PUE as a Leak|MISSING||deferred: MASTER_REPORT §7, PUE not modeled
25350|3|The 95th-Percentile Graph, specified|MISSING||deferred: MASTER_REPORT §7 (§6.3 pointer)
25356|3|Payroll Pulse|PARTIAL|0a2f1ca|G5 scripts monthly payroll opex events, no engine staff/payroll system, no roster pulse visual
25360|3|The Lease Stamp|MISSING||deferred: MASTER_REPORT §7
25364|3|The Depreciation Fade|MISSING||deferred: MASTER_REPORT §7, no depreciation book
25369|3|Shipping & Lead Time|MISSING||deferred: MASTER_REPORT §7, no lead-time logistics
25373|3|The Remote Hands Clock|MISSING||deferred: MASTER_REPORT §7, no remote-hands vendor
25377|3|The Incident Cost Meter|PARTIAL|faf81a7|chrome panic.ts derives incident cost from fp x 20M µ$ g1 law, no live accumulating counter
25383|3|The Technical Debt Ledger|MISSING||deferred: MASTER_REPORT §7, no technical-debt object model
25388|3|The Price Dial + Demand Ghost|MISSING||deferred: MASTER_REPORT §7, no pricing elasticity UI
25392|3|The Competitor Price Tag|MISSING||deferred: MASTER_REPORT §7, no competitor AI pricing
25396|3|The Margin Tint|MISSING||deferred: MASTER_REPORT §7, margin not computed
25400|3|The Oversubscription Slider|MISSING||deferred: MASTER_REPORT §7, oversell not a slider verb
25404|3|The SLA Tier Stripe|MISSING||deferred: MASTER_REPORT §7
25409|3|The Contract Term Ribbon|MISSING||deferred: MASTER_REPORT §7 (§6.12 pointer)
25413|3|The Three-Clock Cluster|PARTIAL|faf81a7|ClockRibbon two native tracks + run clock in top bar cover three pacings, concentric-ring instrument + fourth-system rule unbuilt
25424|3|The Runway Tone Shift|PARTIAL|b7e262c|runwayTone caution-6/critical-3 months LIVE in economy, HUD staging (quieter and colder) unwired
25427|3|The Instrument Cluster (one bezel, many faces)|DONE|faf81a7|full §6.9 entry implemented: InstrumentBezel + 5 faces + registry + Readout Mode
25431|3|The Report Card, the Grade Stamp, and the Diligence Memo|MISSING||unlisted: referenced §6.9 screens not built
25435|3|The Sankey Payoff and Money Left On The Table as negative space|MISSING||unlisted: referenced §6.9 charts not built
25439|3|The Trophy Shelf and the Grade Curve Portrait|MISSING||unlisted: referenced §6.9 objects not built
25442|3|The Dust Sheet Ending|MISSING||deferred: MASTER_REPORT §7, failure ending unbuilt
25446|3|Bankruptcy Cascade|MISSING||deferred: MASTER_REPORT §7
25451|3|The Acquisition Ending (good)|MISSING||deferred: MASTER_REPORT §7, no acquisition ending
25455|3|Par Ghost|MISSING||deferred: MASTER_REPORT §7, replay substrate exists (§6.9 row)
25461|2|6.16 Baseline tuning numbers|DONE|24dfcfe b7e262c|tuning spine LIVE as EconomyConfig with LIVE/MID/PROVISIONAL provenance marks, OD-2 ratifies sheet B
25477|3|Sheet A — the starting-position baseline|PARTIAL|24dfcfe|catalogued as TuningSheet A candidate with honest status PROVISIONAL (MODULE-STATUS:103), numbers not active
25528|3|Sheet B — the opening tuning spine (with time, pressure, and patience)|DONE|24dfcfe 47b2c33|ACTIVE_TUNING_SHEET=B RATIFIED, wave pressure 1.115^n-as-223/200 + sawtooth LIVE, month kept 7 real-min (the 4-min leg declined per OD-2/§7.13)
25581|3|Sheet C — the real-market number sheet|PARTIAL|24dfcfe|C rates feed config MIDs (churn bands, bad-debt bands) while the whole sheet keeps status PROVISIONAL pending a realism toggle
25626|3|Derived tuning constants worth stating once|PARTIAL|b7e262c 8fd409a|grade bands + error-budget formula + wave pressure + bounce anchors (0.10@6000/0.50@10000/0.95@16000) LIVE, tech-debt interest / cost-of-nine / contention P / budget split / J-curve absent
## SUMMARY
DONE: 16
PARTIAL: 57
PROBLEM: 0
MISSING: 135
NA: 0
TOTAL rows: 208

## TOP-PROBLEMS
1. §6.11 financing instruments are entirely unbuilt (13 of 16 rows MISSING, deferred to MASTER_REPORT §7 Phase-1 scope) — only the covenantBreaches/runwayTone detectors and the customer-financed prepay spine (annualPrepayDiscountBps + deferred recognition + refund settlement) exist; no draw/repay ledger for any debt or equity instrument.
2. covenantBreaches evaluator (economy/runway.ts, b7e262c) has ZERO consumers repo-wide — the §6.10:24526 Covenant Default lose path and §6.11:24713 breach consequences are both wired to an orphaned function.
3. End-of-level rating machinery is absent while the scorecard engine is DONE: compositeScore/gradeFor/fifth-axis/grade-bands LIVE (scoring.ts, ratified @24dfcfe) but report card, postmortem, board review, diligence memo, trophy shelf, valuation computation, and win screens (24412) are all unbuilt.
4. Insolvency is an open owner decision (MODULE-STATUS:101): death-on-free spend law + freeCashDepleted guardrail halt + OPEX-REFUSED refuses are LIVE, but the settle-side negative-bucket path throws and there is no bankruptcy state machine or cascade ending (§6.10:24433 PARTIAL, §6.15:25446 MISSING).
5. Tuning provenance: economy/config.ts carries 43 PROVISIONAL markers (MODULE-STATUS:93 gap row says ~40 — stale count); only Sheet B is ratified (OD-2 @24dfcfe), Sheets A/C remain candidate-only.
6. §6.15 money design language: 35 of 51 rows MISSING — the reservation/grammar laws (gold hue pin, one-hue-one-job, numberLaw) are DONE/PARTIAL but every money-particle/coin/ledger-visual renderer is outside Phase-1 scope.
