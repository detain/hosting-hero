# Hosting Tower Defense — Idea Wave 2 — Lens: **CEO / Marketing** (operator's-eye view)

> The premise of this document: the towers, the creeps, and the map are all real enough — but what a
> hosting operator actually *plays* every day is the **P&L**. Packets are the visual language;
> **contracts, churn, cash conversion, reputation, and capacity utilization** are the game.
> Every idea below is written so that a person who has actually signed a colo lease, argued with a
> payment processor, or eaten a chargeback storm would nod and say "yeah, that's how it goes."
>
> Core CEO thesis for this design: **the player never fights packets. The player fights the gap
> between revenue recognized and cash in the bank, and threats are just things that widen that gap.**

---

## Category 1 — Levels, Scenarios, and Progression

### 1.0 The spine: "The P&L Ladder"

Progression is not measured in racks. It is measured in what line of the income statement you are
allowed to touch.

- **Tier 0 — Pocket Money.** You have revenue and one cost. There is no distinction between "cash"
  and "profit." Everything is a single number.
- **Tier 1 — Invoice & Churn.** Revenue splits into *MRR* and *one-time*. Customers now leave.
- **Tier 2 — Capex vs Opex.** You can buy things that cost money now and pay back later. Depreciation
  appears. "Profitable but broke" becomes possible for the first time — and it should kill your first run.
- **Tier 3 — Working Capital.** Deferred revenue, annual prepay, DSO, dunning, bad debt.
- **Tier 4 — Financing.** Leases, vendor financing, a revolver, an investor. Covenants.
- **Tier 5 — Portfolio.** Multiple lines of business with different margin/churn/capex profiles;
  you allocate capital between them instead of just building.
- **Tier 6 — Enterprise Value.** The score stops being cash and becomes a **multiple** — EBITDA
  multiple for colo, ARR multiple for cloud, per-customer multiple for shared hosting.

Each tier unlocks a new *HUD strip*, so complexity is visibly gated. A shared-hosting newbie level
literally does not render the Deferred Revenue bar.

### 1.1 Levels built around specific hosting businesses

Each one lists: **the business model**, **what's new**, **what gets harder**, **win condition**.

**L1 — "One Box, Three Friends" (reseller hosting, 2010s)**
You resell someone else's shared server. Business model: you buy a $25/mo reseller plan and sell
five $8 accounts off it. *New:* MRR, the concept of gross margin as a spread you don't control.
*Harder:* your upstream provider is a threat you cannot build defenses against — his outage is your
outage, his price hike is your margin. *Win:* reach positive contribution margin with 12 accounts
before your upstream raises the plan price.
*CEO truth:* every hosting company on earth started as an arbitrage on somebody else's iron.

**L2 — "The $2.95 Machine" (mass shared cPanel hosting)**
Business model: oversubscription. 800 accounts on a box that can really serve 90 concurrently active
ones. *New:* the **Oversell Dial** (see Mechanics), **renewal-rate pricing** ($2.95 intro / $13.99
renewal), **cost-per-ticket**. *Harder:* one abusive tenant degrades everyone; a single "your site is
slow" review thread can cost you a month of signups. *Win:* survive the 12-month renewal cliff with
>55% of cohort 1 intact.

**L3 — "Cage 14, Row B" (you colocate 4U in someone else's DC)**
You stop renting service and start owning hardware. *New:* **capex**, depreciation schedules, remote
hands billed in 15-minute increments, a monthly cross-connect invoice. *Harder:* you now have a
physical trip cost — every hands-on fix is either $150 of remote hands or two hours of driving.
*Win:* get gross margin above the colo bill for 3 consecutive months.

**L4 — "Half a Cabinet" (power is the real product)**
You lease 20U but only 2.5kW. *New:* **the kW cap** — you will run out of amps long before you run
out of rack units. *Harder:* every density upgrade is a lease renegotiation, not a purchase. *Win:*
hit 85% power utilization without tripping a breaker (a breaker trip = half your customers down =
churn spike + SLA credits).
*CEO truth:* colo is sold in kilowatts; RU is the vanity metric.

**L5 — "LowEnd Summer" (VPS price war on a deal forum)**
Your demand comes almost entirely from one deal community. *New:* **Reputation-as-demand** — the
signup lane literally opens and closes based on your forum standing. Flash sales. *Harder:* your
customers benchmark you publicly and post the graphs; overselling RAM is instantly visible.
Everyone's price is public. *Win:* survive a competitor's suicidal $7/year offer without matching it.

**L6 — "Premium Pivot" (managed WordPress / managed app hosting)**
Deliberately *shed* cheap customers to raise ARPU 10x. *New:* **negative-churn mechanics** — you
voluntarily fire customers and it improves your score. Migration-in as a service (white-glove
onboarding as a buildable). *Harder:* managed means you own their code's problems. A customer's bad
plugin is now your outage. *Win:* raise ARPU from $6 to $60 while keeping absolute gross profit flat
or better.

**L7 — "Tick Rate" (game server hosting)**
Prepaid monthly, wild seasonality tied to game launches. *New:* **Hype Cycle curve** — a new game
launches, demand 20x's for 6 weeks, then 85% evaporates. **Streamer/influencer partnerships** as a
paid acquisition buildable. *Harder:* fraud. Stolen-card signups, chargebacks at 2-4% of revenue,
and DDoS is a *product feature* not just a defense. Support tickets arrive at 2am from 14-year-olds.
*Win:* end the level with cash intact after the hype collapses — i.e., don't buy 40 servers at the peak.

**L8 — "The Deliverability Desk" (email hosting)**
Your product is not storage; it's **whether Gmail accepts your mail**. *New:* **IP reputation as a
balance-sheet asset** that appreciates slowly and can be destroyed in an hour. *Harder:* one spammer
signup poisons a /24 and every legitimate customer's mail bounces. Abuse vetting at signup directly
suppresses your growth rate — the tension is explicit. *Win:* 30 days at >98% inbox placement while
still growing.

**L9 — "Anycast Anywhere" (DNS hosting)**
Free tier as a funnel; enterprise contracts as the revenue. *New:* the **freemium funnel** — free
users cost you money and are your only lead source. *Harder:* your free tier is a DDoS amplification
magnet and a crypto-phishing host. *Win:* convert 1.5% of free to paid before free-tier cost exceeds
paid revenue.

**L10 — "Edge Money" (CDN)**
*New:* **95th-percentile bandwidth billing**, transit commits, peering. You buy at $0.30/Mbps and
sell at $0.02/GB — the arbitrage is the whole company. *Harder:* one viral customer blows your 95th
and you lose money serving them all month. Peering with the right eyeball networks is a buildable that
permanently reduces COGS. *Win:* get blended transit cost under a target while adding 3 POPs.

**L11 — "Cold Storage, Warm Margins" (backup / DR hosting)**
*New:* **dedup ratio literally is your gross margin**, retention policy as a pricing lever, egress
fees as both revenue and a churn-prevention moat (data gravity). *Harder:* **restore surge** — when
a customer has a disaster, your costs spike exactly when they're most emotional. Silent data
corruption compounds invisibly and is discovered at the worst moment. *Win:* prove a restore inside
the promised RTO during a customer's real disaster, with margin intact.
*CEO truth:* backup revenue is beautiful because it never churns — the switching cost is the egress bill.

**L12 — "Tape Vault" (offsite archival, period-agnostic)**
Courier routes, vault slots, retrieval SLAs measured in hours-to-days. *New:* **physical logistics
as a cost center**, media lifecycle (tapes expire). *Harder:* a missed courier run is an SLA breach
with no technical fix. *Win:* fulfill 100% of retrieval SLAs during a courier strike.

**L13 — "Dial Tone" (1996 dial-up ISP)**
Modem banks, per-port economics, the fatal "unlimited" plan. *New:* **the oversubscription ratio you
can't fix with software** — ports are physical. Busy signal = churn. *Harder:* a competitor announces
unlimited for $19.95 and you must decide whether to follow them off the cliff. *Win:* survive 12
months without your busy-signal rate exceeding 3%.
*CEO truth:* this is the original hosting business model failure — pricing flat while cost is metered.

**L14 — "The Sysop's Ledger" (1988 BBS)**
Four phone lines, donation-ware, long-distance charges. Revenue is tips, door-game fees, and a
newsletter. *New:* charmingly tiny numbers; the whole P&L fits in one screen. *Win:* pay the phone bill.

**L15 — "Suite 300" (your own suite, multi-tier stack)**
Load balancers, DB tier, cache tier, multiple products. *New:* **product-line P&L** — you can see
which product is subsidizing which. *Harder:* internal cost allocation; shared components mean an
outage hits three revenue lines at once. *Win:* every product line individually gross-margin positive.

**L16 — "Landlord" (colo operator; tenants are other hosting companies)**
Your customers walk into your building with their own gear you cannot control. *New:* **cross-connect
revenue** (~95% margin, the actual profit center), **metered vs committed power**, **remote hands as
a billable**, 3–5 year contracts with annual escalators. *Harder:* a tenant's bad UPS or fire is your
building's problem; a tenant going bankrupt leaves you with abandoned gear and a lien process. *Win:*
reach 80% contracted power with a weighted-average remaining lease term above 30 months.

**L17 — "Anchor Tenant"**
A single prospect wants 40% of your suite at a 35% discount on a 7-year term. *New:* the
**concentration risk meter**. Taking it makes you instantly profitable and permanently hostage.
*Win:* either land it with protective terms, or fill the same space with six smaller tenants before
the quarter ends. Both are valid wins with different scores.

**L18 — "Kilowatt Casino" (power resale & demand response)**
*New:* **stranded capacity** (you sold RU you can't power, or power you can't cool), **utility demand
response** (get paid to shed load during grid peaks — actual revenue line), time-of-use pricing.
*Harder:* a heat wave raises both your cooling draw and your power price simultaneously. *Win:* PUE
target + a demand-response payment without breaching a single tenant SLA.

**L19 — "Allocation" (GPU / AI compute hosting)**
*New:* **pre-selling capacity to finance the purchase** — you cannot buy the GPUs unless you have
signed contracts, and you can't sign contracts without capacity. The chicken-and-egg is the level.
Reserved vs on-demand vs spot pricing tiers. *Harder:* brutal customer concentration (3 customers =
80% of revenue), a 40-week lead time, and **residual value risk** — next-gen silicon announced
mid-level craters the resale value of your fleet. *Win:* reach contracted utilization >70% on a
36-month depreciation schedule before the next-gen announcement lands.
*CEO truth:* GPU hosting is a leveraged bet on depreciation curves wearing a hosting costume.

**L20 — "Liquid" (high-density retrofit)**
Your existing air-cooled hall can't take 60kW racks. *New:* a **capex-gated pivot** — you must
finance CDUs, rear-door heat exchangers, and floor loading before you can sell the product that
justifies them. *Win:* land one liquid-cooled tenant before the financing window closes.

**L21 — "Bulletproof" (anything-goes hosting)**
6x pricing, crypto-only payment (no chargebacks — a genuine margin advantage), zero refunds.
*New:* **ASN Reputation** as a persistent, cross-level resource that *contaminates your other
businesses*. Payment processors refuse you. *Harder:* upstream carriers null-route your prefix;
your RIR opens an investigation; a law-enforcement request arrives. *Win:* extract N dollars and exit
before the ASN score hits terminal. Explicitly framed as a **short-term cash-extraction level** with
a permanent cost — running it taints the meta-campaign's reputation stat.

**L22 — "The Audit" (HIPAA / PCI-DSS / SOC 2)**
*New:* the **compliance sales cycle** — deals take 6-18 months to close but are worth 10x and almost
never churn. The auditor is a *visitor type* that walks your facility and can fail you. Evidence
collection is an ongoing opex, not an event. *Harder:* you must maintain controls in the background
while still shipping. *Win:* pass with zero major findings AND close two deals that were blocked on
the attestation.

**L23 — "FedRAMP Purgatory"**
An 18-month, multi-million-dollar, zero-revenue sales cycle. *New:* **financing a moat** — you
literally cannot survive this level on cash flow; you must raise or co-fund with a sponsoring agency.
*Win:* reach authorization before the runway ends. Losing here is a *legitimate, interesting* loss.

**L24 — "Nanoseconds" (financial exchange colocation)**
You sell equalized cable lengths and proximity. *New:* the product is measured in microseconds and
sold as **fairness** — every tenant must get an identical-length cross-connect or you're liable.
*Harder:* a regulator audits your cable lengths. *Win:* fill the cabinet ring closest to the matching
engine at premium pricing.

**L25 — "Rollup" (acquire three competitors)**
*New:* **M&A mechanics** — LOI, diligence, earn-out, migration attrition (you will lose 20-40% of the
acquired book in migration, and the model should show you exactly how much each migration decision
costs). *Harder:* three different control panels, three billing systems, three sets of promises made
by the previous owner. *Win:* hit a synergy target without net-negative retention.
*CEO truth:* every big shared host is a graveyard of forty small hosts' customer books.

**L26 — "The Junk Drawer"**
You inherited the acquired company's hardware. *New:* **triage-as-capital-allocation** — each box has
a power draw, a failure probability, a customer attached, and a resale value. Killing it saves opex
but may churn a customer. *Win:* cut the acquired fleet's power bill 50% while churning <10%.

**L27 — "Two Regions"**
*New:* FX exposure, VAT/sales tax by jurisdiction, data residency as a *sellable feature*, follow-the-
sun support staffing. *Harder:* your support cost per ticket changes by region and so does quality.
*Win:* open a second region that is contribution-positive within the level.

**L28 — "Sovereign" (GDPR-resident / national cloud)**
*New:* **procurement** as a lane — public tenders, mandatory local ownership, bid bonds. Long, slow,
enormous. *Harder:* a competitor protests your bid award. *Win:* win the framework agreement.

**L29 — "Seedbox Row" (gray-area storage/file hosting)**
*New:* **DMCA volume as an opex line** — every takedown costs staff minutes; ignore them and you lose
your upstream. *Harder:* payment processors get nervous. *Win:* keep the takedown queue under SLA
while margin stays positive.

**L30 — "Consumption" (Kubernetes / PaaS / serverless)**
*New:* **usage-based billing** — revenue is no longer predictable; a customer can 10x or 0x overnight.
Free tier abuse (crypto miners) is a direct COGS leak. *Harder:* you can't forecast, so you can't
capacity-plan, so you over-provision and eat it. *Win:* get gross margin above 55% with <3% free-tier
abuse leakage.

**L31 — "Ground Station" (satellite downlink hosting)**
*New:* **scarce time-slot inventory** — you sell passes, not servers. Yield management (airline-style)
becomes the pricing game. *Win:* >80% pass utilization with premium-priced priority slots.

**L32 — "Closet at the Cell Site" (5G MEC / edge)**
*New:* **carrier revenue share** — you don't own the customer, the carrier does, and takes 40%.
*Harder:* channel conflict; the carrier can decide to compete with you. *Win:* build enough
direct-billed customers to survive losing the carrier.

**L33 — "Hashrate Hotel" (crypto mining hosting)**
*New:* **power arbitrage as the entire business**, boom-bust demand tied to an external price index
visible on your HUD. *Harder:* when the index crashes, tenants abandon gear and stop paying; you're
left with a warehouse of depreciating ASICs and a power contract. *Win:* sign a floor-price hosting
contract that survives a 70% index crash.

**L34 — "Exit"**
Final campaign level. *New:* **due diligence as an enemy wave** — a buyer's diligence team crawls your
books, your contracts, your unassignable leases, your undocumented handshake deals, your customer
concentration, your churn cohorts. Every shortcut from earlier levels surfaces here as a **valuation
haircut**. *Win condition = valuation multiple**, not cash.
*CEO truth:* the final boss of hosting is a spreadsheet held by a 27-year-old in a quarter-zip.

### 1.2 Scenario types (drop-in constraints, reusable on any map)

- **"Launch Spike"** — your biggest customer goes viral. Their success can bankrupt you if they're on
  a flat-rate plan. Sub-goal: renegotiate mid-spike without losing them.
- **"The Renewal Cliff"** — 400 intro-priced accounts all renew at 4x this month. Model the churn wave
  and decide who gets a retention discount (each discount is a permanent ARPU cut).
- **"Migrate Without Downtime"** — an acquired book must move. Every migration you rush loses
  customers; every one you delay costs double-running infrastructure.
- **"Breach Recovery"** — you're compromised. The level is disclosure timing, credits, insurance
  claims, and stopping a churn cascade — *not* incident response.
- **"Processor Freeze"** — your payment processor imposes a 20% rolling reserve and holds 90 days of
  settlements. Revenue is fine; cash is gone. Survive payroll.
- **"Price War"** — a VC-funded competitor prices below your COGS for 6 months. Do you match, segment,
  or differentiate?
- **"The Bad Quarter"** — cut 20% of opex without breaching a single SLA. Every cut is a card: layoffs,
  downgraded support tier, deferred hardware refresh, skipped maintenance — each with a delayed cost.
- **"Vendor Shock"** — your control panel / hypervisor vendor triples per-account licensing with 60
  days' notice. Absorb it, pass it through (churn), or migrate off (capex + risk).
- **"Lead Time"** — servers are 40 weeks out. Sell capacity you don't have, or lose the deal.
- **"Blacklisted"** — your mail /24 lands on a major blocklist. Every email customer notices within
  hours. Delisting requires proving remediation.
- **"Null Route"** — an upstream drops your prefix over an abuse complaint. You have a redundant
  transit provider — if you bought one two levels ago.
- **"Concentration Call"** — your largest customer (38% of MRR) asks for a 30% discount or they leave.
- **"Covenant"** — your lender requires EBITDA above X. Certain otherwise-correct investments will
  trip it. Growth vs. solvency, explicitly.
- **"Payroll Friday"** — a pure cash-timing puzzle. Profitable on paper, $40k short on Friday.
- **"Fire Sale"** — a competitor abruptly shuts down. 900 orphaned customers hit your signup lane in
  one hour, with no vetting and a lot of anger. Blessing or DDoS?
- **"Force Majeure"** — hurricane/grid event. Generator runtime, fuel contracts, and whether you
  prepaid a fuel-delivery priority agreement.
- **"Key Person"** — your only network engineer resigns. Tribal knowledge is a hidden resource you
  either documented or didn't.
- **"Data Hostage"** — a non-paying customer's data is suspended. The PR risk of deleting it vs. the
  cost of keeping it. One wrong move = a viral thread.
- **"Free Tier Invaded"** — abuse signups consume your free tier. Tighten verification (kills growth)
  or eat the cost.
- **"Black Friday"** — annual seasonality: 40% of the year's shared-hosting signups in 96 hours.
  Overspend on ads and you're broke; underspend and you miss the year.
- **"Compliance Sunset"** — an attestation expires in 45 days. Deals freeze until it's renewed.
- **"Insourcing"** — your biggest enterprise customer announces they're building their own. You have
  18 months to replace them.
- **"Reseller Revolt"** — your top reseller (25% of accounts) is being courted by a competitor.
- **"The Audit-Within-A-Level"** — a surprise SPLA/licensing audit finds you under-reporting seats.
- **"Landlord Squeeze"** — the datacenter you colocate in gets acquired and your renewal comes back
  at +60%. Move (brutal) or pay.

---

## Category 2 — Threats

**Framing principle:** every threat in this game should be quoted in **dollars and churn**, not in
"damage." A DDoS that costs you nothing is not a threat; a one-star review that costs you 30 signups
is. The HUD should show every incoming threat with an estimated **$ exposure** and **churn risk**,
the way a real operator triages.

### 2.1 The four damage currencies

Every threat deals damage in one or more of these, and the game should color-code them:

1. **Cash** — direct outflow (credits, fines, chargebacks, overtime, replacement hardware).
2. **Churn** — customers leave; this is *deferred* damage that compounds.
3. **Reputation** — reduces *future* visitor inflow (the top of your funnel narrows).
4. **Capacity** — you lose sellable inventory (a dead node, a tripped breaker, a blacklisted IP block).

The interesting design space is threats that are cheap in one and devastating in another. A 4-hour
outage might cost $600 in SLA credits (trivial) and 11% of your cohort (existential).

### 2.2 Revenue-and-billing threats

- **Chargeback Storm** — waves of disputed card payments. Hits game-server and bulletproof hosting
  hardest. Each chargeback costs the revenue + a $25 fee + a hit to your dispute ratio; cross 1%
  and your processor threatens you, cross 2% and they terminate you. *Counter:* fraud scoring at
  signup (reduces conversion), 3DS (adds friction), prepay/crypto (reduces addressable market),
  a manual review desk (staff cost).
- **Rolling Reserve** — processor holds 10-20% of settlements for 90-180 days. Doesn't touch revenue,
  guts cash. *Counter:* a second processor, invoicing/ACH for larger customers, cash buffer.
- **Merchant Account Termination** — your processor drops you (usually after an abuse or chargeback
  event). All revenue collection stops until you re-underwrite. *Counter:* redundant processors as a
  buildable — expensive, boring, and it saves the run.
- **Involuntary Churn / Failed Cards** — 5-9% of cards fail monthly (expiry, insufficient funds).
  It looks like churn but is recoverable. *Counter:* a **Dunning Engine** buildable — smart retries,
  card-updater service, pre-expiry emails. Recovers 40-70% of it. One of the highest-ROI buildings
  in the game and almost invisible if you don't look.
- **Bad Debt Creep** — customers using service and not paying. Grows quietly in the background.
  *Counter:* suspension policy slider (aggressive = less bad debt, more churn and PR risk).
- **DSO Drift (Days Sales Outstanding)** — enterprise customers pay net-60 and then net-90. Your
  revenue chart looks great; your bank account doesn't. *Counter:* early-pay discounts (2/10 net 30),
  factoring (expensive), deposits.
- **Refund Wave** — a 30-day money-back guarantee is a marketing weapon and a cash bomb. A bad month
  of quality shows up as refunds 30 days later, *after* you already spent the ad money.
- **Tax Assessment** — a jurisdiction decides your service is taxable retroactively. Lump-sum cash hit.
- **Currency Shock** — you bill in USD, pay power in EUR. Or vice versa.

### 2.3 Demand and reputation threats

- **The Review Bomb** — a detailed, credible, angry post on a community forum. Reduces your signup
  lane throughput by 20-60% for N days. Scales with how visible your brand is. *Counter:* a public
  status page, a transparent post-mortem (partially heals it), an executive response, or — a trap
  option — legal threats, which triple the damage.
- **The Streisand** — attempting to suppress criticism. If the player uses the "legal threat" or
  "DMCA the reviewer" options, the threat upgrades to a boss-tier reputation event.
- **Affiliate Poaching** — a competitor raises affiliate commission to 200% of first-year revenue.
  Your best acquisition channel turns hostile overnight.
- **Comparison Site Delisting** — a review aggregator drops you (or ranks you 9th). Silent, gradual
  demand decay; hard to attribute. *Counter:* content/SEO buildables, or paying for placement
  (which is a real and slightly dirty lever).
- **SEO Deindex** — a search algorithm update halves your organic traffic. You didn't do anything
  wrong; the cost is the same. Perfect "non-attack problem."
- **Brand Confusion Attack** — a competitor buys ads on your brand name. Cheap to counter (buy your
  own brand terms), expensive to ignore.
- **Founder's Tweet** — an optional self-inflicted event. Reputation swing in either direction.
- **The Viral Outage Postmortem** — ironically *positive* reputation if handled with transparency and
  detail; catastrophic if you say "a third party experienced an issue."
- **Status Page Denial** — your status page is hosted on your own infrastructure and goes down with
  it. Amplifies every outage's reputation damage. *Counter:* off-network status page (a cheap
  buildable that new players always skip).

