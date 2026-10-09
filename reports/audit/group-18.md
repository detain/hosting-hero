# Group g18 audit — §6 head + 6.1-6.7 Economy/money — lines 21844-23751
## MANIFEST
21857|2|6.1 The currency set|PARTIAL|b7e262c 8fd409a|Six of sixteen currencies mechanized (cash buckets/error budget/hands/AR/revenue quality/segmented trust-data); intel, heat, lead-time and budget-form separations absent
21859|3|Cash (the survival currency)|DONE|b7e262c|economy/buckets.ts six-bucket stack; spendFree throws on shortfall; death happens on free per §6.13; buckets.test.ts green
21869|3|The Runway Bar (the actual health bar)|PARTIAL|b7e262c|runway.ts months + caution/critical tone computed; chrome TopBar/HUD_PERMANENT_METRICS shows cash not runway; long-horizon grey-out not wired
21883|3|MRR (the growth currency)|PARTIAL|b7e262c faf81a7|MRR readout on HUD (metrics.ts company::mrrMicroUsd) + g5 spine data; new+expansion−contraction−churn waterfall decomposition not computed (no expansion/contraction events)
21898|3|Revenue Quality — colour the money (T2)|DONE|b7e262c|RevenueQualityBand gold/green/blue/amber/red in types.ts:811; every LedgerEntry carries moneyColour; contract.ts revenueBar/bandFromTermMonths; g5 whale tagged red
21919|3|Error Budget (the spendable in-combat currency)|DONE|b7e262c|errorBudget.ts: budget from commitmentBps; spends risky-deploy 3min/reboot 90s/maintenance; drainOutage; RiskyActionLockedError exhaustion lock; clean-week refund + carry
21954|3|Reputation split into Visibility and Trust|PARTIAL|9e701a0 faf81a7|save/node.ts ReputationState domains customerTrust/upstreamTrust/staffTrust/industry + TreatmentEvent ledger; Visibility-vs-Trust buyable split absent; HUD reputation cell exists
21976|3|Intel / Knowledge|MISSING|-|deferred: MASTER_REPORT §7 six-gates scope; no intel currency; honeypot exists only as coverage/defenseRoles name
21983|3|Hands / Attention (staff-time)|DONE|8fd409a b1f757e|intent-door HandState tokens capacity 2; per-verb occupancyTicks; hands-exhausted refusal; busyCauseId attribution; overtime/morale borrow unmodelled
21991|3|Trust-with-upstreams (the hidden fifth, made real)|PARTIAL|9e701a0|upstreamTrust domain persisted in save reputation; the four made-real mechanics (visible bar/moves/pays: null-route, processor call, credit hold) have no engine sites
22008|3|Power and space (physical currencies)|PARTIAL|e2f69d3|topology power feeds + rack grid are structure not currency; no buy-in-blocks/resell-at-margin/stranded economics anywhere
22016|3|Lead time (the currency you cannot buy with money)|MISSING|-|deferred: MASTER_REPORT §7 scope; grep leadTime zero hits; procurement/lead-time board unbuilt
22026|3|Receivables (money that is real and unspendable)|DONE|b7e262c|accountsReceivable bucket credited at invoice issue (tick step 6); arAgingTrays + DSO approximation (billing.ts:282); AR explicitly not spendable
22033|3|The Heat meter (the grey-play currency)|MISSING|-|deferred: MASTER_REPORT §7 scope; no grey-play lines shipped; topology heat is thermodynamic not reputational
22044|3|EBITDA / contribution margin (the quality meter)|PARTIAL|b7e262c|EBITDA exists as covenant readout metric (runway.ts); marginProfile parsed as bundle data only (loader/bundle.ts:207 unconsumed); per-line contribution not computed
22053|3|The Three-Bucket Budget (Grow / Defend / Sustain)|MISSING|-|deferred: MASTER_REPORT §7 scope; no Grow/Defend/Sustain allocation mirror in ledger or HUD
22067|3|The Three Budgets (capex / opex / hands, with lossy conversion)|MISSING|-|deferred: MASTER_REPORT §7 scope; hands (door) and opex rows (unattended) exist but no budget-form separation or conversion friction
22081|2|6.2 Revenue streams|PARTIAL|b7e262c|MRC recurring + annual/multi-year prepay + reserve/deferred shipped; 32 of 37 named streams unbuilt; no Metering&Rating lane (g15)
22086|3|The recurring core (MRR)|DONE|b7e262c|billing.ts cycle grids hourly/monthly/annual anchored per contract; billedMrc applies escalator/MFN/grandfather; invoice calendar step 6; 12 signings in g5
22097|3|Annual and multi-year prepay|DONE|b7e262c|annualPrepay terms; prepayDiscount bps in cycleGross; deferred-bucket park + 1/12 recognition schedule; payment-fee saving falls out of single-charge fee math
22107|3|Setup, provisioning, and one-time fees|MISSING|-|deferred: MASTER_REPORT §7 scope; no NRC/setup-fee line in invoice engine
22117|3|Overage and usage billing (metered)|MISSING|-|deferred: no Metering&Rating (g15); hourly cycle is periodic not usage-metered; bill-shock policy trio absent
22129|3|95th-percentile bandwidth revenue (selling what you buy)|MISSING|-|deferred: shared-web.json realismToggles p95billing=false declared off
22137|3|Add-ons, upsells, and the attach-rate economy|MISSING|-|deferred: MASTER_REPORT §7 scope; no attach-rate stat; g4 palette buildables are infra not upsell SKUs
22149|3|Managed services and support plans|MISSING|-|deferred: MASTER_REPORT §7 scope
22156|3|Professional services and migrations|MISSING|-|deferred: MASTER_REPORT §7 scope
22165|3|Premium support tiers|MISSING|-|deferred: MASTER_REPORT §7 scope; response-SLA sale unmodelled
22171|3|Cross-connect fees|MISSING|-|deferred: MASTER_REPORT §7 scope; colo type not shipped
22177|3|Remote hands / smart hands|MISSING|-|deferred: MASTER_REPORT §7 scope
22185|3|Power resale (colo)|MISSING|-|deferred: MASTER_REPORT §7 scope; colo type not shipped
22195|3|Space rent (colo)|MISSING|-|deferred: MASTER_REPORT §7 scope
22198|3|Reserved / committed / prepaid capacity|PARTIAL|b7e262c|prepay with discount + revenue floor via term grid shipped; take-or-pay unused-commit penalty and Anchor visual absent
22208|3|Spot / preemptible sales|MISSING|-|deferred: MASTER_REPORT §7 scope
22217|3|Domain registration and renewal|MISSING|-|deferred: MASTER_REPORT §7 scope
22224|3|SSL, licences, and third-party resale|MISSING|-|deferred: MASTER_REPORT §7 scope
22231|3|Marketplace and platform revenue|MISSING|-|deferred: MASTER_REPORT §7 scope
22237|3|Reseller and white-label programs|MISSING|-|deferred: MASTER_REPORT §7 scope
22244|3|Wholesale / peering / transit resale|MISSING|-|deferred: MASTER_REPORT §7 scope
22254|3|Transit blend tiering (premium network as a SKU)|MISSING|-|deferred: MASTER_REPORT §7 scope
22261|3|IPv4 address leasing|MISSING|-|deferred: MASTER_REPORT §7 scope
22268|3|Data egress (the villain revenue)|MISSING|-|deferred: MASTER_REPORT §7 scope; no egress metering
22277|3|Retrieval and early-deletion fees (archive tiers)|MISSING|-|deferred: MASTER_REPORT §7 scope
22283|3|Backup / DR retainer|MISSING|-|deferred: MASTER_REPORT §7 scope
22289|3|Demand-response and grid-services payments|MISSING|-|deferred: shared-web.json realismToggles demandCharges=false declared off
22300|3|Heat reuse|MISSING|-|unlisted: no repo plan/ADR/doc mention; facility late-game unlock unbuilt
22306|3|Threat Intel feed|MISSING|-|deferred: follows unbuilt Intel currency (21976)
22312|3|MDF and vendor co-op marketing|MISSING|-|unlisted: no repo mention; no marketing-spend channel engine
22318|3|Referral income and overflow monetization|MISSING|-|deferred: MASTER_REPORT §7 scope
22324|3|Termination and early-exit fees (ETF)|MISSING|-|deferred: MASTER_REPORT §7 scope; cancellation settlement refunds not fees
22331|3|Asset resale and scrap recovery|MISSING|-|deferred: MASTER_REPORT §7 scope; no asset register
22339|3|Sale-leaseback|MISSING|-|unlisted: no repo mention; §6.11 financing out of scope
22346|3|SLA credits (negative revenue)|PARTIAL|b7e262c|slaCreditOwedSec + sla-credit-due notices + live outage drain mechanized; credit never posts to ledger; cap/claim-window/percentage-of-fee properties unmodelled; accrual liability absent
22353|3|Referral and affiliate payouts (negative revenue)|MISSING|-|deferred: MASTER_REPORT §7 scope; no CPA/clawback channel
22360|3|The whale contract|DONE|b7e262c 0a2f1ca|g5 c01 whale 2500usd/mo tagged red end-to-end: sign, AR, cliff-lapse at 86400 with cause gate5:rule:whale-price-increase-refused; save whaleShare projection (9e701a0)
22366|3|Margin ranking (the honest hierarchy)|MISSING|-|unlisted: per-line margin bars absent; marginProfile is an unconsumed data string
22383|2|6.3 Costs|PARTIAL|b7e262c a864061|Payment fees, dunning write-offs and churn cost shipped; COGS/Opex/Capex accounting spine absent; 25 of 31 cost lines unbuilt
22391|3|Hardware (capex) and the depreciation curve|MISSING|-|deferred: MASTER_REPORT §7 scope; no asset/depreciation ledger; g5 capital memo gate5:capital:* is fixture prose
22407|3|Bandwidth: the 95th-percentile bill|MISSING|-|deferred: realismToggles p95billing=false; absorb/shape/divert three-button absent
22447|3|Power, PUE, and cooling|MISSING|-|deferred: MASTER_REPORT §7 scope; topology thermal diffusion (physical.ts) is failure physics not billing
22464|3|The Demand Charge (the 95th percentile of electricity)|MISSING|-|deferred: realismToggles demandCharges=false
22484|3|kVA vs kW, power factor, and the 80% you can actually sell|MISSING|-|deferred: MASTER_REPORT §7 scope; no three-number power ledger
22497|3|Power purchase structures|MISSING|-|unlisted: index/fixed/PPA bet unbuilt
22507|3|Space and facility|MISSING|-|deferred: MASTER_REPORT §7 scope
22516|3|Licensing|MISSING|-|deferred: MASTER_REPORT §7 scope; per-account licence cost engine absent
22526|3|The true-up|MISSING|-|unlisted: reconciliation event unbuilt (also §6.7 23638)
22534|3|Payroll and the true cost of people|PARTIAL|a864061 0a2f1ca|Payroll as funded opex rows (unattended parseOpexRows) + g5 days 12/42/72; no loaded multiplier, on-call stipend, turnover or morale engine
22544|3|Support cost-to-serve|MISSING|-|deferred: MASTER_REPORT §7 scope; ticketsPerCustomer parsed unconsumed; grammar tickets token exists but no cost math
22564|3|Customer acquisition cost (CAC)|MISSING|-|deferred: cacProfile is a bundle data string (shared-web.json); no channel spend/payback engine
22578|3|Transaction and payment costs|DONE|b7e262c|cardRateBps + cardFixedMicroUsd charged only on net-0 (billing.ts:154-155); settlement days; rolling reserve; explains annual-prepay fee economics
22594|3|Abuse cost|MISSING|-|deferred: MASTER_REPORT §7 scope; no grey lines shipped
22604|3|Compliance and audit cost|MISSING|-|deferred: MASTER_REPORT §7 scope
22610|3|Insurance, legal, and the SLA reserve|MISSING|-|unlisted: premium questionnaire, exclusions and accrual unbuilt
22626|3|Support contracts and warranties|MISSING|-|deferred: MASTER_REPORT §7 scope
22634|3|The RMA pipeline|MISSING|-|deferred: MASTER_REPORT §7 scope
22644|3|The Truck Roll|MISSING|-|deferred: MASTER_REPORT §7 scope
22651|3|Circuit contract liabilities (NRC, MRC, term, ETL)|MISSING|-|deferred: MASTER_REPORT §7 scope; term/cliff engine exists for customer contracts only
22662|3|Egress to your own DR site|MISSING|-|deferred: MASTER_REPORT §7 scope
22670|3|Transit commits and take-or-pay|PARTIAL|b7e262c|committedOut bucket + netPosition subtraction declared (buckets.ts:36,131) but NO engine site ever writes it — commit mechanics absent
22677|3|Double-running during migration|MISSING|-|deferred: MASTER_REPORT §7 scope (§6.14 unbuilt)
22681|3|Marketing spend (as a cost with a lag)|MISSING|-|deferred: MASTER_REPORT §7 scope; no spend channel exists (also 23701)
22684|3|Bad debt, chargebacks, and fraud loss|PARTIAL|b7e262c|Dunning ladder terminates in write-off (tick:726-731; g5 c05/c06); badDebtBpsByBundle + chargebackFeeMicroUsd are declared-but-consumed-nowhere config (config.ts:195,47)
22693|3|Decommissioning and e-waste disposal|MISSING|-|deferred: MASTER_REPORT §7 scope
22700|3|Interest and debt service|MISSING|-|deferred: MASTER_REPORT §7 scope; creditLineAprBps configured, no interest posting engine (also 22892)
22706|3|Toil (the staff-hour cost of every shortcut)|MISSING|-|deferred: MASTER_REPORT §7 scope; hands exist, toil-ratio accounting does not
22713|3|Technical debt interest|MISSING|-|deferred: MASTER_REPORT §7 scope; no debt-point ledger line
22729|3|Churn (the cost that isn't a cost)|DONE|b7e262c 40faf58|churn.ts voluntary roll + involuntary failure channel; churned-voluntary notice; g5 churn column + churn-fuse pack copy i18n
22736|3|The trap list (costs that look like nothing and eat you)|NA|b7e262c|Editorial recap list; constituent traps judged at their own headings (several MISSING above)
22750|2|6.4 Cash-flow mechanics|PARTIAL|b7e262c|Strongest subsection: dual ledger, net-75 slip, deferred recognition, dunning FSM, invoice calendar, runway all live; squeeze/CCC/capex/AP/injection incomplete
22756|3|Cash vs Profit (the two ledgers)|DONE|b7e262c 0a2f1ca|Journal (P&L) vs six buckets (cash) are structurally separate with mandatory CauseId per post; g5 proves divergence: Month-1 +158usd profit vs -1.6k free-cash crater; Gap Bar widget itself is §6.15 scope
22780|3|Net-30 / 60 / 90 — and why net-60 is really net-75|DONE|b7e262c|InvoiceTerms.netTermsDays + cfg.billing.netTermsSlipDays slip (billing.ts:92); DSO tray approximation; 2/10 earlyPay knobs exist in config unconsumed
22793|3|Deferred revenue|DONE|b7e262c|deferred bucket + openRecognitionSchedule 1/12 releases + planRefund pulls unreleased remainder; §6.13 liability reading in g5 BUCKET_LAWS
22802|3|Annual prepay discount|DONE|b7e262c|annualPrepayDiscountBps applied in cycleGross (billing.ts:116-128); cash lands free immediately vs deferred parking per tick:624
22810|3|The refund window and the money-back guarantee|PARTIAL|b7e262c|Cancellation refund settlement + prepaid-refunded notice shipped; the 30/90-day guarantee dial with conversion lift is unmodelled
22816|3|Involuntary churn and dunning|DONE|b7e262c 0a2f1ca|paymentFailureRoll 5-9pct/mo; six-stage FSM with per-stage recoveryBps; suspension day from config; g5 c05/c06 climb ladder to written-off, c07 E-2 resurrects at 37440
22833|3|The invoice calendar|DONE|b7e262c 6f5da38|Billing on the 1st, declines 1-4, dunning 5-20, payroll 15th/last in g5 (gate-g5.test.ts conservation every minute); catch-up cap maxCatchUpInvoicesPerTick
22849|3|The Payroll Clock|PARTIAL|a864061 0a2f1ca|Hard recurring deadline funded in unattended + g5; miss-payroll-costs-staff (morale collapse/resignations) engine absent
22856|3|Seasonality|PARTIAL|47b2c33|Demand seasonality via wave envelopes/telegraph tables (waves lane); cash seasonality emerges from renewal-term clustering in g5; no authored Black-Friday/tax-season calendar
22865|3|Capex lead time|MISSING|-|deferred: MASTER_REPORT §7 scope; ordering pipeline absent
22874|3|Working capital in hardware|MISSING|-|deferred: MASTER_REPORT §7 scope; no inventory
22881|3|Vendor terms (AP as a lever)|MISSING|-|deferred: MASTER_REPORT §7 scope; ledger is AR-only, no payables clock
22885|3|Deposits and prepay requirements|PARTIAL|b7e262c|Prepay-for-all shipped (annual terms); risk-gated deposit dial per customer archetype absent; restricted bucket exists as landing zone
22892|3|The credit line|PARTIAL|b7e262c|creditLineDrawn tick input + utilization streak feeds death-spiral (runway.ts); APR configured; no draw/repay money movement in engine
22900|3|Runway|DONE|b7e262c|runwayMonths = free / trailing net burn (business calendar); tone shift <6/<3 months; lose-slowly guard step 12
22914|3|The working-capital squeeze (you can lose by winning)|PARTIAL|b7e262c|DeathSpiralState detector flags the recognizable state; named Growth Death lose-condition + HUD warning (g5 shows the crater) not formalized
22922|3|The cash conversion cycle|MISSING|-|unlisted: derived CCC number per line uncomputed; cashTiming bundle field is prose
22932|3|Capital injection events|MISSING|-|deferred: MASTER_REPORT §7 scope; §6.11 financing unbuilt
22940|2|6.5 Pricing as a mechanic|PROBLEM|b1f757e b7e262c|Pricing is engine-side data (MRC/cliff/escalator/MFN/grandfather) with NO player pricing verb among the 8 door verbs; 21 of 29 dials unbuilt; oversell slider declared-dead (22992)
22942|3|The price slider (difficulty as a dial the player sets)|MISSING|-|deferred: MASTER_REPORT §7 scope; door verbs are place/connect/disconnect/configure/commit/shed/communicate/toggle; no elasticity readout
22961|3|The Margin Death Zone|MISSING|-|deferred: MASTER_REPORT §7 scope; needs fee+support+abuse per-account math (22578 partial inputs exist)
22974|3|The Pricing Floor Calculator|MISSING|-|deferred: MASTER_REPORT §7 scope
22983|3|The Unit Economics Card|PARTIAL|0a2f1ca|g4 terms card shows revenue/cost/latency/SLA per buildable purchase; per-archetype LTV:CAC:payback:tenure card absent
22992|3|The oversell ratio|PROBLEM|4ce67fc|shared-web.json:84 commercialSlider "oversell-ratio" + rosetta card parsed (loader/bundle.ts:112,616; R16 lint hook) but ZERO engine consumers — dead slider; P(contention)=ratio^2.2 x homogeneity never computed
23042|3|Grandfathering|PARTIAL|b7e262c|GrandfatherLock priced-while-locked subtracts from billedMrc (contract.ts:78-88); migrate-with-notice/sweetener churn events unmodelled
23064|3|The Price Increase (the four-parameter decision)|PARTIAL|b7e262c|Engine-side reprices exist (annual escalator, MFN lag-queue, whale-increase refusal cause) but the four-dial player action with churn-spike computation has no verb
23077|3|Intro pricing and the renewal cliff|PARTIAL|b7e262c|Cliff fires exactly at term-end business minute (tick step 5; g5 whale lapse 86400 + c12 cliff-renew 126720); intro-price spread dial not modeled
23088|3|Term discounting and commit discounts|DONE|b7e262c|annualPrepay discount + renewalRetentionBpsByTermMonths retention ladder (churn config) price the term trade
23096|3|Volume and committed-use discounts|MISSING|-|unlisted: take-or-pay floor absent; volume-bps tiers unbuilt
23103|3|Tier design and the good-better-best ladder|MISSING|-|deferred: MASTER_REPORT §7 scope
23113|3|Cost-plus vs value pricing|MISSING|-|unlisted: positioning multipliers unbuilt
23120|3|Usage-based vs flat|MISSING|-|deferred: needs metering (22117)
23127|3|Metered vs unmetered vs "unlimited"|MISSING|-|deferred: needs metering; fair-use contention unbuilt
23135|3|Overage policy|MISSING|-|deferred: MASTER_REPORT §7 scope
23142|3|SLA tier pricing and the true shape of a credit|PARTIAL|b7e262c|uptimeTarget -> commitmentBpsOf -> budget size priced per contract; SLA_CLAUSE_IDS + shed-immunity on sold classes; credit cap/claim-window/percentage-of-fee properties unposted
23155|3|The Cost of a Nine (an explicit, visible cost curve)|PARTIAL|b7e262c|Nines mechanically cost error-budget scale + clause refs; the 3.5x-infra per-nine cost curve is not priced; chrome numberLaw formats nines-with-minutes (faf81a7)
23167|3|Segmented pricing|MISSING|-|deferred: MASTER_REPORT §7 scope; archetype risk-premium tiers unbuilt
23175|3|Yield management|MISSING|-|unlisted: dynamic scarce-inventory pricing unbuilt
23182|3|Regional pricing / PPP|MISSING|-|unlisted: no repo plan/ADR/doc mention
23188|3|Bundling|MISSING|-|unlisted: bundles are type-bundle data not sellable bundles
23195|3|Free tier and free trial|MISSING|-|deferred: MASTER_REPORT §7 scope
23204|3|Loss leaders and attach rate|MISSING|-|deferred: MASTER_REPORT §7 scope
23211|3|The Promo Engine|MISSING|-|deferred: MASTER_REPORT §7 scope; coupon cohorts unmodeled
23218|3|The discounting spiral and discount authority|MISSING|-|unlisted: no repo plan/ADR/doc mention
23225|3|Elasticity testing|MISSING|-|unlisted: A/B pricing research action unbuilt
23233|3|The race to the bottom|MISSING|-|deferred: no NPC competitor pricing (MASTER_REPORT §7)
23244|3|Custom enterprise pricing (the quote)|MISSING|-|deferred: MASTER_REPORT §7 scope; clause-concession negotiation unbuilt though clause vocabulary exists
23251|3|The Margin Tint (pricing made ambient)|MISSING|-|unlisted: per-card margin tinting absent (revenue-quality colour is the nearest cousin)
23261|2|6.6 Per-type economics|PARTIAL|4ce67fc b7e262c|economy block (unitOfSale/shape/margin/cashTiming/term/cac/tickets/badMonth) parsed for exactly 2 of 28 types and NOT consumed by any sim logic — variety engine not yet cashing out financially
23266|3|The fundamental hosting economic truth|PARTIAL|8fd409a|Utilization physics live (rho/(1-rho), slots, backpressure — the pipeline's core equation); the revenue=utilization x price HUD gauge + per-resource green/red bands absent
23282|3|The revenue-shape table|PARTIAL|4ce67fc|shared-web + game-servers rows shipped as structured data (28-row table otherwise deferred: MASTER_REPORT §7); loader parses, no engine reads
23324|3|Companion table A — term, churn, and cash conversion|PARTIAL|b7e262c|Term + churn columns feed the engine for shipped bundles (monthlyLogoChurnBpsByBundle, retention-by-term); CCC column uncomputed
23346|3|Companion table B — acquisition and support load|MISSING|-|deferred: MASTER_REPORT §7 scope; cacProfile/ticketsPerCustomer parsed unconsumed
23362|3|Companion table C — what a bad month looks like|PARTIAL|08d4fe2|badMonth i18n keys shipped in both packs (economy.shared-web.bad-month etc.); pressure content authored for 2 types only (rest deferred: MASTER_REPORT §7)
23389|3|Data gravity|MISSING|-|deferred: MASTER_REPORT §7 scope; storage lines unshipped
23400|3|Lease terms and the colo cash profile|MISSING|-|deferred: colo type not shipped; term/escalator engine is type-agnostic and ready
23409|3|Occupancy, stranded capacity, and absorption rate|MISSING|-|deferred: MASTER_REPORT §7 scope; facility landlord lines unshipped
23432|3|Power as a product|MISSING|-|deferred: colo type not shipped
23441|3|Cross-connects: the best line item in hosting|MISSING|-|deferred: colo type not shipped (§5.6 unlock unbuilt)
23460|3|Peering ratio as a cost driver (and a diversification payoff)|MISSING|-|deferred: MASTER_REPORT §7 scope
23471|3|Deliverability as revenue (email)|MISSING|-|deferred: email type not shipped; email deliverability exists only as a save reputation domain name
23479|3|Per-query and per-invocation pricing (DNS, serverless, IoT)|MISSING|-|deferred: types unshipped; hourly cycle is nearest analogue
23487|3|Restore-SLA pricing (backup/DR)|MISSING|-|deferred: backup type not shipped
23496|3|Deadline premiums (HPC / render)|MISSING|-|deferred: HPC type not shipped
23503|3|GPU price volatility — and the financing mismatch underneath it|MISSING|-|deferred: GPU type not shipped; term-vs-financing stat unbuilt
23520|3|The abuse cost line|MISSING|-|deferred: grey types not shipped (pairs 22594/22033)
23527|3|The obsolescence clock and the cascade down-tier|MISSING|-|deferred: MASTER_REPORT §7 scope; no asset ages
23538|3|Demand response and time-of-use|MISSING|-|deferred: realismToggles demandCharges=false
23549|3|Contract length as per-type personality|PARTIAL|b7e262c 0a2f1ca|Term structure per bundle drives cliff cadence + retention ladder; g5 plays monthly vs term-12/36 cohorts (c04/c08/c11) differently; escalator/pass-through negotiation dial absent
23562|3|Internal transfer pricing (once you run more than one line)|MISSING|-|deferred: MASTER_REPORT §7 scope (§6.14)
23567|2|6.7 Money-moving events|PARTIAL|b7e262c|Money-moving beat infrastructure is excellent (22 EconomyNotice kinds + invoice-settled SimEvent + mandatory CauseId = P10 attribution); most specific events unbuilt; card-with-responses pattern not applied
23571|3|The governing rule for this subsection|PARTIAL|b1f757e 0a2f1ca|Decision-card pattern exists (g4 terms card w/ confirm/cancel; door verbs cost hands) but money-moving events still arrive as announcement notices, not 2-3-response cards
23581|3|The whale signs|PARTIAL|0a2f1ca|g5 scripts the sign + concentration + net-terms lag to first cash; the five-step landing sequence (questionnaire/legal/onboarding/staged-install choices) is fixture prose not engine
23596|3|The whale leaves|PARTIAL|b7e262c|The not-renewing variant is mechanized (90-day renewal pulse lead + cliff lapse with cause, g5 at 86400); replace-them-in-90-days scenario pressure unauthored
23604|3|SLA credit event|PARTIAL|b7e262c|Taxi-meter analog: budget drains live during outage + sla-credit-due at exhaustion (g5 6000s incident on c07); actual credit payment/claim mechanics unposted (see 22346)
23614|3|The chargeback wave|MISSING|-|deferred: MASTER_REPORT §7 scope; chargeback fee configured unconsumed; monitoring-program lose condition absent
23622|3|Bill shock|MISSING|-|deferred: needs metering (22117); no dispute/credit card
23630|3|The vendor renewal price increase|MISSING|-|deferred: MASTER_REPORT §7 scope; no vendor cost contracts
23638|3|The true-up|MISSING|-|unlisted: see 22526
23642|3|The invoice that doesn't get paid|DONE|b7e262c 0a2f1ca|AR aging -> dunning -> suspend -> write-off fully engine-driven; g5 c05/c06 walk it and c07's post-suspension recovery proves the hard-call branch; collections step unmodeled
23650|3|The audit finding|MISSING|-|deferred: MASTER_REPORT §7 scope; compliance lines unshipped
23658|3|The lawsuit / the legal letter|MISSING|-|deferred: MASTER_REPORT §7 scope; save treatment-log quotes are its only descendant (9e701a0)
23665|3|The acquisition offer|MISSING|-|deferred: MASTER_REPORT §7 scope; §6.9 valuation unbuilt
23673|3|The acquisition opportunity|MISSING|-|deferred: MASTER_REPORT §7 scope
23680|3|The customer-book purchase|MISSING|-|deferred: MASTER_REPORT §7 scope; churn-haircut migration unmodeled
23686|3|The grant / the tax credit / the utility rebate|MISSING|-|deferred: MASTER_REPORT §7 scope
23693|3|The viral moment|PARTIAL|47b2c33|Wave spike/telegraph envelopes deliver the traffic-crush beat with bounce economics; the money side (bandwidth bill, capture-vs-protect card) unattached
23701|3|Marketing spend|MISSING|-|deferred: MASTER_REPORT §7 scope; channel saturation/CAC model absent (see 22564)
23714|3|The insurance payout|MISSING|-|deferred: MASTER_REPORT §7 scope; insurance itself (22610) unbuilt
23720|3|The refund wave|PARTIAL|b7e262c 0a2f1ca|E-9 freeze + stacked w8-w10 refunds settle at 113760 in g5 via prepaid-refunded + planRefund deferred-pull; grant/refuse per-request card unmodeled
23726|3|The processor's rolling reserve is imposed|DONE|b7e262c|Reserve park on settlement (tick:635, rollingReserveBps) + restricted->free release schedule (openReserveSchedule); imposition trigger (chargeback spike) not event-driven
23733|3|The distributor credit hold|MISSING|-|deferred: MASTER_REPORT §7 scope; no procurement/AP engine
23740|3|Covenant breach|PARTIAL|b7e262c|Covenant data records + covenantBreaches evaluator (min/max bps, EBITDA-shaped) + credit-line spiral feed it; waiver-fee/forced-sale/control escalation absent
23747|3|The double-carry begins (a pivot event)|MISSING|-|deferred: MASTER_REPORT §7 scope (§6.14 pivot economics)
## SUMMARY
- Rows: 182 (7 level-2 + 175 level-3). Note on expectation: orchestrator brief said 8 ## headings; disk shows 7 `##` inside the range — the 8th is the chapter head `# 6. Economy, money, and scoring` at line 21844, which is level-1 and per g13 precedent gets no MANIFEST row. Row count self-verified against outline.md Table 3 extract (/tmp/opencode/g18-list.tsv, 175 lines).
- DONE: 20 (all in economy/: buckets, billing, dunning, churn, errorBudget, runway, AR/deferred/reserve, whale lifecycle in g5, hands)
- PARTIAL: 41
- PROBLEM: 2 (6.5 subsection-level + oversell-ratio dead slider; plus recorded: renewal-twin zombie latent bug MODULE-STATUS:97 affects cliff/invoice ids, negative-settle host-fund law MODULE-STATUS:101 open owner call)
- MISSING: 118 (101 `deferred:`, 17 `unlisted:`)
- NA: 1 (trap-list recap)
- Status-vocab honesty: OD-1/OD-2 checked before use — scorecard is RATIFIED-LIVE (commit 24dfcfe), so scoring headings are not owner-gated; ~40 economy config constants remain PROVISIONAL per gap row MODULE-STATUS:93.

## TOP-PROBLEMS
1. **Pricing is player-inert** — none of the 8 door verbs touch price; all repricing (escalators, MFN reprices, grandfathered locks, whale-increase refusals) is engine-side. §6.5's thesis "the player chooses their own difficulty by choosing their business model" has no input surface: 21/29 headings MISSING, subsection PROBLEM.
2. **Oversell-ratio dead slider** — shared-web.json:84 declares `commercialSlider: "oversell-ratio"` (mirrored in rosetta cards + loader lint hook R16) yet zero sim-core code computes ratio, contention probability, or correlated failure. Declared as THE defining shared-hosting decision; implemented as a string.
3. **backlog / committedOut buckets never written** — buckets.ts:35-36 declares all six and netPosition() honors them, but no tick path credits backlog (signed-not-installed whale work) or committedOut (take-or-pay promises): §6.13's most novel money states are type-level only (corroborates g15 finding; affects 22670, 23581).
4. **Revenue-stream breadth vs engine depth** — 32 of 37 §6.2 streams unbuilt; what shipped (MRC + prepay + deferred + reserve + net-slip + fees) is genuinely deterministic and tested (181 economy tests), but "revenue has a colour" only monetizes one shape.
5. **Event cards remain announcements** — §6.7's governing rule demands 2-3-response cards with hand costs; the engine emits 22 kinds of EconomyNotice (observed, attributed) while the decision-card machinery that exists (g4 terms card, intent door) was never pointed at money events.
6. **Config knobs declared-but-unconsumed** — chargebackFeeMicroUsd (config.ts:248), badDebtBpsByBundle (:314), earlyPayDiscountBps (:74) carry LIVE/MID provenance cites but have no write path — same failure class as the oversell slider; per MODULE-STATUS:93 they await the tuning pass that presumes consumption exists.
7. **SLA credits never post** — exposure is computed live (drainOutage + sla-credit-due notice) but the credit is never a negative-revenue ledger entry, and the four priced properties from §6.5 (percentage-of-fee, cap, claim window, unclaimed windfall) are unmodelled (22346/23604).
8. **6.6 data layer unconsumed** — the per-type economy block is parsed+validated for the 2 shipped bundles but read by nothing (only g5 reaches raw wire for tuningSheet); until an engine site consumes revenueShape/marginProfile, the variety engine's financial cash-out is a fixture claim, not a sim claim.
9. **Renewal-twin zombie invoice (latent)** — MODULE-STATUS:97: `inv:<contract>:<cycle>` re-mints after cycle-counter reset, shadowing AR aging — a correctness hazard sitting directly under the renewal-cliff headings (23077/22833); preserved deliberately pending owner semantics call.
