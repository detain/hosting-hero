# Wave 2 — CEO / Marketing lens (informed)

*Written after reading `BRIEF.md` and the full merged `hosting_game.md` (§0 foundations, §1 levels,
§2 threats incl. §2.10 business threats, §3 visitors/clients, §4.8–4.10 staff + business machine,
§5.5–5.8 tech tree + line unlocks, §6 economy in full, §7.5 tempo, §9.1–9.2 modes and twists, plus
the headings of everything else).*

**What the document already does well, so I don't re-litigate it.** The business layer is not an
afterthought here: P8 ("the business is the other half of the game"), P10 ("almost nothing you do has
an immediate result"), §4.9 (billing/support/legal/finance as buildables), §6 (two ledgers, 95th
percentile, CAC payback, cost-to-serve, deferred revenue, dunning, oversell, per-type revenue shapes,
valuation-as-diligence-report), and §2.10 (chargebacks, processor termination, involuntary churn,
concentration whale, vendor squeeze) are all present and mostly *right*. This report therefore does
not re-propose "add churn" or "add SLA credits." It goes after the parts of a real hosting P&L that
the document either doesn't model at all, or models the way an engineer imagines a business rather
than the way one actually runs.

**Five theses that organize everything below.**

- **T1 — Hosting is billed in terms, not in months.** The document repeatedly assumes monthly billing
  (§6.6's "cash timing" column, §6.4's invoice calendar). Almost no real hosting revenue works that
  way. Shared hosting is sold as 12/24/36-month prepay with a renewal cliff. Colo is a 3–5 year term
  billed monthly in advance with an annual escalator and a *ramp schedule*. GPU is 1–3 year reserved
  with prepayment, and spot is the leftovers. VoIP is MRC + per-minute settlement. **Term structure is
  the single biggest missing mechanic in §6**, and it changes cash, churn, valuation, and how a pivot
  feels.
- **T2 — Revenue has a colour, not just a size.** $10k of MRR from 400 shared accounts on deal-forum
  coupons, $10k from one colo cabinet on a 5-year term, and $10k of GPU spot are three completely
  different assets with different margins, different churn, different support load, and different
  valuation multiples. The HUD shows one MRR number. It should show *composition*.
- **T3 — The contract is a tower.** §3.9 has "SLA Contracts" as a single toggle. In reality the
  liability cap, the credit cap, the claim window, the maintenance exclusion, the auto-renew clause,
  the escalator, the MFN clause, the audit right, and the assignment clause are each a separately
  buildable, separately negotiable defense — and each one you *don't* have is how a bad month becomes
  a bad year.
- **T4 — Money you can't touch is not money.** Rolling reserves, escrow holdbacks, deferred revenue
  you already spent, AR that's 75 days out, security deposits you're holding for tenants, capitalized
  fit-out you recover over 60 months, and backlog that's signed but not installed. The game has one
  cash number. A real operator has about six, and only one of them pays payroll.
- **T5 — A pivot is a double-carry, not a switch.** §1.4's `Pivot` level and §5.6's line unlocks treat
  changing business type as a research purchase. In practice you carry the dying line's contracts,
  hardware leases, licences, and staff to term *while* funding the new line — 12 to 24 months of
  paying for two companies. That overlap is the actual drama of a pivot and nothing in §1.4 models it.

---

# PART A — NEW IDEAS

---

## 1. Levels, scenarios, and progression

### `The Rate Card`
A whole level where you never place a server: you build the price book.

**How it works:** You're handed your real cost inputs — server capex and depreciation, blended
bandwidth cost per Mbps, power at $/kWh × PUE, licence per account, support minutes per account per
month × loaded hourly rate, payment-processing take, and a CAC figure per channel. You must author a
rate card: how many plans, at what price, at what term (monthly / 12 / 24 / 36), with what renewal
price, what's included, what's an add-on. The level then *simulates twelve months* against that card
in ninety seconds and shows you the resulting mix, margin, churn and support load. You get three
attempts and must ship one.
**Why it's a level and not a menu:** every operator's first real crisis is discovering their $2.95
plan is unprofitable at ticket volume, and the only way to feel that is to have authored the number
yourself.
**Interacts with:** §4.9 Pricing Engine (this is that object, promoted to a level), §6.3
cost-to-serve, §6.5 packaging, §3.5 archetypes (the card decides which archetypes show up at all).

### `Due Diligence` (the level where you are the one being read)
Not `Sell the Company` (§1.5, which is about the twelve months before). This is the eleven weeks after
the LOI.

**How it works:** A buyer's analyst NPC sits in a data room and issues **requests**, not attacks. "Send
us MRR by customer for 36 months." "Reconcile your billing system to your bank statements." "List every
customer with a change-of-control clause." "Provide your last three years of tax filings." "Explain the
$41k of revenue in the P&L that isn't in the billing system." Each request costs hands and time; each
one you can't satisfy becomes a **finding**, and each finding either knocks a turn off the multiple,
moves money into escrow, or converts purchase price into an earnout. The level is won on final
*proceeds*, not headline price.
**The joke and the lesson:** everything you skipped for five levels — documentation, clean books,
signed contracts, a customer list that matches the invoices — is now literally line-itemed against you.
**Interacts with:** §6.9's diligence report (which becomes the *output* of this level), §9.2 "The
Investor Dashboard Lie," §6.7 acquisition offer.

### `The Ramp`
A colo/wholesale level built on a contract shape nobody has modelled.

**How it works:** You sign a tenant for 20 cabinets — but colo deals ramp. Cabinets 1–4 bill from
month 1, 5–10 from month 7, 11–20 from month 13, with a 3-month free-rent concession at the front and
a tenant-improvement allowance you pay up front. Meanwhile you must *reserve* all 20 cabinets' power
and space from day one, so you're carrying 16 empty cabinets of stranded capacity for a year, against
a lease you already signed with the utility. Then the tenant asks to **delay the ramp** because their
own project slipped. Do you hold them to the take-or-pay, or preserve the relationship?
**Failure texture:** you sell a second tenant into the reserved space to stop the bleeding, the first
tenant's ramp accelerates, and you can't deliver.
**Interacts with:** §6.6 occupancy/stranded capacity, new "Take-or-Pay" mechanics below, §1.3 "Amps
and Aisles."

### `Interconnect Queue`
The single most real constraint in datacenter in 2024–2026, and it is not in the document at all.

**How it works:** You have customers, capital, and land. You do not have **power**, because the
utility's interconnection queue for a new 10MW service is 30–48 months. The level is played on a
calendar, not a floor plan: you can (a) wait, (b) buy an existing site with energized power at 3× the
price, (c) take a smaller interim service and phase, (d) go behind-the-meter with on-site generation
(expensive, permit risk, emissions limits on runtime hours), or (e) buy a competitor *for their
substation capacity* rather than their customers. Meanwhile your signed backlog has install-date
penalties.
**Why it's great:** it makes "capacity" a thing you queue for years ahead, which is exactly the
altitude shift Tier 5–6 needs, and it's a resource nobody can buy their way out of with cash alone.
**Interacts with:** §1.1 Tier 6, §6.6 power as a product, the Backlog mechanic below.

### `Rolling Reserve`
A cash-flow horror level with no attacker in it.

**How it works:** After a chargeback spike (or just after being reclassified into a higher-risk
merchant category), your processor imposes a **rolling reserve**: they hold 10% of every card
settlement for 180 days. Your revenue is unchanged. Your *cash* drops 10% immediately and the held
money comes back on a six-month delay, so you are effectively lending your processor half a month of
revenue, permanently, starting now. You must survive the trough: annual prepay push, ACH/wire migration
for your larger accounts, a second acquirer, invoice factoring, or cutting spend.
**Failure texture:** you can be growing, profitable, and fully booked and still miss payroll.
**Interacts with:** §2.10 Processor Termination (this is the *stage before* it, and much more common),
§6.4 cash mechanics, §6.11 financing.

### `Debanked`
A darker cousin. Your *bank*, not your processor, exits the relationship.

**How it works:** A compliance review at your bank flags your merchant category, your international
wire volume, or one customer's industry. You get a 30-day notice to close the account. Every ACH
mandate, every direct debit, every vendor payment instruction, and your payroll run are attached to
that account number. The level is a migration under a clock where the thing being migrated is money
plumbing, and the failure mode is that 40% of your direct-debit customers' mandates don't re-authorize.
**Hosting types:** endemic to bulletproof, crypto-adjacent, adult, and anything paid in crypto; a rare
event elsewhere.
**Interacts with:** §6.10 lose conditions (add "no banking relationship" as a distinct one), §1.3
bulletproof.

### `In Scope, Out of Country` (export control)
The regulated-hosting ruleset applied to GPU, which is where it actually bites now.

**How it works:** Your GPU line's cards are export-controlled. A customer signs up, prepays, and runs
jobs. Your job is to determine *who is actually using the compute*: the entity, the beneficial owner,
the country the API calls come from, and whether they're a front. Tools: KYC on signup (kills
conversion), geo-attestation (customers hate it), contractual attestations (worthless but cheap),
and an actual compliance officer (expensive, slow, correct). The threat isn't a hacker; it's a
**subpoena eighteen months later** and a penalty scaled to revenue.
**The tension the level exists for:** your highest-paying customer is the one you're least sure about,
and turning them away is a visible, immediate, quantified revenue loss against an invisible, delayed,
enormous risk. That's the whole job.
**Interacts with:** §1.3 GPU level, §2.12 GPU threats, §4.9 compliance vault.

### `Column Fodder`
An RFP level you are structurally going to lose, and the skill is figuring that out fast.

**How it works:** Five RFPs land. Each costs pre-sales engineering hands to respond to (a real cost:
40–120 hours of senior time for a serious enterprise response). Hidden stats: incumbent present /
absent, spec written *from the incumbent's datasheet*, procurement's required-vendor-count (they need
three bids to renew the incumbent), budget already allocated to a competitor, and champion strength.
You can spend a small amount to *qualify* — one phone call that reveals one hidden stat. The win
condition is a positive return on pre-sales hours, which usually means **declining three of the five.**
**Why it's a level:** "no-bid" is the most valuable and least intuitive sales skill, and a game can
teach it in nine minutes.
**Interacts with:** §1.2 `The Sales Chair`, §1.5 `The RFP`, new Bid Desk buildable.

### `Two Brands, One Datacenter`
The fighter-brand level. Newfold/EIG's actual strategy, made playable.

**How it works:** You run a premium brand and a budget brand on shared infrastructure. Each has its
own storefront, price book, support SLA, support queue, and reputation stat. The budget brand exists
to absorb price-war pressure without touching the premium brand's rate card. Rules: they must not
share a support queue (or the premium customers get budget response times), must not share a status
page (or the budget brand's outages appear on the premium brand's record), and **must not be publicly
linked** — a journalist or a WHOIS/AS lookup can connect them, and if the premium customers find out
they're on the same hardware as the $2 plan, you eat a trust event.
**Win condition:** survive a 40% price cut from a competitor without moving the premium price.
**Interacts with:** §2.10 The Price War (this is the correct answer to it), §3.8 positioning, §8's
visual language (two storefronts).

### `Price Increase Day`
The most terrifying ordinary day in a subscription business.

**How it works:** You need +12% on the base. Decisions: who's exempt (grandfathered), notice period
(30/60/90 days — contractually mandated for some), whether to increase at renewal only or across the
board, whether to pair it with added value (a free backup tier) or take it naked, whether sales gets
discount authority to save accounts, and what the save-desk script is. Then you watch the response
arrive over ninety in-game days as a wave: tickets on day 1–3, cancellations clustering at each
customer's renewal date over the following twelve months, a review spike, and one competitor running
a "switch from [you]" campaign within a week.
**The cruelty:** revenue goes up immediately and churn arrives for a year, so the level's score is
only visible at the *end of the next level.*
**Interacts with:** §6.5 grandfathering, §1.5 `The Price Hike` (which is the *vendor* doing it to you —
this is you doing it to them), P10.

### `The Insurance Renewal`
Your cyber insurer's underwriting questionnaire, as a level.

**How it works:** Renewal is in 30 days. The carrier's requirements have changed: MFA everywhere,
EDR on every endpoint, immutable/offline backups with a tested restore in the last 12 months, a
written incident response plan, and no end-of-life operating systems in scope. You must reach that
*state* (a compliance-level ruleset, §1.2 `The Auditor`, but the clipboard is an actuary) or be
non-renewed, which cascades: several enterprise contracts require you to carry cyber cover, so losing
insurability loses customers.
**Why it's brilliant:** it converts "boring ops hygiene" into a **contractual sales prerequisite**,
which is exactly what has happened in the real market and is a far better motivator than a security
score.
**Interacts with:** §4.9 Cyber-Insurance Policy, §2.9 patch lag, §4.5 defenses.

### `Revenue Assurance Week`
A level where the objective is to find money you already earned.

**How it works:** No threats. You audit your own billing: services provisioned but never billed,
upgrades applied but never repriced, promotional rates that were supposed to expire and didn't,
customers who cancelled but whose VMs are still running and costing you power, free/internal/comp
accounts nobody audits, bandwidth overages never invoiced, and cross-connects installed on a ticket
with no billing record. Every finding is real recovered MRR. Real hosts leak **2–5% of revenue** this
way; some leak 8%.
**Mechanically:** it's a hidden-object game played against your own asset database, and the reward is
a permanent MRR bump that costs nothing, which makes it one of the most satisfying levels possible.
**Interacts with:** new Revenue Assurance buildable, §5.4 asset discovery scan (same verb, money
target).

### `Metering Blackout`
You cannot bill what you cannot measure.

**How it works:** Your usage metering pipeline breaks — for GPU-hours, bandwidth, egress, or
invocations — and nobody notices for eleven days because the *service* is fine. Now it's the 1st.
Choices: estimate from the prior period (over-bills some customers, under-bills others, guarantees
disputes), skip billing the usage component (a clean 20% revenue hole this month), reconstruct from
partial telemetry (hands + time), or bill next month double (bill shock, §6.7). Whatever you pick,
a fraction of customers dispute and your DSO blows out.
**Interacts with:** §6.2 overage billing, §6.7 bill shock, new Metering & Rating Engine buildable.

### `Consent to Assignment`
An acquisition level where the customers can legally refuse to come with the deal.

**How it works:** You buy a competitor. Their enterprise and government contracts contain
change-of-control clauses requiring the customer's written consent to assignment. You have 60 days to
collect consents. Each one is a conversation: they'll consent if you commit to the existing price for
24 months, or add an SLA, or fly out and meet them. Consents you don't get either terminate or revert
to month-to-month at the customer's option — and the ones who revert are exactly the big ones.
**The reveal:** your purchase price was computed on revenue you may not actually be buying, which is
why escrow and earnouts exist.
**Interacts with:** §1.2 `The Acquisition`, §1.5 acquisition scenarios, §6.11 seller financing.

### `The Sunset Letter`
You are deprecating a platform 4,000 customers live on.

**How it works:** Write the letter (tone is a mechanic: apologetic / factual / opportunistic),
choose the runway (90 / 180 / 365 days), choose the migration incentive (free migration, price freeze,
a credit), and then run the migration wave while the letter itself generates a churn pulse, a press
pickup, and a competitor campaign aimed directly at your sunset date. The optimal answer is almost
always *longer runway, better incentive, less money now*, and the game should let players discover
that by getting it wrong once.
**Interacts with:** §5.7 deprecation mechanic, §1.6 The Ratchet, §1.5 `The Price Hike`.

### `The Recommended Host`
The most valuable acquisition channel in real hosting, and it's not in the document.

**How it works:** A major platform (a CMS foundation, a framework, a game publisher, a control-panel
vendor) maintains a short "recommended hosts" list. Being on it is worth more than every ad channel
combined and costs a mix of money, engineering contribution, dedicated support commitments, and
**political relationship management**. The level: win the slot. Requirements are a mix of measurable
(performance benchmarks on their test suite, uptime history, support response SLA) and unmeasurable
(sponsorship, contributing engineers upstream, not being the host that generated their worst support
thread last year). You can also be *removed* from the list, which is a cliff.
**Interacts with:** §3.6 attraction channels, §5.6 line unlocks, the new "Platform Partner Pivot"
threat.

### `The Partner Turns`
The follow-up, three levels later: the platform launches its own hosting product.

**How it works:** Overnight, your best channel is your biggest competitor, with distribution built into
the product your customers already use. Responses: differentiate on support and specialization, go
multi-platform, acquire a competitor on a rival platform, or become an OEM supplier *to* the platform
(sell them wholesale capacity and give up the customer relationship — profitable, safe, and a slow
death). There is no good answer, which is the point, and it is exactly what happened to every
WordPress host, every Shopify-adjacent host, and every VoIP reseller.
**Interacts with:** §2.10 Hyperscaler Free Tier (same family, different mechanism), §9.2 "the customer
who becomes a competitor."

### `Ratio`
A peering level about a rule nobody outside networking knows.

**How it works:** You apply for settlement-free peering with a large eyeball network. They evaluate
you on **traffic ratio** (they want roughly balanced in/out) and you are a hosting company, so you're
wildly outbound-heavy — 20:1, say. You're denied. Now you can: pay for paid peering (cheaper than
transit, more than free), buy transit through someone who *is* peered, acquire or launch an
inbound-heavy business line to rebalance your ratio (a backup line ingests enormous inbound — a
genuine, real, and delightful synergy), or route around them and eat the latency. **A business-line
synergy that exists purely for a networking policy reason** is exactly the kind of truth this game
should ship.
**Interacts with:** §0.2 Line Synergies, §4.4 IX/peering, §6.3 bandwidth.

### `Take-or-Pay`
A contract-shape level.

**How it works:** You sign a customer to a minimum monthly commit — they pay for 400 Mbps whether they
use it or not, or 10 cabinets, or 200 GPU-hours. Then they use 40% of it. Every month you book pure
profit on unused commit *and* watch their satisfaction meter drain, because paying for nothing is how
customers decide to leave. At renewal they demand a right-size and a credit for the unused portion.
**Do you enforce the contract or protect the renewal?** Meanwhile you signed a take-or-pay of your own
with your transit provider, sized for a customer who's using 40%.
**Interacts with:** §6.2 revenue, §6.6 contract length, §3.9 client cards (add a `commit` field).

### `The Nexus Letter`
A tax level, and funnier than it sounds.

**How it works:** A letter from a state/country tax authority: you've exceeded the economic nexus
threshold and owe sales tax/VAT on three years of past sales you never collected. You can: register
and remit going forward and negotiate a voluntary disclosure agreement on the back taxes, ignore it
(the balance compounds with penalties), or geo-block that jurisdiction (lose the revenue). Then the
real work: your billing system doesn't support per-jurisdiction tax, so every invoice template,
every plan price ("is $5 tax-inclusive?"), and every EU customer's VAT-ID validation becomes a
project. **Paperwork as a boss fight**, and it's how a lot of small hosts first meet an accountant.
**Interacts with:** §2.10 Tax Nexus Creep (this is that entry promoted to a scenario), new Tax Engine.

### `The Agent`
A channel level built on the telecom master-agency model, which is enormous and completely absent.

**How it works:** Independent agents/master agencies sell colo, VoIP, transit and managed services on
**residual commission for the life of the contract** (typically 10–20% of MRC, forever, paid monthly).
They bring you deals you'd never see. They also: own the customer relationship, shop the same customer
to three of your competitors simultaneously, demand you honour their commission after the customer
renews with you directly, and will move their whole book if your commission portal is bad. Winning the
level is signing agents, not customers.
**The twist:** agent-sourced revenue has a permanently lower margin and a permanently higher renewal
risk, and it looks identical to direct revenue on the MRR chart — which is exactly the "revenue has a
colour" thesis (T2) in level form.
**Interacts with:** §3.6 partner/reseller channel, new Deal Registration buildable.

### `Repatriation Season`
The market-tailwind level.

