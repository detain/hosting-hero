# Group g08 audit — 2.9 Self-inflicted + 2.10 Business/financial/reputational threats — lines 8017-9152

## MANIFEST
line|level|heading|STATUS|hash(es)|note
8017|2|2.9 Self-inflicted and operational failures|PARTIAL|8fd409a faf81a7 1fb4fc6|family aggregate: retry-storm substrate + alert-fatigue HUD + policy conflict detector shipped, incident catalog largely unevent-ized
8022|3|Certificate Expiry / The Stale Seal|MISSING|-|deferred: MASTER_REPORT 7 Phase-1 scope, no cert/expiry state in sim-core or packages/content
8042|3|Let's Encrypt Rate Limit (the automation failure mode)|MISSING|-|deferred: MASTER_REPORT 7 scope, no ACME renewal automation exists
8047|3|Missing Intermediate Chain|MISSING|-|deferred: MASTER_REPORT 7 scope, no TLS chain state anywhere
8054|3|DNSSEC Signing Expiry / Bad KSK Rollover|MISSING|-|deferred: MASTER_REPORT 7 scope, DNSSEC not modeled
8059|3|Domain Expiry / The Tumbleweed|MISSING|-|deferred: MASTER_REPORT 7 scope, no domain-renewal object
8072|3|License Expiry|MISSING|-|deferred: MASTER_REPORT 7 scope, upkeep-calendar family unbuilt
8077|3|Expired Things (the whole calendar)|MISSING|-|deferred: MASTER_REPORT 7 scope, no expiry calendar or Expiry Register buildable
8086|3|Bad Deploy / The Wrong Commit|PARTIAL|b7e262c|risky-deploy is a LIVE errorBudget spend action with exhaustion lock (economy/config.ts:150 296), defect-probability/rollback/cache-bust table absent
8112|3|Bad Config Push|PARTIAL|1fb4fc6|policy/conflicts.ts static detector classifies contradictory/cycle/shadowing rule rows (docblock names R7 self-inflicted incidents), fleet-push blast semantics absent
8120|3|"It Was Fine In Staging"|MISSING|-|deferred: MASTER_REPORT 7 scope, no staging-environment concept
8126|3|The `rm -rf` / Wrong-Environment Incident|MISSING|-|deferred: MASTER_REPORT 7 scope, destructive-command event class unbuilt
8132|3|Failed Rollback / The One-Way Door|MISSING|-|deferred: MASTER_REPORT 7 scope, save scars (9e701a0) are only the meta-progression one-way-door analogue
8140|3|Migration Gone Wrong / Long ALTER TABLE Lock|MISSING|-|deferred: MASTER_REPORT 7 scope
8145|3|Migration Corruption|MISSING|-|deferred: MASTER_REPORT 7 scope
8151|3|Config Drift|MISSING|-|deferred: MASTER_REPORT 7 scope, no per-machine managed-coverage state
8174|3|Runaway Cron / Cron Storm|PARTIAL|8fd409a 41fcdd2|self-multiplying-unit storm shipped as retry-storm substrate (retryDepthById/retryPressure/stormFactor in pipeline/defaults.ts + driver.ts), cron scheduler itself absent
8181|3|Time-Bomb Cron|MISSING|-|deferred: MASTER_REPORT 7 scope
8184|3|The Backup Window That Moved|MISSING|-|deferred: MASTER_REPORT 7 scope, DST not modeled
8191|3|The Logging Loop|MISSING|-|deferred: MASTER_REPORT 7 scope, disk resource unmodeled, retry storm is the only shipped amplification loop
8196|3|Redis maxmemory Eviction|MISSING|-|deferred: MASTER_REPORT 7 scope, no cache/session tier state
8204|3|Replication Lag / Silent Replica Drift|MISSING|-|deferred: MASTER_REPORT 7 scope, topology has 4 relations but no replication state
8214|3|Split-Brain|MISSING|-|deferred: MASTER_REPORT 7 scope, no quorum/primary election
8224|3|Backup That Never Restored|MISSING|-|deferred: MASTER_REPORT 7 scope, replay verify+bisection (b9295b5) is the engine-level restore-drill analogue only
8236|3|Monitoring Blind Spot|MISSING|-|deferred: MASTER_REPORT 7 scope, observed fog (55a6086) represents unknown cells but the blind-spot event is unmodeled
8242|3|The Monitoring Server Dies|MISSING|-|deferred: MASTER_REPORT 7 scope, founding member of the unbuilt 2.22 HUD-attack family
8249|3|The Alerting Path Dependency|MISSING|-|deferred: MASTER_REPORT 7 scope, alerting-path dependency unmodeled
8259|3|Alert Fatigue|DONE|faf81a7|chrome/alertStack.ts signalToNoise + SNR-tier caps + expandable "N suppressed by fatigue" + grey wash + relapse — implements the fairness fix exactly (game never hides)
8286|3|The Alert That Fires Correctly And Means Nothing|MISSING|-|deferred: MASTER_REPORT 7 scope, threshold re-derivation action absent
8294|3|The Ticket Avalanche / The Ticket Hydra|PARTIAL|b7e262c|GhostedForecast fuse (7.15 tickets-to-churn 30-60d seeded lag) live in economy/tick.ts step 10 + churn-fuse alert copy (40faf58), ticket volume/staff-capacity doom-loop absent
8313|3|Support Queue Collapse|PARTIAL|b7e262c|unanswered-escalation signals light churn fuses (tick.ts:152) = the churn channel of collapse is live, queue capacity/headcount economics unbuilt
8319|3|Fat-Finger|MISSING|-|deferred: MASTER_REPORT 7 scope, confirmation-step-with-blast-radius UX unimplemented
8334|3|The Fix That Causes The Outage|MISSING|-|deferred: MASTER_REPORT 7 scope, remediation-risk-by-fatigue table unmodeled
8341|3|The Reconciliation Loop That Won't Stop|MISSING|-|deferred: reconciler card type sits in the owner open-ratification batch (ADR-0009 register), policy cycles only detected statically (conflicts.ts class b)
8344|3|The Helpful Vendor|MISSING|-|deferred: MASTER_REPORT 7 scope
8347|3|Capacity Creep|MISSING|-|deferred: MASTER_REPORT 7 scope, waves carry scripted ramp envelopes not a perpetual weekly growth trend
8353|3|Capacity Misjudgment / Forecast Miss|MISSING|-|deferred: MASTER_REPORT 7 scope, lead-time and purchasing-runway unmodeled
8359|3|The Rate Limit You Set|PARTIAL|6f5da38|G1 paranoia ladder shipped: over-tuned defense drives blockRate 0-to-0.89 with FP fee economics (gate-g1.test.ts), fit-indicator/Tuning-Review rot mechanic absent
8370|3|fail2ban Self-DoS|PARTIAL|6f5da38|benign units neutralized at cost = the self-DoS dynamic live via G1/G3 defense ladders, NAT-cohort whole-office ban variant unmodeled
8377|3|Your Own Scanner Got You Blacklisted|MISSING|-|deferred: MASTER_REPORT 7 scope
8385|3|The Compliance Scan That Took You Down|MISSING|-|deferred: MASTER_REPORT 7 scope
8395|3|Staff Burnout|MISSING|-|deferred: MASTER_REPORT 7 scope, hands model static player attention only, no staff fatigue meter
8408|3|Key Person Risk / Bus Factor 1|MISSING|-|deferred: MASTER_REPORT 7 scope, no staff entities exist
8419|3|Documentation Rot|MISSING|-|deferred: MASTER_REPORT 7 scope
8431|3|The Undocumented Dependency|MISSING|-|deferred: MASTER_REPORT 7 scope, topology edges always known, hidden-until-broken class unmodeled
8438|3|The Correlated Failure (meta-threat)|PARTIAL|e2f69d3 5a10383|shared-dependency substrate shipped: blast radius + powerFeeds chain head + redundancy shared-circuit + T-9 rack degrade-all (8a5f413), white-line post-mortem visual unwired
8453|3|Vendor EOL|MISSING|-|deferred: MASTER_REPORT 7 scope
8462|3|The Demo That Matters|MISSING|-|deferred: MASTER_REPORT 7 scope
8468|3|The Customer Who Lies|MISSING|-|deferred: MASTER_REPORT 7 scope
8474|3|The Uninterpretable Log Line|PARTIAL|b9295b5|causality.ts redHerrings lanes + oneSentenceExplanation ship the red-herring teaching substrate its docblock assigns, the fixed gag line unimplemented
8484|2|2.10 Business, financial, and reputational threats|PARTIAL|b7e262c faf81a7|economy family (dunning/churn/AR-aging/deferred/reserve/errorBudget) + reputation HUD cell live, threat-event catalog mostly unimplemented
8489|3|The SLA credit magnitude correction (read this before pricing any outage)|PARTIAL|b7e262c|errorBudget negative-remaining = SLA-credit-owed zone + sla-credit-due notice + sla-credit-cap/claim-window clause refs, credit-cap arithmetic not enforced in postings
8504|3|Business threats must consume a hand|PARTIAL|8fd409a b1f757e|hand pool + door cost/occupancy shipped (communicate and commit verbs cost hands), business-threat inbox-card wiring onto hands not built
8513|3|The Chargeback Swarm|PARTIAL|4ce67fc 08d4fe2|threat registry + game-servers wave entries + chargebackRate type field + press obit-chargebacks copy staged, per-dispute fee and ratio-tick economics carry registry _todo untuned
8529|3|Processor Termination|MISSING|-|deferred: MASTER_REPORT 7 scope, only the press.headline obit copy narrates a ratio breach
8544|3|Rolling Reserve Imposition|PARTIAL|b7e262c|billing.ts rolling-reserve unlock schedule + restricted-to-free release run in economy tick step 11, imposition trigger (ratio drift/review) unwired
8557|3|Merchant Category Reclassification / Debanking|MISSING|-|deferred: MASTER_REPORT 7 scope, Entity and Ring-Fence buildable unbuilt
8567|3|Involuntary Churn / The Expired Card Ghost|DONE|b7e262c|dunning FSM failed-retry-reminder-warning-suspend-terminate with seeded per-stage recovery + player suspension Day Dial, G5 c05/c06 ladder-to-write-off proves it live
8581|3|Bad Debt Creep / The Deadbeat Cohort|PARTIAL|b7e262c|AR aging four trays + daysPastDue + suspend/terminate timing shipped, Collections desk absent and aging fed by known zombie-invoice latent bug (MODULE-STATUS gap row)
8589|3|DSO Drift (Days Sales Outstanding)|DONE|b7e262c|billing.ts arAgingTrays with DSO readout, AR-vs-cash split (landsFree card deals vs AR) live in tick
8596|3|Deferred-Revenue Sinkhole|DONE|b7e262c|deferred bucket + 1/12 monthly recognition schedule + refund-punishes clawback (planRefund) shipped per 6.13, churn-lying Cohort View rides G5 projection only
8606|3|The Refund Wave / The Refund Cascade|PARTIAL|b7e262c 0a2f1ca|settleCancellationRefunds + prepaid-refunded + E-9 stacked refunds in G5 fixture live, contagion (refunds inspiring refunds) unmodeled
8617|3|The Unbilled Upgrade|MISSING|-|deferred: MASTER_REPORT 7 scope
8626|3|Billing Failure → the Billing Run as a scheduled high-risk event|PARTIAL|b7e262c|per-contract cycle grid + failed-payment-to-dunning path live, processor-outage failure table (double-bill/stale meter/template tickets) absent
8639|3|Currency & Cross-Border Drag / Tax Nexus Creep / Tax Assessment|MISSING|-|deferred: MASTER_REPORT 7 scope, money is single-currency int micro-dollars
8647|3|FX Collapse in a Priced Market|MISSING|-|deferred: MASTER_REPORT 7 scope, no FX model
8655|3|The Reddit Thread / The Viral Post / The Review Bomb|PARTIAL|9e701a0 08d4fe2|save reputation ledger (overall/domains/honestHostFloor/breachHistoryTicks U22 clean-day ladder) + press/forum i18n live, thread event stream and signup-throughput debuff unwired
8677|3|Status Page Denial|MISSING|-|deferred: MASTER_REPORT 7 scope, status.rung i18n sentences exist but page-hosting dependency unmodeled
8683|3|The Industry-Insider Drama Thread|MISSING|-|deferred: MASTER_REPORT 7 scope, separate engineer-reputation stat unbuilt
8690|3|The Astroturf Temptation|MISSING|-|deferred: MASTER_REPORT 7 scope, honestHostFloor ledger field is the only adjacent hook, detection curve unmodeled
8701|3|The Core Update (search algorithm apocalypse)|MISSING|-|deferred: MASTER_REPORT 7 scope, organic-channel spawn model unbuilt
8713|3|Comparison Site Delisting|MISSING|-|deferred: MASTER_REPORT 7 scope
8719|3|Brand Confusion Attack|MISSING|-|deferred: MASTER_REPORT 7 scope
8725|3|The Affiliate Betrayal, the Clawback Wave, and the Coupon Hijack|MISSING|-|deferred: MASTER_REPORT 7 scope, no attribution/affiliate model
8740|3|The Platform Partner Pivot / Channel Conflict|MISSING|-|deferred: MASTER_REPORT 7 scope
8749|3|Referral Partner Defection|MISSING|-|deferred: MASTER_REPORT 7 scope
8752|3|The Reseller Who Was Actually A Competitor|MISSING|-|deferred: MASTER_REPORT 7 scope
8755|3|The Influencer Complaint|MISSING|-|deferred: MASTER_REPORT 7 scope, no Influencer-class visitor shipped in the g1 slices
8761|3|Uptime-Monitor Public Shaming|MISSING|-|deferred: MASTER_REPORT 7 scope
8766|3|The Ex-Employee Post|MISSING|-|deferred: MASTER_REPORT 7 scope
8771|3|Founder's Tweet|MISSING|-|deferred: MASTER_REPORT 7 scope, no player-fireable reputation verb exists
8777|3|The Support Vampire|PARTIAL|b7e262c|RevenueQualityTags margin + abuse (cost-to-serve) axes ship per contract in contract.ts, ticket-burn and negative-margin detection unbuilt
8793|3|The Hoarder / The Resource Hog / The Noisy Neighbor|PARTIAL|4ce67fc|hoarder-noisy-neighbor + noisy-query-table-scan shipped as mechanical threats in the g1-shared-web waves, quota/cgroup policy resolution and polite-upsell unbuilt
8805|3|The Concentration Risk Whale|PARTIAL|b7e262c 0a2f1ca|per-contract concentration tag axis + G5 whale c01 ($2500/mo term-2m cliff + price-increase-refused cause), 25/35/50 percent warning curve and renewal-leverage squeeze unbuilt
8834|3|The Departing Whale|PARTIAL|b7e262c|90-day renewal pulse + cliff resolve (renew/lapse/escalate from term matrix) shipped as data, whale-scaled decision-reshaping layer unmodeled
8840|3|The Key Customer's Acquisition|MISSING|-|deferred: MASTER_REPORT 7 scope, consent-to-assignment is an id-only clause ref
8848|3|The Insourcer|MISSING|-|deferred: MASTER_REPORT 7 scope
8853|3|The Quiet Downgrade|MISSING|-|deferred: MASTER_REPORT 7 scope, logo-vs-revenue churn split unmodeled
8861|3|The Migration Tourist|MISSING|-|deferred: MASTER_REPORT 7 scope, refund settlement exists (8606 row) but the persona is unauthored
8866|3|The Compliance Tourist|MISSING|-|deferred: MASTER_REPORT 7 scope
8871|3|The Contract Lawyer|MISSING|-|deferred: MASTER_REPORT 7 scope
8877|3|The Security Questionnaire Treadmill|MISSING|-|deferred: MASTER_REPORT 7 scope, Trust Center buildable unbuilt
8888|3|The Audit Right|MISSING|-|deferred: MASTER_REPORT 7 scope, audit-right id listed in SLA_CLAUSE_IDS with no consumer (semantics deferred to ruleset cards)
8896|3|The Most-Favoured-Nation Clause|MISSING|-|deferred: MASTER_REPORT 7 scope, mfn id listed in SLA_CLAUSE_IDS, cross-deal retroactive repricing unimplemented
8905|3|The Overcommitted Salesperson|PARTIAL|b7e262c|sold commitmentBps binds the error budget (tight SLA means exhaustion locks + credit exposure) + margin bands live, the salesperson event spawner itself unbuilt
8911|3|The Ransom Customer|MISSING|-|deferred: MASTER_REPORT 7 scope
8916|3|The Chargeback Artist / The Chargeback Gremlin|MISSING|-|deferred: MASTER_REPORT 7 scope, only the swarm-level chargeback-swarm threat is staged (8513 row)
8922|3|The Crypto Miner on a Free Trial|MISSING|-|deferred: MASTER_REPORT 7 scope, free-tier/COGS-theft unmodeled
8928|3|The Resold Reseller|MISSING|-|deferred: MASTER_REPORT 7 scope, abuse.canon complaint copy ships (08d4fe2) without any reseller chain
8934|3|The Reseller Who Oversells|MISSING|-|deferred: MASTER_REPORT 7 scope
8944|3|The Ghost Tenant (colo)|MISSING|-|deferred: MASTER_REPORT 7 scope, colo type not shipped in Phase-1
8951|3|The Price War / The Copycat|MISSING|-|deferred: MASTER_REPORT 7 scope, Competitor AI unbuilt
8962|3|The Hyperscaler Free Tier / Cloud Giant Price Cut|MISSING|-|deferred: MASTER_REPORT 7 scope
8969|3|The Acquisition Predator / The Roll-Up Acquirer|MISSING|-|deferred: MASTER_REPORT 7 scope
8975|3|The Poison-Pill Customer|MISSING|-|deferred: MASTER_REPORT 7 scope
8983|3|The Earnout Dispute|MISSING|-|deferred: MASTER_REPORT 7 scope, save lineage tree (9e701a0) carries the narrative structure only
8992|3|The Vendor Squeeze|MISSING|-|deferred: MASTER_REPORT 7 scope, opex rows static in unattended config, annual-escalator clause id is customer-side only
9010|3|The Landlord's Lender|MISSING|-|deferred: MASTER_REPORT 7 scope
9019|3|The Upstream Bankruptcy|MISSING|-|deferred: MASTER_REPORT 7 scope
9024|3|The Acquisition of Your Landlord|MISSING|-|deferred: MASTER_REPORT 7 scope
9027|3|The Talent Raid|MISSING|-|deferred: MASTER_REPORT 7 scope, no staff entities (8408 family)
9034|3|Employee Misclassification / Contractor Audit|MISSING|-|deferred: MASTER_REPORT 7 scope
9041|3|The Word "Unlimited"|MISSING|-|deferred: MASTER_REPORT 7 scope, unmetered-wordpress-default invites threats in shared-web.json:137 but the legal event is unmodeled
9051|3|SLA Credit Claim (and the clause that actually bites)|PARTIAL|b7e262c|sla-credit-due notice + slaCreditOwedSec overrun readout live, etf/notice-period clause ids listed but the three-breach termination-right ladder unbuilt
9060|3|Regulatory Fine / Compliance Lapse|MISSING|-|deferred: MASTER_REPORT 7 scope
9067|3|Licensing Audit|MISSING|-|deferred: MASTER_REPORT 7 scope
9074|3|Compliance Audit / Law Enforcement Request / Seizure|MISSING|-|deferred: MASTER_REPORT 7 scope
9086|3|The Plaintiff's Lawyer|MISSING|-|deferred: MASTER_REPORT 7 scope
9092|3|Angry Customer Escalation|PARTIAL|b7e262c|escalation-signal-to-fuse-to-churn channel live (churn.ts + tick step 10), the ticket/phone/post/chargeback/lawsuit stage ladder absent
9097|3|The 1-Star Review|PARTIAL|9e701a0|reputation ledger + breachHistoryTicks ship the durable-score half, new-signup reduction effect unwired
9104|3|The Disgruntled Ex-Customer|MISSING|-|deferred: MASTER_REPORT 7 scope
9110|3|The Investor Who Changed Their Mind|MISSING|-|deferred: MASTER_REPORT 7 scope, financing events unmodeled
9117|3|Vendor Financing Recall|MISSING|-|deferred: MASTER_REPORT 7 scope, creditLineDrawn input flag (tick.ts:159) is the only adjacent hook
9120|3|The Reference Call|MISSING|-|deferred: MASTER_REPORT 7 scope
9128|3|Ambulance Chasers|MISSING|-|deferred: MASTER_REPORT 7 scope
9135|3|The Founder's Bad Week|MISSING|-|deferred: MASTER_REPORT 7 scope, hand capacity is static so personal-attention removal has no seam yet
9143|3|Health and Safety|MISSING|-|deferred: MASTER_REPORT 7 scope