### 2.4 Customer-as-threat (the ones operators actually dread)

- **The Noisy Neighbor** — one shared-hosting tenant consuming 60% of a box's I/O. Degrades 200 other
  customers invisibly until they churn. *Counter:* resource limits / cgroups (a buildable), or a
  "polite upsell" interaction that converts them to VPS — the profitable resolution.
- **The Support Vampire** — a $4/mo customer generating 11 tickets/month. Negative gross margin
  personified. *Counter:* KB deflection, paid support tiers, or the genuinely correct business move:
  **fire the customer** (a mechanic the game should reward).
- **The Compliance Tourist** — wants HIPAA guarantees on a $20 plan. Consumes sales time, never buys.
- **The Contract Lawyer** — an enterprise prospect whose legal redlines cost you 30 hours of a
  lawyer's time before signing. Real cost-to-acquire that doesn't look like marketing spend.
- **The Chargeback Artist** — buys, uses, disputes. Repeat. *Counter:* fraud scoring, blacklists.
- **The Crypto Miner on a Free Trial** — pure COGS theft. Attacks consumption-billing and free-tier
  models specifically.
- **The Resold Reseller** — your reseller resells to resellers; you have no idea who your end users
  are, and one of them is a phisher. Abuse liability with no visibility.
- **The Departing Whale** — a 90-day notice from a customer who is 30% of revenue. The damage is not
  instant; it's a countdown timer that reshapes every decision for the rest of the level.
- **The Insourcer** — an enterprise customer building their own. Unavoidable; you can only slow it
  with expansion upsells.
- **The Ghost Tenant (colo)** — a colo tenant stops paying but their gear is still racked, drawing
  your power, and legally you can't just unplug it in some jurisdictions. Slow bleed + a lien process.
- **The Overcommitted Salesperson** — your own rep sold a feature you don't have, at a price below
  cost, with a 100% uptime SLA. An internal threat spawner.

### 2.5 Abuse-desk threats (their own category because they cost money in three directions)

- **DMCA Flood** — volume-based staff cost. Ignoring them escalates to your upstream.
- **Spamhaus SBL Listing** — your IP range is blocked. Instant, total email-product failure.
- **Phishing Site on Your Network** — bank abuse teams escalate fast. Browsers flag your ASN.
  *Counter:* proactive content scanning at signup + fast takedown SLA (staff cost).
- **CSAM Report** — a mandatory, non-negotiable, immediate-action event. In-game this should be
  handled seriously and abstractly: it is the one threat with no "ignore" option and where cost
  minimization is not an available strategy. Failure = level termination, legal, done.
- **Upstream Abuse Escalation Ladder** — a 3-stage threat: warning → filtered → null-routed. The
  player can see the ladder, which makes ignoring abuse a visible gamble.
- **RIR Investigation** — your IP allocations get audited; hijacked or fraudulently obtained space
  gets reclaimed. Instant loss of sellable inventory. Specific to bulletproof / gray-market levels.
- **Sanctions Screening Failure** — you signed up a sanctioned entity. Fines, and your bank gets
  interested in you.
- **Law Enforcement Seizure** — a rack is taken, including other customers' data on the same host.
  Collateral churn from customers who did nothing wrong.
- **The Abuse/Revenue Dial** — not a threat but the meta-mechanic behind all of them: a literal slider
  from "vet everything" (low growth, low abuse) to "take all money" (high growth, escalating abuse
  ladder). Each hosting type has a different optimal setting, and the game should let players
  discover that bulletproof's setting poisons every other line of business they own.

### 2.6 Vendor, supply, and partner threats

- **Licensing Repricing** — cPanel-style per-account price explosion, or a hypervisor vendor moving
  to core-based subscription pricing at 4x. Instantly destroys the margin on your cheapest plans.
  *Counter:* open-source migration (capex + retraining + feature loss), or repricing customers
  (churn), or eating it (margin).
- **Vendor Financing Recall** — your hardware vendor tightens credit terms; you now need cash up front.
- **Lead-Time Inflation** — 8 weeks becomes 40 weeks. Stops growth dead. *Counter:* forward buying
  (ties up cash), secondary-market gear (higher failure rate), or leasing.
- **Component Recall** — a batch of drives/PSUs/DIMMs in your fleet is defective. Warranty covers the
  part, never the labor or the outage.
- **Upstream Bankruptcy** — your transit provider, colo landlord, or control-panel vendor goes under.
- **The Acquisition of Your Landlord** — new owner, new rates, new rules.
- **Channel Conflict** — your infrastructure partner launches a competing retail product using your
  own platform.
- **Referral Partner Defection** — the web agency that sent you 40% of your customers switches to a
  competitor for a better rev-share.
- **The Reseller Who Was Actually A Competitor** — they built their book on your platform and now
  migrate all of it away at once.

### 2.7 Classic technical threats — priced the way a CEO sees them

- **Volumetric DDoS** — cost is *not* the attack, it's (a) your transit overage bill on the scrubbed
  traffic, (b) collateral damage to co-located customers, (c) the upstream null-routing your entire
  prefix to protect themselves. *Counter:* scrubbing contracts (fixed monthly cost, sellable as a
  premium feature — turn the threat into a product).
