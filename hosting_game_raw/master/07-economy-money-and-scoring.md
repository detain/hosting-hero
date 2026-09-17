# 6. Economy, money, and scoring

*The framing principle for the entire category, stated three separate times by three separate lenses
and therefore load-bearing: **separate CASH from PROFIT and make both visible.** Nearly every hosting
company that dies is profitable on paper. If the game models only one number, it isn't about hosting.*

*Two further wave-2 theses reshape everything below. **(T1) Hosting is billed in terms, not months** —
prepay windows, renewal cliffs, 3–5 year colo terms with annual escalators and ramp schedules,
reserved vs. spot GPU, MRC plus per-minute settlement. **(T2) Revenue has a colour, not just a size** —
two companies with identical MRR can be completely different companies, and the game should show which.*

---

## 6.1 The currency set

### Cash (the survival currency)
Liquid money in the bank. **You die when it hits zero, regardless of how healthy the business looks.**

**How it works:** Spent on hardware, salaries, transit, power, licences. Received from invoices *when
they actually clear*, not when they're issued (§6.4). **The single most important realism in the
document: profitable companies die of cash.** Cash is not one number, though — it is the top layer of
a six-bucket stack (§6.13), and only the top layer is spendable.
**Interacts with:** §6.4 (timing), §6.13 (restricted cash), §6.11 (financing), the Runway Bar below.
**Visual:** a liquid column that drains, never a bare numeral. See §6.15's Gap Bar and Drain Choir.

### The Runway Bar (the actual health bar)
Replace "cash" as the primary top-left number with **months of runway** (cash ÷ net burn), drawn as a
horizontal bar, with cash as the smaller secondary figure.

**How it works:** Runway contains both of the currencies the player is confused by — it is cash
measured in units of burn — so it makes the growth-consumes-cash tension legible without teaching
accounting. Under 6 months the bar changes colour; under 3, the UI tone shifts (§6.4, spec'd in
§6.15's Runway Tone Shift) and a subset of long-horizon purchases grey out with the stated reason
"*you can't afford to wait for this.*"
**Why it matters:** §6.1's original two-meter proposal (Cash column + MRR ribbon) doesn't solve the
real problem, which is that *neither number is a health bar* — the player cannot tell how close to
death they are. Runway is the health bar, cash is the fuel, MRR is the score.
**Interacts with:** §6.4 runway entry, §6.8 HUD tiering, §6.15 Burn Candle (runway as candle length).

**Variations and additions**

- **The Runway Hourglass.** Cash ÷ net burn = **weeks of life**, visible in *every* level rather than
  only the crisis ones, because every real operator watches it. It also **retimes bankruptcy** from
  "cash < 0" — which never actually happens, because providers cut you off first — to **"runway < one
  payroll cycle,"** which is how it feels. (See the Death-by-cash conflict in §6.10.)
- **The reserve fund framing.** State the same bar as *how many incidents you can eat before
  bankruptcy* — a buffer measured in disasters rather than months.
- **The "no reserves" hardcore flag.** A start option that removes the buffer entirely and **doubles the
  score multiplier.** Difficulty the player buys with their own runway.

### The MRR Heartbeat — killing gives nothing
**The single inversion that makes this game not a generic tower defense: attacks award $0.**

**How it works:** Revenue arrives as a monthly *tick* from surviving customers. Your customer base is a
**generator building that walks in from outside**, and threats and downtime *prune the generator*. You
do not farm enemies, you farm **retained customers**. **Defense is insurance, not income.** Blocking a
packet pays nothing; keeping the customer who was behind that packet pays every month for years.
**Why it is load-bearing:** it makes every system that touches churn touch the whole economy — one
elegant lever — and it means the player's instinct to "kill more things" is never rewarded directly.
**Interacts with:** §6.2's recurring core, §6.9's conversion-first scoring, §6.10's churn spiral.

**Variations and additions**

- **One synced beat.** Unify with §4's Renewal Pulses on the same clock: billing tick = renewal flash =
  MRR fountain surge = coin-drop chime, one visible drumbeat per cycle — and **price changes, competitor
  offers and union votes all resolve on that same tick.** The entire economic drama lands on one
  drumbeat, and players learn to time risky upgrades to it, which was the intent all along.
- **The HUD's main number is the MRR *trend*, not cash.** Cash is a constraint (you can't pay bills);
  MRR is the scoreboard, because investors and operators value the recurring stream.
- **MRR grows without new customers.** Expansion — usage, seats, add-ons — needs a per-customer
  expansion tick tied to health and usage, or "retention" plays as passive lane-tending instead of an
  active second revenue engine. **NRR above 100% is the number operators worship.**
- **MRR as the HP-adjacent oxygen bar.** Every game-month ticks income and subtracts upkeep
  automatically; net negative starts a slow death spiral.
- **Income is flow, not loot.**
- **The tempo clock, redefined:** *"you don't wait for the next wave, you wait for the next invoice"* —
  power, bandwidth and payroll drain hourly in level-time.
- **Churn is the true currency.** *"Churn is the hit points of the company"* — every departure costs
  money now **and** the loyalty/referral compound it would have made later. The visible stat players
  should learn to protect first.

**Amendments to the absolute rule** *(the pillar survives; the exceptions are legible)*

- **Attack-saved-egress (the kill that pays).** Every GB of flood you scrub is a GB not bought at commit
  overage — blocked packets drop small **silver** coins into the HQ tray, labelled *avoided cost*. The
  honest exception every real DDoS-protection upsell already uses.
- **Sharper still under metered egress: "attacks award $0" becomes "attacks *bill* $N."** A DDoS spends
  your money even when it fails — scrubbed-GB fees, upstream flood charges. The heartbeat needs a
  variable metered-cost tick so metered-vs-flat is *felt*, not flavour.
- **The Bounty Board (intel, never cash).** Sanctioned kills pay in **intel currency** (§6.1) — codex
  reveals, next-wave telegraphs, WAF signatures. The anti-farm rule survives while the hands get a
  dopamine drip; especially valuable in breach and migration levels where no-revenue phases otherwise
  make defensive play feel dead.
- **Bug-bounty finds reworded as loss-avoidance rebates** — *"the vendor discount you earned by fixing
  early."* Money enters as an **upkeep reduction**, never as attack income, so "defense is insurance,
  not income" survives its own exception list.
