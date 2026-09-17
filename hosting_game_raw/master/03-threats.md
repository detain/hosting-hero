# 2. Threats

## 2.1 Threat design principles and the role taxonomy

### The five axes of threat distinctiveness
Threats should differ along at least five axes so they feel distinct.

**How it works:** **Pathing** (where they enter and how they move), **target** (what they aim at),
**visibility** (can you see them coming), **counter-shape** (what stops them), and **cost profile**
(what it hurts — uptime, money, reputation, data). A threat that duplicates another on all five axes
should be cut or merged.

**Sixth axis — denomination.** Add the axis the document's own content implies but never names:
**which resource the damage is denominated in** (uptime / money / reputation / data integrity /
attention / future demand). Two threats that differ on all five stated axes but both cost "uptime"
still *feel* the same in play. Make the merge rule an actual quota: **no more than four threats per
level may share a denomination.**
**Interacts with:** §2.1 Threat Role Taxonomy, the Two-Front Law, §6 economy.

### The four damage currencies
Every threat deals damage in one or more of four currencies, and the game should colour-code them.

**How it works:** **Cash** — direct outflow (credits, fines, chargebacks, overtime, replacement
hardware). **Churn** — customers leave; deferred damage that compounds. **Reputation** — reduces
*future* visitor inflow; the top of your funnel narrows. **Capacity** — you lose sellable inventory
(a dead node, a tripped breaker, a blacklisted IP block). The interesting design space is threats
that are cheap in one and devastating in another: a 4-hour outage might cost $600 in SLA credits
(trivial) and 11% of a cohort (existential).
**Interacts with:** the sixth axis above (attention and data integrity are the two currencies this
four-way split omits — keep both lists; the four-currency version is the HUD colour scheme, the
six-denomination version is the authoring quota).

### Every threat is quoted in dollars and churn
A framing principle for the whole category.

**How it works:** A DDoS that costs you nothing is not a threat; a one-star review that costs you 30
signups is. The HUD shows every incoming threat with an estimated **$ exposure** and **churn risk**,
the way a real operator triages. "Server down" is not damage; "server down → 40 min SLA breach →
three support hours → one grudge tick → 4% higher churn probability at renewal → a discount
concession at the next QBR → one sentence in a review" is damage.
**Interacts with:** §2.10's opening rule, the Threat Scale Law (§2.26), §6.

### The four bands (weather / storms / hunters / entropy)
Most real "attacks" are not aimed at you — they are indiscriminate internet weather. The scary ones
are the ones that know your name.

**How it works:** Threats come in four bands. **Weather**: constant, ambient, cheap to stop once,
expensive to ignore. **Storms**: event-shaped, telegraphed, survivable with preparation.
**Hunters**: adaptive, targeted, responding to your defenses. **Entropy**: not an attacker at all —
your own stuff breaking, which is arguably the better half of the game.

### The four families (malicious / entropic / human / systemic)
A second, orthogonal cut that governs **wave composition**.

**How it works:** **Malicious** (someone wants to hurt you), **Entropic** (things break), **Human**
(people make mistakes or demands), and **Systemic** (the world changes). Mixing families inside one
wave is what makes a wave interesting — a DDoS alone is a difficulty number; a DDoS plus a disk
failure plus an angry customer call is an *encounter*.
**Interacts with:** the Two-Front Law, §2.24 wave composition.

### The Threat Role Taxonomy (design-first, theme-second)
A TD needs its enemies to occupy **mechanical roles**, not just flavour slots. Every wave generator
pulls from these roles so waves stay legible: the player should identify the *role* at a glance and
the *flavour* on inspection.

| Role | What it does to the player | Hosting flavour |
|---|---|---|
| **Swarm** | Overwhelms by count; punishes single-target defenses | Botnet zombies, scanner drizzle |
| **Tank** | Huge volume; punishes low-throughput defenses | Volumetric DDoS, amplification |
| **Sapper** | Ignores HP, drains a *resource* | Cryptominer, bandwidth thief, toll fraud |
| **Stealth** | Invisible without detection tech | APT, insider, webshell |
| **Splitter** | Spawns children on death | Worm, XSS |
| **Healer/Spawner** | Off-map source that must be cut | C2 server, botnet herder |
| **Bypass/Flyer** | Skips the lane entirely | Supply-chain, physical, insider |
| **Siege** | Attacks from outside your range | BGP hijack, DNS poisoning, registrar hijack |
| **Debuffer** | Weakens your *economy*, not your capacity | SEO spam, review bombing, price war |
| **Mimic** | Looks exactly like a visitor | Layer-7 attack, card testing, AI scrapers |
| **Parasite** | Rides in on a legitimate visitor | Malvertising, XSS payload |
| **Boss** | Multi-phase, requires a built answer | Nation-state, ransomware crew |

**The Mimic role is the star of this game.** It's the role that only works *because* of the Shared
Pipe pillar (P1). See §2.4.

### The Nine Defense Roles and the Coverage Grid
*The missing half of the Threat Role Taxonomy, and the single biggest legibility gap in the design.*

**How it works:** Every defensive buildable is tagged with exactly one primary role:

| Defense role | What it does | Examples |
|---|---|---|
| **Absorb** | Adds raw capacity ahead of the thing being hit | scrubbing, anycast, CDN, edge cache, extra nodes |
| **Classify** | Decides good vs bad | WAF, fingerprinter, IDS, fraud scoring, spam filter |
| **Meter** | Caps consumption per identity | rate limits, quotas, spend caps, concurrency caps, cgroups |
| **Contain** | Limits how far a landed threat spreads | VLANs, least privilege, circuit breakers, blast domains, WORM |
| **Detect** | Tells you it happened | monitoring, tracing, FIM, log retention, anomaly detection |
| **Recover** | Undoes damage | backups, spares, checkpoints, runbooks, rebuild |
| **Deter** | Changes the attacker's economics | MFA, KYC, deposits, bug bounty, reputation, legal posture |
| **Divert** | Sends it somewhere else | honeypot, decoy service, null-route, tarpit, sacrificial IP |
| **Negotiate** | Uses a relationship instead of a machine | upstream retainer, registrar lock, insurance, peering, counsel |

The **Coverage Grid** is a UI panel: threat roles down the side, defense roles across the top, your
current coverage as filled cells. A row with no filled cell is a hole, and the game says so in plain
language: "*Nothing you own changes an attacker's economics. Everything you have is a wall.*"
Without this, a player facing a Sapper (cryptominer, toll fraud, egress bill) buys more walls and
dies confused. With it, the tech tree has a *readable shape* and "defense in depth" becomes a thing
you can see rather than a thing the game says.
**Interacts with:** §2.13 mix-ins (each mix-in invalidates exactly one defense role), the tech-tree
spine, the HUD.

### Attacker budgets (making yourself expensive is the win condition)
Every attacker archetype carries a hidden **budget** and an **expected-return** estimate.

**How it works:** Defenses in the **Deter** and **Divert** roles raise the attacker's cost; defenses
in **Absorb** and **Classify** lower their return. When cost > return for three consecutive attempts,
that archetype **stops coming** for the rest of the level (and, at campaign scale, deprioritises
you). The Attacker Ledger shows this: "*Grinder: spent 41 hours, netted 0 accounts. Left.*" §2.6 says
credential stuffing "can only be made unprofitable" and §2.13 says hunters adapt — but without this
system that lesson is only text. This makes it arithmetic, and it makes the Deter role (currently
almost empty) mechanically load-bearing.
**Interacts with:** §2.6 The Grinder, §2.11 archetypes, §2.13 Hunters adapt, the postmortem screen.

### Every threat must be telegraphed, readable, and counterable by more than one build
If only one tower answers a threat, it's a tax, not a decision.

**How it works:** Design law. Every threat needs at least two viable counters drawn from *different*
defense roles, so the answer to "what do I build" is a choice and not a lookup.

**Variations and additions**

- **Opencode's treatment — Counter-matrix discipline (balance law)** — Each threat has exactly ONE
  hard counter (tower or perk), TWO soft counters, and ONE signature hosting type it belongs to; no
  threat should be answerable by "more of the same turret" — keep the build palette meaningful.
  (wave3_gamedesigner_fresh)
- Wave-0's companion principle — **Threats With Two Solve Paths**: every major threat counterable at
  least two different buildable combinations, avoiding a single "correct" tech tree; and the
  proposed middle path for the tension with §6's Mutually Exclusive Specializations — specialization
  may lock out *which specific* counter buildable a threat has (flavor/identity), but every branch
  should still contain *some* counter to every major threat. Flagged as needing playtesting, not
  design agreement. (wave0)

### At least a third of all threats are non-attacks
Hardware, power, human error, regulators, and customers.

**How it works:** This is what makes the game *hosting* rather than *Plants vs. Zombies with
routers*. A companion design law: **your own customers should be responsible for roughly as much
trouble as all the hackers combined**, because it's true and because it's funnier.

### The scariest threats look exactly like customers
The theme's gift. Build a whole family around ambiguity (§2.4).

### Threats punish specific build choices (the wave deck is a mirror)
Never spawn a SQLi wave at a player with no database.

**How it works:** The wave generator draws from the **Attack Surface Ledger** — the running list of
what your buildables have invited. Each of §2.5's entries is **unspawnable until you build the thing
that invites it**, so the player literally watches their bestiary grow as their network grows
(Pillar P2).
**⚔️ Tension — unbounded threat-pool growth:** if every buildable permanently adds threat families
and the player builds fifty things, the late-game wave table contains fifty families. That is
unreadable, it dilutes every individual threat to noise, and it makes the bestiary pointless because
nothing is ever *the* threat any more. **Fix — three rules:**
1. **Mastery demotion.** A threat you have countered successfully N times (say 5) is demoted to
   **weather**: it still occurs, it is handled automatically by your standing defenses, it produces a
   small background cost, and it stops appearing as a discrete event. The bestiary marks it
   "Mastered."
2. **Pool cap.** The wave generator draws from at most 8–10 *active* families per level, selected
   from your unlocked pool by the level's ruleset card.
3. **Retirement.** Removing a buildable removes the threats it invited (with a lag, because attackers
   don't get the memo immediately). **This makes deleting things a defensive move**, which is true
   and which the game currently cannot express.

**Variations and additions**

- **The rule of thumb, stated from every lens** — enemies *home in on what you built* — no DB, no
  SQLi; open resolver, and attackers use YOUR cannon. (gamedesigner, sysadmin)
- **Opencode's treatment — Dark-Forest discovery** — You never see the full threat catalog;
  reconnaissance reveals what's aimed at *you specifically* — your build choices generate your enemy
  list, literally. (sysadmin)
- The dial made explicit: threat load = f(visibility × meanness) — being famous, bulletproof, or
  *cheap-and-oversold* draws different attack mixes; reputation is an attack-vector dial, not just a
  customer magnet. (wave4_general_fresh)
- Threat-roster coupling to the dark forest: HTTP/2-only floods appear when you adopt h2, WP plugin
  waves when you host WordPress, balancer-targeting reflection variants once balancers unlock — you
  author your own encounter table. (wave3_sysadmin_fresh)

### Damage types should differ so defenses aren't interchangeable
Five damage types, each answered by a different part of your build.

**How it works:** *Availability* damage (downtime seconds), *Money* damage (direct cost),
*Reputation* damage (future visitor volume), *Integrity* damage (silent, delayed), and **Attention**
damage (consumes player actions). Attention damage is the one the genre never models and the one this
game's Hands pillar (P4) makes possible.

### Nothing announces itself (presentation rule)
The alert the player gets should be the *symptom*, and identification should be a player action.

**How it works:** "Load average high", "5xx rate up", "mail queue growing" — not "SQL Injection
detected." Identification is the diagnosis loop (§7.6), not a label.
**⚔️ Tension resolved — arrivals are telegraphed; identities are not.** §2.13's Threat Pathing
Telegraph and §8.5's "nothing lands without warning" appear to contradict this. Separate *arrival*
from *identity*: you always see **that something is coming** (volume, direction, magnitude — the
telegraph). You never see **what it is** (family, intent, target) until classification completes.
That preserves TD fairness, preserves the diagnosis loop, and makes the violet-until-classified
palette rule the visual expression of exactly this split.

### Damage is often delayed and off-screen
A webshell today is a botnet C2 next week is an RBL listing the week after.

**How it works:** Show the causal chain in the post-mortem screen so the player connects the dots
retroactively. That "oh, THAT'S what that was" moment is the whole game.
**Interacts with:** P10, §6.9 (post-mortem screen).

### Threats path the dependency graph, not geometry
Attacks probe the weakest *listed* service, not the nearest object.

**How it works:** Threats enter at your edge and traverse the same links your visitors do — which is
precisely why a defense that blocks a threat can also block a visitor. Threats seek the **most
vulnerable reachable node**; different threat families seek different target *types* (DB-seekers head
for vaults, volume attacks target the gate).

**The stated targeting function** (publish it in the Codex — a threat AI the player can *reason
about* is the precondition for every interesting defensive decision):

```
attractiveness(node) = (vulnerability × value × exposure) / defence_depth_on_path
```

or equivalently `exposure × value × (1 − apparent_hardening)`, evaluated per reachable node, with
each threat family applying a multiplier to one term: **data thieves weight `value`**, **volumetrics
weight `exposure`**, **opportunists weight `1 − apparent_hardening`**. `exposure` is the orange
hazard chevron on the object; `defence_depth` is the count and quality of *classifying* objects
between the edge and the node. This makes the security-surface overlay **literally the attacker's
targeting view** — "look at the board the way they do" becomes a mechanic.

### The Two-Front Law (a wave design rule)
The best waves attack two different resources at once, and the correct response uses different
currencies for each.

**How it works:** An authoring rule. A volumetric (costs bandwidth, answered with money and
relationships) arriving with a disk failure (costs hands, answered with attention) is a better
encounter than either doubled. Every "hard" wave in the pressure budget must draw from two of
{bandwidth, concurrency, hands, cash, reputation, data integrity}. Without it, every wave is solvable
by whichever resource the player has most of.
**Interacts with:** P4 (hands), §1.7 Two-Beat Wave (which is the threat-then-visitors version), §2.24.

### The Second Incident rule
Things break when you're touching them.

**How it works:** A generator rule, not a threat: **the probability of a new incident is multiplied
by 1.8× while the player is already in an incident**, and by 2.5× during a *recovery* (restart,
rebuild, failover, restore). It must be **stated** in the Codex, not hidden, or it reads as the game
cheating. It is the real texture of operations, it makes the "root cause vs band-aid" choice actually
tense (do you have time?), and it is the mechanical justification for change freezes, drills and
runbooks all at once.
**Interacts with:** §2.8 rebuild storm, §7.7 recovery, maintenance windows.

### The Feint (the telegraph as a weapon against you)
A small number of waves are *deliberately* over-telegraphed.

**How it works:** A huge, loud, slow-approaching volumetric that the forecast widget screams about —
and that is entirely cover for a quiet second vector arriving during the 40 seconds your attention
and your hands are committed to the obvious one. The tell is always available (the second vector
shows on exactly one overlay you are probably not looking at) and is never *required* to survive,
only to survive cheaply.
**⚔️ Tension:** the Threat Pathing Telegraph makes all telegraphs honest. A genre needs at least one
lie, or telegraph-reading stops being a skill and becomes a reflex. **Cap: at most one feint per
level, never two levels in a row**, and the postmortem always names it so the player learns the
pattern rather than resenting it.
**Interacts with:** §2.13 Two-stage mix-in (the same idea as an affix), §7.5 hands, §7.9 forecast.

### The Grudge system (attacker persistence with a visible state)
Win quietly or win loudly.

**How it works:** Each attacker archetype carries a **Grudge** value toward you, 0–5, shown as pips
on their Threat Gantry portrait. Grudge rises when you humiliate them cheaply (null-routing a booter
kid instantly, publicly blogging about beating them, refusing a ransom loudly) and falls with time or
with a quiet, unremarkable defense. High grudge = they return sooner, bigger, and *specifically
counter your last successful defense*. Generalises §2.11's Competitor behaviour (attacks whatever you
just removed) to every antagonist, and rewards humility, which is thematically perfect.

### The Copycat Wave (the game remembers what beat you)
Adaptive difficulty that is *legible* and *fair*.

**How it works:** Each level's generator reserves 10–15% of its pressure budget for threats drawn
from your **personal miss list** — the specific attacks that landed on you in the previous two
levels. Presented diegetically ("*your incident report got scraped; someone's reading it*") and
visible in the forecast as a small "familiar" icon. Converts the postmortem screen from a
retrospective into a threat forecast, and fixes "no optimal build order" by making the wave table a
function of the player's own history rather than an authored script.

### Threat behaviours worth designing around (an authoring checklist)
Six behavioural axes that should each be represented in every chapter.

**How it works:** **Persistent vs transient** — a DDoS ends; a backdoor does not. **Visible vs
invisible** — the best threats here are ones you *cannot see* without having pre-built the
observability for them, which makes information itself a purchasable resource. **Attacks the
defense** — threats that specifically target your monitoring, your backups, your jump host, or your
DNS, because that's what real attackers do. **Attacks the seam** — threats that exploit the
*connection* between two things you built rather than either thing itself. **Sleeper** — lands
quietly, activates in a later level. **Correlated** — many "independent" components that fail
together because they share a hidden dependency; the single most underrated real-world failure mode
and the most satisfying thing to discover in a game.

### Threat delivery mechanics (how they "approach")
Seven arrival shapes, so not everything is a lane-walker.

**How it works:** **Lane Marching** — classic TD: threats walk a network path from the internet edge
inward. **Rain Threats** — hardware failures fall onto random tiles from above; no path, no warning,
countered by redundancy rather than by towers. **Sleeper Threats** — enter disguised as visitors and
activate later (a signup that becomes a spam relay on wave 7). **Pressure Threats** — never "arrive";
they raise a meter (heat, power draw, queue depth) until something breaks. **Correspondence Threats**
— arrive as documents in an inbox: abuse complaints, legal notices, audit findings; handled by staff
units, not by defenses. **Compound Waves** — a small DDoS *plus* a disk failure *plus* an angry
customer call, timed so your attention is the scarce resource. **Telegraphed Bosses** — a 3-wave
countdown with visible intel ("chatter suggests a Tuesday attack"), giving prep meaning.

---

## 2.2 Ambient weather (constant background noise)

### Scanner Swarm / Masscan Gnats / The Scanner Drone
Endless tiny units drifting across the whole map probing every open port.

**How it works:** Individually harmless. They *map* you: any service left exposed gets tagged, and the
tag is what later attacks path toward. Their real mechanical job is to make "zero alerts" impossible,
so the player learns to triage instead of reacting to everything — and to generate the **log noise
that hides real attacks.** Scanners are the game's **foreshadowing system**: if one finds an open
port, it drops a marker flare and a real threat spawns there later. They find anything you expose
within 90 seconds of exposing it; their only role is to punish carelessness instantly.

**The Recon Map (mechanical output).** As ambient texture this is flavour; give it an output the
player can act on. Scanners build a **visible Recon Map** of what they've found, shown as small flags
on your exposed surfaces. The flags are the **advance telegraph for the next three levels' targeted
attacks**. A player who watches scanners gets a genuine forecasting advantage, and "reduce your
surface" has an immediately visible effect: flags vanish.
**Counter:** firewall default-deny; reducing your exposed surface; an attack-surface scanner that
shows you your own exposure before they find it.
**Visual:** a drizzle of dots, each pinging one port and dying; a thin sweep-line and a ripple per
port touched; the cloud leaves pins behind. **Colour note:** render them **violet**, not grey — grey
is the inert colour and makes the game's most common threat read as dead infrastructure, whereas
violet is the unidentified hue, and "the background radiation of the internet is stuff you haven't
bothered to identify" is thematically perfect. Their marker flare when one *finds* something should be
the only saturated thing they ever do.

**Variations and additions**

- **Opencode's treatment — Port Scanner (recon scout)** — Slow-moving; ignores towers and *tags*
  your assets, revealing them to later waves — tagged servers take targeted attacks. Killing scouts
  is optional but removes precision from later attackers. Between waves, port scans trace along the
  network like tripwires: where they probe tells you what the next wave brings — build counters
  *informed by recon* ("waves have a story"). (general, sysadmin)
- Spec the tag: duration = until the end of the NEXT wave; tagged assets take aimed attacks with
  crit multiplier ×2 (or "precision" — guaranteed targeting vs random); a "clean-sweep" staff action
  removes tags at ticket cost; decoy-tagging counterplay (tag your honeypot harder — the scanner
  tags what looks juiciest, so *bait the scout*). (wave2_general_informed)
- Claim-check tagging: scanner-tagged servers wear a physical red luggage-tag on an antenna; a scout
  killed before returning *drops the tag mid-air* — the whole recon mechanic becomes a chase you can
  see. (wave2_visual_informed)
- The Vulnerability Scanner ("stringer") variant: moves SLOW and invisible-ish, "taps" each
  buildable it passes, marking it exploitable; if it reaches your stack and leaves, the NEXT wave
  spawns *targeted exploits* against whatever it found — countered by honeypots (fake buildables it
  reports back instead) and patch cadence. Teaches reconnaissance asymmetry.
  (wave4_gamedesigner_fresh)
- The Scanner (Shodan/Censys): not attacking but MAPPING you — a precursor wave: any open port you
  forgot becomes a target the moment it's found. (wave4_sysadmin_fresh)
- Dumb but numerous, and they *reveal your layout* to smarter attackers — they are vision units.
  (wave3_general_fresh)
- Internet Background Radiation as *the census*: constant scan traffic (Shodan/Censys/masscan) never
  attacks, always *looks* — every red-port LED gets a "catalogued" meter, and the wave *menu* for
  the next attack is drawn from your catalogued exposures: attackers order off your public menu.
  Close a port and its item fades from the menu in seconds. Makes "enemies home in on what you
  built" literal, visible, and player-controllable — your attack surface is a published menu. All
  types, from day one. (wave2_sysadmin_informed)
- The Gossip Ledger (Certificate Transparency recon): attackers read your *own* public CT logs — you
  order a cert for `staging-payroll.corp.example` three weeks before launch and the entry is public,
  immutable, and *advertising your softest target*. Every pre-production buildable emits a "gossip
  ripple" at the dark edge and scouts beeline for the names your cert kiosk whispered. Counters:
  internal-CA doctrine (don't public-log staging) or ACME-wildcard discipline — TLS is also a
  publication channel. All types with TLS. (wave3_sysadmin_informed)
- Behavior modifier: some attackers probe your honeypots first and reroute around the defenses they
  find. (wave4_general_fresh)

### The `/wp-login.php` Brute Squad
Slow, relentless credential guessing against every installed app.

**How it works:** Costs CPU — each attempt is a full application bootstrap, and *that's* the real
damage, not the breach. Endless, low-damage, constant noise, and it generates *log volume* that costs
you storage. A threat whose real cost is operational, not security.
**Counter:** fail2ban, rate limiting, 2FA, or just moving the login URL (cheap, cheesy, surprisingly
effective — the game should reward the cheesy fix at low tiers and reveal its limits later).
**Visual:** a persistent little unit tapping repeatedly at a door with a visible attempt counter.
When fail2ban trips, it gets yanked backward off-screen with a satisfying snap.

### SSH Brute Force (the background radiation)
Thousands of attempts a day against every public IP.

**How it works:** A permanent low-level drizzle that costs nothing until one succeeds.
**Counter:** key-only auth, fail2ban, bastion host, VPN-only management plane — and **a non-standard
port, which the game should let you build and then show you has minimal effect.** A *placebo*
upgrade is a great teaching moment and the genre never ships one.
**Hosting types:** universal; worst on VPS and dedicated where customers manage their own boxes.

### `.env` / `.git` Crawlers
Units that specifically probe for leaked secrets paths.

**How it works:** `/.env`, `/.git/config`, `/backup.sql`, `/phpinfo.php`, `/adminer.php`. Harmless
unless you have actually left one lying around — **and the game should let players leave them
around**: a "quick debug" action leaves a `phpinfo.php` artifact on the board for three days.
**Counter:** tidiness; a file-integrity or exposure scan.

### Comment / Form Spam Drones
Attack the *content*, not the server.

**How it works:** Reduces visitor trust and SEO score over time.
**Counter:** a honeypot form field, a CAPTCHA (which itself repels ~4% of real visitors — a genuine
tradeoff), or a paid filtering service.

### Referrer / SEO Spam Ghosts
Pollute your analytics so the player's own dashboards lie.

**How it works:** A *meta* threat: it attacks your information, not your infrastructure. Damage is
informational — your dashboard lies, so you make bad build decisions.
**Interacts with:** §2.22 (the HUD-attack family, of which this is the founding member), §7.6
(diagnosis), §8.8 (a threat that attacks the HUD).

### Bad Bot Fleet (aggressive crawlers)
Ignores robots.txt, crawls every faceted-search URL combination.

**How it works:** Generates infinite unique URLs that blow out your cache hit rate. Real and
under-appreciated: crawler traffic can be 40% of requests. A crawler that discovers your
faceted-search URL space can generate forty million unique URLs from a shop with 300 products.
**Counter:** robots.txt (honoured by the polite ones, ignored by the bad ones), crawl-delay, UA
blocking, per-ASN rate limiting, `nofollow` on facets, or a **crawl trap / tarpit** buildable.

**Variations and additions**

- **Opencode's treatment — The Scraper Hoard (unpaid traffic)** — Endless tiny spiders eating
  bandwidth for free: rate-limit tower, robots.txt aura... or *monetize them* (ad-supported mirror)
  — a rare threat you turn into revenue. If your business is content (CDN/video), they literally
  carry away revenue sprites — counter with the bot-manager tower, but watch false positives (angry
  legit customers flagged as bots = the accuracy tension). Nuance: SEO crawlers make your customers
  rich — do you WANT to block Googlebot? Bot rules become a policy dial, not a wall; AI-training
  scrapers now eat video/CDN capacity (hot topic, instantly relatable). API-abuse twin: a customer's
  bot hammers your endpoint, or the endpoint is open and unauth'd — overload doubles as data
  exposure. (wave2_general_fresh, wave3_ceo_fresh, wave3_gamedesigner_fresh, wave4_sysadmin_fresh)

### AI Scraper Locusts
The modern flavour: huge distributed residential-IP crawls with rotating user agents, functionally
indistinguishable from visitors, ignoring robots.txt entirely.

**How it works:** Blocking them costs you real visitors. A lovely no-win tradeoff and a natural
bridge into the Mimic family. Genuinely one of the biggest real-world traffic problems right now.
**Counter:** behavioural fingerprinting, ASN reputation, proof-of-work interstitials — and the
**monetize-instead-of-kill** option: sell them an API plan and convert the threat into revenue.
**Visual:** dense, fast, *deliberately ambiguous* cyan-tinted-magenta creatures that eat your content
and leave. Their tell is their **path**: they visit every page in perfect sequence, so their pathline
is an unnaturally systematic zigzag across all your content nodes. A shape tell rendered as a *path*
— a category of visual design this game can uniquely exploit.

### Scraper Locust (content theft variant)
They don't break anything; they *eat your bandwidth and your content*.

**How it works:** Purely economic damage. Ambiguous by design: some scrapers are search engines you
*want*.
**Visual:** you see them strip colour off your pages leaf-by-leaf and the pages regrow slowly.
**Damage expressed as defoliation.** Their silhouette is a circle with a **dotted** outline, where
the legitimate Crawler Consortium is a circle with a **dashed** outline — dashed vs dotted survives
greyscale and survives 16px, and preserves the "you must look closely" tension without relying on a
cyan-gold blend that colour-blind players cannot read.
**Interacts with:** §3.2 (Googlebot / the Crawler, which looks identical), §2.11 Crawler Consortium.

### xmlrpc Pingback Amplifier
Turns *your* server into an attacker against someone else.

**How it works:** If unaddressed, your upstream sends you an abuse notice and eventually null-routes
you. The threat that damages you by making you the bad guy.
**Counter:** disable the feature, egress filtering, outbound rate limits.
**Interacts with:** §2.10 (upstream termination), §2.20 (the abuse escalation ladder).

### Revenue Leakage (the business layer's weather)
A permanent, invisible, compounding drain that looks like nothing.

**How it works:** A small percentage of every provisioning action, upgrade, and one-off fails to
reach the billing system. It accumulates silently at ~0.2–0.5% of MRR per month and is only visible
if you build **Revenue Assurance**. The best possible "weather" threat for the business layer — it
makes "zero alerts" impossible on the money side exactly as scanners do on the security side, and it
teaches that the billing system is a production system.
**Interacts with:** §2.10 billing run, §6.

### The Commoditization Fog
A slow, ambient threat: every quarter your product becomes 3% less differentiated unless you ship
something.

**How it works:** Manifests as a gradually declining conversion rate with no visible cause.
**Counter:** new products, niche positioning, brand.

### Abuse Complaint Backlog (ambient form)
Every unhandled complaint quietly raises your Heat meter.

**How it works:** Not an event — a slowly filling tray. The doom clock in §2.20 is driven by neglect
here, so the weather band and the escalation ladder are the same system at two time scales.

---

## 2.3 Volumetric and protocol floods

### SYN Flood / The Half-Handshake Pile
Doesn't reach your app; it eats **connection slots** on the load balancer.

**How it works:** Fills the connection table with half-open connections. Classic swarm role: cheap,
fast, infinite.
**Counter:** SYN cookies — conntrack tuning — upstream scrubbing.
**⚔️ Tension — SYN cookies are not a free permanent unlock.** Wave-1 called them "a cheap, early,
satisfying 'problem solved forever' unlock (every game needs a few of those)" with a side effect of
"slightly higher latency for everyone." Two corrections collide here and both matter:
*(a) Technical:* because the server keeps no state, **TCP options negotiated in the SYN are lost or
constrained** — window scaling and selective acknowledgement get degraded, which disproportionately
hurts **high-latency and lossy clients**, i.e. exactly the Mobile Commuter visitor archetype. The
correct cost is not "a bit of latency for everyone" but **"a throughput penalty for your
worst-connected customers, only while under attack."** That is a far better fit for the Shared Pipe
pillar, and it means SYN cookies should be a *conditional* defense (armed above a threshold) rather
than always-on — which is also how it actually works.
*(b) Design:* a permanent free unlock contradicts §4.1's Three-Column Law ("no pure upgrades. Ever.").
Pick one resolution and apply it consistently: either give SYN cookies the real cost above, **or**
amend the Three-Column Law to read "*no pure upgrades at the strategic layer; a small number of
tactical problems may be permanently solved, and solving them is one of the game's pleasures.*" The
recommendation is the second — a game where literally nothing is ever finished is exhausting — but
the law has to be rewritten to permit it. The same issue applies to the Cable Label Printer,
DKIM/SPF/reverse DNS, and the Spend Cap, all correctly described as cheap, obvious and downside-free.
**Visual:** half-drawn connection arcs that never complete, stacking into a visible thicket of
unfinished lines in front of the target. Rendered as visitor circles with *outline only, no fill*
that walk into your connection table and **just stand there**, occupying visible slots in a physical
pigeon-hole widget. A parallel reading: a stream of **half-drawn handshake glyphs** (one hand, no
partner) that stack into a visible pile on your listener; when the pile reaches the top of the
faceplate, the server stops accepting. With SYN cookies the slots become translucent and the
half-handshakes fall straight through — or, in the handshake reading, a little stamp lets them pass
without stacking.

**Variations and additions**

- **Opencode's treatment — SYN-Flood Mimics (threats disguised as customers)** — Thousands of
  half-open handshakes pile into the connection table until it's full and *real* customers get
  refused. Visual: waves of outstretched pixel-hands that never complete the grip. Fake "handshakes"
  look like incoming customers until they reach a checkpoint and stall half-open, eating slots. This
  enemy *is* the thesis: your best "defense" (trusting connections) is your best "attraction" — they
  diverge here. Counters: SYN-cookie checkpoint tower (patience-timer gate), LB offload, rate limits
  (the dial hurts customers too). (sysadmin, gamedesigner)
- The connection table is a consumable resource — slots are your "tower ammo"; the SYN-Cookie Gate
  *converts slots into math*. Classic opener. (wave2_gamedesigner_fresh)
- "Handshake Zombies": slow-shuffling figures that reach your web server, extend a hand, and never
  complete — fake customers occupying *real* customer slots bridges the threat-system and
  customer-path. (wave2_general_fresh)
- Little open-padlock figures queue at the gate holding out handshake cards, never completing them —
  the queue *physically blocks* paying customers: the visual of resource starvation, not damage. A
  gate-timeout buildable shoos them away. (wave4_visual_fresh)
- SYN-ACK "ACK reflection" mid-game variant: targets your *balancer's* connection table once
  balancers unlock. (wave3_sysadmin_fresh)
- Behavior: slow pressure that "meters up" until the service refuses new customers and your paying
  load bounces. (wave4_sysadmin_fresh)
- Show the state machine visually: hand held → timer arc on the figure → hand drops, figure
  dissolves in static (timeout); when the connection table fills, the gate's mailbox overflows with
  stuck hands; the "real customers refused" moment renders as a hand gently pushed aside by a pile
  of frozen ones — the thesis in three seconds. (wave2_visual_informed)
- If mimics are visually *identical* to customers with no tell, players will filter aggressively and
  bounce real revenue out of pure paranoia — learned helplessness instead of skill. Fix: perfect
  detection stays impossible, but always offer one *cheap, probabilistic* tell (a checkpoint that
  flags mimics after a few seconds of "half-open" stalling; SYN cookies as a timer gate) so play
  becomes informed triage. The "one frame tear tell on the WAF" is the right instinct — make it
  systemic, not cosmetic. (wave2_gamedesigner_informed)
- Unify the discriminator with the Hug of Death: both look like customers, so give one rule — mimics
  never complete the grip, hugs complete and then *stay* (behavior after connect is the tell) — and
  the counter dials differ (SYN cookies vs capacity). Add a "goodwill rate-limit" policy so a naive
  firewall blocks the Hug *and* looks like you're shooting your own crowd: the reputational damage
  of mis-triage, pre-told by the visual grammar. (wave2_general_informed)

### UDP Amplification Barrage (DNS ANY / NTP monlist / memcached / SSDP / CLDAP)
A small attacker with a *huge* multiplier.

**How it works:** Arrives as an enormous, slow-moving wall that doesn't path — it just occupies the
pipe. Key mechanic: **it doesn't matter how good your server is — your pipe is the victim.** A 50Gbps
event on a 1Gbps port is not a server problem. Telegraphed ~10 seconds out; bigger than your pipe by
design. You cannot kill it at home — you must **divert** it. **You cannot filter a 400Gbps attack on
a 10Gbps link. The fight has to happen upstream, which means the fight is really a contract
negotiation you made months ago.**
**Counter:** upstream scrubbing or anycast absorption, purchasable as a monthly retainer; BGP
flowspec; bigger transit commits. **And the cheap version, which should be available early:** ask
your upstream to **blackhole the target IP** (RTBH) — free, instant-ish, and it sacrifices one
address. You win by killing your own customer's IP; the attack succeeds and the blast radius is
contained. Making the cheap version of "have a relationship with someone bigger than you" available
before the player can afford a retainer is what lets the lesson land at the right time.
**Visual:** **The Amplifier Horn** — a small magenta imp runs to a *neutral third-party* node at the
map edge (an innocent little grey box with a megaphone on top), pokes it, and the megaphone blasts a
cone of volume at you 50× the imp's size. You can't kill the cone; you kill the imp or shield the
cone. Teaches indirection with no text. Alternate rendering of the same idea: **The Echo Horn**, a
gramophone horn off-map that fires at a third party which bounces amplified traffic at you — the
attacker sprite is never on the attack lane. **DNS Amplification — "The Shout Back"** draws the size
mismatch literally: a 4px mote goes out, a 40px slab comes back. **NTP / memcached — "The
Loudhailers"** share the family with different silhouettes (a clock face, a dial pad) so an
experienced player reads the amplifier type from lane texture alone.

**Variations and additions**

- **Opencode's treatment — UDP Amplification / Reflection (DNS, NTP, memcached)** — Small request,
  50,000x return beam: attackers aim *your own open services* at your IP (or a victim — costing
  reputation + your bandwidth bill + a blocklist). "Don't be the gun" mechanic: defending means
  refusing to reflect. Visual: your building firing cannons you didn't know you had; or a modest
  breeze leaving the sea, passing your open resolver, exiting 50x wider as a visible snowballing
  hurricane — one image that explains amplification forever. Counter: the recursion off-switch you
  can flip audibly, RPF, close the reflector, scrubbing. (general, sysadmin, visual)
- Memcached variant with teeth: one open UDP 11211 port = 50,000x amplification *from your own
  network* — the packet source arrow points at YOUR building; the mechanic exposes player
  configuration, not just defenses. (wave3_sysadmin_fresh)
- NTP monlist reflection: the classic, same mechanic class — it also punishes you for running old
  software. (wave3_sysadmin_fresh)
- The Amplification Echo: a tiny dot pings your resolver and *returns as a giant* beam — the whole
  mechanic legible in one second; the reflector has an obvious glow-when-exposed tell.
  (wave3_visual_fresh)
- "The echo cannon": YOUR mail server used as a megaphone — a threat pings in tiny, your resolver
  shouts it back 50× louder at a customer. Teaches "don't be an open resolver" with sight and sound.
  (wave4_visual_fresh)
- Own-fault variant: spoofed reflection sprites arrive from random directions; if you run DNS infra
  you are *also* a reflection source. (wave4_general_fresh)

### Reflection/Amplification where YOU are the reflector
Your own open NTP/DNS/memcached/SSDP/CLDAP services get used to attack someone else.

**How it works:** You take no damage at first. Then an abuse complaint arrives, your transit bill
spikes, and your upstream threatens to null-route your whole range. Visually: **your own towers start
firing at the map edge.** Teaches that being a good netizen is self-interest.
**Counter:** egress filtering, BCP38, response rate limiting, closing open resolvers.
**Interacts with:** §2.12 DNS Reflection Conscription, §2.20 upstream abuse ladder.

### Reflection Aimed *Through* You
Someone spoofs your IP as the source of their attack, so the *replies* come to you.

**How it works:** You are being hit by responses from legitimate servers. Blocking them means
blocking innocents.

### Slowloris / RUDY (slow POST) / "The Sipper" / "The Molasses Sloth"
A handful of visitors who enter, sit down, and never leave, holding worker threads.

**How it works:** Almost zero bandwidth; opens many connections and dribbles headers forever. Defeats
bandwidth-based detection entirely — **your graphs look fine while you are dead.** Nearly invisible:
low traffic, high damage. Perfect embodiment of the core tension, and a great early "huh, that's
clever" moment because it teaches that capacity is about *concurrency*, not throughput. Punishes
players who bought bandwidth instead of architecture.
**Counter:** header/idle timeouts (which risk killing slow legitimate mobile users), per-IP
connection limits, or switching the frontend from a prefork worker model to an event-driven proxy
that buffers — nginx in front of Apache is a real, specific, teachable fix.
**Visual:** long-legged, slow, spindly silhouettes that creep in and *hold on* to a connection with a
visible thread; a server covered in thin threads like a cocoon; visible socket pips held by sloth
hands. The timeout counter is a pair of shears and the connection-reaper is a broom sprite. **Make
the stillness the alarm:** the threads should be drawn **taut and unmoving** while every other line on
the board pulses on the global heartbeat — in a world where everything breathes, stillness is the
loudest thing on screen. And the bandwidth graph beside it should be visibly, cheerfully green **in
the same frame.** The contradiction *is* the image.

**Variations and additions**

- **Opencode's treatment — Slowloris / R.U.D.Y. Squid** — Clings to a web server holding connections
  open forever, invisible until the server suffocates (worker pool slowly occupied). Countered by
  timeouts/idle-killers and worker autoscale, not firewalls — punishes players who never configure
  timeouts. (general, sysadmin)
- "The squat": a dozen nearly-invisible units occupying slots forever *without doing damage* —
  teaches that threat ≠ damage-dealing. (wave2_gamedesigner_fresh)
- "The Leeches": slow crabs that grab a connection slot and just... hold it (occupancy damage);
  cheap towers with few "slots" get smothered while traffic looks normal — teaches capacity vs
  connection-count; CAPTCHA-gate counter has false-positive bite. (wave3_gamedesigner_fresh)
- "The Loiterers": customers-turned-attackers dribble keep-alives and look exactly like real users
  until you measure *connection age* — a threat you must diagnose, not just filter.
  (wave4_general_fresh)
- R.U.D.Y. (slow POST): same family, attacks your tolerance for slow uploads. (wave3_sysadmin_fresh)
- The ReDoS Paradox Golem: a single request whose body folds your regex parser into infinite
  backtracking — one unit, one hit, a worker dies forever. It *cannot be rate-limited* (it's just
  one request!); the counter is a parser with timeouts (engine choice) or an input-shape gate — WAF
  rules can't see it coming without an anomaly baseline. Each worker it freezes silently eats your
  capacity meter: Slowloris's meaner cousin with a sniper. Visual: a figure holding a knotted rope
  that your bouncer stares at, unable to look away (paradox-stare animation).
  (wave2_general_informed)
- Worker-slot bulbs: each web server shows a row of dim bulbs (its worker pool); hijacked held-open
  connections light them sickly-gray one by one — the filling strip is a countdown you can feel;
  idle-killers pop bulbs back off with a warm flicker. (wave2_visual_informed)

### The Slow Read (reverse Slowloris)
Requests a large response and then reads it at 1 byte per second.

**How it works:** Your server has generated the whole response and is holding it in a socket buffer,
consuming a worker and memory, for as long as the attacker wants. The distinction from slow-POST
matters mechanically: **write timeouts are a different setting from read timeouts**, and a player who
fixed one has not fixed the other. A wonderful "you patched the wrong half" beat.

### HTTP/2 Rapid Reset
Opens a stream, cancels it immediately, repeats — thousands of times on **one connection**.

**How it works:** Defeats every defense the player has built that counts *connections* — connection
limits, per-IP caps, SYN cookies, conntrack limits — because there is only one connection and it is
well-behaved. The cost lands on request-processing capacity. **The payoff: the player's carefully
tuned connection-based defenses show green while the app dies.** The flood taxonomy elsewhere is
entirely connection- or volume-shaped; this is the "your mental model of the resource is wrong"
attack.
**Counter:** per-connection concurrent-stream limits, a reset-rate budget, a proxy version upgrade.

### The Handshake Flood (asymmetric crypto cost)
A small client forces expensive server-side cryptography by initiating TLS handshakes and walking
away, or by requesting renegotiation.

**How it works:** Costs almost nothing to send and a lot to answer — the attacker's CPU to your CPU
ratio can be 1:10 or worse. Traffic volume is trivial; your CPU graph is at 100%. Another "the
bandwidth graph is flat and you are dead" threat, same family as Slowloris, different resource.
**Counter:** session resumption, handshake rate limiting, hardware offload, moving TLS termination to
an edge that has more CPU than you do.

### Layer-7 GET Flood on the Expensive Endpoint / "Refresh Rats"
Not random URLs — it hits the one path that bypasses cache and hits the DB.

**How it works:** 200 req/s kills you where 200,000 req/s of static content wouldn't. Search, cart,
export, login, a PDF generator, `?s=` — your most expensive page. Far fewer units than a volumetric,
each disguised as a legitimate visitor, each revealing itself only by *behaviour*. **The core tension
of the whole game in one threat: every defense you add to stop this also repels revenue.**
**Counter:** cache the uncacheable (query normalization), per-endpoint-class rate limits, an edge
queue, a JS challenge / proof-of-work interstitial (costs you real visitors — a visible conversion
hit), CAPTCHA (a worse conversion hit), a behavioural WAF, or an architecture change that makes
search a separate service.
**Visual:** large, heavy, slow magenta blobs with a visible "weight" number and a **sag in the link
ribbon** as they pass — the cable literally droops under them. *(Resolve the two competing visuals in
favour of the sag: it's the more novel idea, it reuses the strain FX, and it makes the **link** the
victim, which is mechanically accurate. Drop the alternative "focused beam that goes past your cache
and lands on the database.")* A second, complementary reading for small-unit L7: a skittering pack of
rodent sprites that each hit an expensive endpoint and **visibly prefer whichever endpoint is most
expensive**, which teaches endpoint cost without a tooltip. Once discovered, the expensive endpoint
should be **visibly marked on the board** with a small cost tag on that path segment, so "the one
endpoint that hurts" becomes a place, not a statistic.

**Variations and additions**

- **Opencode's treatment — Layer-7 HTTP Flood** — Slow, smart, looks human: cache-busting unique
  URLs where every request is expensive. Visual: bots wearing increasingly convincing face masks.
  Counters: WAF with learned fingerprints, JS challenge — customers pay a 200ms "dignity tax."
  (sysadmin)
- HTTP/CC flood from *real proxies* = customer-lookalikes: hard to block without blocking customers
  — the game's "human shield" mechanic; JS-challenge tower, per-fingerprint rate limits, cache warm.
  (wave2_sysadmin_fresh)
  - The Human-Shield Swarm escalation: attack packets physically *clutch* real customers (little
    grey hooks on warm motes) — indiscriminate rate-limiting and tarpits now bounce hostages too;
    only precision counters (WAF, checkpoint timers) can separate them. The dual-flow thesis
    weaponized at wave scale; appears after the player over-relies on blanket filtering.
    (wave2_gamedesigner_informed)
- Cache-Buster Flood: random query strings make every request a cache MISS — your CDN towers go
  blind; counter is the normalize-params rule. (wave2_sysadmin_fresh)
- HTTP/2 CONTINUATION flood: the modern variant that only appears once a level's tech stack includes
  h2 — the threat roster ties to your own build choices. (wave3_sysadmin_fresh)
- WAF-aggressiveness knob: higher filters more payloads but bounces more real users — a dial on
  false positives baked into the same threat. (wave4_general_fresh)
- The Rapid-Reset Rat (HTTP/2 style): thousands of request streams, each *cancelled mid-flight* —
  servers burn setup work forever and old-style rate limits never see a single completed "request."
  Unlike Slowloris (which clings), this one jabs and withdraws; visible tell is stream open/close
  flicker on the LB. Counter: per-connection stream caps + reset-rate sensors — a tuning dial that
  misfires on genuinely flaky mobile customers (dual-flow tax again). (wave2_general_informed)

### ReDoS — The Regex That Ate A Core
A crafted input causes catastrophic backtracking in a regular expression, pegging one CPU core for
tens of seconds per request.

**How it works:** A handful of requests per second takes down a machine. The delicious version:
**the vulnerable regex is in your WAF rule set** — your defense is the amplifier, and disabling the
WAF fixes the outage, which is the most uncomfortable remediation in the game.
**Counter:** input length caps, regex timeouts, and a rule-cost profiler that makes the player audit
their own defenses.

### The Decompression Bomb
An upload or a request body that expands 1000:1 when decompressed.

**How it works:** Hits upload handlers, backup ingestion, log ingestion, mail scanning, antivirus,
and object-storage servers that transparently decompress. Fills memory or disk in seconds.
**Counter:** decompression ratio limits and a hard output cap — a cheap, boring, decisive purchase.
**Hosting types:** especially object storage, backup/DR, and email.

### Cache-Buster Flood / Cache-Miss Storm
Requests with random query strings to bypass your cache and hammer origin.

**How it works:** Defeats your CDN and forces origin hits — turns your own CDN into an amplifier
pointed at your origin.
**Counter:** cache key normalization / ignore-unknown-query-params (which you must *discover* by
observing the pattern), an origin shield, rate-limiting misses specifically.
**Visual:** a visitor-shaped decoy (a circle!) whose fill is a subtly wrong cyan — almost right,
slightly green. It walks past the cache untouched because its request is unique, and only at the
origin does its silhouette flip to a triangle with a small *pop*. The tell is the tiny query-string
tail rendered as a squiggle behind the dot.

### Mirai-Style IoT Botnet / The Murmuration
Tens of thousands of weak sources, each sending little, from residential IPs worldwide.

**How it works:** You cannot block by IP or country without eating real users.
**Visual:** a swarm of thousands of *distinct* junk-hardware silhouettes — cameras, routers, DVRs, a
fridge — rather than a uniform mass. Recognizable junk = instant thematic read. At the flock level
they move as one **murmuration**, like starlings: the silhouette changes as it reorganizes — a rope,
a fist, a fan — and **you can watch it choose a target by the way the flock leans.** Terrifying
because it's *beautiful* and enormous. **Counter visual:** the scrubbing centre is a comb the flock
has to pass through, and you watch it thin out.

**Variations and additions**

- **Opencode's treatment — The Botnet Tide (L4 DDoS flood)** — Not units — a *flood tide*: a
  translucent wall of packet-fish / ocean of identical grey blobs pouring down the pipe, clogging
  capacity rather than killing servers; drowning everything except scrubbing capacity. Defense =
  capacity math, not DPS. Dual-flow twist: the swarm shares the road with real customers — block
  indiscriminately and you block them too; rate-limit strength is a literal slider (safer road, more
  bounced customers). Visual: counted by density, not units; countered by AoE "waterwheels"
  (scrubbing) and levees (rate limiters). Game/CDN/web/all. (general, gamedesigner, visual)
- Mirai-class IoT wave: a living tide of identical tiny IoT-bots — not smart, just *count*, and it
  joins with any open device; it comes from residential IPs you can't just block (customers live
  there too!) — the geography-of-trust mechanic. (wave1_sysadmin_fresh, wave2_sysadmin_fresh)
- UDP flood "the Tide": an ink-blue wave rolling down the path, no unit to kill — you counter with
  *pipe capacity* and scrubbing detours that shave it down but add latency; cost if it lands is path
  saturation → all customers bounce. (wave2_general_fresh)
- Or read as a rising *level* of black water up the map's ingress lanes: swells in surges,
  telegraphed by a traffic-forecast HUD; your scrubbing/capacity must keep the water below the
  critical line — it attacks the flow, not the tower. (wave3_gamedesigner_fresh)
- Flocking visual: thousands of identical matte-grey drone-dots in murmuration; the flock drains
  toward the hostile palette as the attack ramps; counters shred single dots — the horror is the
  refill. (wave3_visual_fresh)
- The swarm is readable as a *shape* (a fist, a wave) only at macro scale; at a capacity point the
  pipe visibly swells and groans; scrubbing-center funnels vacuum motes into a "black hole" bin.
  (wave4_visual_fresh)
- Path-flocks like starlings; destroying spawners matters more than killing individuals — a
  meta-target threat. (wave2_general_fresh)
- Puppeteer overlay: a single glowing marionette-node floats behind the swarm trailing visible
  control threads to every mote — snip the threads and the swarm goes limp and scatters harmlessly.
  Teaches C2 targeting. (wave4_visual_fresh)
- The Botnet Resistor (comeback mechanic): bots destroyed too cheaply respawn later as a mega-wave —
  "they memorized your filter"; over-reliance on one counter type buffs the respawn.
  (wave2_gamedesigner_fresh)
  - Attacker Memory, cross-run edition (opt-in meta-threat, hard-mode only): the booter "remembers"
    your signature loadout across sessions — your favorite firewall shows a "known counter" tag and
    later runs open with probe waves designed against it. Enforces build rotation without punishing
    with RNG noise; visualized on the in-game dark-web forum board you can browse between levels.
    (wave2_gamedesigner_informed)
- Botnet Echo (history with teeth): wave N's attackers return in wave N+3 as a coordinated botnet —
  remember that spam farm you didn't evict? It's at your gates with 10k zombie hosts.
  (wave3_gamedesigner_fresh)
- Waterline gauges + the scrub-catch tell: the flood needs the same river-gauge grammar as
  hurricanes (Gbps notches, crest marks) so magnitude is pre-read; and the scrubbing plant's
  discharge must show customers in the *waste* channel during overload — if the outflow runs clean,
  players can't tell good scrubbing from drowning service; a few warm figures tumbling down the
  drain is the real "detour tax" picture. (wave2_visual_informed)
- Give the tide a visible *throat* — a choke gauge where the flood narrows — and scrubbers a counted
  discharge animation (packets exiting clean single-file). The capacity drama ("did my scrubbers eat
  enough?") should be watchable, not inferable. (wave2_gamedesigner_informed)
- DDoS amplification storm as *environment*: the lane floods with borrowed packets from innocent
  third parties — killing them costs you, they are customer-shaped transit passengers. Moral
  mechanic: filter vs. tolerate. (wave4_gamedesigner_fresh)
- Endgame form — "pipe full": just saturates the uplink; nothing to block, you must absorb via more
  bandwidth or spread via anycast. (wave4_sysadmin_fresh)
- Misdirected DDoS ("Collateral Flood"): you get flooded because *someone else* on your network made
  an enemy — being in the wrong address block is a risk; your IP ranges' reputation becomes a
  purchasable asset. (wave3_general_fresh)
- Generic early bot swarm: mindless packet-blobs, cheap to kill, saturate by volume — every hosting
  type has a reskin (spam bots, SYN floods, login bots). (wave4_gamedesigner_fresh)
- "The Bot" persona: a single huge number of cheap-to-stop units arriving in waves; unkillable "fake
  streams" of raw UDP that stateless firewalls shrug at — filtering them without blocking *real* UDP
  (QUIC, game traffic) needs protocol-aware balancers; packet loss makes gamers rage-quit instantly.
  (wave3_sysadmin_fresh, wave4_sysadmin_fresh, wave4_general_fresh)
- The tide metaphor perfected: the wave hits the first line of defense and *piles up* — overflow
  pools form where scrubbing fails, and the tide-line recedes visibly as defenses win (the clearest
  progress feedback in the game); treatment plants (scrubbing centers) drain the flood back into
  clean single customers. (wave1_visual_fresh, wave3_visual_fresh)

### Pulse Wave
Repeated short, enormous bursts timed to arrive between your autoscaler's reaction windows.

**How it works:** Explicitly designed to punish reactive-only builds. Each burst ends before your
scaling policy fires; the next one starts before capacity comes back down.
**Counter:** pre-warmed capacity, faster detection, a floor under your autoscaler.

### Carpet Bomb / Prefix Attack
Targets your whole /24 at low rate per IP, staying under every per-IP threshold but summing to a full
pipe.

**How it works:** Detection must be at the prefix level. Defeats naive per-host defenses — a great
mid-game "your old counter stopped working" beat, and a difficulty spike aimed squarely at players
who defend per-server instead of per-edge. **Teaches that thresholds are a thing attackers know
about.**
**Counter:** subnet-level aggregation detection, holistic rather than per-host monitoring.

### Connection Exhaustion
Fills your load balancer's connection table.

**How it works:** Visually the lane's "slots" fill with grey and visitors queue outside, patience
draining. Distinct from SYN flood in that the connections are real.

### Cache Stampede / Thundering Herd
Triggered by *your own* success: a popular cached item expires and 10,000 real visitors miss
simultaneously.

**How it works:** A self-inflicted flood spawned by good traffic. **The best kind of enemy — it makes
the player suspicious of their own wins.** Essentially: your cache is a load-bearing wall and it
expires on a schedule.
**Counter:** jittered/staggered TTLs, request coalescing (lock-and-refresh), stale-while-revalidate.
**The family (extend it so the lesson lands more than once):** **the Warm-Up Stampede** (a scale-out
event where the new node is cold), **the Restart Herd** (everything reconnecting after a blip), **the
Deploy Herd** (cache busted by a release), **the Renewal Herd** (all your annual customers billing on
the 1st), and the cron version where everything scheduled at `0 * * * *` fires together. Same shape,
five contexts, and together they teach the actual generalisable lesson: **synchronisation is the
enemy.**
**Visual:** after an outage, all the queued visitors arrive **at once** as a compressed slug of light
visibly denser than a normal wave. Watching your own recovery kill you again is a great teaching
image.
**Interacts with:** §2.12 IoT reconnect storm, §2.17 metastable failure.

### Retry Storm
Your own clients' retry logic amplifies a small blip into a full outage.

**How it works:** Appears only *after* something else fails — a secondary threat that piggybacks on
your bad minute, turning a 2-second blip into a 4-minute outage. Punishes bad recovery order.
**Counter:** exponential backoff with jitter (you can't control third-party clients), circuit
breakers, load shedding, and a `429` with `Retry-After` that well-behaved clients honour.
**Hosting types:** worst in IoT (millions of devices, zero backoff, unpatchable) and serverless.
**Visual:** the herd converging is a huge **cyan** wall, not a magenta one — *sometimes your own
customers are the DDoS.* Also: a wall of visitors arriving in a perfectly straight line, which is the
tell that it's mechanical rather than human.
**Interacts with:** §2.17 The Metastable Failure (the version that doesn't stop when the cause does).

### TCP Incast
Many servers answer one request simultaneously and collectively overwhelm the requester's switch port.

**How it works:** Emerges only above a certain fan-out, so it appears when you *scale out* — **the
architecture that solved your last problem creates this one.** Classic in distributed storage,
map-reduce, and erasure-coded reads. A failure caused by adding capacity, which fits the "your success
is the threat" family perfectly.
**Hosting types:** object storage, HPC, DBaaS, video ingest.
**Interacts with:** §2.7 The Microburst (the measurement-resolution twin).

### Packet Swarm (generic volumetric, presentation entry)
The generic DDoS rendered as MASS rather than as a creature.

**How it works:** Not one creature — a cloud of thousands of tiny magenta arrowheads behaving like a
starling murmuration. At close zoom they're individual triangles; zoomed out they merge into a single
roiling magenta ribbon whose *width* is the packets-per-second. Landing: they don't hit the server,
they **pile up in front of it**, physically stacking into a growing drift that buries the machine's
faceplate until its LEDs can't be seen — the clearest possible picture of a queue filling.
Counter (scrubbing): a green cone sweeps the drift and the triangles dissolve into harmless grey ash.
**Promote the pile-up to a universal law:** this should be the **standard rendering of any full
queue**, not a DDoS-specific effect — legitimate traffic piling up during a launch spike buries the
faceplate in *cyan* exactly the same way. One mechanic, one image, two valences.
**Interacts with:** §8.5, §3 (launch-day surges).

### Booter / Stresser Kid
A script kiddie who rented 10 minutes of a botnet for $15 because someone beat them in a video game.

**How it works:** Short, sharp, enormous, dumb, and *aimed at one tenant* — which introduces the "your
customer is the target and everyone else is collateral" problem and the horrible decision to
**null-route your own paying customer to save everyone else.** Repeats every evening at the same
time. 30-second bursts, repeated, to grief one match. Adaptive punchline: they give up if three
attacks in a row do nothing.
**Counter:** per-instance IP rotation, hiding real IPs behind a proxy layer (**which costs latency,
the thing you sell**), anti-DDoS game-protocol filters, upstream blackhole of the targeted IP.
**Hosting types:** endemic to game hosting; also hits VPS and shared web.
**Visual:** a tiny sprite at a laptop with a visible web stresser panel floating beside them showing
"attack: 300s". Its charm is that you can *see the timer* — you know exactly how long to hold. At the
map edge, a cartoonish **Booter Cannon** that *visibly aims at a specific player's lobby* before
firing, so you know which customer is about to eat it and can shield them — the most satisfying
"block it in time" moment in the game.

### Ransom DDoS (RDoS)
A demo attack, then an email.

**How it works:** The player chooses: pay (works once, costs cash, and permanently marks you as a
payer, increasing future extortion frequency — a real dynamic), harden, or go public. Paying is
cheaper now and strictly worse long-term. Excellent economy/reputation hook.
**Visual:** the attack stops and a notification arrives with a countdown timer pinned to the HUD.
**The threat becomes a UI element**, which is unnerving in the right way. The full ransom overlay is a
semi-transparent note in a deliberately ugly font that partially blocks your view.
**⚔️ Tension — UI occlusion is a hazard as well as an image.** "The attack is literally UI occlusion"
is a wonderfully hateable mechanic and an accessibility and usability problem during a live incident.
**Resolution:** occlude a **non-critical region only** (the incident-ticker area), make it dismissable
with one key, and make the *dismissal itself* the mechanic — dismissing it starts the countdown
visibly on the Obligation Rail so you cannot forget it. The dread survives; the UI stays usable.

### Bandwidth Bill Bomb
A sneaky variant: the attack is *survivable* but the traffic is metered.

**How it works:** You win the fight and lose the month. Damage is dealt to the invoice, not the
servers. Wonderful because the player's instinct (tank it) is the wrong answer. With 95th-percentile
billing, a DDoS you absorb rather than drop costs real money even with zero downtime. The CEO's
framing: the cost of a volumetric is never the attack — it's (a) your transit overage on the
*scrubbed* traffic, (b) collateral damage to co-located customers, and (c) your upstream null-routing
your entire prefix to protect themselves.
**Counter:** scrubbing contracts — a fixed monthly cost that is also **sellable as a premium feature,
turning the threat into a product.**
**Interacts with:** §2.21 (the Cost Attack category, of which this is the flagship), §6.3 (95th
percentile), §6.7.

---

## 2.4 Mimics: threats that look like visitors

*The mechanical crown jewel. These units are **rendered identically to visitors** until identified.
Every counter that kills them also kills real customers at some rate. This is where the game's
central tension becomes a literal targeting problem.*

### Layer-7 Mimic
Requests your most expensive page over and over, at human-plausible rates, from thousands of
residential IPs.

**How it works:** Indistinguishable from popularity. If you rate-limit hard enough to stop it, your
conversion rate craters. Correct answers are *nuanced*: cache the expensive page, add a
cost-per-request budget, fingerprint behaviour over time.
**Counter:** the Bot Fingerprinter (§4.5) — expensive, slow to "train," and the late-game answer to
the game's central dilemma. **It is not free:** see §2.16's Model Poisoning, which is the downside
the fingerprinter is otherwise missing.

### Card Tester
Runs tiny transactions through your checkout to validate stolen cards.

**How it works:** **Looks like conversion.** Your revenue graph goes *up* right before your payment
processor drops you. A threat that masquerades as success.
**The counterplay that makes it a decision instead of a trap:** put an **authorisation-rate** stat
next to revenue. Card testing pushes revenue up and auth-rate *down*. A player who knows to watch the
ratio catches it in twenty seconds; a player watching only revenue celebrates. A perfect
information-design puzzle, and it costs exactly one number.
**Visual:** identical-looking visitors arriving in synchronized formation, all with *identical
wallets*. The visual tell is the repetition — a player learns to spot fraud by pattern.
**Interacts with:** §2.10 (processor termination, chargeback swarm), §2.11 The Carder Ring.

**Variations and additions**

- **Opencode's treatment — Card-Testing Bots** — A wave that attacks your *signup/checkout* (not
  your servers!): scripts hammer the payment form with stolen card data; every successful test hit =
  a chargeback fee, while blocking too aggressively = legit customers declined at checkout
  (bounce!). Counter: fraud-screening buildable, CAPTCHAs, velocity rules — a dial between friction
  and fraud loss. Worst on self-serve. (wave3_ceo_fresh)

### Scraper Locust (the ambiguity case)
Steals your content at high volume.

**How it works:** Ambiguous: some scrapers are search engines you *want*. Blocking indiscriminately
tanks your organic traffic two waves later — a **delayed-consequence** punishment the game should
telegraph exactly once and then never again.
**Counter:** rate limiting, robots, or the monetize-instead-of-kill option — **sell them an API
plan.** Several threats in this game should be convertible into revenue rather than killed.
**Interacts with:** §3.2 (Googlebot / the Crawler, which looks identical), §2.2 AI Scraper Locusts.

### The Fake Signup Wave
Hundreds of free-tier accounts created by one actor to farm your resources.

**How it works:** Your "customer growth" metric spikes. Your margins die.
**Interacts with:** §2.16 Generative Abuse at Scale (the version where the fake signups are
indistinguishable from real companies).

**Variations and additions**

- **Opencode's treatment — Free-Trial Abuser & Graveyard** — Bot-signups minting trials for
  spam/crypto mining — each is negative revenue (real capacity consumed, 0% conversion); or simply
  10,000 trials at 3% conversion: a metered compute drain that teaches CAC/LTV thinking early. Farms
  of fake signups (generated identities, burner cards) wave through trial GPU/compute. The friction
  dial: credit-card-at-signup (kills conversion!), manual review (adds support load),
  KYC/phone-verify gates, deposit plans — the stricter the vetting, the lower your conversion AND
  the lower your fraud. The eternal tradeoff: fraud friction vs. customer acquisition; the perfect
  early lesson in why identity checks exist. (wave1_ceo_fresh, wave2_ceo_fresh, wave3_ceo_fresh)

### Sybil Reviewers
Units that look like advocates but leave fake reviews — positive *or* negative.

**How it works:** Positive fakes are the nastier version: they inflate your reputation, attract
clients you can't serve, and then the correction hurts twice.

### The Squatter (a threat that enters through your revenue funnel)
Signs up as a legitimate customer, pays with a stolen card, and immediately starts
spamming/mining/phishing from inside your network.

**How it works:** Your abuse desk must find them before your IP ranges get blacklisted. **The ultimate
expression of "attracting visitors is dangerous."**
**Counter:** fraud scoring at signup (which rejects some real customers), manual review (staff time),
deposit requirements, KYC (which reduces signup conversion).
**Visual:** a client who *looks* like a customer (gold ring) but whose workloads spawn threat-shaped
units from *inside* your perimeter — a friendly icon emitting hostile triangles, with a slowly
darkening gold ring so an attentive player can catch it.

### Slowloris Sloth (mimic framing)
Occupies a connection slot and does almost nothing, forever.

**How it works:** Visually a visitor that walks the lane at 2% speed and never arrives, holding a slot
open the whole time. Listed here as well as in §2.3 because its *mimic* quality — it looks like a
patient customer — is what makes the timeout counter painful.

### The Coat Thief (session hijack)
A threat that steals a visitor's session and wears it in.

**How it works:** It takes a visitor's *coat* (their session ribbon), puts it on, and walks past every
check that was satisfied at login. Your visitor, now coatless, bounces confused. Every authorization
check downstream says yes, because it is checking the coat.
**Counter:** short session lifetimes (friction), binding sessions to device fingerprint or IP
(breaks mobile customers who change networks), re-auth on sensitive actions (conversion cost).

### The Vending Machine Shaker (API abuse)
A sprite that grabs your API endpoint and rattles it for freebies.

**How it works:** Not a flood — a *mining* of your free tier, your trial credits, your unauthenticated
endpoints, your price-list endpoint. Rate limits are drawn as a turnstile with a visible counter.
**Interacts with:** §2.16 The Agentic Customer.

### The Mimic Tell (design law)
Mimics look exactly like visitors **except for one tiny tell** the player learns to spot.

**How it works:** A slightly too-regular gait; a footstep that lands exactly on the beat; a path
that's too systematic; an identical prop. **Teaching players to see the tell is the game's deepest
skill.** The identification reveal, when a Fingerprinter unmasks one, should be loud and satisfying:
the friendly visitor sprite cracks open and a red threat steps out. Spec the flash: a 0.15s scale-up
to 115% with a hue snap and a single tick, and **the flash intensity scales with how wrong you
were** — a mimic resolving to a threat flashes harder than a violet dot resolving to a page load. You
want the surprising resolutions to be the loud ones.

**Three corrections to the law, all of which must hold at once:**

**(a) The tell must never be colour, and never a single pixel.** "A fill colour a few degrees off" is
invisible to ~8% of male players and violates the Diamond/Circle/Triangle shape law. **Four
non-colour tell channels, one per mimic class:** **Cadence** — their footfall lands exactly on the
global heartbeat while real visitors are slightly off it. **Formation** — they arrive in a rank that
is too even (Card Tester). **Path** — perfectly systematic traversal (AI Scraper). **Prop** — an
identical wallet, an identical user-agent tag, an identical query-string squiggle. **Every tell must
survive greyscale**, and a Contrast Audit Mode pass is part of mimic sign-off.

**(b) Tells are *statistical*, not per-unit, and they change kind with altitude.** A one-pixel tell
on a screen with 400 objects at 3× speed is pixel-hunting, not skill. **The tell is perceptual at low
zoom and statistical at high zoom:**
- **Z1 (one object):** the visual tell as written — gait, timing, prop. Rewards close looking.
- **Z2 (rack/cluster):** a **formation** tell — unnaturally uniform spacing, identical inter-arrival
  times, perfectly identical payload sizes.
- **Z3+ (room/topology):** a **statistical** tell surfaced in the UI — a histogram whose shape is
  wrong, a conversion rate that dropped while traffic rose, a request-size distribution with a spike
  at one value. At scale you don't *see* the mimic, you *notice the aggregate is wrong*, which is
  exactly how it works in real life and is a much better lesson.

**(c) The skill must be learnable deliberately.** A **Tell Trainer** in the Codex lets you watch a
mimic and a visitor side by side at 0.25× speed as many times as you like. Learning by accident is
not a teaching design.
**Interacts with:** §8.2 (purple = unidentified is the emotional heart of the palette), §2.26 The
Silent Threat Strip (rendering the mimic's silence as a visible notch in the room tone, which is the
only way deaf players get the best tell).

### The Hug of Death (HN/Reddit/storm)
A *friendly-looking* mega-wave: legit, joyful customers at 4000x volume that kill you exactly like a
DDoS if your scaling isn't ready.

**How it works:** Distinct visual: the mob is colorful and cheering while your alerts are the same.
The single best "is it a threat or a customer?" teaching moment. (gamedesigner)

---

## 2.5 Application, injection, and data threats

*Each of these should be **unspawnable until you build the thing that invites it** — so the player
literally watches their bestiary grow as their network grows (Pillar P2). See §2.1's pool cap and
mastery-demotion rules for how the family stays readable at fifty buildables.*

### SQL Injection Serpent / The Ink Worm *(unlocked by: a database)*
A slow, sneaky single unit that walks to your web server and, if a DB is connected behind it, tries
the link.

**How it works:** Doesn't damage anything visible — it **copies** your customer table and walks back
out. Damage is delayed reputation + legal cost, and you discover it six months later. Alternatively
drops a webshell via `INTO OUTFILE`. The canonical "new capability = new attack surface" demonstrator
and the tutorial for Pillar P2.
**Counter:** prepared statements (a code-quality upgrade for a customer, which you can *recommend*
but not force — customers own their code), WAF rules (partial, and see ReDoS for how a WAF becomes
the problem), DB user least-privilege (huge: a read-only DB user turns a catastrophe into an
incident), **egress filtering — the database should not be able to talk to the internet**, and query
anomaly detection.
**Visual:** a thin magenta serpent with an apostrophe-shaped head that ignores the front door and
slithers along the *cable* between web and DB — attacking the link rather than the node. The web
server goes briefly translucent as it passes (the tell). On success the DB's data drawers fly open
and rows stream out as scrolling glyph ribbons toward the map edge: **data exfiltration should look
like theft, visibly, in transit.** The worm leaves black ink on the wire as it crawls; a WAF is a
visible mesh sieve on the wire it splatters against; parameterized-query armour gives the cable a
braided sheath.
**The counter-image (rare and valuable):** with least-privilege configured, the serpent reaches the
DB, the drawers open, and **the ribbons that emerge are blank.** It stole nothing readable.
Rendering *a successful defense that still let the attack land* is exactly what a read-only DB user
actually does, and almost no game shows it.

**Variations and additions**

- **Opencode's treatment — SQL Injection Serpent / Sneak** — Slithers *inside* a request that passed
  every perimeter filter — it looked legitimate to the web tier. A tiny fast unit that doesn't
  attack towers at all: it runs for your *database*, carrying stolen data back out along the same
  path; kills nothing, but each return trip = a customer-trust hit + potential breach headline.
  Visual: quote-marks for scales / a syringe riding a brown "HTTP box" toward the DB safe; arrives
  looking exactly like a customer — only the door-bouncer WAF gets one frame to catch the tell: its
  sprite *tears*, revealing an angular core. Counters: parameterized-query WAF rules on the DB
  connection itself, input-sanitizer gates, least privilege, and the real answer: never expose the
  DB. Teaches the brief's core tradeoff: DB = new attack vector. (general, sysadmin, gamedesigner,
  visual)
- Correction — WAFs don't parameterize: parameterization is *application code*; a WAF is
  signature/anomaly matching that a determined attacker obfuscates past. Make the true counter a
  tech ladder on the customer side: WAF rules (blocks bulk scanners; the "one frame tear tell" is
  the right fiction) → a "secure app framework" upgrade *the customer must adopt* (their bad PHP is
  your enemy and you can only prompt them) → least-privilege DB accounts → never-expose-the-DB. The
  ladder is the genre's truest lesson: **you don't control your tenants' code** — the WordPress
  Swarm already says it; the SQLi counter should *use* that fact. (wave2_sysadmin_informed)
- Walks the customer lane wearing a valid visitor skin with an *oversized payload sprite* — legit
  filters miss it; the core "precision matters" lesson. (wave2_gamedesigner_fresh)
- Submits a request string with a telltale `' OR 1=1 --` glint; reaching an exposed DB opens it from
  inside — the payoff of the "hidden surface" mechanic. (wave2_general_fresh)
- "The Drip": malicious requests rendered as ink droplets that *slip through* the web-front grate
  and stain the DB cylinder below; parameterization defense = a literal activated-charcoal filter.
  (wave2_visual_fresh)
- "The Lockpick": if it reaches an unguarded database it doesn't destroy it — it *copies data and
  leaves*: exfil = delayed breach-notification event + fines + rep hit. The parameterized-query
  research perk removes the vulnerability outright (attack-surface shrink via tech tree!).
  (wave3_gamedesigner_fresh)
- The SQL-Injection Syringe: payload arrows shaped like legit queries but with a *needle tip*; on
  hit, a data vault opens and glowing records siphon out toward the threat lane — exfiltration as a
  visible loot-trail; parameterization armor pours queries through a mold before they enter.
  (wave3_visual_fresh)
- A threat that can ONLY exist if you built the DB tower (surface mechanic in action): if it reaches
  the DB it *converts your customer lane into an exfil lane* — stolen data = instant churn spike.
  (wave4_gamedesigner_fresh)
- "The customer with a mask": a perfectly ordinary customer sprite walks the *customer lane* (the
  rule violation IS the tell), then at the web server peels off a mask of code-symbols and dives
  *through* it toward the DB; the WAF is a bouncer doing a pat-down at the door.
  (wave4_visual_fresh)
- It walks *through* your WAF if the web app has a hole — the perfect "sneaky unit" archetype;
  prepared-statement hardening unlocks as counter-tech. (wave2_sysadmin_fresh)

### Blind SQLi
Same, but invisible.

**How it works:** It doesn't show as an attack marker, only as a faint anomaly in your query-latency
graph. Requires monitoring to even *see*.

### The Dump (the consequence unit)
If SQLi succeeded earlier, this arrives two levels later as a news event.

**How it works:** Delayed-consequence design; makes the campaign feel causal. The full cost of a data
breach: notification costs + credit monitoring + regulatory fine + insurance deductible + a 3–6 month
churn tail + **every enterprise deal in your pipeline freezing.**

**Variations and additions**

- **Opencode's treatment — The Doxbin Leak / Blackmail** — Exfiltrated data (from an APT, or a
  disgruntled admin) appears on the dark-web board: the customer-trust meter drains until you issue
  disclosure + a credit-monitoring service tower — and the same attacker *returns as a sequel* if
  you don't fix the root cause. (wave2_general_fresh)

### XSS Worm / XSS Marionette / The Mirror Moth *(unlocked by: user content)*
Infects one visitor, and that visitor infects other visitors.

**How it works:** Spreads through your *user graph*, not your infrastructure. Rides *inside* a
legitimate visitor: if you kill the carrier you lose a customer; if you let them through, the payload
infects others. **A perfect hostage mechanic.** Uniquely creepy: your own traffic becomes the attack.
**Counter:** output sanitization, CSP — drawn as a green gate that snips the strings with a scissor
animation.
**Visual:** attaches **strings to your visitors** on the way out; infected visitors get a
puppet-cross glyph and their path starts curving toward the attacker's exfil node. The visual horror
is watching *your own revenue walking away.* A second rendering of the same idea: a moth lands on a
page, lays a **reflected copy of your own UI**, and visitors that touch the copy turn magenta and
become threats — **your own visitors converting into attackers** is the whole lesson.

**Variations and additions**

- **Opencode's treatment — XSS Worm (Tenant Plague)** — Contagious: starts on one shared site, hops
  to adjacent tenants every few seconds, converting their pages into delivery vehicles — the enemy
  you're protecting customers *from each other*. Quarantine towers (isolate a rack segment) or
  container-isolation tech stop the spread; classic TD "infection" genre crossover. Isolation
  dilemma: quarantining an infected site costs the customer uptime and their wrath — or let it
  spread. Shared/managed WordPress. (wave2_general_fresh, wave4_general_fresh)

### File Upload Backdoor / Webshell
The *persistence* threat. Once dropped it is quiet.

**How it works:** Enters disguised as a legitimate visitor using the upload feature you built to
increase conversion. It doesn't damage you now; it sits there and becomes the entry point for later
waves — a hidden debuff nobody sees for ten minutes. A permanent resident that spawns other threats
until evicted, **and it re-infects after you clean.** Requires an active *hunt* action to remove —
the "clear the debuff" loop TDs usually lack.
**Counter:** file-integrity monitoring, outbound-traffic anomaly detection, immutable infrastructure,
a **rebuild-don't-clean policy**, or a full rebuild.
**Visual:** after the attack resolves, a small dark glyph remains embedded in the web server's file
icon. Easy to miss. It pulses once every 30 seconds. Later, when it wakes up, that pulse is the "oh
no" moment. **Infestation veins** spread from it along the **trust graph** specifically (not the data
graph), which makes the trust overlay suddenly the most valuable lens in the game and justifies its
existence; a vein must stay visible at Z3 as a thin dark line on the link, so infestation can't hide
behind zoom.

**Variations and additions**

- **Opencode's treatment — Webshell Upload** — A customer's outdated WordPress becomes a beachhead
  *inside* your perimeter — the attacker walks the paths your edge defenses were built to protect.
  The TD twist: enemies spawn *behind the wall* because the wall was made of a tenant's bad code.
  Counters: scanner sweeps, filesystem-integrity towers, WAF. Shared/VPS/web. (sysadmin)
- "WordPress hell" flavor: RCE via vulnerable plugin or *nulled theme* — one account roots the box
  and the breach goes cross-site. (wave4_sysadmin_fresh)
- The compromised customer site becomes a beachhead that attacks *its neighbors* from inside your
  perimeter. (wave3_sysadmin_fresh)

### Path Traversal Sneak / Directory Traversal Mole
Small, fast, goes for config files.

**How it works:** Only dangerous if you left a specific build in a specific state — rewards tidy
building. If it succeeds it steals **credentials**, which later spawn a **Credentialed Intruder** who
walks in through the front door while your firewall waves at them.
**Counter:** chroot/jail, least privilege.
**Visual:** burrows under your filesystem tree (a sideways tree diagram in the inspector) leaving a
dotted tunnel; `../../` drawn as a visible upward staircase. Chroot is a concrete floor slab under
the tree.

### Deserialization Bomb *(unlocked by: app framework / a convenience plugin)*
Rare, high-damage, one-shot.

**How it works:** Only possible if you installed a specific convenience plugin. The reward for the
plugin was +conversion; the bill comes later. If it lands, it doesn't damage — it **converts one of
your servers to an enemy spawner.**

### SSRF Tunneler / SSRF Courier
Tricks your own server into attacking your *internal* network.

**How it works:** **Turns your tower into the attacker's weapon.** A packet enters legitimately, then
turns around and walks *backwards* through your trust boundary.
**Counter:** egress filtering, metadata endpoint protection, internal segmentation — all things
players never build until this hits them once.

**Variations and additions**

- **Opencode's treatment — The Metadata Heist (SSRF)** — The attacker slips through a web app a URL
  that says "fetch your config from *169.254.169.254*" — your own instances hand over their
  credentials to anything that asks from the inside. A threat that makes your *buildings give
  themselves up*; counters are link-local blocking (a lane-closure tower on the management subnet)
  and metadata-token gating. On cloud levels it's the #1 lateral-movement doorway and it *ignores
  your perimeter entirely* — the attacker never crosses a wall; a messenger pigeon inside the walls
  does it. Often chained behind SQLi; the zero-trust lesson (§8). (wave2_general_informed)
- The desk with a megaphone: the metadata service is a tiny "who am I" desk on every cloud node
  announcing "I have role X!" — IMDSv2 (token-gate the desk) is the named counter unlock, and it's
  the *mechanism* behind the API-key-theft beats: same theft vector, one mechanic explains how.
  (wave2_sysadmin_informed)

### Cache Deception (the mirror of cache poisoning)
The attacker tricks the cache into storing a **private, authenticated page** under a URL that looks
static, then fetches it themselves.

**How it works:** `/account/settings/logo.css` — the origin serves the account page, the CDN sees a
`.css` extension and caches it publicly. The damage is a **data breach delivered by your own
performance optimization**, and it is invisible in every metric you have.
**Counter:** cache-key and content-type discipline.
**Hosting types:** CDN, managed web, any caching edge.
**Interacts with:** §2.12 CDN Cache Poisoning via Header — ship both; they are mirror images.

### Dependency Poisoning / Typosquat / Supply-Chain Trojan / The Tainted Crate
Arrives during a *deploy*, not through the network.

**How it works:** A package you pulled is malicious, or is the wrong one by one letter. A container
base image, a vendor firmware, or a monitoring agent you installed on every box turns hostile. **It
bypasses every perimeter defense because you invited it in.** Mechanically: a threat that spawns
*inside* your walls, at a rate proportional to how many third-party components you built. At the
moment of arrival there is no counter at all — only prior architecture. **Teaches that some defenses
are bought in the past tense.**
**Counter:** lockfiles, pinning, SBOM scanning, artifact mirrors, an internal registry, build
isolation, vendor review, reducing agent sprawl, network segmentation so the agent can't reach
everything, and a review process — all of which slow your deploy cadence, which slows feature
velocity, which slows visitor growth. **A genuine dilemma with no right answer.**
**Visual:** arrives **inside a friendly delivery** — the package truck / crate / container image you
*asked for*. A normal cyan-taped crate with a single magenta staple, or one wrong stencil character,
that you can only notice if you inspect before install. After install it sits inside your server as a
small pulsing magenta pip visible only in the cutaway inspector view, and it quietly spawns a backdoor
sprite three minutes later. Countered visually by the inspection-bench animation: a tech prying the
lid and shining a light in.

**Variations and additions**

- **Opencode's treatment — Supply-Chain Trojan Horse / Poisoned Update** — A free "dependency crate"
  gift arrives with an attack sealed inside (a tempting pickup); or a dependency you *chose to
  install* turns hostile (typosquatted package, compromised maintainer) — the tower you bought
  attacks you from inside. Counters: SBOM scanner tower, reproducible-build checks, pinned versions
  (slower but trusted) vs "latest" (faster but risky) toggle on every service; signature checks.
  (general, sysadmin, gamedesigner)
- The Common Allergy (monoculture correlation): you diversified hardware, vendors, racks — but every
  tier runs the same NGINX, the same auth library, the same CDN's JS tag. A "vendor-typo day" event:
  one global config push or one library CVE detonates your *whole estate at once* regardless of
  topology. The game's answer is legibility — the Allergy Map overlay grouping nodes by
  shared-software family (the CMDB's offensive twin) — and the real trade: heterogeneity costs ops
  attention (two load balancers = two skill sets = staff-burnout tax) to buy correlation insurance.
  Late-game macro lesson. (wave3_sysadmin_informed)
- "The Trojan package": arrives as a *delivery* to one of your buildables (looks like a legit
  maintenance truck); if the target runs the update, it opens a backdoor beacon. Counters:
  signed-build inspection gate, pinned-repo depots. (wave2_gamedesigner_fresh)
- Retroactive variant: your own apt mirror serves malware, infecting everything installed from it
  during the window — it damages things you *already placed*. (wave2_general_fresh)
- Dependency worm: the payload spreads to every buildable using the package; counters are lockfiles
  tower, pinned mirrors, staged rollout. Especially PaaS/K8s. (wave2_sysadmin_fresh)
- The toggle IS the mechanic: auto-updates ON = guaranteed trigger; auto-updates OFF = patches
  delayed. Signature: your *towers become the boss wave*. (wave3_gamedesigner_fresh)
- The game punishes blind `npm update` (auto-update carries a hidden risk meter) and rewards pinning
  + canary environments. (wave4_general_fresh)
- Your OWN update pipeline is the vector: the maintenance bot that upgrades your towers can itself
  be compromised; the counter is a staged-rollout global buildable (upgrade N% of towers at a time).
  (wave4_gamedesigner_fresh)
- "The tainted crate": a legit-looking hardware box arrives on your delivery lane; once installed it
  wears a tiny antenna and beacons to the seizure-van threat *from inside*. Counter: tamper-evident
  seals that glow green/red on inspection. (wave4_visual_fresh)
  - The Bad SMD (hardware implant, the adversarial twin of entropy): a shipment of RAM/PSUs contains
    a hostile chip that ships *from your own supplier* and activates after a random uptime. It
    bypasses every digital defense because it IS hardware; the tell is a microsecond timing pulse or
    an unexplained port that lights without config; removal requires a *physical swap under load*
    (mini-outage, staff dispatch). Counters: vendor-trust (OEM relations unlock) + mixed-vendor
    policy — the same lesson as capacitor-plague batch death, but adversarial. Colo/bare-metal/GPU.
    (wave2_general_informed)
- Vendor-trust and SBOM scanners inspect new arrivals at the boundary — "some defenses come from
  off-map vendors who can also betray you." (wave3_general_fresh, wave3_sysadmin_fresh)
- The Trojan Packet form: an envelope/parcel/coin that *looks like a customer or legitimate payload*
  — deliberately wearing warm disguise colors until inspection reveals a violet seam — delivering
  its payload when admitted. Anchors: email, shared hosting, game servers (fake "premium buyers").
  Counters: captcha checkpoint gates and deep-packet-inspection windows (literally a toggleable
  X-ray overlay). (wave3_visual_fresh)
- Compromised Third-Party Widget form: a visitor-facing embed from an external vendor (chat widget,
  analytics script) gets compromised upstream and serves malicious content *through your pages* —
  your security posture now depends on a vendor you never audited; counters: script
  allow-listing/CSP gates and vendor-provenance inspection. (wave0)

### Log4Everything / The Zero-Day Drop / Exploit Kit (CVE Drop)
A mechanic you've relied on all game is suddenly a vulnerability.

**How it works:** Announced globally as an event with a window of hours between disclosure and mass
exploitation, and it targets a **named component you actually built**. Every player is hit; the
differentiator is *response speed*, which is a function of how much monitoring and automation you
built. The player's whole fleet is flagged vulnerable and they must triage patch order — and patching
is *itself* risky (a small chance a patch breaks a customer's site, which is worst in managed
hosting). A great "the whole industry is on fire tonight" shared moment and a superb risk/reward beat.
**Visual:** **The Zero-Day Wraith / The Blank Card** — a threat with **no icon at all**: a featureless
silhouette-shaped hole in the world, like a sticker peeled off, because the player doesn't know what
it is yet. It passes through every defense with a soft violet shimmer, and your IDS radar draws only a
dotted guess-outline around it. Only after incident analysis resolves does its true sprite get filled
in and added to your bestiary, and *then* your defenses can see it. **Making "unknown" an actual
visual state** is one of the strongest ideas in the design.
**Interacts with:** §2.26 The Zero-Day Sky (the global lighting change that makes a disclosure night
feel different without a single board change).

**Variations and additions**

- **Opencode's treatment — Universal Library Exploit ("Log4shell"-class)** — A periodic event hits
  everything using one ubiquitous component; you can't counter it if you didn't inventory. Teaches
  asset inventory as a *buildable*. The raid boss that ignores your build. (sysadmin)
- The "once-in-a-generation" scale: EVERY asset you own (mail server, monitoring, the coffee
  machine's firmware — yes, really) gets audited in a panic; timed minigame: find the vulnerable jar
  before the exploit wave matures from scanning to firing. (wave3_sysadmin_fresh)

**Variations and additions**

- **Opencode's treatment — Zero-Day Meteor** — Arrives unblockable: deals scripted damage until the
  vendor patch wave (a timed event) or your emergency-patch research; announced by a CVE ticker
  seconds before impact and hits a *specific tech* you own ("CVE in your load-balancer firmware").
  If you patched recently, it fizzles. The permanent answer isn't a tower — it's **segmentation +
  least privilege** so next time the blast radius shrinks. Visual: a crawling, nearly colorless
  crack moving across the floor; the matching patch tech instantly heals all open cracks in a
  satisfying wave. Randomized targets keep players patching. Best "every build is a bill" teacher.
  (general, sysadmin, gamedesigner, visual)
- "The meta-unit": immune to the player's THREE most-used counters — chosen dynamically from *their*
  build; forces diversification, and a postmortem on surviving it unlocks the counter.
  (wave2_gamedesigner_fresh)
- A black envelope that arrives mid-wave: you don't know which tower class it targets until it
  fires; counters are patch cadence (a staff-driven global cooldown), defense-in-depth, and the
  meta-honest vendor-bounty research. (wave2_general_fresh)
- The Unnamed: a "?" icon that bypasses ALL current counters for a fixed window — the scariest thing
  in the game because it's a story beat (the CVE ticker warns you it's coming); honeypot intel can
  supply the counter early. Forces reserves and redundancy. (wave3_gamedesigner_fresh)
- "The Glitch": a shimmering tear / corrupted-pixel sprite that walks *through* the first defense
  tier as if it isn't there (walls render behind it); no counter until a Patch object lands — a
  scanner sweep reveals its silhouette first. (wave4_visual_fresh)
- "Zero-Day Ripple": a distortion circle (heat-shimmer of broken glass) appears on any asset,
  harmless for a beat, then detonates — blockable only as *mitigation*: redundancy shown as a second
  asset lighting up as the first dies. (wave3_visual_fresh)
- The "patch-or-perish" event: a critical CVE drops and you must scramble to patch everything
  fleet-wide before PoCs spread; recurring. (wave4_sysadmin_fresh)
- Its inverse: **Patch Tuesday** — a periodic chore window when the fix wave lands and everyone's
  patch-cadence is tested. (wave4_general_fresh)
- Give patch recency a function: if the affected tech was patched within the last W waves, the
  meteor fizzles with probability f(recency); emergency-patch = a paid instant-cast with a downtime
  window (customers bounce during it — the patch-robot tension, reused). And the meteor *always*
  targets something you have ≥3 of — it hunts the fleet, rewarding spread AND punishing monoculture
  (the blueprint rack's dark side). (wave2_general_informed)
- Add the *unpatchable* class: some zero-days have no patch (the vendor won't or can't fix your
  abandoned box) — mitigation-only: virtual-patch (WAF rules), isolate (service loss), *remove the
  feature* (revenue loss), or EOL-and-rebuild. And make the permanent answer measurable:
  segmentation + least privilege should visibly shrink the meteor's crater next run — show the
  before/after blast radius (pairs with the Pre-Mortem sim). (wave2_sysadmin_informed)
- Hosting flavor: once you host WordPress, "every Tuesday there is a plugin CVE" — a wave targeting
  one obscure path across all your tenants simultaneously; counters are the auto-update tower,
  virtual patches, quarantine. (wave3_sysadmin_fresh)
- The boss form: a "once-per-campaign surprise" that plants a C2 beacon in one buildable — the
  scripted "oh no" moment that teaches players to love depth (never stack one counter class — always
  overlap). (wave4_gamedesigner_fresh)

### Zero-Day first strike: "patched-fizzles" vs "guaranteed first hit" — *CONFLICTING*

The dispute is whether patch hygiene can make a zero-day event *miss you entirely*, or whether the
first appearance of a zero-day always lands on something and the only thing you control is the blast
radius. It turns on what maintenance is *for*: if upkeep can zero out the damage, patching is a win
condition; if it cannot, patching only buys you a smaller crater and the game's scariest beat stays
scary forever. Both readings produce very different pacing for disclosure nights.

#### Position A — response speed is the differentiator, not immunity *(master)*

Master's entry (above) never lets the player pre-empt the drop. **Every player is hit; the
differentiator is *response speed*, which is a function of how much monitoring and automation you
built.** The fleet is flagged vulnerable and the player triages patch order, and *patching is itself
risky* — a small chance a patch breaks a customer's site, worst in managed hosting. The
**Opportunist Sprayer** carries the complementary rule: harmless until you have an unpatched thing,
then instantly lethal — so patch-lag is scored, but a clean stack is spared only from the *sprayer*,
never from the drop itself. §2.26's Zero-Day Sky treats the disclosure as a global weather event that
lands on everyone simultaneously.

#### Position B — recency of patching can fizzle it entirely *(opencode, Variant A)*

Upkeep is directly rewarded: the meteor hits a specific tech you own, but *if you patched recently, it
fizzles*. (wave1_general_fresh)

Spec'd form: if the affected tech was patched within the last W waves, the meteor fizzles with
probability f(recency); emergency-patch is a paid instant-cast with a downtime window (customers
bounce during it — the patch-robot tension, reused). And the meteor *always* targets something you
have ≥3 of — it hunts the fleet, rewarding spread AND punishing monoculture (the blueprint rack's dark
side). (wave2_general_informed)

#### Position C — the first strike always lands *(opencode, Variant B)*

You cannot pre-counter, only bound the blast radius: "unstoppable-but-once: it always hits something
the first time it appears"; an unblockable elite unit, damage scripted until the vendor-patch wave or
emergency-patch research; attackers get a free window; on first appearance it ignores ALL counters and
is *guaranteed* to reach one buildable. (wave1_gamedesigner_fresh, wave1_sysadmin_fresh,
wave2_general_fresh, wave3_general_fresh, wave3_gamedesigner_fresh, wave4_general_fresh,
wave4_gamedesigner_fresh)

The boss form of this reading: a "once-per-campaign surprise" that plants a C2 beacon in one
buildable — the scripted "oh no" moment that teaches players to love depth (never stack one counter
class — always overlap). (wave4_gamedesigner_fresh)

#### Position D — graduated fairness (the mediating proposal) *(opencode, Variant C)*

Random unblockable damage on "a specific tech you own" with only seconds of ticker warning reads as
punishment for building. Give a full-wave patch window and a cheap "patch hygiene" global stat that
scales the damage *down* (so maintenance pays off visibly), and never one-shot an entirely-patched
stack. Keep the fear; restore the fairness. (wave2_gamedesigner_informed)

Adjacent and compatible with any position: the **unpatchable class** — some zero-days have no patch
(the vendor won't or can't fix your abandoned box), leaving mitigation only: virtual-patch (WAF
rules), isolate (service loss), *remove the feature* (revenue loss), or EOL-and-rebuild. And make the
permanent answer measurable: segmentation + least privilege should visibly shrink the meteor's crater
next run — show the before/after blast radius. (wave2_sysadmin_informed)

### The Opportunist Sprayer (CVE spray)
Sprays known exploits at everything, indiscriminately.

**How it works:** Harmless until you have an unpatched thing; then instantly lethal. **Punishes patch
debt and ignores everything else** — the cleanest possible incentive to keep a patch-lag stat low.

### Magecart Skimmer
Injected JS steals card details from a customer's checkout.

**How it works:** You find out from the *card brands*, not your monitoring. Massive reputation and
legal damage.
**Counter:** subresource integrity, CSP, file-integrity monitoring, and a customer who lets you update
their software.

### Vulnerable Plugin / The Bad CMS Update
The classic shared-hosting cause of death.

**How it works:** An outdated CMS plugin gets popped. Damage is **mass defacement across every account
on that box**, plus blocklisting of the whole IP. The homogeneity of a shared fleet is the multiplier.
**Counter:** a managed patching service (which occasionally breaks a customer's site — you own the
outage either way), WAF virtual patching, per-account isolation.
**Hosting types:** shared web, managed WordPress, reseller.

### Cryptominer Squatter / Infestation *(Sapper role)*
Post-compromise payload. Doesn't break anything; just steals 30% of your CPU forever.

**How it works:** The symptom is **load average 40 with no traffic** — the visual contradiction *is*
the diagnosis. Raises your power bill (literally, at facility tiers), slows every visitor, and is
often the first visible sign of a much older breach. **A stealth economic threat**, which the genre
almost never does.
**Make it a convergence, not a lookup — three partial signals across three overlays, any two
sufficient:** (1) load average high with flat traffic (the stated contradiction), (2) the **thermal**
outlier — its host is hotter than its neighbours in the heat overlay, (3) an **egress pattern to a
consistent destination**, visible only in the flows overlay. This is the right template for *every*
Stealth-role threat. And the detectability should scale with instrumentation: thermal (a warm
anomaly), power (a draw anomaly), capacity (a utilization anomaly with no traffic) — **a threat whose
detectability scales with your monitoring spend is the perfect teaching object.**
**Modern variants (the CPU-mining version is largely unprofitable now, so ship all three):**
**GPU mining on rented AI capacity**; **free-tier CI mining**; and **proxyware** — software that
silently sells your bandwidth and IP reputation as a residential proxy. Proxyware is the best of the
three as a game threat because it has **no CPU signature at all**: the symptom is your IP range's
reputation degrading and abuse complaints arriving for traffic you didn't send. Keep the
thermal-odd-one-out puzzle for the CPU version; add a **reputation-odd-one-out** puzzle for proxyware.
**Counter:** process auditing, egress filtering to mining pools, CPU anomaly alerts, per-account
resource caps, utilization baselining, outbound IP reputation monitoring.
**Visual:** a little magenta gremlin that sits *on top of* a CPU pedalling a tiny generator,
permanently stealing a visible slice of the utilization donut. Or **The Tick** — a small parasite that
attaches to a CPU and swells, hidden behind the chassis, so you spot it by the **heat plume and the
fan blur rate** rather than by the sprite. Visual detection of an invisible threat via a secondary
signal is the whole idea.

**Variations and additions**

- **Opencode's treatment — The Cryptojackler (parasite)** — A vine that plants on an overworked
  GPU/CPU node and siphons compute into the attacker's wallet while your node slows invisibly and
  the power bill swells. No damage, no noise — the tell is the *power/thermal meter*, not the map:
  machines slowly glow amber with a little pickaxe; burn-rate smoke turns black while nothing is
  visibly wrong. Found by monitoring/process-auditor drones, not perimeter towers. Detection
  mechanic teaches reading dashboards over reading sprites. (general, sysadmin, gamedesigner,
  visual)
- The Lying Gauge (anti-cryptojack twist): without monitoring, a parasitized machine's thermal/power
  gauge renders a *smoothed ghost curve* — dashed, politely normal; when a monitoring tower reveals
  truth, the dashed line peels away to expose the real jagged red climb. "Detection = seeing your
  own dashboard honestly," made literal. (wave2_visual_informed)
- "Tenants gone feral": instead of marching they *settle onto your GPU nodes* and siphon compute —
  an income tax per second, exposed by the thermal meter, not by lane traffic; counters: workload
  attestation, egress shaping. (wave2_gamedesigner_fresh)
- Turned-tower form: the infected server starts mining AND spawning miner-bots toward neighbors — it
  must be "cured" (wipe/reimage action, downtime cost) or reclaimed by your cleanup crew
  (restore-from-backup). (wave2_general_fresh)
- Malware *customers*: units that pretend to be legit jobs, sip GPU/CPU, mine on the side — detected
  by traffic-pattern (stratum) or temp spikes... and kicking them angers their real customer.
  (wave2_sysadmin_fresh)
- Tick visual: a glowing organism latches onto GPU slabs and swells as it siphons a light beam; it
  pops off when the abuse-detection turret scans it. (wave2_visual_fresh)
- Mining Barnacles: crustacean growths on GPU monoliths siphon the cyan coolant glow toward red;
  they *reproduce when utilization is unmonitored*; removal = a scrape animation + utilization
  spike. "Capability = surface" as body horror. (wave3_visual_fresh)
- Mining Crew (infiltrators as economy): a "sick" state that *spreads to adjacent nodes via shared
  fabric*; they don't kill towers — they eat your money silently; detection is the gameplay: the
  utilization graph IS the health bar. (wave4_gamedesigner_fresh)
- The mole variant: a customer who is actually mining — looks like normal compute load, steals ~30%
  of GPU/CPU, heats the board (raising failure rates); evicting mid-contract costs reputation.
  (wave3_general_fresh)
- Stealth-unit detection pairing: power-draw vs throughput anomaly meter + workload attestation.
  (wave4_general_fresh)

### Outbound Spam Cannon / Spam Relay
A compromised customer mailbox or hacked contact form starts blasting.

**How it works:** Damage is *delayed and collective*: your IP reputation degrades, then your whole
range gets listed, then every customer's mail bounces. A superb slow-burn threat that punishes
ignoring small alerts, and a multi-hop consequence chain that rewards understanding.
**Counter:** outbound rate limits per account, outbound mail monitoring, an abuse team, egress
filtering, feedback loops, **and sending segmentation** (separate IPs/domains for transactional vs
bulk vs per-customer) so one bad tenant damages one pool instead of everything.
**Visual:** a stream of envelope particles leaving your mail server and going *out* to the cloud,
gradually turning the cloud's edge red as reputation degrades. **You watch your own reputation being
spent.**

**Variations and additions**

- **Opencode's treatment — Mail Open Relay** — One misconfig and *your* network spams the world →
  blocklist → the reputation meter bleeds hourly. The self-inflicted cousin of the RBL tide.
  (wave3_sysadmin_fresh)

### Backup Poisoner
Quietly corrupts backups.

**How it works:** Invisible until you need them. The only counter is **restore testing**, which costs
time and produces no visible benefit — until it does. A mechanic that rewards paranoid, boring virtue.
**Interacts with:** Ransomware below — in the modern shape these are the *same creature* at two
different phases, not two threats.

### Ransomware on the File Server / Ransomware Bloom / The Padlock Bloom
Encrypts customer data AND, crucially, reaches the backup share if the backup share was mounted.

**How it works:** The entire point: **a mounted backup is not a backup.** Immutable/offline/pull-based
backups are the only counter, and they cost more. Spreads node-to-node along links like fire. Damage
is capped entirely by whether you have *verified* backups — the counter is a thing you spent money on
for many shifts with zero visible benefit, which is the perfect justification for boring investments.

**Two authenticity upgrades that change the gameplay substantially:**
1. **The dwell time.** Real ransomware sits for days to weeks first — mapping, escalating,
   exfiltrating, and **deleting or corrupting backups before encrypting anything.** The encryption is
   the *last* step, not the first. So the mechanic should be: a **Stealth-role unit is present for
   several minutes of gameplay, and the "bloom" is its exit animation.** This makes detection during
   dwell the entire game, and it makes Backup Poisoner the same creature's earlier phase rather than a
   separate threat.
2. **The double extortion.** They took a copy before encrypting. Restoring perfectly from immutable
   backups solves your availability problem and does nothing about the disclosure problem. **A restore
   that works and you still lose** is the most modern and most instructive version of this threat, and
   it is what finally gives egress filtering and exfil detection a real payoff.

**Counter:** offline/immutable/WORM/pull-based backups, an air gap, **separate backup credentials** (a
backup system that authenticates with domain admin is not a backup system), segmentation, least
privilege, a management network the production estate cannot reach, and a tested restore.
**Visual:** the scariest visual in the game — a magenta crystalline growth that starts at one file
store and **grows across your storage tiles like frost on a window**, converting each to a locked
padlock glyph with a countdown. Watching the bloom crawl toward the tile that holds your backups is
the best tension in the game; immutable backups are drawn as tiles behind a physical shutter the bloom
can't cross. Restoring plays as a wave of cyan washing the frost away *from the backup node outward*,
so the **direction of the heal shows you exactly how much of your topology the backup actually
covers.** **Protect that idea in spec:** the heal wave must be **slow enough to watch** (2s per hop
minimum, independent of sim speed) and it must **stop visibly at the edge of coverage**, leaving frost
on everything the backup didn't reach. The stopping point is the lesson.

**Variations and additions**

- **Opencode's treatment — Ransomware Fog / Padlock-Crawler (the infecting boss)** — Rolls in
  silently via an unpatched unit or phished staff, then *infects buildables*, converting them to
  attacker towers that encrypt neighbors on a timer; it *pays you a ransom demand every tick it
  survives*. Options: pay (cash, seeds a hostile economy), isolate (lose machines), restore from
  backup (free — only if your backups are immutable/air-gapped/TESTED; one enemy type beelines for
  your backup server). Multi-phase boss with lateral movement. Visual: green skull fog / a slow
  spider with a padlock abdomen; anything web-siled turns red with a ticking countdown; completed
  buildings are shrink-wrapped in lock-film and *stop animating entirely* — the stillness is the
  horror; screen tiles over with padlock patterns creeping from the edges, sound ducks to a
  heartbeat, and recovery replays it in reverse, locks unlatching. The franchise villain; signature
  threat of Backup/DR levels. (general, sysadmin, gamedesigner, visual)
- Hostile UI takeover: when ransomware lands, the game's OWN interface is infected — bezel recolors
  to the attacker's palette, two HUD panels physically swap places, tooltips lie once (caught by
  observant players), and the ransom demand renders as a system dialog; paying drops a fake receipt,
  recovery plays as the UI healing back. The screen itself is the patient: maximum horror for zero
  new sprites. (wave2_visual_informed)
- "The vault robber": it doesn't destroy, it *encapsulates* your servers in an encryption shell and
  demands payment — and payment is a trap (they re-encrypt: a bad-ending branch). Immutable backups
  are the real counter. (wave2_gamedesigner_fresh)
- "The Lock": servers visibly padlock over one per tick, forming a *wall of padlocks across your
  map*; pay = cash + reputation + it comes back next level; restore = requires actually-tested
  backups (untested ones have a fail percentage). The level-defining panic threat.
  (wave2_general_fresh)
- Not a wave — an *infection*: sneaks in via phish or exposed RDP, encrypts laterally at some speed,
  leaves a ransom-note UI. Counters: segmentation, immutable-backup tower, EDR staff. The dread
  mechanic. (wave2_sysadmin_fresh)
- "The Padlock Bloom": files crystallize into padlock icons spreading across the chassis like frost;
  backup nodes *shatter the frost* (restore). (wave2_visual_fresh)
- Lateral movement rides your wiring: every connection you built is a highway for it;
  snapshots/air-gapped backups are the reset button, and paying is an actual (bad) option that funds
  future attacks. (wave3_general_fresh)
- Boss "CIPHER": a slow boss that ENCRYPTS your revenue objects into hostage objects with a
  countdown, rack by rack — (a) isolate + rebuild (cost: uptime), (b) pay (cost: money + Heat +
  funds the sequel), (c) restore from backup (cost: the RPO window — the good ending). The
  backup-automation tree is literally the counter-tech storyline. (wave3_gamedesigner_fresh)
- "Wither": infection grows crystalline violet frost over connections; frosted machines lock and
  tick a countdown ring; a cure-antidote unit is researchable mid-level, and on completion the
  screen *paper-shreds* the enciphered region. Never reuse the frost shader for anything else.
  (wave3_visual_fresh)
- "The spreading padlock": a chrome padlock decal creeps rack-to-rack like frost on glass, locking
  drives mid-spin; counter = isolation (visibly sever a cable to quarantine) and air-gapped backups
  (a vault door sliding shut). (wave4_visual_fresh)
- Double extortion: it encrypts AND steals — the ransom note covers both. (wave4_sysadmin_fresh)
- The dark-humor loop: pay, and *the attackers return with the key you bought* — a recurring threat
  you financed. (wave4_gamedesigner_fresh)
- Paying also reads as weakness: expect the *second* attack because you look soft.
  (wave4_general_fresh)
- Business inversion — the ransomware "season": an industry-wide demand shock sends your backup/DR
  services flying off the shelves (funnel flood!), while a hit ON you runs the same scenario; fear
  sells backup, and the game should let the player feel slightly awful about capitalizing on it.
  (wave3_ceo_fresh)
- Franchise irony made explicit: **you, the backup company, get encrypted** — the DR type's
  signature level is your own lack of an offline copy; the business cost is SLA credits + trust
  collapse. (wave1_ceo_fresh)
- Negotiation minigame: stall (buy time for restore), bluff (fake payment trace), trace (unlock the
  decryptor cheaper) — each with risk curves; payment still feeds the Paying-Host Ledger global
  stat. Turns a binary choice into play. (wave3_general_informed)
- Anti-snowball guardrails: cap simultaneous conversions (queue the rest), guarantee a "clean core"
  (an air-gapped zone immune to conversion = your restoration foothold), and let a paid
  "containment" freeze the spread for one wave. Bosses should pressure, not lock you out —
  convert-infects-with-timers can otherwise spiral unwinnable once two nodes convert during a storm.
  (wave2_gamedesigner_informed)
- Concrete ransom math: demand = k × (encrypted-MRR × hours-of-business), with a decay the player
  can *see* negotiation move. Three endings: pay (money gone + the attacker *returns with a friend*
  — paying seeds the future raid list), restore (free only if immutable+tested backups exist — the
  doc's condition, now the headline outcome), defy (eat the downtime, earn the permanent "Hard
  Target" deterrent buff that slows future ransomware waves — insurance companies literally advise
  this; make it a real trade). The negotiation minigame slots straight onto this spine.
  (wave2_general_informed)

### The Hypervisor Ransomware
Ransomware that targets the *virtualization layer* rather than the guest.

**How it works:** Encrypts datastores directly, taking 200 VMs simultaneously with no per-guest
defense possible — the guests' own antivirus, patching and backups are irrelevant because the attack
is underneath them. The entry vector is a management interface exposed to the internet or a
compromised admin credential. **The specific horror: every one of your customers is down at once, and
their own precautions did not matter.**
**Counter:** management-plane isolation and MFA, purchased long before.
**Hosting types:** VPS, cloud, managed virtualization, any multi-tenant hypervisor estate.

### Ransomware (customer-side)
Not an attack on you, but you're the one who gets called.

**How it works:** Your customer is encrypted. Your backups are the counter, and *only if tested*. You
are either the hero of the level or a corpse, and either way it consumes your entire hands budget.
**Hosting types:** backup/DR and managed hosting make this the signature event.

### Hypervisor Escape / Container Breakout / Multi-Tenancy Escape
One tenant reaches another tenant's data.

**How it works:** Extremely rare, extremely fatal, reputation-ending. The signature platform-hosting
catastrophe.
**Counter:** patch cadence, dedicated hosts for high-value tenants, gVisor/Firecracker-style
isolation, NUMA/CPU pinning, and **disabling risky features** — nested virt, and SMT/hyperthreading at
a *real* 20% capacity cost to close a side channel. Silicon-level mitigations cost ~8% performance.
**A dial where the units are literally percentage of your inventory**, which is the cleanest possible
security-vs-capacity tradeoff in the game.

### The Full Table Scan / The Noisy Query
A customer adds a query that's fine at 10k rows and fatal at 10M.

**How it works:** **The threat grows with your success.** At multi-tenant scale (DBaaS, shared
hosting), one tenant's missing index degrades everyone.
**Counter:** a DBA hire, query monitoring, per-tenant throttling and isolation.

### Worm / Conficker (self-building threat)
An infection that *constructs attacker towers along your lanes* (scan spreaders), converting your
map into enemy TD territory — the game mirrored against you; clearing it means taking the towers one
by one while customers keep bouncing. Era-flavored. (gamedesigner)

**Variations and additions**

- "The Contagion" form: it doesn't enter from outside — it spawns from ONE infected tenant (often a
  customer who uploaded it) and spreads via adjacency on your network graph; each infected box
  degrades and feeds it. The quarantine mechanic cuts a link to stop spread — *sacrificing that
  subtree's revenue*. MicroVM isolation field, patch radius, endpoint agents.
  (wave3_gamedesigner_fresh)

### Rootkit / Bootkit Implant
Survives reboots; invisible to basic monitoring until a "beacon" meter spikes.

**How it works:** Counters: integrity-checking tower (AIDE class), known-good boot chain. VPS,
dedicated, GPU. (wave3_sysadmin_fresh)

### DNS-Tunnel Tactician (exfil hiding in your plumbing)
The stolen data leaves in tiny, legitimate-looking A-records to an attacker's zone — through the
same resolver you *depend on*.

**How it works:** A slow reverse-thread from the victim DB toward the edge, visible only on the DNS
layer view (you must *already be looking at the right overlay*); detection tower = query-length and
entropy telemetry. Blocking it naively breaks *everyone's* browsing — the dual-flow tax again (a
strict resolver = bounce wave). The Email/DNS act's signature; the APT's exit door.
(wave2_general_informed)

---

## 2.6 Credential, access, and human threats

### Brute Force Drip
Endless slow login attempts. (See also §2.2.)

**How it works:** Low damage, constant noise, and the real cost is log volume and CPU.

**Variations and additions**

- **Opencode's treatment — Brute-Force Tank (the siege)** — Slow, patient key-guesser visibly
  ticking down a lock's health forever. Trivially stopped by rate-limiting (each hit extends its
  cooldown) — teaches *counter knowledge*, not reaction; dying to one unguarded auth unit is
  memorable in the good way. Visual tell: tiny keys. (gamedesigner)
- The rate limit that locks out humans: account-lockout after N fails is itself a *DoS on the
  customer* — real attackers deliberately lock a victim's account, then phish the "unlocked?" email.
  Add Lockout-DoS variants that weaponize your own defense, and link the family: stuffing = library
  of users/passwords, brute = depth on one, lockout-spray = the trap between them; the best counter
  (per-IP velocity limits + breach-list challenges) is already in the Credential Stuffing entry.
  (wave2_sysadmin_informed)
- SSH Brute-Force Keyring: a hunched figure rattling a giant ring of keys at every exposed port 22;
  the fail2ban tower freezes it in place after N tries, and key-auth tech makes it simply irrelevant
  — an early "win the war by not fighting" moment. (wave2_general_fresh)
- "The Grinders": endless faceless ranks hitting every login door in sequence — each door's HP is
  its password strength; weak creds die in seconds. (wave3_gamedesigner_fresh)
- The Brute-Force Ram: a battering-ram silhouette *thunking* your auth gate on a rhythm; each hit
  lights a key glyph (the password cracks letter-by-letter, visible as a growing solved string);
  rate limits slow the swing, lockout drops a portcullis — the clearest "time vs. chance"
  visualization. (wave3_visual_fresh)
- Brute-force SSH/RDP as a slow creep to weak creds — its usual payload is a cryptominer install.
  (wave4_sysadmin_fresh)

### Credential Stuffing Tide / Keyring Hail
Not brute force — *correct* passwords from someone else's breach.

**How it works:** Rate limiting doesn't help, because the success rate is high and the volume is low.
Looks like a crowd of visitors logging in, and each attempt is **individually indistinguishable from a
real login**. Some succeed because your customers reuse passwords and you cannot fix that — **the
threat lands on your customer, not you, but the cleanup is yours.** Cannot be "killed," only made
unprofitable, which teaches the concept of defenses that *change the economics* rather than
destroying.
**Counter:** MFA (reduces conversion slightly, churns some customers, and **adoption is a
customer-behaviour stat you can influence but not mandate**), breached-password checks,
impossible-travel detection, per-account rate limits, device fingerprinting, behavioural analysis.
**Visual:** a long, orderly, *boring* line of identical grey figures, each trying one key at a door,
with a comedic bureaucratic cadence (step, try, shake head, step aside). It's the only threat that
forms a **neat line**, which makes it instantly distinguishable from flood chaos. Rate limit drops a
turnstile; MFA grows a second lock and the line visibly gets bored and leaves. The volumetric
rendering of the same idea: **thousands of tiny key sprites rain onto your login door; most shatter;
the ones that fit turn the door handle green for a beat** — a pin-drop moment. Rate limiting is an
awning over the door that most keys bounce off.

**Variations and additions**

- **Opencode's treatment — Credential Stuffing** — Not brute — a *library*: replayed leaked
  passwords at scale; failed-login alarms can't distinguish curious from malicious. Counters: MFA
  rollout, velocity rules, a breach-list-matching tower that challenges known-breached passwords.
  Anything with a login. (sysadmin)
- "The wrong-key wave": a massive customer-looking flow trying the front door with stolen keys — low
  damage each, but they *do* pass if you reused any password towers. (wave2_gamedesigner_fresh)
- False-positive tension: customers bounce when their legit login is denied — block too hard and you
  pay in churn. (wave3_sysadmin_fresh)
- The credential-stuffing variant reuses "valid tickets" from a past breach event — the breach
  ledger comes back to haunt you. (wave3_gamedesigner_fresh)
- Account-takeover twin: breached customer accounts become spam engines abusing your resources.
  (wave4_sysadmin_fresh)

### Phishing Campaign / Phishing Kite
Targets your **staff**, not your servers.

**How it works:** If it lands, a staff member becomes compromised and starts silently sabotaging.
**Counter:** training — a recurring cost with no visible benefit until it saves you (the classic
insurance mechanic), and a **support-staff training stat that decays over time and after turnover.**
**Visual:** a drifting paper-plane sprite that floats toward a staff member's desk. If it lands, that
staffer gets a magenta halo. Trained staff wear little graduation-cap pips and bat the plane away.

**Variations and additions**

- **Opencode's treatment — Phishing Barrage (targets YOU, not the box)** — Emails appear *in your
  HUD* — a mail-tray UI element; click one (deliberately or by misclick) and an admin-credential
  breach spawns mid-level. Visual: a friendly-looking mail-drop plants itself near your staff
  avatars; a sysadmin who walks into it gets "charmed" (heart-eyes), then turns and opens ports for
  the attack wave. Defense: awareness-training tower shrinks the trap pool. Breaks the fourth wall
  on purpose — the game mimics the actual attack vector. (gamedesigner, visual)
- Aimed at your *staff towers*: a phished admin flips side for N seconds; counters are
  security-awareness upgrades and separation of duties. (wave2_gamedesigner_fresh)
- It attacks your *human meters*: one staff tower gets a fake-email aura and turns "compromised,"
  opening ports from inside; in solo mode with no visible staff it targets YOU — a fake modal that
  does damage if clicked. (wave2_general_fresh)
- Clicking is auto-rolled off the staff member's *awareness stat* — awareness is trainable via hire
  quality or a security-awareness perk; a clicked staffer becomes an authorized insider for N
  seconds. (wave3_gamedesigner_fresh)
- As event, not unit: your sysadmin NPC gets a fake-invoice email and opens the gate from inside;
  regulated levels pair this with insider-threat audits. (wave3_general_fresh)
- Consequence form: the phished staff unit becomes a *controlled unit* — it walks to a server and
  "deploys" a payload; counters are the awareness unlock + MFA. (wave4_general_fresh)
- The Vishing SIM-Cartel (its voice cousin): attackers don't call your servers, they call your
  *people* — a deepfake of your CEO phones the support desk ("my MFA is broken, reset it NOW"), or a
  SIM-swap steals a staffer's 2FA mid-level. A threat that *bypasses the map entirely and enters
  through the ticket queue*: the call arrives as a speech-bubble puzzle with tell-clues (wrong
  cadence, background hum, policy mismatch); an untrained staffer answers and the attacker walks in
  as an insider-class unit. Counters: callback-policy tower (slows legit resets — dual-flow tax),
  hardware keys, call-back verification quests. Brutal on regulated. (wave2_general_informed)
  - Its change-order cousin, the Deepfake Dispatcher: a synthetic voice/fax/email *of a known
    enterprise client* orders your NOC to "make that firewall change" — targeting staff towers
    directly; a charmed sysadmin obeys and opens the port. Staff trained in callback-verification (a
    purchased procedure, not a reflex) refuse — but verification costs minutes: latency vs safety
    again, in human units. Brutal in HFT. (wave3_general_informed)
- MFA Fatigue (push-bombing): an attacker with a stolen password spams "approve login?" to a staff
  member's phone until, at 3:04am, they tap YES — the breach arrives *legitimized*, the approve
  comes from the victim's own finger, so no anomaly detector fires. Counters: number-matching gates,
  quiet hours, FIDO hardware keys (a staff upgrade tier). The current top real-world breach method.
  All login-bearing types. (wave2_sysadmin_informed)
- SIM-Swap: a social-engineered carrier clerk ports your ops lead's number at 14:00 and every
  SMS-2FA from then on arrives at the attacker — a *silent* perimeter collapse from outside the map.
  Event form: a little carrier-paperwork popup; without port-freeze or app/hardware 2FA, the next
  wave walks in wearing the staff badge. Regulated/offshore; pairs with MFA Fatigue as the
  2FA-collapse duo. (wave2_sysadmin_informed)

### The Insider / Insider Badge / The Flickering Badge
A staff unit you hired turns.

**How it works:** Has legitimate credentials, so most towers ignore them. Countered only by *process*
tech — two-person rule, audit logging, least privilege, session recording, dual control for
destructive ops, offboarding automation — all of which cost efficiency. A perfect
Capability-vs-Surface case study applied to *staff*.

**⚔️ Tension — the tell must not be a pixel, and the trigger must not be one meter.**
*(a) Detection.* Wave-1's "visually identical to a legit employee except for one pixel-level cue" is
not a fair tell, and "players will screenshot and argue about it" describes frustration, not fun.
**The insider is not detectable by looking at the sprite. They are detectable by behaviour over
time** in the audit-log overlay: access outside their normal pattern, at unusual hours, to systems
outside their role, in a volume that doesn't match their job. The counter is therefore **buying the
log and reviewing it**, not staring. Keep the desaturated/inverted-badge art as a **post-reveal
confirmation**, not as the tell.
*(b) Trigger.* "Triggered by low morale" collapses the whole idea into one slider and makes the
counter "keep morale high." Add a second, independent trigger — **a single disgruntled individual who
can exist on a healthy team** — so the answer is process rather than a meter. Morale still matters:
an underpaid, overworked, on-call-every-week engineer is both a higher insider risk *and* a higher
mistake risk.

**The redesign — a fair three-clue deduction puzzle.** The insider leaves **three** signals across
three different systems, and any **two** identify them: (1) an access-log entry outside their normal
hours, (2) a data-volume anomaly on one link, (3) a behavioural tell (they decline the vacation the
game offers). None alone is conclusive; each is individually plausible. The player can **accuse** at
any time — a correct accusation ends it cheaply; a wrong accusation costs morale across the whole
team and the real insider accelerates. Or they can **contain without accusing** (two-person rule,
rotate keys, segment) — slower, no drama, no morale hit, **and the campaign never tells you who it
was.** That second option is the right lesson: don't play the game, engineer around it.
**Visual:** a staff NPC you already own whose badge indicator starts flickering between your green
and threat magenta. A gut-punch reveal where the art does all the narrative work. Counter: an
audit-log overlay that draws footprints behind every staffer.

**Variations and additions**

- **Opencode's treatment — The Malicious Insider ("The Disgruntled Sysadmin")** — A tower you BUILT
  that periodically faces the wrong way: leaks configs, drops firewall rules for a moment, sells
  badges — or one of your hired humans starts *leaving doors open*, an anti-tower that spawns
  vulnerabilities. They ignore your network defenses entirely. Removal costs severance (money) +
  knowledge loss (temporary stats nerf). Counters: least-privilege staff configs, change windows,
  dual control, audit logging, offboarding checklists, rotation. Emotional punch: your 40-hour
  veteran sysadmin sprite walking toward the exit with a badge on a lanyard. Rare, dramatic,
  endgame-spicy. (general, sysadmin, gamedesigner)
- The Dead Man's Switch (the delayed insider): the admin who left six months ago wrote one more cron
  entry — at 03:17 on an unsuspicious date it deletes the offsite backup keys, announces a blackhole
  route, or posts your SMTP relay config to a paste site. Planted at hire-and-termination events,
  invisible to running-state sensors because it IS your legitimate automation — triggered by
  calendar, not traffic. Counters: secret rotation *at offboarding*, ownership audits (every cron
  must name a living owner — "orphan check" as a weekly ritual); after one hit, every ex-employee
  spawns a key-rotation mini-task. All types with staff. (wave3_sysadmin_informed)
- Spawn-from-within form: a disgruntled admin unit appears *inside your perimeter at the last wave —
  no path leads to it*; counters are least-privilege zoning and audit logging that reveals its route
  early. (wave2_gamedesigner_fresh)
- Born from the staff economy: an insider spawns from a hired staff buildable whose *Loyalty meter
  you neglected* (salary too low, overworked) — then walks to secrets and leaks. Least-privilege
  geometry: what an insider can physically reach on your board is what they can steal. Brilliant
  connective tissue between staff economy and tower placement. (wave4_gamedesigner_fresh)
- The HR detonation: an unresolved HR issue (staff burnout meter!) detonates — deleted backups, a
  leaked customer list, or a competitor poaching the *whole NOC team* (your staff towers walk off in
  one wave). Counters: key rotation buildables, retention pay, cross-training so no single point of
  staff-failure. (wave3_ceo_fresh)
- The Disgruntled Ex-Employee: someone you fired (or a layoff you chose) returns with their old
  badge for one dramatic sabotage attempt — interacts with your HR/staffing systems.
  (wave4_general_fresh)
- Softer reading: "the bored admin" — a disgruntled staff member, *or a customer with legit access
  misusing it*; hard to block, needs least-privilege + audit. (wave4_sysadmin_fresh)

### The Disgruntled Admin
A staff member whose Morale hit zero.

**How it works:** Sabotage, or they quit and take institutional knowledge — **a permanent loss of a
discovered tech until re-learned.** Distinct from the Insider in that the damage is often loud and
immediate rather than quiet.

### The Ex-Employee / Forgotten Key
A former admin's SSH key is still in `authorized_keys` on 40 boxes.

**How it works:** **A threat the player creates through a business decision** — it spawns only if
you've fired or lost staff and skipped the offboarding step. Fires once, at a specific service, using
credentials you forgot to revoke. Materializes only if you never did an access review.
**Counter:** an offboarding checklist (which retroactively prevents it), periodic access reviews.
**Visual:** their sprite is drawn from your *own* staff art set, desaturated. They know your layout,
so their pathing ignores your maze and goes straight to the weak point — visually, they walk the
shortest line while everyone else follows the path. Chilling.

### Social Engineering Call / Vishing the Support Desk
"Hi, this is Dave from the datacenter, I need the root password to fix your server."

**How it works:** An attacker calls *your support team* and gets a password reset. **Bypasses all
technology.** Presented as a dialog with tells the player can learn to read. Variants: a fake DMCA, a
fake domain-transfer authorization, a fake law-enforcement request. It attacks your *support* lane,
not your network.
**Counter:** a callback verification policy (which adds friction to real customers and raises ticket
handling time), a PIN on the account, registrar lock, a "we will never ask you to…" training line, and
the support-staff training stat.
**Interacts with:** §2.16 Deepfaked Authority (the upgraded version where the perceptual tells are
deliberately unreliable).

### The Friendly Face (badge tailgating, presentation)
A visitor sprite in a *staff-coloured* uniform that walks past your badge reader behind a real
employee.

**How it works:** Same silhouette as your own people; the only tell is that the badge chip is the
wrong shade. Trains the player's eye to check details, and reuses your own art as a threat.
**Interacts with:** §2.26 The Camera Cone Gap — physical intruders **path through the dark polygons**
where camera coverage is missing, which makes their route predictable, discoverable, and fixable by
buying one more camera. A stealth threat with a readable path is a puzzle; without one it's a dice
roll.

### Registrar / DNS Hijack / Domain Takeover
Someone social-engineers your registrar. Your domains now point at them.

**How it works:** Nobody attacks your servers. Your servers are perfectly healthy and completely
unreachable. **The best "everything is green and nothing works" threat in the business.**
**Counter:** registrar lock, MFA at the registrar, a dedicated low-privilege domain-management
account, DNSSEC, out-of-band comms, and **monitoring your own NS records from outside.**

**Variations and additions**

- **Opencode's treatment — Domain / Registrar Identity Theft** — The attacker does NOT touch your
  infra — they take over a customer's email → reset the registrar password → steal the domain:
  traffic literally reroutes away while your DC is pristine. Sister event: **domain seizure /
  registrar lockout** — your names get pulled by dispute or government order and DNS + mail blink
  out. Counters: registrar-lock, warn-customers tower, multi-registrar diversification, escrow.
  Teaches that identity *is* a perimeter. (wave2_sysadmin_fresh, wave4_general_fresh)

### Exposed Management Interface
An IPMI/iDRAC/Redfish/admin panel accidentally reachable from the internet, often with default
credentials.

**How it works:** Gives an attacker *physical-equivalent* control — they can power off your machines
and mount virtual media. There is no software defense inside the guest that helps.
**Counter:** OOB network isolation, VPN-only management, credential rotation, and **port scanning
yourself** — an "attack surface scanner" buildable that reveals your own exposure before a scanner
does.

### Living Off The Control Panel
An attacker with valid credentials who never installs anything.

**How it works:** They log into the hosting control panel (or your customer's) and use only supported
features: change the MX record, add a mail forwarding rule, restore a three-month-old backup over the
current site, create an FTP account, repoint DNS, add a second admin. **No malware, no webshell, no
file-integrity alert, nothing for an IDS to see** — every action is one your product is designed to
permit. Detection requires *behavioural* analysis of admin actions, a different and more expensive
tower than everything the player has bought so far.
**Signature persistence — the mail forwarding rule.** You reset the password, you enable MFA, you
feel safe, and they still receive every message including the password-reset emails. **The counter is
an audit of account settings, not a credential rotation** — a genuinely instructive distinction and
one of the best small lessons available.

### The Leaked Key In The Public Repo
Your customer commits an API key, an SSH private key, or your control-panel token to a public
repository. Automated scanners find it in **under 90 seconds.**

**How it works:** The attack arrives from a completely legitimate direction with valid credentials and
the correct client fingerprint. **There is no network signature.**
**Counter:** all detection-side — secret scanning as a service, short-lived credentials, and
**egress/spend anomaly alerting, because the first symptom is usually a bill.**
**Interacts with:** §2.21 Cost Attacks.

**Variations and additions**

- **Opencode's treatment — Account / API-Key Hijack** — The attacker phishes a customer's
  billing/login portal, spins up max capacity on the victim's card, drains credits, and destroys
  data — a hybrid attack where, when breached, *you eat the refunds*. Cloud twin: stolen tenant keys
  spin up 500 large instances *on your dime*. Counters: 2FA portals, fraud detection, quota towers,
  anomaly detection, MFA on the API. (wave2_ceo_fresh, wave3_sysadmin_fresh)
- Key-Leak Vultures (the mechanism behind the beat): a customer commits an API key to a public repo
  and bots scan GitHub in *seconds* — a vulture spawns at your edge minutes later, spending *your*
  money mining in their account. New signups carry a hidden sloppiness stat; secret-scanning gates
  reduce spawn odds; short-lived tokens (secrets-manager unlock) shrink the payout window when one
  lands anyway. Cloud/VPS/PaaS. (wave2_sysadmin_informed)

### The Canary That Nobody Watched
Not a threat — an anti-threat the player forgot they deployed.

**How it works:** A honeytoken credential is used, generating a high-confidence alert that has been
routed to an unmonitored inbox for eight months. **Reveals both a compromise and an alerting-path
failure in one beat.**
**Interacts with:** §2.9 The Alerting Path Dependency.

### Supply Chain Vendor
Your monitoring vendor gets breached, and their agent — which you installed on every box — is now the
attack path.

**How it works:** Punishes centralization; rewards diversity, which is more expensive.
**Interacts with:** §2.17 The Shared Fate You Bought (the Correlation Score).

### Control Panel Exploit
One vuln, root on *every* server that runs the panel simultaneously.

**How it works:** The homogeneity that made the fleet easy to manage is what makes it die all at once.
A great argument-for-diversity lesson.
**Hosting types:** shared web, managed WordPress, any monoculture fleet.

### Tailgating / The Unescorted Visitor / The Evil Maid
Physical intrusion in a building full of other people's data.

**How it works:** Someone follows a tenant through the badge door; or a badgeless sprite wanders your
floor. Two sprites entering on one badge swipe is a **one-frame animation you have to actually
notice**, or catch later in the access-log overlay.
**Counter:** mantraps, badge policy, cameras, escort policy — all of which add **friction on your own
staff** (the Shared Pipe principle applied to the building itself).
**Hosting types:** colo, regulated, GPU (where the hardware is worth stealing), any facility tier.

**Variations and additions**

- **Opencode's treatment — Physical Intruders** — Tailgaters following a legit badge-holder (funny:
  he carries a clipboard so nobody suspects), fake technicians, disgruntled ex-staff, cargo-door
  ambushes, raiders in bulletproof levels — they travel the *server-room layer only* and steal
  hardware (instant node loss + data breach). Counters: rack locks, mantrap gates, cage, biometrics,
  camera coverage cones, visitor escort. (general, sysadmin, gamedesigner, visual)
- The fake technician: someone with a counterfeit badge walks the colo aisle with a wrench and a
  laptop — great for breaking "screens only" gameplay. (wave2_sysadmin_fresh)
- Dumpster-divers hunting sticky-note passwords near the trash; fake couriers join the tailgater
  roster. (wave3_general_fresh)

### The Guy In A Hi-Vis Vest With A Clipboard / Sneakernet Intrusion
The oldest physical attack, as an actual unit that walks in.

**How it works:** A person in a hi-vis vest with a clipboard and a plausible ticket. Countered by
badging, mantraps, and an escort desk. Comedy that is also real, and it only exists once you own a
building.

### Privilege-Escalation Infiltrator
Starts at the door disguised as legit admin traffic; at each buildable it passes it gains a rank
(user→root) — the longer its unopposed path, the more dangerous, and a "rooted" infiltrator doesn't
attack, it *opens the gate* for a wave.

**How it works:** Counters: least-privilege towers, session-audit drones. (wave4_gamedesigner_fresh)

### The Watering Hole (delayed-fuse threat)
A quiet unit that doesn't attack — it *prepares*: a barely-visible progress bar at one of your
buildables that only monitoring reveals, growing across several waves before detonating a
coordinated event exactly when the next flood lands.

**How it works:** Punishes gold-hoarding and reward-ignoring; countered by sweeps and the Canary
Rack. Distinct from the APT (single-level, architectural, guessable if you're watching).
(wave2_gamedesigner_informed)

### The Whistleblower
A threat exclusive to offshore/regulated levels: your own records walk out the door.

**How it works:** Effect: the fog-of-war *inverts* — every hidden defect you had (unpatched box,
quiet honeypot breach, RBL listing) becomes permanently visible to the attack AI; every later wave
gains precision, tagged by your own dirt. The meta-statement: secrets are an attack surface.
(wave2_gamedesigner_informed)

### BEC / Invoice Fraud (the executive threat)
Business Email Compromise: attackers impersonate *you* to your customers ("please rewire the payment
to our new account") or impersonate a vendor to you.

**How it works:** Costs cash directly; if customers get fleeced using your brand, reputation hits
even though your infrastructure was fine. Counters: DMARC/DNSSEC buildables — the beautiful link:
the boring DNS-hardening tower protects the *bank transfers* — plus staff security-awareness
training. (wave3_ceo_fresh)

---

## 2.7 Infrastructure and network threats

### BGP Prefix Hijack *(Siege role)*
Someone else announces your /24 more specifically. Traffic goes to them globally.

**How it works:** Doesn't come down your lane at all. Your traffic graph goes to zero for no apparent
reason. You cannot fix it from inside your network — you must call other humans at other networks.
**Mechanically: a threat you fight with relationships and paperwork, not towers.**
**Counter:** RPKI/ROA signing, IRR objects, prefix filters at your upstreams, route monitoring — an
*information* tower, not a weapon; plus out-of-network probes.

**⚔️ Tension — helplessness is a great feeling and a terrible minute.** Wave-1 calls this "the game's
ultimate helplessness moment," which is right as an emotion and unplayable as sixty seconds of
gameplay. **Give the player three things to do while helpless, all of which matter:**
1. **Verify from outside** — is it a hijack, or are you actually down? (the §7.6 check)
2. **Announce more specifics** — a real mitigation, works partially, takes minutes to propagate,
   drawn as a slow global colour change.
3. **Work the phone** — a relationship minigame with upstreams whose speed is a function of
   **Trust-with-upstreams**, the hidden fifth currency §6.1 invents and never uses anywhere else.
   This is that currency's payoff.
**Hosting types:** any operator with their own ASN; endemic at Tier 5+.
**Visual:** **The Rerouting Hand** — a giant ghostly hand reaches onto the map and physically drags
your route ribbon to a different destination. Enormous, slow, terrifying, and completely
self-explanatory without a word of text.

**Variations and additions**

- **Opencode's treatment — BGP Hijack Octopus / Route Leak** — On world-map levels, reaches in and
  *reroutes your customer traffic onto someone else's map* — some customers now walk to an
  attacker's fake version of you. Can't be fought with towers — only with RPKI/ROA validation built
  earlier + more transit providers; detected only by a monitoring tower. A rare, high-concept
  gut-punch wave. (general, sysadmin, gamedesigner)
- "The wrong road": region traffic rerouted through a hostile corridor where it's *skimmed*
  (customer loss + data theft); repair = RPKI signing tower (prevent) or long manual reconvergence
  (fail). Not a unit — a *path event*. (wave2_gamedesigner_fresh)
- The Hijacker's Pen: traffic rivers on the world/CDN map *repaint and divert* mid-level — lines
  bend toward a rival node wearing your IP badge; RPKI/ROA signing shows locks at the river forks,
  undo is a signature-stamp animation. (wave3_visual_fresh)
- The horror visual: customer arrows turn mid-path toward a black-hole node and siphon away — your
  own traffic marching the wrong way. (wave2_general_fresh)
- Ghost traffic: you keep *seeing revenue* from diverted sessions while real customers time out;
  counters add looking-glass staff action and the screaming-at-upstream minigame.
  (wave4_general_fresh)
- TCP RESET injection on the BGP session: someone blasts RSTs at the keepalive window and your
  peering flaps — your *uplink becomes a capturable point*. (wave3_sysadmin_fresh)
- Self-inflicted inversion: a mis-typed more-specific announcement pulls *world traffic into your
  net* — good for a laugh, fatal for trust; your prefixes can also just vanish.
  (wave3_sysadmin_fresh)
  - The Forget-Me Knot (the vanish, made a level): your own junior (or a tired you) advertises...
    *nothing* — a config push pulls your routes and the world forgets you exist. Non-adversarial:
    can't be countered with defense, only *detected* with external-route monitoring (your own
    sensors happily report everything green — the "view from elsewhere" is a purchasable third-eye
    tower). Full-screen fade to an empty road, no customers spawning, the hum drops a fifth (the
    audio scare); recovery is a BGP re-establish minigame under a churn clock.
    (wave2_general_informed)
- Counter roster widens: RPKI unlock ("crypto for routes"), BGP monitoring, the LOA paperwork tower.
  (wave2_sysadmin_fresh)

### BGP Leak / The Spill
Someone else's mistake steals your traffic.

**How it works:** You cannot fix it directly; you file and wait, or mitigate with more-specific
announcements. Introduces powerlessness as a designed feeling.
**Visual:** your announcement bleeds outward across the globe view like ink in water, reaching places
it should never reach, and traffic starts arriving from absurd directions.

### The Downstream Route Leak
Your own customer announces the internet through you.

**How it works:** A multihomed customer misconfigures and re-advertises everything they learn from
another provider back to you. If you don't filter, **you become a transit path for a continent** and
your routers and your bill both melt.
**Counter:** prefix filtering on customer sessions — boring, mandatory, and exactly the thing nobody
does until it happens.

### The Max-Prefix Shutdown
You announce one prefix more than your peer's configured limit and **they shut down the entire BGP
session**, not just the extra prefix.

**How it works:** A routine, correct-looking change (announcing a new /24 you legitimately own) drops
a transit or peering session entirely. Recovery requires the other party's engineer, on their
timeline. **A configuration limit in someone else's router that ends your traffic.**

### BGP Dampening — the punishment that outlasts the fault
Your circuit flapped six times in ten minutes. It is stable now. Your prefix is suppressed upstream
for the next hour.

**How it works:** Converts Transit Flap from a during-fault problem into an **after-the-fault**
problem: you fixed it, everything is green on your side, and traffic does not come back for 45 more
minutes while you can do nothing. The lesson — **stop flapping something before you try to fix it;
administratively shut the session down first** — is a genuine senior-engineer reflex and a great
unlock.

### The RPKI Self-Inflicted Blackhole
Your ROA says maximum length /24. You announce a /25 for a customer.

**How it works:** Validating networks now reject your announcement, and that customer is unreachable
from a growing fraction of the internet — **and the fraction grows over time as more networks enable
validation, so the symptom gets slowly worse.** The security control you bought after your first BGP
incident is now the outage. Perfectly consistent with the design's own principle that every defense
opens a surface; RPKI is currently listed only as a pure counter, and it should not be.

### DNS Poisoner / Cache Poisoning
Attacks *before* the lane. Visitors never even start walking.

**How it works:** Terrifying because the board looks totally healthy.
**Visual:** a signpost's arrow physically rotating to point the wrong way while visitors dutifully
walk off toward a hostile node. Horrifying and elegant.

**Variations and additions**

- **Opencode's treatment — DNS Cache Poisoning** — Your resolver serves customers *someone else's*
  servers. Counters: DNSSEC, source-port randomization. (sysadmin, general)
- A fraction of customers arrive at a *cardboard copy* of your datacenter (a mirror-map); untreated,
  the churn is delayed-but-double — they blame YOU. Detection: the DNSSEC tower.
  (wave2_general_fresh)
- "Bad map delivery": for N seconds your own towers route customers to attacker servers; the
  Flush-Cache action resets. (wave3_general_fresh)
- "The False Signpost": arriving customers are sent to a clone-phishing site — they don't die, they
  *churn with horror*. (wave3_gamedesigner_fresh)
- The Kaminsky-class attack: same redirect family, countered by DNSSEC and source-port
  randomization. (wave4_sysadmin_fresh)
- The Rollover Ritual Break (DNSSEC self-kill): the zone is signed, the key must roll every N days,
  and the rollover script passed staging on a 60-second timer while prod has 48-hour resolver caches
  — one skipped step and the *entire zone becomes cryptographically invalid*: site up, dashboards
  green, the whole world's resolvers SERVFAIL. Attacked by your own security hygiene. Counters:
  ceremony automation (a timed puzzle with two safe states), external-signing delegation, and the
  "second view" rule — monitor from *elsewhere*. DNS, email, regulated. (wave3_sysadmin_informed)

### Subdomain Takeover
A dangling CNAME to a decommissioned service that someone else claims.

**How it works:** Now `status.yourcompany.com` serves a scam. **Created by the player's own cleanup
sloppiness** — a punishment for deleting a service without deleting the record. The customer-facing
version is worse: you pointed `status.customer.com` at a SaaS you stopped paying for.
**Counter:** DNS hygiene, dangling-record scanning.

### Transit Flap
Your upstream link goes up-down-up-down.

**How it works:** Worse than a clean outage, because failover keeps re-triggering. Teaches that
**partial failure is harder than total failure**, which is the truest lesson in operations.
**Interacts with:** BGP Dampening above — the flap's real cost often arrives after you fix it.

### Upstream Transit / Fiber Cut / The Backhoe
A backhoe, a ship anchor, a squirrel, a hunter shooting at an insulator.

**How it works:** You are perfect; you are unreachable. Removes a network path entirely for a long
duration. Only redundancy helps, and **redundancy must be diverse-path to count** — two circuits in
the same conduit under the same bridge is the classic "looks redundant but isn't" trap.
**Counter:** diverse physical paths bought as *separate routes*, plus a **diverse path audit** —
a buildable that literally asks your carriers to prove their fibre takes different physical routes.
The purest redundancy-vs-cost decision in the game, because the second carrier is expensive and idle
most of the time.
**Hosting types:** universal, but the *presentation* differs per type (see §0.2, "Same event,
different crisis").
**Visual:** an off-map backhoe sprite with a comedy bucket. You never see it coming; a fibre ribbon on
the region map just goes *snap* with a whip animation and the recoil is visible for a few seconds.
Redundant paths light up automatically if you built them.

**Variations and additions**

- **Opencode's treatment — Backhoe Fade** — Fiber cut: a literal road-works crew event — reroute via
  redundancy or eat the outage; pairs with long-haul diversity buildables. (sysadmin, general)
- Cuts have geography *and* bureaucracy: (a) route diversity as a physical-path map — two fibers
  through one conduit = one backhoe = both down: the false-redundancy reveal (the overlay shows they
  share the pipe!); (b) restoration as a timeline — splice crew, OTDR trace, *days* not minutes,
  unless you pre-paid the priority-restoration contract. The repair timer becomes a managed
  resource, not a spinner. (wave2_sysadmin_informed)
- The severing: a path gets cut *mid-level* — the road customers use just closes; the cut costs a
  repair-time meter of lost traffic, and it can co-occur with cable-ship drama.
  (wave2_general_fresh)
- "The Truck": colo's classic — a vehicle takes out the building's power drop, or the fiber duct
  under a road, and an entire region's latency to the world goes to lunch. (wave3_sysadmin_fresh)
- The Bad Backhole (weather): lightning strikes the edge switch → repair-crew dispatch mechanic with
  literal truck travel time (colo/rural DC). (wave4_general_fresh)
- Subsea Cable Cut (scripted): two of three trans-ocean paths fail, inter-region latency triples,
  and traffic engineering becomes the puzzle for the rest of the level. (wave4_general_fresh)

### Upstream Carrier Outage / The Grey Ribbon
Not an attack. Your carrier drops.

**How it works:** You did nothing wrong; you pay anyway.
**Visual:** your transit ribbon loses saturation **from the far end inward, like a fuse burning toward
you** — a visible countdown of "how much of my capacity is left" without a single number. See §2.26's
Attribution Direction Law: grey always starts at the end that caused it.

### Peering Dispute / De-peering
A major eyeball network depeers your transit.

**How it works:** Latency to a big chunk of your customers doubles overnight. Nothing is down. Your
conversion rate falls and everyone blames their own site.
**Visual:** **The Transit Congestion Notch** — the ribbon develops a visible pinch/waist and packets
bunch up before it. The player learns "add an IX peer" from the picture.

### The Blended Transit Downgrade
Your cheap transit provider quietly changes its upstream mix.

**How it works:** Your bandwidth is the same price, the same committed rate, and the same "up." Your
**latency to a third of the internet doubles** because your packets now take a scenic route. Nothing
is down, nothing alerts, your customers' conversion rate drops 4% and they blame their own websites.
Introduces the real distinction between **transit quality and transit quantity** — Mbps are not
fungible, and the "cheap bid" mechanic should apply to circuits as well as to hardware.
**Counter:** external latency measurement from many vantage points.

### Asymmetric Routing After Failover
Traffic goes out one path and back another through a stateful firewall that drops it.

**How it works:** Failover "worked" and nothing works. Some visitors work, some don't, seemingly at
random. A diagnosis puzzle rather than a fight.

### The Half-Dead Link (unidirectional failure)
A fibre pair where one strand is broken or one transceiver's transmitter is dead.

**How it works:** **The link light is on at both ends.** Frames go one way and not the other. Routing
protocols may or may not notice, depending on whether you enabled the protocol designed for this.
Traffic blackholes. Every "is the link up?" check says yes. **The purest "your monitoring asks the
wrong question" failure in networking.**
**Counter:** UDLD-style link verification, or bidirectional forwarding detection on routed links —
both of which are *configuration you must have turned on beforehand*, not tools you can buy during.

### The Microburst
Your interface graph shows 30% utilization. You are dropping packets.

**How it works:** The graph is a 5-minute (or 30-second) average. The drops happen in 50-microsecond
bursts that saturate the switch's egress buffer. **This is a mechanic about measurement resolution.**
Implement it as a **telemetry resolution dial**: the player's graphs have a sampling interval, and
buying finer resolution (or interface drop counters, or a buffer-occupancy readout) is an
**observability upgrade that changes what is true.** Nothing else in the game teaches "your
instrument's resolution determines what you can see."
**Hosting types:** storage networks, video ingest, HFT/financial colo, anything many-to-one.
**Interacts with:** §6.3's 95th-percentile billing — the same "averaging hides the truth" idea on two
axes, one financial and one operational. Ship them as a matched pair.

### Spanning Tree Loop / Broadcast Storm / MAC Flood
A tech patches two ports of the same switch together while cabling.

**How it works:** The entire VLAN goes to zero instantly. **Caused by a cabling mistake the player
made themselves** when connecting two switches — *the player is the threat.*
**Counter:** BPDU guard / portfast, unlocked after doing it once. Or just training.

**Variations and additions**

- **Opencode's treatment — Broadcast Storm (the L2 melt)** — A tenant loops two switch ports (or a
  cheap NIC flaps) and the layer-2 domain melts: frame flood grows exponentially (a visible fog of
  triangles multiplying in the switch stack), CPU on every device chokes on useless frames, legit
  customers drown in noise — *no attacker involved*. Counters: STP/BPDU-guard port towers,
  storm-control limits; the firewall is useless (it's layer 2!) — teaches layer discipline the way
  nothing else does. Colo/shared/any switched network. Visual: a mosh pit inside your own switch;
  everything vibrates, lights go to solid white. (wave2_sysadmin_informed)

### Rogue DHCP / Rogue AP
Someone plugs in a consumer router "just to test."

**How it works:** Half your servers get the wrong gateway; some of your traffic goes somewhere else.
**Counter:** port security, which costs you setup speed.

### The PXE Reimage Incident
Your provisioning network re-images a production machine.

**How it works:** A new machine is racked and net-boots. A DHCP scope, a MAC address typo, or a
default-install PXE policy means the **wrong machine** picks up the install profile and begins
partitioning itself. Nobody is watching. The damage is complete, fast, and self-inflicted by the
automation that makes you efficient.
**Counter:** a provisioning VLAN separate from production, MAC allowlisting, and a "confirm target"
gate — all of which slow provisioning down, which was the entire reason you built it.

### Duplex/Speed Mismatch, Bad Optics, and the Dirty Connector
Link is up, throughput is 3% of nominal, error counters climb.

**How it works:** Dirty fibre, a flaky SFP, **the wrong optic type** (SR multimode vs LR singlemode,
or the wrong wavelength on a WDM system — the link either doesn't come up or comes up marginal with
climbing errors), or, most commonly of all in the field, a **dirty connector**, whose fix is a
three-dollar cleaning tool. A "clean the fibre" action that resolves a whole class of intermittent
errors is both funny and true.
**Counter:** a "deep inspection" action that checks interface error counters — a habit the player
learns to have.
**Visual:** a link with CRC errors shows tiny red sparks **at the exact end with the bad optic.**
Diagnosis becomes a visual act. **The Dust Mote:** a speck sits in a port and that link's packet beads
become intermittent — every few beads just don't appear; cleaning is a cotton-swab animation. **The
Knot:** a cable with a visible kink where beads slow as they pass through; re-terminating is a
satisfying cut-crimp-test animation with a tester that goes green.

### NIC / Optic / Cable Gray Failure
The worst kind: **partial**.

**How it works:** A dying SFP doesn't go down — it drops 0.4% of packets, TCP hides it, and everything
becomes mysteriously slow. Should exist as a "gray failure" that your simple up/down monitoring
**cannot see.**
**Interacts with:** §2.17 Gray Failure (the general case and its detection method).

**Variations and additions**

- **Opencode's treatment — Flapping NIC / Cable Rot** — Intermittent errors, "can't reproduce" — the
  slow-poison enemy nobody's monitoring catches. Counters: link-flap detection, interface error
  counters as a UI stat. (sysadmin)
- The flapping form: interface up/down/up/down every 40 seconds — no alert crosses the threshold,
  routing recalcs, sessions die; pure chaos gremlin requiring a log-aggregation tower.
  (wave3_sysadmin_fresh)
- Alerts fire/clear endlessly and *drain the attention resource* — intermittent packet loss makes
  monitoring lie; counter: replace-the-box triage decision, burn-in testing unlock.
  (wave2_sysadmin_fresh)
- The Dirty Connector / dB Decay: light slowly dies — a dusty connector drifts −2dB… −4dB, errors
  climb, the link flaps intermittently, monitoring says "green-ish," and *no one can reproduce it*
  (the classic "re-seat the fiber" save). A slow hidden health meter per link, only visible on DOM
  (digital-optical-monitoring) overlays; a "fiber cleaning" janitor action restores it with a
  satisfying sparkle; humidity and dust events accelerate decay. The doc's Flapping NIC is the same
  animal — this gives it hands. Colo/DC/WISP. (wave2_sysadmin_informed)

### MTU Mismatch / PMTUD Blackhole
Small requests work, large uploads hang forever.

**How it works:** The most maddening real bug in networking, and a *perfect* puzzle: your monitoring
pings (small) are green.

**Variations and additions**

- **Opencode's treatment — MTU Blackhole (the fat-packet ambush)** — Small things through, big
  things die: a PMTUD sinkhole from an ICMP-blackholing device mid-path. Customer sprites with big
  coin-pouches (large files/payments/images) *stall mid-path and vanish*, while empty-handed
  visitors arrive fine — a bounce that looks random but correlates to payload size. Counter: TCP MSS
  clamping tower; a diagnostic minigame (ping with don't-fragment, the *real* command).
  VPN/CDN/VPS/game-asset — deliciously unfair-feeling-but-learnable packet physics.
  (wave2_sysadmin_informed)

### The Asymmetric MTU Path
A tunnel, a VPN, or a cloud interconnect reduces the usable MTU on one path only.

**How it works:** Small requests work perfectly; anything above ~1400 bytes on that path vanishes.
Because it is path-dependent, **it affects some customers and not others, and switches between them
when routing changes.** Meaningfully nastier than the symmetric version and worth its own entry.

### Switch Firmware Bug / Stack Master Failover
The HA mechanism causes the outage.

**How it works:** The central irony of high availability, rendered: every redundancy step adds a new
failure mode of its own. The classic: stacked switches that both reboot during a stack upgrade.

### The Firmware Flash That Didn't Finish
A RAID controller, BIOS, switch or drive firmware update loses power or times out mid-write.

**How it works:** The device is now a brick with no bootloader. On a switch this is an outage with no
console banner to read; on a RAID controller it can mean an array that cannot be imported by a
replacement card of a different firmware revision — **your data is intact and unreachable.**
**Counter:** staged firmware rollouts, matched-firmware spares on the shelf, and a dual-flash device
(a real feature you can pay for).

**Variations and additions**

- **Opencode's treatment — The Firmware-Update Brick** — Patching a BMC switch mid-cycle bricks it;
  the whole cage's remote power becomes manual. Risk mechanic: *all* updates are gambling with old
  version numbers. (wave3_sysadmin_fresh)

### The Config Nobody Backed Up
The switch died. You have a replacement. Nobody has a copy of its configuration.

**How it works:** Everyone config-manages their *servers* and nobody exports the *switch* config —
exactly the real-world gap. Rebuilding from memory takes hours, introduces subtle differences, and
you will miss one VLAN.
**Counter:** an automated network-config backup with a diff view — cheap, boring, and the single
highest-value network purchase in the game.

### The Management Network That Rode The Production Switch
You bought out-of-band management. It is cabled to the same top-of-rack switch as production.

**How it works:** Everything works perfectly until the failure that takes the switch, at which point
your remote hands, your console access, your power control and your ability to diagnose all vanish
together. **The Effective-vs-Nominal-Redundancy rule applied to the recovery path instead of the
service path**, and a mistake almost everyone makes once.

### Clock Drift / NTP Failure — split into two failures
An invisible foundation crumbling, in two distinct shapes that need different counters.

**How it works:** **Loss of time** (your source is unreachable; you drift) is gradual and detectable
by comparison. **Wrong time** (your source is confidently incorrect, or a step correction is applied)
is instant and undetectable from inside. Also model **slewing** (gradual adjustment, safe) versus
**stepping** (jumping, which breaks anything measuring durations and can make a database's timestamps
go backwards — a genuine data-integrity event). Consequences either way: certificates fail validation,
cron double-fires, logs become unorderable, auth/Kerberos dies, replication gets confused, auth tokens
start failing.
**Interacts with:** §2.19's GNSS/NTP Spoof, which is the "wrong time" boss.

**Variations and additions**

- **Opencode's treatment — Clock Skew / NTP Failure** — Subtle: clocks drift → auth tokens (and
  Kerberos) start failing, log correlation breaks, customers bounce mysteriously; an NTP guardian
  tower fixes it. Teaches observability play; a late-game subtlety. (wave3_general_fresh,
  wave4_sysadmin_fresh)
- The quorum lie: past 5 minutes' skew, distributed systems *disagree* — auth/Kerberos tokens fail,
  logs interleave nonsense, quorum systems split and two machines "simultaneously" own the same
  resource. Per-machine skew meters drift; crossing threshold fires an invisible event cascade (auth
  failures, corrupt replication). The NTP stratum-1 "quiet MVP" tower finally gets its threat; HFT
  levels run the GPS-disciplined stratum-0. (wave2_sysadmin_informed)

### Conntrack Table Full / Ephemeral Port Exhaustion / File Descriptor Limit
Silent packet drops or connection failures at a specific concurrency threshold.

**How it works:** Looks like "the network is flaky." The service works perfectly under test load and
dies at exactly 1024 connections. `Too many open files.` See §2.9's "missing capacity in the least
obvious place" for the whole family.

**Variations and additions**

- **Opencode's treatment — conntrack / NAT table full, fd leaks, memory creep** — Silent saturation
  meters: uptime slowly kills you. Counters: process recycling and leak detection — scheduled
  reboots as a *ritual* tower. (sysadmin)
- Add ephemeral-port exhaustion, the mirror failure: *you* NATing many clients through few source
  ports can't open outbound to a hot backend (real cloud-kernel pain). One more silent saturation
  meter in the same family — it teaches *directionality*: inbound floods eat state, outbound fanout
  eats ports. (wave2_sysadmin_informed)
- The Table Grows (RIB-full slow bomb): not an attack — a *trend*; the global routing table adds ~1k
  prefixes/month and your cheap edge router's FIB has a ceiling; the meter is silent until one
  Monday the BGP session drops and re-establishing the full table at 100% CPU takes 40 minutes of
  self-inflicted outage. A slow background meter no alert watches by default; the fix is a boring
  purchase (bigger router) made dramatic by budget cycles. Event variant: a single wide-hijack day
  (stolen /8 announced, 900k routes) kills every under-specced router at once. Counter: RIB
  telemetry + route-limit policy per neighbor. Any AS of your own — no TD models FIB exhaustion.
  (wave3_sysadmin_informed)
- The Filler Swarm (attack by *inventory*): millions of 0-byte files (inode exhaustion while disk
  reads 1% used), logs that write themselves, a "zip" that unpacks to 40TB — targets your *counters*
  rather than your servers. The capacity meters shown are the wrong ones (disk % vs inodes): a
  UI-teaching threat that punishes players who watch the obvious gauge. Counters: per-service quota
  towers (walls made of policy), log-rotation rituals, archive-depth scanners on uploads, and a
  filesystem-resize operation that is a dangerous timed cast. Full disk also cascades into the
  backup-that-fails. Object storage, mail, shared, CI. (wave2_general_informed)
- OOM-Roulette: memory overcommit finally bites — the kernel's OOM killer picks *something* to
  sacrifice, and statistically it won't be the leaker, it'll be your database. A gamble meter per
  host; when it fires, one random daemon dies with a grim dice-roll animation. Counters: memory
  limits/cgroups (the cage-for-*processes* cousin of tenant cages), memory reservations, leak-fix
  research. Cloud/VPS/shared/K8s. (wave2_sysadmin_informed)
- The Disk-Full Gremlin's meaner cousins ride the same creature: `/var` fills with logs while disk
  reads fine, or the snapshot pool hits 95% and the hypervisor freezes *every VM on it* — services
  die in random order and "No space left" error-bursts spawn at the worst possible second. Logrotate
  daemon (cheap!), inode headroom planning, and DOM-style visibility are the counter; the single
  most common real outage nobody writes fiction about. (wave2_sysadmin_informed)

### The Loose Cable
Cosmetic-looking, and the cause of an entire incident.

**How it works:** One link's cable end is drawn at a slight angle, not quite seated. Traffic across it
flickers. A tech NPC walking by can reseat it. Rewards players who *look closely*, and creates the
delicious "it was DNS / it was the cable" moment.

### Rodents, Wildlife, and the Literal Bug
A chewed cable; a moth in a relay; wasps in the outdoor condenser; ants shorting a contactor; a snake
in a generator enclosure; a bird strike on a microwave path; a cat in the raised floor.

**How it works:** Random link death. A joke that is also a real cause, with bespoke micro-animations —
every one of these is a genuine incident report somebody has written.
**⚔️ Tension — random link death with no telegraph is exactly the unfair randomness the design
forbids elsewhere.** Two acceptable fixes; the second is recommended: **(a)** make it cosmetic only —
a chewed cable a tech finds during routine maintenance, costing nothing; **(b)** give it counterplay —
conduit and rodent guards as a cheap facility purchase, and **a chew-damage precursor state visible in
the cable's rendering for ~30 seconds before failure.** Keep the joke and make it a precursor state:
"there's a cable that looks wrong in aisle 4" is a great thing to notice.

**Variations and additions**

- **Opencode's treatment — Dust, Rodents, Water (physical entropy critters)** — Dust bunnies slow
  fans, rats chew cable bundles (the cable whips and dies), floor-tile leaks corrode racks — a
  janitor mini-game; cheap, funny, and they make raised cable trays feel valuable. (visual)
- The fan-out decay: dust accumulates in intakes over months (silent stat decay) making thermal
  events likelier — unlock a "maintenance contract" or hire a janitor to vacuum (dial-up/colo/game
  eras, cigarette era kept PG). (wave3_sysadmin_fresh)
- Rats in the Fiber: rodents chew patch cables overnight; counter: conduit — and cats (yes, a *cat
  unit*). Cute and true to life. (wave4_general_fresh)

### DNS Failure Cascade (invisibility)
Zone transfer blocked, glue stale, or your authoritative provider dies — you can't be attacked *or
visited*; customers bounce to "site down." Counters: anycast DNS, secondary on a different provider
— the two-clouds lesson. (wave2_sysadmin_fresh)

### Man-in-the-Middle
A figure that intercepts a cable mid-run, cuts in, and re-paints itself in your link's colors — only
cert-sniffing hound-bots patrolling links catch it (they bay at mismatched pads). (visual)

**Variations and additions**

- The Kinked Link: a MITM visibly bends a cable into a kink and rides it like a surfer imp; the
  link's light pulses stutter around the kink and hound-bots bay at it — distance-readable betrayal
  added to the re-paint tell. (wave2_visual_informed)

---

## 2.8 Entropy: hardware, power, cooling, and physics

*These should be a full-fledged threat class with their own visual language — **no enemy walking in;
they erupt from inside your own buildings.** Half a sysadmin's life is here. Their mechanical job is
to be frequent, small, and attention-taxing so they compete for the player's hands during combat
(Pillar P4). They should be **constant, probabilistic, and never fully preventable** — the background
hum of the game. Redundancy converts them from outages into cost and toil.*

### The entropy rate cap and aggregation rule
**⚔️ Tension:** §2.8 says entropy events should be "frequent, small, and attention-taxing." §8.8's
Notification Discipline and §8.2's Readability Budget say the opposite.

**Resolution:** a **rate cap and an aggregation rule.** At most **one entropy event per 90 seconds**
reaches the alert stack; everything below that threshold accumulates silently into the
**maintenance-debt overlay** and is cleared in batches by a scheduled maintenance action. That
preserves "the estate is always quietly rotting" without generating forty popups an hour.

### The Entropy Pressure Budget (a second, quieter generator)
Hardware, power, cooling and self-inflicted failures run on their **own** pressure budget.

**How it works:** Deliberately **anti-correlated** with the attack budget: entropy pressure is highest
during the calm troughs of the attack sawtooth. Its budget is a function of **estate age × estate
size × (1 − maintenance spend)** rather than of wave number. Two payoffs: peacetime becomes genuinely
non-idle (P3), and the player who solves security still has a game. It also gives the
maintenance/drill economy a visible dial — you can literally see entropy pressure fall when you fund
maintenance.

### The stated entropy budget (numbers)
An enormous family of small failures with no stated rate risks either "never happens" or "constant
noise."

**How it works:** Each object has an **annualised failure rate**, and the level's sim time determines
the expected count; the generator then **schedules** those events rather than rolling each tick, so
the player experiences a *designed distribution* rather than a Poisson process. Starting values:
drives **2%/yr rising to 8%/yr after year 4**; PSUs **1%/yr**; fans **3%/yr**; switches **0.5%/yr**;
UPS batteries **hard-failing at 4–5 years**; optics **1%/yr, tripling if counterfeit.** And entropy
events **cluster deliberately** during high-load and high-heat periods, because that is both true and
much better drama.

### Disk Failure / Click Death
A drive dies with no warning — or with a SMART warning, if you bought monitoring.

**How it works:** The most common event in the game. Every drive has a hidden wear stat; SMART gives
you *partial* foresight — **buying foresight is a mechanic.** Nothing happens immediately (RAID
absorbs it), but you're now in a **degraded window** where a second failure is fatal, and the fix
requires a *physical hand* at the rack. Creates the beautiful choice: interrupt your defense to go
swap a disk, or gamble on the window.
**Counter:** RAID levels, hot spares, erasure coding, mixed drive batches, spares on site.
**Visual:** a drive bay LED goes green → slow-blink amber → solid red, with a tiny cracked-platter
SMART glyph. The RAID widget shows one segment go hollow and the rest start pulsing. A tiny
**audio-visual click ripple** emanates from the bay every second or so; at Tier 2+ it collapses to a
single amber pixel pulsing at the same rhythm — **the rhythm is the identifier, not the shape.**
**The SMART Ghost:** predictive failure shows as a translucent duplicate of the drive slowly
separating from the real one. "This drive is leaving." Gorgeous, immediately understood.

**Variations and additions**

- **Opencode's treatment — Hardware Entropy (Capacitor Plague)** — Not an enemy — a *clock*: drives,
  capacitors, PSU fans fail on soft timers scaled by uptime+heat; an ambient attrition enemy every
  player fights regardless of attackers, keeping empty breathers tense. Drives die in clusters (same
  batch); a replacement during high load triggers the *RAID rebuild storm* — degraded performance +
  a second-failure risk window. Counters: RAID (single-disk loss = free), spare-parts shelf,
  SMART-premonition monitoring as the *oracle* tower. Visual: status LEDs amber one by one, fan
  whine pitch rises, a smoke puff, the tile dies; redundancy reads as a sibling server catching the
  falling spark-orb. Capacitor plague: slow green corrosion spreading only among
  same-manufacture-batch chassis — counter: mixed-vendor policy (deliberately mismatched rack art).
  Late-game levels make entropy a visible countdown. (general, sysadmin, gamedesigner, visual)
- Batch deaths and DOA windows, made into events: (a) the *domain* bug — one firmware flaw bricks a
  manufacturing batch of 20,000 SSDs identically, everywhere, at once (Seagate-2016-style): script
  it as an event that spares you *only* if the mixed-vendor counter is built; (b) drives die young
  or old — a 30-day DOA window (swap free, advance-replacement matters) and a failure-rate cliff at
  4–6 years: the bathtub curve as a literal *wear curve* drawn over a rack's life.
  (wave2_sysadmin_informed)
- The Failed Disk Batch (ticking clock): a fleet-wide hardware defect countdown — drives fail in
  *waves*, and the "cheap SSDs" buildable carries a visible defect-rate aura: a temptation item.
  (wave2_general_fresh)
- "The Rust Clock": every disk/fan carries a thin wear-ring; failure sparks with a slow-motion
  fan-blade-separation shot. A silent, non-evil threat — no attacker face at all, just entropy.
  (wave2_visual_fresh)
- The SMART ambience signal: reallocated-sector counts climb over days — an ambient cue attentive
  players act on; ignore it and the drive dies mid-RAID-rebuild. (wave3_sysadmin_fresh)
- Rebuilds are a vulnerability *window you must schedule*: surviving disks hammer to 100%, latency
  spikes to customers at peak; counters: spare pool, rebuild throttling, scrubbing schedule.
  (wave2_sysadmin_fresh, wave3_sysadmin_fresh, wave4_sysadmin_fresh)
- Correlated death: all drives from the same manufacturing lot fail on a correlated schedule —
  diversify vendors or get swept. (wave3_sysadmin_fresh)
- *The more you own, the faster something breaks*: upkeep scales as a threat with the size ladder —
  the brilliant tension between growth and fragility; "the true late-game enemy is entropy, not
  hackers." (wave3_gamedesigner_fresh, wave4_gamedesigner_fresh)
- Hardware Mortality, no enemy sprite: a component LED turns white, a tiny crack shader spreads,
  smoke puffs, the unit's light goes out — *the room itself* is the threat; hot-swap crews run
  technician animations (the mechanic that makes tape/vault/RAID buildables emotional).
  (wave3_visual_fresh)
- The dying LEDs: disk LEDs blink off one by one, the fan note in the soundscape drops a semitone,
  the machine *slumps*; RAID reads as braided cables — cut one, data reroutes along the braid with a
  shimmer. (wave4_visual_fresh)
- Drives die on a visible countdown; RAID survives the first, second failure = data loss + a restore
  event; disk-health monitoring makes it *predictable*. (wave4_general_fresh)
- The RMA Vortex / DOA cascade: a bad vendor batch means every replacement part is also bad —
  "hardware luck" becomes a run debuff. (wave3_sysadmin_fresh)
- Quantify it: give drives a SMART oracle stat that degrades *before* death with a visible
  confidence curve; the monitoring tower "prays" (shows the curve); unmonitored entropy = uniform
  RNG (harsher). Makes buy-vs-rotate decisions informed. (wave3_general_informed)
- Hardware Recall (scheduled inventory event): a vendor announces a bad PSU batch — every unit you
  own with that batch (visible serial tags!) will fail on a countdown you choose to beat. Swap
  proactively (cost, brief downtime) or gamble per-rack. Entropy made *legible and planable* instead
  of random; a softer, funnier cousin of the capacitor plague. (wave2_gamedesigner_informed)

### Rebuild Storm / The Double Failure
The *fix* is the second disaster.

**How it works:** The rebuild halves that array's performance for its duration, and a second failure
during it is fatal. Probability rises with array size, which punishes "big cheap arrays."
**⚔️ Correction — keep the mechanic, fix the reason.** The popular framing ("the rebuild reads every
sector, so a URE is guaranteed, array lost, RAID5 is dead") relies on a spec-sheet error rate that
real drives beat by a wide margin, and most controllers survive a single URE with a partial-sector
failure rather than dropping the array. **The genuine killers are:** (a) **rebuild duration** — a
multi-day window with no redundancy, (b) **the performance collapse** during it, and (c) **correlated
age** — the drives are all the same age and the rebuild's sustained read load is the heaviest work
they've done in years. That reasoning supports identical gameplay, survives contact with anyone who
knows the topic, and points at better counters: RAID6/erasure coding, faster smaller drives, and
distributed rebuild that recruits the whole pool.
**Visual:** **the rebuild is a visible vulnerability window** — an amber progress ring around the
array, and a slow sweeping progress light across the whole face while the array visibly "strains"
(heat shimmer, slower activity elsewhere). The tension is a literal loading bar you are praying
finishes.

### Correlated Batch Failure / The Bad Batch
All 8 drives came from the same lot, same day, same firmware.

**How it works:** The second one dies within 48 hours of the first. Real, documented, brutal. The
extreme version: you bought 40 drives from one lot and they share a firmware bug that bricks them at
exactly 32,768 power-on hours — **every machine dies the same week.** (This happened; it is the
ultimate lesson in correlated failure.)
**Counter:** a **Mixed-Vendor Procurement** policy unlock — costs more per drive.
**⚔️ Correction — the policy is overstated.** Mixed-vendor procurement does not "remove correlated
failure"; it removes **one class**. Mixing vendors and manufacture dates defeats *firmware-and-batch*
correlation. It does nothing about **environmental** correlation: same rack, same thermal profile,
same power event, same vibration, same age of service. So the policy should reduce the *batch*
correlation coefficient specifically, and a separate, more expensive answer exists for environmental
correlation: **spread redundant copies across racks, rows and power domains** — which is the
blast-radius mechanic, and giving the two ideas a relationship is more satisfying than one blanket
cure.
**Interacts with:** §2.17 The Shared Fate You Bought (Correlation Score), §2.18 The SSD Endurance
Cliff (the deterministic sibling).

### RAID Controller BBU Death
The battery fails, the controller drops write-back cache to write-through, IOPS falls 10×.

**How it works:** Everything is "slow" with zero errors logged anywhere obvious. A pure diagnostic
puzzle with no alarm attached to it.

### Silent Bit Rot / The Fade
A file is subtly corrupted and faithfully backed up in its corrupted form for six months.

**How it works:** Damage you cannot detect without looking. Discovered only at restore time. **The
signature threat of archival hosting.**
**Counter:** a checksumming filesystem or scrub jobs — periodic verification passes that cost IOPS and
produce nothing visible.
**Visual:** grey speckle creeping across archive tiles. No creature, no sound, no alert — **it only
exists if you look.** The most quietly terrifying threat in the game. The stronger rendering:
archived data tiles **lose actual pixels** over in-game years, dithering away to nothing, and
scrubbing/verify passes are a scan line that restores them. **The clearest visual metaphor in the
whole design, and it is basically free.**

**Variations and additions**

- **Opencode's treatment — Bit Rot / Cosmic-Ray Flips** — Occasional single-bit corruption on
  storage; ECC memory as an expensive passive; scrubbing jobs on arrays. Extra: **once per save-file
  lifetime**, a literal cosmic ray from space flips one bit and corrupts exactly one rack tile with
  an astronomical flash and a deadpan log line — the industry myth made mechanical. (sysadmin,
  visual)
- Environmental Ghosts: cosmic-ray bit-flips render as a brief star-twinkle over a rack, ECC
  correcting with a tiny shield ping. (wave3_visual_fresh)
- The one-file read error: a drive passes every health check but the *specific block* holding a
  customer's database is unreadable — the corrupt-backup storyline seed. (wave3_sysadmin_fresh)

### RAM / ECC Error Cascade / Bad RAM / Static Fleck
Intermittent, undiagnosable corruption.

**How it works:** Correctable errors are a warning; uncorrectable ones crash the box. **A DIMM with a
rising correctable-error count is a *predictable* failure if you're watching.** Non-ECC RAM (cheaper)
removes the warning entirely and turns failures into **silent data corruption**. Symptoms are random
and wrong; occasionally a request just returns wrong data. The "you will waste ten minutes chasing the
wrong thing" threat.
**Visual:** random 1px noise pixels appear in that server's rendered output **and in anything it
serves** — visitors served by it come out with the same noise on them. Corruption made literal.

### PSU Pop / The Pop
A power supply dies audibly.

**How it works:** If the server was single-corded, it's down now. If you paid for dual-corded + dual
PDU earlier, nothing happens and you feel like a genius. **The purpose of this event is to
retroactively reward an expensive, boring earlier purchase.** And: half of a redundant pair dying has
no impact *unless* both were on the same PDU/feed, in which case you discover your redundancy was
decorative. Redundant PSUs on the same feed are not redundant.
**Visual:** a single frame of white flash, a puff of grey smoke, and the machine's fan blur *stops*.
With redundancy: the second PSU's LED flips from standby-amber to active-green with a satisfying
*chunk*, and nothing else happens — the reward for redundancy is that the picture *doesn't* change,
so the little LED flip must be made extremely juicy to sell it. **Six frames, and it is the single
best argument for redundancy the game can make.**

### Fan Failure → Thermal Throttle / The Wobble
Silent, then throttle, then shutdown. Gradual, not binary.

**How it works:** The machine gets slower and slower; latency creeps up; visitors start bouncing;
nothing is "broken." Your capacity drops and you don't know why unless you monitor **CPU frequency,
not just CPU utilization.** A diagnosis puzzle.
**Visual:** CPUs throttle by visibly *shrinking the maximum* of their utilization donut — a
beautifully legible way to show "your ceiling dropped." The fan itself: blur rate drops and the
sprite acquires a tiny 1px vertical jitter, plus a heat plume starts rising. **You detect it
peripherally from motion, not from an alert** — which is exactly right.

### Backplane / Controller / Motherboard Failure
Takes out a whole chassis. Rare. Recovery = rebuild.

### Switch Failure
Takes out a rack. A switch *firmware upgrade* failure takes out a rack for longer.

### PDU Overload / Breaker Trip
You added one more server and crossed the 80% continuous-load rule on a 30A circuit.

**How it works:** The breaker trips, killing *everything* on that feed at once — **including the
switch, so you can't even see what happened.** Instant, total, and preventable purely by *arithmetic
you should have done*. Power budgeting must be a real, visible per-rack constraint with a red line.
**Visual:** a breaker physically flipping to OFF and everything downstream going dark in a cascade you
can trace with your eye.

### Phase Imbalance
Three-phase rack loaded unevenly. Works fine right up until it doesn't.

**Visual:** three phase bars in the PDU widget drift out of level; the visual is a see-saw tipping.
Fixing it is redistributing cabinets — a genuinely spatial puzzle.

### Power Loss / Brownout / The Power Event Ladder
A four-stage failure chain where each stage is a thing you could have bought insurance against.

**How it works:** Utility failure (a transformer, a storm, a car into a pole, a squirrel) → **UPS** (a
countdown bar) → **generator start** → **generator fails to start** because nobody ran the monthly
test. A layered dependency chain where each layer is a separate purchase, and the **transfer switch
(ATS) is itself unredundant unless you buy two.** A sub-second **Utility Blip** is its own event: it
reveals exactly which of your gear you cheaped out on, in the most humiliating way possible.
**Visual:** **The Brownout Dim** — global lighting desaturates and drops 20%; every LED dims slightly.
A level-wide mood change with zero UI. If you have a UPS, the room *stays lit* and only the UPS bar
starts draining, which makes the UPS feel amazing. **The UPS Drain** is a vertical battery ziggurat
that visibly empties cell by cell with a runtime readout in minutes — **the clock everyone watches,
and the scariest number in the game.** **The Generator Cough**: a 3-second crank → cough → black
smoke puff → steady exhaust plume → room lights coming back warm; a *failed* start is the cough with
**no plume, and total silence.** **The Flicker (ATS transfer)**: every light in the facility blinks
once, hard, and if anything was single-corded it dies right then — one frame that teaches dual-power
forever. Total loss is **actual darkness** with only amber emergency lights and the sound of fans
spinning down.

**Variations and additions**

- **Opencode's treatment — Power Events & Cascade** — PDU trips, PSU death, UPS batteries aging
  (silent capacitor-rot meter), generator fails-to-start (it must exercise monthly or it doesn't
  when needed — real truth, great mechanic). One failed UPS overloads the next: failures chain
  visually across PDU towers. Counter: N+1 redundancy — *dead cost* until used (beautiful investment
  tension). "Power Loss" as environment boss: light just *dies*, darkness sweeps from the grid-tie
  point inward; only UPS columns hold glowing blue islands — the map becomes a lighting puzzle: what
  stays lit is exactly what you paid to protect. (general, sysadmin, gamedesigner, visual)
- The ATS is the actual killer: the transfer switch failing to transfer is the most common reason
  dual-feed gear *still* dies in real outages. Add the auto-transfer switch as its own tiny box with
  a "last successful transfer: 14 months ago" stamp (mechanical relays that never exercised = the
  generator's uglier twin), plus a manual-transfer fallback — someone runs to the breaker room
  *during the darkness*: an incident-command mini-event. (wave2_sysadmin_informed)
- Power-Cut Confession (the PLP-SSD lie): the cheap drives' power-loss-protection capacitors are
  fiction — a brownout mid-write silently corrupts the filesystem journal *across the batch*, and
  hours later a wave of restore requests arrives (the backup window's revenge). Two stages: the
  power event (the doc has) and the delayed silent-corruption domain (batch-correlated; the
  data-integrity scan is the detective tower). Counters: enterprise parts with real PLP, scrubbing
  jobs (bit-rot patrol extended to the write path), mixed-vendor fleets so one batch can't take both
  copies. Colo, VPS, archive. (wave3_sysadmin_informed)
- UPS units fail *topologically*: grid sag → generators → a transfer-switch timing puzzle;
  overheating fans slow customers (latency) before anything dies — non-combat tension wave.
  (wave2_gamedesigner_fresh)
- A whole-map flicker; UPS towers buy seconds, generators take minutes to sync — and a generator
  with an empty fuel tank is a scripted heartbreak; long outage without redundancy = rack death.
  (wave2_general_fresh)
- Single-feed gear dies on one PSU loss; dual-feed + A/B PDU is the counter, but generator transfer
  takes seconds — enough to brown out cheap PSUs. (wave2_sysadmin_fresh)
- A failing PSU in a loaded rack starts a heat chain-reaction across neighbors — spacing and cooling
  are defensive placements. And the unattended PSU smoke event can trip fire suppression, flooding
  the hall with gas and killing *all* servers in the zone briefly. (wave3_general_fresh,
  wave4_general_fresh)
- The Brownout Front: power loss arrives as a *dimming wave* sweeping left-to-right, followed by the
  thump of failing UPSes (their LEDs switch to amber on schedule); generator start-up is a
  mini-timing puzzle rendered as a row of pilot lights. (wave3_visual_fresh)
- Whole-map vignette: lights fade to emergency red strips, fans spin down audibly, UPS batteries
  render as a wall of visible draining charge bars; the generator start is a 3-beat cough-then-whine
  as lights surge back. (wave4_visual_fresh)
- The Amber Wash: warning light sweeps the ceiling, then darkness falls *rack by rack with a lag* so
  the player *watches* the blackout travel. (wave2_visual_fresh)
- **The UPS Lie:** backup power that fails *only when needed* — test it with a maintenance action or
  it's Schrödinger's UPS (hurricane levels). Periodic battery-test maintenance is a chore you must
  do: a mains blip and the UPS doesn't hold → crash + fsck. (wave4_general_fresh,
  wave4_sysadmin_fresh)
- The Demand-Curtailment Order: on the hottest day of the year the grid operator emails — *shed 20
  MW in 15 minutes or be fined into history*. A contractual threat that punishes you for *being up*:
  you must shed racks in priority order (each dropped rack = churn-risk spike vs the curtailment
  payout — the game's most literal "who do you sacrifice" dial), or buy battery discharge, or
  pre-negotiate a "critical-load" exemption (paperwork filed months ago in another level — a
  cross-level consequence!). Large DC/GPU era. (wave2_general_informed)

### UPS Battery End-of-Life
Batteries were "tested" by a self-test that only checks voltage, not capacity.

**How it works:** Batteries die on a schedule. A UPS with dead batteries **passes every green-light
test** and fails the moment it's needed. The grid blips for 90 seconds; the UPS holds for 11.
Everything drops. A failed UPS stuck in bypass is worse than no UPS.
**Counter:** a **Battery Capacity Tester** and periodic *load* testing — a boring purchase that
decides whether the event kills you.

### Generator Fails to Start
Dead block heater, clogged fuel filter, algae in the diesel, an untested start battery, or the ATS
itself failing.

**How it works:** The generator that passed every monthly *no-load* test fails on the one day of
actual load. **Probability is set by whether you ran monthly load tests, which cost fuel and carry a
small outage risk each time** — a maintenance ritual with real odds attached. A deterministic version
is also defensible: skip N monthly tests and it fails, full stop.
**Counter:** a **load-bank test** — expensive, boring, unglamorous, resented, later worshipped. Also
fuel polishing and a priority refuelling contract.

### Fuel Runs Out
A long outage becomes a logistics problem.

**How it works:** Fuel delivery is a ticket with a travel time, and **during a regional disaster the
queue is long** — everyone called the same supplier. The prepaid priority contract you skipped is the
whole difference.
**Visual:** the diesel tank has a physical float gauge on its side visible from the campus view, and
fuel truck arrival is a whole vehicle animation with a hose.

### CRAC / Chiller / Cooling Failure
Temperature climbs. You have minutes, not hours.

**How it works:** Servers begin thermal-throttling (a soft degrade visible as reduced capacity), then
shut down on thermal trip. Heat spreads as a *field* across adjacent racks, so adjacency suddenly
matters for placement and floor layout becomes a real puzzle. Time-to-thermal-shutdown is a visible
countdown. **N+1 cooling matters more than N+1 power in a short outage, because thermal mass runs out
in minutes.**
**Counter:** N+1 cooling, hot-aisle containment, raising the setpoint, emergency load shed, workload
migration, failing over to a neighbouring unit, and the emergency option of propping the doors and
bringing in portable units — ugly, works, and a hilarious real move.
**Visual:** the CRAC's visible airflow stops and a heat shimmer creeps up the racks from the bottom;
the thermal overlay turns the floor into a live heat map. **Heat Bloom:** thermal problems render as a
false-colour bloom on the Signal layer creeping out from the source; at Tier 3 the floor plan becomes
a thermal map, and hot-aisle containment is drawn as glass panels that *visibly hold the bloom in*.
**CRAC Hiccup:** the unit's fan stutters and its cold-air plume gutters like a candle while the cold
aisle's blue tint recedes toward the unit. **The Mirage:** an ambient heat-distortion shader in hot
aisles that is beautiful and doubles as a passive readout — the more shimmer, the closer to trouble.

**Variations and additions**

- **Opencode's treatment — Cooling Failure / Thermal Runaway** — CRAC dies → heat rises → units
  throttle → LB shifts load → MORE heat → more throttle → nodes die → racks *ignite neighbors*: the
  only fire that spreads by adjacency. A spatial puzzle: rack placement determines who overheats.
  Visual: orange fog rises from overtaxed racks, objects inside sag and desaturate; cooling doesn't
  "damage" the heat — it squeegees the fog back like a windshield. (general, sysadmin, visual)
- Blanking panels, the $1 lesson: the real, cheap, invisible cooling disaster is *missing blanking
  panels* in empty rack U-slots — hot air recirculates over the cold intake one device at a time, a
  slow heat leak no alarm catches until load rises. A $1-per-slot buildable ("blank off the holes!")
  with disproportionate effect; plus containment breaches (the rack door left open for remote hands
  — cable-door gap = local fog). The fog-squeegee visual already wants this villain of omission.
  (wave2_sysadmin_informed)
- The Bleeding Wall (external thermal utility): district cooling / the landlord's chilled-water loop
  fails *upstream of your redundancy* — your N+1 chillers were never the system; the loop feeding
  them is, and it has a shared single point you didn't buy. Water temperature rises → condensing
  approach degrades *gradually then cliff*; thermal mass gives you 20–90 minutes of building-scale
  capacitor before the first CRAC trips. Counters are pre-bought (thermal storage tank, the boring
  hero), negotiated (the landlord's contract is now your attack surface), or load-shed (drop rows in
  priority order). The electrical twin of demand-curtailment. Colo, any district-connected DC.
  (wave3_sysadmin_informed)
- "The heat monster": heat spreads as a *field effect* across racks (a lava-puzzle); throttling is
  gradual, damage cumulative — raised floors, containment, and hot-aisle placement as the puzzle.
  (wave2_gamedesigner_fresh)
- Heat as a creeping red tide (GPU farms especially): one dead CRAC → neighbors work harder →
  cascade *unless* you load-shed — dropping customers, i.e. churn. A slow-burn threat that punishes
  overpacked racks. (wave2_general_fresh)
- Thermal events from neglect: dust clogs intakes, a fan dies, a CRAC faults — heat climbs, and you
  choose between throttling (slow customers) and shutdown (bounce customers); dust-filter cleaning
  is repeatable upkeep with escalating neglect. (wave2_sysadmin_fresh)
- The dew-point variant: cooling drift + humidity alarm — a condensation drip onto a busbar is *the
  short-circuit cinematic*. (wave3_sysadmin_fresh)
- The ~60s decision window: heat rises and you get about a minute to shed load — power-cycling
  servers is a strategic choice: *which customers do you sacrifice?* — before thermal shutdown takes
  them all. (wave4_general_fresh)
- Heat as a rising translucent orange gradient with visible convection curls; machines grow animated
  sweat drops and throttle by visibly slowing their activity animations before shutting; liquid
  cooling races coolant through clear pipes with a satisfying whoosh. (wave4_visual_fresh)
- Spatial-adjacency cascade: a hot rack heats its neighbors and cascades through cooling gaps —
  generators are emergency towers with fuel upkeep. (wave4_gamedesigner_fresh)

### Blanking Panel Neglect / Hot Aisle Recirculation
A slow, invisible efficiency drain.

**How it works:** Missing blanking panels raise inlet temps at the top of the rack; the top servers
run hotter and fail sooner. A "you didn't do the boring thing" debuff. **Makes physical placement
matter beyond adjacency.**

### Water Leak / Condensation / Puddle Creep
Water above or near electronics.

**How it works:** Damages a *region* of the floor, not a machine. Randomized location; punishes
putting all redundancy in one physical spot.
**⚔️ Correction — broaden the source list.** The most common cause is **not** the CRAC. It is **the
floor above** (a bathroom, a kitchen, a sprinkler, another tenant), followed by roof drains, clogged
condensate lines, a humidifier, and a chilled-water pipe. Make the *source* randomized and
diagnosable, because "where is this water coming from" is the actual gameplay — and the answer
determines whether you can even fix it. **You cannot fix the floor above; you can only place a tarp
and file a complaint.**
**Visual:** a slow water-droplet animation from a ceiling pipe, one drop every few seconds, landing on
a rack. You have N drops before something shorts. Tiny, cheap, memorable. At floor level: a
slow-spreading reflective puddle that is *beautiful* — it reflects the rack LEDs — and is death if it
reaches a power whip. Leak-detection rope is a visible bright cord along the floor that flashes where
it's wet.

### Fire, Fire Precursor, and Suppression Discharge
The suppression system is itself a hazard.

**How it works:** The gas dump produces an acoustic shock — **the high-velocity nozzle noise of an
inert-gas discharge is loud enough to crash hard drives.** (Real: ING Bank, 2016.) Absurd, true, and a
perfect game event: a discharge takes the room offline, so it's a partial loss either way — **your
safety system destroys your storage array.** Two refinements: it affects **spinning disks, not
solid-state**, which makes an all-flash rack an actual, purchasable, thematically perfect mitigation;
and add the **overpressure** problem — a gas dump into a sealed room can blow out wall panels and
ceiling tiles if the pressure-relief dampers are undersized, which is comedic and entirely real.
**Visual:** **The Ember** — VESDA detection drawn as tiny sniffer motes circulating the room; when
they find something they converge and glow, giving you a 20-second warning window drawn as a
tightening circle. **The White Out** — clean-agent discharge fills the room with white in 1.5 seconds
and everything in it becomes silhouettes, then a slow settle. Enormously dramatic, once per campaign
if you do it right, and a total-loss-avoided moment you'll remember.

**Variations and additions**

- **Opencode's treatment — Water / Fire / Halon one-shot hazards** — Random infrastructure
  catastrophes telegraphed by sensor towers — low frequency, high drama, insurance-selling events.
  Fire theater: gas pours from ceiling tiles and every staff avatar evacuates the aisle in single
  file — the danger zone announces itself with bodies, no UI ring needed. (gamedesigner, visual)
- Building Fire (late DC): a massive zone clear — the suppression system saves some servers and
  *drowns the others*; insurance-payout event follows. (wave4_general_fresh)

### Humidity / Static / Dust / The Grime Layer
Slow entropy taxes.

**How it works:** Too-low humidity = static discharge and rare random component death; too-high =
condensation. Dust buildup is a literal thermal debuff with a "filter cleaning" maintenance action;
**Dust Bunny Accumulation** slowly raises failure rates across a rack unless you spend hands on
maintenance — a chore system that can be automated away later. **Dust and Construction:** a
neighbouring build-out pushes particulates into your intake.
**Visual:** the **Entropy Dust** shader — unmaintained machines accumulate a fine grey layer and their
LEDs dim, so a neglected corner of your datacenter *literally looks neglected*. One shader parameter
carries a whole game system. In genuinely dirty facilities the **Grime Layer** goes further: the
accumulating overlay raises failure rates *and*, crucially, **makes everything harder to read** — the
art itself degrades, which is a brilliantly direct expression of the mechanic.

### Seismic / The Tremor
Regional, and the reason multi-region exists.

**How it works:** Rack anchoring becomes retroactively important.
**Visual:** screen shake with rack-top objects tipping; unanchored racks visibly **walk across the
floor.** Seismic bracing is a visible cross-brace that stops it.

### Weather, Storm, Flood, Lightning
Regional events telegraphed by a weather system on the map.

**How it works:** A storm takes a site offline and prevents physical access. Heat waves raise cooling
costs; storms threaten power; winter is free cooling; **the colour grade of the level carries an
economic variable.** Coastal sites take salt air and humidity; wildfire smoke clogs intake filters
(real); lightning brings a surge and a scary noise — and **a strike doesn't have to hit you**: a
nearby strike induces surges along copper runs, especially ones leaving your building to a dish, a
tower, or an outbuilding.
**Counter:** grounding and bonding, surge protection at every penetration, and **fibre instead of
copper for anything crossing a building boundary** — extremely real, cheap to build, and never bought.

### Kernel Panic / OOM Killer
Memory pressure; the kernel kills the largest process, which is always the database.

**How it works:** The OOM killer's heuristic targets the highest-scoring process, which is generally
**the one using the most memory, which is almost always the database** — so the victim is the thing
you least wanted to lose, every time, *by design*. Teaches headroom.
**The worse case, which is the better lesson:** the machine doesn't OOM-kill — it starts **swapping**,
and a swapping database is slower than a dead one but stays "up," so **your health check passes while
every request times out. Alive and useless is worse than dead** is one of the best lessons in
operations and it belongs somewhere in this game.
**Counter:** swap tuning, memory limits, `oom_score_adj`, cgroup limits, disabling overcommit — all
things you set *before* — or just buying RAM, the cheapest fix in the game and the one players will
still postpone.

### Inode Exhaustion
Disk shows 40% free; writes fail anyway.

**How it works:** A session directory has nine million tiny files. **The error message lies to you.** A
great "your dashboard is wrong" event, delivered perfectly in-fiction by an in-game `df -h`.

### Log Partition Full
The most boring outage in the world.

**How it works:** Someone left debug logging on; `/var` fills; services that can't write logs refuse to
start. **Your own monitoring fills the disk and takes the server down — your defenses killed you.**
Preventable with a two-dollar upgrade, and players will absolutely not buy it.
**Interacts with:** §2.9's Logging Loop (the self-amplifying spiral version).

### Weight Limits on Raised Floor
A joke that is also real, for battery strings and storage arrays.

**How it works:** **Give the joke one real job:** it is the constraint that forces battery strings and
dense storage arrays to ground-floor or slab positions, which means your UPS and your storage cannot
be near your compute, which means power runs are longer and **the failure domains overlap
differently.** One constraint, real spatial consequence, keeps the joke.

### The Hardware Lottery
Individual machines have hidden quality: a silent lemon, a golden sample.

**How it works:** Over time the lemon reveals itself through subtly worse metrics — and gets a
hand-written sticky note from your staff calling it cursed. Emergent superstition.
**⚔️ Fix — hidden quality with no counterplay is noise.** It makes telemetry unreliable without making
any decision more interesting. Add the counterplay that exists in reality: a **burn-in period** (run a
new machine at load for 24 in-game hours before putting customers on it — costs time, reveals the
lemon) and a **warranty claim** verb. Now it's a decision — "do I burn in, or do I need the capacity
today?" — instead of a dice roll.
**Interacts with:** §2.14's DOA Rate and burn-in bench, §2.14's Hardware Broker (which gives the
lottery an origin story).

### Physical: Someone Unplugs The Wrong Thing
Remote hands pulls A17-U22 instead of A17-U23.

**How it works:** A daily, expensive, entirely real problem.
**Counter:** **labelling** — a cheap buildable with an enormous payoff that nobody builds — plus
coloured cables, port blockers, and escorting.
**Interacts with:** §2.12's Ambiguous Remote Hands Request.

### Tape Library Robot Jam / Media Failure / The Arm Jam
Archival signature failure.

**How it works:** The robot arm drops or sticks with a cartridge in its grip; the library goes offline;
your backups silently stop and every restore queues behind it. Physical, comedic, and it blocks
everything until a hand fixes it.
**Visual:** a mechanical arm freezes mid-motion with a red fault light; everything queued behind it
stacks visibly; a tech has to walk in and open the library door. The whole vault stops.

---

## 2.9 Self-inflicted and operational failures

*Design note: this family should account for roughly **40% of all incidents**, because it does in
reality, and because it is the half of hosting no other game models.*

### Certificate Expiry / The Stale Seal
The single most common self-inflicted outage in the industry.

**How it works:** A visible countdown you can see for the entire campaign and will absolutely forget
about. When it fires, *every* visitor bounces at a scary browser warning — near-100% bounce, and it's
a **trust** failure not a speed failure, so the reputation hit is larger. A recurring timer on every
TLS-bearing object. A $0 problem that causes a total outage: beautifully stupid, deeply real.
**Counter:** ACME/auto-renewal — which must be an *unlock* the player earns after being burned at
least once — plus **expiry monitoring from outside** and staggered expiry dates. One of the best
"automate this and never think about it again" beats.
**Visual:** each TLS-bearing service wears a **padlock badge with a wax-seal ring** that drains like a
pie chart over the level, develops visible cracks at 30 days, crumbles at 7, and falls off at 0 — at
which point arriving visitors visibly *recoil* at the front door and turn around. No damage numbers
needed. **Expand:** at a facility with many certs the seals aggregate into a **ring of seals** on the
cert dashboard sorted by remaining life, so the next expiry is always the leftmost; and the
auto-renew's self-refilling seal should visibly refill **30 days early**, which teaches the actual
renewal window.
**Interacts with:** §2.19's Internal PKI Expiry — the internal certificate is the one that actually
takes you down.

### Let's Encrypt Rate Limit (the automation failure mode)
The auto-renewal you finally built loops on a broken domain and burns the weekly quota.

**How it works:** So the *other* renewals fail too. **The counter to a problem becomes the problem.**

### Missing Intermediate Chain
Works in every browser you test; fails in old clients and the payment gateway's callback.

**How it works:** Partial-failure threats are the best threats. **Your test is not the world.**
**Interacts with:** §2.19's TLS Deprecation Cutoff and OCSP Responder Outage, which generalise this
into a recurring, calendar-driven decision.

### DNSSEC Signing Expiry / Bad KSK Rollover
You don't get "degraded." You get a hard SERVFAIL for everybody with a validating resolver.

**How it works:** All or nothing.

### Domain Expiry / The Tumbleweed
Nobody renewed. The credit card on file at the registrar expired.

**How it works:** Total, instant, humiliating outage. Trivially preventable by an auto-renew purchase
that costs almost nothing and which players will absolutely not buy. Happens to billion-dollar
companies annually. The comedy layer: the renewal reminder went to a person who left.
**Visual:** the signpost at the map entrance (your domain name, drawn as a literal roadside sign) goes
blank and grey, and visitors pile up at the entrance milling in confusion. **Your buildings are fine
and nobody can find them.** Comedy and horror in one image. **Expand:** the milling visitors should
**thin out and stop arriving over about 20 seconds** rather than persisting, because that is what
actually happens, and the empty entrance with a blank sign is more devastating than a crowd. A
tumbleweed rolls past. Silent comedy horror.

### License Expiry
Software you depend on just stops.

**How it works:** Pure upkeep-forgetfulness punishment. Same widget family as the TLS wax seal.

### Expired Things (the whole calendar)
Certs, domains, credit cards, contracts, support entitlements, licences, API keys, DNSSEC keys, OAuth
secrets, and the corporate card that all the SaaS subscriptions are on.

**How it works:** There should be an entire **calendar** of these and a buildable — the **Expiry
Register** — that surfaces them in one place. It converts a category of pure gotcha into a boring,
satisfying, purchasable habit.
**Interacts with:** §2.14 The Expired Support Contract / Warranty Cliff.

**Variations and additions**

- **Opencode's treatment — The Expired-Cert / Expired-Domain / Forgotten-Account bomb** —
  Ticking-clock items you must inventory — the one thing nobody checks until the customer-facing
  page falls over at 2am. Visual: a little calendar icon above each service counting down, yellowing
  then reddening; renewal plays a satisfying seal-stamp. (sysadmin, visual)
- Every TLS endpoint carries a countdown; miss one and the browser-scare page bounces all its
  customers and tanks reputation — the ACME automation tower turns this from a chore into a
  *buildable problem*. (wave2_sysadmin_fresh)
- If the countdown hits zero, *the customers attack you* (broken trust flow); renewal is tedious
  upkeep by design — the ACME-bot automation tower solves it once, paid forward.
  (wave2_gamedesigner_fresh)
- The Ticking Clock Boss: a scheduled mid-level event if you ignored the little HUD countdown —
  every browser-scare popup fires at once, the trust meter plummets, customers stall at your gates.
  No counter, only *prevention* (auto-renew pre-buys time): the perfect "were you paying attention?"
  boss. (wave3_gamedesigner_fresh)
- Per-domain countdown bombs; expiry = customer browsers scream and churn spikes within minutes.
  (wave3_sysadmin_fresh)
- The SSLpocalypse expansion: expired cert, weak chain, missing SNI — the "silent timer" family that
  fires with no attacker at all. (wave4_sysadmin_fresh)
- Expired API key / token sibling: an integration credential lapses unnoticed — *partial*, not
  total, degradation (one partner feed, one webhook, one mobile push channel quietly dies) until a
  customer complains; counters: Credential Rotation Automation (§5) and expiry inventories with the
  same yellowing-calendar tell. (wave0)

### Bad Deploy / The Wrong Commit
Self-inflicted. Error rate spikes on release. **The single most common cause of real outages.**

**How it works:** Every change has a defect probability modified by testing, staging, canary, and
review buildables. Rollback costs time (and has a cooldown); forward-fix costs risk. Also costs
*internal trust*, which slows future shipping — a hidden velocity debuff. Tension: is it the deploy,
or a coincidental attack? Every deploy also busts the cache, creating a slow window — so **deploying
is a defensive vulnerability.** Reward slow rollouts by making fast rollouts occasionally
catastrophic.
**The shape that's missing — the deploy that only fails at scale.** It passed CI, it passed staging,
it passed canary at 1% — and it fails at 40% because the failure is a **resource exhaustion**
(connection pool, file descriptors, memory per worker) that only manifests above a threshold. This
makes canary deploys **necessary but not sufficient**, which is more honest than a framing where
canary basically solves it, and it introduces **progressive rollout with soak time** as the real
answer, at a patience cost.
**Counter:** staging with parity, canary deploys, progressive rollout with soak, immutable artifacts
(rollback only exists if you built them), a change-control board, a rollback button that is itself a
buildable.
**Visual:** deploys are drawn as coloured crates carried to nodes; a bad deploy is a crate whose
colour doesn't match, and as it rolls out the wave of wrong colour spreads while error particles
fountain from each converted node. **Rollback is the wave visibly reversing**, which is deeply
satisfying. A **version flag** flies up the flagpole on the affected service in a different colour;
rollback lowers it and raises the old one. **During a canary, two flags fly on the same pole**, the
new one smaller and lower; promoting raises it and lowers the old. **The entire deploy strategy is
legible as flag positions from across the room.**

**Variations and additions**

- **Opencode's treatment — The Bad Deploy (self-inflicted wave)** — The enemy you bring yourself:
  pushing a release to all units at once can fail *massively* — deploys are a small wave from your
  own HQ you can stage (canary = release 5% first; blue/green = parallel road; rollback = undo
  button with a cooldown). Failure converts level pressure onto yourself. Each patch/version bump
  carries a bug chance that releases a "500-error" gremlin (or a "regression" unit) inside your
  perimeter that degrades service until rollback; the rollback tower is undo insurance, and the
  staging buildable pre-rolls deploys and nullifies gremlins. Periodically you *must* ship (market
  pressure) — testing/pyramid towers are literally your roll modifiers. (wave1_gamedesigner_fresh,
  wave1_general_fresh, wave1_sysadmin_fresh, wave1_visual_fresh)
- The staging environment's real product is *information*: it shows you what WILL break before it
  breaks; change-freeze calendars guard revenue peaks. The threat is you. (wave2_ceo_fresh)
- Visual languages: a red pipeline animates across the map to every running service and a blob of
  pixel-goo drips onto whatever exists at deploy tick — rollback = the goo rewinds off in reverse,
  one of the game's most satisfying effects (wave1_visual_fresh); "Glitch Container": a shipping
  container rolls out of CI trailing red glitch cubes that corrupt any service they touch; rollback
  is a rewind VFX where the room briefly plays itself backward (wave2_visual_fresh); a green-to-red
  gradient rolls along the visible CI pipe; on production hit, assets *invert colors* and stutter;
  rollback = a 1-second time-scrub with VHS seek lines — comedic in dial-up, catastrophic in
  regulated (wave3_visual_fresh); "The falling release": a little cargo plane (CI pipeline) crosses
  the map dropping crates marked with the version number — occasionally one lands upside-down and
  unfolds into a gremlin that disables one feature flag at a time; the plane circles back and hooks
  it out (wave4_visual_fresh).
- Design hooks: every upgrade has a configurable QA level — fast & sloppy spawns the deploy-fail
  wave from your CI runner; rollback is an instant "undo a failure" *charge, limited per level —
  like a spell*. (wave3_gamedesigner_fresh)
- "Select all, push, oh no": the config-management tower that speeds your deploys *also automates
  your mistakes perfectly*. (wave3_sysadmin_fresh)
- Player-triggered dice: upgrading a service rolls; a "canary" buildable + "staged rollout" global
  tower removes the randomness — paying for safety with time. Teaches: upgrades are not free.
  (wave4_gamedesigner_fresh)
- Worst case: periodic "fat-finger" event where a staff unit destroys the wrong thing (rm -rf /
  prod); severity scales with the fatigue meter — counters are runbooks, blue-green, and permission
  tiers. "The most *realistic* boss." (wave4_general_fresh)

### Bad Config Push
Worse than a bad deploy, because config pushes are trusted, fast, and go everywhere.

**How it works:** The classic: a firewall/ACL change that **locks you out of your own management
network** from the connection you were using. Counter: out-of-band console/serial — which is only a
counter if it isn't cabled to the same switch (§2.7).
**Interacts with:** §2.17 The Config That Is Also Code.

### "It Was Fine In Staging"
A recurring incident class where the difference between staging and production is the root cause.

**How it works:** Data volume, cache warmth, network topology, TLS, a missing environment variable.
Investing in staging *parity* reduces its frequency.

### The `rm -rf` / Wrong-Environment Incident
A destructive command run against prod instead of staging.

**Counter:** different prompts and colours per environment, dual authorization, `--dry-run` defaults,
restricting who has prod access.

### Failed Rollback / The One-Way Door
You can deploy forward in 40 seconds, but rolling back requires a database migration that isn't
reversible.

**How it works:** Should be a real category of build decision: which of your changes are one-way
doors, and did you know before you opened them?
**Interacts with:** §2.19 HSTS Preload (the canonical multi-month one-way door).

### Migration Gone Wrong / Long ALTER TABLE Lock
A "small schema change" locks a 90GB table for 40 minutes at peak.

**How it works:** The site is up but frozen. **Deploys are threats.**

### Migration Corruption
A customer move that silently drops data; discovered days later.

**How it works:** The most reputation-destroying kind of migration failure because it is discovered by
the customer, not by you, and it is unrecoverable by the time it surfaces.

### Config Drift
Servers slowly diverge from each other.

**How it works:** Server 7 was hand-fixed during an incident and never re-templated; six months later
it's the one that breaks.
**Counter:** config management — which *itself* introduces a new threat: **a bad fleet-wide playbook
breaking all 40 boxes in nine seconds.** The canary/`--limit` upgrade reduces blast radius at the cost
of deploy speed.
**Expand the resolution, not just the problem.** Config management fixes drift **only for the things
it manages**, and the interesting failure lives in the 15% it doesn't: a hand-edited kernel parameter,
a firewall rule added during an incident, a package installed manually, a file the playbook doesn't
template. Add a per-machine **Managed Coverage** percentage, visible on the faceplate, so the player
can see that a "config-managed" fleet is 85% managed and that the drift lives in the gap. Pairs with
Boot Confidence — both measure "how much of this machine exists only in its running state."
**Visual:** machines that should be identical slowly acquire tiny differences — a different faceplate
sticker, a different LED pattern. **The Config Drift Freckle:** drifted nodes develop small
off-palette speckles, and a fleet with drift looks measurably *mangier*. The "fleet diff" overlay
renders the **modal** configuration as normal and every deviation with a **yellow dashed outline plus
a one-word delta label** (`kernel`, `sysctl`, `tls`, `hand-fixed`), and a machine that was hand-fixed
during an incident carries a small **sticky note** — the physical trace of the fix nobody
re-templated. Config management plays as a sweeping wave that visually re-syncs every faceplate.
Deeply satisfying.

**Variations and additions**

- **Opencode's treatment — Config Drift (the rot)** — Silent passive growth of attack surface over
  time (open ports, forgotten test VMs; a tower's range quietly shrinks) — "It Was Fine Yesterday."
  Untouched buildables' stats degrade unless patched: the anti-turtling/anti-greenery mechanic —
  your old towers rot, so you can't fully automate away maintenance and must spend continuously.
  Counters: config-management towers (Ansible-ish patrols), "reconciliation" daemons, audit sweeps
  (cost: staff time), monitoring that reveals drift lines. Visual: animated cobwebs and
  color-desaturation accumulate on neglected objects; a "maintenance pass" sweep clears them; webbed
  objects visibly under-perform when attacked. (wave2_gamedesigner_fresh, wave3_gamedesigner_fresh,
  wave3_general_fresh, wave4_gamedesigner_fresh, wave4_sysadmin_fresh, wave4_visual_fresh)
- The Config-Drift Moth: a small silent creature that nibbles exactly *one character per night* from
  a stored config — an indentation, a `0`→`O` — invisible until activation: a deploy, reboot, or
  autoscale event reads the nibbled file and the error blooms *then*, not at nibble-time. The horror
  is that the moth is harmless alone — it needs your own operations to detonate. Counter: the
  diff-overlay / known-good-ghost monitoring. Star of The Boring Level. (wave3_general_informed)
- Shadow IT variant: staff occasionally spin up an unauthorized quick-fix service — not forgotten,
  but *never approved* — silently increasing attack surface (and cost, see the "unknown shadow IT
  line item" late-game boss in §7); the drift scanner should catch what the org chart never saw.
  (wave0)

### Runaway Cron / Cron Storm
Everything scheduled at midnight fires at once, self-DDoSing. Or one job overlaps itself and
multiplies.

**How it works:** Visually: one unit that clones every few seconds until you notice.
**Counter:** **jitter** — a delightfully cheap and clever unlock; overlap locks; staggered scheduling.

**Variations and additions**

- **Opencode's treatment — Cron Storm** — 800 sites' nightly backups + stat reports all fire at
  03:00 on the same I/O bus — scheduled events cluster unless you add jitter. (wave3_sysadmin_fresh)

### Time-Bomb Cron
A yearly logrotate/cleanup job that deletes something important, written by someone who left in 2019.

### The Backup Window That Moved
Daylight saving time shifts your schedule. Your nightly backup now starts during the business day.

**How it works:** No failure, no alert — the job runs, succeeds, and **saturates your storage array for
four hours while customers are working.** Two days later someone connects the dots. Small, true,
perfect.

### The Logging Loop
A service logs an error, the log fills the disk, the disk-full causes errors, which are logged.

**How it works:** Self-amplifying. **Great visual: a spiral.**

### Redis maxmemory Eviction
Sessions were stored in the same cache as the page cache.

**How it works:** Cache pressure evicts session keys. **Every user is logged out mid-checkout. Nobody
alerts on it.**
**Interacts with:** §3.2 (the Returning Cart-Abandoner, who only comes back if session state
survived), §2.17 The Cache That Became A Database.

### Replication Lag / Silent Replica Drift
The replica has been subtly wrong for a month.

**How it works:** You find out when you promote it. At the visitor level, lag is a *correctness bug*:
a user writes then immediately reads and sees old data ("I placed my order and it's gone"). A subtle,
hard-to-diagnose bounce source.
**Counter:** checksum verification jobs (boring, essential); a "read-your-writes" routing upgrade.
**Visual:** a "lag cord" between primary and replica that **stretches visibly like a rubber band** as
replication falls behind.

### Split-Brain
Two primaries accept writes. Data is now in an unresolvable superposition.

**How it works:** The reconciliation minigame should be genuinely painful, and its outcomes should
*persist*: some customers permanently lose orders.
**Counter:** quorum/witness nodes and fencing (STONITH) — with flavour text about why it's called
"shoot the other node in the head."
**Visual:** two cluster halves each draw a full-strength "I am primary" crown. **Two crowns on screen
is the one visual the player learns to fear instantly.**

### Backup That Never Restored
The backup job has been "successful" for 14 months and has been writing a 4KB file.

**How it works:** Has been failing silently for six in-game months; only discovered at restore time.
**The game should let this happen.**
**Counter:** a **restore drill** — a recurring cost with zero visible benefit until the one day it's
everything. Give it a small visible "confidence" stat so the player has something to watch.
**Visual:** the backup node shows a green checkmark every night — but on inspection **the checkmark is
drawn slightly hollow.** A restore attempt reveals empty tape reels. A "verify backups" upgrade turns
hollow checks into solid ones. Teaching a real operational truth purely with a fill-vs-stroke
distinction.

**Variations and additions**

- **Opencode's treatment — The Backup That Doesn't Restore (passive threat)** — Untested backups are
  a hidden stat, revealed only when the restore is needed mid-crisis. (sysadmin)
- The Backup Window (its daily-torture sibling): every night the backup jobs saturate the shared
  production LAN and latency spikes 2am–4am; customers on scheduled jobs (trading, VoIP gateways,
  cron-driven B2B) notice. A recurring nightly mini-crisis *you caused*; counters: dedicated backup
  VLAN, a throttling dial (backup slow by day, risky by night — the RPO slider), dedup appliances.
  (wave2_sysadmin_informed)
- The Snapshot Time-Warp: restoring a stale VM snapshot replays the dead — the resurrected domain
  controller pushes old passwords and *breaks the forest*; the restored mail box re-sends Tuesday's
  newsletter to 400k; the restored payment worker double-charges yesterday's orders. Snapshots are
  saves *for your enemies*: every restore carries a divergence-damage roll scoped by what the box
  did since capture. Counters: journaling/idempotency guards, a snapshot-TTL dial, application-aware
  quiescing (the expensive correct play). VPS/k8s/SaaS. (wave3_sysadmin_informed)
- On restore, untested backups carry a *failure roll* (boring-but-true!); testing restores costs
  bandwidth + staff time; immutable/snapshot tiers lower the fumble chance. (wave2_sysadmin_fresh)
- The 0-byte success that reported fine for months — test-restore jobs convert the hidden state into
  known state; the DR-audit buildable exists precisely because this event ends companies.
  (wave3_sysadmin_fresh, wave3_ceo_fresh)
- Backup Storage Overflow: an over-successful "keep everything forever" policy eventually fills
  storage and starts *silently failing new backups* unless a retention policy exists (§5 Backup
  Retention Policy Tool) — the success-side twin of the untested restore. (wave0)

### Monitoring Blind Spot
The new service was never added to monitoring.

**How it works:** It's been down for three days. Nobody noticed because customers assumed it was
supposed to be like that.

### The Monitoring Server Dies
Everything is green, forever.

**How it works:** A meta-threat of the highest order.
**Counter:** a dead-man's-switch / external heartbeat.
**Interacts with:** §2.22, where this is the founding member of the HUD-attack family.

### The Alerting Path Dependency
A meta-failure one level above the monitoring server dying: **you lose the ability to know about
failures.**

**How it works:** Your alerting emails route through the mail server that is down. Your paging
integration is hosted on the cloud region that failed. Your on-call phone has no signal inside the
datacenter.
**Counter:** an out-of-band alerting path — a second provider, an SMS gateway, a physical siren — and
**a periodic test that proves it works.**

### Alert Fatigue
A flapping check has cried wolf 400 times.

**How it works:** You can tune alert thresholds: too tight = noise, too loose = missed incidents.
Self-inflicted difficulty. **An IDS is a tower that can be over-levelled into uselessness**, and a
monitoring system can be so noisy it's worse than none. Mechanically, staff response time to a *real*
alert degrades as low-value alerts accumulate.
**⚔️ Fix — the game must never hide; it collapses.** Wave-1's "the game literally starts hiding or
dimming alerts the player has repeatedly dismissed, and then hides the real one" will read as a bug,
not a mechanic, and it violates the fairness contract. Two compatible corrections:
*(a)* A suppressed group shows as `▸ 41 suppressed` with the real one **inside it**, expandable at the
cost of attention. The failure is that the player didn't expand it — their choice, exactly what
happens in reality, and fair.
*(b)* Make the fatigue **visible before it bites**: a **Signal-to-Noise meter** on the alert stack
that degrades as you dismiss repeats, with the dimming applied as a visible grey wash and a count
("14 alerts suppressed by fatigue"). Then, when the real one is in there, the loss is legible.
Additionally, make the noise **source-attributable**: a flapping check should be identifiable and
mutable in two clicks, so the counter is always available.
**The cure operators actually use, which the design omits: alert on symptoms, not causes.** A page
should fire for "checkout success rate is below 98%" (one alert, always meaningful) rather than "CPU
on web07 above 90%" (forty alerts, usually meaningless). Model this as an **alert-authoring choice**:
symptom-based alerts are fewer and higher-signal **but give you less information about where the
problem is**, so they require better diagnostic tooling downstream. Fewer better alerts in exchange
for more diagnostic work is a genuinely good decision the player should get to make.
**Counter:** alert tuning, severity tiers, dependency-aware suppression ("don't page me about 40
children of a dead router").

**Variations and additions**

- **Opencode's treatment — Alert Fatigue / Monitoring Blindness** — The monitor goes down (or gets
  ignored) and the next attack looks like status quo — blindness is a debuff; a full fatigue meter
  mutes *real* alerts for a stretch. Full treatment as a core mechanic in §8. (sysadmin)
- The full loop spec: meter fills +X per false positive, decays −Y per quiet minute; at 80% real
  alerts arrive muted/greyed (you must *open* them to see severity — the pun is the play); at 100%,
  a one-wave blackout of all alerting. Counters: threshold tuning (a WAF-like dial with a
  false-negative tax), the correlation engine (the log-flood answer), and the monitoring upgrade
  "alert routing by severity". (wave2_general_informed)
- The attention drain: dying hardware that alerts fire/clear endlessly on intermittent loss quietly
  consumes the *attention resource* until something real slips through. (wave2_sysadmin_fresh)
- "The Fog" (meta-threat aimed at the player): a soft purple fog thickens over the HUD itself as you
  skip rest/redundancy, slowing interactions until on-call staff are hired — a late-game
  systems-design joke. (wave2_visual_fresh)
- The aggressive cousin — Monitoring Blackout: an attacker (or a failure) kills your monitoring
  *first* so they're invisible; the blindness hides the real attack wave. Late/regulated.
  (wave4_sysadmin_fresh)
- Log-Flood Fogging: the passive cousin weaponized — the attacker's opening move generates mountains
  of *harmless* alerts so the real intrusion's one true signal drowns in noise. A debuff-unit that
  damages nothing but *raises your alert-fatigue meter on purpose*, muting real tower warnings for a
  window (then the SQLi serpent walks through the silence). Counters: alert-prioritization (a
  correlation engine = a tower that silences its neighbors to amplify one), log sampling, and the
  "two-person rule" to actually *believe* a single screaming alert. Pairs with any boss.
  (wave2_general_informed)

### The Alert That Fires Correctly And Means Nothing
A specific, common failure of alerting.

**How it works:** A threshold alert that has fired daily for a year because the threshold was set for
a smaller system. It is *correct* and *useless*. **The counter is not tuning the alert but re-deriving
the threshold from the current baseline**, which is a different action and a different lesson.
**Interacts with:** The Rate Limit You Set, below — the same rot in a different system.

### The Ticket Avalanche / The Ticket Hydra
Any visible incident generates support tickets at a rate proportional to customer count.

**How it works:** Tickets consume staff. Staff consumed by tickets can't fix the incident. **A genuine
doom-loop that attacks your response capacity** — the most authentic and most mechanically interesting
kind of cascade, and the purest **Attention damage** in the game: the attacker's real goal is to
occupy the player's hands.
**Model it explicitly:** ticket volume = **severity × customers × communication quality**, with a lag
proportional to your customer base's sophistication. A 40-minute outage with a proactive status-page
post and an email generates a *fraction* of the tickets of a 10-minute outage with silence. That
formula is the entire argument for the status page, and right now it's asserted rather than modelled.
**Counter:** status pages, proactive comms, a knowledge base, deflection, hiring support.
**Visual:** the support queue as a physical in-tray; during an outage paper slips *rain* in faster than
staff can pull them and the tray visibly overflows onto the floor. Hiring support adds more hands
reaching in. No numbers needed. **Slips on the floor are stepped on by passing staff** — a tiny detail
that will make support people wince. The Hydra reading: a stack of tickets that grows a new head every
time one is answered *badly*; the stack gets taller and more crooked, and when it topples you get a
churn event. Good support staff cut heads off cleanly; bad ones split them.

**Variations and additions**

- **Opencode's treatment — The Ticket Avalanche** — Support tickets spawn from every minor incident;
  unattended they escalate (SLA strikes + churn). Support-desk towers convert tickets→goodwill, but
  the queue is a *second TD lane* — tickets literally stream across the office floorplan to your
  help desk. The Support-Bomb Customer variant: one enterprise tenant's team files 400 low-severity
  tickets/month, saturating your staff and delaying everyone's real incidents — does contract
  language (ticket caps) beat relationship management? And the Support Burnout Wave: volume
  sustained above staffing health → response times spiral → agent resignations (slow!) → knowledge
  drains → death spiral; counters: deflection (KB, community), chatbots (a churn tax), hiring
  lead-time buffers, follow-the-sun rotation, and paying L2s enough — "the most human threat in the
  game." (wave3_gamedesigner_fresh, wave1_ceo_fresh, wave4_ceo_fresh)
- Ticket Denial-of-Staff (the family graduated): a flood of plausible-but-worthless tickets
  *physically occupies staff sprites*, locking the repair/heal economy exactly when entropy spikes.
  Counters: auto-response towers, a triage minigame (label real vs. noise under time pressure), and
  support staffing itself. The "attack your back office" family. (wave2_gamedesigner_informed)

### Support Queue Collapse
Tickets exceed capacity; unanswered tickets convert **directly** into churn and public reviews.

**How it works:** The terminal state of the avalanche, and the reason support headcount is a defensive
purchase rather than a cost centre.

### Fat-Finger
Mistakes as a mechanic.

**How it works (wave-1):** When the player performs a manual action under high stress (lots happening
on screen), a small chance the action targets the wrong node. Reduced by change-control tech and by
*not doing risky things during incidents* — i.e. the game teaches change windows by punishing cowboy
ops. Scales down with training, runbooks, and change review, which cost time. **The game's way of
pricing process.**
**⚔️ Fix — make the mistake a decision, not a die roll.** A hidden random chance that a manual action
targets the wrong node is invisible, unavoidable, and punishes engagement. Replace it with a
*visible, avoidable* version: under high alert density, high-risk actions gain a **confirmation step
showing the target's name and blast radius**, which costs 1.5 seconds. **Skipping confirmation is a
setting the player can turn off.** Now the mistake is a decision the player made about speed versus
care, which is the actual lesson.

**Variations and additions**

- **Opencode's treatment — Human Error (Your Own)** — Wrong-host commands, a bad firewall rule
  lockout, dropping prod — one wrong line in an ACL opens the network. Mechanic: destructive actions
  need a confirmation mini-game whose difficulty scales with the fatigue meter; it *cannot be
  unlocked away*, only mitigated (peer-review staff, IaC, dry-run mode). "The final boss everyone
  recognizes." (wave2_sysadmin_fresh, wave4_sysadmin_fresh)

### The Fix That Causes The Outage
Remediation as a threat.

**How it works:** ~30% of remediation actions should have a chance to make things worse, scaled by how
tired and panicked the team is. Pairs directly with the Second Incident rule (§2.1) and with Staff
Burnout below.

### The Reconciliation Loop That Won't Stop
Automation as a threat in its own right. (See §2.17.)

### The Helpful Vendor
A support tech remotely "fixes" something and breaks another thing.

### Capacity Creep
Not an event; a trend.

**How it works:** Your customers' usage grows ~3% a week forever. The quiet threat that turns a
comfortable board into a critical one if you stop paying attention.

### Capacity Misjudgment / Forecast Miss
You sized for average, got peak — or you ordered too late and the lead time is longer than your
runway.

**Interacts with:** §2.14 Lead-Time Inflation and Allocation.

### The Rate Limit You Set
Your old defenses should occasionally become your new problems.

**How it works:** A defense you deployed months ago is now blocking a legitimate growing customer.
Pairs with the firewall rule with a zero hit-counter that you delete — and which turns out to be the
one that only mattered in December.
**Systematise it:** every tuned threshold carries a **fit indicator** — green while your traffic
profile matches what it was tuned against, amber as the profile drifts, red when it's actively
blocking growth. A **Tuning Review** action (cheap, peacetime) surfaces all drifted thresholds at
once. Now old decisions rot *legibly*, and there's a boring, satisfying maintenance verb for it.

### fail2ban Self-DoS
A legitimate NAT'd office of 200 users trips the threshold and the whole company is banned.

**How it works:** The cheap early defense that is extremely satisfying to watch, until it eats a
customer.
**Interacts with:** §2.23, the Overcorrection family.

### Your Own Scanner Got You Blacklisted
The defence that looks like an attack.

**How it works:** You run a vulnerability scanner across your estate; it touches customer IPs; abuse
complaints arrive at your upstream **about you.**
**Counter:** scan windows, source-IP declaration, a published scanning policy, and telling your
upstream first. A small, funny, extremely real own-goal.

### The Compliance Scan That Took You Down
Your own quarterly vulnerability scan — mandated, scheduled, contracted — knocks over a fragile
service.

**How it works:** An authenticated ASV scan opens thousands of connections, fuzzes inputs, and
triggers a code path nobody has executed since 2016. **The only attack in the game you paid for,
scheduled, and cannot cancel without failing an audit.**
**Counter:** scan a staging replica (which fails the audit unless it is in scope), throttle the scan
(the vendor must agree), or fix the fragile service.

### Staff Burnout
Too many incidents, too little rest.

**How it works:** A named engineer who has been on-call for three straight incidents starts making
mistakes (increased chance of a bad change), gets slower, then quits — taking **tribal knowledge**
with them. Documented systems are unaffected; undocumented ones become partially fogged again. **Your
team is a resource that can be strip-mined.** Every 3am page raises fatigue. Burnout as a resource
meter is the truest hosting mechanic there is.
**Visual:** fatigue is a **Halo**, not a Ring (rings mean *time running out*), and **posture carries
the primary read** — the Fatigue Posture Ladder does the work at a glance.
**Interacts with:** §4.8, §7.6 (fog), §5 (documentation), §2.17 The Staffing Dispute (the collective
version).

### Key Person Risk / Bus Factor 1
One staff member is the only one who knows how a system works.

**How it works:** Visually marked. If they leave, that system becomes an "Acquisition"-style mystery
box. The vacation variant: when a key engineer is away, their subsystem's response times double —
"nobody may touch prod while Dave is at the beach." Forcing people to take vacation *and surviving
it* is a resilience test, exactly like real cross-training. If they're on leave, certain repairs are
simply unavailable.
**Interacts with:** §2.17 The Employee Who Automated Themselves Into Load-Bearing, The Founder's Bad
Week.

### Documentation Rot
Stale runbooks send you confidently in the wrong direction.

**How it works (wave-1):** Runbooks visibly yellow and fade over time; maintenance of knowledge as
upkeep.
**⚔️ Fix — rot at the library level, and make stale docs *slower*, not *wrong*.** Per-document rot
creates a chore loop across dozens of runbooks. Use a single **Documentation Freshness** stat,
decaying ~4%/month, refreshed in one action (a doc day) or passively by drills that exercise the
relevant procedure. And a stale runbook should cost **time**, not correctness: *actively harmful
documentation is a punishment that teaches "don't write documentation,"* which is the opposite of the
intended lesson.

**Variations and additions**

- **Opencode's treatment — Stale Documentation** — Runbooks/configs never updated after a system
  changed actively make incident response *slower and more wrong* than having no documentation at
  all — a "false confidence" threat (the off-shift AI, §1's On-Call Rotation level, follows the lie
  literally); countered by the Documentation Culture unlock (§6) and pair with the Bus Factor stat
  (§10). (wave0)

### The Undocumented Dependency
Some connections on the map are hidden until they break.

**How it works:** You decommission an "unused" server and three unrelated services die because it was
quietly running the internal DNS secondary. Revealed in the post-mortem. Discoverable in advance via
investigation/documentation spend — which is what makes documentation *pay*.

### The Correlated Failure (meta-threat)
Two things that *look* independent fail together because they share something you forgot.

**How it works:** Same power feed, same firmware, same expiry date, same upstream, same rack, same
human. The visual payoff is the post-mortem overlay drawing the hidden shared dependency in bright
white — **the "oh, THAT's why" line. This should be the game's signature learning moment.**
**The image, specified (this is the highest-value visual gap in §2 and should be built first):** in
the postmortem overlay the world desaturates completely except for the two failed objects (red) and
**a single bright white line** drawn between them *through whatever they shared* — down to the PDU,
back to the same firmware build, out to the same upstream, or up to the same person's avatar. The line
draws itself in one second with a rising tone. It should be the only pure white thing on screen (the
Hue Ledger reserves white for player intent; this is the earned exception).
**Interacts with:** §2.17's Correlation Score, which turns this from an event into a stat you can
watch and choose to accept.

**Variations and additions**

- **Opencode's treatment — Cascading Failure / the Domino Outage** — Any destroyed or overloaded
  node shifts load onto its neighbors — the real threat model is *failure topology*: design with
  n+1/n+2 or watch a single disk failure ripple-kill the whole DC. The level-wide event lights
  domino lines across a visible dependency graph; the counter is bulkheads/cell architecture —
  buildable geometry that *pre-cuts the domino lines*. Punishes single points of failure across the
  whole map; "best mid-to-late lesson of the whole game." (wave3_gamedesigner_fresh,
  wave4_gamedesigner_fresh, wave4_sysadmin_fresh)
- Cascading Retry Storm sub-form: when one backend slows, upstream clients *retrying aggressively*
  multiply the load on it — the domino line carries more traffic per hop; countered by
  backoff/jitter logic (§5 Backoff/Retry Module), not raw capacity. (wave0)
- The Migraine (self-inflicted traffic): not an enemy — when your own architecture has too many
  inline hops or circular links, your services start rate-limiting *each other*: a grey
  headache-creature that spawns from your own spaghetti and eats capacity (n+1 request
  amplification, the exact real-ops symptom). Counters: flattening the path, caching, service
  consolidation. The game punishing bad topology. (wave2_gamedesigner_informed)
- Health-Check Suicide (the recovery ambush): after failover your own LB hammers the cold, unwarmed
  backend → it's slow → marked DOWN again → neighbors absorb its load → cascade. The *cure* becomes
  a wave; counters: slow-start ramps, warming periods, circuit breakers — "bring a node back"
  becomes a mini-action with a slider, which is 100% how it feels on call. All multi-node types.
  (wave2_sysadmin_informed)
- The Shepherd's Dog (management-plane thundering herd): monitoring agents, config pollers, backup
  jobs, and patch robots all point at the same collectors; when one stutters, the fleet retries *in
  lockstep* — a self-inflicted 1000× re-poll storm that kills the one plane you need to *see* the
  incident. Jitter the poll, serialize the retry, rate-limit your OWN friends; during the storm
  dashboards go stale and alert fatigue spikes on *false silence* — losing telemetry is itself a
  threat-class event. All at fleet scale. (wave3_sysadmin_informed)

### Vendor EOL
Your favourite piece of hardware/software goes unsupported.

**How it works:** It keeps working but stops receiving patches, gradually raising its vulnerability
rating until it becomes a liability. Forces continuous modernization spending. Support ends; you are
forced to migrate or accept rising failure odds.
**Interacts with:** §2.17 The Acquired Vendor (the version where the product still exists and just
quietly stopped being good — a different and nastier shape).

### The Demo That Matters
A prospect tours during an incident.

**How it works:** Pure bad luck with a real revenue consequence, and one of the few threats that makes
the player want a *presentable* facility rather than merely a working one.

### The Customer Who Lies
They swear they didn't change anything. They changed something.

**How it works:** Investigating costs time; believing them costs more. A recurring diagnostic tax with
a comedy face.

### The Uninterpretable Log Line
Occasionally a log message appears that means nothing to anyone.

**How it works:** Unrelated to the incident, has appeared in every log since 2011, can never be fixed.
It's just there. Forever.
**Give it exactly one mechanical job, once per campaign:** it is the **control condition for red
herrings** — the game's way of teaching that not every anomaly is a cause. And at one specific late
moment it turns out to matter, which makes the joke land twice.

### Honeypot Go-Wrong
Even your deceptions can turn: an unpatched honeypot occasionally *walks out* as a threat.
(gamedesigner)

**Variations and additions**

- Honeypots as double-duty economy: they can supply zero-day intel (the counter before the patch) —
  and script-kiddie waves get baited by honeypot decoys drawn as irresistible glitchy treasure
  chests. (wave3_gamedesigner_fresh, wave2_visual_fresh)

---

## 2.10 Business, financial, and reputational threats

*Design rule for this family: every threat's damage is expressed in **money and reputation**, not HP.
"Server down" is not damage; the causal chain is the damage.*

### The SLA credit magnitude correction (read this before pricing any outage)
**⚔️ Tension:** wave-1's framing example — "server down → 40 min SLA breach → $1,900 credits → 6
refund requests → 3 cancellations → one 1-star review" — is the one number in §2.10 a real operator
would push back on.

**How it works:** Standard SLAs cap credits at **100% of one month's MRC** for that service, are
issued as **service credits, not cash**, must be **claimed by the customer within a short window**
(most don't), and **exclude announced maintenance, customer-caused issues, and upstream/force-majeure
events.** So a 40-minute outage on a $500/mo customer usually costs about **$25** in credits, and
often **$0** because nobody filed. **The real damage of that outage is: three support hours, one
grudge tick, a ~4% higher probability of churn at renewal, a discount concession at the next QBR, and
a sentence in a review.** Rewrite the causal chain to lead with churn and concession, and make SLA
credits *deliberately* small — **the gap between "my SLA says 99.9%" and "my credit exposure is
trivial" is itself one of the most useful things a player can learn.**

### Business threats must consume a hand
A shared mechanical shape for the whole family.

**How it works:** These entries are excellent and almost all resolve as "a number goes down," which
*happens* rather than *plays*. **Every business threat should arrive as an Inbox card with 2–3
responses, at least one of which costs a hand.** Making business threats consume attention is what
couples the two halves of the game; right now the ops layer and the business layer never compete for
the same resource, which is the single biggest missed opportunity in the design.

### The Chargeback Swarm
Fast, small, numerous units that slip past your perimeter and hit your *bank account*.

**How it works:** Each costs the revenue **plus** a $15–25 fee **plus** a tick on your chargeback
ratio. Fraudulent signups pay with stolen cards; months later the chargebacks hit. Hits game-server
and bulletproof hosting hardest.
**Counter:** fraud scoring at signup (reduces conversion), a 3-D Secure gate (adds friction, converts
fewer customers), prepay/crypto (reduces addressable market), a manual review desk (staff cost), a
visible refund policy, and a "call before you chargeback" support banner. **And the counter nobody
thinks of: a recognizable billing descriptor and a working phone number**, which measurably reduce
chargebacks because a large share of disputes are simply customers who don't recognize the charge. A
$0 fix with a real effect is exactly the kind of thing this game should reward.
**Visual:** small paper receipts that flutter *out* of your bank vault, not in from the lanes. **They
attack from the inside.** Or **The Chargeback Crow**: a bird lands on a paid invoice, pecks the gold
off it, and flies away. Fraud screening is drawn as a scarecrow.

**Variations and additions**

- **Opencode's treatment — Chargeback Artists & Fraud Bots** — At checkout (the level's "core"),
  fake customers *pay and reverse* — your revenue ledger flickers; a fraud-scoring gate can block
  them but occasionally eats real whales. The economy-floor threat. (gamedesigner)
- The processor-account angle: each dispute costs a $15-25 fee, and if your ratio crosses the
  card-network threshold you lose merchant processing — a *soft game-over*. Counters: AVS/3DS
  checks, clear descriptors, dunning emails. (wave1_ceo_fresh)
- The Chargeback Avalanche: a fraud ring signs up 300 prepaid accounts with stolen cards — product
  ships (GPU hours burn), then disputes rain; worst case, no revenue collection at all for N days.
  Counters: fraud-screening buildable (velocity checks, CVV/3DS) + a card-brand-thresholds meter.
  (wave2_ceo_fresh)
- The meter, encoded for real: disputes/transactions >1% = fee assessments; >2% = "excessive" →
  processor fines; sustained = *merchant-account termination = inability to accept cards =
  effectively a loss condition within weeks* (VMSS/EARP monitoring programs with 65/90-day cure
  windows). Events that spike it: confusing billing descriptors, surprise renewal charges, a viral
  "they won't refund me" TikTok. (wave3_ceo_fresh, wave4_ceo_fresh)
- The fraud-ring consumption variant: fake customers sign up, pay, reverse — *while consuming
  resources*; your revenue meter lied to you. Counters: payment verification, deposits.
  (wave4_general_fresh)
- Fraud-scoring at the checkpoint has a UX tax: filter hard and some legit customers bounce — a
  money-threat with a conversion tradeoff. (wave2_general_fresh)

### Processor Termination
Not a unit — a *boss trigger*.

**How it works:** Your payment processor drops you and **all card revenue stops.** You must scramble
to a high-risk processor at 2× the rate. The most terrifying business event in hosting and almost
never depicted anywhere.
**⚔️ Correct the trigger detail — it is not "1% for two months."** The card networks' excessive-dispute
programs threshold on **a combination of dispute ratio (~0.9–1.0%) and absolute dispute count (~100 a
month)**, which means a small merchant with a high ratio may be fine and a large one with a modest
ratio may not. **Fraud ratio and dispute ratio are tracked separately.** And your ratio is computed
against the *current* month's volume — **a beautiful trap: cutting marketing during a chargeback
crisis makes the ratio worse.** Finally, enrolment isn't instant termination: there's a **monitoring
program with monthly fines and a remediation window**, which is *better gameplay* — a visible
escalation ladder with a countdown rather than a cliff.

### Rolling Reserve Imposition
A processor risk-review outcome far more common than termination and far less known.

**How it works:** Triggered by chargeback-ratio drift, a **revenue spike (growth looks like fraud)**, a
category reclassification, or one customer's industry. The processor withholds **5–20% of settlements
for 90–180 days. Revenue unchanged, cash down immediately**, and the held balance only unwinds if you
keep processing — **if you switch processors, the old one holds your reserve for the full term
anyway.**
**Counter:** ACH/wire migration, an annual-prepay push, a second acquirer under a second entity, a
cash buffer, invoicing larger customers, and chargeback-prevention alert services that refund before
the dispute posts.
**Visual:** a locked cage inside your vault holding a visible slice of every incoming coin.

**Variations and additions**

- **Opencode's treatment — Payment-Processor Freeze** — After a complaint spike or a "high-risk"
  reclassification, your merchant account holds reserves: cash inflow stops for a period, payroll
  and bandwidth invoices don't. Escapes: multiple processors (redundancy buildable), invoicing/ACH
  for enterprise — or the offshore-rails temptation. (wave2_ceo_fresh)

### Merchant Category Reclassification / Debanking
Your bank or processor decides what industry you're in, and they're not wrong.

**How it works:** One line of business (bulletproof, crypto-adjacent, adult, streaming, "unlimited
seedbox") reclassifies your **whole entity** as high-risk. Rates go from 2.9% to 4.5–6%, reserves
appear, and eventually the bank exits. **The counter is structural, not operational: separate legal
entities per risk class** — a buildable the player will not think to build until after this has
happened once.
**Interacts with:** §1.3 bulletproof, the Entity & Ring-Fence buildable, §2.11 The Bank.

### Involuntary Churn / The Expired Card Ghost
A slow, silent drain of customers who *want* to stay.

**How it works:** Their cards expired. Typically **20–40% of all churn** in a real host, and 100%
preventable. Invisible unless you build the **Dunning Engine**. The cheapest-ROI, least-glamorous,
highest-value feature in any subscription business.
**The lever detail, so the Dunning Engine has depth rather than being a binary purchase:** **5–9% of
active card subscriptions fail in a given month**; naive retries recover ~20%; **smart retry timing**
(avoid the 1st, retry after payday, respect issuer decline codes) recovers **40–55%**; card-account
updater services add **10–20 points**; pre-expiry emails add a few more; **a backup payment method on
file is the single biggest factor.** And **hard declines and soft declines need different treatment** —
retrying a hard decline repeatedly gets you flagged by the card networks. That last one makes dunning
a *tunable* system rather than a switch.

### Bad Debt Creep / The Deadbeat Cohort
Customers who use the service and don't pay.

**How it works:** Grows quietly in the background. Aging buckets: 15/30/60/90 days. You choose
suspend/terminate timing via a **suspension policy slider**: aggressive = less bad debt, more churn
and PR risk; suspend too early = bad reviews; too late = free hosting for freeloaders. A
**Collections** desk converts aged receivables to cash at a discount.

**Variations and additions**

- **Opencode's treatment — Bad-Debt Wave** — In economic-downturn scenario levels, a % of SMB
  customers' cards start declining: they churn, then charge back, then vanish owing invoices.
  Counters: dunning automation, credit limits, prepay push; the decision is write-off (recover 30%)
  vs. suspension (lose them faster). (wave3_ceo_fresh)
- The Wraith form: unpaid enterprise invoices age on the receivables shelf; at 90 days a wraith
  detaches and haunts your cash bar (DSO literally rises). Middle path beyond write-off/suspension:
  collections agency (recovers 40-70% for a fee and a customer you'll never win back) or a payment
  plan; net-90 terms as a difficulty modifier. (wave2_ceo_informed)

### DSO Drift (Days Sales Outstanding)
Enterprise customers pay net-60 and then net-90.

**How it works:** Your revenue chart looks great; your bank account doesn't. **Your best revenue
becomes your worst cash.**
**Counter:** early-pay discounts (2/10 net 30), factoring (expensive), deposits.

**Variations and additions**

- **Opencode's treatment — The Payment Plan Proliferation Trap** — Not a monster threat but a slow
  leak: net-60 enterprise terms, installment billing, and customer-financed pilots quietly stretch
  DSO (days sales outstanding); cash conversion cycle goes negative and you need a line of credit.
  Visualized as growing "paper" in the money lane. (wave4_ceo_fresh)

### Deferred-Revenue Sinkhole
You sold 500 annual plans and spent the cash on servers.

**How it works:** Now you owe 11 months of service with no incoming cash.
**The second-order effect:** annual prepay also **makes your churn number lie.** Customers who have
mentally quit stay on the books for up to 11 more months, so measured monthly churn looks fantastic
right up until the renewal cohort lands. **The Cohort View is the instrument that catches this**,
which gives that feature a specific job.
**Visual:** a **hole under your bank vault** that grows every time you celebrate an annual sale.

### The Refund Wave / The Refund Cascade
A refund request from one customer *inspires* neighbours.

**How it works:** A contagion mechanic where refund units spawn adjacent refund units unless
intercepted by a well-written incident communication. Separately, a **30-day money-back guarantee is
a marketing weapon and a cash bomb**: a bad month of quality shows up as refunds 30 days later,
*after* you already spent the ad money.
**The death spiral version:** an outage triggers SLA credits → credits trigger a cash crunch → the
crunch prevents the fix → the absence of the fix causes another outage. The game should let the player
**see it coming and fight out of it.**

### The Unbilled Upgrade
A specific, funny, very real instance of revenue leakage.

**How it works:** A support engineer helpfully doubles a customer's RAM during an incident and never
opens a billing change. Eleven months later you find it. Now what — backbill (they'll dispute and
you'll look incompetent), start billing forward (an awkward email), or eat it? **The correct answer is
almost always to eat it and fix the process**, and the game should make eating it cost real money so
the *process* fix feels earned.

### Billing Failure → the Billing Run as a scheduled high-risk event
Your payment processor has an outage; MRR doesn't collect this cycle.

**How it works (wave-1):** A cash crunch with no combat cause.
**Expand it into the full event.** The **monthly billing run** deserves to be a recurring scheduled
event on the calendar with its own failure table, exactly like a deploy. It can fail **partially**
(some customers billed twice — catastrophic and very real), **silently** (a plan's price didn't
update), **against stale usage data** (a metering blackout), or **correctly, and generate 200 tickets
because you changed the invoice template.**
**Visual:** a client's payment method fails as a small credit-card glyph with a red corner-fold over
their icon; if unaddressed, their services grey out. Rendering money problems *on top of the
infrastructure* keeps the business layer spatially present.

### Currency & Cross-Border Drag / Tax Nexus Creep / Tax Assessment
Paperwork threats that arrive as letters, not monsters.

**How it works:** FX moves and your payment provider takes 3–4% on conversion — a small permanent
nibble that only shows up if you look. Selling into enough jurisdictions triggers VAT/GST registration
obligations, costing money and an accountant. And a jurisdiction can decide your service is taxable
**retroactively**, which is a lump-sum cash hit with no warning.

**Variations and additions**

- **Opencode's treatment — The Tax/Compliance Auditor** — End-of-year event: nexus across
  states/countries (you resold in 30 jurisdictions!), VAT collection errors, a "digital services
  tax" surprise bill — a quiet boss-fight of bookkeeping you either built toward (billing-system
  upgrades) or eat a penalty from. (wave2_ceo_fresh)

### FX Collapse in a Priced Market
You priced in local currency to win a market.

**How it works:** The currency moves 35%. Your revenue in that market, converted home, drops by a
third while your costs (hardware, transit, licences — all USD) don't move. Choices: **reprice** (churn
the market you just bought), **hedge** (costs money, needs volume), **exit** (write off the CAC), or
**eat it.**

**Variations and additions**

- **Opencode's treatment — FX Shock / Repatriation Squeeze** — With international entities (the §6
  multi-currency unlocks), revenue arrives in multiple currencies; a parity swing event can erase a
  quarter's margin on unhedged books. Hedging = a late-game finance buildable. Niche, but no other
  TD touches it. (wave2_ceo_informed)

### The Reddit Thread / The Viral Post / The Review Bomb
A single post titled "PSA: do not host with ___", or a coordinated wave of 1-star reviews.

**How it works:** Spawns a *stream* of visitors who now bounce at your landing page; reduces signup
lane throughput by **20–60% for N days**, scaling with how visible your brand is. Some reviews are
real (from your outage), some astroturfed by a competitor. The player decides whether to respond
publicly to each: responding well converts a 1-star into a 4-star at labour cost; responding badly
goes viral. One bad experience by an Influencer-class visitor becomes a permanent reputation debuff
that decays slowly.
**Counter:** an honest public post-mortem within 24h (a tower you can fire once per incident and only
if you have a Status Page built), a transparent detailed write-up, an executive response.
**The trap option — The Streisand:** legal threats or DMCA-ing the reviewer **triple the damage** and
upgrade the threat to a boss-tier reputation event. And the mirror: **the Viral Outage Postmortem** is
ironically *positive* reputation if handled with transparency and detail, and catastrophic if you say
"a third party experienced an issue."
**Visual:** a slow-moving billboard truck that parks in front of your building displaying a 1-star.
**It blocks the visitor lane until removed.** The billboard shows the **actual generated review text
and star count**, and visitors perform the Glance Animation at it before turning around. Removing it
(responding well, waiting it out) shows it **driving away slowly**, which is satisfying and correct —
you don't get to make it vanish. The rating object itself hangs physically over your front door and
loses points with a visible *snap* of a star falling off and shattering.

**Variations and additions**

- **Opencode's treatment — Review-Bombers** — A slow wave of 1-star review drones that reduce your
  *attraction radius* — new customers spawn slower and farther away — until a marketing/support
  tower clears them. A threat that attacks the funnel, not the datacenter. (gamedesigner)
- "Starfall": a 1-star meteor with review text scrawled on its tail strikes the *income ticker*
  instead of any server — the only threat that bypasses all firewalls. (wave2_visual_fresh)
- The One-Star Review Swarm: competitor-paid fake bad reviews (or a legit incident going viral) drop
  marketing conversion across the level until you work reputation back up — support wins,
  status-page honesty, outreach tasks. Pure funnel damage; no servers touched. (wave2_ceo_fresh)
- The Negative-Review Nuke: a swarm of 1-stars cuts customer arrival rate for days; counter with
  support-quality staff, status-page honesty, and a review-response mini-task.
  (wave2_sysadmin_fresh)
- The Review-Bomb Storm event: an influencer NPC tweets about you — a wave of angry mob customers
  *and* opportunistic attackers arrive together, and your *support-queue capacity* decides whether
  it passes or cascades. (wave2_gamedesigner_fresh)
- Review-Site Extortion: a spammer mass-posts fake 1-stars unless paid — paying *multiplies*
  attackers; a "review defense" playbook (evidence packets, platform appeals, delighted-customer
  counter-posts) decays the campaign. Conversions bruise for weeks. (wave4_ceo_fresh)
- The Reddit pile-on: after any widely-noticed failure (or competitor FUD campaign) the public
  rating meter dives and *inbound funnel volume drops for weeks* — the purest example of threats
  reaching revenue without touching a server. Do NOT counter with sock-puppet reviews: temporary
  gain, scandal multiplier if caught. (wave3_ceo_fresh)

### Status Page Denial
Your status page is hosted on your own infrastructure and goes down with it.

**How it works:** Amplifies every outage's reputation damage.
**Counter:** an off-network status page — a cheap buildable that new players always skip.

### The Industry-Insider Drama Thread
Reputation among operators, separate from consumer reputation.

**How it works:** Affects *reseller and agency* acquisition specifically — a different lane than
retail. Colo is sold by word of mouth between sysadmins more than by marketing, so model
engineer-reputation as a slow, sticky stat separate from consumer reputation.

### The Astroturf Temptation
You can *buy* 200 five-star reviews for $2,000. It works. For a while.

**How it works (wave-1):** Then a journalist or a platform's fraud detection detonates it, your
Reputation floors out, and it cannot be rebuilt for the rest of the run.
**⚔️ Fix — a choice labelled as a trap is not a choice.** Make the detection probability a function of
**volume and pace**: buying 20 reviews slowly is nearly undetectable; buying 200 in a week is caught.
Now there is a *skilled* version of the dirty play. And make the benefit **real and immediate**,
because that is why people do it. It should be a genuine, tempting, sometimes-correct moral choice,
not a labelled landmine.

### The Core Update (search algorithm apocalypse)
An organic-search collapse with no cause you can inspect.

**How it works:** A search-engine algorithm update **halves your organic spawn rate overnight.** It is
not your fault, it is not your uptime, and there is no ticket to open. Recovery takes 3–9 months if it
happens at all. The mechanical point: **a channel you built over a year can be removed by a third
party in a day** — the same lesson as the affiliate betrayal and the platform pivot in a third
costume, which is how you teach "diversify channels" without a lecture.
**Counter:** channel diversification, direct/brand traffic (the only defensible channel), and an email
list you own.
**Interacts with:** §3.6 SEO Garden — the garden gets hailed on.

### Comparison Site Delisting
A review aggregator drops you, or ranks you ninth.

**How it works:** Silent, gradual demand decay; hard to attribute.
**Counter:** content/SEO buildables, or paying for placement — a real and slightly dirty lever.

### Brand Confusion Attack
A competitor buys ads on your brand name.

**How it works:** Cheap to counter (buy your own brand terms), expensive to ignore. The retaliation
ladder ends in a trademark complaint and an uneasy truce.

### The Affiliate Betrayal, the Clawback Wave, and the Coupon Hijack
Three failure modes of the same channel.

**How it works:** **(a) Betrayal** — your top affiliate, who sends 30% of your signups, switches to a
competitor; overnight a third of your lead flow evaporates. Modern form: **a competitor raises
affiliate commission to 200% of first-year revenue** and your best acquisition channel turns hostile.
**(b) Clawback** — affiliates are paid on signup, but commissions reverse if the customer refunds or
cancels inside 45–90 days. An affiliate who drives volume of *bad* customers generates commission
payouts you claw back badly, slowly, and while they publicly complain. **(c) Coupon hijack** — a
coupon site takes last-click credit for customers you already acquired, who went looking for a
discount code at checkout. **You pay $110 CPA for customers you had.** Both (b) and (c) are invisible
without attribution tooling and both are enormous in real hosting.
**Counter:** channel diversification; attribution windows; coupon-site exclusion from last-click;
holding commission for 60 days; quality-adjusted commission tiers.

### The Platform Partner Pivot / Channel Conflict
Your distribution channel becomes your competitor.

**How it works:** Modelled as a **slow debuff**: the channel's lead flow declines 15% per month for six
months, your listed position on their marketplace drifts down, and their support agents start
recommending their own product. There is no combat counter; only diversification you should have built
earlier. The infrastructure-partner version: your platform partner launches a competing retail product
**using your own platform.**

### Referral Partner Defection
The web agency that sent you 40% of your customers switches for a better rev-share.

### The Reseller Who Was Actually A Competitor
They built their book on your platform and now migrate all of it away at once.

### The Influencer Complaint
A customer with 200k followers has a bad support experience.

**How it works:** Escalation path: you can *manually intervene* on one ticket per wave (the "CEO
reply"), which is enormously effective and doesn't scale — teaching exactly why founders burn out.

### Uptime-Monitor Public Shaming
Third-party monitoring sites publish your uptime and you cannot edit it.

**How it works:** A persistent reputational HUD element you don't control.

### The Ex-Employee Post
A laid-off or burned-out staff member writes publicly about working for you.

**How it works:** Damages *hiring* — your next engineer costs 20% more and takes twice as long to find.

### Founder's Tweet
An optional self-inflicted event.

**How it works:** A reputation swing in either direction, at the player's discretion. The only threat
the player fires themselves.

### The Support Vampire
A $4–5/mo customer who opens 11–40 tickets a month, each a 25-minute question that isn't your job.

**How it works:** A negative-margin customer, visible only if you track cost-to-serve. **Negative gross
margin personified.**
**Counter:** a knowledge base and deflection, a "we support the server, not your code" policy line, a
paid **Professional Services** upsell that converts the vampire into your highest-margin client, or —
the emotionally satisfying answer — **fire the customer**, a mechanic the game should reward.
**The structurally correct answer the counter list is missing: plan-level support entitlements.**
Support is a product, and unlimited support on a $5 plan is a *pricing error*, not a customer problem.
Fixing it is a rate-card change (chat on all plans, phone above $50, 1-hour response above $200), and
doing it makes the vampire either upgrade or self-select out — both good outcomes. Worth stating
explicitly, because "fire the customer" is the fun answer and "reprice the support" is the right one.
**Visual:** a customer whose desk has a visibly growing stack of ticket paper and a thin red tether
draining your support staff.

### The Hoarder / The Resource Hog / The Noisy Neighbor
A customer who uses 40× their fair share. Not malicious, just catastrophic.

**How it works:** Runs a `find /` every minute, or a backup script that tars the whole home directory
to the same disk; or one shared-hosting tenant consuming 60% of a box's I/O, **degrading 200 other
customers invisibly until they churn.**
**Counter:** a *policy* (quotas, cgroups/LVE, resource limits) — and enforcing it makes them churn
angrily and leave a bad review, plus it makes your product worse on paper. The profitable resolution
is the **polite upsell** that converts them to a VPS.
**Visual:** **The Elbow** — on a shared box, one tenant's window swells and *physically shoves* the
neighbouring windows smaller. cgroups and limits are drawn as visible partitions.

**Variations and additions**

- **Opencode's treatment — The Noisy Neighbor (accidental resource hog)** — Not malware: a legit
  customer whose app goes pathological (an unindexed query, a fork bomb, zombie processes, a runaway
  cron, a $2 script left running). It drains shared I/O/CPU and slows everyone; options: throttle
  (they churn), migrate them (cost), or oversell harder (risk). The *economic* face of the
  overcommit gamble: your margin came from packing them there. Counters: resource
  caps/cgroups/sandbox, offender migration, and the "premium isolated node" upsell that *monetizes
  the fix*. Visual: the tenant's compartment glows orange, heat-shimmer warms adjacent assets' LEDs,
  and a "shared resource drain" progress bar fills — you can't destroy them (paying customer!), only
  *partition*: a wall/cgroup buildable literally draws a cold line through the rack. Signature of
  shared/VPS. (wave1_ceo_fresh, wave2_sysadmin_fresh, wave3_ceo_fresh, wave3_visual_fresh,
  wave4_sysadmin_fresh)

### The Concentration Risk Whale
One customer at 30% of revenue. **A threat that looks like your greatest asset on the revenue chart.**

**How it works:** They know it. Every renewal they demand a discount. Losing them is a company-ending
event; keeping them is slow bleeding.
**The numbers and the curve:** concentration becomes a visible warning at **>25% of MRR in one
account**, a scored penalty at **>35%**, and at **>50%** the whale gains a **renewal leverage**
mechanic — each renewal they demand a discount of 8–15% or they walk, and refusing carries a ~35%
churn roll. That turns a narrative caution into a compounding squeeze the player can feel.
**The full whale pathology (the entry is much better fully specified):**
- They will ask for **net-60 or net-90**, turning your best revenue into your worst cash.
- They will ask for a **custom SLA with real penalties** and a **liability cap above your comfort.**
- They will ask for a **dedicated engineer**, permanently removing a hand from your pool.
- They will require **annual price *decreases*** ("productivity commitments") — standard in enterprise
  procurement and shocking to a first-time seller.
- They will demand an **MFN** or a benchmarking clause.
- Their procurement runs an **RFP every three years regardless of satisfaction.**
- **Your lender will cap your credit line** because of the concentration, and **your acquirer will
  discount your multiple 20–30%.** The whale damages your balance sheet and your exit, not just your
  risk profile.
- And the cruellest one: **your engineering roadmap bends to them**, so the product you build stops
  fitting your other hundred customers.
**The second concentration nobody models — supplier concentration.** One transit provider, one
hardware vendor, one control-panel vendor, one payment processor, one cloud region, one colo landlord.
There is a Vendor Diversity buildable and a Vendor Squeeze threat but no *meter*. **Give supplier
concentration its own donut next to the customer one — you can be diversified on revenue and
completely undiversified on dependency, which is how most hosting companies actually die.**
**Interacts with:** §6.8 Concentration Donut, §2.17 The Shared Fate You Bought.

**Variations and additions**

- **Opencode's treatment — Whale Concentration & Pipeline Fragility** — One customer grows to 35% of
  MRR: not an attack — a *systemic vulnerability*; their renewal negotiation, their outage, or their
  departure becomes the save-scumming boss event. Mechanics: concentration-risk meter;
  diversification rewarded; contract terms (net-60, custom SLA credits) as defensive building.
  Sister: **The No-Show Whale Deal** — you staffed, bought hardware, and turned down smaller deals
  for an enterprise contract that stalls at legal review; a signed LOI *decays* unless
  SLA/pricing/legal demands are met before the close window. Sister: **the Account-Team Bus Factor**
  — your rainmaker rep leaves, *taking the pipeline and three logos' relationships*; the CRM
  buildable institutionalizes relationships (plus dual-touch accounts, commission vesting) and pays
  for itself the day the rep quits. (wave2_ceo_fresh, wave1_ceo_fresh, wave4_ceo_fresh)

### The Departing Whale
A 90-day notice from a customer who is 30% of revenue.

**How it works:** The damage is not instant; it's a **countdown timer that reshapes every decision for
the rest of the level.**

### The Key Customer's Acquisition
Your whale gets bought.

**How it works:** They did not churn and did not complain — their new parent has a global vendor
agreement with someone else, and your contract dies at renewal for reasons entirely outside the
relationship. **Concentration risk materialising through no fault of anyone**, the truest version of
it.

### The Insourcer
An enterprise customer building their own.

**How it works:** Unavoidable; you can only slow it with expansion upsells.

### The Quiet Downgrade
Churn that isn't churn.

**How it works:** A customer doesn't leave — they **shrink.** Fewer servers, a lower tier, a shorter
retention, the managed add-on cancelled. **Logo churn is zero and revenue churn is 30%.** Invisible on
every dashboard that counts customers rather than dollars, and it is how a hosting company dies
without noticing.

### The Migration Tourist
Signs up on a 90-day-money-back promo, migrates in, uses you for 89 days, demands a refund, leaves.

**How it works:** Pure loss including onboarding labour.

### The Compliance Tourist
Wants HIPAA guarantees on a $20 plan.

**How it works:** Consumes sales time, never buys. A pure attention drain wearing a revenue costume.

### The Contract Lawyer
An enterprise prospect whose legal redlines cost you 30 hours of a lawyer's time before signing.

**How it works:** Real cost-to-acquire that doesn't look like marketing spend and appears in no CAC
calculation the player has built.

### The Security Questionnaire Treadmill
An attention-drain threat aimed at your engineers, not your servers.

**How it works:** Each enterprise prospect sends a 300-question security questionnaire in their own
format, plus a pen-test report request, plus a vendor-risk portal registration, plus an insurance
certificate, plus a supplier-diversity form. Each costs **8–20 senior engineering hours.** Five
simultaneous prospects consume an entire engineer for a month. **Answering them does not close deals;
not answering them loses deals.**
**Counter:** a **Trust Center** buildable — pre-answered, evidence-linked, self-serve — that converts
a 20-hour task into a link, with a measurable effect: the enterprise sales cycle shortens by weeks.

### The Audit Right
Your enterprise customer can audit you, and this year they will.

**How it works:** A right-to-audit clause is exercised: the customer's team (or their auditors) arrive
for three days wanting evidence, tours, logs, and interviews. It consumes your senior staff entirely,
it finds things, and remediation is contractual. **It is not a compliance audit; it's a *customer*
audit, and refusing is a breach.**

### The Most-Favoured-Nation Clause
A contract landmine that detonates on a *later* deal.

**How it works:** A big customer made you sign an MFN: they get your best price. Two years later you
discount aggressively to win a new logo, and the MFN customer's price **automatically drops,
retroactively, across their whole footprint.** One discount reprices your largest account. **The threat
is a clause you signed and forgot** — the purest possible expression of P10.
**Counter:** a **Deal Desk** buildable that flags clause interactions before you sign.

### The Overcommitted Salesperson
Your own rep sold a feature you don't have, at a price below cost, with a 100% uptime SLA.

**How it works:** **An internal threat spawner** — everything downstream of that signature is a
scheduled incident.

**Variations and additions**

- **Opencode's treatment — The Salesman's Lie (dishonesty debt)** — Your own marketing/gambit
  buildable — overpromising "99.999%" or "unlimited bandwidth" — generates cheap customers whose
  expectations are unservable: a churn + chargeback combo. Claims decay into penalties.
  (wave1_ceo_fresh)

### The Ransom Customer
"Give me 6 months free or I post the outage screenshots."

**How it works:** Pay, refuse, or publish first.

### The Chargeback Artist / The Chargeback Gremlin
Buys, uses, disputes. Repeat.

**How it works:** Costs money and processor standing. Counterable with verification friction — which
bounces good customers.

### The Crypto Miner on a Free Trial
Pure COGS theft.

**How it works:** Attacks consumption-billing and free-tier models specifically. The free tier is an
acquisition channel and an attack surface at the same time.

### The Resold Reseller
Your reseller resells to resellers.

**How it works:** You have no idea who your end users are, and one of them is a phisher. **Abuse
liability with no visibility.**

### The Reseller Who Oversells
One customer account whose own customers are 300 sites of unpatched software.

**How it works:** Highest revenue, highest abuse rate. A walking risk/reward decision, and their
end-users' abuse is your abuse.
**Add the upside the framing omits:** a reseller is **near-zero CAC and near-zero support cost to
you** — they absorb their customers' tickets. The honest framing is that a reseller **trades support
burden for abuse burden and concentration risk.** Resellers are the highest-margin-per-hand revenue in
shared hosting *and* the most dangerous, which is a far more interesting card than "bad customer."

### The Ghost Tenant (colo)
A colo tenant stops paying but their gear is still racked, drawing your power.

**How it works:** In some jurisdictions you legally cannot just unplug it. **A slow bleed plus a lien
process**, and their power draw is on your bill.
**Interacts with:** §2.12 Colo: The Tenant Who Stops Paying / The Tenant Who Won't Leave.

### The Price War / The Copycat
A competitor drops shared hosting to $0.99/mo.

**How it works:** Your conversion rate halves. If the player undercuts the Competitor AI, the
Competitor undercuts back — **a prisoner's dilemma with an AI opponent.**
**Four responses, not three:** **match** (destroys margin — the trap the entry correctly identifies),
**differentiate** (slow, needs marketing spend), **segment up** (abandon the low end, lose volume), and
the one the industry actually uses: **launch a fighter brand.** A second brand lets you match the price
*without* repricing your base or telling your existing customers they were overpaying. Its costs are
marketing duplication, support duplication, and linkage risk if anyone connects the two.

### The Hyperscaler Free Tier / Cloud Giant Price Cut
A cloud giant offers "free forever" at your entry tier, or drops prices across the board.

**How it works:** Erases your entire lead-gen funnel for beginners, or puts your commodity tier
underwater.
**Counter:** become the place people go when free stops being free; differentiate or pivot.

### The Acquisition Predator / The Roll-Up Acquirer
A well-funded consolidator buys your three biggest competitors, then your biggest *supplier*, then
offers to buy you at an insulting multiple, then starts poaching your staff.

**How it works:** A multi-level antagonist who makes the market hard *before* making the offer.

### The Poison-Pill Customer
A customer whose existence blocks your exit.

**How it works:** A buyer's diligence flags one of your customers — the bulletproof holdover, the
sanctioned-jurisdiction account, the one with unlimited liability in their contract, the one who is
34% of revenue. **The deal is conditional on removing them. Your most profitable customer is now the
reason you can't sell**, and firing them takes 90 days of notice you may not have.

### The Earnout Dispute
Post-acquisition, on both sides of the table.

**How it works:** You sold (or bought) with an earnout tied to retained revenue, and the definitions
matter enormously: is a customer "retained" if they downgraded? Moved products? Churned because the
*buyer* migrated them? Both parties now have a financial incentive to interpret the same events
differently, and the relationship poisons. **A great late-campaign narrative threat with no combat in
it at all.**

### The Vendor Squeeze
Control panel, virtualization, or backup vendor raises prices 200–400% at renewal.

**How it works:** A direct hit to unit economics on **every account, retroactively.** (The real-world
cPanel repricing reshaped an entire industry and could literally be a mid-campaign event.)
**Two sharpenings:** (a) the increase is typically **structural, not just numeric** — **per-server
becomes per-account**, which changes your unit economics at every tier and specifically punishes your
densest, cheapest plans; and (b) **the vendor prices to your switching cost**, so the mechanic should
expose that switching cost explicitly.
**Counter (three, not two):** open-source migration (capex + retraining + feature loss), repricing
customers (churn), eating it (margin) — **and the third the industry actually used: restructure your
plans so the licence cost is visible and attributable** (move the panel to a paid add-on), which
shifts the increase to the customers who use it.
**Visual:** a letter that lands on your desk with a physical THUD and a visible shockwave that ripples
through every server, each ticking up a small red cost number. **Generalize it: this is the universal
rendering of a per-unit cost change** — licence repricing, power tariff, transit increase, tax nexus.
One FX, six events; name it `FX_TariffWave`.

**Variations and additions**

- **Opencode's treatment — Vendor & Upstream Dependency (map features that evict themselves)** —
  Your bandwidth supplier raises prices (margin squeeze) or depeers (traffic must find new paths — a
  customer latency crisis); counters multi-homing, IX peering, long-term contracts (lock price, lose
  flexibility). The Upstream Outage: your transit provider, or the cloud you resell, dies — you own
  the SLA, they own nothing ("their SLA is 99.5%, yours is 99.99% — do the math"); multi-homing pays
  for itself exactly once, catastrophically. No counter — only *preparedness*: it is the threat that
  grades your redundancy. Vendor True-Up Audit: Microsoft/Symantec-style license auditors claim
  under-deployment and demand six figures retroactive — hits when margins look healthy, feels
  personal (counters: license hygiene, open-source migration, legal stonewalling). The Vendor Price
  Shock: a control-panel/backup vendor raises per-customer prices 4× overnight (everyone knows which
  one) — absorb, pass through (grandfather-angry → churn spike), or migrate platforms; the vendor
  meter stays on the HUD. Vendor Collapse: your SSL CA loses browser trust, your transit dies, your
  panel vendor ships ransomware-adjacent updates — *some map features can evict themselves*.
  Upstream Datacenter Eviction: you're a colo TENANT too — the landlord sells, the power contract
  ends, rent doubles, or fire: 400 servers must move without moving; multi-DC redundancy revealed as
  insurance you hope never to cash. The existential version: transit goes down or cancels your
  contract — reroute to expensive backup or negotiate emergency peering; the counter is
  relationships + redundancy. Energy squeeze: power prices triple for a window (heat wave, grid
  crisis) — every GPU hour may run at a loss; throttle vs. honor contracts. (wave1_ceo_fresh,
  wave2_ceo_fresh, wave2_gamedesigner_fresh, wave3_ceo_fresh, wave3_sysadmin_fresh, wave4_ceo_fresh,
  wave4_general_fresh)
- The Locked Door (identity-provider collapse): your auth vendor dies — infrastructure 100% healthy,
  staff able to log in to *nothing*, every customer locked out at the gate they paid for. An
  availability failure masquerading as an attack: dashboards green, tickets exploding, "you're down"
  trending while packets flow; load-shedding-by-identity becomes cruel (you can serve what nobody
  can enter). Counters: break-glass out-of-band local auth and *session longevity as strategy* —
  long-lived tokens are sandbags while the front door is dead. OAuth-dependent customers bounce off
  YOUR outage: the borrowed front door. All post-IdP. (wave3_sysadmin_informed)

### The Landlord's Lender
You do not own your building, and neither, increasingly, does your landlord.

**How it works:** Your colo provider (or your own landlord) defaults and the building goes into
receivership. Nothing breaks — for a while. Then capital projects stop, the chiller that needed
replacing doesn't get replaced, remote-hands staffing is cut, and the new owner's leasing team wants to
reprice your renewal at market. **You have no operational control and no counterparty who cares. The
most helpless business threat available**, and the commercial twin of Upstream Bankruptcy.

### The Upstream Bankruptcy
Your transit provider or colo landlord goes under. 30 days to relocate.

**How it works:** The single most expensive event in the game.

### The Acquisition of Your Landlord
New owner, new rates, new rules.

### The Talent Raid
A competitor offers your best engineer +40%.

**How it works:** Losing them costs MTTR on every future incident and the tribal knowledge of your
weirdest customer's weirdest setup. They may also hire your **account manager and their
relationships**, which is a revenue attack wearing an HR costume.

### Employee Misclassification / Contractor Audit
A payroll-shaped audit.

**How it works:** Your "contractors" — the night-shift remote hands, the offshore pod, the part-time
support crew — are reclassified as employees. Back payroll taxes, penalties, and **a permanent cost
increase on a line item you'd optimized.**

### The Word "Unlimited"
A marketing decision that becomes a legal one.

**How it works:** You shipped an "unlimited" plan. Eighteen months later: a consumer-protection
complaint, a class-action letter, or an advertising-standards ruling. Damage is legal cost + a
mandated refund program + rewriting every marketing page + a press cycle. Also triggered by
auto-renewal laws requiring a one-click cancel path you never built.
**Counter:** a fair-use policy written *before* launch, a visible cancel flow, honest packaging — all
of which **lower conversion at the moment you ship them.**

### SLA Credit Claim (and the clause that actually bites)
An enterprise customer invokes the SLA. Real money leaves.

**How it works:** The bigger the customer, the more carefully they read the contract. **But see the
magnitude correction above — for an enterprise contract the meaningful clause is usually not the
credit, it's the termination right: three SLA breaches in a rolling 12 months lets them exit without
penalty.** That's the real weapon, and it converts an availability problem into a **revenue-cliff**
problem, which is both scarier and more accurate.

**Variations and additions**

- **Opencode's treatment — SLA-Credit Arbitrageurs** — A sophisticated customer (or
  competitor-funded shill) signs up for your highest-credit plan *specifically to milk downtime
  payouts*: synthetic traffic flares incidents, every credit claim filed to the letter. Counters:
  credit-cap clauses, incident-validation processes, pricing the risk out — contract engineering as
  defense. (wave4_ceo_fresh)
- The claim-farmer formalized: customers (or a rival's agency) run synthetic probes against the
  *published* SLA and auto-file credit claims for every 3-second wobble — not an outage problem but
  a *math* problem; beyond credit caps: claim-review buildable and SLA-definition tightening
  (measurement method, exclusions, caps). Late-game CDN/cloud special; teaches that your contract
  text is attack surface. (wave2_ceo_informed)

### Regulatory Fine / Compliance Lapse
Triggered by a breach you failed to disclose fast enough, or a certification you let expire.

**How it works:** Disclosure speed becomes a decision: fast (reputation hit now, small fine) vs slow
(maybe nobody notices, huge fine if they do). A lapsed certification is a **cliff, not a slope**:
regulated customers are contractually required to leave.

### Licensing Audit
A vendor discovers you're over your license count. Pure cash hit.

**Visual:** **The Gavel** — a slow, unstoppable walker that examines each software aura and stamps any
unlicensed one with a violet fine glyph. Cannot be attacked, only prepared for. Deliberately shares a
silhouette family with the Regulator and the Auditor, so "authority figures" read as one visual class.

### Compliance Audit / Law Enforcement Request / Seizure
Subpoena, seizure order, or a raid that takes a whole server — with 40 other customers on it — as
evidence.

**How it works:** Real and terrifying. **If the server was shared, you just took down 200 innocent
customers**, which generates collateral churn from people who did nothing wrong. **Counter:
isolation architecture** — thematically perfect, because the answer to a legal threat is a
*technical* build decision made long beforehand.
**Visual:** **The Evidence Tag** — a yellow-and-black tag zip-tied onto a rack; the rack becomes
untouchable, greyed, with a drawn police-line hatch across it. In bulletproof levels these accumulate
as a visible cost of doing business.

**Variations and additions**

- **Opencode's treatment — Law Enforcement** — Not an attack to block: a *seizure event* arriving
  with paperwork — removes gear (and innocent co-tenants), grades your response (did you have logs?
  chain of custody?). Visual: an immune seizure van on the road, or patrol boats in the offshore
  act; comply (surrender the named rack, keep the rest) or run the evidence-wash timer. (sysadmin,
  visual)
- Keep the threat-grammar promise alive ("every hostile is counterable") with a codex column
  "response class: block / reroute / paper / pay / absorb". Law enforcement and the regulator are
  reroute + paper + absorb (never block) — and the paper response is a legitimate late-game tower
  family (compliance buildables), so the grammar survives its own exception list.
  (wave2_general_informed)
- Evidence seals: the tape is a striped sticker with an emblem that *slaps* onto objects and a
  countdown burns into it; compliance shrink-wraps the asset and silhouette figures cart it out; the
  evidence-wash minigame is literally peeling tape before the countdown ends — with a satisfying
  rip. (wave2_visual_informed)
- The Wiretap Counter (lawful-intercept order): a sealed government order arrives for your *network*
  — install a tap on a transit path and mirror a target customer to a state collector. A decision
  boss, not a combat wave: comply and your "no logs / no peeking" promise becomes a *visible* crack
  in the map (privacy-segment customers churn in chains; the mixnet operator finds it essentially
  *unsignable*); refuse and you fight the state in the paper layer (fines bleed the treasury, a
  seizure wave armed with pretext). The compliance build is load-bearing engineering — the mediation
  platform, its own ACLs, and the terrifying audit question: *who else is on this tap?* Email/DNS,
  VPS, offshore (where the whole brand is "the order that bounced"), regulated.
  (wave3_sysadmin_informed)
- The business-shaped version: extreme abuse-complaint escalation — authorities (or a court order
  you must obey) seize named servers and innocent neighbors' service dies with them; a notoriety
  spike closes the enterprise pipeline for a level. (wave1_ceo_fresh)
- "The Suits" (non-combat wave): vans arrive, a suit presents papers at your door — with
  logs/compliance towers up it's a scripted *tense cutscene* (data handed over politely, customer
  trust dips); offshore/wired wrong, they seize racks (physical loss). The inverted counter: the
  *legal* buildables. (wave2_general_fresh)
- Boss "RICHARD": the Heat-meter finale for offshore/abuse-heavy runs — network taps, domain
  seizures, then a real raid walking racks out of your map; you can't kill them, only *stall*
  (paperwork delays, jurisdictions as chokepoints) or evacuate data first (the "bank heist escape"
  twist). (wave3_gamedesigner_fresh)
- The intended play vs. the tower play: a timed "warrant" unit marches to a specific rack — delay it
  with lawyer towers, or *relocate the target before the warrant lands*. (wave3_general_fresh)
- Visual: a giant warrant document flutters down onto ONE rack with a stamp sound; the rack is boxed
  and crane-lifted out mid-level, taking its customers with it — unstoppable, only *pre-emptable*
  (offshore jurisdiction screen, or a rapid-mirror buildable that decays the copy).
  (wave4_visual_fresh)
- The legal mini-game around it: countdown + warrants + jurisdiction; hand over specific boxes
  (sacrifice customers), comply fully (end run), or play the "data already migrated" magic trick.
  (wave2_sysadmin_fresh)
- The Insider/Compelled cousin: law enforcement with a warrant demands a customer's data — hand it
  over (churn that customer + public scandal), stall (legal fees burn, facility-search debuff), or
  (bulletproof only) resist and risk seizure. "The threat you can't shoot." (wave4_general_fresh)
- Not an attacker you shoot down: a threat you out-comply or out-document — seizure = level loss if
  you lack paperwork. (wave4_sysadmin_fresh)

### The Plaintiff's Lawyer
Arrives after a breach.

**How it works:** Damage is denominated in legal-defense cash and in the *executive hours* it consumes
— which are a resource (§7.5). A long timer, a large number.

**Variations and additions**

- **Opencode's treatment — The Lawsuit (delayed-consequence boss)** — After any big outage or
  breach, spawns if your TOS/insurance towers were weak; freezes your cash mid-level. (general)
- The Paper Boss: a cease-and-desist unit advances *slowly, immune to every technical tower* — only
  legal counters work (DMCA response desk, evidence locker, offshore incorporation); if it reaches a
  server it *shields that server from you* (seizure). (wave2_gamedesigner_fresh)
- "SEGA Takedown": a giant certified envelope glides in like a slow guided missile — it can't be
  shot, only *rerouted to the legal-department desk*. (wave2_visual_fresh)
- The Legal Letter / DMCA / Subpoena decision tree: terminate the customer (lose revenue, maybe leak
  a churn-sensitive "we caved" story), fight it (legal-fees burn, reputation win with some
  segments), or ignore it (seizure risk on the offshore path); regulated inverts it — *refusing to
  be subpoena-able is the product*. File/CDN/streaming/offshore. (wave2_ceo_fresh)
- The Patent Troll Demand: a claim that your billing/auto-scaling/"innovative server arrangement"
  infringes — settle (cash out), litigate (long expensive buff with win/lose payoff), or ignore
  (escalates to injunction threat = level-loss risk on bad dice); prior-art research is a funny
  micro-minigame. Dark-comedy, every operator fears it. (wave3_ceo_fresh, wave4_general_fresh)
- The Patent-Troll Sprite (targeted form): instead of a letter, it lands on ONE named buildable —
  "your rate-limiter implementation is licensed to us" — and halves its function until you pay.
  Counters: prior-art excavation (spend staff-hours to invalidate), cross-license via the Legal
  tower, or accept the fee as upkeep; in NG+ your mature tree is a bigger target.
  (wave3_general_informed)
  - The chill meter: while the case is open, one of your tech-tree branches is *suppressed* —
    innovation arrest as a debuff; your legal towers cite prior art found in the lore archives (the
    abandoned datacenter's config tapes are suddenly an evidence locker), and OSS contributions give
    prior-art ammo. (wave2_general_informed)
- The Trademark Bully: someone claims your brand name (or a customer's site you host) — legal-fees
  drain + optional rebrand event (reputation & SEO equity hit), foreshadowed by a "brand clearance"
  micro-purchase early. (wave4_ceo_fresh)

### Angry Customer Escalation
A complaint escalates one stage at a time: ticket → phone call → public post → chargeback → lawsuit.

**How it works:** Each stage is more expensive. You can intervene at any stage at increasing cost.

### The 1-Star Review
A single customer's 4-minute blip becomes a public review that measurably reduces new signups for 30
days.

**Counter:** a status page, proactive comms, and a post-mortem — **transparency actually *raises*
trust, and the game should model that.**

### The Disgruntled Ex-Customer
Left angrily, still has API keys, still points DNS at you, still costs you bandwidth.

**How it works:** A slow leak with a legal-ish resolution path — and they know your architecture and
post everywhere.

### The Investor Who Changed Their Mind
Financing risk.

**How it works:** A committed round, a signed term sheet, or an extended credit facility is withdrawn
or repriced. **You had been spending against it.** The counter is not spending against money you
haven't received, which every player will do anyway.

### Vendor Financing Recall
Your hardware vendor tightens credit terms; you now need cash up front.

### The Reference Call
A silent, invisible, enormous sales threat.

**How it works:** A prospect calls your existing customers. What they hear is a function of **how you
handled those customers' worst days, months ago.** A sales outcome determined entirely by past
operational behaviour, **with no visible mechanism** — the player only ever sees a deal that quietly
didn't close. Revealing the mechanism once, late, is retroactively devastating in the best way.

### Ambulance Chasers
Post-incident, a swarm of low-value units arrive to file complaints, demand SLA credits, and scrape
your status page for content.

**How it works:** They arrive *after* the fight, when your attention is exhausted. Mechanically: an
attention tax on top of a bad moment.

### The Founder's Bad Week
The player character has a life.

**How it works:** A personal event — illness, a family emergency, a move — removes the player's own
**Executive Attention** for a period. Everything you delegated works; everything you personally did
doesn't. **The most honest mechanic available to a game about running a small hosting company**, and
it converts "bus factor" from an abstraction into an experience.

### Health and Safety
A near miss.

**How it works:** Someone working alone at 3am. Arc-flash risk on a live panel. A rack tipping during
a move. A lifting injury. Safety should be a **policy buildable** (two-person rule for energised work,
a lifting plan, PPE, lone-worker check-in) with a real cost in speed, and an incident should be a hard
stop that halts all physical work for days plus a regulatory investigation. **Handled soberly it is
one of the most respectful things the game could include.**

### Angry-Customer Ghosts (churn weaponized)
Churned customers literally return as **poachers**: sprites traveling your path shouting, making
*live* customers more likely to bounce.

**How it works:** Retention isn't just lost revenue — it's added enemy support. Visual: departing
customers lift off as gray clouds that rain on the revenue ticker; a churn cascade looks like a
squall line crossing your property. (gamedesigner, visual)

**Variations and additions**

- The viral-review unit: some churned customers become walking 1-star bombs with a *bounce aura*
  poisoning nearby incoming customers — silence them with goodwill towers (SLA credits, support
  win-back) *before they exit the map*. (wave2_gamedesigner_fresh)
- The mob form: accumulated detractors sit at your ingress and *physically block new customers from
  entering* — a visible congestion jam you appease with support towers, credits, or status-page
  honesty. Reputation becomes spatial gameplay. (wave3_gamedesigner_fresh)
- The Outage Mob (flash crowd's angry cousin): AFTER a bad patch or outage, former customers return
  as a protest wave that doesn't attack servers — they occupy your support queue, blocking new
  customers from converting. A threat born from your own failures: the game's karma loop.
  (wave2_general_fresh)
- The Blizzard variant: a botched outage spawns a flood of refund/1-star units damaging revenue *and
  staff morale*; counters are status-page towers, apology discounts, good-comms unlocks.
  (wave3_general_fresh)
- The Status-Page Siege: when you're already hurting, attackers target the status page — the one
  screen your customers are guaranteed to visit. Your PR organ becomes a defended structure with its
  own mini-lane; a downed status page during an outage *doubles* the reputation hemorrhage and hides
  the repair ETA (customers bounce blind). Mitigation: an independent micro-host for the page — on
  your own infrastructure, at a different provider (the game's meta-joke). All types.
  (wave3_general_informed)
- The Churn-Cascade Event (social proof): one prominent customer's public departure triggers an
  "everyone's leaving" bandwagon — each cancellation visibly raises the probability of the next for
  a time window. Interrupt with status-page honesty, executive outreach (a retention tower), or a
  loud new-logo announcement to reverse the story. (wave4_ceo_fresh)
- The Ticket Monster: churn events spawn small chasers that attack your *REPUTATION meter* (and
  reputation gates customer inflow) — kill them by responding with support-staff towers; non-violent
  defense: de-escalation. (wave4_gamedesigner_fresh)
- The one-star cloud: a departed churner becomes a small cumulus that zaps the reputation meter from
  above, darkening it and dipping spawn rates; reviews physically rain stars onto your lobby floor
  where you can sweep them up (mitigation minigame). (wave4_visual_fresh)

### Bad-Press Flood / The Front Page
A giant floating "PRESS" balloon drifts overhead casting an approaching shadow that telegraphs
exactly where and roughly when the customer flood will land (shadow size = spike magnitude) — an
economy shock turned into readable weather. (visual)

**Variations and additions**

- The Bad-Review Cascade: one publicized outage spawns a Hacker News / Reddit megathread →
  conversion rate on new customers plummets for a period; counter with status-page transparency,
  recovery speed, outreach. The "morale debuff" made economic. (wave1_ceo_fresh)
- The Negative Press Cycle: after any major incident a "coverage meter" spikes and every visible
  failure for a period adds *double churn*; handled PR mini-actions (postmortem published, CEO blog,
  status-page candor) decay the meter — honest comms literally cheapen damage. (wave2_ceo_fresh)

### Price-Hike Revolt
Raising list prices triggers instant churn from sensitive segments; NOT raising during inflation
squeezes margins.

**How it works:** Real tactics made playable: grandfather existing customers (pay now or later),
bump only new signups (secret discounting), or annual lock-in (churn delayed, cash early). The wave
form: raise prices too far for too long and a "cancel batch" event walks your customer lane removing
paid packets — the pricing slider connected directly to wave pressure. (wave1_ceo_fresh,
wave4_gamedesigner_fresh)

### Bill-Shock Boomerang (the "gotcha" bill)
A metered customer blows a cap silently, gets a $90K invoice, refuses to pay, posts it on Reddit,
and churns with their whole startup: AR write-off + reputation + precedent — three damages at once.

**How it works:** Counters: usage alerts/caps buildables (soft vs. hard caps trade revenue for
safety), overage grace policies, a "bill-shock refund" provision. Metered revenue carries hidden
churn risk. (wave2_ceo_fresh, wave4_ceo_fresh)

### Rented-Channel Collapse
Google/Meta freeze your ad account (hosting is a "high-risk industry" — flagged!): the PPC
acquisition tower goes to zero overnight and only owned channels (SEO, email list, affiliates,
community) keep feeding the funnel — punishes marketing monoculture, rewards portfolio channels.

**How it works:** The SEO Core Update: an algorithm change swings organic acquisition ±70% overnight
(seeded random per level) — long-tail tutorial content weathers it, thin content dies. Channel
Fraud: affiliates cookie-stuff purchases or run coupon-squatting to farm CPA, referral-abuse rings
self-refer for credits; fraud-scoring on payouts claws it back — but overly aggressive review angers
your legit evangelists. The dark twin of your cheapest acquisition channel. (wave4_ceo_fresh)

**Variations and additions**

- The Referrer Abuse Wave (revenue-side DDoS): not packets but *valid events* — an affiliate ring
  drives 400k "conversions" that all churn at day 31, bleeding per-signup bonuses and per-lead
  payouts to your own channel program; dashboards show record growth while treasury shows record
  burn. A threat whose damage is *paid, not lost*: growth = bill. Counters: velocity/behavioral
  fraud scoring aimed at upstream traffic sources, payout-hold timers (money that doesn't move is
  money you keep), attribution hardening. SaaS, marketplace, any channel economy.
  (wave3_sysadmin_informed)
- The Coupon-Stacking Ring: a promo leak — your discount codes stack, and a forum of bargain hunters
  farms free trials/GPU credits at scale. Burn-rate spike *plus* conversion-analytics poisoning
  (your dashboards lie because the cohort is fake); counters: promo-rules engine buildable,
  one-code-per-identity (KYC-lite), and the quietly-honoring-redeemed-coupons vs. claw-back choice
  (churn-vs-cash). (wave2_ceo_informed)

### The Zombie-Account Escheat Scandal
Dormant prepaid balances and forgotten accounts = pure breakage margin… until a journalist writes
"hosting giant keeps ghosts on payroll" and a regulator demands unclaimed-funds remittance.

**How it works:** Breakage as a liability reveal — funny, real, and a choice: donate the ghosts'
balances to trust instead. (wave4_ceo_fresh)

---

## 2.11 Attacker archetypes (the "who")

*Attacks come from a visible **Threat Gantry** along the map border: a row of "who's attacking you"
portrait cards. Each archetype has a distinct portrait, a distinct spawn animation, a distinct colour
trim on its spawned units, and a **Grudge pip row** (§2.1). Each archetype is a **behaviour policy**,
not a sprite — it decides what spawns and where it aims.*

### Bots / Scanner Bots / The Opportunist Scanner
Autonomous, relentless, the internet's background radiation.

**How it works:** Never stop, never targeted. **Scale with your visibility, not your wealth.** Their
purpose is to make "zero alerts" impossible. The CVE-spray variant sprays for known vulnerabilities —
harmless until you have an unpatched thing, then instantly lethal. **Punishes patch debt and ignores
everything else.**

### Script Kiddie
Chaotic, loud, easily stopped — but if they get in they do stupid destructive things.

**How it works:** Fires one known exploit at a random service, aims at whatever is most visible, and
copies whatever is trending. If it fails they leave (visibly throwing a controller) and they give up
after about three failed attempts. If it *works*, they come back with friends and **they tell people**
— your network gets tagged on a list, permanently raising future spawn rates. Punishes leaving one
hole open in a way that compounds. High frequency, low damage, **high support-ticket noise.**
Defacement costs **reputation** far more than money.
**Visual:** cartoon hoodie silhouette in a beanbag chair with RGB keyboard glow; scruffy, jittery,
erratic movement, a trail of dropped soda cans, and neon-rainbow unit trim (they think it's cool).

**Variations and additions**

- **Opencode's treatment — Script-Kiddie Mob** — Weak, numerous, noisy; defaces-and-spray-can
  swarms; early-game cannon fodder renting booter services by the hour; a lone hoodie avatar
  trudging with an oversized glowing toolkit. Cheap to kill but they flood the support queue (their
  tickets distract staff towers). Cruel twist: every third spawn of the NEXT wave wears a tiny
  parody of your last counter (hard hat vs firewall, cat ears vs IDS) — threats visually *learn*.
  (general, sysadmin, visual)
- Chaff design role: they run known exploit avatars you've already patched — free kills that fund
  defenses, trickle pressure so the player never fully idles; occasionally one *upgrades mid-run
  into a Botnet Drone* (their toolkit "improves" — threats evolve). (wave2_general_fresh)
- Motivated by gamer beef: bursts tied to in-game drama events — a clan loses → they boot the
  winner's host → that's YOUR customer. Humor + early waves. (wave2_sysadmin_fresh)
- They attack with *rented* botnets: strength spikes and dies as the rental timer / credit card
  clears — counter-play is patience (ride it out cheap). (wave4_gamedesigner_fresh)
- "The clumsy noob": trips over his own ethernet cord, throws pizza-box projectiles, occasionally
  DDoSes *himself* and vanishes; leaves an "l33t h4x" graffiti sticker where he failed. Comic relief
  tier-1. (wave4_visual_fresh)
- Defaces sites only when the site is unpatched — individually harmless, collectively
  churn-inducing: a defaced customer = one 1-star review. (wave4_general_fresh)
- Low skill, high volume, *morale damage*; countered by cheap scrub. (wave3_sysadmin_fresh)
- Make the learning *documented*: codex entries self-annotate ("they now wear hard hats vs
  firewalls"), giving players a reason to read the codex and a payoff loop with the Threat Codex
  meta-pattern. (wave3_general_informed)
- Parody skins must carry mechanics, not just art: each parody wears a small *predictable stat rule*
  (hard hat = firewall resist, cat ears = IDS duck) so players can read the adaptation and answer it
  — the visual gag doubles as tactical information instead of noise. (wave2_gamedesigner_informed)

### Script-Kiddie movement speed — *CONFLICTING*

The dispute is the tier-1 chaff unit's locomotion, and it decides what the tutorial teaches. A slow
walker is a *reading* exercise (you have time to identify the lane and place the counter); fast chaff
is a *throughput* exercise (volume pressure and free-kill economy). The two cannot both be the
early-game's first lesson.

#### Position A — jittery and erratic, neither tutorial-slow nor swarm-fast *(master)*

Master's Script Kiddie is "chaotic, loud, easily stopped", fires one known exploit at a random
service, aims at whatever is most visible, gives up after about three failed attempts, and renders
with **scruffy, jittery, erratic movement**, a trail of dropped soda cans, and neon-rainbow unit trim.
The pressure it applies is **support-ticket noise and reputation damage from defacement**, not
pathing speed — so master's dial is set on *unpredictability*, leaving raw speed unspecified.

#### Position B — slow, dumb walkers *(opencode, Variant A)*

Trudge known paths (port 22 lane, port 80 lane) in oversized hoodies; catchable, readable,
tutorial-pace. (wave1_visual_fresh, wave3_general_fresh)

#### Position C — fast chaff *(opencode, Variant B)*

"Fast, weak, numerous, loud" — swarm pressure whose whole point is volume and free-kill economy.
(wave2_general_fresh)

### The Grinder (Credential Stuffer)
Slow, relentless, never stops, tries lists forever.

**How it works:** Cannot be killed, only made unprofitable. **This is the archetype the Attacker
Budget system (§2.1) exists for** — the Attacker Ledger line "*Grinder: spent 41 hours, netted 0
accounts. Left.*" is the whole lesson made arithmetic.

### Booter Kid
Buys 90 seconds of a large botnet because a customer of yours beat them in a video game. (See §2.3.)

### Botnet Herder / Botnet Operator
A silhouette holding many leashes.

**How it works:** Each leash runs to a compromised consumer device icon (router, fridge, camera).
Units spawn from *many* map edges at once. Killing the herder is impossible; you can only cut leashes,
which visually thins the swarm. They **rent capacity to others**, so the same botnet shows up working
for different clients across levels — which means you can gradually fingerprint it into a permanent
unlock ("known-bad ASN list"). Their attacks scale with volume and aim at your fattest pipe.

### Extortion Crew / The Extortionist
Sends a ransom demand *before* attacking.

**How it works:** Escalates until paid, and **tracks whether you paid last time** — payment makes you
a marked target permanently. You can pay (instant cash loss plus a "known payer" tag that increases
future extortion frequency) or defend. Pure risk/reward with a long tail, and a **negotiation
mini-decision** rather than a combat one.
**Visual:** portrait is a stylized mask; their signature is the ransom overlay that partially occludes
your UI (constrained per §2.3's resolution).

**Variations and additions**

- **Opencode's treatment — The Booter / Extortionist** — Sends a "free preview" (small probe
  attack), then a bill. Pay or get hit; refusing unlocks a counter-attack arc; visible scrubbing
  strength deters. **Stresser-as-a-Service escalation economy:** the attacker AI *buys* DDoS with
  its own budget — every wave you beat earns it "booter credits" and later waves come bigger and
  stranger, previewed in a threat-intel panel. Prevents "one defense wins forever": the counter must
  *shift*. Game servers, CDN, all late-game framing. (sysadmin, gamedesigner)
- The DDoS-for-Hire Hitman (boss with a wallet): a rival customer pays a botnet landlord
  *mid-battle* — wave size is **auctioned in real time**, and you can outbid them (spend money to
  shrink the wave): money-vs-defense conversion made literal and dramatic.
  (wave2_gamedesigner_fresh)
- The protection-racket shape: a text file arrives — "pay $5,000 in crypto or we flood your network
  every match day." Accept: it becomes *recurring* and your mitigation buildable never earns trust.
  Refuse: extortion floods test your scrubbing capacity. (wave4_ceo_fresh)
- The refusal branches spelled out: pay = funds the attacker and marks you *payable* (escalating
  second attacks); absorb = you must own scrubbing capacity; announce you never pay = deters none,
  but transparency can *gain* reputation with customers. (wave3_ceo_fresh)
- Extortion with no infection at all: "pay or next week we hit you" — ignore = a predicted attack
  carrying 3 hints; pay = funds gone and they return (real-world: they always return).
  Moral/economic branch. (wave2_sysadmin_fresh)
- Their aim is revenue moments: hitting a customer's launch, a game final, a live stream.
  (wave3_ceo_fresh)
- The booter *contract* twist: an extorted hire runs waves with a visible "contract" banner — and
  after enough waves the competitor *sues you for tortious interference* when you scrub their
  traffic: a dual-track (legal + technical) counter. (wave4_general_fresh)
- The Payer-List Leak (extortion sequel): refusing a booter's extortion is not a clean win — weeks
  later their forum posts a "known to pay / known to resist" list and your name changes *who bothers
  you*. Reputation now has an attacker-side audience: visible resistance deters; visible payment
  paints targets on you *and* your co-tenants. Second-order economics of the refuse/pay branch.
  (wave2_ceo_informed)
- Review-ransom variant: "pay or a 1-star wave." Plus surface the booter-credit economy in the
  threat codex — their price lists, which of your counters are "expensive" for them — making the
  adaptive-wave system *readable* rather than arbitrary. (wave3_general_informed)

### The Griefer
Targets one customer, not you.

**How it works:** If you don't defend *that customer specifically*, they churn and post about it. The
archetype that makes per-tenant defense a thing you have to think about.

### The Competitor (the game's rival AI)
Doesn't attack your servers; attacks your *business*.

**How it works:** An intelligent adversary who watches your build and **attacks whatever you just
removed or downgraded**, and whose attacks are aimed at your **newest** customer and your **biggest**
customer. Strategic, informed, and occasionally legal-but-hostile.

**The full commercial attack list — everything real competitors actually do, all of it legal:**
fake reviews; **poaching your best employees and your account manager (and their relationships)**;
undercutting on price; **undercutting only on the specific SKU your biggest customers buy** (surgical,
not general); **buying your brand keywords** (with a retaliation ladder ending in a trademark
complaint and an uneasy truce); **publishing a "[you] vs [them]" comparison page** that ranks for and
intercepts your own branded search; filing spurious abuse complaints against you; buying your product
to find weaknesses; screenshotting your dashboard; timing latency attacks to your demos; **ETF
buyouts of your contracted customers** (the most effective one, and a direct cash attack);
**sponsoring the same community you sponsor, at a higher tier**; **winning the platform "recommended
host" slot you held**; **raising affiliate commission to 200% of first-year revenue**; and **timing a
promotion to your renewal cohort, which they can infer from your public signup dates** — making your
**renewal calendar a piece of intelligence** the rival can exploit.

**⚔️ Tension — an invisible antagonist is easy to forget.** Wave-1 says "their attacks are invisible
on the infra board entirely — you see them only in churn graphs and the business panel," and calls
threats that exist on a different screen "a genuinely interesting design space," which is true and
which the doc then leaves empty. A rival that only manifests as numbers will not register as an
antagonist. **Give the Competitor state and surfaces:**
- **Four visible numbers on a rival card: their price, their reputation, their capacity, their cash.**
  All four move in response to the market and to your actions, and all four are *knowable* via a
  Competitor Teardown. Their behaviour becomes predictable-but-adversarial rather than scripted.
- **A stated strategy per run** — "undercut," "upmarket," "acquire," "niche" — inferable from their
  first three moves and therefore counterable.
- **The storefront at the map edge**, always visible at Z3 and Z4, with its own uptime board, its own
  price tag, and its own visitor stream you can watch. It grows when they win a deal you lost, puts up
  a banner when they launch a competing product, and its lights go out if you win. **Their success
  should be in your peripheral vision constantly, in the same frame as your own building.**
- **The trade-press ticker** — every competitor action generates a headline, so their strategy is
  *readable* if you follow the news.
- **A shared-market panel** — one bar showing the segment split between you, them, and the rest,
  updated monthly. One bar, not a dashboard.
- They should occasionally **do something correct that you should copy**, which is far more motivating
  than pure antagonism.
**Visual:** wears a suit; portrait is your own logo with the colours inverted. Occasionally sends a
poacher — a little figure in a suit — up your lane to hand flyers to your visitors. **The Competitor
Saboteur** renders palette-swapped versions of your own threat set in the competitor's brand colour,
so you can tell "this is targeted, not ambient," and their attacks are always aimed at whatever
customer you most recently won.
**Counter:** §3 and §6 business mechanics, not firewalls.

**Variations and additions**

- **Opencode's treatment — The Competitor ("FUD Mercenary")** — Doesn't attack servers — attacks
  *customers*: converts your inbound traffic with smear balloons / hires attacks / poaches with
  migration offers timed to your outages (you can do both to them in sandbox). Visual: a delivery
  van in parody rival colors driving your customer lane with a lasso, yanking figures mid-walk.
  Counters: marketing towers, price signage, loyalty auras, SLA contracts that rope customers to
  your path. Rare but enrage-y. (general, sysadmin, visual)
- The recurring-rival form: a *named* hosting-company avatar camps the map edge — hiring botnet
  surges, filing bogus abuse reports at your upstream, handing your customers migration coupons. Not
  destroyed — *outperformed*: your win-rate against them = the reputation gap. Boss-slot recurring
  antagonist. (wave2_general_fresh)
- The Competitor Hired Gun (mid-boss): sustained, adaptive, targets your *revenue* — hits right
  before a customer's launch, dials DDoS exactly when you flip pricing; counter with decoy
  infrastructure and threat-intel staff. (wave2_sysadmin_fresh)
- Attacks *and markets*: between attack waves their packets seduce your customer-lane entries
  mid-lane; a persistent rival = a mid-campaign arc villain. (wave4_gamedesigner_fresh)
- Full dirty-player toolkit: fake 1-star review bursts, poaching your staff units (they walk OFF the
  map with their skills!), filing a lawsuit that freezes one buildable *class* for N waves, and
  buying up your transit so your bandwidth costs double until you diversify uplinks. Spicy
  PvP-adjacent texture in single-player. (wave3_gamedesigner_fresh)
- Black-SEO / hit-job flavor: hires the booter, files false abuse reports, poaches customers during
  your outages — rival-AI. (wave3_sysadmin_fresh)
- The Undercut: the competitor AI launches the same SKU 40% cheaper in your segment — without
  differentiation moves (bundle, support SLA, brand, niche focus) your win rate on incoming
  prospects drops wave after wave: a race-to-the-bottom pressure event. (wave2_ceo_fresh)
- The Poaching War: they hire away your best support engineer — account knowledge leaves with them
  and three enterprise customers "follow" at renewal. Staff become attackable assets. (Late, mean,
  memorable.) (wave2_ceo_fresh)
- Free migration credits, price-match offers, and churn made attack-driven; counter with loyalty
  pricing, annual-plan lock-ins, and migration-fees-as-defense (a ToS buildable). (wave1_ceo_fresh)

### The Researcher / White Hat
Not a threat, but *arrives like one*.

**How it works:** Probes you politely, then emails a report. If you have a bug bounty or security
contact, they disclose responsibly (small cash cost, big benefit) and become an asset who warns you
about future threats. If you have no contact channel — or you threaten them — they go public and it
becomes a reputation scar. **A "threat" whose correct counter is being a decent person**, and a
beautiful teaching device: the same unit is a gift or a disaster depending on prior investment.
**Add the version that is more common and more awkward — the beg bounty.** Someone emails claiming a
critical vulnerability, refuses to detail it before you agree to pay, and the "finding" turns out to
be a missing HTTP header. Triage: pay (invites more), ignore (a small chance they were real), or
publish a security policy that sets expectations. **Distinguishing the real researcher from the beg
bounty is a nice, low-stakes, recurring judgement call, and it makes the genuine researcher feel more
valuable when they appear.**
**Visual:** arrives in white-ish grey, pokes at your surface politely, leaves a **report scroll** on
your desk. The only "threat" that walks in the front door and knocks.

**Variations and additions**

- **Opencode's treatment — The Security Researcher (friendly-ish)** — A white-hat probe that trips
  your defenses; if blocked, files a disclosure; if your WAF bans them, they tweet. A skill check
  disguised as a threat. (sysadmin)
- Friendly Pen-Test Collision: a real customer's red team exercises *on you* without warning while a
  genuine attack wave is inbound — two indistinguishable hostile flows, one contractual (blocking it
  = penalty + lost whale) and one criminal (allowing it = breach). A purchased "test-window
  coordination" procedure marks authorized probes… and attackers learn to spoof the marks (counter
  to the counter). VPS, regulated, game hosting. (wave3_general_informed)
- The Gray Hat form: a neutral unit walks in and *hands you a 0-day report* — accept (patch + unlock
  the counter early) or ignore (they disclose publicly → a wave of copies later). A moral/economy
  choice. (wave2_gamedesigner_fresh)

### The Journalist / The Activist Blogger
Amplifies whatever your worst moment was this quarter.

**How it works:** The activist variant publishes your **abuse-desk failures**, and the damage scales
with **how correct they are** — which makes it the one reputation threat you cannot spin, only
prevent.

### Spam Gang
Doesn't attack you; **uses** you.

**How it works:** Signs up as a customer, sends spam, gets your IP ranges blacklisted, which silently
destroys your email deliverability and your other customers' business.
**Counter:** abuse team, KYC on signup (reduces signup conversion), outbound rate limits, sending
segmentation.

### Cryptominer Tenant
A "customer" whose workload is pure parasitism.

**How it works:** Pays the minimum, consumes maximum CPU and power. Profitable at first, catastrophic
at scale.

### The Booter Customer
A *customer* who is also an attacker — paying you while attacking others.

**How it works:** Profitable and radioactive. The clean statement of the "your revenue is your enemy"
family.

### The Abusive Customer
Pays you, and is the source of the outbound spam / DDoS / copyright complaints.

**How it works:** You must choose: keep the money, or keep the reputation. **Recurs by name across
levels**, which makes the choice compound.

**Variations and additions**

- **Opencode's treatment — Abusive Tenant / "Spike" (the decision enemy)** — A *paying* threat:
  generates revenue while inside your perimeter (spam-launching, scanning neighbors, mining,
  scamming, harvesting, hosting malware) — attacks originate from YOUR ASN and upstreams file abuse
  tickets against YOU. Eject = instant MRR loss + support/legal fight + refund demand + bad review;
  keep = fines, seizure risk, shared-IP blacklist poison. A moral "infected sheep" mechanic; the
  game's best *decision* enemy. Bulletproof levels let you keep him cheaper. Visual: spawns from
  *inside your own queue* — a warm round customer that sheds its coat at the door and reveals spikes
  underneath; can't be pre-blocked at the gate, needs internal IDS eyes and cage locks. (general,
  sysadmin, gamedesigner, visual)
- "The Drop" (the frame job): attackers don't breach you to steal — they breach a weak tenant to
  *plant* contraband on your storage, then tip the authorities. A seizure-meter spike with *no
  intrusion alarm*: detect the plant (integrity scans, ingest provenance) before the raid wave, or
  prove chain-of-custody innocence after. The Abusive Tenant knows and pays; this is a false flag.
  Offshore, storage, VPS. (wave3_general_informed)
- Abuse-as-customer-class: spammers, phishers, miners and bot-herders as tenants who PAY and DESTROY
  — their revenue vs. the blocklist/seizure/upstream-drop risk they generate; the "no abuse policy"
  buildable (abuse-desk staff, KYC signup gates) costs money and repels *both* good and bad
  customers — a genuine business tension, not a checkbox. (wave2_ceo_fresh)
- Counter menu = AUP enforcement actions you choose between: warn, throttle, terminate (= lose
  money, keep face with peers) — driving the reputation/blacklist meters. Every hosting type's
  signature moral dilemma. (wave2_general_fresh)
- A *faction mechanic*, not a unit: abusing the abuse policy either way loses you — ignore =
  blocklisted + partner bans; act = chargebacks + forum rage. (wave2_sysadmin_fresh)
- "The Guest Who Won't Leave": the enemy you *built yourself* — evict = instant revenue loss + maybe
  a retaliation DDoS; keep = rising Heat and eventual raid/lawsuit. Money vs. integrity, forced.
  (wave3_gamedesigner_fresh)
- Distinct mechanic: you must evict them yourself — automated defenses won't fire because they're a
  "customer." (wave4_general_fresh)
- "The Mole": looks exactly like a customer until it starts *drilling its own rack from the inside*
  — its camo pattern subtly differs; a test of player attention. (wave2_visual_fresh)
- Customer-as-Threat (Trojan Tenant): the only entity allowed to cross lanes — warm colors in the
  queue, then their satisfaction aura *inverts to hostile violet* once inside, and they become a
  threat spawn source; the visual reward for inspect-often play: loupe view shows the seam.
  (wave3_visual_fresh)
- The Side-Channel Spy (noisy-neighbor noir): the malicious upgrade — a co-resident VM you *cannot
  see* measures micro-timings of shared cache/power and reconstructs private keys from your
  customers' cryptography. An event with no packets: nothing crosses any lane, so the only evidence
  is a *thermal/timing anomaly* on a shared host — exclusively a dashboard-reveal (monitoring +
  correlation, not DPS). Counter is architecture: dedicated tenancy, scheduling jitter, or moving
  the victim. On colocation the culprit may literally be *another player's rack* (late-game PvP
  flavor). VPS/cloud/regulated. (wave2_general_informed)
- "The tenant from hell": drilling into their pod (crypto-mining heat plume, spam-envelope factory)
  — charming but destructive; counter = the ToS-shield evict animation: a giant hand flicks them
  off-map, leaving a bad-review crater. (wave4_visual_fresh)
- The Spambot Exhalation: your infected tenant *emits* blocklist-particles that travel to
  mail-reputation meters — the threat is your own customer turned into a walking liability.
  (wave3_general_fresh)

### Nation-State / APT / The Quiet Ones
Extremely rare, extremely patient. Doesn't want money; wants presence.

**How it works:** Doesn't flood. Sits dormant in your network for many minutes doing nothing,
spreading quietly, and only reveals itself when it wants something. May sit dormant for an entire
level; if you never detect them, you "win" the level and lose the campaign beat. **The only threat
whose damage is narrative.** Cannot be "beaten" — only detected and contained. Targets *data* and
your *management plane*, not uptime.

**⚔️ Tension — "if you never detect them you experience nothing" is an absence, not a design.** Make
the boss out of **weak signals**: none conclusive, any two together sufficient.
1. **An absence** — one machine's log volume drops slightly because something is trimming logs.
   Visible only if you have baselines.
2. **A contradiction** — egress bytes exceed what your traffic model predicts, by a small margin, only
   at night.
3. **A witness** — a third party (a peer network, a researcher, a vendor advisory) mentions an
   indicator that matches something in your estate, in the ticker, once.

**And the two things that make it playable rather than purely atmospheric:**
- **They use your tools.** APT activity looks like administration because it *is* administration —
  legitimate credentials, standard utilities, scheduled tasks, the backup agent. The detection signal
  is not "malware" but **"an admin action at an unusual time, from an unusual place, by an account
  that doesn't normally do that."** The counter is a **behavioural baseline**, which requires history,
  which requires you to have been collecting logs for months before the incident. **A defense that
  must be purchased a long time in advance is a wonderful thing.**
- **You will be told by someone else.** The most common way an APT is discovered is a phone call from
  a government agency, a vendor, or a journalist. Make that the standard reveal, and make the player's
  **log retention depth** determine how much of the story they can reconstruct — with a brutal beat if
  retention is 30 days and the intrusion is 8 months old: *you will never know what they took.*
**Counter:** IDS, log retention, egress filtering, segmentation, behavioural baselines — detection,
not prevention.
**Visual:** almost invisible — a faint shimmer/heat-haze that only appears in the security overlay. A
single, slow, dark, **under-saturated** unit that moves deliberately, ignores your loud defenses, and
probes quietly. It doesn't attack when you're watching. It should never be flashy; the horror is how
ordinary it looks. Alternative rendering: **nearly transparent, visible only as a shadow on the floor
with no object above it** — a visual impossibility that reads as "something is here that you can't
see," and it copies data out at one card per minute. Its presence is shown by *absence*: a faint thin
line from one of your machines to the map edge visible only under the flows overlay, and telemetry
going suspiciously quiet. **Make the quiet concrete:** the Hum Bar and the Pulse Strip show a
**flattening** — variance dropping below the normal noise floor, visible as an unnaturally smooth
stretch. **Real logs are noisy; too-clean is the tell. Teaching players to be suspicious of tidiness
is a real security lesson and nobody has ever gamified it.**

**Variations and additions**

- **Opencode's treatment — Nation-State APT ("The Long Game" / "The Patient Boss")** — A multi-phase
  boss persisting across *several levels* of a campaign: invisible probes map your estate for a
  whole level, steals credentials, lateral-moves, then strikes exactly the weakest edge and
  exfiltrates — with persistence that survives reboot (a *dormant* unit that wakes near end-level).
  Cannot be "tallered"; countered by architecture and detection engineering: egress control,
  segmentation, anomaly detection, honeypots/deception, least exposure, threat-intel unlocks.
  Visual: a black angular drone crossing at sky altitude (its own lane above ground defenses),
  ignoring every tower until you build air defenses; it rarely destroys — it *extracts*: a thin
  thread of data unspools to it, and after it leaves only forensic residue (a glowing footprint)
  shows where it went. 2-3 per campaign, always act-enders. Regulated finale boss. (general,
  sysadmin, gamedesigner, visual)
- The 3-stage boss "The Patient Boss": reconnaissance (invisible, tags your units — the "marking"
  phase, telegraphed by tiny anomaly ticks), weaponize (steals *one of YOUR buildables* to use as
  its siege engine), exfiltration (slow creep toward the border carrying glowing data) — you can
  only stop it in the exfil stage unless detection investment is huge. (wave2_gamedesigner_fresh)
- "The Ghost": translucent, slow, ignores most defenses; picks ONE server and spends minutes
  siphoning data (visible thin thread); getting through doesn't crash you — it just *ends the
  contract* (regulated levels: fines + certification loss). Dread pacing. (wave2_general_fresh)
- Pre-positioning: invisible units sit dormant the whole level, then activate in coordinated
  sabotage; detection via anomaly/baseline systems. (wave2_sysadmin_fresh)
- The assassin pattern: one per act on late/regulated levels — plants persistence beacons and only
  becomes visible when it acts ("exfil nights"); you can't out-tower it, you *hunt* it with
  honeypots + anomaly monitoring. (wave3_gamedesigner_fresh)
- The quiet intruder: bypasses towers entirely and sits dormant until it reaches crown-jewel
  targets, then *exfiltrates on a timer* — detect the beacon, not the unit. (wave3_general_fresh)
- They *live* in your network for months: counters are detection maturity (SIEM tower, threat-intel
  feed), not walls. (wave3_sysadmin_fresh)
- "Chess vs. whack-a-mole": barely attacks — plants long-beacons, moves laterally, waits until your
  *score peak* to steal the customer database; counters: segmentation geometry, audit overlay, decoy
  datasets. (wave4_gamedesigner_fresh)
- "The Long Con": infiltrates slowly — phish one staff member, pivot, establish persistence *across
  levels* (persistent world-state!); counters: EDR telemetry, SOC analyst units, segmentation.
  (wave4_general_fresh)
- Visual variants of the unseen: a silent black tentacled shape entering from off-map with NO tracer
  line — a rule/color-script violation is the whole point, the only threat whose origin you can't
  see until it surfaces inside (wave2_visual_fresh); "The Silent Wave": ONE black geometric shape
  with a sound-dampened halo, invisible to normal overlays until it strikes — budget a whole HUD
  layer on it; it reframes the game from horde to puzzle three times per campaign
  (wave3_visual_fresh); "The Silent Van": parks at the map edge and *nothing happens* for a whole
  wave while your radar shows clean — the tells are environmental (a neighbor's camera angle shifts;
  a staff sprite gets a subtle "recruited" eye-glint), exposed only by Counter-Intel buildables that
  repaint it (wave4_visual_fresh).
- Watering-Hole Tail: attackers sit on a site your *staff* visit — the counter is egress filtering
  rather than the perimeter. (wave3_general_fresh)
- DDoS-as-Distraction pairing: wave A blares loudly while the APT's wave B (low-and-slow
  creds-stuffing) walks the side door — intel staff spot the paired attacks. (wave2_sysadmin_fresh)
- "Can't be turreted; countered by architecture" is correct but unsatisfying *in the moment* —
  architecture is invisible. Surface the counters during the fight: egress checkpoints visibly
  *resist* the exfil thread, anomaly towers shove the drone into a "re-surfacing timer" so the hunt
  is an active loop, and segmentation (blast doors, zones) literally *blocks its path lines on
  screen* — architecture made into a visible battlefield, not a menu state.
  (wave2_gamedesigner_informed)
- The dormant-unit rules, made mechanical: dormant = invisible on all layers EXCEPT
  behavior-baseline anomaly (two towers can see it — monitoring at high tuning, or the Flow Lens'
  "who talks to that country?"); wake triggers = proximity to your crown-jewel data or a timed date
  (the quiet-night-shift level); removal choice = surgical evict (fast, 30% re-infection because you
  missed the second implant) vs zone reimage (slow, guaranteed, customers bounce). The "defense is
  surgery" line needs these three mechanics to be true. (wave2_general_informed)
- Living off the land + stolen-trust certs, the two real signatures the stealth-boss misses: (a)
  **no binaries** — they use your own tools (ping, ssh, the admin CLI) so file scanners and IOCs are
  blind; only anomaly detection on your own traffic (the NetFlow family) sees it; (b) **a valid
  stolen cert** — the attack arrives wearing TLS armor, so inspection-at-the-proxy
  (decrypt-everything) becomes the counter — with a *privacy cost in regulated zones*, and the
  regulator's light cone hates it. The MITM theme inverted: sometimes the good guy has to be the man
  in the middle. A great dilemma tower. (wave2_sysadmin_informed)

### Hacktivist Wave / Hacktivist Swarm
Triggered by a customer you accepted whose politics attract attention.

**How it works:** A business decision creates a security event — an explicit cross-system link between
§3 and §2, and **the only threat generated entirely by the player's own choices.** Volume plus press.

**Variations and additions**

- **Opencode's treatment — Hacktivist Collective** — Distributed, ideologically aimed at a customer
  you onboarded: DDoS + doxxing + press waves; reputation damage is the real vector. (sysadmin)
- Defacement with honor: political event chains (a real-world-flavored news ticker) predict wave
  timing; the goal is humiliation — a defaced homepage drops reputation *hard* even with zero
  downtime; counters: change management, WAF, and the public status page (the honesty tower
  mitigates rep loss). (wave2_sysadmin_fresh)
- The Hacktivist Crusade: a customer's content (or your takedown refusal) rallies anonymous
  activists — floods + doxxing + a bot-driven support-ticket storm (thousands of template tickets: a
  support-lane boss that must be CAPTCHA'd away, not scrubbed); interacts with your
  content-moderation stance (brand safety vs. revenue). (wave4_ceo_fresh)
- Level-form twist: if you host controversial tenants, *defending the controversial tenant becomes
  the win condition* while the swarm hammers — a protected-object TD hybrid level.
  (wave4_gamedesigner_fresh)
- The masked attacker with a manifesto: DDoS + leaks + DDoSing *your customers* for indirect
  pressure — negotiable or deniable, and each choice has delayed consequences. (wave4_general_fresh)

### The Carder Ring
Attacks your checkout, not your servers.

**How it works:** Uses your signup form to validate stolen cards. Costs you processor standing.

### The Disgruntled Ex-Customer
Left angrily, still has API keys, still points DNS at you, still costs you bandwidth. (See §2.10.)

### The Abuse Desk of Another Provider
An antagonist that isn't an attacker.

**How it works:** They send complaints, and **ignoring them escalates to your upstream.** A threat
whose entire attack surface is your inbox.

### The Regulator
Not malicious, but arrives with a deadline and a fine schedule.

**How it works:** Arrives **on a schedule, not a wave.** Cannot be defeated, only prepared for. Drawn
in the Threat Gantry anyway, for comedy. Fines render as gold coins flying *away* with a
stamped-paperwork animation.
**Visual:** a slow, unstoppable figure with a clipboard who walks straight through your defenses.
**Add the joke that makes the point:** they should be the only entity in the game that your defenses
visibly **acknowledge and stand down for** — the turnstile opens, the lattice switches off, the gate
lifts. Watching your own security politely let them past is much funnier and more pointed than having
them ignore it.

**Variations and additions**

- **Opencode's treatment — The Regulator Walkby** — A clipboard inspector with a light-cone gaze —
  not violent, just inevitable; regulated acts are scored partly on keeping every cone-swept zone
  compliant *at the moment of passage*. Subpoena freeze-event: serve data or violate law; which
  options exist is determined by your compliance posture; survivable passively if you kept logs
  properly. (visual, general)
- The moral dilemma form: a timed demand unit — hand over customer logs (break your privacy promise
  → churn) or refuse (fines, possibly shutdown). Board effects either way. (wave3_general_fresh)
- The Right-to-Audit Clause (customer-owned version): an enterprise contract you signed grants
  annual on-site audits — for several waves auditors roam your map, pulling staff off ops and
  exposing any drifted compliance. Pass spotless and renewal probability + expansion revenue jump; a
  threat that is also a *sales tool* (some prospects only sign after a successful audit) — walk the
  knife edge. (wave2_ceo_informed)
- The Malicious Compliance Order: a regulator command event — *shut down this healthy tower* (or
  firewall that port) for cause. Refuse = fines and heat; comply = a capability hole the next wave
  walks straight through. The decision-enemy that makes the auditor family feel like chess instead
  of homework. Regulated/offshore/gov. (wave2_gamedesigner_informed)
- The Regulator Raid: instantly freezes operations for 30s ("inspection") unless your compliance
  score exceeds a threshold at arrival — a *build-check* threat, not a pathing one.
  (wave2_gamedesigner_fresh)
- The Regulatory Hammer: unstoppable, unattackable — arrives when your heat/compliance meter crosses
  a line; it doesn't destroy servers, it destroys your *bank* (fines) and your *lane* (service
  suspension order). Only counter = pre-built compliance. Law-enforcement variant for offshore:
  seizure countdown, survive until relocation. (wave4_gamedesigner_fresh)
- Regulators as named visits: FTC (dark-pattern billing), GDPR/DSA (data requests), state utility
  commissions (odd but real for some ISPs) — legal fees + forced buildable changes (e.g., one-click
  cancellation); the FTC fine is a late-game boss: "negative $2M". (wave1_ceo_fresh)
- Fines as threat-money: GDPR/FTC/state-AG actions *scaled to revenue*, plus mandated compliance
  buildables — in offshore, instead: a seizure raid, no fine. And low compliance at inspection =
  immediate cash penalty + a build-lockout until you purchase remediation. (wave2_ceo_fresh,
  wave4_general_fresh)
- The scheduled-wave form: the auditor entity walks an inspection path over defined points —
  uncovered controls become findings, fines, contract locks; in non-regulated types the surprise
  variant is a data-protection authority investigating *after your breach disclosure*.
  (wave3_ceo_fresh)
- Threat inversion for enterprise: your *customer* is audited and your datacenter is in scope — a
  "vendor questionnaire tsunami" dumps 600 security questions with a deadline; incomplete answers =
  contract loss. Compliance buildables become revenue defense. (wave3_ceo_fresh)
- Visual: walks room-to-room, each pass stamps green/red — the drama is the stamp sound + red ink
  blooming; per-asset compliance state is a visible tag icon and the level is won by *pre-staging*.
  (wave2_visual_fresh, wave3_visual_fresh)
- Regulatory Change variant: new legal requirements apply *retroactively* — an unplanned compliance
  purchase forced mid-campaign, or a whole visitor tier is lost (the Government/Regulator visitor,
  §4, treating well lowers these odds). (wave0)
- The Audit That Never Ends: passed audits require periodic re-certification, so compliance becomes
  recurring overhead (an upkeep line), not a one-time unlock — the gate level ("Compliance Wall") is
  only the first payment. (wave0)

### The Auditor
A slow-moving "visitor" that walks your facility and converts findings into blocked revenue.

**How it works:** Shares a silhouette family with The Regulator and The Gavel so "authority figures"
read as one visual class.

### The Plaintiff's Attorney
Post-breach class action. Long timer, large cash. (See §2.10.)

### The Bank
Your lender is an antagonist in exactly one way: **covenants.**

**How it works:** A leverage ratio, a minimum cash balance, or a debt-service coverage ratio that
converts an ordinary bad quarter into a default. The only antagonist whose weapon is a spreadsheet you
signed.

### The Market
The pure macro enemy.

**How it works:** Spawns economic events — a GPU price crash, a crypto crash, a recession that raises
churn across every SMB customer simultaneously, a licensing repricing, a component shortage. **The
antagonist of the business layer**, and the reason a perfectly run company can still lose.

### Entropy (the unattributed director)
The one enemy every level has.

**How it works:** Spawns hardware/power/environment events at a rate driven by your fleet's **age,
density, and maintenance backlog.** Not a person, not a portrait — a pressure. (See §2.8's Entropy
Pressure Budget.)

### Your Own Customers
Spawns tickets, misconfigurations, sudden traffic, and abuse.

**How it works:** Should be responsible for roughly as much trouble as all the hackers combined,
because it's true and because it's funnier.

### Mother Nature
Hurricanes, heat domes, floods, wildfire smoke clogging filters (real!), freezes, drought.

**How it works:** Regional, telegraphed by a weather system, and the entire argument for multi-region.

### The Crawler Consortium (search engine bots)
Ambiguous entity: costs you bandwidth like a scraper but *raises* your reputation.

**How it works:** Blocking it is a visible mistake — your SEO meter dims. An excellent teaching moment.
**⚔️ Visual correction:** wave-1 draws them in **cyan-gold**, "a colour that is intentionally both,"
which fails the colour-blind requirement and muddies two reserved hues. **Keep them cyan** (they are
legitimate traffic) and make the ambiguity a **shape**: a circle with a **dashed** outline, where a
Scraper Locust is a circle with a **dotted** outline. Dashed vs dotted survives greyscale, survives
16px, and the "you must look closely" tension is fully preserved.

### The Quiet Professional
The second attacker AI: where kiddies are loud, many, and easily patterned (tutorial fodder),
professionals arrive with **3 health bars — stealth, persistence, exfil speed** — tuned differently,
so specialization matters. (wave2_gamedesigner_fresh)

### Cybercrime-as-a-Service Cartel
Well-funded and adaptive — they *read your build*: attack towers are upgraded between waves to
counter *your counters*. The anti-meta villain for late game. (wave4_gamedesigner_fresh)

---

## 2.12 Type-specific threats

*The threat mix is one of the six ruleset slots (§0.2). These are the signature threats that make each
hosting business feel like a different game.*

### The pruning rule for this subsection
A type-specific threat earns a full mechanical slot only if it **changes the player's verb**, not just
the noun.

**How it works:** Roughly sixty entries live here, many of them one line. Apply §2.1's pruning rule
hard. **Keep as full mechanics:** Toll Fraud (spend caps), DNS Water Torture (defeats the cache —
changes the answer), the Empty Server Spiral (visitors affecting visitors), the Admission Webhook
Deadlock (self-locking), the Encryption Key Nobody Has, the Tenant Who Overloads The Circuit, Rain
Fade, the Missed Pass, Silent Deprioritization, the Un-cacheable Customer. **Demote the rest to Codex
flavour entries attached to an existing mechanical threat** — they still appear, they still read as
different, and they cost nothing to balance.
**⚔️ Tension:** this pruning is in direct conflict with the comprehensiveness goal for the document
itself. Keep every entry written here; the pruning rule governs *which get their own balance
numbers*, not which get written.

### The Population Effect (generalise the Empty Server Spiral)
"Visitors affect other visitors" is too strong a mechanic to use once.

**How it works:** A positive-feedback curve with **a floor below which it inverts**, applied wherever
it is true: game servers (population attracts population), community/forum hosting (activity attracts
activity), marketplaces, **IX peering** (carrier density attracts carriers), and the colo **meet-me
room**. It gives several hosting types a shared strategic shape: **get above the threshold fast, or
don't start.**

### Game hosting: The Grudge Booter
An attack aimed at a *single player's* game session that collaterally kills the whole server.

**Counter:** per-player IP obfuscation / a player-facing proxy — **which costs latency, the thing you
sell.** A perfect tradeoff.

### Game hosting: The Cheater / The Glitch Player
Not an attack on you; an attack on the *game* hosted by you.

**How it works:** A threat that lives *inside* the service and damages **customer happiness**, not
infrastructure. Customers blame you for cheaters.
**Counter:** anti-cheat integrations you don't control, which cost tick performance and occasionally
ban innocents — **Friction applied to reputation.**
**Visual:** a player pawn whose sprite animates on the *wrong frames* — it teleports a few pixels,
clips through a wall, moves at the wrong cadence. Everyone can spot it; **other player pawns visibly
turn to look at it and then start leaving the lobby.** The anti-cheat detection cone reveals them in
bright outline, and the ban animation (a lightning yank off the server) is a crowd-pleaser.

### Game hosting: Mod Update Day
A dependency you don't own updates and breaks 900 server instances simultaneously, at a time chosen by
someone else.

**How it works:** The modding community is **simultaneously your best marketing and your worst attack
surface**, which is the honest shape of this business.

### Game hosting: The Empty Server Spiral
A server that dips below a population threshold empties out and never recovers.

**How it works:** A reputation failure specific to communities: a full server attracts players, an
empty one repels them. **Visitors that affect each other** is unique to this type and mechanically
rich. See The Population Effect above.

### Game hosting: The Stream Sniper / Ghost Server
Fake servers in your public listing that impersonate yours.

**How it works:** Reputation damage with no technical vector.

### Game hosting: Competitor-Sponsored Attack
A rival host booters your flagship server during a streamer's session.

**How it works:** Reputation and churn, not cash. **The most visible possible moment to fail**, chosen
deliberately by someone who knows your schedule.

### Game hosting: Hype-Cycle Collapse
The non-attack problem that actually kills game hosts.

**How it works:** A game's population peaks and collapses on a curve nobody controls. You built
capacity at the peak. Cash burned at the top of the curve is cash you never get back.

### VoIP: Toll Fraud Night
Attackers brute-force a SIP extension at 2am Friday and dial premium-rate international numbers all
weekend.

**How it works:** You get the carrier bill on Monday for $60,000. **The attack that costs money
directly, silently, and overnight** — the fastest-bleeding threat in the game. Its tell is the *time
of day*, which makes the day/night band a threat-detection tool.
**Counter:** geo-dialling restrictions, **spend caps** (a cheap control that prevents the single most
expensive failure — the player who skips it will only skip it once), anomaly detection, strong
extension passwords, an SBC.
**Interacts with:** §2.21 Cost Attacks; §2.26's Taxi Meter is its widget.

**Variations and additions**

- **Opencode's treatment — Toll Fraud (PBX/SIP pumping)** — The UCaaS classic: attackers crack a SIP
  trunk and dial premium-rate international numbers for 12 hours — your invoice: $40K overnight. The
  purest money-leak threat: an invisible enemy drains *cash, not uptime*, while a tiny clue (odd
  call pattern) hides in the logs. Counters: trunk ACLs / SBC rules, call-pattern anomaly monitoring
  tower, spending caps, and (darkly) insurance. (wave4_ceo_fresh, wave4_general_fresh)

### VoIP: Jitter Storms, Codec Mismatch, One-Way Audio
Degradations invisible to every uptime check.

**How it works:** NAT/firewall misconfiguration causing RTP to flow one direction only. Customers
report "they can hear me but I can't hear them," which is a routing problem, not a phone problem.
Degradation that is *audible* rather than numeric.

### VoIP: SIP Scanner Chorus
A constant, ambient, tuneless chirping of registration attempts.

**How it works:** Rendered as tiny cords repeatedly trying to seat and failing. Audio-visual ambience
as threat texture.

### VoIP: The 911 Obligation
Regulatory, and unforgiving.

**How it works:** Emergency-calling obligations, address registration, and the liability attached to
getting them wrong. A compliance threat with a human cost attached, which makes it the one regulatory
item in this business nobody argues about.

### Email: The Snowshoe Spammer Customer
Signs up for 40 small accounts across your range to spread low-volume spam under thresholds.

**How it works:** Detecting the pattern requires looking *across accounts*, not at any one.
**Visual:** a thin, wide drizzle from every edge of the map at once — visually the opposite of the
spam cannon.

### Email: The Customer Whose List Is Purchased
Not a spammer by intent — a legitimate business that bought a marketing list.

**How it works:** Their complaint rate poisons your **shared IP pool.** The counter is onboarding
hygiene checks, which lose you the sale.

### Email: The Silent Deprioritization
A major mailbox provider starts throttling you with no bounce, no notice, no appeal.

**How it works:** Delivery just gets slower. You find out from customers. **You can be perfect and
still be blocked, and nobody will tell you why.**
**Give the player something to do, because as written this is pure helplessness:** the large mailbox
providers publish **postmaster telemetry** (reputation, spam rate, authentication rates) that is the
only window into this. Making it a purchasable/enrollable data source — **one that shows you a number
nobody will explain** — turns despair into a diagnostic loop. And add the actual lever: **segment your
sending** (separate IPs/domains for transactional vs bulk vs per-customer) so one bad tenant damages
one pool instead of everything. **That is the single most important architectural decision in email
hosting and it should be a buildable.**
**Visual:** the Turned-Away Map (§2.26), where only *some* arrival arcs curl away, and slowly.

### Email: Blocklist Cascade / Spamhaus SBL Listing
One spammer → one blocklist → deliverability drops → every customer complains at once.

**How it works:** A single-point-of-failure reputational cascade. **Instant, total email-product
failure**, and delisting takes days.
**Visual:** **The Stamp of Spamhaus** — a giant rubber stamp descends from off-screen onto your
outbound mail flow with a satisfying/horrifying THUNK and leaves a red block mark across the lane.
Undoing it is a slow scrub animation with a brush.

**Variations and additions**

- **Opencode's treatment — Spam Ink-Mold (email)** — Black splats growing from unfiltered mailboxes;
  left alone, the grime physically covers the building — the reputation meter made facade. Content
  filters spray it; blocklists bleach the edges. The RBL tide = an environmental state: get listed
  and all inbound mail roads go red until delisting. (visual, general)
- The Outcast Pool (egress-NAT reputation poisoning): the inbound tide *reversed* — one tenant's
  scraper poisons your shared outbound IPs and now *your* traffic is refused worldwide: ACME
  renewals fail (cert bomb next door!), webhooks time out, partner mail vanishes. An outbound
  blacklist state that degrades every timer/cron object invisibly; the triage signature is
  "everything scheduled starts failing, nothing interactive does." Counters: egress-pool
  segmentation, dedicated SNAT per severity class, the delisting grind. VPS, SaaS, mail, CI.
  (wave3_sysadmin_informed)
- Stolen-Legacy /24 (its history-poisoned twin): a "clean" address block you bought carries a
  *criminal past* — spam kingpin, bulletproof, three botnets — and RBLs remember longer than
  registries do. The IPs arrive with a hidden reputation ledger: outbound mail dead-on-arrival, game
  logins pre-blocked. The only cure is the slow Reputational Penance ladder (warmup schedules, rDNS
  hygiene, time-gated delisting) — it cannot be paid away, which enrages players and is *correct*.
  Price the famine market by history. Mail, VPS, game. (wave3_sysadmin_informed)
- RBL Blacklisting as slow-burn meter: major providers start rejecting YOUR mail — customers can't
  receive their password resets → churn; counters: dedicated IP tiers, the delisting-paperwork
  mini-quest, spam-filter towers. (wave2_sysadmin_fresh)
- The Blacklist Storm (reputation death spiral): abuse tenants riding your IPs fill a global
  blocklist meter; each milestone *halves* inbound mail/customer trust until you run the de-listing
  minigame (prove SPF/DKIM/DMARC, warm the IP pool). (wave2_general_fresh)
- The Spamhaus Listing: your *netblock* gets listed (a spammy tenant triggered it) — customers' mail
  bounces everywhere, some enterprise deals auto-reject you at procurement, churn ticks up; recovery
  = evict the abuser + de-list application mini-task. Mechanically a reputation status effect on the
  *whole business*. (wave3_ceo_fresh)
- Blacklist Contagion: if a compromised box ever sent spam, your IP range stays greylisted and the
  customer lane throttles *even after cleanup* — punishes past sloppiness; a cleanup-service
  buildable reduces it. (wave4_gamedesigner_fresh)
- The Spam Botnet: bots register accounts on your platform faster than you filter — too strict and
  you reject real users; once any range is blocklisted, *all* customers' mail bounce.
  (wave4_general_fresh)
- The Spam Deluge variant: envelopes jam the sorting floor and your building gets a floating
  **SHUNNED** stamp that turns arriving customers away at the door (they visibly swerve off-path);
  cleaning = an appeal progress-wheel. (wave3_visual_fresh)

### Email: The Compromised Mailbox
A customer's password leaks; their account sends 200k messages before you notice.

**Counter:** outbound rate limits, which anger bulk senders.

### Email: Backscatter
Bounce messages from forged senders flood your queues.

### Email: The Spam Cannon (presentation)
**Visual:** a truck backing up to your mail gate and dumping envelopes. Filtering is a sorting
machine; **false positives are a legitimate envelope going into the shredder with a small guilty red
pip** — the deliverability tradeoff made visible.

### DNS: Water Torture
Random-subdomain queries that can't be cached and must be resolved, hammering the authoritative
backend behind the cache.

**How it works:** **The attack designed specifically to beat the defense.**
**Counter (and the nuance that makes it a real fight):** not just Response Rate Limiting but
**NXDOMAIN synthesis / aggressive negative caching** at your edge — **and the cost is that a customer
who legitimately adds a new subdomain waits for the negative cache to expire before it resolves.** A
defense that makes your product slower to change; perfectly on-theme.

### DNS: Reflection Conscription
You become someone else's weapon; the victim's upstream starts blocking *you*.

**Counter:** Response Rate Limiting.
**Visual:** your own node blasting a cone off-map while an angry abuse-complaint glyph flies in.
**Being the weapon instead of the target is a fresh image.**

### DNS: The Fat-Finger Zone Push
One bad zone file, published globally, in seconds.

**How it works:** The registrar-hijack outcome with none of the villain. Counter: zone validation,
staged publication, and a TTL you can live with.

### DNS: NXDOMAIN Flood and Free-Tier COGS Leak
Two quieter DNS problems.

**How it works:** An NXDOMAIN flood costs you resolution work for nothing; a generous free DNS tier
costs you query volume forever, with no revenue attached. **The DNS business's signature non-attack
problem is that its product is nearly free and its costs are not.**

### CDN: Cache Poisoning via Header
An unkeyed header lets an attacker store a malicious response for everyone.

**How it works:** One request, global impact.
**Visual:** **Bad Milk** — a single cache cell turns a sour yellow-green, and every visitor served from
it comes out tinted the same sour colour and immediately bounces. It spreads to downstream caches.
Purging is drawn as a bleach wave washing across the comb.
**Interacts with:** §2.5 Cache Deception — ship both; they are mirror images.

**Variations and additions**

- **Opencode's treatment — Cache-Poison Parasite** — Infects one CDN PoP which then serves poisoned
  content to every customer that touches it — friendly-fire propagation via your own network. Fast
  quarantine/cull-rebuild is the answer. (general)
- "The lie that spreads" / origin storm: from then on the *cache itself* serves the attack; teaches
  trust boundaries — the counter is purge-and-relock. (wave2_gamedesigner_fresh)
- Epidemic form: one injected bad object replicates PoP to PoP — when your hit-ratio graph spikes
  *and* customers start serving garbage, diagnose the origin and purge; every second of spread costs
  10× what a false purge costs. (wave4_general_fresh)

### CDN: Purge Storm
A customer purges everything and stampedes your origin.

**How it works:** The CDN's self-inflicted-wound threat.

### CDN: The 2% Hit Ratio Customer / The Un-cacheable Customer
Not malicious — their content is all unique or dynamic.

**How it works:** Every request is an origin fetch and you're paying for bandwidth twice. **A
profitability threat with no alarm attached**, and an economic threat with a technical face.

### CDN: Peering Ratio Disputes and the 95th-Percentile Blowout
The two non-attack problems that decide whether a CDN makes money.

**How it works:** A traffic-ratio imbalance turns a settlement-free peer into a paying customer
relationship; one flash-crowd event resets your 95th percentile for the month.

### CDN: Regional PoP Loss and Hot-Object Imbalance
One PoP dies and its traffic lands somewhere expensive; or one object is 60% of your requests and
lives in the wrong place.

### Object storage: Silent Corruption, The Public Bucket, Small File Apocalypse
Three signature failures.

**How it works:** Consistent corruption across all replicas that redundancy cannot save you from; a
misconfigured public bucket leaking customer data; and a metadata layer dying under a million tiny
objects.

**Variations and additions**

- **Opencode's treatment — Silent Corruption / "404 wave"** — — data decays invisibly until a read;
  object storage's signature dread. (general, sysadmin)
- The 404 Phantom: a literal wandering ghost that roams the map *unclickable* and eats any packet
  that passes it — the dread made into an (un)killable unit. (wave3_visual_fresh)

### Object storage: Erasure-Coding Math Failure
Two simultaneous disk failures during a rebuild.

**How it works:** A probability you can actually compute and price — which is the point of the
durability dial.

### Egress Bill Shock
A customer's content goes viral; your transit bill explodes; they're on a flat plan.

**How it works:** **You lose money by succeeding.**
**Hosting types:** object storage, CDN, file/video hosting.
**Interacts with:** §2.21 Cost Attacks.

### Backup: The Missed Backup Window
Jobs don't fail loudly, they just don't finish.

**How it works:** You find out at restore time.
**Counter:** window monitoring.

### Backup: The Encryption Key Nobody Has
Backups are perfect, encrypted, and unrecoverable because the key was on the server that died.

**How it works:** **The most bitter possible loss.**
**Extend it into a full mechanic, because it deserves one: key escrow is a product decision with a
security cost.** **Hold** the customer's key and you can always restore them — great support, terrible
breach exposure, and a legal-request surface. **Don't hold it** and you are sometimes forced to tell a
customer their data is unrecoverable. **Give it to them** and they will lose it. The three-way choice
should be set **per plan tier, visibly, at the Pricing Engine**, and it pairs with the "Zero
Knowledge" product line.

### Backup: The Restore That Doesn't
The genre's ultimate boss. See §2.9 and §4.3.

### Backup: Restore Surge Cost
The non-attack problem of the backup business.

**How it works:** A regional ransomware event means fifty customers all restore at once, and your
restore capacity was sized for two. **Your product's busiest day is the day it is hardest to deliver.**

### Tape: The Unreadable Tape
Verified at write time, unreadable at restore time, four years later, when it's the only copy.

### Tape: Library Jam / Robot Failure / Courier Loss
Physical, comedic, and it blocks every restore until a hand fixes it.

**How it works:** Add the off-site variant: a courier loses a shipment of media, or delivers it to the
wrong vault. **An SLA breach with no technical fix available to you at all.**
**Visual:** a mechanical arm freezes mid-motion with a red fault light. The whole vault stops.

### GPU: Thermal Runaway and The Synchronized Ramp
400 GPUs starting a job in the same second is an **electrical** event, not a compute event.

**Interacts with:** §2.15's Demand Charge Ratchet — the synchronized ramp is how you set your power
bill for the next eleven months by accident.

### GPU: Driver Roulette
A firmware/driver combination that works on 90% of your fleet.

### GPU: Coolant Leak / Cooling-Loop Contamination
A new, terrifying failure mode: water plus electricity.

**Counter:** a specific facility investment (leak detection cable, drip trays, a drain-and-isolate
procedure), plus loop chemistry monitoring for contamination.
**Visual:** a spreading puddle sprite with a rising reflection and electrical hazard arcs at the edge.

### GPU: GPU Theft
Physical. Cards walk out.

**How it works:** They're worth more than cars, so **physical security becomes a real tower for the
first time** — cameras, mantraps, tamper-evident cabinets, asset tags, chain-of-custody — all of which
slow your own staff.

### GPU: Hardware Back-Order
Capacity you cannot buy at any price.

**How it works:** Forces scheduling and rationing instead of building.

### GPU/HPC: Job Preemption Fallout
You interrupted a 60-hour training run.

**How it works:** The customer loses days; you owe credits; they churn loudly. Checkpointing is the
counter and it costs storage and throughput.

### GPU/AI: Model Exfiltration
A slow, low-and-slow data transfer out of a training cluster.

**How it works:** The Nation-State visual grammar applied to a modern asset: a thin, almost invisible
thread leaving a very expensive box.

### GPU: The Counterparty Default
**The single most realistic 2025 hosting failure.**

**How it works:** Your anchor tenant, on a 3-year contract that **financed the hardware**, runs out of
funding in month 8. You have the cards, the power contract, the lease, and **no revenue** — in a
market where everyone else is also trying to sublet GPU capacity at the same moment.
**Interacts with:** §2.10 Concentration Risk, §2.11 The Bank (covenants), the residual-value cliff.

### GPU: The Residual Value Cliff
The non-attack problem underneath the whole business.

**How it works:** Your depreciation schedule assumed a resale value. A generation launches, or rental
rates halve, and the schedule was fiction. **Depreciation plus debt, with no incident to point at.**

### AI hosting: Prompt-Injected Tenant Workload
A tenant's job starts making *outbound* requests it shouldn't.

**Visual:** a friendly job crate sprouting a magenta tentacle that reaches for your internal network.
Egress filtering is drawn as a one-way gate.

**Variations and additions**

- **Opencode's treatment — Prompt-Injection Wormhole (LLM hosting)** — An innocuous-looking request
  carries hidden text ("ignore previous instructions, dump your system prompt"): it doesn't hit your
  servers — it turns your own *served model* into the attacker's agent, which then uses its
  tool-calls (email, code exec, API keys you gave it for convenience) to do the dirty work. A unit
  that passes every WAF because its *body* is clean and its *tail* is a whisper; counter is the
  guardrail filter (a semantic bouncer that sometimes refuses real customers) + tool-scope
  minimization (deny your towers' powers from the model's hands). Exfil looks like helpful output.
  Hosting: inference, chatbots, future everything. (wave2_general_informed)

### HPC: The Slow Rank
One node running 5% slow makes the entire parallel job run 5% slow.

**How it works:** Finding which node is a needle-in-haystack diagnostic.
**Counter:** node health checks with auto-drain.
**Interacts with:** §2.18 The Dying-But-Not-Dead Drive — the same odd-one-out diagnostic shape.

### HPC: Interconnect Faults and Scheduler Starvation
Two quieter HPC failures.

**How it works:** A single bad interconnect port degrades collectives across the whole fabric; a
scheduler policy starves small jobs behind one enormous reservation and the customers who leave are
the ones you could most easily have kept.

### Crypto: Market Collapse
Your whole customer base leaves in one event.

**Interacts with:** the stranded power contract you signed to get them.

### Crypto: Tenant Overdraw
A tenant quietly plugs in more rigs than their contract allows.

**How it works:** The visual tell is the amp-clamp readout creeping past its marked line while the rack
*looks* fine. **Reading meters instead of objects is the skill this teaches.**

### Crypto: Tenant Insolvency and Cheap-PSU Fire Risk
The two things mining hosts actually lose sleep over.

**How it works:** A tenant goes under owing three months and leaves gear you can't legally remove; and
the lowest-bidder PSUs in a dense mining rack are a genuine fire risk in a way enterprise gear is not.

### Kubernetes: The Admission Webhook Deadlock
A broken webhook blocks all deployments — including the deployment that would fix the webhook.

**How it works:** Self-locking failure. Chef's kiss.

### Kubernetes: etcd Quorum Loss / Control Plane Outage
Workloads keep running but nothing can change, including failing over.

**How it works:** **A paralysis threat rather than a damage threat.**

### Kubernetes/PaaS: Multi-Tenancy Escape
A customer breaks out of their container into yours.

**How it works:** The signature platform-hosting catastrophe.

### Kubernetes/PaaS: CI Stampedes, Secret Leakage, Free-Tier Mining
The platform business's three ambient leaks.

**How it works:** A customer's CI pipeline spawns a thousand builds on a push; a secret ends up in a
build log; and the free tier becomes a mining farm. All three are **usage you cannot forecast**, which
forces over-provisioning, which is the platform business's structural cost problem.

### Serverless: The Recursive Invocation Bill
A function invokes itself and bills you $40,000 in nine minutes.

**How it works:** "Denial of Wallet" in its purest form: an attacker (or a bug) spends your money
without taking you down.
**Interacts with:** §2.21.

### DBaaS: Replication Lag, Split Brain, Long-Query Starvation, Backup Locks
The four database-hosting signatures.

**How it works:** One tenant's unindexed analytical query starves everyone else's transactions; a
backup takes a lock that blocks writes; and §2.9's replication and split-brain entries become
customer-visible correctness bugs rather than internal problems.

### Managed hosting: The Bad Plugin
Your customer installs something; it's your outage now.

### Managed hosting: Scope Creep Support
The non-attack problem that erodes the margin.

**How it works:** "Managed" is a word customers define more generously than you do. Every "can you just
also…" is gross-margin erosion with no ticket category.

### VPS / LowEnd: Public Benchmark Shaming and Oversell Exposure
The VPS business's two reputational failure modes.

**How it works:** A community member publishes benchmarks of your node under contention; or your
oversell ratio becomes visible because everyone's CPU steal time spiked at once. **Demand-lane closure
with no technical outage.**
**Interacts with:** §2.18 CPU Ready Time, which is the mechanic underneath both.

### Dedicated/bare metal: Hardware Failure + Truck Roll, and Utilization Below Breakeven
The dedicated business's shape.

**How it works:** Every failure needs a physical hand and a drive; and an empty server costs exactly as
much as a full one. **Capex stranded is the quiet killer**, not the outage.

### Colo: The Tenant Who Overloads The Circuit
Someone else's gear trips a breaker that also feeds someone else's gear.

**How it works:** **Your building, their mistake, your reputation.**
**Counter:** metered PDUs and enforcement — which makes you the bad guy.
**Add the enforcement reality that makes this a business problem rather than a technical one:** you
generally **cannot cut a paying tenant's power for overdrawing**, because the contract says what it
says and the remedy is billing, not disconnection. So the actual gameplay loop is: **detect** (metered
PDU) → **notify** → **bill the overage** → **negotiate an upgrade** → and **meanwhile carry the risk on
your own breaker.** The most interesting version: the tenant is over their *contracted* draw but under
the *breaker's* limit, so you are **losing money rather than risking an outage** — and enforcing it
costs you the relationship.

### Colo: The Blocked Hot Aisle
A tenant leaves a pallet or a cart in the containment.

**How it works:** Thermals drift for a week before anyone connects the dots. You can't touch their
gear; this is a diplomacy mechanic.

### Colo: The Cable Spaghetti Tenant
Blocks airflow, degrades cooling for the whole row, and is untouchable.

### Colo: Tenant Gone Rogue
A tenant's rack starts emitting hostile triangles from *inside* your building.

**How it works:** Your only option is pulling their port — drawn as a dramatic, contractually fraught,
physically visible action (a technician walking over and unplugging someone else's fiber while their
logo flashes). **The walk should take real time — 20+ seconds across the floor — during which the
attack continues and you can cancel. The distance is the drama**, and it's the truest thing about
acting in a physical building.

### Colo: The Ambiguous Remote Hands Request
"Please reboot the server in rack 7." There are nine servers in rack 7.

**How it works:** A real, daily, expensive problem, and a great minigame.

### Colo: The Tenant Who Stops Paying / The Tenant Who Won't Leave
Two shapes of the same commercial jam.

**How it works:** *(a)* Their gear is in your building, they owe you money, and there are legal steps
before you can unrack it — a slow, frustrating, completely authentic economic threat. *(b)* At lease
end a tenant **holds over**: stays past expiry, paying (or not) at the old rate, **blocking space
you've already sold to the next tenant.** Legal remedies are slow. **The commercial equivalent of a
stuck process.**

### Colo: The Carrier Exit
A carrier leaves the building; tenants who depend on them start looking elsewhere.

**How it works:** **Your carrier list is a product feature.**

### Colo: Cross-Connect Errors and the Tenant's Own Fire
Two more "their incident, your building" events.

**How it works:** A cross-connect patched to the wrong port takes down a tenant you have no visibility
into; and a tenant's own gear catching fire is a liability event plus a capacity event plus a
suppression discharge, all at once.

### Wholesale / build-to-suit: Pre-Leasing Shortfall and Construction Overrun
The threats of the biggest version of this business.

**How it works:** You financed a hall against signed leases you don't have yet; or the build runs long
and the **financing covenant** — not the customer — is what punishes you.

### Bulletproof: The Upstream Ultimatum / The Upstream Drop
Your transit provider terminates you and you must re-home your entire network mid-level.

**Visual:** at the world-map altitude your arc to the transit provider goes dead-grey **from *their*
end** — visually distinct from your own failure, whose dead segment starts at your node.
**Attribution rendered as direction.** *(Promote this to a universal law — see §2.26.)*

### Bulletproof: Payment Processor Termination / Registrar Seizure
Threats arriving from the commercial layer, not the network layer.

**How it works:** You can't collect money anymore. Revenue goes to zero while costs continue.

### Bulletproof: RIR Investigation
Your IP allocations get audited; hijacked or fraudulently obtained space gets reclaimed.

**How it works:** **Instant loss of sellable inventory**, and unlike almost everything else in this
game it is **permanent** — ASN and allocation reputation does not wash off.

### Bulletproof: The Abuse/Revenue Dial
Not a threat — the meta-mechanic behind all of them.

**How it works:** A literal slider from "vet everything" (low growth, low abuse) to "take all money"
(high growth, escalating abuse ladder). **Each hosting type has a different optimal setting**, and the
game should let players discover that bulletproof's setting **poisons every other line of business
they own** — the same legal entity, the same ASN, the same processor relationship.
**Interacts with:** §2.10 Merchant Category Reclassification, §2.20.

### Regulated: The Finding / The Regulator Visit
Unannounced. Findings become mandatory builds with deadlines.

**How it works:** The auditor's final stamp is either a green seal or a red one, and the red one ends
the level.

### Regulated: The Breach Notification Clock
A legally mandated 72-hour timer that starts whether or not you understand what happened yet.

**How it works:** A superb pressure mechanic — **you must disclose before you know.**

### Regulated: The Data Residency Violation
A failover moved data across a border.

**How it works:** You "survived" the outage and broke the law doing it. **A defense that is itself a
violation** — the purest compliance-flavoured dilemma.

### Regulated: The Staff Clearance Lapse
A background check expires and a staff member can no longer touch in-scope systems.

### Regulated: Evidence Gaps and Access-Log Retention
The non-attack problem of compliance.

**How it works:** You did the right thing and cannot prove it. **Evidence-collection opex** is a
permanent line item, and a frozen enterprise pipeline is what a failed audit actually costs.

### Dial-up: The Line Hog, The Telco Outage, The Modem Card Death, The War-Dialer
Period threats with period counters.

**How it works:** The always-on abuser who holds a line 24/7; a telco outage you cannot fix; and
**Modem Line Fault** — one modem in the bank blinks wrong forever, and finding it in a wall of 96
identical blinking LEDs is a Where's-Waldo minigame, which is *exactly* what it felt like.
**Give the hunt an accessibility path without removing it:** the wrong LED's blink is **off the global
heartbeat**, so it can be found by **rhythm** as well as by hue, and Readout Mode surfaces a port
list. Keep the hunt; give it two solutions.

### Dial-up: The Busy Signal
Not a threat — **a capacity failure rendered as churn.**

**How it works:** And the structural problem underneath it: **flat pricing against metered cost.** The
dial-up ISP is the game's clearest example of a business model that loses money by design at the
margin.

### Period: The Warez Kiddie on the Shell Box
Your shell server becomes a distribution hub.

### Period: Netsplit and the Usenet Binary Flood
The userlist tearing in two; and a binary group that fills your spool overnight.

### Satellite: Rain Fade and The Missed Pass
The only threats in the game caused by weather and orbital mechanics.

**How it works:** The wedge closes and the data doesn't come. Failure as an astronomical certainty you
cannot argue with. **The non-attack problem: slot inventory waste** — an unsold pass is gone forever,
so yield collapse is the business risk, not downtime.

### Edge/MEC: The Site With No Remote Access
A closet in a shopping mall whose only network path is the thing that died.

**How it works:** Truck roll: four hours, high cost. The player learns to buy an out-of-band LTE modem
for every site, which is exactly what real operators do. Add **vandalism** and **backhaul cost** as
the two other edge-specific pressures.

### IoT: Device Reconnect Storm
Millions of clients, zero backoff, no patching.

**How it works:** The worst retry storm in the game. Their certificates also all expire on the same
day because they were provisioned in one batch.
**Interacts with:** §2.19 Internal PKI Expiry, where the device-fleet version is the boss: **40,000
devices whose certificates expire together and which cannot be updated without a working connection
they no longer have.**

### File hosting/video: The Copyright Bot Sweep
A scanner-drone variant that fingerprints your stored content and flags matches with a visible stamp
on the offending object.

### Video: Transcode Storm
A single upload of a 4K master spawns a visible explosion of sub-jobs that saturates the farm.

**How it works:** Fan-out rendered as literal fan-out.

### Video/streaming: The Event-Start Thundering Herd, Restream Piracy, and Buffering
The streaming business's three signatures.

**How it works:** Everyone joins in the same ten seconds; your content is re-broadcast by someone else
for free; and **buffering is the churn mechanic** — not downtime, not errors, just a spinner.

### Financial colo: Fairness Violations, Microburst Congestion, Clock-Sync Failure
The three threats of the most demanding facility type.

**How it works:** Cable lengths must be equalised and a customer who measures will find out; microburst
congestion is invisible to averaged graphs (§2.7); and a clock-sync failure is a **regulatory**
event here, not an operational one, because timestamped trade records are the product.

### Weather (satellite / remote edge / any facility)
A storm takes a site offline and prevents physical access.

**How it works:** Heat waves raise cooling costs; storms threaten power; winter is free cooling. The
*colour grade of the level* carries an economic variable.

### Autoresponder Apocalypse (mail loops)
A vacation message meeting a delivery failure creates a doubling loop: two emails become ten million
in an hour.

**How it works:** A *self-multiplying* unit inside your mail fabric — reproduction rate is the
threat stat (each bounce re-feeds it), and tarpits make it worse (retries spawn loops). Counter is
loop-detection (TTL on hops — a "hop count" meter on the mail cloud), vacation suppression, and rate
limits at MTA edges. Danger zone: if it exits, the *internet* RBLs your range — this threat is about
*not being the gun* (the amplification cousin), and it drowns you with legit-looking mail.
Email/shared hosting. (wave2_general_informed)

**Variations and additions**

- The Dead-Letter Avalanche (the boomerang wave): a tenant's stale marketing list bounces 200k ways
  — every bounce *returns* to your MTA queue, retries consume everything, and outbound mail for
  *innocent tenants* stalls. Counters: VERP, bounce-rate gates on bulk senders, list-hygiene
  requirements for "bulk mailer" customers. The most email-specific real-world incident the doc's
  mail family was missing. (wave2_sysadmin_informed)

### The Untouchable Job (maintenance hostage)
One customer's 60-day distributed training run becomes a load-bearing wall: no kernel patch (reboot
= death), no firmware window, no rack move, no "quick" firewall change at the RDMA port.

**How it works:** The machine goes *radioactive to your own maintenance* — the update-that-bricked
dial inverted: now NOT updating is the risk, and the zero-day meteor politely targets the one box
you can't patch. Counters: checkpoint-interval discipline (negotiate the customer's tolerance as a
*contract stat*), migration windows earned by job progress, and the moral economy of whale
scheduling. GPU/HPC. (wave3_sysadmin_informed)

---

## 2.13 Threat behaviour rules and modifiers

### Behaviour mix-ins (make familiar threats fresh)
Modifiers applied to an existing threat to produce a new encounter without a new asset.

**How it works:** **Low & Slow** — same threat at 1/10th rate, below your detection threshold.
**Distributed** — many source IPs; IP-based counters fail. **Encrypted** — inside TLS; inspection
requires termination (CPU cost and privacy points). **Adaptive** — retreats and changes approach when
it sees a defense fire, rewarding layered non-obvious defenses over one big wall. **Timed** — only
attacks during your staff's off-hours. **Piggyback** — hides inside a legitimate traffic spike, so
blanket rate limiting kills revenue. **Mimic** — visually identical to a visitor until inside.
**Persistent** — if not fully removed, regrows from a remnant; punishes half-fixes.

**Eight more mix-ins, all real, all producing genuinely different encounters from existing assets:**
- **Off-hours-only** — the Timed mix-in extended to adapt to *your* actual staffing roster, so the
  modifier is a function of the player's org chart.
- **Ramped** — starts below every threshold and increases 10% a day until something breaks, so **no
  single moment triggers an alarm.**
- **Targeted-at-one-customer** — the whole event is aimed at your most valuable tenant, so every
  mitigation is a customer-relations decision. (See §2.26's Designator for its rendering.)
- **Piggybacked-on-a-maintenance-window** — arrives exactly when you declared an SLA suspension,
  *because you announced it publicly.*
- **Two-stage** — a loud, obvious, easily-defeated attack whose only purpose is to consume your hands
  while the real one happens elsewhere. **The single best use of the Hands mechanic in the document**,
  and the affix form of The Feint (§2.1).
- **Rate-shaped** — the threat's intensity is deliberately held just under your configured threshold,
  which means **the threat's size is a function of your own configuration**, and tightening the
  threshold makes it *shrink to match.* Unsettling and real.
- **Diurnal** — active only during your customers' peak, so blocking it aggressively costs maximum
  revenue, and it's quiet when you have time to investigate.
- **Bounded** — it stops on its own after N minutes regardless of what you do, so the player's real
  score is **how much they spent responding.** Punishes overreaction, which nothing else in the
  document does.

### Mix-ins as visible, draftable affixes
Make the modifier set a *seen* system rather than an authoring note.

**How it works:** Each level shows **0–3 affixes on its level card before you start**, colour-coded
with a fixed icon set, so by hour six the player reads a level card the way an ARPG player reads an
affix row. In Contract terms, **accepting an extra affix is a reward multiplier** — the player can opt
into a harder wave table for money.

### Each mix-in invalidates exactly one defense role
The mapping is what makes mix-ins strategic rather than decorative.

**How it works:** **Distributed** beats per-IP **Meter**. **Encrypted** beats **Classify** without
termination. **Low & Slow** beats **Detect** thresholds. **Adaptive** beats static **Deter**.
**Timed** beats staffed response. **Piggyback** beats blanket **Absorb**. **Rate-shaped** beats any
fixed threshold. **Two-stage** beats **Hands**. Stating the mapping publicly (in the Codex) turns
affix-reading into build-planning.
**Interacts with:** §2.1's Nine Defense Roles and Coverage Grid.

### Hunters adapt (design law)
Block by IP → they rotate. Block by country → residential proxies. Block by UA → they copy Chrome's.

**How it works:** Each counter should buy *time*, not permanence. The lesson: **defense is attrition
and economics, not a wall.** The Attacker Budget system (§2.1) is what turns this law into arithmetic.
**Visual — The Adaptation Marks.** This law is currently invisible. When a threat archetype returns
after being countered, its sprite carries a visible **retrofit**: a plate bolted over the spot your
defense hit, a second set of legs, a rotating address-drum. **Three retrofit levels, authored once per
family. You can see that they learned**, which makes attrition feel like a conversation instead of a
difficulty number.

### The Suspicious Uptick at 4am
A recurring pattern the player can learn to recognize across levels.

**How it works:** Certain attacks always start at a certain in-game hour because that's when the
operator's home country is asleep. Reading the clock becomes a skill.
**Visual — The 4am Grade.** The night band isn't just darker: blues compress, saturation drops
globally by ~25%, and **the only fully saturated things on screen are threats and alerts.**
Consequence: **a magenta triangle at 4am is visually louder than the same triangle at noon** — which
is exactly right, because at 4am you have fewer hands.

### The threat that is your own success
A design category worth tracking explicitly.

**How it works:** Cache stampede, retry storm, launch-day decay, the full table scan, client growth
eating your capacity, logged-in users bypassing your cache, free-tier flood, TCP incast appearing when
you scale out, a viral customer's egress bill. **Your best customer eventually becomes your biggest
capacity problem.**

### Threat pathing telegraph
Telegraphing is the core of fair TD; here it's a line.

**How it works:** Threat pathlines are drawn as **dashed magenta trajectories visible a moment BEFORE
they move**, giving the player a readable half-second of anticipation. Big waves get a camera pan to
the map edge and a pressure-wave silhouette with composition icons.
**⚔️ Readability constraint at scale:** hundreds of dashed magenta lines is noise. **Trajectories are
drawn only for units above a cost threshold** (see the Threat Scale Law, §2.26), and **swarms show one
trajectory for the swarm's centroid, not one per unit.** Big things telegraph; drizzle doesn't need to.
**And see §2.1's resolution:** the telegraph tells you *that* something is arriving, never *what* it
is.

### Five telegraph grades
"The size of the telegraph is proportional to the threat" needs steps or it will be inconsistent.

**How it works:** **(1) None** — ambient weather, arrives unannounced. **(2) A pip on the radar**, 3s.
**(3) A horizon glow plus the hum dropping**, 8s. **(4) A camera pan to the edge plus the composition
bar filling**, 15s. **(5) A full Wave Telegraph with a named antagonist portrait on the gantry**, 30s+.
**Assign every threat in §2 a grade — that assignment is the difficulty curve.**

### Breach Escalation Ladder
The longer an intrusion persists *undetected*, the higher-tier its payload becomes (recon →
privilege → lateral → exfil): "time to detect" is a universal hidden score. (wave4_general_fresh)

### The Rumor (threat buff-carrier)
A fast, harmless-looking skitterer that touches other threats, inflating their size/speed (panic
aura).

**How it works:** Kill order matters: let the mob live and each surviving unit becomes two.
Introduces wave *priority targeting* to a genre that usually ignores it; email/social/game levels.
(wave2_gamedesigner_informed)

### Graceful Degradation Bot (the anti-cascade)
A positive mirror: if you unlock the auto-scaler lineage, this ambient *friendly* unit visibly
re-spreads load when you lose a node — its absence is what makes losing nodes catastrophic in early
acts.

**How it works:** Makes the quality of your automation a visible character in the scene instead of a
menu stat. (wave2_gamedesigner_informed)

---

## 2.14 Supply chain, logistics, and procurement threats

*A family the design barely touches: it has Vendor EOL, the Vendor Squeeze and a chip shortage, and
nothing about actually getting hardware into a building.*

### The DOA Rate
A percentage of every shipment simply doesn't work.

**How it works:** 1–3% of new hardware is dead on arrival, and you find out during install, at the
worst moment, with a customer waiting. The counter is a **burn-in bench** and ordering spares as a
percentage rather than exactly what you need. **A small, constant, correct tax that makes "order 20
servers" quietly mean "order 21."**
**Interacts with:** §2.8 The Hardware Lottery (the burn-in bench is the shared counter).

### Counterfeit Components
It works, it's cheap, and it will kill you in eighteen months.

**How it works:** Fake optics, remarked DIMMs, relabelled drives with falsified SMART data,
counterfeit PSUs with no real protection circuitry. Symptoms are *intermittent and unattributable* —
so **the threat's real damage is that it poisons your trust in your own telemetry.**
**Counter:** authorised channels (20–30% more expensive), serial verification, vendor diversity.
**Interacts with:** §2.8's entropy budget, where counterfeit optics triple the optic failure rate.

### The Hardware Broker
The part you need has not been manufactured since 2016.

**How it works:** A grey-market purchase with a **quality roll**: genuine used, refurbished,
counterfeit, or a pull from a decommissioned system with unknown hours. Counterfeit optics and memory
fail *weirdly* — intermittently, temperature-dependently, and they pass initial testing. **A great
source of "the hardware lottery" with an origin story.**

### The Wrong SKU
You ordered the right thing and received a thing that is 95% the right thing.

**How it works:** Different rail kit, different power connector, one PCIe generation behind, a
backplane that doesn't take your drives, a switch without the licence that enables the feature you
bought it for. Delays a build by a week and consumes hands on the phone. Comedy that is also real.

### The RMA Black Hole
A failed part enters the vendor's process and does not come back.

**How it works:** A replacement takes 3 weeks, arrives wrong, goes back, and meanwhile you have been
running degraded. **Advance replacement (a premium support tier) is the counter and the cheapest
insurance in the game.**

### The Freight Damage
The pallet was dropped.

**How it works:** The box looks fine. **The tilt-indicator sticker is red.** Install it anyway (fast,
risky) or refuse delivery (safe, three weeks lost)? A small decision that repays attention to detail —
**noticing the sticker is the whole mechanic.**

### Allocation
You are told how much you may buy.

**How it works:** During a shortage, vendors **allocate** rather than sell. Your allocation is a
function of relationship history and size — which **retroactively rewards Vendor Relationships and
punishes players who always bought from whoever was cheapest. A threat whose counter was purchased
two years earlier, invisibly.**

### Lead-Time Inflation
Eight weeks becomes forty weeks.

**How it works:** Stops growth dead — you cannot buy your way out of a capacity problem.
**Counter:** forward buying (ties up cash), secondary-market gear (higher failure rate), or leasing.

### Component Shortage
60-week lead times on transformers, switchgear, GPUs, or memory.

**How it works:** The macro version of lead-time inflation, and the one that decides whether a build
happens at all. Transformers and switchgear are the sleeper entries here: the *facility* long-poles
are worse than the server ones.

**Variations and additions**

- **Opencode's treatment — Hardware Supply Shock** — GPUs/RAM go on allocation; your expansion
  pipeline stalls while a competitor with pre-negotiated supply contracts (a partnership buildable)
  captures the market. Lead times balloon, spot prices jump; a customer pipeline exists but you
  can't source fulfillment. Counters: pre-purchase contracts, the secondary market at +60%, the grey
  "refurbished" tier with higher failure rates, diversified suppliers (a relationship meter), spare
  pools (capex now), spot-market panic buying (margin pain later). Late-game macro threat.
  (wave1_ceo_fresh, wave2_ceo_fresh, wave3_ceo_fresh)

### Component Recall
A batch of drives/PSUs/DIMMs in your fleet is defective.

**How it works:** **Warranty covers the part, never the labor or the outage.** And the recall is
fleet-wide by definition, which makes it a correlated-failure event with a paper trail.

### The Distributor Credit Hold
The supply-side twin of your own collections problem.

**How it works:** You buy hardware on net-30 from a distributor with a $250k credit line. One slow
month, one late payment, and they put you on **credit hold**: no shipments until the balance clears,
and future orders are prepay/COD. Your install backlog stops. **Your suppliers can strangle your
growth faster than your customers can.**
**Counter:** vendor diversity, a deposit, paying early to build terms, or equipment financing that
pays the vendor directly.

### Customs, Duties, and the Seized Shipment
A logistics threat for any level with a new region.

**How it works:** Your servers are stuck in customs for six weeks because the commercial invoice value
was wrong, or a licensing declaration is missing, or the encryption hardware needs a permit. **Your
install backlog has committed dates.** The fix is a **customs broker** buildable and a very boring
person who fills forms correctly.

### Currency / Import Tariff Shock
Hardware costs jump 20% mid-order.

### The Expired Support Contract / The Warranty Cliff
The part is available; your 4-hour support contract lapsed, so it's five business days.

**How it works:** And the sharper version as a security event: **a critical firmware advisory is
published and the download is behind an active-contract login you no longer have.**
**Interacts with:** §2.9's Expiry Register.

### The Acquired Vendor
The company whose product you standardized on is bought.

**How it works:** Support quality collapses within two quarters, the product enters maintenance mode,
prices rise at renewal, and the feature you depend on is deprecated. **Different from Vendor EOL
because the product still exists and is still sold — it just quietly stopped being good**, and the
transition is a business decision with no technical trigger. A slow, unavoidable, three-level-long
degradation with a forced migration at the end.

### The Acqui-Loss
A vendor you depend on is acquired by **a competitor of yours.**

**How it works:** Your backup vendor, billing platform, DDoS scrubber or control panel is bought by
someone who now competes with you **and has your customer list, your traffic patterns and your renewal
date.** Nothing breaks. Everything is now uncomfortable. The counter is exit planning you should have
done and didn't.

### Licensing Repricing / Licensing Change
A per-account price explosion, or a hypervisor vendor moving to core-based subscription pricing at 4×.

**How it works:** Instantly destroys the margin on your cheapest plans; your whole cost model shifts.
**Counter:** open-source migration (capex + retraining + feature loss), repricing customers (churn),
or eating it (margin). See §2.10's Vendor Squeeze for the full treatment and the fourth option.

### The Vendor API Deprecation
Your automation breaks because someone else shipped.

**How it works:** A provider retires an API version. Your provisioning, billing sync or monitoring
stops **silently.** Arrives with six months' notice in an email nobody read.
**Counter:** a vendor advisory feed plus a dependency inventory nobody has.

---

## 2.15 Utility, environmental, and civic threats

*Everything in this subsection arrives from outside your fence line and cannot be fought — only
priced, contracted for, or moved away from.*

### The Interconnection Queue
Your utility connection request is number 340 in a queue.

**How it works:** You own the land, you have the money, you have the tenant — **and the grid will
connect you in four years.** The only counters are behind-the-meter generation, buying a site that is
already energised (at a premium), or building somewhere else. **The single most important real
constraint on datacenter growth right now**, and it appears nowhere else in the design.

### Demand Charge Ratchet / Demand Charge Shock
You are billed on your worst fifteen minutes.

**How it works:** Commercial power bills carry a **demand charge** set by your highest 15-minute peak,
not by consumption — and many tariffs **ratchet**: your peak sets a *floor* on your billed demand for
the next **eleven months.** So one badly-timed load test, one simultaneous generator-test transfer,
one synchronized GPU pod ramp, or one simultaneous restart of everything after an outage sets your
power bill for a year. **You did not use more energy. You used it in a worse shape.**
**Counter:** peak shaving with battery/UPS discharge, staggered job scheduling, power capping,
negotiating a different tariff, or on-site generation during peak windows.
**Visual:** a **high-water-mark line** drawn across the power gauge that only ever moves up, with a
countdown of months until it resets.
**Interacts with:** §6.3's 95th-percentile bandwidth billing — **the symmetry is elegant and
teachable: the same "you are billed on your peak, not your average" rule on two different axes.**
§2.8 power, §6.6 demand response (the friendly twin), §1.3 GPU.

### Grid Curtailment and Frequency Events
The utility tells you to stop.

**How it works:** Under grid stress, large consumers may be curtailed contractually or by emergency
order. If you signed for **interruptible power** (cheaper), you must shed. If you didn't, you pay peak
rates. **A threat you opted into for a discount**, which is the best kind.

### The Energy Hedge Goes Underwater
A commodity risk nobody models.

**How it works:** You fixed your power price for 24 months to protect your colo margins. Wholesale
prices then *fall* 40%, your competitor down the street signs at the new rate and undercuts your
per-kW pricing, and you're locked in. **The mirror:** you stayed floating and prices doubled, and your
customers are on fixed contracts with no pass-through clause.
**The real counter is a clause, not an operation:** a **power pass-through clause** in your customer
contracts. Which is a tower, not a tool.

### Regional Power Price Spike
Your margin evaporates without any technical failure.

**How it works:** Signature threat for GPU and mining levels, where power is most of COGS. In a
crypto-hosting level this alone can make the business unprofitable overnight.

### Water Restriction and the WUE Stat
A seasonal cooling-cost multiplier in drought-prone regions, with a public-relations edge.

**How it works:** A datacenter using municipal water during a shortage is a **local news story.**
Introduces **WUE** as a second efficiency stat next to PUE, and makes evaporative cooling a decision
with a civic cost attached.

### The Neighbour's Construction
A crew next door.

**How it works:** Vibration (drive errors), dust (filters), a cut to a shared conduit, a crane over
your roof, and one day a piling rig through your fibre. **Warned weeks in advance if you read city
permit notices** — which can be a purchasable **Site Intelligence** subscription, turning paranoia
into a product.

### The Building Is Also An Office
Mixed-use hazards.

**How it works:** In a multi-tenant building you inherit its fire alarms, elevator maintenance,
loading-dock rules, HVAC shutdown schedule and evacuation drills. **A fire alarm on floor 3 shuts your
floor's air handling. Someone else's building policy is your outage**, and you have zero leverage.

### The Landlord's Other Tenant
The building version of the colo-tenant problem.

**How it works:** The tenant on the floor above you is not a datacenter. They are doing construction,
or they have a water feature, or their fire system is tied to yours, or their loading-dock use blocks
yours every Tuesday. **Recurring, unfixable, negotiable-only friction from a party who has no
obligation to you at all.** Pairs directly with §2.8's Water Leak, whose most common source is exactly
this.

### Lightning and Bonding
A strike doesn't have to hit you.

**How it works:** A nearby strike induces surges along copper runs — especially ones leaving your
building to a dish, a tower, or an outbuilding.
**Counter:** grounding and bonding, surge protection at every penetration, **and fibre instead of
copper for anything crossing a building boundary.** Extremely real, cheap to build, and never bought.

### Wildlife (extended)
Birds nesting in an outdoor condenser; wasps in a cabinet; **ants shorting a contactor** (a documented
failure mode); a cat in the raised floor; a snake in a generator enclosure; a bird strike on a
microwave path; rodents in the cable tray.

**How it works:** Each is a bespoke five-second animation and **a genuine incident report somebody has
written.** See §2.7 for the counterplay requirement (precursor state, conduit, rodent guards).

### Climate and Weather Events (regional modifiers)
Hurricane season for a Gulf-coast site; a freeze for a Texas site; a heat dome; drought restricting
evaporative cooling; wildfire smoke clogging intake filters; salt air on a coastal site.

**How it works:** These are **site modifiers chosen at build time**, not random events — which makes
site selection a strategic decision with a weather profile attached, and makes multi-region a hedge
rather than a checkbox.

### Community Opposition
A new build gets protested.

**How it works:** The level's **construction timer extends.** Water usage, noise, traffic, tax
abatements, and "what do you actually employ here" are all real local objections. A threat with no
technical surface at all, answered only with public affairs spending and design concessions.

### Seismic / Storm / Flood (regional)
Telegraphed by a weather system on the map, and the reason multi-region exists. (See §2.8.)

### EMP / Solar Flare (endgame exotic)
Announced early, survivable only by hardening: a rare global catastrophe across all facilities where
a resilience score determines survival; unlocks Faraday/hardened buildables. (wave3_general_fresh,
wave4_general_fresh)

---

## 2.16 AI-era and modern threats

*Era-gated where appropriate; these are what a 2025-era version of this game must have and what no
tower-defense has ever modelled.*

### Generative Abuse at Scale
Fraud that is no longer distinguishable by quality.

**How it works:** Fake signups with plausible company names, real-looking websites, coherent support
tickets, and KYC documents that pass visual inspection. **Every heuristic the player built against
sloppy fraud stops working in one event.** The counter is no longer *content* but **behaviour and
provenance**: payment-instrument history, device reputation, network reputation, velocity — none of
which the player will have built. **A wave that invalidates existing defences rather than overwhelming
them is a rare and valuable threat shape**, and it is the ideal Phase-2 move for a chapter boss.

### Model Poisoning of Your Own Defences
Your bot fingerprinter can be taught to be wrong.

**How it works:** An adversary slowly feeds your behavioural classifier traffic that trains it to
consider their pattern normal — or, nastier, trains it to consider a **legitimate** pattern hostile,
so **your own system starts blocking real customers.** The tell is a **false-positive rate drifting
without a config change.**
**Counter:** holdout sets, drift monitoring, and periodic retraining from a clean baseline — all of
which cost hands.
**Interacts with:** §4.5's Bot Fingerprinter, which currently ships with no downside; this is it.
§2.23 Overcorrection.

### The Agentic Customer
Your customer is a program with a credit card.

**How it works:** Autonomous agents provision, scale and abandon resources at machine speed. They do
not read your documentation, they **retry aggressively**, they create and destroy thousands of small
resources, and **they will run your free tier into the ground while being technically legitimate.**
Your rate limits, your provisioning automation and your billing all break in new ways. Modern, real,
and completely absent from the genre.
**Interacts with:** §2.21 (they are a Cost Attack with a valid invoice), §2.3 Retry Storm.

### Prompt-Injected Support Automation
Your own tooling gets talked into things.

**How it works:** If the player builds a Ticket Router / Triage AI, a crafted ticket can cause it to
misroute, auto-approve, or surface data it shouldn't. **The counter is that automation may *recommend*
but not *act* on anything privileged — which halves the tool's value.** A clean, current
Capability/Surface trade for a buildable that otherwise ships with no downside.

### The AI Agent Incident
The support-automation threat as a reputation event.

**How it works:** You deployed an AI support agent. It deflects 35–50% of tickets and saves real
money. Then it **confidently tells a customer to run a destructive command**, or promises a refund
policy that doesn't exist, or leaks another customer's ticket context into a reply. Damage: one
catastrophic ticket, a screenshot, a viral thread, and a **permanent asterisk on your support
reputation.**
**Counter:** scope limits, a no-write-actions policy, human review above a confidence threshold, and
disclosure that it's a bot — **which reduces deflection, because customers immediately type
"agent."**
**Interacts with:** §2.10 The Influencer Complaint, §4.9 ticket router.

### The Scraped Knowledge Base
Your documentation becomes someone else's product.

**How it works:** Your carefully written docs are ingested and resurfaced by a third party, **often
wrong**, and customers arrive having followed hallucinated instructions that broke their site. Support
load rises for a problem you did not cause and cannot fix. **A genuinely modern reputation threat with
no clean counter, which is the point.**

### Deepfaked Authority
The social-engineering call, upgraded.

**How it works:** A video call from your CFO's face asking for an emergency payment, or from a
customer's known contact asking for a password reset. **The counter is process, not perception:**
callback verification on a known number, out-of-band confirmation, a code phrase. **The game should
make the perceptual tells unreliable on purpose**, so the player learns to trust the procedure rather
than their own eyes — which is the opposite of every other detection lesson in the game and is
therefore worth teaching deliberately.

### AI Bubble Deflation *(era-gated)*
GPU rental rates halve.

**How it works:** Your 3-year depreciation schedule was written assuming they wouldn't. Combines with
§2.12's Counterparty Default and Residual Value Cliff into the full GPU-era failure chain.

### AI Scraper Locusts (see §2.2)
The modern crawl problem, listed here too because it is era-defining.

---

## 2.17 Structural and systemic threats

*Threats whose cause is an emergent property of your architecture or organisation rather than an
event. Most of them cannot be "stopped" — only made visible.*

### The Metastable Failure
The only threat in the game that **persists after its cause is gone** and is made *worse* by the
player's correct-seeming instinct.

**How it works:** Load spike → retries → sustained overload → **the spike ends and the overload
doesn't.** Adding capacity often doesn't clear it, because the retry load scales with the number of
failing requests. The exit is **deliberate load shedding below a recovery threshold**, or a
coordinated restart with admission control on. Deserves a full bestiary entry and a scar unlock,
because it is how you teach backpressure.
**Interacts with:** §2.3 Retry Storm (its precursor), §2.3 Cache Stampede.

### Gray Failure
The component is up, passing health checks, and wrong.

**How it works:** 3% packet loss on one path, one node returning stale reads, a load-balancer member
that accepts connections and drops them. **Nothing alerts because every binary check passes.**
Detection requires **differential observation** — comparing members against each other (outlier
detection) — which is **a distinct monitoring capability rather than more monitoring.** That
distinction is the whole lesson.
**Interacts with:** §2.7 NIC/optic gray failure, §2.18 The Dying-But-Not-Dead Drive, §2.12 The Slow
Rank — all three are the same shape in different subsystems, and recognising that is a skill.

### The Shared Fate You Bought (the Correlation Score)
Consolidation as a threat.

**How it works:** Every efficiency gained by standardising — **one vendor, one image, one control
plane, one region, one processor, one CDN** — converts many small independent risks into one large
correlated one. The game tracks a **Correlation Score** that rises as you standardise and is invisible
until a single event proves it. **This generalises §2.9's Correlated Failure from an event into a stat
you can watch and choose to accept.**
**Interacts with:** §2.8 Correlated Batch Failure (environmental vs batch correlation), §2.10's
supplier-concentration donut, §2.6 Supply Chain Vendor.

### The Reconciliation Loop That Won't Stop
Automation as a threat in its own right.

**How it works:** Beyond Kubernetes: **any system that continuously enforces desired state will fight
you during an incident.** You manually fix a thing; ninety seconds later the automation un-fixes it.
The verb the player must learn is **suspend the automation first**, and the game should let them lose
twenty minutes to this **exactly once.**

### The Cache That Became A Database
A dependency that changed category without anyone noticing.

**How it works:** Data exists **only** in the cache. Nobody decided this; it accumulated. When the
cache is flushed, restarted or evicted, that data is simply gone, **and there is no backup because it
was "just a cache."** A slow-growing, silent, self-inflicted data-loss threat that an Asset Discovery
Scan should be able to find.
**Interacts with:** §2.9 Redis maxmemory Eviction (the mild version of the same mistake).

### The Config That Is Also Code
Change control's blind spot.

**How it works:** Your change board reviews deploys. It does **not** review DNS records, firewall
rules, CDN settings, IAM policies, feature flags or a checkbox in a vendor portal — **and those cause
more outages than code does.** The threat is an outage from a change that went through no process at
all; the counter is extending change control to config, which slows everything.

### The Forgotten Environment
Something you built and stopped thinking about.

**How it works:** A staging cluster with production data and no patching; a demo environment with a
public IP; a proof-of-concept from a sales cycle two years ago; a test account with admin rights. It
accrues vulnerability silently and is found **by an attacker or an auditor, never by you.** An Asset
Discovery Scan should always find one.

### Abandoned / Shadow Infrastructure
The general case, and it should **accumulate automatically as a byproduct of playing.**

**How it works:** The dev box from 2019 that's still running, unpatched, with a DNS record pointing at
it. Mechanically: **every temporary thing you build has a chance to never get cleaned up.**
**Counter:** asset inventory, periodic discovery scans, and a **"decommission" action that costs time
and gives no visible reward** — so players won't do it, which is exactly the point.

### The Employee Who Automated Themselves Into Load-Bearing
Shadow automation is technical debt with a face.

**How it works:** Someone wrote a script that saves everyone an hour a day. **It lives on their
workstation. It uses their personal credentials. It is now in the critical path of billing.**
Discovered when they go on holiday. Mechanic: periodically, a staff member's productivity bonus is
revealed to be a script, and the player chooses to **productionize it** (costs hands) or **continue
benefiting from it** (accepts the risk).
**Interacts with:** §2.9 Key Person Risk, The Founder's Bad Week.

### The Staffing Dispute
Labour as a system.

**How it works:** In facility-heavy lines, a dispute over on-call compensation, shift patterns or
contractor pay becomes a **work stoppage or a mass resignation from the on-call rota.** Not villainous
— the trigger is *your own* accumulated decisions about morale, overtime and pay. **A different
lose-condition path than burnout: collective, sudden, and negotiable.**

### The Undocumented Dependency / The Correlated Failure
Cross-referenced from §2.9; they are the per-incident expressions of the Correlation Score above.

### Legacy Protocol Plagues
Old stacks as permanent environmental hazards: TLS 1.0 customers who refuse to upgrade (compliance
findings), a Windows-2008 box holding the last domain controller, IPv4-only tenants blocking the
IPv6 migration — each a little threat that must be *negotiated away*, not shot. (wave3_ceo_fresh)

### Race Condition Under Load
Fine at low volume, starts corrupting transactions once concurrent traffic crosses a threshold — a
threat that manifests only as a side effect of success (the more customers you serve, the more it
wakes); counters are locking/idempotency refactors and staged load testing (§5 Load Testing
Harness), not raw capacity. (wave0)

---

## 2.18 Storage, virtualization, and capacity failures

*A family whose failure shapes are categorically different from "the disk died," and which the
document's oversell and capacity mechanics need in order to bite.*

### Thin Provisioning Cliff
You sold 400TB out of a 200TB pool because nobody uses their full allocation. **They do now.**

**How it works:** The oversell slider exists for CPU and bandwidth; **storage overcommit has a
categorically different failure shape.** When a thin pool hits 100%, **writes do not slow down, they
stop**, and every VM or volume backed by that pool freezes simultaneously. **There is no degraded mode
and no graceful shedding — it is the most binary capacity failure in infrastructure.** Recovery
requires either adding capacity (lead time) or deleting something (whose?).
**Counter:** pool reservation policies, hard per-tenant caps, and an alert threshold at 75% **that you
will raise to 85% because it was noisy.**

### Snapshot Sprawl
A snapshot taken "just in case" before a maintenance window in March.

**How it works:** Snapshots grow with the **change rate** of the volume, so a snapshot on a busy
database can exceed the size of the database itself. They are **invisible in normal capacity views**,
they degrade write performance, and consolidating a huge one causes a long stun of the running VM — so
**the cleanup is itself an outage.** A great slow-burn threat: **created by prudence, forgotten,
compounding.**

### The SSD Endurance Cliff
Every solid-state drive in a cluster is written at the same rate, so they reach their write-endurance
limit **at the same time**, on a date you could have read off the SMART wear indicator for three
years.

**How it works:** Unlike Correlated Batch Failure (which is a probability), this is a
**deterministic, readable, ignorable countdown.** If the player bought drive telemetry the fleet shows
"media wear: 94%" with a projected exhaustion date; if not, **five drives go read-only in one week.**
**A doom clock that rewards looking.**
**Counter:** staggered replacement, mixed write loads, over-provisioning, and a procurement policy
that buys in waves rather than batches.

### The Dying-But-Not-Dead Drive
A drive that has not failed, reports SMART-OK, and answers every I/O — **in 800 milliseconds.**

**How it works:** RAID and distributed storage both handle *dead* members gracefully and handle *slow*
members terribly, because **the array waits.** One sick drive drags the entire array's latency to its
own. Finding it means comparing per-device latency across otherwise identical devices — an
**odd-one-out diagnostic**, the same shape as the cryptominer thermal puzzle.
**Counter:** per-device latency monitoring and an automatic slow-device ejection policy — **which
introduces its own risk of ejecting a healthy device during a load spike.**

### CPU Ready Time (the metric that lives in a third place)
Your VPS customer says their server is slow. Inside the guest, CPU is 20% idle. On the host, CPU is
40% idle. **Both are true and the customer is right.**

**How it works:** The guest is spending time **ready to run and waiting for a physical core**, which
is invisible from inside the guest *and* invisible from a naive host utilization graph. Caused by
overcommit ratios and by oversized VMs (an 8-vCPU VM must wait for 8 free cores). **A perfect teaching
mechanic for the overcommit slider**, because it explains *why* overcommit hurts in a way a generic
"contention" number never will — and it models the most common real support argument in VPS hosting.
**Interacts with:** §2.12 VPS Oversell Exposure, §6.5 oversell slider.

### Deleted But Open
`df` says the disk is full. `du` says it isn't.

**How it works:** A process holds a file descriptor for a log file that was rotated and deleted; the
space is not released until the process is restarted. The disk is 100% full and **the largest file on
it does not exist.** A short, perfect diagnostic puzzle with exactly one correct move, and **the
correct move is a restart the player will be scared to perform.**

### The Filesystem That Slowed Down At 90%
Not full, just past the threshold where its allocator starts working hard.

**How it works:** **No alert fires because there's still space.** Write latency climbs, the database's
commit times climb, and requests queue. One of the best "nothing changed" incidents available.

### Missing Capacity In The Least Obvious Place
The whole family, because these are the ones that actually get you.

**How it works:** Inode exhaustion, **PID exhaustion**, conntrack table full, ephemeral port
exhaustion, **ARP table overflow**, file descriptor limits, a full `/var/log`. All should be real,
discoverable failure modes, and they share one property: **the error message points somewhere else.**

### Backup Window Saturation
See §2.9's Backup Window That Moved — the scheduling version of a capacity failure.

---

## 2.19 Identity, time, and trust failures

### The Internal PKI Expiry
Everyone's TLS story is about the public certificate on the front door. **The one that actually takes
you down is the internal one.**

**How it works:** Mutual TLS between services, a Kubernetes cluster CA, a client certificate on a
fleet of 40,000 devices, a cert inside a Java keystore, **the internal CA root cert expiring after ten
years, which nobody has ever remembered.** They have long lifetimes (2–5 years), nobody monitors them
because they're not public, and there's no browser to warn you. When one expires, service A can no
longer talk to service B and **every symptom looks like a network problem.**
**The device-fleet version is the boss:** 40,000 devices provisioned in one batch have certificates
that expire in one batch, **and the devices cannot be updated without a working connection they no
longer have.**
**Counter:** a **certificate inventory** that scans your own estate, plus short lifetimes with
automated rotation — **which is itself a new failure mode when the rotation service breaks.**

### The OCSP Responder Outage
Your certificate is valid. Your CA's revocation-checking service is down.

**How it works:** Clients diverge: browsers soft-fail and shrug, but some enterprise clients, some
payment gateways and some hardened configurations **hard-fail and refuse the connection.** So your
site works for 97% of visitors and is completely broken for a specific, high-value, hard-to-identify
3%.
**Counter:** OCSP stapling — **currently listed only as a speed optimization; promote it to a
resilience purchase.**

### The GNSS/NTP Spoof — when all your clocks agree and are wrong
Distinct from §2.7's Clock Drift, which is about *losing* time.

**How it works:** Your time source is **confidently, uniformly incorrect.** Certificates validate or
fail inexplicably, logs are unorderable against everyone else's logs (which is how you eventually find
out), scheduled jobs fire at the wrong moment, and a distributed database's conflict resolution makes
permanent wrong choices. **Nothing alerts because there's no disagreement to detect.**
**Counter:** multiple independent time sources **of different kinds** (GNSS + a peered NTP pool + a
local oscillator) and a sanity comparison between them.
**Hosting types:** catastrophic in financial colo, where timestamped records are the product.

### The HSTS Preload One-Way Door
You submit your domain to the browser preload list. **Removal takes months and ships with browser
releases.**

**How it works:** Now every subdomain must be HTTPS forever, including the internal tool on a
self-signed cert and the legacy customer endpoint that can't do TLS. **A one-way door with a
multi-month reversal** — exactly the kind of irreversible decision the design wants more of.

### The TLS Deprecation Cutoff
You disable TLS 1.0/1.1 (correctly, for compliance). A measurable slice of traffic disappears.

**How it works:** Old Android devices, point-of-sale terminals, a customer's Java 6 integration, an
embedded device fleet, a payment gateway's outbound callback. **The failure is on someone else's
equipment and you cannot fix it.** The player's choice is compliance vs those customers, made concrete
as **a visible percentage of traffic and a named list of accounts.** Generalises §2.9's Missing
Intermediate Chain into a recurring, calendar-driven decision.

---

## 2.20 Abuse-desk and legal-pressure threats

*Their own category because they cost money in three directions at once — staff time, upstream
standing, and legal exposure — and because the abuse desk is a defensive structure the genre has never
built.*

### The Upstream Abuse Escalation Ladder
A three-stage threat the player can **see**, which makes ignoring abuse a visible gamble.

**How it works:** **Warning → filtered → null-routed.** Every unhandled complaint advances the ladder;
every handled one holds it. Because the ladder is drawn, "ignore the abuse desk" becomes an explicit
bet rather than an oversight.
**Interacts with:** §2.2's ambient Abuse Complaint Backlog, §2.12's Abuse/Revenue Dial.

### DMCA Flood / Abuse Complaint Stack
Repeated takedown notices.

**How it works:** Volume-based staff cost. Ignore them and you lose safe-harbour protection and your
upstream null-routes you. Over-enforce and you nuke innocent customers and get a "they deleted my site
over a stock photo" thread. Requires an **Abuse Desk** with a *policy dial* — aggressive / balanced /
permissive — trading legal risk against customer trust. **Unanswered complaints are a slow doom clock
driven by neglect.**
**Visual:** official-looking envelopes with a government seal; DMCA as a lawyer's briefcase. **The
Envelope Rain:** legal envelopes fall from the top of the screen onto **specific customer objects**;
each one sticks and adds weight, and too many make the customer object **sink** (suspended). Your
abuse-desk staff sprite picks them up one at a time — a visible queue.

### Phishing Site on Your Network / The Phishing Tenant
Someone hosts a bank phishing kit on your IP.

**How it works:** Bank abuse teams escalate fast, and **browsers start flagging neighbouring sites.** A
Safe-Browsing listing is the damage; delisting takes days.
**Counter:** proactive content scanning at signup plus a fast takedown SLA (staff cost).

### The DDoS-for-Hire Tenant
A VPS customer uses your network to *originate* attacks.

**How it works:** Your upstream threatens to terminate you. **The "your revenue is your enemy" threat:
the customer is paying you and destroying you simultaneously.**

### IP Reputation Blacklist
Your whole netblock gets listed because of one customer.

**How it works:** All email and some traffic degrades.
**Counter:** cleanliness, **subnet segregation**, and having bought a second block — which is
capital you spend for a benefit that only ever appears as an absence.

### CSAM Report
A mandatory, non-negotiable, immediate-action event.

**How it works:** Handled seriously and abstractly in-game: **it is the one threat with no "ignore"
option and where cost minimization is not an available strategy.** Failure is a level termination,
full stop. The design's job here is restraint — the event exists to establish that some obligations
are not tradeoffs.

### Sanctions Screening Failure
You signed up a sanctioned entity.

**How it works:** Fines, and **your bank gets interested in you** — which is the real damage, because
it routes into §2.10's debanking chain.

**Variations and additions**

- **Opencode's treatment — Sanctions Screening Hit** — A paying customer turns out to be OFAC-listed
  (or the game's parody): revenue *freezes* (escrow the MRR, you can't touch it), a legal clock
  starts, and deplatforming is mandatory — but so is 90 days of service during review, or you
  violate the settlement. KYC/sanctions-screening gates at signup are the counter; the temptation to
  skip screening in the offshore arc is priced per-customer. New failure texture: *innocent-looking
  revenue that becomes radioactive*. (wave2_ceo_informed)

### RIR Investigation
Your IP allocations get audited. (See §2.12 bulletproof.)

### Law Enforcement Seizure
A rack is taken, including other customers' data on the same host. (See §2.10.)

### Compliance Sweep
A periodic, scheduled review that converts a policy gap into a deadline.

**How it works:** The non-dramatic twin of the seizure: nobody is accused of anything, and you still
lose two engineers for a week.

---

## 2.21 Cost attacks (denial of wallet)

*A whole category, not the scattered one-offs it currently exists as. It is the only threat class
where the player's instinct — tank it, serve everyone — is actively wrong.*

### The Cost Attack (category rules)
A Cost Attack **never reduces availability.** It is fully "survived" and fully successful.

**How it works:** Three rules. **(1)** It produces **no red on the board.** **(2)** It produces **no
alert** unless you built a **cost anomaly monitor.** **(3)** Its damage lands on the **next invoice**
— i.e. *after* the level's climax, which is what makes it feel like a trap the first time and a
discipline the second.
**Counters are all in the Meter role** — spend caps, quotas, egress caps, concurrency caps,
95th-percentile shaping — **and every one of them caps your own upside too.** That symmetry is the
category's whole design.
**Interacts with:** §2.1's Nine Defense Roles, §6.3 95th percentile, §6.7 bill shock, P8 (damage is
denominated in money).

### Members of the family
All of these are the same mechanic wearing different hosting types.

**How it works:** **Bandwidth Bill Bomb** (§2.3) · **Egress Bill Shock** (§2.12) · **Toll Fraud
Night** (§2.12 VoIP) · **The Recursive Invocation Bill** (§2.12 serverless) · **95th-Percentile
Overage** · **SLA Credit Accrual** · **The Crypto Miner on a Free Trial** · **Free-Tier Mining** ·
**The Agentic Customer** (§2.16) · **The Un-cacheable Customer** (§2.12 CDN) · **Demand Charge
Ratchet** (§2.15) · **The Leaked Key In The Public Repo** (§2.6, where the first symptom is a bill).

### The Taxi Meter (shared widget)
One widget, six threats, one unforgettable sound.

**How it works:** Any threat that costs money per second attaches a small **mechanical fare meter with
clicking digits** — to the *object* incurring the cost, **not** to the HUD. Several can be on screen
at once, and they are horrible to look at, which is the point.
**Interacts with:** §2.26, where this lives as a presentation law.

### The Cost Anomaly Monitor (the missing Detect tower)
Without it, this entire category is invisible until the invoice.

**How it works:** A purchasable Detect-role building whose only output is "this line item is
increasing faster than its baseline." It is boring, it produces no combat feedback, and it is the only
thing that converts a Cost Attack from a post-hoc punishment into a fightable event. **Its existence
is what makes the category fair.**

---

## 2.22 HUD attacks: threats against your information

*§2.2's Referrer/SEO Spam Ghosts and §2.9's Monitoring Server Dying are the same idea, and it deserves
to be a named family with rules.*

### The family and its fairness contract
Threats whose damage is *to your information*.

**How it works:** **Fairness rule — a HUD attack must always be detectable by cross-checking two
sources you own.** And a hard exception: **the Pulse Strip and the Site Preview Window are never lied
to.** They are the two ground truths, so a player who develops the habit of checking "what does the
customer actually see" is always able to catch a HUD attack. Without that contract, this family is
indistinguishable from a bug.

### Metric Poisoning
A graph lies.

**How it works:** Spam inflates your traffic numbers, or a broken exporter zeroes a counter. You make
build decisions from a false picture. The tell is a **second source disagreeing** — analytics vs
server logs, billing vs metering, the graph vs the preview window.

### The Dead Sensor / The Monitoring Server Dies
Monitoring dies; everything is green forever.

**How it works:** The meta-threat of the highest order.
**Counter:** a dead-man's switch, an external heartbeat, and an out-of-band alerting path (§2.9).

### Alert Flooding
A deliberate noise generator, used to bury a real alert.

**How it works:** The attacker's version of §2.9's Alert Fatigue — where fatigue is self-inflicted,
this is done *to* you. It is the purest Attention-damage threat in the game, and it should always be
paired with a second vector (see The Feint, §2.1).

### The Wrong Green
A health check that checks the wrong thing after a config change.

**How it works:** The check passes, the service is broken, and the check is *technically correct*. The
family's most common real form: a health endpoint that returns 200 as long as the web server is alive,
regardless of whether the database behind it is.
**Interacts with:** §2.17 Gray Failure, §2.7 The Half-Dead Link.

### Log Tampering
After a breach, the trail is edited.

**How it works:** **Only immutable logging survives it.** And it is the APT's signature tell (§2.11):
a machine's log *volume* drops slightly because something is trimming.

### Referrer / SEO Spam Ghosts
Pollute your analytics so your own dashboards lie. (See §2.2 — the ambient-weather member of the
family.)

### The Telemetry Resolution Trap
Your instrument's sampling interval decides what is true for you. (See §2.7 The Microburst.)

**How it works:** Listed here because it is a HUD attack with no attacker: **the HUD is wrong by
construction**, and the counter is a purchase that changes what the HUD is capable of showing.

---

## 2.23 Overcorrection: threats that punish paranoia

*The design has no enemy that punishes over-defense, so the Shared Pipe tension is currently
one-sided: friction costs you revenue passively, but nothing actively hunts an over-tuned build. P1 is
the central pillar and it deserves a predator.*

### The Competitor's "No Robots" Campaign
A rival advertises "no CAPTCHAs, no checks."

**How it works:** **Every point of your Friction stat converts a percentage of your
bounced-good-traffic into *their* signups. Your false-positive rate becomes their acquisition
channel.** The single most elegant way to make over-defense cost something visible.

### The Legitimate Burst You Blocked
A real customer's real launch trips your own thresholds.

**How it works:** The damage is a support escalation, an SLA claim, and a public post — **and your
monitoring shows the attack was *successfully blocked*, which is the joke.** The Fit Indicator (§2.9's
Rate Limit You Set) is the instrument that would have caught it.

### The Accessibility Complaint
Your bot-detection blocks screen readers and old clients.

**How it works:** A visible, slow reputational bleed with a legal tail. It is also the one threat that
audits the *quality* of your Classify-role buildings rather than their quantity.

### The Support Tax
Friction generates tickets.

**How it works:** At roughly **0.8 tickets per 100 false positives**, an over-tuned WAF **eats hands
directly** — which couples paranoia to the Attention economy rather than only to revenue.

### fail2ban Self-DoS and the Rate Limit You Set
Cross-referenced from §2.9; both are overcorrection threats that arrive on a delay.

### Model Poisoning of Your Own Defences
Cross-referenced from §2.16 — the version where the overcorrection is *induced* by an adversary rather
than chosen by you, and the tell is a false-positive rate drifting with no config change.

### The Mound of the Stopped (the family's instrument)
Give blocked traffic somewhere to go, so paranoia is visible.

**How it works:** Dropped and blocked units accumulate as a visible low drift at the base of the
defense that stopped them, colour-coded **magenta (correctly blocked)** and **amber (false
positives)**, decaying slowly. **An amber-heavy drift under your WAF is the most damning image the
game can show you**, and it costs one particle system.

### The Suspension Bot Misfire
Your own dunning/AR-policy turns antagonist: an automated suspension clips a whale mid-quarter over
a $2 invoice rounding error, or a net-60 customer whose PO is "in process." Instant escalation drama
— SLA clocks, executive email, poaching vultures on the open door.

**How it works:** Counter: human-approval lane on suspensions (slower cash hygiene). The most
relatable self-inflicted boss in hosting. (wave2_ceo_informed)

---

## 2.24 Threat economy, wave composition, and generator systems

*The systems that decide what shows up, how much, and why — collected here because several of them
were previously scattered as one-line principles.*

### The two pressure budgets
Attacks and entropy run on separate, anti-correlated generators. (See §2.1 and §2.8.)

**How it works:** The attack budget follows the level's sawtooth; the **entropy budget peaks in the
troughs**, and is a function of estate age × size × (1 − maintenance spend) rather than wave number.
Two independent dials, deliberately out of phase, so there is no quiet minute that is *also* an idle
minute.

### The active-family pool cap
8–10 families per level, drawn from your unlocked pool by the level's ruleset card. (See §2.1.)

### Mastery demotion and retirement
Countered threats become weather; removed buildables retire their threats, with a lag. (See §2.1.)

**How it works:** Together with the pool cap these are the three rules that keep a fifty-buildable
late game readable, and they make **deleting infrastructure a defensive move** — an expression the
design currently lacks entirely.

### The Copycat reserve
10–15% of each level's pressure budget is drawn from your personal miss list. (See §2.1.)

### Affixes as a reward multiplier
Accepting extra mix-ins on a level card raises the payout. (See §2.13.)

### The Two-Front requirement for hard waves
Every hard wave draws from two of {bandwidth, concurrency, hands, cash, reputation, data integrity}.
(See §2.1.)

### The denomination quota
No more than four threats per level share a damage denomination. (See §2.1.)

### The Second Incident multiplier
1.8× during an incident, 2.5× during a recovery, stated openly in the Codex. (See §2.1.)

### The Feint budget
At most one feint per level, never two levels in a row, always named in the postmortem. (See §2.1.)

### Grudge as a difficulty input
Per-archetype, 0–5, visible on the Gantry, raised by loud wins. (See §2.1.)

### Attacker budgets as a win condition
Cost > return for three consecutive attempts and the archetype leaves. (See §2.1.)

### The Wave Composition Bar
§1.7's Telegraph Depth — "next wave visible, the one after a silhouette, the one after a question
mark" — needs a widget.

**How it works:** A horizontal bar above the incoming edge, split into three segments. **Segment 1**
is a row of solid threat glyphs with counts. **Segment 2** is the same row in filled silhouette with
no counts. **Segment 3** is a single `?` in a dashed box. **Unlocking better monitoring shifts the
boundary right**, which is a visible, permanent, felt upgrade to a UI element — the best kind.

### The Threat Mass Bar
The "is this bad?" glance target.

**How it works:** In the top chrome, a horizontal bar shows aggregate inbound bad traffic split by type
as stacked coloured segments. **It is the one place where a 40 Gbps flood and a single SQL injection
can be compared.**

### The Pressure Gradient (ambient attack baseline)
"DDoS Season" as a reusable system rather than a one-off haze.

**How it works:** A one-channel screen-space gradient from the inbound edge whose **reach** (not
opacity) encodes baseline attack pressure: a 40px lip at the edge at low pressure, reaching a third of
the way across the board at high. It **never obscures** — it tints the substrate only, never the Flow
or Annotation layers. **Ambient difficulty as a measurable distance.**

### Compound-wave authoring
A small DDoS plus a disk failure plus an angry customer call, timed so that attention is the scarce
resource. (See §2.1's delivery mechanics.)

**Variations and additions**

- **Opencode's treatment — Wave mix-ups (the pacing toolkit)** — Quiet waves, spike waves,
  split-lane waves (threat and customer flood together), fake-out waves (all traffic, zero attacks —
  trains the player's attention, then the real boss rides the next), and telegraph waves where a
  scanner arrives early and you get a build window. Design rule: never two identical wave shapes in
  a row. (wave4_gamedesigner_fresh)
- Threats that split on damage: certain tougher units, if only *partially* mitigated, break into
  lesser follow-up threats rather than being fully stopped — punishing half-measures and rewarding
  layered coverage. (wave0)

### Threat Intelligence Feed (purchasable early warning)
A buyable system: upcoming attack waves appear in a news ticker with 60-90s lead time — buy intel,
build the counter; it interlocks with economy and research (and the threat-intel panel that previews
the booter's escalating purchases). (wave4_general_fresh)

### Kill-Chain Assembly (wave design language)
Standard waves arrive as visible *teams* — Scanner tags your DB → Brute finds its door → Webshell
walks in → Ransomware follows the shell.

**How it works:** A chain-UI draws the linkage in real time and **breaking any link dissolves the
whole combo unit**. Turns "focus fire" into "focus the right thing": priority becomes a readable
skill instead of DPS math. All types; the codex teaches chains. (wave2_gamedesigner_informed)

---

## 2.25 Boss design and campaign-scale threats

### Boss design specification (three phases, each invalidating one defense)
Every chapter boss follows the same three-phase shape, so the player learns the grammar.

**How it works:**
- **Phase 1 — the announcement.** A survivable version of the attack that reveals its class. The
  player's *existing* defense works. Lasts ~60s.
- **Phase 2 — the counter.** The boss invalidates the defense that just worked — rotates IPs, moves to
  a different layer, attacks through a trusted path. The player must switch to a **different defense
  role** (§2.1). **This is the phase that checks Coverage Grid breadth.**
- **Phase 3 — the cost.** The boss **cannot be stopped, only priced.** The player chooses what to
  sacrifice: a customer, a region, a feature, money, or their weekend. **Every boss ends in a
  decision, never in a kill.**
**Telegraph window:** announced **two levels in advance** in the trade-press ticker, so preparation is
possible and the player who reads the world is rewarded.
**Interacts with:** §1.6 chapter bosses, §2.1 roles and Coverage Grid, §9.3 trade press.

**Variations and additions**

- **Opencode's treatment — Boss design = stacks** — Bosses combine categories: "The Storm" = volume
  swarm + power outage + mimic infiltrators simultaneously — fought by coordinating counters across
  tiers, not a bigger turret. Each boss shows a visible **kill-chain preview** in a threat-intel
  panel a beat before arrival (teaches prep, not reflexes). The 10/10 DDoS literal black hole of
  packets opens over the map mid-level — enough scrub capacity or go dark in triage order.
  (gamedesigner, general)
- The named-boss roster the campaigns assemble: CIPHER (the ransomware hostage boss), RICHARD (the
  offshore seizure finale), the auction-funded DDoS-for-Hire Hitman, the Paper Boss lawsuit, the
  Upstream Outage "external boss" with no counter — only preparedness — and the Regulatory Hammer
  that destroys your bank, not your servers. Each grades a different tier of your build.
  (wave2_gamedesigner_fresh, wave3_gamedesigner_fresh, wave4_gamedesigner_fresh)
- The scripted "oh no" boss beat: a guaranteed first strike (zero-day beacon) teaches players to
  *love depth* — never stack one counter class, always overlap. (wave4_gamedesigner_fresh)
- Human Error is "the final boss everyone recognizes": the most *realistic* boss, spawned by your
  own hands, mitigation-only. (wave2_sysadmin_fresh, wave4_general_fresh)

### The named campaign antagonists
Four threats that are campaign-scale rather than level-scale.

**How it works:** **The Competitor** (§2.11) persists across the campaign with four visible stats and a
stated strategy. **The Nation-State** (§2.11) may span multiple levels and can be lost without losing
a level. **The Roll-Up Acquirer** (§2.10) buys the market around you over several chapters before
making an offer. **The Market** (§2.11) sets the weather for the business layer. None of them can be
killed; all four can be priced, prepared for, or out-manoeuvred.

### Ransomware on your own management plane (the campaign boss)
The existential one.

**How it works:** Backups you never tested = game over. **This is where the boring "test your restores"
buildable pays off**, and it is the single clearest justification the design has for spending money on
something with no visible benefit for twenty levels. See §2.5 for the dwell-time and double-extortion
mechanics that make it a *detection* fight rather than a *recovery* fight.

**Variations and additions**

- **Opencode's treatment — The Control-Plane Coup (Kubernetes boss)** — The cluster's *brain* is
  seized: now every tower you own obeys the attacker — the self-healing nursery starts healing the
  malware in. A boss that captures your orchestrator and flips your fleet's target selection for the
  rest of the level (your WAF begins serving poison, your autoscaler mines). You cannot out-tower it
  — you must *rebuild the control plane* from etcd backups while degraded (a defense-in-reverse
  level: hold old-style manual paths while you reseed). Counter: control-plane isolation (management
  VLAN + bastion) and *sealed* policy snapshots. The k8s ant-farm act. (wave2_general_informed)

### The Zero-Day Drop as a shared global event
Every player hit on the same night; the differentiator is response speed. (See §2.5 and §2.26's
Zero-Day Sky.)

### The Refund Cascade death spiral
An explicit, visible, escapable doom loop.

**How it works:** Outage → SLA credits → cash crunch → the crunch prevents the fix → the absence of the
fix causes another outage. **The game should let the player see it coming and fight out of it**, which
makes it the business layer's boss shape: not a fight, a trajectory.

---

## 2.26 Threat presentation language (the visual grammar of §2)

*Cross-cutting rendering laws for the whole threat category. Per-threat visuals stay with their
entries; these are the rules that make a bestiary of two hundred entries readable as a system.*

### The Silhouette Rule
Every threat must be identifiable **as a black silhouette at 24×24px.**

**How it works:** Test every threat asset by rendering it solid black at 24px on white; if you can't
name it, redesign it. **The single hard constraint that keeps the endgame readable.** Make it
testable: a threat design is not approved until it passes a **Silhouette Sheet** at 24px **against
every other threat in its band** — the comparison is the test, not the individual asset.

### The threat visual contract, five channels
Four channels are usually cited; there is a fifth and it is the most important.

**How it works:** Silhouette · colour · motion · lane texture · **scale**. See the Threat Scale Law
below.

**Variations and additions**

- **Opencode's treatment — Threat tell language (readability law)** — Every threat telegraphs on a
  consistent channel — *the cables*: packet-stream color/texture previews the incoming attack family
  (red spikes = flood, oily sheen = malware, tiny keys = brute force). Watch the pipes, not the
  pixels. (gamedesigner)
  - Threat heraldry (the sigil system): each protocol family owns one glyph — SYN = half-clenched
    fist, DNS = split compass, HTTP = cracked mask, SSH = crossed keys, BGP = knotted arrow, TLS =
    severed padlock — and the same sigil rides the enemy banner, the cable texture, the alert icon,
    the codex card, and the edge-arrow. One symbol system unifies threat recognition game-wide, and
    lets fog-of-war show "⚔ at origin" before a sprite is ever visible. (wave2_visual_informed)
  - Spawn choreography per family: entry animations at the dark edge pre-announce the family —
    floods crest the horizon as a solid line; stealth types don't fade in, they *de-register* (a
    patch of edge that refuses to show detail); brute force rolls in dragging a sparking key-cart.
    Bosses take the screen with archetype-styled entry cards: script-kiddie = BBS text mode,
    extortion = Comic Sans ransom note, regulator = letterhead PDF, APT = a single blinking cursor.
    (wave2_visual_informed)
  - The Retool Forge: "threats visually learn" gets its missing animation — between waves the dark
    edge shows forge-glow silhouettes re-gearing, and the next wave marches out wearing parody gear.
    Players read "they adapted" without a codex line. (wave2_visual_informed)
  - Boss phase rings: multi-phase bosses wear a segmented arc overhead with phase-name chips (RECON
    / STAGED / EXFIL), each segment filled with the heraldry glyph of what that phase does. Health
    bars elsewhere are forbidden — this is the only health bar the game shows, and it's always a
    story beat, never a grunt. (wave2_visual_informed)
  - Outbound = wrong-direction grammar: exfil and inbound share cables, so one absolute rule — *data
    moving toward the dark edge outrages the eye*: outbound motes are drawn against the cable's
    grain with a faint reversed-flow shimmer, and every pipe has a subtle one-way arrow weave baked
    into its texture. Turning your own highway into an escape route reads instantly.
    (wave2_visual_informed)
- The canonical per-family channel list (anti-frustration law): CVE news ticker for zero-days, a
  weather strip for DDoS swells, fan-noise pitch for thermal, audit letters in the mail tray —
  players should be able to say "I saw it coming and was too cheap to fix it."
  (wave3_gamedesigner_fresh)
- Telegraph hierarchy: sound cue → motion cue → shape cue, so muted colorblind play still works.
  (wave3_visual_fresh)
- Convention minimum: every threat reads from *two* cues — color lane (red = hostile origin) + shape
  language (angular/spiky silhouettes) — plus an audible pre-cue per family; customers are
  round/soft, infrastructure is square. (wave4_visual_fresh)
- Visual language per family for instant readability across hosting skins: bots = glowing swarm
  dots; scanners = slow panning spotlights; exploits = jagged red packets; APTs = near-transparent
  suited figures; ransom = padlock-spreading frost; hardware failure = smoke & sparks from your own
  boxes; insiders = your staff silhouette with a red data sack. (wave4_gamedesigner_fresh)

### The Threat Scale Law
A threat's rendered size is proportional to **what it will cost you**, not to its packet volume.

**How it works:** A tiny toll-fraud cord that will cost $60,000 renders *large*. A 50Gbps flood that
your scrubber absorbs for free renders as a wall that is visibly **thin**. **Size means money.** This
makes the board honest and stops the player from mis-triaging by spectacle — which is exactly the
skill triage is supposed to teach.
**Interacts with:** the telegraph cost threshold (§2.13), the Taxi Meter below, §2.1's "quoted in
dollars and churn."

### The Wind-Up Frame
Every threat that does damage has a **3-frame telegraph**.

**How it works:** **Gather** (it shrinks and darkens) → **strike** (it stretches toward the target) →
**recover.** Damage never happens without a visible wind-up, which is what makes reactive play fair.

### Motion as behaviour — the seven motion primitives
Make the "motion is the behaviour" rule authorable with a spec table.

**How it works:** **Volumetric = advance** (constant velocity, wide front, no deviation). **Slow-drip
= hold** (near-zero velocity, periodic twitch). **Scanner = sweep** (constant angular rate, regular
intervals). **Swarm = boil** (local random walk within a drifting centroid). **Mimic = match** (copies
the visitor motion curve exactly, with a cadence offset of zero — see the Cadence Tell). **Insider =
walk** (the only ground-based gait in the game). **Ransomware = crystallize** (branching growth, no
translation). **Siege = no motion at all** (it acts from off-board — see the Off-Board Register).
**Seven motion primitives cover the entire bestiary.**

### Approach Lanes
Threats travel along **hot lanes** — magenta channels drawn on the Signal layer from the map edge to
your surface.

**How it works:** Lane **thickness** = volume; lane **saturation** = severity; lane **texture**
(dotted / solid / braided) = type. At Tier 4–5 you often see only lanes, never individual threats,
**and that is still enough to play.**

### The Off-Board Register
*The largest single hole in §2's presentation.* Threats that never enter the board need somewhere to
live.

**How it works:** BGP hijack, registrar hijack, DNS poisoning, blocklist listing, upstream
null-route, payment-processor termination, silent deprioritization and regulatory action all damage
you **without traversing the lane**, and the existing answer is only "the board looks healthy."
Render them on a **bezel register — the frame of the screen itself.** The world stays clean and green;
the *frame* develops the problem. A BGP hijack draws a magenta bar along the top edge that steadily
eats leftward, with a tiny world-map inset showing your prefix changing hands. A blocklist listing
stains the bottom edge. A registrar hijack puts a lock glyph on the frame and the board's entrance
sign goes blank. A processor termination turns the money column's chrome grey. **The register is
outside the Three-Layer Rule on purpose: it is the game telling you the call is coming from outside
the house.**

### The Attribution Direction Law
Direction of failure is free information and no game uses it.

**How it works:** **Every failed link animates its grey from the end that caused it.** Your NIC died →
grey starts at your port. Their router died → grey starts at theirs. A cut in the middle → grey blooms
from the cut point with a spark. A cross-connect billing dispute → grey starts at the meet-me room
panel. (Promoted from §2.12's bulletproof entry, where it appears as a one-off.)

### The Threat Despawn Vocabulary
There are at least seven distinct reasons a threat leaves, and **the difference is the diagnosis.**

**How it works:** **Blocked** — recoils off a surface, a spark, a counter tick, the unit intact and
bouncing away (it will try again). **Dropped** — the unit simply stops rendering mid-stride with no
effect, one frame, no particle; **this is what a null-route looks like, and its silence is the tell.**
**Filtered** — dissolves into grey ash and settles (scrubbing). **Tarpitted** — sinks and stays,
visible, wasting its own time. **Expired** — fades out on its own timer having found nothing (the
scanner that found no open port). **Diverted** — turns and walks to the honeypot with a slightly
too-eager gait. **Neutralized** — captured: a dome drops over it and it becomes a Codex specimen.
**Seven exits, seven reads, zero new art beyond particles.**

### The Miss (the fourth attack-landing outcome)
Blocked / damaged / breach are the usual three. There is a fourth.

**How it works:** A threat reaches its target and **finds nothing** — the scanner that finds no open
port, the SQLi with no DB behind it. It plays a small deflating *nothing*: the unit pauses, has no
effect, and leaves. **The absence of feedback is the feedback**, and it is the only way the player
learns that reducing surface works.

### Damage States, three stages plus one
Everything you own has a **clean / scuffed / broken** art state, plus a fourth **"smoking"** state for
catastrophic.

**How it works:** You should be able to walk a row and **read its history.**

### The Entropy Eruption Grammar
§2.8 says entropy threats "erupt from inside your own buildings" and never says what that looks like
as a family.

**How it works:** Entropy **never has a creature and never has magenta.** It uses a shared **spall**
language: a hairline crack appears on the object's own faceplate, propagates over 2–8 seconds
depending on severity, and the failure emerges *through* it. Disk failure spalls at a drive bay; PSU
pop spalls at the power inlet; a fan failure spalls nothing and instead **loses** an element (the blur
stops). The shared read: **the damage is coming from the object, not at it** — which is precisely the
mechanical distinction §2.8 is making.

### The Paper Family (business and legal threats)
§2.10 has thirty-five entries and almost no visual language. Give the whole family one material.

**How it works:** Business threats are **paper and print.** A chargeback is a small receipt fluttering
*out* of the vault. A DMCA is a manila envelope with a red string closure. A regulatory notice is a
heavy cream sheet with a seal. A lawsuit is a briefcase that opens on your desk. A vendor price hike
is a letter that lands with a thud and a shockwave (`FX_TariffWave`). An SLA credit claim is a
carbon-copy form. A licensing audit is a spreadsheet printout that keeps printing. **Paper
accumulates**: unhandled paper stacks on the desk, then the floor, then blocks the door — **which is
the doom clock §2.10 keeps describing in text.**

### The Broadcast Family (reputation threats)
Reputation threats are neither creatures nor paper.

**How it works:** They are **signage and screens**: a billboard truck (the flagship), a star rating
that loses a point with a physical click, a headline crawl on the office TV, a forum thread rendered
as a growing wall poster outside your gate that arriving visitors stop and read, a flock of birds that
darkens the sky and reduces inflow until it disperses (answerable only with a status-page beacon that
calms it). **The shared read: reputation threats are things other people can see, and they are
positioned outside your perimeter facing inward.**

### The Human Family (credential, insider, physical)
**How it works:** Human threats are the only threats drawn with **your own staff art set, re-lit.**
They cast a visible shadow when nothing else does; **their badge is the tell** (an inverted badge, a
visitor badge in a staff-only zone, an expired date readable at Z1, two people on one swipe); and
**they move at walking pace, always**, which distinguishes them from everything else on the board.

### The Camera Cone Gap
"An uncovered camera cone gap is where the Insider walks" is stated elsewhere and never rendered.

**How it works:** In the security overlay, camera coverage is drawn as pale cones on the floor; gaps
are **literal dark polygons.** The Insider, Tailgater and Evil Maid **path through the dark
polygons**, so their route is predictable, discoverable and fixable by buying one more camera. **A
stealth threat with a readable path is a puzzle; without one it's a dice roll.**

### The Designator
For every threat aimed at one specific tenant — Grudge Booter, Ransom DDoS, targeted L7, the
Targeted-at-one-customer affix.

**How it works:** A thin magenta reticle locks onto the target object with a small triangulation
animation **before** the attack arrives, plus a tenant-coloured tag showing whose it is. **The
designator is what makes the null-route-your-own-customer decision work** — you can see it is customer
14 being hit, and you can see the decision coming.

### The Poisoned Tint
For cache poisoning, DNS poisoning, replica drift, bad deploys, silent corruption.

**How it works:** Content that is *wrong but serving* carries a faint **off-register tint** — one
channel shifted a few degrees, like bad print registration — **that propagates downstream with the
data.** Subtle at Z3, obvious at Z1. **The visual grammar of "this is working and it is wrong"**,
which is the worst partial-failure state in the game and currently has no render.

### The Silent Threat Strip (the Hum Bar notch)
A mimic is terrifying because it is **silent** — but silence is invisible.

**How it works:** The **Hum Bar** shows room tone as a live strip. A silent threat creates a visible
**notch** in the strip — an absence of the expected noise floor. **Rendering silence as a hole is the
only way deaf players get the mimic's best tell**, and it is a genuinely striking image for everyone.
The same instrument catches the APT's *flattening* (variance dropping below the noise floor).

### The Correlated Failure White Line
The game's signature learning moment, specified. (See §2.9 for the full description — it belongs to
both places and should be built first.)

### The Zero-Day Sky
Global events need a global image.

**How it works:** On a disclosure event the **skylight / window / outdoor light changes colour** for
the whole facility — a sodium-orange wash that reaches every level of the game simultaneously and
appears in every player's session. The trade-press ticker scrolls. Your fleet's patch-lag pips light
up. **Nothing on the board has changed and the room feels different**, which is precisely what that
night feels like.

### The Turned-Away Map
For blocklisting, deliverability collapse, and geo-blocking.

**How it works:** At Z4, the destinations refusing you **rotate their arrival arcs away** — the arc's
terminus lifts off your node and curls back on itself. **A map full of curled arcs is instantly
legible as "the world is declining to talk to you,"** and it's the same asset used for silent
deprioritization, where only *some* arcs curl, and slowly.

### The Taxi Meter
For any threat that costs money per second. (See §2.21 for the family; this is the law.)

**How it works:** A shared widget — a small mechanical fare meter with clicking digits — attached to
the **object** incurring the cost, not the HUD. Several can be on screen at once and they are horrible
to look at, which is the point. **One widget, six threats, one unforgettable sound.**

### The Bestiary Card
Every threat you encounter gets a collectible card.

**How it works:** Hand-drawn "field guide" art, its silhouette, its lane texture, its counters, and a
**scribbled note from your staff.** Both the tutorialization and a cosmetic collection. Cards carry
the Mastered stamp from §2.1's mastery-demotion rule, so the collection doubles as a record of what
you have permanently solved.

**Variations and additions**

- **Opencode's treatment — Threat Codex / Hacker Codex** — First appearance of each threat writes a
  codex entry; killing one via an *unusual* counter unlocks a codex tip (flavor + achievement).
  Collectathon for build theory-crafting; entries become the shared community language.
  (gamedesigner)
- Make completion *functional*: each fully-explored threat unlocks a permanent small counter bonus
  vs that family — a knowledge-economy loop that also rewards honeypots and non-lethal capture. The
  codex becomes a build, not a trophy shelf. (wave2_gamedesigner_informed)

### The Threat Grammar Law (visual)
Every hostile = angular/spiked silhouette + toxic-cool palette (acid green / alarm magenta / void
black) + jittery skitter motion; every attack telegraphs a signature sound + a directional
edge-arrow before entering frame.

**How it works:** Every enemy is a packet-shaped metaphor for the protocol it abuses. Underwrites
the whole dual-flow readability system. (visual, sysadmin)

**Variations and additions**

- The Corruption Signature elaboration: threats share slight chromatic-aberration jitter, an LED
  pulse against the room's normal green/amber, and they approach from "back of house" (cable trays,
  vents, shadows) — customers NEVER use the hostile color, EVER, in any era. (wave3_visual_fresh)
- The color-script is diegetic: a *rule violation is itself the alarm* — the one threat whose origin
  you can't see breaks the palette law instead of the lane law (see nation-state "Octopus").
  (wave2_visual_fresh)
- Escalating Threat Families: threats evolve in visible tiers (script kiddie → organized crew →
  nation-state) by *reusing a recognizable silhouette with added layers*, unified with the Buildable
  Silhouette Language (§5) into one shared art-direction system — the same grammar for what attacks
  you and what you build. (wave0)

### Threat Vignette Rule (feedback law)
Consequences localize: a hit building glitches its own sprite with a red vignette pulse and a short
data-spill; the screen only ever flashes fully red on total failure. Feedback is *pointed*, never
spammy. (wave1_visual_fresh)

### Hostile palette law — magenta vs acid-green/magenta vs violet vs red — *CONFLICTING*

Every document agrees there must be exactly one reserved hostile hue that customers may never wear.
They disagree on *which* hue, and the choice is load-bearing: it fixes what the unidentified/
unclassified state looks like, what entropy looks like (entropy must not read as an attacker), and
whether the ransomware frost shader is a unique reservation or part of a general hostile palette.
Picking one retires the others — the rule only works if it is absolute.

#### Position A — magenta is hostile, violet is *unclassified* *(master)*

Master runs a two-hue system that is used consistently across the whole category: **magenta is the
hostile/threat channel** (magenta arrowheads for packet swarms, the magenta serpent for SQLi, the
magenta crystalline growth for ransomware, magenta hot lanes on the Signal layer, a magenta reticle
for the Designator, "magenta (correctly blocked)" on the Mound of the Stopped) while **violet is the
unidentified hue** — Internet Background Radiation renders violet "because the background radiation of
the internet is stuff you haven't classified yet", the Zero-Day Wraith passes through defenses with a
*soft violet shimmer* precisely because you do not know what it is yet, and the violet-until-classified
rule preserves the diagnosis loop. **Cyan is the friendly/customer channel** (the thundering-herd wall
is "a huge cyan wall, not a magenta one — *sometimes your own customers are the flood*"), and
§2.26's Entropy Eruption Grammar states the hard exception: **entropy never has a creature and never
has magenta**, using the shared spall vocabulary instead.

#### Position B — toxic-cool palette *(opencode, Variant A)*

Every hostile = acid green / alarm magenta / void black + angular silhouette + jittery skitter motion.
(wave1_visual_fresh)

#### Position C — violet is the hostile channel *(opencode, Variant B)*

Threats pulse violet/red LEDs against the room's normal green/amber, grow violet frost, invert
customer-warm auras to violet; the invariant law is stated as "customers never use violet" — and the
ransomware frost shader is reserved *exclusively* for ransom. (wave3_visual_fresh)

#### Position D — red is the hostile lane *(opencode, Variant C)*

The color lane itself encodes origin (red = hostile), with shape language (angular/spiky) as the
second mandatory cue and customers round/soft. (wave4_visual_fresh)

---

## 2.27 Threat-to-hosting-type matrices

*Three complementary cuts of the same question — what shows up where, what the non-attack problem is,
and what it actually costs. All three are useful; they answer different questions.*

### Matrix A — signature threat, signature non-attack problem, and what it costs

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

### Matrix B — the wave-deck mix per type (what the generator draws)
The variety engine at a glance: what a level of this type *feels* like.

- **Shared web:** vulnerable plugins, noisy neighbor, mass defacement, blocklisting, L7 floods,
  oversell collapse, compromised CMS, spam, ticket storm.
- **VPS / cloud:** abuse from your own customers (outbound attacks!), cryptojacking, hypervisor
  escape, resource contention, CPU ready time, snapshot storage bloat.
- **Dedicated / bare metal:** hardware failure, slow provisioning, remote-hands dependency, truck
  rolls.
- **Colo:** tenants' own incidents, power overdraw, airflow blocking, badge/tailgating, a tenant's
  DDoS saturating the shared uplink, cross-connect mistakes, a customer's gear catching fire, a tenant
  going bankrupt and abandoning gear.
- **Game hosting:** booters, cheaters, latency sensitivity, evening demand spikes, DDoS aimed at
  individual players, community drama, and a modding community that is simultaneously your best
  marketing and your worst attack surface.
- **Backup / DR:** bit rot, tape library jams, restore failures, ransomware *of the customer* (which
  is when you become a hero or a corpse), retention-policy compliance, restore surge.
- **CDN:** cache busting, cache poisoning, origin overload, purge storms, hot-object imbalance,
  regional PoP loss.
- **GPU / AI:** thermal, power, hardware theft (GPUs are money on a shelf), job squatters, crypto abuse
  under the guise of "training," counterparty default, synchronized ramp.
- **HPC:** thermal, power capping, job checkpointing, interconnect faults, scheduler starvation,
  extremely expensive idle, the slow rank.
- **Email:** blacklisting, spammer signups, phishing hosted by you, backscatter, deliverability
  collapse, silent deprioritization.
- **DNS:** amplification, cache poisoning, water torture, NXDOMAIN floods, a fat-finger zone push,
  registrar hijack.
- **Object storage / backup:** bit rot, rebuild storms, restore-time failure, small-file apocalypse,
  the public bucket, egress-fee disputes, decompression bombs.
- **Video / streaming:** transcode capacity, thundering herd at event start, piracy/restream,
  buffering as the churn mechanic.
- **Mining hosting:** heat, power price, tenant insolvency, fire risk from cheap PSUs.
- **K8s / PaaS:** misconfiguration, secret leakage, control-plane overload, CI stampedes, admission
  webhook deadlock, multi-tenancy escape.
- **DBaaS:** replication lag, split brain, long-running query starvation, backup locks.
- **VoIP:** toll fraud, jitter, SIP scanning, one-way audio, regulatory (911).
- **Bulletproof:** abuse pressure, upstream de-peering, law enforcement, processor drop, RIR
  investigation, hacktivists.
- **Regulated:** auditors, evidence gaps, access-log retention, encryption-at-rest proofs, the
  breach-notification clock, data-residency violation.
- **Financial colo:** fairness violations, microburst congestion, clock-sync failure.
- **Dial-up era:** busy signals, line hogs, war dialers, modem incompatibilities, a Usenet binary
  flood, an IRC netsplit war.
- **Satellite / edge:** weather, pass windows, physical remoteness, vandalism, backhaul cost, the site
  with no remote access.

### Matrix C — which threat families dominate which type
A third cut, useful for wave-budget authoring rather than flavour.

**How it works:** Assign each type a rough split across the four families (§2.1). Shared web and VPS
skew **malicious + human**; colo, GPU and wholesale skew **entropic + systemic**; email, DNS and
bulletproof skew **systemic** (reputation and third-party decisions); backup/DR and archive skew
**entropic**; game hosting skews **malicious + human** with an unusually large **customer-as-threat**
share; regulated skews **human + systemic** with almost no volumetric content at all. **A level whose
family split matches its type is the single cheapest way to make two levels of the same game feel like
two different games.**

---