- **Ransom DDoS (RDoS)** — a demand email. Paying is cheaper and strictly worse long-term.
- **Competitor-Sponsored Attack** — game-server hosting specifically; a rival host booters your
  flagship server during a streamer's session. Reputation + churn, not cash.
- **Data Breach** — cost = notification costs + credit monitoring + regulatory fine + insurance
  deductible + a 3-6 month churn tail + every enterprise deal in your pipeline freezing.
- **Ransomware on Your Own Management Plane** — the existential one. Backups you never tested = game
  over. This is where the boring "test your restores" buildable pays off.
- **Bad Deploy / Control Panel Upgrade** — self-inflicted. Highest frequency real-world outage cause.
- **Hardware Failure** — RAID card, PSU, a bad DIMM. Cost is the truck roll + the SLA credit.
- **Silent Data Corruption** — invisible for many turns; discovered on restore. Backup-hosting-specific.
- **Power Event** — utility blip, ATS failure, generator that didn't start because nobody load-tested
  it, fuel contract you didn't prepay.
- **Cooling Failure** — a 20-minute CRAC outage in a high-density hall is a hardware-destroying event,
  not an uptime event. GPU levels especially.
- **Fiber Cut / Carrier Outage** — you did nothing wrong; you pay anyway. *Counter:* diverse-path
  transit (expensive, invisible until it saves you).
- **BGP Hijack / Route Leak** — your traffic goes somewhere else. Counter is RPKI (cheap, boring).
- **Certificate Expiry** — a $0 problem that causes a total outage. Beautifully stupid, deeply real.
- **Domain Expiry** — same, funnier, worse.
- **The Expired Support Contract** — the part is available; your 4-hour support contract lapsed, so
  it's 5 business days.

### 2.8 Attacker / antagonist archetypes (business-flavored)

- **The Script Kiddie** — high frequency, low damage, high support-ticket noise.
- **The Booter Customer** — a *customer* who is also an attacker, paying you while attacking others.
  Profitable and radioactive.
- **The Competitor** — attacks your reputation, your affiliates, your staff (poaching), and your
  pricing. The only enemy who targets your *funnel* rather than your servers.
- **The Roll-Up Acquirer** — a well-funded consolidator who buys your suppliers, your partners, and
  eventually offers to buy you at a lowball price after making the market hard.
- **The Activist Blogger** — publishes your abuse-desk failures. Damage scales with how correct they are.
- **The Regulator** — arrives on a schedule, not a wave. Cannot be defeated, only prepared for.
- **The Auditor** — a slow-moving "visitor" that walks your facility and converts findings into
  blocked revenue.
- **The Plaintiff's Attorney** — post-breach class action. Long timer, large cash.
- **The Nation-State** — rare, unstoppable, targets your *customers* not you; your role is forensics
  and disclosure. Mostly a regulated/sovereign-level event.
- **The Insider** — a departing admin with credentials. Counter is offboarding process (boring, cheap).
- **The Bank** — your lender is an antagonist in exactly one way: covenants.
- **Mother Nature** — hurricanes, heat domes, floods, wildfire smoke clogging filters (real!).
- **The Market** — the pure macro enemy: a GPU price crash, a crypto crash, a recession that raises
  churn across every SMB customer simultaneously.

### 2.9 Threat-to-hosting-type matrix (which nightmare belongs to which business)

| Hosting type | Signature threat | Signature non-attack problem | What it actually costs |
|---|---|---|---|
| Shared / cPanel | Mass WordPress compromise | Noisy neighbor | Churn + support cost |
| Managed WP | Customer's plugin breaks | Scope creep support | Gross margin erosion |
| VPS / LowEnd | Public benchmark shaming | Oversell exposure | Demand-lane closure |
| Dedicated | Hardware failure + truck roll | Utilization below breakeven | Capex stranded |
| Colo | Tenant's own gear catches fire | Stranded power | Liability + capacity |
| Wholesale | Pre-leasing shortfall | Construction overrun | Financing covenant |
| Game servers | Booter attacks + chargebacks | Hype-cycle collapse | Cash burned at the peak |
| Email | Blocklist | Deliverability decay | Total product failure |
| DNS | Amplification abuse | Free-tier cost | COGS leak |
| CDN | 95th-percentile blowout | Peering ratio disputes | Negative-margin customers |
| Backup/DR | Silent corruption | Restore surge cost | Trust, then everything |
| Tape/archive | Lost media, courier failure | Media lifecycle | SLA breach, no tech fix |
| GPU/AI | Customer concentration | Residual value cliff | Depreciation + debt |
| Crypto hosting | Index crash → abandonment | Power contract commitment | Stranded power contract |
| Container/PaaS | Free-tier mining | Unforecastable usage | Over-provisioning |
| Bulletproof | Upstream null-route, RIR audit | Payment access | ASN reputation (permanent) |
| Regulated | Failed audit | Evidence-collection opex | Frozen pipeline |
| Dial-up ISP | Busy signal | Flat pricing vs metered cost | Structural loss |
| Satellite/edge | Missed pass window | Slot inventory waste | Yield collapse |

---

## Category 3 — Visitors, Traffic, and Clients

**Framing principle:** in most tower-defense games the "good units" are an abstraction. Here they
should be a **funnel with named stages**, because that's how an operator actually thinks. A visitor
is not one entity — it is an entity that *transforms* as it walks the path:

**Impression → Click → Lead → Trial/Order → Provisioned → Paying → Renewed → Expanded → Advocate**

…and it can **bounce, fail fraud check, fail to provision, churn, or dispute** at each step. Each of
those failure exits should be a visible, animated, countable loss. The player's real job is widening
the pipe at whichever stage is leaking.

### 3.1 Two distinct "good unit" classes

- **Traffic (cheap, continuous, fragile).** Page loads, player joins, API calls, backup jobs,
  inference requests, SIP calls, DNS queries. These do not pay you directly — they **keep your
  existing customers happy**. Failing them raises churn. Think of traffic as *maintenance of an
  existing revenue stream* rather than revenue itself. Visually: fast, tiny, numerous.
- **Clients (slow, valuable, deliberate).** A prospect walking the funnel toward a signed contract.
  These *are* revenue. Visually: large, slow, individually rendered, with a nameplate showing
  expected MRR, contract term, and support burden.

This split is the whole CEO insight: **serving traffic well is defense; landing clients is offense.**
A level where you serve traffic perfectly and land no clients is a slow death by zero growth.

### 3.2 Client archetypes (with MRR, churn, support burden, and expansion potential)

Each is a card with four stats: **MRR / Term / Support Load / Expansion Potential**, plus a hidden
**Trouble** stat the player can only learn through qualification.

1. **The Hobbyist** — $4/mo, monthly, low support, no expansion. Massive volume. Churns on price.
2. **The Small Business Site** — $15/mo, annual prepay likely, medium support ("can you fix my email"),
   low expansion, *very* low churn if you never break anything. The quiet backbone of shared hosting.
3. **The Agency** — brings 40 client sites at once. High value, high leverage, high concentration
   risk — losing one agency = losing 40 accounts. Expansion potential is huge. Wants a white-label
   panel and a dedicated account manager.
4. **The Developer** — $20 VPS, near-zero support, benchmarks everything, posts publicly, extremely
   price-sensitive but also the source of your word-of-mouth. Low direct value, high referral value.
   The game should model that: some customers' real value is the visitors they drag in behind them.
5. **The Startup** — moderate MRR growing 15%/month or dying entirely. Expansion potential is the
   highest in the game and so is the churn risk (they get acquired, pivot, or run out of money).
6. **The Enterprise Workload** — $8k/mo, 3-year term, 60-day procurement, security questionnaire,
   requires SOC 2, pays net-60. Almost never churns. Blocks on compliance unlocks.
7. **The Reseller** — buys wholesale, sells retail, brings you volume without support burden but
   also without visibility. If they leave, they take everything.
8. **The Whale** — >20% of your MRR. Wonderful and terrifying. Triggers the concentration-risk meter.
9. **The Government Entity** — enormous, slow, procurement-gated, pays late but never disputes.
10. **The Streamer / Influencer (game hosting)** — pays little or nothing, generates enormous signup
    flow behind them. Model as a **customer whose value is a demand multiplier**, and who will leave
    instantly for a competitor's better sponsorship.
11. **The Clan / Guild (game hosting)** — 40 people sharing one $12 server, one payer, seasonal.
12. **The Modded-Server Owner** — high resource use, high support, high loyalty, evangelizes hard.
13. **The Crypto Miner** — pays well, uses 100% of everything, will abandon the moment the index dips.
14. **The AI Startup (GPU)** — needs 64 GPUs for 6 weeks, then either 1,000 or zero.
15. **The Research Lab (HPC/GPU)** — grant-funded: buys in a burst at fiscal year end, disappears,
    returns exactly one year later. Seasonality with a calendar you can plan around.
16. **The Colo Tenant (another hosting company)** — pays for power, expands predictably, and competes
    with you in the retail market. Weirdly intimate rivalry.
17. **The Financial Firm (exchange colo)** — pays absurdly for microseconds, demands fairness
    guarantees, audits you.
18. **The Healthcare Practice (HIPAA)** — small MRR, enormous compliance requirements, zero churn.
19. **The Adult Site** — high bandwidth, high revenue, payment processor complications, some
    upstreams object. A real business decision with real tradeoffs.
20. **The Gray Tenant (bulletproof)** — 6x MRR, crypto payment, generates abuse tickets from hour one.
21. **The Backup Customer** — buys TBs, grows monotonically (data only ever increases), never leaves
    because egress is the moat. The best customer in the game and the most boring.
22. **The Broadcaster (video)** — enormous burst, 95th-percentile hostile, event-driven.
23. **The SaaS Company** — your customer whose customers are the traffic. Their growth is your growth;
    their outage is your fault regardless.
24. **The Nonprofit** — wants a discount, gives you a logo and goodwill (real reputation value).
25. **The Migration-In Refugee** — fleeing a competitor's outage. High intent, low trust, will flee
    you just as fast. Arrives in bursts after a competitor's incident.
26. **The Tire Kicker** — never converts, consumes sales time. Should be *visible* so the player can
    learn qualification.
27. **The Sanctioned Entity / Fraud Signup** — must be rejected. Rejecting costs conversion rate;
    accepting costs the run.
28. **The Ex-Customer** — a win-back target. Cheaper to re-acquire than a cold lead, if you handle
    the reason they left.

### 3.3 What "a visitor" looks like per hosting type

- **Shared web hosting** — a page-load pellet; hundreds per second; individually worthless, collectively
  the thing that keeps the SMB owner from churning.
- **Managed WordPress** — a page load *plus* a plugin-update event that can break the site.
- **VPS** — barely any visitors at all; the customer *is* the unit, and the traffic is theirs.
- **Game servers** — a player avatar jogging up a lane to join a server; visibly gets frustrated and
  turns around if the tick-rate/latency indicator is bad. Players join in *parties* — lose one, lose six.
- **Voice/SIP** — a call unit that must complete end-to-end; a dropped call is instantly noticed and
  cannot be retried invisibly the way an HTTP request can.
- **Email** — a message unit that must be *accepted by a third party you don't control*. The
  destination is the boss.
- **DNS** — near-invisible, constant, enormous volume, and the customer only notices when it fails.
- **CDN** — traffic that arrives at the nearest POP; the visual is *which POP catches it*.
- **Object storage** — PUT and GET units with different costs; GETs cost you egress money.
- **Backup** — a nightly job unit: large, slow, scheduled, and it *must finish inside a window*. A
  backup that runs past the window is a partial failure that compounds.
- **Restore** — a rare, urgent, emotionally loaded unit worth 10x the reputation of a backup job.
- **GPU/AI** — an inference request (fast, small, latency-sensitive) or a training job (huge, long,
  must not be preempted). Two totally different unit types in one business.
- **Colo** — the "visitor" is a **tour**: a prospective tenant physically walking your facility with a
  broker, evaluating your cleanliness, your labeling, your cable management, your security desk.
  A dirty, badly-labeled facility literally loses you deals. This is a magnificent mechanic:
  **your cosmetic upgrades become revenue drivers on colo levels.**
- **Wholesale/hyperscale** — the visitor is a site-selection team evaluating power availability,
  fiber routes, tax abatement, and water rights. Arrives once a year, worth the whole level.
- **Dial-up ISP** — a caller unit that either gets a modem or a busy signal.
- **Satellite ground station** — a *pass*: a timed window that either gets captured or is lost forever.

### 3.4 Acquisition channels (the "lanes" visitors arrive on)

Each channel is a **buildable lane** with a cost model, a latency, a quality profile, and a decay rate.
This is the heart of marketing realism: channels differ in **CAC, volume, lead quality, and how fast
they turn off when you stop paying.**

1. **Organic Search / Content** — slow to build (10-20 turns of investment before any flow), cheap per
   visitor, decays slowly, vulnerable to algorithm updates. Highest long-run ROI, worst short-run.
2. **Paid Search (PPC)** — instant flow, expensive, stops the second you stop paying, and your CAC
   rises as competitors bid. Model a visible **bid price that other AI companies push up.**
3. **Affiliate Program** — you pay a bounty per signup (often 100-200% of first-year revenue).
   Volume scales fast, quality is poor, refund/chargeback rate is high. Affiliates can be poached.
4. **Deal Communities / Forums (LowEndTalk-style)** — free, enormous volume, brutally price-sensitive
   customers, reputation-gated. You can only use this lane if your reputation stat is above a threshold.
5. **Review Aggregators** — placement costs money; ranking depends on reputation; delisting is a threat.
6. **Referral / Word of Mouth** — free, high-quality, *slow*, scales with NPS. Should be the reward
   for good operations: every level you run well widens this lane for the next level.
7. **Channel / Reseller Program** — partners sell for you at a 30-40% discount; you get volume with
   no support cost but no customer relationship.
8. **Marketplace Listings** — appear inside a bigger platform's catalog; they take 20%, you get reach.
9. **Outbound Sales (SDR + AE)** — expensive staff, long cycle, lands enterprise and colo deals that
   no other lane can reach. Required for L16+ style levels.
10. **Brokers (colo/wholesale)** — you pay a broker 3-6% of first-year contract value; they bring you
    tenants you'd never meet. Not optional in real colo.
