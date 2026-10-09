# Group g12 audit — §3.5–§3.12 customers, channels, churn, client system, support, sales, visual grammar — lines 13068-14858
## MANIFEST
line|level|heading|STATUS|hash(es)|note
13068|2|3.5 Customer and client archetypes|PARTIAL|b7e262c 0a2f1ca|g5 cast of 12 named customers + revenue-band tags live, archetype stat-table unmodeled
13099|3|The $3 Shared Hosting Customer / The Hobbyist|PARTIAL|b7e262c 0a2f1ca|g5 tiny-tier cast rows + revenueShape many-tiny-high-churn, cost-to-serve and project-death churn dynamics unmodeled
13107|3|The Small Business Site|PARTIAL|0a2f1ca b7e262c|B2B cast rows c04/c08/c11 with net-30/60 terms and 12-month terms, very-low-churn profile untuned
13112|3|The WordPress Agency|MISSING|-|deferred: MASTER_REPORT §7 - no agency cards, only vulnerable-plugin-compromise threat row
13119|3|The Developer Customer|MISSING|-|deferred: MASTER_REPORT §7 - design-partner and API-abuse customer dynamics unimplemented
13126|3|The Forum / Community|MISSING|-|deferred: MASTER_REPORT §7 - only shared-web and game-servers slices shipped
13130|3|The E-Commerce Store|MISSING|-|deferred: MASTER_REPORT §7 - merchant line absent, PCI CredentialKind is save-spine only
13137|3|The SaaS Company|MISSING|-|deferred: MASTER_REPORT §7
13143|3|The Startup Rocket / The Startup That Might Be Huge|MISSING|-|deferred: MASTER_REPORT §7 - contract MRC static, no grow-into-whale trajectory
13150|3|The Enterprise|MISSING|-|deferred: MASTER_REPORT §7 - net-60 exists only as InvoiceTerms.netTermsDays shape
13154|3|The Enterprise Procurement Monster|MISSING|-|deferred: MASTER_REPORT §7 - no procurement-ritual mechanics
13159|3|Government Greg / the Government-Institutional Buyer|MISSING|-|deferred: MASTER_REPORT §7 - FedRAMP credential in save/node.ts only, cert-gated deals unimplemented
13171|3|The Dormant Account / The Zombie Account / The Ghost|MISSING|-|deferred: MASTER_REPORT §7 - economy and pipeline zombie mentions are invoice/queue hygiene not dormant customers
13178|3|The Zombie (the one who already left)|PARTIAL|9e701a0|churned rows persist in CustomerBookRecord with treatmentLog depositions, no lingering-cost mechanic
13183|3|The Mail-Only Customer|MISSING|-|deferred: MASTER_REPORT §7 - no mail product line shipped
13187|3|The Crypto / Streaming / "Special" Customer|PARTIAL|b7e262c 08d4fe2|abuse RevenueQualityBand + abuse.canon pack copy shipped, no archetype-specific threat draw
13191|3|The Gray Tenant (bulletproof)|MISSING|-|deferred: MASTER_REPORT §7 - gray/bulletproof lines out of Phase-1 scope
13195|3|The Adult Site|MISSING|-|deferred: MASTER_REPORT §7
13199|3|The Abuser (Knowing)|PARTIAL|4ce67fc|customerAsThreat registry rows chargeback-swarm and hoarder-noisy-neighbor shipped, knowing-vs-unknowing not distinguished
13206|3|The Abuser (Unknowing)|PARTIAL|4ce67fc|open-resolver-reflection and xmlrpc-pingback-amplifier rows are the unknowing-abuser shape, no customer-level flag
13213|3|The Crypto Miner|MISSING|-|deferred: MASTER_REPORT §7 - no miner threat in the 16-row shipped registry
13218|3|The Bandwidth Hog|PARTIAL|4ce67fc|hoarder-noisy-neighbor and noisy-query-table-scan rows = bandwidth-hog-as-client, not bound to customer cards
13223|3|The Bargain Hunter Tenant|MISSING|-|deferred: MASTER_REPORT §7 - deal-forum channel and bargain economics unmodeled
13227|3|The Colo Tenant (another hosting company)|MISSING|-|deferred: MASTER_REPORT §7 - colo line unshipped
13236|3|The Financial Firm (exchange colo)|MISSING|-|deferred: MASTER_REPORT §7
13240|3|The Healthcare Practice (HIPAA) / The Compliance Customer|MISSING|-|deferred: MASTER_REPORT §7 - HIPAA CredentialKind save-spine only
13244|3|The Game Community Admin / The Clan or Guild|PARTIAL|4ce67fc|game-servers bundle ships player-session visitors + tournament scenarios, no clan-admin client card
13252|3|The Modded-Server Owner|MISSING|-|deferred: MASTER_REPORT §7 - mod-update-day threat row ships but no mod-owner client card
13256|3|The Streamer / Influencer (as a client)|MISSING|-|deferred: MASTER_REPORT §7
13260|3|The Broadcaster (video)|MISSING|-|deferred: MASTER_REPORT §7
13263|3|The AI Startup (GPU)|MISSING|-|deferred: MASTER_REPORT §7 - gpu_alloc CredentialKind save-spine only
13268|3|The AI Lab / Research Lab (HPC & GPU)|MISSING|-|deferred: MASTER_REPORT §7
13274|3|The Grant-Funded Lab (revenue with a published expiry)|MISSING|-|deferred: MASTER_REPORT §7 - published-expiry revenue resembles term-end cliffs but grant lifecycle unimplemented
13281|3|The Backup Customer|MISSING|-|deferred: MASTER_REPORT §7
13285|3|The Migration-In Refugee|MISSING|-|deferred: MASTER_REPORT §7 - migration concierge channel also unimplemented
13289|3|The Agent / Master Agency|MISSING|-|deferred: MASTER_REPORT §7
13300|3|The ISV / OEM Embedder|MISSING|-|deferred: MASTER_REPORT §7
13308|3|The Credit-Risk Startup|PARTIAL|b7e262c|deposit-or-loc clause + creditLineAprBps + covenantBreaches shipped, no per-customer underwriting roll
13316|3|The Ex-Customer|PARTIAL|9e701a0|book keeps churned and won_back statuses + depositions, ex-customer behavior unwired to live sim
13321|3|The Migration-Out (the customer leaving who still needs you)|MISSING|-|deferred: MASTER_REPORT §7
13330|3|The Bimodal Customer|MISSING|-|deferred: MASTER_REPORT §7
13338|3|The Off-Peak Customer (selling the shape of your own valley)|MISSING|-|deferred: MASTER_REPORT §7 - wave envelopes shape traffic but no off-peak contract archetype
13346|3|The Customer's Customer Sentiment (two layers of anger)|MISSING|-|deferred: MASTER_REPORT §7 - two-layer sentiment unimplemented
13353|3|The Compliance-Driven Buyer|MISSING|-|deferred: MASTER_REPORT §7 - compliance-gated buyers unmodeled
13361|3|The Silent Majority|MISSING|-|deferred: MASTER_REPORT §7 - ghosted-fuse is the nearest silent-cohort analog
13372|2|3.6 Attraction and acquisition channels|MISSING|-|deferred: MASTER_REPORT §7 - no acquisition-channel machinery anywhere, Phase-1 has no offensive economy
13414|3|Demand Mix (marketing as creep-wave composition)|MISSING|-|deferred: MASTER_REPORT §7 - wave-envelope composition shapes request traffic not customer demand mix
13438|3|The SEO Garden / Organic Search Road|MISSING|-|deferred: MASTER_REPORT §7
13461|3|The Ad Spend Dial / Paid Search Highway / The Beacon|MISSING|-|deferred: MASTER_REPORT §7 - no spend dial or CPC dynamics
13481|3|The Banner Ad Kite (cheap/spammy marketing)|MISSING|-|deferred: MASTER_REPORT §7
13486|3|Content Drops / The Content Engine|MISSING|-|deferred: MASTER_REPORT §7
13493|3|The Page Speed Score|MISSING|-|deferred: MASTER_REPORT §7 - latency metrics ship for display only, no score-as-attraction
13499|3|The Status Page (honesty as a resource)|MISSING|-|deferred: MASTER_REPORT §7 - status.rung-1..5 copy + status-page defense row ship as content, channel effect absent
13533|3|The Speed Badge / Uptime Badge|MISSING|-|deferred: MASTER_REPORT §7
13541|3|Uptime History|MISSING|-|deferred: MASTER_REPORT §7 - error-budget history is sim-internal not a published artifact
13545|3|Latency as a Product (publish your numbers)|MISSING|-|deferred: MASTER_REPORT §7 - formatLatency chrome reads exist but publishing-as-product unimplemented
13551|3|Benchmark Publication|MISSING|-|deferred: MASTER_REPORT §7
13555|3|Referral Program / Word-of-Mouth Footpaths|MISSING|-|deferred: MASTER_REPORT §7 - no referral bounties or graphs
13575|3|Affiliate / Review-Site Pipeline|MISSING|-|deferred: MASTER_REPORT §7
13591|3|Review Aggregators|MISSING|-|deferred: MASTER_REPORT §7
13595|3|The Review Wall|MISSING|-|deferred: MASTER_REPORT §7
13600|3|The Deal-Forum Chute|MISSING|-|deferred: MASTER_REPORT §7
13607|3|Partner / Reseller / Agency Channel|MISSING|-|deferred: MASTER_REPORT §7
13615|3|Brokers (colo / wholesale)|MISSING|-|deferred: MASTER_REPORT §7
13620|3|Registrar Cross-Sell|MISSING|-|deferred: MASTER_REPORT §7 - no domain product line
13626|3|Community Presence / Open Source Karma|MISSING|-|deferred: MASTER_REPORT §7
13635|3|Dogfooding / Open Source Release|MISSING|-|deferred: MASTER_REPORT §7
13639|3|Content & Tooling Magnets|MISSING|-|deferred: MASTER_REPORT §7
13645|3|The Community / Forum (your own)|MISSING|-|deferred: MASTER_REPORT §7 - forum.thread copy ships, owned-forum channel unimplemented
13651|3|Sponsorships (streamers, podcasts, open-source projects)|MISSING|-|deferred: MASTER_REPORT §7
13655|3|Outbound Sales|MISSING|-|deferred: MASTER_REPORT §7
13662|3|The Conference Booth|MISSING|-|deferred: MASTER_REPORT §7
13672|3|Migration Assistance / The Migration Concierge|MISSING|-|deferred: MASTER_REPORT §7
13685|3|The Competitor's Outage (a free lane that opens by itself)|MISSING|-|deferred: MASTER_REPORT §7 - no rival simulation
13690|3|The Repatriation Wave|MISSING|-|deferred: MASTER_REPORT §7
13698|3|PR / Post-Mortem Publishing|MISSING|-|deferred: MASTER_REPORT §7 - press.headline pack copy ships, PR-effect mechanics absent
13704|3|Free Backups / Free SSL / Free Staging|MISSING|-|deferred: MASTER_REPORT §7
13708|3|The Free Tier|MISSING|-|deferred: MASTER_REPORT §7
13716|3|Localization / Regional PoP|MISSING|-|deferred: MASTER_REPORT §7
13720|3|Marketplace Listing|MISSING|-|deferred: MASTER_REPORT §7
13727|3|The Listing (the generic case)|MISSING|-|deferred: MASTER_REPORT §7
13734|3|Niche Positioning / The Niche Play|MISSING|-|deferred: MASTER_REPORT §7
13743|3|Geographic Positioning|MISSING|-|deferred: MASTER_REPORT §7
13747|3|Peering at an IX|MISSING|-|deferred: MASTER_REPORT §7 - topology ships network domains not peering economics
13757|3|IPv6 Support|MISSING|-|deferred: MASTER_REPORT §7
13762|3|Green / Renewable Power Certification|MISSING|-|deferred: MASTER_REPORT §7
13766|3|Certifications as a Lead Magnet|MISSING|-|deferred: MASTER_REPORT §7 - credential spine in save is the only adjacent fragment
13774|3|Case Study with a Whale / The Anchor Tenant|MISSING|-|deferred: MASTER_REPORT §7 - g5 whale c01 ships as story cast not a case-study channel
13780|3|Promo Codes / Black Friday / Seasonal Promo|MISSING|-|deferred: MASTER_REPORT §7 - promo-driven renewal-cliff time-bombs unmodeled
13787|3|Acquisition (buy the lane)|MISSING|-|deferred: MASTER_REPORT §7
13792|3|The Price Tag (attraction by price)|MISSING|-|deferred: MASTER_REPORT §7 - price exists as contract MRC not an attraction input
13804|3|The Front Door and The Sign|MISSING|-|deferred: MASTER_REPORT §7
13812|3|The Front-Page Geyser|MISSING|-|deferred: MASTER_REPORT §7
13818|3|Attraction by hosting type|MISSING|-|deferred: MASTER_REPORT §7 - per-bundle attraction unimplemented
13846|2|3.7 Conversion, churn, and retention|DONE|b7e262c 0a2f1ca|churn rolls + dunning + cliffs/pulses + prepay recognition + MFN + ghosted fuses all live with Gate-5 legibility
13848|3|The Funnel Lane|MISSING|-|deferred: MASTER_REPORT §7 - purchase-funnel towers unimplemented, the served queue is the live funnel
13859|3|Onboarding as a funnel with its own bounce rate|MISSING|-|deferred: MASTER_REPORT §7
13867|3|The Onboarding Gauntlet|MISSING|-|deferred: MASTER_REPORT §7
13877|3|The Grudge Meter|PARTIAL|9e701a0 4ce67fc|grudgeScore projected from treatmentLog in save/ with tests + grudge-booter threat row, live-economy link absent
13898|3|Health Scoring / Churn Radar|PARTIAL|b7e262c 24dfcfe|revenueBar worst-tag-wins + runwayTone/deathSpiral + ratified scorecard axes live, per-account churn radar unimplemented
13906|3|Save Offers (and the ladder that makes them a real calculation)|PARTIAL|b7e262c|churnInterventions defuses ghosted fuses at tick step 10, save-offer ladder and pricing unimplemented
13923|3|The Exit Survey / Exit Interview|MISSING|-|deferred: MASTER_REPORT §7 - findDepositions in save/ is the nearest data shape
13930|3|The Win-Loss Review (the acquisition half of the exit survey)|MISSING|-|deferred: MASTER_REPORT §7
13938|3|The Churn Taxonomy (five kinds, tracked separately)|PARTIAL|b7e262c|voluntary + involuntary + ghosted tracked as distinct streams, silent and contagious kinds absent
13959|3|Silent Churn (the client who stops growing)|MISSING|-|deferred: MASTER_REPORT §7 - contracts have no growth telemetry to go silent in
13964|3|Involuntary Churn / Dunning|DONE|b7e262c 0a2f1ca|six-stage FSM with per-stage recovery rolls + write-off + cancellation refunds + Gate5DunningLadder + E-2 post-suspension recovery live
13971|3|Contagious Churn / The Word of Mouth Graph|MISSING|-|deferred: MASTER_REPORT §7 - no word-of-mouth graph
13979|3|Contract Lock-in|DONE|b7e262c|term phases + auto-renew and notice-period clauses + refund penalty settle on early termination
13985|3|The Contract Term Ladder|DONE|b7e262c|hourly/monthly/annual cycles + termMonths geometry + bandFromTermMonths + evergreen extension live
13994|3|NPS Ticker|MISSING|-|deferred: MASTER_REPORT §7 - no NPS instrument
14002|3|The Renewal Wave and the Renewal Calendar|DONE|b7e262c 0a2f1ca|renewal-pulse 90-day window + cliffs firing at exact term-end minute + Gate5RenewalStrip + renewal kanban column
14014|3|Win-Back Campaigns|MISSING|-|deferred: MASTER_REPORT §7 - won_back status enum reserved in the save schema only
14021|3|Annual Prepay Push|DONE|b7e262c 40faf58|annualPrepay full-year + 1/12 deferred recognition + refund-punishes split + terms.prepay-lock pack copy live
14032|3|Data Gravity as a retention mechanic|MISSING|-|deferred: MASTER_REPORT §7
14047|3|Domain stickiness|MISSING|-|deferred: MASTER_REPORT §7 - topology domains are network zones not sticky registrations
14051|3|Proactive Notification|PARTIAL|4ce67fc|proactive-comms and status-page defense rows shipped in registry, ticket-slope cutting unwired because tickets are unmodeled
14057|3|QBR (Quarterly Business Review)|MISSING|-|deferred: MASTER_REPORT §7
14063|3|The Expansion Trigger Library|MISSING|-|deferred: MASTER_REPORT §7
14072|3|The Upsell Ladder and Cross-Sell|PARTIAL|4ce67fc|polite-upsell-to-vps + upsell-desk-to-vps registry rows ship as Negotiate defenses, ladder triggers unimplemented
14082|3|Negative Churn as a Win Condition|PARTIAL|24dfcfe|GROWTH axis on the ratified commitment-convergence scorecard carries the shape, churn-vs-expansion math untracked
14091|3|The Reference Ladder|PARTIAL|9e701a0|findReferenceCandidates + referenceEligible projection live with tests, ladder rewards unimplemented
14099|3|Free Migration Service (as a retention *and* acquisition tool)|MISSING|-|deferred: MASTER_REPORT §7
14103|3|Fire the Customer|MISSING|-|deferred: MASTER_REPORT §7 - terminated phase reachable only via dunning or cliff lapse
14107|3|The Churn Walk (presentation)|MISSING|-|deferred: MASTER_REPORT §7
14121|3|Cohorts as pattern (not colour)|PARTIAL|9e701a0|cohortId per book row + loader cohortTier parsed, cohort-as-pattern rendering absent
14132|3|Satisfaction as posture|MISSING|-|deferred: MASTER_REPORT §7
14139|3|Customers sit down in your building|MISSING|-|deferred: MASTER_REPORT §7
14150|3|The Logo Wall|MISSING|-|deferred: MASTER_REPORT §7
14155|3|The SLA Credit Coin|PARTIAL|b7e262c|slaCreditOwedSec + sla-credit-cap clause live in economy, coin presentation absent
14160|3|Reputation Weather|PARTIAL|faf81a7|company::reputation HUD permanent row + Explain chain live, weather rendering absent
14167|2|3.8 Segmentation and positioning|PARTIAL|b7e262c 9e701a0|positioning engine absent, concentration bands + credential + placard spines are adjacent live fragments
14169|3|The Positioning Dial|MISSING|-|deferred: MASTER_REPORT §7 - no five-setting dial, era toggle is unrelated
14192|3|Vertical Compliance Moat|PARTIAL|9e701a0|CredentialRecord SOC2/PCI/HIPAA/FedRAMP with clean-days + revocation memory live in save spine, lead-gating unwired
14199|3|Revenue diversification as an explicit goal|PARTIAL|b7e262c|concentration RevenueQualityBand + worst-tag bar live, diversification goal unscored
14206|3|Customer-mix correlation as a strategy|MISSING|-|deferred: MASTER_REPORT §7 - scenario archetypeApplicability is loader data only
14215|3|The Niche compounds, the generalist doesn't|MISSING|-|deferred: MASTER_REPORT §7
14221|3|Declining demand as positioning|MISSING|-|deferred: MASTER_REPORT §7
14226|3|The Controlled Shrink (positioning by subtraction)|PARTIAL|9e701a0|LineEverRunRecord with divested_faced_wall placard state ships in save spine, no live shrink mechanic
14232|2|3.9 The client (tenant) system|PARTIAL|b7e262c 9e701a0|contract + clause + shed + repricing spine live, client-card layer unimplemented
14237|3|Clients are Spawners|PARTIAL|ef8f35e 4ce67fc|cohortSpawn.fromCustomerCard + tier parsed and frozen (both bundles declare true), visitors still spawn only from wave tables
14249|3|Client Cards (the game's best recurring choice)|MISSING|-|deferred: MASTER_REPORT §7 - client-card choice layer unimplemented
14301|3|The Client Interview|MISSING|-|deferred: MASTER_REPORT §7
14308|3|The Qualification Step (the pre-sale version)|MISSING|-|deferred: MASTER_REPORT §7
14313|3|SLA Contracts (per client) — and the Contract Clause Library|DONE|b7e262c|13-clause SLA_CLAUSE_IDS union + Escalator + GrandfatherLock + parseClauseRefs fail-loud + per-contract clauseRefs live
14329|3|The Upsell Moment|PARTIAL|4ce67fc|upsell registry rows only, moment triggers absent
14337|3|Noisy Tenant Isolation|PARTIAL|8fd409a 4ce67fc|slot/queue contention engine renders noisy-neighbor pressure + isolation defense rows shipped, no named noisy-tenant card
14344|3|The Sacrifice Decision|PARTIAL|8fd409a 2eaf830|shed ladder + directives + sold-class immunity + hard-cap termination live, per-client MRR/reputation sacrifice unwired
14360|3|Client Growth|MISSING|-|deferred: MASTER_REPORT §7 - contract MRC static, 3-8% compounding growth unmodeled
14374|3|The Reseller (client card)|MISSING|-|deferred: MASTER_REPORT §7
14379|3|Whale Management (four concrete verbs)|PARTIAL|b7e262c 9e701a0|concentration band + whaleShare field + g5 whale arc + achievement.whale-stayed copy, the four verbs unimplemented
14390|3|Firing a customer|MISSING|-|deferred: MASTER_REPORT §7 - cost-to-serve analytics gating it also absent
14396|3|Repricing them so they fire themselves (the third option)|DONE|b7e262c 0a2f1ca|escalate-and-renew cliff outcome carries newMrc and refusal-to-lapse is demonstrated by the g5 c01 whale arc
14404|3|The Deposit and the Credit Limit|PARTIAL|b7e262c|deposit-or-loc clause + credit-line APR/utilization state live, extend-risk verb unimplemented
14412|3|The Controlled Shrink|MISSING|-|deferred: MASTER_REPORT §7 - placard spine noted at line 14226 row
14418|2|3.10 Support and tickets as a visitor-facing system|PARTIAL|b7e262c 08d4fe2|delayed-fuse churn live + ticket/hydra copy and registry rows shipped, no ticket entities
14424|3|The attention budget|PROBLEM|8fd409a ea7acee|door hands live but support-hands unimplemented, OD-6 two-denomination ruling decided 2026-10-09 with implementation deferred (MODULE-STATUS gap row)
14432|3|First response time as a conversion stat|MISSING|-|deferred: MASTER_REPORT §7
14438|3|Support-experience churn (the delayed fuse)|DONE|b7e262c 40faf58|ghosted fuse with 30-60d drawn lag + decay + defusal + GhostedForecast bps + alert.churn-fuse copy voiced live in G5
14443|3|Tier-1 deflection and the self-service tower|PARTIAL|4ce67fc 08d4fe2|knowledge-base-deflection registry row + forum.thread.tier-N copy ship, deflection-rate mechanic absent
14449|3|The escalation path|MISSING|-|deferred: MASTER_REPORT §7 - tier copy only, engineering-time cost unmodeled
14455|3|The ticket avalanche|PARTIAL|4ce67fc|ticket-avalanche-hydra threat ships in the g1 wave-4 corpus with counter-defense rows, hands-consumption unwired
14461|3|The Concierge (support made visible)|MISSING|-|deferred: MASTER_REPORT §7
14467|3|The Ticket Paper Grammar|PARTIAL|08d4fe2|26 ticket subject/body flavour templates live in both packs, paper-stock encodings unimplemented
14477|3|The customer who files better tickets than your staff|PARTIAL|4ce67fc|sophistication field exists per registry threat (null + _todo), client-card stat and free-detection payoff unimplemented
14482|3|The self-inflicted ticket class|PARTIAL|08d4fe2|files-deleted/didnt-change/cron/password ticket copy shipped, console-IPMI rescue gates unimplemented
14490|2|3.11 The sales pipeline and the deal|MISSING|-|deferred: MASTER_REPORT §7 - no deal pipeline, g5 kanban lead column is display-only pre-signing rows
14496|3|The lead decay timer|MISSING|-|deferred: MASTER_REPORT §7 - no lead objects to decay
14502|3|The Sales Pipeline Rail|PARTIAL|0a2f1ca|g5 kanban renders lead-contracted-billing-renewal deal-stage columns live, stalled-dimming rail mechanics absent
14508|3|The RFP Fax|MISSING|-|deferred: MASTER_REPORT §7
14513|3|Qualification (and the cost of skipping it)|MISSING|-|deferred: MASTER_REPORT §7
14518|3|The security questionnaire as a gate|MISSING|-|deferred: MASTER_REPORT §7
14524|3|Compliance attestation as a gate-opener|PARTIAL|9e701a0|credential spine with clean-day requirements and revocation memory ships in save/, unblock-leads effect unwired
14530|3|The Procurement Portal (the delay nobody expects)|PARTIAL|b7e262c|net-30/60/90 terms model payment delay post-sale, procurement lag pre-sale unmodeled
14540|3|Channel Conflict and Deal Registration|MISSING|-|deferred: MASTER_REPORT §7
14548|3|The residual commission leak|MISSING|-|deferred: MASTER_REPORT §7
14553|3|The broker's cut|MISSING|-|deferred: MASTER_REPORT §7
14558|3|The buy-out play|MISSING|-|deferred: MASTER_REPORT §7 - press.headline.acquisition copy only
14563|3|The credit decision|PARTIAL|b7e262c|covenantBreaches + credit-line state + deposit-or-loc clause live, deal-level underwriting unimplemented
14569|3|The ramp and the commit|MISSING|-|deferred: MASTER_REPORT §7 - annual-escalator is price ramp not sales ramp
14575|3|The win-loss loop|MISSING|-|deferred: MASTER_REPORT §7 - CodexEntry models threat mastery only
14581|2|3.12 The visual grammar of visitors, clients, and the front of house|PARTIAL|4ff4a4f faf81a7|g1 lane grammar live (motes, rings, bounce and FP FX, hue ledger), full front-of-house grammar unimplemented
14586|3|Visitors Are Light; Threats Are Mass|PARTIAL|4ff4a4f|luminous cyan pulsing motes shipped in g1Scene, threats-not-as-mass opposite rendering absent
14594|3|The Costume Kit (the spec behind "one shape, many costumes")|PARTIAL|4ce67fc|durationClass-to-hull mapping authored in the shipped visitor registry, runtime draws circles only, no livery/prop/tag
14604|3|Value as Ornament, not size or glow|MISSING|-|deferred: MASTER_REPORT §7 - no ornament system
14611|3|The Patience Ring, with a three-stage LOD|PARTIAL|4ff4a4f|patience rings render as budget-spaced attachments on the leading six motes, deplete/three-state/crowd LOD unwired
14624|3|The Trail = Latency|MISSING|-|deferred: MASTER_REPORT §7 - no motion trails
14629|3|The Bounce (a universal six-frame animation)|PARTIAL|4ff4a4f|grey-and-walk-back bounce + burst FX + azure bounce-notice hue shipped, rotate-and-fragments ceremony absent
14634|3|The Bounce Cause Tag|PARTIAL|faf81a7|bounce causes ride notices with causeIds and G1 explain tooltips derive from counters, per-mote tags unrendered
14644|3|The Bounce Heatmap and its decay|MISSING|-|deferred: MASTER_REPORT §7 - no heatmap rendering
14650|3|The Convert (and the hard spec that keeps it from becoming noise)|MISSING|-|deferred: MASTER_REPORT §7 - served-goal counters live, convert animation unimplemented
14658|3|The Happiness Halo|MISSING|-|deferred: MASTER_REPORT §7
14663|3|The false-positive flash, reinforced|DONE|4ff4a4f faf81a7|false-positive amber flash renders through the eventFx budget + 403-counter instrument + alertStack FP severity
14671|3|Crowd density as a particle field (four bands with hysteresis)|PARTIAL|4ff4a4f|mote density tracks arrival rate with 1-mote-per-8-units theatre, four-band hysteresis quantization absent
14677|3|The Path Preview Ribbon|MISSING|-|deferred: MASTER_REPORT §7 - g4 previewCable ladder is cable preview not path preview
14682|3|The Lookalike Test|MISSING|-|deferred: MASTER_REPORT §7 - no silhouette-sharing tells, IDS-outline analog absent
14688|3|Glance Animations|MISSING|-|deferred: MASTER_REPORT §7 - g3 glance-grace pip retention is adjacent but not head-turn animation
14696|3|The Doorstep|MISSING|-|deferred: MASTER_REPORT §7 - trust-signal doorstep checklist unimplemented
14703|3|The Waiting Room|PARTIAL|faf81a7|queue depth carried by the queue-bar instrument and F2 queueDepth cells, antechamber body-language rendering absent
14708|3|The Turnstile|MISSING|-|deferred: MASTER_REPORT §7 - rate-limit visuals exist as meters not turnstiles
14713|3|The Party Chain|MISSING|-|deferred: MASTER_REPORT §7 - no party tethering
14718|3|The Entourage (whales and delegations)|MISSING|-|deferred: MASTER_REPORT §7 - g5 whale is a label not an entourage
14724|3|The Arrival Metronome|MISSING|-|deferred: MASTER_REPORT §7 - g6 tick-rate-metronome instrument is a different subject
14730|3|The Convoy and the Window Band|MISSING|-|deferred: MASTER_REPORT §7 - backup window bands unshipped, backup line out of scope
14736|3|The Red Case (the restore)|MISSING|-|deferred: MASTER_REPORT §7 - no restore/red-case visual
14742|3|The Blueprint Visitor|MISSING|-|deferred: MASTER_REPORT §7 - no blueprint-visitor rearrange ceremony, control-plane verbs exist in sim only
14747|3|The Customer Portrait System|MISSING|-|deferred: MASTER_REPORT §7 - g5 customerLabel strings are the only identity shipped
14759|3|The Contract Card|PARTIAL|0a2f1ca|g5 kanban cards carry MRR/term/tags rows as the live contract-card representation, curl-and-burn ceremony absent
14765|3|The Wall of Mirrors (customer-eye previews at scale)|MISSING|-|deferred: MASTER_REPORT §7 - customer-eye previews unimplemented
14775|3|The Empty Server Spiral, drawn|PARTIAL|4ce67fc|empty-server-spiral ships as a systemic registry threat row, the drawn spiral visual unimplemented
14780|3|The Busy Wall (capacity, universal)|MISSING|-|deferred: MASTER_REPORT §7 - capacity reads through instruments and dashes not a busy wall
14786|3|The Front Door, the Sign, the Billboard, the Kite|MISSING|-|deferred: MASTER_REPORT §7 - front-of-house signage system unimplemented
14793|3|The Beacon and the competing beacons|MISSING|-|deferred: MASTER_REPORT §7
14799|3|The Front-Page Geyser|MISSING|-|deferred: MASTER_REPORT §7
14804|3|The Dandelion and the referral web|MISSING|-|deferred: MASTER_REPORT §7 - referral web unimplemented
14811|3|The Review Wall and the Uptime Trophy Wall|MISSING|-|deferred: MASTER_REPORT §7
14817|3|The Status Page Beacon|MISSING|-|deferred: MASTER_REPORT §7 - status.rung copy ships, beacon visual absent
14822|3|The Logo Wall and the clean rectangle|MISSING|-|deferred: MASTER_REPORT §7
14827|3|The SLA Credit Coin|MISSING|-|deferred: MASTER_REPORT §7 - slaCreditOwedSec live in sim only, coin visual unimplemented
14831|3|The Churn Ledger Draft|MISSING|-|deferred: MASTER_REPORT §7 - churned lanes stop without the thinning-tap fade
14835|3|The 1-star on the window|MISSING|-|deferred: MASTER_REPORT §7 - no occlusion reputation mechanic
14842|3|Reputation Weather|MISSING|-|deferred: MASTER_REPORT §7 - reputation number live as HUD row, sky weather unimplemented
14847|3|The Sales Pipeline Rail and the RFP Fax|PARTIAL|0a2f1ca|g5 kanban is the live deal-stage rail presentation, RFP fax animation absent
14852|3|The Tour Rail and the verdict photograph|MISSING|-|deferred: MASTER_REPORT §7 - no colo tour rail
## SUMMARY
- DONE: 10
- PARTIAL: 54
- PROBLEM: 1
- MISSING: 158
- NA: 0
- TOTAL: 223 (8 ## + 215 ###)
## TOP-PROBLEMS
1. **§3.6 has zero offensive-economy machinery.** All 49 attraction headings are MISSING — arrivals enter only via wave tables; CAC, channel saturation, spend dials and referral graphs exist nowhere in code. The two-directional loop is one-directional in the build (deferred: MASTER_REPORT §7 Phase-1 scope).
2. **Attention budget is split across two un-reconciled hand systems.** The intent-door hands (8fd409a) model executive attention only; §3.10's staff-hands economy is unimplemented. OD-6 ratified one-pool-two-denominations on 2026-10-09 (ea7acee) with the implementation explicitly deferred to a later design lane — the only PROBLEM row in this range.
3. **The grudge/treatment spine is save-side only.** grudgeScore, referenceEligible, depositions and the won_back status (9e701a0, save/treatment.ts) are fully tested as data but NO live tick reads them — §3.7's "customers remember" emotional core and §3.9's client memory are a ledger without consequences.
4. **Client Cards — "the game's best recurring choice" — are entirely unimplemented** (14249), while both shipped bundles declare `cohortSpawn.fromCustomerCard: true` (4ce67fc) and the loader parses-and-freezes the flag with zero consumers (ef8f35e): shipped data asserts a mechanic that does not exist.
5. **`sophistication` is null + `_todo` on all 16 shipped registry threats** (registry-core.json) — the §3.10 avalanche-slope formula and the better-ticket-customer archetype (14477) both hang on this unauthored scalar.
6. **Renewal-twin zombie latent bug found and preserved under an open owner ticket** (MODULE-STATUS economy row, era of d29867f) while the renewal-cliff mechanism itself is DONE — flagged for orchestrator awareness, not re-classified.
7. **~40 PROVISIONAL economy config constants** (churn bps, dunning day-splits, error-budget costs — config.ts:10-13, OD-2 family) back the DONE churn/dunning/prepay rows: correct machinery, placeholder taste values.
8. **The Patience Ring renders as a uniform white circle** (g1Scene paintAttachments, 4ff4a4f) — the spec calls it "the single most important visitor visual" and none of the deplete/three-state/crowd-LOD degradation is built (14611 PARTIAL).
9. **Status page exists only as copy:** status.rung-1..5 decision keys + a status-page defense registry row ship (08d4fe2, 4ce67fc), and the i18n lane explicitly declined mapping them onto the 12-vocabulary StatusChip contract — the honesty-as-resource channel (13499) is content-only.
10. **Wave-title keys key.wave.1..5 remain unresolved in any pack** (MODULE-STATUS packs row) — adjacent to the ticket/press copy grammar this range relies on.
