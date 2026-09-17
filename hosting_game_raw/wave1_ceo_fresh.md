# Hosting Tower Defense — Idea Wave 1 — Lens: **CEO / Marketing (real hosting operator)**

> **Framing for everything below.** In this lens the player is not "a sysadmin who also has customers."
> The player is the **owner-operator of a hosting company**. Servers are *cost centers that produce
> billable capacity*. Customers are *revenue with a support-cost tail*. Attacks are *unbudgeted expense
> events*. Downtime is *SLA credits, refund requests, churn, and a review-site hit*. Every single tower,
> lane, upgrade, and pixel below is chosen because a real hosting operator would look at it and say
> "yep, that's the job."
>
> The three numbers that should be on screen at all times and that everything in this doc plugs into:
> **MRR** (recurring revenue), **Cash** (what's in the bank right now — a different thing entirely),
> and **Reputation** (the multiplier on every future customer you will ever get).
>
> The central business truth this game should teach by making the player feel it:
> **You can be profitable and die anyway (cash flow), and you can be growing and die anyway (churn + CAC).**

---

## 1. Levels, Scenarios, and Progression

### 1.1 The campaign ladder (each level = a business stage with a different P&L shape)

**L1 — "One Site, One Server" (The Freelancer)**
You host *your own* WordPress site plus three favors for friends. Revenue: $0. The level teaches that
uptime has a cost even when nobody's paying. The "win" is getting one friend to actually pay you $10/mo.
Introduces: the visitor lane, the single web server, a single threat lane (bots), and the invoice object.
The comedy beat: your first invoice is $10 and your hosting bill is $12.

**L2 — "The Reseller" (Someone Else's Servers, Your Name on the Bill)**
You buy a reseller account from a bigger host. You now have **billing, support, and a brand**, but no
infrastructure control — when the upstream goes down, *you* eat the tickets and *you* eat the churn, and
your only defense tower is "write a nice status update." Teaches: reputation risk you cannot engineer
away, and that support cost is real labor. Introduces WHMCS-style billing, the ticket queue, the
cancellation form. Fail state: upstream has 3 outages, your 40 clients leave, MRR hits zero.

**L3 — "Two U's in Someone's Rack" (Colo)**
You colocate two 1U boxes. Now you pay **per-U, per-amp, per-cross-connect, per-remote-hands-hour**, and
every physical action costs a drive or a phone call. Introduces the *capex vs opex* choice (buy the
server vs lease it), hardware failure, and the "it's 2am and the DC tech won't answer" event. First time
the player sees a **bandwidth 95th-percentile bill** and learns that one customer's traffic spike bills
them for the whole month.

**L4 — "The Shared Hosting Shop" (100 Customers, $5 Each)**
Your first real volume business. Oversell ratio becomes a slider. One abusive customer's runaway cron
degrades 99 others. Introduces: plan tiers, coupon codes, the abuse desk, the chargeback, and
**support-cost-per-dollar-of-revenue** — the number that kills every cheap host. Win condition: $2,500
MRR with support hours under a threshold.

**L5 — "The VPS Provider" (LowEnd Land)**
You sell virtual machines to strangers on the internet for $4/mo. Introduces **fraud signups**, crypto
miners, DDoS-origination abuse, and the "your entire /24 is now on Spamhaus" catastrophe. Teaches the
difference between *revenue* and *good revenue*. New tower category: fraud scoring at checkout, which
lowers revenue on purpose and makes you more money.

**L6 — "Managed & Serious" (Your Own Cage, Real Stack)**
Load balancers, DB replicas, cache tier, staging, monitoring. You start selling **SLAs with teeth** and
must staff to meet them. Introduces contract law as a mechanic: an SLA credit clause is a *tower you
build and a bomb you carry*. First enterprise prospect appears, and demands a security questionnaire you
can't answer yet.

**L7 — "The Datacenter Operator" (Racks, Not Servers)**
You stop selling websites and start selling **space, power, and transit** to other hosts. Your customers
are now businesses that *also* have customers. Introduces: power density limits, cooling as a hard cap,
colo contracts with 3-year terms, cross-connect revenue (the highest-margin product in the industry), and
a customer whose abuse becomes *your* abuse problem with *your* upstream.

**L8 — "Multi-Region" (Two DCs, One Brand)**
Latency-based routing, DR failover you actually have to pay for, regional compliance, and the
**"we're in Europe now" GDPR / data-residency unlock**. Teaches that a second site doubles cost and only
*partially* doubles resilience, and that the sales team will sell "multi-region" long before ops can
deliver it.

**L9 — "The Roll-Up" (Acquisitions)**
You buy smaller hosts' books of business. Each acquisition is a lane of *pre-annoyed* customers arriving
at once, on legacy infrastructure, with a migration deadline and a post-acquisition churn spike. Teaches
the EBITDA-multiple math and the truth that **you buy a book and half of it walks.**

**L10 — "Hyperscale Pressure" (The Endgame)**
A cloud giant enters your market at a price below your cost. You cannot win on price. You must win on
support, niche, compliance, or being the human at 3am. Final level is a *positioning* puzzle, not a
capacity puzzle.

### 1.2 Alternate perspective levels (same world, different chair)

- **"The Ops Chair" vs "The CEO Chair" toggle.** Some levels you play as ops (place servers, stop
  attacks); some you play as the CEO and can *only* spend money, set prices, hire, and send emails —
  the infrastructure auto-plays based on your budget. Brutally instructive.
- **"The Support Queue Level."** No map at all. Just a ticket board. Threats are *tickets*, towers are
  *agents and canned responses and KB articles*. Visitors are customers deciding whether to renew based
  on first-response time. Win = CSAT above X with labor under Y.
- **"The Sales Chair."** You play the pipeline: leads → qualified → demo → security review → procurement
  → close. Threats are *competitor counter-offers, procurement delays, the champion leaving the company,
  and a legal redline on your SLA*.
- **"The Board Meeting."** A short interstitial level: you have 5 slides and 4 decisions. Investors are
  the "visitors" and skepticism is the "threat." Your answers set your next level's budget.
- **"The Abuse Desk."** Pure triage: DMCA, phishing, spam, CSAM escalation, law-enforcement request.
  Every wrong call costs either a customer, an upstream relationship, or a lawsuit.

### 1.3 Scenario missions (constrained, replayable, business-flavored)

1. **"Black Friday"** — Your promo goes live. Signups arrive at 20x rate for 72 hours. Provisioning
   queue, fraud rate, and support queue all spike. Goal: max net-new MRR *that survives 90 days*, not max
   signups. The trap: a 90%-off coupon that fills you with customers whose LTV is negative.
2. **"The Front Page"** — A customer's site hits Hacker News. Their $5 plan now costs you $400 in
   bandwidth. Choose: throttle them (bad press), eat it (bad margin), or upsell mid-spike (bold, risky).
3. **"Migrate 4,000 Sites, Zero Downtime"** — Acquisition integration. DNS TTLs, cPanel-to-cPanel
   transfers, a legacy PHP 5.6 fleet, and 4,000 customers who will each open a ticket if anything moves.
4. **"The Breach"** — You were compromised. The mission is *communication and containment*: notify,
   rotate, credit, defend on Reddit, and keep churn under 15%. Technical fix is 20% of the mission.
5. **"Spamhaus SBL"** — Your mail IPs are listed. Every customer's email is bouncing. You must find the
   compromised account, remediate, request delisting, and survive the 48 hours of tickets.
6. **"The Chargeback Wave"** — A carder ring signs up with 200 stolen cards. In 30 days you get 200
   chargebacks, $15 each in fees, and your payment processor threatens to drop you. Above 1% chargeback
   ratio you lose card processing entirely — a *company-ending* event.
7. **"Runway: 6 Weeks"** — Cash crisis. You're profitable on paper but the annual prepays were spent.
   Survive by collecting receivables, selling annual plans at a discount, delaying a hardware purchase, or
   taking expensive money.
8. **"The Price Hike"** — Your control-panel vendor raises licensing 400% overnight (this literally
   happened). Pass it through (churn), eat it (margin), or migrate 3,000 accounts to an open-source panel
   (labor + risk + a tiny outage on every account).
9. **"The RFP"** — A 200-seat enterprise wants to move. You must pass a security questionnaire, produce a
   SOC 2 report you don't have, accept net-60 terms, and sign an SLA with real penalties. Winning it makes
   you 30% customer-concentrated — a new permanent threat.
10. **"The Competitor's Obituary"** — A rival host goes dark overnight with no notice. A flood of
    panicked refugees arrives with no backups and enormous emotional damage. Free customers, terrible
    onboarding load, incredible PR if you handle it well.
11. **"Review Bomb"** — One bad outage plus a competitor's astroturf campaign tanks your Trustpilot from
    4.6 to 2.9. Organic signups drop 60%. You must rebuild reputation without buying fake reviews (which
    is available as a choice and will eventually detonate).
12. **"The Audit"** — PCI/SOC 2/HIPAA. Remediate findings against a deadline while still running the
    business. Passing unlocks an entire customer segment; failing loses the deal *and* the current
    regulated customers.
13. **"The Founder Bus Factor"** — You (or your only senior engineer) are unavailable for 7 days.
    Everything you personally did must have been documented or automated beforehand. Rewards players who
    invested in runbooks.
14. **"IP Exhaustion"** — You're out of IPv4. Buy on the market at $40/IP, lease at $0.55/IP/mo, deploy
    IPv6 + CGNAT (customers complain), or turn away business.
15. **"The Landlord Renewal"** — Your colo contract is up. The DC wants +35%. Negotiate, sign longer for
    a better rate, or execute a full physical migration across town.
16. **"Sell the Company"** — Endgame scenario. Maximize valuation over 12 months. Valuation is a multiple
    of *EBITDA adjusted for churn and customer concentration*, so short-term tricks (cut support, defer
    hardware) inflate EBITDA and get clawed back in diligence.

### 1.4 What gets harder, stage by stage (the business difficulty curve)

- **L1-3:** Every dollar is visible. One customer is 25% of revenue. Failure is personal.
- **L4-5:** Volume hides individual customers but introduces *statistical* problems: churn %, fraud %,
  support tickets per 100 accounts. You stop managing customers and start managing *rates*.
- **L6-7:** Contracts, terms, and liability appear. Now a decision made today creates an obligation
  eighteen months out. Introduces the **commitment ledger** — a scrolling list of things you owe.
- **L8-10:** Organizational drag. Your team is now a system with its own failure modes: turnover,
  knowledge loss, communication latency, and the fact that the person who knows how the billing system
  works is the person you can't afford to lose.
- **Throughout:** The **Reputation** stat becomes more and more load-bearing. At L1 nobody's heard of
  you; at L10 everything you do is public, and a single tweet is a threat wave.

### 1.5 Progression framings

- **"MRR Gates."** Levels unlock not by winning but by sustaining MRR above a threshold for N months.
  Spiking is easy; sustaining is the game.
- **"The Ratchet."** Once you sell an SLA tier, you can never *quietly* stop offering it. Downgrading a
  product is a churn event. Teaches that product decisions are one-way doors.
- **"Cohort View."** Between levels, see the cohort retention curve of everyone you signed. A level where
  you grew fast but month-12 retention is 40% scores worse than slow growth at 85%.
- **"The Ghost of Customers Past."** Churned customers occasionally reappear in later levels as
  *win-back* leads (cheaper than cold leads) or as *reputation attackers* (if they left angry). How you
  handled the cancellation two levels ago literally walks back on screen.

---

## 2. Threats (business-flavored, with a dollar cost attached to every one)

> **Design rule for this lens:** every threat's damage is expressed in *money and reputation*, not just
> HP. "Server down" is not damage. "Server down → 40 min of SLA breach → $1,900 in credits → 6 refund
> requests → 3 cancellations → one Trustpilot 1-star" is damage.

### 2.1 Financial & billing threats

- **The Chargeback Swarm.** Fast, small, numerous units that slip past your perimeter and hit your
  *bank account* rather than your servers. Each costs the revenue **plus** a $15-25 fee **plus** a tick
  on your chargeback ratio. Counter: Fraud Scoring tower, 3-D Secure gate (converts fewer customers —
  literal tradeoff), a visible refund policy, and a "call before you chargeback" support banner.
- **Processor Termination.** Not a unit — a *boss trigger*. If chargeback ratio exceeds 1% for two
  months, your payment processor drops you and **all card revenue stops**. You must scramble to a
  high-risk processor at 2x the rate. The most terrifying business event in hosting and almost never
  depicted anywhere.
- **Involuntary Churn ("The Expired Card Ghost").** A slow, silent drain. Customers who *want* to stay
  but whose cards expired. Invisible unless you build the **Dunning Tower** (retry logic, pre-expiry
  emails, card updater service). Typically 20-40% of all churn in a real host and 100% preventable —
  perfect "hidden leak" mechanic.
- **The Deadbeat Cohort.** Customers who use the service and don't pay. Aging buckets: 15/30/60/90 days.
  You choose suspend/terminate timing. Suspend too early = bad reviews; too late = free hosting for
  freeloaders. A **Collections** tower converts aged receivables to cash at a discount.
- **Deferred-Revenue Sinkhole.** You sold 500 annual plans and spent the cash on servers. Now you owe 11
  months of service with no incoming cash. Visualized as a **hole under your bank vault** that grows
  every time you celebrate an annual sale.
- **The Refund Cascade.** After a bad outage, a refund request from one customer *inspires* neighbors —
  a contagion mechanic where refund units spawn adjacent refund units unless intercepted by a
  well-written incident communication.
- **Currency & Cross-Border Drag.** International customers pay in local currency; FX moves, and your
  payment provider takes 3-4% on conversion. A small permanent nibble that only shows up if you look.
- **Tax Nexus Creep.** Selling into enough jurisdictions triggers VAT/GST registration obligations. A
  paperwork threat that arrives as a letter, not a monster, and costs money and an accountant.

### 2.2 Reputation threats

- **The Reddit Thread.** A single post titled "PSA: do not host with ___". Spawns a *stream* of visitors
  who now bounce at your landing page. Counter: an honest public post-mortem within 24h (a tower you can
  only fire once per incident and only if you have a Status Page built).
- **The Review Bomb.** Coordinated 1-star reviews. Some real (from your outage), some astroturfed by a
  competitor. Player must decide whether to respond publicly to each — responding well converts a 1-star
  into a 4-star at labor cost; responding badly goes viral.
- **The WebHostingTalk Drama Thread.** Industry-insider reputation, separate from consumer reputation.
  Affects *reseller and agency* customer acquisition specifically — a different lane than retail.
- **The Astroturf Temptation.** You can *buy* 200 five-star reviews for $2,000. It works. For a while.
  Then a journalist or a review platform's fraud detection detonates it and your Reputation floors out
  and cannot be rebuilt for the rest of the run. A genuine, tempting, punishable moral choice.
- **The Affiliate Betrayal.** Your top affiliate — who sends 30% of your signups — is bought by a
  competitor or is offered a higher CPA and switches. Overnight, a third of your lead flow evaporates.
  Counter: channel diversification, which costs money and returns nothing until the day it saves you.
- **The Influencer Complaint.** A customer with 200k followers has a bad support experience.
  Escalation path: you can *manually intervene* on one ticket per wave (the "CEO reply"), which is
  enormously effective and doesn't scale — teaching exactly why founders burn out.
- **Uptime-Monitor Public Shaming.** Third-party monitoring sites publish your uptime. You cannot edit
  it. Persistent reputational HUD element you don't control.
- **The Ex-Employee Post.** A laid-off or burned-out staff member writes a Glassdoor/blog post. Damages
  *hiring* — your next engineer costs 20% more and takes twice as long to find.

### 2.3 Customer-originated threats (the ones real operators recognize instantly)

- **The Abusive Neighbor.** One shared-hosting customer runs an unoptimized plugin or a crypto miner and
  degrades the whole server. Counter: resource limits (CAGEFS/CPU caps), which make your product worse on
  paper. Real tradeoff, real tower.
- **The Spam Cannon.** A compromised WordPress account starts sending 400k emails/hour. Leads to
  **RBL Listing**, which breaks email for every customer on that IP. Cascade threat: one customer's
  problem becomes everyone's outage, and everyone's outage becomes your churn.
- **The DMCA Stack.** Repeated takedown notices. Ignore them and you lose safe-harbor protection and your
  upstream nullroutes you. Over-enforce and you nuke innocent customers and get a "they deleted my site
  over a stock photo" thread. Requires an **Abuse Desk** with a *policy setting* — aggressive / balanced /
  permissive — that trades legal risk against customer trust.
- **The Phishing Tenant.** Someone hosts a bank phishing kit on your IP. Browsers start flagging
  *neighboring* sites. Google Safe Browsing listing is the damage; delisting takes days.
- **The DDoS-for-Hire Tenant.** A VPS customer uses your network to *originate* attacks. Your upstream
  threatens to terminate you. This is the "your revenue is your enemy" threat: the customer is paying you
  and destroying you simultaneously.
- **The Support Vampire.** A $5/mo customer who opens 40 tickets a month, each a 25-minute developer
  question that isn't your job. Negative-margin customer, visible only if you track cost-to-serve. Counter
  towers: a Knowledge Base, a "we support the server, not your code" policy line, or a paid
  **Professional Services** upsell that converts the vampire into your highest-margin client.
- **The Concentration Risk Whale.** One customer at 30% of revenue. They know it. Every renewal they
  demand a discount. Losing them is a company-ending event; keeping them is slow bleeding. A threat that
  *looks* like your greatest asset on the revenue chart.
- **The Migration Tourist.** Signs up on a 90-day-money-back promo, migrates in, uses you for 89 days,
  demands a refund, leaves. Pure loss including onboarding labor.
- **The Ransom Customer.** "Give me 6 months free or I post the outage screenshots." Pay, refuse, or
  publish first.

### 2.4 Competitive & market threats

- **The Price War.** A competitor drops shared hosting to $0.99/mo. Your conversion rate halves. Options:
  match (destroy margin), differentiate (slow, needs marketing spend), or segment up (abandon the
  low end and lose volume). There is no good answer, which is the point.
- **The Hyperscaler Free Tier.** A cloud giant offers "free forever" at your entry tier. Erases your
  entire lead-gen funnel for beginners. Counter: become the place people go when free stops being free.
- **The Acquisition Predator.** A roll-up conglomerate buys your three biggest competitors, then your
  biggest *supplier*, then offers to buy you at an insulting multiple, then starts poaching your staff.
- **The Vendor Squeeze.** Control panel, virtualization, or backup vendor raises prices 200-400% at
  renewal, or changes licensing from per-server to per-account. Direct hit to unit economics on every
  account, retroactively.
- **The Upstream Bankruptcy.** Your transit provider or your colo landlord goes under. 30 days to
  relocate. The single most expensive event in the game.
- **The Talent Raid.** A competitor offers your L3 engineer +40%. Losing them costs MTTR on every future
  incident and the tribal knowledge of your weirdest customer's weirdest setup.
- **The Commoditization Fog.** A slow, ambient threat: every quarter, your product becomes 3% less
  differentiated unless you ship something. Manifests as gradually declining conversion rate with no
  visible cause. Counters: new products, niche positioning, brand.

### 2.5 Operational / technical threats, priced in CEO currency

- **The Unplanned Outage** — cost = (SLA credits) + (refunds) + (support labor) + (churn) +
  (reputation), with the multiplier depending on *duration*, *time of day*, and *whether you communicated*.
  The communication multiplier is the whole lesson: a 2-hour outage with great comms costs less than a
  20-minute outage with silence.
- **The Bad Deploy.** Your own team's change breaks things. Costs the same as an attack but also costs
  *internal trust*, which slows future shipping (a hidden velocity debuff).
- **The Backup That Wasn't.** You discover during a restore that backups have silently failed for 40
  days. Damage is proportional to *how loudly you advertised backups in your marketing copy*. Delicious.
- **Hardware Failure.** A disk, a PSU, a switch. Cheap to fix, expensive if it lands on your only node.
  Introduces the *spares inventory* decision: cash tied up in a shelf of drives vs a 4-hour outage.
- **Power Event.** UPS + generator or a customer-facing apology. In colo levels, you're at the mercy of
  someone else's generator test.
- **Certificate Expiry.** Comedy-tragedy: your own billing portal's SSL expires, customers can't pay, and
  Chrome shows a scary red page to every prospect. Costs almost nothing to prevent, enormous to suffer.
- **The Silent Degradation.** Nothing is "down" — everything is just 40% slower. No alarm fires, no SLA
  breach, but conversions drop and churn climbs a month later. The delayed-consequence threat.
- **Key-Person SPOF.** See "Bus Factor." Modeled as a tower that only *one* staff unit can operate.
- **Compliance Lapse.** You let a certification expire. Regulated customers are contractually required to
  leave. A cliff, not a slope.

### 2.6 Attacker archetypes, business-flavored

- **Script Kiddie** — cheap, constant, low damage. Real cost is *support ticket noise* and log volume.
- **The Bot Farm** — credential stuffing on your *customer portal*; a breach here is a billing-data
  breach, which is a legal event, not a technical one.
- **The Carder Ring** — attacks your checkout, not your servers. Uses your signup form to validate stolen
  cards. Costs you processor standing.
- **The Competitor** — buys your product to find weaknesses, screenshots your dashboard, poaches your
  customers via targeted ads on your brand name, and files spurious abuse complaints against you.
- **The Extortionist** — "ransom DDoS": pay 5 BTC or we take you down at your busiest hour. Paying marks
  you as payable.
- **Nation-State / APT** — doesn't want your money; wants a customer of yours. Slow, quiet, and the damage
  is that you find out from a journalist. Reputation damage is catastrophic and delayed.
- **The Disgruntled Ex-Customer** — knows your architecture, has old credentials, and posts everywhere.
- **The Regulator** — not malicious, but arrives with a deadline and a fine schedule.
- **The Plaintiff's Lawyer** — arrives after a breach; damage is denominated in legal-defense cash and in
  the executive hours it consumes (which are a resource in this game).

---

## 3. Visitors, Traffic, and Clients

### 3.1 Customer archetypes (each with ARPU, churn, support load, abuse risk, referral value)

| Archetype | ARPU | Churn | Support load | Abuse risk | Special |
|---|---|---|---|---|---|
| **Hobby Harold** | $4/mo | High | Medium | Low | Churns when his project dies (always) |
| **Small Biz Brenda** | $25/mo | Very low | Low | Low | The bedrock. Never leaves. Refers others. |
| **Agency Anya** | $600/mo | Low | Medium | Low | Brings 40 client sites at once; leaves with all 40 |
| **Dev-Shop Dan** | $200/mo | Medium | High (technical) | Low | Demands features, becomes a design partner |
| **Reseller Raj** | $150/mo | Medium | Low to you | **Inherits theirs** | His customers' abuse becomes yours |
| **Startup Sam** | $900/mo, growing | High | Medium | Low | 50% chance of dying, 10% chance of becoming your whale |
| **Enterprise Edith** | $8,000/mo | Very low | High + compliance | None | Net-60 terms, 5-month sales cycle, annual price pressure |
| **LowEnd Larry** | $3/mo | High | Low | **High** | Buys on deal forums, abuses everything, churns at renewal |
| **Crypto Chad** | $50/mo | N/A | None | **Extreme** | Miner or DDoS origin. Refuse him or regret him. |
| **Nonprofit Nina** | $15/mo | Zero | Low | Low | Asks for a discount forever. Enormous referral/PR value. |
| **Government Greg** | $12,000/mo | Zero | Enormous paperwork | None | Requires certifications; payment is slow but certain |
| **Migrating Marcus** | $60/mo | Low after 90d | **Huge for 2 weeks** | Low | Onboarding-cost spike then a great customer |
| **Churn-Risk Chloe** | $30/mo | ??? | Low | Low | Shows early warning signs; savable if you notice |
| **Whale Wendy** | $40,000/mo | Low | Custom | None | 30% of your revenue. Both a trophy and a loaded gun. |

### 3.2 What makes visitors bounce (marketing truths as game mechanics)

- **Slow Landing Page.** Your marketing site is hosted on your own infrastructure. If your infra is
  struggling, *your sales funnel is struggling too*. Beautiful recursion: an attack on your servers is
  simultaneously an attack on your customer acquisition.
- **The Trust Gap.** Visitors check for: a real address, a phone number, a status page, review scores,
  an SSL padlock, and "how long have you existed." Each is a cheap buildable that raises conversion a
  few points. Missing several = visitors path *right past you* to a competitor.
- **Price Shock at Checkout.** Advertised $2.95, renews at $11.95. Converts great, churns horribly at
  month 13, and generates the angriest reviews in the industry. A deliberately available, deliberately
  poisoned strategy.
- **Form Friction.** Every additional signup field loses X% of visitors but gains fraud-screening
  accuracy. A slider with two opposing curves.
- **No Instant Provisioning.** If setup takes more than a few minutes, visitors bail. Automation is
  therefore a *marketing* investment, not an ops one.
- **The Missing Feature Filter.** Visitors carry a checklist icon (SSH? Node? staging? daily backups?
  free SSL? cPanel?). Visitors whose checklist you can't satisfy visibly *turn around* — an at-a-glance
  read on what product gap is costing you traffic.
- **Support Response Time (pre-sale).** A pre-sales chat that answers in 30 seconds converts at 3x.
  Live chat is simultaneously a cost center and your highest-ROI conversion tower.

### 3.3 Acquisition channels (each a literal *road* into your map, with its own cost and traffic quality)

- **Organic Search Road.** Slow to build (months of content), free per-visitor forever after, and it can
  be *washed out by an algorithm update event*. Highest LTV traffic in the game.
- **Paid Search Highway.** Instant, expensive, stops the moment you stop paying. Cost rises when
  competitors bid. You can bid on **competitor brand terms** (cheap, effective, slightly dirty, may
  trigger a trademark complaint event).
- **Affiliate/Review-Site Pipeline.** Enormous volume, $100-200 CPA, and the traffic quality is poor
  (deal-seekers who churn). Also: the affiliate's own reputation becomes part of yours.
- **The Deal-Forum Chute.** Post a 70%-off offer on a low-end deal forum and receive a firehose of
  LowEnd Larrys and Crypto Chads. Fills capacity instantly with your worst customers.
- **Word-of-Mouth Footpaths.** Generated by Reputation. Free, slow, and the highest-converting traffic
  that exists. Grows organically from happy customers — visualized as new small paths literally *drawing
  themselves onto the map* when NPS is high.
- **Agency/Partner Channel.** One partner = many customers arriving together. Requires a partner portal,
  margin share (20-30%), and occasional co-marketing spend.
- **Registrar Cross-Sell.** Sell domains at break-even; every domain customer is a hosting lead with
  near-zero CAC. The classic hosting funnel.
- **Community Presence.** Sponsoring an open-source project, running a meetup, answering questions on
  forums. Cheap, slow, generates *developer* traffic which is high-value and high-expectation.
- **Content & Tooling Magnets.** Free speed-test tool, free DNS, free status pages, a genuinely good
  blog. Visitors come for the free thing and some convert. Modeled as a permanent low-rate visitor tap.
- **Outbound Sales.** A rep dialing. Expensive per meeting, works only for Enterprise Edith, and has a
  long lag between spend and revenue — a cash-flow trap for impatient players.
- **Conference Booth.** Big one-time cash spend, a burst of leads weeks later, and reputation among
  industry peers (which feeds the reseller lane).
- **Refugee Flows.** Event-driven: when a competitor has a public disaster, a temporary road opens from
  their territory to yours. Being *ready* — with a migration offer and free transfers — is how you catch
  it. Reward for players who pre-built migration tooling.

### 3.4 Conversion and retention mechanics

- **The Funnel Lane.** Visitors visibly progress through segments of the path: *Landing → Pricing →
  Cart → Payment → Provisioned → Onboarded → Renewed*. You can place a "tower" at each stage (a
  testimonial, a comparison table, a discount code, a 1-click installer, a welcome email sequence). The
  path *is* the funnel, which makes drop-off spatially obvious.
- **The Onboarding Gauntlet.** New customers who don't get their site live within 7 days churn at 5x.
  So "time to first success" is a defendable, upgradeable statistic — migration tools, 1-click installers,
  a welcome call for high-ARPU accounts.
- **Save Offers.** On the cancellation form: offer 2 months free, a downgrade, or a pause. Each saves a
  % of cancellations at a margin cost. Over-use trains customers to threaten cancellation.
- **The Exit Survey.** Gives you *intel*: a churn-reason breakdown that literally tells you which tower
  to build next. Free, requires only that you built the form.
- **Annual Prepay Push.** Offering 2 months free for annual: instantly improves cash and retention,
  instantly creates deferred-revenue liability, and makes your MRR chart lie to you.
- **NPS Ticker.** Passive score from surveys. Promoters spawn word-of-mouth visitors; detractors spawn
  reputation-threat units. Makes CSAT a *production building*, not a vanity metric.
- **The Renewal Wave.** Every 12 months, the cohort you signed comes back up for renewal all at once.
  A predictable, schedulable threat/opportunity wave — you can see it coming on the calendar and prepare
  (or be crushed by a renewal-price-increase backlash).
- **Win-Back Campaigns.** Churned customers are a cheap lead list. Emailing them costs little and
  converts a few percent — unless they left angry, in which case you generate reputation damage.
- **Referral Program.** Give $50, get $50. Cheapest CAC in the business. Requires a portal build, and
  can be gamed by fraudsters (self-referral ring) if you don't build detection.

### 3.5 Segmentation as strategy

- **The Positioning Dial.** A top-level strategic choice with cascading effects: *Cheapest* /
  *Fastest* / *Most Supported* / *Most Compliant* / *Most Niche*. Sets which visitor archetypes even
  *appear* on your map. Cheapest floods you with volume and abuse; Most Compliant gives you a trickle of
  whales and a mountain of paperwork.
- **The Niche Play.** "We only host WordPress agencies" or "We only host Magento" or "We only host
  churches." Narrows the funnel *and* massively raises conversion, ARPU, referral rate, and defensibility
  against hyperscalers. Should be a genuinely winning strategy in this game, because it is in real life.
- **Geographic Positioning.** Being the *local* host ("Servers in Ohio, support in Ohio") is a real,
  durable advantage against global commodity players.
- **Vertical Compliance Moat.** HIPAA/PCI/FedRAMP-ish certifications gate entire customer classes. Huge
  capex/opex, but the customers inside the moat almost never churn and don't shop on price.

---

## 4. Buildables: Services, Infrastructure, **and the Business Machine**

> The key CEO-lens contribution: **half your towers aren't servers.** Billing, support, sales, marketing,
> legal, and finance are all buildable, upgradeable, staffable structures that consume cash, produce
> revenue or defense, and introduce their own attack surface.

### 4.1 Revenue machinery (the "front office" wing of your map)

- **Billing Platform (WHMCS-alike).** Core dependency for *everything*. Automates invoicing, suspension,
  provisioning. New attack surface: it holds every customer's billing data — the single juiciest breach
  target you own, and a breach here is a legal/notification event, not an outage.
- **Payment Gateway (primary).** Upkeep = 2.9% + $0.30 of all revenue. Upgrades: multiple gateways
  (redundancy against processor termination), ACH/wire (cheap, slow, enterprise-only), PayPal (converts
  well, disputes are brutal), crypto (no chargebacks, high fraud correlation, accounting headache).
- **Dunning Engine.** Retries failed cards on a schedule, sends pre-expiry notices, uses card-updater.
  Recovers 30-60% of involuntary churn. Cheapest ROI tower in the entire game and invisible until built.
- **Fraud Screening (MaxMind-alike).** Scores signups. Tunable threshold slider: *strict* blocks fraud
  and 4% of good customers; *loose* converts everything and invites the carder ring. A live,
  consequential dial rather than a binary upgrade.
- **Pricing Engine.** Lets you define plans, tiers, promos, renewal pricing, and per-region pricing.
  Upgrade path: **usage-based billing** (higher ARPU, much higher support-ticket volume — "why is my bill
  $400 this month"), **annual discounting**, **grandfathering** (keeps old customers happy, freezes your
  revenue).
- **Quote & Contract Desk.** Required for enterprise. Produces MSAs, SLAs, DPAs, and the ability to
  accept net-30/60 terms. Introduces **AR aging** as a mechanic — revenue you've recognized but haven't
  collected.
- **Upsell Shelf.** Physical shelf of add-on products placed next to the checkout path:
  - **SSL Certificates** (dying margin since free certs, but enterprise still buys EV)
  - **Domain Registration** (thin margin, enormous retention glue — customers with domains at you churn
    far less)
  - **Managed Backups** (huge margin, huge liability if they ever fail)
  - **Malware Scanning / Cleanup** (great margin; borderline fear-selling — a reputation risk if
    oversold)
  - **Dedicated IP** (pure margin on an asset you own)
  - **Email Hosting** (low margin, high support, extremely sticky)
  - **Priority Support SLA** (pure margin *if* you can actually staff it)
  - **Site Migration Service** (converts your onboarding cost into a revenue line)
  - **Professional Services / retainer** (turns your Support Vampire into your best customer)
  - **Compliance Reporting Packs** (sell the audit artifacts you already generate)
- **Self-Serve Portal.** Every feature you add to the customer portal removes tickets. Password reset,
  DNS editing, backup restore, plan upgrade, invoice download. Each one is a *support-cost reduction
  tower* disguised as a feature.
- **Marketplace / App Store.** Partner apps sold through you for a revenue share. Low effort, adds
  stickiness, introduces third-party supply-chain risk (a compromised marketplace plugin is your breach).

### 4.2 Demand generation (the marketing wing)

- **The Brand Building.** A literal structure whose height = Reputation. Raises conversion on every lane
  simultaneously. Built slowly by shipping, communicating, and not lying.
- **Content Engine.** Writers producing tutorials and comparison pages. 6-month lag before returns, then
  a permanent free traffic tap. Vulnerable to the *Algorithm Update* event.
- **SEO Rig.** Technical + backlinks. Compounding. Can be damaged by your own outages (crawlers see 503s).
- **Ad Console.** Real-time budget dial. Cost-per-click rises with competitor spend — a visible
  auction that other AI companies bid in. Turning it off is instant cash relief and instant growth stall,
  which is *exactly* the CEO dilemma during a cash crunch.
- **Affiliate Portal.** Recruit affiliates, set CPA, watch traffic arrive. Needs a fraud-detection
  sub-module or you'll pay commissions on self-referred trash.
- **Partner/Reseller Program.** White-label control panel, margin tiers (bronze/silver/gold), co-op
  marketing funds. Each partner is a multiplier on a lane.
- **Status Page.** Cheap. Enormous during incidents. Converts an outage from a reputation catastrophe
  into a reputation *neutral*. Must be hosted OFF your own infrastructure — a lesson players will learn
  the hard way exactly once.
- **Knowledge Base / Docs.** Deflects tickets, feeds SEO, improves onboarding. The triple-purpose
  building.
- **Social/Community Desk.** Monitors mentions, responds publicly. Converts angry visitors before they
  reach the review sites. Staffed, so it costs salary.
- **Case Study Factory.** Turn happy customers into sales assets. Requires the customer's permission,
  which requires them to actually be happy.
- **Conference Booth (deployable).** Temporary structure. Big cash out, delayed lead burst.
- **Trust Badge Row.** Uptime guarantee badge, "since 2009" badge, review-score widget, security seals,
  compliance logos. Each is a tiny permanent conversion bump — and each is a *liability* you must live up
  to (advertising 99.99% and delivering 99.5% is where SLA credits come from).

### 4.3 Service delivery (support & ops as business buildings)

- **Tier-1 Support Desk.** Staffed by agents with a throughput rate and a quality rating. Handles the
  volume; escalates what it can't. Overstaff = margin bleed; understaff = churn.
- **Tier-2 / Tier-3 Engineering.** Expensive, scarce, and the only thing that resolves real incidents.
  Also the people you can't afford to have answering password resets.
- **Follow-the-Sun NOC.** Either hire a night shift (expensive) or outsource to a 24/7 NOC vendor
  (cheaper, lower quality, occasionally makes things worse). Classic real decision.
- **Ticket Router / Triage AI.** Reduces cost per ticket, occasionally misroutes a critical one.
- **Live Chat.** Placed on the *sales path* it's a conversion tower; placed on the *support path* it's a
  cost center. Same building, two placements, opposite economics. Lovely design.
- **Phone Support.** The single most expensive support channel and the single biggest trust signal for
  Small Biz Brenda. A real strategic fork.
- **Onboarding / Migrations Team.** Converts acquisition into retention. Directly increases the
  probability that a new customer survives to month 3.
- **Customer Success Manager (CSM).** Assigned to accounts above an ARPU threshold. Reduces churn on
  whales, spots expansion opportunities, and is the early-warning radar for the Concentration Whale
  getting itchy.
- **Account Management / Renewals Desk.** Works the renewal calendar. Converts monthly to annual,
  upsells at renewal, negotiates enterprise increases.
- **Abuse Desk.** Processes DMCA, spam reports, phishing, law enforcement. Has a **policy dial**
  (permissive ↔ aggressive) that trades legal exposure against customer trust. Under-built = upstream
  nullroutes you. Over-built = you terminate innocent customers and eat a viral thread.
- **Collections Desk.** Works AR aging, negotiates payment plans, decides suspension timing.
- **QA / Change-Management Board.** Slows deploys, prevents the Bad Deploy threat. Explicitly a
  *velocity-vs-stability* dial the CEO sets.
- **Runbook Library.** Reduces MTTR, reduces bus-factor damage, makes junior staff effective. The
  "invisible infrastructure" a good operator builds.

### 4.4 Governance, legal, finance

- **Compliance Vault.** Holds SOC 2 / PCI / ISO / HIPAA readiness. Expensive annual upkeep (audits,
  auditors, evidence collection) and unlocks entire customer segments. Expiring = cliff churn.
- **Legal Retainer.** Reviews contracts, handles DMCA edge cases, responds to subpoenas, defends the
  lawsuit. Without it, every legal event costs 3x and takes 5x longer.
- **Cyber-Insurance Policy.** Monthly premium; caps the downside of a breach. Has a deductible and a
  set of exclusions that will absolutely bite the player who didn't read them (e.g. doesn't cover you if
  MFA wasn't enforced).
- **E&O / SLA Reserve.** A cash bucket you voluntarily set aside for SLA credits. Boring, prudent,
  and the thing that keeps a bad month from becoming a death spiral.
- **Accounting / FP&A.** Unlocks the *forecast view*: projected cash 90 days out. Without it you are
  literally flying blind on the most important number. A tower that buys you *information*, which is a
  wonderful thing for a strategy game to sell you.
- **The Board / Investor Relations.** If you took money, this is a recurring obligation that grants
  capital and imposes growth targets. Missing targets triggers pressure events (cut costs, raise prices,
  fire people).
- **Procurement Desk.** Negotiates vendor contracts. Turns a 400% price hike into a 90% one, gets you
  better transit pricing at volume, and finds the hardware deal. Pays for itself at scale.

### 4.5 Infrastructure (framed by what it does to unit economics)

For every item: **what it does / what it costs / what it unlocks in the product catalog / what new risk it
opens / what it does to margin.**

- **Shared Web Server.** Highest revenue-per-U in hosting. Oversell dial. Risk: noisy neighbors,
  one-compromise-infects-many, and a single failure affecting hundreds of customers (i.e., hundreds of
  simultaneous tickets).
- **VPS Node / Hypervisor.** Sells isolation. Higher ARPU, lower density, better margin per customer but
  worse per-U. Risk: abuse (mining, DDoS origination), and customers who install malware themselves.
- **Dedicated Server.** Simple economics, low support, low margin %, high revenue per box. Risk: 4-hour
  hardware replacement expectations and the customer who blames you for their own kernel panic.
- **Database Server.** Unlocks the "apps, not pages" product tier and higher ARPU. Risk: SQL injection,
  a single query storm taking down many sites, backup size explosion, and licensing if you go commercial.
- **Cache Tier (Redis/Memcached/Varnish).** Sells "fast" — a marketable product attribute you can charge
  for. Risk: stale-content support tickets ("I updated my site and nothing changed") which are *enormous*
  in real shared hosting.
- **Load Balancer.** Unlocks the *high-availability* product tier and lets you sell a stronger SLA.
  Risk: a new SPOF unless paired, plus SSL termination complexity.
- **CDN Edge / PoP.** Sells global speed, cuts origin bandwidth cost (direct margin improvement). Risk:
  commit contracts with minimum spend and cache-invalidation support load.
- **Backup System.** Sells "peace of mind" as a paid add-on. Risk: the liability of having promised it.
  Upgrade path: offsite, immutable, tested-restore (only *tested* restores actually protect you).
- **Monitoring & Alerting.** Reduces MTTR, feeds your public uptime number, generates the data your SLA
  claims depend on. Risk: alert fatigue → your team ignores the real one.
- **Control Panel (cPanel/Plesk/open).** Product-market fit in a box; customers demand it. Risk: a
  per-account license cost that *scales with your success* and can be repriced by a vendor at will. Pure
  margin exposure.
- **Automation / Provisioning.** The single biggest margin lever in hosting: it decouples revenue growth
  from headcount growth. Should be the most satisfying upgrade in the game.
- **Firewall / WAF.** Sells as a security add-on AND defends you. Double-duty tower. Risk: false
  positives blocking real customers ("your firewall blocked my own admin panel").
- **DDoS Scrubbing.** Expensive upkeep, catastrophic absence. Can be resold as "DDoS-protected hosting,"
  a real and lucrative niche.
- **Mail Server / Outbound Relay.** Low margin, high support, high abuse risk, and the thing customers
  are most emotional about. Reputation-managed IPs are an asset class of their own.
- **IP Space (owned vs leased).** Owned IPv4 is a balance-sheet asset that appreciates. Leased is opex.
  Reputation of an IP block is a persistent, inheritable stat — buying cheap "dirty" IP space is a real
  trap.
- **Transit & Peering.** Blended transit vs multiple carriers vs an IX port. Peering reduces cost and
  improves latency (a marketable attribute). 95th-percentile billing means one customer's spike prices
  your whole month.
- **Racks, Power, Cooling.** In DC-operator levels these ARE the product. Sell by the U, by the kW, by
  the cross-connect. Cross-connects are the highest-margin SKU in the entire industry — recurring revenue
  on a cable someone else plugged in.
- **Generator / UPS / Fire Suppression.** Pure cost, sells as a "Tier III" marketing claim, and prevents
  the worst event in the game.
- **Staging / Dev Environments.** Sold as a premium feature to agencies; internally prevents Bad Deploys.
- **Office / Remote Team.** Culture and hiring pipeline. Affects turnover rate and the Ex-Employee threat.

---

## 5. Unlocks and Discovery (business milestones as the tech tree)

> The organizing principle: **you unlock capabilities by surviving business situations, not by
> accumulating points.** The tech tree is a scar tissue map.

### 5.1 Milestone-driven unlocks

- **First paying customer** → unlocks Invoicing and the Cancellation form.
- **10 customers** → unlocks the Ticket Queue (before that, support is just you, one at a time).
- **First refund demanded** → unlocks the Refund Policy setting.
- **First chargeback** → unlocks Fraud Screening.
- **First outage with customers on it** → unlocks the Status Page **and** the concept of SLA.
- **First SLA credit paid** → unlocks the SLA Reserve and the ability to *write* your own SLA terms.
- **100 customers** → unlocks Cohort Analytics; you can finally see churn as a curve.
- **First churn survey response** → unlocks the Save Offer.
- **First customer who came from another customer** → unlocks the Referral Program.
- **First enterprise prospect** → unlocks the Security Questionnaire minigame, which unlocks the
  Compliance Vault research line.
- **First abuse complaint** → unlocks the Abuse Desk.
- **First Spamhaus listing** → unlocks Outbound Mail Rate Limiting and IP Reputation as a visible stat.
- **First negative public review** → unlocks Review Response and the Reputation meter becomes visible.
- **First month where support cost > 30% of revenue** → unlocks Cost-to-Serve analytics per customer.
  Suddenly you can *see* your Support Vampires, and it changes everything.
- **First cash crunch** → unlocks the Cash Forecast view.
- **First annual prepay** → unlocks Deferred Revenue tracking (and the unsettling realization).
- **First employee** → unlocks Payroll, the org chart, and the Turnover mechanic.
- **First employee quitting** → unlocks Runbooks and Documentation.
- **First acquisition offer received** → unlocks Valuation view.
- **First acquisition made** → unlocks the Migration Toolkit and the Integration Playbook.
- **Survive a breach** → unlocks Incident Response Plan, Cyber Insurance, and a permanent "we've been
  through it" trust modifier with enterprise buyers (real: buyers trust operators who've been tested).
- **Reach 99.99% for 12 months** → unlocks the Premium SLA product tier and the ability to charge for it.
- **Serve a customer in the EU** → unlocks the GDPR/DPA branch and regional data residency.
- **Lose a whale** → unlocks Concentration Risk alerts and the Diversification objective.

### 5.2 Research/discovery branches (spend money and staff-time to unlock)

- **Pricing Science branch:** price testing → plan restructuring → usage-based billing → dynamic
  regional pricing → value-based enterprise pricing.
- **Retention branch:** exit surveys → save offers → proactive churn scoring → CSM assignment →
  QBRs (quarterly business reviews) with whales.
- **Margin branch:** density/oversell tuning → automation → self-serve deflection → open-source panel
  migration → owning your own IP space → peering.
- **Trust branch:** status page → public post-mortems → uptime SLA → third-party audit → compliance
  certifications → published security page → bug bounty.
- **Channel branch:** affiliates → resellers → white-label → agency partnerships → marketplace listings
  → OEM/wholesale.
- **Brand branch:** logo → content → community → sponsorship → conference presence → industry
  thought-leadership → the "everyone knows your name" endgame modifier.
- **Finance branch:** bookkeeping → forecasting → credit line → venture debt → equity round →
  acquisition currency.
- **M&A branch:** valuation modeling → diligence checklist → migration tooling → integration playbook →
  serial acquirer (buy multiple books simultaneously).

### 5.3 Discovery-by-accident (the good stuff)

- **The Accidental Niche.** If 30%+ of your customers happen to share a vertical, the game *notices* and
  offers you the "Specialize?" decision — reposition around them for a big conversion multiplier in that
  segment and a penalty everywhere else.
- **The Feature You Built for One Customer.** Enterprise Edith demanded SSO. You built it. Now it's a
  product line. Bespoke work unlocks productizable features — a very real hosting company growth pattern.
- **The Support Macro That Became a Product.** Your team wrote a script to fix a common problem. Package
  it and sell it as a managed service.
- **The Log That Told You Something.** If you build good analytics, the game surfaces *insights* as
  unlockable cards: "Customers who install the 1-click WordPress installer in week 1 churn 60% less."
  Acting on the insight is a buildable objective.
- **The Competitor Teardown.** Buy a competitor's product (a small cash cost) to discover their feature
  list and pricing, unlocking counter-positioning options.
- **Trade Show Serendipity.** Attending unlocks a random partnership offer, a hiring lead, or
  intelligence on an upcoming market shift.

### 5.4 Anti-unlocks (things you can lose)

- Let a certification lapse → lose the segment.
- Fire your CSM → lose the early-warning radar.
- Cut the content team → organic traffic decays over 6 months (slow, irreversible-feeling).
- Break an SLA three times → lose the right to advertise it (Reputation-enforced).
- Burn your affiliate relationships → the channel closes and reopening costs 3x.

---

## 6. Economy, Money, and Scoring

### 6.1 The two-ledger core (the single most important CEO-lens mechanic)

**Cash** and **MRR** are separate, both visible, and frequently in conflict.
- Annual prepay: **Cash ↑↑, MRR flat, Liability ↑**.
- Monthly billing: **Cash smooth, MRR clean, no cushion**.
- Net-60 enterprise deal: **MRR ↑↑, Cash ↓ for two months** (you're financing your customer).
- Hardware capex: **Cash ↓↓ now, cost-per-customer ↓ forever**.
- Leasing hardware: **Cash smooth, total cost higher, margin lower**.
- You can go bankrupt while your MRR chart is going up and to the right. The game should kill at least
  one player this way, on purpose, with a clear autopsy screen.

### 6.2 Revenue streams (ranked roughly by real-world margin)

1. **Cross-connects & IP leases** (DC levels) — ~90%+ margin, recurring, zero support.
2. **Priority support / managed tiers** — high margin *if* automated, negative if not.
3. **Dedicated IPs, add-ons, upgrades** — near-pure margin on owned assets.
4. **Backups & security add-ons** — high margin, high liability.
5. **VPS / cloud instances** — good margin at density.
6. **Shared hosting** — great margin per account, murdered by support cost.
7. **Colo space & power** — solid margin, huge capex, long contracts.
8. **Professional services** — high revenue, zero scalability, but rescues cash flow in a pinch.
9. **Domains** — near-zero margin, enormous retention value.
10. **SSL** — formerly gold, now a courtesy.
11. **Setup fees** — free cash at signup, kills conversion rate.
12. **Overage/bandwidth billing** — great margin, generates the angriest tickets.
13. **Marketplace revenue share** — free money, third-party risk.
14. **Affiliate income (you as affiliate)** — reselling others' products to your base.

### 6.3 Cost structure (the stuff that eats you)

- **Payroll** — always the biggest line. Scales with support volume unless automation breaks the link.
- **Colo / power / cooling** — fixed, contracted, and stepwise (you buy a whole rack, not 0.4 of one).
- **Bandwidth / transit** — 95th-percentile, commit-based, with overage cliffs.
- **Licensing** — cPanel/Plesk/virtualization/backup/monitoring, per-account or per-server, repriceable
  by vendors at any time.
- **Hardware** — capex, depreciated over 36-48 months, and obsolete before it's paid off.
- **Payment processing** — 2.9% + $0.30, plus chargeback fees, plus reserve holds.
- **CAC** — ads, affiliates, content, sales salaries. The number players will under-count.
- **Refunds & SLA credits** — the variable cost of failure.
- **Insurance, legal, audit, accounting** — the "adult" costs that arrive at scale.
- **Bad debt write-offs** — the receivables you never collect.
- **Churn replacement cost** — the hidden cost: to stay flat at 3% monthly churn on 1,000 customers you
  must acquire 30 new ones every month *just to stand still*. Showing this explicitly ("You're running
  up a down escalator") is a great teaching moment.

### 6.4 The metrics HUD (a real operator's dashboard)

- **MRR / ARR** with a **Net Revenue Retention** sub-gauge (expansion minus churn; >100% is the holy
  grail and should feel like it).
- **Gross Margin %** per product line — shows you which SKU is secretly losing money.
- **CAC by channel** and **Payback Period in months**. Payback > 12 months at your churn rate = you are
  buying customers you will never earn back.
- **LTV:CAC ratio** — the master profitability gauge. Under 3:1 and you're running a treadmill.
- **Logo churn vs Revenue churn** — losing 10 Hobby Harolds ≠ losing one Enterprise Edith.
- **Cost to Serve per customer** — unlocks the ability to *fire a customer*, which should absolutely be
  a legal, sometimes-correct move in this game.
- **Cash Runway (weeks)** — the one that makes you sweat.
- **AR Aging buckets** and **DSO (days sales outstanding)**.
- **Chargeback ratio** with a red line at 1%.
- **Uptime % vs SLA commitment**, per tier, with the credit liability accruing live.
- **Support: tickets/customer/month, first-response time, CSAT, cost per ticket.**
- **Concentration:** top customer as % of revenue, top channel as % of leads.
- **Headcount vs revenue-per-employee** — the automation scoreboard.

### 6.5 Money-moving events (specific, priced)

- **A visitor converts:** +setup fee (cash), +MRR, −CAC already spent (sunk), +support-cost tail.
- **A customer churns:** −MRR, −future LTV, and a *reputation delta* depending on why.
- **An outage:** −SLA credits (calculated live per affected customer's tier), −refunds, +support hours,
  −reputation, −conversion rate for N days.
- **A chargeback:** −revenue, −$20 fee, +ratio tick, possible −processor standing.
- **A great review:** +conversion rate on all lanes for N days.
- **A hire:** −cash immediately, +capacity after a 6-week ramp during which they are net-negative.
- **A layoff:** +cash, −capacity, −morale (higher turnover), −reputation on hiring lane.
- **A price increase:** +MRR on retained accounts, −X% of accounts immediately, −reputation spike, and a
  wave of "cancel" tickets that costs support hours. Net is usually strongly positive — the game should
  let players discover that raising prices is usually correct and always feels terrifying.
- **A vendor price hike:** −margin on every affected account, retroactively and permanently.
- **An acquisition:** −cash/−debt, +MRR immediately, +churn spike for 6 months, +integration cost,
  +support load, and possibly +a great engineer who came with the deal.
- **Winning an RFP:** +big MRR, +compliance upkeep, +concentration risk, cash lags 60 days.
- **A DDoS:** +scrubbing overage bill, +transit overage, +support hours, possible −reputation.
- **Getting on a review site's "Top 10":** +a large sustained traffic lane. Some of these are paid
  placements — a purchasable, slightly grubby growth lever.

### 6.6 Scoring & end-of-level rating

- **Four-axis score:** **Growth** (net-new MRR), **Quality** (retention, NPS, uptime), **Efficiency**
  (gross margin, revenue per employee), **Resilience** (runway, diversification, incident handling).
  A balanced operator beats a maxed-out one.
- **The Valuation Number.** The headline score: EBITDA × a multiple that is itself modified by churn
  rate, growth rate, customer concentration, contract length mix, and reputation. Teaches that *how* you
  earned the money changes what it's worth.
- **The Diligence Report.** End-of-level, a fictional acquirer audits you and finds the things you hid:
  deferred maintenance, unbooked SLA liabilities, a single-customer dependency, undocumented systems.
  Each finding is a haircut on your valuation. Brutal, funny, and instructive.
- **Letter grades per department:** Sales / Marketing / Support / Ops / Finance. Lets a player see they
  won on growth and failed on support.
- **Win conditions vary by level:** hit MRR; survive N days; reach a retention %; pass the audit;
  complete a migration with < X minutes downtime; exit at a valuation.
- **Lose conditions:**
  - **Cash ≤ 0** and no credit available → insolvency.
  - **Reputation floor** → no new visitors spawn; slow starvation.
  - **Processor termination** → no revenue collection.
  - **Upstream termination for abuse** → your network goes dark.
  - **Mass churn cascade** → churn rate exceeds acquisition for N consecutive months, unrecoverable.
  - **Regulatory shutdown** → in compliance-gated levels.
- **"Zombie Host" soft-fail state.** You're not dead, but you're not growing, margin is 4%, and you're
  working 90 hours a week. The game lets you continue in this state indefinitely — which is, of course,
  the most realistic hosting outcome there is.

### 6.7 Financing instruments

- **Bootstrap.** No dilution, slow, everything is cash-gated. The purist mode.
- **Credit line.** Smooths cash bumps; the bank pulls it exactly when you need it most (covenant event).
- **Equipment financing.** Cheap money, secured on hardware, matches asset life. Very real.
- **Merchant cash advance.** Instant cash at usurious effective rates. The desperation button that
  usually kills you. Should be available and clearly labeled as a trap that occasionally saves a run.
- **Venture/PE equity.** Big cash, growth targets, board pressure, and a change in what "winning" means.
- **Customer-financed growth.** Sell annual prepays to fund expansion. Free money that is actually a
  loan from your customers, and the interest is paid in obligation.
- **Seller financing on acquisitions.** Buy a competitor with an earnout tied to retained revenue —
  which brilliantly aligns the risk and creates a lovely mechanic (you pay more if the migration goes
  well).

---

## 7. Core Gameplay Mechanics (with business systems as first-class objects)

### 7.1 Connections: wiring the business, not just the network

- **Two wiring layers, toggled with a keypress:**
  1. **Infrastructure layer** — physical/network links (web → DB, LB → pool, server → switch).
  2. **Commercial layer** — *contract wires*: which customer is on which plan, which plan maps to which
     resource pool, which SLA tier covers which service, which partner's customers route to which node.
  Same drag-to-connect verb, radically different meaning. Seeing both at once is chaos; toggling between
  them is the core readability trick.
- **Drag-a-cable interaction.** Click-and-hold a port on a service, drag; compatible endpoints glow, and
  incompatible ones gray out with a tooltip explaining *why* ("DB server requires a private VLAN — you
  don't have one"). Release to connect. The cable then renders as a visible, animated link whose
  thickness = throughput and whose color = health. Right-click a cable for its properties (bandwidth,
  latency, cost if it's a billable cross-connect).
- **Contract wires look different from network wires:** paper-textured, dashed, gold-colored, and they
  carry little coin pulses toward your bank every billing cycle. A customer whose invoice is overdue has
  a *red, fraying* contract wire. A customer in dunning has a wire that's visibly flickering. You can
  see your receivables problem as a picture.
- **SLA wires** run from a customer to the services they depend on, and turn red the instant *any* node
  in that dependency chain goes down — instantly showing you who is currently owed credits. Blast-radius
  visualization as a billing tool.
- **Cross-connect billing:** in DC levels, dragging a cable between a customer's rack and a carrier
  literally creates a recurring revenue line. Every cable you draw is money. The most satisfying drag in
  the game.

### 7.2 The Plan Builder (product design as a mechanic)

- A card-composer UI: drag *resources* (disk, RAM, CPU, bandwidth, sites allowed) and *features*
  (SSL, backups, staging, SSH, priority support) onto a plan card, set a price, set a renewal price,
  set a term. The game shows you, live: estimated conversion rate, estimated cost-to-serve, estimated
  margin, and estimated support tickets per account.
- **The oversell slider** on each plan, with a visible "at this ratio, expect N% performance complaints."
- **Grandfathering toggle** when you change a plan — keeps old customers on old pricing (happy, lower
  revenue) or migrates them (revenue up, churn spike, ticket flood).
- **The "Unlimited" trap.** You may label a plan "unlimited." Conversion jumps. Then the abuse arrives,
  and your terms-of-service fine print becomes a support and PR battleground.

### 7.3 The Pricing Dial and the Demand Curve

- A real, visible demand curve per segment. Raise price → fewer visitors, higher ARPU, *lower support
  load per dollar*. The game should make it discoverable that the $5 tier is where all the pain lives.
- **Promo codes** as placeable, expiring objects with a budget cap, a channel assignment, and an
  auto-detonating downside if they leak to a coupon aggregator site (unlimited redemptions).
- **Renewal pricing** as a separate, hidden-until-month-13 number. Setting it far above intro price is
  a legal, common, and reputation-corrosive strategy.

### 7.4 Resource management

- **Four resources, not one:**
  - **Cash** (spend it, can go to zero, kills you)
  - **Capacity** (CPU/RAM/disk/bandwidth — produced by servers, consumed by customers)
  - **Staff-hours** (produced by employees, consumed by tickets, incidents, migrations, sales calls,
    and — crucially — by *building things*)
  - **Executive attention** (a tiny pool, spent on the decisions only you can make: a whale's renewal, a
    viral complaint, a partnership negotiation, a key hire). Forces the player to *not* micromanage,
    which is the actual lesson of running a company.
- **Staff-hours are the real bottleneck at mid-game.** Everything worth doing consumes them, and your
  support queue consumes them first, involuntarily. Automation is how you buy them back.

### 7.5 Placement and layout

- **Two-zone map:** the **Front Office** (funnel, billing, support, marketing — where visitors walk) and
  the **Back of House** (racks, network, power — where threats attack). They're connected: a threat that
  breaches the back damages the front's conversion rate, and a front-office failure (billing outage)
  stops revenue from infrastructure that's working perfectly.
- **Rack adjacency matters.** Related services near each other = lower latency, lower cross-connect cost;
  but concentrated in one rack = one PDU failure takes them all. Explicit availability-zone reasoning
  expressed as *floor plan*.
- **The capacity meter per node** shows both technical utilization AND *revenue loaded onto it*, so you
  can see at a glance that Rack 3 holds 40% of your MRR.

### 7.6 Time, waves, and the business calendar

- **The month is the tick.** Billing runs on the 1st. Payroll on the 15th. Renewals cluster on cohort
  anniversaries. Quarterly, the audit/board/tax events land. This creates a *rhythm* the player learns
  to plan around — exactly like running a real company.
- **Wave = a business event, not just an attack.** A "wave" might be a renewal cohort, a Black Friday
  rush, a competitor's launch, an audit window, or a genuine attack. Mixed waves are the interesting ones:
  a DDoS *during* Black Friday *during* your payment processor's review period.
- **Speed control with consequences.** Fast-forward is available but incidents auto-pause. You cannot
  skip a crisis.
- **The 90-day lag.** Marketing spend, content, SEO, and hiring all pay off ~3 months later. Cutting them
  during a crunch feels free and hurts later. This delay is the core strategic tension of the whole game.

### 7.7 Decision cards and interruptions

- **The Inbox.** A persistent stream of decisions rendered as emails/tickets/letters: a customer
  threatening to leave, a partner proposing a deal, a vendor renewal, a journalist's question, an
  acquisition offer, a resignation letter. Each has 2-4 options, a cost, and a consequence that may land
  months later. The inbox *is* the game's narrative engine.
- **The "CEO Override."** Once per wave you may personally intervene on any one thing — save a customer,
  unblock a deal, calm an incident. Extremely powerful, doesn't scale, and using it every wave means you
  never built the system that would have handled it.
- **Delegation.** Assign standing policies to departments ("Support: always offer 1 month credit for
  outages under 2 hours") so routine decisions stop interrupting you. Getting the policies right is the
  late-game skill; a bad policy quietly bleeds you.

### 7.8 Failure states and recovery

- **The Death Spiral (modeled explicitly).** Outage → refunds → cash down → can't afford hardware →
  more outages. The game should visibly show the loop closing, and give the player the three real exits:
  raise price, cut cost, or raise money.
- **Graceful degradation.** You can *choose* which customers to protect when capacity is short. Protect
  the whales (good for revenue, terrible for the review sites) or protect everyone equally (fair, and
  you might lose the whale). A genuinely hard choice with no right answer.
- **The Controlled Shrink.** Deliberately firing your worst customers, shutting a product line, closing a
  region. Should be a *winning* move sometimes, and should feel awful.

### 7.9 Upgrades

- Upgrades come in three flavors, and the player should feel the difference:
  - **Capacity** (more of the same — boring, necessary)
  - **Efficiency** (same output, less cost — the compounding one)
  - **Product** (something new to sell — the one that moves ARPU)
- **Every upgrade has a "what does this let me charge for?" line** in its tooltip. If the answer is
  "nothing," it had better be defense.

---

## 8. Visuals and Presentation (through a business-dashboard eye)

### 8.1 Overall style

- **"Isometric business sim meets network operations center."** Clean, warm, slightly stylized —
  readable rather than photoreal. Think a tidy office-and-datacenter diorama with a glass-and-neon NOC
  wall bolted onto it.
- **Two visual registers deliberately clashing:** the **Front Office** is warm, papery, daylight, human
  (desks, plants, a reception counter, a coffee machine). The **Back of House** is cool, dark, blue-black,
  humming, with LED speckle. The player emotionally feels the two halves of the business.
- **Money is the accent color.** Gold/green. It should be the brightest thing on screen when it moves,
  in either direction.

### 8.2 Visitors and customers, visually

- **Visitors are little pedestrians walking a path** toward your front door, each carrying a visible
  **wallet** whose size = their ARPU and a small **checklist card** showing what they're looking for.
- **They visibly react** to what they pass: a fast site makes them speed up; a "500 error" sign makes
  them stop and look; a 1-star review billboard makes them turn around with a little puff of dust.
- **Converted customers walk inside and sit down** in your building. Each seated customer is a tiny
  desk/avatar. Your office visibly fills up as MRR grows — the most satisfying growth visualization
  possible.
- **Customer mood halo:** green/amber/red ring. Red customers have a small floating "cancel" thought
  bubble that fills over time. You can *see* churn coming and go intervene.
- **Whales are physically bigger.** Enterprise Edith takes up four desks and has a briefcase. When she's
  unhappy the whole room dims a little.
- **Churning customers stand up, walk out, and — if angry — stop at the door to spray-paint a 1-star on
  your window** which other passing visitors then see. Reputation made physical and local.
- **Referrals:** a happy customer occasionally sends out a little paper airplane that flies off-screen
  and returns with a friend.
- **Cohorts as color:** customers acquired via each channel tinted subtly (paid = orange, organic =
  green, referral = blue, affiliate = purple), so when the affiliate cohort churns en masse you can
  *see* the color drain out of your office.

### 8.3 Threats, visually, with their price tag attached

- **Every threat unit carries a floating dollar figure** of what it will cost you if it lands. Not HP —
  *damage in dollars*. This single choice reframes the entire genre for this lens.
- **Chargebacks:** small paper receipts that flutter *out* of your bank vault, not in from the lanes.
  They attack from the inside.
- **Refund requests:** angry envelopes with a red seal.
- **Review bombs:** a slow-moving billboard truck that parks in front of your building and displays a
  1-star. It blocks the visitor lane until removed.
- **DDoS:** a dense grey swarm; the lane visibly *clogs* and your legitimate pedestrians get stuck behind
  it, which is exactly what a DDoS actually does to your business.
- **The Carder Ring:** identical-looking visitors arriving in synchronized formation, all with *identical
  wallets*. The visual tell is the repetition — a player learns to spot fraud by pattern.
- **Support Vampire:** a customer whose desk has a visibly growing stack of ticket paper, and a thin
  red tether draining your support staff.
- **Abuse complaints:** official-looking envelopes with a government seal; DMCA is a lawyer briefcase.
- **The Competitor:** a rival storefront visible at the edge of the map that grows/shrinks, runs its own
  billboard, and occasionally sends a poacher (a little figure in a suit) to walk up your lane and hand
  flyers to your visitors.
- **The Auditor:** a slow, unstoppable figure with a clipboard who walks straight through your defenses.
  You cannot fight them, only be prepared.
- **Vendor Price Hike:** a letter that lands on your desk with a physical THUD and a visible shockwave
  that ripples through every server, each of which ticks up a small red cost number.

### 8.4 Infrastructure, visually

- **Servers show revenue, not just load.** Each rack unit has a thin gold band showing the MRR it
  carries. A rack with 30% of your revenue on it glows differently. This changes how you look at your
  own map.
- **Utilization as heat:** cool blue (wasting money) → green (ideal) → amber (risky) → red (failing).
  Empty capacity is *visibly cold*, so overbuying looks as wrong as it feels on the P&L.
- **Oversell shown as translucent "ghost" customers** stacked on a server beyond its real capacity — you
  can literally see how thin the ice is.
- **Cross-connects glow gold** and emit coin sparkles monthly.
- **Services show their license cost as a small tag** so a vendor price hike visibly relabels your
  entire estate.
- **Depreciation:** hardware visually ages — cleaner to dustier, LED colors fading — approaching its
  end-of-life, with a small "book value" number ticking down.

### 8.5 The HUD (a real operator's cockpit)

- **Top bar:** Cash (with a runway-in-weeks sub-label), MRR (with the month's net-new delta), Reputation
  (stars + trend arrow), and Date.
- **The Pulse Strip.** A thin horizontal sparkline band showing, side by side: signups, churns, tickets,
  uptime, and cash — all on the same time axis, so correlations jump out ("oh, churn spiked *three weeks
  after* the outage").
- **The Ticket Inbox tray** on the left, physically stacking. When it overflows, paper spills onto the
  floor. Visceral, unambiguous, and no number required.
- **The Ledger Drawer.** Pull up a P&L that's an actual, readable, stylized income statement. Revenue by
  line, cost by line, margin. Players who want the spreadsheet get the spreadsheet.
- **The Cohort Wall.** A retention triangle/heatmap for players who want to think in cohorts. Each row a
  signup month, colors fading as customers leave. Gorgeous and genuinely instructive.
- **The Obligation Rail.** A horizontal timeline across the bottom showing everything you owe and when:
  payroll, vendor renewals, contract expirations, audit deadlines, prepay service obligations, debt
  payments. Future commitments made visible is *the* CEO-lens HUD element.
- **The SLA Meter.** Per tier, a bar showing minutes of downtime used against the month's allowance,
  filling live during an incident with the credit dollar amount ticking up beside it. Watching money
  drain in real time during an outage is the most stressful and most honest thing this game can show.
- **The Concentration Donut.** Revenue by customer and by channel. One slice getting too big turns
  amber. Silent, constant strategic pressure.

### 8.6 Expressing money movement

- **Revenue:** gold coins flow along contract wires into a vault on billing day, with a satisfying
  cascade sound. Failed payments produce a *dull clunk* and a coin that falls short and rolls away.
- **Costs:** a continuous thin stream of coins leaving toward labeled drains — Payroll, Power, Transit,
  Licensing. You can see exactly which drain is biggest. Upkeep as visible plumbing.
- **SLA credits:** coins flowing *backwards* out of the vault toward the customer. Painful and clear.
- **Margin:** the vault has a visible water-line; the "fill rate minus drain rate" is your margin
  expressed as a physical thing.
- **Deferred revenue:** money in your vault that's tinted a different color and slowly *un-tints* as you
  deliver the service. Spending tinted money is possible and clearly marked as borrowing from the future.
- **A big enterprise deal closing** = a slow armored truck pulling up, and the money doesn't unload for
  60 days (the truck literally parks and waits — net-60 made visual).

### 8.7 Readability at scale

- **Zoom tiers change the metaphor, not just the scale:** individual servers → racks → rows → DC floor →
  region map → the business dashboard. At the highest zoom you stop seeing hardware and see only money
  and customers, which is exactly what happens to a real CEO.
- **The "Money View" filter.** A toggle that recolors the *entire map* by profitability — green where
  you're making money, red where you're losing it. Instantly answers "which part of my business is
  broken," which is the hardest question a real operator has.
- **The "Risk View" filter.** Recolors by blast radius and single-point-of-failure exposure.
- **The "Customer View" filter.** Recolors by which customer's stuff lives where.
- **Alert triage colors** are reserved exclusively for actual money-affecting events. Nothing else gets
  to be red. A NOC that cries wolf is unusable, and so is a HUD.

### 8.8 Little touches a real operator would grin at

- The office coffee machine breaks during an incident.
- A wall-mounted "Days Since Last Outage" counter that resets with a sad little flip.
- The status page is a small separate building *across the street* — visibly not connected to your
  infrastructure. If you built it inside, it goes down with everything else and a tiny ghost of an
  operator facepalms.
- The support team's ticket stack physically grows a little fan of "URGENT!!!" red tabs.
- A framed photo on the wall of your first customer.
- The sales team's gong. It rings on a close. You can turn it off in settings and nobody ever does.
- An "on-call" pager sprite that glows at 3am regardless of whether you're watching.
- The whiteboard in the office slowly fills with your actual strategic decisions from this playthrough.

---

## 9. Anything Else — Modes, Twists, Meta

### 9.1 Modes

- **Bootstrapped Mode.** No outside capital. Every dollar comes from customers. The purist economic
  challenge and, honestly, the best version of this game.
- **VC-Backed Mode.** Enormous runway, enormous growth targets. You're *required* to spend inefficiently.
  Win condition is a valuation, not profitability. Losing looks completely different (you hit your
  targets and still get replaced by the board).
- **Roll-Up Mode.** Pure M&A. Buy books of business, integrate, extract margin, repeat. Teaches exactly
  why consolidated hosting brands feel the way they do. Optional moral track: you can choose to
  actually improve the companies you buy, which is slower and scores differently.
- **The Turnaround.** Start with an existing company that is *already failing*: 8% monthly churn, 2.1
  stars, angry staff, deferred maintenance, one whale threatening to leave. Diagnose and fix. The best
  possible "advanced" mode.
- **Niche Run.** Locked to a single vertical from turn one (WordPress agencies / game servers / email
  only / privacy hosting / church websites). Different customers, different threats, different everything.
- **Sandbox / Tycoon Mode.** Unlimited money, build the datacenter of your dreams, watch the org run.
- **Hardcore / "One Company" Mode.** Permadeath. Bankruptcy ends the run permanently.
- **The Solo Founder.** No hiring allowed. Everything must be automated or deflected. A brutal
  automation-puzzle variant.
- **Ethics Off / Ethics On.** A toggle at the start that enables or disables the grubby-but-real
  strategies: astroturfed reviews, hidden renewal pricing, bait-and-switch plans, paid "Top 10"
  placements, aggressive overselling, terminating customers to dodge SLA credits. With it on, the game
  quietly tracks your choices and delivers a verdict at the end.

### 9.2 Twists

- **The Reputation Is the Real Health Bar.** Cash can be refilled. Reputation, once floored, takes
  *years* of game time to rebuild. Some runs should end not with bankruptcy but with irrelevance.
- **You Can Fire Customers.** And sometimes you must. A whole mechanic around identifying,
  offboarding gracefully, and absorbing the reputation hit.
- **Your Own Marketing Site Is On Your Own Infrastructure.** Every outage is also a sales outage.
  Players eventually learn to host their status page and their marketing site elsewhere, which is
  exactly what every real host learns.
- **The Customer Who Becomes a Competitor.** A reseller grows, learns your playbook, and launches
  against you. Ten levels of foreshadowing paying off.
- **The Acquisition Offer You Should Refuse.** A tempting exit that, if you look at the terms, has an
  earnout you'll never hit and a non-compete that ends your career. Reading the fine print should be a
  real, rewarded activity.
- **Legacy Debt.** Every level you finish leaves behind something: the customer you kept on PHP 5.6, the
  hacked-together billing integration, the one server nobody wants to touch. It follows you into the
  next level as a permanent minor liability. A campaign built on accumulating technical and commercial
  debt.
- **The Time-Delayed Consequence Engine.** The core twist of this lens: **almost nothing you do has an
  immediate result.** Cut support → churn rises in month 3. Cut marketing → leads dry up in month 4.
  Raise prices → revenue up now, churn in month 13 at renewal. Skip backups → nothing, nothing,
  nothing, catastrophe. The game's whole difficulty comes from acting on lagging information, which is
  the actual experience of running a company.
- **Reverse Tower Defense Interlude.** Play as the customer trying to reach a *badly-run* host —
  navigating a dark pattern checkout, a 40-minute hold queue, and a cancellation form buried five clicks
  deep. Playing the victim of your own dark patterns, then returning to your company, is the single best
  teaching device available.

### 9.3 Humor and flavor

- Ticket titles generated from real hosting-support classics: "site is down" (it isn't), "URGENT can you
  edit my logo," "I deleted everything can you undo it," "my nephew says your server is slow."
- The cancellation reason dropdown includes "moving to a friend's server in his basement" and, three
  months later, that customer walks back through your door.
- An unread-email counter that only goes up.
- A "the CEO is on Twitter" mechanic where you can post — great reach, occasionally catastrophic.
- The competitor whose entire marketing strategy is a giant "99.999%" sign that is visibly a lie.
- A "compliance consultant" NPC who charges enormously and says "it depends" to every question.
- An employee who fixes everything, is beloved, and is quietly interviewing elsewhere the whole game.
- Server hostnames the player can set; the game will reference them in incident reports forever.
- A small achievement for having a "Days Since Last Outage" counter reach 365.
- An achievement for successfully raising prices and *gaining* reputation, which is the rarest thing in
  this industry.

### 9.4 Meta systems

- **The Playbook.** Across runs, you accumulate a personal library of policies and plans that worked.
  Unlocked policies can be pre-set at the start of future runs — a meta-progression made of *management
  wisdom* rather than stat boosts.
- **The Alumni Network.** Employees who leave you go on to run other companies. In later runs they show
  up as partners, vendors, competitors, or acquirers — and how you treated them determines which.
- **The Annual Report.** End-of-run, the game generates a shareable, genuinely handsome one-page annual
  report: revenue chart, customer count, uptime, a "letter from the CEO" assembled from your actual
  decisions, and the diligence findings. Perfect share object, and it teaches by summarizing.
- **Industry Benchmarks.** Compare your churn, margin, and CAC payback to (fictionalized but realistic)
  industry medians. Contextualizes every number — a 3% monthly churn feels fine until you learn the good
  operators run 1%.
- **Scenario Editor / Community Disasters.** Let players author incident scenarios ("the week our
  registrar was acquired") and share them.
- **Post-Mortem Mode.** After any failed run, an interactive replay that highlights the three decisions
  that actually killed you, with the lag between decision and consequence drawn explicitly. Since the
  whole game is about delayed consequences, the post-mortem is where the learning lands.

### 9.5 The thesis, stated plainly

A real hosting operator's job is not "stop the attacks." It's:
**sell capacity at a price above your cost to serve, collect the money, keep the promise, and be
believed.** Every attack, every outage, every ticket, and every server in this game should ultimately be
measured against those five verbs — *sell, price, collect, deliver, be trusted* — and the game will feel
true to anyone who has actually done it.