## SUMMARY
DONE: 4
PARTIAL: 27
PROBLEM: 0
MISSING: 96
NA: 0
TOTAL: 127

## TOP-PROBLEMS
1. **AR aging is fed by a known latent bug** — the renewal-twin zombie invoice (MODULE-STATUS gap row, `tick.ts:244-260` + `billing.ts:158`, found-preserved by `perf-identity.test.ts`, owner-semantics call) keeps an `issued` twin aging in a tray, so Bad Debt Creep (8581) and DSO (8589) measurements can silently overstate receivables until the owner rules on cycle-unique invoice ids.
2. **SLA credits are a readout, not a settlement** — `errorBudget.ts` defines the negative-remaining "SLA-credit-owed zone" and `tick.ts` emits `sla-credit-due` notices, but the 100%-of-MRC cap, claim-window expiry, and most-players-dont-file dynamics from the magnitude correction (8489/9051) are clause-id stubs; legal semantics are explicitly delegated to ruleset cards that do not consume them yet.
3. **The chargeback pipeline is staged data without economics** — chargeback-swarm ships as registry threat + wave entries + `chargebackRate` type field (4ce67fc), but the registry `_todo` says fraud-mix scalars untuned and no fee/ratio-tick posting exists, so Processor Termination (8529) and Rolling Reserve imposition triggers (8544) have cause-without-mechanism; the schedule machinery exists, its invocation does not.
4. **Reputation is a ledger without events** — `save/node.ts` carries full ReputationState (domains, honestHostFloor, breachHistoryTicks U22 ladder, 9e701a0) and chrome reads `company::reputation`, but no sim-core module publishes that cell — every 2.10 reputation threat (8655/9097 family) reduces to substrate-without-publisher; the whole Reddit/review-bomb family waits on a reputation emitter.
5. **Ticket avalanche models the consequence, not the cause** — the 7.15 GhostedForecast fuse (tickets to churn, 30-60d seeded lag, `churn.ts`/`tick.ts` step 10, plus churn-fuse copy @40faf58) is shipped, but ticket volume generation (severity x customers x comms-quality) and staff-capacity consumption are unbuilt, so the 2.9 doom-loop headline (8294/8313) is half-modeled.
6. **Deploy-as-threat exists only as a budget line** — `risky-deploy` is a config-provisional errorBudget spend action with exhaustion lock (economy/config.ts:296-300), but Bad Deploy (8086)'s defect probability, rollback cooldown, cache-bust window, and the fail-at-scale shape are unmodeled; the visual language (crates/flags) is likewise unbuilt.
7. **The self-inflicted operational catalog is ~80% unevent-ized** — 39 of 49 2.9 headings (cert/DNS/domain/license expiry, backups, replication, split-brain, burnout, bus factor, doc rot) have zero state anywhere; they are honestly deferred per MASTER_REPORT §7 Phase-1 scope, but the "40% of all incidents" design note means the family's spine (an expiry calendar + incident-source events) is the single largest unbuilt content substrate this range implies.
8. **MFN, Audit Right, and assignment clauses enumerated but dead** — `SLA_CLAUSE_IDS` (contract.ts:39-52) lists all 13 clause ids with zero consumers in content or policy — fine as P13 groundwork, but it means the contract-landmine family (8888/8896/8840) risks reading as DONE to a cursory grep while remaining pure data enumeration.
9. **Business threats do not yet compete for hands** — the coupling rule at 8504 ("the single biggest missed opportunity in the design") is architecturally ready (door hands + occupancy cost @b1f757e, communicate/commit verbs) but no business threat arrives as a hand-costing inbox card; ops-vs-business competition for attention remains unproven in any test.