11. **Conferences / Trade Shows** — huge lump cost, lumpy return, essential for enterprise and colo.
    A fun *event-shaped* purchase: spend $40k, get 12 leads, 2 close in 9 months.
12. **Sponsorships (streamers, podcasts, open-source projects)** — dominant channel for game hosting
    and developer-facing products.
13. **Community / Open Source Goodwill** — sponsor a project, get developer mindshare. Slow, sticky.
14. **Migration Incentives** — "we'll move you free and pay your remaining term." Direct competitor
    raiding; expensive, effective, invites retaliation.
15. **Free Tier** — a lane that costs COGS instead of marketing budget. Converts at 1-3%.
16. **Black Friday / Seasonal Promo** — a temporary 5x lane multiplier at destroyed margins, with a
    renewal-cliff time bomb attached 12 months later.
17. **The Competitor's Outage** — a *free* lane that opens spontaneously when a rival has a bad day.
    The player can invest in readiness (extra capacity, a landing page, a support surge plan) to
    catch it. Deliciously real.
18. **PR / Post-Mortem Publishing** — writing a genuinely good incident post-mortem opens a small,
    high-quality lane. Transparency as marketing.
19. **Compliance Attestation** — passing SOC 2 doesn't generate leads; it *unblocks* leads that were
    already queued. Visually: a gate opening with a backlog behind it.
20. **Acquisition** — you buy the lane. Instant customers, integration pain, attrition tax.

### 3.5 Bounce and churn causes (the leak list)

**Pre-sale bounces:**
- Page/panel slow → prospect leaves before signup.
- Price shock at checkout (renewal price disclosed late = higher signup, higher refund rate later).
- Payment declined (a silent, huge loss; often 5-15% of attempted orders).
- Fraud check false positive (you rejected a real customer).
- Provisioning delay — a customer who waits 20 minutes for a VPS cancels. **Automated provisioning is
  a conversion-rate buildable, not an ops buildable.**
- Missing feature/compliance gate (no SOC2, no region, no OS image).
- Sales response latency — leads decay fast; a lead contacted in 5 minutes converts many times better
  than one contacted in 24 hours. Model a literal **decay timer on every lead**.

**Post-sale churn:**
- **Outage churn** — not immediate; a cumulative "trust meter" per customer that breaks at a threshold.
  Three small outages hurt more than one big honest one.
- **Performance churn** — slow but not down. The silent killer. Nobody files a ticket, they just leave.
- **Renewal-price churn** — the term-shock cliff.
- **Support-experience churn** — first response time and resolution quality; the ticket that wasn't
  answered for 3 days churns the account 2 months later.
- **Life-event churn** — the customer's business closed. Unavoidable baseline churn (~1%/mo for SMB).
- **Acquisition churn** — your customer got acquired and their new parent has a different vendor.
- **Involuntary churn** — failed card. Recoverable with dunning.
- **Competitive churn** — a rival offered free migration. Counter with a retention offer.
- **Contract-end churn (colo)** — invisible for 35 months, then a single decision point.
- **Migration-attrition churn** — you moved them and something broke.
- **Trust churn after a breach** — a 3-6 month tail, worst in months 2-4 when the news matures.

### 3.6 Active player moves to win and keep customers

- **Retention Offer** — a targeted discount to a churning customer. Permanently lowers ARPU; saves
  the account. Should be usable *only if you detect the churn signal in time* (see Health Scoring).
- **Health Scoring / Churn Radar** — a buildable that turns invisible churn risk into a visible aura
  around at-risk customers. Massive quality-of-life and deeply real.
- **QBR (Quarterly Business Review)** — spend account-manager time on a big customer; reduces churn
  and surfaces expansion opportunities. A literal "visit your whale" action.
- **Proactive Notification** — telling customers about an incident *before* they notice reduces both
  churn and ticket volume. Costs nothing but the status-page buildable.
- **Free Migration Service** — the single highest-leverage acquisition offer in hosting. Costs staff
  hours, converts customers who otherwise never move.
- **Onboarding Wizard / Time-to-First-Value** — reduce the time from signup to "my thing is live."
  Directly reduces 30-day refunds.
- **Annual Prepay Discount** — 2 months free for annual. Reduces churn, improves cash immediately,
  lowers total revenue. A genuine three-way tradeoff.
- **Multi-Year Term with Escalator** — colo standard: 5 years, 3%/yr escalator. Locks revenue, but
  you're stuck if the market reprices upward.
- **Upsell Ladder** — backups → SSL → dedicated IP → managed support → DDoS protection → a bigger
  plan. Each upsell is a small revenue bump with near-zero CAC. **Expansion revenue is the cheapest
  revenue in hosting** and the game should teach that.
- **Cross-sell Between Lines of Business** — the shared-hosting customer who outgrows the box becomes
  your VPS customer becomes your dedicated customer becomes your colo tenant. **The Ladder of
  Graduation** should be an explicit, celebrated mechanic: keeping a customer across 4 product tiers
  over 10 years is the highest-scoring outcome in the game.
- **Win-Back Campaign** — target ex-customers; cheaper CAC, requires having fixed the original problem.
- **Fire the Customer** — proactively terminate a negative-margin or abuse-generating account.
  Should give a small immediate hit and a long-term gain.
- **Reference Program** — convert happy customers into logos and case studies, which raise enterprise
  conversion rates.
- **NPS Survey** — costs a little, reveals hidden churn risk, and occasionally makes it worse by
  reminding people they're unhappy (a funny, true wrinkle).

---

## Category 4 — Buildables: Services and Infrastructure

**Framing principle:** in this game, **the org chart is a tech tree and every department is a tower.**
A real hosting company's defenses are at least half non-technical: the billing engine, the abuse desk,
the account manager, the contract. Each buildable below lists **what it does / cost shape / what it
connects to / what new risk it opens.** The "new risk" column is mandatory — per the brief, every
build should widen your attack surface, and business buildings absolutely do.

### 4.1 Revenue-side buildings (the ones most hosting games forget)

1. **Order Form / Storefront** — the entry point of the client lane. *Cost:* low opex. *Connects to:*
   every acquisition lane, the Provisioning Engine, the Payment Gateway. *Risk:* it's public; carding
   bots test stolen cards against it, and every fraudulent order costs you a gateway fee.
   *Upgrades:* one-page checkout (+conversion), price-transparency toggle (−signups, −refunds),
   currency localization (+international conversion).
2. **Payment Gateway** — converts orders to cash. *Cost:* 2.9% + $0.30 of every dollar, forever — the
   game should show this as a permanently visible haircut on revenue. *Risk:* chargeback ratio,
   rolling reserve, termination.
3. **Second Payment Gateway (Redundant Processor)** — pure insurance; the most boring, most run-saving
   building in the game. *Risk:* none, just cost. Teaches the player that some towers do nothing 95%
   of the time and save the campaign the other 5%.
4. **Alternative Payment Rails** — ACH/wire (cheap, slow, no chargebacks, enterprise-friendly),
   PayPal (high dispute risk, broad reach), crypto (no chargebacks, no processor risk, banking
   suspicion, price volatility), invoicing with terms (enterprise-only, creates DSO).
5. **Billing Engine (WHMCS-alike)** — generates invoices, provisions accounts, suspends non-payers.
   *Risk:* it becomes a single point of failure for *cash itself* — if billing is down you're not
   losing uptime, you're losing money silently. Also a juicy attack target holding every customer's
   billing data.
6. **Dunning Engine** — retries failed cards, updates expired ones, sends pre-expiry notices.
   *Effect:* recovers 40-70% of involuntary churn. *Risk:* over-aggressive dunning emails annoy
   customers into voluntary churn.
7. **Metering / Rating Engine** — measures usage for consumption billing (bandwidth 95th percentile,
   GB-months of storage, GPU-hours, inference tokens). *Risk:* a metering bug either undercharges
   (silent revenue leak) or overcharges (catastrophic trust event + refunds).
8. **Quote / CPQ Desk** — lets you produce custom enterprise quotes. *Unlocks* deals above a size
   threshold. *Risk:* your reps can quote below cost; add an approval gate as an upgrade.
9. **Contract & Legal Desk** — MSAs, SLAs, DPAs, BAAs, redlines. *Effect:* unlocks enterprise,
   regulated, and colo lanes. *Cost:* expensive lawyer retainer. *Risk:* signing bad terms —
   unlimited liability, 100% uptime SLAs, unassignable contracts that torch your valuation at Exit.
10. **Sales Floor (SDR / AE / Sales Engineer)** — converts leads to clients. Staffed; each rep has a
    ramp time (3-6 months before productive — model it!), a quota, and a churn rate of their own.
    *Risk:* overselling, commission gaming, quota-driven discounting at quarter end.
11. **Account Management Desk** — assigned to top accounts; reduces churn, drives expansion.
    *Risk:* your AM leaves and takes relationships with them.
12. **Marketing Department** — allocates budget across lanes, runs promos. *Risk:* CAC inflation; also
    it can generate demand you cannot fulfill, which is worse than no demand.
13. **Affiliate Portal** — a lane-multiplier building. *Risk:* fraud (self-referrals, cookie
    stuffing), poor customer quality, and affiliates who can be bought away.
14. **Reseller / White-Label Portal** — sells your capacity through partners. *Risk:* you lose end-user
    visibility, inherit their abuse, and can be disintermediated.
15. **Partner / Channel Program** — MSPs and agencies bundle you. *Risk:* channel conflict when your
    direct sales team competes with your partners for the same logo.
16. **Status Page (off-network)** — transparency reduces ticket volume ~40% during incidents and
    softens reputation damage. *Risk:* almost none — which is the lesson.
17. **Knowledge Base / Docs** — deflects tickets, improves organic search, reduces support cost per
    customer. *Risk:* stale docs create wrong-expectation tickets.
18. **Customer Portal / Control Panel** — self-service reduces support load massively. *Risk:* it's an
    authenticated public app with control over infrastructure — the single juiciest target you own.
19. **API / Terraform Provider** — attracts developer customers, enables automation-heavy usage.
    *Risk:* a customer's runaway script provisions 400 servers at 3am (and either you eat the cost or
    you bill them and they dispute it).
20. **Marketplace / Add-on Catalog** — sell third-party add-ons for a rev-share. Pure margin.
    *Risk:* a vendor in your catalog gets breached and it's your brand on the invoice.

### 4.2 Cost-and-risk-side buildings (the boring ones that decide whether you survive)

21. **Support Desk (Tier 1)** — handles volume. *Cost:* the biggest opex line in shared hosting.
    Model **cost per ticket** and **first response time** as explicit dials. *Risk:* understaffing
    creates a churn tail 60 days later — delayed damage the player has to learn to anticipate.
22. **Support Tier 2 / Escalation** — fewer, more expensive, resolves real problems.
23. **24/7 Coverage** — a step-function cost increase (you need ~5 FTEs to cover one seat round the
    clock). *Unlocks:* enterprise and game-hosting customers who won't buy without it.
24. **Offshore / Follow-the-Sun Support Pod** — cheaper per ticket, quality penalty, timezone benefit.
    *Risk:* CSAT drop → reputation drift that the player may not connect to the decision.
25. **NOC (Network Operations Center)** — detects problems before customers do. Converts "churn
    events" into "credits you never had to give." *Risk:* alert fatigue — an upgrade path about
    tuning, not adding, monitors.
26. **Abuse Desk** — processes DMCA, phishing, spam reports. *Effect:* keeps your upstream and your
    blocklist status healthy. *Risk:* none; the risk is *not* building it. On bulletproof levels it's
    an optional building with a direct revenue tradeoff, which is the point.
27. **Fraud / Risk Screening** — scores signups. *Tradeoff dial:* strictness vs conversion rate.
28. **Compliance Office** — evidence collection, policy maintenance, audit liaison. *Unlocks:*
    regulated lanes. *Cost:* continuous, unglamorous. *Risk:* it slows down every other department
    (a real and worth-modeling drag on your build speed).
