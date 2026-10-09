# Group g15 audit — 4.9-4.14 business machine, type buildables, policy/paper, SKUs, rentals, mezzanine — lines 17938-19281
## MANIFEST
17938|2|4.9 The business machine|PARTIAL|b7e262c 0a2f1ca|economy/ module + gates/g5 quarter ship the money-engine core; the org-chart-as-tech-tree (departments as purchasable buildings) is absent
17944|3|Scoping rule: six departments, not forty buildings|MISSING|-|deferred: MASTER_REPORT §7 Phase-1 = six gates + P0 skeleton; no department grouping in palette or code
17953|3|Reveal schedule: nothing appears before its tier|PARTIAL|4ce67fc|loader/eras.ts availableFrom/pre-introduction gates TYPE lines by era; no tier-gated reveal of the ~40 business objects
17966|3|The Rate Card / Price Book|MISSING|-|deferred: MASTER_REPORT §7; no rate-card structure anywhere; only i18n copy terms.price-ladder.1-4 (08d4fe2)
17976|3|Pricing Engine / The Plan Builder|PARTIAL|b7e262c|contract.ts ships Escalator, GrandfatherLock, term matrix, queueMfnReprice; no plan composer UI/object
18008|3|Order Form / Storefront|MISSING|-|deferred: MASTER_REPORT §7; contracts enter via state.ts registerContractEconomy choke-point; no storefront
18018|3|Payment Gateway (primary + redundant)|PARTIAL|b7e262c|config.ts TransactionFeeConfig live: cardRateBps 2.9pct + cardFixed, chargebackFee, settlement lag, rolling reserve; no redundant-acquirer failover
18039|3|Billing Platform / Billing Engine (WHMCS-alike)|DONE|b7e262c 0a2f1ca|billing.ts invoice FSM issued/paid/failed/written-off, net-0/30/60/90 terms, cycle gross; g5 runs a full quarter of invoices
18048|3|Metering & Rating Engine|MISSING|-|deferred: MASTER_REPORT §7; contracts are fixed MRC + prepaid only — no usage metering/rating anywhere
18063|3|Revenue Assurance|PARTIAL|b7e262c|deferred-revenue recognition (openRecognitionSchedule) + AR aging trays live; no three-way reconciliation
18072|3|Dunning Engine|PARTIAL|b7e262c|dunning.ts FSM retry→reminder→warning→suspend→terminate + stageRecoveryBps 30-50pct + challenge rolls each stage; smart-retry timing/decline-codes/card-updater and fatigue absent
18086|3|Fraud / Risk Screening|MISSING|-|deferred: MASTER_REPORT §7; zero fraud-screening symbols in economy/
18099|3|Quote & Contract Desk / CPQ|PARTIAL|b7e262c|contract clauseRefs + net terms + AR aging live; no quote object or approval desk
18110|3|Deal Desk / Discount Authority|MISSING|-|deferred: MASTER_REPORT §7; discount is data on renewal decisions only, no authority ceiling
18118|3|Sales Compensation Plan (a tunable object, not a salary)|MISSING|-|deferred: MASTER_REPORT §7; zero commission symbols economy-wide
18130|3|The Sales Floor|MISSING|-|deferred: MASTER_REPORT §7
18136|3|Win/Loss Interview Program|MISSING|-|deferred: MASTER_REPORT §7
18144|3|Customer Advisory Board / Reference Program|MISSING|-|deferred: MASTER_REPORT §7
18157|3|Customer Health Score Engine|PARTIAL|b7e262c|churn.ts addChurnSignal/forecastChurnBpsAt/defuseForecasts with 30-60d ghosted-forecast lag (§7.15); no composite health score
18167|3|The Trust Center / Security Portal|MISSING|-|deferred: MASTER_REPORT §7; save CredentialKind registry (9e701a0) is the only audit-surface nod
18178|3|The Upsell Shelf|PARTIAL|4ce67fc|content row upsell-desk-to-vps shipped in shared-web bundle; no attach-rate mechanic or shelf object
18199|3|Self-Serve Portal / Customer Control Panel|MISSING|-|deferred: MASTER_REPORT §7; control-plane archetype (4ce67fc) is the player's rack view not a customer portal
18208|3|API / Terraform Provider|MISSING|-|deferred: MASTER_REPORT §7
18214|3|Marketplace / App Store / Add-on Catalog|MISSING|-|deferred: MASTER_REPORT §7
18220|3|Affiliate Portal / Partner Program|MISSING|-|deferred: MASTER_REPORT §7; affiliate CPA $65-150 exists only as cacProfile _todo prose in shared-web bundle
18228|3|Reseller / White-Label Portal|MISSING|-|deferred: MASTER_REPORT §7
18233|3|Partner Portal with Deal Registration|MISSING|-|deferred: MASTER_REPORT §7
18243|3|Partner Certification Program|MISSING|-|deferred: MASTER_REPORT §7
18250|3|Multi-Brand Storefronts|MISSING|-|deferred: MASTER_REPORT §7
18261|3|The Brand Building|PARTIAL|9e701a0 faf81a7|ReputationState w/ domains in save + TopBar reputation row (chrome metrics.ts); nothing builds brand — reputation is only spent/lost
18267|3|Content Engine / SEO Rig|MISSING|-|deferred: MASTER_REPORT §7
18270|3|Ad Console|MISSING|-|deferred: MASTER_REPORT §7
18276|3|Knowledge Base / Docs|PARTIAL|4ce67fc|knowledge-base-deflection row + ticketsPerCustomer 0.45 economy dial in shared-web; no KB building object
18283|3|Social / Community Desk|MISSING|-|deferred: MASTER_REPORT §7
18289|3|PR / Comms Desk|PARTIAL|8fd409a|PlayerVerb Communicate = status-page line wired to reputation accounting (types.ts:1285); no comms-desk building
18299|3|Case Study Factory|MISSING|-|deferred: MASTER_REPORT §7
18304|3|Trust Badge Row|MISSING|-|deferred: MASTER_REPORT §7
18311|3|Ticketing / Helpdesk System|PARTIAL|4ce67fc 1fb4fc6|ticketsPerCustomer load + open-ticket policy action exist; no ticket queue as business object
18315|3|Live Chat|MISSING|-|deferred: MASTER_REPORT §7
18324|3|Phone Support|MISSING|-|deferred: MASTER_REPORT §7
18328|3|Follow-the-Sun NOC|MISSING|-|deferred: MASTER_REPORT §7
18336|3|Ticket Router / Triage AI|MISSING|-|deferred: MASTER_REPORT §7
18339|3|AI Support Agent|MISSING|-|deferred: MASTER_REPORT §7
18350|3|Onboarding / Migrations Team|MISSING|-|deferred: MASTER_REPORT §7
18356|3|Account Management / Renewals Desk|PARTIAL|b7e262c|resolveRenewalCliff renew/lapse/escalate matrix + renewalPulseOpenMin live (g5 cliff-RENEW c12); no desk building
18361|3|Collections Desk|PARTIAL|b7e262c|suspend→terminate→write-off + badDebtBpsByBundle live; no agency/legal/phone-plan branches
18374|3|Collections Agency Contract / Factoring Facility|MISSING|-|deferred: MASTER_REPORT §7
18383|3|The Retrieval / Egress Policy Desk|MISSING|-|deferred: MASTER_REPORT §7
18390|3|QA / Change-Management Board / Internal Audit|PARTIAL|1fb4fc6|queue-change policy action + errorBudget risky-op lock (exhaustionLockActive); no board object
18397|3|Compliance Vault / Compliance Office|PARTIAL|9e701a0|CredentialKind enum SOC2_I/PCI/HIPAA/FedRAMP/TierIII in save; no vault object or expiry mechanic
18412|3|The Subprocessor Register and DPA Desk|MISSING|-|deferred: MASTER_REPORT §7; zero subprocessor symbols
18420|3|Legal Retainer|MISSING|-|deferred: MASTER_REPORT §7
18428|3|Cyber-Insurance Policy|MISSING|-|deferred: MASTER_REPORT §7
18447|3|Insurance Broker (the wider policy set)|MISSING|-|deferred: MASTER_REPORT §7
18453|3|E&O / SLA Reserve|PARTIAL|b7e262c|slaCreditOwedSec models credit liability; rolling reserve in billing.ts is processor-side not a chosen reserve; no reserve bucket
18459|3|Accounting / FP&A / Finance|PARTIAL|b7e262c|ledger.ts double-entry journal + runwayMonths live; no 90-day cash forecast or cost-to-serve
18473|3|Tax Engine / Nexus Monitor|MISSING|-|deferred: MASTER_REPORT §7; zero tax symbols
18481|3|Entity & Ring-Fence Structure|MISSING|-|deferred: MASTER_REPORT §7
18493|3|Transfer Pricing / Internal Chargeback|MISSING|-|deferred: MASTER_REPORT §7
18502|3|The Board / Investor Relations|PARTIAL|b7e262c|runway.ts Covenant/covenantBreaches + lose-slowly guard live; no board-meeting events
18512|3|Procurement Desk|MISSING|-|deferred: MASTER_REPORT §7
18522|3|Vendor Exit Plans|MISSING|-|deferred: MASTER_REPORT §7
18529|3|Vendor Diversity|MISSING|-|deferred: MASTER_REPORT §7; topology A+B feeds (e2f69d3) model the infra twin not the procurement rule
18534|3|Hardware Support Tier|MISSING|-|deferred: MASTER_REPORT §7
18543|3|OEM Capacity Reservation|MISSING|-|deferred: MASTER_REPORT §7; gpu_alloc CredentialKind enum slot only (9e701a0)
18552|3|ITAD Contract + Certificate of Destruction|MISSING|-|deferred: MASTER_REPORT §7
18562|3|Energy Hedge / PPA / Demand-Charge Manager|PARTIAL|b7e262c|power-pass-through clause ships in contract.ts SLA_CLAUSE_IDS (customer side); no buy-side hedge/PPA mechanic
18572|3|Reserved Capacity Contract / Transit Commit|MISSING|-|deferred: MASTER_REPORT §7; buckets.ts declares committedOut but nothing feeds it
18578|3|The Yield Manager|MISSING|-|deferred: MASTER_REPORT §7
18590|3|The Backlog Board|PARTIAL|b7e262c|backlog bucket declared in buckets.ts six-bucket set; unfed — no signed-vs-billed MRR tension mechanic yet
18598|3|The Comp-Account Auditor|MISSING|-|deferred: MASTER_REPORT §7
18606|3|The Renewal Calendar|PARTIAL|b7e262c|customer-side cliff + pulse live; vendor-side renewal calendar absent
18615|3|Localisation and Regional Presence|MISSING|-|deferred: MASTER_REPORT §7; regional-pops content row (4ce67fc) is network not market
18623|3|Bug Bounty Program|MISSING|-|deferred: MASTER_REPORT §7
18630|3|Source Code / Data Escrow + Business Continuity Agreement|MISSING|-|deferred: MASTER_REPORT §7
18638|3|Business Continuity / DR Plan (the document, not the infrastructure)|MISSING|-|deferred: MASTER_REPORT §7
18645|3|Upstream Abuse Relationship|MISSING|-|deferred: MASTER_REPORT §7; abuse.canon i18n copy (08d4fe2) is complaint text not a relationship
18652|3|SLA Contract Tier (a product you define)|DONE|b7e262c 0a2f1ca|errorBudget.ts commitmentBpsOf(uptimeTarget)→budgetSecondsFor per-contract, slaCreditOwedSec, exhaustionLockActive; g5 exercises lock + clean-week refund
18662|3|The Escort Desk|MISSING|-|deferred: MASTER_REPORT §7
18669|3|The Contract Clause Library — the legal tower tree|PARTIAL|b7e262c|13 of 16 spec clause ids shipped in SLA_CLAUSE_IDS (liability-cap, sla-credit-cap, claim-window, maint-exclusion, auto-renew, escalator, power-pass-through, mfn, audit-right…); force-majeure/take-or-pay/data-retention-on-term ids absent and no per-clause friction-cost tuning
18706|2|4.10 Type-specific buildables|PARTIAL|4ce67fc|two type bundles (shared-web, game-servers) ship the archetype/skin grammar; the other ~32 hosting types unshipped
18711|3|Authoring rule: skins on shared mechanics|DONE|4ce67fc|archetypeInstances {archetype,skin} exactly encodes one-object-many-skins; concurrency-pool/two-face-rack reused across both bundles
18727|3|Mail Server / MTA Cluster — "The Sorting Table" *(email)*|MISSING|-|deferred: MASTER_REPORT §7; email type unshipped
18735|3|Outbound Relay with Per-Account Rate Limits *(email)*|MISSING|-|deferred: MASTER_REPORT §7
18738|3|Reputation Warm-Up IP Pool *(email)*|MISSING|-|deferred: MASTER_REPORT §7
18744|3|DKIM Signer / SPF + DMARC Config / Reverse DNS *(email)*|MISSING|-|deferred: MASTER_REPORT §7
18748|3|Feedback Loop Processor *(email)*|MISSING|-|deferred: MASTER_REPORT §7
18751|3|IP Reputation Manager *(email)*|MISSING|-|deferred: MASTER_REPORT §7
18754|3|Spam Filter Cluster / Mail Sorter *(email)*|MISSING|-|deferred: MASTER_REPORT §7
18762|3|DNS Authoritative Pair — "The Index Card Cabinet" *(any)*|MISSING|-|deferred: MASTER_REPORT §7; no DNS resolution mechanic in engine
18775|3|Recursive Resolver (internal) *(any)*|MISSING|-|deferred: MASTER_REPORT §7
18782|3|NTP Source *(any)*|MISSING|-|deferred: MASTER_REPORT §7
18785|3|Anycast DNS Node / Signpost *(DNS)*|PARTIAL|4ce67fc|anycast row shipped in game-servers distinct data; DNS-signpost behavior absent
18788|3|Response Rate Limiter (RRL) *(DNS)*|MISSING|-|deferred: MASTER_REPORT §7
18791|3|DNSSEC Signer + Expiry Monitor *(DNS)*|MISSING|-|deferred: MASTER_REPORT §7
18794|3|Secondary DNS with a *second provider* *(DNS)*|MISSING|-|deferred: MASTER_REPORT §7
18797|3|Origin Shield / Tiered Cache *(CDN)*|MISSING|-|deferred: MASTER_REPORT §7; CDN type unshipped
18800|3|Purge Control / Rate-Limited Invalidation *(CDN)*|MISSING|-|deferred: MASTER_REPORT §7
18803|3|Cache Key Normalizer *(CDN)*|MISSING|-|deferred: MASTER_REPORT §7
18806|3|Bot Manager *(CDN)*|MISSING|-|deferred: MASTER_REPORT §7
18809|3|Erasure-Coded Pool / Erasure Coding Policy *(object storage)*|MISSING|-|deferred: MASTER_REPORT §7; storage type unshipped
18812|3|Scrub / Verify Runner *(storage, backup)*|MISSING|-|deferred: MASTER_REPORT §7
18819|3|Object Lock / WORM *(object storage)*|MISSING|-|deferred: MASTER_REPORT §7
18822|3|Lifecycle Tiering to Cold Storage *(object storage)*|MISSING|-|deferred: MASTER_REPORT §7
18825|3|Pull-Based Backup Orchestrator / Immutable Snapshot Vault *(backup)*|MISSING|-|deferred: MASTER_REPORT §7
18828|3|Restore Test Harness *(backup)*|MISSING|-|deferred: MASTER_REPORT §7
18831|3|Seed Drive Shipping *(backup)*|MISSING|-|deferred: MASTER_REPORT §7
18836|3|Tape Library + Robot / Drive Pool / Barcode System / Courier Contract / Media Rotation *(tape vaulting)*|MISSING|-|deferred: MASTER_REPORT §7; tape type unshipped
18839|3|The Legacy Drive Museum *(tape vaulting)*|MISSING|-|deferred: MASTER_REPORT §7; save MuseumExhibitRecord (9e701a0) is game-history exhibits not a media reader
18842|3|Tick-Rate Optimized Node *(game hosting)*|PARTIAL|4ce67fc|high-clock-low-core-procurement + automated-restart-on-tick-drop rows ship in game-servers data; tick-rate as a tuned node stat absent
18849|3|Game Server Instance + Per-Instance IP Isolation *(game hosting)*|PARTIAL|4ce67fc|per-instance-cpu-pinning shipped; the named per-instance IP-isolation row absent
18852|3|Player-Facing Proxy / IP Masking Layer *(game hosting)*|DONE|4ce67fc|per-player-ip-obfuscation shipped in game-servers distinct buildables
18856|3|Matchmaker / Lobby Service *(game hosting)*|DONE|4ce67fc|matchmaker archetype instance in game-servers bundle
18863|3|Anti-Cheat Service *(game hosting)*|DONE|4ce67fc|anti-cheat-integration row in game-servers distinct buildables
18869|3|One-Click Modpack Provisioner / Instant Server Rollback *(game hosting)*|MISSING|-|deferred: MASTER_REPORT §7; only mod-update ticket i18n copy exists
18872|3|Session Border Controller (SBC) *(VoIP)*|MISSING|-|deferred: MASTER_REPORT §7; VoIP type unshipped
18877|3|Spend Cap / Destination Whitelist / Fraud Anomaly Monitor *(VoIP)*|MISSING|-|deferred: MASTER_REPORT §7
18883|3|Transcode Farm *(video/streaming)*|MISSING|-|deferred: MASTER_REPORT §7
18888|3|Bitrate Ladder Config / Ingest Redundancy / Low-Latency Delivery Path / DVR Storage *(video)*|MISSING|-|deferred: MASTER_REPORT §7
18891|3|GPU Node / Liquid Cooling Loop / CDU *(GPU)*|MISSING|-|deferred: MASTER_REPORT §7; only gpu_alloc credential enum + official:gpu-power rosetta ref-name in data
18895|3|High-Density Busway / Busbar *(GPU, colo)*|MISSING|-|deferred: MASTER_REPORT §7
18898|3|Power Capping Controller *(GPU)*|PARTIAL|e2f69d3|physical.ts models whole-milliwatt draw + 80pct circuit derate + PDU/breaker ownership; no performance-for-headroom capping dial
18901|3|GPU Health Telemetry / Tamper-Evident Cabinets + Asset Tracking *(GPU)*|MISSING|-|deferred: MASTER_REPORT §7
18904|3|Job Checkpointing Service *(GPU, HPC)*|MISSING|-|deferred: MASTER_REPORT §7
18907|3|Job Scheduler + Preemption Policy *(GPU, HPC)*|MISSING|-|deferred: MASTER_REPORT §7; pipeline queue is FIFO with no preemption classes
18913|3|Spot / Interruptible Tier *(GPU, any)*|MISSING|-|deferred: MASTER_REPORT §7
18919|3|Low-Latency Interconnect Fabric / Parallel Filesystem *(HPC)*|MISSING|-|deferred: MASTER_REPORT §7
18922|3|Node Health Check + Auto-Drain *(HPC)*|PARTIAL|c253643|door drain verb (opt-in, config.drainPolicy) ships; no health-triggered automatic drain
18925|3|Control Plane HA / etcd Quorum / Admission Policy Engine / Resource Quotas / Progressive Delivery *(Kubernetes / PaaS)*|MISSING|-|deferred: MASTER_REPORT §7; K8s type unshipped
18928|3|Chrysalis Pool / Warm Pool *(serverless)*|PARTIAL|4ce67fc 8fd409a|concurrency-pool archetype ships (the design-law twin: slots ARE the pooled-concurrency object); serverless skin unshipped
18931|3|Cabinet / Cage / Private Suite *(colo)*|PARTIAL|4ce67fc|two-face-rack archetype ships the rack unit; cage/suite tiers absent
18934|3|Metered PDU + Circuit Enforcement *(colo)*|PARTIAL|e2f69d3|whole-milliwatt draw vs per-circuit 80pct derate enforced in topology; no amp-hours billing to customers
18939|3|Meet-Me Room + Cross Connect Panel *(colo)*|MISSING|-|deferred: MASTER_REPORT §7
18942|3|Carrier Diversity *(colo)*|PARTIAL|e2f69d3|redundancy.ts shared-circuit/A+B feed analysis is the diversity mechanic; carrier products absent
18945|3|Customer Portal with Power Graphs *(colo)*|MISSING|-|deferred: MASTER_REPORT §7
18948|3|Tour Route *(colo)*|MISSING|-|deferred: MASTER_REPORT §7
18952|3|Office / Customer Lounge *(colo)*|MISSING|-|deferred: MASTER_REPORT §7
18955|3|Escort Policy / Badge System / Lockable Cabinet Doors *(colo)*|MISSING|-|deferred: MASTER_REPORT §7
18958|3|Remote Hands (as a sellable product) *(colo)*|PARTIAL|1fb4fc6|dispatch-remote-hands policy action exists as mechanism; not priced/sold as product
18961|3|Compliance Boundary Paint *(regulated)*|MISSING|-|deferred: MASTER_REPORT §7
18970|3|Faraday Cage / SCIF *(regulated, government)*|MISSING|-|deferred: MASTER_REPORT §7
18973|3|Evidence Collection System / Quarterly Scan Vendor *(regulated)*|MISSING|-|deferred: MASTER_REPORT §7
18976|3|Residency Fence *(GDPR, data sovereignty)*|MISSING|-|deferred: MASTER_REPORT §7
18979|3|Abuse Desk *(shared, seedbox, bulletproof, email)*|MISSING|-|deferred: MASTER_REPORT §7; abuse.canon i18n copy + moderator-hire row only
18986|3|Modem Bank / RAS / Terminal Server / RADIUS Auth *(dial-up)*|PARTIAL|8fd409a 4ce67fc|pipeline slots are the shipped concurrency-pool this heading names per the authoring rule; dial-up skin unshipped
18990|3|News Spool / Mail Spool / Shell Server / Web Ring Node / Telco PRI Lines *(period)*|MISSING|-|deferred: MASTER_REPORT §7; era kit unshipped
18993|3|The Dish *(satellite ground station)*|MISSING|-|deferred: MASTER_REPORT §7
18996|3|The Street Cabinet *(edge / MEC)*|MISSING|-|deferred: MASTER_REPORT §7
19000|3|Provisioning Automation *(shared, VPS, any volume business)*|MISSING|-|deferred: MASTER_REPORT §7; g5 deferred-revenue law hints at provisioning but no automation object
19020|3|Control Panel *(shared, VPS)*|DONE|4ce67fc|control-plane archetype w/ cpanel skin in shared-web; G2 corpus uses homogeneous-cpanel image
19032|2|4.11 Non-physical buildables: policy, process and paper|PARTIAL|1fb4fc6 8fd409a|policy card system (grammar + door commit verb) is the shipped home for these; roughly half the 20 objects have engine counterparts
19040|3|Graceful Degradation|MISSING|-|deferred: MASTER_REPORT §7; no degraded-static mode — units queue bounce or get shed
19046|3|Backpressure / The Waiting Room|DONE|8fd409a|step 11 createBackpressureStep is the retry-storm engine: queue + patienceUs + bounced terminals + retryOf lineage; spec verifiable in queue tests
19053|3|Load Shedding Policy|DONE|1fb4fc6 8fd409a|ShedLoad verb + shed-class action + shed-order config; g1/G3 gates exercise it
19057|3|Change Review / Change Control|PARTIAL|1fb4fc6|queue-change action exists in the closed grammar; no approval-gate flow before execution
19064|3|Change Freeze|DONE|b7e262c 0a2f1ca|errorBudget exhaustionLockActive blocks risky actions (§6.1 auto-freeze) + E-9 refund freeze days 61-78 exercised in g5 quarter
19071|3|Capacity Planning Policy|PARTIAL|47b2c33|wave director telegraphs upcoming demand curves (visible capacity planning input); no planning-policy object
19076|3|Auto-Scaling Policy|PARTIAL|1fb4fc6|scale-out action with threshold bands inform/consult/execute; cooldown/max-spend semantics absent
19080|3|Terms of Service / Acceptable Use Policy|MISSING|-|deferred: MASTER_REPORT §7; dunning-suspend is billing-side not AUP enforcement
19087|3|SLA Tier Definition|DONE|b7e262c|commitmentBpsOf per-contract uptime target → budget seconds → credits; same machinery as 18652
19090|3|Compliance Package|PARTIAL|9e701a0 74f157b|CredentialKind registry (SOC2_I/PCI/HIPAA/FedRAMP/TierIII) persists in save; no purchasable package object
19093|3|Documentation|PARTIAL|9e701a0|knowledge-degradation rows (0=crisp/faded, §244) model docs decay; no documentation buildable
19097|3|The Offboarding Checklist|MISSING|-|deferred: MASTER_REPORT §7
19104|3|The Escort Policy|MISSING|-|deferred: MASTER_REPORT §7
19110|3|The Abuse Triage Dial|PARTIAL|8fd409a|aggression slider → ROC knobs P(block)=aggression×ratio (defaults.ts:127) is the shipped triage-posture dial; abuse-desk framing absent
19113|3|The Refund Policy|DONE|b7e262c|planRefund + WeekRefund clean-week logic + slaCreditOwedSec; g5 E-9 stacking proves policy surface
19119|3|Discount Authority|MISSING|-|deferred: MASTER_REPORT §7
19122|3|Mixed-Vendor Procurement Policy|MISSING|-|deferred: MASTER_REPORT §7
19125|3|The Company Handbook|MISSING|-|deferred: MASTER_REPORT §7; no culture system in Phase-1 scope
19132|3|Retention Schedule / Legal Hold|MISSING|-|deferred: MASTER_REPORT §7; pruneSettledInvoices (opt-in perf lever) is unrelated record retention
19135|3|Anycast Withdrawal Policy · Escalation Matrix · MOP and Go/No-Go · Error Budget Policy|PARTIAL|b7e262c 1fb4fc6|error-budget policy DONE + page escalation action exists; anycast-withdrawal verb and MOP objects absent
19140|2|4.12 Productization: turning operations into SKUs|MISSING|-|deferred: MASTER_REPORT §7; no SKU layer — priced add-ons do not exist as objects
19146|3|Managed Services Tier|PARTIAL|4ce67fc|managed-patching-service data row shipped; no tiered SKU/pricing wrapper
19151|3|Premium Support SLA|MISSING|-|deferred: MASTER_REPORT §7
19157|3|Backup-as-an-Add-on|MISSING|-|deferred: MASTER_REPORT §7
19162|3|DDoS Protection Tier|PARTIAL|4ce67fc|scrubbing-retainer (both bundles) + udp-aware-ddos-scrubbing shipped as data; no tiered product
19165|3|Monitoring as a Product|MISSING|-|deferred: MASTER_REPORT §7; chrome instruments (faf81a7) are player HUD not resale
19168|3|Migration Services|MISSING|-|deferred: MASTER_REPORT §7
19171|3|Dedicated IP / SSL / Domain Registration|MISSING|-|deferred: MASTER_REPORT §7
19175|3|Compliance-Ready Hosting|MISSING|-|deferred: MASTER_REPORT §7; save credentials enum is the only nod
19178|3|Reserved Capacity / Committed-Use Discounts|PARTIAL|b7e262c|contract term + MRC is effectively committed-use pricing; no discount ladder for commitment
19182|3|Spot / Preemptible Capacity|MISSING|-|deferred: MASTER_REPORT §7
19186|3|Colo Cross-Connect|MISSING|-|deferred: MASTER_REPORT §7
19189|3|IPv4 Leasing|MISSING|-|deferred: MASTER_REPORT §7
19192|3|Bandwidth Resale / Transit|MISSING|-|deferred: MASTER_REPORT §7
19195|3|White-Label Everything|MISSING|-|deferred: MASTER_REPORT §7
19200|3|Remote Hands / Smart Hands|PARTIAL|1fb4fc6|dispatch-remote-hands action callable via policy cards; not a billable SKU
19203|3|Escrow, Evidence Packs and Audit Artifacts|MISSING|-|deferred: MASTER_REPORT §7
19208|2|4.13 Rentals, burst, and the panic economy|MISSING|-|deferred: MASTER_REPORT §7; zero rental/burst symbols anywhere (grep verified)
19216|3|Emergency Scrubbing Activation|PARTIAL|4ce67fc|peacetime scrubbing-retainer ships in both bundles; the on-demand activation purchase absent
19221|3|Burst Transit|MISSING|-|deferred: MASTER_REPORT §7
19227|3|Rented Hands|PARTIAL|1fb4fc6|dispatch-remote-hands action is the requisition mechanism; contemptible-rate rental economy absent
19230|3|Competitor Capacity|MISSING|-|deferred: MASTER_REPORT §7
19236|3|Emergency Courier / Expedited Freight|MISSING|-|deferred: MASTER_REPORT §7
19239|3|Emergency Fuel Delivery|MISSING|-|deferred: MASTER_REPORT §7
19243|3|The Rule|NA|-|editorial design law ("panic-activating beats panic-buying") — no implementation surface
19250|2|4.14 Where the business machine lives: the mezzanine and the desk grammar|MISSING|-|unlisted: no plan/ADR row places the business machine visually; ADR-0008 lanes (assetpack/filters/audio/substrate) exclude it
19255|3|The Back Office Mezzanine|MISSING|-|unlisted: zero mezzanine hits in docs or code; substrate spike (0acf46e 27f2856) covers racks only
19272|3|The Desk Grammar|MISSING|-|unlisted: surface+tray+prop+seat kit spec unimplemented; no ADR lane claims it
## SUMMARY
DONE: 12
PARTIAL: 50
PROBLEM: 0
MISSING: 136
NA: 1
TOTAL: 199
## TOP-PROBLEMS
1. **The whole org-chart-as-tech-tree is unbuilt (4.9).** The economy engine (billing, dunning, contracts, error budgets, runway) is genuinely deep — but the spec's core fantasy, buying departments as buildings that unlock capabilities, has zero counterpart. Only 9 of 79 headings reach DONE. This is coherent with MASTER_REPORT §7 (Phase-1 = six gates + P0 skeleton) but means the business machine currently exists as *simulation substrate + one legibility gate (g5)*, not as a playable tower.
2. **Two money buckets are declared but never filled.** buckets.ts ships all six §6.13 buckets, but `backlog` and `committedOut` have no writer anywhere (grep-verified) — Backlog Board (18590) and Reserved-Capacity (18572) rows are PARTIAL on the strength of the declaration alone. The signed-vs-billed MRR tension the spec calls "one of the best slow-burn pressures" is absent.
3. **Metering & Rating (18048) missing undermines "the machine prices usage".** All revenue is fixed MRC + prepay. Egress metering, per-unit rating, and the oversell dial (content declares `commercialSlider oversell-ratio` with ZERO engine consumers — grep `oversell` in sim-core hits nothing) mean the spec's usage-economy loop is not yet wired even in the shipped types.
4. **Clause library is 13/16 and friction-free.** contract.ts SLA_CLAUSE_IDS omits force-majeure, take-or-pay, data-retention-on-term; and clauses are id-tags, not the "each clause is a tuning knob with friction cost" objects the spec demands (18669).
5. **Dunning recovery ladder is one-way.** dunning.ts models the suspend→terminate slide with recovery rolls, but the spec's *upgrade* ladder (smart retries, decline-code handling, card updater) and its downside realism (fatigue, dunning false-positive suspensions of good customers) are absent (18072). The g5 gate exercises the dark path well (c05/c06 → written-off) but not the salvation path beyond E-2.
6. **Type breadth is 2 of ~34.** 4.10's per-type catalog is DONE only where a row exists in shared-web/game-servers data (matchmaker, anti-cheat, IP-masking, control panel). Every other type's signature buildable is MISSING — expected, but auditors of later waves should note the *authoring rule itself* (18711) is DONE and proven to absorb new skins cheaply.
7. **Graceful Degradation (19040) has no mechanism.** The engine sheds, queues, and bounces, but the spec's "serve degraded content instead of failing" rung — a core availability-vs-conversion pressure — is unmodeled even as a policy action (ACTION_IDS closed set of 10 has no degrade verb).
8. **4.14 is the audit's emptiest and it is load-bearing design.** The mezzanine/desk grammar is where the business machine gets a visual home; neither MODULE-STATUS nor ADR-0008 lanes claim it (`unlisted:` ×3). Until placed, 4.9's eventual UI has no designated surface.
9. **Panic economy (4.13) entirely unbuilt** except scrubbing-retainer/remote-hands half-measures. No burst transit, competitor capacity, courier, or fuel. "The Rule" editorial law is NA. Consistent with Phase-1 scope but a full spec chapter with <2 working rows.
10. **Reveal/tier gating exists only for eras.** loader/eras.ts gates TYPE lines by availableFrom year; there is no tier-based unlock schedule for the ~40 business objects (17953), so a future business-machine palette must add second gating axis rather than reuse era gating alone.