**How it works:** A wave of prospects arrives who are leaving a hyperscaler over cost. Each one comes
with: a 3-year TCO spreadsheet they built themselves (which you must engage with, line by line, in a
negotiation minigame), an unexpired **committed-spend agreement** that penalizes them for leaving
early (so the deal can't close for 7 months — you must nurture a lead on a calendar), egress fees to
escape (which *you* may offer to pay, a real and effective tactic), and an engineering team that has
forgotten how to run infrastructure and will generate 4× normal support load for six months.
**Win condition:** net-positive contribution margin in month 12, not signed ARR.
**Interacts with:** §3.2 Enterprise Evaluator, §3.6 migration concierge, §6.3 CAC.

### `The Book Sale`
You sell *part* of the company: one customer book, one line, one region.

**How it works:** Divesting the shared-hosting book to fund the GPU build. Mechanics: which customers
transfer (some contracts don't assign), what you keep (the domains? the IP space? the brand?), a
non-compete that locks you out of that segment for 3 years, TSA (transition services agreement — you
run their platform for them for 9 months, for a fee, with your staff, which is a hidden cost), and
the staff who came with the line and now have nowhere to go.
**Why it belongs:** §3.9 has "The Controlled Shrink" as a one-liner. It deserves a level, because
selling a line is how most hosting pivots are actually financed.
**Interacts with:** §1.4 `Pivot`, §5.6 portfolio unlocks, §6.11 financing.

### `Collections Week`
Six figures of aged receivables and a decision tree per account.

**How it works:** Every delinquent account is a card with: amount, age bucket, relationship value,
whether they're still consuming resources, whether they have your data hostage or you have theirs,
and a hidden "can actually pay / can't pay / won't pay" flag. Actions: reminder, phone call, payment
plan, suspend, terminate, send to a collections agency (they take 25–40% and burn the relationship
permanently), sue (costs more than the debt below ~$25k), or write it off. **Suspending a big
delinquent customer guarantees you'll never be paid** — the correct move is often a payment plan that
keeps them alive, which feels wrong and is right.
**Interacts with:** §4.9 Collections Desk, §2.10 The Deadbeat Cohort, §6.4 AR aging.

### `The QBR`
A quarterly business review with your largest account, as a 6-minute set piece.

**How it works:** You present: uptime against SLA, incident summary, ticket volume and response times,
capacity trend, roadmap. They present: their gripes, their growth plans, and — in the last two
minutes — a competitor's quote. You have a small budget of concessions (a credit, a free upgrade, a
named engineer, a price hold) and a hidden churn-risk number you're trying to move. **The lesson: the
account you never talk to is the account you lose**, and the QBR is cheaper than the save offer.
**Interacts with:** §4.8 Account Manager, §2.10 Concentration Risk Whale, §3.7 Grudge Meter.

### `Backlog`
A level scored on installed MRR, not signed MRR.

**How it works:** Sales has sold well. You have $180k of signed-but-not-installed MRR sitting in a
queue. Each order needs: hardware (lead time), rack space, power, an IP allocation, provisioning
hands, and a customer who actually returns your emails to schedule the cutover. Every month an order
sits in backlog is a month of revenue you'll never get, plus install-date penalties on the ones with
committed dates, plus the risk the customer cancels. Meanwhile sales keeps selling, because sales is
compensated on bookings.
**The systemic joke:** your two departments are optimizing different numbers, and the game makes you
watch it.
**Interacts with:** new Backlog Board mechanic, §4.9 sales comp, §6.8 metrics HUD.

### `Offshore`
A support-economics level that should be handled with care and honesty.

**How it works:** Support cost is eating your margin. You can stand up a support pod in a lower-cost
region: cost per ticket drops from ~$9 to ~$3, but ramp time is 90 days of *worse* service, timezone
coverage improves, some customer segments (US small-business phone customers especially) react badly,
and the knowledge that used to live in three senior people's heads now has to exist as written
runbooks or it doesn't transfer. **The mechanic is that offshoring only works if you already did the
documentation work**, which is a real and non-obvious truth.
**Tone note:** the joke is never the offshore team; the joke is the executive who thinks headcount is
fungible.
**Interacts with:** §4.8 staff, §9.2 documentation as a mechanic, §6.3 support cost-to-serve.

### New rungs for the parallel business ladder (§1.1)
- **L0 — "The Side Hustle."** You have a job. Hosting is nights and weekends. Your constraint isn't
  cash, it's *your own hours*, and the level is about whether to quit. Introduces opportunity cost
  before it introduces money.
- **L5.5 — "The Book Buy."** Before the full roll-up, you buy one small competitor's 300-account book
  for 12× monthly revenue, and learn what 30% post-migration churn feels like at small scale.
- **L11 — "The Platform."** Late-game: you stop selling hosting and start selling *wholesale capacity*
  to other people who sell hosting. Enormous volume, no brand, no support burden, and total
  dependence on a handful of customers who could build it themselves.

### Progression mechanics
**The Multiple (a persistent meta-stat).** Carry a valuation multiple across levels, visible on the
company ledger, that rises with contract length, revenue diversification, documented processes,
audited financials, gross margin, and NRR — and falls with concentration, month-to-month revenue,
key-person risk, and litigation. **It is a score you can see and act on for the whole campaign**,
and it makes boring decisions (sign longer terms, diversify, document) feel like they're building
toward something. The Exit (§1.6) cashes it in.

**The Book of Business as the save file.** Your campaign save isn't "cash and unlocks," it's a
customer list with names, MRR, tenure, term end-date, and grudge. Levels hand you that list. Losing
a level doesn't reset it; it *shortens* it.

**The Contract Calendar as a progression gate.** Instead of MRR gates (§1.6), some levels unlock when
a threshold of your revenue is under contract with more than N months remaining. Forces the player to
learn that *contracted* revenue and *recurring* revenue are different things.

**Ramp-up debt.** Every acquisition channel you turn on has a ramp: content is 6 months, SEO 9–12,
outbound sales 4–6 (hire, train, pipeline, close), partners 6–9. Turning a channel *off* is instant.
So the strategic shape is: channels are expensive to start, free to stop, and impossible to restart
quickly — which makes cutting marketing in a crunch a genuinely irreversible-feeling decision.

---

## 2. Threats

*All framed per §2.10's rule — damage denominated in money, reputation, and cash timing.*

### Rolling Reserve Imposition
A processor risk-review outcome that is far more common than termination and far less known.

**How it works:** Triggered by chargeback ratio drift, a revenue spike (growth looks like fraud), a
category reclassification, or one customer's industry. The processor withholds 5–10% of settlements
for 90–180 days. **Revenue unchanged, cash down immediately, and the held balance only unwinds if you
keep processing.** If you switch processors, the old one holds your reserve for the full term anyway.
**Counter:** ACH/wire migration, annual prepay push, a second acquirer under a second entity, and a
chargeback-prevention service (Ethoca/Verifi-style alerts that refund before the dispute posts).
**Visual:** a locked cage inside your vault holding a visible slice of every incoming coin.

### Merchant Category Reclassification / Debanking
Your bank or processor decides what industry you're in, and they're not wrong.

**How it works:** One line of business (bulletproof, crypto-adjacent, adult, streaming, "unlimited
seedbox") reclassifies your whole entity as high-risk. Rates go from 2.9% to 4.5–6%, reserves appear,
and eventually the bank exits. **The counter is structural, not operational: separate legal entities
per risk class**, which is a buildable (see §4) and which the player will not think to build until
after this has happened once.
**Interacts with:** §1.3 bulletproof, the new Entity & Ring-Fence buildable.

### Revenue Leakage (ambient, §2.2-band weather)
A permanent, invisible, compounding drain that looks like nothing.

**How it works:** A small percentage of every provisioning action, upgrade, and one-off fails to reach
the billing system. It accumulates silently at ~0.2–0.5% of MRR per month and is only visible if you
build Revenue Assurance. **The best possible "weather" threat for the business layer** — it makes
"zero alerts" impossible on the money side exactly as scanners do on the security side, and it
teaches that the billing system is a production system.

### The Unbilled Upgrade
A specific, funny, very real instance of the above.

**How it works:** A support engineer helpfully doubles a customer's RAM during an incident and never
opens a billing change. Eleven months later you find it. Now what — backbill (they'll dispute and
you'll look incompetent), start billing forward (an awkward email), or eat it? **The correct answer
is almost always to eat it and fix the process**, and the game should make eating it cost real money
so that the *process* fix feels earned.

### Demand Charge Ratchet
The electricity billing rule that quietly bankrupts new datacenter operators.

**How it works:** Commercial power bills have a **demand charge** based on your highest 15-minute
peak — and many tariffs **ratchet**: your peak sets a floor on your billed demand for the *next eleven
months*. So one badly-timed load test, one simultaneous generator-test transfer, or one GPU pod
synchronizing its ramp sets your power bill for a year. You did not use more energy. You used it in a
worse shape.
**Counter:** peak shaving with battery/UPS discharge, staggered job scheduling, power capping,
negotiating a different tariff, or on-site generation during peak windows.
**Visual:** a high-water-mark line drawn across the power gauge that only ever moves up, with a
countdown of months until it resets.
**Interacts with:** §2.8 power, §6.6 demand response (the friendly twin), §1.3 GPU.

### The Energy Hedge Goes Underwater
A commodity risk nobody models.

**How it works:** You fixed your power price for 24 months to protect your colo margins. Wholesale
prices then *fall* 40%, your competitor down the street signs at the new rate and undercuts your
per-kW pricing, and you're locked in. The mirror: you stayed floating and prices doubled, and your
customers are on fixed contracts with no pass-through clause.
**The real counter is a clause, not an operation:** a power pass-through clause in your customer
contracts. Which is a tower in §4.
**Interacts with:** new Energy Hedge / PPA buildable, §6.6 power as a product.

### The Landlord's Lender
You do not own your building, and neither, increasingly, does your landlord.

**How it works:** Your colo provider (or your own landlord) defaults. The building goes into
receivership. Nothing breaks — for a while. Then: capital projects stop, the chiller that needed
replacing doesn't get replaced, remote hands staffing is cut, and the new owner's leasing team wants
to reprice your renewal at market. You have no operational control and no counterparty who cares.
**The most helpless business threat available**, and it's the commercial twin of §2.10's Upstream
Bankruptcy.

### The Platform Partner Pivot
Your distribution channel becomes your competitor. (See `The Partner Turns` above.)

**How it works:** Modelled as a slow debuff: the channel's lead flow declines 15% per month for six
months, your listed position on their marketplace drifts down, and their support agents start
recommending their own product. There is no combat counter; only diversification you should have
built earlier.

### The Core Update
An organic-search apocalypse with no cause you can inspect.

**How it works:** A search-engine algorithm update halves your organic spawn rate overnight. It is not
your fault, it is not your uptime, and there is no ticket to open. Recovery takes 3–9 months if it
happens at all. The *mechanical* point is that a channel you built over a year can be removed by a
third party in a day — the same lesson as the affiliate betrayal and the platform pivot, in a third
costume, which is how you teach "diversify channels" without a lecture.
**Counter:** channel diversification, direct/brand traffic (the only defensible channel), and an
email list you own.
**Interacts with:** §3.6 SEO Garden (the garden gets hailed on).

### Affiliate Clawback Wave & Coupon Hijack
Two specific, expensive affiliate-channel realities.

**How it works:** (a) **Clawback:** affiliates are paid on signup, but commissions reverse if the
customer refunds or cancels inside 45–90 days. An affiliate who drives volume of *bad* customers
generates commission payouts that you claw back — badly, slowly, and while they publicly complain.
(b) **Coupon hijack:** a coupon site gets last-click credit for customers you already acquired, who
went looking for a discount code at checkout. You pay $110 CPA for customers you had. Both are
invisible without attribution tooling, and both are enormous in real hosting.
**Counter:** attribution windows, coupon-site exclusion from last-click, holding commission for 60
days, and quality-adjusted commission tiers.
**Interacts with:** §3.6 affiliate pipeline, §2.10 The Affiliate Betrayal.

### The Word "Unlimited"
A marketing decision that becomes a legal one.

**How it works:** You shipped an "unlimited" plan (§4.9's explicit trap). Eighteen months later: a
consumer-protection complaint, a class-action letter, or an advertising-standards ruling. Damage is
legal cost + a mandated refund program + rewriting every marketing page + a press cycle. Also
triggered by auto-renewal laws that require a one-click cancel path you never built.
**Counter:** fair-use policy written *before* launch, a visible cancel flow, and honest packaging —
all of which lower conversion at the moment you ship them.

### The Security Questionnaire Treadmill
An attention-drain threat aimed at your engineers, not your servers.

**How it works:** Each enterprise prospect sends a 300-question security questionnaire in their own
format, plus a pen-test report request, plus a vendor-risk portal registration, plus an insurance
certificate, plus a supplier-diversity form. Each costs 8–20 senior engineering hours. Five
simultaneous prospects consume an entire engineer for a month. **Answering them does not close deals;
not answering them loses deals.**
**Counter:** a Trust Center buildable (pre-answered, evidence-linked, self-serve) that converts a
20-hour task into a link. Measurable effect: enterprise sales cycle shortens by weeks.

### The AI Agent Incident
A 2025-era threat that belongs in a modern version of this game.

**How it works:** You deployed an AI support agent (a real buildable below). It deflects 35–50% of
tickets and saves real money. Then it confidently tells a customer to run a destructive command,
or promises a refund policy that doesn't exist, or leaks another customer's ticket context into a
reply. Damage: one catastrophic ticket, a screenshot, a viral thread, and a permanent asterisk on
your support reputation.
**Counter:** scope limits, no-write-actions policy, human review above a confidence threshold,
and disclosure that it's a bot (which reduces deflection, because customers immediately type "agent").
**Interacts with:** §4.9 ticket router, §2.10 the influencer complaint.

### The Most-Favoured-Nation Clause
A contract landmine that detonates on a *later* deal.

**How it works:** A big customer made you sign an MFN: they get your best price. Two years later you
discount aggressively to win a new logo, and the MFN customer's price automatically drops, retroactively,
across their whole footprint. One discount reprices your largest account. **The threat is a clause you
signed and forgot**, which is the purest possible expression of P10.
**Counter:** the Deal Desk buildable, which flags clause interactions before you sign.

### The Audit Right
Your enterprise customer can audit you, and this year they will.

**How it works:** A right-to-audit clause is exercised: the customer's team (or their auditors) show up
for three days and want evidence, tours, logs, and interviews. It consumes your senior staff entirely,
it finds things, and remediation is contractual. It is not a compliance audit; it's a *customer* audit,
and refusing is a breach.

### The Distributor Credit Hold
The supply-side twin of your own collections problem.

**How it works:** You buy hardware on net-30 from a distributor with a $250k credit line. One slow
month, one late payment, and they put you on **credit hold**: no shipments until the balance clears,
and future orders are prepay/COD. Your install backlog stops. **Your suppliers can strangle your
growth faster than your customers can.**
**Counter:** vendor diversity, a deposit, paying early to build terms, or equipment financing that
pays the vendor directly.

### The Earnout Dispute
Post-acquisition, on both sides of the table.

**How it works:** You sold (or bought) with an earnout tied to retained revenue. The definitions
matter enormously: is a customer "retained" if they downgraded? If they moved to a different product?
If they churned because the *buyer* migrated them? Both parties now have a financial incentive to
interpret the same events differently, and the relationship poisons. A great late-campaign narrative
threat with no combat in it at all.

### The Poison-Pill Customer
A customer whose existence blocks your exit.

**How it works:** A buyer's diligence flags one of your customers — the bulletproof holdover, the
sanctioned-jurisdiction account, the one with unlimited liability in their contract, the one who is
34% of revenue. The deal is conditional on removing them. **Your most profitable customer is now the
reason you can't sell**, and firing them takes 90 days of notice you may not have.

### Employee Misclassification / Contractor Audit
A payroll-shaped audit.

**How it works:** Your "contractors" — the night-shift remote hands, the offshore pod, the part-time
support crew — are reclassified as employees. Back payroll taxes, penalties, and a permanent cost
increase on a line item you'd optimized.

### FX Collapse in a Priced Market
You priced in local currency to win a market.

**How it works:** The currency moves 35%. Your revenue in that market, converted home, drops by a
third while your costs (hardware, transit, licences — all USD) don't move. Choices: reprice (churn
the market you just bought), hedge (costs money, needs volume), exit (write off the CAC), or eat it.

### Customs, Duties, and the Seized Shipment
A logistics threat for any level with a new region.

**How it works:** Your servers are stuck in customs for six weeks because the commercial invoice value
was wrong, or a licensing declaration is missing, or the encryption hardware needs a permit. Your
install backlog has committed dates. The fix is a customs broker (a buildable) and a very boring
person who fills forms correctly.

---

## 3. Visitors, traffic, and clients

### The Agent / Master Agency
A channel-partner *visitor* that the document's reseller model doesn't cover.

**How it works:** Arrives representing a customer, not themselves. Brings real, qualified demand. Costs
10–20% of MRC as a **residual commission for the life of the contract** — forever, including renewals.
Owns the relationship; if you annoy them, they move the customer. Simultaneously shopping the same
deal to three competitors, so you're bidding blind. **Mechanically it's a visitor that permanently
attaches a leak to any revenue it brings in**, which makes agent revenue visibly a different colour
of money (T2).
**Hosting types:** colo, VoIP, transit, managed services. Nearly absent in shared/VPS.

### The Column-Fodder Prospect
A visitor who was never going to buy.

**How it works:** Looks exactly like a high-value Enterprise Evaluator (§3.2). Walks the whole lane,
consumes pre-sales engineering hands, requests a proposal, and disappears. Their only function was to
give procurement a third quote. **The Mimic role (§2.4) applied to the sales funnel** — a
revenue-shaped unit that costs you attention and pays nothing. The tell is behavioural and only
visible if you built a qualification step: they won't give you a budget, a timeline, or access to the
technical buyer.

### The Incumbent-Locked Lead
A perfect customer whose contract ends in eight months.

**How it works:** Cannot convert now, at any price. Can be *nurtured* — a small recurring cost that
keeps a relationship warm across levels — and converts with high probability on their renewal date,
which the game shows on your calendar. **A lead with a timer measured in months** teaches pipeline
thinking better than any tutorial, and it makes the Contract Calendar a real object.
**Variant:** you can offer to **buy out their early-termination fee** (see §6), which converts them
now at a known cash cost — the highest-leverage competitive tactic in the industry.

### The Repatriator
A prospect leaving a hyperscaler.

**How it works:** Arrives with a spreadsheet and a grievance. High value, high expectations, blocked by
their own committed-spend agreement for N months, and expensive to onboard because their team has
forgotten how servers work. Their first ninety days generate 4× normal tickets. Converts to an
excellent long-tenure customer if you survive the onboarding.

### The ISV / OEM Embedder
A customer who resells you invisibly inside their own product.

**How it works:** A software vendor hosts every one of their customers on you and never tells them your
name. Enormous, single-invoice, low-touch revenue with a terrifying concentration profile, zero brand
benefit, and total dependence: if they build their own or get acquired, you lose the whole block in one
notice period. **A whale with a mask on.**

### The Credit-Risk Startup
A prospect you should make pay in advance.

**How it works:** Great logo, real usage, 6 months of runway, and a 12-month contract. Options: require
prepayment (they may walk), require a personal guarantee (they will walk), take a deposit, set a credit
limit with an auto-suspend, or take the risk. **Introduces the credit decision**, which no hosting game
has ever modelled and which every real host makes weekly.

### The Grant-Funded Lab
HPC/GPU-specific. Excellent customer, funded by a grant that ends on a known date.

**How it works:** Revenue with a published expiry. You can see the cliff on your calendar for two years
and must replace it before it arrives. A customer that teaches forecasting.

### The Procurement Portal
A non-human gatekeeper between you and a signed deal.

**How it works:** Before the enterprise customer can pay you, you must be onboarded as a supplier:
W-9/tax forms, insurance certificates at specified coverage levels, a supplier-diversity questionnaire,
banking verification (with a callback to prevent fraud), a code-of-conduct attestation, and a portal
account. This takes 30–60 days **after** the deal closes and before the first invoice can be submitted.
**Modelled as a delay between "won" and "paid" that surprises every first-time enterprise seller.**

### The Customer's Auditor / The Customer's Security Team
Two extra heads on the §3.2 Procurement Delegation.

**How it works:** The document's delegation has engineer / lawyer / CFO. Add the **security reviewer**
(satisfied only by evidence and certifications, not by charm) and the **insurance/risk officer**
(satisfied only by certificates of insurance at specified limits). Five heads, five meters, and the
comedy is that satisfying the CFO (cheaper) directly dissatisfies the security reviewer (more controls).

### The Banker
Your lender's annual review, arriving as a visitor.

**How it works:** Reviews your financials, your concentration, your contract terms, and your covenant
compliance. Outcomes: credit line increased, held flat, repriced, or pulled. **A visitor who grades
your bookkeeping.** Being unable to produce clean monthly financials is the failure mode, which
retroactively values the Accounting/FP&A buildable (§4.9).

### The Buyer's Analyst
See the `Due Diligence` level. As a visitor: walks your *documentation*, not your network.

### The Distributor Rep
A supply-side visitor with a personality (§9.2's vendor personalities, given a body).

**How it works:** Shows up at quarter-end desperate to move inventory at a discount — which is a real
and reliable way to buy hardware cheaply if you have cash and flexibility on spec. The mechanic:
**vendors have quarters too**, and a patient buyer with cash gets 8–15% off in the last two weeks of
one.

### New client-card fields (extends §3.9 Client Cards)
The client card should carry the commercial reality, not just the technical one:
- **Term & end date** (month-to-month vs 36-month is the difference between an asset and a rumour)
- **Escalator** (does the price rise 3%/yr automatically, or did you sign it flat forever?)
- **Commit / take-or-pay** (how much they pay regardless of usage)
- **Ramp schedule** (when does the revenue actually start?)
- **Payment terms & method** (card / ACH / wire / net-60; card revenue costs 3% and can be charged back)
- **Credit limit and deposit held**
- **Change-of-control clause** (can they refuse to come with an acquisition?)
- **MFN / audit right / unusual clauses** (flagged in red)
- **Source & commission** (direct / affiliate / agent / partner — with the permanent margin haircut)
- **Cost-to-serve, actual** (tickets × minutes, running)
- **Contribution margin** (the only number that matters, and the one nobody computes)

### The Deposit and the Credit Limit
A whole missing verb: deciding how much risk to extend a customer.

**How it works:** Set per-customer credit limits and auto-suspend thresholds; require deposits from
high-risk segments (1–2 months MRC, refundable). Deposits are cash you hold and must give back, so
they're a liability that *looks* like cash — another T4 instance. Requiring one loses ~15% of deals
and eliminates most bad debt.

### Word-of-mouth is a *segment* graph, not a global stat
Extends §3.7's Word of Mouth Graph.

**How it works:** Referral only flows within a segment. A delighted WordPress agency refers other
WordPress agencies. A delighted colo tenant's referrals go to other engineers in the same metro. A
delighted game-server community refers other communities *of the same game*. **This is why niche
positioning (§3.6) compounds and generalist positioning doesn't** — and modelling referral as a
segment-local effect makes that a discovered strategy rather than a stated one.

---

## 4. Buildables: services and infrastructure

*All of these sit in §4.9's "the business machine," and all obey the Three-Column Law (§4.1): what it
gives, what it costs, what it opens.*

### The Rate Card / Price Book
A first-class, editable, diegetic object rather than a menu.

**Gives:** every plan, term, renewal price, add-on, and regional variant in one place, with live
per-SKU contribution margin.
**Costs:** nothing to hold; changing it is the expensive part (comms, grandfathering, system changes).
**Opens:** **price inconsistency** — once sales can quote off-card, you get a hundred one-off prices
you must honour for years and can never report on cleanly.

### Metering & Rating Engine
The unglamorous machine that turns usage into invoices.

**Gives:** usage-based revenue (overage, egress, GPU-hours, invocations, minutes) — which is the
highest-growth revenue type and impossible without it.
**Costs:** significant build, ongoing accuracy maintenance.
**Opens:** the Metering Blackout threat, disputes, bill shock, and the discovery that your meter and
your customer's meter disagree by 4% (they always do, and the customer's number is the one they
believe).

### Revenue Assurance
A function whose entire job is finding money you already earned.

**Gives:** recovers 1–4% of MRR permanently; reconciles the asset database, the provisioning system,
and the billing system three ways.
**Costs:** one analyst's salary, forever.
**Opens:** nothing. **It is the closest thing to a free tower in the game and should be gated behind
a scar** (the first time you discover an unbilled service) rather than behind money.

### Deal Desk / Discount Authority
The governor on the discounting spiral (§6.5).

**Gives:** a per-role discount ceiling; anything deeper routes to you (costing executive attention,
§7.5). Flags clause interactions (MFN, credit caps, non-standard SLAs) *before* signature.
**Costs:** slows every non-standard deal by days; sales complains loudly and constantly.
**Opens:** deals lost to slowness; a reputation with agents and partners as "hard to work with."
**Interacts with:** the MFN threat, §6.5 discounting spiral, §7.5 delegation policies.

### The Trust Center
A self-serve security-and-compliance portal.

**Gives:** pre-answered security questionnaires, SOC 2 report under NDA-click, subprocessor list,
uptime history, pen-test summary, DPA template, insurance certificates. **Measurably shortens
enterprise sales cycles** and eliminates the Security Questionnaire Treadmill threat.
**Costs:** build + quarterly maintenance.
**Opens:** you've now published your control set, which is a map for an attacker; and anything on it
that goes stale is a lie with your logo on it.

### Partner Portal with Deal Registration
The machinery that makes a channel work and prevents channel conflict.

**Gives:** partners register a deal and get protected margin for 90 days; you see pipeline you'd
otherwise be blind to.
**Costs:** build, plus a channel manager.
**Opens:** **channel conflict** — your direct sales team finds the same prospect, and now you must
decide who gets it. Deciding against the partner once costs you the partner forever. This is a
genuinely agonizing recurring decision and it is free content.

### Tax Engine / Nexus Monitor
Boring, mandatory, and a great late-unlock.

**Gives:** correct per-jurisdiction tax on every invoice; a nexus dashboard that warns *before* you
cross a threshold.
**Costs:** a per-transaction fee and an accountant.
**Opens:** nothing, but its *absence* opens the Nexus Letter.

### Entity & Ring-Fence Structure
Corporate structure as a defensive buildable — a genuinely novel tower.

**Gives:** separate legal entities per risk class (the bulletproof line, the crypto-paying line, the
regulated line, the building). Contains a payment-processor termination, a lawsuit, a regulatory
action, or a debanking to one entity instead of all of them. Enables per-entity banking, per-entity
insurance, and selling one line without selling the company.
**Costs:** legal setup, ongoing accounting complexity, intercompany agreements, and you must actually
*respect* the separation (shared bank accounts pierce it).
**Opens:** transfer-pricing complexity, an auditor's favourite question, and the temptation to
comingle when cash is tight — which voids the whole protection at the worst moment.
**Interacts with:** the Debanking threat, §1.3 bulletproof, §6.10 lose conditions.

### Multi-Brand Storefronts
Run N brands on one infrastructure.

**Gives:** segment-specific positioning without repricing the core; a fighter brand to absorb price
wars; an acquired brand you keep alive so its customers don't churn.
**Costs:** duplicated marketing, duplicated support queues, duplicated status pages, and a real risk
of confusing your own staff.
**Opens:** **the linkage risk** — if customers discover the brands are the same company on the same
hardware, the premium brand's trust takes a hit; and the budget brand's outages leak onto the premium
brand's reputation if they share anything customer-visible.

### Sales Compensation Plan (a tunable object, not a salary)
One of the most consequential dials in a real hosting company.

**Gives:** you set what sales is paid on — bookings, MRR, TCV, gross margin, or collected cash — plus
the accelerator structure and the clawback window. **Reps optimize exactly what you pay them for**, and
the game should show that within one level: pay on bookings and you get backlog you can't install and
deals with 18-month ramps; pay on collected cash and reps refuse hard deals; pay on margin and they
stop discounting but also stop selling volume.
**Costs:** commission (typically 6–12% of first-year value, or 3–5% of MRC as a residual).
**Opens:** sandbagging at quarter end, deal-pulling-forward that empties next quarter, and the rep who
sells a customer you should have declined.

### Win/Loss Interview Program
A research building for the sales half.

**Gives:** a third party interviews prospects who chose someone else. Produces a rolling list of *real*
loss reasons, which is almost never what your sales team says it is. Feeds the roadmap and the rate
card.
**Costs:** small and recurring.
**Opens:** uncomfortable truths about your own team, one of which is a named staff member's win rate.

### Customer Advisory Board / Reference Program
Turning customers into sales infrastructure.

**Gives:** a maintained roster of customers who will take a reference call. Enterprise deals stall
without references. Also generates roadmap signal and enormous retention (people don't churn from a
company they advise).
**Costs:** an annual dinner, a dedicated CSM, and honouring their roadmap asks at least sometimes.
**Opens:** reference fatigue (the same three customers get called constantly and start declining), and
the day a reference customer gives an honest, damaging answer on a call you arranged.

### Customer Health Score Engine
The retention radar.

**How it works:** Combines usage trend, ticket sentiment, login recency, invoice payment behaviour,
contract end date proximity, executive-contact turnover, and support escalation history into one
per-account number. Drives the Grudge Meter (§3.7) but *predictively* — it flags accounts 60–90 days
before they signal churn, which is the only window in which a save is cheap.
**Opens:** false positives (a CSM spends time on a happy account) and the temptation to game the score
rather than fix the account.

### AI Support Agent
A 2025-era buildable with a real tradeoff.

**Gives:** 30–50% ticket deflection on tier-1 volume at roughly a tenth of human cost per ticket;
24/7 first response, which is a real SLA improvement.
**Costs:** per-resolution fee, plus the knowledge-base investment it depends on (it is only as good as
your docs — so it retroactively pays for the KB).
**Opens:** the AI Agent Incident threat; CSAT drops among customers who wanted a human; and it hides
signal, because deflected tickets never reach the humans who would have noticed a pattern.

### Offshore / Follow-the-Sun Support Pod
See the `Offshore` level.

**Gives:** cost per ticket drops ~60%; timezone coverage.
**Costs:** 90-day ramp during which service is worse; documentation prerequisite; management overhead.
**Opens:** segment-specific churn (some customer types react badly), knowledge fragmentation, and the
possibility that your two support teams give contradictory answers.

### Collections Agency Contract / Factoring Facility
Two ways to turn receivables into cash.

**Collections:** they take 25–40% and permanently burn the relationship. Correct for write-off-bound
accounts, wrong for anyone you might keep.
**Factoring:** sell your invoices at 1–3% per 30 days for immediate cash. Expensive, available, and
*not* a trap the way a merchant cash advance is — an important distinction the game should draw,
because it teaches that not all fast money is predatory.

### Energy Hedge / PPA / Demand-Charge Manager
Power as a financial instrument, not just an operating cost.

**Gives:** fixed-price power for N months (margin certainty); a renewable PPA (marketing + price
stability); peak-shaving automation that manages the demand ratchet.
**Costs:** commitment; the hedge can go underwater; peak-shaving hardware.
**Opens:** the Energy Hedge Underwater threat, and the realization that your customer contracts need a
pass-through clause or you carry all the risk.

### ITAD Contract + Certificate of Destruction
The end of the hardware lifecycle, as a revenue line and a liability.

**Gives:** residual value on retired gear (10–20% of original at year 4, more for GPUs in a shortage),
and a certificate of destruction you can hand to a compliance customer.
**Costs:** a vendor relationship and logistics.
**Opens:** **a data-breach liability with your name on it** if the vendor doesn't actually wipe the
drives — a real and recurring industry scandal, and a perfect delayed-consequence threat.

### OEM Capacity Reservation
The supply-side commit.

**Gives:** guaranteed allocation of scarce hardware (GPUs, high-density chassis) at a negotiated price,
12–18 months forward.
**Costs:** a deposit and a commitment to buy whether or not you have customers.
**Opens:** you are now long on hardware in a market that may soften — the mirror of the customer
take-or-pay, pointed at you.

### Hardware Support Tier
A dial nobody models: what warranty you buy.

**How it works:** Next-business-day parts (cheap) vs 4-hour onsite (expensive) vs self-maintain with a
spares pool (cheapest at scale, requires inventory cash and a tech). Directly sets MTTR for hardware
failures and therefore your achievable SLA tier. **The correct answer changes with fleet size**, which
is a lovely progression beat: at 20 servers you buy 4-hour, at 2,000 you self-maintain.

### Source Code / Data Escrow
An enterprise-deal unblocker.

**Gives:** removes a common enterprise objection ("what if you go out of business?") by depositing
recovery materials with a third party.
**Costs:** an annual fee and the discipline to keep the deposit current.
**Opens:** nothing — except that a stale escrow deposit is worse than none, and the customer may test it.

### Business Continuity / DR Plan (the document, not the infrastructure)
The artifact enterprise customers audit.

**How it works:** A written, tested, dated plan. Customers and insurers ask for it; having infrastructure
without the document fails the audit, and having the document without the infrastructure passes it —
which is §9.2's Compliance Theater Meter given a specific, sellable object.

### The Contract Clause Library
**The single idea in this report I'd most want built.** The contract as a set of individually
researchable, individually placeable defensive modules.

**How it works:** Each clause is a small tower you unlock (usually by being burned by its absence),
then apply to a contract template. Each has a cost in *deal friction* — a percentage of prospects who
push back, negotiate it out, or walk.

| Clause | What it does | Friction cost |
|---|---|---|
| **Limitation of liability** (capped at 12 months' fees) | Converts a catastrophic lawsuit into a bounded one | Enterprise legal will fight it; ~10% of deals slow |
| **SLA credit cap** (credits capped at 100% of one month) | Bounds your worst month | Low friction; standard |
| **Claim window** (credits must be requested within 30 days) | Most customers forget; real credit exposure drops ~70% | Low friction, high cynicism |
| **Maintenance exclusion** | Announced windows don't count against uptime | Low; universal |
| **Force majeure** | Upstream/utility/act-of-god exclusions | Low |
| **Auto-renewal** (evergreen with 60-day notice) | Renewals happen by default instead of by sale | Rising regulatory risk; consumer segments increasingly can't use it |
| **Annual escalator** (3%/yr) | Price rises without a conversation | ~15% of prospects negotiate it out |
| **Power pass-through** | Energy price risk moves to the customer | High friction in colo; standard in wholesale |
| **Take-or-pay minimum** | Revenue floor regardless of usage | High friction; only enterprise |
| **Assignment/change-of-control** | You can sell the company without losing them | Low friction if you ask early; impossible to add later |
| **Data-retention-on-termination** | Defines what happens to their data and what retrieval costs | Low, and prevents the ugliest disputes |
| **MFN** (⚠ a clause they impose on *you*) | Their price follows your lowest | Should be flagged red in the Deal Desk |
| **Right to audit** (⚠ imposed on you) | They can inspect you annually | Costs senior hands forever |

**Why this is good design:** it makes "legal" into a genuine tech tree with real tradeoffs, it explains
*why* the fine print exists without being cynical about it, and it gives the player a defensive
subsystem that costs conversion rate rather than latency — a perfect mirror of P1's Shared Pipe on the
business side.

### The Backlog Board
Signed-but-not-installed, as a physical queue.

**How it works:** Orders sit on a board with: required hardware, required power, required space,
required hands, committed install date, and a penalty clock. Installed orders move to the revenue
ledger. **Two numbers on the HUD — Signed MRR and Billing MRR — and the gap between them is the level's
tension.**

### The Yield Manager
Airline revenue management for infrastructure.

**How it works:** You have idle capacity in every line, always. A yield slider decides how much of it
to release at a discount (spot GPU, off-peak render, short-term colo, burstable VPS, "last cabinet"
promos) versus holding it for full-price demand that may not arrive. Releasing too much cannibalizes
your own reserved pricing — your existing customers discover the spot price and demand it. Releasing
too little strands capacity.
**Hosting types:** GPU/HPC most sharply, but colo, transit, and even shared hosting have versions.
**Interacts with:** §6.6 stranded capacity, §4.10 spot/interruptible tier.

### Transfer Pricing / Internal Chargeback
For multi-line play (§0.2's Business Line System).

**How it works:** Your colo line "sells" space and power to your hosting line at an internal rate. Set
it high and the hosting line looks unprofitable while the colo line looks great; set it low and vice
versa. **Whichever number you pick, you'll make a strategic decision based on it** — and the game can
let you discover that you divested a line that was actually profitable, because your internal rate was
wrong. A wonderfully quiet trap.

### The Comp-Account Auditor
Tiny building, real money.

**How it works:** Audits free, internal, employee, partner, demo, and "we said we'd comp this for a
month in 2019" accounts. Typically 3–8% of a mature host's fleet capacity. Reclaiming it is free
capacity; reclaiming it *badly* generates a viral thread from a beloved open-source project you were
sponsoring without realizing.

---

## 5. Unlocks and discovery

### Financial-maturity unlocks
Capability gated on your books, not your tech.

**How it works:** **Clean monthly close for 6 months** → the forecast view (§4.9 FP&A) and a credit
line. **Reviewed/audited financials** → bank debt at real rates, and eligibility for enterprise
procurement. **12 months of cohort data** → the Cohort View and elasticity testing. **3 years of
operating history** → insurance at reasonable rates, and the "since 20XX" trust badge (§4.9) which is
a real conversion factor. **$1M ARR with <2% monthly churn** → institutional lenders and PE inbound.
**Why it's good:** it makes bookkeeping a progression system, which no game does, and it's true —
your access to capital is gated on your accounting quality.

### Accreditation ladders (per line)
Regulatory status as a tech tree, per hosting type.

**How it works:**
- **ICANN registrar accreditation** → you stop reselling domains at 5–15% margin and start earning
  registry-to-retail spread, plus you own the customer's domain (3× retention, §3.7). Costs an annual
  fee, an accreditation process, and a compliance obligation (WHOIS accuracy, UDRP handling, escrow).
- **ITSP authority / FCC 499 filer / CLEC** (VoIP) → you can sell DIDs and terminate calls directly
  instead of reselling. Opens a whole regulatory-fee stack: USF contributions, 911/E911 obligations
  and fees, CALEA compliance, per-state registrations. **A line whose real threat is a quarterly
  filing deadline.**
- **PCI DSS Level 1 Service Provider** → you can be *in scope* for other people's card data, which is
  a premium tier nobody else can bid on.
- **RIR/LIR membership + ASN + /24** (present in §5.3; extend) → plus the ability to *lease out* unused
  IP space as revenue, and the obligation to keep abuse contacts accurate.
- **Cloud marketplace listing + co-sell** → your product billable against a customer's existing
  hyperscaler committed spend, which removes the single biggest procurement objection. Costs a
  revenue share and an integration.
- **Wholesale energy procurement / becoming a load-serving entity** → buy power at wholesale instead of
  retail tariff. A late-game facility unlock with enormous margin implications.

### Channel unlocks
- **The recommended-host slot** (see level above) — unlocked by benchmark performance + upstream
  contribution + relationship.
- **Master agency / TSD contract** — unlocked by having a commission portal, a channel manager, and a
  quotable rate card. Opens the agent lane.
- **Affiliate network tier promotion** — volume + low refund rate promotes you to better placement.
- **Review-site "editor's choice"** — an honest version (earn it) and a dishonest version (pay for it,
  which most of the industry does), with the dishonest one detonating later per §2.10's Astroturf
  Temptation.

### Scar-driven business unlocks (extends §5.2)
Every one of these is unlocked by the pain, exactly as §5.1 prescribes:
- First unbilled service discovered → **Revenue Assurance**
- First discount you couldn't undo → **Deal Desk / discount authority**
- First MFN surprise → **Contract Clause Library**
- First chargeback spike → **Fraud screening**; second → **Rolling-reserve preparedness (second acquirer)**
- First customer who refused to consent to assignment → **assignment clause**
- First deal lost to a security questionnaire → **Trust Center**
- First month you couldn't close the books → **Accounting/FP&A**
- First install-date penalty → **Backlog Board**
- First stranded capacity → **Yield Manager**
- First agent who moved their book → **residual commission terms & agent relationship management**
- First price increase that churned 9% → **grandfathering policy + notice-period discipline**
- First customer who was 40% of revenue and left → **Concentration alarm + diversification objective**
  (§3.8 has the alarm; tie it to this scar so it's *earned*)
- First time you had cash but no bank account → **Entity & Ring-Fence**
- First demand-charge ratchet → **peak shaving**

### The Pivot Lattice
Making §1.4's `Pivot` a structured, costed decision rather than a research purchase.

**How it works:** Every line-to-line transition has a cost rated on four axes — **customer overlap**
(can you sell the new thing to the people you already have?), **hardware reuse**, **staff skill
transfer**, and **regulatory delta**. Cheap pivots: shared → VPS (same customers, same staff, hardware
reuses), backup → object storage (same hardware, adjacent customers), colo → managed (same building,
new staff), dedicated → GPU (new hardware, same customers, new power). Expensive pivots: anything →
VoIP (new regulatory regime), anything → regulated (audit history requirement), GPU → anything (your
capital is in cards that only do one thing), bulletproof → anything reputable (the door locked behind
you, §5.6).
**And the honest part:** during any pivot you pay for **both** lines for the overlap period — the old
line's leases, licences, staff, and contracts run to term while the new line is funded from scratch.
The Pivot level should have two P&Ls on screen, one shrinking and one growing, with a combined cost
line above both that is higher than either.

### Anti-unlocks (extends §5.7)
- **Losing peering** — a ratio dispute or a de-peering removes an unlock you'd earned.
- **Losing a brand** — a trademark dispute or a sale with a non-compete removes a storefront.
- **Losing the recommended-host slot** — one bad quarter of support metrics.
- **Losing your acquirer relationship** — a processor exit locks the card-payment node until you
  requalify under a new entity.
- **Losing insurability** — a claim history or a failed underwriting questionnaire; cascades into
  losing the enterprise customer tier that contractually requires you to carry cover.
- **The commission residual you can never stop paying** — an anti-unlock that is a permanent margin
  tax you accepted years ago.

---

## 6. Economy, money, and scoring

### Revenue Quality (colour the money — T2)
The headline economic addition.

**How it works:** Every dollar of MRR carries hidden attributes: **term remaining**, **gross margin**,
**cost-to-serve**, **source/commission load**, **payment method**, **concentration weight**, and
**abuse propensity**. The HUD's MRR number stays a number, but a **Revenue Quality bar** underneath it
shows composition by colour. Two companies with identical MRR can have completely different bars, and
the end-of-level valuation (§6.9) reads the bar, not the number.
**Suggested bands:**
- **Gold** — multi-year contracted, high margin, low touch, direct-sourced (colo cross-connects, colo
  cabinets, backup/DR, DBaaS)
- **Green** — annual prepaid, decent margin, moderate touch (managed WP, dedicated, business email)
- **Blue** — monthly, medium margin, self-serve (VPS, shared at fair prices)
- **Amber** — commissioned/agent/affiliate-sourced, or usage-volatile (GPU spot, CDN egress, minutes)
- **Red** — negative-contribution or high-abuse revenue (deal-forum cohorts, free-tier converts on
  permanent 90% coupons, the $2 unlimited plan, crypto tenants)
**Why this matters more than anything else in §6:** it makes "grow MRR" stop being the objective and
turns it into "grow the *right* MRR," which is the entire real job and currently invisible in the
document.

### The six cash buckets (T4)
Replace the single Cash number with a stack that sums to it.

| Bucket | What it is | Can you spend it? |
|---|---|---|
| **Free cash** | In the bank, unencumbered | Yes |
| **Restricted** | Rolling reserve, escrow holdback, security deposits held for tenants | No — and it *looks* like cash |
| **Deferred** | Prepaid revenue you haven't earned | Legally yes, prudently no (§6.4 already flags this) |
| **AR** | Invoiced, not collected, aged into buckets | Only by factoring, at a cost |
| **Backlog** | Signed, not installed, not billing | No, and it's the number sales celebrates |
| **Committed out** | Take-or-pay you owe suppliers, lease obligations, open POs | Negative |

**Visual:** the bank-balance column (§6.4) becomes a **layered column**, with only the top layer
coloured as spendable. Watching the spendable layer thin while the total column grows is the single
best picture of "profitable and insolvent" available.

### Unit economics per SKU
A card per product, not per company.

**How it works:** For every plan: price, cost-to-serve (hardware amortized + power + bandwidth +
licence + support minutes + payment fees), gross margin, CAC by channel, **payback period in months**,
average tenure, LTV, and LTV:CAC. The game should let you build a plan with a 14-month payback and an
11-month average tenure and *not warn you* — then show it in the postmortem as the reason you ran out
of cash while growing. (§6.3 names this dynamic; this makes it inspectable per product.)

### The term-length matrix
T1, made mechanical.

**How it works:** Every plan is priced across terms — monthly, annual, 2-year, 3-year — with a discount
per term. Each term choice trades **price** for **cash timing**, **churn**, and **revenue quality**.
Concrete, real-world-shaped defaults for a shared plan:

| Term | Effective monthly | Cash at signing | 12-mo retention | Renewal shock |
|---|---|---|---|---|
| Monthly | $12.00 | $12 | ~55% | none |
| Annual | $8.00 | $96 | ~78% (measured at renewal) | moderate |
| 2-year | $6.50 | $156 | ~82% | large |
| 3-year | $5.50 | $198 | ~85% | severe |

**The lesson the matrix teaches by itself:** long terms make cash and churn look wonderful for two
years and stack an enormous renewal cliff you must survive all at once. A player who fills their book
with 3-year prepay will have a beautiful level and a catastrophic one 36 months later — which is
exactly how the low-end hosting industry actually behaves.

### Ramp schedules and the revenue start date
See `The Ramp` level.

**How it works:** Contract value ≠ current revenue. A signed deal has a start date, a ramp curve, and
sometimes free months. Model three numbers: **TCV** (total contract value), **ACV** (annual), and
**Billing MRR** (what's actually invoicing this month). Sales celebrates TCV. Payroll needs Billing MRR.

### Take-or-pay and commit burn-down
Both directions.

**How it works:** Customer commits generate a revenue floor and a satisfaction penalty when unused.
*Your* commits (transit, power, hardware, marketplace) are obligations that appear in the "committed
out" bucket. A commit you outgrow is free money (you got the volume discount and used it); a commit
you undershoot is a monthly tax on your own optimism.

### The Rolling Reserve (mechanic)
See threat above. Economically: a permanent haircut on card revenue plus a one-time cash trough equal
to *reserve % × monthly card revenue × reserve months*. At 10% and 180 days on $200k/mo of card
revenue, that's $120k of your cash permanently parked. **Model it as a bucket that fills and then
holds at steady state**, so the player sees that the pain is a one-time transition, not a recurring
loss — which is exactly the insight that makes it survivable.

### Bad debt and the write-off line
Missing entirely.

**How it works:** A % of billed revenue that never collects. Real bands: consumer/low-end shared
2–4%; VPS 1–3%; SMB dedicated 1–2%; enterprise <0.5%; colo <0.5% (deposits + termination rights);
bulletproof ~0 (prepaid only, which is *why* it's prepaid). **Bad debt rate is a direct function of
your customer mix and your credit policy**, and it's the cost the cheap-and-fast strategies hide.

### Revenue leakage rate
See Revenue Assurance. Model as 0.2–0.5%/month accumulating, capped by whatever assurance you've built.

### The cash conversion cycle
One derived number worth showing.

**How it works:** Days from spending cash on capacity to collecting cash from the customer using it.
Prepaid shared hosting is **negative** (the customer funds you — the best business model in hosting).
Enterprise dedicated on net-60 with hardware bought up front is **+120 days**. Colo with a fit-out
allowance is **+18 months**. **Showing this number per line explains, in one figure, why some hosting
businesses grow effortlessly and others need financing to grow at all.**

### AP as a lever (and a trap)
The supply side of cash management.

**How it works:** You can stretch vendor payment terms — pay at 45 instead of 30 — to smooth a trough.
It works, it's normal, and past a point your distributor puts you on credit hold (threat above), your
transit provider adds a late fee, and word travels in a small industry. **A legitimate lever with a
reputation cost among a different audience than your customers**, which fits the document's existing
"trust-with-upstreams" hidden currency (§6.1) perfectly.

### The ETF buyout (contract buyout as an offensive weapon)
The single most effective competitive tactic in B2B hosting and it's not in the document.

**How it works:** A prospect is locked into a competitor for 14 more months at $4,000/mo with an early
termination fee of 50% of remaining value ($28,000). You offer to **pay their ETF** in exchange for a
36-month contract with you. You've spent $28,000 to acquire $144,000 of contracted revenue — a 7-month
payback, amortized as a contra-revenue item. The customer's decision becomes free. **A CAC you can
compute exactly**, and a fantastic mid-game unlock because it requires cash on hand, which makes cash
strategically valuable rather than just survival-valuable.
**Counter-mechanic:** the competitor AI can do it to you, so *your* contracts' ETF terms become a
defensive clause with a deal-friction cost.

### The dual-run cost
Migrations cost double for a while.

**How it works:** During any migration — customer-in, customer-out, platform-to-platform,
datacenter-to-datacenter — both environments run. Somebody pays for the overlap. Model it explicitly:
a 6-week migration on a $12k/mo footprint has a $18k overlap cost, and whoever eats it (you, as a
migration incentive; or them, as a cost of switching) is a negotiation. **It's also why customers
don't leave** — data gravity (§6.6) plus dual-run cost is the real switching cost.

### Per-line valuation bases (extends §6.9)
The document values everything as "ARR × a multiple." Real buyers don't.

| Line | Valued on | Typical range | What moves it |
|---|---|---|---|
| Shared / VPS book | EBITDA multiple, or monthly-revenue multiple | 3–6× EBITDA / 10–18× monthly revenue | churn rate, prepay mix, platform age |
| Managed / cloud services | EBITDA or ARR multiple | 6–12× EBITDA | NRR, gross margin, contract length |
| Colocation | **NOI and cap rate**, like real estate | 6–9% cap rate (i.e. 11–16× NOI) | lease term remaining, tenant credit quality, power capacity, carrier density |
| Wholesale DC | Contracted backlog + development pipeline | per-MW valuations | signed leases, power secured, land |
| GPU/AI | Contracted backlog + hardware residual | highly variable | contract term, counterparty credit, card generation |
| Bulletproof | Effectively unsellable | — | no buyer will inherit the liability |

**Why this matters mechanically:** it means **the same revenue is worth 3× more if it's on a 5-year
contract with a creditworthy tenant than on month-to-month with consumers** — which retroactively
justifies every boring decision the game wants to teach (sign longer terms, sell to businesses,
diversify, document). The Multiple meta-stat above is where this lives.

### Adjusted EBITDA and the addback game
The dark art, playable.

**How it works:** When selling, you present *adjusted* EBITDA: add back one-time costs, owner
compensation above market, the failed product line, the legal settlement, the "non-recurring" outage
credits that recurred three times. Each addback raises the price; each one a diligent buyer rejects
costs you credibility and drags other addbacks with it. **A bluffing minigame with a real-world name**,
and the honest player who presents clean numbers gets a lower headline and a smoother close — which
should sometimes net more.

### Escrow, holdback, and working-capital adjustment
The three ways a headline price isn't the price.

**How it works:** 10–20% of purchase price held in escrow for 12–24 months against reps and
warranties; a separate retention holdback tied to customers still present at month 12; and a
working-capital adjustment at close that claws back deferred revenue you've already spent. **A player
who sells at "5× EBITDA" and receives 62% of it at close has learned the most useful financial lesson
in the game.**

### Scoring additions
- **Contribution margin by cohort and channel** on the score screen, not just gross margin.
- **Contracted revenue %** — what fraction of your MRR has more than 12 months left. A better health
  measure than churn rate.
- **Net Revenue Retention by line** (§6.8 has NRR; per-line is the useful version — storage lines run
  110–130%, shared runs 85–92%, and seeing the difference explains the whole industry).
- **Revenue per kW and revenue per rack unit** — the facility-line efficiency metrics that actually
  get used, and a lovely spatial score (your floor plan has a $/sq ft heat map).
- **Cash conversion cycle** as a fifth dial.
- **The Leak Report** — how much revenue you left unbilled, next to "Money Left On The Table" (§6.9),
  which currently only counts bounced visitors. There are two kinds of money you didn't collect and
  the game should show both.

### Concrete number sheet (so the sim has somewhere honest to start)
*Mid-2020s North American/European market, small-to-mid operator. All approximate and meant as
design anchors, not gospel.*

**Prices, retail**
- Shared hosting: $3–15/mo advertised (usually as annual prepay), renews $9–25
- Managed WordPress: $25–100/site/mo
- VPS: $5–40/mo (2–8GB)
- Dedicated: $80–400/mo
- Colo: $500–1,400/cabinet/mo retail at 3–5kW; $120–180/kW/mo at wholesale scale
- Cross-connect: $100–350 MRC, $250–500 NRC
- IP transit: $0.15–0.60 per Mbps/mo at 10G+ commit in major markets
- IPv4: ~$30–50/address to buy, ~$0.50–0.80/address/mo to lease
- Backup/DR: $0.02–0.12/GB/mo depending on RTO tier; retrieval fees separate
- GPU (H100-class): $2–4/GPU-hr in 2024, drifting to $1.5–2.5; reserved 30–50% below spot

**Costs**
- Power: $0.06–0.14/kWh commercial; 1kW continuous ≈ $65–100/mo at the meter, ×PUE
- PUE: 1.1–1.25 modern purpose-built, 1.4–1.8 retail colo, 2.0+ legacy
- Server: $1,500–4,000 commodity 1U; 8×H100 node $250–400k
- Depreciation: 3–5 years straight line; residual 10–20% at year 4
- Payment processing: 2.9% + $0.30 retail; 1.5–2.5% interchange-plus at volume; $15–25/chargeback
- Loaded staff: support agent $45–75k US / $12–22k offshore; sysadmin $75–115k; SRE $130–190k;
  DC tech $45–70k; loaded multiplier 1.25–1.4×
- Support: 15–30 tickets/agent/day; $4–12/ticket US, $1.50–4 offshore
- Control panel licence: $2–20/account/mo depending on tier and vendor mood

**Rates**
- Monthly logo churn: shared 3–6%, VPS 4–8%, managed WP 1.5–3%, dedicated 1–2%, colo 0.3–0.8%,
  enterprise managed 0.2–0.5%
- Involuntary churn as a share of gross churn: 20–40% (recoverable to 30–50% of that with dunning)
- Payment failure rate on active card subscriptions: 5–9%/month
- Free-to-paid conversion: 1–4% (unverified free tiers: 30–60% of signups are abusive)
- Trial-to-paid with a card on file: 35–60%
- Affiliate CPA (shared hosting): $65–150, with 45–90 day clawback
- CAC payback target: under 12 months; LTV:CAC above 3:1
- Support cost as % of revenue: healthy under 15%; dead above 30%
- Gross margin targets: shared 70–80%, VPS 60–75%, managed 55–70%, dedicated 45–60%, colo 55–70%
  after power, backup 60–75%, GPU 40–60% when hot, bandwidth resale 20–40%
- Bad debt: 2–4% consumer, <0.5% enterprise
- Revenue leakage: 2–5% of MRR unbilled at any given time in an unmanaged operation
- Colo occupancy target: 85%+; below 65% the building loses money
- GPU utilization breakeven: ~55–65%; above 90% you can't do maintenance

---

## 7. Core gameplay mechanics

### The Pipeline Board (a second board for the CEO chair)
The sales funnel as a physical object, parallel to the infrastructure graph.

**How it works:** A kanban of deals moving left to right: Lead → Qualified → Technical Review →
Security Review → Proposal → Procurement → Signed → Installed → Billing. Each column has a capacity
(how many deals your team can work simultaneously — hands, again), a stage-conversion rate, and an
average duration. Deals *decay* if they sit (a stalled deal is a lost deal). **The board teaches
throughput thinking exactly the way the infrastructure board teaches queueing** — and the visual
identity is the same: flow, bottleneck, backpressure.
**The good joke:** your Security Review column is staffed by the same engineers your incidents need.
Sales and ops compete for the same hands, and the game shows you the conflict as a shared token pool.

### The Deal Sheet (contract negotiation as clause-level trading)
The negotiation minigame §6.5 asks for, made concrete.

**How it works:** Both sides have a sheet of terms. Each term has a value to you and (hidden) a value
to them: price, term length, SLA tier, credit cap, liability cap, payment terms, escalator, ETF,
assignment, MFN, audit right, notice period. You trade — give net-60 to get 36 months; give a 3% cap
on credits to get an escalator; refuse MFN and offer a bigger discount instead. **Each concession
writes a permanent line onto that client's card**, and the game remembers it for the rest of the
campaign. Three levels later the MFN you accepted reprices your best account.

### The Rate Card as a live object
Not a settings screen — a thing on your desk you edit and print.

**How it works:** Editing it mid-level is allowed and consequential: existing customers are unaffected
(grandfathered by default), new customers price off the new card, and *quotes already outstanding*
honour the old card until they expire. That last rule creates a real tactical texture — a price
increase has a queue of pending deals grandfathered into it.

### Discount authority as a delegation slider
Extends §7.5's autopilot/delegation.

**How it works:** Set the % discount each role can grant without approval. Higher = faster deals,
worse margin, and a discount spiral you find out about in the quarterly P&L. Lower = better margin,
slower deals, and your executive attention (§7.5) consumed by approving $200/mo discounts.

### The Two Books toggle
A single HUD switch between **cash view** and **accrual/P&L view**.

**How it works:** The same month looks different in each. Cash view shows the prepay landing as a
spike; accrual view shows it spread across twelve months. Cash view shows the hardware purchase as a
crater; accrual shows a small depreciation line. **Toggling it should be a thing the player does
constantly**, because it's the thing real operators do constantly, and it makes the two-ledger idea
(§6.4) an interaction rather than a readout.

### The Commit Ledger
A rail of obligations: what you owe, to whom, until when.

**How it works:** Transit commits, power contracts, hardware leases, licence minimums, marketplace
revenue shares, agent residuals, the office lease, and the SLA credits accruing right now. It is the
negative of the Backlog Board. §8.8's Obligation Rail exists — this is what it should contain.

### The Quarter Close
A recurring 30-second sequence with real decisions.

**How it works:** At quarter end: which deals can you pull forward (at a discount, borrowing from next
quarter), which revenue can you recognize, which expenses can you defer, and what do you tell the
board? Every choice is legal, every choice is a loan from the future, and the game tracks how many
quarters in a row you've borrowed — which is how a real company ends up restating.

### Chair switching with a cost
Extends §1.2's Founder Mode / Sales Chair / Board Meeting.

**How it works:** The player occupies one chair at a time — Ops, Sales, or Finance — and switching has
a cooldown. Whatever you're not watching runs on the delegation policies you set. **The whole
mid-game skill is deciding which chair to be in during a given week**, and the answer is almost never
the one you enjoy most.

### The Forecast Commit
You tell the board a number, and then you live inside it.

**How it works:** At the board meeting (§1.6), commit to next quarter's MRR. Beating it is good;
missing it triggers pressure events (cut costs, raise prices, fire people — §4.9's Board entry).
Hitting it *by pulling deals forward or discounting* is the trap: you hit the number and empty the
pipeline. **A self-imposed constraint the player chooses the size of** — difficulty as a dial you set
with your own mouth.

### Contract-driven pathing
A small but genuinely new mechanic for the board itself.

**How it works:** Some customers' contracts specify *how* their traffic must be handled: dedicated
hardware (no shared nodes), a specific region (data residency), a named transit carrier, encryption in
transit, no third-party subprocessors (so you can't put them behind your CDN vendor). These become
**routing constraints on your dependency graph**, drawn as coloured locks on links. During an incident
your cheapest failover path may be contractually illegal for one tenant. **Contracts as level
geometry** — the same idea as §1.3's Residency Fence, generalized to every clause.

---

## 8. Visuals and presentation

### The Price Book as a printed rate sheet
A folded, slightly coffee-stained laminated card on the desk.

**How it works:** Editing it is literally writing on it — crossed-out prices, a sticker for the new
one, a promotional rate paper-clipped to the corner. Old prices remain visible with strikethrough,
which is a free visualization of grandfathering: **you can see how many generations of pricing you're
still honouring.**

### Money has a colour and a weight
Implementing the Revenue Quality bar visually.

**How it works:** Coins/motes are tinted by revenue quality band (gold/green/blue/amber/red) and
*sized* by margin. A month of great revenue is a slow procession of heavy gold coins; a month of
deal-forum signups is a fast spray of small red confetti that sums to the same number. **One glance
tells you what kind of company you've become**, and it makes the MRR chart's lie visible without a
second chart.

### The layered cash column
§6.4's bank-balance column, stratified.

**Visual:** free cash on top in bright gold; deferred revenue below it in a translucent amber that is
clearly *someone else's*; restricted/reserve at the bottom behind bars. When the gold layer thins to
a sliver while the column is at record height, the player understands insolvency-while-growing without
a tutorial.

### The Rolling Reserve cage
A literal barred box inside the vault.

**Visual:** every incoming coin passes a diverter; one in ten drops into the cage. The cage has a
180-day timer ring, and old coins fall out the bottom of it back into free cash. **Watching the cage
fill for six months and then reach steady state is the clearest possible picture of a one-time cash
transition**, and it converts an abstract finance concept into a machine you can look at.

### The AR spindle
Aged receivables as a desk spike.

**Visual:** unpaid invoices impaled on a spindle, yellowing and curling as they age through the 30/60/90
buckets. The 90+ ones are brown and brittle. Clearing one is a satisfying pull-and-file animation;
writing one off is a shredder.

### The Backlog dock
Signed-not-installed as physical crates.

**Visual:** crates on the loading dock with a customer label and a **committed install date stencilled
on the side**, which turns red as it approaches. Installed orders get carried inside and the customer's
desk appears (tying into §3.7's "customers sit down in your building"). **The gap between the dock and
the office floor is Signed MRR minus Billing MRR, rendered as distance.**

### The Pipeline funnel board
A magnetic whiteboard with deal cards in columns.

**Visual:** each deal is a card with a logo, a value, and a little photo of the champion. Deals that
stall gain dust. Deals that die get taken down and dropped in a bin that you can, disturbingly, look
inside at the end of the level. The board is diegetic — it hangs in the sales floor room (§4.9's Sales
Floor), so walking the camera over there *is* opening the sales UI.

### The brand street
Multi-brand rendered as separate shopfronts on one street, with one shared loading dock at the back.

**Visual:** each brand gets its own facade, signage, typography, and visitor costume — but the camera
can pull back to reveal one building behind all three. **The reveal shot is the entire strategy
explained in one frame**, and the "linkage risk" threat is literally a journalist photographing the
back alley.

### The demand-charge high-water mark
A power gauge with a permanent scar.

**Visual:** the power meter has a thin red line at your 12-month peak, with a small counter of months
until it resets. When a new peak sets it, the line jumps up with a nasty clunk and the counter resets
to 12. **A ratchet should look like a ratchet.**

### The ramp staircase
Colo contracts drawn onto the floor plan as a staircase.

**Visual:** reserved-but-not-billing cabinets are drawn as wireframe outlines with a date floating
above them; as each ramp step hits, the outline fills in solid and the revenue ribbon widens. A
delayed ramp is a step that stays hollow past its date, and the visual reads as *an empty promise* with
no words at all.

### The escrow lockbox and the diligence room
Two acquisition-flavoured objects.

**Visual:** at close, the purchase price pours into two containers — one you open, one bolted shut
with a 24-month timer. The diligence room is a physical room that fills with banker boxes as you
satisfy requests; unanswered requests are empty shelves with a label, and the buyer's analyst stands
looking at them.

### The commission gong, and the un-gong
Extending §4.9's Sales Floor.

**Visual:** a deal closes, the gong rings, everyone looks up. When a commission is clawed back —
customer refunded inside the window — a small, dull, single tap on the gong plays instead, and the
rep's card on the pipeline board loses a star. **Comedy and accounting in one sound cue.**

### The P&L printout
The score screen's business half as a dot-matrix or laser-printed statement.

**Visual:** a real-looking statement with line items, subtotals, and — in the "adjusted EBITDA"
version — sticky notes stuck on with the addbacks handwritten. The player physically peels off the
sticky notes to see the honest number. **The single best visualization of financial self-deception
available.**

### Contract clauses as dog-ears
The Contract Clause Library, rendered.

**Visual:** each customer's contract is a physical document in their file. Clauses you added are tabbed
in green; clauses *they* added are tabbed in red. A client card with three red tabs is visibly
dangerous at a glance, and hovering a red tab shows what it will do to you and when.

### Revenue-quality tinting on the floor
Extends §3.7's "cohorts as colour."

**Visual:** each customer's desk/rack/cabinet is tinted by revenue quality. A floor that's mostly gold
looks like a different company than a floor that's mostly red, and a pivot or an acquisition changes
the colour of the room over the course of a level. **"What kind of company have we become" answered by
looking at the carpet.**

---

## 9. Anything else

### Mode: **Multi-Brand**
Run three brands with one infrastructure and one staff. Score on blended margin with a penalty for
brand-linkage events. The most commercially realistic mode available and a genuinely different puzzle.

### Mode: **The Analyst**
You play the *buyer*. Given a data room and 20 diligence requests, you have to value a target and
recommend a price. You then watch a 3-minute simulation of what actually happens post-close. **The
best possible way to teach the player what their own company looks like from outside**, and a
brilliant use of the existing simulation with zero new systems.

### Mode: **The Agent**
You play a channel partner: no infrastructure at all, just relationships. You place customers with
hosting companies (some of them player-built) and earn residuals. Your "threats" are the providers
failing your customers, and your defense is diversifying which providers you sell.

### Mode: **Quarter Close**
A short, repeatable, high-tension mode: three days to the end of the quarter, a number to hit, a
pipeline, a discount budget, and a board waiting. Ten minutes, infinitely replayable, and it's the
business analog of Incident Mode (§9.1).

### Mode: **The Investor Update**
Once a month you write the investor update by choosing which metrics to lead with and which to bury.
Your investors' confidence (which gates future capital) responds to the update; your *credibility*
responds to whether the numbers you emphasized hold up next month. **Selective honesty as a resource
with a memory.**

### Twist: **The Personal Guarantee**
Early levels: to sign the colo lease or the credit line, you personally guarantee it.

**How it works:** A permanent flag on the company ledger. It changes the lose condition — bankruptcy
no longer just ends the run, it takes something of *yours* — and it makes the first five levels feel
materially different from the ones after you've grown out of it. Getting released from a personal
guarantee should be a celebrated milestone unlock with a little ceremony.

### Twist: **You become the vendor squeezing someone else**
Late campaign, you're the upstream.

**How it works:** You now sell wholesale to small hosts. Your pricing decisions do to *them* what
§2.10's Vendor Squeeze did to you. The game lets you raise prices on people you know can't migrate,
and the ethics dial (§9.2) notices. **A mirror level with no combat, and the sharpest moral beat
available in the theme.**

### Twist: **The vendor prices to your switching cost**
A systemic honesty about how B2B pricing actually works.

**How it works:** Your licence vendor's price increase is computed from an estimate of your migration
cost — how many accounts, how entangled, how much engineering you'd need. **Reducing your switching
cost (abstraction layers, open formats, a documented migration path) literally lowers your future
price increases**, which is an elegant, true, and completely un-gamified insight.

### Twist: **The customer who is also your investor**
Or your landlord, or your competitor's investor.

**How it works:** Their account card gains a second, conflicting relationship. Firing them, billing
them, or having an outage on them has consequences in a different system than the one you're used to.
A small mechanic with a lot of narrative leverage.

### Twist: **The founders' agreement**
Two-founder runs where the co-founder is an NPC with opinions.

**How it works:** They disagree with some of your decisions and their conviction is a stat. Enough
disagreement and they leave, taking their equity, their relationships, and whatever subsystem they
owned. **Bus factor as a *person* rather than a number**, and it gives the early campaign a voice.

### Humour and tone additions (in the document's established register: recognition, never punching down)
- **The industry forum thread.** A recurring in-fiction thread where operators discuss you. Titles
  escalate beautifully: "Anyone else seeing packet loss to [you]?" → "[You] — what's going on?" →
  "[You] acquired by [conglomerate]. Thoughts?" → "RIP [you]."
- **The acquisition email.** "Nothing will change for our customers." Displayed verbatim, every time,
  including the time you send it.
- **The renewal notice.** Your *own* vendors' evergreen auto-renewal notices arrive as junk-looking
  emails you can miss, locking you in for another year. One of them is genuinely important.
- **The "unlimited*" asterisk.** The asterisk is rendered, and clicking it opens a fair-use policy of
  absurd length that the player can actually scroll.
- **The quarterly all-hands slide** where last quarter's mandate is quietly not mentioned.
- **The conference badge collection** on the company wall (§1.8), which accumulates lanyards, and one
  of them is from an event that no longer exists because the organizer went under.
- **The sales rep's whiteboard countdown** to quota, erased and rewritten daily.
- **The invoice with a PO number field** that an enterprise customer will use to not pay you for
  60 extra days, and the moment the player learns to ask for the PO number *before* invoicing.

### Educational / meta
- **Export your P&L.** At the end of a run, produce a real, formatted, one-page income statement and
  balance sheet for the company you ran. Players will screenshot it, and it's genuinely instructive.
- **The "was that real?" tag (§9.5) applied to business mechanics.** Rolling reserves, demand-charge
  ratchets, MFN clauses, consent-to-assignment, agent residuals, ETF buyouts, and the 95th percentile
  are all real and all surprising. Tagging them is where the game earns its "I learned something"
  reviews from the business side, just as §9.5 does for the ops side.
- **A real hosting glossary** unlocked term by term as you encounter each concept, written plainly.
  MRC/NRC, TCV/ACV, NRR, DSO, cap rate, take-or-pay, MFN, ETF, PUE, 95th percentile, CAC payback.


---
---

# PART B — IMPROVEMENTS AND EXPANSIONS

*Each entry names the existing heading in `hosting_game.md` so the merge agent can attach it to the
right place. Where I think the document is factually wrong about how hosting businesses work, I say
so plainly and propose the fix.*

---

## 1. Levels, scenarios, and progression

### §1.1 "The parallel business ladder (CEO framing)" — put real numbers on every rung
The ladder is good and the rungs are correctly chosen. It hand-waves the money. Proposed anchors,
which also serve as the level's difficulty definition:

- **L1 The Freelancer** — Revenue $0–30/mo. Costs $12–40/mo. The joke lands harder with the real
  asymmetry: your $10 invoice, your $12 hosting bill, and the 3 hours you spent on it, valued at
  nothing. Win: one paying friend, and the realization that your hourly rate is negative.
- **L2 The Reseller** — 40 accounts × $8 = $320 MRR; reseller plan costs $50/mo; **62% gross margin
  and 0% control.** Add the real reason people do this: zero capex. Add the real failure: you cannot
  fix anything, so your only tower is communication, and three upstream outages churn 60% of a
  price-sensitive book in six weeks.
- **L3 Two U's** — $180/mo colo for 2U + 1 amp + a /29, $2,400 of hardware capex, first 95th-percentile
  bill $60. Payback on the hardware is 14 months, which is the level's whole lesson.
- **L4 Shared Hosting Shop** — 100 × $5 = $500 MRR. Real cost stack: one $180/mo box, $120/mo of
  control-panel licence, $95 of payment fees (19% of revenue at $5 plans!), and 30 tickets/month at
  $7 each = $210. **You are losing money at 100 customers and the level should let the player
  discover that.** The fix isn't more customers, it's annual prepay, add-ons, and ticket deflection.
- **L5 VPS Provider** — 300 VMs × $6 = $1,800 MRR across 6 host nodes ($4k each). Fraud rate 8–15% of
  signups without screening; 2% of accounts generate 80% of abuse tickets.
- **L6 Managed & Serious** — 20 customers × $600. SLA credits capped at one month's fee; the real cost
  of an outage here is the renewal discount you'll concede, not the credit.
- **L7 Datacenter Operator** — 40 cabinets at $900 = $36k MRR, plus $8k of cross-connects at ~98%
  margin, plus power resale. Occupancy 64% and the level is about the other 36%.
- **L9 The Roll-Up** — **acquisition price 10–18× monthly revenue (or 3–5× EBITDA); expect 20–35%
  churn in the first 12 months post-migration**; hold 20% of price in escrow tied to month-12
  retention. The document says "you buy a book and half of it walks" — half is the catastrophic case;
  a quarter is the expected case, and the difference between them is entirely migration quality.

### §1.1 "The business difficulty curve" — add the fourth axis: *time constants*
The curve currently escalates on visibility (individuals → rates → contracts → organization). Add:
**the time constant of your decisions lengthens at every rung.** At L1 a decision pays back in days.
At L4 in months. At L7 in *years* (a 5-year lease, a 3-year hardware cycle, a 2-year audit history).
By L10 your most important decisions won't resolve inside the level you make them in — which is the
mechanical justification for §1.6's cross-level Company Ledger and for P10.

### §1.1 Tier 4 "Landlord" — the landlord's customers can't be fired, but they *can* be priced
The entry says "you cannot fire the profitable ones." True, but incomplete: in colo your real lever is
**the renewal**, not termination. The high-maintenance tenant gets a 22% increase at renewal and
either self-selects out or becomes profitable. Add renewal pricing as the landlord's primary
behaviour-shaping tool — it's how the business actually disciplines customers, and it's slow, which
fits the tier's tempo.

### §1.2 `Founder Mode` / `The Sales Chair` / `The Board Meeting` — unify into one chair system
These are three separate entries describing one mechanic. Merge them into **the Chair system** (see
Part A §7): Ops / Sales / Finance chairs, switchable with a cooldown, each with its own board, each
running the others on delegation policy while you're away. The document already has the pieces —
executive attention (§7.5), delegation policies (§7.5), the Inbox (§7.5) — and merging them gives the
business layer one coherent interaction instead of three level types.

### §1.2 `The Support Queue Level` — add cost-per-ticket and the deflection decision
Currently scored on "CSAT above X with labour under Y." Make the labour explicit: every ticket has a
handle time, every agent has an hourly cost, and the player has deflection tools (KB article, macro,
self-serve feature, AI agent) whose ROI is computable. **The level's real lesson is that the cheapest
ticket is the one that was never opened**, which is invisible unless you show cost per ticket.

### §1.2 `The Acquisition` (fogged inheritance) — add the commercial fog, not just the technical fog
Brilliant level. The fog is currently technical (undocumented infrastructure). Half of a real
acquisition's fog is commercial and much funnier: contracts nobody can find, customers paying rates
nobody remembers setting, twelve grandfathered price tiers, a reseller with a verbal agreement, three
accounts marked "comp — ask Dave," a customer who has been on a free trial since 2017, and revenue in
the bank from a customer who does not appear in the billing system at all. **The player should have to
reconstruct the *rate card* as well as the *rack elevation*.**

### §1.3 "The Mass Host" — the density dial is right; add the *term* dial next to it
Shared hosting's two real levers are oversell ratio (present) and **term mix** (absent). Selling annual
prepay transforms the same book: cash arrives up front, measured churn drops (it's deferred to
renewal), payment fees drop from 13% to 1.1% of revenue, and support load per revenue-dollar falls.
It also builds the renewal cliff. Putting both sliders on the same level makes shared hosting a real
strategy space instead of a density minigame.

### §1.3 "Amps and Aisles" (Colocation) — add the three commercial mechanics the level is missing
Excellent level, but it's operational-only. Colo's business is:
1. **The ramp** (Part A `The Ramp`) — nothing bills on day one.
2. **The escalator** — 3%/yr baked into the lease. A five-year deal is worth 15% more than it looks,
   and forgetting to include one is a permanent margin leak.
3. **Power billing model** — committed amps (predictable, strands capacity) vs metered (efficient,
   volatile) vs flat-per-cabinet (simple, and you eat the density risk). This is *the* colo pricing
   decision and it's a perfect slider.
Add also: **tenant credit quality affects your building's valuation**, so signing a shaky startup at a
high rate can lower your company's worth even while raising revenue.

### §1.3 "Rack 4 Is 40 Kilowatts" (GPU) — correct the revenue model
The entry frames GPU as "sell interruptible cheap or reserved expensive." That's the *residual*
decision. The actual GPU business is **contracted, prepaid, multi-year reserved capacity with a
creditworthy counterparty** — because that's the only way to finance the hardware. Spot is what you do
with the gaps. Recommend reframing the signature tension as: *can you get a contract long enough and
a prepayment big enough to finance the cards before the market reprices?* Add: the customer's credit
quality is the whole deal (an AI startup with 9 months of runway signing a 3-year contract is not
revenue, it's a bet), and **who owns the hardware at the end** is negotiable and enormous.

### §1.3 "Anything Goes" (Bulletproof) — the scarce resource is payment rails, not just transit
§0.3's table says bulletproof's scarce resource is "upstream tolerance." Add the second, equally
fatal one: **payment acceptance**. Bulletproof hosts lose banking before they lose transit, which is
why they price in crypto, which creates its own accounting, tax, and volatility problems. The Heat
Gauge should have two needles.

### §1.5 `Sell the Company` — the level is the twelve months *and* the eleven weeks
Currently it's "maximize valuation over 12 months" with clawbacks in diligence. Split it: this level
is the run-up (clean up concentration, extend contracts, fix the books, get a clean audit period,
retire the sketchy customers), and `Due Diligence` (Part A) is the close. The two together are the
best possible campaign ending because the first rewards every boring decision the game taught and the
second reveals whether you actually made them.

### §1.5 `The Chargeback Wave` — add the intermediate stage
The scenario jumps from chargebacks to processor termination. Insert the real middle: **the monitoring
program** (excessive-dispute programs run for months with per-dispute fines of $25–100 on top of the
normal fee), and **the rolling reserve** (Part A). Termination is the third stage, not the second, and
the middle stage is where the interesting play is: you can trade your way out with fraud screening,
3DS, and a chargeback-alert service.

### §1.5 `Runway: 6 Weeks` — expand the escape menu; it's the best cash level in the doc
Current escapes: collect receivables, sell annuals at a discount, delay hardware, take expensive
money. Add the full real menu, in roughly the order a good operator tries them:
1. **Stop the bleeding** — pause ad spend (instant, free, costs future growth), freeze hiring.
2. **Pull cash forward** — annual prepay offer to the top 50 accounts, upfront setup fees on pending
   installs, ask your best customer to prepay a year in exchange for a price hold.
3. **Push cash out** — negotiate vendor terms from net-30 to net-60 (free, costs goodwill), defer the
   hardware order, sublease space.
4. **Convert assets** — factor receivables (1–3%/30 days), sell unused IPv4 (a real six-figure lever
   for an old host), sale-leaseback equipment.
5. **Sell something** — divest a small line or a customer book.
6. **Expensive money** — credit line, equipment finance, then the merchant cash advance the document
   correctly labels a trap.
Each with a cash amount, a time-to-cash, and a hidden cost. **This menu is one of the best decision
tables available in the whole design** and deserves to be a recurring panel, not a one-off level.

### §1.5 `The RFP` — add the parts that actually decide enterprise deals
The entry lists the security questionnaire, SOC 2, net-60, and the SLA. Add: **the incumbent**
(usually present and usually winning), **the champion** (an internal advocate whose departure kills
the deal — a real and dramatic mid-deal event), **procurement's mandated bidder count** (you may be
column fodder), **the reference calls**, **the supplier onboarding delay after you win**, and **the
legal redline round** which is where your Contract Clause Library gets tested. Also correct the
framing: winning at 30% concentration is a risk, yes — but the bigger risk is that you priced it
without knowing your own cost-to-serve, and enterprise accounts have a support tail that the
spreadsheet at bid time never includes.

### §1.5 `The Competitor's Obituary` — add the ugly commercial reality
The scenario is warm: refugees arrive, free customers, great PR. Add the real texture: those customers
arrive **pre-traumatized and price-anchored to a dead company's rates** (which were unsustainably low,
which is why it died). If you honour their old pricing to win them, you've imported the business model
that killed your competitor. The correct play — charge your real rate and win on the migration
experience — loses maybe half of them and keeps the half worth having. That's a much better decision
than "free customers."

### §1.5 `The Price Hike` (vendor raising your licence 400%) — add the switching-cost insight
Currently three options: pass through, eat it, migrate. Add the fourth and most useful: **negotiate**,
and reveal that the vendor priced the increase *just below* your estimated migration cost. Which means
the migration estimate is the negotiation, and having a documented, rehearsed migration path (even one
you never use) is what caps the increase. **Preparedness as pricing leverage** is a genuinely
non-obvious business lesson and it's free content on top of an existing entry.

### §1.6 "Difficulty as SLA" vs "Difficulty as Business Model" — resolve the flagged ⚔️ tension
The document flags these as competing for the same UI slot and suggests they could coexist. They
should, and here's the clean split: **Business Model is the faction** (what you sell, which reshapes
threats, visitors, costs, and the whole ruleset), and **SLA is the wager inside it** (how much you
promise, which sets both reward and failure threshold). Present them at different moments — business
model at campaign/level start, SLA at contract-signing time, per customer. That also makes SLA a
*recurring in-level decision* rather than a menu setting, which is strictly better.

### §1.6 "The Uptime Streak" — good; extend it into the credit-rating idea properly
"Your reliability is your credit rating" is the right instinct and should be literal: the streak,
plus documented processes, plus audited financials, plus revenue diversification, feed a visible
**credit grade** that sets your interest rate, your vendor payment terms, your insurance premium, and
whether your landlord asks for a personal guarantee. **Four different counterparties pricing you on
your operational behaviour** is a far richer version of one financing bonus.

### §1.6 "Named customers persist" / "The Ghost of Customers Past" — add the win-back economics
Churned customers are the cheapest lead source in hosting: 20–40% of churned accounts are winnable
within 18 months, at roughly a third of cold CAC — **unless they left angry**, in which case
contacting them generates a public complaint. The exit-survey reason code (§3.7) should determine
which bucket they're in, which makes the exit survey retroactively valuable twice.

### §1.6 "Prestige: The Exit" — differentiate the exit types properly
Currently IPO vs acquisition (more currency + shareholder pressure vs less + clean). Add the shapes a
hosting operator actually faces, each with a different meta-currency profile:
- **Strategic acquisition** (a bigger host buys you for your customers) — highest multiple, your brand
  dies, your staff mostly get cut.
- **PE platform acquisition** (they buy you as a platform to roll up others) — you stay and run it,
  with margin pressure and a second bite at the apple in 5 years.
- **PE bolt-on** (you're absorbed into an existing platform) — lower multiple, fast migration of your
  customers onto their stack, high churn.
- **Asset sale** (they buy the book, not the company) — you keep the liabilities.
- **Management buyout / employee ownership** — lowest cash, highest continuity, unlocks a unique
  meta-perk.
- **Wind-down** — sell the book, sell the hardware, pay the creditors, keep what's left. Should be an
  available, dignified ending.

### §1.7 "The Difficulty Dial the Player Turns" (price slider) — correct the timing
"Lower prices = more clients = faster waves" is right for *new* customers only. Price changes affect
the existing base only at renewal, so the dial has a **12-month lag on 80% of its effect** unless the
player force-migrates (which is a churn event, §6.5). Recommend the slider visibly show two numbers:
effect on new signups (immediate) and effect on the base (a slow fill bar that tracks the renewal
calendar). This is the single most important timing correction in the document.

### §1.7 "The Comeback Curve" — add the business-side recovery ladder
The doc's comeback logic is "low reputation → fewer visitors → fewer threats." True but thin. The
business comeback ladder is richer and more actionable: cut discretionary spend → raise prices on new
(not existing) → shift mix toward higher-margin add-ons → push annual prepay for cash → fire the worst
10% of accounts by cost-to-serve → and only then cut staff. **Giving the player an ordered, legible
list of survival moves is what makes the bottom of the curve playable**, which is exactly what the
entry is asking for.

---

## 2. Threats

### §2.10 opening rule — mostly right, but correct the magnitude of SLA credits
The section's framing example — "server down → 40 min SLA breach → $1,900 in credits" — is the one
number in §2.10 a real operator would push back on. Standard SLAs cap credits at **100% of one
month's MRC** for that service, are issued as **service credits, not cash**, must be **claimed by the
customer within a short window** (most don't), and **exclude announced maintenance, customer-caused
issues, and upstream/force-majeure events**. So a 40-minute outage on a $500/mo customer usually costs
about $25 in credits, and often $0 because nobody filed. **The real damage of that outage is: three
support hours, one grudge tick, a 4% higher probability of churn at renewal, a discount concession at
the next QBR, and a sentence in a review.** Recommend rewriting the causal chain to lead with churn
and concession, and making SLA credits *deliberately* small — because the gap between "my SLA says
99.9%" and "my credit exposure is trivial" is itself one of the most useful things a player can learn.

### §2.10 "Involuntary Churn (The Expired Card Ghost)" — the numbers are right; add the mechanics
"20–40% of all churn" matches reality. Add the lever detail so the Dunning Engine (§4.9) has depth:
**5–9% of active card subscriptions fail in a given month**; naive retries recover ~20%; smart retry
timing (avoid the 1st, retry after payday, respect issuer decline codes) recovers 40–55%; card-account
updater services add 10–20 points; pre-expiry emails add a few more; a backup payment method on file
is the single biggest factor. Also: **hard declines and soft declines need different treatment**, and
retrying a hard decline repeatedly gets you flagged by the card networks. That last one makes dunning
a *tunable* system rather than a binary purchase.

### §2.10 "The Concentration Risk Whale" — expand into the full whale pathology
The entry captures the demand-a-discount-at-renewal dynamic. Add the rest, because it's a much better
threat when fully specified:
- They will ask for **net-60 or net-90**, turning your best revenue into your worst cash.
- They will ask for a **custom SLA with real penalties** and a **liability cap above your comfort**.
- They will ask for a **dedicated engineer**, effectively removing a hand from your pool permanently.
- They will require **annual price *decreases*** ("productivity commitments") — standard in enterprise
  procurement and shocking to a first-time seller.
- They will demand **an MFN** or a benchmarking clause.
- Their procurement runs an RFP every three years *regardless of satisfaction*.
- **Your lender will cap your credit line** because of the concentration, and **your acquirer will
  discount your multiple 20–30%**. So the whale damages your balance sheet and your exit, not just
  your risk profile.
- And the cruellest one: **your engineering roadmap bends to them**, so the product you build stops
  fitting your other hundred customers.

### §2.10 "The Vendor Squeeze" — correct and sharpen (this is one of the best entries in the doc)
The cPanel-repricing reference is exactly right and it did reshape the industry. Two additions:
(a) the increase is typically **structural, not just numeric** — per-server becomes per-account, which
changes your unit economics at every tier and specifically punishes your densest, cheapest plans; and
(b) **the vendor prices to your switching cost**, so the mechanic should expose that (see §1.5 above).
Also add the correct third response the entry omits: **restructure your plans so the licence cost is
visible and attributable** (move the panel to a paid add-on), which shifts the increase to the
customers who actually use it and is what several real hosts did.

### §2.10 "The Support Vampire" — the counter list is good; add the segmentation answer
Knowledge base, policy line, and professional-services upsell are all right. Add the structural
answer: **plan-level support entitlements**. Support is a product, and giving unlimited support on a
$5 plan is a pricing error, not a customer problem. Fixing it is a rate-card change (chat on all
plans, phone above $50, 1-hour response above $200), and doing it makes the vampire either upgrade or
self-select out — both good outcomes. Worth stating, because "fire the customer" (§3.9) is the
emotionally satisfying answer and "reprice the support" is the correct one.

### §2.10 "The Price War / The Copycat" — the answer list is missing the real answer
Currently: match, differentiate, or segment up. The answer the industry actually uses is
**launch a fighter brand** (Part A). Matching on your own brand is the trap the entry correctly
identifies; differentiating is slow; segmenting up abandons volume. A second brand lets you match the
price *without* repricing your base or telling your existing customers they were overpaying. Add it as
a fourth option with its own costs (marketing duplication, support duplication, linkage risk).

### §2.10 "Deferred-Revenue Sinkhole" — excellent; add the second-order effect
The hole-under-the-vault visual is perfect. Add: annual prepay also **makes your churn number lie**.
Customers who've mentally quit stay on the books for up to 11 more months, so measured monthly churn
looks fantastic right up until the renewal cohort lands. **The Cohort View (§1.6) is the instrument
that catches this**, which gives that feature a specific job.

### §2.10 "Processor Termination" — correct the trigger detail
Chargeback thresholds are more nuanced than "1% for two months." In practice: the card networks'
excessive-dispute programs use a **combination of dispute ratio (around 0.9%) and absolute dispute
count (around 100/month)** — which means a small merchant with a high ratio may be fine and a large
one with a modest ratio may not. Also, **fraud ratio and dispute ratio are tracked separately**, and
the industry-specific reality that your ratio is computed against the *current* month's volume, so a
shrinking business's ratio gets worse automatically. That last detail is a beautiful trap: cutting
marketing during a chargeback crisis makes the ratio worse.

### §2.10 "The Reseller Who Oversells" — add the upside the entry omits
It's framed as pure risk ("highest revenue, highest abuse"). Add the reason people take them anyway:
**a reseller is near-zero CAC and near-zero support cost to you** — they absorb their customers'
tickets. The honest framing is: a reseller trades support burden for abuse burden and concentration
risk. Resellers are the highest-margin-per-hand revenue in shared hosting *and* the most dangerous,
which is a much more interesting card than "bad customer."

### §2.10 "SLA Credit Claim" — see the magnitude note above, and add the enterprise version
For an enterprise contract the meaningful clause is usually not the credit but the **termination
right**: three SLA breaches in a rolling 12 months lets them exit without penalty. **That's the real
weapon**, and it converts an availability problem into a revenue-cliff problem, which is much scarier
and much more accurate.

### §2.10 "Billing Failure" — expand into the full billing-run event
"Processor outage, MRR doesn't collect" is one case. The broader, better version is **the monthly
billing run as a scheduled high-risk event**: it can fail partially (some customers billed twice —
catastrophic and very real), fail silently (a plan's price didn't update), run against stale usage
data (Part A's Metering Blackout), or run correctly and generate 200 tickets because you changed the
invoice template. **The billing run deserves to be a recurring scheduled event on the calendar with
its own failure table**, exactly like a deploy.

### §2.11 "The Competitor (the game's rival AI)" — add the commercial attack list
The existing list (fake reviews, poaching, price undercutting, brand-keyword bidding, spurious abuse
complaints) is great. Add the ones real competitors actually do, all of which are legal:
- **Buying your brand keywords** (present) — and the retaliation ladder, which ends in a trademark
  complaint and an uneasy truce.
- **ETF buyouts of your contracted customers** (Part A) — the most effective one, and a direct cash
  attack.
- **Hiring your account manager and their relationships.**
- **Sponsoring the same community you sponsor, at a higher tier.**
- **Winning the platform "recommended host" slot you held.**
- **Publishing a comparison page targeting your brand** (which ranks for "[you] vs [them]" and
  intercepts your own branded search).
- **Undercutting only on the specific SKU your biggest customers buy** — surgical, not general.
- **Timing a promotion to your renewal cohort**, which they can infer from your public signup dates.
That last one makes your **renewal calendar a piece of intelligence** the competitor can exploit,
which is a lovely link between §3.7's Renewal Wave and the rival AI.

### §2.12 type-specific threats — three business-side additions
- **Colo: The Tenant Who Won't Leave.** At lease end a tenant "holds over" — stays past expiry,
  paying (or not) at the old rate, blocking space you've already sold to the next tenant. Legal
  remedies are slow. **The commercial equivalent of a stuck process.**
- **Email: The Customer Whose List Is Purchased.** Not a spammer by intent — a legitimate business
  that bought a marketing list. Their complaint rate poisons your shared IP pool. The counter is
  onboarding hygiene checks, which lose you the sale.
- **GPU: The Counterparty Default.** Your anchor tenant, on a 3-year contract that financed the
  hardware, runs out of funding in month 8. You have the cards, the power contract, the lease, and no
  revenue — in a market where everyone else is also trying to sublet GPU capacity. **The single most
  realistic 2025 hosting failure and it isn't in the document.**

---

## 3. Visitors, traffic, and clients

### §3.5 "Customer and client archetypes" table — extend the columns
The archetype table is one of the best artifacts in the document. It's missing the three columns that
determine whether each archetype is actually good business:

| Add column | Why |
|---|---|
| **Cost-to-serve/mo** | ARPU without it is meaningless — Hobby Harold at $4 with $6 of support is a loss |
| **Gross margin %** | The number that ranks the archetypes honestly |
| **CAC & payback** | LowEnd Larry at $3 with a $65 affiliate CPA has a 22-month payback and an 8-month tenure |
| **Typical term** | Month-to-month vs annual vs 3-year changes everything about the card |
| **Referral coefficient** | Nonprofit Nina and the Developer Customer earn their place here, not in ARPU |

Proposed values for a few, to show the shape: **Hobby Harold** $4 ARPU / $2.80 CTS / 30% margin /
$25 CAC / 9-month payback / monthly / 0.1 referrals. **Small Biz Brenda** $25 / $3 / 88% / $60 CAC /
2.4-month payback / annual / 0.4 referrals — **the best customer in hosting and the table should make
that arithmetically obvious.** **Enterprise Edith** $8,000 / $1,400 / 82% / $14,000 CAC / 6-month
payback / 3-year / 0.2 referrals but each worth $8k. **LowEnd Larry** $3 / $1.80 / 40% before CAC,
*negative after*.

### §3.5 "Government Greg" — expand; the procurement reality is great material
Net-90 is right. Add: you must be on a purchasing vehicle/schedule to bid at all (a multi-month
certification project); awards can be **protested** by losing bidders, delaying your revenue by
months; contracts are often **annual appropriations** so they can evaporate at a fiscal year boundary
regardless of satisfaction; and there are **socioeconomic set-asides** you may or may not qualify for,
which is either a moat or a wall. Payment is certain and slow, which is precisely a cash-flow puzzle
and not a credit-risk one — the game should make the player feel that distinction.

### §3.6 "Affiliate / Review-Site Pipeline" — add the two things that make this channel dangerous
The entry has volume, CPA, poor quality, and fraud. Add:
1. **Clawbacks.** Commission reverses on refund/early churn (45–90 day window). Managing the clawback
   is its own headache and affiliates hate it.
2. **The honest thing about "top 10 hosting" lists**: most are affiliate-monetized and ranking is
   substantially purchasable. The game should let the player buy placement — it works, it's how the
   industry functions, and it should sit in the same moral neighbourhood as §2.10's Astroturf
   Temptation without being as detonating, because it's legal and ubiquitous. **A grey channel, not a
   black one**, which is a more interesting design space than either.

### §3.6 "The SEO Garden / Organic Search Road" — add the algorithm-update risk and the moat
The entry says organic "can be washed out by an algorithm update event." Make that a real, recurring,
unpreventable event (Part A: The Core Update), and add the only actual defence: **brand/direct
traffic**, which is the one acquisition channel no third party can take from you. That gives brand
investment (§4.9's Brand Building) a specific mechanical job beyond a conversion multiplier: it's
channel insurance.

### §3.6 — the channel table the section is missing
The section lists ~25 channels with qualitative descriptions. One comparative table would make it
strategically usable:

| Channel | CAC | Ramp | Traffic quality | Durability | Notes |
|---|---|---|---|---|---|
| Organic search | $0 marginal, high fixed | 9–12 mo | High | Fragile (algorithm) | Compounds; dies with uptime |
| Paid search | $40–180 | Instant | Medium | None (stops with spend) | CPC rises with competitor spend |
| Affiliate | $65–150 CPA | 1–2 mo | Low | Medium | Clawbacks, coupon hijack |
| Referral | $25–60 bounty | 3–6 mo | **Highest** | High | Segment-local (see Part A) |
| Deal forum | $0–10 | Instant | **Worst** | None | Fills capacity with churn |
| Partner/reseller | ~$0 direct, 20–30% margin share | 6–9 mo | Medium | Medium | You don't own the customer |
| Agent/master agency | 10–20% residual forever | 6–12 mo | High | Medium | Permanent margin tax |
| Outbound sales | $3–15k per enterprise deal | 4–6 mo | High | High | Cash-flow trap if impatient |
| Conference | $8–40k per event | 2–4 mo lag | High | Low | Lumpy, relationship-driven |
| Platform "recommended" slot | Political + engineering | 12+ mo | **Highest** | Fragile (they can remove you) | Best channel in hosting |
| Registrar cross-sell | Near zero | Instant | Medium | High | Retention glue |
| Migration concierge | Staff hours | Reactive | **Highest** | High | Best ROI tactic, per the doc, correctly |
| Content/tooling magnet | Staff hours | 6 mo | High (developers) | High | Also a hiring channel |

### §3.7 "Save Offers" — specify the ladder and the permanence
The entry correctly notes over-use trains customers to threaten cancellation and that discounts are
sticky. Add the preference order a good retention desk uses, because it's non-obvious and teachable:
**pause > downgrade > add value > term extension at current price > months free > permanent
discount.** Pause and downgrade preserve the price point. Months free are a one-time cost. A permanent
discount reduces that customer's LTV forever *and* becomes the anchor for their next renewal
conversation. **The worst save offer is the one that feels cheapest.**

### §3.7 "Annual Prepay Push" — the entry is right; add the failure mode
"Improves cash and retention, creates a deferred liability, makes your MRR chart lie" — all correct.
Add: **it also delays your churn signal by up to a year**, so a company running hard on annual prepay
can be losing customers for three quarters and not know. The instrument that catches it is
renewal-rate-by-cohort, not monthly churn. This gives the Cohort View a second specific job.

### §3.7 "The Renewal Wave" — make it the business layer's signature recurring event
This is currently one paragraph and it deserves to be a system. Every customer has a renewal date;
they cluster by acquisition cohort; and the renewal is where **everything you did for twelve months
gets priced**: the outages, the price increase, the support quality, the competitor's campaign timed to
your cohort, and the discount they'll ask for. Recommend a **Renewal Calendar** as a permanent HUD
element alongside the wave timeline — so the player sees "47 accounts, $12,400 MRR, renewing in 3
weeks" and can act on it. **It's the business layer's equivalent of the wave telegraph (§1.7), and it
makes retention proactive instead of reactive.**

### §3.7 "Data Gravity as a retention mechanic" — correct the ethics framing and add the counter-trend
The entry is right that it's the best retention quality in the game. Add the modern complication:
egress fees and lock-in are under regulatory and competitive pressure (the "free egress on exit"
movement), so the *sustainability* of gravity-as-a-moat is itself a strategic bet. A host that builds
its retention on gravity and then has to waive egress is exposed. That's a genuinely current,
genuinely interesting business risk.

### §3.9 "SLA Contracts (per client)" — expand into the Contract Clause Library
See Part A §4. The single-toggle version ("higher MRR for penalty clauses") is the right instinct but
undersells the richest business subsystem available. At minimum add: credit cap, claim window,
maintenance exclusion, and the **three-breaches-and-they-can-exit** termination right, which is where
the real risk lives.

### §3.9 "The Sacrifice Decision" and "Firing a customer" — add the third option the doc omits
Sacrifice (drop their traffic now) and fire (offboard permanently) are both present. The middle
option, and usually the right one, is **reprice them at renewal so they fire themselves.** It's
slower, it's bloodless, it generates no review, and it either fixes the economics or removes the
customer — and it's how real operators handle 90% of "this customer is a problem." Worth adding
specifically because the two existing options are both dramatic and the realistic one is quiet.

### §3.9 "Client Growth" — add the pricing consequence
"Your best customer becomes your biggest capacity problem" is right. Add: **whether their growth
produces revenue depends entirely on how you priced them.** Flat-rate growth is pure cost. Usage-based
growth is pure upside. Tiered growth generates an upsell conversation at each threshold. **The
pricing model you chose two levels ago determines whether success is a windfall or a wound**, which
is the cleanest possible demonstration of P10 on the business side.

---

## 4. Buildables

### §4.9 "Pricing Engine / The Plan Builder" — this should be the flagship business building; add the missing fields
Already the best entry in §4.9. Missing fields that change everything:
- **Term ladder** (monthly / 12 / 24 / 36 with per-term pricing) — see T1.
- **Renewal price as a separate field from intro price**, with a visible "renewal shock %" warning.
- **Support entitlement per tier** (channels, response time) — support is a packaged product.
- **Overage policy** (hard cap / soft cap / auto-upgrade / bill it), because the choice determines
  whether you get bill-shock events or capacity events.
- **Payment methods permitted per tier** (card only below $X, ACH/wire above) — a margin lever.
- **Contract requirement** (self-serve vs signed MSA), which gates which customers can even buy.
- **Currency and regional pricing**, with the FX exposure that creates.
- And a live **"payback period" readout** next to the margin readout, because margin without payback
  is how hosts die while growing.

### §4.9 "Payment Gateway (primary + redundant)" — redundancy is deeper than a second gateway
Correct as far as it goes (2.9% + $0.30, multiple gateways, ACH, PayPal, crypto). Add the real
structure of redundancy: a second **acquiring bank**, ideally under a **second legal entity**, because
a termination is usually at the acquirer/underwriting level and a second gateway routing to the same
acquirer is theatre. Add **interchange-plus vs blended pricing** (at volume, interchange-plus saves
30–60 bps — a free margin upgrade nobody thinks about), **local acquiring for international cards**
(auth rates jump 5–15 points, which is pure recovered revenue), and **network tokenization** (raises
auth rates and survives card reissues, reducing involuntary churn). Each of these is a small,
boring, high-ROI upgrade — exactly the flavour §9.6's "make the boring thing beautiful" wants.

### §4.9 "Dunning Engine" — correct-ROI claim, add the depth (see §2.10 note above)
"Recovers 30–60%" is right. Give it upgrade levels: naive retry → smart retry timing → decline-code
handling → card updater → backup payment method → pre-expiry outreach → in-app + email + SMS
sequencing. **A ladder of unglamorous improvements each worth real money** is a great tech-tree
branch, and it directly counters the single largest churn source.

### §4.9 "Fraud Screening" — add the slider's second dimension
The strict/loose slider is right. Add that the *right* threshold differs wildly per product: a $3
shared account can't justify manual review; a $400 dedicated server can; a GPU reservation absolutely
requires it. So the tool should be **per-SKU**, not global — which is a small change that makes the
player think in product terms. Also add the specific, cheap, highly effective real screens: BIN
country vs IP country mismatch, disposable-email domains, velocity from one IP/fingerprint, first
payment declined then immediately retried, and a signup at 4am local with a rushed checkout. Each is a
rule the player can toggle with a stated false-positive cost.

### §4.9 "Cyber-Insurance Policy" — the entry is excellent; make the exclusions playable
"It doesn't cover you if MFA wasn't enforced" is exactly the right instinct. Extend it into the
**underwriting questionnaire as a recurring gate** (Part A's `The Insurance Renewal`), with the
current real requirement list: MFA everywhere including admin/VPN, EDR, immutable or offline backups,
a *tested* restore, a written IR plan, no EOL OS in scope, and privileged access management. And the
consequence chain: enterprise contracts require you to carry cover → losing insurability loses
customers. **That converts security hygiene from a cost centre into a sales prerequisite**, which is
both true and much more motivating than a risk score.

### §4.9 "Collections Desk" — expand into the real escalation ladder
One line currently. The ladder is genuinely good gameplay: reminder → dunning → phone → payment plan →
service suspension → termination → agency (25–40% fee, relationship dead) → legal (uneconomic below
~$25k) → write-off. Plus the counterintuitive core rule: **suspending a large delinquent customer
usually guarantees you'll never be paid**, so the right move is often to keep serving them on a
payment plan. Plus the data-hostage dilemma: do you give a non-paying customer their data back? (Yes,
usually, because the alternative is a viral story and possibly a lawsuit — and because a **data
retrieval fee** is a legitimate line item.)

### §4.9 "Compliance Vault" — add the sales-side payoff explicitly
The entry frames compliance as a gate to a customer tier. Add the measurable commercial effects that
make it worth the money: **shortens enterprise sales cycles** (a SOC 2 report replaces weeks of
security review), **raises win rate in competitive deals**, **allows premium pricing** (compliant
capacity commands 20–40% over commodity), and **reduces the questionnaire tax** (Part A's Trust
Center). Also the dark side: certification creates an ongoing **evidence-collection labour cost** that
is invisible in year one and substantial by year three.

### §4.9 "The Upsell Shelf" — add attach rates and the one genuinely huge omission
The product list is good. Add per-item **attach rate** targets so "improve attach rate" has a number
to move: backups 25–40%, dedicated IP 8–15%, SSL (post-Let's Encrypt) 3–8% and falling, priority
support 5–12%, malware cleanup 2–5% (and a reputation risk if fear-sold), professional services 1–3%
but at 5–20× the ARPU. And the omission: **domain registration is the most strategically important
item on the shelf and the worst-margin one** — 5–15% margin, but a customer whose domain is with you
churns roughly a third as often. The shelf's lesson should be that the item you make no money on is
the one that keeps you alive.

### §4.9 "Live Chat" — the sales/support placement insight is excellent; add the staffing economics
"Placed on the sales path it's a conversion tower; on the support path it's a cost centre" is one of
the sharpest lines in the document. Add the numbers so it's a real decision: a pre-sales chat answered
in under 30 seconds converts at roughly 3× (the document says this in §3.4 — connect the two entries),
an agent handles 3–5 concurrent chats vs 1 phone call, and chat coverage gaps are worse than no chat
because a "we're offline" widget reads as abandonment.

### §4.9 "Accounting / FP&A" — extend into the gate it deserves to be
"A tower that buys you information" is right. Add that it's also a **gate**: without a clean monthly
close you cannot get bank debt, cannot pass diligence, cannot compute cost-to-serve, and cannot know
whether a line of business is profitable. Recommend it be a *prerequisite* for several other business
unlocks rather than an optional information purchase — which makes the least glamorous building in the
game structurally load-bearing, in the same way the document already makes monitoring load-bearing on
the ops side. **Finance is observability for money**, and framing it that way makes engineers
understand it instantly.

### §4.9 "Procurement Desk" — add the vendor-relationship mechanics
"Turns a 400% hike into 90%" is right in spirit. Add the specific levers: multi-year commits for
price protection, **caps on annual increases written into the contract** (the single most valuable
procurement win and the cheapest to ask for), quarter-end timing (Part A's Distributor Rep), volume
tiers, and the **"we have a migration plan" leverage** described in §1.5 above. Also add the
supply-side credit relationship — net terms, credit limits, and the credit-hold threat.

### §4.9 "The Board / Investor Relations" — add the covenant
If you took debt rather than equity, the mechanic is different and better: **covenants**. Maintain a
minimum cash balance, a maximum leverage ratio, a minimum debt-service coverage — measured quarterly,
and breaching one gives the lender rights (repricing, acceleration, control). **A number you must
keep above a line for reasons entirely outside the game's action economy** is excellent late-game
pressure, and it's how most real hosting companies with hardware debt actually live.

### §4.8 "Sales Rep / Sales Engineer" — add the comp plan and the ramp
The entry has the key insight (sales without ops is worthless; they over-promise and create
obligations). Add: reps take **4–6 months to ramp** and ~30–40% don't work out, so hiring sales is a
lagging, lossy investment — which fits P10 perfectly. Add the comp plan as a tunable (Part A §4). And
add the sharpest real detail: **a rep's pipeline leaves with them**, so losing a rep in month 9 costs
you the deals they were working, not just the headcount.

### §4.8 "Account Manager / Customer Success Manager" — add the coverage math
"The one hire an engineer-player will resist and shouldn't" is correct. Give it a number so the player
can reason: one CSM covers roughly 20–40 mid-market accounts or 3–8 enterprise accounts, and the
ROI comes from churn reduction on the covered book — typically 2–5 percentage points of annual churn,
which on a $2M book is $40–100k/yr against a $90k cost. **Marginal, and that's the point**: CSM is
worth it above an ARPU threshold and a waste below it, which makes it a *segmentation* decision rather
than a yes/no.

### §4.8 "Abuse / Trust & Safety" — add the upstream SLA
The policy dial is right. Add the hard external constraint that makes it urgent: **your upstream and
your RIR expect abuse@ to be monitored and complaints actioned within 24–48 hours.** Miss that and the
escalation isn't a customer complaint, it's your transit provider's abuse team, and after that it's a
null route. That turns the abuse desk from a moral dial into a **countdown**, which is much better
gameplay.

### §4.8 — add "The Controller / Bookkeeper" as a distinct early hire
The staff list jumps from engineers to FP&A. The actual first finance hire in a hosting company is a
bookkeeper, and they're transformative: invoices go out on time, dunning runs, receivables get chased,
and you find out what you actually make. **Cheap, unglamorous, and the reason a lot of small hosts
survive.** Good early-tier hire with a visible, immediate effect (DSO drops, leakage drops), which
teaches the player that the business machine has staff too.

### §4.4 "IP Space (owned vs leased)" — the entry is great; add the revenue side
"Reputation is attached to addresses" and "your unused /24 is a rentable asset" are both excellent.
Add the scale of it: at ~$0.50–0.80/address/month, an unused /22 (1,024 addresses) is **$500–800/mo of
near-100%-margin revenue**, and a /16 held since the 1990s is a seven-figure balance-sheet asset that
many old hosts are quietly worth more for than their operations. **The legacy asset that outvalues the
business is a wonderful late-campaign reveal**, and it ties directly to §9.2's Legacy Box theme.

---

## 5. Unlocks and discovery

### §5.2 "Scar-driven unlocks" — the business scars list is good; extend it
The existing business scars (first chargeback, first cash crunch, first annual prepay, first
acquisition offer) are well chosen. See Part A §5 for a further ~14. The structural point: **the
business tree should be almost entirely scar-driven**, more so than the infrastructure tree, because
nobody builds a dunning engine or a deal desk speculatively — you build it the month after it cost
you. That's both true and good progression design.

### §5.3 "Scale milestones" — add the commercial thresholds
The list is infrastructure-flavoured (customers, employees, sites, ASN). Add the commercial ones,
which are equally load-bearing:
- **First customer who asks for an invoice instead of paying by card** → invoicing, net terms, AR.
- **First customer who sends you a contract instead of clicking your terms** → the MSA and Quote Desk.
- **$10k MRR** → you can afford a part-time bookkeeper, which unlocks everything financial.
- **First international customer** → currency, tax, and the nexus monitor.
- **First customer above 10% of revenue** → the Concentration alarm.
- **First renewal cohort** (12 months after your first annual sale) → the Renewal Calendar and cohort
  retention, which cannot exist before you have a year of history. **A mechanic gated on elapsed
  in-fiction time rather than on achievement** is rare and appropriate here.
- **First month where a line's gross margin is computable** → the per-line P&L.

### §5.5 "The CEO branches" — the eight branches are right; add gating and interlocks
Pricing Science / Retention / Margin / Trust / Channel / Brand / Finance / M&A is a good spine. Two
improvements:
1. **Gate them on data, not money.** Pricing Science requires 12 months of cohort data. Retention
   requires exit-survey history. Margin requires cost-to-serve instrumentation. M&A requires clean
   books. **You cannot buy business capability without having measured something first**, which is
   both true and a lovely mirror of the Sense/observability branch on the ops side.
2. **Add interlocks with the ops tree.** Trust requires Sense (you can't publish a status page
   honestly without monitoring). Margin requires Scale (automation). Channel requires Serve (you can't
   let partners provision without an API). **Cross-branch synergy nodes (§5.5) should specifically
   span the ops and business trees**, which makes the two halves one game instead of two.

### §5.6 "The prerequisite lattice" — excellent; add the *commercial* prerequisites
The technical prerequisites are the best structural idea in the section. Add the commercial ones,
which gate just as hard in reality:
- **Regulated hosting** also needs: cyber insurance at required limits, a legal budget, a compliance
  officer, background-checked staff (present), **and 12 months of clean audit-able history** — you
  cannot buy your way in this quarter.
- **Enterprise/government** needs: an MSA template, the ability to accept net-60, a reference program,
  and a supplier-registration capability.
- **Colocation landlord** needs: a lease you can sublet or a building you own, **an insurance program**
  (your tenants will require certificates), and a security/escort capability.
- **GPU** needs: an OEM allocation relationship and a way to finance the hardware — **the capital
  structure is the gate, not the cooling.**
- **Email** — the "clean IP reputation for 12 months" gate is the best one in the document and should
  be kept exactly as written.
- **Reseller/agent channel** needs: a commission portal and a quotable rate card.

### §5.6 "Repurposing" / §6.6 "The obsolescence clock and the cascade down-tier" — connect them to the pivot
These two entries describe the same excellent idea from different sections and should cross-reference.
Add the commercial completion: the cascade's last step isn't scrap, it's **ITAD with residual value
and a certificate of destruction** (Part A §4), and the residual value is a real, forecastable line of
cash that funds the next generation. **A game where old hardware pays for new hardware** makes the
depreciation curve feel like a strategy rather than a tax.

### §5.7 "The Deprecation Mechanic" — add the commercial deprecation, which is worse
Tech nodes rotting is great. Add that **products rot too**: a plan you sold in 2019 with features you
no longer offer, on a platform you no longer maintain, to customers who will not migrate. Every host
carries these. Deprecating it is Part A's `Sunset Letter` level. **Product debt is more expensive than
technical debt because it has customers attached to it**, and it's a better fit for the Legacy Box
theme (§9.2) than a server is.

### §5.7 "Lapsed certification" — right, and add the insurance twin
"Existing contracts survive to term; no new ones" is the correct mechanic. The same shape applies to
insurance lapse, peering loss, marketplace delisting, and losing a platform recommendation. Recommend
generalizing it as a rule: **an accreditation loss doesn't break what you have, it stops what's next** —
which is a slow, visible, fair failure mode entirely in keeping with §6.10's soft-over-hard rule.

---

## 6. Economy, money, and scoring

### §6.2 "Margin ranking (the honest hierarchy)" — mostly right; three corrections
The ranking is: cross-connects → colo power/space → managed services → domains/SSL/licences →
dedicated → VPS → shared → bandwidth resale → GPU spot → price-only.
- **Move domains/SSL/licence resale down.** SSL margin has largely collapsed since free certificates;
  domains are 5–15%. They belong near the bottom on margin — and the entry should say explicitly that
  **you carry them for retention, not margin**, which is the actual reason and a better lesson.
- **Bandwidth resale is not uniformly bad.** With a good peering ratio and IX presence, blended
  delivery cost can be 40–60% below pure transit, and reselling at retail is a solid margin. The
  honest statement is: bandwidth resale is thin if you buy transit and resell it, and good if you
  built a network. **That distinction is the whole reason to build a network**, which makes §5.6's
  carrier ladder pay off.
- **Add professional services near the top** (60–80% margin on senior hours), with the caveat that it
  consumes the scarcest resource (§6.1's Hands) and doesn't scale.

### §6.3 "Bandwidth: the 95th-percentile bill" — the best cost entry in the document; two additions
The mechanic is correctly explained and the visual (the discarded top 5% shaded out) is perfect. Add:
1. **Current price levels and the deflation trend.** IP transit has fallen roughly 15–20%/year for
   two decades; it's $0.15–0.60/Mbps/mo at commit in major markets now. **Your bandwidth cost falls if
   you renegotiate and stays flat if you don't** — a rare positive event, and one that rewards the
   Procurement Desk with a visible win.
2. **Commit structure.** You commit to a volume for a rate; overage above commit bills at a higher
   rate; and undershooting your commit means paying for air. So the transit contract is a
   **take-or-pay** (Part A), and the "how much do I commit to" decision is a forecast bet with a
   penalty in both directions. That's a genuinely good annual decision to hand the player.

### §6.3 "Customer acquisition cost (CAC)" — correct one framing
"A channel with a 14-month payback and 11-month tenure is a machine for destroying cash" — exactly
right, and the best sentence in §6.3. One addition: **payback should be computed on gross margin, not
revenue.** A $10/mo customer with 70% margin at $65 CAC pays back in 9.3 months, not 6.5. Hosts that
compute payback on revenue systematically overestimate how healthy their channels are — which is
precisely the kind of subtle, real, teachable error the game can embody.

### §6.3 "Transaction and payment costs" — the $3-plan arithmetic is right; extend it
"2.9% + 30¢ is 13% of a $3 plan" is correct and devastating. Add the three consequences that follow
and that explain the whole low-end industry:
1. **This is why $3 plans are sold annually** — one $36 charge costs $1.34 (3.7%) instead of twelve
   charges costing $4.68 (13%).
2. **It's why the low end pushes 3-year terms** so aggressively; it isn't only lock-in, it's the
   payment economics.
3. **It's why ACH/wire minimums exist** — moving a $500/mo customer from card to ACH is a free
   1.5–2.5% margin gain, which at scale is a whole engineer's salary.

### §6.4 "Net-30 / 60 / 90" — add the reality that net-60 is net-75
Enterprise AP runs on check/payment batches, and the clock often starts when *they* process your
invoice, not when you send it. Add the levers: invoice immediately (not at month end), get the PO
number before invoicing (missing PO = automatic 30-day delay), offer 2/10 net 30 (2% discount for
payment in 10 days — expensive but real), and track DSO as the metric. **DSO is already in §6.8's cash
block; connect the two entries** so the player can see the lever and the meter together.

### §6.4 "The invoice calendar" — good; add the collision that makes it a puzzle
The calendar (billing on the 1st, declines days 1–4, dunning 5–20, payroll on the 15th and month-end,
transit and power mid-month) is a great mechanic. Add the collision that makes it tense: **your money
arrives on a distribution and leaves on a deadline.** Payroll is exact. Card settlement is 2–3 days
after capture. Enterprise AR is a 30-to-90-day smear. So a month where dunning underperforms by 4%
can miss payroll while the P&L looks fine. **That's the single clearest demonstration of the
cash-vs-profit thesis (§6.4) and it should be an authored scenario beat, not just a background rhythm.**

### §6.5 "The oversell ratio" — the generalization across types is excellent; add real numbers
"One slider, every hosting type" is right. Anchors, so the slider has honest detents:
shared hosting disk/CPU 5:1 to 20:1 (30:1 exists and is a choice); VPS RAM 1:1 to 1.5:1 (RAM oversell
is the dangerous one — the entry's §0.3 note that "RAM is always the constraint" is correct), VPS CPU
4:1 to 16:1; colo power 1.2:1 to 1.6:1 against installed capacity (diversity factor — tenants rarely
draw nameplate); bandwidth contention 5:1 to 50:1 depending on market; GPU time-slicing 1:1 for
training (you cannot oversell a training job) and 2:1 to 6:1 for inference. **And the key nuance the
entry should state: oversell is safe until demand *correlates*.** The failure isn't average load, it's
Black Friday, patch day, a game launch, or 6pm — which ties the slider directly to §1.6's Seasonality.

### §6.5 "Grandfathering" — add the three real tactics
The entry frames it as a binary (force-migrate and churn, or carry the margin loss forever). The three
things real hosts actually do:
1. **Deprecate the plan, don't reprice the customer.** New signups can't buy it; existing customers
   keep it until they change something. Attrition handles it over 3–5 years.
2. **Raise price with added value.** "Your plan now includes daily backups and it's $2 more." Churn on
   a value-paired increase is roughly half that of a naked one.
3. **Migrate on a trigger.** Any upgrade, downgrade, or plan change moves them to current pricing.
   Slow, silent, and invisible to review sites.
**All three are slow**, which reinforces the correct lesson from §1.7: pricing is a low-frequency
instrument.

### §6.6 revenue-shape table — three factual corrections to the "Cash timing" column
This table is a genuinely valuable artifact and worth getting right.
- **Shared web: "monthly card" is wrong for the retail market.** The overwhelming majority of retail
  shared hosting is sold as 12/24/36-month prepay at a discounted intro rate, renewing at full price.
  Change to "prepaid term, renews annually," and note the renewal cliff as the signature dynamic.
- **Colocation: "annual/quarterly" is wrong.** Colo is a 3–5 year term **billed monthly in advance**,
  with an annual escalator, a security deposit, and NRC at install. Change to "monthly in advance on a
  multi-year term."
- **GPU / AI: "hourly/prepay" undersells it.** Add "reserved 1–3 year contracts, often with
  prepayment, are how the hardware is financed; hourly is the residual." Also change the margin cell
  from "boom/bust" to "boom/bust, and entirely determined by contracted utilization."
Additional columns worth adding to the table: **typical term**, **churn**, and **cash conversion
cycle** — the last being the one that explains why some of these businesses are self-funding and
others need capital.

### §6.6 "Cross-connects: the best line item in hosting" — accurate; two additions
~90%+ margin and enormous stickiness are both right. Add:
1. **NRC matters.** Install charges of $250–500 per cross-connect are a meaningful one-time revenue
   stream in a growing facility, and they're the "setup fee" lever (§6.2) in colo form.
2. **This is exactly why carrier-neutral matters.** If you're a tenant in someone else's building,
   *they* collect the cross-connect revenue and you can't. Owning the meet-me room is the difference
   between selling space and selling an ecosystem — which retroactively explains why §5.6 lists
   "carrier relationships + meet-me room" as unlocking the highest-margin line in the game.

### §6.6 "Occupancy and stranded capacity" — add the leasing-velocity dimension
Occupancy and stranded capacity are well covered. Add the third facility number that real operators
live on: **absorption rate** (how fast you lease, in kW or cabinets per month) versus **build rate**.
Build faster than you lease and you carry empty capacity; build slower and you turn away deals and
your sales team stops selling. **The whole facility business is a pacing problem between two
schedules**, which is a much better core loop for a landlord level than occupancy alone.

### §6.6 "GPU price volatility" — add the financing structure, which is the actual risk
Utilization thresholds (70% to break even, 90% and you can't maintain) are good. The missing piece is
that **GPU hosting is a financing business wearing a compute costume**: the cards are bought with
debt, a lease, or customer prepayment, and the term of that financing versus the term of your customer
contracts is the whole risk. Financing 4 years of hardware against 1-year customer contracts in a
market that reprices every 9 months is how these companies die. **Contract-term-versus-financing-term
mismatch should be a visible, scored stat in any GPU level**, and it generalizes: it's the same risk a
colo operator runs signing a 15-year building lease against 3-year tenant leases.

### §6.6 "Demand response and time-of-use" — right, and pair it with the ratchet
Getting paid to shed load is real and nicely chosen. Pair it with Part A's **demand-charge ratchet**,
which is the same market pointed the other way: you get paid to reduce peaks and punished for setting
them. Together they make **the shape of your power draw, not the amount, a managed resource** — a
genuinely novel and completely authentic mechanic.

### §6.7 "The whale signs" — "a cash-flow crisis disguised as a celebration" is perfect; extend
Add the full landing sequence, which makes it a scenario rather than an event: security questionnaire
(engineering hands) → legal redlines (2–6 weeks) → supplier onboarding (30–60 days after signature) →
hardware purchase up front → install with a committed date and a penalty → net-60 from first invoice
→ **so cash from a deal signed in January arrives in June.** Five months of cost before one dollar
of revenue. That's the crisis, and spelling out the sequence makes it teachable.

### §6.7 "Marketing spend" — "channels saturate" is the key insight; add the shape
Add the actual curve: each channel has a **saturation point** past which incremental CAC rises
steeply (paid search saturates fastest, affiliate next, referral has a hard ceiling set by customer
count, content compounds slowly with no ceiling). So growth requires **adding channels**, not adding
budget — which is the single most common mistake in subscription marketing and a great trap. Also
reinforce, as the entry correctly says, that **ad spend never moves Reputation**; the player should
try it once and watch nothing happen.

### §6.8 "The metrics HUD" — the metric set is strong; three additions and one discipline note
Additions: **contracted revenue %** and **weighted average remaining contract term** (the two numbers
that separate an asset from a rumour); **revenue quality composition** (Part A's colour bar);
**absorption vs build rate** in facility lines. The discipline note — "nothing on the HUD the player
cannot act on" — is exactly right and should be applied harder to the business block: NRR, LTV:CAC and
DSO are *drawer* metrics reviewed monthly, not HUD metrics. **Cash, runway, MRR, and the SLA/credit
meter are the only business numbers that belong on screen during play.**

### §6.9 "The valuation and the diligence report" — the best scoring idea in the document; make the math honest
"ARR × a multiple, modified by growth, NRR, churn, concentration, margin, infrastructure quality" is
the right structure. Make the modifiers explicit and per-line (Part A §6's valuation-basis table), and
add the modifiers that actually move a hosting valuation most:
- **Weighted average contract term remaining** — the single biggest multiple driver in colo and
  managed services.
- **Revenue concentration** — >25% in one customer typically costs 20–30% of the multiple.
- **Owner dependence** — if the founder is the sales team, the support escalation path, and the only
  person with root, the multiple drops hard. **Key-person risk is priced**, which retroactively values
  every documentation and delegation decision the player made.
- **Quality of earnings** — are your numbers reconcilable? Unreconcilable books cost turns.
- **Contract assignability** — see Part A's `Consent to Assignment`.
- **Deferred revenue balance** — comes off the price as a working-capital adjustment, so a company
  funded by annual prepay sells for less than its bank balance suggests. **A beautifully unfair-feeling
  truth to end a campaign on.**

### §6.9 "Money Left On The Table" — add the second kind of uncollected money
The entry counts revenue lost to bounces, false-positive blocks, and queueing. Add the mirror:
**revenue you earned and failed to bill** (Part A's leakage) and **revenue you billed and failed to
collect** (bad debt). Three columns — didn't earn it, didn't bill it, didn't collect it — is a
complete and quietly devastating readout.

### §6.10 "Win and lose conditions" — add three lose conditions and one win
**Lose:** *Debanked* (no way to receive money — distinct from processor termination, which is
card-only). *Uninsurable* (a slow one: you lose cover, then the contracts that require it, then the
customers). *Covenant breach* (your lender takes control — the only lose condition where you're still
profitable and still lose).
**Win:** *The Annuity* — reach a state where contracted revenue with >24 months remaining exceeds your
fixed cost base. Not growth, not scale, not a sale: **structural safety**, which is what most real
operators are actually playing for and which no game offers as a win condition.

### §6.11 "Financing instruments" — three missing instruments and one correction
**Missing:**
- **Invoice factoring / AR financing** — 1–3% per 30 days for immediate cash on receivables.
  Importantly, it is *not* the same trap as a merchant cash advance, and the game should distinguish
  them, because teaching "all fast money is bad" is wrong and teaching "understand the effective rate"
  is right.
- **Sale-leaseback** — sell your building or your hardware and lease it back. Converts an asset into
  cash at the cost of a permanent operating expense. The classic move of a company that needs capital
  and has already used its other options.
- **Vendor/OEM financing** — the hardware vendor finances the purchase directly, often at better terms
  than a bank because they know the collateral's value. In GPU-era hosting this is enormous.
**Correction:** "Equipment financing... terms are good" understates how central it is. **Asset-backed
lending is the defining financial characteristic of hosting** versus software: you have collateral, so
you can borrow instead of diluting. A hosting company that takes venture capital usually didn't need
to, and the game should let the player discover that equipment finance at 8–12% is dramatically
cheaper than equity at any price.

---

## 7. Core gameplay mechanics

### §7.5 "The Inbox: decisions as cards" — good; make the cards carry the delay explicitly
The Inbox is the right container for the business layer. One improvement: every card should display
**when its consequence lands**, not just what it costs — "effect in 90 days," "effect at renewal,"
"effect at audit." That makes P10 legible rather than mysterious, and it turns the Inbox into a
scheduling puzzle (what am I willing to have land in month 4?) instead of a multiple-choice quiz.

### §7.5 "The 90-day lag" — correct the uniformity
"Business decisions pay off a quarter later" is a great signature mechanic, but the real lags vary by
a factor of ten and the variance *is* the strategy:
- Ad spend on: hours. Ad spend off: hours. (Instant both ways.)
- Price change: immediate on new, 12 months on the base.
- Support cuts: 60–120 days (churn shows at renewal or after two bad tickets).
- Content/SEO: 6–12 months on, 3–6 months to decay off.
- Sales hire: 4–6 months to productivity, and their pipeline leaves with them.
- Certification: 6–18 months, then a step change in eligible customers.
- Reputation damage: instant. Reputation repair: 6–18 months.
- Technical debt: 1–3 years, then all at once.
**The asymmetry between how fast things turn off and how slowly they turn on is the real lesson**, and
naming the mechanic "the 90-day lag" flattens it. Recommend renaming it **the Lag Table** and showing
the actual lag per decision on the card.

### §7.5 "Autopilot and delegation policies" — extend to the commercial side
The entry's examples are operational ("restart on OOM," "approve refunds under $50"). The commercial
delegation policies are richer and more consequential: discount authority ceiling, credit limit
approval threshold, refund authority, suspension policy for non-payment, abuse-desk aggressiveness,
which tickets escalate to engineering, and whether sales can sign non-standard contract terms.
**Each is a dial that trades your attention for risk**, and collectively they are what "running a
company" feels like once you're no longer doing everything yourself.

### §7.5 "Executive attention as a tiny pool" / "CEO Override" — the best pair in §7.5; add the cost
"The game gradually takes the controls away from you and gives you a company instead" is the strongest
progression idea in the document. One addition: **the Override should have a visible cost to the
organization, not just to your month.** Personally closing a deal means the sales team didn't learn
how; personally fixing the outage means the runbook didn't get written; personally handling the angry
customer sets a precedent that the CEO will handle angry customers. **Founder heroics should
degrade the system that would otherwise have improved** — which is both true and a genuinely novel
disincentive.

### §7.7 "The technical debt meter" and §6.3 "Technical debt interest" — connect, and add commercial debt
Making debt a line on the P&L is the best version of this idea anywhere. Add the second kind:
**commercial debt** — the non-standard contract terms you signed, the grandfathered price tiers you
maintain, the one-off SLA you promised, the discount you can't undo, the feature you built for one
customer, the reseller agreement from 2016 nobody can find. It accrues exactly like technical debt,
it's invisible until diligence, and its interest is paid in *your attention* rather than in staff
hours. **A second debt meter next to the first, in a different colour**, and the postmortem should
show both.

### §7.8 "Per-type sliders" / "The scarce-resource meter swaps" — add the commercial slider set
The per-type ruleset swaps the scarce resource, the patience analog, the threat mix. Add a fourth
swap: **the commercial slider that defines the type.** Shared = oversell ratio. VPS = overcommit.
Colo = power billing model (committed/metered/flat). GPU = reserved-vs-spot mix. Backup =
restore-SLA tier pricing. CDN = commit level and overage rate. Email = outbound rate limits. Game =
monthly-vs-hourly billing. VoIP = rate deck margin per destination. **One signature economic dial per
line**, exactly parallel to the one signature meter per line the visual section already specifies —
which makes each hosting type feel different in the wallet as well as on the board.

### §7.9 "Opportunity events" — expand; the business layer needs positive events too
The document is rich in business *threats* and thin in business *opportunities*. Positive events worth
having on the same generator: a competitor's outage (present, as migration concierge); a vendor's
quarter-end discount; an inbound whale from a reference; a transit renegotiation that lowers your
cost; a utility efficiency rebate (present); an unexpectedly good renewal cohort; a customer's
acquisition by a bigger company that expands their contract; being added to a marketplace; a journalist
writing something nice; the IPv4 block you forgot you owned. **The business layer's calm periods need
upside events or the whole commercial half reads as a punishment system**, which is a real risk given
how much of §2.10 is (correctly) grim.

---

## 8. Visuals and presentation

### §8.8 "The Ledger Drawer" / "The SLA Meter" / "The Concentration Donut" / "The Obligation Rail"
These four are the business HUD and they're well chosen. Refinements:
- **The SLA Meter counting up in red during an incident** is excellent, but given the magnitude
  correction in Part B §2, the number it counts should probably be *estimated churn risk* or
  *projected renewal concession*, not credits — otherwise the player learns that outages are cheap,
  which is the wrong lesson. Or show both, with credits small and the churn estimate large, which is
  itself the lesson.
- **The Concentration Donut** should show *two* donuts: revenue by customer and revenue by line of
  business. Concentration in a line is as dangerous as concentration in a customer and much less
  obvious.
- **The Obligation Rail** should be the Commit Ledger (Part A §7) — everything you owe, with dates.
- Add a fifth: **the Renewal Calendar** (Part B §3), which is the business layer's wave telegraph.

### §8.7 "Money as motion" — extend with revenue quality
The document's money visuals are good (coins, the cash register rhythm, the fine drizzle for
per-query billing). Add the colour and weight system from Part A §8 so the *character* of your revenue
is visible in motion, not just its quantity. A month of gold coins and a month of red confetti summing
to the same number is the single most efficient way to teach "revenue quality" without a tutorial.

### §8.10 "Per-line visual identities" — add a commercial visual per line
Each line already gets an accent hue, a visitor costume, a hero silhouette, a bespoke meter, and a
catastrophe FX (§0.2's Five-Asset Skin Kit). Recommend a sixth asset, cheap and high-value: **a
bespoke commercial artifact.** Shared hosting = the coupon code. Colo = the signed lease with an
escalator clause. GPU = the reservation contract with a term and a prepayment. Backup = the restore-SLA
certificate. Email = the deliverability report. VoIP = the rate deck. Game hosting = the community
Discord. Regulated = the audit report. **The object the customer actually cares about**, rendered, and
it costs one icon per line.

### §1.8 "The Logo Evolves (reputation as typography)" — extend to the whole brand
Wonderful idea. Extend it: it's not just polish, it's **positioning**. A budget brand's logo stays
loud and cheap-looking by design; a premium brand's gets quieter and more confident; a compliance-
focused brand goes conservative and serif. In multi-brand play (Part A), the three logos evolving
along three different trajectories in the same office is a great running visual. And the campaign's
best quiet joke: a rebrand costs real money, achieves nothing measurable, and everyone feels better.

---

## 9. Anything else

### §9.2 "The Investor Dashboard Lie" — good; connect it to diligence explicitly
The mechanic is right (present selectively, risk discovery). Make the discovery moment concrete:
every optimistic framing you used becomes a **specific line in the diligence report** (§6.9) two
levels later, where an analyst asks about it by name. **Consequences with receipts** are far better
than a generic reputation hit, and it makes the Part A `Due Diligence` level the payoff for a mechanic
seeded twenty hours earlier.

### §9.2 "The Line That Eats You" — excellent; give it a number
"60% of your support load and 15% of your revenue" is exactly the right shape. Add the instrument that
reveals it — **per-line contribution margin after allocated support** — and the trap that hides it:
without transfer pricing and cost allocation (Part A §4), the line looks profitable because its costs
are pooled with everyone else's. **You cannot see the line eating you until you build the accounting
to see it**, which is a perfect Sense-branch payoff on the business side.

### §9.2 "You Can Fire Customers" — keep, and add the quieter sibling
Firing customers is the cathartic verb and should stay. Add the realistic one next to it: **repricing
at renewal**, which achieves the same outcome without the review. Having both in the UI, side by side,
with the cathartic one visibly costlier, is a small piece of design that teaches restraint.

### §9.2 "Vendor Personalities" — extend into a full counterparty cast
The document has vendor personalities. Extend to every counterparty the business has, because they all
behave differently and they're all recurring characters: your **transit provider** (competent,
bureaucratic, will not admit an outage), your **landlord** (fine until the building is sold), your
**processor** (invisible until they're a threat), your **bank** (invisible until they're a threat),
your **auditor** (thorough and expensive), your **insurer** (asks harder questions every year), your
**distributor** (your friend at quarter end), your **biggest agent** (charming and disloyal), and your
**lender** (fine as long as the covenant holds). **Nine relationships you maintain or neglect**, each
with a trust stat, and most of them only matter on the day they matter — which is the hidden-fifth-
currency idea (§6.1's trust-with-upstreams) given a cast.

### §9.3 "The status page euphemism ladder" — keep exactly as is; add the commercial twin
The euphemism ladder is one of the funniest and truest bits in the document. Its commercial mirror:
**the price increase euphemism ladder.** "Investing in our platform." "Aligning our pricing with the
value we deliver." "A modest adjustment." "Your plan is being upgraded." Same structure, same
recognition comedy, and the player writes it themselves, which makes them complicit.

### §9.5 "The 'was that real?' tag" — the business mechanics need it most
The tag exists to distinguish real failure modes from game simplifications. The business layer is
where players will most often assume the game is exaggerating, and most often be wrong. Tag at
minimum: the 95th percentile, rolling reserves, demand-charge ratchets, MFN clauses, consent-to-
assignment, agent residuals paid forever, ETF buyouts, the cPanel repricing, "unlimited" fine print,
net-60 meaning net-75, SLA credits being trivially small, and the fact that most "top 10 hosting"
lists are affiliate-monetized. **Every one of those will read as invented and none of them are**,
which is exactly the reaction that makes an educational tag worth shipping.

### §9.6 "Design guardrails" — propose one addition
The guardrails are strong (every tower has a downside, no optimal build order, lose slowly, teach
through loss, three clocks, make the boring thing beautiful, the reward is letting things through).
Proposed addition, in the same register:

> **Revenue is never just a number.** Any mechanic that adds money must also say what *kind* of money
> it is — how long it lasts, what it costs to serve, who else has a claim on it, and when it actually
> arrives in the bank. If a design change adds revenue without answering those four questions, it
> isn't finished.

That guardrail is the whole CEO lens compressed to four lines, and it's the thing that keeps the
business half from collapsing into a score.