29. **Internal Audit / Change Management** — reduces self-inflicted outages (the #1 real cause).
    *Cost:* slows deployment velocity. A beautiful explicit tradeoff between speed and stability.
30. **Finance / Controller** — unlocks accurate forecasting, the cash-flow projection HUD, and access
    to financing (lenders require clean books). *Risk:* none; it's an information building. But
    without it the player plays blind, which is a great early-game teaching device.
31. **Collections Desk** — chases bad debt. *Risk:* aggressive collections generate reputation events.
32. **Procurement** — negotiates vendor pricing, manages lead times, gets volume discounts.
33. **HR / Recruiting** — hiring has a lead time and a failure rate. *Risk:* a bad hire costs 2x salary.
34. **Documentation / Runbooks** — mitigates the Key Person threat. Invisible until it isn't.
35. **Insurance Broker** — cyber liability, E&O, business interruption, property. *Effect:* converts
    catastrophic cash events into deductibles + premium. *Risk:* claims raise premiums; exclusions
    surprise you (many policies exclude "acts of war," which matters after a nation-state event).
36. **Legal Retainer** — handles subpoenas, law enforcement requests, disputes.
37. **PR / Comms** — halves reputation damage from incidents *if built before the incident*.
38. **Security Team / SOC** — reduces breach probability. Expensive; the ROI is never visible in a
    good quarter, which is exactly why players will skip it and learn.

### 4.3 Infrastructure, priced as a CEO sees it

39. **Shared Web Node** — cheap per customer, enormous margin at high density, one abuse event
    degrades hundreds. *The oversell ratio is its upgrade slider.*
40. **VPS Host Node** — memory is the binding constraint; overcommit ratio is your margin dial and
    your reputation risk.
41. **Dedicated Server** — bought or leased, depreciated over 36-48 months. **Utilization is the whole
    game**: an empty dedicated server is a pure loss every single month.
42. **Bare-Metal-as-a-Service Provisioning** — automates dedicated turn-up from days to minutes.
    Converts a low-conversion product into a high-conversion one.
43. **Database Tier** — enables higher-value products, opens SQL injection and data-loss liability,
    and raises your regulatory exposure (now you hold *their* customer data).
44. **Cache Tier** — improves visitor survival rate cheaply; risk is stale-content support tickets and
    a cache stampede when it drops.
45. **Load Balancer** — increases capacity and uptime; becomes a single point of failure and a
    DDoS magnet (it's the public IP).
46. **Object Storage Cluster** — sell by GB-month, pay for egress. **Egress pricing is the moat** and
    a customer-hostility dial: high egress fees = low churn + bad reputation.
47. **Backup System** — a cost center that is also a sellable product. The player should get the
    "aha": turning your own cost center into a product line is the classic hosting margin move.
48. **Restore Testing** — a buildable that costs money and produces *nothing* except that your
    backups actually work. Should be skippable, and should end runs.
49. **CDN POP** — capex per site, reduces transit cost, improves visitor completion rate, opens local
    legal jurisdiction exposure (each POP is a new country's rules).
50. **IX Port / Peering** — permanently reduces bandwidth COGS. Requires an ASN, a router, and a
    port fee. *Risk:* peering disputes; a big eyeball network de-peers you.
51. **Transit Circuits (two providers, diverse paths)** — a commit contract with 95th-percentile
    billing. *Risk:* you owe the commit whether you use it or not — a fixed cost that punishes
    over-forecasting.
52. **IPv4 Block** — an appreciating *asset* you can lease out for revenue. Scarcity is real; buying
    early is a legitimate investment strategy. *Risk:* reputation contamination — IPs that were used
    for spam are worth less and get blocked.
53. **ASN + BGP** — makes you a real network; unlocks peering, multi-homing, and anycast. *Risk:*
    route leaks, hijacks, and being personally responsible for your prefix's reputation.
54. **Anycast Fabric** — unlocks DNS/CDN product lines.
55. **DDoS Scrubbing (contracted or on-prem)** — a cost that becomes a **premium product tier**.
    Sell "protected hosting" at a 40% markup; the defense pays for itself.
56. **Hypervisor / Orchestration Platform** — enables VPS/cloud products. *Risk:* vendor licensing
    repricing (a scripted disaster event), and a single management-plane compromise = total loss.
57. **Control Panel License** — per-account cost that scales with customers; the margin assassin.
58. **Provisioning Automation** — turns a 2-day manual setup into 90 seconds. Raises conversion,
    lowers labor, and lets one bug provision 500 free accounts.
59. **Config Management / IaC** — reduces bad-deploy outages, raises the blast radius of a *wrong*
    config (now you break everything at once, uniformly).
60. **Monitoring & Observability Stack** — cost scales with data volume and becomes shockingly
    expensive. Realistic upgrade: "sampling" (cheaper, blind spots).
61. **Log Retention / SIEM** — required by compliance, expensive, occasionally saves you in an
    investigation.
62. **Bastion / Privileged Access Management** — reduces insider and credential threats.
63. **CI/CD for Your Own Platform** — faster feature shipping (marketing ammunition) at higher
    self-inflicted-outage risk unless paired with Change Management.

### 4.4 Facilities (the landlord's product line)

64. **Rack / Cabinet** — inventory unit. Sellable whole (colo) or by the U.
65. **Cage / Private Suite** — higher-value colo product with a security premium.
66. **Power Distribution (PDUs, A/B feeds)** — dual-feed is a sellable upgrade; single-feed tenants
    churn after their first maintenance window.
67. **UPS** — bridges the gap to generator. Batteries degrade invisibly and must be tested.
68. **Generator + Fuel Contract** — the fuel *delivery priority agreement* is the real product, and
    it's the thing nobody buys until the hurricane.
69. **Cooling (CRAC/CRAH → in-row → rear-door → liquid/immersion)** — a tech ladder gated by capex,
    each rung unlocking a higher density (= higher revenue per square foot) product tier.
70. **Fire Suppression (pre-action / clean agent)** — required for insurance and for enterprise
    tenants; an accidental discharge is a hilarious, expensive, real event.
71. **Physical Security (mantrap, biometrics, cameras, guard desk)** — required for compliance and
    a *visible selling point on facility tours*.
72. **Meet-Me Room** — the single most profitable room in a colo building. Cross-connects at ~95%
    margin, recurring, and they create switching costs: a tenant with 30 cross-connects will never
    leave. **Model cross-connects as both revenue and retention.**
73. **Carrier Diversity (multiple carriers in the building)** — a marketing asset; "carrier-neutral"
    is a sales term that literally closes deals.
74. **Remote Hands Team** — billable in 15-minute increments; a margin product *and* a retention tool.
75. **Loading Dock / Smart Hands Staging** — affects tenant move-in speed; a bad dock loses deals.
76. **Office / Customer Lounge** — pure cosmetics that raise tour conversion. Great joke, entirely true.
77. **Building Shell Expansion / Build-to-Suit** — the wholesale product: you build 10MW because
    someone pre-leased it. Enormous capex, financed, with a construction timeline that can overrun.
78. **Substation / Utility Feed Upgrade** — a 2-3 year lead-time item. Deciding to start it three
    levels before you need it is the deepest strategic choice in the game.
79. **On-site Water / Chiller Plant** — a cost and a political/regulatory liability in drought regions.
80. **Solar / Battery / PPA (Power Purchase Agreement)** — hedges power price, is a sales asset for
    ESG-conscious enterprise tenants, and pays you in demand-response markets.

### 4.5 "Product" buildables — turning operations into SKUs

The signature CEO move: **anything you have to do anyway, sell.** Each of these takes an existing
cost center and attaches a price tag.

81. **Managed Services Tier** — you were doing the work for free; now it's $199/mo.
82. **Premium Support SLA** — 15-minute response for $500/mo. Converts your best support capability
    into revenue and rationally rations it.
83. **Backup-as-an-Add-on** — the highest-attach-rate upsell in hosting.
84. **DDoS Protection Tier** — defense as SKU.
85. **Monitoring as a Product** — you built it for yourself; resell it.
86. **Migration Services** — charge enterprise, free for SMB acquisition.
87. **Dedicated IP / SSL / Domain Registration** — small-ticket, high-attach, near-zero COGS.
88. **Compliance-Ready Hosting** — the same servers, a policy wrapper, 4x the price. Entirely real.
89. **Reserved Capacity / Committed-Use Discounts** — trade price for certainty. Improves your
    forecasting, which improves your capacity planning, which improves your margin.
90. **Spot / Preemptible Capacity** — monetize idle inventory at a discount, with the right to evict.
    Fills your utilization gap. *Risk:* customers build critical things on spot and rage when evicted.
91. **Colo Cross-Connect** — see above. The purest margin in the entire industry.
92. **IPv4 Leasing** — rent your scarce addresses to other operators.
93. **Bandwidth Resale / Transit** — once you're big enough to buy cheap, sell to smaller hosts.
94. **White-Label Everything** — your infrastructure under someone else's brand at 60% of retail.

---

## Category 5 — Unlocks and Discovery

**Framing principle:** in a real hosting company, you don't unlock things by researching them — you
unlock them by **earning the right to be trusted with them**. Credit, credentials, certifications,
allocations, references, and reputation are the real tech tree. Nearly every unlock below is gated by
a *business* achievement rather than a spend.

### 5.1 Credential & permission unlocks (gates, not purchases)

1. **Merchant Account Approval** — unlocked by processing history. Early game you're on a
   high-fee aggregator; after N months of clean history you unlock a real merchant account with
   better rates. Chargebacks can *revoke* it. Progression you can lose.
2. **Higher Processing Limits** — monthly volume caps rise with history. Early on, a viral month can
   exceed your cap and *freeze* your revenue. Brutal and real.
3. **Net Terms with Vendors** — start prepaying for everything; earn net-30, then net-60. This is a
   pure working-capital unlock and feels amazing: suddenly you can buy servers before you're paid.
4. **Vendor Tier / Partner Level** — Gold partner status unlocks deeper hardware discounts, demo
   units, and marketing development funds (MDF — real money vendors give you to advertise them).
5. **RIR Membership + IP Allocation** — requires justification of utilization. Unlocks ASN,
   multi-homing, anycast, and IPv4 leasing revenue.
6. **Peering Eligibility** — requires traffic volume and a router presence. Unlocks the COGS drop.
7. **Carrier MSA** — signing a transit agreement at committed volume unlocks lower per-Mbps rates
   and, at higher tiers, the ability to resell transit.
8. **Bank Relationship / Line of Credit** — requires clean financials (which requires the Controller
   building) and 2 years of operating history. Unlocks surviving cash-timing disasters.
9. **Equipment Lease Facility** — unlocks buying hardware without cash, at a cost of interest and
   covenants.
10. **Cyber Insurance Eligibility** — insurers require MFA, backups, and an IR plan before they'll
    write a policy. Security investments unlock insurance which unlocks enterprise customers who
    require you to carry it. A lovely three-link chain.
11. **SOC 2 Type I → Type II** — Type I is a point-in-time (fast); Type II requires 6-12 months of
    evidence (slow). Unlocks the enterprise lane in two stages, which paces the mid-game perfectly.
12. **PCI-DSS Level** — unlocks e-commerce customers and, separately, lets you store card data
    yourself instead of paying a gateway.
13. **HIPAA Readiness + BAA Capability** — unlocks healthcare customers.
14. **ISO 27001 / 27017 / 27701** — unlocks European enterprise and government.
15. **FedRAMP / IL-level Authorization** — unlocks federal; costs a fortune and 18 months.
16. **GDPR Data-Residency Certification** — unlocks EU customers who legally cannot use you otherwise.
17. **Carrier-Neutral Certification / Uptime Institute Tier Rating (III, IV)** — colo sales gates.
    Tier III unlocks mid-market tenants; Tier IV unlocks financial and government.
18. **Local Permits / Zoning / Tax Abatement** — unlocks building in a region at all; the wholesale
    game's opening move.
19. **Power Allocation from the Utility** — you can't sell kilowatts you weren't granted. A queue with
    a multi-year wait that you join early or regret.
20. **GPU Allocation from the Vendor** — you don't buy GPUs, you're *allocated* them. Unlocked by
    relationship, volume commitment, and sometimes by who you know. Absolutely real and great flavor.
21. **App Store / Marketplace Listing Approval** — unlocks a distribution lane.
22. **Domain Registrar Accreditation** — unlocks selling domains at cost instead of reselling.
23. **Telecom License (VoIP levels)** — regulatory gate for voice; also unlocks E911 obligations.

### 5.2 Reputation & social-proof unlocks

24. **First Case Study** — requires a happy reference customer. Unlocks enterprise conversion bonus.
25. **Three Logos** — unlocks "Trusted by" on the storefront: a flat conversion-rate multiplier.
26. **Community Standing** — a threshold on the reputation stat unlocks the deal-community lane.
27. **Analyst Coverage** — appearing in a market quadrant unlocks enterprise inbound. Requires
    revenue scale plus a briefing (a spend).
28. **Uptime Streak** — 12 months without an SLA breach unlocks a "99.99% guarantee" SKU you can
    actually sell at a premium. **Your operational record becomes a product.**
29. **Published Post-Mortem Credibility** — publishing N honest post-mortems unlocks a permanent
    reputation floor (you become "the honest host"), which reduces damage from future incidents.
30. **Open-Source Sponsorship** — unlocks the developer lane and cheap word-of-mouth.
31. **Conference Speaking Slot** — unlocked by scale; a free marketing lane thereafter.

### 5.3 Capability unlocks discovered through play (discovery mechanics)

32. **Discover Overselling** — the first time a box sits at 8% utilization, an advisor suggests you
    could sell 4x the accounts. Unlocks the Oversell Dial. A genuine "oh no, I understand the
    industry now" moment.
33. **Discover the Renewal Cliff** — the first time a promo cohort renews, the mechanic is revealed.
34. **Discover Expansion Revenue** — when a customer upgrades unprompted, the Upsell system unlocks.
35. **Discover Cross-Connect Margin** — after your first tenant asks for a patch between cabinets and
    you charge $0, the Meet-Me Room unlocks with a very pointed tooltip.
36. **Discover 95th Percentile** — after your first bandwidth bill doesn't match your traffic graph.
37. **Discover Dedup** — after your first storage bill is lower than expected, the dedup ratio dial
    unlocks, and with it "sell 10TB, store 2TB."
38. **Discover Deferred Revenue** — after your first annual prepay, the Finance HUD splits cash from
    revenue and the player learns why they felt rich and then poor.
39. **Discover Cohort Analysis** — after your third month, the churn view unlocks by signup cohort,
    revealing that the Black Friday cohort was worthless.
40. **Discover Negative-Margin Customers** — unlock per-customer profitability after the Controller is
    built. Half your customers turn red. Genuinely one of the best reveals available to this game.
41. **Discover "Fire the Customer"** — unlocked after you see a red customer for 3 consecutive months.
42. **Discover Peering** — after transit costs exceed a threshold.
43. **Discover the Abuse Ladder** — after your first upstream warning email.
44. **Discover Yield Management** — on satellite/GPU levels after you sell out of a scarce resource
    too cheaply.
45. **Discover the Whale Problem** — concentration meter unlocks when one account crosses 20% of MRR.
46. **Discover the Land-and-Expand Ladder** — when a shared-hosting customer outgrows their plan.
47. **Discover Migration Attrition** — after your first acquisition loses 30% in transit.
48. **Discover MDF** — after reaching a vendor partner tier, you learn vendors will pay for your ads.
49. **Discover the "Free Migration" Weapon** — after a competitor steals a customer that way.
50. **Discover Demand Response** — after your first grid-peak event and an email from the utility.

### 5.4 Line-of-business unlocks (changing what kind of company you are)

Each is a full pivot with its own economics, unlocked by a prerequisite you naturally build toward.

51. **Shared → VPS** — unlocked by virtualization + a customer outgrowing shared. Lower volume,
    higher ARPU, lower support, higher capex.
52. **VPS → Dedicated / Bare Metal** — unlocked by the provisioning automation + a vendor credit line.
53. **Dedicated → Colo** — unlocked when you have more rack space than servers. *You start renting
    out what you already pay for.* The most natural and most real pivot in the industry.
54. **Colo → Wholesale** — unlocked by filling a building and obtaining a power allocation.
55. **Anything → Managed** — unlocked by a Tier-2 support desk; layer services on top of iron.
56. **Hosting → Backup/DR** — unlocked by having storage and offsite capacity. Countercyclical
    revenue with near-zero churn; the classic "stabilize the business" pivot.
57. **Hosting → CDN/Edge** — unlocked by multi-POP presence + anycast.
58. **Hosting → Email/DNS** — unlocked by IP reputation management + anycast.
59. **Hosting → GPU/AI** — unlocked by power density + financing + vendor allocation. High risk, high
    reward, requires abandoning your cost discipline.
60. **Hosting → Game Servers** — unlocked by DDoS scrubbing + low-latency network + a community
    marketing presence. Cheap to enter, seasonal, fraud-heavy.
61. **Hosting → Regulated** — unlocked by the Compliance Office + an audit. Slow, sticky, expensive.
62. **Hosting → Bulletproof** — unlocked by... choosing to. Instant, lucrative, contaminating.
    Should have a one-way-door warning and a permanent campaign flag.
63. **Hosting → Reseller Platform / White Label** — unlocked by automation maturity. Turns competitors
    into customers, which is a beautiful strategic idea the game should let players find.
64. **Hosting → Transit / IP Leasing** — unlocked by ASN + surplus capacity. Sell your COGS advantages
    to smaller hosts.
65. **Hosting → Software** — unlocked by building your own control panel: license it to other hosts.
    The highest-margin pivot available and a real industry path.
66. **Hosting → MSP / Professional Services** — sell labor instead of iron. Lower margin, lower capex,
    stabilizes revenue, harder to scale.
67. **Operator → Acquirer** — unlocked by a credit facility; you stop building customers and start
    buying them.
68. **Operator → Landlord → REIT** — the endgame financial pivot: your company becomes a real-estate
    asset with a cap rate, and your score changes from EBITDA to NOI.

### 5.5 Staff and organizational unlocks

69. **First Hire** — unlocks doing two things at once. The whole early game is you as the constraint.
70. **The First Salesperson** — unlocks lanes you cannot reach yourself.
71. **The First Accountant** — unlocks financial visibility.
72. **A Real CTO** — unlocks reduced self-inflicted outages, at the cost of slower shipping.
73. **A COO** — unlocks running multiple sites/lines without micromanaging each.
74. **An Abuse/Trust & Safety Lead** — unlocks bulletproof-adjacent revenue *safely*.
75. **A CFO** — unlocks financing instruments, forecasting, and the Exit level.
76. **A Board** — unlocks capital but adds quarterly targets as a constraint (and a scored review).
77. **On-Call Rotation** — unlocks 24/7 coverage without burning out your one admin (burnout is a
    modeled risk: an exhausted engineer causes outages).
78. **Runbook Library** — unlocks handing off work; mitigates the Key Person threat.

---

## Category 6 — Economy, Money, and Scoring

**Framing principle:** the most important design decision in this whole document —
**separate CASH from PROFIT and make both visible.** Nearly every hosting company that dies is
profitable on paper. If the game models only one number, it isn't about hosting.

### 6.1 The three money bars

- **Cash** — what's in the bank right now. You die at zero. Non-negotiable.
- **MRR / ARR** — recurring revenue run rate. The growth score.
- **EBITDA / Contribution Margin** — profitability. The quality score.

Plus two secondary meters that experienced players will obsess over:
- **Deferred Revenue** — money collected but not yet earned (annual prepays). It's cash you have and
  revenue you don't. Spending it is the classic startup sin; the game should let you and then punish you.
- **Runway** — months of cash at current burn. The single most important number in a young company.

### 6.2 Revenue streams (by shape, not just source)

1. **MRR (subscription)** — predictable, the basis of valuation. Recognized monthly.
2. **Annual/Multi-year Prepay** — cash up front at a discount. Improves runway, reduces churn,
   lowers total revenue, and creates a refund liability.
3. **Setup / One-Time Fees** — immediate cash; a conversion-rate killer if visible at checkout.
4. **Usage/Consumption Revenue** — bandwidth overage, storage GB-months, GPU-hours, API calls.
   Unpredictable both ways.
5. **95th-Percentile Bandwidth Billing** — your customer's five worst minutes each day determine the
   bill. Teach this by making a player eat one bad burst.
6. **Overage Penalties** — real money; also a churn driver. A dial: bill hard or grandfather.
7. **Cross-Connect Fees** — recurring, tiny, ~95% margin, and enormous in aggregate.
8. **Remote Hands** — billed in increments; a margin product and a satisfaction driver.
9. **Professional Services / Migration Fees** — labor revenue; low margin, high trust-building.
10. **Domain Registration & Renewal** — loss-leader at signup, margin at renewal, extremely sticky.
11. **SSL / Security Add-ons** — near-zero COGS attach revenue.
12. **Marketplace Rev-Share** — 20-30% of third-party add-ons.
13. **License Resale** — cPanel, Plesk, Windows SPLA, control panels — small markup, big volume.
14. **IPv4 Leasing** — rent your address space.
15. **Transit Resale** — sell bandwidth you buy at wholesale.
16. **Demand Response Payments** — the utility pays you to shed load. Revenue from *not* using power.
17. **MDF / Vendor Co-op Marketing** — hardware vendors fund your marketing.
18. **Referral Income** — you send overflow to a partner and get a cut. Monetize the leads you can't serve.
19. **Termination / Early-Exit Fees** — colo and enterprise contracts; softens churn's cash impact.
20. **Asset Resale** — decommissioned servers and GPUs have a residual value that decays on a curve.
21. **Scrap / e-Waste Recovery** — small, funny, real.
22. **Sale-Leaseback** — sell your building, lease it back; a one-time cash injection at the cost of
    permanent opex. A genuinely tempting late-game trap/tool.

### 6.3 Cost structure (and which ones are traps)

- **COGS:** power, bandwidth/transit, licensing, hardware depreciation, colo/lease payments,
  payment processing fees, and the support cost directly attributable to serving customers.
- **Opex:** salaries, marketing, tooling, insurance, legal, audit, office.
- **Capex:** servers, network gear, facility build, GPUs — becomes depreciation over 36-60 months.
- **The traps, specifically:**
  - **Transit Commit** — you pay the commit whether you use it or not.
  - **Power Commit** — same, and it lasts years.
  - **Per-Account Licensing** — scales with customers, not revenue, so it destroys cheap plans first.
  - **Payment Processing** — a flat ~3% haircut people forget when pricing a $3 plan (where the
    $0.30 fixed fee is 10% of the sale!). A great teaching moment: **fixed transaction fees make
    micro-plans structurally unprofitable, which is why real hosts push annual billing.**
  - **Support Cost Per Ticket** — the number that decides whether cheap hosting works at all.
  - **CAC Payback Period** — if you pay $90 to acquire a $6/mo customer with 4% monthly churn, you
    never make the money back. The game should let a player joyfully grow themselves to death.
  - **Depreciation vs Cash** — you bought the server last year; the P&L pain is spread out and the
    cash pain already happened. Players must learn both halves.
  - **Stranded Capacity** — space you can't power, power you can't cool, cooling you can't sell.
  - **Double-Running During Migration** — paying for old and new simultaneously.
  - **Idle GPU-Hours** — the most expensive idleness in the industry.

### 6.4 Pricing mechanics the player actively manipulates

1. **Price Ladder Editor** — set price per plan tier. Raising prices raises revenue and churn; the
   game should show a demand curve estimate and then prove it wrong occasionally.
2. **Intro vs Renewal Pricing** — two numbers per plan. Aggressive spreads maximize signups and
   guarantee a cliff. Transparent pricing lowers signups and raises LTV. **A pure, honest strategic
   choice with no right answer** — exactly what the industry actually looks like.
3. **Term Discounting** — monthly / annual / triennial; each lowers churn and price.
4. **Grandfathering Policy** — when you raise prices, do existing customers keep old pricing?
   Grandfathering = loyalty + a slowly rotting revenue base. Not grandfathering = a churn wave.
5. **Volume / Committed-Use Discounts** — trade price for predictability.
6. **Overage Policy** — hard cap (protects you, angers them), soft cap (bill shock), burst allowance.
7. **Free Tier Sizing** — a marketing spend disguised as a product decision.
8. **Regional Pricing / PPP** — more volume, arbitrage risk (VPN resellers).
9. **Bundling** — hosting + domain + SSL + email at a blended price; raises attach, obscures margin.
10. **Yield Management** — dynamic pricing for scarce inventory (GPU hours, satellite passes, the
    cabinets nearest the meet-me room). Charge more for the good spots. Colo operators really do.
11. **Cost-Plus vs Value Pricing** — a compliance-hosted server is the same server at 4x. Let the
    player discover that *positioning is a pricing lever*.
12. **Promo Engine** — coupon codes with expiry, first-term-only flags, and a redemption budget.
    A badly scoped coupon leaking to a deal site is a classic, survivable disaster.
13. **Discount Approval Threshold** — how much can sales discount without you? Raising it closes more
    deals at worse margins.
14. **Price Increase Event** — an active decision with a modeled churn response and a reputation hit.
    Doing it well (with notice, grandfathering, and a value story) is a skill.

### 6.5 Cash-flow mechanics (the actual gameplay tension)

- **The Billing Cycle Clock** — invoices generate on a day; cash lands days later; payroll is on a
  fixed day. Timing puzzles emerge naturally.
- **DSO Meter** — average days to get paid. Enterprise customers raise it; consumer cards lower it.
- **Dunning Pipeline** — failed → retry → reminder → suspend → terminate, each stage with a recovery
  rate and a churn/PR cost.
- **Suspension Policy Dial** — day 3 / day 10 / day 30. Aggressive = better cash, worse reputation.
- **Working-Capital Squeeze** — growth consumes cash. Fast growth on monthly billing with up-front
  hardware purchases is the most dangerous state in the game. **You can lose by winning.**
- **Financing Instruments:**
  - *Equipment Lease* — spread capex, pay interest, keep cash. Easy, expensive, addictive.
  - *Vendor Financing* — the hardware vendor finances the purchase to close the sale.
  - *Revolving Credit Line* — bridges timing gaps; has covenants (min EBITDA, max leverage).
  - *Term Loan* — for facility build; long, cheap, restrictive.
  - *Venture / Growth Equity* — dilution, a board, growth targets that override profitability.
  - *Customer Prepayment* — the cheapest capital in the world: ask your customers to prepay a year
    in exchange for 2 free months. Real, underrated, and a great "aha" unlock.
  - *Factoring / Receivables Finance* — expensive, fast, a sign of distress.
  - *Sale-Leaseback* — late-game one-time cash for permanent opex.
- **Covenant Breach** — trips a fail-state or forces asset sales.
- **The Runway Countdown** — always visible once you take on fixed costs.

### 6.6 The metrics panel (and what each one teaches)

- **MRR / ARR**, **New / Expansion / Contraction / Churned MRR** (the classic waterfall — visually
  perfect as a bar chart that fills and drains each month).
- **Gross Churn vs Net Revenue Retention.** NRR above 100% means your existing customers grow faster
  than they leave — the holy grail. Should be a celebrated achievement.
- **ARPU / ARPA**, **LTV**, **CAC**, **LTV:CAC ratio**, **CAC payback months**.
- **Gross Margin by product line** — reveals which business is subsidizing which.
- **Utilization %** (racks, power, cores, RAM, storage, GPU-hours) — the single most important
  operational-financial number in hosting.
- **PUE** — cost efficiency of the facility; directly modifies your power bill.
- **Cost per Ticket / Tickets per Customer per Month.**
- **First Response Time / Resolution Time.**
- **Uptime % vs SLA threshold** and **SLA Credits Issued**.
- **Concentration** — % of MRR from top customer, top 5, top 10.
- **Weighted Average Remaining Contract Term (WARCT)** — colo's valuation driver.
- **Bad Debt %, Chargeback Ratio, Refund Rate, Involuntary Churn %.**
- **NPS / CSAT** — feeds the referral lane.
- **Abuse Tickets per 1,000 Accounts** — the leading indicator of your upstream relationship.
- **Rule of 40** (growth % + margin %) — a single elegant end-of-level grade for SaaS-ish levels.

### 6.7 Scoring, win, and lose conditions

**End-of-level "Board Review" scorecard** — a slide-deck-styled results screen grading:
- *Growth:* net new MRR, logo count, NRR.
- *Profitability:* gross margin, EBITDA, Rule of 40.
- *Efficiency:* CAC payback, utilization, cost per ticket, PUE.
- *Risk:* concentration, WARCT, abuse rate, single points of failure, insurance coverage, key-person
  exposure, compliance status.
- *Reputation:* NPS, public incidents, review score.
- *Cash Discipline:* minimum cash balance reached, days of runway, covenant headroom.

Each area gets a letter grade and the board gives a one-line comment in character
("Growth is fine. Your top customer is 41% of revenue. Fix that or we will.").

**Win conditions (varied by level type):**
- *Survival:* end with cash > 0 and MRR ≥ target.
- *Profitability:* EBITDA margin ≥ X.
- *Quality:* NPS/uptime thresholds with no more than N SLA breaches.
- *Strategic:* land the anchor tenant / pass the audit / complete the migration with <10% attrition.
- *Valuation:* exit at ≥ X multiple (the Exit level).
- *Pivot:* derive ≥50% of MRR from the new line of business.

**Lose conditions (each should feel like a different, recognizable business death):**
- **Insolvency** — cash hits zero. The most common death, and it should frequently happen while the
  P&L is green.
- **Growth Death** — you grew fast, CAC-financed, and the working capital gap ate you.
- **Churn Spiral** — churn exceeds new adds for N consecutive months; the death is slow and visible,
  which is worse.
- **Reputation Collapse** — reputation below a floor closes every acquisition lane; demand goes to
  zero regardless of your capacity.
- **Deplatforming** — payment processor + upstream both drop you. The bulletproof ending.
- **Regulatory Shutdown** — failed audit + enforcement action.
- **Covenant Default** — the lender takes the assets.
- **Concentration Collapse** — your whale leaves and you cannot cover fixed costs.
- **Acquisition (a soft loss/win)** — a competitor buys you at a bad multiple. You survive; the score
  is mediocre; the campaign continues under a new owner, which is a *fantastic* narrative device.

---

## Category 7 — Core Gameplay Mechanics

**Framing principle:** the map has two halves that share one resource pool. The **right half** is the
infrastructure board (packets, racks, defenses). The **left half** is the **commercial board**
(pipeline, contracts, billing, reputation). Money flows right-to-left as capacity, left-to-right as
revenue. A player who only plays one half loses.

### 7.1 The dual board

- **The Iron Board** — spatial tower-defense proper. Lanes, placement, pathing, defenses.
- **The Book** — a card-and-pipeline board: leads in stages, contracts as cards with terms, an
  invoice run, a churn queue, an abuse queue.
- **The Bridge** — capacity is the exchange rate between them. Signing a contract on the Book
  *allocates* capacity on the Iron Board. Over-signing creates oversubscription, which is a
  *deliberate, dial-controlled gamble*, not a bug.

### 7.2 The connection metaphor: **Contracts are cables**

The brief asks specifically how the player connects, e.g., a database to a web server. My proposal
from the business lens: **there is exactly one connection gesture in the game, used for both technical
and commercial links, because in hosting they're the same thing — a dependency with terms.**

**The Gesture: drag-to-commit.**
- Click and hold a port on the source object; a glowing cable follows the cursor.
- Valid targets highlight; invalid ones gray out with a one-word reason ("no capacity", "no license",
  "wrong VLAN", "not in contract").
- Release on the target. A **Terms Card** flips up for one beat showing what this link costs and
  promises: *bandwidth allocated, monthly cost, latency added, SLA implication, new attack surface.*
- Confirm with a click, or press Escape to abandon. Holding Shift skips the card for repeat links.

**How a made connection is represented:**
- **A physical cable** drawn as a bezier with a color = its *class*: copper/orange for LAN, blue for
  storage, green for public/customer-facing, purple for management, red for anything crossing a trust
  boundary, gold for a **billable cross-connect**.
- **Thickness = provisioned capacity. Brightness/flow speed = current utilization.** A cable that is
  dark is wasted money; a cable that is white-hot is about to cost you an SLA credit. This one visual
  rule teaches capacity planning without a tutorial.
- **A small tag at the midpoint** showing the monthly cost if it has one. Colo cross-connects show
  "$300/mo" in gold — the player learns viscerally that cables can be revenue.
- **Dashed = unsecured / unencrypted / uncontracted.** Regulated levels fail audits on dashed lines.
- **A padlock glyph** when the link is covered by a signed DPA/BAA.

**Commercial links use the same gesture:**
- Drag from a **Customer card** to a **Service** to provision them onto it (this is "quote-to-cash" as
  a drag).
- Drag from a **Salesperson** to a **Lead** to assign ownership.
- Drag from an **Account Manager** to a **Whale** to establish the retention relationship.
- Drag from a **Partner** to a **Product** to open a channel.
- Drag from a **Transit Provider** into your **Edge Router** to sign a commit.

Because the gesture is identical, the game's core verb is: *"decide what depends on what, and accept
the terms."* That is genuinely what running a hosting company is.

**Alternative/assist modes (for accessibility and scale):**
- **Wiring Mode (hotkey W)** — dims everything except ports; click-click instead of drag; ideal on
  dense maps.
- **Bus Mode** — draw one cable to a switch/rail and everything attached inherits it; prevents
  spaghetti at scale.
- **Contract Templates** — save a wiring pattern ("standard web tenant") and stamp it with one click.
  This is how a real host provisions and it's also the anti-tedium feature the late game needs.
- **Auto-Cable (paid)** — hire a field tech who wires it for you, imperfectly, for money. A literal
  "pay to skip micromanagement" that is also thematically correct.

### 7.3 The commercial mechanics proper

1. **The Pipeline Board** — leads sit in columns (New → Qualified → Quoted → Verbal → Signed) with a
   **decay timer** on each. Neglected leads fade and die. Sales staff work them automatically; the
   player intervenes on the big ones.
2. **The Contract Card** — every client is a card with: MRR, term length, start/end date, SLA tier,
   notice period, escalator, termination fee, support entitlement, and 1-2 **special clauses**
   (e.g., "most-favored pricing", "unlimited liability", "right to audit", "no price increases").
   Bad clauses are cheap to accept now and expensive at Exit. **Reading the fine print is gameplay.**
3. **The Renewal Window** — a contract card starts pulsing 90 days before expiry. You can act:
   renew flat, renew with escalator, upsell, or let it lapse. Doing nothing = it lapses. Colo levels
   live and die here.
4. **The Invoice Run** — a monthly beat where invoices fire, cash lands with a delay, failures go to
   dunning, and the Cash bar visibly jumps. Making this a rhythmic, satisfying, slightly tense
   monthly event gives the game its heartbeat.
5. **The Churn Queue** — at-risk accounts surface here with a reason code. You have limited
   intervention actions per month (discount / escalate / call / fix the actual problem). **Scarcity of
   intervention is the point:** you cannot save everyone, so you triage by value.
6. **The Abuse Queue** — inbound complaints with SLA timers. Clearing them costs staff time; ignoring
   them advances the upstream escalation ladder. On bulletproof levels the queue is the level.
7. **The Ticket Queue** — the same shape, different currency: unanswered tickets convert into churn
   with a 30-60 day lag, which the game should *show* with a ghosted forecast so players can learn
   the causal chain.
8. **The Capacity Planner** — a forward-looking chart: committed capacity vs contracted demand vs
   forecast. Ordering hardware has a lead time, so you must buy against a forecast. Buying too early
   burns cash; too late loses deals. This is the central strategic loop of the mid-game.
9. **The Oversell Dial** — per-node, set the subscription ratio. Higher = more margin, more risk of a
   performance incident when usage correlates (and it *will* correlate — Black Friday, a game launch,
   a backup window).
10. **The Pricing Console** — see §6.4.
11. **The Budget Allocator** — split marketing spend across lanes; see the CAC and quality of each
    lane update with a lag, because attribution is always late.
12. **The Org Chart** — hire, assign, and burn out staff. Each person has a specialty, a ramp time,
    a salary, a morale stat, and a knowledge set. Overworking staff causes outages *and* resignations.
13. **The Board Meeting** — every N months you get objectives and a reckoning. A soft timer that
    shapes strategy.
14. **The Advisor / Mentor** — an in-fiction old operator who says true things at the right moment
    ("kid, nobody ever went broke selling annual plans"). Tutorializes without a tutorial.

### 7.4 Resource model

- **Cash** (spendable now), **Credit** (borrowable), **Capacity** (kW / RU / cores / GB / Gbps /
  GPU-hours), **Staff Hours** (the real bottleneck in a small host), **Attention** (a limited number
  of active interventions per month — this is what makes it a *game* rather than a spreadsheet),
  **Reputation**, and **Trust/Compliance Standing**.
- **Staff Hours** is the elegant one: support tickets, migrations, abuse takedowns, sales calls,
  audits, and incident response all draw from the same pool. Every business decision becomes "what do
  my people *not* do this month."

### 7.5 Pathing, placement, and failure

- **Visitor pathing = the customer journey.** Latency, errors, and captcha friction are *terrain*.
  Every hop adds time; every defense adds friction; too much friction and the visitor bounces. The
  literal tension the brief describes — defenses that stop threats also slow customers — becomes the
  central tuning problem, and it is *exactly true to life* (WAFs block real customers; fraud rules
  reject real buyers; strict abuse policy suppresses signups).
- **Placement matters commercially:** in colo, cabinets near the meet-me room are worth more; in CDN,
  POP placement determines which eyeball networks you serve cheaply; in exchange colo, cable length
  is regulated. Space has price.
- **Blast radius:** objects placed on the same power circuit / switch / hypervisor / rack share a
  failure domain, drawn as a faint colored halo. Concentrating customers is efficient and fragile.
  A great visual for "you saved $400/mo and put 60% of your revenue on one PDU."
- **Graceful degradation:** most failures should be partial. Slow, not down. The game should make
  "everything is technically up and customers are leaving" a common, teachable state.
- **Delayed damage:** the signature mechanic of this design. Outages, bad support, and price hikes
  don't churn customers instantly — they set a fuse. A forecast overlay shows the *projected* churn
  from this month's sins landing two months out. Players learn to read consequences before they arrive.
- **Insurance and hedges** as a mechanic class: things you buy that do nothing unless something bad
  happens (redundant processor, second transit, fuel contract, cyber policy, tested backups,
  documented runbooks). The game should routinely reward players who buy them and occasionally show
  a player who skipped them getting away with it — so the choice stays real.

### 7.6 Time and pacing

- **Monthly beat** (invoice run, payroll, board of hours) over a **daily tick** (traffic, threats,
  tickets). Two nested clocks give both moment-to-moment defense and strategic rhythm.
- **Pause-and-plan** with speed controls; incidents auto-pause the first time each type appears.
- **Seasonality calendar** visible at all times: Black Friday, game launches, fiscal year-end
  government buying, holiday freeze windows, hurricane season, grid peak months, audit dates,
  contract renewals. The player plans against a *known* calendar plus unknown shocks — which is
  precisely how the job feels.
- **Change Freeze** as a playable state: during peak season you can lock deploys, reducing
  self-inflicted outages but freezing your ability to add capacity. Real hosts do this every December.

### 7.7 Difficulty levers that are business-shaped

- **Market conditions:** a price-war market, a boom market, a credit-tight market.
- **Starting posture:** bootstrapped (cash-poor, no debt), venture-funded (cash-rich, growth-gated),
  or **inherited** (an existing business with legacy customers, technical debt, and one furious whale).
- **Customer mix:** a book weighted toward cheap/high-support customers is a hard start.
- **Regulatory intensity:** which jurisdiction you're in.
- **Legacy Debt Modifier:** start a level with undocumented systems and grandfathered pricing.

---

## Category 8 — Visuals and Presentation

**Framing principle from this lens:** the visual language should make **money legible**. A hosting
operator's eye goes to three things in a rack row: what's dark (wasted money), what's hot (about to
cost me), and what's unlabeled (will cost me later). The art direction should encode exactly that.

### 8.1 Overall art direction

1. **"Isometric Ledger"** — clean isometric facility view with a deliberately flat, diagrammatic
   UI overlay that looks like a well-designed financial dashboard. The contrast between the warm,
   blinking physical world and the cool, precise money layer *is* the theme of the game.
2. **The Two-Tone Rule** — everything in the world is rendered in neutral grays and equipment colors;
   **only money and risk are saturated.** Green for revenue, red for cost/loss, gold for
   high-margin items (cross-connects, upsells), violet for compliance/trust. Your eye is trained on
   the P&L whether you want it or not.
3. **Utilization Glow** — every revenue-producing object has a fill level rendered as a soft bar or
   an internal glow. Empty (dark blue) = you're paying for nothing. Healthy (warm amber) = money.
   Saturated (pulsing white-red) = you're about to breach an SLA. **One glance across a hall tells
   you your entire capacity-to-contract position.**
4. **Label Quality is Visible** — cables and cabinets get visibly better labeling as you invest in
   ops discipline. A colo tour visitor's satisfaction visibly rises walking past tidy rows. A
   cosmetic system with mechanical consequences.
5. **Dust, Cable Spaghetti, and Entropy** — neglected infrastructure accumulates visual mess:
   loose cables, dusty filters, a chair in the hot aisle, an unlabeled box. Mess is a leading
   indicator of incidents and a tour-conversion penalty. Cleanup is a spendable staff-hours action.

### 8.2 The HUD as a P&L

6. **The Money Strip** — a single top bar containing: **Cash** (with a runway countdown),
   **MRR** (with this month's waterfall arrows), **EBITDA margin**, and a small **Reputation** dial.
   Nothing else is permanently pinned. Everything else is a drawer.
7. **The MRR Waterfall Widget** — a live four-segment bar: New (green) / Expansion (bright green) /
   Contraction (orange) / Churn (red). It fills and drains across the month. The most information-
   dense, most satisfying single widget you can give a hosting player.
8. **The Cash Calendar** — a small strip showing the next 30 days with known inflows (invoice run,
   enterprise payment due) and outflows (payroll, power bill, lease, loan payment) as little
   green/red pips. Seeing the payroll pip approaching while the enterprise payment pip slides right
   is pure, cheap tension.
9. **The Runway Bar** — drains in real time. Turns amber at 6 months, red at 3, and starts making a
   soft heartbeat sound under 1. Nothing else needs to tell you you're in trouble.
10. **Deferred Revenue Ghost** — the portion of your Cash bar that is *not yet earned* is rendered as
    a translucent overlay on the cash bar. Spending into the ghost is possible and visibly dangerous.
11. **The Drawer System** — Sales, Support, Abuse, Finance, Capacity, Compliance drawers slide up
    from the bottom. Each shows a badge count. A player under pressure literally watches their
    departments light up red in sequence, which is a beautiful way to render "a bad week."
12. **Per-Customer Profitability Heat** — toggle overlay tinting every customer/service by gross
    margin. Half the map going red the first time you enable it is a designed gut-punch.
13. **Blast-Radius Overlay** — hold a key, see failure domains as colored translucent fields with
    "$X MRR at risk" labels floating in them.
14. **The Contract Gantt** — a horizontal timeline of every contract's remaining term, sorted by
    value. Colo players will live in this view. Renewal windows glow; a whale's bar ending in 4
    months is impossible to ignore.
15. **The Cohort Grid** — a triangle heatmap of retention by signup month. Discovering that your
    Black Friday cohort is a red stripe is a whole narrative in one image.
16. **The Funnel Column** — a vertical stack showing Impressions → Clicks → Leads → Orders →
    Provisioned → Paying, each stage with its drop-off rendered as visible particles spilling out
    the side. **Losses are animated, not just counted.**

### 8.3 How visitors and clients look

17. **Traffic Motes** — tiny colored particles streaming down lanes. Color = product line, so you can
    see your revenue mix as literal traffic color.
18. **Bounce Animation** — a mote that fails turns gray, makes a small "tsk" puff, and drifts
    backwards off-screen. A mass bounce event looks like smoke blowing back out of your building,
    which is exactly the right emotional read.
19. **Client Avatars** — clients are chunky, individually-rendered figures with a **nameplate**
    showing MRR, term, and a tiny support-burden icon (a headset with 1-3 bars). You learn to read a
    prospect's profitability from their silhouette before they arrive.
20. **The Suit Gradient** — visual class signaling that is fun and readable: hoodie = developer,
    polo = SMB, blazer = enterprise, hard hat + clipboard = auditor, broker with a lanyard = colo
    tour, sunglasses and a briefcase = the gray tenant, quarter-zip = the diligence analyst.
21. **The Whale** — literally larger, moves slower, casts a longer shadow, and everything near them
    gets a faint gold tint. When a whale's renewal window opens, their shadow starts pulsing.
22. **The Support Vampire** — trails a little cloud of ticket envelopes that accumulate visibly.
23. **Streamers** — arrive with a crowd of small player-motes following behind them. Losing the
    streamer means watching the crowd turn around and follow them off-screen. Devastating and clear.
24. **The Tour Group** — on colo levels, 3-4 figures walk a fixed path through your facility. Thought
    bubbles show what they notice: tidy cabling (👍), an unlabeled cage (👎), a security mantrap (👍),
    a puddle under a CRAC (😬). The path is the level.
25. **Backup Jobs** — big, slow, freight-train-shaped units that must reach the vault before the
    window closes. A progress bar with a deadline is inherently tense.
26. **Restore Jobs** — glowing red-orange, urgent, with a countdown and a *customer figure standing
    at your door watching it*. That single visual sells the entire backup business model.
27. **Inference Requests vs Training Jobs** — darting hummingbirds vs a slow armored convoy.

### 8.4 How threats look (business-flavored)

28. **The Chargeback** — money flowing *backwards* out of your cash bar as red coins, with a small
    receipt-shaped sprite that tears in half.
29. **The Review Bomb** — a one-star sprite that lands on your storefront and *visibly narrows the
    acquisition lane* — the lane geometry literally pinches. Demand reduction should be spatial.
30. **The Competitor's Poach** — a rival-branded truck that drives up your lane and one of your
    client figures gets in.
31. **The Regulator / Auditor** — walks in through the front door, not the network. A calm figure
    with a clipboard who cannot be shot at. Defenses visibly do nothing to them.
32. **The Processor Freeze** — a padlock slams over the Cash bar; incoming coins stack up *outside*
    it, visible and untouchable. Maddening in the best way.
33. **The Abuse Ladder** — a physical traffic-light totem from your upstream, visible at the top of
    the map: green → amber → red. When it goes red your uplink cable visibly unplugs itself.
34. **The Vendor Price Hike** — an envelope sprite that opens into a letter, and every affected
    object on the map gets a small red "+$" badge simultaneously. Mass, instant, visceral.
35. **Ransom DDoS** — a black envelope with a skull; accepting it animates coins leaving and the
    attack wave dissolving, which should feel *gross*.
36. **The Churn Wave** — client figures standing up, one after another, in a ripple across your
    customer board, and walking out the door in a line. Silent. No explosion. Far scarier.
37. **Bad Debt** — invoices that turn yellow, then brown, then crumble into dust on the floor.
38. **The Fire** — the only genuinely dramatic visual, saved for rarity: red strobes, clean-agent
    discharge fog, and every cabinet in the zone going dark at once.
39. **Concentration Risk** — the whale's revenue contribution rendered as a visibly load-bearing
    pillar holding up your company's floor. When they threaten to leave, the pillar cracks.

### 8.5 How money moves, visually

40. **Invoice Run Confetti** — on the billing day, a burst of small green invoice sprites fly from
    customers to your building; successful ones convert into coins on arrival, failed ones turn red
    and fall into the dunning tray. The monthly heartbeat, made a spectacle.
41. **Coin Trails Follow Cables** — revenue literally flows along the connection cables from customers
    into your cash bar, so **the most profitable cable on screen is visibly the busiest with gold.**
    A colo player will see the meet-me room glittering and instantly understand the business.
42. **Costs as Drips** — opex drains continuously as small red droplets falling from each object into
    a gutter. An idle server dripping money with no gold flowing in is the clearest "you over-bought"
    signal possible.
43. **Depreciation Fade** — capex items visibly desaturate over their depreciation life, and show a
    small residual-value tag. Old GPUs look tired.
44. **Upsell Pop** — a small gold "+$29/mo" that floats up from a customer and merges into the MRR
    bar with a satisfying chime. Expansion revenue should feel *great* because it's the cheapest
    revenue and the game wants you addicted to it.
45. **SLA Credit** — a green coin that arrives, then immediately turns and walks back out with a
    little apology note. Tiny, humiliating, correct.
46. **Price Increase Ripple** — raising prices sends a visible wave across your customer board;
    most figures shrug, some turn red and start a churn timer. You watch your decision propagate.

### 8.6 Look shifts by hosting type and era

47. **Shared hosting** — dense, cheerful, cluttered; hundreds of tiny site-icons packed into a box
    like an apartment building with the lights on. Warm palette, slight chaos.
48. **VPS** — clean grid of identical partitioned cells; cool blues; a satisfying tetris-like
    allocation view where overcommit is shown as translucent overlapping blocks.
49. **Dedicated/bare metal** — heavy, industrial, individually labeled boxes with customer nameplates
    bolted on. Sparse and expensive-looking.
50. **Colo** — architectural. Wide aisles, cages, signage, a lobby, a security desk. The camera pulls
    back and the game starts looking like a building plan. Palette: concrete, steel, corporate blue.
51. **Wholesale/hyperscale** — the map zooms out to a site plan with substations, generator yards,
    and empty pads awaiting build-to-suit. Almost a city-builder.
52. **GPU/AI** — hot, loud, dense; angry orange thermal glow, thick liquid-cooling manifolds rendered
    as visible plumbing, and a constantly-ticking dollar counter on every rack because the capital
    intensity should be oppressive.
53. **Backup/archive** — cold blue, quiet, slow. Vault doors, tape robots gliding on rails. The
    calmest screen in the game, which makes its rare disasters land harder.
54. **Game servers** — neon, playful, server icons wearing game skins; a scoreboard aesthetic; player
    avatars visibly happy or rage-quitting.
55. **Email/DNS** — abstract, minimal, almost a map of the internet; the "product" is invisible so the
    visualization should be a reputation dashboard with a giant inbox-placement gauge.
56. **CDN** — a world map as the primary play surface; POPs as pins; traffic as arcs; peering as
    permanent shortcuts drawn in gold.
57. **Bulletproof** — dim, gray-market, cash-in-a-briefcase iconography; a persistent low-frequency
    unease; the HUD gains a "heat" meter styled like a police scanner.
58. **Regulated** — sterile, over-labeled, badge readers everywhere; a permanent compliance checklist
    sidebar; everything documented, everything slower.
59. **1988 BBS** — CGA/EGA palette, ANSI art, a single-screen sysop's desk with a ledger book.
60. **1996 dial-up ISP** — beige, teal, Windows-95 chrome; modem-bank LEDs; a busy-signal counter.
61. **2003 datacenter** — fluorescent, drop ceiling, blue carpet, CRT KVM cart.
62. **Modern** — the clean isometric default.
63. **Near-future** — liquid immersion, autonomous cart robots, a grid-interaction dashboard.
    The era shift should also change the *UI font and chrome*, so switching eras feels total.

### 8.7 Readability at scale

64. **Roll-Up Rendering** — beyond a zoom threshold, individual servers merge into a single
    "row" object that inherits the worst status of its members and displays aggregate MRR and
    utilization. You never lose the ability to read the money.
65. **The Money Minimap** — a minimap that shows revenue density rather than geography.
66. **Sort-by-Risk Camera** — a button that re-frames the view on whatever is currently costing you
    the most money, not whatever is loudest.
67. **Everything Has a Price Tag on Hover** — every object, cable, and person shows monthly cost,
    monthly revenue, and net contribution. One consistent hover card across the entire game.
68. **Colorblind-safe encoding** — money uses shape as well as hue (coins vs droplets vs receipts).
69. **The Quiet Mode** — an option to hide all combat VFX and show only the commercial layer, for
    players who want the tycoon game. Conversely a **Packet Mode** that hides the money. Both are
    legitimate ways to play and the game should support looking at either.

---

## Category 9 — Anything Else

### 9.1 Modes

1. **Campaign: "Founder to Exit"** — the full P&L ladder, L1 to the Exit level, with persistent
   reputation and a persistent customer book that follows you across levels. Customers you treated
   well in level 3 show up in level 9 as references.
2. **Roll-Up Tycoon** — you never build anything. You only acquire. Every level is a diligence,
   integration, and retention problem. A genuinely different game using the same systems.
3. **The Turnaround** — you inherit a dying host: 40% churn, a furious customer base, a failed audit,
   and 5 months of runway. The most interesting starting position in the genre.
4. **Bootstrapper Mode** — no financing available at all. Every dollar must come from a customer.
   Brutal, pure, and the way most real hosts actually started.
5. **VC Mode** — infinite early cash, mandatory growth targets, and a board that forces you to
   destroy your own margins. Losing by "succeeding" is the designed ending.
6. **Bulletproof Run** — a high-score cash-extraction mode with a heat meter and an exit timer.
   Explicitly framed as a morally grubby side mode, with the earnings unusable in the main campaign.
7. **Landlord Mode** — colo only. Slow, lease-driven, WARCT-scored. Almost a real-estate game.
8. **Free-Play Sandbox** — pick a hosting type, a market, a starting capital, and a difficulty mix.
9. **Scenario Weekly** — a shared scenario with a fixed seed and a global leaderboard scored on
   EBITDA or valuation. Watching how differently people solve the same balance sheet is the draw.
10. **Historical Campaign** — play the actual arc: BBS (1988) → ISP (1996) → shared hosting (2003) →
    VPS (2010) → cloud (2016) → GPU (2024). Each era's winning strategy becomes the next era's
    losing one, which is both fun and *true*.
11. **Co-op: Two Departments** — one player runs Ops, one runs Commercial, sharing one cash bar.
    They will fight. That's the feature.
12. **Competitive: Market Share** — 2-4 players in one market with shared demand, real price
    competition, poachable staff and customers, and public reputation. Undercutting someone below
    their COGS is a valid, hilarious strategy.
13. **Asymmetric PvP: Host vs Attacker** — one player runs the company, the other runs a rival's
    dirty-tricks budget (booters, review bombs, affiliate poaching, staff poaching).
14. **Ironman / Permadeath** — one company, one life, cash never resets.
15. **Auditor Mode (post-game)** — replay a finished level as the diligence analyst, finding every
    shortcut the player took. A brilliant, cheap way to teach the systems.

### 9.2 Twists and meta ideas

16. **The Persistent Reputation Ledger** — reputation, customer relationships, staff, and your
    industry standing carry across the whole campaign. Level 3's shortcut is Level 9's deposition.
17. **Every Decision Has a Receipt** — the game silently logs your choices and surfaces them at Exit
    as diligence findings. "In year 2 you signed 14 contracts with unlimited liability. −0.4x."
18. **Alumni Effect** — staff you treated well and who left go on to run other companies; they show
    up later as partners, customers, or competitors with memory of how you managed them.
19. **The Customer Who Becomes a Competitor** — your best reseller eventually builds their own
    infrastructure and starts bidding against you. Modeled explicitly, with a window in which you
    could have acquired them cheaply.
20. **The Legacy Plan** — a grandfathered plan from level 2 that is still on your books in level 8,
    unprofitable, with 340 customers who will riot if you touch it. Every real host has one.
21. **Technical Debt as a Balance Sheet Item** — an explicit, quantified liability that accrues
    interest in the form of outage probability and slower build times. You can pay it down; it's
    never the most urgent thing; that's the trap.
22. **The Handshake Deal** — an undocumented promise made to a customer by a founder (you) in level 2
    that surfaces at Exit as an unassignable contract. Keep a ledger, or don't, and find out.
23. **Market Cycles** — a visible macro index. Cheap credit / expensive credit. Boom / bust. Hardware
    glut / shortage. Buying counter-cyclically is the expert move and should be rewarded.
24. **The Competitor Obituary Feed** — an in-game news ticker where other hosts go bankrupt, get
    acquired, or get deplatformed, with one-line causes. Free tutorialization, great flavor, and it
    makes the world feel populated: *"LowEndVPS.biz shut down after a chargeback ratio breach."*
25. **Post-Mortem Publishing as a Minigame** — after an incident, write the post-mortem by picking
    from honesty/blame/detail options. Honest and detailed heals reputation; blaming a vendor or
    saying "a third party experienced an issue" makes it worse. Short, funny, teaches a real lesson.
26. **The Status Page Personality** — choose your incident-comms voice (corporate / human / jokey).
    Affects reputation damage differently per customer segment. Developers love a human voice;
    enterprise buyers do not.
27. **The Support Ticket Reader** — occasionally show an actual ticket in full. The humor writes
    itself ("my website is down" from a customer who hasn't paid in four months; "can you install
    a plugin that makes it faster"; "URGENT!!! my domain expired and it's your fault").
28. **The RFP Minigame** — answer a 200-question security questionnaire by allocating staff hours;
    the questions you can't answer honestly are the compliance gaps you skipped.
29. **The Broker Lunch** — a colo-level event where you spend money on relationship-building with
    brokers and it *actually works*, because it does.
30. **Conference Booth Builder** — a tiny, silly customization of your trade-show booth with real
    lead-gen consequences. Swag quality matters. It genuinely does.
31. **The "Unlimited" Trap** — offering an unlimited plan is available from level 2 onward. It always
    spikes signups. It always ends badly. Players will do it anyway, exactly like the industry did.
32. **The Migration Weekend** — an optional high-intensity timed sub-level where you cut over a big
    customer. Success = a case study and expansion. Failure = a public post-mortem.
33. **Named Disasters** — recurring named events with escalating versions across the campaign, so
    players build institutional memory: "Breaker Trip," "The Tuesday Deploy," "Fuel Truck Friday."
34. **The Advisor Voicemail** — your mentor leaves short voicemails commenting on your metrics.
    Dry, dead-on, occasionally brutal: *"Saw your renewal pricing. You're going to have a great
    quarter and a terrible year."*
35. **Achievements that are business truths** — "Ramen Profitable" (first month of positive cash
    without financing), "Net Negative Churn" (NRR > 100%), "Fired a Customer," "Never Missed
    Payroll," "Read the Contract," "Tested a Restore," "Sold the Cost Center" (turned an internal
    tool into a product line), "Boring and Rich" (finish a level with zero incidents and top-quartile
    margin), "The Whale Stayed."
36. **Failure is Narrated, Not Punished** — losing a company produces an obituary page with the real
    cause, and the next run starts with one carried-over lesson (a small permanent unlock). The
    industry is full of second and third companies by the same founder; the game should be too.
37. **The Ledger Export** — let players export their run as an actual P&L and cohort table. A niche
    feature that this audience will adore and post screenshots of.
38. **Real-World Difficulty Presets Named After Eras** — "2005: Everyone Is Making Money,"
    "2013: The Price War," "2023: Capital Is Expensive."
39. **Cameo Customers** — generate customer names and site types procedurally with era-appropriate
    flavor (a webring, a Geocities-alike, a forum, a crypto exchange, an AI wrapper startup). Their
    business type predicts their traffic shape and their survival odds — so *reading your customers'
    businesses* becomes a forecasting skill.
40. **The Hardest Lesson, Delivered Once:** somewhere in the mid-campaign, give the player a level
    they can only win by **raising prices and losing customers**. It is the single most
    counterintuitive, most real, most valuable move in the hosting business, and no game has ever
    made a player feel it.