- **Early-game bootstrap tension.** A pure-tick economy has no first-tower money. Give new companies
  **contract signup bonuses** (one-time cash at first conversion) plus a **seed round** (the Investor
  mechanic's small cousin) — and keep "kills give $0" intact.

### MRR (the growth currency)
Monthly Recurring Revenue — the contracted run-rate.

**How it works:** MRR is the *score*; Cash is the *health bar*. Growing MRR generally *consumes* cash,
because you buy the servers before the customer pays. **The core business tension in one sentence.**
The classic waterfall decomposition — **new + expansion − contraction − churned** — is the correct
presentation, and is visually perfect as a bar chart that fills and drains each month.
**Tension:** ⚔️ Two-currency systems risk confusing players. Mitigations: render them in two visually
distinct ways (Cash as a liquid column that drains, MRR as a slowly climbing ribbon / the §6.15 MRR
Spine), and never let a level require the player to understand both in the first hour.
**Tension:** ⚔️ §6.8's rule "nothing on the HUD that the player cannot act on" technically excludes
MRR — you cannot act on MRR directly. Either MRR moves off the HUD, or the rule needs an explicit
"…and the two or three things you are ultimately playing for" exemption. The merged position: keep
MRR on the HUD under that exemption, and move NRR, LTV:CAC and DSO to the drawer.

### Revenue Quality — colour the money (T2)
The headline economic addition of wave 2. Every dollar of MRR carries hidden attributes.

**How it works:** Each dollar of recurring revenue carries **term remaining**, **gross margin**,
**cost-to-serve**, **source/commission load**, **payment method**, **concentration weight**, and
**abuse propensity**. The HUD's MRR number stays a number, but a **Revenue Quality bar** underneath it
shows composition by colour. Two companies with identical MRR have completely different bars, and the
end-of-level valuation (§6.9) reads the bar, not the number.
**Suggested bands:**
- **Gold** — multi-year contracted, high margin, low touch, direct-sourced (colo cross-connects, colo
  cabinets, backup/DR, DBaaS).
- **Green** — annual prepaid, decent margin, moderate touch (managed WP, dedicated, business email).
- **Blue** — monthly, medium margin, self-serve (VPS, shared at fair prices).
- **Amber** — commissioned/agent/affiliate-sourced, or usage-volatile (GPU spot, CDN egress, VoIP
  minutes).
- **Red** — negative-contribution or high-abuse revenue (deal-forum cohorts, free-tier converts on
  permanent 90% coupons, the $2 unlimited plan, crypto tenants).
**Why this matters more than anything else in §6:** it makes "grow MRR" stop being the objective and
turns it into "grow the *right* MRR," which is the entire real job and is otherwise invisible.
**Interacts with:** §6.9 valuation, §6.12 term structure, §5's customer archetypes, §6.6 per-type.

### Error Budget (the spendable in-combat currency)
**The design's missing third resource, and the one that makes the whole thing play like a game.**

**How it works:** Your contract sets an availability commitment; the **error budget** is the downtime
it permits, expressed in minutes and drawn as a visible tank:

| Commitment | Budget / 30-day month |
|---|---|
| 99% | 7h 18m |
| 99.5% | 3h 39m |
| 99.9% | 43m |
| 99.95% | 21m 36s |
| 99.99% | 4m 19s |

It drains when you're down — but crucially, **you may also spend it deliberately**:
- **Take a maintenance window** — costs budget, grants safe change.
- **Risky deploy without canary** — costs 3 minutes of budget up front, ships instantly.
- **Reboot to fix instead of diagnosing** — costs 90 seconds, resolves now.
- **Drain and move a live workload** — costs budget, avoids a bigger later cost.
- **Reclaim** — every clean week refunds a small amount; a level with zero incidents banks a surplus
  you can carry to the next level.

When the budget is exhausted, the game **locks risky actions**: no deploys, no non-emergency changes,
change control mandatory — exactly the real policy, arriving as a mechanical consequence rather than
a rule the UI states.
**Why this matters so much:** a tower defense needs something you *spend to win right now* with a
visible refill, or the moment-to-moment loop is just waiting. Money is too slow (it arrives monthly)
and hands are already the peacetime resource. Error budget is fast, visible, thematically perfect,
ties the difficulty selector to a live number, and turns "how much risk can I take today" into the
central question of every single minute. §6.8 lists it as one HUD item among thirty-five — **this is
the single highest-value promotion available anywhere in the document: it should be the spine.**
**Interacts with:** §6.12 the contract, §6.9 The Nines, §6.7 SLA credit event, §6.10, §7.5 actions.
**Hosting types:** universal, but the budget *size* is the per-type personality — a game-server level
runs on minutes, a backup level on restore-success rather than uptime, a colo level on power events.

### Reputation split into Visibility and Trust
A slow-moving stat that gates who will buy from you and at what price — and it must be **two** stats,
not one.

**How it works:** The original claim was "**Reputation is the only resource you cannot buy**," and the
document contradicts itself twice: the Astroturf Temptation explicitly lets you buy reputation
temporarily, and the affiliate/review-site pipeline buys visibility that acts as reputation at the
point of conversion. **Fix: split the stat.**
- **Visibility** — *buyable*. Ads, affiliates, review placements, PR, sponsorships, MDF co-op money.
  It raises the **volume** at the top of the funnel.
- **Trust** — *not buyable*. Earned by behaviour over time. It raises **conversion**, raises **price
  tolerance**, and gates enterprise/regulated/compliance lines.
Astroturfing buys Visibility while secretly *risking* Trust, which is exactly the right shape for that
mechanic. The original statement then becomes true — you cannot buy trust — and the counterexamples
become illustrations rather than contradictions.
**Further split (segment reputations):** Trust is itself segmented — **developer cred**, **enterprise
trust**, **gamer goodwill**, **compliance standing**, **deliverability reputation**. Actions that
raise one lower another: taking a grey-area customer raises revenue and lowers enterprise trust.
**How it works (dynamics):** Earned in months, lost in minutes. Gates acquisition rate, conversion
rate, price tolerance, enterprise eligibility and which hosting lines you may open.
**Visual:** a face, a star rating, and a press ticker.

### Intel / Knowledge
Earned from honeypots, postmortems, logs, conferences and community.

**How it works:** Spent on research nodes. **The only currency that converts suffering into
capability.** Productizable: a **Threat Intel Feed** turns the intel your honeypots generate into an
actual revenue line (§6.2).

### Hands / Attention (staff-time)
The scarcest resource in the game.

**How it works:** Each staff member is one concurrent action. Not storable, not bankable, resets each
tick. Overtime borrows from tomorrow at interest (morale). **Most crises are lost because you ran out
of hands, not money.** Hands are also what professional services and remote hands *sell* (§6.2), which
makes every services dollar a direct trade against operational capacity.

### Trust-with-upstreams (the hidden fifth, made real)
Your standing with carriers, registrars, vendors, distributors and the payment processor.

**How it works:** Invisible until it matters; then it determines whether you get null-routed,
terminated, or defended. **The single worst day in hosting is when your own provider decides you're
the problem.** Wave-2 flagged this as **[INERT]** — invented and then never used as a mechanic
anywhere. Make it real:
- **Make it visible** — a small relationship bar per upstream / vendor / registrar / processor.
- **Make it move** — abuse-handling speed, payment timeliness, honest incident communication, traffic
  ratios, whether you stretched AP past 45 days (§6.13).
- **Make it pay** — it sets response time on BGP incidents, whether you get null-routed or merely
  warned, whether a processor *calls before* terminating, whether your transit provider lets you burst
  past commit without a bill, whether your distributor puts you on credit hold.
**That's four mechanics from one existing idea.**
**Interacts with:** §6.10 upstream termination, §6.10 processor termination, §6.13 AP as a lever,
§6.9's Externality Score (which feeds it directly, so it has teeth).

### Power and space (physical currencies)
In facility levels, kW and rack units are literal currencies.

**How it works:** You buy them in blocks, you resell them at margin, and stranded amounts are pure
loss (§6.6). **Hosting is a real-estate business wearing a computer costume.** Note the colo
subtlety (§6.3): the number on the contract, the number the customer can draw, and the number you pay
the utility for are three different numbers.

### Lead time (the currency you cannot buy with money)
Formalized as a resource in its own right.

**How it works:** Some things cannot be bought with money, only with **foresight**. Circuits take
60–90 days. Hardware takes 8 weeks. A cross-connect takes a scheduled tech visit. A visible **Lead
Time Board** shows everything in flight with expedite options that are expensive and only *sometimes*
work. **The scoring consequence:** a level-end stat, **"Decisions made under lead-time pressure,"**
which is a direct proxy for how far ahead the player was actually planning.
**Interacts with:** §6.4 capex lead time, §6.9 Preparedness score, §6.13 committed-out bucket.

### Receivables (money that is real and unspendable)
The third money state, distinct from both cash and MRR.

**How it works:** Invoiced, unpaid, aged. Real revenue you cannot spend. It is the mechanism by which
winning a big enterprise logo makes you *poorer* for a quarter. Rendered as the **AR Aging Shelf**
(§6.15) and detailed in §6.13.

### The Heat meter (the grey-play currency)
For bulletproof, free-tier-heavy, seedbox and grey-area lines.

**How it works:** Rises with abuse complaints, unsavoury customers, unactioned DMCA and law-enforcement
requests. At thresholds, consequences arrive in order: **upstreams** grumble, then the **payment
processor** acts, then the **authorities** do. It is the visible price of the highest-margin revenue
in the game.
**Hosting types:** bulletproof, seedbox/file, cheap VPS, free tier; near-zero for colo, regulated,
enterprise backup.
**Interacts with:** §6.1 Trust-with-upstreams, §6.10 deplatforming and regulatory shutdown.

**Variations and additions**

- **Grey money can claw back.** Cash from bad sources reverses later — payment reversed *plus* a fine —
  so bulletproof play is **fast dirty money vs. slow clean money**, with a banked "launder" upgrade that
  carries its own seizure risk. The Heat meter is what prices that trade.

### EBITDA / contribution margin (the quality meter)
The third money bar next to Cash and MRR.

**How it works:** Cash is survival, MRR is growth, **EBITDA/contribution margin is quality.** A company
can grow MRR beautifully while contribution margin goes negative — which is precisely the state the
Margin Death Zone (§6.5) describes. Displayed per line of business, not just company-wide, because
company-wide margin hides the line that is subsidizing the other one.
**Interacts with:** §6.9 Rule of 40, §6.9 valuation, §6.14 internal transfer pricing.

### The Three-Bucket Budget (Grow / Defend / Sustain)
A visible allocation the player argues with — a *mirror*, not a constraint.

**How it works:** Every dollar is visibly allocated to one of three buckets, shown as a three-segment
bar under your cash: **Grow** (capacity, marketing, sales), **Defend** (security, redundancy,
insurance), **Sustain** (maintenance, staff wellbeing, documentation, drills, debt paydown). The bar
does not restrict spending — it reflects it. The game names your shape ("*You are 71% Grow. That's a
bet.*") and the end-of-level card shows the industry-typical band, roughly **45 / 25 / 30** for a
healthy operator.
**Why:** it gives one glance-able read on the player's own strategy, makes "peacetime must be
valuable" visible as a number they can be ashamed of, and is the single cheapest way to make an
economy with forty cost lines feel comprehensible.
**Interacts with:** §6.3, §6.8 HUD, §6.9 scoring.

### The Three Budgets (capex / opex / hands, with lossy conversion)
Separating money that cannot substitute for itself.

**How it works:** Capex, opex, and **hands** are three separate budgets with explicit conversion rules
and *friction* between them. You can convert cash to hands (hiring, contractors) slowly and at a
premium; you can convert hands to capex savings (do it yourself) at a risk cost; you **cannot** convert
capex to opex instantly without financing. **Making the conversions visible and lossy is what makes
resource management interesting** rather than a single pool with a colour.
**Tension:** ⚔️ This and the Three-Bucket Budget both want the same three-segment bar under the cash
readout. They are different axes (Grow/Defend/Sustain is *purpose*; capex/opex/hands is *form*). Ship
one on the HUD and the other in the Ledger Drawer; the lenses disagree on which.

### The core currency set — *CONFLICTING*

What, exactly, are the game's foundational currencies? The two documents propose mutually exclusive
sets, and the choice determines the verbs, the HUD, and the *number of distinct ways you can lose*. It
is not a cosmetic naming question: a three-pool design gives three death flavours, a two-pool design
gives one, and the large-set design gives one death (free cash) with many pressures feeding it.

#### Position A — the large set, with Runway as the health bar *(master)*

Everything catalogued above: **Cash** (survival, and only its top layer is spendable — §6.13),
**Runway** (the actual health bar), **MRR** (the score), **Revenue Quality**, **Error Budget** (the
spendable in-combat currency), **Reputation split into Visibility and Trust**, **Intel**, **Hands**,
**Trust-with-upstreams**, **Power and space**, **Lead time**, **Receivables**, **Heat**, **EBITDA**, and
the two budget framings. The governing slogans: **Runway is the health bar, cash is the fuel, MRR is
the score**, and *you die on free cash, not total cash*. Depth comes from the fact that the currencies
convert into each other lossily and on different clocks; legibility comes from the §6.8 three-tier HUD
restructure rather than from having few currencies.

#### Position B — a small closed set, with one death per pool *(opencode)*

A short list, chosen so that **losing all of any one is a game over with its own flavour**. Seven
competing shortlists were proposed, and they are mutually exclusive with each other as well as with
Position A:

- **Cash + Bandwidth/Compute + Reputation** — three scarce pools that everything consumes; three
  distinct failure flavours. Bankruptcy = cash < 0 at wave end (grace: one bridge loan at evil rates);
  Reputation = 0 → nobody arrives and revenue starves. *(the Wave-1 consensus)*
- **Cash (tactical) + Credit (strategic) + Reputation (gating).** The game hands you **loans with
  interest** — on-brand for the industry — and the loan system creates designed desperation arcs;
  Reputation gates customer classes and survival events.
- **Cash (survival) + MRR (the score that matters) + Float (receivables + prepaids = time-shifting).**
  Win/lose is cash solvency; high score is exit value.
- **Cash + Reputation + *Attention*** — your action budget, consumed by tickets and incidents. Money
  alone cannot win; *"a rich, chaotic mess is a real fail state."*
- **Just two: cash (ops) and credits (reputation-as-money)** — credits spendable on fast vendor support,
  emergency capacity and goodwill forgiveness during incidents, which makes PR **strategic rather than
  cosmetic**.
- **Just two *visible*: Cash + Trust/Reputation** — spendable cash split from a reputation stat that
  gates visitor tiers and staffing.
- **The scoring-side triple: Cash (survival) + Reputation (arrival rate) + Capacity headroom
  (resilience).**

**And one argument that cuts across both positions** — a *split* rather than a set: **one shared
Reputation number makes email hosting (where IP reputation *is* the product) mechanically identical to
shared hosting.** Split it into **brand** (price tolerance and conversion radius), **trust**
(enterprise and partner doors — a gate, not a dial), and **deliverability / IP reputation** (a
type-specific pool), each with its own decay curve. This is compatible with Position A's
Visibility/Trust split and sharpens it; it is *incompatible* with any single-Reputation shortlist.

---

## 6.2 Revenue streams

*Organized by **shape**, not just source — because the shape (recurring / one-time / metered /
contracted / negative) is what determines cash timing, churn exposure and valuation multiple.*

### The recurring core (MRR)
Monthly plans, billed in advance or arrears. The spine of the economy and the basis of valuation.

**How it works:** Every hosting type has a **unit of sale** (the Ruleset Card) and the unit is what the
meter counts: an account, an instance, a socket, a U, a kW, a TB-month, a GB transferred, a slot, a
query, a channel, a GPU-hour, a mailbox, a zone, a protected prefix, a device, a satellite pass.
Predictable, slow to grow, slow to lose — the "tick" of the game's economy, recognized monthly.
**Visual:** the **MRR Spine** (§6.15) — a vertical stack of contract cards whose total height *is* your
MRR, with new customers slotting in and churned ones falling out.
**Hosting types:** all.

### The three money clocks
Revenue classes with genuinely different physics, displayed as three gauges with different volatility.

**How it works:** **MRR** (monthly, predictable, the score's backbone; churn attacks it) · **metered**
(grows with your customers' success, lumpy cash — GPU-hours, TB, GB) · **prepaid / float** (cash now,
liability later — shared, dial-up, backup credits). **Level goals should *specify* which mix** — a
backup level wants metered growth, a colo level wants MRR stability — which turns "what kind of revenue
did you build" into an objective rather than an accident.
**Interacts with:** §6.1 Revenue Quality (the colour bands are the quality axis; these are the *physics*
axis), §6.4 deferred revenue, §6.12 term structure.

**Variations and additions**

- **The shape of the cash curve changes the level's feel.** MRR (subscriptions, colo, backup — steady
  ticks) makes **annuity levels: calm but fragile**. Metered (GPU per compute-hour, streaming per
  concurrent, CDN per GB) makes **volatile levels**. Transactional (setup fees, migrations) makes
  **lumpy levels**. **Burst** (ad revenue peaking during live events) makes **event levels**.
- **Recurring vs one-time vs milestone.** Subscriptions tick every wave (an annuity strategy); jobs and
  one-offs spike; contracts pay **on milestones** — so cash-flow *timing* is the real variable
  (government net-90, enterprise quarterly).
- **Type bias as identity.** Shared = MRR · GPU = contracts paid at job completion · CDN = bytes ·
  **backup = *claims*, where you get paid MORE when disaster strikes others — the insurance economy.**
  Plus premium services (managed = a margin multiplier) and **renewals** (loyal customers pulse cash).
- **Revenue model mix per type, as a fingerprint.** Prepaid monthly (shared/VPS: cash ahead of cost,
  float bonus) · postpaid metered (CDN/streaming: cash lag, bad-debt risk — big usage invoices default)
  · retainers (managed services) · hourly (GPU/cloud) · **space + power (colo: three billing axes —
  rack U, amps, Mbps — which the customer pays separately and negotiates separately)**. Each model
  carries a different volatility / float / risk fingerprint, and scoring normalises across types via
  margin and retention.

### Annual and multi-year prepay
Cash up front at a discount. **The cheapest capital in the world.**

**How it works:** Improves runway, reduces churn, lowers total revenue, creates a refund liability, and
produces deferred revenue (§6.4, §6.13). Also fixes the *payment-fee* problem: one $36 annual charge
costs $1.34 in processing (3.7%) instead of twelve monthly charges costing $4.68 (13%) — which is why
real low-end hosts push annual and three-year terms so hard. It isn't only lock-in; **it's the payment
economics.**
**Interacts with:** §6.11 customer-financed growth, §6.12 term-length matrix, §6.13 deferred revenue.

### Setup, provisioning, and one-time fees
Non-recurring revenue that fixes cash timing.

**How it works:** Installation, migration, provisioning, remote-hands, smart-hands, cross-connect
install (NRC), expedite fees, data-retrieval fees. **The lever a cash-starved operator actually pulls**
— and a conversion-rate killer if it's visible at checkout, which makes "waive the setup fee" a real
promotional dial.
**Visual:** **Setup Fee Confetti** (§6.15) — one-time fees drop as a burst that is *brighter and once*,
teaching the difference between one-time and recurring without a word.

**Variations and additions**

- **The fee catalogue, colo-flavoured.** Cross-connect and setup fees · usage overages (spike money that
  punishes underselling) · managed-service markups · **one-time "emergency support" and premium
  restoration — charging for the fire you put out**, which is uncomfortable, lucrative and entirely
  real — with **SLA credits sitting in the same ledger as negative money.**

### Overage and usage billing (metered)
Metered revenue above the plan.

**How it works:** Bandwidth overage, storage overage, request overage, GPU-hours, API calls, tokens,
egress. Scales with your customers' success, spikes with abuse, and is unpredictable **in both
directions**. Highly profitable and highly churn-inducing; the **bill-shock event** (§6.7) is its
downside. A direct money-vs-reputation trade, per incident, with three policies: bill it, warn it, or
absorb it.
**Visual:** the **Overage Meter** (§6.15) — a tank filling past a marked line, beyond which the coin
flow changes to a brighter, greedier gold. Players learn instantly which customers are profitable
overage users and which are flat-rate loss leaders.

### 95th-percentile bandwidth revenue (selling what you buy)
The billing model, applied to your customers as well as to you.

**How it works:** You are billed at the 95th percentile by your transit provider (§6.3) and you can
bill *your* customers the same way, or on flat ports, or unmetered. Selling on 95th and buying on 95th
lets you arbitrage burst patterns; selling flat while buying on 95th means you eat the variance.
**Teach it by making a player eat one bad burst.**

### Add-ons, upsells, and the attach-rate economy
Backups, monitoring, SSL, dedicated IPs, managed updates, DDoS tiers, priority support, extended log
retention, compliance reporting, managed DB, WAF, a control-panel licence.

**How it works:** Each has an **attach rate** stat you can improve, and improving attach rate is
cheaper than acquiring customers. **The single highest-ROI business action in real hosting, correctly
modelled**, and it is near-zero COGS. **Where hosting margin actually lives.**
**Visual:** the **Marketplace Shelf** (§6.15) — add-ons drawn as products on a shelf in your
storefront; attach rate is how many customers are carrying your shopping bag. The **Upsell Handshake**
— a successful upsell adds a coloured stripe to the customer card and the card grows *taller* with a
satisfying push, so growth-within-an-account looks visibly different from a new account.

### Managed services and support plans
Labour markup sold as a product.

**How it works:** You charge for *guarantees* rather than for resources — patching, monitoring,
hardening, 24×7 response. 55–70% gross margin, high touch, and it consumes the scarcest resource. A
managed line looks great on $/U and $/kW and can destroy you on revenue-per-engineer (§6.14).

### Professional services and migrations
Migrations, architecture reviews, custom builds, audits.

**How it works:** Lumpy, **60–80% margin on senior hours**, consumes senior hands (which *is* the
cost), and doesn't scale. **Trades the scarcest resource for cash** — a genuinely interesting decision
under pressure, and a trust-building product that opens managed and enterprise doors.
**Correction to the margin ranking below:** professional services belongs near the *top* on margin,
with the caveat that it cannot scale.

**Variations and additions**

- **Professional Services as Margin Theater.** Migrations, audits and custom builds are high revenue,
  low margin, **zero recurrence**, and they **steal engineering capacity from product**. Services
  revenue looks great on the scoreboard and **drags the NRR grade** — a deliberate temptation mechanic
  rather than a straightforward good.

### Premium support tiers
Paid response-time commitments.

**How it works:** Sell an SLA on *answering*, not just uptime. Cheaper to deliver than an uptime SLA
and easier to sell — and the credit exposure is bounded by a response clock rather than an outage.

### Cross-connect fees
Tiny monthly amounts, near-zero marginal cost, near-zero churn, enormous in aggregate.

**How it works:** ~$100–350 MRC plus $250–500 NRC per cross-connect, ~90–95% margin, forever. See
§6.6 for the full entry — this is the best line item in hosting.

### Remote hands / smart hands
Billed hourly, in 15-minute increments, at a rate that makes it a profit centre.

**How it works:** A margin product *and* a satisfaction driver *and* an incentive for tenants to do
things themselves badly (which generates incidents you get paid to fix, which is uncomfortable and
real). In colo-tenant levels the meter runs against *you*.
**Visual:** the **Remote Hands Clock** — a visibly ticking taxi meter. You will hurry.

### Power resale (colo)
You buy electricity at wholesale and sell it at retail.

**How it works:** Sold by **circuit** (committed amps, paid whether drawn or not — simpler, strands
capacity, and **selling committed power that isn't consumed is nearly pure profit**) or **metered**
(efficient, volatile, honest). **Choosing your billing model *is* the strategy.** See §6.3's kVA/kW
entry for the three-numbers problem that makes this a dispute generator.
**Visual:** the **Power Resale Meter** — a spinning utility dial mounted on each cage. You literally
sell the spinning of a dial.

### Space rent (colo)
Per rack, cabinet, cage, or square foot; multi-year contracts with annual escalators.

### Reserved / committed / prepaid capacity
The customer pays for a year (or three) up front at a discount.

**How it works:** Cash now, capacity locked, margin lower, churn immunity bought. Excellent when
insolvency-running. Generates a **revenue floor** and a satisfaction penalty when unused (take-or-pay,
§6.12).
**Visual:** **The Anchor** — long-term commitments drawn as an anchor chain on the customer card:
stable, heavy, hard to lose, and visibly *pinning your pricing* so you can't raise it. Commitment
drawn as weight.

**Variations and additions**

- **The ghost block.** Customers who sign 3-year commits pay **~40% less** but *reserve* capacity you
  cannot resell — a **ghost block sits on your map, idle, visibly "spoken for."** It is a yield-
  management puzzle whose failure mode is the *opposite* of idle capacity: **oversold commits during a
  lull.** Reserved is cheap-but-steady; spot is expensive-but-idle-risk. Regulators and whales love
  commits.
- **Spot / preemptible capacity, from the buy side.** Cheap rentable compute that may be reclaimed
  mid-wave without warning — **the discount is literally payment for accepting eviction risk.** The
  mirror of the sell-side Kite above, and implementable as the cheap tier of the Burst-Capacity Gates
  (§5).

### Spot / preemptible sales
Monetizes idle capacity at a discount, with the right to reclaim it.

**How it works:** Converts your safety margin into money — **which is exactly the trap the game wants
you to consider.** Most valuable in GPU and HPC lines, where idle hours are the single most expensive
idleness in the industry.
**Visual:** **The Kite** — cheap, opportunistic revenue drawn as a kite on a thin string that can be
cut at any moment.

### Domain registration and renewal
Loss-leader at signup, margin at renewal, extremely sticky.

**How it works:** 5–15% margin. **You carry domains for retention, not for margin** — the customer
with your domain, your DNS and your certificate does not leave lightly. Lock-in as a revenue strategy,
shown honestly.

### SSL, licences, and third-party resale
cPanel, Plesk, Windows SPLA, VMware, certificates, third-party SaaS, affiliate kickbacks.

**How it works:** Pass-through with markup. Small margins, near-zero cost to serve, increases switching
costs — and carries a **vendor-price-shock exposure** (§6.7). **SSL margin has largely collapsed since
free certificates**, so it belongs near the bottom of the margin ranking now, carried for retention.

### Marketplace and platform revenue
One-click apps, plugin stores, template marketplaces.

**How it works:** A 20–30% revenue share on other people's work, plus stickiness, plus a catalogue you
didn't have to build.

### Reseller and white-label programs
Other people sell for you.

**How it works:** Lower revenue per account, near-zero CAC, and the reseller owns the support burden.
**Volume without hands.** Risk: a big reseller is a concentration risk who can leave with 400 accounts
in one afternoon.

### Wholesale / peering / transit resale
Selling what you bought in bulk.

**How it works:** IP transit, dark fibre, wavelengths, rack-and-power wholesale. Thin margin, huge
volume, and it turns you into other hosting companies' upstream — the Tier 6 fantasy.
**Correction:** bandwidth resale is **not uniformly bad**. With a good peering ratio and IX presence,
blended delivery cost runs 40–60% below pure transit and retail resale is a solid margin. The honest
statement is: *bandwidth resale is thin if you buy transit and resell it, and good if you built a
network.* **That distinction is the entire reason to build a network.**

### Transit blend tiering (premium network as a SKU)
Sell "premium network" above your commodity tier, backed by actually buying better transit.

**How it works:** Makes the Blended Transit Downgrade threat into a competitive weapon as well as a
risk — the competitor who silently downgraded their blend is selling a worse product at your price,
and you can say so.

### IPv4 address leasing
Scarce addresses become a rentable asset.

**How it works:** ~$30–50/address to buy, ~$0.50–0.80/address/month to lease. **Your legacy /16 is a
literal appreciating asset** and appears on the balance sheet (§6.13). Selling it is a late-game cash
lever that forces IPv6/CGNAT and costs you a slice of visitors (§6.11).

### Data egress (the villain revenue)
Charging for traffic leaving your network.

**How it works:** Enormous margin, enormous customer resentment, and the thing that makes **data
gravity** (§6.6) a real mechanic. The game lets you price it and lets the customer notice. Waiving
egress is a competitive weapon.
**Tension:** ⚔️ The ethics dial makes high egress pricing a reputation cost; the CEO lens notes it is
also simply how the industry works. Keep both: it's profitable *and* it shows up in reviews.

**Variations and additions**

- **The egress spread: storage is cheap, transfer is expensive.** Object-hosting money lives in that
  gap — and **exfil attacks and scraper floods target exactly your cost centre**, draining money
  directly through your pipes. Wholesale transit is flat-paid while customers pay per unit served, so
  **margin = retail − wholesale − power**, and every scrubbed DDoS bit is money saved. **DDoS as cash
  damage is the best tower-defense/economy integration available in the design.**

### Retrieval and early-deletion fees (archive tiers)
Cold storage charges you for *reading* and for *deleting before minimum retention*.

**How it works:** Excellent margin, maximum resentment, and the source of the industry's worst
billing-surprise stories. **You don't sell storage, you sell getting it back** (§6.6).

### Backup / DR retainer
Customers pay for capacity they hope never to use.

**How it works:** Beautiful margins until the day everyone needs it at once — which is a correlated
event (regional disaster, ransomware campaign) and therefore a real risk, not just a revenue line.

### Demand-response and grid-services payments
The utility pays you to shed load. **Revenue from *not* using power.**

**How it works:** You agree to drop to generator (or cap draw) during grid peak events and get paid a
capacity payment plus per-event payments. You can only honour it if your workloads are interruptible —
which makes **workload mix a power-market decision.** Turns your generator from a cost centre into a
profit centre with risk. Pairs with the demand-charge ratchet (§6.3), which is the same market pointed
the other way: **you get paid to reduce peaks and punished for setting them**, so the *shape* of your
power draw, not the amount, becomes a managed resource.
**Hosting types:** owned-facility, colo, GPU/HPC (interruptible batch), crypto-mining host.

### Heat reuse
Sell your waste heat to a district-heating scheme, a greenhouse, a swimming pool.

**How it works:** Small, real, slow, and excellent for the carbon score (§6.14) and for regional
incentives (§6.7). A late-game facility unlock with a delightfully specific visual.

### Threat Intel feed
Productize the Intel your honeypots generate.

**How it works:** Converts a suffering-derived currency into an actual revenue line, and it improves
with every attack you survive — a rare mechanic where being attacked compounds positively.

### MDF and vendor co-op marketing
Hardware vendors fund your marketing.

**How it works:** Reduces effective CAC in exchange for co-branding and a purchase commitment. Free
money with a string attached, and the string is a vendor lock (§6.3 licensing).

### Referral income and overflow monetization
You send business you can't serve to a partner and take a cut.

**How it works:** **Monetize the leads you can't serve** — the customer who is too big, too small, too
regulated, or too abusive for you. Zero cost, zero risk, and it keeps a relationship warm.

### Termination and early-exit fees (ETF)
Colo and enterprise contracts; softens churn's cash impact.

**How it works:** Typically a percentage of remaining contract value. Softens the cash hit of a
departure *and* becomes a defensive clause with a deal-friction cost, *and* becomes a weapon when
pointed at a competitor's customer (§6.12's ETF Buyout).

### Asset resale and scrap recovery
Decommissioned servers and GPUs have a residual value that decays on a curve.

**How it works:** 10–20% residual at year 4. Selling the cascade output (§6.6) is real money; scrap
and e-waste recovery is small, funny, and real. Note the mirror cost: **decommissioning and e-waste
disposal is the bill at the end of the depreciation tail**, and it is a *liability* on the balance
sheet (§6.13).

**Variations and additions**

- **Hardware depreciation and resale as the second economy.** Retire racks young (used-market resale
  funds the refresh) or run them to death (entropy costs, no residual). Draw a **visible decay curve per
  rack** — **GPU resale holds its value; web boxes crater** — so the retire-or-run decision is legible
  per object rather than per fleet. This is the salvage half of the Crypto Winter.

### Sale-leaseback
Sell your building or your hardware and lease it back.

**How it works:** A one-time cash injection at the cost of permanent opex and worse unit economics
forever. **A genuinely tempting late-game trap/tool** and the classic move of a company that has
already used its other options. See §6.11.

### SLA credits (negative revenue)
You pay customers back for downtime.

**How it works:** Selling a 99.99% SLA raises price *and* raises this liability — a genuinely
strategic pricing dial. Full mechanics in §6.5 and §6.7; the accrued balance is a **liability** on the
balance sheet (§6.13).

### Referral and affiliate payouts (negative revenue)
You pay for word of mouth you didn't earn.

**How it works:** Affiliate CPA for shared hosting runs $65–150 with a 45–90 day clawback window. The
clawback is the interesting part: an affiliate cohort that churns inside 90 days costs you nothing;
one that churns on day 91 costs you the full CPA. **A revenue channel with a built-in quality test.**

**Variations and additions**

- **Commission and clawback accounting.** Sales costs hit **at close** (a cash texture of their own) and
  **reverse on early churn** — the pipeline has a memory, and the same clawback logic that disciplines
  affiliates disciplines your own sales comp.

### The whale contract
One customer who is 20%+ of revenue.

**How it works:** Transforms the P&L and the risk profile simultaneously. See Concentration Risk
(§6.8) and the whale events (§6.7).

**Variations and additions**

- **The Whale Tax.** Whales pay **50×** and their incidents apply **50× penalties** — each breach or
  exfil is scaled by the account. **Difficulty is purchased per-customer, and the opt-in is explicit:**
  *"accept enterprise contract?"* Enterprise plans additionally carry harsher SLA clauses. That is the
  price of whales, stated as a mechanic rather than a caution.

### Margin ranking (the honest hierarchy)
Not all revenue is equal, and the game should teach the ranking — **by making it playable, not
printed.**

**How it works:** Roughly, best to worst margin: **cross-connects (~90–95%, pure rent on a patch
cable)** → **professional services (60–80% on senior hours, but it cannot scale)** → **colo power and
space** → **managed services and support contracts** → **dedicated servers** → **VPS/cloud** →
**shared hosting** → **bandwidth resale if you built a network** → **domains, SSL, licences and other
resold add-ons (carried for retention, not margin)** → **bandwidth resale if you just buy transit** →
**GPU rental at spot prices** → **anything you're winning on price alone.**
**Make it playable:** show each revenue line's actual margin as a live sorted bar in the Ledger Drawer,
so the player *discovers* the hierarchy in their own P&L. **The moment a player realises their
cross-connects out-earn their servers should happen in their own data, not in a tooltip.**
**Interacts with:** §6.6, §5.6 (the cross-connect line being the best unlock in the game is *true*).

---

## 6.3 Costs

*The accounting spine: **COGS** (power, transit, licensing, hardware depreciation, colo/lease,
payment fees, and the support cost directly attributable to serving customers) · **Opex** (salaries,
marketing, tooling, insurance, legal, audit, office) · **Capex** (servers, network gear, facility
build, GPUs — which become depreciation over 36–60 months). Showing which bucket a cost lands in is
half the lesson.*

### The upkeep ledger — every build is a bill
The counterweight to every purchase decision in the game, stated as one law.

**How it works:** **Every buildable carries an upkeep line** — power, licences, salaries, bandwidth —
and the HUD shows a live **burn-vs-revenue bar** whose difference *is* your effective HP. **Idle
capacity is visible waste; over-defense is bankrupt-by-firewall.** The **upkeep curve by type** is what
makes "which hosting type" an economic *style* rather than a skin: shared ≈ near-zero upkeep on razor
margins · **GPU = a brutal hourly power burn where the money meter drains in real time** · colo = fixed,
capex-heavy facility costs · regulated = **paperwork burn** (legal salaries).
**The tension in one line:** *every beautiful defense is a money hole, and every money faucet is an
attack surface.*
**Interacts with:** §6.15's Upkeep Drip and Drain Choir (the visuals), §6.6's utilization equation,
§6.16's "upkeep as % of revenue" health band.

**Variations and additions**

- **The Cost Stack.** Transit (committed or 95th-percentile — a genuinely different optimization puzzle
  in each case) · power (per-kW, seasonal) · hardware amortization (3–4 yr depreciation beats failures)
  · staff · facilities · support tooling · insurance. **Under-provision any line and it returns later as
  a larger threat** — the maintenance-debt boomerang.
- **Overprovisioning Waste, quantified.** A visible "wasted spend" stat for *known* excess capacity,
  kept deliberately distinct from **Orphaned / Zombie Resources** (§3), which is capacity you have
  *forgotten*. The first is an optimization puzzle; the second is a threat.
- **Long-Term Storage Cost Creep.** Storage for backups and logs climbs gradually as retained volume
  grows — a slow, constant pressure distinct from any single spike event, and the general case of both
  the archival tax and the disk-eater logs.
- **The upkeep law (growth punishes).** Each buildable adds recurring cost **and each *connection*
  between buildables adds attack surface** — total surface score drives threat-wave composition.
  **Build graph = risk graph:** bigger is slower to kill and easier to hurt.
- **Upkeep is the pressure, not the purchase price.** *"Servers are cheap; power, bandwidth and staff
  are the treadmill."* A level you "win" by building a fortress you cannot pay the electricity for is
  **designed to happen**, not a bug.
- **Committed minimums, the most real line wave-1 missed.** Transit is sold commit-or-burst — *"95th of
  400M, floor 300M whether you send a bit or not."* **Under-used commits are upkeep you cannot sell;
  over-used ones are a bill-shock event.** Give every metered billable a **commit / on-demand toggle
  with true-up events**, so idle capacity gets contractual teeth. (Full mechanic: Transit commits and
  take-or-pay, below, and §6.12.)

### Hardware (capex) and the depreciation curve
Servers, drives, switches, PDUs, generators, switchgear.

**How it works:** Bought outright or financed (§6.11); depreciated **straight-line over 3–5 years**
with a 10–20% residual at year 4; **an obsolescence clock ticks on every unit** (§6.6). Buying used is
cheaper and fails sooner. Buying new is dead cash. **Buying a server is not a cost event, it's a
*schedule*** — and the game should draw the depreciation tail, because that tail is what makes a
mining crash or an AI-rate crash actually hurt.
**The trap to teach:** **depreciation vs cash.** Your P&L looks great while your bank account empties,
because depreciation is non-cash and your capex already happened. Players must learn both halves.
**Sanity anchor:** a $1,800 1U server over 48 months is **$37.50/month of pure depreciation** before
you pay for power, space, or anyone's time.
**Visual:** the **Depreciation Fade** (§6.15) — owned gear's card value visibly fades over time;
end-of-life gear is nearly transparent on the balance-sheet widget while still fully solid in the
world. **The gap between "book value" and "still working" is drawn**, which is genuinely educational.

### Capex vs opex as the payment mode of every buildable
Buy or rent, expressed as a **toggle on the purchase card** rather than a background accounting fact.

**How it works:** **Buy** = a cash cliff and no lock-in; **rent** = a flat bleed and easy autoscale.
Implemented as the *payment mode* of each major buildable, it turns a spreadsheet distinction into a
per-object decision the player makes twenty times a level. Big-ticket builds (GPU, HFT) additionally
carry a **capex amortization clock** — a visible paydown meter. **If you don't run the node hot enough
to clear amortization, buying it was a mistake**, and an idle GPU shows a small burning-cash icon:
money evaporating in plain sight.
**Interacts with:** §6.11 equipment financing, §6.15's Capex vs Opex Split Bar, §6.6 GPU volatility.

**Variations and additions**

- **The Two-Pocket Ledger.** Separate opex and capex **accounts**, not just labels: operating money
  refills each cycle (wages, power, tickets); **capital must be saved across cycles for big iron.** Rent
  drains opex; buy locks capital. **Prevents the "all-in on towers, wave one" degeneracy** that a single
  pool invites.
- **Buy = an obsolescence gamble.** Hardware ages fast (brutally so in GPU levels). Racks and building
  are capital — big up-front, depreciating, resold at a loss; rental gear is opex — never owned, always
  paid, elastic. **Same capacity, two balance sheets.** Whales and colo prefer one; startups prefer the
  other.
- **Leasing's time bomb.** Cheaper up-front (a better early-wave economy), higher long-term upkeep, and
  **lease-end forced upgrades** — a time bomb the player can *see* coming. The capex/opex lesson, made
  fun.
- **Salvage events.** Owning a depreciating asset means owning its accidents: **fire insurance pays less
  than replacement.**

### The Depreciation Play (the tax shield)
Capex isn't just cash — **it's a schedule**, and the schedule can be played.

**How it works:** Servers write down over years as a **visible declining staircase per rack**.
**End-of-fiscal-year accelerated-depreciation windows** make big buys temporarily cheaper in tax terms,
which reshapes seasonality all by itself; buying near quarter-end can earn a one-time credit. A
**"write-off audit" event** checks your books, which makes the paper trail a buildable (the accountant
as a staff tower). And the aging trade is explicit: **depreciated racks lower upkeep but worsen PUE** —
cheap, hot, and failure-prone.
**Why it belongs:** it is the one place where an accounting rule *rewards* the boring, timed decision,
and it gives the campaign's inter-level book-keeping a reason to exist.
**Interacts with:** §6.3 depreciation curve, §6.4 the Fiscal Year Spend Deadline, §6.7 the grant / tax
credit / rebate, §6.13 the balance sheet.

### Bandwidth: the 95th-percentile bill
**The most teachable cost in hosting** — and it should be *playable*, not merely explained.

**How it works:** Transit is billed at the **95th percentile of 5-minute samples** over the month — you
throw away the worst 5% of the month, roughly **36 hours**. So *short* spikes are free and *sustained*
load is expensive. This single rule makes a DDoS a **financial** attack as well as an availability one,
makes burst-tolerance a design goal, and makes the graph on the wall matter.

**The four refinements that make it sharp:**
1. **Percentile is computed per-direction and the higher of in/out is billed.** A host absorbing an
   inbound flood pays for *inbound* even though the product is outbound. **A DDoS is a direct bill
   increase**, not merely an indirect one.
2. **Commit-and-burst.** You commit to X Mbps at a discounted rate (paid regardless) and pay a
   punitive overage above it. **Under-committing and over-committing are both mistakes with different
   shapes** — it's a take-or-pay contract (§6.12) and a forecast bet with a penalty in both directions.
   Connect it to the Reserved Capacity Contract.
3. **The 36 free hours are a strategy, not a fact.** Because the top 5% of samples are discarded, the
   correct operational move is to **schedule bulk transfers — backups, replication, migrations, CDN
   pre-fills — into deliberately concentrated bursts** rather than spreading them out. Spreading load
   evenly, which *feels* responsible, is the **expensive** choice. Delicious, counterintuitive,
   completely real, and it should be discoverable rather than taught.
4. **Price deflation.** IP transit has fallen roughly 15–20%/year for two decades; it's $0.15–0.60 per
   Mbps/month at 10G+ commit in major markets. **Your bandwidth cost falls if you renegotiate and
   stays flat if you don't** — a rare positive event, and a visible win for the Procurement Desk.

**Make it playable — the three buttons:** during a flood you may **absorb** (costs 95th percentile,
keeps everyone served), **shape** (caps the bill, drops some legitimate traffic), or **divert to
scrubbing** (costs a fee, adds latency). Three buttons, three different currencies, and the correct
answer depends on how many hours are left in the month and how much of your top-5% allowance you've
already burned — **shown as a visible "free spikes remaining" counter.** That counter turns an
accounting rule into a tactical resource, and it means the same burst is free in week four and
expensive in week one.
**Interacts with:** §2.3 (a long low flood costs more than a short huge one), §6.2 (you resell it),
§6.12 (commit as a contract term), §7.6 (the traffic graph is a bill, not a diagnostic).
**Visual:** the **95th-Percentile Graph, specified** (§6.15) — a month-long strip with the top 5% of
samples visibly *lifted and greyed out*, floating above the plot as discarded confetti (**countable** —
36 hours' worth as discrete flecks), with a heavy horizontal rule at what remains, labelled with the
**dollar figure, not the Mbps**, and your commit level as a second dashed rule. **The picture says
"these spikes are free and this line is the bill."**

**Variations and additions**

- **Overage spikes turn the revenue bar temporarily *negative*.** Money as flow, not pile — the clearest
  single frame of the whole thesis.
- **The egress meter is the hidden boss of profit.** Bandwidth cost scales **super-linearly with the fat
  traffic types**, so a viral video wave can bankrupt a *winning* level: the **success disaster**, which
  is the mechanic of real hosting. Customers pay you more the more they use you, but usage is your
  scarce resource — *"you are literally selling water while defending the reservoir."*
- **The 95th percentile works BOTH ways.** Smart customers shape traffic to game *your* commits (spiky
  sync jobs at off-hours), and you can game *your transit providers'* commits the same way. **A minigame
  hiding inside a spreadsheet cell**, and a genuine "know your invoices" lesson. Meanwhile attackers and
  viral customers push sustained loads that *raise* the mark.
- **Billing bandwidth's secret language, on the sell side.** Bill at the 95th percentile of 5-minute
  samples (the biggest 5% free) and **sell "burstable" plans priced on percentile math** — so players
  *design rate plans* (committed + burst vs 95th vs flat unmetered) and then **pick customers whose
  traffic shapes fit the plan.** You are shaping the river of bytes on your own map.
- **Make the formula playable in-world.** Draw the 95th percentile as a **literal line across the
  month's usage graph** so players watch the bill cliff approach (*"you are the spike right now"*), and
  give **bill-smoothing** a tower that earns its keep by shaving the top 5% into the message-queue dam.
  A small burst-shaving pool makes the bill plummet: a buildable *and* a skill expression.
- **The beginner lesson the game must teach.** Price compute cheap and bandwidth as a forgettable line
  item, then a streamer arrives and **the transfer bill exceeds revenue.** Egress is the vampire, and
  every architecture choice — caching, origin shields, peering vs transit — is an egress-cost
  optimization puzzle wearing a latency costume.
- **Ingress/egress asymmetry.** Floods mostly cost **egress + scrub-Gbps**, which is exactly why
  mitigation is priced per-Gbps and why defense *saves money*. **Blended-cost thinking** ($/GB floors
  differ across transit, IX and cache capex) makes **CDN PoP placement a P&L puzzle**, not only a
  latency one — and commit-tier discounts at volume mean **your size is a discount**.
- **Transit vs peering arbitrage.** Upstream bandwidth is a monthly per-Mbps subscription; **peering
  unlocks (IX membership, gear, travel — expensive) cut it AND lower latency**, which is an attraction
  buff. Double-payoff buildables are rare and this is the cleanest one in the game.
- **The arbitrage minigames, and their gate.** Buy transit wholesale and resell as a CDN tier · trade
  electricity futures · play GPU spot markets. **Gate every one of these behind tier-2 (colo+) and keep
  them *optional upside*, never mandatory survival math** — they extend the metered-vs-flat dial rather
  than adding required spreadsheets anywhere near the tutorial.

### Power, PUE, and cooling
Electricity is the operating cost that never stops, and it has **two** components.

**How it works (energy):** You pay for **IT load × PUE** (Power Usage Effectiveness). PUE 2.0 means you
pay two watts for every watt of compute. Investing in cooling efficiency, containment, free cooling and
higher inlet temperatures drops PUE and drops the bill everywhere at once. **A single number that
multiplies your entire power cost is a perfect upgrade target.** Anchors: 1.1–1.25 modern
purpose-built, 1.4–1.8 retail colo, 2.0+ legacy; commercial power $0.06–0.14/kWh, so 1kW continuous ≈
$65–100/month at the meter, **times PUE**.
**The nuance that links it to occupancy:** **PUE is seasonal and load-dependent.** A facility at 30% IT
load has a much worse PUE than the same facility at 80%, because fixed cooling and distribution
overhead is amortized over less useful work. **A half-empty datacenter is inefficient by arithmetic**,
which means occupancy and PUE are the same problem — and a player's PUE number *improves when they
sell more*, which is a satisfying and real feedback loop.
**Visual:** **PUE as a Leak** (§6.15) — the proportion of the incoming power ribbon that *doesn't*
reach the racks visibly leaks sideways into cooling and losses. Improving PUE narrows the leak.

**Variations and additions**

- **Power as a real negative currency.** At datacenter scale **every GPU is a money-printer and a
  money-burner at once**, and energy prices move with level events (a grid brownout spikes them).
  Arbitrage plays follow: **electricity futures by region** (siting the datacenter *is* siting the
  cheap-power tower) and **crypto-miner spot markets when GPUs idle.**
- **The power bill as a living monster.** Electricity drains cash *continuously* — in GPU and owned-DC
  levels it is your second-biggest unit after staff. It spikes with heat events and **doubles during a
  market energy crisis**; cooling tech reduces it, which makes facilities towers feel heroic and turns
  **weather into finance**. Generators eat fuel budgets; a failed cooling tower shows up as a red number
  in the margin. ***Every monster has an electric bill.***
- **Cost anatomy, stated simply:** **every watt of compute buys roughly 0.4W of cooling** — that *is*
  the PUE stat — and cooling grows **super-linearly** with heat.
- **Cryptojackers convert YOUR power budget into THEIR coins.** A silent cost leak you must spot: the
  black-smoke-with-nothing-on-fire paranoia, made numeric.

### The Demand Charge (the 95th percentile of electricity)
**The single best unmodelled cost in the document, and it rhymes perfectly with the one that is
modelled.**

**How it works:** Commercial electricity is billed on two axes: **energy** (kWh consumed) and **demand**
(your single highest 15-minute average kW draw in the billing period, which sets a charge for the whole
month — and in many tariffs **ratchets**, setting a floor for the next eleven months). So one afternoon
of simultaneous GPU ramp can cost you money every month for a year, even though you consumed almost
nothing extra.
**Mechanically:** a peak marker on the power graph with a **ratchet line that stays**. The counters are
exactly the interesting ones: **staggered startup**, power capping, thermal/battery storage used for
peak shaving, scheduling batch work off-peak, and demand-response contracts (§6.2).
**Why it's excellent:** it makes the Synchronized GPU Ramp a *financial* event as well as an electrical
one, gives batch-vs-interactive workload mixing a hard number, and teaches a real operator cost almost
nobody outside the industry knows exists.
**Hosting types:** owned facility, colo landlord, GPU/AI, HPC/render, crypto-mining host; invisible to
a colo *tenant* (who pays a circuit charge instead — which is exactly why the tenant level and the
landlord level feel different).
**Visual:** the ratchet line is a scar on the graph that does not go away.

### kVA vs kW, power factor, and the 80% you can actually sell
Colo power billing has three different numbers and customers conflate them.

**How it works:** You sell a "20A 208V circuit" = 4,160 VA nameplate. The **continuous-load derate**
means the customer may only draw 80% = ~3,328 VA. **Power factor** (0.95 typical, worse with older or
lightly-loaded supplies) means real power is lower still. So **the number on the contract, the number
the customer can use, and the number you pay the utility for are all different**, and the gap is both a
recurring source of disputes and a source of your margin.
**Mechanically:** three readouts on the cabinet power ledger — **sold / usable / drawn** — and a dispute
event when a tenant's engineer discovers the derate for the first time.
**Interacts with:** §6.2 power resale, §6.6 stranded capacity, §6.5 oversell (power oversell is the
overcommit axis that fails *instantly and catastrophically* — a breaker, not a slowdown).

### Power purchase structures
How you buy electricity is a strategic decision, not a background rate.

**How it works:** Three options with different risk shapes — **index** (pay spot; cheapest on average,
occasionally ruinous), **fixed/hedged** (a premium for certainty; 1–5 year lock), and a **PPA** (a
long-term contract with a generator; cheapest long-run, locks you in for a decade, a liability if
prices fall). Plus **demand charges** on top of all three. **A bet: you win if prices rise, you eat it
if they fall, and your competitor who didn't hedge now undercuts you.**
**Interacts with:** green-power certification, §6.14 carbon accounting, §6.7 vendor price shock.

### Space and facility
Rent, or the mortgage if you own.

**How it works:** In colo-tenant levels you pay per cabinet or per kW; in owned-facility levels you pay
the building and resell it. Multi-year terms with **annual escalators (typically 3%)**, a security
deposit, and NRC at install. **Stranded space and stranded power are both pure loss** (§6.6).
**Visual:** the **Lease Stamp** — facility rent is a big rubber stamp on the ledger tape each month.
Bigger facility, bigger stamp, bigger noise.

### Licensing
Per-core, per-socket, per-account, per-instance.

**How it works:** Control panels, OS licences, virtualization, backup software, DBs, security tooling.
**Licence costs scale with your success and are repriced by someone else** — the purest form of margin
exposure in the game. Per-*account* licensing is the worst shape: it scales with customers rather than
revenue, **so it destroys your cheap plans first**. Anchor: $2–20/account/month depending on tier and
vendor mood.
**Interacts with:** the Control Panel regret node, §6.7 vendor renewal shock, the **true-up** below.

### The true-up
A licensing vendor's scheduled annual reconciliation.

**How it works:** You deployed more than you licensed, and the bill is retroactive plus a penalty.
**Distinct from a licensing audit** in that it is *scheduled and contractual*, not an investigation —
**you must count yourself, honestly, once a year.** The temptation to under-count is a small, quiet
ethics dial with a compounding consequence.

### Payroll and the true cost of people
The largest line item once you have a team.

**How it works:** Salary plus the **loaded multiplier of 1.25–1.4×** (benefits, taxes, tooling, space).
On-call carries a stipend. Burnout costs *more* than headcount: a burned-out engineer causes the
incident that costs a quarter's profit. **Turnover costs 6–9 months of salary in recruiting and lost
knowledge**, plus three months of ramp.
**Visual:** the **Payroll Pulse** — a biweekly red pulse across the staff roster and a chunk leaving
the treasury. Staff cost is rhythmic, unavoidable, and visible.

**Variations and additions**

- **The hidden MTTR cost.** Humans cost upkeep — but **not hiring them makes incidents last longer**,
  and MTTR is the real hidden money sink. The staffing decision is therefore never "can I afford them"
  but "can I afford the minutes."
- **Diminishing returns on NOC headcount.** More staff means faster auto-reaction *plus* payroll *plus*
  coordination overhead; a **burnout mechanic makes overwork actually slower**; fire-and-rehire is
  exploitable and morale-crushing, which is the correct shape for an exploit.
- **The anti-monoculture tax, generalised.** Repeatedly buying the same buildable type **progressively
  loses effectiveness** — the same taper as the staffing curve, applied to the whole roster, and it
  pairs with the Glass Cannon vs. Fortress axis (§5).

### Support cost-to-serve
The cost that hides inside revenue.

**How it works:** Tickets × minutes × loaded hourly rate, attributed **per customer**. The $5/month
customer who opens six tickets a month is deeply unprofitable and invisible until you unlock
cost-to-serve analytics. **The single most eye-opening number a real operator ever computes.** Anchors:
15–30 tickets/agent/day; **$4–12/ticket US, $1.50–4 offshore; $14–22 fully loaded** for a typical
ticket.
**The cost driver nobody attributes — escalation rate.** Tier-1 minutes are cheap; **a ticket that
escalates to a senior engineer costs 10–20×**, because it consumes the scarcest resource in the company
*and* interrupts deep work. So cost-to-serve should be measured in **escalation rate**, not ticket
count, and reducing escalation rate (better docs, better tooling, better Tier-2 training) is a
different and far more valuable investment than reducing ticket count. This is also the number behind
the observation that an understaffed Tier 2 destroys engineering velocity.
**Visual/UI:** the **Cost of a Ticket** readout — a running, visible fully-loaded cost-per-ticket
figure alongside **tickets per 100 accounts per month, per plan tier**. The moment the player sees
their $5 plan generates 0.4 tickets a month at $18 each, the entire shape of the business changes,
every support-deflection purchase becomes obviously worth it, and the Support Vampire stops being a
joke and becomes a line item.

**Variations and additions**

- **The support cost curve, per plan tier.** Support staff scale per N customers, and **cheap plans
  demand more staff per dollar** — *"unpaid labour hides in margins."* Cheap hosting tiers spawn
  proportionally **angrier** queues, and a **"self-serve only" plan toggle** saves cash while raising
  churn: the classic host's margin dial, made a switch.
- **Support-queue backlog interest.** Unanswered tickets **age into escalations that multiply refund
  demands** — a procrastination tax, compounding, and the cheapest possible argument for first-response
  time as a live metric.

### Customer acquisition cost (CAC)
What it costs to get one paying customer.

**How it works:** Channel spend ÷ customers acquired, per channel, with a **payback period in months**.
A channel with a 14-month payback and an 11-month average tenure is a machine for destroying cash
while looking like growth. **The most common way hosting companies kill themselves**, and the game
should let a player joyfully grow themselves to death.
**The correction that makes it honest:** **payback must be computed on gross margin, not revenue.** A
$10/month customer at 70% margin with $65 CAC pays back in **9.3 months, not 6.5**. Hosts that compute
payback on revenue systematically overestimate how healthy their channels are — precisely the subtle,
real, teachable error the game can embody by simply doing it correctly and letting the player notice.
**Rule of thumb the game should surface:** CAC payback must be under **60% of average tenure**, or the
growth is a cash bonfire.

### Transaction and payment costs
The invisible skim.

**How it works:** ~**2.9% + $0.30** per card charge (brutal on $3/month plans — the fee is **13%** of a
$3 plan and **0.6%** of a $500 plan), **1.5–2.5% interchange-plus at volume**, **$15–25 per
chargeback**, currency conversion, and fraud losses. **Makes low-priced plans structurally worse than
they look.**
**The three consequences that explain the entire low-end industry:**
1. **This is why $3 plans are sold annually** — one $36 charge costs $1.34 (3.7%) instead of twelve
   charges costing $4.68 (13%).
2. **It's why the low end pushes 3-year terms so aggressively** — it isn't only lock-in, it's the
   payment economics.
3. **It's why ACH/wire minimums exist** — moving a $500/month customer from card to ACH is a free
   1.5–2.5% margin gain, which at scale is a whole engineer's salary.
**Interacts with:** §6.5's Margin Death Zone, §6.10 processor termination, §6.13 rolling reserve.

### Abuse cost
Handling bad customers.

**How it works:** Staff time on abuse tickets, IP reputation damage, upstream complaints, legal review,
law-enforcement requests. **Some lines come with a staffing cost attached** at a predictable rate per
customer — bulletproof, free-tier, seedbox, cheap VPS. **Budget the abuse desk or the line eats you.**
Nearly zero for colo, regulated, and enterprise backup.
**Metric:** abuse tickets per 1,000 accounts is the **leading indicator of your upstream relationship**
(§6.1).

### The cost of a breach (the itemized receipt)
One successful exfiltration is not a reputation event with a number attached — it is **five bills
arriving on five different clocks.**

**How it works:** In regulated types, **per-record fines usually exceed total level income**, which
makes prevention *economically rational* rather than merely scary. But the full cost is **layered and
slow**: immediate damage · forensic hours · customer churn · an insurance premium spike · possible
fines. Budget each explicitly so that "got breached" **costs you three separate times** — incident,
recovery, reputation — and **every big failure prints an itemized receipt** rather than subtracting a
number.
**The per-incident version:** each successful breach = direct cash (extortion or theft) + SLA credits +
churn + a reputation tax. A noisy neighbour **steals the capacity you paid for**; a spam customer is
tiny revenue and a big downstream penalty.
**Interacts with:** §6.7 the lawsuit, §6.3 insurance exclusions, §6.15's Incident-Cost Receipts,
§6.9's Money Left On The Table.

### Compliance and audit cost
Annual and ongoing.

**How it works:** Audit fees, staff time, tooling, evidence collection, remediation. Pays back only via
the customer tier it unlocks — which makes it a bet on a market, not a safety purchase.

### The Tax Hydra (VAT/GST and the nexus threshold)
Sell to the world and the world's tax authorities learn your name **one country at a time.**

**How it works:** Cross a **per-jurisdiction threshold** — by customer count or by revenue — and a
**registration event fires.** File monthly in that country or **the money stops arriving** (an escrow
freeze) and a compliance-audit boss unlocks there. A **Compliance-Tax desk** tower automates filings for
an upkeep cost, and **pricing gains a new axis: absorb the tax or show it at checkout**, which directly
moves conversion. The offshore temptation — *a foreign entity! no nexus!* — is a literal dark-pattern
branch that the regulator meter hears about.
**Why it belongs:** it is the one cost line that **grows as a function of your success in geography**
rather than in volume, and it gives international expansion a price other than latency.
**Interacts with:** §6.5 pricing (tax-inclusive vs exclusive), §6.10 regulatory shutdown, §6.13
restricted cash (the escrow freeze).

### Insurance, legal, and the SLA reserve
Risk carried as an expense.

**How it works:** Cyber, E&O, property, business-interruption; a retainer or in-house counsel; and a
**reserve against future SLA credits** that you should fund and probably won't (the accrual is a
balance-sheet liability, §6.13).
**Premiums as a scorecard:** cyber premiums and deductibles are quoted from a **questionnaire about
your controls** — MFA coverage, backup testing, segmentation, patch lag, incident-response plan. The
quote is a free, honest, external assessment of your security posture delivered annually, and improving
it is directly worth money. **An audit you're paid to pass.**
**The exclusion that bites:** cyber policies commonly exclude acts attributed to a **nation-state**,
and attribution is made by someone else after the fact. You had insurance; the claim is denied on an
attribution you cannot contest. The game should let the player **read the exclusions** if they bother
(a clickable document) and should absolutely punish the player who didn't. Pairs with the "doesn't
cover you if MFA wasn't enforced" exclusion.

**Variations and additions**

- **Insurance as a tower you build, not a line you pay.** Premiums convert a catastrophe — fire,
  subpoena, breach — into **a payout plus an inconvenience** instead of an instant fail: a purchasable
  difficulty softener that **inverts if you file too many claims** (fraud audit!). Late-game legal
  shields extend the same logic.
- **The underwriter's ledger.** **Premium = base × your risk behaviours** — unpatched count, no-UPS
  racks, ignored tickets, tarpitted loops. **The game underwrites your playstyle:** premiums rise with
  your risk build, claims raise next level's premium, and **the deductible meter becomes a visible
  difficulty dial.** Every policy carries a **retention you eat first**; **force-majeure exclusions**
  mean some scripted disasters pay nothing (the hurricane pays; your own unpatched server doesn't); a
  **no-claims discount** closes the loop as a money-repair mechanic; and **cyber liability vs E&O vs
  D&O** cover visibly different scripted events.
- **Dramatic extensions.** Buy **low or high deductibles per event class.** Late levels let you become
  **the underwriter of a rival** — capitalism as a tower. Being insured at all **costs you the
  "self-made" score modifier.** A per-run purchase can cover **exactly one catastrophe** (fire, seizure
  fine, ransomware payout) with a **moral-hazard rider**: the insurer demands you pass the audit *even
  while insured.*
- **Downtime Insurance as dark comedy.** A real outage **pays out** — so *do you want the outage?* The
  game quietly lets you test your ethics against your wallet, and says nothing about the result.

### Support contracts and warranties
Per-device, per-year, with tiers.

**How it works:** Next-business-day / 4-hour / 24×7×4 with a parts locker on site, priced accordingly,
and a **cliff at year 4** where vendors price you toward a refresh. The spare-parts inventory is the
self-insurance alternative — **make them a real either/or with numbers**, because the correct answer
flips with fleet size, site remoteness, and how many identical units you run.

### The RMA pipeline
Failed hardware is not gone, it is **in a state**.

**How it works:** A returned part moves through: fault confirmed → RMA raised → **advance replacement**
shipped (if your contract includes it) or **return-first** (if not, you are *down* until it arrives) →
replacement arrives, sometimes refurbished → **the refurb fails again at ~2× base rate** → the original
must be returned within 10 days or you are billed for it. **Cash, capacity and attention all sitting in
a logistics queue**, and forgetting to return a part is a real and very funny recurring cost.
**Interacts with:** §6.4 working capital in hardware, §6.1 lead time, MTTR.

### The Truck Roll
Any physical action has a cost and a delay.

**How it works:** A site visit, a hands-on reboot, a part swap. In remote-colo and edge levels this
dominates the cost structure, and it is the reason out-of-band management, smart PDUs and a local
remote-hands contract pay for themselves.

### Circuit contract liabilities (NRC, MRC, term, ETL)
Circuits and cross-connects carry an install charge, a monthly charge, a term, and an early-termination
liability.

**How it works:** NRC at install, MRC monthly, a **term of 12/24/36 months**, and an **early
termination liability equal to the remaining term**. Cancelling a 36-month circuit in month 4 costs you
32 months of payments. This makes The Landlord Renewal and The Data Center Move scenarios much sharper:
**moving isn't logistics, it's a stack of contracts with different end dates that never line up.** A
real operator's spreadsheet of "when can we actually leave" is a genuinely good puzzle object.
**Interacts with:** §6.12 contract as a tower, §6.14 dual-run cost.

### Egress to your own DR site
An expense nobody budgets.

**How it works:** Continuous replication to a second site is continuous **egress** — and if the second
site is at a cloud provider, you are paying *their* egress rates for your own insurance. Makes DR
architecture a cost-shaped decision rather than a purely technical one, and makes "replicate to a
cheaper provider" a real and slightly grubby optimization.

### Transit commits and take-or-pay
You pay the commit whether you use it or not.

**How it works:** Transit commits, power commits, marketplace minimums, hardware purchase commitments.
**A commit you outgrow is free money** (you got the volume discount and used it); **a commit you
undershoot is a monthly tax on your own optimism.** Sits in the "committed out" cash bucket (§6.13).

### Double-running during migration
Paying for old and new simultaneously. See §6.14's dual-run cost — it's the reason customers don't
leave, and the reason your own migrations hurt.

### Marketing spend (as a cost with a lag)
Money in, customers... maybe out. Full event treatment in §6.7.

### Bad debt, chargebacks, and fraud loss
Money you will never get.

**How it works:** A percentage of billed revenue that never collects. Real bands: **consumer/low-end
shared 2–4%; VPS 1–3%; SMB dedicated 1–2%; enterprise <0.5%; colo <0.5%** (deposits + termination
rights); **bulletproof ~0** (prepaid only — which is *why* it's prepaid). **Bad debt rate is a direct
function of your customer mix and your credit policy**, and it's the cost the cheap-and-fast strategies
hide. Full mechanics in §6.13.

### Decommissioning and e-waste disposal
The bill at the end of the depreciation tail.

**How it works:** Certified destruction, recycling fees, data-sanitization evidence for the regulated
lines. It is also a **balance-sheet liability** accrued over the asset's life (§6.13), which is the
version that actually teaches something.

### Interest and debt service
If you financed the build, the payment arrives forever.

**How it works:** Principal repayment is a *cash* outflow that is **not** a P&L expense — another
cash-vs-profit divergence the Gap Bar (§6.15) should name explicitly.

### Toil (the staff-hour cost of every shortcut)
A *staff-hour* currency drained by every unautomated recurring task.

**How it works:** Every manual process consumes hands forever. Tracked as a **toil ratio** (% of staff
time on manual repetitive work) — **the number that justifies every automation purchase** — and shown
at level end next to the automation you could have bought.

### Technical debt interest
**Debt as a visible monthly line item, with a stated rate and a paydown action.**

**How it works:** Every deferred upgrade, undocumented system and manual process adds a small permanent
monthly cost — more hands consumed by toil, higher incident probability, slower changes. It shows up on
the P&L as a line called **"Technical Debt Service"** and it grows. **Making the metaphor literally a
line on a financial statement is the best version of this idea in the document** — and the Ledger
Drawer must print it **in the same typeface as everything else**, which is what makes the joke land.
**The missing half — a priced paydown.** Debt accrues at `0.8% of estate value per month per debt
point`; a Paydown project costs `3 months of that debt's interest` to remove a point. **Then debt is a
loan with a stated rate and paying it down is a calculable investment rather than a virtue.**
**Visual:** the **Technical Debt Ledger** — deferred maintenance drawn as literal IOU slips pinned to
the affected objects. They accumulate, each raises that object's failure probability, and paying down
removes slips with a satisfying tear-off.
**Interacts with:** §7.7 debt meter, every "quick fix" build, §6.9 Rebuildability Index.

**Variations and additions**

- **The sticky-note visual.** Cheap racks accumulate **physical sticky notes**; at five notes the
  object's random-failure odds double. **The notes ARE the countdown** — no meter required. Old builds
  also accrue **"legacy" cobweb tags**: they still run, but each un-refactored year spawns patch-failure
  gremlins and slows new unlocks.
- **The hidden-debt variant.** Every shortcut — auto-update without canaries, skipped drills,
  overselling, single-region — raises a meter that **amplifies future disaster severity** and is visible
  only in the detailed view, so **scoring rewards honest ops** rather than tidy-looking ops.
- **The fourth hidden star: the debt you left behind.** Grade each level's **end-state** tech debt, doc
  completeness and backup freshness, visible only through audit and premortem tools. **A level can be
  3★ with a landmine inside**, and the *next* level's opening drift-diff then reads like a horror novel:
  the progression of the *save file* becomes the real scoreboard.
- **Give debt a P&L face.** It should manifest as **rising cost-to-serve** (tickets per customer, MTTR)
  and **falling change velocity**, so the refactoring spend has a **computable payback**. Pair it with
  the external debt bomb of **platform licence repricing**, which hits debt-laden cheap stacks hardest
  (§2's shared-hosting margin fix, where the 2019 repricing wave emerges from the economy rather than
  from an event table). **Debt should not be ambient bad luck; it should be invoice-shaped.**

### Churn (the cost that isn't a cost)
Lost MRR is the most expensive line and appears nowhere in the expense list.

**How it works:** The game should show a **negative revenue** figure — "MRR lost this month" — right
next to expenses, because that's how it actually feels. Broken down by **voluntary vs involuntary**
(§6.4) and by **logo vs revenue** (§6.8).

**Variations and additions**

- **The Churn Cost Ledger (the COGS of leaving).** Every churn **itemizes**: unrecovered CAC + the
  migration effort you already did + sunk provisioning + support hours + the reputation externality. It
  makes churn *feel* like taking a hit rather than a subtraction, and it feeds the ROI calculation for
  every anti-churn buildable (health scores, a CS team, the knowledge base).
- **The visual half.** Every departed customer pays a small one-time refund and leaves a **negative-
  revenue ghost** on the board: churn is expensive twice, and both times you can see it.

### The trap list (costs that look like nothing and eat you)
A named set, because the shape is the lesson.

**How it works:** **Transit commit** (pay for air) · **power commit** (same, for years) · **per-account
licensing** (scales with customers, not revenue) · **payment processing** (a ~3% haircut people forget
when pricing a $3 plan) · **support cost per ticket** (the number that decides whether cheap hosting
works at all) · **CAC payback exceeding tenure** · **depreciation vs cash** · **stranded capacity**
(space you can't power, power you can't cool, cooling you can't sell) · **double-running during
migration** · **idle GPU-hours** (the most expensive idleness in the industry) · **the letter of credit
or security deposit** (cash locked for the term, invisible on the P&L, directly attacking runway —
**a brutally real early-stage constraint that also explains why small hosts under-buy redundancy**).

**Variations and additions**

- **Cost-failure asymmetry by scale.** A small operator survives a single-node loss; **a big operator
  dies of a cascade of tiny opex leaks.** The late-game boss is not an attacker — it is **"the unknown
  shadow-IT line item,"** and the trap list above is the bestiary it recruits from.

---

## 6.4 Cash-flow mechanics

*The part most tycoon games skip and shouldn't. **Most hosting companies that die, die of cash flow,
not of unprofitability.** The classic killer: you buy $200k of hardware today to serve a customer who
pays $8k/month starting in 90 days.*

### Cash vs Profit (the two ledgers)
The central financial mechanic.

**How it works:** Two separate readouts that disagree. You can be profitable and insolvent, or
cash-rich and losing money. **Growth consumes cash**: you buy the server in month 0, the customer pays
in month 1, the card clears in month 2, and payroll is on the 15th of every month regardless.
**Make the gap causal, not merely displayed.** On the cash meter, show a small breakdown of *why* cash
differs from profit this month: hardware bought (capex, not expense), receivables outstanding, deferred
revenue recognised, debt principal repaid, inventory purchased. **The player should be able to point at
the gap and name it** — that is the entire lesson.
**Add the waterfall.** A monthly **cash-flow waterfall**: money in → money committed → money actually
available. The gap between "profitable" and "solvent" becomes one picture, and it is the picture that
explains why the whale contract (§6.7) is a crisis.
**Visual — the Gap Bar (the resolution of the "two meters" proposal):** one shared vertical scale with
**two markers** — a filled bar for Cash and a hollow outline for Profit — and **the space between them
rendered as a hatched zone with a number in it.** Growing widens the hatch; the hatch is the thing you
watch. When Profit is above Cash the hatch is amber and labelled `UNCOLLECTED`; when Cash is above
Profit it's grey and labelled `DEFERRED`. **One widget teaches the whole lesson**, and it is better
than two widgets sitting next to each other hoping the player compares them.
**Tension:** ⚔️ The visual lens also proposes a **Two-Pan Scale** (a physical balance, revenue on one
pan, costs on the other, tilting live). It is lovely for streams and glances and terrible for
precision. Merged position: **pick the column/Gap Bar for the HUD** and demote the scale to an optional
Ledger Drawer widget — two money metaphors in the same corner of the screen is one too many.

**Variations and additions**

- **The layer, stated plainly.** Payables **NOW** (power bills don't wait) · receivables **LATER**
  (net-60 enterprise) · **prepaid liability already spent.** A cash meter that can go negative with a
  green P&L triggers financing, vendor renegotiation, or the death spiral — and **scoring on free cash
  flow** quietly teaches the hardest lesson in the document.
- **The two spirals.** **Late-bill/churn:** bad service → churn → less income → less to spend on service.
  **Over-provision:** fear of downtime → buy too much → **die of costs while every light is green.** Two
  loops, opposite causes, same ending.
- **The whole game as capital allocation.** Hold cash (survive spikes, buy opportunistically) vs. grow
  (a higher revenue ceiling, higher upkeep exposure) — *"a capital-allocation game wearing tower-defense
  skin."*

### Net-30 / 60 / 90 — and why net-60 is really net-75
Enterprise customers pay late by contract, and later than that in practice.

**How it works:** The big logo you celebrated pays in 60 days. Winning enterprise business is a
**cash-flow attack on yourself.** Modelled as invoices sitting in an aging bucket (§6.13). And the
clock often starts **when they process your invoice, not when you send it** — enterprise AP runs on
check and payment batches.
**The levers, which should be visible next to the meter:** invoice immediately rather than at month
end; **get the PO number before invoicing** (a missing PO is an automatic 30-day delay); offer **2/10
net 30** (2% discount for payment within 10 days — expensive, real, and sometimes correct); and track
**DSO** as the metric. **DSO already sits in §6.8's cash block — connect the two so the player can see
the lever and the meter together.**

### Deferred revenue
Annual prepay is cash you've received but haven't earned.

**How it works:** It lands in the bank immediately (great) and recognizes 1/12 per month (sobering). If
you spend it and then have to refund, you're short. **Unlocked as a concept by the first annual prepay,
and the reveal is genuinely unsettling — correctly.** The classic startup sin is spending it; **the
game should let you and then punish you.** It is also a *liability* on the balance sheet and comes off
the price in a working-capital adjustment when you sell (§6.13, §6.9).

**Variations and additions**

- **The Float Trap.** Prepaid annual plans give huge early cash *and* a service liability. **Price below
  cost to win them and you enter a "you're running a Ponzi of bandwidth" failure state** — unit
  economics taught by tempting the player to cheat them. The metered truth: **cash today, liability
  every day after.** The HUD marks **sealed coins**; float spent on capex **claws back at churn**; and
  when the service year ends with the renewal cash already gone, you meet the real bill.
- **The Cash-vs-Earned HUD toggle** is the operator's single most essential sightline.
- **The tempting positive.** Prepaid float **earns a trickle of interest**, which is a genuine reason to
  chase teaser prepay — and therefore a genuine trap.

### Annual prepay discount
Trade margin for cash.

**How it works:** Offer 2 months free for annual payment (≈15% discount). Fixes cash today, reduces MRR
flexibility, locks in the price, reduces churn, and cuts payment fees by ~9 points of revenue on small
plans. **A clean, meaningful, repeatable decision** — and, properly understood, a **financing
instrument** (§6.11).

### The refund window and the money-back guarantee
A marketing feature with a balance-sheet cost.

**How it works:** A 30-day guarantee raises conversion and raises refund exposure; a 90-day one raises
both further. A tunable dial with two opposite effects — **the cleanest risk/reward slider in §6.**

**Variations and additions**

- **The Refund-Policy Dial.** A storefront setting running from **"no refunds, ever"** to **"any time,
  no reason."** Generosity **directly feeds attraction** — the fear-of-commitment tax on new customers
  drops, so conversion rises — and **directly feeds fraud**: chargeback artists spawn closer and *test*
  you. The midpoint is real policy craft (30-day windows, SLA-breach triggers only) implemented as a
  **logic mini-editor whose rules literally govern which chargebacks you can defend.** And your dial's
  public text **shows up quoted in review-comets**, so the policy is a piece of marketing copy as well
  as a liability.

### Involuntary churn and dunning
Customers leave because their card expired, not because they were unhappy.

**How it works:** **20–40% of gross churn is involuntary**, and payment failure runs **5–9% per month
on active card subscriptions**. **Dunning** — a retry schedule plus emails — recovers 30–50% of it.
Card-updater services recover more. **The highest-ROI, least-glamorous business build in the game.**
**The pipeline, with a rate and a cost per stage:** failed → retry → reminder → warning → **suspend**
→ terminate. Each stage has a recovery rate and a churn/PR cost, and the **Suspension Policy Dial**
(day 3 / day 10 / day 30) trades cash against reputation: aggressive suspension means better cash and
worse reviews, and **suspending a customer who owes you money guarantees non-payment but stops the
bleeding.**
**Visual:** the **Dunning Ladder** (§6.15) — late invoices climb a visible ladder of escalation, with
the customer's window going dark at suspension and the card burning at termination. Watching a customer
climb the ladder gives you time to intervene. Paired with the **Invoice Bird**: invoices fly out and
return as a gold coin (paid), a grey envelope (late), or a red RETURN stamp (failed card). **Your AR
aging is a flock you can see.**

**Variations and additions**

- **The retry choreography, spelled out.** Card fails at renewal → retries on **days 1 / 3 / 5 / 7** →
  grace → suspension → archival. Recovery is free and the win is small and satisfying — *the most
  realistic hidden economy mechanic in the game*, and a natural free unlock from billing level 2 that
  **rewards operational hygiene rather than spending.**
- **The archival tax.** Suspended accounts **still eat disk forever** — "zombie accounts" become a
  slow-growing graveyard lot on your map whose tiles never delete without a **data-deletion policy**
  tower.
- **Dunning cascades through resellers.** One bad month at your biggest reseller's *bank* reaches you
  through **their** dunning, not yours.
- **The visual counterpart.** Failed billing turns into **literal flies buzzing out of the vault** — a
  pest class that hints at its own cure (the payment-failure dunning turret). See §6.15.

### The invoice calendar
Money arrives in a rhythm, not a stream.

**How it works:** Billing runs on the 1st; cards decline over days 1–4; dunning recovers over days
5–20; payroll is the 15th and the last day; transit and power bills land mid-month. **Play the
calendar.** A visible month strip makes cash a timing puzzle, not a number.
**The collision that makes it a puzzle:** **your money arrives on a distribution and leaves on a
deadline.** Payroll is exact. Card settlement is 2–3 days after capture. Enterprise AR is a 30-to-90-day
smear. So a month where dunning underperforms by 4% can **miss payroll while the P&L looks fine.**
That's the single clearest demonstration of the cash-vs-profit thesis, and it should be an **authored
scenario beat**, not just a background rhythm.
**Visual:** the **Invoice Calendar Strip** (§6.15) — 31 cells along the bottom of the ledger drawer
(collapsed in the HUD), with icons on the days that matter: a printer on the 1st, small declining-card
glyphs on 1–4, envelope glyphs on 5–20, a payroll stamp on the 15th and the last, a transit invoice
mid-month. Today is a lit cell. **Cash becomes a timing puzzle you can see the shape of.**

**Variations and additions**

- **Billing-cycle day vs payroll day** is the atom of the whole subsection: two dates, one bank account.
- **The annual-plan sales push** gives you December cash **and a next-December churn wall** — a lever
  whose cost arrives exactly twelve months later, which is the cleanest long-lag teaching object
  available.
- **Enterprise net-30/60 terms make big customers cash-flow-toxic until you factor them**, which turns
  "receivables financing" into a **buildable with a fee** rather than a menu item (§6.11).

### The Payroll Clock
A recurring hard deadline with a non-monetary penalty.

**How it works:** Missing payroll costs **staff**, not just money — morale collapse, immediate
resignations, and a permanent hiring-cost premium. It is the one deadline the game should never let
slide quietly.

### Seasonality
Predictable annual swings.

**How it works:** Black Friday (retail hosting), back-to-school (education), tax season (finance),
fiscal-year-end (government), holiday and summer game-server surges, Q4 e-commerce. Forecastable if
you have history — **which makes history worth keeping.**
**Cash seasonality is separate from demand seasonality:** annual renewals cluster, producing a January
cash bulge and a June drought regardless of what traffic is doing.

**Variations and additions**

- **Macro events as background economy weather.** Q4 retail spike · **January budget flush** · industry
  hype waves (the AI gold rush) · a **recession** (support requests up, new deals down, price
  sensitivity up).
- **Random-but-*known* event economics.** FX swings · a cloud provider's competitor price cut · a viral
  tweet · an **industry-wide** datacenter fire · a chip shortage · the "AI winter." Each moves demand
  and costs in **type-specific** ways, which makes **the player's revenue mix their hedge** — the
  cleanest argument in the game for running more than one line.

### Capex lead time
Money out long before money in.

**How it works:** Order → deposit → 8-week lead → delivery → install → burn-in → revenue. The deposit
is cash today against revenue a quarter away, and **expediting costs money and only sometimes works**
(§6.1's lead-time currency).
**Visual:** **Shipping & Lead Time** — ordered gear crosses the region map as a truck or plane icon
with an ETA; expedited shipping is a visibly faster, gold-tinted vehicle.

### The Fiscal Year Spend Deadline
Approved capex **evaporates** if it is unspent at year end.

**How it works:** An endgame scramble to pre-buy hardware — **and to absorb its upkeep** — before the
budget line disappears. Every admin knows the December procurement panic, and it is the one cash event
where **spending badly beats not spending at all**, which is exactly the wrong lesson learned the right
way.
**Interacts with:** §6.3's Depreciation Play (the accelerated-depreciation window lands on the same
date), §6.4 seasonality, §6.13 committed-out.

### Working capital in hardware
Inventory is money on a shelf.

**How it works:** Spare parts reduce MTTR and tie up cash. Just-in-time is cheaper and slower. **A real
tradeoff with a real failure mode** — the drive you didn't stock, on a Saturday. Interacts with the RMA
pipeline (§6.3): a part in an RMA queue is neither cash nor capacity.

### Vendor terms (AP as a lever)
Negotiating NET-60 with your hardware supplier is a legitimate, unglamorous power move that saves a
level. See §6.13 for the full mechanic, including the point at which it becomes a trap.

### Deposits and prepay requirements
Demand prepayment from risky customers.

**How it works:** Fewer signups, less bad debt, better cash. The credit-policy dial that turns bad debt
from a fact into a choice. Bulletproof lines are prepaid-only **because** their bad-debt rate would
otherwise be catastrophic — which is a lovely piece of reverse-engineered realism.

### The credit line
Revolving debt as a shock absorber.

**How it works:** Draw to cover a gap, pay interest (8–14% APR on drawn), restore later. **Using it is
not failure; being unable to stop using it is.** The game tracks utilization and flags the death-spiral
pattern. Carries **covenants** (minimum EBITDA, maximum leverage, sometimes minimum uptime) whose
breach is its own lose condition (§6.10).

### Multi-currency FX
You bill the world; the world pays in liras, yen, euros and satoshis.

**How it works:** Revenue arrives in **named currencies on a live ticker**, and a bad swing between
*invoice issued* and *paid* **burns real cash** — which turns the slow-paying whale into a currency bet
you didn't know you placed. **Hedging is a late-game office buildable** (rate-frozen contracts: cost
certainty traded against upside). Costs are exposed the other way: **revenue in USD, GPUs in TWD, colo
in EUR.**
**The dark variant:** a **hyperinflation event** can turn a beloved bulk-prepay customer into a
laundering/arbitrage **threat** — they buy years of hosting in a collapsing currency, and **the money
arrives after it is worthless.**
**Interacts with:** §6.4 deferred revenue, §6.1 Heat, §6.13 restricted cash.

### Crypto rails (the fast-money faucet)
Accept coins: **instant settlement, no chargebacks, no processor haircut, global** — and every payment
arrives with an anonymity-loss lottery ticket attached.

**How it works:** You price the processor's cut against crypto volatility, and you choose what happens
on arrival: **auto-sell, hold, or "HODL infrastructure."** Regulated levels forbid the rail or audit it
brutally. A **sanctioned-wallet hit turns an invoice into seizure evidence**, which makes the blockchain
analyst a buildable — your payment-processor-in-law. The offshore act completes the loop: **pay your
suppliers in coin**, and the Heat mechanic (§6.1) returns as *inbound* money.
**Interacts with:** §6.3 transaction costs (the rail that has none), §6.10 debanked, §6.13 the rolling
reserve (which crypto has no equivalent of — for better and worse).

### Runway
Months of survival at current burn.

**How it works:** The single most important number on the HUD when it's low, and correctly invisible
when it's high. **Under 3 months, the UI changes tone.** Promoted to the primary health bar per §6.1.
**Visual — the Runway Tone Shift, specified** (§6.15), because without an exact spec five systems will
each invent their own panic state. Three stages, applied to **chrome only** — never to the world, never
to the alert colours. **>6 months:** normal. **3–6 months:** HUD chrome desaturates ~30%, the money
column's frame gains a thin amber rule, non-essential HUD elements auto-hide. **<3 months:** chrome
goes colder grey, the runway number is promoted to the top bar at double size with a weeks-remaining
subline, the build catalogue's expensive entries dim, and the Drain Choir's streams visibly widen.
**Nothing flashes, nothing pops. It just gets quieter and colder, which is what being nearly broke
actually feels like.**

### The working-capital squeeze (you can lose by winning)
Growth consumes cash, and fast growth is the most dangerous state in the game.

**How it works:** Fast growth on monthly billing with up-front hardware purchases is the specific
configuration that kills companies. The game should make this a *recognisable state* with its own HUD
warning and its own lose condition name (§6.10's Growth Death), rather than a generic slide toward
zero.

### The cash conversion cycle
One derived number worth showing, per line.

**How it works:** Days from spending cash on capacity to collecting cash from the customer using it.
**Prepaid shared hosting is negative** (the customer funds you — the best business model in hosting).
**Enterprise dedicated on net-60 with hardware bought up front is +120 days.** **Colo with a fit-out
allowance is +18 months.** **Showing this number per line explains, in one figure, why some hosting
businesses grow effortlessly and others need financing to grow at all.** It belongs as a fifth dial on
the score screen (§6.9).

### Capital injection events
Angel, VC, private equity, a bank loan, or bootstrapping.

**How it works:** Each **changes the win condition**: VC demands growth, PE demands margin, a bank
demands covenants, bootstrapping demands patience. Full instrument list in §6.11.

---

## 6.5 Pricing as a mechanic

### The price slider (difficulty as a dial the player sets)
One slider that reshapes the entire level.

**How it works:** Raise price → fewer customers, higher margin, higher expectations, more demanding
support, easier infrastructure. Lower price → flood of customers, thin margin, abuse, support load,
harder infrastructure. **The player chooses their own difficulty by choosing their business model, and
the game never has to label it "hard."** Set per product line, with a live elasticity readout.
**Add hysteresis — the asymmetry is the point.** Raising prices churns *existing* customers and lowers
spawn rate; lowering does the reverse and is **hard to undo** (you have re-anchored the market's
expectation and attracted a cohort that came for the price). **Model the asymmetry explicitly** — it is
the reason real operators agonize, and it makes the decision weighty rather than a dial you sweep.
**Tension:** ⚔️ Competing with "Difficulty as SLA" (choose 99.9 vs 99.99) for the same UI slot. Both
are good; shipping both risks a confusing double-dial. The merged position from the game-design lens
is that the **contract** (SLA + term + liability, §6.12) is the difficulty selector and the price
slider is the business-model selector — they are different axes and can coexist if labelled that way.
**Visual:** the **Price Dial + Demand Ghost** (§6.15) — a physical dial, and as you turn it a **ghost
preview** of the resulting visitor stream renders live next to the real one, thinner and richer as you
raise price, fatter and poorer as you lower it. **You see elasticity before you commit.**

**Variations and additions**

- **The pricing screen IS a tower-placement screen.** Turning the dial **reshapes the incoming wave
  composition** — direct, readable control over both flows at once. It is the balance slider the player
  rides all level, not a menu they set once.
- **Per-segment texture.** High price = fewer arrivals, **richer conversions, and more entitled churn**.
  The *optimal* price moves with your reputation and with competitor pricing, so a race to the bottom is
  literally **the demand curve shifting left on you.** Underprice and you get a flood of low-quality
  demand plus abuse customers; overprice and you get only demanding customers with brutal SLAs.
- **Price moves the segment *mix*, not just the volume.** Too cheap **repels enterprise** (*"they'll be
  gone in a year"*) and attracts fraud-heavy traffic. Willingness-to-pay **anchors to rival signage**,
  so put competitor storefronts in world-space. Good/Better/Best with a **decoy anchor** is how the real
  industry extracts ARPU — which argues for a **2–3 slider console: price, term, included support
  tier**, rather than one dial.
- **Per-archetype sensitivity.** The Hobbyist bounces at **+$10**; the Whale ignores it entirely **and
  expects perfection.**
- **The premium-brand flip.** Raising price improves margin **and per-customer patience** — which makes
  "go upmarket" a genuine counter during competitor hit-job levels, not just a slower way to lose share.
- **Elasticity varies by hosting type:** regulated is inelastic, shared is ultra-elastic.

### The Margin Death Zone
A visible band on the pricing screen below which **more customers make you less money**.

**How it works:** Below a certain price point, transaction fees (fixed per charge), support cost (per
account) and abuse rate (per account) exceed contribution. The game **draws the band** and lets you
price into it. Indicatively: at $3/month with a 2.9% + $0.30 fee, **13% of revenue is gone before you
serve a byte**, and 0.35 tickets/account/month at $18/ticket puts you underwater at any support quality
above "none."
**Why:** it makes the race to the bottom a **visible cliff rather than a moral**, and it gives the
player a genuine reason to raise prices — the hardest real decision in the business, which currently
has no in-game pressure toward it.
**Interacts with:** §6.3 transaction costs, §6.5 race to the bottom, §2.10 price war.

### The Pricing Floor Calculator
An unlockable tool that draws a **red line on the price slider**.

**How it works:** Computes true cost-to-serve per plan — hardware amortisation, power, bandwidth at
your blended rate, support minutes, payment fees, abuse allowance, and a share of fixed costs. Players
will discover their **most popular plan is below the line.** **The single most eye-opening moment the
economy can deliver**, and it is a UI element rather than a system.
**Interacts with:** the Unit Economics Card (§6.12), §6.3 cost-to-serve, §6.9 contribution margin.

### The Unit Economics Card
Every customer type shows revenue, cost-to-serve, and support load on one card.

**How it works:** Per plan and per archetype: price, cost-to-serve, gross margin, tickets/month,
abuse propensity, average tenure, CAC by channel, payback months, LTV, LTV:CAC. The player discovers
that **their most popular plan loses money.** *That discovery moment is worth a whole level.* The game
should let you build a plan with a 14-month payback and an 11-month tenure and **not warn you** — then
show it in the postmortem as the reason you ran out of cash while growing.

**Variations and additions**

- **The per-customer gross-margin x-ray (the Cost-to-Serve meter).** Hover any account and read
  **MRR − (capacity + share of transit + tickets × cost-per-ticket + support tier)**. Some "good
  customers" **glow red: margin-negative whales.** Operators live and die by exactly this spreadsheet,
  and the game's depth is simply letting players *see* it.
- **The Gross-Margin-per-SKU Inspector.** Click any product to open its **BOM** — hardware depreciation
  + power + bandwidth + licences + allocated support minutes. It unlocks price-floor intuition directly:
  **$0.99 shared hosting *with phone support* is mathematically a loss.** Players who guess prices get
  corrected; players who inspect get rich.

### The oversell ratio
The defining shared-hosting decision, generalized to every hosting type.

**How it works:** A slider from 1:1 to 30:1. Higher oversell = more revenue per box, thinner headroom,
and catastrophic correlated failure when several tenants get busy at once. Every hosting type has its
own version: VPS CPU overcommit, colo power oversubscription, bandwidth contention ratio, GPU
time-slicing, backup storage dedupe assumptions. **One slider, every hosting type, instantly
understandable, always a gamble.** Should be movable **mid-level**, with consequences that appear
hours later.

**Honest detents (so the slider has real positions):**

| Axis | Safe | Aggressive | Reckless |
|---|---|---|---|
| Shared disk/CPU | 5:1 | 12:1 | 20–30:1 |
| VPS RAM | 1:1 | 1.2:1 | 1.5:1 (RAM is the dangerous one) |
| VPS CPU | 4:1 | 10:1 | 16:1 |
| Colo power (diversity factor) | 1.2:1 | 1.4:1 | 1.6:1 |
| Bandwidth contention | 5:1 | 20:1 | 50:1 |
| GPU inference time-slice | 1:1 | 3:1 | 6:1 |
| GPU training | 1:1 — **you cannot oversell a training job** | — | — |

**[DEGENERATE] — the fix that saves the mechanic.** As a single slider with a smooth downside, the
optimal play converges on "push until complaints start, back off one notch, done." Make the optimum
**uncertain and moving**: the failure is not smooth, it is **correlated**. The risk is that several
tenants peak *simultaneously*, and that probability rises super-linearly with the ratio **and with
tenant homogeneity**. Concretely: `P(contention event per wave) = (ratio/10)^2.2 × homogeneity`.
**A rack of 200 identical WordPress sites is far more dangerous at 8:1 than a mixed rack at 12:1.** Now
the decision involves *who you packed together*, not just how many — which is a much better decision
and is also true. At 5:1 with uncorrelated tenants, complaints are negligible; at 5:1 with correlated
tenants (all e-commerce, all one timezone) you are already in trouble.
**And the cliff:** above a threshold, contention does not degrade gracefully — it produces a correlated
failure where everyone is slow at once and the support queue takes the whole team out. **The slider is
smooth until it isn't.**

**Oversell has a different failure *shape* per resource** — the single cheapest source of depth here:
- **CPU overcommit** degrades gracefully (everyone gets slower).
- **RAM overcommit** degrades catastrophically (swap, then OOM).
- **Storage capacity overcommit does not degrade at all — it stops dead** (the thin-pool cliff).
- **Bandwidth overcommit** degrades gracefully.
- **Power overcommit** degrades catastrophically and instantly (a breaker trips).
- **IOPS overcommit** degrades in a hockey stick.
**The player should learn that the same 4:1 ratio is prudent on one axis and suicidal on another**,
which turns one slider into six meaningfully different decisions for almost no design cost.
**The key nuance to state out loud:** **oversell is safe until demand correlates.** The failure isn't
average load — it's Black Friday, patch day, a game launch, or 6pm. Ties the slider directly to
seasonality.
**Visual:** the **Oversubscription Slider** with a visible green safe zone, a yellow zone, and a red
zone where your tenement windows start flickering. Greed and risk in one control.

**Variations and additions**

- **The shared-host scam engine, named.** Sell 500 "plans" onto hardware sized for 50: **the profit
  multiplier scales with density and the risk meter scales with it too** (noisy-neighbour events plus
  audit exposure). This is the signature shared-hosting economy — the forbidden-but-essential lever
  every real shared host actually ran, and it deserves to be presented as such rather than as a neutral
  slider.
- **One dial, many names.** Overcommit is **how you get rich** and **exactly what kills you** on a
  noisy-neighbour wave — *"the whole genre thesis in one slider."* Sell 400% of capacity at a low burst
  probability and margin explodes while tail-risk meltdowns grow. **The game's greed dial.**
- **Per-pool ratios encoded by type.** Shared · game servers (RAM ratios) · **GPU time-slicing and vGPU
  — the modern version** · backup (dedupe ratios). **Every capacity buildable should ask "what ratio do
  I run it at?"** — margin with a sword attached. (The exact detents are a live numeric dispute; see
  §6.16's oversell-ratio conflict.)

### Grandfathering
Old customers on old prices.

**How it works:** Raising prices creates two populations. Force-migrating grandfathered customers
causes a churn and reputation event; leaving them costs margin forever. **The decision every hosting
company eventually faces and usually gets wrong.**
**The three options, priced:** **keep them** (margin loss, drawn as a widening gap on the per-plan
margin chart) · **migrate with notice** (X% churn, Y reputation, one support surge) · **migrate with a
sweetener** (cash cost, half the churn).
**The cruel detail that makes it real:** grandfathered customers are disproportionately your **oldest
and most vocal**, so the churn you take is the churn that **gets written about.**
**The three tactics real hosts actually use (all of them slow):**
1. **Deprecate the plan, don't reprice the customer.** New signups can't buy it; existing customers
   keep it until they change something. Attrition handles it over 3–5 years.
2. **Raise price with added value.** "Your plan now includes daily backups and it's $2 more." Churn on
   a value-paired increase is roughly **half** that of a naked one.
3. **Migrate on a trigger.** Any upgrade, downgrade, or plan change moves them to current pricing.
   Slow, silent, and invisible to review sites.
**All three are slow, which reinforces the correct lesson: pricing is a low-frequency instrument.**
**Visual:** **Legacy debt with a dollar sign** — old plans render on the plan ladder in a faded,
period-appropriate style, visibly out of date.

**Variations and additions**

- **The Grandfathering Ledger — make it an object in the room.** Old customers pay 1998 prices, drawn as
  a **visible, growing negative tower in your HQ.** Every year of tenure **locks a rate** (the loyalty
  badge costs you); **inflation and power climb the bar's left side while revenue stays flat**; and
  **the bar crossing zero mid-campaign *is* the crisis.** "Price Increase Day" is the level; this is the
  disease that causes it.
- **The three remedies, as strategic plays rather than a menu:** **honour it forever** (reputation
  immortal) · **raise it** (churn risk, cohort by cohort, and the oldest cohorts are unionised by
  tenure) · **"sunset with dignity"** (migrate them to a *modern product* at a real price, which is the
  only one that changes the shape of the business).

### The Price Increase (the four-parameter decision)
The most consequential commercial action a hosting company ever takes, and it needs its own verb.

**How it works:** You set four things — **size** (%), **notice period**, **who it applies to** (new
only / renewals only / everyone), and **exemptions** (a hand-picked list). Consequences are computed:
a **churn spike** proportional to size and inversely proportional to notice; a **reputation event** if
notice is short or the communication is bad; a **support-ticket wave** proportional to affected count;
and a **permanent trust reduction if you do it twice in eighteen months.**
**Why:** the document has grandfathering, intro pricing and renewal cliffs and nothing about the *act*
of raising prices. **One decision, four dials, and every hosting company's most-feared board meeting,
made playable.** Doing it well — with notice, grandfathering, and a value story — is a skill the game
can actually teach.

### Intro pricing and the renewal cliff
$1 first month, $15 after.

**How it works:** Spikes acquisition, tanks retention at renewal, and damages reputation if the cliff
is hidden. A dial with a delayed cost — **perfect material for the 90-day lag.** Two numbers per plan.
**Aggressive spreads maximize signups and guarantee a cliff; transparent pricing lowers signups and
raises LTV.** **A pure, honest strategic choice with no right answer** — exactly what the industry
actually looks like.
**Interacts with:** §6.12's term matrix (a 3-year prepay book has a beautiful level and a catastrophic
one 36 months later), §6.9's Attribution Ledger (which is what makes the cliff legible as a *cause*).

### Term discounting and commit discounts
Monthly / annual / 2-year / 3-year; each lowers churn and lowers price.

**How it works:** Trades margin for predictability and cash. Locks in *your* price while your costs are
not locked — see §6.12's escalator and pass-through clauses, which is exactly why real contracts
contain them. **Exactly the right decision to offer before a level you know will be rough.**
**Full matrix in §6.12.**

### Volume and committed-use discounts
Trade price for predictability at the customer's end.

**How it works:** The customer commits to a volume for a rate; you get a revenue floor and they get a
discount; unused commit is a satisfaction penalty for them and free margin for you (§6.12's
take-or-pay).

### Tier design and the good-better-best ladder
You design the plans themselves.

**How it works:** Anchoring, decoy pricing, and feature-fencing. How much disk, how much bandwidth,
what's included, what's fenced. **Badly designed tiers attract exactly the customers you don't want.**
Building the ladder is a design minigame: which feature goes in which tier determines your entire
customer mix.
**The highest-margin move:** charge for **guarantees** (dedicated resources, priority support, higher
SLA, a named engineer) rather than for resources.

**Variations and additions**

- **The ARPU ladder, with designed-in cannibalization.** **The middle tier is where most land**; anchor
  high; the **loss-leader hobbyist feeds the funnel.** Every slider on the ladder has a monster attached.
- **Plan value should *grow* without a plan change.** Build upsell products — backup add-on **+$5**,
  managed updates **+$50**, monitoring **+$10** — and surface them as **upsell offers that pop as micro-
  decisions**, gated on trust/reputation. Late-game, the tiered plan set becomes a **passive economy
  buildable** so different packets automatically pay differently.

### Cost-plus vs value pricing
A compliance-hosted server is the same server at 4×.

**How it works:** Let the player discover that **positioning is a pricing lever** — the identical
hardware sold into a regulated, latency-critical, or reputation-critical market carries a multiple that
has nothing to do with its cost. It is the cleanest argument in the game for specialization.

### Usage-based vs flat
Two philosophies with different failure modes.

**How it works:** Flat is predictable for the customer and risky for you (the one customer who uses 40×
the average). Usage-based is safe for you and terrifying for them (bill shock, §6.7). **Hybrid — flat
with a generous cap — is the industry answer and should be unlockable, not given.**

### Metered vs unmetered vs "unlimited"
A marketing weapon that guarantees abuse.

**How it works:** "Unlimited" and "unmetered 1Gbps port" are sellable, tempting SKUs whose reality is a
**shared uplink with a fair-use clause** and a contention ratio. The failure mode is a support argument
about the meaning of the word "unmetered," and it is a reputation event as much as a cost event.
**The player can offer it and will regret it** — which is the correct shape for this mechanic.

### Overage policy
Hard cap / soft cap / burst allowance.

**How it works:** **Hard cap** protects you and angers them (service stops). **Soft cap** produces bill
shock. **Burst allowance** is the industry compromise and costs you the variance. A three-way dial with
three distinct failure modes, set per plan.

**Variations and additions**

- **Policy framed as two failure flavours.** **Soft caps bill overage** — revenue, *and* bill-shock
  disputes. **Hard caps throttle** — churn risk, and no anger about the invoice. A small line-item loop
  with a big personality.
- **Breakage income.** Prepaid unused minutes and credits are **breakage margin** — real money, with a
  scandal risk attached if anyone notices how much of it you book.

### SLA tier pricing and the true shape of a credit
Sell 99.9 / 99.95 / 99.99 — and know what you actually sold.

**How it works:** The higher tiers need real redundancy investment or you are selling a **liability**.
**The credit's four real properties, all of which should be modelled:**
1. Credits are a **percentage of the monthly fee for the affected service**, not of the customer's loss.
2. They are **capped** (commonly at 100% of one month).
3. They **must be claimed by the customer within N days** — **most customers never claim**, which is a
   quiet, cynical, entirely true windfall, and **the ones who do claim are your biggest customers.**
4. They **never approach the customer's actual losses** — which is why enterprise customers demand
   more, and why **reputation damage exceeds the credit cost by ~10×.** **Model that gap.**
**The live-accruing SLA meter (§6.7) is great; this gives it teeth and a cap.**

### The Cost of a Nine (an explicit, visible cost curve)
What each additional nine actually costs, drawn as a curve on the contract screen.

**How it works:** Roughly **3.5× the infrastructure cost and 2× the operational discipline per nine.**
99% is one box and a backup. 99.9% is redundancy. 99.99% is redundancy *plus* automation, because
humans are too slow. **99.999% is multi-site plus a practised organisation, and is not purchasable** —
it is a property of the company, not of the shopping list.
**Why:** the single most useful thing this game can teach, and it turns the contract slider into a
*decision* rather than a difficulty toggle. It also gives the player the pleasure of correctly choosing
to **under-promise and over-deliver** — which the scoring should reward (§6.9).
**Interacts with:** §6.12 the contract, §6.1 error budget, §6.9 The Nines.

### Segmented pricing
Different rates per customer archetype.

**How it works:** Charge the Whale less per unit (volume), charge the risky customer more (risk
premium), charge the enterprise more (compliance and hand-holding). A small optimization layer for
players who like it, and the mechanism behind the risk premium on grey-area lines (5–10× normal rate,
with an abuse-pressure cost attached).

### Yield management
Dynamic pricing for scarce inventory.

**How it works:** GPU hours, satellite passes, the cabinets nearest the meet-me room, the racks on the
cold aisle, the low-latency ports. **Charge more for the good spots — colo operators really do.** Turns
your floor plan into a pricing surface and pairs with §6.6's tenant-placement puzzle.

### Regional pricing / PPP
More volume, arbitrage risk.

**How it works:** Purchasing-power-adjusted pricing expands the market and invites VPN resellers who
buy cheap and resell into expensive markets. A growth lever with a fraud tail.

### Bundling
Hosting + domain + SSL + email at a blended price.

**How it works:** Raises attach rate, raises stickiness, and **obscures margin** — which is the trap.
The bundle that looks profitable is often carried by one component, and you only find out when you try
to unbundle it (§6.14's internal transfer pricing).

### Free tier and free trial
Acquisition or abuse vector, depending on how you gate it.

**How it works:** Drives signups and drives fraud, crypto-mining abuse, and support load. **Free-to-paid
conversion is 1–4%; on unverified free tiers, 30–60% of signups are abusive.** With a card on file,
trial-to-paid is 35–60%. Requires verification builds to survive. **Free-tier sizing is a marketing
spend disguised as a product decision**, and the free-trial abuse rate is the tuning knob between
growth and fraud.

### Loss leaders and attach rate
A cheap entry product designed for upsell.

**How it works:** Priced below cost on purpose, measured on **attach rate** rather than margin. Works
only if the upsell path is actually built; otherwise it is just a cheap product that loses money, which
is the failure mode the game should let you walk into.

**Variations and additions**

- **The free tier as a *building*, not a plan.** A deliberately unprofitable customer pool kept as
  **marketing fuel** (referral currents, reputation) — which **must be fenced**, because unfenced it
  eats the capacity your paying tiers need.

### The Promo Engine
Coupon codes with expiry, first-term-only flags, and a redemption budget.

**How it works:** A badly scoped coupon leaking to a deal site is a **classic, survivable disaster** —
a flood of the worst possible cohort at the worst possible price, permanently grandfathered unless you
built the expiry correctly. The cohort shows up as a red band in Revenue Quality (§6.1) for years.

### Fee-Trap Design (pricing as defence engineering)
**Every fee you write is a strategy surface that attackers play.**

**How it works:** **Setup fees deter drive-by abuse tenants** — they go somewhere free, which is *the
good kind of churn*. **Storage overage fees punish hoarders** — and summon the Filler Swarm trying to
trip them. ***Egress* fees are the landmine:** price migration too high and you have angry captives;
too low and raiders slurp your datasets. Show it: the pricing page carries a live **"exploitability"
heat**, a tiny adversarial eye per fee.
**The darkest artifact:** dark-pattern discounts behind a **three-page cancellation maze** — short-term
retention, long-term hacktivist magnet.
**Why it belongs in §6.5:** it is the one entry that makes the pricing screen a *defensive* structure,
which is what closes the loop between the economy and the threat model.
**Interacts with:** §3 abuse archetypes, §6.5 Refund-Policy Dial, §6.2 retrieval and early-deletion
fees.

### The discounting spiral and discount authority
Sales closes deals by discounting.

**How it works:** Each discount is invisible individually and collectively destroys margin. A **discount
authority** setting — how much sales can give away without your approval — turns it into a delegation
decision: raising it closes more deals at worse margins, and the effect arrives on a lag.

### Elasticity testing
A/B pricing as a research action.

**How it works:** Split new signups across two prices for N weeks and learn your actual elasticity
curve. A Pricing Science node. **Turns a guess into a measurement**, which is the whole point of the
business tree — and the game should occasionally **prove the demand-curve estimate wrong**, because
elasticity estimates are wrong.

### The race to the bottom
An NPC competitor undercuts you.

**How it works:** Matching them is a trap the game should let you walk into. Differentiating —
performance, support, specialization, trust — is slower and works. **The most common real strategic
error, modelled as a tempting button**, and now with a visible floor (the Margin Death Zone) so the
trap has a drawn edge.
**Visual:** the **Competitor Price Tag** — rivals' prices drawn as tags hanging at the edge of your
market view; undercutting is visible as your tag being lower and their visitor lane bending toward you.
**Price wars are a tug-of-war you can watch.**

**Variations and additions**

- **Price War Events (the economic boss fight).** The Competitor periodically drops prices: **match them
  and your own elasticity curve makes it margin-destroying; refuse and customers bleed.** *"The real
  tower-defense boss is an economic decision under timer pressure."* Your three counters are **price
  cuts** (margin bleed), a **marketing blitz**, or the **quality moat** — and real-time pricing
  micro-decisions are what make the economy side *playable* instead of a spreadsheet.
- **The Price-War Prisoner's Meter.** A persistent, **market-wide** meter for your segment: *how deep is
  everyone discounting right now?* Match, and you drag the **whole market's** margin down — visible on
  your competitors' gauges too. Hold premium, shed share, and **breed a brand.** The tacit "don't start
  one" lesson the industry learned the hard way, encoded as a shared resource you can pollute.

### Custom enterprise pricing (the quote)
A negotiation minigame.

**How it works:** They want a discount, a custom SLA, a security review, net-60, an audit right,
uncapped liability, and MFN pricing. **Each concession costs something specific** and each is a
separately buildable contract clause (§6.12). **Sales as a puzzle, not a slider.**

### Eviction economics (the decision to fire a customer)
Firing a customer is a **calculation**, and the game should show you the arithmetic and still not tell
you the answer.

**How it works:** The explicit decision math is **churn cost now vs. expected incident and legal cost
later**; support and monitoring towers feed the expected-cost estimate, so the decision is **informed
but never obvious.**
**The portfolio face — a per-account Cost-to-Serve meter:** what each customer *earns* versus what they
*consume*. Some whales are **secretly margin-negative ghosts you are contractually obliged to keep
until renewal**, which makes **firing a money-losing whale a winning move the tutorial should teach
with confetti.**
**The acquisition face — cohort LTV telemetry:** hover any archetype to see estimated lifetime value ×
risk, the churn ghosts it will create, and the threat lanes it attracts. **Accept/reject stops being a
gut call and becomes legible portfolio theory.**
**Interacts with:** §6.5 Margin Tint (the targeting UI), §6.9 Scored Retreats, §6.3 cost-to-serve,
§6.1 Heat.

### The Margin Tint (pricing made ambient)
Every service and every customer card carries a subtle background tint from green (high margin) to rust
(losing money).

**How it works:** Scanning your customer file for rust tells you who to fire — **a real hosting decision
and a great visual moment**, and it makes §6.9's Scored Retreat (firing a customer) into an action with
a visible target rather than an abstraction.

### The Pay-It-Forward economy of kindness
The ethics slider, made mechanical and **compounding.**

**How it works:** Overcharging customers boosts short-term cash, but **every overcharge stacks a hidden
"resentment" value that amplifies churn storms** later. Nothing announces it; you simply find that your
next bad week is worse than the one before it was. The game's quiet moral — **the hosting business
survives on trust** — arrives as a lagged multiplier rather than a lecture.
**Interacts with:** §6.5 Fee-Trap Design, §6.9's Attribution Ledger (which is what makes the lag
legible rather than arbitrary), §6.1 Trust.

---

## 6.6 Per-type economics

*Every hosting type is a different business, not just a different skin. This is where the variety
engine cashes out financially.*

### The fundamental hosting economic truth
**Hosting is a capacity business with a utilization problem.**

**How it works:** You buy capacity in lumps (a server, a rack, a circuit, a megawatt), pay for it
whether it's used or not, and sell it in slices. Profit is almost entirely a function of
**utilization × price − (capex amortization + power + bandwidth + labor)**. Everything interesting in
the economy flows from that single equation.
**The corollary that should drive the whole game:** **idle capacity is a slow bleed, and full capacity
is a cliff.** The player lives permanently in the uncomfortable band between the two.
**Stated as a game mechanic:** revenue ≈ (customers served) × price; cost ≈ (capacity owned) × upkeep;
therefore **profit = utilization**, and **utilization is the enemy of headroom, and headroom is the
enemy of outages.** One equation, endless tension.
**Visual:** a live utilization gauge with a green "efficient" band and a red "you have no room to
breathe" band — the single most important operational-financial number in hosting, on the HUD, per
resource.

### The revenue-shape table
*The best single table in the document. Three columns of the original are corrected below; three
companion tables follow that turn it from a reference into a design tool.*

| Hosting type | Unit of sale | Revenue shape | Margin | Cash timing | Signature cost |
|---|---|---|---|---|---|
| Shared web | account/month | many tiny, high churn | thin, volume | **prepaid term, renews annually** | support + licences |
| Managed WordPress | site/month | fewer, stickier | good | monthly | staff expertise |
| VPS / cloud | instance-hour | metered, elastic | medium | monthly/usage | overcommit risk |
| Dedicated | server/month | lumpy, sticky | medium | monthly/annual | hardware capex |
| Colocation | U / kW / cross-connect | 3–5 year leases | high | **monthly in advance on a multi-year term** | building + power |
| Wholesale DC | MW build-to-suit | 10–15 year leases | very high, very slow | huge upfront | construction |
| Game servers | slot / server-month | seasonal, spiky | medium | monthly, prepay | DDoS + latency |
| VoIP / SIP | channel / minute | per-minute + rental | thin on minutes | monthly + settlement | fraud (toll) |
| Email | mailbox/month | tiny per unit, very sticky | thin | annual common | deliverability ops |
| DNS | zone / query | per-query at huge scale | high | monthly | anycast footprint |
| CDN | GB delivered | metered egress | medium | monthly | transit + PoPs |
| Object storage | TB-month + requests + egress | accretive, never shrinks | good | monthly | drives + egress |
| Backup / DR | TB protected + restore SLA | very sticky, low touch | good | annual | storage + testing |
| Tape vaulting | tape / vault-month + retrieval | very low churn | high | annual | courier + library |
| Video / streaming | GB + transcode-minute | spiky, event-driven | thin on egress | monthly | transcode + egress |
| Seedbox / file | GB + slot | high churn, high abuse | medium | monthly | abuse + takedowns |
| GPU / AI | GPU-hour | commodity, price-volatile | **boom/bust, and entirely determined by contracted utilization** | **reserved 1–3 yr contracts, often prepaid, are how the hardware is financed; hourly is the residual** | power + hardware cost |
| HPC / render | node-hour / job | project-based, deadline-driven | medium | per-project | scheduling + power |
| Crypto mining host | kW-month | brutal, cyclical | thin, volatile | prepay only | power + tenant risk |
| Kubernetes / PaaS | node / workload | platform stickiness | good | monthly | platform engineering |
| Serverless | invocation / GB-s | micro-billed, huge volume | good at scale | monthly | cold-start engineering |
| DBaaS | instance + storage + IOPS | very sticky (data gravity) | high | monthly | backup + expertise |
| Bulletproof | server/month, prepaid | very high price | very high | prepaid crypto | legal + upstream risk |
| Regulated (HIPAA/PCI) | contract | annual, high-touch | high | annual | audit + staff |
| Dial-up ISP (era) | account/month + hours | declining | thin | monthly | modem banks + POTS |
| Satellite ground | pass / antenna-hour | scheduled, scarce | high | contract | antenna capex |
| Edge / 5G MEC | site + node | carrier contracts | medium | contract | site access |
| IoT backend | device/month | enormous volume, tiny unit | thin | annual | ingest scale |
| Blockchain node | node/month | volatile | medium | prepay | storage growth |

**Why the three corrections matter:** the overwhelming majority of retail shared hosting is sold as
12/24/36-month prepay at a discounted intro rate renewing at full price — "monthly card" describes
almost none of the market, and **the renewal cliff is that line's signature dynamic.** Colo is a
multi-year term *billed monthly in advance* with an escalator, a deposit and an NRC — not annual
invoicing. And GPU hosting's cash timing is a financing structure, not a rate card.

### Companion table A — term, churn, and cash conversion
*The three columns that explain why some of these businesses fund themselves and others need capital.*

| Hosting type | Typical term | Monthly logo churn | Cash conversion cycle |
|---|---|---|---|
| Shared web | 12–36 mo prepaid | 3–6% | **negative** (customer funds you) |
| Managed WordPress | monthly–annual | 1.5–3% | slightly negative |
| VPS / cloud | monthly | 4–8% | ~0 |
| Dedicated | monthly–annual | 1–2% | +60 to +120 days (hardware first) |
| Colocation | 3–5 years | 0.3–0.8% | +12 to +18 months (fit-out) |
| Wholesale DC | 10–15 years | ~0 | +24 to +48 months (construction) |
| Game servers | monthly, prepay | 6–12% seasonal | negative |
| Email | annual | 1–2% | negative |
| Backup / DR | annual | 0.5–1.5% | +30 to +90 days |
| GPU / AI | hourly to 3 years | varies wildly | **+6 to +18 months** (cards bought first) |
| Bulletproof | monthly, prepaid crypto | 8–15% | strongly negative |
| Regulated | annual–multi-year | 0.2–0.5% | +60 to +120 days |

**The lesson the table teaches by itself:** a negative cash conversion cycle is a *financing
instrument*. A positive one is a *capital requirement*. The same MRR growth rate is effortless in one
column and fatal in the other.

### Companion table B — acquisition and support load
*Turns a descriptive table into a prescriptive one: the player can see **why** shared hosting is a
grind and **why** cross-connects are the best business in the industry, without being told.*

| Hosting type | CAC | Time to profitability per customer | Tickets/customer/month |
|---|---|---|---|
| Shared web | $65–150 (affiliate CPA) | 9–18 months | 0.3–0.6 |
| Managed WordPress | $150–400 | 5–9 months | 0.4–0.8 (but higher value) |
| VPS | $40–120 | 4–10 months | 0.2–0.5 |
| Dedicated | $300–900 | 3–6 months | 0.15–0.4 |
| Colocation | $2,000–15,000 (sales cycle) | 12–30 months (fit-out) | 0.05–0.2 + remote hands |
| Cross-connect | ~$0 (sold to an existing tenant) | **immediate** | ~0 |
| Backup / DR | $400–1,500 | 6–12 months | 0.1–0.3, spiking on restore |
| GPU / AI | $1,000–20,000 | contract-dependent | 0.2–1.0 (high-touch) |
| Free tier | $0–15 | **never, by design** | 0.8–2.0 |

### Companion table C — what a bad month looks like
*One addition per row that makes the table a design tool: authors then know what pressure to write.*

| Hosting type | A bad month |
|---|---|
| Shared web | a slow churn bleed nobody can point at |
| Managed WordPress | one high-profile client site hacked, in public |
| VPS / cloud | a noisy neighbour that correlates across a whole host node |
| Dedicated | a hardware batch failure across gear you bought together |
| Colocation | **a single tenant not renewing** |
| Wholesale DC | a delayed power delivery date on a build-to-suit |
| Game servers | a title dies, or a launch you weren't ready for |
| VoIP / SIP | toll fraud on a weekend |
| Email | **a blocklisting** |
| DNS | an amplification incident originating from you |
| CDN | an origin-shield miss storm during an event |
| Object storage | an egress bill the customer disputes |
| Backup / DR | **a restore that fails in public** |
| Streaming | an event nobody watched, and one nobody could |
| Seedbox / file | a takedown wave and an upstream complaint |
| GPU / AI | **a price collapse** with your hardware financed for four more years |
| HPC / render | a missed deadline penalty |
| Crypto host | a halving, or a tenant who stops paying and leaves the gear |
| Bulletproof | law enforcement, or your upstream deciding you're the problem |
| Regulated | an audit finding thirty days before renewal |
| Satellite ground | weather, and a pass you cannot reschedule |

### Data gravity
Storage revenue is the stickiest revenue in existence.

**How it works:** Once a customer has 80TB with you, moving costs them time, money and egress fees.
Churn collapses; expansion revenue rises by itself. **The best retention mechanic is physics.** The
mirror image: *your* data has gravity too, which is why cloud egress fees exist and why your customers
resent them. Combined with the **dual-run cost** (§6.14) it is the real switching cost — **which is
why customers don't leave.**
**Hosting types:** object storage, backup/DR, DBaaS, tape vaulting, video archive; weakly for VPS;
not at all for stateless compute and game servers.

### Lease terms and the colo cash profile
Colo is real estate.

**How it works:** 3–5 year contracts, **annual escalators (typically 3%/yr)**, security deposits, and
a **fit-out cost you pay upfront and recover over the lease** (capitalized over ~60 months). Cash goes
out first, comes back for years. Utterly different tempo from shared hosting's monthly churn grind, and
the game should *feel* different — the clock is slower and each decision is heavier.
**Interacts with:** §6.12 term structure, §6.13 capitalized fit-out, §6.14 the J-curve.

### Occupancy, stranded capacity, and absorption rate
The colo/facility scoring triad, and the most underused idea in §6.

**How it works (occupancy):** You built 1MW; you've sold 640kW; occupancy is 64%. Empty space is pure
loss. **Target 85%+; below 65% the building loses money** — and remember PUE degrades at low load, so
a half-empty facility is inefficient twice over.
**How it works (stranded, sharpened):** Capacity is stranded when you hold **one resource without its
complements** — space without power, power without cooling, cooling without space, any of them without
network. **The most common real form is power stranded by density mismatch:** you sold your kW to
low-density tenants who used all your floor, so you have amps left and nowhere to put a cabinet.
**How it works (absorption):** The third number real operators live on is **absorption rate** — how
fast you lease, in kW or cabinets per month — measured against **build rate**. Build faster than you
lease and you carry empty capacity; build slower and you turn away deals and your sales team stops
selling. **The whole facility business is a pacing problem between two schedules**, which is a far
better core loop for a landlord level than occupancy alone.
**The verb it needs — tenant placement.** Give it the overlay: a **capacity map** showing space, power
and cooling as three overlapping availability layers with stranded regions hatched, plus a
**three-bar readout per suite (space / power / cooling)** where **the shortest bar is your real
capacity** and the excess on the other two is drawn as visibly wasted. The verb is *where you put each
new tenant*, which determines how much of your remaining capacity stays sellable. **That's Tetris with
three simultaneous dimensions and it's excellent.**
**Interacts with:** §6.5 yield management (the good spots cost more), §6.3 PUE, §6.9 revenue per kW.

### Power as a product
In facility lines, you sell electricity at markup.

**How it works:** Sell by **circuit** (committed amps — predictable, strands capacity, and **committed
power that isn't consumed is nearly pure profit**) or **metered** (efficient, volatile). **Choosing
your billing model *is* the strategy**, and it is the single biggest strategic choice in colo pricing.
Carry the kVA/kW/power-factor numbers from §6.3 onto the contract card so the derate is visible before
the dispute.

### Colo's three meters (and the spread you profit on)
Colo is not one price, it is **three meters plus the one-time charges** — and the tenant will try to
cheap out on exactly one of them.

**How it works:** **Space** ($/rack U / cabinet / month) · **Power** ($/kW contracted and/or metered —
*the* real currency of datacenter deals, with **penalties when tenants exceed contract**, so power
capping becomes a live mechanic) · **Bandwidth** (95th percentile) · plus **NRCs** (installs,
cross-connects) and **remote hands**. **You must profit on the *spread*,** not on any one meter, which
is what makes a colo negotiation a genuine puzzle rather than a price.
**Interacts with:** §6.3's kVA/kW entry (the three-numbers problem), §6.6's occupancy and stranded
capacity, §6.2 power resale and space rent.

**Variations and additions**

- **Rack Unit vs Kilowatt — two ledgers, NOT interchangeable.** 42U of 1U web servers fits inside a 10kW
  rack, but **GPU sleds fill the power at 12U and leave 30U as dead space** (or you pay for a denser
  feed). **Show both meters per rack with the *binding* constraint highlighted** — real colo is 90% a kW
  puzzle wearing a floor plan.
- **kVA vs kW — the phantom-watt tariff.** Colo bills **apparent** power, so cheap PSUs with a bad power
  factor cost you rent for amps that heat nothing. Give each rack a diegetic dial showing **kW (work),
  kVA (billed), and power factor**; a "quality PSU" pays back over waves; and **a fleet of bargain PSUs
  drags the whole hall's correction gear over and the landlord bills a facility charge** — the
  noisy-neighbour lesson, but *electrical*.
- **Connected-Power Overcommit — colo's hidden leverage and its landmine.** You sell "16A per rack
  connected" and provision roughly **1.2× actual diversified demand**, because colo racks never all peak
  at once. Overcommit further and margin climbs — **until a heat wave trips breakers.** That is a
  self-inflicted outage wave your *customers' gear* eats, with an SLA-credit cascade behind it. **Power
  capacity as a gamble-your-reputation resource.**

### Cross-connects: the best line item in hosting
A patch cable between two tenants, billed monthly, forever.

**How it works:** ~90–95% margin, near-zero ongoing cost, and enormous stickiness — a tenant with 40
cross-connects into your meet-me room will never leave. **Network effects as revenue**: each new tenant
makes the building more valuable to every other tenant. Unlocking the meet-me room should feel like
discovering money.
**Two additions that matter:**
1. **NRC matters.** Install charges of $250–500 per cross-connect are a meaningful one-time revenue
   stream in a growing facility — the "setup fee" lever in colo form.
2. **This is exactly why carrier-neutral matters.** If you're a **tenant** in someone else's building,
   *they* collect the cross-connect revenue and you can't. **Owning the meet-me room is the difference
   between selling space and selling an ecosystem** — which retroactively explains why "carrier
   relationships + meet-me room" is the highest-margin unlock in the game.
**Visual:** the **Cross-Connect Faucet** — every cross-connect you sell adds a small faucet dripping
gold. **A meet-me room full of faucets is a picture of an extremely good business.** And per §6.15, the
cross-connect currency glyph (a patch cable) should be the **fattest, most satisfying money glyph in
the game**, because it is the highest-margin line.

**Variations and additions**

- **Cross-connect rent, from the tenant's side of the glass.** That beautiful cable to the carrier costs
  **$150–300/month forever** — *your gorgeous spaghetti is a literal recurring ledger line.* It also
  retroactively gives the **cable-tidiness minigame a P&L payoff**: tidy patching saves patch-panel port
  fees.

### Peering ratio as a cost driver (and a diversification payoff)
Your traffic ratio is priced by the people you connect to.

**How it works:** Outbound-heavy portfolios pay more for connectivity — settlement-free peering
requires a roughly balanced ratio, and an imbalanced one pushes you onto paid transit. So **acquiring
an inbound-heavy line (backup, upload, ingest, CDN origin-pull) is a genuine *financial* synergy** on
top of the peak-hour synergy. **A rare case where diversification pays a literal bill.**
**Also:** every bit you peer is a bit you don't pay transit for — **peering-driven cost avoidance is
not revenue, but it is functionally identical**, and it should be shown as a saved-dollars line so the
IX port investment has a visible payback.

### Deliverability as revenue (email)
Your IP reputation is an asset on the balance sheet.

**How it works:** Good reputation → inbox placement → renewals. One blocklist listing → support flood →
churn. **A single stat that is simultaneously operational, financial and reputational** — the tightest
coupling in the game.
**Visual:** the instrument-cluster face for this line is a **postmark stamp** (§6.15).

### Per-query and per-invocation pricing (DNS, serverless, IoT)
Microtransactions at planetary scale.

**How it works:** Fractions of a cent, billions of times. Individually meaningless, collectively the
whole business. **Render it as a constant fine drizzle of coin motes** rather than discrete payments —
and note the LOD requirement in §6.15's Money at Three Scales, because at >500 conversions/second the
particles must become a **sheen**, not a swarm, or DNS and serverless levels melt the frame budget.

### Restore-SLA pricing (backup/DR)
You don't sell storage, you sell *getting it back.*

**How it works:** Price tiers by RTO/RPO: "restore within 4 hours" costs many times "restore within 7
days." Cold/archive tiers are cheap to store and expensive to retrieve — **and the retrieval fee is the
one customers scream about** (plus early-deletion fees, §6.2). Restore testing is a cost that prevents
a catastrophe, and **Restore Verified** is a level medal (§6.9).
**Instrument face:** an hourglass (RTO) and a fill gauge (durability).

### Deadline premiums (HPC / render)
Time is the product.

**How it works:** Customers pay a multiplier for guaranteed completion by a date. Missing it costs more
than the job was worth. **Scheduling becomes the revenue optimization**, not utilization — which
inverts the fundamental equation above and is exactly why this type feels different.

### GPU price volatility — and the financing mismatch underneath it
The most violent economics in the game.

**How it works:** Per-hour rates swing with market demand ($2–4/GPU-hr for H100-class in 2024,
drifting to $1.5–2.5; reserved 30–50% below spot). Hardware costs six figures per node
($250–400k for an 8×H100 node) and depreciates fast. **Utilization below ~55–65% loses money; above 90%
and you can't do maintenance.** A boom-bust line that can make or unmake a company inside one level.
**The missing piece, which is the actual risk:** **GPU hosting is a financing business wearing a
compute costume.** The cards are bought with debt, a lease, or customer prepayment, and **the term of
that financing versus the term of your customer contracts is the whole risk.** Financing four years of
hardware against one-year customer contracts in a market that reprices every nine months is how these
companies die.
**Make it a visible, scored stat:** **contract-term-versus-financing-term mismatch**, in any GPU level.
And it **generalizes** — it is the same risk a colo operator runs signing a 15-year building lease
against 3-year tenant leases, and the same risk a reseller runs on an annual transit commit against
monthly customers. **One stat, every capital-intensive line.**

**Variations and additions**

- **The late-2020s reality, inverted.** During AI booms **GPUs sell *forward*** — reserved 1–3 year
  contracts, backlog queues, and **partnership tiers (the NVIDIA-Cloud-Partner analog) that gate access
  to the hardware itself.** Add a **reservations book**: supply access becomes a business win, with
  take-or-pay risk as the counterweight. And let spot volatility hit **the customers' willingness to
  pay**, not only your revenue line.
- **Spot Pricing Tides (the opt-in trading layer).** Hardware and demand prices swing on a **visible
  ticker**: buy capacity cheap in troughs and lease to burst tenants at peaks. Sell idle capacity at
  spot; contract tiers reserve it back **at a penalty**. Spare capacity auto-sells on a fluctuating spot
  grid as background income that **spikes during *other companies'* crises** — and tempts you into
  overselling your own reserve.
- **Gross-margin pressure, stated once:** GPU margins are **fat during mania and negative on idle** —
  *"the whole game in one server rack."*
- **Arbitrage plays that belong to this line:** electricity futures by region, and **crypto-miner spot
  markets when your GPUs go idle.**

### The abuse cost line
Some lines come with a staffing cost attached.

**How it works:** Bulletproof, free-tier, seedbox and cheap-VPS lines generate abuse tickets,
complaints, blocklistings and legal requests at a predictable rate per customer. **Budget the abuse
desk or the line eats you.** Pairs with the Heat meter (§6.1) and the risk premium (§6.5).

### The obsolescence clock and the cascade down-tier
Hardware ages out of its market.

**How it works:** Each generation moves down the stack as it ages: today's premium dedicated box
becomes next year's budget dedicated, then a VPS host node, then a backup target, then a lab box, then
scrap with a certificate of destruction. **Managing the cascade is a whole strategy layer**, it
connects the Repurposing unlock to the depreciation curve, and its output feeds the secondary market
(§6.14). Older gear also carries a **higher failure rate, lower efficiency, and lower resale**, which
creates a **refresh-cycle rhythm** across a long campaign and makes the "absorb somebody's junk
hardware" scenario mechanically meaningful rather than flavour.

### Demand response and time-of-use
Getting paid to turn things off.

**How it works:** The utility pays you to shed load during peak events. You can honour it if your
workloads are interruptible — which makes **workload mix a power-market decision.** Wonderfully real
and nobody has gamified it.
**Pair it with the ratchet.** The demand-charge ratchet (§6.3) is the same market pointed the other
way: **you get paid to reduce peaks and punished for setting them.** Together they make **the shape of
your power draw, not the amount, a managed resource** — a genuinely novel and completely authentic
mechanic.

### Contract length as per-type personality
The single stat that makes types feel different.

**How it works:** Shared hosting churns monthly; colo signs five years; wholesale signs fifteen. **The
length of the contract sets the tempo of the level** — how fast decisions pay off, how badly a mistake
compounds, and how much a single customer matters.
**The consequence it must carry:** **long contracts mean your price is fixed while your costs are
not.** A 5-year colo lease signed before an energy price spike is a slow bleed — which is exactly why
real contracts contain **power pass-through clauses and annual escalators**, and negotiating those is
the single most consequential thing in a colo contract. **Make the escalator and the pass-through
clause explicit negotiable terms on the contract card** (§6.12); the player who gives them away to win
a deal finds out in year three.

### Internal transfer pricing (once you run more than one line)
See §6.14 — it is the mechanism by which your worst line can look like your best.

---

## 6.7 Money-moving events

*Discrete events that move cash, MRR or reputation in a single beat. These are the level's punctuation.*

### The governing rule for this subsection
**Every event arrives as a card with 2–3 responses, and at least one option costs a hand.**

**How it works:** As originally written, all of these are *announcements* — the player is told what
happened and watches the number move. Convert each into a decision card with real alternatives. The
ones that most need agency: **the whale signs** (which of your capacity do you commit?), **bill shock**
(which credit do you offer?), **the audit finding** (remediate now or negotiate the deadline?), **the
viral moment** (spend to capture it, or protect the existing customers?), **the vendor price increase**
(absorb, renegotiate, or migrate?).

### The whale signs
A single contract that doubles your MRR. **Winning it is a cash-flow crisis disguised as a
celebration.**

**How it works (the full landing sequence, which turns an event into a scenario):** security
questionnaire (engineering hands, 1–3 weeks) → **legal redlines (2–6 weeks)** → supplier onboarding
(30–60 days *after* signature) → hardware purchase up front → install with a committed date and a
penalty → **net-60 from first invoice**. **So cash from a deal signed in January arrives in June.**
Five months of cost before one dollar of revenue. **That's the crisis, and spelling out the sequence is
what makes it teachable** rather than a surprise.
**Choices on the card:** commit new hardware (cash out now), commit existing headroom (risk to current
customers), or stage the install (lower penalty exposure, slower revenue).
**Interacts with:** §6.13 backlog bucket (signed, not installed, not billing), §6.12 ramp schedules,
§6.4 net-60, §6.8 concentration.

### The whale leaves
20% of revenue walks, usually with 90 days' notice.

**How it works:** The notice period **is** the level: can you replace them before the cliff? A
brilliant scenario premise, and the moment the Concentration Risk penalty (§6.8) stops being abstract.
**Variants by type:** colo's version is *not renewing* at term end, which you can see coming for a
year and still fail to prevent; GPU's version is a contract expiring into a collapsed spot market.

### SLA credit event
An outage becomes a bill you pay.

**How it works:** Credits accrue *live* during an incident — the meter runs while you fix it. **Turns
downtime into a visible drain**, which is far more motivating than an abstract uptime percentage. Bound
by the four real properties in §6.5: percentage of the affected service's monthly fee, capped, claimed
within a window, and never close to the customer's actual loss.
**Visual:** the **Taxi Meter** widget — one horrible clicking object shared with toll fraud, egress
shock, recursive invocation and the remote-hands clock. **One sound the player will come to dread.**

### SLA credit payout model — *CONFLICTING*

The same liability, three mutually exclusive payout physics. What is in dispute is **who initiates the
credit and what stops it**: an automatic deduction on payout day, a claim the customer must file, or a
pre-funded pool that terminates the contract when it empties. The choice determines whether SLA credits
are a **drain you watch**, a **ticket queue you triage**, or a **countdown you defend** — and whether
"auto-apply" is default physics or a purchasable trust feature.

#### Position A — the live-accruing meter, bounded by the four real properties *(master)*

Credits accrue **live during an incident** — the meter runs while you fix it, which turns downtime into
a visible drain far more motivating than an abstract uptime percentage (the **Taxi Meter** widget).
Its teeth and its cap come from the four properties in §6.5: credits are a **percentage of the monthly
fee for the affected service** (not of the customer's loss), they are **capped** (commonly at 100% of
one month), they **must be claimed within N days** — **most customers never claim**, which is a quiet,
cynical, entirely true windfall, **and the ones who do claim are your biggest customers** — and they
**never approach the customer's actual losses**, which is why reputation damage exceeds credit cost by
roughly **10×**. Master's position is therefore a *blend*: automatic accrual for legibility, claim-based
economics for truth.

#### Position B — three separate payout models, pick one *(opencode)*

- **Auto-apply physics.** Breach minutes **pay customers automatically on payout days**; hitting the
  monthly credit cap is a **breach-of-contract fail**; breach cascades (credit + churn) make small
  downtime expensive. *"Bankruptcy by refunds is the true death of real hosts,"* and each missed nine
  auto-bills — a doom-loop guard that also gives the player **something to pay to fix.**
- **Claim-based reality.** Real SLA credits are **filed by the customer** within N days and capped at
  **30–100% of the affected service's fee**, with consequential damages excluded by the MSA. The
  gameplay fix: **credit claims arrive as tickets** — you triage them, and you **dispute** when your
  monitoring disagrees. **Auto-applying then becomes an expensive trust feature that wins renewals — a
  marketing tower, not default physics.** And **SLA drafting** (measurement definition plus exclusions,
  written by the player) is where the liability actually lives.
- **The escrow pool.** Enterprise customers **pay into an escrow each wave**; every breach — latency,
  error-rate, downtime — drains it; **when the pool empties, the contract terminates.** *"The money
  meter and the failure meter are the same object."*

**Compatible with every position above** *(these are additions, not contested)*

- **The math operators obsess over, exact.** 99.9% = **~43 min/month** of budget — miss by five minutes
  and you owe a month; 99.99% = **~4.4 min**. **This number is the difficulty curve.** Credits scale
  **5–100% of the monthly fee per tier**; enterprise contracts carry **10× multipliers and liquidated-
  damages clauses** beyond ordinary credits; and higher SLA tiers sell for more but **require 2N
  redundancy** — you are selling insurance you must underwrite with infrastructure. **Risk transfer as a
  mechanic.**
- **Maintenance windows are a legal *shield*.** Real SLAs exclude pre-announced windows, so **scheduled
  downtime inside a declared window carries zero credit liability.** Publishing your maintenance
  calendar is the most professional-feeling money mechanic in the game. (It is also the "maintenance
  exclusion" clause on the contract tower, §6.12, and an error-budget refund, §6.1.)
- **The metered-enterprise twist.** With per-GB billing, attacks spend SLA-adjacent money **even while
  failing** — see the heartbeat amendment *"attacks bill $N"* in §6.1.

### The Downtime Value Curve
**Not every minute of downtime costs the same**, and pretending otherwise throws away the best
scheduling decision in the game.

**How it works:** Refunds and churn-weighting scale with three multipliers — **the hour** (business
hours hurt roughly **20×** their 3am equivalent), **the day** (launch day, Black Friday, month-end
close), and **the customer on the line** (a whale's call-centre outage is measured in *their* revenue,
which they will invoice you for). Risk scheduling — *"patch at 04:00 or at 14:00?"* — becomes a
readable, teachable decision with a number attached instead of a vibe.
**Interacts with:** §6.1 error budget (spending it cheaply vs expensively), §6.7 SLA credit payout
model, §6.4 the invoice calendar, §6.9's Uptime Ribbon (the business lane is where you see the
multiplier land).

### The chargeback wave
Fraudulent signups charge back en masse.

**How it works:** You lose the revenue, the service delivered, and **$15–25 per chargeback**. Cross
**1%** and the processor puts you in a monitoring program; keep going and they terminate you — **a lose
condition** (§6.10). A hard red line on the HUD, and a **rolling reserve** (§6.13) is the softer
consequence that arrives first.

**Variations and additions**

- **Make it a graded ratchet, not a cliff.** Dispute-ratio thresholds → **monitoring fees** → **fines**
  → **termination**, with the **"excessive-risk merchant" surcharge tier** as a slow margin bleed in
  between. The fraud-screening console gets a **visible conversion tax** (friction loses signups) so it
  is a real dial rather than a free purchase. Extreme abuse ratios end in **processor termination — a
  game-over branch** on bulletproof and offshore lines: **the money supply itself is a win-condition
  resource.**
- **Fraud waves are *fake early revenue*.** Fraudulent cards refund N days later, so money you "earned"
  evaporates — which teaches that **booked ≠ real**. Churned gnats return as the **billing attacker**
  stealing cash directly, and the fraud-detection tower carries a **false-positive dial that blocks real
  payers.**
- **Offshore variant:** in some levels the processor simply **drops you entirely** — a cash-flow event
  rather than a fee.

### Bill shock
A customer's usage-based invoice is 40× normal.

**How it works:** They dispute, threaten to leave, post publicly. Choices: **full credit** (cash cost),
**partial credit + a cap going forward** (the correct answer, costs a little), or **hold firm** (they
churn and review you). **Teaches why caps exist.** Sources: egress, GPU-hours, recursive invocation,
retrieval fees, toll fraud, overage after a viral moment.

### The vendor renewal price increase
Your licence, transit, power or hardware supplier raises prices.

**How it works:** Your costs rise instantly; your prices are contractually fixed. **Margin compression
from outside**, and the responses are **absorb**, **renegotiate**, or **migrate off** — each with a
cost, a lead time, and a risk. The per-account licensing shape is the worst version, because it scales
with the exact thing you were celebrating.

### The true-up
The scheduled annual licence reconciliation. See §6.3 — retroactive, plus penalty, and **you count
yourself.**

### The invoice that doesn't get paid
A customer goes quiet.

**How it works:** AR aging → dunning → **service suspension** (which guarantees non-payment but stops
the bleeding) → collections → write-off. **Suspending a customer who owes you money is a genuinely hard
call** when they're big, and the game should make the size of the customer the whole difficulty of the
decision.

### The audit finding
A compliance auditor finds a gap.

**How it works:** Remediate (cash + hands, on a deadline) or lose the certification and the customer
tier. **Card choices:** remediate now (hands you don't have), negotiate the deadline (reputation with
the auditor), or accept the finding with a compensating control (cheaper, and it shows up again next
year).

### The lawsuit / the legal letter
DMCA, defamation claim, patent troll, or a customer suing over an outage.

**How it works:** Legal costs are immediate and unbounded; insurance covers some. **A cash event that
cannot be optimized away**, which is realistic and appropriately unnerving. The liability cap in your
contract (§6.12) is the single thing that determines whether this is expensive or existential.

### The Ransom-or-Restore Ledger
A designed dilemma with **no clearly right answer**, and a memory that spans levels.

**How it works:** **Paying the ransom** = immediate cash out **plus a hidden "soft target" flag** that
raises *future* attack rates. **Restoring** = capex now, reputation later. Neither is obviously correct,
which is the point.
**Made systemic:** ransom payments are **published**. An industry-wide *"will they pay?"* reputation
stat means **paying once marks you as a profitable target** — booter-credit economies and ransomware
operators **reinvest against you across levels** — while refusing builds the **"hard target" badge**
that deters extortion previews before they arrive.
**Interacts with:** §3 ransomware, §6.3 the cost of a breach, §6.11 insurance (and its moral-hazard
rider), §6.1 Heat.

### The Metering Bug (billing is production)
**The overbilling boss** — a wave that arrives from *behind your own wall.*

**How it works:** Your own billing system double-counts egress. **40,000 customers receive a 3×
invoice.** The incoming "wave" is refund tickets plus cancellations plus a Reddit thread, and it enters
through **your checkout**, not your edge. Resolution is a restore-trust minigame rather than a
mitigation.
**The lesson, stated as a law: *billing is production.*** Every test, canary, alert and rollback
discipline the player has learned to apply to serving traffic applies to the invoice run — and nothing
in a conventional tycoon game ever says so.
**Interacts with:** §6.13 revenue leakage (the same system failing the other direction), §6.7 bill
shock, §6.7 the refund wave.

### The Invoice Boss (the end-of-level bill)
At wave end **a giant PDF monster arrives**, summing all your upkeep, power, licences and wages.

**How it works:** Pay it and you earn a **surplus star**; it **literally eats overdue payments**, so you
budget for it the way you budget for a boss. It is the one moment in the level where the accumulated
upkeep ledger (§6.3) becomes a single creature standing in front of you.
**Interacts with:** §6.4 the invoice calendar and the Payroll Clock, §6.3 upkeep ledger, §6.13 AP as a
lever.

**Variations and additions**

- **Give it a dispute minigame.** Some line items are **legitimately wrong** (billing-error gremlins),
  which rewards attention to detail and ties the fight into your audit and log towers. **Collection
  becomes a puzzle and the joke keeps its teeth.**
- **Payment plans.** Negotiate installments at interest — or miss, and the boss enters a **"Collections"
  phase** in which the upstream visibly throttles your pipes on-screen. Beatable, but remembered.
- **What happens when you don't pay.** The invoice **survives into the next wave with an interest unit
  attached**; **vendor-lien units repossess a named buildable mid-level** (a tower that walks away is a
  horror beat); at two unpaid invoices, the **upstream-pull cutscene**.
- **Re-time it.** Real operational pain is **staggered recurring** — biweekly payroll, monthly transit,
  quarterly hardware, annual premiums — so the "boss fight" is better expressed as a scheduled
  **cash-valley calendar that deepens with headcount** (§6.4's invoice calendar). **Keep the giant PDF
  monster as the capex-heavy colo/GPU act's periodic level-ender**, where a single enormous bill is
  actually how the month works.

### The acquisition offer
Someone wants to buy you.

**How it works:** A multiple of ARR (or NOI, or backlog — see §6.9's per-line valuation bases) modified
by your diligence report. Accepting ends the run with a score; refusing continues it and the offer may
not come again. **The best "do you want to stop playing?" button in the genre.** A *bad* multiple
offered during distress is a soft loss/win (§6.10).

### The acquisition opportunity
You buy a failing competitor.

**How it works:** Cheap MRR, filthy infrastructure, angry customers, undocumented everything. **Buying
revenue is buying somebody else's technical debt** — and their contracts, their ETF exposure, their
blocklist history, and their bad-debt rate. Financeable via seller notes and earnouts (§6.11).

### The customer-book purchase
A smaller version of the same.

**How it works:** Buy a set of accounts from an exiting operator at a **churn haircut** (you will lose
20–40% in the migration). Cheap growth with a migration-risk tail and a dual-run cost (§6.14).

### The grant / the tax credit / the utility rebate
Rare positive events.

**How it works:** Energy-efficiency rebates for the PUE work you did anyway; regional incentives for
building in a specific place; heat-reuse subsidies. **Rewards the boring good decision, late** — which
is the correct emotional shape for a reward in this game.

**Variations and additions**

- **R&D as deferred revenue.** Free internal tools — dashboards, automation — show as **upkeep now and a
  permanent discount later**, so tooling is rewarded as an **asset rather than a cost centre.** Late
  game, "hard" projects can be **filed as R&D claims**: one-time cash sized to labour already sunk, at
  the cost of **documentation theatre** (which finally gives the failure museum a monetary purpose) and
  an **audit tail** — aggressive claims invite a return-audit wave.
- **The Grant Rack (geography as a P&L axis).** A rack sited in a **power-subsidy or green-energy zone
  rebates you**, which means where you put the hardware is a financial decision as well as a latency
  one.

### The viral moment
A customer's site hits the front page.

**How it works:** Free reputation, free traffic, a bandwidth bill, and an infrastructure stress test
all at once. Handle it well → press and signups. Handle it badly → the press is about you, negatively.
**Card choices:** spend to capture it (burst capacity, scrubbing, CDN pre-fill) or protect the existing
customers (shape it, and take the review).

### Marketing spend
Money in, customers... maybe out.

**How it works:** Spend on a channel; results arrive with a lag and a variance. **Channels saturate** —
doubling spend does not double customers. **The shape, stated:** each channel has a **saturation point**
past which incremental CAC rises steeply. **Paid search saturates fastest; affiliate next; referral has
a hard ceiling set by your customer count; content compounds slowly with no ceiling.** So **growth
requires adding channels, not adding budget** — the single most common mistake in subscription
marketing, and a great trap.
**The trap within the trap:** buying reputation. **Ad spend never moves Trust** (§6.1) — only behaviour
does. It moves **Visibility**, which raises funnel volume and nothing else. The player should try it
once and watch Trust not move.

### The insurance payout
After a disaster, the claim.

**How it works:** Covers some of the loss, arrives late, and premiums rise afterward. **Insurance is a
cash-timing instrument, not a solution.** And check the exclusions (§6.3) before you count on it.

### The refund wave
After a bad outage, a cluster of refund requests.

**How it works:** Granting them costs cash and saves reputation; refusing does the opposite. **A visible
tradeoff between two currencies that can't both be maximized.**

### The processor's rolling reserve is imposed
Not a termination — a slow squeeze.

**How it works:** After a chargeback spike or a risk review, the processor withholds a percentage of
card revenue for 90–180 days. It is not lost money, it is *frozen* money (§6.13), and the transition
cost is one-time but brutal. **The softer, earlier, more interesting version of processor termination.**

### The distributor credit hold
Your hardware supplier stops shipping.

**How it works:** Triggered by stretched AP (§6.13) or a credit-review event. Suddenly the capacity you
planned cannot be bought at any speed, which converts a cash problem into a **capacity** problem — and
it is the clearest demonstration that Trust-with-upstreams is a real currency.

### Covenant breach
Your lender takes an interest in your business.

**How it works:** Utilization stays high, EBITDA drops below the minimum, or an uptime covenant trips.
Consequences escalate: a waiver (fee), a forced asset sale, then control. **The only failure where
you're still profitable and still lose** (§6.10).

### The double-carry begins (a pivot event)
You commit to a second business while still running the first. See §6.14.

---

## 6.8 The metrics HUD

*The business dashboard. Every entry is a real operator metric; together they are the "second board"
the player learns to read.*

### The three-tier restructure (the fix that makes the metric wealth playable)
**Thirty-five metrics is a dashboard, not a HUD** — and §6.8's own closing rule ("nothing is on the HUD
that the player cannot act on") would cut most of them. **Three tiers, stated:**

- **HUD (always visible, hard cap of five or six live numbers):** **Runway** (or Cash), **MRR**,
  **Reputation/Trust**, **hands available**, **error budget remaining**, and **the current level's
  declared objective metric** (which is also the active scarce resource for that hosting line — kW in
  colo, GPU utilization in AI, deliverability in email, tick stability in game hosting).
- **Drawer (one click away):** everything else, organised as the seven blocks below, each block a page
  in the Ledger Drawer.
- **Postmortem (revealed only at level end):** the counterfactual metrics — Money Left On The Table,
  threats that got through unnoticed, the Near-Miss Ledger, the Decision Audit.

**The rule that reconciles the list with the principle — promotion on actionability.** A metric is
**promoted into the HUD temporarily** when it crosses a threshold where a player action exists, with a
small animation of it sliding up from the drawer, and it drops back when it recovers. Examples: runway
under 3 months, chargeback ratio approaching 1%, error budget under 20%, bus factor hitting 1,
absorption rate falling below build rate, AR 90+ crossing a threshold. **Threshold-driven promotion is
how you get thirty-five metrics into five slots, and it also teaches which ones matter.**
**The enforceable corollary:** **every HUD number must name its own action on hover.** `RUNWAY 2.1 MO`
hovers to `→ collect receivables · sell annual · delay hardware`. **If a number can't name an action,
it belongs in the drawer.**
**Tension:** ⚔️ Three lenses proposed HUD caps of five, six, and "cash/MRR/reputation + incident +
hands + objective." They agree on the principle and differ by one slot; pick five and let promotion
carry the sixth.
**Tension:** ⚔️ MRR is technically un-actionable and therefore excluded by the strict rule — see
§6.1's note. Ship the "things you are playing for" exemption explicitly, or the rule eats the score.

### The growth block
**MRR** (with net new = new + expansion − contraction − churn, drawn as the classic waterfall bar that
fills and drains each month), **ARR**, **NRR (net revenue retention)** — the one metric investors care
about, and **above 100% means you grow without selling**, which should be a celebrated achievement.
**Logo churn vs revenue churn** shown separately, because losing 20 hobbyists is not losing one
enterprise. **Gross churn vs net revenue retention** as a pair. **ARPU / ARPA.** **NRR per line** is
the useful version — **storage lines run 110–130%, shared runs 85–92%**, and seeing the difference
explains the whole industry in one chart.

### The margin block
**Gross margin per line of business** — the number that reveals your cheap line is subsidized by your
good one. **Contribution margin per plan tier, per cohort, and per channel.** **Revenue per employee.**
**Cost-to-serve per customer.** **EBITDA and EBITDA margin.** **Rule of 40** (growth % + margin %) as a
single elegant composite for SaaS-ish levels.

**Variations and additions**

- **The efficiency stat family** — **profit per U / per watt / per customer**. The operator's own
  dashboard, and the shortest path from "margin" to "which rack is the problem."
- **Rule of 40 as a gate, not a readout.** Growth% + free-cash-flow% ≥ 40 is world class — so use it to
  **gate the late campaign's investor and market events** (below the line, every round dilutes harder).
  It prevents the "spend everything to grow" degenerate strategy by **pricing strategy itself** rather
  than by capping spend.

### The acquisition block
**CAC by channel**, **CAC payback period in months (computed on gross margin, not revenue)**,
**LTV:CAC ratio** (under 3:1 is a warning), **conversion rate by channel**, **channel saturation
curves**, **time-to-first-value**, **free-to-paid and trial-to-paid conversion**.

**Variations and additions**

- **CAC/LTV as a per-breed HUD pair.** Show cost-to-acquire against lifetime value **per customer
  archetype**, so players optimize **which customer waves they *defend*** versus merely tolerate —
  implicit tiering as emergent strategy. **Score bonus for LTV:CAC > 3.** Late-game **whale CAC runs to
  tens of thousands** over a multi-quarter sales funnel, which is its own lesson about who you chase.
- **CAC payback as the core readout, with bands.** Acquisition cost ÷ monthly gross margin = **months to
  payback**. **Under 12 = an investor-patience buff; over 18 = "growth without funding" fails.** Show it
  **in the pricing console**, so every discount decision is viscerally expensive at the moment you make
  it.

### The cash block
**Cash balance broken into the six buckets** (§6.13), **runway in months**, **burn rate**, **AR aging
buckets (0–30 / 31–60 / 61–90 / 90+)**, **DSO**, **deferred revenue balance**, **credit line
utilization**, **covenant headroom**, **cash conversion cycle per line**, **minimum cash balance
reached this level**.

### The risk block
**Chargeback ratio with a hard red line at 1%**, **customer concentration** (top customer % and top 10
%), **security posture score**, **compliance status per certification with expiry dates**, **insurance
coverage vs exposure**, **bad debt %**, **refund rate**, **involuntary churn %**, **abuse tickets per
1,000 accounts**, **contract-term-vs-financing-term mismatch**, **key-person / bus factor exposure**.

### The obligation block
**SLA meter per contract with live accruing credits**, **uptime this month vs committed**, **error
budget remaining** (the elegant one — a budget you may *spend* on risky changes, and when it's
exhausted you may only do safe work; promoted to the spine in §6.1), **contractual commitments coming
due**, **committed-out obligations (take-or-pay)**, **weighted average remaining contract term
(WARCT)**, **contracted revenue %** (what fraction of MRR has more than 12 months left).

### The operations block
**MTTD and MTTR shown separately** (detection is a different problem from repair), **change failure
rate**, **toil ratio** (% of staff time on manual repetitive work — **the number that justifies every
automation purchase**), **bus factor** (below 2 is flashing red), **ticket backlog and first-response
time**, **escalation rate**, **PUE**, **WUE and carbon intensity**, **capacity headroom per resource**,
**utilization % per resource** (racks, power, cores, RAM, storage, GPU-hours), **absorption vs build
rate** in facility lines.

### The revenue-quality block (new)
**Revenue Quality composition bar** (§6.1's colour bands), **contracted revenue %**, **WARCT**,
**revenue by source/commission load**, **payment-method mix** (card vs ACH vs wire vs crypto),
**prepay mix**. **These are the two or three numbers that separate an asset from a rumour**, and none
of them exist in a conventional tycoon HUD.

### The satisfaction block
**NPS / CSAT** (feeds the referral lane), **review score**, **first-response and resolution time**,
**exit-survey reason codes**.

### The rule of the HUD
**Nothing is on the HUD that the player cannot act on.** Everything else lives in a drawer.
**Applied harder, per the CEO lens:** NRR, LTV:CAC and DSO are *drawer* metrics reviewed monthly, not
HUD metrics. **Cash/runway, MRR, reputation, hands, the error budget and the SLA/credit meter are the
only business numbers that belong on screen during play.**

### The Death-Spiral Diagram (a HUD element that draws the loop)
When two negative loops are reinforcing, the HUD draws the loop explicitly.

**How it works:** A small node-and-arrow diagram appears naming the cycle — *"Outage → Credits → No
cash → No fix → Outage"* — with the current strength of each arrow. **Players should be able to *see*
they're spiraling in time to break it** with a drastic action (fire customers, take a loan, shed a
business line, declare a planned outage). **A losing game you can fight is worth more than a losing
game you can only watch.**
**Interacts with:** §6.10's mass churn cascade, §6.11's shrinking instruments, §7.7's exits.

### The Concentration Donut (and its agreement with the floor)
The whale is visible as a shape, not a percentage.

**How it works:** A donut chart of revenue by customer, top-10 named. **Extend it into the world:**
tenant tint intensity on the board is proportional to revenue share, so **the whale's racks are the
most saturated things in the room** and you can feel the concentration without opening a chart. **The
donut and the floor must agree.**

**Variations and additions**

- **The concentration penalty meter, with thresholds.** Track **% of MRR in the top customer, the top 3,
  and the top channel**; crossing a threshold fires the **"single point of failure" warning** real
  operators quote as a bankruptcy line. Diversification is rewarded with a **"portfolio health" star**
  in the final rating, so the donut has a score attached and not only a shape.

### The Cohort Wall
Retention rendered as a heat grid.

**How it works:** Rows are signup cohorts, columns are months since signup, cell colour is retention.
**A steep fade is instantly, viscerally wrong in a way a percentage never is.** Cells use the per-cohort
patterns so you can see **which channel** is fading, and hovering a row highlights those customers on
the board. **The wall and the world must be the same data.**

### The Obligation Rail
The future as a visible object, which is what a 90-day-lag design needs.

**How it works:** A horizontal rail of everything you owe and everything coming due — payroll stamps,
invoices, audit seals, contract renewals, commit true-ups, financing payments. Items are **colour-
neutral but shape-coded**, and the **90-day-lag consequences are drawn in the dashed-white Intent
layer** to distinguish "things you owe" from "things you caused."

### The Cost-of-Downtime Dashboard (ghost money)
The live counterpart to §6.9's postmortem-only *Money Left On The Table.*

**How it works:** A **parallel HUD trace of the revenue you are losing right now** to slowness, blocks
and bounces — which turns every defensive overreach into **visible counterfactual cash while you can
still act on it.** On hover, a blocked customer shows **the contract they would have signed.**
**Why it earns HUD space under §6.8's own rule:** it names its action by construction — the number goes
down when you loosen a rule, add capacity, or fix a latency path. **The late game's most persuasive
spreadsheet, and the one investors demand.**
**Interacts with:** §6.9 Money Left On The Table (the same quantity, resolved at level end), §6.9 the
Traffic Sankey's amber `BLOCKED IN ERROR` branch, §6.15's Incident Cost Meter.

---

## 6.9 Scoring and end-of-level rating

### The four-axis scorecard — and the reweighting that makes it teach the pillar
The core rating, avoiding a single misleading number.

**How it works (base):** **Uptime / Availability** (were you up?), **Performance** (were you fast?),
**Profitability** (did it pay?), **Growth / Customers Served** (did you get bigger?). Some lenses add a
fifth: **Resilience** (would you have survived one more thing?), **Trust/Reputation**, **Integrity**,
or **Preparedness**. Each level weights them differently.
**Default weights, stated:** Uptime 30 / Performance 20 / Profitability 30 / Growth 20, with a
**fifth per-type axis worth 20 that displaces the others proportionally.**
**Grade bands, stated:** **S ≥ 92 · A ≥ 82 · B ≥ 70 · C ≥ 58 · D ≥ 45 · F below.**
**Publishing the weights before the level — on the Statement of Work — is what makes the scoring a
target rather than a verdict.**

**⚔️ Tension (the most important disagreement in §6, and it must be resolved deliberately):**
**Uptime leads, which contradicts the design pillar "the reward is letting things through, not
shooting down."** If uptime leads the card and the Attacker Ledger gets its own panel, players will
optimise for throttling everything into safety — because they optimise for what's on the card. The
game-design lens proposes: **Conversion (Served / Arrived) 35% · Profitability 25% · Resilience 20% ·
Growth 20%**, with **Uptime folded into Conversion** (downtime is simply the most extreme way to fail
to serve), and **Headroom** + **Drills** as the two named components of Resilience so peacetime work is
directly scored. The stated consequence: **a level survived with 100% uptime and 30% conversion should
score worse than one with two brief outages and 88% conversion.**
**Both weightings are preserved here. Ship one; do not ship both silently.**

**A second reframing that both camps accept:** **measure availability against commitment, not raw
uptime.** Raw uptime rewards luck. "Did you hit the SLA you sold?" plus **error budget consumed**
rewards judgement. **A player who ran at 99.95% having sold 99.9% should score better than one who ran
at 99.99% having sold 99.99%** — the first had headroom to spend; the second was lucky.

**Per-type reweights, stated (examples):**
- **Colo:** Uptime 25 / **Occupancy 30** / Profit 30 / Tenant satisfaction 15.
- **Backup / DR:** **Durability 40 / Restore-success 30** / Profit 20 / Growth 10.
- **Game hosting:** **Tick stability 35** / Uptime 20 / Growth 25 / Profit 20.
- **GPU / AI:** **Utilization 30** / Margin 30 / Contract-term coverage 20 / Growth 20.
- **Email:** **Inbox placement 35** / Uptime 20 / Growth 25 / Profit 20.

**Variations and additions**

- **The end-level grade, five ways it has been proposed.** (a) **Uptime × Revenue × NPS** with a radar
  chart and a **"churned-customer ghost parade"** of everyone you lost walking off-screen — guilt
  metrics. (b) A **star system**: 1★ survive · 2★ profit target · 3★ zero-churn-from-downtime plus a
  status-page-green streak, over tracked stats (uptime %, MTTR, ticket backlog, NPS, EBITDA). (c) Three
  **independent axes** — Uptime / Profit / Retention (+ CSAT) — with **star-gates that force replay
  diversity.** (d) A **Trustpilot-style generated review page** assembled from the customers you actually
  served, with achievements *"Five Nines," "Profitable Paranoia," "Clean Getaway."* (e) The same review
  page as a **parody hosting-review site** — uptime %, incidents, churn, **"cable tidiness"** — with an
  auto-generated sardonic review line: *"Two nines, one ransomware, and frankly the cabling — 2/5."*
  **Synthesis: keep the 3–4 axis core; present it as the review page.**
- **The SaaS metrics layer.** Grade **churn % and NRR** (net revenue retention ≥ 100% means upsells
  outran churn — the real SaaS gold standard), gross margin, and incident count. Treat **NRR as the
  master grade**: cohort expansion ÷ (lost + downgrades); **>110% is an A regardless of raw churn;
  <95% means the funnel is a leaky bucket no marketing spend can fill.** **Revenue quality weights the
  mix** — recurring > metered-with-contract > one-time > prepaid-breakage > spot — so **$10K of sticky
  DNS MRR beats $50K of migration consulting.**
- **The Health Check.** Grades **A–F** across uptime-vs-SLA, churn, NRR, gross margin, incident count
  and concentration. **A/B unlock franchise perks; F triggers a down round.**
- **The Operator's Scorecard, with named grades.** MRR growth · churn/NRR · EBITDA margin · support CSAT
  · uptime record · abuse incidents · cash discipline — scored as **"Bootstrapper's Bronze,"
  "Hyperscaler Silver," "Boutique Gold," "Term Sheet Platinum,"** each with a one-line CEO commentary
  per stat. **The report card that teaches.**
- **Axes are level-weighted (the anti-stagnation rule).** Three axes each **0–1000**, combined with
  per-level weights — **Black Friday is profit-heavy, healthcare is reputation-heavy, the hurricane
  level is uptime-only** — so players optimize *different things per level* instead of one build.
- **A balanced scorecard of *styles*.** 1–5 stars per axis — 💰 margin · 📈 growth · 🛡 uptime-vs-SLA ·
  🧡 support — where **you can win with zero growth stars and five margin stars.** *"The boring
  profitable host" is a legitimate winning style:* **"You built a small, great company"** versus
  **"You grew like hell and burned out."**
- **Grades with consequences, expressed as fiction.** **F = the company is sold for parts** (a narrative
  loss); **S = a "gold-anniversary" bonus unlock**; the letter grade unlocks a narrative epilogue
  ranging from *sold to a scraper* to *featured on a podcast*. **Score is fiction, which sticks better
  than points.** An **"Operator Tier" composite** (Mom-and-Pop → Regional Player → Tier-3 Operator)
  gates the next campaign act.
- **Extra axes worth carrying.** **Tech debt counts against the composite** ("you can win messy") ·
  **churn as a graded stat** with the ghost parade · **LTV chosen well** (*high scores come from
  choosing your customers well, not only from surviving the hardest build*) · customer satisfaction ·
  **a PUE/Carbon fourth axis** (energy efficiency of everything served: ESG contracts refuse you above
  thresholds, and a yearly **"Green Tier" leaderboard** means the lazy-but-warm datacenter punishes you
  *forever*) · **"how you treated customers under stress"** (transparency and honesty scoring) ·
  **incident-survived milestone bonuses** (a full 99.99% window = a reputation surge; a clean launch = a
  big payout).
- **The Donut of Death.** Customers served perfectly (reached core, retained past wave X) drawn against
  **the donut of those who churned at the last meter** — the visual of near-miss loss, and brutally
  motivating.
- **Fold the SLA axis into the star axes.** They both measure uptime and are redundant as separate
  lines. **SLAs set the *targets*; stars grade you *against the targets you signed*** — so "5-nines
  difficulty" means *you chose the hardest contract*, not that an invisible stat moved.

### What the headline score is — *CONFLICTING*

Both documents agree the level must resolve into *something* at the end. They disagree on **whether
there is one number at all**, and if so, **what it is made of**. This decides the shape of the entire
end-of-level screen, what the campaign's meta-progression can even measure, and whether "the boring
profitable host" is a valid win or a mediocre one.

#### Position A — no single number: normalized axes plus a valuation that lives above them *(master)*

The core rating is **multi-axis, deliberately avoiding a single misleading number** — Uptime /
Performance / Profitability / Growth with a per-type fifth axis, default weights **30 / 20 / 30 / 20**
plus a fifth worth 20, and stated grade bands **S ≥ 92 · A ≥ 82 · B ≥ 70 · C ≥ 58 · D ≥ 45 · F below**.
(The conversion-first reweighting — **Conversion 35 / Profitability 25 / Resilience 20 / Growth 20**,
with uptime folded into conversion — is an *internal* dispute within this camp and is preserved in the
entry above.) A single number *does* exist, but at a different altitude: **Company Valuation is the
campaign meta-score** (§6.9), not the level score, and it is deliberately kept off the per-level card so
that level play is not optimised against a stock ticker.

#### Position B — one number, and here are five candidates for it *(opencode)*

- **The axis set, as a *presentation* rather than a score.** No single number: 3–4 normalized axes plus
  stars, presented as the review page. Level-weighted sums and per-axis star gates are variants *within*
  this camp. *(This is the position closest to A, and is listed here because opencode frames it as one
  candidate among five rather than as the default.)*
- **Company Valuation as the master score, during play.** Revenue multiple × uptime reputation × risk
  discount — *"the whole game compresses into one number that lurches and swings like a stock ticker,
  which IS the HUD's spine."* Every defense purchase lowers cash (−) and incident risk (+). At
  datacenter scale the final grade is literally your **exit number** (ARR multiple × growth ×
  concentration/churn risk penalty). Endless mode condenses to a **running valuation = revenue ×
  multiple + uptime reputation − tech-debt liability**, displayed everywhere as a ticker, while story
  levels still star on three axes.
- **The product formula.** **Score = Growth × Stability × Margin × Reputation**, graded D–S, with medals
  per criterion and **stars awarded only if all four clear the bar** (a product, not a sum, so one zero
  is fatal). Endless leaderboards run on **net-worth-at-collapse.**
- **The unified proposal.** Three axes each normalized **0–1 against the level's own targets** — which
  fixes cross-era comparability — **stars = floor of the minimum**, plus a hidden fourth **Craft score**
  (cable tidiness, clean deploys, postmortems filed) that gates the fanciest cosmetics and valuations.
  Review-page presentation unchanged.
- **The single derived sentiment.** **Score = "NPS of the board"** — how many customers would recommend
  you, derived from happy-served / bounced / breached. Everything feeds one sentiment number.

### Score the conversion rate first
The headline score of every level is **Served / Arrived** — the percentage of legitimate demand that
reached the goal node.

**How it works:** Threats blocked is a *secondary* stat, shown smaller. This is the mechanism by which
the design's stated pillar actually reaches the score screen; without it, the pillar is a guardrail
nobody is graded against. The Launch Day trap becomes the general rule.

### The Nines
The headline availability stat, presented as nines rather than percent.

**How it works:** 99.9% = three nines = **43 minutes of downtime a month**. 99.99% = 4.3 minutes.
99.5% = 3h 39m. **Showing the minutes next to the nines is what makes the concept land.** Presented
annually as well — 99.99% = 52 minutes a year — and **watching that yearly budget drain is inherently
dramatic.**
**Visual:** the **Nines Meter** — physical nines carved into a post (99 / 99.9 / 99.99) with your
result as a painted line. Simple, iconic, instantly comparable across levels. Alternatively a
**Nine-Pip Rack Rating** — a row of illuminated pips.

### Perceived vs actual reliability
Two uptime numbers, and the gap between them is your observability quality.

**How it works:** **Measured uptime** (what your monitoring saw) and **experienced uptime** (what
customers actually got, including things you didn't monitor and partial failures you called
"degraded"). The gap is drawn as a bar. **A level scored at 99.99% measured and 99.6% experienced is a
specific, diagnosable failure** — and it is the reliability version of the Compliance Theater Meter.

### Detection quality
Of the incidents that occurred, who found them first?

**How it works:** Fractions detected by **you** / by a **customer** / by a **third party** / **never**.
**"Found by customer: 4 of 7" is the most damning line the score screen can print**, and it is the
number real operations teams actually track.

### The Uptime Ribbon
A per-level strip showing every second of the level colour-coded by health.

**Visual:** a long thin bar; green for healthy, amber for degraded, red for down, with incident markers
drawn using the **scenario icon family** rather than generic pips, so the ribbon reads as a narrative.
**Add a second, thinner lane beneath it for business events** — a whale signing, a price change, a
launch, a payroll date — **so cause and effect line up vertically.** **One glance tells the whole story
of the level** and it's a perfect share image.

### The Incident Timeline Strip
A horizontal film strip of the level's incidents as small thumbnails.

**How it works:** Scrub it after the fact and watch your worst moments. Also the raw material for the
auto-generated end-of-level comic.

### The Traffic Sankey
Where did everyone go?

**Visual:** one thick inbound ribbon splitting into five: `SERVED` (cyan, largest), `QUEUED→SERVED`
(cyan, thinner, clock glyph), `BOUNCED` (grey), `BLOCKED` (magenta), **`BLOCKED IN ERROR` (amber)**.
**The amber branch is drawn last and on top, crossing the others, so it is always the branch your eye
follows.** Each branch labelled with a count **and a dollar figure**, and each using the same **bounce-
cause vocabulary** as the in-world tags. **The false-positive stream is the one that hurts**, because
you blocked paying customers, and the Sankey is the only readout that makes that visible.

### The Attacker Ledger
What the threats cost you and what they cost them.

**How it works:** Per threat type: attempts, blocked, landed, damage, and time-to-detect. Plus a
**"threats that got through and you never noticed"** count, revealed only at the end. **Nothing is more
chilling than a non-zero number in that row.**
**Make it actionable as well as chilling:** each un-noticed threat should name **the specific
monitoring purchase that would have caught it**, offered at the post-incident discount. **Dread plus a
door.**
**Render it properly:** that row is **the last thing to appear on the score screen**, after a beat, in
a different treatment — **a stamp, not a number** — and the threats are listed as **Codex silhouettes
you haven't unlocked.** You're being told something got in and you still don't know what it was. **A
far better use of the unknown-state art than a count.**

### Money Left On The Table (three columns, not one number)
The counterfactual revenue.

**How it works:** **Column 1 — didn't earn it:** revenue you would have had if nothing bounced, was
blocked in error, or queued past patience. **Column 2 — didn't bill it:** revenue leakage (§6.13) —
services delivered and never invoiced. **Column 3 — didn't collect it:** bad debt and write-offs.
**Three columns is a complete and quietly devastating readout**, and it **frames failure as opportunity
cost rather than punishment**, which is kinder and more motivating.
**Break column 1 into causes so it is diagnostic:** lost to latency / lost to errors / lost to **your
own false positives** / lost to capacity / lost to never arriving (reputation). **The false-positive
slice is rendered in the same amber as the in-world false-positive flash**, closing the loop between
the moment and the accounting.
**Visual — negative space:** the revenue bar is drawn at the height you *achieved*, with a **ghosted
outline extending above it** to the height you could have reached, and the gap **filled with the
bounce-cause glyphs in proportion.** **The missing money has a silhouette, and its composition tells
you which system to fix.**

### The Leak Report
The unbilled half of the above, given its own page.

**How it works:** How much revenue you earned and failed to invoice — unbilled overage, un-provisioned
upgrades, add-ons delivered free, expired promos never converted, cancelled services still running.
Model as **0.2–0.5%/month accumulating**, capped by whatever Revenue Assurance you've built, and
running **2–5% of MRR at any given time in an unmanaged operation.**

### Blast Radius Rating
How concentrated was your risk?

**How it works:** Score the maximum number of customers a single failure could have taken out. Rewards
architecture, not just survival — **you can win a level and still get a poor blast-radius grade, which
tells you the win was luck.**

### The "Would You Have Survived" Simulator
An end-of-level resilience probe that converts an observation into a test.

**How it works:** After scoring, the game runs your final topology against **five hypothetical failures
you didn't experience** — a rack loss, a transit loss, a DB loss, a key-staff loss, a region loss — and
reports which you would have survived. **A resilience score derived from your architecture rather than
from your luck.** This is also the "Resilience" axis's honest implementation: **you are graded on the
disaster that didn't happen**, which is the only way to make defensive play feel good.

### Preparedness score
Scored from what you had ready **before** you needed it, and **independently of outcome**.

**How it works:** Tested restores, exercised failovers, current runbooks, spares on hand, break-glass
tested, config backups current, lead-time orders placed early, drills run. **A player who prepared well
and got unlucky is told so** — which is both fairer and truer than scoring on uptime alone. Pairs with
the level-end stat **"decisions made under lead-time pressure"** (§6.1).

### Rebuildability index
Fleet-average hours-to-rebuild.

**How it works:** A single number summarizing technical debt **in a way an engineer will immediately
respect.** Falls when you automate, document, and standardize; rises with every snowflake.

### Near-miss ledger
Things that almost happened.

**How it works:** The second drive that failed two days after the rebuild finished. The circuit you
ordered three weeks before you needed it. The breaker that peaked at 79%. The backup that succeeded on
its last retry. **Surfacing luck explicitly** is a wonderful, humbling score element, and it makes the
Blast Radius Rating land much harder.

### Toil hours
Total hand-time spent on repetitive manual work, shown **next to the automation you could have
bought.** The bluntest possible argument for the boring purchase.

### Par time to detect / par time to repair
Benchmarks with a face.

**How it works:** For every incident type the game holds a par MTTD and MTTR (authored, or derived from
aggregate play). Your result is shown against par with a note on what would have moved it. **Turns two
abstract acronyms into a golf score.**

**Variations and additions**

- **MTTR as a silent scorekeeper.** Track mean-time-to-recovery **per incident type, invisibly**, and
  let a low figure unlock the **"Boring Infrastructure"** achievement. ***Boring is winning*** — and
  saying so with an achievement rather than a tooltip is what makes it land.

### Cost per served unit
The one number that lets you compare a colo line to a shared line honestly.

**How it works:** Dollars per thousand requests / per player-hour / per GB restored / per GPU-hour
delivered / per mailbox / per pass, **per line.** The operational twin of gross margin.

### Revenue per kW, per rack unit, and per engineer
The three unit-economics numbers real operators actually manage.

**How it works:** **$/U/month** (is this line worth the space?), **$/kW/month** (is it worth the power?
— at Tier 4+ this matters far more), and **revenue per engineer** (is it worth the *attention*? — the
real constraint). **A GPU line can be brilliant on $/U and terrible on $/kW; shared hosting is the
reverse; a managed line looks great on both and destroys you on revenue-per-engineer.** **Three numbers
that make the portfolio decision mathematically interesting instead of vibes-based**, and $/sq ft makes
a lovely **spatial heat map over your floor plan.**

### The Externality Score
What you did to everyone else.

**How it works:** A fifth axis on every scorecard: outbound abuse originated from your network,
amplification attacks you reflected, spam delivered, DMCA notices unactioned, carbon emitted, water
consumed. **You can win a level and be a bad neighbour, and the game should say so without lecturing.**
Feeds directly into Trust-with-upstreams (§6.1) so it has teeth rather than being a moral.

### The Decision Audit
Three decisions, scored — not graded, *explained*.

**How it works:** At level end the game surfaces the **three moments that mattered most**, measured by
counterfactual impact in the simulation, and shows what you chose, what the alternatives would have
produced, and how confident it is. **It answers "what should I have done differently" directly**, which
is the question every strategy-game player has and almost never gets answered.

### The Attribution Ledger
The mechanism that converts delayed consequence from noise into a lesson.

**How it works:** Every delayed consequence is **stamped with its cause at creation time**, invisibly,
and the ledger reveals the chain when it lands: *"Churn +6 this month. Source: support headcount cut,
89 days ago."* Over a campaign it becomes a searchable history of your decisions and their actual
outcomes, **sortable by "biggest surprise."**
**Why it is essential:** a 90-day lag with no attribution is **indistinguishable from randomness**, and
players will read it as the game being arbitrary. This is the single mechanic that makes the design's
most distinctive claim survivable.
**Visual — the Retro-Thread:** when the postmortem shows a delayed consequence, it animates a thin
dashed Intent-layer thread back along the Timeline Ribbon to the decision that caused it, ninety
in-game days earlier. **The lag has no visual anywhere else in the document and this is where it
belongs.**

### The letter grade and the derived flavour title
A grade plus a title with personality.

**How it works:** S/A/B/C/D/F, plus an earned title. **The title should be *derived*, not selected from
a list** — generated from your two most extreme axes. High uptime + low profit = **"Immaculate and
Broke."** Low uptime + high growth = **"Selling Faster Than We Can Serve."** High everything + high
externality = **"Profitable, Reliable, and Somebody Else's Problem."** Also in the pool as authored
seeds: *"Barely Held It Together," "The Quiet Month," "Profitable and Terrified," "Five Nines, Zero
Sleep," "Technically Solvent."* **A title generated from your own numbers is far more shareable than
one drawn from a list, and the combinatorics are free.**
**Visual — the Grade Stamp:** the grade is a **rubber stamp slammed onto the postmortem document**,
off-register, with the flavour title **hand-written beneath in the Handmade layer** (someone wrote it
on your report — which is what makes it feel like a verdict rather than a system message). S-grade uses
gold foil; F uses a smudged, half-inked impression. **0.4s, a physical thud, and it gets the animation
budget, because the screenshot people post is the stamp.**

**Variations and additions**

- **Grade Stamps on the building itself.** The three-star grade lands as **enormous rubber stamps
  slamming onto the facility** — **UPTIME / PROFIT / RETENTION** — each one shaking the camera once, and
  **the stamps remain as decals on your facility through replays.** The Grade Stamp above lands on the
  document; these land on the world, and both can ship.

### The Report Card
End of level as a single physical sheet with embossed stamps.

**Visual:** uptime grade, margin grade, growth grade, security grade, customer-sat grade — each stamp
thunking down in sequence with a sound. **No spreadsheet, one page, heavy paper texture.**

### Four analog dials — and the sequencing that resolves the three-presentation conflict
**Visual:** four needle gauges — Uptime, Margin, Growth, Trust — that sweep up to their values with a
physical wobble. Diegetic, satisfying, readable in one glance. A fifth dial for **cash conversion
cycle** is worth adding.
**⚔️ Tension resolved by sequence:** the dials, the four-axis bars and the letter-grade stamp all
competed for the same screen. **Order them:** the **dials are the hero image** (they animate, they're
satisfying, they're what you look at), the **four-axis bars are the detail beneath them**, and the
**letter-grade stamp lands on top of both at the end.** Three presentations, one sequence.

### The Instrument Cluster (one bezel, many faces)
The shared industrial design that keeps ~25 per-line signature meters from looking like a flea market.

**How it works:** Every signature meter shares a housing — a 44mm circular or 120×28 rectangular
bezel, the same material, tick weight, needle/fill colour rules, and label plate. **Only the face
changes:** a pendulum (tick rate), a clamp-meter needle (amps), an hourglass (RTO), a candle (p99
steadiness), a postmark stamp (email reputation), a fill gauge (durability), a dual-needle crossing
gauge (crypto), a checklist plate (compliance coverage), a closing wedge (satellite pass), a density
comb (shared hosting). **Twenty-five faces in one housing family reads as a designed instrument panel;
twenty-five bespoke widgets reads as chaos.** This is also how the score screen's hero dial swaps per
line while staying one asset.

### Per-line scorecard reweighting
The score screen is skinned per hosting type.

**How it works:** The backup level's card leads with **restores tested and restore success rate**; the
game-server level leads with **tick stability and rage-quits**; the email level leads with **inbox
placement**; the colo level leads with **occupancy and cross-connect count**; the GPU level leads with
**utilization and contract coverage**. Same axes underneath, different face — **and the "different
face" is literal**, via the Instrument Cluster above. **Cheap to build, enormously effective at making
types feel distinct.**

### The Board Review (the alternative framing)
The end-of-level screen as a slide-deck board meeting.

**How it works:** Graded areas — *Growth* (net new MRR, logo count, NRR) · *Profitability* (gross
margin, EBITDA, Rule of 40) · *Efficiency* (CAC payback, utilization, cost per ticket, PUE) · *Risk*
(concentration, WARCT, abuse rate, single points of failure, insurance coverage, key-person exposure,
compliance status) · *Reputation* (NPS, public incidents, review score) · *Cash Discipline* (minimum
cash balance reached, days of runway, covenant headroom). Each area gets a letter grade and **the board
gives a one-line comment in character**: *"Growth is fine. Your top customer is 41% of revenue. Fix
that or we will."*
**⚔️ Tension:** this and the Report Card and the four dials are three different end-screen metaphors.
They can coexist as **modes tied to your financing** — a VC-backed run gets the Board Review, a
bootstrapped run gets the Report Card, an operator-focused run gets the postmortem — which turns a
conflict into characterization.

**Variations and additions**

- **The earnings-call ceremony.** Deliver the end-level report **as an earnings call**: the status-page
  narrator reads your numbers aloud, a tiny press-pool sprite types furiously, the "stock" ticker
  settles. **The same three-star data performed as theatre**, and a shareable artifact at the end of it.
- **The plain variant, which must also exist.** A **simple, readable End-of-Level P&L Summary** —
  revenue, bandwidth cost, salary, incidents — so that the many economy systems **resolve into one
  comprehensible number** instead of staying scattered across meters.
- **The open design question this raises, stated rather than resolved:** *which stats deserve permanent
  HUD real estate* (Cash, Reputation, Pressure?) **versus summary-only visibility** (true-up billing,
  storage cost creep, overprovisioning waste)? §6.8's three-tier restructure is one answer; the
  question is worth re-asking per act.

### The postmortem screen
The end-of-level debrief as a document.

**How it works:** A timeline of the level with incidents marked, the three biggest cost drivers, the
one decision that mattered most, churn reasons, incidents by cause, MTTR, revenue by line, **the three
most expensive mistakes**, a generated **"post-mortem headline,"** and the unlock choices generated
from what went wrong. **Turns the score screen into the progression screen**, which is elegant and
saves a UI. Carries the Retro-Thread and the correlated-failure causality drawing.

### The Efficiency Frontier
A score for elegance — outcome per dollar, plotted against a par curve.

**How it works:** Beating the curve earns medals; massively over-building to win earns a **"Bought It"**
tag. **Crucially, the frontier is shown *during* play as a faint line on your spend graph**, so
over-building is a visible choice rather than a post-hoc scolding. This is the mechanism that makes
"no pure upgrades" bite: **buying more of everything becomes legibly bad.**

### Par and efficiency medals
Optional mastery scoring.

**How it works:** A par build cost and par hand-count per level; beating it earns medals. Rewards
elegant solutions over brute force and gives expert players a reason to replay a level they won.

### The medal / star roster
Specific feats, each naming a behaviour worth having.

**How it works:** *Zero-Touch* (no manual emergency intervention) · *Clean Sheet* (no customer-visible
downtime) · *Frugal* (objectives under a capex cap) · *Honest Broker* (never lied on the status page,
never hid an incident) · *Antifragile* (finish with higher resilience than you started) · **No Heroes**
(no staff member exceeded fatigue threshold — a pointed anti-crunch achievement) · *Restore Verified*
(proved a restore actually worked) · *No SLA Credits Paid* · *Never Oversold* · *Fired Zero Customers*
· *Survived On One Carrier* · **The Boring Win** (nothing happened, everything worked, you made money —
**the highest honor in ops**).
**Star ratings per level** on several axes so you can replay for different stars: **Uptime, Profit,
Growth, Reputation, Efficiency (PUE / cost per unit), Safety (no incidents)** — with clearly stated
thresholds.

### Scored Retreats
Shrinking well is a strategy, not an admission of failure.

**How it works:** Shedding a business line, firing a whale, declaring a planned maintenance outage,
exiting a market, or migrating customers off a dying platform should all be **legitimate scored
strategies** with their own medals for execution quality. **Give medals for well-executed retreats** —
otherwise the only scored verb is "grow," and the game teaches the wrong lesson about the industry.

### The Streak Ladder
Long-horizon achievement with escalating stakes.

**How it works:** Consecutive days without an SLA breach, a data-loss event, a security incident, a
missed backup window, or a reliability-driven churn. Each streak has its own counter and reward tier
(better financing, better customers, better hiring, an insurance discount). **Breaking one hurts more
the longer it ran**, creating real earned dread — and the game should let you see other players'
streaks.

### The Customer's Scorecard
Being graded by the people you serve.

**How it works:** At level end, three of your named customers each produce a one-page assessment of
you — uptime as *they* experienced it, support responsiveness, value for money, whether they will
renew. **They disagree with each other and with your dashboard.** **A score written in the second
person is worth ten written in the third.**

### Star ratings as real reviews
Reputation rendered as customer reviews with text.

**How it works:** Generated from what actually happened to that customer, in their voice. *"Was down
three hours on a Tuesday. Support was honest about it. Still here."* **The best reputation display in
the document because it's specific.**
**Visual:** each review card carries the **customer portrait**, the **date and tenure** (a 1-star from
a four-year customer looks nothing like a 1-star from someone who signed up last week), and is set in
the **Doc typeface on a review-site-looking card, not in UI chrome** — they're somebody else's
publication.

**Variations and additions**

- **The review page as the whole score screen.** Present the end-of-level card as a **parody
  hosting-review site**: uptime %, incidents, churn, **"cable tidiness,"** and an auto-generated
  sardonic one-liner. **The scoring screen IS the world's UI**, which is why this presentation keeps
  winning over a spreadsheet.
- **Name the worst incident in the paragraph.** *"1.5★ — kept getting locked out by ransomware."* The
  specificity is the whole mechanic.

### Score = Status Page
The end-of-level grade rendered as **your own public status page.**

**How it works:** **All-green = A; scattered red = D**, with the level's actual incidents listed in the
same language your customers read during play. **Players want to screenshot it**, which is the whole
point of a score screen. **Per-era skins** apply — the dial-up act's status page is text-only.
**Where it sits among the other end-screen metaphors:** it joins the Report Card, the Board Review and
the four analog dials as a fourth framing. Per the §6.9 tension, these are best shipped as **modes tied
to your financing and your line** rather than stacked — the status page is the natural default for an
operator-focused or self-serve run.
**Interacts with:** §6.9 star ratings as real reviews, §6.9 the Report Card, §7.x the in-world status
page (same asset, different day).

### The Wall of Ghosts
Customers you lost, listed by name with why they left.

**Visual:** small greyscale portrait cards in a grid, pinned and slightly crooked, each with name,
tenure, and their **exit-survey quote in their own voice**. Hovering restores their colour for a
moment. **A card for a customer you *saved* and later lost anyway has a small repaired tear.** **Deeply
effective and slightly cruel**; the churn-reason text is where the writing pays off.

### The Blueprint Card
End-of-level as a collectible spec card of the architecture you actually built.

**Visual:** your topology drawn in blueprint style with its stats in a title block. **Encourages
architectural pride** and makes builds shareable.

### The Grade Curve Portrait
Scores also expressed as a generated "company portrait."

**Visual:** a stylized illustration of your facility as it ended — its actual rack count, its sky
colour, its sign, its scars. **A shareable image at zero extra art cost beyond the renderer you already
have.**

### The Sankey Payoff
One dense, beautiful chart at level end: visitors in → served / bounced; revenue → costs → profit,
drawn in the reserved palette. **The one place a chart is more satisfying than a metaphor.**

### The Trophy Shelf
Level awards as physical objects in your office that persist.

**Visual:** a bent drive mounted on a plaque, a first-dollar bill in a frame, a melted optic, a signed
tournament jersey from the game-hosting level. **Your office becomes a museum of your campaign.**

### The comparative ghost run / Par Ghost
Replay against your own or a friend's previous attempt.

**How it works:** A ghost line on the uptime ribbon, the incident timeline and the money curve. Each
level also ships a **"par" run rendered as a faint ghost**, so you can see where you diverged from a
competent operator. **Competition without multiplayer.**

### Endless-mode scoring
No stars to earn — **only bragging.**

**How it works:** A **weekly leaderboard on (uptime × profit) at day 7.** Each incident survived adds a
**visible scar on your datacenter** and a score bump, so the building itself becomes the score history.
Post-level, the screen becomes a **Grafana wall of the run**, and the score is **a printed report handed
over like a receipt, with a QR code that decodes to the run's topology** — humour and shareability in
one object.
**Interacts with:** §6.9's running-valuation variant (see the headline-score conflict above), §6.9's
Streak Ladder, §6.15's Dot-Matrix Ledger (same printer, longer paper).

### Company Valuation (the campaign meta-score)
The number that ties the campaign together.

**How it works:** MRR/ARR × a multiple, modified by growth rate, NRR, churn, concentration, margin,
reputation and infrastructure quality. **Makes "ugly profitable" and "beautiful unprofitable" both
losing strategies.** The endgame is an acquisition offer whose size is your final score — **and you may
refuse it and keep playing endless.**

### Per-line valuation bases (because real buyers don't use one multiple)
**The correction that gives the meta-score teeth.**

| Line | Valued on | Typical range | What moves it |
|---|---|---|---|
| Shared / VPS book | EBITDA multiple, or monthly-revenue multiple | 3–6× EBITDA / 10–18× monthly revenue | churn rate, prepay mix, platform age |
| Managed / cloud services | EBITDA or ARR multiple | 6–12× EBITDA | NRR, gross margin, contract length |
| Colocation | **NOI and cap rate, like real estate** | 6–9% cap rate (≈11–16× NOI) | lease term remaining, tenant credit quality, power capacity, carrier density |
| Wholesale DC | contracted backlog + development pipeline | per-MW valuations | signed leases, power secured, land |
| GPU / AI | contracted backlog + hardware residual | highly variable | contract term, counterparty credit, card generation |
| Bulletproof | effectively unsellable | — | no buyer will inherit the liability |

**Why this matters mechanically:** **the same revenue is worth 3× more if it's on a 5-year contract
with a creditworthy tenant than on month-to-month with consumers** — which retroactively justifies
every boring decision the game wants to teach (sign longer terms, sell to businesses, diversify,
document). This is where Revenue Quality (§6.1) cashes out.

### The valuation modifiers that actually move a hosting price
Make them explicit rather than a vague "modified by."

**How it works:** **Weighted average remaining contract term** (the single biggest multiple driver in
colo and managed services) · **revenue concentration** (>25% in one customer typically costs **20–30%
of the multiple**) · **owner dependence** (if the founder is the sales team, the escalation path and
the only person with root, the multiple drops hard — **key-person risk is priced**, which retroactively
values every documentation and delegation decision) · **quality of earnings** (are your numbers
reconcilable? unreconcilable books cost turns) · **contract assignability** (§6.12) · **deferred revenue
balance** (comes off the price as a working-capital adjustment, so **a company funded by annual prepay
sells for less than its bank balance suggests — a beautifully unfair-feeling truth to end a campaign
on**).

### Adjusted EBITDA and the addback game
The dark art, playable.

**How it works:** When selling, you present *adjusted* EBITDA: add back one-time costs, owner
compensation above market, the failed product line, the legal settlement, the "non-recurring" outage
credits that recurred three times. **Each addback raises the price; each one a diligent buyer rejects
costs you credibility and drags other addbacks down with it.** **A bluffing minigame with a real-world
name** — and the honest player who presents clean numbers gets a lower headline and a smoother close,
which should sometimes net more.

### Escrow, holdback, and the working-capital adjustment
The three ways a headline price isn't the price.

**How it works:** **10–20% of purchase price held in escrow for 12–24 months** against reps and
warranties; a separate **retention holdback** tied to customers still present at month 12; and a
**working-capital adjustment at close** that claws back deferred revenue you've already spent. **A
player who sells at "5× EBITDA" and receives 62% of it at close has learned the most useful financial
lesson in the game.**

### The diligence report / The Diligence Memo
The business-side score, written as a buyer's memo.

**How it works:** The same data as the valuation, written as a buyer would write it, with red flags
called out: *"Customer concentration: 34% in one account. Documentation: minimal. Key-person risk:
high. No evidence of restore testing."* **Being scored the way an acquirer would score you is a far
more interesting ending than a number.**
**Visual:** a **three-page memo on letterhead** from a fictional acquirer, in a serif face, with **red
flags literally flagged** — a red sticky tab on the page edge for each, and the offending sentence
underlined in red pen with a margin note (`concentration?`, `no evidence of restore testing`). **You
physically turn the pages. Being judged in someone else's handwriting is devastating.**

### Concentration Risk Penalty
The scoring teeth on the whale strategy.

**How it works:** If one customer or one business line exceeds **40% of revenue**, valuation takes a hit
**and a targeted disaster becomes likelier** (the game literally weights events toward your
concentration). **Encourages portfolio play** and makes the Whale strategy genuinely double-edged
rather than simply good.

### Scoring additions worth calling out separately
- **Contribution margin by cohort and by channel**, not just gross margin.
- **Contracted revenue %** — what fraction of MRR has more than 12 months left. **A better health
  measure than churn rate.**
- **Net revenue retention *by line*.**
- **Revenue per kW and per rack unit**, plus the floor-plan $/sq ft heat map.
- **Cash conversion cycle** as a fifth dial.
- **Rule of 40** as a single elegant composite grade.
- **WARCT** — colo's actual valuation driver.
- **Cost per served unit**, per line.
- **Toil hours** and **escalation rate**.

---

## 6.10 Win and lose conditions

### The soft-over-hard rule (the governing principle)
**Prefer slow, visible, recoverable decline over instant loss.**

**How it works:** Almost every failure state below should be reachable, warned about for a long time,
and escapable at a cost. **You should lose slowly enough to understand why** — that's the difference
between a lesson and a frustration. The Death-Spiral Diagram (§6.8) is the UI that makes this
principle operational: **a losing game you can fight is worth more than a losing game you can only
watch.**

**Variations and additions**

- **Death should teach.** The loss screen must name **which door you died by** and what to build about
  it. **Each of the three fail bars needs a distinct, unmistakable pre-death sequence** — the
  de-lit-floor cascade already exists for cash; reputation and trust deserve equal ceremony — plus an
  **always-nameable HUD corner** answering *"which bar am I losing by?"* at any moment.
- **Mid-level failure is not the end.** A **down round or an asset sale** should be available as
  **partial endings**, so the run bends rather than stops.

### The Goal Card — declare your win condition at the start
The fix that turns six win conditions from a menu at the end into a campaign that responds to you.

**How it works:** At campaign start — and re-choosable once per chapter, at a cost — the player
**declares a goal**: The Exit / The Institution / The Nines / The Scale / The Niche / The Independent /
The Annuity. The declared goal **reweights the score card, the Board's mandates, and which opportunity
events appear.** An Institution player gets offered long contracts and community partnerships; an Exit
player gets offered acquisitions and growth-at-any-cost deals; a Niche player gets offered
specialization unlocks and a competitor who notices.
**Why:** multiple win conditions only create replay value if the player commits to one. Declaring also
solves a real problem — **the campaign otherwise has no way to know what the player wants**, so it
can't tailor its opportunity events, board mandates or offers. **Enormous value for very little work.**
**Each declared goal is visible as a progress meter from the moment you declare it**, which turns the
win condition into a chosen objective rather than an ending you stumble into.

### Win conditions, with stated thresholds
*None of these are playable as bare names; each needs a number.*

- **The Exit** — sell at **≥ 4× ARR** (or the per-line basis from §6.9 for facility businesses).
- **The Institution** — **5 consecutive in-game years at ≥ 99.95% and reputation ≥ 80, with positive
  cash every quarter.**
- **The Nines** — **hold 99.99% for 12 consecutive months at ≥ 500 customers.**
- **The Scale** — **reach Tier 6 with ≥ 3 regions.**
- **The Niche** — **≥ 40% share of one hosting type's market.**
- **The Independent** — **reach $1M ARR having never taken outside money.**
- **The Annuity (new)** — reach a state where **contracted revenue with >24 months remaining exceeds
  your fixed cost base.** Not growth, not scale, not a sale: **structural safety** — which is what most
  real operators are actually playing for and which no game offers as a win condition.
- **Per-level win conditions** (shorter horizon): *Survival* (end with cash > 0 and MRR ≥ target) ·
  *Profitability* (EBITDA margin ≥ X) · *Quality* (NPS/uptime thresholds with no more than N SLA
  breaches) · *Strategic* (land the anchor tenant / pass the audit / complete the migration with <10%
  attrition) · *Valuation* (exit at ≥ X multiple) · **Pivot** (derive ≥ 50% of MRR from the new line of
  business) · *Zero dropped visitors* · *Every tenant's SLA intact.*

**Different win conditions make different builds correct**, which is where replay value lives.

**Variations and additions**

- **The win menu, restated in level-goal language.** Survive N waves with the goals alive · hit an
  **MRR or contract target** · **pass an audit at a timer** · complete a **successful migration** ·
  **restore the vault** · **exfiltrate the profit** (bulletproof) · **never let the ping exceed X**
  (game servers) · reach the level's MRR/scale goal **with churn under a cap.**
- **Lose conditions worth adding to the roster above:** **licence revoked** (the regulated path's
  failure) · **merchant termination** · **the whale-march** (your top three churn in the same month) ·
  **the compliance kill-switch** (one uncured breach past the legal deadline shuts the company) ·
  **all SLAs void** · **blocklist irrelevance** (email's soft death) · **total customer exodus.**
- **Four ways to lose, four play styles.** The roster is not a list of hazards; it is a list of **which
  discipline you chose to be bad at.**

### Bankruptcy / cash zero (Insolvency)
The primary lose condition.

**How it works:** Payroll doesn't clear. **Warned for months** by the runway meter, and **it should
frequently happen while the P&L is green** — that's the whole thesis. Escapes: raise financing, cut
staff, raise prices, sell a line of business, factor receivables, sell the company.

### Death by cash — *CONFLICTING*

Everything above agrees you can die of cash. What is mutually exclusive is **what happens at the
moment the number hits zero**: a hard cliff with one grace instrument, a re-timed threshold that fires
*before* zero, or a playable sub-zero state you can inhabit and climb out of. The choice decides
whether insolvency is a **fail condition**, a **warning line**, or **a game mode.**

#### Position A — a warned, soft, escapable insolvency *(master)*

Governed by the **soft-over-hard rule**: payroll doesn't clear, but you were **warned for months** by
the runway meter, and **it should frequently happen while the P&L is green** — that is the whole
thesis. The escapes are named and real: **raise financing, cut staff, raise prices, sell a line of
business, factor receivables, sell the company.** The §6.8 **Death-Spiral Diagram** is the UI that makes
this operational, and §6.11's **shrinking instruments** are the doors. The distinct *named* failures
(Growth Death, Concentration Collapse, Churn Spiral) exist so the postmortem headline can tell you
which shape of insolvency you built. And the **Zombie Host** already covers "a failure state you
inhabit," as a separate, slower mode rather than as the insolvency rule itself.

#### Position B — six competing loss-handling designs *(opencode)*

- **Hard bankruptcy.** **Cash < 0 at wave end = loss**, with exactly one grace instrument: **a bridge
  loan at evil rates.** Insolvency with no credit remaining ends the run.
- **Runway death.** Don't wait for zero — **providers cut service first.** You die when **runway < one
  payroll cycle**, which is how insolvency actually arrives.
- **The soft-fail ladder.** At cash 0 a **timed grace** begins: a 60-second *"the bank holds your
  checks"* red clock — or a 20-second **"bounced cheque" overdraft theatre** in which coin streams
  reverse, the fountain coughs, and **you may liquidate ANYTHING at 50%** — before game over. Failing is
  delayed, dramatic and recoverable.
- **Running broke as a *state*.** Below zero you trigger the **Credit Line / Angel Round**: instant cash
  for a % of future revenue plus investor demands (board-seat restrictions on which technology you may
  pick). **Bankruptcy is only the *true* lose after the grace expires** — *"running broke is a playable
  state, not a game-over, which is huge for learning pacing."* Variant: investors throw a rescue round
  carrying a **permanent board-seat debuff and margin pressure for the rest of the level.**
- **Bankruptcy with dignity.** Not death but **an acquisition offer** — a rival absorbs you and **the
  level continues under worse ownership terms.** A soft fail that preserves narrative agency; the true
  game-over becomes **customer-trust zero.**
- **The losing *animation* as the rule.** At cash zero, **vendors repossess: buildables start leaving
  the map.** Loss is something you watch dismantle you rather than a screen.

### Growth Death
You grew fast, CAC-financed, and the working-capital gap ate you.

**How it works:** Mechanically a subtype of insolvency, but it deserves its own name and its own
postmortem headline because **the player's mistake was the thing they were proud of.** The Attribution
Ledger should point at the specific channel and the specific month.

**Variations and additions**

- **Losing while growing, named precisely.** Credits + refunds + chargebacks + emergency capacity spend
  exceeding MRR growth = **"cash-flow insolvency" — death with plenty of customers.** It is the most
  realistic failure in hosting, and it deserves its own postmortem headline separate from the
  CAC-financed version above.

### Concentration Collapse
Your whale leaves and you cannot cover fixed costs.

**How it works:** Distinct from ordinary churn because the notice period gives you a visible, finite
window to replace irreplaceable revenue. Made likelier, deliberately, by the Concentration Risk
Penalty's event weighting (§6.9).

### Churn Spiral / Mass churn cascade
Everyone leaves at once, or leaves slowly and visibly.

**How it works:** Churn exceeds new adds for N consecutive months, or a triggering event (a bad outage
in renewal week, a security incident, a mishandled price increase) starts a cascade where **each
departure slightly raises the next probability.** **A death spiral you can see happening** — with the
Death-Spiral Diagram naming the loop and three exits available (shed a line, take a loan, fire the
worst customers).

### Reputation Collapse / the empty lane
The quiet lose condition.

**How it works:** Trust below a floor closes every acquisition lane; **demand goes to zero regardless
of your capacity.** No new customers arrive. **Visually devastating**: the traffic lane on the board is
simply empty, with your infrastructure humming perfectly and serving nobody. **The most memorable
failure image in the document** — you can be technically flawless and still dead. Note that you cannot
buy your way out, because Visibility spend does not move Trust (§6.1).

**Variations and additions**

- **Reputation death should *stage* visibly.** The spawn ring **freezes**; review comets **dim one by
  one** — a *quiet* death against bankruptcy's noise — with a **60-second town-emptying window that is
  reversible if you notice.** The rep-zero loss "creeps," and creeping is what makes it the scariest of
  the three.
- **Blocklist irrelevance (the email line's version).** Your ranges are **permanently marked "spam."**
  Nothing shuts down, nothing bankrupts — **the soft death** is that your product no longer arrives, and
  it belongs beside the empty lane as the type-specific form of the same ending.

### Total / partial data loss
The instant-credibility lose condition — **nuanced, because real data loss almost never is binary.**

**How it works:** Losing customer data without a restore path ends most runs, and is nearly always
reachable only through ignored warnings (untested backups, single-copy storage). **But data loss has a
shape:** how much (one customer / one tenant / one volume / everything), how old (the last hour / the
last week / the archive), and **how provable** (can you tell the customer exactly what was lost?).
**The last is the cruelest and least-modelled: not knowing what you lost is worse than losing it**,
because you cannot notify accurately, cannot restore selectively, and cannot close the incident. **A
partial, ambiguous data loss should be survivable and should leave a permanent scar** — which fits the
soft-over-hard rule far better than an instant game over.
**Tension:** ⚔️ Two lenses want unrecoverable data loss to **end the level immediately and quietly**
("which is scarier than an explosion"); one wants it graduated. Merged position: **total,
unambiguous, whole-estate loss ends the run quietly; anything partial or ambiguous scars and
continues.**

### Upstream termination
Your provider fires you.

**How it works:** Sustained abuse, unpaid bills, or a nation-state's attention. **Being null-routed by
your own transit provider is the most helpless failure in hosting** and belongs in the game. Gated by
Trust-with-upstreams (§6.1): high trust buys you a warning call; low trust buys you a null route.

### Payment processor termination
Chargebacks over the line for too long.

**How it works:** You can't take money. Revenue goes to zero while costs continue. Brutal, fast,
entirely real — and preceded, if you were paying attention, by a monitoring program and a rolling
reserve.

### Debanked (new)
No way to receive money at all — distinct from processor termination, which is card-only.

**How it works:** Your bank exits the relationship (risk category, regulatory pressure, an
international sanctions screen). Cards, ACH, wires: all of it. **Distinct, slower, and far harder to
route around**, and the natural end-state of the bulletproof line.

### Regulatory shutdown
An order to cease.

**How it works:** From the bulletproof line, a compliance failure, a data-residency violation, or a
failed audit plus an enforcement action. **Sometimes only the regulated portion of the business is
closed — a partial loss, which is better design.**

**Variations and additions**

- **The compliance kill-switch, stated as a clock.** **One uncured breach past the legal deadline = the
  company is shut down.** Distinct from a failed audit, because the trigger is *your own inaction after
  notification* rather than a finding — and because it is the one lose condition with a visible,
  countable timer on it.

### Deplatforming
Payment processor **and** upstream both drop you. **The bulletproof ending.**

### Uninsurable (new)
A slow one, and an unusually elegant chain.

**How it works:** You lose cover (too many claims, a failed questionnaire, an excluded incident), then
you lose the **contracts that require it**, then you lose the **customers**. Three steps, each visible,
each with a window to act.

### Covenant Default
Your lender takes control.

**How it works:** Sustained credit-line utilization, an EBITDA covenant breach, or a leverage test.
Escalates from waiver (fee) to forced asset sales to control. **The only lose condition where you're
still profitable and still lose**, which is why it belongs.

### Team collapse / total staff burnout
Everyone quits.

**How it works:** Sustained burnout, no on-call rotation, no documentation. **You keep the
infrastructure and lose the ability to operate it.** **Losing to your own management is the most
distinctive lose condition here**, and the *No Heroes* medal is its mirror.

### Facility loss
The building is gone.

**How it works:** Fire, flood, code violation, condemnation, a landlord who didn't renew. Insurance
covers some of it, late (§6.7), and the DR architecture you did or didn't build is the entire
difference between a lose condition and a very bad quarter.

### Obsolescence
The era moves on without you.

**How it works:** In era-spanning play, failing to transition means demand simply evaporates. Slow,
visible, and sad — and the pivot that avoids it is a double-carry (§6.14).

### The Zombie Host (a soft fail you inhabit)
Rather than ending the run, you become a zombie.

**How it works:** Still online, no growth, no investment, minimum staff, slowly rotting. You can play
on and dig out, or take the ending. **A "failure state you inhabit" is more interesting than a game-over
screen.**
**The exit ramp, given a shape:** in zombie state you **lose access to growth systems** (no marketing,
no new lines, no hiring) but **gain one thing — total focus.** Your hands are no longer contested, so
you can actually fix the estate. **Escaping requires reaching a stated health bar** (debt below X,
drills current, churn under Y) sustained over three months. **A genuinely different, slower, quieter
game mode and the best possible expression of a turnaround.**

### Acquisition at a bad multiple (a soft loss/win)
A competitor buys you cheap.

**How it works:** You survive; the score is mediocre; **the campaign continues under a new owner**,
with new mandates, a new board, and a cost-cutting thesis you now have to live inside. **A fantastic
narrative device** and the only lose condition that is also content.

---

## 6.11 Financing instruments

### The instrument table (cost, speed, and failure mode)
*Every instrument needs a price and a way it kills you, or it is just a button.*

| Instrument | Cost | Speed | Failure mode |
|---|---|---|---|
| Bootstrap | 0 | — | growth capped by the cash conversion cycle |
| Customer prepay | ~15% discount | instant | deferred-revenue hole you already spent |
| Revolving credit | 8–14% APR on drawn | days | covenant breach if utilisation stays high |
| Equipment / asset finance | 6–11% | 2–4 weeks | you own the term even if the market moves |
| Vendor / OEM finance | often better than a bank | weeks | vendor lock, and they know the collateral |
| Term loan | cheap, long | 1–3 months | restrictive covenants on a facility build |
| Invoice factoring / AR finance | 1–3% per 30 days | days | expensive at a run-rate; a distress signal |
| Merchant cash advance | **35–80% effective** | hours | daily receipts skim, death spiral |
| Venture | dilution 15–25% | 3–6 months | **you can now lose by growing slowly** |
| Private equity | control | 4–9 months | margin pressure, deferred maintenance |
| Sale-leaseback | permanent opex | 1–3 months | worse unit economics forever |
| Seller financing / earnout | a premium on price | negotiated | you still owe if acquired customers churn |

**State the order a sensible operator uses them in**, because the game's implicit lesson is that
**cheap boring money beats fast expensive money**, and the table makes that argument by itself.

### Bootstrap
Customer revenue only. **Slowest growth, total control, and every decision constrained by cash. The
default and the hardest mode.**

### Customer-financed growth (the elegant one)
Annual prepay, setup fees, and deposits fund the hardware you need to serve those same customers.

**How it works:** **The cheapest capital in the world** — ask your customers to prepay a year in
exchange for two free months. **Growth that costs nothing but discipline**, and the most satisfying way
to win. Underrated, real, and a great "aha" unlock. Its shadow: a deferred-revenue hole (§6.13).

### Revolving credit line
Cheap, small, and requires a relationship you build over time.

**How it works:** Bridges timing gaps; carries **covenants** (minimum EBITDA, maximum leverage,
sometimes an uptime clause). Utilization is tracked and the death-spiral pattern is flagged. **Using it
is not failure; being unable to stop using it is.**

**Variations and additions**

- **Credit lines and hardware loans as the leveraged-expansion path.** Borrow against future revenue;
  **bankruptcy if debt exceeds liquidation value mid-level.** Datacenter-operator levels practically
  *require* one leveraged expansion to win big, which is what makes the instrument a strategy rather
  than a safety net — and it is where the **"designed desperation arc"** of Credit-as-a-second-currency
  actually lives.
- **A credit-score meter.** It sets loan terms **and makes whales hesitate** — one number read by two
  different counterparties.
- **The margin call is a perfect mini-boss.** A timed demand you can see coming and can only answer with
  cash or assets.

### Equipment financing / leasing — **the defining instrument of hosting**
The hardware is the collateral, so terms are good.

**How it works:** Converts a capex spike into a predictable monthly cost — **which fixes the exact cash
problem growth creates.** Early game favours leasing (cash-poor); late game favours buying (margin).
Downside: you're committed to that hardware for the term even if the market moves (see GPU volatility,
§6.6). Carries an interest rate and sometimes a **covenant that trips if your uptime falls** — debt as
a risk multiplier.
**The correction that matters:** "terms are good" badly understates it. **Asset-backed lending is the
defining financial characteristic of hosting versus software: you have collateral, so you can borrow
instead of diluting.** A hosting company that takes venture capital usually didn't need to, and the
game should let the player discover that **equipment finance at 8–12% is dramatically cheaper than
equity at any price.**

### Vendor / OEM financing
The hardware vendor finances the purchase directly to close the sale.

**How it works:** Often better terms than a bank, because **they know the collateral's value.** In
GPU-era hosting this is enormous — and it comes with a lock-in and an MDF relationship attached.

### Term loan
For a facility build: long, cheap, restrictive.

### Invoice factoring / AR financing
1–3% per 30 days for immediate cash on receivables.

**How it works:** **Importantly, this is not the same trap as a merchant cash advance**, and the game
should distinguish them explicitly — **teaching "all fast money is bad" is wrong; teaching "understand
the effective rate" is right.** Factoring at a 2%/30 rate is expensive but rational for a one-time
enterprise-onboarding gap; at a permanent run-rate it is a distress signal your lenders will read.

**Variations and additions**

- **The Float, given a face.** MRR lands **net-30 by default**, and **a bank is always offering to buy
  your outstanding invoices at a discount right now** — one button, a permanent temptation, and a
  slightly sinister **banker avatar at the trade show**. It is the cash-flow-vs-profit gap with a
  character attached. Quoted variously as a **3–5% haircut** on the invoice or the **1–3% per 30 days**
  rate in the table above — the same instrument measured over different windows — and it is the moment
  **enterprise net-90 finally acquires a visible price.**

### Merchant cash advance (the labelled trap)
Fast money at a terrible price.

**How it works:** They take a fixed percentage of daily card receipts until repaid, at an effective
rate of **35–80%**. **Available instantly, always, with a friendly UI** — and the game should let you
take it and feel the consequence. **Label it in the postmortem, not before.**

### Venture capital
Equity for speed.

**How it works:** Large cash injection, dilution, a board seat, growth expectations, and a new failure
mode: **you can now lose by growing too slowly** even while profitable. **Changes the scoring weights
for the rest of the run** and swaps your end-screen for the Board Review.

**Variations and additions**

- **Quotas with teeth.** Investors impose **quarterly growth quotas**; **fail the quota and they force a
  bad decision** — an automatic price hike, for example, which starts a churn wave. **Debt and equity as
  a tempo cheat with a monster attached.**
- **Stage the finance properly.** Rounds sell **recurring ownership**, so model **dilution against the
  exit score** (MRR × multiple × founder %). Add **liquidation preference** and **down-round** mechanics,
  and make **bridge loans high-rate short timers** rather than a flat "evil rates" label.
- **The between-levels round.** Certain **"growth" technologies (autoscalers, marketing) *require*
  investor money**, and spending it **pre-loads difficulty** — the market now expects the hockey stick.
- **Bootstrap vs VC is a meta-economy decision with two endings.** A big war chest now against a
  **permanently lower score ceiling** (dilution); staying bootstrapped unlocks the other ending
  entirely. See §6.14's meta-currencies.

### The rescue round (the anti-death-spiral boss)
A comeback instrument that arrives **because** you are dying, and charges you for the privilege.

**How it works:** When **cash < 0 and uptime > X**, an **investor round** is offered — funding
**conditional on hitting growth metrics for the next 3 waves.** It is simultaneously a rescue and a
**self-imposed difficulty boost**, which is what makes it a boss rather than a button: accept, and the
level's win condition quietly changes under you.
**Why it belongs next to the shrinking instruments:** §6.11's other doors all *reduce* the company. This
one keeps it whole at the price of a clock. A player should be able to choose which kind of survival
they want.
**Interacts with:** §6.10's Death-by-cash conflict (this is the "running broke is a playable state"
position, given an instrument), §6.8's Death-Spiral Diagram, §6.9 valuation (the round is priced off it).

### Board dividend pressure (the endgame trilemma)
Once you are profitable, **the board wants some of it.**

**How it works:** The board demands a **payout percentage each quarter**; reinvesting everything
triggers a **board-mutiny event.** The endgame strategy becomes a genuine trilemma —
**reinvestment vs. dividend vs. an acquisition war chest** — with no dominant answer.
**The anytime version, for bootstrapped runs:** pay yourself into the **war chest** (growth) or **take
the payout** (the final "founder score"). **The greedy can win the level and lose the run.**
**Interacts with:** §6.9 Company Valuation, §6.12's ETF Buyout (which is what the war chest is *for*),
§6.10's Goal Card (The Exit vs The Independent read this differently).

### Private equity / roll-up
Money with an operating thesis.

**How it works:** They want **margin, not growth**. Expect cost-cutting pressure, multiple-arbitrage
acquisitions, and a conflict between short-term EBITDA and long-term infrastructure health. **A whole
game mode**, and the natural sequel to an acquisition-at-a-bad-multiple ending.

### Seller financing and earnouts
For acquisitions.

**How it works:** Buy a competitor by paying out of the revenue it generates, with an **earnout tied to
retained customers**. **Low cash, high integration risk** — and if the acquired customers churn, **you
still owe.**

### The shrinking instruments (the dignified retreat)
**§6.11 is otherwise all borrowing, which makes the death spiral one-dimensional — a player in trouble
has only "take expensive money."** Shrinking should be a legitimate, painful, survivable option, and
the three exits from a death spiral need actual doors.

- **Sell a line of business** — immediate cash at **8–14× its monthly profit**, permanent loss of that
  revenue and its technology, but you **keep the distillate** (the staff knowledge, the tooling, the
  one good component you built for it).
- **Sale-leaseback** — sell your building or your hardware to a financier and rent it back. **Big cash
  now, worse unit economics forever.** Deliciously realistic, and a genuinely tempting late-game
  trap/tool.
- **Sell your IPv4 block** — a real asset with a real market price (~$30–50/address). Losing it forces
  **IPv6/CGNAT**, which costs you a slice of visitors and a support-ticket wave. An appreciating asset
  you can only spend once.
- **Fire the worst customers** — a scored retreat (§6.9) rather than an admission of failure; the
  Margin Tint (§6.5) is the targeting UI.
- **Secondary-market liquidation** — sell your cascade output, or your spares pool, into the used
  market (§6.14).

### Loans priced by your uptime streak — and the operational credit rating beneath it
A delightful crossover mechanic, generalized.

**How it works:** Your interest rate is set by your operational track record — a long clean uptime
streak and good documentation lower your cost of capital. **Operational excellence literally makes
money cheaper**, which is both true (insurers and lenders do assess this) and a lovely systems link.
**Extend the principle: operational quality should price *everything external*.** One underlying
**"operational credit rating"** with six visible consequences:
1. **Insurance premiums and deductibles** — priced from a controls questionnaire (drills, MFA, backup
   testing, patch lag). **An audit you're paid to pass.**
2. **Transit terms** — traffic ratios and abuse-response speed set your peering and burst terms.
3. **Vendor support tiers and credit lines** — payment history.
4. **Enterprise conversion rate** — uptime history is diligence material.
5. **Hiring cost** — what your ex-employees say about your on-call rotation.
6. **Loan and lease rates** — the original mechanic.
**That's the cleanest possible link between the operations half of the game and the business half.**

### Grants, incentives, and rebates
Slow, regional, and rewarding the boring decision. See §6.7.

### Covenant breach
The failure mode shared by half of the above. See §6.7 and §6.10.

---

## 6.12 Contract and term structure

*Wave-2's largest structural addition to the economy. **(T1) Hosting is billed in terms, not months**
— prepay windows, renewal cliffs, 3–5 year colo terms with annual escalators and ramp schedules,
reserved vs. spot GPU, MRC plus per-minute settlement. **(T3) The contract is a tower** — its clauses
are separately buildable defences with separately purchasable costs, and giving one away to win a deal
is exactly as consequential as leaving a firewall rule open.*

### The contract is a tower
The central reframing: a contract is not a flavour text, it is a **structure you build, clause by
clause**, and each clause defends against a specific threat.

**How it works:** Each of the following is a **separately buildable, separately negotiable clause** on
the contract card, with a cost in deal friction (the customer wants it removed) and a defence value
(what it protects you from):

| Clause | What it defends against | What giving it away costs you |
|---|---|---|
| **Liability cap** | the lawsuit (§6.7) | unbounded exposure on one bad outage |
| **SLA credit cap** | the outage that costs more than the contract | credits exceeding the revenue |
| **Claim window** | retroactive credit claims | every past outage reopened |
| **Maintenance exclusion** | planned windows counting against uptime | your error budget spent on maintenance |
| **Auto-renew** | churn at term end | a renewal negotiation every year |
| **Annual escalator** | cost inflation over a 5-year term | a fixed price against rising costs |
| **Power pass-through** | an energy price spike | a slow bleed you cannot fix |
| **MFN (most-favoured-nation)** | *the customer's* protection against you | every future discount applies retroactively to them |
| **Audit right** | *the customer's* right to inspect you | scheduled hands consumed forever |
| **Consent to assignment** | *the customer's* veto on you being sold | **your company becomes harder to sell** |
| **Early-termination fee (ETF)** | churn's cash impact | a free exit for your customer |
| **Deposit / letter of credit** | bad debt | exposure to a counterparty you didn't check |
| **Notice period** | a surprise departure | no window to replace the revenue |

**Why it's excellent:** it makes the sales negotiation a *building* activity with the same grammar as
the rest of the game, and it makes the whale's redlines (§6.7) into a real decision — every concession
is a tower you agreed not to build. **The player who gives away the escalator and the pass-through to
win a colo deal finds out in year three.** The player who gives away consent-to-assignment finds out
at the exit (§6.9).
**Interacts with:** §6.5 custom enterprise pricing, §6.7 the whale signs, §6.9 valuation modifiers,
§6.1 error budget (the maintenance exclusion is literally a budget refund).

**Variations and additions**

- **Contract tiers as a buildable choice, up front.** **Prepaid annual** = cash now + retention locked +
  **a big public refund if you fail** · **monthly** = flexible MRR · **custom enterprise** = you
  negotiate the SLA level yourself (which is the difficulty selector below). Three tiers, three
  completely different levels.
- **Price-hold clauses (the CPI cap).** Multi-year enterprise deals are frequently capped at
  **"≤ annual CPI" uplift** — and **inflation and power spikes eat them alive.** Accept the fat MRR
  today, or its strangulation later. **Contract text as a live liability**, and the exact inverse of
  the escalator clause.
- **Multi-Year Contract Valuation (TCV) vs Cash.** Government and colo deals print **seven-figure TCV**
  and pay monthly for five years **with termination-for-convenience clauses**. Split the HUD into
  **"contract value (paper)" vs "collected (real)"**: the board loves TCV, payroll needs collected, and
  the late-game temptation is to chase paper. (Mechanically this is the ramp-schedule entry below, shown
  as two numbers instead of three.)
- **Vendor lock-in discounts.** A buildable tier with **fat cost breaks that cripples your resale and
  migration options** — cheaper now, harder in a later migration level. **The contract you signed is
  still on the board** two levels later.
- **The renewal cliff reprices you to your *current* usage.** Committing cash up front is cheaper per
  unit but locks pivoting, and **a quarter of overprovisioning leaves you with a permanently higher
  floor** at renewal. A scheduled event you can plan for — or be surprised by.

### The contract as the difficulty selector
The availability commitment you sign *is* the level's difficulty.

**How it works:** Choosing 99.9 vs 99.99 sets your error budget (§6.1), your price (§6.5), your credit
exposure, and your infrastructure requirement (the Cost of a Nine curve, §6.5). **It arrives as a
decision with a visible cost curve rather than a menu labelled Easy/Hard.**
**⚔️ Tension:** this competes with the price slider for the "player sets their own difficulty" role.
Merged position: **the contract sets the difficulty; the price slider sets the business model.**
Different axes, both shippable, but they must be labelled as different axes.

### The term-length matrix
T1, made mechanical. Every plan is priced across terms, and each term trades price for cash timing,
churn, and revenue quality.

| Term | Effective monthly | Cash at signing | 12-mo retention | Renewal shock |
|---|---|---|---|---|
| Monthly | $12.00 | $12 | ~55% | none |
| Annual | $8.00 | $96 | ~78% (measured at renewal) | moderate |
| 2-year | $6.50 | $156 | ~82% | large |
| 3-year | $5.50 | $198 | ~85% | severe |

**The lesson the matrix teaches by itself:** long terms make cash and churn look **wonderful for two
years** and stack an **enormous renewal cliff you must survive all at once.** A player who fills their
book with 3-year prepay will have a beautiful level and a catastrophic one **36 months later** —
which is exactly how the low-end hosting industry actually behaves.
**Interacts with:** §6.3 payment fees (the other reason long terms are pushed), §6.4 deferred revenue,
§6.13 the deferred bucket, §6.9 WARCT.

### The renewal cliff as a scheduled event
Term structure means churn is not a smooth rate — **it is a calendar.**

**How it works:** With prepaid terms, churn arrives in **cohort waves at renewal dates**, not as a
trickle. A month with 400 renewals due is a month with 400 decisions being made about you at once, and
the intro-vs-renewal spread (§6.5) determines how many of them go badly. **Renewal negotiations become
scheduled events on the Obligation Rail** (§6.8), visible months ahead — which is what makes preparing
for them a strategy.
**Hosting types:** shared/VPS (annual/triennial cohorts), colo (a single tenant's 5-year term ending),
GPU (a reserved contract expiring into a different market), email/backup (annual, quiet).

### Ramp schedules and the revenue start date
**Contract value ≠ current revenue.**

**How it works:** A signed deal has a **start date, a ramp curve, and sometimes free months.** Model
three numbers: **TCV** (total contract value), **ACV** (annual contract value), and **Billing MRR**
(what is actually invoicing this month). **Sales celebrates TCV. Payroll needs Billing MRR.** A
build-to-suit colo deal might be $14M TCV, $2.8M ACV, and **$0 Billing MRR for eleven months.**
**Interacts with:** §6.13 backlog bucket, §6.7 the whale signs, §6.14 the J-curve.

### Take-or-pay and commit burn-down (both directions)
Commitments are a floor for whoever made them.

**How it works (customer side):** Customer commits generate a **revenue floor** and a **satisfaction
penalty when unused** — they paid for capacity they didn't consume and they will remember at renewal.
**How it works (your side):** *Your* commits — transit, power, hardware purchase commitments,
marketplace minimums — are obligations that sit in the **"committed out"** cash bucket (§6.13). **A
commit you outgrow is free money** (you got the volume discount and used it). **A commit you undershoot
is a monthly tax on your own optimism.**
**The decision it produces:** "how much do I commit to" is an annual forecast bet **with a penalty in
both directions**, which is a genuinely good recurring decision to hand the player.

### Reserved vs. spot (the GPU/compute term structure)
The same product, sold three ways, with three different risk shapes.

**How it works:** **Reserved 1–3 year contracts (30–50% below spot, often prepaid)** are how the
hardware is financed. **On-demand** is the middle. **Spot/preemptible** monetizes the residual and is
reclaimable at any moment. Your book's **mix** of the three determines whether a price collapse is an
inconvenience or an extinction event.
**The stat that matters:** **contract-term coverage** — what fraction of your hardware's financing term
is covered by contracted revenue. Displayed in any GPU level, and generalizing to colo (15-year
building lease vs 3-year tenant leases) and reseller (annual transit commit vs monthly customers).
**Visual:** **The Anchor** (reserved, a heavy chain that pins your price) and **The Kite** (spot, a
thin string that can be cut) on the contract cards.

### MRC + NRC + settlement (the three-component bill)
Most non-consumer hosting bills have more than one component, and they behave differently.

**How it works:** **NRC** (non-recurring / install) is one-time cash at the start. **MRC** (monthly
recurring) is the annuity. **Settlement / usage** (per-minute VoIP termination, per-GB egress, per-
GPU-hour overage, per-pass satellite time) is the variable tail that reconciles in arrears, sometimes
a month late, sometimes disputed. **A VoIP line is an MRC for the channel plus a per-minute settlement
that can be defrauded overnight** (toll fraud, §6.7). **The three components should be visibly separate
on the contract card**, because they have three different cash timings and three different risks.

### Circuit and cross-connect contract liabilities (NRC, MRC, term, ETL)
Every circuit is a small contract with its own end date. See §6.3 for the full mechanic —
**cancelling a 36-month circuit in month 4 costs 32 months of payments**, and the reason moving
facilities is hard is that **your contracts' end dates never line up.**

### The ETF Buyout (contract buyout as an offensive weapon)
**The single most effective competitive tactic in B2B hosting.**

**How it works:** A prospect is locked into a competitor for 14 more months at $4,000/mo with an early
termination fee of 50% of remaining value ($28,000). **You offer to pay their ETF** in exchange for a
36-month contract with you. You've spent $28,000 to acquire **$144,000 of contracted revenue — a
7-month payback**, amortized as a contra-revenue item. **The customer's decision becomes free.**
**Why it's a great mid-game unlock:** it is **a CAC you can compute exactly**, and it requires **cash
on hand** — which makes cash *strategically* valuable rather than merely survival-valuable, and gives
the player a reason to build a war chest.
**Counter-mechanic:** the competitor AI can do it **to you**, so *your* contracts' ETF terms become a
defensive clause with a deal-friction cost — a direct link back to the contract tower above.

### Escalators, pass-throughs, and the fixed-price trap
The clauses that decide whether a long contract is an asset or a slow bleed.

**How it works:** **Annual escalator** (typically 3%) raises MRC each year. **Power pass-through**
transfers energy-cost increases to the tenant. Without them, **your price is fixed while your costs are
not** — a 5-year colo lease signed before an energy price spike bleeds for four more years. **Negotiating
these is the single most consequential thing in a colo contract**, and they must be explicit,
negotiable, visible terms on the card.

### Auto-renew, notice periods, and the evergreen clause
The quiet clauses that decide your churn calendar.

**How it works:** Auto-renew with a 90-day notice window means churn arrives as a **notice event** you
can see, rather than a surprise. Evergreen terms (auto-renew for successive 12-month periods unless
notified) are how colo books are actually held together, and **the customer who forgets to give notice
is renewed for a year** — which is a real, slightly grubby revenue source with a reputation tail.

### Contract assignability (consent to assignment)
The clause that determines whether your company is sellable.

**How it works:** If a material share of your contracts require the customer's consent before being
assigned to an acquirer, **your exit requires their permission** — and some of them will use it as
leverage. Buyers discount heavily for it. **A clause nobody negotiates hard at signature and everybody
regrets at close.**
**Interacts with:** §6.9 valuation modifiers, §6.7 acquisition offer.

### WARCT and contracted revenue % (the two numbers that make revenue an asset)
**Weighted Average Remaining Contract Term** and **contracted revenue %** (the fraction of MRR with
>12 months left).

**How it works:** These are **colo's actual valuation drivers** and the best available health measures
for any contracted line. **A better health measure than churn rate**, because churn is backward-looking
and WARCT is forward-looking. Both belong in the drawer during play and on the score screen at the end.

### The Contract Term Ribbon (visual)
Contract length drawn as a ribbon with visible remaining length on every customer card.

**How it works:** Short ribbons are churn risk. **A wall of short ribbons is a visible business-model
problem**, readable in one glance without opening a report — and a wall of long ribbons is what an
acquirer is actually buying.

---

## 6.13 Restricted cash and the balance sheet

*Wave-2's thesis **(T4): money you can't touch is not money.** The document models cash and a P&L and
stops there. A third ledger — and a cash number that is a **stack**, not a scalar — makes several
existing systems suddenly legible.*

### The six cash buckets
Replace the single Cash number with a stack that sums to it.

| Bucket | What it is | Can you spend it? |
|---|---|---|
| **Free cash** | in the bank, unencumbered | **Yes** |
| **Restricted** | rolling reserve, escrow holdback, security deposits held for tenants, letters of credit | **No — and it *looks* like cash** |
| **Deferred** | prepaid revenue you haven't earned | legally yes, prudently no |
| **AR** | invoiced, not collected, aged into buckets | only by factoring, at a cost |
| **Backlog** | signed, not installed, not billing | **No** — and it's the number sales celebrates |
| **Committed out** | take-or-pay owed to suppliers, lease obligations, open POs | **negative** |

**Visual:** the bank-balance column becomes a **layered column**, with only the top layer coloured as
spendable. **Watching the spendable layer thin while the total column grows is the single best picture
of "profitable and insolvent" available** — and it is a strictly better version of the two-meter
proposal, because it puts the whole lesson in one object.
**Interacts with:** §6.1 Cash, §6.4 Gap Bar, §6.9 valuation (deferred comes off the price), §6.10
insolvency (you die on *free* cash, not total cash).

### The Balance Sheet (assets, liabilities, equity)
The third ledger, and the one that explains the ending.

**How it works:**
- **Assets** — hardware at depreciated value, **owned IP space (which *appreciates*)**, prepaid
  contracts, receivables, spares inventory, the building if you own it, capitalized fit-out.
- **Liabilities** — debt, leases, **deferred revenue**, **accrued SLA credits**, committed-out
  obligations, and the **decommissioning obligation on your own hardware.**
- **Equity** — what's left, and **it is the number an acquirer actually buys.**
**Why adding it pays for itself:** it makes four existing systems legible at once — **why leasing
changes your risk**, **why IPv4 is a strategic asset**, **why deferred revenue is genuinely scary**, and
**how the diligence report reaches its number.**
**Visual:** a page in the Ledger Drawer on accounting stock, and the **Depreciation Fade** (§6.15)
showing book value drifting away from working reality.

### The Rolling Reserve
The processor's slow squeeze, modelled honestly.

**How it works:** After a chargeback spike or a risk review, the processor withholds a percentage of
card revenue for a rolling period. Economically it is **a permanent haircut on card revenue plus a
one-time cash trough** equal to *reserve % × monthly card revenue × reserve months*. At 10% and 180
days on $200k/month of card revenue, that's **$120,000 of your cash permanently parked.**
**Model it as a bucket that fills and then holds at steady state**, so the player sees that **the pain
is a one-time transition, not a recurring loss** — which is exactly the insight that makes it
survivable rather than terrifying.

**Variations and additions**

- **Draw it as a second money pool.** High-chargeback or high-risk periods hold **~10% of revenue in a
  visible escrow vault**, releasing on a compressed 180-day delay — ***money you earned that you cannot
  touch***, sitting next to Cash where you have to look at it. **Its size is a risk thermometer: it is
  how the processor sees you**, rendered as an object. A processor **risk-hold** can freeze the balance
  outright mid-crisis, which is the same vault with the tap closed.

### Escrow holdbacks and the working-capital adjustment
The exit-side restricted cash. See §6.9 — **10–20% of the price held 12–24 months**, plus a retention
holdback, plus a claw-back of deferred revenue you already spent.

### Security deposits and letters of credit (both directions)
Cash locked for a term, on your side and theirs.

**How it works:** *You hold* tenant deposits (restricted — it is not your money, it just sits in your
account and flatters the balance). *You post* deposits and letters of credit to colo, transit and power
suppliers, and sometimes a **personal guarantee**. **Cash locked up for the term, unavailable, and
invisible on the P&L.** Directly attacks runway. **A brutally real early-stage constraint that also
explains why small hosts under-buy redundancy** — the money that would have been a second circuit is
sitting in the landlord's account.

### The Performance Bond
For deals above a size, **the customer doesn't trust your word — a bank co-signs your SLA.**

**How it works:** A **percentage of contract value is locked in a bank instrument**, with an **upkeep of
1–3% per year that shrinks as your claims history improves** — insurance's honest cousin. On breach, the
customer **draws the bond directly**: instant cash out, **no invoice argument**. And **two draws in a
year blacklists you from the entire government/enterprise RFP lane.**
**The elegant second use:** the bond's size and price **double as your creditworthiness HUD**, because
**the bank is quoting your actual incident journal** back at you. It is the operational credit rating
(§6.11) expressed as restricted cash.
**Interacts with:** §6.13's restricted-cash bucket (the bond is not spendable), §6.12 the contract
tower, §6.7 SLA credit events, §6.11 loans priced by your uptime streak.

### Deferred revenue, spent
The classic startup sin, given teeth.

**How it works:** Annual prepay lands as cash and recognises 1/12 per month. The game should let you
spend it, and then punish you at the refund, at the working-capital adjustment, or at the moment your
auditor asks. **Shown as its own layer in the cash column** so the temptation is visible and named.

### AR aging and DSO
Receivables age, and aging is a shape.

**How it works:** Four buckets — **0–30 / 31–60 / 61–90 / 90+** — with **DSO** as the summary metric.
Enterprise customers raise it; consumer cards lower it. **Winning a big contract can worsen your cash
position for a quarter.** Levers listed in §6.4 (invoice immediately, get the PO, 2/10 net 30,
factoring).
**Visual — the AR Aging Shelf:** **four trays** labelled 0–30 / 31–60 / 61–90 / 90+, each holding
invoice slips. Slips **physically slide right as they age and yellow as they go.** The 90+ tray has a
collections stamp on it. An invoice that clears flies out as a coin arc. **The shape of your
receivables is the shape of four trays**, which is precisely how it feels in a real back office.

**Variations and additions**

- **Who pays when, as customer-mix personality.** **Enterprise pays slow · SMB prepays fast ·
  researchers pay when their grants clear.** Factoring shortens the cycle at a fee; **enterprise logos
  lengthen it as a hidden cost of prestige.** The question every expansion decision should force is
  **"can the cycle carry this?"** — which turns DSO from a metric into a gate.

### Bad debt and the write-off (with provisioning)
Money you will never get, and the choice of when to admit it.

**How it works:** Past 90 days a percentage becomes uncollectable. **You must *provision* for it**
(reducing reported profit now, correctly) **or not** (looking better now, taking a lump later). A small
accounting mechanic that **teaches conservatism and makes the AR aging buckets actually matter.**
**Real bands, by customer mix:** consumer/low-end shared **2–4%**; VPS **1–3%**; SMB dedicated
**1–2%**; enterprise **<0.5%**; colo **<0.5%** (deposits + termination rights); bulletproof **~0**
(prepaid only, **which is why it's prepaid**). **Bad debt rate is a direct function of your customer mix
and your credit policy** — it is the cost the cheap-and-fast strategies hide.

**Variations and additions**

- **The Dunning Golem (the escalation cast).** Customers who simply do not pay age through three
  characters: **polite** (the dunning-email tower) → **firm** (auto-suspend — you bounce the customer
  *mid-usage*) → **legal** (a small-claims staff cast: expensive, slow, **wins most**). A **"collections"
  dark unlock** adds offshore flavour: +cash, −reputation, and **terrorized customers poach your future
  funnel.** A postpaid invoice unpaid at 30 days fires a **collection mini-event**.
- **The line that kills profitable levels.** Write-offs are a real line item, and **a profitable level
  can still die of uncollected revenue** — which is the AR aging shelf's entire reason to exist.

### Revenue leakage and Revenue Assurance
Money you earned and never billed.

**How it works:** Unbilled overage, un-provisioned upgrades, add-ons delivered free, expired promos
never converted, cancelled services still running, a customer on a plan they outgrew two years ago.
Model as **0.2–0.5%/month accumulating**, capped by whatever **Revenue Assurance** tooling you've
built, and running **2–5% of MRR at any given time in an unmanaged operation.** Surfaces at level end
as the **Leak Report** (§6.9).

**Variations and additions**

- **The Metering-Leakage Stat.** The slow hidden bleed — **bytes served but not billed** (logging gaps,
  unbilled overages, rounding). **Billing maturity audits it**, so late-game players get told
  **"you gave away $4,200 this month."** The most infuriating and most realistic line the game could
  write.

### Backlog (signed, not installed, not billing)
The number sales celebrates and payroll cannot use.

**How it works:** The gap between TCV and Billing MRR (§6.12). Enormous in colo, wholesale and GPU;
near-zero in self-serve shared hosting. **A large backlog is simultaneously your best asset and your
worst cash problem**, and the tension between those two readings is the whole point of showing it.

### Committed out (take-or-pay, leases, open POs)
Negative cash you have already promised. See §6.12.

### AP as a lever (and a trap)
The supply side of cash management.

**How it works:** You can stretch vendor payment terms — **pay at 45 instead of 30** — to smooth a
trough. **It works, it's normal**, and past a point your distributor puts you on **credit hold**
(§6.7), your transit provider adds a late fee, and **word travels in a small industry.** **A legitimate
lever with a reputation cost among a different audience than your customers** — which is exactly what
the Trust-with-upstreams currency (§6.1) is for.
**Also a legitimate power move:** negotiating NET-60 with your hardware supplier before you need it is
unglamorous and saves a level.

### Capitalized fit-out
The colo/facility version of "money you spent that isn't an expense yet."

**How it works:** A build-out is capitalized and **amortized over ~60 months** against a 60-month
lease. Cash out on day one; P&L impact spread over five years. **It is the single largest reason colo's
cash conversion cycle is +18 months**, and it is what makes a facility business need financing to grow
at all. If you leave the building early, the **unamortized balance is written off in one lump.**

### The decommissioning obligation
A liability that accrues silently over an asset's life.

**How it works:** Certified destruction, recycling fees, data-sanitization evidence, and site
restoration ("make good") clauses on a lease. **Accrued over the asset's or lease's life** so the bill
at the end of the depreciation tail isn't a surprise — and so the player who never accrues it gets the
surprise, which is the lesson.

### The cash conversion cycle (as a balance-sheet readout)
See §6.4 for the mechanic. Shown here **per line**, because it is the single figure that explains why
prepaid shared hosting funds itself, dedicated needs a credit line, and colo needs a bank.

### The cash-flow waterfall
The monthly bridge between the ledgers: money in → money committed → money actually available. See
§6.4. **The picture that explains why the whale contract is a crisis.**

---

## 6.14 Multi-line, transition, and portfolio economics

*What happens once you run more than one business — and what it costs to become a different one.
Wave-2 thesis **(T5): a pivot is a double-carry.** For 12–24 months you are paying for two companies.*

### The pivot double-carry
The most expensive thing a hosting company ever does, and the least modelled.

**How it works:** A pivot — dial-up to broadband, shared to managed, colo to cloud, generic compute to
GPU — is **not a switch, it is a period of paying for two companies at once.** For **12–24 months** you
carry: the old platform's hardware, licences, transit and staff; the new platform's capex, hiring and
learning curve; **two support organisations**, because your old customers still need the old thing;
two sets of tooling, monitoring, documentation and compliance evidence; and the **marketing cost of
explaining what you are now.** Meanwhile the old line's revenue is declining and the new line is on a
J-curve.
**The mechanic:** a visible **Double-Carry meter** running for the declared transition period, showing
the combined fixed-cost base against the combined revenue, with the crossover date projected and moving.
**A pivot decided in a cash-rich quarter and executed through a cash-poor one is the single most common
way a well-run hosting company dies.**
**Win condition attached:** *Pivot* — derive **≥50% of MRR from the new line** (§6.10).
**Interacts with:** the Line J-Curve below, §6.10 Obsolescence (the failure to pivot), §6.11 (which
instrument funds the trough), §6.13 (the old line's committed-out obligations don't end when you decide
to leave).

### The Line J-Curve
New businesses lose money before they make it, on a curve whose shape is per-line.

**How it works:** Every new line has an explicit, visible profitability curve: **months 1–6 negative**
(capex, staff, no customers), **7–18 approaching breakeven**, **19+ contributing.** The player must fund
the trough. **The curve shape differs per line** — colo's trough is deeper and longer (fit-out,
absorption rate); a reseller line's is almost flat; a managed-services line's is shallow but long
because it is gated on hiring; a GPU line's trough is enormous and its upside is time-limited.
**Why it's good:** **opening a second line during a cash crunch becomes a specific, comprehensible
mistake** rather than a vague one.

### The dual-run cost
Migrations cost double for a while, and somebody pays for the overlap.

**How it works:** During **any** migration — customer-in, customer-out, platform-to-platform,
datacenter-to-datacenter — **both environments run.** A 6-week migration on a $12k/month footprint has
an **$18k overlap cost**, and **who eats it (you, as a migration incentive; or them, as a cost of
switching) is a negotiation.**
**The insight it unlocks:** **it's also why customers don't leave.** Data gravity (§6.6) *plus* dual-run
cost is the real switching cost — and it is the reason an ETF buyout (§6.12) sometimes has to cover the
dual-run as well as the fee.

### Internal transfer pricing
What your own lines charge each other — and why your worst line looks like your best.

**How it works:** Once you run multiple lines, your CDN line uses your transit, your backup line uses
your storage, your colo line houses your own gear, your managed line consumes your support desk. You
decide whether internal usage is **free** (simple, and it **hides which line is actually profitable**)
or **charged at market** (accurate, and it creates internal conflict and accounting overhead).
**Getting it wrong means your worst line looks like your best** — the CDN line that looks fantastic is
being subsidised by the transit line it never pays. **A real and very satisfying trap**, and the
mechanism behind the bundling trap in §6.5.

**Variations and additions**

- **Internal Chargeback, as an unlockable era-locked system.** At multi-datacenter scale you begin
  **billing yourself**: the cache service "pays" the storage tier. An **internal P&L per service class**
  makes *"why is the mail cluster a money pit"* legible at a glance, and you then **allocate headroom by
  internal budget rather than by clicking boxes** — a genuinely different verb for the same decision.
- **Its abuse, which is the good part.** Gaming internal transfers **to flatter the IPO scoreboard** —
  a lie with decimals, and exactly the sort of thing the Roast-Day mechanic exists to catch. **Era-lock
  it to tier-4+**, so it arrives as a symptom of scale rather than a starting complexity.

### Revenue per rack unit, per kW, and per engineer
The three unit-economics numbers that make the portfolio decision mathematical. Full entry in §6.9 —
**a GPU line can be brilliant on $/U and terrible on $/kW; shared hosting is the reverse; a managed
line looks great on both and destroys you on revenue-per-engineer.**

### The Secondary Market
Buying and selling the things you own — the mechanism that makes your assets liquid.

**How it works:** Four markets:
1. **Used hardware** — sell your cascade output (§6.6), or **buy a competitor's liquidation at 20
   cents on the dollar** (cheap capacity with an unknown maintenance history).
2. **IPv4 blocks** — an appreciating asset with a broker **and a due-diligence problem** (a block with
   a blacklist history is cheap for a reason).
3. **Customer books** — buy or sell a set of accounts with a **churn haircut** and a dual-run cost.
4. **Spot capacity** — rent from a competitor in an emergency at a punitive rate, or rent yours out.
**Why:** **it makes your assets liquid**, which turns a cash crisis from a death sentence into **a
decision about what you are willing to lose.**

### The Capital Cycle (bubble years and winter years)
The macro heartbeat that makes a long campaign more than a sequence of quarters.

**How it works:** Big purchases depreciate against a background cycle the game runs on its own clock:
**bubble years** (cheap money, GPU demand, everyone building) and **winter years** (customers vanish,
capex is stranded, and the used market is full of other people's liquidations). **Surviving the cycle
*is* late-game strategy** — and it is what converts "buy or rent" (§6.3) from an accounting question
into a timing bet.
**Interacts with:** §6.6 GPU volatility and the obsolescence clock, §6.14 the Secondary Market (winter
is when you *buy*), §6.11 financing (the instruments reprice with the cycle), §6.4 seasonality (which is
the same idea at 1/20th the wavelength).

### Portfolio synergies that pay actual bills
Diversification is usually hand-waved; here it has invoices attached.

**How it works:** **Peak-hour complementarity** (a business-hours line and an evening line share the
same capacity). **Peering-ratio complementarity** (an inbound-heavy line offsets an outbound-heavy one
and lowers your transit bill, §6.6). **Seasonal complementarity** (retail Q4 and education August).
**Interruptibility mix** (batch workloads make demand-response revenue possible, §6.2). **Support-load
complementarity** (a zero-touch line funds the headcount a high-touch line needs).
**And the anti-synergies:** correlated peaks (all e-commerce), correlated risk (all one carrier), and
correlated customers (all from one affiliate cohort) — which is the oversell homogeneity term in §6.5
pointed at the portfolio level.

### Carbon and water accounting
Two numbers with commercial consequences, and a third ethics dial.

**How it works:** A **carbon intensity** stat (gCO2/kWh, varying by grid, by time of day, and by
contract) and a **WUE** (water usage effectiveness) stat. Enterprise and public-sector customers
increasingly **require reporting; some require thresholds.** Improve them three ways: **efficiency**
(real, slow), **renewable procurement** (real, costs money, ties to the PPA in §6.3), or
**certificates** (fast, cheap — **and if the certificates are discovered to be low-quality, a
greenwashing reputation event**). **A third ethics dial beside bulletproof and astroturf**, and it
feeds the Externality Score (§6.9).

### Insurance vs redundancy as an explicit decision curve
Two purchasable curves per risk, and the crossing point is the answer.

**How it works:** For each risk the game shows **prevent** (redundancy, capacity, drills — expensive,
reduces *probability*) and **absorb** (insurance, reserves, credits, contract terms — cheaper, reduces
*consequence*). **Overlay them and the crossing point is where the correct answer flips.**
Low-probability/high-consequence risks (fire, total loss, lawsuit) sit on the **absorb** side;
high-probability/moderate risks (disk failure, bad deploy) sit on the **prevent** side.
**Why:** it gives insurance products and facility redundancy a **shared decision grammar** instead of
being two unrelated shopping lists, and it is a genuinely instructive model that generalizes to every
risk in the game.

**Variations and additions**

- **The third curve nobody draws: *transfer*.** Beside prevent and absorb sits the **Performance Bond**
  (§6.13) and the SLA credit cap (§6.12) — instruments that move the consequence onto a **counterparty**
  rather than onto a reserve. Adding it makes the decision grammar three-way and covers the enterprise
  lane, which neither of the original two curves reaches.
- **And the reflexive version:** late levels let you **become the underwriter of a rival**, at which
  point you are selling the absorb curve rather than buying it. (Full treatment under insurance, §6.3.)

### Meta-currencies (the War Chest, War Stories, and the case for just one)
What you carry between levels, and the argument that there are currently too many of them.

**How it works:** Three have been proposed on top of persistent Reputation (which gates which customers
will even talk to you):
- **The War Chest** — earned from efficiency: **under-spent upkeep converts to next-level cash.** It
  rewards *lean* play rather than tower-hoarding.
- **War Stories** — earned from **unusual disasters survived** (a hurricane *and* a nation-state *and*
  ransomware in one level). Spent in the HQ shop on lore cosmetics and start bonuses, which
  **encourages self-imposed chaos** — a rare currency that pays you to make your own life harder.
- **Postmortem tokens** — the existing per-level learning reward.

**Variations and additions**

- **The War Chest needs a cap-aware metric or it fights autoscaling.** Autoscaling **inherently wastes**
  — headroom, boot lag — so a War Chest that counts raw spend-down **punishes the autoscaler the rest of
  the game rewards.** Resolve it by defining efficiency as **utilization × uptime**, and have the War
  Chest count ***waste***, which a tuned autoscaler *reduces*. Synergy rather than contradiction.
- **De-duplicate the meta layer.** Four overlapping meta-economies (persistent reputation, War Chest,
  War Stories, postmortem tokens) is three too many for legibility. **Collapse them into ONE meta
  currency — "Lessons" — with two sinks (buffs vs. blueprints) plus a cosmetic trophy tier.**
- **Bootstrap-vs-VC as a meta ending.** Taking investor money is itself a meta-economy decision: a **big
  war chest now, a permanently lower score ceiling** through dilution; **staying bootstrapped unlocks
  the other ending.**
**Interacts with:** §6.9's Trophy Shelf (the cosmetic tier), §6.11 bootstrap vs venture, §6.14's
meta-economy entry below (which lists what carries forward *within* the fiction).

### The meta-economy across the campaign
What carries forward, and why the campaign is more than a sequence of levels.

**How it works:**
- **Technical debt carries forward.** Shortcuts in level 3 become failure probability in level 6.
- **Reputation (and Trust, per segment) carries forward** and gates which customers even talk to you.
- **Hardware carries forward and ages.** Machines bought in an early level are still there later, out
  of warranty, running an old OS, with **someone's production database on them.**
- **Institutional knowledge carries forward** as runbooks and retained staff, and **is lost on
  turnover.**
- **Relationships carry forward** — carriers, peers, vendors, the processor, and the customers you
  treated well.
- **Error budget surplus carries forward** — a clean level banks a little risk allowance for the next
  one (§6.1).
- **The Streak Ladder carries forward** (§6.9), and breaking a long streak hurts more than breaking a
  short one.
- **Company Valuation is the campaign meta-score** (§6.9), and the acquisition offer that ends the
  campaign reads all of the above.

**Variations and additions**

- **Deliberate difficulty pacing across the run.** **Early = tight** (every box hurts) · **mid =
  growth-debt choices** (expand before you can afford it, take the loan) · **late = cash-rich but
  opex-drowning** (the big-operator problem). Stated as a genre arc: **survival-puzzle → growth-sim →
  logistics-war.** It is the clearest available answer to "what does the economy *feel* like in act
  three," and it argues that the late game's antagonist is your own cost base rather than any threat.

---

## 6.15 The money design language (drawing the economy)

*An economy with forty cost lines and thirty-five metrics is unplayable as numbers. This subsection is
the visual grammar that makes it legible — and several of its entries are the *specification* that
existing entries above were missing.*

### Gold Is Reserved
**Nothing in the world is gold except money.**

**How it works:** No gold accents, no gold UI chrome, no gold lighting. When gold appears, it's cash.
**This single rule makes money legible in the busiest frame** and costs nothing to enforce.

### Money Always Moves
Revenue and cost are never *only* numbers; they are always also motion.

**How it works:** Money in flies toward the gutter; money out drips away; money reversed (a refund, a
credit, a chargeback) flies **backward**. **The player should be able to tell if they're winning with
the sound off and the numbers hidden.**

**Variations and additions**

- **Coin physics and money juice, specified.** Money is **always a physical particle**: coins **arc,
  clink, stack, drop.** A fine or a shockwave **sends every coin in flight falling out of the air** —
  *you watched money die.* Coins flow **inward from the customer towns** each wave (MRR made visible)
  and **outward to upstream, transit and power** — so you literally see who you work for. **The first
  coin after a big build plays a fanfare; refunds play the same notes downward.**
- **Coins ride the actual roads** between customer and HQ, which turns defence into economics you can
  trace with your eyes.
- **Coins have personality by denomination.** A blog customer pays in a **copper penny flick**;
  enterprise in a **gold brick on a rolling tray**; whale contracts in **a small treasure chest dropped
  by crane.** The gate is a fountain, and **the sound design pitches money by denomination.**
- **Money *travels*, it never teleports.** Every payment rides the cable network customer → billing →
  vault; **upkeep is a coin flowing the opposite way into a coal-hole under the map.** The cash-flow
  animation along the real topology doubles as teaching: **see where money funnels and you see where
  traffic flows.**

### Money at Three Scales (the LOD system)
Coin arcs are lovely at 40 customers and catastrophic at 40,000.

**How it works:** Three automatic LODs. **Discrete** (<~30 conversions/sec): individual coin motes,
individual ticks. **Drizzle** (30–500/sec): a continuous fine gold stream whose *density* is the rate
and whose audio becomes a texture rather than individual ticks. **Sheen** (>500/sec): **no particles at
all** — the conversion node carries a steady gold rim-light whose intensity is the rate, and the
counter simply rolls. **The transition must be smooth and automatic**, or DNS, serverless and IoT
levels will melt the frame budget.

### Per-Type Currency Glyphs
**The money you earn looks like the thing you sell.**

**How it works:** The coin mote itself takes the line's unit — a coin (generic), a **U-bracket** (colo
space), a **plug** (kW), a **slot** (game server), a **GB-month tile** (storage), a **minute** (VoIP), a
**GPU-hour chip** (AI), a **mailbox** (email), a **query fleck** (DNS), a **pass wedge** (satellite),
and a **patch cable** (cross-connect) — **which should be visibly the fattest, most satisfying money
glyph in the game, because it's the highest-margin line.**

### The Per-Visitor Coin (value as physical size)
Every converted visitor drops a coin **sized by its value**.

**How it works:** A page load drops a fleck; a colo contract drops an **ingot the size of a rack**.
Value is *physical size*, so **the relative worth of business lines is visible in a single frame**
without a single number.

### The Revenue Gutter
A horizontal channel along the bottom of the world view where earned coins collect and flow left into
the treasury.

**How it works:** **A healthy company has a visible *current* in the gutter. A struggling one has a
trickle.** It's a cash-flow meter made of particles, and it reads at a glance from across a room.

### The MRR Spine
A vertical stack of contract cards on the right edge whose **total height is your MRR.**

**How it works:** New customers slot in with a click; churned ones fall out and the stack settles.
**The stack's height is the number you care about most, and it's ambient rather than a readout.** Each
card carries its Contract Term Ribbon (§6.12), its SLA Tier Stripe, its Margin Tint (§6.5) and its
Anchor or Kite (§6.12).

**Variations and additions**

- **The MRR Ticker as a second heartbeat.** A prominent HUD ticker shows MRR climbing in real time:
  each new subscription adds a small **`+$19.99` popup flying into it**, churn subtracts with a **red
  strike-through.** And the typographic rule that makes it teach: **long-term money and incident money
  (one-time fees, fines) are set in *different typefaces*,** so the player learns the distinction by
  reading rather than by being told.

### The Recurring Pulse
On the monthly boundary, every contract card flashes gold in sequence — a wave down the spine — and a
large amount lands in the gutter. **Payday should be an *event* you look forward to and can hear.**

### The HQ Plaza (the composition law)
**Four competing HQ money metaphors, composed into one place instead of four corners.**

**How it works:** The MRR Fountain, Burn-Rate Smoke, Coin Physics and the Invoice Train all want to be
*the* money object at headquarters. Give each **one axis of a single fixed plaza**: the **fountain
front-and-centre** (revenue), the **chimney at the rear** (burn), the **ledger printer at the desk**
(history), the **train platform on the flank** (billing cycle). **A single glance answers income, cost,
balance and debt**, and each metaphor keeps its own ceremony without stealing another's real estate.
**Why it is a law and not a layout note:** without it, every subsequent money idea claims the same
corner — which is exactly what happened to the Gap Bar and the Two-Pan Scale (§6.4).

### The MRR Fountain
Recurring revenue as **the HQ fountain's spray height.**

**How it works:** Churn events visibly lower the water level; **a big enterprise close makes it
geyser.** The one-glance economic heartbeat of any level, and the natural centrepiece of the plaza.

### Burn-Rate Smoke
**The HQ chimney encodes profit.**

**How it works:** **White = thriving · grey = thin · black = bleeding.** And the detail that makes it a
mechanic rather than a mood: during a **cryptominer infestation the smoke turns black with nothing
visibly on fire.** Paranoia as a readout.

### The Invoice Train
Each billing cycle, **a tiny train departs HQ along the cable tray** loaded with coin wagons and
returns with payment blips.

**How it works:** **Late payments = the train coming back empty, with a sad horn.** The billing cycle
gets a shape, a direction and a sound, and dunning acquires a silhouette you can read from across the
room.

### Income as Fluid Light (the Vault as base HP)
Revenue as **luminous fluid flowing through invoice cables toward a glass vault.**

**How it works:** The **vault's fullness is your score-during-play**; **rate = brightness + flow speed**;
a big contract is **a fat pipe you can hear gurgling.** Monetizing attacks — ransomware, fines, refunds
— **drain it through a visible outflow pipe.** Protecting the vault becomes instinctive because **you
watched the coins pile into it all level.** *Money is architecture, not a counter.*

### The Meter
A **vintage electric-meter dial** that spins faster as revenue ticks up.

**How it works:** **The game's "money sound" is the meter's hum**, and **churning a big customer makes
it skip backward audibly.** Distinct from §6.15's Power Bill Dial, which measures what you *spend* —
same industrial vocabulary, opposite direction, and deliberately so.

### The Ledger Tape
A receipt printer in the bottom-right of the chrome.

**How it works:** Prints one line per financial event in real time, in monospace, spooling a little
paper tail. You can scrub it. **The game's financial log, the transaction feed, and a lovely
period-appropriate texture all at once.**

**Variations and additions**

- **The Dot-Matrix Ledger.** A **physical printer beside HQ** spews a perforated strip on every
  transaction; big events print a **header row** (`SLA CREDIT — $12,000`); **the paper pile grows and
  can topple.** Balance history becomes **literal debris you can be ashamed of.**
- **Odometer digits.** All large sums roll on **odometer wheels with a `+N` flash chip.** **A
  fast-draining odometer is the most legible "we're bleeding" tell ever invented.**

### The Ledger Drawer, specified
The object exists elsewhere in the document; here is its document design, without which it is "a panel
with a drawer animation."

**How it works:** A **ring binder** that slides out over the bottom third of the screen. **Tabbed
dividers in five colours**, one per block. Pages are **accounting stock** — pale green ruled paper,
tabular figures in a typewriter-adjacent face, hand-annotated totals in blue pen, **a red pen circle
around anything that's bad.** Cash-flow pages use a real column-and-rule layout. **The P&L's "Technical
Debt Service" line is printed in the same typeface as everything else, which is what makes the joke
land.** Closing it is a physical snap.

### The Gap Bar
The specification for §6.4's Cash-vs-Profit, where **the gap is the widget rather than the byproduct of
two widgets.** Full entry in §6.4.

### The Burn Candle
Your net burn as a candle in the HUD.

**How it works:** Tall and steady when profitable (actually a candle *growing*); shrinking with a
visible wick length when burning cash. **Runway in days = candle length.** **Nobody needs the word
"runway" explained after seeing this once.**

**Variations and additions**

- **The Runway Meter (the liquid alternative).** Cash as **liquid in a glass fuel-gauge column beside
  HQ**: an outflow **trickles from a tap at the bottom in proportion to burn**, and inflow **splashes in
  from the coin fountain.** **Death is the gauge visibly empty.** Candle and column read the same
  number; pick per act, and never ship both in the same corner (see the Two-Pan Scale tension).

### The Drain Choir
§8.7's money-as-motion has thin falling streams going out. **Name and label them or they're
decorative.**

**How it works:** Below the cash column, **five labelled streams** fall continuously at rates
proportional to spend: `POWER`, `PAYROLL`, `TRANSIT`, `LICENCES`, `DEBT`. Each has a slightly different
particle and **a slightly different pitch in the audio bed.** Hovering one **freezes it and traces it to
the objects producing it**, highlighting them in the world. **You can see and hear your burn rate broken
down**, and "which of these can I cut" becomes a click rather than a menu dive.

**Variations and additions**

- **Money Hydraulics (the plaza-scale version).** Income and expense drawn as **two distinct visible
  pipe systems** entering and leaving the HQ plaza — **thick gold in from the customer towns, thin grey
  out to upstream and power.** When the outflow thickens toward the black-smoke ratio, **the pipes hum
  lower.** The choir is the breakdown; the hydraulics are the silhouette.

### Capex vs Opex Split Bar
A single bar in **two materials**: capex rendered as **solid metal blocks** (things you bought), opex as
a **flowing liquid** (things that drain). **The material difference makes an accounting concept
intuitive** with no text at all.

### The Two-Pan Scale
An optional HUD widget: a physical balance with revenue on one pan and costs on the other, tilting in
real time.

**How it works:** Great for streams, great for glances, **terrible for precision** — which is why it
sits *next to* the exact numbers, not instead of them.
**⚔️ Tension:** the scale and the liquid column are two money metaphors competing for the same corner.
Merged position (per the visual lens's own second pass): **pick the column** — it reads at a glance and
supports the Gap Bar — and **demote the scale to an optional Ledger Drawer widget.**

**Variations and additions**

- **The Burn-vs-Earn Split Gauge.** One gauge with **a gold needle (revenue) and a red needle
  (upkeep)**, and **scoring tiers drawn as *regions on the gauge*** — so the win condition is literally
  **the needle spread**, readable at a glance. A third contender for the same corner, and arguably the
  strongest of the three for a stream audience, because the scoring bands are *on the instrument*.

### The Invoice Bird and the Dunning Ladder
Full entries in §6.4 — invoices as a flock, escalation as a ladder you can watch a customer climb.

### The Invoice Calendar Strip
Full entry in §6.4 — 31 cells with icons on the days that matter. **Cash becomes a timing puzzle you
can see the shape of.**

### The AR Aging Shelf
Full entry in §6.13 — four trays, slips sliding right and yellowing as they age.

### The Overage Meter
Full entry in §6.2 — a tank filling past a marked line, with the coin flow turning a brighter, greedier
gold beyond it.

### Setup Fee Confetti
One-time fees drop as a burst that is **brighter and once**, distinguishable from recurring gold.
**Teaches the difference between one-time revenue and MRR without a word.**

### The Upsell Handshake
A successful upsell adds a coloured stripe to the customer card and **the card grows taller with a
satisfying push.** Growth *within* an account is visibly different from a new account.

### The Marketplace Shelf
Add-ons drawn as products on a shelf in your storefront; **attach rate is how many customers are
carrying your shopping bag.** Very readable, very retail.

### The Cross-Connect Faucet
Every cross-connect adds a small faucet dripping gold. **A meet-me room full of faucets is a picture of
an extremely good business.**

### The Power Resale Meter
A spinning utility meter dial mounted on each cage. **You literally sell the spinning of a dial.**

### The Upkeep Drip
The constant ambient cost, always visible, always draining. The baseline against which every revenue
stream is read.

**Variations and additions**

- **Upkeep as Pilot Lights.** Every running buildable burns **a small amber pilot flame**; new tiers mean
  **more flames across the room**, so cost scales *viscerally* with brightness. **When cash runs low the
  flames start guttering** — a warning system the player built themselves, one purchase at a time.

### The Power Bill Dial
A utility meter on your facility wall whose **dial speed is your live power draw.** Turning on a GPU row
makes the dial visibly *whirl*. At month end it stops, the number is read, and **a very large coin
leaves the treasury.** Cause and effect, drawn. The **demand-charge ratchet line** (§6.3) is a scar
across the same graph that does not go away.

### PUE as a Leak
The proportion of the incoming power ribbon that doesn't reach the racks **visibly leaks out sideways**
into cooling and losses. Improving PUE narrows the leak. **An abstract efficiency metric becomes a
picture of waste.**

### The 95th-Percentile Graph, specified
Full entry in §6.3 — the top 5% **lifted and greyed out**, floating above the plot as **countable**
discarded confetti (36 hours' worth), with the bill drawn as a heavy rule **labelled in dollars, not
Mbps**, and the commit level as a second dashed rule. **Best financial-mechanic visualization in the
document.**

### Payroll Pulse
A biweekly red pulse across the staff roster and a chunk leaving the treasury. **Staff cost is
rhythmic, unavoidable, and visible.**

### The Lease Stamp
Facility rent as a big rubber stamp on the ledger tape each month. **Bigger facility, bigger stamp,
bigger noise.**

### The Depreciation Fade
Owned gear's card value fades over time; end-of-life gear is nearly transparent on the balance-sheet
widget **while still being fully solid in the world.** **The gap between "book value" and "still
working" is drawn** — genuinely educational.

### Shipping & Lead Time
Ordered gear crosses the region map as a truck or plane icon with an ETA. **Expedited shipping is a
visibly faster, gold-tinted vehicle.** You pay for speed and you watch it arrive early.

### The Remote Hands Clock
Every minute a datacenter tech works for you is a visibly ticking meter, like a taxi. **You will
hurry.**

### The Incident Cost Meter
During an outage, a red counter accumulates in the top bar: **lost revenue + SLA credits + staff
overtime**, all ticking upward. **It's a stopwatch that costs money and it's the most motivating object
in the game.** Shares the **Taxi Meter** widget with toll fraud, egress shock and recursive invocation
— **one horrible clicking object, five systems, one sound the player will come to dread.**

**Variations and additions**

- **The Downtime Ticker.** During outages a **red corner counter audibly counts refunds and SLA
  credits**; **closing the outage stops the ticking.** Relief made diegetic — the absence of a sound is
  the reward.
- **Incident-Cost Receipts.** Every big failure — breach, outage — prints **a long thermal-receipt
  scroll of itemized costs unrolling dramatically across the bottom of the screen.** **The paper length
  is the joke and the pain.** After a successful attack, **the receipt prints out of the affected
  machine**: the fail state with a beautiful, awful paper aesthetic. (The itemization itself is §6.3's
  cost-of-a-breach entry.)

### The Technical Debt Ledger
Deferred maintenance drawn as **literal IOU slips pinned to the affected objects.** They accumulate,
each raises that object's failure probability, and **paying down removes slips with a satisfying
tear-off.**

### The Price Dial + Demand Ghost
Full entry in §6.5 — turn the dial and a **ghost preview** of the resulting visitor stream renders live
next to the real one. **You see elasticity before you commit.**

**Variations and additions**

- **Price Signs You Physically Post.** Pricing as a **buildable action**: the player places and adjusts
  **a literal signboard at the gate**, and **the sign's font weight *is* the UI.** Grabbing the dial
  makes **the spawn ring shimmer denser or sparser live**, with the bargain-traffic tint shifting
  toward the abusive-tenant palette — **the tradeoff previewed before you commit.** And the **customer
  species mix at the market edge visibly shifts**: setting high attracts suits and repels mice.

### The Competitor Price Tag
Rivals' prices as tags hanging at the edge of your market view. **Price wars are a tug-of-war you can
watch.**

### The Margin Tint
Every service and customer card carries a background tint from green (high margin) to **rust** (losing
money). **Scanning your customer file for rust tells you who to fire.**

### The Oversubscription Slider
A slider with a visible green safe zone, a yellow zone, and **a red zone where your tenement windows
start flickering.** Greed and risk in one control.

### The SLA Tier Stripe
Bronze/Silver/Gold/Platinum are **literal stripes on the contract card and on the corresponding
infrastructure.** High-tier customers' gear **glows slightly**, so you know which rack you absolutely
cannot take down. **Spatial risk awareness from a stripe.**

### The Contract Term Ribbon
Full entry in §6.12 — remaining term as visible ribbon length. **A wall of short ribbons is a visible
business-model problem.**

### The Three-Clock Cluster
The pacing heuristic, given the UI it never had — **the largest unbuilt HUD element in the document.**

**How it works:** Three concentric dials in one corner instrument, sized small/medium/large and sharing
a face. **Inner (fast)** — the current wave or incident, a fast sweep hand, red when running. **Middle
(medium)** — the month, the maintenance window, the migration, drawn as a filling arc **with the
invoice-calendar ticks on it.** **Outer (slow)** — the contract, the audit, the era, drawn as a
barely-moving arc with one marker. Each hand has a tiny label.
**The rule it enforces:** **if a fourth timed system is proposed and there is no ring for it, it
doesn't ship.** The instrument enforces the pacing heuristic rather than merely displaying it.

### The Runway Tone Shift
Full three-stage spec in §6.4. **Nothing flashes, nothing pops. It just gets quieter and colder.**

### The Instrument Cluster (one bezel, many faces)
Full entry in §6.9 — the shared industrial design that keeps ~25 per-line signature meters from reading
as a flea market.

### The Report Card, the Grade Stamp, and the Diligence Memo
Full entries in §6.9 — embossed stamps on heavy paper, an off-register rubber stamp with a hand-written
title, and a three-page memo with red sticky tabs. **The screenshot people post is the stamp.**

### The Sankey Payoff and Money Left On The Table as negative space
Full entries in §6.9 — the one place a chart beats a metaphor, and **the missing money drawn as a
silhouette above the bar you achieved.**

### The Trophy Shelf and the Grade Curve Portrait
Full entries in §6.9 — your office as a museum, and a generated portrait of the facility as it ended.

### Chargeback Flies and Fraud Pops
Failed money, rendered as vermin.

**How it works:** **Failed billing turns into literal flies buzzing out of the vault**, leaving
coin-dust trails — **a pest class that hints at its own cure** (the dunning turret). Separately, **paid
coins occasionally fly *back* mid-arc with a red receipt** (a fraud reversal). **Money in motion is
reversible**, which is what makes anti-fraud buildables — velocity checks, verification windows — feel
like **interceptors** rather than filters.

### SLA Contract Pin and Lightning
The active contract as **a pinned paper document that visibly tears.**

**How it works:** The SLA sits **pinned in the HUD corner**; **breaches tear lines of red pen across
its text in real time**, and a **full tear is a page-flip fail animation.** A missed SLA fires **a thin
red lightning strike from the customer's contract hourglass to your cash column**, with a floating
penalty slip — **choreographed so players *watch* it happen** rather than notice it afterwards. On
breakage, **small bills fly out of the vault on their own**: a visible penalty flock. **The apology is
financial and animated.**

### The Error-Budget Hourglass
The §6.1 spine, finally given an object.

**How it works:** A **reliability hourglass per level**: **incidents drain sand, time refills it, and
risky changes require sand to spend.** One glance answers the question the entire error-budget mechanic
exists to pose — ***can I afford to touch prod right now?*** Without this object the budget is a number
in a drawer; with it, it is the thing your hand hovers over.

### Insurance Wall of Frames
Policies as **framed documents on the HQ wall.**

**How it works:** **Filing a claim flips one frame to a grey photocopy with a CLAIMED stamp.** **An
empty frame means a fraud audit is pending.** Your coverage history is a wall you walk past, and the
gaps in it are the part you notice.

### The VC Puppeteer
Outside money, drawn as **strings.**

**How it works:** Taking investment lays **a faint translucent hand-and-strings over the HQ**; growth
quotas render as **a boardroom countdown clock on the sky, visible only to you**; and **after a failed
round the investors lift their hands off — and the building stands a little straighter.**
**The credit-line counterpart:** an **overdraft bar with an interest-rate ticker crawling beneath it**;
spending into it **tints every purchase button red** and adds a **late-fee coin-drip.**

### Spot-Market Weather
Transit, IP and hardware prices as **a ticker woven into the HUD.**

**How it works:** Prices fluctuate live; **buying burst capacity on the green tick is a micro-skill**
rather than a menu choice. **The ticker's font matches each act's era**, which quietly dates the
market as well as the hardware.

### Season-Pass Contracts
Annual prepay, drawn as an **obligation you can feel.**

**How it works:** Annual-prepay customers land as **a fat briefcase up front**, and then **their auras
become *locked gold*** — the money is in the bank and the service year is not. **Churning a prepaid
account triggers a bigger, louder storm** than churning a monthly one, because it should. Pairs with
§6.2's Anchor and §6.13's deferred-revenue layer.

### Cost-on-Hover Chits
Economic grammar instead of number walls.

**How it works:** Any hover shows **price as physical coin-stack icons** and **upkeep as a tiny
chimney-smoke glyph.** The richer variant — **Price Tag Everything** — pops **a hang-tag on a string**
carrying **cost, upkeep, revenue and current risk in one card.** Four numbers, one physical object, no
panel.

### The Profit Glow
Cashflow as **colour grade.**

**How it works:** At positive cashflow the whole facility takes on **a subtly warmer grade** and **the
ambient LED hum rises**; losses **creep desaturation in from the edges.** You feel the trend before you
read it, which is the entire ambition of §6.15 in one effect.

### Revenue-Mix Mobile
End-of-level revenue composition as a **hanging kinetic sculpture.**

**How it works:** Each segment's size is a revenue stream — hosting vs support vs add-ons — and the
mobiles are **diegetic charts, collectible per level.** The Sankey is for reading; the mobile is for
keeping.

### Customer Lifetime Trail
Tenure drawn as **a warm wake.**

**How it works:** Each customer sprite leaves **a faint warm trail of their historical payments.**
**When they churn, the wake *cuts*** — churn as the loss of colour history rather than the loss of a
row. Gut-punch legible, and it makes long-tenure customers visibly different objects on the board.

### The Reputation Sky-Gauge
**Ambient weather doubles as the long-term economy read.**

**How it works:** **Clear skies = premium pricing power; storm = discounts needed.** **Players learn to
look up**, which is the cheapest possible HUD element: none.

### The Dust Sheet Ending
On failure, the camera pulls back and **dust sheets fall over the racks, row by row, and the lights go
out from the far wall toward you.** No text needed.

### Bankruptcy Cascade
Financial failure drawn as **progressive shutdown**: first the ambient lighting, then the non-critical
racks, then cooling, then the sign outside goes dark. **It should take 15 seconds and hurt the whole
time.**

### The Acquisition Ending (good)
Success can end with a competitor's logo appearing next to yours on the sign — **or your logo going up
on *their* building.** **Endings expressed as signage.**

### Par Ghost
Each level has a "par" run rendered as a **faint ghost line on the incident timeline and the revenue
graph**, so you can see where you diverged from a competent operator.

---

## 6.16 Baseline tuning numbers

*The problem wave-2 identified bluntly: **§6 is eleven subsections of excellent economic concepts and
contains essentially no numbers. Nobody can tune, balance, or even imagine the game from it.** Three
lenses independently proposed a starting baseline. **All three are preserved below** — they are
offered as a spine to argue with, not as gospel, and where they disagree the disagreement is flagged
rather than averaged away.*

**⚔️ Tension (read this first):** the three sheets below are pitched at **different tiers and
different eras** and therefore disagree on unit costs — a web node is $1,800 in Sheet A and $3,200 in
Sheet B, and monthly upkeep per node ranges $45–$190. They are not contradictory so much as
unreconciled: Sheet A is "Tier 1–3, your own boxes, upkeep = power + space only"; Sheet B is "Tier 2–3,
upkeep includes a share of transit, licences and monitoring"; Sheet C is "real-market retail and
wholesale prices, mid-2020s." **Pick one as canonical, state which convention 'upkeep' follows, and
derive the others from it** — the merge deliberately does not choose.

### Sheet A — the starting-position baseline
*Tier 1 through 3, one owned box scaling to a rack. Upkeep = power + space only.*

**Starting position (Tier 1, one owned box):** cash **$4,000** · MRR **$0** · upkeep **$180/mo** ·
**1 hand.**

**Buildable capital costs (Tier 2–3 scale):**

| Object | Capex | Monthly upkeep |
|---|---|---|
| 1U web server | $1,800 | $45 (power + space) |
| App server (2U, dual CPU) | $3,400 | $80 |
| Database primary | $6,500 | $140 |
| Read replica | $4,000 | $95 |
| Cache node | $1,200 | $35 |
| Object storage node (12-bay) | $5,500 | $120 |
| Top-of-rack switch | $2,500 | $25 |
| Core switch (pair) | $16,000 | $120 |
| Firewall appliance | $4,500 | $90 + $150 licence |
| L7 load balancer | $3,000 | $70 |
| Cabinet (rented) | — | $700–1,200 incl. 5kW |
| Cabinet (in your own building) | $18,000 fit-out | $0 rent, $340 power |
| UPS (rack, 6kVA) | $4,200 | $30, batteries every 4 yrs |
| Generator (250kW) + ATS | $95,000 | $600 + fuel + testing |
| CRAC unit | $28,000 | $400 |
| Transit, 1Gbps commit | — | $600–1,400 (region-dependent) |
| IX port, 10G | $1,500 install | $400 |
| Cross-connect | $300 install | $80–300 (**and you *charge* this at colo tiers**) |
| WAF (managed) | — | $250 + $0.60/GB |
| DDoS scrubbing retainer | — | $900 + per-incident |
| CDN | — | $0.02–0.08/GB |
| Backup storage | — | $6/TB/mo (hot), $1.20/TB/mo (cold) |
| Control panel licence | — | $2.50–8.00 per account |
| Monitoring (per layer) | — | $80 / $150 / $400 / $700 / $1,100 |

**Staff (fully loaded monthly):** intern $1,800 · junior sysadmin $4,500 · sysadmin $7,000 · senior SRE
$11,000 · network engineer $10,000 · DBA $10,500 · security engineer $11,500 · support T1 $3,600 ·
support T2 $5,500 · sales rep $6,000 + commission · account manager $6,500 · abuse analyst $5,000 ·
DC tech $5,000 (**or remote hands at $180/hr, 4-hour minimum**).

**Revenue units:** shared account $5–12/mo · managed WP site $30–90 · VPS $6–60 · dedicated $90–400 ·
colo cabinet $700–1,600 + power · cross-connect $80–300 · game server slot $3–15 · mailbox $1.50–5 ·
DNS zone $0.50–4 · CDN $0.02–0.08/GB · object storage $0.015–0.025/GB/mo + egress · backup
$8–25/TB protected · GPU-hour $0.90–4.50 · scrubbing $400–4,000/mo per protected prefix.

**Three derived sanity checks the game should surface, because they reframe the whole game:**
1. **Payment fees are 13% of a $3 plan and 0.6% of a $500 plan.**
2. **A single support ticket costs $14–22 fully loaded.**
3. **A 1U server at $1,800 over 48 months is $37.50/month of pure depreciation** before you pay for
   power, space, or anyone's time.

### Sheet B — the opening tuning spine (with time, pressure, and patience)
*Tier 2–3, modern era, web hosting, and it scales from there. Upkeep includes a share of transit.*

**Time.** At 1× speed, **1 real second = 1 simulated minute** of infrastructure time. The **business
month advances every 4 real minutes.** A 20-minute level = **5 in-game months = 1 quarter.** Waves
arrive on an **85–110 second cycle** (a "day" of traffic compressed).

**Money.**

| Item | Capex | Monthly upkeep |
|---|---|---|
| Web node (2U, mid) | $3,200 | $190 (power, space, share of transit) |
| Database primary | $9,000 | $520 |
| Read replica | $6,500 | $380 |
| Cache node | $2,100 | $120 |
| Load balancer pair | $7,000 | $420 |
| Firewall | $2,500 | $150 |
| WAF (managed) | $0 | $600 + $0.40/1k requests |
| Monitoring stack (tier 2) | $1,200 | $240 |
| Backup vault (10TB, immutable) | $4,500 | $310 |
| Scrubbing retainer | $0 | $900 always-on, $2,500/incident on-demand |
| Junior sysadmin | — | $5,400 loaded |
| Senior SRE | — | $11,000 loaded |
| Support T1 | — | $3,900 loaded |

**Revenue anchors.** Shared account **$5.99/mo** · VPS **$22** · Managed WP site **$35** · Dedicated
**$189** · Colo cabinet + 5kW **$1,450** · Cross-connect **$290** · GPU-hour **$2.10** · Backup
**$0.019/GB-mo** · Game server slot **$0.85/slot-mo.**

**Health ratios the game should teach by making them visible.**
- **Upkeep as % of revenue:** **<45% = under-built** (you'll be caught out) · **55–70% = healthy** ·
  **>80% = one incident from insolvency.**
- **Support cost as % of revenue:** **>30% means your plan tier is wrong** (unlocks cost-to-serve).
- **CAC payback must be under 60% of average tenure** or the growth is a cash bonfire.
- **Headroom below 25% doubles incident cost.**

**Wave pressure.** `P(n) = 100 × 1.115^n × S(n)` where `S` is the sawtooth
`[1.0, 0.55, 1.3, 0.7, 1.55, 0.6, 1.75, 0.65, …]`. **Role quota:** at most two threat roles may exceed
30% of a wave's pressure, and **every fourth wave must introduce a role not seen in the previous
three.**

**Patience (ms budgets; bounce at 50% of curve).** Skimmer 1,800 · Mobile Commuter 1,100 (arrives at
60% patience) · Desktop Regular 3,500 · Deep Reader 4,200 · Impulse Buyer 900 · Comparison Shopper
2,400 · Buyer/Checkout 3,000 across 6 hops · Enterprise Evaluator **∞ latency / finite *evidence*** ·
API Client **hard-fails at 5,000** · Streamer: no TTFB sensitivity, rebuffer tolerance 2 events per 10
minutes.
**Bounce curve:** sigmoid — **10% at 0.6× budget, 50% at 1.0×, 95% at 1.6×.** **Not linear; the cliff
is the point.**

**Values (bounty).** Skimmer 1 · Deep Reader 4 · Comparison Shopper 6 · Impulse Buyer 28 · Checkout
Buyer 50 · Power User 12 (**but 5× load**) · Enterprise lead 900 · **Colo lease signature 20,000** ·
Reviewer ±180 reputation-equivalent · Influencer: **400 future spawns.**

### Sheet C — the real-market number sheet
*Mid-2020s North American/European market, small-to-mid operator. Approximate, and meant as design
anchors so the sim has somewhere honest to start.*

**Prices, retail**
- Shared hosting: **$3–15/mo advertised** (usually as annual prepay), **renews $9–25**
- Managed WordPress: **$25–100/site/mo**
- VPS: **$5–40/mo** (2–8GB)
- Dedicated: **$80–400/mo**
- Colo: **$500–1,400/cabinet/mo** retail at 3–5kW; **$120–180/kW/mo** at wholesale scale
- Cross-connect: **$100–350 MRC, $250–500 NRC**
- IP transit: **$0.15–0.60 per Mbps/mo** at 10G+ commit in major markets
- IPv4: **~$30–50/address** to buy, **~$0.50–0.80/address/mo** to lease
- Backup/DR: **$0.02–0.12/GB/mo** depending on RTO tier; **retrieval fees separate**
- GPU (H100-class): **$2–4/GPU-hr in 2024**, drifting to **$1.5–2.5**; **reserved 30–50% below spot**

**Costs**
- Power: **$0.06–0.14/kWh** commercial; **1kW continuous ≈ $65–100/mo at the meter, × PUE**
- PUE: **1.1–1.25** modern purpose-built · **1.4–1.8** retail colo · **2.0+** legacy
- Server: **$1,500–4,000** commodity 1U; **8×H100 node $250–400k**
- Depreciation: **3–5 years straight line; residual 10–20% at year 4**
- Payment processing: **2.9% + $0.30** retail; **1.5–2.5% interchange-plus** at volume;
  **$15–25/chargeback**
- Loaded staff: support agent **$45–75k US / $12–22k offshore** · sysadmin **$75–115k** · SRE
  **$130–190k** · DC tech **$45–70k** · **loaded multiplier 1.25–1.4×**
- Support: **15–30 tickets/agent/day**; **$4–12/ticket US, $1.50–4 offshore**
- Control panel licence: **$2–20/account/mo** depending on tier and vendor mood

**Rates**
- **Monthly logo churn:** shared 3–6% · VPS 4–8% · managed WP 1.5–3% · dedicated 1–2% · colo 0.3–0.8% ·
  enterprise managed 0.2–0.5%
- **Involuntary churn as a share of gross churn:** 20–40% (recoverable to 30–50% of that with dunning)
- **Payment failure rate on active card subscriptions:** 5–9%/month
- **Free-to-paid conversion:** 1–4% (**unverified free tiers: 30–60% of signups are abusive**)
- **Trial-to-paid with a card on file:** 35–60%
- **Affiliate CPA (shared hosting):** $65–150, with a **45–90 day clawback**
- **CAC payback target:** under 12 months; **LTV:CAC above 3:1**
- **Support cost as % of revenue:** healthy under 15%; **dead above 30%**
- **Gross margin targets:** shared 70–80% · VPS 60–75% · managed 55–70% · dedicated 45–60% · colo
  55–70% after power · backup 60–75% · GPU 40–60% when hot · bandwidth resale 20–40%
- **Bad debt:** 2–4% consumer, <0.5% enterprise
- **Revenue leakage:** **2–5% of MRR unbilled at any given time** in an unmanaged operation
- **Colo occupancy target:** 85%+; **below 65% the building loses money**
- **GPU utilization breakeven:** ~55–65%; **above 90% you can't do maintenance**

### Derived tuning constants worth stating once
*Formulas scattered above, collected here so a designer can find them.*

- **Contention probability (oversell):** `P(contention event per wave) = (ratio/10)^2.2 × homogeneity`.
- **Technical debt interest:** `0.8% of estate value per month per debt point`; a Paydown project costs
  `3 months of that debt's interest` to remove one point.
- **Cost of a nine:** `~3.5× infrastructure cost and ~2× operational discipline per additional nine`;
  the fifth nine is not purchasable.
- **Error budget:** `(1 − commitment) × 30 days`, in minutes — 99% = 7h 18m · 99.5% = 3h 39m ·
  99.9% = 43m · 99.95% = 21m 36s · 99.99% = 4m 19s.
- **Wave pressure:** `P(n) = 100 × 1.115^n × S(n)`, sawtooth `S`.
- **Bounce curve:** sigmoid — 10% at 0.6× patience budget, 50% at 1.0×, 95% at 1.6×.
- **Grade bands:** S ≥ 92 · A ≥ 82 · B ≥ 70 · C ≥ 58 · D ≥ 45 · F below.
- **Default score weights:** Uptime 30 / Performance 20 / Profitability 30 / Growth 20, plus a per-type
  fifth axis worth 20 displacing proportionally — **or** the conversion-first alternative, Conversion
  35 / Profitability 25 / Resilience 20 / Growth 20 (⚔️ see §6.9).
- **Healthy budget split:** Grow 45 / Defend 25 / Sustain 30.
- **Rolling reserve cash impact:** `reserve % × monthly card revenue × reserve months`, one-time, then
  steady state.
- **Line J-curve:** months 1–6 negative, 7–18 approaching breakeven, 19+ contributing (deeper and
  longer for colo, near-flat for reseller).
- **Pivot double-carry:** 12–24 months of two complete cost bases.

### Sheet D — additional anchors that do not conflict
*A second document's figures for dials the sheets above leave unstated. Listed here so they are not
mistaken for competing versions of Sheets A–C.*

- **Commit discount for a 3-year customer contract:** **~40% off list** (compare the term matrix in
  §6.12, which reaches a similar place by a different route, and reserved GPU at 30–50% below spot).
- **Cross-connect MRC, tenant-side:** **$150–300/month, forever** (inside Sheet C's $100–350 band).
- **Cooling overhead:** **every watt of compute buys ~0.4W of cooling** — i.e. PUE ≈ 1.4, the retail-colo
  band — and **cooling grows super-linearly with heat.**
- **Connected-power overcommit in colo:** provision **~1.2× actual diversified demand** on sold amps
  (matching the 1.2:1 "safe" diversity detent in §6.5's oversell table); pushing further raises margin
  until a heat wave trips breakers.
- **SLA credit scaling:** **5–100% of the monthly fee per tier**; **enterprise contracts carry 10×
  multipliers** plus liquidated damages beyond ordinary credits; higher tiers **require 2N redundancy**
  to underwrite.
- **Error-budget headline figures as operators quote them:** 99.9% ≈ **43 min/month**, 99.99% ≈
  **4.4 min/month** — the same constants as §6.1, restated because *this* is the number that is
  the difficulty curve.
- **Rolling reserve:** **~10% of card revenue**, released on a **compressed 180-day** delay.
- **Invoice factoring:** **3–5% haircut** on the invoice (the same instrument Sheet-side as §6.11's
  1–3% per 30 days).
- **Rule of 40 gate:** growth% + free-cash-flow% **≥ 40** to unlock the friendly end of the late-campaign
  investor and market events.
- **CAC payback bands:** **<12 months = investor-patience buff · >18 months = "growth without funding"
  fails** (compare §6.16's "under 60% of average tenure").
- **Revenue-leakage callout size:** a late-game audit that tells the player **"you gave away $4,200 this
  month"** — the readable form of Sheet C's 2–5%-of-MRR figure.

### Per-type gross-margin bands — *CONFLICTING*

Both documents state gross margin by hosting type, and for **colo and GPU they give materially different
numbers for the same dial.** This is not a rounding difference: a colo line at 55–70% is a good business
being run well, and the same line at 40–50% is a real-estate business with thin cover — and they imply
different correct decisions about power resale, occupancy targets and whether colo is the "safe" line.

#### Position A — Sheet C's bands *(master)*

**Shared 70–80% · VPS 60–75% · managed 55–70% · dedicated 45–60% · colo 55–70% after power · backup
60–75% · GPU 40–60% when hot · bandwidth resale 20–40%.** Stated as mid-2020s North
American/European small-to-mid-operator anchors, consistent with the rest of Sheet C (power at
$0.06–0.14/kWh, transit at $0.15–0.60/Mbps, support at $4–12/ticket).

#### Position B — the two design cheat sheets *(opencode)*

**The per-type margin profile sheet:** **shared ~70% gross if the overcommit is right and −200% if
support explodes** · **VPS thin and metered, winning on scale + docs** · **colo ~40–50% on the real
estate, capex-heavy** · **GPU fat during mania, negative on idle** · **backup low per-unit, eternal
tenure** · **email/DNS pennies, volume, poisonable** · **regulated huge margins, slow deals, cert
costs** · **bulletproof 80% until seized.** Scoring weights **sustainable margin, not revenue.**

**And the earlier pressure-meter version, which disagrees again:** **shared ~80% until support load ·
colo ~50% · cloud 60–70% with churn down · GPU 70% *today*, collapsing as spot prices fall ·
offshore 90% until seized.**

**What the disagreement turns on:** Position A quotes **steady-state margins for a competently run
line**; Position B quotes **the top of the range with the failure mode attached** ("~70% *if the
overcommit is right*, −200% *if support explodes*"). Position B is therefore more useful as **a
designer's tension table** and Position A as **a simulation baseline.** Shipping both means picking
which one the *in-game* margin readout agrees with — and it must be one of them, because the player
will compute it.

### GPU hourly price and the collapse curve — *CONFLICTING*

The two documents give different absolute prices *and* a different decay rate for the same asset, which
matters because **the GPU line's entire drama is the mismatch between the financing term and the price
curve** (§6.6). A shallower curve makes GPU a cyclical business; a steeper one makes it a bomb.

#### Position A — $2–4/hr drifting to $1.5–2.5 *(master)*

**H100-class at $2–4/GPU-hour in 2024**, drifting to **$1.5–2.5**, with **reserved contracts 30–50%
below spot**, against **$250–400k per 8×H100 node** and a **utilization breakeven at ~55–65%.** Roughly
a **35–40% decline** over the modelled window: painful, survivable, and it makes contract-term coverage
the deciding stat.

#### Position B — $8/hr collapsing to $2 in two years *(opencode)*

**H100 at $8/hr falling to $2/hr in two years** — **a 75% collapse**, cited explicitly as *depreciation
as an economic threat*, alongside "GPU 70% margin today, collapsing as spot prices fall." At this rate,
**hardware financed for four years against a market that reprices in two is an extinction event**
rather than a bad quarter, which is the version that makes the GPU level a horror story.

### Oversell ratio detents — *CONFLICTING*

The headline shared-hosting overcommit ratio differs by an order of magnitude, and it is the single
most consequential number in the shared-hosting line.

#### Position A — 5:1 safe, 12:1 aggressive, 20–30:1 reckless *(master)*

The honest-detents table, with **per-resource failure shapes** (CPU degrades gracefully, RAM
catastrophically, storage stops dead, power trips a breaker) and the correlated-failure formula
`P(contention event per wave) = (ratio/10)^2.2 × homogeneity`. At these values the reckless end is
**20–30:1** and the model's whole point is that **the same ratio is prudent on one axis and suicidal on
another.**

#### Position B — 400:1, or "sell 500 plans on hardware sized for 50" *(opencode)*

The shared-hosting scam engine as actually run: **400:1 per-pool for shared**, or **10:1 stated as "500
plans onto hardware sized for 50,"** or **"sell 400% of capacity at low burst probability."** The three
figures in this camp are themselves inconsistent, which is informative: they are quoting **different
resources** (accounts-per-box, disk, and burst-capacity percentage) under one word. **Reconciling them
requires naming the resource before naming the ratio** — which is exactly what Position A's per-axis
table does, and is the strongest argument for Position A's *structure* even if Position B's *headline*
number is the one the industry used.

### Dunning recovery rate — *CONFLICTING*

A small number with a large consequence, because dunning is proposed as the highest-ROI build in the
game and its ROI *is* this figure.

#### Position A — 30–50% of involuntary churn recovered *(master)*

**20–40% of gross churn is involuntary**; **payment failure runs 5–9%/month on active card
subscriptions**; **a retry schedule plus emails recovers 30–50% of it**, and card-updater services
recover more. At this rate the dunning build pays for itself in one billing cycle.

#### Position B — 20–40% recovered *(opencode)*

**20–40% of churn is payment failure** — agreeing with A on the *share* — but **retries and emails
recover ~20–40%**, roughly two-thirds of Position A's figure. At this rate dunning is still worth
building and is no longer an automatic first purchase, which changes the early-game build order.

---

